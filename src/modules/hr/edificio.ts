// =============================================================================
// DB-HR — El edificio visto por el DB-HR (feature-25): qué recinto es cada zona
// y qué separaciones hay que justificar (K-HR.16), deducidas planta a planta de
// El edificio. PURO y determinista.
//
// Clases de recinto (research/verificacion-hr.md, bloque B y R.4):
//   - viviendas: cada una es una unidad de uso; la unifamiliar, una sola;
//   - zona común (portal, escalera, vestíbulo): habitable de otra unidad;
//   - trasteros y garaje privado de la unifamiliar: no habitable;
//   - garaje (DB, Anejo A), local y oficinas (comentario): recinto de ACTIVIDAD;
//   - cuartos de calderas, salas de máquinas, maquinaria de ascensor, grupo
//     electrógeno, residuos y agua (grupo de presión): recinto de INSTALACIONES;
//     los de contadores, telecomunicaciones y otros, no (Guía, K-HR.4).
//
// Sin la posición de las zonas en planta, se supone que todo lo que comparte
// planta es colindante y que lo que está en la planta de abajo queda debajo:
// del lado de la seguridad.
// =============================================================================

import { plantasDe, renumerar, resumenEdificio } from "../../lib/edificio/derivar";
import type { TipoCuarto, Zona } from "../../lib/edificio/tipos";
import { USOS } from "../../lib/edificio/usos";
import type { ProyectoSi } from "../si/definicion";
import { resolverSi2, si2EstadoDefaults, type Si2Estado } from "../si2/estado";
import { edificioSua } from "../sua/edificio";
import type { ModoAscensor } from "./estado";

/** «otros»: sin viviendas (oficinas, locales): solo fachada, cubierta, medianería e instalaciones. */
export type Tipologia = "plurifamiliar" | "aislada" | "adosada" | "otros";

export type ClaseRecinto = "vivienda" | "comun" | "no_habitable" | "actividad" | "instalaciones";

const CUARTOS_INSTALACIONES: ReadonlySet<TipoCuarto> = new Set(["calderas", "sala_maquinas", "ascensor", "grupo_electrogeno", "residuos", "agua"]);

export function claseRecinto(z: Zona): ClaseRecinto {
  switch (z.uso) {
    case "viviendas":
    case "vivienda_unifamiliar":
      return "vivienda";
    case "zona_comun":
    case "vestibulo":
      return "comun";
    case "trasteros":
    case "garaje_privado":
      return "no_habitable";
    case "garaje":
    case "local_sin_uso":
    case "oficinas":
      return "actividad";
    case "instalaciones":
      return z.cuarto && CUARTOS_INSTALACIONES.has(z.cuarto) ? "instalaciones" : "no_habitable";
  }
}

/** Lo que hay al otro lado de una separación: «Garaje (S1)». */
export interface Colindante {
  nombre: string;
  clase: ClaseRecinto;
  garaje: boolean;
}

export interface SeparacionesHr {
  tipologia: Tipologia;
  viviendas: number;
  /** Plantas con más de una vivienda (tabla 3.2 entre viviendas). */
  entreViviendas: string[];
  /** Zona común o trasteros en una planta con viviendas. */
  conComun: Colindante[];
  /** Recinto de actividad o de instalaciones en una planta con viviendas. */
  conActividad: Colindante[];
  /** Plantas de viviendas con viviendas debajo. */
  sobreViviendas: string[];
  /** Viviendas sobre la zona común o los trasteros. */
  sobreComun: Colindante[];
  /** Viviendas sobre un recinto de actividad o de instalaciones. */
  sobreActividad: Colindante[];
  /** Un recinto de actividad o de instalaciones encima de viviendas. */
  actividadEncima: Colindante[];
  /** La cubierta queda sobre viviendas. */
  cubierta: boolean;
  /** Medianeras (las de SI 2). */
  medianeras: boolean;
  ascensor: boolean;
  /** Dónde va la maquinaria, si no se dice: en un cuarto si El edificio lo tiene. */
  ascensorHabitual: ModoAscensor;
  /** Hay más de una planta en la vivienda o el edificio (forjados interiores). */
  plantas: number;
}

function colindantes(zonas: readonly Zona[], etiqueta: string, clases: readonly ClaseRecinto[]): Colindante[] {
  return zonas
    .filter((z) => clases.includes(claseRecinto(z)))
    .map((z) => ({ nombre: `${USOS[z.uso].etiqueta} (${etiqueta})`, clase: claseRecinto(z), garaje: z.uso === "garaje" }));
}

function unicos(xs: Colindante[]): Colindante[] {
  const vistos = new Set<string>();
  return xs.filter((x) => (vistos.has(x.nombre) ? false : (vistos.add(x.nombre), true)));
}

/** Las medianeras: las que se deciden en SI 2 (un dato se escribe una vez). */
export function medianerasDe(p: ProyectoSi, unifamiliar: boolean): boolean {
  const guardado = p.justificaciones?.si2?.inputs as Partial<Si2Estado> | undefined;
  return resolverSi2({ ...si2EstadoDefaults, ...(guardado ?? {}) }, unifamiliar).medianeras === "si";
}

export function separacionesHr(p: ProyectoSi): SeparacionesHr {
  const e = renumerar(p.edificio);
  const r = resumenEdificio(e);
  const plantas = plantasDe(e);
  const unifamiliar = r.esUnifamiliar;
  const medianeras = medianerasDe(p, unifamiliar);
  const tipologia: Tipologia = !r.tieneViviendas ? "otros" : !unifamiliar ? "plurifamiliar" : medianeras ? "adosada" : "aislada";

  const conViviendas = (zs: readonly Zona[]) => zs.some((z) => claseRecinto(z) === "vivienda");
  const unidades = (zs: readonly Zona[]) => zs.filter((z) => z.uso === "viviendas").reduce((s, z) => s + (z.unidades ?? []).reduce((a, u) => a + Math.max(0, u.cantidad), 0), 0);

  const s: SeparacionesHr = {
    tipologia,
    viviendas: unifamiliar ? 1 : r.numViviendas,
    entreViviendas: [],
    conComun: [],
    conActividad: [],
    sobreViviendas: [],
    sobreComun: [],
    sobreActividad: [],
    actividadEncima: [],
    cubierta: plantas.length > 0 && (r.tieneViviendas ? conViviendas(plantas[0].zonas) : plantas[0].zonas.some((z) => z.uso === "oficinas")),
    medianeras: !unifamiliar && medianeras,
    ascensor: false,
    ascensorHabitual: "hueco",
    plantas: plantas.length,
  };
  if (unifamiliar || tipologia === "otros") return s;

  plantas.forEach((pl, i) => {
    if (!conViviendas(pl.zonas)) {
      // Un recinto de actividad o de instalaciones sobre viviendas.
      const abajo = plantas[i + 1];
      if (abajo && conViviendas(abajo.zonas)) s.actividadEncima.push(...colindantes(pl.zonas, pl.etiqueta, ["actividad", "instalaciones"]));
      return;
    }
    if (unidades(pl.zonas) > 1) s.entreViviendas.push(pl.etiqueta);
    s.conComun.push(...colindantes(pl.zonas, pl.etiqueta, ["comun", "no_habitable"]));
    s.conActividad.push(...colindantes(pl.zonas, pl.etiqueta, ["actividad", "instalaciones"]));
    const abajo = plantas[i + 1];
    if (abajo) {
      if (conViviendas(abajo.zonas)) {
        s.sobreViviendas.push(pl.etiqueta);
        // Un local u oficinas en una planta de viviendas también pisa las de abajo.
        s.actividadEncima.push(...colindantes(pl.zonas, pl.etiqueta, ["actividad", "instalaciones"]));
      }
      s.sobreComun.push(...colindantes(abajo.zonas, abajo.etiqueta, ["comun", "no_habitable"]));
      s.sobreActividad.push(...colindantes(abajo.zonas, abajo.etiqueta, ["actividad", "instalaciones"]));
    }
  });
  s.conComun = unicos(s.conComun);
  s.conActividad = unicos(s.conActividad);
  s.sobreComun = unicos(s.sobreComun);
  s.sobreActividad = unicos(s.sobreActividad);
  s.actividadEncima = unicos(s.actividadEncima);

  s.ascensor = edificioSua(p.edificio).ascensor.hay.valor;
  s.ascensorHabitual = plantas.some((pl) => pl.zonas.some((z) => z.uso === "instalaciones" && z.cuarto === "ascensor")) ? "cuarto" : "hueco";
  return s;
}
