# Verificación normativa — DB-SUA, SUA 2, SUA 3, SUA 4 y SUA 5, para los checkers de feature-20

**Fecha:** 2026-10-04 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** preguntas B1 a B7 del encargo, más las definiciones del Anejo A del DB-SUA que esas secciones usan. Del Anejo SI A (DB-SI) solo se **citan** «origen de evacuación», «recorrido de evacuación», «zona de ocupación nula», «espacio exterior seguro» y «zona de refugio», ya verificadas en `research/verificacion-si3.md`, `research/verificacion-si1-si2.md` y `research/verificacion-si4-si6.md`. No se han vuelto a verificar.

**Regla aplicada:** ninguna cifra se da por buena sin leerla en la **imagen** de la página. El texto extraído pierde los signos ≤ y ≥, los subíndices («L_blanca», «L_color») y la estructura de la tabla 1.1. Veredictos:
- **VERIFICADO**: literal en el DB, leído en la imagen de [SUA22] y coincidente con el texto de [SUA22] y de [DccSUA].
- **LEÍDO (1 fuente)**: literal en una sola fuente (en general, un comentario de [DccSUA] o un dato de otro fichero de verificación).
- **CORREGIDO**: lo que dice el encargo, o lo que suele decir una memoria, no coincide con el DB.
- **NO VERIFICABLE**: el DB no lo dice, o no se ha podido leer con seguridad.
- **INTERPRETACIÓN**: se sigue del DB, pero el DB no lo escribe tal cual. Se puede mostrar, rotulada.
- **CRITERIO**: decisión de proyecto propuesta. No es exigencia del CTE y la ficha la rotula así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [SUA22] | CTE DB-SUA «Seguridad de utilización y accesibilidad», texto consolidado | «14 junio 2022» (incluye RD 450/2022) | `research/pdf/DBSUA.pdf` (codigotecnico.org) | **Imagen** a 200 ppp: pp. 4 (Introducción II), 17, 18, 19 (SUA 2), 20 (SUA 3), 21, 22 (SUA 4), 23 (SUA 5), 36, 37, 39, 40 (Anejo A). Texto extraído: pp. 2, 3, 5, 24, 31 (solo SUA 9 ap. 1 pto 2), 35, 38, 41, 47 |
| [DccSUA] | DB-SUA con comentarios del Ministerio | Articulado 14-jun-2022; **comentarios 15-jul-2024** | `research/pdf/DccSUA.pdf` | Imagen a 130 ppp: pp. 32, 33, 37, 38, 39. Resto, texto (pp. 4–8, 31–42, 53, 70–72). Los comentarios van sangrados con una raya vertical; si la raya es **doble**, el comentario es nuevo o se modificó en la versión de 2024 ([DccSUA] p. 2) |
| [VSI3] | `research/verificacion-si3.md` | 2026-10-04 | repo | Definiciones del Anejo SI A y SI 3 (ya verificadas en imagen) |
| [VSI12] | `research/verificacion-si1-si2.md` | 2026-10-04 | repo | SI 1, tabla 2.1 (locales de riesgo especial) y «zona de ocupación nula» |
| [VSI46] | `research/verificacion-si4-si6.md` | 2026-10-04 | repo | «Origen de evacuación» literal (nota C1.18); extintor del garaje de la unifamiliar (C1.17) |

Disposiciones que recoge [SUA22] (p. 2): RD 314/2006; RD 1371/2007; corrección de errores (BOE 25-01-2008); Orden VIV/984/2009 y su corrección (BOE 23-09-2009); RD 173/2010; Sentencia del TS de 4-5-2010; RD 732/2019; RD 450/2022. [DccSUA] p. 2 añade la «Corrección de errores del Real Decreto 450/2022 (BOE 2/02/2023)», que el consolidado de [SUA22] no lista. En las pp. 17–24 los textos de las dos fuentes coinciden palabra por palabra.

Avisos de los propios documentos:
- [SUA22] p. 2: «Este texto consolidado no tiene valor jurídico.»
- [DccSUA] p. 2: «Los comentarios tienen un carácter orientativo e informativo no teniendo carácter reglamentario.» Aquí cada comentario va rotulado «comentario, no reglamentario».

Límites de la lectura:
- **No** se han leído: UNE-EN 12600:2003 ni el «DA DB-SUA/1» (significado de X, Y y Z), UNE-EN 12046-2:2000, UNE-EN 13241, UNE-EN 12635, UNE-EN 16005, UNE 85121, el REBT (ITC-BT-28) ni el Anejo III de la Parte I del CTE.
- **No** se ha leído el BOE. No se sabe qué disposición redactó cada párrafo de SUA 2 a SUA 5. Se cita siempre el consolidado de 14-06-2022 y no se mezcla con versiones anteriores.
- «Zona de circulación» **no** está definida en el Anejo A del DB-SUA (pp. 35–41, leídas enteras).
- El Anejo A ocupa las pp. 35–41, no las 35–47 del encargo: el Anejo B (rayo) va de la p. 42 a la 46 y el Anejo C (normas) está en la p. 47.

---

## Bloque D — Definiciones que usan SUA 2 a SUA 5

| # | Término | Veredicto | Texto (literal) o lectura | Cita | Fuente |
|---|---|---|---|---|---|
| D1 | **Uso restringido** | VERIFICADO | «Utilización de las zonas o elementos de circulación limitados a un máximo de 10 personas que tienen el carácter de *usuarios* habituales, incluido el interior de las viviendas y de los alojamientos (en uno o más niveles) de *uso Residencial Público*, pero excluidas las zonas comunes de los edificios de viviendas.» | Anejo A | [SUA22] p. 40, imagen |
| D1a | «Interior de las viviendas» | LEÍDO (comentario, no reglamentario) | «Por interior de las viviendas deben entenderse todas las zonas de uso privativo de una vivienda, incluyendo, por ejemplo, las zonas exteriores privativas cuando éstas existan.» | Comentario a «Uso restringido» | [DccSUA] p. 72 |
| D1b | «Zonas comunes de los edificios de vivienda» | LEÍDO (comentario, no reglamentario) | «… las escaleras comunes (tanto las protegidas como las no protegidas), los descansillos de acceso a viviendas, los portales, las zonas comunitarias, **los aparcamientos, los pasillos de comunicación a trasteros**, las zonas ajardinadas y deportivas, etc.» | ídem | [DccSUA] p. 72 |
| D1c | ¿Puede una zona común ser de uso restringido? | LEÍDO (comentario, no reglamentario) | **No.** «Independientemente del número de personas de una zona o elemento, el interior de las viviendas … se considera[n] siempre uso restringido, y las zonas comunes de los edificios de viviendas no se consideran nunca uso restringido.» | Comentario «Consideración de uso restringido» | [DccSUA] p. 72 |
| D2 | **Uso general** | VERIFICADO | «Utilización de las zonas o elementos que no sean de *uso restringido*.» | Anejo A | [SUA22] p. 39, imagen |
| D3 | **Uso privado** | VERIFICADO | «Zonas o elementos que no sean de *uso público*, tales como: — en *uso Administrativo* las áreas de trabajo e instalaciones que no presten servicios directos al público; — en *uso Aparcamiento* los aparcamientos privados; … — en *uso Residencial Vivienda* todas las zonas.» | Anejo A | [SUA22] pp. 39–40, imagen |
| D4 | **Uso público** | VERIFICADO | «Zonas o elementos de circulación susceptibles de ser utilizados por el público en general, personas no familiarizadas con el edificio, tales como: — en *uso Administrativo* los espacios de atención al público; — en *uso Aparcamiento* los aparcamientos públicos o que sirvan a establecimientos públicos; …» | Anejo A | [SUA22] p. 40, imagen |
| D4a | Salas de reuniones de unas oficinas | LEÍDO (comentario, no reglamentario) | «Las zonas destinadas a recibir personas externas a un espacio laboral, tales como las salas de reuniones y sus aseos asociados, se consideran zonas de uso público.» | Comentario «Zonas destinadas a recibir personas externas» | [DccSUA] p. 71 |
| D4b | Tres clasificaciones a la vez | LEÍDO (comentario, no reglamentario) | Cada zona tiene: un uso según la actividad (Residencial Vivienda, Administrativo, …); uso general **o** restringido; uso público **o** privado. «Es importante no confundir "zonas de uso privado" con "zonas de uso restringido" o con "uso Residencial Vivienda".» Los elementos de evacuación que solo se usan en emergencia toman el carácter de la zona a la que sirven | Comentario «Clasificación de usos en el DB SUA» | [DccSUA] p. 7 |
| D5 | **Uso Aparcamiento** | VERIFICADO | «… destinado a estacionamiento de vehículos y cuya superficie construida exceda de 100 m² … Se excluyen de este uso los garajes, cualquiera que sea su superficie, de una vivienda unifamiliar, así como del ámbito de aplicación del DB-SUA, los aparcamientos robotizados.» | Anejo A | [SUA22] p. 39, imagen |
| D6 | **Uso Administrativo** | VERIFICADO | «… actividades de gestión o de servicios en cualquiera de sus modalidades, como por ejemplo, centros de la administración pública, bancos, despachos profesionales, oficinas, etc.» Los consultorios, centros de análisis clínicos y ambulatorios van como Sanitario en este DB | Anejo A | [SUA22] p. 39, imagen |
| D7 | **Uso Residencial Vivienda** | VERIFICADO | «Edificio o zona destinada a alojamiento permanente, cualquiera que sea el tipo de edificio: vivienda unifamiliar, edificio de pisos o de apartamentos, etc.» | Anejo A | [SUA22] p. 40, imagen |
| D8 | **Itinerario accesible**, fila «Puertas» | VERIFICADO | «… Fuerza de apertura de las puertas de salida ≤ 25 N (≤ 65 N cuando sean resistentes al fuego)». En la misma fila: anchura libre ≥ 0,80 m en el marco, ≥ 0,78 m con la hoja abierta; mecanismos entre 0,80 y 1,20 m; Ø 1,20 m libre del barrido en las dos caras; ≥ 0,30 m del mecanismo al rincón | Anejo A | [SUA22] p. 36, imagen |
| D9 | **Servicios higiénicos accesibles**, «Aseo accesible» | VERIFICADO | «— Está comunicado con un *itinerario accesible* — Espacio para giro de diámetro Ø 1,50 m libre de obstáculos — Puertas que cumplen las condiciones del *itinerario accesible* Son abatibles hacia el exterior o correderas — Dispone de barras de apoyo, mecanismos y accesorios diferenciados cromáticamente del entorno» | Anejo A | [SUA22] p. 37, imagen |
| D10 | **Mecanismos accesibles** (lo que toca a SUA 3 y SUA 4) | VERIFICADO | «No se admite iluminación con temporización en cabinas de aseos accesibles y vestuarios accesibles.» | Anejo A | [SUA22] p. 36, imagen |
| D11 | **Iluminancia, E** / **Luminancia, L** | VERIFICADO | E: «Flujo luminoso por unidad de área de la superficie iluminada … lux (lx) …». L: «… cociente de la intensidad luminosa de un elemento de esa superficie por el área de la proyección ortogonal de dicho elemento sobre un plano perpendicular a dicha dirección dada. L se mide en cd/m².» | Anejo A | [SUA22] pp. 35 (texto), 36 (imagen) |
| D12 | **Ámbito del DB-SUA**: lo que queda fuera | VERIFICADO | «La protección frente a los riesgos específicos de: — las instalaciones de los edificios; — las actividades laborales; — las zonas y elementos de uso reservado a personal especializado en mantenimiento, reparaciones, etc.; — … infraestructuras del transporte … se regulan en su reglamentación específica.» Del entorno, solo obliga lo que «forme parte del proyecto de edificación». «Las exigencias que se establezcan en este DB para los edificios serán igualmente aplicables a los establecimientos.» | Introducción II | [SUA22] p. 4, imagen |
| D12a | Cuartos solo para mantenimiento | LEÍDO (comentario, no reglamentario) | El DB-SUA no se aplica a los elementos reservados a personal de mantenimiento, inspección o reparación, porque esas personas no son «usuarios del edificio». Se aplica la reglamentación de seguridad en el trabajo (RD 1627/1997, RD 486/1997, RD 1215/1997) | Comentario «Aplicación del DB SUA a elementos de uso exclusivo para mantenimiento, inspección, reparaciones, etc.» | [DccSUA] pp. 4–5 |
| D13 | **Origen de evacuación** (Anejo SI A) | **Citado**, verificado en [VSI46] C1.18 y [VSI3] B3.13–B3.15 | «Es todo punto ocupable de un edificio, exceptuando los del interior de las viviendas y los de todo recinto o conjunto de ellos comunicados entre sí, en los que la densidad de ocupación no exceda de 1 persona/5 m² y cuya superficie total no exceda de 50 m², como pueden ser … los despachos de oficinas, etc. Los puntos ocupables de todos los locales de riesgo especial y los de las zonas de ocupación nula cuya superficie exceda de 50 m², se consideran origen de evacuación …». Consecuencias, ya documentadas: en una plurifamiliar el primer origen está **en la puerta de cada vivienda**, del lado de la zona común (INTERPRETACIÓN, [VSI3] B3.13); en el garaje, todo punto ocupable ([VSI3] B3.15); en oficinas, todo punto, salvo dentro de los despachos de ≤ 50 m² ([VSI3] B3.14) | Anejo SI A | DB-SI 4-03-2025, p. 46, vía [VSI46] y [VSI3] |
| D14 | **Recorrido de evacuación** (Anejo SI A) | **Citado**, verificado en [VSI3] B3.16–B3.18 | «Recorrido que conduce desde un origen de evacuación hasta una salida de planta, situada en la misma planta considerada o en otra, o hasta una salida de edificio …». Se mide sobre el eje de pasillos, escaleras y rampas | Anejo SI A | DB-SI p. 47, vía [VSI3] |
| D15 | **Zona de ocupación nula** (Anejo SI A) | **Citado**, verificado en [VSI12] 2.21 | «Zona en la que la presencia de personas sea ocasional o bien a efectos de mantenimiento, tales como salas de máquinas y cuartos de instalaciones, locales para material de limpieza, determinados almacenes y archivos, trasteros de viviendas, etc.» | Anejo SI A | DB-SI p. 52, vía [VSI12] |
| D16 | **Espacio exterior seguro** y **zona de refugio** | **Citado** ([VSI3]) | Espacio exterior seguro: 0,5·P m² en un radio de 0,1·P m; sin comprobar si P ≤ 50. Zona de refugio: solo se exige en Residencial Vivienda con altura de evacuación **> 28 m**, en Administrativo con **> 14 m** y en plantas de Aparcamiento de **> 1.500 m²** (SI 3 ap. 9, [VSI3] B9.1) | Anejo SI A; SI 3 ap. 9 | vía [VSI3] |

---

## Bloque B1 — SUA 2 ap. 1: impacto

### 1.1 Impacto con elementos fijos ([SUA22] p. 17)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B1.1 | Altura libre de paso: 2,10 / 2,20 m; umbral de puertas 2,00 m | VERIFICADO | **≥ 2,10 m** en zonas de uso restringido; **≥ 2,20 m** en el resto; **≥ 2 m** en los umbrales de las puertas. «Como mínimo» → se admite la igualdad | SUA 2 ap. 1.1 pto 1: «La altura libre de paso en zonas de circulación será, como mínimo, 2,10 m en zonas de *uso restringido* y 2,20 m en el resto de las zonas. En los umbrales de las puertas la altura libre será 2 m, como mínimo.» | [SUA22] p. 17, imagen; [DccSUA] p. 31 |
| B1.2 | ¿Excluye el interior de las viviendas? | VERIFICADO: **no lo excluye; le aplica 2,10 m** | Interior de vivienda (unifamiliar o piso, con sus exteriores privativos) = uso restringido → 2,10 m en las **zonas de circulación**. Zonas comunes (portal, rellanos, escalera, pasillos de trasteros, garaje comunitario) = nunca uso restringido → 2,20 m | pto 1; D1, D1a, D1b, D1c | [SUA22] pp. 17, 40; [DccSUA] p. 72 |
| B1.3 | Comentario: solo zonas de circulación | LEÍDO (comentario, no reglamentario) | El 2,10 m de la vivienda se limita a pasillos, vestíbulos y distribuidores; «en ningún caso impide la existencia de zonas abuhardilladas en zonas de estancia». La altura funcional de cada pieza la regulan otros reglamentos | Comentario al pto 4: «… la exigencia de una altura libre de 2,10 m, como mínimo, en zonas de uso restringido se limita, en el caso de viviendas, a las zonas de circulación, tales como pasillos, vestíbulos, distribuidores, etc., pero en ningún caso impide la existencia de zonas abuhardilladas en zonas de estancia.» | [DccSUA] p. 31 |
| B1.4 | Comentario: altura libre en escaleras | LEÍDO (comentario, no reglamentario) | Se mide en vertical desde la línea que une los vértices de los peldaños | Comentario al pto 1: «La altura libre en una escalera debe medirse en vertical desde la línea de inclinación de la escalera, que une los vértices de los peldaños (véase figura 3.2 del apartado SUA1-3.2.3).» | [DccSUA] p. 31 |
| B1.5 | Garaje de la plurifamiliar | **INTERPRETACIÓN** | **2,20 m** en sus zonas de circulación: el comentario incluye «los aparcamientos» entre las zonas comunes, que nunca son de uso restringido. Es la cifra que más suele fallar (vigas, conductos de ventilación, rociadores) | pto 1; D1b, D1c | [DccSUA] p. 72 |
| B1.6 | Garaje de la unifamiliar | **INTERPRETACIÓN** | **2,10 m**: es zona de uso privativo de la vivienda (D1a) y no es uso Aparcamiento (D5) | pto 1; D1a, D5 | [SUA22] p. 39; [DccSUA] p. 72 |
| B1.7 | Oficinas | **INTERPRETACIÓN** | **2,20 m**. Solo serían de uso restringido unas oficinas con **≤ 10 usuarios habituales** y sin público (definición D1). Ver CRITERIO S2 | pto 1; D1 | [SUA22] p. 40 |
| B1.8 | «Zona de circulación»: ¿qué es? | **NO VERIFICABLE** | El Anejo A del DB-SUA no la define (el Anejo III de la Parte I no se ha leído). Lectura útil: pasillos, vestíbulos, rellanos, escaleras, rampas y calles del garaje | — | — |
| B1.9 | Elementos fijos que sobresalen de las fachadas | VERIFICADO | **≥ 2,20 m** sobre zonas de circulación | pto 2: «Los elementos fijos que sobresalgan de las fachadas y que estén situados sobre zonas de circulación estarán a una altura de 2,20 m, como mínimo.» | [SUA22] p. 17, imagen |
| B1.10 | Comentario: normativa urbanística | LEÍDO (comentario, no reglamentario) | Puede haber condiciones municipales iguales o más exigentes. Cita la Orden TMA/851/2021: el frente de parcela no puede invadir el itinerario peatonal accesible «ni a nivel del suelo, ni en altura» (art. 24); altura libre del itinerario peatonal ≥ 2,20 m (art. 5.2c) | Comentario al pto 2 | [DccSUA] p. 31 |
| B1.11 | Salientes en paredes: «entre 15 cm y 2,20 m» | VERIFICADO | En zonas de circulación no puede haber salientes que **no arranquen del suelo**, que vuelen **más de 15 cm** (estricto: 15 cm justos se admiten) entre **0,15 y 2,20 m** de altura y que presenten riesgo de impacto. El texto no exceptúa el uso restringido | pto 3: «En zonas de circulación, las paredes carecerán de elementos salientes que no arranquen del suelo, que vuelen más de 15 cm en la zona de altura comprendida entre 15 cm y 2,20 m medida a partir del suelo y que presenten riesgo de impacto.» | [SUA22] p. 17, imagen |
| B1.12 | Comentario: extintores y BIE en pasillos | LEÍDO (comentario, no reglamentario) | Siguen teniendo riesgo de impacto, pero se aceptan si se colocan donde lo minimicen: rincones, ensanchamientos, etc. | Comentario al pto 3: «… dicho riesgo se considera asumible en la medida en que se instalen en aquellos puntos en los que, sin perjuicio de su función, minimicen el riesgo de impacto: rincones, ensanchamientos, etc.» | [DccSUA] p. 31 |
| B1.13 | Elementos volados de menos de 2 m (bajo escaleras y rampas) | VERIFICADO | Hay que restringir el acceso con elementos fijos detectables con bastón. «Menor que 2 m»: estricto. Caso típico: el hueco bajo la escalera común del portal | pto 4: «Se limitará el riesgo de impacto con elementos volados cuya altura sea menor que 2 m, tales como mesetas o tramos de escalera, de rampas, etc., disponiendo elementos fijos que restrinjan el acceso hasta ellos y permitirán su detección por los bastones de personas con discapacidad visual.» | [SUA22] p. 17, imagen |
| B1.14 | ¿Excluye ap. 1.1 la vivienda o el uso restringido? | VERIFICADO (por ausencia) | **No**. El pto 1 da la cifra del uso restringido. Los ptos 2 a 4 no distinguen zonas | ap. 1.1 | [SUA22] p. 17 |

### 1.2 Impacto con elementos practicables ([SUA22] p. 17)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B1.15 | Puertas en el lateral de pasillos de < 2,50 m | VERIFICADO | **Excepto en uso restringido**, las puertas de recintos **que no sean de ocupación nula** situadas en el lateral de pasillos de anchura **< 2,50 m**: el barrido de la hoja **no invade el pasillo**. En pasillos de **> 2,50 m**: no invade la anchura exigida por SI 3 ap. 4 | pto 1: «Excepto en zonas de *uso restringido*, las puertas de recintos que no sean de *ocupación nula* (definida en el Anejo SI A del DB SI) situadas en el lateral de los pasillos cuya anchura sea menor que 2,50 m se dispondrán de forma que el barrido de la hoja no invada el pasillo (véase figura 1.1). En pasillos cuya anchura exceda de 2,50 m, el barrido de las hojas de las puertas no debe invadir la anchura determinada, en función de las condiciones de evacuación, conforme al apartado 4 de la Sección SI 3 del DB SI.» | [SUA22] p. 17, imagen; [DccSUA] pp. 31–32 |
| B1.16 | Pasillo de **exactamente** 2,50 m | **NO VERIFICABLE** + CRITERIO | El texto dice «menor que 2,50» y «exceda de 2,50»: 2,50 m no cae en ninguno. CRITERIO: tratarlo como < 2,50 m (lado de la seguridad) | pto 1 | — |
| B1.17 | Exclusiones (comentarios) | LEÍDO (comentario, no reglamentario) | (a) Puertas de zonas de ocupación nula (trasteros, cuartos de instalaciones): no se aplica. (b) Tampoco donde «se justifique suficientemente que el riesgo de impacto en la apertura es mínimo». (c) **Ascensores**: no son «zonas» ni «recintos»; sus puertas no tienen que cumplirlo | Comentarios al pto 1 | [DccSUA] p. 32, imagen |
| B1.18 | Aplicado a la plurifamiliar | **INTERPRETACIÓN** | Rellanos y pasillos comunes: la **puerta de cada vivienda** (un recinto que no es de ocupación nula) no puede barrer el rellano o pasillo si mide menos de 2,50 m. Lo habitual: abre hacia dentro de la vivienda. Las puertas de trasteros y cuartos de instalaciones pueden abrir hacia el pasillo. La figura 1.1 se titula «Disposición de puertas laterales a **vías de circulación**»: se lee aplicable también a rellanos y vestíbulos | pto 1; figura 1.1 | [SUA22] p. 17 |
| B1.19 | Interior de viviendas | VERIFICADO | **Excluido** (uso restringido) | pto 1, «Excepto en zonas de uso restringido» | [SUA22] p. 17 |
| B1.20 | Oficinas | **INTERPRETACIÓN** | Puertas de despachos, aseos y salas sobre pasillos de < 2,50 m: no invadir. Salvo que las oficinas sean de uso restringido (≤ 10 usuarios habituales) | pto 1; D1 | — |
| B1.21 | Puertas de vaivén | VERIFICADO | Si están **entre zonas de circulación**: partes transparentes o translúcidas que cubran **al menos de 0,7 a 1,5 m** de altura | pto 2: «Las puertas de vaivén situadas entre zonas de circulación tendrán partes transparentes o translucidas que permitan percibir la aproximación de las personas y que cubran la altura comprendida entre 0,7 m y 1,5 m, como mínimo.» | [SUA22] p. 17, imagen |
| B1.22 | Comentarios al vaivén | LEÍDO (comentario, no reglamentario) | Todas las de vaivén deben cumplirlo. Vale el «ojo de buey» si cubre de 0,70 a 1,50 m. Alternativa: puerta abierta por arriba y por abajo («far west») | Comentarios al pto 2 | [DccSUA] p. 32, imagen |
| B1.23 | Puertas de garaje: «UNE-EN 13241 / 12635» | **CORREGIDO** (dónde está) | El **articulado** solo exige «reglamentación específica» y **marcado CE**. Las normas UNE-EN 13241:2004+A2:2017 (producto), UNE-EN 12635:2002+A1:2009 (instalación y uso) y UNE 85635:2012 están **solo en el comentario**. No citarlas como exigencia del DB | pto 3: «Las puertas industriales, comerciales, de garaje y portones cumplirán las condiciones de seguridad de utilización que se establecen en su reglamentación específica y tendrán marcado CE de conformidad con los correspondientes Reglamentos y Directivas Europeas.» Comentario «Puertas industriales, comerciales, de garaje y portones» | [SUA22] p. 17, imagen; [DccSUA] p. 32, imagen |
| B1.24 | Puerta peatonal en la hoja de la de garaje | LEÍDO (comentario, no reglamentario) | El marcado CE según UNE-EN 13241 es del conjunto; la norma incluye las puertas de paso incorporadas en la hoja | Comentario «Puertas de paso incorporadas en puertas de garaje» | [DccSUA] p. 32 |
| B1.25 | ¿Excluye la puerta de garaje de la unifamiliar? | VERIFICADO (por ausencia) | **No**. El pto 3 no distingue | pto 3 | [SUA22] p. 17 |
| B1.26 | Puertas peatonales automáticas | VERIFICADO + comentario | Articulado: reglamentación específica + marcado CE. Comentario: marcado CE por la Directiva de máquinas, que se puede justificar con **UNE-EN 16005:2013**; mantenimiento obligatorio según **UNE 85121:2018** por SI 3 ap. 6 pto 5 (este párrafo lleva **doble raya**: es nuevo en los comentarios de 2024) | pto 4 (literal igual que el pto 3, «Las puertas peatonales automáticas cumplirán …»); comentario «Puertas peatonales automáticas» | [SUA22] p. 17, imagen; [DccSUA] p. 32, imagen |

### 1.3 Impacto con elementos frágiles ([SUA22] p. 18)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B1.27 | Qué vidrios | VERIFICADO | Los de las **áreas con riesgo de impacto** (pto 2) de superficies acristaladas **sin barrera de protección conforme a SUA 1 ap. 3.2**: clasificación X(Y)Z según **UNE-EN 12600:2003** con los valores de la tabla 1.1. **Excluidos** los vidrios cuya mayor dimensión **no exceda de 30 cm** (≤ 0,30 m) | pto 1: «Los vidrios existentes en las áreas con riesgo de impacto que se indican en el punto 2 siguiente de las superficies acristaladas que no dispongan de una barrera de protección conforme al apartado 3.2 de SUA 1, tendrán una clasificación de prestaciones X(Y)Z determinada según la norma UNE-EN 12600:2003 cuyos parámetros cumplan lo que se establece en la tabla 1.1. Se excluyen de dicha condición los vidrios cuya mayor dimensión no exceda de 30 cm.» | [SUA22] p. 18, imagen; [DccSUA] p. 33, imagen |
| B1.28 | Tabla 1.1 | VERIFICADO | Transcripción casilla a casilla, a continuación | Tabla 1.1 | [SUA22] p. 18, imagen; [DccSUA] p. 33, imagen |
| B1.29 | Límites de las filas | VERIFICADO (literal) + **INTERPRETACIÓN** | «Mayor que 12 m» → Δ > 12. «Menor que 0,55 m» → Δ < 0,55. «Comprendida entre 0,55 m y 12 m» → **0,55 ≤ Δ ≤ 12** (los extremos van aquí porque las otras dos filas son estrictas) | Tabla 1.1 | — |
| B1.30 | Áreas con riesgo de impacto | VERIFICADO | a) **Puertas**: del suelo a **1,50 m** de altura, en una anchura igual a la de la puerta **más 0,30 m a cada lado**. b) **Paños fijos**: del suelo a **0,90 m** | pto 2: «a) en puertas, el área comprendida entre el nivel del suelo, una altura de 1,50 m y una anchura igual a la de la puerta más 0,30 m a cada lado de esta; b) en paños fijos, el área comprendida entre el nivel del suelo y una altura de 0,90 m.» Figura 1.2 (cotas 0,90 m, 1,50 m y 0,30 m, leídas en la imagen) | [SUA22] p. 18, imagen |
| B1.31 | Puertas, duchas y bañeras | VERIFICADO | Las partes vidriadas de **puertas** y de **cerramientos de duchas y bañeras**: **laminados o templados** que resistan **sin rotura un impacto de nivel 3** (UNE EN 12600:2003). Sin límite de altura: toda la parte vidriada (lectura literal) | pto 3: «Las partes vidriadas de puertas y de cerramientos de duchas y bañeras estarán constituidas por elementos laminados o templados que resistan sin rotura un impacto de nivel 3, conforme al procedimiento descrito en la norma UNE EN 12600:2003.» | [SUA22] p. 18, imagen |
| B1.32 | ¿Excepción en viviendas? | VERIFICADO (por ausencia) | **No hay**. Ap. 1.3 se aplica dentro de las viviendas, incluidas las mamparas de ducha y bañera. Contraste: ap. 1.4 sí excluye «el interior de viviendas» de forma expresa | ap. 1.3 frente a 1.4 | [SUA22] p. 18 |
| B1.33 | Puertas de balcones y terrazas | LEÍDO (comentario, no reglamentario) | Cada cara expuesta a impacto lleva la clasificación de la tabla o una barrera que cubra el área de riesgo. Puerta abatible de balcón: riesgo por la cara interior (cerrada) y por la exterior (si cabe una persona en el balcón, o si la puerta queda abierta hacia dentro). Corredera: la cara exterior solo si cabe una persona en el balcón. Si cabe, la Δ es la diferencia **entre el suelo interior y el del balcón o terraza** (en la práctica, la fila «< 0,55 m»). Si no cabe, «no hay diferencia de cotas a ambos lados a considerar» | Comentario «Riesgo de impacto en puertas de balcones y terrazas» | [DccSUA] p. 33, imagen |
| B1.34 | Miradores con barandilla independiente | LEÍDO (comentario, no reglamentario) | Si la barandilla frente a la caída de > 55 cm es independiente del vidrio, el vidrio solo tiene que cubrir el riesgo de corte: valen los X(Y)Z de la fila «< 0,55 m» | Comentario, misma entrada | [DccSUA] pp. 33–34 |
| B1.35 | Significado de X, Y y Z | **NO VERIFICABLE** | Está en UNE-EN 12600:2003 y en el «DA DB-SUA / 1», no leídos. La herramienta no debe explicar los parámetros: solo mostrar la fila exigida | Comentario «Documento de apoyo sobre vidrios. DA DB-SUA / 1» | [DccSUA] p. 34 |
| B1.36 | Δ de cota de una ventana o un paño fijo de fachada | **INTERPRETACIÓN** + CRITERIO | Δ = cota del suelo de la planta sobre el terreno o el patio exterior inmediato. La herramienta puede proponerla con la cota de cada planta de El edificio (planta baja ≈ 0 → «< 0,55 m»; plantas altas → «0,55–12 m» o «> 12 m»). Si hay barandilla conforme a SUA 1 ap. 3.2 delante del área de riesgo, no se exige nada (pto 1) | pto 1; tabla 1.1 | — |

**Tabla 1.1 — Valor de los parámetros X(Y)Z en función de la diferencia de cota** ([SUA22] p. 18, imagen; idéntica en [DccSUA] p. 33)

| Diferencia de cotas a ambos lados de la superficie acristalada | X | Y | Z |
|---|---|---|---|
| Mayor que 12 m | cualquiera | B o C | 1 |
| Comprendida entre 0,55 m y 12 m | cualquiera | B o C | 1 ó 2 |
| Menor que 0,55 m | 1, 2 ó 3 | B o C | cualquiera |

Encima de las columnas X, Y y Z hay una cabecera común: «Valor del parámetro». La tabla no tiene notas.

### 1.4 Impacto con elementos insuficientemente perceptibles ([SUA22] p. 18)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B1.37 | Señalización de grandes superficies acristaladas | VERIFICADO | En toda su longitud, señalización visualmente contrastada: altura inferior **entre 0,85 y 1,10 m**; altura superior **entre 1,50 y 1,70 m**. No hace falta si hay **montantes a ≤ 0,60 m** o un **travesaño** a la altura inferior | pto 1: «Las grandes superficies acristaladas que se puedan confundir con puertas o aberturas (lo que excluye el interior de viviendas) estarán provistas, en toda su longitud, de señalización visualmente contrastada situada a una altura inferior comprendida entre 0,85 y 1,10 m y a una altura superior comprendida entre 1,50 y 1,70 m. Dicha señalización no es necesaria cuando existan montantes separados una distancia de 0,60 m, como máximo, o si la superficie acristalada cuenta al menos con un travesaño situado a la altura inferior antes mencionada.» | [SUA22] p. 18, imagen |
| B1.38 | ¿Excluye el interior de las viviendas? | VERIFICADO | **Sí, expresamente.** Según el comentario, el interior incluye las zonas exteriores privativas. La unifamiliar queda fuera entera | pto 1, paréntesis; comentario «Interior de las viviendas» (remite a la definición de uso restringido) | [SUA22] p. 18; [DccSUA] pp. 34, 72 |
| B1.39 | Puertas de vidrio | VERIFICADO | Si no tienen elementos que las identifiquen (cercos o tiradores), la misma señalización del pto 1 | pto 2: «Las puertas de vidrio que no dispongan de elementos que permitan identificarlas, tales como cercos o tiradores, dispondrán de señalización conforme al apartado 1 anterior.» | [SUA22] p. 18, imagen |
| B1.40 | Dónde aplica en el edificio | **INTERPRETACIÓN** | Portal (fachada acristalada, puerta de vidrio), zonas comunes, oficinas (mamparas de vidrio) y local. No aplica al interior de las viviendas | pto 1 | — |
| B1.41 | «Grandes superficies»: ¿desde qué tamaño? | **NO VERIFICABLE** | El DB no da tamaño. Decisión del proyectista (CRITERIO S7) | — | — |

---

## Bloque B2 — SUA 2 ap. 2: atrapamiento ([SUA22] p. 19)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B2.1 | Puertas correderas manuales: 20 cm | VERIFICADO | Distancia **a ≥ 20 cm** hasta el objeto fijo más próximo, incluidos los mecanismos de apertura y cierre. La figura 2.1 rotula «a ≥ 20 cm» | pto 1: «Con el fin de limitar el *riesgo* de atrapamiento producido por una puerta corredera de accionamiento manual, incluidos sus mecanismos de apertura y cierre, la distancia *a* hasta el objeto fijo más próximo será 20 cm, como mínimo (véase figura 2.1).» | [SUA22] p. 19, imagen |
| B2.2 | Qué mide «a» | **INTERPRETACIÓN** (lectura de la figura 2.1) | Con la hoja abierta del todo, la holgura entre su canto y el paramento fijo hacia el que desliza | Figura 2.1 | [SUA22] p. 19, imagen |
| B2.3 | Elementos de apertura y cierre automáticos (puerta de garaje) | VERIFICADO | **Dispositivos de protección** adecuados al tipo de accionamiento y cumplimiento de sus **especificaciones técnicas propias**. El articulado no cita ninguna norma | pto 2: «Los elementos de apertura y cierre automáticos dispondrán de dispositivos de protección adecuados al tipo de accionamiento y cumplirán con las especificaciones técnicas propias.» | [SUA22] p. 19, imagen |
| B2.4 | ¿Excluye viviendas o uso restringido? | VERIFICADO (por ausencia) | **No**. Ap. 2 se aplica también a las correderas de las viviendas y a la puerta motorizada del garaje de la unifamiliar | ap. 2 | [SUA22] p. 19 |
| B2.5 | Comentarios del Ministerio a ap. 2 | **NO VERIFICABLE** | [DccSUA] no tiene ninguno (pp. 34) | — | [DccSUA] p. 34 |

---

## Bloque B3 — SUA 3: aprisionamiento ([SUA22] p. 20)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B3.1 | Bloqueo interior → desbloqueo exterior | VERIFICADO | Si la puerta de un recinto se puede bloquear desde dentro **y** alguien puede quedar atrapado accidentalmente: **algún sistema de desbloqueo desde el exterior** | pto 1: «Cuando las puertas de un recinto tengan dispositivo para su bloqueo desde el interior y las personas puedan quedar accidentalmente atrapadas dentro del mismo, existirá algún sistema de desbloqueo de las puertas desde el exterior del recinto. Excepto en el caso de los baños o los aseos de viviendas, dichos recintos tendrán iluminación controlada desde su interior.» | [SUA22] p. 20, imagen; [DccSUA] p. 35 |
| B3.2 | ¿Qué exceptúa el «Excepto … viviendas»? | VERIFICADO (literal) | **Solo la iluminación.** Los baños y aseos de las viviendas **sí** necesitan desbloqueo exterior si tienen pestillo. **No** necesitan que la luz se controle desde dentro (el interruptor puede estar fuera). Todos los demás recintos con bloqueo interior: desbloqueo exterior **e** iluminación controlada desde dentro | pto 1, 2.ª frase | [SUA22] p. 20 |
| B3.3 | Llamada de asistencia | VERIFICADO | Solo en **zonas de uso público**: los aseos accesibles y las cabinas de vestuario accesibles llevan un dispositivo interior fácilmente accesible. La llamada tiene que ser perceptible desde un punto de control, con confirmación al usuario, **o** perceptible desde un paso frecuente de personas | pto 2: «En zonas de *uso público*, los aseos accesibles y cabinas de vestuarios accesibles dispondrán de un dispositivo en el interior fácilmente accesible, mediante el cual se transmita una llamada de asistencia perceptible desde un punto de control y que permita al usuario verificar que su llamada ha sido recibida, o perceptible desde un paso frecuente de personas.» | [SUA22] p. 20, imagen |
| B3.4 | Comentario a la llamada | LEÍDO (comentario, no reglamentario) | Al menos dos vías simultáneas, normalmente visual y acústica. Acústica: 15 dB sobre el ambiente y ≥ 65 dB(A) (UNE-EN ISO 7731:2008). Estroboscópica de 0,5 a 4 Hz (ISO 21542). Activable desde el inodoro, desde el asiento y por alguien tendido en el suelo. Recomendación: cordón rojo con dos brazaletes de 50 mm de diámetro, uno entre 800 y 1100 mm de altura y otro a 100 mm (ISO 21542) | Comentario «Dispositivo de llamada de asistencia perceptible en aseos y cabinas de vestuario accesibles» | [DccSUA] p. 35 |
| B3.5 | Fuerza de apertura: 140 N / 25 N / 65 N | VERIFICADO | Puertas de salida: **≤ 140 N**. En itinerarios accesibles: **≤ 25 N** en general y **≤ 65 N** si son resistentes al fuego (lo confirma la definición de itinerario accesible, D8) | pto 3: «La fuerza de apertura de las puertas de salida será de 140 N, como máximo, excepto en las situadas en *itinerarios accesibles*, en las que se aplicará lo establecido en la definición de los mismos en el anejo A Terminología (como máximo 25 N, en general, 65 N cuando sean resistentes al fuego).» | [SUA22] pp. 20, 36, imagen |
| B3.6 | Método de ensayo | VERIFICADO | **UNE-EN 12046-2:2000**, para puertas manuales batientes, pivotantes y deslizantes con pestillo de media vuelta. **Quedan fuera** las puertas con cierre automático y las de herrajes especiales (p. ej. dispositivos de salida de emergencia) | pto 4: «Para determinar la fuerza de maniobra de apertura y cierre de las puertas de maniobra manual batientes/pivotantes y deslizantes equipadas con pestillos de media vuelta y destinadas a ser utilizadas por peatones (excluidas puertas con sistema de cierre automático y puertas equipadas con herrajes especiales, como por ejemplo los dispositivos de salida de emergencia) se empleará el método de ensayo especificado en la norma UNE-EN 12046-2:2000.» | [SUA22] p. 20, imagen |
| B3.7 | ¿Cómo se mide en una puerta con cierrapuertas (vestíbulo de independencia, EI₂-C5)? | **NO VERIFICABLE** | El pto 4 la excluye del método y el DB no da otro. El límite de 65 N se aplica igual | ptos 3 y 4 | — |
| B3.8 | «Puerta de salida»: ¿cuáles? | **INTERPRETACIÓN** | El DB-SUA no la define. Lectura con el DB-SI: puertas de salida de recinto, de planta y de edificio. En nuestro edificio: puerta del portal, puertas de la escalera y de los vestíbulos de independencia, salidas del garaje, puerta de entrada a las oficinas y puerta de cada vivienda | — | — |
| B3.9 | ¿Cuáles van a 25 N / 65 N? | **INTERPRETACIÓN** | Las que están en un itinerario accesible exigido por SUA 9: lo normal, la puerta del portal y las del recorrido accesible hasta las viviendas, el ascensor, el garaje (si hay plazas accesibles) y las oficinas. Las puertas resistentes al fuego de ese itinerario (vestíbulo de independencia del garaje, escalera protegida): 65 N. Qué itinerarios exige SUA 9 lo verifica otro agente | pto 3; D8 | — |
| B3.10 | «Pequeños recintos y espacios: aseo accesible con giro de 1,50 m» en SUA 3 | **CORREGIDO** | SUA 3 vigente tiene **solo un apartado y cuatro puntos** (los de B3.1, B3.3, B3.5 y B3.6). **No** trata las dimensiones de pequeños recintos ni del aseo accesible. El giro de **Ø 1,50 m** del aseo accesible está en el **Anejo A**, «Servicios higiénicos accesibles» (D9). Cuántos aseos accesibles hay que poner lo dice SUA 9 (otro agente) | SUA 3 entera; Anejo A, «Servicios higiénicos accesibles» | [SUA22] pp. 20, 37, imagen |
| B3.11 | Comentario: herrajes | LEÍDO (comentario, no reglamentario) | UNE-CEN/TR 15894:2011 IN: especificaciones de diseño de puertas para niños, mayores y personas con discapacidad (orientativo) | Comentario «Herrajes para la edificación» | [DccSUA] p. 36 |

**Qué aplica de SUA 3 en cada zona** (INTERPRETACIÓN sobre B3.1 a B3.9):

| Zona | pto 1 (desbloqueo; luz desde dentro) | pto 2 (llamada de asistencia) | pto 3 (fuerza) |
|---|---|---|---|
| Interior de vivienda (piso o unifamiliar) | Baños y aseos con pestillo: **desbloqueo exterior**. Luz: **exentos** | No: la vivienda es toda uso privado (D3) | Puerta de entrada de la vivienda ≤ 140 N; las interiores no son «de salida» |
| Zonas comunes de la plurifamiliar | Solo si hay algún recinto con bloqueo interior (aseo comunitario, poco habitual): desbloqueo + luz desde dentro | No (uso privado) | Portal, escalera, vestíbulos: ≤ 140 N; en itinerario accesible ≤ 25 N (≤ 65 N si EI) |
| Garaje | No hay recintos con bloqueo interior | No (aparcamiento privado; D3) | Salidas peatonales ≤ 140 N; vestíbulo de independencia en itinerario accesible ≤ 65 N |
| Oficinas | Aseos: **desbloqueo exterior y luz controlada desde dentro** | Solo si el aseo accesible está en zona de uso público (atención al público, salas de reuniones: D4, D4a) | Salidas ≤ 140 N; en itinerario accesible ≤ 25 / 65 N |
| Trasteros, cuartos de instalaciones | En general sin bloqueo interior. Los reservados a mantenimiento quedan fuera del DB (D12, D12a) | No | — |

---

## Bloque B4 — SUA 4 ap. 1: alumbrado normal en zonas de circulación ([SUA22] p. 21)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B4.1 | Iluminancias mínimas | VERIFICADO | **20 lux** en zonas exteriores; **100 lux** en zonas interiores; **50 lux** en aparcamientos interiores; **medida a nivel del suelo**. Factor de uniformidad media **≥ 40 %** | pto 1: «En cada zona se dispondrá una instalación de alumbrado capaz de proporcionar, una *iluminancia* mínima de 20 lux en zonas exteriores y de 100 lux en zonas interiores, excepto aparcamientos interiores en donde será de 50 lux, medida a nivel del suelo. El factor de uniformidad media será del 40% como mínimo.» | [SUA22] p. 21, imagen; [DccSUA] p. 37, imagen |
| B4.2 | «TABLA 1.1 de iluminancia mínima» | **CORREGIDO** | En el texto vigente **no hay tabla 1.1** en SUA 4. Las tres cifras van en un párrafo. Una tabla de versiones anteriores del DB no se ha leído y **no** debe usarse | SUA 4 ap. 1 (pp. 21–22 leídas enteras) | [SUA22] p. 21, imagen |
| B4.3 | Uniformidad: definición y muestreo | LEÍDO (comentario, no reglamentario) | Factor de uniformidad = **E_min / E_med**. Muestreo (Guías del IDAE): **K = L·A / (H·(L + A))**; K < 1 → 4 puntos; 1 ≤ K < 2 → 9; 2 ≤ K < 3 → 16; K ≥ 3 → 25. Se mide en el centro de cuadrículas iguales | Comentario «Niveles mínimos de iluminación» (fórmula y ejemplo leídos en la imagen) | [DccSUA] pp. 37–38, imagen |
| B4.4 | 50 lux en el garaje: ¿solo en las calles? | LEÍDO (comentario, no reglamentario) | **En toda la superficie, plazas incluidas** | Comentario al pto 1: «La exigencia de 50 lux debe aplicarse a la totalidad de la superficie (incluidas las propias plazas) ya que es previsible la presencia de peatones en cualquier punto del aparcamiento.» | [DccSUA] p. 37, imagen |
| B4.5 | Detectores de presencia | LEÍDO (comentario, no reglamentario) | Son compatibles con SUA 4-1: el alumbrado normal se exige «cuando se haga uso de las zonas de circulación». Remite a DB-HE 3, ap. 2.3 (zonas de uso esporádico con detección o pulsador temporizado), y cita el comentario del DB-HE según el cual las zonas comunes de los edificios residenciales (escaleras, pasillos, aparcamientos) son de uso esporádico. El alumbrado de emergencia no tiene que estar encendido siempre | Comentario «Iluminación permanente en vestíbulo de ascensores» | [DccSUA] p. 37, imagen |
| B4.6 | Otros reglamentos | LEÍDO (comentario, no reglamentario) | No se aplica si otro reglamento obligatorio impone máximos incompatibles (p. ej. la Ley 31/1988 de calidad astronómica del IAC) | Comentario «Otros reglamentos de obligado cumplimiento» | [DccSUA] p. 37 |
| B4.7 | ¿Se excluye el interior de las viviendas? | **INTERPRETACIÓN (dudosa)** | El texto **no** lo excluye: dice «En cada zona», bajo el título «Alumbrado normal en zonas de circulación», y la exigencia básica 12.4 habla de «zonas de circulación de los edificios, tanto interiores como exteriores». SUA 2 sí escribe la exclusión cuando la quiere (ap. 1.2 y 1.4). No hay comentario. Lectura literal: también los pasillos y distribuidores de la vivienda. En la práctica, la vivienda se entrega con puntos de luz y sin luminarias. Ver CRITERIO S10 | pto 1; Introducción I, art. 12.4 | [SUA22] pp. 3 (texto), 21 (imagen) |
| B4.8 | «Aparcamientos interiores»: ¿también el garaje de la unifamiliar? | **INTERPRETACIÓN** | El pto 1 escribe «aparcamientos» en minúscula y sin cursiva: no remite a la definición de *uso Aparcamiento*. El garaje de la unifamiliar es interior y destinado a aparcar, así que si se aplica SUA 4-1 al interior de la vivienda (B4.7), su cifra es 50 lux | pto 1; D5 | [SUA22] p. 21, imagen |
| B4.9 | Balizamiento | VERIFICADO (fuera del alcance) | Solo en zonas de uso Pública Concurrencia con actividad a baja iluminación (cines, teatros, discotecas…): balizamiento de rampas y de cada peldaño | pto 2 | [SUA22] p. 21, imagen |
| B4.10 | «Señalización de las rampas del aparcamiento» en SUA 4 | **CORREGIDO** | SUA 4 no la trata. La señalización de los garajes está en **SUA 7** (otro agente) | SUA 4 entera | [SUA22] pp. 21–22 |
| B4.11 | Exterior de la parcela | VERIFICADO + comentario | 20 lux en las zonas exteriores de circulación **que formen parte del proyecto** (D12). Comentario: en los recorridos exteriores hasta el espacio exterior seguro tiene que haber alumbrado de emergencia **y** el alumbrado normal mínimo de SUA 4-1 | pto 1; Introducción II; comentario a 2.1 h): «En los recorridos exteriores hasta llegar al espacio exterior seguro también debe haber alumbrado de emergencia y además se debe garantizar el nivel mínimo de alumbrado normal que se exige en SUA 4-1.» | [SUA22] pp. 4, 21; [DccSUA] p. 39, imagen |

**Aplicación de SUA 4-1 por zona** (INTERPRETACIÓN):

| Zona | Cifra | Nota |
|---|---|---|
| Portal, rellanos, escalera, pasillos de trasteros (interior) | 100 lux, U ≥ 40 % | Zonas de circulación comunes |
| Garaje de la plurifamiliar | 50 lux en toda la superficie, U ≥ 40 % | Comentario B4.4 |
| Oficinas (pasillos y zonas de paso) | 100 lux, U ≥ 40 % | — |
| Exterior de la parcela (accesos, rampa peatonal, jardín comunitario) | 20 lux, U ≥ 40 % | Solo lo que es del proyecto |
| Interior de vivienda | 100 lux (literal) | Dudoso: B4.7 y CRITERIO S10 |
| Garaje de la unifamiliar | 50 lux (literal) | Dudoso: B4.8 |
| Cuartos de instalaciones reservados a mantenimiento | — | Fuera del DB-SUA (D12) |

---

## Bloque B5 — SUA 4 ap. 2: alumbrado de emergencia ([SUA22] pp. 21–22)

### 2.1 Dotación

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B5.1 | Objeto | VERIFICADO | — | pto 1, párrafo 1: «Los edificios dispondrán de un alumbrado de emergencia que, en caso de fallo del alumbrado normal, suministre la iluminación necesaria para facilitar la visibilidad a los usuarios de manera que puedan abandonar el edificio, evite las situaciones de pánico y permita la visión de las señales indicativas de las salidas y la situación de los equipos y medios de protección existentes» (sin punto final en el original) | [SUA22] p. 21, imagen |
| B5.2 | Lista de zonas y elementos | VERIFICADO | Literal: | pto 1: «Contarán con alumbrado de emergencia las zonas y los elementos siguientes: **a)** Todo recinto cuya ocupación sea mayor que 100 personas; **b)** Los recorridos desde todo *origen de evacuación* hasta el *espacio exterior seguro* y hasta las *zonas de refugio*, incluidas las propias *zonas de refugio*, según definiciones en el Anejo A de DB SI; **c)** Los aparcamientos cerrados o cubiertos cuya superficie construida exceda de 100 m², incluidos los pasillos y las escaleras que conduzcan hasta el exterior o hasta las zonas generales del edificio; **d)** Los locales que alberguen equipos generales de las instalaciones de protección contra incendios y los de riesgo especial, indicados en DB-SI 1; **e)** Los aseos generales de planta en edificios de *uso público*; **f)** Los lugares en los que se ubican cuadros de distribución o de accionamiento de la instalación de alumbrado de las zonas antes citadas; **g)** Las señales de seguridad; **h)** Los *itinerarios accesibles*.» | [SUA22] p. 21, imagen; [DccSUA] pp. 38–39 |
| B5.3 | Comparaciones | VERIFICADO (literal) | a) «mayor que 100 personas» → > 100 (estricto). c) «exceda de 100 m²» de superficie **construida** → > 100 (estricto) | a), c) | [SUA22] p. 21 |
| B5.4 | ¿c) es «uso Aparcamiento»? | **INTERPRETACIÓN** | c) escribe «aparcamientos cerrados o cubiertos» sin cursiva, pero el umbral (> 100 m² construidos) coincide con el de *uso Aparcamiento* (D5). En la plurifamiliar da igual: el garaje de ≤ 100 m² entra por d) y por b) (B5.7) | c); D5 | — |
| B5.5 | Comentario: cabinas de aseo | LEÍDO (comentario, no reglamentario) | No hace falta dentro de una cabina de inodoro, aunque sería una mejora. **Sí** en la zona común del aseo y **sí** parece más necesario dentro de los servicios higiénicos accesibles (forman parte de itinerarios accesibles) | Comentario «Alumbrado de emergencia en cabinas de aseo» | [DccSUA] pp. 38–39, imagen |
| B5.6 | Comentario: recorridos exteriores | LEÍDO (comentario, no reglamentario) | Hasta el espacio exterior seguro, también fuera del edificio, emergencia **y** alumbrado normal | Comentario a h) (ver B4.11) | [DccSUA] p. 39, imagen |

**B5.7 — Aplicación a nuestro edificio** (INTERPRETACIÓN salvo donde se indica)

| Zona | Letra(s) | ¿Lleva alumbrado de emergencia? | Apoyo |
|---|---|---|---|
| **Unifamiliar: interior** | — | **No.** No hay origen de evacuación dentro de una vivienda (D13), ni recintos de más de 100 personas, ni itinerario accesible exigido salvo que sea vivienda accesible (SUA 9 ap. 1 pto 2: «Dentro de los límites de las viviendas, incluidas las unifamiliares y sus zonas exteriores privativas, las condiciones de accesibilidad únicamente son exigibles en aquellas que deban ser accesibles.», [SUA22] p. 31, texto; lo verifica el agente de SUA 9) | b), h) |
| **Unifamiliar: garaje integrado** | d) (+ f, g) | **Sí, en lectura literal (dudosa).** No entra por c), porque el garaje de una unifamiliar no es uso Aparcamiento (D5). Pero es **local de riesgo especial bajo «en todo caso»** según SI 1, tabla 2.1 («Aparcamiento de vehículos cuya superficie S no exceda de 100 m² o integrado en una vivienda unifamiliar», [VSI12] 2.x, tabla 2.1), y d) dice «los de riesgo especial, indicados en DB-SI 1». Además lleva extintor ([VSI46] C1.17): su señal entra por g). No hay comentario del Ministerio. Ver CRITERIO S11 | d), g); SI 1 tabla 2.1 |
| **Unifamiliar: sala de calderas > 70 kW u otro local de riesgo especial** | d) | Sí (literal), por la misma razón | SI 1 tabla 2.1 ([VSI12]) |
| **Plurifamiliar: rellanos, escalera, portal** | b) | **Sí**: es el recorrido desde la puerta de cada vivienda (origen, D13) hasta la calle o el espacio exterior seguro. La escalera, de modo que **cada tramo** reciba luz directa (2.2) | b) |
| **Plurifamiliar: recorrido exterior por la parcela hasta la calle** | b) | **Sí**, si el espacio exterior seguro está más allá de la puerta del portal (comentario B5.6) | b); [DccSUA] p. 39 |
| **Garaje de la plurifamiliar, > 100 m² construidos, cerrado o cubierto** | c) (+ b) | **Sí**: todo el garaje y los pasillos y escaleras hasta el exterior o las zonas generales | c) |
| **Garaje de la plurifamiliar, ≤ 100 m²** | d), b) | **Sí**: riesgo especial bajo «en todo caso» (SI 1 tabla 2.1) y sus puntos son origen de evacuación (D13) | d), b) |
| **Zona de trasteros de > 50 m²** (suma de trasteros) | b), d) | **Sí**: zona de ocupación nula de > 50 m² → origen de evacuación (D13); trasteros de 50 < S ≤ 100 m² → riesgo especial bajo (SI 1 tabla 2.1, [VSI12]) | b), d) |
| **Zona de trasteros de ≤ 50 m²** | — | **No en lectura literal**: no es origen de evacuación ni riesgo especial. Ver CRITERIO S12 | — |
| **Cuartos de riesgo especial**: contadores de electricidad y cuadros generales, maquinaria de ascensores, climatización, grupo electrógeno (todos «en todo caso»); calderas > 70 kW; residuos > 5 m² | d) | **Sí** | SI 1 tabla 2.1 ([VSI12]) |
| **Local de equipos generales de PCI** (grupo de presión y aljibe de BIE) | d) | **Sí** | d) |
| **Cuartos que no son de riesgo especial** (RITI, RITS, contadores de agua, limpieza) | — | **No** por sí mismos; **sí** si albergan cuadros de alumbrado de zonas con emergencia (f) | f) |
| **Lugar del cuadro de alumbrado de zonas comunes** | f) | **Sí**, con **5 lux** en el punto del cuadro (2.3 b) | f); 2.3 b) |
| **Señales de evacuación y de extintores y BIE** | g) | **Sí**, con 2.4 | g) |
| **Itinerarios accesibles** (portal → ascensor → viviendas; plazas accesibles del garaje) | h) | **Sí**. Casi siempre coinciden con b). Qué itinerarios exige SUA 9 lo verifica otro agente | h) |
| **Oficinas** | b) (+ a, e, h) | **Sí** en pasillos y zonas abiertas: todo punto ocupable es origen, salvo dentro de los despachos de ≤ 50 m² con densidad ≤ 1 persona/5 m² (D13), cuyo recorrido empieza en la puerta. a) solo con un recinto de más de 100 personas (más de 1.000 m² útiles a 10 m²/persona, SI 3 tabla 2.1, [VSI3] B2.6). e) «aseos generales de planta en edificios de uso público»: ver CRITERIO S13 | b), a), e), h) |
| **Local sin uso** | — | Se justificará con su actividad (obra inacabada: comentario del DB-SI citado en [VSI46] C1.16). Ver CRITERIO S14 | — |
| **Cabina del ascensor** | — | **NO VERIFICABLE**: SUA 4 no la nombra (es reglamentación de ascensores, no leída) | — |

### 2.2 Posición y características de las luminarias ([SUA22] pp. 21–22)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B5.8 | Altura | VERIFICADO | **≥ 2 m** sobre el suelo | 2.2 pto 1 a): «Se situarán al menos a 2 m por encima del nivel del suelo;» | [SUA22] p. 21, imagen |
| B5.9 | Dónde | VERIFICADO | Una en **cada puerta de salida** y donde haya que destacar un peligro potencial o un equipo de seguridad. Como mínimo: puertas de los recorridos de evacuación; escaleras (cada tramo con iluminación directa); cualquier otro cambio de nivel; cambios de dirección e intersecciones de pasillos | 2.2 pto 1 b): «Se dispondrá una en cada puerta de salida y en posiciones en las que sea necesario destacar un peligro potencial o el emplazamiento de un equipo de seguridad. Como mínimo se dispondrán en los siguientes puntos: — en las puertas existentes en los recorridos de evacuación; — en las escaleras, de modo que cada tramo de escaleras reciba iluminación directa; — en cualquier otro cambio de nivel; — en los cambios de dirección y en las intersecciones de pasillos;» | [SUA22] p. 22, imagen |
| B5.10 | «Equipos de PCI y primeros auxilios» como puntos mínimos de 2.2 | **CORREGIDO** | La lista mínima de 2.2 **no** los nombra. Los equipos de seguridad entran por la cláusula general («emplazamiento de un equipo de seguridad») y por los **5 lux** de 2.3 b). «Primeros auxilios» solo aparece en 2.4, referido a las **señales** | 2.2 pto 1 b); 2.3 pto 3 b); 2.4 pto 1 | [SUA22] p. 22, imagen |

### 2.3 Características de la instalación ([SUA22] p. 22)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B5.11 | Fija, fuente propia, arranque automático; qué es «fallo» | VERIFICADO | Fallo = tensión **por debajo del 70 %** de la nominal | pto 1: «La instalación será fija, estará provista de fuente propia de energía y debe entrar automáticamente en funcionamiento al producirse un fallo de alimentación en la instalación de alumbrado normal en las zonas cubiertas por el alumbrado de emergencia. Se considera como fallo de alimentación el descenso de la tensión de alimentación por debajo del 70% de su valor nominal.» | [SUA22] p. 22, imagen |
| B5.12 | «Fuente propia»: ¿equipos autónomos obligatorios? | **NO VERIFICABLE** | El DB no exige que sean autónomos. Un sistema centralizado también tiene «fuente propia». Lo concreta el REBT (ITC-BT-28), no leído | pto 1 | — |
| B5.13 | Tiempos de respuesta | VERIFICADO | En las vías de evacuación: **≥ 50 %** del nivel requerido **a los 5 s** y **100 % a los 60 s** | pto 2: «El alumbrado de emergencia de las vías de evacuación debe alcanzar al menos el 50% del nivel de iluminación requerido al cabo de los 5 s y el 100% a los 60 s.» | [SUA22] p. 22, imagen |
| B5.14 | Autonomía | VERIFICADO | **≥ 1 hora** desde el fallo | pto 3: «La instalación cumplirá las condiciones de servicio que se indican a continuación durante una hora, como mínimo, a partir del instante en que tenga lugar el fallo:» | [SUA22] p. 22, imagen |
| B5.15 | Vías de evacuación | VERIFICADO | Anchura **≤ 2 m** («no exceda de 2 m»): iluminancia horizontal en el suelo **≥ 1 lux en el eje central** y **≥ 0,5 lux en la banda central** (al menos la mitad de la anchura). Vías de **> 2 m**: se pueden tratar como bandas de **2 m como máximo** | pto 3 a): «En las vías de evacuación cuya anchura no exceda de 2 m, la *iluminancia* horizontal en el suelo debe ser, como mínimo, 1 lux a lo largo del eje central y 0,5 lux en la banda central que comprende al menos la mitad de la anchura de la vía. Las vías de evacuación con anchura superior a 2 m pueden ser tratadas como varias bandas de 2 m de anchura, como máximo.» | [SUA22] p. 22, imagen |
| B5.16 | Equipos de seguridad y cuadros | VERIFICADO | **≥ 5 lux** horizontal donde estén los equipos de seguridad, las instalaciones de PCI de uso manual y los cuadros de distribución del alumbrado | pto 3 b): «En los puntos en los que estén situados los equipos de seguridad, las instalaciones de protección contra incendios de utilización manual y los cuadros de distribución del alumbrado, la *iluminancia* horizontal será de 5 lux, como mínimo.» (el texto extraído dice «Iux»; la imagen, «lux») | [SUA22] p. 22, imagen |
| B5.17 | Uniformidad en el eje | VERIFICADO | E_max / E_min **≤ 40:1** a lo largo de la línea central | pto 3 c): «A lo largo de la línea central de una vía de evacuación, la relación entre la *iluminancia* máxima y la mínima no debe ser mayor que 40:1.» | [SUA22] p. 22, imagen |
| B5.18 | Hipótesis de cálculo | VERIFICADO + **NO VERIFICABLE** (valor) | Reflexión nula en paredes y techos; factor de mantenimiento por suciedad y envejecimiento. **El DB no da el valor** del factor | pto 3 d): «Los niveles de iluminación establecidos deben obtenerse considerando nulo el factor de reflexión sobre paredes y techos y contemplando un factor de mantenimiento que englobe la reducción del rendimiento luminoso debido a la suciedad de las luminarias y al envejecimiento de las lámparas.» | [SUA22] p. 22, imagen |
| B5.19 | Rendimiento de color | VERIFICADO | **Ra ≥ 40** | pto 3 e): «Con el fin de identificar los colores de seguridad de las señales, el valor mínimo del índice de rendimiento cromático Ra de las lámparas será 40.» | [SUA22] p. 22, imagen |

### 2.4 Iluminación de las señales de seguridad ([SUA22] p. 22)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B5.20 | A qué señales | VERIFICADO | Señales de evacuación de las salidas, señales de los medios manuales de PCI y de los de primeros auxilios | pto 1: «La iluminación de las señales de evacuación indicativas de las salidas y de las señales indicativas de los medios manuales de protección contra incendios y de los de primeros auxilios, deben cumplir los siguientes requisitos:» | [SUA22] p. 22, imagen |
| B5.21 | Luminancia mínima | VERIFICADO | **≥ 2 cd/m²** en cualquier área de color de seguridad, en todas las direcciones de visión importantes | a): «La *luminancia* de cualquier área de color de seguridad de la señal debe ser al menos de 2 cd/m² en todas las direcciones de visión importantes;» | [SUA22] p. 22, imagen |
| B5.22 | Uniformidad | VERIFICADO | L_max / L_min **≤ 10:1** dentro del blanco o del color de seguridad | b): «La relación de la *luminancia* máxima a la mínima dentro del color blanco o de seguridad no debe ser mayor de 10:1, debiéndose evitar variaciones importantes entre puntos adyacentes;» | [SUA22] p. 22, imagen |
| B5.23 | Contraste | VERIFICADO (literal) | **5:1 ≤ L_blanca / L_color ≤ 15:1** | c): «La relación entre la *luminancia* L_blanca, y la *luminancia* L_color >10, no será menor que 5:1 ni mayor que 15:1.» («blanca» y «color» son subíndices en la imagen) | [SUA22] p. 22, imagen; [DccSUA] p. 40 |
| B5.24 | El «>10» tras L_color | **NO VERIFICABLE** | Está en las dos fuentes, a tamaño normal y fuera del subíndice. No se sabe qué significa (¿errata?). No usarlo en ningún cálculo ni mostrarlo sin la cita literal | c) | [SUA22] p. 22, imagen |
| B5.25 | Tiempos | VERIFICADO | **≥ 50 % a los 5 s** y **100 % a los 60 s** | d): «Las señales de seguridad deben estar iluminadas al menos al 50% de la *iluminancia* requerida, al cabo de 5 s, y al 100% al cabo de 60 s.» | [SUA22] p. 22, imagen |
| B5.26 | Qué señales hay en un edificio de viviendas | Citado ([VSI3] B7.2) | En Residencial Vivienda **no** se exige el rótulo «SALIDA» (SI 3-7 pto 1 a). Sí hay señales de dirección donde no se vean las salidas, las del garaje (CRITERIO de [VSI3] B7.4) y las de extintores y BIE (RIPCI) | SI 3 ap. 7 | vía [VSI3] |

---

## Bloque B6 — SUA 5: alta ocupación ([SUA22] pp. 23–24)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B6.1 | Ámbito | VERIFICADO | Solo graderíos de estadios, pabellones polideportivos, centros de reunión, otros edificios de uso cultural, etc., previstos para **más de 3000 espectadores de pie**, con la densidad de **4 personas/m²** de SI 3 cap. 2 (nota (1)) | ap. 1 pto 1: «Las condiciones establecidas en esta Sección son de aplicación a los graderíos de estadios, pabellones polideportivos, centros de reunión, otros edificios de uso cultural, etc. previstos para más de 3000 espectadores de pie⁽¹⁾. En todo lo relativo a las condiciones de evacuación les es también de aplicación la Sección SI 3 del Documento Básico DB-SI.» Nota (1): «Considerando la densidad de ocupación de 4 personas /m² que se establece en el Capítulo 2 de la Sección 3 del DB-SI.» | [SUA22] p. 23, imagen; [DccSUA] p. 41 |
| B6.2 | Viviendas, oficinas, garaje, local | VERIFICADO (por el ámbito) | **No es de aplicación**: no hay graderíos | ap. 1 pto 1 | [SUA22] p. 23 |
| B6.3 | Comentario: solo graderíos de pie | LEÍDO (comentario, no reglamentario) | Las barreras rompeolas solo se exigen en graderíos sin asientos con respaldo. No protegen frente a caídas | Comentario al ap. 1 | [DccSUA] p. 41 |
| B6.4 | Contenido (no se usa) | VERIFICADO | Pendiente ≤ 50 %; fila ≤ 20 m con acceso por los dos extremos, ≤ 10 m con uno; pasillos según SI 3 cap. 4; ≤ 4 m de cota hasta una salida; con más de 5 filas y pendiente > 6 %, barrera de **1,10 m** delante de la primera fila y otras según la tabla 2.1 (6 % ≤ P ≤ 10 % → 5 m; 10 % < P ≤ 25 % → 4 m; 25 % < P ≤ 50 % → 3 m); **5,0 kN/m** en el borde superior; no más de 2 aberturas alineadas, línea a < 60°, aberturas de 1,10 a 1,40 m | ap. 2 ptos 1 a 5; tabla 2.1 | [SUA22] p. 23, imagen |

Frase de memoria: «SUA 5. No es de aplicación: el edificio no contiene graderíos para más de 3000 espectadores de pie (CTE DB-SUA, SUA 5 ap. 1 pto 1).»

---

## Bloque B7 — Entradas mínimas y frases de memoria

«De El edificio» = la herramienta lo saca sola. «Decisión» = lo confirma el proyectista; el valor «lo habitual» es **CRITERIO** y va rotulado.

### SUA 2

| # | Entrada | Origen | Lo habitual (CRITERIO) | Límite del DB |
|---|---|---|---|---|
| E2.1 | Zonas presentes y si son de uso restringido | De El edificio (usos) | Viviendas y garaje de la unifamiliar → restringido; zonas comunes y garaje comunitario → general; oficinas → general (S2) | D1 |
| E2.2 | Altura libre mínima en zonas de circulación, por zona, **bajo vigas, conductos, bandejas y escaleras** | Decisión (cifra) | Viviendas ≥ 2,40 m (falso techo de pasillo); zonas comunes ≥ 2,50 m; garaje ≥ 2,20 m bajo el elemento más bajo | ≥ 2,10 / ≥ 2,20 / umbrales ≥ 2,00 m |
| E2.3 | ¿Vuelos de fachada (balcones, marquesinas, toldos fijos) sobre zonas de circulación? Altura mínima | Decisión | «No hay vuelos por debajo de 2,20 m» | ≥ 2,20 m |
| E2.4 | ¿Salientes en paredes de zonas de circulación? (extintores, BIE, cuadros) | Decisión | «Vuelan ≤ 15 cm o arrancan del suelo; extintores en rincones o ensanchamientos» | ≤ 15 cm entre 0,15 y 2,20 m |
| E2.5 | ¿Huecos accesibles bajo escaleras o rampas de < 2 m de altura? | Decisión | «Sí: cerrados con elemento fijo detectable con bastón» (o «no hay») | pto 4 |
| E2.6 | Puertas que abren a pasillos o rellanos comunes de < 2,50 m | Decisión | «Las puertas de las viviendas abren hacia el interior; solo invaden el pasillo las de cuartos de ocupación nula» | ap. 1.2 pto 1 |
| E2.7 | ¿Puertas de vaivén? | Decisión | «No hay» | 0,7–1,5 m |
| E2.8 | Puerta de garaje y puertas automáticas: marcado CE y dispositivos de protección | Decisión | «Sí» | ap. 1.2 ptos 3 y 4; ap. 2 pto 2 |
| E2.9 | Acristalamientos en áreas de riesgo (puertas hasta 1,50 m; paños hasta 0,90 m) sin barrera SUA 1-3.2, y Δ de cota | Δ de El edificio (cota de planta); decisión «hay / no hay» | Puertas y balconeras: vidrio laminado o templado con la clasificación de la fila «< 0,55 m» (balcón practicable) o la de su fila, declarada por el fabricante | Tabla 1.1 |
| E2.10 | Mamparas de ducha y bañera | Decisión | «Si se colocan, de vidrio laminado o templado, nivel 3» | ap. 1.3 pto 3 |
| E2.11 | Grandes acristalamientos y puertas de vidrio en zonas comunes u oficinas | Decisión | «La puerta del portal lleva cerco y tirador» o «señalización a 0,85–1,10 y 1,50–1,70 m» | ap. 1.4 |
| E2.12 | Puertas correderas manuales | Decisión | «Holgura ≥ 20 cm al objeto fijo» (o «no hay») | ap. 2 pto 1 |

Frases de memoria (SUA 2):
- «La altura libre de paso en las zonas de circulación es de al menos 2,20 m en las zonas comunes y en el garaje, y de 2,10 m en el interior de las viviendas; en los umbrales de las puertas, de al menos 2,00 m (DB-SUA, SUA 2 ap. 1.1 pto 1).»
- «No existen elementos fijos salientes de fachada sobre zonas de circulación a menos de 2,20 m, ni salientes en paredes que vuelen más de 15 cm entre 0,15 y 2,20 m de altura (SUA 2 ap. 1.1 ptos 2 y 3).»
- «Las puertas de los recintos situadas en el lateral de pasillos comunes de anchura inferior a 2,50 m abren de forma que su barrido no invade el pasillo (SUA 2 ap. 1.2 pto 1).»
- «La puerta de garaje cumple su reglamentación específica, tiene marcado CE y dispone de dispositivos de protección adecuados a su accionamiento (SUA 2 ap. 1.2 pto 3 y ap. 2 pto 2).»
- «Los vidrios de las áreas con riesgo de impacto tienen la clasificación X(Y)Z de la tabla 1.1 según UNE-EN 12600:2003, en función de la diferencia de cota; las partes vidriadas de puertas y los cerramientos de duchas y bañeras son laminados o templados y resisten un impacto de nivel 3 (SUA 2 ap. 1.3).»
- «Las grandes superficies acristaladas de las zonas comunes se señalizan entre 0,85 y 1,10 m y entre 1,50 y 1,70 m de altura (SUA 2 ap. 1.4); esta condición no se aplica al interior de las viviendas.»
- «Las puertas correderas manuales dejan una holgura de al menos 20 cm hasta el objeto fijo más próximo (SUA 2 ap. 2 pto 1).»

### SUA 3

| # | Entrada | Origen | Lo habitual (CRITERIO) | Límite del DB |
|---|---|---|---|---|
| E3.1 | ¿Hay recintos con bloqueo interior? (baños y aseos) | Decisión | «Sí: condena con desbloqueo desde el exterior» | pto 1 |
| E3.2 | Aseos de oficinas o zonas comunes: luz controlada desde dentro | Decisión (solo si hay oficinas o aseo común) | «Sí: interruptor o detector dentro» | pto 1 |
| E3.3 | ¿Aseo accesible en zona de uso público? → llamada de asistencia | Decisión (solo oficinas con público) | «No hay» / «Sí, con llamada visual y acústica» | pto 2 |
| E3.4 | Fuerza de apertura de las puertas de salida | Decisión (declarada) | «≤ 140 N; en el itinerario accesible ≤ 25 N, o ≤ 65 N en las resistentes al fuego (puerta del portal con cierrapuertas regulable)» | pto 3 |

Frases de memoria (SUA 3):
- «Los recintos con bloqueo desde el interior (baños y aseos) disponen de desbloqueo desde el exterior; salvo en los baños y aseos de las viviendas, su iluminación se controla desde el interior (DB-SUA, SUA 3 ap. 1 pto 1).»
- «La fuerza de apertura de las puertas de salida no excede de 140 N, y de 25 N (65 N en las resistentes al fuego) en las situadas en itinerarios accesibles (SUA 3 ap. 1 pto 3; Anejo A, «Itinerario accesible»).»
- Vivienda sin zonas de uso público: «No existen aseos accesibles en zonas de uso público (SUA 3 ap. 1 pto 2: no es de aplicación).»

### SUA 4

| # | Entrada | Origen | Lo habitual (CRITERIO) | Límite del DB |
|---|---|---|---|---|
| E4.1 | Zonas de circulación y su tipo (interior, exterior, aparcamiento) | De El edificio | — | 20 / 100 / 50 lux; U ≥ 40 % |
| E4.2 | Iluminancia de proyecto declarada por zona (opcional) | Decisión (cifra) | Zonas comunes 100 lux; garaje 50 lux en toda la superficie; exterior 20 lux; con detectores de presencia (comentario B4.5) | ídem |
| E4.3 | Zonas con alumbrado de emergencia | De El edificio (B5.7), con riesgo especial de SI 1 y superficie del garaje y de la zona de trasteros | Lista B5.7 | 2.1 a) a h) |
| E4.4 | Garaje de la unifamiliar: ¿alumbrado de emergencia? | Decisión | «Sí, una luminaria junto a la salida y el cuadro» (S11) | 2.1 d) literal |
| E4.5 | Tipo de instalación | Decisión | «Luminarias autónomas, ≥ 2 m, 1 h, con lux calculados con reflexión nula» | 2.2, 2.3 |

Frases de memoria (SUA 4):
- «Las zonas de circulación disponen de alumbrado capaz de proporcionar una iluminancia mínima, medida a nivel del suelo, de 100 lux en las zonas interiores, 50 lux en el aparcamiento y 20 lux en las exteriores, con un factor de uniformidad media de al menos el 40 % (DB-SUA, SUA 4 ap. 1 pto 1).»
- «Disponen de alumbrado de emergencia los recorridos desde todo origen de evacuación hasta el espacio exterior seguro (rellanos, escalera y portal), el aparcamiento, los locales de riesgo especial y de instalaciones de protección contra incendios, los lugares de los cuadros de alumbrado, las señales de seguridad y los itinerarios accesibles (SUA 4 ap. 2.1).»
- «Las luminarias se sitúan a al menos 2 m del suelo, en cada puerta de salida, en las escaleras (cada tramo con iluminación directa), en los cambios de nivel y de dirección y en las intersecciones de pasillos (SUA 4 ap. 2.2).»
- «La instalación es fija, con fuente propia de energía y entrada automática con una tensión inferior al 70 % de la nominal; alcanza el 50 % del nivel a los 5 s y el 100 % a los 60 s; durante 1 h proporciona 1 lux en el eje y 0,5 lux en la banda central de las vías de evacuación de hasta 2 m, y 5 lux en los equipos de seguridad, de protección contra incendios y en los cuadros de alumbrado, con una relación máxima/mínima en el eje no mayor que 40:1 y Ra ≥ 40 (SUA 4 ap. 2.3).»
- «Las señales de seguridad tienen una luminancia de al menos 2 cd/m², una relación máxima/mínima no mayor que 10:1 y una relación entre blanco y color de seguridad entre 5:1 y 15:1, y alcanzan el 50 % a los 5 s y el 100 % a los 60 s (SUA 4 ap. 2.4).»
- Unifamiliar sin garaje ni locales de riesgo especial: «No se exige alumbrado de emergencia: el interior de las viviendas no es origen de evacuación (DB-SI, Anejo SI A) y no hay zonas ni elementos de los enumerados en SUA 4 ap. 2.1.»

### SUA 5
- Ver B6: «SUA 5. No es de aplicación: el edificio no contiene graderíos para más de 3000 espectadores de pie (SUA 5 ap. 1 pto 1).»

---

## Matriz resumen de aplicación (claves de `lib/edificio/usos.ts`)

| Clave | SUA 2 1.1 (altura) | SUA 2 1.2 pto 1 (barrido) | SUA 2 1.3 (vidrios) | SUA 2 1.4 (señalizar vidrio) | SUA 2 ap. 2 | SUA 3 | SUA 4-1 | SUA 4-2 |
|---|---|---|---|---|---|---|---|---|
| `viviendas` (interior) | 2,10 m | No (restringido) | Sí | **No** (excluido) | Sí | pto 1 sin la luz en baños | Dudoso (B4.7) | No (sin origen) |
| `vivienda_unifamiliar` | 2,10 m | No | Sí | **No** | Sí | ídem | Dudoso | No; ver garaje |
| `garaje_privado` (unifamiliar) | 2,10 m (B1.6) | No | Sí | No | Sí (puerta automática) | — | Dudoso, 50 lux (B4.8) | **Literal sí** por d) (S11) |
| `zona_comun`, `vestibulo` | 2,20 m | Sí | Sí | Sí | Sí | pto 3 (portal) | 100 lux (exterior 20) | Sí, b) |
| `garaje` (plurifamiliar) | 2,20 m | Sí (si hay pasillos peatonales) | Sí | Sí | Sí | pto 3 | 50 lux en toda la superficie | Sí, c) o d) + b) |
| `trasteros` | Pasillo: 2,20 m | Las puertas de trastero no (ocupación nula) | Sí | Sí | Sí | — | 100 lux en el pasillo | > 50 m²: sí; ≤ 50 m²: S12 |
| `instalaciones` | Fuera del DB si es solo de mantenimiento (D12) | Sus puertas no (ocupación nula) | — | — | — | — | — | Sí si es de riesgo especial o de PCI (d), o si tiene cuadros (f) |
| `oficinas` | 2,20 m (S2) | Sí | Sí | Sí | Sí | ptos 1, 2 (si hay público), 3 | 100 lux | Sí, b) (+ a, e, h) |
| `local_sin_uso` | Se justificará con la actividad | ídem | ídem | ídem | ídem | ídem | ídem | ídem (S14) |
| Exterior de la parcela (si es del proyecto) | 2,20 m bajo vuelos | — | Sí | Sí | Sí (cancela automática) | — | 20 lux | Sí, si es parte del recorrido hasta el espacio exterior seguro |

---

## Cifras que SÍ se pueden mostrar en la UI, con su cita

Cita base: «CTE DB-SUA, texto consolidado 14-06-2022».
- **SUA 2 ap. 1.1**:
  - altura libre ≥ 2,10 m (uso restringido) y ≥ 2,20 m (resto); umbral de puertas ≥ 2,00 m;
  - vuelos de fachada sobre zonas de circulación ≥ 2,20 m;
  - salientes en paredes: no más de 15 cm entre 0,15 y 2,20 m;
  - volados de menos de 2 m: hay que protegerlos.
- **SUA 2 ap. 1.2**:
  - pasillos de < 2,50 m: el barrido de las puertas no invade el pasillo (excepto en uso restringido y en puertas de ocupación nula);
  - puertas de vaivén: parte transparente de 0,7 a 1,5 m;
  - puertas de garaje y peatonales automáticas: marcado CE.
- **SUA 2 ap. 1.3**:
  - la **tabla 1.1** literal;
  - áreas de riesgo: puertas del suelo a 1,50 m, con 0,30 m a cada lado; paños fijos del suelo a 0,90 m;
  - quedan fuera los vidrios de ≤ 30 cm;
  - puertas, duchas y bañeras: laminado o templado, nivel 3;
  - norma: UNE-EN 12600:2003.
- **SUA 2 ap. 1.4**: señalización entre 0,85 y 1,10 m y entre 1,50 y 1,70 m; no hace falta con montantes a ≤ 0,60 m o con travesaño; excluye el interior de viviendas.
- **SUA 2 ap. 2**: a ≥ 20 cm.
- **SUA 3**:
  - desbloqueo exterior;
  - luz desde dentro, excepto en baños y aseos de viviendas;
  - llamada de asistencia en aseos accesibles de uso público;
  - fuerza de apertura ≤ 140 N, o ≤ 25 N / ≤ 65 N en itinerarios accesibles;
  - método de ensayo UNE-EN 12046-2:2000.
- **Anejo A**: aseo accesible con Ø 1,50 m (citado como Anejo A, no como SUA 3).
- **SUA 4 ap. 1**: 20 / 100 / 50 lux a nivel del suelo; uniformidad ≥ 40 %. Comentario rotulado: 50 lux en toda la superficie del garaje.
- **SUA 4 ap. 2.1**: lista a) a h) literal, con > 100 personas y > 100 m² construidos.
- **SUA 4 ap. 2.2**: ≥ 2 m y los cuatro puntos mínimos.
- **SUA 4 ap. 2.3**:
  - fallo por debajo del 70 % de la tensión nominal;
  - 50 % a los 5 s y 100 % a los 60 s;
  - 1 h de autonomía;
  - 1 lux en el eje y 0,5 lux en la banda central (vías ≤ 2 m; bandas de 2 m como máximo);
  - 5 lux en equipos y cuadros;
  - relación máxima/mínima ≤ 40:1;
  - Ra ≥ 40;
  - cálculo con reflexión nula.
- **SUA 4 ap. 2.4**: 2 cd/m²; ≤ 10:1; entre 5:1 y 15:1; 50 % a los 5 s y 100 % a los 60 s.
- **SUA 5**: ámbito > 3000 espectadores de pie (4 personas/m²).

## Cifras que NO deben mostrarse

- **«Tabla 1.1 de SUA 4»** o cualquier iluminancia de versiones anteriores del DB (B4.2).
- **UNE-EN 13241, UNE-EN 12635, UNE-EN 16005 y UNE 85121 como exigencia del CTE**: son comentario (B1.23, B1.26). Se pueden mostrar rotuladas «comentario del Ministerio».
- **«Aseo accesible Ø 1,50 m» citado como SUA 3** (B3.10). Es Anejo A (y SUA 9 para la dotación).
- **Equipos de PCI y primeros auxilios como puntos mínimos de SUA 4 ap. 2.2** (B5.10).
- **El «>10» de SUA 4 ap. 2.4 c)** como cifra de cálculo (B5.24).
- **Un valor del factor de mantenimiento** como si fuera del DB (B5.18).
- **«Señalización de rampas del garaje» en SUA 4** (B4.10): es SUA 7.
- **Significado de X, Y y Z** (clase de altura, modo de rotura): NO VERIFICABLE aquí (B1.35).
- **«Unifamiliar: SUA 4-2 no aplica»** en bloque, sin el matiz del garaje integrado (B5.7, S11).
- **«En las viviendas no se aplica SUA 2-1.3»**: se aplica (B1.32).

## Criterios de proyecto (lo que el DB no fija)

| # | Tema | Propuesta | Por qué |
|---|---|---|---|
| S1 | Pasillo de 2,50 m justos (SUA 2-1.2) | Tratarlo como < 2,50 m | Hueco del texto (B1.16) |
| S2 | Oficinas: ¿uso restringido? | Por defecto **uso general**. Uso restringido solo si el proyectista declara ≤ 10 usuarios habituales y sin público | Definición D1; lado de la seguridad |
| S3 | Garaje comunitario: altura libre | 2,20 m bajo cualquier elemento en las zonas de circulación (calles y accesos peatonales) | B1.5. La herramienta avisa: es el fallo más frecuente |
| S4 | Δ de cota de los vidrios de fachada | Cota de la planta de El edificio sobre la rasante; en balconeras con balcón practicable, Δ ≈ 0 (fila «< 0,55 m»); en ventanas bajas y paños fijos de plantas altas sin barandilla, la cota de la planta | B1.33, B1.36 |
| S5 | Balcón francés (sin permanencia posible) | Si hay barandilla conforme a SUA 1 ap. 3.2 delante del vidrio → fila «< 0,55 m» (solo riesgo de corte: comentario de miradores). Sin barandilla → Δ = cota de la planta | El comentario «no hay diferencia de cotas a considerar» es ambiguo (B1.33) |
| S6 | Vidrio «lo habitual» | «Laminado o templado de seguridad con clasificación X(Y)Z declarada por el fabricante conforme a la tabla 1.1». **No** proponer una composición (3+3, 4+4…) con su clase: la clase no se ha verificado | B1.35 |
| S7 | «Gran superficie acristalada» | Preguntar solo en zonas comunes, oficinas y local: «¿hay acristalamientos que se puedan confundir con un paso?» | B1.41 |
| S8 | Puertas «de salida» (SUA 3 pto 3) | Puerta del portal, de la escalera, de los vestíbulos de independencia, salidas del garaje, entrada a las oficinas y puerta de cada vivienda | B3.8 |
| S9 | Fuerza de apertura | Declarada, no calculada; aviso en las puertas con cierrapuertas del itinerario accesible (65 N) | B3.7, B3.9 |
| S10 | SUA 4-1 en el interior de la vivienda | Mostrar la exigencia en zonas comunes, garaje, oficinas y exterior. En la vivienda: «El DB no excluye el interior de las viviendas; la instalación de puntos de luz de pasillos y distribuidores permite alcanzar 100 lux» (rotulado CRITERIO). No bloquear | B4.7 |
| S11 | Garaje integrado de la unifamiliar | Por defecto **sí**: una luminaria de emergencia junto a la puerta de salida del garaje (y el extintor señalizado), rotulada «SUA 4-2.1 d): local de riesgo especial bajo según SI 1 tabla 2.1 (lectura literal)». Editable a «no» con aviso | B5.7. Lado de la seguridad; coste mínimo |
| S12 | Zona de trasteros de ≤ 50 m² | Por defecto **sí** en el pasillo de trasteros, rotulado CRITERIO | Literalmente no se exige (B5.7). Es recorrido hasta la salida de planta ([VSI3] B2.12) |
| S13 | Aseos de oficinas (2.1 e) | Si las oficinas tienen zona de atención al público o salas de reuniones, alumbrado de emergencia en la zona común de los aseos generales | «Edificios de uso público» no está definido; D4a |
| S14 | Local sin uso | «Se justificará con el proyecto de la actividad». Dejar previsto el recorrido de su salida | [VSI46] C1.16 |
| S15 | Factor de mantenimiento del cálculo de emergencia | El del fabricante. La herramienta no calcula lux: declara «cálculo con reflexión nula y factor de mantenimiento según fabricante» | B5.18 |

## Pendientes

1. **UNE-EN 12600:2003 y DA DB-SUA/1**: significado de X, Y y Z y la clase de los vidrios habituales (S6). Si se quiere ayudar a elegir vidrio, leer el DA (codigotecnico.org).
2. **Qué disposición redactó cada párrafo** de SUA 2 a SUA 5 (BOE no leído). No cambia las cifras vigentes.
3. **REBT ITC-BT-28**: autónomas frente a centralizadas; no es CTE.
4. **SUA 4-1 en el interior de las viviendas** (B4.7) y **SUA 4-2 en el garaje de la unifamiliar** (B5.7, S11): interpretaciones dudosas que el responsable del proyecto debe validar. Si se quiere una respuesta oficial, es una consulta al Ministerio.
5. **«Zona de circulación»** y **«puerta de salida»**: sin definición en el DB-SUA (Anejo III de la Parte I no leído).
6. **SUA 9** (itinerarios accesibles exigidos, dotación de aseos accesibles): lo verifica otro agente; SUA 3 pto 3 y SUA 4-2.1 h) dependen de él.
7. **Decisiones para validar**: S1 a S15; INTERPRETACIONES B1.5, B1.6, B1.18, B4.7, B4.8, B5.4, B5.7.

---

## Para el código

Sigue el patrón `tablaCTE(procedencia, datos)` de `src/lib/cte/tabla.ts`. **No está aplicado ni compilado.** Todas las cifras salen de la imagen de [SUA22] pp. 17–23, 36–37; coinciden con [DccSUA]. Propuesta de procedencia común en `src/modules/sua/procedencia.ts` (o repetida en cada fichero). Los criterios van fuera de `tablaCTE`, para que la ficha no los cite como CTE.

### `src/modules/sua/procedencia.ts`

```ts
/** DB-SUA vigente: consolidado 14-jun-2022 (último cambio: RD 450/2022). SUA 2 a SUA 5
 *  leídos en imagen a 200 ppp. No mezclar con versiones anteriores (SU 2006). */
export const PROC_SUA = {
  db: "DB-SUA",
  edicion: "Consolidado 14-06-2022 (RD 450/2022)",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DBSUA.pdf (cotejado en imagen)",
} as const;

/** Comentarios del Ministerio: NO reglamentarios. Usar solo para avisos rotulados. */
export const PROC_DCC_SUA = {
  db: "DB-SUA (con comentarios del Ministerio, no reglamentario)",
  edicion: "Articulado 14-06-2022; comentarios 15-07-2024",
  fecha: "2024-07-15",
  fuente: "codigotecnico.org · DccSUA.pdf",
} as const;
```

### `src/modules/sua2/tablas.ts`

```ts
import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SUA } from "../sua/procedencia";

/** SUA 2 ap. 1.1 — Impacto con elementos fijos (p. 17). «Como mínimo» → ≥. */
export const ALTURAS_SUA2_1_1 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 2 ap. 1.1 ptos 1 a 4" },
  {
    /** pto 1. Uso restringido: interior de viviendas (incl. garaje de la unifamiliar, INTERPRETACIÓN). */
    alturaLibrePaso_usoRestringido_m: 2.1,
    /** pto 1. Resto, incluidas TODAS las zonas comunes y el garaje comunitario. */
    alturaLibrePaso_resto_m: 2.2,
    /** pto 1. Umbrales de puertas. */
    alturaLibreUmbralPuertas_m: 2.0,
    /** pto 2. Elementos fijos que sobresalen de fachadas sobre zonas de circulación. */
    alturaVuelosFachada_m: 2.2,
    /** pto 3. Prohibido: saliente que no arranca del suelo y vuela MÁS DE vueloMax (estricto) entre desde y hasta. */
    salientesParedes: { vueloMax_cm: 15, desde_m: 0.15, hasta_m: 2.2 },
    /** pto 4. Volados de altura MENOR QUE este valor (estricto): restringir acceso con elemento fijo detectable con bastón. */
    voladosAProteger_alturaMenorQue_m: 2.0,
  },
);

/** SUA 2 ap. 1.2 — Impacto con elementos practicables (p. 17). */
export const PUERTAS_SUA2_1_2 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 2 ap. 1.2 ptos 1 a 4" },
  {
    /** pto 1. Pasillo de anchura MENOR QUE este valor: el barrido no invade el pasillo.
     *  Excepto uso restringido y puertas de recintos de ocupación nula. 2,50 m justos: CRITERIO S1 (tratar como <). */
    pasilloBarrido_anchuraMenorQue_m: 2.5,
    /** pto 2. Vaivén entre zonas de circulación: parte transparente/translúcida que cubra AL MENOS este tramo. */
    vaivenTransparente: { desde_m: 0.7, hasta_m: 1.5 },
    /** ptos 3 y 4. Garaje, portones y peatonales automáticas: reglamentación específica + marcado CE.
     *  (Las UNE-EN 13241 / 12635 / 16005 están SOLO en el comentario.) */
    marcadoCE: true,
  },
);

export type FilaVidrioSua2 = "mayor12" | "entre055y12" | "menor055";

/** SUA 2 ap. 1.3 — Tabla 1.1 «Valor de los parámetros X(Y)Z en función de la diferencia de cota» (p. 18).
 *  Clasificación según UNE-EN 12600:2003. El significado de X, Y y Z NO se ha verificado: mostrar literal. */
export const VIDRIOS_SUA2_TABLA_1_1 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 2 ap. 1.3 pto 1", tabla: "Tabla 1.1" },
  {
    filas: [
      { id: "mayor12", diferenciaCotas: "Mayor que 12 m", X: "cualquiera", Y: ["B", "C"], Z: [1] },
      { id: "entre055y12", diferenciaCotas: "Comprendida entre 0,55 m y 12 m", X: "cualquiera", Y: ["B", "C"], Z: [1, 2] },
      { id: "menor055", diferenciaCotas: "Menor que 0,55 m", X: [1, 2, 3], Y: ["B", "C"], Z: "cualquiera" },
    ],
    /** Literal de cada casilla, para la ficha. */
    literal: {
      mayor12: { X: "cualquiera", Y: "B o C", Z: "1" },
      entre055y12: { X: "cualquiera", Y: "B o C", Z: "1 ó 2" },
      menor055: { X: "1, 2 ó 3", Y: "B o C", Z: "cualquiera" },
    },
    norma: "UNE-EN 12600:2003",
    /** pto 1. Excluidos los vidrios cuya mayor dimensión NO EXCEDA de este valor (≤). */
    excluidosMayorDimensionHasta_m: 0.3,
    /** pto 1. No se exige si el área de riesgo tiene barrera de protección conforme a SUA 1 ap. 3.2. */
    exentoConBarreraSua1_3_2: true,
    /** pto 2. Áreas con riesgo de impacto (figura 1.2). */
    areasRiesgo: {
      puertas: { desdeSuelo_m: 0, hasta_m: 1.5, margenLateralCadaLado_m: 0.3 },
      panosFijos: { desdeSuelo_m: 0, hasta_m: 0.9 },
    },
    /** pto 3. Partes vidriadas de puertas y cerramientos de duchas y bañeras: laminado o templado,
     *  sin rotura con impacto de nivel 3 (UNE EN 12600:2003). Sin excepción para viviendas. */
    puertasDuchasBaneras: { tipos: ["laminado", "templado"], nivelImpactoSinRotura: 3 },
  },
);

/** Fila de la tabla 1.1. Límites: «mayor que» y «menor que» estrictos (literal);
 *  0,55 y 12 m justos → «comprendida entre» (INTERPRETACIÓN). */
export function filaVidrioSua2(diferenciaCotas_m: number): FilaVidrioSua2 {
  if (diferenciaCotas_m > 12) return "mayor12";
  if (diferenciaCotas_m < 0.55) return "menor055";
  return "entre055y12";
}

/** SUA 2 ap. 1.4 — Elementos insuficientemente perceptibles (p. 18). Excluye el interior de viviendas
 *  (comentario: incluye sus zonas exteriores privativas). */
export const SENALIZACION_VIDRIOS_SUA2_1_4 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 2 ap. 1.4 ptos 1 y 2" },
  {
    franjaInferior: { desde_m: 0.85, hasta_m: 1.1 },
    franjaSuperior: { desde_m: 1.5, hasta_m: 1.7 },
    /** No hace falta con montantes separados COMO MÁXIMO este valor, o con un travesaño en la franja inferior. */
    exentoMontantesSeparacionMax_m: 0.6,
    excluyeInteriorViviendas: true,
  },
);

/** SUA 2 ap. 2 — Atrapamiento (p. 19). */
export const ATRAPAMIENTO_SUA2_2 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 2 ap. 2 ptos 1 y 2", tabla: "Figura 2.1" },
  {
    /** pto 1. Corredera manual: distancia a ≥ 20 cm hasta el objeto fijo más próximo. */
    correderaManual_holguraMin_cm: 20,
    /** pto 2. Apertura y cierre automáticos: dispositivos de protección adecuados (sin cifra ni norma en el articulado). */
    automaticosConDispositivosProteccion: true,
  },
);
```

### `src/modules/sua3/tablas.ts`

```ts
import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SUA } from "../sua/procedencia";

/** SUA 3 ap. 1 (p. 20). Único apartado de SUA 3: NO contiene dimensiones de aseos ni de pequeños recintos. */
export const APRISIONAMIENTO_SUA3 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 3 ap. 1 ptos 1 a 4" },
  {
    /** pto 1. Recinto con bloqueo interior y riesgo de atrapamiento accidental → desbloqueo desde el exterior. */
    desbloqueoExteriorSiBloqueoInterior: true,
    /** pto 1. Iluminación controlada desde el interior, EXCEPTO baños y aseos de viviendas
     *  (la excepción alcanza solo a la luz, no al desbloqueo). */
    iluminacionInterior_excepto: ["banos_vivienda", "aseos_vivienda"] as const,
    /** pto 2. Solo en zonas de uso público: aseos y cabinas de vestuario accesibles con llamada de asistencia. */
    llamadaAsistencia_soloUsoPublico: true,
    /** pto 3. Fuerza de apertura máxima de las puertas de salida [N]. */
    fuerzaApertura_puertasSalida_maxN: 140,
    /** pto 3 + Anejo A «Itinerario accesible». */
    fuerzaApertura_itinerarioAccesible_maxN: 25,
    fuerzaApertura_itinerarioAccesible_resistenteFuego_maxN: 65,
    /** pto 4. Método de ensayo (manuales con pestillo de media vuelta; excluye cierre automático
     *  y herrajes especiales de salida de emergencia). */
    metodoEnsayo: "UNE-EN 12046-2:2000",
  },
);

/** Anejo A, «Servicios higiénicos accesibles» → «Aseo accesible» (p. 37). NO es SUA 3.
 *  La dotación (cuántos y dónde) es SUA 9. */
export const ASEO_ACCESIBLE_ANEJO_A = tablaCTE(
  { ...PROC_SUA, articulo: "Anejo A, «Servicios higiénicos accesibles»" },
  {
    giroLibre_diametro_m: 1.5,
    puertas: "abatibles hacia el exterior o correderas, con las condiciones del itinerario accesible",
    /** Anejo A, «Mecanismos accesibles» (p. 36). */
    sinTemporizacionIluminacion: true,
  },
);
```

### `src/modules/sua4/tablas.ts`

```ts
import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SUA } from "../sua/procedencia";

/** SUA 4 ap. 1 pto 1 (p. 21). NO es una tabla: el texto vigente da tres cifras en un párrafo. */
export const ALUMBRADO_NORMAL_SUA4_1 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 4 ap. 1 pto 1" },
  {
    /** Iluminancia mínima [lux], medida a nivel del suelo. */
    exterior_lx: 20,
    interior_lx: 100,
    /** «aparcamientos interiores»; comentario (no reglamentario): en toda la superficie, plazas incluidas. */
    aparcamientoInterior_lx: 50,
    /** Factor de uniformidad media mínimo (comentario: Emin/Emed). */
    uniformidadMediaMin: 0.4,
    medidaA: "nivel del suelo",
  },
);

export type LetraDotacionEmergencia = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";

/** SUA 4 ap. 2.1 pto 1 (p. 21). Lista literal. Las comparaciones «mayor que» / «exceda de» son estrictas. */
export const DOTACION_EMERGENCIA_SUA4_2_1 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 4 ap. 2.1 pto 1" },
  {
    a: { literal: "Todo recinto cuya ocupación sea mayor que 100 personas;", ocupacionMayorQue: 100 },
    b: { literal: "Los recorridos desde todo origen de evacuación hasta el espacio exterior seguro y hasta las zonas de refugio, incluidas las propias zonas de refugio, según definiciones en el Anejo A de DB SI;" },
    c: { literal: "Los aparcamientos cerrados o cubiertos cuya superficie construida exceda de 100 m2, incluidos los pasillos y las escaleras que conduzcan hasta el exterior o hasta las zonas generales del edificio;", superficieConstruidaMayorQue_m2: 100 },
    d: { literal: "Los locales que alberguen equipos generales de las instalaciones de protección contra incendios y los de riesgo especial, indicados en DB-SI 1;" },
    e: { literal: "Los aseos generales de planta en edificios de uso público;" },
    f: { literal: "Los lugares en los que se ubican cuadros de distribución o de accionamiento de la instalación de alumbrado de las zonas antes citadas;" },
    g: { literal: "Las señales de seguridad;" },
    h: { literal: "Los itinerarios accesibles." },
  },
);

/** SUA 4 ap. 2.2 pto 1 (pp. 21–22). */
export const LUMINARIAS_EMERGENCIA_SUA4_2_2 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 4 ap. 2.2 pto 1" },
  {
    alturaMinimaSobreSuelo_m: 2,
    unaEnCadaPuertaDeSalida: true,
    puntosMinimos: [
      "en las puertas existentes en los recorridos de evacuación",
      "en las escaleras, de modo que cada tramo de escaleras reciba iluminación directa",
      "en cualquier otro cambio de nivel",
      "en los cambios de dirección y en las intersecciones de pasillos",
    ],
  },
);

/** SUA 4 ap. 2.3 (p. 22). */
export const INSTALACION_EMERGENCIA_SUA4_2_3 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 4 ap. 2.3 ptos 1 a 3" },
  {
    /** pto 1. Fallo = tensión POR DEBAJO de esta fracción de la nominal. */
    falloTensionPorDebajoDe: 0.7,
    /** pto 2. Vías de evacuación: fracción del nivel requerido a los t segundos. */
    respuesta: [{ t_s: 5, fraccionMin: 0.5 }, { t_s: 60, fraccionMin: 1.0 }],
    /** pto 3. Autonomía mínima. */
    autonomiaMin_h: 1,
    /** pto 3 a). Vías de anchura ≤ 2 m («no exceda de 2 m»); más anchas, en bandas de ≤ 2 m. */
    viaEvacuacion: { anchuraMax_m: 2, ejeCentralMin_lx: 1, bandaCentralMin_lx: 0.5, bandaCentralFraccionAnchuraMin: 0.5, bandaMaxima_m: 2 },
    /** pto 3 b). Equipos de seguridad, PCI manual y cuadros de distribución del alumbrado. */
    equiposYCuadrosMin_lx: 5,
    /** pto 3 c). Relación Emax/Emin a lo largo de la línea central: no mayor que. */
    relacionMaxMinEjeMax: 40,
    /** pto 3 d). Reflexión de paredes y techos nula; factor de mantenimiento (valor no fijado por el DB). */
    reflexionNula: true,
    /** pto 3 e). Índice de rendimiento cromático mínimo. */
    raMin: 40,
  },
);

/** SUA 4 ap. 2.4 (p. 22). Señales de evacuación, de medios manuales de PCI y de primeros auxilios. */
export const SENALES_SUA4_2_4 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 4 ap. 2.4 pto 1" },
  {
    luminanciaColorSeguridadMin_cd_m2: 2,
    relacionMaxMinMax: 10,
    /** c) 5:1 ≤ L_blanca / L_color ≤ 15:1. El «>10» que sigue a L_color en el texto NO se usa (B5.24). */
    relacionBlancoColor: { min: 5, max: 15 },
    respuesta: [{ t_s: 5, fraccionMin: 0.5 }, { t_s: 60, fraccionMin: 1.0 }],
  },
);
```

### `src/modules/sua5/tablas.ts` (opcional: solo para la frase de no aplicación)

```ts
import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SUA } from "../sua/procedencia";

/** SUA 5 ap. 1 pto 1 y nota (1) (p. 23). */
export const AMBITO_SUA5 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 5 ap. 1 pto 1" },
  { espectadoresDePieMasDe: 3000, densidad_personas_m2: 4, aplicaA: "graderíos" },
);
```

### Criterios (fuera de `tablaCTE`; la ficha los rotula «criterio de proyecto»)

```ts
export const CRITERIOS_SUA_2_A_5 = {
  pasillo250JustosComoMenor: true,                 // S1
  oficinasUsoRestringidoPorDefecto: false,         // S2
  emergenciaGarajeUnifamiliarPorDefecto: true,     // S11 (lectura literal de 2.1 d)
  emergenciaPasilloTrasterosHasta50m2: true,       // S12
  emergenciaAseosOficinasConPublico: true,         // S13
  sua41InteriorViviendaComoAviso: true,            // S10: no bloquea
} as const;
```

### Aviso al código existente

- **Riesgo especial (SI 1) → SUA 4-2.1 d)**: el checker de SUA 4 debe reutilizar la clasificación de locales de riesgo especial del módulo SI (`src/modules/si`) en vez de rehacerla. Eso cubre el garaje ≤ 100 m², el garaje de la unifamiliar, los trasteros de > 50 m² y los cuartos «en todo caso».
- **Origen de evacuación → SUA 4-2.1 b)**: reutilizar la misma regla que SI 3 (`derivar.ts`): sin origen dentro de las viviendas; zonas de ocupación nula de > 50 m² sí.
