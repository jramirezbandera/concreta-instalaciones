# feature-15 — Rediseño v4 · Fase 5: HS4, HS3, HS6 y HE1 al patrón de HS5

> Fase 5 de [REDISENO-V4.md](REDISENO-V4.md) §4 y §5. Escrito antes de empezar, el
> 2026-10-04; lo que cambie respecto al plan irá a «Desviaciones» al cerrar cada módulo.
> Referencia visual: las pantallas HS4, HS3, HS6 y HE1 de las maquetas v4
> (https://claude.ai/artifact/HS4vCeqgyM7Xozjzj9dnQg), versión 11.
> Patrón: [feature-14.md](feature-14.md) (HS5).

## Objetivo

Los cuatro módulos que quedan pasan a ser, como HS5, **la justificación del edificio**: entra
lo que hay en El edificio, el proyectista toma tres o cuatro decisiones y el dibujo, grande,
enseña cada cifra con lo que la decide. Mismo contrato de resultado (`ElementoResultado`,
`Gobierno`, `Aviso`), misma cáscara (`QueEntra`, `Decision`, `DibujoConEtiquetas`,
`FranjaDetalle`, `ListaComprobaciones`, `MemoriaTexto`) y la misma separación: el motor
devuelve datos y la prosa sale de funciones puras de texto.

Hito (REDISENO-V4 §4): **los cinco módulos como en la maqueta, con el motor detrás**, en los
cuatro casos de El edificio.

## Principios

- **Cada módulo es independiente** (REDISENO-V4 §4). Orden: HS4 → HS3 → HS6 → HE1. Cada uno
  se cierra con los tests en verde antes de empezar el siguiente.
- **El motor sigue siendo puro.** Los cambios en `calc.ts` son compatibles con la entrada de
  hoy (campos nuevos opcionales); los snapshots de motor que cambien lo harán solo por campos
  nuevos, y se dirá en «Desviaciones».
- **Se deduce del edificio**; lo que hoy se teclea (tramos, estancias, cerramientos) sobrevive
  como modo avanzado allí donde tiene sentido (HS4: «Ajustar a mano», como HS5).
- **Ninguna cifra nueva sin verificar.** Cada módulo tiene su verificación del agente
  `cte-normativa` en `research/verificacion-<módulo>-v4.md` antes de que sus cifras entren
  en `tablas.ts`.
- **Lo que no es exigencia no se pinta como «no cumple»**: la horquilla de velocidad de HS4 es
  `criterio`; los datos de partida son `in` (dato).

## Común

### A. Estados y avisos compartidos (`src/lib/cte/estados.ts`)

Lo que HS5 tiene dentro de `textos.ts` y `ui.tsx` y van a repetir los cuatro:

- `estadoDe(elemento, conAvisoPendiente)`: el veredicto, salvo un aviso sin revisar («por
  revisar»).
- `estadosDe(elementos, avisos, revisados)` y `pendientesDe(avisos, revisados)`.
- `veredictoConRevision(veredicto, pendientes)`: cumple con avisos sin revisar → `warn` (lo
  que cachea la barra lateral y el Demo).
- `redaccion.ts`: `cuantos`, `mayuscula`, `listaY` («A, B y C»), con los de HS5 movidos aquí.

HS5 pasa a usarlos sin cambiar su comportamiento.

### B. La sección del edificio, compartida (`src/lib/edificio/seccion.ts` + `components/edificio/PisosSeccion.tsx`)

La parte de `hs5/seccion.ts` que no es de HS5 —plantas con su cota, forjados, bandas de plantas
iguales comprimidas, rasante y terreno— se extrae para que HS4 y HS6 dibujen sobre la misma
sección. HS5 pasa a usarla sin que cambie su dibujo (test de geometría de `textos.test.ts`).

### C. Demo, anejo y caché

- El Demo abre los cinco módulos desde El edificio con las decisiones habituales y su caché
  sale de cada `justificar*` (cumple con avisos sin revisar → «warn»).
- `GeneradorAnejo` pasa el edificio y los datos de la obra al adaptador de cada módulo, como
  ya hace con HS5.
- `ENGINE_VERSION` sube al cerrar la fase (cambian tablas y fórmulas de los cinco motores): se
  vuelven a aprobar los snapshots de ficha, que ya cambian por el modo papel.

## HS4 · Suministro de agua

### Motor (`calc.ts`)

- Por aparato: `presionResidual_kPa` y el **desglose de lo que se pierde** hasta él (altura,
  rozamiento, localizadas), para la franja.
- `presionNecesaria_kPa`: la presión de partida con la que el punto más desfavorable llega
  justo a su mínimo. Es invertir el punto crítico: «Funciona desde X kPa».
- La velocidad fuera de la horquilla del material sigue sin contaminar el veredicto; en el
  contrato es `criterio`.

### La red desde El edificio (`hs4/red.ts`)

Puro. Del edificio y las decisiones sale el `HS4Inputs` de siempre más lo que no es red:

- **Unidades de consumo**: cada vivienda, cada planta de oficinas con sus núcleos de aseos y
  el local sin uso (previsto, sin aparatos). Un contador por unidad.
- **Contadores en batería** (lo habitual con más de una unidad): acometida → tubo de
  alimentación → batería en PB → un montante por unidad hasta su planta → derivación
  particular → cuartos húmedos → aparatos. **Por planta**: un montante general con los
  contadores en cada planta. **Unifamiliar**: contador general.
- Altura de cada punto de consumo sobre su planta y longitudes horizontales: supuestos de
  predimensionado, declarados en la memoria.
- Material según la decisión de tubería (multicapa · PE-X · cobre).

### La justificación (`hs4/justificacion.ts`, `textos.ts`, `memoria.ts`, `entra.ts`)

Elementos:

- **Presión de la red**: dato de partida (supuesto hasta que se confirme).
- **Presión por planta**: la del grifo más desfavorable de cada planta frente a su mínimo
  (100 kPa, 150 con fluxor o calentador). La peor es «el grifo más desfavorable».
- **Presión máxima**: el punto con más presión frente a 500 kPa.
- **Grupo de presión**: hace falta o no; si se añade, con la presión a su salida.
- **Montante y caudal de cada vivienda tipo** (`criterio`: velocidad dentro de la horquilla del
  material; simultaneidad de UNE 149201, criterio externo).
- **Acometida y tubo de alimentación** (`criterio`).
- **Local sin uso**: contador en la batería, llave y tubería en espera (`previsto`).

Avisos:

- presión de la red supuesta («Ya está confirmada» la marca como revisada);
- falta presión → «Añadir grupo de presión» (acción aplicable);
- agua caliente central: la red de ACS y su retorno quedan fuera de alcance.

### Decisiones

1. **Presión de la red**: paso de 10 kPa. Es el dato de la obra (`presionAcometida_kPa`):
   el control lo edita allí.
2. **Contadores**: batería en PB · por planta (solo con más de una unidad).
3. **Tubería**: multicapa · PE-X · cobre.
4. **Agua caliente**: individual · central.

Más el **grupo de presión**, que no es una decisión de la lista: se añade desde el aviso y se
quita desde su franja.

### El dibujo (`hs4/seccion.ts`, `SeccionHs4.tsx`)

La sección del edificio (común, §B) con la batería en PB, la acometida, el grupo si lo hay,
un montante por unidad (las iguales de un tipo, una vez con «× n») y las cajas de las
viviendas por planta; a la derecha, **la presión que llega a cada planta** en barras frente
al mínimo de 100 kPa. Las cifras son etiquetas pulsables.

«Ajustar a mano» (modo avanzado): copia la red a la tabla de tramos de hoy, como en HS5.

## HS3 · Calidad del aire interior

### Motor

- **Tabla 2.2 en uso**: garaje (120 l/s por plaza) y trasteros (0,7 l/s·m²), que hoy están en
  `tablas.ts` y ningún cálculo lee. Función pura `calcNoHabitables`: caudal, sistema,
  admisión, detección de CO y redes de extracción por planta, con lo que diga la
  verificación.
- **Varias viviendas tipo**: un cálculo por tipo (las estancias salen del programa del
  tipo), con su equilibrado, aberturas y conductos.

### La justificación

- Por vivienda tipo: cada local seco (admisión) y húmedo (extracción), el salón con lo que se
  suma para igualar, la campana, las aberturas de paso, el equilibrio y los conductos de la
  vertical.
- Garaje: extracción, entrada de aire y detección de CO. Trasteros: extracción.
- Local sin uso y oficinas: fuera de alcance, «se ventilarán según el RITE».

### Decisiones

1. **Sistema** de las viviendas: mecánica · híbrida.
2. **Por dónde entra el aire**: aireadores · aberturas en fachada.
3. **Si no cuadra lo que entra**: se suma al salón · se reparte.
4. **Garaje**: mecánica · natural (solo si hay garaje).

### El dibujo

Selector de parte: **una vista por vivienda tipo** y otra de **garaje y trasteros**. La
vivienda es una planta esquemática generada de su programa (dormitorios arriba, paso, salón,
cocina y baños abajo) con las flechas del camino del aire y, debajo, lo que entra y lo que sale
en dos barras. El garaje, un esquema con las plazas, el conducto de extracción, los detectores
y los trasteros.

## HS6 · Protección frente al radón

### Motor y tablas

- Corregir la deuda de `hs6/tablas.ts` (REDISENO-V4 §6) con la verificación nueva.
- **Qué toca el terreno, desde El edificio**: plantas bajo rasante y PB sin sótano debajo;
  qué es habitable y qué no.
- **Garaje como espacio de contención** (ap. 3.2): basta su ventilación de HS3.
- **Posición de la barrera** como decisión; **el núcleo que comunica garaje y PB**, como aviso
  que se revisa.

### Decisiones

1. **Dónde va la barrera bajo el garaje**: solera y muros · forjado de PB.
2. **Lo que apoya en el terreno sin sótano** (zona II): cámara ventilada · despresurización.
3. **Barrera**: lámina tipo · por cálculo.

### El dibujo

Sección por lo que toca el terreno: plantas que no lo tocan arriba, la PB, el garaje como
contención, la cámara bajo lo que apoya en el terreno, la barrera (que se mueve con la
decisión 1), el núcleo y las flechas del radón. Selección en el SVG (hoy HS6 no la tiene).

## HE1 · Envolvente térmica

### Motor y tablas

- **Tabla 3.2** (particiones interiores entre usos distintos) y la decisión del local sin uso:
  no habitable (envolvente, UT) · otra unidad de uso (tabla 3.2).
- **Huecos de verdad**: Uw desde Ug, Uf y la fracción de marco; sin fRsi ni Glaser (hoy son una
  capa ficticia).
- **Espesor mínimo que cumple** (invertir U) y **el límite que manda** (Ulim frente a UmaxFRsi)
  en el resultado, no en el SVG.
- **Cambio mínimo aplicable** cuando no cumple («Poner 50 mm», «Cambiar a bajo emisivo»).

### Los cerramientos desde El edificio

Fachada, cubierta, el suelo de la envolvente (sobre el local, sobre el garaje o sobre el
terreno) y las ventanas, con una composición tipo editable. La columna izquierda lista los
cerramientos con su U frente al límite; pulsar uno cambia el dibujo.

### Decisiones

1. **Aislante de la fachada**: espesor, en pasos de 10 mm.
2. **El local sin uso, para la envolvente**: no habitable · otra unidad (solo si hay local
   bajo viviendas).
3. **Humedad interior**: clase ≤ 3 · 4 · 5.

### El dibujo

La sección a escala del cerramiento seleccionado, con la curva de temperaturas en la fachada;
la ventana, en alzado con vidrio y marco.

## Fuera de alcance

- HS4: dimensionar la bomba del grupo y la red de ACS (impulsión y retorno).
- HS3: ventilación de locales y oficinas (RITE); el dimensionado de los extractores.
- HS6: la medición de la exhalación y el cálculo de la barrera «por cálculo» más allá de lo
  que dé la verificación.
- HE1: el coeficiente global K y el control solar (herramienta oficial).
- La obra (fase 6).

## Definición de hecho

- [x] Typecheck, lint y build limpios.
- [x] Tests en verde (776); los snapshots de motor que cambian, dichos en «Desviaciones».
- [x] Por módulo: `justificacion.test.ts` (los cuatro casos de El edificio), `red`/derivación,
      textos (frase, franja, avisos, memoria, geometría del dibujo) y `ui.test.tsx` sobre el
      router real. En HS6 y HE1 los textos van dentro de `justificacion.test.ts`.
- [x] Verificaciones normativas en `research/verificacion-{hs4,hs3,hs6,he1}-v4.md`.
- [x] Capturas revisadas de cada módulo en claro y Ónice, móvil a 390 px y la ficha PDF.

## Desviaciones

### Común

- **Dos estados más en el contrato.** `VeredictoElemento` gana `dato` (la presión de la red, la
  zona de radón) y `fuera` (fuera de alcance), que se pintan como «criterio» pero se rotulan
  «dato» y «fuera», como en las maquetas. `VEREDICTO_FICHA` pasa a `lib/cte/estados.ts`.
- **`Gobierno` gana** `presion_por_altura`, `velocidad`, `simultaneidad` y `dato_de_partida`.
- **`ModuleLayout`** gana `incumplimientos` (lo que no cumple, en rojo, con «Ver en el dibujo»
  y el cambio que lo arregla) y, en los avisos, `etiquetaRevisar` y `textoRevisado` («Ya está
  confirmada»). `FranjaDetalle` acepta una `accion` («Quitar el grupo de presión»).
- **`Paso` y `DecisionValor`** en `Decision.tsx`: decisiones que se ajustan a pasos (la presión
  de la red; el aislante de HE1).
- **Paletas de sección** en `lib/svg/paletaSeccion.ts` (el lint no deja exportar constantes
  desde el archivo del componente).
- **PDF: «³».** `pdfStr` lo cambiaba por «^3»; es Latin-1 y se conserva, como el «²».

### HS4

- **Verificación** (`research/verificacion-hs4-v4.md`): sin poder leer el PDF oficial; tres
  fuentes concordantes. Cambia lo que el código citaba:
  - edición: «consolidado 14-06-2022», con los valores de cálculo sin cambios desde 2009;
  - citas al punto: presiones ap. 2.1.3 ptos 2 y 3; velocidad ap. 4.2.1 pto 2 d); grupo de
    presión ap. 4.2.2 pto 1 b); Tablas 4.2 y 4.3, ap. 4.3 ptos 1 y 2;
  - **la simultaneidad K = 1/√(n−1) no es de UNE 149201** (no verificado, y probablemente
    falso): pasa a «método tradicional», criterio de proyecto. El valor `"une149201"` de
    `CriterioK` se conserva por compatibilidad con los expedientes guardados;
  - las pérdidas localizadas del 20–30 % **sí son del DB** (ap. 4.2.2 pto 1 a);
  - tablas nuevas: `GRUPO_PRESION`, `LIMITACION_PRESION`, `AHORRO_AGUA` y
    `CRITERIOS_PROYECTO_HS4` (este último, fuera de `tablaCTE`: no es CTE).
- **Snapshots del motor.** Cambian, y solo por:
  - los campos nuevos (`presionResidual_kPa`, `altura_m` y `perdidas` por aparato,
    `perdidas` por tramo y `presionNecesaria_kPa`);
  - los textos corregidos por la verificación (`motivo` de la Tabla 4.3, avisos de K, de la
    velocidad y del grupo, `normaCriterioK`).
  Ninguna cifra cambia.
- **La presión de la red es un dato de la obra.** La decisión 1 la edita en
  `DatosGenerales.presionAcometida_kPa`; el estado del módulo ya no la usa. Sin el dato, se
  calcula con 250 kPa y se avisa. Con el dato, el aviso «dato supuesto» se revisa con «Ya
  está confirmada».
- **El grupo de presión no es una decisión de la lista:** lo añade el aviso de «No cumple»
  (con la presión necesaria más 20 kPa, en decenas y nunca menos de 300) y lo quita su franja.
  Se supone de presión constante; la franja recuerda la presión de parada de uno
  convencional y qué plantas no deben depender de él (ap. 3.2.1.5.1).
- **Un solo «No cumple» por la presión**, el del punto más desfavorable, que nombra todas las
  plantas a las que no llega.
- **Puntos de consumo a 1 m del suelo** y longitudes tipo (`LONGITUDES_M`), declarados como
  criterio en la ficha. Con ellos, el grifo crítico del Demo es el fregadero de A3 (la cocina
  tiene la derivación más larga), no la ducha de la maqueta.
- **Local sin uso: Ø20**, el mínimo de la Tabla 4.3 para una derivación particular (la maqueta
  ponía Ø25).
- **Agua caliente.** «Individual» no comprueba el retorno: la decisión recuerda que hace falta
  si la ida llega a 15 m. «Central» es un aviso de fuera de alcance.
- **El dibujo.** El edificio ocupa la mitad izquierda; las cajas de la PB van a la derecha del
  patinillo, porque a la izquierda está la batería; las etiquetas de los montantes van sobre la
  planta 1. A mano, el dibujo es el esquema de columna de siempre.
- **«Ajustar a mano»** lleva también el criterio de simultaneidad y el porcentaje de pérdidas
  localizadas, que salen de la columna izquierda.

### HS3

- **Verificación** (`research/verificacion-hs3-v4.md`, sobre el consolidado de 2022, el BOE de
  FOM/588/2017 y los comentarios del Ministerio de 2025). Cambia el motor `calcHS3`, y por eso sus
  tres snapshots en línea (intencionado, como el Ø de HS5 en la fase 0):
  - **aberturas con el caudal adoptado**, 4·máx(qv, qva) y 4·máx(qv, qve): con el mínimo salían
    cortas en los locales que reciben caudal del equilibrado;
  - **paso por puerta**, máx(70, 8·qvp) con el caudal del local: antes, 8 × el caudal total de la
    vivienda, que el DB no pide;
  - **qvt equilibrado**: el conducto lleva la extracción ya igualada (en un T1, de 12 a 14);
  - entrada `sistema`: la **mecánica** dimensiona el conducto con la fórmula 4.1 (S ≥ 2,5·qvt);
    las tablas 4.2 a 4.4 solo valen para la híbrida;
  - edición «consolidado 14-06-2022» y citas al punto (Tabla 2.1, ap. 2 pto 3; Tabla 2.2, ap. 2
    pto 6; Tabla 4.1, ap. 4.1; tablas 4.2 y 4.4, ap. 4.2.1). Tablas nuevas:
    `SECCION_CONDUCTO_MECANICA`, `VIVIENDA_DISENO`, `HIBRIDA_CONDUCTOS`, `GARAJE_HS3`,
    `TRASTEROS_HS3` y `CRITERIOS_HS3` (fuera de `tablaCTE`).
- **El motor no se sustituye:** el equilibrado (`red.ts`, `equilibrar`) propone los caudales y
  `calcHS3` los verifica por local, con el total de húmedos, el equilibrio, la cocción y las
  aberturas. Los conductos por vertical, el garaje y los trasteros van en la justificación.
- **Equilibrado: «se reparte» es lo habitual**, no «al salón» como en la maqueta: lo propone el
  comentario del Ministerio al ap. 3.1.1. «Al salón» sigue como opción (y, si sobra admisión,
  la cocina). Los caudales repartidos tienen decimales (12,7 l/s); se enseñan con uno.
- **Un conducto por local húmedo y vertical**, que recoge ese local en todas las plantas
  (criterio, en la ficha). En mecánica se propone el Ø circular de una serie que cubre la
  sección. En la unifamiliar, cada conducto sirve a una planta.
- **Garaje.** 120 l/s por plaza; mecánica con ⌈S/100⌉ pares de aberturas (criterio) y dos redes
  desde 15 plazas; natural con 8·qv en cada fachada opuesta. La detección de CO se pide si se
  pasa de 5 plazas **o** de 100 m², a 100 ppm (se supone que no hay empleados). Lo habitual es
  mecánica, salvo garajes pequeños sobre rasante (el privado de la unifamiliar). Natural bajo
  rasante → aviso de las fachadas. Los dos detectores del dibujo son ilustrativos.
- **Trasteros** solo en edificios con viviendas (ap. 1.1); ventilan con el garaje si este es
  mecánico y están en su planta, y su caudal se suma (criterio).
- **Local sin uso y oficinas** no son elementos: van en «Qué entra» como «RITE» y en la memoria.
- **El dibujo** es una planta esquemática generada del programa de cada tipo (dormitorios y los
  baños de más arriba; salón, cocina y el primer baño con la entrada abajo), con el selector de
  parte (cada vivienda tipo y el garaje con los trasteros). La lista de Comprobaciones es la de
  la parte elegida. La ficha lleva la primera vivienda tipo.
- **Se retiran** el esquema en rejilla de la v1 (`hs3/svg.tsx`), su resumen y sus tests: la
  pantalla ya no edita estancias.

### HS6

- **Verificación** (`research/verificacion-hs6-v4.md`, sobre el consolidado de 2022 y el RD
  732/2019). Se corrigen `tablas.ts` y `calcHS6`, y por eso sus 10 snapshots (solo textos y los
  requisitos de altura que desaparecen; ningún veredicto cambia):
  - la difusión de la lámina tipo es **estrictamente menor** que 10⁻¹¹ m²/s (era ≤);
  - las puertas que interrumpen la barrera, **estancas y con cierre automático**;
  - el espacio de contención **no tiene altura mínima** en el DB (se quita la de 5 cm); un local
    no habitable ventilado conforme a HS 3 vale (`clase: "local_no_habitable"`);
  - la despresurización cuenta con red de captación y extracción; el **geotextil no es
    obligatorio** (solo si la solera se vierte encima);
  - edición «RD 732/2019 · consolidado 14-06-2022» y citas «ap.» al punto.
- **`calcHS6` ya no lo usa la pantalla:** la justificación v4 propone la protección desde El
  edificio y la especifica por lo que pide el DB (lámina ≥ 2 mm y difusión < 10⁻¹¹), sin
  inventar un producto. El motor queda corregido y con sus tests, por si vuelve a hacer falta
  verificar una solución tecleada.
- **Qué toca el terreno, por superficies útiles** (criterio, en la ficha): lo habitable de la PB
  sobre un sótano no habitable cerrado se protege con el sótano como espacio de contención; lo
  que **excede** la superficie del sótano apoya en el terreno; los sótanos habitables, también.
  Habitables: viviendas, oficinas, locales y zonas comunes; no habitables: garaje, trasteros e
  instalaciones.
- **El garaje como espacio de contención** (ap. 3.2 ptos 1 y 5): su ventilación de HS 3 basta.
  En **zona I** el DB pide barrera **o** cámara de aire; si se elige «cámara», el garaje entra
  como protección análoga y se marca **criterio** (no lo prevé expresamente).
- **Cámara ventilada**: 10 cm² por metro de perímetro, con el perímetro de una planta cuadrada
  de la misma superficie (4·√S, criterio).
- **El núcleo** se supone si hay garaje bajo una PB con portal o vestíbulo. Es un aviso que se
  revisa (el DB no dice cómo tratarlo) solo cuando importa: si el garaje es el espacio de
  contención o si la barrera va en el forjado de la PB.
- **Decisiones según el edificio:** «Dónde va la barrera» solo con sótano no habitable; «la
  medida» de lo que apoya en el terreno, si lo hay o en zona I (donde es la única); la vía de la
  barrera, si hay barrera. Sin exigencia o sin nada que proteger, no se pregunta nada.
- **La zona es un dato del proyectista** (Apéndice B), heredado de La obra; la herramienta no
  trae el listado de municipios. **El Demo conserva «Cáceres, zona II» rotulado como dato por
  comprobar**: la verificación encontró indicio de que Cáceres no figura en el Apéndice B
  (nota 10.2); cambiarlo es decisión de producto.
- **El dibujo** es una sección esquemática: plantas altas, la PB por zonas en proporción a su
  superficie, el sótano, la cámara o la despresurización, la barrera (que sigue a la decisión
  1), el núcleo dentro del portal o vestíbulo y siempre sobre el sótano, y el radón. Si la PB
  excede el sótano, esa parte se dibuja del lado de la fachada izquierda; el conducto de la
  despresurización sube por fuera de la fachada.
- **Se retiran** la sección por bandas de la v1 (`hs6/svg.tsx`), su resumen, la ficha antigua y
  sus tests y snapshot.

### HE1

- **Verificación** (`research/verificacion-he1-v4.md`, sobre el DB-HE consolidado de 2022, el DA
  DB-HE/1 de enero de 2020 y el DA DB-HE/2 de octubre de 2013). Cambia el motor `calcHE1`; su
  snapshot de referencia cambia **solo en la ventana** (UH 1,40 → 1,75 por la ec. (10); su fRsi ya
  no se aplica), como se esperaba:
  - **huecos por la ec. (10)** del DA/1, con Ψ de la junta vidrio-marco (Tabla 10) y la geometría
    de la ventana (una o dos hojas; fracción de marco 0,25 del Anejo A). La fórmula de la maqueta
    («0,75·Ug + 0,25·Uf + 0,08») sumaba un Ψ sin multiplicar por lg/Aw y daba CUMPLE en D/E donde
    no cumple. A los huecos **no se les aplican fRsi ni Glaser** (no proceden);
  - **tabla 3.2** (particiones interiores, `particion_interior`) y **U = UP·b** en el contacto con
    no habitables (b = 1, lado seguro);
  - **fRsi es una comprobación complementaria** (DA/2), no una exigencia del DB-2019; se declara
    exenta en el forjado sobre local, garaje o cámara (escasa producción de vapor, DA/2 §4.1.1);
  - **clima de enero de la tabla C.1** del DA/2 por provincia, con −1 °C cada 100 m sobre la
    capital (altitud de la tabla a-Anejo G, criterio). Cáceres: **7,8 °C y 78 %** (la maqueta
    decía 5 °C y 85 %). Sin dato ya no hay «85 %»: cota del lado seguro (0 °C, 100 %) y aviso;
  - ediciones: DA DB-HE/1 «enero 2020», DA DB-HE/2 «octubre 2013»; la clase 4 de higrometría
    («cocinas, pabellones…») y la 5 («lavanderías, restaurantes y piscinas»), como el DA;
  - tablas nuevas con procedencia: `ULIM_PARTICIONES_TABLA_3_2`, `PSI_HUECO_TABLA_10`,
    `UG_REFERENCIA_CEC` y `UF_REFERENCIA_CEC` (orientativos), la tabla 2 de cámaras completa
    (`rCamaraDe`, interpolada), `CLIMA_TABLA_C1` (52 capitales) y `ALTITUD_CAPITAL_ANEJO_G`.
- **Uf del PVC: 1,8** (tres cámaras, CEC), no 1,3 como la maqueta, que no tiene fuente oficial.
  Por eso el vidrio habitual en zona C es el **bajo emisivo** (UH 1,99 ≤ 2,10) y, en D y E, el
  **bajo emisivo reforzado con borde cálido** (Ug 1,4 y Ψ 0,06: UH 1,75 ≤ 1,80). El vidrio es una
  cuarta decisión («4/16/4 · Bajo emisivo · BE + cálido»): la maqueta lo cambiaba solo desde el
  arreglo de la ventana.
- **La herramienta propone los aislantes**: el de la cubierta y el del suelo, y el de la fachada
  en lo habitual, es el mayor entre el de la composición tipo (60 / 100 / 60 mm) y el mínimo que
  cumple el límite que manda —Ulim o, si es más exigente, la U máxima por fRsi— en pasos de 10 mm.
  Así ningún cerramiento propuesto incumple en ninguna zona; los arreglos («Poner 50 mm»,
  «Cambiar a bajo emisivo») escriben la decisión.
- **El aislante del forjado va bajo el forjado** (lana mineral en el techo del local o del
  garaje; XPS en la cámara sanitaria), no «EPS bajo el mortero» como la maqueta: con el aislante
  encima del forjado y el aire exterior de enero debajo (lado seguro), Glaser marcaba condensación
  en todos los edificios.
- **El suelo de la envolvente** sale de lo que hay bajo la planta más baja que se protege
  (viviendas u oficinas): local sin uso (decisión 2), garaje o sótano (UT), portal (tabla 3.2) o
  el terreno (forjado sanitario sobre cámara, UT). La decisión 2 solo aparece sobre un local.
- **«Qué entra»** lleva la zona, la envolvente y los cuatro cerramientos con su «U / límite» en
  una sola lista (la maqueta tenía un bloque «Cerramientos» aparte); «Añadir desde el catálogo» y
  «Usar λ y µ del fabricante» quedan fuera (no hay catálogo ni editor de capas en la v4).
- **El dibujo** cambia con el cerramiento elegido: fachada a escala con la curva de temperaturas
  del motor (y las condensaciones de Glaser marcadas, si las hay), cubierta y forjado por capas,
  ventana en alzado de dos hojas. La condensación y HULC se ven sobre la fachada. La ficha lleva la
  fachada. Los tintes en papel se calculan en hexadecimal (svg2pdf no resuelve `color-mix`).
- **Se retiran** la sección por cerramientos de la v1 (`he1/svg.tsx`), su resumen, el outliner de
  capas y sus tests: la pantalla ya no edita capas.

## Pendiente

- **Cáceres en zona II de radón** (Demo): no verificado y con indicio de que no figura en el
  Apéndice B (`research/verificacion-hs6-v4.md`, nota 10.2). El Demo lo conserva rotulado como
  dato por comprobar; cambiar de municipio o de zona es decisión de producto.
- **Motores que la pantalla ya no usa:** `calcHS6` (corregido, con sus tests) y los
  `resumen.ts` de HS4 y HS5 (solo los usan sus tests). Retirarlos o reutilizarlos.
- **La presión heredada de HS4** (`herencia.ts`, campo `presionAcometida_kPa`) ya no la lee la
  pantalla: HS4 la toma de La obra.
- **HE1:** catálogo de cerramientos y λ/µ del fabricante (editor de capas); ventanas de otros
  tamaños y `lg` editable (con varias hojas la junta crece); cajón de persiana; el balance anual
  de Glaser (la tabla C.1 ya tiene los 12 meses); b por la tabla 7 del DA/1 en vez de 1; el +50 %
  de los escaparates; el coeficiente global y el control solar siguen en HULC.
- **HS6:** el listado del Apéndice B por municipio (hoy la zona es un dato del proyectista).
- **Versión del motor:** sube a **0.2.0** (fórmulas y tablas de HS4, HS3, HS6 y HE1).
