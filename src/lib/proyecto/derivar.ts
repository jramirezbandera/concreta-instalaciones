// =============================================================================
// derivarContexto — feature-6 T2.1: función PURA que deriva el contexto heredado
// por los módulos (barra de contexto, UX-RECONCEPT §4.3) a partir de los datos
// generales del expediente. Cero React/DOM, cero Date.now/Math.random: mismo
// input → mismo output, siempre.
//
// Cada dato derivado viaja con su PROCEDENCIA (Derivado<T>, tipos.ts) para que
// la trazabilidad llegue hasta la ficha:
//   - zonaClimatica    → DB-HE Anejo B, Tabla a-Anejo B (via zonaClimaticaDe).
//   - zonaTermicaHS3   → DB-HS3 Tabla 4.4 (via zonaTermicaHS3De).
//   - alturaEvacuacion → suma de las alturas de planta declaradas (feature-10)
//                        o, sin declarar, estimación 3 m/planta (revisable).
// =============================================================================

import { zonaClimaticaDe, zonaTermicaHS3De } from "../../data/zonasClimaticasHE";
import type { AlturasPlantas, ContextoDerivado, DatosGenerales } from "./tipos";

/**
 * Procedencia LITERAL de la altura de evacuación estimada: no procede de una
 * tabla CTE sino de una regla gruesa de la herramienta, y así se declara.
 */
export const PROC_ALTURA_EVACUACION = "estimación 3 m/planta (revisable por el proyectista)";

/**
 * Procedencia con alturas declaradas (feature-10): cota del suelo de la última
 * planta = suma de las alturas de las plantas inferiores, declaradas en Datos
 * generales por el proyectista.
 */
export const PROC_ALTURA_EVACUACION_DECLARADA =
  "suma de las alturas de planta declaradas en Datos generales";

/** Altura estimada de una planta [m] — regla gruesa declarada en la procedencia. */
export const ALTURA_POR_PLANTA_M = 3;

/** ¿Es una altura de planta utilizable? (finita y positiva). */
function alturaValida(h: number | undefined): h is number {
  return h !== undefined && Number.isFinite(h) && h > 0;
}

/**
 * Reconcilia unas alturas declaradas con los contadores de plantas actuales:
 * conserva las existentes TAL CUAL (aunque estén a medio teclear — juzgarlas es
 * de la validación del formulario, no de aquí), completa las que falten a
 * 3,00 m y recorta las que sobren. `previas === undefined` produce el punto de
 * partida del editor (todo a 3,00). Pura — es la mecánica con la que el
 * formulario mantiene las longitudes casadas SIN sincronizar con efectos.
 */
export function reconciliarAlturas(
  previas: AlturasPlantas | undefined,
  plantasSobre: number,
  plantasBajo: number,
): AlturasPlantas {
  const ajustar = (lista: number[] | undefined, n: number): number[] =>
    Array.from({ length: Math.max(0, n) }, (_, i) => lista?.[i] ?? ALTURA_POR_PLANTA_M);
  return {
    sobre: ajustar(previas?.sobre, plantasSobre),
    bajo: ajustar(previas?.bajo, plantasBajo),
  };
}

/**
 * Deriva el contexto heredado por los módulos a partir de los datos generales.
 *
 * Determinista y sin redondeos ocultos (la altura de evacuación se redondea a
 * 2 decimales y se declara: los residuos flotantes de sumar 3,30 no deben
 * llegar a la ficha). Devuelve `null` SOLO si la provincia no es reconocida
 * (el formulario valida contra PROVINCIAS, así que en la práctica no ocurre)
 * o la altitud no es un número finito.
 *
 * Caso borde documentado: la Tabla 4.4 del DB-HS3 no da zona térmica para
 * Ceuta/Melilla por encima de 800 m (combinación sin territorio real). Para que
 * una provincia reconocida NUNCA devuelva null, se satura en el tramo ≤ 800 m
 * y se deja constancia en la procedencia.
 */
export function derivarContexto(
  dg: Pick<DatosGenerales, "provincia" | "altitud_m" | "plantasSobreRasante" | "alturasPlantas_m">,
): ContextoDerivado | null {
  const zc = zonaClimaticaDe(dg.provincia, dg.altitud_m);
  if (zc === null) return null; // provincia no reconocida (o altitud no finita)

  // Zona térmica HS3: mismo universo de provincias que el Anejo B. Si la 4.4 no
  // cubre la combinación (Ceuta/Melilla > 800 m), se satura en el tramo ≤ 800 m.
  let zt = zonaTermicaHS3De(dg.provincia, dg.altitud_m);
  let notaSaturacion = "";
  if (zt === null) {
    zt = zonaTermicaHS3De(dg.provincia, Math.min(dg.altitud_m, 800));
    notaSaturacion = " (altitud fuera del rango de la tabla: se aplica el tramo ≤ 800 m)";
  }
  if (zt === null) return null; // provincia ausente de la 4.4 (no debería ocurrir)

  // Altura de evacuación descendente [m]: cota del suelo de la ÚLTIMA planta
  // (su propia altura no interviene: se evacúa desde su suelo). Con alturas
  // declaradas (feature-10) se suman las reales; una entrada ausente/no válida
  // (desfase con el contador de plantas) se completa a 3 m y SE DECLARA.
  const plantasBajoLaUltima = Math.max(0, dg.plantasSobreRasante - 1);
  let alturaEvacuacion_m: number;
  let procedenciaAltura: string;
  const sobre = dg.alturasPlantas_m?.sobre;
  if (sobre !== undefined) {
    let suma = 0;
    let completadas = false;
    for (let i = 0; i < plantasBajoLaUltima; i++) {
      const h = sobre[i];
      if (alturaValida(h)) {
        suma += h;
      } else {
        suma += ALTURA_POR_PLANTA_M;
        completadas = true;
      }
    }
    alturaEvacuacion_m = Math.round(suma * 100) / 100;
    procedenciaAltura =
      PROC_ALTURA_EVACUACION_DECLARADA +
      (completadas ? " (plantas sin altura declarada: 3 m)" : "");
  } else {
    alturaEvacuacion_m = plantasBajoLaUltima * ALTURA_POR_PLANTA_M;
    procedenciaAltura = PROC_ALTURA_EVACUACION;
  }

  return {
    zonaClimatica: { valor: zc.zona, procedencia: zc.procedencia },
    zonaTermicaHS3: { valor: zt.zona, procedencia: zt.procedencia + notaSaturacion },
    alturaEvacuacion_m: { valor: alturaEvacuacion_m, procedencia: procedenciaAltura },
  };
}
