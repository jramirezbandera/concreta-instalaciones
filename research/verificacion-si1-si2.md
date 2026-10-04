# Verificación normativa — DB-SI, parte A: Introducción, Anejo SI A, SI 1 «Propagación interior» y SI 2 «Propagación exterior» (módulos SI1 y SI2)

**Fecha:** 2026-10-04 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** preguntas A1 a A10 del encargo, en su orden. SI 3 y SI 4–SI 6 los verifican otros agentes: aquí solo aparecen cuando una regla de SI 1 o SI 2 remite a ellas (rotulado «→ SI 3» / «→ SI 6»). Esas cifras no se dan como verificadas salvo que se diga.

**Regla aplicada:** la de `verificacion-hs1.md`. Ninguna cifra sin leerla en la imagen de la página. Las tablas se han transcrito casilla a casilla contra la imagen, porque el texto extraído pierde los signos ≤ y los superíndices. Veredictos:
- **VERIFICADO**: literal en el DB. Leído en la imagen de [SI25] y coincidente con el texto extraído de [SI25] y con el articulado de [DccSI].
- **LEÍDO (comentario)**: literal en un comentario del Ministerio ([DccSI]). **No es reglamentario.** La ficha debe rotularlo así.
- **CORREGIDO**: la afirmación del encargo o de la memoria tipo no coincide con el DB.
- **NO VERIFICABLE**: el DB no lo dice, o no se ha podido leer con seguridad.
- **INTERPRETACIÓN**: lectura que el DB no escribe tal cual pero que se sigue de él. Se puede mostrar, rotulada.
- **CRITERIO**: decisión de proyecto propuesta. No es exigencia del CTE y la ficha debe rotularla así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [SI25] | CTE DB-SI «Seguridad en caso de incendio» | Texto consolidado «4 marzo 2025». Su p. 2 lista: RD 314/2006; RD 1371/2007; corrección de errores (BOE 25-01-2008); Orden VIV/984/2009; RD 173/2010; Sentencia del TS de 4-5-2010 (BOE 30-07-2010); RD 732/2019; **RD 164/2025 de 4 de marzo (BOE 10-04-2025)** | `research/pdf/DBSI.pdf` (codigotecnico.org) | **Imagen a 200 dpi:** pp. 10–17 y 19–21 (todas las tablas de SI 1 y SI 2) y p. 39 (solo para la lista de «unifamiliar»). **Imagen a 130 dpi:** pp. 4, 5, 42 y 44–52 (Introducción y Anejo SI A). **Texto extraído:** pp. 1–23, 28, 39 y 41–52 |
| [DccSI] | DB-SI con comentarios del Ministerio | Articulado 4-3-2025 y comentarios 4-3-2025 | `research/pdf/DccSI.pdf` | **Texto:** pp. 1–33, 41, 48–50 y 67–84. **Imagen:** pp. 6, 17, 18, 21, 23, 24, 26, 31, 41, 73 y 80 (todas las cifras de comentarios citadas aquí) |
| [REPO] | `src/lib/edificio/derivar.ts`, `tipos.ts` y `tablas.ts`; `src/modules/si/*`; `research/verificacion-edificio-usos.md` | Estado actual | repo | Lo que ya existe |

Avisos de los propios documentos:
- [SI25] p. 2: «Este texto consolidado no tiene valor jurídico.»
- [DccSI] p. 2: «Los comentarios tienen un carácter orientativo e informativo no teniendo carácter reglamentario.»
- [DccSI] p. 2: los comentarios nuevos o modificados en esta versión llevan «una doble línea vertical en el margen izquierdo». En la imagen, los comentarios van sangrados y con línea vertical. Se distinguen sin ambigüedad del articulado.

**Límites de esta lectura:**
- **BOE no leído.** No he leído el texto de los RD 732/2019 ni 164/2025. Doy el texto **vigente** del consolidado, pero no puedo decir qué edición introdujo cada párrafo (afecta a A7, «texto vigente tras 2019 y 2025»).
- **CTE Parte I, Anejo III, no leído.** Los términos en cursiva que no están en el Anejo SI A (p. ej. «uso previsto») remiten allí y no se han verificado.
- **RITE y REBT no releídos.** Las remisiones de la tabla 2.1 («salas de máquinas … según RITE») y de los comentarios (ITC de contadores) quedan pendientes.
- **Figura 1.7 de SI 2:** sus rótulos salen ilegibles en el PDF. El texto del ap. 1.3 basta. La figura 1.8 sí se lee («≥1 m - b»).
- Las cifras de SI 3 (densidades, altura de evacuación) se apoyan en `research/verificacion-edificio-usos.md` y en `derivar.ts`. Ver la nota A2.1.

---

## Bloque A1 — Ámbito y criterios generales (Introducción)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 1.1 | Ámbito del DB-SI | VERIFICADO | El ámbito general del CTE (art. 2, Parte I), **excluidos** los edificios, establecimientos y zonas de uso industrial a los que se aplica el RSCIEI | Intro II: «El ámbito de aplicación de este DB es el que se establece con carácter general para el conjunto del CTE en su artículo 2 (Parte I) excluyendo los edificios, establecimientos y zonas de uso industrial a los que les sea de aplicación el "Reglamento de seguridad contra incendios en los establecimientos industriales".» | [SI25] p. 4 |
| 1.2 | Elementos del entorno | VERIFICADO | Solo los que forman parte del proyecto. Se incluyen las instalaciones fijas, el equipamiento propio y la urbanización adscrita (art. 2.3 LOE) | Intro II: «…los elementos del entorno del edificio a los que les son de obligada aplicación sus condiciones son únicamente aquellos que formen parte del proyecto de edificación.» | [SI25] p. 4 |
| 1.3 | Riesgo de **inicio** de incendio en instalaciones | VERIFICADO | No lo regula el CTE: lo regula la reglamentación específica. Afecta a los cuartos de instalaciones (ver 4.3) | Intro II: «Este CTE no incluye exigencias dirigidas a limitar el riesgo de inicio de incendio relacionado con las instalaciones o los almacenamientos regulados por reglamentación específica, debido a que corresponde a dicha reglamentación establecer dichas exigencias.» | [SI25] p. 4 |
| 1.4 | Soluciones distintas a las del DB | VERIFICADO | Por el art. 5 del CTE, documentando el cumplimiento de las exigencias básicas | Intro III, párr. 1 | [SI25] p. 4 |
| 1.5 | Usos no definidos en el Anejo SI A | VERIFICADO | Se aplican las condiciones del uso «al que mejor puedan asimilarse» | Intro III, crit. 2: «Los edificios, establecimientos o zonas cuyo uso previsto no se encuentre entre los definidos en el Anejo SI A de este DB deberán cumplir, salvo indicación en otro sentido, las condiciones particulares del uso al que mejor puedan asimilarse.» | [SI25] p. 5 |
| 1.5b | Asimilar distintos aspectos a distintos usos | LEÍDO (comentario) | Se admite, justificándolo con un análisis de riesgos | [DccSI] p. 6, «Asimilación a más de un uso de los contemplados en el DB SI» | [DccSI] |
| 1.6 | Sanitario o asistencial ambulatorio | VERIFICADO | Uso Administrativo | Intro III, crit. 4 | [SI25] p. 5 |
| 1.7 | Establecimientos de alquiler de trasteros | VERIFICADO | Uso Almacén. NRI medio, subnivel 5, con altura de almacenamiento **≤ 3 m**; NRI alto con **> 3 m** | Intro III, crit. 6: «…siempre que tengan una altura de almacenamiento igual o inferior a 3 metros y como áreas o sectores con nivel de riesgo intrínseco (NRI) alto en caso de que su altura de almacenamiento sea superior a 3 metros…» | [SI25] p. 5 |
| 1.7b | ¿El crit. 6 alcanza a los trasteros de un edificio de viviendas? | INTERPRETACIÓN: **no** | El crit. 6 habla de establecimientos «cuya actividad sea el servicio de alquiler». Los trasteros vinculados a las viviendas tienen fila propia en la tabla 2.1 (nota 5) | Intro III crit. 6; tabla 2.1, nota (5) | [SI25] pp. 5, 16 |
| 1.8 | Archivos dentro de oficinas | VERIFICADO | Las áreas de archivo abiertas integradas en las oficinas no son uso Almacén, salvo que tengan Q_T ≥ 3·10⁶ MJ **y** altura de almacenamiento > 5,00 m | Intro III, crit. 7 | [SI25] p. 5 |
| 1.9 | Reformas y cambios de uso (crit. 8 a 11) | VERIFICADO (leído); fuera de alcance | La herramienta trata obra nueva | Intro III, crit. 8–11 | [SI25] pp. 5–6 |
| 1.10 | ¿Hay exención o tratamiento propio para la vivienda unifamiliar? | VERIFICADO: **no hay exención general** | Es uso Residencial Vivienda y se le aplica todo el DB. Tiene **cinco reglas propias** en el articulado y **cinco comentarios** (nota 1.10) | Anejo SI A, «Uso Residencial Vivienda»: «Edificio o zona destinada a alojamiento permanente, cualquiera que sea el tipo de edificio: vivienda unifamiliar, edificio de pisos o de apartamentos, etc.» | [SI25] p. 51 |
| 1.11 | Qué es un establecimiento | VERIFICADO | Ver A2 | Anejo SI A, «Establecimiento» | [SI25] p. 45 |
| 1.12 | Establecimiento integrado en un edificio de viviendas | VERIFICADO | Es sector diferenciado **siempre**, salvo que sea Docente, Administrativo o Residencial Público de **≤ 500 m² construidos**. Uno **Comercial** es sector cualquiera que sea su superficie | Tabla 1.1, «En general», guion 1 | [SI25] p. 10 |
| 1.12b | Cuándo una zona es «establecimiento» a estos efectos | LEÍDO (comentario) | Titularidad diferenciada y régimen no subsidiario, también en lo material: condiciones constructivas, instalaciones de protección, plan de emergencia. Dos licencias son dos establecimientos aunque el titular sea el mismo | [DccSI] pp. 16–17, «Sectorización de establecimientos integrados en edificios» y «Titularidad de un establecimiento» | [DccSI] |
| 1.13 | Local en PB **sin actividad definida** | NO VERIFICABLE en el articulado. LEÍDO (comentario) | El articulado no regula el «local sin uso». El comentario lo trata como **obra inacabada**: la obra que lo termine para un uso aplicará el CTE vigente para ese uso | [DccSI] p. 6, «Local diáfano sin uso»: «Un local diáfano sin ningún uso declarado es, a efectos del CTE, una obra inacabada. El proyecto y obra de terminación de dicho local para un uso determinado debe cumplir […] todas las exigencias del CTE vigentes en el momento de solicitar licencia para dicha obra (no para la obra inicial), incluidas las de seguridad en caso de incendio, particularizadas para el uso en cuestión.» | [DccSI] (imagen) |
| 1.13b | Qué hace la herramienta con ese local | CRITERIO | Ver «Criterios de proyecto», C3. Resuelve el pendiente 3 de `verificacion-edificio-usos.md` | — | — |
| 1.14 | Garaje integrado en un edificio de viviendas | VERIFICADO | Si su superficie **construida** es **> 100 m²**, es uso Aparcamiento: **sector diferenciado**, y toda comunicación con otros usos va por **vestíbulo de independencia**. Si es **≤ 100 m²**, es **local de riesgo especial bajo** | Anejo SI A, «Uso Aparcamiento»; tabla 1.1, fila «Aparcamiento», «En general» y nota (2) | [SI25] pp. 10–12, 50 |
| 1.15 | Zonas de uso distinto y **subsidiario** | VERIFICADO | Son sector diferente cuando superan los límites de la tabla 1.1, «En general», guion 2 (transcrito en A3). En el ámbito de la herramienta: vivienda **siempre**; Administrativo o Comercial **> 500 m² construidos**; Aparcamiento **> 100 m² construidos**, con vestíbulo de independencia | Tabla 1.1, «En general», guion 2 | [SI25] pp. 10–11 |
| 1.16 | «Subsidiario» frente a «establecimiento» | INTERPRETACIÓN (con apoyo en un comentario) | **Zona subsidiaria:** uso distinto, pero bajo la titularidad y el régimen del uso principal. **Establecimiento:** titularidad diferenciada y régimen **no** subsidiario | Anejo SI A, «Establecimiento» («…bajo un régimen no subsidiario respecto del resto del edificio…»); [DccSI] p. 17: «Dos zonas con diferentes usos de un mismo establecimiento, es decir bajo la misma titularidad, no precisan sectorizarse salvo en los casos que se establecen en SI 1-1, tabla 1.1.» | [SI25] p. 45; [DccSI] |
| 1.17 | Oficinas dentro de un edificio de viviendas | INTERPRETACIÓN | Por cualquiera de las dos vías el umbral es **500 m² construidos**: como establecimiento Administrativo, exento si ≤ 500 m²; como zona subsidiaria, sector si > 500 m². La herramienta puede aplicar un único umbral sin preguntar la titularidad | Tabla 1.1, «En general», guiones 1 y 2 | [SI25] pp. 10–11 |
| 1.18 | Vivienda dentro de un edificio de oficinas | VERIFICADO | Sector diferente **en todo caso** | Tabla 1.1: «Zona de uso Residencial Vivienda en todo caso.» | [SI25] p. 11 |
| 1.19 | ¿Qué es el «uso principal» de un edificio mixto? | NO VERIFICABLE: el DB no lo define | — | Tabla 1.1 («edificios cuyo uso principal sea Residencial Vivienda») | Anejo SI A sin entrada. Ver C4 |
| 1.20 | Trasteros y cuartos de instalaciones en un edificio de viviendas | INTERPRETACIÓN | No son un «uso» del Anejo SI A. Se tratan como **zona de ocupación nula** (Anejo SI A) y, según tamaño o tipo, como **local de riesgo especial** (tabla 2.1). No son «zona subsidiaria» de la tabla 1.1 | Anejo SI A, «Zona de ocupación nula»; tabla 2.1 | [SI25] pp. 14, 52 |
| 1.21 | → SI 3: compatibilidad de los elementos de evacuación | LEÍDO; fuera de alcance | Los establecimientos Comerciales de cualquier superficie, integrados en un edificio de otro uso principal, tienen salidas propias (SI 3-1). Lo verifica el agente de SI 3 | SI 3, ap. 1 | [SI25] p. 22 |
| 1.22 | → SI 3: escaleras comunes con un establecimiento que no es sector | LEÍDO; fuera de alcance | La escalera común cumple las condiciones del uso Residencial Vivienda | SI 3, tabla 5.1, nota (1): «Cuando un establecimiento contenido en un edificio de uso Residencial Vivienda no precise constituir sector de incendio conforme al capítulo 1 de la Sección 1 de este DB, las condiciones exigibles a las escaleras comunes son las correspondientes a dicho uso.» | [SI25] p. 28 |

**Nota 1.10 — Dónde aparece «unifamiliar».** Búsqueda en el texto completo, incluidas las palabras partidas «uni-/familiar».

*Articulado [SI25] (cinco sitios):*
1. **SI 1, tabla 2.1** (p. 14, imagen): «Aparcamiento de vehículos cuya superficie S no exceda de 100 m² o integrado en una vivienda unifamiliar» → riesgo **bajo**, «En todo caso».
2. **SI 1, tabla 2.2, nota (5)** (p. 16, imagen): «Lo anterior no es aplicable al recorrido total desde un garaje de una vivienda unifamiliar hasta una salida de dicha vivienda, el cual no está limitado.»
3. **SI 6, tabla 3.1** (p. 39, imagen): fila «Vivienda unifamiliar⁽²⁾»: R 30 en sótano, R 30 con h ≤ 15 m, «-» en las otras dos columnas. Nota (2): en viviendas agrupadas o adosadas, la estructura común tiene la R del uso Residencial Vivienda. Es SI 6 (otro agente): se cita solo para la lista.
4. **Anejo SI A, «Uso Aparcamiento»** (p. 50, imagen): «Se excluyen de este uso los garajes, cualquiera que sea su superficie, de una vivienda unifamiliar…»
5. **Anejo SI A, «Uso Residencial Vivienda»** (p. 51, imagen): la unifamiliar es Residencial Vivienda.

*Reglas que no nombran la unifamiliar pero la afectan:*
- **Origen de evacuación** (p. 46): excluye «los del interior de las viviendas».
- **Tabla 4.1** (p. 17):
  - la nota (4) excluye de «Zonas ocupables» «el interior de viviendas»;
  - la fila de espacios ocultos excluye «los existentes dentro de las viviendas».

*Comentarios [DccSI] (cinco sitios, no reglamentarios):*
- a) p. 18, **«Elementos sectorizadores en viviendas unifamiliares»**:
  - «Una vivienda unifamiliar nunca precisa tener sectores de incendio en su interior. Los locales de riesgo especial que pueda contener se deben compartimentar conforme a lo que se indica en SI 1, tabla 2.2.»
  - Las unifamiliares de un mismo proyecto son un mismo «edificio». Sus separaciones «no se consideran medianería», no llevan las condiciones de SI 2 y solo exigen «la separación EI 60 exigible entre viviendas de un mismo edificio».
  - «La separación entre una vivienda y una zona de uso Aparcamiento requiere EI 60 desde el lado de la vivienda y EI 120 desde el lado del aparcamiento. Si se trata de un aparcamiento propio de la vivienda (zona de riesgo especial bajo) dicha separación debe ser EI 60 y EI 90, respectivamente.»
- b) p. 24, **«Evacuación de un garaje exclusivo de una vivienda unifamiliar»**:
  - recorridos hasta la salida del garaje **≤ 25 m**;
  - si la salida es a la vivienda, puerta **EI2 45-C5** de **≥ 80 cm** de anchura libre;
  - el resto del recorrido por la vivienda no está limitado;
  - el portón no es salida válida para personas: hace falta una puerta abatible de eje vertical de ≥ 80 cm, que puede ir en el portón.
- c) p. 50 (SI 3): en un garaje exclusivo de una unifamiliar, el portón sin marcado CE puede llevar una puerta peatonal.
- d) p. 77, **«Salida de vivienda unifamiliar a través de su garaje»**:
  - no es posible salir de la vivienda a través de su garaje, porque es zona de riesgo especial «cualquiera que sea la superficie de éste»;
  - salvo un garaje que no sea «un recinto cerrado en sentido estricto», asimilable a plaza cubierta.
- e) pp. 82–83, **«Viviendas unifamiliares utilizadas bajo uso turístico»**: siguen siendo Residencial Vivienda.

---

## Bloque A2 — Anejo SI A: definiciones

Todas leídas en la imagen de [SI25] pp. 42 y 44–52, y cotejadas con el texto de [DccSI] pp. 68–84. Las cifras van en negrita.

| # | Término | Veredicto | Definición literal (resumen fiel si es larga) | Página | Para la herramienta |
|---|---|---|---|---|---|
| 2.1 | **Altura de evacuación** | VERIFICADO | «Máxima diferencia de cotas entre un origen de evacuación y la salida de edificio que le corresponda. A efectos de determinar la altura de evacuación de un edificio no se consideran las plantas más altas del edificio en las que únicamente existan zonas de ocupación nula.» | p. 42 | Ver nota A2.1 |
| 2.2 | **Origen de evacuación** | VERIFICADO | «Es todo punto ocupable de un edificio, exceptuando los del interior de las viviendas y los de todo recinto o conjunto de ellos comunicados entre sí, en los que la densidad de ocupación no exceda de **1 persona/5 m²** y cuya superficie total no exceda de **50 m²**, como pueden ser las habitaciones de hotel, residencia u hospital, los despachos de oficinas, etc.» Párr. 2: los puntos ocupables de **todos** los locales de riesgo especial, y los de las zonas de ocupación nula de **> 50 m²**, son origen de evacuación. Cumplen los límites de recorrido hasta las salidas de esos espacios (si son de riesgo especial) y, en todo caso, hasta las salidas de planta, «pero no es preciso tomarlos en consideración a efectos de determinar la altura de evacuación de un edificio o el número de ocupantes» | p. 46 | **Caso viviendas** (INTERPRETACIÓN): el interior de la vivienda no es origen de evacuación, así que el recorrido empieza en la puerta de la vivienda. En una unifamiliar no hay orígenes de evacuación fuera de su garaje. El comentario de pp. 82–83 habla de los recorridos del edificio «por otra parte inexistentes» |
| 2.2b | Techo abuhardillado | LEÍDO (comentario) | Los puntos con altura libre **< 1,50 m** pueden no ser origen de evacuación | [DccSI] p. 75 | — |
| 2.3 | **Recorrido de evacuación** | VERIFICADO | Va de un origen de evacuación a una salida de planta (en esa planta o en otra) o a una salida de edificio. Tras la salida de planta, el recorrido no computa. Se mide sobre el eje de pasillos, escaleras y rampas. «Los recorridos que tengan su origen en zonas habitables o de uso Aparcamiento no pueden atravesar las zonas de riesgo especial definidas en SI 1.2. Un recorrido de evacuación desde zonas habitables puede atravesar una zona de uso Aparcamiento o sus vestíbulos de independencia, únicamente cuando sea un recorrido alternativo a alguno no afectado por dicha circunstancia.» Altura ascendente máxima, salvo aparcamientos, zonas de ocupación nula y zonas solo de mantenimiento: **4 m** hasta salida de planta y **6 m** hasta el espacio exterior seguro, en general | p. 47 | Regla clave de SI 1-2: **ningún recorrido de una zona habitable atraviesa un local de riesgo especial**. Es el caso del garaje de la unifamiliar ([DccSI] p. 77) |
| 2.4 | **Salida de planta** | VERIFICADO | Una de tres: (1) el arranque de una escalera compartimentada como los sectores de incendio, o la puerta de una escalera protegida, de un pasillo protegido o del vestíbulo de independencia de una escalera especialmente protegida; (2) una puerta, a través de vestíbulo de independencia, a otro sector de la misma planta, con tres condiciones (otra salida de planta en el sector inicial; **0,5 m²/pers** en zonas de circulación a menos de **30 m**; evacuaciones que no confluyan salvo en un sector de riesgo mínimo); (3) una salida de edificio | p. 48 | → SI 3 |
| 2.5 | **Salida de edificio** | VERIFICADO | «Puerta o hueco de salida a un espacio exterior seguro.» Para salidas de **≤ 500 personas** vale la que da a un espacio exterior con dos recorridos alternativos hasta dos espacios exteriores seguros, uno de ellos de **≤ 50 m** | p. 48 | → SI 3 |
| 2.6 | **Espacio exterior seguro** | VERIFICADO | Seis condiciones. Las cifras: superficie de **0,5P m²** dentro de un radio de **0,1P m** desde la salida; no se comprueba si **P ≤ 50**; si no comunica con la red viaria, no vale ninguna zona a menos de **15 m** del edificio. La cubierta solo vale con estructura totalmente independiente | p. 45 | → SI 3 |
| 2.7 | **Sector de incendio** | VERIFICADO | «Espacio de un edificio separado de otras zonas del mismo por elementos constructivos delimitadores resistentes al fuego durante un período de tiempo determinado, en el interior del cual se puede confinar (o excluir) el incendio para que no se pueda propagar a (o desde) otra parte del edificio. **Los locales de riesgo especial no se consideran sectores de incendio.**» | p. 49 | Un local de riesgo especial no activa reglas «entre sectores» (tabla 1.2, SI 2). Solo las activa el de riesgo **alto**, por mención expresa en SI 2 |
| 2.8 | **Sector de riesgo mínimo** | VERIFICADO | Exclusivamente de circulación y no bajo rasante; densidad de carga de fuego **≤ 40 MJ/m²** en el sector y **≤ 50 MJ/m²** en cualquier recinto; separado de lo demás con **EI 120** y comunicado por vestíbulos de independencia; evacuación por salidas de edificio directas | p. 49 | Raro en vivienda. No tiene límite de superficie (tabla 1.1) |
| 2.9 | **Sector bajo rasante** | VERIFICADO | Sector en el que algún recorrido salva necesariamente una altura de evacuación ascendente **≥ 1,5 m** | p. 48 | No es lo mismo que «plantas bajo rasante» de la tabla 1.2 (ver 3.15) |
| 2.10 | **Local o zona de riesgo especial** | VERIFICADO: **no tiene entrada en el Anejo SI A** | Lo define la clasificación de SI 1, ap. 2, tabla 2.1 | pp. 13–16 | — |
| 2.11 | **Vestíbulo de independencia** | VERIFICADO | «Recinto de uso exclusivo para circulación situado entre dos o más recintos o zonas […] y que únicamente puede comunicar con los recintos o zonas a independizar, con aseos de planta y con ascensores.» Condiciones: paredes **EI 120**; puertas de **¼** de la resistencia del elemento compartimentador que separa esos recintos y **al menos EI2 30-C5**; si sirve a escaleras especialmente protegidas, protección frente al humo; si sirve a locales de riesgo especial, **no puede usarse en recorridos de evacuación de zonas habitables**; distancia entre los contornos barridos por las puertas **≥ 0,50 m**; en itinerario accesible, círculo libre de **Ø 1,20 m** (o **Ø 1,50 m** con zona de refugio); mecanismos de apertura a **≥ 0,30 m** del rincón | pp. 51–52 | La zona «vestibulo» de `UsoZona` **no** es un vestíbulo de independencia (C19) |
| 2.12 | **Escalera abierta al exterior** | VERIFICADO | Huecos permanentemente abiertos al exterior de **5A m²** por planta (A = anchura del tramo, en m). Si dan a un patio, círculo inscrito de **h/3 m** de diámetro. Puede considerarse especialmente protegida sin vestíbulos | p. 44 | — |
| 2.13 | **Escalera protegida** (resumen) | VERIFICADO | (1) Recinto exclusivo de circulación, compartimentado con **EI 120**. Sus fachadas cumplen SI 2-1. En la planta de salida puede no estar compartimentada si es ascendente, o si es descendente y esa planta es sector de riesgo mínimo. (2) Como máximo **dos accesos por planta**, con puertas **EI2 60-C5**, «desde espacios de circulación comunes y sin ocupación propia». Además pueden abrir aseos y ascensores. Registros **EI 60**. (3) En la planta de salida, **≤ 15 m** hasta una salida de edificio (salvo por un sector de riesgo mínimo). (4) Protección frente al humo: a) ventilación natural de **≥ 1 m²** útil por planta; b) dos conductos de **50 cm² por m³** de recinto en cada planta, relación de lados **≤ 4**, rejilla de entrada con su parte superior a **< 1 m** y de salida con su parte inferior a **> 1,80 m**; o c) presión diferencial según EN 12101-6:2005 | pp. 44–45 | → SI 3 dice cuándo hace falta. Las puertas de las viviendas no pueden abrir directamente al recinto: «sin ocupación propia» |
| 2.14 | **Escalera especialmente protegida** | VERIFICADO | Escalera protegida con un vestíbulo de independencia **distinto** en cada acceso de cada planta. No hace falta vestíbulo si es abierta al exterior, ni en la planta de salida si es para evacuación ascendente | p. 44 | — |
| 2.15 | **Pasillo protegido** | VERIFICADO | Condiciones equivalentes a las de la escalera protegida. Ventilación por huecos de **≥ 0,2L m²** (L = longitud en m). Con conductos: entrada a **< 1 m** en un paramento y salida a **> 1,80 m** en el otro, separadas **≤ 10 m**. Trazado continuo hasta una escalera protegida o especialmente protegida, un sector de riesgo mínimo o una salida de edificio | p. 46 | — |
| 2.16 | **Uso Residencial Vivienda** | VERIFICADO | «Edificio o zona destinada a alojamiento permanente, cualquiera que sea el tipo de edificio: vivienda unifamiliar, edificio de pisos o de apartamentos, etc.» | p. 51 | — |
| 2.17 | **Uso Administrativo** | VERIFICADO | «Edificio, establecimiento o zona en el que se desarrollan actividades de gestión o de servicios en cualquiera de sus modalidades, como por ejemplo, centros de la administración pública, bancos, despachos profesionales, oficinas, etc.» | p. 50 | — |
| 2.18 | **Uso Comercial** | VERIFICADO | Venta de productos directamente al público o servicios relacionados. Incluye tiendas, grandes almacenes, centros comerciales, mercados y galerías. También servicios al público asimilables, como lavanderías o peluquerías | p. 50 | — |
| 2.19 | **Uso Aparcamiento** | VERIFICADO | «Edificio, establecimiento o zona independiente o accesoria de otro uso principal, destinado a estacionamiento de vehículos y cuya superficie construida exceda de **100 m²** […]. **Se excluyen de este uso los garajes, cualquiera que sea su superficie, de una vivienda unifamiliar**, así como los aparcamientos en espacios exteriores del entorno de los edificios, aunque sus plazas estén cubiertas.» Robotizados: sin condiciones de evacuación | p. 50 | **El garaje de la unifamiliar no es uso Aparcamiento**: es local de riesgo especial bajo (tabla 2.1). El garaje colectivo de **≤ 100 m²** construidos tampoco lo es |
| 2.20 | **Aparcamiento abierto** | VERIFICADO | (a) En cada planta, área total permanentemente abierta **≥ 1/20** de su superficie construida, de la que **≥ 1/40** repartida uniformemente entre las dos paredes opuestas más próximas. (b) Del borde superior de las aberturas al techo, **≤ 0,5 m** | p. 42 | → SI 3 (control de humo) y SI 4 |
| 2.21 | **Zona de ocupación nula** | VERIFICADO | «Zona en la que la presencia de personas sea ocasional o bien a efectos de mantenimiento, tales como salas de máquinas y cuartos de instalaciones, locales para material de limpieza, determinados almacenes y archivos, trasteros de viviendas, etc.» Cumplen los límites de recorrido, pero no cuentan para la altura de evacuación ni para el número de ocupantes | p. 52 | Coincide con `esOcupacionNula` de `derivar.ts` |
| 2.22 | **Establecimiento** | VERIFICADO | «Zona de un edificio destinada a ser utilizada bajo una titularidad diferenciada, bajo un régimen no subsidiario respecto del resto del edificio y cuyo proyecto de obras de construcción o reforma, así como el inicio de la actividad prevista, sean objeto de control administrativo. Conforme a lo anterior, la totalidad de un edificio puede ser también un establecimiento.» | p. 45 | — |
| 2.23 | **Superficie útil** | VERIFICADO | «Superficie en planta de un recinto, sector o edificio ocupable por las personas.» En uso Comercial sin implantación definida, la útil de las zonas de público es **al menos el 75 %** de su superficie construida | p. 49 | El 75 % sirve para calcular la **ocupación** del comercio. **No** es un factor para pasar de útil a construida (C1) |
| 2.24 | **Superficie construida** | NO VERIFICABLE: **el DB-SI no la define** | El Anejo SI A no tiene la entrada. Lo único que dice el DB: la cabecera de la tabla 2.1 («S = superficie construida»); la nota (4) de la tabla 2.1 (las zonas de aseos no computan); y el ap. 1.2 (lo que no computa en un sector). Un comentario precisa qué superficie tomar en los trasteros (4.9) | p. 14; ap. 1.2 | Ver C1 |
| 2.25 | **Densidad de ocupación** | NO tiene entrada en el Anejo SI A | Los valores están en SI 3, tabla 2.1 (→ SI 3; verificados en `verificacion-edificio-usos.md`, bloque A). Sí se define «densidad de **carga de fuego**» (p. 44), que es otra magnitud | — | — |
| 2.26 | **Uso Pública Concurrencia** | NO VERIFICABLE: **no tiene entrada en el Anejo SI A de [SI25]** | En la imagen, tras «Uso Hospitalario» viene «Uso Residencial Público» (p. 51). Tampoco aparece en el Anejo A de [DccSI] (pp. 81–82). Coherente con eso, en las tablas 1.1 y 1.2 «Pública concurrencia» aparece **sin cursiva**, a diferencia de los usos definidos. No he leído el BOE del RD 164/2025: no sé si la supresión es deliberada o un fallo del consolidado. Fuera de alcance, salvo que el local se asimile a ese uso | pp. 50–51 | No copiar la definición de ediciones anteriores |
| 2.27 | «Zona habitable», «uso previsto», «uso principal» | No están en el Anejo SI A | «Uso previsto» va en cursiva: remite al Anejo III de la Parte I (no leído). Comentario: «Por "zonas habitables" se entienden todas las que no sean de riesgo especial o aparcamiento» | [DccSI] p. 77 | — |
| 2.28 | **Recorridos de evacuación alternativos** | VERIFICADO | Forman entre sí un ángulo **> 45°**, o están separados por elementos **EI 30** que impidan que el humo los bloquee a la vez | p. 48 | → SI 3 |

**Nota A2.1 — Altura de evacuación y `derivar.ts`.** `resumenEdificio` toma la cota del suelo de la última planta sobre rasante que no sea solo de ocupación nula. Encaja con el literal de 2.1 y con el de 2.2, porque el origen de evacuación en vivienda es la puerta de la vivienda, a la cota de su planta. Matices:
- Un comentario confirma que solo se excluyen las plantas **más altas** de ocupación nula, no las intermedias ni las bajas: «… pero sí las más bajas donde existan zonas de ocupación nula» ([DccSI] p. 84). Coincide con el código.
- Con salidas de edificio a distintas cotas, al edificio se le asigna **la mayor** de las alturas de evacuación ([DccSI] p. 68, comentario).
- El código supone la salida de edificio a ±0,00. Es un CRITERIO ya implícito: rotularlo así en la ficha.
- Un dúplex en la última planta tendría su origen en la puerta de acceso, en la planta inferior del dúplex. El edificio no modela dúplex.

---

## Bloque A3 — SI 1, ap. 1: compartimentación en sectores de incendio

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 3.1 | Los edificios se compartimentan según la tabla 1.1 | VERIFICADO | Las superficies máximas **pueden duplicarse** con instalación automática de extinción | Ap. 1 pto 1: «Las superficies máximas indicadas en dicha tabla para los sectores de incendio pueden duplicarse cuando estén protegidos con una instalación automática de extinción.» | [SI25] p. 10 |
| 3.2 | Qué no computa en la superficie del sector | VERIFICADO | Los locales de riesgo especial, las escaleras y pasillos protegidos, los vestíbulos de independencia y las escaleras compartimentadas como sector, **contenidos en él** | Ap. 1 pto 2 | [SI25] p. 10 |
| 3.3 | ¿Los 2 500 m² son superficie **construida**? | VERIFICADO: **sí** | Residencial Vivienda y Administrativo: «La superficie construida de todo sector de incendio no debe exceder de 2.500 m².» Comercial: lo mismo, «en general» | Tabla 1.1 | [SI25] p. 11 |
| 3.4 | Elementos que separan viviendas entre sí | VERIFICADO | **Al menos EI 60**, sea cual sea la altura | Tabla 1.1, Residencial Vivienda: «Los elementos que separan viviendas entre sí deben ser al menos EI 60.» | [SI25] p. 11 |
| 3.4b | ¿Incluye los forjados entre viviendas? | INTERPRETACIÓN, con apoyo en un comentario | Sí: el texto dice «elementos», no «paredes». El comentario habla de «la condición EI 60 exigible al conjunto del forjado» que separa viviendas. Como el forjado es portante, su R la fija SI 6 | [DccSI] p. 26, «Paso de desagües de inodoros por forjados que separan viviendas…» | [DccSI] (imagen) |
| 3.5 | ¿La puerta de entrada a la vivienda debe ser EI? | NO VERIFICABLE: **no he encontrado esa exigencia** en SI 1 ni en el Anejo SI A | La tabla 1.1 solo exige EI 60 entre viviendas. El comentario explica por qué una vivienda **no** puede ser sector: su puerta es privativa y su cierre automático no es fiable | [DccSI] p. 17, «Consideración de las viviendas como sector de incendio»: «…no se considera fiable que la puerta resistente al fuego que debería tener la vivienda (es decir, una puerta privativa, de usuario) vaya a mantener el cierre automático operativo a lo largo del tiempo…» | [DccSI] (imagen) |
| 3.6 | Establecimiento **comercial** en un edificio de viviendas | VERIFICADO | **Siempre** sector diferenciado: la excepción solo cubre Docente, Administrativo o Residencial Público de ≤ 500 m² | Tabla 1.1, «En general», guion 1 | [SI25] p. 10 |
| 3.7 | Aparcamiento integrado en un edificio con otros usos | VERIFICADO | «Debe constituir un sector de incendio diferenciado cuando esté integrado en un edificio con otros usos. Cualquier comunicación con ellos se debe hacer a través de un vestíbulo de independencia.» | Tabla 1.1, «Aparcamiento» | [SI25] p. 12 |
| 3.8 | Garaje convencional de ≤ 100 m² | VERIFICADO | Local de riesgo especial bajo, no sector | Tabla 1.1, nota (2): «Cualquier superficie, cuando se trate de aparcamientos robotizados. Los aparcamientos convencionales que no excedan de 100 m² se consideran locales de riesgo especial bajo.» | [SI25] p. 12 |
| 3.9 | Garaje de una vivienda unifamiliar | VERIFICADO | **No** es uso Aparcamiento (sea cual sea su superficie): es **local de riesgo especial bajo «en todo caso»**. No es sector ni lleva vestíbulo. Condiciones de la tabla 2.2, columna «bajo» | Anejo SI A, «Uso Aparcamiento»; tabla 2.1 | [SI25] pp. 14, 50 |
| 3.10 | Espacio diáfano de un solo sector | VERIFICADO | Puede superar los límites si **≥ 90 %** de su superficie está en una planta, sus salidas dan directamente al espacio libre exterior, **≥ 75 %** del perímetro es fachada y no hay zona habitable encima | Tabla 1.1, «En general», guion 3 | [SI25] p. 11 |
| 3.11 | Sectores de riesgo mínimo | VERIFICADO | Sin límite de superficie | Tabla 1.1, «En general», guion 4 | [SI25] p. 11 |
| 3.12 | Tabla 1.2, casilla a casilla | VERIFICADO | Ver la transcripción | Tabla 1.2 | [SI25] p. 13, imagen + texto; [DccSI] p. 18 |
| 3.13 | ¿Qué «h» se usa? | VERIFICADO | La **altura de evacuación del edificio**, no la del sector | Cabecera: «Plantas sobre rasante en edificio con altura de evacuación:» | [SI25] p. 13 |
| 3.14 | Columnas sin huecos | VERIFICADO (imagen; el texto pierde los ≤) | **h ≤ 15 m** · **15 < h ≤ 28 m** · **h > 28 m**. Cubren todos los valores | Cabecera de la tabla 1.2 | [SI25] p. 13 |
| 3.15 | «Plantas bajo rasante» | INTERPRETACIÓN | Se refiere a la posición de la planta, no al «sector bajo rasante» del Anejo SI A (2.9). Con El edificio: nivel < 0 (C5) | Cabecera de la tabla 1.2 | — |
| 3.16 | ¿Qué uso manda cuando el elemento separa sectores de usos distintos? | INTERPRETACIÓN, con apoyo literal y en un comentario | Cada sector cumple **su** fila con el fuego **en su interior**. El elemento común debe dar EI(A) con fuego desde A y EI(B) con fuego desde B. Si es simétrico, **el mayor de los dos** | Tabla 1.2, nota (1): «Considerando la acción del fuego en el interior del sector […]. Un elemento delimitador de un sector de incendios puede precisar una resistencia al fuego diferente al considerar la acción del fuego por la cara opuesta…»; [DccSI] p. 18: «La separación entre una vivienda y una zona de uso Aparcamiento requiere EI 60 desde el lado de la vivienda y EI 120 desde el lado del aparcamiento.» | [SI25] p. 13; [DccSI] |
| 3.17 | Techos y suelos | VERIFICADO | **Techo** que separa de una planta superior: la misma resistencia que las paredes, pero **REI**. **Suelo**: según el uso de la zona de la planta **inferior** | Nota (3): «Cuando el techo separe de una planta superior debe tener al menos la misma resistencia al fuego que se exige a las paredes, pero con la característica REI en lugar de EI, al tratarse de un elemento portante y compartimentador de incendios.» Nota (4): «La resistencia al fuego del suelo es función del uso al que esté destinada la zona existente en la planta inferior. Véase apartado 3 de la Sección SI 6 de este DB.» | [SI25] p. 13 |
| 3.18 | Forjado entre el garaje (uso Aparcamiento) y las viviendas | INTERPRETACIÓN directa (notas 3, 4 y 6) | **REI 120**, con el fuego desde el garaje, en cualquier columna de altura. La R estructural la da SI 6, tabla 3.1 («Aparcamiento (situado bajo un uso distinto)»; → SI 6) | Nota (6): «Resistencia al fuego exigible a las paredes que separan al aparcamiento de zonas de otro uso. En relación con el forjado de separación, ver nota (3).» | [SI25] p. 13 |
| 3.19 | Forjado entre el local de PB y las viviendas | INTERPRETACIÓN | Si el local es **Comercial** (o Pública concurrencia) y sector: **REI 90** (h ≤ 15), **REI 120** (15 < h ≤ 28), **REI 180** (h > 28), con el fuego desde el local. Si es **Administrativo** y sector: REI 60, 90 o 120. Si no es sector (Administrativo ≤ 500 m²): no hay exigencia de sectorización | Tabla 1.2 y notas (3) y (4) | [SI25] p. 13 |
| 3.20 | Cubierta sin actividad | VERIFICADO | Solo la **R** estructural, salvo en las franjas de SI 2-2, que son **REI** | Nota (3): «…cuando sea una cubierta no destinada a actividad alguna, ni prevista para ser utilizada en la evacuación, no precisa tener una función de compartimentación de incendios, por lo que sólo debe aportar la resistencia al fuego R que le corresponda como elemento estructural, excepto en las franjas a las que hace referencia el capítulo 2 de la Sección SI 2, en las que dicha resistencia debe ser REI.» | [SI25] p. 13 |
| 3.21 | Cubierta **transitable** | INTERPRETACIÓN + CRITERIO | La excepción de la nota (3) es para cubiertas «no destinada[s] a actividad alguna, ni prevista[s] para ser utilizada[s] en la evacuación». Una plana transitable con actividad (terraza común o privada) queda **fuera de la excepción**: su forjado actúa como techo del sector de abajo (REI) (C7) | Nota (3) | — |
| 3.22 | Puertas de paso entre sectores | VERIFICADO | **EI2 t-C5**. Puerta directa: t = **½** de la resistencia de la pared. Paso por vestíbulo de independencia con dos puertas: t = **¼** | «EI2 t-C5 siendo t la mitad del tiempo de resistencia al fuego requerido a la pared en la que se encuentre, o bien la cuarta parte cuando el paso se realice a través de un vestíbulo de independencia y de dos puertas.» | [SI25] p. 13 |
| 3.22b | Mínimo con vestíbulo | INTERPRETACIÓN (combinación de dos literales) | Con vestíbulo: t = máx(¼·EI de la pared; 30). El Anejo SI A exige «al menos EI2 30-C5» en las puertas del vestíbulo | Anejo SI A, «Vestíbulo de independencia» | [SI25] p. 51 |
| 3.23 | Mampara o puerta con partes fijas | LEÍDO (comentario) | Una mampara móvil compartimentadora necesita el EI de la **pared**, no la mitad. La reducción a la mitad vale para huecos de hasta **2,46 m** (1,23 + 1,23) aunque tengan montante o fijos | [DccSI] pp. 18–19 | [DccSI] |
| 3.24 | Alternativa por tiempo equivalente | VERIFICADO | Si en SI 6 se adopta el tiempo equivalente de exposición al fuego, puede usarse para los separadores de sectores (Anejo SI B) | Ap. 1 pto 3; nota (2) de la tabla 1.2 | [SI25] pp. 10, 13 |
| 3.25 | Escaleras y ascensores que comunican sectores o zonas de riesgo especial | VERIFICADO | Compartimentados según el pto 3 (tabla 1.2). **Ascensores**, en cada acceso: puertas **E 30** (UNE-EN 81-58:2004) **o** vestíbulo de independencia con puerta **EI2 30-C5**. En zonas de riesgo especial o de uso Aparcamiento, **siempre vestíbulo**. Si el sector más bajo es de riesgo mínimo, o si en él se ponen a la vez la puerta EI2 30-C5 al vestíbulo y la E 30 al ascensor, en el sector más alto no hace falta nada | Ap. 1 pto 4 | [SI25] p. 10 |
| 3.25b | Ascensor que abre a una escalera protegida o compartimentada | LEÍDO (comentario) | Si las puertas del ascensor abren en **todas** las plantas al recinto de una escalera protegida o compartimentada como los sectores, no hace falta ninguna medida del pto 4. El vestíbulo del ascensor puede ser a la vez el de una escalera especialmente protegida, el exigible entre aparcamiento y otro uso o el interpuesto entre sectores | [DccSI] p. 14, «Compartimentación de ascensores que comunican sectores de incendio diferentes» | [DccSI] |
| 3.26 | → SI 3: escaleras que comunican sectores | LEÍDO; lo verifica el agente de SI 3 | Si su altura de evacuación no supera la admitida para escaleras no protegidas, basta con mantener la compartimentación entre sectores. Se admite incluir la escalera en uno de los sectores | SI 3, tabla 5.1, nota (2) | [SI25] p. 28 |
| 3.27 | Comunicación de un local de riesgo especial con el aparcamiento que lo contiene | LEÍDO (comentario) | No necesita vestíbulo, salvo que lo pida su nivel de riesgo (medio o alto): un local de riesgo especial no es un «uso diferenciado» | [DccSI] p. 17 | [DccSI] (imagen) |

**Tabla 1.1 — Condiciones de compartimentación en sectores de incendio** ([SI25] pp. 10–12, imagen). Filas en alcance, literales.

| Uso previsto del edificio o establecimiento | Condiciones |
|---|---|
| **En general** | – «Todo establecimiento debe constituir sector de incendio diferenciado del resto del edificio excepto, en edificios cuyo uso principal sea Residencial Vivienda, los establecimientos cuya superficie construida no exceda de 500 m² y cuyo uso sea Docente, Administrativo o Residencial Público.» |
| | – «Toda zona cuyo uso previsto sea diferente y subsidiario del principal del edificio o establecimiento en el que esté integrada debe constituir un sector de incendio diferente cuando supere los siguientes límites:» (sigue la lista) |
| | · «Zona de uso Residencial Vivienda en todo caso.» |
| | · «Zona de alojamiento ⁽¹⁾ o de uso Administrativo, Comercial, Docente cuya superficie construida exceda de 500 m² o cuya superficie construida exceda de 250 m² en caso de uso principal Almacén.» |
| | · «Zona de uso Pública concurrencia cuya ocupación exceda de 500 personas, o cuya superficie exceda de 250 m² en el caso de uso principal Almacén.» |
| | · «Zona de uso Aparcamiento cuya superficie construida exceda de 100 m².⁽²⁾ Cualquier comunicación con zonas de otro uso se debe hacer a través de vestíbulos de independencia.» |
| | · «Zona que englobe varios de los usos anteriormente enunciados y en conjunto supere los 250 m², siendo el uso principal Almacén.» |
| | · «Zona de uso Almacén cuya carga de fuego total ponderada y corregida (Q_T), calculada según el anexo I del RSCIEI, sea igual o superior a tres millones de megajulios.» |
| | – Espacio diáfano: un único sector por encima de los límites si se cumplen las cuatro condiciones de 3.10 |
| | – «No se establece límite de superficie para los sectores de riesgo mínimo.» |
| **Residencial Vivienda** | – «La superficie construida de todo sector de incendio no debe exceder de 2.500 m².» |
| | – «Los elementos que separan viviendas entre sí deben ser al menos EI 60.» |
| **Administrativo** | – «La superficie construida de todo sector de incendio no debe exceder de 2.500 m².» |
| **Comercial ⁽³⁾** | – Salvo los casos siguientes, sector construido de: i) **2.500 m²**, en general; ii) **10.000 m²** en establecimientos o centros comerciales que ocupen **todo** un edificio íntegramente protegido con extinción automática y con altura de evacuación ≤ 10 m ⁽⁴⁾ |
| | – Zonas de público de un sector único, en edificio **exento** comercial con extinción automática (altura de evacuación descendente ≤ 10 m y ascendente ≤ 4 m, más condiciones de salidas) ⁽⁴⁾ |
| | – En centros comerciales, cada establecimiento de uso Pública Concurrencia con espectáculos (cualquier superficie) o de otra actividad de > 500 m² construidos es sector diferenciado ⁽⁵⁾ |
| **Aparcamiento** | «Debe constituir un sector de incendio diferenciado cuando esté integrado en un edificio con otros usos. Cualquier comunicación con ellos se debe hacer a través de un vestíbulo de independencia.» Los robotizados bajo otro uso, en sectores de **≤ 10.000 m³** |

Notas de la tabla 1.1:
- ⁽¹⁾ «Por ejemplo, las zonas de dormitorios en establecimientos docentes o, en hospitales, para personal médico, enfermeras, etc.»
- ⁽²⁾ «Cualquier superficie, cuando se trate de aparcamientos robotizados. Los aparcamientos convencionales que no excedan de 100 m² se consideran locales de riesgo especial bajo.»
- ⁽³⁾ Las zonas de uso industrial o de almacenamiento del ámbito de aplicación son sectores diferenciados de las de uso Comercial, según su reglamentación específica.
- ⁽⁴⁾ «Los elementos que separan entre sí diferentes establecimientos deben ser EI 60. Esta condición no es aplicable a los elementos que separan a los establecimientos de las zonas comunes de circulación del centro.» Es para centros comerciales, no para locales en un edificio de viviendas.
- ⁽⁵⁾ Esos establecimientos cumplen además la compartimentación del uso Pública Concurrencia.

No transcritas por estar fuera de alcance: Residencial Público, Docente, Hospitalario y Pública Concurrencia (pp. 11–12; leídas en imagen).

**Tabla 1.2 — Resistencia al fuego de las paredes, techos y puertas que delimitan sectores de incendio ⁽¹⁾⁽²⁾** ([SI25] p. 13, imagen; = [DccSI] p. 18)

| Paredes y techos ⁽³⁾ que separan al sector del resto del edificio, según su uso previsto ⁽⁴⁾ | Plantas bajo rasante | h ≤ 15 m | 15 < h ≤ 28 m | h > 28 m |
|---|---|---|---|---|
| Sector de riesgo mínimo en edificio de cualquier uso | **(no se admite)** | EI 120 | EI 120 | EI 120 |
| Residencial Vivienda, Residencial Público, Docente, Administrativo | EI 120 | EI 60 | EI 90 | EI 120 |
| Comercial, Pública concurrencia, Hospitalario | EI 120 ⁽⁵⁾ | EI 90 | EI 120 | EI 180 |
| Aparcamiento ⁽⁶⁾ | EI 120 ⁽⁷⁾ | EI 120 | EI 120 | EI 120 |
| **Puertas de paso entre sectores de incendio** | «EI2 t-C5 siendo t la mitad del tiempo de resistencia al fuego requerido a la pared en la que se encuentre, o bien la cuarta parte cuando el paso se realice a través de un vestíbulo de independencia y de dos puertas.» | | | |

h = altura de evacuación del edificio. Notas:
- ⁽¹⁾ «Considerando la acción del fuego en el interior del sector, excepto en el caso de los sectores de riesgo mínimo, en los que únicamente es preciso considerarla desde el exterior del mismo.» Párr. 2: un elemento delimitador puede necesitar otra resistencia con el fuego por la cara opuesta, según su función por esa cara (compartimentar una zona de riesgo especial, una escalera protegida, etc.).
- ⁽²⁾ Alternativa: tiempo equivalente de exposición al fuego (Anejo SI B, ap. 2).
- ⁽³⁾ Techos: REI; cubiertas sin actividad: solo R, salvo las franjas de SI 2-2, que son REI (literal en 3.17 y 3.20).
- ⁽⁴⁾ Suelo: según el uso de la planta inferior; ver SI 6, ap. 3.
- ⁽⁵⁾ En la casilla bajo rasante: «EI 180 si la altura de evacuación del edificio es mayor que 28 m.»
- ⁽⁶⁾ «Resistencia al fuego exigible a las paredes que separan al aparcamiento de zonas de otro uso. En relación con el forjado de separación, ver nota (3).»
- ⁽⁷⁾ En la casilla bajo rasante: «EI 180 si es un aparcamiento robotizado.»

Propiedades comprobadas (sirven para tests):
- Dentro de cada fila, más h nunca da menos EI.
- La fila de Aparcamiento es **EI 120 en las cuatro columnas** (salvo robotizado).
- Bajo rasante, todos los usos admitidos dan EI 120 (salvo las notas 5 y 7).
- Residencial Vivienda / Administrativo y Comercial difieren un escalón en cada columna sobre rasante (60/90, 90/120, 120/180).

**Nota 3.22 — Puertas resultantes** (INTERPRETACIÓN aritmética de la tabla 1.2 y del vestíbulo de independencia):

| EI de la pared | Puerta directa (½) | Por vestíbulo, dos puertas (máx(¼; 30)) |
|---|---|---|
| EI 60 | EI2 30-C5 | 2 × EI2 30-C5 |
| EI 90 | EI2 45-C5 | 2 × EI2 30-C5 |
| EI 120 | EI2 60-C5 | 2 × EI2 30-C5 |
| EI 180 | EI2 90-C5 | 2 × EI2 45-C5 |

Garaje (uso Aparcamiento): el vestíbulo es obligatorio (tabla 1.1). Por tanto, **2 × EI2 30-C5** con paredes del vestíbulo **EI 120**.

---

## Bloque A4 — SI 1, ap. 2: locales y zonas de riesgo especial

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 4.1 | Clasificación y condiciones | VERIFICADO | Bajo, medio o alto según la tabla 2.1. Condiciones según la tabla 2.2 | Ap. 2 pto 1 | [SI25] p. 13 |
| 4.2 | Locales de instalaciones con reglamento propio | VERIFICADO | Además del DB, su reglamento (transformadores, maquinaria de ascensores, calderas, combustibles, contadores de gas o electricidad…). La ventilación que pida ese reglamento debe ser compatible con la compartimentación | Ap. 2 pto 2, párr. 1 | [SI25] p. 13 |
| 4.3 | Equipos en cubierta | VERIFICADO | **Excluidos**: «A los efectos de este DB se excluyen los equipos situados en las cubiertas de los edificios, aunque estén protegidos mediante elementos de cobertura.» | Ap. 2 pto 2, párr. 2 | [SI25] p. 13 |
| 4.3b | Instalaciones en cubierta dentro de un recinto | LEÍDO (comentario) | No necesitan cumplir la tabla 2.2 si están en una cubierta usada solo para instalaciones y no suponen riesgo para otros edificios, «con independencia de que esté contenida en un recinto o no» | [DccSI] p. 24 | [DccSI] (imagen) |
| 4.4 | ¿La S de la tabla 2.1 es útil o construida? | VERIFICADO: **construida** | «S = superficie construida · V = volumen construido» | Cabecera de la tabla 2.1 | [SI25] p. 14 |
| 4.5 | Tabla 2.1 | VERIFICADO | Ver la transcripción | Tabla 2.1 | [SI25] pp. 14–16, imagen; [DccSI] pp. 19–21 |
| 4.6 | Trasteros: ¿solo en uso Residencial Vivienda? | VERIFICADO | La fila cuelga de «Residencial Vivienda». Nota (5): «Se consideran aquellos trasteros que tienen vinculación con las viviendas de los edificios en los que están integrados. Incluye los que comunican con zonas de uso garaje de edificios de vivienda.» | Tabla 2.1 y nota (5) | [SI25] pp. 14, 16 |
| 4.7 | «Los trasteros de más de 50 m² son riesgo especial bajo» | **CORREGIDO** (incompleto) | **Bajo: 50 < S ≤ 100 m²**; **medio: 100 < S ≤ 500 m²**; **alto: S > 500 m²** (S construida). Con S ≤ 50 m² no son local de riesgo especial | Tabla 2.1, fila «Trasteros⁽⁵⁾» | [SI25] p. 14 |
| 4.8 | Trasteros en un edificio de **oficinas** | INTERPRETACIÓN | La fila de trasteros no aplica. El asimilable es «almacenes de elementos combustibles», por **volumen**: 100 < V ≤ 200 m³ bajo, etc. | Tabla 2.1 | — |
| 4.9 | Qué S tomar en una zona de trasteros | LEÍDO (comentario) | «…la superficie construida a considerar es la suma de las superficies de los trasteros de la zona, sin incluir los pasillos de circulación de la misma. Dos zonas de trasteros que presenten riesgos de incendio independientes entre sí pueden clasificarse de forma también independiente.» | [DccSI] p. 21, «Superficie o volumen construido a considerar» | [DccSI] (imagen) |
| 4.10 | Ventilación de trasteros que abren al garaje | LEÍDO (comentario) | Dos rejillas separadas verticalmente **≥ 1,5 m**. El garaje se dimensiona con **0,7 l/s** más por m² útil de trastero. Las rejillas solo han de ser resistentes al fuego si el conjunto pasa de **50 m²** y se compartimenta **cada trastero** en vez del conjunto. **Ojo**: el comentario cita «HS 3-2, tabla 2.1», pero en el DB-HS vigente es la **tabla 2.2** (`verificacion-edificio-usos.md`, D1) | [DccSI] p. 24 | [DccSI] (imagen) |
| 4.11 | Garajes de plazas cerradas | LEÍDO (comentario) | El conjunto es uso Aparcamiento aunque cada plaza tenga ≤ 100 m², salvo que cada garaje individual esté compartimentado **EI 90**, portón incluido: entonces son locales de riesgo especial bajo | [DccSI] p. 24 | [DccSI] (imagen) |
| 4.12 | Tabla 2.2 | VERIFICADO | Ver la transcripción. La imagen muestra **«≤ 25 m»**: el texto extraído pierde el ≤ | Tabla 2.2 | [SI25] p. 16, imagen |
| 4.13 | Suelo mínimo de la tabla 1.2 para paredes y estructura | VERIFICADO (literal) + INTERPRETACIÓN (cómo se aplica) | La nota (2) va en las filas de estructura **y** de paredes y techos. El tiempo no puede ser menor que el de los sectores del uso al que sirve el local (tabla 1.2). Ejemplo: un local de riesgo bajo en el **sótano** de un edificio de viviendas da EI = máx(90; 120) = **EI 120** y R 120. En PB con h ≤ 15 m: máx(90; 60) = EI 90. Las **puertas** no llevan la nota (2): se quedan en EI2 45-C5 (bajo) | Tabla 2.2, nota (2): «El tiempo de resistencia al fuego no debe ser menor que el establecido para los sectores de incendio del uso al que sirve el local de riesgo especial, conforme a la tabla 1.2, excepto cuando se encuentre bajo una cubierta no prevista para evacuación y cuyo fallo no suponga riesgo para la estabilidad de otras plantas ni para la compartimentación contra incendios, en cuyo caso puede ser R 30.» | [SI25] p. 16 |
| 4.14 | Nota (2) en la **unifamiliar** | INTERPRETACIÓN (dos lecturas) | En la unifamiliar no hay sectores (comentario de p. 18), así que la nota (2) no tiene a qué remitir y queda la tabla 2.2 sola: **EI 90**. Coincide con el comentario («EI 60 y EI 90»). La lectura literal contraria daría EI 120 en un garaje en sótano. Propuesta: tabla 2.2 sola, con aviso | Tabla 2.2 nota (2); [DccSI] p. 18 | — |
| 4.15 | Recorrido máximo y su ampliación | VERIFICADO | ≤ 25 m hasta alguna salida del local. Puede aumentarse un **25 %** si la zona tiene extinción automática (nota 6). El recorrido interior cuenta para el recorrido hasta la salida de planta, salvo desde el garaje de una unifamiliar (nota 5) | Tabla 2.2, notas (5) y (6) | [SI25] p. 16 |
| 4.16 | Otras condiciones de los locales de riesgo especial | VERIFICADO | (a) No son sectores (Anejo SI A). (b) No computan en la superficie del sector que los contiene (ap. 1 pto 2). (c) Las escaleras y ascensores que los comunican se compartimentan, y los ascensores en ellos **siempre** con vestíbulo (ap. 1 pto 4). (d) Ningún recorrido de una zona habitable o de un aparcamiento los atraviesa (Anejo SI A). (e) Su vestíbulo no sirve para la evacuación de zonas habitables (Anejo SI A). (f) Sus puntos ocupables son origen de evacuación (Anejo SI A). (g) Revestimientos B-s1,d0 / B_FL-s1 (tabla 4.1). (h) Solo el de riesgo **alto** activa las franjas de SI 2 | Los citados | [SI25] pp. 10, 16, 17, 20, 46, 47, 49, 51 |
| 4.17 | Varios locales de riesgo especial de un mismo uso | LEÍDO (comentario) | Pueden tratarse como un solo local o zona. La compartimentación va al perímetro del conjunto | [DccSI] p. 23 | [DccSI] (imagen) |
| 4.18 | Recinto de instalación no accesible (envolvente registrable) | LEÍDO (comentario) | Cumple las condiciones del local de riesgo que le toque, salvo las de evacuación | [DccSI] p. 23 | [DccSI] (imagen) |

**Tabla 2.1 — Clasificación de los locales y zonas de riesgo especial integrados en edificios** ([SI25] pp. 14–15, imagen). Cabecera: «S = superficie construida · V = volumen construido · Q_T = carga de fuego total ponderada y corregida [MJ], calculada según el anexo I del RSCIEI». Casilla vacía = «—».

| Uso del edificio o establecimiento · Uso del local o zona | Riesgo bajo | Riesgo medio | Riesgo alto |
|---|---|---|---|
| **En cualquier edificio o establecimiento:** | | | |
| Talleres de mantenimiento, almacenes de elementos combustibles (p. e.: mobiliario, lencería, limpieza, etc.), archivos de documentos, depósitos de libros, etc. ⁽¹⁾ | 100 < V ≤ 200 m³ | 200 < V ≤ 400 m³ | V > 400 m³ |
| Almacén de residuos | 5 < S ≤ 15 m² | 15 < S ≤ 30 m² | S > 30 m² |
| Aparcamiento de vehículos cuya superficie S no exceda de 100 m² o integrado en una vivienda unifamiliar | En todo caso | — | — |
| Cocinas según potencia instalada P ⁽²⁾⁽³⁾ | 20 < P ≤ 30 kW | 30 < P ≤ 50 kW | P > 50 kW |
| Lavanderías. Vestuarios de personal. Camerinos ⁽⁴⁾ | 20 < S ≤ 100 m² | 100 < S ≤ 200 m² | S > 200 m² |
| Salas de calderas con potencia útil nominal P | 70 < P ≤ 200 kW | 200 < P ≤ 600 kW | P > 600 kW |
| Salas de máquinas de instalaciones de climatización (según RITE, RD 1027/2007) | En todo caso | — | — |
| Salas de maquinaria frigorífica: refrigerante amoniaco | — | En todo caso | — |
| Salas de maquinaria frigorífica: refrigerante halogenado | P ≤ 400 kW | P > 400 kW | — |
| Almacén de combustible sólido para calefacción | S ≤ 3 m² | S > 3 m² | — |
| Local de contadores de electricidad y de cuadros generales de distribución | En todo caso | — | — |
| Centro de transformación: aparatos con aislamiento dieléctrico seco o líquido con punto de inflamación mayor que 300 °C | En todo caso | — | — |
| Centro de transformación: aparatos con punto de inflamación ≤ 300 °C, potencia instalada **total** | P < 2 520 kVA | 2 520 < P < 4 000 kVA | P > 4 000 kVA |
| ídem, **en cada transformador** | P < 630 kVA | 630 < P < 1 000 kVA | P > 1 000 kVA |
| Sala de maquinaria de ascensores | En todo caso | — | — |
| Sala de grupo electrógeno | En todo caso | — | — |
| **Residencial Vivienda:** Trasteros ⁽⁵⁾ | 50 < S ≤ 100 m² | 100 < S ≤ 500 m² | S > 500 m² |
| **Hospitalario:** almacenes de productos farmacéuticos y clínicos | 100 < V ≤ 200 m³ | 200 < V ≤ 400 m³ | V > 400 m³ |
| **Hospitalario:** esterilización y almacenes anejos | — | — | En todo caso |
| **Hospitalario:** laboratorios clínicos | V ≤ 350 m³ | 350 < V ≤ 500 m³ | V > 500 m³ |
| **Administrativo:** imprenta, reprografía y locales anejos (almacenes de papel o de publicaciones, encuadernado, etc.) ⁽¹⁾ | 100 < V ≤ 200 m³ | 200 < V ≤ 500 m³ | V > 500 m³ |
| **Residencial Público:** roperos y custodia de equipajes | S ≤ 20 m² | 20 < S ≤ 100 m² | S > 100 m² |
| **Comercial:** almacenes según Q_S de los productos ⁽⁶⁾ | 425 < Q_S ≤ 850 MJ/m² | 850 < Q_S ≤ 3.400 MJ/m² | Q_S > 3.400 MJ/m² |
| Comercial, S máx. sobre la planta de salida, **con** extinción automática | S < 2.000 m² | S < 600 m² | S < 25 m² y altura de evacuación < 15 m |
| Comercial, S máx. sobre la planta de salida, **sin** extinción | S < 1.000 m² | S < 300 m² | no se admite |
| Comercial, S máx. bajo la planta de salida, **con** extinción | < 800 m² | no se admite | no se admite |
| Comercial, S máx. bajo la planta de salida, **sin** extinción | < 400 m² | no se admite | no se admite |
| **Pública concurrencia:** taller o almacén de decorados, de vestuario, etc. | — | 100 < V ≤ 200 m³ | V > 200 m³ |

Notas de la tabla 2.1 (literales, abreviadas solo en la (3)):
- ⁽¹⁾ «En el supuesto de que estos locales tengan más de 500 m³ y una carga de fuego total ponderada y corregida (Q_T), calculada según el anexo I del RSCIEI, igual o superior a 3 x 10⁶ MJ, se considerarán zonas de uso Almacén.»
- ⁽²⁾ Solo cuentan los aparatos destinados directamente a preparar alimentos que puedan provocar ignición. Freidoras y sartenes basculantes: **1 kW por litro**. En usos distintos de Hospitalario y Residencial Público, la cocina con aparatos protegidos por extinción automática no es local de riesgo especial, aunque cumple la nota (3). SI 4 exige ese sistema con potencia > **50 kW**.
- ⁽³⁾ Extracción de humos de cocinas que sean local de riesgo especial:
  - campanas a **≥ 50 cm** de cualquier material que no sea A1;
  - conductos independientes y exclusivos, con registros en cambios de dirección de **> 30°** y cada **3 m** de tramo horizontal como máximo;
  - **EI 30** por el interior del edificio, y por fachada a **< 1,50 m** de zonas no EI 30, balcones, terrazas o huecos practicables;
  - sin compuertas cortafuego en su interior: el paso entre sectores se resuelve según el ap. 3;
  - filtros a **> 1,20 m** de los focos de calor si son de parrilla o de gas, y a **> 0,50 m** en otro caso, con inclinación **> 45°** y recipiente de grasas de **< 3 l**;
  - ventiladores según UNE-EN 12101-3:2016, clase **F400 90**.
- ⁽⁴⁾ «Las zonas de aseos no computan a efectos del cálculo de la superficie construida.»
- ⁽⁵⁾ Ver 4.6.
- ⁽⁶⁾ Las áreas públicas de venta no son locales de riesgo especial. Q_S según el anexo I del RSCIEI. Con Q_T ≥ 3·10⁶ MJ, uso Almacén.

**Huecos y bordes que hay que codificar tal cual:**
- En el centro de transformación, los signos son **estrictos en los dos lados**: «P < 2 520», «2 520 < P < 4 000», «P > 4 000», y lo mismo con 630 y 1 000. El valor **exacto** del borde no está en ninguna columna. Es un hueco literal: decisión en C13.
- En las demás filas, el borde superior de cada clase va con «≤» y el siguiente empieza con «<». No hay huecos.
- No hay límite inferior en el almacén de combustible sólido (S ≤ 3 m², riesgo bajo) ni en las filas «En todo caso».

**Nota A4.1 — ¿Cuáles de los recintos habituales NO son local de riesgo especial?**

| Recinto (en edificio de viviendas u oficinas) | ¿Local de riesgo especial? | Base | Veredicto |
|---|---|---|---|
| Almacén de residuos / cuarto de basuras | Solo si S > 5 m² construidos (bajo hasta 15; medio hasta 30; alto > 30) | Tabla 2.1. «Cuarto de basuras» = almacén de residuos | VERIFICADO (fila) + INTERPRETACIÓN (equivalencia) |
| Garaje colectivo ≤ 100 m² construidos, o garaje de una unifamiliar (cualquier S) | Sí, **bajo** | Tabla 2.1; tabla 1.1 nota (2) | VERIFICADO |
| Garaje colectivo > 100 m² construidos | **No**: es uso Aparcamiento (sector) | Anejo SI A | VERIFICADO |
| Trasteros vinculados a viviendas | Solo si S > 50 m² (suma de trasteros, sin pasillos) | Tabla 2.1; [DccSI] p. 21 | VERIFICADO + comentario |
| Sala de calderas | Solo si P útil nominal > 70 kW | Tabla 2.1 | VERIFICADO. **Ojo** con la fila «salas de máquinas … según RITE» (pendiente P3) |
| Sala de máquinas de climatización «según RITE» | Sí, **bajo**, en todo caso | Tabla 2.1 | VERIFICADO (fila). Qué recinto es «sala de máquinas» lo dice el RITE (no releído: P3) |
| Local de contadores de **electricidad** y cuadros generales | Sí, **bajo**, en todo caso | Tabla 2.1 | VERIFICADO |
| Cuadro general en local propio | Bajo si su reglamento pide local. Sin reglamento: cuadros de **> 100 kW** en local de riesgo bajo | [DccSI] p. 23 | LEÍDO (comentario) |
| Armario de centralización de contadores en escalera protegida, vestíbulo o sector de riesgo mínimo | Se admite separado con **EI 120** y registros **EI 60**. El comentario cita «ITC MIE-BT-016» y «16 contadores como máximo» (nomenclatura del REBT antiguo) | [DccSI] p. 73 | LEÍDO (comentario). Cita a revisar (P4) |
| Contadores de **agua** | **No** (sin condiciones de compartimentación respecto de un sector de riesgo mínimo) | [DccSI] p. 80 | LEÍDO (comentario) |
| Contadores de **gas** | No está en la tabla 2.1 (el ap. 2 pto 2 lo remite a su reglamento) | Tabla 2.1; ap. 2 pto 2 | INTERPRETACIÓN: no es local de riesgo especial por el DB-SI |
| Grupo de presión de agua sanitaria, de PCI o de climatización | **No** | [DccSI] p. 21: «…no tienen la consideración de locales de riesgo especial conforme al CTE DB SI.» El de PCI se rige por el RIPCI | LEÍDO (comentario) |
| Aljibe o depósito de agua | No está en la tabla 2.1 | — | INTERPRETACIÓN: no. El de PCI, por el RIPCI |
| RITI / RITS (telecomunicaciones) | **No está en la tabla 2.1.** El comentario dice que sí, **bajo**, salvo los modulares | [DccSI] p. 23, «Recintos de contadores o para instalaciones de telecomunicación» | LEÍDO (comentario): rotular como criterio del Ministerio, no reglamentario |
| Sala de maquinaria de ascensores | Sí, **bajo**. **No** el hueco de un ascensor con la maquinaria dentro | Tabla 2.1; [DccSI] p. 21 | VERIFICADO + comentario |
| Grupo electrógeno | Sí, **bajo** | Tabla 2.1 | VERIFICADO |
| Centro de transformación | Sí (bajo, medio o alto según aislamiento y potencia) | Tabla 2.1 | VERIFICADO |
| Silo o almacén de pellets o leña | Sí: **bajo** si S ≤ 3 m², **medio** si S > 3 m² (sin límite inferior) | Tabla 2.1 | VERIFICADO |
| Cuarto de limpieza o almacén pequeño | Solo si V > 100 m³ | Tabla 2.1 | VERIFICADO |
| Vestuarios de personal (oficinas) | Solo si S > 20 m² (los aseos no computan) | Tabla 2.1, nota (4) | VERIFICADO |
| Cocina de vivienda | En la práctica no (la potencia doméstica suele ser < 20 kW; los hornos cerrados no computan) | Tabla 2.1; [DccSI] p. 22 | INTERPRETACIÓN |
| Equipos en cubierta (aerotermia, enfriadoras…) | **No** (excluidos) | Ap. 2 pto 2 | VERIFICADO |

**Tabla 2.2 — Condiciones de las zonas de riesgo especial integradas en edificios ⁽¹⁾** ([SI25] p. 16, imagen; = [DccSI] p. 25)

| Característica | Riesgo bajo | Riesgo medio | Riesgo alto |
|---|---|---|---|
| Resistencia al fuego de la estructura portante ⁽²⁾ | R 90 | R 120 | R 180 |
| Resistencia al fuego de las paredes y techos ⁽³⁾ que separan la zona del resto del edificio ⁽²⁾⁽⁴⁾ | EI 90 | EI 120 | EI 180 |
| Vestíbulo de independencia en cada comunicación de la zona con el resto del edificio | - | Sí | Sí |
| Puertas de comunicación con el resto del edificio | EI2 45-C5 | 2 x EI2 30-C5 | 2 x EI2 45-C5 |
| Máximo recorrido hasta alguna salida del local ⁽⁵⁾ | ≤ 25 m ⁽⁶⁾ | ≤ 25 m ⁽⁶⁾ | ≤ 25 m ⁽⁶⁾ |

Notas:
- ⁽¹⁾ La reacción al fuego está en la tabla 4.1.
- ⁽²⁾ Literal en 4.13. Párr. 2: «Excepto en los locales destinados a albergar instalaciones y equipos, puede adoptarse como alternativa el tiempo equivalente de exposición al fuego determinado conforme a lo establecido en el apartado 2 del Anejo SI B.»
- ⁽³⁾ Igual que la nota (3) de la tabla 1.2: techo REI; cubierta sin actividad, solo R salvo las franjas de SI 2.
- ⁽⁴⁾ «Considerando la acción del fuego en el interior del recinto.» Párr. 2: el suelo, según el uso de la planta inferior (SI 6, ap. 3).
- ⁽⁵⁾ «El recorrido por el interior de la zona de riesgo especial debe ser tenido en cuenta en el cómputo de la longitud de los recorridos de evacuación hasta las salidas de planta. Lo anterior no es aplicable al recorrido total desde un garaje de una vivienda unifamiliar hasta una salida de dicha vivienda, el cual no está limitado.»
- ⁽⁶⁾ «Podrá aumentarse un 25% cuando la zona esté protegida con una Instalación automática de extinción.»

Coherencia interna (comprobada): las puertas de medio y alto son exactamente ¼ del EI de la pared (120/4 = 30; 180/4 = 45), como en el vestíbulo de independencia del Anejo SI A. La R de la tabla 2.2 coincide con SI 6, tabla 3.2 (p. 39, imagen; → SI 6).

---

## Bloque A5 — SI 1, ap. 3: espacios ocultos y paso de instalaciones

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 5.1 | Continuidad en espacios ocultos | VERIFICADO | La compartimentación sigue por patinillos, cámaras, falsos techos y suelos elevados, salvo que estén compartimentados con al menos la misma resistencia. Los registros de mantenimiento pueden tener **la mitad** | Ap. 3 pto 1: «…salvo cuando éstos estén compartimentados respecto de los primeros al menos con la misma resistencia al fuego, pudiendo reducirse ésta a la mitad en los registros para mantenimiento.» | [SI25] p. 16 |
| 5.2 | Pasos de instalaciones | VERIFICADO | Mantienen la resistencia del elemento atravesado. Quedan **excluidas** las penetraciones de sección de paso **≤ 50 cm²** | Ap. 3 pto 2: «…excluidas las penetraciones cuya sección de paso no exceda de 50 cm².» | [SI25] p. 16, imagen |
| 5.3 | Soluciones | VERIFICADO | a) obturación automática: compuerta cortafuegos **EI t (i↔o)** o dispositivo intumescente; b) elemento pasante **EI t (i↔o)**. t = resistencia del elemento atravesado | Ap. 3 pto 2 a) y b) | [SI25] p. 17, imagen |
| 5.4 | Huecos pequeños próximos | LEÍDO (comentario) | Los huecos separados **< 3 m** entre sí **suman** su sección para el umbral de 50 cm² | [DccSI] p. 26 | [DccSI] (imagen) |
| 5.5 | Desagües de inodoros en forjados entre viviendas (no entre sectores) | LEÍDO (comentario) | Puede flexibilizarse: en esos puntos no hace falta el EI 60 del forjado. Lo mismo en las acometidas a los patinillos | [DccSI] p. 26 | [DccSI] (imagen) |
| 5.6 | Patinillos estancos | LEÍDO (comentario) | Son «suficientemente estancos» si su cerramiento tiene la resistencia de lo que atraviesan (incluidos los pasos de > 50 cm²) y los registros, **≥ 50 %**. Entonces no se exige reacción al fuego a sus bajantes | [DccSI] p. 26 | [DccSI] (imagen) |
| 5.7 | Bajantes vistas en el techo del garaje | LEÍDO (comentario) | Rompen la sectorización **EI 120** del aparcamiento, salvo que suban por un patinillo compartimentado con esa resistencia | [DccSI] p. 25 | [DccSI] (texto) |
| 5.8 | Cierre automático | LEÍDO (comentario) | Toda puerta de paso a un local de instalaciones que deba ser resistente al fuego lleva cierre automático **C5**. Los registros de patinillos y conductos no lo necesitan | [DccSI] p. 26 | [DccSI] (imagen) |
| 5.9 | Conducto pasante resistente | LEÍDO (comentario) | Debe tener la resistencia en **toda** su longitud dentro de al menos uno de los sectores que atraviesa | [DccSI] p. 26 | [DccSI] (imagen) |

---

## Bloque A6 — SI 1, ap. 4: reacción al fuego

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 6.1 | Tabla 4.1 | VERIFICADO | Ver la transcripción | Ap. 4 pto 1 y tabla 4.1 | [SI25] p. 17, imagen; [DccSI] p. 27 |
| 6.2 | Cables y componentes eléctricos | VERIFICADO | Los regula su reglamentación específica, no el DB-SI | Ap. 4 pto 2: «Las condiciones de reacción al fuego de los componentes de las instalaciones eléctricas (cables, tubos, bandejas, regletas, armarios, etc.) se regulan en su reglamentación específica.» | [SI25] p. 17 |
| 6.3 | Cerramientos textiles (carpas) | VERIFICADO | Nivel **T2** según UNE-EN 15619:2014, o **C-s2,d0** según UNE-EN 13501-1:2007 | Ap. 4 pto 3 | [SI25] p. 17 |
| 6.4 | Mobiliario y elementos decorativos | VERIFICADO; fuera de alcance | Solo en uso Pública concurrencia (butacas: UNE-EN 1021-1:2015 y 1021-2:2006; textiles suspendidos: clase 1 UNE-EN 13773:2003) | Ap. 4 pto 4 | [SI25] pp. 17–18 |
| 6.5 | El 5 % de la nota (1) | LEÍDO (comentario) | El «conjunto» es todo el ámbito de la obra (planta o sector), sin descontar puertas. La superficie exenta ha de estar repartida en pequeños elementos, no concentrada. No aplica a elementos estructurales lineales (R 30 o más) | [DccSI] p. 27 | [DccSI] (texto) |
| 6.6 | Productos multicapa | LEÍDO (comentario) | Un producto fabricado como multicapa se clasifica como tal. La nota (3) es para capas superpuestas en obra | [DccSI] p. 27 | [DccSI] (texto) |

**Tabla 4.1 — Clases de reacción al fuego de los elementos constructivos** ([SI25] p. 17, imagen)

| Situación del elemento | Revestimientos ⁽¹⁾ de techos y paredes ⁽²⁾⁽³⁾ | Revestimientos ⁽¹⁾ de suelos ⁽²⁾ |
|---|---|---|
| Zonas ocupables ⁽⁴⁾ | C-s2,d0 | E_FL |
| Pasillos y escaleras protegidos | B-s1,d0 | C_FL-s1 |
| Aparcamientos y recintos de riesgo especial ⁽⁵⁾ | B-s1,d0 | B_FL-s1 |
| Espacios ocultos no estancos, tales como patinillos, falsos techos y suelos elevados (excepto los existentes dentro de las viviendas) etc. o que siendo estancos, contengan instalaciones susceptibles de iniciar o de propagar un incendio | B-s3,d0 | B_FL-s2 ⁽⁶⁾ |

Notas:
- ⁽¹⁾ «Siempre que superen el 5% de las superficies totales del conjunto de las paredes, del conjunto de los techos o del conjunto de los suelos del recinto considerado.»
- ⁽²⁾ Incluye tuberías y conductos sin recubrimiento resistente al fuego. Con aislamiento térmico lineal, la misma clase con subíndice **L**.
- ⁽³⁾ Incluye las capas interiores del techo o pared no protegidas por una capa **EI 30** como mínimo.
- ⁽⁴⁾ «Incluye, tanto las de permanencia de personas, como las de circulación que no sean protegidas. Excluye el interior de viviendas. En uso Hospitalario se aplicarán las mismas condiciones que en pasillos y escaleras protegidos.»
- ⁽⁵⁾ «Véase el capítulo 2 de esta Sección.»
- ⁽⁶⁾ Parte inferior de la cavidad (en un falso techo, la cara superior de la membrana). No aplica a espacios de clara configuración vertical (patinillos) ni a falsos techos de celosía o entramado abierto.

Aplicación a las zonas de El edificio (INTERPRETACIÓN):

| Zona de El edificio | Fila de la tabla 4.1 |
|---|---|
| Interior de viviendas (también la unifamiliar) | Ninguna (nota 4) |
| Portal, vestíbulo, pasillos y escalera **no** protegida | Zonas ocupables |
| Escalera protegida o pasillo protegido | Su fila propia |
| Garaje (uso Aparcamiento) y cualquier local de riesgo especial (incluido el garaje de la unifamiliar) | Aparcamientos y recintos de riesgo especial |
| Oficinas y local | Zonas ocupables |
| Trasteros y cuartos de instalaciones que **no** son local de riesgo especial | Zonas ocupables. La tabla no tiene otra fila: «ocupación nula» no significa «no ocupable» (C18) |

---

## Bloque A7 — SI 2, ap. 1: medianerías y fachadas

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 7.1 | Medianería | VERIFICADO | **EI 120** como mínimo, sea cual sea la altura | Ap. 1 pto 1: «Los elementos verticales separadores de otro edificio deben ser al menos EI 120.» | [SI25] p. 19, imagen |
| 7.1b | Unifamiliares adosadas de un mismo proyecto | LEÍDO (comentario) | No son medianería (un mismo «edificio»): basta EI 60 entre viviendas. Entre viviendas de edificios distintos, SI 2 completo | [DccSI] p. 18 | [DccSI] (imagen) |
| 7.2 | Qué obliga a la separación **horizontal** en fachada | VERIFICADO | Tres casos: (a) entre **dos sectores**; (b) entre una zona de riesgo especial **alto** y otras zonas; (c) **hacia** una escalera protegida o un pasillo protegido desde otras zonas. Afecta a los puntos de fachada que no sean **al menos EI 60** | Ap. 1 pto 2 | [SI25] p. 19 |
| 7.3 | Distancia d según el ángulo α | VERIFICADO | Ver la tabla. α es el ángulo entre los planos **exteriores** de las fachadas: 0° = fachadas enfrentadas paralelas, 180° = fachadas en un mismo plano (figuras 1.1 a 1.6). Valores intermedios: «la distancia d puede obtenerse por **interpolación lineal**» | Ap. 1 pto 2 y tabla | [SI25] pp. 19–20, imagen |
| 7.4 | Edificios diferentes y colindantes | VERIFICADO | Los puntos no EI 60 del edificio considerado cumplen **el 50 % de d** hasta la **bisectriz** del ángulo entre fachadas | Ap. 1 pto 2, párr. 2 | [SI25] p. 19 |
| 7.5 | α > 180° (esquina convexa) | NO VERIFICABLE | La tabla acaba en 180° y el DB no dice nada para ángulos mayores. Ver C11 | — | — |
| 7.5b | Salientes verticales | LEÍDO (comentario) | Pueden sustituir a la separación horizontal elementos verticales salientes **E 30** que se interpongan entre los puntos que no cumplen | [DccSI] p. 30 | [DccSI] (texto) |
| 7.6 | Separación **vertical** | VERIFICADO | La fachada es **al menos EI 60** en una franja de **1 m** de altura **como mínimo**, medida sobre el plano de la fachada. Si hay salientes aptos para impedir el paso de las llamas, la franja se reduce en la dimensión del saliente (fig. 1.8: «≥ 1 m − b») | Ap. 1 pto 3 | [SI25] p. 20, imagen |
| 7.7 | Qué obliga a la franja vertical | VERIFICADO | (a) entre **dos sectores**; (b) entre una zona de riesgo especial **alto** y **otras zonas más altas** del edificio; (c) **hacia** una escalera o pasillo protegido desde otras zonas | Ap. 1 pto 3 | [SI25] p. 20 |
| 7.7b | En El edificio | INTERPRETACIÓN | **Sí obliga:** local de PB (si es sector) bajo viviendas; garaje con fachada (semisótano) bajo un sector de otro uso; escalera protegida. **No obliga:** entre viviendas de un mismo sector, ni el garaje de la unifamiliar, ni trasteros o cuartos de riesgo **bajo o medio** | Ap. 1 ptos 2 y 3; Anejo SI A, «Sector de incendio» | — |
| 7.7c | Encuentro forjado–fachada | LEÍDO (comentario) | El forjado separador mantiene su EI en el encuentro con la fachada, con o sin sellado, y además la R de SI 6. **Ojo**: el comentario dice «tabla 2.2 de SI 1-2». Para forjados entre sectores, la tabla es la **1.2** (SI 1-1); la 2.2 solo si el forjado delimita un local de riesgo especial | [DccSI] p. 31 | [DccSI] (imagen) |
| 7.7d | Ventanas en zonas que deben ser EI | LEÍDO (comentario) | Vale un acristalamiento **fijo** que dé el EI como conjunto. **No** vale una ventana practicable | [DccSI] p. 33 | [DccSI] (texto) |
| 7.8 | Reacción al fuego de los sistemas constructivos de fachada | VERIFICADO (texto vigente) | Los que ocupen **> 10 %** de la superficie de la fachada, según su **altura total**: **D-s3,d0** hasta 10 m; **C-s3,d0** hasta 18 m; **B-s3,d0** por encima de 18 m. Se clasifica en su condición de uso final, incluidas las capas interiores no protegidas por una capa **EI 30** como mínimo | Ap. 1 pto 4 | [SI25] p. 20, imagen |
| 7.9 | Aislamiento en cámaras ventiladas | VERIFICADO (texto vigente) | **D-s3,d0** hasta 10 m; **B-s3,d0** hasta 28 m; **A2-s3,d0** por encima de 28 m. Hay que limitar el desarrollo vertical de la cámara en los forjados entre sectores: vale con barreras **E 30** | Ap. 1 pto 5 | [SI25] p. 20, imagen |
| 7.10 | Arranque accesible al público | VERIFICADO | Fachadas de altura **≤ 18 m** cuyo arranque sea accesible al público desde la rasante o desde una cubierta: **B-s3,d0** como mínimo hasta **3,5 m** de altura, tanto los sistemas del pto 4 como los aislantes de cámara | Ap. 1 pto 6 | [SI25] p. 20, imagen |
| 7.10b | Cuándo no es accesible al público | LEÍDO (comentario) | Si el arranque está en parcela privativa del edificio, o si algo restringe el acceso aunque esté en zona pública (jardín no transitable, lámina de agua) | [DccSI] p. 31 | [DccSI] (imagen) |
| 7.10c | Petos, celosías, toldos | LEÍDO (comentario) | Las condiciones de reacción de fachada aplican también a cerramientos ligeros, petos y defensas de terrazas, celosías y protecciones solares. **No** a los toldos | [DccSI] p. 31 | [DccSI] (imagen) |
| 7.11 | ¿Qué es la «altura total de la fachada»? | NO VERIFICABLE: el DB no la define | **No es la altura de evacuación** (otra magnitud). Ver C8 | Ap. 1 ptos 4–6 | — |
| 7.12 | ¿Desde qué edición rige este texto? | NO VERIFICABLE en esta sesión | El texto de 7.8 a 7.10 es el del consolidado de 4-mar-2025. No he leído el BOE de RD 732/2019 ni de RD 164/2025 para fechar cada punto (P1) | — | — |

**Distancia mínima d entre puntos de fachada no EI 60, según el ángulo α** (SI 2, ap. 1 pto 2; [SI25] p. 19, imagen)

| α | 0° ⁽¹⁾ | 45° | 60° | 90° | 135° | 180° |
|---|---|---|---|---|---|---|
| d (m) | 3,00 | 2,75 | 2,50 | 2,00 | 1,25 | 0,50 |

⁽¹⁾ «Refleja el caso de fachadas enfrentadas paralelas». Interpolación lineal permitida para valores intermedios de α.

Propiedad comprobada: d no crece al crecer α. Entre 45° y 180°, d = 2,75 − (α − 45)/60 (exacto en 45, 60, 90, 135 y 180). Entre 0° y 45°, la pendiente es distinta (−0,25 m en 45°). Basta con interpolar en la tabla: no hace falta fórmula.

---

## Bloque A8 — SI 2, ap. 2: cubiertas

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 8.1 | Franjas REI 60 | VERIFICADO | **REI 60** como mínimo en una franja de **0,50 m** medida desde el edificio colindante, y en una franja de **1,00 m** sobre el encuentro con la cubierta de **todo elemento compartimentador de un sector de incendio o de un local de riesgo especial alto**. Alternativa: prolongar la medianería o el elemento compartimentador **0,60 m** por encima del acabado de la cubierta | Ap. 2 pto 1 | [SI25] pp. 20–21, imagen |
| 8.1b | ¿Franja sobre el encuentro con una escalera protegida? | INTERPRETACIÓN (literal) | El pto 1 solo nombra sectores y locales de riesgo alto. La escalera protegida no es un sector. A diferencia del ap. 1, el ap. 2 no la menciona | Ap. 2 pto 1 | — |
| 8.1c | Cuando no hay solución global para toda la cubierta (intervención parcial) | LEÍDO (comentario) | Debería disponerse, en el lado de la intervención, la franja de 0,50 m REI 60 | [DccSI] p. 32 | [DccSI] (texto) |
| 8.2 | Encuentro cubierta–fachada de sectores o edificios distintos | VERIFICADO | Altura h sobre la cubierta a la que debe estar cualquier zona de fachada no EI 60, según la distancia horizontal d a la zona de cubierta no EI 60. Ver la tabla | Ap. 2 pto 2 y tabla | [SI25] p. 21, imagen |
| 8.3 | Valores intermedios de d | NO VERIFICABLE: el DB no dice cómo tratarlos (a diferencia de α en 7.3) | Aritmética de la tabla: **h = 5 − 2d** para 0 ≤ d ≤ 2,50, exacto en los nueve puntos (INTERPRETACIÓN). Uso: C10 | Tabla del ap. 2 pto 2 | — |
| 8.3b | Lucernario sobre zócalo | LEÍDO (comentario) | h se mide desde el hueco del lucernario hasta la zona de fachada no EI 60 | [DccSI] p. 32 | [DccSI] (texto) |
| 8.4 | Reacción al fuego de la cubierta | VERIFICADO | **B_ROOF(t1)** para los materiales que ocupen **> 10 %** del revestimiento o acabado exterior de las zonas de cubierta situadas a **< 5 m** de la proyección vertical de cualquier zona de fachada, del mismo o de otro edificio, no EI 60. Incluye la cara superior de los voladizos de **> 1 m**, «así como los lucernarios, claraboyas y cualquier otro elemento de iluminación o ventilación» | Ap. 2 pto 3 | [SI25] p. 21, imagen |
| 8.5 | ¿B_ROOF(t1) en lucernarios fuera de esos 5 m? | INTERPRETACIÓN (redacción ambigua) | «así como los lucernarios…» puede leerse ligado a «las zonas de cubierta situadas a menos de 5 m» o como sujeto independiente (todo lucernario). Ver C12 | Ap. 2 pto 3 | — |
| 8.6 | Sentido del fuego en franjas de fachada y cubierta | LEÍDO (comentario) | Puede venir de dentro, de fuera o de ambos lados. Del lado de la seguridad: considerarlo desde el interior | [DccSI] pp. 32–33 | [DccSI] (texto) |

**Encuentro cubierta–fachada: altura h según la distancia d** (SI 2, ap. 2 pto 2; [SI25] p. 21, imagen)

| d (m) | ≥ 2,50 | 2,00 | 1,75 | 1,50 | 1,25 | 1,00 | 0,75 | 0,50 | 0 |
|---|---|---|---|---|---|---|---|---|---|
| h (m) | 0 | 1,00 | 1,50 | 2,00 | 2,50 | 3,00 | 3,50 | 4,00 | 5,00 |

La primera casilla es **«≥2,50»** en la imagen y en el texto. La figura 2.1 rotula «SECTOR 1 / SECTOR 2», «EI<60», d en horizontal y h en vertical.

---

## Bloque A9 — Comentarios del Ministerio relevantes (no reglamentarios)

Todos de [DccSI] 4-3-2025 y leídos en imagen salvo que se diga. Rotular siempre: «Comentario del Ministerio al DB-SI, no reglamentario».

| # | Tema | Contenido (literal o resumen fiel) | Página |
|---|---|---|---|
| 9.1 | Local sin uso | «…a efectos del CTE, una obra inacabada…» (literal en 1.13) | p. 6 |
| 9.2 | Actividad profesional en vivienda | Una consulta o clase particular en una vivienda que sigue siéndolo no es cambio de uso | p. 6 |
| 9.3 | Establecimientos de pequeña entidad | Pueden asimilarse a Administrativo los que tengan **≤ 100 m² útiles** y **≤ 10 personas**, con clientes citados de forma personalizada | p. 6 |
| 9.4 | Establecimiento y titularidad | Ver 1.12b y 1.16 | pp. 16–17 |
| 9.5 | Vivienda como sector | No es válido: la puerta de la vivienda es privativa y su cierre automático no es fiable | p. 17 |
| 9.6 | Local de riesgo especial dentro del aparcamiento | Sin vestíbulo, salvo riesgo medio o alto | p. 17 |
| 9.7 | Unifamiliar | Sin sectores interiores. Separación EI 60 entre unifamiliares de un mismo proyecto (no son medianería). Vivienda / Aparcamiento: EI 60 (vivienda) y EI 120 (aparcamiento). Garaje propio: EI 60 y EI 90 | p. 18 |
| 9.8 | Mampara y puerta con fijos | Ver 3.23 | pp. 18–19 |
| 9.9 | Trasteros: superficie | Suma de los trasteros sin pasillos. Zonas con riesgos independientes, por separado | p. 21 |
| 9.10 | Grupos de presión | No son local de riesgo especial (el de PCI, por el RIPCI) | p. 21 |
| 9.11 | Ascensor sin cuarto de máquinas | El hueco no es local de maquinaria | p. 21 |
| 9.12 | Cuadro general de distribución | En local de riesgo bajo si su reglamento lo pide. Sin reglamento, > 100 kW | p. 23 |
| 9.13 | Contadores de electricidad y RITI/RITS | Local de riesgo especial **bajo** (salvo modulares). En un sector de riesgo mínimo, con vestíbulo de independencia | p. 23 |
| 9.14 | Maquinaria frigorífica | Local de riesgo bajo o medio solo cuando su reglamento obliga a un local independiente | p. 23 |
| 9.15 | Vestíbulo en un local de riesgo medio o alto con salida directa al exterior | Sigue siendo necesario, salvo con portón del 100 % del EI que cierre automáticamente y permanezca cerrado | pp. 23–24 |
| 9.16 | Trasteros que abren al garaje | Ver 4.10 (con la corrección de la cita de HS 3) | p. 24 |
| 9.17 | Garajes de plazas cerradas | Ver 4.11. Plaza ligada a su vivienda: vestíbulo con paredes **EI 120** y dos puertas **EI2 30-C5**, o escalera configurada como tal recinto; no hace falta escalera especialmente protegida (p. 41, → SI 3) | pp. 24, 41 |
| 9.18 | Garaje exclusivo de unifamiliar | Ver nota 1.10 b) | p. 24 |
| 9.19 | Instalaciones en cubierta | Ver 4.3b | p. 24 |
| 9.20 | Bajantes en el techo del garaje | Ver 5.7 | p. 25 (texto) |
| 9.21 | Desagües, patinillos, pasos pequeños, cierre C5 | Ver 5.4–5.9 | p. 26 |
| 9.22 | Forjado–fachada, ventanas EI, arranque no accesible, petos | Ver 7.7c, 7.7d, 7.10b y 7.10c | pp. 31–33 |
| 9.23 | Escalera común del garaje al portal | Especialmente protegida si salva > **2,80 m** (→ SI 3, comentario) | p. 48 (texto) |
| 9.24 | Vestíbulo de una escalera especialmente protegida en edificio de viviendas | No puede comunicar directamente con las viviendas: debe hacerlo a una zona común | p. 71 (texto) |
| 9.25 | Local de riesgo bajo (p. ej. contadores) desde el vestíbulo de una escalera especialmente protegida (p. ej. la del garaje) | Se admite con puerta **EI2 30-C5** | p. 72 (texto) |
| 9.26 | Armario de contadores en escalera protegida, vestíbulo o sector de riesgo mínimo | Se admite con **EI 120** y registros **EI 60** (y la cita a la «ITC MIE-BT-016», P4) | p. 73 |
| 9.27 | Contadores de agua y armarios modulares de telecomunicaciones | Sin condiciones de compartimentación respecto de un sector de riesgo mínimo | p. 80 |
| 9.28 | Salida de la unifamiliar por su garaje | No, salvo garaje abierto asimilable a plaza cubierta | p. 77 (texto) |
| 9.29 | «Zonas habitables» | Todas las que no son de riesgo especial ni aparcamiento | p. 77 (texto) |

---

## Bloque A10 — Frases típicas de memoria

| # | Frase | Veredicto | Redacción correcta | Cita |
|---|---|---|---|---|
| 10.1 | «Los elementos que separan viviendas son EI 60» | VERIFICADO | «Los elementos que separan viviendas entre sí son al menos EI 60.» Incluye forjados (INTERPRETACIÓN, 3.4b). No es exigencia para la separación vivienda–zona común ni para la puerta de la vivienda (3.5) | DB-SI (consolidado 4-mar-2025), SI 1, tabla 1.1, Residencial Vivienda |
| 10.2 | «El garaje es sector independiente y se comunica con el resto por vestíbulo de independencia con puertas EI2 30-C5» | VERIFICADO, con dos condiciones | Cierto si el garaje es **uso Aparcamiento**: > 100 m² construidos y no de una unifamiliar. Vestíbulo con paredes EI 120 y dos puertas EI2 30-C5 (¼ de EI 120). Si es ≤ 100 m² o de una unifamiliar: local de riesgo especial **bajo**, sin vestíbulo, puerta **EI2 45-C5**, paredes **EI 90** (o más por la nota 2 de la tabla 2.2) | SI 1, tabla 1.1 «Aparcamiento» y nota (2); tabla 1.2; tabla 2.1; tabla 2.2; Anejo SI A |
| 10.3 | «El forjado entre el garaje y las viviendas es EI 120 (bajo rasante)» | **CORREGIDO** | «**REI 120**», no EI, porque es techo portante (nota 3). El 120 sale de la fila **Aparcamiento**, que es EI 120 en las cuatro columnas, **no de estar bajo rasante**: un garaje en PB bajo viviendas también da REI 120. La R estructural, por SI 6 (→ SI 6) | SI 1, tabla 1.2, fila Aparcamiento y notas (3), (4) y (6) |
| 10.4 | «El local de PB es sector independiente con elementos EI 90» | **CORREGIDO** (condicional) | Solo si el local es **Comercial** (o Pública concurrencia) y la altura de evacuación del **edificio** es **h ≤ 15 m**. Con 15 < h ≤ 28 m, EI 120; con h > 28 m, EI 180. Su techo, **REI**. Si es Administrativo de ≤ 500 m² construidos en un edificio de viviendas, no tiene por qué ser sector. Si no tiene uso, el DB no se lo asigna (C3) | SI 1, tabla 1.1 «En general»; tabla 1.2 y nota (3) |
| 10.5 | «Los trasteros de más de 50 m² son local de riesgo especial bajo» | **CORREGIDO** (incompleto) | «Los trasteros vinculados a las viviendas son local de riesgo especial **bajo** con **50 < S ≤ 100 m²** construidos, **medio** hasta **500 m²** y **alto** por encima.» S = suma de los trasteros sin pasillos (comentario) | SI 1, tabla 2.1, Residencial Vivienda, y nota (5) |
| 10.6 | «El cuarto de contadores es riesgo especial bajo» | VERIFICADO, solo para **electricidad** | «El local de contadores de electricidad y cuadros generales de distribución es local de riesgo especial bajo en todo caso.» Los de agua no (comentario); los de gas no están en la tabla | SI 1, tabla 2.1 |
| 10.7 | «Los revestimientos de zonas ocupables son C-s2,d0 en paredes y techos y EFL en suelos» | VERIFICADO | Añadir: excluye el interior de las viviendas; solo si superan el 5 % del conjunto. Escaleras y pasillos protegidos: B-s1,d0 / C_FL-s1. Garaje y locales de riesgo especial: B-s1,d0 / B_FL-s1 | SI 1, tabla 4.1 y notas (1) y (4) |
| 10.8 | «La medianería es EI 120» | VERIFICADO | «Los elementos verticales separadores de otro edificio son al menos EI 120.» | SI 2, ap. 1 pto 1 |
| 10.9 | «Franja de 1 m EI 60 entre plantas de sectores distintos» | VERIFICADO, con precisiones | «La fachada es al menos EI 60 en una franja de 1 m de altura como mínimo, medida sobre su plano, entre dos sectores de incendio (también entre un local de riesgo especial alto y zonas más altas, y hacia escaleras o pasillos protegidos). Se reduce en la dimensión de los salientes aptos para impedir el paso de las llamas.» No aplica entre viviendas de un mismo sector | SI 2, ap. 1 pto 3 |

---

## Edición y forma de citar en la ficha

| # | Afirmación | Veredicto | Valor | Cita | Fuente |
|---|---|---|---|---|---|
| E.1 | Texto vigente | VERIFICADO | DB-SI consolidado «4 marzo 2025». Última modificación: **RD 164/2025** de 4 de marzo (BOE 10-04-2025). Antes: RD 732/2019 y las disposiciones de la tabla 0 | [SI25] p. 2 | [SI25] |
| E.2 | ¿Qué cambió RD 732/2019 o RD 164/2025 en SI 1, SI 2 o el Anejo SI A? | NO VERIFICABLE en esta sesión | Indicios en el propio documento: (a) un comentario dice que, desde RD 164/2025, el DB-SI se aplica a todas las zonas con vehículos ([DccSI] p. 81); (b) el Anejo SI A del consolidado ya no define el uso Pública Concurrencia (2.26). Hay que leerlo en el BOE (P1) | — | — |
| E.3 | Forma de citar | CRITERIO (forma) | En la ficha: «CTE DB-SI (texto consolidado de 4-mar-2025, incl. RD 164/2025), SI 1, ap. 1, tabla 1.2». Comentarios: «Comentario del Ministerio al DB-SI (versión de 4-mar-2025), no reglamentario». Procedencia en código: la misma `PROC_SI` que `src/lib/edificio/tablas.ts` (`db: "DB-SI"`, `edicion: "consolidado 4-mar-2025 (RD 164/2025)"`, `fecha: "2025-03-04"`), para que las citas coincidan | — | [REPO] |

---

## Cifras que SÍ se pueden mostrar en la UI, con su cita

Todas con la cita «DB-SI (consolidado 4-mar-2025), …».
- **Sectores** (SI 1, tabla 1.1):
  - 2.500 m² **construidos** por sector en Residencial Vivienda, Administrativo y Comercial; ×2 con extinción automática (ap. 1 pto 1);
  - EI 60 entre viviendas;
  - establecimiento exento si es Administrativo, Docente o Residencial Público de ≤ 500 m² construidos en un edificio de viviendas;
  - zona subsidiaria: vivienda siempre; Administrativo o Comercial > 500 m²; Aparcamiento > 100 m² con vestíbulo;
  - la nota (2): aparcamiento convencional de ≤ 100 m² = local de riesgo bajo.
- **Tabla 1.2 completa**, con sus siete notas y la regla de puertas (½ o ¼). La nota 3.22 (puertas resultantes) rotulada «resultado de aplicar la tabla 1.2 y la definición de vestíbulo de independencia».
- **Ascensores** (ap. 1 pto 4): E 30 o vestíbulo con EI2 30-C5; vestíbulo siempre en aparcamiento o en zona de riesgo especial.
- **Tabla 2.1** (filas en alcance) y **tabla 2.2 completa**, con las notas; S y V **construidos**; ≤ 25 m (+25 % con extinción).
- **Paso de instalaciones**: 50 cm²; registros a la mitad; EI t (i↔o) (SI 1, ap. 3).
- **Tabla 4.1 completa**, con el 5 % y la exclusión del interior de las viviendas.
- **SI 2**:
  - EI 120 de medianería;
  - tabla α–d con interpolación lineal; 50 % hasta la bisectriz entre edificios colindantes;
  - franja de 1 m EI 60;
  - reacción de fachada 10/18 m (D/C/B-s3,d0) sobre el 10 % de la superficie;
  - aislante en cámara 10/28 m (D/B/A2-s3,d0); barreras E 30;
  - arranque accesible: ≤ 18 m de fachada, B-s3,d0 hasta 3,5 m;
  - cubierta: franjas REI 60 de 0,50 m y 1,00 m o prolongación de 0,60 m; tabla d–h; B_ROOF(t1) a menos de 5 m, > 10 %, voladizos de > 1 m.
- **Anejo SI A**: las cifras de las definiciones del bloque A2 (vestíbulo de independencia, escaleras, pasillo protegido, aparcamiento abierto, sector de riesgo mínimo, origen de evacuación).
- **Comentarios**, siempre rotulados «no reglamentario»:
  - unifamiliar (EI 60 / EI 90; 25 m; EI2 45-C5; 80 cm);
  - grupo de presión y contadores de agua: no son local de riesgo especial;
  - RITI/RITS: local de riesgo bajo (criterio del Ministerio);
  - trasteros: superficie = suma sin pasillos;
  - local sin uso = obra inacabada.

## Cifras que NO deben mostrarse

- **«EI 90» fijo para el local de PB.** Depende del uso y de h (10.4).
- **«EI 120» para el forjado del garaje.** Es **REI 120**, y no por estar bajo rasante (10.3).
- **«Trasteros > 50 m² = riesgo bajo»** sin el tope de 100 m² (10.5).
- **Cualquier valor de la tabla 1.2 o de la 2.1 decidido con superficie útil como si fuera construida**, sin rotularlo (C1).
- **Un factor útil → construida como «del DB»**, ni el 75 % de la definición de superficie útil usado al revés (2.23).
- **La altura de evacuación como «altura de la fachada»** para los umbrales de 10, 18 y 28 m de SI 2 (7.11).
- **«0,7 l/s·m² según HS 3-2, tabla 2.1»** copiado del comentario: la tabla vigente es la **2.2** del DB-HS 3.
- **«ITC MIE-BT-016 … 16 contadores»** copiado del comentario, sin revisar el REBT vigente (P4).
- **«Tabla 2.2 de SI 1-2»** para el forjado–fachada entre sectores (7.7c): citar la tabla 1.2.
- **RITI/RITS como local de riesgo especial «por la tabla 2.1»**: no está en la tabla; es un comentario.
- **Una definición de «Uso Pública Concurrencia»** tomada de ediciones anteriores (2.26).
- **Valores intermedios de la tabla d–h presentados como «interpolación del DB»**: el DB solo la autoriza para α (8.3).
- **Una d para α > 180°** (7.5).
- **El recorrido de 25 m aumentado un 25 %** sin extinción automática en la zona.
- **La clase de un centro de transformación con P exactamente igual a 630, 1 000, 2 520 o 4 000 kVA** como si la tabla la diera (C13).
- **Una exigencia EI para la puerta de entrada a la vivienda** (3.5).

---

## Criterios de proyecto (rotular como CRITERIO en la ficha)

- **C1 — Superficie construida a partir de la útil.**
  - **El DB-SI no da ningún factor y no define la superficie construida** (2.24).
  - Todos los umbrales de SI 1 son de superficie construida: 100, 500 y 2.500 m² de la tabla 1.1; 5/15/30, 20/100/200 y 50/100/500 m² de la tabla 2.1.
  - Propuesta, en este orden:
    - (a) pedir la superficie construida de cada zona, o tomarla del cuadro de superficies, que feature-13 hoy lee y **descarta**: conservarla;
    - (b) sin ella: si la útil **ya supera** el umbral, la construida también lo supera (construida ≥ útil): conclusión segura;
    - (c) si la útil no lo supera, el resultado queda **indeterminado**. La herramienta aplica el régimen **más exigente**, rotulado «supuesto: superficie construida desconocida», y pide el dato.
  - Más exigente es: uso Aparcamiento frente a local de riesgo bajo; la clase superior de la tabla 2.1; sector frente a no sector.
  - No inventar un coeficiente «normativo». Si se admite un factor que teclee el usuario, va rotulado como suyo.
- **C2 — Cuarto de instalaciones de tipo desconocido.**
  - Añadir un subtipo a la zona `instalaciones`: contadores de electricidad, cuadro general, RITI/RITS, grupo de presión o aljibe, contadores de agua, contadores de gas, sala de calderas (con P útil nominal), sala de máquinas RITE, maquinaria de ascensor, grupo electrógeno, centro de transformación (con aislamiento y P), almacén de residuos (con S), almacén de combustible sólido (con S), otro.
  - Mientras no se defina: tratarlo **provisionalmente como local de riesgo especial bajo**, con aviso «tipo sin definir». Es el caso más frecuente en vivienda (contadores de electricidad, RITI/RITS por el comentario, sala de máquinas RITE, maquinaria de ascensor, grupo electrógeno).
  - El veredicto no es definitivo.
  - Si el subtipo es sala de calderas, centro de transformación o almacén de combustible, sin potencia o superficie, no dar clase.
  - Si es grupo de presión, aljibe o contadores de agua o de gas: no es local de riesgo especial.
- **C3 — Local en PB sin uso.**
  - Un comentario lo trata como obra inacabada (1.13): el DB no le asigna exigencias propias.
  - Propuesta: preguntar el **uso previsto** (Comercial / Administrativo / sin definir) y si será **establecimiento** (titularidad diferenciada).
  - Si queda «sin definir»: sectorizarlo como **Comercial**. Es el peor caso de la tabla 1.2 en alcance: Comercial = Pública concurrencia = Hospitalario. Supone EI 90/120/180 y techo REI según h, rotulado «supuesto».
  - Avisar de que la obra de terminación aplicará el CTE vigente para su uso.
- **C4 — Uso principal de un edificio mixto.** No definido en el DB. Propuesta: el de mayor superficie construida, excluidos el aparcamiento y las zonas de ocupación nula, con confirmación del usuario. Solo importa para la excepción de 500 m² de la tabla 1.1. Para oficinas en un edificio de viviendas da igual (1.17).
- **C5 — «Plantas bajo rasante» de la tabla 1.2.** Nivel < 0 en El edificio (`esBajoRasante`). Un semisótano parcialmente sobre rasante no se modela: aviso.
- **C6 — Elemento entre sectores de usos distintos.** EI = el mayor de los dos usos, salvo que el proyectista justifique una resistencia asimétrica por cada cara (3.16).
- **C7 — Cubierta plana transitable.** Su forjado es REI con el valor del sector de debajo. Las cubiertas no transitables e inclinadas, solo R (SI 6), salvo las franjas REI 60 de SI 2-2 (3.21).
- **C8 — «Altura total de la fachada».** Desde el terreno exterior en su punto más bajo junto a la fachada hasta la coronación, peto incluido. Es la misma magnitud que «altura de coronación» de HS 1 (`partes.ts`). Aviso si un peto puede cruzar los 10, 18 o 28 m. No usar la altura de evacuación.
- **C9 — Puertas del vestíbulo de independencia.** máx(¼ del EI del elemento; 30) (3.22b).
- **C10 — Tabla d–h con valores intermedios.** Interpolar linealmente, o lo que es lo mismo, h = 5 − 2d para 0 ≤ d < 2,50, y h = 0 para d ≥ 2,50. Rotular «interpolación (criterio)». Alternativa más conservadora: tomar la columna de d inmediatamente **menor**.
- **C11 — α > 180° (esquina convexa).** El DB no da valor. Propuesta: no exigir distancia y rotularlo como criterio. Variante prudente: aplicar 0,50 m.
- **C12 — B_ROOF(t1) en lucernarios fuera de la zona de 5 m.** Exigirlo como mínimo dentro de esa zona y **recomendarlo**, sin exigirlo, en el resto, explicando la ambigüedad (8.5).
- **C13 — Bordes exactos del centro de transformación** (630, 1 000, 2 520, 4 000 kVA). Asignarlos a la clase **superior**, rotulado.
- **C14 — «Uso al que sirve» el local de riesgo especial** (nota 2 de la tabla 2.2). En plurifamiliar, el del sector que lo contiene, o el de las viviendas si son trasteros. Si sirve a varios, el más exigente. En unifamiliar, tabla 2.2 sola (4.14).
- **C15 — Superficie de una zona de trasteros.** Suma de los trasteros sin pasillos (comentario), en construida (C1). El campo de El edificio debe decir qué incluye.
- **C16 — RITI/RITS.** Adoptar «local de riesgo especial bajo» según el comentario, rotulado como criterio del Ministerio.
- **C17 — Garaje de unifamiliar.** EI 90 / puerta EI2 45-C5 / R 90 (o R 30 bajo cubierta sin evacuación, nota 2). Separación con la vivienda: EI 60 desde la vivienda y EI 90 desde el garaje (comentario).
- **C18 — Trasteros y cuartos que no son local de riesgo especial.** Tabla 4.1, fila «Zonas ocupables».
- **C19 — Zona «vestibulo» de `UsoZona`.** No es un vestíbulo de independencia del Anejo SI A. Que la ficha no lo confunda: renombrar la etiqueta («vestíbulo / portal») o aclarar en ayuda.

---

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Compartimentación | DB-SI | consolidado 4-mar-2025 (RD 164/2025) | 2025-03-04 | SI 1, ap. 1, ptos 1–2 | Tabla 1.1 | codigotecnico.org · DBSI.pdf, pp. 10–12 |
| Resistencia de sectores | ídem | ídem | 2025-03-04 | SI 1, ap. 1, pto 3 | Tabla 1.2 | ídem, p. 13 |
| Ascensores y escaleras | ídem | ídem | 2025-03-04 | SI 1, ap. 1, pto 4 | — | ídem, p. 10 |
| Clasificación de locales de riesgo especial | ídem | ídem | 2025-03-04 | SI 1, ap. 2, pto 1 | Tabla 2.1 | ídem, pp. 14–16 |
| Condiciones de locales de riesgo especial | ídem | ídem | 2025-03-04 | SI 1, ap. 2, pto 1 | Tabla 2.2 | ídem, p. 16 |
| Espacios ocultos y pasos | ídem | ídem | 2025-03-04 | SI 1, ap. 3, ptos 1–2 | — | ídem, pp. 16–17 |
| Reacción al fuego | ídem | ídem | 2025-03-04 | SI 1, ap. 4, pto 1 | Tabla 4.1 | ídem, p. 17 |
| Medianerías y fachadas | ídem | ídem | 2025-03-04 | SI 2, ap. 1, ptos 1–6 | (tabla α–d sin número) | ídem, pp. 19–20 |
| Cubiertas | ídem | ídem | 2025-03-04 | SI 2, ap. 2, ptos 1–3 | (tabla d–h sin número) | ídem, pp. 20–21 |
| Terminología | ídem | ídem | 2025-03-04 | Anejo SI A | — | ídem, pp. 42–52 |

---

## Pendientes

1. **BOE de RD 732/2019 y RD 164/2025**: qué cambiaron en SI 1, SI 2 y el Anejo SI A. En particular, si la desaparición de «Uso Pública Concurrencia» es deliberada (2.26) y desde cuándo rige la reacción al fuego de fachadas por alturas (7.12).
2. **CTE Parte I, Anejo III**: «uso previsto» y cualquier definición de superficie construida o de uso principal.
3. **RITE**: qué recinto es «sala de máquinas» (umbral de potencia) para aplicar la fila «salas de máquinas … según RITE» (bajo en todo caso). Relación con la fila de calderas de 70 kW.
4. **REBT, ITC-BT-16**: cuándo los contadores van en local o en armario, para sustituir la cita «ITC MIE-BT-016 / 16 contadores» del comentario. También la ITC que obligue a poner el cuadro general en un local propio.
5. **RD 346/2011 (ICT)**: condiciones propias de los RITI/RITS, para acompañar el criterio C16.
6. **Anejo SI F** ([SI25] p. 85): resistencia al fuego de las fábricas, útil para proponer soluciones EI 60/90/120. No leído (fuera de las preguntas).
7. **Figura 1.7 de SI 2**: rótulos ilegibles en el PDF.
8. **A coordinar con los otros agentes:**
   - SI 3: tabla 5.1 (escalera garaje–portal; cuándo es protegida la escalera de viviendas); SI 3-1 (salidas propias del local comercial); densidades y altura de evacuación (`verificacion-edificio-usos.md`).
   - SI 6: tablas 3.1 y 3.2 (R del forjado sobre el garaje y de los locales de riesgo especial).
9. **Decisiones de criterio que debe validar el responsable del proyecto**: C1 a C19, en especial:
   - C1: régimen más exigente cuando falta la superficie construida;
   - C2: cuarto de instalaciones sin tipo = riesgo bajo provisional;
   - C3: local sin uso = Comercial;
   - C14: nota 2 de la tabla 2.2 en plurifamiliar y en unifamiliar.

---

## Datos propuestos para el código

**Solo propuesta, no aplicada.** Sigue el patrón `tablaCTE(procedencia, datos)` de `src/lib/cte/tabla.ts`:
- `null` = casilla «(no se admite)» o casilla vacía;
- `"en_todo_caso"` = cualquier tamaño;
- intervalos con los signos exactos del DB (`gt` = «>», `ge` = «≥», `lt` = «<», `le` = «≤»).

Las INTERPRETACIONES y los CRITERIOS van fuera de `tablaCTE`, para que la ficha no los cite como CTE. Página de [SI25] en cada bloque.

```ts
import { tablaCTE } from "../../lib/cte/tabla";

/** DB-SI vigente: consolidado 4-mar-2025 (incluye RD 164/2025). Igual que PROC_SI de
 *  src/lib/edificio/tablas.ts, para que las citas coincidan. */
const PROC_SI = {
  db: "DB-SI",
  edicion: "consolidado 4-mar-2025 (RD 164/2025)",
  fecha: "2025-03-04",
  fuente: "codigotecnico.org · DBSI.pdf (tablas cotejadas casilla a casilla en imagen)",
} as const;

/** Intervalo de tamaño con los signos del DB. Sin campos = sin límite por ese lado. */
export interface Intervalo {
  gt?: number; // «>»  (borde excluido)
  ge?: number; // «≥»
  lt?: number; // «<»
  le?: number; // «≤»  (borde incluido)
}
export type CasillaT21 = Intervalo | "en_todo_caso" | null;

// ---- SI 1, ap. 1 · Tabla 1.1 ([SI25] pp. 10–12) ------------------------------------

export const COMPARTIMENTACION_T1_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 1, ap. 1, ptos 1 y 2", tabla: "Tabla 1.1" },
  {
    /** ap. 1 pto 1: las superficies máximas «pueden duplicarse» con instalación automática de extinción. */
    factorConExtincionAutomatica: 2,
    /** ap. 1 pto 2: no computan en la superficie del sector, si están contenidos en él. */
    noComputanEnSector: [
      "locales de riesgo especial",
      "escaleras y pasillos protegidos",
      "vestíbulos de independencia",
      "escaleras compartimentadas como sector de incendios",
    ],
    enGeneral: {
      /** Guion 1: todo establecimiento es sector, EXCEPTO —en edificio de uso principal Residencial
       *  Vivienda— los Docente, Administrativo o Residencial Público de S construida ≤ 500 m²
       *  («no exceda de 500 m2»). Un Comercial es sector siempre. */
      establecimientoExento: {
        usoPrincipalEdificio: "Residencial Vivienda",
        usos: ["Docente", "Administrativo", "Residencial Público"],
        superficieConstruidaMax_m2: 500,
      },
      /** Guion 2: zona de uso diferente y SUBSIDIARIO → sector diferente cuando supere: */
      zonaSubsidiaria: {
        residencialVivienda: "en_todo_caso",
        /** «Zona de alojamiento (1) o de uso Administrativo, Comercial, Docente cuya superficie
         *  construida exceda de 500 m2» (250 m² si el uso principal es Almacén: fuera de alcance). */
        alojamientoAdministrativoComercialDocente_SconstruidaGt_m2: 500,
        /** «…cuya ocupación exceda de 500 personas» (fuera de alcance). */
        publicaConcurrencia_ocupacionGt_personas: 500,
        /** «Zona de uso Aparcamiento cuya superficie construida exceda de 100 m2.(2) Cualquier
         *  comunicación con zonas de otro uso se debe hacer a través de vestíbulos de independencia.» */
        aparcamiento_SconstruidaGt_m2: 100,
        aparcamientoComunicacion: "vestibulo_de_independencia",
      },
      /** Guion 3: espacio diáfano de sector único. */
      espacioDiafano: { fraccionEnUnaPlantaMin: 0.9, fraccionPerimetroFachadaMin: 0.75 },
      /** Guion 4. */
      sectorRiesgoMinimoSinLimite: true,
    },
    residencialVivienda: {
      sectorSconstruidaMax_m2: 2500,
      /** «Los elementos que separan viviendas entre sí deben ser al menos EI 60.» */
      separacionEntreViviendas_EI: 60,
    },
    administrativo: { sectorSconstruidaMax_m2: 2500 },
    /** «i) 2.500 m2, en general». Los casos de 10.000 m² y de sector único exigen que el comercio
     *  ocupe TODO el edificio: fuera de alcance. */
    comercial: { sectorSconstruidaMax_m2: 2500 },
    aparcamiento: {
      sectorDiferenciadoSiIntegradoEnEdificioConOtrosUsos: true,
      comunicacion: "vestibulo_de_independencia",
    },
    notas: {
      n2: "Cualquier superficie, cuando se trate de aparcamientos robotizados. Los aparcamientos convencionales que no excedan de 100 m2 se consideran locales de riesgo especial bajo.",
      n4: "Los elementos que separan entre sí diferentes establecimientos deben ser EI 60 (centros comerciales; no a zonas comunes del centro).",
    },
  } as const,
);

// ---- SI 1, ap. 1 · Tabla 1.2 ([SI25] p. 13) -----------------------------------------

/** Columnas: [0] plantas bajo rasante · [1] h ≤ 15 m · [2] 15 < h ≤ 28 m · [3] h > 28 m.
 *  h = altura de evacuación DEL EDIFICIO. null = «(no se admite)». Minutos de EI; en techos que
 *  separan de una planta superior, el mismo valor como REI (nota 3). */
export type PorColumnaT12<T> = readonly [T, T, T, T];

export const RESISTENCIA_SECTORES_T1_2 = tablaCTE(
  { ...PROC_SI, articulo: "SI 1, ap. 1, pto 3", tabla: "Tabla 1.2" },
  {
    paredesYTechos_EI: {
      sectorRiesgoMinimo: [null, 120, 120, 120] as PorColumnaT12<number | null>,
      residencialVivienda_residencialPublico_docente_administrativo: [120, 60, 90, 120] as PorColumnaT12<number>,
      /** nota (5) en la casilla bajo rasante: EI 180 si la altura de evacuación del edificio > 28 m. */
      comercial_publicaConcurrencia_hospitalario: [120, 90, 120, 180] as PorColumnaT12<number>,
      /** nota (6): son las PAREDES que separan el aparcamiento de zonas de otro uso; el forjado,
       *  por la nota (3). nota (7) en la casilla bajo rasante: EI 180 si es robotizado. */
      aparcamiento: [120, 120, 120, 120] as PorColumnaT12<number>,
    },
    excepciones: {
      /** nota (5) */
      comercialBajoRasanteSiHGt28_EI: 180,
      /** nota (7) */
      aparcamientoRobotizadoBajoRasante_EI: 180,
    },
    /** «EI2 t-C5 siendo t la mitad del tiempo de resistencia al fuego requerido a la pared en la que se
     *  encuentre, o bien la cuarta parte cuando el paso se realice a través de un vestíbulo de
     *  independencia y de dos puertas.» */
    puertasEntreSectores: { clase: "EI2 t-C5", fraccionDirecta: 0.5, fraccionConVestibuloYDosPuertas: 0.25 },
    notas: {
      n1: "Considerando la acción del fuego en el interior del sector, excepto en el caso de los sectores de riesgo mínimo, en los que únicamente es preciso considerarla desde el exterior del mismo. Un elemento delimitador puede precisar una resistencia diferente por la cara opuesta según su función por dicha cara.",
      n2: "Como alternativa puede adoptarse el tiempo equivalente de exposición al fuego (Anejo SI B, ap. 2).",
      n3: "Techo que separa de una planta superior: la misma resistencia que las paredes, como REI. Cubierta no destinada a actividad ni a evacuación: solo R estructural, salvo en las franjas de SI 2-2, que son REI.",
      n4: "La resistencia al fuego del suelo es función del uso de la zona de la planta inferior (SI 6, ap. 3).",
      n5: "EI 180 si la altura de evacuación del edificio es mayor que 28 m.",
      n6: "Resistencia exigible a las paredes que separan al aparcamiento de zonas de otro uso. Forjado de separación: nota (3).",
      n7: "EI 180 si es un aparcamiento robotizado.",
    },
  } as const,
);

/** SI 1, ap. 1 pto 4 ([SI25] p. 10). */
export const ASCENSORES_ENTRE_SECTORES = tablaCTE(
  { ...PROC_SI, articulo: "SI 1, ap. 1, pto 4" },
  {
    /** En cada acceso: puertas E 30 (UNE-EN 81-58:2004) o vestíbulo de independencia con puerta EI2 30-C5. */
    puertaAscensor_E: 30,
    puertaVestibulo_EI2C5: 30,
    /** «…excepto en zonas de riesgo especial o de uso Aparcamiento, en las que se debe disponer siempre el citado vestíbulo.» */
    vestibuloObligatorioEn: ["zona de riesgo especial", "uso Aparcamiento"],
    /** Si el sector más bajo es de riesgo mínimo, o si en él se ponen la puerta EI2 30-C5 del vestíbulo
     *  y la E 30 del ascensor, en el sector más alto no se precisa ninguna de esas medidas. */
    exencionSectorSuperior: true,
  } as const,
);

// ---- SI 1, ap. 2 · Tabla 2.1 ([SI25] pp. 14–16) -------------------------------------

export interface FilaT21 {
  /** Texto del DB (abreviado). */
  local: string;
  /** Magnitud de la cabecera: S y V son CONSTRUIDOS. */
  magnitud: "S_m2_construida" | "V_m3_construido" | "P_kW" | "P_kVA_total" | "P_kVA_transformador" | null;
  bajo: CasillaT21;
  medio: CasillaT21;
  alto: CasillaT21;
  nota?: string;
}

export const CLASIFICACION_LRE_T2_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 1, ap. 2, pto 1", tabla: "Tabla 2.1" },
  {
    enCualquierEdificio: {
      talleresAlmacenesCombustiblesArchivos: {
        local: "Talleres de mantenimiento, almacenes de elementos combustibles (p. e.: mobiliario, lencería, limpieza, etc.) archivos de documentos, depósitos de libros, etc.",
        magnitud: "V_m3_construido", bajo: { gt: 100, le: 200 }, medio: { gt: 200, le: 400 }, alto: { gt: 400 },
        nota: "(1) >500 m3 y QT ≥ 3·10^6 MJ → uso Almacén.",
      },
      almacenResiduos: {
        local: "Almacén de residuos",
        magnitud: "S_m2_construida", bajo: { gt: 5, le: 15 }, medio: { gt: 15, le: 30 }, alto: { gt: 30 },
      },
      aparcamientoHasta100oUnifamiliar: {
        local: "Aparcamiento de vehículos cuya superficie S no exceda de 100 m2 o integrado en una vivienda unifamiliar",
        magnitud: null, bajo: "en_todo_caso", medio: null, alto: null,
      },
      cocinas: {
        local: "Cocinas según potencia instalada P",
        magnitud: "P_kW", bajo: { gt: 20, le: 30 }, medio: { gt: 30, le: 50 }, alto: { gt: 50 },
        nota: "(2) solo aparatos de preparación de alimentos susceptibles de ignición; freidoras y sartenes basculantes 1 kW/l; con extinción automática no son LRE salvo en Hospitalario y Residencial Público. (3) condiciones de la extracción de humos.",
      },
      lavanderiasVestuariosCamerinos: {
        local: "Lavanderías. Vestuarios de personal. Camerinos",
        magnitud: "S_m2_construida", bajo: { gt: 20, le: 100 }, medio: { gt: 100, le: 200 }, alto: { gt: 200 },
        nota: "(4) Las zonas de aseos no computan a efectos del cálculo de la superficie construida.",
      },
      salaCalderas: {
        local: "Salas de calderas con potencia útil nominal P",
        magnitud: "P_kW", bajo: { gt: 70, le: 200 }, medio: { gt: 200, le: 600 }, alto: { gt: 600 },
      },
      salaMaquinasClimatizacionRITE: {
        local: "Salas de máquinas de instalaciones de climatización (según RITE, RD 1027/2007)",
        magnitud: null, bajo: "en_todo_caso", medio: null, alto: null,
      },
      maquinariaFrigorificaAmoniaco: {
        local: "Salas de maquinaria frigorífica: refrigerante amoniaco",
        magnitud: null, bajo: null, medio: "en_todo_caso", alto: null,
      },
      maquinariaFrigorificaHalogenado: {
        local: "Salas de maquinaria frigorífica: refrigerante halogenado",
        magnitud: "P_kW", bajo: { le: 400 }, medio: { gt: 400 }, alto: null,
      },
      almacenCombustibleSolido: {
        local: "Almacén de combustible sólido para calefacción",
        magnitud: "S_m2_construida", bajo: { le: 3 }, medio: { gt: 3 }, alto: null,
      },
      contadoresElectricidadCuadrosGenerales: {
        local: "Local de contadores de electricidad y de cuadros generales de distribución",
        magnitud: null, bajo: "en_todo_caso", medio: null, alto: null,
      },
      centroTransformacionSecoOLiquidoGt300: {
        local: "Centro de transformación: aislamiento dieléctrico seco o líquido con punto de inflamación mayor que 300 ºC",
        magnitud: null, bajo: "en_todo_caso", medio: null, alto: null,
      },
      /** Signos ESTRICTOS en ambos lados: P = 2520 o 4000 kVA no está en ninguna columna (criterio C13). */
      centroTransformacionLe300Total: {
        local: "Centro de transformación: punto de inflamación ≤ 300 ºC, potencia instalada total",
        magnitud: "P_kVA_total", bajo: { lt: 2520 }, medio: { gt: 2520, lt: 4000 }, alto: { gt: 4000 },
      },
      /** Ídem con 630 y 1000 kVA. */
      centroTransformacionLe300PorTransformador: {
        local: "Centro de transformación: punto de inflamación ≤ 300 ºC, en cada transformador",
        magnitud: "P_kVA_transformador", bajo: { lt: 630 }, medio: { gt: 630, lt: 1000 }, alto: { gt: 1000 },
      },
      salaMaquinariaAscensores: {
        local: "Sala de maquinaria de ascensores",
        magnitud: null, bajo: "en_todo_caso", medio: null, alto: null,
      },
      grupoElectrogeno: {
        local: "Sala de grupo electrógeno",
        magnitud: null, bajo: "en_todo_caso", medio: null, alto: null,
      },
    },
    residencialVivienda: {
      trasteros: {
        local: "Trasteros",
        magnitud: "S_m2_construida", bajo: { gt: 50, le: 100 }, medio: { gt: 100, le: 500 }, alto: { gt: 500 },
        nota: "(5) Se consideran aquellos trasteros que tienen vinculación con las viviendas de los edificios en los que están integrados. Incluye los que comunican con zonas de uso garaje de edificios de vivienda.",
      },
    },
    administrativo: {
      imprentaReprografia: {
        local: "Imprenta, reprografía y locales anejos (almacenes de papel o de publicaciones, encuadernado, etc.)",
        magnitud: "V_m3_construido", bajo: { gt: 100, le: 200 }, medio: { gt: 200, le: 500 }, alto: { gt: 500 },
        nota: "(1)",
      },
    },
    // Comercial (almacenes por QS), Hospitalario, Residencial Público y Pública concurrencia:
    // transcritos en el bloque A4 del .md; fuera del alcance de la herramienta.
  } as const,
);

// ---- SI 1, ap. 2 · Tabla 2.2 ([SI25] p. 16) -----------------------------------------

export const CONDICIONES_LRE_T2_2 = tablaCTE(
  { ...PROC_SI, articulo: "SI 1, ap. 2, pto 1", tabla: "Tabla 2.2" },
  {
    bajo: {
      estructura_R: 90, paredesTechos_EI: 90, vestibulo: false,
      puertas: { numero: 1, EI2_C5: 45 }, recorridoMax_m: 25,
    },
    medio: {
      estructura_R: 120, paredesTechos_EI: 120, vestibulo: true,
      puertas: { numero: 2, EI2_C5: 30 }, recorridoMax_m: 25,
    },
    alto: {
      estructura_R: 180, paredesTechos_EI: 180, vestibulo: true,
      puertas: { numero: 2, EI2_C5: 45 }, recorridoMax_m: 25,
    },
    /** nota (6): el recorrido «podrá aumentarse un 25%» con instalación automática de extinción en la zona. */
    incrementoRecorridoConExtincion: 0.25,
    /** nota (2), excepción: bajo cubierta no prevista para evacuación y cuyo fallo no comprometa
     *  otras plantas ni la compartimentación, puede ser R 30. */
    estructuraBajoCubiertaSinRiesgo_R: 30,
    notas: {
      n1: "La reacción al fuego, en la tabla 4.1.",
      n2: "El tiempo no debe ser menor que el de los sectores del uso al que sirve el local (tabla 1.2), salvo bajo cubierta no prevista para evacuación… (R 30). Salvo en locales de instalaciones, alternativa del tiempo equivalente (Anejo SI B, ap. 2). Afecta a las filas de estructura y de paredes/techos, NO a la de puertas.",
      n3: "Techo que separa de una planta superior: REI. Cubierta sin actividad: solo R, salvo franjas de SI 2-2 (REI).",
      n4: "Considerando la acción del fuego en el interior del recinto. Suelo: según el uso de la planta inferior (SI 6, ap. 3).",
      n5: "El recorrido interior cuenta para el recorrido hasta las salidas de planta. No aplica al recorrido total desde un garaje de una vivienda unifamiliar hasta una salida de dicha vivienda, que no está limitado.",
      n6: "Podrá aumentarse un 25% cuando la zona esté protegida con una instalación automática de extinción.",
    },
  } as const,
);

// ---- SI 1, ap. 3 ([SI25] pp. 16–17) -------------------------------------------------

export const PASO_INSTALACIONES = tablaCTE(
  { ...PROC_SI, articulo: "SI 1, ap. 3, ptos 1 y 2" },
  {
    /** pto 1: los registros para mantenimiento pueden tener la mitad de la resistencia. */
    fraccionRegistros: 0.5,
    /** pto 2: «excluidas las penetraciones cuya sección de paso no exceda de 50 cm²» (≤ 50 → excluida). */
    seccionExcluidaMax_cm2: 50,
    soluciones: ["obturación automática EI t (i↔o) o dispositivo intumescente", "elemento pasante EI t (i↔o)"],
  } as const,
);

// ---- SI 1, ap. 4 · Tabla 4.1 ([SI25] p. 17) -----------------------------------------

export const REACCION_FUEGO_T4_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 1, ap. 4, pto 1", tabla: "Tabla 4.1" },
  {
    zonasOcupables: { techosParedes: "C-s2,d0", suelos: "EFL" },
    pasillosEscalerasProtegidos: { techosParedes: "B-s1,d0", suelos: "CFL-s1" },
    aparcamientosYRecintosRiesgoEspecial: { techosParedes: "B-s1,d0", suelos: "BFL-s1" },
    espaciosOcultosNoEstancos: { techosParedes: "B-s3,d0", suelos: "BFL-s2" },
    /** nota (1): «Siempre que superen el 5% de las superficies totales…» (≤ 5 % → exento). */
    umbralFraccionSuperficie: 0.05,
    notas: {
      n2: "Incluye tuberías y conductos sin recubrimiento resistente al fuego; con aislamiento térmico lineal, la misma clase con subíndice L.",
      n3: "Incluye capas interiores no protegidas por una capa EI 30 como mínimo.",
      n4: "Zonas ocupables: de permanencia y de circulación no protegidas. Excluye el interior de viviendas. En uso Hospitalario, como pasillos y escaleras protegidos.",
      n5: "Véase el capítulo 2 de esta Sección.",
      n6: "Parte inferior de la cavidad; no aplica a espacios de clara configuración vertical (patinillos) ni a falsos techos de celosía o entramado abierto.",
      espaciosOcultos: "Excepto los existentes dentro de las viviendas; también los estancos que contengan instalaciones susceptibles de iniciar o propagar un incendio.",
    },
  } as const,
);

// ---- SI 2, ap. 1 ([SI25] pp. 19–20) -------------------------------------------------

export const MEDIANERIAS_FACHADAS_SI2 = tablaCTE(
  { ...PROC_SI, articulo: "SI 2, ap. 1, ptos 1 a 6" },
  {
    /** pto 1: «Los elementos verticales separadores de otro edificio deben ser al menos EI 120.» */
    medianeria_EI: 120,
    /** pto 2: entre dos sectores, entre riesgo especial ALTO y otras zonas, o hacia escalera/pasillo
     *  protegido. Puntos de fachada que no sean al menos EI 60. α = ángulo entre los planos
     *  exteriores (0° = fachadas enfrentadas paralelas). Interpolación lineal permitida. */
    separacionHorizontal: {
      EI_puntosExentos: 60,
      alfa_grados: [0, 45, 60, 90, 135, 180] as const,
      d_m: [3.0, 2.75, 2.5, 2.0, 1.25, 0.5] as const,
      interpolacionLineal: true,
      /** Edificios diferentes y colindantes: el 50 % de d hasta la bisectriz. */
      fraccionHastaBisectrizEdificiosColindantes: 0.5,
    },
    /** pto 3: entre dos sectores, entre riesgo especial ALTO y zonas MÁS ALTAS, o hacia escalera/pasillo
     *  protegido. Franja de 1 m como mínimo; se reduce en la dimensión del saliente apto. */
    franjaVertical: { EI: 60, alturaMin_m: 1.0, reducibleConSaliente: true },
    /** pto 4: sistemas constructivos de fachada que ocupen > 10 % de su superficie, por altura TOTAL de
     *  la fachada. «hasta 10 m» = ≤ 10; «hasta 18 m» = ≤ 18; «superior a 18 m» = > 18. */
    reaccionSistemasFachada: {
      umbralFraccionSuperficie: 0.1,
      clases: [
        { alturaFachadaHasta_m: 10, clase: "D-s3,d0" },
        { alturaFachadaHasta_m: 18, clase: "C-s3,d0" },
        { alturaFachadaHasta_m: Infinity, clase: "B-s3,d0" },
      ],
      /** Incluye capas interiores no protegidas por una capa EI 30 como mínimo. */
      capaProtectora_EI: 30,
    },
    /** pto 5: sistemas de aislamiento dentro de cámaras ventiladas. */
    reaccionAislamientoCamaras: {
      clases: [
        { alturaFachadaHasta_m: 10, clase: "D-s3,d0" },
        { alturaFachadaHasta_m: 28, clase: "B-s3,d0" },
        { alturaFachadaHasta_m: Infinity, clase: "A2-s3,d0" },
      ],
      /** Limitar el desarrollo vertical de la cámara en los forjados entre sectores: barreras E 30 válidas. */
      barreraCamara_E: 30,
    },
    /** pto 6: fachada de altura ≤ 18 m con arranque accesible al público desde la rasante o desde una
     *  cubierta: B-s3,d0 hasta 3,5 m como mínimo (sistemas del pto 4 y aislantes de cámara). */
    arranqueAccesible: { alturaFachadaMax_m: 18, clase: "B-s3,d0", hastaAltura_m: 3.5 },
  } as const,
);

// ---- SI 2, ap. 2 ([SI25] pp. 20–21) -------------------------------------------------

export const CUBIERTAS_SI2 = tablaCTE(
  { ...PROC_SI, articulo: "SI 2, ap. 2, ptos 1 a 3" },
  {
    /** pto 1: franjas REI 60: 0,50 m desde el edificio colindante; 1,00 m sobre el encuentro con todo
     *  elemento compartimentador de un SECTOR o de un local de riesgo especial ALTO. Alternativa:
     *  prolongar la medianería o el compartimentador 0,60 m sobre el acabado de la cubierta. */
    franjas: { REI: 60, colindante_m: 0.5, sectorORiesgoAlto_m: 1.0, prolongacionAlternativa_m: 0.6 },
    /** pto 2: encuentro cubierta–fachada de sectores o edificios distintos. d = distancia horizontal de la
     *  fachada a la zona de cubierta no EI 60; h = altura mínima sobre la cubierta de la zona de
     *  fachada no EI 60. Primera columna «≥2,50». El DB NO dice cómo tratar valores intermedios. */
    encuentroCubiertaFachada: {
      EI_exento: 60,
      d_m: [2.5, 2.0, 1.75, 1.5, 1.25, 1.0, 0.75, 0.5, 0] as const,
      h_m: [0, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0] as const,
      primeraColumnaEsMayorOIgual: true,
    },
    /** pto 3: BROOF(t1) para los materiales que ocupen > 10 % del revestimiento o acabado exterior de las
     *  zonas de cubierta a < 5 m de la proyección vertical de fachada no EI 60 (del mismo o de otro
     *  edificio), incluida la cara superior de voladizos de > 1 m, «así como los lucernarios,
     *  claraboyas y cualquier otro elemento de iluminación o ventilación» (alcance ambiguo: C12). */
    reaccionCubierta: {
      clase: "BROOF(t1)", umbralFraccionSuperficie: 0.1, distanciaFachada_m: 5,
      voladizoMayorQue_m: 1, EI_fachadaExenta: 60,
    },
  } as const,
);

// ---- Anejo SI A ([SI25] pp. 42–52) — cifras de las definiciones ---------------------

export const TERMINOLOGIA_SI_A = tablaCTE(
  { ...PROC_SI, articulo: "Anejo SI A" },
  {
    /** Origen de evacuación: no lo son el interior de las viviendas ni los recintos con ≤ 1 pers/5 m² y
     *  ≤ 50 m²; sí lo son los LRE y las zonas de ocupación nula de > 50 m². */
    origenEvacuacion: { densidadMax_m2PorPersona: 5, superficieMax_m2: 50, ocupacionNulaOrigenSiGt_m2: 50 },
    sectorBajoRasante: { alturaAscendenteMin_m: 1.5 },
    sectorRiesgoMinimo: { cargaFuegoSectorMax_MJ_m2: 40, cargaFuegoRecintoMax_MJ_m2: 50, separacion_EI: 120, vestibulo: true },
    vestibuloIndependencia: {
      paredes_EI: 120,
      /** Puertas: ¼ del EI del elemento compartimentador y al menos EI2 30-C5. */
      puertaFraccion: 0.25, puertaMin_EI2_C5: 30,
      separacionBarridosMin_m: 0.5, circuloItinerarioAccesible_m: 1.2, circuloConZonaRefugio_m: 1.5,
      mecanismoARinconMin_m: 0.3,
    },
    escaleraProtegida: {
      recinto_EI: 120, puertas_EI2_C5: 60, accesosMaxPorPlanta: 2, registros_EI: 60,
      recorridoPlantaSalidaMax_m: 15,
      ventilacionNaturalMin_m2PorPlanta: 1,
      conductos: { seccion_cm2PorM3: 50, relacionLadosMax: 4, entradaParteSuperiorBajoDe_m: 1, salidaParteInferiorSobre_m: 1.8 },
    },
    escaleraAbiertaExterior: { huecos_m2PorMetroDeAnchura: 5, circuloPatio: "h/3" },
    pasilloProtegido: { ventilacion_m2PorMetroDeLongitud: 0.2, entradaBajoDe_m: 1, salidaSobre_m: 1.8, separacionRejillasMax_m: 10 },
    aparcamientoAbierto: { aberturaTotalMin: 1 / 20, aberturaRepartidaMin: 1 / 40, bordeSuperiorATechoMax_m: 0.5 },
    usoAparcamiento: { superficieConstruidaGt_m2: 100, excluyeGarajeViviendaUnifamiliar: true },
    espacioExteriorSeguro: { superficie_m2PorPersona: 0.5, radio_mPorPersona: 0.1, sinComprobarHasta_personas: 50, distanciaSiNoComunicado_m: 15 },
    salidaEdificio: { maxPersonasVariante: 500, recorridoAlternativoMax_m: 50 },
    recorridosAlternativos: { anguloMin_grados: 45, separacion_EI: 30 },
    alturaAscendenteMaxGeneral: { hastaSalidaPlanta_m: 4, hastaEspacioExteriorSeguro_m: 6 },
    superficieUtilComercialSinImplantacion: { fraccionMinDeLaConstruida: 0.75 }, // solo para ocupación
  } as const,
);

// ---- INTERPRETACIONES (no son tabla del CTE; la ficha las rotula) -------------------

/** Columna de la tabla 1.2. INTERPRETACIÓN: «plantas bajo rasante» = nivel < 0 (C5). */
export function columnaT12(nivel: number, alturaEvacuacionEdificio_m: number): 0 | 1 | 2 | 3 {
  if (nivel < 0) return 0;
  if (alturaEvacuacionEdificio_m <= 15) return 1;
  if (alturaEvacuacionEdificio_m <= 28) return 2;
  return 3;
}

/** Puerta de paso entre sectores [min]. Directa: ½ del EI de la pared (tabla 1.2). Por vestíbulo
 *  y dos puertas: ¼ y al menos 30 (tabla 1.2 + Anejo SI A). INTERPRETACIÓN de la combinación. */
export function puertaEntreSectores_EI2(eiPared: number, conVestibulo: boolean): number {
  return conVestibulo ? Math.max(30, eiPared / 4) : eiPared / 2;
}

/** EI de paredes y techos de un LRE. Plurifamiliar: máx(tabla 2.2; tabla 1.2 del uso al que sirve)
 *  (nota 2). Unifamiliar: tabla 2.2 sola (INTERPRETACIÓN 4.14). Las puertas NO llevan la nota (2). */
export function eiLocalRiesgo(eiT22: number, eiT12UsoServido: number | null, unifamiliar: boolean): number {
  return unifamiliar || eiT12UsoServido === null ? eiT22 : Math.max(eiT22, eiT12UsoServido);
}

// ---- CRITERIOS (no CTE) --------------------------------------------------------------

export const CRITERIOS_SI1_SI2 = {
  /** C1: sin superficie construida, régimen más exigente y aviso; nunca un factor «del DB». */
  superficieConstruidaDesconocida: "regimen_mas_exigente_con_aviso",
  /** C2: cuarto de instalaciones sin subtipo → LRE bajo provisional, veredicto no definitivo. */
  instalacionesSinTipo: "riesgo_bajo_provisional",
  /** C3: local sin uso → sectorizado como Comercial (peor caso en alcance), rotulado «supuesto». */
  localSinUso: "comercial_supuesto",
  /** C10: tabla d–h con valores intermedios → interpolación lineal (h = 5 − 2d para 0 ≤ d < 2,5). */
  interpolarTablaCubiertaFachada: true,
  /** C11: α > 180° → sin distancia exigida (rotulado). */
  alfaMayor180: "sin_exigencia",
  /** C13: P exacta en el borde de un CT → clase superior. */
  bordeCentroTransformacion: "clase_superior",
} as const;
```
