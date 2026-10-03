// =============================================================================
// herencia — feature-6 T2.5: mapa DECLARATIVO de qué inputs de cada módulo se
// heredan del expediente (datos generales + contexto derivado) y la mecánica
// pura de merge con la que `useJustificacionState` compone el estado final.
//
// Lib PURA: cero React/DOM, cero localStorage, cero Date.now. Mismo input →
// mismo output, siempre (los strings de `notasExcepcionesLocales` viajan a la
// ficha y deben ser deterministas).
//
// Prioridad del merge (mergeInputsHeredados):
//   defaults ← guardados ← heredados (salvo campos con excepción local
//   declarada, que conservan lo guardado) ← urlOverrides.
// =============================================================================

import type { ContextoDerivado, DatosGenerales, JustificacionKey } from "./tipos";

// -----------------------------------------------------------------------------
// CONTRATO
// -----------------------------------------------------------------------------

/** Descriptor de un input de módulo que se hereda del expediente. */
export interface CampoHeredado {
  /** Nombre EXACTO del input del motor (p.ej. `numPlantas` en HS5Inputs). */
  campo: string;
  /** Etiqueta legible para UI y notas de excepción ("Nº de plantas"). */
  etiqueta: string;
  /**
   * Valor heredado a partir del expediente. `undefined` ⇒ el campo NO se hereda
   * en este proyecto (p.ej. presión de acometida sin informar).
   */
  fuente: (dg: DatosGenerales, d: ContextoDerivado) => unknown | undefined;
  /** Cómo editarlo si el proyectista declara una excepción local. */
  editor: {
    tipo: "number" | "select" | "boolean" | "text";
    opciones?: { valor: string; etiqueta: string }[];
    unidad?: string;
  };
}

// -----------------------------------------------------------------------------
// MAPA DE HERENCIA (unions verificados contra los módulos reales)
// -----------------------------------------------------------------------------

/**
 * Qué hereda cada justificación shipped. Claves ausentes ⇒ nada que heredar.
 *   - hs6: `zona: ZonaRadon` ("I" | "II" | "sin_exigencia", hs6/tablas.ts) y
 *     `municipio` (informativo, para la ficha).
 *   - he1: `zonaClimatica: ZonaClimatica` de HE1 es la LETRA de invierno sola
 *     ("α" | "A".."E", he1/tablas.ts) mientras que el derivado del proyecto es
 *     la zona completa ("C4") → la fuente extrae el PRIMER CARÁCTER.
 *   - hs3: `zonaTermica: ZonaTermica` ("W" | "X" | "Y" | "Z", hs3/tablas.ts).
 *   - hs5: `uso: UsoAparato` ("privado" | "publico", hs5/tablas.ts). Hoy el
 *     mapeo es CONSTANTE: los dos usos soportados por el expediente
 *     (vivienda_unifamiliar / vivienda_colectiva) son vivienda ⇒ "privado".
 *     Si algún día entran usos no residenciales, esta fuente deja de ser
 *     constante — por eso vive en el mapa y no inline en la UI.
 *   - hs4: `presionAcometida_kPa` SOLO si el dato de suministro está informado
 *     (opcional en DatosGenerales) — `undefined` ⇒ no se hereda.
 */
export const MAPA_HERENCIA: Partial<Record<JustificacionKey, CampoHeredado[]>> = {
  hs6: [
    {
      campo: "municipio",
      etiqueta: "Municipio",
      fuente: (dg) => dg.municipio,
      editor: { tipo: "text" },
    },
    {
      campo: "zona",
      etiqueta: "Zona de radón",
      fuente: (dg) => dg.zonaRadon,
      editor: {
        tipo: "select",
        opciones: [
          { valor: "I", etiqueta: "Zona I (potencial medio)" },
          { valor: "II", etiqueta: "Zona II (potencial alto)" },
          { valor: "sin_exigencia", etiqueta: "Sin exigencia (no clasificada)" },
        ],
      },
    },
  ],
  he1: [
    {
      campo: "zonaClimatica",
      etiqueta: "Zona climática de invierno",
      // El derivado del proyecto es la zona completa ("C4"); HE1 indexa por la
      // letra de invierno sola → primer carácter ("C4" → "C", "α3" → "α").
      fuente: (_dg, d) => d.zonaClimatica.valor.charAt(0),
      editor: {
        tipo: "select",
        opciones: [
          { valor: "α", etiqueta: "α (Canarias)" },
          { valor: "A", etiqueta: "A" },
          { valor: "B", etiqueta: "B" },
          { valor: "C", etiqueta: "C" },
          { valor: "D", etiqueta: "D" },
          { valor: "E", etiqueta: "E" },
        ],
      },
    },
  ],
  hs3: [
    {
      campo: "zonaTermica",
      etiqueta: "Zona térmica",
      fuente: (_dg, d) => d.zonaTermicaHS3.valor,
      editor: {
        tipo: "select",
        opciones: [
          { valor: "W", etiqueta: "W" },
          { valor: "X", etiqueta: "X" },
          { valor: "Y", etiqueta: "Y" },
          { valor: "Z", etiqueta: "Z" },
        ],
      },
    },
  ],
  hs5: [
    {
      campo: "uso",
      etiqueta: "Uso de la instalación",
      // Constante HOY: ambos usos del expediente son vivienda ⇒ "privado".
      fuente: () => "privado",
      editor: {
        tipo: "select",
        opciones: [
          { valor: "privado", etiqueta: "Privado (vivienda)" },
          { valor: "publico", etiqueta: "Público (no residencial)" },
        ],
      },
    },
    {
      campo: "numPlantas",
      etiqueta: "Nº de plantas",
      fuente: (dg) => dg.plantasSobreRasante,
      editor: { tipo: "number" },
    },
    {
      campo: "cubiertaTransitable",
      etiqueta: "Cubierta transitable",
      fuente: (dg) => dg.tipoCubierta === "plana_transitable",
      editor: { tipo: "boolean" },
    },
  ],
  hs4: [
    {
      campo: "presionAcometida_kPa",
      etiqueta: "Presión en la acometida",
      // Dato de suministro OPCIONAL: sin informar ⇒ undefined ⇒ no se hereda.
      fuente: (dg) => dg.presionAcometida_kPa,
      editor: { tipo: "number", unidad: "kPa" },
    },
  ],
};

// -----------------------------------------------------------------------------
// heredadosDe — valores heredados efectivos de una justificación
// -----------------------------------------------------------------------------

/**
 * Evalúa el mapa de herencia de `key` sobre el expediente y devuelve SOLO los
 * campos con valor heredado (las fuentes que devuelven `undefined` no aparecen
 * como clave: así el merge no pisa nada con un `undefined`).
 */
export function heredadosDe(
  key: JustificacionKey,
  dg: DatosGenerales,
  d: ContextoDerivado,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const campo of MAPA_HERENCIA[key] ?? []) {
    const valor = campo.fuente(dg, d);
    if (valor !== undefined) out[campo.campo] = valor;
  }
  return out;
}

// -----------------------------------------------------------------------------
// mergeInputsHeredados — composición pura del estado del módulo
// -----------------------------------------------------------------------------

/**
 * Copia de `obj` sin las entradas con valor `undefined`: un `Partial<T>` con
 * `campo: undefined` explícito no debe pisar una capa inferior en el spread.
 */
function sinUndefined(obj: Record<string, unknown> | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/**
 * Compone el estado inicial de un módulo dentro de un proyecto. NO muta sus
 * argumentos (devuelve objetos nuevos).
 *
 * Prioridad: `defaults` ← `guardados` ← `heredados` (salvo campos listados en
 * `overrides`, que conservan lo guardado — excepción local declarada) ←
 * `urlOverrides` (una URL compartida siempre gana: reproduce lo que se ve).
 *
 * `overridesEfectivos` = `overrides` ∪ {campos heredables cuyo urlOverride
 * difiere del valor heredado}: si la URL trae un valor distinto del que hereda
 * el proyecto, ese campo pasa a comportarse como excepción local (y la ficha
 * lo declarará vía `notasExcepcionesLocales`).
 */
export function mergeInputsHeredados<T extends Record<string, unknown>>(args: {
  defaults: T;
  guardados: Partial<T> | undefined;
  heredados: Partial<T>;
  overrides: string[];
  urlOverrides: Partial<T>;
}): { state: T; overridesEfectivos: string[] } {
  const { defaults, guardados, heredados, overrides, urlOverrides } = args;

  const state: Record<string, unknown> = { ...defaults, ...sinUndefined(guardados) };

  const heredadosLimpio = sinUndefined(heredados);
  for (const [campo, valor] of Object.entries(heredadosLimpio)) {
    // Excepción local declarada ⇒ el campo conserva lo guardado (o el default).
    if (overrides.includes(campo)) continue;
    state[campo] = valor;
  }

  const overridesEfectivos = [...overrides];
  for (const [campo, valor] of Object.entries(sinUndefined(urlOverrides))) {
    state[campo] = valor;
    // Campo heredable cuyo valor de URL difiere del heredado ⇒ excepción local.
    if (
      campo in heredadosLimpio &&
      !Object.is(valor, heredadosLimpio[campo]) &&
      !overridesEfectivos.includes(campo)
    ) {
      overridesEfectivos.push(campo);
    }
  }

  return { state: state as T, overridesEfectivos };
}

// -----------------------------------------------------------------------------
// notasExcepcionesLocales — frases para la ficha (deterministas, en español)
// -----------------------------------------------------------------------------

/** Formatea un valor para la nota: booleanos en español y unidad si la hay. */
function formatearValor(valor: unknown, unidad: string | undefined): string {
  const texto = typeof valor === "boolean" ? (valor ? "sí" : "no") : String(valor);
  return unidad !== undefined ? `${texto} ${unidad}` : texto;
}

/**
 * Notas de excepción local para la ficha: una por campo heredable listado en
 * `overrides` cuyo valor en `state` DIFIERE del heredado del expediente.
 * Formato: "Excepción local: Nº de plantas = 5 (dato del proyecto: 4)".
 *
 * Determinista: recorre `MAPA_HERENCIA[key]` en su orden de declaración. Un
 * override cuyo valor coincide con el heredado (o cuyo campo no se hereda en
 * este proyecto) no genera nota: no hay excepción real que declarar.
 */
export function notasExcepcionesLocales(args: {
  key: JustificacionKey;
  dg: DatosGenerales;
  d: ContextoDerivado;
  state: Record<string, unknown>;
  overrides: string[];
}): string[] {
  const { key, dg, d, state, overrides } = args;
  const notas: string[] = [];
  for (const campo of MAPA_HERENCIA[key] ?? []) {
    if (!overrides.includes(campo.campo)) continue;
    const heredado = campo.fuente(dg, d);
    if (heredado === undefined) continue; // el campo no se hereda ⇒ sin excepción
    const local = state[campo.campo];
    if (Object.is(local, heredado)) continue; // coincide ⇒ nada que declarar
    const unidad = campo.editor.unidad;
    notas.push(
      `Excepción local: ${campo.etiqueta} = ${formatearValor(local, unidad)} ` +
        `(dato del proyecto: ${formatearValor(heredado, unidad)})`,
    );
  }
  return notas;
}
