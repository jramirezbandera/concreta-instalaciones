// =============================================================================
// DB-HS6 — Geometría del dibujo (feature-15, HS6): la sección por lo que toca el
// terreno. Sin JSX; PURA y determinista. La comparten el render, la ficha
// (tamaño nativo) y las etiquetas HTML (anclas).
//
// Tres bandas, de arriba abajo (maqueta v4 de HS6): las plantas altas, que no
// tocan el terreno; la planta baja con sus zonas; y el sótano (el garaje como
// espacio de contención) o, bajo lo que apoya en el terreno, la cámara ventilada
// o la despresurización. La barrera se dibuja donde la pone la decisión 1; el
// radón sube del terreno.
// =============================================================================

import { plantasDe } from "../../lib/edificio/derivar";
import type { Edificio, UsoZona } from "../../lib/edificio/tipos";
import type { JustificacionHs6 } from "./justificacion";
import { nombresUsos, rangoNiveles } from "./proteccion";

export const SECCION_HS6 = {
  W: 640,
  H: 500,
  X0: 40,
  X1: 600,
  Y_ALTAS: 40,
  Y_PB_TECHO: 140,
  /** Cara superior del forjado del suelo de la PB (la rasante). */
  Y_PB_SUELO: 260,
  LOSA: 6,
  /** Fondo del sótano. */
  Y_SOTANO: 396,
  /** Cámara bajo lo que apoya en el terreno. */
  Y_CAMARA: 304,
  /** Ancho del núcleo de escalera y ascensor. */
  NUCLEO_W: 40,
} as const;

export interface EtiquetaHs6 {
  key: string;
  elementoId: string;
  x: number;
  y: number;
}

export interface SeccionHs6Geo {
  ancho: number;
  alto: number;
  altas: { texto: string; sub: string } | null;
  /** Zonas de la planta baja: rótulos en su tramo (`xTexto`, apartado del núcleo). */
  zonasPb: { x0: number; x1: number; texto: string; xTexto: number }[];
  /**
   * El sótano no habitable (x0..x1): todo el ancho o, si la planta baja lo
   * excede, el resto tras la parte sin sótano; con su hueco libre (rótulo,
   * etiqueta de contención y flecha de ventilación), apartado del núcleo.
   */
  sotano: {
    x0: number;
    x1: number;
    texto: string;
    sub: string;
    xRotulo: number;
    xChip: number;
    flecha: [number, number];
  } | null;
  /**
   * Tramo de la PB que apoya en el terreno (x0..x1): la parte sin sótano va a la
   * izquierda, del lado de la fachada; `flechaCamara` entra por esa fachada y
   * `xConducto` es donde sube el conducto de la despresurización.
   */
  terreno: { x0: number; x1: number; texto: string; flechaCamara: [number, number]; xConducto: number } | null;
  camara: boolean;
  despresurizacion: boolean;
  /** Recorrido de la barrera (path) y si está. */
  barrera: { d: string } | null;
  /** El núcleo de escalera y ascensor, dentro del portal o vestíbulo y sobre el sótano. */
  nucleo: { x0: number; x1: number } | null;
  /** Flechas del radón: x y de dónde arrancan hacia arriba. */
  radon: { x: number; y0: number; y1: number }[];
  /** El terreno bajo cada tramo (rangos exactos). */
  terrenoBajo: { x0: number; x1: number; y: number }[];
  etiquetas: EtiquetaHs6[];
  rotuloTerreno: string;
}

const ROTULO: Partial<Record<UsoZona, string>> = {
  viviendas: "Viviendas",
  vivienda_unifamiliar: "Vivienda",
  local_sin_uso: "Local sin uso definido",
  oficinas: "Oficinas",
  zona_comun: "Portal",
  vestibulo: "Vestíbulo",
  garaje_privado: "Garaje",
  garaje: "Garaje",
  trasteros: "Trasteros",
  instalaciones: "Instalaciones",
};

export function calcularSeccionHs6(j: JustificacionHs6, zonasPb: { uso: UsoZona; superficie_m2: number }[]): SeccionHs6Geo {
  const S = SECCION_HS6;
  const pr = j.proteccion;
  const ancho = S.X1 - S.X0;
  const yBajoPb = S.Y_PB_SUELO + S.LOSA;
  const hay = (id: string) => j.elementos.some((e) => e.id === id);

  // Planta baja: zonas en proporción a su superficie.
  const total = zonasPb.reduce((a, z) => a + z.superficie_m2, 0) || 1;
  let x = S.X0;
  const tramos = zonasPb.map((z) => {
    const w = (ancho * z.superficie_m2) / total;
    const out = { x0: x, x1: x + w, uso: z.uso, texto: ROTULO[z.uso] ?? z.uso };
    x += w;
    return out;
  });

  // El sótano y lo que apoya en el terreno: la parte de la planta baja sin
  // sótano debajo se dibuja a la izquierda, del lado de la fachada.
  const conSotano = pr.sobreNoHabitable !== null;
  const parcial = pr.sobreTerreno.find((t) => t.nivel === 0 && t.parcial) ?? null;
  const pbEnTerreno = pr.sobreTerreno.some((t) => t.nivel === 0 && !t.parcial);
  const wParcial = parcial ? ancho * Math.max(0.2, Math.min(0.5, parcial.superficie_m2 / total)) : 0;
  const sx0 = S.X0 + (conSotano ? wParcial : 0);
  const sx1 = S.X1;
  const terreno: SeccionHs6Geo["terreno"] =
    parcial && conSotano
      ? { x0: S.X0, x1: sx0, texto: "sin sótano debajo", flechaCamara: [0, sx0 - 12], xConducto: S.X0 - 22 }
      : pbEnTerreno || (!conSotano && pr.sobreTerreno.length > 0)
        ? { x0: S.X0, x1: S.X1, texto: "apoya en el terreno", flechaCamara: [S.W, S.X0 + 12], xConducto: S.X1 + 22 }
        : null;

  // El núcleo, al principio del portal o vestíbulo y siempre sobre el sótano.
  const comun = tramos.find((t) => t.uso === "zona_comun" || t.uso === "vestibulo") ?? null;
  const nx0 = Math.min(Math.max(comun ? comun.x0 + 8 : (sx0 + sx1 - S.NUCLEO_W) / 2, sx0 + 8), sx1 - S.NUCLEO_W - 8);
  const nucleo = hay("nucleo") ? { x0: nx0, x1: nx0 + S.NUCLEO_W } : null;

  // Los rótulos de la planta baja se apartan del núcleo.
  const zonas: SeccionHs6Geo["zonasPb"] = tramos.map((t) => {
    let xTexto = t.x0 + 14;
    const w = t.texto.length * 6.4;
    if (nucleo && xTexto < nucleo.x1 + 8 && xTexto + w > nucleo.x0 - 4) xTexto = nucleo.x1 + 12;
    return { x0: t.x0, x1: t.x1, texto: t.texto, xTexto };
  });

  // El sótano: su hueco libre, a la derecha del núcleo si este cae a la izquierda.
  let sotano: SeccionHs6Geo["sotano"] = null;
  if (conSotano && pr.sobreNoHabitable) {
    const xRotulo = nucleo && nucleo.x0 < sx0 + 220 ? nucleo.x1 + 16 : sx0 + 16;
    const fin = nucleo && nucleo.x0 > xRotulo + 200 ? nucleo.x0 - 14 : sx1 - 40;
    sotano = {
      x0: sx0,
      x1: sx1,
      texto: `${pr.sobreNoHabitable.conGaraje ? "Garaje" : "Sótano"} · S1`,
      sub: hay("contencion-garaje") ? "no habitable · ventilado" : "no habitable",
      xRotulo,
      xChip: xRotulo + 64,
      flecha: [xRotulo + 150, Math.max(xRotulo + 170, fin)],
    };
  }

  const camara = hay("camara");
  const despresurizacion = hay("despresurizacion");

  // La barrera.
  let barrera: SeccionHs6Geo["barrera"] = null;
  if (hay("barrera")) {
    const trozos: string[] = [];
    if (sotano) {
      if (pr.decisiones.posicionBarrera === "solera") {
        trozos.push(`M${sx0 - 12} ${yBajoPb}V${S.Y_SOTANO}H${sx1 + 12}V${yBajoPb}`);
      } else {
        trozos.push(
          nucleo
            ? `M${sx0} ${S.Y_PB_SUELO - 3}H${nucleo.x0}M${nucleo.x1} ${S.Y_PB_SUELO - 3}H${sx1}`
            : `M${sx0} ${S.Y_PB_SUELO - 3}H${sx1}`,
        );
      }
    }
    if (terreno) trozos.push(`M${terreno.x0} ${S.Y_PB_SUELO - 3}H${terreno.x1}`);
    barrera = trozos.length > 0 ? { d: trozos.join("") } : null;
  }

  // El radón sube del terreno.
  const radon: SeccionHs6Geo["radon"] = [];
  const terrenoBajo: SeccionHs6Geo["terrenoBajo"] = [];
  if (sotano) {
    terrenoBajo.push({ x0: sx0 - 12, x1: S.X1 + 12, y: S.Y_SOTANO + 4 });
    radon.push({ x: sx0 + (sx1 - sx0) * 0.25, y0: S.H - 22, y1: S.Y_SOTANO + 8 });
    radon.push({ x: sx0 + (sx1 - sx0) * 0.75, y0: S.H - 22, y1: S.Y_SOTANO + 8 });
  }
  if (terreno) {
    const yT = camara ? S.Y_CAMARA + 4 : yBajoPb + 2;
    terrenoBajo.push({ x0: S.X0 - 12, x1: sotano ? sx0 - 12 : S.X1 + 12, y: yT });
    const w = terreno.x1 - terreno.x0;
    radon.push({ x: terreno.x0 + w * 0.3, y0: S.H - 22, y1: yT + 4 });
    radon.push({ x: terreno.x0 + w * 0.75, y0: S.H - 22, y1: yT + 4 });
  }

  // Etiquetas.
  const etiquetas: EtiquetaHs6[] = [];
  if (barrera) {
    const enSolera = sotano !== null && pr.decisiones.posicionBarrera === "solera";
    etiquetas.push({
      key: "et-barrera",
      elementoId: "barrera",
      x: enSolera ? sx0 + (sx1 - sx0) * 0.55 : sotano ? (sx0 + sx1) / 2 : 300,
      y: enSolera ? S.Y_SOTANO : S.Y_PB_SUELO - 3,
    });
  }
  if (hay("contencion-garaje") && sotano) {
    etiquetas.push({ key: "et-contencion", elementoId: "contencion-garaje", x: sotano.xChip, y: 352 });
  }
  if (camara && terreno) etiquetas.push({ key: "et-camara", elementoId: "camara", x: (terreno.x0 + terreno.x1) / 2, y: S.Y_CAMARA - 18 });
  if (despresurizacion && terreno) {
    etiquetas.push({ key: "et-despresurizacion", elementoId: "despresurizacion", x: (terreno.x0 + terreno.x1) / 2, y: yBajoPb + 56 });
  }
  if (nucleo) etiquetas.push({ key: "et-nucleo", elementoId: "nucleo", x: (nucleo.x0 + nucleo.x1) / 2, y: 215 });
  if (hay("no-tocan")) etiquetas.push({ key: "et-no-tocan", elementoId: "no-tocan", x: 440, y: 88 });

  const altas =
    pr.noTocan.niveles.length > 0
      ? {
          texto: `${nombresUsos(pr.noTocan.usos).replace(/^./, (c) => c.toUpperCase())} · ${rangoNiveles(pr.noTocan.niveles)}`,
          sub: pr.noTocan.niveles.length === 1 ? "no toca el terreno" : "no tocan el terreno",
        }
      : null;

  return {
    ancho: S.W,
    alto: S.H,
    altas,
    zonasPb: zonas,
    sotano,
    terreno,
    camara,
    despresurizacion,
    barrera,
    nucleo,
    radon,
    terrenoBajo,
    etiquetas,
    rotuloTerreno: pr.zona === "sin_exigencia" ? "terreno" : `terreno · zona ${pr.zona}`,
  };
}

/** Las zonas de la planta baja, para el dibujo. */
export function zonasPbDe(e: Edificio): { uso: UsoZona; superficie_m2: number }[] {
  const pb = plantasDe(e).find((p) => p.nivel === 0);
  return (pb?.zonas ?? []).map((z) => ({
    uso: z.uso,
    superficie_m2: Number.isFinite(z.superficieUtil_m2) ? Math.max(0, z.superficieUtil_m2) : 0,
  }));
}

/** Tamaño nativo del dibujo de HS6. Lo usa la ficha. */
export function tamanoDibujoHs6(): { nativeW: number; nativeH: number } {
  return { nativeW: SECCION_HS6.W, nativeH: SECCION_HS6.H };
}
