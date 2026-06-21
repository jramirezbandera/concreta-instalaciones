# I+D — Concreta Instalaciones · Documento de investigación verificado

> Sesión de I+D para la app de predimensionado de instalaciones + ficha justificativa CTE.
> Metodología: 5 áreas de estudio → 5 agentes de investigación en paralelo (129 afirmaciones con
> fuente) → **verificación inversa** con 5 agentes independientes que re-abrieron las fuentes.
> Fecha: 2026-06-21.
>
> **Cómo usar este documento:** el índice de abajo está ordenado por prioridad (nivel de soporte
> tras verificación). Carga solo la sección §N que necesites en cada sesión futura; no metas el
> documento entero en contexto. El detalle por afirmación vive en `research/area-N-*.md`
> (investigación) y `research/verif-area-N.md` (verificación).

---

## Resultado de la verificación inversa (de un vistazo)

| | Afirmaciones | Verificadas contra fuente | Parciales / matiz | **Refutadas** | Opinión/estimación (no factual) |
|---|---|---|---|---|---|
| Área 1 — Cálculo CTE | 26 | 25 | — | **1** (A1-23) | 0 |
| Área 2 — Stack | 25 | 19 | — | 0 | 6 |
| Área 3 — SVG/UX | 28 | 18 | 2 | 0 | 8 |
| Área 4 — PDF/Ficha | 25 | 17 | 2 | 0 | 4 |
| Área 5 — Mercado | 25 | 11 | 3 | 0 | 10 (+1 dato histórico) |
| **Total** | **129** | **~90** | **7** | **1** | **~28** |

**1 alucinación crítica** (tabla de transmitancias HE1) + **1 falso positivo de verificación**
(A5-04 Normatia: páginas que existen pero malinterpretadas — corregido por el propietario, no por la
verificación web) + ~7 correcciones menores. El falso positivo de Normatia **mejora** la posición
competitiva del producto. Las correcciones están en §0.

---

## 📑 ÍNDICE PRIORIZADO (ordenado por soporte tras verificación)

> El hallazgo con más soporte primero. Cada sección es autocontenida y cargable por separado.

### TIER A — Hechos verificados contra fuente oficial/primaria (alta confianza, accionables ya)

| § | Sección | Carga esto cuando… | Confianza |
|---|---------|--------------------|-----------|
| **§0** | **Correcciones de la verificación (LEER ANTES DE CODIFICAR)** | Vayas a implementar cualquier cálculo o cifra | crítico |
| **§1** | **Tablas y reglas de cálculo HS5 (saneamiento)** | Construyas el módulo HS5 | alta — celda a celda |
| **§2** | **Tablas y reglas de cálculo HS3 (ventilación)** | Construyas el módulo HS3 | alta |
| **§3** | **Tablas y reglas de cálculo HS4 (fontanería)** | Construyas el módulo HS4 | alta (2 tablas con matiz) |
| **§4** | **HE1 — transmitancia U, Rsi/Rse, Glaser** | Construyas el módulo HE1 | alta (con corrección §0) |
| **§5** | **Stack y versiones (React/Vite/Tailwind/Vitest/PWA)** | Montes el proyecto base | alta |
| **§6** | **Export PDF (jsPDF + autotable + svg2pdf): versiones, límites, fuentes** | Construyas el motor de ficha PDF | alta |
| **§7** | **Render SVG: viewBox, escalado, accesibilidad, color crítico (WCAG)** | Construyas la visualización en vivo | alta |
| **§8** | **Estructura legal y de contenido de la ficha justificativa CTE** | Definas la plantilla de ficha | alta |

### TIER B — Verificado parcial / requiere lectura literal del PDF antes de codificar

| § | Sección | Carga esto cuando… | Confianza |
|---|---------|--------------------|-----------|
| **§9** | **Pendientes normativos a transcribir** (HS3 conductos 4.2/4.3; ψ puentes térmicos DA DB-HE/3) | Llegues a esos sub-cálculos | media — pendiente |
| **§10** | **Mercado y competencia (pilares verificados)** | Decidas posicionamiento/pricing | media-alta |

### TIER C — Opiniones de arquitectura/estrategia (razonables, a validar; no son hechos)

| § | Sección | Carga esto cuando… | Confianza |
|---|---------|--------------------|-----------|
| **§11** | **Decisiones de arquitectura de software (patrones)** | Diseñes la estructura del código | opinión sólida |
| **§12** | **Decisiones de UX y estrategia de producto** | Diseñes la experiencia / GTM | opinión sólida |

---

## §0 · Correcciones de la verificación — LEER ANTES DE CODIFICAR

### 🔴 CRÍTICO — A1-23: Tabla 3.1.1.a-HE1, transmitancias límite (filas invertidas en la investigación)

La investigación original **invirtió** las filas inferiores. Valor **CORRECTO** (DB-HE oficial +
Guía de aplicación DB-HE 2019, dos apariciones coincidentes), Ulim [W/m²K] por zona invierno
(columnas **α / A / B / C / D / E**):

| Elemento | α | A | B | C | D | E |
|----------|---|---|---|---|---|---|
| Muros y suelos en contacto con aire exterior (UM, US) | 0,80 | 0,70 | 0,56 | 0,49 | 0,41 | 0,37 |
| Cubiertas en contacto con aire exterior (UC) | 0,55 | 0,50 | 0,44 | 0,40 | 0,35 | 0,33 |
| Contacto con no habitables o terreno (UT) | 0,90 | 0,80 | 0,75 | 0,70 | 0,65 | 0,59 |
| **Huecos (UH)** | **3,2** | **2,7** | **2,3** | **2,1** | **1,8** | **1,80** |
| **Puertas (sup. semitransparente ≤ 50 %)** | **5,7** (valor único) ||||||
| **Medianerías (UMD)** | **sin valor de Ulim en esta tabla** ||||||

⚠️ Si se hubiera codificado la afirmación original (huecos limitados a 5,7), el filtro de huecos
habría sido absurdamente permisivo. **Verificar siempre contra el PDF maquetado de
codigotecnico.org al implementar.**

### 🔴 ESTRATÉGICO — A5-04: Normatia NO es el competidor que la investigación creyó (falso positivo de verificación)

Corrección del propietario del producto (conocimiento de dominio, prevalece sobre la verificación web):
**Normatia.com es un agregador de normativa con IA (consulta/búsqueda de normas), NO calcula ni
justifica nada.** El agente de investigación vio páginas tituladas "calculadora" en normatia.com y el
verificador confirmó que *existen esas páginas*, pero ambos sobreinterpretaron qué hace el producto.
Que exista una página no significa que predimensione una instalación ni que genere una ficha
justificativa para la memoria.

**Consecuencia:** NO existe un competidor casi idéntico. La premisa "elimina la ventaja de primer
movimiento" era **falsa**. El hueco de "predimensionado real + ficha justificativa lista para la
memoria" está **más abierto** de lo que concluyó la sesión. Esto refuerza, no debilita, la tesis del
producto. (Lección de método: la verificación web confirma la *existencia* de una URL, no la
*naturaleza funcional* de un producto; eso requiere usarlo o conocer el dominio.)

### 🟡 Correcciones menores

- **A1-08 (HS4 Tabla 2.1):** "Fregadero no doméstico" ACS = **0,20 dm³/s** (no 0,10). Falta la fila
  **"Lavamanos 0,05/0,03"**. El resto de pares aparato↔valor son correctos pese a la desalineación
  del PDF.
- **A3-05:** el umbral "3.000–5.000 nodos SVG" es **heurística de comunidad, soporte medio** (no
  estándar medido). Sigue siendo válido como orientación: estás muy por debajo.
- **A3-07:** las transiciones CSS fiables aplican a `transform`/`color`/`opacity`, **no** a
  atributos geométricos puros (`x`, `cx`, `d`). Animar posición → usar `transform`.
- **A3-13:** la estadística de daltonismo (1/12 hombres, 1/200 mujeres) es correcta pero **no** está
  en el documento W3C de 1.4.1; citar Colour Blind Awareness. Usar w3.org (no mirrors de terceros).
- **A5-06:** el precio de DesignBuilder **sí es público** (ecoeficiente.es: 1.225–10.400 € s/IVA).
- **A5-09:** arquitectos = **4.º** colectivo con más paro (23,5%), no 3.º; dato de 2014-15, no
  aplicable a 2026 (contexto, no dato actual).
- **A5-10:** el **+7% es de superficie visada** (obra nueva + rehabilitación); las viviendas de obra
  nueva crecieron +21,5%. No confundir en usos posteriores.
- **A5-11:** precios de referencia con error de detalle (SketchUp real 129/399/819 $; Maket ~24
  USD/mes). AutoCAD, CYPE, Spacely sí confirmados.
- **A2-08:** "Oxide" fue nombre interno de las previews; no aparece en el post de v4.0 (cifras y
  fecha sí exactas).

---

## §1 · HS5 — Saneamiento (máxima confianza, tablas confirmadas celda a celda)

**Edición vigente:** DB-HS5 = versión 2009, **no modificada** por FOM/588/2017 ni RD 732/2019.

- **UD por aparato (Tabla 4.1):** privado/público + Ø sifón/derivación. Lavabo 1/2 (32/40); ducha
  2/3 (40/50); inodoro cisterna 4/5 (100/100); inodoro fluxómetro 8/10 (100/100); fregadero cocina
  3/6 (40/50); cuarto de baño completo (cisterna) 7 UD / (fluxómetro) 8 UD. *[A1-14, verificado]*
- **UD por Ø de desagüe (Tabla 4.2):** 32→1, 40→2, 50→3, 60→4, 80→5, 100→6. Continuos: 1 UD por
  0,03 dm³/s. *[A1-15]*
- **Ramales colectores (Tabla 4.3):** UD máx. por pendiente 1/2/4 % → Ø (p.ej. 110 mm: 123/151/181
  UD). *[A1-17]*
- **Bajantes (Tabla 4.4):** UD según nº de alturas → Ø; agua ≤ 1/3 de sección; variación de presión
  ±250 Pa. Desviaciones <45° sin cambio de sección; >45° se dimensiona el tramo como colector al 4 %.
  *[A1-18]*
- **Colectores horizontales (Tabla 4.5):** ≤ media sección; UD máx. por pendiente 1/2/4 % → Ø. *[A1-19]*
- **Sifones/botes (4.1.1.2):** sifón individual = Ø de la válvula; bote con altura suficiente. *[A1-16]*
- **Ventilación de red:** primaria sola si < 7 plantas (o <11 si sobredimensionada + ramales <5 m);
  prolongar bajante 1,30 m sobre cubierta no transitable (2,00 m si transitable), salida a ≥6 m de
  tomas de aire. Secundaria: plantas alternas si <15, cada planta si ≥15. Terciaria: ramales >5 m o
  >14 plantas. *[A1-20, A1-21]*

Detalle con todas las cifras: `research/area-1-calculo-cte-tier1.md` (A1-14 a A1-21).
**Recomendado como primer módulo** junto con HS3 (ver §10/§12).

## §2 · HS3 — Ventilación (alta confianza)

**Edición vigente:** modificada por **Orden FOM/588/2017** (consolidada en RD 732/2019). Cambió
respecto a 2009: control por **CO₂** (media anual < 900 ppm; acumulado que no supere 500.000 ppm·h)
y distinción caudal constante / caudal variable. *[A1-01]*

- **Caudales mín. caudal constante (Tabla 2.1, l/s):** dormitorio principal 8; resto de dormitorios
  4; salas/comedores 6/8/10 (según 0-1 / 2 / 3+ dorm.); húmedos total por vivienda 12/24/33; húmedos
  mín. por local 6/7/8. *[A1-02]*
- **Cocción:** extracción **independiente ≥ 50 l/s**. *[A1-03]*
- **No ocupación:** ≥ 1,5 l/s por local habitable. *[A1-04]*
- **No habitables (Tabla 2.2):** trasteros 0,7 l/s·m²; almacenes de residuos 10 l/s·m²; garajes 120
  l/s·plaza. *[A1-05]*
- **Área efectiva de aberturas (Tabla 4.1, cm²):** admisión/extracción 4·qv; paso máx(70 cm², 8·qvp);
  mixtas 8·qv. *[A1-06]*
- **Sistema:** híbrido o mecánico; flujo seco→húmedo; conductos según Tablas 4.2/4.3 (→ §9). *[A1-07]*

Detalle: `area-1-...` (A1-01 a A1-07).

## §3 · HS4 — Fontanería (alta confianza; 2 tablas requieren lectura literal)

**Edición vigente:** versión 2009, no modificada.

- **Velocidades:** metálicas 0,50–2,00 m/s; termoplásticas/multicapa 0,50–3,50 m/s. *[A1-09, verificado]*
- **Presión:** mín. 100 kPa (grifos) / 150 kPa (fluxores y calentadores); máx. 500 kPa; ACS en
  consumo 50–65 °C. *[A1-10, verificado]*
- **Simultaneidad K:** el DB-HS4 **NO prescribe fórmula**; aplica "un coeficiente de simultaneidad
  según criterio adecuado". La clásica K = 1/√(n−1) viene de **UNE 149201** (referencia externa, no
  exigencia CTE). Implementarla como opción, etiquetada como criterio externo. *[A1-11, verificado]*
- **Grupo de presión:** si la presión disponible en el punto más desfavorable < mínima exigida tras
  pérdidas (localizadas ≈ 20–30 % de las longitudinales). *[A1-13]*
- **Tabla 2.1 (caudal por aparato) y Tabla 4.2 (Ø derivaciones):** correctas en su mayoría pero con
  desalineación en la extracción → **verificar emparejamiento celda a celda** + corrección A1-08
  (§0). *[A1-08, A1-12]*

## §4 · HE1 — Transmitancia, resistencias, condensaciones (alta confianza con corrección §0)

**Edición vigente:** DB-HE **2019** (RD 732/2019), texto consolidado 14-jun-2022. *[A1-22, verificado]*

- **Transmitancia:** U = 1/RT, RT = Rsi + ΣRi + Rse. **Rsi/Rse (DA DB-HE/1, Tabla 1):** vertical
  (flujo horizontal) 0,13 / 0,04; ascendente 0,10 / 0,04; descendente 0,17 / 0,04 [m²K/W]. Ri capa =
  espesor/conductividad. *[A1-24, verificado]*
- **Valores límite Ulim:** ver **tabla corregida en §0** (A1-23 fue refutada). *[A1-23 → §0]*
- **Condensaciones (3.3):** intersticial acumulada ≤ evaporación anual (método de **Glaser**, DA
  DB-HE/2); superficial por factor fRsi ≥ fRsi,min. *[A1-25]*
- **Puentes térmicos:** ψ según **DA DB-HE/3** (valores a transcribir → §9). *[A1-26]*

## §5 · Stack y versiones (verificado contra fuente oficial)

Todas las versiones/fechas confirmadas en react.dev, vite.dev, tailwindcss.com, vitest.dev, npm:

- **React 19.2** (01-oct-2025) estable. SPA pura → Server Components/Actions **no aplican**;
  cálculo síncrono va en render/`useMemo`, no en Actions. *[A2-01, A2-02, verificado]*
- **React Compiler 1.0** (07-oct-2025): auto-memoización en build; **fijar versión exacta**. Usar
  **eslint-plugin-react-hooks v6** (Flat Config, reglas del compiler incluidas). *[A2-04, A2-05]*
- **`use()`** para leer promesas/Context en render si se difieren tablas grandes. *[A2-03]*
- **Vite 8 + Rolldown** (12-mar-2026; Node 20.19+/22.12+) línea actual; **Vite 7** base mínima. *[A2-06]*
- **Tailwind v4.0** (22-ene-2025): motor Rust; config **CSS-first** (`@import "tailwindcss"` + `@theme`);
  plugin **`@tailwindcss/vite`** (no PostCSS); detección automática de contenido. Requiere **Chrome
  111 / Safari 16.4 / Firefox 128** (verificado en /docs/compatibility). *[A2-08, A2-09, A2-10, A2-11]*
- **Vitest 4** (22-oct-2025) + snapshots commiteados; **@fast-check/vitest** para property-based
  testing de invariantes normativos. *[A2-21, A2-22]*
- **Zod v4** por defecto (Valibot si el bundle es crítico). *[A2-19]*
- **vite-plugin-pwa** (Workbox) → PWA instalable, offline-first, build estático en CDN. *[A2-23, A2-24, A2-25]*
- **Precisión:** IEEE-754 doble basta; redondear solo en presentación; sin `Date.now`/`Math.random`
  en el motor (determinismo para snapshots). *[A2-15]*

## §6 · Export PDF (verificado contra npm/GitHub)

- **Versiones (fijar exactas):** **jsPDF 4.2.1**, **jspdf-autotable 5.0.8** (peerDeps jsPDF
  `^2||^3||^4`), **svg2pdf.js 2.7.0** (publicada 03-ene-2026). Mutuamente compatibles. *[A4-01, verificado]*
- **Acentos/ñ:** las 14 fuentes estándar son **solo ASCII** → **embeber TTF Unicode**
  (`addFileToVFS`+`addFont`, cada variante por separado; lazy en export). Innegociable. *[A4-02, A4-03]*
- **svg2pdf NO soporta** (Issue #82, reproducido punto por punto): `foreignObject`, filtros,
  máscaras, `textPath`, text stroking, `textLength`, animaciones, unidades ≠ px, opacidades de stops,
  gradientes/patrones en strokes. → **Dibujar diagramas solo con primitivas planas en px.** *[A4-09]*
- **svg2pdf** añade `doc.svg(el,{x,y,w,h})` (Promise); da **vectores nativos** (no rasteriza); crear
  doc en `'pt'`; texto del SVG hereda el límite de fuentes. *[A4-08, A4-10, A4-11]*
- **autotable:** `showHead:'everyPage'`, tema `'grid'` para fichas; header/footer y "Página X de Y"
  vía hooks `willDrawPage`/`didDrawPage` + `putTotalPages`; resaltar veredicto con `didParseCell`.
  *[A4-04, A4-05, A4-21, A4-22]*
- **Elección de stack:** jsPDF+svg2pdf+autotable es el encaje correcto para PWA estática sin backend
  con SVG vectorial. pdfmake (mejor layout, peor SVG) y @react-pdf/renderer como plan B; `@media
  print` y Puppeteer descartados. *[A4-12, A4-13, A4-14, A4-16]*

## §7 · Render SVG y accesibilidad (verificado contra MDN/W3C)

- **Render:** SVG inline declarativo en React (datos → `.map()`); D3 solo para matemáticas. Sin
  charting libs ni Canvas/konva (muy por debajo del umbral). `useMemo` para geometría. *[A3-01, A3-02, A3-05, A3-06]*
- **Escalado:** `viewBox` en unidades del dominio (mm) + `preserveAspectRatio="xMidYMid meet"`
  (default, confirmado MDN) + bbox auto-calculado de los datos + contenedor fluido (sin width/height
  fijos). *[A3-10, A3-11, A3-12, A3-28]*
- **Elemento crítico en rojo — accesibilidad (W3C, verificado):**
  - **WCAG 1.4.1 (nivel A):** el color no puede ser el único medio → pista redundante (etiqueta/
    grosor/patrón). *[A3-13]*
  - **WCAG 1.4.11 (nivel AA):** contraste ≥ **3:1** para objetos gráficos con significado (técnica
    G207). *[A3-15]*
  - Evitar rojo↔verde como única distinción; codificación multicanal. *[A3-14, A3-16]*
- **ARIA:** `role="img"` + `<title>`/`<desc>` + `aria-labelledby`; marcar `aria-hidden` lo decorativo.
  **Los resultados numéricos siempre también en texto/tabla**, nunca solo en el SVG. *[A3-26, A3-27]*
- **Export-friendly:** registrar fuentes antes de svg2pdf; atributos de presentación inline (no CSS
  externo) para fidelidad; decidir texto vivo vs outlines. *[A3-22, A3-23, A3-24, A3-25]*

## §8 · Ficha justificativa CTE — estructura legal y de contenido (verificado contra BOE)

- **Base legal:** la justificación del CTE va en la **Memoria** del proyecto — **RD 314/2006, Anejo I,
  ap. 3** "Cumplimiento del CTE", subsecciones 3.1–3.6 por requisito básico (verificado en BOE
  consolidado). La ficha exportada es parte de esa justificación. *[A4-17, verificado]*
- **Secciones mín. de cada ficha (buena práctica, no mínimo legal taxativo):** (1) identificación
  (proyecto, emplazamiento, técnico/nº colegiado, fecha); (2) normativa de referencia con
  **artículo/tabla + edición/fecha del DB**; (3) datos de partida con unidades y **origen**; (4)
  desarrollo del cálculo; (5) resultado + veredicto CUMPLE/NO CUMPLE; (6) observaciones. *[A4-18]*
- **Fichas normalizadas por colegios (COAC/COAAT)** son el estándar de facto en visado; alinear el
  formato. No hay formato único legalmente obligatorio; lo obligatorio es el contenido. *[A4-19, verificado]*
- **Trazabilidad/citación defendible:** citar siempre DB + exigencia + artículo/tabla + **edición**
  (los DB se modifican — FOM/588/2017 verificada en BOE); declarar el origen de cada dato; sello de
  generación + versión del motor + edición DB en pie/metadatos. *[A4-23, A4-24, A4-25]*
- **Plantilla común:** una sola `renderFicha(doc, data: FichaData)`; los módulos solo producen datos;
  dos tablas estándar ("Datos de partida" / "Verificación"). *[A4-20, A4-21]*

---

## §9 · Pendientes normativos a transcribir (TIER B — antes de codificar esos sub-cálculos)

Marcados por investigación y verificación como **no transcritos celda a celda**; leer del PDF
oficial al implementar:

- **HS3 Tablas 4.2 / 4.3** — secciones de conducto de extracción (cm²) por caudal y clase de tiro
  (T-1…T-4 según nº de plantas). *[A1-07]*
- **HS4 Tabla 2.1 y 4.2** — confirmar emparejamiento aparato↔valor (ver corrección A1-08 en §0). *[A1-08, A1-12]*
- **DA DB-HE/3** — valores ψ de puentes térmicos (encuentros forjado-fachada, contorno de huecos…).
  El método simplificado "global" (Klim) ya engloba su efecto a nivel de coeficiente global. *[A1-26]*
- **DA DB-HE/2** — procedimiento detallado de Glaser y fRsi,min por zona/humedad. *[A1-25]*

## §10 · Mercado y competencia — pilares verificados (TIER B, media-alta)

- **HE1 — competencia oficial gratuita PERO que exige modelar el edificio entero:** **CYPETHERM HE
  Plus** (gratis, reconocido por el Ministerio para HE1/HE0/HE4) y **HULC** (oficial, gratis) son los
  competidores reales en energía. **Clave (corrección del propietario):** ambos requieren **modelar
  el edificio completo** — no son herramientas de predimensionado de mesa. → Para la *justificación
  energética completa* compiten contra gratis oficial, pero **sigue habiendo hueco para el
  predimensionado rápido de U/envolvente** (sacar el número de una sección de muro sin modelar el
  edificio). Aun así, HE1 es el más caro de modelar bien → mantener al final del Tier 1. *[A5-02, A5-03]*
- **Normatia.com NO es competidor de cálculo/justificación** — es un **agregador de normativa con IA**
  (consulta de normas), no predimensiona ni genera fichas. Ver corrección estratégica en §0. → **El
  hueco "predimensionado + ficha" sigue libre; no hay pérdida de ventaja de primer movimiento.** *[A5-04 → §0]*
- **CYPE one:** suscripción 64/89/125 €/usuario/mes (+ plan "Proyectista" 22 €); suite BIM pesada, no
  desk tool. *[A5-01, verificado]*
- **Mercado de calculadoras CTE gratis ya poblado** (konstruir, INGESCO, fabricantes). El diferencial
  NO es la calculadora. *[A5-05]*
- **Tamaño:** ~50.000 arquitectos colegiados / 30 colegios (CSCAE); 119.601 viviendas obra nueva
  visadas 2024 (superficie +7%). *[A5-08, A5-10, verificado CSCAE]*
- **Modelo dominante = freemium:** calcular gratis (SEO) + cobrar por ficha/proyecto/API. *[A5-16]*

---

## §11 · Decisiones de arquitectura de software (TIER C — opinión sólida, a validar)

Opiniones de ingeniería razonables (no hechos verificables); adóptalas como guía de diseño:

- Motor de cálculo = **funciones puras** `calcular(inputs)` sin React/DOM, testeables aisladas. *[A2-12]*
- **Tablas CTE como datos** (JSON/`as const`) versionados con metadatos de procedencia (DB, edición),
  no hardcodeadas — alimentan también la cita de la ficha. *[A2-14]*
- **Feature-folders** `src/modules/hsX/{calc,schema,svg,pdf,ui,tablas,test}` + capa `shared/`;
  **manifest central** de módulos para router + PDF uniforme; **lazy loading** por módulo. *[A2-16, A2-17, A2-18]*
- TypeScript con sufijos de unidad en campos para no mezclar unidades; esquema de validación por
  módulo con límites normativos y mensajes en ES. *[A2-13, A2-20]*

## §12 · Decisiones de UX y estrategia de producto (TIER C — opinión sólida, a validar)

- **UX:** feedback inmediato sin botón "calcular" (visibilidad del estado, Nielsen); defaults CTE
  sensatos; formularios numéricos con unidad visible y validación inline; layout inputs-izq/visual-der
  (convención razonable, **validar con arquitectos** — no es regla NN/g). *[A3-17, A3-18, A3-19, A3-20]*
- **Repriorizar Tier 1:** **HS3 → HS5 → HS4 → HE1** (HE1 al final: para la justificación completa
  compite contra gratis oficial —que exige modelar el edificio— y es el más caro de modelar bien). *[A5-19]*
- **HS6 radón** = buen gancho SEO (nicho joven); **SUA8 rayo** = MVP técnico barato → diferenciar por
  la ficha y por el predimensionado, que las calculadoras-gancho de fabricantes no ofrecen. *[A5-20]*
- **El moat es predimensionado real + FICHA justificativa**, no el cálculo suelto: las herramientas
  gratuitas existentes o bien solo verifican (no predimensionan), o bien exigen modelar el edificio
  entero (CYPE/HULC), o bien solo consultan normativa (Normatia). Calidad + actualización normativa
  continua + suite con "Concreta estructura" = punto de conversión del embudo. *[A5-24]*
- **GTM:** cross-sell desde la app hermana + COAs territoriales + SEO programático (municipio×parámetro:
  zona climática/radón/viento/nieve) + comunidades; boca a boca fuerte en un gremio de ~50k. *[A5-15, A5-22, A5-23, A5-25]*
- **Pricing:** freemium + pago por ficha (créditos) para uso esporádico + suscripción para frecuentes;
  bundle con estructura. *[A5-17, A5-18]*

---

## Pendiente de validar con datos que esta sesión no pudo obtener

- Volumen de búsqueda real de los keywords gancho (Keyword Planner estaba gated). *[Área 5]*
- Pricing exacto de Normatia (tier "Proyectos"). *[A5-16]*
- TAM real de arquitectos *ejercientes de pago* (≠ colegiados totales). *[A5-08]*
- Tracción de "Concreta estructura" (no indexable públicamente — confirmar internamente). *[A5-18, A5-22]*
- Transcripción literal de las tablas de §9 contra el PDF maquetado de codigotecnico.org.

---

### Trazabilidad de esta sesión
- Investigación por área: `research/area-1..5-*.md`
- Verificación inversa: `research/verif-area-1..5.md`
- Registro agregado pre-verificación: `research/MEJORES-PRACTICAS-agregado.md`
- Idea de producto original: `IDEA-INSTALACIONES.md`
