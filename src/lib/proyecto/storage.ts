import type { DatosGenerales, Edificio, Proyecto } from "./tipos";
import { LS_ACTIVO, LS_INDICE, LS_INDICE_V1, LS_PROYECTO_PREFIX, PROYECTO_SCHEMA_VERSION } from "./tipos";
import { canonicalStringify as jsonCanonico, inputsFingerprint } from "../pdf/utils";
import { crearProyectoDemo } from "./demo";

// =============================================================================
// Persistencia multi-proyecto (feature-6 §B; schema 2 en feature-12).
//
// CAPA STORAGE, NO MOTOR: este archivo es el único (junto a hooks de UI) autorizado
// a tocar `Storage`. Sigue sin haber React/DOM ni Date.now — todo instante llega
// como `nowIso: string` inyectado desde la UI.
//
// SOBRE `crypto.randomUUID` COMO DEFAULT DE `genId`: los motores de cálculo son
// funciones puras (mismos inputs → mismo output, exigencia de trazabilidad de las
// fichas), por lo que ahí `Math.random`/`crypto` están prohibidos. Un id de
// PERSISTENCIA, en cambio, es identidad, no cálculo: no participa en ningún
// veredicto ni viaja al fingerprint de la ficha como dato de entrada. Por eso la
// capa storage puede usar `crypto.randomUUID()` como default — siempre a través
// del parámetro inyectable `genId`, de modo que los tests (y cualquier caller que
// necesite determinismo) inyecten un generador determinista. `Math.random` sigue
// prohibido incluso aquí: `randomUUID` da unicidad real sin sesgos artesanales.
//
// SCHEMA 2, SIN MIGRACIÓN (REDISENO-V4 §7.4): las claves son nuevas y las de la
// versión 1 no se leen ni se borran. Un `.json` v1 se rechaza con un mensaje
// claro. La migración de claves sueltas por módulo de feature-6 se retiró: con
// «empezar de cero» sería una migración por la puerta de atrás.
//
// FORMATO EN localStorage:
//   `concreta-inst-v2-proyectos`            → JSON string[] de ids (índice).
//   `concreta-inst-v2-proyecto-<id>`        → JSON { v: PROYECTO_SCHEMA_VERSION, proyecto }.
//   `concreta-inst-v2-proyecto-activo`      → id del último proyecto abierto.
// =============================================================================

/** Identificador del formato de archivo de export (feature-6 §B). */
export const EXPORT_SCHEMA = "concreta-inst-proyecto";

/** Mensaje al importar un expediente de la versión 1. */
export const ERROR_VERSION_1 =
  "Este expediente es de una versión anterior de Concreta Memorias y no se puede abrir en esta. " +
  "La versión 2 describe el edificio de otra forma y empieza de cero: crea el proyecto de nuevo.";

// -----------------------------------------------------------------------------
// Helpers privados
// -----------------------------------------------------------------------------

/**
 * Default de `genId`. Ver nota de cabecera: permitido SOLO en capa storage.
 * Si el entorno no expone `crypto.randomUUID` (contexto no seguro muy antiguo),
 * fallamos alto en vez de degradar a un pseudo-aleatorio casero.
 */
function defaultGenId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  throw new Error("crypto.randomUUID no está disponible: inyecta un genId explícito.");
}

// JSON canónico (claves ordenadas recursivamente): `canonicalStringify` de
// `src/lib/pdf/utils.ts`, importado arriba como `jsonCanonico`. Garantiza export
// byte-a-byte estable: exportar → importar → re-exportar produce el mismo string.

function claveProyecto(id: string): string {
  return LS_PROYECTO_PREFIX + id;
}

/** Lee el índice; `null` = el índice NO existe (primer arranque), `[]` = existe vacío. */
function leerIndice(s: Storage, clave = LS_INDICE): string[] | null {
  const raw = s.getItem(clave);
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    // índice corrupto → tratar como vacío (los proyectos huérfanos siguen en sus claves)
  }
  return [];
}

function escribirIndice(ids: string[], s: Storage): void {
  s.setItem(LS_INDICE, JSON.stringify(ids));
}

function esObjeto(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

/**
 * ¿Tiene el edificio la forma mínima para abrirse? Cubierta, grupos con zonas y
 * unidades. No juzga los valores (eso es `validarEdificio`, que avisa sin
 * bloquear): solo evita que un archivo mal formado rompa las derivaciones.
 */
export function esEdificioConForma(x: unknown): x is Edificio {
  if (!esObjeto(x) || !esObjeto(x.cubierta)) return false;
  if (!Array.isArray(x.unidades) || !Array.isArray(x.grupos)) return false;
  return x.grupos.every(
    (g) =>
      esObjeto(g) &&
      typeof g.id === "string" &&
      typeof g.nivelInicial === "number" &&
      typeof g.repeticiones === "number" &&
      typeof g.altura_m === "number" &&
      Array.isArray(g.zonas) &&
      g.zonas.every(
        (z) => esObjeto(z) && typeof z.id === "string" && typeof z.uso === "string",
      ),
  );
}

function esOrigen(x: unknown): boolean {
  return (
    esObjeto(x) &&
    typeof x.documento === "string" &&
    Array.isArray(x.paginas) &&
    x.paginas.every((p) => typeof p === "number") &&
    Array.isArray(x.filas) &&
    x.filas.every((f) => typeof f === "string")
  );
}

/**
 * Quita el `origen` (feature-13) de las zonas y tipos donde no tiene forma. Es
 * solo trazabilidad: un archivo tocado a mano no se rechaza por ella, pero
 * tampoco puede romper la pantalla ni el anejo que la leen.
 */
export function sanearOrigenes(e: Edificio): Edificio {
  const sinMalo = <T extends { origen?: unknown }>(x: T): T => {
    if (!("origen" in x) || esOrigen(x.origen)) return x;
    const { origen: _o, ...resto } = x;
    return resto as T;
  };
  return {
    ...e,
    grupos: e.grupos.map((g) => ({ ...g, zonas: g.zonas.map(sinMalo) })),
    unidades: e.unidades.map(sinMalo),
  };
}

/** El proyecto con el edificio saneado (ver `sanearOrigenes`). */
function conOrigenesSaneados(p: Record<string, unknown>): Proyecto {
  const proyecto = p as unknown as Proyecto;
  return { ...proyecto, edificio: sanearOrigenes(proyecto.edificio) };
}

// -----------------------------------------------------------------------------
// CRUD
// -----------------------------------------------------------------------------

/** Lista los proyectos del índice, ignorando entradas corruptas o incompatibles. */
export function listarProyectos(s: Storage = localStorage): Proyecto[] {
  const ids = leerIndice(s) ?? [];
  const out: Proyecto[] = [];
  for (const id of ids) {
    const p = cargarProyecto(id, s);
    if (p !== null) out.push(p);
  }
  return out;
}

/** Carga un proyecto por id. Corrupto o con versión de schema incompatible → `null`. */
export function cargarProyecto(id: string, s: Storage = localStorage): Proyecto | null {
  const raw = s.getItem(claveProyecto(id));
  if (raw === null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!esObjeto(parsed)) return null;
    const { v, proyecto } = parsed;
    if (v !== PROYECTO_SCHEMA_VERSION) return null;
    if (!esObjeto(proyecto) || !esEdificioConForma(proyecto.edificio)) return null;
    return conOrigenesSaneados(proyecto);
  } catch {
    return null;
  }
}

/** Persiste el proyecto (envuelto con la versión de schema) y lo asegura en el índice. */
export function guardarProyecto(p: Proyecto, s: Storage = localStorage): void {
  s.setItem(claveProyecto(p.id), JSON.stringify({ v: PROYECTO_SCHEMA_VERSION, proyecto: p }));
  const ids = leerIndice(s) ?? [];
  if (!ids.includes(p.id)) escribirIndice([...ids, p.id], s);
}

export function crearProyecto(
  nombre: string,
  dg: DatosGenerales,
  edificio: Edificio,
  nowIso: string,
  genId: () => string = defaultGenId,
  s: Storage = localStorage,
): Proyecto {
  const p: Proyecto = {
    id: genId(),
    nombre,
    creado: nowIso,
    modificado: nowIso,
    datosGenerales: dg,
    edificio,
    justificaciones: {},
  };
  guardarProyecto(p, s);
  return p;
}

/** Duplica un proyecto como "<nombre> (copia)" con id nuevo y fechas `nowIso`. */
export function duplicarProyecto(
  id: string,
  nowIso: string,
  genId: () => string = defaultGenId,
  s: Storage = localStorage,
): Proyecto | null {
  const original = cargarProyecto(id, s);
  if (original === null) return null;
  const copia: Proyecto = {
    // Copia profunda vía JSON (el Proyecto es JSON-serializable por contrato de persistencia)
    ...(JSON.parse(JSON.stringify(original)) as Proyecto),
    id: genId(),
    nombre: `${original.nombre} (copia)`,
    creado: nowIso,
    modificado: nowIso,
  };
  guardarProyecto(copia, s);
  return copia;
}

/** Borra la clave del proyecto, su entrada en el índice y el activo si era él. */
export function eliminarProyecto(id: string, s: Storage = localStorage): void {
  s.removeItem(claveProyecto(id));
  const ids = leerIndice(s);
  if (ids !== null) escribirIndice(ids.filter((x) => x !== id), s);
  if (s.getItem(LS_ACTIVO) === id) s.removeItem(LS_ACTIVO);
}

export function proyectoActivoId(s: Storage = localStorage): string | null {
  return s.getItem(LS_ACTIVO);
}

export function setProyectoActivo(id: string, s: Storage = localStorage): void {
  s.setItem(LS_ACTIVO, id);
}

/**
 * Cuántos expedientes de la versión 1 quedan en este navegador. Solo se cuentan
 * para avisar en Inicio: no se leen ni se borran.
 */
export function contarProyectosV1(s: Storage = localStorage): number {
  return leerIndice(s, LS_INDICE_V1)?.length ?? 0;
}

// -----------------------------------------------------------------------------
// Export / import como archivo .json (schema + versión + fingerprint)
// -----------------------------------------------------------------------------

/**
 * Serializa el proyecto a JSON ESTABLE (claves ordenadas): el mismo proyecto
 * produce siempre el mismo string, y exportar → importar → re-exportar es
 * byte-a-byte idéntico (fingerprint incluido).
 */
export function exportarProyecto(p: Proyecto): string {
  return jsonCanonico({
    schema: EXPORT_SCHEMA,
    version: PROYECTO_SCHEMA_VERSION,
    fingerprint: inputsFingerprint(p),
    proyecto: p,
  });
}

/**
 * Valida e importa un archivo de proyecto. Todos los rechazos llevan mensaje en
 * español: JSON malformado, schema ajeno, versión 1 (sin migración), versión
 * desconocida, fingerprint que no cuadra con el contenido (archivo editado a
 * mano o truncado) o edificio sin la forma mínima.
 */
export function importarProyecto(
  json: string,
): { ok: true; proyecto: Proyecto } | { ok: false; error: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "El archivo no es un JSON válido." };
  }
  if (!esObjeto(parsed)) {
    return { ok: false, error: "El archivo no tiene la estructura de un proyecto exportado." };
  }
  const { schema, version, fingerprint, proyecto } = parsed;
  if (schema !== EXPORT_SCHEMA) {
    return {
      ok: false,
      error: `El archivo no es un proyecto de Concreta Memorias (schema "${String(schema)}").`,
    };
  }
  if (version === "1") {
    return { ok: false, error: ERROR_VERSION_1 };
  }
  if (version !== PROYECTO_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Versión de proyecto incompatible: el archivo es v${String(version)} y esta aplicación admite v${PROYECTO_SCHEMA_VERSION}.`,
    };
  }
  if (!esObjeto(proyecto)) {
    return { ok: false, error: "El archivo no contiene un proyecto válido." };
  }
  if (fingerprint !== inputsFingerprint(proyecto)) {
    return {
      ok: false,
      error: "La huella (fingerprint) no coincide con el contenido: el archivo está corrupto o fue modificado.",
    };
  }
  if (!esEdificioConForma(proyecto.edificio)) {
    return { ok: false, error: "El archivo no contiene un edificio válido." };
  }
  return { ok: true, proyecto: conOrigenesSaneados(proyecto) };
}

// -----------------------------------------------------------------------------
// Arranque idempotente
// -----------------------------------------------------------------------------

/**
 * Inicializa el storage multi-proyecto. IDEMPOTENTE: solo actúa si el índice no
 * existe todavía (primer arranque de la versión 2) — lo crea y siembra el
 * proyecto "Demo" con `crearDemo`. Siempre deja un proyecto activo fijado si hay
 * al menos uno.
 *
 * `crearDemo` es inyectable por la misma razón que `genId`: que los tests de
 * storage no dependan del contenido real de `./demo` (le pasan una demo
 * sintética). El default es el `crearProyectoDemo` real. `genId` ya no se usa
 * (la Demo tiene id fijo) y se conserva por compatibilidad de firma.
 */
export function inicializarStorage(
  nowIso: string,
  _genId: () => string = defaultGenId,
  crearDemo: (nowIso: string) => Proyecto = crearProyectoDemo,
  s: Storage = localStorage,
): { activo: string } {
  let ids = leerIndice(s);
  if (ids === null) {
    escribirIndice([], s);
    guardarProyecto(crearDemo(nowIso), s);
    ids = leerIndice(s) ?? [];
  }
  const activoActual = proyectoActivoId(s);
  if ((activoActual === null || !ids.includes(activoActual)) && ids.length > 0) {
    setProyectoActivo(ids[0], s);
  }
  return { activo: proyectoActivoId(s) ?? "" };
}
