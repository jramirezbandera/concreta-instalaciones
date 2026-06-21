# Verificación independiente — Área 3: Visualización SVG en vivo + UX

> Verificador escéptico. Contraste contra fuentes primarias (MDN, react.dev, W3C/WAI, repo
> yWorks/svg2pdf.js). Fecha de verificación: 2026-06-21.
> Sesgo por defecto: desconfiar. Solo confirmo lo que la fuente primaria respalda.

---

### [A3-01] — OPINIÓN (razonable)
- **Comprobación:** No es una afirmación factual sobre un estándar, sino una recomendación de arquitectura. El consenso técnico (MDN sobre SVG inline en el DOM, prácticas React) respalda que SVG inline da control por elemento para styling/animación/interactividad, mientras `<img src>` lo trata como imagen opaca no manipulable. La distinción es correcta.
- **Fuente verificada:** Coherente con MDN SVG-in-HTML; fuentes citadas (Strapi, LogRocket) son secundarias razonables. No hay norma que "obligue" a una u otra; es decisión de diseño.
- **Corrección:** El soporte etiquetado "alto" es generoso para una recomendación de diseño. Debería ser "medio". El hecho técnico subyacente (inline = manipulable) sí es sólido.
- **Confianza final:** media.

### [A3-02] — OPINIÓN (razonable, bien fundada)
- **Comprobación:** "React para el DOM, D3 para las matemáticas" es un patrón de consenso ampliamente documentado en la comunidad React+D3. No es un estándar normativo. La afirmación sobre el choque entre el modelo imperativo de D3 (selections/enter-update-exit) y el reconciliador declarativo de React es correcta.
- **Fuente verificada:** Consenso de fuentes técnicas (las citadas son secundarias válidas). No verificable contra fuente primaria única porque no es un estándar.
- **Corrección:** Soporte "alto" es defendible como consenso fuerte, aunque es heurística, no norma.
- **Confianza final:** alta (como consenso de práctica).

### [A3-03] — OPINIÓN (razonable)
- **Comprobación:** Juicio de ingeniería. Recharts/Nivo/Victory efectivamente están orientadas a tipos de gráfico predefinidos (series/ejes), no a diagramas arbitrarios. La conclusión es razonable. Etiquetado correctamente como "medio".
- **Fuente verificada:** No factual; depende del caso. Fuentes secundarias.
- **Confianza final:** media.

### [A3-04] — VERIFICADO (parcial)
- **Comprobación:** visx (Airbnb) sí ofrece primitivas low-level (escalas, ejes, shapes, gradientes) y soporta render SVG; combina utilidades de D3 con manejo de DOM de React. Hecho correcto. Matiz: visx renderiza principalmente SVG; el soporte Canvas es limitado/parcial, no un equivalente de primera clase a su SVG.
- **Fuente verificada:** airbnb.io/visx (documentación oficial del proyecto). Las citadas son secundarias.
- **Corrección:** "soportando render SVG y Canvas" — visx es fundamentalmente SVG; el Canvas no es un objetivo central de la librería. Matiz menor.
- **Confianza final:** media.

### [A3-05] — VERIFICADO (heurística defendible, no estándar)
- **Comprobación:** La cifra ~3.000–5.000 nodos como umbral antes de lag y migración a Canvas NO es un estándar, pero es una **heurística defendible y repetida** en múltiples fuentes técnicas. No está inventada: aparece consistentemente. La fuente HN citada ("SVG hits a performance ceiling") existe y respalda el patrón cualitativo; SVGGenie y otras dan el rango 3k–5k. El número exacto depende del hardware/complejidad por nodo, así que es orientativo, no preciso.
- **Fuente verificada:** Hacker News item 15024190 (existe, respalda el "performance ceiling" cualitativo); múltiples blogs de comparación SVG/Canvas dan el rango 3k–5k. No hay benchmark primario canónico de un cuerpo de estándares.
- **Corrección:** El soporte "alto" sobreestima: es heurística de comunidad sin medición autoritativa única. Debería ser "medio". La cifra es razonable y citada, no inventada, pero no debe presentarse como umbral duro. Para una desk tool con decenas de elementos la conclusión (quedarse en SVG) es inequívocamente correcta.
- **Confianza final:** media.

### [A3-06] — VERIFICADO
- **Comprobación:** react.dev confirma que `useMemo` cachea el resultado de un cálculo entre renders y solo recomputa cuando cambian las dependencias (comparadas con `Object.is`). La doc oficial **advierte explícitamente** contra memoizar indiscriminadamente: "You should only rely on useMemo as a performance optimization" y enumera los casos válidos (cálculo notablemente lento + deps que rara vez cambian; prop a componente `memo`; deps de otro hook). La nota del fichero ("no memoices cálculos triviales") es fiel a la doc.
- **Fuente verificada:** https://react.dev/reference/react/useMemo — secciones "Caching", "Should you add useMemo everywhere?".
- **Confianza final:** alta.

### [A3-07] — PARCIAL / OPINIÓN
- **Comprobación:** Las transiciones CSS sobre atributos SVG presentacionales son posibles, pero con un matiz importante: **las transiciones CSS solo animan propiedades presentacionales expuestas a CSS (p. ej. `fill`, `stroke`, `opacity`, y `transform` SVG en navegadores modernos)**; NO animan atributos geométricos como `x`/`y`/`cx`/`d` vía la propiedad `transition` salvo que se usen como propiedades CSS de geometría (soporte parcial). La afirmación "transiciones CSS sobre atributos/transform SVG" es correcta para `transform`/color pero engañosa si se interpreta como "cualquier atributo SVG". La heurística de Nielsen (visibilidad del estado) está bien invocada.
- **Fuente verificada:** MDN — "CSS and SVG" / animación de propiedades de presentación; MDN heurísticas vía NN/g (la fuente uxpilot citada es secundaria, no NN/g oficial).
- **Corrección:** Precisar que transiciones CSS animan transform/color/opacity de forma fiable; los atributos geométricos puros (x, cx, d) tienen soporte desigual y a menudo requieren SMIL, Web Animations API o re-render. La cita "NN/g heuristics" apunta a uxpilot.ai, que NO es NN/g; la fuente primaria es nngroup.com.
- **Confianza final:** media.

### [A3-08] — OPINIÓN (razonable)
- **Comprobación:** Modelar como grafo nodos+tramos es práctica estándar de diagramado, no un estándar verificable. Razonable para HS3/HS4/HS5. Etiquetado "medio" correcto.
- **Fuente verificada:** No factual; "patrón estándar de diagramado" es genérico. La cita yWorks/D3 es de relleno (yWorks no documenta esto en svg2pdf.js).
- **Confianza final:** media.

### [A3-09] — OPINIÓN — no factual
- **Comprobación:** Autoetiquetada como opinión de ingeniería ("bajo", "no verificada"). Razonable: coordenadas calculadas son más predecibles que auto-layout (dagre/ELK) para topologías fijas. dagre/ELK existen y son lo que se cita para auto-layout de grafos; la mención es correcta.
- **Fuente verificada:** No verificable (opinión). La cita a github yWorks/svg2pdf.js es irrelevante a esta afirmación (svg2pdf.js no trata de auto-layout) — cita débil/mal aplicada.
- **Corrección:** Eliminar la cita a svg2pdf.js como respaldo de "práctica de diagramado yWorks"; no la respalda. La heurística en sí es sensata.
- **Confianza final:** media (como opinión razonable).

### [A3-10] — VERIFICADO
- **Comprobación:** MDN confirma la separación viewBox (sistema de coordenadas interno / qué porción se ve) vs viewport (tamaño en pantalla). Definir el viewBox en unidades del dominio y escalar con CSS del contenedor es correcto y produce auto-escalado. La analogía viewport/viewBox es estándar.
- **Fuente verificada:** https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio y MDN viewBox.
- **Confianza final:** alta.

### [A3-11] — VERIFICADO
- **Comprobación:** MDN confirma textualmente que el valor por defecto de `preserveAspectRatio` es **`xMidYMid meet`**. `meet` = "the entire viewBox is visible within the viewport... scaled up as much as possible" (equivale a `contain`); `slice` = "the entire viewport is covered... some of the viewBox will extend beyond the bounds" (recorta). Centrado en xMid/YMid. Todo correcto.
- **Fuente verificada:** https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio — "Default value: xMidYMid meet".
- **Confianza final:** alta.

### [A3-12] — VERIFICADO (técnica correcta)
- **Comprobación:** Calcular min/max de X/Y del contenido + padding → viewBox es técnica correcta de auto-encuadre. La nota de preferir cálculo desde datos sobre `getBBox()` (que requiere el elemento montado en el DOM) es acertada y SSR-safe. No es un estándar normativo, pero la mecánica es correcta.
- **Fuente verificada:** Coherente con MDN viewBox y CSS-Tricks "Scale SVG" (citada). `getBBox()` documentado en MDN (SVGGraphicsElement.getBBox) requiere render.
- **Confianza final:** alta.

### [A3-13] — VERIFICADO (con matiz sobre la fuente del dato estadístico)
- **Comprobación:** WCAG SC 1.4.1 "Use of Color" es **nivel A** (confirmado por W3C) y establece textualmente que "Color is not used as the only visual means of conveying information, indicating an action, prompting a response, or distinguishing a visual element". El núcleo de la afirmación es correcto. PERO: la estadística "~1 de cada 12 hombres y 1 de cada 200 mujeres" **NO aparece en el documento W3C de 1.4.1**; el Understanding solo dice cualitativamente que usuarios con visión parcial y mayores ven mal el color.
- **Fuente verificada:** https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html (Level A, texto del SC). La estadística procede de Colour Blind Awareness (colourblindawareness.org), no de W3C.
- **Corrección:** La cifra es correcta (ver A3-16) pero su atribución implícita al contexto WCAG es imprecisa; la fuente real es Colour Blind Awareness / literatura oftalmológica, no el estándar. Además la URL citada como "WCAG 1.4.1 (W3C)" es `wcag.dock.codes`, que NO es W3C oficial — es un mirror/proyecto de terceros. La fuente primaria correcta es w3.org/WAI.
- **Confianza final:** alta (en el criterio normativo); media en la atribución de fuentes.

### [A3-14] — VERIFICADO / OPINIÓN
- **Comprobación:** "Multi-channel / redundant encoding" (color + forma + patrón + etiqueta directa) es práctica recomendada de visualización accesible y consistente con el espíritu de 1.4.1. La preferencia de etiqueta directa sobre leyenda es buena práctica documentada (data viz). No es un estándar con número, sino consenso de diseño.
- **Fuente verificada:** Consistente con W3C 1.4.1 y guías de data-viz accesible (las citadas son secundarias razonables).
- **Confianza final:** alta (como buena práctica).

### [A3-15] — VERIFICADO
- **Comprobación:** W3C confirma que SC 1.4.11 "Non-text Contrast" exige ratio **≥ 3:1** contra colores adyacentes, **nivel AA**, y aplica a "Parts of graphics required to understand the content" (objetos gráficos necesarios para entender el contenido). La técnica **G207** es suficiente para 1.4.11 y especifica 3:1 para iconos requeridos. Todo correcto, incluida la observación de que 3:1 es umbral estricto (no redondear). El matiz de que el rojo crítico debe contrastar con el fondo Y con las líneas no críticas es coherente con "adjacent colors".
- **Fuente verificada:** https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html (3:1, AA, graphical objects) + https://www.w3.org/WAI/WCAG21/Techniques/general/G207 (Sufficient, 3:1 iconos).
- **Confianza final:** alta.

### [A3-16] — VERIFICADO
- **Comprobación:** El par rojo↔verde es efectivamente el eje problemático de la deficiencia más común (deuteranopia/protanopia, rojo-verde, ligada al X). La prevalencia ~1/12 hombres (≈8%) y ~1/200 mujeres (≈0,5%) está confirmada por Colour Blind Awareness, Vision Center y múltiples fuentes (8% varones / 0,5% mujeres a nivel global). Reforzar con icono/etiqueta y considerar paletas CVD-safe (azul/naranja) o simulación es práctica estándar.
- **Fuente verificada:** colourblindawareness.org/colour-blindness/ (1 in 12 men / 1 in 200 women); visioncenter.org (8% / 0,5%).
- **Corrección:** Ninguna sustancial. Nota: "1 in 200 women" = 0,5%, cifra correcta y consistente.
- **Confianza final:** alta.

### [A3-17] — VERIFICADO / OPINIÓN
- **Comprobación:** "Visibility of system status" es la heurística #1 de Nielsen (NN/g), real y bien citada en concepto. Que una calculadora reactiva (sin botón "calcular") aplique esta heurística es interpretación razonable. No es un estándar con umbral.
- **Fuente verificada:** Heurística #1 de NN/g (nngroup.com/articles/ten-usability-heuristics/). La cita uxpilot.ai es secundaria, NO la fuente primaria NN/g.
- **Corrección:** Citar nngroup.com directamente en vez de uxpilot.ai para "10 Usability Heuristics".
- **Confianza final:** alta (en la heurística); la afirmación de aplicación es opinión razonable.

### [A3-18] — OPINIÓN — no factual (correctamente autoetiquetada)
- **Comprobación:** El fichero ya admite que NO existe regla NN/g que prescriba "inputs izquierda / visual derecha / resultado". Honesto y correcto. El patrón es convención razonable (escaneo izq→der en culturas LTR), no norma. Soporte "bajo" adecuado.
- **Fuente verificada:** No hay fuente primaria que lo prescriba (confirmado por ausencia). Bien marcado como heurística a validar.
- **Confianza final:** alta (en la honestidad del etiquetado).

### [A3-19] — OPINIÓN (razonable)
- **Comprobación:** "Las herramientas se perciben fiables cuando son fáciles de usar / minimizar fricción" es principio general de UX, no estándar. Razonable. Soporte "medio" adecuado. Fuentes secundarias (UX Lift, UXPin).
- **Confianza final:** media.

### [A3-20] — VERIFICADO / OPINIÓN
- **Comprobación:** Unidades visibles junto al campo, validación inline y defaults precargados son buenas prácticas reconocidas de formularios (relacionadas con "prevención de errores", heurística #5 de NN/g, y "visibilidad del estado"). No es un estándar con umbral. Razonable.
- **Fuente verificada:** Coherente con heurísticas NN/g (la cita uxpilot.ai es secundaria, no NN/g). UXPin secundaria.
- **Confianza final:** media-alta (buena práctica).

### [A3-21] — VERIFICADO
- **Comprobación:** Confirmado contra el repo: svg2pdf.js (yWorks) convierte SVG→PDF en navegador sobre jsPDF. Desde la **v2.x ya no depende de un jsPDF forkeado** y funciona con el original MrRio/jsPDF. La versión **v2.7.0** es real, fechada **3 enero 2026**, y v2.7.0 añade compatibilidad con jsPDF 4.x (releases recientes amplían a jsPDF 3.x/4.x manteniendo 2.x). Todo correcto, incluida la nota "v2.7.0 (enero 2026)".
- **Fuente verificada:** https://github.com/yWorks/svg2pdf.js (README) + /releases. v2.7.0, 2026-01-03, compat jsPDF 4.x.
- **Confianza final:** alta.

### [A3-22] — VERIFICADO
- **Comprobación:** El README de svg2pdf.js afirma textualmente: "If you want to use other than really basic fonts and characters you _have to_ add them first before calling `svg2pdf`" (remitiendo a la doc de jsPDF). Exactamente lo que dice la afirmación. La implicación para Ø, ², ³, ñ (registrar fuente con cobertura Latin+símbolos) es correcta.
- **Fuente verificada:** https://github.com/yWorks/svg2pdf.js (README, sección de fuentes).
- **Confianza final:** alta.

### [A3-23] — VERIFICADO (conceptualmente)
- **Comprobación:** Las dos estrategias (texto vivo con fuente embebida vs. convertir a paths/outlines) son reales y la disyuntiva descrita es correcta: outlines = render idéntico en cualquier dispositivo pero pierde selección/búsqueda/lectura por screen reader; texto vivo = seleccionable/accesible pero depende de gestión de fuentes. Es conocimiento estándar de tipografía/PDF, no específico de un estándar normativo. El issue typst/svg2pdf#21 citado trata efectivamente del dilema embed-text-vs-paths.
- **Fuente verificada:** Conocimiento estándar de SVG/PDF; las fuentes citadas (SVGMaker, Kenneth Ormandy, typst issue) son razonables. No contradicho por ninguna fuente primaria.
- **Confianza final:** alta.

### [A3-24] — VERIFICADO
- **Comprobación:** Las release notes de svg2pdf.js confirman TODAS las features citadas: soporte de transformaciones de viewBox para imágenes ráster (v2.3.0), herencia de fill-rule (v2.3.0), atributo marker `orient` + valores `context-fill`/`context-stroke` (v2.3.0), valores RGB en % (v2.3.0), y la propiedad CSS `whitespace: pre` con la salvedad documentada de que **los saltos de línea NO se preservan** (v2.6.0). El "no es perfecto / prueba la conversión real" es coherente con los issues abiertos del repo. Excelente exactitud.
- **Fuente verificada:** https://github.com/yWorks/svg2pdf.js/releases (v2.3.0, v2.6.0).
- **Confianza final:** alta.

### [A3-25] — VERIFICADO / OPINIÓN
- **Comprobación:** Que los conversores SVG→PDF resuelven mejor atributos de presentación inline (stroke, fill, stroke-width, font-size) que el cascade CSS completo es consistente con las limitaciones documentadas de svg2pdf.js (soporte CSS parcial). La recomendación de un "modo export" que serialice estilos a atributos antes de svg2pdf es sensata. Es opinión informada por las limitaciones reales, no un hecho con cita textual única.
- **Fuente verificada:** Consistente con limitaciones de svg2pdf.js (CSS parcial). Buena práctica, no estándar.
- **Confianza final:** media-alta.

### [A3-26] — VERIFICADO
- **Comprobación:** Smashing Magazine ("Accessible SVG Patterns Comparison", 2021) identifica como patrón más fiable (su Patrón 11) exactamente: `<svg>` + `role="img"` + `<title>` + `<desc>` + `aria-labelledby="[idTitle idDesc]"`, descrito como el de resultados más inclusivos en navegadores/lectores. Coincide al detalle con la afirmación. La guía de mantener el alt significativo y breve, y mover descripciones largas a transcripción/tabla, es buena práctica.
- **Fuente verificada:** https://www.smashingmagazine.com/2021/05/accessible-svg-patterns-comparison/ (Pattern 11). (TPGi devolvió 403, no verificado directamente, pero Smashing confirma el patrón).
- **Corrección:** El límite "~250 caracteres" para el alt no es una regla normativa rígida del estándar (no procede de WCAG ni de las fuentes citadas como umbral fijo); es heurística común. Tratarlo como orientación, no como regla dura.
- **Confianza final:** alta (en el patrón ARIA); el "~250 chars" es heurística (media).

### [A3-27] — VERIFICADO
- **Comprobación:** Marcar como `aria-hidden="true"` un SVG decorativo/redundante (cuyo contenido ya está en texto) para no duplicar ruido en el árbol de accesibilidad es práctica estándar y correcta, respaldada por CSS-Tricks "Accessible SVGs" (citada). (Nota: Smashing no cubre este punto, pero CSS-Tricks y la guía general de ARIA sí.) La decisión informativo vs decorativo caso a caso es el enfoque correcto.
- **Fuente verificada:** https://css-tricks.com/accessible-svgs/ (decorativo → aria-hidden) + práctica ARIA estándar (MDN aria-hidden).
- **Confianza final:** alta.

### [A3-28] — VERIFICADO
- **Comprobación:** Para SVG responsive, evitar `width`/`height` fijos en px y dejar que el contenedor (CSS, % / unidades relativas) determine el tamaño mientras el `viewBox` mantiene la proporción es la técnica correcta y estándar (CSS-Tricks "Scale SVG", MDN). Combinado con `preserveAspectRatio` por defecto (`xMidYMid meet`) escala manteniendo proporción. Correcto.
- **Fuente verificada:** https://css-tricks.com/scale-svg/ + MDN preserveAspectRatio/viewBox.
- **Confianza final:** alta.

---

## Tabla resumen

| Afirmación | Veredicto | Confianza | Nota clave |
|---|---|---|---|
| A3-01 | OPINIÓN razonable | media | Soporte "alto" generoso; hecho inline=manipulable correcto |
| A3-02 | OPINIÓN (consenso fuerte) | alta | "D3 mates / React DOM" patrón consensuado |
| A3-03 | OPINIÓN razonable | media | Juicio sobre charting libs, correcto |
| A3-04 | VERIFICADO parcial | media | visx es esencialmente SVG; Canvas marginal |
| A3-05 | VERIFICADO (heurística) | media | 3k–5k defendible y citado, NO estándar; soporte "alto" sobreestima |
| A3-06 | VERIFICADO | alta | react.dev confirma useMemo y "no memoizar trivial" |
| A3-07 | PARCIAL | media | Transiciones CSS: transform/color sí; geometría pura no fiable. Cita NN/g errónea |
| A3-08 | OPINIÓN razonable | media | Cita yWorks irrelevante |
| A3-09 | OPINIÓN no factual | media | Bien autoetiquetada; cita svg2pdf.js mal aplicada |
| A3-10 | VERIFICADO | alta | MDN viewBox/viewport |
| A3-11 | VERIFICADO | alta | MDN: default = xMidYMid meet; meet/slice correctos |
| A3-12 | VERIFICADO técnica | alta | bbox+padding correcto; getBBox requiere montaje |
| A3-13 | VERIFICADO (criterio) | alta/media | 1.4.1 nivel A correcto; estadística NO es de W3C; URL no oficial |
| A3-14 | VERIFICADO/OPINIÓN | alta | Redundant encoding, buena práctica |
| A3-15 | VERIFICADO | alta | 1.4.11 = 3:1, AA, graphical objects; G207 sufficient |
| A3-16 | VERIFICADO | alta | 8% hombres / 0,5% mujeres confirmado |
| A3-17 | VERIFICADO/OPINIÓN | alta | Heurística #1 NN/g; cita uxpilot secundaria |
| A3-18 | OPINIÓN no factual | alta | Honesto: no hay regla NN/g |
| A3-19 | OPINIÓN razonable | media | Principio general UX |
| A3-20 | VERIFICADO/OPINIÓN | media-alta | Buena práctica formularios |
| A3-21 | VERIFICADO | alta | v2.7.0 (2026-01-03) real; jsPDF 4.x compat |
| A3-22 | VERIFICADO | alta | README: "have to add fonts before calling svg2pdf" |
| A3-23 | VERIFICADO | alta | Disyuntiva texto vivo vs outlines correcta |
| A3-24 | VERIFICADO | alta | TODAS las features confirmadas en releases |
| A3-25 | VERIFICADO/OPINIÓN | media-alta | Atributos inline > CSS para export |
| A3-26 | VERIFICADO | alta | = Smashing Pattern 11; "~250 chars" es heurística |
| A3-27 | VERIFICADO | alta | aria-hidden decorativo (CSS-Tricks) |
| A3-28 | VERIFICADO | alta | viewBox + contenedor fluido (CSS-Tricks/MDN) |

---

## ERRORES DETECTADOS

No se detectó ninguna afirmación factual **refutada** (falsa). Los hallazgos son sobreatribuciones de fuente, soporte sobrevalorado y matices técnicos:

1. **A3-13 — Estadística mal atribuida y URL no oficial.** La cifra "~1/12 hombres, 1/200 mujeres" es correcta (ver A3-16) pero **NO procede del documento W3C de 1.4.1**; el Understanding de 1.4.1 no da cifras. Además la fuente citada como "WCAG 1.4.1 (W3C)" es `wcag.dock.codes`, un mirror de terceros, **no W3C oficial**. Corregir a https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html y atribuir la estadística a Colour Blind Awareness. El criterio normativo (nivel A, color no como único medio) sí está verificado.

2. **A3-05 — Soporte sobrevalorado.** El umbral 3.000–5.000 nodos es una **heurística de comunidad defendible y citada**, no inventada, pero NO es un estándar medido por un cuerpo autoritativo. El soporte "alto" debería ser "medio". La conclusión práctica (desk tool con decenas de elementos → quedarse en SVG) es inequívocamente correcta.

3. **A3-07 — Imprecisión técnica + cita errónea.** "Transiciones CSS sobre atributos SVG" es fiable para `transform`/`fill`/`stroke`/`opacity` pero NO para atributos geométricos puros (`x`, `cx`, `d`), que tienen soporte desigual. Y la cita "NN/g heuristics" apunta a uxpilot.ai, que NO es NN/g; la fuente primaria es nngroup.com. (Mismo problema de cita en A3-17 y A3-20.)

4. **A3-04 — Matiz.** "visx soporta render SVG y Canvas": visx es esencialmente una librería SVG; el soporte Canvas es marginal, no equivalente.

5. **A3-09 / A3-08 — Citas de relleno mal aplicadas.** Se cita el repo yWorks/svg2pdf.js como respaldo de "práctica de diagramado / auto-layout", pero svg2pdf.js no trata de eso. Citas irrelevantes que deben retirarse (no afectan a la corrección del contenido, que es opinión razonable).

6. **A3-26 — "~250 caracteres" no es normativo.** El límite del alt es heurística común, no una regla de WCAG ni de las fuentes citadas. Presentar como orientación.

**Citas a fuentes secundarias en lugar de la primaria disponible** (no son errores de hecho, pero debilitan la verificabilidad): A3-13 (wcag.dock.codes en vez de w3.org), A3-07/A3-17/A3-20 (uxpilot.ai en vez de nngroup.com).
