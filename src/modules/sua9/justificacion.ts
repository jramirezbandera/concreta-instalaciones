// =============================================================================
// DB-SUA, SUA 9 — La justificación (feature-20): la accesibilidad en el
// exterior, entre plantas (el ascensor o su previsión, y la cabina), en las
// plantas, la dotación de elementos accesibles y la señalización. PURA y
// DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-sua9.md):
//   - dentro de los límites de las viviendas, unifamiliares incluidas, SUA 9 solo
//     se exige en las que deban ser accesibles (ap. 1 pto 2, D1.6);
//   - las plantas se cuentan en cada sentido desde la entrada, sin sumar las de
//     arriba y las de abajo; el garaje cuenta (zona comunitaria); trasteros y
//     cuartos de instalaciones, no (K2, comentarios DccSUA p. 54);
//   - las plantas con viviendas accesibles para silla de ruedas tienen ascensor
//     siempre (D3.10); en otros usos, las plantas con elementos accesibles (D3.13);
//   - la cabina se comprueba con la tabla corregida del Ministerio y se muestra la
//     del DB al lado (K6);
//   - el DB no fija el número de viviendas accesibles (D5.1): ninguna mientras no
//     se diga, con aviso revisable;
//   - plazas accesibles: una por vivienda accesible para silla de ruedas; en
//     oficinas con más de 100 m² construidos de garaje, una cada 50 o fracción.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import { viviendasEnZona } from "../../lib/edificio/derivar";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { edificioSua, type ClaseSua } from "../sua/edificio";
import { SUA9_ENTRE_PLANTAS } from "../sua/tablas";
import { cantidad, medida, resolverSua9, type AccesoEntrada, type DebeSerAccesible, type DecisionesSua9, type Sua9Estado } from "./estado";
import {
  aseosAccesiblesExigidos,
  ASEO_CENTRO_PEQUENO,
  CABINA_CORREGIDA,
  CABINA_DB,
  ITINERARIO_ACCESIBLE,
  plazasAccesiblesOtrosUsos,
  PLAZAS_ACCESIBLES,
  type Cabina,
  type ColumnaCabina,
  type PuertasCabina,
} from "./tablas";

/** Por qué se exige el ascensor. */
export type MotivoAscensor = "plantas" | "cubierta" | "viviendas" | "superficie" | "accesibles" | "elementos";

export type DetalleSua9 =
  | { clase: "ambito"; debe: DebeSerAccesible }
  | { clase: "exterior"; acceso: AccesoEntrada; piscina: boolean }
  | {
      clase: "ascensor";
      residencial: boolean;
      exigido: boolean;
      motivos: MotivoAscensor[];
      plantasASalvar: number;
      viviendasSinEntrada: number;
      utilSinEntrada_m2: number;
      hay: boolean;
      supuesto: boolean;
      /** Niveles que comunica (o comunicaría), de arriba abajo; la cubierta comunitaria va aparte. */
      niveles: number[];
      plantas: string;
      cubierta: boolean;
    }
  | {
      clase: "cabina";
      residencial: boolean;
      columna: ColumnaCabina;
      /** Otros usos: superficie útil en plantas distintas a las de acceso. */
      utilFueraAcceso_m2: number;
      puertas: PuertasCabina;
      ancho_m: number;
      fondo_m: number;
      indicada: boolean;
      minimo: readonly Cabina[];
      minimoDb: readonly Cabina[];
      cumple: boolean;
      cumpleDb: boolean;
    }
  | { clase: "plantas"; residencial: boolean; minimo_m: number; pasillo_m: number | null; ascensor: boolean; garaje: boolean }
  | { clase: "viviendas"; total: number; sr: number; auditiva: number }
  | { clase: "vivienda_accesible"; unifamiliar: boolean; sr: number; auditiva: number }
  | { clase: "plazas"; residencial: boolean; plazas: number; exigidas: number; construida_m2: number; supuesta: boolean; usoAparcamiento: boolean; sr: number }
  | { clase: "piscina"; exige: boolean }
  | { clase: "aseos"; inodoros: number; inodorosSupuestos: boolean; exigidos: number; excepcion: boolean; utilOficinas_m2: number }
  | { clase: "atencion" }
  | { clase: "mecanismos"; residencial: boolean }
  | { clase: "senalizacion"; residencial: boolean; ascensor: boolean; plazas: number; publico: boolean; aseos: boolean }
  | { clase: "local"; plantas: string };

export type ElementoSua9 = ElementoSi<DetalleSua9>;

export interface JustificacionSua9 extends JustificacionSiBase {
  elementos: ElementoSua9[];
  decisiones: DecisionesSua9;
  unifamiliar: boolean;
  residencial: boolean;
  oficinas: boolean;
  /** La cubierta es transitable: la decisión de su uso tiene sentido. */
  cubiertaTransitable: boolean;
  /** Superficie útil de las oficinas [m²]: la excepción del aseo pequeño solo cabe con ≤ 100 m². */
  utilOficinas_m2: number;
  /** Viviendas de la plurifamiliar y las accesibles indicadas. */
  viviendas: { total: number; sr: number; auditiva: number };
  /** El ascensor tal como lo ve SUA 9 (null en la unifamiliar). */
  ascensor: { exigido: boolean; hay: boolean; supuesto: boolean } | null;
  cabina: { minimo: Cabina; ancho_m: number; fondo_m: number; indicada: boolean } | null;
  pasillo: { minimo_m: number; valor_m: number | null } | null;
}

const EPS = 1e-6;
const cabe = (a: number, f: number, opciones: readonly Cabina[]) => opciones.some((o) => a >= o.anchura_m - EPS && f >= o.fondo_m - EPS);

/** «S1–P3», o «PB». */
function rango(niveles: readonly number[], etiqueta: (n: number) => string): string {
  if (niveles.length === 0) return "";
  const alta = Math.max(...niveles);
  const baja = Math.min(...niveles);
  return alta === baja ? etiqueta(alta) : `${etiqueta(baja)}–${etiqueta(alta)}`;
}

export function justificarSua9(estado: Sua9Estado, p: ProyectoSi): JustificacionSua9 {
  const e = edificioSua(p.edificio);
  const d = resolverSua9(estado);
  const avisos: Aviso[] = [];
  const elementos: ElementoSua9[] = [];
  const unifamiliar = e.unifamiliar;
  const residencial = e.residencial;
  const oficinas = e.zonas.some((z) => z.clase === "oficinas");
  const cubiertaTransitable = p.edificio.cubierta.tipo === "plana_transitable";
  const utilOficinas_m2 = e.zonas.filter((z) => z.clase === "oficinas").reduce((a, z) => a + z.util_m2 * z.repeticiones, 0);
  const etiquetaDe = (n: number) => e.plantas.find((x) => x.nivel === n)?.etiqueta ?? (n === 0 ? "PB" : n > 0 ? `P${n}` : `S${-n}`);

  const totalViviendas = unifamiliar ? 1 : e.resumen.numViviendas;
  const sr = unifamiliar ? 0 : Math.min(cantidad(estado.viviendasSR), totalViviendas);
  const auditiva = unifamiliar ? 0 : Math.min(cantidad(estado.viviendasAuditiva), totalViviendas);

  const base = { decisiones: d, unifamiliar, residencial, oficinas, cubiertaTransitable, utilOficinas_m2: Math.round(utilOficinas_m2), viviendas: { total: totalViviendas, sr, auditiva } };

  // ── La unifamiliar: un solo elemento ─────────────────────────────────────
  if (unifamiliar) {
    if (d.unifamiliar === "no") {
      elementos.push({
        id: "ambito",
        nombre: "Ámbito de aplicación",
        tipo: "ambito",
        veredicto: "ok",
        valor: { texto: "no exigible" },
        manda: { tipo: "decision_proyectista", decision: "la vivienda no debe ser accesible" },
        cita: ["SUA 9 · ap. 1 pto 2"],
        detalle: { clase: "ambito", debe: "no" },
      });
    } else {
      elementos.push(viviendaAccesible(true, d.unifamiliar === "silla" ? 1 : 0, d.unifamiliar === "auditiva" ? 1 : 0));
      if (d.unifamiliar === "silla") avisos.push({ id: "vivienda-accesible", tipo: "fuera_de_alcance", elementoId: "vivienda-accesible", datos: {} });
    }
    const veredicto: Veredicto = "ok";
    return { ...base, elementos, avisos, veredicto, ascensor: null, cabina: null, pasillo: null };
  }

  // ── 1.1.1 En el exterior ──────────────────────────────────────────────────
  const piscina = residencial && p.datosGenerales.tienePiscina;
  elementos.push({
    id: "exterior",
    nombre: "Itinerario accesible exterior",
    tipo: "itinerario",
    veredicto: d.entrada === "escalones" ? "fail" : "ok",
    valor: { texto: TEXTO_ACCESO[d.entrada] },
    manda: { tipo: "decision_proyectista", decision: d.entrada },
    cita: ["SUA 9 · ap. 1.1.1", "Anejo A · itinerario accesible"],
    detalle: { clase: "exterior", acceso: d.entrada, piscina },
  });

  // ── 1.1.2 Entre plantas ───────────────────────────────────────────────────
  const T = SUA9_ENTRE_PLANTAS.datos;
  const cuentan: readonly ClaseSua[] = ["vivienda", "comun", "oficinas", "garaje", "local"];
  const gruposQueCuentan = new Set(e.zonas.filter((z) => cuentan.includes(z.clase)).map((z) => z.grupoId));
  const niveles = e.plantas.filter((x) => gruposQueCuentan.has(x.grupoId) || x.nivel === 0).map((x) => x.nivel);
  const nivelAlto = Math.max(0, ...e.plantas.map((x) => x.nivel));
  const cubiertaCuenta = cubiertaTransitable && d.cubierta === "comunitaria";
  const plantasASalvar = Math.max(e.ascensor.plantasASalvar, cubiertaCuenta ? nivelAlto + 1 : 0);
  const garaje = e.garaje;
  const nivelesGaraje = garaje ? e.plantas.filter((x) => garaje.zonas.some((z) => z.grupoId === x.grupoId)).map((x) => x.nivel) : [];
  const garajeFueraDeEntrada = nivelesGaraje.some((n) => n !== 0);

  // Plazas accesibles (1.2.3): las necesita también el ascensor de otros usos.
  let plazasExigidas = 0;
  if (garaje) {
    plazasExigidas = residencial
      ? PLAZAS_ACCESIBLES.datos.porViviendaAccesible * sr
      : garaje.usoAparcamiento
        ? plazasAccesiblesOtrosUsos(garaje.plazas)
        : 0;
  }

  const motivos: MotivoAscensor[] = [];
  if (plantasASalvar > T.plantasASalvarMasDe) motivos.push(e.ascensor.plantasASalvar > T.plantasASalvarMasDe ? "plantas" : "cubierta");
  if (residencial) {
    if (e.ascensor.viviendasSinEntrada > T.viviendasSinEntradaMasDe) motivos.push("viviendas");
    // Las viviendas accesibles para silla de ruedas, sus plazas y trasteros: ascensor siempre (D3.10).
    if (sr > 0 && (e.ascensor.viviendasSinEntrada > 0 || (garajeFueraDeEntrada && plazasExigidas > 0))) motivos.push("accesibles");
  } else {
    if (e.ascensor.utilSinEntrada_m2 > T.utilSinEntradaMasDe_m2) motivos.push("superficie");
    if (plazasExigidas > 0 && garajeFueraDeEntrada) motivos.push("elementos");
  }
  const exigido = motivos.length > 0;
  const supuesto = p.edificio.ascensor === undefined;
  const hay = supuesto ? exigido : p.edificio.ascensor === true;

  // Las viviendas accesibles se suponen fuera de la planta de entrada: se avisa si eso lo decide todo.
  const viviendasPB = e.plantas.filter((x) => x.nivel === 0).reduce((a, x) => a + x.zonas.reduce((b, z) => b + viviendasEnZona(p.edificio, z), 0), 0);
  if (motivos.length === 1 && motivos[0] === "accesibles" && viviendasPB >= sr && !(garajeFueraDeEntrada && plazasExigidas > 0)) {
    avisos.push({ id: "accesibles-planta", tipo: "supuesto", elementoId: "ascensor", datos: { sr } });
  }

  elementos.push({
    id: "ascensor",
    nombre: "Accesibilidad entre plantas",
    tipo: "ascensor",
    veredicto: exigido && !hay ? "fail" : "ok",
    valor: { texto: hay ? "ascensor accesible" : residencial ? "previsión de ascensor" : "no se exige" },
    manda: { tipo: "altura_edificio", plantas: plantasASalvar, limite: T.plantasASalvarMasDe },
    cita: [residencial ? "SUA 9 · ap. 1.1.2 pto 1" : "SUA 9 · ap. 1.1.2 pto 2"],
    detalle: {
      clase: "ascensor",
      residencial,
      exigido,
      motivos,
      plantasASalvar,
      viviendasSinEntrada: e.ascensor.viviendasSinEntrada,
      utilSinEntrada_m2: e.ascensor.utilSinEntrada_m2,
      hay,
      supuesto,
      niveles: [...new Set(niveles)].sort((a, b) => b - a),
      plantas: rango(niveles, etiquetaDe),
      cubierta: cubiertaCuenta,
    },
  });

  // ── La cabina (Anejo A, «Ascensor accesible») ─────────────────────────────
  let cabina: JustificacionSua9["cabina"] = null;
  if (hay) {
    const utilFueraAcceso_m2 = Math.round(e.plantas.filter((x) => x.nivel !== 0).reduce((a, x) => a + x.zonas.reduce((b, z) => b + Math.max(0, z.superficieUtil_m2), 0), 0));
    const columna: ColumnaCabina = (residencial ? sr > 0 : utilFueraAcceso_m2 > CABINA_DB.datos.umbralOtrosEdificios_m2)
      ? "con_accesibles_o_mas_1000"
      : "sin_accesibles_o_hasta_1000";
    const minimo = CABINA_CORREGIDA.datos.filas[d.puertasCabina][columna];
    const minimoDb = CABINA_DB.datos.filas[d.puertasCabina][columna];
    const a = medida(estado.cabinaAncho_m);
    const f = medida(estado.cabinaFondo_m);
    const ancho_m = a ?? minimo[0].anchura_m;
    const fondo_m = f ?? minimo[0].fondo_m;
    const cumple = cabe(ancho_m, fondo_m, minimo);
    cabina = { minimo: minimo[0], ancho_m, fondo_m, indicada: a !== null || f !== null };
    elementos.push({
      id: "cabina",
      nombre: "Cabina del ascensor accesible",
      tipo: "ascensor",
      veredicto: cumple ? "ok" : "fail",
      valor: { texto: `${dim(ancho_m)} × ${dim(fondo_m)} m` },
      manda: { tipo: "grado_tabla", tabla: "Anejo A, «Ascensor accesible»", entradas: [{ k: "Puertas", v: d.puertasCabina }, { k: "Columna", v: columna }] },
      cita: ["Anejo A · ascensor accesible", "DccSUA · tabla corregida"],
      detalle: {
        clase: "cabina",
        residencial,
        columna,
        utilFueraAcceso_m2,
        puertas: d.puertasCabina,
        ancho_m,
        fondo_m,
        indicada: cabina.indicada,
        minimo,
        minimoDb,
        cumple,
        cumpleDb: cabe(ancho_m, fondo_m, minimoDb),
      },
    });
  }

  // ── 1.1.3 En las plantas ──────────────────────────────────────────────────
  const minimo_m = residencial ? ITINERARIO_ACCESIBLE.datos.pasilloZonasComunesVivienda_m : ITINERARIO_ACCESIBLE.datos.pasillo_m;
  const pasillo_m = medida(estado.pasillo_m);
  elementos.push({
    id: "plantas",
    nombre: "Itinerario accesible en las plantas",
    tipo: "itinerario",
    veredicto: pasillo_m !== null && pasillo_m < minimo_m - EPS ? "fail" : "ok",
    valor: pasillo_m !== null ? { valor: pasillo_m, unidad: "m" } : { texto: `pasillos ≥ ${dim(minimo_m)} m` },
    limite: { valor: minimo_m, unidad: "m" },
    manda: { tipo: "decision_proyectista", decision: pasillo_m === null ? "mínimo prescrito" : "anchura indicada" },
    cita: [residencial ? "SUA 9 · ap. 1.1.3 pto 1" : "SUA 9 · ap. 1.1.3 pto 2", "Anejo A · itinerario accesible"],
    detalle: { clase: "plantas", residencial, minimo_m, pasillo_m, ascensor: hay, garaje: garaje !== null },
  });

  // ── 1.2.1 Viviendas accesibles ────────────────────────────────────────────
  if (residencial) {
    elementos.push({
      id: "viviendas",
      nombre: "Viviendas accesibles",
      tipo: "dotacion",
      veredicto: "dato",
      valor: { texto: sr + auditiva === 0 ? "ninguna" : `${sr} + ${auditiva}` },
      manda: { tipo: "dato_de_partida", fuente: "reglamentación aplicable" },
      cita: ["SUA 9 · ap. 1.2.1"],
      detalle: { clase: "viviendas", total: totalViviendas, sr, auditiva },
    });
    if (sr + auditiva === 0) avisos.push({ id: "viviendas-accesibles", tipo: "supuesto", elementoId: "viviendas", datos: { total: totalViviendas } });
    if (sr + auditiva > 0) {
      elementos.push(viviendaAccesible(false, sr, auditiva));
      if (sr > 0) avisos.push({ id: "vivienda-accesible", tipo: "fuera_de_alcance", elementoId: "vivienda-accesible", datos: {} });
    }
  }

  // ── 1.2.3 Plazas de aparcamiento accesibles ───────────────────────────────
  if (garaje) {
    elementos.push({
      id: "plazas",
      nombre: "Plazas de aparcamiento accesibles",
      tipo: "dotacion",
      veredicto: plazasExigidas > garaje.plazas ? "fail" : "ok",
      valor: { valor: plazasExigidas, unidad: plazasExigidas === 1 ? "plaza" : "plazas" },
      manda: residencial
        ? { tipo: "caudal_por_unidad", tabla: "SUA 9 ap. 1.2.3 pto 1", unidades: { valor: sr, unidad: "viviendas" }, porUnidad: { valor: 1, unidad: "plaza" } }
        : { tipo: "formula", formula: "1 cada 50 o fracción hasta 200", resultado: { valor: plazasExigidas, unidad: "plazas" } },
      cita: [residencial ? "SUA 9 · ap. 1.2.3 pto 1" : "SUA 9 · ap. 1.2.3 pto 2 c)", "Anejo A · plaza de aparcamiento accesible"],
      detalle: {
        clase: "plazas",
        residencial,
        plazas: garaje.plazas,
        exigidas: plazasExigidas,
        construida_m2: Math.round(garaje.construida_m2),
        supuesta: garaje.supuesta,
        usoAparcamiento: garaje.usoAparcamiento,
        sr,
      },
    });
    if (!residencial && garaje.dependeDeConstruida && plazasAccesiblesOtrosUsos(garaje.plazas) > 0) {
      avisos.push({ id: "construida-garaje", tipo: "supuesto", elementoId: "plazas", datos: { construida_m2: Math.round(garaje.construida_m2) } });
    }
  }

  // ── 1.2.5 Piscina ─────────────────────────────────────────────────────────
  if (piscina) {
    elementos.push({
      id: "piscina",
      nombre: "Entrada accesible al vaso de la piscina",
      tipo: "dotacion",
      veredicto: sr > 0 ? "ok" : "dato",
      valor: { texto: sr > 0 ? "grúa u otro elemento adaptado" : "no se exige" },
      manda: { tipo: "decision_proyectista", decision: sr > 0 ? "viviendas accesibles para silla de ruedas" : "sin viviendas accesibles para silla de ruedas" },
      cita: ["SUA 9 · ap. 1.2.5"],
      detalle: { clase: "piscina", exige: sr > 0 },
    });
  }

  // ── 1.2.6 Aseos accesibles y 1.2.7 atención al público (oficinas) ─────────
  if (oficinas) {
    const nucleos = new Map(p.edificio.unidades.flatMap((u) => (u.clase === "nucleo_aseos" ? [[u.id, u.inodoros] as const] : [])));
    const instalados = e.zonas
      .filter((z) => z.clase === "oficinas")
      .reduce((a, z) => a + (z.zona.unidades ?? []).reduce((b, u) => b + (nucleos.get(u.tipoId) ?? 0) * cantidad(u.cantidad), 0) * z.repeticiones, 0);
    const inodorosSupuestos = instalados === 0;
    const inodoros = inodorosSupuestos ? 1 : instalados;
    const pequena = utilOficinas_m2 <= ASEO_CENTRO_PEQUENO.datos.utilPrivadaMax_m2;
    const excepcion = pequena && d.aseoPequeno === "excepcion";
    const exigidos = excepcion ? 0 : aseosAccesiblesExigidos(inodoros);
    elementos.push({
      id: "aseos",
      nombre: "Aseos accesibles",
      tipo: "dotacion",
      veredicto: "ok",
      valor: { valor: exigidos, unidad: exigidos === 1 ? "aseo" : "aseos" },
      manda: { tipo: "formula", formula: "1 cada 10 inodoros o fracción", resultado: { valor: exigidos, unidad: "aseos" } },
      cita: ["SUA 9 · ap. 1.2.6", "Anejo A · servicios higiénicos accesibles"],
      detalle: { clase: "aseos", inodoros, inodorosSupuestos, exigidos, excepcion, utilOficinas_m2: Math.round(utilOficinas_m2) },
    });
    if (inodorosSupuestos) avisos.push({ id: "sin-aseos", tipo: "supuesto", elementoId: "aseos", datos: {} });
    if (d.atencionPublico === "si") {
      elementos.push({
        id: "atencion",
        nombre: "Punto de atención accesible",
        tipo: "dotacion",
        veredicto: "ok",
        valor: { texto: "en el mostrador" },
        manda: { tipo: "decision_proyectista", decision: "zona de atención al público con mostrador fijo" },
        cita: ["SUA 9 · ap. 1.2.7", "Anejo A · punto de atención accesible"],
        detalle: { clase: "atencion" },
      });
    }
  }

  // ── 1.2.8 Mecanismos y ap. 2 Señalización ─────────────────────────────────
  elementos.push({
    id: "mecanismos",
    nombre: "Mecanismos accesibles",
    tipo: "dotacion",
    veredicto: "ok",
    valor: { texto: "en zonas comunes" },
    manda: { tipo: "decision_proyectista", decision: "interruptores, intercomunicación y pulsadores de alarma" },
    cita: ["SUA 9 · ap. 1.2.8", "Anejo A · mecanismos accesibles"],
    detalle: { clase: "mecanismos", residencial },
  });
  elementos.push({
    id: "senalizacion",
    nombre: "Señalización de los elementos accesibles",
    tipo: "senalizacion",
    veredicto: "ok",
    valor: { texto: "tabla 2.1" },
    manda: { tipo: "grado_tabla", tabla: "Tabla 2.1", entradas: [{ k: "Zonas", v: residencial ? "uso privado" : d.atencionPublico === "si" ? "uso público y privado" : "uso privado" }] },
    cita: ["SUA 9 · ap. 2", "Tabla 2.1"],
    detalle: { clase: "senalizacion", residencial, ascensor: hay, plazas: plazasExigidas, publico: oficinas && d.atencionPublico === "si", aseos: oficinas },
  });

  // ── El local sin uso (K9) ─────────────────────────────────────────────────
  const locales = e.zonas.filter((z) => z.clase === "local");
  if (locales.length > 0) {
    elementos.push({
      id: "local",
      nombre: "Local sin uso",
      tipo: "local",
      veredicto: "previsto",
      valor: { texto: "con su actividad" },
      manda: { tipo: "decision_proyectista", decision: "se justificará con el proyecto de la actividad" },
      cita: ["SUA 9 · ap. 1.1.1", "Introducción II"],
      detalle: { clase: "local", plantas: [...new Set(locales.map((z) => z.plantas))].join(", ") },
    });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return {
    ...base,
    elementos,
    avisos,
    veredicto,
    ascensor: { exigido, hay, supuesto },
    cabina,
    pasillo: { minimo_m, valor_m: pasillo_m },
  };
}

export const TEXTO_ACCESO: Record<AccesoEntrada, string> = {
  a_nivel: "a cota de la acera",
  rampa: "rampa accesible",
  ascensor: "ascensor accesible",
  escalones: "con escalones",
};

/** «1,30», con dos decimales si hacen falta. */
export function dim(v: number): string {
  return v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function viviendaAccesible(unifamiliar: boolean, sr: number, auditiva: number): ElementoSua9 {
  return {
    id: "vivienda-accesible",
    nombre: unifamiliar ? "Vivienda accesible" : "Interior de las viviendas accesibles",
    tipo: "vivienda",
    // La herramienta no mide el interior de la vivienda: para silla de ruedas queda fuera de su alcance.
    veredicto: sr > 0 ? "fuera" : "ok",
    valor: { texto: sr > 0 ? "silla de ruedas" : "discapacidad auditiva" },
    manda: { tipo: "decision_proyectista", decision: "reglamentación aplicable" },
    cita: [sr > 0 ? "Anejo A · vivienda accesible para usuarios de silla de ruedas" : "Anejo A · vivienda accesible para personas con discapacidad auditiva"],
    detalle: { clase: "vivienda_accesible", unifamiliar, sr, auditiva },
  };
}
