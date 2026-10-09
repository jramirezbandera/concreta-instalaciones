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
  | "sua1" | "sua2" | "sua3" | "sua4" | "sua5" | "sua6" | "sua7" | "sua8" | "sua9"
  | "hr" | "he4" | "he5" | "he6" | "rebt" | "he0he1_global" | "dbse";

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
  /**
   * SUA 8 (feature-20): densidad de impactos sobre el terreno Ng [impactos/año·km²],
   * leída por el proyectista en la figura 1.1 del DB-SUA para su municipio (el mapa
   * no da un valor por provincia). Sin ella, SUA 8 supone el mayor del mapa y lo
   * avisa solo si cambia el resultado.
   */
  densidadImpactosNg?: number;
  /**
   * HR (feature-25): índice de ruido día Ld de la zona [dBA], del mapa estratégico
   * de ruido o de la administración competente (DB-HR ap. 2.1.1 a.iv). En una
   * esquina, el mayor. Sin él, HR toma los 60 dBA que da el DB para las áreas de
   * predominio residencial y lo avisa.
   */
  ldZona?: number;
  /** HR: el ruido exterior dominante es el de aeronaves (huella acústica de un aeropuerto): + 4 dBA. */
  aeronaves?: boolean;
  /**
   * Lo que el asistente de alcance pregunta de una obra en un edificio existente
   * (feature-27). Sin él, la intervención se queda con la nota «alcance pendiente».
   */
  alcance?: Alcance;
}

// -----------------------------------------------------------------------------
// ALCANCE DE UNA INTERVENCIÓN EN UN EDIFICIO EXISTENTE (feature-27, UX-RECONCEPT §5)
// -----------------------------------------------------------------------------

/** Tipos de intervención en los edificios existentes (CTE Parte I, Anejo III). */
export type TipoObraExistente = "reforma" | "ampliacion" | "cambio_uso";

/**
 * Elementos de la envolvente térmica o particiones que se sustituyen, incorporan
 * o modifican sustancialmente (HE 1 ap. 3.1.1 pto 2, 3.2 pto 2). Deciden HS 1,
 * HS 6, HE 1, SI 2, SI 5, SUA 1 y SUA 2 en una reforma.
 */
export type ElementoEnvolvente =
  | "fachadas"
  | "huecos"
  | "cubiertas"
  | "terreno"
  | "medianerias"
  | "particiones";

/**
 * Lo que una reforma modifica en el interior (verificación K-REF, pregunta P8).
 * Decide qué secciones del DB-SI y del DB-SUA se aplican a lo reformado (DB-SI
 * Introducción III criterios 9 y 10; DB-SUA Introducción III criterio 3).
 */
export type ElementoInterior =
  | "distribucion"
  | "evacuacion"
  | "compartimentacion"
  | "revestimientos"
  | "instalaciones_pci"
  | "suelos_escaleras"
  | "vidrios_puertas"
  | "aseos"
  | "alumbrado"
  | "accesibilidad";

/**
 * Respuestas del asistente de alcance (research/verificacion-reformas.md, bloque E).
 * Todas opcionales: lo que falta se deduce de El edificio o se queda en la
 * propuesta más prudente. Lo que El edificio ya sabe (superficie ampliada, zonas
 * que cambian de uso y a qué, viviendas reformadas) no se pregunta.
 */
export interface Alcance {
  /**
   * Tipos de obra, que pueden ser varios a la vez (K-REF.1). Sin él, el de
   * `DatosGenerales.intervencion`.
   */
  tipos?: TipoObraExistente[];
  /** Solo mantenimiento o reparaciones puntuales: fuera del CTE (Parte I, Anejo III). */
  soloMantenimiento?: boolean;
  /**
   * Reforma o rehabilitación integral: se modifican sustancialmente y a la vez
   * particiones, forjados y envolvente (Guía DB-HR, no reglamentaria; K-REF.3).
   * Decide HR, HE 4 b) y HE 5 c).
   */
  integral?: boolean;
  /** Cambio de uso característico del edificio (no solo de una parte). */
  cambioUsoCaracteristico?: boolean;
  /**
   * La ampliación incrementa más del 10 % la superficie o el volumen construido
   * de las unidades de uso sobre las que se interviene (HE 0, HE 1, HE 6).
   */
  ampliacionMas10?: boolean;
  /** La ampliación cambia la altura de evacuación o añade plantas (SI 3, SI 5). */
  ampliacionCambiaAltura?: boolean;
  /** P5: elementos de la envolvente o particiones que se modifican. */
  envolvente?: ElementoEnvolvente[];
  /** Se renueva más del 25 % de la superficie total de la envolvente térmica final. */
  envolventeMas25?: boolean;
  /** Algún espacio pasa a estar acondicionado o algún elemento pasa a ser envolvente. */
  pasaAcondicionado?: boolean;
  /** P6: renovación de la instalación de generación térmica. */
  generacionTermica?: "no" | "general" | "parcial";
  /** P7a: aparatos de agua (HS 4 y HS 5 ap. 1.1). */
  aparatos?: "no" | "sin_aumento" | "aumentan" | "nueva";
  /** P7b: se modifican cubiertas o la red de pluviales. */
  pluviales?: boolean;
  /** P8: lo que se modifica en el interior. */
  interior?: ElementoInterior[];
  /** P9: actuaciones en la estructura preexistente (Parte I art. 2.4). */
  estructura?: boolean;
  /** P10a: se interviene en el aparcamiento. */
  aparcamiento?: boolean;
  /**
   * P10b/c: la intervención en la instalación eléctrica afecta a más del 50 % de la
   * potencia instalada del edificio (con aparcamiento interior y derecho del
   * promotor a actuar en él) o del aparcamiento (HE 6 ap. 1 pto 1 b).
   */
  electrica50?: boolean;
  /** P11: edificio protegido oficialmente. */
  protegido?: boolean;
  /** P12: instalación eléctrica (REBT art. 2.2). */
  electrica?: "no" | "modifica" | "nueva";
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
