// =============================================================================
// DB-HE 4 — La justificación (feature-22): la demanda de ACS de referencia de
// cada vivienda tipo y de las oficinas (Anejo F), si la sección se aplica, la
// demanda energética mes a mes con el agua fría del Anejo G y la contribución
// renovable del sistema que produce el ACS frente a la mínima. PURA y
// DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-he4-he5.md):
//   - personas de cada vivienda por sus dormitorios (tabla a); el estudio sin
//     dormitorio cuenta como uno (criterio);
//   - factor de centralización (tabla b) solo con producción centralizada en un
//     edificio de varias viviendas;
//   - oficinas: 2 l/día·persona (tabla c) con un ocupante por cada 10 m² útiles
//     (SI 3, criterio) si no se indican; los locales sin uso no cuentan hasta que
//     tengan actividad;
//   - renovable: bomba de calor 1 − 1/SCOP (0 con SCOPdhw < 2,5); solar, su
//     fracción, y el apoyo, lo suyo sobre el resto; biomasa y red, fep,ren/fep,tot.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import { viviendasEnZona } from "../../lib/edificio/derivar";
import { DENSIDADES_SI3 } from "../../lib/edificio/tablas";
import type { Edificio } from "../../lib/edificio/tipos";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import { edificioSi } from "../si/edificio";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { positivo, resolverHe4, HABITUALES_HE4, type Apoyo, type DecisionesHe4, type He4Estado, type Sistema } from "./estado";
import {
  AGUA_FRIA_HE4,
  aguaFria,
  AMBITO_HE4,
  CONTRIBUCION_HE4,
  contribucionMinima,
  CRITERIOS_HE4,
  DEMANDA_OTROS_HE4,
  DEMANDA_VIVIENDA_HE4,
  DIAS_MES,
  factorCentralizacion,
  FRACCION_RENOVABLE_HE4,
  MESES,
  personasVivienda,
} from "./tablas";

/** Una vivienda tipo y su demanda. */
export interface ViviendaHe4 {
  tipoId: string;
  nombre: string;
  /** Viviendas de este tipo en el edificio. */
  cantidad: number;
  dormitorios: number;
  /** Personas de la tabla a-Anejo F. */
  personas: number;
  /** Demanda de una vivienda [l/d a 60 °C], sin el factor de centralización. */
  l_d: number;
}

export interface MesHe4 {
  mes: (typeof MESES)[number];
  dias: number;
  /** Agua fría de red [°C], con la corrección por altitud. */
  tred: number;
  /** Energía útil del mes, sin pérdidas [kWh]. */
  util_kWh: number;
  /** Con las pérdidas [kWh]. */
  kWh: number;
}

export type DetalleHe4 =
  | { clase: "vivienda"; vivienda: ViviendaHe4; fc: number; total_l_d: number }
  | { clase: "oficinas"; util_m2: number; ocupantes: number; supuestos: boolean; l_d: number }
  | {
      clase: "demanda";
      viviendas_l_d: number;
      oficinas_l_d: number;
      total_l_d: number;
      /** Factor de centralización aplicado (1 si no hay). */
      fc: number;
      numViviendas: number;
      centralizada: boolean;
      aplica: boolean;
      exigida_pct: number;
    }
  | {
      clase: "energia";
      meses: MesHe4[];
      util_kWh: number;
      perdidas_pct: number;
      perdidasSupuestas: boolean;
      total_kWh: number;
      provincia: string;
      capital: string;
      /** Altitud de la obra menos la de la capital [m]. */
      az: number;
    }
  | {
      clase: "contribucion";
      sistema: Sistema;
      apoyo: Apoyo;
      scop: number;
      scopSupuesto: boolean;
      /** Con bomba de calor por debajo del SCOPdhw mínimo: no cuenta como renovable. */
      scopBajo: boolean;
      fraccionSolar_pct: number;
      fraccionSupuesta: boolean;
      renovableRed_pct: number | null;
      /** Fracción renovable de cada parte [0–1]. */
      partes: { que: string; cubre: number; renovable: number }[];
      renovable_pct: number;
      exigida_pct: number;
      /** Sin redondear: el porcentaje mostrado puede redondear a lo exigido sin llegar. */
      cumple: boolean;
      renovable_kWh: number;
    };

export type ElementoHe4 = ElementoSi<DetalleHe4>;

export interface JustificacionHe4 extends JustificacionSiBase {
  elementos: ElementoHe4[];
  decisiones: DecisionesHe4;
  habituales: DecisionesHe4;
  viviendas: ViviendaHe4[];
  unifamiliar: boolean;
  /** Edificio de varias viviendas: tiene sentido la producción centralizada. */
  plurifamiliar: boolean;
  oficinas: boolean;
  local: boolean;
  aplica: boolean;
  total_l_d: number;
  /** Provincia sin agua fría en el Anejo G: no se calcula la energía. */
  sinClima: boolean;
}

/** Las viviendas tipo que hay en el edificio, con cuántas de cada una. */
function viviendasDe(edificio: Edificio): ViviendaHe4[] {
  const cuenta = new Map<string, number>();
  const tipos = edificio.unidades.filter((u) => u.clase === "vivienda");
  const unifamiliar = edificio.grupos.some((g) => g.zonas.some((z) => z.uso === "vivienda_unifamiliar"));
  if (unifamiliar) {
    // La unifamiliar no reparte unidades: su tipo es el primero de vivienda.
    if (tipos[0]) cuenta.set(tipos[0].id, 1);
  } else {
    for (const g of edificio.grupos) {
      const n = Math.max(1, Math.trunc(g.repeticiones));
      for (const z of g.zonas) {
        if (z.uso !== "viviendas" || viviendasEnZona(edificio, z) === 0) continue;
        for (const u of z.unidades ?? []) {
          const c = Number.isFinite(u.cantidad) ? Math.max(0, Math.trunc(u.cantidad)) : 0;
          if (c > 0 && tipos.some((t) => t.id === u.tipoId)) cuenta.set(u.tipoId, (cuenta.get(u.tipoId) ?? 0) + c * n);
        }
      }
    }
  }
  const L = DEMANDA_VIVIENDA_HE4.datos.litrosPersonaDia;
  const out: ViviendaHe4[] = [];
  for (const t of tipos) {
    const cantidad = cuenta.get(t.id) ?? 0;
    if (cantidad === 0 || t.clase !== "vivienda") continue;
    const dormitorios = Math.max(0, Math.trunc(t.dormitorios));
    const personas = personasVivienda(dormitorios);
    out.push({ tipoId: t.id, nombre: t.nombre, cantidad, dormitorios, personas, l_d: redondear(personas * L, 2) });
  }
  return out;
}

function redondear(v: number, dec = 0): number {
  const f = 10 ** dec;
  return Math.round(v * f) / f;
}

/** Fracción renovable de una bomba de calor eléctrica (0 por debajo del SCOPdhw mínimo). */
export function renovableBombaCalor(scop: number): number {
  return scop + 1e-9 >= CONTRIBUCION_HE4.datos.scopMinElectrica ? 1 - 1 / scop : 0;
}

/** La demanda de referencia del edificio con lo habitual [l/d]: para la aplicabilidad. */
export function demandaReferencia(edificio: Edificio, estado?: Partial<He4Estado>): number {
  const e = edificioSi(edificio);
  const viviendas = viviendasDe(edificio);
  const d = resolverHe4({ ...HABITUAL_ESTADO, ...(estado ?? {}) });
  const n = viviendas.reduce((a, v) => a + v.cantidad, 0);
  const fc = d.produccion === "centralizada" && !e.resumen.esUnifamiliar && n > 1 ? factorCentralizacion(n) : 1;
  const viv = viviendas.reduce((a, v) => a + v.l_d * v.cantidad, 0) * fc;
  const ofi = oficinasDe(edificio, estado?.ocupantesOficinas ?? null);
  return redondear(viv + (ofi?.l_d ?? 0), 1);
}

const HABITUAL_ESTADO: He4Estado = {
  sistema: "habitual",
  produccion: "habitual",
  scop: null,
  fraccionSolar_pct: null,
  apoyo: "habitual",
  captadores_m2: null,
  renovableRed_pct: null,
  ocupantesOficinas: null,
  perdidas_pct: null,
};

function oficinasDe(edificio: Edificio, ocupantesDados: number | null): { util_m2: number; ocupantes: number; supuestos: boolean; l_d: number } | null {
  const e = edificioSi(edificio);
  const util_m2 = e.zonas.filter((z) => z.uso === "oficinas").reduce((a, z) => a + z.util_m2 * z.repeticiones, 0);
  if (util_m2 <= 0) return null;
  const dados = positivo(ocupantesDados);
  const ocupantes = dados !== null ? Math.round(dados) : Math.ceil(util_m2 / DENSIDADES_SI3.datos.administrativoOficinas);
  return { util_m2: redondear(util_m2), ocupantes, supuestos: dados === null, l_d: ocupantes * DEMANDA_OTROS_HE4.datos.oficinas_l_persona_dia };
}

export function justificarHe4(estado: He4Estado, p: ProyectoSi): JustificacionHe4 {
  const e = edificioSi(p.edificio);
  const r = e.resumen;
  const unifamiliar = r.esUnifamiliar;
  const decisiones = resolverHe4(estado);
  const viviendas = viviendasDe(p.edificio);
  const numViviendas = viviendas.reduce((a, v) => a + v.cantidad, 0);
  const plurifamiliar = !unifamiliar && numViviendas > 1;
  const centralizada = plurifamiliar && decisiones.produccion === "centralizada";
  const fc = centralizada ? factorCentralizacion(numViviendas) : 1;
  const ofi = oficinasDe(p.edificio, estado.ocupantesOficinas);
  const elementos: ElementoHe4[] = [];
  const avisos: Aviso[] = [];
  const L = DEMANDA_VIVIENDA_HE4.datos.litrosPersonaDia;

  // ── La demanda de cada vivienda tipo y de las oficinas ────────────────────
  for (const v of viviendas) {
    const total_l_d = redondear(v.l_d * v.cantidad * fc, 1);
    elementos.push({
      id: `vivienda-${v.tipoId}`,
      nombre: unifamiliar ? "Demanda de la vivienda" : `Demanda · vivienda ${v.nombre}`,
      tipo: "acs",
      veredicto: "dato",
      valor: { valor: v.l_d, unidad: "l/d" },
      manda: { tipo: "caudal_por_unidad", tabla: "tabla a-Anejo F", unidades: { valor: v.personas, unidad: "personas" }, porUnidad: { valor: L, unidad: "l/d" } },
      cita: ["HE · Anejo F pto 1", "HE · tabla a-Anejo F"],
      detalle: { clase: "vivienda", vivienda: v, fc, total_l_d },
    });
  }
  if (ofi) {
    elementos.push({
      id: "oficinas",
      nombre: "Demanda de las oficinas",
      tipo: "acs",
      veredicto: "dato",
      valor: { valor: ofi.l_d, unidad: "l/d" },
      manda: {
        tipo: "caudal_por_unidad",
        tabla: "tabla c-Anejo F",
        unidades: { valor: ofi.ocupantes, unidad: "personas" },
        porUnidad: { valor: DEMANDA_OTROS_HE4.datos.oficinas_l_persona_dia, unidad: "l/d" },
      },
      cita: ["HE · Anejo F pto 2", "HE · tabla c-Anejo F"],
      detalle: { clase: "oficinas", ...ofi },
    });
  }

  // ── La demanda del edificio y si se aplica ───────────────────────────────
  const viviendas_l_d = redondear(viviendas.reduce((a, v) => a + v.l_d * v.cantidad, 0) * fc, 1);
  const oficinas_l_d = ofi?.l_d ?? 0;
  const total_l_d = redondear(viviendas_l_d + oficinas_l_d, 1);
  const aplica = total_l_d > AMBITO_HE4.datos.demandaMayorQue_l_d;
  const exigida_pct = contribucionMinima(total_l_d);
  elementos.push({
    id: "demanda",
    nombre: "Demanda de ACS del edificio",
    tipo: "acs",
    veredicto: "dato",
    valor: { valor: total_l_d, unidad: "l/d" },
    limite: { valor: AMBITO_HE4.datos.demandaMayorQue_l_d, unidad: "l/d" },
    manda: { tipo: "dato_de_partida", fuente: "viviendas tipo y oficinas de El edificio (Anejo F)" },
    cita: ["HE 4 · ap. 1", "HE · Anejo F"],
    detalle: { clase: "demanda", viviendas_l_d, oficinas_l_d, total_l_d, fc, numViviendas, centralizada, aplica, exigida_pct },
  });
  if (ofi?.supuestos) {
    const C = CONTRIBUCION_HE4.datos;
    const decide = viviendas_l_d <= AMBITO_HE4.datos.demandaMayorQue_l_d || (viviendas_l_d < C.reducidaSiDemandaMenorQue_l_d && total_l_d >= C.reducidaSiDemandaMenorQue_l_d);
    if (decide) avisos.push({ id: "oficinas", tipo: "supuesto", elementoId: "oficinas", datos: {} });
  }

  const base = {
    decisiones,
    habituales: HABITUALES_HE4,
    viviendas,
    unifamiliar,
    plurifamiliar,
    oficinas: ofi !== null,
    local: r.tieneLocales,
    aplica,
    total_l_d,
  };
  const capital = AGUA_FRIA_HE4.datos.provincias[p.datosGenerales.provincia];
  if (!aplica) return { elementos, avisos, veredicto: "ok", sinClima: !capital, ...base };
  if (!capital) {
    avisos.push({ id: "provincia", tipo: "supuesto", elementoId: "demanda", datos: {} });
  }

  // ── La demanda energética, mes a mes ─────────────────────────────────────
  const K = CRITERIOS_HE4.datos;
  const perdidasDadas = estado.perdidas_pct !== null && estado.perdidas_pct !== undefined && Number.isFinite(estado.perdidas_pct) && estado.perdidas_pct >= 0;
  const perdidas_pct = perdidasDadas ? estado.perdidas_pct! : centralizada ? K.perdidasConRecirculacion_pct : K.perdidasSinRecirculacion_pct;
  let util_kWh = 0;
  let total_kWh = 0;
  let meses: MesHe4[] = [];
  if (capital) {
    const tred = aguaFria(capital, p.datosGenerales.altitud_m);
    const T = DEMANDA_VIVIENDA_HE4.datos.temperaturaReferencia_C;
    meses = MESES.map((mes, i) => {
      const t = redondear(tred[i], 1);
      const u = (total_l_d * DIAS_MES[i] * K.calorEspecifico_Wh_lK * (T - t)) / 1000;
      return { mes, dias: DIAS_MES[i], tred: t, util_kWh: redondear(u), kWh: redondear(u * (1 + perdidas_pct / 100)) };
    });
    util_kWh = meses.reduce((a, m) => a + m.util_kWh, 0);
    total_kWh = meses.reduce((a, m) => a + m.kWh, 0);
    elementos.push({
      id: "energia",
      nombre: "Demanda energética anual de ACS",
      tipo: "acs",
      veredicto: "dato",
      valor: { valor: total_kWh, unidad: "kWh/año" },
      manda: { tipo: "formula", formula: "Q = D·días·ρ·c·(60 − Tred)·(1 + pérdidas)", resultado: { valor: total_kWh, unidad: "kWh/año" } },
      cita: ["HE 4 · ap. 4 a)", "HE · Anejo G"],
      detalle: {
        clase: "energia",
        meses,
        util_kWh,
        perdidas_pct,
        perdidasSupuestas: !perdidasDadas,
        total_kWh,
        provincia: p.datosGenerales.provincia,
        capital: capital.capital,
        az: redondear(p.datosGenerales.altitud_m - capital.altitud_m),
      },
    });
    if (!perdidasDadas) avisos.push({ id: "perdidas", tipo: "supuesto", elementoId: "energia", datos: { perdidas_pct, centralizada } });
    if (tred.some((t) => t < K.aguaFriaMin_C)) avisos.push({ id: "agua-fria", tipo: "caso_especial", elementoId: "energia", datos: {} });
  }

  // ── La contribución renovable ────────────────────────────────────────────
  const scopDado = positivo(estado.scop);
  const scop = scopDado ?? CONTRIBUCION_HE4.datos.scopMinElectrica;
  const fDada = positivo(estado.fraccionSolar_pct);
  const fraccionSolar_pct = fDada !== null ? Math.min(100, fDada) : exigida_pct;
  const redDada = estado.renovableRed_pct !== null && estado.renovableRed_pct !== undefined && Number.isFinite(estado.renovableRed_pct) && estado.renovableRed_pct >= 0;
  const renovableRed_pct = redDada ? Math.min(100, estado.renovableRed_pct!) : null;
  const R = FRACCION_RENOVABLE_HE4.datos;
  const usaBomba = decisiones.sistema === "bomba_calor" || (decisiones.sistema === "solar" && decisiones.apoyo === "bomba_calor");
  const partes: { que: string; cubre: number; renovable: number }[] = [];
  switch (decisiones.sistema) {
    case "bomba_calor":
      partes.push({ que: "bomba de calor", cubre: 1, renovable: renovableBombaCalor(scop) });
      break;
    case "solar": {
      const f = fraccionSolar_pct / 100;
      partes.push({ que: "solar térmica", cubre: f, renovable: 1 });
      const rApoyo = decisiones.apoyo === "bomba_calor" ? renovableBombaCalor(scop) : decisiones.apoyo === "biomasa" ? R.biomasa : 0;
      if (f < 1) partes.push({ que: decisiones.apoyo === "bomba_calor" ? "apoyo con bomba de calor" : decisiones.apoyo === "biomasa" ? "apoyo con biomasa" : "apoyo convencional", cubre: 1 - f, renovable: rApoyo });
      break;
    }
    case "biomasa":
      partes.push({ que: "caldera de biomasa", cubre: 1, renovable: R.biomasa });
      break;
    case "red":
      partes.push({ que: "red urbana", cubre: 1, renovable: (renovableRed_pct ?? 0) / 100 });
      break;
  }
  // Se compara sin redondear (K-HE4.10): un SCOP de 3,33 da 69,97 %, que no llega al 70 %.
  const renovable = partes.reduce((a, x) => a + x.cubre * x.renovable, 0) * 100;
  const renovable_pct = redondear(renovable, 1);
  const ok = renovable + 1e-9 >= exigida_pct;
  const scopBajo = usaBomba && renovableBombaCalor(scop) === 0;
  elementos.push({
    id: "contribucion",
    nombre: "Contribución renovable al ACS",
    tipo: "acs",
    veredicto: ok ? "ok" : "fail",
    valor: { valor: renovable_pct, unidad: "%" },
    limite: { valor: exigida_pct, unidad: "%" },
    manda: { tipo: "formula", formula: "Σ parte cubierta × fracción renovable", resultado: { valor: renovable_pct, unidad: "%" } },
    uso: renovable_pct > 0 ? Math.min(9.99, exigida_pct / renovable_pct) : 1,
    cita: ["HE 4 · ap. 3.1"],
    detalle: {
      clase: "contribucion",
      sistema: decisiones.sistema,
      apoyo: decisiones.apoyo,
      scop,
      scopSupuesto: scopDado === null,
      scopBajo,
      fraccionSolar_pct,
      fraccionSupuesta: fDada === null,
      renovableRed_pct,
      partes,
      renovable_pct,
      exigida_pct,
      cumple: ok,
      renovable_kWh: redondear((total_kWh * renovable_pct) / 100),
    },
  });
  if (usaBomba && scopDado === null) avisos.push({ id: "scop", tipo: "supuesto", elementoId: "contribucion", datos: {} });
  if (decisiones.sistema === "solar" && fDada === null) avisos.push({ id: "fraccion", tipo: "supuesto", elementoId: "contribucion", datos: {} });

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, sinClima: !capital, ...base };
}
