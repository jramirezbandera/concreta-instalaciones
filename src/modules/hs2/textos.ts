// =============================================================================
// DB-HS 2 — Textos (feature-21): la frase de la cabecera, «Qué entra», la franja
// de cada elemento, las etiquetas del dibujo y de la lista, los avisos y lo que
// no cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import { fmt } from "../../lib/units/format";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import { lista, metros } from "../sua/colocar";
import type { Ubicacion } from "./estado";
import type { DetalleHs2, ElementoHs2, JustificacionHs2, ViviendaHs2 } from "./justificacion";
import {
  ALMACEN_HS2,
  CARACTERISTICAS_HS2,
  INMEDIATO_HS2,
  NOMBRE_FRACCION,
  RESERVA_HS2,
  SITUACION_HS2,
  SUPUESTOS_A2_HS2,
  type Fraccion,
} from "./tablas";

const SIT = SITUACION_HS2.datos;
const CAR = CARACTERISTICAS_HS2.datos;
const INM = INMEDIATO_HS2.datos;

/** «2,35 m²». */
export function m2(v: number): string {
  return `${v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`;
}

/** «45 dm³», «32,55 dm³». */
export function dm3(v: number): string {
  return `${v.toLocaleString("es-ES", { maximumFractionDigits: 2 })} dm³`;
}

function num(v: number, dec = 4, min = 0): string {
  return v.toLocaleString("es-ES", { minimumFractionDigits: min, maximumFractionDigits: dec });
}

export function minus(s: string): string {
  return `${s.charAt(0).toLowerCase()}${s.slice(1)}`;
}

function mayus(s: string): string {
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
}

/** «papel / cartón, envases ligeros y vidrio». */
export function fracciones(fs: readonly Fraccion[]): string {
  return lista(fs.map((f) => minus(NOMBRE_FRACCION[f])));
}

/** «las cinco fracciones» o «papel / cartón y vidrio», para lo que no cabe. */
function fraccionesCorto(fs: readonly Fraccion[]): string {
  return fs.length === 5 ? "las cinco fracciones" : fracciones(fs);
}

export const NOMBRE_UBICACION: Record<Ubicacion, string> = {
  planta_baja: "en la planta baja",
  sotano: "en el sótano",
  exterior: "fuera del edificio, en la parcela",
};

/** «3 dormitorios (1 doble) · Pv = 4». */
export function textoVivienda(v: ViviendaHs2): string {
  return `${v.dormitorios} dormitorio${v.dormitorios === 1 ? "" : "s"} (${v.dobles} doble${v.dobles === 1 ? "" : "s"}) · Pv = ${v.pv}`;
}

function det(el: ElementoSi<unknown>): DetalleHs2 {
  return (el as ElementoHs2).detalle;
}

function buscar<C extends DetalleHs2["clase"]>(j: JustificacionHs2, clase: C): Extract<DetalleHs2, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleHs2, { clase: C }>) : null;
}

// ── Cabecera ────────────────────────────────────────────────────────────────

export function fraseHs2(j: JustificacionHs2): string {
  if (!j.residencial) return "Sin viviendas: HS 2 se justifica con un estudio específico.";
  const partes: string[] = [`${j.p} ocupante${j.p === 1 ? "" : "s"}`];
  const a = buscar(j, "almacen");
  const r = buscar(j, "reserva");
  if (a) partes.push(`almacén de contenedores de ${m2(a.dada_m2)}${a.dada_m2 + 1e-9 < a.exigida_m2 ? ` (exige ${m2(a.exigida_m2)})` : ""}`);
  if (r) partes.push(`espacio de reserva de ${m2(r.dada_m2)}${r.dada_m2 + 1e-9 < r.exigida_m2 ? ` (exige ${m2(r.exigida_m2)})` : ""}`);
  if (!a && !r) partes.push("sin almacén ni reserva: recogida sin contenedores de calle de superficie ni puerta a puerta");
  partes.push(`almacenamiento inmediato de cinco fracciones en ${j.unifamiliar ? "la vivienda" : "cada vivienda"}`);
  return `${mayus(lista(partes))}.`;
}

export function metricasHs2(j: JustificacionHs2): string {
  if (!j.residencial) return "estudio específico";
  const a = buscar(j, "almacen");
  const r = buscar(j, "reserva");
  return [`P = ${j.p}`, ...(a ? [`S ≥ ${m2(a.exigida_m2)}`] : []), ...(r ? [`SR ≥ ${m2(r.exigida_m2)}`] : [])].join(" · ");
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : "normal";
}

export function queEntraHs2(j: JustificacionHs2, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  const o = buscar(j, "ocupantes");
  if (o) {
    const n = o.viviendas.reduce((a, v) => a + v.cantidad, 0);
    filas.push({
      id: "ocupantes",
      titulo: j.unifamiliar ? "Vivienda" : "Viviendas",
      detalle: j.unifamiliar ? textoVivienda(o.viviendas[0]) : `${n} · ${o.viviendas.map((v) => `${v.cantidad} ${v.nombre}`).join(" · ")}`,
      trato: `P = ${o.p}`,
      estado: trato(estados.ocupantes),
      elementoId: "ocupantes",
    });
  }
  const a = buscar(j, "almacen");
  if (a) {
    filas.push({ id: "almacen", titulo: "Almacén", detalle: `puerta a puerta · ${fraccionesCorto(a.fracciones.map((x) => x.f))}`, trato: `≥ ${m2(a.exigida_m2)}`, estado: trato(estados.almacen), elementoId: "almacen" });
  }
  const r = buscar(j, "reserva");
  if (r) {
    filas.push({ id: "reserva", titulo: "Reserva", detalle: `contenedores de calle · ${fraccionesCorto(r.fracciones)}`, trato: `≥ ${m2(r.exigida_m2)}`, estado: trato(estados.reserva), elementoId: "reserva" });
  }
  if (j.local) filas.push({ id: "local", titulo: "Local", detalle: "otro uso", trato: "estudio específico", estado: "pv" });
  return filas;
}

export function piezasHs2(j: JustificacionHs2): { texto: string; acento: boolean }[] {
  const a = buscar(j, "almacen");
  const r = buscar(j, "reserva");
  return [
    { texto: `${j.p} ocupantes`, acento: false },
    ...(a ? [{ texto: `almacén ${m2(a.dada_m2)}`, acento: a.dada_m2 + 1e-9 < a.exigida_m2 }] : []),
    ...(r ? [{ texto: `reserva ${m2(r.dada_m2)}`, acento: r.dada_m2 + 1e-9 < r.exigida_m2 }] : []),
  ];
}

// ── Etiquetas y lista ───────────────────────────────────────────────────────

export function textoEtiquetaHs2(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ocupantes":
      return `P = ${d.p}`;
    case "almacen":
      return `S ${m2(d.dada_m2)}`;
    case "reserva":
      return `SR ${m2(d.dada_m2)}`;
    case "recorrido":
      return d.ubicacion === "exterior" ? `< ${SIT.distanciaAccesoMenorQue_m} m` : `${metros(SIT.anchuraLibre_m)} · ≤ ${SIT.pendienteMax_pct} %`;
    case "caracteristicas":
      return `${CAR.iluminacion_lux} lux · agua`;
    case "inmediato":
      return `Pv ${d.vivienda.pv} · ${dm3(Math.max(...d.capacidades.map((c) => c.exigida_dm3)))}`;
  }
}

function capacidades(d: Extract<DetalleHs2, { clase: "inmediato" }>): string {
  return d.capacidades.map((c) => `${minus(NOMBRE_FRACCION[c.f])} ${dm3(c.exigida_dm3)}`).join(" · ");
}

export function resultadoListaHs2(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ocupantes":
      return d.viviendas.map((v) => `${v.cantidad} × ${v.nombre}: Pv = ${v.pv}`).join(" · ") + ` → P = ${d.p}`;
    case "almacen":
      return `${m2(d.dada_m2)} frente a S = ${m2(d.exigida_m2)} (${fracciones(d.fracciones.map((x) => x.f))})`;
    case "reserva":
      return `${m2(d.dada_m2)} frente a SR = ${m2(d.exigida_m2)} (${fracciones(d.fracciones)})`;
    case "recorrido":
      return `${NOMBRE_UBICACION[d.ubicacion]}; recorrido de ${metros(SIT.anchuraLibre_m)} libres, sin escalones y con pendiente ≤ ${SIT.pendienteMax_pct} %`;
    case "caracteristicas":
      return `≤ ${CAR.temperaturaMax_C} °C, revestimientos lavables, toma de agua y sumidero, ${CAR.iluminacion_lux} lux y enchufe; ventilación ${fmt(d.ventilacion_l_s, "l/s", 1)}`;
    case "inmediato":
      return capacidades(d);
  }
}

// ── La franja ───────────────────────────────────────────────────────────────

const ORIGEN_SUPERFICIE = {
  edificio: "la del cuarto de El edificio",
  decision: "indicada",
  exigida: "la exigida",
} as const;

export function franjaHs2(el: ElementoSi<unknown>, j: JustificacionHs2, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "ocupantes":
      return {
        clase: "Ocupantes · ap. 2.1.2.1",
        titulo: el.nombre,
        valor: `P = ${d.p}`,
        unidad: "personas",
        estado,
        manda: "El número estimado de ocupantes habituales es la suma de los dormitorios sencillos y el doble de los dobles de todas las viviendas.",
        nota: d.viviendas.some((v) => v.doblesSupuestos && v.dormitorios > 1)
          ? "Sin indicar los dobles, el principal es doble y los demás sencillos (comentario del Ministerio, no reglamentario)."
          : undefined,
        filas: d.viviendas.map((v) => ({ k: j.unifamiliar ? "La vivienda" : `${v.cantidad} × vivienda ${v.nombre}`, v: textoVivienda(v) })),
        cita: "DB-HS · HS 2 ap. 2.1.2.1",
      };
    case "almacen": {
      const T = ALMACEN_HS2.datos;
      return {
        clase: "Almacén de contenedores · fórmula 2.1",
        titulo: el.nombre,
        valor: m2(d.dada_m2).replace(" m²", ""),
        unidad: `m² · exige ${m2(d.exigida_m2)}`,
        estado,
        manda: `Para las fracciones con recogida puerta a puerta, un almacén de S = ${num(T.factor)}·P·Σ(Tf·Gf·Cf·Mf), con Tf el periodo de recogida, Gf lo que genera cada persona, Cf el factor del contenedor que exige el servicio (tabla 2.1) y Mf = 4 en «varios».`,
        nota: d.fracciones.some((x) => x.supuesto) ? `Periodos y contenedores sin indicar: los de la tabla A.2 del DB (contenedor de ${SUPUESTOS_A2_HS2.datos.contenedor} l).` : undefined,
        filas: [
          { k: "P", v: `${d.p} personas` },
          ...d.fracciones.map((x) => ({
            k: NOMBRE_FRACCION[x.f],
            v: `Tf ${num(x.tf)} d · Gf ${num(T.gf[x.f])} · Cf ${num(T.cf[x.contenedor])} (${x.contenedor} l)${T.mf[x.f] !== 1 ? ` · Mf ${T.mf[x.f]}` : ""}`,
          })),
          { k: "Superficie útil", v: `${m2(d.dada_m2)} (${ORIGEN_SUPERFICIE[d.origen]})` },
        ],
        uso: el.uso,
        cita: "DB-HS · HS 2 ap. 2.1.2.1 y tabla 2.1",
      };
    }
    case "reserva": {
      const ff = RESERVA_HS2.datos.ff;
      const mf = ALMACEN_HS2.datos.mf;
      return {
        clase: "Espacio de reserva · fórmula 2.2",
        titulo: el.nombre,
        valor: m2(d.dada_m2).replace(" m²", ""),
        unidad: `m² · exige ${m2(d.exigida_m2)}`,
        estado,
        manda: "Para las fracciones con contenedores de calle de superficie, un espacio donde pueda construirse el almacén si pasan a recogerse puerta a puerta: SR = P·Σ(Ff·Mf), con Ff de la tabla 2.2 y Mf = 4 en «varios».",
        nota: d.origen === "edificio" ? "El cuarto de residuos de El edificio sirve de reserva: queda construido." : undefined,
        filas: [
          { k: "P", v: `${d.p} personas` },
          ...d.fracciones.map((f) => ({ k: NOMBRE_FRACCION[f], v: `Ff ${num(ff[f], 3, 3)}${mf[f] !== 1 ? ` · Mf ${mf[f]}` : ""}` })),
          { k: "Superficie", v: `${m2(d.dada_m2)} (${ORIGEN_SUPERFICIE[d.origen]})` },
        ],
        uso: el.uso,
        cita: "DB-HS · HS 2 ap. 2.1.2.2 y tabla 2.2",
      };
    }
    case "recorrido":
      return {
        clase: "Situación · ap. 2.1.1",
        titulo: el.nombre,
        valor: d.ubicacion === "exterior" ? `< ${SIT.distanciaAccesoMenorQue_m}` : metros(SIT.anchuraLibre_m).replace(" m", ""),
        unidad: d.ubicacion === "exterior" ? "m del acceso" : "m libres",
        estado,
        manda: `Fuera del edificio, a menos de ${SIT.distanciaAccesoMenorQue_m} m de su acceso. Hasta el punto de recogida exterior, un recorrido de ${metros(SIT.anchuraLibre_m)} libres (estrechamientos de ${metros(SIT.estrechamiento_minAnchura_m)} en ${Math.round(SIT.estrechamiento_maxLongitud_m * 100)} cm como mucho), puertas que abren hacia fuera, pendiente del ${SIT.pendienteMax_pct} % como máximo y sin escalones.`,
        nota:
          d.ubicacion === "sotano"
            ? "Desde el sótano, la rampa de vehículos suele pasar del 12 %: hace falta un medio mecánico o una rampa propia."
            : d.espacio === "reserva"
              ? "Interpretación: el recorrido del pto 2 se exige al almacén; se aplica a la reserva para que el almacén futuro lo cumpla."
              : undefined,
        filas: [
          { k: "Ubicación", v: `${NOMBRE_UBICACION[d.ubicacion]}${d.deEdificio ? " (El edificio)" : ""}` },
          { k: "Anchura libre", v: `≥ ${metros(SIT.anchuraLibre_m)}` },
          { k: "Pendiente", v: `≤ ${SIT.pendienteMax_pct} %, sin escalones` },
        ],
        cita: "DB-HS · HS 2 ap. 2.1.1",
      };
    case "caracteristicas":
      return {
        clase: "Almacén · ap. 2.1.3",
        titulo: el.nombre,
        valor: `${CAR.iluminacion_lux}`,
        unidad: "lux",
        estado,
        manda: `Temperatura interior de ${CAR.temperaturaMax_C} °C como máximo; paredes y suelo impermeables y fáciles de limpiar, con encuentros redondeados; toma de agua con válvula de cierre y sumidero sifónico antimúridos; ${CAR.iluminacion_lux} lux a ${metros(CAR.alturaIluminacion_m)} del suelo y ${CAR.enchufe}.`,
        nota: d.riesgo ? `Con ${m2(d.s_m2)} útiles es local de riesgo especial ${d.riesgo} (SI 1, tabla 2.1, por la construida): se justifica en SI 1.` : undefined,
        filas: [
          { k: "Superficie útil", v: m2(d.s_m2) },
          { k: "Ventilación (HS 3)", v: `${fmt(d.ventilacion_l_s, "l/s", 1)} (10 l/s por m²)` },
          { k: "Riesgo especial (SI 1)", v: d.riesgo ? `riesgo ${d.riesgo}` : "no (≤ 5 m²)" },
        ],
        cita: "DB-HS · HS 2 ap. 2.1.3",
      };
    case "inmediato":
      return {
        clase: "Almacenamiento inmediato · ap. 2.3",
        titulo: el.nombre,
        valor: `Pv ${d.vivienda.pv}`,
        unidad: "personas",
        estado,
        manda: `Un espacio por fracción, de C = CA·Pv (tabla 2.3) y nunca menos de ${INM.capacidadMin_dm3} dm³ ni de ${INM.planta_cm} × ${INM.planta_cm} cm en planta. La materia orgánica y los envases, en la cocina o en zonas anejas auxiliares; el punto más alto, a ${metros(INM.alturaMax_m)} como mucho.`,
        nota: d.enAlmacen.length > 0 ? `El papel y el vidrio pueden ir directamente al almacén de contenedores (ap. 2.3 pto 2).` : undefined,
        filas: d.capacidades.map((c) => ({
          k: NOMBRE_FRACCION[c.f],
          v: c.calculada_dm3 < c.exigida_dm3 ? `${dm3(c.calculada_dm3)} → ${dm3(c.exigida_dm3)} (mínimo)` : dm3(c.exigida_dm3),
        })),
        cita: "DB-HS · HS 2 ap. 2.3 y tabla 2.3",
      };
  }
}

// ── Avisos e incumplimientos ────────────────────────────────────────────────

export function textoAvisoHs2(a: Aviso): TextoSi {
  switch (a.id) {
    case "recogida":
      return {
        titulo: "Confirma cómo se recogen los residuos.",
        detalle: "Se supone que el municipio recoge todas las fracciones con contenedores de calle de superficie: basta con el espacio de reserva. Si alguna se recoge puerta a puerta, hace falta un almacén de contenedores; compruébalo en la ordenanza municipal.",
      };
    case "dobles":
      return {
        titulo: "Indica los dormitorios dobles.",
        detalle: "Se cuenta doble solo el dormitorio principal de cada vivienda, como dice un comentario del Ministerio (no reglamentario). P suma dos ocupantes por cada dormitorio doble: si hay más, la reserva y el almacén crecen.",
      };
    case "periodos":
      return {
        titulo: "Confirma los periodos y los contenedores del servicio.",
        detalle: `Faltan datos del servicio de recogida puerta a puerta: se toman los de la tabla A.2 del DB (${lista(["papel 7 días", "envases 2", "orgánica 1", "vidrio 7", "varios 7"])}, contenedores de ${SUPUESTOS_A2_HS2.datos.contenedor} l).`,
      };
    case "sotano":
      return {
        titulo: "Resuelve el recorrido desde el sótano.",
        detalle: `El recorrido hasta el punto de recogida no puede tener escalones ni pasar del ${SIT.pendienteMax_pct} %: la escalera no vale y la rampa del garaje suele ser más empinada (un comentario del Ministerio admite un medio mecánico). En el garaje, el almacén necesita además su propia ventilación (HS 3, tabla 2.2) y, con más de 5 m² construidos, es local de riesgo especial (SI 1).`,
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoHs2(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "almacen" || d.clase === "reserva") {
    const que = d.clase === "almacen" ? "El almacén de contenedores" : "El espacio de reserva";
    return {
      titulo: `${que} se queda corto.`,
      detalle: `Tiene ${m2(d.dada_m2)} y la fórmula ${d.clase === "almacen" ? "2.1" : "2.2"} exige ${m2(d.exigida_m2)} para ${d.p} ocupantes${d.origen === "edificio" ? ": amplía el cuarto de residuos en El edificio" : ""}.`,
    };
  }
  return null;
}

export function describirDibujoHs2(j: JustificacionHs2): string {
  if (!j.residencial) return "Sección del edificio sin viviendas.";
  const a = buscar(j, "almacen");
  const r = buscar(j, "reserva");
  const que = a && r ? "el almacén de contenedores y el espacio de reserva" : a ? "el almacén de contenedores" : r ? "el espacio de reserva" : "las viviendas";
  return `Sección del edificio con ${que}, el recorrido hasta el punto de recogida y el almacenamiento inmediato de cada vivienda.`;
}
