// Convención de unidades (SPEC §4/§11): los campos llevan SUFIJO DE UNIDAD en su
// nombre para que el compilador y el lector impidan mezclar unidades, p.ej.
// `caudal_l_s: number`, `presion_kPa: number`, `superficie_m2: number`.
//
// No hay sistema de unidades conmutable: el CTE es siempre SI/métrico. Este
// fichero documenta las unidades canónicas usadas en los motores.

/** Unidades canónicas del dominio CTE instalaciones (todas SI/métricas). */
export type UnidadCanonica =
  | "l/s" // caudal de aire
  | "m³/h" // caudal de aire (alternativa)
  | "cm²" // área de aberturas / sección de conducto
  | "mm" // diámetros, espesores
  | "m" // longitudes
  | "m²" // superficies
  | "kPa" // presiones de agua
  | "m/s" // velocidades
  | "UD" // unidades de desagüe (HS5)
  | "dm³/s" // caudal de evacuación de aguas (HS5, desagües continuos)
  | "%" // pendiente de ramales/colectores (HS5)
  | "Pa" // presión/depresión en bajantes (HS5)
  | "W/m²K" // transmitancia térmica U
  | "m²K/W" // resistencia térmica
  | "ppm"; // concentración CO₂
