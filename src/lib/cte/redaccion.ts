// =============================================================================
// Ayudas de redacción compartidas por las capas de texto de los módulos
// (feature-15 §A). PURAS, en español.
// =============================================================================

const LETRAS_M = ["cero", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"];
const LETRAS_F = ["cero", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"];

/** «cuatro bajantes», «un sumidero», «12 plantas». */
export function cuantos(n: number, singular: string, plural: string, genero: "m" | "f" = "m"): string {
  const letras = genero === "f" ? LETRAS_F : LETRAS_M;
  const num = n >= 0 && n <= 10 ? letras[n] : String(n);
  return `${num} ${n === 1 ? singular : plural}`;
}

export function mayuscula(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

/** «A», «A y B», «A, B y C». */
export function listaY(partes: readonly string[]): string {
  if (partes.length <= 1) return partes[0] ?? "";
  return `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}
