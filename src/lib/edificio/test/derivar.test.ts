import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { CASOS_EDIFICIO, edificioDeCaso } from "../casos";
import {
  etiquetaEdificio,
  formatoCota,
  fraseEdificio,
  grupoTocaTerreno,
  nivelesContactoTerreno,
  nombreGrupo,
  plantasDe,
  procedenciaEdificio,
  renumerar,
  resumenEdificio,
  validarEdificio,
  vecinasDe,
} from "../derivar";
import type { Edificio, GrupoPlantas } from "../tipos";

// =============================================================================
// Derivaciones de El edificio (feature-12): niveles, cotas, resumen y avisos.
// Casos concretos sobre los cuatro casos de partida + invariantes.
// =============================================================================

const LOCALES = edificioDeCaso("plurifamiliar_locales");

describe("renumerar y nombres de grupo", () => {
  it("la PB es el nivel 0, los grupos de encima suben y los sótanos bajan desde -1", () => {
    const g = LOCALES.grupos;
    expect(g.map((x) => [x.id, x.nivelInicial])).toEqual([
      ["g1", 1],
      ["g2", 0],
      ["g3", -1],
    ]);
  });

  it("recalcula niveles incoherentes desde el orden y las repeticiones", () => {
    const roto: Edificio = {
      ...LOCALES,
      grupos: LOCALES.grupos.map((g) => ({ ...g, nivelInicial: g.nivelInicial < 0 ? -7 : 42 })),
    };
    expect(renumerar(roto).grupos.map((g) => g.nivelInicial)).toEqual([1, 0, -1]);
  });

  it("dos sótanos iguales: el grupo empieza en el más bajo (S1–S2 → -2)", () => {
    const e = renumerar({
      ...LOCALES,
      grupos: [...LOCALES.grupos.slice(0, 2), { ...LOCALES.grupos[2], repeticiones: 2 }],
    });
    const s = e.grupos[2];
    expect(s.nivelInicial).toBe(-2);
    expect(nombreGrupo(s)).toEqual({ corto: "S1–S2", largo: "Sótanos 1 y 2" });
  });

  it("nombres: «P1–P3» / «Plantas 1 a 3», «PB» / «Planta baja»", () => {
    expect(nombreGrupo(LOCALES.grupos[0])).toEqual({ corto: "P1–P3", largo: "Plantas 1 a 3" });
    expect(nombreGrupo(LOCALES.grupos[1])).toEqual({ corto: "PB", largo: "Planta baja" });
    expect(nombreGrupo(LOCALES.grupos[2])).toEqual({ corto: "S1", largo: "Sótano 1" });
    const pbYp1: GrupoPlantas = { ...LOCALES.grupos[1], nivelInicial: 0, repeticiones: 2 };
    expect(nombreGrupo(pbYp1)).toEqual({ corto: "PB–P1", largo: "Planta baja y planta 1" });
  });
});

describe("plantas físicas y cotas", () => {
  it("despliega P3, P2, P1, PB y S1 con sus cotas (PB de 4 m)", () => {
    const ps = plantasDe(LOCALES);
    expect(ps.map((p) => [p.etiqueta, p.cota_m])).toEqual([
      ["P3", 10],
      ["P2", 7],
      ["P1", 4],
      ["PB", 0],
      ["S1", -3],
    ]);
  });

  it("formato de cota de plano", () => {
    expect(formatoCota(0)).toBe("±0,00");
    expect(formatoCota(4)).toBe("+4,00");
    expect(formatoCota(-3)).toBe("−3,00");
  });
});

describe("resumenEdificio", () => {
  it("plurifamiliar con locales", () => {
    const r = resumenEdificio(LOCALES);
    expect(r).toMatchObject({
      tipo: "plurifamiliar",
      plantasSobreRasante: 4,
      plantasBajoRasante: 1,
      numViviendas: 6,
      tieneViviendas: true,
      esUnifamiliar: false,
      tieneGaraje: true,
      tieneTrasteros: true,
      tieneLocales: true,
      tieneLocalPB: true,
      tieneOficinas: false,
      cubiertaTransitable: false,
      alturaEvacuacion_m: 10,
    });
    // Superficie útil por uso: zona × plantas; el total solo se muestra.
    expect(r.superficiePorUso.viviendas).toBe(158 * 3);
    expect(r.superficiePorUso.instalaciones).toBe(14);
    expect(etiquetaEdificio(r)).toBe("Vivienda plurifamiliar con locales");
  });

  it("unifamiliar: una vivienda aunque ocupe dos plantas, garaje privado cuenta como garaje", () => {
    const r = resumenEdificio(edificioDeCaso("unifamiliar"));
    expect(r.tipo).toBe("unifamiliar");
    expect(r.numViviendas).toBe(1);
    expect(r.tieneGaraje).toBe(true);
    expect(etiquetaEdificio(r)).toBe("Vivienda unifamiliar");
  });

  it("oficinas: sin viviendas, con locales", () => {
    const r = resumenEdificio(edificioDeCaso("oficinas"));
    expect(r.tipo).toBe("oficinas");
    expect(r.tieneViviendas).toBe(false);
    expect(r.numViviendas).toBe(0);
    expect(etiquetaEdificio(r)).toBe("Oficinas con locales");
  });

  it("plurifamiliar: 7 viviendas (una en la PB)", () => {
    expect(resumenEdificio(edificioDeCaso("plurifamiliar")).numViviendas).toBe(7);
  });

  it("frase de cabecera", () => {
    expect(fraseEdificio(LOCALES)).toBe(
      "4 plantas sobre rasante y 1 sótano · 6 viviendas de 2 tipos · local sin uso en planta baja · garaje de 14 plazas.",
    );
  });
});

describe("terreno y vecinas", () => {
  it("con sótano toca el terreno el sótano; sin sótano, la PB", () => {
    expect(nivelesContactoTerreno(LOCALES)).toEqual([-1]);
    expect(grupoTocaTerreno(LOCALES, "g2")).toBe(false);
    expect(grupoTocaTerreno(LOCALES, "g3")).toBe(true);
    const sinSotano = edificioDeCaso("unifamiliar");
    expect(nivelesContactoTerreno(sinSotano)).toEqual([0]);
    expect(grupoTocaTerreno(sinSotano, "g2")).toBe(true);
  });

  it("encima del local está la P1 de viviendas; debajo, el garaje", () => {
    const v = vecinasDe(LOCALES, "g2")!;
    expect(v.encima).toEqual({ etiqueta: "P1", usos: ["viviendas"] });
    expect(v.debajo.etiqueta).toBe("S1");
    expect(v.debajo.usos).toEqual(["garaje", "trasteros", "instalaciones"]);
    expect(vecinasDe(LOCALES, "g1")!.encima.etiqueta).toBe("Cubierta");
    expect(vecinasDe(LOCALES, "g3")!.debajo.etiqueta).toBe("Terreno");
  });
});

describe("validarEdificio", () => {
  it("los cuatro casos de partida no tienen avisos", () => {
    for (const c of CASOS_EDIFICIO) expect(validarEdificio(edificioDeCaso(c.key)), c.key).toEqual([]);
  });

  it("avisa de viviendas sin asignar, superficie nula y viviendas que no caben", () => {
    const e = structuredClone(LOCALES);
    e.grupos[0].zonas[0].unidades = [];
    e.grupos[1].zonas[0].superficieUtil_m2 = 0;
    const avisos = validarEdificio(e);
    expect(avisos).toContain("P1–P3: la zona de viviendas no tiene viviendas asignadas.");
    expect(avisos).toContain("PB: la zona «Local sin uso» no tiene superficie útil.");

    const apretado = structuredClone(LOCALES);
    apretado.grupos[0].zonas[0].superficieUtil_m2 = 100; // A 90 + B 68 = 158
    expect(validarEdificio(apretado)).toContain("P1–P3: las viviendas suman 158 m² útiles y la zona tiene 100 m².");
  });

  it("unifamiliar mezclada con viviendas", () => {
    const e = structuredClone(edificioDeCaso("unifamiliar"));
    e.grupos[0].zonas[0] = { id: "z9", uso: "viviendas", superficieUtil_m2: 70, unidades: [{ tipoId: "U", cantidad: 1 }] };
    expect(validarEdificio(e).some((a) => a.includes("no comparte edificio"))).toBe(true);
  });
});

describe("invariantes", () => {
  test.prop([fc.constantFrom(...CASOS_EDIFICIO.map((c) => c.key)), fc.integer({ min: 1, max: 12 })])(
    "las cotas de las plantas sobre rasante crecen hacia arriba y suman las alturas",
    (caso, rep) => {
      const base = edificioDeCaso(caso);
      const e = renumerar({ ...base, grupos: base.grupos.map((g, i) => (i === 0 ? { ...g, repeticiones: rep } : g)) });
      const sobre = plantasDe(e).filter((p) => p.nivel >= 0).reverse();
      for (let i = 1; i < sobre.length; i++) {
        expect(sobre[i].cota_m).toBeCloseTo(sobre[i - 1].cota_m + sobre[i - 1].altura_m, 6);
      }
      expect(resumenEdificio(e).alturaEvacuacion_m).toBeCloseTo(sobre[sobre.length - 1].cota_m, 6);
      expect(resumenEdificio(e).plantasSobreRasante).toBe(sobre.length);
    },
  );
});

describe("altura de evacuación (Anejo SI A)", () => {
  const conPlantaArriba = (uso: "instalaciones" | "trasteros" | "zona_comun", base = edificioDeCaso("plurifamiliar")) =>
    renumerar({
      ...base,
      grupos: [
        { id: "gx", nivelInicial: 9, repeticiones: 1, altura_m: 3, zonas: [{ id: "zx", uso, superficieUtil_m2: 15 }] },
        ...base.grupos,
      ],
    });
  const sinArriba = resumenEdificio(edificioDeCaso("plurifamiliar")).alturaEvacuacion_m;

  it("no cuenta las plantas más altas con solo zonas de ocupación nula", () => {
    expect(sinArriba).toBe(9);
    expect(resumenEdificio(conPlantaArriba("instalaciones")).alturaEvacuacion_m).toBe(sinArriba);
    expect(resumenEdificio(conPlantaArriba("trasteros")).alturaEvacuacion_m).toBe(sinArriba);
  });

  it("una planta ocupable arriba sí cuenta, y los trasteros solo son nulos en viviendas", () => {
    expect(resumenEdificio(conPlantaArriba("zona_comun")).alturaEvacuacion_m).toBe(12);
    expect(resumenEdificio(conPlantaArriba("trasteros", edificioDeCaso("oficinas"))).alturaEvacuacion_m).toBeGreaterThan(
      resumenEdificio(edificioDeCaso("oficinas")).alturaEvacuacion_m,
    );
  });
});

describe("procedenciaEdificio (feature-13)", () => {
  const origen = { documento: "cuadro.pdf", paginas: [1], filas: ["Portal · 20,00 m²"] };

  it("sin zonas leídas, lo introdujo el proyectista", () => {
    expect(procedenciaEdificio(edificioDeCaso("plurifamiliar"))).toBe(
      "Introducido por el proyectista en El edificio",
    );
  });

  it("con zonas leídas, el documento y cuántas", () => {
    const e = edificioDeCaso("plurifamiliar");
    e.grupos[0]!.zonas[0]!.origen = origen;
    expect(procedenciaEdificio(e)).toBe(
      "Cuadro de superficies «cuadro.pdf» leído con IA y revisado por el proyectista (1 de 5 zonas)",
    );
    for (const g of e.grupos) for (const z of g.zonas) z.origen = origen;
    expect(procedenciaEdificio(e)).toBe(
      "Cuadro de superficies «cuadro.pdf» leído con IA y revisado por el proyectista",
    );
  });
});
