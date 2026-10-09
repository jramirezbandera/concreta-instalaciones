import { describe, expect, it } from "vitest";
import { CASOS_OBRA_NUEVA, edificioDeCaso } from "../../edificio/casos";
import { setCubierta } from "../../edificio/editar";
import type { Edificio, TipoCubierta } from "../../edificio/tipos";
import { crearProyectoDemo } from "../../proyecto/demo";
import { he1EstadoDefaults, type He1Estado } from "../../../modules/he1/estado";
import { justificarHe1, type ObraHe1 } from "../../../modules/he1/justificacion";
import { hrEstadoDefaults } from "../../../modules/hr/estado";
import { justificarHr } from "../../../modules/hr/justificacion";
import { hs1EstadoDefaults } from "../../../modules/hs1/estado";
import { justificarHs1, type ObraHs1 } from "../../../modules/hs1/justificacion";
import { VEREDICTOS_ANTES } from "./veredictos-antes";

// =============================================================================
// Cierre de feature-26 (paso 7): un proyecto sin `cerramientos` da en HE1, HR y
// HS1 el mismo veredicto que antes de feature-26, elemento a elemento. Se
// recorren los cuatro casos de El edificio y el Demo, con cada tipo de cubierta,
// y con datos que llevan al límite: aislantes finos o justos en HE1, más ruido
// exterior en HR y clima más duro en HS1 (420 combinaciones).
//
// El único cambio admitido es el que ya documenta el paso 3: con el forjado del
// CEC (R 0,21 frente a 0,13), la cubierta y el suelo de HE1 con un espesor
// fijado en el límite pasan de no cumplir a cumplir. Nunca al revés.
// =============================================================================

const demo = crearProyectoDemo("2026-10-08T10:00:00.000Z");

const OBRAS_HE1: Record<string, ObraHe1> = {
  caceres: { provincia: "Cáceres", altitud_m: 459, municipio: "Cáceres" },
  burgos: { provincia: "Burgos", altitud_m: 860, municipio: "Burgos" },
  sin: {},
};
const ESTADOS_HE1: Record<string, Partial<He1Estado>> = {
  habitual: {},
  finos: { aislanteFachada_mm: 30, aislanteCubierta_mm: 60, aislanteSuelo_mm: 20 },
  justos: { aislanteFachada_mm: 50, aislanteCubierta_mm: 70, aislanteSuelo_mm: 30 },
  medios: { aislanteFachada_mm: 40, aislanteCubierta_mm: 80, aislanteSuelo_mm: 40, vidrio: "doble" },
};
const RUIDO_HR: Record<string, object> = { demo: {}, ld65: { ldZona: 65 }, ld70: { ldZona: 70 }, ld75a: { ldZona: 75, aeronaves: true } };
const NF = { tipo: "no_detectado", reconocimiento_m: 20 } as const;
const OBRAS_HS1: Record<string, ObraHs1> = {
  iv: { zonaPluviometricaHs1: "IV", zonaEolica: "A", terrenoTipo: "IV", permeabilidadTerreno: "medio", nivelFreatico: NF },
  i: { zonaPluviometricaHs1: "I", zonaEolica: "C", terrenoTipo: "I", permeabilidadTerreno: "alto", nivelFreatico: NF },
  ii: { zonaPluviometricaHs1: "II", zonaEolica: "C", terrenoTipo: "I", permeabilidadTerreno: "alto", nivelFreatico: NF },
  iii: { zonaPluviometricaHs1: "III", zonaEolica: "B", terrenoTipo: "II", permeabilidadTerreno: "bajo", nivelFreatico: NF },
  sin: {},
};

/** El mismo formato que `veredictos-antes.ts`: «ok · fachada cubierta=fail …». */
function texto(j: { veredicto: string; elementos: { id: string; veredicto: string }[] }): string {
  return `${j.veredicto} · ${j.elementos.map((e) => (e.veredicto === "ok" ? e.id : `${e.id}=${e.veredicto}`)).join(" ")}`;
}

function veredictosDeHoy(): Record<string, string> {
  const out: Record<string, string> = {};
  const casos: { k: string; e: Edificio }[] = [...CASOS_OBRA_NUEVA.map((c) => ({ k: c, e: edificioDeCaso(c) })), { k: "demo", e: demo.edificio }];
  for (const { k, e: e0 } of casos) {
    expect(e0.cerramientos).toBeUndefined();
    for (const cub of ["asi", "plana_transitable", "plana_no_transitable", "inclinada"] as const) {
      const e = cub === "asi" ? e0 : setCubierta(e0, { tipo: cub as TipoCubierta });
      const clave = `${k}/${cub}`;
      for (const [o, obra] of Object.entries(OBRAS_HE1))
        for (const [d, est] of Object.entries(ESTADOS_HE1)) out[`he1/${clave}/${o}/${d}`] = texto(justificarHe1({ ...he1EstadoDefaults, ...est }, e, obra));
      for (const [l, dg] of Object.entries(RUIDO_HR))
        out[`hr/${clave}/${l}`] = texto(justificarHr({ ...hrEstadoDefaults }, { edificio: e, datosGenerales: { ...demo.datosGenerales, ...dg }, justificaciones: {} }));
      for (const [o, obra] of Object.entries(OBRAS_HS1)) out[`hs1/${clave}/${o}`] = texto(justificarHs1(hs1EstadoDefaults, e, obra));
    }
  }
  return out;
}

/** «ok · a b=fail» → { a: "ok", b: "fail" }. */
function elementos(t: string): Record<string, string> {
  return Object.fromEntries(
    t
      .split(" · ")[1]
      .split(" ")
      .map((x) => (x.includes("=") ? (x.split("=") as [string, string]) : [x, "ok"])),
  );
}

describe("feature-26 · sin cerramientos, el mismo veredicto que antes (paso 7)", () => {
  const hoy = veredictosDeHoy();

  it("las mismas 420 combinaciones", () => {
    expect(Object.keys(hoy).sort()).toEqual(Object.keys(VEREDICTOS_ANTES).sort());
    expect(Object.keys(hoy)).toHaveLength(420);
  });

  it("HR y HS1, idénticos elemento a elemento (también lo que no cumple)", () => {
    const claves = Object.keys(VEREDICTOS_ANTES).filter((k) => !k.startsWith("he1/"));
    expect(claves.some((k) => VEREDICTOS_ANTES[k].startsWith("fail"))).toBe(true);
    for (const k of claves) expect(hoy[k], k).toBe(VEREDICTOS_ANTES[k]);
  });

  it("HE1: solo cambian la cubierta y el suelo con el aislante en el límite, y solo de no cumplir a cumplir", () => {
    const cambios: string[] = [];
    for (const k of Object.keys(VEREDICTOS_ANTES).filter((x) => x.startsWith("he1/"))) {
      const antes = elementos(VEREDICTOS_ANTES[k]);
      const ahora = elementos(hoy[k]);
      expect(Object.keys(ahora), k).toEqual(Object.keys(antes));
      for (const id of Object.keys(antes)) {
        if (antes[id] === ahora[id]) continue;
        expect([id, antes[id], ahora[id]], k).toSatisfy(
          ([el, a, b]: string[]) => (el === "cubierta" || el === "suelo") && a === "fail" && b === "ok",
        );
        cambios.push(`${k}:${id}`);
      }
    }
    // Todos con los espesores «justos» (cubierta 70 mm, suelo 30 mm): los mínimos que bajaron en el paso 3.
    expect(cambios.length).toBeGreaterThan(0);
    expect(cambios.every((c) => c.includes("/justos:"))).toBe(true);
  });
});
