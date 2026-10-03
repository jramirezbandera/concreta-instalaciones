// =============================================================================
// urlState — (de)serialización pura de estado de módulo ↔ query params de la
// URL. Extraído del difunto hook legacy por módulo (feature-6 T6.2): son
// funciones puras sin React, compartidas hoy por `useJustificacionState` y
// testeadas de forma aislada en `test/urlState.test.ts`.
//
// Convención: primitivos como texto plano (URL legible); no primitivos
// (arrays/objetos) JSON-codificados. El parse está endurecido contra URLs
// malformadas/hostiles: solo acepta claves presentes en los defaults, números
// finitos, y JSON cuya forma raíz (array vs objeto) coincide con el default.
// =============================================================================

type AnyRecord = Record<string, unknown>;

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
