import type { Veredicto } from "../pdf/renderFicha";
import type { ZonaRadon } from "../../modules/hs6/tablas";
import type { ZonaTermica } from "../../modules/hs3/tablas";

// Modelo de datos del EXPEDIENTE (feature-6 §A, UX-RECONCEPT §2–§3): el producto deja de ser
// "5 calculadoras con sidebar" y pasa a ser gestor de expedientes de justificación CTE.
// Este archivo contiene SOLO tipos y constantes — cero lógica, cero React/DOM. Las funciones
// puras (derivarContexto, aplicabilidadBase…) y la persistencia viven en archivos hermanos.

export type { Veredicto, ZonaRadon, ZonaTermica };

// -----------------------------------------------------------------------------
// CLAVES DE JUSTIFICACIÓN
// -----------------------------------------------------------------------------

/**
 * Clave canónica de cada justificación del mapa de cobertura (UX-RECONCEPT §10).
 * Incluye las 5 shipped (hs3/hs4/hs5/hs6/he1), las "Próximamente" y las EXTERNAS
 * (`he0he1_global` → HULC; `dbse` → Concreta estructura). Es la clave de
 * `Proyecto.justificaciones` y del `justificacionRegistry`.
 */
export type JustificacionKey =
  | "hs3" | "hs4" | "hs5" | "hs6" | "he1"
  | "hs1" | "hs2"
  | "si1" | "si2" | "si3" | "si4" | "si5" | "si6"
  | "sua1" | "sua4" | "sua6" | "sua7" | "sua8" | "sua9"
  | "hr" | "he4" | "he5" | "rebt" | "he0he1_global" | "dbse";

// -----------------------------------------------------------------------------
// LOS TRES EJES DEL PROYECTO (§2): uso × intervención × atributos → checklist
// -----------------------------------------------------------------------------

/**
 * Uso del edificio — eje estructural, no un campo más (§2.1). Solo vivienda:
 * los usos no soportados NO se ofrecen en el selector (rechazo honesto en UI).
 */
export type Uso = "vivienda_unifamiliar" | "vivienda_colectiva";

/**
 * Tipo de intervención (CTE Parte I art. 2). Obra nueva es el caso particular donde todo
 * aplica; el motor de aplicabilidad para el resto llega en Fase E (§5 del reconcept).
 */
export type Intervencion = "obra_nueva" | "reforma" | "ampliacion" | "cambio_uso";

/** Tipo de cubierta (geometría gruesa, §2.3) — discrimina exigencias de HS1/HS5/SUA. */
export type TipoCubierta = "plana_transitable" | "plana_no_transitable" | "inclinada";

/**
 * Alturas suelo-a-suelo por planta [m] (feature-10). Las longitudes deben casar
 * con `plantasSobreRasante`/`plantasBajoRasante`; el formulario las reconcilia
 * al cambiar los contadores (`reconciliarAlturas`) y la derivación tolera un
 * desfase completando con la estimación de 3 m y declarándolo en la procedencia.
 */
export interface AlturasPlantas {
  /** `sobre[0]` = planta baja, hacia arriba. La última incluye su altura hasta cubierta. */
  sobre: number[];
  /** `bajo[0]` = sótano 1, hacia abajo. */
  bajo: number[];
}

/**
 * Aplicabilidad de una justificación al proyecto (§3): la propone `aplicabilidadBase`
 * y el proyectista puede forzarla (la herramienta propone, el proyectista dispone).
 *   - `aplica`              → exigible en su totalidad (obra nueva por defecto).
 *   - `aplica_reformado`    → solo sobre lo modificado (reformas, CTE Parte I art. 2).
 *   - `aplica_flexibilidad` → aplica con criterio de flexibilidad/proporcionalidad.
 *   - `no_aplica`           → fuera de ámbito, con párrafo redactado + cita (p.ej. SUA6 sin piscina).
 *   - `externo`             → se justifica con otra herramienta (HULC, Concreta estructura).
 */
export type Aplicabilidad = "aplica" | "aplica_reformado" | "aplica_flexibilidad" | "no_aplica" | "externo";

/**
 * Progreso de una justificación — DERIVADO del cálculo real, nunca marcado a mano (§3):
 * `sin_iniciar` = sin inputs guardados · `en_curso` = inputs guardados pero sin veredicto ·
 * `cumple`/`no_cumple` = veredicto del motor sobre los inputs guardados.
 */
export type Progreso = "sin_iniciar" | "en_curso" | "cumple" | "no_cumple";

// -----------------------------------------------------------------------------
// DATOS GENERALES (§2.3): ~12 atributos discriminantes, se rellenan una vez
// -----------------------------------------------------------------------------

/** Atributos discriminantes del expediente. De aquí se deriva el contexto heredado por módulos. */
export interface DatosGenerales {
  municipio: string;
  /**
   * Código INE del municipio (5 dígitos: 2 de provincia + 3 de municipio) —
   * feature-9. Es la CLAVE ESTABLE con la que cruzar las tablas normativas que
   * clasifican por municipio (zona de radón del DB-HS6 Apéndice B, aceleración
   * sísmica NCSE-02, pluviometría…): el nombre no sirve como clave porque
   * "Vitoria", "Vitoria-Gasteiz" y "Gasteiz" son el mismo municipio escrito de
   * tres formas. `municipio` se conserva para MOSTRAR.
   *
   * Opcional: los expedientes creados antes de feature-9 no lo tienen (el
   * schema sigue siendo "1"; el campo es aditivo). Quien lo consuma debe
   * tratar su ausencia, no asumirlo.
   */
  municipioIne?: string;
  provincia: string;
  /** Altitud sobre el nivel del mar [m] — corrige la zona climática de la capital (DB-HE Anejo B). */
  altitud_m: number;
  uso: Uso;
  intervencion: Intervencion;
  /** Plantas sobre rasante — de aquí se deriva la altura de evacuación (SI/SUA). */
  plantasSobreRasante: number;
  plantasBajoRasante: number;
  /**
   * Altura suelo-a-suelo de cada planta [m] — feature-10. `sobre[0]` es la
   * planta baja y crece hacia arriba; `bajo[0]` es el sótano 1 y crece hacia
   * abajo. De aquí se deriva la altura de evacuación REAL (cota del suelo de la
   * última planta) en vez de la estimación de 3 m/planta, y en el futuro las
   * cotas que necesitan HS4 (presión en el punto más desfavorable), HS5
   * (bajantes) y SI (evacuación ascendente de sótanos).
   *
   * Opcional y ADITIVO (schema sigue en "1"): ausente ⇒ estimación 3 m/planta,
   * que es lo que tienen todos los expedientes anteriores a esta feature.
   */
  alturasPlantas_m?: AlturasPlantas;
  tipoCubierta: TipoCubierta;
  numViviendas: number;
  /** El garaje entra en el 80 %: arrastra HS3-garajes, SI-aparcamiento y SUA7 (§2.3). */
  tieneGaraje: boolean;
  tieneTrasteros: boolean;
  /** Sin piscina ⇒ SUA6 `no_aplica` con párrafo redactado y cita de ámbito. */
  tienePiscina: boolean;
  tieneLocalPB: boolean;
  /**
   * Zona de radón del municipio — ENTRADA MANUAL con procedencia Apéndice B del DB-HS6
   * (decisión feature-5: no se embebe el listado de municipios).
   */
  zonaRadon: ZonaRadon;
  /** "Datos de suministro" opcional [kPa] → herencia hacia HS4 solo si está informado. */
  presionAcometida_kPa?: number;
}

// -----------------------------------------------------------------------------
// CONTEXTO DERIVADO: calculado por `derivarContexto`, nunca almacenado como verdad
// -----------------------------------------------------------------------------

/** Dato derivado con su PROCEDENCIA (tabla/regla que lo produce) — trazabilidad hasta la ficha. */
export interface Derivado<T> { valor: T; procedencia: string }

/**
 * Contexto derivado de `DatosGenerales` que heredan los módulos (barra de contexto, §4.3).
 * Lo produce la función pura `derivarContexto(datosGenerales)` del motor.
 */
export interface ContextoDerivado {
  /** Zona climática HE (de provincia + altitud, DB-HE1 Tabla a / Anejo B). */
  zonaClimatica: Derivado<string>;
  /** Zona térmica del edificio para HS3 (Tabla 4.4 del DB-HS3). */
  zonaTermicaHS3: Derivado<ZonaTermica>;
  /** Altura de evacuación [m] (de plantas sobre rasante) — discrimina SI/SUA. */
  alturaEvacuacion_m: Derivado<number>;
}

// -----------------------------------------------------------------------------
// ESTADO POR JUSTIFICACIÓN DENTRO DEL PROYECTO
// -----------------------------------------------------------------------------

/** Último resultado conocido del motor sobre los inputs guardados (cache para el dashboard). */
export interface ResultadoCache { veredicto: Veredicto; resumen?: string }

/**
 * Lo que el proyecto persiste de cada justificación. Los inputs de módulo pasan a vivir
 * AQUÍ (no en la clave suelta legacy por módulo, feature-6 §B).
 */
export interface JustificacionEnProyecto {
  /** Inputs del módulo tal y como los persiste `useJustificacionState` (forma opaca para el proyecto). */
  inputs?: Record<string, unknown>;
  /** Versión de schema de los inputs del módulo (patrón `getModuleSchemaVersion`). */
  schemaVersion?: string;
  /** Cache del último veredicto — alimenta el chip de progreso sin re-ejecutar el motor. */
  resultadoCache?: ResultadoCache;
  /** Campos del contexto heredado con override local declarado (viajan a la ficha como excepción). */
  overridesContexto?: string[];
  /** Aplicabilidad FORZADA por el proyectista (prevalece sobre `aplicabilidadBase`). */
  aplicabilidadForzada?: { valor: Aplicabilidad; nota?: string };
  /** Referencia de documento externo (p.ej. expediente HULC) para justificaciones `externo`. */
  refExterna?: string;
}

/**
 * El expediente completo — unidad de persistencia (una clave de localStorage por proyecto)
 * y de export/import `.json`.
 */
export interface Proyecto {
  id: string; nombre: string;
  /** Fechas ISO 8601 — inyectadas desde la UI; el motor sigue sin llamar a Date.now. */
  creado: string; modificado: string;
  datosGenerales: DatosGenerales;
  /** Estado por justificación; ausencia de clave = sin datos guardados (`sin_iniciar`). */
  justificaciones: Partial<Record<JustificacionKey, JustificacionEnProyecto>>;
  /** Viviendas tipo definidas (feature-8 §C). Opcional: ausente = sin definir. */
  viviendasTipo?: ViviendaTipo[];
  /** Reparto de viviendas por planta (solo colectiva). Ausente = unifamiliar/degenerado. */
  repartoPlantas?: RepartoPlanta[];
}

/**
 * Estado COMPUTADO de una justificación para la checklist del dashboard (§3): las dos
 * dimensiones ortogonales aplicabilidad × progreso, listas para el chip combinado.
 */
export interface EstadoJustificacion {
  aplicabilidad: Aplicabilidad;
  /** `true` si el valor procede de `aplicabilidadForzada` (no de `aplicabilidadBase`). */
  forzada: boolean;
  /** Párrafo redactado para la memoria (p.ej. el "no aplica" de SUA6 sin piscina). */
  nota?: string;
  /** Cita normativa de ámbito que respalda la aplicabilidad. */
  cita?: string;
  progreso: Progreso;
  /** Veredicto del motor si `progreso` es `cumple`/`no_cumple`. */
  veredicto?: Veredicto;
}

// -----------------------------------------------------------------------------
// VIVIENDA TIPO (feature-8 §C, UX-RECONCEPT §6.2): la unidad repetitiva de la
// colectiva. Campos ADITIVOS y OPCIONALES sobre `Proyecto` (schema "1" intacto:
// un export antiguo sin estos campos sigue importando sin migración).
// -----------------------------------------------------------------------------

/**
 * Una vivienda tipo (T2, T3…): el programa repetitivo del que los generadores
 * de `viviendaTipo.ts` derivan las redes de HS3/HS4/HS5. Solo se cuentan los
 * cuartos VARIABLES: **cocina y salón son siempre 1 por vivienda** (no se
 * modelan como campos). La unifamiliar es el caso degenerado: una vivienda
 * tipo y sin `repartoPlantas`.
 */
export interface ViviendaTipo {
  /** Identificador estable (lo referencian `RepartoPlanta.viviendas[].tipoId` y los ids generados). */
  id: string;
  /** Nombre visible (p.ej. "T2") — viaja a los nombres generados ("P2 · T2 · Ramal baño"). */
  nombre: string;
  /** Nº de dormitorios (el 1º es el principal; deriva la categoría de la Tabla 2.1 de HS3). */
  dormitorios: number;
  /** Nº de baños completos (preset "Baño" de HS4/HS5; húmedo en HS3). */
  banos: number;
  /** Nº de aseos (preset "Aseo"; húmedo en HS3). */
  aseos: number;
}

/**
 * Reparto de viviendas tipo por planta de la colectiva. `nivel` es la planta
 * FÍSICA (0 = baja, 1, 2…), coherente con `PlantaColectivo.nivel` de HS3.
 */
export interface RepartoPlanta {
  nivel: number;
  /** Cuántas viviendas de cada tipo hay en esta planta. */
  viviendas: { tipoId: string; cantidad: number }[];
}

// -----------------------------------------------------------------------------
// CONSTANTES DE PERSISTENCIA (feature-6 §B)
// -----------------------------------------------------------------------------

/** Versión del schema de `Proyecto` — el import rechaza schemas incompatibles con mensaje ES. */
export const PROYECTO_SCHEMA_VERSION = "1";

/** Clave localStorage del índice de proyectos. */
export const LS_INDICE = "concreta-inst-proyectos";
/** Prefijo de la clave localStorage por proyecto: `concreta-inst-proyecto-<id>`. */
export const LS_PROYECTO_PREFIX = "concreta-inst-proyecto-";
/** Clave localStorage del id del proyecto activo (último abierto — redirige rutas legacy). */
export const LS_ACTIVO = "concreta-inst-proyecto-activo";

/**
 * Módulos con clave localStorage legacy (`concreta-inst-hs3`…): al primer arranque su estado
 * migra a un proyecto "Importado"; las claves legacy se conservan (rollback barato).
 */
export const CLAVES_LEGACY = ["hs3", "hs4", "hs5", "hs6", "he1"] as const;
