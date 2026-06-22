import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  calcHS6,
  hs6Defaults,
  HS6_FALTA_MEDIDA,
  type HS6Inputs,
  type SolucionHS6Input,
  type SolucionBarreraInput,
  type SolucionEspacioContencionInput,
  type SolucionDespresurizacionInput,
} from "../calc";
import {
  parametrosBarrera,
  parametrosEspacioContencion,
  requisitoDeZona,
  type ZonaRadon,
} from "../tablas";

// =============================================================================
// HS6 — motor determinista (protección frente al radón). Tests de la Definición
// de Hecho de feature-5 (SPEC §5):
//   1) SNAPSHOTS commiteados y revisables en PR (toMatchSnapshot) de los casos
//      representativos (cumple / no cumple por barrera / no cumple por nº /
//      lámina fuera de umbral / contención infra-dimensionada / sin exigencia /
//      vía cálculo diferida), con asserts legibles e independientes del snapshot.
//   2) PROPERTY-BASED de los invariantes NORMATIVOS del módulo
//      (@fast-check/vitest, `test.prop` — verificado operativo con vitest 4.1.9 /
//      @fast-check/vitest 0.2.2, igual que la suite hs4):
//        (1) Monotonía de exigencia: nMedidasMin(II) ≥ nMedidasMin(I); II exige
//            barrera.
//        (2) Inclusión: combinación suficiente en II ⇒ suficiente en I.
//        (3) No aplica ⇒ no exige: zona "sin_exigencia" o local sin contacto ⇒
//            aplica=false y veredicto ≠ fail.
//        (4) Veredicto siempre definido (∈ {ok,warn,fail,neutral}).
//        (5) Coherencia: nMedidasValidas ≤ nº soluciones; suficiente + todo ok ⇒
//            veredicto ok.
//   3) DETERMINISMO (SPEC §4): calcHS6 es pura → mismo input → mismo output.
//
// FORMA POR-ELEMENTO (cf. he1/test): HS6 es un cálculo cerrado por local (sin
// topología de red), así que las arbitrarias construyen LISTAS de soluciones
// (uniones discriminadas por `tipo`), no árboles de tramos.
// =============================================================================

// -----------------------------------------------------------------------------
// PARÁMETROS NORMATIVOS (de las tablas, no replicados) para construir inputs
// "en umbral" / "fuera de umbral" sin hardcodear cifras dispersas.
// -----------------------------------------------------------------------------

const PB = parametrosBarrera(); // coefDifusionMax_m2_s, espesorMin_mm
const PE = parametrosEspacioContencion(); // areaAberturasMin_cm2_ml, alturaMinCamara_mm, …

// -----------------------------------------------------------------------------
// CONSTRUCTORES DE SOLUCIONES VÁLIDAS / INVÁLIDAS (legibles, reutilizables).
// -----------------------------------------------------------------------------

/** Barrera lámina-tipo VÁLIDA: lámina en umbral + checklist completo. */
function barreraValida(id = "barrera-ok"): SolucionBarreraInput {
  return {
    tipo: "barrera",
    id,
    via: "lamina_tipo",
    continuidadSellada: true,
    penetracionesSelladas: true,
    puertasEstancas: true,
    coefDifusion_m2_s: PB.coefDifusionMax_m2_s / 2, // holgadamente ≤ umbral
    espesor_mm: PB.espesorMin_mm + 0.5, // holgadamente ≥ mínimo
  };
}

/** Espacio de contención NATURAL bien dimensionado (área ≥ 10·perímetro). */
function contencionNaturalValida(id = "camara-ok"): SolucionEspacioContencionInput {
  const perimetro_m = 30;
  return {
    tipo: "espacio_contencion",
    id,
    ventilacion: "natural",
    perimetro_m,
    // Margen sobre el criterio 10 cm²/ml · perímetro.
    areaAberturas_cm2: PE.areaAberturasMin_cm2_ml * perimetro_m + 100,
    alturaCamara_mm: PE.alturaMinCamara_mm + 30,
  };
}

/** Despresurización del terreno COMPLETA (válida como medida adicional en II). */
function despresurizacionValida(id = "despr-ok"): SolucionDespresurizacionInput {
  return {
    tipo: "despresurizacion",
    id,
    redCaptacion: true,
    extraccionMecanica: true,
    geotextil: true,
  };
}

// =============================================================================
// SNAPSHOTS (SPEC §5) — commiteados, revisables en PR.
// =============================================================================

describe("calcHS6 — snapshots (SPEC §5)", () => {
  it("defaults (Zona II, sótano habitable: barrera lámina-tipo + cámara natural → CUMPLE)", () => {
    const r = calcHS6(hs6Defaults);
    expect(r).toMatchSnapshot();
    // Asserts legibles e independientes del snapshot del comportamiento clave.
    expect(r.aplica).toBe(true);
    expect(r.veredictoGlobal).toBe("ok");
    expect(r.combinacionSuficiente).toBe(true);
    expect(r.nMedidasValidas).toBeGreaterThanOrEqual(r.nMedidasMin);
    expect(r.barreraObligatoria).toBe(true);
    expect(r.elementoCriticoId).toBeNull();
  });

  it("Zona I con UNA sola medida válida (barrera lámina-tipo) → CUMPLE", () => {
    const inp: HS6Inputs = {
      zona: "I",
      municipio: "Municipio Zona I",
      localHabitableEnContactoConTerreno: true,
      soluciones: [barreraValida("barrera-zona-i")],
    };
    const r = calcHS6(inp);
    expect(r).toMatchSnapshot();
    expect(r.aplica).toBe(true);
    expect(r.barreraObligatoria).toBe(false);
    expect(r.nMedidasMin).toBe(1);
    expect(r.combinacionSuficiente).toBe(true);
    expect(r.veredictoGlobal).toBe("ok");
  });

  it("Zona II SIN barrera (solo espacio de contención) → NO CUMPLE (barrera obligatoria)", () => {
    const inp: HS6Inputs = {
      zona: "II",
      localHabitableEnContactoConTerreno: true,
      soluciones: [contencionNaturalValida("solo-camara")],
    };
    const r = calcHS6(inp);
    expect(r).toMatchSnapshot();
    expect(r.aplica).toBe(true);
    expect(r.combinacionSuficiente).toBe(false);
    expect(r.veredictoGlobal).toBe("fail");
    // No hay barrera propuesta que resaltar → sentinela de medida faltante.
    expect(r.elementoCriticoId).toBe(HS6_FALTA_MEDIDA);
    expect(r.warnings.some((w) => /barrera/i.test(w) && /obligatoria/i.test(w))).toBe(true);
  });

  it("Zona II con barrera válida pero SIN medida adicional → NO CUMPLE (nº insuficiente)", () => {
    const inp: HS6Inputs = {
      zona: "II",
      localHabitableEnContactoConTerreno: true,
      soluciones: [barreraValida("barrera-sola")],
    };
    const r = calcHS6(inp);
    expect(r).toMatchSnapshot();
    expect(r.aplica).toBe(true);
    // La barrera cuenta (1) pero la zona exige 2.
    expect(r.nMedidasValidas).toBe(1);
    expect(r.nMedidasMin).toBe(2);
    expect(r.combinacionSuficiente).toBe(false);
    expect(r.veredictoGlobal).toBe("fail");
    expect(r.warnings.some((w) => /INSUFICIENTE/.test(w))).toBe(true);
  });

  it("Zona II: barrera con LÁMINA FUERA DE UMBRAL (coef alto + espesor bajo) → barrera no cuenta", () => {
    const inp: HS6Inputs = {
      zona: "II",
      localHabitableEnContactoConTerreno: true,
      soluciones: [
        {
          tipo: "barrera",
          id: "barrera-mala-lamina",
          via: "lamina_tipo",
          continuidadSellada: true,
          penetracionesSelladas: true,
          puertasEstancas: true,
          // Fuera de umbral por ambos lados: coef > máx y espesor < mínimo.
          coefDifusion_m2_s: PB.coefDifusionMax_m2_s * 10,
          espesor_mm: PB.espesorMin_mm / 2,
        },
        contencionNaturalValida("camara-adicional"),
      ],
    };
    const r = calcHS6(inp);
    expect(r).toMatchSnapshot();
    const barrera = r.porMedida.find((m) => m.id === "barrera-mala-lamina")!;
    // La lámina fuera de umbral descalifica la barrera: NO cuenta y estado fail.
    expect(barrera.cuenta).toBe(false);
    expect(barrera.estado).toBe("fail");
    // Sin barrera válida en Zona II ⇒ NO CUMPLE.
    expect(r.combinacionSuficiente).toBe(false);
    expect(r.veredictoGlobal).toBe("fail");
  });

  it("Zona I: espacio de contención NATURAL infra-dimensionado (área < 10·perímetro) → falla el requisito", () => {
    const perimetro_m = 40;
    const inp: HS6Inputs = {
      zona: "I",
      localHabitableEnContactoConTerreno: true,
      soluciones: [
        {
          tipo: "espacio_contencion",
          id: "camara-infra",
          ventilacion: "natural",
          perimetro_m,
          // Por debajo del criterio geométrico exigido.
          areaAberturas_cm2: PE.areaAberturasMin_cm2_ml * perimetro_m - 50,
          alturaCamara_mm: PE.alturaMinCamara_mm + 20,
        },
      ],
    };
    const r = calcHS6(inp);
    expect(r).toMatchSnapshot();
    const camara = r.porMedida.find((m) => m.id === "camara-infra")!;
    expect(camara.cuenta).toBe(false);
    const reqVent = camara.requisitos.find((q) => q.clave === "ventilacion-natural")!;
    expect(reqVent.estado).toBe("fail");
    // Única medida de Zona I no cuenta ⇒ NO CUMPLE.
    expect(r.combinacionSuficiente).toBe(false);
    expect(r.veredictoGlobal).toBe("fail");
  });

  it("zona 'sin_exigencia' → aplica=false, veredicto OK 'sin exigencia', sin requerir soluciones", () => {
    const inp: HS6Inputs = {
      zona: "sin_exigencia",
      localHabitableEnContactoConTerreno: true,
      soluciones: [],
    };
    const r = calcHS6(inp);
    expect(r).toMatchSnapshot();
    expect(r.aplica).toBe(false);
    expect(r.motivoNoAplica).not.toBeNull();
    expect(r.combinacionSuficiente).toBe(true); // no se exige nada
    expect(r.veredictoGlobal).toBe("ok");
    expect(r.elementoCriticoId).toBeNull();
  });

  it("local sin contacto con el terreno (localHabitable...=false) → aplica=false, veredicto OK", () => {
    const inp: HS6Inputs = {
      zona: "II", // aunque la zona exija, el ámbito NO aplica
      localHabitableEnContactoConTerreno: false,
      soluciones: [],
    };
    const r = calcHS6(inp);
    expect(r).toMatchSnapshot();
    expect(r.aplica).toBe(false);
    expect(r.motivoNoAplica).not.toBeNull();
    expect(r.veredictoGlobal).toBe("ok");
  });

  it("Zona II: barrera vía 'calculo' (Nivel B DIFERIDO) → no cuenta + warn de pendiente", () => {
    const inp: HS6Inputs = {
      zona: "II",
      localHabitableEnContactoConTerreno: true,
      soluciones: [
        {
          tipo: "barrera",
          id: "barrera-calculo",
          via: "calculo",
          continuidadSellada: true,
          penetracionesSelladas: true,
          puertasEstancas: true,
        },
        contencionNaturalValida("camara-adicional"),
      ],
    };
    const r = calcHS6(inp);
    expect(r).toMatchSnapshot();
    const barrera = r.porMedida.find((m) => m.id === "barrera-calculo")!;
    // La vía por cálculo (Nivel B) está diferida: NO cuenta como barrera válida.
    expect(barrera.cuenta).toBe(false);
    expect(barrera.estado).toBe("warn");
    expect(barrera.requisitos.some((q) => q.clave === "via-calculo" && q.estado === "warn")).toBe(true);
    // Sin barrera válida en Zona II ⇒ NO CUMPLE; y warn de pendiente emitido.
    expect(r.combinacionSuficiente).toBe(false);
    expect(r.warnings.some((w) => /c[áa]lculo/i.test(w) && /(pendiente|soportada)/i.test(w))).toBe(true);
  });
});

// =============================================================================
// DETERMINISMO (SPEC §4) — calcHS6 es pura: mismo input → mismo output.
// =============================================================================

describe("calcHS6 — determinismo (sin Date/random)", () => {
  it("mismo input → mismo output, 10 llamadas idénticas (defaults)", () => {
    const primero = calcHS6(hs6Defaults);
    for (let i = 0; i < 10; i++) {
      expect(calcHS6(hs6Defaults)).toEqual(primero);
    }
  });

  it("mismo input → mismo output (varios escenarios)", () => {
    const escenarios: HS6Inputs[] = [
      { zona: "I", localHabitableEnContactoConTerreno: true, soluciones: [barreraValida()] },
      {
        zona: "II",
        localHabitableEnContactoConTerreno: true,
        soluciones: [barreraValida(), despresurizacionValida()],
      },
      { zona: "sin_exigencia", localHabitableEnContactoConTerreno: true, soluciones: [] },
      { zona: "II", localHabitableEnContactoConTerreno: false, soluciones: [] },
    ];
    for (const inp of escenarios) {
      expect(calcHS6(inp)).toEqual(calcHS6(inp));
    }
  });
});

// =============================================================================
// GENERADORES fast-check — listas de soluciones (uniones discriminadas por tipo).
// =============================================================================

const arbZonaAplicable: fc.Arbitrary<ZonaRadon> = fc.constantFrom("I", "II");
const arbZona: fc.Arbitrary<ZonaRadon> = fc.constantFrom("I", "II", "sin_exigencia");

/** Booleano del checklist (sesgado a `true` para producir más medidas válidas). */
const arbBool = fc.boolean();

/** Coef. de difusión a ambos lados del umbral (válidos e inválidos). */
const arbCoef: fc.Arbitrary<number> = fc.double({
  min: PB.coefDifusionMax_m2_s / 100,
  max: PB.coefDifusionMax_m2_s * 100,
  noNaN: true,
  noDefaultInfinity: true,
});

/** Espesor a ambos lados del mínimo. */
const arbEspesor: fc.Arbitrary<number> = fc.double({
  min: 0.1,
  max: PB.espesorMin_mm * 3,
  noNaN: true,
  noDefaultInfinity: true,
});

/** Perímetro de cámara plausible [m]. */
const arbPerimetro: fc.Arbitrary<number> = fc.double({
  min: 1,
  max: 200,
  noNaN: true,
  noDefaultInfinity: true,
});

/** Área de aberturas plausible [cm²], a ambos lados del criterio geométrico. */
const arbArea: fc.Arbitrary<number> = fc.double({
  min: 0,
  max: 5000,
  noNaN: true,
  noDefaultInfinity: true,
});

/** Altura de cámara plausible [mm], a ambos lados del mínimo. */
const arbAltura: fc.Arbitrary<number> = fc.double({
  min: 0,
  max: PE.alturaMinCamara_mm * 4,
  noNaN: true,
  noDefaultInfinity: true,
});

/** Una barrera arbitraria (vía lámina-tipo o cálculo, checklist aleatorio). */
function arbBarrera(idx: number): fc.Arbitrary<SolucionBarreraInput> {
  return fc.record({
    tipo: fc.constant("barrera" as const),
    id: fc.constant(`barrera-${idx}`),
    via: fc.constantFrom("lamina_tipo" as const, "calculo" as const),
    continuidadSellada: arbBool,
    penetracionesSelladas: arbBool,
    puertasEstancas: arbBool,
    coefDifusion_m2_s: arbCoef,
    espesor_mm: arbEspesor,
  });
}

/** Un espacio de contención arbitrario (natural o mecánico). */
function arbContencion(idx: number): fc.Arbitrary<SolucionEspacioContencionInput> {
  return fc.record({
    tipo: fc.constant("espacio_contencion" as const),
    id: fc.constant(`camara-${idx}`),
    ventilacion: fc.constantFrom("natural" as const, "mecanica" as const),
    perimetro_m: arbPerimetro,
    areaAberturas_cm2: arbArea,
    alturaCamara_mm: arbAltura,
  });
}

/** Una despresurización arbitraria (checklist aleatorio). */
function arbDespresurizacion(idx: number): fc.Arbitrary<SolucionDespresurizacionInput> {
  return fc.record({
    tipo: fc.constant("despresurizacion" as const),
    id: fc.constant(`despr-${idx}`),
    redCaptacion: arbBool,
    extraccionMecanica: arbBool,
    geotextil: arbBool,
  });
}

/** Una solución arbitraria de cualquiera de los tres tipos, con id estable por índice. */
function arbSolucion(idx: number): fc.Arbitrary<SolucionHS6Input> {
  return fc.oneof(arbBarrera(idx), arbContencion(idx), arbDespresurizacion(idx));
}

/** Lista de soluciones (0..5) con ids estables y deterministas por posición. */
const arbSoluciones: fc.Arbitrary<SolucionHS6Input[]> = fc
  .array(fc.nat({ max: 2 }), { minLength: 0, maxLength: 5 })
  .chain((tipos) =>
    fc.tuple(
      ...tipos.map((t, i) =>
        t === 0 ? arbBarrera(i) : t === 1 ? arbContencion(i) : arbDespresurizacion(i),
      ),
    ),
  ) as fc.Arbitrary<SolucionHS6Input[]>;

// Variante simple (suficiente para invariantes que no dependen de la mezcla fina).
const arbSolucionesSimple: fc.Arbitrary<SolucionHS6Input[]> = fc.array(
  fc.nat({ max: 4 }).chain((i) => arbSolucion(i)),
  { minLength: 0, maxLength: 5 },
);

// =============================================================================
// PROPERTY-BASED (invariantes normativos del feature-5, @fast-check/vitest)
// =============================================================================

describe("calcHS6 — invariantes (property-based)", () => {
  // (1) MONOTONÍA DE EXIGENCIA: la Zona II exige al menos tantas medidas como la
  //     Zona I, y SIEMPRE exige barrera. (Estructura de la tabla art. 3.1.)
  test.prop([arbSoluciones])(
    "nMedidasMin(II) ≥ nMedidasMin(I) y Zona II exige barrera",
    (soluciones) => {
      const base = { localHabitableEnContactoConTerreno: true as const };
      const rI = calcHS6({ zona: "I", ...base, soluciones });
      const rII = calcHS6({ zona: "II", ...base, soluciones });
      expect(rII.nMedidasMin).toBeGreaterThanOrEqual(rI.nMedidasMin);
      expect(rII.barreraObligatoria).toBe(true);
      expect(rI.barreraObligatoria).toBe(false);
      // Coherencia con la tabla normativa (origen de la cifra).
      expect(rI.nMedidasMin).toBe(requisitoDeZona("I").nMedidasMin);
      expect(rII.nMedidasMin).toBe(requisitoDeZona("II").nMedidasMin);
    },
  );

  // (2) INCLUSIÓN: una combinación de soluciones que SATISFACE la Zona II (la más
  //     exigente) también satisface la Zona I con la MISMA entrada. (Si II cumple,
  //     hay barrera válida ⇒ en I la barrera cuenta como la única medida exigida.)
  test.prop([arbSoluciones])(
    "combinación suficiente en Zona II ⇒ suficiente en Zona I (misma entrada)",
    (soluciones) => {
      const base = { localHabitableEnContactoConTerreno: true as const };
      const rII = calcHS6({ zona: "II", ...base, soluciones });
      const rI = calcHS6({ zona: "I", ...base, soluciones });
      if (rII.combinacionSuficiente) {
        expect(rI.combinacionSuficiente).toBe(true);
      }
    },
  );

  // (3) NO APLICA ⇒ NO EXIGE: si la zona es "sin_exigencia" o el local no está en
  //     contacto con el terreno, HS6 no exige medidas: aplica=false y el veredicto
  //     NO puede ser 'fail' (a lo sumo ok/warn informativo).
  test.prop([arbZona, fc.boolean(), arbSolucionesSimple])(
    "zona sin_exigencia o sin contacto con terreno ⇒ aplica=false y veredicto ≠ fail",
    (zona, contacto, soluciones) => {
      const noAplicaPorZona = zona === "sin_exigencia";
      const noAplicaPorAmbito = contacto === false;
      fc.pre(noAplicaPorZona || noAplicaPorAmbito);
      const r = calcHS6({ zona, localHabitableEnContactoConTerreno: contacto, soluciones });
      expect(r.aplica).toBe(false);
      expect(r.veredictoGlobal).not.toBe("fail");
      expect(r.motivoNoAplica).not.toBeNull();
      expect(r.elementoCriticoId).toBeNull();
    },
  );

  // (4) VEREDICTO SIEMPRE DEFINIDO: para CUALQUIER input (zona, ámbito, soluciones)
  //     el veredicto global pertenece al conjunto cerrado de veredictos. El motor
  //     no lanza ni produce estados fuera de dominio.
  const VEREDICTOS = ["ok", "warn", "fail", "neutral"] as const;
  test.prop([arbZona, fc.boolean(), arbSolucionesSimple])(
    "veredictoGlobal ∈ {ok,warn,fail,neutral} para cualquier input",
    (zona, contacto, soluciones) => {
      const r = calcHS6({ zona, localHabitableEnContactoConTerreno: contacto, soluciones });
      expect(VEREDICTOS).toContain(r.veredictoGlobal);
      // Y nunca lanza: el resultado es un objeto coherente.
      expect(Array.isArray(r.porMedida)).toBe(true);
      expect(Array.isArray(r.warnings)).toBe(true);
    },
  );

  // (5a) COHERENCIA DE RECUENTO: nMedidasValidas nunca supera el nº de soluciones
  //      propuestas (no se "inventan" medidas), y es ≥ 0.
  test.prop([arbZona, fc.boolean(), arbSolucionesSimple])(
    "nMedidasValidas ∈ [0, nº soluciones]",
    (zona, contacto, soluciones) => {
      const r = calcHS6({ zona, localHabitableEnContactoConTerreno: contacto, soluciones });
      expect(r.nMedidasValidas).toBeGreaterThanOrEqual(0);
      expect(r.nMedidasValidas).toBeLessThanOrEqual(soluciones.length);
      // porMedida refleja 1:1 las soluciones de entrada (informativo aunque no aplique).
      expect(r.porMedida).toHaveLength(soluciones.length);
    },
  );

  // (5b) COHERENCIA DE VEREDICTO: si la combinación es suficiente Y todas las
  //      medidas están en 'ok' (sin warn de remisión / vía diferida / altura
  //      no aportada), el veredicto global es 'ok'.
  const VENTILACION_NATURAL_OK = fc.constant("natural" as const);
  /** Genera soluciones que, cuando cuentan, lo hacen sin estados 'warn' colaterales. */
  const arbSolucionLimpia = (idx: number): fc.Arbitrary<SolucionHS6Input> =>
    fc.oneof(
      // Barrera SIEMPRE válida (vía lámina-tipo en umbral, checklist completo).
      fc.constant(barreraValida(`barrera-${idx}`)),
      // Cámara natural bien dimensionada (sin warn de remisión; altura aportada).
      fc.record({
        tipo: fc.constant("espacio_contencion" as const),
        id: fc.constant(`camara-${idx}`),
        ventilacion: VENTILACION_NATURAL_OK,
        perimetro_m: fc.double({ min: 1, max: 100, noNaN: true, noDefaultInfinity: true }),
      }).chain((s) =>
        fc.double({ min: 0, max: 2000, noNaN: true, noDefaultInfinity: true }).map((extra) => ({
          ...s,
          // Siempre ≥ criterio (área = exigida + extra ≥ 0).
          areaAberturas_cm2: PE.areaAberturasMin_cm2_ml * s.perimetro_m + extra,
          alturaCamara_mm: PE.alturaMinCamara_mm + 10,
        })),
      ),
      // Despresurización completa (válida, sin warn).
      fc.constant(despresurizacionValida(`despr-${idx}`)),
    );

  test.prop([
    arbZonaAplicable,
    fc.array(fc.nat({ max: 4 }).chain((i) => arbSolucionLimpia(i)), { minLength: 1, maxLength: 5 }),
  ])(
    "combinación suficiente + todas las medidas 'ok' ⇒ veredicto 'ok'",
    (zona, soluciones) => {
      const r = calcHS6({ zona, localHabitableEnContactoConTerreno: true, soluciones });
      const todasOk = r.porMedida.every((m) => m.estado === "ok");
      if (r.combinacionSuficiente && todasOk) {
        expect(r.veredictoGlobal).toBe("ok");
        expect(r.elementoCriticoId).toBeNull();
      }
    },
  );

  // (6) DETERMINISMO general sobre inputs arbitrarios (mismo input → mismo output).
  test.prop([arbZona, fc.boolean(), arbSolucionesSimple])(
    "determinista: mismo input → mismo output",
    (zona, contacto, soluciones) => {
      const inp: HS6Inputs = { zona, localHabitableEnContactoConTerreno: contacto, soluciones };
      expect(calcHS6(inp)).toEqual(calcHS6(inp));
    },
  );
});
