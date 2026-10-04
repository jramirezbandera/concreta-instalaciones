// =============================================================================
// DB-HS3 — La justificación entera (feature-15, HS3): la ventilación de cada
// vivienda tipo (verificada por `calcHS3` con los caudales ya equilibrados), los
// conductos de cada vertical, el garaje y los trasteros, con el contrato de
// resultado de REDISENO-V4 §3.2.
//
// PURA y DETERMINISTA. No redacta: devuelve elementos y avisos en datos; la
// prosa la ponen `textos.ts` y `memoria.ts`.
//
// Cada elemento pertenece a una PARTE del dibujo: una vivienda tipo («a») o el
// garaje y los trasteros («garaje»).
// =============================================================================

import type { Aviso, ElementoResultado } from "../../lib/cte/resultado";
import type { Edificio } from "../../lib/edificio/tipos";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import { calcHS3, seccionPorTramo, type HS3Result, type ResultadoEstancia, type SistemaVentilacion } from "./calc";
import type { Hs3Estado } from "./estado";
import { generarRedHs3, type GarajeVentilacion, type LocalHs3, type RedHs3, type TipoVentilacion, type TrasterosVentilacion } from "./red";
import {
  AREA_EFECTIVA_ABERTURAS,
  CAUDALES_NO_HABITABLES,
  claseTiroDe,
  COCCION_MIN,
  CRITERIOS_HS3,
  GARAJE_HS3,
  HIBRIDA_CONDUCTOS,
  SECCION_CONDUCTO_MECANICA,
  type ClaseTiro,
  type ConductoSeccion,
  type ZonaTermica,
} from "./tablas";

/** Un conducto colectivo de una vertical: el de un local húmedo apilado. */
export interface ConductoHs3 {
  /** Local de la vivienda tipo («cocina», «bano-1»). */
  localId: string;
  nombre: string;
  plantas: number;
  /** Lo que lleva en la boca: plantas × caudal del local [l/s]. */
  qvt_l_s: number;
  /** Sección mínima [cm²]. */
  seccion_cm2: number;
  /** Mecánica: el Ø circular que la cubre (serie de criterio). Híbrida: null. */
  diametro_mm: number | null;
  /** Híbrida: la celda de la Tabla 4.2 y la clase de tiro. */
  conductos: ConductoSeccion[] | null;
  claseTiro: ClaseTiro | null;
}

export type DetalleHs3 =
  | { clase: "local"; tipo: TipoVentilacion; local: LocalHs3; resultado: ResultadoEstancia }
  | { clase: "campana"; tipo: TipoVentilacion; caudal_l_s: number }
  | { clase: "paso"; tipo: TipoVentilacion; pasos: { local: LocalHs3; area_cm2: number }[] }
  | { clase: "equilibrio"; tipo: TipoVentilacion; calc: HS3Result }
  | {
      clase: "conductos";
      tipo: TipoVentilacion;
      sistema: SistemaVentilacion;
      conductos: ConductoHs3[];
      /** El que manda (el más cargado). */
      manda: ConductoHs3;
      zona: ZonaTermica;
    }
  | { clase: "garaje"; garaje: GarajeVentilacion; sistema: "mecanica" | "natural"; trasteros: TrasterosVentilacion[] }
  | {
      clase: "aberturas_garaje";
      garaje: GarajeVentilacion;
      sistema: "mecanica" | "natural";
      /** Mecánica: pares de aberturas (admisión + extracción); natural: área mixta por fachada. */
      pares: number;
      mixtasPorFachada_cm2: number;
      redes: number;
      pequeno: boolean;
    }
  | { clase: "co"; garaje: GarajeVentilacion; exigida: boolean; ppm: number }
  | { clase: "trasteros"; trasteros: TrasterosVentilacion; garaje: GarajeVentilacion | null };

export interface ElementoHs3 extends ElementoResultado {
  nombre: string;
  /** La parte del dibujo: el id de un tipo («a») o «garaje». */
  parte: string;
  detalle: DetalleHs3;
}

export interface ParteHs3 {
  id: string;
  /** «Vivienda A · T3», «Garaje y trasteros». */
  nombre: string;
}

export interface JustificacionHs3 {
  red: RedHs3;
  zona: ZonaTermica;
  /** `calcHS3` de cada vivienda tipo, por id de tipo. */
  porTipo: Map<string, HS3Result>;
  partes: ParteHs3[];
  elementos: ElementoHs3[];
  avisos: Aviso[];
  veredicto: Veredicto;
}

// -----------------------------------------------------------------------------

/** Id de la parte de un tipo: su nombre en minúsculas («a», «u»). */
export function parteDeTipo(t: Pick<TipoVentilacion, "nombre">): string {
  return (
    t.nombre
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "tipo"
  );
}

/** El Ø circular más pequeño de la serie cuya sección cubre `s` [cm²]. */
function diametroPara(s_cm2: number): number {
  for (const d of CRITERIOS_HS3.serieConductos_mm) {
    if ((Math.PI * (d / 10) ** 2) / 4 >= s_cm2 - 1e-9) return d;
  }
  return CRITERIOS_HS3.serieConductos_mm[CRITERIOS_HS3.serieConductos_mm.length - 1];
}

function conductosDe(t: TipoVentilacion, sistema: SistemaVentilacion, zona: ZonaTermica): ConductoHs3[] {
  const plantas = Math.max(1, ...t.verticales.map((v) => v.plantas));
  return t.locales
    .filter((l) => l.humedo)
    .map((l) => {
      const qvt = plantas * l.adoptado_l_s;
      if (sistema === "mecanica") {
        const s = SECCION_CONDUCTO_MECANICA.datos.contiguoHabitable_cm2_por_l_s * qvt;
        return {
          localId: l.id,
          nombre: l.nombre,
          plantas,
          qvt_l_s: qvt,
          seccion_cm2: s,
          diametro_mm: diametroPara(s),
          conductos: null,
          claseTiro: null,
        };
      }
      const clase = claseTiroDe(plantas, zona);
      const { celda } = seccionPorTramo(qvt, clase);
      return {
        localId: l.id,
        nombre: l.nombre,
        plantas,
        qvt_l_s: qvt,
        seccion_cm2: celda.area_cm2,
        diametro_mm: null,
        conductos: celda.conductos.map((c) => ({ ...c })),
        claseTiro: clase,
      };
    });
}

// -----------------------------------------------------------------------------
// Justificación
// -----------------------------------------------------------------------------

export function justificarHs3(estado: Hs3Estado, edificio: Edificio): JustificacionHs3 {
  const red = generarRedHs3(edificio, estado);
  const d = red.decisiones;
  const zona = estado.zonaTermica;
  const elementos: ElementoHs3[] = [];
  const avisos: Aviso[] = [];
  const porTipo = new Map<string, HS3Result>();
  const partes: ParteHs3[] = [];
  const t41 = AREA_EFECTIVA_ABERTURAS.datos;

  // ── Viviendas, tipo a tipo ─────────────────────────────────────────────────
  for (const t of red.tipos) {
    const parte = parteDeTipo(t);
    const prefijo = red.unifamiliar ? "" : `${parte}-`;
    partes.push({
      id: parte,
      nombre: red.unifamiliar ? "Vivienda" : `Vivienda ${t.nombre} · T${t.dormitorios}`,
    });
    const plantas = Math.max(1, ...t.verticales.map((v) => v.plantas));
    const calc = calcHS3({
      numDormitorios: t.dormitorios,
      estancias: t.estancias,
      zonaTermica: zona,
      numPlantasConducto: plantas,
      sistema: d.sistema,
    });
    porTipo.set(t.tipoId, calc);
    const porId = new Map(calc.porEstancia.map((e) => [e.id, e]));

    for (const l of t.locales) {
      const r = porId.get(l.id)!;
      const sube = l.adoptado_l_s - l.minimo_l_s > 1e-9;
      elementos.push({
        id: `${prefijo}${l.id}`,
        nombre: l.nombre,
        parte,
        tipo: l.humedo ? "extraccion" : "admision",
        veredicto: r.cumple ? "ok" : "fail",
        valor: { valor: l.adoptado_l_s, unidad: "l/s" },
        limite: { valor: l.minimo_l_s, unidad: "l/s" },
        manda: sube
          ? l.humedo && l.conTotal_l_s - l.minimo_l_s > 1e-9 && t.equilibrado.aumenta !== "extraccion"
            ? {
                tipo: "capacidad_tabla",
                tabla: "Tabla 2.1 · total de húmedos",
                recibe: { valor: t.equilibrado.saleTabla_l_s, unidad: "l/s" },
                admite: { valor: l.adoptado_l_s, unidad: "l/s" },
              }
            : { tipo: "equilibrado", entra: t.equilibrado.entraTabla_l_s, sale: t.equilibrado.saleTabla_l_s }
          : {
              tipo: "capacidad_tabla",
              tabla: "Tabla 2.1",
              recibe: { valor: l.minimo_l_s, unidad: "l/s" },
              admite: { valor: l.adoptado_l_s, unidad: "l/s" },
            },
        cita: ["HS 3 · ap. 2 pto 3 · tabla 2.1", "tabla 4.1"],
        detalle: { clase: "local", tipo: t, local: l, resultado: r },
      });
    }

    const cocina = porId.get("cocina");
    if (cocina?.esCoccion) {
      elementos.push({
        id: `${prefijo}campana`,
        nombre: "Campana",
        parte,
        tipo: "coccion",
        veredicto: cocina.cumpleCoccion ? "ok" : "fail",
        valor: { valor: cocina.caudalCoccion_l_s ?? 0, unidad: "l/s" },
        limite: { valor: COCCION_MIN.datos.caudalMin_l_s, unidad: "l/s" },
        manda: { tipo: "decision_proyectista", decision: "coccion" },
        cita: ["HS 3 · ap. 2 pto 4", "ap. 3.1.1 pto 3"],
        detalle: { clase: "campana", tipo: t, caudal_l_s: cocina.caudalCoccion_l_s ?? 0 },
      });
    }

    const pasos = t.locales.map((l) => ({ local: l, area_cm2: porId.get(l.id)!.areaPaso_cm2 }));
    elementos.push({
      id: `${prefijo}paso`,
      nombre: "Aberturas de paso",
      parte,
      tipo: "paso",
      veredicto: "ok",
      valor: { valor: calc.areaPaso_cm2, unidad: "cm²" },
      limite: { valor: t41.pasoMin_cm2, unidad: "cm²" },
      manda: {
        tipo: "formula",
        formula: "máx(70, 8·qvp)",
        resultado: { valor: calc.areaPaso_cm2, unidad: "cm²" },
      },
      cita: ["HS 3 · ap. 4.1 · tabla 4.1"],
      detalle: { clase: "paso", tipo: t, pasos },
    });

    elementos.push({
      id: `${prefijo}equilibrio`,
      nombre: "Equilibrio",
      parte,
      tipo: "equilibrio",
      veredicto: calc.balanceOk && calc.humedosTotalOk ? "ok" : "fail",
      valor: { valor: t.equilibrado.equilibrado_l_s, unidad: "l/s" },
      manda: { tipo: "equilibrado", entra: t.equilibrado.entraTabla_l_s, sale: t.equilibrado.saleTabla_l_s },
      cita: ["HS 3 · ap. 3.1.1", "tabla 2.1"],
      detalle: { clase: "equilibrio", tipo: t, calc },
    });

    const conductos = conductosDe(t, d.sistema, zona);
    if (conductos.length > 0) {
      const manda = conductos.reduce((a, b) => (b.seccion_cm2 > a.seccion_cm2 ? b : a));
      const excede = d.sistema === "hibrida" && plantas > HIBRIDA_CONDUCTOS.datos.colectivoMaxPlantas;
      elementos.push({
        id: `${prefijo}conductos`,
        nombre: "Conductos",
        parte,
        tipo: "conducto",
        veredicto: excede ? "fail" : "ok",
        valor:
          manda.diametro_mm !== null
            ? { valor: manda.diametro_mm, unidad: "mm" }
            : { valor: manda.seccion_cm2, unidad: "cm²" },
        manda:
          d.sistema === "mecanica"
            ? { tipo: "formula", formula: "S ≥ 2,5·qvt", resultado: { valor: manda.seccion_cm2, unidad: "cm²" } }
            : {
                tipo: "capacidad_tabla",
                tabla: "Tabla 4.2",
                recibe: { valor: manda.qvt_l_s, unidad: "l/s" },
                admite: { valor: manda.seccion_cm2, unidad: "cm²" },
              },
        cita:
          d.sistema === "mecanica"
            ? ["HS 3 · ap. 4.2.2 · fórmula 4.1"]
            : ["HS 3 · ap. 4.2.1 · tablas 4.2 a 4.4", "ap. 3.2.3"],
        detalle: { clase: "conductos", tipo: t, sistema: d.sistema, conductos, manda, zona },
      });
      if (d.sistema === "hibrida" && plantas > HIBRIDA_CONDUCTOS.datos.ultimasPlantasIndividuales) {
        avisos.push({
          id: `${prefijo}hibrida-ultimas-plantas`,
          tipo: "caso_especial",
          elementoId: `${prefijo}conductos`,
          datos: { tipo: t.nombre, plantas },
        });
      }
    }
  }

  // ── Garajes ────────────────────────────────────────────────────────────────
  const g = GARAJE_HS3.datos;
  if (red.garajes.length > 0 || red.trasteros.length > 0) {
    partes.push({ id: "garaje", nombre: red.trasteros.length > 0 ? "Garaje y trasteros" : "Garaje" });
  }
  for (const ga of red.garajes) {
    const tras = red.trasteros.filter((x) => x.conGarajeId === ga.id);
    elementos.push({
      id: ga.id,
      nombre: d.garaje === "mecanica" ? "Extracción del garaje" : "Ventilación del garaje",
      parte: "garaje",
      tipo: "garaje",
      veredicto: "ok",
      valor: { valor: ga.caudal_l_s, unidad: "l/s" },
      manda: {
        tipo: "caudal_por_unidad",
        tabla: "Tabla 2.2",
        unidades: { valor: ga.plazas, unidad: "plazas" },
        porUnidad: { valor: CAUDALES_NO_HABITABLES.datos.aparcamiento_l_s_plaza, unidad: "l/s" },
      },
      cita: ["HS 3 · ap. 2 pto 6 · tabla 2.2", "ap. 3.1.4"],
      detalle: { clase: "garaje", garaje: ga, sistema: d.garaje, trasteros: tras },
    });
    const pequeno = ga.plazas <= g.coUmbralPlazas && ga.superficie_m2 <= g.coUmbralSuperficie_m2;
    const pares = Math.max(1, Math.ceil(ga.superficie_m2 / g.mecSuperficiePorParAberturas_m2));
    const redes = ga.plazas >= g.mecPlazasDosRedes ? 2 : 1;
    elementos.push({
      id: `${ga.id}-aberturas`,
      nombre: d.garaje === "mecanica" ? "Aberturas y redes" : "Aberturas mixtas",
      parte: "garaje",
      tipo: "aberturas",
      veredicto: "ok",
      valor:
        d.garaje === "mecanica"
          ? { texto: `${pares} + ${pares}` }
          : { valor: ga.plazas * g.mixtasPorFachada_cm2_por_plaza, unidad: "cm²" },
      manda:
        d.garaje === "mecanica"
          ? {
              tipo: "caudal_por_unidad",
              tabla: "ap. 3.1.4.2",
              unidades: { valor: ga.superficie_m2, unidad: "m²" },
              porUnidad: { valor: g.mecSuperficiePorParAberturas_m2, unidad: "m²" },
            }
          : {
              tipo: "formula",
              formula: "8·qv en cada fachada",
              resultado: { valor: ga.plazas * g.mixtasPorFachada_cm2_por_plaza, unidad: "cm²" },
            },
      cita: d.garaje === "mecanica" ? ["HS 3 · ap. 3.1.4.2"] : ["HS 3 · ap. 3.1.4.1 · tabla 4.1 nota 1"],
      detalle: {
        clase: "aberturas_garaje",
        garaje: ga,
        sistema: d.garaje,
        pares,
        mixtasPorFachada_cm2: ga.plazas * g.mixtasPorFachada_cm2_por_plaza,
        redes,
        pequeno,
      },
    });
    const exigida = ga.plazas > g.coUmbralPlazas || ga.superficie_m2 > g.coUmbralSuperficie_m2;
    elementos.push({
      id: `${ga.id}-co`,
      nombre: "Detección de monóxido",
      parte: "garaje",
      tipo: "co",
      veredicto: "ok",
      valor: { texto: exigida ? "Sí" : "No exigida" },
      manda: {
        tipo: "caudal_por_unidad",
        tabla: "ap. 3.1.4.2",
        unidades: { valor: ga.plazas, unidad: "plazas" },
        porUnidad: { valor: g.coUmbralPlazas, unidad: "plazas" },
      },
      cita: ["HS 3 · ap. 3.1.4.2"],
      detalle: { clase: "co", garaje: ga, exigida, ppm: g.coPpmSinEmpleados },
    });
    if (d.garaje === "natural" && ga.bajoRasante) {
      avisos.push({ id: `${ga.id}-natural`, tipo: "supuesto", elementoId: `${ga.id}-aberturas`, datos: { plazas: ga.plazas } });
    }
  }

  // ── Trasteros ──────────────────────────────────────────────────────────────
  for (const tr of red.trasteros) {
    const garaje = red.garajes.find((x) => x.id === tr.conGarajeId) ?? null;
    elementos.push({
      id: tr.id,
      nombre: "Extracción de los trasteros",
      parte: "garaje",
      tipo: "trasteros",
      veredicto: "ok",
      valor: { valor: tr.caudal_l_s, unidad: "l/s" },
      manda: {
        tipo: "caudal_por_unidad",
        tabla: "Tabla 2.2",
        unidades: { valor: tr.superficie_m2, unidad: "m²" },
        porUnidad: { valor: CAUDALES_NO_HABITABLES.datos.trasteros_l_s_m2, unidad: "l/s" },
      },
      cita: ["HS 3 · ap. 2 pto 6 · tabla 2.2", garaje ? "ap. 3.1.4.2 pto 1" : "ap. 3.1.3"],
      detalle: { clase: "trasteros", trasteros: tr, garaje },
    });
  }

  let veredicto: Veredicto = elementos.length === 0 ? "neutral" : "ok";
  if (elementos.some((e) => e.veredicto === "fail")) veredicto = "fail";

  return { red, zona, porTipo, partes, elementos, avisos, veredicto };
}
