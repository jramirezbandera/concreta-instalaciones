// =============================================================================
// El edificio — modelo de datos (feature-12, REDISENO-V4 §3.1).
//
// Sustituye a los contadores y banderas de los datos generales de la v1
// (`plantasSobreRasante`, `tieneGaraje`, `viviendasTipo` + `repartoPlantas`…):
// el edificio se describe UNA vez, como plantas con zonas de uso, y todo lo
// demás se deriva (`derivar.ts`). Solo tipos y constantes: cero lógica.
//
// Superficie: SIEMPRE la útil de cada zona, nunca la de la planta. Cada
// justificación decide qué zonas cuenta (`usos.ts`); el total de una planta solo
// se muestra.
// =============================================================================

/** Tipo de cubierta: discrimina exigencias de HS1, HS5 (pluviales) y SUA. */
export type TipoCubierta = "plana_transitable" | "plana_no_transitable" | "inclinada";

/**
 * Uso de una zona. «viviendas» son las de una plurifamiliar (cuántas de cada tipo
 * por planta); «vivienda_unifamiliar» es una parte de LA vivienda del edificio,
 * que puede ocupar varias plantas. Los cuartos de instalaciones son zona propia
 * con ocupación nula (SI 3), nunca superficie metida en otra zona.
 */
export type UsoZona =
  | "viviendas"
  | "vivienda_unifamiliar"
  | "local_sin_uso"
  | "oficinas"
  | "zona_comun"
  | "vestibulo"
  | "garaje"
  | "garaje_privado"
  | "trasteros"
  | "instalaciones";

/**
 * De dónde sale una zona o un tipo que el proyectista no tecleó (feature-13): leído
 * con IA de un documento aportado (el cuadro de superficies) y revisado por el
 * proyectista antes de aplicarlo. Editarlo después no lo borra: editar es revisar.
 */
export interface OrigenDocumento {
  /** Nombre del fichero aportado. */
  documento: string;
  /** Páginas de donde salen sus filas (vacío si es una imagen sin paginar). */
  paginas: number[];
  /** Las filas del cuadro que lo forman, como venían escritas. */
  filas: string[];
}

/**
 * Qué es un cuarto de instalaciones (feature-19), por las filas de la tabla 2.1
 * de SI 1 que se dan en un edificio de viviendas u oficinas:
 *   - local de riesgo especial bajo en todo caso: contadores de electricidad y
 *     cuadros generales, sala de máquinas de climatización (RITE), maquinaria de
 *     ascensor, grupo electrógeno y, por un comentario del Ministerio, RITI/RITS;
 *   - según su potencia o superficie: sala de calderas, almacén de residuos;
 *   - no son local de riesgo especial: los cuartos de agua (grupo de presión,
 *     aljibe, contadores de agua) y cualquier otro cuarto sin fila en la tabla.
 */
export type TipoCuarto =
  | "contadores_electricidad"
  | "telecomunicaciones"
  | "sala_maquinas"
  | "calderas"
  | "ascensor"
  | "grupo_electrogeno"
  | "residuos"
  | "agua"
  | "otro";

/** Uso al que se asimila un local sin uso para el DB-SI (feature-19). */
export type UsoPrevistoLocal = "comercial" | "administrativo";

/** Cuartos húmedos de la unifamiliar en una zona. La cocina es una por vivienda. */
export interface CuartosZona {
  banos: number;
  aseos: number;
  cocina: boolean;
}

/** Unidades de un tipo dentro de una zona, por planta. */
export interface UnidadesEnZona {
  tipoId: string;
  cantidad: number;
}

export interface Zona {
  /** Estable dentro del edificio (lo referencia la selección de la pantalla). */
  id: string;
  uso: UsoZona;
  /** Superficie útil de ESTA zona [m²], en cada planta del grupo. */
  superficieUtil_m2: number;
  /** Viviendas (zona «viviendas») o núcleos de aseos (zona «oficinas») por planta. */
  unidades?: UnidadesEnZona[];
  /** Plazas de aparcamiento (garaje). */
  plazas?: number;
  /** Número de trasteros. */
  numero?: number;
  /**
   * Cuartos húmedos de LA vivienda en esta zona (solo «vivienda unifamiliar»), en
   * cada planta del grupo. Sin él, manda el reparto supuesto (`reparto.ts`).
   */
  cuartos?: CuartosZona;
  /** Grifos de baldeo o limpieza (garajes): puntos de consumo de HS4. */
  grifos?: number;
  /**
   * Superficie CONSTRUIDA de la zona en cada planta [m²], si se conoce (feature-19).
   * La usa el DB-SI, cuyos umbrales son todos de superficie construida; sin ella,
   * se supone a partir de la útil y se avisa solo si cambia el resultado.
   */
  superficieConstruida_m2?: number;
  /** Qué es un cuarto de instalaciones (feature-19): decide si es local de riesgo especial (SI 1). */
  cuarto?: TipoCuarto;
  /** Potencia útil nominal de la sala de calderas [kW] (feature-19, SI 1 tabla 2.1). */
  potencia_kW?: number;
  /**
   * Uso al que se asimila un local sin uso para el DB-SI (feature-19). Sin él se
   * le aplica el uso Comercial, el más exigente de los dos.
   */
  usoPrevisto?: UsoPrevistoLocal;
  /** Nota libre que acompaña a la zona en la sección («planta alta · noche»). */
  nota?: string;
  /** Si viene del cuadro de superficies (feature-13). */
  origen?: OrigenDocumento;
}

/** Una o varias plantas IGUALES, consecutivas. */
export interface GrupoPlantas {
  id: string;
  /**
   * Nivel de la planta MÁS BAJA del grupo: 0 = PB, 1, 2… ; -1 = S1, -2 = S2.
   * «P1–P3 × 3» → 1; «S1–S2 × 2» → -2. Se persiste, pero toda edición lo
   * recalcula a partir del orden y las repeticiones (`renumerar`).
   */
  nivelInicial: number;
  /** Cuántas plantas iguales hay (≥ 1). */
  repeticiones: number;
  /** Altura suelo a suelo de CADA planta del grupo [m]. */
  altura_m: number;
  zonas: Zona[];
}

/** Vivienda tipo: el programa repetitivo del que salen las redes de HS3/HS4/HS5. */
export interface ViviendaTipo {
  clase: "vivienda";
  id: string;
  /** Nombre visible («A», «T2»…): viaja a los nombres de la red generada. */
  nombre: string;
  /** El 1.º es el principal; decide la categoría de la tabla 2.1 de HS3. */
  dormitorios: number;
  banos: number;
  aseos: number;
  /** Superficie útil de una vivienda de este tipo [m²]. */
  superficieUtil_m2: number;
  /** Si viene del cuadro de superficies (feature-13). */
  origen?: OrigenDocumento;
}

/** Núcleo de aseos de una planta de oficinas. */
export interface NucleoAseos {
  clase: "nucleo_aseos";
  id: string;
  nombre: string;
  inodoros: number;
  lavabos: number;
  superficieUtil_m2: number;
  /** Si viene del cuadro de superficies (feature-13). */
  origen?: OrigenDocumento;
}

/** Lo que se repite: viviendas tipo y núcleos de aseos. */
export type UnidadTipo = ViviendaTipo | NucleoAseos;

export interface Edificio {
  cubierta: { tipo: TipoCubierta; superficie_m2: number };
  /** De ARRIBA abajo. Siempre hay al menos un grupo sobre rasante (la PB). */
  grupos: GrupoPlantas[];
  unidades: UnidadTipo[];
}
