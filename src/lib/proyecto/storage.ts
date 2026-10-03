import type { DatosGenerales, JustificacionEnProyecto, JustificacionKey, Proyecto } from "./tipos";
import { CLAVES_LEGACY, LS_ACTIVO, LS_INDICE, LS_PROYECTO_PREFIX, PROYECTO_SCHEMA_VERSION } from "./tipos";
import { getModuleSchemaVersion } from "../../data/justificacionRegistry";
import { canonicalStringify as jsonCanonico, inputsFingerprint } from "../pdf/utils";
import { crearProyectoDemo } from "./demo";

// =============================================================================
// Persistencia multi-proyecto (feature-6 §B).
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
// FORMATO EN localStorage:
//   `concreta-inst-proyectos`               → JSON string[] de ids (índice).
//   `concreta-inst-proyecto-<id>`           → JSON { v: PROYECTO_SCHEMA_VERSION, proyecto }.
//   `concreta-inst-proyecto-activo`         → id del último proyecto abierto.
// =============================================================================

/** Identificador del formato de archivo de export (feature-6 §B). */
export const EXPORT_SCHEMA = "concreta-inst-proyecto";

/** Nombre del proyecto creado por la migración legacy. */
export const NOMBRE_PROYECTO_IMPORTADO = "Importado";

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
function leerIndice(s: Storage): string[] | null {
  const raw = s.getItem(LS_INDICE);
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
    if (parsed === null || typeof parsed !== "object") return null;
    const { v, proyecto } = parsed as { v?: unknown; proyecto?: unknown };
    if (v !== PROYECTO_SCHEMA_VERSION) return null;
    if (proyecto === null || typeof proyecto !== "object") return null;
    return proyecto as Proyecto;
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
 * español: JSON malformado, schema ajeno, versión incompatible o fingerprint
 * que no cuadra con el contenido (archivo editado a mano o truncado).
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
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { ok: false, error: "El archivo no tiene la estructura de un proyecto exportado." };
  }
  const { schema, version, fingerprint, proyecto } = parsed as {
    schema?: unknown;
    version?: unknown;
    fingerprint?: unknown;
    proyecto?: unknown;
  };
  if (schema !== EXPORT_SCHEMA) {
    return {
      ok: false,
      error: `El archivo no es un proyecto de Concreta Instalaciones (schema "${String(schema)}").`,
    };
  }
  if (version !== PROYECTO_SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Versión de proyecto incompatible: el archivo es v${String(version)} y esta aplicación admite v${PROYECTO_SCHEMA_VERSION}.`,
    };
  }
  if (proyecto === null || typeof proyecto !== "object" || Array.isArray(proyecto)) {
    return { ok: false, error: "El archivo no contiene un proyecto válido." };
  }
  if (fingerprint !== inputsFingerprint(proyecto)) {
    return {
      ok: false,
      error: "La huella (fingerprint) no coincide con el contenido: el archivo está corrupto o fue modificado.",
    };
  }
  return { ok: true, proyecto: proyecto as Proyecto };
}

// -----------------------------------------------------------------------------
// Migración legacy (feature-6 §B): claves sueltas por módulo → proyecto "Importado"
// -----------------------------------------------------------------------------

/**
 * Datos generales por defecto para el proyecto "Importado": placeholders
 * razonables que el usuario debe revisar (los inputs importados de los módulos
 * MANDAN; esto solo rellena el expediente). `zonaRadon: "I"` es un placeholder
 * pendiente de la entrada manual por Apéndice B del DB-HS6.
 */
function datosGeneralesImportado(): DatosGenerales {
  return {
    municipio: "",
    provincia: "",
    altitud_m: 0,
    uso: "vivienda_colectiva",
    intervencion: "obra_nueva",
    plantasSobreRasante: 1,
    plantasBajoRasante: 0,
    tipoCubierta: "plana_no_transitable",
    numViviendas: 1,
    tieneGaraje: false,
    tieneTrasteros: false,
    tienePiscina: false,
    tieneLocalPB: false,
    zonaRadon: "I",
  };
}

/**
 * Lee las claves legacy cortas (`hs3`…) respetando su `<k>-version` (patrón
 * del hook legacy por módulo, eliminado en T6.2): una clave solo migra si su versión coincide con la vigente
 * en `justificacionRegistry.getModuleSchemaVersion`. Si hay ≥1 clave con estado,
 * crea (y persiste) el proyecto "Importado" con esos inputs en
 * `justificaciones[k].inputs`; si no, devuelve `null`. Las claves legacy se
 * CONSERVAN (rollback barato) — este módulo no las borra jamás.
 */
export function migrarLegacy(
  nowIso: string,
  genId: () => string = defaultGenId,
  s: Storage = localStorage,
): Proyecto | null {
  const justificaciones: Partial<Record<JustificacionKey, JustificacionEnProyecto>> = {};
  let alguna = false;
  for (const k of CLAVES_LEGACY) {
    const raw = s.getItem(k);
    if (raw === null) continue;
    const versionVigente = getModuleSchemaVersion(k);
    if (s.getItem(`${k}-version`) !== versionVigente) continue; // versión vieja → se ignora
    try {
      const inputs: unknown = JSON.parse(raw);
      if (inputs === null || typeof inputs !== "object" || Array.isArray(inputs)) continue;
      justificaciones[k] = { inputs: inputs as Record<string, unknown>, schemaVersion: versionVigente };
      alguna = true;
    } catch {
      // clave corrupta → se ignora (y se conserva tal cual)
    }
  }
  if (!alguna) return null;
  const p: Proyecto = {
    id: genId(),
    nombre: NOMBRE_PROYECTO_IMPORTADO,
    creado: nowIso,
    modificado: nowIso,
    datosGenerales: datosGeneralesImportado(),
    justificaciones,
  };
  guardarProyecto(p, s);
  return p;
}

// -----------------------------------------------------------------------------
// Arranque idempotente
// -----------------------------------------------------------------------------

/**
 * Inicializa el storage multi-proyecto. IDEMPOTENTE: solo actúa si el índice no
 * existe todavía (primer arranque) — lo crea, corre `migrarLegacy` y, si el
 * índice queda vacío, crea el proyecto "Demo" con `crearDemo`. Siempre deja un
 * proyecto activo fijado si hay al menos uno.
 *
 * `crearDemo` es inyectable por la misma razón que `genId`: que los tests de
 * storage no dependan del contenido real de `./demo` (le pasan una demo
 * sintética). El default es el `crearProyectoDemo` real.
 */
export function inicializarStorage(
  nowIso: string,
  genId: () => string = defaultGenId,
  crearDemo: (nowIso: string) => Proyecto = crearProyectoDemo,
  s: Storage = localStorage,
): { activo: string } {
  let ids = leerIndice(s);
  if (ids === null) {
    // Primer arranque: crear índice, migrar legacy y sembrar la Demo si procede.
    escribirIndice([], s);
    migrarLegacy(nowIso, genId, s);
    ids = leerIndice(s) ?? [];
    if (ids.length === 0) {
      guardarProyecto(crearDemo(nowIso), s);
      ids = leerIndice(s) ?? [];
    }
  }
  const activoActual = proyectoActivoId(s);
  if ((activoActual === null || !ids.includes(activoActual)) && ids.length > 0) {
    setProyectoActivo(ids[0], s);
  }
  return { activo: proyectoActivoId(s) ?? "" };
}
