// =============================================================================
// DB-HS1 — Geometría del dibujo (feature-17): la sección común de El edificio
// con su envolvente encima. Sin JSX; PURA y determinista. La comparten el
// render, la ficha (tamaño nativo) y las etiquetas HTML (anclas).
//
// Encima de `baseSeccion`: las fachadas (lo que está sobre rasante), la cubierta
// (plana o a dos aguas), los muros del sótano con la impermeabilización por
// fuera o por dentro y la capa drenante, el suelo en contacto con el terreno
// (con la cámara si es elevado), el nivel freático y el drenaje.
// =============================================================================

import { plantasDe } from "../../lib/edificio/derivar";
import { baseSeccion, SECCION_BASE, type BaseSeccion } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import type { JustificacionHs1 } from "./justificacion";

export interface EtiquetaHs1 {
  key: string;
  elementoId: string;
  x: number;
  y: number;
}

export interface SeccionHs1Geo extends BaseSeccion {
  ancho: number;
  alto: number;
  yTerrenoBajo: number;
  /** Las dos fachadas, sobre rasante. */
  fachada: string;
  cubierta: { d: string; inclinada: boolean };
  muro: {
    d: string;
    /** La impermeabilización: por fuera, por dentro, o la hoja interior del muro parcialmente estanco. */
    imper: { d: string; tipo: "exterior" | "interior" | "camara" } | null;
    /** La capa drenante (D1), por fuera. */
    drenante: string | null;
  } | null;
  /** Las líneas de los suelos en contacto con el terreno, por elemento. */
  suelos: { id: string; d: string }[];
  /** La cámara del suelo elevado. */
  camara: { x0: number; x1: number; y0: number; y1: number } | null;
  freatico: { y: number; texto: string; recortado: boolean } | null;
  /** Tubos drenantes (círculos). */
  drenes: { elementoId: string; cx: number; cy: number }[];
  bombeo: { x: number; y: number; w: number; h: number } | null;
  etiquetas: EtiquetaHs1[];
}

const S = SECCION_BASE;
/** Px por metro bajo el sótano más bajo (el freático hondo). */
const K_BAJO = 22;
/** Lo más que se baja el freático por debajo del edificio. */
const FREATICO_MAX = 120;
const CAMARA_ALTO = 16;

/** La y de una cota bajo rasante, siguiendo las plantas dibujadas. */
function yDeCota(cotas: { cota: number; y: number }[], cota: number): number {
  // `cotas` de arriba abajo, con (0, rasante) primero.
  for (let i = 1; i < cotas.length; i++) {
    const a = cotas[i - 1];
    const b = cotas[i];
    if (cota >= b.cota) return a.y + ((a.cota - cota) / (a.cota - b.cota || 1)) * (b.y - a.y);
  }
  const ult = cotas[cotas.length - 1];
  return ult.y + (ult.cota - cota) * K_BAJO;
}

export function calcularSeccionHs1(j: JustificacionHs1, edificio: Edificio): SeccionHs1Geo {
  const base = baseSeccion(edificio);
  const hay = (id: string) => j.elementos.some((e) => e.id === id);
  const el = (id: string) => j.elementos.find((e) => e.id === id);
  const yR = base.yRasante;
  const yFondo = base.yFondoEdificio;
  const conSotano = base.haySotano;
  const elevado = j.decisiones.sueloTipo === "elevado";

  // Cotas dibujadas bajo rasante: la rasante y el suelo de cada sótano.
  const pisosSotano = base.pisos.filter((p) => p.nivel < 0);
  const cotasPartes = plantasDe(edificio).filter((p) => p.nivel < 0);
  const cotas: { cota: number; y: number }[] = [{ cota: 0, y: yR }];
  for (const p of pisosSotano) {
    const c = cotasPartes.find((x) => x.nivel === p.nivel);
    if (c) cotas.push({ cota: c.cota_m, y: p.ySuelo });
  }

  // ── Fachadas y cubierta ───────────────────────────────────────────────────
  const fachada = `M${S.X0} ${S.ROOF}V${yR}M${S.X1} ${S.ROOF}V${yR}`;
  const inclinada = j.cubierta.tipo === "inclinada";
  const xm = (S.X0 + S.X1) / 2;
  const cubierta = inclinada
    ? { d: `M${S.X0 - 14} ${S.ROOF + 2}L${xm} ${S.ROOF - 30}L${S.X1 + 14} ${S.ROOF + 2}`, inclinada }
    : { d: `M${S.X0 - 4} ${S.ROOF}H${S.X1 + 4}`, inclinada };

  // ── Muros ─────────────────────────────────────────────────────────────────
  let muro: SeccionHs1Geo["muro"] = null;
  if (conSotano && hay("muro")) {
    const imp = j.decisiones.muroImper;
    const condiciones = el("muro")?.detalle.clase === "muro" ? (el("muro")!.detalle as { condiciones: readonly string[] | null }).condiciones : null;
    const d1 = condiciones?.includes("D1") ?? false;
    const off = imp === "exterior" ? -5 : imp === "interior" ? 5 : 9;
    const yTop = imp === "exterior" ? yR - 10 : yR;
    muro = {
      d: `M${S.X0} ${yR}V${yFondo}M${S.X1} ${yR}V${yFondo}`,
      imper: {
        d: `M${S.X0 + off} ${yTop}V${yFondo}M${S.X1 - off} ${yTop}V${yFondo}`,
        tipo: imp === "parcialmente_estanco" ? "camara" : imp,
      },
      drenante: d1 ? `M${S.X0 - 10} ${yR + 4}V${yFondo}M${S.X1 + 10} ${yR + 4}V${yFondo}` : null,
    };
  }

  // ── Suelos ────────────────────────────────────────────────────────────────
  const suelos: SeccionHs1Geo["suelos"] = [];
  let camara: SeccionHs1Geo["camara"] = null;
  if (hay("suelo-sotano")) suelos.push({ id: "suelo-sotano", d: `M${S.X0} ${yFondo}H${S.X1}` });
  const ySueloPb = yR + S.LOSA;
  const pb = el("suelo-pb");
  let xParcial = S.X1;
  if (pb && pb.detalle.clase === "suelo") {
    if (pb.detalle.suelo.parcial) {
      // La parte de la planta baja sin sótano debajo: a la izquierda, en proporción.
      const total = pb.detalle.suelo.superficie_m2 + (j.partes.sotanos?.superficie_m2 ?? 0);
      xParcial = S.X0 + (S.X1 - S.X0) * Math.max(0.15, Math.min(0.45, pb.detalle.suelo.superficie_m2 / (total || 1)));
      suelos.push({ id: "suelo-pb", d: `M${S.X0} ${ySueloPb}H${xParcial}` });
    } else {
      suelos.push({ id: "suelo-pb", d: `M${S.X0} ${ySueloPb}H${S.X1}` });
      if (elevado) camara = { x0: S.X0, x1: S.X1, y0: ySueloPb, y1: ySueloPb + CAMARA_ALTO };
    }
  }
  if (elevado && conSotano && hay("suelo-sotano")) {
    camara = { x0: S.X0, x1: S.X1, y0: yFondo, y1: yFondo + CAMARA_ALTO };
  }
  const yTerrenoBajo = conSotano ? yFondo + (camara && camara.y0 === yFondo ? CAMARA_ALTO : 0) : ySueloPb + (camara ? CAMARA_ALTO : 0) + 2;

  // ── Freático ──────────────────────────────────────────────────────────────
  const terreno = el("terreno");
  let freatico: SeccionHs1Geo["freatico"] = null;
  if (terreno && terreno.detalle.clase === "terreno" && terreno.detalle.freatico?.tipo === "profundidad") {
    const prof = terreno.detalle.freatico.profundidad_m;
    const y = yDeCota(cotas, -prof);
    const tope = yTerrenoBajo + FREATICO_MAX;
    freatico = { y: Math.min(y, tope), texto: `freático −${prof.toFixed(2).replace(".", ",")}`, recortado: y > tope };
  }

  // ── Drenaje y bombeo ──────────────────────────────────────────────────────
  const drenes: SeccionHs1Geo["drenes"] = [];
  const yDren = conSotano ? yFondo - 4 : ySueloPb + 12;
  if (hay("dren-muro")) {
    drenes.push({ elementoId: "dren-muro", cx: S.X0 - 12, cy: yDren }, { elementoId: "dren-muro", cx: S.X1 + 12, cy: yDren });
  }
  const yBajoSuelo = (conSotano ? yFondo : ySueloPb) + 10;
  if (hay("dren-suelo")) {
    for (const f of [0.3, 0.55, 0.8]) drenes.push({ elementoId: "dren-suelo", cx: S.X0 + (S.X1 - S.X0) * f, cy: yBajoSuelo });
  }
  const bombeo = hay("bombeo")
    ? conSotano
      ? { x: S.X1 - 46, y: yFondo - 24, w: 34, h: 24 }
      : { x: S.X1 - 46, y: ySueloPb + 4, w: 34, h: 24 }
    : null;

  // ── Etiquetas ─────────────────────────────────────────────────────────────
  const etiquetas: EtiquetaHs1[] = [];
  etiquetas.push({ key: "et-cubierta", elementoId: "cubierta", x: S.X0 + (S.X1 - S.X0) * 0.36, y: S.ROOF - (inclinada ? 22 : 16) });
  etiquetas.push({ key: "et-fachada", elementoId: "fachada", x: S.X1 - 90, y: (S.ROOF + yR) / 2 });
  // Por encima del rótulo del sótano («S1 −3,00»), que va al pie de la planta.
  if (muro) etiquetas.push({ key: "et-muro", elementoId: "muro", x: S.X0 + 96, y: yR + (yFondo - yR) * 0.36 });
  const yBajo = (conSotano ? yFondo : ySueloPb) + (camara ? CAMARA_ALTO : 0);
  if (hay("suelo-sotano")) etiquetas.push({ key: "et-suelo-sotano", elementoId: "suelo-sotano", x: xm + 70, y: yBajo + 20 });
  if (pb) {
    etiquetas.push(
      pb.detalle.clase === "suelo" && pb.detalle.suelo.parcial
        ? { key: "et-suelo-pb", elementoId: "suelo-pb", x: (S.X0 + xParcial) / 2 + 30, y: ySueloPb - 18 }
        : { key: "et-suelo-pb", elementoId: "suelo-pb", x: xm + 70, y: yBajo + 20 },
    );
  }
  if (hay("dren-muro")) etiquetas.push({ key: "et-dren-muro", elementoId: "dren-muro", x: S.X0 + 50, y: yBajo + 46 });
  if (hay("dren-suelo")) etiquetas.push({ key: "et-dren-suelo", elementoId: "dren-suelo", x: xm + 70, y: yBajo + 46 });
  if (hay("canaletas")) etiquetas.push({ key: "et-canaletas", elementoId: "canaletas", x: S.X1 - 110, y: yFondo - 40 });
  if (bombeo) etiquetas.push({ key: "et-bombeo", elementoId: "bombeo", x: S.X1 - 110, y: bombeo.y + 12 });
  etiquetas.push(
    freatico
      ? { key: "et-terreno", elementoId: "terreno", x: S.X0 + 120, y: freatico.y }
      : { key: "et-terreno", elementoId: "terreno", x: S.X0 + 120, y: yBajo + (hay("dren-muro") ? 72 : 46) },
  );

  const fondoEtiquetas = Math.max(...etiquetas.map((e) => e.y));
  const alto = Math.round(Math.max(yTerrenoBajo + 40, fondoEtiquetas + 22, (freatico?.y ?? 0) + 22));
  return { ...base, ancho: S.W, alto, yTerrenoBajo, fachada, cubierta, muro, suelos, camara, freatico, drenes, bombeo, etiquetas };
}

/** Tamaño nativo del dibujo de HS1. Lo usa la ficha. */
export function tamanoDibujoHs1(j: JustificacionHs1, edificio: Edificio): { nativeW: number; nativeH: number } {
  const s = calcularSeccionHs1(j, edificio);
  return { nativeW: s.ancho, nativeH: s.alto };
}
