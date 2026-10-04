// =============================================================================
// DB-HS5 — La justificación entera (feature-14 §E): residuales + pluviales +
// lo que no es red de UD (local, garaje, conexión), con el contrato de
// resultado de REDISENO-V4 §3.2.
//
// PURA y DETERMINISTA. No redacta: devuelve elementos y avisos en datos; la
// prosa la ponen `textos.ts` y `memoria.ts`.
//
// Dos modos (`Hs5Estado.red`):
//   - «edificio»: la red de residuales sale de El edificio y de las decisiones;
//   - «manual»: manda la tabla de tramos del estado («Ajustar a mano»).
// En los dos, pluviales, local, garaje y ventilación salen del edificio.
// =============================================================================

import type { Aviso, ElementoResultado, Gobierno } from "../../lib/cte/resultado";
import { etiquetaNivel, resumenEdificio } from "../../lib/edificio/derivar";
import type { Edificio } from "../../lib/edificio/tipos";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import { calcHS5, type HS5Inputs, type HS5Result, type ResultadoTramo } from "./calc";
import type { Hs5Estado } from "./estado";
import { bajantesPluvialesPropuestas, calcPluviales, intensidadDe, type ResultadoPluviales } from "./pluviales";
import {
  generarRedHs5,
  NOMBRE_BAJANTE,
  slugDe,
  type BajanteHs5,
  type CuartoRed,
  type DecisionesEfectivas,
  type GarajeHs5,
  type LocalHs5,
  type RedHs5,
  type VerticalHs5,
} from "./red";
import {
  BAJANTES_TABLA_4_4,
  COLECTORES_TABLA_4_5,
  INTENSIDAD_TABLA_B_1,
  ISOYETAS,
  RAMALES_COLECTORES_TABLA_4_3,
  UD_APARATOS_TABLA_4_1,
  VENT_PRIMARIA,
  type FilaAparato4_1,
  type Isoyeta,
  type TipoAparato,
  type ZonaPluviometrica,
} from "./tablas";

/** Datos de la obra que usa HS5 (opcionales: sin ellos se supone y se avisa). */
export interface ObraHs5 {
  pluviometria?: { zona: ZonaPluviometrica; isoyeta: Isoyeta };
  /** Cota del alcantarillado en la acometida [m] (negativa: bajo la rasante). */
  cotaAlcantarillado_m?: number;
}

/** Lo que la franja y la memoria necesitan de cada elemento, además del contrato. */
export type DetalleHs5 =
  | { clase: "colector"; tramo: ResultadoTramo; bajantes: number; disposicion: DecisionesEfectivas["colectores"] }
  | {
      clase: "bajante";
      tramo: ResultadoTramo;
      vertical: VerticalHs5 | null;
      bajante: BajanteHs5 | null;
      aparatos: TipoAparato[];
    }
  | { clase: "ramal"; tramo: ResultadoTramo; cuartos: CuartoRed[]; nivel: number | null; ramales: number }
  | {
      clase: "pluviales_bajantes" | "pluviales_colector" | "canalones";
      p: ResultadoPluviales;
      intensidad: IntensidadHs5;
    }
  | { clase: "ventilacion"; plantas: number; ventilacion: DecisionesEfectivas["ventilacion"]; bajantes: number; prolongacion_m: number; secundariaDiametro_mm: number | null }
  | { clase: "local"; local: LocalHs5 }
  | { clase: "garaje"; garaje: GarajeHs5; bombeo: boolean; cotaAlcantarillado_m: number | null; colectores: DecisionesEfectivas["colectores"] }
  | {
      clase: "conexion";
      alcantarillado: DecisionesEfectivas["alcantarillado"];
      residuales_mm: number | null;
      pluviales_mm: number | null;
    };

export interface ElementoHs5 extends ElementoResultado {
  /** «Bajante A · fecales», «Colector general». */
  nombre: string;
  detalle: DetalleHs5;
}

export interface IntensidadHs5 {
  valor_mm_h: number;
  zona: ZonaPluviometrica | null;
  isoyeta: Isoyeta | null;
  /** No consta en los datos de la obra: se calcula con la de referencia. */
  supuesta: boolean;
}

export interface JustificacionHs5 {
  modo: Hs5Estado["red"];
  red: RedHs5;
  /** La red de residuales que se ha dimensionado (la del edificio o la manual). */
  residualesInputs: HS5Inputs;
  /** `null` si no hay red de residuales (un edificio sin cuartos húmedos). */
  residuales: HS5Result | null;
  pluviales: ResultadoPluviales | null;
  intensidad: IntensidadHs5;
  elementos: ElementoHs5[];
  avisos: Aviso[];
  veredicto: Veredicto;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const APARATOS_4_1 = UD_APARATOS_TABLA_4_1.datos.aparatos as Readonly<Record<TipoAparato, FilaAparato4_1>>;

const TABLA_TRAMO: Record<ResultadoTramo["tipo"], string> = {
  ramal: RAMALES_COLECTORES_TABLA_4_3.procedencia.tabla!,
  bajante: BAJANTES_TABLA_4_4.procedencia.tabla!,
  colector: COLECTORES_TABLA_4_5.procedencia.tabla!,
};

const CITA_TRAMO: Record<ResultadoTramo["tipo"], string[]> = {
  ramal: ["HS 5 · tablas 4.1 y 4.3", "ap. 4.1.1.3"],
  bajante: ["HS 5 · tablas 4.1 y 4.4", "ap. 4.1.2"],
  colector: ["HS 5 · tabla 4.5", "ap. 4.1.3"],
};

/** Ø del desagüe de un aparato (Tabla 4.1) para el uso dado. */
function desagueDe(tipo: TipoAparato, uso: HS5Inputs["uso"]): number {
  const f = APARATOS_4_1[tipo];
  return (uso === "privado" ? f.diametroMin_mm_privado : f.diametroMin_mm_publico) ?? 0;
}

/** Hash corto y estable de un texto (ids de los avisos del motor). */
function hashTexto(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** Contrato de un tramo dimensionado: valor, lo que manda, alternativa, uso. */
function contratoTramo(
  t: ResultadoTramo,
  uso: HS5Inputs["uso"],
): Pick<ElementoResultado, "veredicto" | "valor" | "manda" | "alternativa" | "uso" | "limite" | "cita"> {
  let manda: Gobierno;
  const ep = t.elevadoPor;
  if (!ep) {
    manda = {
      tipo: "capacidad_tabla",
      tabla: TABLA_TRAMO[t.tipo],
      recibe: { valor: t.udAcumuladas, unidad: "UD" },
      admite: { valor: t.capacidad_ud ?? 0, unidad: "UD" },
    };
  } else if (ep.causa === "aparato" || (ep.aparato !== null && t.tipo !== "colector")) {
    const aparato = ep.aparato!;
    manda = { tipo: "minimo_aparato", aparato, diametroMin_mm: desagueDe(aparato, uso) };
  } else {
    manda = { tipo: "no_menor_que_aguas_arriba", elementos: ep.tramos, diametro_mm: ep.diametroMin_mm };
  }
  const alt = t.alternativa;
  return {
    veredicto: t.estado === "fail" ? "fail" : "ok",
    valor: t.diametro_mm === null ? { texto: "sin Ø" } : { valor: t.diametro_mm, unidad: "mm" },
    limite: t.capacidad_ud === null ? undefined : { valor: t.capacidad_ud, unidad: "UD" },
    manda,
    alternativa: alt
      ? {
          valor: { valor: alt.diametro_mm, unidad: "mm" },
          capacidad: alt.capacidad_ud === null ? null : { valor: alt.capacidad_ud, unidad: "UD" },
          porQueNo: alt.capacidad_ud === null || t.udAcumuladas > alt.capacidad_ud ? "capacidad" : "minimo",
        }
      : undefined,
    uso: t.capacidad_ud ? t.udAcumuladas / t.capacidad_ud : undefined,
    cita: CITA_TRAMO[t.tipo],
  };
}

function nombreTramo(inp: HS5Inputs, id: string): string {
  return inp.tramos.find((t) => t.id === id)?.nombre ?? id;
}

// -----------------------------------------------------------------------------
// Justificación
// -----------------------------------------------------------------------------

export function justificarHs5(estado: Hs5Estado, edificio: Edificio, obra: ObraHs5 = {}): JustificacionHs5 {
  const red = generarRedHs5(edificio, estado);
  const d = red.decisiones;
  const resumen = resumenEdificio(edificio);
  const modo = estado.red;

  // ── Residuales ─────────────────────────────────────────────────────────────
  const residualesInputs: HS5Inputs = {
    ...(modo === "manual"
      ? {
          uso: estado.uso,
          numPlantas: estado.numPlantas,
          cubiertaTransitable: estado.cubiertaTransitable,
          tramos: estado.tramos,
          aparatos: estado.aparatos,
        }
      : red.residuales),
    ventilacionSecundaria: d.ventilacion === "secundaria",
  };
  const residuales = residualesInputs.tramos.length > 0 ? calcHS5(residualesInputs) : null;
  const porId = new Map((residuales?.porTramo ?? []).map((t) => [t.id, t] as const));

  // ── Pluviales ──────────────────────────────────────────────────────────────
  // Un expediente tocado a mano no puede colar una zona o isoyeta que no existe.
  const pv =
    obra.pluviometria &&
    (obra.pluviometria.zona === "A" || obra.pluviometria.zona === "B") &&
    (ISOYETAS as readonly number[]).includes(obra.pluviometria.isoyeta)
      ? obra.pluviometria
      : undefined;
  const intensidad: IntensidadHs5 = pv
    ? { valor_mm_h: intensidadDe(pv.zona, pv.isoyeta), zona: pv.zona, isoyeta: pv.isoyeta, supuesta: false }
    : { valor_mm_h: INTENSIDAD_TABLA_B_1.datos.referencia_mm_h, zona: null, isoyeta: null, supuesta: true };
  const pluviales =
    red.cubierta.superficie_m2 > 0
      ? calcPluviales({
          cubierta: red.cubierta,
          intensidad_mm_h: intensidad.valor_mm_h,
          bajantes: estado.bajantesPluviales > 0 ? estado.bajantesPluviales : bajantesPluvialesPropuestas(red.cubierta),
          pendienteColector_pct: d.pendienteColector_pct,
        })
      : null;

  const elementos: ElementoHs5[] = [];
  const avisos: Aviso[] = [];

  // ── Garaje (primero: es lo que pide atención) ─────────────────────────────
  const cotaAlc = Number.isFinite(obra.cotaAlcantarillado_m) ? (obra.cotaAlcantarillado_m as number) : null;
  for (const g of red.garajes) {
    // Un garaje privado sobre rasante es un sumidero más: no es una red aparte.
    if (g.privado && g.nivel >= 0) continue;
    const bajoRasante = g.nivel < 0;
    // Sin cota del alcantarillado, un sótano se supone por debajo (supuesto avisado).
    const bombeo = bajoRasante && (cotaAlc === null || g.cota_m < cotaAlc);
    const id = `garaje-${slugDe(etiquetaNivel(g.nivel))}`;
    elementos.push({
      id,
      nombre: "Red del garaje",
      tipo: "garaje",
      veredicto: "ok",
      valor: { texto: bombeo ? "Bombeo" : "Por gravedad" },
      manda:
        cotaAlc !== null || bombeo
          ? { tipo: "cota", cota_m: g.cota_m, referencia_m: cotaAlc ?? 0 }
          : { tipo: "decision_proyectista", decision: "gravedad" },
      cita: bombeo ? ["HS 5 · ap. 3.3.2.1 y 4.6", "ap. 3.3.1.5 pto 2 e"] : ["HS 5 · ap. 3.3.1.5 pto 2 e"],
      detalle: { clase: "garaje", garaje: g, bombeo, cotaAlcantarillado_m: cotaAlc, colectores: d.colectores },
    });
    if (bombeo) {
      avisos.push({
        id: `${id}-bombeo`,
        tipo: "caso_especial",
        elementoId: id,
        datos: { nivel: g.nivel, cota_m: g.cota_m, cotaAlcantarillado_m: cotaAlc },
      });
    }
  }

  // ── Colector(es) de residuales ────────────────────────────────────────────
  const colectores = (residuales?.porTramo ?? []).filter((t) => t.tipo === "colector");
  for (const c of modo === "manual" ? colectores : colectores.filter((t) => t.id === red.colectorId)) {
    const contrato = contratoTramo(c, residualesInputs.uso);
    const disp = residualesInputs.tramos.find((t) => t.id === c.id)?.disposicion ?? d.colectores;
    const minimo =
      disp === "colgado"
        ? COLECTORES_TABLA_4_5.datos.pendienteMinColgado_pct
        : COLECTORES_TABLA_4_5.datos.pendienteMinEnterrado_pct;
    elementos.push({
      id: c.id,
      nombre: nombreTramo(residualesInputs, c.id),
      tipo: "colector",
      ...contrato,
      veredicto: contrato.veredicto === "fail" || c.pendiente_pct < minimo ? "fail" : "ok",
      detalle: {
        clase: "colector",
        tramo: c,
        bajantes: c.childrenIds.filter((h) => porId.get(h)?.tipo === "bajante").length,
        disposicion: disp,
      },
    });
  }
  if (modo === "edificio" && d.colectores === "enterrado" && resumen.plantasBajoRasante > 0 && red.colectorId) {
    avisos.push({ id: "colector-bajo-sotano", tipo: "caso_especial", elementoId: red.colectorId, datos: {} });
  }

  // ── Bajantes ───────────────────────────────────────────────────────────────
  if (modo === "edificio") {
    for (const v of red.verticales) {
      for (const b of v.bajantes) {
        const t = b.id ? porId.get(b.id) : undefined;
        if (!t) continue;
        elementos.push({
          id: t.id,
          nombre: `Bajante ${v.nombre} · ${NOMBRE_BAJANTE[b.clase]}`,
          tipo: "bajante",
          ...contratoTramo(t, residualesInputs.uso),
          detalle: {
            clase: "bajante",
            tramo: t,
            vertical: v,
            bajante: b,
            aparatos: [...new Set(b.ramales.flatMap((r) => r.cuartos.flatMap((c) => c.aparatos.map((a) => a.tipo))))],
          },
        });
      }
    }
  } else {
    for (const t of residuales?.porTramo ?? []) {
      if (t.tipo !== "bajante") continue;
      elementos.push({
        id: t.id,
        nombre: nombreTramo(residualesInputs, t.id),
        tipo: "bajante",
        ...contratoTramo(t, residualesInputs.uso),
        detalle: {
          clase: "bajante",
          tramo: t,
          vertical: null,
          bajante: null,
          aparatos: [
            ...new Set(
              residualesInputs.aparatos
                .filter((a) => t.childrenIds.includes(a.tramoId) || a.tramoId === t.id)
                .map((a) => a.tipo),
            ),
          ],
        },
      });
    }
  }

  // ── El ramal más cargado (los demás se resuelven igual o con menos) ───────
  const ramales = (residuales?.porTramo ?? []).filter((t) => t.tipo === "ramal");
  const candidatos =
    modo === "edificio"
      ? red.verticales.flatMap((v) => v.bajantes.flatMap((b) => b.ramales.map((r) => r.id)))
      : ramales.map((r) => r.id);
  let mas: ResultadoTramo | null = null;
  for (const id of candidatos) {
    const t = porId.get(id);
    if (t && t.tipo === "ramal" && (mas === null || t.udAcumuladas > mas.udAcumuladas)) mas = t;
  }
  if (mas) {
    const ramal = red.verticales.flatMap((v) => v.bajantes.flatMap((b) => b.ramales)).find((r) => r.id === mas.id);
    elementos.push({
      id: mas.id,
      nombre: nombreTramo(residualesInputs, mas.id),
      tipo: "ramal",
      ...contratoTramo(mas, residualesInputs.uso),
      detalle: {
        clase: "ramal",
        tramo: mas,
        cuartos: ramal?.cuartos ?? [],
        nivel: ramal?.nivel ?? null,
        ramales: ramales.length,
      },
    });
  }

  // ── Pluviales ──────────────────────────────────────────────────────────────
  if (pluviales) {
    const p = pluviales;
    if (p.canalon) {
      elementos.push({
        id: "pluviales-canalones",
        nombre: "Canalones",
        tipo: "canalon",
        veredicto: p.canalon.cumple ? "ok" : "fail",
        valor: p.canalon.diametro_mm === null ? { texto: "sin Ø" } : { valor: p.canalon.diametro_mm, unidad: "mm" },
        manda: {
          tipo: "capacidad_tabla",
          tabla: "Tabla 4.7",
          recibe: { valor: p.canalon.corregida_m2, unidad: "m²" },
          admite: { valor: p.canalon.capacidad_m2 ?? 0, unidad: "m²" },
        },
        uso: p.canalon.capacidad_m2 ? p.canalon.corregida_m2 / p.canalon.capacidad_m2 : undefined,
        cita: ["HS 5 · ap. 4.2.2 · tabla 4.7", "apéndice B"],
        detalle: { clase: "canalones", p, intensidad },
      });
    }
    elementos.push({
      id: "pluviales-bajantes",
      nombre: "Bajantes de pluviales",
      tipo: "pluviales",
      veredicto: p.bajante.cumple ? "ok" : "fail",
      valor: p.bajante.diametro_mm === null ? { texto: "sin Ø" } : { valor: p.bajante.diametro_mm, unidad: "mm" },
      manda: {
        tipo: "capacidad_tabla",
        tabla: "Tabla 4.8",
        recibe: { valor: p.bajante.corregida_m2, unidad: "m²" },
        admite: { valor: p.bajante.capacidad_m2 ?? 0, unidad: "m²" },
      },
      alternativa: p.bajante.alternativa
        ? {
            valor: { valor: p.bajante.alternativa.diametro_mm, unidad: "mm" },
            capacidad:
              p.bajante.alternativa.capacidad_m2 === null
                ? null
                : { valor: p.bajante.alternativa.capacidad_m2, unidad: "m²" },
            porQueNo: "capacidad",
          }
        : undefined,
      uso: p.bajante.capacidad_m2 ? p.bajante.corregida_m2 / p.bajante.capacidad_m2 : undefined,
      cita: [
        p.sumideros !== null ? "HS 5 · ap. 4.2 · tablas 4.6 y 4.8" : "HS 5 · ap. 4.2 · tablas 4.7 y 4.8",
        "apéndice B",
      ],
      detalle: { clase: "pluviales_bajantes", p, intensidad },
    });
    const elevado =
      p.colector.diametro_mm !== null &&
      p.colector.diametroPorCapacidad_mm !== null &&
      p.colector.diametro_mm > p.colector.diametroPorCapacidad_mm;
    elementos.push({
      id: "pluviales-colector",
      nombre: "Colector de pluviales",
      tipo: "pluviales",
      veredicto: p.colector.cumple ? "ok" : "fail",
      valor: p.colector.diametro_mm === null ? { texto: "sin Ø" } : { valor: p.colector.diametro_mm, unidad: "mm" },
      manda: elevado
        ? { tipo: "no_menor_que_aguas_arriba", elementos: ["pluviales-bajantes"], diametro_mm: p.bajante.diametro_mm! }
        : {
            tipo: "capacidad_tabla",
            tabla: "Tabla 4.9",
            recibe: { valor: p.colector.corregida_m2, unidad: "m²" },
            admite: { valor: p.colector.capacidad_m2 ?? 0, unidad: "m²" },
          },
      alternativa: p.colector.alternativa
        ? {
            valor: { valor: p.colector.alternativa.diametro_mm, unidad: "mm" },
            capacidad:
              p.colector.alternativa.capacidad_m2 === null
                ? null
                : { valor: p.colector.alternativa.capacidad_m2, unidad: "m²" },
            porQueNo:
              p.colector.alternativa.capacidad_m2 === null ||
              p.colector.corregida_m2 > p.colector.alternativa.capacidad_m2
                ? "capacidad"
                : "minimo",
          }
        : undefined,
      uso: p.colector.capacidad_m2 ? p.colector.corregida_m2 / p.colector.capacidad_m2 : undefined,
      cita: ["HS 5 · ap. 4.2.4 · tabla 4.9", "f por criterio", "apéndice B"],
      detalle: { clase: "pluviales_colector", p, intensidad },
    });
    if (intensidad.supuesta) {
      avisos.push({ id: "pluviometria-supuesta", tipo: "supuesto", elementoId: "pluviales-bajantes", datos: {} });
    }
  }

  // ── Ventilación de las bajantes ───────────────────────────────────────────
  if (residuales) {
    const plantas = Math.max(1, Math.trunc(residualesInputs.numPlantas));
    const limite = VENT_PRIMARIA.datos.maxPlantasSolo;
    const basta = plantas < limite;
    const nBajantes = residuales.porTramo.filter((t) => t.tipo === "bajante").length;
    elementos.push({
      id: "ventilacion",
      nombre: "Ventilación de las bajantes",
      tipo: "ventilacion",
      veredicto: d.ventilacion === "primaria" && !basta ? "fail" : "ok",
      valor: { texto: d.ventilacion === "primaria" ? "Primaria" : "Secundaria" },
      manda:
        d.ventilacion === "secundaria" && basta
          ? { tipo: "decision_proyectista", decision: "secundaria" }
          : { tipo: "altura_edificio", plantas, limite },
      cita: ["HS 5 · ap. 3.3.3"],
      detalle: {
        clase: "ventilacion",
        plantas,
        ventilacion: d.ventilacion,
        bajantes: nBajantes,
        prolongacion_m: residuales.ventilacion.primaria.prolongacionMin_m,
        secundariaDiametro_mm: residuales.ventilacion.secundaria.diametroColumna_mm,
      },
    });
  }

  // ── Locales sin uso: previsión ────────────────────────────────────────────
  for (const l of red.locales) {
    elementos.push({
      id: `local-${slugDe(etiquetaNivel(l.nivel))}`,
      nombre: l.numero > 1 ? "Locales sin uso" : "Local sin uso",
      tipo: "prevision",
      veredicto: "previsto",
      valor: { valor: 110, unidad: "mm" },
      manda: { tipo: "decision_proyectista", decision: "prevision" },
      cita: ["Criterio de proyecto", "HS 5 · ap. 1.1"],
      detalle: { clase: "local", local: l },
    });
  }

  // ── Conexión al alcantarillado ────────────────────────────────────────────
  if (residuales || pluviales) {
    const colRes = red.colectorId ? (porId.get(red.colectorId)?.diametro_mm ?? null) : null;
    elementos.push({
      id: "conexion",
      nombre: "Conexión al alcantarillado",
      tipo: "conexion",
      veredicto: "ok",
      valor: { texto: d.alcantarillado === "unitario" ? "Una acometida" : "Dos acometidas" },
      manda: { tipo: "decision_proyectista", decision: d.alcantarillado },
      cita: [d.alcantarillado === "unitario" ? "HS 5 · ap. 3.2 pto 1" : "HS 5 · ap. 3.2 pto 2", "tabla 4.13"],
      detalle: {
        clase: "conexion",
        alcantarillado: d.alcantarillado,
        residuales_mm: modo === "edificio" ? colRes : (colectores[0]?.diametro_mm ?? null),
        pluviales_mm: pluviales?.colector.diametro_mm ?? null,
      },
    });
  }

  // ── Avisos de reparto y alcance ───────────────────────────────────────────
  if (modo === "edificio" && red.supuestos.unifamiliarReparto) {
    avisos.push({ id: "unifamiliar-reparto", tipo: "supuesto", datos: { reparto: red.repartoTexto } });
  }
  if (red.oficinasSinNucleos) {
    avisos.push({ id: "oficinas-sin-nucleos", tipo: "fuera_de_alcance", datos: {} });
  }
  for (const w of residuales?.warnings ?? []) {
    avisos.push({ id: `motor-${hashTexto(w)}`, tipo: "caso_especial", datos: { texto: w } });
  }
  for (const w of pluviales?.warnings ?? []) {
    avisos.push({ id: `pluviales-${hashTexto(w)}`, tipo: "caso_especial", elementoId: "pluviales-bajantes", datos: { texto: w } });
  }

  // ── Veredicto ──────────────────────────────────────────────────────────────
  let veredicto: Veredicto = elementos.length === 0 ? "neutral" : "ok";
  if (residuales && !residuales.arbolValido) veredicto = "fail";
  if (residuales?.veredictoGlobal === "fail") veredicto = "fail";
  if (elementos.some((e) => e.veredicto === "fail")) veredicto = "fail";

  return { modo, red, residualesInputs, residuales, pluviales, intensidad, elementos, avisos, veredicto };
}
