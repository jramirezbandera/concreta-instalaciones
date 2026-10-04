// =============================================================================
// DB-SI — El edificio visto por el DB-SI (feature-19): el uso del DB de cada
// zona, su superficie construida y las alturas de evacuación. Lo comparten las
// seis secciones. PURO y determinista.
//
// La superficie que el DB-SI usa para sectores, locales y dotaciones es la
// CONSTRUIDA; El edificio guarda la útil de cada zona. Si el proyectista no la
// indica, se supone la útil por un factor (criterio de proyecto, del lado de la
// seguridad) y cada sección avisa SOLO si el resultado cambia entre la útil (el
// mínimo posible) y la supuesta (`cambiaConConstruida`).
// =============================================================================

import { nombreGrupo, plantasDe, renumerar, resumenEdificio, type PlantaFisica, type ResumenEdificio } from "../../lib/edificio/derivar";
import type { Edificio, UsoZona, Zona } from "../../lib/edificio/tipos";
import type { DatoSi } from "./tipos";

/**
 * Uso del DB-SI de una zona (Anejo SI A). La unifamiliar va aparte porque el DB
 * le da reglas propias (SI 6, tabla 3.1). El local sin uso no tiene uso aún: se
 * deja previsto.
 */
export type UsoSi = "residencial_vivienda" | "vivienda_unifamiliar" | "administrativo" | "aparcamiento" | "sin_uso";

/**
 * Superficie construida supuesta = útil × este factor, cuando no se indica.
 * CRITERIO de proyecto (el DB-SI no da relación entre útil y construida): cubre
 * muros, tabiques y pilares de una planta normal; del lado de la seguridad,
 * porque todos los umbrales del DB-SI son «excede de».
 */
export const FACTOR_CONSTRUIDA = 1.2;

export interface ZonaSi {
  id: string;
  zona: Zona;
  uso: UsoZona;
  usoSi: UsoSi;
  grupoId: string;
  /** «P1–P3», «S1». */
  plantas: string;
  /** Niveles de las plantas del grupo, de arriba abajo. */
  niveles: number[];
  repeticiones: number;
  bajoRasante: boolean;
  /** Cota del suelo de la planta más baja del grupo [m]. */
  cotaBaja_m: number;
  /** Superficie útil en CADA planta [m²]. */
  util_m2: number;
  /** Superficie construida en CADA planta [m²]: la indicada o la supuesta. */
  construida: DatoSi<number>;
  /** Zona de ocupación nula (Anejo SI A): instalaciones y trasteros de viviendas. */
  ocupacionNula: boolean;
}

export interface EdificioSi {
  resumen: ResumenEdificio;
  /** El uso principal del edificio. */
  usoPrincipal: UsoSi;
  zonas: ZonaSi[];
  plantas: PlantaFisica[];
  /** Altura de evacuación descendente [m] (de El edificio, Anejo SI A). */
  alturaEvacuacion_m: number;
  /** Altura de evacuación ascendente del sótano más bajo [m]: lo que hay que subir hasta la rasante. */
  alturaAscendente_m: number;
  plantasBajoRasante: number;
}

function numero(v: number | undefined): number {
  return v !== undefined && Number.isFinite(v) && v > 0 ? v : 0;
}

/** El uso del DB-SI de una zona, dado el uso principal del edificio. */
function usoSiDe(uso: UsoZona, principal: UsoSi): UsoSi {
  switch (uso) {
    case "viviendas":
      return "residencial_vivienda";
    case "vivienda_unifamiliar":
    case "garaje_privado":
      return "vivienda_unifamiliar";
    case "oficinas":
      return "administrativo";
    case "local_sin_uso":
      return "sin_uso";
    case "garaje":
      return "aparcamiento";
    case "zona_comun":
    case "vestibulo":
    case "trasteros":
    case "instalaciones":
      return principal;
  }
}

/** Superficie construida de una zona en cada planta: la indicada o la supuesta. */
export function construidaDe(z: Zona): DatoSi<number> {
  const dada = numero(z.superficieConstruida_m2);
  if (dada > 0) return { valor: dada, supuesto: false };
  return { valor: Math.round(numero(z.superficieUtil_m2) * FACTOR_CONSTRUIDA), supuesto: true };
}

export function edificioSi(edificio: Edificio): EdificioSi {
  const e = renumerar(edificio);
  const resumen = resumenEdificio(e);
  const plantas = plantasDe(e);
  const usoPrincipal: UsoSi = resumen.esUnifamiliar
    ? "vivienda_unifamiliar"
    : resumen.tieneViviendas
      ? "residencial_vivienda"
      : resumen.tieneOficinas
        ? "administrativo"
        : resumen.tieneGaraje
          ? "aparcamiento"
          : "sin_uso";

  const zonas: ZonaSi[] = [];
  for (const g of e.grupos) {
    const niveles = plantas.filter((p) => p.grupoId === g.id).map((p) => p.nivel);
    const cotaBaja_m = plantas.find((p) => p.nivel === Math.min(...niveles))?.cota_m ?? 0;
    for (const z of g.zonas) {
      zonas.push({
        id: z.id,
        zona: z,
        uso: z.uso,
        usoSi: usoSiDe(z.uso, usoPrincipal),
        grupoId: g.id,
        plantas: nombreGrupo(g).corto,
        niveles,
        repeticiones: niveles.length,
        bajoRasante: g.nivelInicial < 0,
        cotaBaja_m,
        util_m2: numero(z.superficieUtil_m2),
        construida: construidaDe(z),
        ocupacionNula: z.uso === "instalaciones" || (z.uso === "trasteros" && resumen.tieneViviendas),
      });
    }
  }
  const masBaja = plantas[plantas.length - 1];
  return {
    resumen,
    usoPrincipal,
    zonas,
    plantas,
    alturaEvacuacion_m: resumen.alturaEvacuacion_m,
    alturaAscendente_m: masBaja && masBaja.cota_m < 0 ? Math.round(-masBaja.cota_m * 100) / 100 : 0,
    plantasBajoRasante: resumen.plantasBajoRasante,
  };
}

/** Superficie de un conjunto de zonas en todas sus plantas: útil y construida. */
export function superficies(zonas: readonly ZonaSi[]): { util_m2: number; construida_m2: number; supuesta: boolean } {
  let util_m2 = 0;
  let construida_m2 = 0;
  let supuesta = false;
  for (const z of zonas) {
    util_m2 += z.util_m2 * z.repeticiones;
    construida_m2 += z.construida.valor * z.repeticiones;
    if (z.construida.supuesto) supuesta = true;
  }
  return { util_m2: Math.round(util_m2), construida_m2: Math.round(construida_m2), supuesta };
}

/**
 * ¿Cambia un resultado entre la superficie útil (lo mínimo que puede ser la
 * construida) y la construida supuesta? Si cambia, hay que pedir la construida;
 * si no, el supuesto no influye y no se avisa.
 */
export function dependeDeConstruida<T>(s: { util_m2: number; construida_m2: number; supuesta: boolean }, f: (m2: number) => T): boolean {
  return s.supuesta && f(s.util_m2) !== f(s.construida_m2);
}
