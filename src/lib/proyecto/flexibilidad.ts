import type { Flexibilidad, JustificacionKey, MotivoFlexibilidad } from "./tipos";

export type { Flexibilidad, MotivoFlexibilidad };

// Criterio de flexibilidad en edificios existentes (feature-27, paso 4). PURO.
// CTE Parte I art. 2.3: cuando aplicar el CTE no sea urbanística, técnica o
// económicamente viable, o sea incompatible con la naturaleza de la intervención o
// con el grado de protección, se aplican las soluciones que permitan el mayor
// grado posible de adecuación efectiva, y se justifica en el proyecto. El DB-HE
// añade dos casos propios (Introducción IV, criterio 2 b y d). Párrafo D.0.3 de
// research/verificacion-reformas.md, con la cita corregida en el cotejo.

const esHe = (key: JustificacionKey): boolean =>
  key === "he1" || key === "he4" || key === "he5" || key === "he6" || key === "he0he1_global";

/** Los motivos que se pueden alegar en una justificación. */
export function motivosDe(key: JustificacionKey): { value: MotivoFlexibilidad; label: string }[] {
  const base: { value: MotivoFlexibilidad; label: string }[] = [
    { value: "tecnica", label: "No es técnicamente viable" },
    { value: "economica", label: "No es económicamente viable" },
    { value: "urbanistica", label: "No es urbanísticamente viable" },
    { value: "naturaleza", label: "Es incompatible con la naturaleza de la intervención" },
    { value: "proteccion", label: "Es incompatible con el grado de protección del edificio" },
  ];
  if (!esHe(key)) return base;
  return [
    ...base,
    { value: "sin_mejora", label: "Otras soluciones no suponen una mejora efectiva" },
    { value: "otros_elementos", label: "Otras soluciones exigen cambios en elementos que no se iban a tocar" },
  ];
}

const FRASE: Record<MotivoFlexibilidad, string> = {
  urbanistica: "no es urbanísticamente viable",
  tecnica: "no es técnicamente viable",
  economica: "no es económicamente viable",
  naturaleza: "es incompatible con la naturaleza de la intervención",
  proteccion: "es incompatible con el grado de protección del edificio",
  sin_mejora: "no supone una mejora efectiva en las prestaciones relacionadas con el requisito básico de ahorro de energía",
  otros_elementos: "implica cambios sustanciales en elementos de la envolvente térmica o en las instalaciones de generación térmica sobre los que no se iba a actuar",
};

/**
 * Cita del criterio de flexibilidad según la justificación y el motivo. El DB-SI
 * solo la admite por el grado de protección; el DB-SUA, por razones técnicas,
 * económicas o de protección; el DB-HE, por sus cuatro casos del criterio 2.
 */
export function citaFlexibilidad(key: JustificacionKey, motivo: MotivoFlexibilidad): string {
  const citas: string[] = [];
  if (motivo !== "sin_mejora" && motivo !== "otros_elementos") citas.push("CTE Parte I, art. 2.3");
  if (esHe(key) && motivo !== "urbanistica" && motivo !== "naturaleza") citas.push("DB-HE, Introducción IV, criterio 2");
  if (key.startsWith("si") && motivo === "proteccion") citas.push("DB-SI, Introducción III");
  if (key.startsWith("sua") && (motivo === "tecnica" || motivo === "economica" || motivo === "proteccion")) {
    citas.push("DB-SUA, Introducción III");
  }
  return citas.join("; ");
}

const limpio = (s: string): string => s.trim().replace(/[.\s]+$/, "");

/** El párrafo de la memoria (D.0.3). `nombre`: «HS4 Suministro de agua». */
export function notaFlexibilidad(key: JustificacionKey, nombre: string, f: Flexibilidad): string {
  const porque = limpio(f.porque);
  const cond = f.condicionantes ? limpio(f.condicionantes) : "";
  return (
    `${nombre}: se aplica con criterio de flexibilidad. Su aplicación plena ${FRASE[f.motivo]}` +
    `${porque ? `: ${porque}` : ""}. Se adoptan las soluciones que permiten el mayor grado posible de adecuación efectiva` +
    `${limpio(f.soluciones) ? `: ${limpio(f.soluciones)}` : ""}` +
    `${limpio(f.nivel) ? `, con las que se alcanza ${limpio(f.nivel)}` : ""}. ` +
    `En la documentación final de la obra quedará constancia del nivel de prestación alcanzado y de los condicionantes de uso y mantenimiento` +
    `${cond ? `: ${cond}` : " que resulten"} (${citaFlexibilidad(key, f.motivo)}).`
  );
}

/** Está completa si dice el motivo, por qué, qué soluciones y qué nivel. */
export function flexibilidadCompleta(f: Partial<Flexibilidad>): f is Flexibilidad {
  return f.motivo !== undefined && !!f.porque?.trim() && !!f.soluciones?.trim() && !!f.nivel?.trim();
}
