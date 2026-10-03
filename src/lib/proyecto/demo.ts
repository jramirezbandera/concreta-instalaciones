// =============================================================================
// crearProyectoDemo — feature-6 T2.6: el proyecto Demo precargado que enseña el
// producto sin pedir nada (vivienda colectiva realista en Cáceres).
//
// Determinista por contrato: cero Date.now/Math.random — `nowIso` llega como
// parámetro. Coherencia POR CONSTRUCCIÓN: los `inputs` sembrados de cada
// justificación materializan a mano los campos heredados del contexto (zona
// térmica HS3, zona climática HE1, presión de acometida…) y el
// `resultadoCache` se calcula REALMENTE ejecutando el motor sobre esos mismos
// inputs — lo que el usuario abre coincide siempre con lo cacheado.
// =============================================================================

import { calcHS3, hs3Defaults } from "../../modules/hs3/calc";
import { calcHS4, hs4Defaults } from "../../modules/hs4/calc";
import { calcHS5, hs5Defaults } from "../../modules/hs5/calc";
import { calcHS6, hs6Defaults } from "../../modules/hs6/calc";
import { calcHE1, he1Defaults } from "../../modules/he1/calc";
import type { HS3Inputs } from "../../modules/hs3/calc";
import type { HS4Inputs } from "../../modules/hs4/calc";
import type { HS5Inputs } from "../../modules/hs5/calc";
import type { HS6Inputs } from "../../modules/hs6/calc";
import type { HE1Inputs } from "../../modules/he1/calc";
import type { ZonaClimatica } from "../../modules/he1/tablas";
import {
  LETRAS_INVIERNO,
  zonaClimaticaDe,
  zonaTermicaHS3De,
} from "../../data/zonasClimaticasHE";
import type {
  DatosGenerales,
  JustificacionEnProyecto,
  Proyecto,
  Veredicto,
} from "./tipos";

/** Id FIJO del proyecto Demo (clave estable en el índice de proyectos). */
export const DEMO_ID = "demo";

/** Nombre visible del proyecto Demo. */
export const DEMO_NOMBRE = "Demo — Vivienda C/ Mayor 12";

// -----------------------------------------------------------------------------
// DATOS GENERALES DEL DEMO — vivienda colectiva de 12 viviendas en Cáceres
// (459 m): B+3 sobre rasante, sótano de garaje y trasteros, cubierta plana no
// transitable, Zona de radón II (Apéndice B del DB-HS6) y 250 kPa de acometida.
// -----------------------------------------------------------------------------

const DATOS_GENERALES_DEMO: DatosGenerales = {
  municipio: "Cáceres",
  municipioIne: "10037", // código INE (feature-9)
  provincia: "Cáceres",
  altitud_m: 459,
  uso: "vivienda_colectiva",
  intervencion: "obra_nueva",
  plantasSobreRasante: 4,
  plantasBajoRasante: 1,
  tipoCubierta: "plana_no_transitable",
  numViviendas: 12,
  tieneGaraje: true,
  tieneTrasteros: true,
  tienePiscina: false,
  tieneLocalPB: false,
  zonaRadon: "II",
  presionAcometida_kPa: 250,
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

/**
 * Empaqueta unos inputs de módulo + su veredicto REAL como estado persistido de
 * la justificación. Los inputs viajan como copia superficial tipada
 * `Record<string, unknown>` (la forma opaca que persiste el proyecto); las
 * estructuras internas ya son copias frescas (structuredClone en el caller).
 */
function justificacionDemo(inputs: object, veredicto: Veredicto): JustificacionEnProyecto {
  return {
    inputs: { ...inputs } as Record<string, unknown>,
    schemaVersion: "1",
    resultadoCache: { veredicto },
  };
}

/**
 * Letra de invierno HE1 (α/A/B/C/D/E) de una zona del Anejo B (p.ej. "C4" → "C").
 * HE1 trabaja con la LETRA, no con la zona completa provincia+altitud.
 */
function letraInviernoDe(zonaAnejoB: string): ZonaClimatica {
  const letra = zonaAnejoB.charAt(0);
  if (!(LETRAS_INVIERNO as readonly string[]).includes(letra)) {
    throw new Error(`Zona del Anejo B sin letra de invierno reconocible: "${zonaAnejoB}"`);
  }
  return letra as ZonaClimatica;
}

// -----------------------------------------------------------------------------
// CONSTRUCTOR DEL DEMO
// -----------------------------------------------------------------------------

/**
 * Construye el proyecto Demo completo. Pura y determinista: mismo `nowIso` →
 * mismo proyecto (deep-equal). Cada llamada devuelve objetos FRESCOS (sin
 * referencias compartidas con los defaults de los módulos).
 */
export function crearProyectoDemo(nowIso: string): Proyecto {
  const dg = DATOS_GENERALES_DEMO;

  // Contexto heredado, calculado de las TABLAS (nunca de memoria):
  //   - Zona térmica HS3 de Cáceres a 459 m (Tabla 4.4 del DB-HS3) → "Z".
  //   - Zona climática del Anejo B ("C4") → letra de invierno HE1 ("C").
  // Ambas funciones solo devuelven null con provincia desconocida o altitud no
  // finita; con los datos fijos del Demo eso es imposible (fail-fast honesto).
  const zt = zonaTermicaHS3De(dg.provincia, dg.altitud_m);
  const zc = zonaClimaticaDe(dg.provincia, dg.altitud_m);
  if (zt === null || zc === null) {
    throw new Error(`Contexto no derivable para ${dg.provincia} a ${dg.altitud_m} m`);
  }

  // Inputs sembrados = defaults del módulo con los campos heredados
  // MATERIALIZADOS de forma coherente con los datos generales del Demo.
  // structuredClone ⇒ arrays/objetos anidados frescos (no se comparten los de
  // los defaults, que deben permanecer inmutables).
  const hs3Inputs: HS3Inputs = structuredClone({
    ...hs3Defaults,
    zonaTermica: zt.zona,
  });
  const hs4Inputs: HS4Inputs = structuredClone({
    ...hs4Defaults,
    presionAcometida_kPa: 250,
  });
  const hs5Inputs: HS5Inputs = structuredClone({
    ...hs5Defaults,
    uso: "privado",
    numPlantas: dg.plantasSobreRasante,
    cubiertaTransitable: false,
  });
  const hs6Inputs: HS6Inputs = structuredClone({
    ...hs6Defaults,
    municipio: dg.municipio,
    zona: dg.zonaRadon,
  });
  const he1Inputs: HE1Inputs = structuredClone({
    ...he1Defaults,
    zonaClimatica: letraInviernoDe(zc.zona),
  });

  // Cache de veredictos calculado DE VERDAD en construcción. Con esta
  // materialización los cinco salen "ok"/"warn" (HS3 da "warn" en zona Z:
  // avisos reales del motor, no se falsea el cache).
  return {
    id: DEMO_ID,
    nombre: DEMO_NOMBRE,
    creado: nowIso,
    modificado: nowIso,
    datosGenerales: { ...dg },
    justificaciones: {
      hs3: justificacionDemo(hs3Inputs, calcHS3(hs3Inputs).veredictoGlobal),
      hs4: justificacionDemo(hs4Inputs, calcHS4(hs4Inputs).veredictoGlobal),
      hs5: justificacionDemo(hs5Inputs, calcHS5(hs5Inputs).veredictoGlobal),
      hs6: justificacionDemo(hs6Inputs, calcHS6(hs6Inputs).veredictoGlobal),
      he1: justificacionDemo(he1Inputs, calcHE1(he1Inputs).veredictoGlobal),
    },
  };
}
