// =============================================================================
// DB-HR — Las soluciones del Catálogo de Elementos Constructivos del CTE (CEC,
// v6.3, marzo 2010, «versión preliminar, borrador») que el módulo ofrece en sus
// desplegables (feature-25). Cada una con su código y su página del CEC, y sus
// valores MÍNIMOS y, si los hay, MEDIOS (entre corchetes en el CEC).
//
// VERIFICACIÓN: research/verificacion-hr-cec.md, todo leído en la imagen del
// CEC. El CEC no es reglamentario; sus valores tienen garantía legal solo para
// las soluciones que se hacen en obra (las de fábrica, hormigón y mortero); los
// de productos industriales (placas de yeso, láminas, ventanas) son genéricos y
// orientativos (K-CEC.2).
//
// Criterios (no los fija ni el CEC ni el DB):
//   - K-CEC.1: el valor mínimo, salvo que el proyectista elija los medios;
//   - K-CEC.4: con una masa entre dos columnas, la columna inmediatamente
//     superior (el ΔRA baja al subir la masa: lado seguro);
//   - K-CEC.5: m y RA de una hoja de fachada = la hoja equivalente del 4.4.1.1
//     con revestimiento por una sola cara (− 15 kg/m², − 1 dBA);
//   - K-CEC.8: ventana y caja de persiana se suman con la G.1 del Anejo G,
//     con la caja de 0,20 m sobre una ventana de 1,30 m de alto.
// =============================================================================

import type { TipoTabiqueria } from "./tablas";

/** Un valor del CEC: el mínimo y, si lo da, el medio. */
export interface Par {
  min: number;
  medio?: number;
}

const v = (min: number, medio?: number): Par => (medio === undefined ? { min } : { min, medio });

export function valor(p: Par, medio: boolean): number {
  return medio && p.medio !== undefined ? p.medio : p.min;
}

interface Base {
  id: string;
  /** Lo que se lee en el desplegable. */
  nombre: string;
  /** Código del CEC (P1.1, TR1, F 3.1…). */
  codigo: string;
  pagina: number;
  /** Producto industrial: valor orientativo, confirmar con el fabricante (K-CEC.2). */
  industrial?: boolean;
}

export interface SolTabiqueria extends Base {
  categoria: "tabiqueria";
  material: "fabrica" | "entramado";
  m: Par;
  RA: Par;
}

/** Elemento base de una separación vertical (y hoja de medianería). */
export interface SolBase extends Base {
  categoria: "base";
  tipo: 1 | 2 | 3;
  hojas: 1 | 2;
  m: Par;
  RA: Par;
  /** Tipo 2: en qué hojas van las bandas, la masa de la hoja con bandas más pesada y el RA de la hoja apoyada. */
  bandas?: { en: "dos" | "una"; hojaM: number; apoyadaRA?: number };
  /** Tipo 3: montantes arriostrados (el RA menor del CEC, K-CEC.9). */
  arriostrados?: boolean;
}

export interface SolTrasdosado extends Base {
  categoria: "trasdosado";
  /** ΔRA por masa del elemento base: [masa de la columna, ΔRA], de menos a más masa. */
  dRA: readonly (readonly [number, number])[];
  /** Solo sobre un elemento base de masa no mayor (TR3). */
  baseMax?: number;
}

export interface SolForjado extends Base {
  categoria: "forjado";
  canto_mm: number;
  m: number;
  RA: number;
  RAtr: number;
  /** Piezas de entrevigado de EPS (tabla 3.3 nota 4). */
  eps?: boolean;
}

export interface SolSuelo extends Base {
  categoria: "suelo";
  dLw: number;
  /** ΔRA por masa MÁXIMA del forjado: [masa, ΔRA]; por encima de la última, 0. */
  dRA: readonly (readonly [number, number])[];
}

export interface SolTecho extends Base {
  categoria: "techo";
  /** ΔRA con forjados de hasta 350 kg/m², de 350 a 400 y de más de 400 (nota 5 del CEC). */
  dRA: readonly [number, number, number];
}

/**
 * Clase de fachada para las condiciones de flancos: una hoja (también con SATE),
 * ventilada sobre una hoja principal, dos hojas pesada no ventilada, ligera.
 */
export type ClaseFachada = "una_hoja" | "ventilada" | "dos_hojas" | "ligera";

export interface SolFachada extends Base {
  categoria: "fachada";
  clase: ClaseFachada;
  /** La hoja interior, en dos hojas (en una hoja o ventilada sin trasdosado, la principal es de fábrica). */
  interior: "fabrica" | "entramado";
  /** Aislamiento por el exterior (SATE): tabla 3.2 nota (6). */
  aislExterior: boolean;
  RAtr: Par;
  /** La hoja principal (en una hoja, el muro; en dos hojas, la exterior): K-CEC.5. */
  principal: { m: number; RA: number };
  /** La hoja interior de entramado: sin valor por defecto (K-CEC.5). */
  hojaInterior?: { m: number; RA: number };
}

export interface SolCubierta extends Base {
  categoria: "cubierta";
  RAtr: number;
}

export interface SolVentana extends Base {
  categoria: "ventana";
  RAtr: number;
}

export type Solucion = SolTabiqueria | SolBase | SolTrasdosado | SolForjado | SolSuelo | SolTecho | SolFachada | SolCubierta | SolVentana;

export type Categoria = Solucion["categoria"];

const TR_AUTOPORTANTE = [[70, 17], [100, 16], [140, 15], [160, 14], [180, 13], [200, 12], [250, 10], [300, 9], [350, 8], [400, 7]] as const;
const TR_DIRECTO = [[70, 10], [100, 9], [140, 8], [160, 7], [180, 6], [200, 5], [250, 3], [300, 2], [350, 1], [400, 0]] as const;
const SF_LANA = [[175, 13], [200, 12], [225, 11], [250, 10], [300, 9], [350, 8], [400, 6], [450, 6], [500, 5]] as const;
const SF_POLIETILENO = [[175, 7], [200, 6], [225, 6], [250, 5], [300, 5], [350, 4], [400, 4], [450, 3], [500, 3]] as const;
const SF_EEPS = [[250, 15], [300, 8], [350, 7], [400, 6], [450, 5], [500, 5]] as const;

export const CATALOGO: readonly Solucion[] = [
  // ── Tabiquería (4.4.1.1 y 4.4.3) ──────────────────────────────────────────
  { categoria: "tabiqueria", id: "tab-lhd70-yeso", codigo: "P1.1", pagina: 101, material: "fabrica", nombre: "LHD 7 cm + yeso por ambas caras", m: v(89, 97), RA: v(36, 37) },
  { categoria: "tabiqueria", id: "tab-lhgf70-yeso", codigo: "P1.2", pagina: 101, material: "fabrica", nombre: "Ladrillo de gran formato 7 cm + yeso por ambas caras", m: v(70, 80), RA: v(33, 34) },
  { categoria: "tabiqueria", id: "tab-pyl-15-48-15-lm", codigo: "P4.1", pagina: 111, material: "entramado", industrial: true, nombre: "PYL 15 + 48 con lana mineral + PYL 15", m: v(26), RA: v(43) },
  { categoria: "tabiqueria", id: "tab-pyl-2x125-48-2x125-lm", codigo: "P4.2", pagina: 111, material: "entramado", industrial: true, nombre: "2×PYL 12,5 + 48 con lana mineral + 2×PYL 12,5", m: v(44), RA: v(52) },

  // ── Elemento base de las separaciones verticales (4.4.1, 4.4.2, 4.4.3) ────
  { categoria: "base", id: "sv-lp115-yeso", codigo: "P1.4", pagina: 101, tipo: 1, hojas: 1, nombre: "LP ½ pie + yeso por ambas caras", m: v(150, 161), RA: v(42, 44) },
  { categoria: "base", id: "sv-lp240-yeso", codigo: "P1.5", pagina: 102, tipo: 1, hojas: 1, nombre: "LP 1 pie + yeso por ambas caras", m: v(284, 313), RA: v(49, 50) },
  { categoria: "base", id: "sv-bhad190-enl", codigo: "P1.14", pagina: 103, tipo: 1, hojas: 1, nombre: "Bloque de hormigón denso 19 cm enlucido", m: v(239), RA: v(48) },
  { categoria: "base", id: "sv-ha160", codigo: "P1.24", pagina: 105, tipo: 1, hojas: 1, nombre: "Muro de hormigón armado 16 cm", m: v(400), RA: v(57) },
  { categoria: "base", id: "sv-ha200", codigo: "P1.25", pagina: 105, tipo: 1, hojas: 1, nombre: "Muro de hormigón armado 20 cm", m: v(500), RA: v(60) },
  { categoria: "base", id: "sv-lhd-lm-lhd", codigo: "P2.1", pagina: 106, tipo: 1, hojas: 2, nombre: "LHD 7 + lana mineral + LHD 7", m: v(130, 170), RA: v(44, 45) },
  {
    categoria: "base", id: "sv2-lhd-lhd-bandas", codigo: "P3.1", pagina: 109, tipo: 2, hojas: 2,
    nombre: "LHD 7 + lana mineral + LHD 7, bandas en las dos hojas", m: v(148, 170), RA: v(53, 55), bandas: { en: "dos", hojaM: 89 },
  },
  {
    categoria: "base", id: "sv2-lp115-lh-bandas", codigo: "P3.2", pagina: 109, tipo: 2, hojas: 2,
    nombre: "LP ½ pie + lana mineral + LH 5 con bandas", m: v(184, 241), RA: v(58, 61), bandas: { en: "una", hojaM: 89, apoyadaRA: 42 },
  },
  { categoria: "base", id: "sv3-pyl-2x125-48-cm-48-2x125", codigo: "P4.4", pagina: 111, tipo: 3, hojas: 2, industrial: true, nombre: "2×PYL 12,5 + 48 + chapa + 48 + 2×PYL 12,5", m: v(50), RA: v(58) },
  { categoria: "base", id: "sv3-pyl-2x125-48-48-2x125", codigo: "P4.6", pagina: 111, tipo: 3, hojas: 2, industrial: true, arriostrados: true, nombre: "2×PYL 12,5 + 48 + 48 + 2×PYL 12,5, arriostrados", m: v(45), RA: v(55) },
  { categoria: "base", id: "sv3-pyl-2x15-70-70-2x15", codigo: "P4.8", pagina: 112, tipo: 3, hojas: 2, industrial: true, nombre: "2×PYL 15 + 70 + 70 + 2×PYL 15, sin arriostrar", m: v(54), RA: v(67) },

  // ── Trasdosados (4.4.1.3) ─────────────────────────────────────────────────
  { categoria: "trasdosado", id: "tr-autoportante-pyl-lm", codigo: "TR1", pagina: 108, industrial: true, nombre: "Autoportante de PYL con lana mineral", dRA: TR_AUTOPORTANTE },
  { categoria: "trasdosado", id: "tr-directo-pyl-lm", codigo: "TR2", pagina: 108, industrial: true, nombre: "Directo: lana mineral 30 mm + PYL 15", dRA: TR_DIRECTO },
  { categoria: "trasdosado", id: "tr-ceramico-lh50-lm", codigo: "TR3", pagina: 108, nombre: "Cerámico: lana mineral + LH 5 con bandas", dRA: [[200, 16]], baseMax: 200 },

  // ── Forjados (3.18) ───────────────────────────────────────────────────────
  { categoria: "forjado", id: "fu-bovhorm-250", codigo: "3.18.1", pagina: 29, canto_mm: 250, nombre: "Unidireccional, bovedilla de hormigón, 25 cm", m: 332, RA: 53, RAtr: 48 },
  { categoria: "forjado", id: "fu-bovhorm-300", codigo: "3.18.1", pagina: 29, canto_mm: 300, nombre: "Unidireccional, bovedilla de hormigón, 30 cm", m: 372, RA: 55, RAtr: 50 },
  { categoria: "forjado", id: "fu-bovcer-300", codigo: "3.18.1", pagina: 29, canto_mm: 300, nombre: "Unidireccional, bovedilla cerámica, 30 cm", m: 333, RA: 53, RAtr: 48 },
  { categoria: "forjado", id: "fu-boveps-300", codigo: "3.18.1", pagina: 29, canto_mm: 300, eps: true, nombre: "Unidireccional, bovedilla de EPS, 30 cm", m: 225, RA: 47, RAtr: 45 },
  { categoria: "forjado", id: "fr-casetonhorm-300", codigo: "3.18.2", pagina: 30, canto_mm: 300, nombre: "Reticular, casetón de hormigón, 30 cm", m: 385, RA: 56, RAtr: 51 },
  { categoria: "forjado", id: "alv-capa-250", codigo: "3.18.3", pagina: 31, canto_mm: 250, nombre: "Losa alveolar 25 cm con capa de compresión", m: 395, RA: 56, RAtr: 51 },
  { categoria: "forjado", id: "losa-ha-200", codigo: "3.18.4", pagina: 31, canto_mm: 200, nombre: "Losa maciza de hormigón armado 20 cm", m: 500, RA: 60, RAtr: 55 },
  { categoria: "forjado", id: "losa-ha-250", codigo: "3.18.4", pagina: 31, canto_mm: 250, nombre: "Losa maciza de hormigón armado 25 cm", m: 625, RA: 64, RAtr: 59 },

  // ── Suelos flotantes (4.5.1, S01: mortero de 50 mm) ───────────────────────
  { categoria: "suelo", id: "sf-mortero-lm20", codigo: "S01", pagina: 115, industrial: true, nombre: "Mortero 5 cm sobre lana mineral 20 mm", dLw: 30, dRA: SF_LANA },
  { categoria: "suelo", id: "sf-mortero-lm30", codigo: "S01", pagina: 115, industrial: true, nombre: "Mortero 5 cm sobre lana mineral 30 mm", dLw: 33, dRA: SF_LANA },
  { categoria: "suelo", id: "sf-mortero-per5", codigo: "S01", pagina: 115, industrial: true, nombre: "Mortero 5 cm sobre polietileno reticulado 5 mm", dLw: 19, dRA: SF_POLIETILENO },
  { categoria: "suelo", id: "sf-mortero-pee5", codigo: "S01", pagina: 115, industrial: true, nombre: "Mortero 5 cm sobre polietileno expandido 5 mm", dLw: 20, dRA: SF_POLIETILENO },
  { categoria: "suelo", id: "sf-mortero-eeps30", codigo: "S01", pagina: 116, industrial: true, nombre: "Mortero 5 cm sobre EPS elastificado 30 mm", dLw: 28, dRA: SF_EEPS },

  // ── Techos suspendidos (4.5.2.1, T01) ─────────────────────────────────────
  { categoria: "techo", id: "ts-pyl15-sin-lm", codigo: "T01", pagina: 118, industrial: true, nombre: "PYL 15 suspendida, sin lana", dRA: [5, 0, 0] },
  { categoria: "techo", id: "ts-pyl15-lm50-c100", codigo: "T01", pagina: 118, industrial: true, nombre: "PYL 15 suspendida con lana mineral", dRA: [13, 7, 0] },
  { categoria: "techo", id: "ts-2pyl125-lm50-c100", codigo: "T01", pagina: 118, industrial: true, nombre: "2×PYL 12,5 suspendida con lana mineral", dRA: [14, 7, 0] },

  // ── Fachadas (4.2) ────────────────────────────────────────────────────────
  {
    categoria: "fachada", id: "fa-enf-lp115-at-lhd70", codigo: "F 3.1", pagina: 59, clase: "dos_hojas", interior: "fabrica", aislExterior: false,
    nombre: "Enfoscado + LP ½ pie + aislante + LHD 7 + enlucido", RAtr: v(45, 46), principal: { m: 135, RA: 41 },
  },
  {
    categoria: "fachada", id: "fa-cv-lp115-at-lhd70", codigo: "F 1.1", pagina: 54, clase: "dos_hojas", interior: "fabrica", aislExterior: false,
    nombre: "LP ½ pie cara vista + aislante + LHD 7 + enlucido", RAtr: v(47, 47), principal: { m: 135, RA: 41 },
  },
  {
    categoria: "fachada", id: "fa-enf-lp115-trasd-pyl", codigo: "F 3.4", pagina: 59, clase: "dos_hojas", interior: "entramado", aislExterior: false,
    nombre: "Enfoscado + LP ½ pie + trasdosado de PYL con lana", RAtr: v(54, 55), principal: { m: 135, RA: 41 },
  },
  {
    categoria: "fachada", id: "fa-sate-bh140", codigo: "F 4.3", pagina: 64, clase: "una_hoja", interior: "fabrica", aislExterior: true,
    nombre: "SATE sobre bloque de hormigón 14 cm", RAtr: v(41), principal: { m: 210, RA: 44 },
  },
  {
    categoria: "fachada", id: "fa-sate-lp115", codigo: "F 4.1", pagina: 64, clase: "una_hoja", interior: "fabrica", aislExterior: true,
    nombre: "SATE sobre LP ½ pie", RAtr: v(39, 40), principal: { m: 161, RA: 42 },
  },
  {
    categoria: "fachada", id: "fa-ventilada-lp115", codigo: "F 8.1", pagina: 76, clase: "ventilada", interior: "fabrica", aislExterior: true,
    nombre: "Aplacado ventilado + aislante sobre LP ½ pie", RAtr: v(39, 40), principal: { m: 156, RA: 42 },
  },

  // ── Cubiertas (4.1, sobre el forjado del 3.18) ────────────────────────────
  { categoria: "cubierta", id: "cu-plana-fu-bovhorm-300", codigo: "C 1.3", pagina: 37, nombre: "Plana transitable sobre forjado de 30 cm", RAtr: 52 },
  { categoria: "cubierta", id: "cu-incl-fu-bovhorm-250", codigo: "4.1.9", pagina: 45, nombre: "Inclinada sobre forjado de 25 cm", RAtr: 48 },

  // ── Ventanas (4.3.2) ──────────────────────────────────────────────────────
  { categoria: "ventana", id: "ve-4-c-6-batiente", codigo: "4.3.2", pagina: 97, industrial: true, nombre: "Batiente, vidrio 4-cámara-6, clase 3", RAtr: 30 },
  { categoria: "ventana", id: "ve-4-c-6-corredera", codigo: "4.3.2", pagina: 97, industrial: true, nombre: "Corredera, vidrio 4-cámara-6, clase 2", RAtr: 27 },
  { categoria: "ventana", id: "ve-4-c-4-batiente", codigo: "4.3.2", pagina: 97, industrial: true, nombre: "Batiente, vidrio 4-cámara-4, clase 3", RAtr: 27 },
  { categoria: "ventana", id: "ve-6-c-66-batiente", codigo: "4.3.2", pagina: 97, industrial: true, nombre: "Batiente, vidrio 6-cámara-6+6 laminar", RAtr: 30 },
  { categoria: "ventana", id: "ve-6-c-1010-oscilo", codigo: "4.3.2", pagina: 97, industrial: true, nombre: "Oscilobatiente, vidrio 6-cámara-10+10, dos juntas", RAtr: 32 },
  { categoria: "ventana", id: "ve-doble-oscilo", codigo: "4.3.2", pagina: 98, industrial: true, nombre: "Doble ventana, interior oscilobatiente", RAtr: 44 },
];

/** Caja de persiana (4.3.3): ninguna o exterior, CP1 o CP2. */
export type Capialzado = "no" | "cp1" | "cp2";

export const CAPIALZADOS: Record<Exclude<Capialzado, "no">, { codigo: string; RAtr: number; nombre: string }> = {
  cp1: { codigo: "CP1", RAtr: 25, nombre: "Caja de PVC o madera de 10 mm" },
  cp2: { codigo: "CP2", RAtr: 30, nombre: "Caja con absorbente y junta en la tapa" },
};

/** Fracción del hueco que ocupa la caja de persiana (K-CEC.8: 0,20 m sobre 1,30 m). */
export const FRACCION_CAJA = 0.2 / 1.5;

export function solucion(id: string): Solucion | undefined {
  return CATALOGO.find((s) => s.id === id);
}

export function deCategoria<C extends Categoria>(categoria: C): Extract<Solucion, { categoria: C }>[] {
  return CATALOGO.filter((s): s is Extract<Solucion, { categoria: C }> => s.categoria === categoria);
}

/** La solución de una categoría, o la primera si el id no es de ella. */
export function solucionDe<C extends Categoria>(categoria: C, id: string): Extract<Solucion, { categoria: C }> {
  const s = solucion(id);
  return s && s.categoria === categoria ? (s as Extract<Solucion, { categoria: C }>) : deCategoria(categoria)[0];
}

/** ΔRA de un trasdosado sobre un elemento base de masa m (K-CEC.4: columna inmediatamente superior). */
export function dRATrasdosado(s: SolTrasdosado, mBase: number): number {
  if (s.baseMax !== undefined && mBase > s.baseMax) return 0;
  const col = s.dRA.find(([m]) => m >= mBase) ?? s.dRA[s.dRA.length - 1];
  return col[1];
}

/** ΔRA de un suelo flotante sobre un forjado de masa m: primera columna con masa máxima ≥ m; por encima, 0. */
export function dRASuelo(s: SolSuelo, mForjado: number): number {
  const col = s.dRA.find(([m]) => m >= mForjado);
  return col ? col[1] : 0;
}

/** ΔRA de un techo suspendido bajo un forjado de masa m (nota 5 del CEC). */
export function dRATecho(s: SolTecho, mForjado: number): number {
  return mForjado <= 350 ? s.dRA[0] : mForjado <= 400 ? s.dRA[1] : s.dRA[2];
}

/** El tipo de tabiquería de la tabla 3.1: el material y, si es de fábrica, cómo apoya. */
export function tipoTabiqueria(s: SolTabiqueria, apoyo: "directo" | "bandas"): TipoTabiqueria {
  return s.material === "entramado" ? "entramado" : apoyo === "bandas" ? "bandas" : "apoyo";
}
