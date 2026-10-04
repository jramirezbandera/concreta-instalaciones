// =============================================================================
// DB-HS1 — Lo que entra, deducido de El edificio (feature-17). PURA y
// DETERMINISTA; no redacta.
//
// HS 1 se aplica a los muros y suelos en contacto con el terreno y a los
// cerramientos en contacto con el aire exterior: fachadas y cubiertas (ap. 1.1).
// Del edificio salen:
//   - los SÓTANOS: sus muros y el suelo del más bajo están en contacto con el
//     terreno; el número de sótanos limita algunas soluciones de muro (notas de
//     la tabla 2.2);
//   - el SUELO DE LA PLANTA BAJA, si apoya en el terreno: sin sótano, o la parte
//     que excede la superficie del sótano;
//   - la FACHADA, con la altura de coronación del edificio sobre el terreno;
//   - la CUBIERTA, con su tipo.
//
// Criterios de proyecto (declarados en la memoria y la ficha):
//   - la cara inferior del suelo en contacto con el terreno está 0,30 m por
//     debajo de la cota del suelo (solera y su base);
//   - la altura de coronación es la cota de la cara superior del forjado de
//     cubierta: El edificio no describe petos ni remates;
//   - se toma la superficie útil como huella, como en HS6: la parte de la planta
//     baja que excede la superficie del sótano apoya en el terreno, y el muro
//     del sótano mide el perímetro de una planta cuadrada de esa superficie.
// =============================================================================

import { plantasDe } from "../../lib/edificio/derivar";
import type { Edificio, TipoCubierta, UsoZona } from "../../lib/edificio/tipos";
import type { NivelFreatico, PresenciaAgua } from "./tipos";

/** Espesor supuesto entre la cota del suelo y su cara inferior (criterio). */
export const ESPESOR_SUELO_CRITERIO_m = 0.3;

export interface SotanosHs1 {
  /** Número de plantas bajo rasante. */
  n: number;
  /** Del más alto al más bajo: -1, -2… */
  niveles: number[];
  /** Cota del suelo del sótano más bajo [m] (negativa). */
  cotaSuelo_m: number;
  /** Superficie útil del sótano más bajo [m²]. */
  superficie_m2: number;
  /** Perímetro de la planta cuadrada equivalente [m] (criterio, como en HS6). */
  perimetro_m: number;
  usos: UsoZona[];
}

export interface SueloHs1 {
  /** «suelo-sotano» o «suelo-pb». */
  id: string;
  nivel: number;
  /** Cota del suelo [m]. */
  cota_m: number;
  /** Cota de su cara inferior [m]: la que se compara con el freático. */
  caraInferior_m: number;
  superficie_m2: number;
  /** Solo la parte de la planta baja que excede la superficie del sótano. */
  parcial: boolean;
  usos: UsoZona[];
}

export interface PartesHs1 {
  sotanos: SotanosHs1 | null;
  /** Los muros de los sótanos: altura enterrada [m] = profundidad del suelo más bajo. */
  muro: { alturaEnterrada_m: number; caraInferior_m: number } | null;
  suelos: SueloHs1[];
  fachada: {
    /** Cota de la cara superior del forjado de cubierta [m]. */
    alturaCoronacion_m: number;
    plantasSobreRasante: number;
  };
  cubierta: { tipo: TipoCubierta; superficie_m2: number };
}

function sup(z: { superficieUtil_m2: number }): number {
  return Number.isFinite(z.superficieUtil_m2) ? Math.max(0, z.superficieUtil_m2) : 0;
}

function cm(v: number): number {
  return Math.round(v * 100) / 100;
}

export function partesDe(e: Edificio): PartesHs1 {
  const plantas = plantasDe(e); // de arriba abajo
  const bajo = plantas.filter((p) => p.nivel < 0);
  const pb = plantas.find((p) => p.nivel === 0) ?? null;
  const sobre = plantas.filter((p) => p.nivel >= 0);

  let sotanos: SotanosHs1 | null = null;
  let muro: PartesHs1["muro"] = null;
  const suelos: SueloHs1[] = [];

  if (bajo.length > 0) {
    const fondo = bajo[bajo.length - 1];
    const supFondo = fondo.zonas.reduce((a, z) => a + sup(z), 0);
    sotanos = {
      n: bajo.length,
      niveles: bajo.map((p) => p.nivel),
      cotaSuelo_m: fondo.cota_m,
      superficie_m2: supFondo,
      perimetro_m: cm(4 * Math.sqrt(supFondo)),
      usos: [...new Set(bajo.flatMap((p) => p.zonas.map((z) => z.uso)))],
    };
    const caraInferior_m = cm(fondo.cota_m - ESPESOR_SUELO_CRITERIO_m);
    muro = { alturaEnterrada_m: cm(-fondo.cota_m), caraInferior_m };
    suelos.push({
      id: "suelo-sotano",
      nivel: fondo.nivel,
      cota_m: fondo.cota_m,
      caraInferior_m,
      superficie_m2: supFondo,
      parcial: false,
      usos: [...new Set(fondo.zonas.map((z) => z.uso))],
    });
  }

  if (pb) {
    const supPb = pb.zonas.reduce((a, z) => a + sup(z), 0);
    const s1 = bajo.find((p) => p.nivel === -1) ?? null;
    const supS1 = s1 ? s1.zonas.reduce((a, z) => a + sup(z), 0) : 0;
    const enTerreno = s1 ? supPb - supS1 : supPb;
    if (!s1 || enTerreno > 0.5) {
      suelos.push({
        id: "suelo-pb",
        nivel: 0,
        cota_m: 0,
        caraInferior_m: cm(-ESPESOR_SUELO_CRITERIO_m),
        superficie_m2: enTerreno,
        parcial: s1 !== null,
        usos: [...new Set(pb.zonas.map((z) => z.uso))],
      });
    }
  }

  const alta = sobre[0] ?? null;
  const alturaCoronacion_m = alta ? cm(alta.cota_m + alta.altura_m) : 0;

  return {
    sotanos,
    muro,
    suelos,
    fachada: { alturaCoronacion_m, plantasSobreRasante: sobre.length },
    cubierta: { tipo: e.cubierta.tipo, superficie_m2: Number.isFinite(e.cubierta.superficie_m2) ? e.cubierta.superficie_m2 : 0 },
  };
}

/**
 * Cuánto queda la cara inferior del suelo por debajo del freático [m] (Δ); null si
 * no hay una profundidad del freático. Negativo: la cara inferior está por encima.
 */
export function deltaFreatico(caraInferior_m: number, freatico: NivelFreatico | undefined): number | null {
  if (!freatico || freatico.tipo !== "profundidad" || !Number.isFinite(freatico.profundidad_m)) return null;
  return cm(-freatico.profundidad_m - caraInferior_m);
}

/**
 * Presencia de agua (ap. 2.1.1 pto 2): la cara inferior del suelo en contacto con
 * el terreno frente al nivel freático.
 *   - baja: por encima del freático;
 *   - media: a la misma profundidad o a menos de dos metros por debajo;
 *   - alta: a dos o más metros por debajo.
 * «No detectado» se toma como baja (el llamador avisa si el reconocimiento no
 * llegó a la cara inferior). `null` si no hay freático indicado.
 */
export function presenciaAguaDe(caraInferior_m: number, freatico: NivelFreatico | undefined): PresenciaAgua | null {
  if (!freatico) return null;
  if (freatico.tipo === "no_detectado") return "baja";
  const delta = deltaFreatico(caraInferior_m, freatico);
  if (delta === null) return null;
  if (delta < 0) return "baja";
  return delta < 2 ? "media" : "alta";
}
