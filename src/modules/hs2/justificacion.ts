// =============================================================================
// DB-HS 2 — La justificación (feature-21): los ocupantes, el espacio de reserva
// o el almacén de contenedores (fórmulas 2.1 y 2.2), su situación y recorrido,
// las características del almacén y el almacenamiento inmediato de cada
// vivienda tipo (fórmula 2.3). PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-hs2.md):
//   - P (y Pv) = dormitorios sencillos + 2 × dobles; sin el dato, el principal
//     doble y los demás sencillos (comentario del Ministerio, no reglamentario);
//   - almacén para las fracciones puerta a puerta, reserva para las de
//     contenedores de calle de superficie; soterrados y neumática, ni uno ni otro;
//   - el cuarto de instalaciones «almacén de residuos» de El edificio es el
//     almacén (o la reserva construida, si no hay recogida puerta a puerta): su
//     superficie útil se compara con la exigida;
//   - el almacenamiento inmediato: C = CA·Pv por fracción, con 45 dm³ mínimo.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Edificio } from "../../lib/edificio/tipos";
import { viviendasEnZona } from "../../lib/edificio/derivar";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import { edificioSi, type ZonaSi } from "../si/edificio";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import {
  habitualesHs2,
  modosDe,
  recogidaPuerta,
  resolverHs2,
  type DecisionesHs2,
  type Hs2Estado,
  type ModoFraccion,
  type Ubicacion,
} from "./estado";
import {
  arriba2,
  capacidadInmediato,
  CARACTERISTICAS_HS2,
  FRACCIONES,
  superficieAlmacen,
  superficieReserva,
  type CapacidadContenedor,
  type Fraccion,
} from "./tablas";
import { CAUDALES_NO_HABITABLES } from "../hs3/tablas";
import { LOCALES_RIESGO_TABLA_2_1 } from "../si/tablas";

/** Una vivienda tipo y sus ocupantes. */
export interface ViviendaHs2 {
  tipoId: string;
  nombre: string;
  /** Viviendas de este tipo en el edificio. */
  cantidad: number;
  dormitorios: number;
  dobles: number;
  /** Si los dobles son los supuestos (el principal). */
  doblesSupuestos: boolean;
  /** Pv = sencillos + 2 × dobles. */
  pv: number;
}

export interface FraccionAlmacen {
  f: Fraccion;
  tf: number;
  contenedor: CapacidadContenedor;
  supuesto: boolean;
}

/** El cuarto «almacén de residuos» de El edificio. */
export interface CuartoResiduos {
  zonaId: string;
  plantas: string;
  bajoRasante: boolean;
  util_m2: number;
}

export type DetalleHs2 =
  | { clase: "ocupantes"; p: number; viviendas: ViviendaHs2[] }
  | {
      clase: "reserva";
      p: number;
      fracciones: Fraccion[];
      exigida_m2: number;
      /** La superficie que se le da y de dónde sale. */
      dada_m2: number;
      origen: "edificio" | "decision" | "exigida";
    }
  | {
      clase: "almacen";
      p: number;
      fracciones: FraccionAlmacen[];
      exigida_m2: number;
      dada_m2: number;
      origen: "edificio" | "decision" | "exigida";
    }
  | { clase: "recorrido"; ubicacion: Ubicacion; espacio: "almacen" | "reserva" | "ambos"; deEdificio: boolean }
  | {
      clase: "caracteristicas";
      s_m2: number;
      /** Clase de local de riesgo especial (SI 1 tabla 2.1) o null si no lo es. */
      riesgo: "bajo" | "medio" | "alto" | null;
      /** Caudal de ventilación de HS 3 (10 l/s por m² útil). */
      ventilacion_l_s: number;
    }
  | {
      clase: "inmediato";
      vivienda: ViviendaHs2;
      capacidades: { f: Fraccion; calculada_dm3: number; exigida_dm3: number }[];
      /** Papel y vidrio pueden ir al almacén (aislada o agrupada horizontalmente, con almacén). */
      enAlmacen: Fraccion[];
    };

export type ElementoHs2 = ElementoSi<DetalleHs2>;

export interface JustificacionHs2 extends JustificacionSiBase {
  elementos: ElementoHs2[];
  decisiones: DecisionesHs2;
  habituales: DecisionesHs2;
  modos: Record<Fraccion, ModoFraccion>;
  p: number;
  viviendas: ViviendaHs2[];
  unifamiliar: boolean;
  /** Hay viviendas: si no, HS 2 no aplica (estudio específico). */
  residencial: boolean;
  local: boolean;
  oficinas: boolean;
  garaje: boolean;
  cuarto: CuartoResiduos | null;
}

/** Las viviendas tipo que hay en el edificio, con cuántas de cada una. */
function viviendasDe(edificio: Edificio, dobles: Hs2Estado["dobles"]): ViviendaHs2[] {
  const cuenta = new Map<string, number>();
  const tipos = edificio.unidades.filter((u) => u.clase === "vivienda");
  const unifamiliar = edificio.grupos.some((g) => g.zonas.some((z) => z.uso === "vivienda_unifamiliar"));
  if (unifamiliar) {
    // La unifamiliar no reparte unidades: su tipo es el primero de vivienda.
    if (tipos[0]) cuenta.set(tipos[0].id, 1);
  } else {
    for (const g of edificio.grupos) {
      const n = Math.max(1, Math.trunc(g.repeticiones));
      for (const z of g.zonas) {
        if (z.uso !== "viviendas" || viviendasEnZona(edificio, z) === 0) continue;
        for (const u of z.unidades ?? []) {
          const c = Number.isFinite(u.cantidad) ? Math.max(0, Math.trunc(u.cantidad)) : 0;
          if (c > 0 && tipos.some((t) => t.id === u.tipoId)) cuenta.set(u.tipoId, (cuenta.get(u.tipoId) ?? 0) + c * n);
        }
      }
    }
  }
  const out: ViviendaHs2[] = [];
  for (const t of tipos) {
    const cantidad = cuenta.get(t.id) ?? 0;
    if (cantidad === 0 || t.clase !== "vivienda") continue;
    const dormitorios = Math.max(0, Math.trunc(t.dormitorios));
    const indicado = dobles?.[t.id];
    const valido = indicado !== undefined && Number.isFinite(indicado);
    const d = valido ? Math.min(dormitorios, Math.max(0, Math.trunc(indicado))) : Math.min(1, dormitorios);
    out.push({
      tipoId: t.id,
      nombre: t.nombre,
      cantidad,
      dormitorios,
      dobles: d,
      doblesSupuestos: !valido,
      // Un estudio sin dormitorio cuenta como uno doble (criterio, verificacion-hs2.md K1).
      pv: dormitorios === 0 ? 2 : dormitorios - d + 2 * d,
    });
  }
  return out;
}

function cuartoResiduos(zonas: readonly ZonaSi[]): CuartoResiduos | null {
  const cs = zonas.filter((z) => z.uso === "instalaciones" && z.zona.cuarto === "residuos");
  if (cs.length === 0) return null;
  const c = cs[0];
  return {
    zonaId: c.id,
    plantas: c.plantas,
    bajoRasante: c.bajoRasante,
    util_m2: Math.round(cs.reduce((a, z) => a + z.util_m2 * z.repeticiones, 0) * 100) / 100,
  };
}

/** Clase de riesgo especial del almacén de residuos (SI 1 tabla 2.1), con la útil como orientación. */
function riesgoAlmacen(s_m2: number): "bajo" | "medio" | "alto" | null {
  const f = LOCALES_RIESGO_TABLA_2_1.datos.almacenResiduos;
  if (s_m2 > f.alto.gt) return "alto";
  if (s_m2 > f.medio.gt) return "medio";
  if (s_m2 > f.bajo.gt) return "bajo";
  return null;
}

export function justificarHs2(estado: Hs2Estado, p: ProyectoSi): JustificacionHs2 {
  const e = edificioSi(p.edificio);
  const r = e.resumen;
  const unifamiliar = r.esUnifamiliar;
  const habituales = habitualesHs2(unifamiliar);
  const cuarto = cuartoResiduos(e.zonas);
  const d0 = resolverHs2(estado, habituales);
  // Con el cuarto en El edificio, su planta manda sobre la ubicación.
  const decisiones: DecisionesHs2 = cuarto ? { ...d0, ubicacion: cuarto.bajoRasante ? "sotano" : "planta_baja" } : d0;
  const modos = modosDe(decisiones.recogida, estado.modos);
  const viviendas = viviendasDe(p.edificio, estado.dobles ?? {});
  const P = viviendas.reduce((a, v) => a + v.pv * v.cantidad, 0);
  const elementos: ElementoHs2[] = [];
  const avisos: Aviso[] = [];
  const base = {
    unifamiliar,
    residencial: r.tieneViviendas,
    local: r.tieneLocales,
    oficinas: r.tieneOficinas,
    garaje: r.tieneGaraje,
    cuarto,
  };

  if (!r.tieneViviendas) {
    return { elementos, avisos, veredicto: "ok", decisiones, habituales, modos, p: 0, viviendas, ...base };
  }

  // ── Ocupantes ─────────────────────────────────────────────────────────────
  elementos.push({
    id: "ocupantes",
    nombre: "Ocupantes habituales del edificio",
    tipo: "residuos",
    veredicto: "dato",
    valor: { valor: P, unidad: "personas" },
    manda: { tipo: "dato_de_partida", fuente: "dormitorios de las viviendas tipo de El edificio" },
    cita: ["HS 2 · ap. 2.1.2.1"],
    detalle: { clase: "ocupantes", p: P, viviendas },
  });
  if (estado.recogida === "habitual" || estado.recogida === undefined) {
    avisos.push({ id: "recogida", tipo: "supuesto", elementoId: modos.papel === "puerta" ? "almacen" : "reserva", datos: {} });
  }
  if (viviendas.some((v) => v.doblesSupuestos && v.dormitorios > 1)) {
    avisos.push({ id: "dobles", tipo: "supuesto", elementoId: "ocupantes", datos: {} });
  }

  // ── Espacio de reserva y almacén ──────────────────────────────────────────
  const enCalle = FRACCIONES.filter((f) => modos[f] === "calle");
  const enPuerta: FraccionAlmacen[] = FRACCIONES.filter((f) => modos[f] === "puerta").map((f) => ({ f, ...recogidaPuerta(estado, f) }));
  const conAlmacen = enPuerta.length > 0;
  const superficieDada = (exigida: number, propia: number | null | undefined, delCuarto: boolean) => {
    if (delCuarto && cuarto) return { dada_m2: cuarto.util_m2, origen: "edificio" as const };
    if (propia !== null && propia !== undefined && Number.isFinite(propia) && propia > 0) return { dada_m2: propia, origen: "decision" as const };
    return { dada_m2: exigida, origen: "exigida" as const };
  };

  if (conAlmacen) {
    const exigida_m2 = arriba2(superficieAlmacen(P, enPuerta));
    const s = superficieDada(exigida_m2, estado.superficieAlmacen_m2, true);
    const ok = s.dada_m2 + 1e-9 >= exigida_m2;
    elementos.push({
      id: "almacen",
      nombre: "Almacén de contenedores de edificio",
      tipo: "residuos",
      veredicto: ok ? "ok" : "fail",
      valor: { valor: s.dada_m2, unidad: "m²" },
      limite: { valor: exigida_m2, unidad: "m²" },
      manda: { tipo: "formula", formula: "S = 0,8·P·Σ(Tf·Gf·Cf·Mf)", resultado: { valor: exigida_m2, unidad: "m²" } },
      uso: s.dada_m2 > 0 ? Math.min(9.99, exigida_m2 / s.dada_m2) : 1,
      cita: ["HS 2 · ap. 2.1.2.1", "HS 2 · tabla 2.1"],
      detalle: { clase: "almacen", p: P, fracciones: enPuerta, exigida_m2, ...s },
    });
    if (enPuerta.some((x) => x.supuesto)) avisos.push({ id: "periodos", tipo: "supuesto", elementoId: "almacen", datos: {} });
  }
  if (enCalle.length > 0) {
    const exigida_m2 = arriba2(superficieReserva(P, enCalle));
    // Sin almacén, el cuarto de residuos de El edificio es la reserva ya construida.
    const s = superficieDada(exigida_m2, estado.superficieReserva_m2, !conAlmacen);
    const ok = s.dada_m2 + 1e-9 >= exigida_m2;
    elementos.push({
      id: "reserva",
      nombre: "Espacio de reserva",
      tipo: "residuos",
      veredicto: ok ? "ok" : "fail",
      valor: { valor: s.dada_m2, unidad: "m²" },
      limite: { valor: exigida_m2, unidad: "m²" },
      manda: { tipo: "formula", formula: "SR = P·Σ(Ff·Mf)", resultado: { valor: exigida_m2, unidad: "m²" } },
      uso: s.dada_m2 > 0 ? Math.min(9.99, exigida_m2 / s.dada_m2) : 1,
      cita: ["HS 2 · ap. 2.1.2.2", "HS 2 · tabla 2.2"],
      detalle: { clase: "reserva", p: P, fracciones: enCalle, exigida_m2, ...s },
    });
  }

  // ── Situación y recorrido ─────────────────────────────────────────────────
  const conReserva = enCalle.length > 0;
  if (conAlmacen || conReserva) {
    elementos.push({
      id: "recorrido",
      nombre: "Situación y recorrido hasta el punto de recogida",
      tipo: "residuos",
      veredicto: "ok",
      valor: { texto: decisiones.ubicacion === "exterior" ? "< 25 m del acceso" : "1,20 m · ≤ 12 %" },
      manda: { tipo: "decision_proyectista", decision: "ubicación del almacén o la reserva" },
      cita: ["HS 2 · ap. 2.1.1"],
      detalle: { clase: "recorrido", ubicacion: decisiones.ubicacion, espacio: conAlmacen && conReserva ? "ambos" : conAlmacen ? "almacen" : "reserva", deEdificio: cuarto !== null },
    });
    if (decisiones.ubicacion === "sotano") avisos.push({ id: "sotano", tipo: "caso_especial", elementoId: "recorrido", datos: {} });
  }

  // ── Características del almacén ───────────────────────────────────────────
  // Solo el almacén: a la reserva no se le exigen hasta que se construya (verificacion-hs2.md).
  if (conAlmacen) {
    const s_m2 = (elementos.find((x) => x.id === "almacen")!.detalle as { dada_m2: number }).dada_m2;
    elementos.push({
      id: "caracteristicas",
      nombre: "Características del almacén",
      tipo: "residuos",
      veredicto: "ok",
      valor: { texto: `≤ ${CARACTERISTICAS_HS2.datos.temperaturaMax_C} °C · ${CARACTERISTICAS_HS2.datos.iluminacion_lux} lux` },
      manda: { tipo: "decision_proyectista", decision: "acabados e instalaciones del almacén" },
      cita: ["HS 2 · ap. 2.1.3"],
      detalle: {
        clase: "caracteristicas",
        s_m2,
        riesgo: riesgoAlmacen(s_m2),
        ventilacion_l_s: Math.round(CAUDALES_NO_HABITABLES.datos.almacenResiduos_l_s_m2 * s_m2 * 10) / 10,
      },
    });
  }

  // ── Almacenamiento inmediato en cada vivienda tipo ───────────────────────
  for (const v of viviendas) {
    // ap. 2.3 pto 2: en la vivienda aislada o agrupada horizontalmente, el papel y el vidrio
    // pueden ir al almacén de contenedores, si lo hay (con solo reserva, no).
    const enAlmacen: Fraccion[] = unifamiliar ? (["papel", "vidrio"] as Fraccion[]).filter((f) => modos[f] === "puerta") : [];
    elementos.push({
      id: `inmediato-${v.tipoId}`,
      nombre: unifamiliar ? "Almacenamiento inmediato en la vivienda" : `Almacenamiento inmediato · vivienda ${v.nombre}`,
      tipo: "residuos",
      veredicto: "ok",
      valor: { valor: FRACCIONES.reduce((a, f) => a + capacidadInmediato(f, v.pv).exigida_dm3, 0), unidad: "dm³" },
      manda: { tipo: "formula", formula: "C = CA·Pv", resultado: { valor: v.pv, unidad: "personas" } },
      cita: ["HS 2 · ap. 2.3", "HS 2 · tabla 2.3"],
      detalle: { clase: "inmediato", vivienda: v, capacidades: FRACCIONES.map((f) => ({ f, ...capacidadInmediato(f, v.pv) })), enAlmacen },
    });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, decisiones, habituales, modos, p: P, viviendas, ...base };
}
