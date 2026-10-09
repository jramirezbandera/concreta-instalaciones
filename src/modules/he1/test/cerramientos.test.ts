import { describe, expect, it } from "vitest";
import { deCategoria, solucionDe } from "../../../lib/constructivo/catalogo";
import { setCerramientos, setPlantaBajaDistinta } from "../../../lib/constructivo/cerramientos";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { calcHE1 } from "../calc";
import { calcularDibujoHe1, tamanoDibujoHe1, vistaDe } from "../dibujo";
import { filasQueEntraHe1 } from "../entra";
import { cubiertaDe } from "../envolvente";
import { he1EstadoDefaults, type He1Estado } from "../estado";
import { toFichaData } from "../ficha";
import { cerramientoDe, justificarHe1, rolesDe, type ObraHe1 } from "../justificacion";
import { memoriaHe1 } from "../memoria";
import { textoIncumplimiento } from "../textos";
import { estadosElementos } from "../../../lib/cte/estados";

// =============================================================================
// HE1 lee los cerramientos de El edificio (feature-26, paso 3): la fachada, el
// marco y el forjado elegidos, y la planta baja distinta como cerramientos
// aparte (K-CER.1, K-CER.2).
// =============================================================================

const CACERES: ObraHe1 = { provincia: "Cáceres", altitud_m: 459, municipio: "Cáceres" };
const BURGOS: ObraHe1 = { provincia: "Burgos", altitud_m: 860, municipio: "Burgos" };

function justificar(e: Edificio, parcial: Partial<He1Estado> = {}, obra: ObraHe1 = CACERES) {
  return justificarHe1({ ...he1EstadoDefaults, ...parcial }, e, obra);
}

describe("HE1 · la cubierta sobre el forjado de El edificio (K-CER.10)", () => {
  // La R por capas sin el aislante, frente a R0_paquete + R del forjado del CEC.
  function r0(tipo: "plana_no_transitable" | "inclinada", forjadoId: string) {
    const forjado = solucionDe("forjado", forjadoId);
    const cer = cubiertaDe(tipo, 100, forjado);
    const r = calcHE1({ zonaClimatica: "D", claseHigrometria: "clase_3_o_inferior", cerramientos: [cer] }).porCerramiento[0];
    const at = r.capas.find((c) => c.id === "cubierta-aislante")!;
    const cec = solucionDe("cubierta", tipo === "inclinada" ? "cu-incl-fu-bovhorm-250" : "cu-plana-fu-bovhorm-300");
    return { porCapas: r.rt_m2K_W - at.resistencia_m2K_W, cec: cec.R0_paquete + forjado.R, r };
  }

  it.each(deCategoria("forjado").map((f) => [f.nombre, f.id]))("plana sobre %s: por capas, del lado seguro y a menos de 0,03 del CEC", (_n, id) => {
    const { porCapas, cec } = r0("plana_no_transitable", id);
    expect(porCapas).toBeLessThanOrEqual(cec + 1e-9);
    expect(cec - porCapas).toBeLessThan(0.03);
  });

  it.each(deCategoria("forjado").map((f) => [f.nombre, f.id]))("inclinada sobre %s: por capas, a menos de 0,01 del CEC", (_n, id) => {
    const { porCapas, cec } = r0("inclinada", id);
    expect(Math.abs(porCapas - cec)).toBeLessThan(0.01);
  });

  it("el forjado entra con la R y la µ del CEC (3.18), con su canto", () => {
    const { r } = r0("plana_no_transitable", "fu-boveps-300");
    const f = r.capas.find((c) => c.id === "cubierta-forjado")!;
    expect(f.resistencia_m2K_W).toBe(1.17);
    expect(f.mu).toBe(60);
    expect(f.espesor_m).toBeCloseTo(0.3, 6);
  });

  it("con el forjado de bovedilla de EPS la cubierta y el suelo piden menos aislante", () => {
    const e = edificioDeCaso("plurifamiliar_locales");
    const base = justificar(e).propuesta.minimos;
    const eps = justificar(setCerramientos(e, { forjado: { id: "fu-boveps-300" } })).propuesta.minimos;
    expect(eps.cubierta!).toBeLessThan(base.cubierta!);
    expect(eps.suelo!).toBeLessThan(base.suelo!);
    expect(eps.fachada).toBe(base.fachada);
  });
});

describe("HE1 · la cubierta convencional (El edificio)", () => {
  const conv = setCerramientos(edificioDeCaso("plurifamiliar"), { aislanteCubierta: "convencional" });
  const capas = (j: ReturnType<typeof justificar>) => cerramientoDe(j, "cubierta").detalle.r.capas.map((c) => c.nombre);

  it("sin decirlo, invertida: el aislante sobre la impermeabilización, como antes", () => {
    const j = justificar(edificioDeCaso("plurifamiliar"), {}, BURGOS);
    expect(j.propuesta.montajeCubierta).toEqual({ invertida: true, barrera: false });
    expect(capas(j).slice(-2)).toEqual(["Impermeabilización", "XPS"]);
  });

  it("convencional: el aislante bajo la impermeabilización, y la barrera de vapor solo si Glaser la pide", () => {
    // En Sevilla, sin barrera no condensa.
    const sevilla = justificar(conv, {}, { provincia: "Sevilla", altitud_m: 7, municipio: "Sevilla" });
    expect(sevilla.propuesta.montajeCubierta).toEqual({ invertida: false, barrera: false });
    expect(capas(sevilla).slice(-2)).toEqual(["XPS", "Impermeabilización"]);
    expect(cerramientoDe(sevilla, "cubierta").detalle.r.glaserAplica).toBe(true);
    // Con la bicapa del CEC (µ 50 000, Sd ≈ 273 m) encima, en Cáceres y en Burgos sí la pide.
    expect(justificar(conv).propuesta.montajeCubierta).toEqual({ invertida: false, barrera: true });
    const burgos = justificar(conv, {}, BURGOS);
    expect(burgos.propuesta.montajeCubierta).toEqual({ invertida: false, barrera: true });
    expect(capas(burgos).slice(-3)).toEqual(["Barrera de vapor", "XPS", "Impermeabilización"]);
    // La U apenas cambia: el mínimo del aislante es el mismo que en la invertida.
    expect(burgos.propuesta.minimos.cubierta).toBe(justificar(edificioDeCaso("plurifamiliar"), {}, BURGOS).propuesta.minimos.cubierta);
  });

  it("con lámina autoprotegida (C 6.3): convencional y con lana mineral, que es soldable (K-CER.18)", () => {
    const e = setCerramientos(edificioDeCaso("plurifamiliar"), { cubierta: { id: "cu-plana-autoprotegida" } });
    const j = justificar(e);
    expect(j.propuesta.montajeCubierta.invertida).toBe(false);
    expect(capas(j)).toContain("Lana mineral");
    expect(capas(j).at(-1)).toBe("Impermeabilización");
    const f = toFichaData(j, { estado: he1EstadoDefaults, edificio: e, revisados: [], svg: tamanoDibujoHe1() });
    expect(f.datosPartida.find((d) => d.concepto === "Cubierta")?.valor).toMatch(/\(CEC C 6\.3, p\. 42\) · convencional.* · Lana mineral \d+ mm$/);
    expect(textoPlanoMemoria(memoriaHe1(j))).toMatch(/\(CEC C 6\.3, p\. 42\), convencional.*y lana mineral de/);
  });

  it("con barrera de vapor en la cara caliente no es necesaria la comprobación (DA DB-HE/2 §4.2.1): sin aviso", () => {
    const j = justificar(conv, {}, BURGOS);
    expect(cerramientoDe(j, "cubierta").detalle.r.glaserAplica).toBe(false);
    expect(j.avisos.some((x) => x.id === "intersticial-cubierta")).toBe(false);
    const f = toFichaData(j, { estado: he1EstadoDefaults, edificio: conv, revisados: [], svg: tamanoDibujoHe1() });
    expect(f.datosPartida.find((d) => d.concepto === "Cubierta")?.valor).toContain("(CEC C 5.3, p. 41) · convencional con barrera de vapor · XPS");
    expect((f.observaciones ?? []).some((o) => o.includes("la comprobación no es necesaria (DA DB-HE/2 §4.2.1)"))).toBe(true);
    const m = textoPlanoMemoria(memoriaHe1(j));
    expect(m).toContain("(CEC C 5.3, p. 41), convencional con barrera de vapor, con forjado");
    expect(m).toContain("En la cubierta, con barrera contra el vapor bajo el aislante, en su cara caliente, no es necesaria la comprobación (DA DB-HE/2 §4.2.1).");
  });
});

describe("HE1 · la fachada y el marco de El edificio", () => {
  it("con SATE sobre LP ½ pie, la fachada lleva EPS y sus capas", () => {
    const e = setCerramientos(edificioDeCaso("plurifamiliar_locales"), { fachada: { id: "fa-sate-lp115" } });
    const j = justificar(e);
    const f = cerramientoDe(j, "fachada").detalle;
    expect(f.r.capas.map((c) => c.id)).toEqual(["fachada-enlucido", "fachada-ladrillo", "fachada-aislante", "fachada-revoco"]);
    expect(f.aislante?.nombre).toBe("EPS");
    expect(rolesDe(j.propuesta)).toEqual(["fachada", "cubierta", "suelo", "ventanas"]);
  });

  it("el marco cambia Uf y Ψ: el metálico sin RPT no cumple ni con el mejor vidrio", () => {
    const e = setCerramientos(edificioDeCaso("plurifamiliar_locales"), { ventana: { id: "ve-4-c-6-batiente", marco: "metalico_sin_rpt" } });
    const j = justificar(e);
    const h = cerramientoDe(j, "ventanas").detalle.r.hueco!;
    expect(h.uf_W_m2K).toBe(5.7);
    expect(h.psi_W_mK).toBe(0.04); // Tabla 10: metálico sin RPT, bajo emisivo, separador mejorado
    expect(j.propuesta.decisiones.vidrio).toBe("bajo_emisivo_plus");
    expect(cerramientoDe(j, "ventanas").veredicto).toBe("fail");
    // Ningún vidrio lo arregla: hace falta otro marco, y no se ofrece un cambio de vidrio.
    const t = textoIncumplimiento(cerramientoDe(j, "ventanas"), j)!;
    expect(t.detalle).toContain("hace falta otro marco, que se elige en El edificio");
    expect(t.cambio).toBeUndefined();
  });

  it("con madera de 700 kg/m³: Uf 2,2 y la Ψ de madera y plástico", () => {
    const e = setCerramientos(edificioDeCaso("plurifamiliar_locales"), { ventana: { id: "ve-4-c-6-batiente", marco: "madera_700kg_m3" } });
    const h = cerramientoDe(justificar(e), "ventanas").detalle.r.hueco!;
    expect(h.uf_W_m2K).toBe(2.2);
    expect(h.psi_W_mK).toBe(0.08);
  });
});

describe("HE1 · la planta baja distinta (K-CER.1, K-CER.2)", () => {
  // Plurifamiliar: viviendas también en la planta baja, garaje debajo.
  const PLURI = edificioDeCaso("plurifamiliar");
  const conPB = setCerramientos(setPlantaBajaDistinta(PLURI, true), {
    fachadaPB: { id: "fa-sate-lp115" },
    ventanaPB: { id: "ve-4-c-6-batiente", marco: "metalico_rpt_mayor_12mm" },
  });

  it("dos fachadas y dos ventanas, cada una comprobada entera", () => {
    const j = justificar(conPB);
    expect(rolesDe(j.propuesta)).toEqual(["fachada", "fachada-pb", "cubierta", "suelo", "ventanas", "ventanas-pb"]);
    expect(j.propuesta.tipos.fachadas.map((f) => [f.sol.codigo, f.niveles])).toEqual([
      ["F 3.2", [1, 2, 3]],
      ["F 4.1", [0]],
    ]);
    expect(cerramientoDe(j, "fachada-pb").nombre).toBe("Fachada de la planta baja");
    expect(cerramientoDe(j, "fachada-pb").detalle.aislante?.nombre).toBe("EPS");
    expect(cerramientoDe(j, "ventanas-pb").detalle.r.hueco?.uf_W_m2K).toBe(3.2);
    expect(j.propuesta.minimos["fachada-pb"]).toBeGreaterThan(0);
    expect(j.propuesta.decisiones.aislanteFachadaPB_mm).toBe(j.propuesta.habituales.aislanteFachadaPB_mm);
    const filas = filasQueEntraHe1(j, "C4", estadosElementos(j.elementos, j.avisos, []));
    expect(filas.find((f) => f.id === "envolvente")?.trato).toBe("6 cerramientos");
    expect(filas.map((f) => f.titulo)).toContain("Ventanas de la planta baja");
  });

  it("el aislante de la planta baja se decide aparte, y su arreglo escribe su campo", () => {
    const j = justificar(conPB, { aislanteFachadaPB_mm: 20 }, BURGOS);
    expect(cerramientoDe(j, "fachada-pb").detalle.aislante?.espesor_mm).toBe(20);
    expect(cerramientoDe(j, "fachada").detalle.aislante?.espesor_mm).toBe(j.propuesta.habituales.aislanteFachada_mm);
    const el = cerramientoDe(j, "fachada-pb");
    expect(el.veredicto).toBe("fail");
    const t = textoIncumplimiento(el, j)!;
    expect(t.titulo).toBe("La fachada de la planta baja no cumple");
    expect(t.cambio?.aplicar).toEqual({ aislanteFachadaPB_mm: "habitual" });
  });

  it("el vidrio habitual es el primero con el que cumplen las dos ventanas", () => {
    const solo = justificar(PLURI, {}, BURGOS).propuesta.habituales.vidrio;
    const ambas = justificar(conPB, {}, BURGOS).propuesta.habituales.vidrio;
    expect(solo).toBe("bajo_emisivo");
    expect(ambas).toBe("bajo_emisivo_plus");
  });

  it("la misma fachada en la planta baja, o solo otro tipo acústico de ventana, no añade cerramientos", () => {
    const igual = setCerramientos(setPlantaBajaDistinta(PLURI, true), { ventanaPB: { id: "ve-doble-oscilo", marco: "pvc_tres_camaras" } });
    expect(rolesDe(justificar(igual).propuesta)).toEqual(["fachada", "cubierta", "suelo", "ventanas"]);
  });

  it("si la planta baja no se protege (locales), su fachada no entra", () => {
    const e = setCerramientos(setPlantaBajaDistinta(edificioDeCaso("plurifamiliar_locales"), true), { fachadaPB: { id: "fa-sate-lp115" } });
    expect(rolesDe(justificar(e).propuesta)).toEqual(["fachada", "cubierta", "suelo", "ventanas"]);
  });

  it("si solo se protege la planta baja, su fachada es la única", () => {
    const una: Edificio = { ...PLURI, grupos: PLURI.grupos.filter((g) => g.nivelInicial <= 0) };
    const e = setCerramientos(setPlantaBajaDistinta(una, true), { fachadaPB: { id: "fa-sate-lp115" } });
    const j = justificar(e);
    expect(rolesDe(j.propuesta)).toEqual(["fachada", "cubierta", "suelo", "ventanas"]);
    expect(j.propuesta.tipos.fachadas[0].sol.codigo).toBe("F 4.1");
  });

  it("el dibujo, la memoria y la ficha cubren las dos fachadas y las dos ventanas", () => {
    const j = justificar(conPB);
    expect(vistaDe("fachada-pb", j)).toBe("fachada-pb");
    expect(vistaDe("fachada-pb", justificar(PLURI))).toBe("fachada");
    const muro = calcularDibujoHe1(j, "fachada-pb");
    expect(muro.tipo === "muro" && muro.etiquetas[0].elementoId).toBe("fachada-pb");
    const v = calcularDibujoHe1(j, "ventanas-pb");
    expect(v.tipo === "ventana" && v.rol).toBe("ventanas-pb");

    const t = textoPlanoMemoria(memoriaHe1(j));
    expect(t).toContain("– Fachada de la planta baja: SATE sobre LP ½ pie (CEC F 4.1, p. 64), con EPS de");
    expect(t).toContain("– Ventanas de la planta baja: batiente, vidrio 4-cámara-6, clase 3 (CEC 4.3.2, p. 97), con marco metálico con RPT de más de 12 mm y vidrio");

    const f = toFichaData(j, { estado: he1EstadoDefaults, edificio: conPB, revisados: [], svg: tamanoDibujoHe1() });
    expect(f.datosPartida.map((d) => d.concepto)).toEqual(
      expect.arrayContaining(["Fachada", "Fachada de la planta baja", "Forjados", "Ventanas", "Ventanas de la planta baja"]),
    );
    expect(f.verificaciones).toHaveLength(9);
  });
});
