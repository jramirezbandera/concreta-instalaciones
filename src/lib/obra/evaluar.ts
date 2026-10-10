// =============================================================================
// La evaluación del expediente (feature-16 §A). PURA.
//
// El estado de cada justificación se CALCULA, no se guarda: con las mismas
// entradas que compone el módulo al abrirse (por defecto ← guardadas ←
// heredadas del expediente), su motor y El edificio. Así la barra lateral, La
// obra, la memoria y el anejo dicen lo mismo aunque se haya cambiado El
// edificio sin abrir el módulo. Los cinco motores juntos tardan unos 2 ms.
//
// Se memoriza por objeto de proyecto: el proyecto es inmutable y cada cambio
// es un objeto nuevo, así que un `WeakMap` basta para no repetir el cálculo
// entre la barra lateral y la pantalla.
// =============================================================================

import { justificacionRegistry, type JustificacionEntry } from "../../data/justificacionRegistry";
import { avisosPendientes, veredictoConRevision } from "../cte/estados";
import { proyectoParaModulo } from "../proyecto/alcance";
import { aplicabilidadEfectiva } from "../proyecto/aplicabilidad";
import { contextoDe } from "../proyecto/derivar";
import { heredadosDe, mergeInputsHeredados } from "../proyecto/herencia";
import type { Aplicabilidad, JustificacionKey, Proyecto, Veredicto } from "../proyecto/tipos";
import { MODULOS_OBRA, type ModuloCalculado, type TextoObra } from "./modulos";
import { avisosVerificacion, CLAVES_ENERGIA, resultadosDe } from "../energia/verificacion";

/**
 * Cómo va una justificación en La obra:
 *   - `cumple` · `revisar` (cumple, con avisos sin revisar) · `no_cumple`;
 *   - `sin_datos`: publicada, pero nada de El edificio entra en ella;
 *   - `error`: el motor no calcula con lo guardado;
 *   - `no_aplica` · `externo` · `pronto` (la herramienta aún no la justifica).
 */
export type EstadoObra =
  | "cumple"
  | "revisar"
  | "no_cumple"
  | "sin_datos"
  | "error"
  | "no_aplica"
  | "externo"
  | "pronto";

/** Un aviso sin revisar o algo que no cumple, ya redactado. */
export interface PendienteObra extends TextoObra {
  id: string;
  /** Elemento del dibujo al que se refiere. */
  elementoId?: string;
}

export interface EvaluacionJustificacion {
  key: JustificacionKey;
  entrada: JustificacionEntry;
  aplicabilidad: Aplicabilidad;
  /** La aplicabilidad la forzó el proyectista. */
  forzada: boolean;
  /** Párrafo redactado del «no aplica» (o la nota del forzado). */
  nota?: string;
  cita?: string;
  estado: EstadoObra;
  /** Veredicto con la revisión aplicada: «warn» si cumple con avisos sin revisar. */
  veredicto?: Veredicto;
  /** El módulo calculado (solo los publicados que aplican y calculan). */
  calculado?: ModuloCalculado;
  /** Avisos sin revisar. */
  avisos: PendienteObra[];
  /** Lo que no cumple. */
  incumplimientos: PendienteObra[];
}

export interface EvaluacionExpediente {
  /** En el orden del registry, sin las entradas de desarrollo. */
  justificaciones: EvaluacionJustificacion[];
  porClave: Partial<Record<JustificacionKey, EvaluacionJustificacion>>;
}

/**
 * Las entradas con que se calcula un módulo: las del módulo al abrirse, sin la
 * URL (por defecto ← guardadas ← heredadas, salvo las excepciones locales).
 */
export function estadoEfectivo(p: Proyecto, key: JustificacionKey): Record<string, unknown> | null {
  const modulo = MODULOS_OBRA[key];
  if (!modulo) return null;
  const j = p.justificaciones[key];
  const { state } = mergeInputsHeredados({
    defaults: modulo.defaults,
    guardados: j?.inputs,
    heredados: heredadosDe(key, p.datosGenerales, contextoDe(p.datosGenerales, p.edificio)),
    overrides: j?.overridesContexto ?? [],
    urlOverrides: {},
  });
  return state;
}

const ERROR_CALCULO: PendienteObra = {
  id: "calculo",
  titulo: "No se puede calcular con lo que hay.",
  detalle: "Ábrela para ver qué falta: la red ajustada a mano tiene tramos sin conectar o datos incompletos.",
};

/** Un «no cumple» que el módulo no explica con un texto propio. */
const NO_CUMPLE: PendienteObra = {
  id: "no-cumple",
  titulo: "Hay comprobaciones que no cumplen.",
  detalle: "Ábrela para verlas en el dibujo y en la lista de comprobaciones.",
};

function evaluarPublicada(
  p: Proyecto,
  key: JustificacionKey,
): Pick<EvaluacionJustificacion, "estado" | "veredicto" | "calculado" | "avisos" | "incumplimientos"> {
  const modulo = MODULOS_OBRA[key]!;
  const revisados = p.justificaciones[key]?.revisados ?? [];
  let calculado: ModuloCalculado;
  try {
    // En una obra existente, cada módulo calcula lo intervenido (feature-27).
    calculado = modulo.calcular(estadoEfectivo(p, key)!, proyectoParaModulo(p, key), revisados);
  } catch {
    return { estado: "error", avisos: [], incumplimientos: [ERROR_CALCULO] };
  }
  if (calculado.elementos.length === 0) {
    return { estado: "sin_datos", calculado, avisos: [], incumplimientos: [] };
  }

  const avisos = avisosPendientes(calculado.avisos, revisados).map((a): PendienteObra => ({
    id: a.id,
    ...calculado.textoAviso(a),
    ...(a.elementoId ? { elementoId: a.elementoId } : {}),
  }));
  const incumplimientos = calculado.elementos
    .filter((el) => el.veredicto === "fail")
    .flatMap((el): PendienteObra[] => {
      const t = calculado.textoIncumplimiento(el);
      return t ? [{ id: el.id, ...t, elementoId: el.id }] : [];
    });
  // Un «no cumple» sin texto que lo explique (la red manual no válida, o un
  // elemento que el módulo no enseña como incumplimiento).
  if (calculado.veredicto === "fail" && incumplimientos.length === 0) incumplimientos.push(NO_CUMPLE);

  const veredicto = veredictoConRevision(calculado.veredicto, avisos.length);
  const estado: EstadoObra = veredicto === "fail" ? "no_cumple" : veredicto === "warn" ? "revisar" : "cumple";
  return { estado, veredicto, calculado, avisos, incumplimientos };
}

function evaluarJustificacion(p: Proyecto, entrada: JustificacionEntry): EvaluacionJustificacion {
  const key = entrada.key as JustificacionKey;
  const ap = aplicabilidadEfectiva(p, key);
  const base: EvaluacionJustificacion = {
    key,
    entrada,
    aplicabilidad: ap.aplicabilidad,
    forzada: ap.forzada,
    ...(ap.nota !== undefined ? { nota: ap.nota } : {}),
    ...(ap.cita !== undefined ? { cita: ap.cita } : {}),
    estado: "pronto",
    avisos: [],
    incumplimientos: [],
  };
  if (ap.aplicabilidad === "no_aplica") return { ...base, estado: "no_aplica" };
  if (ap.aplicabilidad === "externo") return { ...base, ...verificacionLeida(p, key), estado: "externo" };
  if (!entrada.shipped || !MODULOS_OBRA[key]) return base;
  return { ...base, ...evaluarPublicada(p, key) };
}

/**
 * Una externa de energía con el informe del programa leído: su veredicto y,
 * en la verificación global (que no tiene módulo al que ir), lo que no cumple
 * y lo que hay que mirar, para «Antes de entregar».
 */
function verificacionLeida(
  p: Proyecto,
  key: JustificacionKey,
): Pick<EvaluacionJustificacion, "veredicto" | "avisos" | "incumplimientos"> | Record<string, never> {
  const v = p.justificaciones.he0he1_global?.verificacion;
  if (!v || !CLAVES_ENERGIA.includes(key)) return {};
  const resultados = resultadosDe(v, key);
  const fallan = resultados.filter((r) => !r.cumple);
  const revisados = p.justificaciones.he0he1_global?.revisados ?? [];
  const avisos = avisosVerificacion(v, contextoDe(p.datosGenerales, p.edificio).zonaClimatica.valor).filter((a) => !revisados.includes(a.id));
  const global = key === "he0he1_global";
  return {
    veredicto: fallan.length > 0 ? "fail" : avisos.length > 0 ? "warn" : "ok",
    incumplimientos: global
      ? resultadosDe(v, "he0he1_global")
          .concat(resultadosDe(v, "he1"))
          .filter((r) => !r.cumple)
          .map((r) => ({ id: `energia-${r.exigencia}`, titulo: `${r.exigencia}: no cumple`, detalle: `${r.proyecto} (límite ${r.limite}), según el informe de ${v.programa}.` }))
      : [],
    avisos: global ? avisos : [],
  };
}

const memo = new WeakMap<Proyecto, EvaluacionExpediente>();

/** Todas las justificaciones del expediente, calculadas. Memorizada por proyecto. */
export function evaluarExpediente(p: Proyecto): EvaluacionExpediente {
  const hecho = memo.get(p);
  if (hecho) return hecho;
  const justificaciones = justificacionRegistry.filter((e) => !e.dev).map((e) => evaluarJustificacion(p, e));
  const porClave: EvaluacionExpediente["porClave"] = {};
  for (const j of justificaciones) porClave[j.key] = j;
  const ev = { justificaciones, porClave };
  memo.set(p, ev);
  return ev;
}
