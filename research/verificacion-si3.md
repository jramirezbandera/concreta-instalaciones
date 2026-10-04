# Verificación normativa — SI 3 «Evacuación de ocupantes» para el módulo SI3 (parte B del encargo SI)

**Fecha:** 2026-10-04 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** las 11 preguntas del encargo (B1 a B11), en el mismo orden, para los usos que modela la herramienta: Residencial Vivienda (plurifamiliar y unifamiliar), Administrativo (oficinas), local sin uso en PB, zonas comunes (portal, escalera, vestíbulo), Aparcamiento (garaje colectivo, normalmente en sótano), garaje de vivienda unifamiliar, trasteros y cuartos de instalaciones. Obra nueva. Del Anejo SI A solo las definiciones que usa SI 3. SI 1, SI 2 y SI 4 a SI 6 los verifican otros agentes: aquí solo se citan cuando SI 3 remite a ellas, y se dice.

**Regla aplicada:** ninguna cifra se da por buena sin haberla leído en la **imagen** de la página. Las tablas 2.1, 3.1, 4.1, 4.2 y 5.1 se han transcrito casilla a casilla, con sus notas, contra la imagen a 200 dpi. Veredictos:
- **VERIFICADO**: literal en el DB. Leído en la imagen de [SI25] y coincidente con el texto extraído de [SI25] y de [DccSI].
- **LEÍDO (1 fuente)**: literal en una sola fuente. Se usa para los comentarios del Ministerio (solo están en [DccSI]) y para lo leído solo en texto.
- **CORREGIDO**: la afirmación del encargo o del repo no coincide con el DB.
- **NO VERIFICABLE**: el DB no lo dice, o no se ha podido leer con seguridad.
- **INTERPRETACIÓN**: lectura del texto que el DB no escribe tal cual pero que se sigue de él. Se puede mostrar, rotulada como tal.
- **CRITERIO**: decisión de proyecto propuesta. No es exigencia del CTE y la ficha debe rotularla así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [SI25] | DB-SI, Sección SI 3 y Anejo SI A | Texto consolidado «4 marzo 2025» (incluye RD 164/2025, BOE 10-04-2025) | `research/pdf/DBSI.pdf` (codigotecnico.org) | SI 3 en imagen: pp. 22–30 a 200 dpi (`scratchpad/si/DBSI-hd/p022…p030.png`) y p. 31 a 130 dpi (`DBSI/p031.png`). Tablas casilla a casilla: 2.1 (pp. 22–24), 3.1 (pp. 24–25), 4.1 (p. 26) y sus notas (p. 27), 4.2 (p. 27) y sus notas (p. 28), 5.1 (p. 28). Anejo SI A en imagen a 130 dpi: pp. 42, 44–48, 50–52. SI 1 en imagen (solo lo que SI 3 necesita): pp. 10–12 (tabla 1.1) y p. 16 (tabla 2.2). Prosa: texto extraído (`DBSI.txt`) cotejado con la imagen |
| [DccSI] | DB-SI con comentarios del Ministerio | Articulado 4-mar-2025; comentarios 4-mar-2025 (portada) | `research/pdf/DccSI.pdf` | Texto completo de SI 3 (pp. 34–54), del Anejo A (pp. 68–84) y de los comentarios de SI 1 que tocan la evacuación (pp. 16–17 y 24). Imagen de pp. 41, 48 y 50: los comentarios van en recuadro con filete vertical a la izquierda y título en negrita. Un párrafo es comentario si no está en [SI25] |
| [REPO] | `src/lib/edificio/tablas.ts`, `derivar.ts`, `deducciones.ts`, `usos.ts`; `research/verificacion-edificio-usos.md`; `research/verificacion-hs3-v4.md` | Estado actual | repo | Lo que ya existe |

Avisos de los propios documentos:
- [SI25] p. 2: «Este texto consolidado no tiene valor jurídico.» Disposiciones que recoge: RD 314/2006; RD 1371/2007; corrección de errores y erratas del RD 314/2006 (BOE 25-01-2008); Orden VIV/984/2009; RD 173/2010; Sentencia del TS de 4-5-2010 (BOE 30-07-2010); RD 732/2019 (BOE 27-12-2019); RD 164/2025 de 4 de marzo (BOE 10-04-2025).
- [DccSI] p. 2: «Los comentarios tienen un carácter orientativo e informativo no teniendo carácter reglamentario.» En este documento, todo lo marcado «comentario» es [DccSI] y **no es exigencia**.

**Límites de la lectura:**
- El consolidado no marca qué cambió cada disposición. No se ha leído el BOE del RD 164/2025. El único indicio de qué tocó en SI 3 es un comentario ([DccSI] p. 81): tras el RD 164/2025 el DB SI se aplica a toda zona con vehículos, con las densidades de la tabla 2.1. Coincide con el texto «incluidos los estacionamientos de vehículos destinados al servicio de transporte de personas y transporte de mercancías» de la fila Aparcamiento.
- El **DB SUA no está en el repo**. La anchura mínima de las escaleras, a la que remite la nota (9) de la tabla 4.1, **no se ha leído** (Pendiente 1).
- La p. 31 solo está a 130 dpi. Se lee bien: «E₃₀₀ 60», «F₃₀₀ 60», «EI 60», con el 300 en subíndice.

---

## Bloque B1 — Ap. 1, compatibilidad de los elementos de evacuación

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B1.1 | Texto del ap. 1 | VERIFICADO | Literal en la nota B1 | SI 3 · ap. 1 ptos 1 y 2 | [SI25] p. 22, imagen; [DccSI] p. 34 |
| B1.2 | A quién se aplica | VERIFICADO | Solo a **establecimientos** integrados en un edificio cuyo uso principal es otro: **Comercial y Pública concurrencia, de cualquier superficie**; **Docente, Hospitalario, Residencial Público y Administrativo, con superficie construida > 1.500 m²**. Aparcamiento y Residencial Vivienda no están en la lista | ap. 1 pto 1 | [SI25] p. 22 |
| B1.3 | Qué es un «establecimiento» | VERIFICADO | Titularidad diferenciada, régimen no subsidiario y control administrativo de las obras y del inicio de la actividad | Anejo SI A, «Establecimiento»: «Zona de un edificio destinada a ser utilizada bajo una titularidad diferenciada, bajo un régimen no subsidiario respecto del resto del edificio y cuyo proyecto de obras de construcción o reforma, así como el inicio de la actividad prevista, sean objeto de control administrativo. Conforme a lo anterior, la totalidad de un edificio puede ser también un establecimiento.» | [SI25] p. 45, imagen |
| B1.4 | Local **comercial** en la PB de un edificio de viviendas: ¿salidas independientes? | VERIFICADO: **sí, de cualquier superficie** | a) Salidas de uso habitual y recorridos hasta el espacio exterior seguro en elementos independientes de las zonas comunes, compartimentados como deba estarlo el establecimiento (SI 1 cap. 1). Esos elementos pueden servir de salida de emergencia de otras zonas. b) Sus **salidas de emergencia** pueden dar a un elemento común de evacuación del edificio a través de un **vestíbulo de independencia**, si ese elemento está dimensionado contando con ellas | ap. 1 pto 1 a) y b) | [SI25] p. 22 |
| B1.5 | **Local sin uso** (sin actividad definida) | **NO VERIFICABLE** (el DB no lo regula) + **CRITERIO** | El DB no trata el local sin actividad. Para la ocupación remite al uso «más asimilable» (ap. 2 pto 1). Propuesta: asimilarlo a **Comercial**, el caso más exigente del ap. 1: salidas propias a la calle, sin evacuar por el portal ni contar en la ocupación de las zonas comunes. Aviso en la ficha: «El local se justificará en el proyecto de su actividad» | ap. 1 pto 1; ap. 2 pto 1 | [SI25] |
| B1.6 | **Oficinas** en un edificio de viviendas | VERIFICADO | El ap. 1 solo obliga a las de **> 1.500 m² construidos**. Por debajo pueden compartir portal y escalera. Relación con SI 1 (lo verifica otro agente): en edificios de uso principal Residencial Vivienda, un establecimiento Administrativo de **≤ 500 m²** construidos no tiene que ser sector propio; si no lo es, la escalera común cumple las condiciones de Residencial Vivienda (tabla 5.1, nota (1)) | ap. 1 pto 1; SI 1, tabla 1.1, «En general», guion 1: «Todo establecimiento debe constituir sector de incendio diferenciado del resto del edificio excepto, en edificios cuyo uso principal sea Residencial Vivienda, los establecimientos cuya superficie construida no exceda de 500 m² y cuyo uso sea Docente, Administrativo o Residencial Público.» | [SI25] pp. 22, 10, imagen |
| B1.7 | Oficinas del mismo titular que el edificio | **INTERPRETACIÓN** + comentario | Sin titularidad diferenciada no hay «establecimiento» y el ap. 1 no se aplica. El comentario precisa que la titularidad diferenciada se refiere también a la gestión de la protección contra incendios | Comentario «Sectorización de establecimientos integrados en edificios»: «… una oficina con titular diferenciado integrada en un edificio de oficinas, pero cuyas condiciones de protección contra incendios estén bajo la responsabilidad del titular del conjunto del edificio, no se considera "establecimiento" a dichos efectos …» | [DccSI] pp. 16–17 (comentario) |
| B1.8 | **Garaje**: ¿le afecta el ap. 1? | VERIFICADO: **no** | Aparcamiento no está en la lista del ap. 1. Sus condiciones vienen de SI 1 (sector propio y vestíbulo de independencia), de la tabla 5.1 (escalera) y del Anejo («Recorrido de evacuación») | SI 1, tabla 1.1, «Aparcamiento»: «Debe constituir un sector de incendio diferenciado cuando esté integrado en un edificio con otros usos. Cualquier comunicación con ellos se debe hacer a través de un vestíbulo de independencia.» | [SI25] pp. 11–12, imagen |
| B1.9 | ¿Puede el garaje evacuar por la escalera de las viviendas? | VERIFICADO (condiciones) + comentario | **Sí**, si: (1) cada comunicación garaje–escalera es por **vestíbulo de independencia** (SI 1, tabla 1.1); (2) la escalera es **especialmente protegida** en las plantas del garaje (tabla 5.1, Aparcamiento: no protegida y protegida «No se admite»); (3) la escalera se dimensiona con los ocupantes del garaje (E de la tabla 4.1). En la planta de salida, la escalera ascendente no necesita vestíbulo y puede no estar compartimentada (Anejo, «Escalera especialmente protegida»). El comentario lo confirma para la escalera común sótano–portal **si salva más de 2,80 m** | Comentario «Protección de la escalera de aparcamiento que comunica con edificio de viviendas»: «… una escalera común para el conjunto de ocupantes de un edificio de viviendas que comunica un aparcamiento en planta de sótano con el portal (también zona común) de dicho edificio de viviendas. En este segundo caso la escalera común debe cumplir las condiciones de escalera especialmente protegida siempre que salve más de 2,80 m de altura, límite que permite considerarla como una escalera y no como un conjunto de peldaños.» | [SI25] p. 28; [DccSI] p. 48 (comentario, en imagen) |
| B1.10 | ¿Pueden las viviendas evacuar a través del garaje? | VERIFICADO: **solo como recorrido alternativo** | Nunca como recorrido único | Anejo, «Recorrido de evacuación»: «Un recorrido de evacuación desde zonas habitables puede atravesar una zona de uso Aparcamiento o sus vestíbulos de independencia, únicamente cuando sea un recorrido alternativo a alguno no afectado por dicha circunstancia.» | [SI25] p. 47, imagen |
| B1.11 | ¿Puede un establecimiento evacuar a través de otro? | LEÍDO (1 fuente, comentario) | No | «En ningún caso un establecimiento puede tener su evacuación a través de otro.» | [DccSI] p. 77 (comentario) |

**Nota B1 — ap. 1, literal** ([SI25] p. 22).
1. «Los establecimientos de uso Comercial o Pública concurrencia de cualquier superficie y los de uso Docente, Hospitalario, Residencial Público o Administrativo cuya superficie construida sea mayor que 1.500 m², si están integrados en un edificio cuyo uso previsto principal sea distinto del suyo, deben cumplir las siguientes condiciones:
   - a) sus salidas de uso habitual y los recorridos hasta el espacio exterior seguro estarán situados en elementos independientes de las zonas comunes del edificio y compartimentados respecto de éste de igual forma que deba estarlo el establecimiento en cuestión, según lo establecido en el capítulo 1 de la Sección 1 de este DB. No obstante, dichos elementos podrán servir como salida de emergencia de otras zonas del edificio,
   - b) sus salidas de emergencia podrán comunicar con un elemento común de evacuación del edificio a través de un vestíbulo de independencia, siempre que dicho elemento de evacuación esté dimensionado teniendo en cuenta dicha circunstancia.»
2. «Como excepción, los establecimientos de uso Pública concurrencia cuya superficie construida total no exceda de 500 m² y estén integrados en centros comerciales podrán tener salidas de uso habitual o salidas de emergencia a las zonas comunes de circulación del centro. Cuando su superficie sea mayor que la indicada, al menos las salidas de emergencia serán independientes respecto de dichas zonas comunes.» (Fuera del alcance: centros comerciales.)

Comentarios al ap. 1 ([DccSI] p. 34): el DB **no exige** salidas de emergencia; solo las salidas necesarias. «Salida de emergencia» es la prevista solo para emergencias y señalizada así.

---

## Bloque B2 — Ap. 2, cálculo de la ocupación

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B2.1 | Base del cálculo | VERIFICADO | Densidad de la tabla 2.1 sobre la **superficie útil de cada zona**. Salvedades: ocupación previsible mayor, u ocupación menor exigible por otra disposición legal | ap. 2 pto 1: «Para calcular la ocupación deben tomarse los valores de densidad de ocupación que se indican en la tabla 2.1 en función de la superficie útil de cada zona, salvo cuando sea previsible una ocupación mayor o bien cuando sea exigible una ocupación menor en aplicación de alguna disposición legal de obligado cumplimiento, como puede ser en el caso de establecimientos hoteleros, docentes, hospitales, etc.» | [SI25] p. 22, imagen |
| B2.2 | Zonas que no están en la tabla | VERIFICADO | Uso más asimilable | ap. 2 pto 1: «En aquellos recintos o zonas no incluidos en la tabla se deben aplicar los valores correspondientes a los que sean más asimilables.» | [SI25] p. 22 |
| B2.3 | Simultaneidad | VERIFICADO | Considerar el carácter simultáneo o alternativo de las zonas | ap. 2 pto 2: «A efectos de determinar la ocupación, se debe tener en cuenta el carácter simultáneo o alternativo de las diferentes zonas de un edificio, considerando el régimen de actividad y de uso previsto para el mismo.» | [SI25] p. 22 |
| B2.4 | Usos especiales o circunstanciales | VERIFICADO | O se calculan, o se deja constancia en el proyecto **y** en el Libro del edificio de que solo se han considerado los usos característicos | Tabla 2.1, nota (1) (literal en la nota B2) | [SI25] p. 24, imagen |
| B2.5 | Fila «Residencial Vivienda» | VERIFICADO | «Plantas de vivienda» → **20** m²/persona | Tabla 2.1 | [SI25] p. 23, imagen |
| B2.6 | Filas «Administrativo» | VERIFICADO | «Plantas o zonas de oficinas» → **10**; «Vestíbulos generales y zonas de uso público» → **2** | Tabla 2.1 | [SI25] p. 23, imagen |
| B2.7 | Filas «Aparcamiento⁽²⁾» | VERIFICADO | «Vinculado a una actividad sujeta a horarios: comercial, espectáculos, oficina, etc.» → **15**; «En otros casos, incluidos los estacionamientos de vehículos destinados al servicio de transporte de personas y transporte de mercancías» → **40** | Tabla 2.1 y nota (2) | [SI25] pp. 23–24, imagen |
| B2.8 | Fila «Cualquiera» | VERIFICADO | «Zonas de ocupación ocasional y accesibles únicamente a efectos de mantenimiento: salas de máquinas, locales para material de limpieza, etc.» → **Ocupación nula**. «Aseos de planta» → **3** | Tabla 2.1 | [SI25] p. 22, imagen |
| B2.9 | ¿Hay fila para **trasteros**? | VERIFICADO: **no** | No hay fila «trasteros». La más parecida es «Archivos, almacenes» → **40**, pero los **trasteros de viviendas** son **zona de ocupación nula** por definición (Anejo). Coincide con `verificacion-edificio-usos.md`, A8 | Anejo, «Zona de ocupación nula»: «… tales como salas de máquinas y cuartos de instalaciones, locales para material de limpieza, determinados almacenes y archivos, trasteros de viviendas, etc.» | [SI25] pp. 24, 52, imagen |
| B2.10 | ¿Hay fila para **portal o escalera**? | VERIFICADO: **no** | En Residencial Vivienda no hay fila de vestíbulos ni de circulación. Las filas «Vestíbulos generales…» son de Residencial Público, Administrativo y Pública concurrencia | Tabla 2.1 | [SI25] pp. 23–24 |
| B2.11 | Portal y escalera de viviendas: ¿aportan ocupación? | **INTERPRETACIÓN** + comentario | No aportan ocupación propia: son zonas de circulación. Según el comentario, la densidad de 20 m²/persona de «Plantas de vivienda» ya cuenta con la circulación de una configuración típica | Comentario «Densidades de ocupación aplicables en función de configuraciones específicas»: «Las densidades … para el conjunto de una planta o zona y para algunos usos (Administrativo, Docente, Residencial Vivienda, hospitalización) son las mínimas aplicables para configuraciones típicas y tienen en cuenta las superficies proporcionales normales que dichas configuraciones tienen de zonas de circulación, archivos, salas de reunión, aseos, etc.» Y: «… algunas de ellas es posible que no aporten ocupación propia: archivos, vestíbulos y zonas de circulación, almacén, etc.» | [DccSI] p. 37 (comentario) |
| B2.12 | Zona de ocupación nula: qué conserva | VERIFICADO | No cuenta para la ocupación ni para la altura de evacuación, pero sus puntos deben cumplir los límites de recorrido hasta la salida de planta (y hasta la salida de la zona si además es de riesgo especial). Si supera **50 m²**, sus puntos son **origen de evacuación** | Anejo, «Zona de ocupación nula» (2.º párrafo) y «Origen de evacuación» (2.º párrafo) | [SI25] pp. 46, 52, imagen |
| B2.13 | Aparcamientos robotizados | VERIFICADO | Sin ocupación (nota (2)); fuera del alcance | Tabla 2.1, nota (2) | [SI25] p. 24 |
| B2.14 | Local sin uso: densidad | **NO VERIFICABLE** (el DB no la da) + CRITERIO | Ver B1.5. Si se asimila a Comercial: «áreas de ventas en plantas de sótano, baja y entreplanta» → **2** (VERIFICADO, p. 23). Superficie útil en Comercial sin implantación definida: **al menos el 75 %** de la construida de las zonas de público (Anejo, «Superficie útil», p. 49). Usar la superficie útil del cuadro queda del lado de la seguridad si es mayor que ese 75 % (lo normal); si no, aplicar el 75 % | ap. 2 pto 1; tabla 2.1; Anejo «Superficie útil» | [SI25] |
| B2.15 | Oficinas con planos de mobiliario | LEÍDO (1 fuente, comentario) | Si el plano de mobiliario da más ocupación que la densidad, se aplica la mayor | Comentario, mismo título que B2.11, último párrafo | [DccSI] p. 37 (comentario) |
| B2.16 | Aseos y vestuarios | LEÍDO (1 fuente, comentario) | En el total de un establecimiento no añaden ocupación propia (alternativa, no simultánea) | Comentario «Ocupación alternativa de aseos y vestuarios» | [DccSI] p. 37 (comentario) |

**Tabla 2.1 — filas que usa la herramienta** ([SI25] pp. 22–24, imagen). Unidad: m² de superficie útil por persona.

| Uso previsto | Zona, tipo de actividad | Ocupación |
|---|---|---|
| Cualquiera | Zonas de ocupación ocasional y accesibles únicamente a efectos de mantenimiento: salas de máquinas, locales para material de limpieza, etc. | Ocupación nula |
| Cualquiera | Aseos de planta | 3 |
| Residencial Vivienda | Plantas de vivienda | 20 |
| Aparcamiento⁽²⁾ | Vinculado a una actividad sujeta a horarios: comercial, espectáculos, oficina, etc. | 15 |
| Aparcamiento⁽²⁾ | En otros casos, incluidos los estacionamientos de vehículos destinados al servicio de transporte de personas y transporte de mercancías | 40 |
| Administrativo | Plantas o zonas de oficinas | 10 |
| Administrativo | Vestíbulos generales y zonas de uso público | 2 |
| Comercial | En establecimientos comerciales: áreas de ventas en plantas de sótano, baja y entreplanta | 2 |
| Comercial | En establecimientos comerciales: áreas de ventas en plantas diferentes de las anteriores | 3 |
| Archivos, almacenes | — | 40 |

**Nota B2 — notas de la tabla 2.1, literal** ([SI25] p. 24).
- ⁽¹⁾ «Deben considerarse las posibles utilizaciones especiales y circunstanciales de determinadas zonas o recintos, cuando puedan suponer un aumento importante de la ocupación en comparación con la propia del uso normal previsto. En dichos casos se debe, o bien considerar dichos usos alternativos a efectos del diseño y cálculo de los elementos de evacuación, o bien dejar constancia, tanto en la documentación del proyecto, como en el Libro del edificio, de que las ocupaciones y los usos previstos han sido únicamente los característicos de la actividad.»
- ⁽²⁾ «En los aparcamientos robotizados se considera que no existe ocupación. No obstante, dispondrán de los medios de escape en caso de emergencia para el personal de mantenimiento que en cada caso considere necesarios la autoridad de control.»

---

## Bloque B3 — Ap. 3, número de salidas y longitud de los recorridos (tabla 3.1)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B3.1 | Tabla 3.1 casilla a casilla | VERIFICADO | Transcripción siguiente | Tabla 3.1 «Número de salidas de planta y longitud de los recorridos de evacuación⁽¹⁾» | [SI25] pp. 24–25, imagen; [DccSI] pp. 38–39 |
| B3.2 | Cómo se lee la tabla | LEÍDO (1 fuente, comentario) | Si una planta o recinto cumple **todas** las condiciones de la parte superior, puede tener una sola salida (y si tiene más, no tiene que cumplir la parte inferior). Si incumple alguna, necesita más de una salida y cumple la parte inferior | Comentario «Aplicación de la tabla 3.1» | [DccSI] p. 39 (comentario) |
| B3.3 | Una salida: ocupación | VERIFICADO | **P ≤ 100** («no excede de 100 personas»), con tres excepciones: **500** personas en el conjunto del edificio para la **salida de un edificio de viviendas**; **50** personas en zonas que, hasta una salida de planta, suben **más de 2 m**; 50 alumnos (fuera del alcance) | Tabla 3.1, fila 1 | [SI25] p. 24 |
| B3.4 | Una salida: recorrido | VERIFICADO | **≤ 25 m** hasta una salida de planta. **≤ 35 m** en uso Aparcamiento. **≤ 50 m** en una planta (incluso de Aparcamiento) con **salida directa al espacio exterior seguro** y **ocupación ≤ 25 personas**, o en un espacio al aire libre de riesgo irrelevante (cubierta, terraza) | Tabla 3.1, fila 1 | [SI25] p. 25, imagen |
| B3.5 | Para los 50 m, ¿dónde debe estar la salida? | LEÍDO (1 fuente, comentario) | En la **propia planta**. En los demás casos, las salidas de planta pueden estar en otra planta | Comentario «Validez de salidas de planta situadas en planta distinta a la considerada»: «… En dicho caso, la salida única debe estar en la planta considerada.» | [DccSI] p. 40 (comentario) |
| B3.6 | Una salida: altura | VERIFICADO | Altura de evacuación **descendente** de la planta **≤ 28 m** (Residencial Público: otra regla, fuera del alcance). **Ascendente ≤ 10 m** | Tabla 3.1, fila 1: «La altura de evacuación descendente de la planta considerada no excede de 28 m, excepto en uso Residencial Público, en cuyo caso es, como máximo, la segunda planta por encima de la de salida de edificio⁽²⁾, o de 10 m cuando la evacuación sea ascendente.» | [SI25] p. 25 |
| B3.7 | Más de una salida: recorrido | VERIFICADO | **≤ 50 m** hasta alguna salida de planta. **≤ 35 m** «en zonas en las que se prevea la presencia de ocupantes que duermen» (y hospitalización, escuela infantil y primaria). **≤ 75 m** al aire libre de riesgo irrelevante | Tabla 3.1, fila 2 | [SI25] p. 25 |
| B3.8 | Más de una salida: tramo único | VERIFICADO | Hasta el punto desde el que hay **dos recorridos alternativos**: no más que la **longitud máxima con una sola salida** (25 m; 35 m en Aparcamiento; 50 m en los casos de B3.4). 15 m en hospitalización (fuera del alcance) | Tabla 3.1, fila 2, 2.ª condición | [SI25] p. 25 |
| B3.9 | ¿Los 35 m de «ocupantes que duermen» se aplican a Residencial Vivienda? | **NO VERIFICABLE** + CRITERIO | El DB no lo concreta y el [DccSI] no lo comenta. En viviendas el recorrido empieza en la puerta de la vivienda (B3.13), en zonas comunes donde nadie duerme, lo que apunta a 50 m. Pero los ocupantes evacuados vienen de dormir. Propuesta: aplicar **35 m** del lado de la seguridad, rotulado «criterio». Rara vez decide: un edificio de viviendas con una escalera tiene una sola salida (25 m) | Tabla 3.1, fila 2 | — |
| B3.10 | Dos escaleras | VERIFICADO | Si la altura descendente obliga a más de una salida de planta (> 28 m), o si **más de 50 personas** suben **más de 2 m**, al menos dos salidas de planta llevan a **dos escaleras diferentes** | Tabla 3.1, fila 2, 3.ª condición | [SI25] p. 25 |
| B3.11 | ¿Siempre dos escaleras en la evacuación ascendente de más de 50 personas? | LEÍDO (1 fuente, comentario) | No: lo que se impide es que dos salidas de planta confluyan en una sola escalera ascendente. Vale, por ejemplo, salida al exterior + escalera | Comentario «Salidas de planta que no conducen a dos escaleras diferentes» | [DccSI] p. 40 (comentario) |
| B3.12 | Notas (1) a (3) | VERIFICADO | (1) **+25 %** en las longitudes con **instalación automática de extinción** en el sector. (2) Residencial Público (fuera del alcance). (3) La **planta de salida del edificio** necesita más de una salida: en Residencial Vivienda, si la ocupación **total** del edificio **> 500**; en el resto, cuando le sea exigible por la ocupación de esa planta, o si el edificio necesita más de una escalera | Tabla 3.1, notas | [SI25] p. 25, imagen |
| B3.13 | Origen de evacuación en vivienda | **INTERPRETACIÓN** (lectura directa del Anejo) | El Anejo **excluye los puntos del interior de las viviendas**. El primer origen está, por tanto, **en la puerta de la vivienda**, del lado de la zona común. El DB no escribe «puerta de la vivienda» y el [DccSI] no lo comenta | Anejo, «Origen de evacuación»: «Es todo punto ocupable de un edificio, exceptuando los del interior de las viviendas y los de todo recinto o conjunto de ellos comunicados entre sí, en los que la densidad de ocupación no exceda de 1 persona/5 m² y cuya superficie total no exceda de 50 m², como pueden ser las habitaciones de hotel, residencia u hospital, los despachos de oficinas, etc.» | [SI25] p. 46, imagen |
| B3.14 | Origen de evacuación en oficinas | VERIFICADO | Todo punto ocupable, salvo recintos (o conjuntos comunicados) de **≤ 50 m²** y densidad **≤ 1 persona/5 m²** (p. ej. despachos): allí el origen está en su puerta | Anejo, «Origen de evacuación» | [SI25] p. 46 |
| B3.15 | Origen de evacuación en el garaje | VERIFICADO + comentario | **Todo punto ocupable**. Comentario: en plaza abierta, el punto medio del borde plaza–calle; en plaza para dos o más coches en fondo, el punto equivalente de la más profunda; con trastero al fondo (no de riesgo especial), la puerta del trastero; en plaza compartimentada, el punto ocupable más alejado de su acceso | Anejo, «Origen de evacuación»; comentario «Origen de evacuación en aparcamientos» | [SI25] p. 46; [DccSI] p. 75 (comentario) |
| B3.16 | Cómo se mide | VERIFICADO + comentario | Por pasillos, escaleras y rampas, **sobre el eje**. Recorridos del garaje: por las calles de circulación o por itinerarios peatonales protegidos (DB SUA 7, ap. 3). Comentario: en garajes, por las diagonales de los recorridos reales previsibles; pasos peatonales ≥ 0,80 m | Anejo, «Recorrido de evacuación», 2.º y 4.º párrafos; comentario «Medición de los recorridos de evacuación en aparcamientos» | [SI25] p. 47, imagen; [DccSI] p. 77 (comentario) |
| B3.17 | ¿Una escalera **no protegida** es «salida de planta»? | VERIFICADO (definición) + comentario: **no** | Salida de planta es el **arranque de una escalera compartimentada como los sectores de incendio**, o la puerta de una escalera protegida, de un pasillo protegido o del vestíbulo de una especialmente protegida, o una salida de edificio. Una escalera no protegida y no compartimentada no lo es | Anejo, «Salida de planta», ptos 1 y 3. Comentario: «… una planta … comunicada con ellas por escaleras no protegidas, carezca de salidas de planta situadas en ella misma, ya que dichas escaleras no podrían considerarse como tales.» | [SI25] p. 48, imagen; [DccSI] p. 40 (comentario) |
| B3.18 | Consecuencia en un edificio de viviendas con escalera **no protegida** | **INTERPRETACIÓN** (lectura conjunta de «salida de planta» y «recorrido de evacuación») | En las plantas altas el recorrido **sigue por la escalera, medido sobre su eje, hasta la salida del edificio** (el portal), y esa longitud total es la que no puede pasar de **25 m** con una sola salida. Si la escalera está **compartimentada** o es **protegida**, el recorrido acaba en su arranque o en su puerta en cada planta. **Es la decisión que más pesa en el módulo** (ver «Criterios de proyecto», C1 y C2) | Anejo, «Recorrido de evacuación»: «Recorrido que conduce desde un origen de evacuación hasta una salida de planta, situada en la misma planta considerada o en otra, o hasta una salida de edificio. Conforme a ello, una vez alcanzada una salida de planta, la longitud del recorrido posterior no computa …» | [SI25] pp. 47–48; [DccSI] p. 40 |
| B3.19 | «Sobre el eje»: ¿en planta o en verdadera magnitud? | **NO VERIFICABLE** + CRITERIO | El DB no lo dice. Propuesta: longitud real sobre el eje inclinado de los tramos (lado de la seguridad) | Anejo, «Recorrido de evacuación» | — |
| B3.20 | Recorrido con mobiliario | **NO VERIFICABLE** | Ni el DB ni el [DccSI] hablan de medir con mobiliario. Solo: «sobre el eje» (pasillos, escaleras, rampas) y, en garajes, «diagonales … de los recorridos reales previsibles» | Anejo; [DccSI] p. 77 | — |
| B3.21 | Recorridos ascendentes: alturas máximas | VERIFICADO | En general, **4 m** hasta una salida de planta y **6 m** hasta el espacio exterior seguro. **No se aplica** a aparcamientos, a zonas de ocupación nula ni a zonas solo de personal de mantenimiento | Anejo, «Recorrido de evacuación», último párrafo y su tabla | [SI25] p. 47, imagen |
| B3.22 | Garaje con una salida: condiciones | VERIFICADO (suma de B3.3–B3.6) + INTERPRETACIÓN | Ocupación ≤ 100 (≤ 50 si, antes de la salida de planta, se suben más de 2 m: por ejemplo, si la salida es la rampa); recorrido ≤ 35 m (≤ 43,75 m con extinción automática); altura ascendente ≤ 10 m. Si la salida de planta es la puerta del vestíbulo de la escalera especialmente protegida **en la propia planta**, no hay subida antes de la salida de planta y rige el 100 (INTERPRETACIÓN) | Tabla 3.1 | [SI25] |
| B3.23 | Plazas que comunican con su vivienda | LEÍDO (1 fuente, comentario) | Si la plaza está abierta a la calle común, el acceso a su vivienda (con vestíbulo de independencia) es salida de planta para ese usuario: sin otra salida común, recorrido ≤ 35 m; con otra salida común, ≤ 50 m y tramo único ≤ 35 m. La escalera de esa plaza no tiene que ser especialmente protegida | Comentario «Plazas de aparcamiento que comunican con sus correspondientes viviendas» | [DccSI] p. 41 (comentario, en imagen) |
| B3.24 | Zona de riesgo especial con salida directa al exterior | LEÍDO (1 fuente, comentario) | Dentro del local, ≤ 25 m aunque la salida sea al exterior (no 50 m) | Comentario «Salida de zona de riesgo especial directa al espacio exterior seguro»; SI 1, tabla 2.2 | [DccSI] p. 40 (comentario) |
| B3.25 | El +25 % alcanza a todos los tramos | LEÍDO (1 fuente, comentario) | A la longitud total, al tramo único y a cualquier recorrido regulado, p. ej. los 15 m desde una escalera protegida hasta la salida del edificio | Comentario «Aumento del 25% del recorrido de evacuación» | [DccSI] p. 39 (comentario) |

**Tabla 3.1 — Número de salidas de planta y longitud de los recorridos de evacuación⁽¹⁾** ([SI25] pp. 24–25, imagen). Literal.

| Número de salidas existentes | Condiciones |
|---|---|
| Plantas o recintos que disponen de una única salida de planta o salida de recinto respectivamente | **No se admite en:** uso Hospitalario, en las plantas de hospitalización o de tratamiento intensivo, así como en salas o unidades para pacientes hospitalizados cuya superficie construida exceda de 90 m². |
| ″ | **La ocupación no excede de 100 personas**, excepto en los casos que se indican a continuación: — 500 personas en el conjunto del edificio, en el caso de salida de un edificio de viviendas; — 50 personas en zonas desde las que la evacuación hasta una salida de planta deba salvar una altura mayor que 2 m en sentido ascendente; — 50 alumnos en escuelas infantiles, o de enseñanza primaria o secundaria. |
| ″ | **La longitud de los recorridos de evacuación hasta una salida de planta no excede de 25 m**, excepto en los casos que se indican a continuación: — 35 m en uso Aparcamiento; — 50 m si se trata de una planta, incluso de uso Aparcamiento, que tiene una salida directa al espacio exterior seguro y la ocupación no excede de 25 personas, o bien de un espacio al aire libre en el que el riesgo de incendio sea irrelevante, por ejemplo, una cubierta de edificio, una terraza, etc. |
| ″ | **La altura de evacuación descendente de la planta considerada no excede de 28 m**, excepto en uso Residencial Público, en cuyo caso es, como máximo, la segunda planta por encima de la de salida de edificio⁽²⁾, **o de 10 m cuando la evacuación sea ascendente**. |
| Plantas o recintos que disponen de más de una salida de planta o salida de recinto respectivamente⁽³⁾ | **La longitud de los recorridos de evacuación hasta alguna salida de planta no excede de 50 m**, excepto en los casos que se indican a continuación: — 35 m en zonas en las que se prevea la presencia de ocupantes que duermen, o en plantas de hospitalización o de tratamiento intensivo en uso Hospitalario y en plantas de escuela infantil o de enseñanza primaria. — 75 m en espacios al aire libre en los que el riesgo de declaración de un incendio sea irrelevante, por ejemplo, una cubierta de edificio, una terraza, etc. |
| ″ | La longitud de los recorridos de evacuación desde su origen hasta llegar a algún punto desde el cual existan al menos dos recorridos alternativos no excede de 15 m en plantas de hospitalización o de tratamiento intensivo en uso Hospitalario o de la longitud máxima admisible cuando se dispone de una sola salida, en el resto de los casos. |
| ″ | Si la altura de evacuación descendente de la planta obliga a que exista más de una salida de planta o si más de 50 personas precisan salvar en sentido ascendente una altura de evacuación mayor que 2 m, al menos dos salidas de planta conducen a dos escaleras diferentes. |

Notas, literal:
- ⁽¹⁾ «La longitud de los recorridos de evacuación que se indican se puede aumentar un 25% cuando se trate de sectores de incendio protegidos con una instalación automática de extinción.»
- ⁽²⁾ «Si el establecimiento no excede de 20 plazas de alojamiento y está dotado de un sistema de detección y alarma, puede aplicarse el límite general de 28 m de altura de evacuación.»
- ⁽³⁾ «La planta de salida del edificio debe contar con más de una salida: — en el caso de edificios de Uso Residencial Vivienda, cuando la ocupación total del edificio exceda de 500 personas. — en el resto de los usos, cuando le sea exigible considerando únicamente la ocupación de dicha planta, o bien cuando el edificio esté obligado a tener más de una escalera para la evacuación descendente o más de una para evacuación ascendente.»
- Comentario a la nota (3) ([DccSI] p. 39): «considerar únicamente la ocupación de dicha planta» se refiere tanto al número de ocupantes (más de 100) como a la longitud máxima de los recorridos en ella.

**Formalización** (INTERPRETACIÓN, aritmética directa del literal): «no excede de X» → `≤ X`; «mayor que X» → `> X`. Una salida es válida si se cumplen **a la vez** las cuatro filas superiores.

**Nota B3.13 — altura de evacuación** (Anejo SI A, [SI25] p. 42, imagen): «Máxima diferencia de cotas entre un origen de evacuación y la salida de edificio que le corresponda. A efectos de determinar la altura de evacuación de un edificio no se consideran las plantas más altas del edificio en las que únicamente existan zonas de ocupación nula.» Comentario ([DccSI] p. 84): no cuentan las plantas **más altas** de ocupación nula, «pero sí las más bajas». Comentario ([DccSI] p. 68): con salidas de edificio a varias cotas, se asigna la mayor de las alturas.

---

## Bloque B4 — Ap. 4, dimensionado de los medios de evacuación

### B4.1 — Criterios de asignación de los ocupantes (ap. 4.1)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B4.1.1 | Hipótesis de bloqueo | VERIFICADO | Donde deba haber más de una salida (contando los puntos de paso obligado), se reparte suponiendo **inutilizada una**, en la hipótesis más desfavorable | ap. 4.1 pto 1: «Cuando en una zona, en un recinto, en una planta o en el edificio deba existir más de una salida, considerando también como tales los puntos de paso obligado, la distribución de los ocupantes entre ellas a efectos de cálculo debe hacerse suponiendo inutilizada una de ellas, bajo la hipótesis más desfavorable.» | [SI25] p. 25, imagen |
| B4.1.2 | Escaleras | VERIFICADO | No hace falta suponer inutilizada una escalera **protegida, especialmente protegida o compartimentada**. Si deben existir varias **no protegidas y no compartimentadas**, una se supone inutilizada **entera** | ap. 4.1 pto 2 | [SI25] p. 25 |
| B4.1.3 | Desembarco de la escalera | VERIFICADO | El flujo de la escalera se suma a la salida de planta de la planta de desembarco: **160·A** personas (A = anchura del desembarco, m) o, si es menor, el número de personas que usan la escalera | ap. 4.1 pto 3 | [SI25] pp. 25–26 |
| B4.1.4 | ¿Cuándo se aplica el bloqueo? | LEÍDO (1 fuente, comentario) | Solo si es **exigible** más de una salida. Si pudiendo haber una se ponen más, no hace falta. Y solo para calcular **anchuras y capacidades**: no condiciona recorridos, altura salvada, protección ni sentido de apertura | Comentario «Criterios de aplicación de la hipótesis de bloqueo» | [DccSI] p. 42 (comentario) |
| B4.1.5 | Reparto entre salidas | LEÍDO (1 fuente, comentario) | El DB no fija el criterio: lo decide el proyectista; lo lógico, proximidad corregida | Comentario «Criterio para asignar ocupantes a cada salida» | [DccSI] p. 42 (comentario) |
| B4.1.6 | Recorridos alternativos por una misma escalera no protegida | LEÍDO (1 fuente, comentario) | Subir y bajar por la misma escalera no protegida **no** son recorridos alternativos | Comentario «Recorridos alternativos por una misma escalera no protegida» | [DccSI] p. 78 (comentario) |

### B4.2 — Tabla 4.1 (ap. 4.2)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B4.2.1 | Tabla 4.1 casilla a casilla | VERIFICADO | Transcripción siguiente | Tabla 4.1 «Dimensionado de los elementos de la evacuación» | [SI25] pp. 26–27, imagen; [DccSI] pp. 43–44 |
| B4.2.2 | Puertas y pasos: A ≥ P/200 ≥ 0,80 m | VERIFICADO | **A ≥ P/200⁽¹⁾ ≥ 0,80 m⁽²⁾** | Tabla 4.1 | [SI25] p. 26 |
| B4.2.3 | Hojas de puerta 0,60–1,20 m | **CORREGIDO** | **0,60 ≤ hoja ≤ 1,23 m** | Tabla 4.1: «La anchura de toda hoja de puerta no debe ser menor que 0,60 m, ni exceder de 1,23 m.» | [SI25] p. 26, imagen; [DccSI] p. 43 |
| B4.2.4 | Pasillos y rampas ≥ 1,00 m | VERIFICADO | **A ≥ P/200 ≥ 1,00 m⁽³⁾⁽⁴⁾⁽⁵⁾**. Nota (5): **0,80 m** en pasillos para **≤ 10 personas** usuarios habituales | Tabla 4.1 y nota (5) | [SI25] pp. 26–27 |
| B4.2.5 | Escaleras no protegidas | VERIFICADO | Descendente **A ≥ P/160⁽⁹⁾**; ascendente **A ≥ P/(160−10h)⁽⁹⁾**, h = altura de evacuación ascendente en m | Tabla 4.1 | [SI25] p. 26 |
| B4.2.6 | Escaleras protegidas | VERIFICADO | **E ≤ 3·S + 160·A_S⁽⁹⁾** | Tabla 4.1 y leyenda | [SI25] p. 26 |
| B4.2.7 | Pasillos protegidos | VERIFICADO | **P ≤ 3·S + 200·A⁽⁹⁾** | Tabla 4.1 | [SI25] p. 26 |
| B4.2.8 | Al aire libre | VERIFICADO | Pasos, pasillos y rampas **A ≥ P/600⁽¹⁰⁾**; escaleras **A ≥ P/480⁽¹⁰⁾** | Tabla 4.1 | [SI25] p. 26 |
| B4.2.9 | ¿Remite al DB SUA para la anchura mínima de las escaleras? | VERIFICADO: **sí** | Nota (9), en escaleras no protegidas (desc. y asc.), escaleras protegidas y pasillos protegidos | Nota (9): «La anchura mínima es la que se establece en DB SUA 1-4.2.2, tabla 4.1.» | [SI25] p. 27, imagen |
| B4.2.10 | El valor de esa anchura mínima | **NO VERIFICABLE** en esta sesión | El DB SUA no está en el repo. No se da ninguna cifra (Pendiente 1) | — | — |
| B4.2.11 | Puerta de salida de una escalera protegida en la planta de salida | VERIFICADO | Anchura de cálculo ≥ **80 %** de la de la escalera (nota (1)). Comentario: no vale para pasillos protegidos | Nota (1); comentario «Anchura de cálculo y flujo unitario» | [SI25] p. 27; [DccSI] p. 46 |
| B4.2.12 | Anchura libre de puerta en el ángulo de máxima apertura | LEÍDO (1 fuente, comentario) | Se admite **≥ 0,78 m** descontando el grosor de la hoja, como en el DB SUA | Comentario «Anchura libre de puertas según DB SI y DB SUA» | [DccSI] p. 44 (comentario) |
| B4.2.13 | Estrechamientos puntuales en pasillos | LEÍDO (1 fuente, comentario) | Hasta **20 cm** de reducción en un tramo de **≤ 50 cm** (pilares, bajantes) | Comentario «Anchura de cálculo y flujo unitario», 3.er párrafo | [DccSI] p. 46 (comentario) |
| B4.2.14 | Puerta de dos hojas con una < 0,60 m | LEÍDO (1 fuente, comentario) | Se admite, pero esa hoja no cuenta: fija y señalizada | Comentario | [DccSI] p. 44 (comentario) |
| B4.2.15 | Grupo de peldaños | LEÍDO (1 fuente, comentario) | Se dimensiona como escalera si salva **> 1,00 m** | Comentario «Criterios para el dimensionado de un tramo de peldaños» | [DccSI] p. 45 (comentario) |

**Tabla 4.1 — Dimensionado de los elementos de la evacuación** ([SI25] p. 26, imagen). Literal.

| Tipo de elemento | Dimensionado |
|---|---|
| Puertas y pasos | A ≥ P / 200⁽¹⁾ ≥ 0,80 m⁽²⁾. La anchura de toda hoja de puerta no debe ser menor que 0,60 m, ni exceder de 1,23 m. |
| Pasillos y rampas | A ≥ P / 200 ≥ 1,00 m⁽³⁾⁽⁴⁾⁽⁵⁾ |
| Pasos entre filas de asientos fijos en salas para público tales como cines, teatros, auditorios, etc.⁽⁶⁾ | (fuera del alcance) En filas con salida a pasillo por un extremo, A ≥ 30 cm con 7 asientos y 2,5 cm más por asiento adicional, máximo 12 asientos. Con salida por los dos extremos, A ≥ 30 cm hasta 14 asientos y 1,25 cm más por asiento adicional; 30 asientos o más: A ≥ 50 cm⁽⁷⁾. Cada 25 filas como máximo, un paso de ≥ 1,20 m |
| Escaleras no protegidas⁽⁸⁾ — para evacuación descendente | A ≥ P / 160⁽⁹⁾ |
| Escaleras no protegidas⁽⁸⁾ — para evacuación ascendente | A ≥ P / (160-10h)⁽⁹⁾ |
| Escaleras protegidas | E ≤ 3 S + 160 A_S⁽⁹⁾ |
| Pasillos protegidos | P ≤ 3 S + 200 A⁽⁹⁾ |
| En zonas al aire libre — Pasos, pasillos y rampas | A ≥ P / 600⁽¹⁰⁾ |
| En zonas al aire libre — Escaleras | A ≥ P / 480⁽¹⁰⁾ |

Leyenda, literal:
- «A = Anchura del elemento, [m]»
- «A_S = Anchura de la escalera protegida en su desembarco en la planta de salida del edificio, [m]»
- «h = Altura de evacuación ascendente, [m]»
- «P = Número total de personas cuyo paso está previsto por el punto cuya anchura se dimensiona.»
- «E = Suma de los ocupantes asignados a la escalera en la planta considerada más los de las plantas situadas por debajo o por encima de ella hasta la planta de salida del edificio, según se trate de una escalera para evacuación descendente o ascendente, respectivamente. Para dicha asignación solo será necesario aplicar la hipótesis de bloqueo de salidas de planta indicada en el punto 4.1 en una de las plantas, bajo la hipótesis más desfavorable;»
- «S = Superficie útil del recinto, o bien de la escalera protegida en el conjunto de las plantas de las que provienen las P personas, incluyendo la superficie de los tramos, de los rellanos y de las mesetas intermedias o bien del pasillo protegido.»

Notas ([SI25] p. 27, imagen), literal o resumen fiel:
- ⁽¹⁾ «La anchura de cálculo de una puerta de salida del recinto de una escalera protegida a planta de salida del edificio debe ser al menos igual al 80% de la anchura de cálculo de la escalera.»
- ⁽²⁾ «En uso Hospitalario A ≥ 1,05 m, incluso en puertas de habitación.» (fuera del alcance)
- ⁽³⁾ «En uso Hospitalario A ≥ 2,20 m (≥ 2,10 m en el paso a través de puertas).» (fuera del alcance)
- ⁽⁴⁾ Pasillos de áreas de venta en uso Comercial: con > 400 m² de área de ventas en la planta, con carros 4,00 m (entre baterías de más de 10 cajas y estanterías) y 1,80 m (otros), sin carros 1,40 m; con ≤ 400 m², con carros 3,00 m y 1,40 m, sin carros 1,20 m. (Solo si el local se asimila a Comercial y se define su implantación.)
- ⁽⁵⁾ «La anchura mínima es 0,80 m en pasillos previstos para 10 personas, como máximo, y estas sean usuarios habituales.»
- ⁽⁶⁾ ⁽⁷⁾ ⁽⁸⁾ Salas con asientos y graderíos (fuera del alcance).
- ⁽⁹⁾ «La anchura mínima es la que se establece en DB SUA 1-4.2.2, tabla 4.1.»
- ⁽¹⁰⁾ Si la evacuación al aire libre lleva a espacios interiores, estos se dimensionan como interiores, salvo escaleras o pasillos protegidos que solo sirvan a esas zonas y lleven directos a salidas de edificio, o espacios con seguridad equivalente a un sector de riesgo mínimo.

### B4.3 — Tabla 4.2 (capacidad de evacuación de las escaleras según su anchura)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B4.3.1 | Tabla 4.2 casilla a casilla, filas 1,00 a 2,40 | VERIFICADO | Transcripción siguiente (las 15 filas) | Tabla 4.2 | [SI25] p. 27, imagen; [DccSI] pp. 46–47 |
| B4.3.2 | Nota (1) | VERIFICADO | Solo vale para escaleras de **doble tramo**, **anchura constante** y rellanos y mesetas **estrictamente necesarios**. Si no, fórmula de la tabla 4.1 con la S real | Nota (1) | [SI25] p. 28, imagen |
| B4.3.3 | Nota (2) | VERIFICADO | No protegida ascendente de **más de 2,80 m**: **≤ 100 personas** (remite a la tabla 5.1) | Nota (2) | [SI25] p. 28 |
| B4.3.4 | De dónde salen las columnas | **INTERPRETACIÓN** (aritmética comprobada en las 75 casillas) | No protegida descendente = **160·A**. No protegida ascendente = **⌊132·A⌋** = ⌊A·(160 − 10·2,80)⌋: la columna supone **h = 2,80 m** y trunca. Protegida con n plantas = **160·A + n·k(A)**, con k la columna «cada planta más». Exacta en todas las casillas | Tablas 4.1 y 4.2 | — |
| B4.3.5 | Plantas impares (3, 5, 7, 9) | **INTERPRETACIÓN** | Por la regla anterior, C(n) = 160·A + n·k(A) es exacta también para n impar. Sigue sujeta a la nota (1) | — | — |

**Tabla 4.2 — Capacidad de evacuación de las escaleras en función de su anchura** ([SI25] p. 27, imagen). «Número de ocupantes que pueden utilizar la escalera».

| Anchura de la escalera en m | No protegida · evacuación ascendente⁽²⁾ | No protegida · evacuación descendente | Protegida⁽¹⁾ · 2 plantas | 4 | 6 | 8 | 10 | cada planta más |
|---|---|---|---|---|---|---|---|---|
| 1,00 | 132 | 160 | 224 | 288 | 352 | 416 | 480 | +32 |
| 1,10 | 145 | 176 | 248 | 320 | 392 | 464 | 536 | +36 |
| 1,20 | 158 | 192 | 274 | 356 | 438 | 520 | 602 | +41 |
| 1,30 | 171 | 208 | 302 | 396 | 490 | 584 | 678 | +47 |
| 1,40 | 184 | 224 | 328 | 432 | 536 | 640 | 744 | +52 |
| 1,50 | 198 | 240 | 356 | 472 | 588 | 704 | 820 | +58 |
| 1,60 | 211 | 256 | 384 | 512 | 640 | 768 | 896 | +64 |
| 1,70 | 224 | 272 | 414 | 556 | 698 | 840 | 982 | +71 |
| 1,80 | 237 | 288 | 442 | 596 | 750 | 904 | 1058 | +77 |
| 1,90 | 250 | 304 | 472 | 640 | 808 | 976 | 1144 | +84 |
| 2,00 | 264 | 320 | 504 | 688 | 872 | 1056 | 1240 | +92 |
| 2,10 | 277 | 336 | 534 | 732 | 930 | 1128 | 1326 | +99 |
| 2,20 | 290 | 352 | 566 | 780 | 994 | 1208 | 1422 | +107 |
| 2,30 | 303 | 368 | 598 | 828 | 1058 | 1288 | 1518 | +115 |
| 2,40 | 316 | 384 | 630 | 876 | 1122 | 1368 | 1614 | +123 |

Notas, literal ([SI25] p. 28):
- ⁽¹⁾ «La capacidad que se indica es válida para escaleras de doble tramo, cuya anchura sea constante en todas las plantas y cuyas dimensiones de rellanos y de mesetas intermedias sean las estrictamente necesarias en función de dicha anchura. Para otras configuraciones debe aplicarse la fórmula de la tabla 4.1, determinando para ello la superficie S de la escalera considerada.»
- ⁽²⁾ «Según se indica en la tabla 5.1, las escaleras no protegidas para una evacuación ascendente de más de 2,80 m no pueden servir a más de 100 personas.»

Propiedades comprobadas (sirven de test): las tres columnas crecen con A; en cada fila, protegida(n+2) − protegida(n) = 2·k; las 75 casillas cumplen B4.3.4.

---

## Bloque B5 — Ap. 5, protección de las escaleras (tabla 5.1)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B5.1 | Tabla 5.1 casilla a casilla | VERIFICADO | Transcripción siguiente | Tabla 5.1 «Protección de las escaleras» | [SI25] p. 28, imagen; [DccSI] pp. 47–48 |
| B5.2 | h y P de la tabla | VERIFICADO | **h = altura de evacuación de la escalera** (no del edificio); **P = personas a las que sirve en el conjunto de plantas** | Cabecera de la tabla 5.1 | [SI25] p. 28 |
| B5.3 | Residencial Vivienda, descendente | VERIFICADO | No protegida **h ≤ 14 m**; protegida **h ≤ 28 m**; especialmente protegida **en todo caso** | Tabla 5.1 | [SI25] p. 28 |
| B5.4 | Administrativo, descendente | VERIFICADO | Igual: **≤ 14 m** / **≤ 28 m** / en todo caso (misma fila que Docente) | Tabla 5.1 | [SI25] p. 28 |
| B5.5 | Comercial (local asimilado), descendente | VERIFICADO | **≤ 10 m** / **≤ 20 m** / en todo caso | Tabla 5.1 | [SI25] p. 28 |
| B5.6 | Aparcamiento, descendente y ascendente | VERIFICADO | No protegida y protegida: **«No se admite»**. Solo **especialmente protegida** | Tabla 5.1 | [SI25] p. 28 |
| B5.7 | Otro uso, ascendente | VERIFICADO | **h ≤ 2,80 m**: las tres admitidas. **2,80 < h ≤ 6,00 m**: no protegida solo con **P ≤ 100**; protegida y especialmente protegida en todo caso. **h > 6,00 m**: no protegida **no se admite** | Tabla 5.1 | [SI25] p. 28 |
| B5.8 | Nota (1): escaleras que sirven a varios usos | VERIFICADO | Cumplen en cada planta las condiciones **más restrictivas** de los usos de los sectores con los que comunican. Si un establecimiento en un edificio de viviendas no tiene que ser sector (SI 1 cap. 1), la escalera común sigue las condiciones de Residencial Vivienda | Nota (1), literal abajo | [SI25] p. 28 |
| B5.9 | Escalera común de viviendas y garaje | VERIFICADO + INTERPRETACIÓN + comentario | Puede servir a los dos (B1.9). Lectura de la nota (1): la escalera **ascendente** (sótanos → planta de salida) es especialmente protegida, con **vestíbulo de independencia** en cada acceso desde el garaje; la **descendente** (plantas de viviendas → planta de salida) se rige por la h de las viviendas. Física y constructivamente es la misma caja; en el portal, la ascendente puede no tener vestíbulo ni compartimentación | Nota (1); Anejo, «Escalera especialmente protegida»; [DccSI] p. 48 | [SI25] pp. 28, 44 |
| B5.10 | Nota (2): escaleras entre sectores dentro de la altura de no protegida | VERIFICADO | No tienen que ser protegidas, pero sí **compartimentadas** para mantener la compartimentación entre sectores (o incorporadas a uno de ellos) | Nota (2) | [SI25] p. 28 |
| B5.11 | Escalera **interior de una vivienda unifamiliar** | **INTERPRETACIÓN** firme + comentarios: **no está sujeta** | La tabla 5.1 se aplica a «escaleras previstas para evacuación». En el interior de una vivienda no hay origen de evacuación (B3.13), así que no hay recorrido de evacuación por esa escalera. Lo apoyan dos textos | ap. 5 pto 1: «En la tabla 5.1 se indican las condiciones de protección que deben cumplir las escaleras previstas para evacuación.» SI 1, tabla 2.2, nota (5): «… Lo anterior no es aplicable al recorrido total desde un garaje de una vivienda unifamiliar hasta una salida de dicha vivienda, el cual no está limitado.» Comentario: «… la no familiaridad de los ocupantes con los recorridos de evacuación del edificio (por otra parte inexistentes) …» | [SI25] pp. 28, 16, imagen; [DccSI] pp. 82–83 (comentario) |
| B5.12 | Escalera ascendente de ≤ 2,80 m: ¿escalera o peldaños? | LEÍDO (1 fuente, comentario) | Un conjunto de peldaños no es escalera (no le aplica la tabla 5.1); el límite orientativo es **2,80 m**. Pero si comunica con un aparcamiento, siempre hay vestíbulo de independencia | Comentario «Conjunto de peldaños para evacuación» | [DccSI] p. 48 (comentario, en imagen) |
| B5.13 | Escaleras no previstas para evacuación | LEÍDO (1 fuente, comentario) | No les aplica la tabla 5.1, pero la hipótesis debe ser creíble con el uso real | Comentario | [DccSI] p. 48 (comentario) |
| B5.14 | Escalera con salidas a varias cotas | LEÍDO (1 fuente, comentario) | Se protege según la mayor de las alturas de evacuación | Comentario | [DccSI] p. 48 (comentario) |
| B5.15 | Condiciones de la escalera **protegida** | VERIFICADO (Anejo) | Trazado continuo hasta la planta de salida; recinto solo de circulación, compartimentado **EI 120**; **máx. 2 accesos por planta** con puertas **EI₂ 60-C5** desde espacios de circulación comunes sin ocupación propia; en la planta de salida, **≤ 15 m** desde la puerta del recinto (o el desembarco) hasta una salida de edificio; protección frente al humo: ventanas o huecos con **≥ 1 m²** de ventilación por planta, o dos conductos (**50 cm²** por m³ de recinto, rejillas de entrada con su parte superior a **< 1 m** y de salida con su parte inferior a **> 1,80 m**), o presión diferencial (EN 12101-6:2005) | Anejo, «Escalera protegida», ptos 1 a 4 | [SI25] pp. 44–45, imagen |
| B5.16 | Escalera **especialmente protegida** | VERIFICADO (Anejo) | Condiciones de la protegida + **vestíbulo de independencia** diferente en cada acceso. Sin vestíbulo: si es **abierta al exterior**, o en la planta de salida si es **ascendente** | Anejo, «Escalera especialmente protegida» | [SI25] p. 44 |
| B5.17 | Escalera abierta al exterior | VERIFICADO (Anejo) | Huecos permanentemente abiertos de **≥ 5·A m²** por planta (A = anchura del tramo). Puede considerarse especialmente protegida sin vestíbulos | Anejo, «Escalera abierta al exterior» | [SI25] p. 44 |
| B5.18 | Vestíbulo de independencia | VERIFICADO (Anejo) | Solo circulación; paredes **EI 120**; puertas de **¼ de la resistencia del elemento que separa** y al menos **EI₂ 30-C5**; los de escaleras especialmente protegidas, con protección frente al humo; ≥ **0,50 m** entre las superficies barridas por las puertas; en itinerario accesible, círculo **Ø 1,20 m** (Ø 1,50 m con zona de refugio) | Anejo, «Vestíbulo de independencia» | [SI25] pp. 51–52, imagen |
| B5.19 | Garaje de un solo sótano: ¿control de humo en la escalera? | LEÍDO (1 fuente, comentario) | Se puede admitir sin control de humo (recinto y vestíbulo) si sirve a **una sola planta** y salva **≤ 3,00 m** | Comentario «Ventilación de escaleras protegidas o especialmente protegidas» | [DccSI] p. 72 (comentario) |
| B5.20 | El vestíbulo puede servir también a trasteros o instalaciones | LEÍDO (1 fuente, comentario) | En una planta solo de garaje, locales de riesgo especial u ocupación nula, el vestíbulo de la escalera especialmente protegida puede comunicar con todos (EI₂ 30-C5; EI₂ 45-C5 si alguno es de riesgo alto) | Comentarios «Comunicación de recintos o zonas con los vestíbulos …» y «Acceso a local de riesgo especial bajo desde el vestíbulo …» | [DccSI] pp. 71–72 (comentarios) |
| B5.21 | Viviendas y vestíbulo de una especialmente protegida | LEÍDO (1 fuente, comentario) | El vestíbulo no puede comunicar directamente con viviendas: a través de zona común | Comentario «Comunicación de viviendas con escalera especialmente protegida» | [DccSI] p. 71 (comentario) |

**Tabla 5.1 — Protección de las escaleras** ([SI25] p. 28, imagen). h = altura de evacuación de la escalera; P = número de personas a las que sirve en el conjunto de plantas.

| Uso previsto⁽¹⁾ | No protegida | Protegida⁽²⁾ | Especialmente protegida |
|---|---|---|---|
| **Escaleras para evacuación descendente** | | | |
| Residencial Vivienda | h ≤ 14 m | h ≤ 28 m | Se admite en todo caso |
| Administrativo, Docente | h ≤ 14 m | h ≤ 28 m | Se admite en todo caso |
| Comercial, Pública concurrencia | h ≤ 10 m | h ≤ 20 m | Se admite en todo caso |
| Residencial Público | Baja más una | h ≤ 28 m⁽³⁾ | Se admite en todo caso |
| Hospitalario · zonas de hospitalización o de tratamiento intensivo | No se admite | h ≤ 14 m | Se admite en todo caso |
| Hospitalario · otras zonas | h ≤ 10 m | h ≤ 20 m | Se admite en todo caso |
| Aparcamiento | No se admite | No se admite | Se admite en todo caso |
| **Escaleras para evacuación ascendente** | | | |
| Uso Aparcamiento | No se admite | No se admite | Se admite en todo caso |
| Otro uso: h ≤ 2,80 m | Se admite en todo caso | Se admite en todo caso | Se admite en todo caso |
| Otro uso: 2,80 < h ≤ 6,00 m | P ≤ 100 personas | Se admite en todo caso | Se admite en todo caso |
| Otro uso: h > 6,00 m | No se admite | Se admite en todo caso | Se admite en todo caso |

En la imagen, «Se admite en todo caso» de la columna «Especialmente protegida» es una sola casilla que abarca todas las filas de cada bloque.

Notas, literal ([SI25] p. 28):
- ⁽¹⁾ «Las escaleras para evacuación descendente y las escaleras para evacuación ascendente cumplirán en todas sus plantas respectivas las condiciones más restrictivas de las correspondientes a los usos de los sectores de incendio con los que comuniquen en dichas plantas. Cuando un establecimiento contenido en un edificio de uso Residencial Vivienda no precise constituir sector de incendio conforme al capítulo 1 de la Sección 1 de este DB, las condiciones exigibles a las escaleras comunes son las correspondientes a dicho uso.»
- ⁽²⁾ «Las escaleras que comuniquen sectores de incendio diferentes pero cuya altura de evacuación no exceda de la admitida para las escaleras no protegidas, no precisan cumplir las condiciones de las escaleras protegidas, sino únicamente estar compartimentadas de tal forma que a través de ellas se mantenga la compartimentación exigible entre sectores de incendio, siendo admisible la opción de incorporar el ámbito de la propia escalera a uno de los sectores a los que sirve.»
- ⁽³⁾ «Cuando se trate de un establecimiento con menos de 20 plazas de alojamiento se podrá optar por instalar un sistema de detección y alarma como medida alternativa a la exigencia de escalera protegida.» (fuera del alcance)

Propiedad (test): para un mismo uso descendente, h(no protegida) < h(protegida); la especialmente protegida se admite siempre.

---

## Bloque B6 — Ap. 6, puertas situadas en recorridos de evacuación

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B6.1 | Qué puertas | VERIFICADO | Las previstas como **salida de planta o de edificio** y las previstas para **más de 50 personas** | ap. 6 pto 1 (literal en la nota B6) | [SI25] p. 29, imagen |
| B6.2 | Cómo | VERIFICADO | **Abatibles de eje de giro vertical**. Cierre: o no actúa mientras haya actividad, o es de fácil y rápida apertura desde el lado de la evacuación, **sin llave** y con **un solo mecanismo**. No se aplica a puertas automáticas | ap. 6 pto 1 | [SI25] p. 29 |
| B6.3 | UNE-EN 179 / UNE-EN 1125 | VERIFICADO | Se **consideran conformes** (no son obligatorios): manilla o pulsador **UNE-EN 179:2009** si la mayoría de usuarios está familiarizada con la puerta; si no, y la puerta abre en el sentido de la evacuación, barra horizontal **UNE-EN 1125:2009** | ap. 6 pto 2 | [SI25] p. 29 |
| B6.4 | Sentido de apertura | VERIFICADO | Abre en el sentido de la evacuación toda puerta de salida prevista para el **paso de > 200 personas en edificios de uso Residencial Vivienda** (> **100** en los demás casos), **o** para **> 50 ocupantes del recinto** o espacio donde está. Personas contadas con los criterios del ap. 4.1 | ap. 6 pto 3 | [SI25] p. 29 |
| B6.5 | ¿Qué umbral usa la puerta del garaje de un edificio de viviendas, 200 o 100? | **INTERPRETACIÓN** dudosa + CRITERIO | El literal dice «en edificios de uso Residencial Vivienda». El garaje es otro uso y otro sector. Propuesta: **100** para las puertas del garaje (lado de la seguridad). En la práctica no decide: el garaje rara vez pasa de 50 ocupantes (2.000 m² útiles a 40 m²/persona) | ap. 6 pto 3 a) | — |
| B6.6 | Cuadro del Ministerio | LEÍDO (1 fuente, comentario) | Familiarizados (vivienda, oficinas no públicas): manilla o pulsador UNE-EN 179, o barra UNE-EN 1125 opcional. No familiarizados (comercial, oficinas públicas): barra UNE-EN 1125 obligatoria. El mecanismo se exige «cuando la puerta tenga sistema de bloqueo» | Comentario «Apertura en el sentido de la evacuación y dispositivos» | [DccSI] pp. 50–51 (comentario, en imagen) |
| B6.7 | Puertas giratorias | VERIFICADO | Con puertas abatibles manuales contiguas, salvo que sean automáticas y se abatan en el sentido de la evacuación con **≤ 220 N** | ap. 6 pto 4 | [SI25] p. 29 |
| B6.8 | Puertas peatonales automáticas | VERIFICADO | Ante fallo eléctrico o señal de emergencia (salvo «cerrado seguro»): correderas o plegables, abrir y mantener abiertas o abatirse con **≤ 220 N** (abatimiento no admitido en itinerario accesible); abatibles u oscilobatientes, abrir y mantener o abatirse con **≤ 150 N** (en itinerario accesible **≤ 25 N**, **≤ 65 N** si son resistentes al fuego). Fuerza en el borde de la hoja a **1000 ± 10 mm**. Mantenimiento **UNE 85121:2018** | ap. 6 pto 5 | [SI25] p. 29 |
| B6.9 | Comentario sobre la fuerza en correderas automáticas | LEÍDO (1 fuente, comentario) + **discrepancia** | El comentario habla de «fuerza máxima de apertura establecida en 200N» y mínima de 150 N; el articulado dice **220 N**. Manda el articulado | Comentario «Fuerza mínima de apertura en puertas peatonales automáticas correderas o plegables» | [DccSI] p. 51 (comentario) |
| B6.10 | Puertas del garaje de un edificio de viviendas: bloqueo | LEÍDO (1 fuente, comentario) | No puede actuar **ningún bloqueo** (llave, clave, tarjeta): el garaje no tiene horario | Comentario «Bloqueo de puertas de salida de aparcamientos de edificios de vivienda» | [DccSI] p. 49 (comentario) |
| B6.11 | Portón de vehículos como salida | LEÍDO (1 fuente, comentario) | **Ningún portón** vale por sí mismo para evacuar personas. Puede llevar una **puerta peatonal** válida si tiene **marcado CE** (SUA 2-1.2.3). Sin marcado, solo en el garaje de una vivienda unifamiliar o en una plaza segregada de un usuario | Comentario «Validez de las puertas para vehículos para la evacuación de personas» | [DccSI] pp. 49–50 (comentario, en imagen) |
| B6.12 | Salida de edificio sin puerta | LEÍDO (1 fuente, comentario) | Una salida de edificio puede ser un **hueco**; un cierre que con certeza está abierto durante la actividad no es «puerta» a estos efectos | Comentario «Condiciones aplicables a un hueco de salida» | [DccSI] p. 50 (comentario) |
| B6.13 | Puertas de vaivén | LEÍDO (1 fuente, comentario) | No son abatibles a efectos del ap. 6.1 | Comentario | [DccSI] p. 49 (comentario) |
| B6.14 | Apertura controlada eléctricamente | LEÍDO (1 fuente, comentario) | Admisible con sistema **UNE-EN 13637** y las condiciones del comentario | Comentario | [DccSI] p. 49 (comentario) |

**Nota B6 — ap. 6 ptos 1 a 3, literal** ([SI25] p. 29).
1. «Las puertas previstas como salida de planta o de edificio y las previstas para la evacuación de más de 50 personas serán abatibles con eje de giro vertical y su sistema de cierre, o bien no actuará mientras haya actividad en las zonas a evacuar, o bien consistirá en un dispositivo de fácil y rápida apertura desde el lado del cual provenga dicha evacuación, sin tener que utilizar una llave y sin tener que actuar sobre más de un mecanismo. Las anteriores condiciones no son aplicables cuando se trate de puertas automáticas.»
2. «Se considera que satisfacen el anterior requisito funcional los dispositivos de apertura mediante manilla o pulsador conforme a la norma UNE-EN 179:2009, cuando se trate de la evacuación de zonas ocupadas por personas que en su mayoría estén familiarizados con la puerta considerada, así como en caso contrario, cuando se trate de puertas con apertura en el sentido de la evacuación conforme al punto 3 siguiente, los de barra horizontal de empuje o de deslizamiento conforme a la norma UNE EN 1125:2009.»
3. «Abrirá en el sentido de la evacuación toda puerta de salida: a) prevista para el paso de más de 200 personas en edificios de uso Residencial Vivienda o de 100 personas en los demás casos, o bien. b) prevista para más de 50 ocupantes del recinto o espacio en el que esté situada. Para la determinación del número de personas que se indica en a) y b) se deberán tener en cuenta los criterios de asignación de los ocupantes establecidos en el apartado 4.1 de esta Sección.»

Garaje de vivienda unifamiliar (comentario a SI 1, [DccSI] p. 24): salida del garaje mediante una puerta abatible de eje vertical de **≥ 80 cm**, que puede ir en el portón; si da a la vivienda, **EI₂ 45-C5**. Dentro del garaje, recorrido **≤ 25 m** hasta su salida. El resto, por la vivienda, no es recorrido de evacuación.

---

## Bloque B7 — Ap. 7, señalización de los medios de evacuación

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B7.1 | Norma de las señales | VERIFICADO | **UNE 23034:1988** | ap. 7 pto 1 | [SI25] p. 29, imagen |
| B7.2 | Rótulo «SALIDA» | VERIFICADO | En las salidas de recinto, planta o edificio. **Excepto**: (i) **edificios de uso Residencial Vivienda**; (ii) en otros usos, salidas de recintos de **≤ 50 m²**, fácilmente visibles desde todo punto y con ocupantes familiarizados (las tres condiciones) | ap. 7 pto 1 a) | [SI25] pp. 29–30, imagen |
| B7.3 | ¿En Residencial Vivienda no hay que señalizar nada? | **CORREGIDO** (generalización) | La excepción es **solo del rótulo «SALIDA»** (pto 1 a). Siguen aplicándose c) flechas de dirección visibles desde todo origen de evacuación que no vea la salida; d) señales donde haya alternativas que induzcan a error, **«como … aquellas escaleras que, en la planta de salida del edificio, continúen su trazado hacia plantas más bajas»** (la que baja al garaje); e) «Sin salida» | ap. 7 pto 1 c), d), e) | [SI25] p. 30 |
| B7.4 | ¿El garaje de un edificio de viviendas entra en la excepción? | **INTERPRETACIÓN** + CRITERIO | El literal habla de «edificios de uso Residencial Vivienda». El garaje es otro uso (Aparcamiento) y otro sector, y no cumple la excepción de 50 m². Propuesta: señalizar sus salidas y recorridos (lado de la seguridad) | ap. 7 pto 1 a) | — |
| B7.5 | «Salida de emergencia» | VERIFICADO | En toda salida prevista solo para emergencias | ap. 7 pto 1 b) | [SI25] p. 30 |
| B7.6 | Señales de dirección | VERIFICADO | Visibles desde todo origen de evacuación desde el que no se perciban las salidas o sus señales, y frente a toda salida de un recinto de **> 100** ocupantes que dé lateralmente a un pasillo | ap. 7 pto 1 c) | [SI25] p. 30 |
| B7.7 | Itinerarios accesibles y zonas de refugio | VERIFICADO | Señales a) a d) con el SIA; hacia zona de refugio o sector alternativo, además «ZONA DE REFUGIO». La zona de refugio: color de pavimento distinto y rótulo «ZONA DE REFUGIO» con SIA en pared adyacente | ap. 7 pto 1 g) y h) | [SI25] p. 30 |
| B7.8 | Visibilidad sin alumbrado normal | VERIFICADO | Visibles aunque falle el alumbrado normal | ap. 7 pto 2 | [SI25] p. 30 |
| B7.9 | Fotoluminiscentes | VERIFICADO | Cuando lo sean: **UNE 23035-1:2003, UNE 23035-2:2003 y UNE 23035-4:2003**; mantenimiento **UNE 23035-3:2003** | ap. 7 pto 2 | [SI25] p. 30, imagen |
| B7.10 | Coherencia con el reparto | VERIFICADO | Señales coherentes con la asignación de ocupantes del cap. 4 | ap. 7 pto 1 f) | [SI25] p. 30 |

---

## Bloque B8 — Ap. 8, control del humo de incendio

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B8.1 | Cuándo es obligatorio | VERIFICADO | a) **Zonas de uso Aparcamiento que no tengan la consideración de aparcamiento abierto**; b) Comercial o Pública concurrencia con ocupación **> 1000**; c) atrios con **> 500** personas (fuera del alcance) | ap. 8 pto 1 | [SI25] p. 30, imagen |
| B8.2 | Aparcamiento abierto | VERIFICADO (Anejo) | a) En cada planta, fachadas con área **permanentemente abierta ≥ 1/20** de su superficie construida, de la que **≥ 1/40** repartida uniformemente entre las dos paredes opuestas más próximas; b) borde superior de las aberturas a **≤ 0,5 m** del techo. Comentario: el reparto debe ser razonablemente próximo al 50 % en cada pared y uniforme a lo largo de ellas | Anejo, «Aparcamiento abierto»; comentario «Reparto uniforme de la superficie de ventilación» | [SI25] p. 42, imagen; [DccSI] p. 68 (comentario) |
| B8.3 | Garaje en sótano | **INTERPRETACIÓN** | Sin fachadas abiertas no es aparcamiento abierto → necesita control de humo | ap. 8 pto 1 a); Anejo | — |
| B8.4 | Garaje ≤ 100 m² construidos o de vivienda unifamiliar | VERIFICADO (por definición) | No es «uso Aparcamiento» → el ap. 8.1 a) no le alcanza. El de ≤ 100 m² es local de riesgo especial bajo (SI 1, tabla 1.1, nota (2)) | Anejo, «Uso Aparcamiento»; SI 1, tabla 1.1, nota (2) | [SI25] pp. 50, 12, imagen |
| B8.5 | Cómo se diseña | VERIFICADO | «pueden realizarse» con **UNE 23584:2008**, **UNE 23585:2017** y **UNE-EN 12101-6:2006** | ap. 8 pto 2, 1.er párrafo | [SI25] p. 30 |
| B8.6 | Vale la ventilación de HS 3 | VERIFICADO | En uso Aparcamiento «se consideran válidos los sistemas de ventilación conforme a lo establecido en el DB HS-3». Si son **mecánicos**, cumplen además a), b) y c) | ap. 8 pto 2, 2.º párrafo | [SI25] p. 30 |
| B8.7 | Ventilación **natural** de HS 3 | **INTERPRETACIÓN** (literal) | Las condiciones adicionales se piden «cuando sean mecánicos». Una ventilación natural conforme a HS 3 vale sin ellas | ap. 8 pto 2 | — |
| B8.8 | Caudal y activación | VERIFICADO | Capaz de **extraer 150 l/plaza·s** con una **aportación máxima de 120 l/plaza·s**; **activación automática en caso de incendio mediante una instalación de detección** | ap. 8 pto 2 a) | [SI25] p. 30, imagen |
| B8.9 | Compuertas | VERIFICADO | En plantas de **altura > 4 m**, cerrar con **compuertas automáticas E₃₀₀ 60** las aberturas de extracción más cercanas al suelo, si las hay | ap. 8 pto 2 a) | [SI25] pp. 30–31, imagen |
| B8.10 | Ventiladores | VERIFICADO | **F₃₀₀ 60**, incluidos los de impulsión para vencer pérdidas de carga o regular el flujo | ap. 8 pto 2 b) | [SI25] p. 31, imagen |
| B8.11 | Conductos | VERIFICADO | Por un único sector: **E₃₀₀ 60**. Si atraviesan elementos separadores de sectores: **EI 60** | ap. 8 pto 2 c) | [SI25] p. 31, imagen |
| B8.12 | Número de redes y aberturas | **CORREGIDO** (atribución) | **No están en SI 3.** Vienen de HS 3 (ap. 3.1.4.2), que SI 3 incorpora («adicionales a las allí establecidas»): con **15 o más plazas**, al menos **dos redes** de extracción por planta; una abertura de admisión y otra de extracción por cada 100 m² útiles; separación entre aberturas de extracción < 10 m; 2/3 de las extracciones a ≤ 0,5 m del techo | ap. 8 pto 2; HS 3 ap. 3.1.4.2 ptos 3, 4 y 6 | `research/verificacion-hs3-v4.md`, 7i–7l |
| B8.13 | Relación de caudales con HS 3 | VERIFICADO (los dos literales) | HS 3: **120 l/s por plaza** (ventilación). SI 3: **extraer 150 l/plaza·s** en incendio, aportando **≤ 120**. El ventilador de un sistema mixto se dimensiona para 150 | HS 3 tabla 2.2; SI 3 ap. 8 pto 2 a) | `verificacion-hs3-v4.md` 7c; [SI25] p. 30 |
| B8.14 | ¿Qué «instalación de detección» activa el sistema? | **NO VERIFICABLE** + CRITERIO | El DB no dice el tipo. «En caso de incendio» apunta a **detección de incendios**, no a la detección de CO de HS 3. Propuesta: rotularlo como criterio. Ojo: SI 4 solo exige detección de incendios en aparcamientos de **> 500 m²** construidos ([SI25] p. 35, solo texto; lo verifica el agente de SI 4). Si el control de humo es mecánico, el ap. 8.2 a) obliga a una detección **aunque el garaje sea menor** (INTERPRETACIÓN) | ap. 8 pto 2 a); SI 4 tabla 1.1 | [SI25] |
| B8.15 | Compatibilidad con HS 3 y RIPCI | LEÍDO (1 fuente, comentario) | El sistema debe ser compatible con la ventilación de HS 3-3.1.4.2; el RIPCI define las características de los sistemas de control de humos y calor | Comentario «Sistemas para el control del humo en aparcamientos» | [DccSI] p. 53 (comentario) |
| B8.16 | Ventiladores en cubierta | LEÍDO (1 fuente, comentario) | En un sistema mixto (HS 3 + SI 3-8) con ventiladores en la boca de expulsión, puede bastar una clase menor que **F₃₀₀ 60** si se justifica la temperatura de los gases a su paso | Comentario «Validez de ventiladores en cubierta con clasificación menos exigente que F300 60» | [DccSI] p. 53 (comentario) |

**Nota B8 — ap. 8 pto 2, literal** ([SI25] pp. 30–31). «El diseño, cálculo, instalación y mantenimiento del sistema pueden realizarse de acuerdo con las normas UNE 23584:2008, UNE 23585:2017 y UNE-EN 12101-6:2006. En zonas de uso Aparcamiento se consideran válidos los sistemas de ventilación conforme a lo establecido en el DB HS-3, los cuales, cuando sean mecánicos, cumplirán las siguientes condiciones adicionales a las allí establecidas: a) El sistema debe ser capaz de extraer un caudal de aire de 150 l/plaza·s con una aportación máxima de 120 l/plaza·s y debe activarse automáticamente en caso de incendio mediante una instalación de detección. En plantas cuya altura exceda de 4 m deben cerrase mediante compuertas automáticas E₃₀₀ 60 las aberturas de extracción de aire más cercanas al suelo, cuando el sistema disponga de ellas. b) Los ventiladores, incluidos los de impulsión para vencer pérdidas de carga y/o regular el flujo, deben tener una clasificación F₃₀₀ 60. c) Los conductos que transcurran por un único sector de incendio deben tener una clasificación E₃₀₀ 60. Los que atraviesen elementos separadores de sectores de incendio deben tener una clasificación EI 60.» («cerrase» es errata del original.)

No confundir con SI 1: la clase **F₄₀₀ 90** que aparece en [SI25] p. 16 es de los ventiladores de extracción de **cocinas** (tabla 2.1 de SI 1), no del garaje.

---

## Bloque B9 — Ap. 9, evacuación de personas con discapacidad en caso de incendio

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B9.1 | Umbrales | VERIFICADO | **Residencial Vivienda**: altura de evacuación **> 28 m**. **Administrativo** (y Residencial Público, Docente): **> 14 m**. Comercial o Pública concurrencia: **> 10 m**. **Plantas de uso Aparcamiento** de superficie **> 1.500 m²** | ap. 9 pto 1 | [SI25] p. 31, imagen |
| B9.2 | Qué se exige | VERIFICADO | En esos edificios, toda planta que **no sea zona de ocupación nula** y **no tenga salida del edificio accesible**: paso a un **sector de incendio alternativo** por una salida de planta accesible, **o** una **zona de refugio** con plazas para: **1 silla de ruedas por cada 100 ocupantes o fracción**; y, **excepto en Residencial Vivienda**, **1 persona con otra movilidad reducida por cada 33 ocupantes o fracción** (ocupación según SI 3-2) | ap. 9 pto 1 | [SI25] p. 31 |
| B9.3 | Superficie de la planta de garaje: ¿útil o construida? | **NO VERIFICABLE** | El texto dice «plantas de uso Aparcamiento cuya superficie exceda de 1.500 m²», sin precisar. CRITERIO: comparar con la **construida** si se conoce; si no, con la útil y avisar | ap. 9 pto 1 | — |
| B9.4 | Itinerario accesible hasta la zona de refugio | VERIFICADO | Toda planta con zonas de refugio o salida de planta accesible tendrá itinerario accesible desde todo origen en zona accesible | ap. 9 pto 2 | [SI25] p. 31 |
| B9.5 | Planta de salida del edificio | VERIFICADO + **INTERPRETACIÓN** (alcance) | «Toda planta de salida del edificio dispondrá de algún itinerario accesible desde todo origen de evacuación situado en una zona accesible hasta alguna salida del edificio accesible.» Es un punto aparte, sin umbral: se aplica a **todos** los edificios del ámbito (INTERPRETACIÓN). Enlaza con el DB SUA 9 (no leído) | ap. 9 pto 3 | [SI25] p. 31 |
| B9.6 | Salidas de emergencia accesibles | VERIFICADO | En la planta de salida pueden ser distintas de los accesos principales | ap. 9 pto 4 | [SI25] p. 31 |
| B9.7 | Zona de refugio | VERIFICADO (Anejo) | Plazas de **1,20 × 0,80 m** (silla de ruedas) o **0,80 × 0,60 m** (otra movilidad); en rellanos de escaleras protegidas o especialmente protegidas, en sus vestíbulos de independencia o en un pasillo protegido, sin invadir la anchura libre de paso; junto a ella, círculo **Ø 1,50 m**. Intercomunicador con el puesto de control en usos **distintos** de Residencial Vivienda que lo tengan | Anejo, «Zona de refugio» | [SI25] p. 52, imagen |
| B9.8 | Plazas de refugio en garaje | LEÍDO (1 fuente, comentario) | Por la **ocupación** de la planta (tabla 2.1), no por el número de plazas accesibles | Comentario «Criterio para determinar la capacidad de una zona de refugio» | [DccSI] p. 53 (comentario) |
| B9.9 | Salidas accesibles | LEÍDO (1 fuente, comentario) | Mismas reglas que las salidas de planta: número, recorrido máximo desde todo punto que pueda ocupar una persona con discapacidad, tramo hasta recorrido alternativo y bloqueo | Comentario «Condiciones de las salidas accesibles» | [DccSI] p. 54 (comentario) |

Consecuencia para los edificios de la herramienta (INTERPRETACIÓN): con altura de evacuación ≤ 28 m (viviendas) o ≤ 14 m (oficinas) y plantas de garaje ≤ 1.500 m², el ap. 9.1 **no se aplica**; el 9.3 sí.

---

## Bloque B10 — Comentarios del Ministerio ([DccSI], 4-mar-2025)

No tienen carácter reglamentario ([DccSI] p. 2). Se recogen todos los comentarios de SI 3 y del Anejo A que cambian o precisan la lectura para estos edificios. Páginas del PDF de [DccSI].

| # | Tema | Comentario (literal o casi) | Pág. | Efecto en el módulo |
|---|---|---|---|---|
| B10.1 | Origen de evacuación en viviendas | **No hay comentario.** Solo el Anejo: los puntos interiores de las viviendas no son origen (B3.13) | — | La «puerta de la vivienda» es INTERPRETACIÓN |
| B10.2 | Escaleras de vivienda unifamiliar | Indirecto: en una unifamiliar los recorridos de evacuación son «por otra parte inexistentes» (comentario sobre uso turístico). SI 1, tabla 2.2, nota (5) (articulado): el recorrido desde el garaje de la unifamiliar hasta la salida de la vivienda «no está limitado» | 82–83 | SI 3 no evalúa recorridos ni escaleras dentro de la unifamiliar |
| B10.3 | Salida de la unifamiliar a través de su garaje | «No es posible acceder a la salida de una vivienda unifamiliar a través de su garaje», porque es zona de riesgo especial; salvo garaje no cerrado en sentido estricto, asimilable a plaza cubierta | 77 | Aviso si la única salida de la unifamiliar pasa por el garaje |
| B10.4 | Garaje de la unifamiliar | Dentro, recorrido ≤ 25 m hasta su salida; puerta a la vivienda EI₂ 45-C5 de ≥ 80 cm; el portón no es salida, hace falta puerta abatible de ≥ 80 cm (puede ir en el portón) | 24 (SI 1) | Texto de la memoria de la unifamiliar |
| B10.5 | Garaje que evacúa por la escalera común | Escalera común sótano–portal: **especialmente protegida** si salva **> 2,80 m** | 48 | Decisión «escalera del garaje» |
| B10.6 | Plazas con acceso propio a su vivienda | Vestíbulo de independencia (EI 120 y dos puertas EI₂ 30-C5) o la propia escalera compartimentada; esa escalera no tiene que ser especialmente protegida. Recorridos 35 m / 50 m según haya o no otra salida común | 41 | Caso raro; aviso |
| B10.7 | Trasteros en sótano | Origen de evacuación en la **puerta del trastero** al fondo de una plaza (si no es de riesgo especial). Trasteros que ventilan al garaje: el garaje se dimensiona con 0,7 l/s más por m² de trastero | 75; 24 (SI 1) | Recorridos del sótano de trasteros |
| B10.8 | Altura de evacuación | Plantas de ocupación nula: no cuentan las **más altas**, «pero sí las más bajas». Con salidas a varias cotas, la mayor | 84; 68 | Altura ascendente de los sótanos |
| B10.9 | Salida del edificio por el portal | Sin comentario propio. Valen: salida de edificio = puerta o **hueco** a espacio exterior seguro; con ≤ 500 personas, un espacio exterior con dos recorridos alternativos a EES, uno ≤ 50 m; delante de la salida, **0,5·P m²** en un radio de **0,1·P m**, sin comprobar si **P ≤ 50** (Anejo, articulado). Una salida de edificio no necesita puerta abatible si es hueco permanentemente abierto (comentario p. 50) | Anejo pp. 45, 48; 50 | Portal: anchura y espacio exterior |
| B10.10 | Longitud medida con mobiliario | **No hay comentario.** Solo «sobre el eje» y, en garajes, «diagonales … de los recorridos reales previsibles»; pasos peatonales entre plazas ≥ 0,80 m | 77 | B3.19–B3.20 |
| B10.11 | Rampa del garaje como recorrido | Pendiente **≤ 16 %** (SUA 1-4.3.1); si se usa también a diario, protegida con bordillo o barrera (SUA 7-2.2) | 77 | Si la salida del garaje es la rampa |
| B10.12 | Escalera no protegida y salida de planta | «… escaleras no protegidas … no podrían considerarse como tales [salidas de planta]». Los límites se cumplen hasta alguna salida de planta, en la misma planta o en otra | 40 | B3.17–B3.18 |
| B10.13 | Aplicación de la tabla 3.1 | Dos partes; cumplir la superior permite una salida | 39 | Orden de evaluación |
| B10.14 | +25 % con extinción | A cualquier recorrido regulado | 39 | Nota (1) |
| B10.15 | Hipótesis de bloqueo | Solo si es exigible más de una salida, y solo para anchuras | 42 | B4.1.4 |
| B10.16 | Puertas: mecanismo y sentido | Cuadro familiarizados / no familiarizados | 50–51 | B6.6 |
| B10.17 | Bloqueo de puertas del garaje | Ningún bloqueo en garajes de edificios de viviendas | 49 | Texto de la memoria |
| B10.18 | Portones | No valen; puerta peatonal con marcado CE | 49–50 | Texto de la memoria |
| B10.19 | Escalera del garaje de un sótano | Sin control de humo si sirve a una planta y salva ≤ 3,00 m | 72 | Aviso al proyectista |
| B10.20 | Ventiladores en cubierta | Clase menor que F₃₀₀ 60 si se justifica | 53 | Texto de la memoria |
| B10.21 | Apartamentos turísticos | Son Residencial Vivienda, pero con la ocupación que fije la administración turística si es mayor de 1 persona/20 m² | 82 | Fuera del alcance; aviso posible |

**Lo que el [DccSI] NO comenta** (búsqueda en todo SI 3 y el Anejo A): origen de evacuación en la puerta de la vivienda; 35 m «ocupantes que duermen» en viviendas; medición con mobiliario; anchura mínima de escaleras; señalización del garaje de un edificio de viviendas; tipo de detección para activar el control de humo; cubiertas transitables comunitarias como origen de evacuación.

---

## Bloque B11 — Frases típicas de memoria

| # | Frase | Veredicto | Redacción correcta | Cita |
|---|---|---|---|---|
| B11.1 | «Ocupación de viviendas 20 m²/persona» | VERIFICADO (precisar) | «Ocupación: 1 persona por cada 20 m² de superficie útil en plantas de vivienda (uso Residencial Vivienda).» | DB-SI, SI 3, ap. 2.1, tabla 2.1 |
| B11.2 | «Una única salida de planta porque la ocupación no excede de 100 personas y los recorridos no exceden de 25 m» | **CORREGIDO** (incompleta) | Faltan dos condiciones y un matiz. Las cuatro: ocupación ≤ 100 por planta (salida del edificio de viviendas: ≤ 500 en el conjunto); recorrido ≤ 25 m **desde la puerta de la vivienda más desfavorable hasta la salida de planta** (si la escalera es no protegida, **hasta la salida del edificio**); altura de evacuación descendente ≤ 28 m. Ejemplo: «Cada planta dispone de una única salida de planta: su ocupación no excede de 100 personas, la del edificio no excede de 500, la altura de evacuación (X m) no excede de 28 m y el recorrido más desfavorable, medido desde la puerta de la vivienda más alejada hasta [la salida del edificio / el acceso a la escalera protegida], es de Y m ≤ 25 m.» | SI 3, tabla 3.1; Anejo SI A |
| B11.3 | «En el garaje, recorridos ≤ 35 m con una salida» | VERIFICADO (precisar) | «Uso Aparcamiento con una salida de planta: recorrido máximo 35 m (43,75 m con instalación automática de extinción, nota 1), ocupación ≤ 100 personas y altura de evacuación ascendente ≤ 10 m.» Solo si el garaje es uso Aparcamiento (> 100 m² construidos) | SI 3, tabla 3.1 y nota (1); Anejo SI A «Uso Aparcamiento» |
| B11.4 | «Escalera no protegida por ser la altura de evacuación ≤ 14 m» | VERIFICADO (precisar) | Válida para Residencial Vivienda y Administrativo, evacuación **descendente**, con h = altura de evacuación **de la escalera**. **No** vale para el tramo que sirve al garaje (especialmente protegida) | SI 3, tabla 5.1 |
| B11.5 | «Escalera protegida para 14 < h ≤ 28 m» | VERIFICADO | Residencial Vivienda y Administrativo, descendente. Por encima de 28 m: especialmente protegida, **dos escaleras** (tabla 3.1) y ap. 9 (zona de refugio o sector alternativo) | SI 3, tablas 3.1 y 5.1; ap. 9 |
| B11.6 | «Anchura de escalera ≥ 1,00 m» | **NO VERIFICABLE** como cifra del DB-SI | El DB-SI no da 1,00 m para escaleras: da A ≥ P/160 (descendente no protegida) y remite la mínima al DB SUA 1-4.2.2, tabla 4.1 (no leída). El 1,00 m del DB-SI es de **pasillos y rampas**. Redacción: «Anchura de cálculo A ≥ P/160 = … m; anchura mínima según DB SUA 1, tabla 4.1.» | SI 3, tabla 4.1, nota (9) |
| B11.7 | «Puertas de salida ≥ 0,80 m» | VERIFICADO (completar) | «A ≥ P/200 ≥ 0,80 m; hojas entre 0,60 y 1,23 m.» | SI 3, tabla 4.1 |
| B11.8 | «En uso Residencial Vivienda no es necesaria la señalización de salidas» | **CORREGIDO** (matiz) | «En uso Residencial Vivienda no es exigible el rótulo "SALIDA" (SI 3-7.1 a). Se señalizan los recorridos donde la salida no se vea y donde haya alternativas que induzcan a error, en particular la escalera que en la planta de salida continúa hacia el sótano (SI 3-7.1 c y d).» El garaje se señaliza (criterio, B7.4) | SI 3, ap. 7 pto 1 |
| B11.9 | «El garaje no abierto necesita control de humo; vale el sistema de ventilación de HS 3 si cumple…» | VERIFICADO | «… si es mecánico: extracción de 150 l/plaza·s con aportación máxima de 120 l/plaza·s, activación automática por instalación de detección, compuertas E₃₀₀ 60 en plantas de más de 4 m de altura, ventiladores F₃₀₀ 60 y conductos E₃₀₀ 60 (EI 60 si atraviesan sectores).» Número de redes y aberturas: HS 3, no SI 3 | SI 3, ap. 8; HS 3 ap. 3.1.4.2 |

---

## Cifras que SÍ se pueden mostrar en la UI, con su cita

Cita base: «DB-SI, Sección SI 3 (consolidado 4-mar-2025)».
- **Densidades** (tabla 2.1, ap. 2.1): viviendas 20; oficinas 10; vestíbulos de oficinas 2; aparcamiento con horario 15, en otros casos 40; mantenimiento: ocupación nula; aseos de planta 3; archivos y almacenes 40; Comercial en PB (si el local se asimila) 2. Trasteros de viviendas: **ocupación nula** (Anejo SI A).
- **Tabla 3.1 completa**: 100 / 500 (salida de edificio de viviendas) / 50 (ascendente > 2 m); 25 / 35 (Aparcamiento) / 50 (salida directa a EES con ≤ 25 personas, o aire libre); 28 m descendente / 10 m ascendente; con varias salidas 50 / 35 / 75 y tramo único igual al máximo con una salida; dos escaleras si > 28 m o > 50 personas ascendentes > 2 m; +25 % con extinción automática (nota 1); planta de salida con más de una salida si el edificio de viviendas pasa de 500 (nota 3).
- **Alturas ascendentes máximas**: 4 m hasta salida de planta, 6 m hasta EES (Anejo, «Recorrido de evacuación»), salvo aparcamientos y zonas de ocupación nula.
- **Tabla 4.1**: puertas A ≥ P/200 ≥ 0,80 m, hojas 0,60–1,23 m; pasillos A ≥ P/200 ≥ 1,00 m (0,80 m para ≤ 10 habituales); escaleras no protegidas P/160 y P/(160−10h); protegidas E ≤ 3S + 160A_S; pasillos protegidos P ≤ 3S + 200A; aire libre P/600 y P/480; puerta de salida de escalera protegida ≥ 80 % (nota 1); desembarco 160·A (ap. 4.1.3).
- **Tabla 4.2** completa, con su nota (1).
- **Tabla 5.1** completa, con sus notas (1) y (2).
- **Escalera protegida**: EI 120, 2 accesos por planta con EI₂ 60-C5, 15 m en planta de salida, 1 m² de ventilación por planta o conductos de 50 cm²/m³. **Vestíbulo de independencia**: EI 120, puertas EI₂ 30-C5 mínimo, 0,50 m entre barridos. **Escalera abierta al exterior**: 5·A m² por planta (Anejo SI A).
- **Espacio exterior seguro**: 0,5·P m² en radio 0,1·P m; sin comprobar con P ≤ 50 (Anejo SI A).
- **Puertas** (ap. 6): abatibles de eje vertical si son salida de planta o de edificio o para > 50 personas; sentido de evacuación > 200 en Residencial Vivienda, > 100 en otros casos, o > 50 del recinto; UNE-EN 179:2009 / UNE-EN 1125:2009; 220 N, 150 N, 25 N, 65 N; UNE 85121:2018.
- **Señalización** (ap. 7): UNE 23034:1988; excepción del rótulo «SALIDA» en Residencial Vivienda; > 100 personas para la flecha frente a la salida lateral; fotoluminiscentes UNE 23035-1, -2 y -4:2003, mantenimiento UNE 23035-3:2003.
- **Control de humo** (ap. 8): aparcamiento no abierto; 1/20, 1/40 y 0,5 m (Anejo); 150 / 120 l/plaza·s; E₃₀₀ 60, F₃₀₀ 60, EI 60; plantas > 4 m; UNE 23584:2008, UNE 23585:2017, UNE-EN 12101-6:2006.
- **Discapacidad** (ap. 9): 28 m viviendas, 14 m administrativo, 1.500 m² planta de aparcamiento; 1 plaza por cada 100 (silla de ruedas) y por cada 33 (otra movilidad, salvo viviendas); 1,20 × 0,80 m, 0,80 × 0,60 m, Ø 1,50 m (Anejo).
- **Comentarios del Ministerio** (siempre rotulados «comentario, no reglamentario»): 2,80 m de la escalera del garaje; 0,78 m de paso con la hoja abierta; 0,80 m de pasos peatonales en garaje; 16 % de rampa; 3,00 m para escalera sin control de humo; origen en plaza de aparcamiento.

## Cifras que NO deben mostrarse

- **Hoja de puerta ≤ 1,20 m.** Es **1,23 m** (B4.2.3).
- **«Anchura mínima de escalera 1,00 m (DB-SI)»** o cualquier mínima de escalera atribuida al DB-SI. Remite al DB SUA (no leído).
- **Recorrido medido solo hasta la escalera no protegida** como si fuera salida de planta (B3.17–B3.18).
- **35 m por «ocupantes que duermen» en viviendas como exigencia del DB.** Es criterio (B3.9).
- **15 m²/persona para el garaje de un edificio de viviendas.** Es 40, salvo que el garaje sirva a una actividad con horario.
- **40 m²/persona («Archivos, almacenes») para trasteros de viviendas.** Son ocupación nula.
- **Una densidad «del DB» para el local sin uso.** No existe; se muestra la del uso asimilado, rotulada.
- **Ocupación de la vivienda unifamiliar como dato de evacuación.** No hay origen de evacuación en su interior; se puede mostrar como dato, sin consecuencia en SI 3.
- **Escalera protegida «suficiente» para el garaje.** Aparcamiento: no protegida y protegida «No se admite».
- **Ventiladores F₄₀₀ 90 o compuertas y conductos de clases distintas de E₃₀₀ 60 / F₃₀₀ 60 / EI 60 para el garaje.** La F₄₀₀ 90 de [SI25] p. 16 es de cocinas (SI 1).
- **«2 redes de extracción» o «una abertura por 100 m²» citadas como SI 3.** Son de HS 3.
- **200 N** como fuerza máxima de las automáticas correderas (sale de un comentario; el articulado dice 220 N).
- **La columna «ascendente» de la tabla 4.2 como capacidad para cualquier h.** Supone h = 2,80 m (B4.3.4).
- **Capacidades de la tabla 4.2 para escaleras protegidas** que no sean de doble tramo, anchura constante y mesetas estrictas (nota (1)).
- **Zona de refugio o «sector alternativo» en viviendas de ≤ 28 m** como exigencia.
- **Un «CUMPLE» del recorrido sin medición** del proyectista (criterio C1).

---

## Criterios de proyecto (no son CTE: la ficha debe rotularlos así)

| # | Situación | Criterio propuesto | Por qué |
|---|---|---|---|
| C1 | El proyectista **no ha medido** el recorrido más largo | Veredicto **«pendiente de medir»**, nunca CUMPLE. Mostrar el límite que aplica (25 / 35 / 50 m), **desde dónde** (puerta de la vivienda más alejada; en el garaje, el punto ocupable más alejado) y **hasta dónde** (salida de planta; con escalera no protegida, la salida del edificio). No estimar una longitud a partir de las alturas | El DB pide medir; la herramienta no modela la planta |
| C2 | **Tipo de escalera** de las viviendas | Decisión obligatoria con «lo habitual» precargado según la tabla 5.1: h ≤ 14 m → no protegida; 14 < h ≤ 28 m → protegida; > 28 m → especialmente protegida (y dos escaleras). Si elige «no protegida», recordar que el recorrido llega hasta el portal (B3.18); ofrecer «compartimentada» o «protegida» como alternativas | Tabla 5.1; Anejo «Salida de planta» |
| C3 | Escalera del garaje | Siempre **especialmente protegida** (vestíbulo de independencia en cada acceso desde el garaje). Si salva ≤ 2,80 m, aviso del comentario (peldaños, pero vestíbulo igualmente) | Tabla 5.1; [DccSI] p. 48 |
| C4 | Anchuras habituales | Escalera: **1,00 m** como valor por defecto **a confirmar con el DB SUA 1, tabla 4.1** (rotulado «pendiente de comprobar contra DB SUA»). Puerta del portal: **≥ 0,80 m** de paso libre, una hoja ≤ 1,23 m. Puertas de paso en zonas comunes: ≥ 0,80 m. Pasillos y rellanos comunes: ≥ 1,00 m (el DB SUA puede pedir más en itinerario accesible: pendiente) | Tabla 4.1; nota (9) |
| C5 | Redondeo de la ocupación | Por exceso, zona a zona (como hace hoy `deducciones.ts`) | El DB no fija el redondeo; por exceso es del lado de la seguridad |
| C6 | Local sin uso en PB | Asimilado a **Comercial**: salidas propias (sin evacuar por el portal), 2 m²/persona en PB, escalera (si la tuviera) con límites de 10/20 m. Aviso «se justificará en el proyecto de la actividad» | ap. 1 y ap. 2.1; B1.5 |
| C7 | Simultaneidad garaje + viviendas | Sumar los ocupantes del garaje a los de las viviendas en la salida del edificio | ap. 2.2 lo deja al proyectista; sumar es del lado de la seguridad |
| C8 | Garaje en edificio mixto (viviendas + oficinas) | Preguntar si sirve a las oficinas; si sí, **15** m²/persona; si no, 40 | Tabla 2.1; hoy `deducciones.ts` decide por `tipo` del edificio |
| C9 | Más de una salida en Residencial Vivienda | **35 m** (lado de la seguridad), rotulado | B3.9 |
| C10 | Cubierta transitable | Preguntar si es **comunitaria y de uso** (tendedero, solárium): sus puntos son ocupables → **origen de evacuación** → su cota cuenta para la altura de evacuación (puede pasar la escalera de no protegida a protegida). Si es privativa de un ático (interior de vivienda) o solo de mantenimiento, no cuenta | Anejo «Origen de evacuación» y «Altura de evacuación» (INTERPRETACIÓN) |
| C11 | Superficie construida del garaje desconocida | Útil > 100 m² ⇒ construida > 100 m² ⇒ uso Aparcamiento seguro. Útil ≤ 100 m²: preguntar; sin respuesta, tratar como Aparcamiento (más exigente) con aviso | Anejo «Uso Aparcamiento»; SI 1 tabla 1.1 nota (2) |
| C12 | Detección que activa el control de humo | Detección de incendios, rotulada criterio | B8.14 |
| C13 | Puertas del garaje | Umbral de 100 personas (no 200) para el sentido de apertura | B6.5 |
| C14 | Regla de los 500 en edificio con viviendas y oficinas | Aplicar 500 solo a la salida del edificio cuando el uso principal es Residencial Vivienda y las oficinas no son sector propio; en las plantas de oficinas, 100 por planta | Tabla 3.1 y nota (3) (INTERPRETACIÓN) |
| C15 | Longitud por escaleras | Verdadera magnitud sobre el eje del tramo | B3.19 |
| C16 | Constancia de usos característicos | Frase fija en la ficha: «Las ocupaciones y usos previstos son únicamente los característicos de la actividad (SI 3, tabla 2.1, nota 1). Debe constar también en el Libro del edificio.» | Tabla 2.1, nota (1) |
| C17 | Altura de evacuación ascendente de los sótanos | Desde el suelo del sótano más bajo **que tenga zonas** (incluidas las de ocupación nula, según el comentario de [DccSI] p. 84) hasta la salida del edificio | Anejo; [DccSI] p. 84 (comentario) |

---

## Pendientes

1. **DB SUA 1, ap. 4.2.2, tabla 4.1** (anchura mínima de escaleras) y **DB SUA 9** (anchura de itinerarios accesibles, salida accesible). Descargar el PDF oficial y transcribir en imagen. Hasta entonces, el 1,00 m de escalera es criterio (C4).
2. **RD 164/2025 (BOE 10-04-2025)**: qué líneas de SI 3 y del Anejo cambió. Indicio: fila Aparcamiento de la tabla 2.1 y definición de uso Aparcamiento ([DccSI] p. 81).
3. **Otros agentes (SI 1, SI 4)**: resistencia exigible para que una escalera sea «compartimentada como los sectores de incendio» (SI 1, tabla 1.2); clasificación de trasteros y del garaje de la unifamiliar como locales de riesgo especial (SI 1, tabla 2.1; aquí solo leído en texto: trasteros 50 < S ≤ 100, 100 < S ≤ 500, S > 500 m²); detección en aparcamientos > 500 m² (SI 4, tabla 1.1, leído solo en texto).
4. **Interpretaciones que el responsable del proyecto debe validar**:
   - escalera no protegida ≠ salida de planta: el recorrido llega al portal (B3.18);
   - 35 m en viviendas con más de una salida (B3.9, C9);
   - cubierta transitable comunitaria como origen de evacuación (C10);
   - umbral de 100 en puertas del garaje (B6.5, C13);
   - detección de incendios para activar el control de humo, también en garajes ≤ 500 m² (B8.14);
   - regla de los 500 en edificios mixtos (C14);
   - superficie (útil o construida) de los 1.500 m² del ap. 9 (B9.3).
5. **[DccSI] en imagen**: solo se han visto pp. 41, 48 y 50. El resto de comentarios se ha identificado por comparación de texto con [SI25] (método fiable: el articulado coincide palabra por palabra).

---

## Edición y forma de citar

| # | Afirmación | Veredicto | Valor | Fuente |
|---|---|---|---|---|
| E1 | Texto vigente | VERIFICADO | DB-SI consolidado «4 marzo 2025». Recoge RD 314/2006, RD 1371/2007, corrección de 2008, VIV/984/2009, RD 173/2010, STS de 4-5-2010, RD 732/2019 y RD 164/2025 (BOE 10-04-2025) | [SI25] p. 2 |
| E2 | Valor jurídico | VERIFICADO | «Este texto consolidado no tiene valor jurídico.» El valor lo tienen las disposiciones del BOE | [SI25] p. 2 |
| E3 | Comentarios | VERIFICADO | Versión de comentarios de 4-mar-2025; «carácter orientativo e informativo no teniendo carácter reglamentario» | [DccSI] pp. 1–2 |
| E4 | Cómo citar en la ficha | CRITERIO (forma) | «CTE DB-SI, Sección SI 3 "Evacuación de ocupantes", texto consolidado de 4-mar-2025 (codigotecnico.org), ap. … / tabla …». Para el Anejo: «DB-SI, Anejo SI A, definición de "…"». Para los comentarios: «Comentario del Ministerio al DB-SI (4-mar-2025), no reglamentario». Procedencia en código: la misma `PROC_SI` de `src/lib/edificio/tablas.ts` (`edicion: "consolidado 4-mar-2025 (RD 164/2025)"`, `fecha: "2025-03-04"`) | — |

### Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Densidades | DB-SI | consolidado 4-mar-2025 (RD 164/2025) | 2025-03-04 | SI 3, ap. 2.1 | Tabla 2.1 | codigotecnico.org · DBSI.pdf |
| Salidas y recorridos | ídem | ídem | 2025-03-04 | SI 3, ap. 3 | Tabla 3.1 | ídem |
| Alturas ascendentes máximas | ídem | ídem | 2025-03-04 | Anejo SI A, «Recorrido de evacuación» | — | ídem |
| Dimensionado | ídem | ídem | 2025-03-04 | SI 3, ap. 4.2 | Tabla 4.1 | ídem |
| Capacidad de escaleras | ídem | ídem | 2025-03-04 | SI 3, ap. 4.2 | Tabla 4.2 | ídem |
| Protección de escaleras | ídem | ídem | 2025-03-04 | SI 3, ap. 5 | Tabla 5.1 | ídem |
| Puertas | ídem | ídem | 2025-03-04 | SI 3, ap. 6 | — | ídem |
| Señalización | ídem | ídem | 2025-03-04 | SI 3, ap. 7 | — | ídem |
| Control de humo | ídem | ídem | 2025-03-04 | SI 3, ap. 8; Anejo SI A «Aparcamiento abierto» | — | ídem |
| Discapacidad | ídem | ídem | 2025-03-04 | SI 3, ap. 9; Anejo SI A «Zona de refugio» | — | ídem |

---

## Para el código

### Observaciones sobre lo que ya existe

| # | Fichero | Hoy | Propuesta | Motivo |
|---|---|---|---|---|
| R1 | `lib/edificio/tablas.ts`, `DENSIDADES_SI3` | 20 / 10 / 2 / 15 / 40 | **Correcto** (releído en imagen, p. 23). El módulo SI3 debe **reutilizarla**, no duplicarla. Si hace falta, añadir `aseosPlanta: 3`, `archivosAlmacenes: 40`, `comercialVentasSotanoBajaEntreplanta: 2`, `comercialVentasOtrasPlantas: 3` (pp. 22–24, imagen) | B2 |
| R2 | `lib/edificio/derivar.ts`, `alturaEvacuacion_m` | Cota de la última planta sobre rasante que no sea solo de ocupación nula | **Correcto** según el Anejo y el comentario de p. 84. Añadir aviso de cubierta transitable comunitaria (C10). Las plantas altas de un dúplex (interior de vivienda) no son origen: no se modelan; basta un aviso | B3.13; C10 |
| R3 | ídem | No hay altura ascendente | Añadir `alturaEvacuacionAscendente_m` = profundidad del suelo del sótano más bajo con zonas (C17). La necesitan la tabla 3.1 (≤ 10 m con una salida), la tabla 4.1 (160 − 10h) y la tabla 5.1 (tramos de 2,80 y 6,00 m para «otro uso») | B3.6; C17 |
| R4 | `lib/edificio/deducciones.ts`, garaje | 15 si `tipo === "oficinas"`, si no 40 | Correcto en edificios de un solo uso. En mixtos, preguntar (C8) | C8 |
| R5 | ídem, `vivienda_unifamiliar` | Muestra «Ocupación · SI 3, 20 m²/persona» | Dato correcto, pero sin efecto en SI 3. Añadir «sin origen de evacuación en el interior (Anejo SI A)» | B3.13; B5.11 |
| R6 | ídem, trasteros en edificio sin viviendas | Sin línea de SI | «Archivos, almacenes: 40» u «ocupación nula (determinados almacenes)», a decidir (criterio). Caso marginal | B2.9 |
| R7 | `lib/edificio/usos.ts`, `trasteros` | SI con `trato: "no"` | Cambiar a `"otra"`: no aportan ocupación, pero si la zona pasa de 50 m² sus puntos son origen de evacuación y SI 1 los puede clasificar como riesgo especial | B2.12 |
| R8 | ídem, `garaje_privado` | Sin línea de SI | Añadir: «no es uso Aparcamiento; recorrido ≤ 25 m hasta su salida; no puede ser la única salida de la vivienda» | B10.3–B10.4 |
| R9 | ídem, `zona_comun` | «recorrido de evacuación» | Correcto. Sin ocupación propia (B2.11) | B2.11 |

### Datos propuestos para `src/modules/si3/tablas.ts`

Sigue el patrón `tablaCTE(procedencia, datos)` de `src/lib/cte/tabla.ts`. **No está aplicado.** Todos los valores salen de la imagen de [SI25] y coinciden con el texto extraído de [SI25] y de [DccSI]. Convenciones: `null` = «No se admite»; `"todo_caso"` = «Se admite en todo caso»; los límites son **inclusivos** («no excede de X» → `≤ X`) salvo donde se indica «estricto» («mayor que» → `>`). Los criterios de proyecto van al final, **fuera** de `tablaCTE`, para que la ficha no los cite como CTE.

```ts
import { tablaCTE } from "../../lib/cte/tabla";

/** SI 3 vigente: DB-SI consolidado 4-mar-2025 (RD 732/2019 y RD 164/2025). Misma edición que
 *  `PROC_SI` de src/lib/edificio/tablas.ts, para que la ficha cite una sola. */
const PROC_SI3 = {
  db: "DB-SI",
  edicion: "consolidado 4-mar-2025 (RD 164/2025)",
  fecha: "2025-03-04",
  fuente: "codigotecnico.org · DBSI.pdf, Sección SI 3 y Anejo SI A (cotejado en imagen)",
} as const;

// ---- Tabla 3.1 -------------------------------------------------------------------

/**
 * SI 3, ap. 3, Tabla 3.1 (pp. 24–25). Una planta o recinto puede tener UNA salida si cumple
 * TODAS las condiciones de `unaSalida`. Si no, más de una y las de `variasSalidas`
 * (comentario «Aplicación de la tabla 3.1», DccSI p. 39).
 */
export const SALIDAS_RECORRIDOS_TABLA_3_1 = tablaCTE(
  { ...PROC_SI3, articulo: "SI 3, ap. 3", tabla: "Tabla 3.1" },
  {
    unaSalida: {
      ocupacion: {
        /** «La ocupación no excede de 100 personas» (de la planta o recinto). */
        max: 100,
        /** «500 personas en el conjunto del edificio, en el caso de salida de un edificio de viviendas». */
        maxSalidaEdificioViviendas: 500,
        /** «50 personas en zonas desde las que la evacuación hasta una salida de planta deba salvar
         *  una altura mayor que 2 m en sentido ascendente». Umbral de altura ESTRICTO (> 2 m). */
        maxZonasConSubidaHastaSalidaDePlanta: 50,
        subidaUmbral_m: 2,
        /** «50 alumnos en escuelas infantiles, o de enseñanza primaria o secundaria». Fuera del alcance. */
        maxAlumnos: 50,
      },
      recorrido: {
        /** «… hasta una salida de planta no excede de 25 m». */
        max_m: 25,
        /** «35 m en uso Aparcamiento». */
        maxAparcamiento_m: 35,
        /** «50 m si se trata de una planta, incluso de uso Aparcamiento, que tiene una salida directa al
         *  espacio exterior seguro y la ocupación no excede de 25 personas». La salida debe estar en la
         *  propia planta (comentario, DccSI p. 40). */
        maxSalidaDirectaEES_m: 50,
        ocupacionMaxSalidaDirectaEES: 25,
        /** «… o bien de un espacio al aire libre en el que el riesgo de incendio sea irrelevante». */
        maxAireLibre_m: 50,
      },
      /** «La altura de evacuación descendente de la planta considerada no excede de 28 m» (Residencial
       *  Público: otra regla, nota 2, fuera del alcance) «o de 10 m cuando la evacuación sea ascendente». */
      alturaDescendenteMax_m: 28,
      alturaAscendenteMax_m: 10,
      /** «No se admite en: uso Hospitalario …» (> 90 m² construidos). Fuera del alcance. */
      hospitalarioSalasMax_m2: 90,
    },
    variasSalidas: {
      recorrido: {
        /** «… hasta alguna salida de planta no excede de 50 m». */
        max_m: 50,
        /** «35 m en zonas en las que se prevea la presencia de ocupantes que duermen, o en plantas de
         *  hospitalización … y en plantas de escuela infantil o de enseñanza primaria».
         *  ¿Residencial Vivienda? El DB no lo concreta: ver CRITERIOS_SI3.residencialViviendaDuermen. */
        maxOcupantesDuermen_m: 35,
        /** «75 m en espacios al aire libre en los que el riesgo … sea irrelevante». */
        maxAireLibre_m: 75,
      },
      /** Hasta el punto con dos recorridos alternativos: «la longitud máxima admisible cuando se dispone
       *  de una sola salida» (15 m en hospitalización, fuera del alcance). */
      tramoUnicoIgualQueUnaSalida: true,
      tramoUnicoHospitalario_m: 15,
      /** «… al menos dos salidas de planta conducen a dos escaleras diferentes» si la altura descendente
       *  obliga a más de una salida (> 28 m) o si más de 50 personas suben más de 2 m (ambos ESTRICTOS). */
      dosEscaleras: { personasAscendentesMasDe: 50, subidaMasDe_m: 2 },
    },
    notas: {
      /** (1) «… se puede aumentar un 25% cuando se trate de sectores de incendio protegidos con una
       *  instalación automática de extinción». Alcanza a cualquier recorrido regulado (DccSI p. 39). */
      factorExtincionAutomatica: 1.25,
      /** (3) Planta de salida: más de una salida en Residencial Vivienda si la ocupación TOTAL > 500;
       *  en el resto, si lo exige su propia ocupación o recorrido, o si hay más de una escalera. */
      viviendasMasDeUnaSalidaEdificioSiOcupacionTotalMasDe: 500,
    },
  } as const,
);

/** Anejo SI A, «Recorrido de evacuación» (p. 47): máxima altura salvada en sentido ascendente.
 *  No se aplica a aparcamientos, zonas de ocupación nula ni zonas solo de mantenimiento o control. */
export const ALTURA_ASCENDENTE_MAX_ANEJO_A = tablaCTE(
  { ...PROC_SI3, articulo: "Anejo SI A, «Recorrido de evacuación»" },
  {
    general: { hastaSalidaDePlanta_m: 4, hastaEES_m: 6 },
    hospitalizacionODocenteInfantilPrimaria: { hastaSalidaDePlanta_m: 1, hastaEES_m: 2 }, // fuera del alcance
  } as const,
);

/** Evaluación de la longitud máxima con UNA salida (tabla 3.1 + nota 1). PROPUESTA. */
export function recorridoMaxUnaSalida_m(c: {
  usoAparcamiento: boolean;
  /** Salida directa al EES en la propia planta y ocupación de la planta ≤ 25. */
  salidaDirectaEESConPocosOcupantes: boolean;
  aireLibreRiesgoIrrelevante: boolean;
  extincionAutomatica: boolean;
}): number {
  const t = SALIDAS_RECORRIDOS_TABLA_3_1.datos;
  let max = c.usoAparcamiento ? t.unaSalida.recorrido.maxAparcamiento_m : t.unaSalida.recorrido.max_m;
  if (c.salidaDirectaEESConPocosOcupantes || c.aireLibreRiesgoIrrelevante) {
    max = Math.max(max, t.unaSalida.recorrido.maxSalidaDirectaEES_m);
  }
  return c.extincionAutomatica ? max * t.notas.factorExtincionAutomatica : max;
}

// ---- Tabla 4.1 -------------------------------------------------------------------

/** SI 3, ap. 4.2, Tabla 4.1 (p. 26) y notas (p. 27). A en m; P en personas. */
export const DIMENSIONADO_TABLA_4_1 = tablaCTE(
  { ...PROC_SI3, articulo: "SI 3, ap. 4.2", tabla: "Tabla 4.1" },
  {
    /** A ≥ P/200 ≥ 0,80 m; 0,60 ≤ hoja ≤ 1,23 m. */
    puertasYPasos: { personasPorMetro: 200, anchuraMin_m: 0.8, hojaMin_m: 0.6, hojaMax_m: 1.23 },
    /** A ≥ P/200 ≥ 1,00 m; nota (5): 0,80 m si son ≤ 10 personas usuarios habituales. */
    pasillosYRampas: { personasPorMetro: 200, anchuraMin_m: 1.0, anchuraMinHabituales_m: 0.8, habitualesMax: 10 },
    /** Descendente A ≥ P/160; ascendente A ≥ P/(160 − 10·h), h = altura ascendente [m].
     *  Mínima: nota (9) → DB SUA 1-4.2.2, tabla 4.1 (NO leída). */
    escalerasNoProtegidas: { descendentePersonasPorMetro: 160, ascendenteBase: 160, ascendentePorMetroDeAltura: 10 },
    /** E ≤ 3·S + 160·A_S (S: superficie útil de la escalera en las plantas servidas; A_S: anchura en el
     *  desembarco en la planta de salida). Mínima: nota (9). */
    escalerasProtegidas: { personasPorM2: 3, personasPorMetroDesembarco: 160 },
    /** P ≤ 3·S + 200·A. */
    pasillosProtegidos: { personasPorM2: 3, personasPorMetro: 200 },
    /** Al aire libre: pasos, pasillos y rampas A ≥ P/600; escaleras A ≥ P/480 (nota 10). */
    aireLibre: { pasosPersonasPorMetro: 600, escalerasPersonasPorMetro: 480 },
    /** ap. 4.1 pto 3: flujo de la escalera en la planta de desembarco = min(160·A, personas que la usan). */
    desembarcoPersonasPorMetro: 160,
    notas: {
      /** (1) Puerta de salida del recinto de escalera protegida a la planta de salida ≥ 80 % de la
       *  anchura de cálculo de la escalera. */
      puertaSalidaEscaleraProtegidaFraccion: 0.8,
      /** (9) Literal. La cifra está en el DB SUA (pendiente). */
      anchuraMinimaEscaleras: "La anchura mínima es la que se establece en DB SUA 1-4.2.2, tabla 4.1.",
    },
  } as const,
);

// ---- Tabla 4.2 -------------------------------------------------------------------

/** SI 3, ap. 4.2, Tabla 4.2 (p. 27). Número de ocupantes que pueden utilizar la escalera.
 *  `protegida`: [2, 4, 6, 8, 10 plantas]; `masPorPlanta`: «cada planta más».
 *  Nota (1): solo escaleras de doble tramo, anchura constante y rellanos y mesetas estrictos;
 *  si no, fórmula de la tabla 4.1 con la S real. Nota (2): no protegida ascendente > 2,80 m → P ≤ 100.
 *  Propiedad exacta en las 75 casillas: noProtDesc = 160·A; noProtAsc = ⌊132·A⌋ (h = 2,80 m);
 *  protegida(n) = 160·A + n·masPorPlanta. */
export const CAPACIDAD_ESCALERAS_TABLA_4_2 = tablaCTE(
  { ...PROC_SI3, articulo: "SI 3, ap. 4.2", tabla: "Tabla 4.2" },
  {
    filas: [
      { A_m: 1.0, noProtAsc: 132, noProtDesc: 160, protegida: [224, 288, 352, 416, 480], masPorPlanta: 32 },
      { A_m: 1.1, noProtAsc: 145, noProtDesc: 176, protegida: [248, 320, 392, 464, 536], masPorPlanta: 36 },
      { A_m: 1.2, noProtAsc: 158, noProtDesc: 192, protegida: [274, 356, 438, 520, 602], masPorPlanta: 41 },
      { A_m: 1.3, noProtAsc: 171, noProtDesc: 208, protegida: [302, 396, 490, 584, 678], masPorPlanta: 47 },
      { A_m: 1.4, noProtAsc: 184, noProtDesc: 224, protegida: [328, 432, 536, 640, 744], masPorPlanta: 52 },
      { A_m: 1.5, noProtAsc: 198, noProtDesc: 240, protegida: [356, 472, 588, 704, 820], masPorPlanta: 58 },
      { A_m: 1.6, noProtAsc: 211, noProtDesc: 256, protegida: [384, 512, 640, 768, 896], masPorPlanta: 64 },
      { A_m: 1.7, noProtAsc: 224, noProtDesc: 272, protegida: [414, 556, 698, 840, 982], masPorPlanta: 71 },
      { A_m: 1.8, noProtAsc: 237, noProtDesc: 288, protegida: [442, 596, 750, 904, 1058], masPorPlanta: 77 },
      { A_m: 1.9, noProtAsc: 250, noProtDesc: 304, protegida: [472, 640, 808, 976, 1144], masPorPlanta: 84 },
      { A_m: 2.0, noProtAsc: 264, noProtDesc: 320, protegida: [504, 688, 872, 1056, 1240], masPorPlanta: 92 },
      { A_m: 2.1, noProtAsc: 277, noProtDesc: 336, protegida: [534, 732, 930, 1128, 1326], masPorPlanta: 99 },
      { A_m: 2.2, noProtAsc: 290, noProtDesc: 352, protegida: [566, 780, 994, 1208, 1422], masPorPlanta: 107 },
      { A_m: 2.3, noProtAsc: 303, noProtDesc: 368, protegida: [598, 828, 1058, 1288, 1518], masPorPlanta: 115 },
      { A_m: 2.4, noProtAsc: 316, noProtDesc: 384, protegida: [630, 876, 1122, 1368, 1614], masPorPlanta: 123 },
    ],
    plantasColumnas: [2, 4, 6, 8, 10],
  } as const,
);

// ---- Tabla 5.1 -------------------------------------------------------------------

/** "todo_caso" = «Se admite en todo caso»; null = «No se admite»; número = h ≤ valor [m];
 *  { pMax } = «P ≤ 100 personas». h = altura de evacuación DE LA ESCALERA. */
type Admision = "todo_caso" | null | number | "baja_mas_una" | { pMax: number };

export const PROTECCION_ESCALERAS_TABLA_5_1 = tablaCTE(
  { ...PROC_SI3, articulo: "SI 3, ap. 5", tabla: "Tabla 5.1" },
  {
    descendente: {
      residencial_vivienda: { noProtegida: 14, protegida: 28, especialmenteProtegida: "todo_caso" },
      administrativo: { noProtegida: 14, protegida: 28, especialmenteProtegida: "todo_caso" },
      docente: { noProtegida: 14, protegida: 28, especialmenteProtegida: "todo_caso" },
      comercial: { noProtegida: 10, protegida: 20, especialmenteProtegida: "todo_caso" },
      publica_concurrencia: { noProtegida: 10, protegida: 20, especialmenteProtegida: "todo_caso" },
      /** Nota (3): < 20 plazas, detección y alarma como alternativa a la protegida. */
      residencial_publico: { noProtegida: "baja_mas_una", protegida: 28, especialmenteProtegida: "todo_caso" },
      hospitalario_hospitalizacion: { noProtegida: null, protegida: 14, especialmenteProtegida: "todo_caso" },
      hospitalario_otras: { noProtegida: 10, protegida: 20, especialmenteProtegida: "todo_caso" },
      aparcamiento: { noProtegida: null, protegida: null, especialmenteProtegida: "todo_caso" },
    },
    ascendente: {
      aparcamiento: { noProtegida: null, protegida: null, especialmenteProtegida: "todo_caso" },
      /** «Otro uso», por tramos: h ≤ 2,80 · 2,80 < h ≤ 6,00 · h > 6,00 (hMax_m null = sin límite). */
      otroUso: [
        { hMax_m: 2.8, noProtegida: "todo_caso", protegida: "todo_caso", especialmenteProtegida: "todo_caso" },
        { hMax_m: 6.0, noProtegida: { pMax: 100 }, protegida: "todo_caso", especialmenteProtegida: "todo_caso" },
        { hMax_m: null, noProtegida: null, protegida: "todo_caso", especialmenteProtegida: "todo_caso" },
      ],
    },
    notas: {
      /** (1) Cada escalera cumple en sus plantas lo más restrictivo de los sectores con los que comunica.
       *  Establecimiento en edificio de viviendas que no es sector propio → condiciones de vivienda. */
      masRestrictivaDeLosSectores: true,
      /** (2) Entre sectores, dentro de la h de no protegida: basta compartimentarla. */
      entreSectoresBastaCompartimentarDentroDeHNoProtegida: true,
    },
  } as const satisfies {
    descendente: Record<string, Record<"noProtegida" | "protegida" | "especialmenteProtegida", Admision>>;
    ascendente: unknown;
    notas: unknown;
  },
);

/** Comentario (no reglamentario), DccSI p. 48: escalera común sótano–portal especialmente protegida
 *  «siempre que salve más de 2,80 m de altura». Fuera de tablaCTE: no es articulado. */
export const COMENTARIO_ESCALERA_GARAJE_PELDANOS_m = 2.8;

// ---- Ap. 6 a 9 y definiciones del Anejo ------------------------------------------

export const PUERTAS_SI3_6 = tablaCTE(
  { ...PROC_SI3, articulo: "SI 3, ap. 6" },
  {
    /** pto 1: abatibles de eje vertical si son salida de planta o de edificio, o para > 50 personas. */
    abatibleSiPersonasMasDe: 50,
    /** pto 3: abren en el sentido de la evacuación si el paso previsto es > 200 (edificios de uso
     *  Residencial Vivienda) o > 100 (demás casos), o si son > 50 los ocupantes del recinto. */
    sentidoEvacuacion: { pasoMasDe_ResidencialVivienda: 200, pasoMasDe_otros: 100, ocupantesRecintoMasDe: 50 },
    normas: { manillaOPulsador: "UNE-EN 179:2009", barra: "UNE-EN 1125:2009", mantenimientoAutomaticas: "UNE 85121:2018" },
    /** ptos 4 y 5 [N]; altura de aplicación 1000 ± 10 mm. */
    fuerzas_N: {
      giratoriaAbatimiento: 220,
      automaticaCorrederaOPlegable: 220,
      automaticaAbatible: 150,
      automaticaAbatibleItinerarioAccesible: 25,
      automaticaAbatibleItinerarioAccesibleResistenteFuego: 65,
    },
    alturaAplicacionFuerza_mm: 1000,
  } as const,
);

export const SENALIZACION_SI3_7 = tablaCTE(
  { ...PROC_SI3, articulo: "SI 3, ap. 7" },
  {
    normaSenales: "UNE 23034:1988",
    /** pto 1 a): sin rótulo «SALIDA» en edificios de uso Residencial Vivienda; en otros usos, en
     *  recintos ≤ 50 m², visibles desde todo punto y con ocupantes familiarizados. */
    excepcionSalidaResidencialVivienda: true,
    excepcionSalidaRecintoMax_m2: 50,
    /** pto 1 c): flecha frente a la salida lateral de un recinto de > 100 personas. */
    flechaSalidaLateralRecintoMasDe: 100,
    fotoluminiscentes: ["UNE 23035-1:2003", "UNE 23035-2:2003", "UNE 23035-4:2003"],
    mantenimientoFotoluminiscentes: "UNE 23035-3:2003",
  } as const,
);

export const CONTROL_HUMO_SI3_8 = tablaCTE(
  { ...PROC_SI3, articulo: "SI 3, ap. 8; Anejo SI A «Aparcamiento abierto»" },
  {
    /** Anejo: abierto si en cada planta el área permanentemente abierta ≥ 1/20 de la construida, de la
     *  que ≥ 1/40 repartida entre las dos paredes opuestas más próximas, y borde superior ≤ 0,5 m del techo. */
    aparcamientoAbierto: { fraccionAbiertaMin: 1 / 20, fraccionParedesOpuestasMin: 1 / 40, bordeSuperiorATechoMax_m: 0.5 },
    normas: ["UNE 23584:2008", "UNE 23585:2017", "UNE-EN 12101-6:2006"],
    /** pto 2: ventilación de HS 3 válida; si es MECÁNICA, además: */
    mecanicaHS3: {
      extraccion_l_s_plaza: 150,
      aportacionMax_l_s_plaza: 120,
      activacionAutomaticaPorDeteccion: true,
      compuertasSiAlturaPlantaMasDe_m: 4, // ESTRICTO: «exceda de 4 m»
      claseCompuertas: "E300 60",
      claseVentiladores: "F300 60",
      claseConductosUnSector: "E300 60",
      claseConductosEntreSectores: "EI 60",
    },
  } as const,
);

export const DISCAPACIDAD_SI3_9 = tablaCTE(
  { ...PROC_SI3, articulo: "SI 3, ap. 9; Anejo SI A «Zona de refugio»" },
  {
    /** Umbrales ESTRICTOS («superior a», «exceda de»). */
    alturaEvacuacionMasDe_m: { residencialVivienda: 28, administrativo: 14, residencialPublico: 14, docente: 14, comercial: 10, publicaConcurrencia: 10 },
    plantaAparcamientoSuperficieMasDe_m2: 1500,
    plazas: { sillaRuedasPorCadaOcupantes: 100, otraMovilidadPorCadaOcupantes: 33 /* no en Residencial Vivienda */ },
    zonaRefugio: { sillaRuedas_m: [1.2, 0.8], otraMovilidad_m: [0.8, 0.6], circuloLibre_m: 1.5 },
  } as const,
);

export const DEFINICIONES_ANEJO_SI_A = tablaCTE(
  { ...PROC_SI3, articulo: "Anejo SI A" },
  {
    /** «Uso Aparcamiento»: superficie construida > 100 m²; excluidos los garajes de vivienda unifamiliar. */
    usoAparcamientoSuperficieConstruidaMasDe_m2: 100,
    /** «Origen de evacuación»: excluidos el interior de las viviendas y los recintos ≤ 50 m² con densidad
     *  ≤ 1 persona/5 m². Ocupación nula y riesgo especial > 50 m²: sí son origen. */
    origenExcluyeRecintosHasta_m2: 50,
    origenExcluyeDensidadHasta_m2_persona: 5,
    ocupacionNulaOrigenSiMasDe_m2: 50,
    /** «Escalera protegida»: EI 120; ≤ 2 accesos por planta con EI2 60-C5; 15 m en la planta de salida;
     *  ventilación ≥ 1 m² por planta o conductos de 50 cm² por m³ (rejillas < 1 m y > 1,80 m). */
    escaleraProtegida: { ei: 120, accesosMaxPorPlanta: 2, puertas: "EI2 60-C5", recorridoPlantaSalidaMax_m: 15, ventilacionNatural_m2: 1, conductos_cm2_por_m3: 50 },
    /** «Escalera abierta al exterior»: huecos ≥ 5·A m² por planta. */
    escaleraAbiertaHuecos_m2_por_m_anchura: 5,
    /** «Vestíbulo de independencia»: paredes EI 120; puertas ≥ EI2 30-C5; 0,50 m entre barridos. */
    vestibulo: { paredesEi: 120, puertasMin: "EI2 30-C5", separacionBarridos_m: 0.5 },
    /** «Espacio exterior seguro»: 0,5·P m² en radio 0,1·P m; sin comprobar si P ≤ 50. */
    ees: { m2PorPersona: 0.5, radioMPorPersona: 0.1, sinComprobarHastaP: 50 },
    /** «Salida de edificio»: hasta 500 personas, espacio exterior con dos recorridos alternativos a EES,
     *  uno ≤ 50 m. */
    salidaEdificioAlternativa: { personasMax: 500, recorridoMax_m: 50 },
  } as const,
);

// ---- Criterios de proyecto (NO son CTE; la ficha los rotula «criterio») ----------

export const CRITERIOS_SI3 = {
  /** C9: 35 m con más de una salida en Residencial Vivienda (lado de la seguridad). */
  residencialViviendaDuermen: true,
  /** C4: anchura de escalera por defecto, a confirmar con DB SUA 1, tabla 4.1. */
  anchuraEscaleraPorDefecto_m: 1.0,
  /** C5: ocupación redondeada por exceso, zona a zona. */
  redondeoOcupacion: "ceil" as const,
  /** C6: el local sin uso se asimila a Comercial. */
  localSinUsoAsimilado: "comercial" as const,
  /** C7: ocupantes del garaje simultáneos con los de las viviendas en la salida del edificio. */
  garajeSimultaneoConViviendas: true,
  /** C13: umbral de sentido de apertura en puertas del garaje. */
  puertasGarajeUmbralPaso: 100,
  /** C15: longitud por escaleras en verdadera magnitud sobre el eje. */
  longitudEscaleraVerdaderaMagnitud: true,
} as const;
```

### Caso de prueba propuesto (con cita de cada cifra)

Edificio: PB (portal) + 4 plantas de viviendas a 3,00 m; 2 viviendas de 90 m² útiles por planta; sótano de garaje de 600 m² útiles con 20 plazas; sin extinción automática.
- Altura de evacuación descendente: cota de P4 = 12,00 m (Anejo, «Altura de evacuación»).
- Ocupación por planta: 180 / 20 = **9** (tabla 2.1). Viviendas: 4 × 9 = **36**. Garaje: 600 / 40 = **15** (tabla 2.1, «otros casos»). Total en la salida del edificio (C7): **51 ≤ 500** → una salida del edificio (tabla 3.1; nota 3).
- Escalera de viviendas: h = 12 m ≤ 14 m → **no protegida admitida** (tabla 5.1). Recorrido: **pendiente de medir** desde la puerta de la vivienda de P4 hasta el portal, ≤ 25 m (B3.18, C1). Si no cabe, escalera compartimentada o protegida.
- Garaje: una salida si recorrido ≤ 35 m, 15 ≤ 100 y altura ascendente 3,00 m ≤ 10 m (tabla 3.1). Escalera del garaje **especialmente protegida** (tabla 5.1), salva 3,00 m > 2,80 m (comentario p. 48). Control de humo obligatorio (sótano: no es aparcamiento abierto, ap. 8.1 a). Con 20 plazas ≥ 15: dos redes por HS 3 (no SI 3).
- Anchuras: portal A ≥ 51/200 = 0,26 m → **0,80 m** (tabla 4.1). Escalera de viviendas A ≥ 36/160 = 0,23 m → mínimo del DB SUA (pendiente). Escalera del garaje (ascendente, especialmente protegida): E = 15.
- Puertas: ninguna pasa de 200 (viviendas) ni de 50 en su recinto → sentido de apertura libre (ap. 6.3).
- Señalización: sin rótulo «SALIDA» en zonas de viviendas; flecha en la escalera que baja al garaje desde la PB (ap. 7.1 d); garaje señalizado (criterio, B7.4).
- Ap. 9: no se aplica (12 m ≤ 28 m; garaje 600 m² ≤ 1.500 m²); el 9.3 sí.
