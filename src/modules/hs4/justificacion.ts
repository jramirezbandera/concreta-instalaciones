// =============================================================================
// DB-HS4 — La justificación entera (feature-15, HS4): la red de agua fría
// deducida de El edificio, dimensionada por `calcHS4`, con el contrato de
// resultado de REDISENO-V4 §3.2.
//
// PURA y DETERMINISTA. No redacta: devuelve elementos y avisos en datos; la
// prosa la ponen `textos.ts` y `memoria.ts`.
//
// Dos modos (`Hs4Estado.red`):
//   - «edificio»: la red sale de El edificio y de las decisiones;
//   - «manual»: manda la tabla de tramos del estado («Ajustar a mano»).
// La presión de partida es la de la red (dato de la obra) o, si se ha añadido
// un grupo de presión, la de su salida.
// =============================================================================

import type { Aviso, ElementoResultado } from "../../lib/cte/resultado";
import { etiquetaNivel } from "../../lib/edificio/derivar";
import type { Edificio } from "../../lib/edificio/tipos";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import {
  calcHS4,
  type HS4Inputs,
  type HS4Result,
  type ResultadoAparatoHS4,
  type ResultadoTramoHS4,
} from "./calc";
import type { Hs4Estado } from "./estado";
import { generarRedHs4, type LocalHs4, type RedHs4, type UnidadHs4 } from "./red";
import { ALIMENTACION_TABLA_4_3, PRESIONES, rangoVelocidad } from "./tablas";

/** Datos de la obra que usa HS4 (opcional: sin la presión se supone y se avisa). */
export interface ObraHs4 {
  /** Presión de la red en la acometida [kPa] (dato de la compañía). */
  presionAcometida_kPa?: number;
}

/** Presión de la red con la que se calcula si no consta en los datos de la obra. */
export const PRESION_RED_SIN_DATO_kPa = 250;

/** Un punto de consumo con su sitio en el edificio. */
export interface PuntoHs4 {
  aparato: ResultadoAparatoHS4;
  /** «A3 · Baño 1», o el nombre que tenga en la tabla. */
  nombre: string;
  unidad: UnidadHs4 | null;
  nivel: number | null;
  cuarto: string | null;
}

export type DetalleHs4 =
  | { clase: "red"; presion_kPa: number; sinDato: boolean; necesaria_kPa: number | null; grupo: boolean }
  | {
      clase: "planta";
      nivel: number | null;
      punto: PuntoHs4;
      critico: boolean;
      partida_kPa: number;
      red_kPa: number;
      grupo: boolean;
      necesaria_kPa: number | null;
    }
  | { clase: "maxima"; punto: PuntoHs4; maxima_kPa: number; partida_kPa: number; grupo: boolean }
  | {
      clase: "grupo";
      necesario: boolean;
      puesto: boolean;
      presionGrupo_kPa: number;
      red_kPa: number;
      necesaria_kPa: number | null;
      critico: PuntoHs4 | null;
      /** Lo que le llegaría al punto crítico solo con la red. */
      conRed_kPa: number | null;
    }
  | { clase: "montante"; unidad: UnidadHs4 | null; tramo: ResultadoTramoHS4; iguales: number; general: boolean }
  | { clase: "caudal"; unidad: UnidadHs4; tramo: ResultadoTramoHS4; iguales: number }
  | {
      clase: "acometida";
      acometida: ResultadoTramoHS4;
      alimentacion: ResultadoTramoHS4 | null;
      contadores: RedHs4["contadores"] | null;
    }
  | { clase: "local"; local: LocalHs4; diametro_mm: number };

export interface ElementoHs4 extends ElementoResultado {
  /** «Presión en P3», «Montante · A». */
  nombre: string;
  detalle: DetalleHs4;
}

export interface JustificacionHs4 {
  modo: Hs4Estado["red"];
  red: RedHs4;
  /** La red que se ha dimensionado (la del edificio o la manual), con la presión de partida. */
  inputs: HS4Inputs;
  /** `null` si no hay red (un edificio sin puntos de consumo). */
  resultado: HS4Result | null;
  /** Presión de la red [kPa] y si es supuesta por no constar. */
  presionRed_kPa: number;
  presionSinDato: boolean;
  /** Presión con la que arranca la red: la de la red o la salida del grupo. */
  partida_kPa: number;
  /** Puntos de consumo por id. */
  puntos: Map<string, PuntoHs4>;
  elementos: ElementoHs4[];
  avisos: Aviso[];
  veredicto: Veredicto;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function slugDe(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Id del elemento del montante de una unidad: uno por tipo («montante-a», «montante-oficinas»). */
export function idMontanteDe(u: Pick<UnidadHs4, "clase" | "nombreTipo">): string {
  return `montante-${slugDe(u.clase === "oficinas" ? "oficinas" : u.nombreTipo)}`;
}

/** Hash corto y estable de un texto (ids de los avisos del motor). */
function hashTexto(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** El de menor margen sobre su mínima (empates: el primero). */
function peorMargen(ps: PuntoHs4[]): PuntoHs4 | null {
  let peor: PuntoHs4 | null = null;
  for (const p of ps) {
    const m = p.aparato.presionResidual_kPa - p.aparato.presionMinExigida_kPa;
    if (!peor || m < peor.aparato.presionResidual_kPa - peor.aparato.presionMinExigida_kPa) peor = p;
  }
  return peor;
}

/** Avisos del motor que ya dicen los elementos (no se repiten como aviso). */
const AVISOS_CUBIERTOS = [
  "Coeficiente de simultaneidad",
  "Velocidad ",
  "Punto de consumo ",
  "Grupo de presión NECESARIO",
];

const PERDIDAS_DE = (a: ResultadoAparatoHS4) =>
  a.perdidas.altura_kPa + a.perdidas.rozamiento_kPa + a.perdidas.localizadas_kPa;

// -----------------------------------------------------------------------------
// Justificación
// -----------------------------------------------------------------------------

export function justificarHs4(estado: Hs4Estado, edificio: Edificio, obra: ObraHs4 = {}): JustificacionHs4 {
  const red = generarRedHs4(edificio, estado);
  const d = red.decisiones;
  const modo = estado.red;

  const presionDato = obra.presionAcometida_kPa;
  const presionSinDato = !(Number.isFinite(presionDato) && (presionDato as number) > 0);
  const presionRed_kPa = presionSinDato ? PRESION_RED_SIN_DATO_kPa : (presionDato as number);
  const partida_kPa = d.grupoPresion ? d.presionGrupo_kPa : presionRed_kPa;

  const inputs: HS4Inputs = {
    tramos: modo === "manual" ? estado.tramos : red.tramos,
    aparatos: modo === "manual" ? estado.aparatos : red.aparatos,
    presionAcometida_kPa: partida_kPa,
    criterioK: estado.criterioK,
    ...(estado.fraccionPerdidasLocalizadas !== undefined
      ? { fraccionPerdidasLocalizadas: estado.fraccionPerdidasLocalizadas }
      : {}),
  };
  const resultado = inputs.tramos.length > 0 && inputs.aparatos.length > 0 ? calcHS4(inputs) : null;
  const porTramo = new Map((resultado?.porTramo ?? []).map((t) => [t.id, t] as const));
  const unidadPorId = new Map(red.unidades.map((u) => [u.id, u] as const));
  const nombreAparato = new Map(inputs.aparatos.map((a) => [a.id, a.nombre ?? a.id] as const));

  // Puntos de consumo con su sitio (a mano, sin planta).
  const puntos = new Map<string, PuntoHs4>();
  for (const a of resultado?.porAparato ?? []) {
    const sitio = modo === "edificio" ? red.puntos[a.id] : undefined;
    puntos.set(a.id, {
      aparato: a,
      nombre: nombreAparato.get(a.id) ?? a.id,
      unidad: sitio ? (unidadPorId.get(sitio.unidadId) ?? null) : null,
      nivel: sitio ? sitio.nivel : null,
      cuarto: sitio ? sitio.cuarto : null,
    });
  }
  const todos = [...puntos.values()];
  const critico = peorMargen(todos);
  const necesaria_kPa = resultado?.presionNecesaria_kPa ?? null;
  // ¿Basta la red sola? Las pérdidas no dependen de la presión de partida.
  const necesitaGrupo = necesaria_kPa !== null && necesaria_kPa > presionRed_kPa;

  const elementos: ElementoHs4[] = [];
  const avisos: Aviso[] = [];
  const pMax = PRESIONES.datos.presionMaxConsumo_kPa;

  // ── Presión de la red (dato de partida) ───────────────────────────────────
  if (resultado) {
    elementos.push({
      id: "presion-red",
      nombre: "Presión de la red",
      tipo: "dato",
      veredicto: "dato",
      valor: { valor: presionRed_kPa, unidad: "kPa" },
      manda: { tipo: "dato_de_partida", fuente: presionSinDato ? "supuesta" : "compañía suministradora" },
      cita: ["HS 4 · ap. 4.2.2 pto 1 b)"],
      detalle: { clase: "red", presion_kPa: presionRed_kPa, sinDato: presionSinDato, necesaria_kPa, grupo: d.grupoPresion },
    });
    avisos.push(
      presionSinDato
        ? { id: "presion-red-sin-dato", tipo: "supuesto", elementoId: "presion-red", datos: { presion_kPa: presionRed_kPa } }
        : {
            id: "presion-red-supuesta",
            tipo: "supuesto",
            elementoId: "presion-red",
            datos: { presion_kPa: presionRed_kPa, necesaria_kPa },
          },
    );
  }

  // ── Presión por planta (o el punto crítico, a mano) ───────────────────────
  const plantaEl = (nivel: number | null, p: PuntoHs4, esCritico: boolean): ElementoHs4 => {
    const a = p.aparato;
    return {
      id: nivel === null ? "punto-critico" : `presion-${slugDe(etiquetaNivel(nivel))}`,
      nombre: nivel === null ? "Grifo más desfavorable" : `Presión en ${etiquetaNivel(nivel)}`,
      tipo: "presion",
      veredicto: a.presionResidual_kPa < a.presionMinExigida_kPa ? "fail" : "ok",
      valor: { valor: a.presionResidual_kPa, unidad: "kPa" },
      limite: { valor: a.presionMinExigida_kPa, unidad: "kPa" },
      manda: { tipo: "presion_por_altura", partida_kPa, altura_m: a.altura_m, perdidas_kPa: PERDIDAS_DE(a) },
      cita: ["HS 4 · ap. 2.1.3 pto 2", "ap. 4.2.2"],
      detalle: {
        clase: "planta",
        nivel,
        punto: p,
        critico: esCritico,
        partida_kPa,
        red_kPa: presionRed_kPa,
        grupo: d.grupoPresion,
        necesaria_kPa,
      },
    };
  };
  if (modo === "edificio") {
    for (const nivel of [...red.niveles].reverse()) {
      const p = peorMargen(todos.filter((x) => x.nivel === nivel));
      if (p) elementos.push(plantaEl(nivel, p, p === critico));
    }
  } else if (critico) {
    elementos.push(plantaEl(null, critico, true));
  }

  // ── Presión máxima ─────────────────────────────────────────────────────────
  let maximo: PuntoHs4 | null = null;
  for (const p of todos) if (!maximo || p.aparato.presionResidual_kPa > maximo.aparato.presionResidual_kPa) maximo = p;
  if (maximo) {
    elementos.push({
      id: "presion-maxima",
      nombre: "Presión máxima",
      tipo: "presion",
      veredicto: maximo.aparato.presionResidual_kPa > pMax ? "fail" : "ok",
      valor: { valor: maximo.aparato.presionResidual_kPa, unidad: "kPa" },
      limite: { valor: pMax, unidad: "kPa" },
      manda: {
        tipo: "presion_por_altura",
        partida_kPa,
        altura_m: maximo.aparato.altura_m,
        perdidas_kPa: PERDIDAS_DE(maximo.aparato),
      },
      cita: ["HS 4 · ap. 2.1.3 pto 3", "ap. 3.2.1.5.2"],
      detalle: { clase: "maxima", punto: maximo, maxima_kPa: pMax, partida_kPa, grupo: d.grupoPresion },
    });
  }

  // ── Grupo de presión ───────────────────────────────────────────────────────
  if (resultado && critico) {
    const conRed = critico.aparato.presionResidual_kPa - (partida_kPa - presionRed_kPa);
    const falta = critico.aparato.presionResidual_kPa < critico.aparato.presionMinExigida_kPa;
    elementos.push({
      id: "grupo-presion",
      nombre: "Grupo de presión",
      tipo: "grupo",
      veredicto: falta ? "fail" : "ok",
      valor: { texto: d.grupoPresion ? "Sí" : "No" },
      manda: d.grupoPresion
        ? { tipo: "decision_proyectista", decision: "grupo" }
        : {
            tipo: "presion_por_altura",
            partida_kPa: presionRed_kPa,
            altura_m: critico.aparato.altura_m,
            perdidas_kPa: PERDIDAS_DE(critico.aparato),
          },
      cita: ["HS 4 · ap. 4.2.2 pto 1 b)", "ap. 3.2.1.5.1"],
      detalle: {
        clase: "grupo",
        necesario: necesitaGrupo,
        puesto: d.grupoPresion,
        presionGrupo_kPa: d.presionGrupo_kPa,
        red_kPa: presionRed_kPa,
        necesaria_kPa,
        critico,
        conRed_kPa: conRed,
      },
    });
  }

  // ── Montantes ──────────────────────────────────────────────────────────────
  if (modo === "edificio" && resultado) {
    const general = red.decisiones.contadores === "por_planta" && !red.unifamiliar && red.unidades.length > 1;
    const criterioVel = (t: ResultadoTramoHS4) => {
      const rango = rangoVelocidad(t.material);
      return {
        veredicto: "criterio" as const,
        valor: t.diametro_mm === null ? { texto: "sin Ø" } : { valor: t.diametro_mm, unidad: "mm" },
        manda: {
          tipo: "velocidad" as const,
          velocidad_m_s: t.velocidad_m_s ?? 0,
          min_m_s: rango.min_m_s,
          max_m_s: rango.max_m_s,
        },
        cita: ["HS 4 · ap. 4.2.1 pto 2 d)", "tabla 4.3"],
      };
    };
    if (general) {
      const primero = resultado.porTramo.find((t) => t.tipo === "columna_montante" && t.parentId === "alimentacion");
      if (primero) {
        elementos.push({
          id: "montante-general",
          nombre: "Montante general",
          tipo: "montante",
          ...criterioVel(primero),
          detalle: { clase: "montante", unidad: null, tramo: primero, iguales: 1, general: true },
        });
      }
    } else if (!red.unifamiliar) {
      // Uno por tipo: el de la unidad más alta, que es el más largo.
      const porTipo = new Map<string, UnidadHs4[]>();
      for (const u of red.unidades) porTipo.set(u.tipoId + u.clase, [...(porTipo.get(u.tipoId + u.clase) ?? []), u]);
      for (const us of porTipo.values()) {
        const alta = us.reduce((a, b) => (b.nivel > a.nivel ? b : a));
        const t = alta.montanteId ? porTramo.get(alta.montanteId) : undefined;
        if (!t) continue;
        elementos.push({
          id: idMontanteDe(alta),
          nombre: alta.clase === "oficinas" ? "Montantes · oficinas" : `Montante · ${alta.nombreTipo}`,
          tipo: "montante",
          ...criterioVel(t),
          detalle: { clase: "montante", unidad: alta, tramo: t, iguales: us.length, general: false },
        });
      }
    }

    // ── Caudal de cada tipo de unidad ───────────────────────────────────────
    const vistos = new Set<string>();
    for (const u of red.unidades) {
      const clave = u.clase === "oficinas" ? "oficinas" : u.tipoId;
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      const t = porTramo.get(u.derivacionId);
      if (!t) continue;
      const iguales = red.unidades.filter((x) => (x.clase === "oficinas" ? "oficinas" : x.tipoId) === clave).length;
      elementos.push({
        id: `caudal-${slugDe(clave)}`,
        nombre: u.clase === "oficinas" ? "Caudal · oficinas" : red.unifamiliar ? "Caudal de la vivienda" : `Caudal · ${u.nombreTipo}`,
        tipo: "caudal",
        veredicto: "criterio",
        valor: { valor: t.caudalCalculo_dm3_s, unidad: "dm³/s" },
        manda: {
          tipo: "simultaneidad",
          instalado: { valor: t.caudalAcumulado_dm3_s, unidad: "dm³/s" },
          k: t.k,
          aparatos: t.numAparatos,
        },
        cita: ["HS 4 · tabla 2.1", "ap. 4.2.1 pto 2 b)", "K: método tradicional"],
        detalle: { clase: "caudal", unidad: u, tramo: t, iguales },
      });
    }
  }

  // ── Acometida ──────────────────────────────────────────────────────────────
  const raiz = resultado?.porTramo.find((t) => t.parentId === null) ?? null;
  if (raiz) {
    const alimentacion = resultado!.porTramo.find((t) => t.parentId === raiz.id && t.tipo === "tubo_alimentacion") ?? null;
    elementos.push({
      id: "acometida",
      nombre: "Acometida",
      tipo: "acometida",
      veredicto: "criterio",
      valor: raiz.diametro_mm === null ? { texto: "sin Ø" } : { valor: raiz.diametro_mm, unidad: "mm" },
      manda: {
        tipo: "simultaneidad",
        instalado: { valor: raiz.caudalAcumulado_dm3_s, unidad: "dm³/s" },
        k: raiz.k,
        aparatos: raiz.numAparatos,
      },
      cita: ["HS 4 · ap. 4.2 y tabla 4.3", "K: método tradicional"],
      detalle: {
        clase: "acometida",
        acometida: raiz,
        alimentacion,
        contadores: modo === "edificio" ? red.contadores : null,
      },
    });
  }

  // ── Locales sin uso: previsión ────────────────────────────────────────────
  const diametroEspera = ALIMENTACION_TABLA_4_3.datos.tramos.derivacion_particular.diametro_mm;
  for (const l of red.locales) {
    elementos.push({
      id: l.id,
      nombre: l.numero > 1 ? "Locales sin uso" : "Local sin uso",
      tipo: "prevision",
      veredicto: "previsto",
      valor: { valor: diametroEspera, unidad: "mm" },
      manda: { tipo: "decision_proyectista", decision: "prevision" },
      cita: ["Criterio de proyecto", "HS 4 · ap. 2.3 pto 1, tabla 4.3 y ap. 7.1"],
      detalle: { clase: "local", local: l, diametro_mm: diametroEspera },
    });
  }

  // ── Avisos de alcance y reparto ───────────────────────────────────────────
  if (d.aguaCaliente === "central") {
    avisos.push({ id: "acs-central", tipo: "fuera_de_alcance", datos: {} });
  }
  if (modo === "edificio" && red.supuestos.unifamiliarPorPlantas) {
    avisos.push({ id: "unifamiliar-reparto", tipo: "supuesto", datos: {} });
  }
  if (red.oficinasSinNucleos) {
    avisos.push({ id: "oficinas-sin-nucleos", tipo: "fuera_de_alcance", datos: {} });
  }
  for (const w of resultado?.warnings ?? []) {
    if (AVISOS_CUBIERTOS.some((p) => w.startsWith(p))) continue;
    avisos.push({ id: `motor-${hashTexto(w)}`, tipo: "caso_especial", datos: { texto: w } });
  }

  // ── Veredicto ──────────────────────────────────────────────────────────────
  let veredicto: Veredicto = elementos.length === 0 ? "neutral" : "ok";
  if (resultado && !resultado.arbolValido) veredicto = "fail";
  if (elementos.some((e) => e.veredicto === "fail")) veredicto = "fail";

  return {
    modo,
    red,
    inputs,
    resultado,
    presionRed_kPa,
    presionSinDato,
    partida_kPa,
    puntos,
    elementos,
    avisos,
    veredicto,
  };
}
