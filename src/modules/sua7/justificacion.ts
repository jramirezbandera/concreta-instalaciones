// =============================================================================
// DB-SUA, SUA 7 — La justificación (feature-20): el garaje del edificio frente a
// los vehículos en movimiento: el espacio de acceso y espera, los peatones por la
// rampa, los itinerarios de las plantas grandes, la señalización y el dispositivo
// de alerta en la salida. PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-sua6-sua8.md, bloques A y C2):
//   - el garaje de la unifamiliar queda fuera cualquiera que sea su superficie
//     (A.7, A.8, A.13);
//   - el de la plurifamiliar o las oficinas es uso Aparcamiento si excede de
//     100 m² construidos (la construida dada o supuesta, como en el DB-SI); si no,
//     solo cuentan sus vías de circulación: ap. 2.2 y 4.1 (A.9, K3);
//   - el ap. 3 no se aplica: el garaje es de uso privado y no tiene plantas de más
//     de 200 plazas ni de 5000 m² (C2.10); se dice con las cifras;
//   - el espacio de espera no hace falta si la salida es descendente (comentario,
//     C2.2) y el dispositivo de alerta se pone siempre (K5, C2.13).
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { edificioSua, type GarajeSua } from "../sua/edificio";
import { habitualesSua7, resolverSua7, type Alerta, type DecisionesSua7, type Peatones, type Proteccion, type Salida, type Sua7Estado } from "./estado";
import { SUA7_ESPERA, SUA7_ITINERARIOS, SUA7_PEATONES } from "./tablas";

/** Qué es el garaje para SUA 7. */
export type MotivoSua7 = "sin_garaje" | "unifamiliar" | "aparcamiento" | "vias";

export type DetalleSua7 =
  | {
      clase: "ambito";
      motivo: MotivoSua7;
      plazas: number;
      util_m2: number;
      construida_m2: number;
      supuesta: boolean;
      /** El uso Aparcamiento cambia entre la útil y la construida supuesta. */
      depende: boolean;
    }
  | {
      clase: "espera";
      salida: Salida;
      fondo_m: number;
      pendiente_pct: number;
      /** No exigible si la salida es descendente (comentario). */
      exigible: boolean;
      fondoCumple: boolean;
      pendienteCumple: boolean;
    }
  | {
      clase: "peatones";
      /** El garaje tiene rampa (no está en la planta baja). */
      rampa: boolean;
      peatones: Peatones;
      anchura_m: number;
      proteccion: Proteccion;
      cumple: boolean;
      /** Plantas de la escalera que baja al garaje, si la hay: «S1–PB». */
      escalera: string | null;
    }
  | {
      clase: "itinerarios";
      /** La planta de garaje con más plazas y la de más superficie construida. */
      plazasPlanta: number;
      superficiePlanta_m2: number;
      supera: boolean;
    }
  | { clase: "senalizacion"; usoAparcamiento: boolean }
  | { clase: "alerta"; alerta: Alerta };

export type ElementoSua7 = ElementoSi<DetalleSua7>;

export interface JustificacionSua7 extends JustificacionSiBase {
  elementos: ElementoSua7[];
  decisiones: DecisionesSua7;
  habituales: DecisionesSua7;
  motivo: MotivoSua7;
  /** El garaje tiene rampa: no está solo en la planta baja. */
  rampa: boolean;
  garaje: { plazas: number; construida_m2: number; supuesta: boolean; bajoRasante: boolean } | null;
}

const r2 = (v: number) => Math.round(v * 100) / 100;

/** Una cifra del proyectista: no negativa y finita, o la habitual. */
function cifra(v: number, habitual: number, cero = false): number {
  return Number.isFinite(v) && (v > 0 || (cero && v === 0)) ? r2(v) : habitual;
}

/** Los niveles del garaje. */
function niveles(g: GarajeSua): number[] {
  return [...new Set(g.zonas.flatMap((z) => z.niveles))];
}

/** Cómo sale el garaje a la calle si no se dice otra cosa. */
function salidaHabitual(g: GarajeSua | null): Salida {
  if (!g) return "nivel";
  const n = niveles(g);
  if (n.some((x) => x < 0)) return "ascendente";
  if (n.some((x) => x > 0)) return "descendente";
  return "nivel";
}

/** Plazas y superficie construida de la planta de garaje mayor (umbrales del ap. 3, por planta). */
function porPlanta(g: GarajeSua): { plazas: number; superficie_m2: number } {
  const grupos = new Map<string, { plazas: number; superficie_m2: number }>();
  for (const z of g.zonas) {
    const a = grupos.get(z.grupoId) ?? { plazas: 0, superficie_m2: 0 };
    a.plazas += z.zona.plazas ?? 0;
    a.superficie_m2 += z.construida.valor;
    grupos.set(z.grupoId, a);
  }
  const v = [...grupos.values()];
  return { plazas: Math.max(0, ...v.map((x) => x.plazas)), superficie_m2: Math.round(Math.max(0, ...v.map((x) => x.superficie_m2))) };
}

export function justificarSua7(estado: Sua7Estado, p: ProyectoSi): JustificacionSua7 {
  const e = edificioSua(p.edificio);
  const g = e.garaje;
  const salidaH = salidaHabitual(g);
  const salida: Salida = estado.salida === "habitual" || estado.salida === undefined ? salidaH : estado.salida;
  const habituales = habitualesSua7(salidaH, salida);
  const d0 = resolverSua7(estado, habituales);
  const decisiones: DecisionesSua7 = {
    ...d0,
    fondo_m: cifra(d0.fondo_m, habituales.fondo_m),
    pendiente_pct: cifra(d0.pendiente_pct, habituales.pendiente_pct, true),
    anchuraPeatones_m: cifra(d0.anchuraPeatones_m, habituales.anchuraPeatones_m),
  };
  const d = decisiones;
  const avisos: Aviso[] = [];
  const elementos: ElementoSua7[] = [];

  const motivo: MotivoSua7 = e.unifamiliar ? (e.resumen.tieneGaraje ? "unifamiliar" : "sin_garaje") : !g ? "sin_garaje" : g.usoAparcamiento ? "aparcamiento" : "vias";
  const rampa = g !== null && motivo !== "unifamiliar" && niveles(g).some((n) => n !== 0);

  elementos.push({
    id: "ambito",
    nombre: motivo === "aparcamiento" ? "Uso Aparcamiento" : motivo === "vias" ? "Vías de circulación" : "Garaje",
    tipo: "ambito",
    veredicto: "dato",
    valor: g && (motivo === "aparcamiento" || motivo === "vias") ? { valor: g.construida_m2, unidad: "m²" } : { texto: motivo === "unifamiliar" ? "de la unifamiliar" : "no hay" },
    manda: { tipo: "dato_de_partida", fuente: "El edificio" },
    cita: motivo === "aparcamiento" || motivo === "vias" ? ["Anejo A · Uso Aparcamiento", "SUA 7 · ap. 1"] : ["SUA 7 · ap. 1"],
    detalle: {
      clase: "ambito",
      motivo,
      plazas: g?.plazas ?? 0,
      util_m2: g?.util_m2 ?? 0,
      construida_m2: g?.construida_m2 ?? 0,
      supuesta: g?.supuesta ?? false,
      depende: g?.dependeDeConstruida ?? false,
    },
  });
  if (g?.dependeDeConstruida && motivo !== "unifamiliar") avisos.push({ id: "construida-supuesta", tipo: "supuesto", elementoId: "ambito", datos: { construida_m2: g.construida_m2, util_m2: g.util_m2 } });

  if (g && (motivo === "aparcamiento" || motivo === "vias")) {
    const aparcamiento = motivo === "aparcamiento";

    // ── 2.1 Espacio de acceso y espera (zonas de uso Aparcamiento) ──────────
    if (aparcamiento) {
      const exigible = d.salida !== "descendente";
      const fondoCumple = d.fondo_m >= SUA7_ESPERA.datos.fondoMin_m;
      const pendienteCumple = d.pendiente_pct <= SUA7_ESPERA.datos.pendienteMax_pct;
      elementos.push({
        id: "espera",
        nombre: "Espacio de acceso y espera",
        tipo: "espera",
        veredicto: !exigible ? "dato" : fondoCumple && pendienteCumple ? "ok" : "fail",
        valor: exigible ? { valor: d.fondo_m, unidad: "m" } : { texto: "no exigible" },
        ...(exigible ? { limite: { valor: SUA7_ESPERA.datos.fondoMin_m, unidad: "m" } } : {}),
        manda: { tipo: "decision_proyectista", decision: d.salida },
        cita: ["SUA 7 · ap. 2 pto 1"],
        detalle: { clase: "espera", salida: d.salida, fondo_m: d.fondo_m, pendiente_pct: d.pendiente_pct, exigible, fondoCumple, pendienteCumple },
      });
      if (!exigible) avisos.push({ id: "salida-descendente", tipo: "caso_especial", elementoId: "espera", datos: {} });
    }

    // ── 2.2 Peatones por la rampa (también en las vías de circulación) ──────
    const porRampa = rampa && d.peatones === "rampa";
    const cumple = !porRampa || d.anchuraPeatones_m >= SUA7_PEATONES.datos.anchuraMin_m;
    const escalera = e.escaleras.find((x) => x.tipo === "garaje")?.plantas ?? null;
    elementos.push({
      id: "peatones",
      nombre: "Peatones por la rampa",
      tipo: "peatones",
      veredicto: !rampa ? "dato" : cumple ? "ok" : "fail",
      valor: !rampa ? { texto: "sin rampa" } : porRampa ? { valor: d.anchuraPeatones_m, unidad: "m" } : { texto: "por la escalera" },
      ...(porRampa ? { limite: { valor: SUA7_PEATONES.datos.anchuraMin_m, unidad: "m" } } : {}),
      manda: { tipo: "decision_proyectista", decision: porRampa ? "por la rampa" : "por la escalera" },
      cita: ["SUA 7 · ap. 2 pto 2"],
      detalle: { clase: "peatones", rampa, peatones: d.peatones, anchura_m: d.anchuraPeatones_m, proteccion: d.proteccion, cumple, escalera },
    });

    // ── 3 Itinerarios peatonales de las plantas grandes ────────────────────
    if (aparcamiento) {
      const pp = porPlanta(g);
      const T = SUA7_ITINERARIOS.datos;
      const supera = pp.plazas > T.plazasMayorQue || pp.superficie_m2 > T.superficieMayorQue_m2;
      elementos.push({
        id: "itinerarios",
        nombre: "Itinerarios peatonales",
        tipo: "itinerarios",
        veredicto: "dato",
        valor: { texto: "no se aplica" },
        manda: { tipo: "dato_de_partida", fuente: "El edificio" },
        cita: ["SUA 7 · ap. 3"],
        detalle: { clase: "itinerarios", plazasPlanta: pp.plazas, superficiePlanta_m2: pp.superficie_m2, supera },
      });
      if (supera) avisos.push({ id: "planta-grande", tipo: "caso_especial", elementoId: "itinerarios", datos: { plazas: pp.plazas, superficie_m2: pp.superficie_m2 } });
    }

    // ── 4 Señalización y dispositivo de alerta ─────────────────────────────
    elementos.push({
      id: "senalizacion",
      nombre: "Señalización",
      tipo: "senalizacion",
      veredicto: "ok",
      valor: { texto: "20 km/h" },
      manda: { tipo: "decision_proyectista", decision: "señalización" },
      cita: ["SUA 7 · ap. 4 pto 1"],
      detalle: { clase: "senalizacion", usoAparcamiento: aparcamiento },
    });
    if (aparcamiento) {
      elementos.push({
        id: "alerta",
        nombre: "Dispositivo de alerta",
        tipo: "alerta",
        veredicto: "ok",
        valor: { texto: d.alerta === "detector" ? "detector" : d.alerta === "espejo" ? "espejo" : "espejo y señal luminosa" },
        manda: { tipo: "decision_proyectista", decision: d.alerta },
        cita: ["SUA 7 · ap. 4 pto 3"],
        detalle: { clase: "alerta", alerta: d.alerta },
      });
    }
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return {
    elementos,
    avisos,
    veredicto,
    decisiones,
    habituales,
    motivo,
    rampa,
    garaje: g && motivo !== "unifamiliar" ? { plazas: g.plazas, construida_m2: g.construida_m2, supuesta: g.supuesta, bajoRasante: g.bajoRasante } : null,
  };
}
