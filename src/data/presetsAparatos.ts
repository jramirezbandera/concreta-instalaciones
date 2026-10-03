import type { TipoAparato } from "../modules/hs5/tablas";
import type { TipoAparatoHS4 } from "../modules/hs4/tablas";

// =============================================================================
// Presets de aparatos por cuarto húmedo (feature-7 §B, UX-RECONCEPT §6.1).
//
// NO es dato normativo: es pura conveniencia de UI para expandir un cuarto
// completo de un clic ("Ramal baño" + sus aparatos). Las UD (HS5, Tabla 4.1) y
// los caudales (HS4, Tabla 2.1) los siguen dando las tablas del motor a partir
// del `tipo`; aquí solo se listan composiciones habituales de vivienda:
//
// - HS5: baño y aseo usan los "cuartos" AGRUPADOS de la Tabla 4.1 (uso privado,
//   no se desglosan ni se suman con componentes), coherente con `hs5Defaults`.
//   Cocina no tiene agrupado → se desglosa.
// - HS4: la Tabla 2.1 no tiene agrupados → siempre desglosado. Elecciones de
//   composición (documentadas, editables después por el usuario):
//   · Baño: lavabo + inodoro con cisterna + bañera ≥ 1,40 m (medida más común
//     en vivienda: 150–170 cm) + bidé.
//   · Aseo: lavabo + inodoro con cisterna + ducha.
//   · Cocina: fregadero + lavavajillas + lavadora (domésticos).
//
// En la UI, aplicar un preset = crear un ramal/derivación nuevo con el nombre
// del preset y sus aparatos colgando (ids deterministas vía `nextId` del
// módulo). Son filas normales: todo editable después.
// =============================================================================

export interface PresetAparatos {
  key: "bano" | "aseo" | "cocina";
  label: string;
  /** Aparatos HS5 (Tabla 4.1) — baño/aseo vía cuartos AGRUPADOS. */
  hs5: { tipo: TipoAparato }[];
  /** Aparatos HS4 (Tabla 2.1) — siempre desglosado (no hay agrupados). */
  hs4: { tipo: TipoAparatoHS4 }[];
}

export const PRESETS_APARATOS: readonly PresetAparatos[] = [
  {
    key: "bano",
    label: "Baño",
    hs5: [{ tipo: "cuarto_bano_cisterna" }],
    hs4: [
      { tipo: "lavabo" },
      { tipo: "inodoro_cisterna" },
      { tipo: "banera_ge_140" },
      { tipo: "bide" },
    ],
  },
  {
    key: "aseo",
    label: "Aseo",
    hs5: [{ tipo: "cuarto_aseo_cisterna" }],
    hs4: [{ tipo: "lavabo" }, { tipo: "inodoro_cisterna" }, { tipo: "ducha" }],
  },
  {
    key: "cocina",
    label: "Cocina",
    hs5: [{ tipo: "fregadero_cocina" }, { tipo: "lavavajillas" }, { tipo: "lavadora" }],
    hs4: [
      { tipo: "fregadero_domestico" },
      { tipo: "lavavajillas_domestico" },
      { tipo: "lavadora_domestica" },
    ],
  },
];
