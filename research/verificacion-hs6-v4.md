# Verificación normativa — HS 6 (radón) para el rediseño v4: ámbito desde El edificio, garaje como espacio de contención y deuda de `hs6/tablas.ts`

**Fecha:** 2026-10-04
**Ámbito:** las 11 preguntas del encargo, en el mismo orden (bloques 1 a 11), más la deuda anotada en `REDISENO-V4.md` §6:
- citar «ap. 3 pto 1 a) y b)» en lugar de «art. 3.1»;
- difusión estrictamente < 10⁻¹¹ m²/s;
- 5 cm solo en edificios existentes;
- «0,1 ren/h»;
- garaje ventilado como espacio de contención.

**Regla aplicada:** ninguna cifra se da por buena sin haber leído el texto. Cada fila dice qué fuente se leyó. Veredictos:
- VERIFICADO: literal en el texto, coincidente con una segunda fuente cuando la hay.
- **LEÍDO (1 fuente)**: literal en una sola fuente, no contrastado.
- **CORREGIDO**: la afirmación del encargo o del repo no coincide con el DB.
- **NO VERIFICABLE**: el DB no lo dice, o no se ha podido leer.
- **CRITERIO**: decisión de proyecto propuesta. No es exigencia del CTE y la ficha debe rotularla así.

**Aviso importante sobre la lectura.** No he podido leer el PDF maquetado. `DBHS.pdf` se descargó (4,4 MB), pero el extractor lo recibe como binario y en esta máquina no hay poppler. Al BOE le pasa lo mismo: el PDF llega en binario y el HTML se corta antes del anejo II. El texto literal sale de una **transcripción HTML del consolidado de 2022** ([N22]), leída por fragmentos y recompuesta. Por eso:
- Las cifras con dos fuentes coincidentes se pueden usar.
- Todas siguen pendientes del cotejo tipográfico contra el PDF (regla del proyecto, §6).

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [N22] | DB-HS, Sección HS 6 «Protección frente a la exposición al radón», transcripción HTML | Se declara «Versión 2022 Vigente» (consolidado 14-06-2022) | normatia.com, `/es/normativa/cte-db-hs/2022/seccion-hs-6-proteccion-frente-a-la-exposicion-al-radon` | Ap. 1 a 6, Apéndices A y B (solo la introducción). El extractor devuelve fragmentos de ≤ 120 caracteres, que he recompuesto. La tabla de municipios se corta en Cantabria |
| [N22-HS3] | DB-HS, Sección HS 3, transcripción HTML | Ídem | normatia.com, sección HS 3 | Título de 3.2.1, ptos 4 y 5; Tabla 2.2 (garajes, trasteros) |
| [VEU] | `research/verificacion-edificio-usos.md`, Bloque F | Lectura del `DBHS.pdf` oficial, consolidado 14-06-2022, en una sesión anterior | repo | Ámbito de HS 6, Apéndice A (no habitables) y 3.2 «ptos 1 y 5» (allí citados como «3.2.1 y 3.2.5») |
| [R4] | `REDISENO-V4.md` §6 | Verificación del 2026-10-03 | repo | Solo conclusiones, sin literales |
| [BOE19] | RD 732/2019, BOE núm. 311 de 27-12-2019 (BOE-A-2019-18528) | Original | boe.es, HTML | Solo el artículo que incorpora HS 6 como anejo II. El HTML se corta antes del anejo |
| [CTO] | Páginas HTML de codigotecnico.org | Consulta 2026-10-04 | `DocumentosCTE/Salubridad.html`, `QueEsCTE/ElCTEenElBOE.html`, `Guias/GuiaRadon.html` | Íntegras |
| [IS47] | Instrucción IS-47 del CSN, de 9-04-2025 (BOE-A-2025-8734) | Original | boe.es, HTML | Art. tercero |
| [NMun] | Fichas por municipio de normatia.com | Consulta 2026-10-04 | Cáceres, Trujillo, Plasencia, Arroyo de la Luz, Acebo, Ávila, Ourense, Belmez | Campo «Radón» |

**No leídos:**
- `DBHS.pdf` y el PDF del BOE-A-2019-18528: binarios para el extractor y sin poppler.
- `DcmHS.pdf` (marcas del RD 450/2022) y `DccHS.pdf` (comentarios del Ministerio, 12-02-2025): son PDF.
- Guía de rehabilitación frente al radón (IETcc-CSIC, 2022) y sus fichas A1 a C1: PDF. Es documento de apoyo, no reglamentario, y es para rehabilitación.
- Lista oficial de municipios de Extremadura del Apéndice B.

---

## Bloque 1 — Ámbito (ap. 1)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 1.1 | HS 6 se aplica a la obra nueva | VERIFICADO, con condición territorial | Se aplica solo en los municipios del Apéndice B: a la obra nueva y a las intervenciones | ap. 1 pto 1: «Esta sección se aplica a los edificios situados en los términos municipales incluidos en el apéndice B, en los siguientes casos: a) edificios de nueva construcción; b) intervenciones en edificios existentes: […]» | [N22] [VEU] |
| 1.2 | Locales no habitables (garaje, trasteros, cuartos de instalaciones) | VERIFICADO | Fuera del ámbito. El Apéndice A los nombra expresamente | ap. 1 pto 2 a): «en locales no habitables, por ser recintos con bajo tiempo de permanencia;». Apéndice A, «Local no habitable»: «Recinto interior no destinado al uso permanente de personas por lo que no exige unas condiciones especiales de protección dentro del ámbito de aplicación de esta sección». Ejemplos: «garajes, trasteros y cuartos técnicos» | [N22] [VEU] |
| 1.3 | ¿Hay otra exclusión para locales habitables? | VERIFICADO | Una sola: los separados del terreno por **espacios abiertos** con ventilación análoga a la exterior | ap. 1 pto 2 b): «en locales habitables que se encuentren separados de forma efectiva del terreno a través de espacios abiertos intermedios donde el nivel de ventilación sea análogo al del ambiente exterior.» | [N22] [VEU] |
| 1.4 | Repo (`AMBITO_APLICACION`): «HS 6 aplica a locales habitables en contacto con el terreno; con una planta no habitable interpuesta, no exige medidas» | **CORREGIDO** | El ap. 1 no habla de «contacto con el terreno». Una planta no habitable **cerrada** (garaje o trasteros en sótano) **no exime**: puede ser el espacio de contención (ap. 3.2 ptos 1 y 5). Solo exime un espacio **abierto** con ventilación análoga a la exterior (pto 2 b) | ap. 1 ptos 1 y 2; ap. 3.2 pto 1 | [N22] |
| 1.5 | ¿Las viviendas de plantas altas quedan fuera? | VERIFICADO (lo que dice el DB) + **CRITERIO** (cómo mostrarlo) | El DB no las excluye. Las medidas se disponen «entre el terreno y los locales habitables del edificio» y protegen a todo el edificio. No hacen falta medidas propias por planta | ap. 3 pto 1 a) y b); ap. 2 pto 1 (la exigencia es para «los locales habitables», sin distinguir plantas) | [N22] |
| 1.6 | Local sin uso en PB | **NO VERIFICABLE** (el DB no trata el caso) → **CRITERIO** | Protegerlo como habitable. Su uso previsible (comercio u oficina) entra en «recintos de trabajo o abiertos al público». Además, el acondicionamiento posterior solo activa HS 6 si altera la protección (ap. 1 pto 1 b, reforma) | Apéndice A, «Local habitable»: «Recinto interior destinado al uso de personas cuya densidad de ocupación y tiempo de estancia exige unas condiciones acústicas, térmicas y de salubridad adecuadas», con ejemplos: «habitaciones y estancias (dormitorios, comedores, salones, cocinas, baños, aseos, distribuidores interiores de las viviendas, etc.); recintos de trabajo o abiertos al público como aulas, bibliotecas, habitaciones hospitalarias, despachos, salas de espera o de reuniones, etc.» | [N22] (1 fuente) |
| 1.7 | Local habitable dentro del garaje (cabina de vigilante) | LEÍDO (1 fuente) | Admite como alternativa la sobrepresión con aire exterior | ap. 3 pto 2: «Cuando existan locales habitables situados en grandes áreas que no están protegidas, tales como cabinas de vigilante en garajes, podrá emplearse para la protección de dichos locales, como solución alternativa a las establecidas en los párrafos anteriores, la creación de una sobrepresión en el interior del local habitable mediante la introducción de aire del exterior.» | [N22] |
| 1.8 | Municipio fuera del Apéndice B → sin exigencia | VERIFICADO | La Sección HS 6 no se aplica (el ap. 1 pto 1 la limita a esos municipios). `sin_exigencia` es correcto, pero hay que cambiar el texto (ver «Para el código») | ap. 1 pto 1 | [N22] |

**Nota 1.4 — qué debe deducir El edificio.** Por cada local habitable, el módulo debe saber qué tiene debajo:
- **terreno** (solera o sótano habitable): lo protegen las medidas en sus elementos en contacto con el terreno;
- **un local no habitable cerrado** que toca el terreno (garaje, trasteros, instalaciones): HS 6 aplica y ese local es candidato a espacio de contención;
- **un espacio abierto** con ventilación análoga a la exterior (planta baja diáfana o sobre pilotes): exención del pto 2 b).

Si un aparcamiento «abierto» en el sentido del DB-SI equivale al pto 2 b) es **CRITERIO**, porque el DB-HS 6 no lo dice. Debe ser un aviso, no una exención automática.

---

## Bloque 2 — Nivel de referencia (ap. 2)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 2.1 | 300 Bq/m³ de media anual | VERIFICADO | 300 Bq/m³, promedio anual, en el interior de los locales habitables | ap. 2 pto 1: «Para limitar el riesgo de exposición de los usuarios a concentraciones inadecuadas de radón procedente del terreno en el interior de los locales habitables, se establece un nivel de referencia para el promedio anual de concentración de radón en el interior de los mismos de 300 Bq/m3.» | [N22] [VEU] |
| 2.2 | Tratarlo como límite «≤ 300» | VERIFICADO (interpretación coherente) | Lo inadmisible es superarlo, así que ≤ 300 es correcto | Apéndice A, «Nivel de referencia»: «Valor del promedio anual de concentración de radón por encima del cual se considera inapropiado permitir que se produzcan exposiciones.» | [N22] (1 fuente) |
| 2.3 | En obra nueva, ¿hay que calcular o medir la concentración? | VERIFICADO: **no** | El cumplimiento se verifica disponiendo las soluciones del ap. 3 pto 1. Las mediciones (Apéndice C) aparecen en intervenciones | ap. 3 pto 1, encabezado: «Para verificar el cumplimiento del nivel de referencia […] deberán implementarse las siguientes soluciones, u otras que proporcionen un nivel de protección análogo o superior:». Mediciones: ap. 3 pto 4; ap. 3.2 pto 7; ap. 3.3 pto 6 | [N22] |
| 2.4 | Cita «art. 2» en el repo | **CORREGIDO** | «ap. 2 pto 1». En el CTE, «artículo» es de la Parte I | — | [N22] |

---

## Bloque 3 — Qué exige cada zona (ap. 3 pto 1)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 3.1 | Cita «art. 3.1 (Niveles de protección)» | **CORREGIDO** | **ap. 3 pto 1 a) y b)**. El ap. 3.1 es «Barrera de protección» | Encabezados: «3 Verificación y justificación del cumplimiento de la exigencia», «3.1 Barrera de protección», «3.2 Espacio de contención ventilado», «3.3 Despresurización del terreno» | [N22] |
| 3.2 | Zona I: barrera **o espacio de contención ventilado** | **CORREGIDO** (redacción) | Barrera (3.1) **o**, alternativamente, una **cámara de aire** ventilada según 3.2 **y** separada de los locales habitables por un cerramiento sin grietas, fisuras ni discontinuidades | ap. 3 pto 1 a), literal en la nota 3.2 | [N22] [VEU] («cámara de aire ventilada») |
| 3.3 | Zona I con garaje ventilado como única medida | **NO VERIFICABLE** como literal → **CRITERIO** | La letra a) dice «cámara de aire», no «local no habitable». El garaje entra por el encabezado del pto 1 («u otras que proporcionen un nivel de protección análogo o superior»), apoyado en 3.2 pto 1 (un local no habitable puede ser espacio de contención) y pto 5 (su ventilación de HS 3 basta). Veredicto en la UI: `criterio`, nunca CUMPLE automático | ap. 3 pto 1, encabezado y a); ap. 3.2 ptos 1 y 5 | [N22] |
| 3.4 | Zona II: barrera + (espacio de contención **o** despresurización) | VERIFICADO | Barrera obligatoria más **un** sistema adicional | ap. 3 pto 1 b), literal en la nota 3.4 | [N22] [VEU] |
| 3.5 | La despresurización no es medida única en zona I | VERIFICADO (no está en la letra a) | Solo aparece como sistema adicional de zona II. Fuera de eso, solo por la vía «u otras… análogo o superior», que es CRITERIO | ap. 3 pto 1 a) y b) | [N22] |
| 3.6 | Zona I = «potencial medio», zona II = «potencial alto» (`tablas.ts`) | **NO VERIFICABLE** | El Apéndice B, en lo leído, solo dice «municipios de zona I / zona II». No mostrar esas etiquetas como texto del DB | Apéndice B, introducción (ver bloque 10) | [N22] |

**Nota 3.2 — ap. 3 pto 1 a), literal.** «En los municipios de zona I, se dispondrá una barrera de protección, con las características indicadas en el apartado 3.1, entre el terreno y los locales habitables del edificio, que limite el paso de los gases provenientes del terreno. Alternativamente, se podrá disponer entre el terreno y los locales habitables del edificio una cámara de aire destinada a mitigar la entrada del gas radón a estos locales. En este caso, la cámara de aire deberá estar ventilada según las indicaciones contenidas en el apartado 3.2 y separada de los locales habitables mediante un cerramiento sin grietas, fisuras o discontinuidades entre los elementos y sistemas constructivos que pudieran permitir el paso del radón.»

**Nota 3.4 — ap. 3 pto 1 b), literal.** «En los municipios de zona II, se dispondrá una barrera de protección, con las características indicadas en el apartado 3.1 junto con un sistema adicional que podrá ser: un espacio de contención ventilado con las características indicadas en el apartado 3.2, situado entre el terreno y los locales a proteger, para mitigar la entrada de radón proveniente del terreno a los locales habitables mediante ventilación natural o mecánica; o bien, un sistema de despresurización del terreno con las características indicadas en el apartado 3.3, que permita extraer los gases contenidos en el terreno colindante al edificio.»

**Nota 3 — resto del ap. 3.** Los ptos 3 y 4 son de intervenciones en edificios existentes (soluciones alternativas y mediciones según el Apéndice C). No afectan a la obra nueva.

---

## Bloque 4 — Barrera de protección (ap. 3.1)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 4.1 | Qué es una barrera | VERIFICADO | Cualquier elemento que limite el paso de los gases y cuya efectividad pueda demostrarse | ap. 3.1.1 pto 1: «La barrera de protección será todo aquel elemento que limite el paso de los gases provenientes del terreno y cuya efectividad pueda demostrarse.» Apéndice A: «Barrera situada entre el terreno y los locales a proteger que, por su característica de baja exhalación de radón, es capaz de frenar el paso del radón a su través, dificultando así el paso del radón al interior del edificio.» | [N22] |
| 4.2 | Barrera tipo sin cálculo: D ≤ 10⁻¹¹ m²/s y espesor ≥ 2 mm (`tablas.ts`) | **CORREGIDO** en el coeficiente; VERIFICADO en el espesor | **D < 10⁻¹¹ m²/s (estricto)** y **e ≥ 2 mm**. Solo para barreras **tipo lámina** | ap. 3.1.1 pto 2: «La barrera podrá dimensionarse según lo descrito en el apartado 3.1.2, si bien, se consideran válidas (y no es necesario proceder a su cálculo) las barreras tipo lámina con un coeficiente de difusión frente al radón menor que 10⁻¹¹ m²/s y un espesor mínimo de 2 mm.» | [N22] [R4]; el fragmento «menor que 10⁻¹¹ m²/s y un espesor mínimo de 2 mm» aparece igual en el buscador |
| 4.3 | Continuidad, juntas, encuentros, penetraciones y puertas | VERIFICADO; el repo está **incompleto** | Cinco condiciones a) a e). Al repo le faltan el **cierre automático** de las puertas, la ausencia de **fisuras** y la **durabilidad** | ap. 3.1.1 pto 3, literal en la nota 4.3 | [N22] |
| 4.4 | Barrera en edificios existentes | VERIFICADO (no aplica a obra nueva) | Si no cabe la barrera, los cerramientos hacen de barrera con grietas y juntas selladas, cumpliendo al menos 3 b) y c) | ap. 3.1.1 pto 4 | [N22] |
| 4.5 | ¿Hay justificación «por cálculo»? | VERIFICADO que existe; **LEÍDO (1 fuente)** en fórmulas y constantes | E < Elim. Fórmula (3.1): Elim = Cd · Q / A. Fórmula (3.2): E = 3·10⁵ · λ · l / senh(d/l). Fórmula (3.3): l = √(D · 3600 / λ). Constantes: Cd = 10 % del nivel de referencia; Q = caudal de ventilación del local a proteger, o 0,1 renovaciones/h si se desconoce; λ = 7,56·10⁻³ h⁻¹. **No codificar sin cotejo con el PDF** | ap. 3.1.2 pto 1: «La barrera tendrá un espesor y un coeficiente de difusión tales que la exhalación de radón prevista a su través (E) sea inferior a la exhalación límite (Elim).» Q: «el caudal de ventilación del local a proteger [m3/h]. En el caso de que se desconozca su valor de ventilación, puede considerarse un caudal de cálculo correspondiente a 0,1 renovaciones/hora». Cd: «la concentración de diseño, que se corresponde con el 10% del nivel de referencia [Bq/m3]» | [N22] (1 fuente, vía extractor) |
| 4.6 | Ejecución de la barrera tipo lámina | LEÍDO (1 fuente) | Ver la nota 4.6 | ap. 5.1.1 ptos 1 a 7 | [N22] |

**Nota 4.3 — ap. 3.1.1 pto 3, literal.** «La barrera de protección presentará además las siguientes características:
- a) tener continuidad: juntas y encuentros sellados;
- b) tener sellados los encuentros con los elementos que la interrumpan, como pasos de conducciones o similares;
- c) las puertas de comunicación que interrumpan la continuidad de la barrera deberán ser estancas y estar dotadas de un mecanismo de cierre automático;
- d) no presentar fisuras que permitan el paso por convección del radón del terreno;
- e) tener una durabilidad adecuada a la vida útil del edificio, sus condiciones y el mantenimiento previsto.»

**Nota 4.6 — ap. 5.1.1, ejecución.**
- La barrera va sobre una superficie limpia y uniforme, con hormigón de limpieza o mortero de cal hidráulico.
- Lleva capa antipunzonamiento si la barrera no lo es.
- Pto 4: «La barrera se reforzará en las esquinas, los rincones, los puntos en los que atraviesa los muros, en el paso de conducciones y en otros puntos débiles.»
- Los encuentros, pasos, solapes y uniones se sellan.
- Pto 6: «La barrera horizontal deberá prolongarse por los paramentos verticales (muros, fachadas) hasta 20 cm por encima de la cota exterior del terreno.»
- Pto 7: «Los pozos de registro, arquetas de acometida, huecos o patinillos en contacto con el terreno y todos aquellos elementos que supongan una discontinuidad de la barrera, serán en la medida de lo posible estancos a los gases.»

**Nota 4.5.** La fórmula ya no «diverge entre fuentes»: está en el DB. Lo que falta es cotejar el 3·10⁵, el λ y el 10 % contra el PDF. Mantener el Nivel B diferido.

---

## Bloque 5 — Espacio de contención ventilado (ap. 3.2)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 5.1 | Qué es | VERIFICADO | Una cámara de aire (horizontal o vertical) **o un local no habitable**, siempre ventilado (natural o mecánica) | ap. 3.2 pto 1: «El espacio de contención estará constituido por una cámara de aire, pudiendo ser ésta vertical u horizontal en función del cerramiento a proteger, o por un local no habitable. Este espacio dispondrá en todo caso de ventilación natural o mecánica.» Apéndice A: «Espacio situado entre el terreno y los locales a proteger que recibe el radón proveniente del terreno y que, mediante ventilación natural o mecánica, lo expulsa al exterior del edificio mitigando el paso de radón al interior de los locales habitables.» | [N22] [VEU] |
| 5.2 | Se cita como «ap. 3.2.1 y 3.2.5» (REDISENO §6, [VEU]) | **CORREGIDO** (numeración) | El 3.2 **no tiene subapartados**: sus párrafos van numerados del 1 al 8. Citar «**ap. 3.2 ptos 1 y 5**» | Rótulos del 3.2 en [N22]: «1» a «8» | [N22] |
| 5.3 | Garaje ventilado como espacio de contención: basta la ventilación de HS 3 | VERIFICADO | Sí. Para un local no habitable, la ventilación de HS 3 o del RITE «es suficiente». En zona II la barrera sigue siendo obligatoria; en zona I, ver 3.3 | ap. 3.2 pto 5: «En el caso de emplear locales no habitables como espacios de contención, se considera que la ventilación necesaria establecida por el DB HS3 o por el RITE, según corresponda, es suficiente.» | [N22] (dos lecturas idénticas) [VEU] |
| 5.3b | Qué ventilación de HS 3 es esa | VERIFICADO (por HS 3) | Garajes: 120 l/s por plaza. Trasteros y sus zonas comunes: 0,7 l/s·m² útil (solo en edificios de viviendas; en otro uso, el RITE) | DB-HS 3 ap. 2, Tabla 2.2; ap. 1.1 | [VEU] (D1, D2, C2) [N22-HS3] |
| 5.4 | Aberturas | LEÍDO (1 fuente) | Libres de obstrucciones | ap. 3.2 pto 2: «Para asegurar la ventilación, el espacio de contención deberá conectarse con el exterior mediante aberturas de ventilación que deberán mantenerse libres de obstrucciones.» | [N22] |
| 5.5 | Cámara horizontal con ventilación natural: ≥ 10 cm² por metro lineal de perímetro | VERIFICADO; el repo está **incompleto** | ≥ 10 cm²/m de perímetro, **en todas las fachadas y de forma homogénea**. Con menos de 100 m² pueden ir en una fachada si ningún punto dista más de 10 m de una abertura. Con obstáculos interiores, aberturas que dejen pasar el aire. Salvo estudio específico | ap. 3.2 pto 3, literal en la nota 5.5 | [N22] [R4] |
| 5.6 | Cámara vertical con ventilación natural | LEÍDO (1 fuente) | Aberturas en la parte superior, próximas a la cara exterior del muro, ≥ 10 cm² por metro lineal | ap. 3.2 pto 4: «[…] se dispondrán aberturas de ventilación en la parte superior de dicha cámara, colocadas de forma próxima a la cara exterior del muro a proteger, de manera que el conjunto de aberturas sea de, al menos, 10 cm2 por metro lineal.» | [N22] |
| 5.7 | Ventilación mecánica: el caudal según DB-HS 3 §3.2.1 (`remisionMecanica`) | **CORREGIDO** | HS 6 no fija caudal para la cámara: las aberturas se dimensionan según la cámara y la admisión va lo más lejos posible de la extracción. La remisión a HS 3 **3.2.1** («Aberturas y bocas de ventilación») es **solo para situar las bocas de expulsión**, y en cubierta es opcional | ap. 3.2 pto 8, literal en la nota 5.7. HS 3: «3.2.1 Aberturas y bocas de ventilación» | [N22] [N22-HS3] |
| 5.8 | Altura mínima de cámara de 5 cm (`alturaMinCamara_mm: 50`) | **CORREGIDO** | Solo para una cámara **nueva en un edificio existente** que no la tenía. **En obra nueva el DB no fija altura mínima** | ap. 3.2 pto 6: «En el caso de edificios existentes en los que no exista cámara de aire se podrá implementar una cámara que, aunque no tenga las mismas características de la cámara descrita anteriormente, mejore la protección frente al radón. En este caso la cámara podría construirse por el interior del cerramiento en contacto con el terreno, debiendo ser continua y abarcando toda la superficie a proteger. Además, deberá estar comunicada con el exterior y disponer de una altura o espesor de al menos 5 cm.» | [N22] [R4] |
| 5.9 | «0,1 ren/h» como renovación de referencia de la cámara (`renovacionesRef_ren_h`) | **CORREGIDO**, también la nota de §6 («no se localiza») | **Sí existe**, pero en el **ap. 3.1.2**: es el caudal por defecto **del local a proteger** para calcular Elim de la barrera. No es una exigencia de ventilación de la cámara | ap. 3.1.2, definición de Q (ver 4.5) | [N22] |
| 5.10 | Comprobación de eficacia | LEÍDO (1 fuente) | Por mediciones «posteriores a la intervención» según el Apéndice C. Por contexto (sigue al pto 6), es de intervenciones | ap. 3.2 pto 7 | [N22] |
| 5.11 | Ejecución de las cámaras | LEÍDO (1 fuente) | Cámara horizontal: «es conveniente» hormigón de limpieza bajo ella. Cámara vertical: «podría considerarse una cámara bufa exterior o un patio inglés continuos, aunque no estén totalmente abiertos por la parte superior» | ap. 5.1.2; ap. 5.1.3 | [N22] |

**Nota 5.5 — ap. 3.2 pto 3, literal.** «Para la ventilación natural de una cámara de aire horizontal, salvo que se cuente con estudios específicos que permitan otra distribución, las aberturas de ventilación se dispondrán en todas las fachadas de forma homogénea, siendo el área del conjunto de aberturas de al menos 10 cm2 por metro lineal del perímetro de la cámara. En el caso de superficies de menos de 100 m2, las aberturas podrán disponerse en la misma fachada siempre que ningún punto de la cámara diste más de 10 m de alguna de ellas. Si hay obstáculos a la libre circulación del aire en el interior de la cámara, se dispondrán aberturas que la permitan.»

**Nota 5.7 — ap. 3.2 pto 8, literal.** «Cuando no se cumplan las condiciones necesarias para el establecimiento de ventilación natural o se considere necesario aumentar la eficacia de la instalación en el caso de que las mediciones de concentración de radón posteriores a la intervención no ofrezcan valores aceptables, se dispondrán extractores mecánicos. En este caso las aberturas se dimensionarán según las características específicas de la cámara y las aberturas de admisión se situarán lo más lejos posible de la abertura de extracción para facilitar la ventilación del espacio. Las bocas de expulsión estarán situadas conforme a lo especificado en el apartado 3.2.1 del DB HS3, excepto lo relativo a la disposición en cubierta, que se considera opcional.»

---

## Bloque 6 — Despresurización del terreno (ap. 3.3 y 5.1.4)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 6.1 | Configuración mínima | LEÍDO (1 fuente) | Red de captación (arquetas o tubos perforados) en una capa de relleno granular bajo el edificio, conectada a un conducto de extracción y a extracción mecánica | ap. 3.3 pto 1: «El sistema de despresurización del terreno se configurará mediante una red de elementos de captación, formada por arquetas o tubos perforados instalada en una capa de relleno granular que favorezca la circulación del aire, situada bajo el edificio, conectada a un conducto de extracción y un sistema de extracción mecánica.» | [N22] |
| 6.2 | Bocas de expulsión | LEÍDO (1 fuente) | Según HS 3 ap. 3.2.1. Si no caben en cubierta, cumplir el resto de condiciones | ap. 3.3 pto 2: «Las bocas de expulsión estarán situadas conforme a lo especificado en el apartado 3.2.1 del DB HS3. En el caso de que no fuera posible su disposición en cubierta se deberán cumplir al menos el resto de condiciones descritas en dicho apartado.» | [N22] |
| 6.3 | Continuidad del relleno | LEÍDO (1 fuente) | Si la cimentación lo interrumpe: huecos en los obstáculos o captación en cada zona | ap. 3.3 pto 4 | [N22] |
| 6.4 | Muros | LEÍDO (1 fuente) | Sistema similar, adaptado | ap. 3.3 pto 5 | [N22] |
| 6.5 | Geotextil obligatorio (`calc.ts`: «Falta el geotextil de separación») | **CORREGIDO** | No es obligatorio. Es un **ejemplo** de protección del relleno cuando la solera se vierte directamente sobre él. Además, la captación va centrada en el espesor del relleno | ap. 5.1.4: «Los elementos de captación, tanto arquetas como tubos perforados, deben situarse centrados en el espesor de la capa de relleno especificada en el apartado 3.3 […]» y «Cuando se vierta directamente el hormigón de la solera sobre la capa de relleno, ésta se protegerá, por ejemplo, mediante una capa de geotextil, para evitar que sus huecos se saturen, así como que se inutilicen las arquetas o los tubos perforados.» | [N22] |
| 6.6 | Instalación perimetral, eficacia por medición, aumento de caudal | LEÍDO (1 fuente) | Son de intervenciones | ap. 3.3 ptos 3, 6 y 7 | [N22] |

---

## Bloque 7 — Comunicación entre el garaje (espacio de contención) y los locales habitables

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 7.1 | Puertas | VERIFICADO | Las puertas **que interrumpan la continuidad de la barrera**: estancas y con cierre automático. Si la barrera no pasa por esa puerta, el DB no le exige nada por HS 6 | ap. 3.1.1 pto 3 c) | [N22] |
| 7.2 | Pasos de instalaciones | VERIFICADO | Encuentros sellados con lo que interrumpa la barrera | ap. 3.1.1 pto 3 b); ap. 5.1.1 (refuerzo y sellado en los pasos de conducciones) | [N22] |
| 7.3 | Cerramiento entre la cámara y los locales habitables | VERIFICADO (solo para la cámara de zona I) | «sin grietas, fisuras o discontinuidades entre los elementos y sistemas constructivos que pudieran permitir el paso del radón» | ap. 3 pto 1 a) | [N22] |
| 7.4 | Huecos y patinillos en contacto con el terreno | LEÍDO (1 fuente) | «en la medida de lo posible estancos a los gases» | ap. 5.1.1 pto 7 | [N22] |
| 7.5 | Núcleos de escalera y ascensor que unen garaje y PB | VERIFICADO: **el DB no los trata** | El texto de HS 6 no contiene «escalera», «ascensor», «núcleo», «vestíbulo» ni «forjado». La UI debe mostrarlo como aviso **«por revisar»** | Búsqueda de términos en todo el texto de HS 6 | [N22] |

**Nota 7.5 — texto propuesto para el aviso (CRITERIO).** «El DB-HS 6 no regula los núcleos de escalera y ascensor que comunican el garaje con las plantas habitables. Según dónde vaya la barrera, aplican:
- la estanquidad y el cierre automático de las puertas que la interrumpan (ap. 3.1.1 pto 3 c);
- el sellado de los pasos (pto 3 b);
- la estanquidad, en lo posible, de huecos y patinillos en contacto con el terreno (ap. 5.1.1 pto 7), entre ellos el foso del ascensor.
Revíselo en el proyecto.»

No apoyar el aviso en el vestíbulo de independencia del DB-SI: no se ha leído en esta sesión, y su puerta (resistencia al fuego y cierre automático) no es «estanca» en el sentido de HS 6.

---

## Bloque 8 — Dónde va la barrera cuando el garaje es el espacio de contención

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 8.1 | «El DB no fija la posición» (decisión del proyectista) | VERIFICADO, **con matiz** | El DB solo fija que la barrera esté **entre el terreno y los locales a proteger**. Valen las dos posiciones: solera y muros del garaje, o forjado de PB. Pero las reglas de ejecución (5.1.1 ptos 6 y 7) están escritas para una barrera sobre los elementos en contacto con el terreno | Apéndice A, «Barrera…»: «situada entre el terreno y los locales a proteger». Ap. 3 pto 1 a): «entre el terreno y los locales habitables del edificio». Pto 1 b): el espacio de contención «situado entre el terreno y los locales a proteger», sin fijar el orden respecto a la barrera | [N22] |
| 8.2 | Consecuencias de cada posición | **CRITERIO** (lectura combinada del DB) | Ver la tabla siguiente | ap. 3.1.1 pto 3 b) y c); ap. 5.1.1 ptos 4, 6 y 7 | [N22] |

| | Barrera en solera y muros del garaje | Barrera en el forjado de PB |
|---|---|---|
| Orden | terreno → barrera → garaje ventilado → locales | terreno → garaje ventilado → barrera → locales |
| Puntos singulares | Fosos de ascensor, pozo de bombeo, arquetas, separador de grasas, juntas de muros enterrados (5.1.1 ptos 4 y 7). Prolongar la barrera por los muros hasta 20 cm sobre la cota exterior (pto 6) | Todos los pasos del forjado: bajantes, montantes, conductos (3.1.1 pto 3 b) |
| Puertas a los núcleos | No interrumpen la barrera: HS 6 no les exige nada | Si están en el plano de la barrera: estancas y con cierre automático (3.1.1 pto 3 c). El hueco del ascensor atraviesa ese plano: aviso 7.5 |
| Etiqueta | «El DB no fija la posición; solo exige que esté entre el terreno y los locales habitables (Apéndice A; ap. 3 pto 1)» | Ídem |

---

## Bloque 9 — Altura de 5 cm y «0,1 ren/h»

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 9.1 | 5 cm: ¿aplica a obra nueva? | VERIFICADO: **no** | Solo a la cámara que se añade a un edificio existente sin cámara | ap. 3.2 pto 6 (ver 5.8) | [N22] [R4] |
| 9.2 | 0,1 ren/h: «no se localiza» (§6) | **CORREGIDO** | Existe, pero en el ap. 3.1.2: es el caudal por defecto del local a proteger para calcular Elim. No es una exigencia de la cámara ni se usa en la vía tipo | ap. 3.1.2, definición de Q (ver 4.5) | [N22] |

---

## Bloque 10 — Apéndice B (municipios)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 10.1 | Título y objeto | LEÍDO (1 fuente) | Ver «Cita exacta» | «Apéndice B. Clasificación de municipios en función del potencial de radón». «Este apéndice incluye el listado de términos municipales en los que, en base a las medidas realizadas por el Consejo de Seguridad Nuclear, se considera que hay una probabilidad significativa de que los edificios allí construidos sin soluciones específicas de protección frente al radón presenten concentraciones de radón superiores al nivel de referencia.» Se clasifican en «municipios de zona I» y «municipios de zona II» | [N22] |
| 10.2 | Cáceres (municipio) = zona II (maqueta, `demo.ts:63`) | **NO VERIFICABLE**, con indicio en contra | Ver la nota 10.2 | — | [NMun]; tabla de [N22] cortada en Cantabria |
| 10.3 | Relación con la lista del CSN | VERIFICADO | Los «municipios de actuación prioritaria» del Reglamento de radiaciones ionizantes **son** los de zona II del Apéndice B. La IS-47 no reproduce la lista | IS-47, art. tercero: «Son términos municipales de actuación prioritaria contra el radón, a los efectos del artículo 79 del Reglamento de Protección de la Salud sobre los riesgos derivados de la exposición a las Radiaciones Ionizantes, los incluidos como «Zona II» en el Apéndice B de la Sección HS6 del Documento Básico de Salubridad del Código Técnico de la Edificación» | [IS47] |
| 10.4 | Cómo citar | **CRITERIO** (forma) | «Zona II según CTE DB-HS, Sección HS 6, Apéndice B "Clasificación de municipios en función del potencial de radón" (consolidado 14-06-2022). Municipio: X. Consultado por el proyectista.» | — | — |

**Nota 10.2 — Cáceres.**
- La ficha de normatia del municipio de Cáceres dice: «Cáceres **no figura en el Apéndice B** de la Sección HS 6, por lo que esa sección no le es de aplicación preceptiva». Es decir, ni zona I ni zona II.
- Pero esa herramienta da también «sin clasificar» para Trujillo, Plasencia, Arroyo de la Luz, Acebo, **Ávila** y **Ourense**. Que capitales sobre granito con alto potencial del CSN no figuren es muy improbable. Para Belmez (Córdoba) sí da «zona I».
- Además, su tabla del Apéndice B, tal como me llega, termina en Cantabria.
- Conclusión: no se puede afirmar ni «zona II» ni «sin clasificar».

Consecuencias para la demo:
- La zona debe entrar como **dato del proyectista** («consultado en el Apéndice B»), nunca como «valor del DB».
- Si el cotejo confirma que Cáceres no figura, HS 6 **no se aplica** a la demo y el caso mostraría «sin exigencia». Habría que cambiar de municipio o rotular la zona como supuesto de demostración. Es una decisión de producto.

---

## Bloque 11 — Edición vigente y forma de citarla

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 11.1 | HS 6 la introduce el RD 732/2019 | VERIFICADO | RD 732/2019, BOE núm. 311 de 27-12-2019 (BOE-A-2019-18528), anejo II | «Tres. El Documento Básico DB-HS de «Salubridad» incluido en la Parte II del Código Técnico de la Edificación se modifica, incorporando la sección HS 6 que se incluye como anejo II a este real decreto.» | [BOE19] |
| 11.2 | Texto vigente | VERIFICADO | DB-HS consolidado de 14-06-2022, que incluye el RD 450/2022. codigotecnico.org ofrece además la versión con marcas del RD 450/2022 (`DcmHS.pdf`) y la versión con comentarios de 12-02-2025 (`DccHS.pdf`) | Página «Salubridad» | [CTO] [VEU] |
| 11.3 | `PROC_HS6`: «RD 732/2019, 2019-12-27, **sin modificaciones posteriores**» | **CORREGIDO** (matiz) | Citar el consolidado de 2022. Que el RD 450/2022 no tocara HS 6 no está comprobado (`DcmHS.pdf` no leído). La lista del BOE en codigotecnico.org no recoge ninguna corrección de errores del RD 732/2019 (esa página termina en la corrección del RD 450/2022, de 2-02-2023, y quizá no esté al día) | — | [CTO] |
| 11.4 | Título «Protección frente al radón» (cabecera de `tablas.ts`) | **CORREGIDO** | «Protección frente a la **exposición al** radón» | Título de la sección | [N22] |
| 11.5 | Forma de citar en la ficha | **CRITERIO** | «CTE DB-HS, Sección HS 6 "Protección frente a la exposición al radón" (introducida por RD 732/2019, BOE 27-12-2019), texto consolidado de 14-06-2022, ap. …» | — | — |

---

## Cifras que SÍ se pueden mostrar en la UI, con su cita

- **300 Bq/m³**, promedio anual en locales habitables. Cita: ap. 2 pto 1.
- **Barrera tipo lámina sin cálculo:** coeficiente de difusión **< 10⁻¹¹ m²/s** (estricto) y espesor **≥ 2 mm**. Cita: ap. 3.1.1 pto 2.
- **Cámara horizontal ventilada de forma natural:** aberturas **≥ 10 cm² por metro lineal de perímetro**, en todas las fachadas y de forma homogénea. Cita: ap. 3.2 pto 3.
- **Superficie de cámara < 100 m²:** aberturas en una sola fachada si ningún punto dista **> 10 m**. Cita: ap. 3.2 pto 3.
- **Cámara vertical ventilada de forma natural:** aberturas **≥ 10 cm² por metro lineal**, en la parte superior. Cita: ap. 3.2 pto 4.
- **Barrera horizontal:** prolongarla **20 cm** por encima de la cota exterior del terreno. Cita: ap. 5.1.1 pto 6. Es condición de ejecución, de una sola fuente.
- **Garaje o trasteros como espacio de contención:** basta la ventilación de HS 3. Garajes: 120 l/s·plaza; trasteros: 0,7 l/s·m², ambos de la Tabla 2.2. Cita: ap. 3.2 pto 5 y DB-HS 3 Tabla 2.2.
- **Bocas de expulsión:** según DB-HS 3 ap. 3.2.1. En la cámara, la cubierta es opcional. Cita: ap. 3.2 pto 8 y ap. 3.3 pto 2.
- **Mantenimiento (Tabla 6.1, una sola fuente):**

| Elemento | Operación | Periodicidad |
|---|---|---|
| Conductos | Limpieza | 1 año |
| Conductos | Estanquidad aparente | 5 años |
| Aberturas | Limpieza | 1 año |
| Extractores | Limpieza | 1 año |
| Extractores | Funcionalidad | 5 años |
| Filtros | Revisión | 6 meses |
| Filtros | Limpieza o sustitución | 1 año |
| Automatismos | Revisión | 2 años |

## Cifras que NO deben mostrarse

- **«≤ 10⁻¹¹ m²/s».** Es estricto: «menor que».
- **Altura mínima de cámara de 5 cm en obra nueva.** Solo vale para edificios existentes (ap. 3.2 pto 6).
- **«0,1 ren/h» como ventilación de la cámara.** Es el Q por defecto del local a proteger en el cálculo de Elim (ap. 3.1.2).
- **Un caudal para la cámara con ventilación mecánica «según DB-HS 3 §3.2.1».** HS 6 no lo da, y HS 3 3.2.1 trata las aberturas y bocas.
- **Coeficientes del ap. 3.1.2:** 3·10⁵, λ = 7,56·10⁻³ h⁻¹, Cd = 10 %. Leídos en una sola fuente a través del extractor. Esperan al cotejo con el PDF.
- **«Zona II» para Cáceres como dato del DB.** No verificado y con indicio en contra.
- **«Potencial medio / potencial alto»** como texto del DB.
- **El geotextil como elemento obligatorio** de la despresurización.

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Nivel de referencia | DB-HS6 | RD 732/2019 · consolidado 14-06-2022 | 2022-06-14 | ap. 2 pto 1 | — | codigotecnico.org · DBHS.pdf, Sección HS 6 (literal leído en transcripción; cotejo PDF pendiente) |
| Ámbito | ídem | ídem | 2022-06-14 | ap. 1 ptos 1 y 2; Apéndice A | — | ídem |
| Exigencia por zona | ídem | ídem | 2022-06-14 | ap. 3 pto 1 a) y b); pto 2 | — | ídem |
| Barrera | ídem | ídem | 2022-06-14 | ap. 3.1.1 ptos 2 y 3; ap. 5.1.1 | — | ídem |
| Espacio de contención | ídem | ídem | 2022-06-14 | ap. 3.2 ptos 1 a 5 y 8 (pto 6 solo existentes) | — | ídem |
| Despresurización | ídem | ídem | 2022-06-14 | ap. 3.3 ptos 1, 2 y 4; ap. 5.1.4 | — | ídem |
| Mantenimiento | ídem | ídem | 2022-06-14 | ap. 6 | Tabla 6.1 | ídem |

---

## Pendientes

1. **Cotejo literal contra el PDF maquetado** (`DBHS.pdf`, Sección HS 6, o el anejo II del BOE de 27-12-2019). Hace falta pdftotext/poppler. Orden de prioridad:
   - ap. 3.1.1 pto 2 (el «menor que» y el «mínimo de 2 mm»);
   - ap. 3 pto 1 a) y b);
   - ap. 3.2 ptos 1, 3, 5, 6 y 8;
   - ap. 3.1.2 (fórmulas 3.1 a 3.3 y constantes);
   - ap. 5.1.1 ptos 6 y 7;
   - Tabla 6.1.
2. **Apéndice B: Cáceres y Extremadura.** Leer la lista del PDF y transcribirla celda a celda, con procedencia, si se decide embeberla. Mientras tanto, la zona es un input del proyectista. Decidir qué hacer con la demo (nota 10.2).
3. **`DcmHS.pdf`:** confirmar que el RD 450/2022 no dejó marcas en HS 6. Hasta entonces, «sin modificaciones posteriores» no se puede afirmar.
4. **`DccHS.pdf` (comentarios de 12-02-2025):** buscar los comentarios al ap. 3 pto 1 a) (¿vale el garaje como «cámara» en zona I?), al 3.2 pto 5 y a la posición de la barrera. Podrían convertir en VERIFICADO los CRITERIOS 3.3 y 8.2.
5. **Guía de rehabilitación frente al radón** (no reglamentaria, para rehabilitación): fichas A3 «Puertas estancas» y B2 «Ventilación del espacio de contención: locales no habitables». Según un extracto del buscador, la B2 advierte que aumentar la extracción de un local no habitable puede deprimirlo y favorecer la entrada de radón. Leerla antes de redactar avisos sobre la extracción del garaje.
6. **Decisiones de criterio que el responsable del proyecto debe validar:**
   - zona I con garaje como única medida → veredicto `criterio` (3.3);
   - local sin uso tratado como habitable (1.6);
   - aparcamiento abierto ≠ exención automática (nota 1.4);
   - texto del aviso de núcleos (7.5);
   - posición de la barrera sin valor por defecto, como decisión explícita (8.1).

---

## Para el código

Esta es la lista de cambios en `src/modules/hs6/tablas.ts`, valor a valor. **No está aplicada.**

Los cambios de `calc.ts`, `ficha.ts` y los tests que arrastran van al final, para `motor-calculo`.

### Cambios en `tablas.ts`

| # | Símbolo (línea aprox.) | Hoy | Propuesto | Motivo / cita |
|---|---|---|---|---|
| T1 | Cabecera (l. 2) | «Protección frente al radón» | «Protección frente a la exposición al radón» | 11.4 |
| T2 | Cabecera (l. 9-11) | «RD 732/2019 … SIN modificaciones posteriores. Fecha "2019-12-27"» | «HS 6 introducida por RD 732/2019 (BOE 27-12-2019); texto vigente: DB-HS consolidado 14-06-2022. Sin cambios del RD 450/2022 en HS 6: pendiente de confirmar en DcmHS» | 11.2, 11.3 |
| T3 | Cabecera (l. 15-28) | «art. 2», «art. 3.1», «art. 3.2 / 3.3», «I (potencial medio) / II (potencial alto)», «lámina-tipo ≤ 1e-11», «altura mínima de cámara 5 cm» | «ap. 2 pto 1», «ap. 3 pto 1 a) y b)», «ap. 3.1 / 3.2 / 3.3», «zona I / zona II», «lámina < 1e-11 (estricto)»; quitar los 5 cm | 2.4, 3.1, 3.6, 4.2, 5.8 |
| T4 | `PROC_HS6.edicion` (l. 105) | `"RD 732/2019"` | `"RD 732/2019 · consolidado 14-06-2022"` | 11.5 |
| T5 | `PROC_HS6.fecha` (l. 107) | `"2019-12-27"` | `"2022-06-14"` | 11.2 |
| T6 | `PROC_HS6.fuente` (l. 108) | `"codigotecnico.org / BOE-A-2019-18528"` | `"codigotecnico.org · DBHS.pdf, Sección HS 6 (literal leído en transcripción; cotejo PDF pendiente) · BOE-A-2019-18528"` | §0 |
| T7 | `NIVEL_REFERENCIA_RADON.articulo` (l. 112) | `"art. 2 (Caracterización y cuantificación de la exigencia)"` | `"ap. 2 pto 1"` | 2.4 |
| T8 | `concentracionMax_Bq_m3` (l. 118) | `300` | `300`, sin cambio. Comentario: «promedio anual; el nivel de referencia es el valor "por encima del cual" no se admite (Apéndice A)» | 2.1, 2.2 |
| T9 | `AMBITO_APLICACION.articulo` (l. 135) | `"art. 1 (Ámbito de aplicación)"` | `"ap. 1 ptos 1 y 2; Apéndice A"` | 1.1-1.3 |
| T10 | `AMBITO_APLICACION.descripcion` (l. 141-144) | «…Si el local no es habitable o no está en contacto con el terreno (p.ej. planta no habitable interpuesta), HS6 no exige medidas.» | «Edificios en municipios del Apéndice B: obra nueva e intervenciones (ap. 1 pto 1). No se aplica a locales no habitables —garajes, trasteros y cuartos técnicos— (pto 2 a; Apéndice A) ni a locales habitables separados de forma efectiva del terreno por espacios abiertos intermedios con ventilación análoga a la del ambiente exterior (pto 2 b). Un local no habitable cerrado interpuesto no exime: puede ser el espacio de contención (ap. 3.2 ptos 1 y 5).» | 1.4 |
| T11 | `AMBITO_APLICACION.datos` (nuevo) | — | `noHabitables: ["garajes", "trasteros", "cuartos técnicos"]`, `exencionEspacioAbierto: true`, `noHabitableCerradoExime: false` | 1.2-1.4 |
| T12 | `REQUISITOS_POR_ZONA.articulo` (l. 186) | `"art. 3.1 (Niveles de protección frente al radón)"` | `"ap. 3 pto 1 a) y b)"` | 3.1 |
| T13 | `REQUISITOS_POR_ZONA.fuente` (l. 188-190) | «… numeración fina de apartados PENDIENTE …» | Quitar el «pendiente de numeración»; usar la fuente de T6 | 3.1 |
| T14 | `requisito.I.descripcion` (l. 201-203) | «Zona I (potencial medio): una medida — barrera de protección O espacio de contención ventilado.» | «Zona I: barrera de protección (ap. 3.1) o, alternativamente, cámara de aire ventilada según ap. 3.2 y separada de los locales habitables por un cerramiento sin grietas, fisuras ni discontinuidades (ap. 3 pto 1 a).» | 3.2, 3.6 |
| T15 | `requisito.I` (nuevo campo) | — | `camaraSoloLiteral: true` (el espacio de contención de zona I es la «cámara de aire»); `localNoHabitableComoAlternativa: "criterio"` (vía «u otras … análogo o superior») | 3.3 |
| T16 | `requisito.II.descripcion` (l. 212-213) | «Zona II (potencial alto): barrera … OBLIGATORIA + una medida adicional …» | «Zona II: barrera de protección (ap. 3.1) junto con un sistema adicional: espacio de contención ventilado (ap. 3.2) o despresurización del terreno (ap. 3.3) (ap. 3 pto 1 b).» La estructura (`barreraObligatoria: true`, `nMedidasMin: 2`, `medidasAdmitidas`) no cambia | 3.4, 3.6 |
| T17 | `requisito.sin_exigencia.descripcion` (l. 221-222) | «Municipio no clasificado en el Apéndice B: HS6 no exige medidas …» | «Municipio no incluido en el Apéndice B: la Sección HS 6 no se aplica (ap. 1 pto 1).» | 1.8 |
| T18 | `REQUISITOS_POR_ZONA.datos` (nuevo) | — | `alternativaEquivalente: "u otras que proporcionen un nivel de protección análogo o superior"` (ap. 3 pto 1, encabezado); `sobrepresionGrandesAreas: "cabinas de vigilante en garajes: sobrepresión con aire exterior"` (ap. 3 pto 2) | 1.7, 3.3 |
| T19 | `PROC_HS6_SOLUCIONES` (l. 242-248) | Una sola procedencia «art. 3.2 / 3.3 … PENDIENTES … triangulación» | Separar en tres: barrera `"ap. 3.1.1 ptos 2 y 3; ap. 5.1.1"`, espacio `"ap. 3.2 ptos 1-5 y 8"`, despresurización `"ap. 3.3 ptos 1, 2 y 4; ap. 5.1.4"`. Fuente: la de T6 | 3.1 |
| T20 | `barrera.coefDifusionMax_m2_s` (l. 258) | `1e-11`, leído como «≤» | `1e-11`, pero **renombrar** a `coefDifusionLimite_m2_s` y añadir `comparacionCoef: "<"`. El nombre «Max» invita al «≤» | 4.2 |
| T21 | `barrera.espesorMin_mm` (l. 260) | `2` | `2`, sin cambio (≥) | 4.2 |
| T22 | `barrera` (nuevo) | — | `soloTipoLamina: true`; `caracteristicas: ["continuidad: juntas y encuentros sellados", "encuentros con elementos que la interrumpan sellados", "puertas que la interrumpan: estancas y con cierre automático", "sin fisuras que permitan el paso por convección", "durabilidad adecuada a la vida útil"]` (3.1.1 pto 3 a-e); `prolongacionSobreTerrenoExterior_cm: 20` (5.1.1 pto 6) | 4.3, 4.6 |
| T23 | `espacioContencion.areaAberturasMin_cm2_ml` (l. 273) | `10` | `10`, sin cambio (≥, «al menos»). Comentario: horizontal → por metro de perímetro de la cámara (pto 3); vertical → por metro lineal (pto 4) | 5.5, 5.6 |
| T24 | `espacioContencion` (nuevo) | — | `aberturasEnTodasLasFachadas: true`; `superficieUnaFachada_m2: 100` (estricto, «menos de»); `distanciaMaxAAbertura_m: 10` (≤, «no diste más de»); `tipos: ["camara_horizontal", "camara_vertical", "local_no_habitable"]` (pto 1) | 5.1, 5.5 |
| T25 | `espacioContencion.alturaMinCamara_mm` (l. 275) | `50` (aplicado a obra nueva) | **Quitar** de obra nueva. Si se quiere conservar: `existentes: { alturaMinCamara_mm: 50 }`, con `articulo: "ap. 3.2 pto 6"` y solo para intervención en un edificio sin cámara | 5.8, 9.1 |
| T26 | `espacioContencion.renovacionesRef_ren_h` (l. 277) | `0.1` | **Quitar.** Si algún día se implementa el Nivel B, va en un bloque `BARRERA_CALCULO` (ap. 3.1.2) como `caudalLocalPorDefecto_ren_h: 0.1`, tras el cotejo con el PDF | 5.9, 9.2 |
| T27 | `espacioContencion.remisionMecanica` (l. 279) | `"DB-HS3 §3.2.1"` (como caudal) | **Sustituir** por `remisionBocasExpulsion: "DB-HS3 ap. 3.2.1 (en la cámara, la cubierta es opcional)"` (pto 8) y `ventilacionLocalNoHabitable: "DB-HS3 (Tabla 2.2) o RITE, según corresponda — se considera suficiente"` (pto 5) | 5.3, 5.7 |
| T28 | `despresurizacion.descripcion` (l. 287-289) | «… con geotextil de separación.» | «Red de elementos de captación (arquetas o tubos perforados) en una capa de relleno granular bajo el edificio, conectada a un conducto de extracción y a un sistema de extracción mecánica (ap. 3.3 pto 1). Bocas de expulsión según DB-HS 3 ap. 3.2.1 (pto 2). Si la solera se vierte sobre el relleno, protegerlo, p. ej. con geotextil (ap. 5.1.4).» Más `elementosObligatorios: ["captacion_en_relleno", "conducto_extraccion", "extraccion_mecanica"]` y `geotextilObligatorio: false` | 6.1, 6.2, 6.5 |
| T29 | JSDoc de `ZonaRadon` (l. 49-56) | «potencial medio / alto», «exige UNA medida» | Quitar «potencial medio / alto». Zona I: «barrera o cámara de aire ventilada»; `sin_exigencia`: «municipio no incluido en el Apéndice B» | 3.2, 3.6 |
| T30 | JSDoc de `TipoVentilacionContencion` (l. 74-76) | «mecanica → remite a DB-HS3 §3.2.1 (caudal de ventilación)» | «mecanica → HS 6 no fija caudal: aberturas según la cámara, admisión lejos de la extracción, bocas según DB-HS 3 ap. 3.2.1 (ap. 3.2 pto 8)» | 5.7 |
| T31 | JSDoc de `ViaJustificacionBarrera` (l. 82-88) | «≤ 1e-11 m²/s», «la fórmula de E diverge entre fuentes» | «< 1e-11 m²/s (estricto), solo tipo lámina»; «la vía por cálculo está en el ap. 3.1.2 (E < Elim); DIFERIDA hasta cotejar sus constantes con el PDF» | 4.2, 4.5 |
| T32 | Helper `parametrosEspacioContencion()` (l. 317-324) | Devuelve `alturaMinCamara_mm`, `renovacionesRef_ren_h` y `remisionMecanica` | Cambiar el tipo devuelto según T24 a T27 | — |

Sobre la procedencia común:
- Si se mantiene `edicion` con la subcadena «RD 732/2019», el test `ficha.test.ts:103` (`toMatch(/RD 732\/2019/)`) sigue en verde.
- `ficha.test.ts:109` (`toBe("RD 732/2019")`) y el snapshot de la ficha cambian, y es lo esperado.

### Lo que arrastra fuera de `tablas.ts` (para `motor-calculo`)

**`calc.ts`**
- l. 344: `coef <= p.coefDifusionMax_m2_s` pasa a `<`. Los textos «≤» pasan a «<» (l. 351-352, 369-370, 386).
- l. 391-421: puertas con «estancas **y cierre automático**», y en estado `neutral` si ninguna puerta interrumpe la barrera. Añadir «sin fisuras» y «durabilidad» (3.1.1 pto 3 d y e).
- l. 498-527: quitar el chequeo de altura en obra nueva. Ni `fail` ni `warn`.
- l. 481-496: según el tipo de espacio de contención:
  - un local no habitable cuenta como ventilado por remisión a HS 3/RITE (3.2 pto 5), con enlace al veredicto de garaje del módulo HS 3;
  - una cámara mecánica es `warn` con el texto de T30, no «caudal según HS 3 §3.2.1».
- Zona I con espacio de contención de tipo `local_no_habitable`: veredicto `criterio` (3.3).
- l. 570-580: el geotextil deja de ser obligatorio. Añadir «bocas de expulsión según HS 3 3.2.1».
- l. 168: `localHabitableEnContactoConTerreno: boolean` no basta. Hay que deducir de El edificio qué hay bajo cada local habitable: terreno, no habitable cerrado o espacio abierto (nota 1.4).
- Todas las cadenas «art. N» pasan a «ap. N».

**`ficha.ts`**
- l. 88-90 (`ART_POR_TIPO`): barrera → «ap. 3.1»; espacio → «ap. 3.2»; despresurización → «ap. 3.3». Hoy la barrera dice «art. 3.2», que es el espacio de contención.
- l. 16-18, 154-161 y 313-316: textos con «art.», con la altura de 5 cm y con «PENDIENTE de verificación literal» para la estructura.

**Tests**
- `calc.test.ts` usa `PE.alturaMinCamara_mm` en las l. 51, 81, 205, 351 y 517: se rompen al quitar el campo.
- Cambian los snapshots de `calc` (cadenas «≤ 1e-11 m²/s (art. 3.2)») y de `ficha`, como se espera.
- Añadir un test de frontera: `coefDifusion_m2_s = 1e-11` debe dar **NO CUMPLE**. Hoy no existe.

**`demo.ts`, l. 63** (`zonaRadon: "II"` para Cáceres): rotularlo como dato del proyectista pendiente de comprobar (bloque 10).
