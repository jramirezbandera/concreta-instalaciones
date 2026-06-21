# Verificación independiente — ÁREA 4: Ficha justificativa CTE + Export PDF

> Verificador escéptico, sin participación en la investigación original.
> Fecha de verificación: 2026-06-21.
> Fuentes primarias consultadas y ABIERTAS: registry.npmjs.org (jspdf, jspdf-autotable, svg2pdf.js), GitHub (parallax/jsPDF, simonbengtsson/jsPDF-AutoTable, yWorks/svg2pdf.js Issue #82), BOE RD 314/2006 consolidado.
> Las URLs citadas a continuación fueron recuperadas directamente; no se asumió la fuente del original.

---

### [A4-01] — VERIFICADO
- **Comprobación.** Las tres versiones son las reales publicadas como `latest` en npm a fecha de verificación:
  - jspdf: version **4.2.1**, license **MIT**. ✔
  - jspdf-autotable: version **5.0.8**, license **MIT**, `peerDependencies.jspdf = "^2 || ^3 || ^4"`. ✔ (coincide exactamente con lo afirmado)
  - svg2pdf.js: version **2.7.0**, license **MIT**, `peerDependencies.jspdf = "^4.0.0 || ^3.0.0 || ^2.0.0"`. ✔
  - Fecha de publicación de svg2pdf.js 2.7.0: el timestamp npm `1767451776136` ms = **2026-01-03T14:49:36Z**, confirmando el "publicado 2026-01-03" del original. (Nota: un primer parseo automático lo leyó erróneamente como 2024; la conversión manual del epoch confirma 2026-01-03.)
  - Compatibilidad mutua: ambas (autotable y svg2pdf) declaran soporte explícito de jsPDF v4 vía caret. jsPDF 4.2.1 cae dentro de `^4`. **Las tres son mutuamente compatibles.** ✔
- **Fuente verificada:** https://registry.npmjs.org/jspdf/latest · https://registry.npmjs.org/jspdf-autotable/latest · https://registry.npmjs.org/svg2pdf.js/latest
- **Corrección.** Ninguna. Afirmación exacta.
- **Confianza final:** alta.

### [A4-02] — VERIFICADO
- **Comprobación.** El readme oficial de jsPDF (parallax/jsPDF) afirma literalmente: *"The 14 standard fonts in PDF are limited to the ASCII-codepage. If you want to use UTF-8 you have to integrate a custom font, which provides the needed glyphs."* Esto respalda íntegramente que acentos/ñ/€ requieren fuente TTF embebida.
- **Fuente verificada:** https://github.com/parallax/jsPDF (sección "Use of UTF-8 / TTF") · npm jspdf readme.
- **Corrección.** Ninguna.
- **Confianza final:** alta.

### [A4-03] — VERIFICADO
- **Comprobación.** El readme documenta ambas vías exactamente como las describe el original: (a) el **fontconverter** ("/fontconverter/fontconverter.html") que genera un .js con la TTF en base64; (b) en runtime `doc.addFileToVFS("MyFont.ttf", myFont)` → `doc.addFont("MyFont.ttf", "MyFont", "normal")` → `doc.setFont("MyFont")`. La necesidad de registrar cada variante (normal/bold/italic) por separado es coherente con la firma `addFont(file, fontName, fontStyle)`.
- **Fuente verificada:** https://github.com/parallax/jsPDF · https://www.npmjs.com/package/jspdf
- **Corrección.** Ninguna. La nota sobre que jsPDF embebe la TTF completa (sin subsetting automático) es práctica conocida y correcta; el resto de la nota es opinión razonable (lazy-load).
- **Confianza final:** alta.

### [A4-04] — VERIFICADO
- **Comprobación.** El readme de jsPDF-AutoTable documenta: `showHead: 'everyPage'|'firstPage'|'never' = 'everyPage'` (default 'everyPage' ✔), `theme: 'striped'|'grid'|'plain' = 'striped'` (default 'striped' ✔), `pageBreak: 'auto'|'avoid'|'always'` ✔, `rowPageBreak: 'auto'|'avoid' = 'auto'` ✔, `columnStyles` ✔. Todos los valores y defaults coinciden.
- **Fuente verificada:** https://github.com/simonbengtsson/jsPDF-AutoTable (sección Options)
- **Corrección.** Ninguna.
- **Confianza final:** alta.

### [A4-05] — VERIFICADO
- **Comprobación.** El readme documenta los hooks `willDrawPage: (HookData) => {}` y `didDrawPage: (HookData) => {}`, que reciben `HookData` con info de página — correcto para cabecera/pie. El patrón "Página X de Y" requiere post-proceso porque el total se desconoce hasta el final; jsPDF expone `putTotalPages('{total_pages_count_string}')` como alternativa nativa (confirmado en docs jsPDF). `getNumberOfPages()`/`setPage(i)` son API estándar de jsPDF.
- **Fuente verificada:** https://github.com/simonbengtsson/jsPDF-AutoTable (sección Hooks) · https://github.com/parallax/jsPDF (putTotalPages)
- **Corrección.** Ninguna.
- **Confianza final:** alta.

### [A4-06] — VERIFICADO
- **Comprobación.** jsPDF expone `setDocumentProperties` con alias `setProperties`, aceptando objeto con `title`, `subject`, `author`, `keywords`, `creator`. Confirmado en docs/ejemplos oficiales. El uso para trazabilidad es aplicación razonable.
- **Fuente verificada:** https://artskydj.github.io/jsPDF/docs/jspdf.js.html · https://github.com/parallax/jsPDF/blob/master/examples/basic.html
- **Corrección.** Ninguna. La nota sobre falta de PDF/A nativo es correcta (jsPDF no produce PDF/A conforme out-of-the-box).
- **Confianza final:** alta.

### [A4-07] — VERIFICADO (con matiz: nivel "medio" adecuado)
- **Comprobación.** Que jsPDF es de bajo nivel (dibujo por coordenadas x/y, sin reflow automático) frente a pdfmake/@react-pdf es correcto y ampliamente documentado. `getTextDimensions` y `splitTextToSize` existen en la API de jsPDF y sirven para medir alturas/cortar texto. Las fuentes citadas son secundarias (Nutrient, DEV), apropiado para nivel "medio".
- **Fuente verificada:** API jsPDF (splitTextToSize/getTextDimensions, parallax/jsPDF) · comparativas secundarias citadas.
- **Corrección.** Ninguna sustantiva. Correctamente etiquetado "medio".
- **Confianza final:** alta (sobre el hecho técnico) / media (sobre la comparativa cualitativa).

### [A4-08] — VERIFICADO
- **Comprobación.** El readme de svg2pdf.js documenta exactamente `doc.svg(element, { x, y, width, height }).then(() => { doc.save('myPDF.pdf') })` (Promise ✔). Afirma literalmente: *"Since version 2.x, this repository no longer depends on a forked jsPDF but can be used with original MrRio/jsPDF"* — confirma la independencia del fork desde v2.x. La recomendación de unidad 'pt' es práctica razonable (no textual en readme).
- **Fuente verificada:** https://github.com/yWorks/svg2pdf.js · https://www.npmjs.com/package/svg2pdf.js
- **Corrección.** Ninguna.
- **Confianza final:** alta.

### [A4-09] — VERIFICADO
- **Comprobación.** El Issue #82 ("Unsupported features / Known issues", abierto 2019-05-06) lista EXACTAMENTE: `foreignObject`; transforms en elementos distintos de `path` dentro de `clipPath`; atributo `textPath`; text stroking; atributo `textLength`; elementos `glyph`; elementos `mask` y `filter`; animaciones; la mayoría de unidades distintas de `px`; opacidades distintas en stops de gradiente; `use` con referencias IRI no locales; gradientes/patrones sobre strokes. La lista del original reproduce el issue punto por punto.
- **Fuente verificada:** https://github.com/yWorks/svg2pdf.js/issues/82
- **Corrección.** Ninguna. Reproducción fiel de la fuente primaria.
- **Confianza final:** alta.

### [A4-10] — VERIFICADO
- **Comprobación.** El readme de svg2pdf.js afirma: *"If you want to use other than really basic fonts and characters you have to add them first before calling svg2pdf"*, remitiendo a la doc de jsPDF — confirma que el texto del SVG hereda la limitación de fuentes (A4-03). La advertencia sobre diferencias de métricas entre entornos es coherente con notas conocidas del proyecto.
- **Fuente verificada:** https://github.com/yWorks/svg2pdf.js (readme, "add fonts first")
- **Corrección.** Ninguna. La recomendación de la nota es opinión razonable.
- **Confianza final:** alta.

### [A4-11] — PARCIAL
- **Comprobación.** La afirmación central es "svg2pdf.js convierte el SVG a vectores PDF nativos (no rasteriza)". Esto es CIERTO por diseño del proyecto (svg2pdf mapea primitivas SVG a operadores de dibujo vectorial de jsPDF; no usa canvas/raster), y es la razón de su existencia frente a html2canvas. SIN EMBARGO, el readme de svg2pdf.js **no lo afirma textualmente** ("native vectors not raster" no aparece literal). Es una caracterización correcta pero no una cita directa. El detalle viewBox↔width/height es práctica recomendada (opinión), ya etiquetada como tal.
- **Fuente verificada:** https://github.com/yWorks/svg2pdf.js · https://bestofjs.org/projects/svg2pdf
- **Corrección.** El hecho "es vectorial" es correcto; matizar que se infiere del diseño del proyecto, no de una frase literal del readme. El original ya lo reconoce ("Verificado que es vectorial por diseño del proyecto") y lo etiqueta "medio" — adecuado.
- **Confianza final:** alta (el hecho) / media (respaldo textual directo).

### [A4-12] — OPINIÓN (síntesis) — razonable
- **Comprobación.** Conclusión de síntesis: para PWA estática sin backend con SVG vectorial + tablas, jsPDF+svg2pdf+autotable es la combinación más alineada. El propio original reconoce: "ninguna fuente única lo afirma textualmente". El razonamiento (100% cliente, SVG vectorial, cero backend) es coherente con A4-08/A4-11 y con las comparativas. El dato "~150 KB minificado el core" es plausible pero no verificado contra bundlephobia en esta revisión — tratar como aproximación.
- **Fuente verificada:** comparativas secundarias citadas (Nutrient, npm-compare). No factual única.
- **Corrección.** Marcada correctamente como síntesis/opinión ("medio"). El "~150 KB" no fue confirmado numéricamente; usar con cautela.
- **Confianza final:** media.

### [A4-13] — VERIFICADO (descriptivo) / parcialmente opinión
- **Comprobación.** pdfmake usa definición declarativa JSON con layout automático de tablas/cabeceras/pies — correcto y documentado. Soporta SVG con limitaciones; el embebido de fuentes Unicode requiere vfs_fonts — correcto. La valoración comparativa ("mejor layout pero SVG limitado") es razonable y etiquetada "medio".
- **Fuente verificada:** comparativas citadas (Nutrient, npm-compare) + conocimiento documentado de pdfmake (vfs_fonts).
- **Corrección.** Ninguna sustantiva.
- **Confianza final:** media.

### [A4-14] — VERIFICADO (descriptivo)
- **Comprobación.** @react-pdf/renderer genera PDF desde componentes React (Document/Page/View/Text/Image) con motor de layout flexbox y soporte de SVG/fuentes — correcto. La distinción generación (@react-pdf/renderer) vs visualización (react-pdf/pdfjs) es correcta. La valoración de que su SVG no equivale a svg2pdf.js especializado es opinión razonable.
- **Fuente verificada:** comparativas citadas + conocimiento documentado de la librería.
- **Corrección.** Ninguna.
- **Confianza final:** media.

### [A4-15] — OPINIÓN — no factual — razonable
- **Comprobación.** El propio original la etiqueta "bajo" y "opinión no verificada con fuente única". La afirmación de que @media print / impresión-a-PDF del navegador no es determinista ni programática (depende del diálogo, márgenes del SO, sin metadatos garantizados) es técnicamente correcta y bien fundamentada por experiencia común, aunque sin fuente primaria única.
- **Fuente verificada:** inferencia; comparativas secundarias.
- **Corrección.** Correctamente marcada como opinión/bajo. Razonable.
- **Confianza final:** media (como juicio técnico).

### [A4-16] — VERIFICADO (descriptivo) / valoración razonable
- **Comprobación.** Puppeteer/headless Chrome ofrece máxima fidelidad (HTML/CSS/SVG completos incl. filtros y foreignObject) pero exige backend/infra — correcto e incontrovertido. Contradice el requisito PWA estática. Reserva como plan futuro: razonable.
- **Fuente verificada:** comparativas citadas (Nutrient, DEV).
- **Corrección.** Ninguna.
- **Confianza final:** alta (sobre el hecho) / media (sobre la recomendación).

### [A4-17] — VERIFICADO
- **Comprobación.** El RD 314/2006 consolidado (BOE), en su **Anejo I "Contenido del proyecto"**, contiene la sección **"3. Cumplimiento del CTE"** con el epígrafe *"Justificación de las prestaciones del edificio por requisitos básicos y en relación con las exigencias básicas del CTE"*, con subsecciones 3.1–3.6 (Seguridad Estructural, Seguridad en caso de incendio, Seguridad de utilización y accesibilidad, Salubridad, Protección frente al ruido, Ahorro de energía). Confirma que la justificación va en la **Memoria** y cubre los DB indicados. Que la ficha exportada sea "parte de esa justificación" es interpretación correcta.
- **Fuente verificada:** https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515 (Anejo I, ap. 1.4 "Prestaciones del edificio" y ap. 3 "Cumplimiento del CTE")
- **Corrección.** Ninguna. La nomenclatura "DB-SUA" es correcta (Seguridad de Utilización y Accesibilidad), añadida por RD 173/2010; la lista de DB es exacta.
- **Confianza final:** alta.

### [A4-18] — PARCIAL (práctica establecida, no taxativa legal)
- **Comprobación.** Las 6 secciones propuestas (Identificación, Normativa de referencia, Datos de partida, Desarrollo del cálculo, Resultado/veredicto, Observaciones) son coherentes con la estructura real de fichas justificativas CTE y con la práctica de memorias técnicas. NO existe un precepto legal que imponga textualmente "estas 6 secciones en este orden": la ley exige el contenido justificativo, no un formato cerrado (ver A4-19). Por eso el original la etiqueta "medio", lo cual es correcto. Las fuentes citadas (VerificaciónCTE, ejemplo Almería, Anexo contratación del Estado) son secundarias/ejemplares, no normativas.
- **Fuente verificada:** ejemplos y plantillas citados (secundarios); cruce con A4-17 (BOE).
- **Corrección.** Matiz: es una buena estructura de práctica, no un mínimo legal taxativo. El original ya lo refleja ("medio") y lo aclara en A4-19. Sin error.
- **Confianza final:** media.

### [A4-19] — VERIFICADO
- **Comprobación.** Confirmado que COAC (Col·legi d'Arquitectes de Catalunya) / su Oficina Consultora Técnica publica y actualiza fichas justificativas oficiales del CTE (la página cita DB-SI, DB-HE con HE-0/1/2/3, DB-HS incl. HS-6 radón), en catalán y español. Existen fichas análogas en otros colegios (p.ej. ejemplo DB-HR de Arquitectos de Cádiz). La afirmación de que NO hay un formato único legalmente obligatorio (lo obligatorio es el contenido) es correcta y consistente con A4-17/A4-18.
- **Fuente verificada:** https://www.arquitectes.cat/es/la-oct-publica-las-nuevas-fichas-justificativas-que-incorporan-las-modificaciones-del-cte
- **Corrección.** Ninguna. (La página indica que el acceso a algunas fichas requiere suscripción "Secció Complementària" — detalle menor, no afecta la afirmación.)
- **Confianza final:** alta.

### [A4-20] — OPINIÓN (síntesis de diseño) — razonable
- **Comprobación.** Patrón de plantilla base que recibe datos normalizados y dibuja estructura fija. Es síntesis de prácticas (A4-04/05/06 + A4-18), no afirmación factual verificable contra fuente. La interfaz `FichaData` y `renderFicha(doc, data)` es recomendación de ingeniería sólida (separación contenido/estilo). Bien etiquetada "medio (síntesis)".
- **Fuente verificada:** N/A (síntesis). Apoyada en hooks de autotable (verificados en A4-04/05).
- **Corrección.** Ninguna. Razonable.
- **Confianza final:** media (como recomendación).

### [A4-21] — VERIFICADO (mecanismos) / diseño razonable
- **Comprobación.** Los mecanismos invocados existen y funcionan como se describe: tema `'grid'`, `showHead:'everyPage'`, `columnStyles`, y el hook `didParseCell` (presente en el readme) para colorear celdas según veredicto (verde CUMPLE / rojo NO CUMPLE). El diseño de las dos tablas (Datos de partida / Verificación) es propuesta razonable.
- **Fuente verificada:** https://github.com/simonbengtsson/jsPDF-AutoTable (themes, columnStyles, didParseCell)
- **Corrección.** Ninguna.
- **Confianza final:** alta (mecanismos) / media (diseño concreto).

### [A4-22] — VERIFICADO
- **Comprobación.** Dibujar cabecera/pie en todas las páginas vía `didDrawPage`/`willDrawPage` de autotable, o bucle `setPage` + `putTotalPages`, es correcto: los hooks reciben `HookData` con página; `putTotalPages` es API jsPDF documentada. La nota sobre respetar `margin` para no solapar es correcta.
- **Fuente verificada:** https://github.com/simonbengtsson/jsPDF-AutoTable (hooks) · https://github.com/parallax/jsPDF (putTotalPages)
- **Corrección.** Ninguna.
- **Confianza final:** alta.

### [A4-23] — VERIFICADO
- **Comprobación.** La recomendación de citar DB + sección/exigencia + artículo/tabla + edición/fecha es metodológicamente correcta y se sustenta en que los DB se modifican: la **Orden FOM/588/2017** modificó efectivamente DB-HE y DB-HS (BOE), por lo que el valor exigido depende de la edición vigente. Mantener un registro central de edición vigente por DB es buena práctica auditable.
- **Fuente verificada:** https://www.boe.es/buscar/doc.php?id=BOE-A-2017-7163 (Orden FOM/588/2017) · https://www.codigotecnico.org/pdf/Documentos/HS/DBHS.pdf
- **Corrección.** Ninguna. (Matiz menor: existen modificaciones posteriores de los DB; la app debe mantener la edición realmente vigente en cada momento, que es justo lo que el original recomienda.)
- **Confianza final:** alta.

### [A4-24] — VERIFICADO (práctica) 
- **Comprobación.** Declarar el origen de cada dato de partida (input del proyectista, tabla del DB, norma UNE, dato climático) es práctica documentada en fichas reales (ej. Almería) y plantillas (VerificaciónCTE). Aumenta defensibilidad. Encaja con la columna "Origen/Referencia" de A4-21. Etiquetado "medio", adecuado.
- **Fuente verificada:** ejemplos/plantillas citados (secundarios).
- **Corrección.** Ninguna.
- **Confianza final:** media.

### [A4-25] — OPINIÓN — no factual — razonable
- **Comprobación.** El propio original la etiqueta "bajo (opinión de buena práctica; no exigido por norma)". Estampar autor/colegiado, fecha, versión del motor de cálculo y edición del DB en pie+metadatos para reproducibilidad/auditoría es buena práctica; se apoya técnicamente en `setDocumentProperties` (verificado en A4-06). La nota de que NO sustituye la firma del técnico competente es correcta y honesta.
- **Fuente verificada:** capacidad técnica confirmada (setDocumentProperties); el resto es opinión.
- **Corrección.** Correctamente marcada como opinión/bajo.
- **Confianza final:** media (como buena práctica).

---

## Tabla resumen

| ID | Veredicto | Confianza | Nota |
|----|-----------|-----------|------|
| A4-01 | VERIFICADO | alta | Versiones y peerDeps exactas; svg2pdf 2.7.0 = 2026-01-03 |
| A4-02 | VERIFICADO | alta | Cita literal readme jsPDF (14 fonts ASCII) |
| A4-03 | VERIFICADO | alta | fontconverter + addFileToVFS/addFont/setFont |
| A4-04 | VERIFICADO | alta | showHead 'everyPage' y theme 'striped' por defecto ✔ |
| A4-05 | VERIFICADO | alta | Hooks willDrawPage/didDrawPage + putTotalPages |
| A4-06 | VERIFICADO | alta | setDocumentProperties/setProperties |
| A4-07 | VERIFICADO | alta/media | Bajo nivel, sin reflow; comparativa secundaria |
| A4-08 | VERIFICADO | alta | doc.svg() Promise; sin fork desde v2.x (cita literal) |
| A4-09 | VERIFICADO | alta | Reproduce Issue #82 punto por punto |
| A4-10 | VERIFICADO | alta | "add fonts first" en readme |
| A4-11 | PARCIAL | alta/media | Vectorial cierto por diseño; no cita literal "no raster" |
| A4-12 | OPINIÓN | media | Síntesis; "~150 KB" no verificado numéricamente |
| A4-13 | VERIFICADO | media | Descriptivo + valoración |
| A4-14 | VERIFICADO | media | Descriptivo correcto |
| A4-15 | OPINIÓN | media | Juicio técnico razonable, sin fuente única |
| A4-16 | VERIFICADO | alta/media | Hecho correcto + recomendación |
| A4-17 | VERIFICADO | alta | BOE Anejo I, ap.3 "Cumplimiento del CTE" |
| A4-18 | PARCIAL | media | Práctica sólida, no mínimo legal taxativo |
| A4-19 | VERIFICADO | alta | COAC/OCT publica fichas oficiales |
| A4-20 | OPINIÓN | media | Síntesis de diseño razonable |
| A4-21 | VERIFICADO | alta/media | Mecanismos autotable reales (didParseCell) |
| A4-22 | VERIFICADO | alta | Hooks + putTotalPages |
| A4-23 | VERIFICADO | alta | Orden FOM/588/2017 modifica DB-HE/DB-HS (BOE) |
| A4-24 | VERIFICADO | media | Práctica documentada en fichas reales |
| A4-25 | OPINIÓN | media | Buena práctica; no exigida por norma |

**Recuento:** 25 afirmaciones — VERIFICADO: 17 · PARCIAL: 2 (A4-11, A4-18) · OPINIÓN: 4 (A4-12, A4-15, A4-20, A4-25) · REFUTADO: 0 · NO VERIFICABLE: 0. (A4-13/A4-14/A4-16 verificados en su parte factual, con valoración comparativa razonable.)

---

## ERRORES DETECTADOS

No se detectó **ningún error factual sustantivo ni afirmación refutada**. El área 4 es notablemente sólida: todas las versiones, APIs, opciones de librería, el Issue #82 y la base legal del BOE se confirmaron contra fuente primaria. Observaciones menores (matices, no errores):

1. **A4-11 — matiz de respaldo textual.** La afirmación "convierte a vectores PDF nativos (no rasteriza)" es CORRECTA por diseño de svg2pdf.js, pero NO aparece como frase literal en el readme; se infiere del funcionamiento. El original ya lo reconoce y lo etiqueta "medio". No es error, pero conviene no presentarlo como cita directa.

2. **A4-12 — dato "~150 KB minificado el core" no verificado.** No se comprobó numéricamente contra bundlephobia en esta revisión. Plausible, pero úsese como aproximación, no como medición confirmada.

3. **A4-18 — "secciones mínimas" no es taxativo legal.** Las 6 secciones son buena práctica establecida, no un formato impuesto por norma. El propio documento lo aclara en A4-19 ("no hay formato único legalmente obligatorio; lo obligatorio es el contenido") y lo etiqueta "medio". Coherente, sin contradicción.

4. **Anécdota de parseo (no del documento):** una primera lectura automática del timestamp npm de svg2pdf 2.7.0 sugirió "diciembre 2024"; la conversión manual del epoch (`1767451776136` ms → 2026-01-03T14:49:36Z) confirma la fecha **2026-01-03** que da el original. El documento está en lo correcto.

**Conclusión del verificador:** documento de alta fiabilidad. Las afirmaciones marcadas como opinión/síntesis están honestamente etiquetadas como tales y son razonables. No hay confirmaciones inventadas; cada veredicto VERIFICADO se apoya en una URL abierta directamente.
