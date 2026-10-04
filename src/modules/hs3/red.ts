// =============================================================================
// DB-HS3 — La ventilación deducida de El edificio (feature-15, HS3).
//
// Función PURA y DETERMINISTA. Del edificio y de las decisiones sale:
//   - por VIVIENDA TIPO, sus locales con el caudal mínimo de la Tabla 2.1 y el
//     que se adopta tras cubrir el mínimo total de los húmedos y EQUILIBRAR lo
//     que entra con lo que sale (`equilibrar`), listos para `calcHS3`;
//   - las VERTICALES de cada tipo (cuántas plantas apila), para los conductos;
//   - los GARAJES y los TRASTEROS (Tabla 2.2), y lo que va por el RITE.
//
// Criterios de proyecto (no normativos, declarados en la memoria):
//   - el programa de cada tipo sale de El edificio: dormitorio principal, resto
//     de dormitorios, salón-comedor, cocina, baños y aseos;
//   - el mínimo total de los húmedos se reparte a partes iguales (todos tienen
//     el mismo mínimo por local en la Tabla 2.1);
//   - lo que falta para equilibrar se reparte en proporción a la Tabla 2.1 (el
//     comentario del Ministerio) o se suma al salón (a la cocina si sobra
//     admisión): decisión 3;
//   - los trasteros ventilan con el garaje si este es mecánico y están en su
//     misma planta (su recinto).
// =============================================================================

import { plantasDe, resumenEdificio } from "../../lib/edificio/derivar";
import type { Edificio, ViviendaTipo } from "../../lib/edificio/tipos";
import { categoriaDeDormitorios, type Estancia, type SistemaVentilacion, type TipoEstancia } from "./calc";
import {
  CAUDALES_LOCALES_HABITABLES,
  CAUDALES_NO_HABITABLES,
  COCCION_MIN,
  GARAJE_HS3,
  type CategoriaDormitorios,
} from "./tablas";

// -----------------------------------------------------------------------------
// Decisiones
// -----------------------------------------------------------------------------

export type Admision = "aireadores" | "fachada";
export type Equilibrado = "proporcional" | "salon";
export type SistemaGaraje = "mecanica" | "natural";
export type Opcion<T> = T | "habitual";

export interface DecisionesHs3 {
  sistema: Opcion<SistemaVentilacion>;
  admision: Opcion<Admision>;
  equilibrado: Opcion<Equilibrado>;
  garaje: Opcion<SistemaGaraje>;
}

export interface DecisionesEfectivasHs3 {
  sistema: SistemaVentilacion;
  admision: Admision;
  equilibrado: Equilibrado;
  garaje: SistemaGaraje;
}

export const DECISIONES_HS3_POR_DEFECTO: DecisionesHs3 = {
  sistema: "habitual",
  admision: "habitual",
  equilibrado: "habitual",
  garaje: "habitual",
};

/**
 * Lo habitual: ventilación mecánica con aireadores, el equilibrado repartido en
 * proporción (lo propone el comentario del Ministerio al ap. 3.1.1) y el garaje
 * mecánico (un sótano rara vez tiene fachadas para la natural), salvo que todos
 * sean pequeños (≤ 5 plazas y ≤ 100 m²) y sobre rasante: natural.
 */
export function decisionesHabitualesHs3(e?: Edificio): DecisionesEfectivasHs3 {
  let garaje: SistemaGaraje = "mecanica";
  if (e) {
    const g = GARAJE_HS3.datos;
    const zonas = plantasDe(e).flatMap((p) =>
      p.zonas.filter((z) => z.uso === "garaje" || z.uso === "garaje_privado").map((z) => ({ z, nivel: p.nivel })),
    );
    const pequenos =
      zonas.length > 0 &&
      zonas.every(
        ({ z, nivel }) =>
          nivel >= 0 &&
          sanea(z.plazas ?? (z.uso === "garaje_privado" ? 1 : 0)) <= g.coUmbralPlazas &&
          (Number.isFinite(z.superficieUtil_m2) ? z.superficieUtil_m2 : 0) <= g.coUmbralSuperficie_m2,
      );
    if (pequenos) garaje = "natural";
  }
  return { sistema: "mecanica", admision: "aireadores", equilibrado: "proporcional", garaje };
}

export function resolverDecisionesHs3(d: DecisionesHs3, e?: Edificio): DecisionesEfectivasHs3 {
  const h = decisionesHabitualesHs3(e);
  return {
    sistema: d.sistema === "habitual" ? h.sistema : d.sistema,
    admision: d.admision === "habitual" ? h.admision : d.admision,
    equilibrado: d.equilibrado === "habitual" ? h.equilibrado : d.equilibrado,
    garaje: d.garaje === "habitual" ? h.garaje : d.garaje,
  };
}

// -----------------------------------------------------------------------------
// Forma
// -----------------------------------------------------------------------------

/** Un local de la vivienda tipo con su caudal. */
export interface LocalHs3 {
  /** Estable dentro del tipo: «dorm-pral», «dorm-2», «salon», «cocina», «bano-1»… */
  id: string;
  tipo: TipoEstancia;
  /** «Dormitorio principal», «Baño 2»… */
  nombre: string;
  humedo: boolean;
  /** Mínimo de la Tabla 2.1 (por local) [l/s]. */
  minimo_l_s: number;
  /** Lo que exige el mínimo total de los húmedos, ya repartido [l/s]. */
  conTotal_l_s: number;
  /** El que se adopta, ya equilibrado [l/s]. */
  adoptado_l_s: number;
}

/** El equilibrado de una vivienda tipo. */
export interface EquilibradoHs3 {
  /** Lo que piden los secos por la Tabla 2.1 [l/s]. */
  entraTabla_l_s: number;
  /** Lo que piden los húmedos: el mayor de la suma por local y el mínimo total [l/s]. */
  saleTabla_l_s: number;
  /** El caudal equilibrado: entra = sale [l/s]. */
  equilibrado_l_s: number;
  /** Qué se aumenta para igualar: la admisión (los secos) o la extracción. */
  aumenta: "admision" | "extraccion" | "nada";
  /** Cuánto [l/s]. */
  diferencia_l_s: number;
}

export interface TipoVentilacion {
  tipoId: string;
  /** «A». */
  nombre: string;
  dormitorios: number;
  categoria: CategoriaDormitorios;
  locales: LocalHs3[];
  equilibrado: EquilibradoHs3;
  /** Las estancias para `calcHS3`, con el caudal adoptado y la cocción. */
  estancias: Estancia[];
  /** Cuántas viviendas de este tipo hay en el edificio. */
  viviendas: number;
  /** Verticales: plantas que apila cada una (de una posición del tipo). */
  verticales: { plantas: number; instancias: number }[];
}

export interface GarajeVentilacion {
  id: string;
  nivel: number;
  plazas: number;
  superficie_m2: number;
  /** Tabla 2.2: 120 l/s por plaza. */
  caudal_l_s: number;
  /** Está bajo rasante. */
  bajoRasante: boolean;
}

export interface TrasterosVentilacion {
  id: string;
  nivel: number;
  numero: number;
  superficie_m2: number;
  /** Tabla 2.2: 0,7 l/s·m². */
  caudal_l_s: number;
  /** Ventilan con el garaje (mecánico y en su planta). */
  conGarajeId: string | null;
}

export interface RedHs3 {
  decisiones: DecisionesEfectivasHs3;
  tipos: TipoVentilacion[];
  garajes: GarajeVentilacion[];
  trasteros: TrasterosVentilacion[];
  /** Locales sin uso y oficinas: van por el RITE (fuera del HS 3). */
  rite: { locales: number; oficinas: number };
  unifamiliar: boolean;
  /** El edificio tiene viviendas (sin ellas, los trasteros no entran en el HS 3). */
  conViviendas: boolean;
}

// -----------------------------------------------------------------------------
// Equilibrado de una vivienda tipo
// -----------------------------------------------------------------------------

function sanea(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

function slugDe(s: string): string {
  const limpio = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return limpio === "" ? "tipo" : limpio;
}

/** Los locales del programa, con su mínimo de la Tabla 2.1. */
function localesDe(vt: Pick<ViviendaTipo, "dormitorios" | "banos" | "aseos">): {
  categoria: CategoriaDormitorios;
  locales: Omit<LocalHs3, "conTotal_l_s" | "adoptado_l_s">[];
  totalHumedos_l_s: number;
} {
  const dorm = sanea(vt.dormitorios);
  const cat = categoriaDeDormitorios(dorm);
  const t = CAUDALES_LOCALES_HABITABLES.datos;
  const locales: Omit<LocalHs3, "conTotal_l_s" | "adoptado_l_s">[] = [];
  for (let i = 1; i <= dorm; i++) {
    const principal = i === 1;
    locales.push({
      id: principal ? "dorm-pral" : `dorm-${i}`,
      tipo: principal ? "dorm_principal" : "dormitorio",
      nombre: principal ? "Dormitorio principal" : `Dormitorio ${i}`,
      humedo: false,
      minimo_l_s: (principal ? t.dormitorioPrincipal[cat] : t.restoDormitorios[cat]) ?? 0,
    });
  }
  locales.push({
    id: "salon",
    tipo: "salon_comedor",
    nombre: "Salón-comedor",
    humedo: false,
    minimo_l_s: t.salasEstarComedores[cat] ?? 0,
  });
  const porLocal = t.humedosPorLocal[cat] ?? 0;
  locales.push({ id: "cocina", tipo: "cocina", nombre: "Cocina", humedo: true, minimo_l_s: porLocal });
  const banos = sanea(vt.banos);
  for (let i = 1; i <= banos; i++) {
    locales.push({
      id: banos > 1 ? `bano-${i}` : "bano",
      tipo: "bano",
      nombre: banos > 1 ? `Baño ${i}` : "Baño",
      humedo: true,
      minimo_l_s: porLocal,
    });
  }
  const aseos = sanea(vt.aseos);
  for (let i = 1; i <= aseos; i++) {
    locales.push({
      id: aseos > 1 ? `aseo-${i}` : "aseo",
      tipo: "aseo",
      nombre: aseos > 1 ? `Aseo ${i}` : "Aseo",
      humedo: true,
      minimo_l_s: porLocal,
    });
  }
  return { categoria: cat, locales, totalHumedos_l_s: t.humedosTotalVivienda[cat] ?? 0 };
}

/**
 * Los caudales de una vivienda tipo: cada local con su mínimo; los húmedos
 * suben a partes iguales hasta el mínimo total; y lo que entra se iguala con lo
 * que sale, en proporción a la Tabla 2.1 o sumándolo al salón (a la cocina si
 * sobra admisión). PURA.
 */
export function equilibrar(
  vt: Pick<ViviendaTipo, "dormitorios" | "banos" | "aseos">,
  modo: Equilibrado,
): { categoria: CategoriaDormitorios; locales: LocalHs3[]; equilibrado: EquilibradoHs3 } {
  const { categoria, locales, totalHumedos_l_s } = localesDe(vt);
  const humedos = locales.filter((l) => l.humedo);
  const sumaHumedos = humedos.reduce((s, l) => s + l.minimo_l_s, 0);
  const extraHumedo = humedos.length > 0 && sumaHumedos < totalHumedos_l_s ? (totalHumedos_l_s - sumaHumedos) / humedos.length : 0;
  const conTotal = locales.map((l) => ({ ...l, conTotal_l_s: l.minimo_l_s + (l.humedo ? extraHumedo : 0) }));
  const entra = conTotal.filter((l) => !l.humedo).reduce((s, l) => s + l.conTotal_l_s, 0);
  const sale = conTotal.filter((l) => l.humedo).reduce((s, l) => s + l.conTotal_l_s, 0);
  const equilibrado_l_s = Math.max(entra, sale);
  const aumenta: EquilibradoHs3["aumenta"] = sale > entra + 1e-9 ? "admision" : entra > sale + 1e-9 ? "extraccion" : "nada";
  const diferencia_l_s = Math.abs(sale - entra);

  const adoptados = conTotal.map((l) => {
    let q = l.conTotal_l_s;
    if (aumenta === "admision" && !l.humedo) {
      if (modo === "proporcional") q = entra > 0 ? l.conTotal_l_s * (sale / entra) : q;
      else if (l.id === "salon") q = l.conTotal_l_s + diferencia_l_s;
    }
    if (aumenta === "extraccion" && l.humedo) {
      if (modo === "proporcional") q = sale > 0 ? l.conTotal_l_s * (entra / sale) : q;
      else if (l.id === "cocina") q = l.conTotal_l_s + diferencia_l_s;
    }
    return { ...l, adoptado_l_s: q };
  });
  return {
    categoria,
    locales: adoptados,
    equilibrado: { entraTabla_l_s: entra, saleTabla_l_s: sale, equilibrado_l_s, aumenta, diferencia_l_s },
  };
}

/** Las estancias de `calcHS3` con el caudal adoptado; la cocina, con su cocción. */
export function estanciasDe(locales: LocalHs3[]): Estancia[] {
  return locales.map((l) => ({
    id: l.id,
    nombre: l.nombre,
    tipo: l.tipo,
    caudalPropuesto_l_s: l.adoptado_l_s,
    ...(l.tipo === "cocina" ? { esCoccion: true, caudalCoccion_l_s: COCCION_MIN.datos.caudalMin_l_s } : {}),
  }));
}

// -----------------------------------------------------------------------------
// Generador
// -----------------------------------------------------------------------------

export function generarRedHs3(e: Edificio, d: DecisionesHs3): RedHs3 {
  const decisiones = resolverDecisionesHs3(d, e);
  const resumen = resumenEdificio(e);
  const plantas = plantasDe(e); // de arriba abajo
  const tipos: TipoVentilacion[] = [];

  const vts = e.unidades.filter((u): u is ViviendaTipo => u.clase === "vivienda");
  if (resumen.esUnifamiliar) {
    const vt = vts[0];
    if (vt) {
      const { categoria, locales, equilibrado } = equilibrar(vt, decisiones.equilibrado);
      // Una sola vivienda: cada local húmedo, con su conducto individual.
      tipos.push({
        tipoId: vt.id,
        nombre: vt.nombre,
        dormitorios: sanea(vt.dormitorios),
        categoria,
        locales,
        equilibrado,
        estancias: estanciasDe(locales),
        viviendas: 1,
        verticales: [{ plantas: 1, instancias: 1 }],
      });
    }
  } else {
    for (const vt of vts) {
      // Viviendas de este tipo por planta (de abajo arriba).
      const porNivel = new Map<number, number>();
      for (const p of plantas) {
        const n = p.zonas
          .filter((z) => z.uso === "viviendas")
          .flatMap((z) => z.unidades ?? [])
          .filter((u) => u.tipoId === vt.id)
          .reduce((s, u) => s + sanea(u.cantidad), 0);
        if (n > 0) porNivel.set(p.nivel, n);
      }
      const total = [...porNivel.values()].reduce((s, n) => s + n, 0);
      if (total === 0) continue;
      // Instancia k: las plantas con al menos k viviendas de este tipo; las que
      // apilan el mismo número de plantas forman una vertical «× n».
      const max = Math.max(...porNivel.values());
      const porPlantas = new Map<number, number>();
      for (let k = 1; k <= max; k++) {
        const n = [...porNivel.values()].filter((c) => c >= k).length;
        porPlantas.set(n, (porPlantas.get(n) ?? 0) + 1);
      }
      const { categoria, locales, equilibrado } = equilibrar(vt, decisiones.equilibrado);
      tipos.push({
        tipoId: vt.id,
        nombre: vt.nombre,
        dormitorios: sanea(vt.dormitorios),
        categoria,
        locales,
        equilibrado,
        estancias: estanciasDe(locales),
        viviendas: total,
        verticales: [...porPlantas.entries()]
          .sort((a, b) => b[0] - a[0])
          .map(([plantasV, instancias]) => ({ plantas: plantasV, instancias })),
      });
    }
  }

  // ── Garajes y trasteros (Tabla 2.2) ───────────────────────────────────────
  const t22 = CAUDALES_NO_HABITABLES.datos;
  const garajes: GarajeVentilacion[] = [];
  const trasteros: TrasterosVentilacion[] = [];
  for (const p of [...plantas].reverse()) {
    // Cualquier garaje (ap. 1.1): también el privado de una vivienda, con una plaza
    // si no consta otra cosa.
    const gz = p.zonas.filter((z) => z.uso === "garaje" || z.uso === "garaje_privado");
    if (gz.length > 0) {
      const plazas = gz.reduce((s, z) => s + sanea(z.plazas ?? (z.uso === "garaje_privado" ? 1 : 0)), 0);
      const sup = gz.reduce((s, z) => s + (Number.isFinite(z.superficieUtil_m2) ? z.superficieUtil_m2 : 0), 0);
      garajes.push({
        id: `garaje-${slugDe(p.etiqueta)}`,
        nivel: p.nivel,
        plazas,
        superficie_m2: sup,
        caudal_l_s: plazas * t22.aparcamiento_l_s_plaza,
        bajoRasante: p.nivel < 0,
      });
    }
  }
  // Los trasteros solo entran en el HS 3 en edificios de viviendas (ap. 1.1).
  if (resumen.tieneViviendas) {
    for (const p of [...plantas].reverse()) {
      const tz = p.zonas.filter((z) => z.uso === "trasteros");
      if (tz.length === 0) continue;
      const sup = tz.reduce((s, z) => s + (Number.isFinite(z.superficieUtil_m2) ? z.superficieUtil_m2 : 0), 0);
      const garaje = garajes.find((g) => g.nivel === p.nivel);
      trasteros.push({
        id: `trasteros-${slugDe(p.etiqueta)}`,
        nivel: p.nivel,
        numero: tz.reduce((s, z) => s + sanea(z.numero ?? 0), 0),
        superficie_m2: sup,
        caudal_l_s: sup * t22.trasteros_l_s_m2,
        conGarajeId: garaje && decisiones.garaje === "mecanica" ? garaje.id : null,
      });
    }
  }

  const usos = plantas.flatMap((p) => p.zonas.map((z) => z.uso));
  return {
    decisiones,
    tipos,
    garajes,
    trasteros,
    rite: {
      locales: usos.filter((u) => u === "local_sin_uso").length,
      oficinas: usos.filter((u) => u === "oficinas").length,
    },
    unifamiliar: resumen.esUnifamiliar,
    conViviendas: resumen.tieneViviendas,
  };
}
