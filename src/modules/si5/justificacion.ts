// =============================================================================
// DB-SI, SI 5 — La justificación (feature-19): con la altura de evacuación de El
// edificio y las decisiones sobre el entorno, si se exige espacio de maniobra
// (altura de evacuación descendente mayor que 9 m) y lo que deben cumplir el
// vial, ese espacio y la fachada accesible. PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-si4-si6.md, bloque C3):
//   - el vial (1.1) y la fachada accesible (2) cuelgan del espacio de maniobra
//     del 1.2: sin él no se exigen (C3.3, C3.13, interpretación);
//   - la unifamiliar no tiene orígenes de evacuación (su interior no lo es): no
//     llega al umbral (C3.20);
//   - una calle pública existente no forma parte del proyecto: se describe, no se
//     le exige (Introducción II, C3.16);
//   - las zonas forestales (pto 6) no dependen de la altura.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import { edificioSi } from "../si/edificio";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { HABITUALES_SI5, resolverSi5, type DecisionesSi5, type EspacioManiobra, type RejasFachada, type Si5Estado } from "./estado";
import { separacionMaxFachada, SI5_ENTORNO } from "./tablas";

/** Altura de evacuación a partir de la cual se exige columna seca (SI 4, tabla 1.1). */
const H_COLUMNA_SECA_m = 24;

export type DetalleSi5 =
  | { clase: "altura"; h_m: number; unifamiliar: boolean; exige: boolean }
  | {
      clase: "maniobra";
      exige: boolean;
      h_m: number;
      maniobra: EspacioManiobra;
      separacionMax_m: number;
      /** Hay columna seca (h > 24 m): el camión de bombeo a menos de 18 m de la toma. */
      columnaSeca: boolean;
    }
  | { clase: "vial"; maniobra: EspacioManiobra }
  | {
      clase: "fachada";
      rejas: RejasFachada;
      /** Las plantas con altura de evacuación mayor que 9 m (sin rejas). */
      plantasAltas: string[];
    }
  | { clase: "forestal" };

export type ElementoSi5 = ElementoSi<DetalleSi5>;

export interface JustificacionSi5 extends JustificacionSiBase {
  elementos: ElementoSi5[];
  decisiones: DecisionesSi5;
  habituales: DecisionesSi5;
  h_m: number;
  exige: boolean;
}

export function justificarSi5(estado: Si5Estado, p: ProyectoSi): JustificacionSi5 {
  const e = edificioSi(p.edificio);
  const d = resolverSi5(estado);
  const unifamiliar = e.resumen.esUnifamiliar;
  const h_m = e.alturaEvacuacion_m;
  const exige = !unifamiliar && h_m > SI5_ENTORNO.datos.umbralHDescendente_m;
  const elementos: ElementoSi5[] = [];
  const avisos: Aviso[] = [];

  elementos.push({
    id: "altura",
    nombre: "Altura de evacuación",
    tipo: "dato",
    veredicto: "dato",
    valor: unifamiliar ? { texto: "sin orígenes de evacuación" } : { valor: h_m, unidad: "m" },
    manda: { tipo: "dato_de_partida", fuente: "El edificio" },
    cita: ["SI 5 · ap. 1.2 pto 1", "Anejo SI A"],
    detalle: { clase: "altura", h_m, unifamiliar, exige },
  });

  // ── El espacio de maniobra (1.2) ──────────────────────────────────────────
  const calleQueNoCumple = exige && d.maniobra === "calle_no_cumple";
  elementos.push({
    id: "maniobra",
    nombre: "Espacio de maniobra",
    tipo: "entorno",
    veredicto: exige ? (calleQueNoCumple ? "fuera" : "ok") : "ok",
    valor: exige ? { valor: separacionMaxFachada(h_m), unidad: "m" } : { texto: "no se exige" },
    limite: exige ? { valor: separacionMaxFachada(h_m), unidad: "m" } : undefined,
    manda: {
      tipo: "grado_tabla",
      tabla: "SI 5 ap. 1.2",
      entradas: [{ k: "Altura de evacuación", v: unifamiliar ? "unifamiliar" : `${h_m} m` }],
    },
    cita: ["SI 5 · ap. 1.2", exige ? "Introducción II" : "Anejo SI A"],
    detalle: {
      clase: "maniobra",
      exige,
      h_m,
      maniobra: d.maniobra,
      separacionMax_m: separacionMaxFachada(h_m),
      columnaSeca: exige && h_m > H_COLUMNA_SECA_m,
    },
  });
  if (calleQueNoCumple) avisos.push({ id: "calle-no-cumple", tipo: "caso_especial", elementoId: "maniobra", datos: {} });
  if (exige && d.maniobra === "propio") avisos.push({ id: "maniobra-propia", tipo: "caso_especial", elementoId: "maniobra", datos: {} });

  if (exige) {
    // ── El vial de aproximación (1.1) ───────────────────────────────────────
    elementos.push({
      id: "vial",
      nombre: "Vial de aproximación",
      tipo: "entorno",
      veredicto: calleQueNoCumple ? "fuera" : "ok",
      valor: { texto: "3,5 × 4,5 m" },
      manda: { tipo: "decision_proyectista", decision: d.maniobra },
      cita: ["SI 5 · ap. 1.1"],
      detalle: { clase: "vial", maniobra: d.maniobra },
    });

    // ── La fachada accesible (2) ────────────────────────────────────────────
    const plantasAltas = e.plantas.filter((pl) => pl.nivel >= 0 && pl.cota_m > SI5_ENTORNO.datos.umbralHDescendente_m).map((pl) => pl.etiqueta);
    const rejasArriba = d.rejas === "todas" && plantasAltas.length > 0;
    elementos.push({
      id: "fachada",
      nombre: "Fachada accesible",
      tipo: "fachada",
      veredicto: rejasArriba ? "fail" : "ok",
      valor: { texto: "huecos 0,80 × 1,20 m" },
      manda: { tipo: "decision_proyectista", decision: d.rejas },
      cita: ["SI 5 · ap. 2"],
      detalle: { clase: "fachada", rejas: d.rejas, plantasAltas },
    });
  }

  if (d.forestal === "si") {
    elementos.push({
      id: "forestal",
      nombre: "Zona forestal",
      tipo: "entorno",
      veredicto: "ok",
      valor: { valor: SI5_ENTORNO.datos.forestal.franja_m, unidad: "m" },
      manda: { tipo: "decision_proyectista", decision: "forestal" },
      cita: ["SI 5 · ap. 1.2 pto 6"],
      detalle: { clase: "forestal" },
    });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, decisiones: d, habituales: HABITUALES_SI5, h_m, exige };
}
