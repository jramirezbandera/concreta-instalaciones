import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { getModuleSchemaVersion } from "../data/moduleRegistry";

// Canonical state priority: URL query params > localStorage > hardcoded defaults
//
// Two debounce intervals (separate concerns):
//   ~0ms  — SVG/calc updates  (handled by the module via useMemo/useDeferredValue)
//   300ms — localStorage + URL writes (handled here)

type AnyRecord = Record<string, unknown>;

interface UseModuleStateReturn<T> {
  state: T;
  setField: <K extends keyof T>(field: K, value: T[K]) => void;
  reset: () => void;
}

function getVersionKey(moduleKey: string) {
  return `${moduleKey}-version`;
}

function readLocalStorage<T>(moduleKey: string, defaults: T): T | null {
  try {
    const version = localStorage.getItem(getVersionKey(moduleKey));
    if (version !== getModuleSchemaVersion(moduleKey)) return null;
    const raw = localStorage.getItem(moduleKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<T>;
    // Merge with defaults so new fields added in future schema versions are present
    return { ...defaults, ...parsed };
  } catch {
    return null;
  }
}

function writeLocalStorage<T>(moduleKey: string, state: T): void {
  try {
    localStorage.setItem(moduleKey, JSON.stringify(state));
    localStorage.setItem(getVersionKey(moduleKey), getModuleSchemaVersion(moduleKey));
  } catch {
    // Storage full or private mode — silently ignore
  }
}

function clearLocalStorage(moduleKey: string): void {
  try {
    localStorage.removeItem(moduleKey);
    localStorage.removeItem(getVersionKey(moduleKey));
  } catch {
    // ignore
  }
}

export function parseUrlParams<T>(params: URLSearchParams, defaults: T): Partial<T> {
  const defaultsRec = defaults as unknown as AnyRecord;
  const result: AnyRecord = {};
  for (const [key, raw] of params.entries()) {
    if (!(key in defaultsRec)) continue;
    const defaultVal = defaultsRec[key];
    if (typeof defaultVal === "number") {
      const n = Number(raw);
      // Number.isFinite descarta NaN E Infinity (Number("Infinity") es válido):
      // una URL hostil no debe inyectar un caudal/contador infinito.
      if (Number.isFinite(n)) result[key] = n;
    } else if (typeof defaultVal === "boolean") {
      result[key] = raw === "true";
    } else if (defaultVal !== null && typeof defaultVal === "object") {
      // Campos no primitivos (arrays/objetos) viajan JSON-codificados. Solo se
      // aceptan si el parse es válido y su forma (array vs objeto) coincide con
      // la del default, para no romper la UI ante una URL malformada/hostil.
      try {
        const parsed: unknown = JSON.parse(raw);
        if (
          parsed !== null &&
          typeof parsed === "object" &&
          Array.isArray(parsed) === Array.isArray(defaultVal)
        ) {
          result[key] = parsed;
        }
      } catch {
        // valor inválido en la URL: se ignora (queda el default/localStorage)
      }
    } else {
      result[key] = raw;
    }
  }
  return result as Partial<T>;
}

export function toUrlParams<T>(state: T): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(state as unknown as AnyRecord)) {
    // Primitivos como texto plano (URL legible); no primitivos JSON-codificados.
    out[key] =
      val !== null && typeof val === "object" ? JSON.stringify(val) : String(val);
  }
  return out;
}

export function useModuleState<T>(moduleKey: string, defaults: T): UseModuleStateReturn<T> {
  const [searchParams, setSearchParams] = useSearchParams();
  const writeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Compute initial state once: URL > localStorage > defaults
  const [state, setState] = useState<T>(() => {
    const urlOverrides = parseUrlParams(searchParams, defaults);
    const hasUrlParams = Object.keys(urlOverrides).length > 0;

    if (hasUrlParams) {
      const fromStorage = readLocalStorage(moduleKey, defaults);
      return { ...(fromStorage ?? defaults), ...urlOverrides };
    }

    const fromStorage = readLocalStorage(moduleKey, defaults);
    return fromStorage ?? defaults;
  });

  const schedulePersist = useCallback(
    (nextState: T) => {
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
      writeTimerRef.current = setTimeout(() => {
        writeLocalStorage(moduleKey, nextState);
        setSearchParams(toUrlParams(nextState), { replace: true });
      }, 300);
    },
    [moduleKey, setSearchParams],
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

  const reset = useCallback(() => {
    if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    clearLocalStorage(moduleKey);
    setSearchParams({}, { replace: true });
    setState(defaults);
  }, [moduleKey, defaults, setSearchParams]);

  useEffect(() => {
    return () => {
      if (writeTimerRef.current) clearTimeout(writeTimerRef.current);
    };
  }, []);

  return { state, setField, reset };
}
