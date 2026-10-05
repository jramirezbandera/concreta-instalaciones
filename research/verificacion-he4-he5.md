# Verificación normativa — DB-HE, Secciones HE 4 «Contribución mínima de energía renovable para cubrir la demanda de ACS» y HE 5 «Generación mínima de energía eléctrica procedente de fuentes renovables», para el módulo HE4/HE5 (feature-22)

**Fecha:** 2026-10-05 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** HE 4 y HE 5 completas (DBHE pp. 28–32), Anejo A (pp. 36–45, términos útiles), Anejo F (pp. 52–53), Anejo G (pp. 54–55), HE 0 ap. 3 y 4.1 (pp. 10–11, por analogía y por el intervalo mensual), comentarios del Ministerio (DccHE pp. 1–2, 31–36, 56–59) y Guía de aplicación DB-HE 2019 (pp. 61–72). Puntos 1 a 11 del encargo, en ese orden, más la terminología.

**Regla aplicada:** toda cifra y todo literal citado como VERIFICADO se ha leído en la **imagen** de la página (DBHE y DccHE a 200 ppp; la tabla a-Anejo G además a 300 ppp; la Guía a su resolución de render). El texto extraído solo se ha usado para orientarse y, en tres sitios que se marcan «(texto)», como única fuente porque no había imagen de esa página. Veredictos:
- **VERIFICADO**: literal en el DB, leído en la imagen de [HE22] y coincidente con [DccHE].
- **LEÍDO (comentario)** / **LEÍDO (Guía)**: literal en una sola fuente no reglamentaria. Se puede mostrar, rotulado como tal.
- **CORREGIDO**: lo que dice el encargo no coincide con la fuente.
- **INTERPRETACIÓN**: se sigue del DB, pero el DB no lo escribe tal cual.
- **NO LO FIJA EL DB → CRITERIO**: decisión de producto propuesta, no es exigencia del CTE; la ficha la rotula así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [HE22] | CTE DB-HE «Ahorro de energía», texto consolidado | Portada: «14 Junio 2022». p. 2 (imagen) recoge: RD 314/2006; RD 1371/2007; corr. errores RD 314/2006 (BOE 25/01/2008); Orden FOM/1635/2013 y su corrección (BOE 08/11/2013); **RD 732/2019 (BOE 27/12/2019)**; **RD 450/2022 (BOE 15/06/2022)**; **corrección de errores del RD 450/2022 (BOE 02/02/2023)** | `research/pdf/DBHE.pdf` (codigotecnico.org) | Imagen: pp. 2, 10, 11, 28–32, 38, 39, 41, 43, 44, 52–56 (54 y 55 también a 300 ppp). Texto: p. 34 (HE 6) |
| [DccHE] | DB-HE con comentarios del Ministerio (MITMA) | Articulado 14-jun-2022; **comentarios 22-dic-2023** (p. 1) | `research/pdf/DccHE.pdf` | Imagen: pp. 31–37, 56–59. Texto: pp. 9 (HE 0), 42–43 (Anejo A) y el comentario a HE 1 ap. 3.1.1 |
| [Guía] | Guía de aplicación DB-HE 2019 (Ministerio) | Sin fecha en las páginas leídas; cabecera «DBHE2019» | `research/pdf/Guia_aplicacion_DBHE2019.pdf` | Imagen: pp. 62, 64–67, 69–72. Texto: pp. 61–72 |
| [REPO] | `src/data/zonasClimaticasHE.ts` | Estado actual | repo | Campo `altitudCapital_m` (se compara con la columna «Altitud» del Anejo G en E6.6) |

Avisos de los propios documentos:
- [HE22] p. 2 (imagen): «Este texto consolidado no tiene valor jurídico.»
- [DccHE] p. 2 (texto): los comentarios «tienen un carácter orientativo e informativo no teniendo carácter reglamentario». Los comentarios nuevos o modificados en la versión de 22-12-2023 llevan **doble línea vertical** en el margen; en HE 5 la llevan los dos comentarios de pp. 35–36 sobre patios de luces y fototermia.
- Estado de edición para la ficha: **«DB-HE, edición 2019 (RD 732/2019), texto consolidado 14-06-2022 (RD 450/2022 y su corrección de 02-02-2023)»**. Es la edición que ya usa el repo para el Anejo B (`PROC_ANEJO_B`). No se ha leído el BOE para saber qué disposición tocó cada párrafo de HE 4/HE 5: el contenido es el de la reforma de 2019 (la Guía lo confirma: HE 5 «amplía la obligatoriedad … a todos los edificios»), pero no se ha comprobado si el RD 450/2022 cambió alguna línea.

**Correcciones al encargo (resumen; el detalle va en cada bloque):**
1. «Perímetro próximo / in situ / distante» **no son términos del Anejo A**. El Anejo A clasifica la *energía final* por su origen en «a) in situ», «b) en las proximidades del edificio» y «c) distante». «Perímetro (de evaluación)» es vocabulario de los comentarios y de la Guía (L.3).
2. La definición de **cubierta transitable** («tendederos o piscinas») es un **comentario**, no articulado, aunque en [DccHE] p. 35 esté impresa con letra de cuerpo y sin la raya del margen: no está en [HE22] p. 31 (I.6).
3. El Anejo A **no define** «demanda de ACS», «superficie construida» ni «uso característico». Solo «Demanda (energética)». El comentario a HE 0 dice expresamente que el DB-HE no tiene lista propia de usos (J.4).
4. SCOPdhw: el DB dice **«igual o superior a 2,5»** (≥). La figura 16 de la Guía escribe «> 2.5» y su texto «= 2,5»: manda el DB (B.6).
5. Umbral de 5.000 l/d: el DB dice **«inferior a 5000 l/d»** (estricto). La Guía escribe «menor de 5000» / «mayor de 5000» y deja sin resolver el valor exacto; con el DB, **5.000 l/d justos → 70 %** (B.3).
6. El límite del **20 %** de energía residual solo vale para la recuperación «procedente de equipos de refrigeración en edificios de uso residencial privado», no para cualquier energía residual (B.9).
7. La Guía **no da** el cociente de la biomasa no densificada: solo pellets 1,028/1,113 (C.5).
8. Anejo F, tabla a: las columnas «6» y «≥6» se solapan (6 → 6 personas y ≥6 → 7). No hay comentario que lo aclare (E.3).
9. La Guía (pp. 71 y 72) conserva dos frases de la versión anterior que dicen que HE 5 es solo para edificios no residenciales. Contradicen al DB y a la propia Guía en p. 69 (H.4).
10. La columna «Altitud» del Anejo G no coincide con `altitudCapital_m` de [REPO] en **34 de 52** capitales. En Toledo y Zaragoza la diferencia cambia la zona climática de la capital calculada en [REPO] (E6.6).

---

## Bloque A — HE 4: ámbito de aplicación (ap. 1) — punto 1 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A.1 | Umbral 100 l/d, ¿estricto? | VERIFICADO | **Estricto: D > 100 l/d.** Con 100 l/d justos **no aplica** | ap. 1 pto 1 a): «edificios de nueva construcción con una demanda de agua caliente sanitaria (ACS) superior a 100 l/d, calculada de acuerdo al Anejo F.» | [HE22] p. 28 |
| A.2 | Caso b) existentes | VERIFICADO | — | b): «edificios existentes con una demanda de agua caliente sanitaria (ACS) superior a 100 l/d, calculada de acuerdo al Anejo F, en los que se reforme íntegramente, bien el edificio en sí, o bien la instalación de generación térmica, o en los que se produzca un cambio de uso característico del mismo.» | [HE22] p. 28 |
| A.3 | Caso c) ampliaciones | VERIFICADO | Demanda inicial **> 5.000 l/día** e incremento **> 50 %**, ambos estrictos | c): «ampliaciones o intervenciones, no cubiertas en el punto anterior, en edificios existentes con una demanda inicial de ACS superior a 5.000 l/día, que supongan un incremento superior al 50% de la demanda inicial;» | [HE22] p. 28 |
| A.4 | Caso d) piscinas | VERIFICADO | Una piscina **descubierta** nueva no entra | d): «climatizaciones de: piscinas cubiertas nuevas, piscinas cubiertas existentes en las que se renueve la instalación de generación térmica o piscinas descubiertas existentes que pasen a ser cubiertas.» | [HE22] p. 28 |
| A.5 | Exigencia al conjunto del edificio, no por unidad de uso; también con producción descentralizada | LEÍDO (comentario) | Sí, dos comentarios | [DccHE] p. 31 (a b): «Las exigencias de esta sección se refieren al conjunto del edificio o a su ampliación y no a partes del mismo o a las unidades de uso. En instalaciones descentralizadas, por tanto, la intervención en solo una parte de los sistemas de generación correspondientes a las unidades de uso no supondría la aplicación de esta sección.» · [DccHE] p. 32 (a 3.1): «Dado que la exigencia se establece para el edificio (o la parte ampliada), la demanda a considerar es la del conjunto y no la de las diferentes unidades de uso, independientemente de que la generación de ACS sea descentralizada.» La Guía lo repite (pp. 63 y 68) | [DccHE]; [Guía] |
| A.6 | Reforma íntegra de la generación | LEÍDO (comentario) | Cambio de generador sin cambiar la distribución **sí** entra; cambio de quemador para otro combustible **no** | [DccHE] p. 31: «Por reforma íntegra de una instalación de generación térmica se entiende la sustitución o cambio del generador térmico sin necesidad de cambio de los circuitos de distribución…» · «El cambio del quemador de una instalación de generación térmica, para su adaptación a otro combustible, no se considera una reforma íntegra de la misma.» | [DccHE] |
| A.7 | ACS y piscina, por separado | LEÍDO (comentario) | Dos exigencias independientes | [DccHE] p. 31 (a ap. 2): «Se entiende que esta exigencia se aplica de forma independiente al servicio de ACS y al servicio de climatización de piscina.» | [DccHE] |
| A.8 | ¿La demanda del umbral incluye las pérdidas? | **NO LO FIJA EL DB → INTERPRETACIÓN** | El umbral está en **l/d**, a 60 °C (Anejo F). El Anejo F pto 1 habla de necesidades «incrementadas de acuerdo con las pérdidas térmicas», pero las pérdidas son energía, no litros. Propuesta: comparar 100 y 5.000 l/d con el **volumen de referencia** Σ(28 · personas · fc) + Σ(tabla c), **sin pérdidas** | ap. 1 pto 1 a); Anejo F pto 1 | — |

**Frases de memoria:**
- Aplica: «La demanda de referencia de ACS del edificio, calculada según el Anejo F del DB-HE, es de [D] l/d a 60 °C, superior a 100 l/d, por lo que le es de aplicación la Sección HE 4 (DB-HE, HE 4 ap. 1 pto 1 a). La exigencia se refiere al conjunto del edificio y no a cada unidad de uso.»
- No aplica: «La demanda de referencia de ACS del edificio, calculada según el Anejo F, es de [D] l/d, no superior a 100 l/d, por lo que no le es de aplicación la Sección HE 4 (DB-HE, HE 4 ap. 1 pto 1 a).»

---

## Bloque B — HE 4: cuantificación (ap. 3.1) — punto 2 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B.1 | 70 % general | VERIFICADO | **≥ 70 %** («al menos») de la demanda energética **anual**, obtenida **a partir de los valores mensuales**, **incluyendo pérdidas** | 3.1 pto 1: «La contribución mínima de energía procedente de fuentes renovables cubrirá al menos el 70% de la demanda energética anual para ACS y para climatización de piscina, obtenida a partir de los valores mensuales, e incluyendo las pérdidas térmicas por distribución, acumulación y recirculación.» | [HE22] p. 28 |
| B.2 | 60 % | VERIFICADO | **60 %** si la demanda de ACS es **< 5000 l/d**. Es una opción («podrá»), no una obligación | «Esta contribución mínima podrá reducirse al 60% cuando la demanda de ACS sea inferior a 5000 l/d.» | [HE22] p. 28 |
| B.3 | ¿Estricto? | VERIFICADO + **CORREGIDO respecto a la Guía** | **Estricto**: D < 5000 → 60 %; **D = 5000 → 70 %**. La Guía (p. 62) escribe «un 60% cuando la demanda anual de ACS sea menor de 5000l/d» y «un 70% cuando la demanda anual de ACS sea mayor de 5000l/d»: no resuelve el valor exacto y llama «anual» a una demanda en l/d. Manda el DB | ídem | [HE22] p. 28; [Guía] p. 62 |
| B.4 | ¿La demanda en l/d de qué? | INTERPRETACIÓN | La del **Anejo F**, a **60 °C**, con el **factor de centralización** cuando corresponda (E.4) y, en edificios de otros usos, con la tabla c. Es la misma magnitud que el umbral de 100 l/d (A.8). Sin pérdidas (son energía) | 3.1 pto 1; Anejo F ptos 1 y 2 | [HE22] pp. 28, 52 |
| B.5 | Origen admitido | VERIFICADO | Solo in situ, en las proximidades, o biomasa sólida | «Se considerará únicamente la aportación renovable de la energía con origen in situ o en las proximidades del edificio, o procedente de biomasa sólida.» | [HE22] p. 28 |
| B.6 | SCOPdhw | VERIFICADO + **CORREGIDO respecto a la Guía** | Bomba de calor eléctrica **SCOPdhw ≥ 2,5**; accionada por energía térmica **≥ 1,15**; SCOPdhw determinado a la temperatura de preparación del ACS, que será **≥ 45 °C**. Por debajo del umbral, su contribución renovable **no computa** (cero). La figura 16 de la Guía pone «> 2.5» y «> 1.15»: manda el DB | 3.1 pto 4: «… deberán disponer de un valor de rendimiento medio estacional (SCOPdhw) igual o superior a 2,5 cuando sean accionadas eléctricamente e igual o superior a 1,15 cuando sean accionadas mediante energía térmica. El valor de SCOPdhw se determinará para la temperatura de preparación del ACS, que no será inferior a 45ºC» | [HE22] p. 28; [Guía] p. 62 |
| B.7 | Cómo se justifica el SCOPdhw | LEÍDO (comentario) | Valor declarado por el fabricante; estimación desde el COP nominal con documento reconocido («Prestaciones medias estacionales de las bombas de calor para producción de calor en edificios»); o simulación horaria anual con preparación ≥ 45 °C | [DccHE] p. 33 | [DccHE] |
| B.8 | Ampliaciones del caso 1 c) | VERIFICADO | El mínimo se aplica **sobre el incremento** de demanda | 3.1 pto 2 | [HE22] p. 28 |
| B.9 | Energía residual (pto 5) | VERIFICADO + **matiz** | Puede sustituir total o parcialmente la contribución renovable si es «efectiva y útil para el ACS»; solo recuperadores **ajenos** a la propia instalación térmica. El **20 %** de la energía extraída es el máximo **solo** para la recuperación de **equipos de refrigeración** en edificios de **uso residencial privado** | 3.1 pto 5: «… En el caso de recuperación de energía residual procedente de equipos de refrigeración en edificios de uso residencial privado, no se podrá contabilizar un aprovechamiento de energía superior al 20% de la extraída.» | [HE22] p. 29 |
| B.10 | «Recuperador ajeno» | LEÍDO (comentario) | «aquel cuya presencia o ausencia no modifica el esquema ni el funcionamiento ni el rendimiento de la instalación que genera el calor residual»; no vale el recuperador de humos integrado en el generador; sí, p. ej., el de una torre de refrigeración | [DccHE] p. 33 | [DccHE] |
| B.11 | Sistema de medida (3.2) | VERIFICADO | Se remite al RITE | 3.2 pto 1 | [HE22] p. 29 |

---

## Bloque C — HE 4: cómputo de la contribución renovable — punto 3 del encargo

Ninguna de estas reglas de cálculo está en el articulado de HE 4. Proceden del comentario del Ministerio y de la Guía. La única base reglamentaria es el «a partir de los valores mensuales» de 3.1 pto 1 y el intervalo mensual de HE 0 (C.9).

| # | Afirmación | Veredicto | Valor / regla | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C.1 | Procedimiento en 6 pasos | LEÍDO (comentario) + LEÍDO (Guía) | 1) parte de la demanda cubierta por cada sistema; 2) energía final por vector según el rendimiento; 3) fracción renovable con fep,ren/fep,tot en el perímetro próximo (sin el distante); 4) volver a demanda con el rendimiento; 5) sumar; 6) % sobre la demanda de ACS | [DccHE] p. 32; [Guía] pp. 63–64 (mismo texto) | [DccHE]; [Guía] |
| C.2 | Bomba de calor: ERES = Qusable·(1 − 1/SCOP) | LEÍDO (comentario) | Fórmula del Anejo VII de la Directiva 2009/28/CE. **Ejemplo literal:** 1.000 kWh, SCOP 3,5, BdC al 100 % → «1.000 kWh *(1-1/ 3,5)= 714 kWh» → «71,4 %». Con el 50 % (500 kWh) → «357 kWh» → «35,7 %». (Exacto: 714,29 y 357,14) | [DccHE] p. 33: «ERES=Qusable*(1-1/SCOP) … Qusable : Calor útil total estimado proporcionado por la bomba de calor; SCOP : rendimiento medio estacional.» | [DccHE] p. 33 |
| C.3 | Vectores in situ (solar térmica, FV, energía ambiente de BdC) | LEÍDO (comentario) + LEÍDO (Guía) | fep,ren = fep,tot = 1,0 kWh/kWhf y rendimiento implícito 1,0: su aportación es **directamente demanda renovable**. La Guía añade: «las producciones de fotovoltaica o solar térmica se consideran directamente demanda» | [DccHE] p. 32; [Guía] p. 64 | — |
| C.4 | Vectores distantes (red eléctrica, fósiles) | LEÍDO (comentario) | **No** aportan renovable | [DccHE] p. 32; [Guía] p. 64 | — |
| C.5 | Biomasa sólida y redes de distrito | LEÍDO (comentario) + LEÍDO (Guía) | % renovable = **fep,ren / fep,tot**. Rendimiento de la red de distrito = 1,0 («la demanda aportada es la suministrada por el intercambiador»); el de la caldera de biomasa, el del equipo. **Pellets (Guía, literal): «fep,ren/ fep,tot caldera biomasa = 1,028 / 1,113 = 0,9236»** (exacto: 0,923630…). **La Guía no da la biomasa no densificada** | [DccHE] p. 32; [Guía] p. 65 (imagen) | — |
| C.6 | Redes de distrito: ¿qué cociente? | NO LO FIJA EL DB → dato del proyecto | El de la red concreta, del documento reconocido de factores de paso o del declarado por la red. No hay valor genérico en las fuentes leídas | — | — |
| C.7 | FV in situ que alimenta la BdC o un termo | LEÍDO (Guía) + LEÍDO (comentario) | Guía, caso 5: FV 1.000 kWh; el ACS es el 40 % del consumo eléctrico de los servicios EPB → 400 kWh para ACS; BdC SCOPdhw 3, demanda 1.500 kWh: Cel = 500 (400 FV + 100 red); Camb = 1.000 → DACS,ren = 400 + 1.000 = **1.400 kWh → 93,3 %**. Comentario a HE 5: la FV conectada **directamente** a la instalación de ACS (fototermia) cuenta **al 100 % para HE 4**; si se conecta al cuadro general, «la producción se reparte de manera proporcional a los consumos eléctricos de cada servicio» | [Guía] p. 66; [DccHE] pp. 35–36 | — |
| C.8 | Balance mensual con tope | LEÍDO (Guía) | «Dado el carácter mensual del balance energético no puede, por ejemplo, computarse una mayor aportación de energía renovable que el consumo mensual de ACS del edificio.» El excedente de verano no compensa el invierno | [Guía] p. 64 (imagen) | [Guía] |
| C.9 | Base reglamentaria del intervalo mensual | VERIFICADO (por remisión) | HE 0 ap. 4.1 pto 4: «El cálculo de los indicadores de eficiencia energética, producción y consumo de energía se realizará empleando un intervalo de tiempo mensual.» Y HE 4 3.1 pto 1: demanda anual «obtenida a partir de los valores mensuales» | [HE22] pp. 11, 28 | — |
| C.10 | Coeficientes de paso | VERIFICADO (remisión) | «… serán los publicados oficialmente» (HE 0 ap. 4.1 pto 5). Los comentarios remiten al documento reconocido del RITE «Factores de emisión de CO2 y coeficientes de paso a energía primaria de diferentes fuentes de energía final consumidas en el sector de edificios en España» | [HE22] p. 11; [DccHE] p. 32 | **El documento reconocido no se ha leído** (pendiente P1) |
| C.11 | Los ejemplos de la Guía son anuales | LEÍDO (Guía) | «los ejemplos de cálculos anuales que se realizan a continuación tienen un carácter aproximado y son de carácter didáctico, no pudiendo tomarse su resultado como el definitivo para una evaluación reglamentaria» | [Guía] p. 64 | — |

**Ejemplos de la Guía, pp. 65–66 (demanda 1.500 kWh/año), transcritos de la imagen:**

| Caso | Sistema | DACS,ren | % que da la Guía | % exacto |
|---|---|---|---|---|
| 1 | Caldera de gas + solar térmica 1.000 kWh | 1.000 | «66,6%» | 66,67 % |
| 2 | Caldera de pellets (100 %) | 1.500 · 0,9236 = 1.385,4 | «92,36%» | 92,36 % |
| 3 | Pellets + solar térmica 1.000 kWh | 1.000 + 0,9236 · 500 = 1.461,8 | «97,4%» | 97,45 % |
| 4 | BdC SCOPdhw = 3 | Camb = 1.500 · (1 − 1/3) = 1.000 (la Guía escribe «(1 - 0,33)») | «66,6%» | 66,67 % |
| 5 | BdC SCOPdhw = 3 + FV (400 kWh al ACS) | 400 + 1.000 = 1.400 | «93,3%» | 93,33 % |

La Guía **trunca** (66,6 en lugar de 66,7). La herramienta debe calcular sin truncar y redondear solo al mostrar.

**Consecuencia útil (aritmética, INTERPRETACIÓN):** con una BdC eléctrica que cubre el 100 % de la demanda (pérdidas incluidas) y sin FV, la fracción renovable es 1 − 1/SCOPdhw. Da **60 % justo con SCOPdhw = 2,5** y **70 % con SCOPdhw ≥ 3,33**. Con SCOPdhw < 2,5 la BdC aporta **0 %** (B.6), no 1 − 1/SCOP.

---

## Bloque D — HE 4: justificación (ap. 4) y mantenimiento (ap. 5.4) — punto 4 del encargo

| # | Afirmación | Veredicto | Literal | Fuente |
|---|---|---|---|---|
| D.1 | Contenido de la justificación | VERIFICADO | «a) la demanda mensual de agua caliente sanitaria (ACS) y de climatización de piscina, incluyendo las pérdidas térmicas por distribución, acumulación y recirculación. b) la contribución renovable aportada para satisfacer las necesidades de energía para ACS y climatización de piscina. c) la contribución de la energía residual aportada, en su caso, para el ACS; d) comprobación de que la contribución renovable para las necesidades de ACS utilizada cubre la contribución obligatoria.» | [HE22] p. 29 |
| D.2 | Comentario a ap. 4 | LEÍDO (comentario) | «La demanda de ACS se determinará conforme a lo establecido en el Anejo F y tendrá en cuenta las perdidas caloríficas en distribución/recirculación de agua en los puntos de consumo, así como en los sistemas de acumulación.» | [DccHE] p. 34 |
| D.3 | 5.3 | VERIFICADO | Control de obra terminada según art. 7.4 de la Parte I; «En esta Sección del Documento Básico no se prescriben pruebas finales.» | [HE22] p. 29 |
| D.4 | 5.4 Mantenimiento | VERIFICADO | pto 1: «El plan de mantenimiento incluido en el Libro del Edificio, contemplará las operaciones y periodicidad necesarias para el mantenimiento, en el transcurso del tiempo, de los parámetros de diseño y prestaciones de las instalaciones de aprovechamiento de energía procedente de fuentes renovables.» pto 2: «Así mismo, en el Libro del Edificio se documentará todas las intervenciones, ya sean de reparación, reforma o rehabilitación realizadas a lo largo de la vida útil del edificio.» **No hay tabla de operaciones ni periodicidades** (a diferencia de HS 2) | [HE22] p. 30 |

**Frases de memoria:**
- «Se justifica la demanda mensual de ACS, incluidas las pérdidas por distribución, acumulación y recirculación; la contribución renovable aportada; la contribución de energía residual (no se dispone); y que la contribución renovable, [x] %, cubre la mínima exigida, [60/70] % (DB-HE, HE 4 ap. 4 a–d). CUMPLE / NO CUMPLE.»
- «El plan de mantenimiento del Libro del Edificio contemplará las operaciones y su periodicidad para mantener los parámetros de diseño y prestaciones de la instalación renovable de ACS (HE 4 ap. 5.4).»

---

## Bloque E — Anejo F, demanda de referencia de ACS — punto 5 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| E.1 | 28 l/día·persona a 60 °C | VERIFICADO | **28 l/(día·persona) a 60 °C**, solo para **uso residencial privado** | Anejo F pto 1: «La demanda de referencia de ACS para edificios de uso residencial privado se obtendrá considerando unas necesidades de 28 litros/día·persona (a 60ºC), una ocupación al menos igual a la mínima establecida en la tabla a-Anejo F y, en el caso de viviendas multifamiliares, un factor de centralización de acuerdo a la tabla b-Anejo F, incrementadas de acuerdo con las pérdidas térmicas por distribución, acumulación y recirculación.» | [HE22] p. 52 |
| E.2 | Tabla a | VERIFICADO (imagen; idéntica en [DccHE] p. 56) | Ver transcripción. «al menos igual a la mínima»: el proyecto puede poner más personas, nunca menos | Tabla a-Anejo F | [HE22] p. 52 |
| E.3 | Anomalía «6 → 6» y «≥6 → 7» | VERIFICADO que existe · **NO LO FIJA EL DB → CRITERIO** | La tabla tiene siete columnas: 1, 2, 3, 4, 5, **6**, **≥6**, con personas 1,5 / 3 / 4 / 5 / 6 / **6** / **7**. «6» y «≥6» se solapan en 6 dormitorios. No hay comentario ni en [DccHE] ni en la Guía. La lectura coherente es que «≥6» es una errata de «>6» (o «≥7»): **6 dormitorios → 6 personas; 7 o más → 7**. Si se quiere ir del lado de la seguridad (más demanda), 6 dormitorios → 7, pero eso deja muerta la columna «6». Propuesta en K-HE4.3 | Tabla a-Anejo F | [HE22] p. 52; [DccHE] p. 56 |
| E.4 | Tabla b y su alcance | VERIFICADO + LEÍDO (comentario) | Ver transcripción. El articulado la aplica a «viviendas multifamiliares». El comentario la restringe a la **producción centralizada**: «El factor de centralización afecta a instalaciones de ACS centralizadas, que alimentan a múltiples viviendas, reduciendo la demanda de ACS en función del número de viviendas atendidas.» → con producción individual por vivienda, **fc = 1** aunque el edificio sea plurifamiliar. N = **número de viviendas atendidas** por la instalación centralizada | Tabla b-Anejo F | [HE22] p. 52; [DccHE] p. 56 |
| E.5 | Tabla c | VERIFICADO (imagen; idéntica en [DccHE] pp. 56–57) | Ver transcripción. **Oficinas: 2 l/día·persona.** Son «valores orientativos» que «se consideran como aceptables», a 60 °C, y se incrementan con las pérdidas | Anejo F pto 2 | [HE22] p. 52 |
| E.6 | Usos no incluidos (p. ej. comercio) | VERIFICADO | **No hay fila de comercio.** «La demanda de referencia de ACS para casos no incluidos en la tabla c-Anejo F se obtendrá a partir de necesidades de ACS contrastadas por la experiencia o recogidas por fuentes de reconocida solvencia.» Local sin actividad: el DB no dice nada → CRITERIO K-HE4.5 | Anejo F pto 2 | [HE22] p. 52 |
| E.7 | Ocupación en usos distintos del residencial privado | NO LO FIJA EL DB → CRITERIO | La tabla c es por persona, pero el DB-HE **no da densidades de ocupación** para oficinas ni otros usos. Ver K-HE4.4 | — | — |
| E.8 | Fórmula del pto 3 | VERIFICADO (imagen) | **D(T) = Σ(i=1..12) Di(T)**; **Di(T) = Di(60 °C) · (60 − Ti) / (T − Ti)**. T = «Temperatura del acumulador final»; Ti = «Temperatura media del agua fría en el mes i (según Anejo G)» | Anejo F pto 3: «El consumo de ACS a una temperatura (T), de preparación, distribución o uso, distinta de la de referencia (60ºC), se puede obtener a partir del consumo de ACS a la temperatura de referencia usando las siguientes expresiones: …» | [HE22] p. 53 |
| E.9 | Consecuencia de E.8 | INTERPRETACIÓN (aritmética) | Di(T)·(T − Ti) = Di(60)·(60 − Ti): la **energía** útil es la misma a cualquier temperatura de preparación. Basta calcular la energía a 60 °C; el volumen a T solo hace falta para dimensionar el acumulador | — | — |
| E.10 | Pérdidas por distribución, acumulación y recirculación | **NO LO FIJA EL DB → CRITERIO** | Ni el articulado ni los anejos dan valores ni porcentajes. El comentario lo deja al proyectista: «Las pérdidas térmicas por distribución, acumulación y recirculación deben ser calculadas por el proyectista. Las normas UNE-EN 15316-3:2018 y UNE-EN 15316-5:2019 aportan métodos de cálculo de las pérdidas debidas a la distribución y acumulación de ACS.» Ver K-HE4.7 | [DccHE] p. 56 (comentario a Anejo F pto 1) | [DccHE] |
| E.11 | Variación mensual del consumo | NO LO FIJA EL DB → CRITERIO | El DB da un consumo diario único; no da perfil mensual. Propuesta: Di(60) = consumo diario × días del mes (K-HE4.6) | — | — |

**Tabla a-Anejo F — Valores mínimos de ocupación de cálculo en uso residencial privado** ([HE22] p. 52, imagen)

| Número de dormitorios | 1 | 2 | 3 | 4 | 5 | 6 | ≥6 |
|---|---|---|---|---|---|---|---|
| Número de personas | 1,5 | 3 | 4 | 5 | 6 | 6 | 7 |

**Tabla b-Anejo F — Valor del factor de centralización en viviendas multifamiliares** ([HE22] p. 52, imagen)

| Nº viviendas | N≤3 | 4≤N≤10 | 11≤N≤20 | 21≤N≤50 | 51≤N≤75 | 76≤N≤100 | N≥101 |
|---|---|---|---|---|---|---|---|
| Factor de centralización | 1 | 0,95 | 0,90 | 0,85 | 0,80 | 0,75 | 0,70 |

**Tabla c-Anejo F — Demanda orientativa de ACS para usos distintos del residencial privado** ([HE22] p. 52, imagen) — litros/día·persona a 60 °C

| Criterio de demanda | l/día·persona |
|---|---|
| Hospitales y clínicas | 55 |
| Ambulatorio y centro de salud | 41 |
| Hotel ***** | 69 |
| Hotel **** | 55 |
| Hotel *** | 41 |
| Hotel/hostal ** | 34 |
| Camping | 21 |
| Hostal/pensión * | 28 |
| Residencia | 41 |
| Centro penitenciario | 28 |
| Albergue | 24 |
| Vestuarios/Duchas colectivas | 21 |
| Escuela sin ducha | 4 |
| Escuela con ducha | 21 |
| Cuarteles | 28 |
| Fábricas y talleres | 21 |
| Oficinas | 2 |
| Gimnasios | 21 |
| Restaurantes | 8 |
| Cafeterías | 1 |

**Ejemplos (aritmética, para los tests):**
- Unifamiliar de 2 dormitorios: 3 · 28 = **84 l/d → HE 4 no aplica** (≤ 100). De 3 dormitorios: 4 · 28 = **112 l/d → aplica, 60 %**. De 1 dormitorio: 42 l/d.
- 20 viviendas de 3 dormitorios: 20 · 112 = 2.240 l/d. Centralizada: · 0,90 = **2.016 l/d → 60 %**. Individual: fc = 1 → **2.240 l/d → 60 %**.
- 50 viviendas de 3 dormitorios: 5.600 l/d. Centralizada: · 0,85 = **4.760 l/d → 60 %**. Individual: **5.600 l/d → 70 %**. (El factor de centralización decide el porcentaje.)
- 45 viviendas de 4 dormitorios centralizadas: 45 · 5 · 28 = 6.300 · 0,85 = **5.355 l/d → 70 %**.

---

## Bloque E6 — Anejo G, temperatura del agua de red — punto 6 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| E6.1 | Tabla a | VERIFICADO celda a celda | 52 capitales (50 provincias + Ceuta y Melilla) × (altitud + 12 meses) = **676 casillas**. Temperatura **diaria media mensual** del agua fría, en °C, **enteros** | G pto 1: «La tabla a-Anejo G contiene la temperatura diaria media mensual (ºC) del agua fría de red para las capitales de provincia, para su uso en el cálculo del consumo de ACS:» | [HE22] p. 54 |
| E6.2 | Cotejo del borrador `anejoG-borrador.tsv` | VERIFICADO: **0 discrepancias** | Cotejadas fila a fila las 676 casillas contra la imagen de [HE22] p. 54 a 300 ppp. Además se han repasado por filas contra la imagen de [DccHE] p. 58, que es la misma tabla. **El borrador es correcto tal cual** | — | [HE22] p. 54; [DccHE] p. 58 |
| E6.3 | G.2, fórmula | VERIFICADO (imagen) | **TAFY = TAFCP − B · Az** | G pto 2: «Para localidades distintas a las recogidas en la tabla a-Anejo G se podrá obtener la temperatura del agua fría de red (TAFY) mediante la siguiente expresión: TAFY = TAFCP - B · Az» | [HE22] p. 55 |
| E6.4 | Meses y valores de B | VERIFICADO | **B = 0,0066 de octubre a marzo** (OC, NO, DI, EN, FE, MA) y **0,0033 de abril a septiembre** (AB, MY, JN, JL, AG, SE). Unidades implícitas: °C/m | «B es un coeficiente de valor 0,0066 para los meses de octubre a marzo y 0,0033 para los meses de abril a septiembre;» | [HE22] p. 55 |
| E6.5 | Signo de Az | VERIFICADO | **Az = Altitud de la localidad − Altitud de la capital.** Localidad más alta → Az > 0 → agua más fría. Localidad más baja → Az < 0 → agua más templada | «Az es la diferencia entre la altitud de la localidad y la de su capital de provincia (Az = Altitudlocalidad – Altitudcapital).» TAFCP: «la temperatura media mensual de agua fría de la capital de provincia, obtenida de la tabla a-Anejo G» | [HE22] p. 55 |
| E6.6 | ¿Qué altitud de la capital? | INTERPRETACIÓN + **aviso al repo** | La de la **columna «Altitud» de la tabla a-Anejo G** (la fórmula corrige la temperatura de esa misma tabla). **No** usar `altitudCapital_m` de [REPO]: difiere en **34 de 52** capitales (coinciden solo 18: Ávila, Barcelona, Cáceres, Ciudad Real, Córdoba, Cuenca, Girona, Granada, Guadalajara, Huesca, Lugo, Málaga, Oviedo, Segovia, Sevilla, Soria, Valladolid, Zamora). Diferencias grandes ([REPO] / Anejo G): Toledo 445 / **629**; Burgos 859 / **929**; Pamplona 449 / **490**; Ceuta 10 / **40**; Badajoz 168 / **186**; Lleida 167 / **182**; Palencia 749 / **734**; Vitoria 525 / **540**; Bilbao 19 / **6**; Melilla 25 / **15**. **Efecto colateral en HE 1/HE 0, no en HE 4:** con la altitud del Anejo G, la zona de la capital calculada en [REPO] cambia en **Toledo (C4 → D3)** y **Zaragoza (207 m → D3; 199 m → C3)**. El resto no cambia de tramo. No es objeto de este encargo: se deja en Pendientes (P4) | Tabla a-Anejo G; `zonasClimaticasHE.ts` | [HE22] p. 54; [REPO] |
| E6.7 | Redondeo de TAFY | NO LO FIJA EL DB → CRITERIO | La tabla da enteros, pero la fórmula da decimales. Propuesta: no redondear | — | — |
| E6.8 | Temperaturas absurdas | NO LO FIJA EL DB → CRITERIO | La fórmula no tiene tope: un pueblo a 2.400 m en la provincia de Madrid daría en enero 8 − 0,0066 · 1.745 = **−3,5 °C**. Ver K-HE4.9 | — | — |
| E6.9 | G.3, otras fuentes | VERIFICADO | «Alternativamente a los valores indicados en la tabla a-Anejo G, podrán utilizarse otras temperaturas de agua de red recogidas por fuentes de reconocida solvencia.» | G pto 3 | [HE22] p. 55 |
| E6.10 | Comentarios al Anejo G | VERIFICADO: **no hay** | [DccHE] pp. 58–59 reproducen el articulado sin comentario | — | [DccHE] |

**Ejemplo G.2 (aritmética):** localidad a 1.000 m en la provincia de Madrid (capital 655 m): Az = +345 m. Enero: 8 − 0,0066 · 345 = **5,723 °C**. Julio: 20 − 0,0033 · 345 = **18,8615 °C**. Localidad a 300 m en la misma provincia: Az = −355 → enero 8 + 2,343 = **10,343 °C**.

**Tabla a-Anejo G — Temperatura diaria media mensual de agua fría (°C)** ([HE22] p. 54, imagen a 300 ppp; = [DccHE] p. 58). Verificada completa; el encabezado es el del DB salvo la primera columna («Capital de provincia»), abreviada a `capital` como en el borrador.

```tsv
capital	altitud	EN	FE	MA	AB	MY	JN	JL	AG	SE	OC	NO	DI
A Coruña	26	10	10	11	12	13	14	16	16	15	14	12	11
Albacete	686	7	8	9	11	14	17	19	19	17	13	9	7
Alicante/Alacant	8	11	12	13	14	16	18	20	20	19	16	13	12
Almería	16	12	12	13	14	16	18	20	21	19	17	14	12
Ávila	1131	6	6	7	9	11	14	17	16	14	11	8	6
Badajoz	186	9	10	11	13	15	18	20	20	18	15	12	9
Barcelona	12	9	10	11	12	14	17	19	19	17	15	12	10
Bilbao/Bilbo	6	9	10	10	11	13	15	17	17	16	14	11	10
Burgos	929	5	6	7	9	11	13	16	16	14	11	7	6
Cáceres	459	9	10	11	12	14	18	21	20	19	15	11	9
Cádiz	14	12	12	13	14	16	18	19	20	19	17	14	12
Castellón/Castelló	27	10	11	12	13	15	18	19	20	18	16	12	11
Ceuta	40	11	11	12	13	14	16	18	18	17	15	13	12
Ciudad Real	628	7	8	10	11	14	17	20	20	17	13	10	7
Córdoba	106	10	11	12	14	16	19	21	21	19	16	12	10
Cuenca	999	6	7	8	10	13	16	18	18	16	12	9	7
Girona	70	8	9	10	11	14	16	19	18	17	14	10	9
Granada	683	8	9	10	12	14	17	20	19	17	14	11	8
Guadalajara	685	7	8	9	11	14	17	19	19	16	13	9	7
Huelva	30	12	12	13	14	16	18	20	20	19	17	14	12
Huesca	488	7	8	10	11	14	16	19	18	17	13	9	7
Jaén	568	9	10	11	13	16	19	21	21	19	15	12	9
Las Palmas de Gran Canaria	13	15	15	16	16	17	18	19	19	19	18	17	16
León	838	6	6	8	9	12	14	16	16	15	11	8	6
Lleida	182	7	9	10	12	15	17	20	19	17	14	10	7
Logroño	385	7	8	10	11	13	16	18	18	16	13	10	8
Lugo	454	7	8	9	10	11	13	15	15	14	12	9	8
Madrid	655	8	8	10	12	14	17	20	19	17	13	10	8
Málaga	11	12	12	13	14	16	18	20	20	19	16	14	12
Melilla	15	12	13	13	14	16	18	20	20	19	17	14	13
Murcia	39	11	11	12	13	15	17	19	20	18	16	13	11
Ourense	139	8	10	11	12	14	16	18	18	17	13	11	9
Oviedo	232	9	9	10	10	12	14	15	16	15	13	10	9
Palencia	734	6	7	8	10	12	15	17	17	15	12	9	6
Palma de Mallorca	15	11	11	12	13	15	18	20	20	19	17	14	12
Pamplona/Iruña	490	7	8	9	10	12	15	17	17	16	13	9	7
Pontevedra	27	10	11	11	13	14	16	17	17	16	14	12	10
Salamanca	800	6	7	8	10	12	15	17	17	15	12	8	6
San Sebastián	12	9	9	10	11	12	14	16	16	15	14	11	9
Santa Cruz de Tenerife	5	15	15	16	16	17	18	20	20	20	18	17	16
Santander	11	10	10	11	11	13	15	16	16	16	14	12	10
Segovia	1002	6	7	8	10	12	15	18	18	15	12	8	6
Sevilla	11	11	11	13	14	16	19	21	21	20	16	13	11
Soria	1063	5	6	7	9	11	14	17	16	14	11	8	6
Tarragona	69	10	11	12	14	16	18	20	20	19	16	12	11
Teruel	912	6	7	8	10	12	15	18	17	15	12	8	6
Toledo	629	8	9	11	12	15	18	21	20	18	14	11	8
Valencia	13	10	11	12	13	15	17	19	20	18	16	13	11
Valladolid	698	6	8	9	10	12	15	18	18	16	12	9	7
Vitoria-Gasteiz	540	7	7	8	10	12	14	16	16	14	12	8	7
Zamora	649	6	8	9	10	13	16	18	18	16	12	9	7
Zaragoza	199	8	9	10	12	15	17	20	19	17	14	10	8
```

Notas para enlazarla con [REPO]: las claves del Anejo G son **capitales** («Bilbao/Bilbo», «San Sebastián», «Vitoria-Gasteiz», «Palma de Mallorca», «Pamplona/Iruña», «Castellón/Castelló», «Alicante/Alacant»), mientras que `zonasClimaticasHE.ts` usa **provincias** («Vizcaya», «Guipúzcoa», «Álava», «Baleares», «Navarra», «Asturias» → Oviedo, «Cantabria» → Santander, «La Rioja» → Logroño). Hace falta una tabla de correspondencia explícita (52 filas), no un emparejamiento por nombre.

---

## Bloque G — La energía de la demanda — punto 7 del encargo

| # | Afirmación | Veredicto | Valor | Cita | Fuente |
|---|---|---|---|---|---|
| G.1 | Fórmula de la Guía | LEÍDO (Guía) | **DACS = VACS · CH2O · ρH2O · (60° − Tagua red) [kW·h]**, «de manera general y aproximada», «si bien es necesario contabilizar también las pérdidas de distribución, acumulación y recirculación» | [Guía] p. 65 (imagen) | [Guía] |
| G.2 | ¿Fija constantes? | **NO LAS FIJA** ni el DB ni la Guía → CRITERIO | No hay valor de c ni de ρ en ninguna de las tres fuentes. Propuesta: **c = 4,186 kJ/(kg·K), ρ = 1 kg/l → ρ·c = 4,186/3.600 = 0,0011628 kWh/(l·K) ≈ 1,163 Wh/(l·K)**. Con ρ a 60 °C (≈ 0,983 kg/l) saldría un 1,7 % menos; no usarla: el litro de referencia del Anejo F es volumen de consumo, no masa a 60 °C | — | — |
| G.3 | Demanda mensual | CRITERIO (con E.11) | **Qi [kWh] = Vref,día [l/d] · ni [días] · 0,0011628 · (60 − Ti)**, con ni = 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 (año de 365 días). Después, **+ pérdidas** (K-HE4.7) | — | — |

**Ejemplo (aritmética, para los tests):** unifamiliar de 3 dormitorios en Madrid capital: 112 l/d. Σ ni·(60 − Ti) = 1.612 + 1.456 + 1.550 + 1.440 + 1.426 + 1.290 + 1.240 + 1.271 + 1.290 + 1.457 + 1.500 + 1.612 = **17.144 K·día**. Anual sin pérdidas: 112 · 17.144 · 0,0011628 = **2.232,7 kWh**. Enero: 112 · 1.612 · 0,0011628 = **209,9 kWh**. Julio: 112 · 1.240 · 0,0011628 = **161,5 kWh**. (Con 1,16 Wh/(l·K) saldría 2.227,3 kWh.)

---

## Bloque H — HE 5: ámbito de aplicación (ap. 1) — punto 8 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| H.1 | > 1.000 m², ¿estricto? | VERIFICADO | **Estricto: S > 1.000 m².** Con 1.000 m² justos **no aplica** | ap. 1 pto 1 a): «edificios de nueva construcción cuando superen los 1.000 m² construidos» | [HE22] p. 31 |
| H.2 | b) y c) | VERIFICADO | b) ampliaciones que incrementen la superficie construida «en más de 1.000 m²»; c) reforma íntegra o cambio de uso característico «cuando se superen los 1.000 m² de superficie construida» | ap. 1 pto 1 b) y c) | [HE22] p. 31 |
| H.3 | Qué incluye la superficie construida | VERIFICADO | **Incluye** el aparcamiento **interior**; **excluye** las zonas exteriores comunes | «Se considerará que la superficie construida incluye la superficie de las zonas destinadas a aparcamiento en el interior del edificio y excluye las zonas exteriores comunes.» | [HE22] p. 31 |
| H.4 | Aplica también al residencial privado | VERIFICADO + **CORREGIDO respecto a la Guía (pp. 71–72)** | **Sí.** El ámbito no distingue usos y Fpr;el tiene valor para el residencial privado (0,005). La Guía p. 69: «La última modificación del HE amplía la obligatoriedad de esta sección a todos los edificios (no solo los de uso no residencial privado) de más de 1000m².» **Pero** la propia Guía, p. 71: «La exigencia del HE5 establece para edificios no residenciales la necesidad de generar energía eléctrica…», y p. 72: «Un bloque residencial privado no tiene exigencia de producción de energía eléctrica…». Son restos de la versión 2013: **no usarlos** | ap. 1; ap. 3 pto 1 (Fpr;el) | [HE22] p. 31; [Guía] pp. 69, 71, 72 |
| H.5 | Misma parcela catastral | LEÍDO (comentario) | Para el **umbral** se suma la superficie de todos los edificios de la parcela | [DccHE] p. 35: «En el caso de edificios ejecutados dentro de una misma parcela catastral, para la comprobación del límite establecido, se considera la suma de la superficie construida de todos ellos.» | [DccHE] |
| H.6 | Ampliación | LEÍDO (comentario) | Pmin solo sobre la superficie ampliada | [DccHE] p. 35: «… El cálculo de la potencia mínima a instalar se realizará exclusivamente sobre la superficie ampliada, es decir, sobre los 1200 m².» (ejemplo: edificio de 1.800 m² con 1.200 m² ampliados) | [DccHE] |
| H.7 | Definición de «superficie construida» | **NO LO FIJA EL DB-HE** | El Anejo A no tiene esa entrada (verificado en la imagen de pp. 41–44: de «Salas técnicas» se pasa a «Sistema…», «Solicitaciones…», «Suelo»). No se ha leído el Anejo III de la Parte I. Ver K-HE5.2 | — | [HE22] pp. 41–44 |
| H.8 | Exclusiones generales | INTERPRETACIÓN | HE 5 no tiene apartado de exclusiones. Los edificios protegidos tienen la vía del pto 2 (K.1), no una exclusión | ap. 1 y 3 pto 2 | [HE22] p. 31 |

**Frase de memoria:** «La superficie construida del edificio, incluido el aparcamiento interior y excluidas las zonas exteriores comunes, es de [S] m², superior a 1.000 m², por lo que le es de aplicación la Sección HE 5 (DB-HE, HE 5 ap. 1 pto 1 a).» / «… no superior a 1.000 m², por lo que no le es de aplicación la Sección HE 5.»

---

## Bloque I — HE 5: cuantificación (ap. 3) — punto 9 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| I.1 | Pmin | VERIFICADO (imagen) | **Pmin = mín(P1, P2)**; **P1 = Fpr;el · S**; **P2 = 0,1 · (0,5 · Sc − Soc)**. Pmin en **kW** | ap. 3 pto 1: «La potencia a instalar mínima Pmin será la menor de las resultantes de estas dos expresiones: P1 = Fpr;el · S · P2=0,1 ·(0,5·Sc - Soc)» | [HE22] p. 31 |
| I.2 | Fpr;el | VERIFICADO | **0,005 kW/m²** uso residencial privado; **0,010 kW/m²** resto de usos | «factor de producción eléctrica, que toma valor de 0,005 para uso residencial privado y 0,010 para el resto de usos [kW/m²];» | [HE22] p. 31 |
| I.3 | S, Sc, Soc | VERIFICADO | S: «superficie construida del edificio [m²]». Sc: «superficie de cubierta no transitable o accesible únicamente para conservación [m²]». Soc: «superficie de cubierta no transitable o accesible únicamente para conservación ocupada por captadores solares térmicos [m²]» | ap. 3 pto 1 | [HE22] p. 31 |
| I.4 | Unidades de P2 | INTERPRETACIÓN | 0,1 es kW/m² (100 W por m² de cubierta útil, sobre la mitad de Sc). El DB no da unidad a la constante | — | — |
| I.5 | «Potencia a instalar» | VERIFICADO | En FV es la **suma de las potencias máximas (pico) de los módulos** en condiciones estándar, no la del inversor | Anejo A, «Potencia a instalar», 2.º párrafo: «En el caso de instalaciones fotovoltaicas la potencia instalada será la suma de las potencias máximas unitarias de los módulos fotovoltaicos que configuran dicha instalación, medidas en condiciones estándar según la norma UNE-EN 61215:2006 para módulos de silicio cristalino o la norma UNE-EN 61646:2009 para módulos de lámina delgada.» | [HE22] p. 41 |
| I.6 | Cubierta transitable | LEÍDO (comentario) + **CORREGIDO** (no es articulado) | «Se entiende por cubierta transitable aquella que reúne condiciones de seguridad estructural, uso, u otras, que permiten el tránsito de personas más allá del mero mantenimiento (como por ejemplo tendederos o piscinas).» En [DccHE] está impreso con letra de cuerpo y sin raya, pero **no figura en [HE22] p. 31**: es comentario | [DccHE] p. 35 | [DccHE] |
| I.7 | Patios de luces e instalaciones | LEÍDO (comentario, nuevo en 2023: doble raya) | Se **excluyen** las cubiertas de los patios de luces; **sí** computa en Sc la superficie ocupada por instalaciones | [DccHE] p. 35: «Dentro de las superficies de cubierta no transitables a considerar se excluyen las cubiertas de los patios de luces pero sí debe computarse la superficie ocupada por instalaciones del edificio.» | [DccHE] |
| I.8 | Fototermia | LEÍDO (comentario, nuevo en 2023) | La FV conectada **directamente** al ACS **no** cuenta como captador térmico en Soc, y vale para HE 4 (100 %) y para HE 5. Conectada al cuadro general: reparto proporcional a los consumos eléctricos de cada servicio para HE 4 | [DccHE] pp. 35–36: «Los paneles fotovoltaicos que se conecten directamente a la instalación de ACS (fototermia) no se computan como paneles solares térmicos en el cálculo de la superficie de cubierta ocupada con captadores solares térmicos, pero sí valdrán para justificar tanto el HE4 (el 100% de su producción para HE4) como el HE5. Si la conexión de los paneles fotovoltaicos es al cuadro general entonces la producción se reparte de manera proporcional a los consumos eléctricos de cada servicio a la hora de cumplimiento del HE4.» | [DccHE] |
| I.9 | ¿Qué cuenta como «cubierta»? | VERIFICADO (definición) + INTERPRETACIÓN | Anejo A: «Cubierta: cerramiento en contacto con el aire exterior o con el terreno por su cara superior y cuya inclinación es inferior a 60º respecto al plano horizontal.» → los **tejados inclinados** (< 60°) accesibles solo para conservación **entran en Sc**, y también las cubiertas de cuerpos bajos. Una cubierta **enterrada** (cara superior contra el terreno) es cubierta según la definición, pero no admite captadores: el DB no lo resuelve (CRITERIO K-HE5.3) | Anejo A | [HE22] p. 38 |
| I.10 | Sc = 0 (toda la cubierta transitable) | **NO LO FIJA EL DB → INTERPRETACIÓN** | Literal: P2 = 0,1·(0 − Soc) ≤ 0 → **Pmin = mín(P1, P2) ≤ 0**: no hay potencia mínima exigible. **No hay comentario** en [DccHE] ni en la Guía sobre este caso. La Guía (p. 70) explica que P2 limita la exigencia «por la superficie de cubierta del edificio para tener en cuenta las posibilidades físicas de ocupación», lo que apoya la lectura literal. Riesgo: un técnico municipal puede pedir la vía del pto 2 o FV en otro sitio. Ver K-HE5.5 | ap. 3 pto 1; [Guía] p. 70 | — |
| I.11 | 0,5·Sc < Soc (P2 negativo) | **NO LO FIJA EL DB → CRITERIO** | Literal: Pmin negativo, sin sentido físico. Propuesta: **Pmin = máx(0; mín(P1, P2))**, rotulado como criterio | — | — |
| I.12 | Captadores térmicos en cubierta transitable | INTERPRETACIÓN | Soc solo cuenta los que están sobre cubierta **no transitable**; los que están sobre cubierta transitable no reducen P2 (ni suman a Sc) | definición de Soc | [HE22] p. 31 |
| I.13 | Estimación de producción | LEÍDO (comentario) | «En el caso de instalaciones de producción fotovoltaica, la estimación de producción se realizará a partir de fuentes de reconocida solvencia, como, por ejemplo, la base de datos PVGIS» | [DccHE] p. 36 | [DccHE] |
| I.14 | Cogeneración | LEÍDO (Guía) | Solo computa si se alimenta de renovables (biomasa, biogás); la de gas no | [Guía] pp. 71–72 | [Guía] |

**Ejemplos (aritmética, para los tests):**
- Residencial privado, S = 2.000 m², Sc = 300 m², Soc = 40 m²: P1 = 0,005 · 2.000 = **10 kW**; P2 = 0,1 · (150 − 40) = **11 kW** → **Pmin = 10 kW**.
- Igual con Sc = 150 m²: P2 = 0,1 · (75 − 40) = **3,5 kW** → **Pmin = 3,5 kW**.
- Igual con Sc = 60 m² y Soc = 40 m²: P2 = 0,1 · (30 − 40) = −1 kW → literal −1; con el criterio I.11, **Pmin = 0**.
- Oficinas, S = 1.500 m², Sc = 800 m², Soc = 0: P1 = 0,010 · 1.500 = **15 kW**; P2 = 0,1 · 400 = 40 kW → **Pmin = 15 kW**. (Coincide con los 15 kW del ejemplo de la Guía p. 71.)
- S = 1.000 m² justos → **no aplica**.

---

## Bloque J — HE 5: edificio mixto (viviendas + locales u oficinas) — punto 10 del encargo

| # | Afirmación | Veredicto | Contenido | Fuente |
|---|---|---|---|---|
| J.1 | ¿Qué Fpr;el en un edificio mixto? | **NO LO FIJA EL DB** | HE 5 no lo dice; no hay comentario en [DccHE] pp. 35–36 ni en la Guía pp. 69–72 | — |
| J.2 | «Uso residencial privado» admite zonas | VERIFICADO (definición) | «Uso residencial privado: Edificio **o zona** destinada a alojamiento permanente, cualquiera que sea el tipo de edificio: vivienda unifamiliar, edificio de pisos o de apartamentos, etc, tanto de promoción pública como privada.» → el DB concibe que un edificio tenga zonas de uso residencial privado y zonas de otro uso | [HE22] p. 44 |
| J.3 | Analogías del articulado del propio DB-HE | VERIFICADO | **HE 0 3.1 pto 2:** «En edificios que tengan unidades de uso residencial privado junto a otras de distinto uso, el valor límite del consumo de energía primaria no renovable (Cep,nren,lim) se deberá aplicar de forma independiente a cada una de las partes del edificio con uso diferenciado.» **HE 0 3.2 pto 2:** lo mismo para Cep,tot,lim. **HE 6 3.1 pto 3 (texto):** «En los edificios que tengan unidades de uso residencial privado junto a otras de distinto uso, en los que las zonas de aparcamiento vinculadas a cada uso no estén claramente diferenciadas, se aplicará el criterio correspondiente al uso característico del edificio.» → el DB reparte por uso y solo cae al uso característico cuando no se puede diferenciar | [HE22] pp. 10, 11 (imagen), 34 (texto) |
| J.4 | Comentarios análogos | LEÍDO (comentario, texto) | A HE 1 (Klim): «Las exigencias de Klim son siempre para usos diferenciados (residencial privado y resto). Por eso la valoración de la K de un edificio de uso residencial privado que tiene locales de otros usos debe hacerse independientemente para cada uso.» A HE 0 (p. 9): «El DB-HE plantea la exigencia en términos de uso característico sin definir, a diferencia de DB-SI o DB-SUA, una lista propia de usos para el ámbito del DB, por lo que a la hora de contemplar un cambio de uso debe remitirse a la clasificación de usos que resulte de la aplicación de las normas urbanísticas en cada caso concreto.» | [DccHE] HE 1 ap. 3.1.1; HE 0 ap. 1 (p. 9) |
| J.5 | Propuesta | **CRITERIO** (el más defendible) | **P1 = Σ Fpr;el,i · Si**: 0,005 por la superficie construida de las zonas de uso residencial privado y 0,010 por la de los locales y oficinas. Las zonas comunes, instalaciones y el aparcamiento interior que sirven a las viviendas van con el uso característico (residencial privado). Si un aparcamiento o una zona común sirve a varios usos sin poder diferenciarse, va con el uso característico (analogía HE 6 3.1 pto 3). El umbral de 1.000 m² se comprueba con la S **total**. Rotular: «Criterio de proyecto: Fpr;el ponderado por la superficie de cada uso, por analogía con HE 0 ap. 3.1 y 3.2 pto 2 y HE 6 ap. 3.1 pto 3; el DB-HE no fija el caso mixto» | — |
| J.6 | Alternativas descartadas | CRITERIO | (a) Todo a 0,005 por ser residencial el uso característico: la más favorable al promotor, sin apoyo para usos diferenciables. (b) Todo a 0,010: sin apoyo literal. Mostrar al usuario las tres cifras si se quiere transparencia | — |
| J.7 | Local sin actividad en PB | CRITERIO | No es «alojamiento permanente» → **0,010** (resto de usos) | J.2 |

**Ejemplo (aritmética):** 1.800 m² de viviendas + zonas comunes + garaje, y 400 m² de locales en PB: S = 2.200 m² > 1.000. Ponderado: P1 = 0,005 · 1.800 + 0,010 · 400 = 9 + 4 = **13 kW**. (Uso característico: 11 kW. Todo 0,010: 22 kW.)

---

## Bloque K — HE 5: pto 2, justificación (ap. 4) y mantenimiento (ap. 5.4) — punto 11 del encargo

| # | Afirmación | Veredicto | Literal | Fuente |
|---|---|---|---|---|
| K.1 | Imposibilidad (pto 2) | VERIFICADO | «En aquellos edificios en los que, por razones urbanísticas o arquitectónicas o porque se trate de edificios protegidos oficialmente, siendo la autoridad que dicta la protección oficial quien determina los elementos inalterables, no se pueda alcanzar la potencia a instalar mínima, se deberá justificar esta imposibilidad, analizando las distintas alternativas, y se adoptará la solución que alcance la máxima potencia instalada posible.» | [HE22] p. 31 |
| K.2 | Justificación | VERIFICADO | «a) la potencia de generación eléctrica alcanzada; b) potencia a instalar mínima exigible; c) en su caso, razones que impiden alcanzar la potencia a instalar mínima exigible, análisis de las alternativas y solución adoptada para alcanzar la máxima potencia instalada posible.» | [HE22] p. 32 |
| K.3 | Comparación | INTERPRETACIÓN | **CUMPLE si Pinstalada ≥ Pmin** («alcanzar»). Pinstalada = potencia pico de los módulos (I.5) | — |
| K.4 | 5.3 | VERIFICADO | «En esta Sección del Documento Básico no se prescriben pruebas finales.» | [HE22] p. 32 |
| K.5 | 5.4 Mantenimiento | VERIFICADO | pto 1: «El plan de mantenimiento incluido en el Libro del Edificio, contemplará las operaciones y periodicidad necesarias para el mantenimiento, en el transcurso del tiempo, de los parámetros de diseño y prestaciones de las instalaciones de generación eléctrica procedente de fuentes renovables.» pto 2: igual que HE 4. Sin tabla | [HE22] p. 32 |

**Frases de memoria:**
- «Potencia a instalar mínima exigible: Pmin = mín(P1; P2) = mín(Fpr;el · S; 0,1 · (0,5 · Sc − Soc)) = mín([P1]; [P2]) = [Pmin] kW (DB-HE, HE 5 ap. 3). Potencia de generación eléctrica alcanzada: [Pinst] kWp. CUMPLE / NO CUMPLE (HE 5 ap. 4 a y b).»
- Con Pmin ≤ 0: «Toda la cubierta del edificio es transitable [o la no transitable está ocupada por captadores solares térmicos], por lo que la expresión P2 del ap. 3 pto 1 resulta nula [negativa] y no se deriva potencia mínima exigible. Interpretación literal del DB; no hay comentario del Ministerio sobre este caso.»

---

## Bloque L — Terminología (Anejo A), literales útiles

Leídos en imagen en [HE22] pp. 38, 39, 41, 43 y 44.

| # | Término | Definición literal | Para el módulo |
|---|---|---|---|
| L.1 | Cubierta | «cerramiento en contacto con el aire exterior o con el terreno por su cara superior y cuya inclinación es inferior a 60º respecto al plano horizontal.» | Sc (I.9) |
| L.2 | Demanda (energética) | «energía útil necesaria que tendrían que proporcionar los sistemas técnicos para mantener en el interior del edificio unas condiciones definidas reglamentariamente. Se puede dividir en demanda energética de calefacción, de refrigeración, de agua caliente sanitaria (ACS), de ventilación, de control de la humedad y de iluminación, y se expresa en kW·h/m².año.» **No hay entrada «demanda de ACS»**; la de HE 4 se expresa en l/d (Anejo F) y en kWh | HE 4 |
| L.3 | Energía final (origen) | «Según su origen de generación puede clasificarse la energía final en: a) in situ, que comprende aquella generada en el edificio o en la parcela de emplazamiento del edificio, sea de tipo solar fotovoltaica, solar térmica, energía térmica extraída del ambiente, etc.; b) en las proximidades del edificio, que comprende aquella con procedencia local o en el distrito, como la biomasa sólida, los sistemas urbanos de calefacción o refrigeración, la electricidad generada en las proximidades del edificio, etc.; c) distante, que comprende el resto de orígenes, como en el caso de los combustibles fósiles o el de la electricidad de red.» **«Perímetro» no es término del DB** (corrección 1). Comentario (texto, [DccHE] pp. 42–43): el RD 15/2018 define las instalaciones próximas a efectos de autoconsumo («que estén conectadas en la red interior de los consumidores asociados, estén unidas a estos a través de líneas directas o estén conectadas a la red de baja tensión derivada del mismo centro de transformación») y «Esta definición establece un criterio asimilable al origen en el perímetro próximo de este DB.» | HE 4 3.1 pto 1 |
| L.4 | Energía procedente de fuentes renovables | «energía procedente de fuentes renovables no fósiles, es decir, energía eólica, solar, aerotérmica, geotérmica, hidrotérmica y oceánica, hidráulica, biomasa, gases de vertedero, gases de plantas de depuración y biogás. Debe tenerse en cuenta que no toda la energía generada a partir de fuentes renovables puede ser considerada renovable. La energía generada a partir de fuentes renovables puede tener, en algunos casos, un componente de energía no renovable que debe ser tratado como tal en el cálculo energético.» | HE 4, HE 5 |
| L.5 | Potencia a instalar | Ver I.5 (en FV, suma de potencias máximas de los módulos en condiciones estándar) | HE 5 |
| L.6 | Sistema urbano de calefacción | «distribución de energía térmica en forma de vapor, agua caliente o fluidos refrigerantes, desde una fuente central de producción a través de una red hacia múltiples edificios o emplazamientos, para la calefacción o refrigeración de espacios o procesos.» | HE 4 3.1 pto 3 |
| L.7 | Unidad de uso | «edificio o parte de él destinada a un uso específico, en la que sus usuarios están vinculados entre sí bien por pertenecer a una misma unidad familiar, empresa, corporación; o bien por formar parte de un grupo o colectivo que realiza la misma actividad. En el ámbito de este Documento Básico, se consideran unidades de uso diferentes, entre otras, las siguientes: a) en edificios de vivienda, cada una de las viviendas. b) en edificios de otros usos, cada uno de los establecimientos o locales comerciales independientes.» | A.5 |
| L.8 | Uso residencial privado | «Edificio o zona destinada a alojamiento permanente, cualquiera que sea el tipo de edificio: vivienda unifamiliar, edificio de pisos o de apartamentos, etc, tanto de promoción pública como privada.» | Anejo F pto 1; Fpr;el; J |
| L.9 | Zona común | «Zona o zonas que dan servicio a varias unidades de uso.» | J.5 |
| L.10 | Espacio no habitable | «… En esta categoría se consideran los garajes, aparcamientos, trasteros, cuartos de basuras e instalaciones (ver recintos habitables).» | — |
| L.11 | Sin entrada | **Superficie construida, uso característico, cubierta transitable, demanda de ACS, energía residual** (la define el RITE, según el comentario a 3.1 pto 5: «aquella que se puede obtener como subproducto de un proceso principal»), **biomasa** | — |

---

## Decisiones de producto que esto implica

Lo que la herramienta debería suponer cuando falten datos. Todas son **CRITERIO** y se rotulan así en la ficha, salvo las marcadas como «comentario».

### HE 4

| # | Dato que falta / caso | Supuesto propuesto | Por qué |
|---|---|---|---|
| K-HE4.1 | Umbrales 100 y 5.000 l/d | Comparar con el volumen de referencia a 60 °C (Σ 28·personas·fc + Σ tabla c), **sin pérdidas**. 100 → no aplica; 5.000 → 70 % | A.1, A.8, B.3 |
| K-HE4.2 | Personas por vivienda | Tabla a con el nº de dormitorios de cada tipo de vivienda (el repo ya guarda `dormitorios`). Permitir subirlo («al menos igual»), nunca bajarlo. **Vivienda sin dormitorios (estudio):** 1,5 personas, como 1 dormitorio | E.2 |
| K-HE4.3 | 6 dormitorios o más | **6 → 6; 7 o más → 7**, rotulado: «La tabla a-Anejo F solapa las columnas "6" y "≥6"; se lee "≥6" como "más de 6"». Alternativa prudente, si el responsable la prefiere: 6 → 7 | E.3 |
| K-HE4.4 | Ocupación de oficinas y otros usos | Dato del usuario. Si falta: densidad de ocupación de **DB-SI, tabla 2.1** (administrativo), rotulada «criterio: ocupación de cálculo de DB-SI a falta de dato» (cotejar la cifra en `verificacion-si*`). Consecuencia a enseñar: con 10 m²/persona, unas oficinas de más de 500 m² útiles ya pasan de 100 l/d (50 personas · 2 = 100 l/d no basta; 51 sí) | E.5, E.7 |
| K-HE4.5 | Locales sin actividad en un edificio de viviendas | **Fuera del cómputo** de la demanda, con aviso: «sin uso definido; su demanda se justificará con el proyecto de actividad (Anejo F pto 2: necesidades contrastadas o fuentes de reconocida solvencia)». Comentario a HE 0 (texto): el acondicionamiento de locales sin uso es un cambio de uso | E.6 |
| K-HE4.6 | Perfil mensual del consumo | Consumo diario constante × días naturales de cada mes (31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31) | E.11 |
| K-HE4.7 | Pérdidas por distribución, acumulación y recirculación | **El DB no da cifra.** Entrada del usuario en % de la demanda útil o en kWh/año. Si falta, el resultado se marca **«provisional: pérdidas no declaradas»** y se usa un valor de partida **rotulado como hipótesis del producto, sin fuente normativa** (propuesta a validar: 10 % sin recirculación, 20 % con recirculación). Remitir a UNE-EN 15316-3:2018 y 15316-5:2019 (comentario). No calcular nunca el % renovable con pérdidas 0 sin avisarlo | E.10, D.2 |
| K-HE4.8 | Constante del agua | ρ·c = 4,186/3.600 = **0,0011628 kWh/(l·K)** | G.2 |
| K-HE4.9 | Localidad que no es capital | G.2 con la **altitud de la columna del Anejo G**, sin redondear. Si TAFY < 2 °C: avisar y ofrecer G.3 (fuente de reconocida solvencia); no recortar en silencio | E6.6–E6.8 |
| K-HE4.10 | Fracción renovable | Mes a mes: %ren = Σi mín(Eren,i; Di) / Σi Di, con Di incluidas las pérdidas. Sin truncar; redondear solo al mostrar (1 decimal). CUMPLE si %ren ≥ 60/70 % (comparar sin redondear). Rotular el tope mensual como «Guía de aplicación DB-HE 2019, p. 64» | C.8, C.9 |
| K-HE4.11 | Bomba de calor | Dato obligatorio: SCOPdhw (declarado por el fabricante a ≥ 45 °C). < 2,5 (eléctrica) o < 1,15 (térmica) → aportación renovable **0** y aviso. Si cubre una fracción f de la demanda: Eren,i = f·Di·(1 − 1/SCOPdhw), rotulado «comentario del Ministerio (Directiva 2009/28/CE, Anejo VII)» | B.6, C.2 |
| K-HE4.12 | Solar térmica | Aportación mensual útil = dato del cálculo del proyecto (f-chart, simulación…). La herramienta no la estima: la pide mes a mes (o anual + reparto) y la topa al mes | C.3, C.8 |
| K-HE4.13 | Biomasa | Pellets: **1,028 / 1,113** (Guía). Otro combustible o red de distrito: fep,ren y fep,tot del usuario, con la fuente | C.5, C.6 |
| K-HE4.14 | FV in situ al ACS | Directa al ACS: 100 % a HE 4. Al cuadro general: fracción del ACS en el consumo eléctrico EPB, dato del usuario | C.7, I.8 |
| K-HE4.15 | Energía residual, piscinas, cogeneración | Fuera del módulo (feature-22): «no se dispone» en la memoria | B.9 |

### HE 5

| # | Dato que falta / caso | Supuesto propuesto | Por qué |
|---|---|---|---|
| K-HE5.1 | Umbral | S > 1.000 m² estricto, con garaje interior y sin zonas exteriores comunes. Si hay varios edificios en la misma parcela catastral, sumar para el umbral (comentario) | H.1, H.3, H.5 |
| K-HE5.2 | Superficie construida | Dato del proyecto (medición), sumando todas las plantas, sótanos incluidos. El DB-HE no la define | H.7 |
| K-HE5.3 | Sc y Soc | Sc = cubierta no transitable de **todos los niveles** (también cuerpos bajos y tejados inclinados), **sin** patios de luces y **con** la ocupada por instalaciones (comentario). Las cubiertas enterradas (ajardinadas sobre sótano) **fuera** de Sc. Soc = captadores térmicos sobre esa cubierta (de HE 4: dato único), sin la FV de fototermia | I.3, I.7–I.9 |
| K-HE5.4 | Tejado inclinado: ¿superficie en planta o real? | **Superficie real del faldón** (es superficie del cerramiento «cubierta»; da un P2 mayor, del lado de no infravalorar la exigencia). El DB no lo dice | I.9 |
| K-HE5.5 | Sc = 0 o P2 ≤ 0 | **Pmin = máx(0; mín(P1, P2))**. Si sale 0, la ficha lo dice («no se deriva potencia mínima exigible: interpretación literal, sin comentario del Ministerio») y recomienda justificar en la memoria por qué la cubierta es transitable | I.10, I.11 |
| K-HE5.6 | Edificio mixto | Fpr;el ponderado por superficie de cada uso (J.5). Zonas comunes, instalaciones y garaje con el uso característico. Local sin actividad → 0,010 | J |
| K-HE5.7 | Comparación | CUMPLE si potencia pico instalada ≥ Pmin | K.3, I.5 |
| K-HE5.8 | Imposibilidad (pto 2) | Solo texto: la herramienta no evalúa la imposibilidad; si Pinst < Pmin, ofrece la frase de 4 c) para que el proyectista la complete | K.1, K.2 |

### Comunes

- **Edición en la ficha:** «DB-HE, ed. 2019 (RD 732/2019), consolidado 14-06-2022». Comentarios: «DB-HE con comentarios del Ministerio, 22-12-2023 (no reglamentario)». Guía: «Guía de aplicación DB-HE 2019 (no reglamentaria)».
- **No mostrar:** «perímetro próximo» como término del DB (decir «origen in situ o en las proximidades»); «SCOPdhw > 2,5»; los porcentajes de la Guía truncados (66,6 %); la frase de la Guía de que HE 5 no aplica al residencial; un valor de pérdidas «del DB»; la definición de cubierta transitable como articulado; `altitudCapital_m` de [REPO] en la fórmula de G.2.

---

## Cifras para el código

Formato compacto, sin código de aplicación. Todas leídas en imagen salvo indicación.

```text
# HE 4 — DB-HE ed. 2019, consolidado 14-06-2022 (DBHE.pdf)
HE4.ambito.umbral_l_d            = 100      # estricto ">" (ap.1 pto1 a/b, p.28)
HE4.ambito.ampliacion.demandaIni = 5000     # l/día, estricto ">" (ap.1 pto1 c)
HE4.ambito.ampliacion.incremento = 0.50     # estricto ">" (ap.1 pto1 c)
HE4.contribucion.general         = 0.70     # ">=" (3.1 pto1, p.28)
HE4.contribucion.reducida        = 0.60     # si demanda_l_d < 5000 (estricto) (3.1 pto1)
HE4.contribucion.umbral_l_d      = 5000
HE4.bdc.SCOPdhw_min.electrica    = 2.5      # ">=" (3.1 pto4)
HE4.bdc.SCOPdhw_min.termica      = 1.15     # ">=" (3.1 pto4)
HE4.bdc.Tpreparacion_min_C       = 45       # ">=" (3.1 pto4)
HE4.residual.max_residencial_refrigeracion = 0.20  # de la energía extraída (3.1 pto5, p.29)
HE4.bdc.ERES                     = Qusable*(1-1/SCOP)   # comentario DccHE p.33
HE4.biomasa.pellets.fep_ren      = 1.028    # Guía p.65
HE4.biomasa.pellets.fep_tot      = 1.113    # Guía p.65  -> 0.92363 (Guía: 0,9236)
HE4.insitu.fep_ren_sobre_tot     = 1.0      # solar térmica, FV, energía ambiente (comentario p.32)
HE4.redDistrito.rendimiento      = 1.0      # comentario p.32

# Anejo F (p.52-53)
AnejoF.litros_dia_persona_60C    = 28       # residencial privado
AnejoF.tablaA.dormitorios        = [1, 2, 3, 4, 5, 6, ">=6"]
AnejoF.tablaA.personas           = [1.5, 3, 4, 5, 6, 6, 7]   # solape 6/>=6: ver K-HE4.3
AnejoF.tablaB.N_hasta            = [3, 10, 20, 50, 75, 100, inf]
AnejoF.tablaB.fc                 = [1, 0.95, 0.90, 0.85, 0.80, 0.75, 0.70]
AnejoF.tablaB.soloCentralizada   = true     # comentario DccHE p.56
AnejoF.tablaC (l/día·persona, 60 °C):
  hospitales_clinicas 55 | ambulatorio_centro_salud 41 | hotel_5e 69 | hotel_4e 55 | hotel_3e 41
  hotel_hostal_2e 34 | camping 21 | hostal_pension_1e 28 | residencia 41 | centro_penitenciario 28
  albergue 24 | vestuarios_duchas_colectivas 21 | escuela_sin_ducha 4 | escuela_con_ducha 21
  cuarteles 28 | fabricas_talleres 21 | oficinas 2 | gimnasios 21 | restaurantes 8 | cafeterias 1
AnejoF.pto3: Di(T) = Di(60)*(60-Ti)/(T-Ti) ; D(T) = sum(i=1..12) Di(T)

# Anejo G (p.54-55) — tabla a: TSV del bloque E6 (52 x [altitud + 12 meses], enteros °C)
AnejoG.B.oct_a_mar               = 0.0066   # OC NO DI EN FE MA
AnejoG.B.abr_a_sep               = 0.0033   # AB MY JN JL AG SE
AnejoG.TAFY                      = TAFCP - B*(Alt_localidad - Alt_capital_AnejoG)

# Criterios del producto (NO son del DB)
crit.rho_c_kWh_lK                = 0.0011628   # 4,186/3600
crit.diasMes                     = [31,28,31,30,31,30,31,31,30,31,30,31]
crit.perdidas_hipotesis          = {sin_recirculacion: 0.10, con_recirculacion: 0.20}  # a validar
crit.fraccionRenovable           = sum(min(Eren_i, D_i)) / sum(D_i)   # tope mensual (Guía p.64)
crit.tablaA.7omas                = 7        # 6 -> 6 ; >=7 -> 7 (K-HE4.3)

# HE 5 — DB-HE ed. 2019, consolidado 14-06-2022 (p.31)
HE5.ambito.umbral_m2             = 1000     # estricto ">" (a, b, c)
HE5.Fpr_el.residencial_privado   = 0.005    # kW/m²
HE5.Fpr_el.resto_usos            = 0.010    # kW/m²
HE5.P1                           = Fpr_el*S
HE5.P2                           = 0.1*(0.5*Sc - Soc)
HE5.Pmin                         = min(P1, P2)
crit.HE5.Pmin                    = max(0, min(P1, P2))
crit.HE5.P1_mixto                = sum(Fpr_el_i*S_i)
```

---

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Umbrales y porcentajes HE 4 | DB-HE | 2019 (RD 732/2019), consolidado 14-06-2022 | 2022-06-14 | HE 4 ap. 1 y 3.1 | — | codigotecnico.org · DBHE.pdf, p. 28 (imagen 200 ppp) |
| SCOPdhw mínimo | ídem | ídem | 2022-06-14 | HE 4 ap. 3.1 pto 4 | — | ídem, p. 28 |
| Energía residual (20 %) | ídem | ídem | 2022-06-14 | HE 4 ap. 3.1 pto 5 | — | ídem, p. 29 |
| Ocupación mínima residencial | ídem | ídem | 2022-06-14 | Anejo F pto 1 | Tabla a-Anejo F | ídem, p. 52 |
| Factor de centralización | ídem | ídem | 2022-06-14 | Anejo F pto 1 | Tabla b-Anejo F | ídem, p. 52 |
| Demanda orientativa otros usos | ídem | ídem | 2022-06-14 | Anejo F pto 2 | Tabla c-Anejo F | ídem, p. 52 |
| Conversión de temperatura | ídem | ídem | 2022-06-14 | Anejo F pto 3 | — | ídem, p. 53 |
| Agua fría de red | ídem | ídem | 2022-06-14 | Anejo G pto 1 | Tabla a-Anejo G | ídem, p. 54 (imagen 300 ppp; cotejadas 676 casillas; = DccHE p. 58) |
| Corrección por altitud | ídem | ídem | 2022-06-14 | Anejo G pto 2 | — | ídem, p. 55 |
| Potencia mínima HE 5 | ídem | ídem | 2022-06-14 | HE 5 ap. 1 y 3 | — | ídem, p. 31 |
| ERES de bomba de calor; fc solo centralizada; cubierta transitable; patios de luces; fototermia | DB-HE con comentarios | Comentarios 22-12-2023 (no reglamentario) | 2023-12-22 | HE 4 3.1; Anejo F pto 1; HE 5 ap. 1 y 3 | — | DccHE.pdf, pp. 33, 56, 35–36 |
| Pellets 1,028/1,113; tope mensual | Guía de aplicación DB-HE 2019 | (sin fecha) | — | HE 4, ap. 4.2 de la Guía | — | Guia_aplicacion_DBHE2019.pdf, pp. 64–65 |

---

## Pendientes

1. **P1 — Documento reconocido del RITE de factores de paso** («Factores de emisión de CO2 y coeficientes de paso a energía primaria…»): no leído. Hace falta para biomasa no densificada, otros combustibles y redes de distrito. De memoria (**NO VERIFICADO, no usar sin cotejar**): biomasa no densificada fep,ren 1,003 / fep,tot 1,037; densificada 1,028 / 1,113 (esta última coincide con la Guía).
2. **P2 — Pérdidas térmicas:** el DB no da valores. Decidir con el responsable la hipótesis de K-HE4.7 o leer UNE-EN 15316-3:2018 y 15316-5:2019 (de pago; no disponibles).
3. **P3 — Anejo III de la Parte I del CTE** (¿define «superficie construida» o «uso característico»?): no leído.
4. **P4 — Altitudes de las capitales en `zonasClimaticasHE.ts`** (fuera de este encargo): difieren de la columna del Anejo G en 34 de 52 capitales. Con la altitud del Anejo G cambian Toledo (C4 → D3) y Zaragoza (D3 → C3). Que lo revise quien lleve el Anejo B; para HE 4 se usa siempre la columna del Anejo G.
5. **P5 — HE 6 ap. 3.1 pto 3** (analogía de J.3) leído solo en texto: no había imagen de DBHE p. 34.
6. **P6 — BOE de RD 450/2022 y su corrección (02-02-2023):** no se ha comprobado si tocaron HE 4, HE 5 o los anejos F/G.
7. **P7 — Criterios a validar por el responsable:** K-HE4.3 (6 dormitorios), K-HE4.4 (densidad de oficinas), K-HE4.7 (pérdidas por defecto), K-HE5.3 (cubiertas enterradas fuera de Sc), K-HE5.4 (faldón en verdadera magnitud), K-HE5.5 (Pmin = 0) y K-HE5.6 (Fpr;el ponderado).
