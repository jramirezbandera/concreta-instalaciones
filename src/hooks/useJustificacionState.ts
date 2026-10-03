// =============================================================================
// useJustificacionState — feature-6 T3.2: sucesor del hook legacy por módulo
// (eliminado en T6.2) para módulos que viven DENTRO de un expediente. El estado
// inicial ya no es URL > localStorage > defaults, sino la composición pura de
// `mergeInputsHeredados` (defaults ← guardados en el proyecto ← heredados del
// expediente, salvo excepción local ← URL). La persistencia va al proyecto
// activo vía `useProyecto()` (no a una clave localStorage por módulo).
// =============================================================================

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { parseUrlParams, toUrlParams } from "./urlState";
import {
  MAPA_HERENCIA,
  heredadosDe,
  mergeInputsHeredados,
} from "../lib/proyecto/herencia";
import { useProyecto } from "../lib/proyecto/ProyectoContext";
import type { HerenciaBinding } from "../components/justificacion/ModuleShell";
import type { JustificacionKey } from "../lib/proyecto/tipos";

interface UseJustificacionStateReturn<T> {
  state: T;
  setField: <K extends keyof T>(field: K, value: T[K]) => void;
  reset: () => void;
  /** Binding para el panel de herencia del shell. `campos: []` si el módulo no hereda nada. */
  herencia: HerenciaBinding;
}

/** Igualdad de listas de overrides sin importar el orden (son conjuntos de campos). */
function mismosOverrides(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((campo) => b.includes(campo));
}

export function useJustificacionState<T extends Record<string, unknown>>(
  key: JustificacionKey,
  defaults: T,
): UseJustificacionStateReturn<T> {
  const { proyecto, derivados, actualizarInputs, setOverridesContexto } = useProyecto();
  const [searchParams, setSearchParams] = useSearchParams();
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------------------------------------------------------------------------
  // Init UNA VEZ: el initializer de useState
  // solo corre en el primer render — cambios posteriores de searchParams o del
  // proyecto NO re-componen el estado (el módulo abierto es dueño de su estado).
  // ---------------------------------------------------------------------------
  const [init] = useState(() => {
    const justificacion = proyecto.justificaciones[key];
    const guardados = justificacion?.inputs as Partial<T> | undefined;
    const overridesGuardados = justificacion?.overridesContexto ?? [];
    const heredados = heredadosDe(key, proyecto.datosGenerales, derivados) as Partial<T>;
    const urlOverrides = parseUrlParams(searchParams, defaults);
    const { state, overridesEfectivos } = mergeInputsHeredados({
      defaults,
      guardados,
      heredados,
      overrides: overridesGuardados,
      urlOverrides,
    });
    return { state, overridesEfectivos, overridesGuardados };
  });

  const [state, setState] = useState<T>(init.state);
  // Overrides de contexto en estado local, sincronizados al proyecto vía
  // setOverridesContexto en cada mutación (toggleOverride / reset / efecto de montaje).
  const [overrides, setOverrides] = useState<string[]>(init.overridesEfectivos);

  // Efecto de montaje: si la URL promovió campos a excepción local (URL ≠ heredado),
  // los overrides efectivos difieren de los guardados → persistirlos para que la
  // ficha declare la excepción aunque el usuario no toque nada más.
  const overridesSincronizadosRef = useRef(false);
  useEffect(() => {
    if (overridesSincronizadosRef.current) return;
    overridesSincronizadosRef.current = true;
    if (!mismosOverrides(init.overridesEfectivos, init.overridesGuardados)) {
      setOverridesContexto(key, init.overridesEfectivos);
    }
  }, [init, key, setOverridesContexto]);

  // ---------------------------------------------------------------------------
  // Persistencia con debounce (300 ms):
  // URL compartible + inputs en el proyecto activo. La UI SÍ puede llamar a
  // Date (el instante de modificación es un hecho de la interacción, no del
  // cálculo); el motor sigue siendo puro y recibe el ISO ya construido.
  // ---------------------------------------------------------------------------
  const schedulePersist = useCallback(
    (nextState: T) => {
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
      writeTimerRef.current = setTimeout(() => {
        setSearchParams(toUrlParams(nextState), { replace: true });
        actualizarInputs(key, nextState, new Date().toISOString());
      }, 300);
    },
    [key, setSearchParams, actualizarInputs],
  );

  const setField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setState((prev) => {
        const next = { ...prev, [field]: value };
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist],
  );

  // reset(): defaults + heredados del expediente (guardados=undefined, overrides=[],
  // sin URL). Decisión documentada: el reset SE PERSISTE en el proyecto
  // (actualizarInputs con el estado reseteado + overrides vacíos) en vez de borrar
  // la clave — lo que el usuario ve tras resetear es lo que queda guardado, y las
  // excepciones locales desaparecen también de la ficha. (El progreso del módulo
  // pasa a "en_curso" sobre defaults+heredados, no a "sin_iniciar": revertir un
  // módulo a "sin tocar" se hace desde el dashboard del expediente, no desde aquí.)
  const reset = useCallback(() => {
    if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    const heredados = heredadosDe(key, proyecto.datosGenerales, derivados) as Partial<T>;
    const { state: stateReset } = mergeInputsHeredados({
      defaults,
      guardados: undefined,
      heredados,
      overrides: [],
      urlOverrides: {},
    });
    setState(stateReset);
    setOverrides([]);
    setSearchParams({}, { replace: true });
    actualizarInputs(key, stateReset, new Date().toISOString());
    setOverridesContexto(key, []);
  }, [
    key,
    defaults,
    proyecto.datosGenerales,
    derivados,
    setSearchParams,
    actualizarInputs,
    setOverridesContexto,
  ]);

  useEffect(() => {
    return () => {
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // herencia — binding declarativo para el panel del shell, construido desde
  // MAPA_HERENCIA[key]. Los campos cuya fuente devuelve `undefined` (dato del
  // expediente sin informar, p.ej. presión de acometida) NO aparecen: no hay
  // valor de proyecto que mostrar ni del que declararse excepción.
  // ---------------------------------------------------------------------------
  const descriptores = MAPA_HERENCIA[key] ?? [];

  const toggleOverride = useCallback(
    (campo: string, activo: boolean) => {
      if (activo) {
        // Declarar excepción local: el campo deja de seguir al proyecto pero
        // conserva su valor actual (el usuario lo editará después vía setCampo).
        if (overrides.includes(campo)) return;
        const next = [...overrides, campo];
        setOverrides(next);
        setOverridesContexto(key, next);
      } else {
        // Retirar la excepción: re-adopta el valor del proyecto.
        const next = overrides.filter((c) => c !== campo);
        setOverrides(next);
        setOverridesContexto(key, next);
        const descriptor = (MAPA_HERENCIA[key] ?? []).find((c) => c.campo === campo);
        const valorProyecto = descriptor?.fuente(proyecto.datosGenerales, derivados);
        // `campo` viene de MAPA_HERENCIA, cuyos nombres son inputs reales del
        // motor (verificados en herencia.ts) → el cast a keyof T es seguro.
        if (valorProyecto !== undefined) {
          setField(campo as keyof T, valorProyecto as T[keyof T]);
        }
      }
    },
    [key, overrides, proyecto.datosGenerales, derivados, setField, setOverridesContexto],
  );

  const setCampo = useCallback(
    (campo: string, valor: unknown) => {
      // Solo editable con excepción local declarada; sin override el campo es de
      // solo lectura (sigue al proyecto) → no-op deliberado, no un error.
      if (!overrides.includes(campo)) return;
      setField(campo as keyof T, valor as T[keyof T]);
    },
    [overrides, setField],
  );

  const herencia: HerenciaBinding = {
    campos: descriptores
      .map((c) => ({ c, valorProyecto: c.fuente(proyecto.datosGenerales, derivados) }))
      .filter(({ valorProyecto }) => valorProyecto !== undefined)
      .map(({ c, valorProyecto }) => ({
        campo: c.campo,
        etiqueta: c.etiqueta,
        valorProyecto,
        valorActual: (state as Record<string, unknown>)[c.campo],
        override: overrides.includes(c.campo),
        editor: c.editor,
      })),
    toggleOverride,
    setCampo,
  };

  return { state, setField, reset, herencia };
}
