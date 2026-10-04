import { describe, expect, it } from "vitest";
import { fc, test as fcTest } from "@fast-check/vitest";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import { hs4Defaults } from "../calc";
import { hs4EstadoDefaults, type Hs4Estado } from "../estado";
import { justificarHs4, PRESION_RED_SIN_DATO_kPa } from "../justificacion";

// =============================================================================
// La justificación de HS4 (feature-15): elementos con su contrato (§3.2 de
// REDISENO-V4) y avisos con id estable, sobre el edificio del Demo.
// =============================================================================

function estado(parcial: Partial<Hs4Estado> = {}): Hs4Estado {
  return { ...hs4EstadoDefaults, ...parcial };
}

function el(j: ReturnType<typeof justificarHs4>, id: string) {
  const e = j.elementos.find((x) => x.id === id);
  if (!e) throw new Error(`no existe ${id}`);
  return e;
}

const DEMO = edificioDeCaso("plurifamiliar_locales");

describe("justificarHs4 · plurifamiliar con locales a 250 kPa (el Demo)", () => {
  const j = justificarHs4(estado(), DEMO, { presionAcometida_kPa: 250 });

  it("cumple, con los elementos en su orden", () => {
    expect(j.veredicto).toBe("ok");
    expect(j.elementos.map((x) => x.id)).toEqual([
      "presion-red",
      "presion-p3",
      "presion-p2",
      "presion-p1",
      "presion-maxima",
      "grupo-presion",
      "montante-a",
      "montante-b",
      "caudal-a",
      "caudal-b",
      "acometida",
      "local-pb",
    ]);
  });

  it("la presión baja con la altura y el punto más desfavorable está en P3", () => {
    const p = (id: string) => {
      const v = el(j, id).valor;
      return "valor" in v ? v.valor : NaN;
    };
    expect(p("presion-p3")).toBeLessThan(p("presion-p2"));
    expect(p("presion-p2")).toBeLessThan(p("presion-p1"));
    const p3 = el(j, "presion-p3");
    expect(p3.detalle.clase === "planta" && p3.detalle.critico).toBe(true);
    expect(p3.limite).toEqual({ valor: 100, unidad: "kPa" });
    // Lo manda la altura: 11 m (P3 a +10 y el grifo a 1 m) son 108 kPa.
    expect(p3.manda.tipo).toBe("presion_por_altura");
    if (p3.manda.tipo === "presion_por_altura") {
      expect(p3.manda.altura_m).toBe(11);
      expect(p3.manda.partida_kPa).toBe(250);
    }
  });

  it("«funciona desde»: la presión necesaria deja el punto crítico justo en 100 kPa", () => {
    const nec = j.resultado!.presionNecesaria_kPa!;
    const justo = justificarHs4(estado(), DEMO, { presionAcometida_kPa: nec });
    const p3 = el(justo, "presion-p3");
    expect("valor" in p3.valor && p3.valor.valor).toBeCloseTo(100, 6);
    expect(p3.veredicto).toBe("ok");
    const menos = justificarHs4(estado(), DEMO, { presionAcometida_kPa: nec - 1 });
    expect(el(menos, "presion-p3").veredicto).toBe("fail");
  });

  it("la presión de la red es un dato supuesto hasta que se confirme", () => {
    const red = el(j, "presion-red");
    expect(red.veredicto).toBe("dato");
    expect(j.avisos.map((a) => a.id)).toEqual(["presion-red-supuesta"]);
    expect(j.avisos[0].elementoId).toBe("presion-red");
  });

  it("los montantes y los caudales son criterio; el local, previsto con Ø20", () => {
    expect(el(j, "montante-a").veredicto).toBe("criterio");
    expect(el(j, "montante-a").manda.tipo).toBe("velocidad");
    const caudal = el(j, "caudal-a");
    expect(caudal.manda).toMatchObject({ tipo: "simultaneidad", aparatos: 11 });
    expect(el(j, "local-pb")).toMatchObject({ veredicto: "previsto", valor: { valor: 20, unidad: "mm" } });
  });
});

describe("justificarHs4 · falta presión y grupo", () => {
  it("con 200 kPa no llega a P3 ni a P2: hace falta grupo", () => {
    const j = justificarHs4(estado(), DEMO, { presionAcometida_kPa: 200 });
    expect(j.veredicto).toBe("fail");
    expect(el(j, "presion-p3").veredicto).toBe("fail");
    expect(el(j, "presion-p2").veredicto).toBe("fail");
    expect(el(j, "presion-p1").veredicto).toBe("ok");
    const g = el(j, "grupo-presion");
    expect(g.veredicto).toBe("fail");
    expect(g.detalle.clase === "grupo" && g.detalle.necesario).toBe(true);
  });

  it("con el grupo a 300 kPa vuelve a cumplir, y la red sigue siendo la de partida del dato", () => {
    const j = justificarHs4(estado({ grupoPresion: true, presionGrupo_kPa: 300 }), DEMO, { presionAcometida_kPa: 200 });
    expect(j.veredicto).toBe("ok");
    expect(j.partida_kPa).toBe(300);
    expect(j.presionRed_kPa).toBe(200);
    const g = el(j, "grupo-presion");
    expect(g.valor).toEqual({ texto: "Sí" });
    expect(g.manda).toEqual({ tipo: "decision_proyectista", decision: "grupo" });
  });

  it("sin el dato de la compañía se calcula con 250 kPa y se avisa", () => {
    const j = justificarHs4(estado(), DEMO, {});
    expect(j.presionSinDato).toBe(true);
    expect(j.presionRed_kPa).toBe(PRESION_RED_SIN_DATO_kPa);
    expect(j.avisos.map((a) => a.id)).toContain("presion-red-sin-dato");
  });
});

describe("justificarHs4 · decisiones, modos y casos", () => {
  it("agua caliente central: fuera de alcance", () => {
    const j = justificarHs4(estado({ aguaCaliente: "central" }), DEMO, { presionAcometida_kPa: 250 });
    expect(j.avisos.find((a) => a.id === "acs-central")?.tipo).toBe("fuera_de_alcance");
  });

  it("contadores por planta: un montante general en vez de uno por tipo", () => {
    const j = justificarHs4(estado({ contadores: "por_planta" }), DEMO, { presionAcometida_kPa: 250 });
    expect(j.elementos.some((e) => e.id === "montante-general")).toBe(true);
    expect(j.elementos.some((e) => e.id === "montante-a")).toBe(false);
  });

  it("a mano manda la tabla: el grifo más desfavorable sin planta", () => {
    const j = justificarHs4(estado({ red: "manual", tramos: hs4Defaults.tramos, aparatos: hs4Defaults.aparatos }), DEMO, {
      presionAcometida_kPa: 250,
    });
    expect(j.modo).toBe("manual");
    expect(j.elementos.map((e) => e.id)).toEqual([
      "presion-red",
      "punto-critico",
      "presion-maxima",
      "grupo-presion",
      "acometida",
      "local-pb",
    ]);
  });

  it("unifamiliar: avisa del reparto supuesto de los cuartos", () => {
    const j = justificarHs4(estado(), edificioDeCaso("unifamiliar"), { presionAcometida_kPa: 250 });
    expect(j.avisos.map((a) => a.id)).toContain("unifamiliar-reparto");
    expect(j.elementos.some((e) => e.id === "caudal-u")).toBe(true);
  });

  it("oficinas: presiones por planta, montante y caudal de las oficinas", () => {
    const j = justificarHs4(estado(), edificioDeCaso("oficinas"), { presionAcometida_kPa: 250 });
    expect(j.veredicto).toBe("ok");
    expect(j.elementos.map((e) => e.id)).toEqual(
      expect.arrayContaining(["presion-p2", "presion-p1", "montante-oficinas", "caudal-oficinas", "local-pb"]),
    );
  });

  fcTest.prop([fc.integer({ min: 150, max: 600 }), fc.integer({ min: 1, max: 200 })])(
    "más presión de red nunca da menos presión en ninguna planta",
    (p, extra) => {
      const a = justificarHs4(estado(), DEMO, { presionAcometida_kPa: p });
      const b = justificarHs4(estado(), DEMO, { presionAcometida_kPa: p + extra });
      for (const x of a.elementos) {
        if (x.detalle.clase !== "planta") continue;
        const y = b.elementos.find((e) => e.id === x.id)!;
        const vx = "valor" in x.valor ? x.valor.valor : 0;
        const vy = "valor" in y.valor ? y.valor.valor : 0;
        expect(vy).toBeGreaterThanOrEqual(vx);
      }
    },
  );
});
