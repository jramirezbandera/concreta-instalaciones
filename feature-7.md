# feature-7 — Fase B · Módulo patrón: outliner + esquema de columna

> Segunda feature del rediseño `UX-RECONCEPT.md` (§6, §6.1, §7, §11 Fase B). Rediseña la
> **zona de trabajo** de los módulos de formato "cálculo": muere el card-stack con dropdowns
> "Cuelga de" y muere el grafo genérico como hero. El patrón se construye y valida en **HS5**
> y se replica en **HS4**. Los motores NO se tocan (la única excepción permitida es añadir el
> campo opcional `nombre?: string` a los tipos de entrada, que el motor ignora). HS3/HE1 al
> patrón y la vivienda tipo son Fase C.
> Referencia visual validada: maqueta `JustificacionHS5.dc.html`
> (artifact `877b8b8c-…`, decisión cerrada §13.12 del reconcept).

## Objetivo

Al terminar, el usuario edita la red de HS5 (y HS4) en una **tabla densa con jerarquía por
indentación**: una fila por elemento, inputs y resultados en la misma fila, teclado primero
(Enter añade · Tab/Shift-Tab anida/desanida · ↑↓ navega), presets que expanden un cuarto
completo, y un **esquema de columna** compacto (~380 px, plegable) sincronizado con la tabla
(hover fila ↔ resalta elemento; clic elemento ↔ selecciona fila). La tabla manda.

## Alcance

### A. Componente compartido `src/components/outliner/`

`Outliner.tsx` + `tipos.ts`. Treegrid genérico y agnóstico del dominio: recibe la
**proyección plana y ordenada** del árbol (filas con `depth`) y devuelve intenciones; la
semántica del árbol (`parentId`) vive en el módulo.

```ts
export interface OutlinerColumna {
  key: string; header: string; align?: "left" | "right"; width?: string;
}
export type OutlinerCelda =
  | { tipo: "texto"; valor: string; dim?: boolean; mono?: boolean }
  | { tipo: "estado"; veredicto: Veredicto }                      // icono + texto, nunca solo color
  | { tipo: "nombre"; valor: string; onChange(v: string): void }  // editable inline
  | { tipo: "numero"; valor: number | undefined; onChange(v: number): void;
      min?: number; step?: number; unidad?: string }
  | { tipo: "select"; valor: string; opciones: { value: string; label: string }[];
      onChange(v: string): void };
export interface OutlinerFila {
  id: string; depth: number;
  kind: string;            // "tramo" | "aparato" — estilo (aparatos en tono dim)
  anidable: boolean;       // ¿responde a Tab/Shift-Tab?
  borrable: boolean;
  celdas: OutlinerCelda[]; // alineadas con `columnas`
}
export interface OutlinerProps {
  columnas: OutlinerColumna[];
  filas: OutlinerFila[];
  selectedId: string | null;
  onSelect(id: string | null): void;
  onHover?(id: string | null): void;
  onAdd(afterId: string | null): void;   // Enter / botón "+ Añadir"
  onNest(id: string): void;              // Tab
  onUnnest(id: string): void;            // Shift-Tab
  onRemove(id: string): void;            // botón papelera / tecla Supr con fila seleccionada
  etiquetaAdd: string;                   // "+ Añadir tramo"
  toolbar?: ReactNode;                   // presets a la derecha del footer
}
```

- **Teclado** (roving tabindex por fila): ↑↓ mueven la selección · Enter = `onAdd(selectedId)`
  · Tab/Shift-Tab = anidar/desanidar (¡preventDefault solo en filas `anidable`!) · Supr =
  `onRemove` si `borrable`. Los editores inline (inputs/selects nativos) conviven con la
  navegación: las flechas NO roban el foco cuando el foco está dentro de un editor.
- **Colapso**: caret ▾/▸ en filas con descendientes (descendiente = filas siguientes con
  `depth` mayor hasta volver al mismo nivel); estado de colapso interno del componente.
- **ARIA**: `role="treegrid"`, `aria-level`, `aria-expanded`, `aria-selected`; hint de
  teclado en el footer (`Enter añade · Tab anida bajo el anterior · ↑↓ navega`), cifras
  `tabular-nums` a la derecha, unidades en gris junto al valor (lenguaje §9).
- **Sin drag ni multiselección** en esta fase (decisión §13 "Abiertas": se prototipa solo
  teclado; drag se reconsidera con feedback real).
- Tests jsdom + testing-library: Enter añade tras la fila seleccionada; Tab emite `onNest`
  solo en filas anidables; Supr respeta `borrable`; colapso oculta descendientes; las
  flechas no interfieren con un `<input>` enfocado.

### B. Presets de aparatos `src/data/presetsAparatos.ts` (§6.1)

```ts
export interface PresetAparatos {
  key: "bano" | "aseo" | "cocina"; label: string;
  hs5: { tipo: TipoAparato }[];      // Tabla 4.1 — baño/aseo via cuartos AGRUPADOS
  hs4: { tipo: TipoAparatoHS4 }[];   // Tabla 2.1 — siempre desglosado (no hay agrupados)
}
```

- HS5: `bano → [cuarto_bano_cisterna]` · `aseo → [cuarto_aseo_cisterna]` ·
  `cocina → [fregadero_cocina, lavavajillas, lavadora]` (coherente con `hs5Defaults`).
- HS4: desglose equivalente con los `TipoAparatoHS4` reales de `hs4/tablas.ts`
  (baño: lavabo + inodoro cisterna + bañera + bidé si existe; aseo: lavabo + inodoro +
  ducha; cocina: fregadero + lavavajillas + lavadora — verificar literales contra tablas.ts).
- En la UI, aplicar un preset = crear un **ramal/derivación nuevo** con nombre del preset
  ("Ramal baño") + sus aparatos colgando, con ids deterministas (`nextId`). Todo editable
  después: son filas normales.

### C. HS5 — zona de trabajo nueva (patrón)

- **Modelo**: `TramoInput` y `AparatoInput` ganan `nombre?: string` (opcional, el motor lo
  ignora; sin `nombre` la UI enseña el id). Único cambio en `calc.ts`; cero cambios de
  lógica, los snapshots de motor NO se re-blessean.
- **Outliner único** con tramos Y aparatos: tramos según jerarquía `parentId` (raíz =
  colector, depth 0); aparatos como hojas bajo su tramo (`kind: "aparato"`, tono dim, no
  anidables). Columnas HS5: `Elemento` (nombre editable + select de tipo) · `Pend./L` ·
  `UD` (resultado) · `Ø` (resultado, mono) · `Estado` (icono+texto).
  - Enter en fila tramo → nuevo tramo hermano; Enter en fila aparato → nuevo aparato en el
    mismo tramo. Tab = re-parentar bajo el hermano anterior; Shift-Tab = subir al abuelo
    (aparatos: Tab/Shift-Tab los mueve de tramo — al del hermano anterior / al padre del
    tramo actual — o no hacen nada si se complica: decisión del implementador, documentada).
  - La UI impide ciclos por construcción (solo re-parenta a hermano anterior/abuelo).
- **Esquema de columna** (§7, sustituye al grafo; muere `calcularArbol` jerárquico):
  reescritura de `svg.tsx`/`svg-meta.ts` **conservando el contrato externo**
  (`HS5_PDF_SVG_ID`, `hs5NativeSize(result)`, `<HS5SVG result mode width height>`), con
  props nuevas opcionales `selectedId`, `hoverId`, `onSelect(id)`, `etiquetas` (id→nombre).
  Dibujo: bajante(s) vertical(es); un nivel por ramal directo de la bajante (orden de
  `childrenIds`, arriba→abajo) con forjados discontinuos; ticks de aparatos sobre el ramal
  con sus UD; ventilación primaria discontinua sobre cubierta; colector en la base con
  flecha a la arqueta/acometida; etiquetas Ø/UD/pendiente en Geist Mono. Crítico/incumple:
  rojo + trazo grueso + "✗" textual (multicanal WCAG, como hasta ahora). Selección: acento
  `#0284c7` + anillo; hover: refuerzo sutil. El modo `pdf` sigue siendo plano
  (svg2pdf-safe) y sin interactividad.
- **Layout** (maqueta): tabla (flex-1) + panel esquema 380 px plegable a la derecha, con
  pie de selección ("Seleccionado: Ramal cocina — Ø63 ≥ Ø50 mín"); debajo de la tabla,
  `CollapsibleSection` "Ventilación de red (informativa)" (contenido actual) + warnings.
  Móvil: pestañas Tabla / Esquema (MobileTabBar acepta pestañas custom, retro-compatible).
- La ficha PDF no cambia de datos; solo consume el nuevo esquema por el mismo id/tamaño.

### D. HS4 — réplica del patrón

- Mismo outliner y mismo esquema de columna con su dominio: jerarquía
  acometida → tubo de alimentación → montante → derivación particular → derivación de
  aparato; columnas `Elemento` · `L / Δh` · `Q_c` (dm³/s) · `Ø` · `v` (m/s) · `P res.`
  (kPa) · `Estado`. El **recorrido crítico** (`esCritico`) se pinta en rojo en el esquema
  y se marca en la tabla (borde/etiqueta), como exige el contrato del motor.
- `TramoInputHS4`/`AparatoInputHS4` ganan `nombre?`. Contrato SVG conservado
  (`HS4_PDF_SVG_ID`, `hs4NativeSize`); snapshots de `svg.test.tsx` re-blessados (es UI,
  no motor). Presión de acometida y criterio K siguen como formulario corto sobre la tabla.

## Definición de Hecho

- HS5: crear red desde cero SOLO con teclado (Enter/Tab/↑↓) + presets; el esquema refleja
  cada edición al instante; hover/selección sincronizados en ambos sentidos; veredicto y
  dashboard (`progreso`) siguen funcionando; ficha PDF sale con el esquema nuevo.
- HS4 replica el patrón completo con su esquema y recorrido crítico en rojo.
- Los snapshots de MOTORES intactos (ningún `calc.test.ts` re-blessado); los de SVG de HS4
  re-blessados con justificación; suite completa en verde (`bun run test:run`), lint y
  `tsc -b` limpios.
- Tests nuevos: outliner (teclado/colapso/ARIA), integración HS5 (preset → filas → recalc →
  banda de veredicto), sync tabla↔esquema (callbacks), HS4 columnas hidráulicas.
- WCAG AA: estados icono+texto, foco visible en filas, navegación completa por teclado,
  contraste de los grises `dim` sobre blanco.

## Desviaciones registradas (implementación 2026-08-23)

- La celda `estado` del outliner gana `extra?: string` (marcadores textuales junto al
  estado: "◆ crítico", "v fuera de rango", "Ø fuera de serie" en HS4 — mismo canal
  icono+texto, sustituye a los FlagBadge de la tabla vieja).
- HS5: el select de tipo de tramo FUSIONA tipo+disposición del colector (una celda por
  columna): "Colector enterrado" / "Colector colgado".
- HS4: columna única "Mat. / P mín" — material en tramos; en aparatos el modo de presión
  mínima (auto según tipo / grifo 100 kPa / fluxor 150 kPa, antes un checkbox).
- Aparatos NO anidables (opción que el spec dejaba al implementador): se mueven de tramo
  borrando/creando o vía el tramo; Tab solo re-parenta tramos.
- Preset HS4 = derivación particular + una derivación de aparato por aparato (la red real
  de AF); preset HS5 = ramal + aparatos directos.
- Snapshot de `hs4/test/ficha.test.ts` re-blessado SOLO en `nativeW/nativeH` del bloque
  SVG (894×462 → 439×300, geometría del esquema nuevo); ningún valor normativo cambió.

## Fuera de alcance

- **Fase C**: vivienda tipo (los grupos "Planta N · T2" de la maqueta), HS3/HE1 al patrón,
  anejo PDF completo.
- Drag & drop y multiselección en el outliner (se decide con feedback de la validación).
- Cambios de motor más allá de `nombre?` opcional; cambios en `renderFicha`; asistente IA.
