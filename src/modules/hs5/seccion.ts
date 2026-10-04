// =============================================================================
// DB-HS5 — Geometría de la SECCIÓN del edificio con su red (feature-14 §I).
// Sin JSX: la comparten el render (`SeccionHs5.tsx`), la ficha (tamaño nativo)
// y las etiquetas HTML de la pantalla (anclas). PURA y determinista.
//
// Lo que se dibuja (maqueta v4 de HS5):
//   - las plantas de El edificio con su cota, forjados, muros, rasante y terreno;
//     los grupos de más de 3 plantas iguales se comprimen (arriba · ⋮ · abajo);
//   - una vertical por tipo (las iguales una vez, «× n»): cuartos húmedos por
//     planta, el ramal de cada planta y su bajante, que sube a la cubierta
//     (ventilación primaria) y baja al colector;
//   - pluviales por las fachadas, con sumideros o canalones;
//   - el colector, colgado bajo la PB o enterrado, hasta la arqueta de salida;
//   - la previsión del local y la red del garaje (sumideros, separador, pozo).
// Unidades del viewBox ≈ px; 22 por metro de altura de planta.
// =============================================================================

import { etiquetaNivel } from "../../lib/edificio/derivar";
import { baseSeccion, SECCION_BASE, type BandaSeccion, type PisoSeccion } from "../../lib/edificio/seccion";
import type { Edificio, UsoZona } from "../../lib/edificio/tipos";
import type { JustificacionHs5 } from "./justificacion";
import { slugDe, type ClaseCuarto } from "./red";
import { hs5NativeSize } from "./svg-meta";

export const SECCION = {
  ...SECCION_BASE,
  /** Zona útil para las verticales (entre las bajantes de pluviales). */
  XL: 100,
  XR: 560,
  BOX_W: 38,
  BOX_H: 18,
  PASO_BOX: 46,
  A_BAJANTE: 41,
  TRAS_BAJANTE: 41,
  ENTRE_VERTICALES: 57,
  /** Bajantes de pluviales, por las fachadas. */
  X_PLUVIAL_IZQ: 74,
  X_PLUVIAL_DER: 586,
  /** Arqueta de salida (fuera del edificio, a la izquierda). */
  ARQ_X: 16,
  ARQ_LADO: 32,
} as const;

export type { BandaSeccion, PisoSeccion } from "../../lib/edificio/seccion";

export interface CajaCuarto {
  x: number;
  y: number;
  w: number;
  h: number;
  etiqueta: string;
  clase: ClaseCuarto;
}

export interface RamalSeccion {
  id: string;
  nivel: number;
  /** De la primera caja a la bajante, a esta altura. */
  x0: number;
  x1: number;
  y: number;
  cajas: CajaCuarto[];
}

export interface BajanteSeccion {
  /** Id del elemento (la bajante), o null si sus ramales acometen directos al colector. */
  id: string | null;
  x: number;
  /** Arranque arriba: sobre la cubierta, o la planta si va directa al colector. */
  y0: number;
  y1: number;
  ramales: RamalSeccion[];
}

export interface VerticalSeccion {
  id: string;
  rotulo: string;
  rotuloX: number;
  rotuloY: number;
  bajantes: BajanteSeccion[];
}

export interface PluvialSeccion {
  x: number;
}

export interface LocalSeccion {
  elementoId: string;
  texto: string;
  textoX: number;
  textoY: number;
  x: number;
  y0: number;
  y1: number;
}

export interface GarajeSeccion {
  elementoId: string;
  texto: string;
  textoX: number;
  textoY: number;
  sumideros: number[];
  ySuelo: number;
  bombeo: boolean;
  sg: { x: number; y: number; w: number; h: number };
  pozo: { x: number; y: number; w: number; h: number } | null;
  /** Impulsión (o bajada) hasta el colector. */
  xSubida: number;
}

export interface EtiquetaSeccion {
  key: string;
  elementoId: string;
  x: number;
  y: number;
}

export interface Seccion {
  ancho: number;
  alto: number;
  pisos: PisoSeccion[];
  bandas: BandaSeccion[];
  cotaCubierta: string;
  yRasante: number;
  /** Bajo el edificio, el terreno empieza aquí. */
  yTerrenoBajo: number;
  yFondoEdificio: number;
  verticales: VerticalSeccion[];
  /** Colector de residuales: de la arqueta a la última bajante. */
  colector: { id: string; x0: number; x1: number; y: number } | null;
  colectorPluviales: { x0: number; x1: number; y: number } | null;
  pluviales: PluvialSeccion[];
  /** Sumideros (plana) o canalones (inclinada). */
  recogida: "sumideros" | "canalones";
  arqueta: { x: number; y: number; lado: number; texto: [string, string] };
  arquetaPluviales: { x: number; y: number; lado: number } | null;
  locales: LocalSeccion[];
  garajes: GarajeSeccion[];
  /** Otras zonas rotuladas en su planta («Portal»). */
  rotulos: { x: number; y: number; texto: string }[];
  ventilacion: string;
  secundaria: boolean;
  etiquetas: EtiquetaSeccion[];
}

// -----------------------------------------------------------------------------

const ROTULO_USO: Partial<Record<UsoZona, string>> = {
  zona_comun: "Portal",
  vestibulo: "Vestíbulo",
  trasteros: "Trasteros",
  instalaciones: "Instalaciones",
};

/** Etiqueta corta de un cuarto para su caja. */
function rotuloCaja(clase: ClaseCuarto): string {
  return clase === "bano" ? "Baño" : clase === "aseo" ? "Aseo" : clase === "cocina" ? "Cocina" : "Aseos";
}

export function calcularSeccion(j: JustificacionHs5, edificio: Edificio): Seccion {
  const S = SECCION;
  const red = j.red;
  const base = baseSeccion(edificio);
  const { pisos, bandas, ySueloDe, yRasante, yFondoEdificio, haySotano } = base;

  // ── Colector ─────────────────────────────────────────────────────────────
  const enterrado = red.decisiones.colectores === "enterrado" && j.modo === "edificio";
  const yCol = enterrado
    ? yFondoEdificio + 18
    : red.colgadoDe === "forjado_pb" || !haySotano
      ? yRasante + S.LOSA + 12
      : yRasante + S.LOSA + 14;
  const yTerrenoBajo = !haySotano && !enterrado ? yRasante + S.LOSA + 26 : yFondoEdificio;
  const yColP = yCol + 14;

  // ── Verticales ───────────────────────────────────────────────────────────
  type Prov = { v: (typeof red.verticales)[number]; anchos: number[]; ancho: number };
  const provs: Prov[] = red.verticales.map((v) => {
    const anchos = v.bajantes.map((b) => {
      const cajas = Math.max(1, ...b.ramales.map((r) => r.cuartos.length));
      return (cajas - 1) * S.PASO_BOX + S.A_BAJANTE;
    });
    const ancho = anchos.reduce((s, a) => s + a, 0) + Math.max(0, anchos.length - 1) * S.TRAS_BAJANTE;
    return { v, anchos, ancho };
  });
  const total =
    provs.reduce((s, p) => s + p.ancho, 0) + Math.max(0, provs.length - 1) * S.ENTRE_VERTICALES + S.BOX_W / 2;
  const disponible = S.XR - S.XL;
  const esc = total > disponible ? disponible / total : 1;
  const boxW = Math.max(26, S.BOX_W * esc);
  let cursor = S.XL + (disponible - total * esc) / 2 + (S.BOX_W / 2) * esc;

  const verticales: VerticalSeccion[] = [];
  const xsBajantes: number[] = [];
  for (const { v, anchos } of provs) {
    const bajantes: BajanteSeccion[] = [];
    const xPrimera = cursor;
    v.bajantes.forEach((b, bi) => {
      const xCaja0 = cursor;
      const xB = cursor + anchos[bi] * esc;
      const ramales: RamalSeccion[] = [];
      for (const r of b.ramales) {
        const ySuelo = ySueloDe.get(r.nivel);
        if (ySuelo === undefined) continue; // planta comprimida en una banda
        const cajas: CajaCuarto[] = r.cuartos.map((c, ci) => ({
          x: xCaja0 + ci * S.PASO_BOX * esc - boxW / 2,
          y: ySuelo - 36,
          w: boxW,
          h: S.BOX_H,
          etiqueta: rotuloCaja(c.clase),
          clase: c.clase,
        }));
        ramales.push({ id: r.id, nivel: r.nivel, x0: xCaja0, x1: xB, y: ySuelo - 8, cajas });
      }
      const nivelMax = Math.max(...b.ramales.map((r) => r.nivel));
      const y0 = b.id ? S.ROOF - 24 : (ySueloDe.get(nivelMax) ?? yRasante) - 8;
      bajantes.push({ id: b.id, x: xB, y0, y1: yCol, ramales });
      xsBajantes.push(xB);
      cursor = xB + S.TRAS_BAJANTE * esc;
    });
    const nivelArriba = Math.max(...v.niveles);
    const ySueloArriba = ySueloDe.get(nivelArriba) ?? pisos[0].ySuelo;
    const tipo = v.clase === "nucleo_aseos" ? "ASEOS" : "VIVIENDA";
    const rotulo = red.unifamiliar
      ? "VIVIENDA"
      : `${tipo} ${v.nombre}${v.instancias > 1 ? ` × ${v.instancias}` : ""}`;
    verticales.push({
      id: v.id,
      rotulo,
      rotuloX: xPrimera - boxW / 2,
      rotuloY: ySueloArriba - 44,
      bajantes,
    });
    cursor += (S.ENTRE_VERTICALES - S.TRAS_BAJANTE) * esc;
  }

  // ── Pluviales ────────────────────────────────────────────────────────────
  const nPluv = j.pluviales?.bajantes ?? 0;
  const pluviales: PluvialSeccion[] =
    nPluv === 0 ? [] : nPluv === 1 ? [{ x: S.X_PLUVIAL_DER }] : [{ x: S.X_PLUVIAL_IZQ }, { x: S.X_PLUVIAL_DER }];
  const separativo = red.decisiones.alcantarillado === "separativo";

  // ── Arquetas ─────────────────────────────────────────────────────────────
  const arqueta = {
    x: S.ARQ_X,
    y: yCol - 10,
    lado: S.ARQ_LADO,
    texto: ["Arqueta →", separativo ? "residuales" : "red unitaria"] as [string, string],
  };
  const arquetaPluviales = separativo && nPluv > 0 ? { x: S.X1 + 6, y: yColP - 10, lado: 26 } : null;

  const colector =
    j.residuales && red.colectorId && xsBajantes.length > 0
      ? { id: red.colectorId, x0: S.ARQ_X + S.ARQ_LADO, x1: Math.max(...xsBajantes), y: yCol }
      : null;
  const colectorPluviales =
    nPluv > 0
      ? separativo
        ? { x0: pluviales[0].x, x1: S.X1 + 6, y: yColP }
        : { x0: S.ARQ_X + S.ARQ_LADO, x1: S.X_PLUVIAL_DER, y: yColP }
      : null;

  // ── Locales y otros rótulos ──────────────────────────────────────────────
  const libre = (x: number) =>
    xsBajantes.every((b) => Math.abs(b - x) >= 26) && pluviales.every((p) => Math.abs(p.x - x) >= 26);
  const locales: LocalSeccion[] = [];
  const rotulos: Seccion["rotulos"] = [];
  for (const l of red.locales) {
    const piso = pisos.find((p) => p.nivel === l.nivel);
    if (!piso) continue;
    let x = 176;
    while (x < S.XR && !libre(x)) x += 4;
    locales.push({
      elementoId: `local-${slugDe(etiquetaNivel(l.nivel))}`,
      texto: l.numero > 1 ? "Locales sin uso definido" : "Local sin uso definido",
      textoX: S.X0 + 36,
      textoY: piso.yTecho + 20,
      x,
      y0: piso.ySuelo - 14,
      y1: yCol,
    });
  }
  const conCajas = new Set(verticales.flatMap((v) => v.bajantes.flatMap((b) => b.ramales.map((r) => r.nivel))));
  for (const p of pisos) {
    if (p.nivel < 0 || conCajas.has(p.nivel)) continue;
    const texto = [...new Set(p.usos.map((u) => ROTULO_USO[u]).filter((t): t is string => !!t))].join(" · ");
    if (texto) rotulos.push({ x: S.X1 - 110, y: p.ySuelo - 36, texto });
  }

  // ── Garajes ──────────────────────────────────────────────────────────────
  const garajes: GarajeSeccion[] = [];
  for (const el of j.elementos) {
    if (el.detalle.clase !== "garaje") continue;
    const g = el.detalle.garaje;
    const ySuelo = ySueloDe.get(g.nivel);
    if (ySuelo === undefined) continue;
    const bombeo = el.detalle.bombeo;
    garajes.push({
      elementoId: el.id,
      texto: `Garaje${g.plazas > 0 ? ` · ${g.plazas} plazas` : ""}`,
      textoX: S.X1 - 180,
      textoY: ySuelo - 16,
      sumideros: [250, 350, 450, 540],
      ySuelo,
      bombeo,
      sg: { x: 158, y: ySuelo - 14, w: 32, h: 14 },
      pozo: bombeo ? { x: 112, y: ySuelo + S.LOSA, w: 34, h: 36 } : null,
      xSubida: 129,
    });
  }

  // ── Altura del dibujo ────────────────────────────────────────────────────
  const fondoGaraje = Math.max(0, ...garajes.map((g) => (g.pozo ? g.pozo.y + g.pozo.h + 30 : g.ySuelo + 30)));
  const alto = Math.max(yColP + 12, yFondoEdificio, fondoGaraje, arqueta.y + arqueta.lado + 40) + 24;

  // ── Anclas de las etiquetas ──────────────────────────────────────────────
  const etiquetas: EtiquetaSeccion[] = [];
  for (const v of verticales) {
    for (const b of v.bajantes) {
      if (b.id) etiquetas.push({ key: `et-${b.id}`, elementoId: b.id, x: b.x, y: S.ROOF - 12 });
    }
  }
  pluviales.forEach((p, k) =>
    etiquetas.push({ key: `et-pluvial-${k}`, elementoId: "pluviales-bajantes", x: p.x, y: yRasante - 40 }),
  );
  if (colector) {
    const xs = [colector.x0 + 40, ...locales.map((l) => l.x), ...garajes.map((g) => g.xSubida)];
    // El centro del colector, apartado de las bajadas que lo cruzan.
    let x = (colector.x0 + colector.x1) / 2;
    while (xs.some((o) => Math.abs(o - x) < 44) && x < colector.x1) x += 8;
    etiquetas.push({ key: "et-colector", elementoId: colector.id, x, y: colector.y });
  }
  for (const l of locales) etiquetas.push({ key: `et-${l.elementoId}`, elementoId: l.elementoId, x: l.x, y: l.y0 - 22 });
  for (const g of garajes) {
    etiquetas.push({
      key: `et-${g.elementoId}`,
      elementoId: g.elementoId,
      x: g.xSubida,
      y: g.pozo ? g.pozo.y + g.pozo.h + 16 : g.ySuelo + 18,
    });
  }

  const secundaria = red.decisiones.ventilacion === "secundaria";
  return {
    ancho: S.W,
    alto,
    pisos,
    bandas,
    cotaCubierta: base.cotaCubierta,
    yRasante,
    yTerrenoBajo,
    yFondoEdificio,
    verticales,
    colector,
    colectorPluviales,
    pluviales,
    recogida: red.cubierta.tipo === "inclinada" ? "canalones" : "sumideros",
    arqueta,
    arquetaPluviales,
    locales,
    garajes,
    rotulos,
    ventilacion: secundaria ? "↑ ventilación primaria y secundaria" : "↑ ventilación primaria",
    secundaria,
    etiquetas,
  };
}

/**
 * Tamaño nativo del dibujo de HS5 (el viewBox): la sección, o el esquema de
 * columna si la red de residuales se ajustó a mano. Lo usa la ficha.
 */
export function tamanoDibujoHs5(j: JustificacionHs5, edificio: Edificio): { nativeW: number; nativeH: number } {
  if (j.modo === "manual" && j.residuales) return hs5NativeSize(j.residuales);
  const s = calcularSeccion(j, edificio);
  return { nativeW: s.ancho, nativeH: s.alto };
}
