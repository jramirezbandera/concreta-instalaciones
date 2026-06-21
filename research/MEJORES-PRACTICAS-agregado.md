# Mejores prácticas — Concreta Instalaciones (registro agregado pre-verificación)

> Agregación de la sesión de I+D (5 áreas, 5 agentes en paralelo). Fecha: 2026-06-21.
> Este documento es el **registro maestro de afirmaciones** que entra a la segunda pasada de
> verificación inversa. Cada afirmación conserva su ID original, nivel de soporte autodeclarado
> por el agente de investigación, y fuente. El detalle completo de cada una está en los ficheros
> `area-N-*.md`.
>
> **Estado:** PRE-VERIFICACIÓN. El soporte aquí es el *autodeclarado*; la columna definitiva la
> fija el documento final `IDR-INSTALACIONES.md` tras la revisión inversa.

Leyenda de soporte: **alto** = confirmado con fuente oficial/primaria · **medio** = fuente
secundaria fiable o inferencia directa · **bajo** = opinión/práctica sin fuente única.

Total: **129 afirmaciones** — Área 1 (26) · Área 2 (25) · Área 3 (28) · Área 4 (25) · Área 5 (25).

---

## ÁREA 1 — Núcleo de cálculo CTE (Tier 1: HS3, HS4, HS5, HE1)

**Contexto de versiones (crítico):** DB-HS vigente = modificaciones Orden FOM/588/2017 + RD 732/2019
(HS3 cambió sustancialmente respecto a 2009; HS4/HS5 no). DB-HE vigente = edición 2019 (RD 732/2019),
texto consolidado 14-jun-2022. *No mezclar tablas de ediciones distintas.*

| ID | Afirmación (resumen) | Soporte | Fuente clave |
|----|----------------------|---------|--------------|
| A1-01 | HS3 vigente (FOM/588/2017): control por CO₂ (<900 ppm media anual; 500.000 ppm·h acumulado) + caudal constante/variable | alto | DB-HS3 oficial; BOE-A-2019-18528 |
| A1-02 | Tabla 2.1: caudales mín. caudal constante (dorm. principal 8 l/s; resto 4; salón 6/8/10; húmedos total 12/24/33) | alto | DB-HS3 Tabla 2.1 |
| A1-03 | Cocción: extracción independiente ≥ 50 l/s | alto | DB-HS3 ap. 2 pto 4 |
| A1-04 | Caudal mín. en no ocupación: 1,5 l/s por local habitable | alto | DB-HS3 ap. 2 pto 2 |
| A1-05 | Tabla 2.2 no habitables: trasteros 0,7 l/s·m²; residuos 10 l/s·m²; garajes 120 l/s·plaza | alto | DB-HS3 Tabla 2.2 |
| A1-06 | Tabla 4.1 área efectiva aberturas: admisión/extracción 4·qv; paso máx(70 cm²,8·qvp); mixtas 8·qv | alto | DB-HS3 Tabla 4.1 |
| A1-07 | Ventilación general híbrida o mecánica; seco→húmedo; conductos Tabla 4.2/4.3 (no transcritas) | alto (texto) / pendiente (tablas) | DB-HS3 ap. 3.1.1 y 4 |
| A1-08 | Tabla 2.1 HS4: caudal instantáneo mín. por aparato (AF/ACS) — **desalineación de extracción** | medio | DB-HS4 Tabla 2.1 |
| A1-09 | Velocidades: metálicas 0,50–2,00 m/s; termoplásticas/multicapa 0,50–3,50 m/s | alto | DB-HS4 ap. 4.2 |
| A1-10 | Presión mín. 100 kPa (grifos) / 150 kPa (fluxores, calentadores); máx. 500 kPa; ACS 50–65 °C | alto | DB-HS4 ap. 2.1.3 |
| A1-11 | DB-HS4 NO prescribe fórmula de simultaneidad K; UNE 149201 es referencia externa, no exigencia | alto | DB-HS4 ap. 4.2 |
| A1-12 | Tabla 4.2 HS4 diámetros mín. derivaciones (mm) — **emparejamiento a verificar** | medio | DB-HS4 Tabla 4.2 |
| A1-13 | Grupo de presión si presión disponible < mínima exigida tras pérdidas; localizadas 20–30 % de longitudinales | alto | DB-HS4 ap. 4.2.2 |
| A1-14 | Tabla 4.1 HS5: UD por aparato (privado/público) + Ø sifón/derivación | alto | DB-HS5 Tabla 4.1 |
| A1-15 | Tabla 4.2 HS5: UD por Ø desagüe (32→1…100→6); continuos 1 UD/0,03 dm³/s | alto | DB-HS5 Tabla 4.2 |
| A1-16 | Sifones individuales = Ø de la válvula; botes sifónicos con altura suficiente | alto | DB-HS5 ap. 4.1.1.2 |
| A1-17 | Tabla 4.3 HS5: ramales colectores (UD máx. por pendiente 1/2/4 % → Ø) | alto | DB-HS5 Tabla 4.3 |
| A1-18 | Tabla 4.4 HS5: bajantes (UD por nº alturas → Ø); ≤1/3 sección; ±250 Pa | alto | DB-HS5 Tabla 4.4 |
| A1-19 | Tabla 4.5 HS5: colectores horizontales (UD máx. por pendiente → Ø); ≤ media sección | alto | DB-HS5 Tabla 4.5 |
| A1-20 | Ventilación primaria sola: < 7 plantas (o <11 si sobredimensionada); prolongar 1,30 m (2,00 transitable) | alto | DB-HS5 ap. 3.3.3.1 |
| A1-21 | Ventilación secundaria (<15 plantas alternas / ≥15 cada planta) y terciaria (ramales >5 m o >14 plantas) | alto | DB-HS5 ap. 3.3.3.2/3 |
| A1-22 | DB-HE vigente = 2019 (RD 732/2019), consolidado 14-jun-2022; HE1 = control demanda energética | alto | DB-HE oficial |
| A1-23 | Tabla 3.1.1.a-HE1 Ulim por zona — **filas inferiores UT/UMD/UH ambiguas por maquetación** | medio | DB-HE Tabla 3.1.1.a |
| A1-24 | U=1/RT; Rsi/Rse (vertical 0,13/0,04; ascendente 0,10/0,04; descendente 0,17/0,04) | alto | DA DB-HE/1 Tabla 1 |
| A1-25 | Condensaciones: intersticial acumulada ≤ evaporación anual (Glaser, DA DB-HE/2); superficial fRsi ≥ fRsi,min | alto | DB-HE ap. 3.3; DA DB-HE/2 |
| A1-26 | Puentes térmicos: ψ según DA DB-HE/3 — **valores numéricos no extraídos** | medio | DB-HE ap. 4; DA DB-HE/3 |

---

## ÁREA 2 — Arquitectura técnica y stack

| ID | Afirmación (resumen) | Soporte | Fuente clave |
|----|----------------------|---------|--------------|
| A2-01 | React 19.2 (oct-2025) es la estable vigente; SPA pura → Server Components/Actions no aplican | alto | react.dev/blog 19.2, 19 |
| A2-02 | Actions/useActionState/useOptimistic = mutaciones async; uso marginal en cálculo síncrono | alto | react.dev/blog 19 |
| A2-03 | `use()` lee promesas/Context en render; útil si se difieren tablas grandes vía Suspense | alto | react.dev/blog 19 |
| A2-04 | React Compiler 1.0 estable (07-oct-2025); auto-memoización en build; fijar versión exacta | alto | react.dev/blog compiler-1 |
| A2-05 | Usar eslint-plugin-react-hooks v6 (reglas del compiler fusionadas; Flat Config) | alto | react.dev/blog compiler-1, 19.2 |
| A2-06 | Vite 8 + Rolldown (mar-2026) línea actual; Vite 7 base estable mínima; Node 20.19+/22.12+ | alto | vite.dev/blog vite8, vite7 |
| A2-07 | Evitar Server features sin servidor, Actions para cálculo síncrono, quitar memoización a ciegas | medio | react.dev (síntesis) |
| A2-08 | Tailwind v4.0 (22-ene-2025), motor Oxide (Rust), builds incrementales hasta ~182× | alto | tailwindcss.com/blog v4 |
| A2-09 | Config CSS-first: `@import "tailwindcss"` + `@theme` (tokens como variables CSS) | alto | tailwindcss.com/blog v4 |
| A2-10 | Usar plugin `@tailwindcss/vite` (no PostCSS); detección automática de contenido | alto | tailwindcss.com/blog v4 |
| A2-11 | v4 requiere navegadores recientes (Safari 16.4+/Chrome 111+/Firefox 128+ aprox.) — confirmar números | medio | tailwindcss.com/blog v4 |
| A2-12 | Motor de cálculo = funciones puras `calcular(inputs)` sin React/DOM; testeable con Vitest | medio | principio arquitectura |
| A2-13 | TypeScript con uniones discriminadas + sufijos de unidad en campos para evitar mezclar unidades | bajo | práctica TS |
| A2-14 | Tablas CTE como datos (JSON/`as const`) versionados con metadatos de procedencia, no hardcode | bajo | práctica arquitectura |
| A2-15 | IEEE-754 doble basta; controlar redondeo SOLO en presentación; evitar Date.now/Math.random en motor | medio | comportamiento JS |
| A2-16 | Feature-folders: `src/modules/hsX/{calc,schema,svg,pdf,ui,tablas,test}` + capa `shared/` | bajo | patrón modular |
| A2-17 | Lazy loading por módulo (React Router `route.lazy` v7.5+ o `React.lazy`+Suspense) | alto | remix.run/blog lazy |
| A2-18 | Manifest central de módulos (id, título, ruta, icono, componente lazy) para router + PDF uniforme | bajo | patrón plugin-registry |
| A2-19 | Validación: Zod v4 por defecto; Valibot si el bundle es crítico (sub-1 KB) | medio | valibot.dev; comparativas |
| A2-20 | Esquema por módulo codifica límites físicos/normativos + mensajes ES; validar antes del motor | bajo | práctica |
| A2-21 | Vitest (v4, oct-2025) para unit + snapshots de resultados commiteados y revisados en PR | alto | vitest.dev/guide/snapshot |
| A2-22 | Property-based testing con @fast-check/vitest para invariantes normativos (monotonía, mínimos) | alto | npm @fast-check/vitest |
| A2-23 | `vite-plugin-pwa` (Workbox) para PWA instalable; `generateSW` precachea app-shell | alto | github vite-pwa |
| A2-24 | Offline-first: precache app-shell + tablas; prompt "nueva versión" (autoUpdate/SWR) | medio | github vite-pwa |
| A2-25 | Build estático en CDN; manifest válido (192/512, standalone, start_url) + HTTPS; cuidar `base` | medio | github vite-pwa |

---

## ÁREA 3 — Visualización SVG en vivo + UX

| ID | Afirmación (resumen) | Soporte | Fuente clave |
|----|----------------------|---------|--------------|
| A3-01 | SVG inline en JSX para gráficos generativos/interactivos (control total) | alto | Strapi; LogRocket |
| A3-02 | Render declarativo: esquema como datos → `.map()`; D3 solo matemáticas, React pinta | alto | Capital One; Medium |
| A3-03 | SVG manual basta; no usar charting libs (Recharts/Nivo/Victory) para diagramas técnicos | medio | Medium; Capital One |
| A3-04 | visx como plan B si se necesitan primitivas low-level | medio | Medium; Capital One |
| A3-05 | Quedarse en SVG; Canvas/konva solo > ~3.000–5.000 nodos (muy por debajo) | alto | SVGGenie; LogRocket |
| A3-06 | `useMemo` para geometría dependiente de inputs (solo si es perceptiblemente costoso) | alto | react.dev/useMemo |
| A3-07 | Feedback inmediato; transiciones CSS sobre atributos SVG; debounce solo si hay jank real | medio | Strapi; NN/g |
| A3-08 | Modelar como grafo nodos+tramos con cotas/etiquetas como metadatos | medio | Capital One; práctica |
| A3-09 | Coordenadas calculadas para topología fija; auto-layout solo si varía mucho | bajo | opinión ingeniería |
| A3-10 | `viewBox` en unidades del dominio (mm); tamaño por CSS; auto-escalado gratis | alto | MDN; CSS-Tricks |
| A3-11 | `preserveAspectRatio="xMidYMid meet"` (default) para no deformar el esquema | alto | MDN; Practical SVG |
| A3-12 | Auto-encuadre: bbox de los datos + padding → viewBox (no `getBBox()` del DOM) | medio | SVGGenie; CSS-Tricks |
| A3-13 | WCAG 1.4.1 (A): el color no puede ser el único medio; pista redundante al rojo/verde | alto | W3C WCAG 1.4.1 |
| A3-14 | Codificación multicanal: color + grosor + patrón + etiqueta directa sobre el elemento | alto | Colorblind.io |
| A3-15 | WCAG 1.4.11 (AA): contraste ≥ 3:1 para objetos gráficos con significado | alto | W3C 1.4.11; G207 |
| A3-16 | Evitar rojo↔verde como única distinción (daltonismo); reforzar con icono/etiqueta | alto | Colorblind.io; AudioEye |
| A3-17 | Feedback inmediato sin botón "calcular" (visibilidad del estado, Nielsen) | alto | UXPin; NN/g |
| A3-18 | Layout inputs-izq/visual-der/resultado: convención razonable, NO regla NN/g — validar | bajo | opinión; UX Lift |
| A3-19 | Minimizar clics; defaults CTE sensatos; agrupación visual por instalación | medio | UX Lift; UXPin |
| A3-20 | Formularios numéricos: unidad visible, validación inline, defaults precargados | medio | UXPin; NN/g |
| A3-21 | svg2pdf.js + jsPDF (JS-only en navegador); fijar versiones compatibles (v2.7.0 ene-2026) | alto | github svg2pdf.js |
| A3-22 | Registrar fuentes no básicas en jsPDF ANTES de svg2pdf (Ø, ², ñ) | alto | github svg2pdf.js |
| A3-23 | Decidir texto vivo embebido (seleccionable) vs paths/outlines (fiel pero no accesible) | alto | SVGMaker; typst/svg2pdf |
| A3-24 | Construir SVG con features soportadas; validar transforms/viewBox/CSS con conversión real | medio | github svg2pdf.js releases |
| A3-25 | Atributos de presentación inline (no CSS externo) para fidelidad en export | medio | github svg2pdf.js |
| A3-26 | ARIA: `role="img"` + `<title>`/`<desc>` + `aria-labelledby`; alt ≤ ~250 car. | alto | Smashing; TPGi |
| A3-27 | Marcar `aria-hidden` lo decorativo ya descrito en texto | alto | Smashing; CSS-Tricks |
| A3-28 | SVG responsive: sin width/height fijos; viewBox + contenedor fluido | alto | CSS-Tricks; MDN |

---

## ÁREA 4 — Ficha justificativa + export PDF

| ID | Afirmación (resumen) | Soporte | Fuente clave |
|----|----------------------|---------|--------------|
| A4-01 | jsPDF 4.2.1 + jspdf-autotable 5.0.8 + svg2pdf.js 2.7.0 (mutuamente compatibles); fijar versiones | alto | npm registries |
| A4-02 | Acentos/ñ exigen fuente TTF Unicode embebida (14 estándar = solo ASCII) | alto | jsPDF npm |
| A4-03 | Embeber TTF: fontconverter o `addFileToVFS`+`addFont`; cada variante por separado | alto | jsPDF npm/docs |
| A4-04 | autotable: `showHead:'everyPage'`, `pageBreak`, temas; `'grid'` para fichas técnicas | alto | jsPDF-AutoTable GitHub |
| A4-05 | Header/footer con nº de página vía `willDrawPage`/`didDrawPage`; "X de Y" requiere 2 pasadas | alto | jsPDF-AutoTable |
| A4-06 | Metadatos vía `setDocumentProperties`; sin PDF/A robusto nativo | alto | jsPDF docs |
| A4-07 | jsPDF es bajo nivel (sin reflow); manejable para ficha de plantilla fija + tablas | medio | Nutrient; DEV |
| A4-08 | svg2pdf añade `doc.svg(el,{x,y,w,h})` (Promise); crear doc en `'pt'`; pasar DOM real | alto | github svg2pdf.js |
| A4-09 | svg2pdf NO soporta foreignObject, filtros, máscaras, animaciones, unidades≠px, gradientes en stroke | alto | svg2pdf Issue #82 |
| A4-10 | Texto en SVG hereda límite de fuentes: embeber antes; minimizar texto dentro del SVG | alto | github svg2pdf.js |
| A4-11 | svg2pdf da vectores PDF nativos (no rasteriza); nítido y ligero; mapear width/height↔viewBox | medio | github svg2pdf.js |
| A4-12 | jsPDF+svg2pdf+autotable = mejor encaje para PWA estática con SVG vectorial + tablas | medio | Nutrient; npm-compare |
| A4-13 | pdfmake: mejor layout automático, SVG más limitado (plan B tabular) | medio | Nutrient; npm-compare |
| A4-14 | @react-pdf/renderer: componentes React, SVG inferior a svg2pdf para diagramas | medio | react-pdf-kit; npm-compare |
| A4-15 | Descartar `@media print` como entrega formal (no determinista) | bajo | opinión; Nutrient |
| A4-16 | Puppeteer = máxima fidelidad pero rompe "sin backend" | medio | Nutrient; DEV |
| A4-17 | Base legal: justificación va en Memoria (Anejo I, RD 314/2006); la ficha es parte de ella | alto | BOE RD 314/2006 |
| A4-18 | Secciones mín.: identificación · normativa(art/tabla/edición) · datos partida · cálculo · veredicto · observaciones | medio | VerificaciónCTE; fichas COAC |
| A4-19 | Existen fichas normalizadas por colegios (COAC/COAAT) = estándar de facto; alinear formato | medio | COAC; arquitectosdecadiz |
| A4-20 | Plantilla común: `renderFicha(doc, FichaData)`; módulos solo producen datos | medio | síntesis A4-04/05/06+18 |
| A4-21 | Dos tablas estándar: "Datos de partida" y "Verificación" (grid; resaltar veredicto) | medio | jsPDF-AutoTable |
| A4-22 | Cabecera/pie comunes por hook con nº página y datos de proyecto | alto | jsPDF-AutoTable; jsPDF docs |
| A4-23 | Citar DB + exigencia + artículo/tabla + EDICIÓN/fecha (los DB se modifican) | alto | BOE FOM/588/2017; codigotecnico |
| A4-24 | Trazabilidad: cada dato de partida declara su origen (input/tabla DB/UNE/clima) | medio | VerificaciónCTE; ficha Almería |
| A4-25 | Sello de generación + versión del motor + edición DB en pie/metadatos (no sustituye firma) | bajo | opinión buena práctica |

---

## ÁREA 5 — Estrategia, mercado y SEO

> Aviso transversal: volumen de keywords NO verificable (Keyword Planner gated) → toda cifra de
> volumen de búsqueda es estimación de baja confianza.

| ID | Afirmación (resumen) | Soporte | Fuente clave |
|----|----------------------|---------|--------------|
| A5-01 | CYPE migró a suscripción "CYPE one" (~64–125 €/usuario/mes); suite BIM pesada, no desk tool | alto | shop.cype.com |
| A5-02 | CYPETHERM HE Plus es GRATIS y reconocido oficialmente para HE1/HE0/HE4 → amenaza a Tier1-HE1 | alto | info.cype.com |
| A5-03 | HULC (oficial, gratis) referencia para HE1/certificación pero pesada/anticuada | alto | codigotecnico.org |
| A5-04 | Competidor casi idéntico: Normatia (calculadoras CTE gratis + tier "Proyectos" + API/MCP) | alto | normatia.com |
| A5-05 | Mercado de calculadoras CTE gratis ya poblado (konstruir, INGESCO, Casals, fabricantes) | alto | konstruir.com; ingesco.com |
| A5-06 | DesignBuilder/EnergyPlus = simulación avanzada, no compite con desk tool | medio | ecoeficiente.es |
| A5-07 | VerificaciónCTE/EasyCTE = adyacentes (validan/externalizan), posibles partners | medio | verificacioncte.es; easycte.com |
| A5-08 | ~50.000 arquitectos colegiados / 30 colegios (CSCAE); ejercientes de pago bastantes menos | medio | cscae.com |
| A5-09 | Histórico paro/precariedad → sensibilidad alta al precio (datos antiguos, contextual) | bajo | archdaily (2014) |
| A5-10 | 119.601 viviendas visadas obra nueva 2024; 35,3 M m²; +7% → volumen recurrente de fichas | alto | cscae.com |
| A5-11 | WTP: tickets bajos-medios (decenas €/mes o 1–3 €/ficha); referencia = "vs gratis" | medio | cedreo; javadex; A5-01 |
| A5-12 | "Calculadora X CTE" como gancho validada pero saturada en términos top | alto (táctica)/bajo (volumen) | poweredbysearch; A5-04/05 |
| A5-13 | Intención de búsqueda = resolver tarea gratis YA → embudo largo; conversión en la ficha | medio | patrón observado |
| A5-14 | Oportunidad SEO real en nichos jóvenes/menos servidos: HS6 radón, SUA8 rayo | medio | easycte; certicalia |
| A5-15 | Long-tail localización (zona climática/radón/viento/nieve) = activo SEO programático reutilizable | medio | normatia.com |
| A5-16 | Modelo dominante = freemium: cálculo gratis + ficha/proyecto/API de pago | alto | normatia.com; info.cype.com |
| A5-17 | Pago por ficha/proyecto (créditos) encaja con uso intermitente; reduce fricción | bajo | inferencia A5-09/11 |
| A5-18 | Bundle con "Concreta estructura" como palanca de pricing/retención | bajo | suposición estratégica |
| A5-19 | Repriorizar: HE1 NO primero (regalado oficialmente + caro de modelar); HS3/HS5 cabeza de Tier1 | medio | A5-02/03/04/05 |
| A5-20 | HS6 radón buen gancho (nicho joven); SUA8 rayo fácil/autocontenido pero ya servido | medio | A5-05/14 |
| A5-21 | Tier3 (DB-SI, HE0/4/5) correcto como "caro/después"; REBT/RITE complementarios tardíos | medio | A5-01/06 |
| A5-22 | App hermana = canal de lanzamiento de mayor ROI (cross-sell, menor CAC) | bajo | suposición |
| A5-23 | COAs (30) + CSCAE = canal de distribución/credibilidad; CYPE ya tiene convenio nacional | medio | cscae; coacm.es |
| A5-24 | La FICHA justificativa es el diferenciador defendible y el cobro, no la calculadora | medio | patrón Normatia/CYPE |
| A5-25 | Adquisición de bajo CAC = SEO programático + contenido + comunidad; boca a boca fuerte (~50k) | medio | soloarquitectura; arquiparados |

---

## Afirmaciones de mayor riesgo (entran a verificación prioritaria)

Marcadas por los propios agentes como dudosas, ambiguas o no verificadas:

- **A1-08, A1-12** (HS4 tablas 2.1/4.2): desalineación en extracción del PDF → emparejamiento aparato↔valor sin confirmar.
- **A1-23** (HE1 Tabla 3.1.1.a): filas inferiores (UT/UMD/UH) ambiguas por maquetación.
- **A1-26** (puentes térmicos): ψ numéricos no extraídos.
- **A1-07** (HS3 conductos 4.2/4.3): tablas no transcritas.
- **A1-11** (K simultaneidad): afirmación "no prescrito por el CTE" — verificar que no haya método en HS4.
- **A2-06, A2-11** (Vite 8 / navegadores Tailwind): versiones y fechas a confirmar.
- **A4-01** (versiones exactas npm): confirmar compatibilidad declarada.
- **A5-02** (CYPETHERM HE Plus gratis y oficial): pilar de la repriorización — verificar.
- **A5-04** (Normatia competidor): verificar alcance real (tiers, API/MCP).
- **A5-08, A5-10** (cifras de mercado): confirmar fuente oficial.
