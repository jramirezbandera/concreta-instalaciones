# feature-0 — Cimientos compartidos

> Base sobre la que se montan todos los módulos verticales del Tier 1. **Prerrequisito de
> feature-1..4.** Tamaño: una tarea de Modo Planificación.
> Referencias I+D: `IDR-INSTALACIONES.md` §5 (stack), §6 (PDF), §7 (SVG), §8 (ficha), §11
> (arquitectura). Ver innegociables y frontera con estructura en `SPEC.md` §4.

## Objetivo

Dejar el proyecto arrancable y con la infraestructura compartida lista para que un módulo solo
tenga que aportar: su motor `calcular`, su schema, su SVG, su `FichaData` y su UI.

## Alcance

### A. Scaffold y consumo de "Concreta estructura"

- Wire del proyecto reutilizando de la app hermana (NO reescribir): **motor export PDF /
  `renderFicha`**, **theming light/dark + design system**, **config base de proyecto/PWA**.
  Documentar la frontera de importación (paquete/monorepo).
- Stack base (fijar versiones, §5/§6): React 19.2 + React Compiler 1.0 + eslint-plugin-react-hooks
  v6 · Vite · Tailwind v4 (CSS-first, `@tailwindcss/vite`) · Vitest 4 + `@fast-check/vitest` ·
  Zod v4 · `vite-plugin-pwa`.
- Router con **lazy loading** por módulo y **manifest central** de módulos (`{id, título, ruta,
  icono, componente lazy, edición DB}`) que alimenta a la vez el router y el pie de la ficha.

### B. Capa `shared/` específica de instalaciones (nueva, no viene de estructura)

- **Utils de cálculo/unidades:** tipos TS con **sufijos de unidad** en campos para no mezclar
  unidades; helpers de **redondeo solo de presentación** (el motor opera en IEEE-754 doble sin
  redondear). Sin `Date.now`/`Math.random`.
- **Patrón de schema por módulo:** convención Zod v4 con límites físicos/normativos + mensajes en
  ES; validar **antes** de entrar al motor.
- **Tablas CTE como datos:** convención de almacenamiento (`as const`/JSON) **versionado con
  metadatos de procedencia** (DB, edición, fecha, artículo/tabla). Estos metadatos alimentan la
  cita de la ficha.
- **Primitivas SVG compartidas:** componentes declarativos (línea, nodo, cota, etiqueta, flecha)
  que renderizan **solo primitivas planas en px** (compatibles con svg2pdf, §6), con `viewBox` en
  unidades del dominio (mm), `preserveAspectRatio="xMidYMid meet"`, bbox auto-calculado de los
  datos + padding, contenedor fluido (sin width/height fijos). Helpers de **resaltado crítico
  multicanal** (color + grosor + patrón + etiqueta) y ARIA (`role="img"` + `<title>`/`<desc>`).
- **Adaptador `FichaData` → `renderFicha`:** tipo común que cada módulo rellena; dos tablas
  estándar ("Datos de partida" con origen / "Verificación" con veredicto). Cabecera/pie con datos
  de proyecto + nº página + **sello: versión del motor + edición DB**.

### C. UX base

- Layout de módulo: **inputs-izquierda / visual-derecha / resultado** (convención razonable,
  validar con arquitectos — no es regla NN/g). **Feedback inmediato sin botón "calcular".**
- Formularios numéricos: unidad visible, validación inline, defaults CTE sensatos.

## Definición de Hecho

- App arranca, instala como PWA y funciona offline (precache app-shell).
- Un "módulo de humo" de ejemplo recorre el flujo completo: input → `calcular` → SVG → `FichaData`
  → PDF exportado con trazabilidad y veredicto.
- Tests: el andamiaje de snapshot + property-based corre en CI local (Vitest 4).

## Fuera de alcance

Lógica de cualquier módulo real (HS3/HS5/HS4/HE1); cuentas/pagos; backend.
