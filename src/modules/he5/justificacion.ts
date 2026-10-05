// =============================================================================
// DB-HE 5 — La justificación (feature-22): la superficie construida del edificio
// (con el garaje interior), la potencia mínima Pmin = mín(P1, P2) y la potencia
// que se instala. PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-he4-he5.md):
//   - S es la superficie CONSTRUIDA de todas las zonas de El edificio, también la
//     del garaje (está dentro del edificio); sin la construida de una zona se
//     supone la útil × 1,20 (como en SI) y se avisa solo si cambia el resultado;
//   - P1 reparte S por usos: Fpr;el = 0,005 kW/m² en lo residencial privado (las
//     viviendas y lo que las sirve) y 0,010 en el resto (locales y oficinas);
//   - Sc es la cubierta no transitable de El edificio (plana no transitable o
//     inclinada); una plana transitable no cuenta, salvo lo que se indique;
//   - Soc son los captadores solares térmicos que da HE 4.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import { dependeDeConstruida, edificioSi, superficies, type ZonaSi } from "../si/edificio";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { he4EstadoDefaults, positivo, resolverHe4, type He4Estado } from "../he4/estado";
import type { He5Estado } from "./estado";
import { AMBITO_HE5, arriba2, potenciaP1, potenciaP2 } from "./tablas";

/** De qué uso cuenta una zona para Fpr;el. */
export type UsoHe5 = "residencial" | "resto";

export interface SuperficiesHe5 {
  /** Construida total [m²] (redondeada a m²). */
  s_m2: number;
  residencial_m2: number;
  resto_m2: number;
  /** Útil total [m²]: lo mínimo que puede ser la construida. */
  util_m2: number;
  util_residencial_m2: number;
  util_resto_m2: number;
  supuesta: boolean;
  /** El garaje que entra en S [m² construidos]. */
  garaje_m2: number;
}

/** Los captadores solares térmicos de HE 4 (Soc). */
export interface CaptadoresHe5 {
  /** HE 4 produce el ACS con solar térmica. */
  solar: boolean;
  soc_m2: number;
  /** Con solar y sin la superficie de captadores en HE 4: se cuenta 0 (P2 mayor). */
  supuesto: boolean;
}

export type DetalleHe5 =
  | ({ clase: "superficie"; aplica: boolean } & SuperficiesHe5)
  | { clase: "p1"; residencial_m2: number; resto_m2: number; p1_kW: number }
  | {
      clase: "p2";
      sc_m2: number;
      /** De dónde sale Sc: la cubierta de El edificio o la indicada. */
      origenSc: "edificio" | "indicada";
      tipoCubierta: ProyectoSi["edificio"]["cubierta"]["tipo"];
      captadores: CaptadoresHe5;
      p2_kW: number;
    }
  | {
      clase: "potencia";
      p1_kW: number;
      p2_kW: number;
      pmin_kW: number;
      /** Cuál de las dos manda. */
      manda: "p1" | "p2";
      instalada_kW: number;
      /** La instalada es la mínima (no se ha indicado). */
      minima: boolean;
    };

export type ElementoHe5 = ElementoSi<DetalleHe5>;

export interface JustificacionHe5 extends JustificacionSiBase {
  elementos: ElementoHe5[];
  aplica: boolean;
  superficies: SuperficiesHe5;
  captadores: CaptadoresHe5;
  /** Zonas cuya construida cuenta (todas): para la decisión «Superficie construida». */
  zonas: ZonaSi[];
  pmin_kW: number;
  unifamiliar: boolean;
  /** Hay los dos usos: P1 se reparte (criterio). */
  mixto: boolean;
}

const RESIDENCIAL = new Set(["viviendas", "vivienda_unifamiliar", "garaje_privado"]);
const RESTO = new Set(["oficinas", "local_sin_uso"]);

/** El uso de una zona para Fpr;el: lo común, los trasteros, los cuartos y el garaje siguen al uso principal. */
function usoHe5(z: ZonaSi, residencialPrincipal: boolean): UsoHe5 {
  if (RESIDENCIAL.has(z.uso)) return "residencial";
  if (RESTO.has(z.uso)) return "resto";
  return residencialPrincipal ? "residencial" : "resto";
}

export function superficiesHe5(zonas: readonly ZonaSi[], residencialPrincipal: boolean): SuperficiesHe5 {
  const res = zonas.filter((z) => usoHe5(z, residencialPrincipal) === "residencial");
  const otro = zonas.filter((z) => usoHe5(z, residencialPrincipal) === "resto");
  const t = superficies(zonas);
  const r = superficies(res);
  const o = superficies(otro);
  const g = superficies(zonas.filter((z) => z.uso === "garaje" || z.uso === "garaje_privado"));
  return {
    s_m2: t.construida_m2,
    residencial_m2: r.construida_m2,
    resto_m2: o.construida_m2,
    util_m2: t.util_m2,
    util_residencial_m2: r.util_m2,
    util_resto_m2: o.util_m2,
    supuesta: t.supuesta,
    garaje_m2: g.construida_m2,
  };
}

/** Los captadores solares térmicos de HE 4, de su estado guardado. */
export function captadoresDeHe4(p: ProyectoSi): CaptadoresHe5 {
  const guardado = p.justificaciones?.he4?.inputs as Partial<He4Estado> | undefined;
  const e: He4Estado = { ...he4EstadoDefaults, ...(guardado ?? {}) };
  const solar = resolverHe4(e).sistema === "solar";
  const dado = positivo(e.captadores_m2);
  return { solar, soc_m2: solar && dado !== null ? dado : 0, supuesto: solar && dado === null };
}

/** La cubierta que cuenta para P2: la no transitable o inclinada de El edificio. */
function cubiertaSc(p: ProyectoSi, estado: He5Estado): { sc_m2: number; origen: "edificio" | "indicada" } {
  const indicada = estado.cubiertaNoTransitable_m2;
  if (indicada !== null && indicada !== undefined && Number.isFinite(indicada) && indicada >= 0) return { sc_m2: indicada, origen: "indicada" };
  const c = p.edificio.cubierta;
  const s = Number.isFinite(c.superficie_m2) && c.superficie_m2 > 0 ? c.superficie_m2 : 0;
  return { sc_m2: c.tipo === "plana_transitable" ? 0 : s, origen: "edificio" };
}

export function justificarHe5(estado: He5Estado, p: ProyectoSi): JustificacionHe5 {
  const e = edificioSi(p.edificio);
  const r = e.resumen;
  const residencialPrincipal = r.tieneViviendas;
  const sup = superficiesHe5(e.zonas, residencialPrincipal);
  const captadores = captadoresDeHe4(p);
  const limite = AMBITO_HE5.datos.superficieMayorQue_m2;
  const aplica = sup.s_m2 > limite;
  const mixto = sup.residencial_m2 > 0 && sup.resto_m2 > 0;
  const elementos: ElementoHe5[] = [];
  const avisos: Aviso[] = [];

  elementos.push({
    id: "superficie",
    nombre: "Superficie construida del edificio",
    tipo: "generacion",
    veredicto: "dato",
    valor: { valor: sup.s_m2, unidad: "m²" },
    limite: { valor: limite, unidad: "m²" },
    manda: { tipo: "dato_de_partida", fuente: "superficie construida de las zonas de El edificio, con el garaje" },
    cita: ["HE 5 · ap. 1"],
    detalle: { clase: "superficie", aplica, ...sup },
  });
  // La construida supuesta solo importa si con la útil (lo mínimo) no aplicaría.
  const utilAplica = (m2: number) => m2 > limite;

  const base = { aplica, superficies: sup, captadores, zonas: e.zonas, unifamiliar: r.esUnifamiliar, mixto };
  if (!aplica) {
    return { elementos, avisos, veredicto: "ok", pmin_kW: 0, ...base };
  }
  if (dependeDeConstruida({ util_m2: sup.util_m2, construida_m2: sup.s_m2, supuesta: sup.supuesta }, utilAplica)) {
    avisos.push({ id: "construida", tipo: "supuesto", elementoId: "superficie", datos: {} });
  }

  const p1_kW = arriba2(potenciaP1(sup.residencial_m2, sup.resto_m2));
  const sc = cubiertaSc(p, estado);
  const p2_kW = Math.max(0, arriba2(potenciaP2(sc.sc_m2, captadores.soc_m2)));
  const manda: "p1" | "p2" = p1_kW <= p2_kW ? "p1" : "p2";
  const pmin_kW = Math.min(p1_kW, p2_kW);

  elementos.push({
    id: "p1",
    nombre: "Potencia por superficie construida, P1",
    tipo: "generacion",
    veredicto: "dato",
    valor: { valor: p1_kW, unidad: "kW" },
    manda: { tipo: "formula", formula: "P1 = Fpr;el·S", resultado: { valor: p1_kW, unidad: "kW" } },
    cita: ["HE 5 · ap. 3 pto 1"],
    detalle: { clase: "p1", residencial_m2: sup.residencial_m2, resto_m2: sup.resto_m2, p1_kW },
  });
  elementos.push({
    id: "p2",
    nombre: "Potencia por superficie de cubierta, P2",
    tipo: "generacion",
    veredicto: "dato",
    valor: { valor: p2_kW, unidad: "kW" },
    manda: { tipo: "formula", formula: "P2 = 0,1·(0,5·Sc − Soc)", resultado: { valor: p2_kW, unidad: "kW" } },
    cita: ["HE 5 · ap. 3 pto 1"],
    detalle: { clase: "p2", sc_m2: sc.sc_m2, origenSc: sc.origen, tipoCubierta: p.edificio.cubierta.tipo, captadores, p2_kW },
  });

  // Avisos que solo importan si cambian Pmin.
  if (manda === "p1" && sup.supuesta && arriba2(potenciaP1(sup.util_residencial_m2, sup.util_resto_m2)) !== p1_kW && !avisos.some((a) => a.id === "construida")) {
    avisos.push({ id: "construida", tipo: "supuesto", elementoId: "p1", datos: {} });
  }
  if (captadores.supuesto && manda === "p2") avisos.push({ id: "captadores", tipo: "supuesto", elementoId: "p2", datos: {} });
  if (mixto) avisos.push({ id: "mixto", tipo: "caso_especial", elementoId: "p1", datos: {} });
  if (sc.origen === "edificio" && p.edificio.cubierta.tipo === "plana_transitable") {
    avisos.push({ id: "transitable", tipo: "caso_especial", elementoId: "p2", datos: {} });
  }

  const indicada = positivo(estado.potencia_kW);
  const instalada_kW = indicada ?? pmin_kW;
  const ok = instalada_kW + 1e-9 >= pmin_kW;
  elementos.push({
    id: "potencia",
    nombre: "Potencia de generación instalada",
    tipo: "generacion",
    veredicto: ok ? "ok" : "fail",
    valor: { valor: instalada_kW, unidad: "kW" },
    limite: { valor: pmin_kW, unidad: "kW" },
    manda: { tipo: "formula", formula: "Pmin = mín(P1, P2)", resultado: { valor: pmin_kW, unidad: "kW" } },
    uso: instalada_kW > 0 ? Math.min(9.99, pmin_kW / instalada_kW) : 1,
    cita: ["HE 5 · ap. 3 pto 1", "HE 5 · ap. 4"],
    detalle: { clase: "potencia", p1_kW, p2_kW, pmin_kW, manda, instalada_kW, minima: indicada === null },
  });

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, pmin_kW, ...base };
}
