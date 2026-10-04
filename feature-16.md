# feature-16 — Rediseño v4 · Fase 6: La obra

> Fase 6 de [REDISENO-V4.md](REDISENO-V4.md) §4. Escrito antes de empezar y cerrado el
> 2026-10-04, con lo que cambió respecto al plan en «Desviaciones».
> Referencia visual: la pantalla «La obra» de las maquetas v4
> (https://claude.ai/artifact/HS4vCeqgyM7Xozjzj9dnQg), versión 11.

## Objetivo

La obra deja de ser el tablero de la fase A (checklist, tarjeta Anejo y tarjeta de datos) y
pasa a ser **el sitio desde el que se entrega**: qué se justifica y cómo va cada cosa, lo que
queda por mirar antes de entregar y los tres entregables —la memoria redactada, las fichas y
los esquemas para el plano— a un clic.

Hito (REDISENO-V4 §4): **del edificio al anejo sin salir del flujo.** Con el Demo: se abre
La obra, se ve qué falta, se va al módulo, se vuelve y se descargan la memoria (Word y PDF),
el anejo de fichas (PDF) y los esquemas de saneamiento y fontanería (DXF).

## Principios

- **El estado se calcula, no se guarda.** Hoy la barra lateral y el tablero leen el
  `resultadoCache` que escribe cada módulo al abrirse, así que, si se cambia El edificio,
  enseñan un estado viejo hasta que se abre el módulo. Desde la fase 5 los cinco módulos se
  deducen del edificio y los cinco motores juntos tardan unos 2 ms: el estado de cada
  justificación se calcula siempre a partir del expediente, con la misma composición de
  entradas que usa el módulo (por defecto ← guardadas ← heredadas). Desaparece el caché.
- **Lo que no se ha abierto también cuenta.** Un módulo sin entradas guardadas se calcula
  con las decisiones habituales: es lo que vería el proyectista al abrirlo. El anejo y la
  memoria lo incluyen igual.
- **Lo que no cumple no se cuela en la entrega.** La memoria y el anejo marcan como
  pendiente el apartado que no cumple, en vez de pegar un texto que lo da por bueno.
- **La prosa sale de los módulos.** La obra no redacta nada nuevo de los cinco módulos: usa
  sus `frase`, `textoAviso`, `textoIncumplimiento`, «Qué entra» y memoria.

## Alcance

### A. La evaluación del expediente (`src/lib/obra/`, PURA)

- `modulos.ts`: un adaptador por módulo publicado (HS3, HS4, HS5, HS6, HE1) con sus valores
  por defecto, cómo se justifica con el edificio y los datos de la obra, y sus textos (frase,
  avisos, incumplimientos, «Qué entra» y memoria).
- `evaluar.ts`:
  - `estadoEfectivo(proyecto, key)`: las entradas con que se calcula, con
    `mergeInputsHeredados` (sin la URL), igual que `useJustificacionState` al montar.
  - `evaluarExpediente(proyecto)`: por justificación del registry, su **estado de obra**
    (`cumple` · `revisar` · `no_cumple` · `no_aplica` · `externo` · `pronto` · `sin_datos`),
    la frase, las piezas de «Qué entra», los avisos sin revisar y lo que no cumple, ya
    redactados. Memorizada por objeto de proyecto (`WeakMap`): el proyecto es inmutable y
    cada cambio es un objeto nuevo.
- `progreso.ts` pasa a leer de aquí: `estadoDe` y `resumenProyecto` calculan en vez de leer
  el caché. Se retiran `resultadoCache`, `actualizarResultado` y su efecto en
  `ModuleLayout`.

### B. «Lo que se justifica» (`lib/obra/filas.ts`)

- Filas por DB en el orden del registry. Cada una: estado (icono y palabra), código, título,
  las partes del edificio que entran como piezas y enlace al módulo.
- Las piezas salen de «Qué entra» de cada módulo: «6 viviendas», «garaje · bombeo»,
  «local · previsión», «local → RITE». Las de trato especial van en el color de acento.
- Las «pronto» de un mismo grupo se juntan en una fila («SI1–6 · Seis apartados»,
  «SUA1 · SUA4 · SUA7 · SUA8 · SUA9», «HE4·5 · ACS y fotovoltaica»), con piezas descriptivas
  del edificio, sin cifras de normas que la herramienta aún no justifica.
- HE0 (HULC) pasa del grupo «Externas» al de energía, como en la maqueta.
- Se conserva lo de la fase A: el menú ⋯ para forzar «aplica» o «no aplica», el párrafo del
  «no aplica» (se despliega) y la referencia del documento externo.
- Recuento arriba: «1 cumple · 3 por revisar · 1 no cumple · 1 no aplica · 1 externo ·
  15 pronto».

### C. «Antes de entregar» (`lib/obra/entrega.ts`)

- Lo que no cumple primero (en rojo) y después los avisos sin revisar (en ámbar), con el
  código del módulo y su texto. Cada uno lleva al módulo.
- Vacío: «Nada pendiente: todo lo justificado cumple y está revisado».

### D. Los entregables (`components/obra/`)

Tres tarjetas, como en la maqueta, con su recuento:

1. **Memoria CTE de instalaciones** — «✓ 5 de 6 apartados · HE1 no cumple» · Word · PDF.
   Apartados: los cinco módulos que aplican más los «no aplica» con su párrafo.
2. **Fichas justificativas** — «✓ 4 de 5 fichas» · PDF. Es el anejo de hoy
   (`GeneradorAnejo`), que pasa a incluir los módulos sin entradas guardadas.
3. **Esquemas para el plano** — «✓ 2 esquemas» · DXF. La sección de saneamiento (HS5) y la
   de fontanería (HS4), con sus diámetros.

### E. La memoria CTE (`/p/:id/memoria`, `lib/obra/memoria.ts`)

- Página nueva, «Memoria CTE» en la barra lateral bajo «El edificio», con el recuento de
  apartados listos.
- Los apartados en el orden del registry: el texto de cada módulo que aplica (el de su
  pestaña Memoria), los «no aplica» con su párrafo y cita, las externas con su referencia y,
  al final, lo que aún no redacta la herramienta. El que no cumple sale con un aviso en rojo
  en pantalla y como pendiente en el Word y en el PDF.
- «Copiar todo» (texto plano), «Word» y «PDF».

### F. Exportadores

- **Word** (`lib/docx/`): port del de Concreta (`plan.ts` puro + `render.ts` con la librería
  `docx`), con la tipografía del estudio (Arial 10, títulos negros, tablas a 8 pt, A4). La
  librería se carga bajo demanda. Dependencia nueva: `docx`.
- **PDF de la memoria** (`lib/pdf/memoria.ts`): jsPDF con la cabecera y el pie del anejo.
- **DXF** (`lib/dxf/`): el escritor R12 de Concreta (cp1252, capas, vista inicial) y un
  conversor **SVG → DXF** pequeño: el dibujo en modo papel se pasa a texto con
  `renderToStaticMarkup`, se lee con `DOMParser` y sus `line`, `rect`, `circle`, `path`
  (M, L, H, V, Z y sus relativas) y `text` pasan a LINE, CIRCLE y TEXT. Capas por un atributo
  `data-capa` en los grupos del dibujo (EDIFICIO, RED, TEXTOS…); lo transparente (zonas de
  clic) y las tramas se descartan. Escala: 22 unidades del dibujo = 1 m, como la sección.

### G. La pantalla

- Cabecera: nombre, piezas de la obra («Obra nueva», «Cáceres · 459 m», «zona climática
  C4», «radón II», «6 viviendas · local · garaje») y «Editar los datos».
- «Por dónde se empieza», con el enlace a El edificio («Definir» si está vacío, «Revisar»
  si no).
- Dos columnas en escritorio (lo que se justifica | lo que se entrega + antes de entregar);
  una en móvil.
- Se retiran `ChecklistJustificaciones`, `TarjetaAnejo`, `TarjetaDatosProyecto` y
  `ChipEstado` si dejan de usarse.

## Fuera de alcance

- El asistente IA de la maqueta (el botón «Asistente»).
- Esquemas DXF de HS3, HS6 y HE1 (el conversor sirve; falta decidir qué dibujo va al plano).
- Editar la memoria: se revisa, no se edita (decisión de la v1).
- Cifras de las justificaciones «pronto» (SI, SUA, REBT…).

## Definición de hecho

- [x] Typecheck, lint y build limpios.
- [x] Tests en verde (831): evaluación (los cuatro casos de El edificio y el Demo), filas y
      recuento, «Antes de entregar», memoria ensamblada, plan y render del Word, PDF de la
      memoria, escritor y conversor DXF, esquemas del Demo, y UI de La obra, la Memoria (sobre
      el router real) y la barra lateral.
- [x] La barra lateral cambia al cambiar El edificio sin abrir el módulo
      (`components/obra/test/sidebar-vivo.test.tsx`: HS4 pasa a «no cumple» con seis plantas).
- [x] Capturas de La obra en claro, Ónice y móvil a 390 px, y de la Memoria en claro y Ónice.
      El Word abierto en Word (3 páginas, estilos «Título 1…3», tablas), el PDF rasterizado y el
      DXF auditado con ezdxf (R12, 0 errores, capas INS-EDIFICIO, INS-SANEAMIENTO,
      INS-FONTANERIA e INS-TEXTOS) y redibujado.

## Desviaciones

### El estado y su caché

- **El caché se retira entero**, no solo para la barra lateral: `resultadoCache`,
  `ResultadoCache`, `actualizarResultado` y el efecto de `ModuleLayout` desaparecen, y el Demo ya
  no lo siembra. `estadoDe` y `resumenProyecto` leen de `evaluarExpediente`. `Progreso` conserva
  sus cuatro valores para el anejo (`error` → «en curso»; `sin_datos` → «sin iniciar»).
- **Una publicada forzada a «no aplica» ya no se calcula.** Antes conservaba su progreso
  («aplicabilidad y progreso ortogonales»); ahora el «no aplica» manda, como en la memoria.
- **Dos estados más que en la maqueta:** `sin_datos` (nada de El edificio entra) y `error` (el
  motor no calcula con lo guardado). Ninguno sale en el Demo.
- **`contextoDe`** (en `lib/proyecto/derivar.ts`) junta `derivarContexto` y su fallback, que
  vivía en el provider: lo comparten el provider y la evaluación.

### La obra

- **Registry:** HE0 pasa al grupo del DB-HE con el código «HE0» (era «HE0/HE1» y no cabía en la
  barra lateral), y REBT al grupo «Electricidad (REBT)», como en la maqueta. DB-SE sigue en
  «Externas»: la maqueta no lo lista, pero era una decisión anterior.
- **Piezas de las «pronto», solo descriptivas.** La maqueta ponía «local · sector propio»,
  «viviendas · básica», «local 100 W/m²» o «más de 1.000 m²»: son afirmaciones de normas que la
  herramienta aún no justifica, así que solo se nombran las partes del edificio.
- **Lo que no cumple**, en «Antes de entregar» y en la memoria, es lo mismo que enseña el módulo:
  HS4 y HE1 solo los incumplimientos con arreglo (`textoIncumplimiento`); HS3, HS5 y HS6, la
  franja del elemento. Si no queda ninguno, un texto genérico que manda al módulo.
- **«Antes de entregar»** lleva el título y el detalle que redacta el módulo; la maqueta lo
  resumía en una frase.
- **«Por dónde se empieza»** se enseña siempre, como en la maqueta; el enlace dice «Definir El
  edificio» si no tiene zonas y «Revisar» si las tiene.
- **El menú ⋯ de aplicabilidad** se conserva en cada fila (no estaba en la maqueta): sin él no
  hay forma de forzar «aplica» o «no aplica».
- **La barra lateral** enseña «Memoria CTE 6/6» (apartados listos de los que se entregan); la
  maqueta ponía «5/22».

### Entregables

- **La memoria en pantalla no enseña el texto del apartado que no cumple**, solo sus motivos y
  el enlace al módulo: el texto del módulo lo da por bueno. En el Word y el PDF sale
  «Pendiente: este apartado aún no cumple…» con un motivo por línea.
- **Un solo DXF con los dos esquemas**, uno al lado del otro y con su título, en vez de un
  fichero por esquema. Lleva el dibujo de la ficha tal cual: en fontanería, también la gráfica
  de presiones por planta, y las etiquetas con su recuadro.
- **Escala del DXF:** 22 unidades del dibujo = 1 m. Es un esquema: las alturas de planta van
  acotadas (`ALTO_MIN`/`ALTO_MAX` de la sección) y lo horizontal no es a escala.
- **jsPDF del anejo bajo demanda.** `GeneradorAnejo` importaba `renderAnejo` estáticamente (ya
  desde la fase A) y jsPDF iba en el chunk principal: pasa de 1.028 kB a 613 kB (190 kB gzip).
  `GeneradorAnejo` deja de pintar su botón: lo pone quien lo monta (render prop).
- **`docx` 9.8.1** (Concreta usa 9.7.1); se carga solo al pedir el Word.
- **`formatearFecha`** compartido en `lib/ui/fecha.ts` para La obra, la memoria y el anejo; los
  cinco módulos y el Inicio conservan su copia.

## Pendiente

- **Decisiones propias a validar:** un DXF con los dos esquemas (o uno por esquema); la gráfica
  de presiones dentro del DXF de fontanería; «Por dónde se empieza» siempre visible; DB-SE en
  La obra; las piezas de las «pronto» sin cifras.
- **El DXF no se ha abierto en un CAD comercial**: se ha auditado y redibujado con ezdxf. Falta
  abrirlo en AutoCAD o BricsCAD e insertarlo en un plano.
- **Esquemas de HS3, HS6 y HE1**: el conversor sirve para cualquier dibujo en papel; falta
  decidir qué dibujo va al plano.
- **Las copias de `formatearFecha`** de los módulos y del Inicio.
- Lo pendiente de la fase 5 sigue igual (Cáceres en zona II, `calcHS6` y los `resumen.ts`).
