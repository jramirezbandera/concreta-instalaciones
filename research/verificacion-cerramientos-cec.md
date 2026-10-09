# Verificación normativa: catálogo común de cerramientos del CEC para HE1, HR y HS1 (feature-26, paso 0)

**Fecha:** 2026-10-05 · Agente: cte-normativa · **No se ha editado código.** Bloque H añadido el 2026-10-09.
**Ámbito:** fijar, para cada fachada, cubierta, forjado y ventana del catálogo común, la composición por capas, la R0 de la fórmula del CEC, el grado de impermeabilidad que da el CEC y los rasgos que HS1 necesita, y comprobar si el cálculo por capas de HE1 reproduce el CEC. Bloques A a G del encargo, en ese orden. Los valores acústicos ya verificados (`research/verificacion-hr-cec.md`) solo se cotejan.

**Regla de veredictos** (la misma que en `verificacion-hr-cec.md`):
- **VERIFICADO**: leído en la **imagen** de la página (PNG a 200 ppp).
- **LEÍDO (texto)**: leído solo en el texto extraído. Cotejar antes de citar.
- **PENDIENTE**: página no renderizada o no leída en imagen. No se da el valor.
- **INTERPRETACIÓN**: se sigue del CEC o del DB, pero no lo escriben tal cual.
- **ARITMÉTICA**: calculado aquí con una regla escrita (se dice cuál y con qué datos).
- **CRITERIO K-CER.n**: lo que no fija el CEC ni el DB. Decisión de producto; la ficha lo rotula como criterio.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Lectura en esta sesión |
|---|---|---|---|
| [CEC] | Catálogo de Elementos Constructivos del CTE (IETcc, CEPCO, AICIA) | «Versión preliminar: Marzo 10. Borrador», archivo CAT-EC-v06.3 (marzo 2010). Sin carácter reglamentario (avisos 1 a 5 de `verificacion-hr-cec.md` §0) | Imagen: pp. 17, 19, 20, 21, 22, 25, 26, 27, 28, 29, 30, 31, 32 (materiales); 37, 38, 41, 45, 46, 49 (cubiertas); 53 a 61, 63 a 69, 73, 75, 76 (fachadas); 90, 92, 93, 95 (ventanas); 114, 115 (particiones horizontales). Texto: cabeceras de pp. 39 a 51, 91, 94. **Bloque H (2026-10-09), imagen:** pp. 14, 37, 38, 39, 40, 42, 43, 44, 47, 48, 50, 51, 52 |
| [DA/1] | DA DB-HE/1 «Cálculo de parámetros característicos de la envolvente» | enero 2020 | No releído aquí; se usa lo ya codificado en `he1/tablas.ts` (Rsi/Rse Tabla 1, cámaras Tabla 2, ec. (10), Tabla 10) |
| [HS1] | DB-HS1, tabla 2.7 y condiciones de fachada | La edición que usa el repo (`hs1/tablas.ts`, `hs1/condiciones.ts`, `research/verificacion-hs1.md`) | No releído aquí; se coteja con el repo |

**Advertencia de edición (INTERPRETACIÓN).** El CEC de 2010 es anterior al DB-HE 2019 (RD 732/2019, consolidado 14-jun-2022) y al DA DB-HE/1 de 2020. Sus R0 usan las mismas Rsi/Rse que la Tabla 1 del DA/1 (0,13 + 0,04 en muros; bloque B), así que el método es compatible. Los **límites** (Ulim) salen siempre del DB-HE 2019 (tabla corregida de IDR §0); el CEC solo aporta datos de producto y de solución.

**Cómo se leen las tablas de fachada del CEC** (VERIFICADO, p. 54 y siguientes): cada fila da el código, una sección acotada en mm de **exterior (izquierda) a interior (derecha)**, la columna «Datos entrada» (RE, o HP + RM en fábrica vista), la columna **HS: GI** (grado de impermeabilidad que alcanza la solución con ese dato de entrada), la columna **HE: U = 1/(R0 + R_AT)** y la columna **HR: RA, RAtr, m** (mínimo [medio]). En este documento las capas se dan **de interior a exterior**, como las espera `he1/calc.ts`.

---

## Bloque A. Fachadas

### A.1 Leyenda de capas y materiales del CEC (para mapear a R, λ y µ)

| Sigla CEC | Qué es | Dato térmico del CEC | µ | Veredicto y fuente |
|---|---|---|---|---|
| RE (continuo) | Revestimiento exterior continuo. Espesor en la sección: «≥ 15» | Mortero de cemento para revoco, colocado in situ: ρ = 1 900 kg/m³ (nota 1) → fila 1 800 < ρ ≤ 2 000: **λ = 1,30** | 10 | VERIFICADO, p. 19 (3.5 Morteros, nota 1) |
| RE (discontinuo) | Aplacado o revestimiento discontinuo (4.2.6 a 4.2.8) | Fuera del cálculo si hay cámara ventilada detrás (ver A.4) | — | VERIFICADO (secciones pp. 68, 73, 76); ARITMÉTICA (B.2) |
| RM | Revestimiento intermedio (enfoscado en la cara interior de la hoja principal). 15 mm en la sección | Mortero, λ = 1,30 | 10 | VERIFICADO, pp. 54, 19 |
| LC ½ pie | Fábrica de ladrillo cerámico perforado (o macizo), 115 mm | **R directa** de la fábrica, no λ: LP ½ pie, 40 ≤ G ≤ 60: **0,18**; 60 < G ≤ 80: 0,21; 80 < G ≤ 100: 0,23. Macizo ½ pie: 0,12 | 10 | VERIFICADO, p. 26 (3.17.1). Las R incluyen mortero de 1 900 kg/m³ (nota 2) |
| LC 1 pie | Ídem, 240 mm | LP 1 pie: **0,35** / 0,41 / 0,47 (mismos rangos de G). Macizo 1 pie: 0,17 | 10 | VERIFICADO, p. 26 |
| LH | Hoja interior de ladrillo hueco, 70 mm | Tabicón de LH doble (60 < E ≤ 90): **R = 0,16**. Sencillo (40–60): 0,09. Triple (100–110): 0,23. Gran formato: sencillo 0,18, doble 0,33, triple 0,48 | 10 | VERIFICADO, p. 26 |
| BH | Bloque de hormigón (hoja principal 140, 240; hoja interior 80) | Áridos densos, hueco: 80 → 0,10; 140 → **0,19**; 190 → 0,22; 240 → 0,25. Áridos ligeros perforado: 80 → 0,45; 140 → 0,68; 240 → 0,83 | 10 (AD), 6 (AL) | VERIFICADO, p. 28 (3.17.4) |
| BC | Bloque cerámico aligerado | Mortero convencional: 140 → 0,32; 190 → 0,44; 240 → 0,57; 290 → 0,68 | 10 | VERIFICADO, p. 27 (3.17.3) |
| C (sin ventilar) | Cámara de aire no ventilada, 30 mm en la sección | No la tabula el CEC. Con la Tabla 2 del DA/1 interpolada (2 cm 0,17; 5 cm 0,18): 3 cm vertical = **0,173**. El CEC usa 0,17 (B.1) | 1 | ARITMÉTICA con DA/1 Tabla 2 (`CAMARA_AIRE_SIN_VENTILAR_R`) |
| SP | «Separación de 10 mm» entre la hoja principal y un trasdosado | Cámara de 1 cm: **0,15** (DA/1 Tabla 2) | 1 | VERIFICADO (leyenda p. 59); ARITMÉTICA (B.1) |
| C (ventilada) | Cámara ventilada «≥ 30» (4.2.2, 4.2.5, 4.2.7, 4.2.8) | Fuera del cálculo; Rse = 0,13 (ver A.4 y B.2) | — | VERIFICADO (secciones); ARITMÉTICA |
| AT | Aislante no hidrófilo, espesor e_AT variable | λ del producto. CEC 3.8.1: EPS **0,039** (valor recomendado, nota 1) a 0,029; XPS CO₂ 0,039–0,033; XPS HFC 0,039–0,029; MW 0,050–0,031; PUR proyectado HFC 0,028 | EPS 20–100; XPS 100–220; MW 1; PUR 60–150 | VERIFICADO, p. 21 |
| YL | Placa de yeso laminado, 15 mm | λ = **0,25** (incluye el papel, nota 1) | **4** | VERIFICADO, p. 20 (3.6.2) |
| RI | Revestimiento interior (enlucido, enfoscado o alicatado), 15 mm | Enlucido de yeso 1 000 ≤ ρ ≤ 1 300: λ = **0,57** | **6** | VERIFICADO, p. 20 (3.7) |

### A.2 Las seis fachadas del catálogo actual de HR

Capas de **interior a exterior**, espesores en mm. «R0» es el término constante de la fórmula U = 1/(R0 + R_AT) del CEC, con R_AT = e_AT/λ_AT. GI: el que da la columna HS del CEC para cada dato de entrada. HR: RA / RAtr / m, mínimo [medio].

| # | Código, página | Descripción | Capas (int → ext) | R0 CEC | GI CEC (dato de entrada → GI) | HR: RA / RAtr / m | Veredicto |
|---|---|---|---|---|---|---|---|
| A.2.1 | **F 3.1**, p. 59 (4.2.3) | Revestimiento continuo + LP ½ pie + aislante + LHD + enlucido. **Sin cámara** | RI 15 · LH 70 · AT e_AT · LC 115 · RE ≥ 15 | **0,54** | R1 → **3**; R3 o B3 → **5** | 48 [49] / **45 [46]** / 220 [240] (coincide con G.1 de la verificación HR) | VERIFICADO |
| A.2.2 | **F 1.1**, p. 54 (4.2.1) | LP ½ pie cara vista + enfoscado intermedio + aislante + LHD + enlucido. Sin cámara | RI 15 · LH 70 · AT e_AT · RM 15 · LC 115 (vista) | **0,54** | HP J1 + RM N1 → **2**; J2 + N2 → **3** (nota 2: ladrillo de baja higroscopicidad, H1); B3 → **5** | 50 [50] / **47 [47]** / 247 [271] (= G.2) | VERIFICADO |
| A.2.3 | **F 3.4**, p. 59 (4.2.3) | Revestimiento continuo + LP ½ pie + separación 10 mm + aislante + PYL (trasdosado autoportante) | YL 15 · AT e_AT · SP 10 · LC 115 · RE ≥ 15 | **0,57** | R1 → **4**; R3 o B3 → **5** | 59 [60] / **54 [55]** / 157 [169] (= G.3). Nota (8): RA y RAtr solo con lana mineral o absorbente r ≥ 5 kPa·s/m² en la cámara | VERIFICADO |
| A.2.4 | **F 4.3**, p. 64 (4.2.4) | SATE sobre bloque de hormigón 140 | RI 15 · BH 140 · AT e_AT · RE ≥ 15 | **0,39** (áridos densos, nota 3); **0,88** (áridos ligeros, nota 4) | R1 → **4**; R3 → **5** | AD: 44 / **41** / 210; AL: 41 / 38 / 182 (= G.4, G.12) | VERIFICADO |
| A.2.5 | **F 4.1**, p. 64 (4.2.4) | SATE sobre LP ½ pie | RI 15 · LC 115 · AT e_AT · RE ≥ 15 | **0,38** | R1 → **4**; R3 → **5** | 42 [43] / **39 [40]** / 161 [173] (= G.5) | VERIFICADO |
| A.2.6 | **F 8.1**, p. 76 (4.2.8) | Revestimiento discontinuo sobre cámara ventilada + aislante exterior + LP ½ pie | RI 15 · LC 115 · AT e_AT · **C ventilada ≥ 30** · RE discontinuo | **0,47** | R2 → **4**; R3 o B3 → **5** | 42 [43] / **39 [40]** / 156 [168] (= catálogo HR) | VERIFICADO |

Notas al pie que condicionan U, GI o el uso (todas VERIFICADO en imagen):
- **HE (todas las tablas):** «El factor de temperatura de la superficie interior, fRsi, se calculará según la siguiente expresión: fRsi = 1 − U·0,25» (4.2.1 nota 4, p. 56; 4.2.3 nota 2, p. 63; 4.2.4 nota 1, p. 65; 4.2.8 nota 1, p. 76). Coincide con `RSI_CONDENSACION` del repo.
- **HS, aislante hidrófilo.** 4.2.1 nota (1), p. 56: «Cuando el aislante de la fachada sea hidrófilo, el GI disminuye un grado excepto en las soluciones que cumplan la condición B3. Conviene aclarar que las soluciones de una sóla hoja de 1/2 pie siempre deben llevar aislante no hidrófilo, por lo que no se dará esta circunstancia.» 4.2.3 nota (1), p. 63: igual, «excepto cuando se cumplan las condiciones R3 o B3». 4.2.7 nota (1), p. 75: «Cuando el aislante sea hidrófilo y se cumpla la condición R2, el GI disminuye un grado». **4.2.4 y 4.2.8 no llevan esta nota** (p. 65 y p. 76).
- **HS, higroscopicidad.** 4.2.1 nota (2): «Debe utilizarse ladrillo cerámico de higroscopicidad baja (succión ≤ 4,5 kg/m²·min según UNE EN 772-11:2001 y UNE EN 772-11:2001/A1:2006)»; nota (3): «Cuando la higroscopicidad de la hoja principal sea baja … entonces el GI aumenta un grado» (p. 56).
- **HE, cámara parcialmente ventilada** (4.2.1 nota 9, p. 56; 4.2.3 nota 9, p. 63). Cámara no ventilada = área efectiva < 120 cm² por 10 m² de fachada entre forjados (3 600 mm² por metro con 3 m de altura). Con **500 ≤ A < 1 500 mm²**: «Debe restarse 0,09 al denominador indicado en las tablas» (y −1 dB en RA y RAtr). Con **1 500 ≤ A < 3 600 mm²**: U según la hoja interior: LH 1/(0,45 + R_AT); LGF 1/(0,47 + R_AT); BH AD 1/(0,39 + R_AT); BH AL 1/(0,74 + R_AT); YL 1/(0,32 + R_AT); picón D1800 1/(0,51 + R_AT), D1500 1/(0,56 + R_AT) (p. 63; la p. 56 no tiene las dos de picón); y −2 dB.
- **HS, cámara ventilada** (4.2.2 nota 5, p. 58; 4.2.5 nota 7, p. 67; 4.2.8 nota 7, p. 76): «una cámara de aire ventilada tiene un espesor ≥ 3 cm y ≤ 10 cm, un sistema de recogida y evacuación del agua y aberturas de ventilación con una anchura > 5 mm repartidas al 50 % entre la parte superior y la inferior de un paño entre forjados. El área de ventilación efectiva será ≥ 120 cm² por cada 10 m² de fachada entre forjados.»
- **HR**: mínimo [medio]; RA y RAtr valen con o sin bandas en la hoja interior y con LH o LGF (m − 15 kg/m² con LGF); con hoja principal cerámica, solo si es perforado o macizo (4.2.3 nota 4, p. 63; 4.2.4 nota 2, p. 65; 4.2.8 nota 2, p. 76). Ya recogido en la verificación HR (G.7 a G.12).
- **Hoja principal de bloque de hormigón** (4.2.3 nota 10, p. 63; 4.2.4 nota 6, p. 65): absorción ≤ 0,32 g/cm³ (UNE 41170:1989EX), salvo curado en autoclave.

### A.3 Fachadas que conviene añadir (propuesta: ocho)

| # | Código, página | Por qué | Capas (int → ext) | R0 CEC | GI CEC | HR: RA / RAtr / m | Veredicto |
|---|---|---|---|---|---|---|---|
| A.3.1 | **F 3.2**, p. 59 | ½ pie revestido **con cámara** de 30 mm: es exactamente la fachada que hoy calcula HE1 | RI 15 · LH 70 · AT e_AT · C 30 (sin ventilar) · LC 115 · RE ≥ 15 | **0,71** | R1 → **4**; R3 o B3 → **5** | 48 [49] / 45 [46] / 220 [240] (iguales que F 3.1) | VERIFICADO |
| A.3.2 | **F 3.5**, p. 59 | 1 pie revestido, sin cámara | RI 15 · LH 70 · AT e_AT · LC 240 · RE ≥ 15 | **0,71** | R1 → **3**; R3 o B3 → **5** (ver F.3: el DB daría 4) | 52 [53] / 49 [50] / 355 [392] | VERIFICADO |
| A.3.3 | **F 1.2**, p. 54 | ½ pie **cara vista con cámara** no ventilada | RI 15 · LH 70 · AT e_AT · C · RM 15 · LC 115 (vista) | **0,71** | J1 N1 → **3**; J2 N2 → **4** (nota 2, H1); B3 → **5** | 50 [50] / 47 [47] / 247 [271] | VERIFICADO (la cámara no está acotada en la sección; 0,71 − 0,54 = 0,17 indica 30 mm) |
| A.3.4 | **F 2.1**, p. 57 (4.2.2) | ½ pie **cara vista con cámara ventilada** | RI 15 · LH 70 · AT e_AT · C ventilada ≥ 30 · LC 115 (vista) | **0,45** | **5** (sin dato de entrada) | 47 / 44 / 220 [244] | VERIFICADO |
| A.3.5 | **F 4.2**, p. 64 | SATE sobre 1 pie | RI 15 · LC 240 · AT e_AT · RE ≥ 15 | **0,55** | R1 → **5** | 49 [50] / 46 [47] / 296 [325] | VERIFICADO |
| A.3.6 | **F 7.3**, p. 73 (4.2.7) | Aplacado ventilado con el **aislante por el interior** de la hoja principal | RI 15 · LH 70 · AT e_AT · LC 115 · C ventilada ≥ 30 · RE discontinuo | **0,63** | R2 o B3 → **5** | 48 [49] / 45 [46] / 242 [262] | VERIFICADO |
| A.3.7 | **F 8.2**, p. 76 | Fachada ventilada con aislante exterior sobre **bloque de hormigón** 140 | RI 15 · BH 140 · AT e_AT · C ventilada ≥ 30 · RE discontinuo | **0,48** (AD); **0,97** (AL) | R2 → **4**; R3 o B3 → **5** | AD: 44 / 41 / 205; AL: 41 / 38 / 177 | VERIFICADO |
| A.3.8 | **F 3.9**, p. 60 | Bloque de hormigón 140 revestido, aislante y LHD (vivienda en bloque) | RI 15 · LH 70 · AT e_AT · BH 140 · RE ≥ 15 | **0,55** (AD, nota 5); **1,04** (AL, nota 6) | R1 → **3**; R3 o B3 → **5** | AD: 49 / 46 / 269; AL: 47 / 44 / 241 | VERIFICADO |

Otras leídas en imagen, no propuestas: F 3.3 (RE + LC 115 + AT + YL; R0 0,42; R1 → 3; 52 [53] / 47 [48] / 157 [169]); F 3.6 (1 pie + C 30 + AT + LHD; 0,88; R1 o B3 → 5); F 1.5 (1 pie vista + AT + LHD; 0,71; J1 N1 → 2 (3)); F 7.1 (RE + LC + C ventilada + AT + LH; 0,45; GI 5); F 6.1 (revestimiento discontinuo sin cámara; 0,54; R1 → 3, R2 o B3 → 5); F 5.1 (revestimiento continuo + LC + C ventilada + AT + LH; 0,45; GI 5).

### A.4 Dónde está la cámara y qué excluye el CEC en las ventiladas

| # | Afirmación | Veredicto | Detalle |
|---|---|---|---|
| A.4.1 | 4.2.1, 4.2.3, 4.2.6: «sin cámara o con cámara de aire no ventilada», aislamiento por el interior. La cámara C va entre la hoja principal y el aislante (por el lado exterior del aislante) | VERIFICADO | Secciones pp. 54, 59, 68: orden LC · C · AT · LH |
| A.4.2 | 4.2.2, 4.2.5, 4.2.7: cámara ventilada **entre la hoja exterior y el aislante** (4.2.2 y 4.2.5: hoja exterior = fábrica; 4.2.7: F 7.1/7.2 la cámara va tras la fábrica, F 7.3/7.4 va tras el aplacado) | VERIFICADO | pp. 57, 66, 73 |
| A.4.3 | 4.2.8: RE discontinuo · C ventilada · AT · HP · RI (aislante exterior) | VERIFICADO | p. 76 |
| A.4.4 | **El CEC excluye la cámara ventilada y todo lo que queda fuera de ella, y toma Rse = 0,13** (la Rsi de muro) | ARITMÉTICA (bloque B.2) | F 8.1: 0,13 + 0,026 (RI) + 0,18 (LC) + 0,13 = **0,466 → 0,47** ✓. F 2.1: 0,13 + 0,026 + 0,16 (LH) + 0,13 = **0,446 → 0,45** ✓ (excluye LC 115 cara vista). F 7.1: igual 0,45 ✓ (excluye RE y LC). F 7.3: 0,13 + 0,026 + 0,16 + 0,18 + 0,13 = **0,626 → 0,63** ✓ (excluye RE). La regla coincide con la que el repo atribuye al DA/1 (`he1/tablas.ts`, comentario del bloque 3: «no se considera la cámara ni las capas exteriores a ella»). La Rse = Rsi no está escrita en el CEC: se deduce de sus cifras |
| A.4.5 | La tabla de la nota (9) para cámaras con 1 500 ≤ A < 3 600 mm² **es la misma regla** (Rsi + Rse = 0,26 + hoja interior + RI) | ARITMÉTICA | LH: 0,26 + 0,16 + 0,026 = 0,446 → 0,45 ✓; YL: 0,26 + 0,06 = 0,32 ✓; BH AD 80: 0,26 + 0,10 + 0,026 = 0,386 → 0,39 ✓; LGF: 0,26 + 0,18 (tabique GF **sencillo**) + 0,026 = 0,466 → 0,47 ✓ (con el doble GF, 0,33, no cuadra) |

---

## Bloque B. Comprobación aritmética de R0 por capas

**Datos usados** (todos VERIFICADO en el CEC salvo las cámaras, que son DA/1 Tabla 2): Rsi + Rse = 0,13 + 0,04 = **0,17** (muros, no ventilada); 0,13 + 0,13 = **0,26** (ventilada, A.4.4); RE y RM 15 mm de mortero λ 1,30 → **0,0115**; RI 15 mm de enlucido λ 0,57 → **0,0263**; LP ½ pie **0,18** (G ≤ 60); LP 1 pie **0,35**; LHD 70 **0,16**; BH AD 140 **0,19**; YL 15 λ 0,25 → **0,06**; cámara 30 mm **0,173**; SP 10 mm **0,15**.

### B.1 Fachadas no ventiladas

| Fachada | Suma por capas | Resultado | CEC | Δ (capas − CEC) | Veredicto |
|---|---|---|---|---|---|
| F 3.1 | 0,17 + 0,0263 + 0,16 + 0,18 + 0,0115 | **0,548** | 0,54 | +0,008 | ARITMÉTICA: cuadra |
| F 1.1 | 0,17 + 0,0263 + 0,16 + 0,0115 (RM) + 0,18 | **0,548** | 0,54 | +0,008 | cuadra |
| F 3.2 | F 3.1 + 0,173 | **0,721** | 0,71 | +0,011 | cuadra |
| F 3.4 | 0,17 + 0,06 + 0,15 + 0,18 + 0,0115 | **0,572** | 0,57 | +0,002 | cuadra |
| F 3.5 | 0,17 + 0,0263 + 0,16 + 0,35 + 0,0115 | **0,718** | 0,71 | +0,008 | cuadra |
| F 4.1 | 0,17 + 0,0263 + 0,18 + 0,0115 | **0,388** | 0,38 | +0,008 | cuadra |
| F 4.2 | 0,17 + 0,0263 + 0,35 + 0,0115 | **0,558** | 0,55 | +0,008 | cuadra |
| F 4.3 (AD) | 0,17 + 0,0263 + 0,19 + 0,0115 | **0,398** | 0,39 | +0,008 | cuadra |
| F 3.9 (AD) | 0,17 + 0,0263 + 0,16 + 0,19 + 0,0115 | **0,558** | 0,55 | +0,008 | cuadra |

### B.2 Fachadas ventiladas

| Fachada | Suma por capas (Rsi + capas interiores a la cámara + Rse = 0,13) | Resultado | CEC | Δ |
|---|---|---|---|---|
| F 8.1 | 0,13 + 0,0263 + 0,18 + 0,13 | **0,466** | 0,47 | −0,004 |
| F 8.2 (AD) | 0,13 + 0,0263 + 0,19 + 0,13 | **0,476** | 0,48 | −0,004 |
| F 2.1 | 0,13 + 0,0263 + 0,16 + 0,13 | **0,446** | 0,45 | −0,004 |
| F 7.3 | 0,13 + 0,0263 + 0,16 + 0,18 + 0,13 | **0,626** | 0,63 | −0,004 |

### B.3 Conclusiones

| # | Afirmación | Veredicto | Detalle |
|---|---|---|---|
| B.3.1 | **El cálculo por capas reproduce la R0 del CEC con |Δ| ≤ 0,011 m²K/W** en las 13 fachadas comprobadas, si las fábricas entran con su **R de tabla** (3.17), el mortero con λ 1,30, el enlucido con λ 0,57, la PYL con 0,25 y las cámaras con la Tabla 2 del DA/1 | ARITMÉTICA | El patrón (+0,008 en todas las que llevan RE o RM de 15 mm) sugiere que el CEC desprecia o trunca el revestimiento exterior; F 3.4 (+0,002) no encaja del todo con esa lectura. No se puede saber cuál; el efecto es despreciable: con U ≈ 0,40, ΔU ≈ U²·ΔR = 0,0018 W/m²K |
| B.3.2 | **El motor de HE1 puede seguir calculando por capas** (lo necesita para Glaser) y usar la fórmula del CEC como contraste en los tests, con tolerancia | INTERPRETACIÓN + **K-CER.4** | Tolerancia propuesta en los tests: |R0_capas − R0_CEC| ≤ 0,02 m²K/W |
| B.3.3 | **Los λ de fábrica que usa hoy HE1 no son los del CEC y no van del lado seguro** | **CORRECCIÓN** (ARITMÉTICA) | `LAMBDA_REFERENCIA`: LP λ 0,49 → R(115) = **0,235** (el CEC da 0,18 a 0,23; 0,235 supera incluso el G más perforado); LH λ 0,32 → R(70) = **0,219** (CEC LHD: **0,16**). La fachada actual de HE1 (½ pie + XPS + cámara 30 + LHD) suma R0 = 0,13 + 0,0263 + 0,219 + 0,173 + 0,235 + 0,0115 + 0,04 = **0,825**; con las R del CEC, **0,721** (CEC F 3.2: 0,71). HE1 sobrestima la R de la fachada en ≈ 0,10 m²K/W |
| B.3.4 | ¿Cambia el aislante habitual de la fachada? | ARITMÉTICA | Con XPS λ 0,034 y paso de 10 mm, el mínimo que cumple Ulim es el mismo en todas las zonas: α 20 mm (14,5 → 18,0), A 30 (20,5 → 24,1), B 40 (32,7 → 36,2), C 50 (41,3 → 44,9), D 60 (54,9 → 58,4), E 70 (63,9 → 67,4) (mm sin redondear: hoy → con el CEC). Con el suelo de 60 mm de `ESPESOR_TIPO_mm`, el habitual no cambia. Solo cambia el veredicto si el usuario fijó un espesor al límite. Glaser sí cambia algo (temperaturas de las caras) |
| B.3.5 | Otros λ y µ del repo frente al CEC | VERIFICADO (CEC) | HA: λ 2,30 (2 300 < ρ ≤ 2 500) ✓, **µ 80** (repo: 95, rango 70–120); PYL **µ 4** (repo: 8); enlucido de yeso **µ 6** (el repo usa la PYL, µ 8, para el enlucido); XPS **µ 100–220** (repo: muMax 2 200, error de un cero); EPS λ recomendado **0,039** (repo: 0,037); bloque de hormigón: el CEC da R por espesor (BH AD 140: 0,19), el repo λ 1,0 → R 0,14 (lado seguro); mortero 1,30 ✓; hormigón en masa 2 000–2 300: 1,65 ✓ (p. 17) |

---

## Bloque C. Cubiertas

### C.1 Qué dice el CEC

| # | Afirmación | Veredicto | Detalle y fuente |
|---|---|---|---|
| C.1.1 | Las tablas de cubierta dan **U = 1/(R0 + R_AT)** por tipo de **soporte resistente** (FU con bovedilla BP de EPS, BC cerámica, BH de hormigón; FR con casetón CP, CC, CH o sin piezas SC; L losa). **No dan el canto** | VERIFICADO | pp. 37, 38, 41, 45, 49 |
| C.1.2 | **Las cubiertas no tienen columna HS** (solo HE y HR). El CEC no asigna condiciones de HS1 a las cubiertas | VERIFICADO | pp. 37, 38, 41, 45, 49 |
| C.1.3 | m, RA y RAtr: los del forjado de 3.18; +2 dBA si hay formación de pendientes de hormigón con áridos ligeros; techo suspendido: suma de ΔRA (4.5.2.1) | VERIFICADO | 4.1.1 nota (4), p. 37; 4.1.2 (4), p. 38; 4.1.5 (4), p. 41; 4.1.12 (6), p. 49. **4.1.9: nota (5), p. 46, VERIFICADO ahora en imagen**: remite a 3.18 **sin** el +2 dBA (no hay capa de pendientes; el soporte resistente hace de formación de pendientes, leyenda SR) |
| C.1.4 | **R0 = constante del paquete + R del forjado de 3.18 de canto 250 mm** (losa: 200 mm), con las piezas de EPS «moldeadas enrasadas» | ARITMÉTICA (8 filas por tabla, todas cuadran) | 4.1.1: R0 − R_forjado = **0,27** en las ocho: BP 1,07 − 0,80 (EPS moldeada enrasada 250); BC 0,55 − 0,28; BH 0,46 − 0,19; CP 0,47 − 0,20; CC 0,42 − 0,15; CH 0,40 − 0,13; SC 0,33 − 0,06; L 0,35 − 0,08 (losa 200). 4.1.2 y 4.1.5: **0,25** (1,05/0,53/0,44/0,45/0,40/0,38/0,31/0,33). 4.1.9: **0,19** (0,99/0,47/0,38/0,27). 4.1.12: **0,23** muy ventilada; **0,45** ligeramente ventilada. El CEC no escribe el canto: es INTERPRETACIÓN por la aritmética |
| C.1.5 | Qué contiene la constante | INTERPRETACIÓN | 4.1.1: Rsi + Rse = 0,10 + 0,04 = 0,14 (flujo ascendente) + 0,13 de protección, mortero, láminas y formación de pendientes. No se puede descomponer más: el CEC no acota esas capas. En 4.1.12 muy ventilada, 0,10 + 0,10 (Rse = Rsi) = 0,20, más 0,03 sin explicar |
| C.1.6 | **La fórmula depende del forjado**, pero de uno fijo (250). Si el proyecto lleva un forjado de 300 mm, la R real es mayor (FU BH 300: 0,21 frente a 0,19) | INTERPRETACIÓN | Propuesta K-CER.10: R0_cubierta = constante del paquete + R del forjado elegido en El edificio (3.18, tipo y canto) |

### C.2 Soluciones

| # | Código, página | Descripción | Capas (int → ext) | R0 CEC | RAtr (forjado FU BH 300 de El edificio) | Veredicto |
|---|---|---|---|---|---|---|
| C.2.1 | **C 1.3**, p. 37 (4.1.1) | Plana transitable, no ventilada, **solado fijo**, convencional o invertida, sobre FU con bovedilla de hormigón | Convencional: SR · FP (hormigón ligero) · B (si hay riesgo) · AT · Cs · I · Csa · MA · P. Invertida: SR · FP · Cs · I · Cs · AT · Csa · MA · P | **0,46** (0,27 + 0,19) | 50 + 2 = **52** (ya en el catálogo HR) | VERIFICADO (capas y R0); ARITMÉTICA (RAtr) |
| C.2.2 | **C 5.3**, p. 41 (4.1.5) | Plana **no transitable, grava**, convencional o invertida, FU BH | Convencional: SR · FP · B · AT · Cs · I · Csa · P (grava). Invertida: SR · FP · Cs · I · Cs · AT · Csa · P | **0,44** (0,25 + 0,19) | 52 | VERIFICADO; ARITMÉTICA |
| C.2.3 | **C 2.3**, p. 38 (4.1.2) | Plana transitable, **solado flotante**, solo invertida, FU BH | SR · FP · Cs · I · Csa · AT · P (solado flotante) | **0,44** | 52 | VERIFICADO; ARITMÉTICA |
| C.2.4 | **C 9.3**, p. 45 (4.1.9) | Inclinada, **forjado inclinado**, no ventilada, tejas, convencional o invertida, FU BH | Convencional: SR · B · AT · Cs · I · Cs · T. Invertida: SR · Cs · I · Cs · AT · T. **No lleva RI en la sección** | **0,38** (0,19 + 0,19) | 50 (sin +2) | VERIFICADO; ARITMÉTICA |
| C.2.5 | **C 9.4**, p. 45 | Ídem sobre losa | SR losa · … · T | **0,27** | — (losa de El edificio) | VERIFICADO |
| C.2.6 | **C 12.3**, p. 49 (4.1.12) | Inclinada, **forjado horizontal**, ventilada (bajo cubierta), tejas, convencional, FU BH | SR · AT · C (ventilada, 30 > Ss/Ac > 3) · FP (tablero) · I · T | **0,42** muy ventilada (> 1 500 mm²/m²); **0,64** ligeramente (500–1 500) | 50 | VERIFICADO |

Notas (VERIFICADO): 4.1.1 nota (2) pendiente de 1 a 5 %; barrera de vapor «sólo si hay riesgo de condensación según … DB HE-1»; 4.1.9 nota (2) pendiente mínima sin impermeabilización en el DB-HS1; 4.1.12 notas (4) y (5) definen ligeramente y muy ventilada por superficie de aberturas **por m² de cubierta** (500 < S ≤ 1 500 mm² y S > 1 500 mm²).

**Cotejo con HE1 de hoy (ARITMÉTICA).** Plana: el repo suma 0,10 + 0,026 (enlucido) + 0,13 (HA 300, λ 2,3) + 0,061 (100 mm de hormigón de pendientes λ 1,65) + 0,017 (lámina) + 0,04 = **0,374**, frente a 0,27 + 0,21 = **0,48** con el CEC y un FU BH de 300. Inclinada: repo 0,10 + 0,026 + 0,109 (HA 250) + 0,023 + 0,04 = **0,298**; CEC C 9.3 **0,38**. En cubiertas, **HE1 va hoy del lado seguro** (menos R que el CEC).

---

## Bloque D. Forjados (3.18) y la nota de la p. 114

| # | Afirmación | Veredicto | Detalle |
|---|---|---|---|
| D.1 | **Sí: 3.18 da R térmica de cada forjado** (y ρ, cp, µ), por tipo de pieza y canto | VERIFICADO | pp. 29, 30, 31 |
| D.2 | Qué incluye la R | VERIFICADO | 3.18.1 nota (2): «Los valores de R incluyen la capa de compresión y las viguetas de hormigón.» 3.18.2 nota (2): «Los valores de R son válidos para forjados reticulares con un porcentaje de ábacos menor o igual que el 30 %. Incluyen también la capa de compresión.» Piezas de EPS: solo con λ ≤ 0,046 (3.18.1 nota 4; 3.18.2 nota 5). Descolgadas: «Valores del canto estructural» |
| D.3 | p. 114 (4.5 Particiones interiores horizontales) | VERIFICADO | «Para el cálculo de la transmitancia térmica, U, los valores de la resistencia térmica, R, de los forjados se encuentran en el apartado 3.18. Los valores de las resistencias térmicas de los suelos flotantes y de los techos suspendidos se encuentran en los apartados 4.5.1 y 4.5.2 respectivamente.» Fórmulas: **U = 1/(0,20 + R_F + R_SF + R_TS)** flujo ascendente; **1/(0,34 + R_F + R_SF + R_TS)** flujo descendente (son 2·Rsi de la Tabla 6 del DA/1: 2·0,10 y 2·0,17). fRsi = 1 − 0,25·U |
| D.4 | Suelo flotante S01 (mortero 50 mm sobre MW, PE-E o PE-R) | VERIFICADO | p. 115: **R_SF = 0,02 + R_AR** (R_AR = R del material aislante a ruido de impactos) |

**R [m²K/W] por tipo y canto (todas VERIFICADO en imagen).** Canto en mm; µ entre paréntesis.

| Tipo | 200 | 250 | 300 | 350 | 400 | 450 | 500 | µ | Página |
|---|---|---|---|---|---|---|---|---|---|
| Unidireccional, bovedilla cerámica | — | 0,28 | 0,32 | 0,35 | — | — | — | 10 | 29 |
| Unidireccional, bovedilla de hormigón | — | **0,19** | **0,21** | 0,23 | — | — | — | **80** | 29 |
| Unidireccional, hormigón de áridos ligeros (ρ ≤ 1 200 entre paréntesis) | — | 0,25 (0,22) | 0,27 (0,25) | 0,29 (0,27) | 0,31 (0,28) | — | — | 6 | 29 |
| Unidireccional, picón | — | — | 0,34 | 0,36 | — | — | — | 80 | 29 |
| Unidireccional, EPS mecanizada enrasada | — | 0,94 | 1,17 | 1,37 | — | — | — | 60 | 29 |
| Unidireccional, EPS moldeada enrasada | — | 0,80 | 0,88 | 0,95 | — | — | — | 60 | 29 |
| Unidireccional, EPS moldeada descolgada (canto estructural) | — | 1,42 | 1,50 | 1,57 | — | — | — | 60 | 29 |
| Reticular, casetón cerámico | — | 0,15 | 0,18 | 0,20 | — | — | — | 10 | 30 |
| Reticular, casetón de hormigón | — | 0,13 | 0,15 | 0,18 | 0,20 | 0,22 | — | 10 | 30 |
| Reticular, hormigón de áridos ligeros | — | 0,14 | 0,16 | 0,19 | 0,21 | 0,23 | — | 6 | 30 |
| Reticular, EPS mecanizada enrasada | — | 0,21 | 0,23 | 0,27 | 0,30 | 0,34 | — | 60 | 30 |
| Reticular, EPS moldeada enrasada | — | 0,20 | 0,22 | 0,25 | 0,29 | 0,32 | — | 60 | 30 |
| Reticular, EPS moldeada descolgada | — | 0,82 | 0,84 | 0,87 | 0,91 | 0,94 | — | 60 | 30 |
| Reticular, sin piezas (casetón recuperable) | — | **0,06** | **0,07** | 0,08 | — | — | — | 80 | 30 |
| Losa alveolar, sin o con capa de compresión (iguales) | 0,14 | 0,16 | 0,19 | 0,21 | 0,22 | — | 0,25 | 80 | 31 |
| Losa maciza HA, ρ 2 500 | 0,08 | 0,10 | **0,12** | 0,14 | 0,16 | — | 0,20 | 80 | 31 |
| Losa maciza, hormigón de áridos ligeros ρ 2 000 | 0,12 | 0,15 | 0,18 | 0,21 | 0,24 | — | 0,30 | 80 | 31 |

| # | Afirmación | Veredicto | Detalle |
|---|---|---|---|
| D.5 | El supuesto de hoy («forjado de HA de 30 cm, λ 2,3» → R 0,13) frente al CEC | ARITMÉTICA | Lado seguro frente a todos los unidireccionales (FU BH 300: 0,21; BC 300: 0,32; EPS ≥ 0,88), alveolar 300 (0,19) y reticular con piezas (≥ 0,15). **No es lado seguro** frente a reticular sin piezas (300: **0,07**) ni a losa maciza de 300 (0,12, casi igual). El CEC usa λ 2,5 para la losa (0,30/0,12) |
| D.6 | Para Glaser, el forjado entra como una capa con R directa | INTERPRETACIÓN + **K-CER.11** | El CEC da µ del conjunto: Sd = µ · canto (FU BH 300: 80 · 0,30 = 24 m). Es una aproximación: el forjado no es homogéneo |
| D.7 | El canto del CEC | INTERPRETACIÓN (ya en HR D.3) | Canto total (pieza + capa de 50 mm), salvo las descolgadas («canto estructural») |

---

## Bloque E. Ventanas (4.3.1, pp. 90–96)

### E.1 Estructura

| # | Afirmación | Veredicto | Detalle |
|---|---|---|---|
| E.1.1 | Seis tablas de ventana sencilla «sin capialzado», acristalamiento incoloro vertical: 4.3.1.1.1 metálico sin RPT (p. 90), .2 RPT 4–12 mm (p. 91), .3 RPT > 12 mm (p. 92), .4 madera (p. 93), .5 PVC dos cámaras (p. 94), .6 PVC tres cámaras (p. 95). 4.3.1.2 ventanas dobles (p. 96) | VERIFICADO (pp. 90, 92, 93, 95); LEÍDO (texto) pp. 91, 94, 96 | |
| E.1.2 | Cada tabla: cabecera con **Umarco**; filas vidrio sencillo 4–12, laminar 3+3 a 10+10, UVA (4…6)-**6/9/12/15/20**-(4…10) y UVA con laminar; columnas «vidrios normales» y «1 vidrio normal + 1 vidrio de baja emisividad», cada una con **fracción de marco 20 % y 40 %** (UH y FH/FS) | VERIFICADO | **No suponen dimensiones de ventana**: tabulan por fracción de marco. Nota (1): «Los valores para fracciones de marco comprendidas entre un 20 % y un 40 % se obtendrán por interpolación lineal.» (3): FH/FS para marcos oscuros, α = 0,8. (4): laminar con butiral de 0,36 mm. (6): UH y FH/FS valen también con laminar 10+10 |
| E.1.3 | Cómo se calculan | ARITMÉTICA | **UH = (1 − FM)·Ug + FM·Uf, sin término Ψ**, con Ug de 3.15.2 (vertical) y **redondeo al alza a la décima**. PVC 3c, 4-15-4 normal (Ug 2,7): 0,8·2,7 + 0,2·1,8 = 2,52 → **2,6**; 40 %: 2,34 → **2,4**; bajo emisivo (Ug 1,8): 1,80 y 1,80 ✓. Madera: 2,60 / 2,50 / 1,88 → 1,9 / 1,96 → 2,0 ✓ con Uf **2,2**. Metálico sin RPT: 3,30 / 3,90 / 2,58 → 2,6 / 3,36 → 3,4 ✓ |
| E.1.4 | «Baja emisividad» de las tablas de ventana = columna **0,2 ≥ ε > 0,1** de 3.15.2 (Ug 1,8 en 4-15 y 4-20) | ARITMÉTICA | Los Ug de 1,6 (0,1 ≥ ε > 0,03) y 1,4 (ε ≤ 0,03) **no tienen tabla de ventana** en el CEC |
| E.1.5 | **Dos erratas del CEC en las cabeceras** | VERIFICADO + ARITMÉTICA | (a) RPT > 12 mm: cabecera **Umarco 3,3** (p. 92); 3.16 da **3,2** (p. 26). La tabla está calculada con **3,2** (con 3,3, 4-15 al 20 % daría 2,82 → 2,9, y pone 2,8). (b) Madera: cabecera «**500 kg/m³**, Umarco 2,2» (p. 93); 3.16 da 2,2 para **700** kg/m³ y 2,0 para 500. La tabla está calculada con **2,2** (con 2,0, al 40 % daría 2,42 → 2,5, y pone 2,5… pero bajo emisivo 40 % daría 1,88 → 1,9, y pone 2,0). Usar 3.16 como dato y la tabla de ventana solo como contraste |

### E.2 Tabla 4.3.1.1.6, PVC tres cámaras (Umarco 1,8), VERIFICADO p. 95

UH [W/m²K] para FM 20 % / 40 %; FH/FS (un valor por bloque) al final.

| Tipo | Espesor | Normales 20 % | Normales 40 % | 1 BE 20 % | 1 BE 40 % |
|---|---|---|---|---|---|
| Sencillo | 4 / 6 / 8 / 10 / 12 | 5,0 / 4,9 / 4,9 / 4,8 / 4,8 | 4,2 / 4,1 / 4,1 / 4,1 / 4,0 | — | — |
| FH/FS sencillo | | 0,69 | 0,53 | | |
| Laminar | 3+3 / 4+4 / 6+6 / 8+8 / 10+10 | 4,9 / 4,8 / 4,7 / 4,6 / 4,5 | 4,1 / 4,1 / 4,0 / 3,9 / 3,8 | — | — |
| FH/FS laminar | | 0,65 | 0,50 | | |
| UVA (4…6)-c-(4…10) | c = 6 / 9 / 12 / 15 / 20 | 3,0 / 2,8 / 2,6 / 2,6 / 2,6 | 2,7 / 2,5 / 2,4 / 2,4 / 2,4 | 2,5 / 2,2 / 2,0 / 1,8 / 1,8 | 2,3 / 2,1 / 1,9 / 1,8 / 1,8 |
| FH/FS UVA | | 0,62 | 0,48 | 0,52 | 0,4 |
| UVA + laminar (4…6)-c-(4+4…6+6) | c = 6 / 9 / 12 / 15 / 20 | 2,9 / 2,7 / 2,6 / 2,5 / 2,5 | 2,6 / 2,5 / 2,4 / 2,3 / 2,3 | 2,5 / 2,2 / 2,0 / 1,8 / 1,8 | 2,3 / 2,1 / 1,9 / 1,8 / 1,8 |
| FH/FS UVA + laminar | | 0,62 | 0,46 | 0,45 | 0,35 |

### E.3 Tabla 4.3.1.1.3, metálico con RPT > 12 mm (cabecera Umarco 3,3; ver E.1.5), VERIFICADO p. 92

| Tipo | Espesor | Normales 20 % | Normales 40 % | 1 BE 20 % | 1 BE 40 % |
|---|---|---|---|---|---|
| Sencillo | 4 / 6 / 8 / 10 / 12 | 5,2 / 5,2 / 5,1 / 5,1 / 5,0 | 4,7 / 4,7 / 4,7 / 4,6 / 4,6 | — | — |
| FH/FS sencillo | | 0,70 | 0,55 | | |
| Laminar | 3+3 / 4+4 / 6+6 / 8+8 / 10+10 | 5,1 / 5,1 / 5,0 / 4,9 / 4,8 | 4,7 / 4,6 / 4,5 / 4,5 / 4,4 | — | — |
| FH/FS laminar | | 0,66 | 0,52 | | |
| UVA | c = 6 / 9 / 12 / 15 / 20 | 3,3 / 3,0 / 2,9 / 2,8 / 2,8 | 3,2 / 3,1 / 3,0 / 2,9 / 2,9 | 2,8 / 2,5 / 2,3 / 2,1 / 2,1 | 2,9 / 2,7 / 2,5 / 2,4 / 2,4 |
| FH/FS UVA | | 0,63 | 0,50 | 0,52 | 0,42 |
| UVA + laminar | c = 6 / 9 / 12 / 15 / 20 | 3,2 / 3,0 / 2,9 / 2,8 / 2,8 | 3,2 / 3,1 / 3,0 / 2,9 / 2,9 | 2,8 / 2,4 / 2,2 / 2,1 / 2,1 | 2,9 / 2,6 / 2,5 / 2,4 / 2,4 |
| FH/FS UVA + laminar | | 0,63 | 0,48 | 0,46 | 0,37 |

Referencia leída también: metálico sin RPT (p. 90), UVA 4-15: 3,3 / 3,9 / 2,6 / 3,4; madera (p. 93), UVA 4-15: 2,6 / 2,5 / 1,9 / 2,0.

### E.4 Cotejo con HE1

| # | Afirmación | Veredicto | Detalle |
|---|---|---|---|
| E.4.1 | `UG_REFERENCIA_CEC.doble_4_16_4` = 2,7 / 1,8 / 1,6 / 1,4 | **VERIFICADO**, coincide | 3.15.2, UVA vertical: 4-15 y 4-20 dan 2,7 (ε 0,89), 1,8 (0,2 ≥ ε > 0,1), 1,6 (0,1 ≥ ε > 0,03), 1,4 (ε ≤ 0,03) (p. 25). El CEC no tiene cámara de 16: 16 cae entre 15 y 20, que valen lo mismo. Matiz de nombres: `be_0_1` es «0,2 ≥ ε > 0,1» y `be_0_03` es «0,1 ≥ ε > 0,03» |
| E.4.2 | `UF_REFERENCIA_CEC` = 5,7 / 4,0 / 3,2 / 2,2 (700) / 2,0 (500) / 2,2 / 1,8 | **VERIFICADO**, coincide con 3.16 vertical (p. 26) | 3.16 también da Uf horizontal (7,2 / 4,5 / 3,5 / 2,4 / 2,1 / 2,4 / 1,9), solo para lucernarios (fuera de alcance) |
| E.4.3 | HE1 calcula UH por la ec. (10) del DA/1 (Ag·Ug + Af·Uf + lg·Ψ)/A, con FM 0,25 por defecto | INTERPRETACIÓN | Es **más exigente** que las tablas del CEC, que no llevan Ψ. Parte sin Ψ con el bajo emisivo del repo: 0,75·1,6 + 0,25·1,8 = **1,65**; HE1 le suma lg·Ψ/A. Mantener la ec. (10) (método vigente del DA/1 de 2020) y usar el CEC solo como contraste (con FM 0,25: interpolar 20/40 %) |
| E.4.4 | El marco que pide feature-26 (`ventana & { marco }`) | INTERPRETACIÓN | Siete marcos de 3.16 y la Ψ de la Tabla 10 del DA/1 por familia (madera/plástico, metálico con RPT, sin RPT), que ya tiene `PSI_HUECO_TABLA_10` |

---

## Bloque F. HS1: el GI del CEC frente a la tabla 2.7

### F.1 Lo que el repo usa hoy

`hs1/tablas.ts` (`CONDICIONES_FACHADA_TABLA_2_7`) da, por columna (con / sin revestimiento exterior) y grado, las opciones de condiciones; `aplicarHojaUnica` cambia C1 por C2 donde va la nota (1); `SUSTITUCION_FACHADA` (R 3, B 3, C 2, H 1, J 2, N 2) permite que un número mayor sustituya a uno menor. `hs1/decisiones.ts` guarda revestimiento con/sin, hojas una/dos y el índice de la opción. **No deduce las condiciones de la fachada real**: el usuario elige una opción de la casilla.

### F.2 El CEC define las mismas condiciones que el DB-HS1

VERIFICADO, p. 53 («4.2 Fachadas. Consideraciones previas»): B3 (revestimiento continuo intermedio estanco, o cámara ventilada de 3 a 10 cm por el lado exterior de un aislante no hidrófilo, con recogida del agua y aberturas ≥ 120 cm² por 10 m² de paño), B3′, R1, R2, R3, R3′ (paneles prefabricados con juntas estancas), C1 («½ pie de ladrillo cerámico, que debe ser perforado o macizo cuando no exista revestimiento exterior o cuando exista un revestimiento exterior discontinuo o un aislante exterior fijados mecánicamente; 12 cm de bloque cerámico, bloque de hormigón o piedra natural»), C1′ (paneles prefabricados de hormigón, muro de hormigón in situ, o elemento ligero estanco), N1, N2, J1, J1′, J2. Las definiciones de B1, B2, C2 y H1 estarán en la p. 52 (**PENDIENTE**, no renderizada). **Corrección 2026-10-09:** la p. 52 es «Cubiertas 16» (C 14.5 y C 14.6, final de 4.1.14), VERIFICADO en imagen; B1, B2, C2 y H1 no están ahí (ver PENDIENTES).

### F.3 Cotejo fachada a fachada

| Fachada | Rasgos HS1 (INTERPRETACIÓN) | GI CEC | GI por la tabla 2.7 con esos rasgos | ¿Coincide? |
|---|---|---|---|---|
| F 3.1 | Con revestimiento (continuo R1, o R3 si se declara); dos hojas; AT no hidrófilo por el interior → **B1**; ½ pie → **C1** | R1 → 3; R3/B3 → 5 | R1+B1+C1 → **3**; R3+C1 → **5** | Sí |
| F 3.2 | Ídem + cámara sin ventilar por fuera del AT → **B2** | R1 → 4 | R1+B2+C1 → **4** | Sí |
| F 3.4 | Ídem con SP 10 + AT por el interior → **B2** si el AT es no hidrófilo | R1 → 4 | R1+B2+C1 → **4**. **Pero la lana mineral del trasdosado** (necesaria para el RA del HR, nota 8) **suele ser hidrófila** → solo B1 (la cámara) → **3**, que es lo que dice la nota (1) del 4.2.3 (−1 grado) | Sí, si el AT es no hidrófilo; con lana normal, 3 |
| F 3.5 | Con revestimiento; dos hojas; B1; **1 pie → C2** | R1 → **3** | R1+B1+C2 → **4** | **No.** El CEC es más conservador. Además el propio CEC da 4 a la equivalente con revestimiento discontinuo (F 6.5, p. 68). Probable errata del CEC |
| F 1.1 | Sin revestimiento; dos hojas; B1; C1; J y N del dato de entrada; H1 con la nota (2) | J1 N1 → 2; J2 N2 (H1) → 3; B3 → 5 | B1+C1+J1+N1 → **2**; B1+C1+H1+J2+N2 → **3**; B3+C1 → **5** | Sí |
| F 1.2 | Sin revestimiento; B2; C1 | J1 N1 → 3; J2 N2 (H1) → 4 | B2+C1+J1+N1 → **3**; B2+C1+H1+J2+N2 → **4** | Sí |
| F 4.1, F 4.3 | Con revestimiento (R1 sobre aislante: armado con malla); **una hoja**; AT no hidrófilo por el exterior → **B2**; C1 | R1 → 4; R3 → 5 | R1+B2+C1 → **4** (sin nota (1) en esa opción); R3+C1 → **5** | Sí |
| F 4.2 | Ídem con 1 pie → C2 | R1 → 5 | R1+B2+C2 → **5** | Sí |
| F 8.1 | Con revestimiento discontinuo fijado mecánicamente → **R2**; una hoja; AT exterior → B2; C1 (LP perforado o macizo) | R2 → **4**; R3/B3 → 5 | R2+B1+C1 (B2 sustituye a B1) → **5**; y la cámara ventilada con AT no hidrófilo es **B3** → 5 | **No.** El CEC da 4. Solo cuadra si el aislante es hidrófilo (lana mineral sin hidrofugar): entonces no hay B2 ni B3 y queda R2+C1 → 4, que además lleva la nota (1) (una hoja → C2). INTERPRETACIÓN |
| F 2.1, F 7.3 | Cámara ventilada con AT no hidrófilo → **B3**; C1 | 5 | B3+C1 → **5** | Sí |

| # | Afirmación | Veredicto | Detalle |
|---|---|---|---|
| F.4.1 | **El GI del CEC no debe importarse como verdad para HS1** | INTERPRETACIÓN + **K-CER.12** | En dos de las once comprobadas (F 3.5, F 8.1) el CEC da un grado menos que la tabla 2.7 con los mismos rasgos. La exigencia es la del DB-HS1. El catálogo guarda los **rasgos**, HS1 deduce el grado con su tabla 2.7 y el GI del CEC queda como contraste (aviso si difieren) |
| F.4.2 | Rasgos que el catálogo debe guardar por fachada | INTERPRETACIÓN | **hojas** (1 o 2; el trasdosado de PYL cuenta como hoja interior: la leyenda de 4.2.3 lo llama «HI hoja interior … YL», p. 59); **revestimiento exterior**: ninguno / continuo / discontinuo pegado (< 300 mm) / discontinuo fijado mecánicamente / de escamas, lamas o placas, con su **R por defecto** (1, 1, 2, 3); **B propio**: 0, 1 (AT no hidrófilo interior, o cámara sin ventilar), 2 (cámara + AT no hidrófilo interior, o AT no hidrófilo exterior), 3 (cámara ventilada con AT no hidrófilo, o revestimiento intermedio estanco); **C**: 1 o 2 según espesor y pieza; **aislante hidrófilo** sí/no (cambia B y aplica la nota (1)); **N** (RM: N1 si enfoscado ≥ 10 mm, N2 si hidrófugo ≥ 15 mm); y **J** y **H** como declaraciones del proyectista (J1 y sin H por defecto) |
| F.4.3 | Con esos rasgos, `fachadaRevestimiento` y `fachadaHojas` de HS1 salen del catálogo, como pide feature-26. Además, HS1 puede **elegir sola la opción** que la fachada ya cumple (la primera de la casilla cuyas condiciones están todas cubiertas por los rasgos, con la sustitución del ap. 2.3.2 pto 2) en lugar de `fachadaOpcion: 0` | INTERPRETACIÓN | Si ninguna opción se cumple, HS1 lista lo que falta (p. ej. «R3: revestimiento estanco»), que es más útil que hoy |
| F.4.4 | Texto de B2 en el DB | **PENDIENTE** | Comprobar en el DB-HS1 si B2 exige «la cámara por el lado exterior del aislante» (el resumen de `hs1/condiciones.ts` no lo dice). Afecta a F 3.2 y F 3.4 (en las dos la cámara está por fuera del AT, así que cumplen en cualquier caso) |

---

## Bloque G. Modelo de datos propuesto (descripción, sin código)

### G.1 Entrada del catálogo común: fachada

- **Identidad y cita**: `id`, `codigo` («F 3.2»), `apartado` («4.2.3»), `pagina` (59), `nombre` corto, `industrial` (valor orientativo o con garantía legal; aviso 2 del preámbulo).
- **capas** (de interior a exterior), cada una con: `rol` (RI, HI, AT, C, SP, RM, HP, RE), `material` (clave de la tabla de materiales CEC), `espesor_mm` o `variable: true` (solo el AT), `minimo` si la sección dice «≥» (K-CER.4), y **una** de estas fuentes térmicas: `R_m2K_W` (fábricas de 3.17, forjados de 3.18, cámaras del DA/1) o `lambda` (morteros, yesos, PYL, aislantes). `mu` del CEC. `fueraDelCalculo: true` para la cámara muy ventilada y lo que queda por fuera.
- **he**: `R0_CEC` (con variantes AD/AL, D1800/D1500 cuando la tabla las da), `camara`: `"no" | "sin_ventilar" | "ventilada"`, y la tabla de la nota (9) si procede. El motor calcula por capas y usa `R0_CEC` como contraste en los tests (B.3.2).
- **hr**: lo que ya tiene `SolFachada` (RA, RAtr, m mínimo [medio], clase, hoja interior, aislamiento exterior, hoja principal K-CEC.5).
- **hs1**: `hojas`, `revestimiento` (tipo) y `R` por defecto, `B`, `C`, `aislanteHidrofilo` por defecto según el material del AT, `N`; `giCEC`: lista de pares {dato de entrada → GI} solo para contraste.
- **aislante**: material por defecto, λ por defecto (K-CER.6), y el espesor que decide HE1 (por tipo de fachada, como dice el plan).

### G.2 Cubierta

- `codigo`, `pagina`, `tipo` (plana transitable fija / flotante / no transitable grava / inclinada sobre forjado inclinado / inclinada ventilada sobre forjado horizontal), `posicionAislante` (convencional / invertida), `R0_paquete` (0,27; 0,25; 0,19; 0,23 o 0,45; C.1.4), la **referencia al forjado de El edificio** (K-CER.10), `pendientesLigero` (para el +2 dBA del HR), y para HS1 la protección y la posición del aislante (lo que ya usa `hs1/decisiones.ts`). Capas: paquete por encima del forjado como capas con R conocida solo si se quiere Glaser con detalle; si no, una capa «paquete» con R = R0_paquete − Rsi − Rse y su Sd declarado.

### G.3 Forjado

`tipo` (unidireccional / reticular / alveolar / losa), `pieza` (cerámica, hormigón, ligero, picón, EPS mecanizada, moldeada enrasada, descolgada, sin piezas), `canto_mm`, `R`, `mu`, `m`, `RA`, `RAtr`, `Lnw`, `eps` (ΔLw + 4 dB), con la tabla de D por fila.

### G.4 Ventana

`marco` (siete de 3.16, con Uf vertical), `familiaPsi` (Tabla 10 del DA/1), vidrio (Ug de 3.15.2), apertura y clase (HR, 4.3.2), dimensiones (ec. 10), y la tabla 4.3.1 de su marco solo como contraste.

### G.5 Criterios nuevos (a validar; numeración a continuación de K-CER.1–3 del plan)

| # | Caso | Propuesta | Por qué |
|---|---|---|---|
| K-CER.4 | Espesores con «≥» en la sección | Tomar el mínimo: RE ≥ 15 → 15 mm; C ventilada ≥ 30 → 30 mm (no cuenta en U). Tolerancia de los tests R0 capas frente a CEC: 0,02 m²K/W | A.1, B.3 |
| K-CER.5 | Fábricas | Entran con la **R de 3.17** al G más bajo (LP ½ pie 0,18; 1 pie 0,35; LHD 0,16; BH AD 140 0,19), no con un λ. El usuario puede declarar G o la R del fabricante | B.3.3; es lo que hace el CEC |
| K-CER.6 | Aislante por defecto y su λ | SATE: EPS λ **0,039** (el «valor recomendado» del CEC); dos hojas con AT por el interior: XPS (el repo usa 0,034, dentro del rango 0,039–0,033 del CEC); trasdosado (F 3.4) y fachada ventilada: lana mineral (el CEC da 0,050–0,031; el repo 0,035) marcada **hidrófila** por defecto. Siempre editable y rotulado «orientativo, sustituir por el del fabricante» | A.1, F.3 |
| K-CER.7 | m, RA y RAtr frente a e_AT | Son de la solución y no dependen de e_AT (confirma K-CER.3). El único valor ligado a un espesor de aislante visto es C 5.9 (chapa grecada, nota 5: «lana mineral con espesor de 80 mm»), que no se ofrece | p. 41 |
| K-CER.8 | Cámara sin ventilar | R de la Tabla 2 del DA/1 interpolada por espesor (30 mm → 0,173; 10 mm → 0,15). El CEC usa 0,17 | B.1 |
| K-CER.9 | Cámara ventilada | Por defecto «muy ventilada» (las del CEC cumplen B3: ≥ 120 cm² por 10 m²): fuera del cálculo, Rse = 0,13. Si el usuario declara ventilación parcial, la nota (9) del CEC | A.4 |
| K-CER.10 | Forjado de la cubierta | El de El edificio (`cerramientos.forjado`): R0 = R0_paquete + R del forjado (3.18, tipo y canto); RAtr = el del forjado (+2 dBA con pendientes de hormigón ligero) | C.1.4, C.1.6 |
| K-CER.11 | Forjado en Glaser | Una capa con R de 3.18 y Sd = µ·canto | D.6 |
| K-CER.12 | Grado de impermeabilidad | HS1 lo deduce de los rasgos con la tabla 2.7; el GI del CEC solo como contraste, con aviso si difiere | F.4.1 |
| K-CER.13 | Bloque de hormigón y picón | Por defecto áridos densos (valores (3)/(5)) y picón de 1 800 kg/m³; el ligero, opción | A.2.4, A.3.8 |
| K-CER.14 | Proyecto sin `cerramientos` | HE1 conserva sus composiciones de hoy, con sus λ, para que no cambie ningún veredicto; la corrección de B.3.3 se aplica solo a los proyectos con `cerramientos` (o se acepta el cambio y se dice en la ficha). Decisión del usuario | B.3.3, B.3.4 |
| K-CER.15 | Fachada habitual | **F 3.2**, no F 3.1: es la composición que hoy calcula HE1 (con cámara) y tiene los mismos RA/RAtr/m que F 3.1 en HR | A.3.1 |

Criterios propuestos en el bloque H (a validar): **K-CER.16** (tierra de la ajardinada), **K-CER.17** (capa de rodadura sin solución del CEC), **K-CER.18** (aislante de la lámina autoprotegida adherida). Ver H.6.

---

## Bloque H. Cubiertas para las tres protecciones de HS1 que faltan (2026-10-09)

**Encargo:** ¿tabula el CEC una cubierta con **capa de rodadura** (transitable para vehículos), con **lámina autoprotegida** (no transitable) y **ajardinada** (tierra vegetal), para añadirlas al catálogo común como C 1.3, C 2.3 y C 5.3? Fila sobre forjado unidireccional con bovedilla de hormigón (FU BH).

**Lectura.** Imagen PNG de 1 653 × 2 339 px (200 ppp sobre A4) de las pp. 14, 37, 38, 39, 40, 42, 43, 44, 47, 48, 50, 51 y 52 del CEC CAT-EC-v06.3 («Versión preliminar: Marzo 10. Borrador»). Son los renders del mismo archivo hechos en una sesión anterior (scratchpad de la sesión 3ecb9da7, `cec/pNNN.png`); en esta sesión no había shell para volver a descargar el PDF, así que no se ha re-renderizado: se han leído esas imágenes. Para localizar términos en todo el catálogo se ha usado el texto extraído completo de la sesión b82be346 (`hr/cec_texto.txt`); lo que solo sale de ahí va como LEÍDO (texto).

### H.1 Las catorce tablas de 4.1 (pp. 37 a 52)

Constante del paquete = R0 de la fila − R del forjado de 3.18 de 250 mm (BP 0,80; BC 0,28; BH 0,19; CP 0,20; CC 0,15; CH 0,13; SC 0,06; L 0,08 con losa de 200), como en C.1.4.

| Apartado, página | Cabecera del CEC (título y recuadro) | Posición del aislante | Fila FU BH: código y R0 | Constante del paquete (ARITMÉTICA, todas las filas) | Nota HR | Veredicto |
|---|---|---|---|---|---|---|
| 4.1.1, p. 37 | «Plana transitable. No ventilada. Solado fijo»; «CUBIERTA PLANA Transitable peatón · SIN CÁMARA» | Convencional e invertida | C 1.3: 0,46 | 0,27 (C.1.4) | (4): 3.18 + 2 dBA | VERIFICADO |
| 4.1.2, p. 38 | «Plana transitable. No ventilada. Solado flotante»; «Transitable peatón · SIN CÁMARA» | Invertida | C 2.3: 0,44 | 0,25 (C.1.4) | (4): 3.18 + 2 dBA | VERIFICADO |
| 4.1.3, p. 39 | «Plana transitable. Ventilada. Solado fijo»; «Transitable peatón · CON CÁMARA VENTILADA» | Convencional | C 3.3: 0,66 ligeramente / 0,42 muy ventilada | **0,47 / 0,23** en las ocho (1,27/0,75/0,66/0,67/0,62/0,60/0,53/0,55 y 1,03/0,51/0,42/0,43/0,38/0,36/0,29/0,31) | (6): 3.18 + 2 dBA «cuando la cubierta tenga una capa de formación de pendientes de hormigón con áridos ligeros»; aquí FP es «con tablero cerámico o de hormigón» | VERIFICADO; ARITMÉTICA |
| 4.1.4, p. 40 | «Plana transitable. Con cámara. Solado flotante»; «Transitable peatón · CON CÁMARA» (C: «cámara de aire, ventilada o no ventilada», bajo el solado sobre soportes S) | Convencional e invertida | C 4.3: 0,48 | **0,29** en las ocho (1,09/0,57/0,48/0,49/0,44/0,42/0,35/0,37) | (4): 3.18 + 2 dBA; FP de hormigón con áridos ligeros | VERIFICADO; ARITMÉTICA |
| 4.1.5, p. 41 | No transitable, grava | Conv. e inv. | C 5.3: 0,44 | 0,25 (C.1.4) | (4) + 2 dBA | VERIFICADO (sesión anterior) |
| **4.1.6, p. 42** | «**Plana no transitable. No ventilada. Autoprotegida**»; «CUBIERTA PLANA No Transitable · SIN CÁMARA · Convencional · Autoprotegida o con lámina vista» | **Solo convencional** | **C 6.3: 0,42** | **0,23** en las ocho (1,03/0,51/0,42/0,43/0,38/0,36/0,29/0,31) | (4): 3.18 + 2 dBA; FP de hormigón con áridos ligeros | VERIFICADO; ARITMÉTICA |
| **4.1.7, p. 43** | «**Plana no transitable. No ventilada. Ajardinada**»; «CUBIERTA PLANA No Transitable · SIN CÁMARA · Convencional e Invertida · Ajardinada» | Convencional e invertida | **C 7.3: 1,01** | **0,82** en las ocho (1,62/1,10/1,01/1,02/0,97/0,95/0,88/0,90) | (4): 3.18 + 2 dBA; FP de hormigón con áridos ligeros | VERIFICADO; ARITMÉTICA |
| 4.1.8, p. 44 | «Plana no transitable. Ventilada. Autoprotegida»; «No transitable · CON CÁMARA VENTILADA (con aislante) · Convencional · Autoprotegida o con lámina vista» | Convencional | C 8.3: 0,62 ligeramente / 0,42 muy ventilada | **0,43 / 0,23** en las ocho (1,23/0,71/0,62/0,63/0,58/0,56/0,49/0,51 y 1,03/0,51/0,42/0,43/0,38/0,36/0,29/0,31) | (6): 3.18 + 2 dBA con FP de hormigón ligero; aquí FP es «de tablero cerámico o de hormigón» | VERIFICADO; ARITMÉTICA |
| 4.1.9, pp. 45–46 | Inclinada, forjado inclinado, tejas | Conv. e inv. | C 9.3: 0,38 | 0,19 (C.1.4) | (5): 3.18 sin +2 | VERIFICADO (sesión anterior) |
| 4.1.10, p. 47 | «Inclinada. Forjado/tablero inclinado. No ventilada. Autoprotegida» | Convencional | C 10.3: 0,36 | **0,17** (BP 0,97; BC 0,45; BH 0,36; L 0,25) | (4): 3.18 **sin** +2 (SR hace la pendiente). C 10.5 y C 10.6 (tablero cerámico TS) con HR propio: 152/41/39 y 149/44/40 | VERIFICADO; ARITMÉTICA |
| 4.1.11, p. 48 | «Inclinada. Forjado inclinado. Ventilada. Con capa de protección» (tejas, pizarra, placas y perfiles metálicos; tablero de madera) | Convencional | C 11.3: 0,59 / 0,42 | **0,40 / 0,23** (BP 1,20/1,03; BC 0,68/0,51; BH 0,59/0,42; L 0,48/0,31) | (6): 3.18 **sin** +2 | VERIFICADO; ARITMÉTICA |
| 4.1.12, p. 49 | Inclinada ventilada sobre forjado horizontal | Conv. | C 12.3 | 0,23 / 0,45 (C.1.4) | (6) + 2 dBA | VERIFICADO (sesión anterior) |
| 4.1.13, p. 50 | «Inclinada. Ligera. No ventilada»: panel sándwich | — (no hay forjado) | — | U = 1/(0,14 + R_AA) a 1/(0,38 + R_AA + R_AB); HR propio (C 13.4: 63/51/48) | — | VERIFICADO |
| 4.1.14, pp. 51–52 | «Inclinada. Entramado estructural de madera. Ventilada» | — (no hay forjado) | — | 1,38/(1,07 + R_AT), 1,24/(1,24 + R_AT), 1,3/(1,34 + R_AT); nota (4) «para λ = 0,035» | HR propio (5): solo con lana mineral | VERIFICADO |

| # | Afirmación | Veredicto | Detalle |
|---|---|---|---|
| H.1.1 | **El CEC no tiene ninguna cubierta para tráfico de vehículos (capa de rodadura).** Las cuatro planas transitables (4.1.1 a 4.1.4) dicen «**Transitable peatón**» en el recuadro y sus protecciones son solado fijo o flotante | VERIFICADO | pp. 37, 38, 39, 40. El resto de 4.1 (4.1.5 a 4.1.14, pp. 41 a 52) son no transitables o inclinadas. 4.1 termina en la p. 52 (C 14.6); la p. 53 ya es «4.2 Fachadas» |
| H.1.2 | La única mención a vehículos en todo el CEC está en 3.20 (impermeabilizaciones), no en una solución: «(9) En el caso de cubiertas planas transitables para vehículos, la capa de impermeabilización bituminosa ha de ser bicapa y cumplirá con las siguientes propiedades: …» | LEÍDO (texto), p. 34 | Búsqueda en el texto completo de «vehículo», «rodadura», «aglomerado» y «asfalto»: solo esa nota y «Asfalto» como material (tablas de materiales, p. 23). La p. 34 no está renderizada |
| H.1.3 | Ni 4.1.10 ni 4.1.11 sirven para la tabla 2.9 del DB-HS1: son inclinadas (autoprotegida sobre forjado inclinado y tejado ventilado) | VERIFICADO | pp. 47, 48. La lámina autoprotegida inclinada (C 10.3) queda fuera de este encargo |

### H.2 Soluciones utilizables (fila FU BH)

Capas de **interior a exterior** (leyenda del CEC: SR soporte resistente; FP formación de pendientes; B barrera contra el vapor; AT aislante; Cs capa separadora; I impermeabilización; Csa capa separadora bajo protección; D capa drenante; Fi capa filtrante; P protección; C cámara de aire ventilada). R0_paquete = R0 de la fila − 0,19 (FU BH 250). RAtr con el forjado FU BH 300 de El edificio: RA 55, RAtr 50, m 372 (`verificacion-hr-cec.md` D.8, CEC p. 29).

| # | Código, página | Descripción (CEC) | Capas (int → ext) | R0 CEC → R0_paquete | RA / RAtr (FU BH 300) | Veredicto |
|---|---|---|---|---|---|---|
| H.2.1 | **C 6.3**, p. 42 (4.1.6) | Plana **no transitable**, no ventilada (sin cámara), **autoprotegida o con lámina vista**. **Solo convencional**: la cabecera dice «Convencional» y hay una sola sección; no hay versión invertida | SR · FP (hormigón con áridos ligeros) · B (solo si hay riesgo de condensación según el DB HE-1) · AT («soldable en el caso de que la capa de impermeabilización fuera adherida») · I («adherida o fijada mecanicamente. Autoprotegida en el caso de que sea de un material bituminoso»). No lleva Cs, Csa ni P | **0,42 − 0,19 = 0,23** (constante en las ocho filas) | 55 + 2 = **57** / 50 + 2 = **52** | VERIFICADO (capas, R0, nota); ARITMÉTICA (constante y RAtr) |
| H.2.2 | **C 7.3**, p. 43 (4.1.7) | Plana **no transitable**, no ventilada (sin cámara), **ajardinada**. Convencional e invertida | Convencional: SR · FP (hormigón con áridos ligeros) · B (solo si hay riesgo) · AT · Cs · I · Csa · D · Fi · P («capa de protección de tierra»). Invertida: SR · FP · Cs · I · Csa · AT · Csa · D · Fi · P | **1,01 − 0,19 = 0,82** (constante en las ocho filas). Ver H.4 | **57** / **52** | VERIFICADO (capas, R0, nota); ARITMÉTICA; INTERPRETACIÓN (qué espesor de tierra hay dentro del 0,82) |
| H.2.3 | C 8.3, p. 44 (4.1.8). **Alternativa**, no se propone por defecto | Plana no transitable, **ventilada** (cámara con aislante), autoprotegida o con lámina vista. Solo convencional | SR · AT · C (ventilada, 30 > Ss/Ac > 3) · FP («de tablero cerámico o de hormigón») · I (adherida; autoprotegida si es bituminosa) | 0,62 − 0,19 = **0,43** ligeramente ventilada (500 < S ≤ 1 500 mm²/m²); 0,42 − 0,19 = **0,23** muy ventilada (S > 1 500) | 55 / **50** (sin +2: el FP es de tablero, no de hormigón ligero) | VERIFICADO (capas, R0); ARITMÉTICA; INTERPRETACIÓN (el +2 no aplica) |

### H.3 Acústica: la nota de 4.1.6 y 4.1.7

| # | Afirmación | Veredicto | Detalle |
|---|---|---|---|
| H.3.1 | m, RA y RAtr remiten a 3.18 y **se suman 2 dBA por la formación de pendientes de hormigón con áridos ligeros**. Texto de la nota (4), igual en las dos páginas: «Para obtener los valores de m, RA y RAtr de cubiertas, se utilizarán los valores de m, RA y RAtr de forjados y losas del apartado 3.18. Cuando la cubierta tenga una capa de formación de pendientes de hormigón con áridos ligeros, el valor de los índices RA y RAtr del forjado se incrementará 2 dBA.» Sigue el párrafo del techo suspendido (suma de ΔRA y ΔRAtr, 4.5.2.1) | VERIFICADO | 4.1.6 nota (4), p. 42; 4.1.7 nota (4), p. 43. La leyenda FP de las dos es «formación de pendientes de hormigón con áridos ligeros» → **pendientesLigero: sí** en C 6.3 y C 7.3 |
| H.3.2 | RAtr con FU BH 300: **50 + 2 = 52 dBA** (RA 57) en las dos | ARITMÉTICA (regla H.3.1 con D.8 de la verificación HR) | Igual que C 1.3, C 2.3 y C 5.3 del catálogo. La masa de la tierra de la ajardinada no se cuenta (el CEC no la da): queda del lado seguro |
| H.3.3 | C 6.9 (chapa grecada, p. 42) lleva HR propio: m 15, RA 38, RAtr 31, nota (5) «Valor para cubiertas con lana mineral con espesor de 80 mm». No es una fila sobre forjado | VERIFICADO | No se propone (como C 5.9, K-CER.7) |
| H.3.4 | En 4.1.3 y 4.1.8 (ventiladas) la nota (6) es la misma, pero el FP de su leyenda es de **tablero** («con tablero cerámico o de hormigón», «de tablero cerámico o de hormigón»), no de hormigón ligero; por la letra de la nota, no se suman los 2 dBA | VERIFICADO (texto de la leyenda y la nota); INTERPRETACIÓN (que no aplique) | pp. 39, 44 |

### H.4 Notas relevantes

| # | Afirmación | Veredicto | Detalle |
|---|---|---|---|
| H.4.1 | **Pendiente de C 6.3: entre el 1 y el 5 %** (nota (2), p. 42: «La pendiente de la cubierta estará comprendida entre el 1 y el 5%»). La tabla 2.9 del DB-HS1 admite para la lámina autoprotegida del 1 al **15 %** (`hs1/tablas.ts`) | VERIFICADO (CEC); cotejo con el repo, DB no releído aquí | No hay contradicción: el CEC tabula una solución más estrecha. Si el usuario declara más del 5 % con lámina autoprotegida, HS1 puede cumplir, pero la cubierta **ya no es la C 6.3 del CEC** (aviso, no fallo) |
| H.4.2 | **Pendiente de C 7.3: entre el 1 y el 5 %** (nota (2), p. 43). Coincide con la tabla 2.9 para tierra vegetal (1–5 %, `hs1/tablas.ts`) | VERIFICADO | |
| H.4.3 | Barrera de vapor: «Sólo si hay riesgo de condensación según lo dispuesto en el Documento Básico DB HE-1» (4.1.6, leyenda B); en 4.1.7, «barrera contra el vapor en cubierta convencional. Sólo si hay riesgo …» | VERIFICADO | pp. 42, 43. Igual que 4.1.1: la decide Glaser de HE1 |
| H.4.4 | Ajardinada: P «capa de protección de tierra», Fi «capa filtrante», D «capa drenante», Csa «capa separadora bajo protección». Es lo que HS1 ya pide para la tierra vegetal (`hs1/cubierta.ts`: «con capa drenante y capa filtrante») | VERIFICADO | p. 43. 3.20 trae además la propiedad «resistencia a la penetración de raíces» de la lámina (nota (5)), LEÍDO (texto), p. 34 |
| H.4.5 | **El CEC clasifica la ajardinada como no transitable**: recuadro «CUBIERTA PLANA No Transitable … Ajardinada» y título «Plana no transitable. No ventilada. Ajardinada» | VERIFICADO | p. 43. Respalda el criterio del repo de tratarla con las no transitables (`ajardinadaCriterio`). En la tabla 2.9 del DB-HS1 la ajardinada sigue siendo un uso aparte (con sus pendientes propias), así que el rótulo «criterio» puede quedarse, ahora citando el CEC |
| H.4.6 | Lámina autoprotegida: el CEC llama «autoprotegida» a la lámina **bituminosa** con autoprotección; el recuadro dice «Autoprotegida **o con lámina vista**» (sintéticas sin protección) | VERIFICADO | p. 42. La tabla 2.9 del DB-HS1 solo nombra la «lámina autoprotegida» |
| H.4.7 | Con la lámina **adherida**, el aislante tiene que ser **soldable** (leyenda AT de 4.1.6). El XPS por defecto de las otras cubiertas no admite soldeo a llama: lo normal es lana mineral de alta densidad o PIR revestido | VERIFICADO (leyenda); INTERPRETACIÓN (qué aislantes lo son) | Propuesta K-CER.18 en H.6 |
| H.4.8 | Solo convencional: el catálogo de hoy solo distingue `soloInvertida`. Para C 6.3 (y C 8.3) haría falta lo contrario (solo convencional) para que El edificio no ofrezca la invertida. `hs1/textos.ts` ya omite «convencional/invertida» cuando la protección es la lámina autoprotegida | VERIFICADO (CEC); INTERPRETACIÓN (modelo) | Delegar en motor-calculo: p. ej. `posiciones: ["convencional"]` o `soloConvencional: true` |

### H.5 Tierra de la ajardinada: qué hay dentro del 0,82

| # | Afirmación | Veredicto | Detalle |
|---|---|---|---|
| H.5.1 | La constante de C 7.3 (0,82) es **0,59 mayor** que la de la lámina autoprotegida (0,23) y 0,57 mayor que la de la grava (0,25). El CEC no acota el espesor de tierra ni de las capas D y Fi | ARITMÉTICA; VERIFICADO (la sección no tiene cotas) | p. 43 |
| H.5.2 | Con la tierra vegetal del CEC, **λ = 0,52** (ρ ≤ 2 050; cp 1 840; 3.1.1, p. 14), esos 0,59 equivalen a unos **0,31 m de tierra** (0,59 × 0,52), algo menos si D y Fi aportan R | VERIFICADO (λ); INTERPRETACIÓN (el espesor implícito) | Es una ajardinada intensiva. Con una extensiva de 10 cm de sustrato la constante sería del orden de 0,23 + 0,10/0,52 ≈ **0,42**, no 0,82: tomar el 0,82 del CEC **no va del lado seguro** si la tierra es fina |

### H.6 Propuesta para el catálogo y criterios nuevos

| Protección HS1 (tabla 2.9) | Solución | Tipo de El edificio | Nombre propuesto | soloInvertida | R0_paquete | pendientesLigero | RAtr (FU BH 300) | Veredicto |
|---|---|---|---|---|---|---|---|---|
| `lamina_autoprotegida` | **C 6.3**, p. 42, 4.1.6 | `plana_no_transitable` | «Plana no transitable, con lámina autoprotegida» | **No** (y además **solo convencional**: H.4.8) | **0,23** | Sí | **52** | VERIFICADO; ARITMÉTICA |
| `tierra_vegetal` | **C 7.3**, p. 43, 4.1.7 | `plana_no_transitable` (el CEC también la llama no transitable, H.4.5) | «Plana ajardinada, no transitable» | No (convencional e invertida) | **0,82** del CEC; ver K-CER.16 | Sí | **52** | VERIFICADO; ARITMÉTICA; INTERPRETACIÓN (H.5) |
| `capa_rodadura` | **Ninguna**: el CEC no la tabula (H.1.1) | `plana_transitable` | — | — | — | — | — | **NO TABULADA** en el CEC (pp. 37 a 52 leídas en imagen) |

| # | Caso | Propuesta | Por qué |
|---|---|---|---|
| K-CER.16 | Tierra de la ajardinada | Usar el 0,82 del CEC solo si el proyecto declara **≥ 30 cm de tierra**; si no, R0_paquete = **0,23 + e_tierra/0,52** (base de la lámina de 4.1.6 más la tierra con el λ del CEC, 3.1.1), con e_tierra declarado y 0 por defecto. En la ficha: «C 7.3 del CEC; R de la tierra por espesor declarado (criterio)». Decisión del usuario | H.5 |
| K-CER.17 | Capa de rodadura | No hay solución del CEC. Opciones: (a) no ofrecerla en el catálogo de El edificio y que HS1 la admita solo como declaración del proyectista, sin cubierta del CEC; (b) una entrada **marcada como criterio, sin código CEC**, por analogía con C 1.3 (P = capa de rodadura de hormigón o aglomerado sobre MA), con R0_paquete 0,27 (lado seguro: la rodadura de hormigón tiene más R que el solado, y no se cuenta), RAtr 52 y lámina bituminosa **bicapa** (3.20 nota (9), texto). Decisión del usuario | H.1.1, H.1.2 |
| K-CER.18 | Aislante de C 6.3 | Por defecto, **lana mineral de alta densidad** (o PIR revestido), con λ orientativo del CEC y el aviso «soldable si la lámina va adherida»; no XPS | H.4.7 |

---

## Correcciones o matices al plan de feature-26.md

1. **La fachada habitual debe ser F 3.2, no F 3.1.** La de HE1 lleva cámara de 30 mm (F 3.2, R0 0,71); F 3.1 no tiene cámara (R0 0,54). En HR valen lo mismo (48 [49] / 45 [46] / 220 [240]), así que HR no cambia; en HS1, F 3.2 da B2 (grado 4 con R1) y F 3.1 B1 (grado 3). (A.3.1, K-CER.15)
2. **Los λ de fábrica de HE1 no son los del CEC y no van del lado seguro**: LP 0,49 y LH 0,32 dan R 0,235 y 0,219; el CEC da **R 0,18 y 0,16** (3.17, p. 26). La fachada de hoy tiene ≈ 0,10 m²K/W de más. El aislante habitual no cambia en ninguna zona, pero un espesor fijado al límite sí puede cambiar de veredicto. Decidir K-CER.14. (B.3.3, B.3.4)
3. **El cálculo por capas sí reproduce el CEC** (|Δ| ≤ 0,011 en 13 fachadas) con las R de fábrica del CEC. HE1 puede seguir por capas y usar R0 del CEC como test. (B.3)
4. **El CEC da R de las fábricas y de los forjados, no λ.** El catálogo debe admitir capas con R directa (ya existe `resistencia_m2K_W` en `CapaInput`). (A.1, D)
5. **La U de la cubierta depende del forjado** (el CEC la tabula con forjados de 250 mm). Propuesta: cubierta = paquete + forjado de El edificio; los dos ids de cubierta de HR que llevan forjado fijo (C 1.3 con 300, «4.1.9» con 250) pasan a ser paquetes. (C.1.4, K-CER.10)
6. **El forjado cambia la R del suelo de HE1**: FU BH 300 = 0,21; reticular sin piezas 300 = 0,07 (por debajo del 0,13 de hoy). El supuesto actual no es lado seguro con reticular sin piezas. (D.5)
7. **El GI del CEC no es fiable para HS1**: F 3.5 y F 8.1 salen un grado por debajo de la tabla 2.7. HS1 debe deducir el grado de los rasgos; el plan («fachadaHojas y fachadaRevestimiento salen de la fachada») se queda corto: hacen falta también B, C, hidrofilia del aislante y N. (F.3, F.4)
8. **F 3.4 con lana mineral normal no llega a grado 4** (nota (1): aislante hidrófilo, −1 grado). La lana es necesaria para su RA (nota 8). Avisarlo. (F.3)
9. **Fachada ventilada**: el CEC no cuenta la cámara ni lo exterior a ella y toma Rse = 0,13 (verificado por aritmética en cuatro fachadas). (A.4.4)
10. **Ventanas**: las tablas 4.3.1 no llevan Ψ y redondean al alza; la ec. (10) de HE1 es más exigente y debe seguir. Dos erratas en cabeceras (RPT > 12: 3,3 por 3,2; madera: «500 kg/m³» con Uf 2,2). Ug y Uf del repo coinciden con 3.15.2 y 3.16. (E)
11. **µ del repo que no coinciden con el CEC**: PYL 4 (repo 8), enlucido 6 (repo usa 8), HA 80 (repo 95), XPS 100–220 (repo muMax 2 200); EPS λ recomendado 0,039 (repo 0,037). Corregir con cuidado: cambian Glaser. (B.3.5)
12. **4.1.9 (cubierta inclinada)**: la remisión a 3.18 está ahora VERIFICADA en imagen (nota (5), p. 46), sin el +2 dBA. El RAtr 48 del catálogo HR sigue valiendo. (C.1.3)
13. **Capa de rodadura: el CEC no tiene solución** (todas sus transitables son «Transitable peatón»). Si se quiere conservar en HS1, decidir K-CER.17. (H.1.1)
14. **Ajardinada (C 7.3)**: el CEC la llama no transitable, como el criterio del repo; su R0_paquete de 0,82 supone unos 30 cm de tierra y no es lado seguro con sustratos finos. Decidir K-CER.16. (H.4.5, H.5)
15. **Lámina autoprotegida (C 6.3)**: solo convencional y con pendiente del 1 al 5 % (el DB admite hasta el 15 %); con lámina adherida, aislante soldable. (H.4.1, H.4.7, H.4.8)

## PENDIENTES

- **Definiciones de B1, B2, C2 y H1 del CEC**: no están en la p. 52, que es «Cubiertas 16» (C 14.5 y C 14.6), VERIFICADO en imagen el 2026-10-09. Las consideraciones previas de fachadas empiezan en la p. 53 (F.2); falta localizar dónde define el CEC esas cuatro (o confirmar que no las define).
- **DB-HS1, texto de B2** («cámara por el lado exterior del aislante»): no releído aquí (F.4.4).
- **DA DB-HE/1, regla de cámaras muy ventiladas** (Rse = Rsi, se excluyen las capas exteriores): aquí solo por aritmética sobre el CEC; leerla en el DA antes de citarla en la ficha.
- **Cubiertas**: todas las tablas de 4.1 (4.1.1 a 4.1.14, pp. 37 a 52) leídas ya en imagen (bloques C y H). Solo queda en texto la p. 34 (3.20: nota (9) de la impermeabilización bicapa para cubiertas transitables para vehículos y nota (5) de resistencia a raíces).
- **Fachadas no leídas en imagen**: F 3.28 a F 3.37 (p. 62), 4.2.6 resto y notas (pp. 70–72), 4.2.7 F 7.7 a F 7.15 (p. 74), 4.2.9 (p. 77).
- **Ventanas**: RPT 4–12 (p. 91), PVC dos cámaras (p. 94) y ventanas dobles (p. 96) solo en texto.
- **3.20 impermeabilizaciones** (λ, µ o Sd de láminas): pp. 33–36 no renderizadas.
- **4.5.1 resto y nota (8) HE** (R_AR de los materiales de impactos, S02, S03): pp. 116–117 no leídas en esta sesión.
- **Preámbulo (p. 3)**: sigue leído solo en texto.
- **Bloque H**: las imágenes son renders de una sesión anterior del mismo PDF; no se ha vuelto a descargar ni a renderizar en esta sesión (sin shell). Si se quiere trazabilidad completa, re-renderizar pp. 14, 39, 40, 42, 43, 44, 47, 48, 50, 51, 52 y comprobar que coinciden.
