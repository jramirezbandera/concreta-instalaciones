# Área 3 — Visualización SVG en vivo + UX de "herramienta de mesa"

> I+D para app de predimensionado CTE. Diferencial: render SVG en vivo (planta/sección/esquema)
> con el elemento crítico en rojo, que se actualiza mientras el usuario cambia inputs.
> Filosofía: "desk tool, not CYPE".
>
> Fecha de investigación: 2026-06-21. Cada afirmación indica nivel de soporte (alto = doc oficial /
> estándar verificado; medio = consenso de fuentes técnicas reputadas; bajo = opinión/heurística).

---

## 1. Render SVG dinámico en React

### [A3-01] SVG inline en JSX es la opción correcta para gráficos generativos e interactivos
- **Afirmación:** Para esquemas dibujados por código que cambian con los inputs y necesitan interactividad/animación, embebe el `<svg>` directamente en JSX (SVG inline). Da control total sobre styling, animación y manipulación por elemento. Reserva `<img src=...>` o sprites para ilustraciones grandes y estáticas, no para tu render en vivo.
- **Soporte:** alto
- **Fuente(s):** [Strapi — Mastering React SVG Integration](https://strapi.io/blog/mastering-react-svg-integration-animation-optimization); [LogRocket — Guide to SVGs in React](https://blog.logrocket.com/guide-svgs-react/)
- **Nota:** El coste del inline (HTML/DOM más grande) es irrelevante a tu escala de elementos (decenas, no miles). El consejo de "usar `<img>` para SVG grandes" aplica a ilustraciones pesadas, no a esquemas de instalaciones.

### [A3-02] Modela el esquema como datos y deja que React derive el SVG (render declarativo)
- **Afirmación:** No manipules el DOM SVG imperativamente. Mantén el estado de la instalación como datos (nodos, tramos, cotas) y renderiza `<line>`, `<path>`, `<circle>`, `<text>` declarativamente con `.map()`. React reconcilia solo lo que cambia. Esto evita el choque entre el modelo de actualización de D3 (imperativo) y el de React.
- **Soporte:** alto
- **Fuente(s):** [Capital One — Comparison of Data Visualization Libraries for React](https://www.capitalone.com/tech/software-engineering/comparison-data-visualization-libraries-for-react/); [Medium — Canvas, D3 and React setup](https://medium.com/@louisemoxy/my-canvas-d3-and-react-setup-1a325bd4fde5)
- **Nota:** Patrón "D3 para matemáticas, React para el DOM": usa funciones de D3 (escalas, `d3-shape`, `d3-scale`) solo para calcular coordenadas y `d` de paths; React pinta. Verificado como consenso.

### [A3-03] SVG manual basta; no necesitas una librería de charting para esquemas técnicos
- **Afirmación:** Para esquemas de instalaciones (no charts estadísticos) el SVG inline a mano —o con helpers de `d3-shape`/`d3-scale`— es suficiente y más mantenible que adoptar Recharts/Nivo/Victory, que están orientadas a tipos de gráfico predefinidos y no a diagramas arbitrarios.
- **Soporte:** medio
- **Fuente(s):** [Medium — React Charts Built on D3: What should you pick?](https://medium.com/react-courses/react-charts-built-on-d3-what-should-you-pick-rechart-visx-niv-react-vi-or-victory-adc64406caa1); [Capital One](https://www.capitalone.com/tech/software-engineering/comparison-data-visualization-libraries-for-react/)
- **Nota:** Las librerías de chart (Recharts, Victory, Nivo) resuelven ejes/series, no diagramas de fontanería/bajantes. Opinión informada: su abstracción estorbaría más que ayudaría aquí.

### [A3-04] Si necesitas primitivas low-level, visx encaja mejor que D3-en-React puro
- **Afirmación:** visx (Airbnb) ofrece primitivas de bajo nivel (escalas, ejes, shapes, gradientes) que combinan la potencia matemática de D3 con el manejo de DOM de React, soportando render SVG y Canvas. Es la mejor opción intermedia si quieres helpers sin renunciar al control declarativo.
- **Soporte:** medio
- **Fuente(s):** [Medium — React Charts Built on D3](https://medium.com/react-courses/react-charts-built-on-d3-what-should-you-pick-rechart-visx-niv-react-vi-or-victory-adc64406caa1); [Capital One](https://www.capitalone.com/tech/software-engineering/comparison-data-visualization-libraries-for-react/)
- **Nota:** visx tiene curva de aprendizaje notable por su naturaleza low-level. Para esquemas simples, A3-03 (SVG a mano) probablemente gana. Mantén visx como plan B.

### [A3-05] Quédate en SVG: estás muy por debajo del umbral donde Canvas/react-konva aporta
- **Afirmación:** SVG rinde bien hasta ~unos pocos miles de elementos y solo conviene migrar a Canvas (react-konva) al alcanzar el rango ~3.000–5.000 nodos DOM; más de ~5.000 produce lag. Un esquema de instalación tiene decenas de elementos, así que SVG es la elección correcta por accesibilidad y facilidad de desarrollo.
- **Soporte:** alto
- **Fuente(s):** [SVGGenie — SVG vs Canvas vs WebGL (2026)](https://www.svggenie.com/blog/svg-vs-canvas-vs-webgl-performance-2025); [LogRocket — SVG vs Canvas](https://blog.logrocket.com/svg-vs-canvas/); [Hacker News — SVG performance ceiling](https://news.ycombinator.com/item?id=15024190)
- **Nota:** react-konva/Canvas brillan con miles de objetos y animación masiva (no tu caso). Recomendación: empieza en SVG y solo considera Canvas si algún día apareciera un caso con miles de elementos.

### [A3-06] Memoiza la generación de geometría con useMemo dependiente de los inputs
- **Afirmación:** Calcula coordenadas, `d` de paths y layout dentro de `useMemo` con dependencias en los inputs relevantes, de modo que el esquema se recompute solo cuando cambia un input que afecta a la geometría, no en cada render. Aplica `useMemo` solo si el cálculo es perceptiblemente costoso o para estabilizar props hacia hijos en `React.memo`.
- **Soporte:** alto
- **Fuente(s):** [react.dev — useMemo](https://react.dev/reference/react/useMemo); [Feature-Sliced Design — When to useMemo](https://feature-sliced.design/blog/react-usememo-optimization)
- **Nota:** No memoices cálculos triviales. La doc oficial advierte que la mayoría de problemas de rendimiento vienen de fronteras de render débiles, no de hooks olvidados. Para esquemas pequeños, recalcular en cada keystroke suele ser imperceptible.

### [A3-07] Para feedback "en vivo" sin jank, considera debounce ligero y transiciones CSS sobre atributos SVG
- **Afirmación:** El usuario debe ver feedback inmediato al cambiar inputs (heurística de Nielsen: visibilidad del estado del sistema). Para movimientos suaves cuando cambian cotas/posiciones, usa transiciones CSS sobre atributos/transform SVG (animaciones ligeras), reservando D3-transition o librerías de animación solo si necesitas interpolación compleja.
- **Soporte:** medio
- **Fuente(s):** [Strapi — React SVG Animation/Optimization](https://strapi.io/blog/mastering-react-svg-integration-animation-optimization); [NN/g heuristics — Visibility of system status](https://uxpilot.ai/blogs/usability-heuristics)
- **Nota:** Opinión: si el cálculo es muy barato (caso esperado), evita el debounce — el recálculo síncrono por keystroke da la sensación más "viva". Introduce debounce solo si mides jank real.

---

## 2. Diagramas técnicos generados por código

### [A3-08] Estructura el esquema como grafo nodos+tramos con cotas/etiquetas como datos adjuntos
- **Afirmación:** Representa cada instalación como un grafo: nodos (puntos de consumo, derivaciones, bajantes) y tramos (segmentos con longitud, diámetro, caudal). Cada tramo lleva metadatos (Ø, caudal, estado cumple/falla) que se renderizan como `<line>`/`<path>` más `<text>` de etiqueta. Esto desacopla cálculo, layout y render.
- **Soporte:** medio
- **Fuente(s):** [Capital One — Data Viz Libraries for React](https://www.capitalone.com/tech/software-engineering/comparison-data-visualization-libraries-for-react/); patrón estándar de diagramado (yWorks/D3)
- **Nota:** Opinión basada en práctica de diagramado. Para HS4 (fontanería), HS5 (bajantes) y HS3 (ventilación) el modelo nodo/tramo cubre los tres con la misma abstracción.

### [A3-09] Coordenadas calculadas para esquemas con topología fija; layout automático solo si la topología varía mucho
- **Afirmación:** Si la geometría del esquema es predecible (columna de fontanería, sección de muro por capas, vivienda con flechas de flujo), calcula coordenadas tú mismo con un sistema de unidades del dominio (mm/m) → unidades SVG. Reserva layout automático (algoritmos de grafos tipo dagre/ELK) solo para topologías arbitrarias e impredecibles.
- **Soporte:** bajo
- **Fuente(s):** Opinión de ingeniería (no verificada por una sola fuente); consistente con [práctica de diagramado yWorks](https://github.com/yWorks/svg2pdf.js/)
- **Nota:** Opinión no verificada. Para "desk tool" simple, las coordenadas calculadas son más predecibles, más fáciles de exportar a PDF y evitan dependencias pesadas de auto-layout.

### [A3-10] Define un viewBox en unidades del dominio y deja que el SVG escale solo
- **Afirmación:** Establece `viewBox="minX minY width height"` en las unidades de tu cálculo (p. ej. mm) y controla el tamaño de pantalla solo con CSS del contenedor. El viewBox define el sistema de coordenadas y qué porción se ve; separar viewBox (coordenadas internas) de viewport (tamaño en pantalla) te da auto-escalado gratis y dibujas siempre en unidades físicas.
- **Soporte:** alto
- **Fuente(s):** [MDN — preserveAspectRatio](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio); [CSS-Tricks — Scale SVG](https://css-tricks.com/scale-svg/)
- **Nota:** Analogía MDN/Google Maps: viewport = cuánto ocupa en pantalla; viewBox = qué zona miras y a qué zoom. Calcula el viewBox a partir del bounding box del esquema generado para auto-encuadre.

### [A3-11] Usa preserveAspectRatio="xMidYMid meet" (default) para no deformar el esquema técnico
- **Afirmación:** Mantén el valor por defecto `xMidYMid meet`: escala hasta encajar ambas dimensiones (como `background-size: contain`) y centra. Un esquema técnico nunca debe estirarse desproporcionadamente; evita `slice` (recorta) salvo que quieras llenar el contenedor recortando.
- **Soporte:** alto
- **Fuente(s):** [MDN — preserveAspectRatio](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio); [Practical SVG — Sizing and Scaling](https://practical-svg.chriscoyier.net/chapter/practical-svg-ebook-10/)
- **Nota:** `meet` = encaja entero (puede dejar márgenes); `slice` = llena y recorta. Para cotas/diámetros la proporción debe conservarse siempre.

### [A3-12] Auto-encuadre: calcula el bounding box del contenido y añade padding al viewBox
- **Afirmación:** Tras generar la geometría, calcula min/max de X e Y de todos los elementos, añade un margen (padding) y úsalo como viewBox. Así el esquema queda siempre centrado y a tamaño completo aunque cambien las dimensiones del edificio con los inputs, sin recortes ni elementos fuera de cuadro.
- **Soporte:** medio
- **Fuente(s):** [SVGGenie — viewBox guide](https://www.svggenie.com/blog/svg-viewbox-guide); [CSS-Tricks — Scale SVG](https://css-tricks.com/scale-svg/)
- **Nota:** Calcula el bbox a partir de los datos (más robusto y SSR-safe) en vez de `getBBox()` del DOM, que requiere el elemento ya montado.

---

## 3. Resaltado del elemento crítico

### [A3-13] No dependas solo del color: WCAG 1.4.1 exige una pista redundante además del rojo/verde
- **Afirmación:** El color no puede ser el único medio para transmitir información (WCAG 2.x SC 1.4.1, nivel A). El tramo crítico en rojo debe acompañarse de otra señal: etiqueta de texto ("CRÍTICO"/"NO CUMPLE"), icono, grosor de línea distinto, o patrón (trazo discontinuo). ~1 de cada 12 hombres y 1 de cada 200 mujeres tienen deficiencia de visión cromática.
- **Soporte:** alto
- **Fuente(s):** [WCAG 1.4.1 — Use of Color (W3C)](https://wcag.dock.codes/documentation/wcag141/); [AccessGuide — Don't use color alone](https://www.accessguide.io/guide/colorblind)
- **Nota:** Verificado como criterio normativo de accesibilidad. Es además coherente con la cultura técnica (planos usan grosor/trazo, no solo color).

### [A3-14] Aplica codificación redundante: color + forma/patrón/etiqueta directa
- **Afirmación:** La estrategia más efectiva es multi-channel encoding: comunica el estado por varias propiedades visuales a la vez (color + grosor + patrón de trazo + etiqueta directa sobre el elemento, no solo en una leyenda). Para el tramo crítico: rojo + línea más gruesa + "Ø insuficiente" anotado junto al tramo.
- **Soporte:** alto
- **Fuente(s):** [Colorblind.io — Colorblind-Friendly Data Visualization](https://colorblind.io/guides/data-visualization); [DeficiencyView — Accessible Charts](https://deficiencyview.com/blog/color-blind-data-visualization-accessible-charts-guide)
- **Nota:** "Redundante" aquí es deseable, no un defecto. Etiquetar directamente sobre el elemento supera a depender de una leyenda con códigos de color.

### [A3-15] Cumple contraste no textual 3:1 para líneas/elementos que portan significado (WCAG 1.4.11)
- **Afirmación:** Los objetos gráficos necesarios para entender el contenido (líneas de esquema, el tramo crítico, iconos informativos) deben tener ratio de contraste ≥ 3:1 frente a colores adyacentes (WCAG 2.1/2.2 SC 1.4.11, nivel AA). El rojo del tramo crítico debe contrastar tanto con el fondo como con las líneas no críticas.
- **Soporte:** alto
- **Fuente(s):** [W3C — Understanding 1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html); [W3C — G207: 3:1 contrast for icons](https://www.w3.org/WAI/WCAG21/Techniques/general/G207)
- **Nota:** Los 3:1 son umbral: no redondear (2,999:1 no cumple). Elige rojo/verde con suficiente luminancia, no solo tono, para que el contraste se mantenga.

### [A3-16] Elige paletas seguras para daltonismo: evita el par rojo↔verde como única distinción
- **Afirmación:** El par rojo/verde es justo el problema clásico del daltonismo (deuteranopia/protanopia). Si usas rojo=falla y verde=cumple, refuérzalo siempre con icono/etiqueta (A3-13/A3-14) y considera paletas validadas para CVD (p. ej. tonos azul/naranja) o herramientas de simulación para verificar.
- **Soporte:** alto
- **Fuente(s):** [Colorblind.io — Designing for Color Blindness](https://colorblind.io/guides/designing-for-color-blindness); [AudioEye — Design for Color Blindness](https://www.audioeye.com/post/8-ways-to-design-a-color-blind-friendly-website/)
- **Nota:** Mantener rojo/verde es aceptable por convención (cumple/falla) siempre que la pista redundante sea robusta. Simula la vista (deuteranopia) antes de cerrar la paleta.

---

## 4. UX de herramienta de cálculo profesional

### [A3-17] Feedback inmediato es el principio rector (visibilidad del estado del sistema)
- **Afirmación:** Una calculadora exige feedback inmediato y preciso a cada input. Aplica la heurística de Nielsen de visibilidad del estado: el resultado y el esquema deben reaccionar en tiempo real al cambiar valores, sin botón "calcular". Es el corazón del diferencial "se actualiza mientras el usuario cambia inputs".
- **Soporte:** alto
- **Fuente(s):** [UXPin — Calculator Design](https://www.uxpin.com/studio/blog/calculator-design/); [NN/g 10 Usability Heuristics (visibilidad del estado)](https://uxpilot.ai/blogs/usability-heuristics)
- **Nota:** El feedback puede reforzarse con micro-animaciones del esquema (A3-07). Verificado como práctica de diseño de calculadoras.

### [A3-18] Layout input-izquierda / visual-derecha / resultado: válido, pero pruébalo (no hay regla normativa)
- **Afirmación:** El patrón "panel de inputs a la izquierda, visualización a la derecha, resultados destacados" es una convención razonable para herramientas técnicas con escaneo natural izquierda→derecha (causa→efecto). No existe una regla canónica de NN/g que lo prescriba; trátalo como heurística a validar con usuarios reales (arquitectos).
- **Soporte:** bajo
- **Fuente(s):** Opinión no verificada por fuente única; [UX Lift — 12 recomendaciones para calculadoras](https://www.uxlift.org/articles/12-design-recommendations-for-calculator-and-quiz-tools/)
- **Nota:** La búsqueda no encontró respaldo explícito al patrón exacto. Es sólido por convención, pero etiquétalo como decisión de diseño, no como hecho verificado. En pantallas estrechas, apila (inputs arriba, visual abajo).

### [A3-19] Calculadoras se perciben fiables cuando son fáciles de usar; minimiza fricción y clics
- **Afirmación:** Las calculadoras/herramientas son útiles y dignas de confianza cuando son fáciles de usar. Minimiza clics y pasos: inputs con valores por defecto sensatos del CTE, sin modales innecesarios, cálculo automático, y formularios numéricos densos pero con agrupación visual clara por instalación (HS3/HS4/HS5/HE1).
- **Soporte:** medio
- **Fuente(s):** [UX Lift — 12 Design Recommendations for Calculator Tools](https://www.uxlift.org/articles/12-design-recommendations-for-calculator-and-quiz-tools/); [UXPin — Calculator Design](https://www.uxpin.com/studio/blog/calculator-design/)
- **Nota:** Coherente con "desk tool, not CYPE": cero modelado del edificio, defaults inteligentes, resultado al instante.

### [A3-20] Formularios numéricos densos: usa unidades visibles, validación inline y defaults precargados
- **Afirmación:** En formularios numéricos técnicos, muestra la unidad junto a cada campo (m, mm, l/s, Ø), valida en línea con feedback inmediato sobre rangos válidos, y precarga valores típicos. La validación inmediata es indispensable en interfaces de calculadora para que diseño y función vayan alineados.
- **Soporte:** medio
- **Fuente(s):** [UXPin — Calculator Design](https://www.uxpin.com/studio/blog/calculator-design/); [NN/g heuristics — prevención de errores](https://uxpilot.ai/blogs/usability-heuristics)
- **Nota:** La validación inline es parte de "prevención de errores" + "visibilidad del estado". Marca con la misma codificación redundante (A3-14) cuándo un input lleva el cálculo a "no cumple".

---

## 5. Exportar el SVG a PDF (svg2pdf.js)

### [A3-21] svg2pdf.js + jsPDF es la vía JS-only en navegador; verifica compatibilidad de versiones
- **Afirmación:** svg2pdf.js (yWorks) convierte SVG a PDF en el navegador, sin servidor, sobre jsPDF. Desde la v2.x funciona con el jsPDF original (MrRio/parallax), y releases recientes añaden compatibilidad con jsPDF 3.x/4.x manteniendo 2.x. Fija versiones que sepas compatibles entre ambos paquetes.
- **Soporte:** alto
- **Fuente(s):** [GitHub — yWorks/svg2pdf.js](https://github.com/yWorks/svg2pdf.js/); [svg2pdf.js Releases](https://github.com/yWorks/svg2pdf.js/releases)
- **Nota:** Versión vista en el repo: v2.7.0 (enero 2026). Confirma el emparejamiento jsPDF↔svg2pdf en tu `package.json` antes de integrar.

### [A3-22] Las fuentes no básicas deben registrarse en jsPDF ANTES de llamar a svg2pdf
- **Afirmación:** Si usas fuentes/caracteres más allá de las realmente básicas, hay que añadirlas a jsPDF (vía su API de fuentes) antes de invocar svg2pdf; de lo contrario el texto no se renderiza correctamente. Para cotas, diámetros y etiquetas con acentos/símbolos (ej. Ø, ², ³, ñ) esto es crítico.
- **Soporte:** alto
- **Fuente(s):** [GitHub — yWorks/svg2pdf.js (README, sección fonts)](https://github.com/yWorks/svg2pdf.js/)
- **Nota:** El símbolo Ø y superíndices probablemente requieran fuente embebida. Planifica registrar al menos una fuente con cobertura Latin + símbolos técnicos.

### [A3-23] Decide pronto: texto vivo embebido vs. texto convertido a paths (outlines)
- **Afirmación:** Tienes dos estrategias para que el texto del esquema salga fiel en el PDF: (a) mantener `<text>` con la fuente embebida en jsPDF (texto seleccionable/accesible en el PDF), o (b) convertir el texto a paths/outlines, que renderiza idéntico en cualquier dispositivo pero deja de ser seleccionable, buscable y legible por lector de pantalla.
- **Soporte:** alto
- **Fuente(s):** [SVGMaker — SVG Text & Fonts guide](https://svgmaker.io/blogs/svg-text-fonts-complete-guide-to-typography-in-svg); [Kenneth Ormandy — Convert to Outlines](https://kennethormandy.com/list/2023-03-17/); [typst/svg2pdf issue #21 — embed text vs paths](https://github.com/typst/svg2pdf/issues/21)
- **Nota:** Para un PDF de cálculo profesional, texto vivo (a) es preferible por accesibilidad y porque permite copiar valores; outlines (b) es el seguro de "se ve igual siempre" si la gestión de fuentes da problemas. Recomendación: intenta (a) primero.

### [A3-24] Construye el SVG con features que svg2pdf soporta; valida transforms, viewBox y CSS
- **Afirmación:** svg2pdf "no es perfecto"; la conversión no siempre sale como se espera. Versiones recientes ampliaron soporte de transformaciones de viewBox, herencia de fill-rule, `marker orient`, `context-fill`/`context-stroke`, valores RGB en %, y soporte parcial de la propiedad CSS `whitespace` (solo `pre`, sin preservar saltos de línea). Mantén el SVG simple y prueba la conversión real, no solo el render en pantalla.
- **Soporte:** medio
- **Fuente(s):** [svg2pdf.js Releases](https://github.com/yWorks/svg2pdf.js/releases); [GitHub — yWorks/svg2pdf.js](https://github.com/yWorks/svg2pdf.js/)
- **Nota:** Implicación de diseño: evita CSS exótico, multilínea de texto compleja y dependencias de estilos externos; usa atributos de presentación SVG explícitos (stroke, fill, stroke-width) en vez de clases CSS cuando exportes, para máxima fidelidad.

### [A3-25] Usa atributos de presentación inline en lugar de CSS externo de cara al export
- **Afirmación:** Para que el PDF salga fiel, especifica color, grosor y relleno como atributos SVG inline (`stroke`, `fill`, `stroke-width`, `font-size`) en los elementos a exportar, no mediante hojas de estilo CSS externas o clases. Los conversores SVG→PDF resuelven mejor los atributos de presentación que el cascade CSS completo.
- **Soporte:** medio
- **Fuente(s):** [GitHub — yWorks/svg2pdf.js (limitaciones CSS)](https://github.com/yWorks/svg2pdf.js/); [SVGMaker — SVG Text & Fonts](https://svgmaker.io/blogs/svg-text-fonts-complete-guide-to-typography-in-svg)
- **Nota:** Opinión informada por las limitaciones CSS documentadas. Si usas Tailwind/clases para estilizar el SVG en pantalla, plantea un "modo export" que serialice estilos a atributos antes de pasar a svg2pdf.

---

## 6. Accesibilidad y responsive del SVG técnico

### [A3-26] Patrón ARIA fiable: svg + role="img" + <title> + <desc> + aria-labelledby
- **Afirmación:** Para un SVG informativo, el patrón más fiable en navegadores/lectores de pantalla es: `role="img"` en el `<svg>`, un `<title>` y un `<desc>` con `id`, y `aria-labelledby="idTitle idDesc"`. `<title>` da el nombre accesible y `<desc>` la descripción. El texto alternativo debe ser significativo, único y no exceder ~250 caracteres.
- **Soporte:** alto
- **Fuente(s):** [Smashing Magazine — Accessible SVG Patterns](https://www.smashingmagazine.com/2021/05/accessible-svg-patterns-comparison/); [TPGi/Vispero — Using ARIA to enhance SVG accessibility](https://www.tpgi.com/using-aria-enhance-svg-accessibility/)
- **Nota:** Para descripciones largas (esquema complejo), añade una transcripción/tabla de resultados cercana en lugar de meterlo todo en el alt. El esquema visual complementa, no sustituye, los resultados en texto.

### [A3-27] Marca como decorativo (aria-hidden) lo que ya está descrito en texto
- **Afirmación:** Si el esquema solo reexpresa datos ya presentes en la tabla de resultados/inputs, puedes marcar el SVG como `aria-hidden="true"` y omitir title/desc para no duplicar ruido en el árbol de accesibilidad. Decide caso por caso: informativo (A3-26) vs decorativo (aria-hidden).
- **Soporte:** alto
- **Fuente(s):** [Smashing Magazine — Accessible SVG Patterns](https://www.smashingmagazine.com/2021/05/accessible-svg-patterns-comparison/); [CSS-Tricks — Accessible SVGs](https://css-tricks.com/accessible-svgs/)
- **Nota:** Mejor estrategia para una "desk tool": resultados numéricos siempre accesibles en texto/tabla; el SVG como refuerzo visual. Así el dato crítico nunca depende del render gráfico.

### [A3-28] SVG responsive sin alto/ancho fijos: viewBox + contenedor fluido
- **Afirmación:** Para que el esquema escale a cualquier pantalla, evita `width`/`height` fijos en píxeles en el `<svg>`; define el `viewBox` y deja que el contenedor (CSS, %/unidades relativas) determine el tamaño. El SVG se ajusta solo manteniendo proporción, lo que cubre escritorio y tablet del arquitecto.
- **Soporte:** alto
- **Fuente(s):** [CSS-Tricks — Scale SVG](https://css-tricks.com/scale-svg/); [MDN — preserveAspectRatio](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio)
- **Nota:** Combínalo con A3-10/A3-12 (viewBox auto-calculado). En layout responsive, mueve el esquema debajo de los inputs en breakpoints estrechos (ver A3-18).

---

## Resumen de decisiones recomendadas (síntesis)

| Tema | Recomendación | Soporte |
|---|---|---|
| Tecnología de render | SVG inline declarativo en React; D3 solo para matemáticas | alto |
| ¿Librería? | SVG a mano (o visx si hace falta low-level); no charting libs | medio |
| ¿Canvas/konva? | No — muy por debajo del umbral de 3–5k nodos | alto |
| Geometría | `useMemo` derivado de inputs; modelo nodo/tramo como datos | alto |
| Escalado | viewBox en unidades del dominio + `xMidYMid meet` + bbox auto | alto |
| Crítico en rojo | Color + pista redundante (etiqueta/grosor/patrón); 3:1 contraste | alto |
| UX | Feedback inmediato sin botón; defaults CTE; validación inline | alto |
| Layout I/V/R | Convención razonable, validar con usuarios (no es regla NN/g) | bajo |
| Export PDF | svg2pdf.js + jsPDF; fuentes registradas antes; atributos inline | alto |
| Accesibilidad | role="img" + title/desc o aria-hidden; resultados siempre en texto | alto |

---

### Fuentes principales citadas
- MDN — [preserveAspectRatio](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio)
- react.dev — [useMemo](https://react.dev/reference/react/useMemo)
- W3C WAI — [1.4.11 Non-text Contrast](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html), [G207](https://www.w3.org/WAI/WCAG21/Techniques/general/G207)
- WCAG — [1.4.1 Use of Color](https://wcag.dock.codes/documentation/wcag141/)
- yWorks — [svg2pdf.js](https://github.com/yWorks/svg2pdf.js/) y [Releases](https://github.com/yWorks/svg2pdf.js/releases)
- Smashing Magazine — [Accessible SVG Patterns](https://www.smashingmagazine.com/2021/05/accessible-svg-patterns-comparison/)
- TPGi — [ARIA + SVG accessibility](https://www.tpgi.com/using-aria-enhance-svg-accessibility/)
- CSS-Tricks — [Scale SVG](https://css-tricks.com/scale-svg/), [Accessible SVGs](https://css-tricks.com/accessible-svgs/)
- Capital One — [Data Viz Libraries for React](https://www.capitalone.com/tech/software-engineering/comparison-data-visualization-libraries-for-react/)
- LogRocket — [SVG vs Canvas](https://blog.logrocket.com/svg-vs-canvas/), [Guide to SVGs in React](https://blog.logrocket.com/guide-svgs-react/)
- SVGGenie — [SVG vs Canvas vs WebGL (2026)](https://www.svggenie.com/blog/svg-vs-canvas-vs-webgl-performance-2025)
- Colorblind.io — [Data Visualization](https://colorblind.io/guides/data-visualization), [Designing for Color Blindness](https://colorblind.io/guides/designing-for-color-blindness)
- UXPin — [Calculator Design](https://www.uxpin.com/studio/blog/calculator-design/) · UX Lift — [12 Recommendations for Calculator Tools](https://www.uxlift.org/articles/12-design-recommendations-for-calculator-and-quiz-tools/)
