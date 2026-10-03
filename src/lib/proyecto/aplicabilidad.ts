import type {
  Aplicabilidad,
  DatosGenerales,
  JustificacionKey,
  Proyecto,
} from "./tipos";
import { justificacionRegistry } from "../../data/justificacionRegistry";

// Motor de aplicabilidad — Fase A, obra nueva (feature-6 §A, UX-RECONCEPT §2.3 y §5).
// Lib PURA: sin React/DOM/Date.now. Dado `DatosGenerales` propone, por justificación,
// una aplicabilidad CON párrafo redactado y cita de ámbito (los "no aplica" que hoy se
// copian con errores de memorias anteriores). El motor de reformas por DB llega en
// Fase E; aquí la intervención ≠ obra nueva solo añade el aviso de alcance pendiente.
// Principio §5: la herramienta propone con cita; el proyectista dispone (forzado).
//
// Citas a nivel de sección/ámbito, nunca números de artículo inventados (SPEC §11).

/** Aplicabilidad propuesta por el motor para una justificación, con su redacción. */
export interface AplicabilidadCalculada {
  aplicabilidad: Aplicabilidad;
  /** Párrafo redactado listo para la memoria (p.ej. el "no aplica" de SUA6 sin piscina). */
  nota?: string;
  /** Referencia normativa del ámbito que respalda la propuesta. */
  cita?: string;
}

/** Regla de atributos: si `cuando(dg)` es true, la justificación `key` toma `resultado`. */
export interface ReglaAtributo {
  key: JustificacionKey;
  /** true ⇒ se aplica la regla. */
  cuando: (dg: DatosGenerales) => boolean;
  resultado: Aplicabilidad;
  /** Párrafo REDACTADO listo para la memoria. */
  nota: string;
  /** Referencia normativa del ámbito. */
  cita: string;
}

/**
 * Reglas de atributos (§2.3): en orden de declaración, para cada key gana la
 * PRIMERA regla que casa. Las citas se quedan a nivel de sección/ámbito.
 */
export const REGLAS_ATRIBUTOS: readonly ReglaAtributo[] = [
  // ── SUA 6 · Piscinas ───────────────────────────────────────────────────────
  {
    key: "sua6",
    cuando: (dg) => !dg.tienePiscina,
    resultado: "no_aplica",
    nota:
      "SUA 6 Seguridad frente al riesgo de ahogamiento: no es de aplicación — " +
      "el edificio no dispone de piscina de uso colectivo (el ámbito de la " +
      "Sección SUA 6 se limita a las piscinas de uso colectivo).",
    cita: "DB-SUA 6, ámbito de aplicación",
  },
  {
    // Solo se evalúa cuando la anterior no casa (⇒ tienePiscina): el ámbito de
    // SUA 6 deja fuera las piscinas de las viviendas unifamiliares, igual que
    // el de SUA 7 deja fuera sus aparcamientos. Sin esta regla, marcar
    // "Piscina" en una unifamiliar exigía justificar una sección que no le es
    // de aplicación.
    key: "sua6",
    cuando: (dg) => dg.uso === "vivienda_unifamiliar",
    resultado: "no_aplica",
    nota:
      "SUA 6 Seguridad frente al riesgo de ahogamiento: no es de aplicación — " +
      "la piscina pertenece a una vivienda unifamiliar y no es de uso colectivo " +
      "(el ámbito de la Sección SUA 6 se limita a las piscinas de uso colectivo " +
      "y deja fuera las de las viviendas unifamiliares).",
    cita: "DB-SUA 6, ámbito de aplicación",
  },
  // ── SUA 7 · Aparcamientos ──────────────────────────────────────────────────
  {
    key: "sua7",
    cuando: (dg) => !dg.tieneGaraje,
    resultado: "no_aplica",
    nota:
      "SUA 7 Seguridad frente al riesgo causado por vehículos en movimiento: " +
      "no es de aplicación — el edificio no dispone de garaje ni de zona de " +
      "aparcamiento (el ámbito de la Sección SUA 7 se limita a las zonas de " +
      "uso Aparcamiento y a las vías de circulación de vehículos existentes " +
      "en los edificios).",
    cita: "DB-SUA 7, ámbito de aplicación",
  },
  {
    // Solo se evalúa cuando la anterior no casa (⇒ tieneGaraje): el ámbito de
    // SUA 7 excluye los aparcamientos de las viviendas unifamiliares.
    key: "sua7",
    cuando: (dg) => dg.uso === "vivienda_unifamiliar",
    resultado: "no_aplica",
    nota:
      "SUA 7 Seguridad frente al riesgo causado por vehículos en movimiento: " +
      "no es de aplicación — el garaje pertenece a una vivienda unifamiliar " +
      "(el ámbito de la Sección SUA 7 excluye los aparcamientos de las " +
      "viviendas unifamiliares).",
    cita: "DB-SUA 7, ámbito de aplicación",
  },
  // ── DB-HR · Protección frente al ruido ─────────────────────────────────────
  {
    key: "hr",
    cuando: (dg) => dg.uso === "vivienda_unifamiliar",
    resultado: "no_aplica",
    nota:
      "DB-HR Protección frente al ruido: no es de aplicación — vivienda " +
      "unifamiliar (el ámbito del DB-HR excluye las viviendas unifamiliares " +
      "aisladas; en unifamiliares adosadas el DB-HR sí es de aplicación, " +
      "únicamente respecto de los elementos de separación con otros " +
      "edificios). Criterio revisable por el proyectista según la " +
      "configuración concreta del edificio.",
    cita: "DB-HR, ámbito de aplicación",
  },
];

const NOTA_ALCANCE_PENDIENTE =
  "Intervención en edificio existente: el alcance de aplicación se " +
  "justificará con el asistente de alcance (pendiente, CTE Parte I art. 2).";
const CITA_PARTE_I = "CTE Parte I, art. 2";

/** Claves reales del expediente (el registry menos las entradas de desarrollo). */
const KEYS_EXPEDIENTE: readonly JustificacionKey[] = justificacionRegistry
  .filter((j) => !j.dev)
  .map((j) => j.key as JustificacionKey);

/**
 * Aplicabilidad PROPUESTA para cada justificación del expediente (Fase A):
 *  1. Entradas `formato: "externo"` del registry → `externo` ("Se justifica con <destino>").
 *  2. `REGLAS_ATRIBUTOS` en orden — para cada key gana la primera que casa.
 *  3. Resto → `aplica`; si la intervención no es obra nueva, con el aviso de
 *     alcance pendiente (motor de reformas en Fase E).
 * Función pura y determinista: mismo `dg` ⇒ mismo resultado.
 */
export function aplicabilidadBase(
  dg: DatosGenerales,
): Record<JustificacionKey, AplicabilidadCalculada> {
  const resultado = {} as Record<JustificacionKey, AplicabilidadCalculada>;
  for (const key of KEYS_EXPEDIENTE) {
    const entry = justificacionRegistry.find((j) => j.key === key);
    // 1. Externas: se resuelven fuera de la app (HULC, Concreta estructura).
    if (entry?.formato === "externo") {
      resultado[key] = {
        aplicabilidad: "externo",
        nota: `Se justifica con ${entry.externo?.destino ?? "herramienta externa"}.`,
        cita: entry.db,
      };
      continue;
    }
    // 2. Reglas de atributos: primera que casa gana.
    const regla = REGLAS_ATRIBUTOS.find((r) => r.key === key && r.cuando(dg));
    if (regla) {
      resultado[key] = {
        aplicabilidad: regla.resultado,
        nota: regla.nota,
        cita: regla.cita,
      };
      continue;
    }
    // 3. Resto: aplica (obra nueva); intervención existente ⇒ aviso de alcance.
    resultado[key] =
      dg.intervencion === "obra_nueva"
        ? { aplicabilidad: "aplica" }
        : {
            aplicabilidad: "aplica",
            nota: NOTA_ALCANCE_PENDIENTE,
            cita: CITA_PARTE_I,
          };
  }
  return resultado;
}

/**
 * Aplicabilidad EFECTIVA de una justificación en un proyecto: si el proyectista
 * la forzó (`aplicabilidadForzada`) prevalece su valor con su nota (la
 * herramienta propone, el proyectista dispone); si no, la propuesta del motor.
 */
export function aplicabilidadEfectiva(
  p: Proyecto,
  key: JustificacionKey,
): AplicabilidadCalculada & { forzada: boolean } {
  const forzada = p.justificaciones[key]?.aplicabilidadForzada;
  if (forzada) {
    return { aplicabilidad: forzada.valor, nota: forzada.nota, forzada: true };
  }
  return { ...aplicabilidadBase(p.datosGenerales)[key], forzada: false };
}
