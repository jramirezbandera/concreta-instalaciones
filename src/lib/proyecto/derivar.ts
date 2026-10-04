// =============================================================================
// derivarContexto — feature-6 T2.1, feature-12: función PURA que deriva el
// contexto heredado por los módulos a partir de los datos de la obra y de El
// edificio. Cero React/DOM, cero Date.now/Math.random: mismo input → mismo
// output, siempre.
//
// Cada dato derivado viaja con su PROCEDENCIA (Derivado<T>, tipos.ts) para que
// la trazabilidad llegue hasta la ficha:
//   - zonaClimatica    → DB-HE Anejo B, Tabla a-Anejo B (via zonaClimaticaDe).
//   - zonaTermicaHS3   → DB-HS3 Tabla 4.4 (via zonaTermicaHS3De).
//   - alturaEvacuacion → cota del suelo de la última planta, de las alturas
//                        de El edificio.
// =============================================================================

import { zonaClimaticaDe, zonaTermicaHS3De } from "../../data/zonasClimaticasHE";
import { resumenEdificio } from "../edificio/derivar";
import type { Edificio } from "../edificio/tipos";
import type { ContextoDerivado, DatosGenerales } from "./tipos";

/** Procedencia de la altura de evacuación: sale de las cotas de El edificio. */
export const PROC_ALTURA_EVACUACION =
  "cota del suelo de la última planta con zonas ocupables (Anejo SI A del DB-SI), con las alturas de El edificio";

/**
 * Deriva el contexto heredado por los módulos.
 *
 * Devuelve `null` SOLO si la provincia no es reconocida (el formulario valida
 * contra PROVINCIAS, así que en la práctica no ocurre) o la altitud no es un
 * número finito. Lo que sale del edificio no depende de eso: el provider lo
 * conserva aunque el clima no se pueda derivar.
 *
 * Caso borde documentado: la Tabla 4.4 del DB-HS3 no da zona térmica para
 * Ceuta/Melilla por encima de 800 m (combinación sin territorio real). Para que
 * una provincia reconocida NUNCA devuelva null, se satura en el tramo ≤ 800 m
 * y se deja constancia en la procedencia.
 */
export function derivarContexto(
  dg: Pick<DatosGenerales, "provincia" | "altitud_m">,
  edificio: Edificio,
): ContextoDerivado | null {
  const zc = zonaClimaticaDe(dg.provincia, dg.altitud_m);
  if (zc === null) return null; // provincia no reconocida (o altitud no finita)

  let zt = zonaTermicaHS3De(dg.provincia, dg.altitud_m);
  let notaSaturacion = "";
  if (zt === null) {
    zt = zonaTermicaHS3De(dg.provincia, Math.min(dg.altitud_m, 800));
    notaSaturacion = " (altitud fuera del rango de la tabla: se aplica el tramo ≤ 800 m)";
  }
  if (zt === null) return null; // provincia ausente de la 4.4 (no debería ocurrir)

  const res = resumenEdificio(edificio);
  return {
    zonaClimatica: { valor: zc.zona, procedencia: zc.procedencia },
    zonaTermicaHS3: { valor: zt.zona, procedencia: zt.procedencia + notaSaturacion },
    alturaEvacuacion_m: { valor: res.alturaEvacuacion_m, procedencia: PROC_ALTURA_EVACUACION },
    edificio: res,
  };
}

const PROC_FALLBACK = "provincia no reconocida — revisar Datos generales (fallback de la herramienta)";

/**
 * Fallback ESTABLE de los derivados si la provincia no derivara (no debería
 * ocurrir: el formulario de datos generales valida contra PROVINCIAS, y
 * `derivarContexto` ya satura el caso Ceuta/Melilla > 800 m). Valores del lado
 * seguro/frecuente con la procedencia declarando el origen anómalo, para que si
 * algún día se cuela una provincia libre el error sea visible y trazable en vez
 * de un crash.
 */
const CLIMA_FALLBACK: Omit<ContextoDerivado, "edificio"> = {
  zonaClimatica: { valor: "D3", procedencia: PROC_FALLBACK },
  zonaTermicaHS3: { valor: "Y", procedencia: PROC_FALLBACK },
  alturaEvacuacion_m: { valor: 0, procedencia: PROC_FALLBACK },
};

/**
 * El contexto derivado SIEMPRE: `derivarContexto` o, si la provincia no se
 * reconoce, el fallback con lo que sale del edificio. Lo comparten el provider
 * y la evaluación del expediente (feature-16).
 */
export function contextoDe(
  dg: Pick<DatosGenerales, "provincia" | "altitud_m">,
  edificio: Edificio,
): ContextoDerivado {
  return derivarContexto(dg, edificio) ?? { ...CLIMA_FALLBACK, edificio: resumenEdificio(edificio) };
}
