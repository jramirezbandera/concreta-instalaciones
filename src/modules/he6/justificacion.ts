// =============================================================================
// DB-HE 6 — La justificación (feature-24): las plazas del aparcamiento, las que
// llevan sistema de conducción de cables, las estaciones de recarga que se
// instalan, el esquema de conexión y el tipo y la potencia de la estación (lo
// que pide el ap. 4). PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-he6.md):
//   - las plazas son las interiores (los garajes de El edificio) y las exteriores
//     adscritas al edificio; en la unifamiliar sin garaje, la plaza en la parcela
//     que se marca en REBT (K-HE6.2);
//   - el uso es el característico del edificio: residencial privado si tiene
//     viviendas (ap. 3 pto 3, zonas no diferenciadas, K-HE6.7); la exclusión de
//     10 plazas o menos no alcanza a un edificio con viviendas (K-HE6.3);
//   - residencial privado: conducción en el 100 % de las plazas y ninguna
//     estación exigida; la unifamiliar lo cumple con el circuito C13 que pide el
//     REBT (ITC-BT-52 ap. 3.1, I.8);
//   - otros usos: conducción en ⌈N/5⌉ plazas, y estaciones = máx(⌈N/40⌉ o ⌈N/20⌉
//     de la Administración General del Estado; ⌈Nacc/5⌉); las plazas con
//     estación cuentan como plazas con conducción (K-HE6.5);
//   - las plazas accesibles, las de SUA 9 ap. 1.2.3 o más si se dice.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { RebtEstado } from "../rebt/estado";
import type { ProyectoSi } from "../si/definicion";
import { edificioSi } from "../si/edificio";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { edificioSua } from "../sua/edificio";
import { plazasAccesiblesOtrosUsos } from "../sua9/tablas";
import { entero, he6EstadoDefaults, resolverEsquema, type Esquema, type He6Estado } from "./estado";
import { AMBITO_HE6, conduccionMinima, ESTACIONES_HE6, estacionesAccesibles, estacionesPorPlazas } from "./tablas";

/** El uso que cuenta para la dotación (ap. 3). */
export type UsoHe6 = "residencial" | "otros";

/** El esquema con su variante: 1a, 2, 3a, 4a o 4b. */
export type Subesquema = "1a" | "2" | "3a" | "4a" | "4b";

export type DetalleHe6 =
  | {
      clase: "plazas";
      uso: UsoHe6;
      interiores: number;
      exteriores: number;
      plazas: number;
      /** La plaza exterior es la de la parcela de la unifamiliar (REBT). */
      parcela: boolean;
      aplica: boolean;
      /** Excluido por el ap. 1 pto 2 a). */
      excluido: boolean;
    }
  | {
      clase: "conduccion";
      uso: UsoHe6;
      plazas: number;
      exigidas: number;
      previstas: number;
      /** Las previstas son las mínimas (no se han indicado). */
      minimas: boolean;
      /** La unifamiliar: lo cumple el circuito C13 del REBT. */
      porC13: boolean;
    }
  | {
      clase: "estaciones";
      plazas: number;
      age: boolean;
      porPlazas: number;
      accesibles: number;
      /** Las plazas accesibles son las de SUA 9 (no se han indicado más). */
      accesiblesSua: boolean;
      porAccesibles: number;
      minimo: number;
      instaladas: number;
      minimas: boolean;
    }
  | { clase: "esquema"; esquema: Esquema; subesquema: Subesquema; habitual: boolean; unifamiliar: boolean }
  | { clase: "estacion"; potencia_W: number; texto: string; habitual: boolean; estaciones: number; unifamiliar: boolean };

export type ElementoHe6 = ElementoSi<DetalleHe6>;

export interface JustificacionHe6 extends JustificacionSiBase {
  elementos: ElementoHe6[];
  aplica: boolean;
  uso: UsoHe6;
  plazas: number;
  unifamiliar: boolean;
  /** Estaciones instaladas (0 en residencial privado). */
  estaciones: number;
  potenciaEstacion_W: number;
  esquema: Esquema;
}

const SUB: Record<Esquema, (residencial: boolean) => Subesquema> = {
  "1": () => "1a",
  "2": () => "2",
  "3": () => "3a",
  "4": (residencial) => (residencial ? "4a" : "4b"),
};

/** Las plazas interiores: las de los garajes; un garaje de la unifamiliar sin plazas dichas, una. */
function plazasInteriores(p: ProyectoSi): { plazas: number; sinDar: boolean } {
  const e = edificioSi(p.edificio);
  let plazas = 0;
  let sinDar = false;
  for (const z of e.zonas) {
    if (z.uso !== "garaje" && z.uso !== "garaje_privado") continue;
    const dadas = entero(z.zona.plazas) ?? 0;
    if (z.uso === "garaje" && dadas === 0 && z.util_m2 > 0) sinDar = true;
    plazas += (z.uso === "garaje_privado" ? Math.max(1, dadas) : dadas) * z.repeticiones;
  }
  return { plazas, sinDar };
}

function estadoRebt(p: ProyectoSi): Partial<RebtEstado> | undefined {
  return p.justificaciones?.rebt?.inputs as Partial<RebtEstado> | undefined;
}

export function justificarHe6(estado: He6Estado, p: ProyectoSi): JustificacionHe6 {
  const e = edificioSi(p.edificio);
  const r = e.resumen;
  const unifamiliar = r.esUnifamiliar;
  const residencial = r.tieneViviendas;
  const uso: UsoHe6 = residencial ? "residencial" : "otros";
  const elementos: ElementoHe6[] = [];
  const avisos: Aviso[] = [];

  // ── Las plazas (ap. 1) ────────────────────────────────────────────────────
  const int = plazasInteriores(p);
  const garajePrivado = e.zonas.some((z) => z.uso === "garaje_privado");
  const parcela = unifamiliar && !garajePrivado && estadoRebt(p)?.plazaParcela === true;
  const exteriores = unifamiliar ? (parcela ? 1 : 0) : (entero(estado.plazasExteriores) ?? 0);
  const plazas = int.plazas + exteriores;
  const excluido = uso === "otros" && plazas > 0 && plazas <= AMBITO_HE6.datos.excluidoHastaPlazas;
  const aplica = plazas > 0 && !excluido;

  elementos.push({
    id: "plazas",
    nombre: "Plazas de aparcamiento",
    tipo: "recarga",
    veredicto: "dato",
    valor: { valor: plazas, unidad: "plazas" },
    ...(uso === "otros" ? { limite: { valor: AMBITO_HE6.datos.excluidoHastaPlazas, unidad: "plazas" } } : {}),
    manda: { tipo: "dato_de_partida", fuente: "plazas de los garajes de El edificio y exteriores adscritas" },
    cita: ["HE 6 · ap. 1"],
    detalle: { clase: "plazas", uso, interiores: int.plazas, exteriores, plazas, parcela, aplica, excluido },
  });
  if (int.sinDar) avisos.push({ id: "plazas-garaje", tipo: "supuesto", elementoId: "plazas", datos: {} });
  if (p.datosGenerales.intervencion !== "obra_nueva" && plazas > 0) avisos.push({ id: "existente", tipo: "caso_especial", elementoId: "plazas", datos: {} });

  const esquema = resolverEsquema(estado, residencial, unifamiliar);
  const base = { aplica, uso, plazas, unifamiliar, esquema };
  if (!aplica) {
    return { elementos, avisos, veredicto: "ok", estaciones: 0, potenciaEstacion_W: 0, ...base };
  }
  if (residencial && (r.tieneOficinas || r.tieneLocales)) avisos.push({ id: "mixto", tipo: "caso_especial", elementoId: "plazas", datos: {} });

  // ── Las estaciones (ap. 3 pto 2): solo en otros usos ──────────────────────
  let instaladas = 0;
  let elEstaciones: ElementoHe6 | null = null;
  if (uso === "otros") {
    const age = estado.age === true;
    const porPlazas = estacionesPorPlazas(plazas, age);
    const garaje = edificioSua(p.edificio).garaje;
    const sua = garaje && garaje.usoAparcamiento ? plazasAccesiblesOtrosUsos(garaje.plazas) : 0;
    const dadas = entero(estado.plazasAccesibles);
    const accesibles = Math.max(sua, dadas ?? 0);
    const porAccesibles = estacionesAccesibles(accesibles);
    const minimo = Math.max(porPlazas, porAccesibles);
    const indicadas = entero(estado.estaciones);
    instaladas = indicadas ?? minimo;
    elEstaciones = {
      id: "estaciones",
      nombre: "Estaciones de recarga",
      tipo: "recarga",
      veredicto: instaladas >= minimo ? "ok" : "fail",
      valor: { valor: instaladas, unidad: "estaciones" },
      limite: { valor: minimo, unidad: "estaciones" },
      manda: {
        tipo: "formula",
        formula: `una por cada ${age ? 20 : 40} plazas o fracción, y una por cada 5 plazas accesibles, que computan`,
        resultado: { valor: minimo, unidad: "estaciones" },
      },
      cita: ["HE 6 · ap. 3 pto 2"],
      detalle: { clase: "estaciones", plazas, age, porPlazas, accesibles, accesiblesSua: dadas === null || dadas <= sua, porAccesibles, minimo, instaladas, minimas: indicadas === null },
    };
    // El redondeo por exceso de las accesibles (criterio) solo importa si sube el mínimo.
    if (porAccesibles > porPlazas && accesibles % 5 !== 0) avisos.push({ id: "accesibles", tipo: "caso_especial", elementoId: "estaciones", datos: {} });
  }

  // ── La conducción de cables (ap. 3 ptos 1 y 2) ────────────────────────────
  const exigidas = uso === "residencial" ? plazas : conduccionMinima(plazas);
  const indicadas = entero(estado.plazasConduccion);
  // Las plazas con estación tienen conducción hasta ellas (K-HE6.5).
  const previstas = Math.min(plazas, Math.max(indicadas ?? exigidas, instaladas));
  elementos.push({
    id: "conduccion",
    nombre: "Plazas con conducción de cables",
    tipo: "recarga",
    veredicto: previstas >= exigidas ? "ok" : "fail",
    valor: { valor: previstas, unidad: "plazas" },
    limite: { valor: exigidas, unidad: "plazas" },
    manda: {
      tipo: "formula",
      formula: uso === "residencial" ? "el 100 % de las plazas" : "al menos el 20 % de las plazas, por exceso",
      resultado: { valor: exigidas, unidad: "plazas" },
    },
    uso: previstas > 0 ? Math.min(9.99, exigidas / previstas) : 1,
    cita: [uso === "residencial" ? "HE 6 · ap. 3 pto 1" : "HE 6 · ap. 3 pto 2", "ITC-BT-52 · ap. 3.2 a)"],
    detalle: { clase: "conduccion", uso, plazas, exigidas, previstas, minimas: indicadas === null, porC13: unifamiliar },
  });
  if (elEstaciones) elementos.push(elEstaciones);

  // ── El esquema de conexión (ap. 4 a) ──────────────────────────────────────
  const habitualEsquema = unifamiliar || estado.esquema === "habitual" || estado.esquema === undefined;
  elementos.push({
    id: "esquema",
    nombre: "Esquema de conexión",
    tipo: "recarga",
    veredicto: "dato",
    valor: { texto: SUB[esquema](residencial) },
    manda: { tipo: "decision_proyectista", decision: `esquema ${SUB[esquema](residencial)} de la ITC-BT-52` },
    cita: ["HE 6 · ap. 4 a)", "ITC-BT-52 · ap. 3"],
    detalle: { clase: "esquema", esquema, subesquema: SUB[esquema](residencial), habitual: habitualEsquema, unifamiliar },
  });

  // ── El tipo y la potencia de la estación (ap. 4 d) ────────────────────────
  const opcion = ESTACIONES_HE6.datos.opciones.find((o) => o.potencia_W === estado.potenciaEstacion_W) ?? ESTACIONES_HE6.datos.opciones[0];
  if (instaladas > 0 || unifamiliar) {
    elementos.push({
      id: "estacion",
      nombre: "Tipo y potencia de la estación",
      tipo: "recarga",
      veredicto: "dato",
      valor: { valor: opcion.potencia_W, unidad: "W" },
      manda: { tipo: "decision_proyectista", decision: `punto de recarga tipo SAVE, modo 3, base tipo 2, ${opcion.texto}` },
      cita: ["HE 6 · ap. 4 d)", "ITC-BT-52 · ap. 5.4"],
      detalle: {
        clase: "estacion",
        potencia_W: opcion.potencia_W,
        texto: opcion.texto,
        habitual: opcion.potencia_W === ESTACIONES_HE6.datos.habitual_W,
        estaciones: unifamiliar ? 1 : instaladas,
        unifamiliar,
      },
    });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, estaciones: instaladas, potenciaEstacion_W: opcion.potencia_W, ...base };
}

/**
 * Lo que REBT lee de HE 6 (un dato se escribe una vez): las plazas que cuentan
 * (con las exteriores), las estaciones que se instalan, su potencia y el esquema.
 */
export function recargaDeHe6(p: ProyectoSi): Pick<JustificacionHe6, "aplica" | "uso" | "plazas" | "estaciones" | "potenciaEstacion_W" | "esquema"> {
  const guardado = p.justificaciones?.he6?.inputs as Partial<He6Estado> | undefined;
  const j = justificarHe6({ ...he6EstadoDefaults, ...(guardado ?? {}) }, p);
  return { aplica: j.aplica, uso: j.uso, plazas: j.plazas, estaciones: j.estaciones, potenciaEstacion_W: j.potenciaEstacion_W, esquema: j.esquema };
}
