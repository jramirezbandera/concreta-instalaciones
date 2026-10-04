// =============================================================================
// DB-HE1 — La justificación entera (feature-15, HE1): la envolvente deducida de
// El edificio, verificada por `calcHE1`, con el contrato de resultado de
// REDISENO-V4 §3.2. PURA y DETERMINISTA; no redacta.
//
// Elementos: los cuatro cerramientos (U frente a su límite), la condensación
// superficial (comprobación complementaria del DA DB-HE/2), la intersticial
// (Glaser, enero, ap. 3.3) y el coeficiente global y el control solar, que se
// justifican con la herramienta oficial (fuera de alcance).
// =============================================================================

import type { Aviso, ElementoResultado } from "../../lib/cte/resultado";
import type { Edificio } from "../../lib/edificio/tipos";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import { calcHE1, type HE1Result, type ResultadoCerramientoHE1 } from "./calc";
import {
  CAPA_AISLANTE,
  limiteQueManda,
  propuestaHe1,
  type PropuestaHe1,
  type RolCerramiento,
  type SueloEnvolvente,
} from "./envolvente";
import type { He1Estado } from "./estado";
import { climaEneroDe, ulimDe, ulimParticionDe, type ZonaClimatica } from "./tablas";

/** Los datos de La obra que usa HE1. */
export interface ObraHe1 {
  provincia?: string;
  altitud_m?: number;
  municipio?: string;
}

export interface ClimaEneroHe1 {
  provincia: string;
  altitud_m: number;
  temp_C: number;
  hr_pct: number;
  altitudCapital_m: number;
  corregido: boolean;
}

export type DetalleHe1 =
  | {
      clase: "cerramiento";
      rol: RolCerramiento;
      r: ResultadoCerramientoHE1;
      /** El aislante (opacos): espesor, λ, el mínimo que cumple y su parte de la resistencia. */
      aislante: { nombre: string; espesor_mm: number; lambda_W_mK: number; minimo_mm: number | null; parteR: number } | null;
      /** El límite que manda en los opacos (Ulim o la U máxima por fRsi). */
      manda: { u: number; por: "ulim" | "fRsi" } | null;
      /** El suelo: qué hay debajo y, sobre un local, el límite con el otro criterio. */
      suelo?: { tipo: SueloEnvolvente["tipo"]; particion: boolean; otroLimite: number | null };
    }
  | { clase: "superficial"; filas: { id: RolCerramiento; fRsi: number | null }[]; fRsiMin: number }
  | { clase: "intersticial"; filas: { id: RolCerramiento; condensa: boolean | null }[] }
  | { clase: "hulc" };

export interface ElementoHe1 extends ElementoResultado {
  nombre: string;
  detalle: DetalleHe1;
}

export interface JustificacionHe1 {
  propuesta: PropuestaHe1;
  resultado: HE1Result;
  zona: ZonaClimatica;
  clima: ClimaEneroHe1 | null;
  municipio: string;
  elementos: ElementoHe1[];
  avisos: Aviso[];
  veredicto: Veredicto;
}

const ROLES: RolCerramiento[] = ["fachada", "cubierta", "suelo", "ventanas"];

export function nombreSuelo(tipo: SueloEnvolvente["tipo"]): string {
  switch (tipo) {
    case "local":
      return "Forjado sobre el local";
    case "garaje":
      return "Forjado sobre el garaje";
    case "no_habitable":
      return "Forjado sobre el sótano";
    case "zona_comun":
      return "Forjado sobre el portal";
    case "terreno":
      return "Forjado sanitario";
  }
}

function citaDe(rol: RolCerramiento, r: ResultadoCerramientoHE1): string[] {
  switch (rol) {
    case "fachada":
      return ["HE 1 · tabla 3.1.1.a · UM", "DA DB-HE/1 ec. (1)"];
    case "cubierta":
      return ["HE 1 · tabla 3.1.1.a · UC", "DA DB-HE/1 ec. (1)"];
    case "suelo":
      return r.tipoElemento === "particion_interior"
        ? ["HE 1 · ap. 3.2 · tabla 3.2", "DA DB-HE/1 tabla 6"]
        : ["HE 1 · tabla 3.1.1.a · UT", "DA DB-HE/1 ec. (6)"];
    case "ventanas":
      return ["HE 1 · tabla 3.1.1.a · UH", "DA DB-HE/1 ec. (10)"];
  }
}

export function justificarHe1(estado: He1Estado, edificio: Edificio, obra: ObraHe1 = {}): JustificacionHe1 {
  const zona = estado.zonaClimatica;
  const provincia = obra.provincia?.trim() ?? "";
  const altitud_m = Number.isFinite(obra.altitud_m) ? (obra.altitud_m as number) : 0;
  const c = provincia ? climaEneroDe(provincia, altitud_m) : null;
  const clima: ClimaEneroHe1 | null = c ? { provincia, altitud_m, ...c } : null;

  const propuesta = propuestaHe1(edificio, zona, estado, {
    tempExteriorEnero_C: clima?.temp_C,
    hrExterior_pct: clima?.hr_pct,
  });
  const resultado = calcHE1(propuesta.inputs);
  const d = propuesta.decisiones;
  const elementos: ElementoHe1[] = [];
  const avisos: Aviso[] = [];
  const porId = (id: RolCerramiento) => resultado.porCerramiento.find((x) => x.id === id)!;

  // ── Los cuatro cerramientos ─────────────────────────────────────────────────
  for (const rol of ROLES) {
    const r = porId(rol);
    const opaco = rol !== "ventanas";
    let aislante: Extract<DetalleHe1, { clase: "cerramiento" }>["aislante"] = null;
    if (opaco) {
      const capa = r.capas.find((x) => x.id === CAPA_AISLANTE[rol]);
      if (capa && capa.lambda_W_mK) {
        aislante = {
          nombre: capa.nombre,
          espesor_mm: Math.round(capa.espesor_m * 1000),
          lambda_W_mK: capa.lambda_W_mK,
          minimo_mm: propuesta.minimos[rol],
          parteR: r.rt_m2K_W > 0 ? capa.resistencia_m2K_W / r.rt_m2K_W : 0,
        };
      }
    }
    const suelo =
      rol === "suelo"
        ? {
            tipo: propuesta.envolvente.suelo.tipo,
            particion: r.tipoElemento === "particion_interior",
            otroLimite:
              propuesta.envolvente.suelo.tipo === "local"
                ? r.tipoElemento === "particion_interior"
                  ? ulimDe("contacto_no_habitable_terreno", zona)
                  : ulimParticionDe("distinto_uso", "horizontal", zona)
                : null,
          }
        : undefined;
    elementos.push({
      id: rol,
      nombre: rol === "fachada" ? "Fachada" : rol === "cubierta" ? "Cubierta" : rol === "suelo" ? nombreSuelo(propuesta.envolvente.suelo.tipo) : "Ventanas",
      tipo: "cerramiento",
      veredicto: r.cumpleU ? "ok" : "fail",
      valor: { valor: r.u_W_m2K, unidad: "W/m²K" },
      limite: r.ulim_W_m2K !== null ? { valor: r.ulim_W_m2K, unidad: "W/m²K" } : undefined,
      manda: {
        tipo: "formula",
        formula: rol === "ventanas" ? "UH = (Ag·Ug + Af·Uf + lg·Ψ)/Aw" : r.b !== 1 ? "U = b/ΣR" : "U = 1/ΣR",
        resultado: { valor: r.u_W_m2K, unidad: "W/m²K" },
      },
      cita: citaDe(rol, r),
      detalle: {
        clase: "cerramiento",
        rol,
        r,
        aislante,
        manda: opaco ? limiteQueManda(r.ulim_W_m2K, r.fRsiAplica, d.higrometria, zona) : null,
        suelo,
      },
    });
  }

  // ── Condensación superficial (DA DB-HE/2, complementaria) ──────────────────
  const filasSup = ROLES.map((id) => {
    const r = porId(id);
    return { id, fRsi: r.fRsiAplica ? r.fRsi : null };
  });
  const conFRsi = filasSup.filter((f) => f.fRsi !== null) as { id: RolCerramiento; fRsi: number }[];
  const fRsiMin = resultado.porCerramiento[0]?.fRsiMin ?? 0;
  const peorFRsi = conFRsi.length > 0 ? Math.min(...conFRsi.map((f) => f.fRsi)) : null;
  elementos.push({
    id: "superficial",
    nombre: "Condensación superficial",
    tipo: "condensacion",
    veredicto: conFRsi.every((f) => f.fRsi >= fRsiMin) ? "ok" : "fail",
    valor: peorFRsi !== null ? { valor: peorFRsi, unidad: "" } : { texto: "No procede" },
    limite: { valor: fRsiMin, unidad: "" },
    manda: { tipo: "formula", formula: "fRsi = 1 − U·0,25", resultado: { valor: peorFRsi ?? 1, unidad: "" } },
    cita: ["DA DB-HE/2 §4.1 · tabla 1", "comprobación complementaria"],
    detalle: { clase: "superficial", filas: filasSup, fRsiMin },
  });

  // ── Condensación intersticial (Glaser, enero) ───────────────────────────────
  const filasInt = ROLES.map((id) => {
    const r = porId(id);
    return { id, condensa: r.glaserAplica ? r.glaser.condensaIntersticial : null };
  });
  const condensan = filasInt.filter((f) => f.condensa === true);
  elementos.push({
    id: "intersticial",
    nombre: "Condensación intersticial",
    tipo: "condensacion",
    veredicto: "ok",
    valor: { texto: condensan.length > 0 ? "Posible" : "No hay" },
    manda: { tipo: "dato_de_partida", fuente: "DA DB-HE/2, Apéndice C, Tabla C.1 (enero)" },
    cita: ["HE 1 · ap. 3.3", "DA DB-HE/2 §4.2"],
    detalle: { clase: "intersticial", filas: filasInt },
  });
  for (const f of condensan) {
    avisos.push({ id: `intersticial-${f.id}`, tipo: "caso_especial", elementoId: f.id, datos: { rol: f.id } });
  }
  if (!clima) {
    avisos.push({ id: "clima-sin-dato", tipo: "supuesto", elementoId: "intersticial", datos: { provincia } });
  }

  // ── Lo que no es de este módulo ────────────────────────────────────────────
  elementos.push({
    id: "hulc",
    nombre: "K global y control solar",
    tipo: "fuera",
    veredicto: "fuera",
    valor: { texto: "HULC" },
    manda: { tipo: "decision_proyectista", decision: "herramienta_oficial" },
    cita: ["HE 0 y HE 1 · herramienta oficial"],
    detalle: { clase: "hulc" },
  });

  const veredicto: Veredicto = elementos.some((e) => e.veredicto === "fail") ? "fail" : "ok";
  return { propuesta, resultado, zona, clima, municipio: obra.municipio?.trim() ?? "", elementos, avisos, veredicto };
}

/** El elemento cerramiento de un rol. */
export function cerramientoDe(j: JustificacionHe1, rol: RolCerramiento): ElementoHe1 & { detalle: Extract<DetalleHe1, { clase: "cerramiento" }> } {
  const el = j.elementos.find((e) => e.id === rol)!;
  return el as ElementoHe1 & { detalle: Extract<DetalleHe1, { clase: "cerramiento" }> };
}
