/* eslint-disable react-refresh/only-export-components -- patrón Context+Provider del repo (AppShell,
   ThemeProvider): el contexto y el hook se co-localizan con el provider; HMR full-reload aceptable. */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type JSX,
  type ReactNode,
} from "react";
import type {
  Aplicabilidad,
  ContextoDerivado,
  DatosGenerales,
  JustificacionEnProyecto,
  JustificacionKey,
  Edificio,
  Flexibilidad,
  Proyecto,
} from "./tipos";
import { contextoDe } from "./derivar";
import { guardarProyecto } from "./storage";

// =============================================================================
// ProyectoContext — feature-6 T3.1: estado vivo del expediente abierto.
//
// El provider es el ÚNICO dueño del `Proyecto` en memoria mientras se trabaja en
// él: los módulos leen/escriben a través de este contexto y la persistencia sale
// por un solo camino (debounce 300 ms → `guardarProyecto`). El layout de ruta
// remonta el provider con `key={id}`, así que `proyectoInicial` solo se lee al
// montar (no hay que reaccionar a cambios de la prop).
//
// CRITERIO `modificado`: solo lo tocan las mutaciones que reciben `nowIso`
// (ediciones del usuario: datos generales, inputs de módulo). Las escrituras
// de bookkeeping (`setOverridesContexto`, `forzarAplicabilidad`,
// `setRefExterna`) NO reciben instante y CONSERVAN el `modificado` existente:
// un flag de override no es "el usuario modificó el proyecto a las X". Aquí sigue sin haber `Date.now` —
// todo instante llega inyectado desde la UI (contrato del motor/persistencia).
//
// FLUSH GARANTIZADO (corrige el hueco del difunto hook legacy por módulo,
// que cancelaba el timer
// sin escribir al desmontar): lo pendiente se escribe inmediatamente en el
// cleanup del efecto de desmontaje y en `beforeunload`/`pagehide`. Un ref al
// último estado evita perder el cierre del debounce.
// =============================================================================

/** Retardo del debounce de persistencia [ms] — mismo valor que `useJustificacionState`. */
const DEBOUNCE_MS = 300;

export interface ProyectoContextValue {
  proyecto: Proyecto;
  /** Contexto derivado de la obra y del edificio (memoizado); ver `contextoDe`. */
  derivados: ContextoDerivado;
  actualizarDatosGenerales(dg: DatosGenerales, nowIso: string): void;
  /** Renombra el expediente (edición del usuario → toca `modificado`). */
  renombrarProyecto(nombre: string, nowIso: string): void;
  actualizarInputs(key: JustificacionKey, inputs: Record<string, unknown>, nowIso: string): void;
  setOverridesContexto(key: JustificacionKey, campos: string[]): void;
  /** El edificio entero (feature-12). Edición del usuario → toca `modificado`. */
  actualizarEdificio(edificio: Edificio, nowIso: string): void;
  /** `valor: null` quita el forzado y vuelve a mandar `aplicabilidadBase`. */
  forzarAplicabilidad(key: JustificacionKey, valor: Aplicabilidad | null, nota?: string, flexibilidad?: Flexibilidad): void;
  setRefExterna(key: JustificacionKey, ref: string): void;
  /** Marca (o desmarca) un aviso de una justificación como revisado (feature-14). */
  marcarRevisado(key: JustificacionKey, avisoId: string, revisado: boolean): void;
}

export const ProyectoContext = createContext<ProyectoContextValue | null>(null);

/** Acceso al expediente abierto. Lanza fuera del provider (patrón useDrawer/useTheme). */
export function useProyecto(): ProyectoContextValue {
  const ctx = useContext(ProyectoContext);
  if (ctx === null) {
    throw new Error("useProyecto debe usarse dentro de <ProyectoProvider>.");
  }
  return ctx;
}

/**
 * Actualización inmutable de una justificación: mezcla `patch` sobre la entrada
 * existente (o `{}` si no existía). `nowIso` opcional: sin él se conserva el
 * `modificado` actual (criterio de cabecera). Función pura de módulo — segura
 * dentro de updaters de `setState` bajo React Compiler/StrictMode.
 */
function conJustificacion(
  p: Proyecto,
  key: JustificacionKey,
  patch: Partial<JustificacionEnProyecto>,
  nowIso?: string,
): Proyecto {
  const actual: JustificacionEnProyecto = p.justificaciones[key] ?? {};
  return {
    ...p,
    modificado: nowIso ?? p.modificado,
    justificaciones: { ...p.justificaciones, [key]: { ...actual, ...patch } },
  };
}

export function ProyectoProvider(props: {
  proyectoInicial: Proyecto;
  /** `false` = todo en memoria, sin tocar localStorage (sandbox de _smoke). Default `true`. */
  persistir?: boolean;
  children: ReactNode;
}): JSX.Element {
  const { proyectoInicial, persistir = true, children } = props;

  const [proyecto, setProyecto] = useState<Proyecto>(proyectoInicial);

  // Último estado + flag de pendiente para que el flush no dependa de cierres
  // viejos: el timer y los listeners de unload leen SIEMPRE el ref.
  const proyectoRef = useRef<Proyecto>(proyectoInicial);
  const pendienteRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Escribe YA lo pendiente (si lo hay) y cancela el timer. Idempotente. */
  const flush = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!pendienteRef.current) return;
    pendienteRef.current = false;
    if (persistir) guardarProyecto(proyectoRef.current);
  }, [persistir]);

  // Programación del persist: efecto sobre `proyecto` (no dentro de los updaters
  // de setState, que deben ser puros bajo React Compiler). La comparación por
  // identidad con el ref hace de guarda: el montaje (y el remontaje de
  // StrictMode) no programa escritura porque nada cambió.
  useEffect(() => {
    if (proyectoRef.current === proyecto) return; // sin cambios → nada que persistir
    proyectoRef.current = proyecto;
    pendienteRef.current = true;
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flush, DEBOUNCE_MS);
  }, [proyecto, flush]);

  // Flush garantizado: al desmontar (navegar a otro proyecto/ruta) y al cerrar o
  // esconder la página. `pagehide` cubre el bfcache móvil donde `beforeunload`
  // puede no dispararse.
  useEffect(() => {
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      flush(); // lo pendiente se escribe, no se cancela (corrige el hueco del hook legacy)
    };
  }, [flush]);

  // Derivados memoizados de los datos generales (la referencia solo cambia si
  // cambia `datosGenerales`, que las mutaciones reemplazan de forma inmutable).
  const derivados = useMemo<ContextoDerivado>(
    () => contextoDe(proyecto.datosGenerales, proyecto.edificio),
    [proyecto.datosGenerales, proyecto.edificio],
  );

  const actualizarDatosGenerales = useCallback((dg: DatosGenerales, nowIso: string) => {
    setProyecto((prev) => ({ ...prev, datosGenerales: dg, modificado: nowIso }));
  }, []);

  const renombrarProyecto = useCallback((nombre: string, nowIso: string) => {
    setProyecto((prev) => ({ ...prev, nombre, modificado: nowIso }));
  }, []);

  const actualizarInputs = useCallback(
    (key: JustificacionKey, inputs: Record<string, unknown>, nowIso: string) => {
      setProyecto((prev) => conJustificacion(prev, key, { inputs }, nowIso));
    },
    [],
  );

  const setOverridesContexto = useCallback((key: JustificacionKey, campos: string[]) => {
    // Lista vacía = sin overrides → se elimina el campo (JSON persistido limpio).
    setProyecto((prev) =>
      conJustificacion(prev, key, { overridesContexto: campos.length > 0 ? campos : undefined }),
    );
  }, []);

  const actualizarEdificio = useCallback((edificio: Edificio, nowIso: string) => {
    setProyecto((prev) => ({ ...prev, edificio, modificado: nowIso }));
  }, []);

  const forzarAplicabilidad = useCallback(
    (key: JustificacionKey, valor: Aplicabilidad | null, nota?: string, flexibilidad?: Flexibilidad) => {
      setProyecto((prev) =>
        conJustificacion(prev, key, {
          aplicabilidadForzada: valor === null ? undefined : { valor, nota, ...(flexibilidad ? { flexibilidad } : {}) },
        }),
      );
    },
    [],
  );

  const setRefExterna = useCallback((key: JustificacionKey, ref: string) => {
    // Cadena vacía = sin referencia → se elimina el campo.
    setProyecto((prev) => conJustificacion(prev, key, { refExterna: ref !== "" ? ref : undefined }));
  }, []);

  const marcarRevisado = useCallback((key: JustificacionKey, avisoId: string, revisado: boolean) => {
    setProyecto((prev) => {
      const actuales = prev.justificaciones[key]?.revisados ?? [];
      const sin = actuales.filter((id) => id !== avisoId);
      const revisados = revisado ? [...sin, avisoId] : sin;
      // Lista vacía → se elimina el campo (JSON persistido limpio).
      return conJustificacion(prev, key, { revisados: revisados.length > 0 ? revisados : undefined });
    });
  }, []);

  const value = useMemo<ProyectoContextValue>(
    () => ({
      proyecto,
      derivados,
      actualizarDatosGenerales,
      renombrarProyecto,
      actualizarInputs,
      setOverridesContexto,
      actualizarEdificio,
      forzarAplicabilidad,
      setRefExterna,
      marcarRevisado,
    }),
    [
      proyecto,
      derivados,
      actualizarDatosGenerales,
      renombrarProyecto,
      actualizarInputs,
      setOverridesContexto,
      actualizarEdificio,
      forzarAplicabilidad,
      setRefExterna,
      marcarRevisado,
    ],
  );

  return <ProyectoContext.Provider value={value}>{children}</ProyectoContext.Provider>;
}
