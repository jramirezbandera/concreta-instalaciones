import { describe, it, expect } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { filasQueEntraHs1 } from "../entra";
import { hs1EstadoDefaults, type Hs1Estado } from "../estado";
import { toFichaData } from "../ficha";
import { justificarHs1, obraHs1De, type JustificacionHs1, type ObraHs1 } from "../justificacion";
import { memoriaHs1 } from "../memoria";
import { calcularSeccionHs1 } from "../seccion";
import { franjaDe, fraseHs1, metricasHs1, textoAviso, textoEtiqueta, textoIncumplimiento } from "../textos";

// =============================================================================
// HS1 (feature-17) — Lo que se lee: la frase, la franja, «Qué entra», los
// avisos, la memoria, la ficha y la geometría del dibujo.
// =============================================================================

const demo = () => {
  const p = crearProyectoDemo("2026-01-01T00:00:00.000Z");
  return { p, j: justificarHs1(hs1EstadoDefaults, p.edificio, obraHs1De(p.datosGenerales)) };
};
const est = (d: Partial<Hs1Estado> = {}): Hs1Estado => ({ ...hs1EstadoDefaults, ...d });
const OBRA: ObraHs1 = {
  zonaPluviometricaHs1: "III",
  zonaEolica: "A",
  terrenoTipo: "IV",
  nivelFreatico: { tipo: "profundidad", profundidad_m: 4.5 },
  permeabilidadTerreno: "medio",
  cotaAlcantarillado_m: -1.2,
};
const el = (j: JustificacionHs1, id: string) => j.elementos.find((e) => e.id === id)!;

describe("la cabecera", () => {
  it("la frase y las métricas del Demo", () => {
    const { j } = demo();
    expect(fraseHs1(j)).toBe(
      "Grado 1 en los muros del sótano, 2 en el suelo del sótano y 5 en las fachadas. La cubierta tiene grado único, con pendiente del 1 al 5 %.",
    );
    expect(metricasHs1(j)).toBe("muro G1 · suelo G2 · fachada G5");
  });

  it("con algo que no vale, la frase lo dice y propone el arreglo", () => {
    const j = justificarHs1(est({ muroTipo: "gravedad", muroImper: "interior" }), edificioDeCaso("plurifamiliar_locales"), {
      ...OBRA,
      nivelFreatico: { tipo: "profundidad", profundidad_m: 1 },
    });
    expect(fraseHs1(j)).toBe(
      "La tabla 2.2 no admite un muro de gravedad impermeabilizado por el interior con grado 5 (casilla sombreada de la tabla 2.2). Vale un muro de gravedad impermeabilizado por el exterior.",
    );
    expect(textoIncumplimiento(el(j, "muro"))?.titulo).toBe("Muro de gravedad impermeabilizado por el interior: no vale con grado 5.");
    expect(textoEtiqueta(el(j, "muro"))).toBe("grado 5 · no vale");
  });
});

describe("la franja", () => {
  it("el terreno con el freático medido", () => {
    const j = justificarHs1(est(), edificioDeCaso("plurifamiliar_locales"), OBRA);
    const f = franjaDe(el(j, "terreno"), j, "dt");
    // Cara inferior −3,30; freático −4,50: por encima.
    expect(f.manda).toBe("La cara inferior del suelo del sótano (−3,30) queda por encima del nivel freático (−4,50): presencia baja.");
    expect(f.filas).toEqual([
      { k: "Nivel freático", v: "−4,50 · medio anual" },
      { k: "Cara inferior del suelo", v: "−3,30" },
      { k: "Bajo el freático", v: "no (por encima)" },
      { k: "Permeabilidad", v: "10⁻⁵ < Ks < 10⁻² cm/s" },
    ]);
  });

  it("el muro: lo que manda y una fila por condición", () => {
    const { j } = demo();
    const f = franjaDe(el(j, "muro"), j, "ok");
    expect(f).toMatchObject({ titulo: "Muro flexorresistente impermeabilizado por el exterior", valor: "Grado 1", unidad: "I2+I3+D1+D5" });
    expect(f.filas.slice(3)).toEqual([
      { k: "I2", v: "Pintura impermeabilizante" },
      { k: "I3", v: "Revestimiento interior hidrófugo · si el muro es de fábrica" },
      { k: "D1", v: "Capa drenante y filtrante" },
      { k: "D5", v: "Evacuación de la lluvia" },
    ]);
  });

  it("la fachada del Demo: la zona eólica sin indicar no influye", () => {
    const { j } = demo();
    const f = franjaDe(el(j, "fachada"), j, "rv");
    expect(f.manda).toContain("a esta altura la zona eólica no influye");
    expect(f.filas).toContainEqual({ k: "Zona pluviométrica", v: "I (supuesta)" });
    expect(f.filas).toContainEqual({ k: "Zona eólica", v: "sin indicar · no influye" });
    expect(f.nota).toContain("precerco");
  });

  it("la cubierta: la pendiente y los elementos que exige", () => {
    const { j } = demo();
    const f = franjaDe(el(j, "cubierta"), j, "ok");
    expect(f).toMatchObject({ titulo: "Cubierta plana no transitable, invertida, con grava", valor: "1–5 %", unidad: "de pendiente" });
    expect(f.filas.map((x) => x.k)).toEqual(["a)", "d)", "f)", "h)", "i)", "k)"]);
  });
});

describe("«Qué entra» y los avisos", () => {
  it("las filas del Demo", () => {
    const { j } = demo();
    expect(filasQueEntraHs1(j, {}).map((f) => [f.titulo, f.detalle, f.trato])).toEqual([
      ["Terreno", "freático no detectado hasta 10 m", "presencia baja"],
      ["Muros del sótano", "S1 · 3 m enterrados", "grado 1"],
      ["Suelo del sótano", "S1 · −3,00 · 470 m²", "grado 2"],
      ["Fachadas", "13 m de coronación · V3", "grado 5"],
      ["Cubierta", "plana no transitable · 210 m²", "1–5 %"],
    ]);
  });

  it("el aviso del clima nombra solo lo supuesto que influye", () => {
    const { j } = demo();
    expect(textoAviso(j.avisos[0]).titulo).toBe("Faltan datos del clima: se ha supuesto zona pluviométrica I.");
  });
});

describe("la memoria", () => {
  it("un párrafo por elemento y uno por condición, con la tabla resumen", () => {
    const { j } = demo();
    const m = memoriaHs1(j);
    const t = textoPlanoMemoria(m);
    expect(m.norma).toBe("DB-HS 1");
    expect(t).toContain("Los muros del sótano son flexorresistentes, impermeabilizados por el exterior.");
    expect(t).toContain("I3 — Si el muro es de fábrica: revestimiento hidrófugo por la cara interior");
    expect(t).toContain("El suelo del sótano (470 m²) es una solera sin intervención en el terreno.");
    expect(t).toContain("en un entorno E1 (terreno tipo IV); con esa altura la zona eólica no influye");
    expect(t).toContain("La cubierta es plana no transitable, invertida, con grava.");
    expect(m.tabla?.filas).toEqual([
      ["Muros del sótano", "1", "muro flexorresistente impermeabilizado por el exterior", "I2+I3+D1+D5"],
      ["Suelo del sótano", "2", "solera sin intervención en el terreno", "C2+C3+D1"],
      ["Fachadas", "5", "con revestimiento exterior", "R3+C1"],
      ["Cubierta", "único", "plana no transitable, invertida, con grava", "pendiente del 1 al 5 %"],
    ]);
    expect(m.fuente).toContain("tablas 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7 y 2.9");
  });

  it("con drenaje y bombeo, los dimensiona", () => {
    const j = justificarHs1(est(), edificioDeCaso("plurifamiliar_locales"), { ...OBRA, nivelFreatico: { tipo: "profundidad", profundidad_m: 2 } });
    // Cara inferior −3,30 bajo un freático a −2,00: 1,30 m, presencia media; Ks medio → muro 2, suelo 4.
    // El D3 del suelo lleva el tubo del muro al grado mayor de los dos (criterio): Ø200.
    const t = textoPlanoMemoria(memoriaHs1(j));
    expect(t).toContain("El tubo drenante del arranque del muro tiene un diámetro nominal de al menos 200 mm");
    expect(t).toContain("Los tubos drenantes bajo el suelo tienen un diámetro nominal de al menos 150 mm");
    expect(t).toContain("Los pozos drenantes se vacían con una cámara de bombeo");
    expect(t).toContain("una cámara de bombeo con dos bombas de achique");
  });
});

describe("la ficha", () => {
  it("los datos de partida de la ficha de HS1 con su origen", () => {
    const { p, j } = demo();
    const f = toFichaData(j, { estado: hs1EstadoDefaults, edificio: p.edificio, revisados: [], svg: { nativeW: 640, nativeH: 400 } });
    const dato = (c: string) => f.datosPartida.find((d) => d.concepto === c);
    expect(dato("Zona pluviométrica de promedios")).toEqual({ concepto: "Zona pluviométrica de promedios", valor: "I", origen: "Supuesto del lado de la seguridad (falta el dato)" });
    expect(dato("Clase del entorno")?.valor).toBe("E1 (terreno tipo IV)");
    expect(dato("Zona eólica")).toEqual({ concepto: "Zona eólica", valor: "Sin indicar", origen: "No influye en la tabla 2.6 con esta altura" });
    expect(dato("Grado de exposición al viento")?.valor).toBe("V3");
    expect(f.verificaciones.map((v) => [v.concepto, v.limite, v.estado])).toEqual([
      ["El terreno", "—", "neutral"],
      ["Muros del sótano", "grado 1", "ok"],
      ["Suelo del sótano", "grado 2", "ok"],
      ["Fachadas", "grado 5", "ok"],
      ["Cubierta", "ap. 2.4.2", "ok"],
    ]);
    expect(f.observaciones?.[0]).toMatch(/^Faltan datos del clima.*Pendiente de revisar\.$/);
    expect(f.slug).toBe("hs1-humedad");
  });
});

describe("el dibujo", () => {
  it("las anclas dentro del viewBox y el freático en su sitio", () => {
    const e = edificioDeCaso("plurifamiliar_locales");
    const j = justificarHs1(est(), e, OBRA);
    const s = calcularSeccionHs1(j, e);
    for (const a of s.etiquetas) {
      expect(a.x, a.key).toBeGreaterThan(0);
      expect(a.x, a.key).toBeLessThan(s.ancho);
      expect(a.y, a.key).toBeGreaterThan(0);
      expect(a.y, a.key).toBeLessThan(s.alto);
    }
    expect(s.etiquetas.map((a) => a.elementoId).sort()).toEqual(j.elementos.map((x) => x.id).sort());
    // El freático (−4,50) queda bajo el suelo del sótano (−3,00).
    expect(s.freatico!.y).toBeGreaterThan(s.yFondoEdificio);
    expect(s.muro?.imper?.tipo).toBe("exterior");
  });

  it("unifamiliar: sin muro, cubierta a dos aguas, cámara si el suelo es elevado", () => {
    const e = edificioDeCaso("unifamiliar");
    const j = justificarHs1(est({ sueloTipo: "elevado" }), e, OBRA);
    const s = calcularSeccionHs1(j, e);
    expect(s.muro).toBeNull();
    expect(s.cubierta.inclinada).toBe(true);
    expect(s.camara).not.toBeNull();
  });
});
