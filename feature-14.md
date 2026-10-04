# feature-14 — Rediseño v4 · Fase 4: HS5 patrón

> Fase 4 de [REDISENO-V4.md](REDISENO-V4.md) §3.2, §3.3, §3.4 y §4. Escrito antes de empezar
> y cerrado el 2026-10-04, con lo que cambió respecto al plan en «Desviaciones».
> Referencia visual: la pantalla HS5 de las maquetas v4
> (https://claude.ai/artifact/HS4vCeqgyM7Xozjzj9dnQg), versión 11.

## Objetivo

HS5 deja de ser una tabla de tramos con un esquema al lado y pasa a ser **la justificación
de la evacuación del edificio**: entra lo que hay en El edificio, el proyectista toma tres o
cuatro decisiones y el dibujo, grande, enseña cada cifra con lo que la decide. Es el módulo
patrón: lo que se construye aquí (contrato de resultado, «Qué entra», decisiones, etiquetas
sobre el dibujo, franja, lista, memoria redactada, avisos revisables) lo reutilizan HS4,
HS3, HS6 y HE1 en la fase 5.

Hito: **HS5 como en la maqueta, con el motor detrás**, en los cuatro casos de El edificio.

## Principios

- **El motor sigue siendo puro** y devuelve datos, no prosa. La prosa (la frase de la
  cabecera, «lo que manda», los avisos y la memoria) sale de funciones puras de texto, que se
  testean por separado.
- **La red se deduce del edificio.** La tabla de tramos sobrevive como modo avanzado,
  «Ajustar a mano» (decisión 1 de REDISENO-V4 §7).
- **Ninguna cifra nueva sin verificar.** Las tablas de pluviales, la intensidad del
  apéndice B y lo que se diga del bombeo y de la unión con el alcantarillado pasan por el
  agente `cte-normativa` antes de entrar en `tablas.ts`
  (`research/verificacion-hs5-pluviales.md`).

## Alcance

### A. Contrato de resultado (`src/lib/cte/resultado.ts`)

Los tipos de REDISENO-V4 §3.2, compartidos por todos los módulos:

- `ElementoResultado`: id estable, tipo, veredicto (`ok` · `fail` · `previsto` ·
  `criterio`), valor, límite, **lo que manda** (`Gobierno`), alternativa descartada, uso de
  la capacidad y cita.
- `Gobierno`: `capacidad_tabla` · `minimo_aparato` · `no_menor_que_aguas_arriba` ·
  `decision_proyectista` · `altura_edificio` · `cota` (los dos últimos son nuevos: la
  ventilación la decide el nº de plantas y el bombeo, la cota).
- `Aviso`: id estable, tipo (`supuesto` · `caso_especial` · `fuera_de_alcance`), elemento
  al que apunta y acción opcional.

### B. Motor de residuales (`modules/hs5/calc.ts`)

Cambios compatibles con la entrada actual:

- `TramoInput.plantas?`: la altura de la bajante en plantas (Tabla 4.4), por bajante. Sin
  él, `numPlantas` como hoy.
- `AparatoInput.uso?`: el uso de la Tabla 4.1 por aparato. Hace falta para un edificio de
  viviendas con oficinas (aseos de uso público). Sin él, el uso de la red.
- **UD por ramal de planta medidas** (REDISENO-V4 §5): la mayor de las UD de los ramales y
  aparatos que acometen a la bajante, en vez de UD total / plantas.
- Por tramo, la explicación en datos:
  - `diametroPorCapacidad_mm`: el Ø que da la tabla por unidades;
  - `elevadoPor`: qué lo sube (el desagüe de un aparato o un tramo de aguas arriba, con el
    aparato que lo origina);
  - `alternativa`: el Ø tabulado inmediatamente menor y su capacidad;
  - en las bajantes, el detalle de las dos comprobaciones (UD totales y UD por ramal).
- Ventilación secundaria en plantas alternas: el Ø de la columna se lleva a un Ø de la
  Tabla 4.10 (hoy sale «Ø55»), según lo que diga la verificación (§6 de REDISENO-V4).

Cambian los snapshots de `calc.test.ts`, y es intencionado: los campos nuevos y la UD por
ramal medida. Cualquier otro cambio sería una regresión.

### C. Pluviales (`modules/hs5/pluviales.ts`)

- Tablas 4.6 (sumideros), 4.7 (canalones), 4.8 (bajantes), 4.9 (colectores) y B.1
  (intensidad por zona e isoyeta), con su procedencia, una vez verificadas.
- Factor f = i / 100 sobre la superficie servida.
- Cubierta plana → sumideros; inclinada → canalones. Bajantes de pluviales propuestas por
  la superficie (editables), colector de pluviales hasta la arqueta.
- Cada pieza devuelve un `ElementoResultado`.

### D. La red desde El edificio (`modules/hs5/red.ts`)

Puro. Del edificio y las decisiones sale la red de residuales (el `HS5Inputs` de siempre) y
lo que no es red de UD:

- **Verticales.** Las viviendas del mismo tipo se apilan: una vertical por posición de cada
  tipo. Cada vertical baja por una bajante de baños y otra de cocina («Propia»), o por una
  sola («Con los baños»). Un ramal por planta y bajante recoge sus cuartos húmedos (baño y
  aseo agrupados de la Tabla 4.1; la cocina con fregadero, lavavajillas y lavadora).
- **Unifamiliar.** Los baños en la planta más alta y la cocina y el aseo en la baja, como
  supuesto declarado. Lo que acomete a la planta del colector va directo al colector.
- **Oficinas.** Una vertical por núcleo de aseos, con inodoros y lavabos de uso público
  (adelantado de la fase 5: es poco y deja los cuatro casos completos).
- **Colector general**, colgado del techo del sótano o enterrado bajo la planta más baja, con
  la pendiente de la decisión. Recibe todas las bajantes.
- **Local sin uso:** conexión prevista, sin UD.
- **Garaje bajo rasante:** si su suelo queda por debajo de la cota del alcantarillado,
  bombeo con separador de grasas, como aviso que el proyectista revisa. Si no, por gravedad.
- **Cubierta:** superficie y tipo para pluviales.

### E. La justificación (`modules/hs5/justificacion.ts`, `textos.ts`, `memoria.ts`)

- `justificarHs5(entrada)`: corre el motor de residuales y el de pluviales y devuelve los
  elementos (colector general, una bajante de cada clase por vertical, el ramal más cargado,
  pluviales, ventilación, previsión del local, red del garaje, conexión al alcantarillado),
  los avisos, el veredicto y los datos de cada etiqueta del dibujo.
- `textos.ts`: la frase de la cabecera, «lo que manda» y las cuentas de la franja, y el
  texto de cada aviso.
- `memoria.ts`: los párrafos de la memoria, la tabla resumen y la línea de fuentes, como en
  la maqueta. «Copiar texto» copia el texto plano.

### F. Datos de la obra

`DatosGenerales` gana dos datos opcionales, como la zona de radón:

- `pluviometria?: { zona: "A" | "B"; isoyeta }`, leída por el proyectista de la Figura B.1
  (salvo que la verificación encuentre una relación oficial por municipio);
- `cotaAlcantarillado_m?`: la cota del alcantarillado en la acometida.

Sin ellos HS5 calcula con un supuesto y lo avisa. Se editan en Datos de la obra.

### G. Avisos revisables (REDISENO-V4 §3.4)

- `JustificacionEnProyecto.revisados?: string[]` y `marcarRevisado(key, id, sí/no)` en el
  contexto del proyecto.
- Cumple con avisos sin revisar → veredicto `warn` en la caché: la barra lateral enseña «!»
  y la cabecera, «N cosas por revisar».
- Un aviso revisado llega a la ficha como «revisado por el proyectista».

### H. Cáscara común (`components/justificacion/`)

| Pieza | Qué hace |
|---|---|
| `QueEntra` | Las partes del edificio y cómo las trata esta justificación («se calcula», «previsión», «bombeo», «pluviales»). Pulsar una fila selecciona su elemento. Enlace «Editar el edificio». |
| `Decision` | Pregunta numerada, opciones, «Lo habitual» y la consecuencia en una línea. |
| `DibujoConEtiquetas` | El SVG con las cifras como botones HTML en % sobre las anclas. Estado multicanal (punto, borde, texto). |
| `FranjaDetalle` | Acepta el detalle estructurado: qué es, cifra grande y estado · lo que manda y nota · cuentas, capacidad usada y cita. Sigue aceptando el texto de hoy para los demás módulos. |
| `ListaComprobaciones` | La pestaña Comprobaciones de HS5: elemento, resultado y estado en texto. Es la alternativa accesible al dibujo. |
| `VistaMemoria` | Modo texto: los párrafos con las cifras resaltadas, «Copiar texto» y la ficha PDF a un clic. |
| `ModuleLayout` | `queEntra` sustituye a «Del proyecto»; avisos con id, «Ver en el dibujo» y «Marcar como revisado»; Comprobaciones con la columna izquierda si el módulo lo pide. |

### I. El dibujo: la sección del edificio (`modules/hs5/seccion.ts`, `SeccionHs5.tsx`)

La sección de la maqueta, calculada del edificio y de la red: plantas con sus cotas,
forjados, terreno, una vertical por **tipo** (las iguales se dibujan una vez, con «× n»),
cuartos húmedos, bajantes con su ventilación, pluviales por las fachadas, local, colector
colgado o enterrado, arqueta y salida, garaje con sumideros, separador y pozo. Grupos de
más de tres plantas iguales se dibujan comprimidos. `anclasHs5()` da el punto de cada
etiqueta en el viewBox. En papel, las etiquetas van como `<text>` dentro del SVG (svg2pdf no
ve HTML).

El esquema de columna de hoy se queda para «Ajustar a mano».

### J. La pantalla (`modules/hs5/ui.tsx`)

- **Desde El edificio** (por defecto): Qué entra + cuatro decisiones (alcantarillado ·
  colectores y pendiente · bajante de la cocina · ventilación) con «Volver a lo habitual»; el
  dibujo con etiquetas; la franja; avisos a lo ancho; Comprobaciones = la lista; Memoria =
  el texto.
- **«Ajustar a mano»**: copia la red generada a la tabla de tramos y la abre en
  Comprobaciones; el dibujo pasa al esquema de columna y la izquierda enseña «Red ajustada a
  mano · Volver a generar desde El edificio». Pluviales, local, garaje y ventilación siguen
  saliendo del edificio.

### K. Ficha y anejo

- `toFichaData` desde la justificación: datos de partida del edificio y de las decisiones,
  una verificación por elemento, los avisos con su estado de revisión y el dibujo en papel.
- `renderFicha` gana una sección opcional «Memoria» con los párrafos (los demás módulos no
  la usan).
- `GeneradorAnejo` pasa el edificio y los datos de la obra al adaptador de HS5.

### L. Demo

El Demo abre HS5 desde El edificio con las decisiones habituales y la cota del
alcantarillado a −1,20, y su caché se calcula con `justificarHs5`.

## Fuera de alcance

- Dimensionar el pozo y las bombas (ap. 4.6): se cita y se pide al proyecto.
- Colectores mixtos (ap. 4.3) y válvulas de aireación.
- Varias cubiertas a distinta cota, terrazas y patios.
- Locales con actividad: siguen siendo previsión.
- HS4, HS3, HS6 y HE1 (fase 5).

## Definición de hecho

- [x] Typecheck, lint y build limpios. El build sigue avisando de un chunk de más de
      500 kB y de importaciones dinámicas que no parten el chunk, como en las fases 2 y
      3: el Demo importa los motores de forma estática, y ahora también `estado` y
      `justificacion` de HS5.
- [x] 715 tests en verde (657 al empezar). En `calc.test.ts` de HS5 solo cambian los tres
      snapshots, y por lo previsto:
      - los campos nuevos;
      - la UD por ramal medida, que cambia el `motivo` de dos bajantes, aunque no su Ø;
      - la columna de ventilación secundaria del caso de 10 plantas, que pasa de «Ø55» a Ø65
        de la Tabla 4.10.
      Ninguna ficha de otro módulo cambia.
- [x] Tests nuevos:
      - `pluviales.test.ts`: tablas, f, sumideros, canalones y propiedades. El colector
        nunca es menor que las bajantes y más lluvia nunca pide menos Ø;
      - `red.test.ts`: los cuatro casos, verticales repetidas, decisiones y altura de las
        bajantes;
      - `justificacion.test.ts`: el Demo con las cifras de la maqueta, y los supuestos y
        casos especiales;
      - `textos.test.ts`: frase, franja, avisos, memoria, ficha y geometría de la sección;
      - una propiedad de la envolvente de la Tabla 4.4 en `calc.test.ts`;
      - `ModuleLayout`: frase, avisos revisables, «Qué entra» y memoria en texto;
      - `ui.test.tsx` de HS5, reescrito sobre el router real: cabecera, «Qué entra»,
        decisiones, cifras del dibujo, franja, revisar y deshacer, lista, memoria y
        «Ajustar a mano» de ida y vuelta;
      - Datos de la obra: zona pluviométrica, isoyeta y cota del alcantarillado.
- [x] Tablas nuevas verificadas en `research/verificacion-hs5-pluviales.md`. El agente
      `cte-normativa` leyó el HS 5 de 2009, el consolidado de 2022, la versión con las marcas
      del RD 450/2022 y los comentarios del Ministerio de 2025.
- [x] Capturas revisadas:
      - HS5 en claro y en Ónice, con la selección de una cifra y un aviso revisado;
      - las tres pestañas y los cuatro casos de El edificio;
      - móvil a 390 px;
      - el dibujo en papel y la ficha PDF renderizada página a página;
      - Datos de la obra con los campos nuevos.

## Desviaciones

- **Intensidad de lluvia: un dato de la obra, no por municipio.** El plan decía «apéndice
  B por municipio INE». La verificación confirma que el DB solo da un mapa (Figura B.1) y
  la Tabla B.1, sin ninguna relación oficial por municipio. Por eso es una entrada manual
  en Datos de la obra, como la zona de radón: zona A o B e isoyeta, de 10 a 120. Sin ella
  se calcula con 100 mm/h y se avisa, con un enlace a Datos de la obra.
  - **El Demo no la rellena.** Cáceres cae junto al límite de zonas y de isoyetas del mapa
    (70, 90 o 125 mm/h): no hay un valor que se pueda dar por bueno. El Demo enseña ese
    aviso.
  - **Cota del alcantarillado.** Es otro dato de la obra (−1,20 en el Demo). Sin ella se
    supone que los sótanos quedan por debajo y se avisa.
- **Altura de bajante (Tabla 4.4): envolvente cuando es ambigua.** El DB no dice si
  cuentan las plantas que desaguan o las que atraviesa la bajante. Ejemplo: P1–P3 bajan
  por la PB hasta el techo del sótano, y son 3 o 4 plantas. Ninguna columna es siempre la
  más segura: «más de 3» admite más UD en la bajante y menos por ramal.
  - Si las dos lecturas caen a lados distintos del 3, se entra con las dos y manda la peor.
  - Lo lleva `TramoInput.plantasAtravesadas`.
  - Es criterio y va a las observaciones de la ficha. En el Demo no cambia ningún Ø.
- **Ventilación secundaria con la Tabla 4.10.** El Ø de la columna sale de la tabla y es,
  además, de al menos la mitad del de la bajante. Como el motor no conoce el trazado, la
  longitud se estima en 3 m por planta, por criterio, y se dice en la ficha.
  `HS5Inputs.ventilacionSecundaria` permite disponerla aunque no sea obligatoria.
- **f en la Tabla 4.9, por criterio.** El DB lo pide para las tablas 4.7 y 4.8. A la 4.9
  se aplica porque también está referida a 100 mm/h, y se dice en la ficha.
- **Edición del HS 5.** Todas sus tablas citan ya el «consolidado de 14-06-2022 (tablas
  sin cambios desde 23-09-2009)», y la cabecera dice «DB-HS5 (consolidado 2022)», como
  recomienda la verificación §F.
- **Oficinas, adelantadas.** Los núcleos de aseos generan su vertical, con inodoros y
  lavabos de uso público. Es poco, y así los cuatro casos de El edificio quedan completos.
  `AparatoInput.uso` permite mezclar el uso privado de las viviendas con el público de las
  oficinas.
- **Local sin uso: criterio de proyecto.** El HS 5 no exige la previsión. Se dice así en
  la franja, en la memoria y en la cita («Criterio de proyecto · HS 5 · ap. 1.1»). No suma
  UD.
- **Garaje.**
  - Sumideros sifónicos.
  - Separador de grasas antes del pozo, porque el pozo no admite grasas (ap. 3.3.2.1 y
    3.3.1.5).
  - Al menos dos bombas en alternancia y alimentación de 24 h. El equipo no se dimensiona.
  - Un garaje privado sobre rasante no es un elemento: es un sumidero más.
  - Los cuatro sumideros del dibujo son ilustrativos: el DB no fija un número.
- **Contrato.** Lo que se añadió al de REDISENO-V4 §3.2:
  - `Gobierno` gana `altura_edificio` y `cota`;
  - `Alternativa.porQueNo` es «capacidad» o «minimo», no otro `Gobierno`;
  - la prosa vive en `textos.ts`, `memoria.ts` y `entra.ts`, todas puras, y no en el motor;
  - los tipos de presentación (estado, detalle y memoria) van en
    `lib/cte/presentacion.ts`.
- **Decisiones.**
  - Se guardan como «habitual» mientras coinciden con lo habitual, así que siguen al
    edificio: si aparece un sótano, los colectores pasan a colgados.
  - La pendiente forma parte de la decisión 2: si no es el 2 %, dice «No es lo habitual».
  - Al enterrar los colectores, el 1 % se desactiva.
- **Comprobaciones con la columna izquierda.** La fase 1 la quitó porque el outliner no
  cabía. La lista nueva es estrecha, y así la lleva la maqueta. Con «Ajustar a mano» vuelve
  el outliner a todo el ancho, con la lista debajo.
- **Memoria en texto.** La pestaña enseña el texto redactado con «Copiar texto», y la
  ficha PDF queda a un clic. La ficha gana una sección «Memoria» opcional al principio;
  ningún otro módulo la usa todavía.
- **El dibujo.**
  - Las verticales iguales se dibujan una vez («× n»).
  - Los grupos de más de 3 plantas iguales se comprimen en una banda.
  - Por debajo de 560 px el dibujo conserva ese ancho y se desplaza en horizontal dentro
    de su zona (`LienzoAjustado.anchoMin`). Sin eso, las cifras se pisaban en el móvil.
  - En papel, lo pendiente no se colorea: ya lo dicen las observaciones.
- **PDF: Ø, · y ².** `pdfStr` los cambiaba por «ph», «x» y «2», aunque los tres son
  Latin-1 y la Helvetica de jsPDF los pinta. Ahora se conservan, y el signo menos de las
  cotas pasa a guion. Afecta a las fichas de todos los módulos: dicen «Ø110» en vez de
  «ph110». Ningún test ni snapshot dependía de ello.
- **Versión del motor.** `ENGINE_VERSION` sigue en 0.1.0. Subirla cambiaría los snapshots
  de ficha de HS4 y HS6, que esta fase no debe tocar (ver «Pendiente»).

## Pendiente

- **Subir `ENGINE_VERSION`** al cerrar la v4. Cambian las fórmulas y las tablas de HS5, y la
  versión se sella en todas las fichas. Hay que volver a aprobar los snapshots de ficha de
  HS4 y HS6.
- **Bajantes de pluviales.** Se proponen: una por cada dos sumideros, o dos en cubierta
  inclinada. El estado ya admite cambiarlas (`bajantesPluviales`), pero falta el control.
- **Revisión de avisos.** Va por id: si cambian los datos del aviso (otra cota), sigue
  revisado. Habría que invalidarla cuando cambien.
- **Unifamiliar.** El reparto de cuartos por planta es un supuesto. Se avisa, y se corrige
  con «Ajustar a mano».
- **Lo que dejó abierto la verificación** (`research/verificacion-hs5-pluviales.md`,
  «Pendientes»):
  - una Figura B.1 legible;
  - cotejar con el BOE la celda Ø315 al 1 % de la Tabla 4.9 y la fórmula 4.2 del bombeo;
  - qué disposición actualizó las UNE del HS 5;
  - que el responsable del proyecto valide los criterios: envolvente de la Tabla 4.4, uso
    público del sumidero de garaje, columna de la Tabla 4.13 para PVC, f en la 4.9 y qué es
    una bajante «sobredimensionada».
- **Fuera de alcance, sin cambios:**
  - dimensionar el pozo y las bombas (ap. 4.6);
  - colectores mixtos (ap. 4.3);
  - válvula antirretorno y arquetas intermedias;
  - varias cubiertas, terrazas y patios;
  - locales con actividad.
- **Ficha.** El título «OBSERVACIONES» puede quedar solo al pie de una página. Es cosa de
  `renderFicha`, común a todos los módulos.
