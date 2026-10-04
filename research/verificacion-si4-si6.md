# Verificación normativa — DB-SI, SI 4, SI 5, SI 6, Anejo C y Anejo F, para los módulos SI4, SI5 y SI6 (feature-19)

**Fecha:** 2026-10-04 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** parte C del encargo (preguntas C1 a C7), en el mismo orden. Del Anejo SI A solo se han leído las definiciones que hacen falta aquí. SI 1, SI 2, SI 3 y el resto del Anejo SI A son de los otros dos agentes; cuando una respuesta depende de ellos, se cita y se marca.

**Regla aplicada:** ninguna cifra se da por buena sin leerla en la **imagen** de la página. El texto extraído pierde los signos ≤ y ≥, los superíndices de las notas, la estructura de las casillas y algún símbolo (el «ϕ» de SI 5). Veredictos:
- **VERIFICADO**: literal en el DB, leído en la imagen de [SI25] y coincidente con el texto de [SI25] y de [DccSI].
- **LEÍDO (1 fuente)**: literal en una sola fuente, o leído a través de un extractor web (BOE).
- **CORREGIDO**: la afirmación del encargo, de una memoria típica o del repo no coincide con el DB.
- **NO VERIFICABLE**: el DB no lo dice, o no se ha podido leer con seguridad.
- **INTERPRETACIÓN**: lectura que el DB no escribe tal cual pero que se sigue de él. Se puede mostrar, rotulada.
- **CRITERIO**: decisión de proyecto propuesta. No es exigencia del CTE y la ficha la rotula así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [SI25] | CTE DB-SI «Seguridad en caso de incendio», texto consolidado | «4 marzo 2025» (incluye RD 164/2025) | `research/pdf/DBSI.pdf` (codigotecnico.org) | **Imagen** a 200 ppp: pp. 32, 33, 34 (tabla 1.1 de SI 4), 36, 37 (SI 5), 38, 39 (SI 6, tablas 3.1 y 3.2), 58, 59, 60 (tablas C.2 a C.5), 85 (Anejo F), 14 (SI 1 tabla 2.1, solo para cruzar). Imagen a 130 ppp: pp. 35 (notas de la tabla 1.1 y SI 4 ap. 2), 40, 41 (SI 6), 42 (Anejo SI A), 57 (tabla C.1), 61 (C.2.3.5 y C.2.4). Prosa: texto extraído (`DBSI.txt`) |
| [DccSI] | DB-SI con comentarios del Ministerio | Articulado 4-mar-2025; comentarios 4-mar-2025 | `research/pdf/DccSI.pdf` | Texto (`DccSI.txt`) e imágenes de pp. 58 y 61. Los comentarios van sangrados con una raya vertical a la izquierda; así se distinguen del articulado |
| [BOE19] | RD 732/2019 (BOE-A-2019-18528) | Original | boe.es, vía extractor | Qué cambió en SI 4 ap. 2 |
| [BOE25] | RD 164/2025 (BOE-A-2025-7190) | Original | boe.es, vía extractor | Qué secciones del DB-SI modifica |
| [RIPCI] | RD 513/2017, Reglamento de instalaciones de protección contra incendios (BOE-A-2017-6606) | Texto original de 2017 (`txt.php`), no el consolidado | boe.es, vía extractor | Señalización (Anexo I, Sección 2.ª), extintores, hidrantes y columna seca |
| [REPO] | `src/modules/si/edificio.ts`, `src/modules/si/tipos.ts`, `src/lib/edificio/derivar.ts`, `src/lib/cte/tabla.ts`, `feature-19.md` | Estado actual | repo | Lo que ya existe |

Avisos de los propios documentos:
- [SI25] p. 2: «Este texto consolidado no tiene valor jurídico.» Disposiciones que recoge: RD 314/2006; RD 1371/2007; corrección de errores (BOE 25-01-2008); Orden VIV/984/2009; RD 173/2010; Sentencia del TS de 4-5-2010; RD 732/2019; RD 164/2025.
- [DccSI] p. 2: «Los comentarios tienen un carácter orientativo e informativo no teniendo carácter reglamentario.» En este fichero cada comentario va rotulado «comentario, no reglamentario».

Límites de la lectura:
- No hay poppler: los PDF del BOE no se pueden renderizar. El BOE se ha leído a través de un extractor que resume; sus citas literales son cortas.
- La nota (2) de la tabla C.4 («siendo Iy > Ix») es pequeña; a 200 ppp el signo se lee «>». Coincide con el sentido de la tabla.
- No se ha leído la norma UNE 23033-1 (tamaños de las señales) ni el Anejo III de la Parte I del CTE.

---

## Bloque C1 — SI 4 ap. 1: dotación de instalaciones

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C1.1 | Qué exige el ap. 1 | VERIFICADO | Las instalaciones de la tabla 1.1. Su diseño, ejecución, puesta en funcionamiento, mantenimiento, materiales y equipos, por el Reglamento de Instalaciones de Protección contra Incendios | SI 4 ap. 1 pto 1: «Los edificios deben disponer de los equipos e instalaciones de protección contra incendios que se indican en la tabla 1.1. El diseño, la ejecución, la puesta en funcionamiento y el *mantenimiento* de dichas instalaciones, así como sus materiales, componentes y equipos, deben cumplir lo establecido en el "Reglamento de Instalaciones de Protección contra Incendios", en sus disposiciones complementarias y en cualquier otra reglamentación específica que le sea de aplicación. La puesta en servicio de estas instalaciones se realizará conforme a lo indicado en el citado reglamento.» | [SI25] p. 32; [DccSI] p. 55 |
| C1.2 | Qué reglamento es | VERIFICADO | El RD 513/2017. El ap. 1 no da el número; lo da el ap. 2 | SI 4 ap. 2 pto 1: «… el vigente Reglamento de instalaciones de protección contra incendios, aprobado por el Real Decreto 513/2017, de 22 de mayo.» | [SI25] p. 35 |
| C1.3 | Locales de riesgo especial y zonas de uso subsidiario | VERIFICADO | Llevan la dotación de su uso o de su grado de riesgo, **nunca menos** que la general del uso principal | SI 4 ap. 1 pto 1, 2.º párrafo: «Los locales de riesgo especial, así como aquellas zonas cuyo *uso previsto* sea diferente y subsidiario del principal del edificio o del *establecimiento* en el que estén integradas y que, conforme a la tabla 1.1 del Capítulo 1 de la Sección 1 de este DB, deban constituir un *sector de incendio* diferente, deben disponer de la dotación de instalaciones que se indica para cada local de riesgo especial, así como para cada zona, en función de su *uso previsto*, pero en ningún caso será inferior a la exigida con carácter general para el uso principal del edificio o del *establecimiento*.» | [SI25] p. 32 |
| C1.4 | Establecimientos de uso distinto dentro de un edificio | **INTERPRETACIÓN** + comentarios | El 2.º párrafo habla de zonas **subsidiarias**, no de establecimientos. Para un establecimiento (un local comercial, unas oficinas con otro titular) se lee la fila de **su** uso, porque la cabecera de la tabla es «*Uso previsto* del edificio o *establecimiento*». Los comentarios lo confirman (ver nota C1.4) | Cabecera de la tabla 1.1; Anejo SI A, «Establecimiento» | [SI25] pp. 32, 45; [DccSI] pp. 55, 58, 59 |
| C1.5 | Tabla 1.1, filas pedidas | VERIFICADO | Ver la transcripción siguiente | Tabla 1.1 | [SI25] pp. 32–35, imagen; [DccSI] pp. 55–58, texto |
| C1.6 | Comparaciones | VERIFICADO (literal) + **INTERPRETACIÓN** en «comprendida entre» | «excede de», «mayor que», «más de» → **estricto** (>). «comprendida entre A y B» → se lee **A ≤ S ≤ B**, y por encima de B se suman hidrantes («uno más por cada 10.000 m² adicionales o fracción»). El DB no dice si A está incluido; incluirlo es lo prudente | Casillas de la tabla 1.1 | [SI25] |
| C1.7 | ¿Superficie construida o útil? | VERIFICADO | **Construida** en todas las casillas con superficie. Residencial Vivienda, Administrativo y Comercial dicen «superficie **total** construida» en hidrantes | Tabla 1.1 | [SI25] |
| C1.8 | ¿El ascensor de emergencia está en SI 4 o en SI 5? | VERIFICADO | En **SI 4**, fila «En general»: «En las plantas cuya *altura de evacuación* exceda de 28 m». Sus características, en el Anejo SI A (ver nota C1.8). SI 5 no lo trata | Tabla 1.1, «En general» | [SI25] pp. 32, 42 |
| C1.9 | Hidrantes «En general» (afecta a viviendas y garajes) | VERIFICADO | Hay hidrante si la altura de evacuación **descendente > 28 m** o la **ascendente > 6 m**, aunque la superficie no llegue al umbral del uso. Un edificio con dos sótanos de garaje de más de 3,00 m de altura entre suelos ya pasa de 6 m | Tabla 1.1, «En general», hidrantes | [SI25] p. 32 |
| C1.10 | ¿Cuenta la vía pública? | VERIFICADO | Sí: los hidrantes de la vía pública a **menos de 100 m de la fachada accesible** cuentan en la dotación | Nota (3) | [SI25] p. 35 |
| C1.11 | Columna seca: sustitución municipal | VERIFICADO | El municipio puede cambiarla por BIE | Nota (5) | [SI25] p. 35 |
| C1.12 | BIE: diámetro | VERIFICADO | 45 mm en «En general» (zonas de riesgo especial alto), **25 mm en Residencial Vivienda**; 25 mm en Administrativo, Comercial y Aparcamiento | Notas (2) y (7) | [SI25] p. 35 |
| C1.13 | Garaje y otro uso en el mismo edificio | LEÍDO (1 fuente, comentario no reglamentario) | La tabla se aplica **por separado** al aparcamiento y al otro uso: la superficie del garaje no suma a la de viviendas, ni al revés | [DccSI] p. 58, «Dotación de instalaciones en establecimientos con aparcamientos»: «Cuando un edificio o establecimiento integra un aparcamiento y otro uso (vivienda, administrativo, etc.) la dotación de instalaciones conforme a la Tabla 1.1 se aplica independientemente a uno y otro.» | [DccSI] |
| C1.14 | Columna seca en aparcamiento: qué «plantas» | LEÍDO (1 fuente, comentario no reglamentario) | Cuenta la **máxima diferencia de cotas**, no cuántas plantas son de garaje. Un garaje solo en la −4 (con trasteros en la −1 a −3) tiene «más de tres plantas bajo rasante» | [DccSI] p. 59, «Límite de plantas para la instalación de columna seca en aparcamientos»: «… el límite de plantas establecido en la tabla no se refiere al número de ellas dedicadas a uso aparcamiento, con independencia de su ubicación, sino a la máxima diferencia de cotas.» | [DccSI] |
| C1.15 | Detección en garajes de menos de 500 m² | VERIFICADO (SI 3) + comentario | La tabla 1.1 pide detección > 500 m², pero **SI 3 ap. 8** pide que la ventilación mecánica de un garaje no abierto se active «mediante una instalación de detección». En la práctica, todo garaje no abierto con ventilación mecánica lleva detección | SI 3 ap. 8 pto 2 a): «… debe activarse automáticamente en caso de incendio mediante una instalación de detección.» [DccSI] p. 58, «Dotación de sistema de detección de incendio en aparcamientos» (comentario): «… un aparcamiento con superficie superior a 100 m² y que no tenga la consideración de "aparcamiento abierto" … requerirá la instalación de un sistema de detección que active la ventilación necesaria para el cumplimiento del apartado SI3-8.» | [SI25] pp. 30–31 (texto; SI 3 es de otro agente); [DccSI] |
| C1.16 | Local sin uso en PB | LEÍDO (1 fuente, comentario no reglamentario) | Es una **obra inacabada**: su dotación se justificará con el proyecto de su actividad. Hoy solo se puede dejar «previsto» | [DccSI] p. 6, comentario «Local diáfano sin uso»: «Un local diáfano sin ningún uso declarado es, a efectos del CTE, una obra inacabada. El proyecto y obra de terminación de dicho local para un uso determinado debe cumplir … todas las exigencias del CTE vigentes en el momento de solicitar licencia para dicha obra (no para la obra inicial), incluidas las de seguridad en caso de incendio, particularizadas para el uso en cuestión.» | [DccSI] |
| C1.17 | Vivienda unifamiliar: ¿extintores? | **INTERPRETACIÓN** (sin comentario del Ministerio) | **Ninguno por la regla de los 15 m**: el interior de una vivienda no es origen de evacuación y la unifamiliar no tiene otra cosa. **Sí uno si tiene garaje integrado**, porque ese garaje es zona de riesgo especial bajo «en todo caso» y la fila «En general» pide extintor en las zonas de riesgo especial, con la nota (1). Residencial Vivienda (que incluye la unifamiliar) no pide nada más hasta 24 m | Anejo SI A, «Origen de evacuación»; SI 1 tabla 2.1: «Aparcamiento de vehículos cuya superficie S no exceda de 100 m² o integrado en una vivienda unifamiliar. — En todo caso» (riesgo bajo); tabla 1.1, «En general» | [SI25] pp. 14, 32, 46 |
| C1.18 | Plurifamiliar: ¿dónde van los extintores? | **INTERPRETACIÓN** | Origen de evacuación es todo punto ocupable **fuera** de las viviendas: rellanos, pasillos y portal de cada planta; el garaje (cada plaza); las zonas de ocupación nula de **más de 50 m²** (p. ej. una zona de trasteros grande) y los locales de riesgo especial. Hace falta un extintor 21A-113B a ≤ 15 m de recorrido de cada uno de esos puntos, **en cada planta**, y además los de la nota (1) en cada local de riesgo especial. Lo habitual: uno en el rellano de cada planta, los del garaje con la regla de 15 m y uno junto a la puerta de cada cuarto de riesgo especial (puede servir a varios) | Anejo SI A, «Origen de evacuación» (literal en nota C1.18); tabla 1.1, «En general»; nota (1) | [SI25] pp. 32, 35, 46 |
| C1.19 | Altura y señalización del extintor (RIPCI) | LEÍDO (1 fuente, vía extractor) | Parte superior entre **80 y 120 cm** sobre el suelo; recorrido horizontal ≤ 15 m desde cualquier punto del sector que sea origen de evacuación; señalizado según el Anexo I, Sección 2.ª | [RIPCI] Anexo I, Sección 1.ª, ap. 4: «… de modo que la parte superior del extintor quede situada entre 80 cm y 120 cm sobre el suelo.» «… el recorrido máximo horizontal, desde cualquier punto del sector de incendio, que deba ser considerado origen de evacuación, hasta el extintor, no supere 15 m.» | [RIPCI] |
| C1.20 | Columna seca (RIPCI) y acceso del camión (SI 5) | LEÍDO (1 fuente, vía extractor) + VERIFICADO | Bocas a 0,90 m del suelo (RIPCI). El camión de bombeo a menos de 18 m de cada toma, visible (SI 5 ap. 1.2 pto 4) | [RIPCI] Anexo I, Sección 1.ª, ap. 6: «La toma situada en el exterior y las salidas en las plantas tendrán el centro de sus bocas a 0,90 m sobre el nivel del suelo.» | [RIPCI]; [SI25] p. 37 |
| C1.21 | Hidrantes (RIPCI) | LEÍDO (1 fuente, vía extractor) + **NO VERIFICABLE** el punto de origen | «La distancia de recorrido real, medida horizontalmente, a cualquier hidrante, será inferior a 100 m en zonas urbanas y 40 m en el resto.» El extractor no da desde dónde se mide | [RIPCI] Anexo I, Sección 1.ª, ap. 3 | [RIPCI] |

### Tabla 1.1 — Dotación de instalaciones de protección contra incendios ([SI25] pp. 32–35)

Transcripción literal, casilla a casilla, de las filas que pide el modelo. ⁽ⁿ⁾ = nota del pie. Cursivas del DB omitidas.

**En general** (pp. 32–33)

| Instalación | Condiciones (literal) |
|---|---|
| Extintores portátiles | «Uno de eficacia 21A -113B: — A 15 m de recorrido en cada planta, como máximo, desde todo origen de evacuación. — En las zonas de riesgo especial conforme al capítulo 2 de la Sección 1⁽¹⁾ de este DB.» |
| Bocas de incendio equipadas | «En zonas de riesgo especial alto, conforme al capítulo 2 de la Sección SI1, en las que el riesgo se deba principalmente a materias combustibles sólidas⁽²⁾» |
| Ascensor de emergencia | «En las plantas cuya altura de evacuación exceda de 28 m» |
| Hidrantes exteriores | «Si la altura de evacuación descendente excede de 28 m o si la ascendente excede de 6 m, así como en establecimientos de densidad de ocupación mayor que 1 persona cada 5 m² y cuya superficie construida está comprendida entre 2.000 y 10.000 m². Al menos un hidrante hasta 10.000 m² de superficie construida y uno más por cada 10.000 m² adicionales o fracción.⁽³⁾» |
| Instalación automática de extinción | «Salvo otra indicación en relación con el uso, en todo edificio cuya altura de evacuación exceda de 80 m.» · «En cocinas en las que la potencia instalada exceda de 20 kW en uso Hospitalario o Residencial Público o de 50 kW en cualquier otro uso⁽⁴⁾» · «En centros de transformación cuyos aparatos tengan aislamiento dieléctrico con punto de inflamación menor que 300 ºC y potencia instalada mayor que 1 000 kVA en cada aparato o mayor que 4 000 kVA en el conjunto de los aparatos. Si el centro está integrado en un edificio de uso Pública concurrencia y tiene acceso desde el interior del edificio, dichas potencias son 630 kVA y 2 520 kVA respectivamente.» |

**Residencial Vivienda** (p. 33)

| Instalación | Condiciones (literal) |
|---|---|
| Columna seca⁽⁵⁾ | «Si la altura de evacuación excede de 24 m.» |
| Sistema de detección y de alarma de incendio | «Si la altura de evacuación excede de 50 m.⁽⁶⁾» |
| Hidrantes exteriores | «Uno si la superficie total construida esté comprendida entre 5.000 y 10.000 m². Uno más por cada 10.000 m² adicionales o fracción.⁽³⁾» — «esté» y un signo «¨» tras la nota son erratas tipográficas de ambas fuentes |

**Administrativo** (p. 33)

| Instalación | Condiciones (literal) |
|---|---|
| Bocas de incendio equipadas | «Si la superficie construida excede de 2.000 m². ⁽⁷⁾» |
| Columna seca⁽⁵⁾ | «Si la altura de evacuación excede de 24 m.» |
| Sistema de alarma⁽⁶⁾ | «Si la superficie construida excede de 1.000 m².» |
| Sistema de detección de incendio | «Si la superficie construida excede de 2.000 m², detectores en zonas de riesgo alto conforme al capítulo 2 de la Sección 1 de este DB. Si excede de 5.000 m², en todo el edificio.» |
| Hidrantes exteriores | «Uno si la superficie total construida está comprendida entre 5.000 y 10.000 m². Uno más por cada 10.000 m² adicionales o fracción.⁽³⁾» |

**Comercial** (p. 34) — para lo que se deja previsto en un local

| Instalación | Condiciones (literal) |
|---|---|
| Extintores portátiles | «En toda agrupación de locales de riesgo especial medio y alto cuya superficie construida total excede de 1.000 m², extintores móviles de 50 kg de polvo, distribuidos a razón de un extintor por cada 1 000 m² de superficie que supere dicho límite o fracción.» |
| Bocas de incendio equipadas | «Si la superficie construida excede de 500 m².⁽⁷⁾» |
| Columna seca⁽⁵⁾ | «Si la altura de evacuación excede de 24 m.» |
| Sistema de alarma⁽⁶⁾ | «Si la superficie construida excede de 1.000 m².» |
| Sistema de detección de incendio⁽⁹⁾ | «Si la superficie construida excede de 2.000 m². ⁽⁸⁾» |
| Instalación automática de extinción | «Si la superficie total construida del área pública de ventas excede de 1.500 m² y en ella la densidad de carga de fuego ponderada y corregida aportada por los productos comercializados es mayor que 500 MJ/m², contará con la instalación, tanto el área pública de ventas, como los locales y zonas de riesgo especial medio y alto conforme al capítulo 2 de la Sección 1 de este DB.» |
| Hidrantes exteriores | «Uno si la superficie total construida está comprendida entre 1 000 y 10 000 m². Uno más por cada 10 000 m² adicionales o fracción.⁽³⁾» |

**Aparcamiento** (pp. 34–35)

| Instalación | Condiciones (literal) |
|---|---|
| Bocas de incendio equipadas | «Si la superficie construida excede de 500 m².⁽⁷⁾ Se excluyen los aparcamientos robotizados.» |
| Columna seca⁽⁵⁾ | «Si existen más de tres plantas bajo rasante o más de cuatro sobre rasante, con tomas en todas sus plantas.» |
| Sistema de detección de incendio | «En aparcamientos convencionales cuya superficie construida exceda de 500 m².⁽⁸⁾ Los aparcamientos robotizados dispondrán de pulsadores de alarma en todo caso.» |
| Hidrantes exteriores | «Uno si la superficie construida está comprendida entre 1.000 y 10.000 m² y uno más cada 10.000 m² más o fracción.⁽³⁾» |
| Instalación automática de extinción | «En todo aparcamiento robotizado.» |

**Notas de la tabla 1.1** (p. 35, literal)
- ⁽¹⁾ «Un extintor en el exterior del local o de la zona y próximo a la puerta de acceso, el cual podrá servir simultáneamente a varios locales o zonas. En el interior del local o de la zona se instalarán además los extintores necesarios para que el recorrido real hasta alguno de ellos, incluido el situado en el exterior, no sea mayor que 15 m en locales y zonas de riesgo especial medio o bajo, o que 10 m en locales o zonas de riesgo especial alto.»
- ⁽²⁾ «Los equipos serán de tipo 45 mm, excepto en edificios de uso Residencial Vivienda, en lo que serán de tipo 25 mm.»
- ⁽³⁾ «Para el cómputo de la dotación que se establece se pueden considerar los hidrantes que se encuentran en la vía pública a menos de 100 m de la fachada accesible del edificio. Los hidrantes que se instalen pueden estar conectados a la red pública de suministro de agua.»
- ⁽⁴⁾ «Para la determinación de la potencia instalada sólo se considerarán los aparatos directamente destinados a la preparación de alimentos y susceptibles de provocar ignición. Las freidoras y las sartenes basculantes se computarán a razón de 1 kW por cada litro de capacidad, independientemente de la potencia que tengan. La protección aportada por la instalación automática cubrirá los aparatos antes citados y la eficacia del sistema debe quedar asegurada teniendo en cuenta la actuación del sistema de extracción de humos.»
- ⁽⁵⁾ «Los municipios pueden sustituir esta condición por la de una instalación de bocas de incendio equipadas cuando, por el emplazamiento de un edificio o por el nivel de dotación de los servicios públicos de extinción existentes, no quede garantizada la utilidad de la instalación de columna seca.»
- ⁽⁶⁾ «El sistema de alarma transmitirá señales visuales además de acústicas. Las señales visuales serán perceptibles incluso en el interior de viviendas accesibles para personas con discapacidad auditiva (ver definición en el Anejo SUA A del DB SUA).»
- ⁽⁷⁾ «Los equipos serán de tipo 25 mm.»
- ⁽⁸⁾ «El sistema dispondrá al menos de detectores de incendio.»
- ⁽⁹⁾ «La condición de disponer detectores automáticos térmicos puede sustituirse por una instalación automática de extinción no exigida.»

Filas de usos fuera del alcance (Residencial Público, Hospitalario, Docente, Pública concurrencia): leídas en imagen (pp. 33–34), **no transcritas** aquí porque el modelo no las usa.

**Nota C1.4 — comentarios sobre el ámbito de la dotación** ([DccSI], no reglamentarios)
- p. 55, «Ámbito a considerar para la dotación de instalaciones»: «Un determinado ámbito (edificio, establecimiento, recinto…) debe estar protegido por una instalación, cuando se exija expresamente para dicho ámbito, en función de su uso, superficie, ocupación, etc., o bien cuando se exija para el ámbito que englobe a aquel, en función de las características de este.»
- p. 59, «Dotación de instalaciones que requieren abastecimiento de agua en un edificio con establecimientos independientes»: «En un edificio dividido en establecimientos independientes entre sí, con accesos independientes desde el espacio exterior y sin zonas comunes, la dotación de instalaciones de protección contra incendios y, por tanto, su fuente de abastecimiento de agua (reserva y presión), se determina para cada establecimiento de forma independiente …»
- p. 58, «Dotación de instalaciones en edificios diferentes de un mismo establecimiento»: dotación «función del uso y de la superficie de cada edificio» si son independientes ante el riesgo de incendio.

**Nota C1.8 — Ascensor de emergencia** (Anejo SI A, [SI25] p. 42, imagen): acceso en cada planta desde una escalera protegida o desde el vestíbulo de independencia de una especialmente protegida, con puerta E30 (no hace falta si se accede desde el recinto de la especialmente protegida); carga **630 kg**; cabina **1,10 × 1,40 m**; paso **1,00 m**; todo el recorrido en **< 60 s**; accesible (DB SUA) y próximo a la zona de refugio si la hay; pulsador «USO EXCLUSIVO BOMBEROS» en la planta de acceso; fuente propia con **1 h** de autonomía; **uno por cada mil ocupantes o fracción**. Comentario [DccSI] p. 69 (no reglamentario): también se puede acceder desde un vestíbulo de independencia que no sea de escalera especialmente protegida o desde un pasillo protegido.

**Nota C1.18 — «Origen de evacuación», literal** (Anejo SI A, [SI25] p. 46): «Es todo punto ocupable de un edificio, exceptuando los del interior de las viviendas y los de todo recinto o conjunto de ellos comunicados entre sí, en los que la densidad de ocupación no exceda de 1 persona/5 m² y cuya superficie total no exceda de 50 m², como pueden ser las habitaciones de hotel, residencia u hospital, los despachos de oficinas, etc. Los puntos ocupables de todos los locales de riesgo especial y los de las zonas de ocupación nula cuya superficie exceda de 50 m², se consideran origen de evacuación … pero no es preciso tomarlos en consideración a efectos de determinar la altura de evacuación de un edificio o el número de ocupantes.» Comentario [DccSI] p. 75 (no reglamentario): en un garaje, el origen de evacuación de una plaza abierta está «en el punto central del límite que separa la plaza de la calle de circulación».

**Nota C1.9 — Altura de evacuación** (Anejo SI A, [SI25] p. 42, imagen): «Máxima diferencia de cotas entre un *origen de evacuación* y la *salida de edificio* que le corresponda. A efectos de determinar la *altura de evacuación* de un edificio no se consideran las plantas más altas del edificio en las que únicamente existan *zonas de ocupación nula*.» Comentario [DccSI] p. 84 (no reglamentario): las plantas de ocupación nula que no se cuentan son solo las **más altas**, «pero sí las más bajas donde existan zonas de ocupación nula». Consecuencia: un sótano solo de trasteros **sí** cuenta para la altura de evacuación ascendente.

---

## Bloque C2 — SI 4 ap. 2: señalización de las instalaciones manuales

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C2.1 | Qué dice el DB vigente | VERIFICADO | Solo remite al RIPCI. **No da tamaños, ni norma de señales, ni fotoluminiscencia** | SI 4 ap. 2 pto 1: «La señalización de las instalaciones manuales de protección contra incendios debe cumplir lo establecido en el vigente Reglamento de instalaciones de protección contra incendios, aprobado por el Real Decreto 513/2017, de 22 de mayo.» | [SI25] p. 35, imagen; [DccSI] p. 59 |
| C2.2 | «Señales de 210 × 210 mm hasta 10 m, 420 × 420 hasta 20 m, 594 × 594 hasta 30 m, según UNE 23033-1; fotoluminiscentes según UNE 23035-4» | **CORREGIDO** | Esa redacción **no está** en el DB vigente. El RD 732/2019 sustituyó los puntos 1 y 2 de SI 4-2 por la remisión al RIPCI. Las cifras antiguas no se han leído en esta sesión: no copiarlas | [BOE19]: el RD 732/2019 sustituye «los puntos 1 y 2» del apartado SI 4-2 por el texto de C2.1 | [BOE19] (vía extractor) |
| C2.3 | Qué dice el RIPCI | LEÍDO (1 fuente, vía extractor) | Anexo I, «Sección 2.ª Sistemas de señalización luminiscente», 4 apartados. Señales de los medios manuales y de alarma: **UNE 23033-1**. Fotoluminiscentes: **UNE 23035-4** (categorías A o B); **categoría A** en los centros del anexo I de la Norma Básica de Autoprotección. Pueden ser fotoluminiscentes o alimentadas eléctricamente; estas últimas, con evaluación técnica favorable mientras no haya norma. **No da tamaños** | [RIPCI] Anexo I, Sección 2.ª: «La señalización de los medios de protección contra incendios de utilización manual y de los sistemas de alerta y alarma, deberán cumplir la norma UNE 23033-1.» «Los sistemas de señalización fotoluminiscente serán conformes a la UNE 23035-4, en cuanto a características, composición, propiedades, categorías (A o B).» | [RIPCI] |
| C2.4 | Tamaños por distancia de observación | **NO VERIFICABLE** | Están (si están) en la UNE 23033-1, que no se ha leído | — | — |
| C2.5 | No confundir con SI 3-7 | VERIFICADO | Las señales **de evacuación** (SI 3 ap. 7 pto 2) sí citan las UNE 23035-1, -2, -4 y -3. Es otra exigencia y es de otro agente | SI 3 ap. 7 pto 2: «… Cuando sean fotoluminiscentes deben cumplir lo establecido en las normas UNE 23035-1:2003, UNE 23035-2:2003 y UNE 23035-4:2003 y su mantenimiento se realizará conforme a lo establecido en la norma UNE 23035-3:2003.» | [SI25] p. 30 (texto) |

Frase de memoria propuesta: «La señalización de las instalaciones manuales de protección contra incendios cumple el Reglamento de instalaciones de protección contra incendios (RD 513/2017), Anexo I, Sección 2.ª (CTE DB-SI, SI 4 ap. 2).» Sin cifras.

---

## Bloque C3 — SI 5: intervención de los bomberos

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C3.1 | Vial de aproximación | VERIFICADO | Anchura mínima libre **3,5 m**; altura mínima libre o gálibo **4,5 m**; capacidad portante **20 kN/m²** | SI 5 ap. 1.1 pto 1: «Los viales de aproximación de los vehículos de los bomberos a los espacios de maniobra a los que se refiere el apartado 1.2, deben cumplir las condiciones siguientes: a) anchura mínima libre 3,5 m; b) altura mínima libre o gálibo 4,5 m; c) capacidad portante del vial 20 kN/m².» | [SI25] p. 36, imagen; [DccSI] p. 60 |
| C3.2 | Tramos curvos | VERIFICADO | Corona circular de radios mínimos **5,30 m** y **12,50 m**, anchura libre de circulación **7,20 m** | ap. 1.1 pto 2: «En los tramos curvos, el carril de rodadura debe quedar delimitado por la traza de una corona circular cuyos radios mínimos deben ser 5,30 m y 12,50 m, con una anchura libre para circulación de 7,20 m.» | [SI25] p. 36 |
| C3.3 | ¿A qué edificios se aplica el 1.1? | **INTERPRETACIÓN** | A los viales que llevan a los espacios de maniobra **del 1.2**; luego, solo cuando hay espacio de maniobra exigido (altura de evacuación descendente > 9 m) | «… a los espacios de maniobra a los que se refiere el apartado 1.2» | [SI25] |
| C3.4 | Umbral del 1.2 | VERIFICADO | Altura de evacuación **descendente mayor que 9 m** (estricto: 9,00 m no lo activa) | ap. 1.2 pto 1: «Los edificios con una altura de evacuación descendente mayor que 9 m deben disponer de un espacio de maniobra para los bomberos que cumpla las siguientes condiciones a lo largo de las fachadas en las que estén situados los accesos, o bien al interior del edificio, o bien al espacio abierto interior en el que se encuentren aquellos:» | [SI25] p. 36 |
| C3.5 | Espacio de maniobra | VERIFICADO | a) anchura mínima libre **5 m**; b) altura libre **la del edificio**; c) separación máxima del vehículo a la fachada: **23 m** hasta 15 m de altura de evacuación; **18 m** de más de 15 m hasta 20 m; **10 m** de más de 20 m; d) distancia máxima hasta los accesos necesarios para llegar a todas sus zonas **30 m**; e) pendiente máxima **10 %**; f) resistencia al punzonamiento del suelo **100 kN sobre 20 cm ϕ** (el «ϕ» = diámetro solo se ve en la imagen) | ap. 1.2 pto 1 a) a f) | [SI25] p. 36, imagen |
| C3.6 | Tramos de la separación c) | **INTERPRETACIÓN** (aritmética del literal) | h ≤ 15 → 23 m · 15 < h ≤ 20 → 18 m · h > 20 → 10 m. h = altura de evacuación del edificio | «edificios de hasta 15 m … / de más de 15 m y hasta 20 m … / de más de 20 m» | — |
| C3.7 | Tapas de registro | VERIFICADO | El punzonamiento también en tapas de registro de servicios públicos > **0,15 m × 0,15 m**, según **UNE-EN 124:2015** | ap. 1.2 pto 2 | [SI25] p. 36 |
| C3.8 | Obstáculos | VERIFICADO | Libre de mobiliario urbano, arbolado, jardines, mojones u otros obstáculos; sin cables aéreos ni ramas donde se prevea acceso con escaleras o plataformas | ap. 1.2 pto 3 | [SI25] p. 37 |
| C3.9 | Columna seca | VERIFICADO | Acceso para un equipo de bombeo a **menos de 18 m** de cada punto de conexión, visible desde el camión | ap. 1.2 pto 4 | [SI25] p. 37 |
| C3.10 | Vías sin salida | VERIFICADO | Si miden **más de 20 m**, espacio suficiente para maniobrar | ap. 1.2 pto 5 | [SI25] p. 37 |
| C3.11 | Zonas limítrofes con áreas forestales | VERIFICADO | Franja de **25 m** libre de vegetación propagadora + camino perimetral de **5 m** (puede ir dentro); preferentemente dos vías de acceso que cumplan 1.1; si hay una sola, fondo de saco circular de **12,50 m** de radio | ap. 1.2 pto 6 a) a c) | [SI25] p. 37 |
| C3.12 | ¿Pto 6 depende de los 9 m? | **INTERPRETACIÓN** | No: habla de «zonas edificadas limítrofes o interiores a áreas forestales», sin altura. El módulo no modela el entorno: decisión del proyectista | ap. 1.2 pto 6 | — |
| C3.13 | Accesibilidad por fachada: umbral | **INTERPRETACIÓN** (lectura directa) | Se aplica a «las fachadas a las que se hace referencia en el apartado 1.2»: solo existe si hay espacio de maniobra exigido (h descendente > 9 m) | ap. 2 pto 1: «Las fachadas a las que se hace referencia en el apartado 1.2 deben disponer de huecos que permitan el acceso desde el exterior al personal del servicio de extinción de incendios.» | [SI25] p. 37 |
| C3.14 | Huecos | VERIFICADO | a) acceso a **cada planta**, alféizar **≤ 1,20 m** sobre el nivel de la planta; b) dimensiones **≥ 0,80 m** (horizontal) y **≥ 1,20 m** (vertical); ejes verticales de huecos consecutivos a **≤ 25 m**, medidos sobre la fachada; c) nada en fachada que impida o dificulte el acceso, **salvo** elementos de seguridad en huecos de plantas con altura de evacuación **≤ 9 m** | ap. 2 pto 1 a) a c): «a) Facilitar el acceso a cada una de las plantas del edificio, de forma que la altura del alféizar respecto del nivel de la planta a la que accede no sea mayor que 1,20 m; b) Sus dimensiones horizontal y vertical deben ser, al menos, 0,80 m y 1,20 m respectivamente. La distancia máxima entre los ejes verticales de dos huecos consecutivos no debe exceder de 25 m, medida sobre la fachada; c) No se deben instalar en fachada elementos que impidan o dificulten la accesibilidad al interior del edificio a través de dichos huecos, a excepción de los elementos de seguridad situados en los huecos de las plantas cuya altura de evacuación no exceda de 9 m.» | [SI25] p. 37, imagen |
| C3.15 | Aparcamientos robotizados | VERIFICADO (fuera del modelo) | Vía compartimentada EI 120 con puertas EI₂ 60-C5 hasta cada nivel y extracción mecánica de 3 renovaciones/hora | ap. 2 pto 2 | [SI25] p. 37 |
| C3.16 | ¿El vial público tiene que cumplir? | VERIFICADO (literal) + **INTERPRETACIÓN** | El título del capítulo 1 lleva la nota ⁽¹⁾ «Ver último párrafo del apartado II Ámbito de aplicación de la Introducción de este DB». Ese párrafo dice que solo son obligatorios los elementos del entorno **que formen parte del proyecto**. Una calle pública existente no forma parte del proyecto: el proyecto no puede hacerla cumplir; la memoria la describe | Introducción II, último párrafo: «Como en el conjunto del CTE, el ámbito de aplicación de este DB son las obras de edificación. Por ello, los elementos del entorno del edificio a los que les son de obligada aplicación sus condiciones son únicamente aquellos que formen parte del proyecto de edificación. Conforme al artículo 2, punto 3 de la ley 38/1999, de 5 de noviembre, de Ordenación de la Edificación (LOE), se consideran comprendidas en la edificación sus instalaciones fijas y el equipamiento propio, así como los elementos de urbanización que permanezcan adscritos al edificio.» | [SI25] pp. 4, 36 |
| C3.17 | Comentario: varios espacios de maniobra | LEÍDO (1 fuente, comentario no reglamentario) | Puede hacer falta más de uno. c) es para llegar con escala; d) es para llegar a los portales con manguera, y los 30 m se miden desde el espacio de maniobra hasta los accesos a nivel de calle | [DccSI] p. 61, «Espacios de maniobra en el entorno del edificio»: «… La finalidad del punto c) es que los bomberos puedan acceder al interior del edificio mediante una escala. Por ejemplo, en un edificio de uso residencial vivienda formado por varios portales harían falta tantos espacios de maniobra como sean necesarios para conseguir dicho objetivo. En cambio, la finalidad del punto d) es que los bomberos puedan acceder a los portales acompañados de una manguera conectada al camión bomba. En este último caso, el límite de 30 m de distancia debe considerarse desde el espacio de maniobra hasta los accesos al edificio a nivel de calle por los que se pueda llegar hasta todas sus zonas.» | [DccSI] |
| C3.18 | Comentario: huecos en viviendas | LEÍDO (1 fuente, comentario no reglamentario) | No hace falta llegar a **todas** las viviendas de cada planta; es recomendable, no obligatorio, que los huecos den a zonas comunes | [DccSI] pp. 61–62, «Huecos de acceso a las plantas»: «… lo que en edificios de viviendas no implica la obligatoriedad de poder acceder a todas las viviendas de cada planta, bajo el criterio de que accediendo a alguna o algunas de ellas los bomberos tienen medios para acceder a las restantes. Aunque es muy recomendable que dichos huecos den acceso desde el exterior a zonas comunes … tal condición no puede ser obligatoria en todo caso …» | [DccSI] |
| C3.19 | Comentarios sobre entre medianeras, retranqueos o unifamiliar | **NO VERIFICABLE** | [DccSI] no tiene comentarios a SI 5 sobre esos casos (búsqueda en todo el texto) | — | [DccSI] |
| C3.20 | Vivienda unifamiliar | **INTERPRETACIÓN** | El interior de una vivienda no es origen de evacuación: la unifamiliar no tiene altura de evacuación que supere 9 m. SI 5 ap. 1.2 y ap. 2 no se activan (y, en la práctica, casi ninguna unifamiliar pasa de 9 m en la cota de su última planta) | Anejo SI A, «Origen de evacuación» y «Altura de evacuación» | [SI25] pp. 42, 46 |
| C3.21 | «Fachada accesible» (nota (3) de SI 4) | **INTERPRETACIÓN** | El Anejo SI A no la define. Se lee como la fachada de SI 5 ap. 2 (la de los accesos, delante del espacio de maniobra) | — | — |

---

## Bloque C4 — SI 6: resistencia al fuego de la estructura

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C4.1 | Generalidades | VERIFICADO | Solo métodos simplificados (Anejos B a F) para elementos individuales con la curva normalizada. Se admiten otros modelos (curvas paramétricas, fuegos localizados, CFD; UNE-EN 1991-1-2:2004) y ensayos (RD 842/2013). Con los simplificados no hace falta considerar las acciones indirectas | SI 6 ap. 1 ptos 2, 3, 6 y 7 | [SI25] p. 38, imagen |
| C4.2 | Criterio de comprobación | VERIFICADO | El efecto de las acciones no supera la resistencia en ningún instante; en general basta el final del incendio normalizado. No se considera la capacidad portante tras el incendio | ap. 2 ptos 1 y 3 | [SI25] pp. 38–39 |
| C4.3 | Métodos admitidos para un elemento principal | VERIFICADO | a) la clase de la tabla 3.1 o 3.2 con la curva normalizada, **o** b) el tiempo equivalente del Anejo B. La resistencia se obtiene: a) por las tablas de los Anejos C a F; b) por sus métodos simplificados; c) por ensayo (RD 842/2013) | ap. 3 pto 1 a) y b); ap. 6 pto 1 a) a c) | [SI25] pp. 39, 41 |
| C4.4 | Qué es «elemento estructural principal» | VERIFICADO | «… (incluidos forjados, vigas y soportes) …» | ap. 3 pto 1 | [SI25] p. 39 |
| C4.5 | Tabla 3.1 | VERIFICADO | Ver la transcripción | Tabla 3.1 | [SI25] p. 39, imagen; [DccSI] p. 64 |
| C4.6 | Columnas de la tabla 3.1 | **INTERPRETACIÓN** (aritmética del literal) | «Plantas de sótano» (sin altura) y «Plantas sobre rasante — altura de evacuación **del edificio**»: h ≤ 15 · 15 < h ≤ 28 · h > 28. La columna depende de la altura **del edificio**, no de la de la planta: un local en PB de un edificio de 18 m va en la columna «≤ 28 m» | Cabecera de la tabla 3.1 | [SI25] |
| C4.7 | La R de un suelo es la del sector de **debajo** | VERIFICADO | Nota (1), literal en la transcripción. Si el suelo está **dentro** de un sector, la R de ese sector | Tabla 3.1, nota (1) | [SI25] p. 39 |
| C4.8 | «Planta de sótano» | **NO VERIFICABLE** (sin definición en el DB-SI) | El Anejo SI A no la define. Lectura habitual: planta bajo rasante. El modelo usa `bajoRasante` | — | — |
| C4.9 | Sector con plantas sobre y bajo rasante | LEÍDO (1 fuente, comentario no reglamentario) | Todo el sector lleva la R de bajo rasante | [DccSI] p. 65, «Resistencia al fuego en sectores que contienen plantas bajo y sobre rasante»: «En los casos en los que en un mismo sector se den plantas sobre y bajo rasante, la resistencia al fuego estructural exigible en todo el sector es la aplicable bajo rasante.» | [DccSI] |
| C4.10 | «Aparcamiento situado bajo un uso distinto» | LEÍDO (1 fuente, comentario no reglamentario) | Aquel cuya estructura sostiene zonas edificadas de otro uso | [DccSI] p. 65, «Aparcamiento bajo un uso distinto»: «Un aparcamiento "situado bajo un uso distinto" se refiere a un aparcamiento cuya estructura sea soporte de zonas edificadas de otro uso, como Residencial Vivienda, Comercial, Administrativo, etc.» | [DccSI] |
| C4.11 | Sótanos de una unifamiliar | VERIFICADO | **R 30** (columna «Plantas de sótano», fila «Vivienda unifamiliar») | Tabla 3.1 | [SI25] p. 39 |
| C4.12 | Unifamiliares agrupadas o adosadas | VERIFICADO | La estructura **común** lleva la R de Residencial Vivienda | Nota (2) | [SI25] p. 39 |
| C4.13 | Garaje integrado en una unifamiliar | **INTERPRETACIÓN** (con apoyo literal en dos tablas) | Es zona de riesgo especial **bajo** «en todo caso» (SI 1 tabla 2.1) → su estructura, **R 90** (tabla 3.2), y el forjado que tiene encima, **R 90** («función del uso del espacio existente bajo dicho suelo»). Excepción: R 30 si está bajo una cubierta no prevista para evacuación y su fallo no compromete otras plantas ni la compartimentación. El comentario a SI 1 trata ese garaje como riesgo especial bajo | SI 1 tabla 2.1 ([SI25] p. 14, imagen); tabla 3.2 y su nota; [DccSI] p. 18, «Elementos sectorizadores en viviendas unifamiliares» (comentario): «Si se trata de un aparcamiento propio de la vivienda (zona de riesgo especial bajo) dicha separación debe ser EI 60 y EI 90, respectivamente.» | [SI25] pp. 14, 39; [DccSI] |
| C4.14 | Tabla 3.2 | VERIFICADO | Bajo **R 90**, medio **R 120**, alto **R 180**, con su nota | Tabla 3.2 | [SI25] p. 39, imagen; [DccSI] p. 65 |
| C4.15 | Nota de la tabla 3.2 | VERIFICADO | Nunca menos que la estructura portante de la planta, salvo bajo cubierta no prevista para evacuación (R 30). La R del **suelo** de una zona de riesgo especial es la del uso del espacio que tiene **debajo** | Tabla 3.2, nota (1), literal en la transcripción | [SI25] p. 39 |
| C4.16 | Cubierta ligera | VERIFICADO | **R 30** para su estructura principal y los elementos que solo la sustentan si: no está prevista para evacuación; su altura sobre la rasante exterior **no excede de 28 m**; su fallo no puede dañar gravemente edificios o establecimientos próximos ni comprometer plantas inferiores o la compartimentación. Ligera: carga permanente debida **solo a su cerramiento ≤ 1 kN/m²** | ap. 3 pto 2: «La estructura principal de las cubiertas ligeras no previstas para ser utilizadas en la evacuación de los ocupantes y cuya altura respecto de la rasante exterior no exceda de 28 m, así como los elementos que únicamente sustenten dichas cubiertas, podrán ser R 30 cuando su fallo no pueda ocasionar daños graves a los edificios o establecimientos próximos, ni comprometer la estabilidad de otras plantas inferiores o la compartimentación de los sectores de incendio. A tales efectos, puede entenderse como ligera aquella cubierta cuya carga permanente debida únicamente a su cerramiento no exceda de 1 kN/m².» | [SI25] pp. 39–40 |
| C4.17 | Cubierta ligera: comentarios | LEÍDO (1 fuente, comentarios no reglamentarios) | La reducción a R 30 es para la estructura **principal** (vigas, jácenas); a la secundaria (viguetas, correas) no se le exige R. Si hay dudas, criterio de SI 6-4. Un techo EI t bajo una cubierta que deba ser R t la exime, si el riesgo en la cámara es nulo | [DccSI] p. 65, «Resistencia al fuego de cubiertas ligeras» y «Techo bajo cubierta como garantía de la resistencia al fuego R exigible a ésta» | [DccSI] |
| C4.18 | Escaleras | VERIFICADO | Elementos estructurales **contenidos** en una escalera o un pasillo protegidos: **R 30** mínimo. Escalera **especialmente** protegida: sin exigencia | ap. 3 pto 3: «Los elementos estructurales de una escalera protegida o de un pasillo protegido que estén contenidos en el recinto de éstos, serán como mínimo R 30. Cuando se trate de escaleras especialmente protegidas no se exige resistencia al fuego a los elementos estructurales.» | [SI25] p. 40 |
| C4.19 | Escaleras: comentarios | LEÍDO (1 fuente, comentarios no reglamentarios) | Si los peldaños son elementos distintos de los portantes, la R solo se exige a los portantes. Escaleras exteriores: cumplir las distancias de SI 2-1 o interponer un elemento EI 60 | [DccSI] pp. 65–66 | [DccSI] |
| C4.20 | Elementos secundarios | VERIFICADO | Sin exigencia si su colapso no daña a los ocupantes ni compromete la estabilidad global, la evacuación o la compartimentación (pequeñas entreplantas, suelos o escaleras ligeras…). Pero todo suelo que deba ser R según la tabla 3.1 debe tener al menos una escalera de esa misma R **o protegida** | ap. 4 pto 1 | [SI25] p. 40 |
| C4.21 | Carpas | VERIFICADO (fuera del modelo) | R 30, salvo textil T2 (UNE-EN 15619:2014) o C-s2,d0 con perforación ≥ 20 cm² tras UNE-EN 14115:2002 | ap. 4 pto 2 | [SI25] p. 40 |
| C4.22 | Otras cifras de la sección | VERIFICADO | Simplificación E_fi,d = η_fi · E_d (5.2), con η_fi = (G_K + ψ₁,₁ Q_K,1) / (γ_G G_K + γ_Q,1 Q_K,1) (5.3); γ_M,fi = 1 salvo que el anejo diga otra cosa; μ_fi = E_fi,d / R_fi,d,0 (6.1) | ap. 5 pto 5; ap. 6 ptos 4 y 5 | [SI25] pp. 40–41, imagen |
| C4.23 | Elementos exteriores | LEÍDO (1 fuente, comentario no reglamentario) | Las exigencias son para elementos **interiores**. Para los exteriores, o la misma R (muy del lado de la seguridad) o un cálculo particular (UNE-EN 1991-1-2, Anejo B) | [DccSI] p. 63, «Resistencia al fuego de los elementos estructurales exteriores» | [DccSI] |

### Tabla 3.1 — Resistencia al fuego suficiente de los elementos estructurales ([SI25] p. 39)

| Uso del sector de incendio considerado⁽¹⁾ | Plantas de sótano | Sobre rasante, h ≤ 15 m | h ≤ 28 m | h > 28 m |
|---|---|---|---|---|
| Vivienda unifamiliar⁽²⁾ | R 30 | R 30 | – | – |
| Residencial Vivienda, Residencial Público, Docente, Administrativo | R 120 | R 60 | R 90 | R 120 |
| Comercial, Pública concurrencia, Hospitalario | R 120⁽³⁾ | R 90 | R 120 | R 180 |
| Aparcamiento (edificio de uso exclusivo o situado sobre otro uso) | R 90 (una sola casilla para todas las columnas) | | | |
| Aparcamiento (situado bajo un uso distinto) | R 120⁽⁴⁾ (una sola casilla para todas las columnas) | | | |

h = altura de evacuación del edificio. «–» = casilla con guion: el DB no da valor.

- ⁽¹⁾ «La resistencia al fuego suficiente R de los elementos estructurales de un suelo que separa sectores de incendio es función del uso del sector inferior. Los elementos estructurales de suelos que no delimitan un sector de incendios, sino que están contenidos en él, deben tener al menos la resistencia al fuego suficiente R que se exija para el uso de dicho sector» (sin punto final en el DB).
- ⁽²⁾ «En viviendas unifamiliares agrupadas o adosadas, los elementos que formen parte de la estructura común tendrán la resistencia al fuego exigible a edificios de uso Residencial Vivienda.»
- ⁽³⁾ «R 180 si la altura de evacuación del edificio excede de 28 m.»
- ⁽⁴⁾ «R 180 cuando se trate de aparcamientos robotizados.»

### Tabla 3.2 — Zonas de riesgo especial integradas en los edificios ([SI25] p. 39)

| Riesgo especial | R |
|---|---|
| Bajo | R 90 |
| Medio | R 120 |
| Alto | R 180 |

- ⁽¹⁾ «No será inferior al de la estructura portante de la planta del edificio excepto cuando la zona se encuentre bajo una cubierta no prevista para evacuación y cuyo fallo no suponga riesgo para la estabilidad de otras plantas ni para la compartimentación contra incendios, en cuyo caso puede ser R 30.» Y, en párrafo aparte dentro de la nota: «La resistencia al fuego suficiente R de los elementos estructurales de un suelo de una zona de riesgo especial es función del uso del espacio existente bajo dicho suelo».

**Nota C4.24 — Cómo se aplican las dos tablas a un edificio del modelo** (INTERPRETACIÓN; todas las cifras son de las tablas)

| Elemento | R | Por qué |
|---|---|---|
| Soportes y forjado de techo del garaje bajo viviendas | R 120 | Aparcamiento bajo un uso distinto (todas las columnas); el techo del garaje es un suelo cuyo sector inferior es el garaje |
| Soportes de un sótano de viviendas (trasteros, instalaciones) | R 120 | Residencial Vivienda, plantas de sótano |
| Soportes y forjados de las plantas de viviendas | R 60 / R 90 / R 120 | h ≤ 15 / ≤ 28 / > 28 |
| Forjado de techo de un local en PB | La del uso del local (sector inferior) | Comercial: R 90 / R 120 / R 180 según h del edificio. Sin uso: ver Criterios |
| Forjado de techo y estructura de un cuarto de riesgo especial bajo (contadores, sala de máquinas RITE, trasteros 50–100 m²) | R 90, nunca menos que la de la planta | Tabla 3.2 y su nota: en una planta de viviendas de R 60, ese cuarto sube a R 90 |
| Vivienda unifamiliar, sótano y plantas | R 30 | Fila «Vivienda unifamiliar» |
| Garaje integrado en la unifamiliar | R 90 (o R 30 bajo cubierta no transitable sin plantas encima) | C4.13 |
| Cubierta ligera no transitable, ≤ 28 m | R 30 | C4.16 |
| Escalera protegida (elementos contenidos) | R 30 | C4.18 |

---

## Bloque C5 — Anejo C: hormigón armado

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C5.1 | Qué dan las tablas | VERIFICADO | La resistencia a la curva normalizada en función de las dimensiones y de la **distancia mínima equivalente al eje** a_m | C.2.1 pto 1 | [SI25] p. 57 |
| C5.2 | Definición de a_m | VERIFICADO | (C.1) a_m = Σ[A_si · f_yki · (a_si + Δa_si)] / Σ(A_si · f_yki). a_si: distancia del eje de cada armadura al paramento expuesto más próximo, **considerando los revestimientos** según C.2.4. Δa_si: corrección de la tabla C.1 según μ_fi; las correcciones con μ_fi < 0,6 en vigas, losas y forjados, solo con carga sensiblemente uniforme; se puede interpolar | C.2.1 pto 2 | [SI25] p. 57, imagen |
| C5.3 | Tabla C.1 (Δa_si) | VERIFICADO (imagen a 130 ppp) | Ver la transcripción | Tabla C.1 | [SI25] p. 57 |
| C5.4 | Áridos y recubrimientos grandes | VERIFICADO | Tablas para hormigón de densidad normal con **árido silíceo**. Árido **calizo**: en vigas, losas y forjados, se pueden reducir un **10 %** las dimensiones y a_m mínimas. Recubrimientos de hormigón **> 50 mm** en zonas traccionadas: armadura de piel, malla de **< 150 mm** en ambas direcciones | C.2.1 ptos 3 y 4 | [SI25] p. 58, imagen |
| C5.5 | Tabla C.2 (soportes y muros) | VERIFICADO | Ver la transcripción. Soportes expuestos por 3 o 4 caras; muros portantes «de sección estricta» por una o ambas caras. Para > R 90 con cuantía > 2 %, armadura repartida en todas las caras (salvo solapos). Un elemento traccionado se comprueba como acero revestido | C.2.2 ptos 1 a 3 | [SI25] p. 58, imagen |
| C5.6 | Nota (2) de la C.2: «Instrucción EHE» | VERIFICADO (literal) + aviso | El DB sigue citando la EHE (250 mm mínimos para soportes hechos en obra). La EHE-08 fue sustituida por el Código Estructural (RD 470/2021); **no releído en esta sesión** | Tabla C.2, nota (2) | [SI25] p. 58 |
| C5.7 | Vigas de ancho variable y doble T | VERIFICADO | b = ancho a la altura del c.d.g. mecánico de la armadura traccionada (fig. C.1). Doble T: canto del ala inferior > ancho mínimo; si es variable, d_ef = d₁ + 0,5 d₂ | C.2.3 | [SI25] pp. 58–59 |
| C5.8 | Tabla C.3 (vigas con tres caras expuestas) | VERIFICADO | Ver la transcripción. Para ≥ R 90, negativos de vigas continuas hasta el **33 %** del tramo con **≥ 25 %** de la cuantía de extremos. Vigas expuestas en todas las caras: además, área ≥ **2 (b_mín)²** | C.2.3.1 y C.2.3.2 | [SI25] p. 59, imagen |
| C5.9 | Tabla C.4 (losas macizas) | VERIFICADO | Ver la transcripción. El espesor h_mín solo se exige si la losa compartimenta (REI); si solo es R, basta el espesor del proyecto a temperatura normal, y cuenta el solado u otro elemento que mantenga su función aislante | C.2.3.3 pto 1 | [SI25] pp. 59–60, imagen |
| C5.10 | Losas: armado y vigas planas | VERIFICADO | ≥ R 90, apoyos lineales: negativos al 33 % del tramo con ≥ 25 %. Apoyos puntuales: el 20 % de la armadura superior sobre soportes, a todo lo largo del tramo. Vigas planas con macizados laterales **> 10 cm** se asimilan a losas unidireccionales | C.2.3.3 ptos 2 a 4 | [SI25] p. 60 |
| C5.11 | Placas alveolares | LEÍDO (1 fuente, comentario no reglamentario) | La tabla C.4 también vale para ellas | [DccSI] p. 93, «Placas alveolares»: «La tabla C.4. también es aplicable a las placas alveolares.» | [DccSI] |
| C5.12 | Tabla C.5 (forjados bidireccionales) | VERIFICADO | Ver la transcripción. Mismo criterio de espesor que la C.4. Con entrevigado cerámico o de hormigón **y revestimiento inferior**, hasta R 120 basta C.2.3.5 pto 1. ≥ R 90 sobre apoyos puntuales: 20 % de la armadura superior en todo el vano, en la banda de soportes; sobre apoyos lineales, negativos al 33 % con ≥ 25 % | C.2.3.4 ptos 1 y 2 | [SI25] p. 60, imagen |
| C5.13 | Bidireccionales: comentario | LEÍDO (1 fuente, comentario no reglamentario) | Para el ancho de nervio y h_mín cuentan las paredes de las piezas de entrevigado que quedan adheridas; la bovedilla cerámica, como **2 veces** su espesor real de hormigón | [DccSI] p. 93, «Comprobación de forjados bidireccionales mediante la tabla C.5» | [DccSI] |
| C5.14 | Forjados unidireccionales (viguetas y bovedillas) | VERIFICADO | **Con entrevigado cerámico o de hormigón y revestimiento inferior, hasta R 120**: basta la a_m de **losas macizas (tabla C.4)**, contando los espesores equivalentes de C.2.4 (2). Si compartimenta, además el h_mín de la C.4. **Más de R 120, o entrevigado de otro material, o sin revestimiento inferior**: como vigas con tres caras expuestas (C.3), contando el solado y las piezas de entrevigado que mantengan su función aislante (120 min si no hay datos); la **bovedilla cerámica = 2 veces** su espesor real de hormigón. ≥ R 90: negativos al 33 % con ≥ 25 % | C.2.3.5 ptos 1 a 3 (literal en nota C5.14) | [SI25] pp. 60–61, imagen |
| C5.15 | ¿Qué columna de la C.4 para un unidireccional? | **INTERPRETACIÓN** | «Flexión en una dirección». El texto dice solo «para losas macizas en la tabla C.4» | C.2.3.5 pto 1 | — |
| C5.16 | h_mín de un unidireccional | LEÍDO (1 fuente, comentario no reglamentario) | A falta de estudios, suma de los espesores de las partes masivas | [DccSI] p. 94, «Comprobación de hmin establecido en la tabla C.4»: «A falta de estudios más específicos, en estos casos, el valor de hmin establecido en la tabla C.4 puede calcularse como la suma de los espesores de las partes masivas.» | [DccSI] |
| C5.17 | Revestimiento de **yeso** | VERIFICADO | **1,8 veces** su espesor real como hormigón adicional. En techos: hasta R 120 se recomienda proyectado; por encima de R 120, solo por ensayo | C.2.4 pto 2: «Los revestimientos con mortero de yeso pueden considerarse como espesores adicionales de hormigón equivalentes a 1,8 veces su espesor real. Cuando estén aplicados en techos, para valores no mayores que R 120 se recomienda que su puesta en obra se realice por proyección y para valores mayores que R 120 su aportación solo puede justificarse mediante ensayo.» | [SI25] p. 61, imagen |
| C5.18 | Revestimiento de **mortero de cemento** | **CORREGIDO** / NO VERIFICABLE | El Anejo C **no da** equivalencia para el mortero de cemento: solo para el «mortero de yeso». Otras capas protectoras, por **UNE-EN 13381-3:2016** | C.2.4 ptos 1 y 2 | [SI25] p. 61 |
| C5.19 | Interpolar entre clases R | **NO VERIFICABLE** (el DB no lo prevé) | Las tablas C.2 a C.5 se leen por la fila de la R exigida; el DB solo permite interpolar Δa_si entre valores de μ_fi | C.2.1 pto 2 | [SI25] |

**Tabla C.1 — Valores de Δa_si (mm)** ([SI25] p. 57, imagen)

| μ_fi | Acero de armar · vigas⁽¹⁾ y losas (forjados) | Acero de armar · resto | Pretensar · vigas⁽¹⁾ y losas · barras | Pretensar · vigas⁽¹⁾ y losas · alambres | Pretensar · resto · barras | Pretensar · resto · alambres |
|---|---|---|---|---|---|---|
| ≤ 0,4 | +5 | 0 (una casilla para las tres filas) | −5 | −10 | −10 (una casilla) | −15 (una casilla) |
| 0,5 | 0 | | −10 | −15 | | |
| 0,6 | −5 | | −15 | −20 | | |

⁽¹⁾ «En el caso de armaduras situadas en las esquinas de vigas con una sola capa de armadura se reducirán los valores de Δa_si en 10 mm, cuando el ancho de las mismas sea inferior a los valores de b_min especificados en la columna 3 de la tabla C.3.» Qué es «la columna 3» no está claro (¿la opción 2?): ver Pendientes.

**Tabla C.2 — Elementos a compresión** ([SI25] p. 58). b_mín / a_m en mm⁽¹⁾

| Resistencia al fuego | Soportes | Muro de carga expuesto por una cara | Muro de carga expuesto por ambas caras |
|---|---|---|---|
| R 30 | 150 / 15⁽²⁾ | 100 / 15⁽³⁾ | 120 / 15 |
| R 60 | 200 / 20⁽²⁾ | 120 / 15⁽³⁾ | 140 / 15 |
| R 90 | 250 / 30 | 140 / 20⁽³⁾ | 160 / 25 |
| R 120 | 250 / 40 | 160 / 25⁽³⁾ | 180 / 35 |
| R 180 | 350 / 45 | 200 / 40⁽³⁾ | 250 / 45 |
| R 240 | 400 / 50 | 250 / 50⁽³⁾ | 300 / 50 |

⁽¹⁾ «Los recubrimientos por exigencias de durabilidad pueden requerir valores superiores.» ⁽²⁾ «Los soportes ejecutados en obra deben tener, de acuerdo con la Instrucción EHE, una dimensión mínima de 250 mm.» ⁽³⁾ «La resistencia al fuego aportada se puede considerar REI»

**Tabla C.3 — Vigas con tres caras expuestas al fuego⁽¹⁾** ([SI25] p. 59). b_mín / a_m en mm

| Resistencia al fuego normalizado | Opción 1 | Opción 2 | Opción 3 | Opción 4 | Anchura mínima⁽²⁾ del alma b₀,mín (mm) |
|---|---|---|---|---|---|
| R 30 | 80 / 20 | 120 / 15 | 200 / 10 | – | 80 |
| R 60 | 100 / 30 | 150 / 25 | 200 / 20 | – | 100 |
| R 90 | 150 / 40 | 200 / 35 | 250 / 30 | 400 / 25 | 100 |
| R 120 | 200 / 50 | 250 / 45 | 300 / 40 | 500 / 35 | 120 |
| R 180 | 300 / 75 | 350 / 65 | 400 / 60 | 600 / 50 | 140 |
| R 240 | 400 / 75 | 500 / 70 | 700 / 60 | – | 160 |

⁽¹⁾ «Los recubrimientos por exigencias de durabilidad pueden requerir valores superiores.» ⁽²⁾ «Debe darse en una longitud igual a dos veces el canto de la viga, a cada lado de los elementos de sustentación de la viga.»

**Tabla C.4 — Losas macizas** ([SI25] pp. 59–60)

| Resistencia al fuego | Espesor mínimo h_mín (mm) | a_m⁽¹⁾ flexión en una dirección | a_m flexión en dos direcciones, I_y/I_x⁽²⁾ ≤ 1,5 | a_m flexión en dos direcciones, 1,5 < I_y/I_x⁽²⁾ ≤ 2 |
|---|---|---|---|---|
| REI 30 | 60 | 10 | 10 | 10 |
| REI 60 | 80 | 20 | 10 | 20 |
| REI 90 | 100 | 25 | 15 | 25 |
| REI 120 | 120 | 35 | 20 | 30 |
| REI 180 | 150 | 50 | 30 | 40 |
| REI 240 | 175 | 60 | 50 | 50 |

⁽¹⁾ «Los recubrimientos por exigencias de durabilidad pueden requerir valores superiores.» ⁽²⁾ «I_x y I_y son las luces de la losa, siendo I_y > I_x.» Con I_y/I_x > 2 el DB no da columna (ver Criterios).

**Tabla C.5 — Forjados bidireccionales** ([SI25] p. 60). b_mín de nervio / a_m⁽¹⁾ en mm

| Resistencia al fuego | Opción 1 | Opción 2 | Opción 3 | Espesor mínimo h_mín (mm) |
|---|---|---|---|---|
| REI 30 | 80 / 20 | 120 / 15 | 200 / 10 | 60 |
| REI 60 | 100 / 30 | 150 / 25 | 200 / 20 | 80 |
| REI 90 | 120 / 40 | 200 / 30 | 250 / 25 | 100 |
| REI 120 | 160 / 50 | 250 / 40 | 300 / 35 | 120 |
| REI 180 | 200 / 70 | 300 / 60 | 400 / 55 | 150 |
| REI 240 | 250 / 90 | 350 / 75 | 500 / 70 | 175 |

⁽¹⁾ «Los recubrimientos por exigencias de durabilidad pueden requerir valores superiores.»

**Nota C5.14 — C.2.3.5, literal** ([SI25] pp. 60–61)
- pto 1: «Si los forjados disponen de elementos de entrevigado cerámicos o de hormigón y revestimiento inferior, para resistencia al fuego R 120 o menor bastará con que se cumpla el valor de la distancia mínima equivalente al eje de las armaduras establecidos para losas macizas en la tabla C.4, pudiéndose contabilizar, a efectos de dicha distancia, los espesores equivalentes de hormigón con los criterios y condiciones indicados en el apartado C.2.4.(2). Si el forjado tiene función de compartimentación de incendio deberá cumplir asimismo con el espesor hmin establecido en la tabla C.4.»
- pto 2: «Para una resistencia al fuego R 90 o mayor, la armadura de negativos de forjados continuos se debe prolongar hasta el 33% de la longitud del tramo con una cuantía no inferior al 25% de la requerida en los extremos.»
- pto 3: «Para resistencias al fuego mayores que R 120, o bien cuando los elementos de entrevigado no sean de cerámica o de hormigón, o no se haya dispuesto revestimiento inferior deberán cumplirse las especificaciones establecidas para vigas con las tres caras expuestas al fuego en el apartado C.2.3.1. A efectos del espesor de la losa superior de hormigón y de la anchura de nervio se podrán tener en cuenta los espesores del solado y de las piezas de entrevigado que mantengan su función aislante durante el periodo de resistencia al fuego, el cual puede suponerse, en ausencia de datos experimentales, igual a 120 minutos. Las bovedillas cerámicas pueden considerarse como espesores adicionales de hormigón equivalentes a dos veces el espesor real de la bovedilla.»

---

## Bloque C6 — Anejo F: fábricas

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C6.1 | Ámbito de las tablas | VERIFICADO | Solo muros y tabiques **de una hoja**, sin revestir, enfoscados con mortero de cemento o guarnecidos con yeso, con revestimientos de **≥ 1,5 cm** | Anejo F, 2.º párrafo: «Dichas tablas son aplicables solamente a muros y tabiques de una hoja, sin revestir y enfoscados con mortero de cemento o guarnecidos con yeso, con espesores de 1,5 cm como mínimo.» | [SI25] p. 85, imagen; [DccSI] p. 118 |
| C6.2 | Dos o más hojas | VERIFICADO | Se puede sumar la resistencia de cada hoja | «En el caso de soluciones constructivas formadas por dos o más hojas puede adoptarse como valor de resistencia al fuego del conjunto la suma de los valores correspondientes a cada hoja.» | [SI25] p. 85 |
| C6.3 | ¿EI quiere decir que no es portante? | VERIFICADO: **no** | Es la clasificación disponible, no la única | «… una clasificación EI asignada a un elemento no presupone que el mismo carezca de capacidad portante ante la acción del fuego y que, por tanto, no pueda ser clasificado también como REI, sino simplemente que no se dispone de dicha clasificación.» | [SI25] p. 85 |
| C6.4 | Tabla F.1 | VERIFICADO | Ver la transcripción | Tabla F.1 | [SI25] p. 85, imagen; [DccSI] p. 118, texto |
| C6.5 | Tabla F.2 | VERIFICADO, con una casilla dudosa | Ver la transcripción | Tabla F.2 | ídem |
| C6.6 | Casilla «RE-240 / REI-80» (bloque doble de arcilla expandida, guarnecido por las dos caras, 150 mm) | VERIFICADO (literal en ambas fuentes) + **probable errata** | 80 min no es un tiempo de clasificación habitual (las clases van 60, 90, 120…). No hay comentario del Ministerio. No se ha podido comparar con el BOE de 2006. **No usar la parte «REI-80»** sin aviso; RE-240 sí es legible | Tabla F.2, última fila | [SI25] p. 85; [DccSI] p. 118 |
| C6.7 | Comentarios del Ministerio al Anejo F | **NO VERIFICABLE**: no hay | [DccSI] p. 118 es igual al articulado | — | [DccSI] |
| C6.8 | Hoja cuyo revestimiento queda en la cara **no** expuesta | **NO VERIFICABLE** (sin fila) | Las filas de la F.1 son «sin revestir», «por la cara expuesta» y «por las dos caras». Una hoja revestida solo por la cara opuesta al fuego (p. ej. la segunda hoja de una medianera, con el guarnecido hacia su vivienda y la cara desnuda hacia la cámara) no tiene fila; para el ladrillo hueco, «sin revestir» es «no usual». La herramienta debe avisar, no inventar un valor | Tabla F.1 | [SI25] p. 85 |

**Tabla F.1 — Muros y tabiques de fábrica de ladrillo cerámico o sílico-calcáreo** ([SI25] p. 85). Espesor e de la fábrica en mm.

| Tipo de revestimiento | Hueco 40 ≤ e < 80 | Hueco 80 ≤ e < 110 | Hueco e ≥ 110 | Macizo o perforado 110 ≤ e < 200 | Macizo o perforado e ≥ 200 | Bloques de arcilla aligerada 140 ≤ e < 240 | Bloques de arcilla aligerada e ≥ 240 |
|---|---|---|---|---|---|---|---|
| Sin revestir | ⁽¹⁾ | ⁽¹⁾ | ⁽¹⁾ | REI-120 | REI-240 | ⁽¹⁾ | ⁽¹⁾ |
| Enfoscado · por la cara expuesta | ⁽¹⁾ | EI-60 | EI-90 | EI-180 | REI-240 | EI-180 | EI-240 |
| Enfoscado · por las dos caras | EI-30 | EI-90 | EI-120 | REI-180 | REI-240 | REI-180 | REI-240 |
| Guarnecido · por la cara expuesta | EI-60 | EI-120 | EI-180 | EI-240 | REI-240 | EI-240 | EI-240 |
| Guarnecido · por las dos caras | EI-90 | EI-180 | EI-240 | EI-240 | REI-240 | EI-240 / RE-240 / REI-180 (tres valores en una casilla) | REI-240 |

⁽¹⁾ «No es usual»

**Tabla F.2 — Muros y tabiques de fábrica de bloques de hormigón** ([SI25] p. 85)

| Tipo de cámara | Tipo de árido | Tipo de revestimiento | Espesor nominal (mm) | Resistencia al fuego |
|---|---|---|---|---|
| Simple | Silíceo | Sin revestir | 100 | EI-15 |
| Simple | Silíceo | Sin revestir | 150 | REI-60 |
| Simple | Silíceo | Sin revestir | 200 | REI-120 |
| Simple | Calizo | Sin revestir | 100 | EI-60 |
| Simple | Calizo | Sin revestir | 150 | REI-90 |
| Simple | Calizo | Sin revestir | 200 | REI-180 |
| Simple | Volcánico | Sin revestir | 120 | EI-120 |
| Simple | Volcánico | Sin revestir | 200 | REI-180 |
| Simple | Volcánico | Guarnecido por las dos caras | 90 | EI-180 |
| Simple | Volcánico | Guarnecido por la cara expuesta (enfoscado por la cara exterior) | 120 | EI-180 |
| Simple | Volcánico | Guarnecido por la cara expuesta (enfoscado por la cara exterior) | 200 | REI-240 |
| Doble | Arcilla expandida | Sin revestir | 150 | EI-180 |
| Doble | Arcilla expandida | Guarnecido por las dos caras | 150 | RE-240 / REI-80 (literal; ver C6.6) |

Ejemplos de lectura para SI 1 (INTERPRETACIÓN, lectura directa de la F.1):
- Tabique de ladrillo hueco de 7 cm (40 ≤ e < 80) guarnecido por las dos caras: **EI 90**.
- Hoja de ladrillo perforado de 11,5 cm (110 ≤ e < 200) enfoscada por una cara y guarnecida por la otra: el DB no tiene esa combinación; con el fuego por el lado guarnecido, la fila «guarnecido por la cara expuesta» da **EI 240**; por el lado enfoscado, «enfoscado por la cara expuesta» da **EI 180**. Si el fuego puede venir de los dos lados, el menor: **EI 180**.
- Doble hoja con cámara: cada hoja se lee con su revestimiento **respecto del fuego** y se suman (C6.2); si alguna hoja queda sin fila (C6.8), aviso.

---

## Bloque C7 — Frases típicas de memoria

| # | Frase | Veredicto | Valor correcto | Cita | Fuente |
|---|---|---|---|---|---|
| C7.1 | «Extintor 21A-113B a 15 m de todo origen de evacuación» | VERIFICADO, con matiz | «A 15 m **de recorrido** en cada planta, como máximo, desde todo origen de evacuación», y además en las zonas de riesgo especial con la nota (1) (≤ 15 m en riesgo bajo y medio, ≤ 10 m en alto, y uno fuera junto a la puerta) | Tabla 1.1, «En general»; nota (1) | [SI25] pp. 32, 35 |
| C7.2 | «En vivienda no se exigen BIE» | **CORREGIDO** (matiz) | La fila Residencial Vivienda no tiene BIE, pero: «En general» pide BIE (25 mm en vivienda) en zonas de **riesgo especial alto** por combustibles sólidos (p. ej. trasteros de más de 500 m², SI 1 tabla 2.1), y el **garaje** de más de 500 m² construidos lleva BIE por su propia fila | Tabla 1.1, «En general» y «Aparcamiento»; notas (2) y (7) | [SI25] pp. 14, 32, 34, 35 |
| C7.3 | «Columna seca si h > 24 m» | VERIFICADO | En Residencial Vivienda, Administrativo y Comercial: «Si la altura de evacuación excede de 24 m». En Aparcamiento el criterio es otro (más de tres plantas bajo rasante o de cuatro sobre rasante). El municipio puede cambiarla por BIE (nota 5) | Tabla 1.1 | [SI25] pp. 33–34 |
| C7.4 | «Garaje > 500 m²: BIE y detección» | VERIFICADO, con matiz | Superficie **construida** que **excede** de 500 m²: BIE de 25 mm y detección (en convencionales; al menos detectores). Además, SI 3-8 exige detección para activar la ventilación mecánica de todo garaje no abierto, sea cual sea su superficie (C1.15) | Tabla 1.1, «Aparcamiento»; SI 3 ap. 8 | [SI25] pp. 30–31, 34–35 |
| C7.5 | «Hidrante si la superficie construida está entre 5 000 y 10 000 m² (vivienda)» | VERIFICADO, incompleto | Es la superficie **total** construida, y uno más por cada 10 000 m² adicionales o fracción. Además, por «En general», hidrante si la altura de evacuación descendente **> 28 m** o la ascendente **> 6 m**. Cuentan los de la vía pública a < 100 m de la fachada accesible (nota 3). El garaje va aparte (1 000–10 000 m²) | Tabla 1.1 | [SI25] pp. 32, 33, 35 |
| C7.6 | «SI 5 no se aplica si la altura de evacuación ≤ 9 m» | **INTERPRETACIÓN** (casi cierto) | Con h descendente ≤ 9 m no hay espacio de maniobra (1.2), ni por tanto vial de aproximación exigible (1.1) ni fachada accesible (2). Quedan, sin umbral de altura, el pto 6 de 1.2 (zonas forestales) y el pto 5 (vías sin salida de más de 20 m). Ojo al borde: 9,00 m no activa («mayor que 9 m») | SI 5 ap. 1.1, 1.2 y 2 | [SI25] pp. 36–37 |
| C7.7 | «Vial: 3,5 m de anchura, 4,5 m de gálibo, 20 kN/m²» | VERIFICADO | Anchura mínima libre 3,5 m; gálibo 4,5 m; capacidad portante 20 kN/m². Más los tramos curvos (5,30 / 12,50 / 7,20 m). Solo es exigible al vial que forme parte del proyecto (Introducción II) | SI 5 ap. 1.1 | [SI25] p. 36 |
| C7.8 | «Estructura de vivienda h ≤ 15 m: R 60; sótano R 120» | VERIFICADO | Residencial Vivienda: sótano R 120; h ≤ 15 R 60; ≤ 28 R 90; > 28 R 120. El forjado sobre un local o un garaje lleva la R de lo que tiene **debajo** | Tabla 3.1 y su nota (1) | [SI25] p. 39 |
| C7.9 | «Unifamiliar R 30» | VERIFICADO, con dos matices | R 30 en sótano y plantas. Pero: estructura **común** de adosadas o agrupadas, la de Residencial Vivienda (nota 2); y el **garaje integrado** es riesgo especial bajo → R 90 (C4.13) | Tabla 3.1, notas; tabla 3.2; SI 1 tabla 2.1 | [SI25] pp. 14, 39 |
| C7.10 | «Garaje bajo viviendas R 120» | VERIFICADO | «Aparcamiento (situado bajo un uso distinto)»: R 120 en todas las columnas; R 180 si es robotizado. Un garaje que no sostiene otro uso (de uso exclusivo o sobre otro uso): R 90 | Tabla 3.1, nota (4); [DccSI] p. 65 | [SI25] p. 39 |
| C7.11 | «Local de riesgo especial bajo R 90» | VERIFICADO, con matiz | R 90, nunca menos que la estructura de la planta; R 30 si está bajo una cubierta no prevista para evacuación y su fallo no afecta a otras plantas ni a la compartimentación. Su suelo, según el uso de debajo | Tabla 3.2 y su nota | [SI25] p. 39 |

---

## Bloque 8 — Edición y cita

| # | Afirmación | Veredicto | Valor correcto | Cita | Fuente |
|---|---|---|---|---|---|
| 8.1 | Texto vigente | VERIFICADO | DB-SI consolidado «4 marzo 2025», que incluye RD 732/2019 y RD 164/2025 | [SI25] pp. 1–2 | [SI25] |
| 8.2 | ¿Modificó el RD 164/2025 SI 4, SI 5, SI 6 o los Anejos C y F? | LEÍDO (1 fuente, vía extractor) | **No**. Su disposición final segunda toca la Introducción y SI 1 (tablas 1.1 y 2.1) y actualiza referencias al nuevo RSCIEI | [BOE25] | [BOE25] |
| 8.3 | ¿De cuándo es el texto de SI 4 ap. 2? | LEÍDO (1 fuente, vía extractor) | Del RD 732/2019, que sustituyó sus puntos 1 y 2 por la remisión al RIPCI. El extractor dice que ese RD no tocó la tabla 1.1 | [BOE19] | [BOE19] |
| 8.4 | Fecha de entrada en vigor del RD 164/2025 | **NO VERIFICABLE** | El extractor no la dio | — | — |
| 8.5 | Cómo citar | **CRITERIO** (forma) | «CTE DB-SI "Seguridad en caso de incendio", texto consolidado de 4-03-2025 (codigotecnico.org), Sección SI 4, ap. 1, Tabla 1.1». Un solo texto para todo el DB-SI: no mezclar con ediciones de 2019 o anteriores. Los comentarios, como «Comentario del Ministerio (DB-SI con comentarios, 4-03-2025), no reglamentario». El RIPCI, como «RD 513/2017, Anexo I, Sección …» | — | — |

---

## Cifras que SÍ se pueden mostrar en la UI, con su cita

- **SI 4 tabla 1.1**, filas «En general», Residencial Vivienda, Administrativo, Comercial y Aparcamiento, literales, con las notas (1) a (9). Cita: «DB-SI (4-03-2025), SI 4 ap. 1, Tabla 1.1».
  - Extintor 21A-113B, 15 m de recorrido en cada planta desde todo origen de evacuación; en zonas de riesgo especial, nota (1) (15 m en bajo y medio, 10 m en alto).
  - Columna seca > 24 m (Residencial Vivienda, Administrativo, Comercial); en garaje, más de 3 plantas bajo rasante o más de 4 sobre rasante.
  - Detección y alarma > 50 m (Residencial Vivienda).
  - Hidrantes: «En general» (h descendente > 28 m o ascendente > 6 m); Residencial Vivienda y Administrativo 5 000–10 000 m² (total construida); Comercial y Aparcamiento 1 000–10 000 m²; uno más por cada 10 000 m² adicionales o fracción; nota (3) (100 m de la fachada accesible).
  - Ascensor de emergencia en las plantas con altura de evacuación > 28 m, y sus características del Anejo SI A (630 kg, 1,10 × 1,40 m, paso 1,00 m, < 60 s, 1 h, uno por cada mil ocupantes).
  - Extinción automática en edificios de más de 80 m.
  - BIE 25 mm en garaje > 500 m², en Administrativo > 2 000 m², en Comercial > 500 m²; en zonas de riesgo especial alto por combustibles sólidos (25 mm en vivienda, 45 mm en el resto).
- **RIPCI** (rotulado como RD 513/2017, no como CTE): extintor con la parte superior entre 80 y 120 cm; bocas de la columna seca a 0,90 m; señales según UNE 23033-1 y fotoluminiscentes según UNE 23035-4.
- **SI 5**: vial 3,5 m / 4,5 m / 20 kN/m²; curvas 5,30 / 12,50 / 7,20 m; umbral h descendente > 9 m; espacio de maniobra 5 m, altura libre la del edificio, 23 / 18 / 10 m, 30 m, 10 %, 100 kN sobre 20 cm ϕ; tapas > 0,15 × 0,15 m (UNE-EN 124:2015); columna seca 18 m; vías sin salida > 20 m; forestal 25 m / 5 m / 12,50 m; huecos con alféizar ≤ 1,20 m, 0,80 × 1,20 m, ejes a ≤ 25 m, rejas solo en plantas con h ≤ 9 m. Cita: «DB-SI, SI 5 ap. 1.1 / 1.2 / 2».
- **SI 6**: tablas 3.1 y 3.2 con sus notas; cubierta ligera R 30 (≤ 28 m, ≤ 1 kN/m²); escalera protegida R 30; especialmente protegida sin exigencia.
- **Anejo C**: tablas C.1 a C.5 con sus notas; yeso × 1,8; bovedilla cerámica × 2 (en C.2.3.5 pto 3); árido calizo −10 % en vigas, losas y forjados; armadura de piel si el recubrimiento pasa de 50 mm; regla de negativos (33 % / 25 %) para ≥ R 90; vigas planas con macizados > 10 cm como losas unidireccionales.
- **Anejo F**: tablas F.1 y F.2 (salvo la parte «REI-80»), con la regla de las hojas sumadas y el aviso de que EI no niega la capacidad portante.

## Cifras que NO deben mostrarse

- **Tamaños de señal (210 × 210, 420 × 420, 594 × 594 mm) como «DB-SI»**. No están en el texto vigente (C2.2).
- **Una equivalencia del mortero de cemento** en espesor de hormigón (C5.18). Solo el yeso tiene factor (1,8).
- **«REI-80»** de la tabla F.2 sin aviso (C6.6).
- **Un valor de la F.1 para una hoja revestida solo por la cara no expuesta** (C6.8).
- **Un factor útil → construida como si fuera del DB**. El 1,20 del repo es CRITERIO.
- **«SI 5 no se aplica»** en bloque para edificios de h ≤ 9 m sin el matiz de C7.6.
- **«En vivienda no hay BIE»** sin el matiz de C7.2.
- **«Unifamiliar R 30»** aplicado al garaje integrado (C4.13).
- **El número de hidrantes sin la nota (3)**: los de la vía pública a < 100 m cuentan.
- **Columna seca de garaje contando solo las plantas de garaje** (C1.14).
- **La R de un forjado por la planta de encima**. Es la del sector de **debajo** (tabla 3.1, nota 1).
- **Valores interpolados** entre filas de las tablas C.2 a C.5 o una columna de la C.4 para I_y/I_x > 2.
- **Cifras de las filas de Residencial Público, Hospitalario, Docente y Pública concurrencia** como si aplicaran al local sin uso. El local se deja previsto.
- **«Instrucción EHE» como norma vigente** en un texto propio de la herramienta. Se puede citar la nota (2) de la C.2 tal cual, pero no añadir que la EHE está en vigor.

## Criterios de proyecto (lo que el DB no fija)

| # | Tema | Propuesta | Por qué |
|---|---|---|---|
| K1 | **Superficie construida desde la útil** | El DB-SI **no da factor** (el Anejo SI A solo define «Superficie útil»; la construida no se define en él; el Anejo III de la Parte I no se ha leído). Propuesta, ya implantada en `edificio.ts`: construida supuesta = útil × 1,20 (CRITERIO) y pedir la real **solo** cuando el resultado cambia entre la útil (cota inferior segura, porque construida ≥ útil siempre) y la supuesta. Ampliar `cambiaConConstruida` a los umbrales «comprendida entre» (hidrantes: ≥ 1 000 o ≥ 5 000) y a los de 100 m² (¿uso Aparcamiento o riesgo especial bajo?) | Los umbrales del DB-SI son de construida. Con la útil se decide bien en la mayoría de los casos |
| K2 | **Construida del cuadro de superficies** | El lector de cuadros descarta hoy la construida (`montar.ts`: «Superficie construida: el cálculo usa la útil»). Para SI convendría guardarla en `superficieConstruida_m2` cuando el cuadro la da | Evita el supuesto justo donde importa |
| K3 | **Zona de trasteros: qué superficie** | La suma de las superficies de los trasteros, sin pasillos (comentario del Ministerio a SI 1 tabla 2.1, [DccSI] p. 21, «Superficie o volumen construido a considerar»). Lo usa SI 4 (riesgo alto → BIE) y SI 6 (tabla 3.2) | Comentario no reglamentario, pero es el criterio publicado |
| K4 | **Local sin uso en PB** | SI 4: solo la dotación general (extintor si hay origen de evacuación) y una frase «se justificará con la actividad» ([DccSI] p. 6). SI 6: suponer **Comercial** para la R de su estructura y del forjado que tiene encima (R 90 con h ≤ 15 m; R 120 con h ≤ 28; R 180 con h > 28), para no condicionar el uso futuro. Decisión editable | Con Residencial (R 60) el forjado no valdría para un comercio posterior |
| K5 | **Salida de edificio a cota ±0,00** | Las alturas de evacuación del repo suponen la salida en la PB a cota 0. Aviso revisable si el portal no está a la rasante | El modelo no describe la rasante del portal |
| K6 | **Vial y espacio de maniobra en un edificio entre medianeras** | Lo habitual: el espacio de maniobra es la **calle pública** delante de la fachada del portal. El proyecto no la puede modificar (Introducción II): la memoria dice «El espacio de maniobra es la vía pública [nombre], de anchura libre ≥ 5 m … ; no forma parte del proyecto (DB-SI, Introducción II)». Decisión con tres opciones: «la calle cumple», «la calle no cumple (se indica)», «espacio propio del proyecto» (solo este se comprueba) | Ver C3.16 |
| K7 | **Fachada accesible entre medianeras** | Lo habitual: la fachada a la calle, con balconeras o ventanas de cada planta de al menos 0,80 × 1,20 m y alféizar ≤ 1,20 m; ejes a ≤ 25 m; sin rejas por encima de 9 m. Decisión: «la fachada a la calle cumple» con las cifras a la vista | Ver C3.14 y C3.18 |
| K8 | **Estructura de un edificio de viviendas entre medianeras** | Lo habitual: hormigón armado; pilares de ≥ 250 mm (nota 2 de la C.2); forjado unidireccional con bovedilla y guarnecido de yeso en viviendas (C.2.3.5 pto 1: a_m de la C.4 «una dirección»: 20 mm para R 60); en el garaje, techo sin revestir → C.2.3.5 pto 3 (nervios como vigas de la C.3, R 120: 200/50, 250/45, 300/40 o 500/35 y b₀ ≥ 120, contando la bovedilla cerámica × 2), o proyectado conforme a UNE-EN 13381-3. La herramienta pide el material, el tipo de forjado y si lleva revestimiento inferior, y muestra las cifras de la fila exigida; las dimensiones las comprueba el proyectista | El DB da tablas por elemento; no hay «solución tipo» del DB |
| K9 | **Losas con I_y/I_x > 2** | Usar la columna «flexión en una dirección», rotulada CRITERIO | La C.4 no tiene columna para > 2 |
| K10 | **Columnas «≤ 15 / ≤ 28 / > 28»** y «comprendida entre» | Intervalos continuos (C4.6) y límite inferior incluido (C1.6) | Lectura prudente |
| K11 | **Extintores, «lo habitual»** | Plurifamiliar: uno por planta en el rellano o pasillo común (si el punto común más alejado está a ≤ 15 m de recorrido), los del garaje a ≤ 15 m de cada plaza, uno junto a la puerta de cada local de riesgo especial (puede servir a varios). Unifamiliar: ninguno, salvo garaje integrado. El proyectista confirma el recorrido | La herramienta no mide planos |
| K12 | **Hidrantes en vía pública** | Decisión: «hay hidrante público a menos de 100 m de la fachada accesible» (sí/no). Sí → la dotación se cumple con él | Nota (3) |

---

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Dotación de instalaciones | DB-SI | Consolidado 4-03-2025 (RD 164/2025) | 2025-03-04 | SI 4 ap. 1 | Tabla 1.1 | codigotecnico.org · DBSI.pdf, pp. 32–35 |
| Señalización | ídem | ídem | 2025-03-04 | SI 4 ap. 2 pto 1 | — | ídem, p. 35 (redacción RD 732/2019) |
| Aproximación | ídem | ídem | 2025-03-04 | SI 5 ap. 1.1 ptos 1 y 2 | — | ídem, p. 36 |
| Entorno | ídem | ídem | 2025-03-04 | SI 5 ap. 1.2 ptos 1 a 6 | — | ídem, pp. 36–37 |
| Accesibilidad por fachada | ídem | ídem | 2025-03-04 | SI 5 ap. 2 pto 1 | — | ídem, p. 37 |
| R de la estructura | ídem | ídem | 2025-03-04 | SI 6 ap. 3 pto 1 | Tabla 3.1 | ídem, p. 39 |
| R de zonas de riesgo especial | ídem | ídem | 2025-03-04 | SI 6 ap. 3 pto 1 | Tabla 3.2 | ídem, p. 39 |
| Cubierta ligera, escaleras | ídem | ídem | 2025-03-04 | SI 6 ap. 3 ptos 2 y 3 | — | ídem, pp. 39–40 |
| Δa_si | ídem | ídem | 2025-03-04 | Anejo C, C.2.1 pto 2 | Tabla C.1 | ídem, p. 57 |
| Soportes y muros | ídem | ídem | 2025-03-04 | Anejo C, C.2.2 | Tabla C.2 | ídem, p. 58 |
| Vigas | ídem | ídem | 2025-03-04 | Anejo C, C.2.3.1 | Tabla C.3 | ídem, p. 59 |
| Losas macizas | ídem | ídem | 2025-03-04 | Anejo C, C.2.3.3 | Tabla C.4 | ídem, pp. 59–60 |
| Forjados bidireccionales | ídem | ídem | 2025-03-04 | Anejo C, C.2.3.4 | Tabla C.5 | ídem, p. 60 |
| Forjados unidireccionales y revestimientos | ídem | ídem | 2025-03-04 | Anejo C, C.2.3.5 y C.2.4 | — | ídem, pp. 60–61 |
| Fábricas de ladrillo | ídem | ídem | 2025-03-04 | Anejo F | Tabla F.1 | ídem, p. 85 |
| Fábricas de bloque de hormigón | ídem | ídem | 2025-03-04 | Anejo F | Tabla F.2 | ídem, p. 85 |

---

## Pendientes

1. **UNE 23033-1**: no leída. Si se quiere dar el tamaño de las señales, sale de ahí, no del CTE.
2. **RIPCI leído solo vía extractor**, y en su texto original de 2017 (no el consolidado). Falta leerlo entero, en particular desde dónde se miden los 100 m / 40 m a un hidrante (C1.21).
3. **Tabla F.2, «REI-80»**: comprobar en el BOE de 28-03-2006 (RD 314/2006) y en la corrección de errores de 25-01-2008 si el original dice «REI-180».
4. **Nota (1) de la tabla C.1**: qué es «la columna 3 de la tabla C.3» (¿opción 2?). No afecta a los módulos si no se calcula Δa_si.
5. **Alcance del RD 164/2025 y su entrada en vigor**: leídos solo vía extractor (8.2, 8.4).
6. **«Superficie construida»** y **«planta de sótano»**: sin definición en el DB-SI. Falta leer el Anejo III de la Parte I del CTE.
7. **Código Estructural (RD 470/2021) frente a la «Instrucción EHE»** de la nota (2) de la C.2: no releído en esta sesión.
8. **Decisiones de criterio que el responsable del proyecto debe validar**: K1 (factor 1,20 y ampliar `cambiaConConstruida`), K3, K4 (local sin uso como Comercial en SI 6), K5, K6 a K8 («lo habitual»), K9, K10, K11, K12; y las INTERPRETACIONES C1.17 (unifamiliar sin extintor salvo garaje), C4.13 (garaje de unifamiliar R 90), C3.3 y C3.13 (1.1 y 2 ligados al umbral de 9 m).

---

## Para el código

### Observaciones sobre lo que ya existe

| # | Fichero | Hoy | Propuesta | Motivo |
|---|---|---|---|---|
| R1 | `modules/si/edificio.ts`, `usoSiDe` | `garaje_privado` → `vivienda_unifamiliar` | Correcto para la tabla 3.1, pero el garaje privado es **además** zona de riesgo especial bajo «en todo caso» (SI 1 tabla 2.1): extintor (SI 4) y R 90 (SI 6 tabla 3.2). Que `riesgo.ts` lo marque | C1.17, C4.13 |
| R2 | ídem | `garaje` → `aparcamiento` siempre | Solo si la construida **excede de 100 m²** (Anejo SI A, «Uso Aparcamiento»). Si no, riesgo especial bajo «en todo caso». Usar `cambiaConConstruida(…, 100)` | Anejo SI A; SI 1 tabla 2.1 |
| R3 | ídem, `cambiaConConstruida` | Solo «excede de» (estricto) | Añadir la variante «≥» para «comprendida entre» (hidrantes) | C1.6, K1 |
| R4 | ídem, `alturaAscendente_m` | Cota de la planta más baja, aunque sea de ocupación nula | Mantener: coincide con el comentario del Ministerio (C1.9). Rotular la cita como comentario. Hace falta para el hidrante de «En general» (> 6 m) | C1.9 |
| R5 | `lib/edificio/derivar.ts`, `alturaEvacuacion_m` | Cota del suelo de la última planta que no sea solo de ocupación nula | Correcto (Anejo SI A). Dos avisos: unifamiliar (su interior no es origen de evacuación: SI 5 no se activa) y dúplex en la última planta (la planta alta de un dúplex es interior de vivienda). Para el ascensor de emergencia hace falta la altura **de cada planta** | C3.20, C1.8 |
| R6 | — | — | Columna seca de garaje: magnitud = número de plantas desde la rasante hasta la planta de garaje **más baja** (máxima diferencia de cotas), no el número de plantas de garaje | C1.14 |
| R7 | `feature-19.md`, SI4 | «superficie construida del garaje si decide algo» | Añadir la decisión «hidrante público a < 100 m» (K12) y el aviso de detección por SI 3-8 (C1.15) | C1.10, C1.15 |
| R8 | `feature-19.md`, SI5 | «si la altura de evacuación excede de 9 m» | Correcto. Añadir el borde (9,00 m no activa) y los ptos 5 y 6 de 1.2 como avisos sin umbral | C3.4, C7.6 |

### Datos propuestos para `src/modules/si/tablas.ts`

Sigue el patrón `tablaCTE(procedencia, datos)` de `src/lib/cte/tabla.ts`. **No está aplicado ni compilado.** Todas las cifras salen de la imagen de [SI25]; coinciden con el texto de [SI25] y de [DccSI]. Los criterios de proyecto van al final, fuera de `tablaCTE`, para que la ficha no los cite como CTE.

```ts
import { tablaCTE } from "../../lib/cte/tabla";

/** DB-SI vigente: consolidado 4-mar-2025. El RD 164/2025 no toca SI 4, SI 5, SI 6 ni los
 *  Anejos C y F (solo Introducción y SI 1; leído vía extractor). SI 4 ap. 2 es redacción
 *  del RD 732/2019. */
const PROC_SI = {
  db: "DB-SI",
  edicion: "Consolidado 4-03-2025 (RD 164/2025)",
  fecha: "2025-03-04",
  fuente: "codigotecnico.org · DBSI.pdf (tablas cotejadas casilla a casilla en imagen)",
} as const;

// ============================================================================
// SI 4 · Tabla 1.1 — Dotación de instalaciones de protección contra incendios
// ============================================================================

/** Magnitudes con las que se evalúan las casillas. */
export type MagnitudSi4 =
  /** Altura de evacuación (descendente) del edificio. Anejo SI A. */
  | "hEvacDescendente_m"
  /** Altura de evacuación ascendente del edificio (sótano más bajo; ver comentario del Ministerio). */
  | "hEvacAscendente_m"
  /** Altura de evacuación de la planta considerada (ascensor de emergencia). */
  | "hEvacPlanta_m"
  /** Superficie CONSTRUIDA del edificio o establecimiento del uso de la fila. */
  | "sConstruida_m2"
  /** Densidad de ocupación [personas/m²]; «mayor que 1 persona cada 5 m²» = > 0,2. */
  | "densidad_p_m2"
  /** Aparcamiento: plantas desde la rasante hasta la más baja (máxima diferencia de cotas). */
  | "plantasBajoRasante"
  | "plantasSobreRasante";

export interface Umbral {
  magnitud: MagnitudSi4;
  /** ">" = «excede de», «mayor que», «más de». "≥" solo en «comprendida entre» (INTERPRETACIÓN). */
  comparacion: ">" | "≥";
  valor: number;
}

/** Se exige si se cumple ALGUNA rama; dentro de una rama, TODOS sus umbrales. */
export type CondicionSi4 =
  | { tipo: "umbrales"; ramas: readonly (readonly Umbral[])[] }
  | { tipo: "origenesDeEvacuacion" }
  | { tipo: "zonasRiesgoEspecial"; grados: readonly ("bajo" | "medio" | "alto")[]; soloSolidos?: true }
  | { tipo: "noEvaluable"; motivo: string };

export type InstalacionSi4 =
  | "extintores" | "extintores_moviles" | "bie" | "ascensor_emergencia" | "hidrantes"
  | "extincion_automatica" | "columna_seca" | "deteccion_y_alarma" | "alarma" | "deteccion";

export interface FilaSi4 {
  instalacion: InstalacionSi4;
  condicion: CondicionSi4;
  /** Casilla «Condiciones», literal. */
  literal: string;
  notas: readonly number[];
  pagina: number;
  bie_mm?: 25 | 45;
  /** «Uno … y uno más por cada X m² adicionales o fracción»: n = 1 + ceil(max(0, S − primeroHasta) / cada). */
  hidrantes?: { primeroHasta_m2: number; unoMasCada_m2: number };
  /** Cuando la casilla limita dónde («detectores en zonas de riesgo alto»). */
  alcance?: string;
}

const s = (comparacion: ">" | "≥", valor: number): Umbral => ({ magnitud: "sConstruida_m2", comparacion, valor });

export const DOTACION_SI4_TABLA_1_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 4 ap. 1", tabla: "Tabla 1.1" },
  {
    en_general: [
      { instalacion: "extintores", condicion: { tipo: "origenesDeEvacuacion" }, pagina: 32, notas: [],
        literal: "Uno de eficacia 21A -113B: A 15 m de recorrido en cada planta, como máximo, desde todo origen de evacuación." },
      { instalacion: "extintores", condicion: { tipo: "zonasRiesgoEspecial", grados: ["bajo", "medio", "alto"] }, pagina: 32, notas: [1],
        literal: "Uno de eficacia 21A -113B: En las zonas de riesgo especial conforme al capítulo 2 de la Sección 1 de este DB." },
      { instalacion: "bie", condicion: { tipo: "zonasRiesgoEspecial", grados: ["alto"], soloSolidos: true }, pagina: 32, notas: [2],
        bie_mm: 45, // 25 mm en edificios de uso Residencial Vivienda (nota 2)
        literal: "En zonas de riesgo especial alto, conforme al capítulo 2 de la Sección SI1, en las que el riesgo se deba principalmente a materias combustibles sólidas" },
      { instalacion: "ascensor_emergencia", pagina: 32, notas: [],
        condicion: { tipo: "umbrales", ramas: [[{ magnitud: "hEvacPlanta_m", comparacion: ">", valor: 28 }]] },
        literal: "En las plantas cuya altura de evacuación exceda de 28 m" },
      { instalacion: "hidrantes", pagina: 32, notas: [3], hidrantes: { primeroHasta_m2: 10000, unoMasCada_m2: 10000 },
        condicion: { tipo: "umbrales", ramas: [
          [{ magnitud: "hEvacDescendente_m", comparacion: ">", valor: 28 }],
          [{ magnitud: "hEvacAscendente_m", comparacion: ">", valor: 6 }],
          [{ magnitud: "densidad_p_m2", comparacion: ">", valor: 0.2 }, s("≥", 2000)],
        ] },
        literal: "Si la altura de evacuación descendente excede de 28 m o si la ascendente excede de 6 m, así como en establecimientos de densidad de ocupación mayor que 1 persona cada 5 m2 y cuya superficie construida está comprendida entre 2.000 y 10.000 m². Al menos un hidrante hasta 10.000 m2 de superficie construida y uno más por cada 10.000 m2 adicionales o fracción." },
      { instalacion: "extincion_automatica", pagina: 33, notas: [],
        condicion: { tipo: "umbrales", ramas: [[{ magnitud: "hEvacDescendente_m", comparacion: ">", valor: 80 }]] },
        literal: "Salvo otra indicación en relación con el uso, en todo edificio cuya altura de evacuación exceda de 80 m." },
      { instalacion: "extincion_automatica", pagina: 33, notas: [4],
        condicion: { tipo: "noEvaluable", motivo: "Cocinas > 20 kW (Hospitalario, Residencial Público) o > 50 kW (resto): no modeladas" },
        literal: "En cocinas en las que la potencia instalada exceda de 20 kW en uso Hospitalario o Residencial Público o de 50 kW en cualquier otro uso" },
      { instalacion: "extincion_automatica", pagina: 33, notas: [],
        condicion: { tipo: "noEvaluable", motivo: "Centros de transformación: no modelados" },
        literal: "En centros de transformación cuyos aparatos tengan aislamiento dieléctrico con punto de inflamación menor que 300 ºC y potencia instalada mayor que 1 000 kVA en cada aparato o mayor que 4 000 kVA en el conjunto de los aparatos. Si el centro está integrado en un edificio de uso Pública concurrencia y tiene acceso desde el interior del edificio, dichas potencias son 630 kVA y 2 520 kVA respectivamente." },
    ],
    residencial_vivienda: [
      { instalacion: "columna_seca", pagina: 33, notas: [5],
        condicion: { tipo: "umbrales", ramas: [[{ magnitud: "hEvacDescendente_m", comparacion: ">", valor: 24 }]] },
        literal: "Si la altura de evacuación excede de 24 m." },
      { instalacion: "deteccion_y_alarma", pagina: 33, notas: [6],
        condicion: { tipo: "umbrales", ramas: [[{ magnitud: "hEvacDescendente_m", comparacion: ">", valor: 50 }]] },
        literal: "Si la altura de evacuación excede de 50 m." },
      { instalacion: "hidrantes", pagina: 33, notas: [3], hidrantes: { primeroHasta_m2: 10000, unoMasCada_m2: 10000 },
        condicion: { tipo: "umbrales", ramas: [[s("≥", 5000)]] },
        literal: "Uno si la superficie total construida esté comprendida entre 5.000 y 10.000 m2. Uno más por cada 10.000 m2 adicionales o fracción." },
    ],
    administrativo: [
      { instalacion: "bie", pagina: 33, notas: [7], bie_mm: 25,
        condicion: { tipo: "umbrales", ramas: [[s(">", 2000)]] },
        literal: "Si la superficie construida excede de 2.000 m2." },
      { instalacion: "columna_seca", pagina: 33, notas: [5],
        condicion: { tipo: "umbrales", ramas: [[{ magnitud: "hEvacDescendente_m", comparacion: ">", valor: 24 }]] },
        literal: "Si la altura de evacuación excede de 24 m." },
      { instalacion: "alarma", pagina: 33, notas: [6],
        condicion: { tipo: "umbrales", ramas: [[s(">", 1000)]] },
        literal: "Si la superficie construida excede de 1.000 m2." },
      { instalacion: "deteccion", pagina: 33, notas: [], alcance: "detectores en zonas de riesgo alto",
        condicion: { tipo: "umbrales", ramas: [[s(">", 2000)]] },
        literal: "Si la superficie construida excede de 2.000 m2, detectores en zonas de riesgo alto conforme al capítulo 2 de la Sección 1 de este DB." },
      { instalacion: "deteccion", pagina: 33, notas: [], alcance: "en todo el edificio",
        condicion: { tipo: "umbrales", ramas: [[s(">", 5000)]] },
        literal: "Si excede de 5.000 m2, en todo el edificio." },
      { instalacion: "hidrantes", pagina: 33, notas: [3], hidrantes: { primeroHasta_m2: 10000, unoMasCada_m2: 10000 },
        condicion: { tipo: "umbrales", ramas: [[s("≥", 5000)]] },
        literal: "Uno si la superficie total construida está comprendida entre 5.000 y 10.000 m2. Uno más por cada 10.000 m2 adicionales o fracción." },
    ],
    /** Solo para «lo que se deja previsto» en un local: el local sin uso no tiene uso aún. */
    comercial: [
      { instalacion: "extintores_moviles", pagina: 34, notas: [],
        condicion: { tipo: "noEvaluable", motivo: "Agrupación de locales de riesgo especial medio y alto > 1.000 m²: no modelada" },
        literal: "En toda agrupación de locales de riesgo especial medio y alto cuya superficie construida total excede de 1.000 m², extintores móviles de 50 kg de polvo, distribuidos a razón de un extintor por cada 1 000 m² de superficie que supere dicho límite o fracción." },
      { instalacion: "bie", pagina: 34, notas: [7], bie_mm: 25,
        condicion: { tipo: "umbrales", ramas: [[s(">", 500)]] },
        literal: "Si la superficie construida excede de 500 m2." },
      { instalacion: "columna_seca", pagina: 34, notas: [5],
        condicion: { tipo: "umbrales", ramas: [[{ magnitud: "hEvacDescendente_m", comparacion: ">", valor: 24 }]] },
        literal: "Si la altura de evacuación excede de 24 m." },
      { instalacion: "alarma", pagina: 34, notas: [6],
        condicion: { tipo: "umbrales", ramas: [[s(">", 1000)]] },
        literal: "Si la superficie construida excede de 1.000 m2." },
      { instalacion: "deteccion", pagina: 34, notas: [8, 9],
        condicion: { tipo: "umbrales", ramas: [[s(">", 2000)]] },
        literal: "Si la superficie construida excede de 2.000 m2." },
      { instalacion: "extincion_automatica", pagina: 34, notas: [],
        condicion: { tipo: "noEvaluable", motivo: "Área pública de ventas > 1.500 m² con carga de fuego > 500 MJ/m²: depende de la actividad" },
        literal: "Si la superficie total construida del área pública de ventas excede de 1.500 m2 y en ella la densidad de carga de fuego ponderada y corregida aportada por los productos comercializados es mayor que 500 MJ/m², contará con la instalación, tanto el área pública de ventas, como los locales y zonas de riesgo especial medio y alto conforme al capítulo 2 de la Sección 1 de este DB." },
      { instalacion: "hidrantes", pagina: 34, notas: [3], hidrantes: { primeroHasta_m2: 10000, unoMasCada_m2: 10000 },
        condicion: { tipo: "umbrales", ramas: [[s("≥", 1000)]] },
        literal: "Uno si la superficie total construida está comprendida entre 1 000 y 10 000 m2. Uno más por cada 10 000 m2 adicionales o fracción." },
    ],
    /** Solo si la zona es «uso Aparcamiento» (construida > 100 m², no garaje de unifamiliar). Convencional, no robotizado. */
    aparcamiento: [
      { instalacion: "bie", pagina: 34, notas: [7], bie_mm: 25,
        condicion: { tipo: "umbrales", ramas: [[s(">", 500)]] },
        literal: "Si la superficie construida excede de 500 m2. Se excluyen los aparcamientos robotizados." },
      { instalacion: "columna_seca", pagina: 34, notas: [5],
        condicion: { tipo: "umbrales", ramas: [
          [{ magnitud: "plantasBajoRasante", comparacion: ">", valor: 3 }],
          [{ magnitud: "plantasSobreRasante", comparacion: ">", valor: 4 }],
        ] },
        literal: "Si existen más de tres plantas bajo rasante o más de cuatro sobre rasante, con tomas en todas sus plantas." },
      { instalacion: "deteccion", pagina: 35, notas: [8],
        condicion: { tipo: "umbrales", ramas: [[s(">", 500)]] },
        literal: "En aparcamientos convencionales cuya superficie construida exceda de 500 m2. Los aparcamientos robotizados dispondrán de pulsadores de alarma en todo caso." },
      { instalacion: "hidrantes", pagina: 35, notas: [3], hidrantes: { primeroHasta_m2: 10000, unoMasCada_m2: 10000 },
        condicion: { tipo: "umbrales", ramas: [[s("≥", 1000)]] },
        literal: "Uno si la superficie construida está comprendida entre 1.000 y 10.000 m2 y uno más cada 10.000 m2 más o fracción." },
      { instalacion: "extincion_automatica", pagina: 35, notas: [],
        condicion: { tipo: "noEvaluable", motivo: "Solo aparcamientos robotizados" },
        literal: "En todo aparcamiento robotizado." },
    ],
  } as const satisfies Record<string, readonly FilaSi4[]>,
);

export const NOTAS_SI4_TABLA_1_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 4 ap. 1", tabla: "Tabla 1.1 (notas)" },
  {
    textos: {
      1: "Un extintor en el exterior del local o de la zona y próximo a la puerta de acceso, el cual podrá servir simultáneamente a varios locales o zonas. En el interior del local o de la zona se instalarán además los extintores necesarios para que el recorrido real hasta alguno de ellos, incluido el situado en el exterior, no sea mayor que 15 m en locales y zonas de riesgo especial medio o bajo, o que 10 m en locales o zonas de riesgo especial alto.",
      2: "Los equipos serán de tipo 45 mm, excepto en edificios de uso Residencial Vivienda, en lo que serán de tipo 25 mm.",
      3: "Para el cómputo de la dotación que se establece se pueden considerar los hidrantes que se encuentran en la vía pública a menos de 100 m de la fachada accesible del edificio. Los hidrantes que se instalen pueden estar conectados a la red pública de suministro de agua.",
      4: "Para la determinación de la potencia instalada sólo se considerarán los aparatos directamente destinados a la preparación de alimentos y susceptibles de provocar ignición. Las freidoras y las sartenes basculantes se computarán a razón de 1 kW por cada litro de capacidad, independientemente de la potencia que tengan. La protección aportada por la instalación automática cubrirá los aparatos antes citados y la eficacia del sistema debe quedar asegurada teniendo en cuenta la actuación del sistema de extracción de humos.",
      5: "Los municipios pueden sustituir esta condición por la de una instalación de bocas de incendio equipadas cuando, por el emplazamiento de un edificio o por el nivel de dotación de los servicios públicos de extinción existentes, no quede garantizada la utilidad de la instalación de columna seca.",
      6: "El sistema de alarma transmitirá señales visuales además de acústicas. Las señales visuales serán perceptibles incluso en el interior de viviendas accesibles para personas con discapacidad auditiva (ver definición en el Anejo SUA A del DB SUA).",
      7: "Los equipos serán de tipo 25 mm.",
      8: "El sistema dispondrá al menos de detectores de incendio.",
      9: "La condición de disponer detectores automáticos térmicos puede sustituirse por una instalación automática de extinción no exigida.",
    },
    /** Nota (1), en cifras. */
    recorridoMaxRiesgoBajoMedio_m: 15,
    recorridoMaxRiesgoAlto_m: 10,
    /** Nota (3), en cifras. */
    hidrantePublicoMaxFachadaAccesible_m: 100,
  } as const,
);

/** Número de hidrantes de una fila con `hidrantes` (cuando la condición se cumple). */
export function numeroHidrantes(sConstruida_m2: number, h: { primeroHasta_m2: number; unoMasCada_m2: number }): number {
  return 1 + Math.max(0, Math.ceil((sConstruida_m2 - h.primeroHasta_m2) / h.unoMasCada_m2));
}

/** Anejo SI A, «Ascensor de emergencia». */
export const ASCENSOR_EMERGENCIA = tablaCTE(
  { ...PROC_SI, articulo: "Anejo SI A, «Ascensor de emergencia»" },
  { carga_kg: 630, cabina_m: [1.1, 1.4], paso_m: 1.0, recorridoMax_s: 60, autonomia_h: 1, ocupantesPorAscensor: 1000 } as const,
);

/** SI 4 ap. 2: solo remite al RIPCI. Sin cifras. */
export const SENALIZACION_SI4 = tablaCTE(
  { ...PROC_SI, articulo: "SI 4 ap. 2 pto 1 (redacción RD 732/2019)" },
  { remiteA: "Reglamento de instalaciones de protección contra incendios, RD 513/2017, de 22 de mayo" } as const,
);

// ============================================================================
// SI 5 · Intervención de los bomberos
// ============================================================================

export const SI5_APROXIMACION = tablaCTE(
  { ...PROC_SI, articulo: "SI 5 ap. 1.1 ptos 1 y 2" },
  {
    anchuraLibreMin_m: 3.5,
    galiboMin_m: 4.5,
    capacidadPortante_kN_m2: 20,
    curva: { radioMin1_m: 5.3, radioMin2_m: 12.5, anchuraLibre_m: 7.2 },
  } as const,
);

export const SI5_ENTORNO = tablaCTE(
  { ...PROC_SI, articulo: "SI 5 ap. 1.2 ptos 1 a 6" },
  {
    /** Se exige si la altura de evacuación DESCENDENTE es mayor que 9 m (estricto). */
    umbralHDescendente_m: 9,
    anchuraLibreMin_m: 5,
    alturaLibre: "la del edificio",
    /** h ≤ 15 → 23 m; 15 < h ≤ 20 → 18 m; h > 20 → 10 m (h = altura de evacuación). */
    separacionMaxFachada: [
      { hastaH_m: 15, max_m: 23 },
      { hastaH_m: 20, max_m: 18 },
      { hastaH_m: Number.POSITIVE_INFINITY, max_m: 10 },
    ],
    distanciaMaxAccesos_m: 30,
    pendienteMax_pct: 10,
    punzonamiento: { carga_kN: 100, diametro_cm: 20 },
    tapasRegistro: { mayorQue_m: [0.15, 0.15], norma: "UNE-EN 124:2015" },
    columnaSecaBombeoMax_m: 18,
    viaSinSalidaMasDe_m: 20,
    forestal: { franja_m: 25, caminoPerimetral_m: 5, fondoSacoRadio_m: 12.5 },
  } as const,
);

export const SI5_FACHADA = tablaCTE(
  { ...PROC_SI, articulo: "SI 5 ap. 2 pto 1" },
  {
    alfeizarMax_m: 1.2,
    huecoMin_m: { horizontal: 0.8, vertical: 1.2 },
    separacionEjesMax_m: 25,
    /** Elementos de seguridad (rejas) solo en huecos de plantas con altura de evacuación ≤ 9 m. */
    elementosSeguridadHastaH_m: 9,
  } as const,
);

// ============================================================================
// SI 6 · Resistencia al fuego de la estructura
// ============================================================================

/** Columnas de la tabla 3.1. h = altura de evacuación DEL EDIFICIO (no de la planta). */
export type ColumnaTabla31 = "sotano" | "hasta15" | "hasta28" | "mas28";
export function columnaTabla31(bajoRasante: boolean, hEdificio_m: number): ColumnaTabla31 {
  if (bajoRasante) return "sotano";
  if (hEdificio_m <= 15) return "hasta15";
  if (hEdificio_m <= 28) return "hasta28";
  return "mas28";
}

/** null = casilla «–» (sin valor en el DB). R en minutos. */
export const R_SI6_TABLA_3_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 6 ap. 3 pto 1", tabla: "Tabla 3.1" },
  {
    vivienda_unifamiliar: { sotano: 30, hasta15: 30, hasta28: null, mas28: null, notas: [1, 2] },
    /** Misma fila: Residencial Vivienda, Residencial Público, Docente, Administrativo. */
    residencial_vivienda: { sotano: 120, hasta15: 60, hasta28: 90, mas28: 120, notas: [1] },
    administrativo: { sotano: 120, hasta15: 60, hasta28: 90, mas28: 120, notas: [1] },
    /** Misma fila: Comercial, Pública concurrencia, Hospitalario. Sótano R 180 si h del edificio > 28 m (nota 3). */
    comercial: { sotano: 120, hasta15: 90, hasta28: 120, mas28: 180, sotanoSiHMas28: 180, notas: [1, 3] },
    aparcamiento_exclusivo_o_sobre_otro_uso: { todas: 90, notas: [1] },
    aparcamiento_bajo_uso_distinto: { todas: 120, robotizado: 180, notas: [1, 4] },
    textosNotas: {
      1: "La resistencia al fuego suficiente R de los elementos estructurales de un suelo que separa sectores de incendio es función del uso del sector inferior. Los elementos estructurales de suelos que no delimitan un sector de incendios, sino que están contenidos en él, deben tener al menos la resistencia al fuego suficiente R que se exija para el uso de dicho sector",
      2: "En viviendas unifamiliares agrupadas o adosadas, los elementos que formen parte de la estructura común tendrán la resistencia al fuego exigible a edificios de uso Residencial Vivienda.",
      3: "R 180 si la altura de evacuación del edificio excede de 28 m.",
      4: "R 180 cuando se trate de aparcamientos robotizados.",
    },
  } as const,
);

export const R_SI6_TABLA_3_2 = tablaCTE(
  { ...PROC_SI, articulo: "SI 6 ap. 3 pto 1", tabla: "Tabla 3.2" },
  {
    bajo: 90,
    medio: 120,
    alto: 180,
    /** Nota (1): nunca menos que la estructura portante de la planta, salvo bajo cubierta no prevista
     *  para evacuación cuyo fallo no comprometa otras plantas ni la compartimentación: R 30. */
    bajoCubiertaNoEvacuacion: 30,
    /** Nota (1), 2.º párrafo: la R del SUELO de la zona es la del uso del espacio que tiene debajo. */
    suelo: "funcion del uso del espacio existente bajo dicho suelo",
  } as const,
);

export const SI6_OTRAS = tablaCTE(
  { ...PROC_SI, articulo: "SI 6 ap. 3 ptos 2 y 3; ap. 4; ap. 6 pto 4" },
  {
    cubiertaLigera: { R: 30, alturaMaxSobreRasanteExterior_m: 28, cargaPermanenteCerramientoMax_kN_m2: 1 },
    escaleraOPasilloProtegidoR: 30,
    /** Escalera especialmente protegida: no se exige R. */
    escaleraEspecialmenteProtegidaR: null,
    carpas: { R: 30, perforacionMin_cm2: 20 },
    gammaMfi: 1,
  } as const,
);

// ============================================================================
// Anejo C · Hormigón armado. [b_mín, a_m] en mm. Claves = minutos de la clase.
// ============================================================================

/** Tabla C.1, Δa_si (mm). Interpolable entre valores de μ_fi. */
export const DELTA_A_C1 = tablaCTE(
  { ...PROC_SI, articulo: "Anejo C, C.2.1 pto 2", tabla: "Tabla C.1" },
  {
    mu: [0.4, 0.5, 0.6], // la primera fila es «≤ 0,4»
    armar_vigasLosas: [5, 0, -5],
    armar_resto: [0, 0, 0],
    pretensar_vigasLosas_barras: [-5, -10, -15],
    pretensar_vigasLosas_alambres: [-10, -15, -20],
    pretensar_resto_barras: [-10, -10, -10],
    pretensar_resto_alambres: [-15, -15, -15],
    /** Nota (1): −10 mm en armaduras de esquina de vigas con una sola capa si el ancho < b_mín de «la columna 3 de la tabla C.3». */
    esquinaUnaCapa_mm: -10,
  } as const,
);

export const COMPRESION_C2 = tablaCTE(
  { ...PROC_SI, articulo: "Anejo C, C.2.2", tabla: "Tabla C.2" },
  {
    porR: {
      30: { soporte: [150, 15], muroUnaCara: [100, 15], muroAmbasCaras: [120, 15] },
      60: { soporte: [200, 20], muroUnaCara: [120, 15], muroAmbasCaras: [140, 15] },
      90: { soporte: [250, 30], muroUnaCara: [140, 20], muroAmbasCaras: [160, 25] },
      120: { soporte: [250, 40], muroUnaCara: [160, 25], muroAmbasCaras: [180, 35] },
      180: { soporte: [350, 45], muroUnaCara: [200, 40], muroAmbasCaras: [250, 45] },
      240: { soporte: [400, 50], muroUnaCara: [250, 50], muroAmbasCaras: [300, 50] },
    },
    notas: {
      1: "Los recubrimientos por exigencias de durabilidad pueden requerir valores superiores.",
      2: "Los soportes ejecutados en obra deben tener, de acuerdo con la Instrucción EHE, una dimensión mínima de 250 mm.", // en soportes R 30 y R 60
      3: "La resistencia al fuego aportada se puede considerar REI", // en todo «muro expuesto por una cara»
    },
    /** > R 90 con armadura > 2 % de la sección: armadura repartida en todas las caras (salvo solapos). */
    cuantiaRepartirSiMasDe_pct: 2,
  } as const,
);

export const VIGAS_C3 = tablaCTE(
  { ...PROC_SI, articulo: "Anejo C, C.2.3.1", tabla: "Tabla C.3" },
  {
    porR: {
      30: { opciones: [[80, 20], [120, 15], [200, 10]], b0min_mm: 80 },
      60: { opciones: [[100, 30], [150, 25], [200, 20]], b0min_mm: 100 },
      90: { opciones: [[150, 40], [200, 35], [250, 30], [400, 25]], b0min_mm: 100 },
      120: { opciones: [[200, 50], [250, 45], [300, 40], [500, 35]], b0min_mm: 120 },
      180: { opciones: [[300, 75], [350, 65], [400, 60], [600, 50]], b0min_mm: 140 },
      240: { opciones: [[400, 75], [500, 70], [700, 60]], b0min_mm: 160 },
    },
    /** Nota (2): b0,mín en una longitud de 2 cantos a cada lado de los apoyos. Todas sus caras (C.2.3.2): área ≥ 2·b_mín². */
    areaMinTodasCaras_factor: 2,
  } as const,
);

/** Tabla C.4. hmin solo si la losa compartimenta (REI). a_m por columna. */
export const LOSAS_C4 = tablaCTE(
  { ...PROC_SI, articulo: "Anejo C, C.2.3.3", tabla: "Tabla C.4" },
  {
    porR: {
      30: { hmin: 60, unaDireccion: 10, dosDir_hasta1_5: 10, dosDir_1_5a2: 10 },
      60: { hmin: 80, unaDireccion: 20, dosDir_hasta1_5: 10, dosDir_1_5a2: 20 },
      90: { hmin: 100, unaDireccion: 25, dosDir_hasta1_5: 15, dosDir_1_5a2: 25 },
      120: { hmin: 120, unaDireccion: 35, dosDir_hasta1_5: 20, dosDir_1_5a2: 30 },
      180: { hmin: 150, unaDireccion: 50, dosDir_hasta1_5: 30, dosDir_1_5a2: 40 },
      240: { hmin: 175, unaDireccion: 60, dosDir_hasta1_5: 50, dosDir_1_5a2: 50 },
    },
    /** Nota (2): Ix e Iy son las luces, Iy > Ix. Columnas: Iy/Ix ≤ 1,5 y 1,5 < Iy/Ix ≤ 2. */
    vigaPlanaComoLosa_macizadoLateralMasDe_cm: 10,
  } as const,
);

export const BIDIRECCIONALES_C5 = tablaCTE(
  { ...PROC_SI, articulo: "Anejo C, C.2.3.4", tabla: "Tabla C.5" },
  {
    porR: {
      30: { opciones: [[80, 20], [120, 15], [200, 10]], hmin: 60 },
      60: { opciones: [[100, 30], [150, 25], [200, 20]], hmin: 80 },
      90: { opciones: [[120, 40], [200, 30], [250, 25]], hmin: 100 },
      120: { opciones: [[160, 50], [250, 40], [300, 35]], hmin: 120 },
      180: { opciones: [[200, 70], [300, 60], [400, 55]], hmin: 150 },
      240: { opciones: [[250, 90], [350, 75], [500, 70]], hmin: 175 },
    },
  } as const,
);

/** C.2.1 ptos 3–4, C.2.3.5 y C.2.4. */
export const HORMIGON_REGLAS = tablaCTE(
  { ...PROC_SI, articulo: "Anejo C, C.2.1 ptos 3 y 4; C.2.3.5; C.2.4 pto 2" },
  {
    aridoCalizo_reduccion_pct: 10, // solo vigas, losas y forjados; dimensiones y a_m
    armaduraPiel_siRecubrimientoMasDe_mm: 50,
    armaduraPiel_mallaMenorQue_mm: 150,
    /** Unidireccional con entrevigado cerámico u hormigón y revestimiento inferior: a_m de la C.4 hasta R 120. */
    unidireccional_tablaLosasHastaR: 120,
    /** Sin esas condiciones o > R 120: vigas de la C.3. Aislamiento de solado y entrevigado, 120 min sin datos. */
    piezasAislantes_sinDatos_min: 120,
    bovedillaCeramica_factor: 2,
    yeso_factor: 1.8,
    yesoEnTecho_soloEnsayoPorEncimaDeR: 120,
    negativos: { desdeR: 90, longitud_pct: 33, cuantia_pct: 25 },
    apoyosPuntuales: { desdeR: 90, armaduraSuperiorTodoElTramo_pct: 20 },
  } as const,
);

// ============================================================================
// Anejo F · Fábricas
// ============================================================================

/** Tabla F.1. Columnas por material e intervalo de espesor e [mm] (límite inferior incluido).
 *  "no_usual" = nota (1) «No es usual». Una casilla puede tener varias clases. */
export const LADRILLO_F1 = tablaCTE(
  { ...PROC_SI, articulo: "Anejo F", tabla: "Tabla F.1" },
  {
    columnas: [
      { material: "hueco", eDesde: 40, eHasta: 80 },
      { material: "hueco", eDesde: 80, eHasta: 110 },
      { material: "hueco", eDesde: 110, eHasta: null },
      { material: "macizo_o_perforado", eDesde: 110, eHasta: 200 },
      { material: "macizo_o_perforado", eDesde: 200, eHasta: null },
      { material: "arcilla_aligerada", eDesde: 140, eHasta: 240 },
      { material: "arcilla_aligerada", eDesde: 240, eHasta: null },
    ],
    filas: {
      sin_revestir: ["no_usual", "no_usual", "no_usual", "REI-120", "REI-240", "no_usual", "no_usual"],
      enfoscado_cara_expuesta: ["no_usual", "EI-60", "EI-90", "EI-180", "REI-240", "EI-180", "EI-240"],
      enfoscado_dos_caras: ["EI-30", "EI-90", "EI-120", "REI-180", "REI-240", "REI-180", "REI-240"],
      guarnecido_cara_expuesta: ["EI-60", "EI-120", "EI-180", "EI-240", "REI-240", "EI-240", "EI-240"],
      guarnecido_dos_caras: ["EI-90", "EI-180", "EI-240", "EI-240", "REI-240", ["EI-240", "RE-240", "REI-180"], "REI-240"],
    },
    /** Solo una hoja; revestimientos ≥ 1,5 cm; varias hojas: suma. */
    revestimientoMin_cm: 1.5,
  } as const,
);

export const BLOQUE_HORMIGON_F2 = tablaCTE(
  { ...PROC_SI, articulo: "Anejo F", tabla: "Tabla F.2" },
  {
    filas: [
      { camara: "simple", arido: "siliceo", revestimiento: "sin_revestir", e_mm: 100, clase: "EI-15" },
      { camara: "simple", arido: "siliceo", revestimiento: "sin_revestir", e_mm: 150, clase: "REI-60" },
      { camara: "simple", arido: "siliceo", revestimiento: "sin_revestir", e_mm: 200, clase: "REI-120" },
      { camara: "simple", arido: "calizo", revestimiento: "sin_revestir", e_mm: 100, clase: "EI-60" },
      { camara: "simple", arido: "calizo", revestimiento: "sin_revestir", e_mm: 150, clase: "REI-90" },
      { camara: "simple", arido: "calizo", revestimiento: "sin_revestir", e_mm: 200, clase: "REI-180" },
      { camara: "simple", arido: "volcanico", revestimiento: "sin_revestir", e_mm: 120, clase: "EI-120" },
      { camara: "simple", arido: "volcanico", revestimiento: "sin_revestir", e_mm: 200, clase: "REI-180" },
      { camara: "simple", arido: "volcanico", revestimiento: "guarnecido_dos_caras", e_mm: 90, clase: "EI-180" },
      { camara: "simple", arido: "volcanico", revestimiento: "guarnecido_cara_expuesta_enfoscado_exterior", e_mm: 120, clase: "EI-180" },
      { camara: "simple", arido: "volcanico", revestimiento: "guarnecido_cara_expuesta_enfoscado_exterior", e_mm: 200, clase: "REI-240" },
      { camara: "doble", arido: "arcilla_expandida", revestimiento: "sin_revestir", e_mm: 150, clase: "EI-180" },
      // Literal «RE-240 / REI-80» en [SI25] y [DccSI]; «REI-80» es probable errata (ver C6.6). No ofrecer REI-80.
      { camara: "doble", arido: "arcilla_expandida", revestimiento: "guarnecido_dos_caras", e_mm: 150, clase: ["RE-240", "REI-80"], dudosa: true },
    ],
  } as const,
);

// ============================================================================
// CRITERIOS DE PROYECTO — NO son del CTE. La ficha los rotula «criterio».
// ============================================================================

export const CRITERIOS_SI4_SI6 = {
  /** Ya en `edificio.ts` (FACTOR_CONSTRUIDA). El DB-SI no da relación útil–construida. */
  factorConstruidaSobreUtil: 1.2,
  /** Local sin uso: para SI 6 se supone Comercial (R 90 / 120 / 180 por h del edificio). */
  usoSupuestoLocalSinUsoSi6: "comercial",
  /** Losas con Iy/Ix > 2: columna «flexión en una dirección». */
  losaRelacionMayorQue2: "unaDireccion",
  /** Salida de edificio a cota ±0,00 para calcular las alturas de evacuación. */
  cotaSalidaEdificio_m: 0,
} as const;
```

Comprobaciones propuestas para los tests (sobre las tablas, no sobre la lógica):
- Tabla 3.1: en cada fila con valores, la R no baja al pasar de «≤ 15» a «≤ 28» y a «> 28»; sótano ≥ «≤ 15» en todas las filas.
- Tabla 3.2: bajo < medio < alto.
- Tablas C.2 a C.5: al subir de clase, ni b_mín ni a_m ni h_mín bajan en la misma columna u opción. La C.3 y la C.5 coinciden en R 30 y R 60 y difieren desde R 90: no derivar una de otra.
- Tabla F.1, comparando **minutos** (no letras): en cada columna, «enfoscado por las dos caras» ≥ «enfoscado por la cara expuesta», y «guarnecido» ≥ «enfoscado» con la misma disposición. Saltar las casillas «no_usual» (en hueco de 40–80 mm, enfoscado por la cara expuesta es «no usual» y guarnecido por la cara expuesta es EI-60).
- Umbrales de SI 4: 24 m, 50 m, 28 m, 80 m, 6 m, 500 / 1 000 / 2 000 / 5 000 / 10 000 m², 3 y 4 plantas; borde 9,00 m de SI 5 (no activa) y 9,01 m (activa).
