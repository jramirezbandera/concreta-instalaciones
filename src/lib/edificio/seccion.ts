// =============================================================================
// La SECCIÓN de El edificio, común a los dibujos de los módulos (feature-15 §B).
//
// Lo que no es de ningún módulo: las plantas con su cota, los forjados, las
// bandas de plantas iguales comprimidas, la rasante y el fondo del edificio.
// Sobre esta base HS5 dibuja su red de evacuación, HS4 los montantes y HS6 lo
// que toca el terreno. PURA y determinista; unidades del viewBox ≈ px, 22 por
// metro de altura de planta. Sin JSX: el render está en
// `components/edificio/PisosSeccion.tsx`.
// =============================================================================

import { formatoCota, plantasDe } from "./derivar";
import type { Edificio, UsoZona } from "./tipos";

export const SECCION_BASE = {
  W: 640,
  /** Muros. */
  X0: 60,
  X1: 600,
  /** Cara superior del forjado de cubierta. */
  ROOF: 58,
  LOSA: 6,
  /** Px por metro de altura de planta. */
  K: 22,
  ALTO_MIN: 56,
  ALTO_MAX: 100,
  /** Alto de la banda de plantas iguales comprimidas. */
  BANDA: 40,
} as const;

/** Una planta dibujada. */
export interface PisoSeccion {
  nivel: number;
  etiqueta: string;
  cota: string;
  /** Cara superior del forjado de su suelo. */
  ySuelo: number;
  /** Cara inferior del forjado de encima. */
  yTecho: number;
  usos: UsoZona[];
}

/** Plantas iguales que no se dibujan una a una. */
export interface BandaSeccion {
  niveles: number[];
  y0: number;
  y1: number;
  texto: string;
}

export interface BaseSeccion {
  pisos: PisoSeccion[];
  bandas: BandaSeccion[];
  /** Cara superior del suelo de cada planta DIBUJADA (las de una banda no están). */
  ySueloDe: Map<number, number>;
  cotaCubierta: string;
  /** Suelo de la PB. */
  yRasante: number;
  /** Cara inferior del forjado más bajo. */
  yFondoEdificio: number;
  haySotano: boolean;
}

/** Alto de una planta en el dibujo, acotado para que nada quede ilegible. */
export function altoPlanta(altura_m: number): number {
  const S = SECCION_BASE;
  const a = Number.isFinite(altura_m) && altura_m > 0 ? altura_m : 3;
  return Math.min(S.ALTO_MAX, Math.max(S.ALTO_MIN, a * S.K));
}

/**
 * Las plantas de El edificio, de arriba abajo, dibujadas o comprimidas: los
 * grupos de más de 3 plantas iguales sobre rasante se dibujan arriba · ⋮ · abajo.
 */
export function baseSeccion(edificio: Edificio): BaseSeccion {
  const S = SECCION_BASE;
  const fisicas = plantasDe(edificio); // de arriba abajo
  const pisos: PisoSeccion[] = [];
  const bandas: BandaSeccion[] = [];
  const ySueloDe = new Map<number, number>();
  let yAnterior: number = S.ROOF;
  const cotaCubierta = fisicas.length > 0 ? fisicas[0].cota_m + fisicas[0].altura_m : 0;
  let i = 0;
  while (i < fisicas.length) {
    const p = fisicas[i];
    let k = i;
    while (k + 1 < fisicas.length && fisicas[k + 1].grupoId === p.grupoId) k++;
    const tramo = fisicas.slice(i, k + 1);
    const comprimir = tramo.length > 3 && p.nivel >= 0;
    const dibujar = comprimir ? [tramo[0], tramo[tramo.length - 1]] : tramo;
    for (let n = 0; n < dibujar.length; n++) {
      const f = dibujar[n];
      if (comprimir && n === 1) {
        const medio = tramo.slice(1, -1);
        const y0 = yAnterior + S.LOSA;
        const y1 = y0 + S.BANDA;
        const a = medio[medio.length - 1].etiqueta;
        const b = medio[0].etiqueta;
        bandas.push({ niveles: medio.map((m) => m.nivel), y0, y1, texto: `${a}–${b} · ${medio.length} plantas iguales` });
        yAnterior = y1;
      }
      const ySuelo = yAnterior + altoPlanta(f.altura_m);
      pisos.push({
        nivel: f.nivel,
        etiqueta: f.etiqueta,
        cota: formatoCota(f.cota_m),
        ySuelo,
        yTecho: yAnterior + S.LOSA,
        usos: f.zonas.map((z) => z.uso),
      });
      ySueloDe.set(f.nivel, ySuelo);
      yAnterior = ySuelo;
    }
    i = k + 1;
  }
  const pb = pisos.find((p) => p.nivel === 0) ?? pisos[pisos.length - 1];
  return {
    pisos,
    bandas,
    ySueloDe,
    cotaCubierta: formatoCota(cotaCubierta),
    yRasante: pb.ySuelo,
    yFondoEdificio: pisos[pisos.length - 1].ySuelo + S.LOSA,
    haySotano: pisos.some((p) => p.nivel < 0),
  };
}
