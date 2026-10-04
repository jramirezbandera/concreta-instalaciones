// =============================================================================
// DB-HS3 — Geometría de los dibujos (feature-15, HS3). Sin JSX: la comparten el
// render (`PlantaHs3.tsx`), la ficha (tamaño nativo) y las etiquetas HTML de la
// pantalla (anclas). PURA y determinista.
//
// Dos dibujos (maqueta v4 de HS3), uno por parte:
//   - VIVIENDA TIPO: planta esquemática generada de su programa — dormitorios
//     (y los baños de más) arriba, un pasillo, y abajo el salón, la cocina y el
//     primer baño con la entrada —; el aire entra por los secos, cruza por las
//     puertas y sale por los húmedos; debajo, lo que entra y lo que sale en dos
//     barras;
//   - GARAJE Y TRASTEROS: las plazas a los dos lados de la calle, la extracción
//     (o las aberturas mixtas), la detección de CO, la rampa y los trasteros.
// =============================================================================

import { etiquetaNivel } from "../../lib/edificio/derivar";
import type { ElementoHs3, JustificacionHs3 } from "./justificacion";
import type { LocalHs3, TipoVentilacion } from "./red";

export const PLANTA = {
  W: 640,
  H: 520,
  X0: 40,
  X1: 600,
  Y_TOP: 30,
  Y_PASILLO: 190,
  Y_BAJA: 240,
  Y_FONDO: 430,
  /** Barras de lo que entra y lo que sale. */
  Y_ENTRA: 460,
  Y_SALE: 488,
  X_BARRAS: 110,
  W_BARRAS: 420,
} as const;

export interface RecintoPlanta {
  /** Id del elemento (local) que representa, o null (entrada). */
  elementoId: string | null;
  localId: string | null;
  x: number;
  y: number;
  w: number;
  h: number;
  nombre: string;
  /** «entra por aireador», «sale por rejilla». */
  sub: string;
  humedo: boolean;
  arriba: boolean;
}

export interface FlechaPlanta {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SegmentoBarra {
  elementoId: string;
  x: number;
  w: number;
  texto: string;
  /** Lo que se añade para equilibrar (se pinta con el acento). */
  anadido: boolean;
}

export interface EtiquetaPlanta {
  key: string;
  elementoId: string;
  x: number;
  y: number;
}

export interface PlantaVivienda {
  clase: "vivienda";
  ancho: number;
  alto: number;
  recintos: RecintoPlanta[];
  /** Aireadores o rejillas en la fachada (admisión). */
  admisiones: { x: number; y: number; elementoId: string }[];
  /** Rejillas de extracción. */
  extracciones: { x: number; y: number; elementoId: string }[];
  /** Pasos de las puertas al pasillo. */
  puertas: { x: number; y: number }[];
  flechas: FlechaPlanta[];
  campana: { x: number; y: number; elementoId: string } | null;
  entra: SegmentoBarra[];
  sale: SegmentoBarra[];
  etiquetas: EtiquetaPlanta[];
  admisionTexto: string;
}

export interface PlantaGaraje {
  clase: "garaje";
  ancho: number;
  alto: number;
  rotulo: string;
  recinto: { x: number; y: number; w: number; h: number } | null;
  plazas: { x: number; y: number; w: number; h: number; n: number }[];
  mecanica: boolean;
  /** Conducto de extracción por la calle hasta el patinillo. */
  conducto: { d: string; elementoId: string } | null;
  rejillas: { x: number; y: number }[];
  /** Aberturas mixtas (natural), en dos fachadas opuestas. */
  mixtas: { x: number; y: number; w: number; h: number }[];
  co: { x: number; y: number }[];
  rampa: { x: number; y0: number; y1: number } | null;
  trasteros: { x: number; y: number; w: number; h: number; texto: string; elementoId: string } | null;
  etiquetas: EtiquetaPlanta[];
}

export type DibujoHs3 = PlantaVivienda | PlantaGaraje;

// -----------------------------------------------------------------------------
// Vivienda
// -----------------------------------------------------------------------------

function pesoLocal(l: LocalHs3): number {
  if (l.tipo === "dorm_principal") return 1.35;
  if (l.tipo === "dormitorio") return 1;
  if (l.humedo) return 0.62;
  return 1;
}

function viviendaDe(j: JustificacionHs3, t: TipoVentilacion, prefijo: string): PlantaVivienda {
  const P = PLANTA;
  const W = P.X1 - P.X0;
  const elId = (l: LocalHs3) => `${prefijo}${l.id}`;
  const admisionTexto = j.red.decisiones.admision === "aireadores" ? "entra por aireador" : "entra por la fachada";

  const dorms = t.locales.filter((l) => l.tipo === "dorm_principal" || l.tipo === "dormitorio");
  const salon = t.locales.find((l) => l.tipo === "salon_comedor") ?? null;
  const cocina = t.locales.find((l) => l.tipo === "cocina") ?? null;
  const otrosHumedos = t.locales.filter((l) => l.humedo && l.tipo !== "cocina");
  const abajoHumedo = otrosHumedos[0] ?? null;
  const arribaHumedos = otrosHumedos.slice(1);

  // Fila de arriba: dormitorios con los húmedos de más tras el segundo.
  const arriba: LocalHs3[] = [...dorms];
  arriba.splice(Math.min(2, arriba.length), 0, ...arribaHumedos);
  // Sin dormitorios ni húmedos de más, el salón sube (un estudio).
  const salonArriba = arriba.length === 0 && salon !== null;
  if (salonArriba) arriba.push(salon!);

  const recintos: RecintoPlanta[] = [];
  const pesosArriba = arriba.map(pesoLocal);
  const totalArriba = pesosArriba.reduce((s, p) => s + p, 0) || 1;
  let x = P.X0;
  arriba.forEach((l, i) => {
    const w = (W * pesosArriba[i]) / totalArriba;
    recintos.push({
      elementoId: elId(l),
      localId: l.id,
      x,
      y: P.Y_TOP,
      w,
      h: P.Y_PASILLO - P.Y_TOP,
      nombre: l.nombre,
      sub: l.humedo ? "sale por rejilla" : admisionTexto,
      humedo: l.humedo,
      arriba: true,
    });
    x += w;
  });

  // Fila de abajo: salón, cocina y la columna del primer baño con la entrada.
  const abajo: { l: LocalHs3 | null; peso: number }[] = [];
  if (salon && !salonArriba) abajo.push({ l: salon, peso: 2.1 });
  if (cocina) abajo.push({ l: cocina, peso: 1 });
  const pesoColumna = abajoHumedo ? 0.95 : 0.6;
  const totalAbajo = abajo.reduce((s, a) => s + a.peso, 0) + pesoColumna;
  x = P.X0;
  for (const a of abajo) {
    const w = (W * a.peso) / totalAbajo;
    recintos.push({
      elementoId: elId(a.l!),
      localId: a.l!.id,
      x,
      y: P.Y_BAJA,
      w,
      h: P.Y_FONDO - P.Y_BAJA,
      nombre: a.l!.nombre,
      sub: a.l!.humedo ? "sale por rejilla" : admisionTexto,
      humedo: a.l!.humedo,
      arriba: false,
    });
    x += w;
  }
  const wCol = P.X1 - x;
  const hBano = abajoHumedo ? (P.Y_FONDO - P.Y_BAJA) * 0.53 : 0;
  if (abajoHumedo) {
    recintos.push({
      elementoId: elId(abajoHumedo),
      localId: abajoHumedo.id,
      x,
      y: P.Y_BAJA,
      w: wCol,
      h: hBano,
      nombre: abajoHumedo.nombre,
      sub: "sale por rejilla",
      humedo: true,
      arriba: false,
    });
  }
  recintos.push({
    elementoId: null,
    localId: null,
    x,
    y: P.Y_BAJA + hBano,
    w: wCol,
    h: P.Y_FONDO - P.Y_BAJA - hBano,
    nombre: "Entrada",
    sub: "",
    humedo: false,
    arriba: false,
  });

  // Aireadores, rejillas, puertas y flechas.
  const admisiones: PlantaVivienda["admisiones"] = [];
  const extracciones: PlantaVivienda["extracciones"] = [];
  const puertas: PlantaVivienda["puertas"] = [];
  const flechas: FlechaPlanta[] = [];
  const yPasillo = (P.Y_PASILLO + P.Y_BAJA) / 2;
  // Arriba, el camino del aire va a la derecha del centro: el rótulo del local
  // ocupa la esquina izquierda.
  const ejeDe = (r: RecintoPlanta) => (r.arriba && !r.humedo ? r.x + r.w * 0.62 : r.x + r.w / 2);
  for (const r of recintos) {
    if (!r.localId) continue;
    const cx = ejeDe(r);
    // Puerta al pasillo.
    puertas.push({ x: cx, y: r.arriba ? P.Y_PASILLO : P.Y_BAJA });
    if (!r.humedo) {
      admisiones.push({ x: cx, y: r.arriba ? P.Y_TOP : P.Y_FONDO, elementoId: r.elementoId! });
      flechas.push(
        r.arriba
          ? { x1: cx, y1: P.Y_TOP + 12, x2: cx, y2: P.Y_PASILLO - 8 }
          : { x1: cx, y1: P.Y_FONDO - 12, x2: cx, y2: P.Y_BAJA + 8 },
      );
    } else {
      extracciones.push({ x: r.x + r.w - 20, y: r.y + 6, elementoId: r.elementoId! });
      flechas.push(
        r.arriba
          ? { x1: cx, y1: yPasillo - 7, x2: cx, y2: P.Y_PASILLO - 14 }
          : { x1: cx, y1: yPasillo + 7, x2: cx, y2: P.Y_BAJA + 16 },
      );
    }
  }
  flechas.push({ x1: P.X0 + 50, y1: yPasillo, x2: P.X1 - 30, y2: yPasillo });

  const rCocina = recintos.find((r) => r.localId === "cocina");
  const campana =
    rCocina && j.elementos.some((e) => e.id === `${prefijo}campana`)
      ? { x: rCocina.x + rCocina.w / 2, y: P.Y_FONDO - 26, elementoId: `${prefijo}campana` }
      : null;

  // Barras: lo que entra (secos) y lo que sale (húmedos).
  const secos = t.locales.filter((l) => !l.humedo);
  const humedos = t.locales.filter((l) => l.humedo);
  const total = Math.max(t.equilibrado.equilibrado_l_s, 1e-9);
  const k = P.W_BARRAS / total;
  const segmentos = (ls: LocalHs3[], anadido: (l: LocalHs3) => number): SegmentoBarra[] => {
    const out: SegmentoBarra[] = [];
    let xs: number = P.X_BARRAS;
    for (const l of ls) {
      const extra = anadido(l);
      const base = l.adoptado_l_s - extra;
      out.push({ elementoId: elId(l), x: xs, w: base * k, texto: fmtQ(base), anadido: false });
      xs += base * k;
      if (extra > 0.05) {
        out.push({ elementoId: elId(l), x: xs, w: extra * k, texto: `+${fmtQ(extra)}`, anadido: true });
        xs += extra * k;
      }
    }
    return out;
  };
  const entra = segmentos(secos, (l) => l.adoptado_l_s - l.minimo_l_s);
  const sale = segmentos(humedos, (l) => l.adoptado_l_s - l.conTotal_l_s);

  // Etiquetas.
  const etiquetas: EtiquetaPlanta[] = [];
  for (const r of recintos) {
    if (!r.elementoId) continue;
    const cx = ejeDe(r);
    const y = r.arriba ? r.y + r.h * 0.5 + 8 : r.localId === "cocina" ? r.y + 80 : r.humedo ? r.y + r.h * 0.6 : r.y + r.h * 0.5;
    etiquetas.push({ key: `et-${r.elementoId}`, elementoId: r.elementoId, x: cx, y });
  }
  if (campana) etiquetas.push({ key: `et-${campana.elementoId}`, elementoId: campana.elementoId, x: campana.x, y: campana.y - 26 });
  if (j.elementos.some((e) => e.id === `${prefijo}paso`)) {
    etiquetas.push({ key: `et-${prefijo}paso`, elementoId: `${prefijo}paso`, x: P.X0 + 150, y: yPasillo });
  }
  // Los conductos, en el pasillo: es por donde suben a la cubierta.
  if (j.elementos.some((e) => e.id === `${prefijo}conductos`) && extracciones.length > 0) {
    etiquetas.push({ key: `et-${prefijo}conductos`, elementoId: `${prefijo}conductos`, x: P.X1 - 70, y: yPasillo });
  }
  etiquetas.push({ key: `et-${prefijo}equilibrio`, elementoId: `${prefijo}equilibrio`, x: P.X_BARRAS + P.W_BARRAS + 60, y: (P.Y_ENTRA + P.Y_SALE) / 2 + 8 });

  return {
    clase: "vivienda",
    ancho: P.W,
    alto: P.H,
    recintos,
    admisiones,
    extracciones,
    puertas,
    flechas,
    campana,
    entra,
    sale,
    etiquetas,
    admisionTexto,
  };
}

function fmtQ(v: number): string {
  return Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : v.toFixed(1).replace(".", ",");
}

// -----------------------------------------------------------------------------
// Garaje
// -----------------------------------------------------------------------------

function garajeDe(j: JustificacionHs3): PlantaGaraje {
  const P = PLANTA;
  const g = j.red.garajes[0] ?? null;
  const tr = j.red.trasteros[0] ?? null;
  const mecanica = j.red.decisiones.garaje === "mecanica";
  const etiquetas: EtiquetaPlanta[] = [];
  const xFin = tr ? 520 : P.X1;
  const recinto = g ? { x: P.X0, y: 40, w: xFin - P.X0, h: 360 } : null;

  const plazas: PlantaGaraje["plazas"] = [];
  let conducto: PlantaGaraje["conducto"] = null;
  const rejillas: PlantaGaraje["rejillas"] = [];
  const mixtas: PlantaGaraje["mixtas"] = [];
  const co: PlantaGaraje["co"] = [];
  let rampa: PlantaGaraje["rampa"] = null;
  if (g && recinto) {
    const porFila = Math.max(1, Math.ceil(g.plazas / 2));
    const w = (recinto.w - 32) / porFila;
    let n = 1;
    for (const fila of [0, 1]) {
      const enFila = fila === 0 ? porFila : g.plazas - porFila;
      for (let k = 0; k < enFila; k++) {
        plazas.push({ x: recinto.x + 16 + k * w, y: fila === 0 ? 52 : 288, w, h: 100, n: n++ });
      }
    }
    const yCalle = 220;
    if (mecanica) {
      const xMax = recinto.x + recinto.w - 20;
      conducto = { d: `M${recinto.x + 20} ${yCalle}H${xMax}V56`, elementoId: g.id };
      const ab = j.elementos.find((e) => e.id === `${g.id}-aberturas`);
      const pares = ab?.detalle.clase === "aberturas_garaje" ? ab.detalle.pares : 1;
      for (let k = 0; k < pares; k++) {
        rejillas.push({ x: recinto.x + 50 + ((recinto.w - 100) * (k + 0.5)) / pares, y: yCalle });
      }
    } else {
      mixtas.push({ x: recinto.x - 4, y: 160, w: 8, h: 120 }, { x: recinto.x + recinto.w - 4, y: 160, w: 8, h: 120 });
    }
    const coEl = j.elementos.find((e) => e.id === `${g.id}-co`);
    if (coEl?.detalle.clase === "co" && coEl.detalle.exigida) {
      co.push({ x: recinto.x + recinto.w * 0.3, y: yCalle + 40 }, { x: recinto.x + recinto.w * 0.75, y: yCalle + 40 });
    }
    rampa = { x: xFin, y0: 170, y1: 270 };
    etiquetas.push({ key: `et-${g.id}`, elementoId: g.id, x: recinto.x + recinto.w * 0.48, y: yCalle - 18 });
    etiquetas.push({
      key: `et-${g.id}-aberturas`,
      elementoId: `${g.id}-aberturas`,
      x: mecanica ? recinto.x + recinto.w * 0.48 : recinto.x + 60,
      y: mecanica ? yCalle + 18 : 150,
    });
    if (j.elementos.some((e) => e.id === `${g.id}-co`)) {
      etiquetas.push({ key: `et-${g.id}-co`, elementoId: `${g.id}-co`, x: recinto.x + recinto.w * 0.75, y: yCalle + 66 });
    }
  }
  const trasteros = tr
    ? {
        x: g ? 520 : 200,
        y: g ? 290 : 200,
        w: g ? 80 : 240,
        h: g ? 110 : 120,
        texto: `${Math.round(tr.superficie_m2)} m²`,
        elementoId: tr.id,
      }
    : null;
  if (trasteros) etiquetas.push({ key: `et-${tr!.id}`, elementoId: tr!.id, x: trasteros.x + trasteros.w / 2, y: trasteros.y + trasteros.h - 22 });

  const nivel = g?.nivel ?? tr?.nivel ?? -1;
  const rotulo = g
    ? `${etiquetaNivel(nivel)} · garaje de ${g.plazas} ${g.plazas === 1 ? "plaza" : "plazas"} · ventilación ${mecanica ? "mecánica con extracción a cubierta" : "natural por aberturas mixtas"}`
    : `${etiquetaNivel(nivel)} · trasteros`;
  return {
    clase: "garaje",
    ancho: P.W,
    alto: P.H,
    rotulo,
    recinto,
    plazas,
    mecanica,
    conducto,
    rejillas,
    mixtas,
    co,
    rampa,
    trasteros,
    etiquetas,
  };
}

// -----------------------------------------------------------------------------

/** El dibujo de una parte («a», «garaje»). */
export function calcularDibujoHs3(j: JustificacionHs3, parte: string): DibujoHs3 | null {
  if (parte === "garaje") return j.red.garajes.length > 0 || j.red.trasteros.length > 0 ? garajeDe(j) : null;
  const t = j.red.tipos.find((x) => {
    const el = j.elementos.find((e) => e.parte === parte);
    return el && "tipo" in el.detalle && (el.detalle as { tipo?: TipoVentilacion }).tipo === x;
  });
  if (!t) return null;
  const prefijo = j.red.unifamiliar ? "" : `${parte}-`;
  return viviendaDe(j, t, prefijo);
}

/** La parte a la que pertenece un elemento. */
export function parteDe(j: JustificacionHs3, elementoId: string): string | null {
  return j.elementos.find((e: ElementoHs3) => e.id === elementoId)?.parte ?? null;
}

/** Tamaño nativo del dibujo de HS3 (todas las partes miden lo mismo). Lo usa la ficha. */
export function tamanoDibujoHs3(): { nativeW: number; nativeH: number } {
  return { nativeW: PLANTA.W, nativeH: PLANTA.H };
}
