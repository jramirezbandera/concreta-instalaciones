// =============================================================================
// DB-HS1 — Las decisiones del proyectista (feature-17): las columnas de las
// tablas de condiciones y cómo es la cubierta. Cada una se guarda como «habitual»
// mientras coincida con lo habitual, para que un cambio de lo habitual llegue
// solo. PURA.
//
// Lo habitual (criterio de práctica, no exigencia; research/verificacion-hs1.md):
//   - muro de sótano flexorresistente, impermeabilizado por el exterior;
//   - solera sin intervención en el terreno: la «sub-base» del DB es una capa de
//     bentonita de sodio (Apéndice A), no el encachado de grava;
//   - la fachada es la de El edificio (feature-26): sus rasgos dan la columna,
//     las hojas y la combinación (`fachada.ts`); aquí solo se declara lo que el
//     catálogo no sabe (la R del revestimiento, J, N y H);
//   - la cubierta es la de El edificio (feature-26), con su protección y la
//     posición del aislante; aquí solo se decide, en la inclinada, la teja
//     (mixta) y si lleva impermeabilización bajo el tejado (no).
// =============================================================================

import type { DeclaraFachadas } from "./fachada";

/** Tipo de muro (tabla 2.2 y bloques de la tabla 2.4). */
export type TipoMuro = "flexorresistente" | "gravedad" | "pantalla";
/** Situación de la impermeabilización del muro (tabla 2.2). */
export type ImpermeabilizacionMuro = "exterior" | "interior" | "parcialmente_estanco";
/** Tipo de suelo (tabla 2.4). */
export type TipoSuelo = "solera" | "placa" | "elevado";
/** Tipo de intervención en el terreno (tabla 2.4). */
export type IntervencionTerreno = "sub_base" | "inyecciones" | "sin_intervencion";
/** Si una cubierta inclinada lleva capa de impermeabilización bajo el tejado. */
export type ImpermeabilizacionInclinada = "sin" | "con";

export type Opcion<T> = T | "habitual";

export const TIPOS_MURO: readonly TipoMuro[] = ["flexorresistente", "gravedad", "pantalla"];
export const IMPERMEABILIZACIONES_MURO: readonly ImpermeabilizacionMuro[] = ["exterior", "interior", "parcialmente_estanco"];
export const TIPOS_SUELO: readonly TipoSuelo[] = ["solera", "placa", "elevado"];
export const INTERVENCIONES_TERRENO: readonly IntervencionTerreno[] = ["sin_intervencion", "sub_base", "inyecciones"];

export interface DecisionesHs1 {
  muroTipo: Opcion<TipoMuro>;
  muroImper: Opcion<ImpermeabilizacionMuro>;
  sueloTipo: Opcion<TipoSuelo>;
  sueloIntervencion: Opcion<IntervencionTerreno>;
  /** Lo declarado de cada fachada de El edificio; sin dar, lo habitual (feature-26). */
  fachadaDeclara?: DeclaraFachadas;
  /** Fila de la tabla 2.10. */
  cubiertaTejado: Opcion<number>;
  cubiertaImpermeabilizacion: Opcion<ImpermeabilizacionInclinada>;
}

export interface DecisionesEfectivasHs1 {
  muroTipo: TipoMuro;
  muroImper: ImpermeabilizacionMuro;
  sueloTipo: TipoSuelo;
  sueloIntervencion: IntervencionTerreno;
  cubiertaTejado: number;
  cubiertaImpermeabilizacion: ImpermeabilizacionInclinada;
}

export const DECISIONES_HS1_POR_DEFECTO: DecisionesHs1 = {
  muroTipo: "habitual",
  muroImper: "habitual",
  sueloTipo: "habitual",
  sueloIntervencion: "habitual",
  cubiertaTejado: "habitual",
  cubiertaImpermeabilizacion: "habitual",
};

/** Fila de la tabla 2.10 de la teja mixta y plana monocanal. */
export const TEJADO_HABITUAL = 1;

/** El suelo habitual: solera sin intervención, salvo que su grado no la admita. */
export interface SueloHabitual {
  tipo: TipoSuelo;
  intervencion: IntervencionTerreno;
}

export const SUELO_HABITUAL: SueloHabitual = { tipo: "solera", intervencion: "sin_intervencion" };

/**
 * Lo habitual. El suelo lo decide la justificación con su grado (`suelo`): la
 * solera sin intervención no se admite con grado 5, y lo habitual nunca es una
 * solución que la tabla 2.4 rechaza.
 */
export function decisionesHabitualesHs1(suelo: SueloHabitual = SUELO_HABITUAL): DecisionesEfectivasHs1 {
  return {
    muroTipo: "flexorresistente",
    muroImper: "exterior",
    sueloTipo: suelo.tipo,
    sueloIntervencion: suelo.intervencion,
    cubiertaTejado: TEJADO_HABITUAL,
    cubiertaImpermeabilizacion: "sin",
  };
}

export function resolverDecisionesHs1(d: DecisionesHs1, suelo: SueloHabitual = SUELO_HABITUAL): DecisionesEfectivasHs1 {
  const h = decisionesHabitualesHs1(suelo);
  const v = <K extends keyof DecisionesEfectivasHs1>(k: K): DecisionesEfectivasHs1[K] =>
    (d[k] === "habitual" || d[k] === undefined ? h[k] : d[k]) as DecisionesEfectivasHs1[K];
  return {
    muroTipo: v("muroTipo"),
    muroImper: v("muroImper"),
    sueloTipo: v("sueloTipo"),
    sueloIntervencion: v("sueloIntervencion"),
    cubiertaTejado: v("cubiertaTejado"),
    cubiertaImpermeabilizacion: v("cubiertaImpermeabilizacion"),
  };
}
