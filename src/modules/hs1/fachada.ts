// =============================================================================
// DB-HS1 — La fachada de El edificio frente a la tabla 2.7 (feature-26, paso 5).
// PURA.
//
// Lo que la fachada aporta sale de sus rasgos en el catálogo común
// (research/verificacion-cerramientos-cec.md, F.4.2 y F.4.3):
//   - la columna: con o sin revestimiento exterior;
//   - las hojas: con una sola, la nota (1) de la tabla 2.7 cambia C1 por C2;
//   - B: la de la sección con su aislante, hidrófilo o no;
//   - C: la hoja principal; N: el enfoscado intermedio, si lo tiene.
// Lo que declara el proyectista, con lo habitual propuesto:
//   - R, la resistencia del revestimiento exterior: desde la de su tipo
//     (continuo o pegado R1, fijado mecánicamente R2, de escamas o placas R3)
//     hasta R3; lo habitual es la menor con la que cumple;
//   - J, N y H en las fachadas sin revestimiento: lo habitual, lo que pide la
//     primera combinación que puede cumplir.
// La combinación es la primera de la casilla que cubren las prestaciones, con la
// sustitución del ap. 2.3.2 pto 2 (un número mayor sustituye a uno menor). Una
// solución de un grado mayor vale para uno menor (el grado exigido es un
// mínimo): si la casilla del grado exigido no se cubre, se busca en las de
// grado mayor. Así, una fachada de una hoja con C1, a la que la nota (1) quita
// la casilla de los grados 1 y 2, cumple con las de los grados 3 y 4.
// El grado del CEC solo es contraste (K-CER.12).
// =============================================================================

import type { SolFachada } from "../../lib/constructivo/catalogo";
import { MATERIALES_CEC } from "../../lib/constructivo/materiales";
import { aplicarHojaUnica, opcionesFachada, SUSTITUCION_FACHADA, type ColumnaFachada, type Grado } from "./tablas";

export type BloqueFachada = keyof typeof SUSTITUCION_FACHADA.datos;
export type Niveles = Record<BloqueFachada, number>;

/** Lo que el proyectista declara de una fachada; sin dar, lo habitual. */
export interface DeclaraFachada {
  R?: 1 | 2 | 3;
  J?: 1 | 2;
  N?: 1 | 2;
  H?: 0 | 1;
}

/** Lo declarado de la fachada general y de la de la planta baja. */
export interface DeclaraFachadas {
  general?: DeclaraFachada;
  pb?: DeclaraFachada;
}

const R_POR_TIPO: Record<SolFachada["hs1"]["revestimiento"], number> = {
  ninguno: 0,
  continuo: 1,
  discontinuo_pegado: 1,
  discontinuo_mecanico: 2,
  escamas: 3,
};

export function columnaDe(f: SolFachada): ColumnaFachada {
  return f.hs1.revestimiento === "ninguno" ? "sin_revestimiento" : "con_revestimiento";
}

export function aislanteHidrofilo(f: SolFachada): boolean {
  const m = MATERIALES_CEC[f.aislante];
  return "hidrofilo" in m && m.hidrofilo === true;
}

/** Lo que aporta la fachada por sí misma (`base`) y hasta dónde se puede declarar (`max`). */
export function nivelesDe(f: SolFachada): { base: Niveles; max: Niveles } {
  const h = f.hs1;
  const R = R_POR_TIPO[h.revestimiento];
  const B = aislanteHidrofilo(f) ? h.B.hidrofilo : h.B.noHidrofilo;
  const N = h.N ?? 0;
  return {
    base: { R, B, C: h.C, H: 0, J: 1, N },
    max: { R: R === 0 ? 0 : 3, B, C: h.C, H: 1, J: 2, N: N === 0 ? 0 : 2 },
  };
}

function bloque(codigo: string): { b: BloqueFachada; n: number } {
  return { b: codigo[0] as BloqueFachada, n: Number(codigo.slice(1)) };
}

/** Las condiciones de una combinación que no cubren unos niveles. */
export function faltan(codigos: readonly string[], niveles: Niveles): string[] {
  return codigos.filter((c) => {
    const { b, n } = bloque(c);
    return niveles[b] < n;
  });
}

/** Las combinaciones de la casilla, con la nota (1) ya aplicada si la fachada es de una hoja. */
export function combinaciones(f: SolFachada, grado: Grado): { codigos: string[]; nota1: boolean }[] {
  return opcionesFachada(columnaDe(f), grado).map((o) => ({
    codigos: f.hs1.hojas === 1 && o.nota1 ? aplicarHojaUnica(o.codigos) : [...o.codigos],
    nota1: f.hs1.hojas === 1 && o.nota1,
  }));
}

const GRADOS = [1, 2, 3, 4, 5] as const;

/** Los grados desde el exigido hasta el 5. */
function desde(grado: Grado): Grado[] {
  return GRADOS.filter((g) => g >= grado);
}

/** Lo habitual: lo mínimo que pide la primera combinación (del grado exigido o mayor) que la fachada puede cumplir. */
export function nivelesHabituales(f: SolFachada, grado: Grado): Niveles {
  const { base, max } = nivelesDe(f);
  for (const g of desde(grado)) {
    for (const o of combinaciones(f, g)) {
      const n = { ...base };
      let posible = true;
      for (const c of o.codigos) {
        const { b, n: k } = bloque(c);
        if (n[b] >= k) continue;
        if (k <= max[b]) n[b] = k;
        else posible = false;
      }
      if (posible) return n;
    }
  }
  return base;
}

export interface EvaluacionFachada {
  columna: ColumnaFachada;
  unaHoja: boolean;
  hidrofilo: boolean;
  niveles: Niveles;
  habituales: Niveles;
  /** Las combinaciones de la casilla de `gradoOpcion`. */
  opciones: { codigos: string[]; nota1: boolean }[];
  /** La casilla de la combinación: la del grado exigido o, si no se cubre, la del menor grado mayor que sí. */
  gradoOpcion: Grado;
  /** La combinación cumplida o, si no se cumple ninguna, la más cercana de la casilla del grado exigido. */
  opcion: number;
  condiciones: string[];
  cumple: boolean;
  faltan: string[];
  /** El mayor grado que cubre la fachada con lo declarado. */
  gradoMax: Grado | 0;
  /** Lo que da el CEC con lo declarado, si lo tabula: contraste (K-CER.12). */
  cec: { clave: string; grado: number } | null;
  /** Lo declarado que se aparta de lo habitual. */
  declarado: boolean;
}

export function evaluarFachada(f: SolFachada, grado: Grado, d: DeclaraFachada = {}): EvaluacionFachada {
  const { max } = nivelesDe(f);
  const hab = nivelesHabituales(f, grado);
  const niveles: Niveles = {
    ...hab,
    R: max.R === 0 ? 0 : (d.R ?? hab.R),
    J: d.J ?? hab.J,
    N: max.N === 0 ? 0 : (d.N ?? hab.N),
    H: d.H ?? hab.H,
  };
  const cubierta = (g: Grado) => combinaciones(f, g).findIndex((o) => faltan(o.codigos, niveles).length === 0);
  const gradoOpcion = desde(grado).find((g) => cubierta(g) >= 0);
  const cumple = gradoOpcion !== undefined;
  const opciones = combinaciones(f, gradoOpcion ?? grado);
  const cercana = opciones.reduce(
    (mejor, o, k) => (faltan(o.codigos, niveles).length < faltan(opciones[mejor].codigos, niveles).length ? k : mejor),
    0,
  );
  const opcion = cumple ? cubierta(gradoOpcion) : cercana;

  let gradoMax: Grado | 0 = 0;
  for (const g of GRADOS) if (cubierta(g) >= 0) gradoMax = g;

  const columna = columnaDe(f);
  const clave = columna === "con_revestimiento" ? `R${niveles.R}` : `J${niveles.J} N${niveles.N}`;
  const fila = f.hs1.giCEC.find(([k]) => k === clave) ?? (f.hs1.giCEC.length === 1 && f.hs1.giCEC[0][0] === "—" ? f.hs1.giCEC[0] : undefined);

  return {
    columna,
    unaHoja: f.hs1.hojas === 1,
    hidrofilo: aislanteHidrofilo(f),
    niveles,
    habituales: hab,
    opciones,
    gradoOpcion: gradoOpcion ?? grado,
    opcion,
    condiciones: opciones[opcion].codigos,
    cumple,
    faltan: faltan(opciones[opcion].codigos, niveles),
    gradoMax,
    cec: fila ? { clave: fila[0], grado: fila[1] } : null,
    declarado: (["R", "J", "N", "H"] as const).some((k) => d[k] !== undefined && niveles[k] !== hab[k]),
  };
}
