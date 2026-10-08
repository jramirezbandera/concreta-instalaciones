// =============================================================================
// DB-HR — La justificación por la opción simplificada (feature-25): cada
// elemento que forma los recintos, con la solución elegida, lo que pide su tabla
// y si cumple. PURA y DETERMINISTA; no redacta.
//
// Qué se comprueba (research/verificacion-hr.md, K-HR.16, K-HR.21 y K-HR.22):
//   - plurifamiliar: tabiquería (tabla 3.1); separaciones verticales con otras
//     viviendas y la zona común (tabla 3.2) y con un recinto de actividad o de
//     instalaciones (entre paréntesis); la puerta de entrada; el ascensor; los
//     forjados entre viviendas, sobre la zona común, sobre o bajo un recinto de
//     actividad (tabla 3.3); la medianería (RA ≥ 45); fachada y cubierta;
//   - unifamiliar aislada: tabiquería RA ≥ 33, fachada y cubierta;
//   - adosada (Anejo I): con estructura independiente, tabiquería RA ≥ 33 y dos
//     hojas de RA ≥ 45; compartida, tabla 3.1, tabla 3.2 y tabla I.1;
//   - siempre, las condiciones de uniones e instalaciones (3.1.4 y 3.3), que se
//     declaran.
//
// La fachada, la ventana, la cubierta y el forjado son los de El edificio
// (feature-26). Con la planta baja distinta, su fachada y su ventana se
// comprueban con los recintos de la planta 0 y la general con los demás
// (K-CER.1); los flancos de las separaciones, con la fachada general.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { cerramientosDe } from "../../lib/constructivo/cerramientos";
import { plantasDe } from "../../lib/edificio/derivar";
import {
  CAPIALZADOS,
  dRASuelo,
  dRATecho,
  dRATrasdosado,
  FRACCION_CAJA,
  RAtrCubierta,
  solucionDe,
  valor,
  type Capialzado,
  type SolBase,
  type SolTabiqueria,
} from "../../lib/constructivo/catalogo";
import {
  columnaHorizontal,
  columnaVertical,
  comprobarAdosada,
  comprobarFachada,
  comprobarHorizontal,
  comprobarVertical,
  flancosHorizontal,
  type Condicion,
  type FachadaFlanco,
  type ResultadoAdosada,
  type ResultadoFachada,
  type ResultadoHorizontal,
  type ResultadoVertical,
} from "./comprobar";
import { separacionesHr, type Colindante, type SeparacionesHr, type Tipologia } from "./edificio";
import { conValoresPropios, HUECOS_SUPUESTOS, hrEstadoDefaults, numero, propio, type Eleccion, type HrEstado, type ModoAscensor } from "./estado";
import { EXTERIOR_HR, exigenciaExterior, LIMITES_HR, mixto, TABIQUERIA_HR, type ColumnaHorizontal, type TipoTabiqueria } from "./tablas";

const L = LIMITES_HR.datos;

/** El tipo de tabiquería de la tabla 3.1: el material y, si es de fábrica, cómo apoya. */
function tipoTabiqueria(s: SolTabiqueria, apoyo: "directo" | "bandas"): TipoTabiqueria {
  return s.material === "entramado" ? "entramado" : apoyo === "bandas" ? "bandas" : "apoyo";
}

/** Una solución resuelta, para los textos: su nombre, su código del CEC y si lleva valores propios. */
export interface SolucionUsada {
  nombre: string;
  codigo: string;
  pagina: number;
  propios: boolean;
  industrial: boolean;
}

export type CasoHorizontal = "viviendas" | "comun" | "actividad" | "encima";

export type DetalleHr =
  | { clase: "tabiqueria"; sol: SolucionUsada; tipo: TipoTabiqueria; m: number; RA: number; regla: "tabla" | "minimo"; exigeM: number | null; exigeRA: number }
  | {
      clase: "vertical";
      caso: "unidades" | "actividad";
      separa: string[];
      sol: SolucionUsada;
      tipo: 1 | 2 | 3;
      m: number;
      RA: number;
      trasdosado: (SolucionUsada & { dRA: number; unaCara: boolean }) | null;
      columna: "fabrica" | "entramado";
      r: ResultadoVertical;
    }
  | {
      clase: "horizontal";
      caso: CasoHorizontal;
      separa: string[];
      forjado: SolucionUsada & { m: number; RA: number; eps: boolean };
      suelo: SolucionUsada & { dLw: number; dRA: number };
      techo: (SolucionUsada & { dRA: number }) | null;
      columna: ColumnaHorizontal;
      garaje: boolean;
      r: ResultadoHorizontal;
      flancos: Condicion[];
    }
  | { clase: "medianeria"; sol: SolucionUsada; RA: number; exige: number }
  | { clase: "adosada"; sol: SolucionUsada; RA: number; exige: number }
  | { clase: "forjado-adosada"; forjado: SolucionUsada & { m: number; RA: number; eps: boolean }; suelo: SolucionUsada & { dLw: number; dRA: number }; tipo: 1 | 2 | 3; r: ResultadoAdosada }
  | {
      clase: "exterior";
      recinto: "dormitorios" | "estancias" | "administrativo" | "cubierta";
      ldZona: number;
      ldSupuesto: boolean;
      ld: number;
      aeronaves: boolean;
      noExpuesta: boolean;
      D: number;
      pct: number;
      pctSupuesto: boolean;
      ciega: SolucionUsada & { RAtr: number };
      hueco: (SolucionUsada & { ventanaRAtr: number; caja: { codigo: string; RAtr: number } | null; RAtr: number }) | null;
      r: ResultadoFachada;
    }
  | { clase: "puerta"; abre: "vestibulo" | "estancia"; exige: number; RA: number | null; cerramientoRA: number }
  | { clase: "ascensor"; modo: ModoAscensor; habitual: boolean; RA: number; r: ResultadoVertical | null }
  | { clase: "instalaciones"; ascensor: boolean; condiciones: string[] };

export type ElementoHr = ElementoSi<DetalleHr>;

export interface JustificacionHr extends JustificacionSiBase {
  elementos: ElementoHr[];
  aplica: boolean;
  tipologia: Tipologia;
  separaciones: SeparacionesHr;
  /** La tabiquería, para las columnas de las tablas. */
  tabiqueria: TipoTabiqueria;
  ld: { valor: number; supuesto: boolean; aeronaves: boolean };
  medios: boolean;
}

// ── Resolver las soluciones ─────────────────────────────────────────────────

function usada(s: { nombre: string; codigo: string; pagina: number; industrial?: boolean }, e: Eleccion | null | undefined): SolucionUsada {
  return { nombre: s.nombre, codigo: s.codigo, pagina: s.pagina, propios: conValoresPropios(e), industrial: s.industrial === true };
}

function base(e: Eleccion, medios: boolean) {
  const s = solucionDe("base", e.id);
  return { s, m: propio(e, "m") ?? valor(s.m, medios), RA: propio(e, "RA") ?? valor(s.RA, medios), u: usada(s, e) };
}

function trasdosado(e: Eleccion | null, mBase: number, unaCara: boolean) {
  if (!e) return null;
  const s = solucionDe("trasdosado", e.id);
  return { ...usada(s, e), dRA: propio(e, "dRA") ?? dRATrasdosado(s, mBase), unaCara };
}

function forjado(e: Eleccion) {
  const s = solucionDe("forjado", e.id);
  return { ...usada(s, e), m: propio(e, "m") ?? s.m, RA: propio(e, "RA") ?? s.RA, eps: s.eps === true };
}

function suelo(e: Eleccion, mForjado: number) {
  const s = solucionDe("suelo", e.id);
  return { ...usada(s, e), dLw: propio(e, "dLw") ?? s.dLw, dRA: propio(e, "dRA") ?? dRASuelo(s, mForjado) };
}

function techo(e: Eleccion | null, mForjado: number) {
  if (!e) return null;
  const s = solucionDe("techo", e.id);
  return { ...usada(s, e), dRA: propio(e, "dRA") ?? dRATecho(s, mForjado) };
}

function fachada(e: Eleccion, medios: boolean): { flanco: FachadaFlanco; ciega: SolucionUsada & { RAtr: number } } {
  const s = solucionDe("fachada", e.id);
  return {
    flanco: {
      clase: s.clase,
      interior: s.interior,
      aislExterior: s.aislExterior,
      principal: { m: propio(e, "m") ?? s.principal.m, RA: propio(e, "RA") ?? s.principal.RA },
      hojaInterior: s.hojaInterior ?? null,
    },
    ciega: { ...usada(s, e), RAtr: propio(e, "RAtr") ?? valor(s.RAtr, medios) },
  };
}

function hueco(ventana: Eleccion, caja: Capialzado) {
  const s = solucionDe("ventana", ventana.id);
  const ventanaRAtr = propio(ventana, "RAtr") ?? s.RAtr;
  const cp = caja === "no" ? null : { codigo: CAPIALZADOS[caja].codigo, RAtr: CAPIALZADOS[caja].RAtr };
  const RAtr = cp ? mixto([{ fraccion: 1 - FRACCION_CAJA, R: ventanaRAtr }, { fraccion: FRACCION_CAJA, R: cp.RAtr }]) : ventanaRAtr;
  return { ...usada(s, ventana), ventanaRAtr, caja: cp, RAtr };
}

/** Una fachada con su ventana, y las plantas cuyos recintos protegidos dan a ella. */
export interface GrupoExterior {
  /** "" para la general (o la única); "-pb" para la de la planta baja. */
  sufijo: "" | "-pb";
  fachada: Eleccion;
  ventana: Eleccion;
}

/**
 * La fachada y la ventana de El edificio con las que se comprueba el ruido
 * exterior: la general y, si la planta baja es distinta y tiene recintos
 * protegidos (viviendas; despachos en un edificio sin viviendas), la suya
 * (K-CER.1). Si solo la planta baja los tiene, la suya es la única.
 */
export function gruposExterior(p: ProyectoSi, tipologia: Tipologia): GrupoExterior[] {
  const c = cerramientosDe(p.edificio);
  const general = { fachada: c.fachada.eleccion, ventana: c.ventana.eleccion };
  const pb = { fachada: c.fachadaPB?.eleccion ?? general.fachada, ventana: c.ventanaPB?.eleccion ?? general.ventana };
  const clave = (x: { fachada: Eleccion; ventana: Eleccion }) =>
    JSON.stringify([x.fachada.id, x.fachada.valores ?? null, x.ventana.id, x.ventana.valores ?? null]);
  const protegido = (uso: string) => (tipologia === "otros" ? uso === "oficinas" : uso === "viviendas" || uso === "vivienda_unifamiliar");
  const niveles = plantasDe(p.edificio)
    .filter((pl) => pl.zonas.some((z) => protegido(z.uso)))
    .map((pl) => pl.nivel);
  const conPB = niveles.includes(0);
  if (!conPB || clave(pb) === clave(general)) return [{ sufijo: "", ...general }];
  if (niveles.every((n) => n === 0)) return [{ sufijo: "", ...pb }];
  return [
    { sufijo: "", ...general },
    { sufijo: "-pb", ...pb },
  ];
}

/** El Ld de la zona: el de los datos de la obra o los 60 dBA del DB sin datos oficiales. */
export function ldDe(p: ProyectoSi): { valor: number; supuesto: boolean; aeronaves: boolean } {
  const dado = numero(p.datosGenerales.ldZona);
  return { valor: dado ?? EXTERIOR_HR.datos.ldSinDatos, supuesto: dado === null, aeronaves: p.datosGenerales.aeronaves === true };
}

const nombres = (cs: readonly Colindante[]) => cs.map((c) => c.nombre);

// ── La justificación ────────────────────────────────────────────────────────

export function justificarHr(estado: HrEstado, p: ProyectoSi, comparar = true): JustificacionHr {
  const st: HrEstado = { ...hrEstadoDefaults, ...estado };
  const medios = st.medios === true;
  const sep = separacionesHr(p, st.colindancias ?? {});
  const tipologia = sep.tipologia;
  const elementos: ElementoHr[] = [];
  const avisos: Aviso[] = [];
  const ld = ldDe(p);
  const aplica = p.datosGenerales.intervencion === "obra_nueva";

  // ── Soluciones ─────────────────────────────────────────────────────────────
  const tabS = solucionDe("tabiqueria", st.tabiqueria.id);
  const tab = tipoTabiqueria(tabS, st.apoyo);
  const cer = cerramientosDe(p.edificio);
  const grupos = gruposExterior(p, tipologia);
  // Los flancos de las separaciones, con la fachada general (criterio).
  const fa = fachada(grupos[0].fachada, medios);
  const fj = forjado(cer.forjado.eleccion);
  const sf = suelo(st.suelo, fj.m);
  const ts = techo(st.techo, fj.m);
  const tsBajo = techo(st.techoBajo, fj.m);
  const sv = base(st.separacion, medios);
  const svTr = sv.s.tipo === 1 ? trasdosado(st.trasdosado, sv.m, st.unaCara) : null;
  const sa = base(st.separacionActividad, medios);
  const saTr = sa.s.tipo === 1 ? trasdosado(st.trasdosadoActividad, sa.m, st.unaCaraActividad) : null;
  const colV = columnaVertical(tab, fa.flanco);
  const colH = columnaHorizontal(tab, fa.flanco);

  const RA_conjunto = (b: { RA: number }, tr: { dRA: number } | null) => b.RA + (tr ? tr.dRA : 0);

  // ── Tabiquería (tabla 3.1; RA ≥ 33 en la aislada y la adosada independiente) ──
  const tabM = propio(st.tabiqueria, "m") ?? valor(tabS.m, medios);
  const tabRA = propio(st.tabiqueria, "RA") ?? valor(tabS.RA, medios);
  const soloMinimo = tipologia === "aislada" || (tipologia === "adosada" && st.estructura === "independiente");
  const T = TABIQUERIA_HR.datos[tab];
  const tabOk = soloMinimo ? tabRA >= L.tabiqueriaRA : tabM >= T.m && tabRA >= T.RA;
  if (tipologia !== "otros") elementos.push({
    id: "tabiqueria",
    nombre: "Tabiquería",
    tipo: "ruido",
    veredicto: tabOk ? "ok" : "fail",
    valor: { valor: tabRA, unidad: "dBA" },
    limite: { valor: soloMinimo ? L.tabiqueriaRA : T.RA, unidad: "dBA" },
    manda: soloMinimo
      ? { tipo: "formula", formula: "RA de la tabiquería ≥ 33 dBA", resultado: { valor: L.tabiqueriaRA, unidad: "dBA" } }
      : { tipo: "grado_tabla", tabla: "Tabla 3.1", entradas: [{ k: "Tipo", v: tab }, { k: "m", v: `${T.m} kg/m²` }, { k: "RA", v: `${T.RA} dBA` }] },
    cita: [soloMinimo ? (tipologia === "adosada" ? "HR · Anejo I.1.1" : "HR · ap. 2.1.1 a) i") : "HR · tabla 3.1", "HR · ap. 3.1.2.3.3"],
    detalle: { clase: "tabiqueria", sol: usada(tabS, st.tabiqueria), tipo: tab, m: tabM, RA: tabRA, regla: soloMinimo ? "minimo" : "tabla", exigeM: soloMinimo ? null : T.m, exigeRA: soloMinimo ? L.tabiqueriaRA : T.RA },
  });

  const vertical = (id: string, nombre: string, caso: "unidades" | "actividad", separa: string[], b: ReturnType<typeof base>, tr: ReturnType<typeof trasdosado>, instalaciones: boolean, tsVal: number) => {
    const r = comprobarVertical({
      tipo: b.s.tipo,
      m: b.m,
      RA: b.RA,
      dRA: tr ? tr.dRA : null,
      unaCara: tr?.unaCara ?? false,
      columna: colV,
      tabiqueria: tab,
      paren: caso === "actividad",
      instalaciones,
      forjadoM: fj.m,
      sueloDRA: sf.dRA,
      techoDRA: tsVal,
      fachada: fa.flanco,
      bandas: (b.s as SolBase).bandas,
    });
    elementos.push({
      id,
      nombre,
      tipo: "ruido",
      veredicto: r.cumple ? "ok" : "fail",
      valor: { valor: b.RA, unidad: "dBA" },
      ...(r.fila ? { limite: { valor: r.fila.RA, unidad: "dBA" } } : {}),
      manda: {
        tipo: "grado_tabla",
        tabla: "Tabla 3.2",
        entradas: [
          { k: "Tipo", v: String(b.s.tipo) },
          { k: "Fila", v: r.fila ? `${r.fila.m} kg/m² · ${r.fila.RA} dBA` : "ninguna" },
          { k: "Tabiquería", v: colV === "fabrica" ? "fábrica" : "entramado" },
        ],
      },
      cita: ["HR · tabla 3.2", "HR · ap. 3.1.2.3.4"],
      detalle: { clase: "vertical", caso, separa, sol: b.u, tipo: b.s.tipo, m: b.m, RA: b.RA, trasdosado: tr, columna: colV, r },
    });
    return r;
  };

  const horizontal = (id: string, nombre: string, caso: CasoHorizontal, separa: string[], garaje: boolean, t: ReturnType<typeof techo>) => {
    const r = comprobarHorizontal({
      forjado: fj,
      columna: colH,
      caso: caso === "actividad" || caso === "encima" ? "paren" : "normal",
      // Bajo la vivienda: el suelo flotante de la vivienda, con el ΔLw sin paréntesis (Guía R.2).
      // Encima de la vivienda, un recinto de actividad: el ΔLw entre paréntesis (2.1.2 a.ii).
      dLw: caso === "encima" ? "paren" : "normal",
      garaje,
      sueloDLw: sf.dLw,
      sueloDRA: sf.dRA,
      techoDRA: t?.dRA ?? 0,
    });
    const flancos = flancosHorizontal(colH, tab, fa.flanco);
    const ok = r.cumple && flancos.every((c) => c.cumple !== false);
    elementos.push({
      id,
      nombre,
      tipo: "ruido",
      veredicto: ok ? "ok" : "fail",
      valor: { valor: sf.dLw, unidad: "dB" },
      ...(r.dLwExigido !== null ? { limite: { valor: r.dLwExigido, unidad: "dB" } } : {}),
      manda: {
        tipo: "grado_tabla",
        tabla: "Tabla 3.3",
        entradas: [
          { k: "Forjado", v: r.fila ? `${r.fila.m} kg/m² · ${r.fila.RA} dBA` : "ninguno" },
          { k: "Columna", v: colH },
          { k: "Fila", v: caso === "actividad" || caso === "encima" ? "entre paréntesis" : "normal" },
        ],
      },
      cita: ["HR · tabla 3.3", caso === "actividad" || caso === "comun" ? "HR · ap. 3.1.2.3.5 pto 3" : "HR · ap. 3.1.2.3.5 pto 2"],
      detalle: { clase: "horizontal", caso, separa, forjado: fj, suelo: sf, techo: t, columna: colH, garaje, r, flancos },
    });
  };

  // ── Plurifamiliar ──────────────────────────────────────────────────────────
  if (tipologia === "plurifamiliar") {
    const separa = [...(sep.entreViviendas.length > 0 ? [`otras viviendas (${sep.entreViviendas.join(", ")})`] : []), ...nombres(sep.conComun)];
    if (separa.length > 0 || sep.ascensor) vertical("separacion", "Entre viviendas y con la zona común", "unidades", separa.length > 0 ? separa : ["la zona común"], sv, svTr, false, 0);
    if (sep.conActividad.length > 0) {
      const inst = sep.conActividad.some((c) => c.clase === "instalaciones");
      vertical("separacion-actividad", "Con locales, garaje e instalaciones", "actividad", nombres(sep.conActividad), sa, saTr, inst, tsBajo?.dRA ?? 0);
    }

    // La puerta de entrada (3.1.2.3.4 pto 4) y el cerramiento en que va (≥ 50).
    const exigePuerta = st.puertaAbre === "estancia" ? L.puertaProtegidoRA : L.puertaHabitableRA;
    const puertaRA = numero(st.puertaRA);
    const cerramientoRA = RA_conjunto(sv, svTr);
    const puertaOk = (puertaRA === null || puertaRA >= exigePuerta) && cerramientoRA >= L.cerramientoConPuertaRA;
    elementos.push({
      id: "puerta",
      nombre: "Puerta de entrada a la vivienda",
      tipo: "ruido",
      veredicto: !puertaOk ? "fail" : puertaRA === null ? "dato" : "ok",
      valor: puertaRA === null ? { texto: `RA ≥ ${exigePuerta} dBA` } : { valor: puertaRA, unidad: "dBA" },
      limite: { valor: exigePuerta, unidad: "dBA" },
      manda: { tipo: "formula", formula: `puerta RA ≥ ${exigePuerta} dBA y cerramiento RA ≥ ${L.cerramientoConPuertaRA} dBA`, resultado: { valor: exigePuerta, unidad: "dBA" } },
      cita: ["HR · ap. 3.1.2.3.4 pto 4", st.puertaAbre === "estancia" ? "HR · ap. 2.1.1 a) ii" : "HR · ap. 2.1.1 b) ii"],
      detalle: { clase: "puerta", abre: st.puertaAbre, exige: exigePuerta, RA: puertaRA, cerramientoRA },
    });

    // El ascensor (3.3.3.5): con la maquinaria en el hueco es recinto de instalaciones.
    if (sep.ascensor) {
      const modo = st.ascensor ?? sep.ascensorHabitual;
      const r =
        modo === "hueco"
          ? comprobarVertical({
              tipo: sa.s.tipo, m: sa.m, RA: sa.RA, dRA: saTr ? saTr.dRA : null, unaCara: saTr?.unaCara ?? false, columna: colV, tabiqueria: tab,
              paren: true, instalaciones: true, forjadoM: fj.m, sueloDRA: sf.dRA, techoDRA: 0, fachada: fa.flanco, bandas: (sa.s as SolBase).bandas,
            })
          : null;
      const RA = modo === "hueco" ? RA_conjunto(sa, saTr) : RA_conjunto(sv, svTr);
      const ok = r ? r.cumple : RA > L.ascensorRA;
      elementos.push({
        id: "ascensor",
        nombre: "Recinto del ascensor",
        tipo: "ruido",
        veredicto: ok ? "ok" : "fail",
        valor: { valor: RA, unidad: "dBA" },
        ...(r ? {} : { limite: { valor: L.ascensorRA, unidad: "dBA" } }),
        manda: r
          ? { tipo: "grado_tabla", tabla: "Tabla 3.2", entradas: [{ k: "Caso", v: "recinto de instalaciones" }] }
          : { tipo: "formula", formula: "RA del cerramiento > 50 dBA", resultado: { valor: L.ascensorRA, unidad: "dBA" } },
        cita: ["HR · ap. 3.3.3.5"],
        detalle: { clase: "ascensor", modo, habitual: st.ascensor === null, RA, r },
      });
    }

    if (sep.sobreViviendas.length > 0) horizontal("forjado-viviendas", "Forjado entre viviendas", "viviendas", sep.sobreViviendas.map((x) => `viviendas de ${x}`), false, ts);
    if (sep.sobreComun.length > 0) horizontal("forjado-comun", "Forjado sobre la zona común", "comun", nombres(sep.sobreComun), false, tsBajo);
    if (sep.sobreActividad.length > 0) {
      horizontal("forjado-actividad", "Forjado sobre locales, garaje e instalaciones", "actividad", nombres(sep.sobreActividad), sep.sobreActividad.every((c) => c.garaje), tsBajo);
    }
    if (sep.actividadEncima.length > 0) horizontal("forjado-encima", "Forjado bajo locales o instalaciones", "encima", nombres(sep.actividadEncima), false, ts);

  }

  // ── Adosada (Anejo I) ──────────────────────────────────────────────────────
  if (tipologia === "adosada") {
    if (st.estructura === "independiente") {
      const h = base(st.hojaAdosada, medios);
      elementos.push({
        id: "adosada",
        nombre: "Separación con las viviendas adosadas",
        tipo: "ruido",
        veredicto: h.RA >= L.hojaAdosadaRA ? "ok" : "fail",
        valor: { valor: h.RA, unidad: "dBA" },
        limite: { valor: L.hojaAdosadaRA, unidad: "dBA" },
        manda: { tipo: "formula", formula: "dos hojas, cada una con RA ≥ 45 dBA", resultado: { valor: L.hojaAdosadaRA, unidad: "dBA" } },
        cita: ["HR · Anejo I.1.2 pto 1"],
        detalle: { clase: "adosada", sol: h.u, RA: h.RA, exige: L.hojaAdosadaRA },
      });
    } else {
      vertical("separacion", "Separación con las viviendas adosadas", "unidades", ["las viviendas adosadas"], sv, svTr, false, 0);
      if (sep.plantas > 1) {
        const r = comprobarAdosada(fj, sv.s.tipo, sf.dLw, sf.dRA);
        elementos.push({
          id: "forjado-adosada",
          nombre: "Suelo flotante de los forjados compartidos",
          tipo: "ruido",
          veredicto: r.cumple ? "ok" : "fail",
          valor: { valor: sf.dLw, unidad: "dB" },
          ...(r.dLwExigido !== null ? { limite: { valor: r.dLwExigido, unidad: "dB" } } : {}),
          manda: { tipo: "grado_tabla", tabla: "Tabla I.1", entradas: [{ k: "Forjado", v: r.fila ? `${r.fila.m} kg/m²` : "ninguno" }, { k: "Tipo", v: String(sv.s.tipo) }] },
          cita: ["HR · tabla I.1", "HR · Anejo I.1.3"],
          detalle: { clase: "forjado-adosada", forjado: fj, suelo: sf, tipo: sv.s.tipo, r },
        });
      }
    }
  }

  // ── Medianería (3.1.2.4): las de SI 2 ───────────────────────────────────────
  if (sep.medianeras) {
    const md = base(st.medianeria, medios);
    elementos.push({
      id: "medianeria",
      nombre: "Medianería",
      tipo: "ruido",
      veredicto: md.RA >= L.medianeriaRA ? "ok" : "fail",
      valor: { valor: md.RA, unidad: "dBA" },
      limite: { valor: L.medianeriaRA, unidad: "dBA" },
      manda: { tipo: "formula", formula: "RA de toda la medianería ≥ 45 dBA", resultado: { valor: L.medianeriaRA, unidad: "dBA" } },
      cita: ["HR · ap. 3.1.2.4"],
      detalle: { clase: "medianeria", sol: md.u, RA: md.RA, exige: L.medianeriaRA },
    });
  }

  // ── Fachada y cubierta frente al ruido exterior (tablas 2.1 y 3.4) ─────────
  const exterior = (recinto: "dormitorios" | "estancias" | "administrativo", g: GrupoExterior) => {
    const fg = fachada(g.fachada, medios);
    const hu = hueco(g.ventana, st.capialzado);
    const dado = numero(recinto === "dormitorios" ? st.huecosDormitorio : st.huecosEstancia);
    const pct = Math.min(100, dado ?? (recinto === "dormitorios" ? HUECOS_SUPUESTOS.dormitorio : HUECOS_SUPUESTOS.estancia));
    const ex = exigenciaExterior(ld.valor, recinto, ld.aeronaves, st.noExpuesta);
    const r = comprobarFachada(ex.D, fg.ciega.RAtr, hu.RAtr, pct);
    const nombre = recinto === "dormitorios" ? "Fachada de los dormitorios" : recinto === "estancias" ? "Fachada de las estancias" : "Fachada de los despachos";
    elementos.push({
      id: `${recinto === "dormitorios" ? "fachada-dormitorios" : "fachada-estancias"}${g.sufijo}`,
      nombre: `${nombre}${g.sufijo ? " de la planta baja" : ""}`,
      tipo: "ruido",
      veredicto: r.cumple ? "ok" : "fail",
      valor: { valor: hu.RAtr, unidad: "dBA" },
      ...(r.huecoExigido !== null ? { limite: { valor: r.huecoExigido, unidad: "dBA" } } : {}),
      manda: { tipo: "grado_tabla", tabla: "Tabla 3.4", entradas: [{ k: "D2m,nT,Atr", v: `${ex.D} dBA` }, { k: "Huecos", v: `${pct} %` }] },
      cita: ["HR · tablas 2.1 y 3.4", "HR · ap. 3.1.2.5"],
      detalle: { clase: "exterior", recinto, ldZona: ld.valor, ldSupuesto: ld.supuesto, ld: ex.ld, aeronaves: ld.aeronaves, noExpuesta: st.noExpuesta, D: ex.D, pct, pctSupuesto: dado === null, ciega: fg.ciega, hueco: hu, r },
    });
    return dado === null;
  };
  let supDorm = false;
  let supEst = false;
  for (const g of grupos) {
    if (tipologia !== "otros") supDorm = exterior("dormitorios", g) || supDorm;
    supEst = exterior(tipologia === "otros" ? "administrativo" : "estancias", g) || supEst;
  }
  if (supDorm || supEst) avisos.push({ id: "huecos", tipo: "supuesto", elementoId: supDorm ? "fachada-dormitorios" : "fachada-estancias", datos: {} });
  if (ld.supuesto) avisos.push({ id: "ld", tipo: "supuesto", elementoId: "fachada-dormitorios", datos: {} });
  const supuestas = sep.colindancias.filter((c) => c.supuesta).length;
  if (supuestas > 0) avisos.push({ id: "colindancias", tipo: "supuesto", datos: { n: supuestas } });

  if (sep.cubierta) {
    // El paquete de El edificio sobre su forjado (K-CER.10).
    const cuE = cer.cubierta.eleccion;
    const cuS = cer.cubierta.sol;
    const cuRAtr = propio(cuE, "RAtr") ?? RAtrCubierta(cuS, cer.forjado.sol);
    const ex = exigenciaExterior(ld.valor, tipologia === "otros" ? "administrativo" : "dormitorios", ld.aeronaves, false);
    const r = comprobarFachada(ex.D, cuRAtr, null, 0);
    elementos.push({
      id: "cubierta",
      nombre: "Cubierta",
      tipo: "ruido",
      veredicto: r.cumple ? "ok" : "fail",
      valor: { valor: cuRAtr, unidad: "dBA" },
      ...(r.ciegaExigida !== null ? { limite: { valor: r.ciegaExigida, unidad: "dBA" } } : {}),
      manda: { tipo: "grado_tabla", tabla: "Tabla 3.4", entradas: [{ k: "D2m,nT,Atr", v: `${ex.D} dBA` }, { k: "Huecos", v: "0 %" }] },
      cita: ["HR · tablas 2.1 y 3.4", "HR · ap. 3.1.2.5"],
      detalle: {
        clase: "exterior", recinto: "cubierta", ldZona: ld.valor, ldSupuesto: ld.supuesto, ld: ex.ld, aeronaves: ld.aeronaves, noExpuesta: false, D: ex.D, pct: 0, pctSupuesto: false,
        ciega: { ...usada(cuS, cuE), RAtr: cuRAtr }, hueco: null, r,
      },
    });
  }

  // ── Uniones e instalaciones (3.1.4 y 3.3): se declaran ─────────────────────
  elementos.push({
    id: "instalaciones",
    nombre: "Uniones e instalaciones",
    tipo: "ruido",
    veredicto: "dato",
    valor: { texto: "se declaran" },
    manda: { tipo: "decision_proyectista", decision: "condiciones de diseño de las uniones (3.1.4) y de las instalaciones (3.3)" },
    cita: ["HR · ap. 3.1.4", "HR · ap. 3.3"],
    detalle: { clase: "instalaciones", ascensor: sep.ascensor, condiciones: condicionesInstalaciones(tipologia, sep) },
  });

  // ── Avisos ─────────────────────────────────────────────────────────────────
  if (!aplica) avisos.push({ id: "existente", tipo: "caso_especial", datos: {} });
  if (tipologia === "otros") avisos.push({ id: "otros", tipo: "fuera_de_alcance", datos: {} });
  if (sep.conActividad.some((c) => c.nombre.startsWith("Local")) || sep.sobreActividad.some((c) => c.nombre.startsWith("Local"))) {
    avisos.push({ id: "local", tipo: "caso_especial", elementoId: sep.conActividad.length > 0 ? "separacion-actividad" : "forjado-actividad", datos: {} });
  }
  if ([...sep.sobreActividad, ...sep.actividadEncima].some((c) => c.clase === "instalaciones")) {
    avisos.push({ id: "techo-instalaciones", tipo: "caso_especial", elementoId: sep.sobreActividad.length > 0 ? "forjado-actividad" : "forjado-encima", datos: {} });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  // Con los valores medios del Catálogo, ¿cumpliría? (K-CEC.1: solo se avisa si cambia el veredicto.)
  if (comparar && !medios && veredicto === "fail" && justificarHr({ ...st, medios: true }, p, false).veredicto === "ok") {
    avisos.push({ id: "medios", tipo: "caso_especial", elementoId: elementos.find((x) => x.veredicto === "fail")?.id, datos: {} });
  }

  return { elementos, avisos, veredicto, aplica, tipologia, separaciones: sep, tabiqueria: tab, ld, medios };
}

/** Las condiciones que la ficha declara (bloque L de la verificación), las que tienen objeto en el edificio. */
function condicionesInstalaciones(tipologia: Tipologia, s: SeparacionesHr): string[] {
  const c: string[] = [];
  if (tipologia !== "aislada") {
    c.push("Tabiquería interrumpida en el encuentro con los elementos de separación verticales, que son continuos (3.1.4.1.1)");
    c.push("Sin contacto entre el suelo flotante y los elementos de separación verticales, pilares y tabiques con apoyo directo (3.1.4.2.1 pto 1)");
    c.push("Techos suspendidos y suelos registrables no continuos entre unidades de uso (3.1.4.2.1 pto 2)");
  }
  c.push("Conductos que atraviesan forjados recubiertos y con las holguras selladas con material elástico (3.1.4.2.2)");
  c.push("Equipos sobre antivibratorios o bancada de inercia y conectores flexibles en las tuberías (3.3.2)");
  c.push("Conducciones con manguitos elásticos y abrazaderas desolidarizadoras; anclajes a elementos de m > 150 kg/m² (3.3.3.1)");
  c.push("Bañeras y platos de ducha con elementos elásticos en sus apoyos; grifería de Grupo II como mínimo (3.3.3.1)");
  c.push("Conductos de extracción dentro de la vivienda revestidos con RA ≥ 33 dBA (3.3.3.3)");
  if (s.ascensor) c.push("Ascensor: tracción con amortiguadores, topes elásticos en las puertas de piso y cuadro de mandos montado elásticamente (3.3.3.5)");
  if (tipologia === "plurifamiliar" && (s.conActividad.some((x) => x.garaje) || s.sobreActividad.some((x) => x.garaje))) {
    c.push("Conductos de extracción de humos del garaje con RA ≥ 45 dBA (3.3.3.3)");
  }
  return c;
}
