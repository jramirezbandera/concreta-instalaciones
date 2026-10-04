// =============================================================================
// DB-HE1 — Geometría del dibujo (feature-15, HE1): la sección del cerramiento
// seleccionado. Sin JSX; PURA y determinista. La comparten el render, la ficha
// (tamaño nativo) y las etiquetas HTML (anclas).
//
//   - FACHADA: sección a escala, de dentro afuera, con las capas numeradas, sus
//     espesores, la cota total y la curva de temperaturas de enero (la del motor,
//     interfaz a interfaz); las condensaciones de Glaser, si las hay, marcadas;
//   - CUBIERTA y SUELO: sección horizontal por capas con su rótulo al lado (los
//     espesores, en proporción; las capas muy finas, con un mínimo visible);
//   - VENTANAS: alzado de la ventana tipo con el vidrio y el marco.
// =============================================================================

import { fmt } from "../../lib/units/format";
import type { ResultadoCapaHE1 } from "./calc";
import { nombresProtegidos, VENTANA_TIPO, VIDRIOS, type RolCerramiento } from "./envolvente";
import { cerramientoDe, type JustificacionHe1 } from "./justificacion";
import { etiquetaNivel } from "../../lib/edificio/derivar";

export const DIBUJO_HE1 = { W: 640, H: 400 } as const;

export type PatronCapa = "yeso" | "ladrillo" | "camara" | "aislante" | "mortero" | "hormigon" | "lamina" | "pavimento" | "grava" | "teja";

export interface EtiquetaHe1 {
  key: string;
  elementoId: string;
  x: number;
  y: number;
}

export interface CapaMuro {
  id: string;
  nombre: string;
  numero: number;
  x0: number;
  x1: number;
  espesor_mm: number;
  patron: PatronCapa;
}

export interface DibujoMuro {
  tipo: "muro";
  ancho: number;
  alto: number;
  rol: RolCerramiento;
  capas: CapaMuro[];
  x0: number;
  xe: number;
  yTop: number;
  yBot: number;
  /** La curva de temperaturas: puntos «x,y» y unas pocas cifras. */
  curva: string;
  temperaturas: { x: number; y: number; texto: string; ancla: "start" | "end" }[];
  interior: { texto: string; sub: string };
  exterior: { texto: string; sub: string; x: number };
  cota: { x0: number; x1: number; y: number; texto: string };
  condensa: { x: number; y: number }[];
  etiquetas: EtiquetaHe1[];
}

export interface CapaHorizontal {
  id: string;
  nombre: string;
  y0: number;
  y1: number;
  espesor_mm: number;
  patron: PatronCapa;
  computa: boolean;
}

export interface DibujoHorizontal {
  tipo: "horizontal";
  ancho: number;
  alto: number;
  rol: RolCerramiento;
  capas: CapaHorizontal[];
  x0: number;
  x1: number;
  arriba: string;
  abajo: string;
  rotulos: { yCapa: number; y: number; texto: string; aislante: boolean }[];
  etiquetas: EtiquetaHe1[];
}

export interface DibujoVentana {
  tipo: "ventana";
  ancho: number;
  alto: number;
  rol: "ventanas";
  marco: { x: number; y: number; w: number; h: number };
  vidrios: { x: number; y: number; w: number; h: number }[];
  montante: { x: number; y0: number; y1: number; w: number };
  textos: { x: number; y: number; texto: string; fuerte?: boolean }[];
  guias: { x1: number; y1: number; x2: number; y2: number }[];
  cotas: { x: number; y: number; texto: string; ancla: "middle" | "start" }[];
  etiquetas: EtiquetaHe1[];
}

export type DibujoHe1Geo = DibujoMuro | DibujoHorizontal | DibujoVentana;

function n0(v: number): string {
  return fmt(v, undefined, 0);
}
function n1(v: number): string {
  return Number.isFinite(v) ? v.toLocaleString("es-ES", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—";
}
function n2(v: number): string {
  return Number.isFinite(v) ? v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
}

function patronDe(c: ResultadoCapaHE1): PatronCapa {
  if (c.id.endsWith("-aislante")) return "aislante";
  if (c.id.endsWith("-camara")) return "camara";
  switch (c.material) {
    case "ladrillo_ceramico_hueco":
    case "ladrillo_ceramico_perforado":
    case "ladrillo_ceramico_macizo":
      return "ladrillo";
    case "hormigon_armado":
    case "hormigon_masa_aridos_densos":
      return "hormigon";
    case "betun_lamina_asfaltica":
      return "lamina";
    case "baldosa_ceramica_gres":
      return "pavimento";
    case "enlucido_yeso":
    case "placa_yeso_laminado":
      return "yeso";
    default:
      return "mortero";
  }
}

/** Qué se dibuja según lo seleccionado: la condensación y lo de fuera, en la fachada. */
export function vistaDe(seleccion: string | null): RolCerramiento {
  return seleccion === "cubierta" || seleccion === "suelo" || seleccion === "ventanas" ? seleccion : "fachada";
}

// -----------------------------------------------------------------------------

function muro(j: JustificacionHe1): DibujoMuro {
  const { W, H } = DIBUJO_HE1;
  const r = cerramientoDe(j, "fachada").detalle.r;
  const total_mm = r.capas.reduce((a, c) => a + c.espesor_m * 1000, 0);
  const s = Math.min(1.4, 380 / Math.max(1, total_mm));
  const x0 = 110;
  const yTop = 70;
  const yBot = 300;
  let x = x0;
  const capas: CapaMuro[] = r.capas.map((c, i) => {
    const e = c.espesor_m * 1000;
    const out = { id: c.id, nombre: c.nombre, numero: i + 1, x0: x, x1: x + e * s, espesor_mm: e, patron: patronDe(c) };
    x += e * s;
    return out;
  });
  const xe = x;
  const ti = j.resultado.tempInterior_C;
  const te = j.resultado.tempExteriorEnero_C;
  const Y = (t: number) => (ti === te ? 100 : 100 + (170 * (ti - t)) / (ti - te));
  const T = r.glaser.temperatura_C; // interfaz 0 = cara interior … n = cara exterior
  const xsInterfaz = [x0, ...capas.map((c) => c.x1)];
  const pts: [number, number][] = [[x0 - 50, Y(ti)], ...xsInterfaz.map((xi, k): [number, number] => [xi, Y(T[k] ?? ti)]), [xe + 40, Y(te)]];
  const ia = capas.findIndex((c) => c.patron === "aislante");
  const temperaturas: DibujoMuro["temperaturas"] = [{ x: x0 + 4, y: Y(T[0] ?? ti) - 7, texto: `${n1(T[0] ?? ti)} °C`, ancla: "start" }];
  if (ia >= 0) {
    temperaturas.push({ x: capas[ia].x0 - 4, y: Y(T[ia] ?? ti) + 16, texto: `${n1(T[ia] ?? ti)} °C`, ancla: "end" });
    temperaturas.push({ x: capas[ia].x1 + 4, y: Y(T[ia + 1] ?? te) - 8, texto: `${n1(T[ia + 1] ?? te)} °C`, ancla: "start" });
  }
  const n = capas.length;
  temperaturas.push({ x: xe + 6, y: Y(T[n] ?? te) - 10, texto: `${n1(T[n] ?? te)} °C`, ancla: "start" });

  const condensa = r.glaser.condensa.flatMap((c, k) => (c ? [{ x: xsInterfaz[k], y: Y(T[k] ?? te) }] : []));
  const etiquetas: EtiquetaHe1[] = [
    { key: "et-fachada", elementoId: "fachada", x: (x0 + xe) / 2, y: 376 },
    { key: "et-superficial", elementoId: "superficial", x: 58, y: 262 },
    { key: "et-intersticial", elementoId: "intersticial", x: (x0 + xe) / 2, y: 22 },
  ];
  return {
    tipo: "muro",
    ancho: W,
    alto: H,
    rol: "fachada",
    capas,
    x0,
    xe,
    yTop,
    yBot,
    curva: pts.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(" "),
    temperaturas,
    interior: { texto: "INTERIOR", sub: `${n0(ti)} °C · ${n0(j.resultado.hrInterior_pct)} %` },
    exterior: { texto: "EXTERIOR", sub: `${n1(te)} °C · ${n0(j.resultado.hrExterior_pct)} %`, x: Math.min(xe + 12, W - 96) },
    cota: { x0, x1: xe, y: 330, texto: `${n0(total_mm)} mm` },
    condensa,
    etiquetas,
  };
}

function horizontal(j: JustificacionHe1, rol: "cubierta" | "suelo"): DibujoHorizontal {
  const { W, H } = DIBUJO_HE1;
  const el = cerramientoDe(j, rol);
  const r = el.detalle.r;
  const env = j.propuesta.envolvente;
  const inclinada = env.cubierta === "inclinada";
  type C = { id: string; nombre: string; e: number; patron: PatronCapa; computa: boolean };
  const deCapas: C[] = r.capas.map((c) => ({ id: c.id, nombre: c.nombre, e: c.espesor_m * 1000, patron: patronDe(c), computa: true }));
  // De arriba abajo: la cubierta, de fuera adentro (más la protección, que no computa); el suelo, de dentro afuera.
  const orden: C[] =
    rol === "cubierta"
      ? [
          inclinada
            ? { id: "cubierta-teja", nombre: "Teja (ventilada, no computa)", e: 40, patron: "teja", computa: false }
            : { id: "cubierta-grava", nombre: "Grava (no computa)", e: 50, patron: "grava", computa: false },
          ...[...deCapas].reverse(),
        ]
      : deCapas;
  const total = orden.reduce((a, c) => a + c.e, 0);
  const sv = Math.min(0.9, 250 / Math.max(1, total));
  let y = 80;
  const capas: CapaHorizontal[] = orden.map((c) => {
    const h = Math.max(4, c.e * sv);
    const out = { id: c.id, nombre: c.nombre, y0: y, y1: y + h, espesor_mm: c.e, patron: c.patron, computa: c.computa };
    y += h;
    return out;
  });
  // Rótulos al lado, separados al menos 15 px.
  const rotulos: DibujoHorizontal["rotulos"] = [];
  let yMin = 0;
  for (const c of capas) {
    const yc = (c.y0 + c.y1) / 2;
    const yr = Math.max(yc + 4, yMin);
    yMin = yr + 15;
    const texto = c.patron === "lamina" ? c.nombre : c.computa ? `${c.nombre} · ${n0(c.espesor_mm)}` : c.nombre;
    rotulos.push({ yCapa: yc, y: yr, texto, aislante: c.patron === "aislante" });
  }
  const prot = nombresProtegidos(env.usos).toUpperCase();
  const top = Math.max(...env.niveles);
  const bajo = env.niveles[0] ?? 0;
  const s = el.detalle.suelo;
  const debajo =
    s?.tipo === "local"
      ? `LOCAL SIN USO · ${etiquetaNivel(bajo - 1)} · ${s.particion ? "OTRA UNIDAD DE USO" : "NO HABITABLE"}`
      : s?.tipo === "garaje"
        ? `GARAJE · ${etiquetaNivel(bajo - 1)} · NO HABITABLE`
        : s?.tipo === "no_habitable"
          ? `SÓTANO · ${etiquetaNivel(bajo - 1)} · NO HABITABLE`
          : s?.tipo === "zona_comun"
            ? `PORTAL · ${etiquetaNivel(bajo - 1)}`
            : "CÁMARA SANITARIA · VENTILADA";
  return {
    tipo: "horizontal",
    ancho: W,
    alto: H,
    rol,
    capas,
    x0: 80,
    x1: 420,
    arriba: rol === "cubierta" ? "EXTERIOR" : `${prot} · ${etiquetaNivel(bajo)} · ${n0(j.resultado.tempInterior_C)} °C`,
    abajo: rol === "cubierta" ? `INTERIOR · ${prot} DE ${etiquetaNivel(top)}` : debajo,
    rotulos,
    etiquetas: [{ key: `et-${rol}`, elementoId: rol, x: 250, y: 36 }],
  };
}

function ventana(j: JustificacionHe1): DibujoVentana {
  const { W, H } = DIBUJO_HE1;
  const r = cerramientoDe(j, "ventanas").detalle.r;
  const h = r.hueco!;
  const k = 200; // px por metro
  const x = 120;
  const y = 50;
  const w = VENTANA_TIPO.ancho_m * k;
  const hh = VENTANA_TIPO.alto_m * k;
  const b = h.anchoMarco_m * k;
  const vw = (w - 4 * b) / 2;
  const vh = hh - 2 * b;
  const v = VIDRIOS[j.propuesta.decisiones.vidrio];
  return {
    tipo: "ventana",
    ancho: W,
    alto: H,
    rol: "ventanas",
    marco: { x, y, w, h: hh },
    vidrios: [
      { x: x + b, y: y + b, w: vw, h: vh },
      { x: x + 3 * b + vw, y: y + b, w: vw, h: vh },
    ],
    montante: { x: x + b + vw, y0: y, y1: y + hh, w: 2 * b },
    textos: [
      { x: 406, y: 116, texto: `${v.corto} · Ug ${n1(h.ug_W_m2K)}`, fuerte: true },
      { x: 406, y: 132, texto: `vidrio · ${n0((1 - h.fraccionMarco) * 100)} % del hueco` },
      { x: 406, y: 258, texto: `Marco PVC · Uf ${n1(h.uf_W_m2K)}`, fuerte: true },
      { x: 406, y: 274, texto: `${n0(h.fraccionMarco * 100)} % del hueco` },
      { x: 406, y: 318, texto: `Junta Ψ ${n2(h.psi_W_mK)} · ${n1(h.lg_m)} m` },
    ],
    guias: [
      { x1: x + 3 * b + vw + vw * 0.6, y1: 140, x2: 400, y2: 120 },
      { x1: x + w - b / 2, y1: 250, x2: 400, y2: 262 },
    ],
    cotas: [
      { x: x + w / 2, y: y + hh + 22, texto: `${n2(VENTANA_TIPO.ancho_m)} m`, ancla: "middle" },
      { x: x + w + 10, y: y + hh / 2 + 4, texto: `${n2(VENTANA_TIPO.alto_m)} m`, ancla: "start" },
    ],
    etiquetas: [{ key: "et-ventanas", elementoId: "ventanas", x: x + w / 2, y: 24 }],
  };
}

export function calcularDibujoHe1(j: JustificacionHe1, rol: RolCerramiento): DibujoHe1Geo {
  if (rol === "cubierta" || rol === "suelo") return horizontal(j, rol);
  if (rol === "ventanas") return ventana(j);
  return muro(j);
}

/** Tamaño nativo del dibujo de HE1. Lo usa la ficha. */
export function tamanoDibujoHe1(): { nativeW: number; nativeH: number } {
  return { nativeW: DIBUJO_HE1.W, nativeH: DIBUJO_HE1.H };
}
