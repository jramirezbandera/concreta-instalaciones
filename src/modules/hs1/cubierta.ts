// =============================================================================
// DB-HS1 — La cubierta (feature-17, ap. 2.4). Grado de impermeabilidad ÚNICO e
// independiente del clima: lo alcanza cualquier solución que cumpla las
// condiciones de 2.4.2 a 2.4.4. Aquí se resuelven, con la cubierta de El
// edificio (feature-26: su tipo y su protección) y las decisiones, qué elementos
// a) a k) de 2.4.2 lleva y la pendiente de las tablas 2.9 o 2.10. PURA.
// =============================================================================

import type { SolCubierta } from "../../lib/constructivo/catalogo";
import type { TipoCubierta } from "../../lib/edificio/tipos";
import type { DecisionesEfectivasHs1 } from "./decisiones";
import { PENDIENTES_CUBIERTA_INCLINADA_TABLA_2_10, PENDIENTES_CUBIERTA_PLANA_TABLA_2_9, type ProteccionPlana } from "./tablas";

/** Un elemento de 2.4.2 y por qué lo lleva esta cubierta. */
export interface CapaCubierta {
  letra: "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k";
  elemento: string;
  /** «siempre en cubierta plana», «si HE 1 prevé condensaciones»… */
  porque: string;
  /** true: la exige esta cubierta; false: solo si se da la circunstancia que dice `porque`. */
  exigida: boolean;
}

export interface PendienteCubierta {
  tabla: "Tabla 2.9" | "Tabla 2.10";
  min_pct: number;
  /** Solo en la tabla 2.9. */
  max_pct: number | null;
  /** Tabla 2.10: la pendiente debe ser MAYOR que la mínima. */
  estricta: boolean;
  /** Qué la fija: «Grava», «Teja mixta y plana monocanal». */
  por: string;
}

export interface CubiertaHs1 {
  /** La de El edificio, para nombrarla como en HE1 y HR. */
  sol: Pick<SolCubierta, "nombre" | "codigo" | "pagina" | "soloInvertida">;
  tipo: TipoCubierta;
  plana: boolean;
  proteccion: ProteccionPlana | null;
  /** Plana: aislante sobre la impermeabilización (invertida). */
  invertida: boolean;
  /** Inclinada: fila de la tabla 2.10. */
  tejado: { pieza: string; grupo: string; min_pct: number; nota3: boolean } | null;
  /** Lleva capa de impermeabilización (siempre en plana). */
  impermeabilizacion: boolean;
  /** La pendiente que se exige; null si es inclinada con impermeabilización (la tabla 2.10 no obliga). */
  pendiente: PendienteCubierta | null;
  capas: CapaCubierta[];
  /** La ajardinada se trata con las no transitables (criterio). */
  ajardinadaCriterio: boolean;
}

export const NOMBRE_PROTECCION: Record<ProteccionPlana, string> = {
  solado_fijo: "Solado fijo",
  solado_flotante: "Solado flotante",
  capa_rodadura: "Capa de rodadura",
  grava: "Grava",
  lamina_autoprotegida: "Lámina autoprotegida",
  tierra_vegetal: "Tierra vegetal",
};

export function cubiertaDe(s: SolCubierta, d: DecisionesEfectivasHs1): CubiertaHs1 {
  const tipo = s.tipo;
  const sol = { nombre: s.nombre, codigo: s.codigo, pagina: s.pagina, soloInvertida: s.soloInvertida };
  const plana = tipo !== "inclinada";
  const capas: CapaCubierta[] = [];
  const add = (letra: CapaCubierta["letra"], elemento: string, porque: string, exigida: boolean) =>
    capas.push({ letra, elemento, porque, exigida });

  if (plana && s.proteccion) {
    // Las protecciones de la tabla 2.9, aunque el Catálogo solo tenga tres.
    const p = s.proteccion as ProteccionPlana;
    const invertida = s.soloInvertida || d.cubiertaAislante === "sobre";
    const autoprotegida = p === "lamina_autoprotegida";
    const t = PENDIENTES_CUBIERTA_PLANA_TABLA_2_9.datos[p];
    add("a", "Sistema de formación de pendientes", "siempre en cubierta plana", true);
    add("b", "Barrera contra el vapor bajo el aislante", "si el cálculo de HE 1 prevé condensaciones en el aislante", false);
    add("c", "Capa separadora bajo el aislante", "si hay materiales químicamente incompatibles", false);
    add(
      "d",
      "Aislante térmico",
      invertida ? "según HE 1; sobre la impermeabilización, apto para estar en contacto con el agua (ap. 2.4.3.2 pto 3)" : "según HE 1",
      true,
    );
    add("e", "Capa separadora bajo la impermeabilización", "si hay incompatibilidad química o el sistema no va adherido", false);
    add("f", "Capa de impermeabilización", "siempre en cubierta plana", true);
    // g) entre la protección y la impermeabilización: solo si la protección va
    // directamente sobre ella (no invertida).
    if (!autoprotegida && !invertida) {
      const g = gSeparadora(p);
      add("g", "Capa separadora entre la protección y la impermeabilización", g.porque, g.exigida);
    }
    // h) entre la protección y el aislante: en la invertida.
    if (!autoprotegida && invertida) {
      const h = hSeparadora(p);
      if (h) add("h", "Capa separadora entre la protección y el aislante", h, true);
    }
    if (!autoprotegida) add("i", `Capa de protección de ${NOMBRE_PROTECCION[p].toLowerCase()}`, "cubierta plana", true);
    add("k", "Sistema de evacuación de aguas (sumideros y rebosaderos)", "siempre; se dimensiona por HS 5", true);
    return {
      sol,
      tipo,
      plana,
      proteccion: p,
      invertida,
      tejado: null,
      impermeabilizacion: true,
      pendiente: { tabla: "Tabla 2.9", min_pct: t.min_pct, max_pct: t.max_pct, estricta: false, por: NOMBRE_PROTECCION[p] },
      capas,
      ajardinadaCriterio: p === "tierra_vegetal",
    };
  }

  const filas = PENDIENTES_CUBIERTA_INCLINADA_TABLA_2_10.datos.filas;
  const fila = filas[Math.min(Math.max(0, Math.trunc(d.cubiertaTejado)), filas.length - 1)];
  const conImper = d.cubiertaImpermeabilizacion === "con";
  add("a", "Sistema de formación de pendientes", "solo si el soporte resistente no tiene la pendiente adecuada", false);
  add("b", "Barrera contra el vapor bajo el aislante", "si el cálculo de HE 1 prevé condensaciones en el aislante", false);
  add("c", "Capa separadora bajo el aislante", "si hay materiales químicamente incompatibles", false);
  add("d", "Aislante térmico", "según HE 1", true);
  if (conImper) {
    add("e", "Capa separadora bajo la impermeabilización", "si hay incompatibilidad química o el sistema no va adherido", false);
    add("f", "Capa de impermeabilización bajo el tejado", "decisión de proyecto: con ella, la tabla 2.10 no obliga", true);
  } else {
    add("f", "Capa de impermeabilización", `si la pendiente no supera el ${fila.min_pct} % de la tabla 2.10 o el solapo es insuficiente`, false);
  }
  add("j", `Tejado: ${fila.pieza.toLowerCase()}`, "cubierta inclinada", true);
  add("k", "Sistema de evacuación de aguas (canalones y bajantes)", "siempre; se dimensiona por HS 5", true);
  return {
    sol,
    tipo,
    plana,
    proteccion: null,
    invertida: false,
    tejado: { pieza: fila.pieza, grupo: fila.grupo, min_pct: fila.min_pct, nota3: fila.nota3 },
    impermeabilizacion: conImper,
    pendiente: conImper ? null : { tabla: "Tabla 2.10", min_pct: fila.min_pct, max_pct: null, estricta: true, por: fila.pieza },
    capas,
    ajardinadaCriterio: false,
  };
}

/** g) de 2.4.2: cuándo lleva capa separadora entre la protección y la impermeabilización. */
function gSeparadora(p: ProteccionPlana): { porque: string; exigida: boolean } {
  switch (p) {
    case "grava":
      return { porque: "protección de grava: antipunzonante", exigida: true };
    case "solado_flotante":
      return { porque: "solado flotante sobre soportes", exigida: true };
    case "capa_rodadura":
      return { porque: "capa de rodadura de hormigón o aglomerado sobre mortero", exigida: true };
    case "tierra_vegetal":
      return { porque: "tierra vegetal: con capa drenante y capa filtrante encima", exigida: true };
    default:
      return { porque: "si hay que evitar la adherencia o la impermeabilización resiste poco el punzonamiento", exigida: false };
  }
}

/** h) de 2.4.2: cuándo lleva capa separadora entre la protección y el aislante (invertida). */
function hSeparadora(p: ProteccionPlana): string | null {
  switch (p) {
    case "grava":
      return "protección de grava: filtrante y antipunzonante";
    case "tierra_vegetal":
      return "tierra vegetal: con capa drenante y capa filtrante";
    case "solado_fijo":
    case "solado_flotante":
      return "transitable para peatones: antipunzonante";
    default:
      return null;
  }
}
