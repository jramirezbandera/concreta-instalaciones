import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  MAPA_HERENCIA,
  heredadosDe,
  mergeInputsHeredados,
  notasExcepcionesLocales,
} from "../herencia";
import type { ContextoDerivado, DatosGenerales, ResumenEdificio } from "../tipos";
import { edificioDeCaso } from "../../edificio/casos";
import { resumenEdificio } from "../../edificio/derivar";

// =============================================================================
// herencia — feature-6 T2.5. Tests en dos capas (cf. derivar.test.ts):
//   1) CASOS CONCRETOS: mapa de herencia por módulo (unions reales verificados)
//      y prioridades del merge una a una.
//   2) PROPERTY-BASED (@fast-check/vitest): invariantes del merge (prioridades,
//      overridesEfectivos, no-mutación) sobre entradas arbitrarias.
// =============================================================================

// -----------------------------------------------------------------------------
// FIXTURES (expediente de prueba, determinista)
// -----------------------------------------------------------------------------

function dgDe(extra?: Partial<DatosGenerales>): DatosGenerales {
  return {
    municipio: "Cáceres",
    provincia: "Cáceres",
    altitud_m: 459,
    intervencion: "obra_nueva",
    tienePiscina: false,
    zonaRadon: "I",
    ...extra,
  };
}

/** Resumen de edificio de prueba: 4 plantas sobre rasante, cubierta transitable, con viviendas. */
function edificioDe(extra?: Partial<ResumenEdificio>): ResumenEdificio {
  return {
    ...resumenEdificio(edificioDeCaso("plurifamiliar")),
    plantasSobreRasante: 4,
    cubiertaTransitable: true,
    tipoCubierta: "plana_transitable",
    ...extra,
  };
}

function ctxDe(
  zonaClimatica = "C4",
  zonaTermica: "W" | "X" | "Y" | "Z" = "Z",
  edificio: ResumenEdificio = edificioDe(),
): ContextoDerivado {
  return {
    zonaClimatica: { valor: zonaClimatica, procedencia: "test" },
    zonaTermicaHS3: { valor: zonaTermica, procedencia: "test" },
    alturaEvacuacion_m: { valor: 9, procedencia: "test" },
    edificio,
  };
}

// -----------------------------------------------------------------------------
// MAPA DE HERENCIA / heredadosDe — casos concretos por módulo
// -----------------------------------------------------------------------------

describe("heredadosDe — mapa por módulo", () => {
  it("hs6: hereda municipio y zona (ZonaRadon del expediente)", () => {
    expect(heredadosDe("hs6", dgDe(), ctxDe())).toEqual({
      municipio: "Cáceres",
      zona: "I",
    });
    expect(heredadosDe("hs6", dgDe({ zonaRadon: "sin_exigencia" }), ctxDe()).zona).toBe(
      "sin_exigencia",
    );
  });

  it('he1: extrae la LETRA de invierno de la zona completa ("C4" → "C")', () => {
    expect(heredadosDe("he1", dgDe(), ctxDe("C4"))).toEqual({ zonaClimatica: "C" });
  });

  it('he1: la zona α de Canarias también se extrae por primer carácter ("α3" → "α")', () => {
    expect(heredadosDe("he1", dgDe(), ctxDe("α3"))).toEqual({ zonaClimatica: "α" });
  });

  it("hs3: hereda la zona térmica derivada (W/X/Y/Z)", () => {
    expect(heredadosDe("hs3", dgDe(), ctxDe("C4", "Y"))).toEqual({ zonaTermica: "Y" });
  });

  it('hs5: uso "privado" si el edificio tiene viviendas y "publico" si no (oficinas)', () => {
    expect(heredadosDe("hs5", dgDe(), ctxDe()).uso).toBe("privado");
    const oficinas = resumenEdificio(edificioDeCaso("oficinas"));
    expect(heredadosDe("hs5", dgDe(), ctxDe("C4", "Z", oficinas)).uso).toBe("publico");
  });

  it("hs5: numPlantas y cubiertaTransitable salen de El edificio", () => {
    expect(heredadosDe("hs5", dgDe(), ctxDe("C4", "Z", edificioDe({ plantasSobreRasante: 6 })))).toEqual({
      uso: "privado",
      numPlantas: 6,
      cubiertaTransitable: true, // plana_transitable
    });
    const sinTransitar = edificioDe({ cubiertaTransitable: false, tipoCubierta: "inclinada" });
    expect(heredadosDe("hs5", dgDe(), ctxDe("C4", "Z", sinTransitar)).cubiertaTransitable).toBe(false);
  });

  it("hs4: presión informada ⇒ se hereda con su valor", () => {
    expect(heredadosDe("hs4", dgDe({ presionAcometida_kPa: 300 }), ctxDe())).toEqual({
      presionAcometida_kPa: 300,
    });
  });

  it("hs4: presión SIN informar ⇒ el objeto NO contiene la clave", () => {
    const heredados = heredadosDe("hs4", dgDe(), ctxDe());
    expect(heredados).toEqual({});
    expect("presionAcometida_kPa" in heredados).toBe(false);
  });

  it("justificación sin entrada en el mapa (p.ej. si1) ⇒ objeto vacío", () => {
    expect(MAPA_HERENCIA.si1).toBeUndefined();
    expect(heredadosDe("si1", dgDe(), ctxDe())).toEqual({});
  });

  it("los nombres de campo del mapa son los inputs EXACTOS de cada motor", () => {
    const campos = (key: keyof typeof MAPA_HERENCIA) =>
      (MAPA_HERENCIA[key] ?? []).map((c) => c.campo);
    expect(campos("hs6")).toEqual(["municipio", "zona"]);
    expect(campos("he1")).toEqual(["zonaClimatica"]);
    expect(campos("hs3")).toEqual(["zonaTermica"]);
    expect(campos("hs5")).toEqual(["uso", "numPlantas", "cubiertaTransitable"]);
    expect(campos("hs4")).toEqual(["presionAcometida_kPa"]);
  });
});

// -----------------------------------------------------------------------------
// mergeInputsHeredados — prioridades una a una
// -----------------------------------------------------------------------------

describe("mergeInputsHeredados — prioridades", () => {
  const defaults = { numPlantas: 1, uso: "privado", nota: "x" };

  it("guardado pisa default", () => {
    const { state } = mergeInputsHeredados({
      defaults,
      guardados: { numPlantas: 3 },
      heredados: {},
      overrides: [],
      urlOverrides: {},
    });
    expect(state).toEqual({ numPlantas: 3, uso: "privado", nota: "x" });
  });

  it("heredado pisa guardado (sin excepción declarada)", () => {
    const { state } = mergeInputsHeredados({
      defaults,
      guardados: { numPlantas: 3 },
      heredados: { numPlantas: 4 },
      overrides: [],
      urlOverrides: {},
    });
    expect(state.numPlantas).toBe(4);
  });

  it("override declarado conserva lo guardado frente a lo heredado", () => {
    const { state, overridesEfectivos } = mergeInputsHeredados({
      defaults,
      guardados: { numPlantas: 5 },
      heredados: { numPlantas: 4 },
      overrides: ["numPlantas"],
      urlOverrides: {},
    });
    expect(state.numPlantas).toBe(5);
    expect(overridesEfectivos).toEqual(["numPlantas"]);
  });

  it("override declarado SIN valor guardado conserva el default", () => {
    const { state } = mergeInputsHeredados({
      defaults,
      guardados: undefined,
      heredados: { numPlantas: 4 },
      overrides: ["numPlantas"],
      urlOverrides: {},
    });
    expect(state.numPlantas).toBe(1);
  });

  it("urlOverride pisa todo (guardado, heredado y override declarado)", () => {
    const { state } = mergeInputsHeredados({
      defaults,
      guardados: { numPlantas: 5 },
      heredados: { numPlantas: 4 },
      overrides: ["numPlantas"],
      urlOverrides: { numPlantas: 7 },
    });
    expect(state.numPlantas).toBe(7);
  });

  it("urlOverride de campo heredable DISTINTO del heredado ⇒ entra en overridesEfectivos", () => {
    const { overridesEfectivos } = mergeInputsHeredados({
      defaults,
      guardados: undefined,
      heredados: { numPlantas: 4 },
      overrides: [],
      urlOverrides: { numPlantas: 7 },
    });
    expect(overridesEfectivos).toEqual(["numPlantas"]);
  });

  it("urlOverride de campo heredable IGUAL al heredado ⇒ NO entra en overridesEfectivos", () => {
    const { overridesEfectivos } = mergeInputsHeredados({
      defaults,
      guardados: undefined,
      heredados: { numPlantas: 4 },
      overrides: [],
      urlOverrides: { numPlantas: 4 },
    });
    expect(overridesEfectivos).toEqual([]);
  });

  it("urlOverride de campo NO heredable no entra en overridesEfectivos", () => {
    const { overridesEfectivos, state } = mergeInputsHeredados({
      defaults,
      guardados: undefined,
      heredados: { numPlantas: 4 },
      overrides: [],
      urlOverrides: { nota: "y" },
    });
    expect(state.nota).toBe("y");
    expect(overridesEfectivos).toEqual([]);
  });

  it("no duplica en overridesEfectivos un override ya declarado que además viene por URL", () => {
    const { overridesEfectivos } = mergeInputsHeredados({
      defaults,
      guardados: { numPlantas: 5 },
      heredados: { numPlantas: 4 },
      overrides: ["numPlantas"],
      urlOverrides: { numPlantas: 7 },
    });
    expect(overridesEfectivos).toEqual(["numPlantas"]);
  });

  it("no muta sus argumentos", () => {
    const args = {
      defaults: { numPlantas: 1, uso: "privado" } as Record<string, unknown>,
      guardados: { numPlantas: 5 } as Record<string, unknown>,
      heredados: { numPlantas: 4 } as Record<string, unknown>,
      overrides: ["uso"],
      urlOverrides: { numPlantas: 7 } as Record<string, unknown>,
    };
    const copia = structuredClone(args);
    mergeInputsHeredados(args);
    expect(args).toEqual(copia);
  });
});

// -----------------------------------------------------------------------------
// mergeInputsHeredados — propiedades (fast-check)
// -----------------------------------------------------------------------------

const CLAVES = ["a", "b", "c"] as const;
const primitivo = fc.oneof(fc.integer(), fc.boolean(), fc.string());
const parcial = fc.dictionary(fc.constantFrom(...CLAVES), primitivo, { maxKeys: 3 });
const argsArb = fc.record({
  defaults: fc.record({ a: primitivo, b: primitivo, c: primitivo }),
  guardados: fc.option(parcial, { nil: undefined }),
  heredados: parcial,
  overrides: fc.subarray([...CLAVES]),
  urlOverrides: parcial,
});

describe("mergeInputsHeredados — propiedades", () => {
  test.prop([argsArb])("las cuatro prioridades se respetan clave a clave", (args) => {
    const { state } = mergeInputsHeredados(args);
    for (const k of CLAVES) {
      const esperado =
        k in args.urlOverrides
          ? args.urlOverrides[k]
          : k in args.heredados && !args.overrides.includes(k)
            ? args.heredados[k]
            : args.guardados !== undefined && k in args.guardados
              ? args.guardados[k]
              : args.defaults[k];
      expect(state[k]).toEqual(esperado);
    }
  });

  test.prop([argsArb])(
    "overridesEfectivos = overrides ∪ {heredables con urlOverride distinto}",
    (args) => {
      const { overridesEfectivos } = mergeInputsHeredados(args);
      for (const k of args.overrides) expect(overridesEfectivos).toContain(k);
      for (const k of overridesEfectivos) {
        const declarado = (args.overrides as string[]).includes(k);
        const porUrl =
          k in args.urlOverrides &&
          k in args.heredados &&
          !Object.is(args.urlOverrides[k], args.heredados[k]);
        expect(declarado || porUrl).toBe(true);
      }
      expect(new Set(overridesEfectivos).size).toBe(overridesEfectivos.length);
    },
  );

  test.prop([argsArb])("determinismo: dos llamadas idénticas dan el mismo resultado", (args) => {
    expect(mergeInputsHeredados(args)).toEqual(mergeInputsHeredados(structuredClone(args)));
  });

  test.prop([argsArb])("no muta ninguno de sus argumentos", (args) => {
    const copia = structuredClone(args);
    mergeInputsHeredados(args);
    expect(args).toEqual(copia);
  });
});

// -----------------------------------------------------------------------------
// notasExcepcionesLocales
// -----------------------------------------------------------------------------

describe("notasExcepcionesLocales", () => {
  it("genera la frase esperada para un override numérico que difiere", () => {
    const notas = notasExcepcionesLocales({
      key: "hs5",
      dg: dgDe(),
      d: ctxDe(),
      state: { uso: "privado", numPlantas: 5, cubiertaTransitable: true },
      overrides: ["numPlantas"],
    });
    expect(notas).toEqual(["Excepción local: Nº de plantas = 5 (dato del proyecto: 4)"]);
  });

  it("sin overrides ⇒ sin notas", () => {
    expect(
      notasExcepcionesLocales({
        key: "hs5",
        dg: dgDe(),
        d: ctxDe(),
        state: { uso: "privado", numPlantas: 9, cubiertaTransitable: false },
        overrides: [],
      }),
    ).toEqual([]);
  });

  it("override cuyo valor COINCIDE con el heredado ⇒ sin nota (no hay excepción real)", () => {
    expect(
      notasExcepcionesLocales({
        key: "hs5",
        dg: dgDe(),
        d: ctxDe(),
        state: { uso: "privado", numPlantas: 4, cubiertaTransitable: true },
        overrides: ["numPlantas"],
      }),
    ).toEqual([]);
  });

  it("override de campo NO heredable en este proyecto (hs4 sin presión) ⇒ sin nota", () => {
    expect(
      notasExcepcionesLocales({
        key: "hs4",
        dg: dgDe(), // presionAcometida_kPa sin informar
        d: ctxDe(),
        state: { presionAcometida_kPa: 250 },
        overrides: ["presionAcometida_kPa"],
      }),
    ).toEqual([]);
  });

  it("incluye la unidad del editor cuando existe (hs4, kPa)", () => {
    expect(
      notasExcepcionesLocales({
        key: "hs4",
        dg: dgDe({ presionAcometida_kPa: 300 }),
        d: ctxDe(),
        state: { presionAcometida_kPa: 250 },
        overrides: ["presionAcometida_kPa"],
      }),
    ).toEqual(["Excepción local: Presión en la acometida = 250 kPa (dato del proyecto: 300 kPa)"]);
  });

  it('formatea los booleanos en español ("sí"/"no")', () => {
    expect(
      notasExcepcionesLocales({
        key: "hs5",
        dg: dgDe(),
        d: ctxDe(),
        state: { uso: "privado", numPlantas: 4, cubiertaTransitable: false },
        overrides: ["cubiertaTransitable"],
      }),
    ).toEqual(["Excepción local: Cubierta transitable = no (dato del proyecto: sí)"]);
  });

  it("varios overrides ⇒ notas en el orden de declaración del mapa (determinista)", () => {
    const args = {
      key: "hs5" as const,
      dg: dgDe(),
      d: ctxDe(),
      state: { uso: "privado", numPlantas: 5, cubiertaTransitable: false },
      overrides: ["cubiertaTransitable", "numPlantas"], // orden inverso al mapa a propósito
    };
    const notas = notasExcepcionesLocales(args);
    expect(notas).toEqual([
      "Excepción local: Nº de plantas = 5 (dato del proyecto: 4)",
      "Excepción local: Cubierta transitable = no (dato del proyecto: sí)",
    ]);
    // Determinismo: la misma llamada produce exactamente las mismas frases.
    expect(notasExcepcionesLocales(args)).toEqual(notas);
  });
});
