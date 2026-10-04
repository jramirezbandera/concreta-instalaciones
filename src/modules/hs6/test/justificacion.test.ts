import { describe, expect, it } from "vitest";
import { estadosElementos } from "../../../lib/cte/estados";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { hs6EstadoDefaults, type Hs6Estado } from "../estado";
import { filasQueEntraHs6 } from "../entra";
import { toFichaData } from "../ficha";
import { justificarHs6 } from "../justificacion";
import { memoriaHs6 } from "../memoria";
import { decisionesHabitualesHs6, resolverDecisionesHs6 } from "../proteccion";
import { calcularSeccionHs6, SECCION_HS6, tamanoDibujoHs6, zonasPbDe } from "../seccion";
import { HS6_PDF_SVG_ID } from "../svg-meta";
import { franjaDe, fraseHs6, metricasHs6, resultadoLista, textoAviso } from "../textos";

// =============================================================================
// La justificación de HS6 (feature-15): qué toca el terreno según El edificio,
// las medidas por zona y decisión, los textos, la memoria, la ficha y la
// geometría del dibujo.
// =============================================================================

const DEMO = edificioDeCaso("plurifamiliar_locales");

function justificar(parcial: Partial<Hs6Estado> = {}, e: Edificio = DEMO) {
  return justificarHs6({ ...hs6EstadoDefaults, municipio: "Cáceres", ...parcial }, e);
}

function el(j: ReturnType<typeof justificarHs6>, id: string) {
  const x = j.elementos.find((e) => e.id === id);
  if (!x) throw new Error(`no existe ${id}`);
  return x;
}

/** El Demo con un sótano más pequeño que la planta baja: parte de ella apoya en el terreno. */
function demoConPbSinSotano(): Edificio {
  const e = edificioDeCaso("plurifamiliar_locales");
  const s1 = e.grupos.find((g) => g.nivelInicial === -1)!;
  s1.zonas[0].superficieUtil_m2 = 100;
  return e;
}

describe("justificarHs6 · plurifamiliar con locales (el Demo), zona II", () => {
  const j = justificar();

  it("cumple: barrera bajo el sótano, el garaje como espacio de contención y el núcleo por revisar", () => {
    expect(j.veredicto).toBe("ok");
    expect(j.elementos.map((e) => [e.id, e.veredicto])).toEqual([
      ["zona", "dato"],
      ["barrera", "ok"],
      ["contencion-garaje", "ok"],
      ["nucleo", "ok"],
      ["no-tocan", "dato"],
    ]);
    expect(j.avisos.map((a) => a.id)).toEqual(["nucleo-garaje"]);
    expect(j.proteccion.sobreNoHabitable).toMatchObject({
      nivel: -1,
      usosProtegidos: ["local_sin_uso", "zona_comun"],
      superficie_m2: 195,
      conGaraje: true,
    });
    expect(j.proteccion.sobreTerreno).toEqual([]);
  });

  it("la barrera pide la lámina tipo: 2 mm y difusión menor que 1e-11 m²/s", () => {
    const b = el(j, "barrera");
    expect(b.valor).toEqual({ valor: 2, unidad: "mm" });
    expect(b.detalle).toMatchObject({ donde: ["solera_sotano"], via: "lamina_tipo", coefLimite_m2_s: 1e-11 });
    expect(resultadoLista(b)).toBe("≥ 2 mm · < 10⁻¹¹ m²/s");
  });

  it("la frase, las métricas y la franja", () => {
    expect(fraseHs6(j)).toBe(
      "Cáceres está en zona II: barrera de protección y, además, un espacio de contención ventilado. Bajo el local y el portal, ese espacio es el propio garaje.",
    );
    expect(metricasHs6(j)).toBe("zona II · barrera · garaje ventilado");
    const estados = estadosElementos(j.elementos, j.avisos, []);
    expect(estados.nucleo).toBe("rv");
    const f = franjaDe(el(j, "barrera"), j, "ok");
    expect(f.titulo).toBe("Lámina bajo la solera y en los muros del sótano");
    expect(f.filas?.map((r) => r.k)).toContain("Puertas que la interrumpan");
    expect(textoAviso(j.avisos[0]).titulo).toBe("La escalera y el ascensor bajan al garaje.");
  });

  it("«Qué entra»: el municipio, el garaje, lo que protege y lo que no toca", () => {
    const filas = filasQueEntraHs6(j, estadosElementos(j.elementos, j.avisos, []));
    expect(filas.map((f) => [f.titulo, f.trato])).toEqual([
      ["Municipio", "zona II"],
      ["Garaje", "contención"],
      ["Local y portal", "se protege"],
      ["Viviendas", "sin contacto"],
    ]);
  });

  it("la memoria redacta la zona, la barrera, el garaje y las plantas altas", () => {
    const t = textoPlanoMemoria(memoriaHs6(j));
    expect(t).toContain("El edificio se sitúa en Cáceres, clasificado en zona II en el apéndice B");
    expect(t).toContain("lámina de al menos 2 mm");
    expect(t).toContain("Bajo el garaje, la barrera se dispone bajo la solera y en los muros");
    expect(t).toContain("Bajo el local y el portal, el espacio de contención es el propio garaje");
    expect(t).toContain("Las plantas P1–P3 (viviendas) no están en contacto con el terreno");
  });

  it("la ficha: datos de partida con su origen, una verificación por elemento y el dibujo", () => {
    const f = toFichaData(j, { estado: { ...hs6EstadoDefaults, municipio: "Cáceres" }, edificio: DEMO, revisados: [], svg: tamanoDibujoHs6() });
    expect(f.edicionDB).toBe("DB-HS6 (consolidado 14-06-2022)");
    expect(f.datosPartida.find((d) => d.concepto === "Zona de radón")).toMatchObject({
      valor: "Zona II",
      origen: "Apéndice B del DB-HS (dato del proyectista)",
    });
    expect(f.verificaciones.map((v) => [v.concepto, v.estado])).toEqual([
      ["Zona de radón", "neutral"],
      ["Barrera de protección", "ok"],
      ["El garaje, espacio de contención", "ok"],
      ["Escalera y ascensor", "ok"],
      ["Plantas altas", "neutral"],
    ]);
    expect(f.verificaciones[1]).toMatchObject({ valor: "lámina tipo", limite: "≥ 2 mm · < 10⁻¹¹ m²/s" });
    expect(f.observaciones?.[0]).toMatch(/Pendiente de revisar\.$/);
    expect(f.svg?.elementId).toBe(HS6_PDF_SVG_ID);
  });
});

describe("justificarHs6 · las decisiones", () => {
  it("con la barrera en el forjado, esta deja el núcleo fuera y se interrumpe en él", () => {
    const j = justificar({ posicionBarrera: "forjado" });
    expect(el(j, "barrera").detalle).toMatchObject({ donde: ["forjado_pb"] });
    const g = calcularSeccionHs6(j, zonasPbDe(DEMO));
    expect(g.nucleo).not.toBeNull();
    expect(g.barrera?.d).toBe(
      `M${g.sotano!.x0} ${SECCION_HS6.Y_PB_SUELO - 3}H${g.nucleo!.x0}M${g.nucleo!.x1} ${SECCION_HS6.Y_PB_SUELO - 3}H${g.sotano!.x1}`,
    );
  });

  it("en zona I basta la barrera: sin contención ni núcleo", () => {
    const j = justificar({ zona: "I" });
    expect(j.elementos.map((e) => e.id)).toEqual(["zona", "barrera", "no-tocan"]);
    expect(j.avisos).toEqual([]);
    expect(fraseHs6(j)).toBe("Cáceres está en zona I: basta la barrera de protección.");
  });

  it("en zona I con cámara, el garaje ventilado es protección análoga (criterio)", () => {
    const j = justificar({ zona: "I", medidaTerreno: "camara" });
    expect(j.elementos.map((e) => e.id)).toEqual(["zona", "contencion-garaje", "nucleo", "no-tocan"]);
    expect(el(j, "contencion-garaje").veredicto).toBe("criterio");
  });

  it("la barrera por cálculo queda fuera de la verificación", () => {
    const j = justificar({ viaBarrera: "calculo" });
    expect(el(j, "barrera").veredicto).toBe("fuera");
    expect(resultadoLista(el(j, "barrera"))).toBe("por cálculo, aparte");
    expect(j.veredicto).toBe("ok");
  });

  it("lo habitual depende de la zona, y una medida de la otra zona vuelve a lo habitual", () => {
    expect(decisionesHabitualesHs6("II")).toEqual({ posicionBarrera: "solera", medidaTerreno: "camara", viaBarrera: "lamina_tipo" });
    expect(decisionesHabitualesHs6("I").medidaTerreno).toBe("barrera");
    expect(
      resolverDecisionesHs6({ posicionBarrera: "habitual", medidaTerreno: "despresurizacion", viaBarrera: "habitual" }, "I").medidaTerreno,
    ).toBe("barrera");
  });
});

describe("justificarHs6 · otros edificios", () => {
  it("unifamiliar en zona II: barrera y cámara ventilada con 10 cm² por metro de perímetro", () => {
    const j = justificar({}, edificioDeCaso("unifamiliar"));
    expect(j.elementos.map((e) => e.id)).toEqual(["zona", "barrera", "camara", "no-tocan"]);
    const c = el(j, "camara");
    // 75 m² → perímetro 4·√75 = 34,6 m → 346 cm².
    expect(c.valor).toEqual({ valor: 10 * 4 * Math.sqrt(75), unidad: "cm²" });
    expect(resultadoLista(c)).toBe("346 cm² de aberturas");
    const t = textoPlanoMemoria(memoriaHs6(j));
    expect(t).toContain("La planta P1 (vivienda) no está en contacto con el terreno y no necesita medidas propias.");
  });

  it("unifamiliar con despresurización: la red de captación sustituye a la cámara", () => {
    const j = justificar({ medidaTerreno: "despresurizacion" }, edificioDeCaso("unifamiliar"));
    expect(j.elementos.map((e) => e.id)).toEqual(["zona", "barrera", "despresurizacion", "no-tocan"]);
    expect(fraseHs6(j)).toContain("una red de captación con extracción mecánica");
  });

  it("si la planta baja excede el sótano, esa parte apoya en el terreno y se dibuja a la izquierda", () => {
    const e = demoConPbSinSotano();
    const j = justificar({}, e);
    expect(j.proteccion.sobreTerreno).toEqual([
      expect.objectContaining({ nivel: 0, parcial: true, superficie_m2: 45 }),
    ]);
    expect(j.elementos.map((x) => x.id)).toEqual(["zona", "barrera", "contencion-garaje", "camara", "nucleo", "no-tocan"]);
    const g = calcularSeccionHs6(j, zonasPbDe(e));
    expect(g.terreno).toMatchObject({ x0: SECCION_HS6.X0, texto: "sin sótano debajo" });
    expect(g.sotano!.x0).toBe(g.terreno!.x1);
    // El núcleo cae siempre sobre el sótano.
    expect(g.nucleo!.x0).toBeGreaterThanOrEqual(g.sotano!.x0);
    expect(g.nucleo!.x1).toBeLessThanOrEqual(g.sotano!.x1);
  });

  it("oficinas: el núcleo está en el vestíbulo y los rótulos se apartan de él", () => {
    const e = edificioDeCaso("oficinas");
    const j = justificar({}, e);
    const g = calcularSeccionHs6(j, zonasPbDe(e));
    const vestibulo = g.zonasPb.find((z) => z.texto === "Vestíbulo")!;
    expect(g.nucleo!.x0).toBeGreaterThanOrEqual(vestibulo.x0);
    expect(vestibulo.xTexto).toBeGreaterThan(g.nucleo!.x1);
    expect(g.sotano!.xRotulo).toBeGreaterThan(g.nucleo!.x1);
  });

  it("sin exigencia: solo la zona, sin medidas ni decisiones", () => {
    const j = justificar({ zona: "sin_exigencia" });
    expect(j.proteccion.aplica).toBe(false);
    expect(j.elementos.map((e) => e.id)).toEqual(["zona"]);
    expect(metricasHs6(j)).toBe("sin exigencia");
    expect(textoPlanoMemoria(memoriaHs6(j))).toContain(
      "El edificio se sitúa en Cáceres, que no figura en el apéndice B de la sección HS 6 del DB-HS: la sección no se aplica.",
    );
  });

  it("la geometría es determinista y cabe en el tamaño nativo", () => {
    for (const caso of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as const) {
      const e = edificioDeCaso(caso);
      const j = justificar({}, e);
      const a = calcularSeccionHs6(j, zonasPbDe(e));
      expect(calcularSeccionHs6(j, zonasPbDe(e))).toEqual(a);
      for (const et of a.etiquetas) {
        expect(et.x, `${caso} · ${et.key}`).toBeGreaterThan(0);
        expect(et.x, `${caso} · ${et.key}`).toBeLessThan(tamanoDibujoHs6().nativeW);
        expect(et.y, `${caso} · ${et.key}`).toBeLessThan(tamanoDibujoHs6().nativeH);
      }
    }
  });
});
