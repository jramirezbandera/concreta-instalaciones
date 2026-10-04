// =============================================================================
// DB-HS5 — Red de aguas pluviales (ap. 4.2 y apéndice B). MOTOR (feature-14 §C).
//
// Función PURA y DETERMINISTA, como `calcHS5`. Las tablas 4.7, 4.8 y 4.9 dan
// superficies máximas en proyección horizontal para 100 mm/h: con otra
// intensidad la superficie servida se corrige con f = i / 100 y se compara con
// la tabla. Cubierta plana → sumideros (Tabla 4.6); inclinada → canalones
// (Tabla 4.7). Cada bajante sirve la misma parte de la cubierta; el colector de
// pluviales, hasta la arqueta, recoge la cubierta entera y no es menor que las
// bajantes que recibe.
//
// Sin redondeos: la presentación es cosa de la UI y de la ficha.
// =============================================================================

import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { TipoCubierta } from "../../lib/edificio/tipos";
import {
  BAJANTES_PLUVIALES_TABLA_4_8,
  CANALONES_TABLA_4_7,
  capacidadAPendiente,
  COLECTORES_PLUVIALES_TABLA_4_9,
  INTENSIDAD_TABLA_B_1,
  SUMIDEROS_TABLA_4_6,
  type FilaCanalon4_7,
  type Isoyeta,
  type ZonaPluviometrica,
} from "./tablas";

export interface PluvialesInputs {
  cubierta: { tipo: TipoCubierta; superficie_m2: number };
  /** Intensidad pluviométrica [mm/h] (Tabla B.1). */
  intensidad_mm_h: number;
  /** Número de bajantes de pluviales (≥ 1). */
  bajantes: number;
  /** Pendiente del colector de pluviales [%]. */
  pendienteColector_pct: number;
  /** Pendiente de los canalones [%] (cubierta inclinada). Por defecto 1 %. */
  pendienteCanalon_pct?: number;
}

/** Una pieza dimensionada por superficie: lo que sirve, el Ø y la tabla. */
export interface PiezaPluvial {
  /** Superficie que sirve, en proyección horizontal [m²]. */
  superficie_m2: number;
  /** Superficie equivalente a 100 mm/h (× f) [m²]. */
  corregida_m2: number;
  diametro_mm: number | null;
  /** Lo que admite el Ø elegido [m²]. */
  capacidad_m2: number | null;
  /** Ø inmediatamente menor y lo que admitiría. */
  alternativa: { diametro_mm: number; capacidad_m2: number | null } | null;
  cumple: boolean;
}

export interface ResultadoPluviales {
  intensidad_mm_h: number;
  /** f = i / 100. */
  f: number;
  superficie_m2: number;
  /** Cubierta plana: número de sumideros (Tabla 4.6). */
  sumideros: number | null;
  /** Cubierta inclinada: el canalón de cada bajante (Tabla 4.7). */
  canalon: (PiezaPluvial & { pendiente_pct: number }) | null;
  bajantes: number;
  /** Cada bajante (todas iguales). */
  bajante: PiezaPluvial;
  colector: PiezaPluvial & {
    pendiente_pct: number;
    /** Ø que da la tabla, antes de igualarlo a las bajantes. */
    diametroPorCapacidad_mm: number | null;
  };
  veredicto: Veredicto;
  warnings: string[];
}

/** Intensidad de la Tabla B.1 para una zona y una isoyeta. */
export function intensidadDe(zona: ZonaPluviometrica, isoyeta: Isoyeta): number {
  return INTENSIDAD_TABLA_B_1.datos.porZona[zona][isoyeta];
}

/** Número de sumideros de una cubierta plana (Tabla 4.6). */
export function sumiderosDe(superficie_m2: number): number {
  const t = SUMIDEROS_TABLA_4_6.datos;
  for (const tramo of t.tramos) if (superficie_m2 < tramo.hasta_m2) return tramo.sumideros;
  return Math.ceil(superficie_m2 / t.cadaM2PorEncima);
}

/**
 * Bajantes de pluviales que se proponen: en cubierta plana, una por cada dos
 * sumideros; en inclinada, una por faldón (dos). Criterio de proyecto, editable.
 */
export function bajantesPluvialesPropuestas(cubierta: PluvialesInputs["cubierta"]): number {
  if (cubierta.superficie_m2 <= 0) return 1;
  if (cubierta.tipo === "inclinada") return 2;
  return Math.max(1, Math.ceil(sumiderosDe(cubierta.superficie_m2) / 2));
}

/** Primer Ø de una lista (ascendente) cuya capacidad cubre `s`, con su anterior. */
function primeroQueAdmite(
  filas: readonly { diametro_mm: number; cap: number | null }[],
  s: number,
): Pick<PiezaPluvial, "diametro_mm" | "capacidad_m2" | "alternativa"> {
  for (let i = 0; i < filas.length; i++) {
    const f = filas[i];
    if (f.cap !== null && s <= f.cap) {
      const ant = i > 0 ? filas[i - 1] : null;
      return {
        diametro_mm: f.diametro_mm,
        capacidad_m2: f.cap,
        alternativa: ant ? { diametro_mm: ant.diametro_mm, capacidad_m2: ant.cap } : null,
      };
    }
  }
  return { diametro_mm: null, capacidad_m2: null, alternativa: null };
}

/** Capacidad de un canalón a una pendiente (0,5 / 1 / 2 / 4 %). */
function capacidadCanalon(f: FilaCanalon4_7, pendiente_pct: number): number {
  if (pendiente_pct >= 4) return f.p4;
  if (pendiente_pct >= 2) return f.p2;
  if (pendiente_pct >= 1) return f.p1;
  return f.p05;
}

export function calcPluviales(inp: PluvialesInputs): ResultadoPluviales {
  const warnings: string[] = [];
  const superficie_m2 = Number.isFinite(inp.cubierta.superficie_m2) ? Math.max(0, inp.cubierta.superficie_m2) : 0;
  const intensidad_mm_h =
    Number.isFinite(inp.intensidad_mm_h) && inp.intensidad_mm_h > 0
      ? inp.intensidad_mm_h
      : INTENSIDAD_TABLA_B_1.datos.referencia_mm_h;
  const f = intensidad_mm_h / INTENSIDAD_TABLA_B_1.datos.referencia_mm_h;
  const bajantes = Number.isFinite(inp.bajantes) ? Math.max(1, Math.trunc(inp.bajantes)) : 1;
  const porBajante_m2 = superficie_m2 / bajantes;
  const inclinada = inp.cubierta.tipo === "inclinada";

  // ── Sumideros (plana) o canalones (inclinada) ────────────────────────────
  const sumideros = inclinada ? null : sumiderosDe(superficie_m2);
  let canalon: ResultadoPluviales["canalon"] = null;
  if (inclinada) {
    const pendiente_pct = inp.pendienteCanalon_pct ?? 1;
    const corregida_m2 = porBajante_m2 * f;
    const sel = primeroQueAdmite(
      CANALONES_TABLA_4_7.datos.filas.map((x) => ({ diametro_mm: x.diametro_mm, cap: capacidadCanalon(x, pendiente_pct) })),
      corregida_m2,
    );
    if (sel.diametro_mm === null) {
      warnings.push(`El canalón de ${porBajante_m2} m² supera la Tabla 4.7: hacen falta más bajantes.`);
    }
    canalon = { superficie_m2: porBajante_m2, corregida_m2, ...sel, cumple: sel.diametro_mm !== null, pendiente_pct };
  }

  // ── Bajantes (Tabla 4.8) ──────────────────────────────────────────────────
  const corregidaBajante = porBajante_m2 * f;
  const selB = primeroQueAdmite(
    BAJANTES_PLUVIALES_TABLA_4_8.datos.filas.map((x) => ({ diametro_mm: x.diametro_mm, cap: x.superficie_m2 })),
    corregidaBajante,
  );
  if (selB.diametro_mm === null) {
    warnings.push(`Cada bajante de pluviales sirve ${porBajante_m2} m²: supera la Tabla 4.8.`);
  }
  const bajante: PiezaPluvial = {
    superficie_m2: porBajante_m2,
    corregida_m2: corregidaBajante,
    ...selB,
    cumple: selB.diametro_mm !== null,
  };

  // ── Colector (Tabla 4.9), no menor que las bajantes ───────────────────────
  const pendiente_pct = inp.pendienteColector_pct;
  const corregidaColector = superficie_m2 * f;
  const filas9 = COLECTORES_PLUVIALES_TABLA_4_9.datos.filas.map((x) => ({
    diametro_mm: x.diametro_mm,
    cap: capacidadAPendiente(x, pendiente_pct),
  }));
  const selC = primeroQueAdmite(filas9, corregidaColector);
  let colDiam = selC.diametro_mm;
  let colCap = selC.capacidad_m2;
  let colAlt = selC.alternativa;
  if (colDiam !== null && bajante.diametro_mm !== null && colDiam < bajante.diametro_mm) {
    const i = filas9.findIndex((x) => x.diametro_mm >= bajante.diametro_mm!);
    if (i >= 0) {
      colDiam = filas9[i].diametro_mm;
      colCap = filas9[i].cap;
      colAlt = i > 0 ? { diametro_mm: filas9[i - 1].diametro_mm, capacidad_m2: filas9[i - 1].cap } : null;
    }
  }
  if (colDiam === null) {
    warnings.push(`El colector de pluviales (${superficie_m2} m² al ${pendiente_pct} %) supera la Tabla 4.9.`);
  }
  const colector: ResultadoPluviales["colector"] = {
    superficie_m2,
    corregida_m2: corregidaColector,
    diametro_mm: colDiam,
    capacidad_m2: colCap,
    alternativa: colAlt,
    cumple: colDiam !== null,
    pendiente_pct,
    diametroPorCapacidad_mm: selC.diametro_mm,
  };

  const cumple = bajante.cumple && colector.cumple && (canalon?.cumple ?? true);
  return {
    intensidad_mm_h,
    f,
    superficie_m2,
    sumideros,
    canalon,
    bajantes,
    bajante,
    colector,
    veredicto: superficie_m2 === 0 ? "neutral" : cumple ? "ok" : "fail",
    warnings,
  };
}
