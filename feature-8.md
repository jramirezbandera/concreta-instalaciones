# feature-8 — Fase C · HS3/HE1 al patrón · vivienda tipo · anejo PDF

> Tercera feature del rediseño `UX-RECONCEPT.md` (§6.2, §7, §8, §11 Fase C). Extiende el
> módulo patrón de feature-7 a **HS3 y HE1**, introduce la **vivienda tipo** (la unidad
> repetitiva de la colectiva) con generadores por módulo, y construye el **anejo PDF del
> expediente** (portada + índice + fichas + no-aplicables + externas). Es el hito de demo:
> *"anejo de unifamiliar en una tarde"*. Los motores NO cambian de lógica (única excepción:
> `nombre?: string` opcional en `Estancia`/`Colectivo` de HS3, que el motor ignora — HE1 ya
> tiene nombres). La pista IA (§12, "importar cuadro de superficies") es una feature aparte.

## Objetivo

Al terminar: HS3 y HE1 se editan con el outliner + esquema compacto sincronizado; en un
proyecto de colectiva el usuario define viviendas tipo y genera de un clic las redes de
HS3/HS4/HS5 propuestas ("la herramienta propone, el proyectista dispone"); y el botón
"Generar anejo CTE (PDF)" del dashboard produce UN PDF con portada, índice, las fichas de
las justificaciones trabajadas, los no-aplica con párrafo y cita, las externas con su
referencia y los pendientes listados con honestidad.

## Alcance

### A. HS3 al patrón (`src/modules/hs3/ui.tsx` + svg)

- **Modelo**: `Estancia` y `Colectivo` ganan `nombre?: string` (el motor lo ignora).
- **Formulario corto sobre la tabla** (no-colecciones): nº dormitorios + modo de conducto
  (rápido: nº plantas / avanzado: red de colectivos). Zona térmica sigue heredada.
- **Outliner de estancias** (colección plana, filas no anidables): columnas
  `Estancia` (nombre) · `Tipo` (select) · `Caudal` (numero l/s, propuesto) ·
  `Cocción` (numero l/s SOLO en filas cocina: >0 ⇒ `esCoccion:true`; vacío/0 ⇒ false) ·
  `Requerido` (resultado) · `Abertura` (resultado: cm² + adm./extr.) · `Estado`.
- **Red de colectivos (modo avanzado)**: segundo outliner jerárquico —
  colectivo (depth 0, nombre) → planta (depth 1, `nivel` numero) → referencia a estancia
  húmeda (depth 2, select entre húmedas). Enter añade hermano del mismo kind; sin
  Tab/Shift-Tab (jerarquía fija por construcción). Se conserva el sembrado
  `seedFromEstancias` como botón "Generar desde estancias".
- **Esquema** (panel 380 px plegable, patrón feature-7): la lógica actual (planta
  esquemática con flechas seco→húmedo; red de columnas si hay `result.red`) COMPACTADA,
  con las props nuevas `selectedId`/`hoverId`/`onSelect`/`etiquetas` (contrato de
  feature-7). Contrato PDF intacto (`HS3_PDF_SVG_ID`, `hs3NativeSize`).
- MobileTabBar Tabla/Esquema; detalle (balance, conducto, área de paso, warnings) bajo la
  tabla en `CollapsibleSection`; `valid` como hoy. Test de integración `hs3/test/ui.test.tsx`
  (patrón del de HS5: archivo propio, router real, timeout de chunk 8000).

### B. HE1 al patrón (`src/modules/he1/ui.tsx` + svg)

- **Outliner** cerramiento (depth 0) → capas (depth 1, interior→exterior; el ORDEN del
  array es la física: Enter inserta tras la fila) → puentes térmicos (depth 1, kind
  "puente"). Columnas (packing tipo HS4, el implementador puede ajustar dentro del patrón):
  `Elemento` (nombre) · `Tipo / Material` (select: tipoElemento | material | tipo de PT) ·
  `Flujo / L` (cerramiento: flujo select; puente: longitud m) · `e` (m) · `λ` · `R` (R
  directa input en capas) · `µ` · `Sd` · `U / R` (resultado: cerramiento "U ≤ Ulim"; capa
  R calculada) · `Estado` (cerramiento, con `extra` para "condensa"/"fRsi"; capa: marca si
  λ/µ orientativos). `caraInterior` se mantiene editable (donde mejor encaje: select del
  tipo o columna Flujo). "Condiciones de cálculo" (T/HR) siguen como formulario corto.
- **Esquema**: en pantalla, el panel muestra SOLO el cerramiento seleccionado (o el peor
  si no hay selección): sección por capas + barra U + Glaser apilados en 380 px. El modo
  `pdf` sigue pintando TODOS los cerramientos (la ficha no cambia). Props nuevas de
  sincronía; los comentarios "CONGELADO" de `he1/calc.ts`/`svg-meta.ts` se ACTUALIZAN para
  reflejar el contrato ampliado (retro-compatible).
- Test de integración `he1/test/ui.test.tsx`.

### C. Vivienda tipo (`src/lib/proyecto/viviendaTipo.ts` + tipos) — §6.2

- **Modelo aditivo** (schema "1" se conserva; campos opcionales, el import viejo sigue
  valiendo): en `Proyecto`:
  ```ts
  viviendasTipo?: { id: string; nombre: string; dormitorios: number;
                    banos: number; aseos: number }[];   // cocina y salón: siempre 1
  repartoPlantas?: { nivel: number; viviendas: { tipoId: string; cantidad: number }[] }[];
  ```
  Unifamiliar = caso degenerado: una vivienda tipo, sin reparto.
- **Generadores puros** (con tests; ids y nombres deterministas "P2 · T2 · Ramal baño"):
  - `generarHs5(vts, reparto)` → `{tramos, aparatos}`: colector → bajante → por planta y
    vivienda, ramales baño/aseo/cocina con los aparatos de los presets de feature-7.
  - `generarHs4(vts, reparto)` → `{tramos, aparatos}`: acometida → tubo → montante → por
    vivienda, derivación particular + derivación por aparato.
  - `generarHs3(vts, reparto)` → `{numDormitorios, estancias, modoConducto, redColectivos}`:
    estancias de la vivienda tipo MÁS desfavorable (la ventilación general se verifica por
    vivienda) + red colectiva con una planta por nivel del reparto referenciando sus
    húmedas (semántica multiplanta del kernel: la vertical tipo). El implementador DEBE
    leer la semántica real de `hs3/calc.ts` y ajustar honestamente; si varias viviendas
    por planta no son representables sin doble conteo, se genera la vertical tipo y se
    emite nota en la UI ("duplica colectivos si procede") — la herramienta propone.
- **UI**: tarjeta "Viviendas tipo" en el carril derecho del dashboard (editar tipos +
  reparto por planta; solo se ofrece reparto en colectiva). En HS3/HS4/HS5, botón
  "Generar desde viviendas tipo" en la toolbar del outliner (visible solo con viviendas
  tipo definidas): primera pulsación arma la confirmación ("¿Reemplazar la red actual?"),
  segunda aplica el generador sobre el estado (REEMPLAZA las colecciones; todo editable
  después). Nunca escribe sin confirmar.

### D. Anejo PDF (`src/lib/pdf/anejo.ts` + generador) — §8

- **Refactor** de `renderFicha`: extraer `renderFichaEnDoc(doc, data)` (pinta desde una
  página nueva del doc recibido); `renderFicha` queda como wrapper que crea el doc.
  Los snapshots de `toFichaData` (hs4/hs6) NO cambian — el refactor es solo del render.
- **`renderAnejo(entrada): Promise<PdfResult>`** con
  `entrada = { proyecto, derivados, estados (por justificación), fichas: {key, data}[] }`:
  1. **Portada**: "Anejo de justificación del CTE" + nombre del proyecto, municipio ·
     provincia, uso · intervención, chips derivados (zona climática/radón/altura con
     procedencia), fecha, sello motor + fingerprint del proyecto.
  2. **Índice** (página reservada tras la portada, rellenada al final con `setPage`):
     por grupo DB — código · título · estado (Cumple/No cumple/En curso/Pendiente/No
     aplica/Externa) · página (para las que tienen ficha).
  3. **Fichas** de cada justificación aplicable CON inputs guardados (una tras otra,
     `renderFichaEnDoc`), en el orden del registry.
  4. **No aplicables**: párrafo redactado + cita (de `aplicabilidadEfectiva` — el material
     ya existe en `aplicabilidad.ts`).
  5. **Externas**: destino (HULC / Concreta estructura) + `refExterna` si está informada.
  6. **Pendientes**: aplicables sin justificar aún, listadas con honestidad (incluye las
     "Próximamente" no shipped).
- **Generación desde el dashboard** (`src/components/proyecto/GeneradorAnejo.tsx`,
  cableado en `TarjetaAnejo` — el botón por fin se habilita): al pulsar, importa
  dinámicamente los módulos shipped con inputs (`calc` + `ficha` + `svg`/`svg-meta`),
  ejecuta cada motor sobre `justificaciones[key].inputs`, monta los clones ocultos de los
  SVG en modo `pdf` (todos simultáneamente; los ids `*-svg-pdf` son únicos), espera al
  DOM y llama a `renderAnejo`; preview con `PdfPreviewModal` (reutilizar `usePdfPreview`).
  Si un módulo falla al calcular, su ficha se degrada a "no disponible" en el índice (el
  anejo nunca revienta). La ficha suelta por justificación no cambia.

## Definición de Hecho

- HS3 y HE1 editables al patrón (outliner + esquema sincronizado + teclado) con sus
  motores y fichas intactos; los 4 módulos de cálculo comparten el mismo lenguaje.
- Flujo colectiva: definir T2 + reparto → "Generar desde viviendas tipo" en HS5 →
  red multiplanta propuesta → veredicto real. Flujo unifamiliar: demo completa hasta el
  anejo con portada/índice/no-aplica correcto (el hito).
- Anejo verificado sobre el proyecto Demo: portada, índice con páginas correctas, 5
  fichas (los shipped sembrados), SUA6/SUA7/HR según atributos, externas con destino,
  pendientes listados. `bun run test:run` todo en verde; snapshots de motor Y de ficha
  (hs4/hs6 `toFichaData`) intactos; tsc/lint/build limpios.
- Tests nuevos: generadores de vivienda tipo (unit + property: nº de aparatos ∝ reparto,
  ids únicos, determinismo), `renderAnejo` (estructura: nº páginas > fichas, índice
  completo — con SVG degradado a placeholder en jsdom si hace falta), integración
  ui de HS3 y HE1, tarjeta de viviendas tipo.
- WCAG AA en lo nuevo; sin `Date.now`/`Math.random` en motores ni generadores.

## Desviaciones registradas (implementación 2026-08-23)

- **`ProyectoContext.actualizarViviendasTipo(vts, reparto, nowIso)`**: mutador nuevo (el
  spec no lo nombraba). Es edición de usuario ⇒ toca `modificado`; listas vacías eliminan
  los campos (mismo criterio que overrides/refExterna). El editor vive en
  `components/proyecto/TarjetaViviendasTipo.tsx` (carril derecho del dashboard); el reparto
  por planta solo se ofrece en colectiva.
- **Generar desde viviendas tipo** (HS3/HS4/HS5): el botón exige **dos pulsaciones** — la
  primera arma la confirmación ("¿Reemplazar la red actual?"), la segunda aplica; `blur`
  desarma. Nunca escribe sin confirmar. En HS3 las `notas` del generador se muestran en el
  toast (vertical tipo / varias viviendas por planta).
- **`generarHs3` devuelve `GeneracionHs3` con `notas: string[]`** (previsto como opción en
  el spec, confirmado en la implementación): con varias viviendas por planta se genera UNA
  vertical tipo y se avisa, porque HS3 no permite referenciar la misma estancia en varias
  plantas sin doble conteo. La herramienta propone; el proyectista duplica si procede.
- **`renderAnejo` devuelve `AnejoResult extends PdfResult`** con `paginasFichas` (página
  inicial de cada ficha), para que los tests validen el índice sin re-parsear el PDF.
  `EntradaAnejo` recibe `fecha` YA formateada (la capa PDF no llama a `Date`).
- **`GeneradorAnejo` en dos fases**: calcular e importar dinámicamente los motores → montar
  los clones ocultos de los SVG → doble `requestAnimationFrame` → `renderAnejo`. Es
  obligado porque el raster lee los diagramas DEL DOM. Un módulo que no calcule se omite
  con aviso y queda listado como pendiente: el anejo nunca revienta.
- **Bug de robustez corregido en `lib/pdf/utils.ts`** (no previsto en el spec): el raster
  esperaba la decodificación de la imagen SIN plazo, así que un `Image` que no dispara
  `load` ni `error` colgaba el PDF **para siempre** ("Generando…" eterno). Ahora el
  contexto 2D se reserva ANTES (si no hay, se falla al instante) y la espera va acotada a
  5 s; agotado el plazo se cae al placeholder que ya existía. Afecta también a las fichas
  sueltas, no solo al anejo.
- **Etiquetas de lo generado**: los aparatos (HS3/HS4/HS5) y las derivaciones de aparato
  reciben `nombre` legible — "P1 · T2 · Baño", "Deriv. cocina" — porque sin él la tabla
  mostraba el id crudo (`p1-vt1-bano-cuarto-bano-cisterna`) justo tras el clic de "generar".
  El nombre SITÚA el elemento (planta · vivienda · cuarto); el tipo exacto lo da la columna
  contigua del outliner, así que no se duplica.
- **Bug de consistencia entre generadores** (detectado al testear): `masDesfavorable` no
  aplicaba la regla "ante id duplicado gana la PRIMERA aparición" de `resolverReparto`, así
  que con dos viviendas tipo del mismo id HS3 podía dimensionar con la homónima ensombrecida
  mientras HS4/HS5 usaban la primera. Alcanzable importando un `.json` editado a mano.
- **`testTimeout: 15000` en `vite.config.ts`**: los tests de integración montan el router
  real con pantallas `lazy()`; con el valor por defecto (5 s) el test moría antes que su
  propio `waitFor` de 8 s y el fallo se leía como "timed out" en vez de como error real.

## Fuera de alcance

- Asistente IA (§12) — "importar cuadro de superficies" es feature propia previa a la
  demo, no entra aquí. · Fase D (checkers nuevos) · Fase E (reformas).
- Drag & drop / multiselección del outliner; fuentes TTF embebidas en el PDF (los
  símbolos no Latin-1 siguen transliterándose, comportamiento actual).
- HS6 al patrón: ya ES el prototipo del formato checker (§4.3) — no se toca.
