import { describe, expect, it } from "vitest";
import { estadosElementos } from "../../../lib/cte/estados";
import { textoParrafo, textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import { hs4EstadoDefaults, type Hs4Estado } from "../estado";
import { toFichaData } from "../ficha";
import { justificarHs4, type ObraHs4 } from "../justificacion";
import { memoriaHs4 } from "../memoria";
import { calcularSeccionHs4, tamanoDibujoHs4 } from "../seccion";
import {
  franjaDe,
  fraseHs4,
  presionGrupoPropuesta,
  resultadoLista,
  textoAviso,
  textoEtiqueta,
  textoIncumplimiento,
} from "../textos";

// =============================================================================
// Textos de HS4 (feature-15): la frase de la cabecera, la franja, la lista, los
// avisos y lo que no cumple, la memoria, la ficha y la geometría del dibujo.
// =============================================================================

const DEMO = edificioDeCaso("plurifamiliar_locales");
const OBRA: ObraHs4 = { presionAcometida_kPa: 250 };

function justificar(parcial: Partial<Hs4Estado> = {}, obra: ObraHs4 = OBRA, e = DEMO) {
  return justificarHs4({ ...hs4EstadoDefaults, ...parcial }, e, obra);
}

function el(j: ReturnType<typeof justificarHs4>, id: string) {
  const x = j.elementos.find((e) => e.id === id);
  if (!x) throw new Error(`no existe ${id}`);
  return x;
}

describe("textos de HS4", () => {
  const j = justificar();
  const estados = estadosElementos(j.elementos, j.avisos, []);

  it("la frase de la cabecera dice la batería, la presión y el grifo más desfavorable", () => {
    expect(fraseHs4(j)).toBe(
      "Batería de 8 contadores en planta baja y un montante por vivienda. Con 250 kPa de red, el grifo más desfavorable —el fregadero de A3— recibe 117 kPa: no hace falta grupo de presión.",
    );
  });

  it("la franja del grifo más desfavorable descompone lo que se come la altura", () => {
    const f = franjaDe(el(j, "presion-p3"), j, estados["presion-p3"]);
    expect(f.clase).toBe("Grifo más desfavorable");
    expect(f.titulo).toBe("Fregadero · vivienda A3");
    expect(f.valor).toBe("117");
    expect(f.manda).toBe("La altura. Subir 11 m se come 108 kPa de los 250 de partida.");
    expect(f.nota).toBe("Funciona desde 233 kPa de red. Por debajo hace falta grupo de presión.");
    expect(f.filas.map((x) => x.k)).toEqual([
      "Presión de la red",
      "Altura · 11 m",
      "Rozamiento en tuberías",
      "Llaves, contador y codos",
      "Llega · mínimo 100",
    ]);
  });

  it("la presión de la red, por revisar mientras no se confirme", () => {
    expect(estados["presion-red"]).toBe("rv");
    expect(franjaDe(el(j, "presion-red"), j, "rv").manda).toMatch(/Es un dato supuesto/);
    expect(franjaDe(el(j, "presion-red"), j, "dt").manda).toBe("Confirmada por la compañía suministradora.");
    const confirmada = estadosElementos(j.elementos, j.avisos, ["presion-red-supuesta"]);
    expect(confirmada["presion-red"]).toBe("dt");
  });

  it("la simultaneidad se dice como método tradicional, no como UNE 149201", () => {
    const f = franjaDe(el(j, "caudal-a"), j, "in");
    expect(f.manda).toBe(
      "La simultaneidad. Los 11 aparatos suman 1,75 dm³/s, pero no se abren todos a la vez: K = 1/√(11−1) = 0,32.",
    );
    expect(f.nota).toMatch(/método tradicional/);
    expect(JSON.stringify(f)).not.toMatch(/UNE 149201/);
  });

  it("la lista y las etiquetas del dibujo", () => {
    expect(resultadoLista(el(j, "presion-p3"))).toBe("117 ≥ 100 kPa");
    expect(resultadoLista(el(j, "presion-maxima"))).toBe("186 ≤ 500 kPa");
    expect(resultadoLista(el(j, "grupo-presion"))).toBe("no hace falta");
    expect(textoEtiqueta(el(j, "montante-a"))).toBe("3 × Ø20");
    expect(textoEtiqueta(el(j, "acometida"))).toBe("Ø32 PE");
    expect(textoEtiqueta(el(j, "local-pb"))).toBe("Ø20 previsto");
  });

  it("el aviso de la presión supuesta dice desde cuánto funciona", () => {
    const a = j.avisos.find((x) => x.id === "presion-red-supuesta")!;
    expect(textoAviso(a, j)).toEqual({
      titulo: "La presión de la red es un dato supuesto.",
      detalle: "Pide el certificado a la compañía: con menos de 233 kPa, la planta 3 se queda sin los 100 kPa de mínimo.",
    });
  });
});

describe("lo que no cumple en HS4", () => {
  const j = justificar({}, { presionAcometida_kPa: 200 });

  it("un solo aviso para la presión, con las plantas a las que no llega y el grupo que lo arregla", () => {
    const textos = j.elementos.flatMap((e) => (e.veredicto === "fail" ? [textoIncumplimiento(e, j)] : [])).filter(Boolean);
    expect(textos).toHaveLength(1);
    expect(textos[0]).toEqual({
      titulo: "No llega presión a las plantas 2 y 3.",
      detalle:
        "El fregadero de A3 se queda en 67 kPa y necesita 100. Con un grupo de presión a 300 kPa a la salida de la batería llegaría con 167 kPa.",
      accion: { etiqueta: "Añadir grupo de presión", cambio: { grupoPresion: true, presionGrupo_kPa: 300 } },
    });
  });

  it("la frase lo dice y el grupo propuesto nunca baja de 300 kPa", () => {
    expect(fraseHs4(j)).toBe("Con 200 kPa de red, el fregadero de A3 solo recibe 67 kPa: hace falta grupo de presión.");
    expect(presionGrupoPropuesta(null)).toBe(300);
    expect(presionGrupoPropuesta(233)).toBe(300);
    expect(presionGrupoPropuesta(395)).toBe(420);
  });

  it("con el grupo puesto, su franja dice qué plantas no deben depender de él", () => {
    const g = justificar({ grupoPresion: true, presionGrupo_kPa: 300 }, { presionAcometida_kPa: 200 });
    const f = franjaDe(el(g, "grupo-presion"), g, "ok");
    expect(f.manda).toBe("Lo pide la planta 3: con la red sola no llegaría a 100 kPa.");
    expect(f.nota).toMatch(/A P1 les llega la red sola: no deben depender del grupo\./);
  });
});

describe("memoria de HS4", () => {
  const j = justificar();
  const m = memoriaHs4(j);

  it("redacta la red, los caudales, la presión y lo demás", () => {
    const texto = m.parrafos.map(textoParrafo);
    expect(texto[0]).toBe(
      "La instalación se ha dimensionado conforme a la sección HS 4 del DB-HS. La acometida de polietileno Ø32 mm llega a una batería de 8 contadores en planta baja —seis viviendas, el local y las zonas comunes—, de la que sale un montante por vivienda de multicapa Ø20 mm.",
    );
    expect(texto[1]).toMatch(/La velocidad en los montantes queda entre 1,6 y 1,8 m\/s/);
    expect(texto[2]).toMatch(/La instalación funciona sin grupo de presión con una presión de red de al menos 233 kPa\./);
    expect(texto[3]).toMatch(/tubería en espera Ø20 mm\. El garaje no tiene puntos de consumo\./);
  });

  it("la tabla de presiones lleva una fila por planta y el punto con más presión", () => {
    expect(m.tabla.cabecera).toEqual(["Punto", "Altura", "Pérdidas", "Presión"]);
    expect(m.tabla.filas.map((f) => f[0])).toEqual([
      "El fregadero de A3 · planta 3",
      "El fregadero de A2 · planta 2",
      "El fregadero de A1 · planta 1",
      "El lavabo de B1 · planta 1",
    ]);
    expect(textoPlanoMemoria(m)).toMatch(/^Suministro de agua\n\n/);
    expect(m.fuente).toMatch(/^DB-HS · HS 4 \(consolidado 14-06-2022\)/);
  });
});

describe("ficha de HS4", () => {
  const j = justificar();
  const svg = tamanoDibujoHs4(j, DEMO);
  const ficha = (revisados: string[] = []) =>
    toFichaData(j, { estado: hs4EstadoDefaults, edificio: DEMO, obra: OBRA, revisados, svg });

  it("abre con la memoria, una verificación por elemento y el aviso pendiente", () => {
    const f = ficha();
    expect(f.edicionDB).toBe("DB-HS4 (consolidado 14-06-2022)");
    expect(f.memoria?.[0]).toMatch(/^La instalación se ha dimensionado/);
    expect(f.verificaciones.map((v) => v.concepto)).toEqual(j.elementos.map((e) => e.nombre));
    expect(f.veredictoGlobal).toBe("ok");
    expect(f.observaciones?.[0]).toMatch(/La presión de la red es un dato supuesto\..*Pendiente de revisar\.$/);
    expect(f.svg).toMatchObject({ elementId: "hs4-svg-pdf", nativeW: svg.nativeW, nativeH: svg.nativeH });
  });

  it("la presión confirmada llega como revisada; la simultaneidad, como criterio", () => {
    const f = ficha(["presion-red-supuesta"]);
    expect(f.observaciones?.[0]).toMatch(/Revisado por el proyectista\.$/);
    expect(f.datosPartida.find((d) => d.concepto === "Presión de la red en la acometida")?.origen).toMatch(/confirmada/);
    expect(f.datosPartida.find((d) => d.concepto === "Simultaneidad")?.origen).toMatch(/Criterio de proyecto/);
    expect(f.normativa.some((c) => /criterio de proyecto/.test(c.exigencia ?? ""))).toBe(true);
    expect(JSON.stringify(f)).not.toMatch(/UNE 149201/);
  });
});

describe("dibujo de HS4", () => {
  const j = justificar();
  const s = calcularSeccionHs4(j, DEMO);

  it("una barra por planta con viviendas, la de la red y el mínimo de 100 kPa", () => {
    expect(s.barras.map((b) => b.elementoId)).toEqual(["presion-p3", "presion-p2", "presion-p1"]);
    expect(s.barraRed?.elementoId).toBe("presion-red");
    expect(s.barras.every((b) => b.cumple)).toBe(true);
    // Más arriba, menos presión: barra más corta.
    expect(s.barras[0].w).toBeLessThan(s.barras[2].w);
  });

  it("la batería, un montante por vivienda y las cajas de cada planta", () => {
    expect(s.bateria?.contadores).toBe(8);
    expect(s.montantes).toHaveLength(6);
    expect(s.cajas.map((c) => c.texto).sort()).toEqual(["A1", "A2", "A3", "B1", "B2", "B3"]);
    expect(s.cajas.find((c) => c.texto === "A3")?.critica).toBe(true);
    expect(s.locales.map((l) => l.elementoId)).toEqual(["local-pb"]);
  });

  it("las etiquetas caen dentro del dibujo", () => {
    expect(s.etiquetas.map((e) => e.elementoId).sort()).toEqual(
      ["acometida", "local-pb", "montante-a", "montante-b", "presion-p1", "presion-p2", "presion-p3", "presion-red"].sort(),
    );
    for (const e of s.etiquetas) {
      expect(e.x).toBeGreaterThan(0);
      expect(e.x).toBeLessThan(s.ancho);
      expect(e.y).toBeGreaterThan(0);
      expect(e.y).toBeLessThan(s.alto);
    }
  });

  it("con contadores por planta, el montante general y sin batería", () => {
    const pp = calcularSeccionHs4(justificar({ contadores: "por_planta" }), DEMO);
    expect(pp.bateria).toBeNull();
    expect(pp.general?.contadores).toHaveLength(3);
  });

  it("es determinista", () => {
    expect(calcularSeccionHs4(j, DEMO)).toEqual(s);
  });
});
