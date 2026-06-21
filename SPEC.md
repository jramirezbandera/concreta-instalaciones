# SPEC — Concreta Instalaciones (Tier 1)

> Especificación general del producto. App web (PWA estática) de **predimensionado de
> instalaciones + ficha justificativa CTE** para arquitectos españoles. Este SPEC cubre el
> **Tier 1** (HS3, HS5, HS4, HE1) más sus cimientos compartidos.
>
> Decisiones de I+D verificadas en `IDR-INSTALACIONES.md` (cargar la §N que toque). Este SPEC
> traduce ese I+D + las decisiones de alcance de la sesión de scoping en un plan ejecutable.
> Cada `feature-N.md` está dimensionado para ser **una tarea de Modo Planificación**.

---

## 1. Motivación

El arquitecto no quiere modelar el edificio entero; quiere *"este patinillo de ventilación,
¿cumple HS3? dame el número y el papel"*. El hueco de mercado —confirmado en el I+D— es el
**predimensionado rápido de mesa + la ficha justificativa lista para pegar en la memoria del
proyecto** (RD 314/2006, Anejo I).

Ese hueco está **libre**: las herramientas existentes o solo verifican (no predimensionan), o
exigen modelar el edificio entero (CYPE/HULC), o solo consultan normativa (Normatia, que **no**
calcula ni justifica — ver §0 del I+D). No hay competidor casi idéntico → no hay pérdida de
ventaja de primer movimiento.

**El moat no es la calculadora** (mercado saturado de calculadoras gratis), **es el
predimensionado real + la FICHA justificativa** con trazabilidad normativa, más la suite con
"Concreta estructura".

## 2. Valor diferencial (transversal a todos los módulos)

1. **Ficha justificativa autogenerada.** El cliente paga por *no escribir la justificación del
   CTE*. Cada módulo exporta un PDF: datos de entrada (con origen) → referencia
   artículo/tabla/edición del DB → cálculo → veredicto CUMPLE / NO CUMPLE.
2. **Visual primero.** Render SVG en vivo (planta/sección/esquema) con el elemento crítico en
   rojo. Sello de Concreta; casi nadie lo ofrece bien en instalaciones.
3. **Velocidad de mesa.** Cero modelado del edificio. Entras un local/tramo/cerramiento, sale el
   número. *"Desk tool, not CYPE."*

## 3. Alcance de este SPEC

**Dentro:** Tier 1 completo — **HS3** (ventilación), **HS5** (saneamiento), **HS4** (fontanería),
**HE1** (transmitancia U + condensaciones, solo predimensionado de envolvente) — más los
**cimientos compartidos**. Cada módulo se entrega como **vertical completo** (ver §5, Definición
de Hecho).

**Fuera (no-goals declarados):**

- ❌ **Cuentas, pagos y freemium.** Sin login, créditos, paywall ni suscripción. Todo gratis y
  100 % local en este SPEC. (Monetización → SPEC posterior.)
- ❌ **Tier 2 y Tier 3.** HS6 radón, SUA8 rayo, SUA1/SUA4, HR, DB-SI, HE0/HE4/HE5, REBT, RITE →
  SPECs posteriores.
- ❌ **Justificación energética completa.** HE1 se limita a predimensionado de U / envolvente /
  condensaciones **por elemento**. NO se replica HULC/CYPETHERM ni el modelado del edificio
  entero.
- ❌ **Backend y SEO programático server-side.** Sin servidor; sin generación de páginas
  municipio×parámetro en backend → SPEC posterior.

## 4. Restricciones e innegociables

### Innegociables (el SPEC los impone a TODOS los módulos)

1. **Arquitectura 100 % estática, sin backend, offline-first PWA.** Todo el cálculo en cliente;
   despliegue estático en CDN; funciona offline. *(§5/§6 del I+D.)*
2. **Motor determinista.** Funciones puras `calcular(inputs)` sin React/DOM; **sin `Date.now` /
   `Math.random`** en el motor (determinismo para snapshots). Tablas CTE **como datos
   versionados con procedencia** (DB + edición), nunca hardcodeadas. Testeable aislado. *(§11.)*
3. **Trazabilidad de la ficha.** Toda ficha cita **DB + artículo/tabla + EDICIÓN/fecha del DB**,
   declara el **origen de cada dato de partida**, sella **versión del motor + edición DB**, y
   emite veredicto **CUMPLE / NO CUMPLE** explícito. *(§8.)*
4. **Accesibilidad WCAG AA.** El elemento crítico nunca se distingue solo por color (1.4.1),
   contraste ≥ 3:1 para objetos gráficos con significado (1.4.11), codificación multicanal
   (color + grosor + patrón + etiqueta), **resultados numéricos siempre también en texto/tabla**
   (no solo en el SVG), ARIA en SVG (`role="img"` + `<title>`/`<desc>`). *(§7.)*

### Restricciones de stack (recomendadas, fijar versiones — **no** elevado a innegociable)

Versiones verificadas en §5/§6 del I+D; usar como base y **fijar exactas** salvo razón de peso:

- React **19.2** + React Compiler 1.0 (eslint-plugin-react-hooks **v7**, como estructura) · Vite
  **8** · Tailwind **v4** (CSS-first, `@tailwindcss/vite`) · Vitest **4** + `@fast-check/vitest`
  · `vite-plugin-pwa` (Workbox). Gestor: **bun**.
- **Validación: tipos TS con sufijo de unidad + sistema de `warnings` del motor** (NO Zod — se
  sigue el patrón probado de "Concreta estructura"; decisión de scoping de feature-0).
- **PDF (enfoque probado de estructura, sobrescribe la investigación web de §6 del I+D):**
  **jsPDF 4.2.1 + svg2pdf.js 2.7.0**, SIN `jspdf-autotable` (tablas a mano con `drawTable` del
  motor vendorizado).
  - **Fuentes:** NO se embeben TTF Unicode. Se sanea a **Latin-1 con Helvetica** (`pdfStr`): los
    acentos/ñ ya están en Latin-1 (U+00A0–U+00FF) y se conservan; solo griego/√/≤/Ø/superíndices
    se sustituyen por ASCII.
  - **Diagrama SVG → PNG rasterizado** (`embedSvgAsImage`), NO svg2pdf vectorial: svg2pdf@2.7
    genera degradados/soft-masks que **Acrobat rechaza** (lección de producción de estructura).
    Aun así los SVG se construyen con **primitivas planas** (color/grosor/patrón inline) por
    fidelidad y para mantener la opción vectorial abierta a futuro.

### Frontera con "Concreta estructura" (dependencia reutilizada)

Se reutilizan de la app hermana (no se reescriben aquí):

- **Motor de export PDF** (helpers vendorizados de `lib/pdf/utils.ts`: `drawHeader`,
  `drawFootersAllPages`, `drawTable`, `embedSvgAsImage`, `pdfStr`, `inputsFingerprint`,
  `STATUS_LABEL`). Sobre ellos se construye **aquí** una `renderFicha(doc, FichaData)` unificada
  (mejora: estructura tenía un renderer por módulo).
- **Theming light/dark + design system** (tokens Tailwind v4, patrón ThemeProvider, layout,
  lucide-react). Fuente = system-ui (no se arrastran las webfonts Geist de estructura).
- **Config base de proyecto/PWA** (setup Vite + React Compiler, vite-plugin-pwa, Vitest, patrón
  router lazy + manifest de módulos, `useModuleState`/`usePdfPreview`).

Reutilización materializada como **fork/vendor** en app standalone (estructura es un repo
independiente de un solo paquete, no un monorepo). Se construye **nuevo aquí**: utils de
cálculo/unidades, `renderFicha` unificada, primitivas SVG, tablas CTE versionadas y todo lo
específico de instalaciones. *(Ver `feature-0.md`.)*

## 5. Definición de Hecho por módulo (vertical completo)

Un `feature-N.md` de módulo **no está terminado** hasta tener TODO:

1. **Motor puro** `calcular(inputs)` con tablas-como-datos versionadas.
2. **Schema/validación** (Zod) con límites físicos/normativos y mensajes en ES.
3. **Render SVG en vivo** con elemento crítico resaltado (multicanal, WCAG AA).
4. **Ficha PDF** vía `renderFicha` con trazabilidad completa y veredicto.
5. **UI** del módulo (feedback inmediato, sin botón "calcular"; unidades visibles).
6. **Tests:** snapshots de resultados commiteados + property-based de invariantes normativos
   (monotonía, mínimos, no-regresión).

## 6. Prerrequisito normativo transversal (§9 del I+D)

Antes de codificar los sub-cálculos que las usan, **transcribir y verificar celda a celda contra
el PDF maquetado de codigotecnico.org** las tablas aún no transcritas. Esto es una **tarea previa
bloqueante** dentro de cada feature afectada:

- **HS3:** Tablas 4.2 / 4.3 (secciones de conducto de extracción por caudal y clase de tiro
  T-1…T-4). → bloquea el sub-cálculo de conductos de HS3 (`feature-1`).
- **HS4:** confirmar emparejamiento aparato↔valor de Tablas 2.1 / 4.2 (corrección A1-08: fregadero
  no doméstico ACS 0,20 dm³/s; falta fila "Lavamanos 0,05/0,03"). → `feature-3`.
- **HE1:** ψ de puentes térmicos (DA DB-HE/3) y procedimiento Glaser + fRsi,min (DA DB-HE/2). →
  `feature-4`. (El método global Klim engloba puentes térmicos como alternativa no bloqueante.)
- **HE1 — Tabla 3.1.1.a Ulim:** usar la **tabla CORREGIDA del §0** del I+D (la investigación
  original invirtió filas; huecos NO se limitan a 5,7). Verificar contra el PDF al implementar.

---

## 7. ÍNDICE PRIORIZADO DE FEATURES

> Orden = repriorización §12 del I+D (HS3 → HS5 → HS4 → HE1), precedido por los cimientos.
> Cada feature es una tarea de Modo Planificación autocontenida.

| # | Feature | Archivo | Por qué este orden | Bloqueado por |
|---|---------|---------|--------------------|---------------|
| **0** | **Cimientos compartidos** | `feature-0.md` | Todo vertical completo necesita la base antes que los módulos | — |
| **1** | **HS3 — Ventilación** | `feature-1.md` | Cálculo más repetitivo en vivienda + altísimo valor visual (flechas de flujo). Primer módulo | feature-0; transcribir HS3 4.2/4.3 |
| **2** | **HS5 — Saneamiento** | `feature-2.md` | Máxima confianza (tablas verificadas celda a celda en §1); valida el patrón con bajo riesgo normativo | feature-0 |
| **3** | **HS4 — Fontanería** | `feature-3.md` | Esquema isométrico con tramo crítico en rojo; Excel aquí es doloroso. Requiere lectura literal de 2 tablas | feature-0; confirmar HS4 2.1/4.2 |
| **4** | **HE1 — U + condensaciones** | `feature-4.md` | Al final: compite con gratis oficial (que exige modelar el edificio) y es el más caro de modelar bien. Solo predimensionado por elemento | feature-0; transcribir ψ/Glaser |

---

## 8. Trazabilidad

- I+D verificado: `IDR-INSTALACIONES.md` (§0 correcciones · §1 HS5 · §2 HS3 · §3 HS4 · §4 HE1 ·
  §5 stack · §6 PDF · §7 SVG · §8 ficha · §9 pendientes · §10 mercado · §11 arquitectura · §12 UX).
- Idea original: `IDEA-INSTALACIONES.md`.
- Detalle por afirmación: `research/area-1..5-*.md` + `research/verif-area-1..5.md`.
