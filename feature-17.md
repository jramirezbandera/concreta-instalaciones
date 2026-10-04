# feature-17 — Fase D · HS1: protección frente a la humedad

> Primera justificación nueva de la Fase D de [UX-RECONCEPT.md](UX-RECONCEPT.md) §11
> (HS1 → SI → SUA → HS2 → HE4/HE5 → REBT → HR). Nace ya con el patrón v4 de
> [REDISENO-V4.md](REDISENO-V4.md) §3 que siguen HS5, HS4, HS3, HS6 y HE1. Escrito antes de
> empezar y cerrado el 2026-10-04, con lo que cambió respecto al plan en «Desviaciones».
> Verificación normativa: [research/verificacion-hs1.md](research/verificacion-hs1.md).

## Objetivo

HS1 es la justificación que más se repite en una memoria y la más mecánica: con el clima, el
terreno y la forma del edificio se saca el **grado de impermeabilidad** de cada elemento por
tabla, y con el tipo de solución, las **condiciones** que debe cumplir (los códigos
«I2+I3+D1+D5»). La herramienta lo hace sola desde El edificio y los datos de la obra; el
proyectista toma tres o cuatro decisiones (cómo es el muro, el suelo, la fachada y la
cubierta) y se lleva el texto de la memoria con cada condición explicada.

Hito: **HS1 en la barra lateral como publicada**, con los cuatro casos de El edificio, en La
obra, en la memoria CTE y en el anejo.

## Principios

- **El patrón v4, sin inventar piezas.** «Qué entra», decisiones con «Lo habitual», el dibujo
  grande con las etiquetas pulsables, la franja, la lista, la memoria y los avisos
  revisables, como HS6.
- **Ninguna cifra sin verificar.** Las tablas 2.1–2.7, 2.9, 2.10 y 3.1–3.4 se transcriben
  casilla a casilla contra el PDF oficial (`research/pdf/DBHS.pdf`, renderizado a imagen) por
  el agente `cte-normativa`, antes de entrar en `tablas.ts`.
- **El motor prescribe, no inventa productos.** HS1 dice qué condiciones debe cumplir la
  solución y las explica; no traduce marcas ni catálogos de fachadas a códigos (eso sería
  interpretar y queda fuera, ver «Fuera de alcance»).
- **Lo que no se sabe se supone del lado de la seguridad y se avisa**, como la intensidad de
  lluvia de HS5: el aviso es revisable y lleva a Datos de la obra.

## Alcance

### A. Datos de la obra (`lib/proyecto/tipos.ts`, `pages/FormDatosGeneralesPage.tsx`)

`DatosGenerales` gana cinco datos opcionales (aditivos: el schema sigue en «2»), en una
sección nueva «Clima y terreno»:

| Dato | De dónde | Sin él |
|---|---|---|
| `zonaPluviometricaHs1` (I–V) | figura 2.4, lo lee el proyectista | se supone lo desfavorable y se avisa |
| `zonaEolica` (A–C) | figura 2.5 | ídem |
| `terrenoTipo` (I–V → E0/E1) | DB-SE, ap. 2.3.1 b) de HS1 | ídem |
| `nivelFreatico` (no detectado / profundidad) | estudio geotécnico | ídem |
| `permeabilidadTerreno` (columnas de Ks de la tabla 2.1) | estudio geotécnico | ídem |

La zona pluviométrica de HS5 (A/B, figura B.1) pasa a rotularse «(HS5)» para no confundirla
con la de promedios de HS1.

### B. Lo que entra (`modules/hs1/partes.ts`)

De El edificio: los sótanos (número, cota del suelo más bajo), sus muros, el suelo del sótano
más bajo, el suelo de la planta baja si apoya en el terreno (sin sótano o la parte que excede
la superficie del sótano), la fachada con su altura de coronación y la cubierta con su tipo.
La presencia de agua sale de la cara inferior del suelo frente al freático (ap. 2.1.1).

### C. Tablas (`modules/hs1/tablas.ts`)

Datos versionados con procedencia (`tablaCTE`): tablas 2.1 a 2.7 (grados y condiciones de
muros, suelos y fachadas), 2.9 y 2.10 (pendientes de cubierta), 3.1 a 3.4 (dimensionado del
drenaje y del bombeo) y el texto de una línea de cada condición. Casilla sombreada = `null`
(no aceptable), en blanco = `[]` (sin condición), notas de número de sótanos aparte.

### D. La justificación (`modules/hs1/justificacion.ts`)

`justificarHs1(estado, edificio, obra)` devuelve, con el contrato de §3.2:

- **terreno** (dato): presencia de agua y Ks;
- **muro** (si hay sótano): grado (tabla 2.1) y condiciones (tabla 2.2) por tipo de muro e
  impermeabilización; no cumple si la casilla es inaceptable o el número de sótanos lo
  impide, con la opción que sí vale como arreglo;
- **suelo-sotano** y **suelo-pb**: grado (tabla 2.3) y condiciones (tabla 2.4);
- **fachada**: exposición al viento (tabla 2.6), grado (tabla 2.5) y condiciones (tabla 2.7),
  con la regla de sustitución de 2.3.2 pto 2 y la nota de la hoja única;
- **cubierta**: grado único, sus condiciones de 2.4.2 y la pendiente admisible (tablas 2.9 o
  2.10);
- **dimensionado** cuando las condiciones lo piden: tubo drenante, canaletas y cámara de
  bombeo (tablas 3.1 a 3.4). El bombeo se decide con la cota del alcantarillado de la obra.

Gobierno nuevo en `lib/cte/resultado.ts`: `grado_tabla` (la tabla y sus entradas).

### E. Decisiones (`modules/hs1/estado.ts`, `DecisionesHs1.tsx`)

Solo las que el edificio pide, cada una con «Lo habitual» y un segundo control dentro:

1. **El muro** (con sótano): impermeabilización (exterior · interior · parcialmente
   estanco) y tipo de muro (flexorresistente · gravedad · pantalla).
2. **El suelo**: tipo (solera · placa · elevado) e intervención en el terreno (sub-base ·
   inyecciones · sin intervención).
3. **La fachada**: con o sin revestimiento exterior, y la combinación de la casilla cuando
   hay varias.
4. **La cubierta**: según su tipo en El edificio (lo que verifique `cte-normativa`).

### F. Textos, memoria y ficha

- `textos.ts`: frase de la cabecera, métricas, franja de cada elemento (qué es · lo que manda
  · las cuentas y la tabla), etiquetas, lista y avisos.
- `memoria.ts`: un párrafo por elemento con el grado, de dónde sale y cada condición en una
  frase, y una tabla resumen (elemento · grado · solución · condiciones).
- `ficha.ts`: los datos de partida de la ficha oficial de HS1 (presencia de agua, Ks, zona
  pluviométrica, altura de coronación, zona eólica, entorno, exposición…) y una
  verificación por elemento.

### G. El dibujo (`modules/hs1/seccion.ts`, `SeccionHs1.tsx`)

La sección común de El edificio (`baseSeccion` + `PisosSeccion`) con la envolvente encima:
fachada, cubierta (inclinada si lo es), muros con la impermeabilización por fuera o por
dentro, suelo, el nivel freático y el tubo drenante. Etiquetas pulsables con el grado y las
condiciones; en papel, dentro del SVG.

### H. Integración

Registro (`shipped`, ruta `hs/humedad`), ruta en `App.tsx`, adaptador de La obra
(`lib/obra/modulos.ts`), generador del anejo, Demo y tests que hoy toman HS1 como «pronto».

## Fuera de alcance

- Catálogo de fachadas, muros o cubiertas tipo traducidos a códigos: el proyectista elige la
  columna y la combinación de la tabla.
- Puntos singulares (2.1.3, 2.2.3, 2.3.3, 2.4.4) y apartados 4 a 6 (productos, construcción,
  mantenimiento): se citan en la memoria, no se comprueban.
- Varias fachadas distintas en un mismo edificio, medianeras como caso aparte, terrazas y
  balcones (son cubiertas, ap. 1.1).
- Edificios de más de 100 m o junto a un desnivel muy pronunciado (nota de la tabla 2.6):
  aviso de fuera de alcance.
- Condensaciones: son de HE 1 (ap. 1.1 pto 2).

## Definición de hecho

- [x] Typecheck, lint y build limpios. El build sigue avisando de las importaciones
      dinámicas que no parten el chunk (como en las fases anteriores: La obra y el Demo
      importan los motores de forma estática). El chunk principal pasa de 613 a 633 kB.
- [x] 882 tests en verde (831 al empezar). Ningún snapshot de otro módulo cambia. Tests
      nuevos en `modules/hs1/test/`:
      - `tablas.test.ts`: las casillas de la verificación, las sombreadas y en blanco de
        las tablas 2.2 y 2.4, las notas de sótanos, las casillas raras de la 2.4, y las
        propiedades de las tablas 2.1, 2.3, 2.5 y 2.6 (más agua, más Ks, más altura, E0 o
        más viento nunca bajan el grado ni la exposición). No hay propiedades de inclusión
        entre filas de las tablas 2.2 y 2.4, porque no se acumulan;
      - `justificacion.test.ts`: presencia de agua en los umbrales, lo que entra en los
        casos de El edificio, el Demo, los supuestos, lo que no vale con su arreglo, las
        notas de sótanos, la hoja única, el drenaje y el bombeo, el suelo elevado y la
        cubierta;
      - `textos.test.ts`: frase, franjas, «Qué entra», avisos, memoria, ficha y geometría
        del dibujo;
      - `ui.test.tsx` sobre el router real: cabecera, decisiones, franja, aviso con enlace a
        Datos de la obra, lista y memoria;
      - Datos de la obra: los campos nuevos del Demo y la validación del freático.
      Los tests de La obra, la memoria CTE, el anejo, la barra lateral y el progreso que
      contaban HS1 como «pronto» se actualizaron: ahora cuentan seis publicadas.
- [x] `research/verificacion-hs1.md`: todas las tablas casilla a casilla contra la imagen
      del PDF oficial (`research/pdf/DBHS.pdf`, consolidado de 14-06-2022) y el DB comentado
      por el Ministerio (`research/pdf/DccHS.pdf`, 12-02-2025).
- [x] Capturas revisadas: Demo en claro y en Ónice, con la fachada, el muro y el suelo
      seleccionados; fachada sin revestimiento; Comprobaciones; Memoria; móvil a 390 px;
      unifamiliar con freático a 1,20 m y cubierta inclinada; Datos de la obra; la ficha PDF
      renderizada página a página.

## Desviaciones

- **Lo habitual del suelo depende de su grado.** Sin estudio geotécnico se supone presencia
  alta, y con grado 5 la solera sin intervención no se admite (tabla 2.4, casilla
  sombreada): un dato que falta acababa en «no cumple». Lo habitual es ahora la primera
  solución admitida para el grado: solera sin intervención y, si no vale, solera con
  sub-base. Nunca es una solución que la tabla rechaza. `JustificacionHs1.habituales` lo
  expone para las decisiones y el arreglo.
- **Los supuestos solo se avisan si cambian el resultado.** Con 15 m o menos de altura la
  zona eólica no influye (tabla 2.6) y no se pide; la ficha y la memoria lo dicen así en
  lugar de «zona C supuesta». Ks siempre influye en el grado del suelo, así que sin él
  siempre se avisa.
- **«Sub-base» no es el encachado.** El Apéndice A la define como una capa de bentonita
  sobre hormigón de limpieza. Lo habitual es «sin intervención», que con grado 1 o 2 pide
  C2+C3+D1 (el encachado entra como capa drenante, D1).
- **Freático «no detectado» con la profundidad del reconocimiento.** La verificación (R2)
  pide guardarla: «no detectado» solo es presencia baja si el reconocimiento llegó más
  hondo que la cara inferior del suelo. Campo opcional «Reconocido hasta»; sin él, aviso.
  Las ayudas dicen ya «valor medio anual, medido desde la superficie del terreno».
- **La cubierta, en concreto.** Plana: la protección de la tabla 2.9 que admite su tipo
  (transitable: solado fijo, flotante o capa de rodadura; no transitable: grava, lámina
  autoprotegida o tierra vegetal) y el aislante sobre o bajo la impermeabilización.
  Inclinada: con o sin lámina bajo el tejado y el tejado de la tabla 2.10 (sin lámina, la
  pendiente debe ser mayor que la de la tabla). La ajardinada va con las no transitables
  (criterio).
- **El drenaje y el bombeo.** El tubo del arranque del muro sale de D3 del muro o del suelo,
  con el grado mayor de los dos (criterio de la verificación, 8.3); los drenes bajo el suelo,
  de D2. Los pozos (D2 del muro, D4 del suelo) llevan siempre dos bombas; los tubos y
  canaletas, solo si la acometida queda por encima del drenaje, que se decide con la cota
  del alcantarillado de la obra (sin ella, se supone bombeo y se avisa). El volumen de la
  cámara no se calcula: depende del caudal (apéndice C), que no es un dato de la
  herramienta.
- **Lo que no vale no tiene aún la vía «otra solución equivalente».** El DB comentado (p. 11)
  dice que las soluciones del ap. 2 son aceptadas pero no obligatorias (CTE art. 5). La
  franja y la memoria lo mencionan; el veredicto sigue siendo «no cumple» con el arreglo
  de la tabla.
- **Tipo de muro en un desplegable** y las combinaciones de la fachada en lista: los botones
  cortaban «Flexorresistente» y las combinaciones largas («B1+C2+H1+J1+N1»).
- **En La obra, la cubierta enseña su pendiente.** «Qué entra» la trata como «1–5 %» y no
  como «grado único», que La obra resaltaba como si fuera un caso especial.
- **El Demo no rellena la zona pluviométrica ni la eólica.** Cáceres cae junto a las líneas
  de las figuras 2.4 y 2.5 (verificación, 6.3 y 6.4), como pasó con la isoyeta de HS5. El
  Demo enseña el aviso del clima, y la fachada sale con grado 5 hasta que se indique la
  zona. Sí lleva entorno urbano (terreno tipo IV, por definición) y un estudio geotécnico
  de demostración: freático no detectado en 10 m y Ks medio.

## Pendiente

- **Decisiones propias que el usuario debe validar:**
  - lo que se supone sin datos: presencia alta, la peor Ks, zona pluviométrica I, zona
    eólica C y entorno E0;
  - los 0,30 m entre la cota del suelo y su cara inferior (con aviso a menos de 0,30 m de
    un umbral) y la altura de coronación al forjado de cubierta (con aviso si un peto de
    1,10 m cambiaría la exposición);
  - lo habitual: muro flexorresistente por fuera, solera sin intervención, fachada con
    revestimiento y de dos hojas, cubierta invertida con grava (o solado fijo) e inclinada
    de teja mixta sin lámina;
  - en un suelo sin muro, las condiciones que nombran el muro (I2, S1, S3, P1, P2, D3) se
    aplican a la cimentación perimetral, con aviso;
  - el Demo sin la zona pluviométrica.
- **La vía «otra solución de prestaciones equivalentes»** con veredicto `criterio` y
  justificación del proyectista (verificación 9.1).
- **Lecturas pendientes** (verificación, «Pendientes»): las figuras 2.4 y 2.5 a buena
  resolución, la figura D.1 del DB SE-AE, el apartado «Doce» del RD 732/2019 en el PDF del
  BOE, la maqueta del DB comentado (fila «Bituminosas» de la tabla 2.10) y el HS 1 de
  2006/2009 (las dos casillas raras de la tabla 2.4).
- **Enlaces con otros módulos:** el suelo elevado de HS1 y la cámara ventilada de HS6 son el
  mismo forjado sanitario, y la barrera de vapor de la cubierta depende de las
  condensaciones de HE1; hoy cada módulo decide por su cuenta.
- **Fuera de alcance de esta fase:** varias fachadas distintas, medianeras, terrazas y
  balcones, semisótanos o solar en pendiente (se cita en la franja del suelo), catálogo de
  fachadas tipo. El dibujo de la planta baja que excede el sótano es aproximado.
- **`research/pdf/DBHS.pdf` y `DccHS.pdf`** (4,6 y 4,7 MB) se han añadido sin commit: decidir
  si se versionan, como los PDF del DB-HE.
