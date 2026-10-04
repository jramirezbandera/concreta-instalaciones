// =============================================================================
// DB-SUA, SUA 3 — La justificación (feature-20): los recintos con bloqueo
// interior, la llamada de asistencia de los aseos accesibles de uso público y la
// fuerza de apertura de las puertas de salida. PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-sua2-sua5.md, bloque B3):
//   - los baños y aseos de las viviendas con pestillo necesitan desbloqueo desde
//     fuera; la excepción del pto 1 es solo la luz (B3.2);
//   - la llamada de asistencia solo en zonas de uso público: nunca en un edificio
//     de viviendas (todo uso privado, D3); en unas oficinas, si el aseo accesible
//     sirve a la atención al público o a las salas de reuniones (D4, D4a);
//   - «puerta de salida» no está definida: portal, escalera, vestíbulos de
//     independencia, salidas del garaje, entrada a las oficinas y la de cada
//     vivienda (criterio S8); 25 N / 65 N en el itinerario accesible (B3.9).
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { edificioSua } from "../sua/edificio";
import { HABITUALES_SUA3, resolverSua3, type DecisionesSua3, type Pestillos, type Sua3Estado } from "./estado";

export type DetalleSua3 =
  | {
      clase: "bloqueo";
      pestillos: Pestillos;
      /** Recintos con bloqueo interior: «los baños y aseos de las viviendas»… */
      recintos: string[];
      /** De ellos, los que llevan la luz controlada desde dentro. */
      luzInterior: string[];
    }
  | { clase: "llamada"; publico: boolean }
  | {
      clase: "fuerza";
      salidas: string[];
      /** Puertas del itinerario accesible (25 N). */
      accesibles: string[];
      /** Resistentes al fuego del itinerario accesible (65 N). */
      resistentes: string[];
    };

export type ElementoSua3 = ElementoSi<DetalleSua3>;

export interface JustificacionSua3 extends JustificacionSiBase {
  elementos: ElementoSua3[];
  decisiones: DecisionesSua3;
  habituales: DecisionesSua3;
  unifamiliar: boolean;
  oficinas: boolean;
  local: boolean;
}

export function justificarSua3(estado: Sua3Estado, p: ProyectoSi): JustificacionSua3 {
  const e = edificioSua(p.edificio);
  const d = resolverSua3(estado);
  const unifamiliar = e.unifamiliar;
  const hay = (c: string) => e.zonas.some((z) => z.clase === c);
  const oficinas = hay("oficinas");
  const comunes = !unifamiliar && hay("comun");
  const elementos: ElementoSua3[] = [];
  const avisos: Aviso[] = [];

  // ── Recintos con bloqueo interior ─────────────────────────────────────────
  const recintos: string[] = [];
  const luzInterior: string[] = [];
  if (e.residencial) recintos.push(unifamiliar ? "los baños y aseos de la vivienda" : "los baños y aseos de las viviendas");
  if (oficinas) {
    recintos.push("los aseos de las oficinas");
    luzInterior.push("los aseos de las oficinas");
  }
  if (recintos.length > 0) {
    elementos.push({
      id: "bloqueo",
      nombre: "Recintos con bloqueo interior",
      tipo: "aprisionamiento",
      veredicto: "ok",
      valor: { texto: d.pestillos === "desbloqueo" ? "desbloqueo exterior" : "sin pestillo" },
      manda: { tipo: "decision_proyectista", decision: "pestillos" },
      cita: ["SUA 3 · ap. 1 pto 1"],
      detalle: { clase: "bloqueo", pestillos: d.pestillos, recintos, luzInterior },
    });
  }

  // ── Llamada de asistencia (solo uso público: las oficinas) ────────────────
  if (oficinas) {
    const publico = d.aseoPublico === "si";
    elementos.push({
      id: "llamada",
      nombre: "Llamada de asistencia del aseo accesible",
      tipo: "aprisionamiento",
      veredicto: publico ? "ok" : "dato",
      valor: { texto: publico ? "llamada de asistencia" : "no se exige" },
      manda: { tipo: "decision_proyectista", decision: "aseo accesible de uso público" },
      cita: ["SUA 3 · ap. 1 pto 2"],
      detalle: { clase: "llamada", publico },
    });
  }

  // ── Fuerza de apertura de las puertas de salida ───────────────────────────
  const salidas: string[] = [];
  const accesibles: string[] = [];
  const resistentes: string[] = [];
  if (unifamiliar) salidas.push("la de entrada a la vivienda");
  else {
    if (e.residencial) salidas.push("la del portal", "la de cada vivienda");
    if (oficinas) salidas.push("la de entrada a las oficinas");
    else if (comunes && !e.residencial) salidas.push("la del vestíbulo");
    if (e.escaleras.some((x) => x.tipo === "comun")) salidas.push("las de la escalera");
    // El itinerario accesible de SUA 9: desde la entrada hasta las viviendas o las oficinas.
    accesibles.push(e.residencial ? "las del itinerario accesible desde la calle hasta las viviendas" : "las del itinerario accesible desde la calle hasta las oficinas");
  }
  if (e.garaje) {
    salidas.push("las salidas peatonales del garaje");
    // El garaje comunitario se comunica con el edificio por puertas resistentes al fuego (vestíbulo de independencia).
    resistentes.push("las resistentes al fuego del recorrido accesible, como las del vestíbulo de independencia del garaje");
    avisos.push({ id: "cierrapuertas", tipo: "caso_especial", elementoId: "fuerza", datos: {} });
  }
  elementos.push({
    id: "fuerza",
    nombre: "Fuerza de apertura de las puertas de salida",
    tipo: "aprisionamiento",
    veredicto: "ok",
    valor: { texto: "≤ 140 N" },
    manda: { tipo: "decision_proyectista", decision: "fuerza de apertura" },
    cita: ["SUA 3 · ap. 1 pto 3", "Anejo A · itinerario accesible"],
    detalle: { clase: "fuerza", salidas, accesibles, resistentes },
  });

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, decisiones: d, habituales: HABITUALES_SUA3, unifamiliar, oficinas, local: hay("local") };
}
