import { describe, it, expect } from "vitest";
import { progresoDe, estadoDe, resumenProyecto } from "../progreso";
import type {
  DatosGenerales,
  JustificacionEnProyecto,
  JustificacionKey,
  Proyecto,
} from "../tipos";
import { justificacionRegistry } from "../../../data/justificacionRegistry";

// =============================================================================
// progreso.ts — progreso DERIVADO, nunca marcado a mano (feature-6 §A, §3).
// Matriz completa inputs×veredicto, propagación del veredicto crudo en
// estadoDe y recuento del expediente en resumenProyecto.
// =============================================================================

// ── Fixtures ────────────────────────────────────────────────────────────────

/** Datos generales de obra nueva con TODOS los atributos activos: sin reglas
 *  de atributos que desactiven nada, la base deja todo `aplica` salvo las
 *  externas (feature-6 §A). */
const datosObraNueva: DatosGenerales = {
  municipio: "Cáceres",
  provincia: "Cáceres",
  altitud_m: 459,
  uso: "vivienda_colectiva",
  intervencion: "obra_nueva",
  plantasSobreRasante: 4,
  plantasBajoRasante: 1,
  tipoCubierta: "plana_no_transitable",
  numViviendas: 8,
  tieneGaraje: true,
  tieneTrasteros: true,
  tienePiscina: true,
  tieneLocalPB: true,
  zonaRadon: "I",
};

function proyecto(
  justificaciones: Proyecto["justificaciones"] = {},
  datos: DatosGenerales = datosObraNueva,
): Proyecto {
  return {
    id: "p-test",
    nombre: "Proyecto de test",
    creado: "2026-01-01T00:00:00.000Z",
    modificado: "2026-01-01T00:00:00.000Z",
    datosGenerales: datos,
    justificaciones,
  };
}

const conInputs = (extra: Partial<JustificacionEnProyecto> = {}): JustificacionEnProyecto => ({
  inputs: { campo: 1 },
  ...extra,
});

// ── progresoDe: matriz completa inputs × veredicto ──────────────────────────

describe("progresoDe — matriz inputs×veredicto", () => {
  it("undefined (clave ausente en el proyecto) → sin_iniciar", () => {
    expect(progresoDe(undefined)).toBe("sin_iniciar");
  });

  it("entrada sin inputs → sin_iniciar", () => {
    expect(progresoDe({})).toBe("sin_iniciar");
    expect(progresoDe({ schemaVersion: "1" })).toBe("sin_iniciar");
  });

  it("inputs objeto vacío → sin_iniciar (vacío = nada guardado)", () => {
    expect(progresoDe({ inputs: {} })).toBe("sin_iniciar");
  });

  it("inputs guardados sin resultadoCache → en_curso", () => {
    expect(progresoDe(conInputs())).toBe("en_curso");
  });

  it("inputs + veredicto neutral → en_curso (el motor no concluye)", () => {
    expect(progresoDe(conInputs({ resultadoCache: { veredicto: "neutral" } }))).toBe("en_curso");
  });

  it("inputs + veredicto ok → cumple", () => {
    expect(progresoDe(conInputs({ resultadoCache: { veredicto: "ok" } }))).toBe("cumple");
  });

  it("inputs + veredicto warn → cumple (el matiz warn lo aporta el veredicto crudo)", () => {
    expect(progresoDe(conInputs({ resultadoCache: { veredicto: "warn" } }))).toBe("cumple");
  });

  it("inputs + veredicto fail → no_cumple", () => {
    expect(progresoDe(conInputs({ resultadoCache: { veredicto: "fail" } }))).toBe("no_cumple");
  });
});

// ── estadoDe: aplicabilidad × progreso + veredicto crudo ────────────────────

describe("estadoDe — combina aplicabilidad, progreso y veredicto crudo", () => {
  it("propaga el veredicto crudo cuando el progreso es concluyente (ok/warn/fail)", () => {
    const p = proyecto({
      hs5: conInputs({ resultadoCache: { veredicto: "ok" } }),
      hs3: conInputs({ resultadoCache: { veredicto: "warn" } }),
      hs4: conInputs({ resultadoCache: { veredicto: "fail" } }),
    });
    expect(estadoDe(p, "hs5")).toMatchObject({ progreso: "cumple", veredicto: "ok" });
    expect(estadoDe(p, "hs3")).toMatchObject({ progreso: "cumple", veredicto: "warn" });
    expect(estadoDe(p, "hs4")).toMatchObject({ progreso: "no_cumple", veredicto: "fail" });
  });

  it("sin veredicto concluyente no expone veredicto (sin_iniciar, en_curso, neutral)", () => {
    const p = proyecto({
      hs6: conInputs(),
      he1: conInputs({ resultadoCache: { veredicto: "neutral" } }),
    });
    expect(estadoDe(p, "hs5").progreso).toBe("sin_iniciar");
    expect(estadoDe(p, "hs5").veredicto).toBeUndefined();
    expect(estadoDe(p, "hs6").progreso).toBe("en_curso");
    expect(estadoDe(p, "hs6").veredicto).toBeUndefined();
    expect(estadoDe(p, "he1").progreso).toBe("en_curso");
    expect(estadoDe(p, "he1").veredicto).toBeUndefined();
  });

  it("obra nueva con todos los atributos: hs5 aplica sin forzar", () => {
    const e = estadoDe(proyecto(), "hs5");
    expect(e.aplicabilidad).toBe("aplica");
    expect(e.forzada).toBe(false);
  });

  it("propaga la aplicabilidad forzada por el proyectista, con su nota", () => {
    const p = proyecto({
      hr: {
        aplicabilidadForzada: { valor: "no_aplica", nota: "Justificado por el acústico externo" },
      },
    });
    const e = estadoDe(p, "hr");
    expect(e.aplicabilidad).toBe("no_aplica");
    expect(e.forzada).toBe(true);
    expect(e.nota).toBe("Justificado por el acústico externo");
  });

  it("aplicabilidad y progreso son ortogonales: una forzada no_aplica conserva su progreso derivado", () => {
    const p = proyecto({
      hs6: conInputs({
        resultadoCache: { veredicto: "ok" },
        aplicabilidadForzada: { valor: "no_aplica" },
      }),
    });
    const e = estadoDe(p, "hs6");
    expect(e.aplicabilidad).toBe("no_aplica");
    expect(e.progreso).toBe("cumple");
    expect(e.veredicto).toBe("ok");
  });
});

// ── resumenProyecto: recuento sobre proyecto sintético ──────────────────────

describe("resumenProyecto — recuento del expediente", () => {
  /** Nº de claves reales del expediente (registry sin entradas dev). */
  const TOTAL = justificacionRegistry.filter((e) => !e.dev).length;

  it("el registry sin dev cubre las 25 claves del union", () => {
    expect(TOTAL).toBe(25);
  });

  it("proyecto vacío en obra nueva: 2 externas de base, el resto aplicables sin_iniciar", () => {
    const r = resumenProyecto(proyecto());
    // he0he1_global (HULC) y dbse (Concreta estructura) son externas de base.
    expect(r.externas).toBe(2);
    expect(r.noAplica).toBe(0);
    expect(r.aplicables).toBe(TOTAL - 2);
    expect(r.cumplen).toBe(0);
    expect(r.noCumplen).toBe(0);
    expect(r.enCurso).toBe(0);
    expect(r.sinIniciar).toBe(TOTAL - 2);
  });

  it("mezcla conocida: cuentas exactas por estado", () => {
    const p = proyecto({
      hs5: conInputs({ resultadoCache: { veredicto: "ok" } }), // cumple
      hs3: conInputs({ resultadoCache: { veredicto: "warn" } }), // cumple (warn)
      hs4: conInputs({ resultadoCache: { veredicto: "fail" } }), // no_cumple
      hs6: conInputs(), // en_curso (sin cache)
      he1: conInputs({ resultadoCache: { veredicto: "neutral" } }), // en_curso
      hr: { aplicabilidadForzada: { valor: "no_aplica", nota: "n/a" } },
      he4: { aplicabilidadForzada: { valor: "externo" }, refExterna: "EXP-123" },
    });
    const r = resumenProyecto(p);
    expect(r.noAplica).toBe(1); // hr forzada
    expect(r.externas).toBe(3); // he0he1_global + dbse (base) + he4 forzada
    expect(r.aplicables).toBe(TOTAL - 4); // 25 − 1 no_aplica − 3 externas
    expect(r.cumplen).toBe(2);
    expect(r.noCumplen).toBe(1);
    expect(r.enCurso).toBe(2);
    expect(r.sinIniciar).toBe(TOTAL - 4 - 5); // aplicables − 5 con progreso
    // Invariante: el desglose de progreso suma exactamente las aplicables.
    expect(r.cumplen + r.noCumplen + r.enCurso + r.sinIniciar).toBe(r.aplicables);
  });

  it("no_aplica y externo NO cuentan como aplicables aunque tengan inputs y veredicto", () => {
    const p = proyecto({
      sua6: conInputs({
        resultadoCache: { veredicto: "ok" },
        aplicabilidadForzada: { valor: "no_aplica" },
      }),
      rebt: conInputs({
        resultadoCache: { veredicto: "fail" },
        aplicabilidadForzada: { valor: "externo" },
      }),
    });
    const r = resumenProyecto(p);
    expect(r.noAplica).toBe(1);
    expect(r.externas).toBe(3); // 2 de base + rebt forzada
    expect(r.aplicables).toBe(TOTAL - 4);
    // Sus veredictos no se cuelan en el desglose de aplicables.
    expect(r.cumplen).toBe(0);
    expect(r.noCumplen).toBe(0);
  });
});

// ── Determinismo ────────────────────────────────────────────────────────────

describe("determinismo — funciones puras", () => {
  it("mismas entradas ⇒ mismas salidas, sin mutar el proyecto", () => {
    const p = proyecto({
      hs5: conInputs({ resultadoCache: { veredicto: "warn" } }),
      hs4: conInputs({ resultadoCache: { veredicto: "fail" } }),
      hr: { aplicabilidadForzada: { valor: "no_aplica" } },
    });
    const antes = JSON.stringify(p);

    const claves: JustificacionKey[] = ["hs5", "hs4", "hs6", "hr", "dbse"];
    for (const k of claves) {
      expect(estadoDe(p, k)).toEqual(estadoDe(p, k));
    }
    expect(progresoDe(p.justificaciones.hs5)).toBe(progresoDe(p.justificaciones.hs5));
    expect(resumenProyecto(p)).toEqual(resumenProyecto(p));

    expect(JSON.stringify(p)).toBe(antes);
  });
});
