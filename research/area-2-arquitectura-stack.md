# Área 2 — Arquitectura Técnica y Stack

App: PWA de predimensionado de instalaciones CTE (HS3, HS4, HS5, HE1, ...) para arquitectos.
Stack base a reutilizar de "Concreta estructura": React 19 + Vite, Tailwind v4, React Router, lucide-react, jsPDF + svg2pdf.js, PWA estática, theming light/dark.

Sesión I+D — Arquitectura técnica y stack. Fecha de redacción: 2026-06-21.

Leyenda de soporte: **alto** = confirmado con documentación oficial / fuente primaria; **medio** = fuentes reputadas secundarias o inferencia directa de doc oficial; **bajo** = opinión de experiencia / práctica común sin fuente única autoritativa.

---

## 1. React 19 + Vite

### [A2-01] React 19.2 es la versión estable vigente (oct 2025)
- **Afirmación:** Usar React 19 como base. La línea estable es React 19.0 (dic 2024), 19.1 (jun 2025) y 19.2 (1 oct 2025). 19.2 es la última estable a la fecha de esta sesión; es un drop-in seguro sobre 19.x.
- **Soporte:** alto
- **Fuente(s):** https://react.dev/blog/2025/10/01/react-19-2 (React 19.2, 2025-10-01); https://react.dev/blog/2024/12/05/react-19 (React 19 estable, 2024-12-05).
- **Nota:** Para esta app (cliente puro, sin servidor) muchas features "estrella" de React 19 (Server Components, Server Actions, `"use server"`) NO aplican: requieren un framework con servidor (Next.js, etc.). Conviene saberlo para no introducir patrones server-only en una SPA estática.

### [A2-02] Actions, useActionState y useOptimistic son para mutaciones async; uso limitado en esta app
- **Afirmación:** React 19 añade "Actions" (funciones async en transiciones que gestionan pending/error automáticamente) y los hooks `useActionState`, `useOptimistic` y `useFormStatus`. En una app de cálculo determinista síncrono en cliente su utilidad es marginal; reservarlos para flujos async reales (p.ej. exportar/guardar, cargar tablas remotas) si los hubiera.
- **Soporte:** alto
- **Fuente(s):** https://react.dev/blog/2024/12/05/react-19 (sección "Actions", "new hook: useActionState", "useOptimistic"; 2024-12-05).
- **Nota:** El cálculo CTE es síncrono y barato; debe ejecutarse en render/`useMemo`, no envuelto en Actions. Opinión no verificada: meter cálculo síncrono en Actions añade complejidad sin beneficio.

### [A2-03] `use()` para leer promesas/contexto en render
- **Afirmación:** `use(resource)` permite leer una promesa (suspende hasta resolver) o un Context en render, y a diferencia de los hooks puede llamarse condicionalmente. Útil si en el futuro se cargan tablas normativas grandes de forma diferida vía Suspense.
- **Soporte:** alto
- **Fuente(s):** https://react.dev/blog/2024/12/05/react-19 (sección "New API: use"; 2024-12-05).
- **Nota:** Para tablas normativas pequeñas embebidas como JSON no hace falta; sólo si se separan en chunks cargados async.

### [A2-04] React Compiler 1.0 estable — auto-memoización en build
- **Afirmación:** React Compiler alcanzó la 1.0 estable el 2025-10-07. Memoiza automáticamente componentes/hooks en build, reduciendo la necesidad de `useMemo`/`useCallback`/`React.memo` manuales. Soporta React 17+. Recomendado adoptarlo para esta app (render SVG en vivo se beneficia de menos re-renders).
- **Soporte:** alto
- **Fuente(s):** https://react.dev/blog/2025/10/07/react-compiler-1 (React Compiler v1.0, 2025-10-07).
- **Nota:** En Vite se integra vía Babel (`babel-plugin-react-compiler`) dentro de `vite-plugin-react`; hay soporte experimental de SWC. La doc recomienda **fijar versión exacta** (`1.0.0`, no `^1.0.0`) si no hay cobertura E2E sólida, porque cambios futuros de memoización podrían afectar dependencias de efectos.

### [A2-05] ESLint: usar `eslint-plugin-react-hooks` v6 (incluye reglas del compiler)
- **Afirmación:** Desde la RC del compiler, las reglas de linting del compilador se fusionaron en `eslint-plugin-react-hooks` (v6+), con Flat Config por defecto. Adoptar el preset recomendado: detecta violaciones de las Reglas de React (`set-state-in-render`, `set-state-in-effect`, `refs`, etc.). No requiere tener el compiler instalado para usar el lint.
- **Soporte:** alto
- **Fuente(s):** https://react.dev/blog/2025/10/07/react-compiler-1 (sección ESLint; 2025-10-07); https://react.dev/blog/2025/10/01/react-19-2 ("eslint-plugin-react-hooks v6"; 2025-10-01).
- **Nota:** Config Flat: `import reactHooks from 'eslint-plugin-react-hooks'; export default [reactHooks.configs.flat.recommended];`

### [A2-06] Vite como bundler — Vite 8 (Rolldown) es la línea actual; mínimo Vite 7
- **Afirmación:** Vite 8.0 salió el 2026-03-12 con Rolldown (bundler Rust unificado) por defecto, builds 10-30x más rápidos, Node.js 20.19+/22.12+. Vite 7 (jun 2025) ya era ESM-only, Node 20+, target por defecto `baseline-widely-available`. Recomendación: usar Vite 8 si el proyecto hermano lo permite; si hay fricción, Vite 7 es base estable.
- **Soporte:** alto
- **Fuente(s):** https://vite.dev/blog/announcing-vite8 (Vite 8.0, 2026-03-12); https://vite.dev/blog/announcing-vite7 (Vite 7.0, 2025-06-24).
- **Nota:** Vite 8 pesa ~15 MB más en node_modules (lightningcss + Rolldown). Para una "desk tool" estática esto es irrelevante (no afecta al bundle de salida). Target `baseline-widely-available` encaja con usuarios de escritorio modernos.

### [A2-07] Qué evitar en React 19 sobre SPA estática
- **Afirmación:** Evitar: (a) patrones Server Component/Server Action (`"use server"`) sin framework servidor; (b) usar Actions para cálculo síncrono; (c) eliminar memoización manual existente "a ciegas" tras activar el compiler sin tests E2E. Preferir cálculo en funciones puras + `useMemo`/derivación en render.
- **Soporte:** medio
- **Fuente(s):** https://react.dev/blog/2024/12/05/react-19 (alcance de Actions/Server features); https://react.dev/blog/2025/10/07/react-compiler-1 (caveats de migración).
- **Nota:** Opinión de experiencia (no verificada) sobre el orden de adopción.

---

## 2. Tailwind CSS v4

### [A2-08] Tailwind v4 estable (ene 2025) — motor Oxide en Rust
- **Afirmación:** Tailwind CSS v4.0 se publicó el 2025-01-22, reescrito con el motor "Oxide" (Rust): builds completos ~3.8x más rápidos y builds incrementales sin cambios hasta ~182x más rápidos (microsegundos). Apto para HMR fluido en desarrollo de los módulos de cálculo.
- **Soporte:** alto
- **Fuente(s):** https://tailwindcss.com/blog/tailwindcss-v4 (Tailwind CSS v4.0, 2025-01-22).
- **Nota:** —

### [A2-09] Config CSS-first con `@theme` y `@import "tailwindcss"`
- **Afirmación:** v4 sustituye `tailwind.config.js` por configuración en el propio CSS: una sola línea `@import "tailwindcss";` y un bloque `@theme { --color-...: ...; --font-...: ...; }` para tokens de diseño. Los tokens se exponen como variables CSS nativas. Esto facilita el theming light/dark compartido entre módulos vía variables.
- **Soporte:** alto
- **Fuente(s):** https://tailwindcss.com/blog/tailwindcss-v4 (secciones "CSS-first configuration", "CSS theme variables"; 2025-01-22).
- **Nota:** Para light/dark, combinar `@theme` con la variante `dark:` y/o variables redefinidas bajo un selector de tema. (Detalle de implementación: medio — basado en doc general, no en receta oficial concreta.)

### [A2-10] Plugin Vite de primera parte `@tailwindcss/vite` (no PostCSS)
- **Afirmación:** Usar el plugin oficial `@tailwindcss/vite` en `vite.config`, no la ruta PostCSS de v3. Da HMR más rápido y menor overhead. Setup: `plugins: [tailwindcss()]`. v4 también trae detección automática de contenido (escanea plantillas, respeta `.gitignore`, sin `content[]`), con `@source` opcional.
- **Soporte:** alto
- **Fuente(s):** https://tailwindcss.com/blog/tailwindcss-v4 (secciones "first-party Vite plugin", "automatic content detection"; 2025-01-22).
- **Nota:** —

### [A2-11] Gotchas de migración v3→v4 y requisitos de navegador
- **Afirmación:** v4 usa features CSS modernas (cascade layers `@layer`, `@property`, `color-mix()`, propiedades lógicas) y por ello requiere navegadores recientes (Safari 16.4+, Chrome 111+, Firefox 128+ aprox.). Migración con `npx @tailwindcss/upgrade`; gotchas típicos: renombrado de utilidades, cambios en opacidad/colores (OKLCH), `@tailwind` directivas eliminadas. Para una "desk tool" en navegadores actuales no es problema.
- **Soporte:** medio
- **Fuente(s):** https://tailwindcss.com/blog/tailwindcss-v4 (features de plataforma + herramienta de upgrade; 2025-01-22); guía de migración 2026: https://dev.to/pockit_tools/tailwind-css-v4-migration-guide-everything-that-changed-and-how-to-upgrade-2026-5d4
- **Nota:** Versiones exactas de navegador: la fuente blog cita las families pero conviene confirmar los números mínimos en https://tailwindcss.com/docs/compatibility antes de fijar el `browserslist`. (Soporte de los números concretos: medio.)

---

## 3. Motor de cálculo determinista en cliente

### [A2-12] Separar cálculo puro (funciones puras testeables) de la UI
- **Afirmación:** Cada módulo (HS3, HS4, ...) debe exponer su motor como funciones puras `calcular(inputs): resultado` sin dependencias de React/DOM. La UI sólo recoge inputs, llama al motor (en `useMemo`/derivación) y renderiza SVG + PDF. Esto permite testear el motor con Vitest sin montar componentes y reutilizarlo en PDF y pantalla.
- **Soporte:** medio
- **Fuente(s):** Principio general de testing/arquitectura; https://main.vitest.dev/guide/learn/testing-in-practice (preferir testear lógica pura directamente).
- **Nota:** Opinión de arquitectura ampliamente aceptada; sin "fuente única" normativa.

### [A2-13] TypeScript con uniones discriminadas para tipar inputs/resultados y unidades
- **Afirmación:** Usar TypeScript en el motor. Modelar magnitudes con tipos explícitos (p.ej. tipos branded o sufijos de unidad en nombres de campo: `caudal_l_s`, `diametro_mm`) para evitar mezclar unidades. Resultados de validación/cálculo como uniones discriminadas (`{ ok: true, ... } | { ok: false, errores: ... }`).
- **Soporte:** bajo
- **Fuente(s):** Práctica de TypeScript (sin fuente única autoritativa para este dominio).
- **Nota:** Opinión no verificada. Branded types añaden seguridad de unidades a coste de ergonomía; valorar si compensa frente a convención de nombres + tests.

### [A2-14] Tablas normativas CTE como datos (JSON) versionados, no hardcodeadas en lógica
- **Afirmación:** Las tablas del CTE DB-HS/HE (coeficientes, caudales unitarios, diámetros mínimos, etc.) deben vivir como datos estructurados (JSON/TS `as const`) separados del algoritmo, con metadatos de procedencia (documento, versión/fecha de la norma). El motor lee la tabla; cambios normativos = editar datos, no código. Facilita revisión, trazabilidad y tests de la tabla.
- **Soporte:** bajo
- **Fuente(s):** Práctica de arquitectura de datos; sin fuente externa específica del dominio CTE.
- **Nota:** Opinión de experiencia. Recomendable incluir `fuente`/`articulo` en cada entrada para citar en la ficha PDF.

### [A2-15] Precisión numérica: IEEE-754 doble es suficiente; controlar redondeo de presentación
- **Afirmación:** JavaScript usa IEEE-754 doble precisión (53 bits de mantisa). Para predimensionado CTE (precisión de ingeniería, no contabilidad exacta) los `number` nativos bastan; el riesgo real es el redondeo de **presentación** (mostrar/PDF). Definir una política de redondeo explícita y centralizada (p.ej. función `redondear(valor, decimales)`) y redondear sólo al presentar, no en pasos intermedios.
- **Soporte:** medio
- **Fuente(s):** IEEE-754 / comportamiento numérico JS: https://www.javacodegeeks.com/2024/11/handling-floating-point-precision-in-javascript.html ; contexto general floating point JS.
- **Nota:** `decimal.js`/`big.js` sólo si se necesita aritmética decimal exacta (no es el caso típico de predimensionado). Determinismo: el mismo input produce el mismo output salvo que se introduzca `Date.now()`/`Math.random()` — evitarlos en el motor para que sea reproducible y snapshot-testeable.

---

## 4. Estructura modular escalable

### [A2-16] Feature-folders: un directorio por módulo de cálculo + capa shared
- **Afirmación:** Organizar por feature-folder, no por tipo: `src/modules/hs3/{calc.ts, schema.ts, svg.tsx, pdf.ts, ui.tsx, tablas.json, calc.test.ts}`, y una capa `src/shared/` (o `src/lib/`) para lo común: motor PDF (jsPDF + svg2pdf), theming, componentes UI (inputs, layout), helpers de unidades/redondeo. Cada módulo es autocontenido y consume `shared`.
- **Soporte:** bajo
- **Fuente(s):** Patrón de arquitectura modular ampliamente usado; sin fuente única.
- **Nota:** Opinión de experiencia. Ventaja: añadir un módulo nuevo = nueva carpeta + registrarlo en el router, sin tocar los demás.

### [A2-17] Lazy loading por módulo con React Router (code splitting)
- **Afirmación:** Cargar cada módulo de cálculo de forma diferida para que el bundle inicial sea pequeño (sólo home/selector). Con React Router se hace vía `route.lazy` (o `React.lazy` + `Suspense` con fallback). React Router v7.5+ ofrece un `lazy` granular por propiedad de ruta (cargar `Component`/`loader` por separado), permitiendo chunks aún más finos.
- **Soporte:** alto
- **Fuente(s):** https://remix.run/blog/faster-lazy-loading (React Router v7.5+ object-based lazy API); https://remix.run/blog/lazy-loading-routes (route.lazy en v6.4+).
- **Nota:** Para una SPA estática sin SSR, `React.lazy` + `Suspense` por ruta es lo más simple y suficiente; el `route.lazy` granular es optimización adicional. Verificar la versión exacta de React Router del proyecto hermano antes de elegir API.

### [A2-18] Registro centralizado de módulos (manifest) para navegación y PDF compartido
- **Afirmación:** Mantener un manifest/registro (`modules/index.ts`) que liste cada módulo con metadatos (id, título, ruta, icono lucide, componente lazy). El selector de la app y el router se generan a partir de ese registro; el motor PDF recibe el resultado del módulo activo de forma uniforme. Evita switch/case dispersos.
- **Soporte:** bajo
- **Fuente(s):** Patrón de plugin-registry; sin fuente única.
- **Nota:** Opinión de experiencia.

---

## 5. Validación de inputs y testing

### [A2-19] Validación de formularios numéricos: Zod v4 por defecto; Valibot si el tamaño es crítico
- **Afirmación:** Para validar inputs numéricos (rangos, unidades, requeridos) usar un validador de esquema. Zod v4 (2025) es el default seguro (ecosistema, integraciones), con mejoras grandes de rendimiento y "Zod Mini" tree-shakable. Valibot es 10-30x más pequeño (sub-1 KB casos simples) gracias a diseño funcional/tree-shakeable (`pipe(number(), minValue(...), maxValue(...))`) — preferible si el peso del bundle es restricción dura.
- **Soporte:** medio
- **Fuente(s):** https://valibot.dev/guides/comparison/ ; https://www.pkgpulse.com/guides/zod-vs-yup-vs-valibot-2026 ; https://github.com/anatoo/zod-vs-valibot
- **Nota:** Para una desk tool el tamaño no suele ser crítico → Zod por ergonomía y mensajes de error. Decisión: medio (recomendación de fuentes secundarias reputadas, no doc oficial única).

### [A2-20] El esquema de validación define los límites de cada input y mensajes en español
- **Afirmación:** Definir, por módulo, un esquema que codifique límites físicos/normativos de cada input (mín/máx, paso, unidad, obligatoriedad) y mensajes de error localizados (ES). El esquema sirve a la vez para validar y para documentar el rango válido en la UI. Validar antes de llamar al motor; el motor asume inputs ya válidos.
- **Soporte:** bajo
- **Fuente(s):** Práctica; capacidades de Zod/Valibot (`min`/`max`/`number`) citadas en https://valibot.dev/guides/comparison/
- **Nota:** Opinión de arquitectura.

### [A2-21] Testing del motor con Vitest (unit) + snapshots de resultados
- **Afirmación:** Usar Vitest (Vitest 4 salió oct 2025, migración desde Jest muy sencilla) para tests unitarios de las funciones puras de cálculo. Para resultados estructurados, snapshot testing (`toMatchSnapshot`/inline) protege contra cambios no intencionados en la salida; commitear los snapshots y revisarlos en PR. Usar property matchers para campos volátiles si los hubiera.
- **Soporte:** alto
- **Fuente(s):** https://vitest.dev/guide/snapshot (snapshot Vitest); https://main.vitest.dev/guide/learn/testing-in-practice ; https://blog.logrocket.com/vitest-adoption-guide/ (Vitest 4, oct 2025).
- **Nota:** El motor debe ser determinista (ver A2-15) para que los snapshots sean estables.

### [A2-22] Property-based testing con fast-check para invariantes normativos
- **Afirmación:** Complementar los tests por caso con property-based testing usando `@fast-check/vitest`: en lugar de casos fijos, expresar invariantes que deben cumplirse para cualquier input válido (p.ej. "el diámetro resultante nunca es menor que el mínimo normativo", "monotonía: a mayor caudal, diámetro ≥"). fast-check genera cientos de inputs aleatorios reproducibles (`seed`, `numRuns`) para encontrar contraejemplos.
- **Soporte:** alto
- **Fuente(s):** https://www.npmjs.com/package/@fast-check/vitest ; https://www.pkgpulse.com/guides/property-based-testing-fast-check-javascript-2026
- **Nota:** `numRuns` por defecto 100 va bien para funciones puras en memoria. Muy valioso en cálculo normativo para detectar regiones del dominio no cubiertas por casos manuales.

---

## 6. PWA estática

### [A2-23] `vite-plugin-pwa` (zero-config sobre Workbox) para la PWA
- **Afirmación:** Convertir la app en PWA instalable con `vite-plugin-pwa` (oficial del ecosistema Vite, basado en Workbox). Estrategia `generateSW` por defecto: precachea el app-shell (HTML/CSS/JS/imágenes) y genera el manifest + registro del service worker automáticamente. Tiene preset de React.
- **Soporte:** alto
- **Fuente(s):** https://github.com/vite-pwa/vite-plugin-pwa ; https://www.npmjs.com/package/vite-plugin-pwa
- **Nota:** —

### [A2-24] Offline-first: precache del app-shell + actualización controlada
- **Afirmación:** Para una desk tool sin backend, el objetivo es offline total: el app-shell y los assets (incluidas tablas normativas embebidas) se precachean, de modo que tras la primera visita la app funciona sin red. Gestionar actualizaciones con prompt de "nueva versión disponible" (estrategia stale-while-revalidate / `autoUpdate` con aviso) para no servir versiones obsoletas silenciosamente.
- **Soporte:** medio
- **Fuente(s):** https://github.com/vite-pwa/vite-plugin-pwa (estrategias y autoUpdate); https://adueck.github.io/blog/caching-everything-for-totally-offline-pwa-vite-react/ (PWA React totalmente offline).
- **Nota:** Como las tablas CTE pueden actualizarse con la norma, el flujo de actualización del SW es importante: el usuario debe poder recibir la versión nueva. Detalle de UX de update: medio.

### [A2-25] Despliegue estático en CDN; manifest e instalabilidad
- **Afirmación:** Build estático (`vite build`) desplegable en cualquier hosting estático/CDN (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3). Requisitos de instalabilidad PWA: servir por HTTPS, manifest válido (nombre, iconos 192/512, `display: standalone`, `start_url`, theme/background color) y SW registrado — todo lo provee `vite-plugin-pwa`. Cuidar `base` en Vite si se sirve bajo subruta.
- **Soporte:** medio
- **Fuente(s):** https://github.com/vite-pwa/vite-plugin-pwa (generación de manifest + SW); criterios de instalabilidad PWA (estándar web).
- **Nota:** Para una "desk tool" la instalabilidad (icono en escritorio, ventana standalone) es un plus de UX; combinada con offline-first da experiencia tipo app nativa sin servidor.

---

## Resumen de cobertura

- **Soporte alto (confirmado con doc oficial/primaria):** A2-01, A2-02, A2-03, A2-04, A2-05, A2-06, A2-08, A2-09, A2-10, A2-17, A2-21, A2-22, A2-23.
- **Soporte medio:** A2-07, A2-11, A2-12, A2-15, A2-19, A2-24, A2-25.
- **Soporte bajo (opinión/práctica de arquitectura sin fuente única):** A2-13, A2-14, A2-16, A2-18, A2-20.

**Pendiente de verificación más fina antes de fijar en proyecto:**
1. Versión exacta de React Router en la app hermana (determina si se usa `route.lazy` granular v7.5+ o `React.lazy` clásico) — A2-17.
2. Números mínimos de navegador para Tailwind v4 (confirmar en /docs/compatibility) — A2-11.
3. Decisión Zod vs Valibot según restricción real de bundle de la desk tool — A2-19.
4. Recetas concretas de theming light/dark con `@theme` (la doc citada cubre el mecanismo, no la receta exacta dark mode) — A2-09.
