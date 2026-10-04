import type { Veredicto } from "../pdf/renderFicha";
import type { ZonaRadon } from "../../modules/hs6/tablas";
import type { ZonaTermica } from "../../modules/hs3/tablas";
import type { Isoyeta, ZonaPluviometrica } from "../../modules/hs5/tablas";
import type { ClaseKs, NivelFreatico, TerrenoTipo, ZonaEolica, ZonaPluviometricaHs1 } from "../../modules/hs1/tipos";
import type { Edificio, TipoCubierta } from "../edificio/tipos";
import type { ResumenEdificio } from "../edificio/derivar";

// Modelo de datos del EXPEDIENTE (feature-6 §A, UX-RECONCEPT §2–§3): el producto deja de ser
// "5 calculadoras con sidebar" y pasa a ser gestor de expedientes de justificación CTE.
// Este archivo contiene SOLO tipos y constantes — cero lógica, cero React/DOM. Las funciones
// puras (derivarContexto, aplicabilidadBase…) y la persistencia viven en archivos hermanos.
//
// Schema 2 (feature-12): el edificio deja de describirse con contadores y banderas en los
// datos generales y pasa a tener su propio modelo (`../edificio/tipos.ts`). Sin migración:
// los expedientes de la versión 1 no se leen.

export type { Edificio, ResumenEdificio, TipoCubierta, Veredicto, ZonaRadon, ZonaTermica };

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
// LOS EJES DEL PROYECTO (§2): edificio × intervención × atributos → checklist
// -----------------------------------------------------------------------------

/**
 * Tipo de intervención (CTE Parte I art. 2). Obra nueva es el caso particular donde todo
 * aplica; el motor de aplicabilidad para el resto llega en Fase E (§5 del reconcept).
 */
export type Intervencion = "obra_nueva" | "reforma" | "ampliacion" | "cambio_uso";

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
// DATOS DE LA OBRA (§2.3): lo que no es el edificio, se rellena una vez
// -----------------------------------------------------------------------------

/**
 * Datos de la obra: emplazamiento, intervención y suministro. Lo que describe el
 * edificio (plantas, usos, viviendas, garaje…) vive en `Proyecto.edificio`.
 */
export interface DatosGenerales {
  municipio: string;
  /**
   * Código INE del municipio (5 dígitos: 2 de provincia + 3 de municipio) —
   * feature-9. Es la CLAVE ESTABLE con la que cruzar las tablas normativas que
   * clasifican por municipio (zona de radón del DB-HS6 Apéndice B, aceleración
   * sísmica NCSE-02, pluviometría…): el nombre no sirve como clave porque
   * "Vitoria", "Vitoria-Gasteiz" y "Gasteiz" son el mismo municipio escrito de
   * tres formas. `municipio` se conserva para MOSTRAR. Opcional: quien lo
   * consuma debe tratar su ausencia.
   */
  municipioIne?: string;
  provincia: string;
  /** Altitud sobre el nivel del mar [m] — corrige la zona climática de la capital (DB-HE Anejo B). */
  altitud_m: number;
  intervencion: Intervencion;
  /**
   * Sin piscina ⇒ SUA6 `no_aplica` con párrafo redactado y cita de ámbito. La piscina
   * no es una zona del edificio (está en la parcela), así que sigue siendo un dato.
   */
  tienePiscina: boolean;
  /**
   * Zona de radón del municipio — ENTRADA MANUAL con procedencia Apéndice B del DB-HS6
   * (decisión feature-5: no se embebe el listado de municipios).
   */
  zonaRadon: ZonaRadon;
  /** "Datos de suministro" opcional [kPa] → herencia hacia HS4 solo si está informado. */
  presionAcometida_kPa?: number;
  /**
   * Zona pluviométrica e isoyeta del emplazamiento, leídas por el proyectista de
   * la Figura B.1 del DB-HS5 (apéndice B), como la zona de radón (feature-14).
   * Sin ellas, HS5 calcula los pluviales con 100 mm/h y lo avisa.
   */
  pluviometria?: { zona: ZonaPluviometrica; isoyeta: Isoyeta };
  /**
   * Cota del alcantarillado en el punto de acometida [m] respecto a la rasante
   * (negativa: por debajo). Decide si un sótano evacua por bombeo (HS5). Sin
   * ella, HS5 supone que los sótanos quedan por debajo y lo avisa.
   */
  cotaAlcantarillado_m?: number;
  /**
   * HS 1 (feature-17): zona pluviométrica de promedios (figura 2.4), zona eólica
   * (figura 2.5) y terreno tipo del DB-SE (clase del entorno), leídos por el
   * proyectista como la zona de radón. Sin ellos, HS1 supone lo más desfavorable
   * y lo avisa.
   */
  zonaPluviometricaHs1?: ZonaPluviometricaHs1;
  zonaEolica?: ZonaEolica;
  terrenoTipo?: TerrenoTipo;
  /**
   * Del estudio geotécnico (feature-17): el nivel freático y el coeficiente de
   * permeabilidad del terreno. Sin ellos, HS1 supone y lo avisa.
   */
  nivelFreatico?: NivelFreatico;
  permeabilidadTerreno?: ClaseKs;
}

// -----------------------------------------------------------------------------
// CONTEXTO DERIVADO: calculado por `derivarContexto`, nunca almacenado como verdad
// -----------------------------------------------------------------------------

/** Dato derivado con su PROCEDENCIA (tabla/regla que lo produce) — trazabilidad hasta la ficha. */
export interface Derivado<T> { valor: T; procedencia: string }

/**
 * Contexto derivado de la obra y del edificio que heredan los módulos.
 * Lo produce la función pura `derivarContexto(datosGenerales, edificio)`.
 */
export interface ContextoDerivado {
  /** Zona climática HE (de provincia + altitud, DB-HE1 Tabla a / Anejo B). */
  zonaClimatica: Derivado<string>;
  /** Zona térmica del edificio para HS3 (Tabla 4.4 del DB-HS3). */
  zonaTermicaHS3: Derivado<ZonaTermica>;
  /** Altura de evacuación [m] (cota del suelo de la última planta) — discrimina SI/SUA. */
  alturaEvacuacion_m: Derivado<number>;
  /** Lo que se deduce de El edificio (plantas, viviendas, garaje…). */
  edificio: ResumenEdificio;
}

// -----------------------------------------------------------------------------
// ESTADO POR JUSTIFICACIÓN DENTRO DEL PROYECTO
// -----------------------------------------------------------------------------

/**
 * Lo que el proyecto persiste de cada justificación. Los inputs de módulo pasan a vivir
 * AQUÍ (no en la clave suelta legacy por módulo, feature-6 §B).
 */
export interface JustificacionEnProyecto {
  /** Inputs del módulo tal y como los persiste `useJustificacionState` (forma opaca para el proyecto). */
  inputs?: Record<string, unknown>;
  /** Versión de schema de los inputs del módulo (patrón `getModuleSchemaVersion`). */
  schemaVersion?: string;
  /** Campos del contexto heredado con override local declarado (viajan a la ficha como excepción). */
  overridesContexto?: string[];
  /** Aplicabilidad FORZADA por el proyectista (prevalece sobre `aplicabilidadBase`). */
  aplicabilidadForzada?: { valor: Aplicabilidad; nota?: string };
  /** Referencia de documento externo (p.ej. expediente HULC) para justificaciones `externo`. */
  refExterna?: string;
  /**
   * Ids de los avisos que el proyectista ha marcado como revisados (feature-14,
   * REDISENO-V4 §3.4). Un aviso revisado deja de contar como pendiente y llega a
   * la ficha como «revisado por el proyectista».
   */
  revisados?: string[];
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
  /** El edificio: plantas, zonas de uso y lo que se repite (feature-12). */
  edificio: Edificio;
  /** Estado por justificación; ausencia de clave = sin datos guardados (`sin_iniciar`). */
  justificaciones: Partial<Record<JustificacionKey, JustificacionEnProyecto>>;
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
// CONSTANTES DE PERSISTENCIA (feature-6 §B, feature-12 §B)
// -----------------------------------------------------------------------------

/** Versión del schema de `Proyecto` — el import rechaza schemas incompatibles con mensaje ES. */
export const PROYECTO_SCHEMA_VERSION = "2";

/**
 * Claves de la versión 2. Son NUEVAS a propósito: las de la versión 1 no se leen
 * ni se borran (sin migración, REDISENO-V4 §7.4).
 */
export const LS_INDICE = "concreta-inst-v2-proyectos";
/** Prefijo de la clave localStorage por proyecto: `concreta-inst-v2-proyecto-<id>`. */
export const LS_PROYECTO_PREFIX = "concreta-inst-v2-proyecto-";
/** Clave localStorage del id del proyecto activo (último abierto — redirige rutas legacy). */
export const LS_ACTIVO = "concreta-inst-v2-proyecto-activo";

/** Índice de proyectos de la versión 1: solo se cuenta, para avisar en Inicio. */
export const LS_INDICE_V1 = "concreta-inst-proyectos";
