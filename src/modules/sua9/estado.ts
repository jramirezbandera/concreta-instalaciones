// =============================================================================
// DB-SUA, SUA 9 — Lo que guarda el módulo (feature-20): las decisiones del
// proyectista que El edificio no describe. El ascensor NO va aquí: es un dato de
// El edificio (`Edificio.ascensor`) y la decisión lo escribe allí. Solo tipos y
// valores.
//
// Lo habitual (criterio, research/verificacion-sua9.md D8 y K1–K10): la
// unifamiliar no debe ser accesible; la entrada principal, en la planta baja y a
// cota de la acera; ninguna vivienda accesible mientras no se diga (con aviso
// revisable: lo fija la reglamentación aplicable); cabina mínima de la tabla
// corregida con una puerta; pasillos sin medir (se prescribe el mínimo);
// cubierta transitable de ocupación nula; sin atención al público; el aseo de
// las oficinas, accesible.
// =============================================================================

import type { PuertasCabina } from "./tablas";

/** Cómo se salva el desnivel entre la acera y la entrada principal (1.1.1). */
export type AccesoEntrada = "a_nivel" | "rampa" | "ascensor" | "escalones";
/** Si la vivienda unifamiliar debe ser accesible por la reglamentación aplicable. */
export type DebeSerAccesible = "no" | "silla" | "auditiva";
/** La cubierta transitable: tendedero o instalaciones (ocupación nula) o zona comunitaria. */
export type UsoCubierta = "nula" | "comunitaria";
export type SiNo = "si" | "no";
/** El aseo de unas oficinas pequeñas: accesible, o la excepción del comentario. */
export type AseoPequeno = "accesible" | "excepcion";

export type Opcion<T> = T | "habitual";

export type Sua9Estado = {
  unifamiliar: Opcion<DebeSerAccesible>;
  entrada: Opcion<AccesoEntrada>;
  /** Viviendas accesibles para usuarios de silla de ruedas (plurifamiliar). */
  viviendasSR: number;
  /** Viviendas accesibles para personas con discapacidad auditiva (plurifamiliar). */
  viviendasAuditiva: number;
  puertasCabina: Opcion<PuertasCabina>;
  /** Cabina del ascensor [m]; null = la mínima de la tabla. */
  cabinaAncho_m: number | null;
  cabinaFondo_m: number | null;
  /** Anchura libre de los pasillos del itinerario [m]; null = no se indica (se prescribe el mínimo). */
  pasillo_m: number | null;
  cubierta: Opcion<UsoCubierta>;
  atencionPublico: Opcion<SiNo>;
  aseoPequeno: Opcion<AseoPequeno>;
};

export interface DecisionesSua9 {
  unifamiliar: DebeSerAccesible;
  entrada: AccesoEntrada;
  puertasCabina: PuertasCabina;
  cubierta: UsoCubierta;
  atencionPublico: SiNo;
  aseoPequeno: AseoPequeno;
}

export const HABITUALES_SUA9: DecisionesSua9 = {
  unifamiliar: "no",
  entrada: "a_nivel",
  puertasCabina: "una_o_enfrentadas",
  cubierta: "nula",
  atencionPublico: "no",
  aseoPequeno: "accesible",
};

export const sua9EstadoDefaults: Sua9Estado = {
  unifamiliar: "habitual",
  entrada: "habitual",
  viviendasSR: 0,
  viviendasAuditiva: 0,
  puertasCabina: "habitual",
  cabinaAncho_m: null,
  cabinaFondo_m: null,
  pasillo_m: null,
  cubierta: "habitual",
  atencionPublico: "habitual",
  aseoPequeno: "habitual",
};

export function resolverSua9(e: Sua9Estado): DecisionesSua9 {
  const h = HABITUALES_SUA9;
  const v = <K extends keyof DecisionesSua9>(k: K): DecisionesSua9[K] =>
    (e[k] === "habitual" || e[k] === undefined ? h[k] : e[k]) as DecisionesSua9[K];
  return {
    unifamiliar: v("unifamiliar"),
    entrada: v("entrada"),
    puertasCabina: v("puertasCabina"),
    cubierta: v("cubierta"),
    atencionPublico: v("atencionPublico"),
    aseoPequeno: v("aseoPequeno"),
  };
}

/** Una cantidad entera ≥ 0 (lo guardado puede venir de una versión anterior). */
export function cantidad(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

/** Una medida > 0, o null. */
export function medida(n: unknown): number | null {
  return typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;
}
