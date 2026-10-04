// =============================================================================
// DB-SI, SI 1 — Propagación interior (feature-19): los sectores de incendio y
// su superficie (tabla 1.1), lo que separa a cada uno del resto (tabla 1.2), la
// separación entre viviendas, los locales de riesgo especial (tablas 2.1 y 2.2)
// y la reacción al fuego de los revestimientos (tabla 4.1). Todo sale de El
// edificio; los datos que faltan (qué es un cuarto, el uso del local, la
// superficie construida) se suponen del lado de la seguridad y se avisan solo
// si cambian algo. PURA y DETERMINISTA; no redacta.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import { edificioSi, type ZonaSi } from "../si/edificio";
import type { LocalRiesgo } from "../si/riesgo";
import {
  compartimentar,
  condicionesLocal,
  limiteDe,
  type CondicionesLocal,
  type Compartimentacion,
  type LimiteSector,
  type SectorSi,
  type ZonaExenta,
} from "../si/sectores";
import { SECTORES_TABLA_1_1 } from "../si/tablas";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import type { Si1Estado } from "./estado";

export type DetalleSi1 =
  | { clase: "principal"; sector: SectorSi; unifamiliar: boolean; viviendas: number }
  | { clase: "sector"; sector: SectorSi; limite: LimiteSector }
  | { clase: "exenta"; exenta: ZonaExenta }
  | { clase: "entre_viviendas"; ei: number; viviendas: number }
  | { clase: "local"; local: LocalRiesgo; condiciones: CondicionesLocal }
  | { clase: "no_local"; zona: ZonaSi; motivo: "trasteros" | "cuarto" }
  | { clase: "reaccion"; garaje: boolean; locales: number; unifamiliar: boolean };

export type ElementoSi1 = ElementoSi<DetalleSi1>;

export interface JustificacionSi1 extends JustificacionSiBase {
  elementos: ElementoSi1[];
  comp: Compartimentacion;
}

/** El elemento de un sector o de una zona, para el dibujo. */
export function elementoDeZona(j: JustificacionSi1, zonaId: string): string | null {
  // Primero lo propio de la zona (su local o su exención) y después su sector,
  // que también la contiene.
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase === "local" && d.local.zona.id === zonaId) return el.id;
    if (d.clase === "no_local" && d.zona.id === zonaId) return el.id;
    if (d.clase === "exenta" && d.exenta.zona.id === zonaId) return el.id;
  }
  for (const el of j.elementos) {
    const d = el.detalle;
    if ((d.clase === "principal" || d.clase === "sector") && d.sector.zonas.some((z) => z.id === zonaId)) return el.id;
  }
  return null;
}

function nombreSector(s: SectorSi, unifamiliar: boolean): string {
  if (s.principal) {
    if (unifamiliar) return "La vivienda";
    return s.uso === "administrativo" ? "Oficinas" : "Viviendas";
  }
  if (s.id === "garaje") return "Garaje";
  if (s.id === "oficinas") return "Oficinas";
  if (s.id === "viviendas") return "Viviendas";
  return "Local";
}

export function justificarSi1(_estado: Si1Estado, p: ProyectoSi): JustificacionSi1 {
  const e = edificioSi(p.edificio);
  const c = compartimentar(e);
  const unifamiliar = e.resumen.esUnifamiliar;
  const max = SECTORES_TABLA_1_1.datos.sectorMax_m2;
  const elementos: ElementoSi1[] = [];
  const avisos: Aviso[] = [];

  // ── El sector principal ───────────────────────────────────────────────────
  const sp = c.principal;
  const medida = sp.porPlantas && sp.plantaMayor ? sp.plantaMayor : sp.superficie;
  elementos.push({
    id: "sector-principal",
    nombre: nombreSector(sp, unifamiliar),
    tipo: "sector",
    veredicto: medida.construida_m2 <= max ? "ok" : "fail",
    valor: { valor: medida.construida_m2, unidad: "m²" },
    limite: { valor: max, unidad: "m²" },
    manda: { tipo: "capacidad_tabla", tabla: "Tabla 1.1", recibe: { valor: medida.construida_m2, unidad: "m²" }, admite: { valor: max, unidad: "m²" } },
    uso: medida.construida_m2 / max,
    cita: ["SI 1 · tabla 1.1", "ap. 1"],
    detalle: { clase: "principal", sector: sp, unifamiliar, viviendas: e.resumen.numViviendas },
  });
  if (sp.dependeDeConstruida) avisos.push({ id: "construida-principal", tipo: "supuesto", elementoId: "sector-principal", datos: {} });
  if (sp.porPlantas) avisos.push({ id: "por-plantas", tipo: "caso_especial", elementoId: "sector-principal", datos: {} });

  // ── Los demás sectores y lo que los separa ────────────────────────────────
  for (const s of c.sectores.filter((x) => !x.principal)) {
    const limite = limiteDe(c, s);
    const id = `sector-${s.id}`;
    const cabe = s.limite_m2 === null || s.superficie.construida_m2 <= s.limite_m2;
    elementos.push({
      id,
      nombre: nombreSector(s, unifamiliar),
      tipo: "sector",
      veredicto: cabe ? "ok" : "fail",
      valor: { texto: `EI ${limite.ei}` },
      manda: {
        tipo: "grado_tabla",
        tabla: "Tabla 1.2",
        entradas: [
          { k: "Uso", v: s.uso },
          { k: "Situación", v: s.bajoRasante ? "bajo rasante" : `h ${c.h_m} m` },
        ],
      },
      cita: ["SI 1 · tablas 1.1 y 1.2", "ap. 1"],
      detalle: { clase: "sector", sector: s, limite },
    });
    if (s.dependeDeConstruida) avisos.push({ id: `construida-${s.id}`, tipo: "supuesto", elementoId: id, datos: {} });
    if (s.usoSupuesto) avisos.push({ id: `uso-${s.id}`, tipo: "supuesto", elementoId: id, datos: { zonaId: s.zonas[0]?.id } });
  }

  // ── Zonas de otro uso que no precisan ser sector ──────────────────────────
  for (const x of c.exentas) {
    const id = `exenta-${x.zona.id}`;
    elementos.push({
      id,
      nombre: x.zona.uso === "oficinas" ? "Oficinas" : "Local",
      tipo: "sector",
      veredicto: "ok",
      valor: { texto: "no precisa ser sector" },
      manda: {
        tipo: "capacidad_tabla",
        tabla: "Tabla 1.1",
        recibe: { valor: x.zona.construida.valor * x.zona.repeticiones, unidad: "m²" },
        admite: { valor: SECTORES_TABLA_1_1.datos.establecimientoExento_m2, unidad: "m²" },
      },
      cita: ["SI 1 · tabla 1.1"],
      detalle: { clase: "exenta", exenta: x },
    });
    if (x.dependeDeConstruida) avisos.push({ id: `construida-${x.zona.id}`, tipo: "supuesto", elementoId: id, datos: {} });
  }

  // ── Entre viviendas ───────────────────────────────────────────────────────
  if (!unifamiliar && e.resumen.numViviendas > 1) {
    const ei = SECTORES_TABLA_1_1.datos.entreViviendas_EI;
    elementos.push({
      id: "entre-viviendas",
      nombre: "Entre viviendas",
      tipo: "separacion",
      veredicto: "ok",
      valor: { texto: `EI ${ei}` },
      manda: { tipo: "grado_tabla", tabla: "Tabla 1.1", entradas: [{ k: "Uso", v: "Residencial Vivienda" }] },
      cita: ["SI 1 · tabla 1.1"],
      detalle: { clase: "entre_viviendas", ei, viviendas: e.resumen.numViviendas },
    });
  }

  // ── Locales de riesgo especial y los que no lo son ────────────────────────
  for (const l of c.riesgo.locales) {
    const id = `local-${l.zona.id}`;
    elementos.push({
      id,
      nombre: nombreLocal(l),
      tipo: "local",
      veredicto: "ok",
      valor: { texto: `riesgo ${l.clase}` },
      manda: {
        tipo: "grado_tabla",
        tabla: "Tabla 2.1",
        entradas: [{ k: "Local", v: l.tipo }, ...(l.s_m2 !== undefined ? [{ k: "S", v: `${l.s_m2} m²` }] : []), ...(l.p_kW !== undefined ? [{ k: "P", v: `${l.p_kW} kW` }] : [])],
      },
      cita: ["SI 1 · tablas 2.1 y 2.2", "ap. 2"],
      detalle: { clase: "local", local: l, condiciones: condicionesLocal(c, l) },
    });
    if (l.supuesto === "tipo") avisos.push({ id: `cuarto-${l.zona.id}`, tipo: "supuesto", elementoId: id, datos: { zonaId: l.zona.id } });
    if (l.supuesto === "potencia") avisos.push({ id: `potencia-${l.zona.id}`, tipo: "supuesto", elementoId: id, datos: { zonaId: l.zona.id } });
    if (l.supuesto === "construida") avisos.push({ id: `construida-${l.zona.id}`, tipo: "supuesto", elementoId: id, datos: { zonaId: l.zona.id } });
  }
  const conLocal = new Set(c.riesgo.locales.map((l) => l.zona.id));
  for (const z of e.zonas) {
    if (conLocal.has(z.id)) continue;
    const trasteros = z.uso === "trasteros" && e.resumen.tieneViviendas;
    if (!trasteros && z.uso !== "instalaciones") continue;
    elementos.push({
      id: `local-${z.id}`,
      nombre: trasteros ? "Trasteros" : "Cuarto de instalaciones",
      tipo: "local",
      veredicto: "ok",
      valor: { texto: "no es local de riesgo" },
      manda: { tipo: "grado_tabla", tabla: "Tabla 2.1", entradas: [{ k: "Local", v: trasteros ? "trasteros" : (z.zona.cuarto ?? "cuarto") }] },
      cita: ["SI 1 · tabla 2.1"],
      detalle: { clase: "no_local", zona: z, motivo: trasteros ? "trasteros" : "cuarto" },
    });
  }

  // ── Reacción al fuego ─────────────────────────────────────────────────────
  elementos.push({
    id: "reaccion",
    nombre: "Revestimientos",
    tipo: "reaccion",
    veredicto: "ok",
    valor: { texto: "C-s2,d0 · EFL" },
    manda: { tipo: "grado_tabla", tabla: "Tabla 4.1", entradas: [{ k: "Situación", v: "zonas ocupables" }] },
    cita: ["SI 1 · tabla 4.1", "ap. 4"],
    detalle: { clase: "reaccion", garaje: c.sectores.some((s) => s.uso === "aparcamiento"), locales: c.riesgo.locales.length, unifamiliar },
  });

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, comp: c };
}

const NOMBRE_TIPO_LOCAL: Record<LocalRiesgo["tipo"], string> = {
  trasteros: "Trasteros",
  garaje: "Garaje",
  garaje_unifamiliar: "Garaje",
  sin_tipo: "Cuarto de instalaciones",
  contadores_electricidad: "Contadores de electricidad",
  telecomunicaciones: "Telecomunicaciones",
  sala_maquinas: "Sala de máquinas",
  calderas: "Sala de calderas",
  ascensor: "Maquinaria del ascensor",
  grupo_electrogeno: "Grupo electrógeno",
  residuos: "Cuarto de basuras",
};

export function nombreLocal(l: LocalRiesgo): string {
  return NOMBRE_TIPO_LOCAL[l.tipo];
}

/** Las zonas cuya superficie construida decide algo en SI 1, o que ya la tienen. */
export function zonasConstruidaSi1(j: JustificacionSi1): ZonaSi[] {
  const c = j.comp;
  const out = new Map<string, ZonaSi>();
  for (const a of j.avisos) {
    if (!a.id.startsWith("construida-")) continue;
    const clave = a.id.slice("construida-".length);
    const sector = c.sectores.find((s) => s.id === clave);
    const zonas = sector ? sector.zonas : c.edificio.zonas.filter((z) => z.id === clave);
    for (const z of zonas) out.set(z.id, z);
  }
  for (const z of c.edificio.zonas) if (!z.construida.supuesto) out.set(z.id, z);
  return [...out.values()];
}
