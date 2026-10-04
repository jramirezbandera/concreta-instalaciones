// =============================================================================
// crearProyectoDemo — feature-6 T2.6: el proyecto Demo precargado que enseña el
// producto sin pedir nada (plurifamiliar con locales en Cáceres).
//
// Determinista por contrato: cero Date.now/Math.random — `nowIso` llega como
// parámetro. Coherencia POR CONSTRUCCIÓN: los `inputs` sembrados de cada
// justificación materializan a mano los campos heredados del contexto (zona
// térmica HS3, zona climática HE1, presión de acometida…). El estado de cada
// justificación no se guarda: se calcula (feature-16, `lib/obra/evaluar.ts`).
// =============================================================================

import { hs3EstadoDefaults, type Hs3Estado } from "../../modules/hs3/estado";
import { hs4EstadoDefaults, type Hs4Estado } from "../../modules/hs4/estado";
import { hs5EstadoDefaults, type Hs5Estado } from "../../modules/hs5/estado";
import { hs6EstadoDefaults, type Hs6Estado } from "../../modules/hs6/estado";
import { hs1EstadoDefaults, type Hs1Estado } from "../../modules/hs1/estado";
import { he1EstadoDefaults, type He1Estado } from "../../modules/he1/estado";
import type { ZonaClimatica } from "../../modules/he1/tablas";
import {
  LETRAS_INVIERNO,
  zonaClimaticaDe,
  zonaTermicaHS3De,
} from "../../data/zonasClimaticasHE";
import { edificioDeCaso } from "../edificio/casos";
import { resumenEdificio } from "../edificio/derivar";
import type {
  DatosGenerales,
  JustificacionEnProyecto,
  Proyecto,
} from "./tipos";

/** Id FIJO del proyecto Demo (clave estable en el índice de proyectos). */
export const DEMO_ID = "demo";

/** Nombre visible del proyecto Demo. */
export const DEMO_NOMBRE = "Demo — Vivienda C/ Mayor 12";

// -----------------------------------------------------------------------------
// DATOS DE LA OBRA DEL DEMO — obra nueva en Cáceres (459 m), Zona de radón II
// (Apéndice B del DB-HS6) y 250 kPa de acometida. El edificio es el caso
// «Plurifamiliar con locales» (feature-12): PB con local sin uso y portal,
// P1–P3 con dos viviendas por planta, sótano de garaje, trasteros e
// instalaciones, cubierta plana no transitable.
//
// HS5 (feature-14) y HS4, HS3, HS6 y HE1 (feature-15) salen del edificio, con
// las decisiones habituales.
// -----------------------------------------------------------------------------

const DATOS_GENERALES_DEMO: DatosGenerales = {
  municipio: "Cáceres",
  municipioIne: "10037", // código INE (feature-9)
  provincia: "Cáceres",
  altitud_m: 459,
  intervencion: "obra_nueva",
  tienePiscina: false,
  // Zona de radón: DATO DEL PROYECTISTA, pendiente de comprobar en el Apéndice
  // B. No está verificada y hay indicio de que Cáceres no figura en él
  // (research/verificacion-hs6-v4.md, nota 10.2); el Demo la conserva para
  // enseñar la protección completa de una zona II.
  zonaRadon: "II",
  presionAcometida_kPa: 250,
  // Cota del alcantarillado en la acometida (feature-14): dato de la obra del
  // Demo, como la presión. La zona pluviométrica NO se rellena: Cáceres cae
  // junto a los límites de zona e isoyeta de la Figura B.1 y no hay relación
  // oficial por municipio (research/verificacion-hs5-pluviales.md, A6e). El
  // Demo enseña el aviso de la intensidad supuesta.
  cotaAlcantarillado_m: -1.2,
  // HS1 (feature-17). Entorno urbano: Cáceres capital es «zona urbana» (terreno
  // tipo IV, por la definición literal de HS 1 · 2.3.1 b). El estudio
  // geotécnico es de DEMOSTRACIÓN, como la cota del alcantarillado: freático no
  // detectado en un reconocimiento de 10 m y Ks entre 10⁻⁵ y 10⁻² cm/s. Las zonas
  // pluviométrica y eólica NO se rellenan: Cáceres cae junto a los límites de las
  // figuras 2.4 y 2.5 y no hay relación oficial por municipio
  // (research/verificacion-hs1.md, 6.3 y 6.4). El Demo enseña el aviso del clima
  // supuesto; con 13 m de altura la zona eólica no influye y no se pide.
  terrenoTipo: "IV",
  nivelFreatico: { tipo: "no_detectado", reconocimiento_m: 10 },
  permeabilidadTerreno: "medio",
};

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

/**
 * Empaqueta unos inputs de módulo como estado persistido de la justificación.
 * Los inputs viajan como copia superficial tipada `Record<string, unknown>` (la
 * forma opaca que persiste el proyecto); las estructuras internas ya son
 * copias frescas (structuredClone en el caller).
 */
function justificacionDemo(inputs: object): JustificacionEnProyecto {
  return {
    inputs: { ...inputs } as Record<string, unknown>,
    schemaVersion: "1",
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
  const edificio = edificioDeCaso("plurifamiliar_locales");
  const resumen = resumenEdificio(edificio);

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
  // HS1 sale de El edificio y de los datos de la obra (feature-17), con las
  // decisiones habituales.
  const hs1Inputs: Hs1Estado = structuredClone({ ...hs1EstadoDefaults });
  // HS3 sale de El edificio (feature-15), con la zona térmica heredada.
  const hs3Inputs: Hs3Estado = structuredClone({ ...hs3EstadoDefaults, zonaTermica: zt.zona });
  // HS4 sale de El edificio (feature-15); la presión es el dato de la obra.
  const hs4Inputs: Hs4Estado = structuredClone({ ...hs4EstadoDefaults });
  // HS5 sale de El edificio (feature-14) con las decisiones habituales.
  const hs5Inputs: Hs5Estado = structuredClone({
    ...hs5EstadoDefaults,
    uso: "privado",
    numPlantas: resumen.plantasSobreRasante,
    cubiertaTransitable: resumen.cubiertaTransitable,
  });
  // HS6 sale de El edificio (feature-15); la zona y el municipio, de la obra.
  const hs6Inputs: Hs6Estado = structuredClone({
    ...hs6EstadoDefaults,
    municipio: dg.municipio,
    zona: dg.zonaRadon,
  });
  // HE1 sale de El edificio (feature-15); la zona, de la obra, y el clima de
  // enero, de la tabla C.1 del DA DB-HE/2 por la provincia y la altitud.
  const he1Inputs: He1Estado = structuredClone({
    ...he1EstadoDefaults,
    zonaClimatica: letraInviernoDe(zc.zona),
  });

  return {
    id: DEMO_ID,
    nombre: DEMO_NOMBRE,
    creado: nowIso,
    modificado: nowIso,
    datosGenerales: { ...dg },
    edificio,
    justificaciones: {
      hs1: justificacionDemo(hs1Inputs),
      hs3: justificacionDemo(hs3Inputs),
      hs4: justificacionDemo(hs4Inputs),
      hs5: justificacionDemo(hs5Inputs),
      hs6: justificacionDemo(hs6Inputs),
      he1: justificacionDemo(he1Inputs),
    },
  };
}
