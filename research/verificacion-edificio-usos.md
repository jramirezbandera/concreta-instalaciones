# Verificación normativa — pantalla «El edificio»: usos, superficies y «Su superficie cuenta para»

**Fecha:** 2026-10-03
**Ámbito:** bloques A–F del encargo:
- DB-SI 3;
- REBT ITC-BT-10;
- DB-HS 3 (ámbito y Tabla 2.2);
- RITE IT 1.1.4.2;
- DB-HS 6 (ámbito).

**Regla aplicada:** ninguna cifra se da por buena sin haber leído el texto oficial. Cada fila indica qué fuente se leyó.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición vigente leída | Fuente | Lectura |
|---|---|---|---|---|
| [SI] | DB-SI (CTE) | Texto consolidado «4 marzo 2025» (incluye RD 164/2025) | codigotecnico.org, `DBSI.pdf` | Íntegra |
| [HS] | DB-HS (CTE): HS 3, HS 4, HS 6 | Texto consolidado «14 junio 2022» (FOM/588/2017, RD 732/2019, RD 450/2022) | codigotecnico.org, `DBHS.pdf` | Íntegra |
| [RITE] | RITE, RD 1027/2007 | BOE-A-2007-15820, consolidado, «Última modificación: 02 de agosto de 2022» | boe.es, PDF consolidado | Íntegra |
| [REBT] | REBT, RD 842/2002 e ITC | BOE-A-2002-18099, consolidado, «Última modificación: 03 de septiembre de 2025» (incluye RD 1053/2014 e ITC-BT-52) | boe.es, PDF consolidado | Íntegra. ITC-BT-10 en pp. 97–100; también BT-04, 15, 25, 28, 29 y 52 |

Todos los textos consolidados advierten que son «de carácter informativo y no tiene[n] valor jurídico». La referencia jurídica es la publicación en el BOE.

**No leídos (intentados o fuera de alcance):**
- Comentarios del Ministerio al DB-SI: no consultados.
- Guía técnica de aplicación de la ITC-BT-10 (Ministerio de Industria): `industria.gob.es` devolvió HTTP 403 y la réplica `f2i2.net`, HTTP 404.
- BOE original de 18-09-2002: necesario para cotejar dos erratas de la Tabla 1 de la ITC-BT-10 (ver B2).
- DB-HS 6, Apéndice B (relación de municipios): leído, pero no transcrito celda a celda.
- UNE-EN 16798-3 / UNE-EN 13779, citadas por el RITE.
- Redacción de HS 3 anterior a FOM/588/2017: no cotejada (ver C4).

---

## Bloque A — DB-SI, Sección SI 3, ap. 2.1, Tabla 2.1 «Densidades de ocupación»

Las densidades se aplican «en función de la superficie útil de cada zona» (SI 3, ap. 2.1). Unidad: m² útiles por persona.

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| A1 | Residencial Vivienda, plantas de vivienda → 20 | VERIFICADO | 20 | DB-SI, SI 3, ap. 2.1, Tabla 2.1; uso «Residencial Vivienda», zona «Plantas de vivienda» | [SI] |
| A2 | Administrativo: oficinas → 10; vestíbulos generales y zonas de uso público → 2 | VERIFICADO | 10 y 2 | Ídem, uso «Administrativo»: «Plantas o zonas de oficinas» = 10; «Vestíbulos generales y zonas de uso público» = 2 (sin calificador de planta) | [SI] |
| A3 | Aparcamiento: vinculado a una actividad sujeta a horarios → 15; en otros casos → 40 | VERIFICADO | 15 / 40 | Ídem, uso «Aparcamiento (2)». Nota (2): los aparcamientos robotizados se consideran sin ocupación | [SI] |
| A4 | Comercial: áreas de ventas en sótano, baja y entreplanta → 2; en otras plantas → 3 | VERIFICADO | 2 / 3 | Ídem, uso «Comercial» | [SI] |
| A5 | Cualquier uso: ocupación ocasional, accesible solo para mantenimiento → nula | VERIFICADO | Ocupación nula | Ídem, uso «Cualquiera»: «Zonas de ocupación ocasional y accesibles únicamente a efectos de mantenimiento: salas de máquinas, locales para material de limpieza, etc.» | [SI] |
| A6 | Cualquier uso: vestíbulos generales / zonas de uso público en sótano, baja y entreplanta → 2 | **CORREGIDO** | La fila no existe en «Cualquiera» (ver nota A6 bajo la tabla) | Tabla 2.1, filas por uso | [SI] |
| A7 | ¿Cómo se trata un «local sin uso definido»? | **NO VERIFICABLE** como criterio específico: el DB no lo regula | No hay densidad para un «local sin uso». Lo que sí dice el DB, en nota A7 bajo la tabla | SI 3 ap. 2.1; DB-SI Introducción III, crit. 2; Anejo SI A | [SI]. Comentarios del Ministerio: no leídos |
| A8 | Trasteros → «Archivos, almacenes» = 40 | VERIFICADO (la fila), con matiz de aplicación | La fila «Archivos, almacenes» = 40 existe, pero **no** aplica a los trasteros de vivienda (ver nota A8 bajo la tabla) | Tabla 2.1; Anejo SI A, «Zona de ocupación nula»; Introducción III, crit. 5 y 6 | [SI] |

**Nota A6 — dónde aparece el 2.** En «Cualquiera» solo hay dos filas: mantenimiento (ocupación nula) y «Aseos de planta» (3). El 2 aparece por uso:
- **Residencial Público:** «Vestíbulos generales y zonas generales de uso público en plantas de sótano, baja y entreplanta».
- **Pública concurrencia:** misma zona, con el mismo calificador de planta.
- **Administrativo:** vestíbulos y zonas de uso público, sin calificador de planta.

Los demás usos no tienen fila de vestíbulos:
- **Comercial:** tiene «zonas comunes de centros comerciales», con 3 en sótano, baja, entreplanta o con acceso exterior, y 5 en otras plantas.
- **Residencial Vivienda:** no tiene ninguna.

**Nota A7 — lo que sí dice el DB-SI para un local sin uso.**
- SI 3, ap. 2.1: para zonas no incluidas en la tabla, usar «los valores correspondientes a los que sean más asimilables».
- Introducción III, criterio 2: aplicar las condiciones «del uso al que mejor puedan asimilarse».
- Anejo SI A, «Superficie útil»: en uso Comercial sin implantación definida, la superficie útil de las zonas de público es, como mínimo, el 75 % de su superficie construida.

**Nota A8 — trasteros.**
- Los **trasteros de viviendas** son «zona de ocupación nula»: la definición del Anejo SI A los cita expresamente.
- El 40 corresponde al uso Almacén o archivos (Introducción III, crit. 5).
- También a los establecimientos de alquiler de trasteros, que el crit. 6 asimila al uso Almacén.

**Notas complementarias verificadas [SI]:**
- Tabla 2.1, nota (1): considerar los usos especiales o circunstanciales, o hacer constar en el proyecto y en el Libro del edificio que solo se han considerado los usos característicos.
- SI 3, ap. 2.2: considerar el uso simultáneo o alternativo de las zonas.
- Anejo SI A: las zonas de ocupación nula de más de 50 m² se consideran origen de evacuación.
- Anejo SI A, uso Aparcamiento: superficie construida > 100 m²; quedan excluidos los garajes de vivienda unifamiliar.
- SI 1, Tabla 2.1: los trasteros en Residencial Vivienda son local de riesgo especial:
  - bajo, si 50 < S ≤ 100 m²;
  - medio, si 100 < S ≤ 500 m²;
  - alto, si S > 500 m².

---

## Bloque B — REBT, ITC-BT-10 «Previsión de cargas para suministros en baja tensión»

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| B1 | Electrificación básica 5.750 W a 230 V; elevada 9.200 W; es elevada si la superficie útil supera 160 m², etc. | VERIFICADO, con matiz sobre los criterios | 5.750 W y 9.200 W confirmados; los criterios de «elevada», en nota B1 bajo la tabla | ITC-BT-10 ap. 2.1.1, 2.1.2 y 2.2; ITC-BT-25 ap. 2.3.2 | [REBT] |
| B2 | Existe una Tabla 1 de coeficiente de simultaneidad según el nº de viviendas | VERIFICADO | Título literal: «Tabla 1. Coeficiente de simultaneidad, según el número de viviendas». Detalle y erratas, en nota B2 | ITC-BT-10 ap. 3.1 y Tabla 1; ap. 3.2 | [REBT] |
| B3 | Locales comerciales y oficinas: 100 W/m², mínimo 3.450 W a 230 V por local, simultaneidad 1 | VERIFICADO, con matiz sobre la superficie base | Literal: «un mínimo de 100 W por metro cuadrado y planta, con un mínimo por local de 3450 W a 230 V y coeficiente de simultaneidad 1». Ver nota B3 | ITC-BT-10 ap. 3.3 y 4.1 | [REBT] |
| B4 | Garajes: 10 W/m² con ventilación natural, 20 W/m² con forzada, mínimo 3.450 W, simultaneidad 1 | VERIFICADO, con matices | Literal: «10 W por metro cuadrado y planta para garajes de ventilación natural y de 20 W para los de ventilación forzada, con un mínimo de 3450 W a 230 V y coeficiente de simultaneidad 1». Ver nota B4 | ITC-BT-10 ap. 3.4 y 5.2; ITC-BT-52 ap. 4.1 | [REBT] |

**Nota B1.**
- **Potencias (ap. 2.2):** para nuevas construcciones, la potencia a prever «no será inferior a 5 750 W a 230 V, en cada vivienda». «En las viviendas con grado de electrificación elevada, la potencia a prever no será inferior a 9 200 W.»
- **Capacidad máxima:** la potencia a prever corresponde a la intensidad asignada del interruptor general automático (IGA), según remite a la ITC-BT-25.
- **Criterios de electrificación elevada (ap. 2.1.2):**
  - previsión de electrodomésticos por encima de la electrificación básica;
  - calefacción eléctrica;
  - acondicionamiento de aire;
  - superficie útil de la vivienda > 160 m²;
  - recarga de vehículo eléctrico (VE) en vivienda unifamiliar;
  - cualquier combinación de los anteriores.
- **Lo que no es de la ITC-BT-10:** los umbrales «> 30 puntos de luz», «> 20 tomas», «> 6 tomas de baño o cocina», secadora y automatización. Son los circuitos adicionales C6–C13 de la ITC-BT-25, ap. 2.3.2.

**Nota B2.**
- **Uso (ap. 3.1):** la carga se obtiene multiplicando la media aritmética de las potencias máximas previstas por el coeficiente.
- **Más de 21 viviendas:** coeficiente = 15,3 + (n − 21) · 0,5.
- **Tarifa nocturna:** el coeficiente es igual al nº de viviendas.
- **Interpretación:** el coeficiente es un nº equivalente de viviendas (p. ej. 10 viviendas → 8,5), no un factor menor o igual que 1.
- **Servicios generales (ap. 3.2):** se suman sin reducción (simultaneidad = 1).
- **Erratas del consolidado:**
  - n = 19 aparece como «14 3»;
  - n = 21 aparece como «15 3».
  - El 15,3 lo confirma la fórmula. El 14,3 queda pendiente de cotejar con el BOE original.

**Nota B3.**
- **Dónde aparece el valor:** en el ap. 3.3 (locales y oficinas dentro de un edificio destinado preferentemente a viviendas) y en el ap. 4.1 (edificios comerciales o de oficinas).
- **Son mínimos:** según el ap. 4, «la demanda de potencia determinará la carga a prever … que no podrá ser nunca inferior» a esos valores.
- **Superficie base:** el texto dice «por metro cuadrado y planta» y **no precisa** si se refiere a superficie útil o construida.

**Nota B4.**
- **Humos de incendio (mismo ap. 3.4):** si la ventilación forzada se exige para evacuar humos de incendio, la previsión «se estudiará de forma específica». El texto cita la NBE-CPI-96; hoy el equivalente es el DB-SI, SI 3 ap. 8.
- **Ámbito del ratio:** el ap. 3.4 está dentro del apartado 3 (edificio preferentemente de viviendas). El ap. 4 (edificios comerciales y de oficinas) no da ratio para garajes.
- **Recarga de VE (ap. 5.2, introducido por RD 1053/2014):** 3.680 W × 10 % de las plazas, multiplicado por la simultaneidad de la ITC-BT-52 ap. 4.1:
  - 0,3 con sistema de protección de la línea general de alimentación (SPL);
  - 1,0 sin SPL.

**Otras ITC del REBT relevantes para la pantalla [REBT]:**
- **ITC-BT-10, estructura:**
  - El ap. 1 añade como lugar de consumo los «aparcamientos o estacionamientos dotados de infraestructura para la recarga de los vehículos eléctricos».
  - El índice del consolidado no está actualizado. En el cuerpo, la numeración es:
    - ap. 5 = recarga de VE;
    - ap. 6 = previsión de cargas;
    - ap. 7 = suministros monofásicos.
  - Hay que citar por el cuerpo.
- **ITC-BT-15 ap. 2:** «En locales donde no esté definida su partición, se instalará como mínimo un tubo por cada 50 m² de superficie.» Es útil para el local en bruto.
- **ITC-BT-28 ap. 1 (locales de pública concurrencia):**
  - Los estacionamientos cerrados y cubiertos para más de 5 vehículos lo son siempre, cualquiera que sea su ocupación.
  - Las oficinas con presencia de público y los establecimientos comerciales lo son si su ocupación supera 50 personas.
  - Esa ocupación se calcula a 1 persona por 0,8 m² útiles, excluidos pasillos, repartidores, vestíbulos y servicios.
  - Es una densidad propia del REBT: **no mezclarla con SI 3**.
- **ITC-BT-29 ap. 4.2 (lista orientativa):** los garajes son emplazamiento de Clase I, salvo los de uso privado para 5 vehículos o menos.
- **ITC-BT-04 ap. 3.1 (instalaciones que exigen proyecto):**
  - grupo e: viviendas, locales comerciales y oficinas que no sean de pública concurrencia, con P > 100 kW por caja general de protección;
  - grupo g: aparcamientos con ventilación forzada, cualquiera que sea su ocupación;
  - grupo h: aparcamientos con ventilación natural de más de 5 plazas;
  - grupo i: locales de pública concurrencia, sin límite de potencia.

---

## Bloque C — DB-HS, Sección HS 3, ap. 1.1 (ámbito)

Texto vigente literal (DB-HS consolidado 14-jun-2022, HS 3, ap. 1.1):

> «1 Esta sección se aplica, en los edificios de viviendas, al interior de las mismas, los almacenes de residuos, los trasteros, los aparcamientos y garajes; y, en los edificios de cualquier otro uso, a los aparcamientos y los garajes. Se considera que forman parte de los aparcamientos y garajes las zonas de circulación de los vehículos. 2 Para locales de cualquier otro tipo se considera que se cumplen las exigencias básicas si se observan las condiciones establecidas en el RITE.»

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| C1 | (a) Se aplica en edificios de viviendas, al interior de las mismas | VERIFICADO | — | HS 3 ap. 1.1, párr. 1 | [HS] |
| C2 | (b) Se aplica a almacenes de residuos, trasteros, aparcamientos y garajes «de cualquier tipo de edificio» | **CORREGIDO** | Almacenes de residuos y trasteros: **solo en edificios de viviendas**. Aparcamientos y garajes: en edificios de viviendas y de cualquier otro uso, incluidas sus zonas de circulación. Es coherente con el título del ap. 3.1.4, «Aparcamientos y garajes de cualquier tipo de edificio» | HS 3 ap. 1.1, párr. 1; ap. 3.1.4 | [HS] |
| C3 | Para el resto de locales, las exigencias se consideran cumplidas observando el RITE | VERIFICADO | Literal en el párr. 2. El RITE lo refleja en IT 1.1.4.2.1, apdo. 1 (viviendas y garajes cumplen con HS 3) y apdo. 2 («El resto de edificios dispondrá de un sistema de ventilación … de acuerdo con lo que se establece en el apartado 1.4.2.2 y siguientes») | HS 3 ap. 1.1, párr. 2; RITE IT 1.1.4.2.1 | [HS], [RITE] |
| C4 | ¿La edición 2019/2022 amplió el ámbito a «edificios de cualquier otro uso» para la calidad del aire interior? | **No**, en la redacción vigente | La única extensión a «edificios de cualquier otro uso» es para aparcamientos y garajes. No he cotejado la redacción anterior a FOM/588/2017; solo afirmo el texto vigente | HS 3 ap. 1.1 | [HS] vigente; texto histórico no leído |
| C5 | Edificio solo de oficinas, sin garaje ni trasteros → HS 3 «no aplica» | VERIFICADO | Mostrar: «HS 3: no aplica. Exigencia de calidad del aire interior cumplida mediante el RITE (HS 3 ap. 1.1, párr. 2; RITE IT 1.1.4.2.1, apdo. 2)». Además, un trastero en un edificio de oficinas queda fuera de HS 3 y se rige por el RITE | HS 3 ap. 1.1; RITE IT 1.1.4.2.1 | [HS], [RITE] |

---

## Bloque D — DB-HS, HS 3, ap. 2, Tabla 2.2 (locales no habitables)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| D1 | Trasteros y sus zonas comunes: 0,7 l/s por m² útil | VERIFICADO, vigente | 0,7 l/s·m² útil | HS 3 ap. 2, Tabla 2.2, «Trasteros y sus zonas comunes» | [HS] consolidado 14-jun-2022 |
| D2 | Aparcamientos y garajes: 120 l/s por plaza | VERIFICADO, vigente | 120 l/s·plaza | Ídem, «Aparcamientos y garajes» | [HS] |
| D3 | (ya en el repo) Almacenes de residuos: 10 l/s por m² útil | VERIFICADO, vigente | 10 l/s·m² útil | Ídem, «Almacenes de residuos» | [HS] |

**Estado del repo:**
- Los valores de `CAUDALES_NO_HABITABLES` en `src/modules/hs3/tablas.ts` coinciden con la Tabla 2.2.
- Sugerencia: que la procedencia registre que la verificación se hizo contra el DB-HS consolidado de 14-jun-2022, donde la Tabla 2.2 no cambia.
- No he editado el archivo.

**Notas de aplicación [HS]:**
- Por el ámbito (C2), las filas de trasteros y de almacén de residuos solo aplican en edificios de viviendas.
- Ap. 2.5–2.6: el caudal puede ser constante o variable, gobernado por detectores, temporización o similar.
- Ap. 3.1.4.1.2: los garajes de ≤ 5 plazas y ≤ 100 m² pueden ventilar con aberturas separadas verticalmente ≥ 1,5 m.
- Ap. 3.1.4.2.1: los trasteros situados dentro del recinto del aparcamiento pueden compartir su ventilación.
- Ap. 3.1.4.2.6: a partir de 15 plazas, al menos 2 redes de extracción por planta.
- Ap. 3.1.4.2.7: en aparcamientos de más de 5 plazas o de más de 100 m², detección de CO:
  - a 50 ppm si hay empleados;
  - a 100 ppm en otro caso.
- **No confundir con SI 3:** el caudal de SI 3 ap. 8.2 (extracción 150 l/plaza·s, impulsión ≤ 120 l/plaza·s) es **control de humo de incendio**, no ventilación de HS 3. No debe confundirse con los 120 l/s·plaza de la Tabla 2.2.

---

## Bloque E — RITE, IT 1.1.4.2 (calidad del aire interior)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| E1 | Oficinas → IDA 2 → 12,5 dm³/s por persona | VERIFICADO | 12,5 dm³/(s·persona) | Categoría: IT 1.1.4.2.2 («como mínimo»; IDA 2 incluye «oficinas»). Caudal: IT 1.1.4.2.3.1, método A, letra a), Tabla 1.4.2.1 «Caudales de aire exterior, en dm³/s por persona» | [RITE] |
| E2 | Comercio → IDA 3 → 8 dm³/s por persona | VERIFICADO | 8 dm³/(s·persona) | IT 1.1.4.2.2 (IDA 3 incluye «edificios comerciales»); Tabla 1.4.2.1 | [RITE] |

**Tabla 1.4.2.1 completa:** IDA 1 = 20; IDA 2 = 12,5; IDA 3 = 8; IDA 4 = 5 dm³/(s·persona).

**Condiciones de uso (IT 1.1.4.2.3.1):**
- Es uno de cinco métodos posibles: el texto dice «alguno de los cinco métodos» (A a E).
- El método A, «Método indirecto de caudal de aire exterior por persona», vale con estas condiciones:
  - actividad metabólica de unos 1,2 met;
  - baja producción de contaminantes no humanos;
  - espacio sin fumadores.
- Con fumadores, el caudal será al menos el doble (letra b).
- Las zonas de fumadores serán estancas y estarán en depresión (letra c).

**Locales no dedicados a ocupación humana permanente:** método D, Tabla 1.4.2.4, en dm³/(s·m²):

| IDA 1 | IDA 2 | IDA 3 | IDA 4 |
|---|---|---|---|
| No aplicable | 0,83 | 0,55 | 0,28 |

**Ámbito (IT 1.1.4.2.1):** el RITE no rige la ventilación del interior de las viviendas ni la de aparcamientos y garajes, que cubre HS 3. Rige «el resto de edificios».

**Extracción (IT 1.1.4.2.5):**
- AE1: oficinas y locales comerciales sin emisiones específicas.
- AE2: aseos y almacenes.
- AE4: aparcamientos.
- Locales de servicio: extracción ≥ 2 dm³/(s·m²).

**Otros puntos:**
- IT 1.2.4.7.2: los locales no habitables no se climatizan, salvo con energía renovable o residual.
- **Inconsistencia interna del texto:** las denominaciones de las IDA no coinciden.
  - El Apéndice 1 llama a IDA 2 «calidad media» y a IDA 3 «calidad mediocre».
  - IT 1.1.4.2.2 las llama «buena» y «media».
  - En la UI, usar la denominación de IT 1.1.4.2.2 y citarla.

---

## Bloque F — DB-HS, Sección HS 6 (radón), ámbito

| # | Pregunta | Veredicto | Respuesta | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| F1 | ¿Aplica a edificios nuevos de cualquier uso? | VERIFICADO, con condición territorial | Sí, a edificios de nueva construcción de cualquier uso, **pero solo en los municipios del Apéndice B**. También a intervenciones (ver nota F1) | HS 6 ap. 1, párr. 1 | [HS] |
| F2 | ¿Se aplica en los «espacios habitables»? | VERIFICADO (el término es «locales habitables») | No aplica a los locales no habitables, por su bajo tiempo de permanencia. Tampoco a los locales habitables separados del terreno por espacios abiertos intermedios con ventilación análoga a la del exterior | HS 6 ap. 1, párr. 2, letras a) y b) | [HS] |
| F3 | ¿Qué dice de los locales no habitables en contacto con el terreno (garaje, trasteros)? | VERIFICADO | No están afectados: el Apéndice A define «local no habitable» citando expresamente «garajes, trasteros y cuartos técnicos». Pueden servir de «espacio de contención» (ap. 3.2.1); en ese caso, la ventilación exigida por HS 3 o por el RITE «se considera … suficiente» (ap. 3.2.5) | HS 6 ap. 1, párr. 2 a); Apéndice A; ap. 3.2.1 y 3.2.5 | [HS] |

**Nota F1 — intervenciones en edificios existentes:**
- **ampliación:** se aplica a la parte nueva;
- **cambio de uso:** a todo el edificio si cambia el uso característico; si no, a la zona afectada;
- **reforma:** a la zona afectada, cuando se modifica la protección frente al radón.

**Otros puntos de HS 6:**
- Nivel de referencia: 300 Bq/m³ como promedio anual (ap. 2).
- Soluciones por zona (ap. 3):
  - zona I: barrera de protección o, alternativamente, cámara de aire ventilada;
  - zona II: barrera más espacio de contención ventilado, o despresurización.
- El Apéndice B (municipios de zona I y zona II) no está transcrito. Esto bloquea cualquier «HS 6 aplica» automático.

---

## Consecuencia para «Su superficie cuenta para» (por tipo de zona)

| Zona | SI 3 (m² útiles/persona) | HS 3 | RITE (ventilación) | ITC-BT-10 | HS 6 |
|---|---|---|---|---|---|
| Vivienda | 20 | Sí (interior de vivienda, Tabla 2.1) | No (lo cubre HS 3) | Se prevé por vivienda, no por m²: 5.750 W o 9.200 W; superficie útil > 160 m² → elevada | Local habitable: solo si el municipio está en el Apéndice B |
| Oficina | 10 | No aplica (vía RITE) | IDA 2: 12,5 dm³/s·persona (método A) | 100 W/m²·planta, mínimo 3.450 W por local | Ídem (local habitable) |
| Comercial (área de ventas) | 2 (sótano, baja, entreplanta) o 3 | No aplica (vía RITE) | IDA 3: 8 dm³/s·persona | 100 W/m²·planta, mínimo 3.450 W por local | Ídem |
| Trastero en edificio de viviendas | Ocupación nula (Anejo SI A) | 0,7 l/s·m² útil | No se climatiza (IT 1.2.4.7.2) | Sin ratio propio | No (no habitable) |
| Trastero en edificio de otro uso | Nula, o 40 si es uso Almacén | No aplica (vía RITE) | Método D, Tabla 1.4.2.4, según la IDA que se asigne | Sin ratio propio | No |
| Garaje | 15 o 40 (es uso Aparcamiento si supera 100 m² construidos) | 120 l/s·plaza (en cualquier uso) | No (lo cubre HS 3) | 10 W/m² (ventilación natural) o 20 W/m² (forzada), mínimo 3.450 W; más la recarga de VE | No; puede servir de espacio de contención |
| Local sin uso definido | El DB no da criterio: asignar un uso asimilable. Si es Comercial sin implantación, superficie útil ≥ 75 % de la construida de las zonas de público | No aplica (vía RITE, cuando tenga uso) | Según el uso asignado | 100 W/m²·planta, mínimo 3.450 W (como local comercial); ITC-BT-15: 1 tubo por cada 50 m² | Según el uso |

---

## Cifras que SÍ se pueden mostrar en la UI, con su cita

1. **Densidades de SI 3.** Cita: «DB-SI, SI 3, ap. 2.1, Tabla 2.1 (consolidado 4-mar-2025)». En m² útiles por persona:
   - vivienda: 20;
   - oficinas: 10;
   - vestíbulos y zonas de uso público administrativas: 2;
   - aparcamiento: 15 o 40;
   - comercial, áreas de ventas: 2 o 3;
   - zonas de mantenimiento: ocupación nula;
   - aseos de planta: 3;
   - archivos y almacenes: 40.

   Para los vestíbulos, citar la fila del uso concreto (Residencial Público, Pública concurrencia o Administrativo), nunca «Cualquiera».
2. **Trasteros de vivienda:** «ocupación nula — DB-SI, Anejo SI A, definición de zona de ocupación nula».
3. **HS 3, Tabla 2.2** (DB-HS consolidado 14-jun-2022):
   - trasteros: 0,7 l/s·m² útil, solo en edificios de viviendas;
   - garajes: 120 l/s·plaza, en cualquier uso;
   - almacén de residuos: 10 l/s·m² útil, solo en edificios de viviendas.
4. **«HS 3 no aplica; cumplimiento vía RITE — DB-HS, HS 3 ap. 1.1, párr. 2; RITE IT 1.1.4.2.1».** Vale para cualquier zona que no sea vivienda, garaje, o trastero o almacén de residuos de un edificio de viviendas.
5. **RITE** (RD 1027/2007, consolidado 02-08-2022):
   - oficinas: IDA 2, 12,5 dm³/s·persona;
   - comercial: IDA 3, 8 dm³/s·persona.

   Cita: «IT 1.1.4.2.2 + IT 1.1.4.2.3.1, método A, letra a), Tabla 1.4.2.1». Etiquetar siempre como «método A, mínimo».
6. **ITC-BT-10** (REBT, BOE consolidado 03-09-2025):
   - 5.750 W a 230 V o 9.200 W por vivienda (ap. 2.2);
   - electrificación elevada si la superficie útil supera 160 m², o por los demás criterios del ap. 2.1.2;
   - locales y oficinas: 100 W/m²·planta, mínimo 3.450 W por local, simultaneidad 1 (ap. 3.3 y 4.1);
   - garajes: 10 o 20 W/m²·planta, mínimo 3.450 W, simultaneidad 1 (ap. 3.4);
   - la Tabla 1, por su nombre literal, y la fórmula para más de 21 viviendas.
7. **HS 6, como texto fijo:** «Aplica solo si el municipio figura en el Apéndice B del DB-HS 6; protege los locales habitables; garajes y trasteros no están afectados — HS 6 ap. 1 y Apéndice A».

## Cifras que NO deben mostrarse todavía

1. **Cualquier densidad de SI 3 para un «local sin uso definido».** El DB no la da. La UI debe pedir al usuario el uso asimilable (SI 3 ap. 2.1; Introducción III, crit. 2).
2. **Una fila «Cualquier uso — vestíbulos = 2».** No existe.
3. **«40 m²/persona» aplicado a trasteros de vivienda.** Les corresponde ocupación nula.
4. **Un ratio de HS 3 para trasteros o almacenes de residuos en edificios que no son de viviendas.** Están fuera del ámbito de HS 3.
5. **Un caudal del RITE para trasteros o almacenes de edificios no residenciales (Tabla 1.4.2.4).** Los valores están verificados, pero exigen asignar una IDA que el RITE no fija para esos locales. No mostrar ningún número hasta que el técnico elija la IDA.
6. **«150 / 120 l/plaza·s» (SI 3 ap. 8.2) presentado como caudal de ventilación.** Es control de humo, no HS 3.
7. **Una potencia total «100 W × superficie útil» sin etiqueta de criterio.** La ITC-BT-10 dice «por metro cuadrado y planta» sin precisar si es útil o construida. Si se calcula con la útil, etiquetarlo como criterio de aplicación del proyectista, no como exigencia literal. La Guía técnica no se pudo leer.
8. **Los umbrales «> 30 puntos de luz, > 20 tomas, > 6 tomas de baño o cocina» presentados como criterios de la ITC-BT-10.** Son de la ITC-BT-25, ap. 2.3.2.
9. **El valor de la Tabla 1 de la ITC-BT-10 para 19 viviendas** (el consolidado imprime «14 3»). Pendiente de cotejar con el BOE original.
10. **Un resultado automático «HS 6 aplica / no aplica» por municipio.** El Apéndice B no está transcrito.
11. **La densidad de 0,8 m²/persona de la ITC-BT-28 mezclada con SI 3.** Son criterios distintos: la primera es del REBT para pública concurrencia; la segunda, del DB-SI para evacuación.

---

## Procedencia sugerida para `shared/tablas` (metadatos, sin código)

| db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|
| DB-SI | Consolidado (incluye RD 164/2025) | 2025-03-04 | SI 3, ap. 2.1 | Tabla 2.1 | codigotecnico.org, `DBSI.pdf` |
| DB-HS3 | FOM/588/2017, verificada en el consolidado DB-HS | 2022-06-14 | HS 3, ap. 2 | Tabla 2.2 | codigotecnico.org, `DBHS.pdf` |
| DB-HS6 | RD 732/2019, verificada en el consolidado DB-HS | 2022-06-14 | HS 6, ap. 1 | — (Apéndice B pendiente) | codigotecnico.org, `DBHS.pdf` |
| RITE | RD 1027/2007, consolidado | 2022-08-02 | IT 1.1.4.2.2; IT 1.1.4.2.3.1, método A, letra a) | Tabla 1.4.2.1 (y Tabla 1.4.2.4) | BOE-A-2007-15820 |
| REBT ITC-BT-10 | RD 842/2002, consolidado (incluye RD 1053/2014) | 2025-09-03 | ap. 2.2, 3.1, 3.3, 3.4, 4.1 y 5.2 | Tabla 1 | BOE-A-2002-18099 |

## Pendientes

1. Cotejar la Tabla 1 de la ITC-BT-10 (19 y 21 viviendas) con el BOE de 18-09-2002.
2. Transcribir celda a celda el Apéndice B de HS 6.
3. Leer los Comentarios del Ministerio al DB-SI sobre el local sin uso definido.
4. Obtener la Guía técnica de aplicación de la ITC-BT-10, para saber si los W/m² se aplican sobre superficie útil o construida.
