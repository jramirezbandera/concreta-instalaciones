// =============================================================================
// DB-SI, SI 6 — Resistencia al fuego de la estructura (feature-19): la R que
// necesita la estructura de cada planta, por el uso de su sector y la altura de
// evacuación del edificio (tabla 3.1), y la de los locales de riesgo especial
// (tabla 3.2). Para el hormigón armado, las dimensiones mínimas del Anejo C de
// cada R que aparece. PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-si4-si6.md, bloque C4):
//   - la R de un forjado es la del sector que tiene DEBAJO (nota 1): el de cada
//     planta es su techo, así que la R de una planta vale para sus soportes y
//     para el forjado que tiene encima;
//   - la columna depende de la altura de evacuación del EDIFICIO;
//   - el garaje bajo otro uso, R 120; de uso exclusivo o sobre otro uso, R 90;
//   - un local de riesgo especial, la de la tabla 3.2 y nunca menos que la de la
//     estructura de su planta;
//   - la tabla se lee planta a planta; un comentario del Ministerio extiende la
//     R de sótano a todo un sector que tenga plantas bajo y sobre rasante, y se
//     avisa (no reglamentario).
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import { edificioSi, type ZonaSi } from "../si/edificio";
import type { LocalRiesgo } from "../si/riesgo";
import { compartimentar, type Compartimentacion, type SectorSi } from "../si/sectores";
import { columnaAltura } from "../si/tablas";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { HABITUALES_SI6, resolverSi6, type DecisionesSi6, type Si6Estado } from "./estado";
import { R_TABLA_3_1, R_TABLA_3_2 } from "./tablas";

/** De dónde sale la R de una zona. */
export type MotivoR = "residencial" | "unifamiliar" | "comercial" | "aparcamiento_bajo" | "aparcamiento" | "riesgo";

export interface RZona {
  zona: ZonaSi;
  R: number;
  motivo: MotivoR;
  local?: LocalRiesgo;
  /** Uso supuesto (el local sin uso, como Comercial). */
  supuesto: boolean;
}

export interface PlantaR {
  nivel: number;
  etiqueta: string;
  R: number;
  zonas: RZona[];
}

export type DetalleSi6 =
  | {
      clase: "planta";
      grupoId: string;
      /** «P1–P3», «PB», «S1». */
      plantas: string;
      bajoRasante: boolean;
      R: number;
      /** Las zonas de la planta (de la más baja del grupo, que es igual a las demás). */
      zonas: RZona[];
      /** La zona que manda. */
      manda: RZona;
    }
  | { clase: "hormigon"; Rs: number[]; garaje: boolean }
  | { clase: "otro_material"; material: "acero" | "madera"; Rs: number[] };

export type ElementoSi6 = ElementoSi<DetalleSi6>;

export interface JustificacionSi6 extends JustificacionSiBase {
  elementos: ElementoSi6[];
  decisiones: DecisionesSi6;
  habituales: DecisionesSi6;
  comp: Compartimentacion;
  plantas: PlantaR[];
}

const T31 = R_TABLA_3_1.datos;

function sectorDe(c: Compartimentacion, z: ZonaSi): SectorSi {
  return c.sectores.find((s) => s.zonas.some((x) => x.id === z.id)) ?? c.principal;
}

/** La R de la estructura de una zona que no es local de riesgo especial (tabla 3.1). */
function rDeZona(c: Compartimentacion, z: ZonaSi): RZona {
  const s = sectorDe(c, z);
  const h = c.h_m;
  const col = columnaAltura(z.bajoRasante, h);
  if (s.uso === "aparcamiento") {
    // «Situado bajo un uso distinto»: su estructura sostiene zonas de otro uso.
    const arriba = Math.max(...s.niveles);
    const bajo = c.edificio.zonas.some((x) => x.uso !== "garaje" && x.niveles.some((n) => n > arriba));
    return { zona: z, R: bajo ? T31.aparcamientoBajoOtroUso : T31.aparcamientoExclusivoOSobre, motivo: bajo ? "aparcamiento_bajo" : "aparcamiento", supuesto: false };
  }
  if (s.uso === "comercial") {
    const R = col === 0 && h > 28 ? T31.comercialSotanoSiHMas28 : T31.comercial[col]!;
    return { zona: z, R, motivo: "comercial", supuesto: s.usoSupuesto };
  }
  if (c.edificio.resumen.esUnifamiliar) {
    const R = T31.viviendaUnifamiliar[col];
    if (R !== null) return { zona: z, R, motivo: "unifamiliar", supuesto: false };
  }
  return { zona: z, R: T31.residencial[col]!, motivo: "residencial", supuesto: false };
}

export function justificarSi6(estado: Si6Estado, p: ProyectoSi): JustificacionSi6 {
  const e = edificioSi(p.edificio);
  const c = compartimentar(e);
  const d = resolverSi6(estado);
  const elementos: ElementoSi6[] = [];
  const avisos: Aviso[] = [];
  const locales = new Map(c.riesgo.locales.map((l) => [l.zona.id, l]));

  // ── La R de cada planta ───────────────────────────────────────────────────
  const plantas: PlantaR[] = e.plantas.map((pl) => {
    const zonas = e.zonas.filter((z) => z.niveles.includes(pl.nivel));
    const normales = zonas.filter((z) => !locales.has(z.id)).map((z) => rDeZona(c, z));
    const base = Math.max(0, ...normales.map((r) => r.R));
    const riesgo = zonas
      .filter((z) => locales.has(z.id))
      .map((z): RZona => {
        const l = locales.get(z.id)!;
        return { zona: z, R: Math.max(R_TABLA_3_2.datos[l.clase], base), motivo: "riesgo", local: l, supuesto: l.supuesto !== null };
      });
    const todas = [...normales, ...riesgo];
    return { nivel: pl.nivel, etiqueta: pl.etiqueta, R: Math.max(0, ...todas.map((r) => r.R)), zonas: todas };
  });

  const grupos = [...new Set(e.plantas.map((pl) => pl.grupoId))];
  for (const gid of grupos) {
    const delGrupo = plantas.filter((pl) => e.plantas.find((x) => x.nivel === pl.nivel)?.grupoId === gid);
    if (delGrupo.length === 0) continue;
    const mayor = delGrupo.reduce((a, b) => (b.R > a.R ? b : a));
    const zonaGrupo = e.zonas.find((z) => z.grupoId === gid);
    const manda = mayor.zonas.reduce((a, b) => (b.R > a.R ? b : a), mayor.zonas[0]);
    if (!manda) continue;
    elementos.push({
      id: `planta-${gid}`,
      nombre: zonaGrupo?.plantas ?? mayor.etiqueta,
      tipo: "estructura",
      veredicto: "ok",
      valor: { texto: `R ${mayor.R}` },
      manda: {
        tipo: "grado_tabla",
        tabla: manda.motivo === "riesgo" ? "Tabla 3.2" : "Tabla 3.1",
        entradas: [
          { k: "Uso", v: manda.motivo },
          { k: "Situación", v: manda.zona.bajoRasante ? "sótano" : `h ${c.h_m} m` },
        ],
      },
      cita: ["SI 6 · tablas 3.1 y 3.2", "ap. 3"],
      detalle: { clase: "planta", grupoId: gid, plantas: zonaGrupo?.plantas ?? mayor.etiqueta, bajoRasante: mayor.nivel < 0, R: mayor.R, zonas: mayor.zonas, manda },
    });
  }

  // El comentario del Ministerio: un sector con plantas bajo y sobre rasante.
  const sp = c.principal;
  const principalNormales = sp.zonas.filter((z) => !locales.has(z.id));
  if (principalNormales.some((z) => z.bajoRasante) && principalNormales.some((z) => !z.bajoRasante) && !e.resumen.esUnifamiliar) {
    avisos.push({ id: "sector-sotano", tipo: "caso_especial", elementoId: elementos.find((x) => x.detalle.clase === "planta" && x.detalle.bajoRasante)?.id, datos: {} });
  }
  if (e.resumen.esUnifamiliar && c.h_m > 15) {
    avisos.push({ id: "unifamiliar-alta", tipo: "fuera_de_alcance", elementoId: elementos[0]?.id, datos: {} });
  }

  // ── Las dimensiones del Anejo C ───────────────────────────────────────────
  const Rs = [...new Set(plantas.map((pl) => pl.R).filter((r) => r > 0))].sort((a, b) => a - b);
  const garaje = c.sectores.some((s) => s.uso === "aparcamiento");
  if (d.material === "hormigon") {
    elementos.push({
      id: "hormigon",
      nombre: "Hormigón armado",
      tipo: "dimensiones",
      veredicto: "ok",
      valor: { texto: `Anejo C · R ${Rs[Rs.length - 1] ?? 0}` },
      manda: { tipo: "grado_tabla", tabla: "Tablas C.2 a C.5", entradas: Rs.map((r) => ({ k: "R", v: String(r) })) },
      cita: ["SI 6 · Anejo C", "tablas C.2 a C.5"],
      detalle: { clase: "hormigon", Rs, garaje },
    });
  } else {
    elementos.push({
      id: "hormigon",
      nombre: d.material === "acero" ? "Estructura de acero" : "Estructura de madera",
      tipo: "dimensiones",
      veredicto: "fuera",
      valor: { texto: d.material === "acero" ? "Anejo D" : "Anejo E" },
      manda: { tipo: "decision_proyectista", decision: d.material },
      cita: ["SI 6 · ap. 6", d.material === "acero" ? "Anejo D" : "Anejo E"],
      detalle: { clase: "otro_material", material: d.material, Rs },
    });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, decisiones: d, habituales: HABITUALES_SI6, comp: c, plantas };
}
