# Verificación normativa HE1 v4 — envolvente por elementos (viviendas sobre local sin uso en PB)

> Fecha: 2026-10-04 · Agente: cte-normativa · Rama: `rediseno-v4` · **No se ha editado código.**
>
> Método: lectura directa de los PDF oficiales (capa de texto + imagen de cada página), cotejo celda
> a celda con `src/modules/he1/tablas.ts` y revisión de `src/modules/he1/calc.ts`. Las páginas de
> F1, F2 y F3 se han releído al cerrar este documento. Donde una cifra no sale de un documento
> oficial se dice explícitamente.

## 0. Fuentes leídas

| Id | Documento | Edición (según el propio documento) | Fichero | Valor jurídico |
|---|---|---|---|---|
| F1 | CTE **DB-HE** Ahorro de energía (texto consolidado) | Portada «14 Junio 2022». Disposiciones: RD 732/2019 (BOE 27/12/2019), RD 450/2022 (BOE 15/06/2022), corrección de errores del RD 450/2022 (BOE 02/02/2023) | `research/pdf/DBHE.pdf` (56 pp.) | «Este texto consolidado no tiene valor jurídico» (p. 2). Lo vinculante es el BOE |
| F2 | **DA DB-HE/1** «Cálculo de parámetros característicos de la envolvente» | «Enero 2020 (Versiones anteriores: Febrero 2015)» | `research/pdf/DA_DB-HE-1.pdf` (26 pp.) | «Los Documentos de Apoyo (DA) … carecen de valor reglamentario» (p. 1) |
| F3 | **DA DB-HE/2** «Comprobación de limitación de condensaciones superficiales e intersticiales en los cerramientos» | «Octubre 2013» | `research/pdf/DA_DB-HE-2.pdf` (14 pp.). La copia que publica hoy codigotecnico.org pesa lo mismo (142,1 KB) | Procedimiento de apoyo: «lo que no impide el uso de otros métodos» (§1) |
| F4 | **Guía de aplicación del DB-HE 2019** | «Versión junio 2022», 2.ª edición, NIPO 796-22090-4 | Descargada de codigotecnico.org | «de índole informativa, no teniendo carácter reglamentario» |
| F5 | **Catálogo de Elementos Constructivos del CTE (CEC)** v6.3 | «Versión preliminar: Marzo 10. Borrador» | Copia en certificadosenergeticos.com (`CAT-EC-v06.3_marzo_10.pdf`); el enlace PDF de codigotecnico.org da 404 | «… no tiene carácter reglamentario». Para productos fabricados industrialmente, «únicamente carácter genérico y orientativo» (DB-HE, Intro III, p. 4) |
| F7 | Repo: `src/modules/he1/tablas.ts`, `src/modules/he1/calc.ts`, `research/normativa-he1-*.md` | Estado actual de la rama | — | — |

---

## 1. Verificación

### 1 · Tabla 3.1.1.a-HE1 (Ulim) frente a `ULIM_TABLA_3_1_1_a`

| Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|
| **1.1** `ULIM_TABLA_3_1_1_a` reproduce la Tabla 3.1.1.a-HE1 | **CONFIRMADO** (36/36 celdas) | Ver §5.B1 | HE1 ap. 3.1.1 párr. 1: «La transmitancia térmica (U) de cada elemento perteneciente a la *envolvente térmica* no superará el valor límite (Ulim) de la tabla 3.1.1.a-HE1» | F1 p. 16; F4 p. 32 (idéntica) |
| **1.2** Zona C: UM 0,49 · UC 0,40 · UT 0,70 · UH 2,1 (maqueta) | **CONFIRMADO** | UM = US 0,49 · UC 0,40 · UT = UMD 0,70 · UH 2,1 · puertas 5,7 | Tabla 3.1.1.a-HE1, columna C | F1 p. 16 |
| **1.3** UMD tiene Ulim y comparte fila con UT | **CONFIRMADO** | 0,90 / 0,80 / 0,75 / 0,70 / 0,65 / 0,59 | Fila «Muros, suelos y cubiertas en contacto con espacios no habitables o con el terreno (UT) / Medianerías o particiones interiores pertenecientes a la envolvente térmica (UMD)» | F1 p. 16 |
| **1.4** Los huecos no se limitan a 5,7 | **CONFIRMADO** | 5,7 es solo para «Puertas con superficie semitransparente igual o inferior al 50%» (valor único para todas las zonas) | Tabla 3.1.1.a-HE1 | F1 p. 16 |
| **1.5** El repo recoge todas las notas de la tabla | **INCOMPLETO** | Falta la nota (*) del hueco | «*Los huecos con uso de escaparate en unidades de uso con actividad comercial pueden incrementar el valor de UH en un 50%.» | F1 p. 16 |
| **1.6** `research/normativa-he1-transmitancia.md` está al día | **REFUTADO (en parte)** | Sigue con `medianeria: null` (líneas 105 y 114) y «Medianerías: **no aplica**» (línea 293), cuando `tablas.ts` ya lo corrigió. Su sub-tabla de cámaras (líneas 161-167: 5 / 10 / 15 / ≥25 mm; 0,11 … ~0,21) **no es** la del DA | DA/1 Tabla 2 solo tabula e = 1, 2 y 5 cm: horizontal 0,15 / 0,16 / 0,16 · vertical 0,15 / 0,17 / 0,18; «Los valores intermedios se pueden obtener por interpolación lineal». `tablas.ts` está bien | F2 p. 4 |

### 2 · Tabla 3.2-HE1 (particiones interiores)

| Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|
| **2.1** Valores de la Tabla 3.2-HE1 | **TRANSCRITA** | **Mismo uso**: horizontales 1,90 / 1,80 / 1,55 / **1,35** / 1,20 / 1,00; verticales 1,40 / 1,40 / 1,20 / **1,20** / 1,20 / 1,00. **Distinto uso** y **con zonas comunes** (horizontales y verticales): 1,35 / 1,25 / 1,10 / **0,95** / 0,85 / 0,70 (α/A/B/C/D/E) | «Tabla 3.2 - HE1 *Transmitancia térmica* límite de particiones interiores, Ulim [W/m²K]» | F1 p. 18; F4 p. 34 |
| **2.2** Zona C, distinto uso = 0,95 | **CONFIRMADO** | 0,95 (misma fila que «entre unidades de uso y zonas comunes») | Fila «Entre unidades de distinto uso / Entre unidades de uso y zonas comunes — Particiones horizontales y verticales» | F1 p. 18 |
| **2.3** La invoca el ap. 3.2 | **CONFIRMADO** | HE1 ap. 3.2 «Limitación de descompensaciones», párr. 1 | «La *transmitancia térmica* de las *particiones interiores* no superará el valor de la tabla 3.2-HE1, en función del uso asignado a las distintas *unidades de uso* que delimiten» | F1 p. 18 |
| **2.4** ¿Solo para residencial privado? | **REFUTADO** | Aplica a **cualquier uso**. El ap. 3.2 no restringe; los que sí lo hacen son 3.1.1 párr. 3 (Klim) y 3.1.3 párr. 4 (n50). Fundamento: HE1 ap. 2 párr. 3 | Guía §HE1 4.6: «Estas limitaciones afectan a los edificios de cualquier uso». DB ap. 2 párr. 3: «Las *particiones interiores* limitarán la transferencia de calor entre las distintas *unidades de uso* del edificio, entre las *unidades de uso* y las *zonas comunes* del edificio…» | F1 pp. 15-18; F4 p. 48 |
| **2.5** Notas a pie de tabla | **NO TIENE** | Solo el párr. 2 (reformas): aplica a las particiones que «se sustituyan, incorporen, o modifiquen sustancialmente», o cuyas condiciones cambien con aumento de las necesidades energéticas | HE1 ap. 3.2 párr. 2 | F1 p. 18 |
| **2.6** Qué particiones entran | **PRECISIÓN** | Las «particiones interiores de las unidades de uso contenidas dentro de la envolvente térmica» (Guía). Unidad de uso: cada vivienda; cada local comercial independiente | DB-HE Anejo A, «Unidad de uso»: «a) en edificios de vivienda, cada una de las viviendas. b) en edificios de otros usos, cada uno de los establecimientos o locales comerciales independientes» | F1 p. 44; F4 p. 48 |

### 3 · Forjado entre vivienda y local «en bruto» sin uso definido en PB

| Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|
| **3.1** El DB decide si el local en bruto es «no habitable» u «otra unidad de uso» | **EL DB NO LO RESUELVE** | Decide el **proyectista**: el DB permite incluir o no los espacios no habitables en la envolvente térmica (ET) | Anejo C, párr. 1: «La *envolvente térmica* está compuesta por todos los *cerramientos* y *particiones interiores*, incluyendo sus *puentes térmicos*, que delimitan todos los *espacios habitables* del edificio o parte del edificio. No obstante, a criterio del proyectista: a) podrá incluirse alguno o la totalidad de los *espacios no habitables*» | F1 p. 48 |
| **3.2** Existe un criterio oficial (no reglamentario) para este caso | **CONFIRMADO (Guía)** | Dos opciones válidas, con el local tratado como no habitable. **CASO 1** (local dentro de la ET): el forjado es partición entre usos distintos → **Tabla 3.2** (0,95 en C); fachada, solera y huecos del local → Tabla 3.1.1.a; K del residencial; la superficie útil del local no cuenta. **CASO 2** (local fuera de la ET): forjado y tabiquería divisoria son ET → **Tabla 3.1.1.a, fila UT** (0,70 en C); no entran en K | Guía §HE1 4.2.1 «Trazado»: «En el habitual caso de locales comerciales que se proyectan (en un principio sin uso definido) en la planta baja de un edificio residencial en bloque …». CASO 1: «La divisoria entre local comercial y uso residencial debe cumplir la exigencia de limitación de descompensaciones entre unidades de distinto uso (tabla 3.2-HE1)». CASO 2: «La envolvente térmica pasa por la divisoria … por lo que tanto el forjado interior como la tabiquería interior deben cumplir con las transmitancias límite de la tabla 3.1.1.a-HE1» | F4 pp. 36-37 |
| **3.3** ¿Cuál es «del lado seguro»? | **CASO 2 (UT)** para el forjado | UT es menor que el límite de la Tabla 3.2 entre usos distintos en todas las zonas: α 0,90 < 1,35 · A 0,80 < 1,25 · B 0,75 < 1,10 · **C 0,70 < 0,95** · D 0,65 < 0,85 · E 0,59 < 0,70 | Tablas 3.1.1.a-HE1 y 3.2-HE1 | F1 pp. 16, 18 |
| **3.4** Qué U del forjado se compara con UT (CASO 2) | **MÉTODO DEL DA** | U = UP·b. UP con Rsi = Rse = **0,17** (flujo descendente, Tabla 6). b ≤ 1 (Tabla 7), así que **b = 1 es del lado seguro**. Con el local sin aislar y el forjado aislado, b va de 0,81 a 1,00 | DA/1 §2.1.3.1 ec. (6): «U = UP · b … UP la transmitancia térmica de la *partición interior* en contacto con el *espacio no habitable*, calculada según el apartado 2.1.1, tomando como resistencias superficiales los valores de la tabla 6 … b el coeficiente de reducción de temperatura … obtenido por la tabla 7 para los casos concretos que se citan o mediante el procedimiento descrito» | F2 pp. 9-10 |
| **3.5** fRsi del forjado sobre el local | **NO NECESARIA** | Exento si el espacio no habitable tiene escasa producción de vapor | DA/2 §4.1.1: «Por sus características, no es necesaria la comprobación de aquellas particiones interiores que linden con espacios no habitables donde se prevea escasa producción de vapor de agua, así como los cerramientos en contacto con el terreno» | F3 p. 5 |
| **3.6** Glaser del forjado | **CASO 2: sí** (es ET). **CASO 1: no exigible** (el ap. 3.3 se refiere a la ET) | El DA no fija las condiciones del lado no habitable. Usar las exteriores de enero (Tabla C.1) es del lado seguro: **criterio, no texto literal**. Si el local tuviera gran producción de humedad, la barrera de vapor iría en el lado del local (DA/2 §4.2.1) | HE1 ap. 3.3: «En el caso de que se produzcan condensaciones intersticiales en la *envolvente térmica* del edificio…» | F1 p. 18; F3 p. 6 |
| **3.7** Si la PB fuera porticada o abierta | **PRECISIÓN** | El forjado sería «suelo en contacto con el aire exterior» (US: 0,49 en C). No es el caso de un local cerrado | DB-HE Anejo A, «Suelo»: «*cerramiento* horizontal o ligeramente inclinado que esté en contacto por su cara inferior con el aire, con el terreno, o con un *espacio no habitable*» | F1 p. 44 |
| **3.8** Acondicionamiento posterior del local | **PRECISIÓN** | Será un **cambio de uso**, con su propia justificación HE | Guía (sección HE0): «el acondicionamiento de locales sin uso previamente definido … se considera un cambio de uso» | F4 p. 28 |

### 4 · Transmitancia del hueco UH

| Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|
| **4.1** Según el DA DB-HE/1, UH = (1−FM)·UH,v + FM·UH,m | **REFUTADO** (no es la versión vigente) | Ec. (10): **UH = (AH,v·UH,v + AH,m·UH,m + lv·Ψv + AH,p·UH,p + lp·Ψp) / (AH,v + AH,m + AH,p)** | DA/1 (enero 2020) §2.1.4.1: «Para el cálculo de la transmitancia térmica de huecos (ventana, lucernario o puerta) UH [W/m²K] se empleará la norma UNE EN ISO 10077.» + ec. (10) | F2 pp. 12-13 |
| **4.2** Forma UNE-EN ISO 10077-1 con Ψg | **CONFIRMADO** | Es exactamente la ec. (10), ampliada con panel opaco o cajón de persiana (AH,p, UH,p, lp, Ψp) | Ídem | F2 pp. 12-13 |
| **4.3** De dónde viene la forma con FM | **CONTEXTO** | Es el método anterior. Las tablas de huecos del CEC (2010) salen de UH ≈ (1−FM)·Ug + FM·Uf **sin Ψ**: marco RPT 3,3, bajo emisivo 4-15 con Ug 1,8 y FM 20 % dan 0,8·1,8 + 0,2·3,3 = 2,1, igual que la tabla. El DA de 2020 solo conserva «FM Fracción de marco» en la lista de notaciones, como vestigio | DA/1 «Notaciones y unidades»; CEC §4.3.1 | F2 p. 25; F5 |
| **4.4** Maqueta: «Uw = 0,75·Ug + 0,25·Uf + 0,08» | **NO DEFENDIBLE** | El 0,08 es un **Ψ en W/(m·K)** de la Tabla 10 (madera/plástico + doble bajo emisivo, separador convencional) sumado **sin multiplicar por lg/Aw**: error dimensional. Ventana de 1,20×1,20 m con FF 0,25 (lg = 4,16 m; lg/Aw = 2,89 m⁻¹): el término real es **0,23**, no 0,08. Con Ug 1,6 y Uf 1,8, la ec. (10) da **UH = 1,88** y la maqueta 1,73. En zonas D/E (Ulim 1,8) la maqueta da CUMPLE donde el resultado correcto es **NO CUMPLE**. Con Uf 1,3: 1,76 (ec. 10) frente a 1,61 (maqueta) | DA/1 ec. (10) y Tabla 10 | F2 pp. 12-13 (cálculo propio, §5.C1) |
| **4.5** Ψ marco-vidrio | **TRANSCRITO** | Ver §5.B3 | DA/1 «Tabla 10 Transmitancia térmica lineal Ψp y Ψv en huecos*» — «* Valores para elementos separadores convencionales y para elementos de prestaciones térmicas mejoradas» | F2 p. 13 |
| **4.6** El UH incluye el cajón de persiana | **CONFIRMADO** | Si hay cajón, entra en UH (término AH,p·UH,p + lp·Ψp) | Tabla 3.1.1.a: «*Huecos* (conjunto de marco, vidrio y, en su caso, cajón de persiana) (UH)». DA/1: «En el caso de paneles opacos o cajones de persiana con juntas más aislantes que el propio panel o cajón de persiana, se puede tomar Ψp = 0.» | F1 p. 16; F2 p. 13 |
| **4.7** Fracción de marco 0,25 con cita en el DB | **CONFIRMADO** (como simplificación) | El DB da FF = 0,25 en la definición del control solar (qsol;jul), no para UH. Sirve como **valor por defecto editable** para repartir Aw en Ag y Af | DB-HE Anejo A, «Control solar»: «FF es la fracción de marco del hueco k (de forma simplificada puede adoptarse el valor de 0,25)» | F1 p. 38 |
| **4.8** La ficha debe declarar vidrio y marco por separado | **CONFIRMADO** | Superficie y U del vidrio, del marco y del conjunto; Ψ del espaciador | HE1 ap. 4 párr. 3 d): «la superficie y la *transmitancia térmica* del vidrio y del marco, así como la del conjunto del *hueco*». Ap. 5.1 párr. 3: «… y por la *transmitancia térmica lineal* Ψ (W/mK) para los espaciadores» | F1 p. 19 |

### 5 · Valores tipo para predimensionado (Ug, Uf, fracción de marco)

| Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|
| **5.1** Ug doble 4/16/4 con aire ≈ 2,7–2,8 | **CONFIRMADO (orientativo)** | CEC, vertical: 4-12 → 2,8; 4-15 → 2,7; 4-20 → 2,7. Para 16 mm, **2,7**. El DA/1 recoge «Vidrio doble» con Ugl 3,0, pero es referencia de la UNE-EN ISO 52022-3 para calcular g, no un valor de diseño | CEC §3.15.2 «Acristalamientos incoloros» (calculados según UNE-EN 673); DA/1, nota a la Tabla 12 | F5; F2 p. 14 |
| **5.2** Ug 4/16/4 bajo emisivo ≈ 1,6–1,8 | **CONFIRMADO (según ε)** | CEC 4-15 y 4-20, vertical: **1,8** (0,2 ≥ ε > 0,1) · **1,6** (0,1 ≥ ε > 0,03) · **1,4** (ε ≤ 0,03). DA/1: «Vidrio doble bajo emisivo» Ugl 1,6 | Ídem | F5; F2 p. 14 |
| **5.3** Uf PVC ≈ 1,8–2,2 | **CONFIRMADO** | PVC dos cámaras **2,2**; tres cámaras **1,8** (vertical; 2,4 / 1,9 en horizontal) | CEC §3.16 «Marcos» | F5 |
| **5.4** Uf PVC = 1,3 (maqueta) | **SIN FUENTE OFICIAL** | Solo puede salir de la declaración del fabricante (perfiles de 5-6 cámaras). Por defecto, 1,8 (CEC, tres cámaras) | HE1 ap. 5.1 párr. 5: «Los valores de diseño de las propiedades citadas deben obtenerse de valores declarados por el fabricante para cada *producto*.» | F1 p. 19 |
| **5.5** Aluminio con RPT ≈ 3,2 | **CONFIRMADO con matiz** | RPT > 12 mm: **3,2** (§3.16; la tabla de huecos §4.3.1 usa 3,3). RPT de 4 a 12 mm: **4,0**. Sin RPT: **5,7** | CEC §3.16 | F5 |
| **5.6** Madera | **CONFIRMADO** | Densidad media alta (700 kg/m³): **2,2** · media baja (500 kg/m³): **2,0** | CEC §3.16 | F5 |
| **5.7** Fracción de marco 25–30 % | **CONFIRMADO (orientativo)** | **0,25** (DB-HE Anejo A, simplificado). El CEC tabula 20 % y 40 % con interpolación lineal | DB-HE Anejo A; CEC §4.3.1 | F1 p. 38; F5 |
| **5.8** ¿Valores oficiales o supuestos? | **SUPUESTOS EDITABLES** | Hay fuente oficial (CEC), pero es orientativa para ventanas y vidrios (productos industriales) y el CEC es un borrador sin carácter reglamentario. En la ficha: «orientativo CEC — sustituir por el valor declarado por el fabricante» | DB-HE Intro III: «… para los productos de construcción fabricados industrialmente dichos valores tienen únicamente carácter genérico y orientativo» | F1 p. 4; F5 |

### 6 · fRsi y Glaser aplicados al hueco

| Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|
| **6.1** Glaser es aplicable al hueco | **NO PROCEDE** | El método se define para un cerramiento por capas con Sd = e·µ (UNE-EN ISO 10456). Vidrio y metales tienen µ = ∞ (CEC §3.15.1 y §3.2) y la unidad de vidrio aislante es estanca: no hay difusión que analizar. La «capa ficticia» de `calc.ts` (líneas 403-422: R = 0,5443, µ = 10⁶) no representa nada físico | DA/2 §4.2.1: «comparación entre la presión de vapor y la presión de vapor de saturación que existe en cada punto intermedio de un cerramiento formado por diferentes capas». §4.2.4 ec. [18]: «Sdn = en • µn» | F3 pp. 6-8; F5 |
| **6.2** fRsi = 1 − U·0,25 es aplicable al hueco | **NO PROCEDE** (interpretación técnica: el DA no excluye el hueco por su nombre, y el Anejo A del DB incluye los huecos en «cerramiento») | (i) Es un criterio de **moho** (80 % de HR en la superficie). (ii) El propio DA dice que cumplir la U límite «asegura» fRsi ≥ fRsi,min en clase ≤ 4, y eso solo es cierto para opacos. En zona C, UH = 2,1 daría fRsi = **0,475 < 0,56**, y un hueco en su Ulim «fallaría» en todas las zonas; en cambio, un elemento UT en su Ulim cumple incluso en clase 4 (C: 0,825 ≥ 0,69). (iii) El CEC evalúa fRsi en el cerramiento opaco junto al marco y considera el cajón de PVC «no enmohecible». `calc.ts` líneas 410-411 justifica el hueco con «fRsi = 1 − 1,4·0,25 = 0,65 ≥ fRsi,min(D)=0,61 → CUMPLE»: hay que eliminarlo | DA/2 §4.1.1: «establecer un límite máximo del 80% de humedad relativa media mensual sobre la superficie del cerramiento analizado». Bajo la Tabla 1: «El cumplimiento de los valores de transmitancia máxima … establecidos en el documento DB HE1 asegura, para los cerramientos y particiones interiores de los espacios de clase de higrometría 4 o inferior, la verificación de la condición anterior, pudiendo resultar necesario comprobarlo en los puentes térmicos.» DB Anejo A, «Cerramiento»: «Comprende las cubiertas, suelos, *huecos*, fachadas/muros y medianeras» | F3 pp. 4-5; F1 p. 36; F5 |
| **6.3** fRsi es una exigencia cuantificada del DB-HE 2019 | **REFUTADO** | El ap. 3.3 solo cuantifica la condensación **intersticial**. fRsi es un procedimiento del DA/2 (oct. 2013, no reglamentario): mostrarlo como «comprobación complementaria DA DB-HE/2», no como exigencia del DB | HE1 ap. 3.3 (párrafo único): «… En ningún caso, la máxima condensación acumulada en cada periodo anual podrá superar la cantidad de evaporación posible en el mismo periodo.» La Guía (HE1 §3.5) lo comenta en el mismo sentido | F1 p. 18; F4 |
| **6.4** Dónde está el riesgo superficial en los huecos | **PRECISIÓN** | En jambas, dinteles, alféizares y cajón (puentes térmicos): DA DB-HE/3 o UNE-EN ISO 10211, no la U del hueco | DA/2 §4.1.2: «El factor de temperatura de la superficie interior fRsi para los *puentes térmicos* … puede calcularse aplicando los métodos descritos en la norma UNE-EN ISO 10211:2012 o en el Documento de Apoyo correspondiente.» | F3 p. 5 |

### 7 · fRsi,min (Tabla 1 del DA DB-HE/2)

| Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|
| **7.1** Zona C, clase ≤ 3 → 0,56 (maqueta «fRsi ≥ 0,56») | **CONFIRMADO** | **0,56** | «Tabla 1 Factor de temperatura de la superficie interior mínimo fRsi,min», fila «Clase de higrometría 3 o inferior a 3»: 0,42 / 0,50 / 0,52 / **0,56** / 0,61 / 0,64 | F3 p. 5 |
| **7.2** Tabla completa y columnas (`FRSI_MIN_TABLA_1`) | **CONFIRMADO = repo** | 6 columnas α A B C D E, sin C1/C2. Clase 5: 0,70 / 0,80 / 0,80 / 0,80 / 0,90 / 0,90 · clase 4: 0,56 / 0,66 / 0,66 / 0,69 / 0,75 / 0,78 | Ídem | F3 p. 5 |
| **7.3** El criterio es «≥» | **MATIZ** | El DA dice «superior»; el CEC aplica «≥». Mantener ≥ citando el CEC | DA/2 §4.1.1: «se comprueba que el factor de temperatura de la superficie interior es superior al factor de temperatura de la superficie interior mínimo» | F3 p. 4; F5 |

### 8 · Condiciones de cálculo para Glaser

| Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|
| **8.1** Interior 20 °C y 55 % (clase ≤ 3) | **CONFIRMADO** | 20 °C todos los meses y 55 %. Si se dispone del dato real de θi y HR interior, se usa sumando 0,05 a la HR. El DA advierte que en viviendas en zona marítima la HR puede ser muy superior al 55 % | DA/2 §2.2.2: «En ausencia de datos más precisos, se puede tomar, para todos los meses del año, una temperatura del ambiente interior igual a 20 ºC y una humedad relativa … c) clase de higrometría 3 o inferior … como oficinas, tiendas, zonas de almacenamiento y todos los espacios en edificios de uso residencial: 55%» | F3 p. 3 |
| **8.2** Descripción de las clases 4 y 5 en el repo | **CORREGIR TEXTO** | Clase 5 (70 %): «lavanderías, restaurantes y piscinas». Clase 4 (62 %): «cocinas, pabellones deportivos, duchas colectivas u otros de uso similar». El repo pone «cocinas industriales, restaurantes» en la clase 4 (`tablas.ts` líneas 92-93; `normativa-he1-condensaciones-puentes.md` línea 88) | DA/2 §2.2.2 a) y b) | F3 p. 3 |
| **8.3** Exterior: mes de enero de la capital de provincia | **CONFIRMADO** (con procedimiento) | Medias mensuales de la localidad. Capitales → Tabla C.1. Otras localidades sin registros → T de la capital −1 °C por cada 100 m de diferencia de altitud, con la misma humedad absoluta (ec. [1]-[2]). Si la localidad está más baja que la capital, se usan los datos de la capital | DA/2 §2.1. §4.2.1: «para las condiciones interiores y exteriores correspondientes al mes de enero y especificadas en el Apéndice C, tabla C.1 de este documento» | F3 pp. 2, 6 |
| **8.4** Cáceres «5 °C · 85 %» (maqueta) | **REFUTADO** | Cáceres, enero: **Tmed 7,8 °C · HRmed 78 %** | DA/2 Apéndice C, «Tabla C.1 Datos climáticos mensuales de capitales de provincia, T en ºC y HR en %», fila «Caceres» | F3 p. 12 |
| **8.5** Valores por defecto del repo (0 °C / 85 %; «Anejo del DB-HE»; «default informativo del DA DB-HE/2 ~85 %») | **CORREGIR** | La fuente no es un anejo del DB-HE (que no tiene datos de HR) sino el **DA/2 Apéndice C**, y el DA/2 **no** da ningún «85 %» por defecto. Hay que leer la Tabla C.1 por provincia, no aplicar 0 °C / 85 % genéricos | Ídem | F3 p. 12; `calc.ts` 205-212 y 567-588; `tablas.ts` 702-705 y 722-726 |

### 9 · Ediciones y forma de citar

| Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|
| **9.1** DB-HE «2019 (RD 732/2019), consolidado 14-jun-2022» (`PROC_HE1`) | **CONFIRMADO** | Correcto. Lo vinculante es el BOE; el consolidado «no tiene valor jurídico» | DB-HE, Introducción, «Disposiciones normativas publicadas en el Boletín Oficial del Estado» | F1 pp. 1-2 |
| **9.2** DA DB-HE/1 «2019 (asociado a RD 732/2019)», 2022-06-14 (`PROC_DA_HE1`, `tablas.ts` 209-212) | **REFUTADO** | **Enero 2020** (versión anterior: febrero 2015); sin valor reglamentario | Portada del DA/1 | F2 p. 1 |
| **9.3** DA DB-HE/2 «2019 (RD 732/2019)», 2022-06-14 (`PROC_DA_HE2`, `tablas.ts` 457-462) | **REFUTADO** | **Octubre 2013** (sigue siendo la versión publicada) | Portada del DA/2 | F3 p. 1 |
| **9.4** Cómo citar la Guía y el CEC | — | Guía: versión junio 2022 (2.ª ed.), informativa. CEC: v6.3 de marzo de 2010 (borrador), orientativo | — | F4; F5 |

---

## 2. Cifras que SÍ se pueden mostrar

| Cifra (zona C salvo indicación) | Valor | Naturaleza | Cita para la ficha |
|---|---|---|---|
| Ulim muros y suelos exteriores (UM, US) | 0,49 W/m²K | **Exigencia** | DB-HE (RD 732/2019; consolidado 14-jun-2022), HE1 ap. 3.1.1, Tabla 3.1.1.a-HE1 |
| Ulim cubiertas (UC) | 0,40 | Exigencia | Ídem |
| Ulim contacto con no habitables o terreno (UT) / medianerías (UMD) | 0,70 | Exigencia | Ídem |
| Ulim huecos (UH) | 2,1 | Exigencia | Ídem (+50 % en escaparates de unidades de uso con actividad comercial, nota *) |
| Ulim puertas con superficie semitransparente ≤ 50 % | 5,7 (todas las zonas) | Exigencia | Ídem |
| Ulim particiones entre unidades del mismo uso | horizontales 1,35 · verticales 1,20 | Exigencia | HE1 ap. 3.2, Tabla 3.2-HE1 |
| Ulim particiones entre usos distintos o con zonas comunes | 0,95 | Exigencia | Ídem |
| Forjado sobre local fuera de la ET (CASO 2) | ≤ 0,70 (UT), con U = UP·b y b = 1 por defecto | Exigencia + método del DA | Tabla 3.1.1.a-HE1; DA DB-HE/1 (ene-2020) §2.1.3.1 ec. (6), Tablas 6 y 7; Guía DB-HE 2019 (jun-2022) §HE1 4.2.1 |
| Rsi/Rse, cerramientos al exterior (flujo horizontal / ascendente / descendente) | Rsi 0,13 / 0,10 / 0,17; Rse 0,04 | Método del DA | DA DB-HE/1 Tabla 1 |
| Rsi = Rse, particiones y contacto con no habitables | 0,13 / 0,10 / 0,17 | Método del DA | DA DB-HE/1 Tabla 6 |
| R de cámara sin ventilar (e = 1 / 2 / 5 cm) | horizontal 0,15 / 0,16 / 0,16 · vertical 0,15 / 0,17 / 0,18 (ligeramente ventilada: la mitad) | Método del DA | DA DB-HE/1 Tabla 2 |
| Ψ marco-vidrio | Tabla 10 (§5.B3) | Método del DA | DA DB-HE/1 Tabla 10 |
| fRsi,min (clase ≤ 3) | 0,56, equivalente a U máx. por fRsi = (1 − 0,56)/0,25 = 1,76 (**solo opacos**) | **Complementaria** (no es exigencia del DB-2019) | DA DB-HE/2 (oct-2013) §4.1.1 Tabla 1 y §4.1.2 ec. [9] |
| Condiciones interiores para Glaser | 20 °C · 55 % | Método del DA | DA DB-HE/2 §2.2.2 |
| Cáceres, enero | 7,8 °C · 78 % | Dato climático | DA DB-HE/2 Apéndice C, Tabla C.1 |
| Psat (Magnus) | 610,5·e^(17,269θ/(237,3+θ)) si θ ≥ 0; 610,5·e^(21,875θ/(265,5+θ)) si θ < 0 | Método del DA | DA DB-HE/2 §3.1 ec. [3] y [4] |
| Barrera de vapor | Resistencia a la difusión > 10 MN·s/g (= 2,7 m²·h·Pa/mg) | Definición del DA | DA DB-HE/2 Apéndice A |
| Ug orientativos | 4/16/4 con aire 2,7 · bajo emisivo 1,8 / 1,6 / 1,4 (según ε) | **Orientativo, editable** | CEC v6.3 (mar-2010) §3.15.2 |
| Uf orientativos | PVC 2 cám. 2,2 · PVC 3 cám. 1,8 · Al RPT > 12 mm 3,2 · Al RPT 4–12 mm 4,0 · Al sin RPT 5,7 · madera 2,2 / 2,0 | Orientativo, editable | CEC v6.3 §3.16 |
| Fracción de marco por defecto | 0,25 | Orientativo, editable | DB-HE Anejo A (control solar, valor simplificado) |
| U orientativas para cumplir K (residencial privado) | UM/US 0,29 · UC 0,23 · UT 0,48 · UH 2,0 | Orientativo (DB) | DB-HE Anejo E, Tabla a-Anejo E («Los valores anteriores presuponen un correcto tratamiento de los *puentes térmicos*») |

## 3. Cifras que NO

| Cifra o práctica | Por qué no | Correcto |
|---|---|---|
| UH límite 5,7 | Es el límite de las puertas | Serie 3,2 / 2,7 / 2,3 / 2,1 / 1,8 / 1,80 |
| UMD = `null` o «medianería: no aplica» (research doc, líneas 105, 114 y 293) | Contradice la Tabla 3.1.1.a | Fila UT |
| 0,95 (Tabla 3.2) para el forjado con el local **fuera** de la ET | En el CASO 2 el forjado es ET | 0,70 (UT) |
| «Uw = 0,75·Ug + 0,25·Uf + 0,08» | Suma un Ψ sin lg/Aw (error dimensional); infravalora UH en ≈ 0,1–0,25 | DA/1 ec. (10) |
| Uf PVC 1,3 como valor por defecto | Sin fuente oficial | 1,8 (CEC) o el valor declarado por el fabricante |
| UH tabulados del CEC (§4.3.1) como UH de la ficha | Calculados sin Ψ (método anterior) | Solo como contraste |
| fRsi del hueco (comentario de `calc.ts` 410-411: «0,65 ≥ fRsi,min(D)=0,61 → CUMPLE») | No procede (§6.2) | Mostrar «no aplica» |
| Glaser del hueco (capa ficticia, µ = 10⁶) | No procede (§6.1) | Mostrar «no aplica» |
| fRsi,min presentado como «EXIGENCIA» / «EXIGIDO» (`tablas.ts` 440-442) | El DB-2019 no lo cuantifica | «Comprobación complementaria DA DB-HE/2» |
| Cáceres «5 °C · 85 %»; valores por defecto de 0 °C / 85 % | No salen de ninguna tabla | Tabla C.1 (Cáceres 7,8 °C · 78 %) |
| «Anejo del DB-HE» como fuente de θe y φe; «default informativo del DA DB-HE/2 ~85 %» | Fuente equivocada; el DA no tiene ese default | DA DB-HE/2 Apéndice C, Tabla C.1 |
| DA DB-HE/1 «2019 / 2022-06-14» | Fecha equivocada | Enero 2020 |
| DA DB-HE/2 «2019 (RD 732/2019) / 2022-06-14» | Fecha equivocada | Octubre 2013 |
| «Cocinas industriales, restaurantes» en la clase 4 | No es lo que dice el DA | Restaurantes → clase 5; clase 4 = «cocinas, pabellones deportivos, duchas colectivas…» |
| Sub-tabla de cámaras del research doc (5 / 10 / 15 / ≥25 mm; 0,11 … ~0,21) | No es la tabla del DA | DA/1 Tabla 2 (1 / 2 / 5 cm) |

## 4. Pendientes

1. **Altitud de la capital** para la corrección de −1 °C/100 m: el DA/2 no la da. La Tabla a-Anejo G del DB-HE (temperatura del agua de red) sí trae la altitud de cada capital (Cáceres 459 m; transcrita en §5.B8). Usarla aquí es un **criterio** que hay que etiquetar.
2. **Ventanas de varias hojas**: lg crece con montantes y hojas, y estimar lg como si hubiera un solo paño **no es del lado seguro**. Decisión de producto: campo `lg` editable + aviso.
3. **Dirección del flujo en particiones horizontales entre unidades calefactadas** (Tabla 3.2, mismo uso): el DA/1 no la fija. Ascendente (Rsi + Rse = 0,20) da más U → lado seguro (**criterio**; el CEC §4.5 da ambas fórmulas).
4. **Nota del escaparate (+50 %)** en un local sin actividad definida (CASO 1): no aplicaría hasta que haya «actividad comercial» (interpretación).
5. **Cámaras de más de 5 cm**: la Tabla 2 del DA/1 llega solo a 5 cm (cámaras de hasta 0,3 m). El «e ≥ 5 cm» de `tablas.ts` es una extrapolación (coherente con ISO 6946, pero criterio).
6. **CEC**: incoherencia interna en el Uf de RPT > 12 mm (3,2 en §3.16; 3,3 en §4.3.1).
7. **UNE-EN ISO 13788** (Rsi de acristalamientos): no consultable sin comprar la norma. No hace falta para el veredicto de §6.
8. **DA DB-HE/3**: su edición («enero 2014» en `tablas.ts`) no se ha re-verificado en esta tarea.
9. **Atribución histórica de la fórmula con FM** (DB-HE 2006 Apéndice E / DA/1 de feb-2015): no he leído esos textos (confianza media). La coherencia con el CEC 2010 sí está comprobada numéricamente.
10. **Páginas de la Guía (F4)**: tomadas en la primera lectura. No se han re-cotejado al cerrar el documento, a diferencia de F1-F3.

## 5. Para el código

### A. Cambios por fichero

**`src/modules/he1/tablas.ts`**
1. `PROC_DA_HE1` (209-212): `edicion: "enero 2020 (sustituye a feb. 2015)"`, `fecha: "2020-01"`, y en `fuente` «sin valor reglamentario».
2. `PROC_DA_HE2` (457-462): `edicion: "octubre 2013"`, `fecha: "2013-10"`.
3. BLOQUE 4 (440-442): de «fRsi,min EXIGIDO … EXIGENCIA» a **«comprobación complementaria (DA DB-HE/2, no exigencia del DB-HE 2019)»**. `FRSI_MIN_TABLA_1.articulo` → «§4.1.1, Tabla 1»; `RSI_CONDENSACION` → «§4.1.2 ec. [9]».
4. `ULIM_TABLA_3_1_1_a`: añadir la nota del escaparate como metadato (§B1).
5. **Nueva** `ULIM_PARTICIONES_TABLA_3_2` (§B2) y helper `ulimParticionDe(relacion, orientacion, zona)`.
6. **Nuevas** `PSI_HUECO_TABLA_10` (§B3), `UG_REFERENCIA_CEC` (§B4) y `UF_REFERENCIA_CEC` (§B5), estas dos marcadas como orientativas.
7. **Nueva** `B_REDUCCION_TABLA_7` (§B6). Opcional; por defecto b = 1.
8. **Nueva** `CLIMA_TABLA_C1_DA_HE2` (§B7, 12 meses × 52 capitales) y `ALTITUD_CAPITAL_ANEJO_G` (§B8; si el repo ya la tiene para HE4, reutilizarla).
9. `CONDICIONES_DEFECTO` (722-726): quitar `hrExteriorDefecto_pct: 85` como valor por defecto. Quitar también el comentario de 702-705 (θe/φe «Anejo climático del DB-HE», «φe típico ~80–90 %»).
10. Comentario de `ClaseHigrometria` (92-93): clase 4 = «cocinas, pabellones deportivos, duchas colectivas u otros de uso similar»; restaurantes pasa a la clase 5.
11. Opcional: `U_ORIENTATIVA_ANEJO_E` (§B9), para un indicador secundario de «objetivo K».

**`src/modules/he1/calc.ts`**
1. **Hueco**: quitar la capa ficticia del ejemplo (403-422). Nueva función pura `uHueco()` con la ec. (10) (§C1). Para `tipoElemento === "hueco"`, fRsi y Glaser pasan a estado `"no aplica"`, con motivo citado (DA/2 §4.1 / §4.2), y no afectan al veredicto.
2. **Particiones**: nuevo tipo de elemento `particion_interior` con `relacion: "mismo_uso" | "distinto_uso" | "zona_comun"` y `orientacion: "horizontal" | "vertical"`. Ulim de la Tabla 3.2; Rsi/Rse de la Tabla 6. No es ET: Glaser no exigible.
3. **Forjado sobre el local**: decisión del proyectista a nivel de proyecto, `localPB: "fuera_envolvente" | "dentro_envolvente"`, **por defecto `fuera_envolvente`** (lado seguro para el forjado).
   - Fuera: `contacto_no_habitable_terreno`, U = UP·b (Tabla 6, descendente 0,17/0,17; b = 1 por defecto), sin fRsi (exento), Glaser con las condiciones exteriores de enero (criterio).
   - Dentro: `particion_interior` / `distinto_uso` (0,95 en C).
   - Cita: DB-HE Anejo C + Guía §HE1 4.2.1.
4. **Condiciones exteriores**: θe y φe de `CLIMA_TABLA_C1_DA_HE2` según la provincia, con corrección de altitud (§C3). Cambiar el texto de los avisos y comentarios (205-212, 567-588): la fuente es «DA DB-HE/2, Apéndice C, Tabla C.1». Sin provincia, error de entrada o aviso bloqueante, no 0 °C / 85 % silenciosos.
5. **fRsi**: en la ficha, «comprobación complementaria (DA DB-HE/2, oct-2013)». Exentos: elementos en contacto con el terreno y particiones con no habitables de escasa producción de vapor (DA/2 §4.1.1). Glaser exento si hay terreno o barrera de vapor en la cara caliente (DA/2 §4.2.1).
6. **Balance anual (DB-HE ap. 3.3)**: con la Tabla C.1 completa (§B7) ya se puede iterar los 12 meses si hay condensación en enero (DA/2 §4.2.1).

**Documentación** (sin tocar código):
- `research/normativa-he1-transmitancia.md`: marcar como obsoletas las líneas 105, 114, 161-167 y 293.
- `research/normativa-he1-condensaciones-puentes.md`: marcar como obsoleta la línea 88.
- Proponer actualizar el IDR §4/§9 con: fechas de los DA, Tabla 3.2, criterio del local en bruto, «fRsi/Glaser no aplican a huecos» y Tabla C.1 transcrita.

### B. Datos listos para `shared/tablas` (con procedencia)

**B1 — Nota de la Tabla 3.1.1.a-HE1** (los valores numéricos del repo están bien)
```ts
notaEscaparate: {
  texto: "Los huecos con uso de escaparate en unidades de uso con actividad comercial pueden incrementar el valor de UH en un 50%.",
  factorUH: 1.5,
  aplicaA: "hueco en unidad de uso con actividad comercial (escaparate)",
}
```

**B2 — Tabla 3.2-HE1**
```ts
const PROC_HE1_T32 = {
  db: "DB-HE1", edicion: "2019 (RD 732/2019)", fecha: "2022-06-14",
  articulo: "ap. 3.2 Limitación de descompensaciones", tabla: "Tabla 3.2-HE1",
  fuente: "codigotecnico.org · DB-HE consolidado 14-jun-2022, p. 18",
} as const;
// Ulim [W/m²K] por zona de invierno. Aplica a cualquier uso (Guía §HE1 4.6).
ulim_W_m2K: {
  mismo_uso_horizontal:      { "α": 1.90, A: 1.80, B: 1.55, C: 1.35, D: 1.20, E: 1.00 },
  mismo_uso_vertical:        { "α": 1.40, A: 1.40, B: 1.20, C: 1.20, D: 1.20, E: 1.00 },
  distinto_uso_o_zona_comun: { "α": 1.35, A: 1.25, B: 1.10, C: 0.95, D: 0.85, E: 0.70 }, // horizontales y verticales
}
// Reformas (ap. 3.2 párr. 2): solo particiones sustituidas, incorporadas o modificadas sustancialmente,
// o cuyas condiciones cambien con aumento de las necesidades energéticas.
```

**B3 — Ψ marco-vidrio / marco-panel (DA/1 Tabla 10)** [W/(m·K)]
```ts
const PROC_DA_HE1_T10 = { db: "DA DB-HE/1", edicion: "enero 2020", fecha: "2020-01",
  articulo: "§2.1.4.1 ec. (10)", tabla: "Tabla 10", fuente: "codigotecnico.org · DA DB-HE/1 p. 13 (sin valor reglamentario)" } as const;
// [separador convencional, separador de prestaciones térmicas mejoradas]
psi_W_mK: {
  madera_plastico:  { simple: [0.00, 0.00], doble_o_triple: [0.06, 0.05], doble_be_o_triple_2be: [0.08, 0.06] },
  metalico_con_rpt: { simple: [0.00, 0.00], doble_o_triple: [0.08, 0.06], doble_be_o_triple_2be: [0.11, 0.08] },
  metalico_sin_rpt: { simple: [0.00, 0.00], doble_o_triple: [0.02, 0.01], doble_be_o_triple_2be: [0.05, 0.04] },
}
// Ψp = 0 si el panel opaco o el cajón tiene juntas más aislantes que él.
```

**B4 — Ug orientativo (CEC v6.3 §3.15.2, vidrio vertical, unidades 4-cámara-4)** [W/m²K]
```ts
const PROC_CEC_VIDRIO = { db: "Catálogo de Elementos Constructivos del CTE", edicion: "v6.3 (marzo 2010, borrador)",
  articulo: "§3.15.2 Acristalamientos incoloros (UNE-EN 673)", tabla: "UH,v vertical",
  fuente: "CEC v6.3 — orientativo para productos industriales (DB-HE Intro III); sustituir por el valor del fabricante" };
// cámara (mm): normal ε=0,89 | BE 0,2≥ε>0,1 | BE 0,1≥ε>0,03 | BE ε≤0,03
ug_vertical_W_m2K: {
  6:  [3.3, 2.7, 2.6, 2.4],
  9:  [3.0, 2.3, 2.1, 1.9],
  12: [2.8, 2.0, 1.8, 1.6],
  15: [2.7, 1.8, 1.6, 1.4],
  20: [2.7, 1.8, 1.6, 1.4],   // 4/16/4 → 2,7 / 1,8 / 1,6 / 1,4
},
ug_sencillo_4mm_vertical: 5.7,
// Horizontal (lucernarios), cámaras 6/9/12/15/20: normal 3,6/3,4/3,4/3,4/3,3 · BE(>0,1) 3,0/2,7/2,6/2,6/2,5 ·
// BE(0,03–0,1) 2,8/2,5/2,4/2,4/2,3 · BE(≤0,03) 2,6/2,3/2,2/2,2/2,1. Sencillo 4 mm horizontal 6,9.
```

**B5 — Uf orientativo (CEC v6.3 §3.16 «Marcos»)** [W/m²K]
```ts
uf_W_m2K: { // [vertical, horizontal]
  metalico_sin_rpt:        [5.7, 7.2],
  metalico_rpt_4_12mm:     [4.0, 4.5],
  metalico_rpt_mayor_12mm: [3.2, 3.5],  // la tabla de huecos §4.3.1 usa 3,3 (incoherencia interna del CEC)
  madera_700kg_m3:         [2.2, 2.4],
  madera_500kg_m3:         [2.0, 2.1],
  pvc_dos_camaras:         [2.2, 2.4],
  pvc_tres_camaras:        [1.8, 1.9],
},
fraccionMarcoDefecto: 0.25, // DB-HE Anejo A (control solar, «de forma simplificada»), editable
```

**B6 — Coeficiente de reducción b (DA/1 Tabla 7, p. 10)**
CASO 1 = espacio ligeramente ventilado (niveles de estanqueidad 1-3); CASO 2 = muy ventilado (niveles 4-5), según la Tabla 8.
```ts
// filas Ah-nh/Anh-e: <0,25 | 0,25–0,50 | 0,50–0,75 | 0,75–1,00 | 1,00–1,25 | 1,25–2,00 | 2,00–2,50 | 2,50–3,00 | >3,00
b: {
  noAisladoNhE_aisladoHNh:   { caso1: [0.99,0.97,0.96,0.94,0.92,0.89,0.86,0.83,0.81], caso2: [1.00,0.99,0.98,0.97,0.96,0.95,0.93,0.91,0.90] },
  noAisladoNhE_noAisladoHNh: { caso1: [0.94,0.85,0.77,0.70,0.65,0.56,0.48,0.43,0.39], caso2: [0.97,0.92,0.87,0.83,0.79,0.73,0.66,0.61,0.57] },
  aisladoNhE_noAisladoHNh:   { caso1: [0.91,0.77,0.67,0.59,0.53,0.44,0.36,0.32,0.28], caso2: [0.96,0.90,0.84,0.79,0.74,0.67,0.59,0.54,0.50] },
}
// Alternativa: ec. (7) b = Hnh-e/(Hh-nh + Hnh-e), con (8)-(9) y la Tabla 8 (renovaciones 0 / 0,5 / 1 / 5 / 10 h⁻¹).
// Por defecto b = 1 (lado seguro). Valores intermedios por interpolación lineal.
```

**B7 — Clima mensual de capitales (DA/2 Apéndice C, Tabla C.1, pp. 12-13)**
Transcrito de la capa de texto y cotejado con la imagen. Formato: `{ T: [ene…dic] °C, HR: [ene…dic] % }`.
```ts
const PROC_DA_HE2_C1 = { db: "DA DB-HE/2", edicion: "octubre 2013", fecha: "2013-10",
  articulo: "§2.1 y §4.2.1", tabla: "Apéndice C, Tabla C.1 Datos climáticos mensuales de capitales de provincia",
  fuente: "codigotecnico.org · DA DB-HE/2 pp. 12-13" } as const;
clima: {
  Albacete:            { T:[5.0,6.3,8.5,10.9,15.3,20.0,24.0,23.7,20.0,14.1,8.5,5.3],     HR:[78,70,62,60,54,50,44,50,58,70,77,79] },
  Alicante:            { T:[11.6,12.4,13.8,15.7,18.6,22.2,25.0,25.5,23.2,19.1,15.0,12.1], HR:[67,65,63,65,65,65,64,68,69,70,69,68] },
  Almeria:             { T:[12.4,13.0,14.4,16.1,18.7,22.3,25.5,26.0,24.1,20.1,16.2,13.3], HR:[70,68,66,65,67,65,64,66,66,69,70,69] },
  Avila:               { T:[3.1,4.0,5.6,7.6,11.5,16.0,19.9,19.4,16.5,11.2,6.0,3.4],      HR:[75,70,62,61,55,50,39,40,50,65,73,77] },
  Badajoz:             { T:[8.7,10.1,12.0,14.2,17.9,22.3,25.3,25.0,22.6,17.4,12.1,9.0],  HR:[80,76,69,66,60,55,50,50,57,68,77,82] },
  Barcelona:           { T:[8.8,9.5,11.1,12.8,16.0,19.7,22.9,23.0,21.0,17.1,12.5,9.6],   HR:[73,70,70,70,72,70,69,72,74,74,74,71] },
  Bilbao:              { T:[8.9,9.6,10.4,11.8,14.6,17.4,19.7,19.8,18.8,16.0,11.8,9.5],   HR:[73,70,70,72,71,72,73,75,74,74,74,74] },
  Burgos:              { T:[2.6,3.9,5.7,7.6,11.2,15.0,18.4,18.3,15.8,11.1,5.8,3.2],      HR:[86,80,73,72,69,67,61,62,67,76,83,86] },
  Caceres:             { T:[7.8,9.3,11.7,13.0,16.6,22.3,26.1,25.4,23.6,17.4,12.0,8.8],   HR:[78,73,63,60,55,44,37,39,49,65,76,80] },
  Cadiz:               { T:[12.8,13.5,14.7,16.2,18.7,21.5,24.0,24.5,23.5,20.1,16.1,13.3], HR:[77,75,70,71,71,70,69,69,70,73,76,77] },
  Castellon:           { T:[10.1,11.1,12.7,14.2,17.2,21.3,24.1,24.5,22.3,18.3,13.5,11.2], HR:[68,66,64,66,67,66,66,69,71,71,73,69] },
  Ceuta:               { T:[11.5,11.6,12.6,13.9,16.3,18.8,21.7,22.2,20.2,17.7,14.1,12.1], HR:[87,87,88,87,87,87,87,87,89,89,88,88] },
  CiudadReal:          { T:[5.7,7.2,9.6,11.9,16.0,20.8,25.0,24.7,21.0,14.8,9.1,5.9],     HR:[80,74,66,65,59,54,47,48,57,68,78,82] },
  Cordoba:             { T:[9.5,10.9,13.1,15.2,19.2,23.1,26.9,26.7,23.7,18.4,12.9,9.7],  HR:[80,75,67,65,58,53,46,49,55,67,76,80] },
  ACoruna:             { T:[10.2,10.5,11.3,12.1,14.1,16.4,18.4,18.9,18.1,15.7,12.7,10.9], HR:[77,76,74,76,78,79,79,79,79,79,79,78] },
  Cuenca:              { T:[4.2,5.2,7.4,9.6,13.6,18.2,22.4,22.1,18.6,12.9,7.6,4.8],      HR:[78,73,64,62,58,54,44,46,56,68,76,79] },
  Girona:              { T:[6.8,7.9,9.8,11.6,15.4,19.4,22.8,22.4,19.9,15.2,10.2,7.7],    HR:[77,73,71,71,70,67,62,68,72,76,77,75] },
  Granada:             { T:[6.5,8.4,10.5,12.4,16.3,21.1,24.3,24.1,21.1,15.4,10.6,7.4],   HR:[76,71,64,61,56,49,42,42,53,62,73,77] },
  Guadalajara:         { T:[5.5,6.8,8.8,11.6,15.3,19.8,23.5,22.8,19.5,14.1,9.0,5.9],     HR:[80,76,69,68,67,62,53,54,61,72,79,81] },
  Huelva:              { T:[12.2,12.8,14.4,16.5,19.2,22.2,25.3,25.7,23.7,20.0,15.4,12.5], HR:[76,72,66,63,60,59,54,54,60,67,72,75] },
  Huesca:              { T:[4.7,6.7,9.0,11.3,15.3,19.5,23.3,22.7,19.7,14.6,8.7,5.3],     HR:[80,73,64,63,60,56,48,53,61,70,78,81] },
  Jaen:                { T:[8.7,9.9,12.0,14.3,18.5,23.1,27.2,27.1,23.6,17.6,12.2,8.7],   HR:[77,72,67,64,59,53,44,45,55,67,75,77] },
  Leon:                { T:[3.1,4.4,6.6,8.6,12.1,16.4,19.7,19.1,16.7,11.7,6.8,3.8],      HR:[81,75,66,63,60,57,52,53,60,72,78,81] },
  Lleida:              { T:[5.5,7.8,10.3,13.0,17.1,21.2,24.6,24.0,21.1,15.7,9.2,5.8],    HR:[81,69,61,56,55,54,47,54,62,70,77,82] },
  Logrono:             { T:[5.8,7.3,9.4,11.5,15.1,19.0,22.2,21.8,19.2,14.4,9.1,6.3],     HR:[75,68,62,61,59,56,55,56,61,69,73,76] },
  Lugo:                { T:[5.8,6.5,7.8,9.5,11.7,14.9,17.2,17.5,16.0,12.5,8.6,6.3],      HR:[85,81,77,77,76,76,75,75,77,82,84,85] },
  Madrid:              { T:[6.2,7.4,9.9,12.2,16.0,20.7,24.4,23.9,20.5,14.7,9.4,6.4],     HR:[71,66,56,55,51,46,37,39,50,63,70,73] },
  Malaga:              { T:[12.2,12.8,14.0,15.8,18.7,22.1,24.7,25.3,23.1,19.1,15.1,12.6], HR:[71,70,66,65,61,59,60,63,65,70,72,72] },
  Melilla:             { T:[13.2,13.8,14.6,15.9,18.3,21.5,24.4,25.3,23.5,20.0,16.6,14.1], HR:[72,72,71,70,69,68,67,68,72,75,74,73] },
  Murcia:              { T:[10.6,11.4,12.6,14.5,17.4,21.0,23.9,24.6,22.5,18.7,14.3,11.3], HR:[72,69,69,68,70,71,72,74,73,73,73,73] },
  Ourense:             { T:[7.4,9.3,10.7,12.4,15.3,19.3,21.9,21.7,19.8,15.0,10.6,8.2],   HR:[83,75,69,70,67,64,61,62,64,73,83,84] },
  Oviedo:              { T:[7.5,8.5,9.5,10.3,12.8,15.8,18.0,18.3,17.4,14.0,10.4,8.7],    HR:[77,75,74,77,79,80,80,80,78,78,78,76] },
  Palencia:            { T:[4.1,5.6,7.5,9.5,13.0,17.2,20.7,20.3,17.9,13.0,7.6,4.4],      HR:[84,77,71,70,67,64,58,59,63,73,80,85] },
  PalmaDeMallorca:     { T:[11.6,11.8,12.9,14.7,17.6,21.8,24.6,25.3,23.5,20.0,15.6,13.0], HR:[71,69,68,67,69,69,67,71,73,72,72,71] },
  LasPalmas:           { T:[17.5,17.6,18.3,18.7,19.9,21.4,23.2,24.0,23.9,22.5,20.4,18.3], HR:[68,67,65,66,65,67,66,67,69,70,70,68] },
  Pamplona:            { T:[4.5,6.5,8.0,9.9,13.3,17.3,20.5,20.3,18.2,13.7,8.3,5.7],      HR:[80,73,68,66,66,62,58,61,61,68,76,79] },
  Pontevedra:          { T:[9.9,10.7,11.9,13.6,15.4,18.8,20.7,20.5,19.1,16.1,12.6,10.3], HR:[74,73,69,67,68,66,65,65,69,72,73,74] },
  SanSebastian:        { T:[7.9,8.5,9.4,10.7,13.5,16.1,18.4,18.7,18.0,15.2,10.9,8.6],    HR:[76,74,74,79,79,82,82,83,79,76,76,76] },
  Salamanca:           { T:[3.7,5.3,7.3,9.6,13.4,17.8,21.0,20.3,17.5,12.3,7.0,4.1],      HR:[85,78,69,66,62,58,50,53,62,74,82,86] },
  SantaCruzDeTenerife: { T:[17.9,18.0,18.6,19.1,20.5,22.2,24.6,25.1,24.4,22.4,20.7,18.8], HR:[66,66,62,61,60,59,56,58,63,65,67,66] },
  Santander:           { T:[9.7,10.3,10.8,11.9,14.3,17.0,19.3,19.5,18.5,16.1,12.5,10.5], HR:[71,71,71,74,75,77,77,78,77,75,73,72] },
  Segovia:             { T:[4.1,5.2,7.1,9.1,13.1,17.7,21.6,21.2,17.9,12.6,7.3,4.3],      HR:[75,71,65,65,61,55,47,49,55,65,73,78] },
  Sevilla:             { T:[10.7,11.9,14.0,16.0,19.6,23.4,26.8,26.8,24.4,19.5,14.3,11.1], HR:[79,75,68,65,59,56,51,52,58,67,76,79] },
  Soria:               { T:[2.9,4.0,5.8,8.0,11.8,16.1,19.9,19.5,16.5,11.3,6.1,3.4],      HR:[77,73,68,67,64,60,53,54,60,70,76,78] },
  Tarragona:           { T:[10.0,11.3,13.1,15.3,18.4,22.2,25.3,25.3,22.7,18.4,13.5,10.7], HR:[66,63,59,59,61,60,59,62,67,70,68,66] },
  Teruel:              { T:[3.8,4.8,6.8,9.3,12.6,17.5,21.3,20.6,17.9,12.1,7.0,4.5],      HR:[72,67,60,60,60,55,50,54,59,66,71,76] },
  Toledo:              { T:[6.1,8.1,10.9,12.8,16.8,22.5,26.5,25.7,22.6,16.2,10.7,7.1],   HR:[78,72,59,62,55,47,43,45,54,68,77,81] },
  Valencia:            { T:[10.4,11.4,12.6,14.5,17.4,21.1,24.0,24.5,22.3,18.3,13.7,10.9], HR:[63,61,60,62,64,66,67,69,68,67,66,64] },
  Valladolid:          { T:[4.1,6.1,8.1,9.9,13.3,18.0,21.5,21.3,18.6,12.9,7.6,4.8],      HR:[82,72,62,61,57,52,44,46,53,67,77,83] },
  Vitoria:             { T:[4.6,6.0,7.2,9.2,12.4,15.6,18.3,18.5,16.5,12.7,7.5,5.0],      HR:[83,78,72,71,71,71,69,70,70,74,81,83] },
  Zamora:              { T:[4.3,6.3,8.3,10.5,14.0,18.5,21.8,21.3,18.7,13.4,8.1,4.9],     HR:[83,75,65,63,59,54,47,50,58,70,79,83] },
  Zaragoza:            { T:[6.2,8.0,10.3,12.8,16.8,21.0,24.3,23.8,20.7,15.4,9.7,6.5],    HR:[76,69,60,59,55,52,48,54,61,70,75,77] },
}
// 52 capitales. Sin datos propios para localidades no capitales → §C3.
```

**B8 — Altitud de las capitales (DB-HE Anejo G, Tabla a, p. 54)** [m]. Uso para §C3 = **criterio**.
```ts
const PROC_ANEJO_G_ALT = { db: "DB-HE", edicion: "2019 (RD 732/2019)", fecha: "2022-06-14",
  articulo: "Anejo G", tabla: "Tabla a-Anejo G (columna Altitud)",
  fuente: "codigotecnico.org · DB-HE p. 54 — usada como altitud de referencia de la capital (criterio, el DA/2 no la fija)" } as const;
altitud_m: {
  ACoruna:26, Albacete:686, Alicante:8, Almeria:16, Avila:1131, Badajoz:186, Barcelona:12, Bilbao:6, Burgos:929,
  Caceres:459, Cadiz:14, Castellon:27, Ceuta:40, CiudadReal:628, Cordoba:106, Cuenca:999, Girona:70, Granada:683,
  Guadalajara:685, Huelva:30, Huesca:488, Jaen:568, LasPalmas:13, Leon:838, Lleida:182, Logrono:385, Lugo:454,
  Madrid:655, Malaga:11, Melilla:15, Murcia:39, Ourense:139, Oviedo:232, Palencia:734, PalmaDeMallorca:15,
  Pamplona:490, Pontevedra:27, Salamanca:800, SanSebastian:12, SantaCruzDeTenerife:5, Santander:11, Segovia:1002,
  Sevilla:11, Soria:1063, Tarragona:69, Teruel:912, Toledo:629, Valencia:13, Valladolid:698, Vitoria:540,
  Zamora:649, Zaragoza:199,
}
```

**B9 — U orientativas (DB-HE Anejo E, Tabla a-Anejo E, p. 51; residencial privado)** [W/m²K], α/A/B/C/D/E
```ts
UM_US: [0.56,0.50,0.38,0.29,0.27,0.23], UC: [0.50,0.44,0.33,0.23,0.22,0.19],
UT:    [0.80,0.80,0.69,0.48,0.48,0.48], UH: [2.7,2.7,2.0,2.0,1.6,1.5],
// «Los valores anteriores presuponen un correcto tratamiento de los puentes térmicos.»
```

### C. Fórmulas

**C1 — UH (DA/1 ec. 10), predimensionado de una ventana de un solo paño W×H**
```
Aw = W·H
b  = [(W+H) − √((W+H)² − 4·W·H·FF)] / 4          // ancho de marco que da la fracción FF (por defecto 0,25)
Ag = (W−2b)(H−2b) = (1−FF)·Aw ;  Af = FF·Aw
lg = 2(W−2b) + 2(H−2b)                            // editable; con varias hojas es mayor (pendiente 2)
UH = (Ag·Ug + Af·Uf + lg·Ψg [+ Ap·Up + lp·Ψp]) / (Ag + Af [+ Ap])
Ejemplo: 1,20×1,20, FF 0,25 → b 0,080 m, lg 4,16 m; Ug 1,6, Uf 1,8, Ψ 0,08 → UH = 1,20 + 0,45 + 0,23 = 1,88 W/m²K
```
La ficha declara Ag, Af, Ug, Uf, Ψ, lg y UH (HE1 ap. 4 párr. 3 d). Veredicto: UH ≤ Ulim (Tabla 3.1.1.a). Sin fRsi ni Glaser.

**C2 — Forjado sobre el local (CASO 2)**
```
UP = 1 / (0,17 + ΣRi + 0,17)       // DA/1 Tabla 6, flujo descendente
U  = UP · b                         // b = 1 por defecto (Tabla 7 o ec. 7 opcionales)
CUMPLE ⟺ U ≤ UT(zona)               // C: 0,70
```

**C3 — Condiciones exteriores en una localidad que no es capital (DA/2 §2.1, ec. [1]-[2])**
```
si h_loc ≤ h_cap: θe,loc = θe,cap ; φe,loc = φe,cap          // «se toma … la temperatura y humedad de la capital»
si h_loc > h_cap: θe,loc = θe,cap − (h_loc − h_cap)/100
                  Pe     = φe,cap · Psat(θe,cap)             // ec. [1]
                  φe,loc = Pe / Psat(θe,loc)                 // ec. [2]
(h_cap de §B8, criterio; Psat por ec. [3]/[4])
```
