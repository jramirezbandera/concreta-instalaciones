// =============================================================================
// DB-SUA, SUA 3 — Textos (feature-20): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas del dibujo y de la lista, los avisos.
// Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import { lista } from "../sua/colocar";
import type { DetalleSua3, ElementoSua3, JustificacionSua3 } from "./justificacion";
import { APRISIONAMIENTO_SUA3, ASEO_ACCESIBLE_ANEJO_A } from "./tablas";

const T = APRISIONAMIENTO_SUA3.datos;
const N = (v: number) => `${v} N`;

function det(el: ElementoSi<unknown>): DetalleSua3 {
  return (el as ElementoSua3).detalle;
}

function fuerza(j: JustificacionSua3): Extract<DetalleSua3, { clase: "fuerza" }> {
  return j.elementos.find((x) => x.id === "fuerza")!.detalle as Extract<DetalleSua3, { clase: "fuerza" }>;
}

function limiteFuerza(d: Extract<DetalleSua3, { clase: "fuerza" }>): string {
  if (d.accesibles.length === 0) return `≤ ${N(T.fuerzaApertura_puertasSalida_maxN)}`;
  return `≤ ${N(T.fuerzaApertura_puertasSalida_maxN)} · accesible ≤ ${N(T.fuerzaApertura_itinerarioAccesible_maxN)}${d.resistentes.length > 0 ? ` (EI ${N(T.fuerzaApertura_itinerarioAccesible_resistenteFuego_maxN)})` : ""}`;
}

export function fraseSua3(j: JustificacionSua3): string {
  const b = j.elementos.find((x) => x.detalle.clase === "bloqueo")?.detalle;
  const partes: string[] = [];
  if (b && b.clase === "bloqueo") partes.push(b.pestillos === "desbloqueo" ? "Baños y aseos con desbloqueo desde fuera" : "Baños y aseos sin pestillo");
  const l = j.elementos.find((x) => x.detalle.clase === "llamada")?.detalle;
  if (l && l.clase === "llamada" && l.publico) partes.push("llamada de asistencia en el aseo accesible");
  partes.push(`puertas de salida que abren con ${limiteFuerza(fuerza(j)).replace(" · accesible", ", y en el itinerario accesible")}`);
  const t = lista(partes);
  return `${t.charAt(0).toUpperCase()}${t.slice(1)}.`;
}

export function metricasSua3(j: JustificacionSua3): string {
  const b = j.elementos.find((x) => x.detalle.clase === "bloqueo")?.detalle;
  const pest = b && b.clase === "bloqueo" ? (b.pestillos === "desbloqueo" ? "desbloqueo exterior" : "sin pestillo") : "sin recintos";
  return `${pest} · ${limiteFuerza(fuerza(j))}`;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : "normal";
}

export function queEntraSua3(j: JustificacionSua3, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  return j.elementos.map((el) => {
    const d = el.detalle;
    switch (d.clase) {
      case "bloqueo":
        return { id: el.id, titulo: "Baños y aseos", detalle: lista(d.recintos), trato: d.pestillos === "desbloqueo" ? "desbloqueo" : "sin pestillo", estado: trato(estados[el.id]), elementoId: el.id };
      case "llamada":
        return { id: el.id, titulo: "Aseo accesible", detalle: d.publico ? "en zona de uso público" : "sin uso público", trato: d.publico ? "llamada" : "no se exige", estado: trato(estados[el.id]), elementoId: el.id };
      case "fuerza":
        return { id: el.id, titulo: "Puertas de salida", detalle: `${d.salidas.length} tipos de puerta`, trato: limiteFuerza(d), estado: trato(estados[el.id]), elementoId: el.id };
    }
  });
}

export function textoEtiquetaSua3(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "bloqueo":
      return d.pestillos === "desbloqueo" ? "desbloqueo exterior" : "sin pestillo";
    case "llamada":
      return d.publico ? "llamada de asistencia" : "sin uso público";
    case "fuerza":
      return d.accesibles.length > 0 ? `≤ ${N(T.fuerzaApertura_puertasSalida_maxN)} · ${N(T.fuerzaApertura_itinerarioAccesible_maxN)}` : `≤ ${N(T.fuerzaApertura_puertasSalida_maxN)}`;
  }
}

export function resultadoListaSua3(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "bloqueo":
      return d.pestillos === "desbloqueo"
        ? `${lista(d.recintos)}: desbloqueo desde el exterior${d.luzInterior.length > 0 ? `; luz desde dentro en ${lista(d.luzInterior)}` : ""}`
        : `${lista(d.recintos)}: sin dispositivo de bloqueo interior`;
    case "llamada":
      return d.publico ? "dispositivo interior con llamada perceptible desde un punto de control o un paso frecuente" : "el aseo accesible no está en zona de uso público";
    case "fuerza":
      return limiteFuerza(d);
  }
}

export function franjaSua3(el: ElementoSi<unknown>, _j: JustificacionSua3, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "bloqueo":
      return {
        clase: "Aprisionamiento · ap. 1 pto 1",
        titulo: el.nombre,
        valor: d.pestillos === "desbloqueo" ? "Desbloqueo" : "Sin pestillo",
        unidad: d.pestillos === "desbloqueo" ? "desde fuera" : undefined,
        estado,
        manda:
          "Si la puerta de un recinto se puede bloquear desde dentro y alguien puede quedar atrapado, hay algún sistema para desbloquearla desde fuera. Salvo en los baños y aseos de las viviendas, la luz del recinto se controla desde dentro.",
        nota: d.recintos.some((r) => r.includes("viviend")) ? "En los baños de la vivienda la excepción es solo la luz: si tienen pestillo, también necesitan desbloqueo desde fuera." : undefined,
        filas: [
          { k: "Recintos", v: lista(d.recintos) },
          { k: "Desbloqueo desde fuera", v: d.pestillos === "desbloqueo" ? "sí (condena)" : "no hace falta: sin pestillo" },
          { k: "Luz desde dentro", v: d.luzInterior.length > 0 ? lista(d.luzInterior) : "no se exige (baños y aseos de viviendas)" },
        ],
        cita: "DB-SUA · SUA 3 ap. 1 pto 1",
      };
    case "llamada":
      return {
        clase: "Aprisionamiento · ap. 1 pto 2",
        titulo: el.nombre,
        valor: d.publico ? "Llamada" : "No se exige",
        estado,
        manda:
          "En zonas de uso público, los aseos accesibles y cabinas de vestuario accesibles tienen dentro un dispositivo fácilmente accesible que transmite una llamada de asistencia perceptible desde un punto de control, con confirmación al usuario, o desde un paso frecuente de personas.",
        nota: d.publico
          ? "Las salas de reuniones y la atención al público de unas oficinas son de uso público (comentario del Ministerio, no reglamentario)."
          : "Sin atención al público ni salas de reuniones con visitas, el aseo no está en zona de uso público.",
        filas: [
          { k: "Aseo accesible en uso público", v: d.publico ? "sí" : "no" },
          { k: "Giro libre (Anejo A)", v: `Ø ${ASEO_ACCESIBLE_ANEJO_A.datos.giroLibre_diametro_m.toLocaleString("es-ES", { minimumFractionDigits: 2 })} m` },
          { k: "Luz con temporización (Anejo A)", v: "no se admite" },
        ],
        cita: "DB-SUA · SUA 3 ap. 1 pto 2",
      };
    case "fuerza":
      return {
        clase: "Aprisionamiento · ap. 1 pto 3",
        titulo: el.nombre,
        valor: `≤ ${T.fuerzaApertura_puertasSalida_maxN}`,
        unidad: "N",
        estado,
        manda: `Las puertas de salida abren con ${N(T.fuerzaApertura_puertasSalida_maxN)} como máximo; en los itinerarios accesibles, con ${N(T.fuerzaApertura_itinerarioAccesible_maxN)}, o ${N(T.fuerzaApertura_itinerarioAccesible_resistenteFuego_maxN)} si son resistentes al fuego. Se ensaya con ${T.metodoEnsayo}.`,
        nota: d.resistentes.length > 0 ? "Las puertas con cierrapuertas quedan fuera del método de ensayo y el DB no da otro: el límite de 65 N se aplica igual." : undefined,
        filas: [
          { k: `Puertas de salida (≤ ${N(T.fuerzaApertura_puertasSalida_maxN)})`, v: lista(d.salidas) },
          ...(d.accesibles.length > 0 ? [{ k: `Itinerario accesible (≤ ${N(T.fuerzaApertura_itinerarioAccesible_maxN)})`, v: lista(d.accesibles) }] : []),
          ...(d.resistentes.length > 0 ? [{ k: `Resistentes al fuego (≤ ${N(T.fuerzaApertura_itinerarioAccesible_resistenteFuego_maxN)})`, v: lista(d.resistentes) }] : []),
        ],
        cita: "DB-SUA · SUA 3 ap. 1 ptos 3 y 4 · Anejo A",
      };
  }
}

export function textoAvisoSua3(a: Aviso): TextoSi {
  switch (a.id) {
    case "cierrapuertas":
      return {
        titulo: "Regula los cierrapuertas a 65 N.",
        detalle: "Las puertas resistentes al fuego del itinerario accesible (vestíbulo de independencia del garaje) llevan cierre automático: el ensayo de UNE-EN 12046-2 no las cubre, pero el límite de 65 N se aplica igual.",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoSua3(): TextoSi | null {
  return null;
}

export function describirDibujoSua3(j: JustificacionSua3): string {
  return `Sección del edificio con los recintos que se pueden bloquear desde dentro${j.oficinas ? ", el aseo accesible de las oficinas" : ""} y las puertas de salida, con su fuerza de apertura.`;
}

export function piezasSua3(j: JustificacionSua3): { texto: string; acento: boolean }[] {
  const b = j.elementos.find((x) => x.detalle.clase === "bloqueo")?.detalle;
  return [
    { texto: b && b.clase === "bloqueo" && b.pestillos === "sin_pestillo" ? "sin pestillo" : "desbloqueo exterior", acento: false },
    { texto: textoEtiquetaSua3(j.elementos.find((x) => x.id === "fuerza")!), acento: false },
  ];
}
