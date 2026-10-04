# Verificación normativa — HS 3 v4: ventilación del edificio (viviendas tipo, garaje, trasteros, local sin uso y oficinas)

**Fecha:** 2026-10-04
**Ámbito:** los 10 puntos del encargo para el rediseño del módulo HS 3 a partir del modelo de edificio:
- viviendas tipo (T1, T2, T3…);
- garaje en sótano con N plazas;
- trasteros (m²);
- local sin uso en planta baja;
- oficinas.

Los 10 puntos:
1. Sistema general de la vivienda: mecánica o híbrida.
2. Aberturas de admisión, de extracción y de paso.
3. Equilibrado de caudales.
4. Cocción.
5. Tabla 4.1.
6. Sección de los conductos.
7. Garaje.
8. Trasteros.
9. Local sin uso y oficinas.
10. Edición vigente y forma de citarla.

**Regla aplicada:** ninguna cifra se da por buena sin haber leído el texto oficial. Cada fila indica qué fuente se leyó. Veredictos:
- VERIFICADO: literal en el DB, o lectura directa de una tabla del DB.
- **CORREGIDO**: la afirmación del encargo o del repo no coincide con el DB.
- **NO VERIFICABLE**: el DB no lo dice, o la fuente no se ha podido leer.
- **CRITERIO**: decisión de proyecto propuesta. No es exigencia del CTE y la ficha debe etiquetarla así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición leída | Fuente | Lectura |
|---|---|---|---|---|
| [HS22] | DB-HS, Sección HS 3 | Texto consolidado «14 junio 2022» | codigotecnico.org, `DBHS.pdf` | HS 3 íntegra (pp. 63–80) y pp. 1–2 (portada y cadena de disposiciones) |
| [DccHS] | DB-HS con comentarios del Ministerio | Articulado de 14-06-2022; comentarios de 12-02-2025 | codigotecnico.org, `DccHS.pdf` | HS 3 íntegra (pp. 67–87), con todos sus comentarios |
| [FOM] | Orden FOM/588/2017 | BOE 23/06/2017, BOE-A-2017-7163 | boe.es (WebFetch) | Lista de apartados de HS 3 que modifica. Búsqueda de «12207» y de «3.1.1»: sin resultados |
| [RD732] | RD 732/2019 | BOE 27/12/2019, BOE-A-2019-18528 | boe.es (WebFetch) | Solo búsqueda dirigida: no menciona HS 3. «12207» aparece únicamente en el Anejo C del DB-HR |
| [EU] | `research/verificacion-edificio-usos.md` | RITE, RD 1027/2007, consolidado «Última modificación: 02 de agosto de 2022» | boe.es, leído íntegro en esa sesión | Bloque E (IT 1.1.4.2) |
| [REPO] | `src/modules/hs3/tablas.ts`, `calc.ts`, `ficha.ts`, `ui.tsx` | rama `rediseno-v4` | repo | Íntegro `tablas.ts`; `calc.ts` líneas 340–842 |

Avisos de los propios documentos:
- «Este texto consolidado no tiene valor jurídico» (DB-HS, p. 2).
- «Los comentarios tienen un carácter orientativo e informativo no teniendo carácter reglamentario» ([DccHS], p. 2).

Las filas marcadas «(comentario)» se apoyan en [DccHS]. En la ficha deben citarse como comentario del Ministerio, nunca como exigencia.

La cadena de disposiciones del DB-HS, según su p. 2:
1. RD 314/2006 (BOE 28/03/2006).
2. RD 1371/2007 (BOE 23/10/2007) y su corrección (BOE 20/12/2007).
3. Corrección de errores del RD 314/2006 (BOE 25/01/2008).
4. Orden VIV/984/2009 (BOE 23/04/2009) y su corrección (BOE 23/09/2009).
5. Orden FOM/588/2017 (BOE 23/06/2017).
6. RD 732/2019 (BOE 27/12/2019).
7. RD 450/2022 (BOE 15/06/2022).

**No leídos en esta sesión:**
- RITE, Parte II. El WebFetch de BOE-A-2007-15820 devolvió solo la Parte I. Las cifras del RITE salen de [EU], que lo leyó íntegro.
- BOE originales del RD 314/2006 y de VIV/984/2009, para el articulado de 3.1 y 3.2.
- UNE-EN 12207. No se cita ninguna cifra suya.

---

## Bloque 1 — Sistema general de ventilación de la vivienda

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 1a | La vivienda exige un sistema general mecánico o híbrido | VERIFICADO | «Las viviendas deben disponer de un sistema general de ventilación que puede ser híbrida o mecánica» | HS 3 ap. 3.1.1 pto 1 | [HS22], [DccHS] |
| 1b | ¿Se admite la natural como sistema general? | VERIFICADO: **no** | Comentario literal: «No se acepta que la ventilación sea exclusivamente natural para garantizar su adecuado funcionamiento en todo momento y evitar su fallo, por ejemplo en momentos de inversión térmica.» | ap. 3.1.1 pto 1, comentario | [DccHS] |
| 1c | La natural sí existe, pero como sistema complementario | VERIFICADO | Cocinas, comedores, dormitorios y salas de estar: «sistema complementario de ventilación natural. Para ello debe disponerse una ventana exterior practicable o una puerta exterior». Superficie practicable ≥ 1/20 de la superficie útil del local. La ventana debe dar a un espacio con las mismas características que el exigido a las aberturas de admisión | ap. 3.1.1 pto 2; ap. 4.4 pto 1; ap. 3.2.6 pto 1 | [HS22] |
| 1d | UI «Mecánica \| Híbrida» para la vivienda | VERIFICADO | Correcta. No debe ofrecer «Natural» para la vivienda. Sí la ofrecen garajes (3.1.4), trasteros (3.1.3) y almacenes de residuos (3.1.2) | ap. 3.1.1 pto 1 | [HS22] |
| 1e | Ámbito: cualquier tipo de vivienda | VERIFICADO (comentario) | «Se consideran incluidos en el ámbito de aplicación los edificios de viviendas de cualquier tipo, incluso las viviendas aisladas, en hilera o pareadas.» | ap. 1.1, comentario | [DccHS] |
| 1f | Híbrida: condiciones de los conductos | VERIFICADO | Un aspirador híbrido por conducto, después de la última abertura. Conductos verticales. Colectivos: «no deben servir a más de 6 plantas»; «Los conductos de las dos últimas plantas deben ser individuales». Conexión mediante ramales verticales que desembocan «inmediatamente por debajo del ramal siguiente» | ap. 3.2.3 ptos 1–3 | [HS22] |
| 1g | Híbrida: boca de expulsión | VERIFICADO | En cubierta, a ≥ 1 m sobre ella. Debe superar: la altura de cualquier obstáculo situado entre 2 y 10 m; 1,3 veces la de cualquier obstáculo a ≤ 2 m; 2 m en cubiertas transitables | ap. 3.2.1 pto 5 | [HS22] |
| 1h | Cualquier sistema: separación de la boca de expulsión | VERIFICADO | En cubierta, separada ≥ 3 m de cualquier entrada de ventilación (boca de toma, abertura de admisión, puerta exterior, ventana) y de espacios con personas de forma habitual. El comentario mide los 3 m hasta la «zona de ocupación» (referencia RITE: de 5 a 180 cm sobre el suelo) | ap. 3.2.1 pto 4 y comentario | [HS22], [DccHS] |
| 1i | Mecánica: aspiradores | VERIFICADO | Un aspirador mecánico por conducto, después de la última abertura. Varios conductos pueden compartir aspirador, salvo los de garaje cuando se exija más de una red. Sistema automático que haga funcionar a la vez todos los aspiradores de cada vivienda, u otra solución que impida invertir el flujo | ap. 3.2.4 pto 1; ap. 3.2.5 pto 3 | [HS22] |

---

## Bloque 2 — Aberturas de la vivienda

Las desigualdades son estrictas donde el DB dice «mayor que» o «menor que». El código debe respetarlo.

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 2a | Admisión en secos, extracción en húmedos, paso entre ambos | VERIFICADO | «el aire debe circular desde los locales secos a los húmedos». Comedores, dormitorios y salas de estar: admisión. Aseos, cocinas y baños: extracción. Particiones entre unos y otros: aberturas de paso | ap. 3.1.1 pto 1 a) | [HS22] |
| 2b | Admisión por aireadores o aperturas fijas de la carpintería | VERIFICADO | «aberturas dotadas de aireadores o aperturas fijas de la carpintería, como son los dispositivos de microventilación con una permeabilidad al aire según UNE EN 12207:2017 en la posición de apertura de clase 1 o superior». Si las carpinterías exteriores son de clase 1, valen como admisión «las juntas de apertura» | ap. 3.1.1 pto 1 c) | [HS22] |
| 2c | Con híbrida, la admisión comunica directamente con el exterior | VERIFICADO | Literal | ap. 3.1.1 pto 1 d) | [HS22] |
| 2d | Altura de los aireadores | VERIFICADO | **> 1,80 m** del suelo (estricto) | ap. 3.1.1 pto 1 e) | [HS22] |
| 2e | Posición de la extracción | VERIFICADO | Conectada a conducto de extracción. **< 200 mm** del techo y **> 100 mm** de cualquier rincón o esquina vertical (ambos estrictos) | ap. 3.1.1 pto 1 g) | [HS22] |
| 2f | Local con extracción compartimentado | VERIFICADO | Paso entre compartimentos. Extracción en el más contaminado: el del inodoro en baños y aseos; el de la zona de cocción en cocinas. La abertura de paso hacia el resto de la vivienda, en el compartimento menos contaminado | ap. 3.1.1 pto 1 f) | [HS22] |
| 2g | Locales con varios usos | VERIFICADO | Cada zona de uso distinto, con sus aberturas. Notas (1) y (2) de la Tabla 2.1: en secos de varios usos, el caudal del uso mayor; si hay zona seca y húmeda, cada zona con su caudal | ap. 3.1.1 pto 1 b); Tabla 2.1 notas | [HS22] |
| 2h | Qué sirve como abertura de paso | VERIFICADO | «un aireador o la holgura existente entre las hojas de las puertas y el suelo» | ap. 3.2.1 pto 2 | [HS22] |
| 2i | Conducto compartido | VERIFICADO | «un mismo conducto de extracción puede ser compartido por aseos, baños, cocinas y trasteros». Comentario: pueden ser individuales por vivienda o colectivos. Se refiere a la ventilación general, no a la de cocción (ver 4c) | ap. 3.1.1 pto 1 h) y comentario | [HS22], [DccHS] |
| 2j | Patio al que abren las admisiones | VERIFICADO | Sin norma urbanística: círculo inscrito de diámetro ≥ 1/3 de la altura del cerramiento más bajo y ≥ 3 m | ap. 3.2.1 pto 1 | [HS22] |
| 2k | El área de la Tabla 4.1 para admisión es la de los aireadores | VERIFICADO (comentario) | «Las aberturas de admisión a las que se refiere este dimensionado son exclusivamente los aireadores». La microventilación se avala por su clase en el ensayo. El área de admisión «puede reducirse» con el área equivalente de la permeabilidad de opacos y juntas de apertura, «con la debida justificación de su estimación» | ap. 4.1, comentarios | [DccHS] |

---

## Bloque 3 — Equilibrado de caudales

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 3a | Equilibrar = subir el total menor hasta el mayor | VERIFICADO | «Equilibrado de caudales: procedimiento por el que, fijada una hipótesis de flujo, en el supuesto de que los caudales de admisión y extracción determinados de acuerdo con la tabla 2.1 no coincidan, se aumentan los caudales menores hasta que se igualen a los mayores. Con los caudales equilibrados se realiza el dimensionado del sistema de ventilación.» | Apéndice A (redacción de FOM/588/2017) | [HS22], [FOM] |
| 3b | Totales que se comparan | VERIFICADO (comentario) | «El caudal de ventilación total en cada vivienda es único». Se toma el mayor entre Σqv de admisión y Σqv de extracción. La suma de los equilibrados iguala el total mayor | ap. 4.1, comentario | [DccHS] |
| 3c | Total de extracción de la vivienda | VERIFICADO (lectura de la Tabla 2.1) | máx(Σ «mínimo por local», «mínimo en total»). Columnas de húmedos: 6/7/8 por local; 12/24/33 en total, para 0–1 / 2 / 3 o más dormitorios | Tabla 2.1 | [HS22] |
| 3d | El exceso puede caer en cualquiera de los dos lados | VERIFICADO (cálculo con la Tabla 2.1) | Ejemplos con cocina + 1 baño, y + 1 aseo en T3:<br>- **T1:** admisión 8 + 6 = 14; extracción máx(2 × 6, 12) = 12 → se sube la **extracción** a 14.<br>- **T2:** admisión 8 + 4 + 8 = 20; extracción máx(2 × 7, 24) = 24 → se sube la admisión a 24.<br>- **T3:** admisión 8 + 4 + 4 + 10 = 26; extracción máx(3 × 8, 33) = 33 → se sube la admisión a 33 | Tabla 2.1; Apéndice A | [HS22] |
| 3e | «El exceso de admisión va al salón» | **CRITERIO** | El DB exige «una hipótesis de circulación del aire según la distribución de los locales» y no fija el local. El comentario del Ministerio propone reparto **proporcional** a la Tabla 2.1, «partiendo de la base de que nunca pueden ser menores que los de la tabla 2.1». Llevar todo el exceso al salón es una hipótesis admisible, pero de proyecto. Por defecto conviene la proporcional, que es la del comentario. Además, el exceso puede ser de extracción (T1): la regla «al salón» no cubre ese caso | Apéndice A; ap. 4.1 (definiciones de qva, qve, qvp) y comentario | [HS22], [DccHS] |
| 3f | `calc.ts` equilibra al mayor de los totales propuestos | VERIFICADO en el concepto | Correcto (`caudalEquilibrado_l_s = máx(admisión, extracción)`). Pero ese resultado no se usa después para dimensionar aberturas ni conducto (ver 5f, 5g y 6i). «Con los caudales equilibrados se realiza el dimensionado» | Apéndice A | [REPO] líneas 495–514 |

---

## Bloque 4 — Cocina: extracción de la zona de cocción

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 4a | 50 l/s en la zona de cocción | VERIFICADO | «En la zona de cocción de las cocinas debe disponerse un sistema que permita extraer los contaminantes que se producen durante su uso, de forma independiente a la ventilación general de los locales habitables. Esta condición se considera satisfecha si se dispone de un sistema en la zona de cocción que permita extraer un caudal mínimo de 50 l/s.» Está en el ap. 2 (redacción FOM/588/2017), **no** en la Tabla 2.1. Es una condición de «se considera satisfecha» | HS 3 ap. 2 pto 4 | [HS22], [FOM] |
| 4b | `COCCION_MIN` = 50 l/s, artículo «ap. 2, pto 4» | VERIFICADO | Dato y cita correctos | ap. 2 pto 4 | [REPO] |
| 4c | Conducto independiente | VERIFICADO | «un extractor conectado a un conducto de extracción independiente de los de la ventilación general de la vivienda que no puede utilizarse para la extracción de aire de locales de otro uso». Si el conducto es compartido por varios extractores: válvula automática en cada uno, u otro sistema antirrevoco. Comentarios: el ramal que desemboca por debajo del siguiente «contribuye» a evitar revocos; con un solo extractor también es «recomendable» el antirrevoco | ap. 3.1.1 pto 3 y comentarios | [HS22], [DccHS] |
| 4d | «Campana» | **CORREGIDO** (terminología) | El DB no dice «campana». Dice «sistema adicional específico de ventilación con extracción mecánica» y «extractor» («ventilador que sirve para extraer de forma localizada los contaminantes»). En la UI se puede decir «extractor de cocina (campana)», citando el término del DB | ap. 3.1.1 pto 3; Apéndice A | [HS22] |
| 4e | Posición del extractor y ramales | VERIFICADO | Comentario: el extractor va en la abertura de extracción, «incluso cuando un mismo conducto de extracción colectivo se utilice para varias cocinas». Si el conducto es colectivo, cada extractor se conecta con un ramal que desemboca inmediatamente por debajo del ramal siguiente | ap. 3.2.4 pto 1 (excepción de la cocina) y comentario; ap. 3.2.4 pto 7 | [HS22], [DccHS] |
| 4f | Filtro de grasas | VERIFICADO | Antes del extractor, filtro de grasas y aceites con un dispositivo que indique cuándo cambiarlo o limpiarlo | ap. 3.2.5 pto 2 | [HS22] |
| 4g | Dimensionado del extractor | VERIFICADO | «deben dimensionarse de acuerdo con el caudal mínimo para la cocina indicado en el apartado 2» (FOM/588/2017) | ap. 4.3 pto 2 | [HS22], [FOM] |
| 4h | El caudal de cocción no entra en el qvt de la ventilación general | VERIFICADO | Consecuencia directa del conducto independiente. El código ya lo hace bien (líneas 436–458; test de la línea 738) | ap. 3.1.1 pto 3 | [HS22], [REPO] |
| 4i | Sección del conducto de cocina | **CRITERIO** | El DB no da una sección específica. La lectura literal del 4.2.2 (conductos de ventilación mecánica) da S ≥ 2,5 × 50 = 125 cm² en conducto individual contiguo a local habitable. Para conducto colectivo, el DB no dice nada de simultaneidad | ap. 4.2.2 (aplicación no explícita) | [HS22] |

---

## Bloque 5 — Tabla 4.1 y `AREA_EFECTIVA_ABERTURAS`

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 5a | Valores de la Tabla 4.1 [cm²] | VERIFICADO | Admisión «4·qv ó 4·qva». Extracción «4·qv ó 4·qve». Paso «70 cm² ó 8·qvp». Mixtas «8·qv» | Tabla 4.1 | [HS22] |
| 5b | Regla de aplicación | VERIFICADO | «El área efectiva total de las aberturas de ventilación de cada local debe ser como mínimo **la mayor** de las que se obtienen mediante las fórmulas que figuran en la tabla 4.1.» | ap. 4.1 pto 1 | [HS22] |
| 5c | Qué es cada caudal | VERIFICADO | qv: «caudal de ventilación mínimo exigido del local [l/s], obtenido de las tablas 2.1 o 2.2 o del cálculo realizado para cumplir la exigencia» (FOM/588/2017). qva, qve y qvp: caudal «correspondiente a **cada abertura**» de admisión, extracción o paso, «calculado por un procedimiento de equilibrado» y con una hipótesis de circulación | ap. 4.1; Apéndice B | [HS22], [FOM] |
| 5d | Datos de `AREA_EFECTIVA_ABERTURAS` | VERIFICADO | `admision_coef: 4`, `extraccion_coef: 4`, `paso_coef: 8`, `pasoMin_cm2: 70`, `mixtas_coef: 8` | Tabla 4.1 | [REPO] |
| 5e | `articulo: "ap. 4"` | **CORREGIDO** | «ap. 4.1» | ap. 4.1 | [HS22], [REPO] |
| 5f | `calc.ts`: área de admisión y de extracción con el caudal requerido (qv) | **CORREGIDO** | Debe ser máx(4·qv, 4·qva) y máx(4·qv, 4·qve). Como qva ≥ qv y qve ≥ qv, equivale a usar el caudal equilibrado de cada local. Con qv solo, el área sale corta en los locales cuyo caudal sube al equilibrar: el salón o los secos en T2 y T3; los húmedos en T1. El comentario «DECISIÓN DE DISEÑO» de las líneas 427–431 contradice el ap. 4.1 | ap. 4.1 pto 1 | [HS22], [REPO] líneas 426–434 |
| 5g | `calc.ts`: área de paso = máx(70, 8 × caudal equilibrado **total** de la vivienda) | **CORREGIDO** | Debe calcularse por abertura de paso: máx(70, 8·qvp), con el qvp que atraviesa esa puerta. El valor actual es conservador (T3: 8 × 33 = 264 cm² en cada puerta), pero no es la Tabla 4.1 y se presenta como si lo fuera | ap. 4.1; Tabla 4.1 | [HS22], [REPO] líneas 509–515 |
| 5h | Aberturas mixtas: reparto | VERIFICADO | Nota (1): «El área efectiva total de las aberturas mixtas de cada zona opuesta de fachada y de la zona equidistante debe ser como mínimo el área total exigida.» No se reparte entre fachadas: **cada** fachada opuesta lleva el área total | Tabla 4.1, nota (1) | [HS22] |

---

## Bloque 6 — Sección de los conductos de extracción

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 6a | «S ≥ 2,50·qvt» para ventilación mecánica | **CORREGIDO** (forma) | **S ≥ 2,5·qvt** (fórmula 4.1). S: «sección nominal de un tramo de un conducto de extracción, [cm²]». qvt: «caudal de aire existente en un tramo de un conducto, [l/s]», igual a la suma de los caudales de las aberturas de extracción que vierten al tramo. El comentario lo confirma: «Según el apéndice B “Notación” la sección del conducto se expresa en cm²» | ap. 4.2.2 pto 1; Apéndice B; comentario | [HS22], [DccHS] |
| 6b | Cuándo se aplica la 4.1 | VERIFICADO | Solo «cuando los conductos se dispongan contiguos a un local habitable, salvo que estén en cubierta o en locales de instalaciones o en patinillos que cumplan las condiciones que establece el DB HR» | ap. 4.2.2 pto 1 | [HS22] |
| 6c | Conductos en cubierta | VERIFICADO | **S ≥ 1,5·qvt** (fórmula 4.2) | ap. 4.2.2 pto 2 | [HS22] |
| 6d | Conductos en patinillo conforme al DB HR o en local de instalaciones | **NO VERIFICABLE** | El DB no da sección mínima para este caso. Solo exige dimensionar el aspirador para las pérdidas de presión (4.3 pto 1). Propuesta de criterio: aplicar 2,5·qvt como valor conservador, etiquetado como criterio | ap. 4.2.2 (silencio); ap. 4.3 pto 1 | [HS22] |
| 6e | Tablas 4.2, 4.3 y 4.4 | VERIFICADO | Son **solo para ventilación híbrida** (ap. 4.2.1, «Conductos de extracción para ventilación híbrida»). Con mecánica no se usan | ap. 4.2.1 | [HS22] |
| 6f | Artículo de `SECCION_CONDUCTO_TABLA_4_2` y `ZONAS_TERMICAS_TABLA_4_4` = «ap. 4.4» | **CORREGIDO** | «ap. 4.2.1». El 4.4 es «Ventanas y puertas exteriores» (1/20) | ap. 4.2.1 pto 1 a) y b); ap. 4.4 | [HS22], [REPO] líneas 214 y 290 |
| 6g | Híbrida: sección del ramal | VERIFICADO | ≥ ½ de la del colectivo al que vierte | ap. 4.2.1 pto 2 | [HS22] |
| 6h | Híbrida: sección de la Tabla 4.2 | VERIFICADO (comentario) | Es un mínimo. «Si se pretende optimizar al máximo el funcionamiento en régimen natural del sistema, es recomendable aumentar las secciones aquí obtenidas» | ap. 4.2.1, comentario | [DccHS] |
| 6i | `calc.ts` dimensiona el conducto con `totalExtraccion_l_s` (propuesto) | **CORREGIDO** | qvt debe salir de los caudales de extracción **equilibrados** (Apéndice A: «Con los caudales equilibrados se realiza el dimensionado»). Cuando la admisión supera a la extracción (T1), el qvt sube: 14 l/s, no 12. Afecta al modo rápido (línea 520) y a la red colectiva (677–842) | Apéndice A; ap. 4.2.1 a); ap. 4.2.2 pto 1 | [HS22], [REPO] |
| 6j | Mecánica: otras condiciones del conducto | VERIFICADO | Sección uniforme entre dos aportes; acabado que dificulte el ensuciamiento, practicable en la coronación; aislado si puede alcanzar la temperatura de rocío; SI 1 si atraviesa sectores; estanco a su presión de dimensionado | ap. 3.2.4 ptos 2–6 | [HS22] |

---

## Bloque 7 — Garaje

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 7a | Sistema | VERIFICADO | «natural o mecánica». **No hay híbrida** en garajes | ap. 3.1.4 pto 1 | [HS22] |
| 7b | Ámbito | VERIFICADO | Garajes y aparcamientos de cualquier edificio. «Se considera que forman parte de los aparcamientos y garajes las zonas de circulación de los vehículos» | ap. 1.1 pto 1 | [HS22] |
| 7c | Caudal | VERIFICADO | 120 l/s por plaza | Tabla 2.2 | [HS22] |
| 7d | Caudal con detección de CO | VERIFICADO (comentario) | El caudal mínimo debe activarse «al menos cuando la concentración del CO supere los valores límite» del 3.1.4.2; fuera de esos periodos «podrán establecerse caudales inferiores». El ap. 2 pto 6 admite caudal variable controlado por detectores | ap. 2 pto 6; comentario a la Tabla 2.2 | [HS22], [DccHS] |
| 7e | Natural: aberturas mixtas | VERIFICADO | En «al menos en dos zonas opuestas de la fachada» (comentario: equivale a «fachadas opuestas»). Reparto uniforme. Distancia por el «recorrido mínimo libre de obstáculos» de cualquier punto a la abertura más próxima ≤ 25 m. Si las aberturas opuestas más próximas distan > 30 m, otra equidistante, con tolerancia del 5 % | ap. 3.1.4.1 pto 1 y comentario | [HS22], [DccHS] |
| 7f | Natural: área de las mixtas | VERIFICADO (cálculo con tablas del DB) | 8·qv, con qv = 120·N l/s → **960·N cm² en cada fachada opuesta** (y en la equidistante, si la hay). Ejemplo: 20 plazas → 19.200 cm² (1,92 m²) en cada una | Tabla 4.1 y nota (1); Tabla 2.2 | [HS22] |
| 7g | «≤ 5 plazas / 100 m²» (garaje pequeño) | **CORREGIDO** (matiz) | Solo en **natural**. Exige las dos condiciones: «garajes que no excedan de cinco plazas **ni** de 100 m² útiles». Entonces, en lugar de mixtas: admisión abajo y extracción arriba del **mismo** cerramiento, directas al exterior y separadas en vertical ≥ 1,5 m | ap. 3.1.4.1 pto 2 | [HS22] |
| 7h | Detección de CO | VERIFICADO | Basta **una** de las dos condiciones: «aparcamientos que excedan de cinco plazas **o** de 100 m² útiles». Sistema de detección en cada planta que active automáticamente los aspiradores: **50 ppm** si se prevén empleados; **100 ppm** si no. Ojo a la asimetría con 7g: «ni … ni» frente a «o». El punto está en el apartado de ventilación mecánica | ap. 3.1.4.2 pto 7 | [HS22] |
| 7i | Dos redes | VERIFICADO | Con **15 o más plazas**: «en cada planta al menos dos redes de conductos de extracción dotadas del correspondiente aspirador mecánico». Las dos redes no pueden compartir aspirador. Comentario: reducir el riesgo de quedarse sin ventilación si falla un aspirador | ap. 3.1.4.2 pto 6 y comentario; ap. 3.2.4 pto 1 | [HS22], [DccHS] |
| 7j | «10 m» | **CORREGIDO** (significado) | No es la distancia desde cualquier punto. Es la separación entre **aberturas de extracción** más próximas: **< 10 m** (estricto), en mecánica. Los 25 m desde cualquier punto son de la natural (7e) | ap. 3.1.4.2 pto 3 b) | [HS22] |
| 7k | Aberturas por superficie (mecánica) | VERIFICADO | «una abertura de admisión y otra de extracción por cada 100 m² de superficie útil», «o de cualquier otra [forma] que produzca el mismo efecto». Comentario: es un **número** de aberturas («no necesariamente en cada 100 m²»), siempre que se cumpla la separación < 10 m y no haya estancamientos. Redondear al entero superior es **criterio** | ap. 3.1.4.2 pto 3 a) y comentario | [HS22], [DccHS] |
| 7l | Posición de las extracciones | VERIFICADO | Como mínimo, 2/3 de las aberturas de extracción a ≤ 0,5 m del techo | ap. 3.1.4.2 pto 4 | [HS22] |
| 7m | Régimen | VERIFICADO | Por depresión: extracción mecánica, o admisión y extracción mecánicas | ap. 3.1.4.2 pto 2 | [HS22] |
| 7n | Garaje compartimentado con ventilación conjunta | VERIFICADO | Admisión en los compartimentos (al menos una en cada uno) y extracción en las zonas de circulación comunes | ap. 3.1.4.2 pto 5 | [HS22] |
| 7o | Garaje en sótano: obligatoriamente mecánica | **CRITERIO** | El DB no lo dice. La natural exige mixtas en fachadas opuestas, que un sótano sin fachada no tiene. Mostrar aviso («sin fachadas opuestas la natural no es viable»), no prohibición | ap. 3.1.4.1 (por deducción) | [HS22] |

---

## Bloque 8 — Trasteros

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 8a | Ámbito | VERIFICADO | Solo en edificios de viviendas. Un trastero en un edificio de otro uso se rige por el RITE | ap. 1.1 ptos 1 y 2 | [HS22], [EU] |
| 8b | Sistema | VERIFICADO | «natural, híbrida o mecánica», en los trasteros y en sus zonas comunes | ap. 3.1.3 pto 1 | [HS22] |
| 8c | Caudal | VERIFICADO | 0,7 l/s por m² útil, para trasteros y sus zonas comunes | Tabla 2.2 | [HS22] |
| 8d | Natural | VERIFICADO | Mixtas en la zona común, en ≥ 2 partes opuestas del cerramiento; ningún punto a > 15 m de la más próxima. Si los trasteros ventilan a través de la zona común: ≥ 2 aberturas de paso en la partición de cada trastero, separadas en vertical ≥ 1,5 m. Si ventilan de forma independiente: admisión y extracción directas al exterior, separadas en vertical ≥ 1,5 m | ap. 3.1.3.1 ptos 1–3 | [HS22] |
| 8e | Híbrida y mecánica | VERIFICADO | Si ventilan a través de la zona común: extracción en la zona común y aberturas de paso en las particiones. Admisión de los trasteros directa al exterior; extracción conectada a conducto. En zonas comunes, ningún punto a > 15 m de la abertura más próxima. Aberturas de paso de cada trastero separadas en vertical ≥ 1,5 m | ap. 3.1.3.2 ptos 1–6 | [HS22] |
| 8f | ¿Pueden compartir la ventilación del garaje? | VERIFICADO, con condición | Solo si el garaje tiene **ventilación mecánica** y los trasteros están «en el propio recinto del aparcamiento». En ese caso «la ventilación puede ser conjunta, respetando en todo caso la posible compartimentación de los trasteros como zona de riesgo especial, conforme al SI 1-2». Fuera del recinto, la ventilación del garaje es «para uso exclusivo del aparcamiento» | ap. 3.1.4.2 pto 1 | [HS22] |
| 8g | Garaje natural con trasteros dentro del recinto | **NO VERIFICABLE** | El permiso de ventilación conjunta está solo en el apartado de mecánica. Para natural el DB no dice nada. Propuesta de criterio: ventilar los trasteros por el 3.1.3 | ap. 3.1.4.1 (silencio) | [HS22] |
| 8h | Caudal de la ventilación conjunta garaje + trasteros | **CRITERIO** | El DB no dice cómo se suman. Propuesta: 120·N + 0,7·S_trasteros, de modo que cada local conserve su mínimo de la Tabla 2.2 | Tabla 2.2 | [HS22] |
| 8i | Trasteros en el conducto de la vivienda | VERIFICADO | «un mismo conducto de extracción puede ser compartido por aseos, baños, cocinas y trasteros» | ap. 3.1.1 pto 1 h) | [HS22] |

---

## Bloque 9 — Local sin uso y oficinas

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 9a | Oficinas: fuera del HS 3, vía RITE | VERIFICADO | «Para locales de cualquier otro tipo se considera que se cumplen las exigencias básicas si se observan las condiciones establecidas en el RITE.» El RITE lo recoge en IT 1.1.4.2.1 | HS 3 ap. 1.1 pto 2; RITE IT 1.1.4.2.1 | [HS22], [EU] |
| 9b | Oficinas: caudal | VERIFICADO | IDA 2: 12,5 dm³/s por persona, método A, «como mínimo» | RITE IT 1.1.4.2.2; IT 1.1.4.2.3.1, método A, letra a); Tabla 1.4.2.1 | [EU] |
| 9c | Local sin uso: «se ventilará según el RITE cuando tenga actividad» | **CRITERIO** | El DB no habla de locales sin uso. Remite al RITE todos los «locales de cualquier otro tipo». «Cuando tenga actividad» es redacción de proyecto. Propuesta: «Fuera del ámbito del DB-HS 3 (ap. 1.1, pto 2). Su ventilación se justificará conforme al RITE (IT 1.1.4.2) en el proyecto de actividad.» | HS 3 ap. 1.1 pto 2 | [HS22], [EU] |
| 9d | Caudal del RITE para el local sin uso | **NO VERIFICABLE** | Sin uso no hay IDA ni ocupación. No mostrar ningún número | RITE IT 1.1.4.2.2 | [EU] |
| 9e | Reserva de ventilación para el local | **NO VERIFICABLE** | El HS 3 no exige ninguna reserva. Prever un patinillo es criterio de proyecto | — | [HS22] |

---

## Bloque 10 — Edición vigente y forma de citarla

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| 10a | `PROC_HS3`: `edicion: "FOM/588/2017"`, `fecha: "2019-12-24"`, comentario «consolidada por RD 732/2019» | **CORREGIDO** | El texto vigente es el **consolidado de 14-06-2022**, que incluye el RD 450/2022. «2019-12-24» no corresponde a ninguna fecha oficial: el RD 732/2019 es de 20/12/2019 y se publicó en el BOE el 27/12/2019. Además, el RD 732/2019 no modifica HS 3 (añade HS 6) | DB-HS p. 2 | [HS22], [RD732] |
| 10b | Qué cambió la FOM/588/2017 en HS 3 | VERIFICADO | 1.2 pto 2; **ap. 2 completo** (CO₂, 1,5 l/s, Tablas 2.1 y 2.2, cocción 50 l/s); 4.1 (definición de qv); 4.3 pto 2; Apéndice A (nuevas definiciones, entre ellas «equilibrado de caudales»); Apéndice C nuevo | BOE-A-2017-7163 | [FOM] |
| 10c | Resto del articulado (3.1, 3.2, valores de la Tabla 4.1, 4.2) | VERIFICADO (por exclusión) | No lo modifican ni FOM/588/2017 ni RD 732/2019. Procede de RD 314/2006 y VIV/984/2009; no se ha cotejado con esos BOE | — | [FOM], [RD732] |
| 10d | Origen de «UNE EN 12207:2017» en 3.1.1 c) | **NO VERIFICABLE** | No figura en FOM/588/2017 (búsqueda sin resultados). En RD 732/2019 la búsqueda solo lo encontró en el DB-HR. Los comentarios todavía citan «12207:2007» y «12207:2000». No afecta a ninguna cifra | ap. 3.1.1 pto 1 c) | [HS22], [DccHS], [FOM], [RD732] |
| 10e | Cómo citar | — | Ficha: «DB-HS, Sección HS 3 (texto consolidado de 14-06-2022). Ap. 2 y Apéndice A según la Orden FOM/588/2017 (BOE 23/06/2017).» La cita con valor legal es la disposición del BOE; el consolidado «no tiene valor jurídico». Los comentarios se citan como «Comentario del Ministerio (DB-HS con comentarios, 12-02-2025)», nunca como exigencia | DB-HS p. 2 | [HS22], [DccHS] |

---

## Cifras que SÍ se pueden mostrar en la UI, con su cita

- Tabla 2.1 completa (8; 4; 6/8/10; 12/24/33; 6/7/8 l/s), citando «HS 3 ap. 2 pto 3, Tabla 2.1».
- Total de extracción = máx(Σ por local, mínimo total), como lectura de la Tabla 2.1.
- 1,5 l/s por local habitable en no ocupación (ap. 2 pto 2).
- Cocción 50 l/s (ap. 2 pto 4). Filtro de grasas (3.2.5 pto 2). Conducto independiente y antirrevoco (3.1.1 pto 3).
- Tabla 2.2: trasteros 0,7 l/s·m²; residuos 10 l/s·m²; garaje 120 l/s por plaza.
- Tabla 4.1 aplicada con la regla de «la mayor» y con qva, qve y qvp por abertura.
- Mixtas: 8·qv en **cada** fachada opuesta (nota 1). Garaje natural: 960·N cm² por fachada.
- Ventilación mecánica: S ≥ 2,5·qvt [cm², l/s] (contiguo a local habitable); S ≥ 1,5·qvt (cubierta).
- Ventilación híbrida: Tablas 4.2, 4.3 y 4.4; ramal ≥ ½ del colectivo; colectivo ≤ 6 plantas; dos últimas plantas con conducto individual; boca a ≥ 1 m sobre cubierta (2 m si es transitable; reglas de 2–10 m y 1,3×).
- Boca de expulsión a ≥ 3 m de entradas de aire y de espacios ocupados (cualquier sistema).
- Vivienda: aireador > 1,80 m; extracción < 200 mm del techo y > 100 mm de rincones; ventanas practicables ≥ 1/20 de la superficie útil; patio con círculo ≥ 1/3 H y ≥ 3 m.
- Garaje:
  - natural: 25 m por recorrido libre; 30 m (± 5 %) para la abertura equidistante; garaje pequeño (≤ 5 plazas **y** ≤ 100 m²) con aberturas en el mismo cerramiento separadas ≥ 1,5 m;
  - mecánica: 1 + 1 aberturas por cada 100 m²; separación entre extracciones < 10 m; 2/3 de ellas a ≤ 0,5 m del techo; ≥ 2 redes por planta con ≥ 15 plazas;
  - CO si hay > 5 plazas **o** > 100 m²: 50 ppm con empleados y 100 ppm sin ellos.
- Trasteros: 15 m y 1,5 m (3.1.3); ventilación conjunta con el garaje solo si este es mecánico y los trasteros están en su recinto (3.1.4.2 pto 1).
- Oficinas: «HS 3 no aplica (ap. 1.1 pto 2); RITE IT 1.1.4.2: IDA 2, 12,5 dm³/s·persona (método A, mínimo)».

## Cifras que NO deben mostrarse todavía

- **Tablas 4.2, 4.3 o 4.4 con sistema mecánico.** Solo valen para híbrida.
- **Área de paso = 8 × caudal total de la vivienda** citada como Tabla 4.1. Es una sobreestimación propia, no el DB.
- **Áreas de admisión o extracción calculadas con qv cuando el local recibe caudal del equilibrado.** Salen cortas.
- **«El exceso de admisión va al salón»** presentado como regla del DB. Es criterio, y el exceso puede ser de extracción (T1).
- **Sección del conducto de cocina** (125 cm²) sin la etiqueta «criterio: lectura del 4.2.2».
- **Sección por fórmula 4.1 en patinillo conforme al DB HR o en local de instalaciones**, salvo etiquetada como criterio conservador.
- **Caudal del RITE para el local sin uso.** No hay IDA ni ocupación.
- **Umbral «≤ 5 plazas / 100 m²»** con una sola conjunción para los dos usos: «ni … ni» para el garaje pequeño natural; «o» para la detección de CO.
- **«10 m desde cualquier punto».** Son 10 m entre extracciones (mecánica); desde cualquier punto son 25 m (natural).

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Caudales en locales habitables | DB-HS3 | Consolidado 14-06-2022 (ap. 2 según FOM/588/2017) | 2022-06-14 | ap. 2 pto 3 | Tabla 2.1 | codigotecnico.org · DBHS.pdf, Sección HS 3 |
| No ocupación | ídem | ídem | 2022-06-14 | ap. 2 pto 2 | — | ídem |
| Cocción | ídem | ídem | 2022-06-14 | ap. 2 pto 4 | — | ídem |
| Caudales en locales no habitables | ídem | ídem | 2022-06-14 | ap. 2 pto 6 | Tabla 2.2 | ídem |
| Diseño de la vivienda | ídem | ídem | 2022-06-14 | ap. 3.1.1 | — | ídem |
| Trasteros | ídem | ídem | 2022-06-14 | ap. 3.1.3 | — | ídem |
| Garajes | ídem | ídem | 2022-06-14 | ap. 3.1.4 | — | ídem |
| Bocas de expulsión | ídem | ídem | 2022-06-14 | ap. 3.2.1 ptos 4 y 5 | — | ídem |
| Conductos híbridos (diseño) | ídem | ídem | 2022-06-14 | ap. 3.2.3 | — | ídem |
| Área efectiva de aberturas | ídem | ídem | 2022-06-14 | ap. 4.1 | Tabla 4.1 | ídem |
| Secciones de conducto híbrido | ídem | ídem | 2022-06-14 | ap. 4.2.1 | Tabla 4.2 | ídem |
| Clases de tiro | ídem | ídem | 2022-06-14 | ap. 4.2.1 | Tabla 4.3 | ídem |
| Zonas térmicas | ídem | ídem | 2022-06-14 | ap. 4.2.1 | Tabla 4.4 | ídem |
| Sección de conducto mecánico | ídem | ídem | 2022-06-14 | ap. 4.2.2 | Fórmulas 4.1 y 4.2 | ídem |
| Ventanas y puertas exteriores | ídem | ídem | 2022-06-14 | ap. 4.4 | — | ídem |

## Pendientes

1. **Origen de «UNE EN 12207:2017» en 3.1.1 c)** (10d). Hace falta leer el anexo de referencias del RD 732/2019 o el BOE de VIV/984/2009. No cambia ninguna cifra.
2. **RITE, Parte II.** No se pudo releer en esta sesión: el BOE devuelve solo la Parte I. Las cifras de oficinas se apoyan en [EU].
3. **Tabla 4.3.** No se ha recotejado en este encargo. El repo la marca como verificada celda a celda y no se ha tocado.
4. **Decisiones de criterio que debe validar el responsable del proyecto:**
   - hipótesis de circulación: proporcional (por defecto, según el comentario) o «todo al salón» (3e);
   - qvp de cada puerta = qva o qve del local al que sirve (5g);
   - sección del conducto de cocina por 4.2.2 (4i);
   - sección en patinillo conforme al DB HR (6d);
   - número de aberturas del garaje redondeado al entero superior (7k);
   - suma de caudales garaje + trasteros (8h);
   - aviso de «natural no viable» en sótano (7o).
5. **Aviso para el módulo HS 6 (fuera de este encargo).** `src/modules/hs6/tablas.ts:74` y `ui.tsx:662` dicen «mecánica → remite a DB-HS3 §3.2.1 (caudal de ventilación)». El 3.2.1 regula aberturas y bocas, no caudales. Además:
   - HS 6 ap. 3.2 pto 5 remite a «la ventilación necesaria establecida por el DB HS3 o por el RITE»;
   - HS 6 ap. 3.2 pto 8 remite al 3.2.1 del HS 3 solo para las bocas de expulsión.

---

## Para el código

Propuesta, sin aplicar. Sigue el patrón `tablaCTE(procedencia, datos)` de `src/lib/cte/tabla.ts`. Los criterios van **aparte**, fuera de `tablaCTE`, para que la ficha no los cite como CTE.

### `D:\PROGRAMACION\Instalaciones\src\modules\hs3\tablas.ts`

1. **Sustituir `PROC_HS3`.** Corregir también los comentarios de las líneas 5, 16 y 20. Si algún test del anejo o de la ficha compara la cadena `edicion`, habrá que actualizarlo.

```ts
/** HS 3 vigente: consolidado 14-06-2022. Ap. 2, 4.1 (qv), 4.3.2 y Apéndices A y C
 *  según Orden FOM/588/2017 (BOE 23/06/2017). RD 732/2019 no modifica HS 3. */
const PROC_HS3 = {
  db: "DB-HS3",
  edicion: "Consolidado 14-06-2022 (ap. 2 y Apéndice A según Orden FOM/588/2017)",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DBHS.pdf, Sección HS 3",
} as const;
```

2. **Corregir `articulo`:**
   - `CAUDALES_LOCALES_HABITABLES` → `"ap. 2 pto 3"`;
   - `CAUDALES_NO_HABITABLES` → `"ap. 2 pto 6"`;
   - `AREA_EFECTIVA_ABERTURAS` → `"ap. 4.1"`;
   - `SECCION_CONDUCTO_TABLA_4_2` (línea 214) → `"ap. 4.2.1"`;
   - `ZONAS_TERMICAS_TABLA_4_4` (línea 290) → `"ap. 4.2.1"`;
   - comentario de la línea 143 («4.2.1 / 4.4») → «4.2.1».

3. **Constantes nuevas.** Los nombres son orientativos. Las desigualdades estrictas van anotadas.

```ts
/** Ap. 4.2.2. S [cm²] ≥ coef · qvt [l/s]. Solo ventilación MECÁNICA. */
export const SECCION_CONDUCTO_MECANICA = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 4.2.2", tabla: "Fórmulas 4.1 y 4.2" },
  {
    /** Fórm. 4.1: contiguo a local habitable (no aplica en cubierta, local de
     *  instalaciones ni patinillo conforme al DB HR). */
    contiguoHabitable_cm2_por_l_s: 2.5,
    /** Fórm. 4.2: conducto dispuesto en la cubierta. */
    cubierta_cm2_por_l_s: 1.5,
  } as const,
);

/** Ap. 3.1.1 y 4.4: diseño de la vivienda. */
export const VIVIENDA_DISENO = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 3.1.1; ap. 4.4" },
  {
    sistemasGenerales: ["hibrida", "mecanica"] as const, // natural NO (3.1.1 pto 1)
    aireadorAlturaSobreSuelo_m: 1.8,   // estricto: > 1,80 m (e)
    extraccionDistTecho_mm: 200,       // estricto: < 200 mm (g)
    extraccionDistRincon_mm: 100,      // estricto: > 100 mm (g)
    ventanaPracticableFraccionMin: 1 / 20, // ≥ 1/20 sup. útil (4.4)
  } as const,
);

/** Ap. 3.2.3, 4.2.1 pto 2 y 3.2.1: solo ventilación HÍBRIDA. */
export const HIBRIDA_CONDUCTOS = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 3.2.3 pto 3; ap. 4.2.1 pto 2; ap. 3.2.1 pto 5" },
  {
    colectivoMaxPlantas: 6,
    ultimasPlantasIndividuales: 2,
    ramalFraccionMinColectivo: 0.5,
    bocaSobreCubiertaMin_m: 1,
    bocaCubiertaTransitableMin_m: 2,
    obstaculoCercanoHasta_m: 2,  // ≤ 2 m → superar 1,3·H
    factorObstaculoCercano: 1.3,
    obstaculoLejanoHasta_m: 10,  // entre 2 y 10 m → superar H
  } as const,
);

/** Ap. 3.2.1 pto 4: cualquier sistema. */
export const BOCA_EXPULSION = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 3.2.1 pto 4" },
  { separacionMin_m: 3 } as const,
);

/** Ap. 3.1.4: aparcamientos y garajes de cualquier edificio. */
export const GARAJE_HS3 = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 3.1.4" },
  {
    sistemas: ["natural", "mecanica"] as const, // sin híbrida
    // Natural (3.1.4.1)
    natDistMaxAbertura_m: 25,         // ≤ 25 m por recorrido libre de obstáculos
    natDistOpuestasIntermedia_m: 30,  // > 30 m → abertura equidistante
    natToleranciaEquidistante: 0.05,
    pequenoMaxPlazas: 5,              // «no excedan de 5 plazas NI de 100 m²» (ambas)
    pequenoMaxSuperficie_m2: 100,
    pequenoSeparacionVertical_m: 1.5,
    // Mecánica (3.1.4.2)
    mecSuperficiePorParAberturas_m2: 100, // 1 admisión + 1 extracción por cada 100 m²
    mecSeparacionExtracciones_m: 10,      // estricto: < 10 m
    mecFraccionExtraccionCercaTecho: 2 / 3,
    mecDistTechoMax_m: 0.5,               // ≤ 0,5 m
    mecPlazasDosRedes: 15,                // ≥ 15 plazas → ≥ 2 redes por planta
    coUmbralPlazas: 5,                    // «excedan de 5 plazas O de 100 m²» (cualquiera)
    coUmbralSuperficie_m2: 100,
    coPpmConEmpleados: 50,
    coPpmSinEmpleados: 100,
  } as const,
);

/** Ap. 3.1.3: trasteros (solo en edificios de viviendas, ap. 1.1). */
export const TRASTEROS_HS3 = tablaCTE(
  { ...PROC_HS3, articulo: "ap. 3.1.3" },
  {
    sistemas: ["natural", "hibrida", "mecanica"] as const,
    distMaxAbertura_m: 15,
    separacionVerticalMin_m: 1.5,
    aberturasPasoMinNatural: 2,
  } as const,
);
```

4. **Criterios, fuera de `tablaCTE`.** Un objeto `CRITERIOS_HS3` con:
   - `hipotesisCirculacion: "proporcional" | "salon"`, por defecto `"proporcional"`;
   - `qvpPorPuerta: "caudal-del-local"`;
   - `seccionCocina: "lectura-4.2.2"`;
   - `patinilloDBHR: "aplicar-2,5-conservador"`;
   - `aberturasGarajeRedondeo: "ceil"`;
   - `garajeMasTrasteros: "suma"`.

   Cada uno con su texto de etiqueta «Criterio de proyecto, no exigencia CTE».

### `D:\PROGRAMACION\Instalaciones\src\modules\hs3\calc.ts`

1. **Entrada nueva `sistema: "hibrida" | "mecanica"`.** Sin natural para la vivienda.
2. **Equilibrado** (líneas 494–507):
   - totales con los caudales de cálculo, cada uno ≥ Tabla 2.1;
   - extracción total = máx(Σ, `humedosTotalVivienda`);
   - repartir el aumento según `hipotesisCirculacion` para obtener qva y qve **por local**;
   - cubrir también el caso en que se aumenta la extracción (T1).
3. **Aberturas** (líneas 426–434 y 509–515):
   - admisión = 4·máx(qv, qva); extracción = 4·máx(qv, qve);
   - paso = máx(70, 8·qvp) **por puerta**, con qvp = qva o qve del local que sirve;
   - borrar el comentario «DECISIÓN DE DISEÑO» de las líneas 427–431.
4. **qvt** (línea 520 y red colectiva, 677–842): usar la extracción **equilibrada**, no `totalExtraccion_l_s` propuesto.
5. **Conducto según el sistema:**
   - **híbrida:** Tablas 4.2, 4.3 y 4.4, como ahora. Añadir comprobaciones con veredicto CUMPLE / NO CUMPLE: colectivo ≤ 6 plantas; dos últimas plantas con conducto individual; ramal ≥ ½ del colectivo;
   - **mecánica:** S_req = 2,5·qvt (contiguo a local habitable) o 1,5·qvt (cubierta). Con ubicación «patinillo conforme al DB HR» o «local de instalaciones»: «sin fórmula en el DB», o 2,5 marcado como criterio. Por tramo, también en la red colectiva.
6. **Garaje (nuevo):**
   - qv = 120·N;
   - natural: área de mixtas 960·N cm² por fachada; caso pequeño (≤ 5 plazas **y** ≤ 100 m²); aviso si está en sótano sin fachadas;
   - mecánica: aberturas ⌈S/100⌉ + ⌈S/100⌉ (criterio), separación < 10 m, 2/3 cerca del techo, ≥ 2 redes por planta si N ≥ 15;
   - detección de CO si N > 5 **o** S > 100 m², a 50 / 100 ppm.
7. **Trasteros (nuevo):**
   - qv = 0,7·S;
   - opción «conjunta con el garaje» solo si el garaje es mecánico **y** los trasteros están en su recinto; entonces caudal = suma (criterio) y aviso de SI 1-2;
   - si no, sistema propio según 3.1.3.
8. **Local sin uso y oficinas:** sin cálculo HS 3. Texto de fuera de ámbito y remisión al RITE (ver 9a–9c). Para oficinas, como mucho «IDA 2, 12,5 dm³/s·persona» con su cita del RITE.

### `D:\PROGRAMACION\Instalaciones\src\modules\hs3\ficha.ts` y `D:\PROGRAMACION\Instalaciones\src\modules\hs3\ui.tsx`

- `ficha.ts`:
  - línea 233: `edicionDB` → «DB-HS3 (consolidado 14-06-2022; ap. 2 según FOM/588/2017)»;
  - líneas 83, 89, 222 y 226: «Tabla 4.2/4.3» solo si el sistema es híbrido; con mecánica, «DB-HS3 ap. 4.2.2, fórmula 4.1 (o 4.2 en cubierta)».
- `ui.tsx` (líneas 722–920): `refNorma` y `refText`:
  - «Tabla 2.1 / 4.1» → «ap. 2 (Tabla 2.1) / ap. 4.1 (Tabla 4.1)»;
  - «Tabla 4.2 / 4.3» solo con híbrida;
  - los criterios (reparto del exceso, qvp por puerta) con la etiqueta de criterio.
- Comentarios del Ministerio usados (equilibrado proporcional; área de admisión = solo aireadores): citarlos como «Comentario del Ministerio», no como exigencia.

### Tests

- Cambiarán los snapshots del área de paso, de las áreas de los locales que reciben caudal del equilibrado y del qvt de T1.
- Casos nuevos:
  - T1 con aumento de extracción (12 → 14);
  - T3 con reparto proporcional frente a «salón»;
  - mecánica con S = 2,5·qvt;
  - garaje de 5 plazas y 120 m²: no es «pequeño» y sí exige CO;
  - garaje de 15 plazas: 2 redes;
  - trasteros fuera del recinto del garaje: sin ventilación conjunta.
