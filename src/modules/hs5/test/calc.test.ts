import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  calcHS5,
  hs5Defaults,
  udDeAparato,
  type AparatoInput,
  type HS5Inputs,
} from "../calc";
import type { TipoAparato } from "../tablas";

// =============================================================================
// HS5 — motor determinista. Snapshots commiteados (SPEC §5) + property-based.
// =============================================================================

// --- Inputs de referencia para los snapshots --------------------------------

/** Vivienda pequeña (defaults): baño + aseo + cocina, 1 planta, 1 bajante. */
const viviendaPequena: HS5Inputs = hs5Defaults;

/**
 * Edificio multi-planta (10 plantas, uso público) que dispara la ventilación
 * secundaria en plantas alternas y la terciaria por ramal largo.
 */
const edificioMultiPlanta: HS5Inputs = {
  uso: "publico",
  numPlantas: 10,
  cubiertaTransitable: true,
  aparatos: [
    { id: "ino-1", tipo: "inodoro_fluxometro", tramoId: "ramal-aseos" },
    { id: "ino-2", tipo: "inodoro_fluxometro", tramoId: "ramal-aseos" },
    { id: "uri-1", tipo: "urinario_suspendido", tramoId: "ramal-aseos" },
    { id: "lav-1", tipo: "lavabo", tramoId: "ramal-aseos" },
    { id: "lav-2", tipo: "lavabo", tramoId: "ramal-aseos" },
  ],
  tramos: [
    { id: "ramal-aseos", tipo: "ramal", parentId: "bajante", pendiente_pct: 2, longitud_m: 7 },
    { id: "bajante", tipo: "bajante", parentId: "colector" },
    { id: "colector", tipo: "colector", parentId: null, pendiente_pct: 2, disposicion: "enterrado" },
  ],
};

/**
 * Caso con aparato NO contemplado para el uso (lavadero sólo es privado): en uso
 * público devuelve UD `null` y marca el aparato como `fail` → veredicto global
 * `fail`. Demuestra la propagación del peor caso.
 */
const aparatoNoContemplado: HS5Inputs = {
  uso: "publico",
  numPlantas: 1,
  cubiertaTransitable: false,
  aparatos: [
    { id: "lav", tipo: "lavabo", tramoId: "ramal" },
    // El lavadero no está contemplado para uso público (Tabla 4.1) → fail.
    { id: "lavadero", tipo: "lavadero", tramoId: "ramal" },
  ],
  tramos: [
    { id: "ramal", tipo: "ramal", parentId: "colector", pendiente_pct: 2 },
    { id: "colector", tipo: "colector", parentId: null, pendiente_pct: 2, disposicion: "colgado" },
  ],
};

describe("calcHS5 — UD por aparato (Tabla 4.1)", () => {
  it("devuelve UD por uso privado/público (incluye decimales y agrupados)", () => {
    expect(udDeAparato("lavabo", "privado")).toBe(1);
    expect(udDeAparato("lavabo", "publico")).toBe(2);
    expect(udDeAparato("ducha", "privado")).toBe(2); // ducha 2/3, NO 3/6
    expect(udDeAparato("urinario_bateria", "publico")).toBe(3.5); // sin redondeo
    expect(udDeAparato("fuente_beber", "publico")).toBe(0.5);
    expect(udDeAparato("cuarto_bano_cisterna", "privado")).toBe(7);
    // No contemplado para el uso → null.
    expect(udDeAparato("lavadero", "publico")).toBeNull();
    expect(udDeAparato("vertedero", "privado")).toBeNull();
  });
});

describe("calcHS5 — snapshots (SPEC §5)", () => {
  it("vivienda pequeña (defaults)", () => {
    expect(calcHS5(viviendaPequena)).toMatchInlineSnapshot(`
      {
        "arbolValido": true,
        "numPlantas": 1,
        "porAparato": [
          {
            "agrupado": true,
            "cumple": true,
            "diametroMin_mm": 100,
            "estado": "ok",
            "id": "bano-completo",
            "tipo": "cuarto_bano_cisterna",
            "tramoId": "ramal-bano",
            "ud": 7,
          },
          {
            "agrupado": true,
            "cumple": true,
            "diametroMin_mm": 100,
            "estado": "ok",
            "id": "aseo",
            "tipo": "cuarto_aseo_cisterna",
            "tramoId": "ramal-aseo",
            "ud": 6,
          },
          {
            "agrupado": false,
            "cumple": true,
            "diametroMin_mm": 40,
            "estado": "ok",
            "id": "fregadero",
            "tipo": "fregadero_cocina",
            "tramoId": "ramal-cocina",
            "ud": 3,
          },
          {
            "agrupado": false,
            "cumple": true,
            "diametroMin_mm": 40,
            "estado": "ok",
            "id": "lavavajillas",
            "tipo": "lavavajillas",
            "tramoId": "ramal-cocina",
            "ud": 3,
          },
          {
            "agrupado": false,
            "cumple": true,
            "diametroMin_mm": 40,
            "estado": "ok",
            "id": "lavadora",
            "tipo": "lavadora",
            "tramoId": "ramal-cocina",
            "ud": 3,
          },
        ],
        "porTramo": [
          {
            "capacidad_ud": 11,
            "childrenIds": [],
            "cumple": true,
            "diametroMinPorAguasArriba_mm": 0,
            "diametro_mm": 63,
            "estado": "ok",
            "id": "ramal-bano",
            "motivo": "Ramal colector (Tabla 4.3): 7 UD a 2 % → Ø63 (cap. 11 UD).",
            "parentId": "bajante",
            "pendiente_pct": 2,
            "tipo": "ramal",
            "udAcumuladas": 7,
          },
          {
            "capacidad_ud": 6,
            "childrenIds": [],
            "cumple": true,
            "diametroMinPorAguasArriba_mm": 0,
            "diametro_mm": 50,
            "estado": "ok",
            "id": "ramal-aseo",
            "motivo": "Ramal colector (Tabla 4.3): 6 UD a 2 % → Ø50 (cap. 6 UD).",
            "parentId": "bajante",
            "pendiente_pct": 2,
            "tipo": "ramal",
            "udAcumuladas": 6,
          },
          {
            "capacidad_ud": 11,
            "childrenIds": [],
            "cumple": true,
            "diametroMinPorAguasArriba_mm": 0,
            "diametro_mm": 63,
            "estado": "ok",
            "id": "ramal-cocina",
            "motivo": "Ramal colector (Tabla 4.3): 9 UD a 2 % → Ø63 (cap. 11 UD).",
            "parentId": "bajante",
            "pendiente_pct": 2,
            "tipo": "ramal",
            "udAcumuladas": 9,
          },
          {
            "capacidad_ud": 135,
            "childrenIds": [
              "ramal-bano",
              "ramal-aseo",
              "ramal-cocina",
            ],
            "cumple": true,
            "diametroMinPorAguasArriba_mm": 63,
            "diametro_mm": 90,
            "estado": "ok",
            "id": "bajante",
            "motivo": "Bajante (Tabla 4.4): mayor de Ø por UD total (75) y Ø por UD/ramal de planta (90) con 1 planta(s) → Ø90.",
            "parentId": "colector",
            "pendiente_pct": 0,
            "tipo": "bajante",
            "udAcumuladas": 22,
          },
          {
            "capacidad_ud": 24,
            "childrenIds": [
              "bajante",
            ],
            "cumple": true,
            "diametroMinPorAguasArriba_mm": 90,
            "diametro_mm": 90,
            "estado": "ok",
            "id": "colector",
            "motivo": "Colector horizontal enterrado (Tabla 4.5): 22 UD a 2 % → Ø63 (cap. 24 UD). · Ø elevado a 90 mm por monotonía aguas abajo.",
            "parentId": null,
            "pendiente_pct": 2,
            "tipo": "colector",
            "udAcumuladas": 22,
          },
        ],
        "udTotales": 22,
        "uso": "privado",
        "ventilacion": {
          "estado": "neutral",
          "primaria": {
            "aviso": "Ventilación primaria = prolongación de la bajante (Ø90 mm) ≥ 1.3 m sobre cubierta no transitable (suficiente por sí sola, < 7 plantas).",
            "estado": "neutral",
            "prolongacionMin_m": 1.3,
            "suficienteSola": true,
          },
          "secundaria": {
            "aviso": "Ventilación secundaria no requerida (< 7 plantas).",
            "diametroColumna_mm": null,
            "estado": "neutral",
            "modo": "no_requerida",
          },
          "terciaria": {
            "aviso": "Ventilación terciaria no requerida (ramales ≤ 5 m y ≤ 14 plantas).",
            "estado": "neutral",
            "obligatoria": false,
            "ramalesAfectados": [],
          },
        },
        "veredictoGlobal": "ok",
        "warnings": [],
      }
    `);
  });

  it("edificio multi-planta (ventilación secundaria alternas)", () => {
    expect(calcHS5(edificioMultiPlanta)).toMatchInlineSnapshot(`
      {
        "arbolValido": true,
        "numPlantas": 10,
        "porAparato": [
          {
            "agrupado": false,
            "cumple": true,
            "diametroMin_mm": 100,
            "estado": "ok",
            "id": "ino-1",
            "tipo": "inodoro_fluxometro",
            "tramoId": "ramal-aseos",
            "ud": 10,
          },
          {
            "agrupado": false,
            "cumple": true,
            "diametroMin_mm": 100,
            "estado": "ok",
            "id": "ino-2",
            "tipo": "inodoro_fluxometro",
            "tramoId": "ramal-aseos",
            "ud": 10,
          },
          {
            "agrupado": false,
            "cumple": true,
            "diametroMin_mm": 40,
            "estado": "ok",
            "id": "uri-1",
            "tipo": "urinario_suspendido",
            "tramoId": "ramal-aseos",
            "ud": 2,
          },
          {
            "agrupado": false,
            "cumple": true,
            "diametroMin_mm": 40,
            "estado": "ok",
            "id": "lav-1",
            "tipo": "lavabo",
            "tramoId": "ramal-aseos",
            "ud": 2,
          },
          {
            "agrupado": false,
            "cumple": true,
            "diametroMin_mm": 40,
            "estado": "ok",
            "id": "lav-2",
            "tipo": "lavabo",
            "tramoId": "ramal-aseos",
            "ud": 2,
          },
        ],
        "porTramo": [
          {
            "capacidad_ud": 60,
            "childrenIds": [],
            "cumple": true,
            "diametroMinPorAguasArriba_mm": 0,
            "diametro_mm": 90,
            "estado": "ok",
            "id": "ramal-aseos",
            "motivo": "Ramal colector (Tabla 4.3): 26 UD a 2 % → Ø90 (cap. 60 UD).",
            "parentId": "bajante",
            "pendiente_pct": 2,
            "tipo": "ramal",
            "udAcumuladas": 26,
          },
          {
            "capacidad_ud": 38,
            "childrenIds": [
              "ramal-aseos",
            ],
            "cumple": true,
            "diametroMinPorAguasArriba_mm": 90,
            "diametro_mm": 90,
            "estado": "ok",
            "id": "bajante",
            "motivo": "Bajante (Tabla 4.4): mayor de Ø por UD total (63) y Ø por UD/ramal de planta (50) con 10 planta(s) → Ø63. · Ø elevado a 90 mm por monotonía aguas abajo.",
            "parentId": "colector",
            "pendiente_pct": 0,
            "tipo": "bajante",
            "udAcumuladas": 26,
          },
          {
            "capacidad_ud": 38,
            "childrenIds": [
              "bajante",
            ],
            "cumple": true,
            "diametroMinPorAguasArriba_mm": 90,
            "diametro_mm": 90,
            "estado": "ok",
            "id": "colector",
            "motivo": "Colector horizontal enterrado (Tabla 4.5): 26 UD a 2 % → Ø75 (cap. 38 UD). · Ø elevado a 90 mm por monotonía aguas abajo.",
            "parentId": null,
            "pendiente_pct": 2,
            "tipo": "colector",
            "udAcumuladas": 26,
          },
        ],
        "udTotales": 26,
        "uso": "publico",
        "ventilacion": {
          "estado": "neutral",
          "primaria": {
            "aviso": "Ventilación primaria = prolongación de la bajante (Ø90 mm) ≥ 2 m sobre cubierta transitable (se requiere además ventilación secundaria, ≥ 7 plantas).",
            "estado": "neutral",
            "prolongacionMin_m": 2,
            "suficienteSola": false,
          },
          "secundaria": {
            "aviso": "Ventilación secundaria obligatoria (10 ≥ 7 plantas), conexiones en plantas alternas (Tabla 4.10); Ø columna 45 mm (≥ ½ Ø bajante 90 mm).",
            "diametroColumna_mm": 45,
            "estado": "neutral",
            "modo": "alternas",
          },
          "terciaria": {
            "aviso": "Ventilación terciaria obligatoria (ramales > 5 m o > 14 plantas); long. máx por Tabla 4.12.",
            "estado": "neutral",
            "obligatoria": true,
            "ramalesAfectados": [
              "ramal-aseos",
            ],
          },
        },
        "veredictoGlobal": "ok",
        "warnings": [],
      }
    `);
  });

  it("aparato no contemplado para el uso → fail", () => {
    expect(calcHS5(aparatoNoContemplado)).toMatchInlineSnapshot(`
      {
        "arbolValido": true,
        "numPlantas": 1,
        "porAparato": [
          {
            "agrupado": false,
            "cumple": true,
            "diametroMin_mm": 40,
            "estado": "ok",
            "id": "lav",
            "tipo": "lavabo",
            "tramoId": "ramal",
            "ud": 2,
          },
          {
            "agrupado": false,
            "cumple": false,
            "diametroMin_mm": null,
            "estado": "fail",
            "id": "lavadero",
            "tipo": "lavadero",
            "tramoId": "ramal",
            "ud": 0,
          },
        ],
        "porTramo": [
          {
            "capacidad_ud": 2,
            "childrenIds": [],
            "cumple": true,
            "diametroMinPorAguasArriba_mm": 0,
            "diametro_mm": 40,
            "estado": "ok",
            "id": "ramal",
            "motivo": "Ramal colector (Tabla 4.3): 2 UD a 2 % → Ø40 (cap. 2 UD).",
            "parentId": "colector",
            "pendiente_pct": 2,
            "tipo": "ramal",
            "udAcumuladas": 2,
          },
          {
            "capacidad_ud": 20,
            "childrenIds": [
              "ramal",
            ],
            "cumple": true,
            "diametroMinPorAguasArriba_mm": 40,
            "diametro_mm": 50,
            "estado": "ok",
            "id": "colector",
            "motivo": "Colector horizontal colgado (Tabla 4.5): 2 UD a 2 % → Ø50 (cap. 20 UD).",
            "parentId": null,
            "pendiente_pct": 2,
            "tipo": "colector",
            "udAcumuladas": 2,
          },
        ],
        "udTotales": 2,
        "uso": "publico",
        "ventilacion": {
          "estado": "neutral",
          "primaria": {
            "aviso": "Ventilación primaria = prolongación de la bajante (Ø? mm) ≥ 1.3 m sobre cubierta no transitable (suficiente por sí sola, < 7 plantas).",
            "estado": "neutral",
            "prolongacionMin_m": 1.3,
            "suficienteSola": true,
          },
          "secundaria": {
            "aviso": "Ventilación secundaria no requerida (< 7 plantas).",
            "diametroColumna_mm": null,
            "estado": "neutral",
            "modo": "no_requerida",
          },
          "terciaria": {
            "aviso": "Ventilación terciaria no requerida (ramales ≤ 5 m y ≤ 14 plantas).",
            "estado": "neutral",
            "obligatoria": false,
            "ramalesAfectados": [],
          },
        },
        "veredictoGlobal": "fail",
        "warnings": [
          "El aparato "lavadero" (lavadero) no está contemplado para uso publico (Tabla 4.1).",
        ],
      }
    `);
  });
});

describe("calcHS5 — determinismo", () => {
  it("mismo input → mismo output", () => {
    expect(calcHS5(viviendaPequena)).toEqual(calcHS5(viviendaPequena));
    expect(calcHS5(edificioMultiPlanta)).toEqual(calcHS5(edificioMultiPlanta));
  });
});

describe("calcHS5 — ventilación de red", () => {
  it("< 7 plantas: primaria suficiente, secundaria no requerida", () => {
    const r = calcHS5({ ...viviendaPequena, numPlantas: 4 });
    expect(r.ventilacion.primaria.suficienteSola).toBe(true);
    expect(r.ventilacion.secundaria.modo).toBe("no_requerida");
    expect(r.ventilacion.estado).toBe("neutral");
    expect(r.ventilacion.primaria.prolongacionMin_m).toBe(1.3); // no transitable
  });

  it("≥ 7 y < 15 plantas: secundaria en plantas alternas", () => {
    const r = calcHS5({ ...viviendaPequena, numPlantas: 8 });
    expect(r.ventilacion.secundaria.modo).toBe("alternas");
    expect(r.ventilacion.primaria.suficienteSola).toBe(false);
  });

  it("≥ 15 plantas: secundaria en cada planta (Tabla 4.11)", () => {
    const r = calcHS5({ ...viviendaPequena, numPlantas: 16 });
    expect(r.ventilacion.secundaria.modo).toBe("cada_planta");
    expect(r.ventilacion.terciaria.obligatoria).toBe(true); // > 14 plantas
  });

  it("cubierta transitable eleva la prolongación primaria a 2,0 m", () => {
    const r = calcHS5({ ...viviendaPequena, cubiertaTransitable: true });
    expect(r.ventilacion.primaria.prolongacionMin_m).toBe(2.0);
  });

  it("terciaria obligatoria si un ramal supera 5 m", () => {
    const r = calcHS5(edificioMultiPlanta); // ramal de 7 m
    expect(r.ventilacion.terciaria.obligatoria).toBe(true);
    expect(r.ventilacion.terciaria.ramalesAfectados).toContain("ramal-aseos");
  });
});

describe("calcHS5 — casos límite (selección de Ø por tabla)", () => {
  // Ramal a 2 %: Ø50 cubre hasta 6 UD; 6 UD → Ø50, 7 UD → Ø63 (Tabla 4.3).
  const ramalCon = (ud: number): HS5Inputs => ({
    uso: "publico",
    numPlantas: 1,
    cubiertaTransitable: false,
    // Usamos lavabos (2 UD público) para componer UD exactas no siempre posible;
    // usamos fregaderos de cocina (6 UD público) y lavabos (2) para ajustar.
    aparatos: aparatosParaUD(ud),
    tramos: [{ id: "ramal", tipo: "ramal", parentId: null, pendiente_pct: 2 }],
  });

  it("UD justo en el límite de un Ø cumple con ese Ø", () => {
    // 6 UD a 2 % → Ø50 (capacidad exacta 6).
    const r = calcHS5(ramalCon(6));
    const ramal = r.porTramo.find((t) => t.id === "ramal")!;
    expect(ramal.udAcumuladas).toBe(6);
    expect(ramal.diametro_mm).toBe(50);
    expect(ramal.capacidad_ud).toBe(6);
    expect(ramal.cumple).toBe(true);
  });

  it("un pelo por encima del límite sube de Ø", () => {
    // 8 UD a 2 % → Ø63 (Ø50 sólo llega a 6).
    const r = calcHS5(ramalCon(8));
    const ramal = r.porTramo.find((t) => t.id === "ramal")!;
    expect(ramal.udAcumuladas).toBe(8);
    expect(ramal.diametro_mm).toBe(63);
  });
});

describe("calcHS5 — validación del árbol", () => {
  it("detecta un ciclo en el grafo de tramos", () => {
    const r = calcHS5({
      ...viviendaPequena,
      aparatos: [{ id: "l", tipo: "lavabo", tramoId: "a" }],
      tramos: [
        { id: "a", tipo: "ramal", parentId: "b", pendiente_pct: 2 },
        { id: "b", tipo: "colector", parentId: "a", disposicion: "colgado" },
      ],
    });
    expect(r.arbolValido).toBe(false);
    expect(r.veredictoGlobal).toBe("fail");
  });

  it("un árbol válido lineal es arbolValido", () => {
    expect(calcHS5(viviendaPequena).arbolValido).toBe(true);
  });
});

// =============================================================================
// PROPERTY-BASED (invariantes normativos de feature-2, @fast-check/vitest)
// =============================================================================

const arbAparatoPrivado: fc.Arbitrary<TipoAparato> = fc.constantFrom(
  "lavabo",
  "bide",
  "ducha",
  "banera",
  "inodoro_cisterna",
  "fregadero_cocina",
  "lavavajillas",
  "lavadora",
);

/** Construye un árbol lineal ramal→bajante→colector con `aparatos` colgando del ramal. */
function arbolLineal(aparatos: AparatoInput[], numPlantas = 1): HS5Inputs {
  return {
    uso: "privado",
    numPlantas,
    cubiertaTransitable: false,
    aparatos,
    tramos: [
      { id: "ramal", tipo: "ramal", parentId: "bajante", pendiente_pct: 4 },
      { id: "bajante", tipo: "bajante", parentId: "colector" },
      { id: "colector", tipo: "colector", parentId: null, pendiente_pct: 4, disposicion: "enterrado" },
    ],
  };
}

describe("calcHS5 — invariantes (property-based)", () => {
  // (a) Monotonía UD: añadir un aparato nunca BAJA las UD acumuladas del colector.
  test.prop([
    fc.array(arbAparatoPrivado, { minLength: 0, maxLength: 8 }),
    arbAparatoPrivado,
  ])("añadir un aparato nunca reduce las UD totales", (tipos, extra) => {
    const mk = (lista: TipoAparato[]) =>
      arbolLineal(lista.map((t, i) => ({ id: `a${i}`, tipo: t, tramoId: "ramal" })));
    const sin = calcHS5(mk(tipos)).udTotales;
    const con = calcHS5(mk([...tipos, extra])).udTotales;
    expect(con).toBeGreaterThanOrEqual(sin);
  });

  // (b) Ø no decreciente aguas abajo: cada tramo tiene Ø ≥ el de cualquier hijo.
  test.prop([fc.array(arbAparatoPrivado, { minLength: 1, maxLength: 8 })])(
    "Ø no decreciente en el sentido del flujo (cada tramo ≥ sus hijos)",
    (tipos) => {
      const inp = arbolLineal(tipos.map((t, i) => ({ id: `a${i}`, tipo: t, tramoId: "ramal" })));
      const r = calcHS5(inp);
      const byId = new Map(r.porTramo.map((t) => [t.id, t]));
      for (const tramo of r.porTramo) {
        if (tramo.diametro_mm == null) continue;
        for (const c of tramo.childrenIds) {
          const hijo = byId.get(c);
          if (hijo?.diametro_mm != null) {
            expect(tramo.diametro_mm).toBeGreaterThanOrEqual(hijo.diametro_mm);
          }
        }
      }
    },
  );

  // (c) Bajante: el Ø elegido proviene de la Tabla 4.4 (≤ 1/3 de sección por
  //     construcción de la tabla). Comprobamos pertenencia al conjunto de Ø de 4.4.
  const DIAMETROS_4_4 = [50, 63, 75, 90, 110, 125, 160, 200, 250, 315];
  test.prop([fc.array(arbAparatoPrivado, { minLength: 1, maxLength: 8 }), fc.integer({ min: 1, max: 20 })])(
    "el Ø de la bajante pertenece a la Tabla 4.4 (estructuralmente ≤ 1/3 sección)",
    (tipos, numPlantas) => {
      const inp = arbolLineal(
        tipos.map((t, i) => ({ id: `a${i}`, tipo: t, tramoId: "ramal" })),
        numPlantas,
      );
      const r = calcHS5(inp);
      const bajante = r.porTramo.find((t) => t.tipo === "bajante");
      if (bajante?.diametro_mm != null) {
        expect(DIAMETROS_4_4).toContain(bajante.diametro_mm);
      }
    },
  );

  // (d) Colector: el Ø elegido proviene de la Tabla 4.5 (≤ media sección por
  //     construcción de la tabla). Comprobamos pertenencia al conjunto de Ø de 4.5.
  const DIAMETROS_4_5 = [50, 63, 75, 90, 110, 125, 160, 200, 250, 315, 350];
  test.prop([fc.array(arbAparatoPrivado, { minLength: 1, maxLength: 8 })])(
    "el Ø del colector pertenece a la Tabla 4.5 (estructuralmente ≤ media sección)",
    (tipos) => {
      const inp = arbolLineal(tipos.map((t, i) => ({ id: `a${i}`, tipo: t, tramoId: "ramal" })));
      const r = calcHS5(inp);
      const colector = r.porTramo.find((t) => t.tipo === "colector");
      if (colector?.diametro_mm != null) {
        expect(DIAMETROS_4_5).toContain(colector.diametro_mm);
      }
    },
  );

  // Determinismo general: cualquier input → mismo output.
  test.prop([
    fc.array(arbAparatoPrivado, { minLength: 0, maxLength: 8 }),
    fc.integer({ min: 1, max: 20 }),
  ])("determinista: mismo input → mismo output", (tipos, numPlantas) => {
    const inp = arbolLineal(
      tipos.map((t, i) => ({ id: `a${i}`, tipo: t, tramoId: "ramal" })),
      numPlantas,
    );
    expect(calcHS5(inp)).toEqual(calcHS5(inp));
  });
});

// --- utilidades de test ------------------------------------------------------

/** Compone aparatos públicos cuya suma de UD = `ud` (fregaderos 6 + lavabos 2). */
function aparatosParaUD(ud: number): AparatoInput[] {
  const out: AparatoInput[] = [];
  let resto = ud;
  let i = 0;
  while (resto >= 6) {
    out.push({ id: `f${i++}`, tipo: "fregadero_cocina", tramoId: "ramal" });
    resto -= 6;
  }
  while (resto >= 2) {
    out.push({ id: `l${i++}`, tipo: "lavabo", tramoId: "ramal" });
    resto -= 2;
  }
  // Aseguramos al menos un aparato.
  if (out.length === 0) out.push({ id: "l0", tipo: "lavabo", tramoId: "ramal" });
  return out;
}
