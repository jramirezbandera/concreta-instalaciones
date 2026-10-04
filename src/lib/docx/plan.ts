// =============================================================================
// De los bloques de la memoria al plan de un .docx (feature-16 §F). PURO.
//
// Port de `src/lib/docx/plan.ts` de Concreta (estructuras): entre un bloque y
// un `new Paragraph(...)` de la librería `docx` queda una franja de decisiones
// que no son ni dominio ni librería —cuántas columnas caben en un A4, cuánto
// mide cada una, por dónde se parte una tabla demasiado ancha, qué estilo lleva
// cada cosa—. Aquí viven sin una sola importación de `docx`, así que se
// comprueban con un `toEqual` sin abrir un zip; el renderer traduce, no decide.
//
// El texto viaja VERBATIM: un .docx es XML en UTF-8 y «Ø ² · ≤» son caracteres
// legales que Word pinta tal cual. Nada de `pdfStr` aquí.
// =============================================================================

import type { BloqueMemoria } from "../obra/memoria";

export interface CeldaPlan {
  texto: string;
  negrita: boolean;
}

export interface FilaPlan {
  cabecera: boolean;
  celdas: CeldaPlan[];
}

/**
 * Estilos INTEGRADOS de Word, que se resuelven contra la plantilla del usuario
 * (índice automático incluido), más `Pendiente`, que es un párrafo normal en
 * negrita: lo que falta tiene que verse al pegarlo.
 */
export type EstiloParrafo = "Heading1" | "Heading2" | "Heading3" | "Normal" | "Caption" | "Pendiente";

export type BloquePlan =
  | { tipo: "parrafo"; estilo: EstiloParrafo; texto: string }
  | { tipo: "tabla"; filas: FilaPlan[]; anchos: number[] };

export interface PlanDocx {
  titulo: string;
  bloques: BloquePlan[];
}

// ── Constantes de maqueta (las de Concreta) ─────────────────────────────────

/** Columnas que caben en un A4 vertical; por encima se trocea, nunca se gira la página. */
export const MAX_COLUMNAS = 8;
/** Tope del peso de una columna, en caracteres. */
const PESO_MAX = 40;
/** La columna 0 es la etiqueta: entre el 18 y el 40 %. */
const ANCHO_ETIQUETA_MIN = 18;
const ANCHO_ETIQUETA_MAX = 40;
/** Suelo del resto de columnas. 18 + 7·6 = 60 ≤ 100: con `MAX_COLUMNAS` siempre cabe. */
const ANCHO_MIN = 6;

function acotar(minimo: number, maximo: number, valor: number): number {
  return Math.min(maximo, Math.max(minimo, valor));
}

/** Peso de cada columna: su contenido más largo, cabecera incluida, acotado. */
function pesosDeColumnas(head: string[], filas: string[][]): number[] {
  return head.map((titulo, j) =>
    Math.min(PESO_MAX, filas.reduce((maximo, fila) => Math.max(maximo, (fila[j] ?? "").length), titulo.length)),
  );
}

/**
 * Mueve `delta` puntos entre las columnas de datos, empezando por la más ancha
 * y sin bajar ninguna del suelo. Devuelve lo que no ha podido colocar.
 */
function ajustar(valores: number[], delta: number): number {
  const porAnchura = valores.map((_, i) => i).sort((a, b) => valores[b] - valores[a]);
  let pendiente = delta;
  while (pendiente !== 0) {
    let movido = false;
    for (const i of porAnchura) {
      if (pendiente === 0) break;
      if (pendiente > 0) {
        valores[i] += 1;
        pendiente -= 1;
        movido = true;
      } else if (valores[i] > ANCHO_MIN) {
        valores[i] -= 1;
        pendiente += 1;
        movido = true;
      }
    }
    if (!movido) break;
  }
  return pendiente;
}

/**
 * Porcentajes ENTEROS que suman exactamente 100: una tabla pegada en una
 * plantilla con otros márgenes se reajusta sola.
 */
export function repartirAnchos(pesos: number[]): number[] {
  if (pesos.length === 0) return [];
  if (pesos.length === 1) return [100];
  const total = pesos.reduce((a, b) => a + b, 0);
  const objetivo = acotar(
    ANCHO_ETIQUETA_MIN,
    ANCHO_ETIQUETA_MAX,
    total > 0 ? Math.round((100 * pesos[0]) / total) : Math.round(100 / pesos.length),
  );
  const pesosResto = pesos.slice(1);
  const totalResto = pesosResto.reduce((a, b) => a + b, 0);
  const restante = 100 - objetivo;
  const resto = pesosResto.map((peso) =>
    Math.max(ANCHO_MIN, Math.round(totalResto > 0 ? (restante * peso) / totalResto : restante / pesosResto.length)),
  );
  let ancho0 = 100 - resto.reduce((a, b) => a + b, 0);
  if (ancho0 < ANCHO_ETIQUETA_MIN || ancho0 > ANCHO_ETIQUETA_MAX) {
    const acotado = acotar(ANCHO_ETIQUETA_MIN, ANCHO_ETIQUETA_MAX, ancho0);
    ancho0 = acotado + ajustar(resto, ancho0 - acotado);
  }
  return [ancho0, ...resto];
}

/** Una tabla más ancha que `MAX_COLUMNAS` se parte repitiendo la columna 0. */
function trocearTabla(head: string[], filas: string[][]): { head: string[]; filas: string[][] }[] {
  if (head.length <= MAX_COLUMNAS) return [{ head, filas }];
  const porTrozo = MAX_COLUMNAS - 1;
  const trozos: { head: string[]; filas: string[][] }[] = [];
  for (let desde = 1; desde < head.length; desde += porTrozo) {
    const hasta = Math.min(desde + porTrozo, head.length);
    trozos.push({
      head: [head[0], ...head.slice(desde, hasta)],
      filas: filas.map((fila) => [fila[0] ?? "", ...fila.slice(desde, hasta)]),
    });
  }
  return trozos;
}

function planificarTabla(head: string[], filas: string[][]): BloquePlan[] {
  return trocearTabla(head, filas).map((trozo) => ({
    tipo: "tabla",
    filas: [
      { cabecera: true, celdas: trozo.head.map((texto) => ({ texto, negrita: true })) },
      ...trozo.filas.map((fila) => ({ cabecera: false, celdas: fila.map((texto, j) => ({ texto, negrita: j === 0 })) })),
    ],
    anchos: repartirAnchos(pesosDeColumnas(trozo.head, trozo.filas)),
  }));
}

const ESTILO_TITULO: Record<1 | 2 | 3, EstiloParrafo> = { 1: "Heading1", 2: "Heading2", 3: "Heading3" };

/** El plan del documento. El título es el primer bloque de nivel 1. */
export function planificarDocx(bloques: BloqueMemoria[]): PlanDocx {
  const plan: BloquePlan[] = [];
  for (const b of bloques) {
    switch (b.tipo) {
      case "titulo":
        plan.push({ tipo: "parrafo", estilo: ESTILO_TITULO[b.nivel], texto: b.texto });
        break;
      case "parrafo":
        plan.push({ tipo: "parrafo", estilo: "Normal", texto: b.texto });
        break;
      case "nota":
        plan.push({ tipo: "parrafo", estilo: "Caption", texto: b.texto });
        break;
      case "pendiente":
        plan.push({ tipo: "parrafo", estilo: "Pendiente", texto: b.texto });
        break;
      case "tabla":
        plan.push(...planificarTabla(b.cabecera, b.filas));
        break;
    }
  }
  const h1 = bloques.find((b): b is Extract<BloqueMemoria, { tipo: "titulo" }> => b.tipo === "titulo" && b.nivel === 1);
  return { titulo: h1?.texto ?? "", bloques: plan };
}
