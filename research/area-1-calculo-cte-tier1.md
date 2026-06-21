# Área 1 — Núcleo de cálculo CTE (Tier 1): HS3, HS4, HS5, HE1

Sesión de I+D para app de predimensionado de instalaciones. Afirmaciones discretas y verificables, agrupadas por módulo.

## Contexto de versiones (leer primero)

El CTE se aprobó por RD 314/2006 y se ha modificado varias veces. Para 2026 la situación es:

- **DB-HS (Salubridad)**: la versión vigente incorpora las modificaciones de la **Orden FOM/588/2017** (BOE 23/06/2017) y el **RD 732/2019** (BOE 27/12/2019, BOE-A-2019-18528, que además añadió HS6 protección frente al radón). La **sección HS3 cambió sustancialmente** con FOM/588/2017 (ver A1-01). HS4 y HS5 **no cambiaron** sustancialmente respecto a la versión 2009: sus tablas siguen vigentes.
- **DB-HE (Ahorro de energía)**: la versión vigente es la de **2019** (introducida por RD 732/2019), con texto consolidado publicado por el Ministerio. El PDF oficial usado aquí lleva fecha **"14 Junio 2022"** (texto consolidado).

ADVERTENCIA de uso: no mezclar la tabla 2.1 de HS3-2009 ("Caudales de ventilación mínimos exigidos") con la tabla 2.1 de HS3 vigente ("Caudales mínimos para ventilación de caudal constante en locales habitables"). Son distintas. Las afirmaciones de HS3 abajo usan la versión vigente (post-2017).

---

## HS3 — Ventilación / calidad del aire interior

### [A1-01] Edición vigente de HS3 y cambio respecto a 2009
- **Afirmación:** La versión vigente del DB-HS3 es la modificada por la Orden FOM/588/2017 (consolidada en RD 732/2019). Cambió de forma importante respecto a 2009: introdujo el control por concentración de CO2 (media anual < 900 ppm y acumulado de 1.600 ppm que no supere 500.000 ppm·h) y la distinción entre **ventilación de caudal constante** (tabla 2.1) y **ventilación de caudal variable**. La versión 2009 fijaba caudales por persona/ocupación de forma distinta.
- **Soporte:** alto
- **Fuente(s):** PDF oficial DB-HS3 (assets.aldes.es/.../cte-db-hs3-calidad-del-aire-interior.pdf, texto de la versión vigente con apartados de CO2 y caudal constante/variable); BOE RD 732/2019 (https://www.boe.es/diario_boe/txt.php?id=BOE-A-2019-18528); Soler&Palau y caloryfrio sobre FOM/588/2017.
- **Nota:** El umbral 900 ppm media anual / 500.000 ppm·h acumulado proviene de fuentes secundarias (S&P, caloryfrio) coherentes con el texto; el procedimiento de CO2 figura en el DB. Las cifras de tabla 2.1/2.2 (abajo) se leen directamente del PDF oficial.

### [A1-02] Tabla 2.1 — Caudales mínimos para ventilación de caudal constante en locales habitables (l/s)
- **Afirmación:** Para locales **secos** (dormitorios, salas de estar y comedores) y **húmedos** (cocinas, baños, aseos), según número de dormitorios de la vivienda:
  - **Dormitorio principal:** 8 l/s (en los tres tipos de vivienda).
  - **Resto de dormitorios:** — (0–1 dorm.), 4 l/s (2 dorm.), 4 l/s (3+ dorm.).
  - **Salas de estar y comedores:** 6 l/s (0–1 dorm.), 8 l/s (2 dorm.), 10 l/s (3+ dorm.).
  - **Locales húmedos — mínimo total por vivienda:** 12 l/s (0–1 dorm.), 24 l/s (2 dorm.), 33 l/s (3+ dorm.).
  - **Locales húmedos — mínimo por local:** 6 l/s (0–1 dorm.), 7 l/s (2 dorm.), 8 l/s (3+ dorm.).
- **Soporte:** alto
- **Fuente(s):** DB-HS3 vigente, Tabla 2.1 "Caudales mínimos para ventilación de caudal constante en locales habitables" (PDF oficial, p. 63-64). Leído literal del PDF.
- **Nota:** Notas de la tabla: (1) en locales secos multiuso se toma el caudal del uso mayor; (2) si un local tiene zona seca y húmeda, cada zona se dota de su caudal; (3) "salas de estar y comedores" incluye otros locales de uso similar (salas de juego, despachos).

### [A1-03] Extracción adicional en cocinas (zona de cocción)
- **Afirmación:** En la zona de cocción de las cocinas debe disponerse un sistema, **independiente** de la ventilación general, que permita extraer un caudal mínimo de **50 l/s**.
- **Soporte:** alto
- **Fuente(s):** DB-HS3 vigente, apartado 2 (Caracterización y cuantificación), punto 4. PDF oficial.
- **Nota:** Es adicional al caudal de la tabla 2.1 del propio local cocina (que cuenta como local húmedo).

### [A1-04] Caudal mínimo en periodos de no ocupación
- **Afirmación:** Debe garantizarse un caudal mínimo de **1,5 l/s por local habitable** en los periodos de no ocupación.
- **Soporte:** alto
- **Fuente(s):** DB-HS3 vigente, apartado 2, punto 2. PDF oficial.

### [A1-05] Tabla 2.2 — Caudales mínimos en locales no habitables
- **Afirmación:** Para locales no habitables del ámbito de HS3:
  - **Trasteros y sus zonas comunes:** 0,7 l/s por m² útil.
  - **Almacenes de residuos:** 10 l/s por m² útil.
  - **Aparcamientos y garajes:** 120 l/s por plaza.
- **Soporte:** alto
- **Fuente(s):** DB-HS3 vigente, Tabla 2.2 "Caudales de ventilación mínimos en locales no habitables". PDF oficial.

### [A1-06] Dimensionado del área efectiva de aberturas (Tabla 4.1)
- **Afirmación:** El área efectiva (cm²) de las aberturas se obtiene por:
  - **Aberturas de admisión:** 4·qv (o 4·qva con caudales equilibrados).
  - **Aberturas de extracción:** 4·qv (o 4·qve).
  - **Aberturas de paso:** mayor de 70 cm² u 8·qvp (mínimo 70 cm²).
  - **Aberturas mixtas:** 8·qv.
  donde qv es el caudal de ventilación mínimo exigido del local [l/s] de las tablas 2.1/2.2.
- **Soporte:** alto
- **Fuente(s):** DB-HS3 vigente, Tabla 4.1 "Área efectiva de las aberturas de ventilación de un local en cm²". PDF oficial.
- **Nota:** El "equilibrado de caudales" iguala admisión y extracción al mayor de los dos cuando no coinciden (definición en el anejo de términos del DB).

### [A1-07] Sistema general: flujo de aire y tipo de sistema
- **Afirmación:** Las viviendas deben disponer de ventilación general **híbrida o mecánica**. El aire debe circular de locales secos a húmedos: comedores, dormitorios y salas de estar con aberturas de admisión; aseos, cocinas y baños con aberturas de extracción; particiones intermedias con aberturas de paso. El dimensionado de conductos de extracción se obtiene en la Tabla 4.2 (secciones, cm²) según el caudal del tramo y la clase de tiro (Tabla 4.3, según nº de plantas).
- **Soporte:** alto
- **Fuente(s):** DB-HS3 vigente, apartado 3.1.1 (Viviendas) y apartado 4 (dimensionado de conductos), Tablas 4.2 y 4.3. PDF oficial.
- **Nota:** Los valores numéricos exactos de la Tabla 4.2/4.3 (secciones por caudal y clase de tiro T-1..T-4) no se transcriben aquí; existen en el PDF y conviene leerlos celda a celda al implementar conductos verticales y aspiradores híbridos/mecánicos. Marcado como pendiente de transcripción literal.

---

## HS4 — Suministro de agua

### [A1-08] Tabla 2.1 — Caudal instantáneo mínimo por aparato (agua fría / ACS, dm³/s = l/s)
- **Afirmación:** Caudales instantáneos mínimos (AF / ACS) en dm³/s:
  - Lavabo: 0,10 / 0,065
  - Bidé: 0,10 / 0,065
  - Ducha: 0,20 / 0,10
  - Bañera ≥ 1,40 m: 0,30 / 0,20
  - Bañera < 1,40 m: 0,20 / 0,15
  - Inodoro con cisterna: 0,10 / —
  - Inodoro con fluxor: 1,25 / —
  - Urinario con grifo temporizado: 0,15 / —
  - Urinario con cisterna (c/u): 0,04 / —
  - Fregadero doméstico: 0,20 / 0,10
  - Fregadero no doméstico: 0,30 / 0,10
  - Lavavajillas doméstico: 0,15 / 0,10
  - Lavavajillas industrial (20 servicios): 0,25 / 0,20
  - Lavadora doméstica: 0,20 / 0,15
  - Lavadora industrial (8 kg): 0,60 / 0,40
  - Grifo aislado: 0,15 / 0,10
  - Grifo garaje: 0,20 / —
  - Vertedero: 0,20 / —
- **Soporte:** medio
- **Fuente(s):** DB-HS4, Tabla 2.1 "Caudal instantáneo mínimo para cada tipo de aparato" (PDF oficial "Documento Básico HS con comentarios", CGATE). Versión vigente = la de 2009 (HS4 no modificada).
- **Nota:** ADVERTENCIA: la extracción automática del PDF presentó las filas y las columnas **desalineadas** (nombres de aparato y valores desplazados). La lista de valores AF/ACS de arriba es la conocida y estable de la tabla 2.1 de HS4, pero el **emparejamiento exacto aparato↔valor debe verificarse celda a celda contra el PDF maquetado** antes de codificar. Por eso soporte = medio. Confirmados sin ambigüedad por el texto: presiones (A1-10) y velocidades (A1-09).

### [A1-09] Velocidades de cálculo recomendadas en tuberías
- **Afirmación:** La velocidad de cálculo debe estar comprendida en:
  - Tuberías **metálicas**: entre **0,50 y 2,00 m/s**.
  - Tuberías **termoplásticas y multicapa**: entre **0,50 y 3,50 m/s**.
- **Soporte:** alto
- **Fuente(s):** DB-HS4, apartado 4.2 (dimensionado), punto d. PDF oficial. Leído literal.
- **Nota:** A velocidades ≥ 2 m/s deben preverse elementos antivibratorios/amortiguadores (apartado de la instalación).

### [A1-10] Presión mínima y máxima en puntos de consumo
- **Afirmación:** Presión mínima en puntos de consumo: **100 kPa** (1 bar) para grifos comunes; **150 kPa** (1,5 bar) para fluxores y calentadores. Presión máxima en cualquier punto de consumo: **500 kPa** (5 bar). Temperatura de ACS en puntos de consumo: entre **50 °C y 65 °C** (salvo viviendas de uso exclusivo).
- **Soporte:** alto
- **Fuente(s):** DB-HS4, apartado 2.1.3 (Condiciones mínimas de suministro), puntos 2, 3 y 4. PDF oficial. Leído literal.

### [A1-11] Coeficiente de simultaneidad K — criterio del DB
- **Afirmación:** El DB-HS4 **no impone una fórmula concreta** de simultaneidad. El procedimiento es: (a) caudal máximo del tramo = suma de caudales de la tabla 2.1 de los puntos que alimenta; (b) aplicar un coeficiente de simultaneidad por tramo "de acuerdo con un criterio adecuado"; (c) caudal de cálculo = caudal máximo × coeficiente de simultaneidad; (d) elegir velocidad en los intervalos de A1-09; (e) obtener diámetro.
- **Soporte:** alto
- **Fuente(s):** DB-HS4, apartado 4.2 (Dimensionado de las redes de distribución), puntos a–e. PDF oficial.
- **Nota:** La fórmula clásica K = 1/√(n−1) (UNE 149201 / norma francesa) es práctica habitual del sector pero **NO está prescrita en el DB-HS4**. UNE 149201 "Dimensionado de instalaciones de agua para consumo humano dentro de los edificios" es la referencia técnica usada en la práctica; conviene implementarla como opción, marcándola como criterio externo al CTE, no como exigencia.

### [A1-12] Tabla 4.2 — Diámetros mínimos de derivaciones a los aparatos (cobre/plástico, mm)
- **Afirmación:** Diámetro nominal mínimo del ramal de enlace (tubo de cobre/plástico, mm): Lavabo/bidé 12; Ducha 12; Bañera < 1,40 m 12; Bañera > 1,40 m 20; Inodoro con cisterna 12; Inodoro con fluxor 25–40; Urinario con grifo temporizado 12; Fregadero doméstico 12; Lavavajillas doméstico 12; Lavadora doméstica 20; Vertedero 20. (Para acero existe columna paralela en pulgadas.)
- **Soporte:** medio
- **Fuente(s):** DB-HS4, Tabla 4.2 "Diámetros mínimos de derivaciones a los aparatos". PDF oficial.
- **Nota:** Igual que A1-08, la extracción mostró desalineación parcial entre filas; los valores en mm están claros pero el emparejamiento exacto debe verificarse contra el PDF maquetado. La Tabla 4.3 da diámetros mínimos de alimentación por tramo (p.ej. cuarto húmedo privado: 20 mm en cobre/plástico).

### [A1-13] Criterio de grupo de presión
- **Afirmación:** Debe instalarse **grupo de presión** cuando la presión disponible en el punto de consumo más desfavorable, tras descontar pérdidas de carga, altura geométrica y presión residual, resulte **inferior a la presión mínima exigida** (A1-10). Las pérdidas localizadas pueden estimarse en un 20–30 % de las pérdidas por longitud del tramo.
- **Soporte:** alto
- **Fuente(s):** DB-HS4, apartado 4.2.2 "Comprobación de la presión", punto b. PDF oficial.

---

## HS5 — Evacuación de aguas

### [A1-14] Tabla 4.1 — Unidades de desagüe (UD) y diámetro mínimo de sifón/derivación por aparato
- **Afirmación:** UD (uso privado / uso público) y diámetro mínimo de sifón y derivación individual en mm (privado / público):
  - Lavabo: 1 / 2 — 32 / 40
  - Bidé: 2 / 3 — 32 / 40
  - Ducha: 2 / 3 — 40 / 50
  - Bañera (con o sin ducha): 3 / 4 — 40 / 50
  - Inodoro con cisterna: 4 / 5 — 100 / 100
  - Inodoro con fluxómetro: 8 / 10 — 100 / 100
  - Urinario pedestal: — / 4 — — / 50
  - Urinario suspendido: — / 2 — — / 40
  - Urinario en batería: — / 3,5 — — / —
  - Fregadero de cocina: 3 / 6 — 40 / 50
  - Fregadero de laboratorio/restaurante: — / 2 — — / 40
  - Lavadero: 3 / — — 40 / —
  - Vertedero: — / 8 — — / 100
  - Fuente para beber: — / 0,5 — — / 25
  - Sumidero sifónico: 1 / 3 — 40 / 50
  - Lavavajillas: 3 / 6 — 40 / 50
  - Lavadora: 3 / 6 — 40 / 50
  - Cuarto de baño (inodoro con cisterna): 7 / — — 100 / —
  - Cuarto de baño (inodoro con fluxómetro): 8 / — — 100 / —
  - Cuarto de aseo (inodoro con cisterna): 6 / — — 100 / —
  - Cuarto de aseo (inodoro con fluxómetro): 8 / — — 100 / —
- **Soporte:** alto
- **Fuente(s):** DB-HS5, Tabla 4.1 "UDs correspondientes a los distintos aparatos sanitarios" (PDF oficial Documento Básico HS, CGATE, p. HS5-6). Leído literal.
- **Nota:** Diámetros válidos para ramales individuales de longitud ≤ 1,5 m; para ramales mayores, cálculo pormenorizado. El diámetro de un tramo no puede ser menor que el de los tramos aguas arriba.

### [A1-15] Tabla 4.2 — UD de aparatos no incluidos (por diámetro de desagüe)
- **Afirmación:** Para aparatos no listados, UD según diámetro de desagüe (mm → UD): 32→1, 40→2, 50→3, 60→4, 80→5, 100→6. Desagües continuos/semicontinuos (climatización, bandejas de condensación): 1 UD por cada 0,03 dm³/s de caudal estimado.
- **Soporte:** alto
- **Fuente(s):** DB-HS5, Tabla 4.2 y apartado previo. PDF oficial.

### [A1-16] Botes sifónicos y sifones individuales
- **Afirmación:** Los sifones individuales deben tener el mismo diámetro que la válvula de desagüe conectada. Los botes sifónicos deben tener número y tamaño de entradas adecuado y altura suficiente para evitar que la descarga de un aparato alto salga por otro de menor altura.
- **Soporte:** alto
- **Fuente(s):** DB-HS5, apartado 4.1.1.2 "Botes sifónicos o sifones individuales". PDF oficial.

### [A1-17] Tabla 4.3 — Ramales colectores entre aparatos y bajante (UD máx. por pendiente → diámetro)
- **Afirmación:** Diámetro del ramal colector (mm) según UD máx. para pendientes 1 % / 2 % / 4 %:
  - 32 mm: — / 1 / 1
  - 40 mm: — / 2 / 3
  - 50 mm: — / 6 / 8
  - 63 mm: — / 11 / 14
  - 75 mm: — / 21 / 28
  - 90 mm: 47 / 60 / 75
  - 110 mm: 123 / 151 / 181
  - 125 mm: 180 / 234 / 280
  - 160 mm: 438 / 582 / 800
  - 200 mm: 870 / 1.150 / 1.680
- **Soporte:** alto
- **Fuente(s):** DB-HS5, Tabla 4.3 "Diámetros de ramales colectores entre aparatos sanitarios y bajante". PDF oficial. Leído literal.

### [A1-18] Tabla 4.4 — Bajantes de aguas residuales (UD por altura del edificio → diámetro)
- **Afirmación:** Las bajantes se dimensionan para no rebasar ±250 Pa de variación de presión y para que el agua no ocupe más de 1/3 de la sección. Diámetro (mm) según UD máx. en la bajante (hasta 3 plantas / más de 3 plantas) y UD máx. por ramal en cada planta (hasta 3 / más de 3):
  - 50 mm: 10 / 25 — 6 / 6
  - 63 mm: 19 / 38 — 11 / 9
  - 75 mm: 27 / 53 — 21 / 13
  - 90 mm: 135 / 280 — 70 / 53
  - 110 mm: 360 / 740 — 181 / 134
  - 125 mm: 540 / 1.100 — 280 / 200
  - 160 mm: 1.208 / 2.240 — 1.120 / 400
  - 200 mm: 2.200 / 3.600 — 1.680 / 600
  - 250 mm: 3.800 / 5.600 — 2.500 / 1.000
  - 315 mm: 6.000 / 9.240 — 4.320 / 1.650
- **Soporte:** alto
- **Fuente(s):** DB-HS5, Tabla 4.4 "Diámetro de las bajantes según el número de alturas del edificio y el número de UD" + apartado 4.1.2. PDF oficial. Leído literal.
- **Nota:** Desviaciones de bajante: < 45° respecto a la vertical, sin cambio de sección; > 45°, el tramo desviado se dimensiona como colector horizontal con pendiente 4 %.

### [A1-19] Tabla 4.5 — Colectores horizontales de aguas residuales (UD máx. por pendiente → diámetro)
- **Afirmación:** Los colectores horizontales se dimensionan a media sección (máx. 3/4) con flujo uniforme. Diámetro (mm) según UD máx. para pendientes 1 % / 2 % / 4 %:
  - 50 mm: — / 20 / 25
  - 63 mm: — / 24 / 29
  - 75 mm: — / 38 / 57
  - 90 mm: 96 / 130 / 160
  - 110 mm: 264 / 321 / 382
  - 125 mm: 390 / 480 / 580
  - 160 mm: 880 / 1.056 / 1.300
  - 200 mm: 1.600 / 1.920 / 2.300
  - 250 mm: 2.900 / 3.500 / 4.200
  - 315 mm: 5.710 / 6.920 / 8.290
  - 350 mm: 8.300 / 10.000 / 12.000
- **Soporte:** alto
- **Fuente(s):** DB-HS5, Tabla 4.5 "Diámetro de los colectores horizontales en función del número máximo de UD y la pendiente adoptada" + apartado 4.1.3. PDF oficial. Leído literal.

### [A1-20] Ventilación primaria de la red
- **Afirmación:** La ventilación primaria es suficiente como único sistema en edificios de **menos de 7 plantas** (o menos de 11 si la bajante está sobredimensionada y los ramales de desagüe miden menos de 5 m). Las bajantes deben prolongarse al menos **1,30 m** sobre la cubierta no transitable (**2,00 m** sobre el pavimento si es transitable). La salida no debe estar a menos de 6 m de tomas de aire exterior y debe sobrepasarlas en altura.
- **Soporte:** alto
- **Fuente(s):** DB-HS5, apartado 3.3.3.1 "Subsistema de ventilación primaria". PDF oficial. Leído literal.

### [A1-21] Ventilación secundaria y terciaria de la red
- **Afirmación:** En edificios fuera del caso de ventilación primaria sola se dispone **ventilación secundaria**: conexiones en plantas alternas si el edificio tiene < 15 plantas, o en cada planta si tiene ≥ 15. La columna de ventilación conecta arriba al menos 1 m por encima del último aparato. La **ventilación terciaria** se exige cuando los ramales de desagüe superan **5 m** o el edificio tiene más de 14 plantas, conectando los cierres hidráulicos a la columna secundaria.
- **Soporte:** alto
- **Fuente(s):** DB-HS5, apartados 3.3.3.2 y 3.3.3.3. PDF oficial. Leído literal.

---

## HE1 — Transmitancia U y condensaciones

### [A1-22] Edición vigente del DB-HE
- **Afirmación:** La versión vigente del DB-HE es la de **2019** (RD 732/2019), texto consolidado con fecha "14 Junio 2022". La sección HE1 se titula "Condiciones para el control de la demanda energética" e incluye la limitación de transmitancia (3.1.1) y la limitación de condensaciones (3.3).
- **Soporte:** alto
- **Fuente(s):** PDF oficial DB-HE, codigotecnico.org/pdf/Documentos/HE/DBHE.pdf, portada/cabecera "14 Junio 2022", índice HE1. Leído literal.

### [A1-23] Tabla 3.1.1.a-HE1 — Valores límite de transmitancia térmica Ulim [W/m²K]
- **Afirmación:** Ulim por elemento y zona climática de invierno (columnas α, A, B, C, D, E):
  - **Muros y suelos en contacto con aire exterior (US, UM):** 0,80 / 0,70 / 0,56 / 0,49 / 0,41 / 0,37
  - **Cubiertas en contacto con aire exterior (UC):** 0,55 / 0,50 / 0,44 / 0,40 / 0,35 / 0,33
  - **Muros, suelos y cubiertas en contacto con espacios no habitables o con el terreno (UT):** 0,90 / 0,80 / 0,75 / 0,70 / 0,65 / 0,59
  - **Medianerías o particiones interiores de la envolvente (UMD):** 3,2 / 2,7 / 2,3 / 2,1 / 1,8 / 1,8
  - **Huecos (marco+vidrio+cajón persiana) (UH):** 5,7 (valor único para todas las zonas en la columna correspondiente; ver nota)
  - **Puertas con superficie semitransparente ≤ 50 %:** 5,7
- **Soporte:** medio
- **Fuente(s):** PDF oficial DB-HE, Tabla 3.1.1.a-HE1 (codigotecnico.org/.../DBHE.pdf) + verificación cruzada con Normatia (normatia.com/.../transmitancia-maxima-envolvente-termica).
- **Nota:** ADVERTENCIA de maquetación: en la extracción del PDF las filas de la tabla aparecieron **desplazadas verticalmente**, lo que generó dos lecturas posibles para las filas inferiores (UT, UMD, UH). Normatia (fuente secundaria) da para HUECOS: α 3,2 / A 2,7 / B 2,3 / C 2,1 / D 1,8 / E 1,8, lo que sugiere que **los valores 3,2/2,7/2,3/2,1/1,8/1,8 corresponden a HUECOS (UH)**, no a UT, y que UT = 0,90/0,80/0,75/0,70/0,65/0,59. La fila de medianerías (UMD) sería un valor único 5,7. **Antes de codificar, verificar la asignación exacta de las tres filas inferiores celda a celda contra el PDF maquetado de codigotecnico.org.** Soporte = medio por esta ambigüedad de extracción. Las dos primeras filas (muros/suelos y cubiertas) son consistentes en ambas fuentes → fiables.

### [A1-24] Resistencias térmicas superficiales Rsi/Rse y fórmula de U
- **Afirmación:** La transmitancia se calcula como U = 1/RT, con RT = Rsi + R1 + R2 + … + Rn + Rse. Resistencias superficiales para cerramientos en contacto con aire exterior (Tabla 1 del DA DB-HE/1) [m²K/W]:
  - **Cerramientos verticales (flujo horizontal):** Rse = 0,04 ; Rsi = 0,13
  - **Flujo vertical ascendente (cubiertas/techos):** Rse = 0,04 ; Rsi = 0,10
  - **Flujo vertical descendente (suelos):** Rse = 0,04 ; Rsi = 0,17
  - Para particiones interiores (Tabla 6): Rse = Rsi = 0,13 (horizontal) / 0,10 (ascendente) / 0,17 (descendente).
- **Soporte:** alto
- **Fuente(s):** DA DB-HE/1 "Cálculo de parámetros característicos de la envolvente", ecuación (2) y Tabla 1 (codigotecnico.org/pdf/Documentos/HE/DA_DB-HE-1...). Leído literal del PDF.
- **Nota:** Las Ri de cada capa = espesor/conductividad. Para cámaras de aire y elementos especiales hay tablas adicionales en el mismo DA DB-HE/1. Las resistencias superficiales se toman de la tabla 1 según posición del cerramiento y sentido del flujo de calor (calefacción → flujo predominante define la columna).

### [A1-25] Verificación de condensaciones (método de Glaser)
- **Afirmación:** HE1 (apartado 3.3) exige que la máxima condensación intersticial acumulada en cada periodo anual **no supere la evaporación posible en el mismo periodo**, y que no se produzca merma significativa de prestaciones ni riesgo de degradación. La verificación se realiza por el **método de Glaser** (comparación de presión de vapor y presión de saturación en cada capa, condiciones de enero) según el Documento de Apoyo **DA DB-HE/2**. Las condensaciones superficiales se verifican por el **factor de temperatura de la superficie interior** fRsi ≥ fRsi,min.
- **Soporte:** alto
- **Fuente(s):** DB-HE, apartado 3.3 "Limitación de condensaciones en la envolvente térmica" (PDF oficial); DA DB-HE/2 "Condensaciones" (codigotecnico.org / cgate.es, método de Glaser, fRsi vs fRsi,min).
- **Nota:** El criterio cuantitativo (condensado acumulado ≤ evaporación anual) está literal en el DB; el procedimiento de cálculo detallado (presiones de vapor mensuales, fRsi,min por zona/humedad) está en el DA DB-HE/2, no en el cuerpo del DB.

### [A1-26] Tratamiento de puentes térmicos en el predimensionado
- **Afirmación:** Los puentes térmicos deben caracterizarse y considerarse en la justificación de HE1 (apartado 4 exige caracterizar "cerramientos opacos, huecos y puentes térmicos"). El cálculo de sus transmitancias lineales (ψ) se realiza según el Documento de Apoyo **DA DB-HE/3 "Puentes térmicos"**. Para predimensionado, la práctica habitual es aplicar un suplemento global (p.ej. mediante ψ tabulados del DA DB-HE/3) sobre la transmitancia de los cerramientos.
- **Soporte:** medio
- **Fuente(s):** DB-HE apartado 4 (justificación de la exigencia, punto d); DA DB-HE/3 "Puentes térmicos" (codigotecnico.org/pdf/Documentos/HE/DA-DB-HE-3_Puentes_termicos.pdf).
- **Nota:** No verificado con valor numérico concreto: los ψ tabulados (encuentros forjado-fachada, contorno de huecos, etc.) están en el DA DB-HE/3 y deben extraerse de allí. Para un predimensionado, conviene leer las tablas de ψ por tipo de encuentro del DA DB-HE/3; aquí no se transcriben cifras → soporte medio. El método simplificado "global K" (Klim de tablas 3.1.1.b/c-HE1) ya engloba el efecto de puentes térmicos a nivel de coeficiente global de transmisión.

---

## Pendientes / sin verificar con valor literal
- HS3 Tabla 4.2/4.3 (secciones de conducto de extracción y clases de tiro): existen en el PDF oficial; **no transcritas celda a celda** (A1-07).
- HS4 Tabla 2.1 y 4.2: valores conocidos pero con **desalineación de extracción**; emparejamiento aparato↔valor a confirmar contra PDF maquetado (A1-08, A1-12).
- HE1 Tabla 3.1.1.a: **asignación de las 3 filas inferiores (UT/UMD/UH)** a confirmar celda a celda (A1-23).
- HE1 puentes térmicos: ψ numéricos del DA DB-HE/3 **no extraídos** (A1-26).
- Coeficiente K de simultaneidad: **no prescrito por el CTE**; UNE 149201 es referencia externa (A1-11).
