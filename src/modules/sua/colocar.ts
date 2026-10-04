// =============================================================================
// DB-SUA — Ayudas comunes a los dibujos de SUA 2, SUA 3 y SUA 4 (feature-20):
// los huecos libres para las etiquetas dentro de las zonas dibujadas, para que
// no se pisen entre sí ni con los rótulos y los iconos, y las cifras en metros
// con dos decimales. PURO.
// =============================================================================

import { SECCION_BASE, type BaseSeccion } from "../../lib/edificio/seccion";
import type { MarcaSi, ZonaDibujada } from "../si/seccion";

const S = SECCION_BASE;

/** «2,20 m»: siempre con dos decimales. */
export function metros(v: number): string {
  return `${v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;
}

/** «a, b y c». */
export function lista(partes: readonly string[]): string {
  if (partes.length <= 1) return partes.join("");
  return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

/** ¿Cabe este rótulo dentro de la zona? (El rótulo va arriba a la izquierda.) */
export function cabeRotulo(z: ZonaDibujada, rotulo: string): boolean {
  return rotulo.length * 5.4 + 12 <= z.x1 - z.x0;
}

/** Zonas donde una etiqueta general no confunde: ni el local sin uso ni los cuartos. */
export function zonaGeneral(z: ZonaDibujada): boolean {
  return z.uso !== "local_sin_uso" && z.uso !== "instalaciones" && z.uso !== "trasteros";
}

/** Ancho de una etiqueta con este texto (el del recuadro del papel). */
export function anchoEtiqueta(texto: string): number {
  return texto.length * 6.2 + 12;
}

interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

function pisan(a: Rect, b: Rect): boolean {
  const m = 2;
  return a.x0 < b.x1 + m && b.x0 < a.x1 + m && a.y0 < b.y1 + m && b.y0 < a.y1 + m;
}

export interface Hueco {
  x: number;
  y: number;
  zona: ZonaDibujada;
}

export interface Huecos {
  /**
   * El primer hueco libre de la primera zona que cumple `pred` (de arriba abajo,
   * o de abajo arriba) donde una etiqueta de `texto` no pisa nada.
   */
  tomar(pred: (z: ZonaDibujada) => boolean, texto: string, desdeAbajo?: boolean): Hueco | null;
}

/**
 * Hasta dos filas de etiquetas por zona (y dos columnas si la zona es ancha).
 * No pisan: las bandas de plantas iguales, el rótulo de cada zona, el de las
 * plantas bajo rasante (abajo a la izquierda), los iconos y las etiquetas ya
 * puestas.
 */
export function huecosEtiquetas(base: BaseSeccion, zonas: readonly ZonaDibujada[], marcas: readonly MarcaSi[]): Huecos {
  const ocupados: Rect[] = [];
  for (const p of base.pisos) if (p.nivel < 0) ocupados.push({ x0: S.X0, y0: p.ySuelo - 24, x1: S.X0 + 95, y1: p.ySuelo - 4 });
  for (const m of marcas) {
    if (m.tipo === "icono") ocupados.push({ x0: m.x - 9, y0: m.y - 9, x1: m.x + 9, y1: m.y + 9 });
    // Las cotas verticales («M x y0 V y1»).
    const v = m.tipo === "flecha" ? /^M([\d.]+) ([\d.]+)V([\d.]+)$/.exec(m.d) : null;
    if (v) {
      const [x, a, b] = [Number(v[1]), Number(v[2]), Number(v[3])];
      ocupados.push({ x0: x - 3, y0: Math.min(a, b), x1: x + 3, y1: Math.max(a, b) });
    }
    if (m.tipo === "zona" && m.rotulo && !m.zona.enBanda) {
      ocupados.push({ x0: m.zona.x0 + 4, y0: m.zona.y0 + 3, x1: m.zona.x0 + 8 + m.rotulo.length * 5.4, y1: m.zona.y0 + 14 });
    }
  }
  const libres: { zona: ZonaDibujada; sitios: { x: number; y: number }[] }[] = [];
  for (const z of zonas) {
    if (z.enBanda) continue;
    const w = z.x1 - z.x0;
    const h = z.y1 - z.y0;
    const filas = [z.y0 + h * 0.46, z.y0 + h * 0.82];
    const columnas = w >= 300 ? [z.x0 + w * 0.32, z.x0 + w * 0.72] : [z.x0 + w / 2];
    const sitios: { x: number; y: number }[] = [];
    for (const y of filas) for (const x of columnas) sitios.push({ x: Math.round(x), y: Math.round(y) });
    libres.push({ zona: z, sitios });
  }
  return {
    tomar(pred, texto, desdeAbajo = false) {
      const medio = anchoEtiqueta(texto) / 2;
      const orden = desdeAbajo ? [...libres].reverse() : libres;
      for (const l of orden) {
        if (!pred(l.zona)) continue;
        for (let i = 0; i < l.sitios.length; i++) {
          const s = l.sitios[i];
          // En su sitio o, si pisa algo, arrimada a la izquierda o a la derecha de la zona.
          for (const x of [s.x, Math.ceil(l.zona.x0 + 12 + medio), Math.floor(l.zona.x1 - 4 - medio)]) {
            const r = { x0: x - medio, y0: s.y - 9, x1: x + medio, y1: s.y + 9 };
            if (ocupados.some((o) => pisan(o, r))) continue;
            l.sitios.splice(i, 1);
            ocupados.push(r);
            return { x, y: s.y, zona: l.zona };
          }
        }
      }
      return null;
    },
  };
}
