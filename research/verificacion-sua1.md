# Verificación normativa — DB-SUA, Introducción, SUA 1 y definiciones del Anejo A, para el módulo SUA1 (feature-20)

**Fecha:** 2026-10-04 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** Introducción (pp. 3–7), Sección SUA 1 completa (pp. 8–16) y las definiciones del Anejo A que SUA 1 usa (pp. 35–41), con los comentarios del Ministerio de esas páginas ([DccSUA] pp. 3–30, 54, 70–72). Preguntas A1 a A7 del encargo, en orden. SUA 2 a SUA 9 son de otros agentes; cuando una respuesta depende de ellos, se cita y se marca.

**Regla aplicada:** ninguna cifra se da por buena sin leerla en la **imagen** de la página. El texto extraído de [SUA22] conserva muchos «≤», pero pierde el «±» de «±1 cm» (SUA 1-4.2.2 pto 3), los superíndices de las notas y la estructura de la tabla 4.1 (casillas combinadas). Veredictos:
- **VERIFICADO**: literal en el DB, leído en la imagen de [SUA22] (200 ppp) y coincidente con el texto de [SUA22] y de [DccSUA].
- **LEÍDO (1 fuente)**: literal en una sola fuente (en este fichero, casi siempre un comentario del Ministerio, leído en la imagen de [DccSUA] a 130 ppp salvo que se diga «solo texto»).
- **CORREGIDO**: lo que afirma o supone el encargo no coincide con el DB.
- **NO VERIFICABLE**: el DB no lo dice, o no se ha podido leer aquí.
- **INTERPRETACIÓN**: se sigue del DB, pero no lo escribe tal cual. Se puede mostrar, rotulada.
- **CRITERIO**: decisión de proyecto propuesta. No es exigencia del CTE y la ficha la rotula así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [SUA22] | CTE DB-SUA «Seguridad de utilización y accesibilidad», texto consolidado | «14 junio 2022» (incluye RD 450/2022) | `research/pdf/DBSUA.pdf` (codigotecnico.org) | **Imagen** a 200 ppp: pp. 8–16 (SUA 1 entera), 35, 36, 39, 40 (Anejo A). Imagen a 130 ppp: pp. 4, 5 (Introducción). Prosa del resto: texto extraído (`DBSUA.txt`) |
| [DccSUA] | DB-SUA con comentarios del Ministerio | Articulado 14-jun-2022; **comentarios 15-jul-2024** | `research/pdf/DccSUA.pdf` | Imagen a 130 ppp: pp. 15, 16, 17, 19, 20, 21, 23, 24, 25, 26, 27, 29, 30, 72. Texto (`DccSUA.txt`): pp. 3–11, 14, 18, 22, 28, 54, 70–71. Los comentarios van sangrados con una raya vertical a la izquierda; así se distinguen del articulado |
| [SI25] | DB-SI consolidado 4-mar-2025 | — | ya verificado en `research/verificacion-si1-si2.md` | Solo la definición de «Zona de ocupación nula» (Anejo SI A, p. 52), fila 2.21 de ese fichero |
| [REPO] | `src/lib/edificio/tipos.ts`, `src/lib/cte/tabla.ts`, `src/modules/si/tablas.ts` | Estado actual | repo | Qué datos da hoy «El edificio» |

Avisos de los propios documentos:
- [SUA22] p. 2: «Este texto consolidado no tiene valor jurídico.» Disposiciones: RD 314/2006; RD 1371/2007; corrección de errores (BOE 25-01-2008); Orden VIV/984/2009 y su corrección (BOE 23-09-2009); RD 173/2010; Sentencia TS 4-5-2010; RD 732/2019; RD 450/2022.
- [DccSUA] p. 2 añade una disposición que [SUA22] no lista: «Corrección de errores del Real Decreto 450/2022, de 14 de junio (BOE 2/02/2023)». El articulado de SUA 1 es idéntico en las dos fuentes (cotejado), así que esa corrección no toca SUA 1 en lo que aquí se usa. Ver Pendientes.
- [DccSUA] p. 2: «Los comentarios tienen un carácter orientativo e informativo no teniendo carácter reglamentario.» Aquí cada comentario va rotulado «comentario, no reglamentario».

Límites de la lectura:
- **No hay DB SE-AE** en `research/pdf`: la fuerza horizontal de las barreras (SUA 1-3.2.2 remite a SE-AE ap. 3.2.1) no se ha podido leer. Ver A3.12.
- El DB-SUA **no define** «zona de ocupación nula» ni «usuario»: remite al Anejo SI A del DB-SI (definición ya verificada en [SI25]).

---

## Bloque 0 — Introducción y definiciones (ámbito general)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| 0.1 | Ámbito del DB | VERIFICADO | El del art. 2 de la Parte I del CTE: obras de edificación | Intro II: «El ámbito de aplicación de este DB es el que se establece con carácter general para el conjunto del CTE en el artículo 2 de la Parte I.» | [SUA22] p. 4 |
| 0.2 | Exclusiones del ámbito | VERIFICADO | Riesgos específicos de las instalaciones, de las actividades laborales y de las **zonas y elementos de uso reservado a personal especializado en mantenimiento**, y elementos singulares del transporte: van por su reglamentación | Intro II: «La protección frente a los riesgos específicos de: – las instalaciones de los edificios; – las actividades laborales; – las zonas y elementos de uso reservado a personal especializado en mantenimiento, reparaciones, etc.; – los elementos para el público singulares y característicos de las infraestructuras del transporte …; así como las condiciones de accesibilidad en estos últimos elementos, se regulan en su reglamentación específica.» | [SUA22] p. 4 |
| 0.3 | Entorno del edificio | VERIFICADO | Solo los elementos del entorno que forman parte del proyecto: instalaciones fijas, equipamiento propio y **elementos de urbanización adscritos al edificio** | Intro II: «… los elementos del entorno del edificio a los que les son aplicables sus condiciones son aquellos que formen parte del proyecto de edificación. Conforme al artículo 2, punto 3 de la ley 38/1999 … se consideran comprendidas en la edificación sus instalaciones fijas y el equipamiento propio, así como los elementos de urbanización que permanezcan adscritos al edificio.» | [SUA22] p. 4 |
| 0.4 | Establecimientos | VERIFICADO | Mismas exigencias que los edificios | Intro II: «Las exigencias que se establezcan en este DB para los edificios serán igualmente aplicables a los establecimientos.» | [SUA22] p. 4 |
| 0.5 | Usos no definidos | VERIFICADO | Se asimilan al uso más parecido | Intro III, criterio 1: «Los edificios o zonas cuyo uso previsto no se encuentre entre los definidos en el Anejo SUA A de este DB deberán cumplir, salvo indicación en otro sentido, las condiciones particulares del uso al que mejor puedan asimilarse.» | [SUA22] p. 5 |
| 0.6 | Cambio de uso parcial, ampliación, reforma | VERIFICADO | Criterios 2, 3 y 4: la parte ampliada o cambiada cumple el DB (e itinerario accesible si SUA 9 lo exige); en reforma con el mismo uso, los elementos modificados; nunca empeorar | Intro III, criterios 2 a 4 | [SUA22] p. 5 |
| 0.7 | Normas UNE citadas | VERIFICADO | La versión que se indica, aunque haya otra posterior (salvo armonizadas) | Intro III, 2.º párrafo | [SUA22] p. 5 |
| 0.8 | Elementos de mantenimiento (cubiertas no transitables, cuartos técnicos) | LEÍDO (1 fuente, comentario, no reglamentario; solo texto) | Fuera del DB-SUA: su personal no es «usuario del edificio». Van por RD 1627/1997, RD 486/1997 y RD 1215/1997. «… las cubiertas han de diseñarse y contar con aquellos elementos, dispositivos y sistemas de protección que sean precisos para que las labores de inspección y mantenimiento de las mismas se puedan realizar en condiciones de seguridad.» | [DccSUA] pp. 4–5, «Aplicación del DB SUA a elementos de uso exclusivo para mantenimiento, inspección, reparaciones, etc.» | [DccSUA] |
| 0.9 | Escaleras mecánicas | LEÍDO (comentario, no reglamentario; solo texto) | No aplica a nuestro edificio. Dato suelto: «para desniveles superiores a 6 m es exigible una barrera de protección de 110 cm» | [DccSUA] p. 4 | [DccSUA] |
| 0.10 | Local sin uso | LEÍDO (comentario, no reglamentario; solo texto) | Es obra inacabada: su SUA se justifica con el proyecto de su actividad, con el CTE vigente cuando se pida esa licencia | [DccSUA] p. 9, «Accesibilidad a local sin uso previo en edificio existente»: «Un local sin ningún uso previo en un edificio existente es, a efectos del CTE, una obra inacabada. …» (el mismo criterio que el comentario del DB-SI ya verificado) | [DccSUA] |
| 0.11 | Tres clasificaciones de usos | LEÍDO (comentario, no reglamentario; solo texto) | (1) por actividad (Residencial Vivienda, Administrativo, Aparcamiento…); (2) por usuarios: **uso general o uso restringido**; (3) por disponibilidad al público: **uso público o uso privado**. «Es importante no confundir "zonas de uso privado" con "zonas de uso restringido" o con "uso Residencial Vivienda".» Y: «los elementos de evacuación que se utilicen únicamente en caso de emergencia tienen el carácter de uso público o privado, general o restringido que tenga la zona a la que sirven» | [DccSUA] p. 7, «Clasificación de usos en el DB SUA» | [DccSUA] |
| 0.12 | Despachos profesionales pequeños | LEÍDO (comentario, no reglamentario; solo texto) | Establecimientos de «pequeña entidad» (≈ 100 m² útiles y 10 personas, con cita previa) no están abiertos al público: todo uso privado, asimilable a Administrativo | [DccSUA] p. 8, «Establecimientos para actividades profesionales» | [DccSUA] |

### Definiciones del Anejo A que usa SUA 1 ([SUA22] pp. 35–40, imagen)

| Término | Literal | Notas |
|---|---|---|
| **Uso restringido** | «Utilización de las zonas o elementos de circulación limitados a un máximo de 10 personas que tienen el carácter de usuarios habituales, incluido el interior de las viviendas y de los alojamientos (en uno o más niveles) de uso Residencial Público, pero excluidas las zonas comunes de los edificios de viviendas.» (p. 40) | VERIFICADO |
| **Uso general** | «Utilización de las zonas o elementos que no sean de uso restringido.» (p. 39) | VERIFICADO. «Escalera de uso restringido / general» **no** se define aparte: es la escalera de una zona de uno u otro uso |
| **Uso privado** | «Zonas o elementos que no sean de uso público, tales como: – en uso Administrativo las áreas de trabajo e instalaciones que no presten servicios directos al público; – en uso Aparcamiento los aparcamientos privados; … – en uso Residencial Vivienda todas las zonas. …» (pp. 39–40) | VERIFICADO. **En Residencial Vivienda TODO es uso privado**, también las zonas comunes |
| **Uso público** | «Zonas o elementos de circulación susceptibles de ser utilizados por el público en general, personas no familiarizadas con el edificio, tales como: – en uso Administrativo los espacios de atención al público; – en uso Aparcamiento los aparcamientos públicos o que sirvan a establecimientos públicos; …» (p. 40) | VERIFICADO. Comentario ([DccSUA] p. 71, solo texto): «Las zonas destinadas a recibir personas externas a un espacio laboral, tales como las salas de reuniones y sus aseos asociados, se consideran zonas de uso público.» |
| **Uso Residencial Vivienda** | «Edificio o zona destinada a alojamiento permanente, cualquiera que sea el tipo de edificio: vivienda unifamiliar, edificio de pisos o de apartamentos, etc.» (p. 40) | VERIFICADO |
| **Uso Administrativo** | «Edificio, establecimiento o zona en la que se desarrollan actividades de gestión o de servicios …: centros de la administración pública, bancos, despachos profesionales, oficinas, etc.» … consultorios, análisis clínicos y ambulatorios van a Sanitario (p. 39) | VERIFICADO |
| **Uso Aparcamiento** | «… destinado a estacionamiento de vehículos y cuya superficie construida exceda de 100 m² … Se excluyen de este uso los garajes, cualquiera que sea su superficie, de una vivienda unifamiliar, así como del ámbito de aplicación del DB-SUA, los aparcamientos robotizados.» (p. 39) | VERIFICADO. «exceda de 100 m²» → estricto (> 100) |
| **Itinerario accesible** | Desniveles por rampa accesible (SUA 1 ap. 4) o ascensor accesible, «No se admiten escalones»; giro Ø 1,50 m en vestíbulo o portal, al fondo de pasillos de más de 10 m y frente a ascensores; pasillos ≥ 1,20 m («En zonas comunes de edificios de uso Residencial Vivienda se admite 1,10 m»), estrechamientos ≥ 1,00 m de longitud ≤ 0,50 m y a ≥ 0,65 m de huecos; puertas ≥ 0,80 m (≥ 0,78 m con el grosor de la hoja), mecanismos a 0,80–1,20 m, Ø 1,20 m libre a ambas caras, ≥ 0,30 m al rincón, fuerza ≤ 25 N (≤ 65 N si EI); pavimento sin piezas sueltas; **pendiente ≤ 4 % en la marcha (o rampa accesible) y ≤ 2 % transversal**. «No se considera parte de un itinerario accesible a las escaleras, rampas y pasillos mecánicos …» (pp. 35–36) | VERIFICADO (imagen). Lo detalla el agente de SUA 9 |
| **Zona de ocupación nula** | No está en el Anejo A del DB-SUA; SUA 1 remite al Anejo SI A: «Zona en la que la presencia de personas sea ocasional o bien a efectos de mantenimiento, tales como salas de máquinas y cuartos de instalaciones, locales para material de limpieza, determinados almacenes y archivos, trasteros de viviendas, etc.» | VERIFICADO en [SI25] p. 52 (`verificacion-si1-si2.md`, fila 2.21) |

Comentarios del Ministerio al Anejo A (no reglamentarios; [DccSUA] p. 72, **imagen**):
- «Interior de las viviendas»: «… todas las zonas de uso privativo de una vivienda, incluyendo, por ejemplo, las zonas exteriores privativas cuando éstas existan.»
- «Zonas comunes de los edificios de vivienda»: «… las escaleras comunes (tanto las protegidas como las no protegidas), los descansillos de acceso a viviendas, los portales, las zonas comunitarias, **los aparcamientos, los pasillos de comunicación a trasteros**, las zonas ajardinadas y deportivas, etc.»
- «Consideración de uso restringido»: «Independientemente del número de personas de una zona o elemento, el interior de las viviendas del uso Residencial Vivienda … se consideran siempre uso restringido, y las zonas comunes de los edificios de viviendas no se consideran nunca uso restringido.»
- [DccSUA] p. 54 (SUA 9, solo texto): «Los tendederos y los trasteros son "zonas de ocupación nula".»

### Mapa de zonas de NUESTRO edificio (lo que usa toda la sección)

| Zona («El edificio», `UsoZona`) | Uso por actividad | General / restringido | Público / privado | Ocupación nula | Veredicto |
|---|---|---|---|---|---|
| Interior de vivienda (`viviendas`, `vivienda_unifamiliar`), con terrazas, jardín y patio **privativos** | Residencial Vivienda | **Restringido, siempre** | Privado | No | VERIFICADO (def. + comentario p. 72) |
| Garaje de la unifamiliar (`garaje_privado`) | No es uso Aparcamiento («se excluyen … los garajes … de una vivienda unifamiliar»); es zona privativa de la vivienda | Restringido | Privado | No | **INTERPRETACIÓN** (def. «Uso Aparcamiento» + comentario «Interior de las viviendas») |
| Zonas comunes de la plurifamiliar (`zona_comun`, `vestibulo`): portal, rellanos, escalera común, cubierta comunitaria, jardín comunitario | Residencial Vivienda | **General, siempre** | **Privado** | No | VERIFICADO (def. + comentario p. 72) |
| Garaje de la plurifamiliar (`garaje`) | Aparcamiento si > 100 m² construidos; en todo caso, «zona común» del edificio de viviendas (comentario) | General | Privado («aparcamientos privados») | No | VERIFICADO (def.) + comentario |
| Pasillos de trasteros | Zona común (comentario) | General | Privado | No | LEÍDO (comentario) |
| Cada trastero (`trasteros`) | — | — | — | **Sí** | VERIFICADO ([SI25]) |
| Cuartos de instalaciones (`instalaciones`) | — | — | — | **Sí**; si son de uso reservado a mantenimiento, **fuera del DB-SUA** (Intro II) | VERIFICADO (Intro II, [SI25]) |
| Oficinas (`oficinas`) | Administrativo | General (restringido solo si su circulación se limita a ≤ 10 usuarios habituales) | Privado; **público** los espacios de atención al público y las salas de reuniones con visitas | No (sus aseos tampoco, ver A1.4) | VERIFICADO (def.) + **INTERPRETACIÓN** (oficina ≤ 10 personas) |
| Local sin uso (`local_sin_uso`) | Obra inacabada | — | — | — | LEÍDO (comentario, 0.10) |
| Exterior de la parcela (urbanización adscrita) | El de la zona a la que sirve | General (comunitario) o restringido (privativo) | Privado en vivienda | No | VERIFICADO (Intro II) + INTERPRETACIÓN |

---

## Bloque A1 — SUA 1 ap. 1: resbaladicidad de los suelos

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A1.1 | ¿A qué usos aplica? | VERIFICADO | **Solo** Residencial Público, Sanitario, Docente, Comercial, Administrativo y Pública Concurrencia, excluidas las zonas de ocupación nula | ap. 1 pto 1: «Con el fin de limitar el riesgo de resbalamiento, los suelos de los edificios o zonas de uso Residencial Público, Sanitario, Docente, Comercial, Administrativo y Pública Concurrencia, excluidas las zonas de ocupación nula definidas en el anejo SI A del DB SI, tendrán una clase adecuada conforme al punto 3 de este apartado.» | [SUA22] p. 8 |
| A1.2 | «No aplica a Residencial Vivienda salvo… (¿zonas comunes? ¿aparcamiento?)» | **CORREGIDO** (la sospecha va bien, pero no hay «salvo») | **No hay ninguna salvedad.** Residencial Vivienda no está en la lista: ni el interior de las viviendas ni las zonas comunes (portal, escalera, rellanos) tienen exigencia de clase. **Aparcamiento tampoco está en la lista**: el garaje de la plurifamiliar no tiene exigencia de SUA 1-1 | ap. 1 pto 1 (lista cerrada) | [SUA22] p. 8 |
| A1.3 | ¿Oficinas? | VERIFICADO | **Sí** (Administrativo), en todas sus zonas salvo las de ocupación nula | ap. 1 pto 1 | [SUA22] p. 8 |
| A1.4 | ¿Aseos de las oficinas? | LEÍDO (comentario, no reglamentario; texto) | Sí: no son ocupación nula a efectos de SUA 1-1, aunque SI 3 no les asigne ocupación | [DccSUA] p. 14, «Resbaladicidad en aseos»: «Cualquier aseo, independientemente de si tiene una ocupación asignada en la tabla 2.1 … de la Sección SI 3 del DB SI, no se considera de ocupación nula a efectos de este apartado, y debe cumplir las condiciones del mismo.» | [DccSUA] |
| A1.5 | ¿Zonas de ocupación nula? | VERIFICADO | **Excluidas** (trasteros, cuartos de instalaciones) | ap. 1 pto 1 | [SUA22] p. 8 |
| A1.6 | Local sin uso | INTERPRETACIÓN | Si se prevé Comercial o Administrativo, le aplicará con su actividad (0.10). Hoy, nada que justificar | 0.10 | [DccSUA] |
| A1.7 | Ensayo | VERIFICADO | Rd = valor PTV del péndulo, **UNE 41901:2017 EX**; muestra en las condiciones más desfavorables | ap. 1 pto 2 | [SUA22] p. 8 |
| A1.8 | UNE-EN 16165:2022 | LEÍDO (comentario, no reglamentario; imagen p. 14 no vista, texto) | Alternativa admitida: Anejo C + capítulo AN.2 (zapata de goma 57) → Rd-57 ≡ Rd | [DccSUA] p. 14, «Nueva norma europea UNE EN 16165:2022» | [DccSUA] |
| A1.9 | La clase se mantiene | VERIFICADO | «Dicha clase se mantendrá durante la vida útil del pavimento.» | ap. 1 pto 3 | [SUA22] p. 8 |
| A1.10 | Duchas y bañeras | LEÍDO (comentario, no reglamentario; imagen) | Placas de ducha y bañeras no son «suelo» (su norma de producto); el suelo del baño o aseo, clase 2 (pend. < 6 %) o 3; ducha sin placa, clase 3 | [DccSUA] p. 16, «Placas de ducha y bañeras» | [DccSUA] |
| A1.11 | Entrada húmeda | LEÍDO (comentario, no reglamentario; imagen) | Zona de transición: ≥ 6 m de recorrido interior con suelo de zona húmeda, o felpudo de 2 m en el sentido de la marcha. Porches y soportales no cuentan como transición | [DccSUA] p. 15, «Zonas húmedas en entradas» | [DccSUA] |
| A1.12 | Bandas antideslizantes | LEÍDO (comentario, no reglamentario; imagen) | En escaleras, banda de 3 a 5 cm a ≤ 5 cm del borde de cada huella; en continuo, bandas a ≤ 10 cm; hasta clase 2, las adheridas tipo lija valen; mesetas con la clase de suelo horizontal | [DccSUA] p. 15, «Bandas antideslizantes» | [DccSUA] |
| A1.13 | Nota (1) | LEÍDO (comentario, no reglamentario; imagen) | La nota no quita la exigencia a la entrada; solo le quita la condición de «zona interior húmeda» cuando da directamente a uso restringido | [DccSUA] p. 15, «Acceso directo a zonas de uso restringido» | [DccSUA] |

### Tabla 1.1 — Clasificación de los suelos según su resbaladicidad ([SUA22] p. 8, imagen)

| Resistencia al deslizamiento R_d | Clase |
|---|---|
| R_d ≤ 15 | 0 |
| 15 < R_d ≤ 35 | 1 |
| 35 < R_d ≤ 45 | 2 |
| R_d > 45 | 3 |

### Tabla 1.2 — Clase exigible a los suelos en función de su localización ([SUA22] p. 8, imagen)

| Localización y características del suelo | Clase |
|---|---|
| **Zonas interiores secas** — superficies con pendiente menor que el 6 % | 1 |
| **Zonas interiores secas** — superficies con pendiente igual o mayor que el 6 % y escaleras | 2 |
| **Zonas interiores húmedas**, tales como las entradas a los edificios desde el espacio exterior⁽¹⁾, terrazas cubiertas, vestuarios, baños, aseos, cocinas, etc. — superficies con pendiente menor que el 6 % | 2 |
| **Zonas interiores húmedas** (ídem) — superficies con pendiente igual o mayor que el 6 % y escaleras | 3 |
| **Zonas exteriores. Piscinas⁽²⁾. Duchas.** | 3 |

- ⁽¹⁾ «Excepto cuando se trate de accesos directos a zonas de uso restringido.»
- ⁽²⁾ «En zonas previstas para usuarios descalzos y en el fondo de los vasos, en las zonas en las que la profundidad no exceda de 1,50 m.»
- Signos: «menor que el 6 %» (< 6) / «igual o mayor que el 6 %» (≥ 6). Clase exigida «como mínimo» (pto 3).

**Qué hace falta y lo habitual.** De El edificio: si hay oficinas (o local con uso Administrativo/Comercial). Decisión del proyectista: la clase del pavimento elegido en cada localización. Lo habitual en oficinas (CRITERIO): clase 1 en zonas secas, clase 2 en aseos, office y vestíbulo de entrada, clase 2 en escaleras secas, clase 3 en escaleras exteriores y rampas exteriores. En vivienda: nada exigible; si el proyectista quiere declarar clases en zonas comunes, rotularlo **CRITERIO (buena práctica, no exigencia CTE)**.

---

## Bloque A2 — SUA 1 ap. 2: discontinuidades en el pavimento

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A2.1 | Ámbito del pto 1 | VERIFICADO | Todo suelo **excepto** zonas de **uso restringido** o **exteriores** | ap. 2 pto 1: «Excepto en zonas de uso restringido o exteriores y con el fin de limitar el riesgo de caídas como consecuencia de traspiés o de tropiezos, el suelo debe cumplir las condiciones siguientes:» | [SUA22] p. 8 |
| A2.2 | En nuestro edificio | INTERPRETACIÓN | **Aplica**: portal, rellanos, escalera y pasillos comunes, pasillos de trasteros, garaje de la plurifamiliar, oficinas. **No aplica**: interior de las viviendas (incl. unifamiliar y su garaje), terrazas, patios y accesos al aire libre (comentario: «se consideran zonas exteriores las terrazas, patios, entradas a los edificios, etc. que se encuentren al aire libre»), cuartos de mantenimiento (fuera del DB, 0.2) | ap. 2 pto 1; [DccSUA] p. 16, «Zonas exteriores» | [SUA22] p. 8; [DccSUA] |
| A2.3 | a) Juntas | VERIFICADO | Resalto **≤ 4 mm** («de más de 4 mm» prohibido) | «No tendrá juntas que presenten un resalto de más de 4 mm.» | [SUA22] p. 9 |
| A2.4 | a) Salientes puntuales | VERIFICADO | Sobresalen **≤ 12 mm**; si el saliente **excede de 6 mm**, sus caras enfrentadas a la circulación forman con el pavimento un ángulo **≤ 45º** | «Los elementos salientes del nivel del pavimento, puntuales y de pequeña dimensión (por ejemplo, los cerraderos de puertas) no deben sobresalir del pavimento más de 12 mm y el saliente que exceda de 6 mm en sus caras enfrentadas al sentido de circulación de las personas no debe formar un ángulo con el pavimento que exceda de 45º.» | [SUA22] p. 9 |
| A2.5 | «15 mm» del encargo | **CORREGIDO** | El DB no dice 15 mm. Dice 12 mm (salientes) y **1,5 cm** de esfera (perforaciones). Los **15 mm** salen solo de un comentario: los cerraderos con marcado CE según UNE-EN 1125:2009 pueden sobresalir 15 mm | [DccSUA] p. 16, «Cerraderos de puertas» (comentario, no reglamentario) | [DccSUA] |
| A2.6 | b) Pequeños desniveles | VERIFICADO | Desnivel **≤ 5 cm** → pendiente **≤ 25 %** | «Los desniveles que no excedan de 5 cm se resolverán con una pendiente que no exceda del 25%;» | [SUA22] p. 9 |
| A2.7 | b) en itinerario accesible | LEÍDO (comentario, no reglamentario; imagen) | En itinerario accesible el 25 % no vale (rampa accesible: 10 % en < 3 m), **salvo** en los accesos al edificio y a terrazas de viviendas accesibles, donde se admite ≤ 5 cm al 25 % para frenar el agua. En desnivel variable, los 5 cm en el punto peor | [DccSUA] p. 16, «Desniveles menores de 5 cm en accesos accesibles» | [DccSUA] |
| A2.8 | Portón del garaje | LEÍDO (comentario, no reglamentario; imagen) | Se admite el bastidor inferior de la puerta peatonal incorporada al portón, salvo si el itinerario debe ser accesible | [DccSUA] p. 16, «Puertas peatonales incorporadas en portones de garajes para vehículos» | [DccSUA] |
| A2.9 | c) Perforaciones | VERIFICADO | En zonas de circulación, ningún hueco por el que pase una esfera de **1,5 cm** | «En zonas para circulación de personas, el suelo no presentará perforaciones o huecos por los que pueda introducirse una esfera de 1,5 cm de diámetro.» | [SUA22] p. 9 |
| A2.10 | Barreras para delimitar circulaciones | VERIFICADO | Altura **≥ 80 cm** | ap. 2 pto 2: «Cuando se dispongan barreras para delimitar zonas de circulación, tendrán una altura de 80 cm como mínimo.» | [SUA22] p. 9 |
| A2.11 | «50 cm» del encargo | **CORREGIDO** | En el ap. 2 vigente **no hay ninguna cifra de 50 cm**. (Los 50 cm de SUA 1 están en 3.2.3, escalabilidad, y en 4.1/4.2, medida de huellas en curva) | ap. 2 completo | [SUA22] pp. 8–9 |
| A2.12 | Escalón aislado (pto 3) | VERIFICADO | En zonas de circulación **no** se admite un escalón aislado **ni dos consecutivos**, excepto: a) uso restringido; b) **zonas comunes de los edificios de uso Residencial Vivienda**; c) accesos y salidas de los edificios; d) acceso a estrado o escenario. En todos estos casos, **nunca dentro de un itinerario accesible** | ap. 2 pto 3: «En zonas de circulación no se podrá disponer un escalón aislado, ni dos consecutivos, excepto en los casos siguientes. a) en zonas de uso restringido; b) en las zonas comunes de los edificios de uso Residencial Vivienda; c) en los accesos y en las salidas de los edificios; d) en el acceso a un estrado o escenario. En estos casos, si la zona de circulación incluye un itinerario accesible, el o los escalones no podrán disponerse en el mismo.» | [SUA22] p. 9 |
| A2.13 | «¿Cuántos peldaños mínimo?» | VERIFICADO (remisión) | El ap. 2 no da un mínimo; lo da 4.2.2 pto 1: **3 peldaños por tramo** «excepto en los casos admitidos en el punto 3 del apartado 2». En la práctica: en zonas comunes de vivienda (incluido su garaje), en accesos y en el interior de la vivienda se admiten 1 o 2; en oficinas, mínimo 3 | SUA 1-4.2.2 pto 1; [DccSUA] p. 25 (comentario): «… dichos peldaños deberán ser al menos tres, excepto en escaleras de "uso restringido" y de zonas comunes de edificios de vivienda, incluidas sus zonas de uso Aparcamiento, en las que también puede haber uno o dos.» | [SUA22] p. 12; [DccSUA] p. 25 (imagen) |
| A2.14 | Dónde poner el escalón del acceso | LEÍDO (comentario, no reglamentario; imagen) | En la línea de fachada | [DccSUA] p. 17: «… dichos peldaños deben estar situados en la línea de fachada, donde el riesgo de tropiezo es menor …» | [DccSUA] |

**Qué hace falta.** Nada de El edificio salvo saber qué zonas hay. Son exigencias de ejecución: la ficha las declara («el pavimento cumple…») y pide al proyectista una sola decisión: **¿hay escalones aislados (1 o 2) en zonas de circulación? ¿dónde?** (acceso / zona común de vivienda / oficinas → en oficinas, NO CUMPLE salvo acceso o salida del edificio). Lo habitual (CRITERIO): ninguno en oficinas; si el portal está elevado, rampa accesible o 1–2 peldaños en la línea de fachada fuera del itinerario accesible.

---

## Bloque A3 — SUA 1 ap. 3: desniveles

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A3.1 | Cuándo hay barrera | VERIFICADO | En desniveles, huecos y aberturas, horizontales o verticales (balcones, ventanas…), con diferencia de cota **> 55 cm** («mayor que», estricto) | ap. 3.1 pto 1: «… existirán barreras de protección en los desniveles, huecos y aberturas (tanto horizontales como verticales) balcones, ventanas, etc. con una diferencia de cota mayor que 55 cm, excepto cuando la disposición constructiva haga muy improbable la caída o cuando la barrera sea incompatible con el uso previsto.» | [SUA22] p. 9 |
| A3.2 | Excepciones | VERIFICADO + comentarios | Dos: disposición constructiva que hace muy improbable la caída; barrera incompatible con el uso. Comentarios: la 1.ª son zonas ajardinadas o láminas de agua de suficiente dimensión, y **no vale** en los usos de 3.2.3 (vivienda) «en los que se sea previsible la presencia de niños sin vigilancia continua»; la 2.ª, escenarios, estrados, muelles de carga, reservados a personal que conoce el riesgo | ap. 3.1 pto 1; [DccSUA] p. 17 (imagen), «Disposiciones constructivas que hacen muy improbable la caída» y «Barreras incompatibles con el uso previsto» | [SUA22] p. 9; [DccSUA] |
| A3.3 | ¿Interior de las viviendas? | VERIFICADO | **Sí.** 3.1 no excluye el uso restringido, y 3.2.3 dice «En **cualquier zona** de los edificios de uso Residencial Vivienda» (dobles alturas, escalera interior, ventanas bajas, terrazas privativas) | ap. 3.1 pto 1; 3.2.3 pto 1 | [SUA22] pp. 9–10 |
| A3.4 | ¿Cubierta transitable? | INTERPRETACIÓN | **Sí**: es zona de uso (privativa o comunitaria) con desnivel > 55 cm al perímetro, a patios y a lucernarios. Altura por 3.2.1 y diseño por 3.2.3 | ap. 3.1 pto 1; 3.2.3 | [SUA22] pp. 9–10 |
| A3.5 | ¿Cubierta no transitable? | INTERPRETACIÓN + comentario | **Fuera del DB-SUA** si solo se accede para mantenimiento (Intro II, «zonas y elementos de uso reservado a personal especializado en mantenimiento»). El proyecto debe prever su mantenimiento seguro (línea de vida, anclajes, acceso) por RD 1627/1997 y RD 486/1997 (comentario 0.8). La ficha no da cifra SUA; deja una nota | Intro II; [DccSUA] pp. 4–5 | [SUA22] p. 4 |
| A3.6 | Señalización de desniveles ≤ 55 cm | VERIFICADO | Es **3.1 pto 2** (no «3.1.2»), solo en **uso público**: diferenciación visual y táctil a ≥ 25 cm del borde. **No aplica en Residencial Vivienda** (todo es uso privado); sí en los espacios de atención al público de las oficinas | ap. 3.1 pto 2: «En las zonas de uso público se facilitará la percepción de las diferencias de nivel que no excedan de 55 cm y que sean susceptibles de causar caídas, mediante diferenciación visual y táctil. La diferenciación comenzará a 25 cm del borde, como mínimo.» | [SUA22] p. 9 |
| A3.7 | Altura de la barrera | VERIFICADO | **≥ 0,90 m** si la diferencia de cota **≤ 6 m** («no exceda de 6 m»); **≥ 1,10 m** en el resto (> 6 m); **≥ 0,90 m** en huecos de escalera de anchura **< 40 cm**, sea cual sea la altura | ap. 3.2.1 pto 1: «Las barreras de protección tendrán, como mínimo, una altura de 0,90 m cuando la diferencia de cota que protegen no exceda de 6 m y de 1,10 m en el resto de los casos, excepto en el caso de huecos de escaleras de anchura menor que 40 cm, en los que la barrera tendrá una altura de 0,90 m, como mínimo (véase figura 3.1).» Figura 3.1: «0,55 m < H ≤ 6,00 m» → «≥ 0,90 m»; «H > 6,00 m» → «≥ 1,10 m» | [SUA22] pp. 9–10 (imagen, figura incluida) |
| A3.8 | Cómo se mide | VERIFICADO | En vertical, desde el suelo o, en escaleras, desde la **línea de inclinación** por los vértices de los peldaños, hasta el borde superior | ap. 3.2.1, 2.º párrafo: «La altura se medirá verticalmente desde el nivel de suelo o, en el caso de escaleras, desde la línea de inclinación definida por los vértices de los peldaños, hasta el límite superior de la barrera.» | [SUA22] p. 9 |
| A3.9 | Ventanas | INTERPRETACIÓN (de la figura) | La figura 3.1 («Barreras de protección en ventanas») mide la altura de la barrera del suelo interior al borde superior del **antepecho**: un alféizar de ≥ 0,90 m (≥ 1,10 m si H > 6 m) es la barrera; si es más bajo, hace falta barandilla | Figura 3.1 | [SUA22] p. 10 |
| A3.10 | Barandilla del ojo de escalera | INTERPRETACIÓN | Si el ojo mide **< 40 cm**: 0,90 m siempre. Si mide **≥ 40 cm**, la diferencia de cota que protege es la caída por el ojo hasta su fondo: con más de 6 m (escalera común de PB + 2 o más con ojo abierto), **1,10 m** | ap. 3.2.1 pto 1 (literal aplicado) | [SUA22] p. 9 |
| A3.11 | Escaleras mecánicas | LEÍDO (comentario) | No aplica | 0.9 | — |
| A3.12 | Resistencia | VERIFICADO (la remisión) + **NO VERIFICABLE** (la cifra) | Fuerza horizontal del **DB SE-AE ap. 3.2.1**, «en función de la zona en que se encuentren». La cifra no se ha leído: SE-AE no está en `research/pdf` | ap. 3.2.2 pto 1: «Las barreras de protección tendrán una resistencia y una rigidez suficiente para resistir la fuerza horizontal establecida en el apartado 3.2.1 del Documento Básico SE-AE, en función de la zona en que se encuentren.» | [SUA22] p. 10 |
| A3.13 | Ámbito de 3.2.3 (no escalables) | VERIFICADO | **Cualquier zona** de edificios de Residencial Vivienda (interior, zonas comunes, cubierta, escaleras y rampas) y escuelas infantiles; zonas de uso público de Comercial y Pública Concurrencia | ap. 3.2.3 pto 1: «En cualquier zona de los edificios de uso Residencial Vivienda o de escuelas infantiles, así como en las zonas de uso público de los establecimientos de uso Comercial o de uso Pública Concurrencia, las barreras de protección, incluidas las de las escaleras y rampas, estarán diseñadas de forma que:» | [SUA22] p. 10 |
| A3.14 | ¿Garaje de la plurifamiliar? | INTERPRETACIÓN | Sí, por prudencia: es zona del edificio de Residencial Vivienda (y zona común según el comentario de p. 72). El DB no lo excluye | ap. 3.2.3 pto 1; [DccSUA] p. 72 | — |
| A3.15 | a) No escalables, franja 30–50 cm | VERIFICADO | Entre **30 y 50 cm** sobre el suelo o sobre la línea de inclinación: **sin puntos de apoyo**, incluidos salientes sensiblemente horizontales de **más de 5 cm** | «En la altura comprendida entre 30 cm y 50 cm sobre el nivel del suelo o sobre la línea de inclinación de una escalera no existirán puntos de apoyo, incluidos salientes sensiblemente horizontales con más de 5 cm de saliente.» | [SUA22] p. 10 |
| A3.16 | a) Franja 50–80 cm | VERIFICADO | Entre **50 y 80 cm** sobre el suelo: sin salientes con superficie sensiblemente horizontal de **más de 15 cm** de fondo | «En la altura comprendida entre 50 cm y 80 cm sobre el nivel del suelo no existirán salientes que tengan una superficie sensiblemente horizontal con más de 15 cm de fondo.» | [SUA22] p. 10 |
| A3.17 | b) Aberturas | VERIFICADO | Ninguna abertura atravesable por una esfera de **10 cm**, salvo los triángulos huella–contrahuella–límite inferior de la barandilla, si ese límite está a **≤ 5 cm** de la línea de inclinación | «No tengan aberturas que puedan ser atravesadas por una esfera de 10 cm de diámetro, exceptuándose las aberturas triangulares que forman la huella y la contrahuella de los peldaños con el límite inferior de la barandilla, siempre que la distancia entre este límite y la línea de inclinación de la escalera no exceda de 5 cm (véase figura 3.2).» Figura 3.2: «10 cm», «5 cm máx» | [SUA22] p. 10 |
| A3.18 | Otros usos (oficinas) | VERIFICADO | Solo en **zonas de uso público**: solo la condición b), con esfera de **15 cm**. En zonas de uso privado de oficinas: solo altura y resistencia | ap. 3.2.3, último párrafo: «Las barreras de protección situadas en zonas de uso público en edificios o establecimientos de usos distintos a los citados anteriormente únicamente precisarán cumplir la condición b) anterior, considerando para ella una esfera de 15 cm de diámetro.» | [SUA22] p. 10 |
| A3.19 | Comentarios a 3.2.3 | LEÍDO (comentario, no reglamentario; imagen) | (1) Riesgo: niños < 6 años. (2) Radiadores, fancoils y elementos fijos a < 50 cm de la barrera cumplen lo mismo (sin apoyos entre 30 y 50 cm ni superficies > 15 cm entre 50 y 80 cm). (3) Una barrera más alta que la mínima puede tener apoyos si da la misma protección. (4) Peldaño sin tabica: su hueco > Ø 10 cm se acepta. (5) Hueco entre canto de forjado y barrera: esfera de 10 cm; «Un criterio de buena práctica aconseja reducir la anchura de dicho hueco a no más de 3 cm.» | [DccSUA] p. 19 | [DccSUA] |
| A3.20 | Barreras delante de asientos fijos (3.2.4) | VERIFICADO | **No aplica** (no hay filas de asientos fijos). Para constancia: 70 cm con elemento horizontal de 50 cm a ≥ 50 cm de altura; 3 kN/m horizontal + 1,0 kN/m vertical | ap. 3.2.4 pto 1 | [SUA22] p. 10 |
| A3.21 | Graderío en descenso | LEÍDO (comentario) | No aplica | [DccSUA] p. 17 | — |

**Qué hace falta.**
- De El edificio: la **cota del suelo de cada planta** sobre la rasante (`GrupoPlantas.altura_m` acumuladas desde PB, cota ±0,00 en la PB, ver K5 del SI), los **sótanos** (patios ingleses, rampas), el **tipo de cubierta** (`plana_transitable` → barrera perimetral; `plana_no_transitable` / `inclinada` → nota de mantenimiento, fuera de SUA).
- Del proyectista: la **altura de barrera** en terrazas, balcones y cubierta; el **antepecho** de las ventanas; el **ancho del ojo** de la escalera común (< 40 cm o no); la tipología (barrotes verticales, vidrio, peto de fábrica).
- La app propone el mínimo por planta: 0,90 m si la cota del suelo sobre el nivel inferior es ≤ 6 m; 1,10 m si es > 6 m (INTERPRETACIÓN: usar la cota sobre la rasante exterior como diferencia de cota en fachada; en patios, la cota sobre el fondo del patio).

---

## Bloque A4 — SUA 1 ap. 4: escaleras y rampas

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A4.0 | Escaleras de evacuación | LEÍDO (comentario, no reglamentario; imagen) | Tienen el carácter (público/privado, general/restringido) de la zona a la que sirven | [DccSUA] p. 20, «Escaleras y rampas de evacuación» | [DccSUA] |

### 4.1 Escaleras de uso restringido (interior de la vivienda, unifamiliar o dúplex; garaje de la unifamiliar)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A4.1 | Anchura | VERIFICADO | Cada tramo **≥ 0,80 m** | 4.1 pto 1: «La anchura de cada tramo será de 0,80 m, como mínimo.» | [SUA22] p. 11 |
| A4.2 | Anchura en mesetas | LEÍDO (comentario, no reglamentario; imagen) | Los 0,80 m se mantienen a lo largo de las mesetas | [DccSUA] p. 20 | [DccSUA] |
| A4.3 | Peldaños | VERIFICADO | Contrahuella **≤ 20 cm**; huella **≥ 22 cm**, medida en la dirección de la marcha | 4.1 pto 2: «La contrahuella será de 20 cm, como máximo, y la huella de 22 cm, como mínimo. La dimensión de toda huella se medirá, en cada peldaño, según la dirección de la marcha.» Figura 4.1: «H ≥ 22 cm», «C ≤ 20 cm» | [SUA22] p. 11 |
| A4.4 | Trazado curvo | VERIFICADO | Huella medida en el **eje** si la anchura **< 1 m**, y a **50 cm del lado estrecho** si es **mayor**; además **≥ 5 cm** en el lado estrecho y **≤ 44 cm** en el ancho | 4.1 pto 2, 2.º párrafo | [SUA22] p. 11 |
| A4.5 | Anchura exactamente 1,00 m | INTERPRETACIÓN | El DB dice «menor que 1 m» / «cuando sea mayor»: hueco en 1,00 m. Medir en el eje (el comentario a mesetas dice «en escaleras de hasta 1 m de anchura» → eje) | [DccSUA] p. 24 | — |
| A4.6 | Mesetas partidas y sin tabica | VERIFICADO | Se admiten **mesetas partidas con peldaños a 45º** y **escalones sin tabica**, con superposición de huellas **≥ 2,5 cm**; la huella no incluye la proyección del peldaño superior | 4.1 pto 3 | [SUA22] p. 11 |
| A4.7 | Barandilla | VERIFICADO | En sus **lados abiertos** | 4.1 pto 4: «Dispondrán de barandilla en sus lados abiertos.» | [SUA22] p. 11 |
| A4.8 | Lo que NO se exige en uso restringido | VERIFICADO (por ausencia) | Ni 2C+H, ni altura máxima de tramo, ni mínimo de peldaños, ni pasamanos (4.2.4 es de uso general), ni condiciones de mesetas (más allá de la anchura del comentario) | 4.1 completo | [SUA22] p. 11 |
| A4.9 | Altura de esa barandilla | INTERPRETACIÓN | 3.2.1: ≥ 0,90 m desde la línea de inclinación (1,10 m si el desnivel protegido > 6 m y el hueco ≥ 40 cm); y, por ser vivienda, no escalable (3.2.3) | 3.2.1, 3.2.3 | [SUA22] pp. 9–10 |
| A4.10 | Escaleras «tipo barco» o «samba» | LEÍDO (comentario, no reglamentario; imagen) | **No válidas**, ni en uso restringido ni en general | [DccSUA] p. 21 | [DccSUA] |
| A4.11 | Escaleras mixtas en uso restringido | LEÍDO (comentario, no reglamentario; imagen) | Admitidas | [DccSUA] p. 20, «Validez de escalera mixta en uso restringido» | [DccSUA] |

### 4.2 Escaleras de uso general (escalera común de la plurifamiliar, escalera del garaje, escaleras de las oficinas)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A4.12 | Huella | VERIFICADO | **≥ 28 cm** en tramos rectos | 4.2.1 pto 1: «En tramos rectos, la huella medirá 28 cm como mínimo.» | [SUA22] p. 11 |
| A4.13 | Contrahuella | VERIFICADO | **13 ≤ C ≤ 18,5 cm**, excepto en **zonas de uso público** y **siempre que no se disponga ascensor como alternativa**, donde **C ≤ 17,5 cm** | 4.2.1 pto 1: «En tramos rectos o curvos la contrahuella medirá 13 cm como mínimo y 18,5 cm como máximo, excepto en zonas de uso público, así como siempre que no se disponga ascensor como alternativa a la escalera, en cuyo caso la contrahuella medirá 17,5 cm, como máximo.» | [SUA22] p. 11 |
| A4.14 | Cómo leerlo (comentario) | LEÍDO (comentario, no reglamentario; imagen) | «… la contrahuella medirá 13 cm como mínimo y 17,5 cm como máximo, excepto en zonas de uso privado en las que se disponga ascensor como alternativa a la escalera en cuyo caso la contrahuella medirá 18,5 cm, como máximo» | [DccSUA] p. 21, «Dimensiones de contrahuella en escalera» | [DccSUA] |
| A4.15 | Qué es «ascensor como alternativa» | LEÍDO (comentario, no reglamentario; imagen) | Basta con que su uso como alternativa sea posible en condiciones normales; no hace falta distancia máxima ni que sea accesible (salvo que SUA 9-1.1.2 lo exija) | [DccSUA] p. 21 | [DccSUA] |
| A4.16 | Contrahuella < 13 cm | LEÍDO (comentario, no reglamentario; imagen) | Solo para pequeños desniveles que no se resuelven de otro modo (1 a 3 peldaños, p. ej. con la vía pública) | [DccSUA] p. 21, «Contrahuellas menores a 13 cm» | [DccSUA] |
| A4.17 | Relación 2C + H | VERIFICADO | **54 cm ≤ 2C + H ≤ 70 cm** (no estrictos), a lo largo de una misma escalera | 4.2.1 pto 1: «La huella H y la contrahuella C cumplirán a lo largo de una misma escalera la relación siguiente: 54 cm ≤ 2C + H ≤ 70 cm». Figura 4.2 | [SUA22] pp. 11–12 |
| A4.18 | Bocel y tabicas | VERIFICADO | **No se admite bocel.** Tabica **obligatoria** en escaleras de **evacuación ascendente** y cuando **no hay itinerario accesible alternativo**; vertical o inclinada **≤ 15º** con la vertical | 4.2.1 pto 2: «No se admite bocel. En las escaleras previstas para evacuación ascendente, así como cuando no exista un itinerario accesible alternativo, deben disponerse tabicas y éstas serán verticales o inclinadas formando un ángulo que no exceda de 15º con la vertical (véase figura 4.2).» | [SUA22] p. 12 |
| A4.19 | Escalera del garaje en sótano | INTERPRETACIÓN | Es de **evacuación ascendente** → **tabica obligatoria** (y sin bocel) | 4.2.1 pto 2 | [SUA22] p. 12 |
| A4.20 | Tramos curvos | VERIFICADO | Huella **≥ 28 cm a 50 cm del borde interior** y **≤ 44 cm en el borde exterior**; 2C+H a 50 cm de ambos extremos | 4.2.1 pto 3 y figura 4.3 | [SUA22] p. 12 |
| A4.21 | Medida de la huella | VERIFICADO | Sin la proyección vertical del peldaño superior | 4.2.1 pto 4 | [SUA22] p. 12 |
| A4.22 | Peldaños por tramo | VERIFICADO | **≥ 3**, salvo los casos de SUA 1-2 pto 3 (A2.12–A2.13) | 4.2.2 pto 1: «Excepto en los casos admitidos en el punto 3 del apartado 2 de esta Sección, cada tramo tendrá 3 peldaños como mínimo.» | [SUA22] p. 12 |
| A4.23 | Altura máxima de tramo | VERIFICADO | **2,25 m** en zonas de uso público y siempre que no haya ascensor alternativo; **3,20 m** en los demás casos | 4.2.2 pto 1: «La máxima altura que puede salvar un tramo es 2,25 m en zonas de uso público, así como siempre que no se disponga ascensor como alternativa a la escalera, y 3,20 m en los demás casos.» | [SUA22] p. 12 |
| A4.24 | Ídem, comentario | LEÍDO (comentario, no reglamentario; imagen) | «… la máxima altura que puede salvar un tramo es 2,25 m, excepto en zonas de uso privado en las que se disponga ascensor como alternativa a la escalera en cuyo caso la máxima altura que puede salvar es 3,20 m.» | [DccSUA] p. 23, «Altura máxima de un tramo» | [DccSUA] |
| A4.25 | Tipos de tramo | VERIFICADO | Rectos, curvos o mixtos (solo rectos en hospitalización, escuelas infantiles, primaria y secundaria) | 4.2.2 pto 2 | [SUA22] p. 12 |
| A4.26 | Regularidad | VERIFICADO | Entre dos plantas consecutivas, **misma contrahuella** en todos los peldaños y **misma huella** en los rectos; entre tramos de plantas diferentes, la contrahuella no varía más de **±1 cm**; en mixtos, huella en el eje de lo curvo ≥ huella de lo recto | 4.2.2 pto 3 («±1 cm» se lee en la imagen; el texto extraído pierde el «±») | [SUA22] p. 12 |
| A4.27 | Anchura útil | VERIFICADO | La de evacuación de **SI 3 ap. 4** y, como mínimo, la **tabla 4.1** (transcrita abajo) | 4.2.2 pto 4 | [SUA22] p. 13 |
| A4.28 | Cómo se mide la anchura útil | VERIFICADO | Libre de obstáculos; **entre paredes o barreras**, **sin descontar** los pasamanos si no sobresalen **más de 12 cm**; en tramos curvos se excluye la zona con huella **< 17 cm** | 4.2.2 pto 5: «La anchura de la escalera estará libre de obstáculos. La anchura mínima útil se medirá entre paredes o barreras de protección, sin descontar el espacio ocupado por los pasamanos siempre que estos no sobresalgan más de 12 cm de la pared o barrera de protección. En tramos curvos, la anchura útil debe excluir las zonas en las que la dimensión de la huella sea menor que 17 cm.» | [SUA22] p. 13 |
| A4.29 | Pasamanos que sobresale > 12 cm | INTERPRETACIÓN | Entonces se mide hasta el pasamanos | 4.2.2 pto 5 a contrario | — |
| A4.30 | Medida en mesetas y curvas | LEÍDO (comentario, no reglamentario; imagen) | Perpendicular a la trayectoria; en giros, la trayectoria es la curva más exterior paralela al eje (cuarto de círculo a 90º, semicírculo a 180º) | [DccSUA] p. 23, «Medida de la anchura útil de la escalera» | [DccSUA] |
| A4.31 | Mesetas, misma dirección | VERIFICADO | Anchura **≥ la de la escalera** y longitud en su eje **≥ 1 m** | 4.2.3 pto 1 | [SUA22] p. 13 |
| A4.32 | Mesetas con cambio de dirección | VERIFICADO | La anchura **no se reduce** a lo largo de la meseta; zona libre; **ninguna puerta barre** sobre ella, salvo las de zonas de ocupación nula | 4.2.3 pto 2 y figura 4.4 (que acota «> 40 cm» a la puerta) | [SUA22] pp. 13–14 |
| A4.33 | Mesetas, comentarios | LEÍDO (comentario, no reglamentario; imagen) | El 1 m vale también para las mesetas de arranque y llegada; un giro ≥ 90º basta para cortar la caída continuada; la distancia del barrido de una puerta al escalón más próximo «debería ser 40 cm»; meseta de 180º partida con peldaños a 90º: ≥ 3 peldaños salvo uso restringido y zonas comunes de vivienda (incl. su aparcamiento); puertas de ascensor: no les afecta pto 2 | [DccSUA] pp. 24–25 | [DccSUA] |
| A4.34 | Mesetas de planta en uso público | VERIFICADO | Franja de pavimento visual y táctil en el arranque (SUA 9 ap. 2.2); sin pasillos de anchura < 1,20 m ni puertas a < 40 cm del primer peldaño. **No aplica en vivienda**; sí en oficinas con zonas de uso público | 4.2.3 pto 4 | [SUA22] p. 13 |
| A4.35 | Pasamanos: cuándo | VERIFICADO | Escalera que salva **> 55 cm** → pasamanos **al menos en un lado**; **en ambos lados** cuando la anchura libre **> 1,20 m** o cuando **no hay ascensor alternativo** | 4.2.4 pto 1: «Las escaleras que salven una altura mayor que 55 cm dispondrán de pasamanos al menos en un lado. Cuando su anchura libre exceda de 1,20 m, así como cuando no se disponga ascensor como alternativa a la escalera, dispondrán de pasamanos en ambos lados.» Comentario ([DccSUA] p. 26, imagen): «así como» equivale a «o bien» | [SUA22] p. 14 |
| A4.36 | Pasamanos intermedios | VERIFICADO | Si la anchura del tramo **> 4 m**; separación **≤ 4 m** | 4.2.4 pto 2 | [SUA22] p. 14 |
| A4.37 | Prolongación | VERIFICADO | **30 cm** en los extremos, al menos en un lado, en zonas de uso público **o sin ascensor alternativo** | 4.2.4 pto 3 | [SUA22] p. 14 |
| A4.38 | Altura y agarre | VERIFICADO | Entre **90 y 110 cm**; firme y fácil de asir; separado del paramento **≥ 4 cm**; sujeción que no interfiera el paso de la mano. (Segundo pasamanos a 65–75 cm solo en escuelas infantiles y primaria) | 4.2.4 ptos 4 y 5 | [SUA22] p. 14 |

### Tabla 4.1 — Escaleras de uso general. Anchura útil mínima de tramo en función del uso ([SUA22] p. 13, imagen)

Cabecera: «Uso del edificio o zona» | «Anchura útil mínima (m) en escaleras previstas para un número de personas:» ≤ 25 | ≤ 50 | ≤ 100 | > 100

| Uso del edificio o zona | ≤ 25 | ≤ 50 | ≤ 100 | > 100 |
|---|---|---|---|---|
| *Residencial Vivienda*, incluso escalera de comunicación con aparcamiento | 1,00 ⁽¹⁾ (casilla única para las cuatro columnas) | ← | ← | ← |
| *Docente* con escolarización infantil o de enseñanza primaria; *Pública concurrencia* y *Comercial* | 0,80 ⁽²⁾ | 0,90 ⁽²⁾ | 1,00 | 1,10 |
| *Sanitario* — Zonas destinadas a pacientes internos o externos con recorridos que obligan a giros de 90º o mayores | 1,40 (casilla única) | ← | ← | ← |
| *Sanitario* — Otras zonas | 1,20 (casilla única) | ← | ← | ← |
| Casos restantes | 0,80 ⁽²⁾ | 0,90 ⁽²⁾ | 1,00 (casilla única para ≤ 100 y > 100) | ← |

- ⁽¹⁾ «En edificios existentes, cuando se trate de instalar un ascensor que permita mejorar las condiciones de accesibilidad para personas con discapacidad, se puede admitir una anchura menor siempre que se acredite la no viabilidad técnica y económica de otras alternativas que no supongan dicha reducción de anchura y se aporten las medidas complementarias de mejora de la seguridad que en cada caso se estimen necesarias.»
- ⁽²⁾ «Excepto cuando la escalera comunique con una zona accesible, cuyo ancho será de 1,00 m como mínimo.»
- Para nosotros: escalera común y escalera de garaje de la plurifamiliar → **1,00 m** sea cual sea la ocupación. Oficinas (Administrativo) → «Casos restantes»: 0,80 (≤ 25), 0,90 (≤ 50), 1,00 (> 50); y **1,00** si comunica con una zona accesible (nota 2). Aparcamiento que no sea de un edificio de viviendas → «Casos restantes» (no es nuestro caso). Comentario sobre la nota (1): ver anejo B del DA DB-SUA/2 ([DccSUA] p. 24).
- El «número de personas» es la ocupación asignada por SI 3 (otro agente). Signos: «≤» en las tres primeras columnas, «>» en la última.

### Qué se exige a cada escalera de NUESTRO edificio (INTERPRETACIÓN de 4.1, 4.2 y del Anejo A)

| Escalera | Tipo | Anchura | C | H | 2C+H | Tramo máx. | Peldaños/tramo | Pasamanos | Otros |
|---|---|---|---|---|---|---|---|---|---|
| Interior de la unifamiliar o del dúplex | Uso restringido | ≥ 0,80 m | ≤ 20 cm | ≥ 22 cm | — | — | — | — (barandilla en lados abiertos) | Curva: 5/44 cm; mesetas partidas a 45º y sin tabica admitidas; barrera no escalable |
| Común de la plurifamiliar **con** ascensor | Uso general, uso privado | ≥ 1,00 m (tabla 4.1) y SI 3 | 13–18,5 cm | ≥ 28 cm | 54–70 | 3,20 m | ≥ 3, o 1–2 (zona común) | Un lado si anchura libre ≤ 1,20 m; ambos si > 1,20 m | Tabica si no hay itinerario accesible alternativo; sin bocel; mesetas ≥ 1 m |
| Común de la plurifamiliar **sin** ascensor | Uso general, uso privado | ≥ 1,00 m y SI 3 | 13–17,5 cm | ≥ 28 cm | 54–70 | 2,25 m | ídem | **Ambos lados**, prolongados 30 cm en los extremos (al menos un lado) | ídem; tabica obligatoria (sin itinerario accesible alternativo) |
| Del garaje de la plurifamiliar (sótano) | Uso general, uso privado | ≥ 1,00 m («incluso escalera de comunicación con aparcamiento») | según haya o no ascensor que llegue al garaje (18,5 / 17,5) | ≥ 28 | 54–70 | 3,20 / 2,25 m | ≥ 3, o 1–2 | ídem | **Tabica obligatoria** (evacuación ascendente) |
| De las oficinas, zona de uso privado | Uso general | Tabla 4.1 «Casos restantes» y SI 3 | 18,5 / 17,5 según ascensor | ≥ 28 | 54–70 | 3,20 / 2,25 m | ≥ 3 | Según 4.2.4 | — |
| De las oficinas, zona de uso público | Uso general, uso público | ídem | **≤ 17,5** | ≥ 28 | 54–70 | **2,25 m** | ≥ 3 | Prolongación 30 cm | Franja visual y táctil en mesetas de planta; puertas a ≥ 40 cm |

### 4.3 Rampas

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A4.39 | Qué es rampa | VERIFICADO | Itinerario con pendiente **> 4 %** («exceda del 4%») | 4.3 pto 1: «Los itinerarios cuya pendiente exceda del 4% se consideran rampa a efectos de este DB-SUA, y cumplirán lo que se establece en los apartados que figuran a continuación, excepto los de uso restringido y los de circulación de vehículos en aparcamientos que también estén previstas para la circulación de personas. Estas últimas deben satisfacer la pendiente máxima que se establece para ellas en el apartado 4.3.1 siguiente, así como las condiciones de la Sección SUA 7.» | [SUA22] p. 14 |
| A4.40 | Exclusiones | VERIFICADO | Rampas de **uso restringido**: fuera de 4.3. Rampas de vehículos del aparcamiento previstas también para personas: **solo** la pendiente de 4.3.1 b) y SUA 7 (ni tramos, ni mesetas, ni pasamanos de 4.3) | 4.3 pto 1 | [SUA22] p. 14 |
| A4.41 | Pendiente general | VERIFICADO | **≤ 12 %** | 4.3.1 pto 1 | [SUA22] p. 14 |
| A4.42 | Itinerario accesible | VERIFICADO | **≤ 10 %** si longitud **< 3 m**; **≤ 8 %** si **< 6 m**; **≤ 6 %** en el resto (≥ 6 m). En curva, en el lado más desfavorable. Transversal **≤ 2 %** | 4.3.1 pto 1 a) y pto 2 | [SUA22] p. 14 |
| A4.43 | Longitud | LEÍDO (comentario, no reglamentario; imagen) | En **proyección horizontal** y **por tramo** | [DccSUA] p. 27 | [DccSUA] |
| A4.44 | Rampa del garaje | VERIFICADO | Vehículos y personas, fuera de itinerario accesible: **≤ 16 %** | 4.3.1 pto 1 b): «las de circulación de vehículos en aparcamientos que también estén previstas para la circulación de personas, y no pertenezcan a un itinerario accesible, cuya pendiente será, como máximo, del 16%.» | [SUA22] p. 14 |
| A4.45 | «18 %» del encargo | **CORREGIDO** | El DB-SUA **no tiene 18 %** en ningún sitio. Una rampa **solo de vehículos** (con acceso peatonal aparte) no está en 4.3 (no es «itinerario» de personas): su pendiente la fijan las ordenanzas municipales, no el CTE (INTERPRETACIÓN) | 4.3 pto 1 y 4.3.1 | [SUA22] p. 14 |
| A4.46 | Rampa al 16 % (comentario) | LEÍDO (comentario, no reglamentario; texto) | «… una rampa del 16 %, aunque puede suponer una barrera para determinados usuarios, por lo que no se puede considerar itinerario accesible, no supone un alto riesgo de utilización para otros usuarios …»; por encima del 12 %, conviene itinerario alternativo por escalera | [DccSUA] p. 6 | [DccSUA] |
| A4.47 | Tramos | VERIFICADO | Longitud **≤ 15 m**; **≤ 9 m** en itinerario accesible; **sin límite** en aparcamientos de vehículos y personas. Anchura útil: SI 3 ap. 4 y, como mínimo, la de la tabla 4.1 | 4.3.2 pto 1 | [SUA22] p. 15 |
| A4.48 | Medida de la anchura | VERIFICADO | Libre de obstáculos; entre paredes o barreras, sin descontar pasamanos de ≤ 12 cm | 4.3.2 pto 2 | [SUA22] p. 15 |
| A4.49 | Rampa accesible | VERIFICADO | Tramos rectos o con radio **≥ 30 m**, anchura **≥ 1,20 m**; superficie horizontal **≥ 1,20 m** al principio y al final de cada tramo | 4.3.2 pto 3 | [SUA22] p. 15 |
| A4.50 | Mesetas | VERIFICADO | Misma dirección: anchura ≥ la de la rampa y longitud en el eje **≥ 1,50 m**. Cambio de dirección: anchura sin reducir, libre, sin barrido de puertas (salvo ocupación nula). Sin pasillos **< 1,20 m** ni puertas a **< 40 cm** del arranque; **1,50 m** en itinerario accesible | 4.3.3 ptos 1 a 3 | [SUA22] p. 15 |
| A4.51 | Mesetas accesibles (comentario) | LEÍDO (comentario, no reglamentario; imagen p. 27, texto p. 28) | Meseta de extremo 1,20 m; intermedia 1,50 m; ≤ 4 % se asimila a horizontal; los 1,50 m a puertas cuentan desde el barrido; excepción para puertas automáticas con detector | [DccSUA] pp. 27–28 | [DccSUA] |
| A4.52 | Pasamanos | VERIFICADO | Diferencia de altura **> 550 mm** y pendiente **≥ 6 %** → pasamanos **continuo al menos en un lado**. En itinerario accesible, pendiente **≥ 6 %** y altura **> 18,5 cm** → **continuo en ambos lados**, incluidas mesetas; zócalo o protección lateral **≥ 10 cm** en bordes libres; si el tramo **> 3 m**, prolongación horizontal **≥ 30 cm** en ambos lados. Altura **90–110 cm**; en itinerario accesible (y escuelas), otro a **65–75 cm**. Separado **≥ 4 cm** del paramento | 4.3.4 ptos 1 a 4 | [SUA22] p. 15 |

### 4.4 y otros

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A4.53 | Pasillos escalonados (4.4) | VERIFICADO | **No aplica**: solo graderíos y tribunas de espectadores | 4.4 pto 1 | [SUA22] p. 15 |
| A4.54 | Escalas fijas | **CORREGIDO** | El DB-SUA vigente **no regula escalas fijas** (no aparecen en el índice ni en el texto). Las de acceso a cubiertas o a cuartos técnicos son elementos de mantenimiento: RD 486/1997 (fuera del DB, 0.2 y 0.8) | Índice y SUA 1 completos | [SUA22] pp. 6, 8–16 |
| A4.55 | ¿Qué es la «anchura útil»? | VERIFICADO + INTERPRETACIÓN | La anchura libre entre paredes o barreras, medida perpendicular a la marcha, sin descontar pasamanos de ≤ 12 cm de vuelo, sin obstáculos y, en curva, sin la zona de huella < 17 cm. El DB no la define en el Anejo A; se sigue de 4.2.2 pto 5 y 4.3.2 pto 2 | ver A4.28–A4.30 | [SUA22] pp. 13, 15 |

**Qué hace falta.**
- De El edificio: la **altura de cada planta** (`altura_m`) → la contrahuella real y el número de peldaños; si hay **sótano de garaje** (escalera de evacuación ascendente → tabica); si la vivienda unifamiliar tiene **más de una planta** (escalera interior).
- Del proyectista: **¿hay ascensor como alternativa a la escalera común?** (no está en El edificio; `TipoCuarto "ascensor"` es un cuarto de maquinaria, que puede no existir), **¿llega al garaje?**, número de **tramos por planta**, **huella**, **anchura útil** de la escalera común y de la interior, **anchura de mesetas**, **ancho del ojo**, **pendiente y longitud** de la rampa del garaje y de la rampa de acceso (si la hay), **¿la rampa del garaje es también peatonal?**

---

## Bloque A5 — SUA 1 ap. 5: limpieza de los acristalamientos exteriores

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A5.1 | Ámbito | VERIFICADO | **Solo Residencial Vivienda** (unifamiliar incluida); acristalamientos con **vidrio transparente** situados a **más de 6 m** sobre la **rasante exterior** | ap. 5 pto 1: «En edificios de uso Residencial Vivienda, los acristalamientos que se encuentren a una altura de más de 6 m sobre la rasante exterior con vidrio transparente cumplirán las condiciones que se indican a continuación, salvo cuando sean practicables o fácilmente desmontables, permitiendo su limpieza desde el interior:» | [SUA22] p. 15 |
| A5.2 | ¿Oficinas? | VERIFICADO (por ausencia) + comentario | No: en otros usos se puede proyectar para limpieza por empresa especializada, con el RD 486/1997 | ap. 5; [DccSUA] p. 30 | [SUA22]; [DccSUA] |
| A5.3 | a) Alcance | VERIFICADO | Toda la superficie exterior del vidrio dentro de un radio de **0,85 m** desde algún punto del borde de la zona practicable situado a **≤ 1,30 m** de altura | «a) toda la superficie exterior del acristalamiento se encontrará comprendida en un radio de 0,85 m desde algún punto del borde de la zona practicable situado a una altura no mayor de 1,30 m. (véase figura 5.1);» | [SUA22] p. 16 |
| A5.4 | b) Reversibles | VERIFICADO | Con dispositivo que los bloquee en posición invertida durante la limpieza | «b) los acristalamientos reversibles estarán equipados con un dispositivo que los mantenga bloqueados en la posición invertida durante su limpieza.» | [SUA22] p. 16 |
| A5.5 | «Plataformas de mantenimiento» del encargo | **CORREGIDO** | El ap. 5 vigente tiene **solo a) y b)**. No hay plataformas de mantenimiento ni barreras de 1,20 m (la página 16 acaba en la figura 5.1) | ap. 5 completo | [SUA22] pp. 15–16 |
| A5.6 | «Altura de 0,85 / 1,30 m» del encargo | CORREGIDO (matiz) | 0,85 m es un **radio** de alcance; 1,30 m es la altura **máxima** del punto del borde practicable desde el que se mide | ap. 5 a) | [SUA22] p. 16 |
| A5.7 | ¿«Más de 6 m» de qué parte del vidrio? | INTERPRETACIÓN + comentario | Cualquier acristalamiento que tenga parte a más de 6 m sobre la rasante. El comentario: «No existe exigencia reglamentaria para los acristalamientos situados a menor altura de 6 m.» | ap. 5 pto 1; [DccSUA] p. 29 (imagen) | [SUA22]; [DccSUA] |
| A5.8 | Cómo se cumple (comentario) | LEÍDO (comentario, no reglamentario; imagen) | Lo más seguro: limpiar las dos caras desde el suelo y desde el mismo lado. Desmontables: hoja manejable por una persona («hasta 25 kg»). Eje horizontal y reversibles: que no se muevan. Por un hueco: «la limpieza únicamente es suficientemente segura si se puede efectuar por una persona de pie sobre el suelo». No vale contar con accesorios (pértigas). **Barandillas de vidrio transparente y cerramientos transparentes de terrazas** también deben cumplir este apartado | [DccSUA] pp. 29–30 | [DccSUA] |

**Qué hace falta.** De El edificio: la **cota del suelo de cada planta** sobre la rasante y el uso (vivienda). Del proyectista: el **tipo de carpintería** (practicable abatible / oscilobatiente / corredera / fija), si hay **fijos** fuera de alcance, **barandillas de vidrio**, **lucernarios o dobles alturas**. Lo habitual (CRITERIO): todas las hojas practicables o correderas desmontables; sin fijos por encima de 6 m o, si los hay, a ≤ 0,85 m del borde de la hoja practicable.

---

## Bloque A6 — Qué es dato del proyectista y entradas mínimas para justificar SUA 1

Casi todo SUA 1 es **declarativo** (exigencias de ejecución que la memoria afirma) o **depende de la planta** (cifras medidas en plano). La app no mide; propone «lo habitual» con el límite del DB al lado.

| # | Entrada | ¿De dónde? | Límite del DB | Lo habitual (CRITERIO) |
|---|---|---|---|---|
| E1 | Clasificación de zonas (restringido/general, privado/público, ocupación nula) | **El edificio** (`UsoZona`) + mapa del Bloque 0 | Anejo A | Automático; editable solo en oficinas (¿atención al público?) |
| E2 | ¿Ascensor como alternativa a la escalera común? ¿llega al garaje? | Decisión | Decide 17,5/18,5 cm, 2,25/3,20 m y pasamanos en uno o dos lados | Sí si la plurifamiliar es de PB + 3 o más (SUA 9 suele exigirlo: otro agente); no en PB + 1 |
| E3 | Altura de planta | **El edificio** (`altura_m`) | — | — |
| E4 | Escalera común: n.º de tramos por planta | Decisión | Altura de tramo = altura de planta / tramos ≤ 3,20 m (con ascensor) o ≤ 2,25 m | 2 tramos (ida y vuelta) |
| E5 | Escalera común: contrahuella | **Derivada**: n = ⌈h / C_máx⌉ peldaños, C = h / n | 13 ≤ C ≤ 18,5 (17,5); misma C en toda la planta; ±1 cm entre plantas | C_máx de cálculo **17,5 cm** siempre (cumple con y sin ascensor) → p. ej. h = 3,00 m → 18 peldaños de 16,67 cm |
| E6 | Escalera común: huella | Decisión | ≥ 28 cm; 54 ≤ 2C + H ≤ 70 | **28 cm** (con C ≈ 17,5) o la que dé 2C + H ≈ 63 (p. ej. 30 cm con C = 16,67) |
| E7 | Escalera común: anchura útil | Decisión | ≥ 1,00 m (tabla 4.1) y SI 3 | **1,00 m** (1,10–1,20 m en edificios grandes; SI 3 manda si da más) |
| E8 | Mesetas | Decisión | ≥ anchura de la escalera; ≥ 1 m en el eje (misma dirección); sin barrido de puertas en los giros | Igual a la anchura de la escalera, ≥ 1,00 m; puertas de vivienda fuera de la meseta de giro |
| E9 | Pasamanos | Derivado de E2 y E7 | Uno o ambos lados; 90–110 cm; prolongación 30 cm sin ascensor | Un lado (en la barandilla) con ascensor y anchura ≤ 1,20 m; dos lados sin ascensor; altura **0,95 m** |
| E10 | Barandilla de la escalera común y ojo | Decisión: ancho del ojo | < 40 cm → ≥ 0,90 m; ≥ 40 cm y caída > 6 m → ≥ 1,10 m | Ojo < 40 cm; barandilla **0,90–1,00 m** de barrotes verticales a < 10 cm, sin travesaños horizontales entre 30 y 50 cm |
| E11 | Escalera interior (unifamiliar o dúplex) | Altura de planta (El edificio) + decisión de anchura y huella | ≥ 0,80 m; C ≤ 20; H ≥ 22 | Anchura **0,90 m**; C ≤ **18,5 cm**; H **25–27 cm** |
| E12 | Escalera del garaje (plurifamiliar) | Igual que E4–E9 | + tabica obligatoria | Igual que la común; tabica vertical, sin bocel |
| E13 | Barreras en terrazas, balcones, cubierta transitable | **Derivada** de la cota (El edificio) + decisión de tipología | > 55 cm: barrera; ≤ 6 m → ≥ 0,90; > 6 m → ≥ 1,10; no escalable; Ø 10 cm | **1,10 m** en todas las terrazas y en la cubierta transitable (homogéneo); petos de fábrica o barandilla de barrotes verticales |
| E14 | Antepechos de ventanas | Decisión | ≥ 0,90 / 1,10 m o barandilla | Antepecho **1,00 m** bajo 6 m; **1,10 m** sobre 6 m; balconeras con barandilla |
| E15 | Rampa del garaje | Decisión: ¿peatonal también?; pendiente | Si peatonal: ≤ 16 %; si no, ordenanza municipal (no CTE) | Acceso peatonal por escalera aparte; si la rampa es mixta, ≤ **16 %** en tramo recto (con acera o banda peatonal de SUA 7, otro agente) |
| E16 | Rampa de acceso al portal (si la hay) | Decisión: longitud y pendiente | Itinerario accesible: 10 % (< 3 m), 8 % (< 6 m), 6 %; tramo ≤ 9 m; ancho ≥ 1,20 m; mesetas 1,20 / 1,50 m; pasamanos a ambos lados si ≥ 6 % y > 18,5 cm | Portal a nivel de calle; si no, rampa ≤ 8 % de < 6 m |
| E17 | Escalones aislados | Decisión | Solo en acceso/salida, zona común de vivienda o interior de vivienda, fuera del itinerario accesible | Ninguno, o 1–2 en la línea de fachada |
| E18 | Resbaladicidad (solo oficinas) | Decisión: clase por localización | Tabla 1.2 | Ver Bloque A1 |
| E19 | Carpinterías (limpieza) | Decisión | ap. 5 en plantas con vidrio a > 6 m | Practicables o correderas; sin fijos inaccesibles |

**Mínimo para una memoria de plurifamiliar** (lo que el proyectista teclea o confirma): E2, E4, E6, E7, E10, E13 (si cambia el 1,10 propuesto), E15, E16 (si hay rampa), E19. El resto sale de El edificio o es declarativo. **Unifamiliar**: E11, E13, E14, E19.

Comprobaciones que la app sí puede hacer con esas entradas (veredicto CUMPLE / NO CUMPLE):
- C = h/n dentro de [13, C_máx]; 2C + H en [54, 70]; H ≥ 28 (≥ 22 interior); |C_planta i − C_planta j| ≤ 1 cm entre plantas consecutivas.
- Altura de tramo = h / tramos ≤ 3,20 / 2,25 m.
- Anchura ≥ tabla 4.1 (y ≥ 0,80 m interior).
- Pasamanos en ambos lados si no hay ascensor o la anchura libre > 1,20 m.
- Altura de barrera ≥ 0,90 / 1,10 m según la cota.
- Pendiente de rampa ≤ 16 % (garaje mixto), ≤ 12 % (general), ≤ 10/8/6 % (accesible por longitud).

---

## Bloque A7 — Frases típicas de memoria (castellano normativo, con cita)

| # | Frase | Veredicto | Cita |
|---|---|---|---|
| F1 | «Se justifica la exigencia básica SUA 1 mediante la aplicación de la Sección SUA 1 del DB-SUA (texto consolidado de 14-06-2022).» | VERIFICADO (edición) | [SUA22] p. 1 |
| F2 | «El edificio es de uso Residencial Vivienda, que no figura entre los usos del apartado 1 de SUA 1; no se exige clase de resbaladicidad a sus suelos, ni al aparcamiento.» | VERIFICADO | SUA 1-1 pto 1 |
| F3 | «Los suelos de las oficinas (uso Administrativo) tienen, como mínimo, clase 1 en zonas interiores secas con pendiente < 6 %, clase 2 en zonas secas con pendiente ≥ 6 %, escaleras y zonas húmedas (aseos, entrada), y clase 3 en zonas húmedas con pendiente ≥ 6 % y escaleras, y en zonas exteriores (SUA 1-1, tablas 1.1 y 1.2). Se excluyen las zonas de ocupación nula.» | VERIFICADO | SUA 1-1 pto 3, tabla 1.2 |
| F4 | «En las zonas comunes, el garaje y las oficinas el pavimento no presenta juntas con resalto de más de 4 mm; los elementos salientes puntuales no sobresalen más de 12 mm y, si exceden de 6 mm, forman con el pavimento un ángulo ≤ 45º; los desniveles de hasta 5 cm se salvan con pendiente ≤ 25 %; no hay huecos por los que pase una esfera de 1,5 cm (SUA 1-2.1). No es exigible en el interior de las viviendas (uso restringido) ni en zonas exteriores.» | VERIFICADO | SUA 1-2 pto 1 |
| F5 | «Solo hay escalones aislados en el acceso al edificio [o en zonas comunes de uso Residencial Vivienda], fuera del itinerario accesible (SUA 1-2.3).» | VERIFICADO | SUA 1-2 pto 3 |
| F6 | «Se disponen barreras de protección en los desniveles, huecos y aberturas con diferencia de cota mayor que 55 cm (SUA 1-3.1.1), de altura ≥ 0,90 m donde la diferencia de cota no excede de 6 m y ≥ 1,10 m en el resto (SUA 1-3.2.1), medida desde el suelo o desde la línea de inclinación de la escalera.» | VERIFICADO | SUA 1-3.1, 3.2.1 |
| F7 | «Las barreras resisten la fuerza horizontal del DB SE-AE, apartado 3.2.1 (SUA 1-3.2.2).» | VERIFICADO (remisión; sin cifra) | SUA 1-3.2.2 |
| F8 | «Al ser un edificio de uso Residencial Vivienda, las barreras, incluidas las de escaleras y rampas, no tienen puntos de apoyo entre 30 y 50 cm sobre el suelo o la línea de inclinación ni salientes horizontales de más de 15 cm de fondo entre 50 y 80 cm, y sus aberturas no dejan pasar una esfera de 10 cm; el límite inferior de la barandilla de la escalera está a ≤ 5 cm de la línea de inclinación (SUA 1-3.2.3).» | VERIFICADO | SUA 1-3.2.3 |
| F9 | «No hay zonas de uso público en el edificio de viviendas; no es de aplicación la señalización de desniveles de SUA 1-3.1.2 [salvo en …] ni hay barreras delante de asientos fijos (SUA 1-3.2.4).» | VERIFICADO (no aplica) | Anejo A, «Uso privado»; 3.1 pto 2; 3.2.4 |
| F10 | «La escalera interior de la vivienda es de uso restringido: anchura ≥ 0,80 m, contrahuella ≤ 20 cm y huella ≥ 22 cm, con barandilla en sus lados abiertos (SUA 1-4.1).» | VERIFICADO | SUA 1-4.1 |
| F11 | «La escalera común es de uso general y uso privado, con ascensor como alternativa: huella H = 28 cm, contrahuella C = 17,5 cm, 2C + H = 63 cm (54 ≤ 2C + H ≤ 70); tramos rectos de N peldaños que salvan X m ≤ 3,20 m; misma contrahuella en toda la planta; tabicas verticales y sin bocel (SUA 1-4.2.1 y 4.2.2).» | VERIFICADO | SUA 1-4.2.1, 4.2.2 |
| F12 | «La anchura útil de los tramos es de 1,00 m (tabla 4.1, Residencial Vivienda, incluso escalera de comunicación con aparcamiento), medida entre paredes y barreras sin descontar el pasamanos, que vuela ≤ 12 cm; las mesetas tienen la anchura de la escalera y ≥ 1,00 m de longitud, sin barrido de puertas en los cambios de dirección (SUA 1-4.2.2 y 4.2.3).» | VERIFICADO | SUA 1-4.2.2 ptos 4–5, 4.2.3 |
| F13 | «La escalera salva más de 55 cm y dispone de pasamanos [en un lado / en ambos lados, prolongado 30 cm en los extremos, por no haber ascensor alternativo], a una altura entre 90 y 110 cm, separado ≥ 4 cm del paramento (SUA 1-4.2.4).» | VERIFICADO | SUA 1-4.2.4 |
| F14 | «La rampa de vehículos del aparcamiento, prevista también para personas y no perteneciente a un itinerario accesible, tiene una pendiente ≤ 16 % (SUA 1-4.3.1 b) y cumple SUA 7.» | VERIFICADO | SUA 1-4.3 pto 1, 4.3.1 b) |
| F15 | «La rampa de acceso, perteneciente al itinerario accesible, tiene una pendiente del X % (≤ 10 % / 8 % / 6 % según longitud), transversal ≤ 2 %, tramos ≤ 9 m de anchura ≥ 1,20 m, mesetas de 1,20 m en los extremos y pasamanos continuo a ambos lados a 90–110 y 65–75 cm (SUA 1-4.3).» | VERIFICADO | SUA 1-4.3 |
| F16 | «No existen pasillos escalonados de graderíos (SUA 1-4.4).» | VERIFICADO | SUA 1-4.4 |
| F17 | «Los acristalamientos de vidrio transparente situados a más de 6 m sobre la rasante exterior son practicables y permiten su limpieza desde el interior: toda su superficie exterior queda a ≤ 0,85 m de un punto del borde practicable situado a ≤ 1,30 m de altura; los reversibles llevan bloqueo en posición invertida (SUA 1-5).» | VERIFICADO | SUA 1-5 |
| F18 | «La cubierta no transitable solo es accesible para mantenimiento; queda fuera del ámbito del DB-SUA (Introducción II) y se dota de los medios de seguridad para su conservación conforme al RD 1627/1997 y al RD 486/1997.» | INTERPRETACIÓN + comentario | Intro II; [DccSUA] pp. 4–5 |
| F19 | «El local sin uso es una obra inacabada; su cumplimiento del DB-SUA se justificará en el proyecto de su actividad.» | LEÍDO (comentario) | [DccSUA] p. 9 |

---

## Cifras que SÍ se pueden mostrar en la UI, con su cita

Cita base: «DB-SUA (consolidado 14-06-2022), SUA 1 …».
- **Tabla 1.1** (R_d: ≤ 15 / 15–35 / 35–45 / > 45 → clases 0 a 3) y **tabla 1.2** con sus dos notas; usos del ap. 1 pto 1; UNE 41901:2017 EX.
- **Ap. 2**: 4 mm; 12 mm; 6 mm y 45º; 5 cm y 25 %; esfera 1,5 cm; barreras de delimitación ≥ 80 cm; escalón aislado y sus cuatro excepciones.
- **Ap. 3**: > 55 cm; 0,90 m (≤ 6 m) / 1,10 m (> 6 m) / 0,90 m en huecos de escalera < 40 cm; medida desde suelo o línea de inclinación; 3.2.3: 30–50 cm sin apoyos (salientes > 5 cm), 50–80 cm sin salientes > 15 cm, esfera 10 cm, triángulo ≤ 5 cm; esfera 15 cm en uso público de otros usos; uso público: diferenciación a ≥ 25 cm.
- **4.1**: 0,80 m; C ≤ 20; H ≥ 22; curvo 5 / 44 cm, medida en eje (< 1 m) o a 50 cm; superposición 2,5 cm; peldaños a 45º.
- **4.2**: H ≥ 28; 13 ≤ C ≤ 18,5 / 17,5; 54 ≤ 2C + H ≤ 70; tabica ≤ 15º; curvo 28 a 50 cm y ≤ 44; ≥ 3 peldaños; tramo 2,25 / 3,20 m; ±1 cm; **tabla 4.1** con notas; 12 cm de pasamanos; 17 cm en curva; mesetas 1 m; uso público 1,20 m y 40 cm; pasamanos > 55 cm, > 1,20 m, > 4 m, 30 cm, 90–110 cm, 4 cm.
- **4.3**: > 4 %; 12 %; 10 / 8 / 6 % con < 3 m / < 6 m; 16 %; 2 %; 15 / 9 m; 1,20 m; radio 30 m; mesetas 1,50 m; 40 cm / 1,50 m; pasamanos > 550 mm y ≥ 6 %; accesible ≥ 6 % y > 18,5 cm, zócalo 10 cm, prolongación 30 cm si > 3 m; 90–110 y 65–75 cm.
- **Ap. 5**: > 6 m; 0,85 m; 1,30 m.
- **Comentarios** (rotulados «Comentario del Ministerio, no reglamentario»): cerraderos 15 mm (UNE-EN 1125); entrada húmeda 6 m o felpudo 2 m; bandas 3–5 cm a ≤ 5 cm del borde; hueco forjado–barrera ≤ 3 cm (buena práctica); 25 kg para hojas desmontables; 1 o 2 peldaños en zonas comunes de vivienda incl. aparcamiento; puertas a 40 cm del escalón.

## Cifras que NO deben mostrarse

- **Una clase de resbaladicidad «exigida» en vivienda o en el garaje** (A1.2). Si se declara, rotulada CRITERIO.
- **«18 %»** para la rampa del garaje como CTE (A4.45). Si se usa, «ordenanza municipal».
- **«15 mm»** como límite del DB para salientes (A2.5): son 12 mm; los 15 mm son solo de cerraderos CE, por comentario.
- **«50 cm»** en discontinuidades (A2.11).
- **Plataformas de mantenimiento o barreras de 1,20 m** en el ap. 5 (A5.5).
- **Condiciones de escalas fijas** atribuidas al DB-SUA (A4.54).
- **La fuerza horizontal de SE-AE** (0,8 / 1,6 / 3,0 kN/m u otra) hasta leer el DB SE-AE (A3.12).
- **17,5 cm o 2,25 m «por ser zona común»**: en vivienda las zonas comunes son de uso **privado**; lo que lleva a 17,5 / 2,25 es **no tener ascensor alternativo** (A4.13–A4.14, A4.23–A4.24).
- **Pasamanos o 2C + H exigidos a la escalera interior de la vivienda** (A4.8).
- **Señalización visual y táctil de desniveles o franja en mesetas** en el edificio de viviendas (A3.6, A4.34).
- **0,90 m «siempre» en la barandilla de la escalera común**, sin mirar el ancho del ojo (A3.10).

## Criterios de proyecto (lo que el DB no fija)

| # | Tema | Propuesta | Por qué |
|---|---|---|---|
| K1 | Ascensor como alternativa | Decisión explícita (sí/no) y si llega al garaje. Por defecto: sí si hay `TipoCuarto "ascensor"` o la plurifamiliar tiene ≥ PB + 3; no en los demás casos. Siempre editable | El modelo no tiene «hay ascensor»; el cuarto de maquinaria no siempre existe |
| K2 | Contrahuella de cálculo | Usar C_máx = 17,5 cm para proponer n = ⌈h / 0,175⌉ (cumple con o sin ascensor); el proyectista puede bajar a 18,5 solo si hay ascensor | Una propuesta que no cambia de veredicto si cambia K1 |
| K3 | Huella propuesta | La que dé 2C + H más cercano a 63 cm, redondeada a 0,5 cm y ≥ 28 cm | Centro del intervalo [54, 70] y regla habitual de confort; el DB solo da el intervalo |
| K4 | Tramos por planta | 2 (escalera de ida y vuelta); 1 si h ≤ 2,25 / 3,20 y el proyectista lo dice | Tipología habitual |
| K5 | Cota para la altura de barrera | Diferencia de cota = cota del suelo de la planta sobre la rasante exterior (PB a ±0,00, como K5 del SI); en patios, sobre el fondo del patio (decisión) | El modelo no describe rasantes ni patios |
| K6 | Altura de barrera propuesta | 1,10 m en todas las terrazas y en la cubierta transitable; 0,90–1,00 m en la escalera común con ojo < 40 cm; 0,90 m en la escalera interior | Homogeneidad; la app muestra el mínimo del DB al lado |
| K7 | Garaje de la plurifamiliar y 3.2.3 | Aplicar «no escalable» también en el garaje | Prudencia (A3.14) |
| K8 | Oficinas: ¿uso público? | Decisión «¿hay atención al público o salas de visitas?»; sí → contrahuella ≤ 17,5, tramo ≤ 2,25, franja en mesetas, esfera 15 cm, señalización de desniveles | Anejo A, «Uso público» y comentario |
| K9 | Oficinas: ¿uso restringido? | No: tratarlas siempre como uso general | La excepción de ≤ 10 usuarios habituales es de lectura dudosa para una oficina |
| K10 | Acristalamientos > 6 m | Aplicar el ap. 5 a las plantas con cota de suelo + 2,20 m (dintel típico) > 6,00 m; con plantas de 3 m, desde la P2 | El DB habla de la altura del vidrio; el modelo da cotas de suelo |
| K11 | Resbaladicidad en zonas comunes de vivienda | Ofrecer declararla como buena práctica, rotulada CRITERIO (clase 1 seco, 2 escalera y entrada, 3 exterior) | Muchas memorias lo hacen; el DB no lo exige |
| K12 | Cubierta no transitable | Nota fija: fuera de SUA (Intro II); prever línea de vida o anclajes (RD 1627/1997, RD 486/1997) | Comentario 0.8 |

---

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Usos con resbaladicidad | DB-SUA | Consolidado 14-06-2022 (RD 450/2022) | 2022-06-14 | SUA 1 ap. 1 pto 1 | — | codigotecnico.org · DBSUA.pdf, p. 8 |
| Clases por R_d | ídem | ídem | 2022-06-14 | SUA 1 ap. 1 pto 2 | Tabla 1.1 | ídem, p. 8 |
| Clase exigible | ídem | ídem | 2022-06-14 | SUA 1 ap. 1 pto 3 | Tabla 1.2 | ídem, p. 8 |
| Discontinuidades | ídem | ídem | 2022-06-14 | SUA 1 ap. 2 ptos 1–3 | — | ídem, pp. 8–9 |
| Desniveles y barreras | ídem | ídem | 2022-06-14 | SUA 1 ap. 3.1, 3.2.1, 3.2.3 | Figuras 3.1, 3.2 | ídem, pp. 9–10 |
| Escaleras de uso restringido | ídem | ídem | 2022-06-14 | SUA 1 ap. 4.1 | Figura 4.1 | ídem, p. 11 |
| Escaleras de uso general | ídem | ídem | 2022-06-14 | SUA 1 ap. 4.2.1–4.2.4 | Tabla 4.1 | ídem, pp. 11–14 |
| Rampas | ídem | ídem | 2022-06-14 | SUA 1 ap. 4.3.1–4.3.4 | — | ídem, pp. 14–15 |
| Limpieza de acristalamientos | ídem | ídem | 2022-06-14 | SUA 1 ap. 5 | Figura 5.1 | ídem, pp. 15–16 |
| Comentarios | DB-SUA con comentarios | Articulado 14-06-2022; comentarios 15-07-2024 | 2024-07-15 | (el que toque) | — | DccSUA.pdf (no reglamentario) |

---

## Pendientes

1. **DB SE-AE ap. 3.2.1** (fuerza horizontal sobre barreras por categoría de uso): descargar y leer; hasta entonces, la ficha solo da la remisión (A3.12).
2. **Corrección de errores del RD 450/2022 (BOE 2-02-2023)**: listada en [DccSUA] p. 2 y no en [SUA22] p. 2. El articulado de SUA 1 coincide en las dos fuentes; falta confirmar en el BOE qué corrige (probablemente SUA 9 o el Anejo A, fuera de esta parte).
3. **SI 3 ap. 4** (anchura de evacuación de escaleras y rampas): la tabla 4.1 es solo el mínimo; lo cruza el agente de SI 3 / la verificación existente.
4. **SUA 9-1.1.2** (cuándo es obligatorio el ascensor accesible) y **SUA 7** (rampa del garaje, acera peatonal): otros agentes; afectan a K1 y E15.
5. **Decisiones a validar por el responsable**: K1 a K12; e INTERPRETACIONES A2.2 (qué es exterior), A3.4–A3.5 (cubiertas), A3.9 (antepechos), A3.10 (ojo de escalera > 6 m → 1,10 m), A3.14 (garaje no escalable), A4.5 (anchura de 1,00 m exacta), A4.19 (tabica en la escalera del garaje), A4.45 (rampa solo de vehículos fuera de SUA 1), A5.7, y el mapa de zonas del Bloque 0 (garaje de la unifamiliar como uso restringido).
6. Imágenes de [DccSUA] no vistas (solo texto): pp. 3–11, 14, 18, 22, 28, 54, 70, 71. No tienen cifras que se usen salvo el 16 % de p. 6 (coincide con el articulado).

---

## Para el código

### Observaciones sobre lo que ya existe

| # | Fichero | Hoy | Propuesta | Motivo |
|---|---|---|---|---|
| R1 | `lib/edificio/tipos.ts` | No hay «hay ascensor» | Decisión del módulo SUA1 (no del modelo), con valor por defecto de K1. Si SUA 9 la necesita también, subirla a `Edificio` | A4.13, A4.23, A4.35 |
| R2 | ídem, `UsoZona` | `garaje` / `garaje_privado` | Mapear `garaje_privado` → interior de vivienda (uso restringido); `garaje` → zona común, uso general, uso privado (Aparcamiento si > 100 m² construidos, pero SUA 1 no cambia por ello salvo la tabla 4.1, que ya lo cubre) | Bloque 0 |
| R3 | ídem, `instalaciones`, `trasteros` | Ocupación nula | Fuera de resbaladicidad (ap. 1); los cuartos de mantenimiento, fuera del DB (Intro II); los pasillos de trasteros, zona común | A1.5, 0.2 |
| R4 | `lib/edificio/derivar.ts` | `cubiertaTransitable` | Usarla: transitable → barrera perimetral (E13); no transitable/inclinada → nota K12 | A3.4–A3.5 |
| R5 | — | — | Función de cota por planta (suelo sobre rasante) para E13, K10 y A3.7; reutilizar la de alturas de evacuación del SI | A3.7, A5.1 |

### Datos propuestos para `src/modules/sua1/tablas.ts`

Sigue el patrón `tablaCTE(procedencia, datos)` de `src/lib/cte/tabla.ts` y el `Intervalo` de `src/modules/si/tablas.ts` (convendría moverlo a `lib/cte`). **No está aplicado ni compilado.** Todas las cifras salen de la imagen de [SUA22]; coinciden con el texto de [SUA22] y de [DccSUA]. Los criterios van al final, fuera de `tablaCTE`.

```ts
// =============================================================================
// DB-SUA, Sección SUA 1 — Seguridad frente al riesgo de caídas (feature-20).
// Verificación: research/verificacion-sua1.md (imagen de DBSUA.pdf pp. 8–16, 35–40).
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import type { Intervalo } from "../si/tablas"; // { gt?, ge?, lt?, le? } — mover a lib/cte

export const PROC_SUA = {
  db: "DB-SUA",
  edicion: "consolidado 14-jun-2022 (RD 450/2022)",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org",
} as const;

export const EDICION_SUA = "DB-SUA (consolidado 14-jun-2022)";

// ---------------------------------------------------------------------------
// Ap. 1 — Resbaladicidad
// ---------------------------------------------------------------------------

/** Usos con exigencia de clase (lista CERRADA). Residencial Vivienda y Aparcamiento NO están. */
export const USOS_RESBALADICIDAD = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 1 ap. 1 pto 1" },
  {
    usos: [
      "residencial_publico",
      "sanitario",
      "docente",
      "comercial",
      "administrativo",
      "publica_concurrencia",
    ] as const,
    /** «excluidas las zonas de ocupación nula definidas en el anejo SI A del DB SI». */
    excluyeOcupacionNula: true,
  },
);

/** Tabla 1.1 — Clase según R_d (valor PTV, UNE 41901:2017 EX). */
export const CLASES_RD_TABLA_1_1 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 1 ap. 1 pto 2", tabla: "Tabla 1.1" },
  [
    { clase: 0, rd: { le: 15 } },
    { clase: 1, rd: { gt: 15, le: 35 } },
    { clase: 2, rd: { gt: 35, le: 45 } },
    { clase: 3, rd: { gt: 45 } },
  ] satisfies { clase: 0 | 1 | 2 | 3; rd: Intervalo }[],
);

export type LocalizacionSuelo =
  | "interior_seco"
  | "interior_humedo" // entradas desde el exterior (nota 1), terrazas cubiertas, vestuarios, baños, aseos, cocinas…
  | "exterior_piscina_ducha";

/** Tabla 1.2 — Clase exigible «como mínimo». Pendiente: «menor que el 6 %» / «igual o mayor que el 6 % y escaleras». */
export const CLASE_EXIGIBLE_TABLA_1_2 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 1 ap. 1 pto 3", tabla: "Tabla 1.2" },
  {
    umbralPendiente_pct: 6,
    clases: {
      interior_seco: { pendienteMenor6: 1, pendiente6oEscalera: 2 },
      interior_humedo: { pendienteMenor6: 2, pendiente6oEscalera: 3 },
      exterior_piscina_ducha: { pendienteMenor6: 3, pendiente6oEscalera: 3 },
    },
    notas: {
      "1": "Excepto cuando se trate de accesos directos a zonas de uso restringido.",
      "2": "En zonas previstas para usuarios descalzos y en el fondo de los vasos, en las zonas en las que la profundidad no exceda de 1,50 m.",
    },
  },
);

// ---------------------------------------------------------------------------
// Ap. 2 — Discontinuidades (no en uso restringido ni en exteriores)
// ---------------------------------------------------------------------------

export const DISCONTINUIDADES = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 1 ap. 2 ptos 1 a 3" },
  {
    resaltoJuntaMax_mm: 4, // «de más de 4 mm» prohibido → ≤ 4
    salientePuntualMax_mm: 12,
    salienteConAngulo_mm: 6, // si excede de 6 mm → ángulo ≤ 45º
    anguloSalienteMax_grados: 45,
    desnivelConPendiente_cm: 5, // «que no excedan de 5 cm»
    pendienteDesnivelMax_pct: 25,
    esferaPerforacion_cm: 1.5,
    barreraDelimitacionMin_cm: 80,
    /** Excepciones al escalón aislado o a dos consecutivos (nunca en itinerario accesible). */
    escalonAisladoPermitidoEn: [
      "uso_restringido",
      "zonas_comunes_residencial_vivienda",
      "accesos_y_salidas_del_edificio",
      "acceso_estrado_escenario",
    ] as const,
  },
);

// ---------------------------------------------------------------------------
// Ap. 3 — Desniveles y barreras de protección
// ---------------------------------------------------------------------------

export const BARRERAS = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 1 ap. 3.1 y 3.2.1, 3.2.3" },
  {
    /** Hay barrera si la diferencia de cota es MAYOR que 55 cm. */
    desnivelConBarrera_cm: { gt: 55 } satisfies Intervalo,
    /** 0,90 m si la diferencia de cota «no exceda de 6 m»; 1,10 m en el resto. */
    alturaMin_m: { hasta6m: 0.9, masDe6m: 1.1 },
    umbralCota_m: 6,
    /** Huecos de escalera de anchura MENOR que 40 cm: 0,90 m sea cual sea la caída. */
    huecoEscaleraEstrecho_cm: { lt: 40 } satisfies Intervalo,
    alturaHuecoEscaleraEstrecho_m: 0.9,
    /** 3.2.3: cualquier zona de Residencial Vivienda (y escuelas infantiles; uso público de Comercial/PC). */
    noEscalable: {
      franjaSinApoyos_cm: [30, 50] as const, // ni salientes horizontales de más de 5 cm
      salienteMaxEnFranja1_cm: 5,
      franjaSinSalientes_cm: [50, 80] as const, // ni superficies horizontales de más de 15 cm de fondo
      fondoMaxEnFranja2_cm: 15,
    },
    esferaAberturas_cm: 10,
    limiteInferiorBarandillaMax_cm: 5, // distancia a la línea de inclinación
    /** Zonas de uso público de otros usos (oficinas): solo la condición b), con esfera de 15 cm. */
    esferaAberturasOtrosUsosPublico_cm: 15,
    /** 3.1 pto 2: solo uso público; desniveles ≤ 55 cm; diferenciación desde 25 cm del borde. */
    senalizacionUsoPublico_cm: 25,
  },
);

/** Altura mínima de barrera [m] (SUA 1-3.2.1). */
export function alturaBarreraMin_m(difCota_m: number, huecoEscalera_cm?: number): number | null {
  if (difCota_m <= 0.55) return null; // no exigible por 3.1 (≤ 55 cm)
  if (huecoEscalera_cm !== undefined && huecoEscalera_cm < 40) return 0.9;
  return difCota_m <= 6 ? 0.9 : 1.1;
}

// ---------------------------------------------------------------------------
// Ap. 4.1 — Escaleras de uso restringido
// ---------------------------------------------------------------------------

export const ESCALERA_USO_RESTRINGIDO = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 1 ap. 4.1" },
  {
    anchuraMin_m: 0.8,
    contrahuellaMax_cm: 20,
    huellaMin_cm: 22,
    curva: {
      medirEnEjeSiAnchuraMenorQue_m: 1, // si es mayor: a 50 cm del lado estrecho
      distanciaLadoEstrecho_cm: 50,
      huellaMinLadoEstrecho_cm: 5,
      huellaMaxLadoAncho_cm: 44,
    },
    sinTabicaSuperposicionMin_cm: 2.5,
    mesetasPartidasA45: true,
    barandillaEnLadosAbiertos: true,
  },
);

// ---------------------------------------------------------------------------
// Ap. 4.2 — Escaleras de uso general
// ---------------------------------------------------------------------------

export const ESCALERA_USO_GENERAL = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 1 ap. 4.2.1 a 4.2.4" },
  {
    huellaMinRecto_cm: 28,
    contrahuellaMin_cm: 13,
    /** 18,5 en uso privado con ascensor como alternativa; 17,5 en uso público o sin ascensor. */
    contrahuellaMax_cm: { conAscensorUsoPrivado: 18.5, usoPublicoOSinAscensor: 17.5 },
    relacion2CmasH_cm: { ge: 54, le: 70 } satisfies Intervalo,
    bocel: false,
    tabicaInclinacionMax_grados: 15, // obligatoria en evacuación ascendente o sin itinerario accesible alternativo
    curva: { huellaMinA50cmInterior_cm: 28, huellaMaxBordeExterior_cm: 44, distancia_cm: 50 },
    peldanosMinPorTramo: 3, // salvo SUA 1-2 pto 3
    alturaTramoMax_m: { conAscensorUsoPrivado: 3.2, usoPublicoOSinAscensor: 2.25 },
    variacionContrahuellaEntrePlantasMax_cm: 1, // «±1 cm»
    pasamanosSinDescontarSiVuelo_cm: { le: 12 } satisfies Intervalo,
    curvaExcluirHuellaMenorQue_cm: 17,
    meseta: { longitudMinEje_m: 1.0, usoPublico: { pasilloMin_m: 1.2, puertaMinPrimerPeldano_cm: 40 } },
    pasamanos: {
      exigibleSiAlturaSalvada_cm: { gt: 55 } satisfies Intervalo, // al menos en un lado
      ambosLadosSiAnchuraLibre_m: { gt: 1.2 } satisfies Intervalo, // o si no hay ascensor alternativo
      intermedioSiAnchura_m: { gt: 4 } satisfies Intervalo,
      separacionIntermediosMax_m: 4,
      prolongacion_cm: 30, // uso público o sin ascensor, al menos en un lado
      altura_cm: { ge: 90, le: 110 } satisfies Intervalo,
      separacionParamentoMin_cm: 4,
    },
  },
);

/** Tabla 4.1 — Anchura útil mínima [m] por número de personas previstas: ≤25 | ≤50 | ≤100 | >100. */
export const ANCHURA_ESCALERA_TABLA_4_1 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 1 ap. 4.2.2 pto 4", tabla: "Tabla 4.1" },
  {
    columnas: [{ le: 25 }, { le: 50 }, { le: 100 }, { gt: 100 }] satisfies Intervalo[],
    filas: {
      /** «Residencial Vivienda, incluso escalera de comunicación con aparcamiento»; nota (1). */
      residencial_vivienda: [1.0, 1.0, 1.0, 1.0],
      /** «Docente con escolarización infantil o de enseñanza primaria; Pública concurrencia y Comercial»; nota (2) en ≤25 y ≤50. */
      docente_infantil_primaria_pc_comercial: [0.8, 0.9, 1.0, 1.1],
      sanitario_pacientes_giros_90: [1.4, 1.4, 1.4, 1.4],
      sanitario_otras_zonas: [1.2, 1.2, 1.2, 1.2],
      /** «Casos restantes» (p. ej. Administrativo); nota (2) en ≤25 y ≤50. */
      casos_restantes: [0.8, 0.9, 1.0, 1.0],
    },
    /** Nota (2): si la escalera comunica con una zona accesible, ≥ 1,00 m. */
    minimoSiComunicaZonaAccesible_m: 1.0,
    notas: {
      "1": "En edificios existentes, cuando se trate de instalar un ascensor que permita mejorar las condiciones de accesibilidad para personas con discapacidad, se puede admitir una anchura menor siempre que se acredite la no viabilidad técnica y económica de otras alternativas que no supongan dicha reducción de anchura y se aporten las medidas complementarias de mejora de la seguridad que en cada caso se estimen necesarias.",
      "2": "Excepto cuando la escalera comunique con una zona accesible, cuyo ancho será de 1,00 m como mínimo.",
    },
  },
);

// ---------------------------------------------------------------------------
// Ap. 4.3 — Rampas (no uso restringido; las de vehículos+personas solo la pendiente de 4.3.1 b y SUA 7)
// ---------------------------------------------------------------------------

export const RAMPAS = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 1 ap. 4.3" },
  {
    esRampaSiPendiente_pct: { gt: 4 } satisfies Intervalo,
    pendienteMax_pct: {
      general: 12,
      /** Itinerario accesible, por longitud del tramo en proyección horizontal. */
      accesible: [
        { longitud_m: { lt: 3 } satisfies Intervalo, max: 10 },
        { longitud_m: { ge: 3, lt: 6 } satisfies Intervalo, max: 8 },
        { longitud_m: { ge: 6 } satisfies Intervalo, max: 6 },
      ],
      /** Vehículos en aparcamientos también previstas para personas, fuera de itinerario accesible. */
      aparcamientoVehiculosYPersonas: 16,
    },
    pendienteTransversalAccesibleMax_pct: 2,
    tramoMax_m: { general: 15, accesible: 9, aparcamientoVehiculosYPersonas: null },
    accesible: { anchuraMin_m: 1.2, radioCurvaturaMin_m: 30, horizontalExtremos_m: 1.2 },
    meseta: { mismaDireccionLongitudMin_m: 1.5, pasilloMin_m: 1.2, puertaMin_cm: 40, puertaMinAccesible_m: 1.5 },
    pasamanos: {
      unLadoSi: { desnivel_mm: { gt: 550 }, pendiente_pct: { ge: 6 } },
      accesibleAmbosLadosSi: { desnivel_cm: { gt: 18.5 }, pendiente_pct: { ge: 6 } },
      zocaloMin_cm: 10,
      prolongacionSiTramo_m: { gt: 3 } satisfies Intervalo,
      prolongacion_cm: 30,
      altura_cm: { ge: 90, le: 110 } satisfies Intervalo,
      alturaSegundoAccesible_cm: { ge: 65, le: 75 } satisfies Intervalo,
      separacionParamentoMin_cm: 4,
    },
  },
);

// ---------------------------------------------------------------------------
// Ap. 5 — Limpieza de acristalamientos (solo Residencial Vivienda)
// ---------------------------------------------------------------------------

export const LIMPIEZA_ACRISTALAMIENTOS = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 1 ap. 5" },
  {
    alturaSobreRasante_m: { gt: 6 } satisfies Intervalo,
    soloVidrioTransparente: true,
    radioAlcance_m: 0.85,
    alturaMaxPuntoBorde_m: 1.3,
    reversiblesConBloqueo: true,
  },
);

// ---------------------------------------------------------------------------
// Helpers (los límites salen de las tablas de arriba)
// ---------------------------------------------------------------------------

export function contrahuellaMax_cm(usoPublico: boolean, ascensorAlternativa: boolean): number {
  return !usoPublico && ascensorAlternativa ? 18.5 : 17.5;
}

export function alturaTramoMax_m(usoPublico: boolean, ascensorAlternativa: boolean): number {
  return !usoPublico && ascensorAlternativa ? 3.2 : 2.25;
}

export function pasamanosAmbosLados(anchuraLibre_m: number, ascensorAlternativa: boolean): boolean {
  return anchuraLibre_m > 1.2 || !ascensorAlternativa;
}

export function pendienteMaxRampa_pct(
  tipo: "general" | "accesible" | "aparcamiento_mixta",
  longitud_m: number,
): number {
  if (tipo === "aparcamiento_mixta") return 16;
  if (tipo === "general") return 12;
  return longitud_m < 3 ? 10 : longitud_m < 6 ? 8 : 6;
}

// ---------------------------------------------------------------------------
// CRITERIOS (no CTE): fuera de tablaCTE para que la ficha no los cite como DB
// ---------------------------------------------------------------------------

export const CRITERIOS_SUA1 = {
  contrahuellaDeCalculo_cm: 17.5, // K2
  objetivo2CmasH_cm: 63, // K3
  tramosPorPlanta: 2, // K4
  alturaBarreraTerrazas_m: 1.1, // K6
  anchuraEscaleraComun_m: 1.0, // E7
  anchuraEscaleraInterior_m: 0.9, // E11
  alturaPasamanos_m: 0.95, // E9
  dintelTipico_m: 2.2, // K10
} as const;
```
