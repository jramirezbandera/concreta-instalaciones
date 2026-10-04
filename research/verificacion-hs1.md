# Verificación normativa — HS 1 «Protección frente a la humedad» para el módulo HS1 (rediseño v4, feature-17)

**Fecha:** 2026-10-04 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** las 12 preguntas del encargo, en el mismo orden (bloques 1 a 12), más observaciones sobre lo que ya hay en `src/modules/hs1/` (`tipos.ts`, `partes.ts`) y en `FormDatosGeneralesPage.tsx`.

**Regla aplicada:** ninguna cifra se da por buena sin haberla leído. Las tablas se han transcrito **casilla a casilla contra la imagen** de cada página del PDF oficial, no contra el texto extraído. Veredictos:
- **VERIFICADO**: literal en el DB. Para las tablas: leído en la imagen de [HS22] y coincidente con el texto extraído de [HS22] y de [DccHS].
- **LEÍDO (1 fuente)**: literal en una sola fuente, o leído a través de un extractor intermedio.
- **CORREGIDO**: la afirmación del encargo o del repo no coincide con el DB.
- **NO VERIFICABLE**: el DB no lo dice, o no se ha podido leer con seguridad.
- **INTERPRETACIÓN**: lectura del texto que el DB no escribe tal cual pero que se sigue de él. Se puede mostrar, rotulada como tal.
- **CRITERIO**: decisión de proyecto propuesta. No es exigencia del CTE y la ficha debe rotularla así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [HS22] | DB-HS, Sección HS 1 | Texto consolidado «14 junio 2022» | `research/pdf/DBHS.pdf` (codigotecnico.org), pp. 10–51 | Tablas: imagen de cada página a 1080 px (`scratchpad/hs1/pNN.png`), casilla a casilla: 2.1 (p. 11), 2.2 (p. 12), 2.3 (p. 15), 2.4 (p. 16), 2.5 (pp. 18–19), 2.6 (p. 19), 2.7 (p. 20), 2.9 y 2.10 (p. 29), 3.1 y 3.2 (p. 38), 3.3 y 3.4 (p. 39), 6.1 (p. 45). Apéndice A (p. 49) y Apéndice C (p. 51) también en imagen. Prosa: texto extraído con PyMuPDF (`DBHS-HS1.txt`) |
| [DccHS] | DB-HS con comentarios del Ministerio | Articulado 14-06-2022; comentarios 12-02-2025 | `research/pdf/DccHS.pdf` | Solo en texto (`DccHS-HS1.txt`, `DccHS.txt`). Sin maqueta: no hay poppler y el PDF no se puede renderizar. Los comentarios se identifican porque son párrafos que no están en [HS22] |
| [BOE17] | Orden FOM/588/2017 (BOE-A-2017-7163) | Original | boe.es, HTML, vía extractor | Qué secciones del DB-HS modifica |
| [BOE19] | RD 732/2019 (BOE-A-2019-18528) | Original | boe.es, HTML, vía extractor | Ídem. El HTML llega **cortado** dentro del apartado «Doce» |
| [BOE22] | RD 450/2022 (BOE-A-2022-9848) | Original | boe.es, HTML, vía extractor | Ídem |
| [SEAE-sec] | DB SE-AE, Anejo D | — | Solo fragmento de buscador. El PDF de codigotecnico.org no lo lee el extractor | Presiones de las zonas A/B/C |
| [NMun] | Fichas por municipio de normatia.com | Consulta 2026-10-04 | Buscador | **No oficial**: agregador con IA (IDR §0, A5-04). Solo como indicio |
| [REPO] | `src/modules/hs1/tipos.ts`, `partes.ts`; `src/pages/FormDatosGeneralesPage.tsx`; `src/lib/edificio/casos.ts`; `feature-17.md` | Estado actual | repo | Lo que ya existe |

Avisos de los propios documentos:
- [DccHS] p. 2: «Los comentarios tienen un carácter orientativo e informativo no teniendo carácter reglamentario.»
- [DccHS] p. 11, comentario al ap. 2 «Diseño»: «Las soluciones constructivas recogidas en este apartado se consideran soluciones aceptadas, pero no obligatorias. Se pueden utilizar otras soluciones, siempre que éstas proporcionen las mismas prestaciones, de acuerdo con lo dispuesto en el artículo 5 del CTE.» Consecuencia para el módulo en la nota 9.

**Límites de la lectura:**
- Las figuras 2.4 y 2.5 son mapas pequeños. A 1080 px no se lee con seguridad la zona de una localidad junto a un límite (bloque 6).
- [DccHS] solo en texto: no se puede ver si una fila o un párrafo es articulado o comentario. Se deduce comparando con [HS22], que tiene el mismo articulado.
- BOE: leído a través de un extractor que resume. Las citas literales que devuelve son cortas.

---

## Bloque 1 — Ámbito (ap. 1.1) y procedimiento (ap. 1.2)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 1.1 | Qué elementos entran | VERIFICADO | Muros y suelos en contacto con el terreno; fachadas y cubiertas en contacto con el aire exterior; en todos los edificios del ámbito general del CTE | HS 1 · ap. 1.1 pto 1: «Esta sección se aplica a los muros y los suelos que están en contacto con el terreno y a los cerramientos que están en contacto con el aire exterior (fachadas y cubiertas) de todos los edificios incluidos en el ámbito de aplicación general del CTE.» | [HS22] p. 10; [DccHS] p. 10 |
| 1.2 | ¿Hay exclusiones por uso (garaje, trasteros)? | VERIFICADO: **no** | A diferencia de HS 6, no excluye locales no habitables. Los muros y el suelo de un sótano de garaje entran | ap. 1.1 pto 1 («de todos los edificios») | [HS22] |
| 1.3 | Suelos elevados | VERIFICADO | Son suelos en contacto con el terreno | ap. 1.1 pto 1: «Los suelos elevados se consideran suelos que están en contacto con el terreno.» | [HS22] |
| 1.4 | Medianerías descubiertas | VERIFICADO | Son fachadas, en dos casos | ap. 1.1 pto 1: «Las medianerías que vayan a quedar descubiertas porque no se ha edificado en los solares colindantes o porque la superficie de las mismas excede a las de las colindantes se consideran fachadas.» | [HS22] |
| 1.5 | Terrazas y balcones | VERIFICADO | Sus suelos son cubiertas | ap. 1.1 pto 1: «Los suelos de las terrazas y los de los balcones se consideran cubiertas.» | [HS22] |
| 1.6 | Condensaciones | VERIFICADO | Se comprueban por HE 1, no por HS 1 | ap. 1.1 pto 2: «La comprobación de la limitación de humedades de condensación superficiales e intersticiales debe realizarse según lo establecido en la Sección HE-1 Limitación de la demanda energética del DB HE Ahorro de energía.» | [HS22] |
| 1.6b | Cómo se comprueban (comentario) | LEÍDO (1 fuente, no reglamentario) | Según el DA DB-HE/2 | [DccHS] p. 10: «Desde de la aprobación del nuevo DB HE Ahorro de energía con fecha de septiembre de 2013, la comprobación de la limitación de las humedades producidas por condensación puede realizarse según lo establecido en DA DB-HE / 2 Comprobación de limitación de condensaciones superficiales e intersticiales en los cerramientos.» Y: «El DB HS 1 trata sobre las humedades producidas por filtración y condensación.» | [DccHS] |
| 1.6c | Título de HE 1 que cita el texto | **INTERPRETACIÓN** | «Limitación de la demanda energética» es el título antiguo de HE 1. En la memoria, citar la Sección HE 1 del DB-HE vigente (2019) sin copiar el título que trae el HS 1. El título vigente de HE 1 no se ha releído en esta sesión | ap. 1.1 pto 2 | [HS22] |
| 1.7 | Planta baja sin sótano: ¿tiene «muros en contacto con el terreno»? | **INTERPRETACIÓN**, con apoyo en el Apéndice A y en un comentario | Normalmente **solo suelo**. Las tres definiciones de muro del Apéndice A se refieren al vaciado «del sótano». El arranque de la fachada sobre la cimentación tiene su propio punto singular (2.3.3.2). El comentario a 2.2.1 da por hecho que hay edificios sin muros en contacto con el terreno. **Excepción**: si parte de la PB queda bajo la rasante exterior (semisótano, solar en pendiente), ese tramo es muro en contacto con el terreno | Apéndice A, «Muro flexorresistente» y «Muro de gravedad»: «Este tipo de muro se construye después de realizado el vaciado del terreno del sótano.» «Muro pantalla»: «El vaciado del terreno del sótano se realiza una vez construido el muro.» [DccHS] p. 16: «Cuando el edificio no tenga muros en contacto con el terreno, se utilizará la tabla correspondiente a muros flexorresistentes o de gravedad.» | [HS22] p. 48; [DccHS] |
| 1.8 | ¿Un forjado sanitario es «suelo elevado»? | **INTERPRETACIÓN** | El DB no usa la expresión «forjado sanitario». Es suelo elevado **si** (superficie de contacto con el terreno + superficie de apoyo) / superficie del suelo **< 1/7**. Un forjado sobre muretes o zapatas con cámara suele cumplirlo, pero es el proyectista quien lo comprueba | Apéndice A, «Suelo elevado»: «suelo situado en la base del edificio en el que la relación entre la suma de la superficie de contacto con el terreno y la de apoyo, y la superficie del suelo es inferior a 1/7.» | [HS22] p. 49 |
| 1.9 | Procedimiento | VERIFICADO | Seis pasos: diseño del ap. 2 (muros 2.1.1–2.1.3; suelos 2.2.1–2.2.3; fachadas 2.3.1–2.3.3; cubiertas 2.4.2–2.4.4); dimensionado del ap. 3 (tubos de drenaje, canaletas de los muros parcialmente estancos, bombas de achique); productos (ap. 4); construcción (ap. 5); mantenimiento (ap. 6) | ap. 1.2 ptos 1 a 6 | [HS22] pp. 10–11 |
| 1.10 | Los grados de elementos distintos no se comparan | VERIFICADO | Un grado 3 de muro no equivale a un grado 3 de fachada | Apéndice A, «Grado de impermeabilidad»: «La gradación se aplica a las soluciones de cada elemento constructivo de forma independiente a las de los demás elementos. Por lo tanto, las gradaciones de los distintos elementos no son necesariamente equivalentes: así, el grado 3 de un muro no tiene por qué equivaler al grado 3 de una fachada.» | [HS22] p. 47 |

**Nota 1.7 — qué debe deducir el módulo de El edificio.**
- Sótanos (niveles < 0): sus muros y el suelo del más bajo.
- PB sin sótano debajo: solo el suelo. Usa el bloque «Muro flexorresistente o de gravedad» de la tabla 2.4, según el comentario de [DccHS] p. 16 (no reglamentario).
- PB parcialmente enterrada o solar en pendiente: El edificio no lo describe. Mostrar un aviso revisable: «Si parte de la planta baja queda por debajo del terreno exterior, ese tramo es un muro en contacto con el terreno (HS 1 · ap. 1.1).»

---

## Bloque 2 — Muros: presencia de agua (ap. 2.1.1) y tabla 2.1

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 2.1 | De qué depende el grado del muro | VERIFICADO | De la presencia de agua y del coeficiente de permeabilidad del terreno (Ks), por la tabla 2.1 | ap. 2.1.1 pto 1: «El grado de impermeabilidad mínimo exigido a los muros que están en contacto con el terreno frente a la penetración del agua del terreno y de las escorrentías se obtiene en la tabla 2.1 en función de la presencia de agua y del coeficiente de permeabilidad del terreno.» | [HS22] p. 11 |
| 2.2 | Qué cota se compara con el freático | VERIFICADO | La **cara inferior del suelo en contacto con el terreno**, aunque se esté graduando el muro | ap. 2.1.1 pto 2 (nota 2.2) | [HS22] p. 11; [DccHS] p. 11 |
| 2.3 | Signos de las tres clases | VERIFICADO | Baja: cara inferior **por encima** del freático. Media: **a la misma profundidad** o **a menos de dos metros por debajo**. Alta: **a dos o más metros por debajo** | ap. 2.1.1 pto 2 a) b) c) | [HS22]; [DccHS] |
| 2.4 | Formalización (Δ = profundidad de la cara inferior − profundidad del freático, en m, ambas desde la superficie del terreno) | **INTERPRETACIÓN** (aritmética directa del literal) | Baja: Δ < 0. Media: 0 ≤ Δ < 2. Alta: Δ ≥ 2. Las tres clases cubren todos los casos, sin huecos ni solapes | ap. 2.1.1 pto 2 | — |
| 2.5 | Qué es el «nivel freático» | VERIFICADO | El **valor medio anual**, no el máximo estacional, medido desde la superficie del terreno | Apéndice A, «Nivel freático»: «valor medio anual de la profundidad con respecto a la superficie del terreno de la cara superior de la capa freática.» | [HS22] p. 48 |
| 2.6 | Umbrales de Ks en la tabla 2.1 | VERIFICADO (imagen; el texto extraído de [HS22] y de [DccHS] pierde los signos ≥ y ≤) | **Ks ≥ 10⁻² cm/s** · **10⁻⁵ < Ks < 10⁻² cm/s** · **Ks ≤ 10⁻⁵ cm/s**. Las tres columnas cubren todos los valores, sin huecos | Cabecera de la tabla 2.1 | [HS22] p. 11, imagen |
| 2.7 | Tabla 2.1 | VERIFICADO | Ver la transcripción siguiente | Tabla 2.1 «Grado de impermeabilidad mínimo exigido a los muros» | [HS22] imagen + texto; [DccHS] texto |
| 2.8 | Unidades de Ks | VERIFICADO | Tablas 2.1 y 2.3 en **cm/s**. Apéndice C en **m/s**. 10⁻² cm/s = 10⁻⁴ m/s; 10⁻⁵ cm/s = 10⁻⁷ m/s | Cabeceras de las tablas; Apéndice C, «Ks el coeficiente de permeabilidad del terreno, [m/s]»; Apéndice B: «[m/s ó cm/s]» | [HS22] pp. 11, 15, 50, 51 |
| 2.9 | Cómo se obtiene Ks | VERIFICADO | Por ensayo o **indirectamente** a partir de la granulometría y la porosidad | Apéndice A, «Coeficiente de permeabilidad»: «Puede determinarse directamente mediante ensayo en permeámetro o mediante ensayo in situ, o indirectamente a partir de la granulometría y la porosidad del terreno.» | [HS22] p. 46 |
| 2.10 | Repo, `tipos.ts` (`ClaseKs`) y `FormDatosGeneralesPage.tsx` (`KS_OPTIONS`) | VERIFICADO: coinciden | alto ≥ 10⁻²; medio 10⁻⁵ < Ks < 10⁻²; bajo ≤ 10⁻⁵ cm/s | — | [REPO] |
| 2.11 | Repo, `partes.ts` (`presenciaAguaDe`) | VERIFICADO en la clasificación; **INTERPRETACIÓN** en `no_detectado → baja` | La comparación (`bajo < 0` baja; `< 2` media; si no, alta) es la del literal. «No detectado» solo prueba que el freático está más hondo que el reconocimiento: equivale a «baja» si el reconocimiento llegó más abajo que la cara inferior del suelo | ap. 2.1.1 pto 2 | [REPO] |
| 2.12 | Repo, `ESPESOR_SUELO_CRITERIO_m = 0,30` | **CRITERIO** (ya declarado así en el repo) | El DB no da el espesor. Es correcto rotularlo como criterio. Añadir un aviso cuando Δ quede a menos de 0,30 m de un umbral (0 o 2 m) | — | [REPO] |
| 2.13 | Repo, ayuda del campo «Nivel freático» | **CORREGIDO** (texto de ayuda) | Añadir «valor medio anual» y «desde la superficie del terreno». La ayuda actual dice «desde la rasante (cota ±0,00)», que solo coincide si el terreno está a ±0,00 | Apéndice A | [REPO] |

**Nota 2.2 — ap. 2.1.1 pto 2, literal.** «La presencia de agua se considera
- a) baja cuando la cara inferior del suelo en contacto con el terreno se encuentra por encima del nivel freático;
- b) media cuando la cara inferior del suelo en contacto con el terreno se encuentra a la misma profundidad que el nivel freático o a menos de dos metros por debajo;
- c) alta cuando la cara inferior del suelo en contacto con el terreno se encuentra a dos o más metros por debajo del nivel freático.»

**Tabla 2.1 — Grado de impermeabilidad mínimo exigido a los muros** (HS 1 · ap. 2.1.1, [HS22] p. 11)

| Presencia de agua | Ks ≥ 10⁻² cm/s | 10⁻⁵ < Ks < 10⁻² cm/s | Ks ≤ 10⁻⁵ cm/s |
|---|---|---|---|
| Alta | 5 | 5 | 4 |
| Media | 3 | 2 | 2 |
| Baja | 1 | 1 | 1 |

Propiedades comprobadas (sirven para los tests de `feature-17`):
- Más presencia de agua nunca baja el grado.
- Más Ks nunca baja el grado.
- Con presencia **baja** el grado es 1 en las tres columnas: Ks no influye en el muro.

---

## Bloque 3 — Muros: tabla 2.2 y condiciones (ap. 2.1.2)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 3.1 | Cómo se lee la tabla | VERIFICADO | Entradas: tipo de muro, tipo de impermeabilización y grado. Casilla sombreada = no aceptable. Casilla en blanco = sin condición | ap. 2.1.2 pto 1: «Las condiciones exigidas a cada solución constructiva, en función del tipo de muro, del tipo de impermeabilización y del grado de impermeabilidad, se obtienen en la tabla 2.2. Las casillas sombreadas se refieren a soluciones que no se consideran aceptables y la casilla en blanco a una solución a la que no se le exige ninguna condición para los grados de impermeabilidad correspondientes.» | [HS22] p. 11 |
| 3.2 | Tabla 2.2 casilla a casilla | VERIFICADO | Ver la transcripción siguiente | Tabla 2.2 «Condiciones de las soluciones de muro» | [HS22] p. 12, imagen + texto; [DccHS] p. 12, texto |
| 3.3 | Casillas sombreadas | VERIFICADO | **4**: gravedad · imp. interior, filas ≤4 y ≤5; flexorresistente · imp. interior, filas ≤4 y ≤5 | — | [HS22] imagen |
| 3.4 | Casillas en blanco | VERIFICADO | **1**: pantalla · parcialmente estanco · ≤1. Coincide con el singular del texto («la casilla en blanco») | ap. 2.1.2 pto 1 | [HS22] imagen |
| 3.5 | Notas sobre el número de sótanos | VERIFICADO | ⁽³⁾ en gravedad · imp. interior · ≤2 y ≤3. ⁽²⁾ en flexorresistente · imp. interior · ≤3 (**no** en ≤2). ⁽¹⁾ en gravedad · parcialmente estanco · ≤5 | Pie de la tabla 2.2: «(1) Solución no aceptable para más de un sótano. (2) Solución no aceptable para más de dos sótanos. (3) Solución no aceptable para más de tres sótanos.» | [HS22] imagen + texto; [DccHS] |
| 3.6 | Cómo se aplica una nota | **INTERPRETACIÓN** | La casilla no es aceptable si el número de sótanos es **mayor que** 1, 2 o 3 según la nota. Ejemplo: «más de un sótano» = 2 o más | Pie de la tabla 2.2 | — |
| 3.7 | Qué fila se usa | **INTERPRETACIÓN** | La fila «≤ g», con g = grado exigido (tabla 2.1). El grado de la tabla 2.1 es «mínimo», así que la solución de una fila superior también vale. Pero el módulo no debe subir de fila por su cuenta | ap. 2.1.1 pto 1 («grado de impermeabilidad mínimo exigido»); ap. 2.1.2 pto 1 | — |
| 3.8 | ¿Cada fila contiene las condiciones de la anterior? | VERIFICADO: **no** | Ejemplo: gravedad · imp. interior, ≤1 «I2+D1+D5» y ≤2 «C3+I1+D1+D3»: D5 desaparece. Los tests no deben suponer que una fila superior incluye a la inferior | Tabla 2.2 | [HS22] |
| 3.9 | Tipos de muro | VERIFICADO | Ver la nota 3.9 | Apéndice A | [HS22] p. 48 |
| 3.10 | «Imp. interior» / «Imp. exterior» | VERIFICADO (no definidos) | Sin definición en el Apéndice A. El texto los usa como «el muro se impermeabilice por el interior / por el exterior» | ap. 2.1.3.1 ptos 1 y 3 | [HS22] p. 13 |
| 3.11 | Condiciones que solo se aplican a cierto material | VERIFICADO | C1 y C2: «cuando el muro se construya in situ». C3 e I3: «cuando el muro sea de fábrica». C1 solo vale para muros de hormigón in situ (comentario) | ap. 2.1.2 pto 2. [DccHS] p. 12, a C1: «Se refiere a muros in situ de hormigón. Para otros tipos de muros realizados in situ no se aplica esta condición.» | [HS22]; [DccHS] |
| 3.12 | I1 cumple I2 | VERIFICADO | I2 admite expresamente la solución de I1. Aquí el número **menor** satisface al mayor: es el texto de I2, no la regla de sustitución de fachadas (5.10) | I2: «La impermeabilización debe realizarse mediante la aplicación de una pintura impermeabilizante o según lo establecido en I1.» | [HS22] p. 12 |
| 3.13 | Los códigos son propios de cada tabla | VERIFICADO | D2, D3 y D4 de muros **no** son D2, D3 y D4 de suelos. Ejemplo: D4 de muro = canaletas; D4 de suelo = pozo drenante cada 800 m². Tampoco coinciden C1–C3, I1–I2 ni V1. El código necesita un diccionario por elemento | ap. 2.1.2 pto 2 y ap. 2.2.2 pto 2 | [HS22] |
| 3.14 | Condiciones C1–C3, I1–I3, D1–D5 y V1 | VERIFICADO | Ver la tabla de condiciones de muro | ap. 2.1.2 pto 2 | [HS22] pp. 12–13 |
| 3.15 | V1 y la ventilación del local (relación con HS 3) | **INTERPRETACIÓN** | V1 pide ventilar el local al que abren las aberturas con ≥ 0,7 l/s por m² útil. Si ese local es un garaje, su caudal de HS 3 se da por plaza: el módulo puede comparar los dos y avisar | V1; DB-HS 3, Tabla 2.2 (ver `verificacion-hs6-v4.md`, 5.3b) | [HS22] p. 13 |

**Tabla 2.2 — Condiciones de las soluciones de muro** ([HS22] p. 12). ▓ = casilla sombreada (no aceptable). «(en blanco)» = sin condición. ⁽ⁿ⁾ = nota del pie.

| Grado | Gravedad · imp. interior | Gravedad · imp. exterior | Gravedad · parc. estanco | Flexorresistente · imp. interior | Flexorresistente · imp. exterior | Flexorresistente · parc. estanco | Pantalla · imp. interior | Pantalla · imp. exterior | Pantalla · parc. estanco |
|---|---|---|---|---|---|---|---|---|---|
| ≤1 | I2+D1+D5 | I2+I3+D1+D5 | V1 | C1+I2+D1+D5 | I2+I3+D1+D5 | V1 | C2+I2+D1+D5 | C2+I2+D1+D5 | (en blanco) |
| ≤2 | C3+I1+D1+D3 ⁽³⁾ | I1+I3+D1+D3 | D4+V1 | C1+C3+I1+D1+D3 | I1+I3+D1+D3 | D4+V1 | C1+C2+I1 | C2+I1 | D4+V1 |
| ≤3 | C3+I1+D1+D3 ⁽³⁾ | I1+I3+D1+D3 | D4+V1 | C1+C3+I1+D1+D3 ⁽²⁾ | I1+I3+D1+D3 | D4+V1 | C1+C2+I1 | C2+I1 | D4+V1 |
| ≤4 | ▓ | I1+I3+D1+D3 | D4+V1 | ▓ | I1+I3+D1+D3 | D4+V1 | C1+C2+I1 | C2+I1 | D4+V1 |
| ≤5 | ▓ | I1+I3+D1+D2+D3 | D4+V1 ⁽¹⁾ | ▓ | I1+I3+D1+D2+D3 | D4+V1 | C1+C2+I1 | C2+I1 | D4+V1 |

Notas: ⁽¹⁾ «Solución no aceptable para más de un sótano.» ⁽²⁾ «… para más de dos sótanos.» ⁽³⁾ «… para más de tres sótanos.»

**Nota 3.9 — Apéndice A, literal.**
- «**Muro flexorresistente**: muro armado que resiste esfuerzos de compresión y de flexión. Este tipo de muro se construye después de realizado el vaciado del terreno del sótano.»
- «**Muro de gravedad**: muro no armado que resiste esfuerzos principalmente de compresión. Este tipo de muro se construye después de realizado el vaciado del terreno del sótano.»
- «**Muro pantalla**: muro armado que resiste esfuerzos de compresión y de flexión. Este tipo de muro se construye en el terreno mediante el vaciado del terreno exclusivo del muro y el consiguiente hormigonado in situ o mediante el hincado en el terreno de piezas prefabricadas. El vaciado del terreno del sótano se realiza una vez construido el muro.»
- «**Muro parcialmente estanco**: muro compuesto por una hoja exterior resistente, una cámara de aire y una hoja interior. El muro no se impermeabiliza sino que se permite el paso del agua del terreno hasta la cámara donde se recoge y se evacua.»
- Términos de las condiciones: «**Hormigón de consistencia fluida**: hormigón que, ensayado en la mesa de sacudidas, presenta un asentamiento comprendido entre el 70% y el 100%, que equivale aproximadamente a un asiento superior mayor que 20 cm en el cono de Abrams.» «**Pozo drenante**: pozo efectuado en el terreno con entibación perforada para permitir la llegada del agua del terreno circundante a su interior. El agua se extrae por bombeo.» «**Cámara de bombeo**: depósito o arqueta donde se acumula provisionalmente el agua drenada antes de su bombeo y donde están alojadas las bombas de achique, incluyendo las de reserva.»

**Condiciones de muro** (HS 1 · ap. 2.1.2 pto 2; [HS22] pp. 12–13). Resumen fiel de una línea; las cifras son literales.

| Código | Bloque | Resumen |
|---|---|---|
| C1 | Constitución | Si el muro se construye in situ, hormigón hidrófugo. Solo muros de hormigón in situ ([DccHS] p. 12) |
| C2 | Constitución | Si el muro se construye in situ, hormigón de consistencia fluida |
| C3 | Constitución | Si el muro es de fábrica, bloques o ladrillos hidrofugados y mortero hidrófugo |
| I1 | Impermeabilización | Lámina impermeabilizante o productos líquidos (polímeros acrílicos, caucho acrílico, resinas sintéticas o poliéster). En pantallas construidas con excavación, lodos bentoníticos. Por el interior: lámina **adherida**. Por el exterior: lámina adherida con capa antipunzonamiento en su cara exterior, o no adherida con capa antipunzonamiento en cada cara; la exterior se puede suprimir si hay lámina drenante. Líquidos: capa protectora exterior (geotextil o mortero armado), salvo lámina drenante en contacto directo |
| I2 | Impermeabilización | Pintura impermeabilizante o lo establecido en I1. En pantallas con excavación, lodos bentoníticos |
| I3 | Impermeabilización | Si el muro es de fábrica, revestimiento hidrófugo por la cara interior: mortero hidrófugo sin revestir, cartón-yeso sin yeso higroscópico u otro material no higroscópico |
| D1 | Drenaje | Capa drenante y capa filtrante entre el muro (o su impermeabilización) y el terreno: lámina drenante, grava, fábrica de bloques de arcilla porosos u otro material equivalente. Si es lámina, remate superior protegido de lluvia y escorrentías |
| D2 | Drenaje | Pozo drenante junto al muro **cada 50 m como máximo**, de **Ø interior ≥ 0,7 m**, con capa filtrante contra el arrastre de finos y **dos bombas de achique** hacia el saneamiento o a un sistema de reutilización |
| D3 | Drenaje | Tubo drenante en el arranque del muro, conectado al saneamiento o a reutilización. Si la conexión queda por encima de la red de drenaje: al menos una cámara de bombeo con dos bombas de achique |
| D4 | Drenaje | Canaletas de recogida en la cámara del muro, conectadas al saneamiento o a reutilización. Si la conexión queda por encima de las canaletas: al menos una cámara de bombeo con dos bombas de achique |
| D5 | Drenaje | Red de evacuación del agua de lluvia en las partes de la cubierta y del terreno que puedan afectar al muro, conectada al saneamiento o a reutilización |
| V1 | Ventilación de la cámara | Aberturas en el arranque y en la coronación de la hoja interior, repartidas al 50 % (abajo y arriba junto al techo), regulares y al tresbolillo. Fórmula (2.1): **10 < Ss/Ah < 30** (Ss en cm², Ah en m²). Distancia entre aberturas contiguas **≤ 5 m**. El local al que abren se ventila con **≥ 0,7 l/s por m² útil** |

Comentarios de [DccHS] a estas condiciones (pp. 12–13, no reglamentarios):
- A I1: «Entre las soluciones que pueden utilizarse también como impermeabilizantes, se encuentran las barreras geosintéticas expansivas, tales como la bentonita de sodio. Otras soluciones pueden ser las inyecciones por el extradós del muro.»
- A la lámina interior adherida: «tiene como objetivo que soporte una presión hidrostática negativa, siendo posible otras soluciones.»
- A D1: «La grava no se utiliza en el caso de empleo de manta de bentonita de sodio porque imposibilita su confinamiento.»
- A D2–D4: «Por motivos de sostenibilidad es preferible la reutilización del agua drenada en D2, D3 y D4.»

---

## Bloque 4 — Suelos: tablas 2.3 y 2.4 (ap. 2.2)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 4.1 | De qué depende el grado del suelo | VERIFICADO | De la presencia de agua (definida en 2.1.1) y de Ks, por la tabla 2.3 | ap. 2.2.1 pto 1: «… se obtiene en la tabla 2.3 en función de la presencia de agua determinada de acuerdo con 2.1.1 y del coeficiente de permeabilidad del terreno.» | [HS22] p. 15 |
| 4.2 | Umbral de Ks en la tabla 2.3 | VERIFICADO (imagen) | Dos columnas: **Ks > 10⁻⁵ cm/s** y **Ks ≤ 10⁻⁵ cm/s**. La primera reúne las clases «alto» y «medio» de la 2.1 | Cabecera de la tabla 2.3 | [HS22] p. 15, imagen |
| 4.3 | Tabla 2.3 | VERIFICADO | Ver la transcripción | Tabla 2.3 «Grado de impermeabilidad mínimo exigido a los suelos» | [HS22] imagen + texto; [DccHS] |
| 4.4 | Cómo se lee la tabla 2.4 | VERIFICADO | Entradas: tipo de muro, tipo de suelo, tipo de intervención en el terreno y grado. Sombreada = no aceptable; en blanco = sin condición | ap. 2.2.2 pto 1 (mismo texto que 3.1, en plural: «las casillas en blanco») | [HS22] p. 15 |
| 4.5 | Tabla 2.4 casilla a casilla | VERIFICADO | Ver las dos transcripciones siguientes | Tabla 2.4 «Condiciones de las soluciones de suelo» | [HS22] p. 16, imagen + texto; [DccHS] p. 17, texto |
| 4.6 | Casillas raras que hay que copiar tal cual | VERIFICADO (literal) + **posible errata** (sin comentario del Ministerio) | Flexorresistente o gravedad · placa · sin intervención · ≤3 = «C1+C2+I2+D1+D2+S1+S2+S3»: **sin C3**, aunque ≤2 y ≤4 lo llevan. Pantalla · solera · sin intervención · ≤4 = «C1+C3+I1+D2+D3+P1+S2+S3»: **sin C2 ni D1**, que sí están en ≤3 y ≤5. Las dos aparecen igual en [HS22] y [DccHS]. Se codifican como están | Tabla 2.4 | [HS22]; [DccHS] |
| 4.7 | ¿Cada fila contiene las condiciones de la anterior? | VERIFICADO: **no** | Ejemplos: pantalla · placa · sub-base, ≤3 «C1+C2+C3+D1+D2+D4+P2+S2+S3» y ≤4 «C2+C3+S2+S3». Flexorresistente o gravedad · solera · sub-base, ≤3 lleva C1 y ≤4 no | Tabla 2.4 | [HS22] |
| 4.8 | Definiciones | VERIFICADO | Ver la nota 4.8. «Sin intervención» no está definida: es no actuar sobre el terreno | Apéndice A | [HS22] pp. 47–49 |
| 4.9 | Suelo sin muro (PB apoyada en el terreno, sin sótano) | LEÍDO (1 fuente, comentario no reglamentario) | Bloque «Muro flexorresistente o de gravedad» de la tabla 2.4 | [DccHS] p. 16: «Cuando el edificio no tenga muros en contacto con el terreno, se utilizará la tabla correspondiente a muros flexorresistentes o de gravedad.» | [DccHS] |
| 4.10 | Condiciones que nombran el muro (I2, S1, S3, P1, P2, D3) en un suelo sin muro | **INTERPRETACIÓN** + aviso | En las filas ≤1 y ≤2 de ese bloque **no aparece ninguna** (solo C2, C3, D1 y V1). Esas filas son las que salen con presencia baja (grado 1 o 2). Desde ≤3 sí aparecen. Propuesta: aplicarlas a la cimentación perimetral (zapata corrida, viga riostra o murete) y mostrar un aviso revisable | Tabla 2.4 | [HS22] |
| 4.11 | Sótano: ¿qué bloque de la 2.4? | **INTERPRETACIÓN** | El del tipo de muro elegido para los muros del sótano | ap. 2.2.2 pto 1 («en función del tipo de muro») | — |
| 4.12 | Condiciones de suelo | VERIFICADO | Ver la tabla de condiciones de suelo | ap. 2.2.2 pto 2 | [HS22] pp. 16–17 |
| 4.13 | Forjado sanitario | Ver 1.8 | Columna «Suelo elevado» y condición V1 de suelos, si cumple la relación < 1/7 | Apéndice A | [HS22] |

**Tabla 2.3 — Grado de impermeabilidad mínimo exigido a los suelos** ([HS22] p. 15)

| Presencia de agua | Ks > 10⁻⁵ cm/s | Ks ≤ 10⁻⁵ cm/s |
|---|---|---|
| Alta | 5 | 4 |
| Media | 4 | 3 |
| Baja | 2 | 1 |

Propiedades comprobadas: más presencia de agua o más Ks nunca bajan el grado. Con presencia baja, Ks **sí** influye (2 o 1).

**Tabla 2.4 — Condiciones de las soluciones de suelo** ([HS22] p. 16). Por legibilidad está traspuesta: cada fila es una columna del DB (tipo de suelo · intervención) y cada columna, una fila de grado. ▓ = sombreada; «(en blanco)» = sin condición. El orden de los códigos dentro de cada casilla es el del DB.

*Bloque «Muro flexorresistente o de gravedad»*

| Suelo · intervención | ≤1 | ≤2 | ≤3 | ≤4 | ≤5 |
|---|---|---|---|---|---|
| Elevado · sub-base | (en blanco) | C2 | I2+S1+S3+V1 | I2+S1+S3+V1 | I2+S1+S3+V1+D3 |
| Elevado · inyecciones | (en blanco) | (en blanco) | I2+S1+S3+V1 | I2+S1+S3+V1+D4 | I2+P1+S1+S3+V1+D3 |
| Elevado · sin intervención | V1 | V1 | I2+S1+S3+V1+D3+D4 | ▓ | ▓ |
| Solera · sub-base | (en blanco) | C2+C3 | C1+C2+C3+I2+D1+D2+S1+S2+S3 | C2+C3+I2+D1+D2+P2+S1+S2+S3 | C2+C3+I2+D1+D2+P2+S1+S2+S3 |
| Solera · inyecciones | D1 | C2+C3+D1 | C1+C2+C3+I2+D1+D2+S1+S2+S3 | C2+C3+I2+D1+D2+P2+S1+S2+S3 | C2+C3+I1+I2+D1+D2+P1+P2+S1+S2+S3 |
| Solera · sin intervención | C2+C3+D1 | C2+C3+D1 | C2+C3+I2+D1+D2+C1+S1+S2+S3 | C1+C2+C3+I1+I2+D1+D2+D3+D4+P1+P2+S1+S2+S3 | ▓ |
| Placa · sub-base | (en blanco) | C2+C3 | C2+C3+I2+D1+D2+C1+S1+S2+S3 | C2+C3+I2+D1+D2+P2+S1+S2+S3 | C2+C3+D1+D2+I2+P2+S1+S2+S3 |
| Placa · inyecciones | D1 | C2+C3+D1 | C1+C2+C3+I2+D1+D2+S1+S2+S3 | C2+C3+I2+D1+D2+P2+S1+S2+S3 | C2+C3+I1+I2+D1+D2+P1+P2+S1+S2+S3 |
| Placa · sin intervención | C2+C3+D1 | C2+C3+D1 | C1+C2+I2+D1+D2+S1+S2+S3 (sin C3, ver 4.6) | C1+C2+C3+D1+D2+D3+D4+I1+I2+P1+P2+S1+S2+S3 | C1+C2+C3+I1+I2+D1+D2+D3+D4+P1+P2+S1+S2+S3 |

- Sombreadas (3): elevado · sin intervención ≤4 y ≤5; solera · sin intervención ≤5.
- En blanco (5): ≤1 elevado · sub-base, elevado · inyecciones, solera · sub-base y placa · sub-base; ≤2 elevado · inyecciones.

*Bloque «Muro pantalla»*

| Suelo · intervención | ≤1 | ≤2 | ≤3 | ≤4 | ≤5 |
|---|---|---|---|---|---|
| Elevado · sub-base | (en blanco) | (en blanco) | S3+V1 | S3+V1 | S3+V1 |
| Elevado · inyecciones | (en blanco) | (en blanco) | S3+V1 | D4+S3+V1 | D3+D4+S3+V1 |
| Elevado · sin intervención | V1 | V1 | S3+V1 | D3+D4+S3+V1 | ▓ |
| Solera · sub-base | (en blanco) | C2+C3 | C1+C2+C3+D1+P2+S2+S3 | C2+C3+D1+S2+S3 | C2+C3+D1+P2+S2+S3 |
| Solera · inyecciones | D1 | C2+C3+D1 | C1+C2+C3+D1+P2+S2+S3 | C2+C3+D1+S2+S3 | C2+C3+D1+P2+S2+S3 |
| Solera · sin intervención | C2+C3+D1 | C2+C3+D1 | C1+C2+C3+D1+D4+P2+S2+S3 | C1+C3+I1+D2+D3+P1+S2+S3 (sin C2 ni D1, ver 4.6) | C1+C2+C3+I1+D1+D2+D3+D4+P1+P2+S2+S3 |
| Placa · sub-base | (en blanco) | C2+C3 | C1+C2+C3+D1+D2+D4+P2+S2+S3 | C2+C3+S2+S3 | C2+C3+P2+S2+S3 |
| Placa · inyecciones | (en blanco) | C2+C3+D1 | C1+C2+C3+D1+D2+P2+S2+S3 | C2+C3+D1+D2+S2+S3 | C2+C3+D1+D2+P2+S2+S3 |
| Placa · sin intervención | C2+C3+D1 | C2+C3+D1 | C1+C2+C3+D1+D2+D3+D4+P2+S2+S3 | C1+C2+C3+I1+D1+D2+D3+D4+P1+S2+S3 | C1+C2+C3+I1+D1+D2+D3+D4+P1+P2+S2+S3 |

- Sombreada (1): elevado · sin intervención ≤5. A diferencia del otro bloque, solera · sin intervención ≤5 **no** está sombreada.
- En blanco (7): ≤1 elevado · sub-base, elevado · inyecciones, solera · sub-base, placa · sub-base y placa · inyecciones; ≤2 elevado · sub-base y elevado · inyecciones.

**Nota 4.8 — Apéndice A, literal.**
- «**Suelo elevado**: suelo situado en la base del edificio en el que la relación entre la suma de la superficie de contacto con el terreno y la de apoyo, y la superficie del suelo es inferior a 1/7.»
- «**Solera**: capa gruesa de hormigón apoyada sobre el terreno, que se dispone como pavimento o como base para un solado.»
- «**Placa**: solera armada para resistir mayores esfuerzos de flexión como consecuencia, entre otros, del empuje vertical del agua freática.»
- «**Sub-base**: capa de bentonita de sodio sobre hormigón de limpieza dispuesta debajo del suelo.»
- «**Inyección**: técnica de recalce consistente en el refuerzo o consolidación de un terreno de cimentación mediante la introducción en él a presión de un mortero de cemento fluido con el fin de que rellene los huecos existentes.»
- «**Encachado**: capa de grava de diámetro grande que sirve de base a una solera apoyada en el terreno con el fin de dificultar la ascensión del agua del terreno por capilaridad a ésta.»

**Condiciones de suelo** (HS 1 · ap. 2.2.2 pto 2; [HS22] pp. 16–17)

| Código | Bloque | Resumen |
|---|---|---|
| C1 | Constitución | Si el suelo se construye in situ, hormigón hidrófugo de elevada compacidad |
| C2 | Constitución | Si el suelo se construye in situ, hormigón de retracción moderada |
| C3 | Constitución | Hidrofugación complementaria: producto líquido colmatador de poros sobre la superficie terminada |
| I1 | Impermeabilización | Lámina exterior sobre la capa base de regulación del terreno. Adherida: capa antipunzonamiento encima. No adherida: capa antipunzonamiento en ambas caras. En placa, lámina **doble** («formada por dos capas», [DccHS] p. 18) |
| I2 | Impermeabilización | Lámina sobre el hormigón de limpieza en la base de la zapata (muro flexorresistente) o del muro (gravedad), con las mismas capas antipunzonamiento; sellar su encuentro con la lámina del suelo |
| D1 | Drenaje | Capa drenante y capa filtrante sobre el terreno bajo el suelo. Si la capa drenante es un encachado, lámina de polietileno encima |
| D2 | Drenaje | Tubos drenantes en el terreno bajo el suelo, conectados al saneamiento o a reutilización. Si la conexión queda por encima de la red de drenaje: al menos una cámara de bombeo con dos bombas de achique |
| D3 | Drenaje | Tubos drenantes en la base del muro, con la misma conexión y el mismo bombeo. Con muro pantalla, **a 1 m por debajo del suelo**, repartidos uniformemente junto al muro |
| D4 | Drenaje | **Un pozo drenante por cada 800 m²** bajo el suelo, de **Ø interior ≥ 70 cm**, con envolvente filtrante, **dos bombas de achique**, conexión de evacuación y dispositivo automático de achique permanente |
| P1 | Tratamiento perimétrico | Tratar el terreno del perímetro del muro para limitar el agua superficial: acera, zanja drenante u otro elemento equivalente |
| P2 | Tratamiento perimétrico | Encastrar el borde de la placa o de la solera en el muro |
| S1 | Sellado | Sellar los encuentros de las láminas del muro con las del suelo y con las de la base de las cimentaciones en contacto con el muro |
| S2 | Sellado | Sellar todas las juntas del suelo con banda de PVC o con perfiles de caucho expansivo o de bentonita de sodio |
| S3 | Sellado | Sellar los encuentros suelo–muro con banda de PVC o con perfiles de caucho expansivo o de bentonita de sodio, según 2.2.3.1 |
| V1 | Ventilación de la cámara | Ventilar al exterior el espacio entre el suelo elevado y el terreno, con aberturas repartidas al 50 % entre dos paredes enfrentadas, regulares y al tresbolillo. Fórmula (2.2): **10 < Ss/As < 30** (Ss en cm², As en m²). Distancia entre aberturas contiguas **≤ 5 m** |

Comentario de [DccHS] p. 18 a I1 e I2: también valen «las barreras geosintéticas expansivas, tales como la bentonita de sodio».

---

## Bloque 5 — Fachadas (ap. 2.3)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 5.1 | De qué depende el grado de la fachada | VERIFICADO | De la zona pluviométrica de promedios (figura 2.4) y del grado de exposición al viento (tabla 2.6), por la tabla 2.5 | ap. 2.3.1 pto 1 y a) | [HS22] p. 18 |
| 5.2 | Tabla 2.5 | VERIFICADO | Ver la transcripción | Tabla 2.5 | [HS22] p. 19, imagen + texto; [DccHS] p. 20 |
| 5.3 | De qué depende la exposición al viento | VERIFICADO | De la altura de coronación del edificio sobre el terreno, de la zona eólica (figura 2.5) y de la clase del entorno | ap. 2.3.1 pto 1 b) | [HS22] p. 18 |
| 5.4 | Tabla 2.6 | VERIFICADO | Ver la transcripción. La primera fila es «**≤15**»: el texto extraído pierde el «≤», la imagen lo muestra | Tabla 2.6 | [HS22] p. 19, imagen |
| 5.5 | Nota (1) de la tabla 2.6 | VERIFICADO | Va en la fila «41 – 100». Para > 100 m o junto a un desnivel muy pronunciado, la exposición se estudia con el DB SE-AE | «(1) Para edificios de más de 100 m de altura y para aquellos que están próximos a un desnivel muy pronunciado, el grado de exposición al viento debe ser estudiada según lo dispuesto en el DB-SE-AE.» | [HS22] p. 19 |
| 5.6 | Definición de «altura de coronación del edificio sobre el terreno» | **NO VERIFICABLE**: el DB no la define | La expresión solo aparece en el ap. 2.3.1 b). La tabla dice «Altura del edificio en m». No está en el Apéndice A ni la comenta [DccHS] | ap. 2.3.1 b); tabla 2.6 | [HS22]; búsqueda en el texto de HS 1 |
| 5.6b | Cómo medirla | **INTERPRETACIÓN** + **CRITERIO** | Distancia vertical del terreno exterior a la coronación (remate superior) del edificio. Criterio propuesto: hasta lo más alto del cerramiento de fachada (peto incluido); en solar en pendiente, desde el punto más bajo del terreno junto a la fachada. Hoy el repo (`partes.ts`) toma la cara superior del forjado de cubierta porque El edificio no describe petos. Vale como criterio declarado, con un aviso si un peto podría pasarla de 15 o 40 m (ver «Para el código») | — | — |
| 5.7 | Alturas entre 15 y 16 m, o entre 40 y 41 m | **INTERPRETACIÓN** | Leer las filas como intervalos continuos: h ≤ 15 · 15 < h ≤ 40 · 40 < h ≤ 100. Coincide con la lectura más prudente, porque la fila siguiente siempre da una exposición igual o mayor. Nunca tratar 15,5 m como «fuera de tabla» | Filas «≤15», «16 - 40», «41 – 100» | — |
| 5.8 | Clase del entorno | VERIFICADO | E0 con terreno tipo I, II o III; E1 en los demás casos (IV y V) | ap. 2.3.1 b): «… y de la clase del entorno en el que está situado el edificio que será E0 cuando se trate de un terreno tipo I, II o III y E1 en los demás casos, según la clasificación establecida en el DB SE:» | [HS22] p. 18 |
| 5.9 | Terrenos tipo I a V | VERIFICADO | Ver la nota 5.9 | ap. 2.3.1 b) | [HS22] p. 18 |
| 5.10 | Regla de sustitución | VERIFICADO (literal) | Ver la nota 5.10. **Solo fachadas.** En muros (2.1.2 pto 2) y suelos (2.2.2 pto 2) el párrafo equivalente dice solo «A continuación se describen las condiciones agrupadas en bloques homogéneos.», sin la frase de sustitución. Allí los números no son niveles (C1 hidrófugo, C2 fluido, C3 fábrica), y la única equivalencia literal es I1 → I2 en muros (3.12) | ap. 2.3.2 pto 2; ap. 2.1.2 pto 2; ap. 2.2.2 pto 2 | [HS22] pp. 12, 16, 20 |
| 5.11 | Tabla 2.7 | VERIFICADO | Ver la transcripción. «R1+C1⁽¹⁾» es **una sola casilla** que ocupa las filas ≤1 y ≤2 de «con revestimiento» (imagen: sin raya entre ambas y el texto centrado entre las dos) | Tabla 2.7 | [HS22] p. 20, imagen + texto; [DccHS] p. 21 |
| 5.12 | Casillas con varias opciones | VERIFICADO | En algunas casillas hay una sola solución; en otras, varias alternativas y se elige una | ap. 2.3.2 pto 1: «En algunos casos estas condiciones son únicas y en otros se presentan conjuntos optativos de condiciones.» | [HS22] p. 20 |
| 5.13 | Nota (1) de la tabla 2.7 | VERIFICADO | Va en cinco opciones: con revestimiento ≤1/≤2 «R1+C1», ≤4 «R2+C1»; sin revestimiento ≤1 «C1+J1+N1», ≤2 «C1+H1+J2+N2». En fachada de una sola hoja, C1 pasa a C2 | «(1) Cuando la fachada sea de una sóla hoja, debe utilizarse C2.» | [HS22] p. 20 |
| 5.14 | Condiciones R1–R3, B1–B3, C1–C2, H1, J1–J2, N1–N2 | VERIFICADO | Ver la tabla de condiciones de fachada | ap. 2.3.2 pto 2 | [HS22] pp. 20–23 |
| 5.15 | ¿Qué es «revestimiento exterior»? | VERIFICADO (definiciones) | «Revestimiento exterior: revestimiento de la fachada dispuesto en la cara exterior de la misma.» «Revestimiento continuo: … se aplica en forma de pasta fluida directamente sobre la superficie que se reviste. Puede ser a base de morteros hidráulicos, plástico o pintura.» «Revestimiento discontinuo: … a partir de piezas (baldosas, lamas, placas, etc.) … pegado o fijado mecánicamente.» | Apéndice A | [HS22] p. 48 |
| 5.16 | Fachada ventilada | **INTERPRETACIÓN** (lectura directa; el DB no usa la expresión) | **Con revestimiento exterior** discontinuo fijado mecánicamente: R3 si son escamas, lamas, placas o «sistemas derivados … y un aislamiento térmico», o R2 si son piezas rígidas. La cámara ventilada con aislante no hidrófilo es **B3** si cumple 3–10 cm y ≥ 120 cm² por 10 m² | R2; R3, guion 2; B3 | [HS22] pp. 21–22 |
| 5.17 | SATE | **INTERPRETACIÓN** (lectura directa) | **Con revestimiento exterior** continuo. R1 describe ese caso («cuando se dispone en fachadas con el aislante por el exterior de la hoja principal … armadura … malla de fibra de vidrio o de poliéster»). El aislante no hidrófilo por el exterior es **B2**. R3 solo si el revestimiento cumple las condiciones de R3 | R1; B2; ap. 4.1.3: «Cuando el aislante térmico se disponga por el exterior de la hoja principal, debe ser no hidrófilo.» | [HS22] pp. 21–22, 40 |
| 5.18 | Monocapa | **INTERPRETACIÓN** | **Con revestimiento exterior** continuo de mortero. Alcanza R1 si tiene 10–15 mm y el resto de condiciones de R1 | R1; Apéndice A, «Revestimiento continuo» | — |
| 5.19 | Ladrillo cara vista | **INTERPRETACIÓN** (casi literal) | **Sin revestimiento exterior**: el propio ladrillo es la hoja principal | ap. 4.1.2 pto 3: «Cuando la hoja principal sea de ladrillo o de bloque sin revestimiento exterior, los ladrillos y los bloques deben ser caravista.» | [HS22] p. 40 |
| 5.20 | Revestimiento que no llega a R1 (p. ej. solo pintura) | **CRITERIO** | Es «revestimiento» por definición, pero todas las opciones de «con revestimiento» piden R1 o más, o B3. Propuesta: justificarla por la columna «sin revestimiento» | Tabla 2.7; Apéndice A | — |
| 5.21 | Punto singular que depende del grado | VERIFICADO | Con **grado 5** y carpintería retranqueada: precerco y barrera impermeable en las jambas, prolongada 10 cm hacia el interior | ap. 2.3.3.6 pto 1: «Cuando el grado de impermeabilidad exigido sea igual a 5, si las carpinterías están retranqueadas respecto del paramento exterior de la fachada, debe disponerse precerco y debe colocarse una barrera impermeable en las jambas entre la hoja principal y el precerco, o en su caso el cerco, prolongada 10 cm hacia el interior del muro» | [HS22] p. 26 |
| 5.22 | Zonas pluviométricas en el Apéndice A | VERIFICADO (literal), con **dos incoherencias del DB** | I: p > 2000 mm · II: 1000 < p ≤ 2000 · III: 500 < p ≤ 1000 · IV: 300 < p ≤ 500 · V: p < 300. (a) p = 300 mm no cae en ninguna zona. (b) El «índice pluviométrico anual» se define como un cociente sin unidades, pero las zonas se dan en mm. No afecta: la zona se lee en el mapa | Apéndice A, «Zona pluviométrica de promedios» e «Índice pluviométrico anual: para un año dado, es el cociente entre la precipitación media y la precipitación media anual de la serie.» | [HS22] pp. 47, 49 (imagen) |

**Tabla 2.5 — Grado de impermeabilidad mínimo exigido a las fachadas** ([HS22] pp. 18–19)

| Exposición al viento | Zona I | Zona II | Zona III | Zona IV | Zona V |
|---|---|---|---|---|---|
| V1 | 5 | 5 | 4 | 3 | 2 |
| V2 | 5 | 4 | 3 | 3 | 2 |
| V3 | 5 | 4 | 3 | 2 | 1 |

**Tabla 2.6 — Grado de exposición al viento** ([HS22] p. 19)

| Altura del edificio [m] | E1 · A | E1 · B | E1 · C | E0 · A | E0 · B | E0 · C |
|---|---|---|---|---|---|---|
| ≤15 | V3 | V3 | V3 | V2 | V2 | V2 |
| 16 - 40 | V3 | V2 | V2 | V2 | V2 | V1 |
| 41 – 100 ⁽¹⁾ | V2 | V2 | V2 | V1 | V1 | V1 |

Propiedades comprobadas en 2.5 y 2.6 (para los tests):
- La exposición crece de V3 a V1, y V1 da el grado mayor.
- Más altura, entorno E0 frente a E1 o zona eólica más alta (A → C) nunca bajan la exposición.
- Una zona pluviométrica más lluviosa (V → I) nunca baja el grado.
- **Con h ≤ 15 m la zona eólica no influye**: E1 da V3 y E0 da V2 en las tres zonas.

**Nota 5.9 — terrenos tipo, literal (ap. 2.3.1 b).**
- «Terreno tipo I: Borde del mar o de un lago con una zona despejada de agua en la dirección del viento de una extensión mínima de 5 km.»
- «Terreno tipo II: Terreno rural llano sin obstáculos ni arbolado de importancia.»
- «Terreno tipo III: Zona rural accidentada o llana con algunos obstáculos aislados tales como árboles o construcciones pequeñas.»
- «Terreno tipo IV: Zona urbana, industrial o forestal.»
- «Terreno tipo V: Centros de negocio de grandes ciudades, con profusión de edificios en altura.»

**Nota 5.10 — ap. 2.3.2 pto 2, literal.** «A continuación se describen las condiciones agrupadas en bloques homogéneos. En cada bloque el número de la denominación de la condición indica el nivel de prestación de tal forma que un número mayor corresponde a una prestación mejor, por lo que cualquier condición puede sustituir en la tabla a las que tengan el número de denominación más pequeño de su mismo bloque.» Consecuencia: R3 sustituye a R2 y R1; B3 a B2 y B1; C2 a C1; J2 a J1; N2 a N1. H solo tiene H1.

**Tabla 2.7 — Condiciones de las soluciones de fachada** ([HS22] p. 20). Opciones separadas por « · ».

| Grado | Con revestimiento exterior | Sin revestimiento exterior |
|---|---|---|
| ≤1 | R1+C1⁽¹⁾ (casilla única para ≤1 y ≤2) | C1⁽¹⁾+J1+N1 |
| ≤2 | (la misma casilla: R1+C1⁽¹⁾) | B1+C1+J1+N1 · C2+H1+J1+N1 · C2+J2+N2 · C1⁽¹⁾+H1+J2+N2 |
| ≤3 | R1+B1+C1 · R1+C2 | B2+C1+J1+N1 · B1+C2+H1+J1+N1 · B1+C2+J2+N2 · B1+C1+H1+J2+N2 |
| ≤4 | R1+B2+C1 · R1+B1+C2 · R2+C1⁽¹⁾ | B2+C2+H1+J1+N1 · B2+C2+J2+N2 · B2+C1+H1+J2+N2 |
| ≤5 | R3+C1 · B3+C1 · R1+B2+C2 · R2+B1+C1 | B3+C1 |

⁽¹⁾ «Cuando la fachada sea de una sóla hoja, debe utilizarse C2.»

**Condiciones de fachada** (HS 1 · ap. 2.3.2 pto 2; [HS22] pp. 20–23)

| Código | Bloque | Resumen |
|---|---|---|
| R1 | Revestimiento exterior | Resistencia **media** a la filtración. Continuo: espesor **10–15 mm** (salvo acabados con capa plástica delgada), adherencia, permeabilidad al vapor, adaptación a movimientos y comportamiento aceptable a fisuración; sobre aislante exterior, compatible con él y armado con malla de fibra de vidrio o de poliéster. O discontinuo rígido **pegado**, de piezas **< 300 mm de lado**, con enfoscado de mortero en la cara exterior de la hoja principal |
| R2 | Revestimiento exterior | Resistencia **alta**: discontinuo rígido **fijado mecánicamente**, con las características de los discontinuos de R1 salvo el tamaño de pieza |
| R3 | Revestimiento exterior | Resistencia **muy alta**. Continuo: estanco al agua de filtración hasta la hoja interior, sin fisurar por movimientos de la estructura, efectos térmicos ni retracción, y estable frente a ataques físicos, químicos y biológicos. O discontinuo fijado mecánicamente de escamas, lamas, placas o «sistemas derivados» (esos elementos con un aislamiento térmico) |
| B1 | Barrera contra el agua | Resistencia **media**: cámara de aire sin ventilar, o aislante no hidrófilo en la cara interior de la hoja principal |
| B2 | Barrera contra el agua | Resistencia **alta**: cámara sin ventilar + aislante no hidrófilo por el interior de la hoja principal (cámara al exterior del aislante), o aislante no hidrófilo por el exterior de la hoja principal |
| B3 | Barrera contra el agua | Resistencia **muy alta**. Cámara de aire ventilada al exterior de un aislante no hidrófilo, de **3 a 10 cm**, con recogida y evacuación del agua en su base y en cada interrupción (2.3.3.5) y aberturas de **≥ 120 cm² por cada 10 m² de paño entre forjados**, al 50 % arriba y abajo (valen juntas abiertas **> 5 mm**). O revestimiento continuo intermedio estanco en la cara interior de la hoja principal |
| C1 | Hoja principal | Espesor **medio**: **½ pie** de ladrillo cerámico (perforado o macizo si no hay revestimiento exterior, o si este o el aislante exterior son discontinuos o están fijados mecánicamente) o **12 cm** de bloque cerámico, de hormigón o de piedra natural |
| C2 | Hoja principal | Espesor **alto**: **1 pie** de ladrillo cerámico (misma salvedad) o **24 cm** de bloque cerámico, de hormigón o de piedra natural |
| H1 | Higroscopicidad | Baja: ladrillo de **succión ≤ 4,5 kg/m²·min** (UNE-EN 772-11:2011) o piedra natural de **absorción ≤ 2 %** (UNE-EN 13755:2008) |
| J1 | Juntas | Resistencia **media**: juntas de mortero sin interrupción (salvo, en bloque de hormigón, la interrupción en la parte intermedia de la hoja) |
| J2 | Juntas | Resistencia **alta**: mortero con hidrófugo, sin interrupción (misma salvedad), juntas horizontales llagueadas o en pico de flauta y, si el sistema lo permite, rejuntado con mortero más rico |
| N1 | Revestimiento intermedio (cara interior de la hoja principal) | Resistencia **media**: enfoscado de mortero de **≥ 10 mm** |
| N2 | Revestimiento intermedio | Resistencia **alta**: enfoscado con aditivos hidrofugantes de **≥ 15 mm**, o material adherido, continuo, sin juntas e impermeable del mismo espesor |

Términos que usan las condiciones (Apéndice A):
- «**Aislante no hidrófilo**: aislante que tiene una succión o absorción de agua a corto plazo por inmersión parcial menor que 1kg/m² según ensayo UNE-EN 1609:2013 o una absorción de agua a largo plazo por inmersión total menor que el 5% según ensayo UNE-EN 12087:2013.»
- «**Hoja principal**: hoja de una fachada cuya función es la de soportar el resto de las hojas y componentes de la fachada, así como, en su caso desempeñar la función estructural.»

Comentarios de [DccHS] (no reglamentarios):
- p. 23, a C1: «La denominación ladrillo perforado se refiere a la designación comercial de los ladrillos que disponen en la tabla o cara de mayor superficie de huecos cilíndricos verticales y paredes entre los huecos de mayor espesor que las de los ladrillos huecos.»
- p. 24, a H1: «Cuando dice succión se refiere a tasa de absorción de agua inicial. También serían válidos los ladrillos o bloques de hormigón con un coeficiente de absorción de agua por capilaridad equivalente, según el ensayo descrito en UNE EN 772-11:2011.»

---

## Bloque 6 — Figuras 2.4 y 2.5

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 6.1 | ¿Tabulación oficial por municipio o provincia de la zona pluviométrica de promedios o de la zona eólica? | VERIFICADO que **no está en el DB**. **NO VERIFICABLE** fuera de él | HS 1 solo da los dos mapas. No he encontrado ninguna relación oficial del Ministerio. Lo que aparece en el buscador es normatia.com, un agregador **no oficial** (IDR §0, A5-04), cuyo dato de radón ya resultó dudoso (`verificacion-hs6-v4.md`, nota 10.2). No usarlo como fuente | ap. 2.3.1 a) y b): «se obtiene de la figura 2.4» / «obtenida de la figura 2.5» | [HS22]; búsqueda web; [NMun] |
| 6.2 | ¿La figura 2.5 es la del DB SE-AE (Anejo D)? | **NO VERIFICABLE** en lo gráfico; coherente en las cifras | Mismas zonas y velocidades básicas: A 26, B 27, C 29 m/s (leyenda de la figura y Apéndice A). El SE-AE da 0,42 / 0,45 / 0,52 kN/m² para A/B/C (dato de buscador, sin leer el PDF). Con q = ½ · 1,25 · v² salen 0,42 / 0,46 / 0,53 kN/m²: coherente. Los dos mapas no se han comparado | Leyenda de la figura 2.5: «Velocidad básica del viento [m/s] Zona A: 26 Zona B: 27 Zona C: 29». Apéndice A, «Zona eólica»: «zona A cuando V = 26 m/s / zona B cuando V = 27 m/s / zona C cuando V = 29 m/s» | [HS22] pp. 20, 49; [SEAE-sec] |
| 6.3 | Cáceres: zona pluviométrica de promedios | **NO VERIFICABLE** | En la figura 2.4 (imagen de 1080 px), el rótulo «CÁCERES» queda entre las etiquetas «IV» y «III», junto a una línea de separación. No se puede decir de qué lado cae. Envolvente (más lluviosa) de las dos: **III**, solo como criterio | Figura 2.4 | [HS22] p. 19 |
| 6.4 | Cáceres: zona eólica | **NO VERIFICABLE** con seguridad | En la figura 2.5 el punto de Cáceres parece quedar al oeste de la línea A/B, en la **zona B**, pero cerca de la línea y a una resolución que no permite afirmarlo. Envolvente de las dos: **B**. Para h ≤ 15 m no importa (tabla 2.6) | Figura 2.5 | [HS22] p. 20 |
| 6.5 | Consecuencia para el Demo: caso «Plurifamiliar con locales» de `edificio/casos.ts` (PB de 4 m + P1–P3 de 3 m; forjado de cubierta a 13 m, 14,1 m incluso con un peto de 1,10 m; un sótano) | **INTERPRETACIÓN** con datos supuestos | ≤ 15 m: exposición V3 con E1 (urbano) o V2 con E0, sea cual sea la zona eólica. Grado de fachada: **3** si la zona es III (con E1 o E0); **2** si es IV con E1; **3** si es IV con E0. La envolvente es **3** | Tablas 2.5 y 2.6 | [REPO] |

**Nota 6.3 — qué hacer en la app.**
- La zona pluviométrica, la zona eólica y el terreno tipo son **datos del proyectista**, como la zona de radón y la isoyeta de HS 5. Procedencia en la ficha: «lectura de la figura 2.4 / 2.5 del DB-HS 1 por el proyectista».
- En el Demo, si se quiere rellenar, usar la zona **III** rotulada «supuesto de demostración, pendiente de lectura» y E1 (Cáceres capital es zona urbana: terreno tipo IV, por la definición literal). Nunca presentarlo como «la zona del DB para Cáceres».

---

## Bloque 7 — Cubiertas (ap. 2.4)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 7.1 | Grado de impermeabilidad de cubiertas | VERIFICADO | **Único**, sin número ni tabla, y sin depender del clima. Se alcanza con las condiciones de 2.4.2 a 2.4.4 | ap. 2.4.1 pto 1: «Para las cubiertas el grado de impermeabilidad exigido es único e independiente de factores climáticos. Cualquier solución constructiva alcanza este grado de impermeabilidad siempre que se cumplan las condiciones indicadas a continuación.» | [HS22] p. 28 |
| 7.2 | Elementos que exige 2.4.2 | VERIFICADO | Lista a) a k): ver la nota 7.2. Comentario: «Se entiende que se disponen sobre el soporte resistente.» | ap. 2.4.2 pto 1 | [HS22] p. 28; [DccHS] p. 29 |
| 7.3 | «Convencional» e «invertida» | **INTERPRETACIÓN** | El DB no usa esas palabras. La invertida se reconoce por el aislante sobre la impermeabilización: 2.4.3.2 pto 3 y la letra h) (capa separadora entre la protección y el aislante) | ap. 2.4.3.2 pto 3: «Cuando el aislante térmico se disponga encima de la capa de impermeabilización y quede expuesto al contacto con el agua, dicho aislante debe tener unas características adecuadas para esta situación.» | [HS22] p. 30 |
| 7.4 | Tabla 2.9 | VERIFICADO | Ver la transcripción. Intervalos cerrados: «incluida dentro de los intervalos» (**INTERPRETACIÓN**: 1 % y 5 % valen) | ap. 2.4.3.1 pto 3 | [HS22] p. 29, imagen |
| 7.5 | Tabla 2.10 | VERIFICADO | Ver la transcripción y sus tres notas | ap. 2.4.3.1 pto 4 | [HS22] p. 29, imagen |
| 7.6 | Cuándo obliga la tabla 2.10, y con qué signo | VERIFICADO (literal) | Solo en cubiertas inclinadas **sin** capa de impermeabilización. El texto dice «**mayor que**» y la cabecera dice «Pendiente mínima». Propuesta: comprobar con «>» y avisar en la igualdad («en el límite»). Si la pendiente no llega, 2.4.2 f) pide impermeabilización | ap. 2.4.3.1 pto 4: «… cuando éstas no tengan capa de impermeabilización, debe tener una pendiente hacia los elementos de evacuación de agua mayor que la obtenida en la tabla 2.10 en función del tipo de tejado.» | [HS22] p. 29 |
| 7.7 | Fila «Bituminosas: placa monocapa 25 % / bicapa 15 %» que trae [DccHS] | **NO VERIFICABLE** como articulado → no codificar como CTE | No está en la tabla 2.10 de [HS22], que tiene el mismo articulado de 14-06-2022. Lo más probable es que sea un comentario, pero sin la maqueta no se puede confirmar | [DccHS] p. 31 | [DccHS] texto; [HS22] p. 29 |
| 7.8 | Pizarra con menos pendiente (comentario) | LEÍDO (1 fuente, no reglamentario) | Se admiten pendientes menores según la Tabla 6 de UNE 22190-3:2014 | [DccHS] p. 31 | [DccHS] |
| 7.9 | Cifras de los componentes | VERIFICADO | Grava: suelta solo con pendiente **< 5 %**; tamaño **16–32 mm**; capa **≥ 5 cm**. Aglomerado asfáltico en caliente sobre la impermeabilización: **≥ 8 cm**. Sobre mortero: capa separadora y mortero de **≤ 4 cm**, armado. Cámara ventilada de cubierta: **3 < Ss/Ac < 30** (fórmula 2.3). Láminas bituminosas: fijación mecánica con pendiente **> 15 %**; adheridas entre **5 y 15 %**. PVC y EPDM: fijación mecánica con **> 15 %** | ap. 2.4.3.5.1 ptos 2 y 3; 2.4.3.5.4 ptos 2 y 3; 2.4.3.4; 2.4.3.3.1 a 2.4.3.3.3 | [HS22] pp. 30–32 |
| 7.10 | Evacuación de aguas | VERIFICADO | Se dimensiona por HS 5. Enlazar con el módulo HS 5 (pluviales) | 2.4.2 k): «un sistema de evacuación de aguas, que puede constar de canalones, sumideros y rebosaderos, dimensionado según el cálculo descrito en la sección HS 5 del DB-HS.» | [HS22] p. 28 |
| 7.11 | Barrera contra el vapor | VERIFICADO | Solo si el cálculo de condensaciones de HE 1 prevé condensación en el aislante. Enlazar con el módulo HE 1 | 2.4.2 b) | [HS22] p. 28 |

**Nota 7.2 — ap. 2.4.2 pto 1, resumen fiel de cada letra («Las cubiertas deben disponer de los elementos siguientes:»).**
- a) Sistema de formación de pendientes: siempre en cubierta **plana**; en inclinada, solo si el soporte resistente no tiene la pendiente adecuada a la protección y a la impermeabilización.
- b) Barrera contra el vapor inmediatamente debajo del aislante, **cuando** el cálculo de HE 1 prevea condensaciones en él.
- c) Capa separadora bajo el aislante, **cuando** haya que evitar el contacto entre materiales químicamente incompatibles.
- d) Aislante térmico, «según se determine en la sección HE1».
- e) Capa separadora bajo la impermeabilización, **cuando** haya incompatibilidad química o haya que evitar la adherencia en sistemas no adheridos.
- f) Capa de impermeabilización: siempre en **plana**; en inclinada, si la pendiente es menor que la de la tabla 2.10 o el solapo de las piezas es insuficiente.
- g) Capa separadora entre protección e impermeabilización, **cuando**: i) haya que evitar la adherencia; ii) la impermeabilización resista poco el punzonamiento estático; iii) la protección sea solado flotante sobre soportes, grava, capa de rodadura de hormigón, aglomerado asfáltico sobre mortero o tierra vegetal. Con tierra vegetal, además, capa drenante y capa filtrante encima. Con grava, la capa separadora es antipunzonante.
- h) Capa separadora entre protección y aislante, **cuando**: i) la protección sea tierra vegetal (más capa drenante y filtrante); ii) la cubierta sea transitable para peatones (antipunzonante); iii) la protección sea grava (filtrante y antipunzonante).
- i) Capa de protección en cubierta **plana**, salvo impermeabilización autoprotegida.
- j) Tejado en cubierta **inclinada**, salvo impermeabilización autoprotegida.
- k) Sistema de evacuación de aguas dimensionado por HS 5: **siempre**.

**Tabla 2.9 — Pendientes de cubiertas planas** ([HS22] p. 29)

| Uso | | Protección | Pendiente [%] |
|---|---|---|---|
| Transitables | Peatones | Solado fijo | 1–5 ⁽¹⁾ |
| Transitables | Peatones | Solado flotante | 1–5 |
| Transitables | Vehículos | Capa de rodadura | 1–5 ⁽¹⁾ |
| No transitables | — | Grava | 1–5 |
| No transitables | — | Lámina autoprotegida | 1–15 |
| Ajardinadas | — | Tierra vegetal | 1–5 |

⁽¹⁾ «Para rampas no se aplica la limitación de pendiente máxima.»

**Tabla 2.10 — Pendientes de cubiertas inclinadas** ([HS22] p. 29). Pendiente mínima [%]. Llamadas: ⁽¹⁾⁽²⁾ a todo «Tejado»; ⁽³⁾ a «Teja».

| Grupo | Material | Pieza | Pendiente mínima [%] |
|---|---|---|---|
| Teja ⁽³⁾ | — | Teja curva | 32 |
| Teja ⁽³⁾ | — | Teja mixta y plana monocanal | 30 |
| Teja ⁽³⁾ | — | Teja plana marsellesa o alicantina | 40 |
| Teja ⁽³⁾ | — | Teja plana con encaje | 50 |
| Pizarra | — | — | 60 |
| Placas y perfiles | Cinc | — | 10 |
| Placas y perfiles | Fibrocemento | Placas simétricas de onda grande | 10 |
| Placas y perfiles | Fibrocemento | Placas asimétricas de nervadura grande | 10 |
| Placas y perfiles | Fibrocemento | Placas asimétricas de nervadura media | 25 |
| Placas y perfiles | Sintéticos | Perfiles de ondulado grande | 10 |
| Placas y perfiles | Sintéticos | Perfiles de ondulado pequeño | 15 |
| Placas y perfiles | Sintéticos | Perfiles de grecado grande | 5 |
| Placas y perfiles | Sintéticos | Perfiles de grecado medio | 8 |
| Placas y perfiles | Sintéticos | Perfiles nervados | 10 |
| Placas y perfiles | Galvanizados | Perfiles de ondulado pequeño | 15 |
| Placas y perfiles | Galvanizados | Perfiles de grecado o nervado grande | 5 |
| Placas y perfiles | Galvanizados | Perfiles de grecado o nervado medio | 8 |
| Placas y perfiles | Galvanizados | Perfiles de nervado pequeño | 10 |
| Placas y perfiles | Galvanizados | Paneles | 5 |
| Placas y perfiles | Aleaciones ligeras | Perfiles de ondulado pequeño | 15 |
| Placas y perfiles | Aleaciones ligeras | Perfiles de nervado medio | 5 |

Notas, literal:
- ⁽¹⁾ «En caso de cubiertas con varios sistemas de protección superpuestos se establece como pendiente mínima la menor de las pendientes para cada uno de los sistemas de protección.»
- ⁽²⁾ «Para los sistemas y piezas de formato especial las pendientes deben establecerse de acuerdo con las correspondientes especificaciones de aplicación.»
- ⁽³⁾ «Estas pendientes son para faldones menores a 6,5 m, una situación de exposición normal y una situación climática desfavorable; para condiciones diferentes a éstas, se debe tomar el valor de la pendiente mínima establecida en norma UNE 127100:1999 (“Tejas de hormigón. Código de práctica para la concepción y el montaje de cubiertas con tejas de hormigón”) ó en norma UNE 136020:2004 (“Tejas cerámicas. Código de práctica para la concepción y el montaje de cubiertas con tejas cerámicas”).»

**Nota 7.12 — los tres tipos de cubierta de El edificio** (INTERPRETACIÓN de 2.4.2 y de las tablas 2.9 y 2.10).

| Tipo en El edificio | Siempre exigibles | Dependen de una decisión del proyectista |
|---|---|---|
| `plana_transitable` | a) formación de pendientes; f) impermeabilización; i) capa de protección (la tabla 2.9 no da lámina autoprotegida para uso transitable); k) evacuación por HS 5; pendiente 1–5 % (sin máximo en rampas: nota (1)) | **Protección**: solado fijo o flotante (peatones), capa de rodadura (vehículos). **Posición del aislante**: si va sobre la impermeabilización (invertida), h) ii) capa separadora antipunzonante entre protección y aislante. g): si hay solado flotante sobre soportes, rodadura de hormigón o aglomerado sobre mortero, o para evitar adherencia o por punzonamiento. b) según HE 1; c) y e) por compatibilidad; d) según HE 1 |
| `plana_no_transitable` | a); f); k); i) salvo lámina autoprotegida | **Protección**: grava (pendiente 1–5 %; suelta solo con < 5 %; 16–32 mm; ≥ 5 cm; g) iii) separadora antipunzonante sobre la impermeabilización; h) iii) separadora filtrante y antipunzonante si va sobre el aislante) o lámina autoprotegida (1–15 %, sin capa de protección). Posición del aislante; b), c), d), e) como arriba. **Ajardinada**: la tabla 2.9 la trata como uso aparte (tierra vegetal, 1–5 %; g) iii) y h) i) con capa drenante y filtrante). El edificio no tiene ese tipo: tratarla como protección de `plana_no_transitable` es CRITERIO |
| `inclinada` | j) tejado, salvo impermeabilización autoprotegida; k) evacuación por HS 5 (canalones con pendiente ≥ 1 %: ap. 2.4.4.2.9 pto 2) | **Tipo de tejado + pendiente**: si la pendiente es mayor que la de la tabla 2.10, no hace falta impermeabilización; si no, f) la exige. a) solo si el soporte no da la pendiente. Faldones ≥ 6,5 m con teja: UNE (nota 3), aviso. Cámara ventilada, si la hay: 3 < Ss/Ac < 30. b), c), d), e) como arriba |

---

## Bloque 8 — Dimensionado (ap. 3)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 8.1 | Tabla 3.1 | VERIFICADO | Ver la transcripción. Pendientes en **‰** (por mil): 3 ‰ = 0,3 %. La tabla 3.3, en cambio, va en **%** | ap. 3.1 pto 1 | [HS22] p. 38, imagen |
| 8.2 | Qué grado se usa en la tabla 3.1 | VERIFICADO | El del muro (2.1.1) para los drenes del muro y el del suelo (2.2.1) para los del suelo | Nota (1) de la tabla 3.1: «Este grado de impermeabilidad es el establecido en el apartado 2.1.1 para muros y en el apartado 2.2.1 para suelos.» | [HS22] p. 38 |
| 8.3 | Qué condiciones llevan a la tabla 3.1 | **INTERPRETACIÓN** | Muro **D3** (tubo en el arranque del muro) → columna «perímetro del muro», con el grado del muro. Suelo **D2** (tubos bajo el suelo) → «bajo suelo», con el grado del suelo. Suelo **D3** (tubos en la base del muro) → «perímetro del muro»; qué grado usar no está claro, y la propuesta (CRITERIO) es el mayor de los dos | ap. 2.1.2 (D3); ap. 2.2.2 (D2, D3); tabla 3.1 | — |
| 8.4 | Tabla 3.2 | VERIFICADO | Ver la transcripción | ap. 3.1 pto 2 | [HS22] p. 38 |
| 8.5 | Canaletas (muro **D4**, solo muros parcialmente estancos) | VERIFICADO | Sumideros de **Ø ≥ 110 mm**. La tabla 3.3 entra por el grado **del muro**. El número de sumideros depende de la superficie de muro | ap. 3.2 pto 1: «El diámetro de los sumideros de las canaletas de recogida del agua en los muros parcialmente estancos debe ser 110 mm como mínimo.» Pto 2 | [HS22] pp. 38–39 |
| 8.6 | Tabla 3.3 | VERIFICADO | Ver la transcripción. Redondear el número de sumideros hacia arriba (⌈A/25⌉…) es CRITERIO | ap. 3.2 pto 2 | [HS22] p. 39, imagen |
| 8.7 | Cuándo hay bombas de achique | VERIFICADO | **Siempre**: muro D2 (pozo con dos bombas) y suelo D4 (pozo con dos bombas y achique automático). **Solo si la conexión queda por encima** de la red de drenaje o de las canaletas: muro D3 y D4, suelo D2 y D3 (al menos una cámara con dos bombas) | Textos de D2–D4 (bloques 3 y 4) | [HS22] pp. 12–13, 17 |
| 8.8 | Caudal de cada bomba | VERIFICADO | Cada bomba de una cámara, para el **caudal total**. En muros, el caudal **se puede** calcular con el Apéndice C. En suelos el DB no da método | ap. 3.3 pto 1: «Cada una de las bombas de achique de una misma cámara debe dimensionarse para el caudal total de agua a evacuar que, en el caso de referirse a muros, se puede calcular según el método descrito en el apéndice C.» | [HS22] p. 39 |
| 8.9 | Tabla 3.4 | VERIFICADO | Ver la transcripción. Por encima de 3,1 l/s, segunda cámara | ap. 3.3 pto 2: «El volumen de cada cámara de bombeo debe ser como mínimo igual al obtenido de la tabla 3.4. Para caudales mayores debe colocarse una segunda cámara.» | [HS22] p. 39, imagen |
| 8.10 | Caudal intermedio en la tabla 3.4 | **NO VERIFICABLE** (el DB no lo dice) → **CRITERIO** | Fila de caudal igual o inmediatamente superior; no interpolar | — | — |
| 8.11 | Apéndice C | LEÍDO (imagen; fórmulas de una sola fuente) | Ver la nota 8.11. Datos: P, NF, Ks **[m/s]**, H, h₀, R; posición de la capa impermeable. Casi nunca los tendrá el módulo: proponer el caudal como dato del proyectista y citar el Apéndice C | Apéndice C pto 1 a) y b) | [HS22] p. 51 |
| 8.12 | Ejecución del drenaje | VERIFICADO | Tubo rodeado de árido y envuelto en lámina filtrante; recubrimiento de árido **≥ 1,5 Ø** del dren si es de aluvión y **≥ 3 Ø** si es de machaqueo. Terreno bajo soleras y placas drenadas compactado y con **≥ 1 %** de pendiente | ap. 5.1.1.6 ptos 1 a 3; ap. 5.1.2.4 pto 1 | [HS22] pp. 42–43 |
| 8.13 | ¿Se decide el bombeo con la cota del alcantarillado? | **CRITERIO** | Sí: con `cotaAlcantarillado_m` (HS 5) frente a la cota del drenaje (arranque del muro o cara inferior del suelo). Sin esa cota, suponer bombeo y avisar. No confundir con el bombeo de aguas residuales de HS 5 (`verificacion-hs5-pluviales.md`, nota C2) | Textos de D2–D4 | — |

**Tabla 3.1 — Tubos de drenaje** ([HS22] p. 38)

| Grado ⁽¹⁾ | Pendiente mínima [‰] | Pendiente máxima [‰] | Ø nominal mín. — drenes bajo suelo [mm] | Ø nominal mín. — drenes en el perímetro del muro [mm] |
|---|---|---|---|---|
| 1 | 3 | 14 | 125 | 150 |
| 2 | 3 | 14 | 125 | 150 |
| 3 | 5 | 14 | 150 | 200 |
| 4 | 5 | 14 | 150 | 200 |
| 5 | 8 | 14 | 200 | 250 |

**Tabla 3.2 — Superficie mínima de orificios de los tubos de drenaje** ([HS22] p. 38)

| Ø nominal [mm] | Superficie total mínima de orificios [cm²/m] |
|---|---|
| 125 | 10 |
| 150 | 10 |
| 200 | 12 |
| 250 | 17 |

**Tabla 3.3 — Canaletas de recogida de agua filtrada** ([HS22] p. 39)

| Grado del muro | Pendiente mínima [%] | Pendiente máxima [%] | Sumideros |
|---|---|---|---|
| 1 | 5 | 14 | 1 cada 25 m² de muro |
| 2 | 5 | 14 | 1 cada 25 m² de muro |
| 3 | 8 | 14 | 1 cada 20 m² de muro |
| 4 | 8 | 14 | 1 cada 20 m² de muro |
| 5 | 12 | 14 | 1 cada 15 m² de muro |

**Tabla 3.4 — Cámaras de bombeo** ([HS22] p. 39)

| Caudal de la bomba [l/s] | Volumen de la cámara [m³] |
|---|---|
| 0,15 | 2,4 |
| 0,31 | 2,85 |
| 0,46 | 3,6 |
| 0,61 | 3,9 |
| 0,76 | 4,5 |
| 1,15 | 5,7 |
| 1,53 | 9,6 |
| 1,91 | 10,8 |
| 2,3 | 15 |
| 3,1 | 20 |

**Nota 8.11 — Apéndice C, fórmulas (leídas en la imagen de la p. 51).** q = caudal de drenaje por metro lineal de muro [m³/(s·m)].
- a) Arranque del muro en la cara superior de una capa impermeable o por debajo: (C.1) q = Ks·(P − NF)/10, o (C.2) q = Ks·(H² − h₀²)/(2R).
- b) Arranque del muro sin alcanzar ninguna capa impermeable: (C.3) q = Ks·[0,73 + 0,27·(H − h₀)/H]·(H² − h₀²)/(2R).
- Símbolos:
  - P: profundidad del arranque del muro respecto a la superficie del terreno [m];
  - NF: nivel freático [m];
  - Ks [m/s];
  - H: diferencia entre la profundidad de la cara superior de la capa impermeable y el nivel freático antes de la intervención [m];
  - h₀: la misma diferencia en el punto donde está el tubo drenante [m];
  - R: radio de acción del drenaje, «equivalente a la distancia de la zona de recarga del acuífero» [m].

---

## Bloque 9 — Comentarios del Ministerio (DccHS, 12-02-2025)

No tienen carácter reglamentario ([DccHS] p. 2). Están todos los comentarios de HS 1 que cambian o precisan la lectura. Páginas del PDF de [DccHS].

| # | Tema | Comentario (literal o casi) | Pág. | Efecto en el módulo |
|---|---|---|---|---|
| 9.1 | Las soluciones del ap. 2 no son obligatorias | «Las soluciones constructivas recogidas en este apartado se consideran soluciones aceptadas, pero no obligatorias. Se pueden utilizar otras soluciones, siempre que éstas proporcionen las mismas prestaciones, de acuerdo con lo dispuesto en el artículo 5 del CTE. Se recogen algunas soluciones poco usuales, pero que son factibles y pueden darse en algunos casos, como por ejemplo en rehabilitación.» | 11 | Una casilla sombreada o una condición incumplida no es «NO CUMPLE» sin más: ofrecer «otra solución de prestaciones equivalentes (CTE Parte I, art. 5)», con justificación del proyectista y veredicto `criterio` |
| 9.2 | Ámbito: filtración y condensación | «El DB HS 1 trata sobre las humedades producidas por filtración y condensación.» Condensaciones: DA DB-HE/2 | 10 | Enlazar con HE 1 |
| 9.3 | Muros C1 | Solo muros de hormigón in situ | 12 | C1 condicionada al material |
| 9.4 | Muros C2 | Su fin es la buena ejecución | 12 | Texto de la memoria |
| 9.5 | Muros I1 | Valen barreras geosintéticas expansivas (bentonita de sodio) e inyecciones por el extradós. Los lodos bentoníticos sostienen la excavación, «se utilizarán cuando las características del terreno así lo requieran». La lámina interior adherida es para la presión hidrostática negativa, «siendo posible otras soluciones» | 12–13 | Texto de la memoria |
| 9.6 | Muros D1 | Sin grava con manta de bentonita | 13 | Texto |
| 9.7 | Muros y suelos D2–D4 | Mejor reutilizar el agua drenada | 13, 18 | Texto |
| 9.8 | **Suelo sin muros** | «Cuando el edificio no tenga muros en contacto con el terreno, se utilizará la tabla correspondiente a muros flexorresistentes o de gravedad.» | 16 | PB sin sótano: bloque 1 de la tabla 2.4 |
| 9.9 | Suelos I1 | «Cuando el suelo sea una placa, la lámina debe ser doble»: «Se refiere a que debe estar formada por dos capas.» | 18 | Texto |
| 9.10 | Suelos I1 e I2 | Vale la bentonita de sodio | 18 | Texto |
| 9.11 | Impermeabilizar el suelo por el interior | «La impermeabilización de un suelo por el interior es una de las posibles intervenciones en un edificio existente.» | 19 | Fuera de obra nueva |
| 9.12 | Fachadas C1 | Qué es «ladrillo perforado» | 23 | Texto |
| 9.13 | Fachadas H1 | «Succión» = tasa de absorción de agua inicial; también valen ladrillos o bloques de hormigón con absorción por capilaridad equivalente | 24 | Texto |
| 9.14 | Zócalo (2.3.3.2) | «En general, los ladrillos que se suelen utilizar en fachadas no se consideran porosos y no van a necesitar este zócalo.» | 25 | Texto del punto singular |
| 9.15 | Cubiertas 2.4.2 | «Se entiende que se disponen sobre el soporte resistente.» | 29 | Texto |
| 9.16 | Tabla 2.10 | Fila «Bituminosas» (monocapa 25 %, bicapa 15 %) que no está en [HS22] (7.7), y pizarra con menos pendiente según UNE 22190-3:2014 | 31 | No codificar la fila como CTE |
| 9.17 | Cámara ventilada de cubierta | «Las aberturas pueden disponerse en cualquier parte de la cubierta, ya sea en el alero, en la cumbrera, en el solape entre las piezas, etc.» | 32 | Texto |
| 9.18 | Grava | «Para aglomerar puede utilizarse otro material distinto al mortero.» | 32 | Texto |
| 9.19 | Rebosaderos | Riesgo en patios o azoteas con peto perimetral y un solo sumidero | 36 | Aviso en cubierta plana (enlaza con HS 5) |

**Lo que el DccHS NO comenta** (comprobado en todo el texto de HS 1 de [DccHS]): freático desconocido, Ks sin estudio geotécnico, forjado sanitario, la regla de sustitución, fachadas ventiladas, SATE o monocapa, altura de coronación, zonas de las figuras 2.4 y 2.5, ni las casillas raras de la tabla 2.4 (4.6).

---

## Bloque 10 — Datos que faltan (sin estudio geotécnico)

| # | Afirmación | Veredicto | Valor correcto | Cita / razón | Fuente |
|---|---|---|---|---|---|
| 10.1 | ¿Dice algo el DB o el DccHS si no hay freático o Ks? | VERIFICADO: **nada** | No hay regla para el dato desconocido | Búsqueda en todo HS 1 de [HS22] y de [DccHS] | [HS22]; [DccHS] |
| 10.2 | Ks se puede estimar | VERIFICADO | «… o indirectamente a partir de la granulometría y la porosidad del terreno» | Apéndice A | [HS22] p. 46 |
| 10.3 | Freático desconocido: hipótesis | **CRITERIO** | Del lado de la seguridad: presencia **alta**. Aviso «supuesto» revisable que lleve a Datos de la obra | Principio de `feature-17` («Lo que no se sabe se supone del lado de la seguridad y se avisa») | — |
| 10.4 | Freático «no detectado» | **INTERPRETACIÓN** + CRITERIO | Es «baja» solo si el reconocimiento llegó más hondo que la cara inferior del suelo más bajo. Propuesta: pedir la profundidad alcanzada. Sin ella, aceptar «baja» con un aviso «supuesto: el reconocimiento alcanzó la cota del suelo» | Apéndice A (el NF es un valor medio anual) | — |
| 10.5 | Ks desconocido: hipótesis | **CRITERIO** | La peor columna. Muros: Ks ≥ 10⁻² (con presencia baja no cambia nada; con media da 3; con alta, 5). Suelos: Ks > 10⁻⁵. Aviso «supuesto» | Tablas 2.1 y 2.3 | — |
| 10.6 | Terreno con varios estratos | **CRITERIO** | Ks del estrato en contacto con el muro o el suelo; si hay varios, el mayor | — | — |
| 10.7 | Zona pluviométrica, zona eólica o terreno tipo desconocidos | **CRITERIO** (ya es el comportamiento del formulario) | Zona pluviométrica I, zona eólica C, entorno E0 (el más expuesto), con aviso. El formulario ya lo anuncia así | Tablas 2.5 y 2.6 | [REPO] |
| 10.8 | ¿Se puede emitir «CUMPLE» con datos supuestos? | **CRITERIO** | Sí, pero con el aviso visible en la ficha y en la memoria: «Grado obtenido con datos supuestos (sin estudio geotécnico): revisar». Sin aviso, nunca | IDR §8 (todo dato declara su origen) | — |

---

## Bloque 11 — Edición y cita

| # | Afirmación | Veredicto | Valor correcto | Cita | Fuente |
|---|---|---|---|---|---|
| 11.1 | Texto vigente | VERIFICADO | DB-HS consolidado «14 junio 2022». Lista de disposiciones de su p. 2: RD 314/2006; RD 1371/2007 y su corrección; corrección del RD 314/2006 (25-01-2008); VIV/984/2009 y su corrección (23-09-2009); FOM/588/2017; RD 732/2019; RD 450/2022 | DB-HS, p. 2 | [HS22] |
| 11.2 | ¿Modificó HS 1 la Orden FOM/588/2017? | LEÍDO (1 fuente, vía extractor) | **No**. Solo HS 3 (y el DB-HE) | Artículo segundo, «Uno» a «Seis», todos de HS 3 | [BOE17] |
| 11.3 | ¿Modificó HS 1 el RD 732/2019? | LEÍDO (1 fuente, vía extractor; texto cortado) | Añade HS 6 («Tres») y cambia en «I Objeto» «HS 1 a HS 5» por «HS 6». Además, el apartado «**Doce**» actualiza referencias normativas: «En el Documento Básico DB-HS «Salubridad» se actualizan las referencias normativas que se señalan». La lista llega cortada. Coherente con que el consolidado cite UNE-EN 772-11:2011, UNE-EN 1609:2013 y UNE-EN 12087:2013. **No se ha visto que toque tablas ni articulado de HS 1** | RD 732/2019, art. único, «Tres» y «Doce» | [BOE19] |
| 11.4 | ¿Modificó HS 1 el RD 450/2022? | LEÍDO (1 fuente, vía extractor) | **No**. Solo HS 4 (3.2.2.1 pto 2, 6.2 y Apéndice C). Coincide con `verificacion-hs5-pluviales.md` ([DcmHS]: marcas solo en HS 4) | RD 450/2022, art. único, «Cinco» | [BOE22] |
| 11.5 | ¿Son las tablas de HS 1 las de 2006 o 2009? | **NO VERIFICABLE** | No se ha leído HS 1 de 2006 ni de 2009. No afirmar «sin cambios desde 2009» | — | — |
| 11.6 | Cómo citarlo | **CRITERIO** (forma) | «CTE DB-HS, Sección HS 1 "Protección frente a la humedad", texto consolidado de 14-06-2022 (codigotecnico.org), ap. … / tabla …». Procedencia: `edicion: "Consolidado 14-06-2022"`. Si cabe, en las notas de la ficha: «No modificada por FOM/588/2017 ni RD 450/2022; el RD 732/2019 actualizó referencias normativas del DB-HS» | — | — |

---

## Cifras que SÍ se pueden mostrar en la UI, con su cita

- **Presencia de agua**: umbrales 0 m y 2 m entre la cara inferior del suelo y el nivel freático (valor medio anual). Cita: HS 1 · ap. 2.1.1 pto 2; Apéndice A.
- **Tabla 2.1** (grado de muros) y **tabla 2.3** (grado de suelos), con Ks en cm/s y sus signos exactos.
- **Tabla 2.2** (condiciones de muro), con sus 4 casillas sombreadas, la casilla en blanco y las notas de 1, 2 y 3 sótanos.
- **Tabla 2.4** (condiciones de suelo), los dos bloques, literal. Las casillas raras (4.6) se muestran tal cual.
- **V1 de muro**: ≥ 0,7 l/s por m² útil; 10 < Ss/Ah < 30; aberturas a ≤ 5 m. Cita: ap. 2.1.2, V1, fórmula (2.1).
- **V1 de suelo**: 10 < Ss/As < 30; aberturas a ≤ 5 m. Cita: ap. 2.2.2, V1, fórmula (2.2).
- **Suelo elevado**: (contacto + apoyo) / superficie < 1/7. Cita: Apéndice A.
- **D2 de muro**: pozo cada ≤ 50 m, Ø interior ≥ 0,7 m, dos bombas. **D4 de suelo**: un pozo por cada 800 m², Ø ≥ 70 cm, dos bombas y achique automático. **D3 de suelo con pantalla**: tubos a 1 m bajo el suelo.
- **Tablas 2.5, 2.6** (con la nota de > 100 m) **y 2.7** (con la nota de la hoja única y la regla de sustitución de 2.3.2 pto 2).
- **Fachada**:
  - C1: ½ pie o 12 cm. C2: 1 pie o 24 cm.
  - H1: succión ≤ 4,5 kg/m²·min; piedra con absorción ≤ 2 %.
  - N1 ≥ 10 mm. N2 ≥ 15 mm.
  - R1: 10–15 mm; piezas pegadas < 300 mm de lado.
  - B3: cámara de 3–10 cm; aberturas ≥ 120 cm² por 10 m²; juntas abiertas > 5 mm.
  - Aislante no hidrófilo: < 1 kg/m² o < 5 %.
- **Grado 5 de fachada con carpintería retranqueada**: precerco y barrera impermeable 10 cm hacia el interior. Cita: ap. 2.3.3.6 pto 1.
- **Cubierta**:
  - grado único (ap. 2.4.1);
  - elementos a) a k) (ap. 2.4.2);
  - tabla 2.9 y tabla 2.10 (sin la fila «Bituminosas»);
  - grava 16–32 mm, ≥ 5 cm, suelta solo con < 5 %;
  - cámara ventilada 3 < Ss/Ac < 30;
  - canalones de cubierta inclinada ≥ 1 %.
- **Tablas 3.1 a 3.4**; sumideros de canaleta Ø ≥ 110 mm; recubrimiento del dren ≥ 1,5 Ø o ≥ 3 Ø; terreno bajo soleras y placas drenadas ≥ 1 %.
- **Puntos singulares que la memoria puede citar** (no se comprueban):
  - muro impermeabilizado por el interior: > 15 cm sobre el suelo exterior, banda de refuerzo de 20 cm, mortero ≥ 2 cm (ap. 2.1.3.1);
  - esquinas: banda ≥ 15 cm (ap. 2.1.3.5);
  - arranque de fachada: barrera > 15 cm sobre el suelo exterior; zócalo de > 30 cm con succión < 3 % si la fachada es porosa (ap. 2.3.3.2);
  - cubierta plana: impermeabilización ≥ 20 cm sobre la protección en paramentos (2.4.4.1.2); juntas a ≤ 15 m (2.4.4.1.1); sumideros a ≥ 50 cm de paramentos (2.4.4.1.4 pto 6); rebosaderos (2.4.4.1.5).
- **Mantenimiento** (tabla 6.1, [HS22] p. 45, imagen):

| Elemento | Operación | Periodicidad |
|---|---|---|
| Muros | Funcionamiento de canales y bajantes de evacuación de los muros parcialmente estancos | 1 año ⁽¹⁾ |
| Muros | Aberturas de ventilación de la cámara de los muros parcialmente estancos no obstruidas | 1 año |
| Muros | Estado de la impermeabilización interior | 1 año |
| Suelos | Limpieza de la red de drenaje y de evacuación | 1 año ⁽²⁾ |
| Suelos | Limpieza de las arquetas | 1 año ⁽²⁾ |
| Suelos | Estado de las bombas de achique, incluidas las de reserva | 1 año |
| Suelos | Filtraciones por fisuras y grietas | 1 año |
| Fachadas | Conservación del revestimiento (fisuras, desprendimientos, humedades y manchas) | 3 años |
| Fachadas | Conservación de los puntos singulares | 3 años |
| Fachadas | Grietas, fisuras, desplomes u otras deformaciones de la hoja principal | 5 años |
| Fachadas | Limpieza de las llagas o aberturas de ventilación de la cámara | 10 años |
| Cubiertas | Limpieza y funcionamiento de sumideros, canalones y rebosaderos | 1 año ⁽¹⁾ |
| Cubiertas | Recolocación de la grava | 1 año |
| Cubiertas | Conservación de la protección o tejado | 3 años |
| Cubiertas | Conservación de los puntos singulares | 3 años |

⁽¹⁾ «Además debe realizarse cada vez que haya habido tormentas importantes.» ⁽²⁾ «Debe realizarse cada año al final del verano.»

## Cifras que NO deben mostrarse

- **Zona pluviométrica o zona eólica de Cáceres (o de cualquier municipio) como «valor del DB»**, ni las de normatia.com. Como mucho, el supuesto de demostración de la nota 6.3, rotulado.
- **«Bituminosas: placa monocapa 25 %, bicapa 15 %»** como pendiente del CTE (7.7).
- **Un «grado» numérico de cubierta.** El grado es único (ap. 2.4.1).
- **Grados de elementos distintos comparados entre sí** («el muro tiene más grado que la fachada»). Apéndice A.
- **Umbrales de Ks en m/s junto a las tablas 2.1 y 2.3**, que están en cm/s. Convertir solo para el Apéndice C.
- **La regla de sustitución aplicada a muros o suelos.** Solo vale en fachadas.
- **Una fila de la tabla 2.2 o 2.4 «completada» con las condiciones de la fila anterior.** Las filas no se acumulan (3.8 y 4.7).
- **«Fuera de tabla» para alturas entre 15 y 16 m o entre 40 y 41 m** (5.7).
- **Volúmenes de la tabla 3.4 interpolados** como si fueran del DB, o el caudal del Apéndice C presentado como exigencia: el DB dice «se puede calcular».
- **«≥» en la tabla 2.10** sin la nota de que el texto dice «mayor que» (7.6).

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Presencia de agua | DB-HS1 | Consolidado 14-06-2022 | 2022-06-14 | ap. 2.1.1 pto 2; Apéndice A (nivel freático) | — | codigotecnico.org · DBHS.pdf, Sección HS 1 |
| Grado de muros | ídem | ídem | 2022-06-14 | ap. 2.1.1 pto 1 | Tabla 2.1 | ídem |
| Condiciones de muro | ídem | ídem | 2022-06-14 | ap. 2.1.2 ptos 1 y 2 | Tabla 2.2 | ídem |
| Grado de suelos | ídem | ídem | 2022-06-14 | ap. 2.2.1 pto 1 | Tabla 2.3 | ídem |
| Condiciones de suelo | ídem | ídem | 2022-06-14 | ap. 2.2.2 ptos 1 y 2 | Tabla 2.4 | ídem |
| Grado de fachadas | ídem | ídem | 2022-06-14 | ap. 2.3.1 pto 1 a) | Tabla 2.5 | ídem |
| Exposición al viento | ídem | ídem | 2022-06-14 | ap. 2.3.1 pto 1 b) | Tabla 2.6 | ídem |
| Condiciones de fachada | ídem | ídem | 2022-06-14 | ap. 2.3.2 ptos 1 y 2 | Tabla 2.7 | ídem |
| Elementos de cubierta | ídem | ídem | 2022-06-14 | ap. 2.4.1; 2.4.2 pto 1 | — | ídem |
| Pendientes de cubierta plana | ídem | ídem | 2022-06-14 | ap. 2.4.3.1 pto 3 | Tabla 2.9 | ídem |
| Pendientes de cubierta inclinada | ídem | ídem | 2022-06-14 | ap. 2.4.3.1 pto 4 | Tabla 2.10 | ídem |
| Tubos de drenaje | ídem | ídem | 2022-06-14 | ap. 3.1 ptos 1 y 2 | Tablas 3.1 y 3.2 | ídem |
| Canaletas | ídem | ídem | 2022-06-14 | ap. 3.2 ptos 1 y 2 | Tabla 3.3 | ídem |
| Cámaras de bombeo | ídem | ídem | 2022-06-14 | ap. 3.3 ptos 1 y 2 | Tabla 3.4 | ídem |
| Mantenimiento | ídem | ídem | 2022-06-14 | ap. 6 pto 1 | Tabla 6.1 | ídem |

---

## Pendientes

1. **Figuras 2.4 y 2.5 a buena resolución** (versión vectorial o BOE de 28-03-2006) para leer Cáceres. Mientras tanto, las tres zonas son datos del proyectista.
2. **Comparar la figura 2.5 con la figura D.1 del DB SE-AE.** Hace falta leer el PDF del SE-AE (no se pudo con el extractor).
3. **RD 732/2019, apartado «Doce»:** leer en el PDF del BOE qué referencias de HS 1 actualizó (el HTML llega cortado).
4. **Maqueta del DccHS** (hace falta poppler): confirmar que la fila «Bituminosas» de la tabla 2.10 es un comentario (7.7).
5. **HS 1 de 2006 / 2009 (BOE):** comprobar si las casillas raras de la tabla 2.4 (4.6) ya estaban así en el original.
6. **Decisiones de criterio que el responsable del proyecto debe validar:**
   - hipótesis sin datos: presencia alta, peor columna de Ks, zona I, zona C, E0 (bloque 10);
   - «no detectado» = baja solo con la profundidad del reconocimiento (10.4);
   - espesor bajo el suelo de 0,30 m y aviso junto a los umbrales (2.12);
   - altura de coronación al forjado con aviso por peto (5.6b);
   - intervalos de la tabla 2.6 (5.7);
   - condiciones de muro en un suelo sin muro aplicadas a la cimentación perimetral (4.10);
   - grado para el dren de suelo D3 (8.3);
   - fila de caudal superior en la tabla 3.4 (8.10);
   - bombeo sin cota de alcantarillado (8.13);
   - revestimiento sin R1 justificado por la columna «sin revestimiento» (5.20);
   - ajardinada como protección de `plana_no_transitable` (nota 7.12);
   - vía «otra solución equivalente» con veredicto `criterio` (9.1).

---

## Para el código

### Observaciones sobre lo que ya existe

| # | Fichero | Hoy | Propuesta | Motivo |
|---|---|---|---|---|
| R1 | `modules/hs1/partes.ts`, `presenciaAguaDe` | Clasificación correcta | Sin cambio en la aritmética | 2.4, 2.11 |
| R2 | ídem, `no_detectado → "baja"` | Sin condición | Añadir `profundidadReconocimiento_m?` a `NivelFreatico` en su variante `no_detectado`. «Baja» si el reconocimiento llegó más hondo que la cara inferior; si no se sabe, «baja» con aviso «supuesto» | 10.4 |
| R3 | ídem, freático `undefined → null` | El llamador decide | Según `feature-17`, suponer «alta» y avisar | 10.3 |
| R4 | ídem, `ESPESOR_SUELO_CRITERIO_m = 0.3` | Criterio declarado | Mantener. Aviso si Δ queda a menos de 0,30 m de 0 o de 2 m | 2.12 |
| R5 | ídem, `alturaCoronacion_m` = cara superior del forjado de cubierta | Criterio declarado | Mantener, con aviso si h + 1,10 m pasa de 15 o 40 m. Los 1,10 m son la altura habitual de una barrera de protección del DB-SUA 1 (no releído en esta sesión): es CRITERIO. Mejor aún, un dato opcional «altura del peto». En el Demo: 13 m → 14,1 m, sin aviso | 5.6b, 5.7, 6.5 |
| R6 | ídem, semisótano o solar en pendiente | No se modela | Aviso revisable de la nota 1.7 | 1.7 |
| R7 | `FormDatosGeneralesPage.tsx`, ayuda «Nivel freático» | «… desde la rasante (cota ±0,00)» | «Valor medio anual de la profundidad del nivel freático, medida desde la superficie del terreno (estudio geotécnico). HS 1 · Apéndice A» | 2.5, 2.13 |
| R8 | ídem, `KS_OPTIONS`, `TERRENO_TIPO_OPTIONS`, `ZONA_EOLICA_OPTIONS` | — | Correctos. Sin cambio | 2.6, 5.8, 6.2 |
| R9 | Tests (`feature-17`, «más agua o más Ks nunca bajan el grado; más exposición nunca lo baja») | — | Válido para las tablas 2.1, 2.3, 2.5 y 2.6. **No** escribir propiedades de inclusión entre filas de las tablas 2.2 y 2.4 | 3.8, 4.7 |

### Datos propuestos para `src/modules/hs1/tablas.ts`

Sigue el patrón `tablaCTE(procedencia, datos)` de `src/lib/cte/tabla.ts`. **No está aplicado.** Todos los valores salen de la imagen de [HS22] y coinciden con el texto extraído de [HS22] y de [DccHS]. Convención: arrays de 5 posiciones, índice 0 = fila «≤1» … índice 4 = fila «≤5». Casilla sombreada = `null`; casilla en blanco = `[]`; notas en un campo aparte. Los criterios de proyecto van al final, fuera de `tablaCTE`, para que la ficha no los cite como CTE.

```ts
import { tablaCTE } from "../../lib/cte/tabla";

/** HS 1 vigente: DB-HS consolidado 14-06-2022. No la modifican FOM/588/2017 (solo HS 3) ni
 *  RD 450/2022 (solo HS 4). RD 732/2019 añade HS 6 y actualiza referencias normativas del DB-HS. */
const PROC_HS1 = {
  db: "DB-HS1",
  edicion: "Consolidado 14-06-2022",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DBHS.pdf, Sección HS 1 (tablas cotejadas casilla a casilla en imagen)",
} as const;

export type Grado = 1 | 2 | 3 | 4 | 5;
/** Índice 0..4 = filas «≤1» … «≤5» de la tabla. */
export type PorGrado<T> = readonly [T, T, T, T, T];
/** null = casilla sombreada (no aceptable); [] = casilla en blanco (sin condición). */
export type Casilla = readonly string[] | null;

// ---- Presencia de agua y grado de muros ----------------------------------------

/** ap. 2.1.1 pto 2 + Apéndice A. Δ = profundidad de la cara inferior del suelo − profundidad del NF [m]. */
export const PRESENCIA_AGUA = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.1.1 pto 2; Apéndice A (nivel freático)" },
  {
    /** baja: Δ < 0 («por encima»). media: 0 ≤ Δ < 2 («a la misma profundidad … o a menos de
     *  dos metros por debajo»). alta: Δ ≥ 2 («a dos o más metros por debajo»). */
    umbralMedia_m: 0,
    umbralAlta_m: 2,
    /** Apéndice A: valor MEDIO ANUAL, medido desde la superficie del terreno. */
    nivelFreaticoEsMedioAnual: true,
  } as const,
);

/** Tabla 2.1. Columnas de Ks [cm/s]: alto Ks ≥ 1e-2 · medio 1e-5 < Ks < 1e-2 · bajo Ks ≤ 1e-5. */
export const GRADO_MUROS_TABLA_2_1 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.1.1 pto 1", tabla: "Tabla 2.1" },
  {
    alta: { alto: 5, medio: 5, bajo: 4 },
    media: { alto: 3, medio: 2, bajo: 2 },
    baja: { alto: 1, medio: 1, bajo: 1 },
  } as const,
);

// ---- Condiciones de muro (tabla 2.2) ----------------------------------------------

export type TipoMuro = "gravedad" | "flexorresistente" | "pantalla";
export type ImpMuro = "interior" | "exterior" | "parcialmente_estanco";

export const CONDICIONES_MURO_TABLA_2_2 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.1.2 ptos 1 y 2", tabla: "Tabla 2.2" },
  {
    casillas: {
      gravedad: {
        interior: [["I2", "D1", "D5"], ["C3", "I1", "D1", "D3"], ["C3", "I1", "D1", "D3"], null, null],
        exterior: [["I2", "I3", "D1", "D5"], ["I1", "I3", "D1", "D3"], ["I1", "I3", "D1", "D3"], ["I1", "I3", "D1", "D3"], ["I1", "I3", "D1", "D2", "D3"]],
        parcialmente_estanco: [["V1"], ["D4", "V1"], ["D4", "V1"], ["D4", "V1"], ["D4", "V1"]],
      },
      flexorresistente: {
        interior: [["C1", "I2", "D1", "D5"], ["C1", "C3", "I1", "D1", "D3"], ["C1", "C3", "I1", "D1", "D3"], null, null],
        exterior: [["I2", "I3", "D1", "D5"], ["I1", "I3", "D1", "D3"], ["I1", "I3", "D1", "D3"], ["I1", "I3", "D1", "D3"], ["I1", "I3", "D1", "D2", "D3"]],
        parcialmente_estanco: [["V1"], ["D4", "V1"], ["D4", "V1"], ["D4", "V1"], ["D4", "V1"]],
      },
      pantalla: {
        interior: [["C2", "I2", "D1", "D5"], ["C1", "C2", "I1"], ["C1", "C2", "I1"], ["C1", "C2", "I1"], ["C1", "C2", "I1"]],
        exterior: [["C2", "I2", "D1", "D5"], ["C2", "I1"], ["C2", "I1"], ["C2", "I1"], ["C2", "I1"]],
        // ≤1: la única casilla en blanco de la tabla.
        parcialmente_estanco: [[], ["D4", "V1"], ["D4", "V1"], ["D4", "V1"], ["D4", "V1"]],
      },
    } satisfies Record<TipoMuro, Record<ImpMuro, PorGrado<Casilla>>>,
    /** Notas del pie: la casilla NO es aceptable si nº de sótanos > maxSotanos. */
    notas: [
      { muro: "gravedad", imp: "interior", grado: 2, nota: 3 },
      { muro: "gravedad", imp: "interior", grado: 3, nota: 3 },
      { muro: "flexorresistente", imp: "interior", grado: 3, nota: 2 },
      { muro: "gravedad", imp: "parcialmente_estanco", grado: 5, nota: 1 },
    ],
    textoNotas: {
      1: { texto: "Solución no aceptable para más de un sótano.", maxSotanos: 1 },
      2: { texto: "Solución no aceptable para más de dos sótanos.", maxSotanos: 2 },
      3: { texto: "Solución no aceptable para más de tres sótanos.", maxSotanos: 3 },
    },
  } as const,
);

// ---- Grado y condiciones de suelo (tablas 2.3 y 2.4) -------------------------------

/** Tabla 2.3. Columnas [cm/s]: mayor = Ks > 1e-5 (clases alto y medio) · menorIgual = Ks ≤ 1e-5 (bajo). */
export const GRADO_SUELOS_TABLA_2_3 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.2.1 pto 1", tabla: "Tabla 2.3" },
  {
    alta: { mayor: 5, menorIgual: 4 },
    media: { mayor: 4, menorIgual: 3 },
    baja: { mayor: 2, menorIgual: 1 },
  } as const,
);

export type BloqueMuroSuelo = "flexorresistente_o_gravedad" | "pantalla";
export type TipoSuelo = "elevado" | "solera" | "placa";
export type Intervencion = "sub_base" | "inyecciones" | "sin_intervencion";

/** Tabla 2.4. Orden de los códigos: el del DB. Sin muro en contacto con el terreno: bloque
 *  "flexorresistente_o_gravedad" (comentario DccHS p. 16, no reglamentario). */
export const CONDICIONES_SUELO_TABLA_2_4 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.2.2 ptos 1 y 2", tabla: "Tabla 2.4" },
  {
    flexorresistente_o_gravedad: {
      elevado: {
        sub_base: [[], ["C2"], ["I2", "S1", "S3", "V1"], ["I2", "S1", "S3", "V1"], ["I2", "S1", "S3", "V1", "D3"]],
        inyecciones: [[], [], ["I2", "S1", "S3", "V1"], ["I2", "S1", "S3", "V1", "D4"], ["I2", "P1", "S1", "S3", "V1", "D3"]],
        sin_intervencion: [["V1"], ["V1"], ["I2", "S1", "S3", "V1", "D3", "D4"], null, null],
      },
      solera: {
        sub_base: [[], ["C2", "C3"], ["C1", "C2", "C3", "I2", "D1", "D2", "S1", "S2", "S3"], ["C2", "C3", "I2", "D1", "D2", "P2", "S1", "S2", "S3"], ["C2", "C3", "I2", "D1", "D2", "P2", "S1", "S2", "S3"]],
        inyecciones: [["D1"], ["C2", "C3", "D1"], ["C1", "C2", "C3", "I2", "D1", "D2", "S1", "S2", "S3"], ["C2", "C3", "I2", "D1", "D2", "P2", "S1", "S2", "S3"], ["C2", "C3", "I1", "I2", "D1", "D2", "P1", "P2", "S1", "S2", "S3"]],
        sin_intervencion: [["C2", "C3", "D1"], ["C2", "C3", "D1"], ["C2", "C3", "I2", "D1", "D2", "C1", "S1", "S2", "S3"], ["C1", "C2", "C3", "I1", "I2", "D1", "D2", "D3", "D4", "P1", "P2", "S1", "S2", "S3"], null],
      },
      placa: {
        sub_base: [[], ["C2", "C3"], ["C2", "C3", "I2", "D1", "D2", "C1", "S1", "S2", "S3"], ["C2", "C3", "I2", "D1", "D2", "P2", "S1", "S2", "S3"], ["C2", "C3", "D1", "D2", "I2", "P2", "S1", "S2", "S3"]],
        inyecciones: [["D1"], ["C2", "C3", "D1"], ["C1", "C2", "C3", "I2", "D1", "D2", "S1", "S2", "S3"], ["C2", "C3", "I2", "D1", "D2", "P2", "S1", "S2", "S3"], ["C2", "C3", "I1", "I2", "D1", "D2", "P1", "P2", "S1", "S2", "S3"]],
        // ≤3 sin C3: literal en DB 2022 y DccHS 2025 (posible errata, sin comentario). No corregir.
        sin_intervencion: [["C2", "C3", "D1"], ["C2", "C3", "D1"], ["C1", "C2", "I2", "D1", "D2", "S1", "S2", "S3"], ["C1", "C2", "C3", "D1", "D2", "D3", "D4", "I1", "I2", "P1", "P2", "S1", "S2", "S3"], ["C1", "C2", "C3", "I1", "I2", "D1", "D2", "D3", "D4", "P1", "P2", "S1", "S2", "S3"]],
      },
    },
    pantalla: {
      elevado: {
        sub_base: [[], [], ["S3", "V1"], ["S3", "V1"], ["S3", "V1"]],
        inyecciones: [[], [], ["S3", "V1"], ["D4", "S3", "V1"], ["D3", "D4", "S3", "V1"]],
        sin_intervencion: [["V1"], ["V1"], ["S3", "V1"], ["D3", "D4", "S3", "V1"], null],
      },
      solera: {
        sub_base: [[], ["C2", "C3"], ["C1", "C2", "C3", "D1", "P2", "S2", "S3"], ["C2", "C3", "D1", "S2", "S3"], ["C2", "C3", "D1", "P2", "S2", "S3"]],
        inyecciones: [["D1"], ["C2", "C3", "D1"], ["C1", "C2", "C3", "D1", "P2", "S2", "S3"], ["C2", "C3", "D1", "S2", "S3"], ["C2", "C3", "D1", "P2", "S2", "S3"]],
        // ≤4 sin C2 ni D1: literal en DB 2022 y DccHS 2025 (posible errata, sin comentario). No corregir.
        sin_intervencion: [["C2", "C3", "D1"], ["C2", "C3", "D1"], ["C1", "C2", "C3", "D1", "D4", "P2", "S2", "S3"], ["C1", "C3", "I1", "D2", "D3", "P1", "S2", "S3"], ["C1", "C2", "C3", "I1", "D1", "D2", "D3", "D4", "P1", "P2", "S2", "S3"]],
      },
      placa: {
        sub_base: [[], ["C2", "C3"], ["C1", "C2", "C3", "D1", "D2", "D4", "P2", "S2", "S3"], ["C2", "C3", "S2", "S3"], ["C2", "C3", "P2", "S2", "S3"]],
        inyecciones: [[], ["C2", "C3", "D1"], ["C1", "C2", "C3", "D1", "D2", "P2", "S2", "S3"], ["C2", "C3", "D1", "D2", "S2", "S3"], ["C2", "C3", "D1", "D2", "P2", "S2", "S3"]],
        sin_intervencion: [["C2", "C3", "D1"], ["C2", "C3", "D1"], ["C1", "C2", "C3", "D1", "D2", "D3", "D4", "P2", "S2", "S3"], ["C1", "C2", "C3", "I1", "D1", "D2", "D3", "D4", "P1", "S2", "S3"], ["C1", "C2", "C3", "I1", "D1", "D2", "D3", "D4", "P1", "P2", "S2", "S3"]],
      },
    },
  } as const satisfies Record<BloqueMuroSuelo, Record<TipoSuelo, Record<Intervencion, PorGrado<Casilla>>>>,
);

/** Apéndice A, «Suelo elevado»: (sup. de contacto con el terreno + sup. de apoyo) / sup. del suelo < 1/7. */
export const SUELO_ELEVADO = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 1.1 pto 1; Apéndice A (suelo elevado)" },
  { relacionMax: 1 / 7, comparacion: "<" } as const,
);

// ---- Fachadas (tablas 2.5, 2.6 y 2.7) --------------------------------------------------

export type ZonaPluv = "I" | "II" | "III" | "IV" | "V";
export type Exposicion = "V1" | "V2" | "V3";

/** Tabla 2.5: filas = exposición al viento; columnas = zona pluviométrica de promedios. */
export const GRADO_FACHADAS_TABLA_2_5 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.3.1 pto 1 a)", tabla: "Tabla 2.5" },
  {
    V1: { I: 5, II: 5, III: 4, IV: 3, V: 2 },
    V2: { I: 5, II: 4, III: 3, IV: 3, V: 2 },
    V3: { I: 5, II: 4, III: 3, IV: 2, V: 1 },
  } as const satisfies Record<Exposicion, Record<ZonaPluv, Grado>>,
);

/** Tabla 2.6. Filas del DB: «≤15», «16 - 40», «41 – 100 (1)». Se leen como intervalos
 *  (0,15], (15,40], (40,100]: INTERPRETACIÓN (verificacion-hs1.md, 5.7). */
export const EXPOSICION_VIENTO_TABLA_2_6 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.3.1 pto 1 b)", tabla: "Tabla 2.6" },
  {
    filas: [
      { rotulo: "≤15", hasta_m: 15, E1: { A: "V3", B: "V3", C: "V3" }, E0: { A: "V2", B: "V2", C: "V2" } },
      { rotulo: "16 - 40", hasta_m: 40, E1: { A: "V3", B: "V2", C: "V2" }, E0: { A: "V2", B: "V2", C: "V1" } },
      { rotulo: "41 – 100", hasta_m: 100, E1: { A: "V2", B: "V2", C: "V2" }, E0: { A: "V1", B: "V1", C: "V1" } },
    ],
    /** Nota (1), en la fila «41 – 100»: fuera de alcance → DB SE-AE. */
    nota1: "Para edificios de más de 100 m de altura y para aquellos que están próximos a un desnivel muy pronunciado, el grado de exposición al viento debe ser estudiada según lo dispuesto en el DB-SE-AE.",
    alturaMaxTabla_m: 100,
    /** ap. 2.3.1 b): E0 con terreno tipo I, II o III; E1 en los demás casos. */
    entornoPorTerreno: { I: "E0", II: "E0", III: "E0", IV: "E1", V: "E1" },
  } as const,
);

/** Tabla 2.7: cada casilla es una lista de OPCIONES; cada opción, una lista de condiciones.
 *  «Con revestimiento», filas ≤1 y ≤2: una sola casilla «R1+C1(1)», repetida aquí en ambas. */
export const CONDICIONES_FACHADA_TABLA_2_7 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.3.2 ptos 1 y 2", tabla: "Tabla 2.7" },
  {
    con_revestimiento: [
      [["R1", "C1"]],
      [["R1", "C1"]],
      [["R1", "B1", "C1"], ["R1", "C2"]],
      [["R1", "B2", "C1"], ["R1", "B1", "C2"], ["R2", "C1"]],
      [["R3", "C1"], ["B3", "C1"], ["R1", "B2", "C2"], ["R2", "B1", "C1"]],
    ],
    sin_revestimiento: [
      [["C1", "J1", "N1"]],
      [["B1", "C1", "J1", "N1"], ["C2", "H1", "J1", "N1"], ["C2", "J2", "N2"], ["C1", "H1", "J2", "N2"]],
      [["B2", "C1", "J1", "N1"], ["B1", "C2", "H1", "J1", "N1"], ["B1", "C2", "J2", "N2"], ["B1", "C1", "H1", "J2", "N2"]],
      [["B2", "C2", "H1", "J1", "N1"], ["B2", "C2", "J2", "N2"], ["B2", "C1", "H1", "J2", "N2"]],
      [["B3", "C1"]],
    ],
    /** Nota (1) «Cuando la fachada sea de una sóla hoja, debe utilizarse C2.»: en qué opciones
     *  va la llamada (grado 1..5, índice de opción). */
    nota1: [
      { columna: "con_revestimiento", grado: 1, opcion: 0 },
      { columna: "con_revestimiento", grado: 2, opcion: 0 },
      { columna: "con_revestimiento", grado: 4, opcion: 2 },
      { columna: "sin_revestimiento", grado: 1, opcion: 0 },
      { columna: "sin_revestimiento", grado: 2, opcion: 3 },
    ],
    textoNota1: "Cuando la fachada sea de una sóla hoja, debe utilizarse C2.",
    /** ap. 2.3.2 pto 2: SOLO fachadas. Una condición sustituye a las de número menor de su bloque. */
    sustitucion: { R: 3, B: 3, C: 2, H: 1, J: 2, N: 2 },
  } as const,
);

/** ap. 2.3.3.6 pto 1: punto singular que depende del grado. */
export const CARPINTERIA_GRADO_5 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.3.3.6 pto 1" },
  { grado: 5, siCarpinteriaRetranqueada: true, precerco: true, barreraJambasHaciaInterior_cm: 10 } as const,
);

// ---- Cubiertas (ap. 2.4; tablas 2.9 y 2.10) --------------------------------------------

/** Tabla 2.9: intervalos cerrados («incluida dentro de los intervalos»). */
export const PENDIENTES_CUBIERTA_PLANA_TABLA_2_9 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.4.3.1 pto 3", tabla: "Tabla 2.9" },
  {
    filas: [
      { uso: "transitable_peatones", proteccion: "solado_fijo", min_pct: 1, max_pct: 5, nota1: true },
      { uso: "transitable_peatones", proteccion: "solado_flotante", min_pct: 1, max_pct: 5, nota1: false },
      { uso: "transitable_vehiculos", proteccion: "capa_rodadura", min_pct: 1, max_pct: 5, nota1: true },
      { uso: "no_transitable", proteccion: "grava", min_pct: 1, max_pct: 5, nota1: false },
      { uso: "no_transitable", proteccion: "lamina_autoprotegida", min_pct: 1, max_pct: 15, nota1: false },
      { uso: "ajardinada", proteccion: "tierra_vegetal", min_pct: 1, max_pct: 5, nota1: false },
    ],
    textoNota1: "Para rampas no se aplica la limitación de pendiente máxima.",
  } as const,
);

/** Tabla 2.10. Solo obliga sin capa de impermeabilización; texto: pendiente «mayor que» la de
 *  la tabla. NO incluye la fila «Bituminosas» del DccHS 2025 (no está en el consolidado 2022). */
export const PENDIENTES_CUBIERTA_INCLINADA_TABLA_2_10 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.4.3.1 pto 4", tabla: "Tabla 2.10" },
  {
    comparacion: ">",
    filas: [
      { grupo: "teja", pieza: "Teja curva", min_pct: 32, nota3: true },
      { grupo: "teja", pieza: "Teja mixta y plana monocanal", min_pct: 30, nota3: true },
      { grupo: "teja", pieza: "Teja plana marsellesa o alicantina", min_pct: 40, nota3: true },
      { grupo: "teja", pieza: "Teja plana con encaje", min_pct: 50, nota3: true },
      { grupo: "pizarra", pieza: "Pizarra", min_pct: 60, nota3: false },
      { grupo: "placas_perfiles", material: "Cinc", pieza: "Cinc", min_pct: 10, nota3: false },
      { grupo: "placas_perfiles", material: "Fibrocemento", pieza: "Placas simétricas de onda grande", min_pct: 10, nota3: false },
      { grupo: "placas_perfiles", material: "Fibrocemento", pieza: "Placas asimétricas de nervadura grande", min_pct: 10, nota3: false },
      { grupo: "placas_perfiles", material: "Fibrocemento", pieza: "Placas asimétricas de nervadura media", min_pct: 25, nota3: false },
      { grupo: "placas_perfiles", material: "Sintéticos", pieza: "Perfiles de ondulado grande", min_pct: 10, nota3: false },
      { grupo: "placas_perfiles", material: "Sintéticos", pieza: "Perfiles de ondulado pequeño", min_pct: 15, nota3: false },
      { grupo: "placas_perfiles", material: "Sintéticos", pieza: "Perfiles de grecado grande", min_pct: 5, nota3: false },
      { grupo: "placas_perfiles", material: "Sintéticos", pieza: "Perfiles de grecado medio", min_pct: 8, nota3: false },
      { grupo: "placas_perfiles", material: "Sintéticos", pieza: "Perfiles nervados", min_pct: 10, nota3: false },
      { grupo: "placas_perfiles", material: "Galvanizados", pieza: "Perfiles de ondulado pequeño", min_pct: 15, nota3: false },
      { grupo: "placas_perfiles", material: "Galvanizados", pieza: "Perfiles de grecado o nervado grande", min_pct: 5, nota3: false },
      { grupo: "placas_perfiles", material: "Galvanizados", pieza: "Perfiles de grecado o nervado medio", min_pct: 8, nota3: false },
      { grupo: "placas_perfiles", material: "Galvanizados", pieza: "Perfiles de nervado pequeño", min_pct: 10, nota3: false },
      { grupo: "placas_perfiles", material: "Galvanizados", pieza: "Paneles", min_pct: 5, nota3: false },
      { grupo: "placas_perfiles", material: "Aleaciones ligeras", pieza: "Perfiles de ondulado pequeño", min_pct: 15, nota3: false },
      { grupo: "placas_perfiles", material: "Aleaciones ligeras", pieza: "Perfiles de nervado medio", min_pct: 5, nota3: false },
    ],
    notas: {
      1: "En caso de cubiertas con varios sistemas de protección superpuestos se establece como pendiente mínima la menor de las pendientes para cada uno de los sistemas de protección.",
      2: "Para los sistemas y piezas de formato especial las pendientes deben establecerse de acuerdo con las correspondientes especificaciones de aplicación.",
      3: "Estas pendientes son para faldones menores a 6,5 m, una situación de exposición normal y una situación climática desfavorable; para condiciones diferentes a éstas, se debe tomar el valor de la pendiente mínima establecida en norma UNE 127100:1999 ó en norma UNE 136020:2004.",
    },
    faldonMaxNota3_m: 6.5,
  } as const,
);

/** ap. 2.4.3 y 2.4.4: cifras de los componentes que el módulo puede citar o comprobar. */
export const COMPONENTES_CUBIERTA = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.4.3.3.1–2.4.3.3.3; 2.4.3.4; 2.4.3.5.1; 2.4.3.5.4; 2.4.4.2.9 pto 2" },
  {
    camaraVentilada: { relacionMin: 3, relacionMax: 30, comparacion: "estricta" }, // 3 < Ss/Ac < 30 [cm²/m²]
    gravaSueltaPendienteMax_pct: 5, // «menor que el 5 %»
    gravaTamano_mm: [16, 32],
    gravaEspesorMin_cm: 5,
    aglomeradoCalienteSobreImpMin_cm: 8,
    morteroBajoAglomeradoMax_cm: 4,
    laminaFijacionMecanicaSiPendienteMayorQue_pct: 15, // bituminosas, PVC y EPDM
    bituminosasAdheridasEntre_pct: [5, 15],
    canalonCubiertaInclinadaPendienteMin_pct: 1,
  } as const,
);

// ---- Dimensionado (tablas 3.1 a 3.4) ----------------------------------------------------

/** Tabla 3.1. Pendientes en ‰ (por mil). Grado: el del muro (2.1.1) para drenes del muro;
 *  el del suelo (2.2.1) para drenes del suelo (nota 1). */
export const TUBOS_DRENAJE_TABLA_3_1 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 3.1 pto 1", tabla: "Tabla 3.1" },
  {
    filas: [
      { grado: 1, pendienteMin_permil: 3, pendienteMax_permil: 14, dnBajoSuelo_mm: 125, dnPerimetroMuro_mm: 150 },
      { grado: 2, pendienteMin_permil: 3, pendienteMax_permil: 14, dnBajoSuelo_mm: 125, dnPerimetroMuro_mm: 150 },
      { grado: 3, pendienteMin_permil: 5, pendienteMax_permil: 14, dnBajoSuelo_mm: 150, dnPerimetroMuro_mm: 200 },
      { grado: 4, pendienteMin_permil: 5, pendienteMax_permil: 14, dnBajoSuelo_mm: 150, dnPerimetroMuro_mm: 200 },
      { grado: 5, pendienteMin_permil: 8, pendienteMax_permil: 14, dnBajoSuelo_mm: 200, dnPerimetroMuro_mm: 250 },
    ],
    /** Qué condición lleva a qué columna (INTERPRETACIÓN, 8.3). */
    columnaPorCondicion: { muro_D3: "perimetroMuro", suelo_D2: "bajoSuelo", suelo_D3: "perimetroMuro" },
  } as const,
);

/** Tabla 3.2. */
export const ORIFICIOS_DRENAJE_TABLA_3_2 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 3.1 pto 2", tabla: "Tabla 3.2" },
  {
    filas: [
      { dn_mm: 125, orificiosMin_cm2_m: 10 },
      { dn_mm: 150, orificiosMin_cm2_m: 10 },
      { dn_mm: 200, orificiosMin_cm2_m: 12 },
      { dn_mm: 250, orificiosMin_cm2_m: 17 },
    ],
  } as const,
);

/** Tabla 3.3 (muro D4: canaletas de los muros parcialmente estancos). Pendientes en %. */
export const CANALETAS_TABLA_3_3 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 3.2 ptos 1 y 2", tabla: "Tabla 3.3" },
  {
    sumideroDiametroMin_mm: 110,
    filas: [
      { grado: 1, pendienteMin_pct: 5, pendienteMax_pct: 14, m2MuroPorSumidero: 25 },
      { grado: 2, pendienteMin_pct: 5, pendienteMax_pct: 14, m2MuroPorSumidero: 25 },
      { grado: 3, pendienteMin_pct: 8, pendienteMax_pct: 14, m2MuroPorSumidero: 20 },
      { grado: 4, pendienteMin_pct: 8, pendienteMax_pct: 14, m2MuroPorSumidero: 20 },
      { grado: 5, pendienteMin_pct: 12, pendienteMax_pct: 14, m2MuroPorSumidero: 15 },
    ],
  } as const,
);

/** Tabla 3.4. Cada bomba, para el caudal TOTAL (3.3 pto 1). Caudal > 3,1 l/s → segunda cámara. */
export const CAMARAS_BOMBEO_TABLA_3_4 = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 3.3 ptos 1 y 2; Apéndice C (caudal en muros)", tabla: "Tabla 3.4" },
  {
    filas: [
      { caudalBomba_l_s: 0.15, volumenCamaraMin_m3: 2.4 },
      { caudalBomba_l_s: 0.31, volumenCamaraMin_m3: 2.85 },
      { caudalBomba_l_s: 0.46, volumenCamaraMin_m3: 3.6 },
      { caudalBomba_l_s: 0.61, volumenCamaraMin_m3: 3.9 },
      { caudalBomba_l_s: 0.76, volumenCamaraMin_m3: 4.5 },
      { caudalBomba_l_s: 1.15, volumenCamaraMin_m3: 5.7 },
      { caudalBomba_l_s: 1.53, volumenCamaraMin_m3: 9.6 },
      { caudalBomba_l_s: 1.91, volumenCamaraMin_m3: 10.8 },
      { caudalBomba_l_s: 2.3, volumenCamaraMin_m3: 15 },
      { caudalBomba_l_s: 3.1, volumenCamaraMin_m3: 20 },
    ],
    /** Cuándo hay bombas (textos de D2–D4): siempre, o solo si la conexión queda por encima del drenaje. */
    bombas: {
      muro: { D2: "siempre", D3: "si_conexion_por_encima", D4: "si_conexion_por_encima" },
      suelo: { D2: "si_conexion_por_encima", D3: "si_conexion_por_encima", D4: "siempre" },
    },
    bombasPorCamara: 2,
  } as const,
);

/** Fórmulas (2.1), (2.2) y V1 de muro. */
export const VENTILACION_CAMARAS = tablaCTE(
  { ...PROC_HS1, articulo: "ap. 2.1.2 (V1, fórm. 2.1); ap. 2.2.2 (V1, fórm. 2.2)" },
  {
    muro: { relacionMin: 10, relacionMax: 30, distanciaMaxAberturas_m: 5, caudalLocalMin_l_s_m2: 0.7 }, // 10 < Ss/Ah < 30
    sueloElevado: { relacionMin: 10, relacionMax: 30, distanciaMaxAberturas_m: 5 }, // 10 < Ss/As < 30
    desigualdadEstricta: true,
  } as const,
);
```

### Textos de una línea de cada condición

Los códigos son **locales a cada tabla**: un diccionario por elemento. Las condiciones con «cuando…» llevan `siAplica`, para que la memoria diga «no aplica» si el material no lo pide.

```ts
export const TEXTOS_CONDICION_MURO = {
  C1: { bloque: "Constitución", siAplica: "muro de hormigón in situ", texto: "Hormigón hidrófugo." },
  C2: { bloque: "Constitución", siAplica: "muro construido in situ", texto: "Hormigón de consistencia fluida." },
  C3: { bloque: "Constitución", siAplica: "muro de fábrica", texto: "Bloques o ladrillos hidrofugados y mortero hidrófugo." },
  I1: { bloque: "Impermeabilización", texto: "Lámina impermeabilizante o producto líquido (polímeros acrílicos, caucho acrílico, resinas sintéticas o poliéster); en pantallas con excavación, lodos bentoníticos. Por el interior, lámina adherida; por el exterior, capa antipunzonamiento exterior (adherida) o en ambas caras (no adherida), suprimible la exterior con lámina drenante; los líquidos, con capa protectora exterior salvo lámina drenante." },
  I2: { bloque: "Impermeabilización", texto: "Pintura impermeabilizante o lo establecido en I1; en pantallas con excavación, lodos bentoníticos." },
  I3: { bloque: "Impermeabilización", siAplica: "muro de fábrica", texto: "Revestimiento hidrófugo por la cara interior (mortero hidrófugo sin revestir, cartón-yeso sin yeso higroscópico u otro material no higroscópico)." },
  D1: { bloque: "Drenaje y evacuación", texto: "Capa drenante y capa filtrante entre el muro (o su impermeabilización) y el terreno; si es lámina drenante, remate superior protegido de la lluvia y las escorrentías." },
  D2: { bloque: "Drenaje y evacuación", texto: "Pozo drenante junto al muro cada 50 m como máximo, de Ø interior ≥ 0,7 m, con capa filtrante y dos bombas de achique." },
  D3: { bloque: "Drenaje y evacuación", texto: "Tubo drenante en el arranque del muro conectado al saneamiento o a reutilización; si la conexión queda por encima del drenaje, cámara de bombeo con dos bombas de achique." },
  D4: { bloque: "Drenaje y evacuación", texto: "Canaletas de recogida en la cámara del muro conectadas al saneamiento o a reutilización; si la conexión queda por encima, cámara de bombeo con dos bombas de achique." },
  D5: { bloque: "Drenaje y evacuación", texto: "Red de evacuación del agua de lluvia de la cubierta y del terreno que afecten al muro, conectada al saneamiento o a reutilización." },
  V1: { bloque: "Ventilación de la cámara", texto: "Aberturas en el arranque y la coronación de la hoja interior (50 % y 50 %, al tresbolillo), 10 < Ss/Ah < 30, a ≤ 5 m entre sí; el local, ventilado con ≥ 0,7 l/s por m² útil." },
} as const;

export const TEXTOS_CONDICION_SUELO = {
  C1: { bloque: "Constitución", siAplica: "suelo construido in situ", texto: "Hormigón hidrófugo de elevada compacidad." },
  C2: { bloque: "Constitución", siAplica: "suelo construido in situ", texto: "Hormigón de retracción moderada." },
  C3: { bloque: "Constitución", texto: "Hidrofugación complementaria con un producto líquido colmatador de poros sobre la superficie terminada." },
  I1: { bloque: "Impermeabilización", texto: "Lámina exterior sobre la capa base de regulación del terreno, con capa antipunzonamiento encima (adherida) o en ambas caras (no adherida); en placa, lámina doble." },
  I2: { bloque: "Impermeabilización", texto: "Lámina sobre el hormigón de limpieza en la base de la zapata (muro flexorresistente) o del muro (gravedad), con sus capas antipunzonamiento y el encuentro con la lámina del suelo sellado." },
  D1: { bloque: "Drenaje y evacuación", texto: "Capa drenante y capa filtrante sobre el terreno bajo el suelo; si es un encachado, lámina de polietileno encima." },
  D2: { bloque: "Drenaje y evacuación", texto: "Tubos drenantes bajo el suelo conectados al saneamiento o a reutilización; si la conexión queda por encima del drenaje, cámara de bombeo con dos bombas de achique." },
  D3: { bloque: "Drenaje y evacuación", texto: "Tubos drenantes en la base del muro, con la misma conexión y bombeo; con muro pantalla, a 1 m por debajo del suelo y repartidos junto al muro." },
  D4: { bloque: "Drenaje y evacuación", texto: "Un pozo drenante por cada 800 m² bajo el suelo, de Ø interior ≥ 70 cm, con envolvente filtrante, dos bombas de achique, conexión de evacuación y achique automático permanente." },
  P1: { bloque: "Tratamiento perimétrico", texto: "Acera, zanja drenante u otro elemento equivalente en el perímetro del muro para limitar el agua superficial." },
  P2: { bloque: "Tratamiento perimétrico", texto: "Borde de la placa o de la solera encastrado en el muro." },
  S1: { bloque: "Sellado de juntas", texto: "Encuentros de las láminas del muro con las del suelo y con las de la base de las cimentaciones en contacto con el muro, sellados." },
  S2: { bloque: "Sellado de juntas", texto: "Todas las juntas del suelo selladas con banda de PVC o perfiles de caucho expansivo o de bentonita de sodio." },
  S3: { bloque: "Sellado de juntas", texto: "Encuentros suelo–muro sellados con banda de PVC o perfiles de caucho expansivo o de bentonita de sodio (ap. 2.2.3.1)." },
  V1: { bloque: "Ventilación de la cámara", texto: "Cámara bajo el suelo elevado ventilada al exterior por aberturas al 50 % en dos paredes enfrentadas, al tresbolillo, 10 < Ss/As < 30, a ≤ 5 m entre sí." },
} as const;

export const TEXTOS_CONDICION_FACHADA = {
  R1: { bloque: "Revestimiento exterior", nivel: 1, texto: "Resistencia media a la filtración: continuo de 10–15 mm (armado con malla si va sobre aislante exterior) o discontinuo rígido pegado de piezas < 300 mm sobre enfoscado." },
  R2: { bloque: "Revestimiento exterior", nivel: 2, texto: "Resistencia alta: discontinuo rígido fijado mecánicamente con las características de R1 salvo el tamaño de pieza." },
  R3: { bloque: "Revestimiento exterior", nivel: 3, texto: "Resistencia muy alta: continuo estanco y sin fisuración, o discontinuo fijado mecánicamente de escamas, lamas, placas o sistemas con aislamiento." },
  B1: { bloque: "Barrera contra el agua", nivel: 1, texto: "Cámara de aire sin ventilar, o aislante no hidrófilo en la cara interior de la hoja principal." },
  B2: { bloque: "Barrera contra el agua", nivel: 2, texto: "Cámara sin ventilar más aislante no hidrófilo por el interior de la hoja principal, o aislante no hidrófilo por el exterior de la hoja principal." },
  B3: { bloque: "Barrera contra el agua", nivel: 3, texto: "Cámara ventilada de 3–10 cm al exterior de un aislante no hidrófilo, con evacuación del agua y aberturas ≥ 120 cm² por 10 m² de paño; o revestimiento continuo intermedio estanco." },
  C1: { bloque: "Hoja principal", nivel: 1, texto: "Espesor medio: ½ pie de ladrillo cerámico o 12 cm de bloque cerámico, de hormigón o de piedra natural." },
  C2: { bloque: "Hoja principal", nivel: 2, texto: "Espesor alto: 1 pie de ladrillo cerámico o 24 cm de bloque cerámico, de hormigón o de piedra natural." },
  H1: { bloque: "Higroscopicidad", nivel: 1, texto: "Ladrillo de succión ≤ 4,5 kg/m²·min (UNE-EN 772-11:2011) o piedra natural de absorción ≤ 2 % (UNE-EN 13755:2008)." },
  J1: { bloque: "Juntas", nivel: 1, texto: "Juntas de mortero sin interrupción (en bloque de hormigón, interrumpidas en la parte intermedia de la hoja)." },
  J2: { bloque: "Juntas", nivel: 2, texto: "Juntas de mortero con hidrófugo, sin interrupción, horizontales llagueadas o en pico de flauta y, si se puede, rejuntado con mortero más rico." },
  N1: { bloque: "Revestimiento intermedio", nivel: 1, texto: "Enfoscado de mortero de 10 mm como mínimo en la cara interior de la hoja principal." },
  N2: { bloque: "Revestimiento intermedio", nivel: 2, texto: "Enfoscado con aditivos hidrofugantes de 15 mm como mínimo, o material adherido, continuo, sin juntas e impermeable del mismo espesor." },
} as const;

/** ap. 2.4.2 pto 1, letras a) a k). `cuando` resume la condición literal. */
export const ELEMENTOS_CUBIERTA_2_4_2 = {
  a: { elemento: "Sistema de formación de pendientes", cuando: "cubierta plana; en inclinada, si el soporte no tiene la pendiente adecuada" },
  b: { elemento: "Barrera contra el vapor bajo el aislante", cuando: "si el cálculo de HE 1 prevé condensaciones en el aislante" },
  c: { elemento: "Capa separadora bajo el aislante", cuando: "si hay materiales químicamente incompatibles" },
  d: { elemento: "Aislante térmico", cuando: "según HE 1" },
  e: { elemento: "Capa separadora bajo la impermeabilización", cuando: "si hay incompatibilidad química o hay que evitar la adherencia (sistemas no adheridos)" },
  f: { elemento: "Capa de impermeabilización", cuando: "cubierta plana; en inclinada, si la pendiente no llega a la de la tabla 2.10 o el solapo es insuficiente" },
  g: { elemento: "Capa separadora entre protección e impermeabilización", cuando: "evitar adherencia; impermeabilización poco resistente al punzonamiento; solado flotante sobre soportes, grava (antipunzonante), rodadura de hormigón, aglomerado sobre mortero o tierra vegetal (con capa drenante y filtrante)" },
  h: { elemento: "Capa separadora entre protección y aislante", cuando: "tierra vegetal (con capa drenante y filtrante); transitable para peatones (antipunzonante); grava (filtrante y antipunzonante)" },
  i: { elemento: "Capa de protección", cuando: "cubierta plana, salvo impermeabilización autoprotegida" },
  j: { elemento: "Tejado", cuando: "cubierta inclinada, salvo impermeabilización autoprotegida" },
  k: { elemento: "Sistema de evacuación de aguas (canalones, sumideros, rebosaderos) dimensionado por HS 5", cuando: "siempre" },
} as const;
```

### Criterios de proyecto (no son CTE: la ficha debe rotularlos así)

```ts
export const CRITERIOS_PROYECTO_HS1 = {
  origen: "criterio de proyecto (no exigencia CTE)",
  espesorBajoCotaSuelo_m: 0.3, // ya en partes.ts; aviso si Δ queda a < 0,30 m de 0 o de 2 m
  alturaCoronacion: "cara superior del forjado de cubierta; aviso si h + 1,10 m supera 15 o 40 m",
  filasTabla2_6: "intervalos (0,15], (15,40], (40,100]; > 100 m o desnivel pronunciado: fuera de alcance (DB SE-AE)",
  filaTablas2_2y2_4: "fila = grado exigido; no subir de fila automáticamente; las filas no se acumulan",
  sueloSinMuro: "bloque «flexorresistente o de gravedad» de la tabla 2.4 (DccHS p. 16, no reglamentario)",
  condicionesDeMuroSinMuro: "I2, S1, S3, P1, P2, D3 → cimentación perimetral, con aviso",
  sinDatos: { presencia: "alta", ksMuro: "alto", ksSuelo: "mayor", zonaPluv: "I", zonaEolica: "C", entorno: "E0" },
  freaticoNoDetectado: "baja si el reconocimiento llegó más hondo que la cara inferior; si no se sabe, baja con aviso",
  gradoDrenSueloD3: "max(grado del muro, grado del suelo)",
  tabla3_4: "fila de caudal igual o inmediatamente superior; > 3,1 l/s: segunda cámara",
  sumiderosCanaleta: "ceil(superficie de muro / m2MuroPorSumidero)",
  bombeoSinCotaAlcantarillado: "suponer bombeo y avisar",
  revestimientoSinR1: "justificar por la columna «sin revestimiento»",
  ajardinada: "protección «tierra vegetal» dentro de plana_no_transitable",
  solucionAlternativa: "otra solución de prestaciones equivalentes (CTE Parte I art. 5): veredicto «criterio» con justificación del proyectista",
  demo: { zonaPluviometrica: "III", entorno: "E1", rotulo: "supuesto de demostración, pendiente de lectura de la figura 2.4" },
} as const;
```
