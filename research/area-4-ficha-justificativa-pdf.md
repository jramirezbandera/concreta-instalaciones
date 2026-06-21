# Área 4 — Ficha Justificativa CTE + Export PDF (jsPDF + svg2pdf.js)

> Sesión I+D · App de predimensionado CTE para arquitectos.
> Propuesta de valor: el arquitecto paga por NO escribir la justificación del CTE.
> Cada módulo (HS3, HS4, HS5, HE1…) exporta un PDF "pega-y-listo" para la memoria.
>
> Fecha de la investigación: 2026-06-21.
> Versiones verificadas en npm a esa fecha: **jsPDF 4.2.1**, **jspdf-autotable 5.0.8**, **svg2pdf.js 2.7.0**.
> Niveles de soporte: **alto** = doc oficial/fuente primaria · **medio** = doc secundaria fiable / práctica establecida · **bajo** = opinión / inferencia no verificada directamente.

---

## 1. jsPDF — capacidades, límites, fuentes, tablas, metadatos

### [A4-01] Versión estable actual de jsPDF y stack base
- **Afirmación:** Usar **jsPDF 4.2.1** (MIT) como motor base, **jspdf-autotable 5.0.8** (MIT) para tablas y **svg2pdf.js 2.7.0** para gráficos SVG. jspdf-autotable 5.0.8 declara `peerDependencies` de jsPDF `^2 || ^3 || ^4`, y svg2pdf.js 2.7.0 (publicado 2026-01-03) es compatible con jsPDF v2.x+. Las tres versiones son mutuamente compatibles.
- **Soporte:** alto
- **Fuente(s):** [npm jspdf (registry latest = 4.2.1)](https://registry.npmjs.org/jspdf/latest) · [npm jspdf-autotable (5.0.8, peerDeps ^2|^3|^4)](https://registry.npmjs.org/jspdf-autotable/latest) · [svg2pdf.js releases / GitHub](https://github.com/yWorks/svg2pdf.js/)
- **Nota:** Fijar versiones exactas en `package.json` (no rangos `^`) para reproducibilidad del PDF; cambios de minor en jsPDF han alterado métricas de texto históricamente.

### [A4-02] Acentos y caracteres españoles requieren fuente embebida (Unicode)
- **Afirmación:** Las 14 fuentes estándar de PDF en jsPDF son **solo ASCII**; para renderizar correctamente acentos, ñ, ª/º, €, etc. (imprescindible en castellano) hay que **embeber una fuente TTF Unicode**. Sin ella, los acentos salen rotos o ausentes.
- **Soporte:** alto
- **Fuente(s):** [jsPDF npm — Use of Unicode Characters / UTF-8](https://www.npmjs.com/package/jspdf)
- **Nota:** Para una app de documentos legales/técnicos en español esto NO es opcional. Es el primer requisito de la plantilla.

### [A4-03] Cómo embeber la fuente TTF en jsPDF
- **Afirmación:** Dos vías oficiales: (a) el **fontconverter** (`/fontconverter/fontconverter.html`) genera un `.js` con la TTF en base64 + el registro automático; o (b) en runtime: `doc.addFileToVFS("MiFuente.ttf", base64)` → `doc.addFont("MiFuente.ttf", "MiFuente", "normal")` → `doc.setFont("MiFuente")`. Hay que registrar cada variante (normal, bold, italic) por separado.
- **Soporte:** alto
- **Fuente(s):** [jsPDF npm — custom fonts](https://www.npmjs.com/package/jspdf) · [jsPDF docs — addFont/setFont](https://artskydj.github.io/jsPDF/docs/jsPDF.html)
- **Nota (opinión):** Recomendado pre-generar el `.js` de la fuente en build y cargarlo perezosamente (lazy) solo al exportar, para no inflar el bundle inicial de la PWA. Embeber subset de la fuente reduce peso; jsPDF embebe la TTF completa salvo que se haga subsetting manual.

### [A4-04] Tablas con jspdf-autotable: cabeceras repetidas y saltos de página
- **Afirmación:** jspdf-autotable maneja paginación automática de tablas. `showHead: 'everyPage'` (por defecto) repite la cabecera de la tabla en cada página; `pageBreak: 'auto' | 'avoid' | 'always'` y `rowPageBreak: 'auto'` controlan los cortes. Temas disponibles: `'striped'` (def.), `'grid'`, `'plain'`. `columnStyles` permite estilo por columna.
- **Soporte:** alto
- **Fuente(s):** [jsPDF-AutoTable GitHub (simonbengtsson)](https://github.com/simonbengtsson/jsPDF-AutoTable) · [jspdf-autotable npm 5.0.8](https://www.npmjs.com/package/jspdf-autotable)
- **Nota:** Tema `'grid'` es el más adecuado para fichas técnicas (líneas en todas las celdas, look de tabla normativa).

### [A4-05] Cabeceras y pies de página (header/footer) con números de página
- **Afirmación:** Los hooks de autotable `willDrawPage` (antes de dibujar cada página → cabecera) y `didDrawPage` (después → pie con nº de página) reciben `HookData` con el número de página, lo que permite renderizar cabecera/pie consistentes en todas las páginas. Para numeración tipo "Página X de Y" se usa el patrón de dos pasadas: dibujar, luego `doc.getNumberOfPages()` y `doc.setPage(i)` para reescribir el total.
- **Soporte:** alto
- **Fuente(s):** [jsPDF-AutoTable — willDrawPage/didDrawPage hooks](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Nota:** El "X de Y" con autotable requiere post-proceso porque el total no se conoce hasta terminar. Alternativa: API de jsPDF `putTotalPages('{total_pages_count_string}')`.

### [A4-06] Metadatos del documento PDF
- **Afirmación:** `doc.setDocumentProperties({...})` (alias `setProperties`) fija metadatos: `title`, `subject`, `author`, `keywords`, `creator`. Útil para trazabilidad (autor = arquitecto/colegiado, title = "Justificación DB-HS3 — [Proyecto]", creator = nombre de la app, keywords = módulo/edición DB).
- **Soporte:** alto
- **Fuente(s):** [jsPDF docs — setDocumentProperties](https://artskydj.github.io/jsPDF/docs/jspdf.js.html) · [jsPDF npm](https://www.npmjs.com/package/jspdf)
- **Nota:** No hay soporte nativo robusto de PDF/A en jsPDF; si en el futuro se exige archivado PDF/A, es una limitación a evaluar (ver A4-13).

### [A4-07] Límites conocidos de jsPDF para layout
- **Afirmación:** jsPDF es de **bajo nivel** (dibujo por coordenadas x/y); no tiene motor de flujo/reflow de contenido ni layout automático multi-sección como pdfmake o @react-pdf/renderer. El posicionamiento de párrafos largos, control de saltos entre secciones y "no partir un bloque" debe gestionarse manualmente midiendo alturas (`doc.getTextDimensions`, `splitTextToSize`).
- **Soporte:** medio
- **Fuente(s):** [Nutrient — JS PDF libraries 2025](https://www.nutrient.io/blog/javascript-pdf-libraries/) · [DEV — comparison of PDF libraries](https://dev.to/handdot/generate-a-pdf-in-js-summary-and-comparison-of-libraries-3k0p)
- **Nota:** Para una **plantilla fija con secciones tabulares** (que es exactamente la ficha CTE) este límite es manejable: autotable gestiona los saltos de las tablas, y los bloques de texto son cortos y predecibles.

---

## 2. svg2pdf.js — integración y soporte SVG

### [A4-08] Integración svg2pdf.js ↔ jsPDF
- **Afirmación:** svg2pdf.js extiende jsPDF añadiendo el método `doc.svg(element, { x, y, width, height })`, que devuelve una Promise. Uso: `import { jsPDF } from 'jspdf'; import 'svg2pdf.js'; doc.svg(svgEl, {x,y,width,height}).then(() => doc.save())`. Desde la v2.x **no** depende de un fork de jsPDF; funciona con el jsPDF original. Las dimensiones se pasan en las unidades del documento jsPDF (mejor crear el doc en `'pt'`).
- **Soporte:** alto
- **Fuente(s):** [svg2pdf.js README/GitHub](https://github.com/yWorks/svg2pdf.js/) · [svg2pdf.js npm](https://www.npmjs.com/package/svg2pdf.js)
- **Nota:** El SVG debe estar en el DOM (o crearse off-DOM) y resoluble; pasar el elemento DOM real, no una cadena.

### [A4-09] Lista de features SVG NO soportadas (gotchas críticos)
- **Afirmación:** svg2pdf.js **no soporta**: `foreignObject`; transforms en elementos distintos de `path` dentro de `clipPath`; atributo `textPath`; *text stroking*; atributo `textLength`; elementos `glyph`; elementos `mask` y `filter` (sombras, blurs, etc.); animaciones; la mayoría de unidades distintas de `px`; opacidades distintas en stops de gradiente; `use` con referencias IRI no locales; y gradientes/patrones sobre *strokes*.
- **Soporte:** alto
- **Fuente(s):** [svg2pdf.js — Issue #82 "Unsupported features/Known issues"](https://github.com/yWorks/svg2pdf.js/issues/82)
- **Nota:** **Implicación de diseño:** los SVG de las fichas (esquemas de instalación, diagramas de columnas/tramos) deben dibujarse con primitivas planas: `path`, `rect`, `line`, `circle`, `text`, rellenos sólidos o gradientes simples — **sin filtros, sin sombras CSS, sin foreignObject, en unidades px**. Diseñar los assets con esta restricción desde el principio.

### [A4-10] Fuentes y caracteres no-ASCII dentro del SVG
- **Afirmación:** El texto dentro del SVG hereda la misma limitación de fuentes: para texto con acentos/ñ en etiquetas de diagramas hay que **embeber primero la fuente en jsPDF** (A4-03) antes de llamar a `doc.svg()`. Las métricas de texto pueden diferir ligeramente entre entornos (los propios tests del proyecto lo advierten).
- **Soporte:** alto
- **Fuente(s):** [svg2pdf.js README — "you have to add fonts first"](https://github.com/yWorks/svg2pdf.js/) · [svg2pdf.js Issue #82](https://github.com/yWorks/svg2pdf.js/issues/82)
- **Nota (opinión):** Para evitar problemas de métricas/fuente en etiquetas, considerar minimizar el texto dentro del SVG y poner las leyendas como texto nativo jsPDF fuera del SVG cuando sea posible.

### [A4-11] Escala y nitidez del SVG en el PDF
- **Afirmación:** svg2pdf.js convierte el SVG a **vectores PDF nativos** (no rasteriza), por lo que el resultado es nítido a cualquier zoom y de bajo peso — ventaja decisiva frente a html2canvas/`addImage` (que rasteriza y pixela). Conviene crear el `jsPDF` con `unit: 'pt'` y mapear `width/height` del `doc.svg()` al `viewBox` para escalar sin deformar.
- **Soporte:** medio
- **Fuente(s):** [svg2pdf.js GitHub](https://github.com/yWorks/svg2pdf.js/) · [Best of JS — svg2pdf](https://bestofjs.org/projects/svg2pdf)
- **Nota:** Verificado que es vectorial por diseño del proyecto; el detalle de mapeo viewBox↔width/height es práctica recomendada (opinión).

---

## 3. Alternativas y comparación (PWA estática sin backend)

### [A4-12] jsPDF+svg2pdf+autotable es la opción correcta para PWA estática con SVG vectorial + tablas
- **Afirmación:** Para una PWA estática **sin backend**, con **SVG vectorial embebido + tablas**, la combinación jsPDF + svg2pdf.js + jspdf-autotable es la más alineada: 100% cliente, sin dependencias de servidor, ~150 KB minificado el core, ecosistema de plugins, y **única ruta que rasteriza-cero el SVG manteniéndolo vectorial**.
- **Soporte:** medio
- **Fuente(s):** [Nutrient — JS PDF libraries 2025](https://www.nutrient.io/blog/javascript-pdf-libraries/) · [npm-compare jspdf vs pdfmake vs react-pdf](https://npm-compare.com/@react-pdf/renderer,jspdf,pdfmake,react-pdf)
- **Nota (opinión):** Conclusión de síntesis: ninguna fuente única lo afirma textualmente, pero el cruce de capacidades lo respalda. El factor decisivo es el SVG vectorial (A4-11) y "cero backend".

### [A4-13] pdfmake — alternativa con mejor layout pero SVG limitado
- **Afirmación:** pdfmake usa una definición **declarativa JSON**, con tablas, cabeceras/pies y layout automático "out of the box" (sin calcular coordenadas a mano), lo que reduce el trabajo de maquetar texto largo. Soporta SVG, pero su soporte es más restringido que la maquetación; el embebido de fuentes Unicode también requiere configuración (vfs_fonts).
- **Soporte:** medio
- **Fuente(s):** [Nutrient — JS PDF libraries 2025](https://www.nutrient.io/blog/javascript-pdf-libraries/) · [npm-compare](https://npm-compare.com/@react-pdf/renderer,jspdf,pdfmake,react-pdf)
- **Nota (opinión):** Si la app fuese mayoritariamente texto/tablas con poco SVG, pdfmake ahorraría código de layout. Dado el peso del SVG técnico en las fichas, queda como segunda opción / plan B para la parte tabular.

### [A4-14] @react-pdf/renderer — modelo de componentes, útil si el front es React
- **Afirmación:** `@react-pdf/renderer` genera PDF desde componentes React (Document/Page/View/Text/Image), con su propio motor de layout flexbox y soporte de SVG y fuentes. Es generación, no visualización (eso es `react-pdf`/`pdfjs`). Encaja bien si el stack es React y se quiere co-localizar plantilla y UI.
- **Soporte:** medio
- **Fuente(s):** [react-pdf-kit — 6 PDF libraries 2025](https://www.react-pdf-kit.dev/blog/6-open-source-pdf-generation-and-modification-libraries-every-react-dev-should-know-in-2025) · [npm-compare](https://npm-compare.com/@react-pdf/renderer,jspdf,pdfmake,react-pdf)
- **Nota:** Su soporte de SVG no equivale a svg2pdf.js (que está especializado). Para diagramas técnicos complejos, svg2pdf.js es más fiel.

### [A4-15] @media print / CSS-to-PDF del navegador — descartar como entrega
- **Afirmación:** Imprimir-a-PDF con CSS `@media print` no produce un archivo descargable de forma programática ni determinista: depende del diálogo del navegador, márgenes/cabeceras del SO, y no garantiza paginación ni metadatos. No sirve como mecanismo de export "pega-en-memoria".
- **Soporte:** bajo
- **Fuente(s):** *Opinión no verificada con fuente única*; inferido de las comparativas ([Nutrient](https://www.nutrient.io/blog/javascript-pdf-libraries/)).
- **Nota:** Útil solo como atajo de "previsualizar/imprimir", nunca como artefacto formal.

### [A4-16] Puppeteer / servidor — máxima fidelidad pero rompe el requisito "sin backend"
- **Afirmación:** Render server-side con Puppeteer/headless Chrome da máxima fidelidad (HTML/CSS/SVG completos, filtros, foreignObject) pero **exige backend**, contradiciendo el requisito de PWA estática, e introduce coste/latencia/infra.
- **Soporte:** medio
- **Fuente(s):** [Nutrient — JS PDF libraries 2025](https://www.nutrient.io/blog/javascript-pdf-libraries/) · [DEV comparison](https://dev.to/handdot/generate-a-pdf-in-js-summary-and-comparison-of-libraries-3k0p)
- **Nota:** Reservar como ruta futura solo si aparece exigencia de PDF/A o de SVG con filtros que svg2pdf.js no cubre (A4-09).

---

## 4. Estructura de una ficha justificativa CTE válida en memoria de proyecto

### [A4-17] Base legal: la justificación del CTE va en la Memoria del proyecto (Anejo I, RD 314/2006)
- **Afirmación:** El RD 314/2006 (CTE) establece en su **Anejo I (Contenido del proyecto)** que la **Memoria** debe incluir la justificación del cumplimiento por exigencias básicas y por cada requisito básico (DB-SE, DB-SI, DB-SUA, DB-HS, DB-HE, DB-HR). Adoptar las soluciones de los Documentos Básicos (DB) y justificarlo acredita el cumplimiento. La ficha exportada por cada módulo es, formalmente, parte de esa justificación de la Memoria.
- **Soporte:** alto
- **Fuente(s):** [BOE — RD 314/2006 consolidado](https://www.boe.es/buscar/act.php?id=BOE-A-2006-5515) · [BOE PDF consolidado](https://www.boe.es/buscar/pdf/2006/BOE-A-2006-5515-consolidado.pdf)
- **Nota:** Hay "fichas justificativas" normalizadas por colegios profesionales (p.ej. COAC/OCT, COAAT) que validan la entrega; conviene que el formato de la app se asemeje a ese estándar reconocido (A4-19).

### [A4-18] Secciones mínimas que debe contener cada ficha
- **Afirmación:** Una ficha justificativa válida debe contener, en este orden: (1) **Identificación** — proyecto, emplazamiento/situación, promotor, técnico/autor (y nº colegiado si aplica), fecha; (2) **Normativa de referencia** — DB y exigencia básica concreta, con artículo/tabla y edición/fecha del DB; (3) **Datos de partida** — entradas del cálculo con sus unidades y origen; (4) **Desarrollo del cálculo** — método aplicado paso a paso, con referencia a la fórmula/tabla del DB; (5) **Resultado y veredicto** — valor obtenido vs exigido y "CUMPLE / NO CUMPLE"; (6) **Observaciones** — soluciones alternativas o puntos no justificables.
- **Soporte:** medio
- **Fuente(s):** [VerificaciónCTE — plantillas memoria técnica](https://www.verificacioncte.es/blog/plantillas-memoria-tecnica-cte) · [Ejemplo ficha DB-HE (Almería)](https://www.almeriaciudad.es/uploads/media/tablon/HOTEL-AVENIDA-2-.pdf) · [Anexo I.2 Fichas justificativas (contratación del Estado)](https://contrataciondelestado.es/wps/wcm/connect/a64c8e61-a2c6-43e9-bf17-f2d57ff1b64a/DOC20131223143428MemoriaAnexo1.pdf)
- **Nota:** El bloque "Observaciones" es práctica habitual en las fichas oficiales: ahí se señalan razonadamente los artículos imposibles de cumplir y la solución propuesta. Incluirlo da defensibilidad.

### [A4-19] Existen fichas justificativas normalizadas por colegios (referencia de formato)
- **Afirmación:** Colegios y oficinas de control técnico (p.ej. COAC, COAAT) publican y actualizan **fichas justificativas oficiales** del CTE (incluida DB-HR, DB-HE, etc.) en formato editable, que son el estándar de facto aceptado en visado. Conviene alinear la estructura/lenguaje de la app con esas fichas.
- **Soporte:** medio
- **Fuente(s):** [COAC — fichas justificativas actualizadas CTE](https://www.arquitectes.cat/es/la-oct-publica-las-nuevas-fichas-justificativas-que-incorporan-las-modificaciones-del-cte) · [Ficha justificativa DB-HR (Arquitectos de Cádiz)](https://www.arquitectosdecadiz.com/wp-content/uploads/2017/12/ficha_justificativa_db_hr_act.23.04.09.doc)
- **Nota:** No hay un formato único legalmente obligatorio de ficha; lo obligatorio es el contenido justificativo. La app puede definir su propia plantilla siempre que cubra A4-18.

---

## 5. Plantilla común reutilizable (sistema de plantilla PDF)

### [A4-20] Diseño de plantilla común: separar "esqueleto" (layout) de "contenido" (datos del módulo)
- **Afirmación:** Implementar una **plantilla base** que reciba un objeto de datos normalizado por módulo y dibuje siempre la misma estructura: cabecera con identificación + logo, bloques de sección (A4-18), tabla(s) de "Datos de partida" y "Resultados" vía autotable, zona SVG opcional, y pie con autor/fecha/nº de página. Cada módulo (HS3, HS4, HS5, HE1) aporta solo: metadatos normativos (artículo/tabla/edición), filas de la tabla de entradas, pasos del cálculo, filas de resultados y veredicto.
- **Soporte:** medio (síntesis de prácticas A4-04/05/06 + estructura A4-18)
- **Fuente(s):** [jsPDF-AutoTable hooks](https://github.com/simonbengtsson/jsPDF-AutoTable) · [Apryse — PDF template generation libraries](https://apryse.com/blog/pdf-template-generation-libraries)
- **Nota (opinión):** Patrón recomendado — definir una interfaz TypeScript `FichaData` común (identificación, normativa[], datosEntrada[], pasosCalculo[], resultados[], veredicto, observaciones) y una función `renderFicha(doc, data)`. Los módulos son productores de `FichaData`; el renderizador es uno solo. Esto cumple "separación contenido/estilo".

### [A4-21] Dos tablas estándar: "Datos de partida" y "Resultado/Verificación"
- **Afirmación:** Estandarizar dos tablas autotable reutilizables: **Datos de partida** (columnas: Parámetro · Valor · Unidad · Origen/Referencia) y **Verificación** (columnas: Magnitud · Valor obtenido · Valor exigido (DB) · Cumple). Tema `'grid'`, cabecera repetida (`showHead:'everyPage'`), y resaltado de la fila/celda de veredicto (verde "CUMPLE" / rojo "NO CUMPLE") con `didParseCell`/`columnStyles`.
- **Soporte:** medio
- **Fuente(s):** [jsPDF-AutoTable — columnStyles/themes/hooks](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Nota:** La columna "Origen/Referencia" en datos de partida es clave para trazabilidad (de dónde sale cada dato: input del usuario, tabla del DB, norma UNE).

### [A4-22] Cabecera/pie comunes vía hook, con nº de página y datos de proyecto
- **Afirmación:** Dibujar cabecera (módulo + nombre de proyecto) y pie (autor · fecha · "Página X de Y" · sello "Generado con [app]") en **todas** las páginas usando `didDrawPage`/`willDrawPage` de autotable, o un bucle `setPage` al final con `putTotalPages`. Esto garantiza consistencia entre módulos sin duplicar código.
- **Soporte:** alto
- **Fuente(s):** [jsPDF-AutoTable hooks](https://github.com/simonbengtsson/jsPDF-AutoTable) · [jsPDF docs — putTotalPages](https://artskydj.github.io/jsPDF/docs/jsPDF.html)
- **Nota:** Mantener el contenido principal dentro de un margen seguro para no solapar cabecera/pie (definir `margin` en autotable).

---

## 6. Trazabilidad normativa (citación defendible)

### [A4-23] Citar DB + exigencia + artículo/tabla + EDICIÓN/fecha del documento
- **Afirmación:** Cada cálculo debe citar de forma completa: **Documento Básico** (p.ej. "DB-HS Salubridad"), **sección/exigencia** (p.ej. "HS 3 Calidad del aire interior"), **artículo/apartado o tabla concreta** que fundamenta el valor exigido, y la **edición/fecha del DB** vigente (p.ej. la modificación por Orden FOM/588/2017). Citar la edición es esencial porque los DB se modifican y el valor exigido cambia con la versión.
- **Soporte:** alto
- **Fuente(s):** [BOE — Orden FOM/588/2017 (modifica DB-HE y DB-HS)](https://www.boe.es/buscar/doc.php?id=BOE-A-2017-7163) · [codigotecnico.org — DB-HS](https://www.codigotecnico.org/pdf/Documentos/HS/DBHS.pdf)
- **Nota:** Mantener en la app un registro central de "edición vigente por DB" y estamparlo en la ficha; así la cita es auto-defendible y auditable.

### [A4-24] Trazabilidad de cada dato de partida (origen del valor)
- **Afirmación:** Para defensibilidad, cada valor de entrada debe declarar su **origen** en la propia ficha (input del proyectista, tabla X del DB, norma UNE, dato geográfico/climático). Práctica documentada en fichas reales: indicar la procedencia del valor (p.ej. "Demanda 35,2 kWh/m²·año según HULC adjunto").
- **Soporte:** medio
- **Fuente(s):** [VerificaciónCTE — plantillas memoria técnica](https://www.verificacioncte.es/blog/plantillas-memoria-tecnica-cte) · [Ejemplo ficha DB-HE (Almería)](https://www.almeriaciudad.es/uploads/media/tablon/HOTEL-AVENIDA-2-.pdf)
- **Nota:** Encaja con la columna "Origen/Referencia" de la tabla de datos de partida (A4-21).

### [A4-25] Sello de generación, versión de la app y fecha en el PDF
- **Afirmación:** Estampar en el pie y en los metadatos (A4-06): autor/colegiado, fecha de generación, **versión del motor de cálculo de la app** y edición del DB usada. Esto permite reproducir y auditar el resultado años después y distingue una ficha "máquina-generada y verificable" de un cálculo manual opaco.
- **Soporte:** bajo (opinión de buena práctica; no exigido por norma)
- **Fuente(s):** *Opinión no verificada* — buena práctica de reproducibilidad; se apoya en la capacidad de metadatos de [jsPDF setDocumentProperties](https://artskydj.github.io/jsPDF/docs/jspdf.js.html).
- **Nota:** No sustituye la firma del técnico competente; es trazabilidad técnica añadida, no validez legal por sí sola.

---

## Resumen de decisiones de diseño (derivadas)
1. Stack confirmado: jsPDF 4.2.1 + jspdf-autotable 5.0.8 + svg2pdf.js 2.7.0, versiones fijadas.
2. Embeber fuente TTF Unicode (lazy en export) — innegociable para español.
3. SVG de diagramas: solo primitivas planas, sin filtros/máscaras/foreignObject, en `px`.
4. Una sola `renderFicha(doc, data: FichaData)`; los módulos solo producen datos.
5. Dos tablas estándar (Datos de partida / Verificación) + cabecera/pie por hook.
6. Citación completa: DB + exigencia + artículo/tabla + edición/fecha; origen por dato.
