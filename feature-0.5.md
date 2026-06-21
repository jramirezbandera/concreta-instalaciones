# feature-0.5 — Paridad de UI con "Concreta estructura"

> Pasada de diseño (resultado de `/plan-design-review`, 2026-06-21). Objetivo: que el frontend de
> instalaciones sea **indistinguible** del hermano `concreta-gstack-v2` en tipografía, densidad,
> componentes y polish, para fijar la plantilla visual ANTES de construir HS3.
> Decisión de enfoque: **paridad 1:1, no reinventar** (el hermano es la verdad de diseño).

## Context

feature-0 dejó un *lean shell* funcional pero airoso y con `system-ui`. La comparación visual real
(capturas del hermano vs instalaciones, ambos temas) confirma: los **tokens** ya coinciden (paleta
light/dark, dot-grid, theming), pero **tipografía + densidad + fidelidad de componentes** delatan
que es "otra app". Esta feature cierra ese hueco. No añade lógica de cálculo.

## What already exists (reutilizar del hermano, no reinventar)

- **Tokens de color light/dark** y `canvas-dot-grid` — ya portados en `src/index.css` (coinciden).
- **ThemeProvider + pre-paint** — ya portado, idéntico al hermano.
- **Patrón de layout** (sidebar + topbar + inputs-izq / canvas+resultado-der, drawer móvil + tab
  bar) — ya presente; falta densidad/estilo fino.
- **Componentes fuente en** `concreta-gstack-v2/src/components/ui/` y `components/layout/`:
  `InputLabel`, `HelpTooltip`, `CollapsibleSection`, `Sidebar`, `Topbar`, `PdfPreviewModal`,
  `ModuleIcon`. Son la referencia a portar/calcar.
- **Fuentes Geist** en `concreta-gstack-v2/public/fonts/*.woff2` + bloque `@font-face` de su
  `index.css`.

## Decisiones de diseño (esta revisión)

- **D1 — Enfoque:** paridad 1:1 con el hermano; el target es "screenshot indistinguible", no una
  reinterpretación.
- **D2 — Tipografía:** **vendorizar los `.woff2` de Geist** del hermano (Geist Sans 400/500/600 +
  Geist Mono 400/500) a `public/fonts/`, reponer el `@font-face` y apuntar `--font-sans`/
  `--font-mono` del `@theme` a Geist. Renderizado byte-idéntico, sin dependencia npm nueva, control
  del precache PWA. (Resuelve el hallazgo crítico de Pass 4: `system-ui` = AI-slop #11.)
- **D3 — Acciones del Topbar (plantilla de todos los módulos):** `Ficha PDF` · `Compartir` (copia
  la URL con el estado — `useModuleState` ya serializa a query params) · `Reset` (mover desde el pie
  del panel de inputs al topbar, como el hermano) · toggle de **tema**. **Sin conmutador de
  unidades** (el CTE es SI; no se añade chrome muerto — principio de subtracción).
- **Densidad:** adoptar la escala compacta del hermano (text-xs/sm, paddings `py-1.5`, nav densa).
- **Agrupación de inputs:** adoptar `CollapsibleSection` + `InputLabel` compacto como patrón de
  panel de inputs (HS3 lo necesitará para agrupar por estancia/sistema).

## NOT in scope (diferido, con motivo)

- **Conmutador de unidades** — el CTE es SI; no aplica. (No es un gap, es N/A.)
- **Landing/marketing, páginas /about /pricing /blog** del hermano — instalaciones aún no tiene
  marketing; se hará cuando exista esa necesidad.
- **`IconGridSelector`, `MobileTabBar` avanzados, vistas "simple/pórtico"** — se portarán cuando un
  módulo real (HS3+) los requiera; no antes (subtracción).
- **Lógica de cálculo de cualquier módulo** — fuera de una pasada de diseño.

## Implementation Tasks
Sintetizado de los hallazgos. P1 bloquea "plantilla lista para HS3"; P2 misma rama; P3 follow-up.

- [x] **T1 (P1, human: ~1h / CC: ~10min)** — typography — Vendorizar Geist (.woff2 + `@font-face` + `@theme` font vars)
  - Surfaced by: Pass 4 (AI Slop) — `system-ui` como fuente primaria = blacklist #11
  - Files: `public/fonts/`, `src/index.css`
  - Verify: `getComputedStyle(document.body).fontFamily` empieza por "Geist Sans"; screenshot diff vs hermano
- [x] **T2 (P1, human: ~2h / CC: ~20min)** — density — Ajustar escala de espaciado/densidad a la del hermano
  - Surfaced by: Pass 5 — instalaciones más aireado que el pro-tool del hermano
  - Files: `Sidebar.tsx`, `Topbar.tsx`, `InputLabel.tsx`, `modules/_smoke/ui.tsx`
  - Verify: capturas lado a lado a 1440×900, densidad equivalente
- [x] **T3 (P1, human: ~2h / CC: ~20min)** — components — Portar componentes `ui/` reales del hermano
  - Surfaced by: Pass 5 — fidelidad de componentes (InputLabel compacto, HelpTooltip, CollapsibleSection; refinar PdfPreviewModal)
  - Files: `src/components/ui/`
  - Verify: render en el módulo de humo sin regresiones; lint+build verdes
- [x] **T4 (P2, human: ~1h / CC: ~10min)** — topbar — Topbar: `Compartir`(URL) + `Reset` + tema
  - Surfaced by: D3 — set de acciones de plantilla
  - Files: `Topbar.tsx`, `modules/_smoke/ui.tsx`
  - Verify: Compartir copia la URL con query params; Reset limpia estado; tema conmuta
- [x] **T5 (P2, human: ~45min / CC: ~10min)** — sidebar — Fidelidad de Sidebar (ancho/densidad/group header/pie)
  - Surfaced by: Pass 5 — sidebar más aireado que el hermano
  - Files: `Sidebar.tsx`
  - Verify: visual diff
- [x] **T6 (P2, human: ~1h / CC: ~10min)** — results — Densidad de tabla de resultados + banner de veredicto estilo "RESUMEN"
  - Surfaced by: Pass 5 — results menos denso que el hermano
  - Files: `modules/_smoke/ui.tsx` (ResultsPanel)
  - Verify: visual
- [x] **T7 (P3, human: ~30min / CC: ~10min)** — polish — Pasada de pulido dark-mode tras T1–T6
  - Surfaced by: Pass 6 — verificación visual final
  - Files: `src/index.css`
  - Verify: screenshot diff claro+oscuro vs hermano

## Reference captures (el target real, no mockups)

| Pantalla | Captura | Uso |
|----------|---------|-----|
| Módulo hermano (claro) | `~/.gstack/projects/concreta-instalaciones/designs/parity-20260621/estructura-module-light.png` | Target de tipografía/densidad/componentes |
| Módulo hermano (oscuro) | `…/estructura-module-dark.png` | Target dark |
| Instalaciones actual (claro) | `…/instalaciones-module-light.png` | Estado de partida |
| Instalaciones actual (oscuro) | `…/instalaciones-module-dark.png` | Estado de partida |

## Verification (al terminar T1–T7)

1. `bun run build` + `bun run lint` + `bun run test:run` verdes.
2. Capturar `/_smoke` (claro+oscuro) y comparar lado a lado con las del hermano: tipografía Geist,
   densidad y componentes equivalentes.
3. Exportar la ficha PDF y confirmar que sigue abriendo en Acrobat (sin regresión del camino SVG→PNG).

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 0 | — | — |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 1 | clean | score: 5/10 → 9/10, 3 decisions |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **VERDICT:** DESIGN CLEARED — parity plan is design-complete (5/10 → 9/10); 7 implementation tasks (T1–T7) queued. Eng review not required for a UI-parity pass (no architectural change). Remaining gap to 10/10 is execution of T1–T7, not unresolved design.

NO UNRESOLVED DECISIONS
