# Verificación normativa — DB-SUA, SUA 6, SUA 7, SUA 8 y Anejo B, para los checkers de feature-20

**Fecha:** 2026-10-04 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** preguntas C1 a C5 del encargo (SUA 6 ahogamiento, SUA 7 vehículos en movimiento, SUA 8 rayo), las definiciones del Anejo A que usan, el Anejo B (que el ap. 2 de SUA 8 remite) y la revisión de los «no aplica» de `src/lib/proyecto/aplicabilidad.ts`. SUA 1, SUA 9 y el resto del Anejo A son de otros agentes: cuando una respuesta depende de ellos se cita y se marca.

**Regla aplicada:** ninguna cifra se da por buena sin leerla en la **imagen** de la página. Veredictos:
- **VERIFICADO**: literal en el DB, leído en la imagen de [SUA22] y coincidente con el texto de [SUA22] y de [DccSUA].
- **LEÍDO (1 fuente)**: literal en una sola fuente (p. ej. un comentario del Ministerio, o el texto extraído sin imagen, o un extractor web).
- **CORREGIDO**: lo que afirma el encargo (o el repo) no coincide con el DB.
- **NO VERIFICABLE**: el DB no lo dice, o no se ha podido leer con seguridad.
- **INTERPRETACIÓN**: se sigue del DB pero no lo escribe tal cual. Se puede mostrar, rotulada.
- **CRITERIO**: decisión de proyecto propuesta. No es exigencia del CTE; la ficha la rotula así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [SUA22] | CTE DB-SUA «Seguridad de utilización y accesibilidad», texto consolidado | «14 junio 2022» (incluye RD 450/2022) | `research/pdf/DBSUA.pdf` (codigotecnico.org) | **Imagen a 200 ppp**: pp. 25, 26 (SUA 6), 27 (SUA 7), 28 (SUA 8 y Figura 1.1), 29 (tablas 1.1 a 1.5), 30 (tabla 2.1), 39 (Anejo A, «Uso Aparcamiento», «Uso privado»), 43, 44, 45 (Anejo B, tablas B.1 a B.5). **Imagen a 130 ppp**: pp. 35, 36, 40 (Anejo A), 42, 46 (Anejo B). Texto extraído (`DBSUA.txt`) para cruzar y para las remisiones a SUA 1 y SUA 9 |
| [DccSUA] | DB-SUA con comentarios del Ministerio | Articulado 14-jun-2022; **comentarios 15-jul-2024** | `research/pdf/DccSUA.pdf` | Texto (`DccSUA.txt`) pp. 43–51 y 74–78; **imagen a 130 ppp** de pp. 46, 48, 49, 50, 51. Los comentarios van sangrados con una raya vertical a la izquierda |
| [RD742] | RD 742/2013, criterios técnico-sanitarios de las piscinas (BOE-A-2013-10580) | Consolidado BOE | boe.es, vía extractor (resume) | Solo arts. 2 y 3, para contrastar «uso colectivo» |
| [REPO] | `src/lib/proyecto/aplicabilidad.ts`, `src/lib/proyecto/tipos.ts`, `src/lib/cte/tabla.ts`, `src/lib/edificio/tipos.ts`, `src/lib/edificio/seccion.ts` | Estado actual | repo | Lo que ya existe |

Avisos de los propios documentos:
- [SUA22] p. 2: «Este texto consolidado no tiene valor jurídico.» Disposiciones que recoge: RD 314/2006; RD 1371/2007; corrección de errores (BOE 25-01-2008); Orden VIV/984/2009 y su corrección (BOE 23-09-2009); RD 173/2010; Sentencia TS 4-5-2010; RD 732/2019; RD 450/2022.
- [DccSUA] p. 2: los comentarios tienen carácter orientativo, no reglamentario. Aquí van rotulados «comentario, no reglamentario».

Límites de la lectura:
- **Figura 1.1 (mapa de Ng)**: a 200 ppp las etiquetas se leen, pero varias capitales caen sobre una isolínea o muy cerca, y algunas etiquetas están tapadas por las líneas. No hay herramienta para ampliar la imagen. Ver C3.12 a C3.15.
- **Paginación del encargo**: el Anejo A ocupa **pp. 35–41**, el **Anejo B pp. 42–46** y el Anejo C p. 47 (el encargo decía «Anejo A pp. 35–47»). En [DccSUA] el Anejo B está en pp. 74–78.
- Las remisiones a **SUA 1 ap. 3.1, 3.2 y 3.2.3** y a **SUA 9 ap. 1.2.5** se han leído solo en el texto extraído (son de otros agentes).

---

## Bloque A — Ámbitos y los «no aplica» de `aplicabilidad.ts`

| # | Afirmación (repo o encargo) | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A.1 | Ámbito de SUA 6 | VERIFICADO | Piscinas **de uso colectivo**, salvo las destinadas **exclusivamente** a competición o a enseñanza (tendrán las características propias de su actividad). **Excluidas**: piscinas de **viviendas unifamiliares**, baños termales, centros de tratamiento de hidroterapia y otros dedicados a usos exclusivamente médicos (cumplirán su reglamentación específica) | SUA 6 ap. 1 pto 1: «Esta Sección es aplicable a las piscinas de uso colectivo, salvo a las destinadas exclusivamente a competición o a enseñanza, las cuales tendrán las características propias de la actividad que se desarrolle. Quedan excluidas las piscinas de viviendas unifamiliares, así como los baños termales, los centros de tratamiento de hidroterapia y otros dedicados a usos exclusivamente médicos, los cuales cumplirán lo dispuesto en su reglamentación específica.» | [SUA22] p. 25 |
| A.2 | ¿La piscina de una comunidad de propietarios es «de uso colectivo»? | **INTERPRETACIÓN** respaldada por comentario | **Sí.** El DB no define «uso colectivo» (no está en el Anejo A), pero el Ministerio habla expresamente de «piscinas de uso colectivo en uso Residencial Vivienda» y, en 1.1, de barreras entre «cualquier zona común de uso habitual del edificio» y el vaso | [DccSUA] p. 43, comentario «Piscinas de uso colectivo en uso Residencial Vivienda y condiciones de resbaladicidad» (comentario, no reglamentario): «Aunque el ámbito de aplicación del SUA1-1 no incluye el uso Residencial Vivienda, las condiciones de resbaladicidad de esta sección sí son aplicables a piscinas de uso colectivo en uso Residencial Vivienda.» | [DccSUA] |
| A.3 | Terminología del RD 742/2013 | LEÍDO (1 fuente, vía extractor) | **No confundir**: el RD 742/2013 llama a la piscina de una comunidad de propietarios «piscina de **uso privado** tipo 3A» (y a la unifamiliar, tipo 3B). Es otra clasificación (sanitaria); para el CTE sigue siendo «de uso colectivo» (A.2). La memoria no debe decir «piscina de uso privado, no aplica SUA 6» | [RD742] art. 2: «Piscina de uso privado: aquellas piscinas destinadas únicamente a la familia e invitados del propietario, u ocupante … Tipo 3A: comunidades de propietarios, casas rurales, colegios mayores … Tipo 3B: piscinas unifamiliares» (extracto resumido) | [RD742] |
| A.4 | Piscina compartida por varias unifamiliares (agrupación) | **INTERPRETACIÓN** | **Aplica.** La exclusión es «piscinas de viviendas unifamiliares»; una piscina común a varias viviendas es de uso colectivo. La app hoy no modela agrupaciones: sin efecto inmediato | SUA 6 ap. 1 pto 1 | [SUA22] p. 25 |
| A.5 | Repo, nota «sin piscina»: «el ámbito de la Sección SUA 6 se limita a las piscinas de uso colectivo» | **CORREGIDO** (incompleto) | SUA 6 tiene **dos apartados**: 1 Piscinas y **2 Pozos y depósitos**. El ap. 2 no está limitado a piscinas: «Los pozos, depósitos, o conducciones abiertas que sean accesibles a personas y presenten riesgo de ahogamiento estarán equipados con sistemas de protección, tales como tapas o rejillas, con la suficiente rigidez y resistencia, así como con cierres que impidan su apertura por personal no autorizado.» Leer el «Esta Sección es aplicable a las piscinas…» como ámbito de **todo** SUA 6 dejaría el ap. 2 sin objeto (un pozo no es una piscina): se lee como ámbito del ap. 1. La nota debe declarar también que no hay pozos ni depósitos accesibles (ver «Para el código», R1) | SUA 6 ap. 2 pto 1 | [SUA22] p. 26 (imagen) |
| A.6 | Repo, nota «piscina de unifamiliar» | VERIFICADO, con el mismo matiz | La exclusión de la piscina unifamiliar es literal. Pero el ap. 2 (pozos, depósitos) no excluye la unifamiliar: un aljibe o un pozo accesible en la parcela de una unifamiliar sigue cubierto (INTERPRETACIÓN de A.5). Y fuera del CTE la piscina unifamiliar tiene RD 742/2013 (tipo 3B) y normativa autonómica ([DccSUA] p. 43, comentario «Disposiciones normativas de piscinas de las Comunidades Autónomas») | SUA 6 ap. 1 pto 1, 2.º párrafo | [SUA22] pp. 25–26 |
| A.7 | Ámbito de SUA 7 | VERIFICADO | «zonas de *uso Aparcamiento* (lo que excluye a los garajes de una vivienda unifamiliar) así como a las **vías de circulación de vehículos existentes en los edificios**» | SUA 7 ap. 1 pto 1 | [SUA22] p. 27 |
| A.8 | «Uso Aparcamiento» | VERIFICADO | Superficie **construida que exceda de 100 m²** (estricto: > 100). Excluye «los garajes, cualquiera que sea su superficie, de una vivienda unifamiliar» y saca del DB-SUA los **aparcamientos robotizados** | Anejo A, «Uso Aparcamiento»: «Edificio, establecimiento o zona independiente o accesoria de otro uso principal, destinado a estacionamiento de vehículos y cuya superficie construida exceda de 100 m², … Se excluyen de este uso los garajes, cualquiera que sea su superficie, de una vivienda unifamiliar, así como del ámbito de aplicación del DB-SUA, los aparcamientos robotizados.» | [SUA22] p. 39 (imagen) |
| A.9 | ¿SUA 7 deja fuera los garajes de menos de X m², o solo los de las unifamiliares? | **CORREGIDO / INTERPRETACIÓN** | El ámbito tiene **dos ramas**. (a) Zonas de uso Aparcamiento: un garaje de plurifamiliar de **≤ 100 m² construidos no lo es**, y por tanto no le alcanzan los puntos que hablan de «zonas / plantas / establecimientos de uso Aparcamiento» (2.1, 3, 4.3). (b) Pero sus **vías de circulación** (rampa, calle interior) siguen dentro por la segunda rama: le alcanzan 2.2 (peatones por rampa) y 4.1 (señalización), que no se limitan al uso Aparcamiento. No hay exclusión por tamaño de la Sección entera. El garaje de una unifamiliar queda fuera **cualquiera que sea su superficie** | SUA 7 ap. 1, 2, 3, 4; Anejo A | [SUA22] pp. 27, 39 |
| A.10 | ¿Y la rampa o el acceso rodado del garaje de una unifamiliar (rama b)? | **INTERPRETACIÓN** (dudosa) | Se propone **no aplicar**: el paréntesis excluye «los garajes de una vivienda unifamiliar», y su rampa forma parte de ese garaje. El literal «vías de circulación de vehículos existentes en los edificios» podría leerse de otro modo; no hay comentario del Ministerio que lo resuelva | SUA 7 ap. 1 | [SUA22] p. 27 |
| A.11 | ¿Cuentan las vías y aparcamientos exteriores de la parcela? | LEÍDO (1 fuente, comentario no reglamentario) | **Sí**, si están adscritos al edificio (LOE art. 2.3) | [DccSUA] p. 46, comentario al ap. 1: «Cuando en el ámbito de aplicación de esta sección se mencionan zonas de aparcamiento y vías de circulación de vehículos en los edificios, deben entenderse incluidas también las que sean exteriores adscritas al edificio, conforme al artículo 2, punto 3 de la LOE…» | [DccSUA] (imagen p. 46) |
| A.12 | Repo, nota SUA 7 «sin garaje» | VERIFICADO, con matiz | Cita bien las dos ramas. Pero el atributo es solo `!tieneGaraje`: la nota debe **declarar** que tampoco hay aparcamiento ni vías de circulación de vehículos **exteriores** adscritos al edificio (A.11), porque la app no los modela | — | — |
| A.13 | Repo, nota SUA 7 «garaje de unifamiliar»: «excluye los aparcamientos de las viviendas unifamiliares» | VERIFICADO (reformular) | Mejor el literal: «lo que excluye a los garajes de una vivienda unifamiliar» (SUA 7 ap. 1) y, en el Anejo A, «cualquiera que sea su superficie» | SUA 7 ap. 1; Anejo A | [SUA22] pp. 27, 39 |
| A.14 | Ámbito de SUA 8 | VERIFICADO + **INTERPRETACIÓN** | SUA 8 **no tiene apartado de ámbito**: se aplica a **todo edificio**, también a la unifamiliar. La verificación (ap. 1) decide si hace falta instalación | SUA 8 ap. 1 | [SUA22] p. 28 |
| A.15 | Comentario del Ministerio sobre fotovoltaica en cubierta | LEÍDO (1 fuente, comentario no reglamentario) | La exigencia es del edificio en su conjunto; una instalación fotovoltaica sobre subestructura que aumente notablemente la altura o el volumen altera la superficie de captura y puede obligar a revisar SUA 8. Para la app: **si hay FV elevada, H se mide hasta su punto más alto** (CRITERIO derivado) | [DccSUA] p. 48, comentario «Protección frente al rayo en cubierta en la que se implanta una instalación solar fotovoltaica» | [DccSUA] (imagen p. 48) |

**Zonas de nuestro edificio** (resumen, todo INTERPRETACIÓN salvo cita):
- **SUA 6**: solo la piscina comunitaria de la plurifamiliar (zona común exterior o cubierta) y, por el ap. 2, cualquier pozo, aljibe, depósito o conducción abierta accesible a personas, sea cual sea el tipo de edificio. No afecta al interior de las viviendas, oficinas, local, trasteros ni garaje (salvo que contengan un depósito accesible).
- **SUA 7**: garaje de la plurifamiliar (> 100 m² construidos: completo; ≤ 100 m²: solo sus vías de circulación, ap. 2.2 y 4.1) y las vías rodadas exteriores de la parcela. Nada en viviendas, zonas comunes peatonales, oficinas, local, trasteros, cuartos de instalaciones. Garaje de la unifamiliar: fuera.
- **SUA 8**: el edificio entero, sin distinción de usos (los usos solo entran en C4).

---

## Bloque C1 — SUA 6: seguridad frente al riesgo de ahogamiento

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C1.1 | Barreras: ¿solo en piscinas infantiles? | **CORREGIDO** | **No.** En **toda** piscina del ámbito «en las que el acceso de niños a la zona de baño no esté controlado». Deben impedir el acceso al vaso salvo por puntos previstos, con elementos practicables con **sistema de cierre y bloqueo** | SUA 6 ap. 1.1 pto 1: «Las piscinas en las que el acceso de niños a la zona de baño no esté controlado dispondrán de barreras de protección que impidan su acceso al vaso excepto a través de puntos previstos para ello, los cuales tendrán elementos practicables con sistema de cierre y bloqueo.» | [SUA22] p. 25 |
| C1.2 | Altura y resistencia de la barrera | VERIFICADO | Altura **mínima 1,20 m**; fuerza horizontal **0,5 kN/m** en el borde superior; condiciones constructivas de **SUA 1 ap. 3.2.3** | SUA 6 ap. 1.1 pto 2: «Las barreras de protección tendrán una altura mínima de 1,20 m, resistirán una fuerza horizontal aplicada en el borde superior de 0,5 kN/m y tendrán las condiciones constructivas establecidas en el apartado 3.2.3 de la Sección SUA 1.» | [SUA22] p. 25 |
| C1.3 | Qué es SUA 1 ap. 3.2.3 | LEÍDO (1 fuente, texto extraído; es de otro agente) | No escalable: sin puntos de apoyo (salientes > 5 cm) entre 30 y 50 cm; sin salientes horizontales de más de 15 cm de fondo entre 50 y 80 cm; sin aberturas que dejen pasar una **esfera de 10 cm** | SUA 1 ap. 3.2.3 pto 1 a) y b) | `DBSUA.txt` p. 12 |
| C1.4 | ¿Cuándo está «controlado» el acceso? | LEÍDO (1 fuente, comentario no reglamentario) | Tres soluciones admitidas: (1) las **puertas** desde el edificio al entorno de la piscina, cerradas fuera de uso, y ese entorno no se usa entonces; (2) una **barrera específica**, junto al vaso o más alejada (incluyendo praderas, solárium…), y lo de dentro solo se usa en horario de piscina; (3) **cerrar todo el recinto** fuera de uso: entonces no hace falta barrera en torno al vaso. Siempre «elementos físicos interpuestos» entre cualquier zona común de uso habitual y el vaso | [DccSUA] pp. 43–44, comentario a 1.1 | [DccSUA] |
| C1.5 | Profundidad máxima | VERIFICADO | **Piscinas infantiles ≤ 0,50 m** («50 cm, como máximo»). **Resto ≤ 3 m** («3 m, como máximo») y deben tener zonas de profundidad **< 1,40 m** (estricto: «menor que») | SUA 6 ap. 1.2.1 pto 1 | [SUA22] p. 25 |
| C1.6 | Señalización de profundidad | VERIFICADO | Señalizar los puntos donde se **supere 1,40 m** (estricto) y el valor de la **máxima y la mínima** profundidad en sus puntos, con rótulos **al menos en las paredes del vaso y en el andén**, visibles desde dentro y desde fuera | SUA 6 ap. 1.2.1 pto 2 | [SUA22] p. 25 |
| C1.7 | Pendientes «6 % / 10 %» | **CORREGIDO** (incompleto) | Máximos: **infantiles 6 %**; **recreo o polivalentes 10 % hasta 1,40 m de profundidad y 35 % en el resto** | SUA 6 ap. 1.2.2 pto 1: «a) En piscinas infantiles el 6%; b) En piscinas de recreo o polivalentes, el 10 % hasta una profundidad de 1,40 m y el 35% en el resto de las zonas.» | [SUA22] p. 25 |
| C1.8 | Huecos | VERIFICADO | Protegidos con rejas u otro dispositivo que impida el **atrapamiento** (sin cifra) | SUA 6 ap. 1.2.3 | [SUA22] p. 25 |
| C1.9 | Material del fondo | VERIFICADO | **Clase 3** de resbaladicidad en zonas cuya profundidad **no exceda de 1,50 m** (≤ 1,50; ojo: 1,50, no 1,40). Revestimiento interior **de color claro** | SUA 6 ap. 1.2.4 ptos 1 y 2 | [SUA22] pp. 25–26 |
| C1.10 | Color claro con dibujos | LEÍDO (1 fuente, comentario no reglamentario) | Se admiten dibujos o líneas de calle más oscuros si se sigue viendo el fondo | [DccSUA] p. 44 | [DccSUA] |
| C1.11 | Andenes | VERIFICADO | Suelo **clase 3**; anchura **≥ 1,20 m**; construcción que evite el **encharcamiento** | SUA 6 ap. 1.3 pto 1: «El suelo del andén o playa que circunda el vaso será de clase 3 …, tendrá una anchura de 1,20 m, como mínimo, y su construcción evitará el encharcamiento.» | [SUA22] p. 26 |
| C1.12 | ¿Es obligatorio el andén? | LEÍDO (1 fuente, comentario no reglamentario) | No: el apartado regula el andén **cuando existe** | [DccSUA] p. 44: «Este apartado regula la resbaladicidad de los andenes de piscinas y su anchura mínima, cuando existan, pero no obliga a dicha existencia.» | [DccSUA] |
| C1.13 | Resbaladicidad: cruce con SUA 1 | LEÍDO (1 fuente, texto; SUA 1 es de otro agente) + comentario | SUA 1 tabla 1.2: «Zonas exteriores. Piscinas ⁽²⁾. Duchas.» → clase 3; nota (2): «En zonas previstas para usuarios descalzos y en el fondo de los vasos, en las zonas en las que la profundidad no exceda de 1,50 m.» Aplica a la piscina comunitaria aunque SUA 1-1 no alcance al uso Residencial Vivienda (A.2) | SUA 1 ap. 1, tabla 1.2 | `DBSUA.txt` p. 8; [DccSUA] p. 43 |
| C1.14 | Escaleras «cada 15 m, en ambos lados» | **CORREGIDO** | El DB no dice «en ambos lados». Dice: **excepto en infantiles**, alcanzar **≥ 1 m bajo el agua** o bien **hasta 30 cm por encima del suelo del vaso**; colocarlas **en la proximidad de los ángulos del vaso y en los cambios de pendiente**, de forma que **no disten más de 15 m** entre ellas (≤ 15); peldaños antideslizantes, sin aristas vivas, sin sobresalir del plano de la pared | SUA 6 ap. 1.4 ptos 1 y 2 | [SUA22] p. 26 |
| C1.15 | Por qué 15 m | LEÍDO (1 fuente, comentario no reglamentario) | Para tener una escalera a menos de 7,5 m desde cualquier punto del borde. Si por un borde no se puede salir, justificar otra solución (hacer pie, vaso estrecho…) | [DccSUA] p. 45, comentario «Distancia entre escaleras» | [DccSUA] |
| C1.16 | Pozos y depósitos | VERIFICADO | Pozos, depósitos o conducciones abiertas **accesibles a personas** y con **riesgo de ahogamiento**: tapas o rejillas rígidas y resistentes, y **cierres** que impidan abrirlos al personal no autorizado (sin cifras) | SUA 6 ap. 2 pto 1 | [SUA22] p. 26 |
| C1.17 | ¿Qué es «piscina infantil»? | **NO VERIFICABLE** | El DB no la define (no está en el Anejo A). Decisión del proyectista | — | — |
| C1.18 | Accesibilidad del vaso (cruce con SUA 9) | LEÍDO (1 fuente, texto; SUA 9 es de otro agente) | «las de edificios con viviendas accesibles para usuarios de silla de ruedas, dispondrán de alguna entrada al vaso mediante grúa para piscina o cualquier otro elemento adaptado para tal efecto. Se exceptúan las piscinas infantiles.» | SUA 9 ap. 1.2.5 pto 1 | `DBSUA.txt` p. 33 |

**Comparaciones (para el checker):** profundidad infantil ≤ 0,50; resto ≤ 3,00; existencia de zona < 1,40; señalizar > 1,40; pendiente infantil ≤ 6 %; recreo ≤ 10 % (tramos con profundidad ≤ 1,40) y ≤ 35 % (resto); fondo clase 3 si profundidad ≤ 1,50; andén ≥ 1,20 y clase 3; barrera ≥ 1,20 m y 0,5 kN/m; escalera ≥ 1,00 m bajo el agua **o** a ≤ 0,30 m del fondo; separación ≤ 15 m.

**Entradas mínimas para una piscina comunitaria** (el resto se declara):

| Dato | De dónde sale | Lo habitual (CRITERIO) |
|---|---|---|
| ¿Hay piscina? ¿Es de uso colectivo? | El edificio (piscina sí/no) + tipo (plurifamiliar → colectivo; unifamiliar → excluida) | — |
| ¿Acceso de niños controlado? | Decisión (tres opciones del comentario C1.4 + «barrera perimetral») | **No controlado → barrera de 1,20 m** con puerta de cierre y bloqueo |
| Tipo de vaso | Decisión: recreo / infantil / ambos | Recreo; infantil solo si se proyecta chapoteo aparte |
| Profundidad máxima y mínima del vaso de recreo | Cifra del proyectista | Mínima 1,00–1,20 m; máxima 1,80–2,00 m (límite 3,00) |
| Profundidad del vaso infantil | Cifra | 0,30–0,40 m (límite 0,50) |
| Anchura del andén | Cifra (o «no hay andén», C1.12) | 1,50–2,00 m (límite 1,20) |
| Separación máxima entre escaleras | Cifra | Una en cada esquina del lado somero y del profundo; vaso ≤ 12–15 m de largo |
| Profundidad que alcanzan las escaleras | Decisión: «≥ 1 m» / «hasta 30 cm del fondo» | ≥ 1 m |
| Pozos, depósitos accesibles | Decisión sí/no | No (y, si los hay, «tapa con cierre») |

Lo que no tiene cifra (huecos, pendientes de detalle, color, clase 3 del pavimento) se declara con una frase.

**Frases típicas de memoria (SUA 6):**
- Plurifamiliar con piscina: «La piscina comunitaria es de uso colectivo (DB-SUA 6, ap. 1). El acceso al vaso se controla mediante barrera perimetral de 1,20 m de altura, resistente a 0,5 kN/m y no escalable (SUA 6 ap. 1.1; SUA 1 ap. 3.2.3), con puerta de cierre y bloqueo. Vaso de recreo de profundidad máxima [x] m (≤ 3 m) y mínima [y] m (< 1,40 m), con pendientes ≤ 10 % hasta 1,40 m y ≤ 35 % en el resto; se señalizan las profundidades máxima y mínima y los puntos de más de 1,40 m (ap. 1.2.1 y 1.2.2). Fondo de clase 3 hasta 1,50 m de profundidad y revestimiento de color claro (ap. 1.2.4). Andén de [z] m (≥ 1,20 m), clase 3, sin encharcamiento (ap. 1.3). Escaleras junto a los ángulos y cambios de pendiente, a ≤ 15 m entre sí y hasta 1 m bajo el agua (ap. 1.4). Huecos del vaso protegidos con rejilla antiatrapamiento (ap. 1.2.3).»
- Sin piscina: ver «Para el código», R1.

---

## Bloque C2 — SUA 7: seguridad frente al riesgo causado por vehículos en movimiento

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C2.1 | Espacio de acceso y espera | VERIFICADO | En las zonas de **uso Aparcamiento**, en su incorporación al exterior: profundidad «adecuada a la longitud del tipo de vehículo» y **≥ 4,5 m**; pendiente **≤ 5 %** | SUA 7 ap. 2 pto 1: «Las zonas de uso Aparcamiento dispondrán de un espacio de acceso y espera en su incorporación al exterior, con una profundidad adecuada a la longitud del tipo de vehículo y de 4,5 m como mínimo y una pendiente del 5% como máximo.» | [SUA22] p. 27 |
| C2.2 | ¿Siempre? | LEÍDO (1 fuente, comentario no reglamentario) | Hace falta tanto si la rampa sale al interior de la parcela como a la vía pública. **No hace falta si la incorporación es en sentido descendente.** Una salida por un pasillo entre muros se considera de riesgo (poca visibilidad) | [DccSUA] p. 46, comentario a 2.1 | [DccSUA] (imagen p. 46) |
| C2.3 | «Acceso peatonal independiente o protegido: ¿a partir de qué capacidad?» | **CORREGIDO** | El DB **no exige acceso peatonal independiente** ni tiene umbral de capacidad para ello. Lo único es: **todo recorrido peatonal previsto por una rampa para vehículos** (salvo el previsto solo para emergencia) tendrá **≥ 80 cm** de anchura y estará protegido por **barrera de ≥ 80 cm** de altura **o** por pavimento elevado (desnivel según SUA 1 ap. 3.1). Si alguna ordenanza municipal pide acceso peatonal independiente, es normativa local, no CTE | SUA 7 ap. 2 pto 2: «Todo recorrido para peatones previsto por una rampa para vehículos, excepto cuando únicamente esté previsto para caso de emergencia, tendrá una anchura de 80 cm, como mínimo, y estará protegido mediante una barrera de protección de 80 cm de altura, como mínimo, o mediante pavimento a un nivel más elevado, en cuyo caso el desnivel cumplirá lo especificado en el apartado 3.1 de la Sección SUA 1.» | [SUA22] p. 27 |
| C2.4 | ¿Qué es «rampa» aquí? | LEÍDO (1 fuente, comentario no reglamentario) | Zonas con pendiente **< 5 %** (zaguanes, pasos de carruajes, zonas de uso simultáneo) **no son rampa** a efectos de 2.2, salvo en el caso de SUA 7-3 pto 1 | [DccSUA] pp. 46–47, comentario «Protección de recorridos peatonales» | [DccSUA] |
| C2.5 | Puerta peatonal en el portón | LEÍDO (1 fuente, comentario no reglamentario) | Admitida si el portón tiene marcado CE (o, sin él, en garaje de unifamiliar o plaza segregada de usuario único) | [DccSUA] p. 46 | [DccSUA] |
| C2.6 | Rampa de vehículos con paso de personas: pendiente (cruce con SUA 1) | LEÍDO (1 fuente, texto; SUA 1 es de otro agente) | **≤ 16 %** si no pertenece a itinerario accesible | SUA 1 ap. 4.3.1 pto 1 b) | `DBSUA.txt` |
| C2.7 | «Plantas > 200 vehículos o > 5000 m²: itinerario peatonal protegido de 0,80 m» | **CORREGIDO** (en parte) | El DB exige, en **plantas** de Aparcamiento con capacidad **mayor que 200 vehículos** o superficie **mayor que 5000 m²** (estrictos), identificar los itinerarios peatonales **de zonas de uso público** con pavimento diferenciado (pinturas o relieve) o nivel más elevado; si ese desnivel **excede de 55 cm**, protección según SUA 1 ap. 3.2. La anchura de **0,80 m** **no está en el articulado**: es del comentario | SUA 7 ap. 3 pto 1 | [SUA22] p. 27 |
| C2.8 | La anchura de 0,80 m | LEÍDO (1 fuente, comentario no reglamentario) | Cuando el itinerario discurre a lo largo de un vial y es el previsto hasta las salidas de planta: diferenciarlo y darle **≥ 0,80 m**, que no cuenta como anchura del vial. Hasta plazas accesibles, condiciones de itinerario accesible | [DccSUA] p. 47, comentario a 3.1 | [DccSUA] |
| C2.9 | Barreras frente a las puertas | VERIFICADO | Solo en los aparcamientos del pto 1: barreras a **≥ 1,20 m** de las puertas que comunican con otras zonas y de **≥ 80 cm** de altura | SUA 7 ap. 3 pto 2 | [SUA22] p. 27 |
| C2.10 | ¿Aplica el ap. 3 al garaje comunitario? | **INTERPRETACIÓN** (clara) | **No**, por dos razones: (1) 20–80 plazas y < 5000 m² por planta; (2) el ap. 3 habla de «zonas de **uso público**», y el garaje comunitario es **uso privado** («en uso Aparcamiento los aparcamientos privados»; «en uso Residencial Vivienda todas las zonas»). Los umbrales se miden **por planta** («En plantas de Aparcamiento con capacidad …») | Anejo A, «Uso privado» y «Uso público» | [SUA22] pp. 39–40 (imagen) |
| C2.11 | Señalización | VERIFICADO | Conforme al **código de la circulación**: a) sentido de la circulación y salidas; b) **velocidad máxima de 20 km/h**; c) zonas de tránsito y paso de peatones en vías o rampas de circulación y acceso. Si puede acceder **transporte pesado**: además gálibos y alturas limitadas. Zonas de almacenamiento y carga/descarga: señalizadas y delimitadas con marcas viales o pinturas | SUA 7 ap. 4 ptos 1 y 2 | [SUA22] p. 27 |
| C2.12 | Dispositivos de alerta en la salida | VERIFICADO + comentario | «En los accesos de vehículos a viales exteriores desde **establecimientos** de uso Aparcamiento se dispondrán dispositivos que alerten al conductor de la presencia de peatones en las proximidades de dichos accesos.» Comentario (no reglamentario): «pueden consistir en espejos, detectores de movimiento, indicadores luminosos de presencia, etc.» | SUA 7 ap. 4 pto 3 | [SUA22] p. 27; [DccSUA] p. 47 |
| C2.13 | ¿El garaje comunitario es «establecimiento» de uso Aparcamiento? | **NO VERIFICABLE** → **CRITERIO** | El DB-SUA no define «establecimiento». Lo prudente, y lo habitual en las memorias: **aplicar 4.3** a todo garaje de uso Aparcamiento que salga a un vial exterior (espejo y señal luminosa de salida de vehículos) | — | — |

**Garaje de una plurifamiliar de 20–80 plazas** (lo que hay que justificar):

| Punto | ¿Aplica? | Exigencia | Dato |
|---|---|---|---|
| 2.1 Espacio de espera | Sí, si la salida al exterior es ascendente (C2.2) | Fondo ≥ 4,5 m, pendiente ≤ 5 % | Fondo y pendiente del tramo (cifras); o «salida descendente / a nivel» |
| 2.2 Peatones por rampa | Solo si se prevé paso de peatones por la rampa | Ancho ≥ 0,80 m + barrera ≥ 0,80 m o acera elevada | Decisión: «acceso peatonal por el núcleo de escaleras / ascensor» (no aplica) o «por la rampa» (anchura) |
| 3.1, 3.2 | No (≤ 200 plazas por planta, ≤ 5000 m², uso privado) | — | Plazas por planta y superficie (de El edificio) |
| 4.1 Señalización | Sí | Sentido, salidas, 20 km/h, pasos de peatones | Declaración |
| 4.2 Carga y descarga | No (habitual) | — | — |
| 4.3 Alerta de peatones | Sí (C2.13, CRITERIO) | Dispositivo de alerta | Tipo de dispositivo (decisión) |

**Entradas mínimas SUA 7:**

| Dato | De dónde sale | Lo habitual (CRITERIO) |
|---|---|---|
| ¿Hay garaje? ¿Unifamiliar? | El edificio | — |
| Superficie construida del garaje (> 100 m² → uso Aparcamiento) | El edificio (útil; construida si la útil no decide, como en SI) | > 100 m² con ≥ 5 plazas |
| Plazas por planta y superficie por planta (umbral 200 / 5000 m²) | El edificio (plazas por zona) | Muy por debajo |
| Sentido de la salida al exterior (ascendente / a nivel / descendente) | Decisión | Ascendente (sótano) |
| Fondo y pendiente del espacio de espera | Cifras | 4,50–5,00 m al 4–5 % |
| ¿Recorrido peatonal por la rampa? | Decisión | **No**: acceso peatonal por la escalera y el ascensor del edificio |
| Dispositivo de alerta | Decisión: espejo / detector / luminoso | Espejo convexo + señal luminosa de salida |
| ¿Acceden vehículos pesados? | Decisión | No |
| Vías rodadas exteriores en la parcela | Decisión sí/no | No |

**Frase típica de memoria (SUA 7):** «El garaje, de [n] plazas y [S] m² construidos, es zona de uso Aparcamiento (DB-SUA, Anejo A). Dispone en su salida al exterior de un espacio de acceso y espera de [f] m de fondo (≥ 4,5 m) y [p] % de pendiente (≤ 5 %) (SUA 7 ap. 2.1). No se prevén recorridos peatonales por la rampa: el acceso peatonal se realiza por el núcleo de escalera y ascensor (ap. 2.2). Con menos de 200 plazas y 5000 m² por planta, y siendo de uso privado, no le es de aplicación el ap. 3. Se señalizan, conforme al código de la circulación, el sentido de circulación y las salidas, la velocidad máxima de 20 km/h y las zonas de tránsito y paso de peatones (ap. 4.1), y se dispone en el acceso al vial exterior [espejo / indicador luminoso] que alerta al conductor de la presencia de peatones (ap. 4.3).»

---

## Bloque C3 — SUA 8 ap. 1: procedimiento de verificación

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C3.1 | Cuándo hace falta instalación | VERIFICADO | Cuando **Ne > Na** (estricto: «sea mayor que») | SUA 8 ap. 1 pto 1: «Será necesaria la instalación de un sistema de protección contra el rayo, en los términos que se establecen en el apartado 2, cuando la frecuencia esperada de impactos Ne sea mayor que el riesgo admisible Na.» | [SUA22] p. 28 |
| C3.2 | Obligatoria siempre | VERIFICADO | Edificios donde se **manipulen** sustancias tóxicas, radioactivas, altamente inflamables o explosivas, y edificios de **altura superior a 43 m** (> 43): siempre, con **eficiencia E ≥ 0,98** (→ nivel 1) | SUA 8 ap. 1 pto 2: «… y los edificios cuya altura sea superior a 43 m dispondrán siempre de sistemas de protección contra el rayo de eficiencia E superior o igual a 0,98, según lo indicado en el apartado 2.» | [SUA22] p. 28 |
| C3.3 | ¿Qué «altura» para los 43 m? | **INTERPRETACIÓN** | El DB-SUA no define «altura del edificio». Se propone la misma H que para Ae, la **máxima sobre la rasante** (incluidos casetones y remates). **No** es la altura de evacuación del DB-SI | — | — |
| C3.4 | Fórmula de Ne | VERIFICADO | **Ne = Ng · Ae · C1 · 10⁻⁶** [nº impactos/año] (1.1) | SUA 8 ap. 1 pto 3 | [SUA22] p. 28 (imagen) |
| C3.5 | Unidades | VERIFICADO + INTERPRETACIÓN | Ng en «nº impactos/año,km²» (Figura 1.1); Ae en **m²**; C1 adimensional. El 10⁻⁶ pasa m² a km² (INTERPRETACIÓN) | SUA 8 ap. 1 pto 3 | [SUA22] p. 28 |
| C3.6 | Definición de Ae y de H | VERIFICADO | «superficie de captura equivalente del edificio **aislado** en m², que es la delimitada por una línea trazada a una distancia **3H** de cada uno de los puntos del perímetro del edificio, siendo **H la altura del edificio en el punto del perímetro considerado**.» Sí: H es la altura **en cada punto** del perímetro | SUA 8 ap. 1 pto 3, «Ae» | [SUA22] p. 28 (imagen) |
| C3.7 | Ae de un rectángulo L × B con H uniforme: **Ae = L·B + 6H(L+B) + 9πH²** | **INTERPRETACIÓN** (geométrica, correcta) | Es el área del rectángulo «engordado» a distancia r = 3H: rectángulo + cuatro bandas (perímetro · r = 2(L+B) · 3H) + cuatro cuartos de círculo en las esquinas (π r² = 9πH²). Vale para toda planta **convexa** con H uniforme: Ae = A + P·3H + 9πH². Para plantas en L o en U la fórmula da **algo más** que el área real (las bandas se solapan en los rincones): queda del lado de la seguridad (INTERPRETACIÓN) | Definición de Ae | [SUA22] p. 28 |
| C3.8 | H variable (torreón, cumbrera, casetón) | LEÍDO (1 fuente, comentario no reglamentario) + **CRITERIO** | El comentario dibuja el área de captura como unión de la banda 3h del cuerpo bajo y el círculo 3H centrado en el elemento alto (aunque esté dentro de la planta). Para la app (CRITERIO): **H = altura máxima del edificio** aplicada a todo el perímetro, que da un Ae mayor o igual que el gráfico | [DccSUA] p. 50, comentario «Ejemplo del cálculo gráfico del área de captura» (figura) | [DccSUA] (imagen p. 50) |
| C3.9 | Edificio entre medianeras | **INTERPRETACIÓN** | Ae se calcula con la planta **del propio edificio** («edificio aislado»), sin sumar los vecinos; los vecinos entran por **C1** | Definición de Ae; tabla 1.1 | [SUA22] pp. 28–29 |
| C3.10 | Partes independientes de un edificio | LEÍDO (1 fuente, comentario no reglamentario) | Se pueden analizar por separado si, a la vez: compartimentación vertical ≥ **REI 120**; sin riesgo de explosión; sobretensiones cortadas en las líneas comunes; estructura independiente (p. ej. junta de dilatación) | [DccSUA] p. 48, comentario «Análisis del riesgo en edificios/estructuras independientes» | [DccSUA] (imagen p. 48) |
| C3.11 | Fórmula de Na | VERIFICADO | **Na = 5,5 / (C2·C3·C4·C5) · 10⁻³** (1.2), en nº impactos/año (INTERPRETACIÓN de la unidad: se compara con Ne) | SUA 8 ap. 1 pto 4 | [SUA22] p. 29 (imagen) |
| C3.12 | Tablas 1.1 a 1.5 | VERIFICADO | Transcripción siguiente | Tablas 1.1–1.5 | [SUA22] p. 29 (imagen 200 ppp); [DccSUA] pp. 49–50 (imagen) |
| C3.13 | Valores de Ng en la Figura 1.1: «1,50; 2,00; 2,50; 3,00; 3,50; 4,00; 4,50» | **CORREGIDO** | Etiquetas que aparecen en el mapa: **0,50; 1,00; 1,50; 2,00; 2,50; 3,00; 4,00; 5,00; 6,00**. **No aparecen 3,50 ni 4,50.** El mapa no tiene leyenda de colores: las cifras van escritas dentro de las zonas o junto a las líneas | Figura 1.1 | [SUA22] p. 28 (imagen 200 ppp); [DccSUA] p. 49 (imagen 130 ppp) |
| C3.14 | Dónde está cada etiqueta (lectura de la imagen) | LEÍDO (imagen) | 1,00 y 1,50: costa gallega (Pontevedra–A Coruña); 3,00: óvalo entre Lugo y Oviedo; 5,00: junto a Bilbao; 4,00: Vitoria y Pamplona–Logroño; 6,00: Pirineo (norte de Huesca); 3,00: Girona; 4,00 y 5,00: Lleida–Barcelona–Tarragona; 3,00: Zaragoza; 4,00 y 5,00: óvalos de Teruel; 2,50: meseta norte (entre Valladolid y Soria); 2,00: Madrid–Cuenca; 3,00: dos óvalos pequeños al sur de Cuenca; «?,00» en un óvalo junto a Toledo (la línea tapa la primera cifra); 1,50: Córdoba–Jaén; 0,50 y 1,00: óvalos entre Granada y Almería; 2,00: óvalo de Cádiz; 2,00 y 2,50: Baleares; 1,50: Ceuta y Melilla; 1,00: Canarias | Figura 1.1 | [SUA22] p. 28 |
| C3.15 | ¿Se puede asignar Ng por provincia con seguridad? | **NO VERIFICABLE** | **No.** Las isolíneas no siguen límites provinciales, no hay límites provinciales dibujados, muchas capitales caen sobre una línea o pegadas a ella (Madrid, Bilbao, Valladolid, Zaragoza, Barcelona, Valencia…), y dentro de algunas zonas la convención (cifra de zona o de línea) no es inequívoca (óvalos de Granada–Almería con 0,50 y 1,00). El dato lo **lee el proyectista** en la figura para su municipio | Figura 1.1 | [SUA22] p. 28 |
| C3.16 | Capitales que sí se leen sin duda | **INTERPRETACIÓN** (no dato verificado) | **Santa Cruz de Tenerife y Las Palmas: 1,00** (el recuadro de Canarias tiene una sola cifra). **Ceuta: 1,50** y **Melilla: 1,50** (etiqueta pegada a la ciudad, sin otras líneas). **Palma de Mallorca: 2,00** (confianza media: la etiqueta 2,00 está junto a Palma, pero hay un 2,50 al noreste, en Menorca). Ninguna capital peninsular se da | Figura 1.1 | [SUA22] p. 28 |

### Tabla 1.1 — Coeficiente C1 ([SUA22] p. 29)

| Situación del edificio | C1 |
|---|---|
| Próximo a otros edificios o árboles de la misma altura o más altos | 0,5 |
| Rodeado de edificios más bajos | 0,75 |
| Aislado | 1 |
| Aislado sobre una colina o promontorio | 2 |

Comentario (no reglamentario), [DccSUA] p. 49, «Edificio aislado»: «En la tabla 1.1, se considera que un edificio está aislado cuando no hay otros edificios a menos de una distancia 3H.»

### Tabla 1.2 — Coeficiente C2 ([SUA22] p. 29)

| | Cubierta metálica | Cubierta de hormigón | Cubierta de madera |
|---|---|---|---|
| Estructura metálica | 0,5 | 1 | 2 |
| Estructura de hormigón | 1 | 1 | 2,5 |
| Estructura de madera | 2 | 2,5 | 3 |

Comentarios (no reglamentarios), [DccSUA] p. 51, «Coeficiente C2»: «Un muro de fábrica de ladrillo o mampostería de piedra puede asimilarse a una estructura de hormigón.» «Las columnas de la tabla hacen referencia al material de la estructura de la cubierta.»

### Tabla 1.3 — Coeficiente C3 ([SUA22] p. 29)

| Contenido | C3 |
|---|---|
| Edificio con contenido inflamable | 3 |
| Otros contenidos | 1 |

Comentario (no reglamentario), [DccSUA] p. 51: el contenido inflamable de C3 es distinto del del pto 2; se refiere a contenidos inflamables no explosivos que aumentan el riesgo en incendio, «por ejemplo, grandes cantidades de papel».

### Tabla 1.4 — Coeficiente C4 ([SUA22] p. 29)

| Uso | C4 |
|---|---|
| Edificios no ocupados normalmente | 0,5 |
| Usos Pública Concurrencia, Sanitario, Comercial, Docente | 3 |
| Resto de edificios | 1 |

### Tabla 1.5 — Coeficiente C5 ([SUA22] p. 29)

| Actividad | C5 |
|---|---|
| Edificios cuyo deterioro pueda interrumpir un servicio imprescindible (hospitales, bomberos, ...) o pueda ocasionar un impacto ambiental grave | 5 |
| Resto de edificios | 1 |

Comentario (no reglamentario), [DccSUA] p. 51, «Coeficientes de elementos híbridos»: «… para el análisis de la evaluación del riesgo de un edificio con elementos híbridos (construidos con estructuras de distintos tipos, que contengan distintos usos, etc.) hay que acogerse al coeficiente más desfavorable.» **Consecuencia para la app:** un edificio de viviendas con un **local Comercial** declarado lleva **C4 = 3**; con oficinas (Administrativo, no listado), C4 = 1.

---

## Bloque C4 — SUA 8 ap. 2: tipo de instalación exigido, y Anejo B

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C4.1 | Eficiencia | VERIFICADO | **E = 1 − Na/Ne** (2.1). El DB la llama «eficacia» en el pto 1 y «eficiencia» en la tabla | SUA 8 ap. 2 pto 1 | [SUA22] p. 29 |
| C4.2 | Tabla 2.1 | VERIFICADO | E ≥ 0,98 → 1; 0,95 ≤ E < 0,98 → 2; 0,80 ≤ E < 0,95 → 3; 0 ≤ E < 0,80 → 4. En la imagen los signos son «≥» / «≤» (subrayados); **el texto extraído los pierde y muestra «>»**. El título de la tabla es, literalmente, «Componentes de la instalación» | Tabla 2.1 | [SUA22] p. 30 (imagen) |
| C4.3 | Nota del nivel 4 | VERIFICADO | «⁽¹⁾ Dentro de estos límites de eficiencia requerida, la instalación de protección contra el rayo no es obligatoria.» | Tabla 2.1, nota (1) | [SUA22] p. 30 |
| C4.4 | Cómo se combinan ap. 1 y nota (1) | **INTERPRETACIÓN** | Ne ≤ Na → no hace falta (ap. 1). Ne > Na pero E < 0,80 (es decir, **Ne < 5·Na**) → nivel 4, **no obligatoria**. **Obligatoria solo si E ≥ 0,80 ⇔ Ne ≥ 5·Na**, o en los casos del pto 2 (siempre nivel 1) | SUA 8 ap. 1 pto 1; tabla 2.1 y nota | [SUA22] pp. 28–30 |
| C4.5 | ¿Está el Anejo B en este DB? | VERIFICADO | **Sí**: «Anejo B Características de las instalaciones de protección frente al rayo», [SUA22] **pp. 42–46** (el ap. 2 lo llama «Anexo SUA B»). Sistema externo (captadores y derivadores), sistema interno y red de tierra | Anejo B pto 1 | [SUA22] pp. 42–46 (imagen) |
| C4.6 | Captadores | VERIFICADO | Puntas Franklin, mallas conductoras y pararrayos con dispositivo de cebado. Métodos (separados o combinados): ángulo de protección, esfera rodante, mallado o retícula | Anejo B, B.1.1 y B.1.1.1 | [SUA22] p. 42 |
| C4.7 | Tablas B.1 a B.5 | VERIFICADO | Transcripción siguiente | — | [SUA22] pp. 43–45 (imagen 200 ppp) |
| C4.8 | Malla: condiciones | VERIFICADO | Conductores en el perímetro de la cubierta, en malla de la dimensión exigida y en la limatesa si la pendiente **> 10 %**; en fachadas, la malla a alturas superiores al radio de la esfera rodante; ninguna instalación metálica fuera del volumen protegido. Edificios de **más de 60 m** con malla: malla también en el **20 % superior de la fachada** | B.1.1.1.3 ptos 2 y 3 | [SUA22] p. 44 |
| C4.9 | Pararrayos con dispositivo de cebado | VERIFICADO | Bajo el plano 5 m por debajo de la punta: esfera de radio **R = D + ΔL**, centro en la vertical a distancia D (tabla B.4). **ΔL = Δt** (avance en el cebado, **en µs**) si Δt ≤ 60 µs; **ΔL = 60 m** si mayor. Encima del plano: cono. (El texto extraído pierde «∆» y «µ»: dice «L», «t», «s»; la imagen dice ΔL, Δt y µs) | B.1.1.2 | [SUA22] p. 44 (imagen) |
| C4.10 | Derivadores | VERIFICADO | Al menos uno por punta; **mínimo dos** si la proyección horizontal del conductor supera la vertical o si la estructura **> 28 m**; trayectorias cortas; conexiones equipotenciales a nivel del suelo y **cada 20 m**. Mallas: separación media según tabla B.5 | B.1.2 ptos 1 a 3 | [SUA22] p. 45 |
| C4.11 | Sistema interno | VERIFICADO + comentario | Unir a tierra estructura metálica, instalaciones metálicas, elementos conductores externos, circuitos eléctricos y de telecomunicación y el sistema externo, con conductores de equipotencialidad o protectores de sobretensiones. Si no se puede: separación **ds = 0,1·L** (L: distancia vertical hasta la toma de tierra o unión equipotencial más próxima); canalizaciones exteriores de gas: **≥ 5 m**. Comentario (no reglamentario, [DccSUA] pp. 77–78): los DPS de las instalaciones eléctricas, según REBT ITC-BT-23 | B.2 ptos 1 a 3 | [SUA22] pp. 45–46 |
| C4.12 | Red de tierra | VERIFICADO | «La red de tierra será la adecuada para dispersar en el terreno la corriente de las descargas atmosféricas.» (sin cifras) | B.3 pto 1 | [SUA22] p. 46 |

### Tabla 2.1 — Componentes de la instalación ([SUA22] p. 30)

| Eficiencia requerida | Nivel de protección |
|---|---|
| E ≥ 0,98 | 1 |
| 0,95 ≤ E < 0,98 | 2 |
| 0,80 ≤ E < 0,95 | 3 |
| 0 ≤ E < 0,80 ⁽¹⁾ | 4 |

⁽¹⁾ «Dentro de estos límites de eficiencia requerida, la instalación de protección contra el rayo no es obligatoria.»

### Tabla B.1 — Ángulo de protección α ([SUA22] p. 43)

Columnas: diferencia de altura h entre la punta del pararrayos y el plano horizontal considerado, en m.

| Nivel de protección | 20 | 30 | 45 | 60 |
|---|---|---|---|---|
| 1 | 25º | * | * | * |
| 2 | 35º | 25º | * | * |
| 3 | 45º | 35º | 25º | * |
| 4 | 55º | 45º | 35º | 25º |

\* «En estos casos se emplean los métodos de esfera rodante y/o malla.»

### Tablas B.2 a B.5 ([SUA22] pp. 43–45)

| Nivel de protección | B.2 Radio de la esfera rodante (m) | B.3 Dimensión de la retícula (m) | B.4 Distancia D (m) | B.5 Distancia entre conductores de bajada, mallas (m) |
|---|---|---|---|---|
| 1 | 20 | 5 | 20 | 10 |
| 2 | 30 | 10 | 30 | 15 |
| 3 | 45 | 15 | 45 | 20 |
| 4 | 60 | 20 | 60 | 25 |

B.3: «malla rectangular cuya **dimensión mayor** será la indicada». B.5: «separación **media** no exceda de».

---

## Bloque C5 — SUA 8: entradas mínimas y lo habitual

| Dato | De dónde sale | Lo habitual (CRITERIO) | Comentario |
|---|---|---|---|
| **Ng** | **Decisión del proyectista**: elige uno de los 9 valores de la Figura 1.1 leyendo su municipio. La app muestra la figura con su cita | Sin valor por defecto (decisión forzada). Si el municipio cae sobre una línea o duda entre dos zonas: **el mayor** (CRITERIO). Canarias 1,00; Ceuta y Melilla 1,50 se pueden proponer (INTERPRETACIÓN, C3.16) | El criterio del encargo «el más desfavorable de los que tocan la provincia» exigiría una tabla provincia → valores que **no se puede verificar** con esta imagen (C3.15); se desaconseja codificarla |
| **L y B** (planta) | Cifras del proyectista | Por defecto, **L = B = √(superficie de la cubierta)** (dato de El edificio), rotulado «supuesto: planta cuadrada» | La cuadrada da el **menor** perímetro para un área dada, luego el menor Ae: **no** es conservadora. Pedir L y B reales cuando E quede cerca de 0,80 (p. ej. 0,70 ≤ E < 0,80) |
| **H** | El edificio: cota de la cara superior del forjado de cubierta sobre la rasante (`seccion.ts`, `cotaCubierta`), **más** el remate | Plana: + peto (≈ 1,0–1,2 m). Inclinada: hasta la **cumbrera**. Casetón de escalera o ascensor, o FV elevada (A.15): hasta su punto más alto (C3.8). Los sótanos no cuentan | H también decide el «> 43 m» (C3.3) |
| **C1** entorno | Decisión | **Plurifamiliar urbana entre medianeras: 0,5**. Bloque exento más alto que su entorno: 0,75. Unifamiliar en parcela sin edificios a menos de 3H: 1 (comentario «Edificio aislado») | — |
| **C2** estructura y cubierta | Decisión (dos selectores) | **Hormigón / hormigón: 1**. Muros de fábrica = hormigón (comentario). Cubierta con estructura de madera: 2,5 | La columna es el material de la **estructura de la cubierta** (comentario) |
| **C3** contenido | Decisión | **1** (otros contenidos) | Un garaje de viviendas no se trata como «contenido inflamable» (CRITERIO) |
| **C4** uso | **De El edificio**: si hay alguna zona Comercial, Pública Concurrencia, Sanitario o Docente → 3; si no, 1 | Viviendas, oficinas, garaje, trasteros: 1. **Local sin uso: 1** con aviso «si el local se destina a uso Comercial, C4 = 3 y debe revisarse SUA 8» | Regla del coeficiente más desfavorable (comentario) |
| **C5** | Decisión | **1** | — |
| ¿Manipula sustancias tóxicas, radioactivas, altamente inflamables o explosivas? | Decisión sí/no | No | Si sí → nivel 1 siempre |

**Ejemplos de cálculo** (comprobados a mano; sirven como tests):
1. Plurifamiliar entre medianeras, L = 20, B = 15, H = 18 m, Ng = 2,00, C1 = 0,5, C2 = C3 = C4 = C5 = 1: Ae = 300 + 6·18·35 + 9π·18² = 300 + 3 780 + 9 160,88 = **13 240,88 m²**; Ne = 2 · 13 240,88 · 0,5 · 10⁻⁶ = **0,013241**; Na = **0,0055**; Ne > Na; E = 1 − 0,0055/0,013241 = **0,5846** → nivel 4, **no obligatoria**.
2. Bloque exento, L = 25, B = 20, H = 30 m, Ng = 3,00, C1 = 0,5, resto 1: Ae = 500 + 8 100 + 25 446,90 = **34 046,90 m²**; Ne = **0,051070**; E = 1 − 0,0055/0,051070 = **0,8923** → **nivel 3, obligatoria** (malla ≤ 15 m, esfera 45 m, bajantes cada ≤ 20 m de media).
3. Unifamiliar aislada, L = 12, B = 10, H = 7 m, Ng = 2,00, C1 = 1, hormigón/hormigón: Ae = 120 + 924 + 1 385,44 = **2 429,44 m²**; Ne = **0,004859** ≤ Na = 0,0055 → **no es necesaria** (ap. 1). Con cubierta de madera (C2 = 2,5): Na = 0,0022, E = **0,5472** → nivel 4, no obligatoria.

**Frase típica de memoria (SUA 8):** «Frecuencia esperada de impactos: Ne = Ng·Ae·C1·10⁻⁶ = [Ng] × [Ae] m² × [C1] × 10⁻⁶ = [Ne] impactos/año, con Ng leído en la figura 1.1 para [municipio] y Ae delimitada a 3H del perímetro (H = [H] m). Riesgo admisible: Na = 5,5/(C2·C3·C4·C5)·10⁻³ = [Na] impactos/año (tablas 1.2 a 1.5). [Ne ≤ Na: no es necesaria la instalación de protección contra el rayo (DB-SUA 8, ap. 1).] / [Ne > Na: E = 1 − Na/Ne = [E] < 0,80 → nivel de protección 4; la instalación no es obligatoria (SUA 8 ap. 2, tabla 2.1, nota 1).] / [E = [E] → nivel [n]: se dispone sistema externo, interno y red de tierra conforme al Anejo B (malla ≤ [B.3] m / esfera de [B.2] m; bajantes a ≤ [B.5] m de media).]»

---

## Bloque 8 — Edición y cita

| # | Afirmación | Veredicto | Valor correcto | Cita | Fuente |
|---|---|---|---|---|---|
| 8.1 | Texto vigente | VERIFICADO | DB-SUA consolidado «14 junio 2022» (RD 450/2022) | [SUA22] pp. 1–2 | [SUA22] |
| 8.2 | ¿Han cambiado SUA 6, 7, 8 o el Anejo B desde 2010? | **NO VERIFICABLE** en esta sesión | No se ha cotejado con las disposiciones del BOE. El texto leído coincide con la versión que circula desde 2010; para la cita basta el consolidado | — | — |
| 8.3 | Comentarios | VERIFICADO | «DB-SUA con comentarios del Ministerio»: articulado 14-06-2022, **comentarios 15-07-2024** | [DccSUA] p. 1 | [DccSUA] |
| 8.4 | Cómo citar | **CRITERIO** (forma) | «CTE DB-SUA "Seguridad de utilización y accesibilidad", texto consolidado de 14-06-2022 (codigotecnico.org), Sección SUA 8, ap. 1, Tabla 1.2». Comentarios: «Comentario del Ministerio (DB-SUA con comentarios, 15-07-2024), no reglamentario» | — | — |

---

## Cifras que SÍ se pueden mostrar en la UI, con su cita

- **SUA 6** (DB-SUA 14-06-2022, SUA 6): barrera ≥ 1,20 m y 0,5 kN/m, SUA 1 ap. 3.2.3 (ap. 1.1); infantil ≤ 0,50 m, resto ≤ 3 m con zonas < 1,40 m, señalizar > 1,40 m y máxima/mínima (1.2.1); pendientes 6 % / 10 % hasta 1,40 m / 35 % (1.2.2); fondo clase 3 hasta 1,50 m, color claro (1.2.4); andén ≥ 1,20 m, clase 3 (1.3); escaleras ≥ 1 m bajo el agua o a 30 cm del fondo, ≤ 15 m entre ellas (1.4); pozos y depósitos con tapa y cierre (2).
- **SUA 7**: uso Aparcamiento > 100 m² construidos (Anejo A); espacio de espera ≥ 4,5 m y ≤ 5 % (2.1); recorrido peatonal por rampa ≥ 80 cm con barrera ≥ 80 cm (2.2); plantas > 200 vehículos o > 5000 m², desnivel > 55 cm, barreras a ≥ 1,20 m de las puertas y ≥ 80 cm de altura (3); 20 km/h y resto de señalización (4.1); dispositivos de alerta (4.3).
- **SUA 8**: fórmulas (1.1), (1.2), (2.1); tablas 1.1 a 1.5 y 2.1 con su nota; 43 m y E ≥ 0,98 (ap. 1.2); los 9 valores de Ng de la figura 1.1 como lista de elección, **con la figura a la vista**.
- **Anejo B**: tablas B.1 a B.5; 10 % (limatesa), 60 m y 20 % (malla en fachada), 5 m (cebado), 60 µs / 60 m (ΔL), 28 m (dos bajantes), 20 m (equipotenciales), ds = 0,1·L, 5 m (gas).
- **Comentarios** (rotulados «comentario, no reglamentario»): 0,80 m del itinerario peatonal en aparcamientos > 200 / 5000 m²; ejemplos de dispositivos de alerta; edificio aislado = sin edificios a menos de 3H; coeficiente más desfavorable en edificios híbridos; C2 por el material de la estructura de la cubierta; REI 120 para partes independientes.

## Cifras que NO deben mostrarse

- **Ng por provincia** o por capital peninsular como si fuera del DB (C3.15). Solo Canarias, Ceuta, Melilla y Palma como INTERPRETACIÓN rotulada.
- **Ng = 3,50 o 4,50**: no existen en el mapa (C3.13).
- **«Barrera de piscina solo en infantiles»** (C1.1).
- **«Escaleras en ambos lados»** (C1.14) y **«pendiente máxima 10 %» sin el 35 %** (C1.7).
- **«Fondo clase 3 hasta 1,40 m»**: es hasta **1,50 m** (C1.9).
- **«Acceso peatonal independiente al garaje»** como exigencia del CTE (C2.3).
- **0,80 m del itinerario peatonal del ap. 3 como articulado** (C2.7, C2.8): es comentario.
- **«SUA 6 no aplica» sin mencionar pozos y depósitos** (A.5).
- **«Piscina comunitaria = uso privado, SUA 6 no aplica»** por la terminología del RD 742/2013 (A.3).
- **Ae con la fórmula del rectángulo para H variable** sin aviso; **E redondeado** antes de compararlo con 0,80 / 0,95 / 0,98.
- **«SUA 8 no aplica a la unifamiliar»**: SUA 8 no tiene exclusiones de ámbito (A.14).

## Criterios de proyecto (lo que el DB no fija)

| # | Tema | Propuesta | Por qué |
|---|---|---|---|
| K1 | Acceso de niños a la piscina | Por defecto «no controlado» → barrera 1,20 m con puerta de cierre y bloqueo. Alternativas del comentario como opciones | Lo prudente y lo más común en comunidades |
| K2 | Pozos y depósitos (SUA 6-2) | Decisión sí/no, por defecto **No**; si sí, frase «tapa o rejilla rígida con cierre» | La app no modela aljibes ni pozos |
| K3 | Garaje ≤ 100 m² construidos en plurifamiliar | «Aplica»: solo 2.2 y 4.1 (vías de circulación), con aviso | A.9 |
| K4 | Rampa del garaje de la unifamiliar | No aplica (A.10), rotulado INTERPRETACIÓN | Dudoso, sin comentario |
| K5 | Dispositivo de alerta (4.3) en garaje comunitario | Aplicarlo siempre que el garaje sea uso Aparcamiento y salga a un vial exterior | C2.13 |
| K6 | Recorrido peatonal por la rampa | Por defecto **No** (acceso por el núcleo de escaleras) | Lo habitual |
| K7 | Ng | Sin defecto; entre dos zonas, el mayor | C3.15 |
| K8 | H | Altura máxima sobre la rasante, con remate, casetón y FV | C3.8, A.15 |
| K9 | L y B | Por defecto √(superficie de cubierta), pedir los reales cerca del umbral | C5 |
| K10 | C1 a C5 | 0,5 / 1 / 1 / (1 o 3 según usos) / 1 | C5 |
| K11 | Comparación de E | Sin redondeo; mostrar con 3 decimales; 0,80 exacto → nivel 3 | Tabla 2.1 usa «≤» en el límite inferior |

---

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Piscinas | DB-SUA | Consolidado 14-06-2022 (RD 450/2022) | 2022-06-14 | SUA 6 ap. 1.1 a 1.4 | — | codigotecnico.org · DBSUA.pdf, pp. 25–26 |
| Pozos y depósitos | ídem | ídem | 2022-06-14 | SUA 6 ap. 2 | — | ídem, p. 26 |
| Uso Aparcamiento | ídem | ídem | 2022-06-14 | Anejo A | — | ídem, p. 39 |
| Vehículos en movimiento | ídem | ídem | 2022-06-14 | SUA 7 ap. 2, 3, 4 | — | ídem, p. 27 |
| Densidad de impactos | ídem | ídem | 2022-06-14 | SUA 8 ap. 1 pto 3 | Figura 1.1 | ídem, p. 28 |
| C1 | ídem | ídem | 2022-06-14 | SUA 8 ap. 1 pto 3 | Tabla 1.1 | ídem, p. 29 |
| C2 a C5 | ídem | ídem | 2022-06-14 | SUA 8 ap. 1 pto 4 | Tablas 1.2 a 1.5 | ídem, p. 29 |
| Nivel de protección | ídem | ídem | 2022-06-14 | SUA 8 ap. 2 | Tabla 2.1 | ídem, p. 30 |
| Características del sistema | ídem | ídem | 2022-06-14 | Anejo B | Tablas B.1 a B.5 | ídem, pp. 42–46 |

---

## Pendientes

1. **Figura 1.1 a mayor resolución**: si se quiere proponer Ng por municipio, hace falta el mapa vectorial o una imagen ampliada (no disponible en esta sesión), o un mapa georreferenciado. Sin eso, Ng es decisión del proyectista.
2. **Historial de SUA 6, 7, 8 y Anejo B** frente a las disposiciones del BOE (8.2).
3. **«Establecimiento» en SUA 7-4.3**: ningún comentario del Ministerio aclara si el garaje comunitario lo es (C2.13).
4. **SUA 1 ap. 3.1, 3.2, 3.2.3 y 4.3.1, y SUA 9 ap. 1.2.5**: leídos solo en texto; los verifica el agente de SUA 1 / SUA 9.
5. **RD 742/2013** y decretos autonómicos de piscinas: solo extracto; fuera del CTE.
6. **Decisiones a validar por el responsable del proyecto**: K1 a K11 y las INTERPRETACIONES A.2, A.5, A.9, A.10, C2.10, C3.3, C3.7, C3.9, C3.16, C4.4.

---

## Para el código

### Observaciones sobre `src/lib/proyecto/aplicabilidad.ts`

| # | Regla | Hoy | Propuesta | Motivo |
|---|---|---|---|---|
| R1 | `sua6`, `!tienePiscina` | «… el edificio no dispone de piscina de uso colectivo (el ámbito de la Sección SUA 6 se limita a las piscinas de uso colectivo).» | «SUA 6 Seguridad frente al riesgo de ahogamiento: no es de aplicación — el edificio no dispone de piscina de uso colectivo (SUA 6 ap. 1) ni de pozos, depósitos o conducciones abiertas accesibles a personas que presenten riesgo de ahogamiento (SUA 6 ap. 2).» Cita: «DB-SUA 6, ap. 1 pto 1 y ap. 2». Si se añade el atributo `tienePozosAccesibles` (K2) y es `true`, la regla no casa: «aplica» solo con el ap. 2 | A.5 |
| R2 | `sua6`, `esUnifamiliar` | «… la piscina pertenece a una vivienda unifamiliar y no es de uso colectivo (… deja fuera las de las viviendas unifamiliares).» | «SUA 6 Seguridad frente al riesgo de ahogamiento: no es de aplicación — la piscina es de una vivienda unifamiliar, excluida expresamente del ámbito de la Sección (SUA 6 ap. 1 pto 1), y no hay pozos, depósitos o conducciones abiertas accesibles con riesgo de ahogamiento (ap. 2). La piscina queda sujeta a su reglamentación sanitaria específica.» | A.6 |
| R3 | `sua6`, plurifamiliar con piscina | Aplica (ninguna regla casa) | Correcto: la piscina comunitaria es de uso colectivo (A.2) | A.2 |
| R4 | `sua7`, `!tieneGaraje` | «… no dispone de garaje ni de zona de aparcamiento (… zonas de uso Aparcamiento y … vías de circulación de vehículos existentes en los edificios).» | «SUA 7 Seguridad frente al riesgo causado por vehículos en movimiento: no es de aplicación — el edificio no tiene zonas de uso Aparcamiento ni vías de circulación de vehículos, interiores o exteriores adscritas a él (SUA 7 ap. 1).» | A.11, A.12 |
| R5 | `sua7`, `esUnifamiliar` | «… el garaje pertenece a una vivienda unifamiliar (… excluye los aparcamientos de las viviendas unifamiliares).» | «SUA 7 …: no es de aplicación — el garaje es de una vivienda unifamiliar, que no es uso Aparcamiento cualquiera que sea su superficie (SUA 7 ap. 1: "lo que excluye a los garajes de una vivienda unifamiliar"; DB-SUA Anejo A, "Uso Aparcamiento").» | A.13 |
| R6 | `sua7`, plurifamiliar con garaje ≤ 100 m² construidos | Aplica entera | Sigue siendo «aplica», pero el checker debe saber que **no es uso Aparcamiento**: solo 2.2 y 4.1. Decidir con la superficie construida (`cambiaConConstruida(…, 100)` como en SI) | A.9 |
| R7 | `sua8` | — | No añadir ninguna regla de «no aplica»: SUA 8 no tiene exclusiones | A.14 |

### Datos propuestos (no aplicados ni compilados)

Siguen el patrón `tablaCTE(procedencia, datos)` de `src/lib/cte/tabla.ts`. Cifras leídas en la imagen de [SUA22]. Los criterios van fuera de `tablaCTE`.

#### `src/modules/sua/comun.ts` (procedencia compartida)

```ts
/** DB-SUA vigente: consolidado 14-jun-2022 (RD 450/2022). Comentarios del Ministerio: 15-jul-2024. */
export const PROC_SUA = {
  db: "DB-SUA",
  edicion: "Consolidado 14-06-2022 (RD 450/2022)",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DBSUA.pdf (cotejado en imagen)",
} as const;

/** Anejo A, «Uso Aparcamiento»: superficie CONSTRUIDA que EXCEDA de 100 m² (estricto).
 *  Excluye los garajes de una vivienda unifamiliar, cualquiera que sea su superficie. */
export const UMBRAL_USO_APARCAMIENTO_M2 = 100; // comparación: sConstruida > 100
```

#### `src/modules/sua/sua6/tablas.ts`

```ts
import { tablaCTE } from "../../../lib/cte/tabla";
import { PROC_SUA } from "../comun";

export const SUA6_AMBITO = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 6 ap. 1 pto 1" },
  {
    aplicaA: "piscinas de uso colectivo",
    salvo: ["destinadas exclusivamente a competición", "destinadas exclusivamente a enseñanza"],
    excluidas: [
      "piscinas de viviendas unifamiliares",
      "baños termales",
      "centros de tratamiento de hidroterapia",
      "otros dedicados a usos exclusivamente médicos",
    ],
    pagina: 25,
  },
);

export const SUA6_PISCINAS = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 6 ap. 1.1 a 1.4" },
  {
    /** 1.1: solo si el acceso de niños a la zona de baño NO está controlado. */
    barrera: { altura_min_m: 1.2, fuerzaBordeSuperior_kN_m: 0.5, constructivas: "SUA 1 ap. 3.2.3",
      puntosDeAcceso: "elementos practicables con sistema de cierre y bloqueo", pagina: 25 },
    /** 1.2.1. infantil ≤ 0,50; resto ≤ 3,00; debe existir zona con profundidad < 1,40 (estricto). */
    profundidad: { infantil_max_m: 0.5, resto_max_m: 3.0, zonaSomera_menorQue_m: 1.4,
      /** Señalizar los puntos donde se SUPERE 1,40 m, y la máxima y la mínima (paredes del vaso y andén). */
      senalizarSiSupera_m: 1.4, pagina: 25 },
    /** 1.2.2, máximos (fracción). */
    pendiente: { infantil_max: 0.06, recreoHasta140_max: 0.10, recreoResto_max: 0.35, tramo_m: 1.4, pagina: 25 },
    /** 1.2.4: clase 3 en el fondo donde la profundidad NO EXCEDA de 1,50 m (≤ 1,50). Revestimiento claro. */
    fondo: { claseResbaladicidad: 3, hastaProfundidad_m: 1.5, colorClaro: true, pagina: 25 },
    /** 1.3: si hay andén (el comentario aclara que no es obligatorio). */
    anden: { claseResbaladicidad: 3, anchura_min_m: 1.2, evitarEncharcamiento: true, pagina: 26 },
    /** 1.4: excepto infantiles. Profundidad ≥ 1,00 m bajo el agua O hasta 0,30 m sobre el fondo. */
    escaleras: { profundidad_min_m: 1.0, alternativaSobreFondo_m: 0.3, separacion_max_m: 15,
      ubicacion: "proximidad de los ángulos del vaso y cambios de pendiente",
      peldanos: "antideslizantes, sin aristas vivas, sin sobresalir del plano de la pared", pagina: 26 },
  },
);

export const SUA6_POZOS = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 6 ap. 2 pto 1" },
  { literal: "Los pozos, depósitos, o conducciones abiertas que sean accesibles a personas y presenten riesgo de ahogamiento estarán equipados con sistemas de protección, tales como tapas o rejillas, con la suficiente rigidez y resistencia, así como con cierres que impidan su apertura por personal no autorizado.", pagina: 26 },
);

/** CRITERIO (no CTE): valores por defecto propuestos al proyectista. */
export const SUA6_HABITUAL = {
  accesoNinosControlado: false,
  tipoVaso: "recreo" as const,
  profundidadMin_m: 1.1,
  profundidadMax_m: 1.9,
  anchuraAnden_m: 1.5,
  escalerasHastaUnMetro: true,
  pozosAccesibles: false,
};
```

#### `src/modules/sua/sua7/tablas.ts`

```ts
import { tablaCTE } from "../../../lib/cte/tabla";
import { PROC_SUA } from "../comun";

export const SUA7 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 7 ap. 1 a 4" },
  {
    /** ap. 1: zonas de uso Aparcamiento (Anejo A: > 100 m² construidos; excluye garaje de unifamiliar)
     *  y vías de circulación de vehículos existentes en los edificios. */
    ambito: { ramas: ["zonasUsoAparcamiento", "viasCirculacionVehiculos"] as const, pagina: 27 },
    /** 2.1 — solo zonas de uso Aparcamiento. No exigible si la incorporación es descendente (comentario). */
    espacioEspera: { fondo_min_m: 4.5, pendiente_max: 0.05, pagina: 27 },
    /** 2.2 — todo recorrido peatonal previsto por una rampa para vehículos, salvo solo emergencia. */
    peatonesPorRampa: { anchura_min_m: 0.8, barreraAltura_min_m: 0.8,
      alternativa: "pavimento elevado; desnivel según SUA 1 ap. 3.1", pagina: 27 },
    /** 3 — por PLANTA, estrictos («mayor que»), solo itinerarios de zonas de USO PÚBLICO. */
    recorridosPeatonales: { capacidad_mayorQue: 200, superficie_mayorQue_m2: 5000,
      desnivelProtegido_excede_m: 0.55, barreraPuertas: { distancia_min_m: 1.2, altura_min_m: 0.8 }, pagina: 27 },
    /** 4.1 a) b) c); 4.3 dispositivos de alerta en la salida a viales exteriores. */
    senalizacion: { velocidadMax_km_h: 20,
      elementos: ["sentido de la circulación y salidas", "velocidad máxima de 20 km/h",
        "zonas de tránsito y paso de peatones en vías o rampas"], pagina: 27 },
  },
);

/** Comentario del Ministerio (DB-SUA con comentarios, 15-07-2024), NO reglamentario. */
export const SUA7_COMENTARIOS = {
  itinerarioJuntoAVial_min_m: 0.8, // [DccSUA] p. 47, ap. 3.1
  dispositivosAlertaEjemplos: ["espejos", "detectores de movimiento", "indicadores luminosos de presencia"],
  rampaSiPendienteDesde: 0.05, // < 5 % no es «rampa» a efectos de 2.2 ([DccSUA] p. 47)
} as const;

/** CRITERIO (no CTE). */
export const SUA7_HABITUAL = {
  salidaAscendente: true,
  fondoEspacioEspera_m: 5.0,
  pendienteEspacioEspera: 0.04,
  peatonesPorRampa: false,
  dispositivoAlerta: "espejo convexo y señal luminosa de salida de vehículos",
  aplicar43EnGarajeComunitario: true,
} as const;
```

#### `src/modules/sua/sua8/tablas.ts`

```ts
import { tablaCTE } from "../../../lib/cte/tabla";
import { PROC_SUA } from "../comun";

/** Figura 1.1: etiquetas que aparecen en el mapa [impactos/(año·km²)]. NO hay 3,50 ni 4,50.
 *  El valor del municipio lo elige el proyectista leyendo la figura. */
export const NG_VALORES_FIGURA_1_1 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 3", tabla: "Figura 1.1" },
  [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0] as const,
);

/** INTERPRETACIÓN de la Figura 1.1 (lectura de la imagen), NO dato verificado. Rotular así. */
export const NG_LECTURA_SEGURA = {
  "Santa Cruz de Tenerife": 1.0,
  "Las Palmas": 1.0,
  Ceuta: 1.5,
  Melilla: 1.5,
  "Palma de Mallorca": 2.0, // confianza media
} as const;

export const C1_ENTORNO = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 3", tabla: "Tabla 1.1" },
  {
    proximo_igual_o_mas_alto: { valor: 0.5, literal: "Próximo a otros edificios o árboles de la misma altura o más altos" },
    rodeado_mas_bajos: { valor: 0.75, literal: "Rodeado de edificios más bajos" },
    aislado: { valor: 1, literal: "Aislado" },
    aislado_colina: { valor: 2, literal: "Aislado sobre una colina o promontorio" },
  },
);

export type MaterialC2 = "metalica" | "hormigon" | "madera";
/** [estructura][cubierta]. La cubierta es el material de la ESTRUCTURA de la cubierta (comentario);
 *  muros de fábrica de ladrillo o piedra ≈ hormigón (comentario). */
export const C2_CONSTRUCCION = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 4", tabla: "Tabla 1.2" },
  {
    metalica: { metalica: 0.5, hormigon: 1, madera: 2 },
    hormigon: { metalica: 1, hormigon: 1, madera: 2.5 },
    madera: { metalica: 2, hormigon: 2.5, madera: 3 },
  } satisfies Record<MaterialC2, Record<MaterialC2, number>>,
);

export const C3_CONTENIDO = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 4", tabla: "Tabla 1.3" },
  { inflamable: 3, otros: 1 },
);

export const C4_USO = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 4", tabla: "Tabla 1.4" },
  {
    no_ocupado: { valor: 0.5, literal: "Edificios no ocupados normalmente" },
    pc_sanitario_comercial_docente: { valor: 3, literal: "Usos Pública Concurrencia, Sanitario, Comercial, Docente" },
    resto: { valor: 1, literal: "Resto de edificios" },
  },
);

export const C5_CONTINUIDAD = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 4", tabla: "Tabla 1.5" },
  {
    servicio_imprescindible: { valor: 5, literal: "Edificios cuyo deterioro pueda interrumpir un servicio imprescindible (hospitales, bomberos, ...) o pueda ocasionar un impacto ambiental grave" },
    resto: { valor: 1, literal: "Resto de edificios" },
  },
);

/** ap. 1 pto 2: siempre E ≥ 0,98 si se manipulan sustancias peligrosas o la altura es > 43 m (estricto). */
export const SUA8_SIEMPRE = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 8 ap. 1 pto 2" },
  { altura_mayorQue_m: 43, eficienciaMinima: 0.98 },
);

/** Tabla 2.1 (límite inferior incluido, superior excluido). Nivel 4: no obligatoria (nota 1). */
export const NIVELES_PROTECCION = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 8 ap. 2", tabla: "Tabla 2.1" },
  [
    { nivel: 1, eMin: 0.98, eMax: Infinity, obligatoria: true },
    { nivel: 2, eMin: 0.95, eMax: 0.98, obligatoria: true },
    { nivel: 3, eMin: 0.8, eMax: 0.95, obligatoria: true },
    { nivel: 4, eMin: 0, eMax: 0.8, obligatoria: false },
  ] as const,
);

/** Anejo B, tablas B.1 a B.5, por nivel de protección (1..4). */
export const ANEJO_B = tablaCTE(
  { ...PROC_SUA, articulo: "Anejo B", tabla: "Tablas B.1 a B.5" },
  {
    /** B.1: ángulo α [º] por h = 20, 30, 45, 60 m; null = «esfera rodante y/o malla». */
    anguloProteccion_h_m: [20, 30, 45, 60] as const,
    anguloProteccion: { 1: [25, null, null, null], 2: [35, 25, null, null], 3: [45, 35, 25, null], 4: [55, 45, 35, 25] },
    radioEsferaRodante_m: { 1: 20, 2: 30, 3: 45, 4: 60 },   // B.2
    dimensionReticula_m: { 1: 5, 2: 10, 3: 15, 4: 20 },     // B.3 (dimensión mayor de la malla)
    distanciaD_m: { 1: 20, 2: 30, 3: 45, 4: 60 },           // B.4 (cebado: R = D + ΔL; ΔL = Δt [µs] hasta 60, si no 60 m)
    distanciaBajantesMalla_m: { 1: 10, 2: 15, 3: 20, 4: 25 }, // B.5 (separación media)
    otros: { limatesaSiPendiente_mayorQue: 0.10, mallaFachadaSiAltura_mayorQue_m: 60, mallaFachadaFraccionSuperior: 0.2,
      planoCebadoBajoPunta_m: 5, dosBajantesSiAltura_mayorQue_m: 28, equipotencialesCada_m: 20,
      ds_factor: 0.1, distanciaGas_min_m: 5 },
  },
);

// ── Cálculo (propuesta). Ae del rectángulo: INTERPRETACIÓN geométrica de la definición de Ae
//    (franja a 3H del perímetro con H uniforme; exacta para planta convexa, del lado de la
//    seguridad para plantas en L o en U).
export function areaCapturaRectangulo(L: number, B: number, H: number): number {
  return L * B + 6 * H * (L + B) + 9 * Math.PI * H * H;
}
/** (1.1) Ne = Ng·Ae·C1·10⁻⁶ [impactos/año]; Ng en impactos/(año·km²), Ae en m². */
export const frecuenciaEsperada = (Ng: number, Ae: number, C1: number) => Ng * Ae * C1 * 1e-6;
/** (1.2) Na = 5,5/(C2·C3·C4·C5)·10⁻³ [impactos/año]. */
export const riesgoAdmisible = (C2: number, C3: number, C4: number, C5: number) => (5.5 / (C2 * C3 * C4 * C5)) * 1e-3;
/** (2.1) E = 1 − Na/Ne. Solo tiene sentido si Ne > Na (ap. 1 pto 1). Sin redondear. */
export const eficienciaRequerida = (Na: number, Ne: number) => 1 - Na / Ne;
/** INTERPRETACIÓN: instalación obligatoria ⇔ (sustancias peligrosas ∨ altura > 43 m) ∨ (Ne > Na ∧ E ≥ 0,80). */
```

Tests sugeridos (de C5): (20, 15, 18, Ng 2, C1 0,5, Ci 1) → Ae 13 240,88; Ne 0,013241; E 0,5846; nivel 4. (25, 20, 30, Ng 3, C1 0,5) → Ae 34 046,90; Ne 0,051070; E 0,8923; nivel 3. (12, 10, 7, Ng 2, C1 1) → Ne 0,004859 ≤ Na 0,0055: no necesaria. Bordes: E = 0,80 exacto → nivel 3; E = 0,98 exacto → nivel 1; H = 43,00 → no activa «> 43 m».
