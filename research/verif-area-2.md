# Verificación independiente — ÁREA 2: Arquitectura técnica y stack

Verificador independiente y escéptico. Sesgo por defecto: desconfiar. Solo se marca VERIFICADO lo abierto contra fuente oficial.
Fecha de verificación: 2026-06-21.

Fuentes oficiales abiertas: react.dev (3 posts), vite.dev (2 posts), tailwindcss.com (blog v4 + /docs/compatibility), vitest.dev/voidzero, remix.run (React Router blog), github.com/vite-pwa, fast-check.dev, zod.dev/InfoQ.

---

### [A2-01] — VERIFICADO
- **Comprobación:** React 19.2 anunciado el 1 de octubre de 2025 (post oficial). React 19 estable publicado el 5 de diciembre de 2024 (post oficial). La cronología 19.0 (dic 2024) → 19.2 (1 oct 2025) es coherente. 19.2 es la última estable a la fecha de la sesión. El "drop-in" sobre 19.x es opinión razonable (semver minor).
- **Fuente verificada:** https://react.dev/blog/2025/10/01/react-19-2 (fecha 2025-10-01); https://react.dev/blog/2024/12/05/react-19 (2024-12-05).
- **Corrección:** Ninguna. La nota sobre Server Components/Server Actions requiriendo framework con servidor está confirmada por el post de React 19 (documenta `"use server"` y RSC como features de servidor).
- **Confianza final:** alta.

### [A2-02] — VERIFICADO
- **Comprobación:** El post de React 19 documenta "Actions", el hook `useActionState`, `useOptimistic` y `useFormStatus` con ejemplos. Nombres de API exactos confirmados.
- **Fuente verificada:** https://react.dev/blog/2024/12/05/react-19 (secciones Actions, useActionState, useOptimistic, useFormStatus).
- **Corrección:** Ninguna en lo factual. La conveniencia "marginal en esta app" es opinión razonable (cálculo síncrono).
- **Confianza final:** alta.

### [A2-03] — VERIFICADO
- **Comprobación:** El post documenta el API `use()`: lee promesas (suspende hasta resolver) y Context; puede llamarse condicionalmente, a diferencia de los hooks. Confirmado con ejemplos `use(commentsPromise)` y `use(ThemeContext)`.
- **Fuente verificada:** https://react.dev/blog/2024/12/05/react-19 (sección "New API: use").
- **Corrección:** Ninguna.
- **Confianza final:** alta.

### [A2-04] — VERIFICADO
- **Comprobación:** React Compiler 1.0 anunciado el 7 de octubre de 2025. Compatible con React 17 y superior (con `react-compiler-runtime` y target mínimo para 17/18). Integración primaria vía Babel; soporte SWC experimental. La doc recomienda fijar versión exacta (`1.0.0`, no `^1.0.0`) si no hay buena cobertura de tests. Todo confirmado literalmente.
- **Fuente verificada:** https://react.dev/blog/2025/10/07/react-compiler-1 (fecha 2025-10-07; secciones soporte React 17+, Babel/SWC, pinning de versión).
- **Corrección:** Matiz menor: el documento dice "React 17 and up". La afirmación dice "React 17+". Correcto. La integración en Vite vía `vite-plugin-react`/Babel es coherente con que el plugin es Babel-based.
- **Confianza final:** alta.

### [A2-05] — VERIFICADO
- **Comprobación:** Ambos posts oficiales confirman `eslint-plugin-react-hooks` v6: el post de React 19.2 lo menciona con Flat Config por defecto en el preset `recommended`, opt-in de reglas del compiler, y `recommended-legacy`. El post del compiler muestra el Flat Config `reactHooks.configs.flat.recommended` y reglas del compiler integradas en `recommended`/`recommended-latest`. El snippet de la nota coincide con la doc oficial.
- **Fuente verificada:** https://react.dev/blog/2025/10/01/react-19-2 (eslint-plugin-react-hooks v6); https://react.dev/blog/2025/10/07/react-compiler-1 (sección ESLint, Flat Config).
- **Corrección:** Ninguna. "No requiere tener el compiler instalado para usar el lint" es coherente con que las reglas viven en el plugin de hooks.
- **Confianza final:** alta.

### [A2-06] — VERIFICADO
- **Comprobación:** Vite 8.0 publicado el 12 de marzo de 2026, con Rolldown (bundler Rust unificado) por defecto, builds "up to 10-30x faster", Node.js 20.19+/22.12+. Vite 7.0 publicado el 24 de junio de 2025, ESM-only, Node 20.19+/22.12+ (Node 18 EOL), target por defecto `baseline-widely-available`. Todos los datos confirmados literalmente en los posts oficiales.
- **Fuente verificada:** https://vite.dev/blog/announcing-vite8 (2026-03-12, Rolldown, 10-30x, Node 20.19+/22.12+); https://vite.dev/blog/announcing-vite7 (2025-06-24, ESM-only, baseline-widely-available).
- **Corrección:** Matiz: la afirmación dice "Vite 7… Node 20+"; el dato preciso es 20.19+/22.12+ (igual que Vite 8). No es error, es redondeo informal. El "~15 MB más en node_modules" es estimación de la nota, no verificada en fuente oficial (irrelevante para el veredicto).
- **Confianza final:** alta.

### [A2-07] — OPINIÓN (parcialmente factual, base verificada)
- **Comprobación:** La parte factual (Server Components/Actions requieren framework servidor; caveats de migración del compiler) está respaldada por los posts de React 19 y React Compiler 1.0. El orden de adopción y "no eliminar memoización a ciegas" es opinión de experiencia, declarada como tal.
- **Fuente verificada:** https://react.dev/blog/2024/12/05/react-19; https://react.dev/blog/2025/10/07/react-compiler-1.
- **Corrección:** Ninguna. Recomendación razonable.
- **Confianza final:** alta (sobre la base factual); la priorización es juicio.

### [A2-08] — VERIFICADO
- **Comprobación:** Tailwind CSS v4.0 publicado el 22 de enero de 2025. Cifras confirmadas en el blog oficial: full build 378ms→100ms (~3.78x), incremental con nuevo CSS 44ms→5ms (~8.8x), incremental sin nuevo CSS 35ms→192µs (**182x**, en microsegundos). El factor ~182x y el "~3.8x" están confirmados literalmente.
- **Fuente verificada:** https://tailwindcss.com/blog/tailwindcss-v4 (tabla de benchmarks; fecha 2025-01-22).
- **Corrección:** Matiz menor sobre el nombre "Oxide": el post del blog v4.0 **no usa el término "Oxide"** literalmente en el texto recuperado (Oxide fue el nombre interno del motor en las previews v4 alpha/beta). El motor reescrito en Rust sí es real y se documenta. No invalida la afirmación, pero la atribución del nombre "Oxide" a este post concreto no se confirmó en el texto abierto. Las cifras y la fecha son exactas.
- **Confianza final:** alta (fecha y cifras); media (atribución del nombre "Oxide" al post citado).

### [A2-09] — VERIFICADO
- **Comprobación:** El blog v4 documenta config CSS-first: `@import "tailwindcss";` en una línea y bloque `@theme { --font-...; --color-...; }` que expone tokens como variables CSS nativas. Confirmado con ejemplos.
- **Fuente verificada:** https://tailwindcss.com/blog/tailwindcss-v4 (secciones "CSS-first configuration", "CSS theme variables").
- **Corrección:** Ninguna. La receta concreta de dark mode con `@theme` no está detallada en el post (la nota ya lo reconoce como "medio"); correcto autodeclararlo.
- **Confianza final:** alta.

### [A2-10] — VERIFICADO
- **Comprobación:** El blog v4 documenta el plugin de primera parte `@tailwindcss/vite` (`import tailwindcss from "@tailwindcss/vite"`) y la detección automática de contenido (sin `content[]`, respeta `.gitignore`). Confirmado.
- **Fuente verificada:** https://tailwindcss.com/blog/tailwindcss-v4 (secciones first-party Vite plugin, automatic content detection).
- **Corrección:** Ninguna. El uso de `@source` opcional es coherente con la doc de v4 (no contradicho).
- **Confianza final:** alta.

### [A2-11] — VERIFICADO
- **Comprobación:** /docs/compatibility confirma los números mínimos EXACTOS: **Chrome 111, Safari 16.4, Firefox 128**. Coinciden literalmente con la afirmación. La página confirma `color-mix()` y features CSS modernas; menciona también `field-sizing`, `@starting-style`, `text-wrap: balance`. La herramienta `npx @tailwindcss/upgrade` y OKLCH están documentadas en el blog v4.
- **Fuente verificada:** https://tailwindcss.com/docs/compatibility (Chrome 111 / Safari 16.4 / Firefox 128); https://tailwindcss.com/blog/tailwindcss-v4 (upgrade tool, color/OKLCH).
- **Corrección:** Matiz menor: la página /docs/compatibility en el texto recuperado **no enumera explícitamente** `@layer` (cascade layers) ni `@property` como las cita la afirmación; sí enumera `color-mix()` y otras. La afirmación cita "@layer, @property, color-mix(), propiedades lógicas" como base de la incompatibilidad; de esas, solo `color-mix()` quedó confirmado en la fuente abierta. No es refutación (esos features son reales en v4) pero la atribución no se verificó al 100%. Los números de navegador, que eran el dato de alto riesgo, son exactos.
- **Confianza final:** alta (números de navegador); media (lista exacta de features CSS que motivan el requisito).

### [A2-12] — OPINIÓN — no factual
- **Comprobación:** Separar lógica pura testeable de la UI es principio de arquitectura ampliamente aceptado; la propia afirmación se autodeclara "medio / sin fuente única". Razonable y bien justificado para testear con Vitest sin montar componentes.
- **Fuente verificada:** No requiere verificación factual (opinión de arquitectura). La referencia a vitest.dev/guide/learn/testing-in-practice es plausible y consistente.
- **Corrección:** N/A.
- **Confianza final:** alta (como opinión razonable).

### [A2-13] — OPINIÓN — no factual
- **Comprobación:** Branded types / uniones discriminadas en TypeScript para modelar unidades y resultados es práctica válida. Autodeclarada "bajo / opinión no verificada". Razonable; el trade-off ergonomía vs seguridad está bien señalado.
- **Fuente verificada:** No aplica (práctica de TypeScript).
- **Corrección:** N/A.
- **Confianza final:** alta (como opinión razonable).

### [A2-14] — OPINIÓN — no factual
- **Comprobación:** Tablas normativas como datos versionados separados del algoritmo, con metadatos de procedencia, es buena práctica de arquitectura de datos. Autodeclarada "bajo". Razonable y recomendable para trazabilidad CTE.
- **Fuente verificada:** No aplica.
- **Corrección:** N/A.
- **Confianza final:** alta (como opinión razonable).

### [A2-15] — VERIFICADO (base factual) / opinión en lo aplicado
- **Comprobación:** JavaScript usa IEEE-754 doble precisión con 53 bits de mantisa — hecho estándar verificable (ECMAScript Number = binary64 IEEE-754, mantisa de 52 bits explícitos + 1 implícito = 53 efectivos). La recomendación de redondeo de presentación y evitar `Date.now()`/`Math.random()` en el motor es práctica correcta para determinismo.
- **Fuente verificada:** Hecho estándar de ECMAScript/IEEE-754 (binary64, 53 bits de precisión). La fuente citada (javacodegeeks) es secundaria, no autoritativa, pero el dato es correcto y universalmente conocido.
- **Corrección:** Ninguna en el dato. Recomendaría citar la spec ECMAScript en vez de un blog para soporte "alto".
- **Confianza final:** alta (el dato de 53 bits es correcto).

### [A2-16] — OPINIÓN — no factual
- **Comprobación:** Feature-folders + capa shared es patrón modular ampliamente usado. Autodeclarado "bajo". Razonable; la estructura propuesta es coherente y escalable.
- **Fuente verificada:** No aplica.
- **Corrección:** N/A.
- **Confianza final:** alta (como opinión razonable).

### [A2-17] — VERIFICADO
- **Comprobación:** React Router v7.5 introdujo el API granular object-based `route.lazy` (cargar Component/loader/middleware por separado), publicado el 17 de abril de 2025. Confirmado en el blog oficial. La afirmación "v7.5+" es exacta. El `route.lazy` clásico de v6.4+ también es real.
- **Fuente verificada:** https://remix.run/blog/faster-lazy-loading (React Router v7.5, 2025-04-17, granular object-based lazy API).
- **Corrección:** Ninguna. La recomendación de usar `React.lazy`+`Suspense` como base simple es opinión razonable. La nota de verificar la versión exacta del proyecto hermano es prudente.
- **Confianza final:** alta.

### [A2-18] — OPINIÓN — no factual
- **Comprobación:** Manifest/registro centralizado de módulos (plugin-registry) para navegación y PDF uniforme es patrón válido. Autodeclarado "bajo". Razonable; evita switch/case dispersos.
- **Fuente verificada:** No aplica.
- **Corrección:** N/A.
- **Confianza final:** alta (como opinión razonable).

### [A2-19] — VERIFICADO (parcial en lo factual cuantitativo)
- **Comprobación:** Zod v4 (2025) confirmado: stable en 2025 (InfoQ lo fecha en agosto 2025; release notes en zod.dev), con grandes mejoras de rendimiento (14x string, 7x array, 6.5x object parsing vs v3) y "Zod Mini" tree-shakable (~1.9 KB gzip; core ~57% más pequeño). Valibot con diseño funcional tree-shakeable (`pipe(number(), minValue(), maxValue())`) y tamaño sub-KB en casos simples es correcto según su doc. La cifra "Valibot 10-30x más pequeño" proviene de fuentes secundarias, no doc oficial única — autodeclarado "medio".
- **Fuente verificada:** https://zod.dev/v4 y https://www.infoq.com/news/2025/08/zod-v4-available/ (Zod v4 stable 2025, Zod Mini tree-shakable ~1.9KB); https://valibot.dev/guides/comparison/ (diseño funcional/modular).
- **Corrección:** El factor exacto "10-30x más pequeño" para Valibot no se verificó en fuente primaria (varía mucho según el esquema); tratarlo como aproximación de fuentes secundarias. La existencia y características de ambos validadores son correctas.
- **Confianza final:** alta (Zod v4 y Zod Mini); media (factor cuantitativo de Valibot).

### [A2-20] — OPINIÓN — no factual
- **Comprobación:** Esquema por módulo con límites/mensajes ES, validar antes del motor, motor asume inputs válidos: buena práctica. Autodeclarado "bajo". Capacidades `min`/`max`/`number` de Zod/Valibot son reales. Razonable.
- **Fuente verificada:** Capacidades de validadores confirmadas indirectamente (Zod/Valibot soportan min/max/number).
- **Corrección:** N/A.
- **Confianza final:** alta (como opinión razonable).

### [A2-21] — VERIFICADO
- **Comprobación:** Vitest 4.0 publicado en octubre de 2025 (anuncio oficial VoidZero/Vitest fechado el 22 de octubre de 2025). La afirmación dice "oct 2025" — correcto. Snapshot testing (`toMatchSnapshot`/inline) es feature documentada de Vitest. La migración fácil desde Jest es consenso conocido (API compatible).
- **Fuente verificada:** https://vitest.dev/blog/vitest-4 y https://voidzero.dev/posts/announcing-vitest-4 (Vitest 4.0, 2025-10-22); https://vitest.dev/guide/snapshot (snapshot API).
- **Corrección:** Ninguna. La fecha exacta es 22-oct-2025; la afirmación solo dice "oct 2025", correcto.
- **Confianza final:** alta.

### [A2-22] — VERIFICADO
- **Comprobación:** `@fast-check/vitest` es la integración oficial de property-based testing para Vitest (confirmado en fast-check.dev). Soporta `seed` (ej. `test.prop([...], { seed: 4242 })`) y `numRuns`, con default de 100 (default histórico de fast-check core). Genera inputs aleatorios reproducibles por seed. Confirmado.
- **Fuente verificada:** https://fast-check.dev/docs/ecosystem/ (integración Vitest, test.prop); https://fast-check.dev/blog/2025/03/28/beyond-flaky-tests-bringing-controlled-randomness-to-vitest/ (seed reproducible). El default numRuns=100 es el default documentado de fast-check.
- **Corrección:** Ninguna. (npmjs.com/package/@fast-check/vitest devolvió 403; verificado vía fast-check.dev oficial en su lugar.)
- **Confianza final:** alta.

### [A2-23] — VERIFICADO
- **Comprobación:** El repo oficial vite-pwa/vite-plugin-pwa confirma: basado en Workbox, genera service worker con offline (estrategia `generateSW` por defecto), auto-inyecta el Web App Manifest, soporta prompt de nuevo contenido y stale-while-revalidate / autoUpdate, y lista React entre los frameworks soportados (Vanilla, Vue 3, React, Svelte, SolidJS, Preact).
- **Fuente verificada:** https://github.com/vite-pwa/vite-plugin-pwa (Workbox, generateSW, manifest auto-inject, soporte React).
- **Corrección:** Ninguna. "Oficial del ecosistema Vite" es preciso (org vite-pwa).
- **Confianza final:** alta.

### [A2-24] — VERIFICADO (base) / opinión en UX
- **Comprobación:** Offline-first con precache del app-shell y `autoUpdate` + prompt de "nueva versión" / stale-while-revalidate está soportado por vite-plugin-pwa (confirmado en el repo). El diseño UX concreto de actualización es juicio, autodeclarado "medio".
- **Fuente verificada:** https://github.com/vite-pwa/vite-plugin-pwa (autoUpdate, stale-while-revalidate, prompt de nuevo contenido).
- **Corrección:** Ninguna en lo factual. La fuente secundaria (adueck.github.io) no se abrió, pero la capacidad ya está confirmada por la fuente primaria.
- **Confianza final:** alta (capacidades del plugin); media (recomendación UX).

### [A2-25] — VERIFICADO (criterios estándar) / opinión en despliegue
- **Comprobación:** `vite build` produce estático desplegable en CDN (hecho estándar de Vite). Criterios de instalabilidad PWA (HTTPS, manifest válido con iconos 192/512, `display: standalone`, `start_url`, theme/background, SW registrado) son el estándar web de instalabilidad y vite-plugin-pwa genera manifest + SW (confirmado en el repo). El cuidado del `base` en Vite para subrutas es correcto.
- **Fuente verificada:** https://github.com/vite-pwa/vite-plugin-pwa (genera manifest + SW); criterios de instalabilidad = estándar web (W3C Manifest + requisitos de instalación de navegadores).
- **Corrección:** Ninguna. Los criterios de instalabilidad citados coinciden con el estándar (manifest con name, icons incl. 192 y 512, display, start_url; HTTPS; SW). Plataformas de hosting listadas son ejemplos correctos.
- **Confianza final:** alta.

---

## Tabla resumen

| ID | Veredicto | Confianza |
|------|-----------|-----------|
| A2-01 | VERIFICADO | alta |
| A2-02 | VERIFICADO | alta |
| A2-03 | VERIFICADO | alta |
| A2-04 | VERIFICADO | alta |
| A2-05 | VERIFICADO | alta |
| A2-06 | VERIFICADO | alta |
| A2-07 | OPINIÓN (base verificada) | alta |
| A2-08 | VERIFICADO | alta (cifras/fecha) / media (nombre "Oxide") |
| A2-09 | VERIFICADO | alta |
| A2-10 | VERIFICADO | alta |
| A2-11 | VERIFICADO | alta (navegadores) / media (lista features CSS) |
| A2-12 | OPINIÓN — no factual | alta (razonable) |
| A2-13 | OPINIÓN — no factual | alta (razonable) |
| A2-14 | OPINIÓN — no factual | alta (razonable) |
| A2-15 | VERIFICADO | alta |
| A2-16 | OPINIÓN — no factual | alta (razonable) |
| A2-17 | VERIFICADO | alta |
| A2-18 | OPINIÓN — no factual | alta (razonable) |
| A2-19 | VERIFICADO (parcial cuantitativo) | alta (Zod) / media (factor Valibot) |
| A2-20 | OPINIÓN — no factual | alta (razonable) |
| A2-21 | VERIFICADO | alta |
| A2-22 | VERIFICADO | alta |
| A2-23 | VERIFICADO | alta |
| A2-24 | VERIFICADO | alta (plugin) / media (UX) |
| A2-25 | VERIFICADO | alta |

**Recuento:** VERIFICADO: 19 · OPINIÓN (no factual, razonable): 6 · REFUTADO: 0 · PARCIAL puro: 0 · NO VERIFICABLE: 0.
(A2-07 y A2-19 cuentan como VERIFICADO con matiz; A2-07 tiene componente de opinión declarado.)

---

## ERRORES DETECTADOS

No se ha detectado ningún error factual grave (versión inventada, fecha falsa, API inexistente o feature mal atribuida). Las versiones, fechas de release y nombres de API de alto riesgo han resultado EXACTOS contra fuente oficial. Solo hay matices menores de atribución, no refutaciones:

1. **A2-08 (matiz, no error):** Las cifras (3.78x full, 182x incremental sin nuevo CSS) y la fecha (22-ene-2025) son exactas. Sin embargo, el término **"Oxide"** no aparece en el texto del post blog v4.0 citado; "Oxide" fue el nombre interno del motor durante las previews. El motor reescrito en Rust sí es real. Recomendación: no atribuir el nombre "Oxide" a ese post concreto, o citar la doc de las previews donde sí se usó.

2. **A2-11 (matiz, no error):** Los números de navegador (Chrome 111 / Safari 16.4 / Firefox 128) son EXACTOS según /docs/compatibility. Pero esa página, en el texto recuperado, solo confirma `color-mix()` de la lista "@layer, @property, color-mix(), propiedades lógicas"; `@layer` y `@property` no se enumeraron explícitamente allí (sí son features reales de v4). Matiz de atribución de la fuente, no del dato.

3. **A2-19 (parcial cuantitativo):** Zod v4 (2025, stable agosto 2025) y "Zod Mini" tree-shakable están confirmados oficialmente. El factor "Valibot 10-30x más pequeño" procede de fuentes secundarias y no se verificó en fuente primaria; varía mucho según el esquema. Tratar como aproximación, ya autodeclarado "medio".

4. **A2-15 (mejora de fuente, no error):** El dato IEEE-754 doble / 53 bits es correcto, pero la fuente citada es un blog secundario; convendría citar la spec ECMAScript para un soporte verdaderamente "alto".

Notas de proceso: la URL npmjs.com/package/@fast-check/vitest (A2-22) devolvió HTTP 403; se verificó vía fast-check.dev oficial en su lugar. Las fuentes secundarias de A2-24 (adueck.github.io) y A2-19 (pkgpulse, javacodegeeks) no se abrieron, pero las capacidades clave quedaron confirmadas por fuentes primarias.
