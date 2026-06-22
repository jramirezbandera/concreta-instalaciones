// =============================================================================
// KERNEL DE GRAFO / VEREDICTO COMPARTIDO entre los módulos de red (HS4/HS5).
//
// Primitivas PURAS y DETERMINISTAS (SPEC §4): sin React/DOM, sin Date.now ni
// Math.random. Mismo input → mismo output (requisito de snapshots). Ids
// deterministas; el orden de salida es estable (deriva del orden de entrada).
//
// Extrae lo que HOY estaba duplicado en hs4/calc.ts y hs5/calc.ts:
//  - `peor(a, b)`: peor (más restrictivo) de dos veredictos.
//  - `validarArbol(...)`: validación ENDURECIDA del árbol de tramos +
//    orden topológico post-orden determinista + mapa de hijos.
//  - `acumularAguasAbajo(...)`: suma topológica (aguas abajo) parametrizada por
//    el valor propio de cada nodo (UD en HS5, caudal en HS4).
//
// `arbolValido` es `false` (no solo warning) cuando hay: id duplicado, ciclo,
// huérfano (parentId que referencia un id inexistente) o múltiples raíces (más
// de un nodo con parentId===null, salvo que se permita explícitamente). Esto
// impide exportar una ficha "válida" sobre una red rota.
// =============================================================================

import type { Veredicto } from "../pdf/renderFicha";

/** Orden de severidad: `neutral` no degrada; `fail` es el más restrictivo. */
const ORDEN_VEREDICTO: Record<Veredicto, number> = {
  neutral: 0,
  ok: 1,
  warn: 2,
  fail: 3,
};

/** Peor (más restrictivo) de dos veredictos. `neutral` no degrada el resultado. */
export function peor(a: Veredicto, b: Veredicto): Veredicto {
  return ORDEN_VEREDICTO[a] >= ORDEN_VEREDICTO[b] ? a : b;
}

/** Nodo mínimo de un árbol de tramos: id estable + id del padre (o `null` si raíz). */
export interface NodoArbol {
  /** Identificador estable del nodo. */
  id: string;
  /** Id del nodo padre (aguas abajo) o `null` si es raíz. */
  parentId: string | null;
}

/** Opciones de validación del árbol. */
export interface OpcionesArbol {
  /**
   * Si `true`, varias raíces (varios nodos con `parentId===null`) NO invalidan
   * el árbol (se modela un bosque legítimo). Por defecto `false`: la regla
   * estricta es raíz única (p.ej. HS4: la raíz es la acometida).
   */
  permitirMultiRaiz?: boolean;
}

/** Resultado de `validarArbol`: validez endurecida + topología determinista. */
export interface ArbolValidado {
  /**
   * `true` solo si el grafo es un árbol bien formado: sin ids duplicados, sin
   * ciclos, sin huérfanos y (salvo `permitirMultiRaiz`) con una única raíz.
   */
  arbolValido: boolean;
  /** Ids de los hijos por padre (aguas arriba), en orden de entrada (determinista). */
  childrenIds: Map<string, string[]>;
  /**
   * Orden topológico en POST-ORDEN (hijos antes que su padre): hojas → raíz.
   * Determinista. Incluye TODOS los nodos: los no alcanzables desde una raíz
   * (p.ej. por ciclo) se añaden al final en orden de entrada (no se pierden).
   */
  orden: string[];
  /** Ids de los nodos raíz (parentId===null), en orden de entrada. */
  raices: string[];
  /** Avisos explicativos (en español) de cada anomalía detectada. */
  warnings: string[];
}

/**
 * Valida un grafo de tramos `{ id, parentId }[]` como árbol y devuelve, además
 * del veredicto endurecido `arbolValido`, el mapa de hijos y el orden topológico
 * post-orden determinista. NO lanza: las anomalías se reportan vía `warnings` y
 * bajan `arbolValido` a `false`.
 *
 * Anomalías que invalidan el árbol (arbolValido=false):
 *  (a) id duplicado, (b) ciclo, (c) huérfano (parentId inexistente),
 *  (d) múltiples raíces (salvo `permitirMultiRaiz`).
 */
export function validarArbol<T extends NodoArbol>(
  nodos: readonly T[],
  opciones: OpcionesArbol = {},
): ArbolValidado {
  const permitirMultiRaiz = opciones.permitirMultiRaiz ?? false;
  const warnings: string[] = [];
  let arbolValido = true;

  // --- (a) Ids duplicados -----------------------------------------------------
  // Se mapea por id quedándonos con la primera aparición (determinista); cada
  // repetición invalida el árbol y se reporta.
  const nodoPorId = new Map<string, T>();
  for (const t of nodos) {
    if (nodoPorId.has(t.id)) {
      arbolValido = false;
      warnings.push(`Tramo duplicado con id "${t.id}": se ignora la repetición.`);
      continue;
    }
    nodoPorId.set(t.id, t);
  }

  // --- Hijos por padre (orden de entrada) + (c) huérfanos ---------------------
  const childrenIds = new Map<string, string[]>();
  for (const t of nodoPorId.values()) childrenIds.set(t.id, []);
  for (const t of nodos) {
    // Evitar procesar dos veces la rama de un id duplicado (ya avisado).
    if (nodoPorId.get(t.id) !== t) continue;
    if (t.parentId === null) continue;
    if (!nodoPorId.has(t.parentId)) {
      arbolValido = false;
      warnings.push(`El tramo "${t.id}" referencia un padre inexistente "${t.parentId}".`);
      continue;
    }
    childrenIds.get(t.parentId)!.push(t.id);
  }

  // --- (d) Raíces -------------------------------------------------------------
  const raices: string[] = [];
  for (const t of nodos) {
    if (nodoPorId.get(t.id) !== t) continue; // duplicado ya tratado
    if (t.parentId === null) raices.push(t.id);
  }
  if (!permitirMultiRaiz && raices.length > 1) {
    arbolValido = false;
    warnings.push(
      `La red tiene ${raices.length} raíces (${raices.join(", ")}): debe haber una sola ` +
        `raíz (la acometida/colector). Revisa los tramos con padre nulo.`,
    );
  }

  // --- (b) Ciclos -------------------------------------------------------------
  // Se recorre desde cada nodo hacia la raíz por parentId; si se revisita un id
  // o se superan los pasos posibles, hay ciclo.
  const n = nodoPorId.size;
  let hayCiclo = false;
  for (const t of nodoPorId.values()) {
    let cur: string | null = t.id;
    let pasos = 0;
    const visto = new Set<string>();
    while (cur !== null) {
      if (visto.has(cur)) {
        hayCiclo = true;
        warnings.push(`Ciclo detectado en la red de tramos en "${cur}": el grafo no es un árbol.`);
        break;
      }
      visto.add(cur);
      const node = nodoPorId.get(cur);
      if (!node) break; // huérfano (ya reportado): se corta el recorrido
      cur = node.parentId;
      if (++pasos > n + 1) {
        hayCiclo = true;
        break;
      }
    }
    if (hayCiclo) break;
  }
  if (hayCiclo) arbolValido = false;

  // --- Orden topológico post-orden determinista (hojas → raíz) ----------------
  const orden: string[] = [];
  const visitado = new Set<string>();
  const visitarPostorden = (id: string, pila: Set<string>) => {
    if (visitado.has(id) || pila.has(id)) return;
    pila.add(id);
    for (const c of childrenIds.get(id) ?? []) visitarPostorden(c, pila);
    pila.delete(id);
    visitado.add(id);
    orden.push(id);
  };
  // Recorre desde las raíces en orden de entrada.
  for (const t of nodos) {
    if (nodoPorId.get(t.id) !== t) continue;
    if (t.parentId === null) visitarPostorden(t.id, new Set());
  }
  // Nodos no alcanzables (ciclos, huérfanos colgando de huérfanos): al final, en
  // orden de entrada, para no perderlos del resultado.
  for (const t of nodos) {
    if (nodoPorId.get(t.id) !== t) continue;
    if (!visitado.has(t.id)) {
      visitado.add(t.id);
      orden.push(t.id);
    }
  }

  return { arbolValido, childrenIds, orden, raices, warnings };
}

/**
 * Acumulación topológica AGUAS ABAJO (suma): para cada nodo, su valor acumulado
 * = valor propio + Σ valores acumulados de sus hijos. Se recorre en `orden`
 * (post-orden: los hijos ya están calculados cuando se procesa el padre).
 *
 * Parametrizado por `valorPropio(id)`: lo que cada nodo aporta por sí mismo
 * (UD propias en HS5, caudal instantáneo propio en HS4). Determinista.
 */
export function acumularAguasAbajo(
  orden: readonly string[],
  childrenIds: ReadonlyMap<string, string[]>,
  valorPropio: (id: string) => number,
): Map<string, number> {
  const acum = new Map<string, number>();
  for (const id of orden) {
    let suma = valorPropio(id);
    for (const c of childrenIds.get(id) ?? []) suma += acum.get(c) ?? 0;
    acum.set(id, suma);
  }
  return acum;
}
