# Verificación normativa — DB-HS, Sección HS 2 «Recogida y evacuación de residuos», para el módulo HS2 (feature-21)

**Fecha:** 2026-10-05 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** HS 2 completa, con sus apéndices A y B (DBHS pp. 52–62), y los comentarios del Ministerio a HS 2 (DccHS pp. 56–66). Preguntas B1 a B9 del encargo, en ese orden. La ventilación del almacén (HS 3) y su clasificación como local de riesgo especial (SI 1) **no se re-verifican**: se citan de las verificaciones ya hechas.

**Regla aplicada:** toda cifra se ha leído en la **imagen** de la página: 200 ppp para el DB y 130 ppp para el DccHS. El texto extraído pierde ≤ y ≥, desordena las tablas (en la 3.1 y la 3.2 separa operaciones y periodos) y rompe las fórmulas. Veredictos:
- **VERIFICADO**: literal en el DB, leído en la imagen de [HS22] y coincidente con el texto de [HS22] y de [DccHS].
- **LEÍDO (1 fuente)**: literal en una sola fuente (casi siempre, un comentario del Ministerio).
- **CORREGIDO**: lo que dice el encargo no coincide con el DB.
- **NO VERIFICABLE**: el DB no lo dice, o no se ha podido leer con seguridad.
- **INTERPRETACIÓN**: se sigue del DB, pero el DB no lo escribe tal cual. Se puede mostrar, rotulada.
- **CRITERIO**: decisión de proyecto propuesta. No es exigencia del CTE y la ficha la rotula así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [HS22] | CTE DB-HS «Salubridad», texto consolidado. Es el mismo PDF que usó `verificacion-hs1.md` | «14 junio 2022» (último cambio: RD 450/2022, BOE 15-06-2022) | `research/pdf/DBHS.pdf` (codigotecnico.org) | **Imagen a 200 ppp**: pp. 52 a 62 (HS 2 entera con sus apéndices) y p. 2 (disposiciones). Texto: `scratchpad/hs2/DBHS-hs2.txt` (pp. 52–62 y 2–4) |
| [DccHS] | DB-HS con comentarios del Ministerio | Articulado: 14-jun-2022. Comentarios: **12-feb-2025** (p. 1) | `research/pdf/DccHS.pdf` | **Imagen a 130 ppp**: pp. 56, 57, 60 y 61. Texto: pp. 1 y 56–66 (`DccHS-hs2.txt`). Los comentarios van sangrados, con una raya vertical a la izquierda; así se distinguen del articulado |
| [SI25] | DB-SI consolidado «4 marzo 2025» | — | Ya verificado en `research/verificacion-si1-si2.md` | Solo las tablas 2.1 y 2.2 de SI 1 (B4) |
| [HS3] | DB-HS, Sección HS 3, del mismo consolidado | 14-jun-2022 | Ya verificado en `research/verificacion-edificio-usos.md` (bloques C y D) y en `research/verificacion-hs3-v4.md` (1d, 1e, 8f) | Ámbito y caudal del almacén de residuos (B4) |
| [REPO] | `src/lib/edificio/tipos.ts` | Estado actual | repo | El tipo de vivienda guarda `dormitorios: number` con el comentario «El 1.º es el principal» |

Avisos de los propios documentos:
- [HS22] p. 2 (imagen): «Este texto consolidado no tiene valor jurídico.» Recoge: RD 314/2006 (BOE 28/03/2006); RD 1371/2007 (BOE 23/10/2007) y su corrección (BOE 20/12/2007); corrección de errores y erratas del RD 314/2006 (BOE 25/01/2008); Orden VIV/984/2009 (BOE 23/04/2009) y su corrección (BOE 23/09/2009); Orden FOM/588/2017 (BOE 23/06/2017); RD 732/2019 (BOE 27/12/2019); RD 450/2022 (BOE 15/06/2022).
- [DccHS] p. 2: los comentarios «tienen un carácter orientativo e informativo no teniendo carácter reglamentario». En este fichero van rotulados «comentario, no reglamentario».
- **Cuál de esas disposiciones tocó HS 2: NO VERIFICABLE** (no se ha leído el BOE). Hay un indicio: 2.1.3 d) cita «UNE 20.315:2017», así que esa letra se modificó después de 2017. Es probable que fuera el RD 732/2019, pero no está comprobado. En la ficha: «DB-HS, Sección HS 2, texto consolidado 14-06-2022».

**Inventario de comentarios del Ministerio a HS 2:** solo hay **seis**, todos en [DccHS] pp. 56–57. No hay ninguno sobre el ámbito, la unifamiliar, los locales, el almacén compartido, la superficie mínima, la ubicación en el garaje, la bajante, el almacenamiento inmediato ni el mantenimiento (B9).

**Correcciones al encargo (resumen; el detalle va en cada bloque):**
1. El caudal de ventilación del almacén de residuos está en la **tabla 2.2** de HS 3, no en la 2.1 (B4.10).
2. Año de la UNE 20.315: **2017** en el almacén (2.1.3 d). En el recinto de la estación de carga neumática (2.2.4 b), [HS22] dice **1994** y [DccHS] **2017** (B4.5).
3. El Apéndice B llama «adimensional» a Cf y a Ff. El articulado y el Apéndice A les dan unidades: m²/l y m²/persona. Mandan las del articulado (B2.14).
4. La dispensa de papel y vidrio en las viviendas aisladas o agrupadas horizontalmente (2.3 pto 2) solo vale si existe **almacén** de contenedores. Con espacio de reserva no basta (B6.4).
5. 2.1.1 pto 2 (anchura, pendiente, puertas) habla solo del **almacén**. Su aplicación al espacio de reserva es una interpretación (B3.7).

---

## Bloque B1 — Ámbito (ap. 1.1)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B1.1 | Literal del ámbito | VERIFICADO | — | HS 2 ap. 1.1 pto 1: «Esta sección se aplica a los edificios de viviendas de nueva construcción, tengan o no locales destinados a otros usos, en lo referente a la recogida de los *residuos ordinarios* generados en ellos.» | [HS22] p. 52 |
| B1.2 | Otros usos | VERIFICADO | — | ap. 1.1 pto 2: «Para los edificios y locales con otros usos la demostración de la conformidad con las exigencias básicas debe realizarse mediante un estudio específico adoptando criterios análogos a los establecidos en esta sección.» | [HS22] p. 52 |
| B1.3 | ¿Aplica a la unifamiliar aislada o adosada de nueva construcción? | **INTERPRETACIÓN** con apoyo literal | **Sí.** Una unifamiliar es un «edificio de viviendas» (de una). Además, la propia sección regula las «viviendas aisladas o agrupadas horizontalmente» en 2.1 pto 2 y 2.3 pto 2, lo que solo tiene sentido si están dentro del ámbito. No hay comentario a HS 2 sobre esto. Por analogía (comentario a HS 3, no a HS 2): «Se consideran incluidos en el ámbito de aplicación los edificios de viviendas de cualquier tipo, incluso las viviendas aisladas, en hilera o pareadas.» | ap. 2.1 pto 2; ap. 2.3 pto 2 | [HS22] pp. 52, 56; `verificacion-hs3-v4.md` 1e |
| B1.4 | Edificio solo de oficinas | VERIFICADO (literal) + redacción propuesta | La sección **no se aplica directamente**, pero el edificio tiene que cumplir igual la **exigencia básica HS 2** (art. 13.2 de la Parte I, que el DB transcribe en su Introducción I: «Los edificios dispondrán de espacios y medios para extraer los residuos ordinarios generados en ellos de forma acorde con el sistema público de recogida…»). Por eso **no conviene escribir un «no aplica» sin más**: ver la frase de memoria | ap. 1.1 ptos 1 y 2; Introducción I, art. 13.2 | [HS22] pp. 3, 52 |
| B1.5 | Edificio de viviendas con locales: ¿los residuos de los locales entran en el cómputo? | **INTERPRETACIÓN** | **No.** (a) P solo cuenta dormitorios (2.1.2.1), así que la fórmula no tiene término para los locales. (b) ap. 1.1 pto 2 manda los «locales con otros usos» a un estudio específico. La frase «tengan o no locales» de pto 1 solo dice que el edificio sigue siendo del ámbito aunque tenga locales. El DB no lo dice tal cual y no hay comentario | ap. 1.1 ptos 1 y 2; ap. 2.1.2.1 («P») | [HS22] pp. 52–53 |
| B1.6 | Reformas y cambios de uso de edificios existentes | **INTERPRETACIÓN** (por el literal «de nueva construcción») | HS 2 **no** es exigible en intervenciones en edificios existentes. El DB-HS remite el ámbito a cada sección (Introducción II: «El ámbito de aplicación en este DB se especifica, para cada sección de las que se compone el mismo, en sus respectivos apartados»), y HS 2 se limita a la nueva construcción. Sin comentario del Ministerio | ap. 1.1 pto 1; Introducción II | [HS22] pp. 4, 52 |
| B1.7 | Ampliaciones | **NO VERIFICABLE** | El DB no las trata y no hay comentario. No se ha leído el art. 2 de la Parte I. Ver CRITERIO K10 | — | — |
| B1.8 | Procedimiento | VERIFICADO | Cuatro comprobaciones de diseño: a) almacén, si hay recogida **puerta a puerta** de alguna fracción; b) espacio de reserva, si hay recogida **centralizada con contenedores de calle de superficie** de alguna fracción; c) bajantes, si se disponen; d) almacenamiento inmediato. Más el mantenimiento (ap. 3) | ap. 1.2 ptos 2 a) a d) y 3 | [HS22] p. 52 |
| B1.9 | Comentario a 1.2 a) | LEÍDO (1 fuente, comentario no reglamentario) | — | [DccHS] p. 56 (imagen): «La recogida puerta a puerta se considera el sistema de recogida de residuos ordinarios más eficiente desde el punto de vista de separación de las fracciones de los residuos. Por ello, uno de los objetivos de este DB es facilitar su implantación.» | [DccHS] |

**Frases de memoria:**
- Viviendas: «El edificio es de viviendas de nueva construcción, por lo que le es de aplicación la Sección HS 2 del DB-HS (ap. 1.1 pto 1). Los residuos de los locales [sin uso] no se incluyen en el cálculo: su conformidad se demostrará mediante estudio específico (ap. 1.1 pto 2).»
- Solo oficinas: «El edificio no es de viviendas, por lo que la Sección HS 2 no se aplica directamente (DB-HS, HS 2 ap. 1.1 pto 1). Conforme al ap. 1.1 pto 2, la conformidad con la exigencia básica HS 2 (CTE Parte I, art. 13.2) se demostrará mediante un estudio específico, con criterios análogos a los de la sección.» El módulo no hace ese estudio: «no se dispone».

---

## Bloque B2 — Almacén de contenedores y espacio de reserva (ap. 2.1 y 2.1.2)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B2.1 | Cuándo almacén y cuándo reserva | VERIFICADO | **Por fracción.** Las fracciones con recogida puerta a puerta van al almacén. Las fracciones con recogida centralizada en contenedores de calle **de superficie** van al espacio de reserva. Un edificio puede necesitar las dos cosas | ap. 2.1 pto 1: «Cada edificio debe disponer como mínimo de un almacén de *contenedores de edificio* para las fracciones de los *residuos* que tengan *recogida puerta a puerta*, y, para las fracciones que tengan *recogida centralizada* con *contenedores de calle* de superficie, debe disponer de un espacio de reserva en el que pueda construirse un almacén de contenedores cuando alguna de estas fracciones pase a tener *recogida puerta a puerta*.» | [HS22] p. 52 |
| B2.2 | Uso provisional del espacio de reserva | LEÍDO (1 fuente, comentario no reglamentario) | — | [DccHS] p. 57 (imagen): «Este espacio de reserva se puede utilizar para cualquier otro uso provisional: zona de paso, almacén de bicicletas, etc., hasta que se construya el almacén de contenedores.» | [DccHS] |
| B2.3 | Recogida neumática | LEÍDO (1 fuente, comentario no reglamentario) | Ni almacén ni espacio de reserva para esas fracciones | [DccHS] p. 57 (imagen): «No es necesario disponer un almacén de contenedores de edificio ni un espacio de reserva en el caso de las fracciones que cuenten con recogida neumática.» | [DccHS] |
| B2.4 | Contenedores de calle **soterrados** | **INTERPRETACIÓN** (por omisión) | La «recogida centralizada» incluye los contenedores subterráneos (Apéndice A). Pero 2.1 pto 1 y 1.2 b) solo exigen reserva para los contenedores «de superficie». Leído al pie de la letra, una fracción con contenedor soterrado **no necesita almacén ni reserva**. No hay comentario: mostrarlo rotulado como interpretación | ap. 2.1 pto 1; ap. 1.2 b); Apéndice A, «Recogida centralizada»: «… tanto los de superficie como los subterráneos.» | [HS22] pp. 52, 60 |
| B2.5 | ¿Una unifamiliar aislada **sola** necesita espacio de reserva? | **INTERPRETACIÓN** firme | **Sí**, si alguna fracción tiene recogida centralizada en superficie. 2.1 pto 1 dice «cada edificio», y la unifamiliar es un edificio. El pto 2 es un **permiso** para compartir entre varias viviendas, no una exención | ap. 2.1 pto 2: «En el caso de viviendas aisladas o agrupadas horizontalmente, el almacén de *contenedores de edificio* y el espacio de reserva pueden disponerse de tal forma que sirvan a varias viviendas.» | [HS22] p. 52 |
| B2.6 | Fórmula (2.1) | VERIFICADO (imagen) | **S = 0,8 · P · Σ(Tf · Gf · Cf · Mf)** | ap. 2.1.2.1 pto 1, fórmula (2.1) | [HS22] p. 53 |
| B2.7 | Gf (dm³/(persona·día)) | VERIFICADO (imagen) | Papel/cartón **1,55** · Envases ligeros **8,40** · Materia orgánica **1,50** · Vidrio **0,48** · Varios **1,50**. Son valores fijos del DB («que equivale a los siguientes valores») | ap. 2.1.2.1 pto 1, «Gf» | [HS22] p. 53; repetidos en el Apéndice A, p. 59 |
| B2.8 | Tabla 2.1 Cf | VERIFICADO (imagen) | Ver la transcripción. Cf depende de la capacidad del contenedor «que el *servicio de recogida* exige para cada fracción»: es un **dato municipal** | ap. 2.1.2.1 pto 1, «Cf»; tabla 2.1 | [HS22] p. 53 |
| B2.9 | Mf | VERIFICADO | **4** para la fracción varios y **1** para las demás. En las dos fórmulas | «Mf un factor de mayoración que se utiliza para tener en cuenta que no todos los ocupantes del edificio separan los *residuos* y que es igual a 4 para la fracción varios y a 1 para las demás fracciones.» | [HS22] pp. 53 y 54 |
| B2.10 | Fórmula (2.2) | VERIFICADO (imagen) | **SR = P · Σ(Ff · Mf)**. **Sí lleva Mf** (imagen p. 53, y el «Mf» se define otra vez debajo de la tabla 2.2, p. 54). **No lleva el 0,8** | ap. 2.1.2.2 pto 1, fórmula (2.2) | [HS22] pp. 53–54 |
| B2.11 | Tabla 2.2 Ff | VERIFICADO (imagen) | Papel/cartón **0,039** · Envases ligeros **0,060** · Materia orgánica **0,005** · Vidrio **0,012** · Varios **0,038** (m²/persona) | Tabla 2.2 | [HS22] p. 54 |
| B2.12 | De dónde sale Ff | VERIFICADO (Apéndice A) + aritmética | Ff = Tf · Gf · Cf (A.2), con los valores de la tabla A.2: Tf = 7 / 2 / 1 / 7 / 7 días y Cf = 0,0036 m²/l (contenedor de 330 l) para todas. Comprobado: 7·1,55·0,0036 = 0,0391; 2·8,40·0,0036 = 0,0605; 1·1,50·0,0036 = 0,0054; 7·0,48·0,0036 = 0,0121; 7·1,50·0,0036 = 0,0378. Redondeados a tres decimales dan la tabla 2.2 | Apéndice A, «Factor de fracción»: «… se desconocen los valores de Tf y Cf que se deberían utilizar en el caso de establecerse una *recogida puerta a puerta*. Por ello, y a falta de estos datos reales, se toman los valores establecidos en la tabla A.2.» | [HS22] pp. 59–60 |
| B2.13 | Consecuencia (no la escribe el DB) | **INTERPRETACIÓN** | Con los mismos Tf y Cf, **SR = S / 0,8** (un 25 % más), porque SR no lleva el 0,8. Σ(Ff·Mf) con todas las fracciones = 0,039 + 0,060 + 0,005 + 0,012 + 4·0,038 = **0,268 m²/persona** → **SR = 0,268 · P** cuando las cinco fracciones van a la reserva | Fórmulas (2.1) y (2.2) | — |
| B2.14 | Unidades | VERIFICADO + **errata del Apéndice B** | Tf [días] · Gf [dm³/(persona·día)] · Cf [m²/l] = m²/persona, porque 1 dm³ = 1 l. Por P [personas] → **m²**. Ff [m²/persona] · P → **m²**. El Apéndice B dice «Cf: factor de contenedor adimensional» y «Ff: factor de fracción adimensional», lo que contradice el articulado (2.1.2.1: «[m²/l]»; 2.1.2.2: «[m²/persona]») y el Apéndice A. **Usar las del articulado** | Ap. 2.1.2; Apéndice A; Apéndice B | [HS22] pp. 53, 54, 59, 62 |
| B2.15 | ¿Superficie mínima numérica? | VERIFICADO: **no hay** | Solo «la que permita el manejo adecuado de los contenedores», para el almacén y para la reserva. La tabla A.1 da la superficie de almacenamiento y maniobra **por contenedor** (SC): 0,6 / 1,0 / 1,2 / 2,0 / 2,4 / 3,0 m² para 120 / 240 / 330 / 600 / 800 / 1.100 l. Puede servir de referencia del «manejo adecuado» (CRITERIO K6) | 2.1.2.1 pto 2: «Con independencia de lo anteriormente expuesto, la superficie útil del almacén debe ser como mínimo la que permita el manejo adecuado de los contenedores.» 2.1.2.2 pto 2: igual, para «la superficie de reserva» | [HS22] pp. 53, 54, 59 |
| B2.16 | ¿S es útil? ¿Y SR? | VERIFICADO | S = «superficie útil». SR = «superficie de reserva», sin calificar | 2.1.2.1 y 2.1.2.2 | [HS22] p. 53 |
| B2.17 | Qué es P | VERIFICADO | «el número estimado de ocupantes habituales del edificio que equivale a la suma del número total de dormitorios sencillos y el doble de número total de dormitorios dobles» → **P = Σ sencillos + 2 · Σ dobles** en todo el edificio. Pv es lo mismo para una vivienda (2.3) | 2.1.2.1, 2.1.2.2 y 2.3 pto 3 | [HS22] pp. 53, 54, 56 |
| B2.18 | Qué es un dormitorio doble o sencillo | **NO VERIFICABLE en el DB** + comentario | **Ni HS 2 ni su Apéndice A lo definen.** El comentario del Ministerio, puesto bajo «P» en 2.1.2.1: **«Se considera que el dormitorio principal es doble y el resto de dormitorios, sencillos.»** Es la única regla escrita: comentario, no reglamentario. Por coherencia vale igual para Pv (misma definición). HS 3 distingue «dormitorio principal» y «resto» en su tabla de caudales (así lo usa [REPO]), pero tampoco define «doble» | [DccHS] p. 57 (imagen) | [DccHS]; [REPO] |
| B2.19 | ¿Hay Tf típicos? | VERIFICADO (con matiz) | Los únicos Tf del DB son los de la **tabla A.2** (7 / 2 / 1 / 7 / 7 días). El DB los usa **solo para la reserva**, «a falta de estos datos reales», y ya van dentro de Ff. Para el **almacén** (puerta a puerta), Tf y la capacidad del contenedor son **datos del servicio de recogida** (B2.8). Usar la tabla A.2 para S sería un CRITERIO (K3) | Apéndice A, «Factor de fracción»; tabla A.2 | [HS22] p. 60 |
| B2.20 | ¿Sobre qué fracciones va el Σ? | **INTERPRETACIÓN** | El de (2.1), sobre las fracciones con recogida puerta a puerta. El de (2.2), sobre las fracciones con recogida centralizada en contenedores de superficie. Con recogida mixta se calculan S y SR por separado y las dos superficies se suman (el DB pide «un almacén … para las fracciones…» **y** «un espacio de reserva» para las otras) | ap. 2.1 pto 1 | [HS22] p. 52 |
| B2.21 | Fracción que el municipio no recoge por separado | **INTERPRETACIÓN** | Se deposita en «varios»: nota (1) de la tabla A.3: «Cuando alguna fracción no se separa se deposita en la fracción varios.» El DB no dice cómo cambia Σ; ver K4 | Tabla A.3, nota (1) | [HS22] p. 60 |

**Tabla 2.1 — Factor de contenedor** ([HS22] p. 53, imagen; = tabla A.1, p. 59)

| Capacidad del contenedor de edificio (l) | Cf (m²/l) | SC (m²), tabla A.1 |
|---|---|---|
| 120 | 0,0050 | 0,6 |
| 240 | 0,0042 | 1,0 |
| 330 | 0,0036 | 1,2 |
| 600 | 0,0033 | 2,0 |
| 800 | 0,0030 | 2,4 |
| 1.100 | 0,0027 | 3,0 |

Comprobado que Cf = SC/CC (A.1): 0,6/120 = 0,0050; 1,0/240 = 0,00417; 1,2/330 = 0,00364; 2,0/600 = 0,00333; 2,4/800 = 0,0030; 3,0/1.100 = 0,00273. **La tabla solo tiene esas seis capacidades.** Para un contenedor de otra capacidad, el DB no dice si se interpola o se calcula SC/CC: ver K5.

**Tabla 2.2 — Factor de fracción** ([HS22] p. 54, imagen) y **tabla A.2** ([HS22] p. 60, imagen)

| Fracción | Tf (días), A.2 | Gf (dm³/(persona·día)) | Cf (m²/l), A.2 | Ff (m²/persona) | Mf |
|---|---|---|---|---|---|
| Papel / cartón | 7 | 1,55 | 0,0036 ⁽ᵃ⁾ | 0,039 | 1 |
| Envases ligeros | 2 | 8,40 | 0,0036 ⁽ᵃ⁾ | 0,060 | 1 |
| Materia orgánica | 1 | 1,50 | 0,0036 ⁽ᵃ⁾ | 0,005 | 1 |
| Vidrio | 7 | 0,48 | 0,0036 ⁽ᵃ⁾ | 0,012 | 1 |
| Varios | 7 | 1,50 | 0,0036 ⁽ᵃ⁾ | 0,038 | **4** |

⁽ᵃ⁾ En la imagen de la tabla A.2 hay una sola cifra, «0,0036», centrada en la columna Cf a la altura de la fila de materia orgánica. Vale para las cinco filas (la aritmética de B2.12 lo confirma). Mf es de las fórmulas (2.1) y (2.2), no de la tabla.

**Ejemplos (aritmética, para los tests):**
- Unifamiliar de 3 dormitorios (1 doble + 2 sencillos): P = 4. Las cinco fracciones con contenedores de superficie: SR = 0,268 · 4 = **1,072 m²**.
- Plurifamiliar de 10 viviendas iguales a la anterior: P = 40 → SR = **10,72 m²**. Si las cinco fracciones fueran puerta a puerta con contenedores de 330 l y los Tf de la tabla A.2 (hipótesis, K3): S = 0,8 · 40 · 0,268236 = **8,58 m²**.

---

## Bloque B3 — Situación y recorrido (ap. 2.1.1)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B3.1 | Distancia | VERIFICADO | **d < 25 m**, estricto («menor que»), medida desde el acceso **del edificio**. **Solo** si el almacén o la reserva están **fuera** del edificio. Se aplica al almacén **y** a la reserva | 2.1.1 pto 1: «El almacén y el espacio de reserva, en el caso de que estén fuera del edificio, deben estar situados a una distancia del acceso del mismo menor que 25 m.» | [HS22] p. 53 |
| B3.2 | Anchura libre del recorrido | VERIFICADO | **≥ 1,20 m**, entre el almacén y el punto de recogida exterior | 2.1.1 pto 2: «El recorrido entre el almacén y el punto de recogida exterior debe tener una anchura libre de 1,20 m como mínimo, …» | [HS22] p. 53 |
| B3.3 | Estrechamientos | VERIFICADO | Anchura **≥ 1 m** («no se reduzca … a menos de 1 m») y longitud **≤ 45 cm** («no sea mayor que 45 cm») | «… aunque se admiten estrechamientos localizados siempre que no se reduzca la anchura libre a menos de 1 m y que su longitud no sea mayor que 45 cm.» | [HS22] p. 53 |
| B3.4 | Puertas | VERIFICADO | Las de **apertura manual**, en el sentido de salida | «Cuando en el recorrido existan puertas de apertura manual éstas deben abrirse en el sentido de salida.» | [HS22] p. 53 |
| B3.5 | Pendiente y escalones | VERIFICADO | **≤ 12 %**; sin escalones | «La pendiente debe ser del 12 % como máximo y no deben disponerse escalones.» | [HS22] p. 53 |
| B3.6 | Comentarios | LEÍDO (1 fuente, comentarios no reglamentarios) | (a) El sentido de apertura puede no exigirse si la puerta es la de acceso general del edificio. (b) **Sótano**: vale, si cumple lo anterior, con medio mecánico o rampa | [DccHS] p. 57 (imagen): «La condición del sentido de apertura de las puertas satisface el objetivo de facilitar la maniobra de extracción de los contenedores de residuos llenos desde el almacén hasta el punto de recogida en zonas estrechas. Por ello, esta condición podría no ser necesaria en el caso de que una de estas puertas coincida con la puerta de acceso general al edificio, al ser en este caso habitualmente las condiciones espaciales favorables.» · «El texto del DB no menciona explícitamente la posibilidad de la situación en un sótano. Por ello, se entiende que, mientras cumpla las condiciones anteriores, sería válida la situación en un sótano, utilizándose para el traslado de los contenedores hasta el punto de recogida exterior un medio de transporte mecánico o una rampa.» | [DccHS] |
| B3.7 | ¿El pto 2 aplica al espacio de reserva? | **INTERPRETACIÓN** | Al pie de la letra **no**: el pto 2 dice «el almacén», mientras que el pto 1 nombra los dos. Pero la reserva es el sitio donde «pueda construirse un almacén», y ese almacén tendrá que cumplir el pto 2. Propuesta: comprobarlo también para la reserva, rotulado como interpretación (K8) | 2.1 pto 1; 2.1.1 ptos 1 y 2 | [HS22] pp. 52–53 |
| B3.8 | Rampa del garaje como recorrido | **INTERPRETACIÓN** | Si el almacén o la reserva están en el garaje del sótano, la rampa de vehículos solo sirve de recorrido si su pendiente es ≤ 12 % y su anchura libre ≥ 1,20 m. Si no, hace falta un medio mecánico (comentario B3.6) | 2.1.1 pto 2 | — |

---

## Bloque B4 — Otras características del almacén (ap. 2.1.3), ventilación (HS 3) e incendio (SI 1)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B4.1 | Temperatura | VERIFICADO | **No superar 30 °C**. El DB escribe «30º», sin «C» | 2.1.3 pto 1 a): «su emplazamiento y su diseño deben ser tales que la temperatura interior no supere 30º;» | [HS22] p. 54 |
| B4.2 | Revestimientos | VERIFICADO | Paredes y suelo impermeables y fáciles de limpiar; encuentros pared-suelo **redondeados** | b): «el revestimiento de las paredes y el suelo debe ser impermeable y fácil de limpiar; los encuentros entre las paredes y el suelo deben ser redondeados;» | [HS22] p. 54 |
| B4.3 | Agua y desagüe | VERIFICADO | Al menos una toma de agua con válvula de cierre y un sumidero sifónico antimúridos en el suelo | c): «debe contar al menos con una toma de agua dotada de válvula de cierre y un sumidero sifónico antimúridos en el suelo;» | [HS22] p. 54 |
| B4.4 | Iluminación y enchufe | VERIFICADO | **≥ 100 lux a 1 m** del suelo; base de enchufe fija **16 A 2p+T** | d): «debe disponer de una iluminación artificial que proporcione 100 lux como mínimo a una altura respecto del suelo de 1 m y de una base de enchufe fija 16A 2p+T según UNE 20.315:2017;» | [HS22] p. 54 |
| B4.5 | Año de la UNE 20.315 | VERIFICADO (imagen) + **discrepancia entre fuentes** | Almacén (2.1.3 d): **UNE 20.315:2017** en [HS22] y en [DccHS]. Recinto de la estación de carga (2.2.4 b): [HS22] p. 56 dice **«UNE 20.315:1994»** y [DccHS] p. 60 dice **«UNE 20.315:2017»** (las dos leídas en imagen). Para el módulo solo cuenta la del almacén: **2017** | 2.1.3 d); 2.2.4 pto 2 b) | [HS22] pp. 54, 56; [DccHS] pp. 58, 60 |
| B4.6 | Incendio | VERIFICADO (remisión) | Remite a SI 1 ap. 2 | e): «satisfará las condiciones de protección contra incendios que se establecen para los almacenes de residuos en el apartado 2 de la Sección SI-1 del DB-SI Seguridad en caso de incendio;» | [HS22] p. 54 |
| B4.7 | Tolva intermedia (solo con bajante) | VERIFICADO | Compuerta de vaciado y limpieza; punto de luz de **1.000 lúmenes** en su interior, sobre la compuerta, con el interruptor fuera de la tolva | f) | [HS22] p. 54 |
| B4.8 | ¿2.1.3 aplica al espacio de reserva? | **INTERPRETACIÓN** | **No**: el pto 1 dice «El almacén de contenedores debe tener…». La reserva no se equipa hasta que se construye el almacén, y mientras tanto admite usos provisionales (B2.2). Recomendación (K8): situarla donde esas condiciones se puedan cumplir más adelante | 2.1.3 pto 1 | [HS22] p. 54 |
| B4.9 | Ventilación: ámbito de HS 3 | VERIFICADO (en [HS3]) | HS 3 se aplica a los almacenes de residuos **solo en edificios de viviendas** | HS 3 ap. 1.1 pto 1: «Esta sección se aplica, en los edificios de viviendas, al interior de las mismas, los almacenes de residuos, los trasteros, los aparcamientos y garajes; …» | `verificacion-edificio-usos.md` C1–C2 |
| B4.10 | Encargo: «la tabla 2.1 de HS3» | **CORREGIDO** | Es la **tabla 2.2** de HS 3 (locales no habitables): **almacenes de residuos 10 l/s por m² útil** | HS 3 ap. 2, tabla 2.2, «Almacenes de residuos» | `verificacion-edificio-usos.md` D3; `verificacion-hs3-v4.md` (resumen, l. 229) |
| B4.11 | Sistema de ventilación del almacén | VERIFICADO solo en parte | El ap. 3.1.2 de HS 3 admite ventilación **natural** además de híbrida y mecánica. **Las condiciones de diseño de 3.1.2 no están verificadas en el repo**: pendiente P2 | HS 3 ap. 3.1.2 | `verificacion-hs3-v4.md` 1d |
| B4.12 | Almacén dentro del garaje: ¿puede compartir la ventilación mecánica del garaje? | **INTERPRETACIÓN** | **No.** HS 3 solo permite ventilación conjunta a los **trasteros** situados dentro del recinto del aparcamiento; fuera de ese caso, la ventilación del garaje es «para uso exclusivo del aparcamiento». El almacén necesita ventilación propia | HS 3 ap. 3.1.4.2 pto 1 | `verificacion-hs3-v4.md` 8f |
| B4.13 | Incendio: local de riesgo especial | VERIFICADO (en [SI25], no re-verificado) | Fila «Almacén de residuos», S **construida**: **bajo 5 < S ≤ 15 m²**; **medio 15 < S ≤ 30 m²**; **alto S > 30 m²**. Con S ≤ 5 m² no es local de riesgo especial | SI 1 tabla 2.1 | `verificacion-si1-si2.md` 4.4, 4.5 (tabla) y A4.1 |
| B4.14 | Incendio: condiciones | VERIFICADO (en [SI25], no re-verificado) | SI 1 tabla 2.2. Bajo: R 90 · EI 90 · sin vestíbulo · puerta EI2 45-C5. Medio: R 120 · EI 120 · vestíbulo · 2 × EI2 30-C5. Alto: R 180 · EI 180 · vestíbulo · 2 × EI2 45-C5. Recorrido hasta una salida del local ≤ 25 m (+25 % con extinción automática). Nota (2): no menos que la tabla 1.2 del sector al que sirve (ejemplo del fichero: almacén de riesgo bajo en el sótano de un edificio de viviendas → EI 120) | SI 1 tabla 2.2 y nota (2) | `verificacion-si1-si2.md` 4.12–4.15 |
| B4.15 | ¿El espacio de reserva es local de riesgo especial? | **INTERPRETACIÓN** | Mientras no se construya el almacén, **no** (no es un «almacén de residuos»). Si SR > 5 m², conviene situarla donde se pueda compartimentar en el futuro (K8) | SI 1 tabla 2.1 | — |

---

## Bloque B5 — Traslado por bajantes (ap. 2.2): tabla resumen

El módulo **no** calcula bajantes («no se dispone»). Todas las cifras están leídas en imagen ([HS22] pp. 54–56) y coinciden con [DccHS] pp. 59–60.

| Apartado | Condición | Cifra / literal |
|---|---|---|
| 2.2.1 pto 1 | Compuertas de vertido | En zonas comunes, a distancia de las viviendas **< 30 m** («menor que 30 m»), medidos horizontalmente |
| 2.2.1 pto 2 | Vidrio | **No** se traslada por bajantes |
| 2.2.2 pto 1 | Material de la bajante | Metálica o de material con reacción al fuego **A1**, impermeable, anticorrosivo, imputrescible y resistente a los golpes; interior liso |
| 2.2.2 pto 2 | Separación | Muros **EI-120** respecto del resto de los recintos |
| 2.2.2 pto 3 | Trazado | Vertical; cambios de dirección respecto a la vertical **≤ 30°** («no mayores que 30º»). **Cada 10 m** de conducto, una acodadura de **cuatro codos de 15° cada uno como máximo** (figura 2.1) u otra solución con el mismo efecto |
| Figura 2.1 | Acodadura | La imagen de p. 54 rotula «15°» y tres tramos «> 450 mm». **La figura no tiene pie impreso** (el texto la llama «figura 2.1») |
| 2.2.2 pto 4 | Diámetro | **≥ 450 mm** |
| 2.2.2 pto 5 | Gravedad: extremo superior | Aspirador estático; toma de agua con racor para manguera; compuerta de limpieza con cierre hermético y cerradura |
| 2.2.2 pto 6 | Neumática: ventilación | Conducto de ventilación de sección **≥ 350 cm²** («no menor que 350 cm²») |
| 2.2.2 pto 7 | Salida sobre la cubierta | Tramo exterior **≥ 1 m**; además: a) más alto que cualquier obstáculo situado **entre 2 y 10 m**; b) **1,3 veces** la altura de cualquier obstáculo a **≤ 2 m**. Figura 2.2: «2m<L<10m» → «>H»; «≤2m» → «>1,3H₁», «>1,3H₂» |
| 2.2.2 pto 8 | Gravedad: extremo inferior | Compuerta de cierre y un sistema que impida que la acumulación alcance la compuerta de vertido más baja |
| 2.2.3 pto 1 | Compuertas de vertido: material | Metálicas o A1, impermeables…; **EI-60**; interior liso |
| 2.2.3 pto 2 | Unión con la bajante | Estanca: burlete elástico u otra solución equivalente |
| 2.2.3 pto 3 | Funcionalidad | Vertido fácil, limpieza interior fácil, acceso para eliminar atascos |
| 2.2.3 pto 4 | Cierre | Hermético y silencioso; **enclavamiento eléctrico** (u otra solución) para que no se puedan abrir dos a la vez |
| 2.2.3 pto 5 | Dimensiones | Circulares: **Ø 300 a 350 mm**. Rectangulares: entre **300×300 y 350×350 mm** |
| 2.2.3 pto 6 y figura 2.3 | Acabado impermeable y lavable | Alzado: **> 300 mm** alrededor de la compuerta (por encima y a los lados). Planta: **> 1 m** de suelo delante |
| 2.2.4 pto 1 | Estación de carga neumática | Tramo vertical de **2,5 m** de bajante; válvula de residuos en su extremo inferior; válvula de aire a la misma altura |
| 2.2.4 pto 2 a) | Recinto de la estación: cerramientos | Dimensionados para una depresión **≥ 2,95 kPa** |
| 2.2.4 pto 2 b) | Iluminación y enchufe | **100 lux a 1 m**; base **16 A 2p+T** según UNE 20.315 (**:1994** en [HS22], **:2017** en [DccHS]: ver B4.5) |
| 2.2.4 pto 2 c)–e) | Resto | Puerta batiente hacia fuera; paredes y suelo impermeables y fáciles de limpiar, suelo además antideslizante, encuentros redondeados; toma de agua con válvula de cierre y desagüe antimúridos |

**Frase de memoria:** «No se dispone instalación de traslado de residuos por bajantes, por lo que no son de aplicación las condiciones del ap. 2.2 de HS 2 (ap. 1.2 pto 2 c).»

---

## Bloque B6 — Almacenamiento inmediato en la vivienda (ap. 2.3)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B6.1 | Cinco fracciones | VERIFICADO | En **cada** vivienda, un espacio para **cada una** de las cinco fracciones | 2.3 pto 1: «Deben disponerse en cada vivienda espacios para almacenar cada una de las cinco fracciones de los *residuos ordinarios* generados en ella.» | [HS22] p. 56 |
| B6.2 | Fórmula (2.3) | VERIFICADO (imagen) | **C = CA · Pv**. C [dm³] por fracción; CA [dm³/persona]; Pv = sencillos + 2 · dobles **de la vivienda** | 2.3 pto 3 | [HS22] p. 56 |
| B6.3 | Tabla 2.3: orden de filas y valores | VERIFICADO (imagen; mismo orden en [DccHS] p. 61, imagen) | Orden del DB: **Envases ligeros 7,80 · Materia orgánica 3,00 · Papel/cartón 10,85 · Vidrio 3,36 · Varios 10,50**. **No** es el orden de las tablas 2.2 y A.2 (que empiezan por papel): asociar por nombre, nunca por posición | Tabla 2.3 «Coeficiente de almacenamiento, CA» | [HS22] p. 56 |
| B6.4 | Viviendas aisladas o agrupadas horizontalmente | VERIFICADO + **INTERPRETACIÓN** | El literal permite usar el **almacén de contenedores** para papel/cartón y vidrio. **Solo si existe almacén** (recogida puerta a puerta). Con solo espacio de reserva (recogida en contenedores de calle) no hay almacén que usar: las cinco fracciones van en la vivienda. Sin comentario | 2.3 pto 2: «En el caso de viviendas aisladas o agrupadas horizontalmente, para las fracciones de papel / cartón y vidrio, puede utilizarse como espacio de *almacenamiento inmediato* el almacén de *contenedores de edificio*.» | [HS22] p. 56 |
| B6.5 | Mínimos | VERIFICADO (imagen) | **Por fracción**: superficie en planta **no menor que 30 × 30 cm** y volumen **≥ 45 dm³** («igual o mayor que 45 dm³») | 2.3 pto 4: «Con independencia de lo anteriormente expuesto, el espacio de almacenamiento de cada fracción debe tener una superficie en planta no menor que 30x30 cm y debe ser igual o mayor que 45 dm³.» | [HS22] p. 57 |
| B6.6 | ¿Los 45 dm³ son por fracción? | VERIFICADO | **Sí**: «el espacio de almacenamiento de cada fracción» | Ídem | [HS22] p. 57 |
| B6.7 | ¿Manda el mayor entre C y 45 dm³? | **INTERPRETACIÓN** (lectura directa de «con independencia de lo anteriormente expuesto») | **Sí**: la capacidad exigida por fracción es **máx(CA · Pv; 45 dm³)**, y la planta mínima es 30 × 30 cm. «30x30 cm» se lee como un cuadrado de 30 cm de lado que tiene que caber en planta (0,09 m² no basta si un lado mide menos de 30 cm) | Ídem | — |
| B6.8 | Cocina | VERIFICADO | Materia orgánica y envases ligeros, «en la cocina o en zonas anejas auxiliares». Papel, vidrio y varios pueden estar en otro sitio de la vivienda | 2.3 pto 5 | [HS22] p. 57 |
| B6.9 | Accesibilidad y altura | VERIFICADO | Acceso sin elementos auxiliares; **punto más alto ≤ 1,20 m** sobre el suelo («no mayor que 1,20 m») | 2.3 pto 6: «Estos espacios deben disponerse de tal forma que el acceso a ellos pueda realizarse sin que haya necesidad de recurrir a elementos auxiliares y que el punto más alto esté situado a una altura no mayor que 1,20 m por encima del nivel del suelo.» | [HS22] p. 57 |
| B6.10 | ¿«Estos espacios» son los cinco o solo los de pto 5? | **INTERPRETACIÓN** | Ambiguo: el pto 6 va justo después del pto 5. Propuesta: aplicarlo a los cinco (es la lectura más prudente y la más habitual) | 2.3 ptos 5 y 6 | — |
| B6.11 | Acabados | VERIFICADO | Impermeable y fácilmente lavable todo elemento situado **a menos de 30 cm** de los límites del espacio | 2.3 pto 7 | [HS22] p. 57 |
| B6.12 | De dónde sale CA (observación) | **INTERPRETACIÓN** — no derivar | Cuatro de los cinco valores son Gf × días: papel 10,85 = 7 × 1,55; vidrio 3,36 = 7 × 0,48; varios 10,50 = 7 × 1,50; orgánica 3,00 = 2 × 1,50. Envases ligeros (7,80) no sale de 8,40 con días enteros. El DB no lo explica: **copiar la tabla literal** | Tabla 2.3; Gf de 2.1.2.1 | [HS22] pp. 53, 56 |

**Tabla 2.3 — Coeficiente de almacenamiento, CA [dm³/persona]** ([HS22] p. 56, imagen; mismo orden que el DB)

| Fracción | CA |
|---|---|
| Envases ligeros | 7,80 |
| Materia orgánica | 3,00 |
| Papel / cartón | 10,85 |
| Vidrio | 3,36 |
| Varios | 10,50 |

**Capacidad exigida por fracción, máx(CA·Pv; 45) dm³ (aritmética, para los tests):**

| Pv | Envases | Orgánica | Papel | Vidrio | Varios |
|---|---|---|---|---|---|
| 2 | 45 (15,6) | 45 (6,0) | 45 (21,7) | 45 (6,72) | 45 (21,0) |
| 4 | 45 (31,2) | 45 (12,0) | 45 (43,4) | 45 (13,44) | 45 (42,0) |
| 5 | 45 (39,0) | 45 (15,0) | **54,25** | 45 (16,8) | **52,5** |
| 6 | **46,8** | 45 (18,0) | **65,1** | 45 (20,16) | **63,0** |

Entre paréntesis, CA·Pv cuando manda el mínimo. C supera los 45 dm³ a partir de Pv ≥ 5 en papel y varios, Pv ≥ 6 en envases, Pv ≥ 14 en vidrio y Pv ≥ 16 en orgánica.

**Frase de memoria:** «Cada vivienda dispone de espacios de almacenamiento inmediato para las cinco fracciones, con capacidad C = CA · Pv y, como mínimo, 45 dm³ y 30 × 30 cm en planta por fracción. Los de materia orgánica y envases ligeros están en la cocina, con su punto más alto a no más de 1,20 m del suelo (DB-HS, HS 2 ap. 2.3).»

---

## Bloque B7 — Mantenimiento y conservación (ap. 3)

Emparejado fila a fila en la imagen ([HS22] pp. 57–58; = [DccHS] p. 61, imagen, y p. 62, texto). El texto extraído separa las operaciones de los periodos.

| # | Afirmación | Veredicto | Cita | Fuente |
|---|---|---|---|---|
| B7.1 | Señalización e instrucciones del almacén | VERIFICADO | 3.1 pto 1: señalizar los contenedores según su fracción y el almacén; instrucciones en soporte indeleble dentro del almacén | [HS22] p. 57 |
| B7.2 | Tabla 3.1 | VERIFICADO (imagen) | Ver la transcripción | [HS22] p. 57 |
| B7.3 | Bajantes: señalización e instrucciones | VERIFICADO | 3.2 ptos 1–2: compuertas señalizadas por fracción; instrucciones a)–d), entre ellas «no se deben verter por ninguna compuerta *residuos* líquidos, objetos cortantes o punzantes ni vidrio» | [HS22] p. 57 |
| B7.4 | Tabla 3.2 | VERIFICADO (imagen) | Ver la transcripción. Ocupa dos páginas: el bloque «Recinto de estación de carga» está en p. 58 | [HS22] pp. 57–58 |

**Tabla 3.1 — Operaciones de mantenimiento (almacén de contenedores de edificio)**

| Operación | Periodicidad |
|---|---|
| Limpieza de los contenedores | 3 días |
| Desinfección de los contenedores | 1,5 meses |
| Limpieza del suelo del almacén | 1 día |
| Lavado con manguera del suelo del almacén | 2 semanas |
| Limpieza de las paredes, puertas, ventanas, etc. | 4 semanas |
| Limpieza general de las paredes y techos del almacén, incluidos los elementos del sistema de ventilación, las luminarias, etc. | 6 meses |
| Desinfección, desinsectación y desratización del almacén de contenedores | 1,5 meses |

**Tabla 3.2 — Operaciones de mantenimiento (instalaciones de traslado por bajantes)**

| Elemento | Operación | Periodicidad |
|---|---|---|
| Bajantes | Limpieza de las bajantes por gravedad. Revisión y reparación de los daños encontrados | 6 meses |
| Bajantes | Limpieza de las bajantes neumáticas. Revisión y reparación de los daños encontrados | 1 año |
| Bajantes | Limpieza de las compuertas de vertido | 1 semana |
| Recinto de estación de carga | Limpieza del suelo | 1 semana |
| Recinto de estación de carga | Limpieza de las paredes, las puertas, las ventanas, etc. | 2 meses |
| Recinto de estación de carga | Limpieza general de las paredes y techos, incluidos elementos del sistema de ventilación, luminarias, etc. | 6 meses |
| Recinto de estación de carga | Desinfección, desinsectación y desratización | 6 meses |

**INTERPRETACIÓN:** con solo espacio de reserva no hay almacén que mantener. La tabla 3.1 entra en la ficha cuando hay almacén; la 3.2, solo si hay bajantes.

---

## Bloque B8 — Apéndice A (terminología) y Apéndice B (notación)

Literales leídos en imagen ([HS22] pp. 59–62).

| Término | Definición (literal) | Para el módulo |
|---|---|---|
| Almacenamiento inmediato | «almacenamiento temporal de las fracciones de los *residuos* en el interior de las unidades de uso para reducir la frecuencia del traslado a mano hasta los puntos de recogida.» | ap. 2.3 |
| Bajante | «conducto vertical que sirve para el traslado por gravedad o neumático de los *residuos* desde las compuertas de vertido hasta los *contenedores de edificio* o las estaciones de carga, respectivamente.» | B5 |
| Contenedores de calle | «*contenedores de recogida* públicos dispuestos en la calle para los *residuos* generados en edificios de su entorno. Estos contenedores pueden ser de superficie, en cuyo caso los usuarios depositan los *residuos* directamente en ellos, o subterráneos, que disponen de un buzón colocado en la superficie para la introducción de los *residuos*.» | B2.4 |
| Contenedores de edificio | «*contenedores de recogida* privados para los *residuos* generados en una o varias viviendas y que se sitúan en el almacén de *contenedores de edificio*. En estos contenedores se depositan los *residuos* a través de *bajantes* o a mano.» | Almacén |
| Contenedores de recogida | «contenedores utilizados para depositar las distintas fracciones de los *residuos ordinarios* generados, a fin de facilitar su traslado y su carga en los camiones del *servicio de recogida*.» | — |
| Estación de carga | Parte de la instalación de recogida neumática en la parte inferior de la bajante o de la compuerta de vertido exterior, que las conecta con el tramo subterráneo de la red; tramo vertical, válvula de residuos, válvula de aire, indicadores de nivel e instrumentación | B5 |
| Factor de contenedor | **Cf = SC / CC** (A.1): Cf [m²/l]; SC «la superficie necesaria para el almacenamiento y maniobra de cada contenedor de edificio [m²]»; CC «la capacidad de cada contenedor [l]». Tabla A.1 (ver B2) | B2.8, B2.15 |
| Factor de fracción | **Ff = Tf · Gf · Cf** (A.2), con los valores de la tabla A.2 «a falta de estos datos reales» | B2.12 |
| Recogida neumática | «sistema en el que los *residuos* se almacenan en estaciones de carga que se alimentan a través de compuertas de vertido o buzones situados en espacios comunes o públicos. Los *residuos* almacenados se aspiran intermitentemente desde una instalación central que da servicio a un conjunto de edificios y se depositan en los contenedores de transporte situados en ella.» | B2.3 |
| Recogida centralizada | «sistema en el que el *servicio de recogida* retira los *residuos* de los *contenedores de calle*, tanto los de superficie como los subterráneos.» | B2.1, B2.4 |
| Recogida puerta a puerta | «sistema en el que el *servicio de recogida* retira los *residuos* de los *contenedores de edificio*, bien accediendo al almacén de los mismos, bien directamente en la vía pública a donde los sacan los usuarios.» | B2.1. **Ojo:** también es puerta a puerta cuando los vecinos **sacan** los contenedores a la calle: también entonces hace falta almacén |
| Residuo | Remite a la **Ley 10/1998**, de Residuos, y a la Lista Europea de Residuos | Ver P4 |
| Residuos ordinarios | «parte de los *residuos urbanos* generada en los edificios, con excepción de: a) animales domésticos muertos, muebles y enseres; b) *residuos* y escombros procedentes de obras menores de construcción y reparación domiciliaria.» Fracciones y componentes en la tabla A.3 | Ámbito |
| Tabla A.3 | Envases ligeros (bolsas de plástico, botellas y garrafas de plástico, brics, envases de plástico, latas metálicas); Materia orgánica (corcho, restos de comidas, restos de preparación de comidas, servilletas de papel y papel de cocina usados); Papel y cartón (diarios y revistas, embalajes de cartón, envases de cartón, hojas de publicidad, papel de oficina); Vidrio (botellas, botes); Varios ⁽¹⁾ (cenizas, cuero, goma y caucho, maderas, pañales). ⁽¹⁾ «Cuando alguna fracción no se separa se deposita en la fracción varios.» | B2.21 |
| Residuos urbanos | Ley 10/1998: domicilios particulares, comercios, oficinas y servicios, y asimilables; además limpieza viaria, animales muertos, muebles, enseres y vehículos abandonados, escombros de obras menores | — |
| Servicio de recogida | «… Este servicio lo presta habitualmente la administración municipal, bien directamente bien a través de empresas contratadas; aunque en algunos casos lo hace una agrupación de municipios o una administración supramunicipal.» | Origen de los datos Tf, CC y sistema por fracción |

**Correcciones a la lista de términos pedidos:**
- «Almacén de contenedores de edificio» **no tiene entrada propia**. Se entiende por la de «Contenedores de edificio».
- «Espacio de reserva» **no tiene definición** en el Apéndice A. Solo lo describe 2.1 pto 1: «un espacio de reserva en el que pueda construirse un almacén de contenedores cuando alguna de estas fracciones pase a tener *recogida puerta a puerta*».
- «Fracciones» **no tiene entrada propia**. Las cinco están en la tabla A.3.
- **«Dormitorio doble / sencillo» no está definido** (B2.18).

**Apéndice B (Notación)** ([HS22] p. 62, imagen): C [dm³]; CA [dm³/persona]; CC [l]; Cf «factor de contenedor adimensional» (**errata**, ver B2.14); Ff «factor de fracción adimensional» (**errata**); Gf [dm³/(persona·día)]; Mf adimensional; P y Pv (ocupantes, sin unidad); S [m²]; SC [m²]; SR [m²]; Tf [día].

---

## Bloque B9 — Comentarios del Ministerio útiles para una vivienda nueva típica

Todos son de [DccHS], comentarios de 12-02-2025, **no reglamentarios**. Están leídos en imagen.

| # | Tema | ¿Hay comentario? | Contenido | Página |
|---|---|---|---|---|
| B9.1 | Dormitorios dobles / P | **Sí** | «Se considera que el dormitorio principal es doble y el resto de dormitorios, sencillos.» | p. 57 |
| B9.2 | Puerta a puerta | Sí | Es el sistema más eficiente; el DB quiere facilitar su implantación (B1.9) | p. 56 |
| B9.3 | Uso provisional de la reserva | Sí | Zona de paso, almacén de bicicletas, etc. (B2.2) | p. 57 |
| B9.4 | Recogida neumática | Sí | Ni almacén ni reserva para esas fracciones (B2.3) | p. 57 |
| B9.5 | Puertas del recorrido | Sí | El sentido de apertura puede no exigirse en la puerta de acceso general del edificio (B3.6) | p. 57 |
| B9.6 | Sótano (y, por extensión, garaje en sótano) | Sí, solo sótano | Válido con medio de transporte mecánico o rampa, si cumple 2.1.1 (B3.6). **El garaje no se nombra**: su encaje es INTERPRETACIÓN (B3.8, B4.12) | p. 57 |
| B9.7 | Unifamiliar | **No** (en HS 2) | Solo la analogía del comentario de HS 3 (B1.3) | — |
| B9.8 | Locales | **No** | B1.5 | — |
| B9.9 | Almacén o reserva compartidos | **No** | Solo el literal de 2.1 pto 2 (aisladas o agrupadas horizontalmente) | — |
| B9.10 | Superficie mínima del almacén | **No** | Solo el «manejo adecuado» del DB (B2.15) | — |

---

## Cifras que SÍ se pueden mostrar en la UI, con su cita

Cita base: «CTE DB-HS (consolidado 14-06-2022), Sección HS 2, ap. …».
- **2.1.2.1**: S = 0,8 · P · Σ(Tf · Gf · Cf · Mf); Gf 1,55 / 8,40 / 1,50 / 0,48 / 1,50; tabla 2.1 (Cf 0,0050 … 0,0027 para 120 … 1.100 l); Mf = 4 (varios), 1 (resto).
- **2.1.2.2**: SR = P · Σ(Ff · Mf); tabla 2.2 (0,039 / 0,060 / 0,005 / 0,012 / 0,038 m²/persona).
- **P / Pv** = sencillos + 2 · dobles, con «dormitorio principal doble, resto sencillos» rotulado «comentario del Ministerio (12-02-2025), no reglamentario».
- **2.1.1**: < 25 m (fuera del edificio); ≥ 1,20 m; estrechamientos ≥ 1 m y ≤ 45 cm; puertas manuales en el sentido de salida; pendiente ≤ 12 %; sin escalones.
- **2.1.3**: ≤ 30 °C; 100 lux a 1 m; 16 A 2p+T, UNE 20.315:2017; toma de agua y sumidero sifónico antimúridos; remisión a SI 1 ap. 2.
- **2.3**: C = CA · Pv (tabla 2.3: 7,80 / 3,00 / 10,85 / 3,36 / 10,50); ≥ 45 dm³ y ≥ 30 × 30 cm por fracción; ≤ 1,20 m; 30 cm de acabado impermeable.
- **Tablas 3.1 y 3.2** tal como se han transcrito.
- **HS 3 tabla 2.2**: 10 l/s por m² útil. **SI 1 tabla 2.1**: 5 / 15 / 30 m² construidos.

## Cifras que NO deben mostrarse

- **«HS 3, tabla 2.1»** para la ventilación del almacén: es la **tabla 2.2** (B4.10).
- **«Cf / Ff adimensionales»** (Apéndice B): son m²/l y m²/persona (B2.14).
- **«UNE 20.315:1994»** para el almacén: es 2017 (B4.5).
- **Una superficie mínima en m² «del DB»** para el almacén o la reserva: el DB no la fija (B2.15). Lo que se muestre de la tabla A.1 va rotulado como criterio.
- **Un 0,8 en SR**, o S y SR calculadas con la misma fórmula (B2.10, B2.13).
- **Tf de la tabla A.2 como exigencia del almacén**: son los valores que el DB usa para la reserva «a falta de datos reales» (B2.19).
- **«45 dm³ en total por vivienda»**: es por fracción (B6.6).
- **«≤ 25 m»**: es estricto, «menor que 25 m» (B3.1).
- **Dispensa de papel y vidrio en la unifamiliar sin almacén** (solo con espacio de reserva) (B6.4).
- **Residuos de los locales dentro de P** (B1.5).
- **Tabla 2.3 por posición** con el orden de la tabla 2.2: el orden de las filas es distinto (B6.3).

---

## Criterios de proyecto (lo que el DB no fija)

| # | Tema | Propuesta del encargo | Veredicto | Propuesta final | Por qué |
|---|---|---|---|---|---|
| K1 = (a) | Dormitorio doble / sencillo | El principal de cada vivienda, doble; los demás, sencillos, si no se indica | **VALIDADO, y mejor fundado de lo que dice el encargo**: no es un criterio propio, es **el comentario del Ministerio** (B2.18). **No es necesariamente del lado de la seguridad**: una vivienda con dos dormitorios dobles queda corta | Por defecto, el comentario («dormitorio principal doble, resto sencillos», rotulado como comentario no reglamentario y no como CRITERIO propio). Permitir marcar más dormitorios dobles por tipo de vivienda. Usar la misma regla para P y para Pv. Vivienda **sin dormitorio** (estudio o loft): Pv = 2, como si tuviera un dormitorio doble (CRITERIO, para que no salga Pv = 0) | [DccHS] p. 57; [REPO] (`dormitorios`, «El 1.º es el principal») |
| K2 = (b) | Sistema de recogida sin dato | Todas las fracciones con recogida centralizada en contenedores de calle de superficie → solo espacio de reserva | **VALIDADO como hipótesis por defecto**, con condiciones | Selector **por fracción**: puerta a puerta / contenedor de calle de superficie / contenedor soterrado / neumática. Por defecto, «superficie» en las cinco, con un aviso visible: «Hipótesis: sin dato del servicio municipal de recogida. Comprobar con el ayuntamiento (sistema por fracción, capacidad de los contenedores y periodo de recogida) y con la ordenanza municipal». Soterrado → ni almacén ni reserva (INTERPRETACIÓN, B2.4). Neumática → ni almacén ni reserva (comentario, B2.3). Consecuencia que la UI debe enseñar: sin almacén no se aplican 2.1.3 ni la tabla 3.1, y en la unifamiliar no hay dispensa de papel y vidrio (B6.4) | B2.1, B2.4, B2.3, B6.4 |
| K3 | Tf y CC en el almacén (puerta a puerta) | — | Nuevo | Datos del usuario por fracción (los da el servicio de recogida). Si faltan, precargar los de la tabla A.2 (Tf 7/2/1/7/7 y 330 l) rotulados «CRITERIO: valores del Apéndice A, tabla A.2, que el DB usa para la reserva a falta de datos reales» | B2.19 |
| K4 | Fracción no recogida por separado | — | Nuevo | En la vivienda, siempre cinco espacios (2.3 pto 1). En el almacén o la reserva, sumar su Gf (o su Ff) a «varios», con Mf = 4. Rotular como interpretación de la nota (1) de la tabla A.3. Alternativa más sencilla: calcular siempre las cinco fracciones | B2.21 |
| K5 | Contenedor de una capacidad que no está en la tabla 2.1 | — | Nuevo | No interpolar. Tomar el Cf de la capacidad **inmediatamente inferior** de la tabla (Cf mayor, del lado de la seguridad), o pedir SC al usuario y calcular Cf = SC/CC (A.1). Rotular como CRITERIO | Tabla 2.1; A.1 |
| K6 | «Manejo adecuado» | — | Nuevo | No hay mínimo numérico. Mostrar S o SR calculadas y, como referencia rotulada «CRITERIO», Σ SC de los contenedores previstos (tabla A.1). Recomendar el mayor de los dos. En la unifamiliar (SR ≈ 1,07 m² con P = 4), avisar de que la superficie calculada puede no bastar para maniobrar | B2.15 |
| K7 = (c) | Unifamiliar aislada: espacio de reserva dentro de la parcela | — | **VALIDADO**, con precisión | Dentro de la parcela, sea dentro del edificio (garaje, porche cerrado…) o fuera. Si queda **fuera del edificio**, a **< 25 m del acceso** (2.1.1 pto 1). Por 2.1 pto 1 la necesita aunque sea la única vivienda (B2.5). Si es un conjunto de unifamiliares, puede ser compartida (2.1 pto 2) | B2.5, B3.1 |
| K8 = (d) | Almacén o reserva en PB o en el garaje | — | **VALIDADO con condiciones** | Por defecto, **PB con salida directa a la calle**. En el **garaje** (incluido el del sótano) solo si: el recorrido hasta el punto de recogida exterior cumple 2.1.1 pto 2 (≥ 1,20 m, pendiente ≤ 12 %, sin escalones; si no, medio mecánico); el almacén tiene **ventilación propia** de 10 l/s·m² y no comparte la del garaje (B4.12); y, si S > 5 m² construidos, cumple SI 1 como local de riesgo especial (EI 120 en el sótano de un edificio de viviendas). Para el espacio de reserva, comprobar lo mismo «para cuando se construya el almacén», rotulado como interpretación (B3.7, B4.8, B4.15) | B3.6–B3.8, B4.10–B4.15 |
| K9 = (e) | Redondeo de S y SR a dos decimales hacia arriba | — | **VALIDADO** | Calcular sin redondear los factores intermedios (usar Ff de la tabla 2.2 tal cual, con tres decimales). Redondear **hacia arriba a 0,01 m²** solo el resultado (ejemplo: 8,5836 → 8,59 m²). Comparar con la superficie proyectada usando el valor ya redondeado. Para C, redondear hacia arriba a 0,1 dm³ antes de compararlo con 45 | El DB no fija el redondeo |
| K10 | Ampliaciones y reformas | — | Nuevo | Reforma o cambio de uso: «HS 2 no es de aplicación (ap. 1.1: edificios de viviendas de nueva construcción)». Ampliación: aplicar solo si crea un edificio de viviendas nuevo; si no, avisar y dejarlo como decisión. Rotular como CRITERIO | B1.6, B1.7 |
| K11 | Locales sin uso en un edificio de viviendas | — | Nuevo | Fuera de P. Frase: «Los locales se justificarán mediante estudio específico con el proyecto de actividad (HS 2 ap. 1.1 pto 2)». Recomendar, como CRITERIO, que el espacio de reserva no ocupe el local | B1.5 |
| K12 | Edificio solo de oficinas | — | Nuevo | Frase de B1: «estudio específico (ap. 1.1 pto 2)». Sin cálculo | B1.4 |

---

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Gf por fracción | DB-HS | Consolidado 14-06-2022 (RD 450/2022) | 2022-06-14 | HS 2 ap. 2.1.2.1 | — | codigotecnico.org · DBHS.pdf, p. 53 (imagen 200 ppp) |
| Factor de contenedor Cf | ídem | ídem | 2022-06-14 | HS 2 ap. 2.1.2.1 | Tabla 2.1 (= A.1, con SC) | ídem, pp. 53 y 59 |
| Mf | ídem | ídem | 2022-06-14 | HS 2 ap. 2.1.2.1 y 2.1.2.2 | — | ídem, pp. 53–54 |
| Factor de fracción Ff | ídem | ídem | 2022-06-14 | HS 2 ap. 2.1.2.2 | Tabla 2.2 (origen: A.2) | ídem, pp. 54 y 60 |
| Situación y recorrido | ídem | ídem | 2022-06-14 | HS 2 ap. 2.1.1 | — | ídem, p. 53 |
| Otras características del almacén | ídem | ídem | 2022-06-14 | HS 2 ap. 2.1.3 | — | ídem, p. 54 |
| Coeficiente de almacenamiento CA y mínimos | ídem | ídem | 2022-06-14 | HS 2 ap. 2.3 | Tabla 2.3 | ídem, pp. 56–57 |
| Mantenimiento | ídem | ídem | 2022-06-14 | HS 2 ap. 3 | Tablas 3.1 y 3.2 | ídem, pp. 57–58 |
| Dormitorio principal doble | DB-HS con comentarios | Comentarios 12-02-2025 (no reglamentario) | 2025-02-12 | HS 2 ap. 2.1.2.1, comentario a «P» | — | DccHS.pdf, p. 57 |

### Datos propuestos para `src/modules/hs2/tablas.ts`

Sigue el patrón `tablaCTE(procedencia, datos)` de `src/lib/cte/tabla.ts`. **No está aplicado ni compilado.** Todas las cifras están leídas en la imagen de [HS22].

```ts
import { tablaCTE } from "../../lib/cte/tabla";

const PROC_HS = {
  db: "DB-HS",
  edicion: "Consolidado 14-06-2022 (RD 450/2022)",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DBHS.pdf (cotejado en imagen a 200 ppp)",
} as const;

export type Fraccion = "papel" | "envases" | "organica" | "vidrio" | "varios";

/** Gf [dm³/(persona·día)] — HS 2 ap. 2.1.2.1 (p. 53). Mf — ídem y 2.1.2.2. */
export const FRACCIONES = tablaCTE(
  { ...PROC_HS, articulo: "HS 2 ap. 2.1.2.1 y 2.1.2.2" },
  {
    pagina: 53,
    Gf: { papel: 1.55, envases: 8.4, organica: 1.5, vidrio: 0.48, varios: 1.5 },
    Mf: { papel: 1, envases: 1, organica: 1, vidrio: 1, varios: 4 },
    /** Solo S (almacén). SR no lleva este factor. */
    factorAlmacen: 0.8,
  },
);

/** Tabla 2.1 (= A.1) — Cf [m²/l] y SC [m²] por capacidad del contenedor [l]. */
export const FACTOR_CONTENEDOR = tablaCTE(
  { ...PROC_HS, articulo: "HS 2 ap. 2.1.2.1", tabla: "Tabla 2.1 / A.1" },
  {
    pagina: 53,
    filas: [
      { capacidad_l: 120, Cf: 0.005, SC_m2: 0.6 },
      { capacidad_l: 240, Cf: 0.0042, SC_m2: 1.0 },
      { capacidad_l: 330, Cf: 0.0036, SC_m2: 1.2 },
      { capacidad_l: 600, Cf: 0.0033, SC_m2: 2.0 },
      { capacidad_l: 800, Cf: 0.003, SC_m2: 2.4 },
      { capacidad_l: 1100, Cf: 0.0027, SC_m2: 3.0 },
    ],
  },
);

/** Tabla 2.2 — Ff [m²/persona] (origen: tabla A.2, Tf 7/2/1/7/7 días y Cf 0,0036). */
export const FACTOR_FRACCION = tablaCTE(
  { ...PROC_HS, articulo: "HS 2 ap. 2.1.2.2", tabla: "Tabla 2.2" },
  {
    pagina: 54,
    Ff: { papel: 0.039, envases: 0.06, organica: 0.005, vidrio: 0.012, varios: 0.038 },
    /** Tabla A.2 (p. 60): solo para el CRITERIO K3; el DB los usa para la reserva. */
    TfA2_dias: { papel: 7, envases: 2, organica: 1, vidrio: 7, varios: 7 },
    CfA2: 0.0036,
  },
);

/** Ap. 2.1.1 — situación y recorrido del almacén (p. 53). */
export const RECORRIDO_ALMACEN = tablaCTE(
  { ...PROC_HS, articulo: "HS 2 ap. 2.1.1" },
  {
    pagina: 53,
    distanciaAccesoFuera_menorQue_m: 25, // estricto; solo si está fuera del edificio
    anchuraLibre_min_m: 1.2,
    estrechamiento_anchuraMin_m: 1.0,
    estrechamiento_longitudMax_m: 0.45,
    pendiente_max_pct: 12,
    escalones: false,
    puertasManuales: "sentido_salida" as const,
  },
);

/** Ap. 2.1.3 — otras características del almacén (p. 54). */
export const CARACTERISTICAS_ALMACEN = tablaCTE(
  { ...PROC_HS, articulo: "HS 2 ap. 2.1.3" },
  {
    pagina: 54,
    temperaturaInterior_max_C: 30,
    iluminacion_min_lux: 100,
    alturaMedida_m: 1,
    enchufe: "16A 2p+T según UNE 20.315:2017",
    tolva_lumenes: 1000,
  },
);

/** Tabla 2.3 — CA [dm³/persona] y mínimos de ap. 2.3 pto 4 (pp. 56–57). Asociar por clave, no por orden. */
export const ALMACENAMIENTO_INMEDIATO = tablaCTE(
  { ...PROC_HS, articulo: "HS 2 ap. 2.3", tabla: "Tabla 2.3" },
  {
    pagina: 56,
    CA: { envases: 7.8, organica: 3.0, papel: 10.85, vidrio: 3.36, varios: 10.5 },
    volumenMinPorFraccion_dm3: 45, // «igual o mayor que 45 dm³»
    plantaMinima_cm: [30, 30] as const, // «no menor que 30x30 cm»
    alturaPuntoMasAlto_max_m: 1.2,
    distanciaAcabadoImpermeable_cm: 30, // «a menos de 30 cm»
    enCocina: ["organica", "envases"] as const,
    /** Solo viviendas aisladas o agrupadas horizontalmente CON almacén de contenedores. */
    enAlmacenSiAislada: ["papel", "vidrio"] as const,
  },
);
```

---

## Pendientes

1. **BOE de las modificaciones de HS 2**: no se ha leído qué disposición introdujo «UNE 20.315:2017». Tampoco se sabe si la «1994» de 2.2.4 b) en [HS22] es un resto sin actualizar o el texto vigente ([DccHS] dice 2017). Al módulo no le afecta: no calcula bajantes.
2. **HS 3 ap. 3.1.2** (condiciones de ventilación del almacén de residuos: natural, híbrida o mecánica): no está verificado en el repo. Hace falta la imagen de su página en DBHS.pdf (en esta sesión no se ha podido renderizar el PDF).
3. **Ordenanzas municipales de residuos**: el DB remite al servicio de recogida (sistema por fracción, capacidad de los contenedores y periodo de recogida). Muchas ordenanzas añaden exigencias propias. No leídas.
4. **Ley 10/1998**, a la que remiten «Residuo» y «Residuos urbanos»: no se ha comprobado aquí su sucesión normativa ni si la ley vigente de residuos cambia las fracciones de recogida separada. Por la Introducción III del DB-HS, una disposición citada se entiende en su versión vigente. No afecta a las cifras de HS 2.
5. **Parte I del CTE, art. 2** (aplicación a intervenciones en edificios existentes): no leído. Afecta a K10.
6. **Criterios a validar por el responsable**: K1 (comentario por defecto y estudio con Pv = 2), K2 (hipótesis «superficie» por defecto; soterrado sin reserva), K4, K5, K6, K8 (garaje) y K9.
