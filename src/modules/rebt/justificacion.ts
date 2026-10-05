// =============================================================================
// REBT — La justificación (feature-23): el grado de electrificación y la
// potencia de cada vivienda tipo, la carga del conjunto de viviendas con la
// tabla 1, los servicios generales, los locales y oficinas, el garaje, la
// recarga del vehículo eléctrico y la carga total del edificio (ITC-BT-10);
// dónde van los contadores (ITC-BT-16) y si la instalación pide proyecto o
// memoria técnica de diseño (ITC-BT-04). PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-rebt.md):
//   - la superficie de los locales y del garaje es la útil de El edificio (la
//     ITC no dice útil ni construida: criterio);
//   - la ventilación del garaje es la de HS 3 (mecánica = forzada);
//   - el ascensor, el de El edificio o el que exige SUA 9;
//   - cada planta de un local u oficina es un local, con su mínimo y su contador;
//   - los servicios generales llevan un contador; el garaje va con ellos; los
//     módulos de reserva de la recarga cuentan para el umbral de 16 (criterio);
//   - el control de humo mecánico (SI 3 ap. 8) es el del garaje de uso
//     Aparcamiento (más de 100 m² construidos) que no es abierto (bajo rasante);
//   - la recarga del garaje de un edificio de oficinas, las estaciones que se
//     instalan por HE 6, a la potencia de su estación (el ap. 5.2 de la ITC-BT-10
//     es solo de viviendas); el factor de 0,3 solo con el esquema colectivo que
//     se elige en HE 6 (feature-24).
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import { viviendasEnZona } from "../../lib/edificio/derivar";
import type { Edificio, ViviendaTipo } from "../../lib/edificio/tipos";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import { resolverHe4, he4EstadoDefaults, type He4Estado } from "../he4/estado";
import { recargaDeHe6 } from "../he6/justificacion";
import { resolverDecisionesHs3, DECISIONES_HS3_POR_DEFECTO, type DecisionesHs3 } from "../hs3/red";
import type { ProyectoSi } from "../si/definicion";
import { edificioSi, superficies, type ZonaSi } from "../si/edificio";
import { SECTORES_TABLA_1_1 } from "../si/tablas";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { edificioSua } from "../sua/edificio";
import { noNegativo, resolverRebt, HABITUALES_REBT, type DecisionesRebt, type RebtEstado, type Spl } from "./estado";
import {
  ANEXO2_GUIA_BT52,
  coeficienteSimultaneidad,
  CONTADORES_REBT,
  CRITERIOS_REBT,
  GARAJES_REBT,
  GRADO_REBT,
  igaDe,
  LOCALES_REBT,
  potenciaAscensorHabitual,
  PROYECTO_REBT,
  RECARGA_REBT,
  RESERVA_CT_REBT,
  SERVICIOS_REBT,
} from "./tablas";

/** Por qué una vivienda es de electrificación elevada. */
export type MotivoElevada = "superficie" | "equipos" | "recarga";
export type Grado = "basica" | "elevada";
export type Ventilacion = "natural" | "forzada";

/** Una vivienda tipo y su previsión. */
export interface ViviendaRebt {
  tipoId: string;
  nombre: string;
  /** Viviendas de este tipo en el edificio. */
  cantidad: number;
  superficie_m2: number;
  motivos: MotivoElevada[];
  grado: Grado;
  potencia_W: number;
  iga_A: number;
}

/** Un alumbrado de zona común. */
export interface AlumbradoRebt {
  zonaId: string;
  /** «Portal (PB)», «Escalera (P1–P3)». */
  que: string;
  m2: number;
  W_m2: number;
  W: number;
}

export type DetalleRebt =
  | { clase: "vivienda"; vivienda: ViviendaRebt; unifamiliar: boolean }
  | { clase: "viviendas"; n: number; media_W: number; coeficiente: number; p_W: number }
  | {
      clase: "servicios";
      ascensor: { supuesto: boolean; kW: number; kWSupuesta: boolean } | null;
      alumbrado: AlumbradoRebt[];
      otros_kW: number;
      otrosIndicados: boolean;
      p_W: number;
    }
  | {
      clase: "local";
      zonaId: string;
      uso: "local_sin_uso" | "oficinas";
      plantas: string;
      /** Locales iguales (una por planta del grupo). */
      locales: number;
      m2: number;
      porLocal_W: number;
      /** El mínimo por local manda sobre los 100 W/m². */
      minimo: boolean;
      p_W: number;
    }
  | {
      clase: "garaje";
      m2: number;
      plazas: number;
      ventilacion: Ventilacion;
      deHs3: boolean;
      W_m2: number;
      minimo: boolean;
      /** Uso Aparcamiento no abierto con control de humo mecánico: estudio específico. */
      humo: boolean;
      /** La potencia estudiada del garaje [kW], si se da (con humo). */
      estudiada_kW: number | null;
      p_W: number;
    }
  | {
      clase: "recarga";
      /** `viviendas`: ITC-BT-10 ap. 5.2; `otros`: las estaciones de HE 6. */
      ambito: "viviendas" | "otros";
      plazas: number;
      plazasPrevision: number;
      /** Potencia por plaza o estación [W]: 3 680 en viviendas; la de la estación de HE 6 en otros usos. */
      porEstacion_W: number;
      /** El esquema de HE 6 es el colectivo: admite el SPL. */
      colectivo: boolean;
      /** Otros usos: estaciones de recarga. */
      estaciones: number;
      indicadas: boolean;
      p5_W: number;
      spl: Spl;
      factor: number;
      p_W: number;
      /** Guía BT-52, Anexo 2, con todas las plazas preinstaladas (información, no se suma). */
      anexo2_W: number;
    }
  | {
      clase: "total";
      clasificacion: "unifamiliar" | "viviendas" | "oficinas";
      partes: { id: string; que: string; p_W: number }[];
      p_W: number;
      /** Intensidad de la línea general de alimentación (o de la derivación de la unifamiliar) [A]. */
      i_A: number;
      trifasica: boolean;
    }
  | {
      clase: "contadores";
      n: number;
      desglose: { que: string; n: number }[];
      ubicacion: "cpm" | "armario" | "local";
      exigeLocal: boolean;
      /** El cuarto «contadores de electricidad» de El edificio. */
      cuarto: { zonaId: string; plantas: string; niveles: number[] } | null;
      /** En la PB o el primer sótano. */
      plantaOk: boolean;
      /** Un cuarto de instalaciones sin tipo en la PB o el primer sótano: el arreglo lo hace de contadores. */
      candidato: { zonaId: string; plantas: string } | null;
    }
  | {
      clase: "documentacion";
      proyecto: boolean;
      /** Solo el aparcamiento (grupos g o h): el resto, memoria técnica de diseño. */
      soloAparcamiento: boolean;
      grupos: { grupo: string; motivo: string }[];
    };

export type ElementoRebt = ElementoSi<DetalleRebt>;

export interface JustificacionRebt extends JustificacionSiBase {
  elementos: ElementoRebt[];
  decisiones: DecisionesRebt;
  habituales: DecisionesRebt;
  viviendas: ViviendaRebt[];
  unifamiliar: boolean;
  /** Edificio destinado principalmente a viviendas (ap. 3) u oficinas (ap. 4). */
  clasificacion: "unifamiliar" | "viviendas" | "oficinas";
  /** Plazas del garaje comunitario (0 sin él). */
  plazasGaraje: number;
  /** Hay ascensor (el de El edificio o el que exige SUA 9). */
  ascensor: boolean;
  total_W: number;
}

function redondear(v: number, dec = 0): number {
  const f = 10 ** dec;
  return Math.round(v * f) / f;
}

function entero(v: number | undefined): number {
  return v !== undefined && Number.isFinite(v) ? Math.max(0, Math.trunc(v)) : 0;
}

/** Las viviendas tipo que hay en el edificio, con cuántas de cada una. */
function viviendasDe(edificio: Edificio, unifamiliar: boolean): { tipo: ViviendaTipo; cantidad: number }[] {
  const tipos = edificio.unidades.filter((u): u is ViviendaTipo => u.clase === "vivienda");
  if (unifamiliar) return tipos[0] ? [{ tipo: tipos[0], cantidad: 1 }] : [];
  const cuenta = new Map<string, number>();
  for (const g of edificio.grupos) {
    const n = Math.max(1, Math.trunc(g.repeticiones));
    for (const z of g.zonas) {
      if (z.uso !== "viviendas" || viviendasEnZona(edificio, z) === 0) continue;
      for (const u of z.unidades ?? []) {
        const c = entero(u.cantidad);
        if (c > 0 && tipos.some((t) => t.id === u.tipoId)) cuenta.set(u.tipoId, (cuenta.get(u.tipoId) ?? 0) + c * n);
      }
    }
  }
  return tipos.filter((t) => (cuenta.get(t.id) ?? 0) > 0).map((tipo) => ({ tipo, cantidad: cuenta.get(tipo.id)! }));
}

/** La ventilación del garaje de HS 3: la guardada o la habitual para El edificio. */
function ventilacionGaraje(edificio: Edificio, hs3?: Partial<DecisionesHs3>): { ventilacion: Ventilacion; deHs3: boolean } {
  const d = resolverDecisionesHs3({ ...DECISIONES_HS3_POR_DEFECTO, ...(hs3 ?? {}) }, edificio);
  return { ventilacion: d.garaje === "mecanica" ? "forzada" : "natural", deHs3: hs3?.garaje !== undefined && hs3.garaje !== "habitual" };
}

/**
 * El alumbrado de una zona común: el portal (la zona común de la PB) y los
 * vestíbulos, con la cifra de «portal y espacios comunes»; las demás plantas, con
 * la de «caja de escalera» (Guía BT-10, la de fluorescencia: criterio).
 */
function nombreAlumbrado(z: ZonaSi): { que: string; W_m2: number } {
  const S = SERVICIOS_REBT.datos;
  const portal = z.uso === "vestibulo" || z.niveles.includes(0);
  return portal
    ? { que: `${z.uso === "vestibulo" ? "Vestíbulo" : "Portal"} (${z.plantas})`, W_m2: S.alumbradoPortal_W_m2.fluorescencia }
    : { que: `Escalera (${z.plantas})`, W_m2: S.alumbradoEscalera_W_m2.fluorescencia };
}

export function justificarRebt(estado: RebtEstado, p: ProyectoSi): JustificacionRebt {
  const e = edificioSi(p.edificio);
  const r = e.resumen;
  const unifamiliar = r.esUnifamiliar;
  const decisiones = resolverRebt(estado);
  const elementos: ElementoRebt[] = [];
  const avisos: Aviso[] = [];
  const G = GRADO_REBT.datos;
  const clasificacion: JustificacionRebt["clasificacion"] = unifamiliar ? "unifamiliar" : r.tieneViviendas ? "viviendas" : "oficinas";

  // ── El grado de cada vivienda tipo (ITC-BT-10 ap. 2) ──────────────────────
  // ITC-BT-52 ap. 3.1: la unifamiliar con aparcamiento o zona prevista lleva el C13 (ap. 5.1: elevada).
  const garajePrivado = e.zonas.some((z) => z.uso === "garaje_privado");
  const conRecarga = unifamiliar && (garajePrivado || estado.plazaParcela === true);
  const viviendas: ViviendaRebt[] = viviendasDe(p.edificio, unifamiliar).map(({ tipo, cantidad }) => {
    const superficie_m2 = Number.isFinite(tipo.superficieUtil_m2) ? Math.max(0, tipo.superficieUtil_m2) : 0;
    const motivos: MotivoElevada[] = [];
    if (superficie_m2 > G.superficieElevadaMasDe_m2) motivos.push("superficie");
    if (decisiones.electrificacion === "elevada") motivos.push("equipos");
    if (conRecarga) motivos.push("recarga");
    const grado: Grado = motivos.length > 0 ? "elevada" : "basica";
    const potencia_W = grado === "elevada" ? G.elevada_W : G.basica_W;
    return { tipoId: tipo.id, nombre: tipo.nombre, cantidad, superficie_m2, motivos, grado, potencia_W, iga_A: igaDe(potencia_W) };
  });
  for (const v of viviendas) {
    const minimo = v.grado === "elevada" ? G.elevada_W : G.basica_W;
    elementos.push({
      id: `vivienda-${v.tipoId}`,
      nombre: unifamiliar ? "Grado de electrificación" : `Vivienda ${v.nombre}`,
      tipo: "vivienda",
      veredicto: "ok",
      valor: { valor: v.potencia_W, unidad: "W" },
      limite: { valor: minimo, unidad: "W" },
      manda: { tipo: "decision_proyectista", decision: v.grado === "elevada" ? "electrificación elevada" : "electrificación básica" },
      cita: ["ITC-BT-10 · ap. 2.1 y 2.2", "ITC-BT-25 · ap. 2.3"],
      detalle: { clase: "vivienda", vivienda: v, unifamiliar },
    });
  }

  const partes: { id: string; que: string; p_W: number }[] = [];
  const n = viviendas.reduce((a, v) => a + v.cantidad, 0);

  // ── El conjunto de viviendas (ap. 3.1, tabla 1) ──────────────────────────
  if (unifamiliar) {
    if (viviendas[0]) partes.push({ id: `vivienda-${viviendas[0].tipoId}`, que: "Vivienda", p_W: viviendas[0].potencia_W });
  } else if (n > 0) {
    const media_W = viviendas.reduce((a, v) => a + v.potencia_W * v.cantidad, 0) / n;
    const coeficiente = coeficienteSimultaneidad(n);
    const p_W = redondear(media_W * coeficiente);
    elementos.push({
      id: "viviendas",
      nombre: "Carga de las viviendas",
      tipo: "carga",
      veredicto: "dato",
      valor: { valor: p_W, unidad: "W" },
      manda: { tipo: "formula", formula: "P1 = media × coeficiente (tabla 1)", resultado: { valor: p_W, unidad: "W" } },
      cita: ["ITC-BT-10 · ap. 3.1 y tabla 1"],
      detalle: { clase: "viviendas", n, media_W: redondear(media_W, 1), coeficiente, p_W },
    });
    partes.push({ id: "viviendas", que: "Viviendas", p_W });
  }

  // ── Los servicios generales (ap. 3.2) ────────────────────────────────────
  let hayAscensor = false;
  if (!unifamiliar) {
    const sua = edificioSua(p.edificio);
    hayAscensor = sua.ascensor.hay.valor;
    const ascensorDado = noNegativo(estado.ascensor_kW);
    const ascensor = hayAscensor
      ? { supuesto: sua.ascensor.hay.supuesto, kW: ascensorDado ?? potenciaAscensorHabitual(), kWSupuesta: ascensorDado === null }
      : null;
    const alumbrado: AlumbradoRebt[] = e.zonas
      .filter((z) => (z.uso === "zona_comun" || z.uso === "vestibulo") && z.util_m2 > 0)
      .map((z) => {
        const a = nombreAlumbrado(z);
        const m2 = redondear(z.util_m2 * z.repeticiones);
        return { zonaId: z.id, que: a.que, m2, W_m2: a.W_m2, W: redondear(m2 * a.W_m2) };
      });
    const otrosDados = noNegativo(estado.otrosServicios_kW);
    const otros_kW = otrosDados ?? 0;
    const p_W = redondear((ascensor?.kW ?? 0) * 1000 + alumbrado.reduce((a, x) => a + x.W, 0) + otros_kW * 1000);
    elementos.push({
      id: "servicios",
      nombre: "Servicios generales",
      tipo: "carga",
      veredicto: "dato",
      valor: { valor: p_W, unidad: "W" },
      manda: { tipo: "formula", formula: "P2 = ascensor + alumbrado común + otros (simultaneidad 1)", resultado: { valor: p_W, unidad: "W" } },
      cita: ["ITC-BT-10 · ap. 3.2", "Guía BT-10 · tabla A"],
      detalle: { clase: "servicios", ascensor, alumbrado, otros_kW, otrosIndicados: otrosDados !== null, p_W },
    });
    partes.push({ id: "servicios", que: "Servicios generales", p_W });
    if (ascensor?.supuesto) avisos.push({ id: "ascensor-supuesto", tipo: "supuesto", elementoId: "servicios", datos: {} });
    if (ascensor?.kWSupuesta || otrosDados === null) {
      avisos.push({ id: "servicios", tipo: "supuesto", elementoId: "servicios", datos: { ascensor: ascensor?.kWSupuesta ?? false, otros: otrosDados === null } });
    }
    const he4 = p.justificaciones?.he4?.inputs as Partial<He4Estado> | undefined;
    if (r.numViviendas > 1 && resolverHe4({ ...he4EstadoDefaults, ...(he4 ?? {}) }).produccion === "centralizada" && otrosDados === null) {
      avisos.push({ id: "acs-central", tipo: "caso_especial", elementoId: "servicios", datos: {} });
    }
  }

  // ── Los locales y las oficinas (ap. 3.3 y 4.1) ───────────────────────────
  const L = LOCALES_REBT.datos;
  let numLocales = 0;
  for (const z of e.zonas) {
    if (z.uso !== "local_sin_uso" && z.uso !== "oficinas") continue;
    if (z.util_m2 <= 0) continue;
    const m2 = redondear(z.util_m2);
    const porRatio = m2 * L.W_m2;
    const porLocal_W = redondear(Math.max(porRatio, L.minimoLocal_W));
    const locales = z.repeticiones;
    numLocales += locales;
    const p_W = porLocal_W * locales;
    const nombreUso = z.uso === "oficinas" ? "Oficinas" : "Local";
    elementos.push({
      id: `local-${z.id}`,
      nombre: `${nombreUso} (${z.plantas})`,
      tipo: "carga",
      veredicto: z.uso === "local_sin_uso" ? "previsto" : "dato",
      valor: { valor: p_W, unidad: "W" },
      manda: { tipo: "caudal_por_unidad", tabla: "ITC-BT-10 ap. 3.3", unidades: { valor: m2, unidad: "m²" }, porUnidad: { valor: L.W_m2, unidad: "W" } },
      cita: [clasificacion === "oficinas" ? "ITC-BT-10 · ap. 4.1" : "ITC-BT-10 · ap. 3.3"],
      detalle: { clase: "local", zonaId: z.id, uso: z.uso, plantas: z.plantas, locales, m2, porLocal_W, minimo: porRatio < L.minimoLocal_W, p_W },
    });
    partes.push({ id: `local-${z.id}`, que: `${nombreUso} (${z.plantas})`, p_W });
  }

  // ── El garaje (ap. 3.4) ──────────────────────────────────────────────────
  const garajes = e.zonas.filter((z) => z.uso === "garaje" && z.util_m2 > 0);
  const plazasGaraje = garajes.reduce((a, z) => a + entero(z.zona.plazas) * z.repeticiones, 0);
  let ventGaraje: Ventilacion = "natural";
  if (garajes.length > 0) {
    const GA = GARAJES_REBT.datos;
    const hs3 = p.justificaciones?.hs3?.inputs as Partial<DecisionesHs3> | undefined;
    const { ventilacion, deHs3 } = ventilacionGaraje(p.edificio, hs3);
    ventGaraje = ventilacion;
    const m2 = redondear(garajes.reduce((a, z) => a + z.util_m2 * z.repeticiones, 0));
    const W_m2 = ventilacion === "forzada" ? GA.forzada_W_m2 : GA.natural_W_m2;
    const porRatio = m2 * W_m2;
    // SI 3 ap. 8: el garaje de uso Aparcamiento (más de 100 m² construidos) que no es
    // abierto (bajo rasante) y se ventila con ventiladores controla así el humo.
    const humo = ventilacion === "forzada" && garajes.some((z) => z.bajoRasante) && superficies(garajes).construida_m2 > SECTORES_TABLA_1_1.datos.aparcamiento_m2;
    const estudiada = humo ? noNegativo(estado.garaje_kW) : null;
    const p_W = redondear(Math.max(porRatio, GA.minimo_W, (estudiada ?? 0) * 1000));
    elementos.push({
      id: "garaje",
      nombre: "Garaje",
      tipo: "carga",
      veredicto: "dato",
      valor: { valor: p_W, unidad: "W" },
      manda: { tipo: "caudal_por_unidad", tabla: "ITC-BT-10 ap. 3.4", unidades: { valor: m2, unidad: "m²" }, porUnidad: { valor: W_m2, unidad: "W" } },
      cita: ["ITC-BT-10 · ap. 3.4"],
      detalle: { clase: "garaje", m2, plazas: plazasGaraje, ventilacion, deHs3, W_m2, minimo: porRatio < GA.minimo_W && estudiada === null, humo, estudiada_kW: estudiada, p_W },
    });
    partes.push({ id: "garaje", que: "Garaje", p_W });
    if (humo && estudiada === null) avisos.push({ id: "humo", tipo: "caso_especial", elementoId: "garaje", datos: {} });
    if (clasificacion === "oficinas") avisos.push({ id: "garaje-oficinas", tipo: "caso_especial", elementoId: "garaje", datos: {} });
  }

  // ── La recarga del vehículo eléctrico (ap. 5.2; ITC-BT-52 ap. 4; HE 6) ──────
  const R = RECARGA_REBT.datos;
  const A2 = ANEXO2_GUIA_BT52.datos;
  const he6 = recargaDeHe6(p);
  const otrosUsos = clasificacion === "oficinas" && he6.aplica;
  if ((clasificacion === "viviendas" && plazasGaraje > 0) || otrosUsos) {
    const minimas = plazasGaraje * R.fraccionPlazas;
    const dadas = noNegativo(estado.plazasRecarga);
    const estaciones = otrosUsos ? he6.estaciones : 0;
    const plazasPrevision = otrosUsos
      ? estaciones
      : dadas !== null
        ? Math.min(plazasGaraje, Math.max(minimas, Math.round(dadas)))
        : redondear(minimas, 2);
    const porEstacion_W = otrosUsos ? he6.potenciaEstacion_W : R.porPlaza_W;
    const p5_W = redondear(porEstacion_W * plazasPrevision);
    // El 0,3 solo vale en el esquema colectivo (el de HE 6) con SPL; en otros usos, 1,0.
    const colectivo = he6.esquema === "1";
    const spl: Spl = otrosUsos || !colectivo ? "sin_spl" : decisiones.spl;
    const factor = spl === "con_spl" ? R.factorColectivoConSpl : R.factorSinSpl;
    const p_W = redondear(p5_W * factor);
    const anexo2_W = redondear((spl === "con_spl" ? A2.fs1ConSpl : A2.fs1SinSpl) * plazasGaraje * A2.porPlaza_W);
    elementos.push({
      id: "recarga",
      nombre: "Recarga del vehículo eléctrico",
      tipo: "carga",
      veredicto: "dato",
      valor: { valor: p_W, unidad: "W" },
      manda: otrosUsos
        ? { tipo: "formula", formula: "P5 = estaciones de HE 6 × potencia de la estación", resultado: { valor: p_W, unidad: "W" } }
        : { tipo: "formula", formula: "P5 = 3 680 W × 10 % de las plazas; × 0,3 colectivo con SPL o × 1,0", resultado: { valor: p_W, unidad: "W" } },
      cita: otrosUsos ? ["DB-HE · HE 6 ap. 3 pto 2", "ITC-BT-52 · ap. 4"] : ["ITC-BT-10 · ap. 5.2", "ITC-BT-52 · ap. 4"],
      detalle: {
        clase: "recarga",
        ambito: otrosUsos ? "otros" : "viviendas",
        plazas: otrosUsos ? he6.plazas : plazasGaraje,
        plazasPrevision,
        porEstacion_W,
        colectivo,
        estaciones,
        indicadas: !otrosUsos && dadas !== null,
        p5_W,
        spl,
        factor,
        p_W,
        anexo2_W,
      },
    });
    partes.push({ id: "recarga", que: "Recarga del vehículo eléctrico", p_W });
  }

  // ── La carga total (ap. 3, 4 y 6) ────────────────────────────────────────
  const total_W = redondear(partes.reduce((a, x) => a + x.p_W, 0));
  const K = CRITERIOS_REBT.datos;
  // ITC-BT-10 ap. 7: monofásico hasta 14 490 W; por encima (o en un edificio), trifásico.
  const trifasica = !unifamiliar || total_W > G.monofasicoMax_W;
  const i_A = trifasica ? redondear(total_W / (Math.sqrt(3) * K.tensionTrifasica_V * K.cosPhi), 1) : redondear(total_W / G.tension_V, 1);
  elementos.push({
    id: "total",
    nombre: unifamiliar ? "Previsión de la vivienda" : "Carga total del edificio",
    tipo: "carga",
    veredicto: "dato",
    valor: { valor: total_W, unidad: "W" },
    manda: { tipo: "formula", formula: unifamiliar ? "P = la de la vivienda" : "P = viviendas + servicios + locales + garaje + recarga", resultado: { valor: total_W, unidad: "W" } },
    cita: [clasificacion === "oficinas" ? "ITC-BT-10 · ap. 4 y 6" : "ITC-BT-10 · ap. 3 y 6"],
    detalle: { clase: "total", clasificacion, partes, p_W: total_W, i_A, trifasica },
  });
  if (total_W > RESERVA_CT_REBT.datos.masDe_kW * 1000) avisos.push({ id: "centro-transformacion", tipo: "caso_especial", elementoId: "total", datos: {} });

  // ── Los contadores (ITC-BT-16 ap. 2) ─────────────────────────────────────
  const C = CONTADORES_REBT.datos;
  const desglose: { que: string; n: number }[] = [];
  if (unifamiliar) desglose.push({ que: "vivienda", n: 1 });
  else {
    if (n > 0) desglose.push({ que: n === 1 ? "vivienda" : "viviendas", n });
    if (numLocales > 0) desglose.push({ que: numLocales === 1 ? "local" : "locales", n: numLocales });
    desglose.push({ que: "servicios generales", n: 1 });
    // ITC-BT-52 ap. 3.2 b): módulos de reserva para el 20 % de las plazas no asociadas
    // a una vivienda (se supone una plaza por vivienda), al menos uno. ap. 5: el
    // contador principal del esquema colectivo va en la concentración.
    if (plazasGaraje > 0) {
      const noAsociadas = Math.max(0, plazasGaraje - (clasificacion === "viviendas" ? n : 0));
      desglose.push({ que: "reserva para la recarga", n: Math.max(1, Math.ceil(noAsociadas * R.reservaPlazasNoAsociadas - 1e-9)) });
    }
    const rc = elementos.find((x) => x.detalle.clase === "recarga")?.detalle;
    if (rc && rc.clase === "recarga" && rc.spl === "con_spl") desglose.push({ que: "recarga colectiva", n: 1 });
  }
  const nContadores = desglose.reduce((a, x) => a + x.n, 0);
  const exigeLocal = nContadores > C.localSiMasDe;
  const cuartoZona = e.zonas.find((z) => z.uso === "instalaciones" && z.zona.cuarto === "contadores_electricidad");
  const cuarto = cuartoZona ? { zonaId: cuartoZona.id, plantas: cuartoZona.plantas, niveles: cuartoZona.niveles } : null;
  const muchasPlantas = r.plantasSobreRasante + r.plantasBajoRasante > C.plantasMaxConcentracionUnica;
  const plantaOk = !cuarto || muchasPlantas || cuarto.niveles.some((nv) => nv === 0 || nv === -1);
  const libre = cuartoZona ? undefined : e.zonas.find((z) => z.uso === "instalaciones" && (z.zona.cuarto === undefined || z.zona.cuarto === "otro") && z.niveles.some((nv) => nv === 0 || nv === -1));
  const candidato = libre ? { zonaId: libre.id, plantas: libre.plantas } : null;
  const ubicacion: "cpm" | "armario" | "local" = nContadores <= 1 ? "cpm" : exigeLocal || cuarto ? "local" : "armario";
  const contadoresOk = (!exigeLocal || cuarto !== null) && plantaOk;
  elementos.push({
    id: "contadores",
    nombre: "Contadores",
    tipo: "contadores",
    veredicto: contadoresOk ? "ok" : "fail",
    valor: { valor: nContadores, unidad: nContadores === 1 ? "contador" : "contadores" },
    limite: { valor: C.localSiMasDe, unidad: "en armario" },
    manda: { tipo: "grado_tabla", tabla: "ITC-BT-16 ap. 2", entradas: [{ k: "Contadores", v: String(nContadores) }] },
    cita: [ubicacion === "cpm" ? "ITC-BT-16 · ap. 2.1" : "ITC-BT-16 · ap. 2.2"],
    detalle: { clase: "contadores", n: nContadores, desglose, ubicacion, exigeLocal, cuarto, plantaOk, candidato },
  });
  if (muchasPlantas && !unifamiliar) avisos.push({ id: "plantas", tipo: "fuera_de_alcance", elementoId: "contadores", datos: {} });

  // ── Proyecto o memoria técnica de diseño (ITC-BT-04 ap. 3.1) ─────────────
  const P = PROYECTO_REBT.datos;
  const grupos: { grupo: string; motivo: string }[] = [];
  if (unifamiliar) {
    if (total_W > P.unifamiliarMasDe_kW * 1000) grupos.push({ grupo: "f", motivo: `vivienda unifamiliar de más de ${P.unifamiliarMasDe_kW} kW` });
  } else if (total_W > P.edificioMasDe_kW * 1000) {
    grupos.push({ grupo: "e", motivo: `más de ${P.edificioMasDe_kW} kW por caja general de protección (se supone una)` });
  }
  if (garajes.length > 0) {
    if (ventGaraje === "forzada") grupos.push({ grupo: "g", motivo: "aparcamiento con ventilación forzada" });
    else if (plazasGaraje > P.garajeNaturalMasDe_plazas) grupos.push({ grupo: "h", motivo: `aparcamiento con ventilación natural de más de ${P.garajeNaturalMasDe_plazas} plazas` });
  }
  const recarga = elementos.find((x) => x.detalle.clase === "recarga")?.detalle;
  if (recarga && recarga.clase === "recarga" && recarga.p5_W > P.recargaMasDe_kW * 1000) {
    grupos.push({ grupo: "z", motivo: `infraestructura de recarga de más de ${P.recargaMasDe_kW} kW` });
  }
  elementos.push({
    id: "documentacion",
    nombre: "Documentación de la instalación",
    tipo: "documentacion",
    veredicto: "dato",
    valor: { texto: grupos.length > 0 ? "Proyecto" : "Memoria técnica de diseño" },
    manda: { tipo: "dato_de_partida", fuente: "ITC-BT-04 ap. 3.1 y 4" },
    cita: ["ITC-BT-04 · ap. 3.1 y 4"],
    detalle: {
      clase: "documentacion",
      proyecto: grupos.length > 0,
      soloAparcamiento: grupos.length > 0 && grupos.every((g) => g.grupo === "g" || g.grupo === "h"),
      grupos,
    },
  });

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return {
    elementos,
    avisos,
    veredicto,
    decisiones,
    habituales: HABITUALES_REBT,
    viviendas,
    unifamiliar,
    clasificacion,
    plazasGaraje,
    ascensor: hayAscensor,
    total_W,
  };
}
