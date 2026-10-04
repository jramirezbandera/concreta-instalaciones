// =============================================================================
// DB-SUA, SUA 9 — Textos (feature-20): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas del dibujo y de la lista, los avisos y
// lo que no cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import { fmt } from "../../lib/units/format";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import { SUA9_ENTRE_PLANTAS } from "../sua/tablas";
import { dim, TEXTO_ACCESO, type DetalleSua9, type ElementoSua9, type JustificacionSua9, type MotivoAscensor } from "./justificacion";
import {
  ASEO_ACCESIBLE,
  ASEO_CENTRO_PEQUENO,
  CABINA_CORREGIDA,
  CABINA_DB,
  COMENTARIO,
  ITINERARIO_ACCESIBLE,
  MECANISMOS_ACCESIBLES,
  PLAZAS_ACCESIBLES,
  PUNTO_ATENCION,
  SENALIZACION,
  SUA9_OTROS_USOS,
  VIVIENDA_ACCESIBLE,
  type Cabina,
  type ColumnaCabina,
  type PuertasCabina,
} from "./tablas";

const IT = ITINERARIO_ACCESIBLE.datos;
const MEC = MECANISMOS_ACCESIBLES.datos;
const PZ = PLAZAS_ACCESIBLES.datos;
const VA = VIVIENDA_ACCESIBLE.datos;
const AS = ASEO_ACCESIBLE.datos;
const PA = PUNTO_ATENCION.datos;
const SE = SENALIZACION.datos;
const T = SUA9_ENTRE_PLANTAS.datos;

export const NOMBRE_PUERTAS: Record<PuertasCabina, string> = {
  una_o_enfrentadas: "una puerta o dos enfrentadas",
  en_angulo: "dos puertas en ángulo",
};

/** «1,00 × 1,30» o «1,40 × 1,60 ó 1,60 × 1,40». */
export function textoCabinas(c: readonly Cabina[]): string {
  return c.map((x) => `${dim(x.anchura_m)} × ${dim(x.fondo_m)}`).join(" ó ");
}

/** «1,10 m». */
export function m(v: number): string {
  return `${dim(v)} m`;
}

function m2(v: number): string {
  return fmt(v, "m²", 0);
}

/** «0,80–1,20 m». */
function horquilla(r: { min: number; max: number }, unidad: string, conDecimales = true): string {
  const f = (v: number) => (conDecimales ? dim(v) : String(v));
  return `${f(r.min)}–${f(r.max)} ${unidad}`;
}

function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

function det(el: ElementoSi<unknown>): DetalleSua9 {
  return (el as ElementoSua9).detalle;
}

function detalle<C extends DetalleSua9["clase"]>(j: JustificacionSua9, clase: C): Extract<DetalleSua9, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleSua9, { clase: C }>) : null;
}

export function textoColumna(columna: ColumnaCabina, residencial: boolean): string {
  const con = columna === "con_accesibles_o_mas_1000";
  if (residencial) return con ? "con viviendas accesibles para silla de ruedas" : "sin viviendas accesibles para silla de ruedas";
  return con ? `más de ${fmt(CABINA_DB.datos.umbralOtrosEdificios_m2, "m²", 0)} útiles fuera de la planta de acceso` : `hasta ${fmt(CABINA_DB.datos.umbralOtrosEdificios_m2, "m²", 0)} útiles fuera de la planta de acceso`;
}

/** Por qué se exige el ascensor, en una frase: «hay que salvar…» o, en infinitivo, «haber que salvar…». */
export function textoMotivos(d: Extract<DetalleSua9, { clase: "ascensor" }>, infinitivo = false): string {
  const t: Record<MotivoAscensor, string> = {
    plantas: `hay que salvar ${plural(d.plantasASalvar, "planta", "plantas")} desde la entrada`,
    cubierta: `hay que salvar ${plural(d.plantasASalvar, "planta", "plantas")} desde la entrada, con la cubierta de uso comunitario`,
    viviendas: `hay ${d.viviendasSinEntrada} viviendas en plantas sin entrada accesible`,
    superficie: `hay ${m2(d.utilSinEntrada_m2)} útiles en plantas sin entrada accesible`,
    accesibles: "hay viviendas accesibles para usuarios de silla de ruedas, o sus plazas, fuera de la planta de entrada",
    elementos: "hay plazas de aparcamiento accesibles fuera de la planta de entrada",
  };
  return d.motivos.map((x) => (infinitivo ? t[x].replace(/^hay /, "haber ") : t[x])).join(" y ");
}

function ascensorCorto(d: Extract<DetalleSua9, { clase: "ascensor" }>): string {
  if (d.exigido && !d.hay) return "falta el ascensor";
  if (d.hay) return "ascensor";
  return d.residencial ? "previsión de ascensor" : "sin ascensor";
}

/** Número FIJO de la decisión del ascensor (ui.tsx), para los textos. */
export const DECISION_ASCENSOR = 3;

// -----------------------------------------------------------------------------
// Cabecera, La obra y «Qué entra»
// -----------------------------------------------------------------------------

export function fraseSua9(j: JustificacionSua9): string {
  if (j.unifamiliar) {
    const d = j.decisiones.unifamiliar;
    if (d === "no") return "La vivienda unifamiliar no debe ser accesible: no le son exigibles las condiciones de accesibilidad de SUA 9 (ap. 1 pto 2).";
    if (d === "silla") return "La vivienda debe ser accesible para usuarios de silla de ruedas: cumple la definición del Anejo A, que se comprueba en el proyecto.";
    return "La vivienda debe ser accesible para personas con discapacidad auditiva: avisador luminoso y sonoro, bucle magnético y vídeo-comunicador.";
  }
  const a = detalle(j, "ascensor")!;
  let frase: string;
  if (a.exigido && !a.hay) frase = `Se exige ascensor accesible (${textoMotivos(a)}) y no lo hay.`;
  else if (a.exigido) frase = `Ascensor accesible de ${a.plantas}: ${textoMotivos(a)}.`;
  else if (a.residencial) {
    frase = `No se exige ascensor: ${plural(a.plantasASalvar, "planta", "plantas")} que salvar y ${a.viviendasSinEntrada} viviendas sin entrada accesible; ${a.hay ? "el edificio lo tiene igualmente" : "se prevé su instalación"}.`;
  } else {
    frase = `No se exige ascensor: ${plural(a.plantasASalvar, "planta", "plantas")} que salvar y ${m2(a.utilSinEntrada_m2)} útiles sin entrada accesible.`;
  }
  const otros = j.elementos.filter((e) => e.veredicto === "fail" && e.id !== "ascensor").length;
  if (otros > 0) frase += otros === 1 ? " Hay otra comprobación que no cumple." : ` Hay otras ${otros} comprobaciones que no cumplen.`;
  return frase;
}

export function metricasSua9(j: JustificacionSua9): string {
  if (j.unifamiliar) return j.decisiones.unifamiliar === "no" ? "unifamiliar · no exigible" : "unifamiliar · vivienda accesible";
  const a = detalle(j, "ascensor")!;
  const sin = a.residencial ? `${a.viviendasSinEntrada} viv. sin entrada` : `${m2(a.utilSinEntrada_m2)} sin entrada`;
  return `${plural(a.plantasASalvar, "planta", "plantas")} a salvar · ${sin} · ${ascensorCorto(a)}`;
}

/** Las piezas de la fila de La obra. */
export function piezasSua9(j: JustificacionSua9): { texto: string; acento: boolean }[] {
  if (j.unifamiliar) return [{ texto: j.decisiones.unifamiliar === "no" ? "no exigible" : "vivienda accesible", acento: j.decisiones.unifamiliar !== "no" }];
  const a = detalle(j, "ascensor")!;
  const piezas = [{ texto: ascensorCorto(a), acento: a.exigido }];
  const v = j.viviendas.sr + j.viviendas.auditiva;
  if (j.residencial) piezas.push({ texto: v === 0 ? "sin viviendas accesibles" : `${v} viv. ${v === 1 ? "accesible" : "accesibles"}`, acento: v > 0 });
  const p = detalle(j, "plazas");
  if (p && p.exigidas > 0) piezas.push({ texto: plural(p.exigidas, "plaza accesible", "plazas accesibles"), acento: false });
  return piezas;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "pv" ? "pv" : e === "fu" ? "out" : "normal";
}

export function queEntraSua9(j: JustificacionSua9, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    const estado = trato(estados[el.id]);
    switch (d.clase) {
      case "ambito":
        filas.push({ id: el.id, titulo: "La vivienda", detalle: "unifamiliar · con su parcela privativa", trato: "no exigible", estado, elementoId: el.id });
        break;
      case "vivienda_accesible":
        if (d.unifamiliar) {
          filas.push({ id: el.id, titulo: "La vivienda", detalle: "unifamiliar · debe ser accesible", trato: d.sr > 0 ? "silla de ruedas" : "auditiva", estado, elementoId: el.id });
        }
        break;
      case "exterior":
        filas.push({ id: el.id, titulo: "Entrada", detalle: `PB · ${TEXTO_ACCESO[d.acceso]}${d.piscina ? " · piscina" : ""}`, trato: "itinerario", estado, elementoId: el.id });
        break;
      case "ascensor":
        filas.push({
          id: el.id,
          titulo: "Plantas",
          detalle: `${d.plantas} · ${d.plantasASalvar} a salvar · ${d.residencial ? `${d.viviendasSinEntrada} viv. sin entrada` : `${m2(d.utilSinEntrada_m2)} sin entrada`}`,
          trato: ascensorCorto(d),
          estado,
          elementoId: el.id,
        });
        break;
      case "viviendas":
        filas.push({ id: el.id, titulo: "Viviendas", detalle: `${d.total} · ${d.sr} silla de ruedas · ${d.auditiva} auditiva`, trato: "reglamentación", estado, elementoId: el.id });
        break;
      case "plazas":
        filas.push({ id: el.id, titulo: "Garaje", detalle: `${plural(d.plazas, "plaza", "plazas")}${d.residencial ? "" : ` · ${m2(d.construida_m2)}${d.supuesta ? " (supuestos)" : ""}`}`, trato: `${d.exigidas} accesibles`, estado, elementoId: el.id });
        break;
      case "aseos":
        filas.push({ id: el.id, titulo: "Oficinas", detalle: `${m2(d.utilOficinas_m2)} · ${plural(d.inodoros, "inodoro", "inodoros")}${d.inodorosSupuestos ? " (supuesto)" : ""}`, trato: plural(d.exigidos, "aseo accesible", "aseos accesibles"), estado, elementoId: el.id });
        break;
      case "piscina":
        filas.push({ id: el.id, titulo: "Piscina", detalle: "comunitaria", trato: d.exige ? "grúa" : "no se exige", estado, elementoId: el.id });
        break;
      case "local":
        filas.push({ id: el.id, titulo: "Local", detalle: `${d.plantas} · sin uso`, trato: "previsión", estado, elementoId: el.id });
        break;
      default:
        break;
    }
  }
  return filas;
}

// -----------------------------------------------------------------------------
// Etiquetas del dibujo y de la lista
// -----------------------------------------------------------------------------

export function textoEtiquetaSua9(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ambito":
      return "SUA 9 no exigible";
    case "vivienda_accesible":
      return d.sr > 0 ? "vivienda accesible" : "vivienda accesible (auditiva)";
    case "exterior":
      return TEXTO_ACCESO[d.acceso];
    case "ascensor":
      return ascensorCorto(d);
    case "cabina":
      return `cabina ${dim(d.ancho_m)} × ${dim(d.fondo_m)}`;
    case "plantas":
      return d.pasillo_m !== null ? `pasillo ${m(d.pasillo_m)}` : `pasillo ≥ ${m(d.minimo_m)}`;
    case "viviendas":
      return d.sr + d.auditiva === 0 ? "sin viviendas accesibles" : `${d.sr + d.auditiva} viv. ${d.sr + d.auditiva === 1 ? "accesible" : "accesibles"}`;
    case "plazas":
      return plural(d.exigidas, "plaza accesible", "plazas accesibles");
    case "piscina":
      return d.exige ? "grúa en la piscina" : "piscina: no se exige";
    case "aseos":
      return plural(d.exigidos, "aseo accesible", "aseos accesibles");
    case "atencion":
      return "punto de atención";
    case "mecanismos":
      return `mecanismos ${horquilla(MEC.mando_cm, "cm", false)}`;
    case "senalizacion":
      return "señalización SIA";
    case "local":
      return "previsto";
  }
}

export function resultadoListaSua9(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ambito":
      return "la vivienda no debe ser accesible: no exigible";
    case "vivienda_accesible":
      return d.sr > 0 ? "condiciones del Anejo A, se comprueban en el proyecto" : "avisador, bucle magnético y vídeo-comunicador";
    case "exterior":
      return `entrada ${TEXTO_ACCESO[d.acceso]} · pendiente ≤ ${IT.pendienteMarcha_pct} % y transversal ≤ ${IT.pendienteTransversal_pct} %`;
    case "ascensor":
      if (d.exigido) return `exigido (${textoMotivos(d)})${d.hay ? "" : " · no lo hay"}`;
      return d.residencial ? `no exigido · ${d.hay ? "lo hay" : "previsión dimensional y estructural"}` : `no exigido${d.hay ? " · lo hay" : ""}`;
    case "cabina":
      return `${dim(d.ancho_m)} × ${dim(d.fondo_m)} m · mínimo ${textoCabinas(d.minimo)} m (DB: ${textoCabinas(d.minimoDb)} m)`;
    case "plantas":
      return `${d.pasillo_m !== null ? `pasillo ${m(d.pasillo_m)}` : "pasillo sin indicar"} · mínimo ${m(d.minimo_m)} · giro Ø ${m(IT.giro_m)} · puertas ≥ ${m(IT.puerta.pasoMarco_m)}`;
    case "viviendas":
      return `${d.sr} para silla de ruedas · ${d.auditiva} para discapacidad auditiva · de ${d.total}`;
    case "plazas":
      return `${d.exigidas} de ${d.plazas} plazas${d.residencial ? " · una por vivienda accesible" : d.usoAparcamiento ? " · una cada 50 o fracción" : " · no excede de 100 m²"}`;
    case "piscina":
      return d.exige ? "grúa u otro elemento adaptado" : "no se exige: sin viviendas accesibles para silla de ruedas";
    case "aseos":
      return d.excepcion ? "oficina pequeña: el aseo no tiene que ser accesible" : `${plural(d.exigidos, "aseo accesible", "aseos accesibles")} · ${plural(d.inodoros, "inodoro", "inodoros")}`;
    case "atencion":
      return `plano ≥ ${m(PA.plano_m)} de ancho a ≤ ${m(PA.alturaMax_m)} · libre ${PA.libreInferior_cm.alto} × ${PA.libreInferior_cm.ancho} × ${PA.libreInferior_cm.fondo} cm`;
    case "mecanismos":
      return `mando ${horquilla(MEC.mando_cm, "cm", false)} · tomas ${horquilla(MEC.tomas_cm, "cm", false)} · ≥ ${MEC.aRincon_cm} cm del rincón`;
    case "senalizacion":
      return d.residencial ? "uso privado: ascensor en todo caso; entradas e itinerarios si hay varios" : d.publico ? "uso público en la atención al público; uso privado en el resto" : "uso privado";
    case "local":
      return "se justificará con el proyecto de la actividad";
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

const FILAS_ITINERARIO = (minimo_m: number) => [
  { k: "Anchura libre de paso", v: `≥ ${m(minimo_m)}` },
  { k: "Estrechamientos puntuales", v: `≥ ${m(IT.estrechamiento.anchura_m)}, de ≤ ${m(IT.estrechamiento.longitudMax_m)}, a ≥ ${m(IT.estrechamiento.separacion_m)} de huecos y giros` },
  { k: "Espacio de giro", v: `Ø ${m(IT.giro_m)} en el portal, frente al ascensor y al fondo de pasillos de más de ${fmt(IT.pasilloFondoGiroMasDe_m, "m", 0)}` },
  { k: "Puertas", v: `≥ ${m(IT.puerta.pasoMarco_m)} en el marco · ≥ ${m(IT.puerta.pasoMaximaApertura_m)} a máxima apertura` },
  { k: "Mecanismo de apertura", v: `${horquilla(IT.puerta.mecanismo_m, "m")} · ≥ ${m(IT.puerta.mecanismoARincon_m)} del rincón` },
  { k: "Libre del barrido de las hojas", v: `Ø ${m(IT.puerta.libreBarrido_m)} a ambas caras` },
];

export function franjaSua9(el: ElementoSi<unknown>, j: JustificacionSua9, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "ambito":
      return {
        clase: "Ámbito · ap. 1 pto 2",
        titulo: el.nombre,
        valor: "No exigible",
        estado,
        manda:
          "Dentro de los límites de las viviendas, incluidas las unifamiliares y sus zonas exteriores privativas, las condiciones de accesibilidad únicamente son exigibles en aquellas que deban ser accesibles.",
        nota: "El garaje de una vivienda unifamiliar no es uso Aparcamiento, cualquiera que sea su superficie: es interior de la vivienda (Anejo A).",
        filas: [
          { k: "Vivienda", v: "unifamiliar, con su parcela privativa" },
          { k: "Debe ser accesible", v: "no, según la reglamentación aplicable" },
          { k: "Entrada en la valla", v: `no obligatoria (${COMENTARIO})` },
        ],
        cita: "DB-SUA · SUA 9 ap. 1 pto 2",
      };
    case "vivienda_accesible": {
      const silla = d.sr > 0;
      return {
        clase: "Vivienda accesible · Anejo A",
        titulo: el.nombre,
        valor: silla ? "Silla de ruedas" : "Auditiva",
        unidad: d.unifamiliar ? undefined : silla ? `${d.sr} viv.${d.auditiva > 0 ? ` + ${d.auditiva} auditiva` : ""}` : `${d.auditiva} viv.`,
        estado,
        manda: silla
          ? `Sin escalones; pasillos ≥ ${m(VA.pasillo_m)}; vestíbulo, estancia, dormitorios, cocina y un baño con giro de Ø ${m(VA.giro_m)}; puertas como las del itinerario accesible; mecanismos accesibles.`
          : "Avisador luminoso y sonoro de timbre visible desde todos los recintos, bucle magnético y vídeo-comunicador bidireccional para abrir la puerta del edificio.",
        nota: silla ? "La herramienta no mide la planta de la vivienda: estas condiciones se comprueban en el proyecto." : undefined,
        filas: silla
          ? [
              { k: "Dormitorios", v: `transferencia y paso a los pies de la cama ≥ ${m(VA.transferenciaCama_m)}` },
              { k: "Cocina", v: `encimera ≤ ${VA.encimeraMax_cm} cm · libre bajo fregadero ${VA.libreFregadero_cm.alto} × ${VA.libreFregadero_cm.ancho} × ${VA.libreFregadero_cm.fondo} cm` },
              { k: "Baño", v: `transferencia ≥ ${VA.transferenciaInodoroDucha_cm} cm · asiento ${VA.asientoInodoro_cm.min}–${VA.asientoInodoro_cm.max} cm · ducha enrasada ≤ ${VA.pendienteDucha_pct} %` },
              { k: "Terraza", v: `giro Ø ${m(VA.giroTerraza_m)} · resalto ≤ ${VA.resaltoTerrazaMax_cm} cm` },
              ...(d.unifamiliar ? [{ k: "Espacio exterior", v: "itinerarios accesibles" }] : []),
            ]
          : [{ k: "Para", v: "personas con discapacidad auditiva" }],
        cita: silla ? "DB-SUA · Anejo A · vivienda accesible para usuarios de silla de ruedas" : "DB-SUA · Anejo A · vivienda accesible para personas con discapacidad auditiva",
      };
    }
    case "exterior":
      return {
        clase: "En el exterior · ap. 1.1.1",
        titulo: el.nombre,
        valor: TEXTO_ACCESO[d.acceso].replace(/^./, (c) => c.toUpperCase()),
        estado,
        manda: `La parcela dispone de un itinerario accesible que comunica la entrada principal con la vía pública${d.piscina ? " y con las zonas comunes exteriores, como la piscina" : ""}. Sin escalones: el desnivel se salva dentro de la parcela con rampa accesible (SUA 1 ap. 4) o ascensor accesible.`,
        nota: d.acceso === "escalones" ? "Con escalones no hay itinerario accesible: el desnivel se salva con rampa accesible o ascensor accesible." : undefined,
        filas: [
          { k: "Pendiente en la marcha", v: `≤ ${IT.pendienteMarcha_pct} %, o rampa accesible` },
          { k: "Pendiente transversal", v: `≤ ${IT.pendienteTransversal_pct} %` },
          { k: "Giro en el portal", v: `Ø ${m(IT.giro_m)}` },
          { k: "Puerta de entrada", v: `≥ ${m(IT.puerta.pasoMarco_m)} en el marco · Ø ${m(IT.puerta.libreBarrido_m)} libre a ambas caras` },
        ],
        cita: "DB-SUA · SUA 9 ap. 1.1.1 · Anejo A",
      };
    case "ascensor":
      return {
        clase: "Entre plantas · ap. 1.1.2",
        titulo: el.nombre,
        valor: d.hay ? "Ascensor" : d.residencial ? "Previsión" : "Sin ascensor",
        unidad: d.exigido ? "exigido" : "no exigido",
        estado,
        manda: d.residencial
          ? `Ascensor accesible (o rampa accesible) si hay que salvar más de ${T.plantasASalvarMasDe} plantas desde la entrada principal accesible hasta alguna vivienda o zona comunitaria, o con más de ${T.viviendasSinEntradaMasDe} viviendas en plantas sin entrada accesible; si no, previsión dimensional y estructural. Las plantas con viviendas accesibles para silla de ruedas, siempre.`
          : `Ascensor accesible (o rampa) si hay que salvar más de ${T.plantasASalvarMasDe} plantas o hay más de ${fmt(T.utilSinEntradaMasDe_m2, "m²", 0)} útiles, sin las zonas de ocupación nula, en plantas sin entrada accesible; también a las plantas con más de ${fmt(SUA9_OTROS_USOS.datos.usoPublicoPorPlantaMasDe_m2, "m²", 0)} útiles de uso público o con elementos accesibles.`,
        nota:
          d.exigido && !d.hay
            ? `Se exige (${textoMotivos(d)}) y El edificio dice que no hay ascensor.`
            : d.exigido
              ? `Se exige: ${textoMotivos(d)}.`
              : d.residencial && !d.hay
                ? `Se prevén el hueco, el foso y la estructura, con un espacio de giro de Ø ${m(IT.giro_m)} frente a él.`
                : undefined,
        filas: [
          { k: "Plantas a salvar desde la PB", v: `${d.plantasASalvar} (límite: más de ${T.plantasASalvarMasDe})` },
          d.residencial
            ? { k: "Viviendas sin entrada accesible", v: `${d.viviendasSinEntrada} (límite: más de ${T.viviendasSinEntradaMasDe})` }
            : { k: "Útil sin entrada accesible", v: `${m2(d.utilSinEntrada_m2)} (límite: más de ${fmt(T.utilSinEntradaMasDe_m2, "m²", 0)})` },
          { k: "Comunica", v: `${d.plantas}${d.cubierta ? " y la cubierta" : ""}` },
          { k: "Cómputo", v: "en cada sentido, sin sumar; el garaje cuenta, los trasteros no" },
          { k: "En El edificio", v: d.supuesto ? `sin indicar: se supone ${d.hay ? "que lo hay" : "que no lo hay"}` : d.hay ? "hay ascensor" : "no hay ascensor" },
        ],
        cita: d.residencial ? "DB-SUA · SUA 9 ap. 1.1.2 pto 1" : "DB-SUA · SUA 9 ap. 1.1.2 pto 2",
      };
    case "cabina":
      return {
        clase: "Ascensor accesible · Anejo A",
        titulo: el.nombre,
        valor: `${dim(d.ancho_m)} × ${dim(d.fondo_m)}`,
        unidad: "m",
        estado,
        manda: `Dimensiones mínimas, anchura × fondo, con ${NOMBRE_PUERTAS[d.puertas]}: la tabla corregida con la ${CABINA_CORREGIDA.datos.norma}, que el Ministerio declara aplicable desde el ${CABINA_CORREGIDA.datos.desde} (${COMENTARIO}); el texto del DB da la de la ${CABINA_DB.datos.norma}.`,
        nota: !d.cumple && d.cumpleDb ? "Cumple la tabla del texto del DB, pero no la corregida." : d.indicada ? undefined : "Sin medidas indicadas, se prescribe la mínima de la tabla corregida.",
        filas: [
          { k: "Puertas", v: NOMBRE_PUERTAS[d.puertas] },
          { k: "Columna", v: d.residencial ? textoColumna(d.columna, true) : `${m2(d.utilFueraAcceso_m2)}: ${textoColumna(d.columna, false)}` },
          { k: "Mínimo, tabla corregida", v: `${textoCabinas(d.minimo)} m` },
          { k: "Mínimo, texto del DB", v: `${textoCabinas(d.minimoDb)} m` },
          { k: "Botonera", v: "Braille y alto relieve, con contraste cromático" },
        ],
        cita: "DB-SUA · Anejo A · ascensor accesible",
      };
    case "plantas":
      return {
        clase: "En las plantas · ap. 1.1.3",
        titulo: el.nombre,
        valor: d.pasillo_m !== null ? dim(d.pasillo_m) : `≥ ${dim(d.minimo_m)}`,
        unidad: "m de pasillo",
        estado,
        manda: d.residencial
          ? `Un itinerario accesible comunica en cada planta el ascensor accesible${d.ascensor ? "" : ", o su previsión,"} con las viviendas y las zonas de uso comunitario${d.garaje ? ", el garaje incluido" : ""}. Trasteros y cuartos de instalaciones son de ocupación nula.`
          : "Un itinerario accesible comunica en cada planta el acceso a ella con las zonas de uso público, con todo origen de evacuación de las zonas de uso privado (salvo las de ocupación nula) y con los elementos accesibles.",
        nota:
          d.pasillo_m !== null && d.pasillo_m < d.minimo_m
            ? `${m(d.pasillo_m)} es menos que ${m(d.minimo_m)}.`
            : d.residencial
              ? `En las zonas comunes de un edificio de viviendas se admite ${m(IT.pasilloZonasComunesVivienda_m)}; en el resto, ${m(IT.pasillo_m)}.`
              : d.pasillo_m === null
                ? "Sin la anchura indicada, se prescribe la mínima."
                : undefined,
        filas: FILAS_ITINERARIO(d.minimo_m),
        cita: `DB-SUA · SUA 9 ap. 1.1.3 pto ${d.residencial ? 1 : 2} · Anejo A`,
      };
    case "viviendas":
      return {
        clase: "Dotación · ap. 1.2.1",
        titulo: el.nombre,
        valor: d.sr + d.auditiva === 0 ? "Ninguna" : `${d.sr} + ${d.auditiva}`,
        unidad: d.sr + d.auditiva === 0 ? undefined : "silla de ruedas + auditiva",
        estado,
        manda: "El número de viviendas accesibles para usuarios de silla de ruedas y para personas con discapacidad auditiva lo fija la reglamentación aplicable: el DB no da un número.",
        nota: "En vivienda protegida o de promoción pública hay una reserva estatal (RDL 1/2013, art. 32); en promoción libre, la que fije la normativa autonómica.",
        filas: [
          { k: "Viviendas del edificio", v: String(d.total) },
          { k: "Para silla de ruedas", v: String(d.sr) },
          { k: "Para discapacidad auditiva", v: String(d.auditiva) },
        ],
        cita: "DB-SUA · SUA 9 ap. 1.2.1",
      };
    case "plazas":
      return {
        clase: "Dotación · ap. 1.2.3",
        titulo: el.nombre,
        valor: String(d.exigidas),
        unidad: d.exigidas === 1 ? "plaza accesible" : "plazas accesibles",
        estado,
        manda: d.residencial
          ? "Una plaza de aparcamiento accesible por cada vivienda accesible para usuarios de silla de ruedas."
          : `Con aparcamiento propio de más de ${fmt(PZ.otrosUsosConstruidaMasDe_m2, "m²", 0)} construidos, una plaza accesible cada ${PZ.otros.unaCada} plazas o fracción hasta ${PZ.otros.hasta}, y una más cada ${PZ.otros.despuesUnaCada} adicionales o fracción.`,
        nota:
          d.exigidas > d.plazas
            ? `No caben: el garaje tiene ${plural(d.plazas, "plaza", "plazas")}.`
            : !d.residencial && !d.usoAparcamiento
              ? `El garaje no excede de ${fmt(PZ.otrosUsosConstruidaMasDe_m2, "m²", 0)} construidos: no se exigen.`
              : d.residencial && d.sr === 0
                ? "Sin viviendas accesibles para silla de ruedas no se exigen."
                : undefined,
        filas: [
          { k: "Plazas del garaje", v: String(d.plazas) },
          ...(d.residencial ? [{ k: "Viviendas accesibles (silla de ruedas)", v: String(d.sr) }] : [{ k: "Superficie construida", v: `${m2(d.construida_m2)}${d.supuesta ? " (supuestos)" : ""}` }]),
          { k: "Aproximación", v: `lateral ≥ ${m(PZ.aproximacionLateral_m)} en batería (compartible) · trasera ≥ ${m(PZ.aproximacionTrasera_m)} en línea` },
          { k: "Situación", v: "junto al acceso peatonal, con itinerario accesible" },
        ],
        cita: d.residencial ? "DB-SUA · SUA 9 ap. 1.2.3 pto 1 · Anejo A" : "DB-SUA · SUA 9 ap. 1.2.3 pto 2 c) · Anejo A",
      };
    case "piscina":
      return {
        clase: "Dotación · ap. 1.2.5",
        titulo: el.nombre,
        valor: d.exige ? "Grúa" : "No se exige",
        estado,
        manda: "Las piscinas de edificios con viviendas accesibles para usuarios de silla de ruedas tienen alguna entrada al vaso mediante grúa u otro elemento adaptado. Se exceptúan las infantiles.",
        filas: [{ k: "Viviendas accesibles (silla de ruedas)", v: String(j.viviendas.sr) }],
        cita: "DB-SUA · SUA 9 ap. 1.2.5",
      };
    case "aseos":
      return {
        clase: "Dotación · ap. 1.2.6",
        titulo: el.nombre,
        valor: String(d.exigidos),
        unidad: d.exigidos === 1 ? "aseo accesible" : "aseos accesibles",
        estado,
        manda: "Si una disposición legal exige aseos (en un lugar de trabajo, el RD 486/1997), un aseo accesible por cada 10 inodoros instalados o fracción, que puede ser de uso compartido para ambos sexos.",
        nota: d.excepcion
          ? `Oficina pequeña: hasta ${fmt(ASEO_CENTRO_PEQUENO.datos.utilPrivadaMax_m2, "m²", 0)} útiles, no más de ${ASEO_CENTRO_PEQUENO.datos.trabajadoresMax} trabajadores y aseo solo de trabajadores: no tiene que ser accesible (${COMENTARIO}).`
          : d.inodorosSupuestos
            ? "Sin núcleos de aseos en El edificio, se supone un aseo con un inodoro."
            : undefined,
        filas: [
          { k: "Inodoros instalados", v: `${d.inodoros}${d.inodorosSupuestos ? " (supuesto)" : ""}` },
          { k: "Aseo accesible", v: `giro Ø ${m(AS.giro_m)} · puertas abatibles hacia fuera o correderas` },
          { k: "Inodoro", v: `transferencia ≥ ${AS.transferenciaInodoro_cm} cm · fondo ≥ ${AS.fondoInodoro_cm} cm · asiento ${AS.asientoInodoro_cm.min}–${AS.asientoInodoro_cm.max} cm` },
          { k: "Lavabo", v: `libre ${AS.lavaboLibre_cm.alto} × ${AS.lavaboLibre_cm.fondo} cm · ≤ ${AS.lavaboMax_cm} cm` },
        ],
        cita: "DB-SUA · SUA 9 ap. 1.2.6 · Anejo A",
      };
    case "atencion":
      return {
        clase: "Dotación · ap. 1.2.7",
        titulo: el.nombre,
        valor: "Punto de atención",
        estado,
        manda: "El mobiliario fijo de la zona de atención al público incluye al menos un punto de atención accesible; como alternativa, un punto de llamada accesible para recibir asistencia.",
        filas: [
          { k: "Plano de trabajo", v: `≥ ${m(PA.plano_m)} de ancho, a ≤ ${m(PA.alturaMax_m)}` },
          { k: "Espacio libre inferior", v: `≥ ${PA.libreInferior_cm.alto} × ${PA.libreInferior_cm.ancho} × ${PA.libreInferior_cm.fondo} cm (alto × ancho × fondo)` },
          { k: "Llegada", v: "itinerario accesible desde la entrada principal" },
        ],
        cita: "DB-SUA · SUA 9 ap. 1.2.7 · Anejo A",
      };
    case "mecanismos":
      return {
        clase: "Dotación · ap. 1.2.8",
        titulo: el.nombre,
        valor: "Accesibles",
        estado,
        manda: "Excepto en el interior de las viviendas y en las zonas de ocupación nula, los interruptores, los dispositivos de intercomunicación y los pulsadores de alarma son mecanismos accesibles.",
        filas: [
          { k: "Mando y control", v: horquilla(MEC.mando_cm, "cm", false) },
          { k: "Tomas de corriente o de señal", v: horquilla(MEC.tomas_cm, "cm", false) },
          { k: "A los rincones", v: `≥ ${MEC.aRincon_cm} cm` },
          { k: "Accionamiento", v: "puño cerrado, codo y una mano, o automático; sin interruptores de giro y palanca" },
          { k: "Contraste", v: "cromático respecto del entorno" },
        ],
        cita: "DB-SUA · SUA 9 ap. 1.2.8 · Anejo A",
      };
    case "senalizacion":
      return {
        clase: "Señalización · ap. 2",
        titulo: el.nombre,
        valor: "Tabla 2.1",
        estado,
        manda: d.residencial
          ? "En un edificio de viviendas todas las zonas son de uso privado (Anejo A): el ascensor accesible se señaliza en todo caso; la entrada y el itinerario accesibles, cuando haya varias entradas o recorridos alternativos; las plazas accesibles, salvo las vinculadas a un residente."
          : d.publico
            ? "En la zona de atención al público (uso público), en todo caso: entradas, itinerarios, plazas y aseos accesibles, aseos de uso general e itinerario hasta el punto de atención. En el resto (uso privado), como en vivienda."
            : "Las oficinas sin atención al público son de uso privado: el ascensor accesible y las plazas accesibles en todo caso; la entrada y el itinerario, cuando haya varios.",
        filas: [
          { k: "Símbolo", v: `SIA (${SE.sia}), con flecha direccional si hace falta` },
          ...(d.ascensor ? [{ k: "Ascensor", v: `n.º de planta en Braille y arábigo en alto relieve, a ${horquilla(SE.brailleAscensor_m, "m")}, en la jamba derecha` }] : []),
          ...(d.publico ? [{ k: "Aseos de uso general", v: `pictogramas de sexo en alto relieve, a ${horquilla(SE.pictogramas_m, "m")}` }] : []),
        ],
        cita: "DB-SUA · SUA 9 ap. 2 · tabla 2.1",
      };
    case "local":
      return {
        clase: "Local sin uso",
        titulo: el.nombre,
        valor: "Previsto",
        estado,
        manda: "Sin actividad, su accesibilidad se justificará con el proyecto de la actividad. Todo establecimiento necesita al menos una entrada principal accesible desde el exterior.",
        nota: `Conviene dejar el acceso a cota de la acera o con sitio para una rampa accesible dentro del local (${COMENTARIO}).`,
        filas: [{ k: "Planta", v: d.plantas }],
        cita: "DB-SUA · Introducción II · SUA 9 ap. 1.1.1",
      };
  }
}

// -----------------------------------------------------------------------------
// Avisos y lo que no cumple
// -----------------------------------------------------------------------------

export function textoAvisoSua9(a: Aviso): TextoSi {
  switch (a.id) {
    case "viviendas-accesibles":
      return {
        titulo: "El número de viviendas accesibles lo fija la reglamentación aplicable.",
        detalle:
          "El DB-SUA no da un número. Se ha supuesto ninguna: en promoción libre, compruébalo con la normativa autonómica; en vivienda protegida o de promoción pública, con la reserva del RDL 1/2013 (art. 32). Indícalas en la decisión 2 o marca este aviso como revisado.",
      };
    case "vivienda-accesible":
      return {
        titulo: "El interior de la vivienda accesible no se comprueba aquí.",
        detalle: "La herramienta no mide la planta: pasillos, giros, dormitorios, cocina, baño y terraza se comprueban en el proyecto con las condiciones del Anejo A. La memoria las enumera.",
      };
    case "accesibles-planta":
      return {
        titulo: "Se supone que las viviendas accesibles no están en la planta de entrada.",
        detalle: "Por eso se exige el ascensor accesible (SUA 9 ap. 1.1.2). Si todas, con sus plazas y trasteros, están en la planta de entrada, no haría falta.",
      };
    case "construida-garaje":
      return {
        titulo: "La superficie construida del garaje decide las plazas accesibles.",
        detalle: `Con la útil no excede de ${fmt(PZ.otrosUsosConstruidaMasDe_m2, "m²", 0)} y no se exigen; con la construida supuesta, sí. Indícala en El edificio.`,
      };
    case "sin-aseos":
      return {
        titulo: "Las oficinas no tienen núcleos de aseos en El edificio.",
        detalle: "Un lugar de trabajo tiene al menos un aseo (RD 486/1997): se supone uno con un inodoro, que es accesible. Añade los núcleos de aseos en El edificio.",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoSua9(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  switch (d.clase) {
    case "exterior":
      return {
        titulo: "La entrada principal no es accesible.",
        detalle: "Con escalones no hay itinerario accesible desde la vía pública: el desnivel se salva dentro de la parcela con rampa accesible o ascensor accesible.",
      };
    case "ascensor":
      return {
        titulo: "Falta el ascensor accesible.",
        detalle: `Se exige porque ${textoMotivos(d)}, y El edificio dice que no lo hay. Indica que lo hay en la decisión ${DECISION_ASCENSOR}.`,
      };
    case "cabina":
      return {
        titulo: "La cabina del ascensor es pequeña.",
        detalle: `${dim(d.ancho_m)} × ${dim(d.fondo_m)} m no llega a ${textoCabinas(d.minimo)} m${d.cumpleDb ? ", la tabla corregida (sí a la del texto del DB)" : ""}.`,
      };
    case "plantas":
      return {
        titulo: "Los pasillos del itinerario son estrechos.",
        detalle: `${m(d.pasillo_m ?? 0)} es menos que ${m(d.minimo_m)} de anchura libre de paso.`,
      };
    case "plazas":
      return {
        titulo: "No caben las plazas accesibles.",
        detalle: `Se exigen ${d.exigidas} y el garaje tiene ${plural(d.plazas, "plaza", "plazas")}.`,
      };
    default:
      return null;
  }
}

export function describirDibujoSua9(j: JustificacionSua9): string {
  if (j.unifamiliar) {
    return j.decisiones.unifamiliar === "no"
      ? "Sección de la vivienda unifamiliar: las condiciones de accesibilidad de SUA 9 no le son exigibles."
      : "Sección de la vivienda unifamiliar, que debe ser accesible, con su entrada accesible.";
  }
  const a = detalle(j, "ascensor")!;
  const p = detalle(j, "plazas");
  return `Sección del edificio con el itinerario accesible desde la vía pública hasta la entrada, ${a.hay ? "el ascensor accesible" : "la previsión de ascensor, en discontinuo,"} que comunica ${a.plantas}${p && p.exigidas > 0 ? " y las plazas accesibles del garaje" : ""}.`;
}
