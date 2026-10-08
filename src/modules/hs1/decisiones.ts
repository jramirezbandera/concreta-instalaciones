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
//   - cubierta plana invertida (aislante sobre la impermeabilización), con grava
//     si no es transitable y solado fijo si lo es; inclinada de teja mixta, sin
//     impermeabilización bajo el tejado.
// =============================================================================

import type { TipoCubierta } from "../../lib/edificio/tipos";
import type { DeclaraFachadas } from "./fachada";
import type { ProteccionPlana } from "./tablas";

/** Tipo de muro (tabla 2.2 y bloques de la tabla 2.4). */
export type TipoMuro = "flexorresistente" | "gravedad" | "pantalla";
/** Situación de la impermeabilización del muro (tabla 2.2). */
export type ImpermeabilizacionMuro = "exterior" | "interior" | "parcialmente_estanco";
/** Tipo de suelo (tabla 2.4). */
export type TipoSuelo = "solera" | "placa" | "elevado";
/** Tipo de intervención en el terreno (tabla 2.4). */
export type IntervencionTerreno = "sub_base" | "inyecciones" | "sin_intervencion";
/** Dónde va el aislante de una cubierta plana: bajo la impermeabilización o encima (invertida). */
export type AislantePlana = "bajo" | "sobre";
/** Si una cubierta inclinada lleva capa de impermeabilización bajo el tejado. */
export type ImpermeabilizacionInclinada = "sin" | "con";

export type Opcion<T> = T | "habitual";

export const TIPOS_MURO: readonly TipoMuro[] = ["flexorresistente", "gravedad", "pantalla"];
export const IMPERMEABILIZACIONES_MURO: readonly ImpermeabilizacionMuro[] = ["exterior", "interior", "parcialmente_estanco"];
export const TIPOS_SUELO: readonly TipoSuelo[] = ["solera", "placa", "elevado"];
export const INTERVENCIONES_TERRENO: readonly IntervencionTerreno[] = ["sin_intervencion", "sub_base", "inyecciones"];

/** Las protecciones de la tabla 2.9 que admite cada tipo de cubierta plana de El edificio. */
export function proteccionesDe(tipo: TipoCubierta): ProteccionPlana[] {
  if (tipo === "plana_transitable") return ["solado_fijo", "solado_flotante", "capa_rodadura"];
  // La ajardinada es un uso aparte en la tabla 2.9; El edificio no lo distingue y
  // se ofrece con las no transitables (criterio).
  return ["grava", "lamina_autoprotegida", "tierra_vegetal"];
}

export interface DecisionesHs1 {
  muroTipo: Opcion<TipoMuro>;
  muroImper: Opcion<ImpermeabilizacionMuro>;
  sueloTipo: Opcion<TipoSuelo>;
  sueloIntervencion: Opcion<IntervencionTerreno>;
  /** Lo declarado de cada fachada de El edificio; sin dar, lo habitual (feature-26). */
  fachadaDeclara?: DeclaraFachadas;
  cubiertaProteccion: Opcion<ProteccionPlana>;
  cubiertaAislante: Opcion<AislantePlana>;
  /** Fila de la tabla 2.10. */
  cubiertaTejado: Opcion<number>;
  cubiertaImpermeabilizacion: Opcion<ImpermeabilizacionInclinada>;
}

export interface DecisionesEfectivasHs1 {
  muroTipo: TipoMuro;
  muroImper: ImpermeabilizacionMuro;
  sueloTipo: TipoSuelo;
  sueloIntervencion: IntervencionTerreno;
  cubiertaProteccion: ProteccionPlana;
  cubiertaAislante: AislantePlana;
  cubiertaTejado: number;
  cubiertaImpermeabilizacion: ImpermeabilizacionInclinada;
}

export const DECISIONES_HS1_POR_DEFECTO: DecisionesHs1 = {
  muroTipo: "habitual",
  muroImper: "habitual",
  sueloTipo: "habitual",
  sueloIntervencion: "habitual",
  cubiertaProteccion: "habitual",
  cubiertaAislante: "habitual",
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
export function decisionesHabitualesHs1(cubierta: TipoCubierta, suelo: SueloHabitual = SUELO_HABITUAL): DecisionesEfectivasHs1 {
  return {
    muroTipo: "flexorresistente",
    muroImper: "exterior",
    sueloTipo: suelo.tipo,
    sueloIntervencion: suelo.intervencion,
    cubiertaProteccion: cubierta === "plana_transitable" ? "solado_fijo" : "grava",
    cubiertaAislante: "sobre",
    cubiertaTejado: TEJADO_HABITUAL,
    cubiertaImpermeabilizacion: "sin",
  };
}

export function resolverDecisionesHs1(d: DecisionesHs1, cubierta: TipoCubierta, suelo: SueloHabitual = SUELO_HABITUAL): DecisionesEfectivasHs1 {
  const h = decisionesHabitualesHs1(cubierta, suelo);
  const v = <K extends keyof DecisionesEfectivasHs1>(k: K): DecisionesEfectivasHs1[K] =>
    (d[k] === "habitual" || d[k] === undefined ? h[k] : d[k]) as DecisionesEfectivasHs1[K];
  const proteccion = v("cubiertaProteccion");
  return {
    muroTipo: v("muroTipo"),
    muroImper: v("muroImper"),
    sueloTipo: v("sueloTipo"),
    sueloIntervencion: v("sueloIntervencion"),
    // Una protección de otro tipo de cubierta (la cubierta cambió) vuelve a lo habitual.
    cubiertaProteccion: proteccionesDe(cubierta).includes(proteccion) ? proteccion : h.cubiertaProteccion,
    cubiertaAislante: v("cubiertaAislante"),
    cubiertaTejado: v("cubiertaTejado"),
    cubiertaImpermeabilizacion: v("cubiertaImpermeabilizacion"),
  };
}
