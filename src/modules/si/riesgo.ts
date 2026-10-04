// =============================================================================
// DB-SI — Los locales de riesgo especial (feature-19): qué zonas de El edificio
// lo son y de qué clase, por la tabla 2.1 de SI 1. Lo usan SI 1 (sus
// condiciones), SI 4 (extintores) y SI 6 (la R de su estructura). PURO.
//
// Lo que no se sabe (research/verificacion-si1-si2.md, criterios C1, C2 y C16):
//   - un cuarto de instalaciones sin tipo se trata como riesgo bajo provisional,
//     que es lo más frecuente en vivienda (contadores, ascensor, RITE…);
//   - una sala de calderas sin potencia, igual;
//   - sin superficie construida se clasifica con la supuesta (del lado de la
//     seguridad) y se marca solo si la clase cambia respecto de la útil;
//   - los RITI/RITS, riesgo bajo por un comentario del Ministerio (criterio).
// El garaje colectivo de más de 100 m² construidos no es local de riesgo: es uso
// Aparcamiento, un sector propio (`sectores.ts`).
// =============================================================================

import type { TipoCuarto } from "../../lib/edificio/tipos";
import { dependeDeConstruida, superficies, type EdificioSi, type ZonaSi } from "./edificio";
import { enIntervalo, LOCALES_RIESGO_TABLA_2_1, SECTORES_TABLA_1_1, type CasillaRiesgo, type ClaseRiesgo } from "./tablas";

/** Qué es un local de riesgo especial. */
export type TipoLocal =
  | "trasteros"
  | "garaje"
  | "garaje_unifamiliar"
  | "sin_tipo"
  | Exclude<TipoCuarto, "agua" | "otro">;

export interface LocalRiesgo {
  zona: ZonaSi;
  tipo: TipoLocal;
  clase: ClaseRiesgo;
  /** Lo que se ha supuesto para clasificarlo (y que cambia la clase). */
  supuesto: "tipo" | "potencia" | "construida" | null;
  /** Superficie construida con que se clasifica (en cada planta) [m²], si la fila es por superficie. */
  s_m2?: number;
  /** Potencia con que se clasifica [kW]. */
  p_kW?: number;
}

export interface ClasificacionRiesgo {
  locales: LocalRiesgo[];
  /** El garaje colectivo es uso Aparcamiento (más de 100 m² construidos, no de una unifamiliar). */
  aparcamiento: { zonas: ZonaSi[]; util_m2: number; construida_m2: number; supuesto: boolean } | null;
}

type Fila = Record<ClaseRiesgo, CasillaRiesgo>;

/** La clase de una fila para un valor (null: no es local de riesgo especial). */
export function claseDeFila(fila: Fila, v: number | null): ClaseRiesgo | null {
  for (const c of ["bajo", "medio", "alto"] as const) {
    const casilla = fila[c];
    if (casilla === null) continue;
    if (casilla === "en_todo_caso") return c;
    if (v !== null && enIntervalo(v, casilla)) return c;
  }
  return null;
}

const T = LOCALES_RIESGO_TABLA_2_1.datos;

/** Las filas «en todo caso» de los cuartos de instalaciones. */
const FILA_CUARTO: Partial<Record<TipoCuarto, Fila>> = {
  contadores_electricidad: T.contadoresElectricidad,
  sala_maquinas: T.salaMaquinasRite,
  ascensor: T.maquinariaAscensores,
  grupo_electrogeno: T.grupoElectrogeno,
  // RITI/RITS: no tienen fila; un comentario del Ministerio los trata como riesgo bajo (criterio C16).
  telecomunicaciones: T.contadoresElectricidad,
};

/** Clasifica una zona por superficie construida, marcando si la clase depende del supuesto. */
function porSuperficie(z: ZonaSi, fila: Fila, tipo: TipoLocal): LocalRiesgo | null {
  const s = { util_m2: z.util_m2, construida_m2: z.construida.valor, supuesta: z.construida.supuesto };
  const clase = claseDeFila(fila, s.construida_m2);
  if (!clase) return null;
  return { zona: z, tipo, clase, supuesto: dependeDeConstruida(s, (m2) => claseDeFila(fila, m2)) ? "construida" : null, s_m2: s.construida_m2 };
}

function cuarto(z: ZonaSi): LocalRiesgo | null {
  const tipo = z.zona.cuarto;
  if (tipo === undefined) return { zona: z, tipo: "sin_tipo", clase: "bajo", supuesto: "tipo" };
  if (tipo === "agua" || tipo === "otro") return null;
  if (tipo === "residuos") return porSuperficie(z, T.almacenResiduos, "residuos");
  if (tipo === "calderas") {
    const p = z.zona.potencia_kW;
    if (p === undefined || !Number.isFinite(p) || p <= 0) return { zona: z, tipo, clase: "bajo", supuesto: "potencia" };
    const clase = claseDeFila(T.salaCalderas, p);
    return clase ? { zona: z, tipo, clase, supuesto: null, p_kW: p } : null;
  }
  const fila = FILA_CUARTO[tipo];
  const clase = fila ? claseDeFila(fila, null) : null;
  return clase ? { zona: z, tipo, clase, supuesto: null } : null;
}

export function clasificarRiesgo(e: EdificioSi): ClasificacionRiesgo {
  const locales: LocalRiesgo[] = [];
  const unifamiliar = e.resumen.esUnifamiliar;

  // El garaje: el de la unifamiliar, siempre local de riesgo bajo; el colectivo,
  // uso Aparcamiento si excede de 100 m² construidos (con la supuesta si no se sabe).
  const garajes = e.zonas.filter((z) => z.uso === "garaje" || z.uso === "garaje_privado");
  let aparcamiento: ClasificacionRiesgo["aparcamiento"] = null;
  if (garajes.length > 0) {
    if (unifamiliar) {
      for (const z of garajes) locales.push({ zona: z, tipo: "garaje_unifamiliar", clase: "bajo", supuesto: null });
    } else {
      const s = superficies(garajes);
      const umbral = SECTORES_TABLA_1_1.datos.aparcamiento_m2;
      if (s.construida_m2 > umbral) {
        aparcamiento = { zonas: garajes, ...s, supuesto: dependeDeConstruida(s, (m2) => m2 > umbral) };
      } else {
        for (const z of garajes) locales.push({ zona: z, tipo: "garaje", clase: "bajo", supuesto: null, s_m2: s.construida_m2 });
      }
    }
  }

  for (const z of e.zonas) {
    if (z.uso === "instalaciones") {
      const l = cuarto(z);
      if (l) locales.push(l);
    } else if (z.uso === "trasteros" && e.resumen.tieneViviendas) {
      // Solo los trasteros vinculados a viviendas tienen fila (nota 5 de la tabla 2.1).
      const l = porSuperficie(z, T.trasteros, "trasteros");
      if (l) locales.push(l);
    }
  }
  return { locales, aparcamiento };
}
