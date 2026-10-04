// =============================================================================
// DB-SUA, SUA 7 — Textos (feature-20): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas del dibujo y de la lista, los avisos y
// lo que no cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import { fmt } from "../../lib/units/format";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import { SUA_USO_APARCAMIENTO } from "../sua/tablas";
import type { Alerta, Proteccion, Salida } from "./estado";
import type { DetalleSua7, ElementoSua7, JustificacionSua7 } from "./justificacion";
import { SUA7_ESPERA, SUA7_ITINERARIOS, SUA7_PEATONES, SUA7_SENALIZACION } from "./tablas";

const UMBRAL = SUA_USO_APARCAMIENTO.datos.construidaMayorQue_m2;
const KMH = SUA7_SENALIZACION.datos.velocidadMax_km_h;

/** Una longitud con dos decimales: «4,50 m». */
export function m(v: number): string {
  return `${v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;
}

/** «4 %», «4,5 %». */
export function pct(v: number): string {
  return `${fmt(v, undefined, 1)} %`;
}

/** «655 m²». */
export function m2(v: number): string {
  return fmt(v, "m²", 0);
}

export const NOMBRE_SALIDA: Record<Salida, string> = {
  ascendente: "sube a la calle",
  nivel: "sale a nivel",
  descendente: "baja a la calle",
};

export const NOMBRE_ALERTA: Record<Alerta, string> = {
  espejo_luminoso: "espejo convexo y señal luminosa de salida de vehículos",
  espejo: "espejo convexo",
  detector: "detector de presencia con indicador luminoso",
};

export const NOMBRE_PROTECCION: Record<Proteccion, string> = {
  barrera: `barrera de protección de ${m(SUA7_PEATONES.datos.barreraMin_m)} de altura`,
  acera: "pavimento a un nivel más elevado",
};

function det(el: ElementoSi<unknown>): DetalleSua7 {
  return (el as ElementoSua7).detalle;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "fu" ? "out" : "normal";
}

function construida(d: Extract<DetalleSua7, { clase: "ambito" }>): string {
  return `${m2(d.construida_m2)}${d.supuesta ? " (supuestos)" : ""}`;
}

export function fraseSua7(j: JustificacionSua7): string {
  const a = j.elementos[0].detalle as Extract<DetalleSua7, { clase: "ambito" }>;
  if (j.motivo === "sin_garaje") return "El edificio no tiene garaje ni vías de circulación de vehículos: SUA 7 no es de aplicación.";
  if (j.motivo === "unifamiliar") return "El garaje es de una vivienda unifamiliar, que no es uso Aparcamiento cualquiera que sea su superficie: SUA 7 no es de aplicación.";
  const fallos = j.elementos.filter((x) => x.veredicto === "fail").map(textoEtiquetaSua7);
  if (fallos.length > 0) return `El garaje no cumple: ${fallos.join("; ")}.`;
  if (j.motivo === "vias") {
    return `El garaje, de ${construida(a)} construidos, no excede de ${m2(UMBRAL)}: no es uso Aparcamiento y solo se justifican sus vías de circulación (ap. 2.2 y 4.1).`;
  }
  const d = j.decisiones;
  const espera = d.salida === "descendente" ? "salida descendente" : `espacio de espera de ${m(d.fondo_m)} al ${pct(d.pendiente_pct)}`;
  const peatones = !j.rampa ? "" : d.peatones === "no" ? ", peatones por la escalera" : `, paso de peatones de ${m(d.anchuraPeatones_m)} por la rampa`;
  return `Garaje de uso Aparcamiento, de ${a.plazas} plazas y ${construida(a)}: ${espera}${peatones}, señalización y dispositivo de alerta en la salida.`;
}

export function metricasSua7(j: JustificacionSua7): string {
  if (!j.garaje) return j.motivo === "unifamiliar" ? "Garaje de la unifamiliar · no se aplica" : "Sin garaje · no se aplica";
  const d = j.decisiones;
  const partes = [`${j.garaje.plazas} plazas`, m2(j.garaje.construida_m2)];
  if (j.motivo === "aparcamiento") partes.push(d.salida === "descendente" ? "salida descendente" : `espera ${m(d.fondo_m)}`);
  else partes.push("solo vías");
  return partes.join(" · ");
}

export function queEntraSua7(j: JustificacionSua7, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  const a = j.elementos[0].detalle as Extract<DetalleSua7, { clase: "ambito" }>;
  if (!j.garaje) {
    filas.push({
      id: "ambito",
      titulo: "Garaje",
      detalle: j.motivo === "unifamiliar" ? "de la vivienda unifamiliar" : "no hay",
      trato: "no se aplica",
      estado: "out",
      elementoId: "ambito",
    });
    return filas;
  }
  const d = j.decisiones;
  filas.push({
    id: "ambito",
    titulo: "Garaje",
    detalle: `${a.plazas} plazas · ${construida(a)}`,
    trato: j.motivo === "aparcamiento" ? "uso Aparcamiento" : "solo vías",
    estado: trato(estados.ambito),
    elementoId: "ambito",
  });
  if (j.motivo === "aparcamiento") {
    filas.push({
      id: "espera",
      titulo: "Salida a la calle",
      detalle: d.salida === "descendente" ? "descendente" : `${NOMBRE_SALIDA[d.salida]} · espera ${m(d.fondo_m)} al ${pct(d.pendiente_pct)}`,
      trato: d.salida === "descendente" ? "no exigible" : "se comprueba",
      estado: trato(estados.espera),
      elementoId: "espera",
    });
  }
  filas.push({
    id: "peatones",
    titulo: "Peatones",
    detalle: !j.rampa ? "garaje en planta baja, sin rampa" : d.peatones === "no" ? "por el núcleo de escalera" : `por la rampa · ${m(d.anchuraPeatones_m)}`,
    trato: !j.rampa ? "sin rampa" : d.peatones === "no" ? "no por la rampa" : "se comprueba",
    estado: trato(estados.peatones),
    elementoId: "peatones",
  });
  if (j.motivo === "aparcamiento") {
    filas.push({
      id: "alerta",
      titulo: "Señalización y alerta",
      detalle: `${KMH} km/h · ${NOMBRE_ALERTA[d.alerta]}`,
      trato: "se dispone",
      estado: trato(estados.alerta),
      elementoId: "alerta",
    });
  } else {
    filas.push({
      id: "senalizacion",
      titulo: "Señalización",
      detalle: `sentido, salidas y ${KMH} km/h`,
      trato: "se dispone",
      estado: trato(estados.senalizacion),
      elementoId: "senalizacion",
    });
  }
  return filas;
}

export function textoEtiquetaSua7(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ambito":
      if (d.motivo === "sin_garaje") return "sin garaje";
      if (d.motivo === "unifamiliar") return "garaje de la unifamiliar";
      return `${d.plazas} plazas · ${m2(d.construida_m2)}`;
    case "espera":
      if (!d.exigible) return "salida descendente";
      if (!d.fondoCumple) return `espera ${m(d.fondo_m)} < 4,50 m`;
      if (!d.pendienteCumple) return `espera al ${pct(d.pendiente_pct)} > 5 %`;
      return `espera ${m(d.fondo_m)} · ${pct(d.pendiente_pct)}`;
    case "peatones":
      if (!d.rampa) return "sin rampa";
      if (d.peatones === "no") return "peatones por la escalera";
      return d.cumple ? `paso peatonal ${m(d.anchura_m)}` : `paso peatonal ${m(d.anchura_m)} < 0,80 m`;
    case "itinerarios":
      return `${d.plazasPlanta} plazas por planta`;
    case "senalizacion":
      return `${KMH} km/h`;
    case "alerta":
      return d.alerta === "detector" ? "detector de peatones" : d.alerta === "espejo" ? "espejo" : "espejo y señal luminosa";
  }
}

export function resultadoListaSua7(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ambito":
      if (d.motivo === "sin_garaje") return "no hay garaje ni vías de circulación de vehículos";
      if (d.motivo === "unifamiliar") return "garaje de vivienda unifamiliar: excluido";
      return `${d.plazas} plazas · ${construida(d)} construidos ${d.motivo === "aparcamiento" ? `> ${m2(UMBRAL)}: uso Aparcamiento` : `≤ ${m2(UMBRAL)}: solo vías de circulación`}`;
    case "espera":
      if (!d.exigible) return "salida descendente: no se exige (comentario, no reglamentario)";
      return `fondo ${m(d.fondo_m)} (≥ ${m(SUA7_ESPERA.datos.fondoMin_m)}) · pendiente ${pct(d.pendiente_pct)} (≤ ${pct(SUA7_ESPERA.datos.pendienteMax_pct)})`;
    case "peatones":
      if (!d.rampa) return "el garaje está en la planta baja: no hay rampa";
      if (d.peatones === "no") return `no se prevé paso de peatones por la rampa: acceso por la escalera${d.escalera ? ` (${d.escalera})` : ""}`;
      return `anchura ${m(d.anchura_m)} (≥ ${m(SUA7_PEATONES.datos.anchuraMin_m)}) · ${NOMBRE_PROTECCION[d.proteccion]}`;
    case "itinerarios":
      return `${d.plazasPlanta} plazas y ${m2(d.superficiePlanta_m2)} en la planta mayor · uso privado: no se aplica`;
    case "senalizacion":
      return `sentido de circulación y salidas · ${KMH} km/h · zonas de tránsito y paso de peatones`;
    case "alerta":
      return NOMBRE_ALERTA[d.alerta];
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

export function franjaSua7(el: ElementoSi<unknown>, _j: JustificacionSua7, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "ambito":
      if (d.motivo === "sin_garaje" || d.motivo === "unifamiliar") {
        return {
          clase: "Ámbito · ap. 1",
          titulo: el.nombre,
          valor: d.motivo === "sin_garaje" ? "No hay" : "Unifamiliar",
          estado,
          manda:
            d.motivo === "sin_garaje"
              ? "La Sección se aplica a las zonas de uso Aparcamiento y a las vías de circulación de vehículos de los edificios, y el edificio no tiene ninguna."
              : "El ámbito excluye a los garajes de una vivienda unifamiliar, cualquiera que sea su superficie.",
          filas: [{ k: "Garaje", v: d.motivo === "sin_garaje" ? "no" : "de una vivienda unifamiliar" }],
          cita: "DB-SUA · SUA 7 ap. 1 · Anejo A",
        };
      }
      return {
        clase: "Uso Aparcamiento · Anejo A",
        titulo: el.nombre,
        valor: fmt(d.construida_m2, undefined, 0),
        unidad: "m² construidos",
        estado,
        manda:
          d.motivo === "aparcamiento"
            ? `La superficie construida del garaje excede de ${m2(UMBRAL)}: es uso Aparcamiento y se le aplica toda la Sección.`
            : `La superficie construida del garaje no excede de ${m2(UMBRAL)}: no es uso Aparcamiento, pero sus vías de circulación siguen dentro (ap. 2.2 y 4.1).`,
        nota: d.depende ? "La construida es supuesta y con la útil no se pasaría del umbral: indícala en El edificio." : d.supuesta ? "La construida se supone a partir de la útil; el resultado no cambia." : undefined,
        filas: [
          { k: "Plazas", v: String(d.plazas) },
          { k: "Superficie útil", v: m2(d.util_m2) },
          { k: "Superficie construida", v: `${construida(d)} (umbral > ${m2(UMBRAL)})` },
        ],
        cita: "DB-SUA · Anejo A · SUA 7 ap. 1",
      };
    case "espera":
      return d.exigible
        ? {
            clase: "Espacio de acceso y espera · ap. 2.1",
            titulo: el.nombre,
            valor: m(d.fondo_m).replace(" m", ""),
            unidad: `m al ${pct(d.pendiente_pct)}`,
            estado,
            manda: `En su incorporación al exterior, el garaje tiene un espacio de acceso y espera de ${m(SUA7_ESPERA.datos.fondoMin_m)} de profundidad como mínimo, adecuada a la longitud del tipo de vehículo, y una pendiente del ${pct(SUA7_ESPERA.datos.pendienteMax_pct)} como máximo.`,
            nota: !d.fondoCumple ? `Le faltan ${m(SUA7_ESPERA.datos.fondoMin_m - d.fondo_m)} de fondo.` : !d.pendienteCumple ? "La pendiente pasa del 5 %." : undefined,
            filas: [
              { k: "Salida", v: NOMBRE_SALIDA[d.salida] },
              { k: "Fondo", v: `${m(d.fondo_m)} (≥ ${m(SUA7_ESPERA.datos.fondoMin_m)})` },
              { k: "Pendiente", v: `${pct(d.pendiente_pct)} (≤ ${pct(SUA7_ESPERA.datos.pendienteMax_pct)})` },
            ],
            cita: "DB-SUA · SUA 7 ap. 2 pto 1",
          }
        : {
            clase: "Espacio de acceso y espera · ap. 2.1",
            titulo: el.nombre,
            valor: "No exigible",
            estado,
            manda: "La salida al exterior es descendente: según el comentario del Ministerio (no reglamentario), no hace falta el espacio de acceso y espera.",
            filas: [{ k: "Salida", v: NOMBRE_SALIDA[d.salida] }],
            cita: "DB-SUA · SUA 7 ap. 2 pto 1",
          };
    case "peatones":
      if (!d.rampa || d.peatones === "no") {
        return {
          clase: "Recorridos peatonales · ap. 2.2",
          titulo: el.nombre,
          valor: !d.rampa ? "Sin rampa" : "No hay",
          estado,
          manda: "Todo recorrido para peatones previsto por una rampa para vehículos tiene 80 cm de anchura y está protegido por una barrera de 80 cm o por pavimento más elevado.",
          nota: !d.rampa ? "El garaje está en la planta baja: no tiene rampa." : `Los peatones llegan al garaje por el núcleo de escalera${d.escalera ? ` (${d.escalera})` : ""}, no por la rampa.`,
          filas: [{ k: "Paso de peatones por la rampa", v: "no" }],
          cita: "DB-SUA · SUA 7 ap. 2 pto 2",
        };
      }
      return {
        clase: "Recorridos peatonales · ap. 2.2",
        titulo: el.nombre,
        valor: m(d.anchura_m).replace(" m", ""),
        unidad: "m",
        estado,
        manda: `El paso de peatones por la rampa tiene ${m(SUA7_PEATONES.datos.anchuraMin_m)} de anchura como mínimo y está protegido por una barrera de ${m(SUA7_PEATONES.datos.barreraMin_m)} de altura como mínimo, o por pavimento a un nivel más elevado (desnivel según SUA 1 ap. 3.1).`,
        nota: d.cumple ? undefined : `Le faltan ${m(SUA7_PEATONES.datos.anchuraMin_m - d.anchura_m)} de anchura.`,
        filas: [
          { k: "Anchura", v: `${m(d.anchura_m)} (≥ ${m(SUA7_PEATONES.datos.anchuraMin_m)})` },
          { k: "Protección", v: NOMBRE_PROTECCION[d.proteccion] },
        ],
        cita: "DB-SUA · SUA 7 ap. 2 pto 2",
      };
    case "itinerarios": {
      const T = SUA7_ITINERARIOS.datos;
      return {
        clase: "Protección de recorridos peatonales · ap. 3",
        titulo: el.nombre,
        valor: "No se aplica",
        estado,
        manda: `Solo en plantas de Aparcamiento de más de ${T.plazasMayorQue} vehículos o de más de ${m2(T.superficieMayorQue_m2)}, para los itinerarios de las zonas de uso público. El garaje es de uso privado.`,
        filas: [
          { k: "Plazas en la planta mayor", v: `${d.plazasPlanta} (umbral > ${T.plazasMayorQue})` },
          { k: "Superficie en la planta mayor", v: `${m2(d.superficiePlanta_m2)} (umbral > ${m2(T.superficieMayorQue_m2)})` },
          { k: "Uso", v: "privado" },
        ],
        cita: "DB-SUA · SUA 7 ap. 3 · Anejo A",
      };
    }
    case "senalizacion":
      return {
        clase: "Señalización · ap. 4.1",
        titulo: el.nombre,
        valor: `${KMH} km/h`,
        estado,
        manda: "Conforme al código de la circulación: el sentido de la circulación y las salidas, la velocidad máxima de 20 km/h y las zonas de tránsito y paso de peatones en las vías y rampas.",
        filas: [
          { k: "Sentido y salidas", v: "señalizados" },
          { k: "Velocidad máxima", v: `${KMH} km/h` },
          { k: "Paso de peatones", v: "señalizado" },
        ],
        cita: "DB-SUA · SUA 7 ap. 4 pto 1",
      };
    case "alerta":
      return {
        clase: "Dispositivo de alerta · ap. 4.3",
        titulo: el.nombre,
        valor: d.alerta === "detector" ? "Detector" : d.alerta === "espejo" ? "Espejo" : "Espejo y luz",
        estado,
        manda: "En el acceso de vehículos al vial exterior, un dispositivo que alerta al conductor de la presencia de peatones en sus proximidades.",
        nota: "Criterio de proyecto: se dispone siempre que el garaje es uso Aparcamiento, aunque el DB no defina «establecimiento».",
        filas: [{ k: "Dispositivo", v: NOMBRE_ALERTA[d.alerta] }],
        cita: "DB-SUA · SUA 7 ap. 4 pto 3",
      };
  }
}

// -----------------------------------------------------------------------------
// Avisos y lo que no cumple
// -----------------------------------------------------------------------------

export function textoAvisoSua7(a: Aviso): TextoSi {
  switch (a.id) {
    case "construida-supuesta":
      return {
        titulo: "Falta la superficie construida del garaje.",
        detalle: `Con la supuesta excede de ${m2(UMBRAL)} y es uso Aparcamiento; con la útil no lo sería. Indica la construida en El edificio.`,
      };
    case "salida-descendente":
      return {
        titulo: "La salida descendente no lleva espacio de espera.",
        detalle: "Lo dice el comentario del Ministerio, que no es reglamentario. Compruébalo en el plano de la salida.",
      };
    case "planta-grande":
      return {
        titulo: "Una planta del garaje pasa de 200 plazas o de 5000 m².",
        detalle: "El ap. 3 se aplica a los itinerarios de las zonas de uso público: si alguna lo es, hay que identificarlos con pavimento diferenciado o elevado. La herramienta no lo comprueba.",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoSua7(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "espera") {
    return !d.fondoCumple
      ? { titulo: "El espacio de espera es corto.", detalle: `Tiene ${m(d.fondo_m)} de fondo y necesita ${m(SUA7_ESPERA.datos.fondoMin_m)} como mínimo.` }
      : { titulo: "El espacio de espera tiene demasiada pendiente.", detalle: `Tiene el ${pct(d.pendiente_pct)} y no puede pasar del ${pct(SUA7_ESPERA.datos.pendienteMax_pct)}.` };
  }
  if (d.clase === "peatones") {
    return { titulo: "El paso de peatones por la rampa es estrecho.", detalle: `Tiene ${m(d.anchura_m)} y necesita ${m(SUA7_PEATONES.datos.anchuraMin_m)} como mínimo.` };
  }
  return null;
}

export function describirDibujoSua7(j: JustificacionSua7): string {
  if (!j.garaje) return "Sección del edificio: no hay garaje al que se aplique SUA 7.";
  const d = j.decisiones;
  return `Sección del edificio con el garaje${j.rampa ? ", la rampa" : ""} y la salida a la calle${j.motivo === "aparcamiento" && d.salida !== "descendente" ? `, con el espacio de espera de ${m(d.fondo_m)}` : ""}.`;
}

/** Las piezas de la fila de La obra. */
export function piezasSua7(j: JustificacionSua7): { texto: string; acento: boolean }[] {
  if (!j.garaje) return [{ texto: j.motivo === "unifamiliar" ? "garaje unifamiliar" : "sin garaje", acento: false }];
  const d = j.decisiones;
  if (j.motivo === "vias") return [{ texto: "solo vías", acento: false }, { texto: `${KMH} km/h`, acento: false }];
  return [
    { texto: `${j.garaje.plazas} plazas`, acento: false },
    { texto: d.salida === "descendente" ? "salida descendente" : `espera ${m(d.fondo_m)}`, acento: j.veredicto === "fail" },
  ];
}

/** El límite de cada elemento para la tabla de verificación de la ficha. */
export function limiteSua7(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ambito":
      return `uso Aparcamiento > ${m2(UMBRAL)}`;
    case "espera":
      return d.exigible ? "≥ 4,50 m · ≤ 5 %" : "no exigible";
    case "peatones":
      return "≥ 0,80 m · barrera ≥ 0,80 m";
    case "itinerarios":
      return "> 200 plazas o > 5000 m² por planta";
    case "senalizacion":
      return "código de la circulación";
    case "alerta":
      return "dispositivo de alerta";
  }
}
