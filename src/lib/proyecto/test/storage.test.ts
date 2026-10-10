import { describe, it, expect, beforeEach } from "vitest";
import {
  listarProyectos,
  cargarProyecto,
  guardarProyecto,
  crearProyecto,
  duplicarProyecto,
  eliminarProyecto,
  proyectoActivoId,
  setProyectoActivo,
  exportarProyecto,
  importarProyecto,
  inicializarStorage,
  contarProyectosV1,
  EXPORT_SCHEMA,
  ERROR_VERSION_1,
} from "../storage";
import {
  LS_ACTIVO,
  LS_INDICE,
  LS_INDICE_V1,
  LS_PROYECTO_PREFIX,
  PROYECTO_SCHEMA_VERSION,
  type DatosGenerales,
  type Edificio,
  type Proyecto,
} from "../tipos";
import { edificioDeCaso } from "../../edificio/casos";
import { inputsFingerprint } from "../../pdf/utils";

// =============================================================================
// storage — feature-6 T2.4. Patrón del repo: SIN vi.mock. Toda la API recibe
// `s: Storage` como último parámetro; aquí se inyecta un fake hecho con Map.
// Ids y fechas deterministas por inyección (`genId` contador, `nowIso` fijo).
// La fábrica de la Demo también se inyecta (`crearDemo` sintético) para que
// estos tests no dependan de `./demo` (tarea paralela).
// =============================================================================

/** Fake de Storage sobre Map — implementa el contrato completo del DOM Storage. */
function crearStorageFake(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k: string) => (m.has(k) ? (m.get(k) as string) : null),
    key: (i: number) => [...m.keys()][i] ?? null,
    removeItem: (k: string) => {
      m.delete(k);
    },
    setItem: (k: string, v: string) => {
      m.set(k, String(v));
    },
  };
}

/** genId determinista: id-1, id-2, … */
function crearGenId(): () => string {
  let n = 0;
  return () => `id-${++n}`;
}

const NOW = "2026-08-22T10:00:00.000Z";
const DESPUES = "2026-08-22T11:30:00.000Z";

function dg(sobre?: Partial<DatosGenerales>): DatosGenerales {
  return {
    municipio: "Cáceres",
    provincia: "Cáceres",
    altitud_m: 459,
    intervencion: "obra_nueva",
    tienePiscina: false,
    zonaRadon: "I",
    ...sobre,
  };
}

function ed(): Edificio {
  return edificioDeCaso("plurifamiliar");
}

/** Demo sintética para inicializarStorage (evita depender de ./demo en tests). */
function demoSintetica(nowIso: string): Proyecto {
  return {
    id: "demo-id",
    nombre: "Demo",
    creado: nowIso,
    modificado: nowIso,
    datosGenerales: dg(),
    edificio: ed(),
    justificaciones: {},
  };
}

let s: Storage;
let genId: () => string;

beforeEach(() => {
  s = crearStorageFake();
  genId = crearGenId();
});

// -----------------------------------------------------------------------------
// CRUD
// -----------------------------------------------------------------------------

describe("storage — CRUD de proyectos", () => {
  it("crearProyecto persiste, indexa y devuelve el proyecto con fechas nowIso", () => {
    const p = crearProyecto("Bloque A", dg(), ed(), NOW, genId, s);
    expect(p.id).toBe("id-1");
    expect(p.creado).toBe(NOW);
    expect(p.modificado).toBe(NOW);
    expect(p.justificaciones).toEqual({});
    expect(cargarProyecto("id-1", s)).toEqual(p);
    expect(listarProyectos(s).map((x) => x.nombre)).toEqual(["Bloque A"]);
  });

  it("guardarProyecto actualiza sin duplicar la entrada del índice", () => {
    const p = crearProyecto("Bloque A", dg(), ed(), NOW, genId, s);
    guardarProyecto({ ...p, nombre: "Bloque A bis", modificado: DESPUES }, s);
    expect(listarProyectos(s)).toHaveLength(1);
    expect(cargarProyecto(p.id, s)?.nombre).toBe("Bloque A bis");
    expect(cargarProyecto(p.id, s)?.modificado).toBe(DESPUES);
  });

  it("cargarProyecto de id inexistente → null", () => {
    expect(cargarProyecto("no-existe", s)).toBeNull();
  });

  it("listarProyectos ignora entradas corruptas del índice sin romper el resto", () => {
    const p = crearProyecto("Sano", dg(), ed(), NOW, genId, s);
    // Se indexa un id cuya clave contiene basura no-JSON
    s.setItem(LS_INDICE, JSON.stringify([p.id, "roto"]));
    s.setItem(`${LS_PROYECTO_PREFIX}roto`, "esto no es JSON{{{");
    expect(listarProyectos(s).map((x) => x.id)).toEqual([p.id]);
  });

  it('duplicarProyecto crea "<nombre> (copia)" con id nuevo, fechas nuevas y contenido igual', () => {
    const p = crearProyecto("Bloque A", dg(), ed(), NOW, genId, s);
    guardarProyecto(
      { ...p, justificaciones: { hs5: { inputs: { plantas: 4 }, schemaVersion: "1" } } },
      s,
    );
    const copia = duplicarProyecto(p.id, DESPUES, genId, s);
    expect(copia).not.toBeNull();
    expect(copia!.id).toBe("id-2");
    expect(copia!.nombre).toBe("Bloque A (copia)");
    expect(copia!.creado).toBe(DESPUES);
    expect(copia!.justificaciones).toEqual({ hs5: { inputs: { plantas: 4 }, schemaVersion: "1" } });
    // Copia profunda: mutar la copia no toca el original persistido
    expect(cargarProyecto(p.id, s)?.nombre).toBe("Bloque A");
    expect(listarProyectos(s)).toHaveLength(2);
  });

  it("duplicarProyecto de id inexistente → null", () => {
    expect(duplicarProyecto("no-existe", NOW, genId, s)).toBeNull();
  });

  it("eliminarProyecto borra clave, índice y el activo si era él", () => {
    const a = crearProyecto("A", dg(), ed(), NOW, genId, s);
    const b = crearProyecto("B", dg(), ed(), NOW, genId, s);
    setProyectoActivo(a.id, s);
    eliminarProyecto(a.id, s);
    expect(cargarProyecto(a.id, s)).toBeNull();
    expect(s.getItem(LS_PROYECTO_PREFIX + a.id)).toBeNull();
    expect(listarProyectos(s).map((x) => x.id)).toEqual([b.id]);
    expect(proyectoActivoId(s)).toBeNull();
  });

  it("eliminarProyecto NO toca el activo si era otro", () => {
    const a = crearProyecto("A", dg(), ed(), NOW, genId, s);
    const b = crearProyecto("B", dg(), ed(), NOW, genId, s);
    setProyectoActivo(b.id, s);
    eliminarProyecto(a.id, s);
    expect(proyectoActivoId(s)).toBe(b.id);
  });

  it("proyectoActivoId / setProyectoActivo", () => {
    expect(proyectoActivoId(s)).toBeNull();
    setProyectoActivo("id-x", s);
    expect(proyectoActivoId(s)).toBe("id-x");
    expect(s.getItem(LS_ACTIVO)).toBe("id-x");
  });
});

// -----------------------------------------------------------------------------
// Versionado de schema
// -----------------------------------------------------------------------------

describe("storage — versionado de schema", () => {
  it("un proyecto guardado con versión vieja simulada → cargarProyecto null y listar lo omite", () => {
    const p = crearProyecto("Viejo", dg(), ed(), NOW, genId, s);
    // Simula un guardado de una versión anterior del schema
    s.setItem(LS_PROYECTO_PREFIX + p.id, JSON.stringify({ v: "0", proyecto: p }));
    expect(cargarProyecto(p.id, s)).toBeNull();
    expect(listarProyectos(s)).toEqual([]);
  });

  it("el envoltorio persistido lleva v = PROYECTO_SCHEMA_VERSION", () => {
    const p = crearProyecto("Nuevo", dg(), ed(), NOW, genId, s);
    const raw = s.getItem(LS_PROYECTO_PREFIX + p.id);
    expect(JSON.parse(raw!)).toMatchObject({ v: PROYECTO_SCHEMA_VERSION });
  });
});

// -----------------------------------------------------------------------------
// Export / import
// -----------------------------------------------------------------------------

describe("storage — exportarProyecto / importarProyecto", () => {
  function proyectoConEstado(): Proyecto {
    const p = crearProyecto("Exportable", dg(), ed(), NOW, genId, s);
    const conInputs: Proyecto = {
      ...p,
      justificaciones: { hs5: { inputs: { b: 2, a: 1 }, schemaVersion: "1" } },
    };
    guardarProyecto(conInputs, s);
    return conInputs;
  }

  it("round-trip byte-a-byte: exportar → importar → re-exportar produce el MISMO string", () => {
    const p = proyectoConEstado();
    const json1 = exportarProyecto(p);
    const res = importarProyecto(json1);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.proyecto).toEqual(p);
    const json2 = exportarProyecto(res.proyecto);
    expect(json2).toBe(json1);
  });

  it("el fingerprint es estable frente al orden de inserción de claves", () => {
    const p = proyectoConEstado();
    // Mismo proyecto con las claves de inputs en otro orden de inserción
    const reordenado: Proyecto = JSON.parse(JSON.stringify(p)) as Proyecto;
    reordenado.justificaciones = { hs5: { schemaVersion: "1", inputs: { a: 1, b: 2 } } };
    expect(exportarProyecto(reordenado)).toBe(exportarProyecto(p));
  });

  it("el export declara schema y versión", () => {
    const parsed = JSON.parse(exportarProyecto(proyectoConEstado())) as Record<string, unknown>;
    expect(parsed.schema).toBe(EXPORT_SCHEMA);
    expect(parsed.version).toBe(PROYECTO_SCHEMA_VERSION);
    expect(typeof parsed.fingerprint).toBe("string");
  });

  it("rechaza JSON malformado con mensaje en español", () => {
    const res = importarProyecto("esto no es JSON{{{");
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe("El archivo no es un JSON válido.");
  });

  it("rechaza un schema ajeno con mensaje en español", () => {
    const res = importarProyecto(JSON.stringify({ schema: "otra-cosa", version: "1" }));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("no es un proyecto de Concreta Memorias");
    expect(res.error).toContain("otra-cosa");
  });

  it("rechaza una versión incompatible con mensaje en español", () => {
    const p = proyectoConEstado();
    const manipulado = JSON.parse(exportarProyecto(p)) as Record<string, unknown>;
    manipulado.version = "999";
    const res = importarProyecto(JSON.stringify(manipulado));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("Versión de proyecto incompatible");
    expect(res.error).toContain("v999");
    expect(res.error).toContain(`v${PROYECTO_SCHEMA_VERSION}`);
  });

  it("rechaza un fingerprint que no cuadra con el contenido (archivo editado)", () => {
    const p = proyectoConEstado();
    const manipulado = JSON.parse(exportarProyecto(p)) as { proyecto: Proyecto };
    manipulado.proyecto.nombre = "Editado a mano"; // contenido cambia, fingerprint no
    const res = importarProyecto(JSON.stringify(manipulado));
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("huella");
    expect(res.error).toContain("fingerprint");
  });
});

// -----------------------------------------------------------------------------
// Schema 2 sin migración (feature-12)
// -----------------------------------------------------------------------------

describe("storage — schema 2, sin migración", () => {
  /** Un export de la versión 1, tal como lo escribía la app antes de feature-12. */
  function exportV1(): string {
    const proyecto = {
      id: "v1",
      nombre: "Expediente antiguo",
      creado: NOW,
      modificado: NOW,
      datosGenerales: { ...dg(), uso: "vivienda_colectiva", plantasSobreRasante: 4 },
      justificaciones: {},
    };
    return JSON.stringify({
      schema: EXPORT_SCHEMA,
      version: "1",
      fingerprint: inputsFingerprint(proyecto),
      proyecto,
    });
  }

  it("importar un .json de la versión 1 se rechaza con el mensaje claro", () => {
    const res = importarProyecto(exportV1());
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toBe(ERROR_VERSION_1);
    expect(res.error).toContain("versión anterior");
  });

  it("un v2 sin edificio con forma válida se rechaza", () => {
    const p = crearProyecto("Sin edificio", dg(), ed(), NOW, genId, s);
    const roto = { ...p, edificio: { cubierta: {}, grupos: "no" } };
    const json = JSON.stringify({
      schema: EXPORT_SCHEMA,
      version: PROYECTO_SCHEMA_VERSION,
      fingerprint: inputsFingerprint(roto),
      proyecto: roto,
    });
    const res = importarProyecto(json);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.error).toContain("edificio");
  });

  it("cargarProyecto con un edificio mal formado → null (no rompe la lista)", () => {
    const p = crearProyecto("Roto", dg(), ed(), NOW, genId, s);
    s.setItem(
      LS_PROYECTO_PREFIX + p.id,
      JSON.stringify({ v: PROYECTO_SCHEMA_VERSION, proyecto: { ...p, edificio: null } }),
    );
    expect(cargarProyecto(p.id, s)).toBeNull();
    expect(listarProyectos(s)).toEqual([]);
  });

  it("las claves de la v1 no se leen ni se borran; solo se cuentan para avisar", () => {
    s.setItem(LS_INDICE_V1, JSON.stringify(["a", "b"]));
    s.setItem("concreta-inst-proyecto-a", "{}");
    expect(contarProyectosV1(s)).toBe(2);
    inicializarStorage(NOW, genId, demoSintetica, s);
    expect(listarProyectos(s).map((x) => x.id)).toEqual(["demo-id"]);
    expect(s.getItem(LS_INDICE_V1)).toBe(JSON.stringify(["a", "b"]));
    expect(s.getItem("concreta-inst-proyecto-a")).toBe("{}");
  });

  it("sin claves de la v1 → 0", () => {
    expect(contarProyectosV1(s)).toBe(0);
  });

  it("el origen de una zona leída del cuadro viaja en el export; uno sin forma se quita sin rechazar", () => {
    const e = ed();
    const origen = { documento: "cuadro.pdf", paginas: [2], filas: ["Portal · 20,00 m²"] };
    e.grupos[0]!.zonas[0] = { ...e.grupos[0]!.zonas[0]!, origen };
    const p = crearProyecto("Con cuadro", dg(), e, NOW, genId, s);
    const ida = importarProyecto(exportarProyecto(p));
    expect(ida.ok && ida.proyecto.edificio.grupos[0]!.zonas[0]!.origen).toEqual(origen);

    const roto = structuredClone(p);
    (roto.edificio.grupos[0]!.zonas[0] as unknown as Record<string, unknown>).origen = { documento: 3 };
    s.setItem(LS_PROYECTO_PREFIX + p.id, JSON.stringify({ v: PROYECTO_SCHEMA_VERSION, proyecto: roto }));
    const cargado = cargarProyecto(p.id, s);
    expect(cargado).not.toBeNull();
    expect(cargado!.edificio.grupos[0]!.zonas[0]).not.toHaveProperty("origen");
  });

  it("las claves de módulo sueltas de antes de los expedientes ya no se migran", () => {
    s.setItem("hs5", JSON.stringify({ plantas: 4 }));
    s.setItem("hs5-version", "1");
    inicializarStorage(NOW, genId, demoSintetica, s);
    expect(listarProyectos(s).map((x) => x.nombre)).toEqual(["Demo"]);
    expect(s.getItem("hs5")).toBe(JSON.stringify({ plantas: 4 }));
  });
});

// -----------------------------------------------------------------------------
// Inicialización idempotente
// -----------------------------------------------------------------------------

describe("storage — inicializarStorage", () => {
  it("primer arranque sin nada: crea índice, crea la Demo y la fija como activa", () => {
    const r = inicializarStorage(NOW, genId, demoSintetica, s);
    expect(r.activo).toBe("demo-id");
    expect(proyectoActivoId(s)).toBe("demo-id");
    expect(listarProyectos(s).map((x) => x.nombre)).toEqual(["Demo"]);
  });

  it("IDEMPOTENTE: dos llamadas → mismo resultado y sin duplicar la Demo", () => {
    const r1 = inicializarStorage(NOW, genId, demoSintetica, s);
    const r2 = inicializarStorage(DESPUES, genId, demoSintetica, s);
    expect(r2).toEqual(r1);
    expect(listarProyectos(s)).toHaveLength(1);
  });

  it("si el índice ya existe con proyectos pero no hay activo, fija el primero", () => {
    const p = crearProyecto("Suelto", dg(), ed(), NOW, genId, s);
    const r = inicializarStorage(DESPUES, genId, demoSintetica, s);
    expect(r.activo).toBe(p.id);
    // No se creó Demo: el índice ya existía
    expect(listarProyectos(s)).toHaveLength(1);
  });

  it("si el activo apunta a un proyecto eliminado, se re-fija a uno existente", () => {
    const a = crearProyecto("A", dg(), ed(), NOW, genId, s);
    crearProyecto("B", dg(), ed(), NOW, genId, s);
    setProyectoActivo(a.id, s);
    eliminarProyecto(a.id, s);
    const r = inicializarStorage(DESPUES, genId, demoSintetica, s);
    expect(r.activo).toBe("id-2");
  });
});
