import { describe, expect, it } from "vitest";
import { estadosElementos } from "../../../lib/cte/estados";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { calcHE1, espesorMinimoCapa_m, uHueco } from "../calc";
import { calcularDibujoHe1, tamanoDibujoHe1, vistaDe } from "../dibujo";
import { filasQueEntraHe1 } from "../entra";
import { envolventeDe } from "../envolvente";
import { he1EstadoDefaults, type He1Estado } from "../estado";
import { toFichaData } from "../ficha";
import { cerramientoDe, justificarHe1, type ObraHe1 } from "../justificacion";
import { memoriaHe1 } from "../memoria";
import { HE1_PDF_SVG_ID } from "../svg-meta";
import { climaEneroDe, rCamaraDe, ulimParticionDe } from "../tablas";
import { franjaDe, fraseHe1, resultadoLista, textoAviso, textoIncumplimiento } from "../textos";

// =============================================================================
// HE1 v4 (feature-15): las tablas y el motor corregidos por la verificación, la
// envolvente deducida de El edificio, la justificación, los textos, la memoria,
// la ficha y el dibujo.
// =============================================================================

const DEMO = edificioDeCaso("plurifamiliar_locales");
const CACERES: ObraHe1 = { provincia: "Cáceres", altitud_m: 459, municipio: "Cáceres" };

function justificar(parcial: Partial<He1Estado> = {}, e: Edificio = DEMO, obra: ObraHe1 = CACERES) {
  return justificarHe1({ ...he1EstadoDefaults, ...parcial }, e, obra);
}

describe("tablas y motor (verificación v4)", () => {
  it("UH por la ec. (10): 1,20 × 1,20 de una hoja, Ug 1,6, Uf 1,8, Ψ 0,08 → 1,88 (research §5.C1)", () => {
    const h = uHueco({ ancho_m: 1.2, alto_m: 1.2, hojas: 1, ug_W_m2K: 1.6, uf_W_m2K: 1.8, psi_W_mK: 0.08 });
    expect(h.anchoMarco_m).toBeCloseTo(0.08, 3);
    expect(h.lg_m).toBeCloseTo(4.16, 2);
    expect(h.uh_W_m2K).toBeCloseTo(1.88, 2);
  });

  it("con dos hojas la junta crece y la UH sube", () => {
    const una = uHueco({ ancho_m: 1.2, alto_m: 1.4, hojas: 1, ug_W_m2K: 1.6, uf_W_m2K: 1.8, psi_W_mK: 0.08 });
    const dos = uHueco({ ancho_m: 1.2, alto_m: 1.4, hojas: 2, ug_W_m2K: 1.6, uf_W_m2K: 1.8, psi_W_mK: 0.08 });
    expect(dos.ag_m2).toBeCloseTo(una.ag_m2, 10);
    expect(dos.lg_m).toBeGreaterThan(una.lg_m);
    expect(dos.uh_W_m2K).toBeCloseTo(1.989, 3);
  });

  it("a un hueco no se le aplican fRsi ni Glaser", () => {
    const r = calcHE1({
      zonaClimatica: "C",
      claseHigrometria: "clase_3_o_inferior",
      tempExteriorEnero_C: 7.8,
      hrExterior_pct: 78,
      cerramientos: [
        { id: "v", nombre: "V", tipoElemento: "hueco", direccionFlujo: "horizontal", capas: [], hueco: { ancho_m: 1.2, alto_m: 1.4, hojas: 2, ug_W_m2K: 2.7, uf_W_m2K: 1.8, psi_W_mK: 0.06 } },
      ],
    }).porCerramiento[0];
    expect(r.fRsiAplica).toBe(false);
    expect(r.glaserAplica).toBe(false);
    expect(r.cumpleFRsi).toBe(true);
    expect(r.estado).toBe("fail"); // por la U, no por fRsi
  });

  it("tabla 3.2: distinto uso 0,95 en C; mismo uso, horizontales 1,35 y verticales 1,20", () => {
    expect(ulimParticionDe("distinto_uso", "horizontal", "C")).toBe(0.95);
    expect(ulimParticionDe("zona_comun", "vertical", "E")).toBe(0.7);
    expect(ulimParticionDe("mismo_uso", "horizontal", "C")).toBe(1.35);
    expect(ulimParticionDe("mismo_uso", "vertical", "C")).toBe(1.2);
  });

  it("cámaras sin ventilar: la tabla 2 interpolada (3 cm vertical = 0,173)", () => {
    expect(rCamaraDe(0.02, "horizontal")).toBe(0.17);
    expect(rCamaraDe(0.03, "horizontal")).toBeCloseTo(0.1733, 4);
    expect(rCamaraDe(0.1, "ascendente")).toBe(0.16);
  });

  it("clima de enero: Cáceres 7,8 °C · 78 % (tabla C.1); más alto que la capital, −1 °C cada 100 m", () => {
    expect(climaEneroDe("Cáceres", 459)).toEqual({ temp_C: 7.8, hr_pct: 78, altitudCapital_m: 459, corregido: false });
    expect(climaEneroDe("Cáceres", 300)?.corregido).toBe(false);
    const alto = climaEneroDe("Cáceres", 759)!;
    expect(alto.temp_C).toBeCloseTo(4.8, 10);
    expect(alto.hr_pct).toBeGreaterThan(78);
    expect(climaEneroDe("Atlántida", 0)).toBeNull();
  });

  it("el espesor mínimo invierte U = b/RT", () => {
    const r = calcHE1({
      zonaClimatica: "C",
      claseHigrometria: "clase_3_o_inferior",
      tempExteriorEnero_C: 7.8,
      hrExterior_pct: 78,
      cerramientos: [
        {
          id: "m",
          nombre: "M",
          tipoElemento: "muro_suelo_exterior",
          direccionFlujo: "horizontal",
          capas: [
            { id: "lp", material: "ladrillo_ceramico_perforado", espesor_m: 0.115 },
            { id: "ais", material: "xps", espesor_m: 0.05 },
          ],
        },
      ],
    }).porCerramiento[0];
    const e = espesorMinimoCapa_m(r, "ais", 0.49)!;
    const r2 = calcHE1({
      zonaClimatica: "C",
      claseHigrometria: "clase_3_o_inferior",
      tempExteriorEnero_C: 7.8,
      hrExterior_pct: 78,
      cerramientos: [
        {
          id: "m",
          nombre: "M",
          tipoElemento: "muro_suelo_exterior",
          direccionFlujo: "horizontal",
          capas: [
            { id: "lp", material: "ladrillo_ceramico_perforado", espesor_m: 0.115 },
            { id: "ais", material: "xps", espesor_m: e },
          ],
        },
      ],
    }).porCerramiento[0];
    expect(r2.u_W_m2K).toBeCloseTo(0.49, 10);
  });
});

describe("la envolvente desde El edificio", () => {
  it("lo que se protege y lo que hay debajo, en los cuatro casos", () => {
    expect(envolventeDe(DEMO)).toEqual({ usos: ["viviendas"], niveles: [1, 2, 3], cubierta: "plana_no_transitable", suelo: { tipo: "local", nivel: 1 } });
    expect(envolventeDe(edificioDeCaso("plurifamiliar")).suelo).toEqual({ tipo: "garaje", nivel: 0 });
    expect(envolventeDe(edificioDeCaso("unifamiliar"))).toMatchObject({ cubierta: "inclinada", suelo: { tipo: "terreno", nivel: 0 } });
    expect(envolventeDe(edificioDeCaso("oficinas"))).toMatchObject({ usos: ["oficinas"], niveles: [1, 2], suelo: { tipo: "local" } });
  });
});

describe("justificarHe1 · el Demo (Cáceres, zona C)", () => {
  const j = justificar();

  it("cumple sin nada por revisar, con la propuesta habitual", () => {
    expect(j.veredicto).toBe("ok");
    expect(j.avisos).toEqual([]);
    expect(j.clima).toMatchObject({ provincia: "Cáceres", temp_C: 7.8, hr_pct: 78, corregido: false });
    expect(j.propuesta.decisiones).toEqual({
      aislanteFachada_mm: 60,
      aislanteFachadaPB_mm: null,
      local: "no_habitable",
      higrometria: "clase_3_o_inferior",
      vidrio: "bajo_emisivo",
      aislanteCubierta_mm: 100,
      aislanteSuelo_mm: 60,
    });
    expect(j.propuesta.minimos).toEqual({ fachada: 50, cubierta: 70, suelo: 30 });
    expect(j.elementos.map((e) => [e.id, e.veredicto, resultadoLista(e)])).toEqual([
      ["fachada", "ok", "0,40 ≤ 0,49"],
      ["cubierta", "ok", "0,29 ≤ 0,40"],
      ["suelo", "ok", "0,43 ≤ 0,70"],
      ["ventanas", "ok", "1,99 ≤ 2,10"],
      ["superficial", "ok", "fRsi 0,90 ≥ 0,56"],
      ["intersticial", "ok", "no hay"],
      ["hulc", "fuera", "HULC"],
    ]);
  });

  it("la frase, la franja de la fachada y «Qué entra»", () => {
    expect(fraseHe1(j)).toBe(
      "Todos los elementos de la envolvente están por debajo de los límites de zona C y no hay condensaciones. El coeficiente global se justifica con HULC.",
    );
    const f = franjaDe(cerramientoDe(j, "fachada"), j, "ok");
    expect(f.titulo).toBe("Enfoscado + LP ½ pie + cámara + aislante + LHD 7 + enlucido");
    expect(f.manda).toBe("El aislante: con 60 mm de XPS se lleva el 71 % de la resistencia del muro. Cumple desde 50 mm.");
    const filas = filasQueEntraHe1(j, "C4", estadosElementos(j.elementos, j.avisos, []));
    expect(filas.map((x) => [x.titulo, x.trato])).toEqual([
      ["Zona climática", "C4"],
      ["Envolvente", "4 cerramientos"],
      ["Fachada", "0,40 / 0,49"],
      ["Cubierta", "0,29 / 0,40"],
      ["Forjado sobre el local", "0,43 / 0,70"],
      ["Ventanas", "1,99 / 2,10"],
    ]);
  });

  it("el local como otra unidad de uso: partición entre usos distintos (tabla 3.2)", () => {
    const k = justificar({ local: "otra_unidad" });
    const s = cerramientoDe(k, "suelo").detalle;
    expect(s.r.tipoElemento).toBe("particion_interior");
    expect(s.r.ulim_W_m2K).toBe(0.95);
    expect(s.suelo?.otroLimite).toBe(0.7);
    expect(cerramientoDe(k, "suelo").cita[0]).toBe("HE 1 · ap. 3.2 · tabla 3.2");
  });

  it("la memoria y la ficha", () => {
    const t = textoPlanoMemoria(memoriaHe1(j));
    expect(t).toContain("de las viviendas (P1–P3) frente a los valores límite de la sección HE 1 del DB-HE para la zona climática C de invierno (Cáceres, 459 m)");
    expect(t).toContain("– Ventanas de PVC de tres cámaras con doble 4/16/4 bajo emisivo (Ug 1,6, Uf 1,8, Ψ 0,08, fracción de marco 25 %): UH = 1,99 W/m²K ≤ 2,10.");
    expect(t).toContain("con 7,8 °C y 78 % en el exterior (DA DB-HE/2, tabla C.1)");
    const f = toFichaData(j, { estado: he1EstadoDefaults, edificio: DEMO, revisados: [], svg: tamanoDibujoHe1() });
    expect(f.edicionDB).toBe("DB-HE (consolidado 14-06-2022)");
    expect(f.datosPartida.find((d) => d.concepto === "Clima exterior de enero")).toMatchObject({ valor: "7,8 °C · 78 %" });
    expect(f.datosPartida.find((d) => d.concepto === "Marco")?.valor).toMatch(/^PVC de tres cámaras · Uf 1,8/);
    expect(f.verificaciones).toHaveLength(7);
    expect(f.svg?.elementId).toBe(HE1_PDF_SVG_ID);
  });
});

describe("justificarHe1 · lo que no cumple y su arreglo", () => {
  it("fachada con 30 mm y vidrio 4/16/4: dos incumplimientos con su cambio", () => {
    const j = justificar({ aislanteFachada_mm: 30, vidrio: "doble" });
    expect(j.veredicto).toBe("fail");
    expect(fraseHe1(j)).toBe(
      "Cubierta y forjado sobre el local cumplen. La fachada no, con 30 mm de aislante. Las ventanas no: con vidrio sin capa bajo emisiva pasan del límite de zona C. Arriba tienes el cambio que lo arregla.",
    );
    expect(textoIncumplimiento(cerramientoDe(j, "fachada"), j)).toEqual({
      titulo: "La fachada no cumple",
      detalle: "Con 30 mm de XPS, U 0,62 > 0,49. Cumple desde 50 mm.",
      cambio: { etiqueta: "Poner 50 mm", aplicar: { aislanteFachada_mm: 50 } },
    });
    expect(textoIncumplimiento(cerramientoDe(j, "ventanas"), j)?.cambio).toEqual({
      etiqueta: "Cambiar a bajo emisivo",
      aplicar: { vidrio: "habitual" },
    });
  });

  it("clase 5 en zona D: manda la condensación superficial y la propuesta la cumple", () => {
    const j = justificar({ zonaClimatica: "D", higrometria: "clase_5" }, DEMO, { provincia: "Madrid", altitud_m: 655 });
    const f = cerramientoDe(j, "fachada").detalle;
    expect(f.manda).toEqual({ u: expect.closeTo(0.4, 10), por: "fRsi" });
    expect(j.elementos.find((e) => e.id === "superficial")?.veredicto).toBe("ok");
    const sin = justificar({ zonaClimatica: "D", higrometria: "clase_5", aislanteFachada_mm: 40 }, DEMO, { provincia: "Madrid", altitud_m: 655 });
    const sup = sin.elementos.find((e) => e.id === "superficial")!;
    expect(sup.veredicto).toBe("fail");
    expect(textoIncumplimiento(sup, sin)?.cambio?.etiqueta).toMatch(/^Poner \d+ mm$/);
  });

  it("zona E: la propuesta sube el aislante y el vidrio pasa a bajo emisivo + borde cálido", () => {
    const j = justificar({ zonaClimatica: "E" }, DEMO, { provincia: "Burgos", altitud_m: 929 });
    expect(j.veredicto).toBe("ok");
    expect(j.propuesta.decisiones.aislanteFachada_mm).toBe(70);
    expect(j.propuesta.decisiones.vidrio).toBe("bajo_emisivo_plus");
  });

  it("sin provincia en La obra: cota del lado seguro y aviso", () => {
    const j = justificar({}, DEMO, {});
    expect(j.clima).toBeNull();
    expect(j.avisos.map((a) => a.id)).toEqual(["clima-sin-dato"]);
    expect(j.resultado.tempExteriorEnero_C).toBe(0);
    expect(j.resultado.hrExterior_pct).toBe(100);
    expect(textoAviso(j.avisos[0], j).titulo).toBe("Falta el clima de enero de la obra.");
  });
});

describe("el dibujo", () => {
  const j = justificar();

  it("lo seleccionado elige la vista; la condensación y HULC, en la fachada", () => {
    expect(vistaDe("cubierta")).toBe("cubierta");
    expect(vistaDe("superficial")).toBe("fachada");
    expect(vistaDe("hulc")).toBe("fachada");
  });

  it("la fachada a escala: seis capas, 305 mm y la curva de temperaturas que baja", () => {
    const g = calcularDibujoHe1(j, "fachada");
    if (g.tipo !== "muro") throw new Error("no es la fachada");
    expect(g.capas.map((c) => c.espesor_mm)).toEqual([15, 70, 60, 30, 115, 15]);
    expect(g.cota.texto).toBe("305 mm");
    const ys = g.curva.split(" ").map((p) => Number(p.split(",")[1]));
    for (let i = 1; i < ys.length; i++) expect(ys[i]).toBeGreaterThanOrEqual(ys[i - 1]);
    expect(g.condensa).toEqual([]);
  });

  it("cubierta, suelo y ventana; las etiquetas dentro del dibujo", () => {
    const c = calcularDibujoHe1(j, "cubierta");
    expect(c.tipo).toBe("horizontal");
    if (c.tipo === "horizontal") expect(c.capas[0]).toMatchObject({ patron: "grava", computa: false });
    const s = calcularDibujoHe1(j, "suelo");
    if (s.tipo === "horizontal") expect(s.abajo).toBe("LOCAL SIN USO · PB · NO HABITABLE");
    const v = calcularDibujoHe1(j, "ventanas");
    if (v.tipo === "ventana") expect(v.vidrios).toHaveLength(2);
    const { nativeW, nativeH } = tamanoDibujoHe1();
    for (const g of [calcularDibujoHe1(j, "fachada"), c, s, v]) {
      for (const e of g.etiquetas) {
        expect(e.x).toBeGreaterThan(0);
        expect(e.x).toBeLessThan(nativeW);
        expect(e.y).toBeLessThan(nativeH);
      }
    }
  });
});
