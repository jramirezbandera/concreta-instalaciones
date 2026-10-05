// =============================================================================
// DB-SI — Geometría común de los seis dibujos (feature-19). Sin JSX; PURA y
// determinista. La comparten el render (`SeccionSi.tsx`), la ficha (tamaño
// nativo) y las etiquetas HTML (anclas).
//
// Sobre la sección común de El edificio (`baseSeccion`), cada planta dibujada se
// reparte en sus ZONAS, de izquierda a derecha y con el ancho proporcional a su
// superficie útil, como en la sección de El edificio. Encima, cada sección del
// DB pone sus MARCAS: el tono de cada zona (por sector, por riesgo…), líneas
// (límites de sector, franjas de fachada), flechas (recorridos), iconos
// (extintores, el camión de bomberos) y textos sueltos.
// =============================================================================

import { plantasDe } from "../../lib/edificio/derivar";
import { baseSeccion, SECCION_BASE, type BaseSeccion } from "../../lib/edificio/seccion";
import type { Edificio, UsoZona } from "../../lib/edificio/tipos";
import { USOS, type FamiliaUso } from "../../lib/edificio/usos";

/** Una zona de una planta, ya colocada en el dibujo. */
export interface ZonaDibujada {
  zonaId: string;
  uso: UsoZona;
  /** Nivel de la planta dibujada (en una banda de plantas iguales, el más bajo). */
  nivel: number;
  /** La zona está dentro de una banda de plantas iguales comprimidas. */
  enBanda: boolean;
  x0: number;
  x1: number;
  /** Cara inferior del forjado de encima. */
  y0: number;
  /** Cara superior del forjado de su suelo. */
  y1: number;
}

/** Cómo se rellena una zona. */
export type TonoZona = "vivienda" | "comun" | "garaje" | "local" | "oficinas" | "acento";

export type IconoSi =
  | "extintor"
  | "bie"
  | "columna"
  | "hidrante"
  | "detector"
  | "alarma"
  | "camion"
  | "salida"
  | "humo"
  | "ascensor"
  // DB-SUA (feature-20): el pararrayos, una luminaria de emergencia, el símbolo
  // de accesibilidad, un coche y una puerta.
  | "rayo"
  | "luz"
  | "accesible"
  | "coche"
  | "puerta"
  // DB-HS 2 (feature-21): un contenedor de residuos.
  | "contenedor"
  // DB-HE 4 y HE 5 (feature-22): un captador solar térmico, un panel
  // fotovoltaico, una bomba de calor, una caldera y un grifo de ACS.
  | "captador"
  | "fotovoltaica"
  | "bomba_calor"
  | "caldera"
  | "grifo";

export type MarcaSi =
  | {
      tipo: "zona";
      key: string;
      zona: ZonaDibujada;
      tono: TonoZona;
      /** Rayado encima: local de riesgo especial. */
      rayado?: boolean;
      /** Contorno discontinuo: se deja previsto (el local sin uso). */
      previsto?: boolean;
      /** Rótulo pequeño arriba a la izquierda: «Garaje», «Trasteros». */
      rotulo?: string;
      elementoId?: string;
    }
  | {
      tipo: "linea";
      key: string;
      d: string;
      grosor: number;
      elementoId?: string;
      dash?: string;
      /** `fuerte` (tinta) o `suave` (gris); seleccionada o en fallo, se tiñe sola. */
      tono?: "fuerte" | "suave";
    }
  | { tipo: "flecha"; key: string; d: string; elementoId?: string }
  | { tipo: "icono"; key: string; icono: IconoSi; x: number; y: number; elementoId?: string }
  | { tipo: "texto"; key: string; x: number; y: number; texto: string; ancla?: "start" | "middle" | "end" };

/** Ancla de una etiqueta pulsable. */
export interface EtiquetaSi {
  key: string;
  elementoId: string;
  x: number;
  y: number;
}

export interface DibujoSi extends BaseSeccion {
  ancho: number;
  alto: number;
  /** Bajo el edificio, el terreno empieza aquí. */
  yTerrenoBajo: number;
  cubiertaInclinada: boolean;
  zonas: ZonaDibujada[];
  marcas: MarcaSi[];
  etiquetas: EtiquetaSi[];
}

const S = SECCION_BASE;
/** Ancho mínimo de una zona en el dibujo: cabe su rótulo. */
const ANCHO_MIN_ZONA = 64;

/**
 * Anchos proporcionales a la superficie que suman `total`, sin bajar de `min`
 * (si no caben todos al mínimo, se reparte a partes iguales).
 */
export function repartirAnchos(superficies: readonly number[], total: number, min = ANCHO_MIN_ZONA): number[] {
  const n = superficies.length;
  if (n === 0) return [];
  if (n * min >= total) return superficies.map(() => total / n);
  const sup = superficies.map((s) => (Number.isFinite(s) && s > 0 ? s : 0));
  const fijos = new Set<number>();
  // Las que quedan por debajo del mínimo se fijan en él y el resto se reparte otra vez.
  for (;;) {
    const libre = total - fijos.size * min;
    const suma = sup.reduce((a, s, i) => (fijos.has(i) ? a : a + s), 0);
    let cambio = false;
    for (let i = 0; i < n; i++) {
      if (fijos.has(i)) continue;
      const w = suma > 0 ? (sup[i] / suma) * libre : libre / (n - fijos.size);
      if (w < min) {
        fijos.add(i);
        cambio = true;
      }
    }
    if (!cambio) {
      return sup.map((s, i) => (fijos.has(i) ? min : suma > 0 ? (s / suma) * libre : libre / (n - fijos.size)));
    }
  }
}

/** La sección común con las zonas de cada planta dibujada (y de cada banda). */
export function seccionConZonas(edificio: Edificio): { base: BaseSeccion; zonas: ZonaDibujada[] } {
  const base = baseSeccion(edificio);
  const fisicas = plantasDe(edificio);
  const zonas: ZonaDibujada[] = [];
  const colocar = (nivel: number, y0: number, y1: number, enBanda: boolean) => {
    const p = fisicas.find((f) => f.nivel === nivel);
    if (!p || p.zonas.length === 0) return;
    const anchos = repartirAnchos(
      p.zonas.map((z) => z.superficieUtil_m2),
      S.X1 - S.X0,
    );
    let x = S.X0;
    p.zonas.forEach((z, i) => {
      zonas.push({ zonaId: z.id, uso: z.uso, nivel, enBanda, x0: x, x1: x + anchos[i], y0, y1 });
      x += anchos[i];
    });
  };
  for (const p of base.pisos) colocar(p.nivel, p.yTecho, p.ySuelo, false);
  for (const b of base.bandas) colocar(Math.min(...b.niveles), b.y0, b.y1, true);
  return { base, zonas };
}

/** La planta dibujada de un nivel (null si va dentro de una banda). */
export function pisoDe(base: BaseSeccion, nivel: number): BaseSeccion["pisos"][number] | null {
  return base.pisos.find((p) => p.nivel === nivel) ?? null;
}

/** Dónde empieza el terreno bajo el edificio. */
export function terrenoBajo(base: BaseSeccion): number {
  return base.haySotano ? base.yFondoEdificio : base.yRasante + S.LOSA + 2;
}

/** Compone el dibujo y le da el alto que necesitan las etiquetas y los iconos. */
export function componerDibujo(
  base: BaseSeccion,
  zonas: ZonaDibujada[],
  marcas: MarcaSi[],
  etiquetas: EtiquetaSi[],
  opciones: { cubiertaInclinada: boolean; ancho?: number },
): DibujoSi {
  const yTerrenoBajo = terrenoBajo(base);
  const yIconos = marcas.flatMap((m) => (m.tipo === "icono" || m.tipo === "texto" ? [m.y] : []));
  const fondo = Math.max(yTerrenoBajo + 36, ...etiquetas.map((e) => e.y + 22), ...yIconos.map((y) => y + 18));
  return {
    ...base,
    ancho: opciones.ancho ?? S.W,
    alto: Math.round(fondo),
    yTerrenoBajo,
    cubiertaInclinada: opciones.cubiertaInclinada,
    zonas,
    marcas,
    etiquetas,
  };
}

const TONO_FAMILIA: Record<FamiliaUso, TonoZona> = {
  vivienda: "vivienda",
  local: "local",
  oficinas: "oficinas",
  comun: "comun",
  garaje: "garaje",
};

/** El tono de una zona por su familia de uso (el de la sección de El edificio). */
export function tonoDe(uso: UsoZona): TonoZona {
  return TONO_FAMILIA[USOS[uso].familia];
}

/**
 * Las zonas con su tono de siempre y su nombre, sin nada que seleccionar: el
 * fondo de los dibujos que no tiñen por sector. El local sin uso, discontinuo.
 */
export function marcasZonasNeutras(zonas: readonly ZonaDibujada[]): MarcaSi[] {
  return zonas.map((z) => ({
    tipo: "zona",
    key: `zona-${z.zonaId}-${z.nivel}`,
    zona: z,
    tono: tonoDe(z.uso),
    previsto: z.uso === "local_sin_uso",
    rotulo: USOS[z.uso].etiqueta,
  }));
}

/** Centro de una zona dibujada. */
export function centro(z: ZonaDibujada): { x: number; y: number } {
  return { x: (z.x0 + z.x1) / 2, y: (z.y0 + z.y1) / 2 };
}
