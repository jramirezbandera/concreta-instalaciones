# TODOS — Concreta Instalaciones

## Dedup del editor de tramos + `calcularArbol` de HS4/HS5

**What:** Extraer un `EditorTramos` compartido + `calcularArbol(result, layoutConfig)` y migrar HS4 y HS5 a usarlos.

**Why:** La UI de edición de tramos está inline-duplicada en [hs4/ui.tsx](src/modules/hs4/ui.tsx) y [hs5/ui.tsx](src/modules/hs5/ui.tsx). El layout de árbol `calcularArbol` está duplicado con algoritmo idéntico y constantes distintas en [hs4/svg-meta.ts:66](src/modules/hs4/svg-meta.ts) y [hs5/svg-meta.ts:64](src/modules/hs5/svg-meta.ts) (`COL_W` 88 vs 76, `NODE_W` 78 vs 64, etc.). Las primitivas SVG bajas ya están compartidas en [lib/svg/helpers.ts](src/lib/svg/helpers.ts); lo que falta es el editor y el layout.

**Pros:** Una sola pieza que mantener; futuros módulos de red más baratos.

**Cons:** Toca HS4/HS5 ya auditados; re-bless intencional de los snapshots de SVG de HS4 (`svg.test.tsx` y el `nativeW/nativeH` embebido en `ficha.test.ts.snap`); solo hay 2 consumidores reales del editor libre (HS3 se fue al modelo estructurado), así que la abstracción se informa con 2, no 3.

**Context:** Originalmente office-hours (2026-06-23) bundleó esta extracción con "HS3 completo con el grafo" (Approach A, regla del tres). El eng-review la **desacopló** cuando HS3 eligió el modelo estructurado `colectivos→plantas→estancias` (que NO usa un editor de árbol libre). No existe componente `EditorTramos` hoy. Gate al hacerlo: test de caracterización que mantenga `contentW/contentH`/`nativeW/nativeH` idénticos por módulo (HS4: 894×462); si `ficha.test.ts.snap` se mueve, es regresión, no re-bless.

**Depends on / blocked by:** Nada; cleanup independiente. Idealmente esperar a un tercer consumidor real del editor libre antes de fijar la abstracción.
