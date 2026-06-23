import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  calcHS3,
  categoriaDeDormitorios,
  hs3Defaults,
  type Estancia,
  type HS3Inputs,
  type TipoEstancia,
} from "../calc";
import type { ZonaTermica } from "../tablas";

// =============================================================================
// HS3 — motor determinista. Snapshots commiteados (SPEC §5) + property-based.
// =============================================================================

// --- Inputs de referencia para los snapshots por categoría -------------------

const inputs2Dorm: HS3Inputs = hs3Defaults;

const inputs01Dorm: HS3Inputs = {
  numDormitorios: 1,
  estancias: [
    { id: "dorm-pral", tipo: "dorm_principal", caudalPropuesto_l_s: 8 },
    { id: "salon", tipo: "salon_comedor", caudalPropuesto_l_s: 6 },
    {
      id: "cocina",
      tipo: "cocina",
      caudalPropuesto_l_s: 6,
      esCoccion: true,
      caudalCoccion_l_s: 50,
    },
    { id: "bano", tipo: "bano", caudalPropuesto_l_s: 6 },
  ],
  zonaTermica: "W",
  numPlantasConducto: 1,
};

const inputs3Dorm: HS3Inputs = {
  numDormitorios: 3,
  estancias: [
    { id: "dorm-pral", tipo: "dorm_principal", caudalPropuesto_l_s: 8 },
    { id: "dorm-1", tipo: "dormitorio", caudalPropuesto_l_s: 4 },
    { id: "dorm-2", tipo: "dormitorio", caudalPropuesto_l_s: 4 },
    { id: "salon", tipo: "salon_comedor", caudalPropuesto_l_s: 10 },
    {
      id: "cocina",
      tipo: "cocina",
      caudalPropuesto_l_s: 8,
      esCoccion: true,
      caudalCoccion_l_s: 50,
    },
    { id: "bano", tipo: "bano", caudalPropuesto_l_s: 17 },
    { id: "aseo", tipo: "aseo", caudalPropuesto_l_s: 8 },
  ],
  zonaTermica: "Z",
  numPlantasConducto: 2,
};

describe("calcHS3 — categoría de dormitorios", () => {
  it("deriva la categoría de la Tabla 2.1 desde numDormitorios", () => {
    expect(categoriaDeDormitorios(0)).toBe("0-1");
    expect(categoriaDeDormitorios(1)).toBe("0-1");
    expect(categoriaDeDormitorios(2)).toBe("2");
    expect(categoriaDeDormitorios(3)).toBe("3+");
    expect(categoriaDeDormitorios(7)).toBe("3+");
  });
});

describe("calcHS3 — snapshots por categoría (SPEC §5)", () => {
  it("vivienda 0-1 dormitorio", () => {
    expect(calcHS3(inputs01Dorm)).toMatchInlineSnapshot(`
      {
        "areaPaso_cm2": 112,
        "balanceOk": false,
        "categoriaDormitorios": "0-1",
        "caudalEquilibrado_l_s": 14,
        "conducto": {
          "aviso": "Sección mínima exigida (Tabla 4.2) para clase de tiro T-3 (1 planta, zona W).",
          "claseTiro": "T-3",
          "conductoVerificado": true,
          "conductos": [
            {
              "n": 1,
              "seccion_cm2": 625,
            },
          ],
          "estado": "neutral",
          "qvt_l_s": 12,
          "seccionRequerida_cm2": 625,
        },
        "estadoBalance": "warn",
        "estadoHumedosTotal": "ok",
        "humedosTotalOk": true,
        "humedosTotalPropuesto_l_s": 12,
        "humedosTotalRequerido_l_s": 12,
        "noOcupacion_l_s": 6,
        "porEstancia": [
          {
            "areaAbertura_cm2": 32,
            "caudalCoccion_l_s": null,
            "caudalPropuesto_l_s": 8,
            "caudalRequerido_l_s": 8,
            "cumple": true,
            "cumpleCoccion": null,
            "esCoccion": false,
            "esHumedo": false,
            "estado": "ok",
            "id": "dorm-pral",
            "tipo": "dorm_principal",
            "tipoAbertura": "admision",
          },
          {
            "areaAbertura_cm2": 24,
            "caudalCoccion_l_s": null,
            "caudalPropuesto_l_s": 6,
            "caudalRequerido_l_s": 6,
            "cumple": true,
            "cumpleCoccion": null,
            "esCoccion": false,
            "esHumedo": false,
            "estado": "ok",
            "id": "salon",
            "tipo": "salon_comedor",
            "tipoAbertura": "admision",
          },
          {
            "areaAbertura_cm2": 24,
            "caudalCoccion_l_s": 50,
            "caudalPropuesto_l_s": 6,
            "caudalRequerido_l_s": 6,
            "cumple": true,
            "cumpleCoccion": true,
            "esCoccion": true,
            "esHumedo": true,
            "estado": "ok",
            "id": "cocina",
            "tipo": "cocina",
            "tipoAbertura": "extraccion",
          },
          {
            "areaAbertura_cm2": 24,
            "caudalCoccion_l_s": null,
            "caudalPropuesto_l_s": 6,
            "caudalRequerido_l_s": 6,
            "cumple": true,
            "cumpleCoccion": null,
            "esCoccion": false,
            "esHumedo": true,
            "estado": "ok",
            "id": "bano",
            "tipo": "bano",
            "tipoAbertura": "extraccion",
          },
        ],
        "totalAdmision_l_s": 14,
        "totalExtraccion_l_s": 12,
        "veredictoGlobal": "warn",
        "warnings": [
          "Admisión (14 l/s) y extracción (12 l/s) no están equilibradas; se equilibran al mayor (14 l/s).",
        ],
      }
    `);
  });

  it("vivienda 2 dormitorios (defaults)", () => {
    expect(calcHS3(inputs2Dorm)).toMatchInlineSnapshot(`
      {
        "areaPaso_cm2": 192,
        "balanceOk": false,
        "categoriaDormitorios": "2",
        "caudalEquilibrado_l_s": 24,
        "conducto": {
          "aviso": "Sección mínima exigida (Tabla 4.2) para clase de tiro T-3 (1 planta, zona X).",
          "claseTiro": "T-3",
          "conductoVerificado": true,
          "conductos": [
            {
              "n": 1,
              "seccion_cm2": 625,
            },
          ],
          "estado": "neutral",
          "qvt_l_s": 24,
          "seccionRequerida_cm2": 625,
        },
        "estadoBalance": "warn",
        "estadoHumedosTotal": "ok",
        "humedosTotalOk": true,
        "humedosTotalPropuesto_l_s": 24,
        "humedosTotalRequerido_l_s": 24,
        "noOcupacion_l_s": 7.5,
        "porEstancia": [
          {
            "areaAbertura_cm2": 32,
            "caudalCoccion_l_s": null,
            "caudalPropuesto_l_s": 8,
            "caudalRequerido_l_s": 8,
            "cumple": true,
            "cumpleCoccion": null,
            "esCoccion": false,
            "esHumedo": false,
            "estado": "ok",
            "id": "dorm-pral",
            "tipo": "dorm_principal",
            "tipoAbertura": "admision",
          },
          {
            "areaAbertura_cm2": 16,
            "caudalCoccion_l_s": null,
            "caudalPropuesto_l_s": 4,
            "caudalRequerido_l_s": 4,
            "cumple": true,
            "cumpleCoccion": null,
            "esCoccion": false,
            "esHumedo": false,
            "estado": "ok",
            "id": "dorm-1",
            "tipo": "dormitorio",
            "tipoAbertura": "admision",
          },
          {
            "areaAbertura_cm2": 32,
            "caudalCoccion_l_s": null,
            "caudalPropuesto_l_s": 8,
            "caudalRequerido_l_s": 8,
            "cumple": true,
            "cumpleCoccion": null,
            "esCoccion": false,
            "esHumedo": false,
            "estado": "ok",
            "id": "salon",
            "tipo": "salon_comedor",
            "tipoAbertura": "admision",
          },
          {
            "areaAbertura_cm2": 28,
            "caudalCoccion_l_s": 50,
            "caudalPropuesto_l_s": 16,
            "caudalRequerido_l_s": 7,
            "cumple": true,
            "cumpleCoccion": true,
            "esCoccion": true,
            "esHumedo": true,
            "estado": "ok",
            "id": "cocina",
            "tipo": "cocina",
            "tipoAbertura": "extraccion",
          },
          {
            "areaAbertura_cm2": 28,
            "caudalCoccion_l_s": null,
            "caudalPropuesto_l_s": 8,
            "caudalRequerido_l_s": 7,
            "cumple": true,
            "cumpleCoccion": null,
            "esCoccion": false,
            "esHumedo": true,
            "estado": "ok",
            "id": "bano",
            "tipo": "bano",
            "tipoAbertura": "extraccion",
          },
        ],
        "totalAdmision_l_s": 20,
        "totalExtraccion_l_s": 24,
        "veredictoGlobal": "warn",
        "warnings": [
          "Admisión (20 l/s) y extracción (24 l/s) no están equilibradas; se equilibran al mayor (24 l/s).",
        ],
      }
    `);
  });

  it("vivienda 3+ dormitorios", () => {
    expect(calcHS3(inputs3Dorm)).toMatchInlineSnapshot(`
      {
        "areaPaso_cm2": 264,
        "balanceOk": false,
        "categoriaDormitorios": "3+",
        "caudalEquilibrado_l_s": 33,
        "conducto": {
          "aviso": "Sección mínima exigida (Tabla 4.2) para clase de tiro T-4 (2 plantas, zona Z).",
          "claseTiro": "T-4",
          "conductoVerificado": true,
          "conductos": [
            {
              "n": 1,
              "seccion_cm2": 625,
            },
          ],
          "estado": "neutral",
          "qvt_l_s": 33,
          "seccionRequerida_cm2": 625,
        },
        "estadoBalance": "warn",
        "estadoHumedosTotal": "ok",
        "humedosTotalOk": true,
        "humedosTotalPropuesto_l_s": 33,
        "humedosTotalRequerido_l_s": 33,
        "noOcupacion_l_s": 10.5,
        "porEstancia": [
          {
            "areaAbertura_cm2": 32,
            "caudalCoccion_l_s": null,
            "caudalPropuesto_l_s": 8,
            "caudalRequerido_l_s": 8,
            "cumple": true,
            "cumpleCoccion": null,
            "esCoccion": false,
            "esHumedo": false,
            "estado": "ok",
            "id": "dorm-pral",
            "tipo": "dorm_principal",
            "tipoAbertura": "admision",
          },
          {
            "areaAbertura_cm2": 16,
            "caudalCoccion_l_s": null,
            "caudalPropuesto_l_s": 4,
            "caudalRequerido_l_s": 4,
            "cumple": true,
            "cumpleCoccion": null,
            "esCoccion": false,
            "esHumedo": false,
            "estado": "ok",
            "id": "dorm-1",
            "tipo": "dormitorio",
            "tipoAbertura": "admision",
          },
          {
            "areaAbertura_cm2": 16,
            "caudalCoccion_l_s": null,
            "caudalPropuesto_l_s": 4,
            "caudalRequerido_l_s": 4,
            "cumple": true,
            "cumpleCoccion": null,
            "esCoccion": false,
            "esHumedo": false,
            "estado": "ok",
            "id": "dorm-2",
            "tipo": "dormitorio",
            "tipoAbertura": "admision",
          },
          {
            "areaAbertura_cm2": 40,
            "caudalCoccion_l_s": null,
            "caudalPropuesto_l_s": 10,
            "caudalRequerido_l_s": 10,
            "cumple": true,
            "cumpleCoccion": null,
            "esCoccion": false,
            "esHumedo": false,
            "estado": "ok",
            "id": "salon",
            "tipo": "salon_comedor",
            "tipoAbertura": "admision",
          },
          {
            "areaAbertura_cm2": 32,
            "caudalCoccion_l_s": 50,
            "caudalPropuesto_l_s": 8,
            "caudalRequerido_l_s": 8,
            "cumple": true,
            "cumpleCoccion": true,
            "esCoccion": true,
            "esHumedo": true,
            "estado": "ok",
            "id": "cocina",
            "tipo": "cocina",
            "tipoAbertura": "extraccion",
          },
          {
            "areaAbertura_cm2": 32,
            "caudalCoccion_l_s": null,
            "caudalPropuesto_l_s": 17,
            "caudalRequerido_l_s": 8,
            "cumple": true,
            "cumpleCoccion": null,
            "esCoccion": false,
            "esHumedo": true,
            "estado": "ok",
            "id": "bano",
            "tipo": "bano",
            "tipoAbertura": "extraccion",
          },
          {
            "areaAbertura_cm2": 32,
            "caudalCoccion_l_s": null,
            "caudalPropuesto_l_s": 8,
            "caudalRequerido_l_s": 8,
            "cumple": true,
            "cumpleCoccion": null,
            "esCoccion": false,
            "esHumedo": true,
            "estado": "ok",
            "id": "aseo",
            "tipo": "aseo",
            "tipoAbertura": "extraccion",
          },
        ],
        "totalAdmision_l_s": 26,
        "totalExtraccion_l_s": 33,
        "veredictoGlobal": "warn",
        "warnings": [
          "Admisión (26 l/s) y extracción (33 l/s) no están equilibradas; se equilibran al mayor (33 l/s).",
        ],
      }
    `);
  });
});

describe("calcHS3 — determinismo", () => {
  it("mismo input → mismo output", () => {
    expect(calcHS3(inputs2Dorm)).toEqual(calcHS3(inputs2Dorm));
    expect(calcHS3(inputs3Dorm)).toEqual(calcHS3(inputs3Dorm));
  });
});

describe("calcHS3 — casos límite (Tabla 2.1)", () => {
  it("justo en el mínimo del local seco cumple (ok)", () => {
    // salón en categoría "2" exige 8 l/s.
    const r = calcHS3({
      ...inputs2Dorm,
      estancias: [{ id: "salon", tipo: "salon_comedor", caudalPropuesto_l_s: 8 }],
    });
    expect(r.porEstancia[0].estado).toBe("ok");
  });

  it("un pelo por debajo del mínimo incumple (fail)", () => {
    const r = calcHS3({
      ...inputs2Dorm,
      estancias: [{ id: "salon", tipo: "salon_comedor", caudalPropuesto_l_s: 7.999 }],
    });
    expect(r.porEstancia[0].estado).toBe("fail");
    expect(r.veredictoGlobal).toBe("fail");
    expect(r.warnings.length).toBeGreaterThan(0);
  });

  it("zona de cocción justo en 50 l/s cumple; 49,9 no (caudal de cocción independiente)", () => {
    const base = (qc: number): HS3Inputs => ({
      ...inputs2Dorm,
      estancias: [
        { id: "cocina", tipo: "cocina", caudalPropuesto_l_s: 7, esCoccion: true, caudalCoccion_l_s: qc },
      ],
    });
    expect(calcHS3(base(50)).porEstancia[0].cumpleCoccion).toBe(true);
    expect(calcHS3(base(49.9)).porEstancia[0].cumpleCoccion).toBe(false);
  });

  it("REGRESIÓN: el aire de cocción NO cuenta como ventilación general húmeda", () => {
    // Cocina con extracción general 7 (= mínimo por local cat "2") + cocción 50,
    // y baño 7. Antes: húmedos total = 50+7 = 57 ≥ 24 → CUMPLE (falso).
    // Ahora: húmedos general = 7+7 = 14 < 24 → INCUMPLE (correcto). La cocción
    // se verifica aparte y no infla húmedos ni el qvt del conducto.
    const r = calcHS3({
      ...inputs2Dorm,
      estancias: [
        { id: "cocina", tipo: "cocina", caudalPropuesto_l_s: 7, esCoccion: true, caudalCoccion_l_s: 50 },
        { id: "bano", tipo: "bano", caudalPropuesto_l_s: 7 },
      ],
    });
    expect(r.humedosTotalPropuesto_l_s).toBe(14); // NO 57
    expect(r.humedosTotalOk).toBe(false);
    expect(r.veredictoGlobal).toBe("fail");
    expect(r.conducto.qvt_l_s).toBe(14); // qvt no incluye los 50 de cocción
    expect(r.porEstancia[0].cumpleCoccion).toBe(true); // la cocción sí cumple aparte
  });

  it("húmedos: total de vivienda por debajo del mínimo → fail", () => {
    // Categoría "2" exige 24 l/s totales de húmedos.
    const r = calcHS3({
      ...inputs2Dorm,
      estancias: [
        { id: "cocina", tipo: "cocina", caudalPropuesto_l_s: 10 },
        { id: "bano", tipo: "bano", caudalPropuesto_l_s: 10 },
      ],
    });
    expect(r.humedosTotalPropuesto_l_s).toBe(20);
    expect(r.humedosTotalRequerido_l_s).toBe(24);
    expect(r.humedosTotalOk).toBe(false);
    expect(r.veredictoGlobal).toBe("fail");
  });
});

describe("calcHS3 — conducto de extracción (Tablas 4.2/4.3 verificadas)", () => {
  it("el conducto es un dimensionado verificado (neutral, sin pendiente)", () => {
    const r = calcHS3(inputs2Dorm);
    expect(r.conducto.conductoVerificado).toBe(true);
    expect(r.conducto.estado).toBe("neutral");
    expect(r.conducto.aviso).toMatch(/Sección mínima exigida \(Tabla 4\.2\)/i);
  });

  it("el conducto NO degrada el veredicto global (vivienda equilibrada → ok)", () => {
    // Vivienda categoría "2" que cumple TODO lo real Y está equilibrada
    // (admisión = extracción = 24): el global es `ok` pese al conducto neutral.
    const r = calcHS3({
      numDormitorios: 2,
      estancias: [
        { id: "dorm-pral", tipo: "dorm_principal", caudalPropuesto_l_s: 12 },
        { id: "salon", tipo: "salon_comedor", caudalPropuesto_l_s: 12 },
        { id: "cocina", tipo: "cocina", caudalPropuesto_l_s: 16 },
        { id: "bano", tipo: "bano", caudalPropuesto_l_s: 8 },
      ],
      zonaTermica: "X",
      numPlantasConducto: 1,
    });
    expect(r.balanceOk).toBe(true);
    expect(r.veredictoGlobal).toBe("ok");
    // El conducto es un resultado de dimensionado (neutral): no afecta al global.
    expect(r.conducto.estado).toBe("neutral");
    expect(r.conducto.conductoVerificado).toBe(true);
  });

  it("clase de tiro de la Tabla 4.3 (verificada) por nº de plantas y zona", () => {
    // Esquinas y un par de celdas internas de la matriz verificada (p. 71).
    const tiro = (n: number, zona: ZonaTermica) =>
      calcHS3({ ...inputs2Dorm, numPlantasConducto: n, zonaTermica: zona }).conducto.claseTiro;
    expect(tiro(1, "Z")).toBe("T-4"); // 1 planta, zona cálida → menor tiro
    expect(tiro(1, "W")).toBe("T-3");
    expect(tiro(2, "Z")).toBe("T-4");
    expect(tiro(4, "Y")).toBe("T-2");
    expect(tiro(7, "Z")).toBe("T-2"); // celda T-2 aislada
    expect(tiro(8, "W")).toBe("T-1"); // muchas plantas, zona fría → mayor tiro
    expect(tiro(20, "W")).toBe("T-1"); // satura en 8 (≥8)
  });

  it("Tabla 4.3 es monótona: clase no aumenta con más plantas ni zona más fría", () => {
    const nivel: Record<string, number> = { "T-1": 1, "T-2": 2, "T-3": 3, "T-4": 4 };
    const zonas: ZonaTermica[] = ["W", "X", "Y", "Z"];
    for (let n = 1; n <= 8; n++) {
      for (let z = 0; z < zonas.length; z++) {
        const cur = nivel[calcHS3({ ...inputs2Dorm, numPlantasConducto: n, zonaTermica: zonas[z] }).conducto.claseTiro];
        if (n < 8) {
          const masPlantas = nivel[calcHS3({ ...inputs2Dorm, numPlantasConducto: n + 1, zonaTermica: zonas[z] }).conducto.claseTiro];
          expect(masPlantas).toBeLessThanOrEqual(cur); // más plantas → no aumenta
        }
        if (z < zonas.length - 1) {
          const zonaMasCalida = nivel[calcHS3({ ...inputs2Dorm, numPlantasConducto: n, zonaTermica: zonas[z + 1] }).conducto.claseTiro];
          expect(zonaMasCalida).toBeGreaterThanOrEqual(cur); // W→Z → no disminuye
        }
      }
    }
  });
});

// =============================================================================
// PROPERTY-BASED (invariantes normativos, @fast-check/vitest)
// =============================================================================

const arbTipo: fc.Arbitrary<TipoEstancia> = fc.constantFrom(
  "dorm_principal",
  "dormitorio",
  "salon_comedor",
  "cocina",
  "bano",
  "aseo",
);

const arbZona: fc.Arbitrary<ZonaTermica> = fc.constantFrom("W", "X", "Y", "Z");
const arbPlantas: fc.Arbitrary<number> = fc.integer({ min: 1, max: 12 });

describe("calcHS3 — invariantes (property-based)", () => {
  // Monotonía: subir el caudal propuesto de una estancia nunca empeora su
  // veredicto (de fail no puede empeorar; de ok no puede volverse fail).
  test.prop([
    arbTipo,
    fc.double({ min: 0, max: 300, noNaN: true }),
    fc.double({ min: 0, max: 300, noNaN: true }),
    fc.integer({ min: 0, max: 6 }),
  ])("monotonía: más caudal nunca empeora el veredicto de la estancia", (tipo, a, b, nd) => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const mk = (q: number): HS3Inputs => ({
      numDormitorios: nd,
      estancias: [{ id: "x", tipo, caudalPropuesto_l_s: q }],
      zonaTermica: "X",
      numPlantasConducto: 1,
    });
    const eLo = calcHS3(mk(lo)).porEstancia[0];
    const eHi = calcHS3(mk(hi)).porEstancia[0];
    if (eLo.cumple) expect(eHi.cumple).toBe(true);
  });

  // El área de paso siempre respeta el mínimo normativo de 70 cm².
  test.prop([
    fc.array(
      fc.record({
        id: fc.string({ minLength: 1, maxLength: 4 }),
        tipo: arbTipo,
        caudalPropuesto_l_s: fc.double({ min: 0, max: 300, noNaN: true }),
      }),
      { maxLength: 8 },
    ),
    fc.integer({ min: 0, max: 6 }),
    arbZona,
    arbPlantas,
  ])("el área de paso siempre es ≥ 70 cm²", (estancias, nd, zona, nPlantas) => {
    const r = calcHS3({ numDormitorios: nd, estancias: estancias as Estancia[], zonaTermica: zona, numPlantasConducto: nPlantas });
    expect(r.areaPaso_cm2).toBeGreaterThanOrEqual(70);
  });

  // Coherencia: humedosTotalPropuesto = suma de extracción de húmedos.
  test.prop([
    fc.array(
      fc.record({
        id: fc.string({ minLength: 1, maxLength: 4 }),
        tipo: arbTipo,
        caudalPropuesto_l_s: fc.double({ min: 0, max: 300, noNaN: true }),
      }),
      { maxLength: 8 },
    ),
    fc.integer({ min: 0, max: 6 }),
  ])("humedosTotalPropuesto = suma de extracción de húmedos", (estancias, nd) => {
    const r = calcHS3({
      numDormitorios: nd,
      estancias: estancias as Estancia[],
      zonaTermica: "X",
      numPlantasConducto: 1,
    });
    const sumaHumedos = r.porEstancia
      .filter((e) => e.esHumedo)
      .reduce((acc, e) => acc + e.caudalPropuesto_l_s, 0);
    expect(r.humedosTotalPropuesto_l_s).toBeCloseTo(sumaHumedos, 9);
    // Y la extracción total agregada coincide (todos los húmedos son extracción).
    expect(r.totalExtraccion_l_s).toBeCloseTo(sumaHumedos, 9);
  });

  // Sección del conducto NO decrece al subir qvt (misma clase de tiro: fijamos
  // posición y zona). Tabla 4.2 es monótona no decreciente por tramos.
  test.prop([
    fc.double({ min: 0, max: 1000, noNaN: true }),
    fc.double({ min: 0, max: 1000, noNaN: true }),
    arbPlantas,
    arbZona,
  ])("sección de conducto no decrece al subir qvt (misma clase de tiro)", (a, b, nPlantas, zona) => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    // Construimos dos viviendas con una sola estancia húmeda (cocina) para que
    // qvt = caudal de esa estancia, manteniendo nº de plantas y zona constantes.
    const mk = (q: number): HS3Inputs => ({
      numDormitorios: 2,
      estancias: [{ id: "c", tipo: "cocina", caudalPropuesto_l_s: q }],
      zonaTermica: zona,
      numPlantasConducto: nPlantas,
    });
    const rLo = calcHS3(mk(lo)).conducto;
    const rHi = calcHS3(mk(hi)).conducto;
    expect(rHi.claseTiro).toBe(rLo.claseTiro);
    expect(rHi.seccionRequerida_cm2).toBeGreaterThanOrEqual(rLo.seccionRequerida_cm2);
  });

  // Determinismo general: cualquier input → mismo output.
  test.prop([
    fc.array(
      fc.record({
        id: fc.string({ minLength: 1, maxLength: 4 }),
        tipo: arbTipo,
        caudalPropuesto_l_s: fc.double({ min: 0, max: 300, noNaN: true }),
        esCoccion: fc.boolean(),
      }),
      { maxLength: 6 },
    ),
    fc.integer({ min: 0, max: 6 }),
    arbZona,
    arbPlantas,
  ])("determinista: mismo input → mismo output", (estancias, nd, zona, nPlantas) => {
    const inp: HS3Inputs = {
      numDormitorios: nd,
      estancias: estancias as Estancia[],
      zonaTermica: zona,
      numPlantasConducto: nPlantas,
    };
    expect(calcHS3(inp)).toEqual(calcHS3(inp));
  });
});

// =============================================================================
// MODO RED (avanzado) — red colectiva multiplanta sobre el kernel de grafo.
// =============================================================================

describe("calcHS3 — modo red (avanzado)", () => {
  // Red de referencia: 1 colectivo, 2 plantas (niveles 0 y 1), cada planta con
  // cocina(16) + baño(8) = 24 l/s de extracción general.
  const mkRed = (over: Partial<HS3Inputs> = {}): HS3Inputs => ({
    numDormitorios: 2,
    estancias: [
      { id: "coc0", tipo: "cocina", caudalPropuesto_l_s: 16 },
      { id: "ba0", tipo: "bano", caudalPropuesto_l_s: 8 },
      { id: "coc1", tipo: "cocina", caudalPropuesto_l_s: 16 },
      { id: "ba1", tipo: "bano", caudalPropuesto_l_s: 8 },
    ],
    zonaTermica: "X",
    numPlantasConducto: 1,
    modoConducto: "avanzado",
    redColectivos: [
      {
        id: "C1",
        plantas: [
          { nivel: 0, estanciasIds: ["coc0", "ba0"] },
          { nivel: 1, estanciasIds: ["coc1", "ba1"] },
        ],
      },
    ],
    ...over,
  });

  it("modo rápido (por defecto) NO incluye sub-resultado de red", () => {
    expect(calcHS3(hs3Defaults).red).toBeUndefined();
  });

  it("modo avanzado dimensiona la red: válida, span, qvt en boca y un único «manda»", () => {
    const r = calcHS3(mkRed());
    expect(r.red).toBeDefined();
    const red = r.red!;
    expect(red.estadoRed.valida).toBe(true);
    expect(red.estadoRed.bloqueos).toHaveLength(0);
    expect(red.colectivos).toHaveLength(1);
    const col = red.colectivos[0];
    expect(col.plantasServidas).toBe(2); // niveles {0,1} → span 2
    expect(col.qvtBoca_l_s).toBeCloseTo(48, 9); // 24 + 24
    // Todos los tramos son dimensionado (neutral) y hay exactamente un «manda».
    const todos = red.colectivos.flatMap((c) => c.tramos);
    expect(todos.every((t) => t.estado === "neutral")).toBe(true);
    expect(todos.filter((t) => t.esManda)).toHaveLength(1);
  });

  it("qvt acumulado no decrece hacia la raíz (la boca lleva el máximo)", () => {
    const red = calcHS3(mkRed()).red!;
    for (const col of red.colectivos) {
      const boca = col.tramos.find((t) => t.nivel === null)!;
      for (const t of col.tramos) {
        expect(boca.qvtAcum_l_s).toBeGreaterThanOrEqual(t.qvtAcum_l_s);
      }
    }
  });

  it("REGRESIÓN: la cocción (50 l/s) NO entra en el qvt de la red", () => {
    // Una sola planta con una cocina: extracción general 16 + cocción 50 aparte.
    const r = calcHS3(
      mkRed({
        estancias: [
          { id: "c", tipo: "cocina", caudalPropuesto_l_s: 16, esCoccion: true, caudalCoccion_l_s: 50 },
        ],
        redColectivos: [{ id: "C1", plantas: [{ nivel: 0, estanciasIds: ["c"] }] }],
      }),
    );
    // qvt de la boca = 16 (general), nunca 66 (no suma la cocción).
    expect(r.red!.colectivos[0].qvtBoca_l_s).toBeCloseTo(16, 9);
  });

  it("red vacía bloquea la exportación sin tocar el veredicto normativo", () => {
    const rRapido = calcHS3(mkRed({ modoConducto: "rapido" }));
    const rVacia = calcHS3(mkRed({ redColectivos: [] }));
    expect(rVacia.red!.estadoRed.valida).toBe(false);
    expect(rVacia.red!.estadoRed.bloqueos.length).toBeGreaterThan(0);
    // El veredicto normativo (por estancia) es el mismo: la red no lo degrada.
    expect(rVacia.veredictoGlobal).toBe(rRapido.veredictoGlobal);
  });

  it("doble asignación de una estancia bloquea (doble conteo)", () => {
    const r = calcHS3(
      mkRed({
        redColectivos: [
          {
            id: "C1",
            plantas: [
              { nivel: 0, estanciasIds: ["coc0"] },
              { nivel: 1, estanciasIds: ["coc0"] }, // misma estancia dos veces
            ],
          },
        ],
      }),
    );
    expect(r.red!.estadoRed.valida).toBe(false);
    expect(r.red!.estadoRed.bloqueos.some((b) => b.includes("doble conteo"))).toBe(true);
  });

  it("nivel no entero y estancia inexistente bloquean", () => {
    const rNivel = calcHS3(
      mkRed({ redColectivos: [{ id: "C1", plantas: [{ nivel: 1.5, estanciasIds: ["coc0"] }] }] }),
    );
    expect(rNivel.red!.estadoRed.valida).toBe(false);
    const rFantasma = calcHS3(
      mkRed({ redColectivos: [{ id: "C1", plantas: [{ nivel: 0, estanciasIds: ["noexiste"] }] }] }),
    );
    expect(rFantasma.red!.estadoRed.valida).toBe(false);
  });

  it("reconciliación: un húmedo sin asignar genera warning (no bloqueo)", () => {
    // ba1 queda sin asignar a ningún colectivo.
    const r = calcHS3(
      mkRed({
        redColectivos: [
          {
            id: "C1",
            plantas: [
              { nivel: 0, estanciasIds: ["coc0", "ba0"] },
              { nivel: 1, estanciasIds: ["coc1"] },
            ],
          },
        ],
      }),
    );
    expect(r.red!.estadoRed.valida).toBe(true); // no es bloqueo
    expect(r.warnings.some((w) => w.includes("sin asignar"))).toBe(true);
  });

  it("plantas salteadas: span cuenta 'ambas incluidas' y avisa (DB-HS3 ap. 4.2.1)", () => {
    // Colectivo que vierte en planta 0 y planta 3 (1 y 2 no vierten pero existen).
    const r = calcHS3(
      mkRed({
        estancias: [
          { id: "a", tipo: "cocina", caudalPropuesto_l_s: 10 },
          { id: "b", tipo: "bano", caudalPropuesto_l_s: 8 },
        ],
        redColectivos: [
          {
            id: "C1",
            plantas: [
              { nivel: 0, estanciasIds: ["a"] },
              { nivel: 3, estanciasIds: ["b"] },
            ],
          },
        ],
      }),
    );
    // span = 3 − 0 + 1 = 4 aunque solo 2 plantas vierten.
    expect(r.red!.colectivos[0].plantasServidas).toBe(4);
    expect(r.red!.estadoRed.valida).toBe(true); // los huecos son legales
    expect(r.warnings.some((w) => w.includes("salteadas"))).toBe(true);
  });

  // Property: span = max(nivel) − min(nivel) + 1, y qvt de la boca = Σ plantas.
  test.prop([fc.uniqueArray(fc.integer({ min: 0, max: 20 }), { minLength: 1, maxLength: 8 })])(
    "span = max−min+1 y qvt boca = Σ extracción de plantas",
    (niveles) => {
      const estancias: Estancia[] = niveles.map((n) => ({
        id: `e${n}`,
        tipo: "cocina" as TipoEstancia,
        caudalPropuesto_l_s: 10,
      }));
      const r = calcHS3({
        numDormitorios: 2,
        estancias,
        zonaTermica: "X",
        numPlantasConducto: 1,
        modoConducto: "avanzado",
        redColectivos: [
          { id: "C1", plantas: niveles.map((n) => ({ nivel: n, estanciasIds: [`e${n}`] })) },
        ],
      });
      const col = r.red!.colectivos[0];
      const span = Math.max(...niveles) - Math.min(...niveles) + 1;
      expect(col.plantasServidas).toBe(span);
      expect(col.qvtBoca_l_s).toBeCloseTo(niveles.length * 10, 9);
    },
  );

  // Property: dentro de un colectivo, la sección del padre (más cargado) no
  // decrece respecto a la del hijo (misma clase de tiro, qvt crece hacia la raíz).
  test.prop([fc.uniqueArray(fc.integer({ min: 0, max: 15 }), { minLength: 2, maxLength: 6 })])(
    "sección no decrece hacia la raíz (misma clase de tiro)",
    (niveles) => {
      const estancias: Estancia[] = niveles.map((n) => ({
        id: `e${n}`,
        tipo: "cocina" as TipoEstancia,
        caudalPropuesto_l_s: 40,
      }));
      const r = calcHS3({
        numDormitorios: 2,
        estancias,
        zonaTermica: "Z",
        numPlantasConducto: 1,
        modoConducto: "avanzado",
        redColectivos: [
          { id: "C1", plantas: niveles.map((n) => ({ nivel: n, estanciasIds: [`e${n}`] })) },
        ],
      });
      const col = r.red!.colectivos[0];
      const porId = new Map(col.tramos.map((t) => [t.id, t]));
      for (const t of col.tramos) {
        if (t.parentId && porId.has(t.parentId)) {
          expect(porId.get(t.parentId)!.seccionRequerida_cm2).toBeGreaterThanOrEqual(
            t.seccionRequerida_cm2,
          );
        }
      }
    },
  );
});
