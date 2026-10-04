import { describe, expect, it } from "vitest";
import { estadosElementos } from "../../../lib/cte/estados";
import { textoParrafo, textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import { hs3EstadoDefaults, type Hs3Estado } from "../estado";
import { toFichaData } from "../ficha";
import { justificarHs3 } from "../justificacion";
import { memoriaHs3 } from "../memoria";
import { calcularDibujoHs3, tamanoDibujoHs3 } from "../planta";
import { franjaDe, fraseHs3, resultadoLista, textoAviso, textoEtiqueta } from "../textos";

// =============================================================================
// La justificación de HS3 (feature-15): elementos por parte, el contrato, los
// textos, la memoria, la ficha y los dibujos, sobre el edificio del Demo.
// =============================================================================

const DEMO = edificioDeCaso("plurifamiliar_locales");

function justificar(parcial: Partial<Hs3Estado> = {}, e = DEMO) {
  return justificarHs3({ ...hs3EstadoDefaults, ...parcial }, e);
}

function el(j: ReturnType<typeof justificarHs3>, id: string) {
  const x = j.elementos.find((e) => e.id === id);
  if (!x) throw new Error(`no existe ${id}`);
  return x;
}

describe("justificarHs3 · plurifamiliar con locales (el Demo)", () => {
  const j = justificar();

  it("cumple, con una parte por vivienda tipo y otra para el garaje y los trasteros", () => {
    expect(j.veredicto).toBe("ok");
    expect(j.partes).toEqual([
      { id: "a", nombre: "Vivienda A · T3" },
      { id: "b", nombre: "Vivienda B · T2" },
      { id: "garaje", nombre: "Garaje y trasteros" },
    ]);
    expect(j.elementos.filter((e) => e.parte === "a").map((e) => e.id)).toEqual([
      "a-dorm-pral",
      "a-dorm-2",
      "a-dorm-3",
      "a-salon",
      "a-cocina",
      "a-bano-1",
      "a-bano-2",
      "a-campana",
      "a-paso",
      "a-equilibrio",
      "a-conductos",
    ]);
    expect(j.elementos.filter((e) => e.parte === "garaje").map((e) => e.id)).toEqual([
      "garaje-s1",
      "garaje-s1-aberturas",
      "garaje-s1-co",
      "trasteros-s1",
    ]);
    expect(j.avisos).toEqual([]);
  });

  it("el salón: el mínimo de la tabla y lo que manda el equilibrio", () => {
    const s = el(j, "a-salon");
    expect(s.limite).toEqual({ valor: 10, unidad: "l/s" });
    expect(s.manda).toEqual({ tipo: "equilibrado", entra: 26, sale: 33 });
    expect("valor" in s.valor && s.valor.valor).toBeCloseTo(12.69, 2);
  });

  it("las aberturas salen del caudal adoptado; el paso, por puerta", () => {
    const calc = j.porTipo.get("A")!;
    const salon = calc.porEstancia.find((e) => e.id === "salon")!;
    expect(salon.areaAbertura_cm2).toBeCloseTo(4 * (10 * 33) / 26);
    expect(salon.areaPaso_cm2).toBeCloseTo(8 * (10 * 33) / 26);
    expect(calc.porEstancia.find((e) => e.id === "dorm-2")!.areaPaso_cm2).toBe(70);
  });

  it("conductos mecánicos: S ≥ 2,5·qvt y el Ø que la cubre", () => {
    const c = el(j, "a-conductos");
    expect(c.manda).toEqual({ tipo: "formula", formula: "S ≥ 2,5·qvt", resultado: { valor: 82.5, unidad: "cm²" } });
    expect(c.valor).toEqual({ valor: 110, unidad: "mm" });
  });

  it("el garaje: 120 l/s por plaza, 5 + 5 aberturas y detección de CO", () => {
    expect(el(j, "garaje-s1").valor).toEqual({ valor: 1680, unidad: "l/s" });
    expect(el(j, "garaje-s1-aberturas").valor).toEqual({ texto: "5 + 5" });
    const co = el(j, "garaje-s1-co");
    expect(co.detalle.clase === "co" && co.detalle.exigida).toBe(true);
  });
});

describe("justificarHs3 · decisiones y casos", () => {
  it("híbrida: los conductos por las tablas, y el aviso de las dos últimas plantas", () => {
    const j = justificar({ sistema: "hibrida", zonaTermica: "Z" });
    const c = el(j, "a-conductos");
    expect(c.manda.tipo).toBe("capacidad_tabla");
    expect("unidad" in c.valor && c.valor.unidad).toBe("cm²");
    expect(j.avisos.map((a) => a.id)).toEqual(["a-hibrida-ultimas-plantas", "b-hibrida-ultimas-plantas"]);
    expect(textoAviso(j.avisos[0]).titulo).toBe("Las dos últimas plantas, con conducto individual.");
  });

  it("híbrida con más de 6 plantas: el colectivo no cumple", () => {
    const e = edificioDeCaso("plurifamiliar_locales");
    e.grupos[0].repeticiones = 7;
    const j = justificarHs3({ ...hs3EstadoDefaults, sistema: "hibrida" }, e);
    expect(el(j, "a-conductos").veredicto).toBe("fail");
    expect(j.veredicto).toBe("fail");
  });

  it("garaje natural bajo rasante: aviso de las fachadas", () => {
    const j = justificar({ garaje: "natural" });
    expect(j.avisos.map((a) => a.id)).toEqual(["garaje-s1-natural"]);
    expect(el(j, "garaje-s1-aberturas").valor).toEqual({ valor: 14 * 960, unidad: "cm²" });
  });

  it("oficinas: solo el garaje", () => {
    const j = justificar({}, edificioDeCaso("oficinas"));
    expect(j.partes.map((p) => p.id)).toEqual(["garaje"]);
    expect(fraseHs3(j)).toBe(
      "El garaje extrae 1200 l/s con detección de monóxido. Las oficinas, y el local cuando tenga actividad, se ventilan según el RITE.",
    );
  });

  it("unifamiliar: una sola parte de vivienda, ids sin prefijo", () => {
    const j = justificar({}, edificioDeCaso("unifamiliar"));
    expect(j.partes[0]).toEqual({ id: "u", nombre: "Vivienda" });
    expect(j.elementos.some((e) => e.id === "salon")).toBe(true);
  });
});

describe("textos de HS3", () => {
  const j = justificar();
  const estados = estadosElementos(j.elementos, j.avisos, []);

  it("la frase de la cabecera", () => {
    expect(fraseHs3(j)).toBe(
      "Ventilación mecánica: el aire entra por aireadores en dormitorios y salón, cruza por las puertas y sale por cocina y baños hacia la cubierta. El garaje extrae 1680 l/s con detección de monóxido. El local se ventilará según el RITE cuando tenga actividad.",
    );
  });

  it("la franja del salón y la del equilibrio", () => {
    const s = franjaDe(el(j, "a-salon"), j, estados["a-salon"]);
    expect(s.clase).toBe("Entra aire · local seco");
    expect(s.manda).toBe(
      "El equilibrio. Cocina y baños sacan 33 l/s y los secos solo piden 26: todos suben en proporción, × 1,27.",
    );
    expect(s.filas.map((f) => f.k)).toEqual(["Mínimo · tabla 2.1", "Se añade para igualar", "Aireador · 4 × 12,7", "Paso por su puerta"]);
    const e = franjaDe(el(j, "a-equilibrio"), j, "ok");
    expect(e.valor).toBe("33 = 33");
  });

  it("al salón, la franja lo dice como en la maqueta", () => {
    const js = justificar({ equilibrado: "salon" });
    expect(franjaDe(el(js, "a-salon"), js, "ok").manda).toBe(
      "El equilibrio. Cocina y baños sacan 33 l/s; para que entre lo mismo, el salón pasa de 10 a 17.",
    );
  });

  it("la lista y las etiquetas", () => {
    expect(resultadoLista(el(j, "a-salon"))).toBe("10 → 12,7 l/s");
    expect(resultadoLista(el(j, "trasteros-s1"))).toBe("25,2 l/s · con el garaje");
    expect(textoEtiqueta(el(j, "a-campana"))).toBe("+50 campana");
    expect(textoEtiqueta(el(j, "garaje-s1"))).toBe("1680 l/s");
  });
});

describe("memoria y ficha de HS3", () => {
  const j = justificar();

  it("la memoria redacta el sistema, los caudales, las aberturas, los conductos, el garaje y el RITE", () => {
    const m = memoriaHs3(j);
    const t = m.parrafos.map(textoParrafo);
    expect(t[0]).toMatch(/^Las viviendas se ventilan con un sistema mecánico/);
    expect(t[1]).toMatch(/los locales húmedos deben extraer al menos 33 l\/s \(11 l\/s cada uno\)/);
    expect(t[3]).toMatch(/El más cargado de la vertical A, el de la cocina, recoge 3 plantas × 11 = 33 l\/s y necesita 83 cm², un Ø110\./);
    expect(t[4]).toMatch(/Los trasteros, de 36 m², extraen 25,2 l\/s con la ventilación del garaje\./);
    expect(t[5]).toBe("El local sin uso definido se ventilará conforme al RITE cuando se proyecte su actividad.");
    expect(m.tabla.cabecera[0]).toBe("Local · vivienda A");
    expect(textoPlanoMemoria(m)).toMatch(/^Calidad del aire interior\n\n/);
  });

  it("la ficha: una verificación por elemento, criterios rotulados y la edición consolidada", () => {
    const f = toFichaData(j, { estado: hs3EstadoDefaults, edificio: DEMO, revisados: [], svg: tamanoDibujoHs3() });
    expect(f.edicionDB).toBe("DB-HS3 (consolidado 14-06-2022)");
    expect(f.verificaciones).toHaveLength(j.elementos.length);
    expect(f.verificaciones[0].concepto).toBe("Vivienda A · Dormitorio principal");
    expect(f.observaciones?.some((o) => /^Criterio: el mínimo total de los húmedos/.test(o))).toBe(true);
    expect(f.svg).toMatchObject({ elementId: "hs3-svg-pdf", nativeW: 640, nativeH: 520 });
  });
});

describe("dibujos de HS3", () => {
  const j = justificar();

  it("la vivienda A: siete locales y la entrada, aireadores en los secos y las barras cuadran", () => {
    const d = calcularDibujoHs3(j, "a");
    expect(d?.clase).toBe("vivienda");
    if (d?.clase !== "vivienda") return;
    expect(d.recintos.map((r) => r.nombre)).toEqual([
      "Dormitorio principal",
      "Dormitorio 2",
      "Baño 2",
      "Dormitorio 3",
      "Salón-comedor",
      "Cocina",
      "Baño 1",
      "Entrada",
    ]);
    expect(d.admisiones).toHaveLength(4);
    expect(d.extracciones).toHaveLength(3);
    const ancho = (ss: { w: number }[]) => ss.reduce((s, x) => s + x.w, 0);
    expect(ancho(d.entra)).toBeCloseTo(ancho(d.sale), 6);
    for (const e of d.etiquetas) {
      expect(e.x).toBeGreaterThan(0);
      expect(e.x).toBeLessThan(d.ancho);
      expect(e.y).toBeGreaterThan(0);
      expect(e.y).toBeLessThan(d.alto);
    }
  });

  it("el garaje: 14 plazas, 5 rejillas, dos detectores y los trasteros", () => {
    const d = calcularDibujoHs3(j, "garaje");
    if (d?.clase !== "garaje") throw new Error("no es el garaje");
    expect(d.plazas).toHaveLength(14);
    expect(d.rejillas).toHaveLength(5);
    expect(d.co).toHaveLength(2);
    expect(d.trasteros?.texto).toBe("36 m²");
  });

  it("es determinista", () => {
    expect(calcularDibujoHs3(j, "b")).toEqual(calcularDibujoHs3(j, "b"));
  });
});
