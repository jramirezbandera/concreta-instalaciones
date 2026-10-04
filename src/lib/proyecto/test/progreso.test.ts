import { describe, it, expect } from "vitest";
import { estadoDe, resumenProyecto } from "../progreso";
import type { DatosGenerales, JustificacionKey, Proyecto } from "../tipos";
import { justificacionRegistry } from "../../../data/justificacionRegistry";
import { edificioDeCaso } from "../../edificio/casos";
import { evaluarExpediente } from "../../obra/evaluar";

// =============================================================================
// progreso.ts — progreso DERIVADO, nunca marcado a mano (feature-6 §A, §3).
// Desde feature-16 se calcula con el motor de cada módulo sobre el expediente:
// sin caché, así que cambia en cuanto cambia El edificio o la obra.
// =============================================================================

/** Obra nueva con piscina: ninguna regla de atributos desactiva nada. */
const datosObraNueva: DatosGenerales = {
  municipio: "Cáceres",
  provincia: "Cáceres",
  altitud_m: 459,
  intervencion: "obra_nueva",
  tienePiscina: true,
  zonaRadon: "I",
  presionAcometida_kPa: 300,
  cotaAlcantarillado_m: -4,
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
    // Plurifamiliar con garaje y trasteros: ninguna regla de atributos desactiva nada.
    edificio: edificioDeCaso("plurifamiliar"),
    justificaciones,
  };
}

/** Las veintiuna publicadas (SUA 5 no tiene pantalla: no aplica nunca). */
const PUBLICADAS: JustificacionKey[] = [
  "hs1", "hs2", "hs3", "hs4", "hs5", "hs6", "si1", "si2", "si3", "si4", "si5", "si6",
  "sua1", "sua2", "sua3", "sua4", "sua6", "sua7", "sua8", "sua9", "he1",
];

describe("estadoDe — calculado con el motor del módulo", () => {
  it("una justificación aún no publicada queda sin iniciar y sin veredicto", () => {
    const e = estadoDe(proyecto(), "rebt");
    expect(e).toMatchObject({ aplicabilidad: "aplica", forzada: false, progreso: "sin_iniciar" });
    expect(e.veredicto).toBeUndefined();
  });

  it("las publicadas se calculan aunque no se hayan abierto (sin entradas guardadas)", () => {
    const p = proyecto();
    for (const k of PUBLICADAS) {
      const e = estadoDe(p, k);
      expect(["cumple", "no_cumple"], k).toContain(e.progreso);
      expect(e.veredicto, k).toBe(e.progreso === "cumple" ? (e.veredicto === "warn" ? "warn" : "ok") : "fail");
    }
  });

  it("cumple con avisos sin revisar → «warn»; revisados todos → «ok»", () => {
    const sinPresion = { ...datosObraNueva, presionAcometida_kPa: undefined };
    const p = proyecto({}, sinPresion);
    const ev = evaluarExpediente(p).porClave.hs4!;
    expect(ev.avisos.length).toBeGreaterThan(0);
    expect(estadoDe(p, "hs4").veredicto).toBe("warn");

    const revisados = ev.calculado!.avisos.map((a) => a.id);
    const q = proyecto({ hs4: { revisados } }, sinPresion);
    expect(estadoDe(q, "hs4").veredicto).toBe("ok");
  });

  it("obra nueva con todos los atributos: hs5 aplica sin forzar", () => {
    const e = estadoDe(proyecto(), "hs5");
    expect(e.aplicabilidad).toBe("aplica");
    expect(e.forzada).toBe(false);
  });

  it("propaga la aplicabilidad forzada por el proyectista, con su nota", () => {
    const p = proyecto({
      hr: { aplicabilidadForzada: { valor: "no_aplica", nota: "Justificado por el acústico externo" } },
    });
    const e = estadoDe(p, "hr");
    expect(e.aplicabilidad).toBe("no_aplica");
    expect(e.forzada).toBe(true);
    expect(e.nota).toBe("Justificado por el acústico externo");
  });

  it("una publicada forzada a «no aplica» no se calcula", () => {
    const p = proyecto({ hs6: { aplicabilidadForzada: { valor: "no_aplica" } } });
    const e = estadoDe(p, "hs6");
    expect(e.aplicabilidad).toBe("no_aplica");
    expect(e.progreso).toBe("sin_iniciar");
    expect(e.veredicto).toBeUndefined();
    expect(evaluarExpediente(p).porClave.hs6!.calculado).toBeUndefined();
  });

  it("cambia en cuanto cambia la obra, sin abrir el módulo", () => {
    const baja = proyecto({}, { ...datosObraNueva, presionAcometida_kPa: 60 });
    const alta = proyecto({}, { ...datosObraNueva, presionAcometida_kPa: 400 });
    expect(estadoDe(baja, "hs4").progreso).toBe("no_cumple");
    expect(estadoDe(alta, "hs4").progreso).toBe("cumple");
  });
});

describe("resumenProyecto — recuento del expediente", () => {
  /** Nº de claves reales del expediente (registry sin entradas dev). */
  const TOTAL = justificacionRegistry.filter((e) => !e.dev).length;

  it("el registry sin dev cubre las 28 claves del union", () => {
    expect(TOTAL).toBe(28);
  });

  it("proyecto sin abrir nada: las veintiuna publicadas calculadas, el resto sin iniciar", () => {
    const r = resumenProyecto(proyecto());
    // he0he1_global (HULC) y dbse (Concreta estructura) son externas de base;
    // SUA 5 no aplica nunca a viviendas ni oficinas.
    expect(r.externas).toBe(2);
    expect(r.noAplica).toBe(1);
    expect(r.aplicables).toBe(TOTAL - 3);
    expect(r.cumplen + r.noCumplen).toBe(PUBLICADAS.length);
    expect(r.enCurso).toBe(0);
    expect(r.sinIniciar).toBe(TOTAL - 3 - PUBLICADAS.length);
  });

  it("no_aplica y externo forzados no cuentan como aplicables", () => {
    const p = proyecto({
      hr: { aplicabilidadForzada: { valor: "no_aplica", nota: "n/a" } },
      hs5: { aplicabilidadForzada: { valor: "no_aplica" } },
      he4: { aplicabilidadForzada: { valor: "externo" }, refExterna: "EXP-123" },
    });
    const r = resumenProyecto(p);
    expect(r.noAplica).toBe(3); // hr y hs5 forzadas + sua5
    expect(r.externas).toBe(3); // he0he1_global + dbse (base) + he4 forzada
    expect(r.aplicables).toBe(TOTAL - 6);
    expect(r.cumplen + r.noCumplen).toBe(PUBLICADAS.length - 1); // hs5 ya no se calcula
    // Invariante: el desglose de progreso suma exactamente las aplicables.
    expect(r.cumplen + r.noCumplen + r.enCurso + r.sinIniciar).toBe(r.aplicables);
  });
});

describe("determinismo — funciones puras", () => {
  it("mismas entradas ⇒ mismas salidas, sin mutar el proyecto", () => {
    const p = proyecto({ hr: { aplicabilidadForzada: { valor: "no_aplica" } } });
    const antes = JSON.stringify(p);
    const claves: JustificacionKey[] = ["hs5", "hs4", "hs6", "hr", "dbse"];
    for (const k of claves) expect(estadoDe(p, k)).toEqual(estadoDe(p, k));
    expect(resumenProyecto(p)).toEqual(resumenProyecto(p));
    expect(JSON.stringify(p)).toBe(antes);
  });

  it("la evaluación se memoriza por objeto de proyecto", () => {
    const p = proyecto();
    expect(evaluarExpediente(p)).toBe(evaluarExpediente(p));
    expect(evaluarExpediente({ ...p })).not.toBe(evaluarExpediente(p));
  });
});
