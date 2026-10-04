// =============================================================================
// DB-HS 2 — La memoria redactada (feature-21): el texto que el proyectista copia
// a su memoria, con las cifras y su cita, y la tabla de capacidades del
// almacenamiento inmediato. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import { lista, metros } from "../sua/colocar";
import type { DetalleHs2, JustificacionHs2 } from "./justificacion";
import { CARACTERISTICAS_HS2, FRACCIONES, INMEDIATO_HS2, MANTENIMIENTO_HS2, NOMBRE_FRACCION, SITUACION_HS2 } from "./tablas";
import { dm3, fracciones, m2, NOMBRE_UBICACION, textoVivienda } from "./textos";

const SIT = SITUACION_HS2.datos;
const CAR = CARACTERISTICAS_HS2.datos;
const INM = INMEDIATO_HS2.datos;

function detalle<C extends DetalleHs2["clase"]>(j: JustificacionHs2, clase: C): Extract<DetalleHs2, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleHs2, { clase: C }>) : null;
}

function parrafoOcupantes(j: JustificacionHs2): Trozo[] {
  const o = detalle(j, "ocupantes")!;
  const desglose = j.unifamiliar
    ? `la vivienda tiene ${textoVivienda(o.viviendas[0]).replace(" · Pv = ", ", con Pv = ")}`
    : `las viviendas son ${lista(o.viviendas.map((v) => `${v.cantidad} del tipo ${v.nombre} (${textoVivienda(v).replace(" · ", ", ")})`))}`;
  return [
    "El número estimado de ocupantes habituales del edificio, suma de los dormitorios sencillos y el doble de los dobles, es ",
    { v: `P = ${o.p}` },
    `: ${desglose} (HS 2, ap. 2.1.2.1).`,
  ];
}

function parrafoRecogida(j: JustificacionHs2): Trozo[] {
  const a = detalle(j, "almacen");
  const r = detalle(j, "reserva");
  const p: Trozo[] = [];
  if (r) {
    p.push(
      `Las fracciones de ${fracciones(r.fracciones)} tienen recogida centralizada con contenedores de calle de superficie, por lo que el edificio dispone de un espacio de reserva en el que pueda construirse un almacén de contenedores cuando pasen a tener recogida puerta a puerta (ap. 2.1 pto 1). Su superficie, calculada con la fórmula 2.2 (SR = P·Σ(Ff·Mf), tabla 2.2), es de `,
      { v: m2(r.exigida_m2) },
      r.origen === "exigida" ? "" : `; se dispone de ${m2(r.dada_m2)}${r.origen === "edificio" ? ", en el cuarto de residuos" : ""}`,
      r.dada_m2 + 1e-9 < r.exigida_m2 ? ", inferior a la exigida" : "",
      ".",
    );
  }
  if (a) {
    if (p.length > 0) p.push(" ");
    p.push(
      `Las fracciones de ${fracciones(a.fracciones.map((x) => x.f))} tienen recogida puerta a puerta, por lo que el edificio dispone de un almacén de contenedores de edificio (ap. 2.1 pto 1) con una superficie útil de `,
      { v: m2(a.dada_m2) },
      `, frente a la exigida por la fórmula 2.1 (S = 0,8·P·Σ(Tf·Gf·Cf·Mf)) de ${m2(a.exigida_m2)}, con ${lista(a.fracciones.map((x) => `${NOMBRE_FRACCION[x.f].toLowerCase()} cada ${x.tf} día${x.tf === 1 ? "" : "s"} en contenedores de ${x.contenedor} l`))}`,
      a.fracciones.some((x) => x.supuesto) ? " (valores de la tabla A.2 del DB, a falta de los del servicio de recogida)" : "",
      a.dada_m2 + 1e-9 < a.exigida_m2 ? "; NO CUMPLE" : "",
      ". Además, su superficie permite el manejo adecuado de los contenedores (ap. 2.1.2.1 pto 2).",
    );
  }
  if (!a && !r) {
    p.push("Ninguna fracción tiene recogida puerta a puerta ni con contenedores de calle de superficie, por lo que el edificio no necesita almacén de contenedores ni espacio de reserva (ap. 2.1 pto 1).");
  }
  return p;
}

function parrafoSituacion(j: JustificacionHs2): Trozo[] {
  const s = detalle(j, "recorrido");
  if (!s) return [];
  const que = s.espacio === "ambos" ? "El almacén y el espacio de reserva están" : s.espacio === "almacen" ? "El almacén está" : "El espacio de reserva está";
  return [
    `${que} ${NOMBRE_UBICACION[s.ubicacion]}`,
    s.ubicacion === "exterior" ? `, a una distancia del acceso del edificio menor que ${SIT.distanciaAccesoMenorQue_m} m` : "",
    `. El recorrido hasta el punto de recogida exterior tiene una anchura libre de `,
    { v: `${metros(SIT.anchuraLibre_m)}` },
    ` como mínimo, con estrechamientos localizados de ${metros(SIT.estrechamiento_minAnchura_m)} como mínimo y ${Math.round(SIT.estrechamiento_maxLongitud_m * 100)} cm de longitud como máximo; las puertas de apertura manual abren en el sentido de salida, la pendiente no excede del `,
    { v: `${SIT.pendienteMax_pct} %` },
    " y no hay escalones (ap. 2.1.1).",
  ];
}

function parrafoCaracteristicas(j: JustificacionHs2): Trozo[] {
  const c = detalle(j, "caracteristicas");
  if (!c) return [];
  return [
    `El almacén se proyecta de modo que su temperatura interior no supere ${CAR.temperaturaMax_C} °C; sus paredes y suelo tienen revestimiento impermeable y fácil de limpiar, con encuentros redondeados; cuenta con una toma de agua con válvula de cierre y un sumidero sifónico antimúridos, con iluminación artificial de `,
    { v: `${CAR.iluminacion_lux} lux` },
    ` a ${metros(CAR.alturaIluminacion_m)} del suelo y con una ${CAR.enchufe} (ap. 2.1.3). Su ventilación, de ${fmt(c.ventilacion_l_s, "l/s", 1)} (10 l/s por m² útil), se justifica en HS 3`,
    c.riesgo ? `, y su protección contra incendios, como local de riesgo especial ${c.riesgo}, en SI 1.` : "; no es local de riesgo especial (SI 1, tabla 2.1).",
  ];
}

function parrafoInmediato(j: JustificacionHs2): Trozo[] {
  const ins = j.elementos.filter((x) => x.detalle.clase === "inmediato");
  if (ins.length === 0) return [];
  const papelVidrio = ins.some((x) => x.detalle.clase === "inmediato" && x.detalle.enAlmacen.length > 0);
  return [
    `${j.unifamiliar ? "La vivienda dispone" : "Cada vivienda dispone"} de espacios de almacenamiento inmediato para las cinco fracciones de los residuos ordinarios, con la capacidad de la fórmula 2.3 (C = CA·Pv, tabla 2.3) y, como mínimo, `,
    { v: `${INM.capacidadMin_dm3} dm³` },
    ` y ${INM.planta_cm} × ${INM.planta_cm} cm en planta por fracción (tabla adjunta). Los de materia orgánica y envases ligeros están en la cocina o en zonas anejas auxiliares; son accesibles sin elementos auxiliares, con su punto más alto a ${metros(INM.alturaMax_m)} como máximo del suelo, y el acabado de cualquier elemento a menos de ${INM.acabado_cm} cm de ellos es impermeable y fácilmente lavable (ap. 2.3).`,
    papelVidrio ? " El papel / cartón y el vidrio pueden depositarse directamente en el almacén de contenedores (ap. 2.3 pto 2)." : "",
  ];
}

function parrafoMantenimiento(j: JustificacionHs2): Trozo[] {
  const conAlmacen = j.elementos.some((x) => x.detalle.clase === "caracteristicas");
  const base = "No se dispone instalación de traslado de residuos por bajantes (ap. 2.2).";
  if (!conAlmacen) return [base];
  const ops = MANTENIMIENTO_HS2.datos;
  return [
    `${base} Los contenedores y el almacén se señalizan según la fracción, con las instrucciones de uso en soporte indeleble en su interior, y se mantienen con la periodicidad de la tabla 3.1: ${lista(ops.map((o) => `${o.operacion.charAt(0).toLowerCase()}${o.operacion.slice(1)}, cada ${o.periodo}`))} (ap. 3.1).`,
  ];
}

function tablaInmediato(j: JustificacionHs2): MemoriaDoc["tabla"] {
  const ins = j.elementos.flatMap((x) => (x.detalle.clase === "inmediato" ? [x.detalle] : []));
  if (ins.length === 0) return undefined;
  return {
    cabecera: ["Vivienda", "Pv", ...FRACCIONES.map((f) => NOMBRE_FRACCION[f])],
    filas: ins.map((d) => [
      j.unifamiliar ? "Unifamiliar" : `Tipo ${d.vivienda.nombre}`,
      String(d.vivienda.pv),
      ...d.capacidades.map((c) => dm3(c.exigida_dm3)),
    ]),
  };
}

export function memoriaHs2(j: JustificacionHs2): MemoriaDoc {
  const fuente = ["DB-HS · HS 2 (consolidado 14-jun-2022)", "ap. 2 y 3", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · ");
  if (!j.residencial) {
    return {
      titulo: "Recogida y evacuación de residuos",
      norma: "DB-HS 2",
      parrafos: [["El edificio no tiene viviendas: la conformidad con la exigencia básica HS 2 se demuestra mediante un estudio específico, adoptando criterios análogos a los de la Sección HS 2 (ap. 1.1 pto 2)."]],
      fuente,
    };
  }
  const parrafos = [parrafoOcupantes(j), parrafoRecogida(j), parrafoSituacion(j), parrafoCaracteristicas(j), parrafoInmediato(j), parrafoMantenimiento(j)];
  if (j.local) parrafos.push(["Los residuos de los locales con otros usos se justificarán mediante un estudio específico, adoptando criterios análogos a los de la Sección HS 2 (ap. 1.1 pto 2)."]);
  if (j.oficinas) parrafos.push(["Los residuos de las oficinas se justifican mediante un estudio específico, adoptando criterios análogos a los de la Sección HS 2 (ap. 1.1 pto 2)."]);
  return {
    titulo: "Recogida y evacuación de residuos",
    norma: "DB-HS 2",
    parrafos: parrafos.filter((x) => x.length > 0),
    tabla: tablaInmediato(j),
    fuente,
  };
}
