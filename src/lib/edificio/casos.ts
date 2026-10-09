// =============================================================================
// Casos de partida de El edificio (feature-12): los cuatro edificios de las
// maquetas v4. «Partir de un caso» sustituye el edificio entero por uno de estos
// y todo queda editable después. Son propuestas de proyecto, no datos
// normativos: superficies y alturas son las de la maqueta validada.
//
// Cada llamada devuelve objetos FRESCOS (nada compartido entre proyectos).
// =============================================================================

import { renumerar } from "./derivar";
import type { Edificio, NucleoAseos, ViviendaTipo } from "./tipos";

export type CasoEdificio = "unifamiliar" | "plurifamiliar" | "plurifamiliar_locales" | "oficinas" | "reforma_local_vivienda";

export const CASOS_EDIFICIO: readonly { key: CasoEdificio; etiqueta: string }[] = [
  { key: "unifamiliar", etiqueta: "Vivienda unifamiliar" },
  { key: "plurifamiliar", etiqueta: "Plurifamiliar" },
  { key: "plurifamiliar_locales", etiqueta: "Plurifamiliar con locales" },
  { key: "oficinas", etiqueta: "Oficinas" },
  { key: "reforma_local_vivienda", etiqueta: "Reforma: local a vivienda" },
];

/** Los casos de obra nueva (los de las maquetas v4), sin el ejemplo de reforma. */
export const CASOS_OBRA_NUEVA: readonly CasoEdificio[] = ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"];

const TIPO_A: ViviendaTipo = {
  clase: "vivienda",
  id: "A",
  nombre: "A",
  dormitorios: 3,
  banos: 2,
  aseos: 0,
  superficieUtil_m2: 90,
};

const TIPO_B: ViviendaTipo = {
  clase: "vivienda",
  id: "B",
  nombre: "B",
  dormitorios: 2,
  banos: 1,
  aseos: 1,
  superficieUtil_m2: 68,
};

const VIVIENDAS_AB = [
  { tipoId: "A", cantidad: 1 },
  { tipoId: "B", cantidad: 1 },
];

function unifamiliar(): Edificio {
  const U: ViviendaTipo = {
    clase: "vivienda",
    id: "U",
    nombre: "U",
    dormitorios: 4,
    banos: 2,
    aseos: 1,
    superficieUtil_m2: 145,
  };
  return {
    cubierta: { tipo: "inclinada", superficie_m2: 110 },
    unidades: [U],
    grupos: [
      {
        id: "g1",
        nivelInicial: 1,
        repeticiones: 1,
        altura_m: 2.8,
        zonas: [{ id: "z1", uso: "vivienda_unifamiliar", superficieUtil_m2: 70, nota: "planta alta · noche" }],
      },
      {
        id: "g2",
        nivelInicial: 0,
        repeticiones: 1,
        altura_m: 2.8,
        zonas: [
          { id: "z2", uso: "vivienda_unifamiliar", superficieUtil_m2: 75, nota: "planta baja · día" },
          { id: "z3", uso: "garaje_privado", superficieUtil_m2: 20 },
        ],
      },
    ],
  };
}

function plurifamiliar(): Edificio {
  return {
    cubierta: { tipo: "plana_no_transitable", superficie_m2: 210 },
    unidades: [{ ...TIPO_A }, { ...TIPO_B }],
    grupos: [
      {
        id: "g1",
        nivelInicial: 1,
        repeticiones: 3,
        altura_m: 3,
        zonas: [{ id: "z1", uso: "viviendas", superficieUtil_m2: 158, unidades: structuredClone(VIVIENDAS_AB) }],
      },
      {
        id: "g2",
        nivelInicial: 0,
        repeticiones: 1,
        altura_m: 3,
        zonas: [
          // La maqueta ponía A + B (158 m²) en 123 m²: no caben. En PB, una A.
          { id: "z2", uso: "viviendas", superficieUtil_m2: 123, unidades: [{ tipoId: "A", cantidad: 1 }] },
          { id: "z3", uso: "zona_comun", superficieUtil_m2: 35 },
        ],
      },
      {
        id: "g3",
        nivelInicial: -1,
        repeticiones: 1,
        altura_m: 3,
        zonas: [
          { id: "z4", uso: "garaje", superficieUtil_m2: 460, plazas: 16 },
          { id: "z5", uso: "trasteros", superficieUtil_m2: 48, numero: 8 },
        ],
      },
    ],
  };
}

function plurifamiliarLocales(): Edificio {
  return {
    cubierta: { tipo: "plana_no_transitable", superficie_m2: 210 },
    unidades: [{ ...TIPO_A }, { ...TIPO_B }],
    grupos: [
      {
        id: "g1",
        nivelInicial: 1,
        repeticiones: 3,
        altura_m: 3,
        zonas: [{ id: "z1", uso: "viviendas", superficieUtil_m2: 158, unidades: structuredClone(VIVIENDAS_AB) }],
      },
      {
        id: "g2",
        nivelInicial: 0,
        repeticiones: 1,
        altura_m: 4,
        zonas: [
          { id: "z2", uso: "local_sin_uso", superficieUtil_m2: 160 },
          { id: "z3", uso: "zona_comun", superficieUtil_m2: 35 },
        ],
      },
      {
        id: "g3",
        nivelInicial: -1,
        repeticiones: 1,
        altura_m: 3,
        zonas: [
          { id: "z4", uso: "garaje", superficieUtil_m2: 420, plazas: 14 },
          { id: "z5", uso: "trasteros", superficieUtil_m2: 36, numero: 6 },
          { id: "z6", uso: "instalaciones", superficieUtil_m2: 14, nota: "contadores y grupo de presión" },
        ],
      },
    ],
  };
}

/**
 * Ejemplo de reforma (feature-27): la plurifamiliar con locales, en la que parte
 * del local de la PB pasa a ser una vivienda. Lo demás existe y no se toca,
 * salvo el portal, que se reforma para dar acceso a la nueva vivienda. Los datos
 * de la obra (cambio de uso con el asistente respondido) están en
 * `lib/proyecto/alcance.ts`, `obraDeCaso`.
 */
function reformaLocalVivienda(): Edificio {
  const e = plurifamiliarLocales();
  const marcas: Record<string, "existente" | "reformada"> = { z1: "existente", z3: "reformada", z4: "existente", z5: "existente", z6: "existente" };
  for (const g of e.grupos) for (const z of g.zonas) if (marcas[z.id]) z.obra = marcas[z.id];
  const pb = e.grupos.find((g) => g.id === "g2")!;
  pb.zonas = [
    {
      id: "z2",
      uso: "viviendas",
      superficieUtil_m2: 90,
      unidades: [{ tipoId: "A", cantidad: 1 }],
      obra: "cambia_uso",
      usoAnterior: "local_sin_uso",
    },
    { id: "z7", uso: "local_sin_uso", superficieUtil_m2: 70, obra: "existente" },
    ...pb.zonas.filter((z) => z.id === "z3"),
  ];
  return e;
}

function oficinas(): Edificio {
  const N: NucleoAseos = {
    clase: "nucleo_aseos",
    id: "N",
    nombre: "N",
    inodoros: 4,
    lavabos: 4,
    superficieUtil_m2: 22,
  };
  return {
    cubierta: { tipo: "plana_no_transitable", superficie_m2: 330 },
    unidades: [N],
    grupos: [
      {
        id: "g1",
        nivelInicial: 1,
        repeticiones: 2,
        altura_m: 3.3,
        zonas: [{ id: "z1", uso: "oficinas", superficieUtil_m2: 320, unidades: [{ tipoId: "N", cantidad: 1 }] }],
      },
      {
        id: "g2",
        nivelInicial: 0,
        repeticiones: 1,
        altura_m: 4,
        zonas: [
          { id: "z2", uso: "vestibulo", superficieUtil_m2: 60 },
          { id: "z3", uso: "local_sin_uso", superficieUtil_m2: 200 },
        ],
      },
      {
        id: "g3",
        nivelInicial: -1,
        repeticiones: 1,
        altura_m: 3,
        zonas: [{ id: "z4", uso: "garaje", superficieUtil_m2: 300, plazas: 10 }],
      },
    ],
  };
}

const CONSTRUCTORES: Record<CasoEdificio, () => Edificio> = {
  unifamiliar,
  plurifamiliar,
  plurifamiliar_locales: plurifamiliarLocales,
  oficinas,
  reforma_local_vivienda: reformaLocalVivienda,
};

/** Un edificio nuevo a partir de un caso (renumerado, objetos frescos). */
export function edificioDeCaso(caso: CasoEdificio): Edificio {
  return renumerar(CONSTRUCTORES[caso]());
}
