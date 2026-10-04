// =============================================================================
// DB-SUA — El edificio visto por el DB-SUA (feature-20): qué es cada zona para
// el DB (interior de vivienda, zona común, oficinas, aparcamiento, ocupación
// nula…), las escaleras que tiene, la altura y el ascensor. Lo comparten las
// nueve secciones. PURO y determinista.
//
// Lecturas (research/verificacion-sua1.md y verificacion-sua9.md):
//   - en Residencial Vivienda todas las zonas son de uso privado (Anejo A), las
//     comunes también; el interior de cada vivienda, con sus zonas exteriores
//     privativas y el garaje de la unifamiliar, es de uso restringido; las zonas
//     comunes nunca lo son;
//   - el garaje de una plurifamiliar es uso Aparcamiento solo con más de 100 m²
//     construidos (la superficie construida, como en el DB-SI, dada o supuesta);
//   - trasteros y cuartos de instalaciones son zonas de ocupación nula (Anejo SI A);
//   - el ascensor no lo describe El edificio: es un dato propio (`Edificio.ascensor`)
//     y, si no se indica, se supone que lo hay solo cuando SUA 9 lo exige.
// =============================================================================

import { viviendasEnZona, type PlantaFisica, type ResumenEdificio } from "../../lib/edificio/derivar";
import type { Edificio, UsoZona } from "../../lib/edificio/tipos";
import { dependeDeConstruida, edificioSi, superficies, type ZonaSi } from "../si/edificio";
import type { DatoSi } from "../si/tipos";
import { SUA9_ENTRE_PLANTAS, SUA_USO_APARCAMIENTO } from "./tablas";

/** Qué es una zona para el DB-SUA. */
export type ClaseSua =
  /** Interior de una vivienda (uso restringido). */
  | "vivienda"
  /** Garaje de la unifamiliar: interior de la vivienda, nunca uso Aparcamiento. */
  | "garaje_vivienda"
  /** Zonas comunes de la plurifamiliar o vestíbulo de las oficinas (uso general). */
  | "comun"
  /** Oficinas: uso Administrativo. */
  | "oficinas"
  /** Garaje de la plurifamiliar o de las oficinas (uso Aparcamiento si excede de 100 m² construidos). */
  | "garaje"
  /** Trasteros y cuartos de instalaciones: ocupación nula. */
  | "ocupacion_nula"
  /** Local sin uso: se deja previsto. */
  | "local";

export interface ZonaSua extends ZonaSi {
  clase: ClaseSua;
}

/** Una escalera que el edificio tiene que tener, deducida de sus plantas. */
export interface EscaleraSua {
  /** «interior»: la de la unifamiliar (uso restringido); «comun»: la del edificio; «garaje»: la que baja al garaje. */
  tipo: "interior" | "comun" | "garaje";
  /** Niveles que comunica, de arriba abajo. */
  niveles: number[];
  /** Etiquetas de esas plantas: «S1–P3». */
  plantas: string;
  /** Evacuación ascendente (baja a un sótano). */
  bajaASotano: boolean;
}

export interface GarajeSua {
  zonas: ZonaSua[];
  plazas: number;
  util_m2: number;
  construida_m2: number;
  supuesta: boolean;
  /** Excede de 100 m² construidos (y no es de la unifamiliar). */
  usoAparcamiento: boolean;
  /** El uso Aparcamiento cambia entre la útil y la construida supuesta: hay que indicarla. */
  dependeDeConstruida: boolean;
  bajoRasante: boolean;
}

export interface AscensorSua {
  /** SUA 9 ap. 1.1.2 lo exige. */
  exigido: boolean;
  /** Plantas que hay que salvar desde la entrada (PB), hacia arriba o hacia abajo. */
  plantasASalvar: number;
  /** Viviendas en plantas sin entrada accesible (plurifamiliar). */
  viviendasSinEntrada: number;
  /** Superficie útil (sin ocupación nula) en plantas sin entrada accesible (otros usos). */
  utilSinEntrada_m2: number;
  /** Si hay ascensor: el indicado o el supuesto (el que se exige). */
  hay: DatoSi<boolean>;
}

export interface EdificioSua {
  resumen: ResumenEdificio;
  plantas: PlantaFisica[];
  zonas: ZonaSua[];
  /** Hay viviendas (unifamiliar o plurifamiliar): uso Residencial Vivienda. */
  residencial: boolean;
  unifamiliar: boolean;
  garaje: GarajeSua | null;
  escaleras: EscaleraSua[];
  ascensor: AscensorSua;
  /** Cota de la cara superior del forjado de cubierta sobre la rasante [m]. */
  alturaCubierta_m: number;
  /** Cota del suelo de la planta más alta sobre rasante [m]. */
  cotaUltimaPlanta_m: number;
}

function claseDe(uso: UsoZona, unifamiliar: boolean): ClaseSua {
  switch (uso) {
    case "viviendas":
    case "vivienda_unifamiliar":
      return "vivienda";
    case "garaje_privado":
      return "garaje_vivienda";
    case "garaje":
      return unifamiliar ? "garaje_vivienda" : "garaje";
    case "zona_comun":
    case "vestibulo":
      return "comun";
    case "oficinas":
      return "oficinas";
    case "trasteros":
    case "instalaciones":
      return "ocupacion_nula";
    case "local_sin_uso":
      return "local";
  }
}

/** «S1–P3», o «PB» si es una sola. */
function rango(plantas: readonly PlantaFisica[], niveles: readonly number[]): string {
  const alta = plantas.find((p) => p.nivel === Math.max(...niveles));
  const baja = plantas.find((p) => p.nivel === Math.min(...niveles));
  if (!alta || !baja) return "";
  return alta.nivel === baja.nivel ? alta.etiqueta : `${baja.etiqueta}–${alta.etiqueta}`;
}

/** Los niveles con alguna zona de las clases dadas, de arriba abajo. */
function nivelesCon(plantas: readonly PlantaFisica[], zonas: readonly ZonaSua[], clases: readonly ClaseSua[]): number[] {
  const ids = new Set(zonas.filter((z) => clases.includes(z.clase)).map((z) => z.grupoId));
  return plantas.filter((p) => ids.has(p.grupoId)).map((p) => p.nivel);
}

export function edificioSua(edificio: Edificio): EdificioSua {
  const si = edificioSi(edificio);
  const r = si.resumen;
  const unifamiliar = r.esUnifamiliar;
  const plantas = si.plantas;
  const zonas: ZonaSua[] = si.zonas.map((z) => ({ ...z, clase: claseDe(z.uso, unifamiliar) }));

  // ── El garaje ─────────────────────────────────────────────────────────────
  const zonasGaraje = zonas.filter((z) => z.clase === "garaje");
  let garaje: GarajeSua | null = null;
  if (zonasGaraje.length > 0) {
    const s = superficies(zonasGaraje);
    const umbral = SUA_USO_APARCAMIENTO.datos.construidaMayorQue_m2;
    const excede = (m2: number) => m2 > umbral;
    garaje = {
      zonas: zonasGaraje,
      plazas: zonasGaraje.reduce((a, z) => a + (z.zona.plazas ?? 0) * z.repeticiones, 0),
      util_m2: s.util_m2,
      construida_m2: s.construida_m2,
      supuesta: s.supuesta,
      usoAparcamiento: excede(s.construida_m2),
      dependeDeConstruida: dependeDeConstruida(s, excede),
      bajoRasante: zonasGaraje.some((z) => z.bajoRasante),
    };
  }

  // ── Las escaleras ─────────────────────────────────────────────────────────
  const escaleras: EscaleraSua[] = [];
  if (unifamiliar) {
    const niveles = nivelesCon(plantas, zonas, ["vivienda", "garaje_vivienda"]);
    if (niveles.length > 1) {
      escaleras.push({ tipo: "interior", niveles, plantas: rango(plantas, niveles), bajaASotano: Math.min(...niveles) < 0 });
    }
  } else {
    // La común comunica las plantas que no son de ocupación nula ni solo garaje.
    const niveles = nivelesCon(plantas, zonas, ["vivienda", "comun", "oficinas", "local"]);
    const conTrasteros = nivelesCon(plantas, zonas, ["ocupacion_nula"]).filter((n) => n < 0);
    const todos = [...new Set([...niveles, ...conTrasteros])].sort((a, b) => b - a);
    if (todos.length > 1) {
      escaleras.push({ tipo: "comun", niveles: todos, plantas: rango(plantas, todos), bajaASotano: Math.min(...todos) < 0 });
    }
    if (garaje?.bajoRasante) {
      const nivGaraje = nivelesCon(plantas, zonasGaraje, ["garaje"]);
      const hasta = [...new Set([...nivGaraje, 0])].sort((a, b) => b - a);
      escaleras.push({ tipo: "garaje", niveles: hasta, plantas: rango(plantas, hasta), bajaASotano: true });
    }
  }

  // ── El ascensor (SUA 9 ap. 1.1.2), con la entrada principal en la PB ──────
  const T = SUA9_ENTRE_PLANTAS.datos;
  const cuentan = nivelesCon(plantas, zonas, ["vivienda", "comun", "oficinas", "garaje", "local"]);
  const plantasASalvar = unifamiliar || cuentan.length === 0 ? 0 : Math.max(...cuentan.map((n) => Math.abs(n)));
  let viviendasSinEntrada = 0;
  let utilSinEntrada_m2 = 0;
  for (const p of plantas) {
    if (p.nivel === 0) continue;
    for (const z of p.zonas) {
      if (z.uso === "viviendas") viviendasSinEntrada += viviendasEnZona(edificio, z);
      if (z.uso !== "trasteros" && z.uso !== "instalaciones") utilSinEntrada_m2 += z.superficieUtil_m2 > 0 ? z.superficieUtil_m2 : 0;
    }
  }
  const residencial = r.tieneViviendas;
  const exigido = unifamiliar
    ? false
    : plantasASalvar > T.plantasASalvarMasDe ||
      (residencial ? viviendasSinEntrada > T.viviendasSinEntradaMasDe : utilSinEntrada_m2 > T.utilSinEntradaMasDe_m2);
  const ascensor: AscensorSua = {
    exigido,
    plantasASalvar,
    viviendasSinEntrada,
    utilSinEntrada_m2: Math.round(utilSinEntrada_m2),
    hay: edificio.ascensor === undefined ? { valor: exigido, supuesto: true } : { valor: edificio.ascensor, supuesto: false },
  };

  const sobre = plantas.filter((p) => p.nivel >= 0);
  const alta = sobre[0];
  return {
    resumen: r,
    plantas,
    zonas,
    residencial,
    unifamiliar,
    garaje,
    escaleras,
    ascensor,
    alturaCubierta_m: alta ? Math.round((alta.cota_m + alta.altura_m) * 100) / 100 : 0,
    cotaUltimaPlanta_m: alta ? alta.cota_m : 0,
  };
}
