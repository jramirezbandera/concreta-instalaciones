# Verificación normativa — REBT, ITC-BT-10 «Previsión de cargas para suministros en baja tensión», con ITC-BT-04, 16, 25 y 52, para el módulo REBT · Grado de electrificación y previsión de cargas (feature-23)

**Fecha:** 2026-10-05 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** puntos 1 a 12 del encargo, en ese orden. ITC-BT-10 completa; ITC-BT-04 ap. 3 y 4; ITC-BT-16 ap. 2 y 3; ITC-BT-25 ap. 1, 2 y tabla 1; ITC-BT-52 ap. 1, 2 (SPL), 3.1, 3.2, 4 y 5. Además: DB-HE, HE 6, y las guías técnicas de aplicación del Ministerio. Se amplía y confirma en imagen el bloque B de `research/verificacion-edificio-usos.md`. Al final, una revisión del módulo `src/modules/rebt/`, que ya existe.

**Regla aplicada:** todas las cifras y literales marcados como VERIFICADO se han leído en la **imagen** de la página del consolidado del BOE (PNG a 200 ppp). Las guías, también en imagen, salvo donde se marca «(texto)». Veredictos:
- **VERIFICADO**: literal del reglamento, leído en la imagen del consolidado.
- **LEÍDO (Guía)**: literal de una guía técnica de aplicación del Ministerio. No es reglamentaria; la ficha la rotula como guía.
- **LEÍDO (web)**: leído en boe.es o en otra web mediante una consulta resumida, no en la imagen. Hay que cotejarlo antes de citar el literal.
- **CORREGIDO**: lo que dice el encargo, o una fuente secundaria, no coincide con el reglamento.
- **INTERPRETACIÓN**: se sigue del reglamento, pero el reglamento no lo escribe tal cual.
- **NO LO FIJA EL REGLAMENTO → CRITERIO**: decisión de producto. No es exigencia del REBT y la ficha la rotula así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [REBT] | Real Decreto 842/2002, REBT e ITC-BT, texto consolidado | Portada (imagen p. 1): «BOE núm. 224, de 18 de septiembre de 2002 · Referencia: BOE-A-2002-18099». **«Última modificación: 03 de septiembre de 2025»** (p. 5, texto) | `research/pdf/REBT.pdf` (boe.es) | Imagen: pp. 1, 52–53 (BT-04), 97–100 (BT-10), 114–116 (BT-16), 166–169 (BT-25), 266, 268, 279–282 (BT-52). Texto: p. 5; p. 12 (arts. 12 y 13); pp. 109–111 (BT-14); ITC-BT-16 ap. 3 (interruptor general de maniobra); ITC-BT-28 ap. 1 y 3.3.1 |
| [G10] | Guía técnica de aplicación ITC-BT-10 | «Edición: sep 03 · Revisión: 1» | `guia_bt_10_sep03R1.pdf` | Imagen: pp. 2–6 |
| [G25] | Guía técnica de aplicación ITC-BT-25 | «Edición: jul 12 · Revisión: 2» | `guia_bt_25_jul12R2.pdf` | Imagen: pp. 2–3. Texto: pp. 5, 7, 10 |
| [G52] | Guía técnica de aplicación ITC-BT-52 | **«Edición: septiembre 2024 · Revisión: 2»**. El nombre del fichero («nov17R1») engaña | `guia_bt_52_nov17R1.pdf` | Imagen: pp. 1, 27–30, 42–45. Texto: pp. 4, 24–26 |
| [G04] | Guía técnica de aplicación ITC-BT-04 | «Edición: sep 03 · Revisión: 1» | `guia_bt_04_sep03R1.pdf` | Imagen: p. 5 (modelo de MTD). Texto: pp. 8–11 |
| [G16] | Guía técnica de aplicación ITC-BT-16 | «Edición: sep 03 · Revisión: 1» | `guia_bt_16_sep03R1.pdf` | Imagen: p. 7. Texto: pp. 2–3, 8–11 |
| [G14] | Guía técnica de aplicación ITC-BT-14 | «Edición: sep 03 · Revisión: 1» | `guia_bt_14_sep03R1.pdf` | Texto: pp. 4–9 |
| [HE22] | CTE DB-HE, consolidado | 14-06-2022 | `research/pdf/DBHE.pdf` | Imagen: pp. 33–34 (HE 6) |
| [RD1048] | Real Decreto 1048/2013, retribución de la distribución, texto consolidado | «BOE núm. 312, de 30 de diciembre de 2013 · Referencia: BOE-A-2013-13767» · «Última modificación: 03 de noviembre de 2016» | `research/pdf/RD1048_2013.pdf` (boe.es, 2026-10-05) | Imagen: pp. 32–33 (art. 26). Texto: p. 3 |
| [EN8120] | prEN 81-20:2011, «Finalised version» (CEN/TC 10 WG1, doc. N 1072, 2011-07-29), borrador previo a la encuesta CEN. **No es la UNE-EN 81-20 publicada**: que la tabla 6 publicada conserva las cifras de 450 y 630 kg se apoya en fuentes secundarias (Elevator World, «Rated Load and Maximum Available Car Area», resumen web) | — | eigel.es (PDF público del secretariado CEN/AFNOR); no se guarda en el repo | Imagen: pp. 1 y 58 |
| [DBSI] | CTE DB-SI, consolidado | — | `research/pdf/DBSI.pdf` | Imagen: p. 42 (Anejo SI A) |
| [SI3], [SUA9], [SI12] | Verificaciones previas del repo | — | `research/verificacion-si3.md` (B8), `verificacion-sua9.md` (D7.1), `verificacion-si1-si2.md` (10.6) | No releídas aquí; se citan |
| [BOE-web] | Fichas de boe.es: RD 1053/2014 (BOE-A-2014-13681), RD 450/2022 (BOE-A-2022-9848), RD 770/2025, RD 1955/2000 (BOE-A-2000-24019), STC 120/2016 (BOE-A-2016-7297) | — | boe.es | LEÍDO (web), resumen automático |
| [REPO] | `src/modules/rebt/{tablas,justificacion,estado}.ts` | Estado actual, sin commit | repo | Revisión en el bloque M |

Avisos de las propias fuentes:
- El consolidado del BOE advierte: «Este documento es de carácter informativo y no tiene valor jurídico.»
- Las guías BT-10, BT-04, BT-14 y BT-16 son de **2003**, anteriores al RD 1053/2014. La Guía BT-10 **no recoge** el ap. 1 actualizado (no tiene aparcamientos con recarga), ni el ap. 5 (vehículo eléctrico), y numera la previsión de cargas como 5 y los suministros monofásicos como 6. La Guía BT-04 dice «garajes» donde el consolidado dice «aparcamientos o estacionamientos», y no tiene el grupo z.

**Disposiciones que tocaron las ITC usadas** ([BOE-web], sin cotejar con el BOE de cada una):
- **RD 1053/2014** (BOE 31-12-2014, en vigor 30-06-2015).
  - Añade la ITC-BT-52.
  - Modifica las ITC-BT-02, 04, 05, 10, 16 y 25.
  - En la ITC-BT-10: nuevo lugar de consumo en el ap. 1; nuevo ap. 5 (recarga del vehículo eléctrico); «El apartado 5, "Previsión de cargas", pasará a ser el apartado 6» (y el 6 pasa a 7).
  - En la ITC-BT-04: nuevo grupo z.
  - En la ITC-BT-25: circuito C13.
- **RD 450/2022** (BOE 15-06-2022, en vigor al día siguiente), disposición final primera. Modifica del RD 1053/2014:
  - la disposición adicional primera (estacionamientos **no adscritos** a edificios y vía pública: una estación por cada 40 plazas o fracción);
  - el **ap. 3.2** de la ITC-BT-52;
  - el **ap. 5.4** de la ITC-BT-52.
  - **No toca la ITC-BT-10.**
- **RD 770/2025** (BOE 03-09-2025). Es la última modificación del consolidado. Solo modifica la ITC-BT-03 (medios humanos de las empresas instaladoras). No afecta a este módulo.
- Otras disposiciones que tampoco afectan a este módulo:
  - RD 560/2010: terminología de empresas instaladoras.
  - RD 542/2020: art. 14.
  - RD 298/2021: art. 2.
  - RD 145/2023: art. 25.

**Cita para la ficha:** «REBT (RD 842/2002), ITC-BT-10, ap. [x], texto consolidado BOE-A-2002-18099, últ. modif. 03-09-2025. Apartados 1, 2.1.2 y 5 de la ITC-BT-10 e ITC-BT-52 según el RD 1053/2014; ap. 3.2 de la ITC-BT-52 según el RD 450/2022.»
- Las guías se citan aparte: «Guía técnica de aplicación ITC-BT-xx (Ministerio, ed. …), no reglamentaria».
- Que el RD 1053/2014 tocara el ap. 2.1.2 de la ITC-BT-10 es **INTERPRETACIÓN**: ese apartado menciona la recarga del vehículo eléctrico, que no existía en 2002.

**Correcciones al encargo (resumen; el detalle va en cada bloque):**
1. La lista ampliada de la electrificación elevada (secadora, automatización, más de 30 puntos de luz, más de 20 tomas, más de 6 tomas de baño y cocina) **no está en la ITC-BT-10**.
   - Está en la **Guía BT-10** (pp. 2–3) y en la **Guía BT-25** (p. 2).
   - Se deriva de la ITC-BT-25: ap. 2.3.2 (automatización, C10 secadora, C6, C7 y C12) y máximos de la tabla 1 (30, 20 y 6 puntos). (A.3)
2. La **reserva de local para centro de transformación** ya no está en el RD 1955/2000: sus arts. 44, 45 y 47 están **derogados** por el RD 1048/2013. Hoy está en el **art. 26 del RD 1048/2013**, leído en literal el 2026-10-05: es una obligación del solicitante («deberá reservar un local»), no algo que la distribuidora «puede exigir». El art. 13 del REBT remite a esa reglamentación. (I)
3. La ITC-BT-52 ap. 4.1 define P1 como «el número de viviendas por el coeficiente de simultaneidad». Es una **redacción imprecisa**; manda la ITC-BT-10 ap. 3.1 (media aritmética × coeficiente). La Guía BT-52, Anexo 2, calcula «P1(diurno) = CS · Pm,v». (B.6)
4. La ITC-BT-10 ap. 5.2 **solo vale** para viviendas nuevas en régimen de propiedad horizontal (título del ap. 5 y del 5.2). Para el garaje de un edificio de oficinas, la Guía BT-52 (p. 28) da **«P5 mínimo = (Nº plazas / 40) · 3,68 kW»**, no el 10 %. (F.7)
5. La Guía BT-52, Anexo 2, recomienda **PVE = FS1·N·3 680 W con N = plazas con preinstalación** cuando la preinstalación pasa del 50 % de las plazas. Con el HE 6 (100 % en residencial privado) eso es **siempre** en vivienda nueva, y da **10 veces** el mínimo reglamentario sin SPL. Es una recomendación de la Guía, no una exigencia. La propia Guía dice que el 10 % «debe considerarse como valor mínimo reglamentario». (F.9–F.11)
6. Esquema 4 (4a y 4b): la ITC-BT-52 ap. 4.3 fija el **factor 1,0**. La Guía BT-52 (p. 43) admite el SPL en el 4b y le aplica el «caso general» (0,3). Manda el reglamento. (F.6)
7. El consolidado tiene más erratas en la ITC-BT-10:
   - ap. 5.2: «y **su** sumará» (se sumará) y «un sistema protección» (sistema **de** protección);
   - tabla 1: la fórmula «15,3+(n-21).0,5» usa el punto como signo de multiplicar;
   - confirmadas las de n = 19 («14 3») y n = 21 («15 3»).
8. **Superficie de los locales:** el modelo de memoria técnica de diseño de la Guía BT-04 escribe **«Superficie útil total»**. Es la única pista ministerial; el reglamento no lo fija. (D.4)
9. **Ascensor por defecto:** ITA-2 (400 kg) **no** basta para una cabina accesible. La más pequeña admitida, 1,00 × 1,25 m, necesita al menos 450 kg (tabla 6 de la EN 81-20, leída en el borrador CEN; C.6 bis). Hay que tomar **ITA-3** (630 kg, 11,5 kW). (C.6)
10. El módulo del repo pasa la unifamiliar a trifásica por encima de 9 200 W. La ITC-BT-10 ap. 7 obliga a la distribuidora a dar monofásico **hasta 14 490 W** si lo pide el cliente. (M.1)

---

## Bloque A — Grado de electrificación (ITC-BT-10 ap. 2; ITC-BT-25 ap. 1, 2.1 y 2.3.2) — punto 1 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A.1 | Básica | VERIFICADO | — | 2.1.1: «Es la necesaria para la cobertura de las posibles necesidades de utilización primarias sin necesidad de obras posteriores de adecuación. Debe permitir la utilización de los aparatos eléctricos de uso común en una vivienda.» | [REBT] p. 98 |
| A.2 | Criterios de la elevada (reglamento) | VERIFICADO | Cinco criterios: electrodomésticos por encima de la básica; calefacción eléctrica; aire acondicionado; **superficie útil > 160 m²**; recarga del vehículo eléctrico **en unifamiliar**; o combinación | 2.1.2: «Es la correspondiente a viviendas con una previsión de utilización de aparatos electrodomésticos superior a la electrificación básica o con previsión de utilización de sistemas de calefacción eléctrica o de acondicionamiento de aire o con superficies útiles de la vivienda superiores a 160 m², o con una instalación para la recarga del vehículo eléctrico en viviendas unifamiliares, o con cualquier combinación de los casos anteriores.» | [REBT] p. 98 |
| A.3 | ITC-BT-25 2.3.2 añade automatización y el criterio de circuitos | VERIFICADO | Elevada si los electrodomésticos «obligue[n] a instalar más de un circuito de cualquiera de los tipos» (C1–C5), y con automatización, gestión técnica de la energía y seguridad. Circuitos: **C6** por cada 30 puntos de luz; **C7** por cada 20 tomas o si la superficie útil es mayor de 160 m²; **C8** calefacción eléctrica; **C9** aire acondicionado; **C10** secadora independiente; **C11** automatización; **C12** C3 o C4 adicionales, o C5 adicional «cuando su número de tomas de corriente exceda de 6»; **C13** recarga | «Es el caso de viviendas con una previsión importante de aparatos electrodomésticos que obligue a instalar mas de un circuito de cualquiera de los tipos descritos anteriormente, así como con previsión de sistemas de calefacción eléctrica, acondicionamiento de aire, automatización, gestión técnica de la energía y seguridad, para la recarga de vehículos eléctricos en viviendas unifamiliares, o con superficies útiles de las viviendas superiores a 160 m².» | [REBT] p. 168 |
| A.4 | Lista ampliada | LEÍDO (Guía) + **CORREGIDO** (no es de la ITC-BT-10) | Es elevada si: superficie útil > 160 m²; aire acondicionado; calefacción eléctrica; automatización; secadora; **> 30 puntos de luz**; **> 20 tomas de uso general**; **> 6 tomas de baño y auxiliares de cocina**; «en otras condiciones indicadas en la ITC-BT-25». Es la traducción de la tabla 1 de la ITC-BT-25 (máximos por circuito: C1 30, C2 20, C5 6) y de los circuitos C6–C12. **No incluye la recarga del vehículo eléctrico:** la guía es de 2003 | [G10] pp. 2–3: «El grado de electrificación de una vivienda será "electrificación elevada" cuando se cumpla alguna de las siguientes condiciones: …». Igual en [G25] p. 2 | [G10]; [G25] |
| A.5 | Excepciones que **no** llevan a la elevada | VERIFICADO + LEÍDO (Guía, texto) | (a) **Reglamento**, tabla 1, nota (8): desdoblar el C4 «no supondrá el paso a electrificación elevada ni la necesidad de disponer de un diferencial adicional». (b) **Guía**: desdoblar el C1, C2 o C5 sin superar el máximo de puntos «no supondrá el paso a electrificación elevada si se mantiene el mismo interruptor general». (c) **Guía**: una automatización que no gestione cargas distintas de las de la básica no obliga a la elevada | [REBT] p. 169 (imagen); [G25] pp. 5 y 7 (texto) | — |
| A.6 | 5 750 W y 9 200 W | VERIFICADO | **≥ 5 750 W a 230 V** por vivienda nueva; **≥ 9 200 W** en elevada. Son mínimos; los fija el promotor de acuerdo con la empresa suministradora | 2.2: «… la potencia a prever, la cual, para nuevas construcciones, no será inferior a 5 750 W a 230 V, en cada vivienda, independientemente de la potencia a contratar por cada usuario … En las viviendas con grado de electrificación elevada, la potencia a prever no será inferior a 9 200 W.» | [REBT] p. 98 |
| A.7 | Correspondencia con el IGA | VERIFICADO | «En todos los casos, la potencia a prever se corresponderá con la capacidad máxima de la instalación, definida ésta por la intensidad asignada del interruptor general automático, según se indica en la ITC-BT-25.» ITC-BT-25 ap. 1: la capacidad de la instalación y la de la derivación individual son, como mínimo, la del IGA | [REBT] pp. 98, 167 | — |
| A.8 | IGA mínimo 25 A | VERIFICADO | «Un interruptor general automático de corte omnipolar con accionamiento manual, de intensidad nominal mínima de 25 A …» | ITC-BT-25 ap. 2.1 | [REBT] p. 167 |
| A.9 | Tabla C (escalones) | LEÍDO (Guía) | 5 750 W / 25 A y 7 360 W / 32 A (básica); 9 200 / 40, 11 500 / 50 y 14 490 / 63 (elevada). Son 230 V × calibre. La misma tabla es la «Tabla A» de la Guía BT-25 | [G10] p. 6, «Tabla C: escalones de potencia prevista en suministros monofásicos»; [G25] p. 3 | [G10]; [G25] |
| A.10 | En la básica caben 5 750 y 7 360 W | LEÍDO (Guía) | «En consecuencia, teóricamente la previsión de carga en un grado de electrificación básico abarca el rango 5 750 W a 9 199 W, aunque en la práctica al estar condicionada esta previsión al calibre del interruptor general automático, los dos valores posibles son 5 750 W (para un calibre de 25 A) y 7 360 W (para un calibre de 32 A).» | [G10] p. 3 | — |
| A.11 | Las cifras son mínimos | LEÍDO (Guía) | «Las previsiones de carga establecidas son los valores teóricos mínimos a considerar. Por lo tanto, en caso de conocer la demanda real de los usuarios, es necesario utilizar estos valores cuando sean superiores a los mínimos teóricos.» | [G10] p. 2 | — |
| A.12 | ¿«> 160 m²» estricto? | VERIFICADO | **Estricto.** Con 160 m² justos no es elevada por superficie. Superficie **útil** de la vivienda | 2.1.2: «superiores a 160 m²»; ITC-BT-25 C7: «mayor de 160 m²» | [REBT] pp. 98, 168 |
| A.13 | Máximo monofásico | VERIFICADO | Monofásico obligatorio para la distribuidora, si lo pide el cliente, hasta **14 490 W**. Por encima, trifásico (INTERPRETACIÓN) | ap. 7: «Las empresas distribuidoras estarán obligadas, siempre que lo solicite el cliente, a efectuar el suministro de forma que permita el funcionamiento de cualquier receptor monofásico de potencia menor o igual a 5750 W a 230 V, hasta un suministro de potencia máxima de 14 490 W a 230V.» | [REBT] p. 100 |
| A.14 | Aerotermia | **NO LO FIJA EL REGLAMENTO → CRITERIO** | El REBT no define «calefacción eléctrica». Una bomba de calor para calefacción es un sistema de calefacción accionado eléctricamente con circuito propio (C8 o C9, 25 A, hasta 5 750 W por la nota (2) de la tabla 1). Lectura propuesta: **elevada**. Si la bomba de calor es **solo de ACS** (termo con bomba de calor), cabe en el C4 («termo eléctrico») y **no** obliga a la elevada. Ver K-REBT.2 | ITC-BT-10 2.1.2; ITC-BT-25 2.3.2 y tabla 1 | — |

**Frases de memoria:**
- Básica: «Las viviendas del tipo [X] (superficie útil [S] m², no superior a 160 m²) no prevén calefacción eléctrica, aire acondicionado, automatización ni electrodomésticos que obliguen a circuitos adicionales: grado de electrificación básica, potencia prevista [5 750 / 7 360] W a 230 V, IGA de [25 / 32] A (REBT, ITC-BT-10 ap. 2.1.1 y 2.2; ITC-BT-25 ap. 2.1).»
- Elevada: «Las viviendas del tipo [X] tienen grado de electrificación elevada por [superficie útil de S m², superior a 160 m² / previsión de calefacción eléctrica (bomba de calor) / aire acondicionado / …]: potencia prevista [9 200] W a 230 V, IGA de [40] A (ITC-BT-10 ap. 2.1.2 y 2.2; ITC-BT-25 ap. 2.3.2).»

---

## Bloque B — Conjunto de viviendas, tabla 1 (ITC-BT-10 ap. 3.1) — punto 2 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B.1 | Regla | VERIFICADO | **P1 = media aritmética de las potencias máximas previstas × coeficiente** | 3.1: «Se obtendrá multiplicando la media aritmética de las potencias máximas previstas en cada vivienda, por el coeficiente de simultaneidad indicado en la tabla 1, según el número de viviendas.» | [REBT] p. 98 |
| B.2 | Tabla 1, n = 1…21, casilla a casilla | VERIFICADO (cotejada contra [G10] p. 4) | Ver la transcripción. **Las 21 casillas y la fórmula coinciden** en las dos fuentes, salvo las erratas tipográficas del consolidado | Tabla 1 | [REBT] pp. 98–99; [G10] p. 4 |
| B.3 | Erratas del consolidado | VERIFICADO / **CORREGIDO** | n = 19: «14 3» → **14,3**. n = 21: «15 3» → **15,3**. La Guía imprime 14,3 y 15,3, y la fórmula de n > 21 parte de 15,3. Para n = 19 hay además coherencia aritmética: los saltos son de 0,6 entre 15 y 19 (11,9 → 12,5 → 13,1 → 13,7 → 14,3) | Tabla 1 | [REBT] p. 99; [G10] p. 4 |
| B.4 | n > 21 | VERIFICADO | **15,3 + (n − 21) · 0,5**. El consolidado lo escribe «15,3+(n-21).0,5» | Tabla 1 | [REBT] p. 99 |
| B.5 | Tarifa nocturna | VERIFICADO + LEÍDO (Guía) | Coeficiente = n.º de viviendas. Guía: «Se considerará que la instalación de tarifa nocturna está prevista, cuando el proyecto o memoria técnica del edificio así lo contemple.» | «Para edificios cuya instalación esté prevista para la aplicación de la tarifa nocturna, la simultaneidad será 1 (Coeficiente de simultaneidad = n.º de viviendas)» | [REBT] p. 99; [G10] p. 4 |
| B.6 | ITC-BT-52 4.1: P1 = «número de viviendas por el coeficiente» | VERIFICADO (que lo dice) + **INTERPRETACIÓN: redacción imprecisa, no cambia nada** | Tomado al pie de la letra, n × CS no tiene sentido: el coeficiente **ya es** un número equivalente de viviendas. Manda la ITC-BT-10 3.1, a la que remite la propia ITC-BT-52 («la tabla 1 de la (ITC) BT-10»). La Guía BT-52 repite la redacción (pp. 28 y 43), pero en el Anexo 2 calcula «P1(diurno) = CS · Pm,v», con Pm,v la media aritmética | ITC-BT-52 4.1: «P1 Carga correspondiente al conjunto de viviendas obtenida como el número de viviendas por el coeficiente de simultaneidad de la tabla 1 de la (ITC) BT-10.» | [REBT] p. 281; [G52] pp. 28, 43–45 |
| B.7 | Ejemplo de la Guía | LEÍDO (Guía) + comprobado | 12 × 5 750 + 2 × 9 200 = 87 400 W. / 14 = 6 242,857 W. × 11,3 = **70 544,3 W** → «70,544kW» ✓. Áticos de 200 m²: elevada por superficie; resto, básica | [G10] p. 4: «11,3 · ((12 · 5750 + 2 · 9200) / 14) = 70,544kW» | [G10] |
| B.8 | Media con viviendas de distinto grado | INTERPRETACIÓN (avalada por el ejemplo) | Media **ponderada por el número de viviendas de cada tipo**, sobre las potencias previstas (no sobre los mínimos si se prevé más) | B.1, B.7 | — |

**Tabla 1 — Coeficiente de simultaneidad, según el número de viviendas** (ITC-BT-10 ap. 3.1; [REBT] pp. 98–99 y [G10] p. 4, imagen)

| n | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | n > 21 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| CS | 1 | 2 | 3 | 3,8 | 4,6 | 5,4 | 6,2 | 7 | 7,8 | 8,5 | 9,2 | 9,9 | 10,6 | 11,3 | 11,9 | 12,5 | 13,1 | 13,7 | 14,3 | 14,8 | 15,3 | 15,3 + (n − 21) · 0,5 |

**Ejemplos (para los tests):** 20 viviendas básicas: 14,8 × 5 750 = **85 100 W**. 21: 15,3 × 5 750 = **87 975 W**. 30: (15,3 + 9 · 0,5) = 19,8 → × 5 750 = **113 850 W**.

**Frase de memoria:** «Carga de las viviendas: [n] viviendas con una potencia media prevista de [Pm] W; coeficiente de simultaneidad [CS] (ITC-BT-10, tabla 1); P1 = [Pm] × [CS] = [P1] W (ITC-BT-10 ap. 3.1).» Con tarifa nocturna: «… coeficiente = n.º de viviendas, por estar prevista la tarifa nocturna (ITC-BT-10 ap. 3.1).»

---

## Bloque C — Servicios generales (ITC-BT-10 ap. 3.2) — punto 3 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C.1 | Simultaneidad 1 | VERIFICADO | Suma sin reducción | 3.2: «Será la suma de la potencia prevista en ascensores, aparatos elevadores, centrales de calor y frío, grupos de presión, alumbrado de portal, caja de escalera y espacios comunes y en todo el servicio eléctrico general del edificio sin aplicar ningún factor de reducción por simultaneidad (factor de simultaneidad = 1).» | [REBT] p. 99 |
| C.2 | Tabla A (ITA) | LEÍDO (Guía) | Ver la transcripción. Valores «típicos» según la Norma Tecnológica NTE-ITA, **no reglamentarios** | [G10] p. 5: «En la siguiente tabla se indican los valores típicos de las potencias de los aparatos elevadores según especifica la Norma Tecnológica de la Edificación ITE-ITA» (sic: ITE) | [G10] |
| C.3 | Alumbrado común | LEÍDO (Guía) | Portal y otros espacios comunes: **15 W/m²** (incandescencia) / **8 W/m²** (fluorescencia). Caja de escalera: **7 W/m²** / **4 W/m²** | [G10] p. 5: «Para el alumbrado de portal y otros espacios comunes se puede estimar una potencia de 15 W/m² si las lámparas son incandescentes y de 8 W/m² si son fluorescentes. Para el alumbrado de la caja de escalera se puede estimar una potencia de 7 W/m² para incandescencia y de 4 W/m² para alumbrado con fluorescencia.» | [G10] |
| C.4 | LED | **NO LO FIJA EL REGLAMENTO → CRITERIO** | Ni el REBT ni la Guía hablan de LED. Propuesta: tomar las cifras de **fluorescencia (8 y 4 W/m²) como cota superior**. La eficacia del LED es igual o mayor, así que es del lado de la seguridad sin inflar la previsión. Ver K-REBT.6 | — | — |
| C.5 | Otros servicios | VERIFICADO (la lista) + CRITERIO (las cifras) | Centrales de calor y frío, grupos de presión y «todo el servicio eléctrico general». El REBT no da cifras: dato del proyecto, o de otros módulos (grupo de presión de HS 4, producción de ACS centralizada de HE 4). **No meter aquí** la ventilación ni el alumbrado del garaje: van en el ap. 3.4 (INTERPRETACIÓN, para no contarlos dos veces) | 3.2 | [REBT] p. 99 |
| C.6 | Ascensor por defecto: ¿ITA-2 o ITA-3? | **CRITERIO** + dato **LEÍDO** (ver C.6 bis) | **ITA-3** (630 kg, 8 personas, 1,00 m/s, **11,5 kW**). Motivos: (a) la cabina mínima de un ascensor accesible es 1,00 × 1,25 m (tabla corregida desde el 21-02-2025: 1,00 × 1,30), y 1,10 × 1,40 m con viviendas accesibles para usuarios de silla de ruedas ([SUA9] D7.1.2 y D7.1.4); (b) por la UNE-EN 81-20 (tabla de superficie de cabina por carga), 1,00 × 1,25 ≈ 1,25 m² corresponde a **450 kg / 6 personas** y 1,10 × 1,40 ≈ 1,54 m² a **630 kg / 8 personas** (**de memoria, no verificado**: UNE de pago, no leída); (c) ITA-1 e ITA-2 son de 400 kg / 5 personas, por debajo de cualquier cabina accesible. La primera fila de la tabla A que cubre los dos casos es ITA-3. Los valores ITA son antiguos (máquinas de dos velocidades); un ascensor actual con variador consume menos. El dato del proyecto manda | [G10] p. 5; [SUA9] D7.1 | — |
| C.6 bis | Cabina y carga (2026-10-05) | **LEÍDO (borrador CEN)** + **VERIFICADO** (DB-SI) | (a) Tabla «Rated load and maximum available car area» (tabla 5 del borrador, tabla 6 de la EN 81-20 publicada): **400 kg → 1,17 m²; 450 kg → 1,30 m²; 525 → 1,45; 600 → 1,60; 630 kg → 1,66 m²**; «For intermediate loads the area is determined by linear interpolation». Es la superficie **máxima** por carga, así que una cabina de 1,00 × 1,25 = 1,25 m² necesita **≥ 450 kg** (400 kg solo admite 1,17 m²) y la de 1,00 × 1,30 de la tabla corregida, 1,30 m², exactamente 450 kg. (b) DB-SI, Anejo SI A, «Ascensor de emergencia»: «Tendrá como mínimo una capacidad de carga de 630 kg, unas dimensiones de cabina de 1,10 m x 1,40 m, una anchura de paso de 1,00 m…». (c) **Matiz:** por la tabla, 1,10 × 1,40 = 1,54 m² pediría solo unos 570 kg (interpolando entre 525 y 600); los 630 kg de esa cabina son el tipo 2 de la UNE-EN 81-70 y el mínimo del ascensor de emergencia, no un mínimo de la tabla 6. **Conclusión para K-REBT.5:** ninguna cabina accesible cabe en 400 kg, y la tabla A de la Guía BT-10 salta de 400 a 630 kg: ITA-3 se mantiene | Tabla 5 del prEN 81-20:2011: «Rated load, mass (kg) / Maximum available car area (m²)». DB-SI Anejo SI A | [EN8120] p. 58 (imagen, 130 ppp); [DBSI] p. 42 (imagen, 170 ppp) |

**Tabla A de la Guía BT-10 — Previsión de potencia para aparatos elevadores** ([G10] p. 5, imagen; no reglamentaria)

| Tipo | Carga (kg) | Nº de personas | Velocidad (m/s) | Potencia (kW) |
|---|---|---|---|---|
| ITA-1 | 400 | 5 | 0,63 | 4,5 |
| ITA-2 | 400 | 5 | 1,00 | 7,5 |
| ITA-3 | 630 | 8 | 1,00 | 11,5 |
| ITA-4 | 630 | 8 | 1,60 | 18,5 |
| ITA-5 | 1000 | 13 | 1,60 | 29,5 |
| ITA-6 | 1000 | 13 | 2,50 | 46,0 |

**Frase de memoria:** «Servicios generales, con simultaneidad 1 (ITC-BT-10 ap. 3.2):
- ascensor de [carga] kg a [v] m/s, [P] kW ([dato del proyecto] / [valor típico ITA-3 de la Guía BT-10, tabla A, no reglamentario]);
- alumbrado de portal y espacios comunes, [S] m² × 8 W/m²;
- alumbrado de escalera, [S] m² × 4 W/m² (estimación de la Guía BT-10 con valores de fluorescencia, tomada como cota del alumbrado LED; criterio de proyecto);
- otros servicios: [lista], [P] kW.
P2 = [P2] W.»

---

## Bloque D — Locales comerciales y oficinas (ITC-BT-10 ap. 3.3 y 4.1) — punto 4 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| D.1 | 100 W/m², 3 450 W, simultaneidad 1 | VERIFICADO | Igual en el ap. 3.3 (edificio de viviendas) y en el 4.1 (edificio comercial o de oficinas) | 3.3 y 4.1: «Se calculará considerando un mínimo de 100 W por metro cuadrado y planta, con un mínimo por local de 3450 W a 230 V y coeficiente de simultaneidad 1.» | [REBT] p. 99 |
| D.2 | Son mínimos; manda la demanda | VERIFICADO | Ap. 4: la demanda real manda, con suelo en 100 W/m² y 3 450 W por local | 4: «En general, la demanda de potencia determinará la carga a prever en estos casos que no podrá ser nunca inferior a los siguientes valores.» | [REBT] p. 99 |
| D.3 | Ejemplo de la Guía (tabla B) | LEÍDO (Guía) + comprobado | **P_local = máx(previsión real; 100 · S; 3 450)**. Local 1: 25 m², desconocida → 2 500 → **3 450**. Local 2: 50 m² → **5 000**. Oficina 1: 200 m², real 35 000 → **35 000**. Oficina 2: 150 m², real 13 500 < 15 000 → **15 000**. Total (coeficiente 1) **58 450 W** ✓ | [G10] p. 5, «Tabla B: ejemplo de previsión de cargas en locales comerciales y oficinas» | [G10] |
| D.4 | ¿Útil o construida? | **NO LO FIJA EL REGLAMENTO** + LEÍDO (Guía BT-04) | El reglamento dice «por metro cuadrado y planta», sin adjetivo. La tabla B de la Guía BT-10 dice «Superficie (m²)». El **modelo de memoria técnica de diseño de la Guía BT-04** pide, para locales y oficinas, **«Superficie útil total»** y «Potencia específica prevista W/m²». Propuesta: **útil** (K-REBT.8). El repo ya guarda la útil de cada zona | [G04] p. 5 (imagen): «LOCALES COMERCIALES Y/U OFICINAS: Superficie útil total … m² · Potencia específica prevista … W/m²» | [G04] |
| D.5 | «Por local» | INTERPRETACIÓN | El mínimo de 3 450 W es por cada local o establecimiento independiente (cada suministro), no por planta ni por zona | 3.3 | — |

**Frase de memoria:** «Locales y oficinas: [n] locales; P = máx(demanda prevista; 100 W/m² × superficie útil; 3 450 W) por local, con simultaneidad 1 (ITC-BT-10 ap. [3.3 / 4.1]): [desglose] = [P3] W. Superficie útil, según el modelo de memoria técnica de diseño de la Guía BT-04.»

---

## Bloque E — Garajes (ITC-BT-10 ap. 3.4) y control de humo (DB-SI, SI 3 ap. 8) — punto 5 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| E.1 | 10 / 20 W/m², mínimo 3 450 W | VERIFICADO | 10 W/m² y planta con ventilación natural; 20 W/m² con forzada; mínimo 3 450 W; simultaneidad 1 | 3.4: «Se calculará considerando un mínimo de 10 W por metro cuadrado y planta para garajes de ventilación natural y de 20 W para los de ventilación forzada, con un mínimo de 3450 W a 230 V y coeficiente de simultaneidad 1.» | [REBT] p. 99 |
| E.2 | Humo de incendio → estudio específico | VERIFICADO | — | «Cuando en aplicación de la NBE-CPI-96 sea necesario un sistema de ventilación forzada para la evacuación de humos de incendio, se estudiará de forma específica la previsión de cargas de los garajes.» | [REBT] p. 99 |
| E.3 | Comentario de la Guía | LEÍDO (Guía) | «Para efectuar la previsión de cargas en lo correspondiente a garajes se tendrá en cuenta lo que indiquen los reglamentos y normas de protección contra incendios» | [G10] p. 6 | — |
| E.4 | Equivalente actual de la NBE-CPI-96 | VERIFICADO en [SI3] B8.1 y B8.6–B8.8 (no releído) + INTERPRETACIÓN | DB-SI, **SI 3 ap. 8**: control de humo obligatorio en las «zonas de uso Aparcamiento que no tengan la consideración de aparcamiento abierto». Se admite la ventilación de HS 3; si es **mecánica**: extraer **150 l/plaza·s** (aportación ≤ 120), activación automática por **detección**, ventiladores **F₃₀₀ 60**, conductos E₃₀₀ 60 o EI 60. La ventilación **natural** conforme a HS 3 vale sin esas condiciones ([SI3] B8.7). El «uso Aparcamiento» del DB-SI excluye el garaje de ≤ 100 m² construidos y el de la vivienda unifamiliar ([SI3] B8.4). **Equivalencia:** el «sistema de ventilación forzada para la evacuación de humos de incendio» de la ITC-BT-10 es hoy el **garaje de uso Aparcamiento, no abierto, con control de humo mecánico** | SI 3 ap. 8 pto 1 a) y pto 2 | [SI3] |
| E.5 | Qué hacer en ese caso | CRITERIO | El 20 W/m² deja de ser suficiente por sí solo («se estudiará de forma específica»). Propuesta: **P4 = máx(20 W/m² · S; 3 450 W; potencia declarada de los ventiladores de extracción, que se dimensionan para 150 l/plaza·s, + alumbrado + resto)**, con aviso. Ver K-REBT.10 | — | — |
| E.6 | Edificio de oficinas con garaje | **NO LO FIJA EL REGLAMENTO → CRITERIO** | El ap. 4 no da ratio de garaje. El ap. 3.4 es el único reglamentario: se aplica **por analogía**, rotulado | ap. 4 | [REBT] p. 99 |
| E.7 | Proyecto y pública concurrencia | VERIFICADO (texto) | La ITC-BT-28 ap. 1 cuenta como local de pública concurrencia, «cualquiera que sea su ocupación», el estacionamiento cerrado y cubierto para más de 5 vehículos. Su ap. 3.3.1 d) exige en él alumbrado de seguridad | ITC-BT-28 ap. 1 y 3.3.1 d) | [REBT] (texto) |

**Frase de memoria:** «Garaje de [S] m² útiles con ventilación [natural / forzada]: P4 = máx([10 / 20] W/m² × S; 3 450 W) = [P4] W, con simultaneidad 1 (ITC-BT-10 ap. 3.4).» Con control de humo mecánico: «El garaje es de uso Aparcamiento no abierto y controla el humo de incendio con ventilación mecánica (DB-SI, SI 3 ap. 8). Por ello la previsión se estudia de forma específica (ITC-BT-10 ap. 3.4): [ventiladores de extracción, P kW, + alumbrado …] = [P4] W, no inferior a 20 W/m².»

---

## Bloque F — Recarga del vehículo eléctrico (ITC-BT-10 ap. 5; ITC-BT-52 ap. 3 y 4; DB-HE, HE 6) — punto 6 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| F.1 | Ámbito del ap. 5 | VERIFICADO | El título lo restringe a «viviendas de nueva construcción» | «5. CARGA CORRESPONDIENTE A LAS ZONAS DE ESTACIONAMIENTO CON INFRAESTRUCTURA PARA LA RECARGA DE LOS VEHÍCULOS ELÉCTRICOS EN VIVIENDAS DE NUEVA CONSTRUCCIÓN.» | [REBT] p. 99 |
| F.2 | 5.1 Unifamiliar | VERIFICADO | → **elevada** | «Para la previsión de cargas de viviendas unifamiliares dotadas de infraestructura para la recarga de vehículos eléctricos se considerará grado de electrificación elevado.» | [REBT] p. 100 |
| F.3 | ¿C13 obligatorio en toda unifamiliar nueva? | VERIFICADO | **Sí**, si dispone «de aparcamiento **o zona prevista**». Esquema 4a. La Guía añade que debe quedar **totalmente instalado**: canalización, cables, protecciones **y el punto de recarga** | ITC-BT-52 3.1: «En las viviendas unifamiliares nuevas que dispongan de aparcamiento o zona prevista para poder albergar un vehículo eléctrico se instalará un circuito exclusivo para la recarga de vehículo eléctrico. Este circuito se denominará circuito C13, según la nomenclatura de la (ITC) BT-25 y seguirá el esquema de instalación 4a.» · [G52] p. 24 (texto): «En todas las viviendas unifamiliares nuevas el circuito C13 debe quedar totalmente instalando incluyendo los sistemas de canalización, los cables, las protecciones y el punto de recarga.» | [REBT] p. 279; [G52] |
| F.4 | Potencias del C13 (unifamiliar) | VERIFICADO | Tabla 1 de la ITC-BT-52: a 230 V, 10 A 2 300 W, 16 A 3 680 W, 20 A 4 600 W, 32 A 7 360 W, 40 A 9 200 W (1 estación cada uno); a 230/400 V, 16 A 11 085 W (1–3 estaciones), 20 A 13 856 W (1–4), 32 A 22 170 W (1–6), 40 A 27 713 W (1–8). «… los circuitos C13 monofásicos no dispondrán de una potencia instalada superior a los 9.200 W.» La Guía añade: en la unifamiliar con esquema 4a, la previsión de la vivienda **incluye** la recarga, «con una previsión mínima de 9200 W por vivienda» | [REBT] p. 279; [G52] p. 29 | — |
| F.5 | C13 en propiedad horizontal | VERIFICADO | En los aparcamientos colectivos en propiedad horizontal, el C13 «quedará sustituido» por los esquemas de la ITC-BT-52 en zonas comunes. **La recarga no hace elevada a la vivienda de un plurifamiliar** (el ap. 5.1 solo habla de unifamiliares). Guía, esquema 2: «No resulta necesario prever un grado de electrificación elevado para las viviendas en todos los casos …» | ITC-BT-25 2.3.2, último párrafo | [REBT] p. 168; [G52] p. 29 |
| F.6 | Factores 0,3 / 1,0 | VERIFICADO + **CORREGIDO respecto a la Guía** | **4.1 colectivo (1a, 1b, 1c):** el SPL es **opcional** («a criterio del promotor» en obra nueva); **0,3 con SPL, 1,0 sin SPL**. **4.2 individual (2, 3a, 3b): 1,0.** **4.3 esquema 4 (4a, 4b): 1,0.** La Guía (p. 43) admite el SPL en el 4b y le aplica el caso general (0,3); el reglamento dice 1,0. **Manda el reglamento** | 4.1: «… considerando un factor de simultaneidad de las cargas del vehículo eléctrico con el resto de la instalación igual a 0,3 cuando se instale el SPL y de 1,0 cuando no se instale.» Fórmulas: «Pedificio = (P1 + P2 + P3 + P4 ) + 0,3 · P5 (se instala el SPL)»; «Pedificio = (P1 + P2 + P3 + P4 ) + P5 (no se instala el SPL)». 4.2: «… igual a 1,0.» 4.3: «… con el resto de circuitos de la instalación igual a 1,0.» | [REBT] p. 281; [G52] p. 43 |
| F.7 | 5.2: 3 680 W × 10 % × factor | VERIFICADO | **P5 = 3 680 W × 0,10 × plazas construidas**; después, × factor (F.6). El proyectista puede prever más. Título: solo aparcamientos colectivos **en régimen de propiedad horizontal** | 5.2: «La previsión de cargas para la carga del vehículo eléctrico se calculará multiplicando 3.680 W, por el 10 % del total de las plazas de aparcamiento construidas. La suma de todas estas potencias se multiplicará por el factor de simultaneidad que corresponda y su sumará con la previsión de potencia del resto de la instalación del edificio, en función del esquema de la instalación y de la disponibilidad de un sistema protección de la línea general de alimentación, tal y como se establece en la (ITC) BT-52. No obstante el proyectista de la instalación podrá prever una potencia instalada mayor cuando disponga de los datos que lo justifiquen.» (dos erratas: «su sumará», «sistema protección») | [REBT] p. 100 |
| F.8 | ¿Se redondea el 10 %? | **NO LO FIJA EL REGLAMENTO** + LEÍDO (Guía) | El reglamento multiplica, no habla de plazas enteras. La Guía lo escribe como fórmula continua: **«P5 mínimo = 0,1 · Nº plazas · 3,68 kW»**. Propuesta: **no redondear** (25 plazas → 2,5 × 3 680 = 9 200 W). Ver K-REBT.12 | [G52] p. 28 | [G52] |
| F.9 | El 10 % es el mínimo reglamentario | LEÍDO (Guía) | «Este porcentaje sobre el total de plazas del 10% para la previsión de cargas debe considerarse como valor mínimo reglamentario» | [G52] p. 42 | — |
| F.10 | Anexo 2: PVE = FS1·N·3 680 W | LEÍDO (Guía) | **«PVE = FS1 · P5 = FS1 · N · 3680 W (2)»**. «N, número de plazas de garaje en las que se realiza la preinstalación»; «FS1, factor de simultaneidad cuyo valor depende de si se prevé o no el SPL (0,3 si se prevé y 1 si no se prevé)». Vale para los esquemas 1a, 1b, 1c y 4b (caso general). En el **esquema 2 o 4a**, la recarga entra en P1 por vivienda: período diurno «Pvivienda(con VE) = Pvivienda(sin VE) + (0,3) · 3680 W»; período nocturno «P1(nocturno) = 0,5 · CS · Pvivienda(sin VE) + N · 3680 W»; se toma el mayor. En los **esquemas 3a y 3b**: PVE = N · 3 680 W | [G52] pp. 42–45 | — |
| F.11 | ¿Cuándo se aplica el Anexo 2? | LEÍDO (Guía) + INTERPRETACIÓN | La Guía lo recomienda cuando la preinstalación supera el 50 % de las plazas: «… cuando se desee realizar la preinstalación en un número de plazas, N, elevado, por encima del 50% del total de plazas de garaje construidas …» (p. 42); «… se podrá seguir lo indicado en el anexo 2 …» (p. 27). El texto de p. 26 dice: «En relación con las potencias previstas, será de aplicación lo indicado en el Anexo 2» (texto). Con el **HE 6 ap. 3 pto 1** (conducción de cables al **100 %** en residencial privado), toda promoción nueva de viviendas cae en ese supuesto. **Pero el mínimo reglamentario sigue siendo el 10 %** (F.9). La diferencia es grande: con 40 plazas, el mínimo sin SPL es 14 720 W y el Anexo 2 sin SPL da 147 200 W. Ver K-REBT.12 | [G52] pp. 26–27, 42 | — |
| F.12 | El valor Y | LEÍDO (Guía) | «En el proyecto se debe indicar el punto de recarga número Y, a partir del cual será necesario instalar el SPL. El valor de Y se calculará como la parte entera del número que resulte de multiplicar 0,3 por N.» | [G52] p. 43 | — |
| F.13 | Edificios de uso no residencial (oficinas) | LEÍDO (Guía) + **CORREGIDO** (fundamento) | **«P5 mínimo = (Nº plazas / 40) · 3,68 kW»**, «conforme a la disposición adicional primera del RD 1053/2014». Desde el RD 450/2022, esa disposición solo cubre estacionamientos **no adscritos** a edificios y la vía pública ([BOE-web]). En edificios manda el **HE 6 ap. 3 pto 2**: una estación de recarga «por cada 40 plazas de aparcamiento, **o fracción**». El ap. 5.2 de la ITC-BT-10 **no alcanza** literalmente al garaje de oficinas (F.7). La Guía, p. 29, aplica ese P5 mínimo también a los esquemas 2, 3 y 4 «en edificios de uso no residencial» | [G52] pp. 28–29: «La previsión de potencia de los puntos de recarga a instalar en edificios de uso no residencial tales como los edificios de oficinas u otros de usos comerciales se calculará conforme a la disposición adicional primera del RD 1053/2014 con la siguiente fórmula: …» | [G52]; [HE22] p. 34 |
| F.14 | Preinstalación (3.2, RD 450/2022) | VERIFICADO | **a)** Conducción de cables desde la centralización por las vías principales. Al **100 %** de las plazas, llega a cada plaza; si no, se definen las plazas que cumplen la dotación y llega a ellas. **b)** Centralización dimensionada según el esquema y la ITC-BT-16, con **módulos de reserva** para al menos el 20 % de las plazas no asociadas a una vivienda, y como mínimo uno aunque todas estén asociadas | 3.2 b): «Se instalarán módulos de reserva para al menos el 20 % de las plazas de garaje no asociadas a una vivienda y, aunque todas las plazas estén asociadas a viviendas, como mínimo un módulo de reserva.» | [REBT] p. 280 |
| F.15 | HE 6 | VERIFICADO | **3 pto 1:** residencial privado, conducción de cables para el **100 %** de las plazas. **3 pto 2:** otros usos, al menos el **20 %** y **una estación por cada 40 plazas o fracción** (Administración General del Estado: 1 por cada 20; además, 1 por cada 5 plazas accesibles, que computan). **3 pto 3:** en edificios mixtos sin aparcamientos claramente diferenciados, el uso característico. **Excluidos (1 pto 2 a):** edificios de uso distinto del residencial privado con **10 plazas o menos** | HE 6 ap. 1 y 3 | [HE22] pp. 33–34 |
| F.16 | ¿Qué esquema y SPL por defecto? | **NO LO FIJA EL REGLAMENTO → CRITERIO** | **Factor 1,0** («sin SPL»): es el valor de los esquemas 1 sin SPL, 2, 3 y 4, así que vale **sea cual sea el esquema** que se elija después. 0,3 solo si el usuario declara esquema 1a, 1b o 1c **con SPL**. Ver K-REBT.12 | — | — |

**Ejemplos (para los tests):**
- 40 plazas en propiedad horizontal: P5 = 0,1 · 40 · 3 680 = **14 720 W**. Con SPL (esquema 1): 0,3 · 14 720 = **4 416 W**. Sin SPL: **14 720 W**.
- 25 plazas: P5 = **9 200 W**, sin redondear. Redondeando a plazas enteras por exceso: 3 · 3 680 = 11 040 W.
- Anexo 2 de la Guía con N = 40 (100 %): con SPL 0,3 · 40 · 3 680 = **44 160 W**; sin SPL **147 200 W**.
- Oficinas con 50 plazas: Guía 50/40 · 3,68 = **4,6 kW**. HE 6: ⌈50/40⌉ = 2 estaciones → 2 · 3 680 = **7 360 W**.

**Frases de memoria:**
- Unifamiliar: «La vivienda unifamiliar dispone de [aparcamiento / zona prevista] para un vehículo eléctrico: se instala el circuito C13, esquema 4a (ITC-BT-52 ap. 3.1), y se considera electrificación elevada (ITC-BT-10 ap. 5.1). Potencia prevista [P] W, no inferior a 9 200 W, que incluye la recarga.»
- Plurifamiliar: «Recarga del vehículo eléctrico: P5 = 3 680 W × 10 % de [N] plazas construidas = [P5] W (ITC-BT-10 ap. 5.2). Factor de simultaneidad con el resto del edificio [1,0, sin sistema de protección de la línea general de alimentación (SPL), válido para cualquier esquema de la ITC-BT-52 / 0,3, esquema colectivo con SPL] (ITC-BT-52 ap. 4). Se suman [P] W. Preinstalación: conducción de cables al 100 % de las plazas (DB-HE, HE 6 ap. 3.1) y módulos de reserva en la centralización (ITC-BT-52 ap. 3.2 b).»

---

## Bloque G — Contadores (ITC-BT-16 ap. 2 y 3) — punto 7 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| G.1 | > 16 → local | VERIFICADO | **> 16 contadores: local obligatorio. ≤ 16: armario o local** | 2.2: «Cuando el número de contadores a instalar sea superior a 16, será obligatoria su ubicación en local, según el apartado 2.2.1 siguiente.» 2.2.2: «Si el número de contadores a centralizar es igual o inferior a 16, además de poderse instalar en un local …, la concentración podrá ubicarse en un armario destinado única y exclusivamente a este fin.» | [REBT] pp. 115–116 |
| G.2 | Qué se cuenta | VERIFICADO (literal) + INTERPRETACIÓN | Los contadores «de cada uno de los usuarios y de los servicios generales del edificio»: **viviendas + locales u oficinas (uno por suministro) + servicios generales**. Más, según el esquema de recarga: los **contadores principales** de los esquemas 1a, 1b, 1c, 2, 3a y 3b, que van «en el propio local o armario» de la concentración (ITC-BT-52 ap. 5), y los **módulos de reserva** de la ITC-BT-52 3.2 b) (F.14). El REBT no dice si los módulos de reserva cuentan para el umbral de 16 → CRITERIO K-REBT.13 | 2.2: «Los contadores y demás dispositivos para la medida de la energía eléctrica de cada uno de los usuarios y de los servicios generales del edificio, podrán concentrarse en uno o varios lugares …» | [REBT] p. 115; p. 281 |
| G.3 | Un solo usuario | VERIFICADO | Colocación individual (caja de protección y medida) solo para un usuario, o dos alimentados desde el mismo lugar | 2.1: «Esta disposición se utilizará sólo cuando se trate de un suministro a un único usuario independiente o a dos usuarios alimentados desde un mismo lugar.» | [REBT] p. 114 |
| G.4 | Planta | VERIFICADO | Edificios de hasta 12 plantas: planta baja, entresuelo o primer sótano. Más de 12: concentración por plantas intermedias, de 6 o más plantas cada una. Concentración por plantas si cada una tiene más de 16 contadores | 2.2 | [REBT] p. 115 |
| G.5 | Condiciones del local que chocan con «El edificio» | VERIFICADO | El local: (a) está «dedicado única y exclusivamente a este fin», aunque puede albergar el equipo de comunicación de la compañía y el **cuadro general de mando y protección de los servicios comunes**; (b) «nunca podrá coincidir con el de otros servicios tales como cuarto de calderas, concentración de contadores de agua, gas, telecomunicaciones, maquinaria de ascensores o de otros como almacén, cuarto trastero, de basuras, etc.»; (c) «no servirá nunca de paso ni de acceso a otros locales»; (d) está en planta baja, entresuelo o primer sótano, cerca de la entrada; (e) sumideros si la cota del suelo es ≤ la de los locales colindantes; (f) altura mínima 2,30 m; anchura en las paredes con contadores ≥ 1,50 m; 1,10 m libres enfrente; 0,20 m a los lados; (g) puerta de 0,70 × 2 m que abre hacia fuera; (h) alumbrado de emergencia de 1 h y 5 lux; extintor de eficacia 21B fuera, junto a la puerta | 2.2.1 | [REBT] pp. 115–116 |
| G.6 | Riesgo especial | VERIFICADO en [SI12] 10.6 (no releído) | El texto cita la NBE-CPI-96 (riesgo especial bajo). Hoy: DB-SI, SI 1 tabla 2.1, «Local de contadores de electricidad y de cuadros generales de distribución» → **riesgo especial bajo en todo caso** | — | [SI12] |
| G.7 | Armario | VERIFICADO | En la zona común de la entrada; pasillo de **1,5 m**; **PF 30**; ventilación e iluminación; extintor 21B; base de enchufe de 16 A | 2.2.2 | [REBT] p. 116 |
| G.8 | Interruptor general de maniobra | VERIFICADO (texto) | Obligatorio con más de dos usuarios. «El interruptor será, como mínimo, de 160 A para previsiones de carga hasta 90 kW, y de 250 A para las superiores a ésta, hasta 150 kW.» | ITC-BT-16 ap. 3 | [REBT] (texto) |
| G.9 | ¿Algo más en la Guía BT-16? | LEÍDO (Guía) | Repite el reglamento (p. 7, imagen). Comentarios útiles (texto): el local «RF90 según el artículo 19 de la NBE-CPI-96»; la puerta «RF60 como mínimo excepto cuando el paso se realice desde un vestíbulo previo, caso en que la puerta será RF30». Son de la NBE-CPI-96, derogada: **no usar** | [G16] pp. 7–8 | — |

**Frase de memoria:** «Contadores: [n_v] viviendas + [n_l] locales + 1 de servicios generales [+ n_r módulos de reserva para la recarga del vehículo eléctrico (ITC-BT-52 ap. 3.2 b)] = [N] contadores, [superior a 16: concentración en local obligatoria / no superior a 16: concentración en armario o local] (ITC-BT-16 ap. 2.2). El local está en [planta], es de uso exclusivo y no coincide con otros servicios (ITC-BT-16 ap. 2.2.1); es local de riesgo especial bajo (DB-SI, SI 1, tabla 2.1).»

---

## Bloque H — Proyecto o memoria técnica de diseño (ITC-BT-04 ap. 3 y 4) — punto 8 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| H.1 | Grupo e | VERIFICADO | **P > 100 kW por caja general de protección** | «Las de edificios destinados principalmente a viviendas, locales comerciales y oficinas, que no tengan la consideración de locales de pública concurrencia, en edificación vertical u horizontal.» · «P > 100 kW por caja gral. de protección.» | [REBT] p. 52 |
| H.2 | Grupo f | VERIFICADO | Viviendas unifamiliares, **P > 50 kW** | «Las correspondientes a viviendas unifamiliares.» · «P > 50 kW.» | [REBT] p. 52 |
| H.3 | Grupos g y h | VERIFICADO + **CORREGIDO** (redacción) | Dice «**aparcamientos o estacionamientos**», no «garajes» (la Guía BT-04 de 2003 aún dice garajes). g: los que requieren ventilación forzada, «Cualquiera que sea su ocupación». h: los que disponen de ventilación natural, «De más de 5 plazas de estacionamiento» (estricto: 5 → no) | «Las de aparcamientos o estacionamientos que requieren ventilación forzada.» / «Las de aparcamientos o estacionamientos que disponen de ventilación natural.» | [REBT] p. 52 |
| H.4 | Grupo i | VERIFICADO + E.7 | Locales de pública concurrencia, sin límite. El estacionamiento cerrado y cubierto para más de 5 vehículos lo es (ITC-BT-28) | — | [REBT] p. 52 |
| H.5 | Grupo z | VERIFICADO | Tres filas: «Las correspondientes a las infraestructuras para la recarga del vehículo eléctrico.» **P > 50 kW** · «Instalaciones de recarga situadas en el exterior.» **P > 10 kW** · «Todas las instalaciones que incluyan estaciones de recarga previstas para el modo de carga 4.» **Sin límite** | Tabla de 3.1 | [REBT] p. 53 |
| H.6 | Qué es P | VERIFICADO | «[P = Potencia prevista en la instalación, teniendo en cuenta lo estipulado en la (ITC) BT-10].» Para el grupo z, INTERPRETACIÓN: P5 **sin** el factor de simultaneidad con el resto del edificio, porque ese factor no reduce la potencia de la propia instalación de recarga. Con el 10 %: P5 > 50 kW ⇔ **plazas ≥ 136** | — | [REBT] p. 53 |
| H.7 | Recarga en aparcamientos existentes | VERIFICADO | «No será necesaria la elaboración de proyecto para las instalaciones de recarga que se ejecuten en los grupos de instalación g) y h) existentes en edificios de viviendas, siempre que las nuevas instalaciones no estén incluidas en el grupo z).» (no aplica a obra nueva) | — | [REBT] p. 53 |
| H.8 | 3.3 | VERIFICADO | «Si una instalación está comprendida en más de un grupo de los especificados en 3.1, se le aplicará el criterio más exigente de los establecidos para dichos grupos.» | — | [REBT] p. 53 |
| H.9 | ¿El grupo g o h obliga a proyectar todo el edificio? | **NO LO FIJA EL REGLAMENTO → INTERPRETACIÓN** | El grupo g o h define como «instalación» la **del aparcamiento**. El 3.3 resuelve una instalación que cae en dos grupos, no extiende la exigencia al resto del edificio. Por otro lado, el ap. 2.1 permite el proyecto «bien como parte del proyecto general del edificio, bien en forma de uno o varios proyectos específicos». Lectura propuesta: **el aparcamiento requiere proyecto**; las viviendas y los servicios, según el grupo e. La Guía BT-04 no comenta este caso (texto pp. 8–11). En la práctica, muchas comunidades autónomas tramitan un único proyecto del edificio: avisarlo | ap. 2.1 y 3.3 | [REBT] pp. 51–53 |
| H.10 | Resto | VERIFICADO | «Requerirán Memoria Técnica de Diseño todas las instalaciones sean nuevas, ampliaciones o modificaciones no incluidas en los grupos indicados en el apartado 3.» | ap. 4 | [REBT] p. 53 |

**Frase de memoria:** «Documentación (ITC-BT-04 ap. 3.1 y 4):
- edificio de viviendas con una previsión de [P] kW por caja general de protección, [superior / no superior] a 100 kW (grupo e);
- aparcamiento con ventilación [forzada (grupo g, sin límite) / natural de N plazas (grupo h, más de 5)];
- infraestructura de recarga de [P5] kW (grupo z, más de 50 kW).
La instalación [del aparcamiento] requiere proyecto; el resto, [proyecto / memoria técnica de diseño].»

---

## Bloque I — Reserva de local para centro de transformación — punto 9 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita / fuente |
|---|---|---|---|---|
| I.1 | RD 1955/2000, arts. 45 a 47 | LEÍDO (web) + **CORREGIDO** | En el consolidado de boe.es (actualizado a 12-02-2026), los arts. 44, 45 y 47 constan «(Derogado)»: «Se deroga por la disposición derogatoria única del Real Decreto 1048/2013, de 27 de diciembre. Ref. BOE-A-2013-13767». El art. 46 sigue vigente. **Ya no se puede citar el RD 1955/2000 para la reserva de local** | [BOE-web] BOE-A-2000-24019 |
| I.2 | Dónde está hoy | **VERIFICADO** (2026-10-05) + **CORREGIDO** (matiz) | **RD 1048/2013, art. 26 «Reserva de uso de locales»**, ap. 1: «Cuando se trate de suministros sobre suelos en situación básica de urbanizados por contar con las infraestructuras y los servicios a que se refiere el artículo 12.3.b del texto refundido de la Ley de Suelo, aprobado por Real Decreto Legislativo 2/2008, de 20 de junio, incluidos los suministros de alumbrado público, y la potencia solicitada para un local, edificio o agrupación de éstos sea superior a 100 kW, o cuando la potencia solicitada de un nuevo suministro o ampliación de uno existente sea superior a esa cifra, **el solicitante deberá reservar un local**, para su posterior uso por la empresa distribuidora, de acuerdo con las condiciones técnicas reglamentarias y con las normas técnicas establecidas por la empresa distribuidora y aprobadas por la Administración Pública competente, cerrado y adaptado, con fácil acceso desde la vía pública, para la ubicación de un centro de transformación cuya situación corresponda a las características de la red de suministro aérea o subterránea y destinado exclusivamente a la finalidad prevista. El propietario del local quedará obligado a registrar esta cesión de uso, corriendo los gastos correspondientes a cargo de la empresa distribuidora.» Ap. 2: «Si el local no fuera utilizado por la empresa distribuidora transcurridos seis meses desde la puesta a su disposición por el propietario, desaparecerá la obligación de cesión a que se refiere el apartado anterior.» **Matiz corregido:** es una obligación del solicitante («deberá reservar»), no algo que la distribuidora «puede exigir». El umbral es la **potencia solicitada**, no la previsión de cargas, aunque en la práctica suele ser la misma | [RD1048] pp. 32–33 (imagen, 150 ppp) |
| I.3 | Vigencia | **VERIFICADO** | El consolidado lleva «Última modificación: 03 de noviembre de 2016» y, tras el art. 26, una sola nota: «Téngase en cuenta que se declara la inconstitucionalidad y nulidad del inciso destacado del apartado 3 por Sentencia del TC 120/2016, de 23 de junio. Ref. BOE-A-2016-7297.» El inciso nulo es la compensación «que se establecerá por orden del Ministro de Industria, Energía y Turismo, previo acuerdo de la Comisión Delegada…». Los ap. 1 y 2 están intactos y **ninguna norma posterior a 2016 ha tocado el artículo** (descartado el RD 1183/2020) | [RD1048] pp. 3 (texto) y 33 (imagen) |
| I.4 | Remisión del REBT | VERIFICADO (texto) | Art. 13 «Reserva de local»: «En lo relativo a la reserva de local se seguirán las prescripciones recogidas en la reglamentación por la que se regulen las actividades de transporte, distribución, comercialización, suministro y procedimientos de autorización de instalaciones de energía eléctrica.» Art. 12: los titulares facilitan a la suministradora la información de cargas «a fin de poder adecuar … las previsiones de cargas en sus centros de transformación» | [REBT] p. 12 (texto) |
| I.5 | Suministro en baja tensión > 50 kW | LEÍDO (web) | RD 1955/2000 art. 46 (vigente): baja tensión hasta 1 kV, «no pudiéndose atender suministros con potencia superiores a 50 kW, salvo acuerdo con la empresa distribuidora». Literal sin cotejar | [BOE-web] |

**Frase de memoria (aviso, no veredicto):** «Al superar 100 kW, en suelo urbanizado el solicitante reservará a la empresa distribuidora un local cerrado y adaptado, con fácil acceso desde la vía pública, para centro de transformación (art. 13 del REBT; RD 1048/2013, art. 26.1); la obligación decae si la distribuidora no lo usa en seis meses (art. 26.2). Se coordinará con ella.» Sigue siendo un aviso: la app no sabe si el suelo es urbanizado ni la potencia que se solicitará.

---

## Bloque J — Intensidad de la línea general de alimentación — punto 10 del encargo

| # | Afirmación | Veredicto | Valor | Fuente |
|---|---|---|---|---|
| J.1 | ¿Fórmula en el reglamento? | **NO LO FIJA EL REGLAMENTO** | La ITC-BT-14 ap. 3 solo dice que la intensidad máxima admisible es la de la UNE 20.460-5-523 «de acuerdo con la previsión de potencias establecidas en la ITC-BT-10». Caída de tensión máxima: **0,5 %** con contadores totalmente centralizados y **1 %** con centralizaciones parciales. Sección mínima 10 mm² Cu o 16 mm² Al. No da fórmula de intensidad ni cos φ | [REBT] ITC-BT-14 (texto) |
| J.2 | ¿Fórmula en la Guía BT-14? | **NO** (lo leído) | La Guía remite a otro documento: «El método de cálculo de la caída de tensión se indica en el Anexo 2 de esta Unidad Temática». Ese anexo (`guia_bt_anexo_2_sep03R1.pdf`) se descargó pero **no se ha podido leer** (no se pudo renderizar). No hay cos φ en las pp. 4–9 | [G14] p. 8 (texto) |
| J.3 | cos φ en otras guías | LEÍDO (Guía, texto) | La Guía BT-25 calcula las longitudes máximas de los circuitos interiores con «cosϕ = 1» | [G25] p. 10 (texto) |
| J.4 | Propuesta | **CRITERIO** | **I = P / (√3 · 400 · cos φ)**, con **cos φ = 0,9** (da un 11 % más de intensidad que con 1). Unifamiliar monofásica: I = P / 230. Ejemplo: 70 544 W → **113,1 A** con 0,9 (101,8 A con 1). Rotular «criterio de cálculo; el REBT no fija el factor de potencia». Ver K-REBT.15 | — |

**Frase de memoria:** «Intensidad de cálculo de la línea general de alimentación: I = P / (√3 · 400 V · 0,9) = [I] A (factor de potencia 0,9, criterio de cálculo; el REBT no lo fija). La sección se comprobará con la UNE 20.460-5-523 y la caída de tensión máxima del [0,5 / 1] % (ITC-BT-14 ap. 3).»

---

## Bloque K — Clasificación del lugar de consumo (ap. 1, 3 y 4) — punto 11 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| K.1 | Lista | VERIFICADO | «– Edificios destinados principalmente a viviendas. – Edificios comerciales o de oficinas. – Edificios destinados a una industria específica. – Edificios destinados a una concentración de industrias. – Aparcamientos o estacionamientos dotados de infraestructura para la recarga de los vehículos eléctricos.» | ap. 1 | [REBT] p. 98 |
| K.2 | El ap. 3 ya es mixto | VERIFICADO | El edificio «principalmente» de viviendas incluye los locales comerciales y los garajes «que forman parte del mismo». El ap. 3 dice «preferentemente» en el título y «principalmente» en el cuerpo | 3: «La carga total correspondiente a un edificio destinado principalmente a viviendas resulta de la suma de la carga correspondiente al conjunto de viviendas, de los servicios generales del edificio, de la correspondiente a los locales comerciales y de los garajes que forman parte del mismo.» | [REBT] p. 98 |
| K.3 | ¿Cómo se clasifica un mixto? | **NO LO FIJA EL REGLAMENTO → CRITERIO** | No define «principalmente». **En la práctica la clasificación cambia poco:** locales y oficinas tienen el mismo ratio en 3.3 y en 4.1. Lo que cambia: (a) los servicios generales y el garaje solo tienen apartado en el 3; (b) el ap. 5.2 (recarga) solo vale en residencial. Propuesta: **si hay viviendas → ap. 3** (suma viviendas + servicios generales + locales u oficinas + garaje + recarga). Sin viviendas → ap. 4, sumando por analogía servicios generales y garaje (E.6) y la recarga según HE 6 o la Guía (F.13). La ITC-BT-16 2.2 apoya la lectura: «edificios destinados a viviendas y locales comerciales». Ver K-REBT.14 | — | — |
| K.4 | Coherencia con HE 5 y HE 6 | INTERPRETACIÓN | Esta clasificación es solo eléctrica. Para el VE, el HE 6 ap. 3 pto 3 manda el uso característico solo si las zonas de aparcamiento no están diferenciadas | [HE22] p. 34 | — |

**Frase de memoria:** «El edificio se destina principalmente a viviendas, con [locales / oficinas] y garaje que forman parte de él: su carga total es la suma de viviendas, servicios generales, locales y garaje (ITC-BT-10 ap. 1 y 3).» Sin viviendas: «Edificio de oficinas: la demanda de potencia determina la carga, que no será inferior a 100 W/m² con un mínimo de 3 450 W por local (ITC-BT-10 ap. 4.1). Servicios generales y garaje se añaden por analogía con los ap. 3.2 y 3.4 (criterio de proyecto).»

---

## Bloque L — Edición y cita (incluye el índice desactualizado) — punto 12 del encargo

| # | Afirmación | Veredicto | Valor | Fuente |
|---|---|---|---|---|
| L.1 | Última modificación | VERIFICADO (texto) | «Última modificación: 03 de septiembre de 2025». Es el RD 770/2025, que solo toca la ITC-BT-03 ([BOE-web]) | [REBT] p. 5 |
| L.2 | Índice de la ITC-BT-10 sin actualizar | VERIFICADO | El índice (p. 97) termina en «5. PREVISIÓN DE CARGAS» y «6. SUMINISTROS MONOFÁSICOS», y en el ap. 1 no tiene el lugar de consumo nuevo. El cuerpo (pp. 99–100) tiene **5** recarga del vehículo eléctrico (5.1 y 5.2), **6** previsión de cargas y **7** suministros monofásicos. **Citar por el cuerpo.** El ap. 6 dice además «capítulos 2, 3, 4 y 5» (la Guía BT-10, de 2003, decía «2,3 y 4») | [REBT] pp. 97, 99–100; [G10] p. 6 |
| L.3 | Qué disposición tocó cada ITC | LEÍDO (web) | Ver el apartado 0 | [BOE-web] |
| L.4 | Cita en la ficha | — | «REBT (RD 842/2002), ITC-BT-xx ap. y, consolidado BOE-A-2002-18099, últ. modif. 03-09-2025.» Las guías, siempre «(Guía técnica de aplicación, Ministerio, ed. …; no reglamentaria)» | — |

---

## Bloque M — Revisión del módulo existente (`src/modules/rebt/`)

Lo verificado coincide con `tablas.ts`:
- grado (5 750 / 9 200 / > 160 / IGA 25);
- tabla C;
- tabla 1 con las erratas corregidas;
- tabla A y alumbrado;
- 100 W/m² y 3 450 W;
- 10 / 20 W/m² y 3 450 W;
- 3 680 W, 10 %, 0,3 / 1,0;
- 16 contadores y 12 plantas;
- umbrales de la ITC-BT-04.

Diferencias o huecos (para `motor-calculo`; no se ha tocado código):

| # | Dónde | Qué | Propuesta | Base |
|---|---|---|---|---|
| M.1 | `justificacion.ts`, `trifasica = !unifamiliar \|\| total_W > G.elevada_W` | Hace trifásica la unifamiliar por encima de **9 200 W** | Umbral **14 490 W** (ap. 7). Además, `igaDe()` devuelve ⌈P/230⌉ por encima de 14 490 W, que no es un calibre normalizado: por encima de 14 490 W, trifásico | A.13 |
| M.2 | Recarga solo si `clasificacion === "viviendas"` | El garaje de un edificio de oficinas queda sin previsión de recarga | K-REBT.11: ⌈plazas/40⌉ · 3 680 W (HE 6), salvo las exclusiones del HE 6 (≤ 10 plazas) | F.13, F.15 |
| M.3 | `conRecarga` solo con zona `garaje_privado` | La ITC-BT-52 3.1 también obliga con una «zona prevista» (plaza exterior) | Añadir la decisión «plaza o zona para vehículo en la parcela» | F.3 |
| M.4 | Contadores | No cuenta los módulos de reserva (ITC-BT-52 3.2 b) ni los contadores principales de recarga de los esquemas 1, 2 y 3 | K-REBT.13 | G.2, F.14 |
| M.5 | `humo = forzada && bajoRasante` | El SI 3 ap. 8 solo obliga en «uso Aparcamiento» (> 100 m² construidos, no unifamiliar) y no abierto | Añadir la condición de > 100 m² construidos | E.4 |
| M.6 | Grupo e con `total_W` | El umbral es **por caja general de protección** | Suponer una sola CGP y decirlo («se supone una única caja general de protección») | H.1 |
| M.7 | `PROC_GUIA` sin edición | Las guías tienen ediciones distintas | BT-10 sep-03 R1; BT-25 jul-12 R2; **BT-52 sept-2024 R2**; BT-04 y BT-16 sep-03 R1 | Apartado 0 |
| M.8 | `HABITUALES_REBT.electrificacion = "elevada"` | Es un criterio de producto, no del reglamento (el mínimo reglamentario es la básica) | Mantener, rotulado según K-REBT.1 | A.6, A.14 |
| M.9 | Factor 0,3 con SPL para cualquier esquema | La ITC-BT-52 solo admite 0,3 en el esquema colectivo (1a, 1b, 1c) | Que la decisión sea «esquema colectivo con SPL», no «con SPL» a secas | F.6 |
| M.10 | Comentario de `tablas.ts`: «RD 1053/2014 (… apartados 1, 2.1.2 y 5 de la ITC-BT-10)» | 1 y 5: LEÍDO (web). 2.1.2: INTERPRETACIÓN | Dejarlo, añadiendo «ITC-BT-52 ap. 3.2 según RD 450/2022» | Apartado 0 |

---

## Decisiones de producto (lo que el reglamento no fija)

Todas son **CRITERIO** y se rotulan así en la ficha, salvo las marcadas como «Guía».

| # | Caso | Supuesto propuesto | Por qué |
|---|---|---|---|
| K-REBT.1 | Grado por defecto | **Elevada** (9 200 W, IGA 40 A) si el usuario no dice nada, rotulado «criterio: vivienda nueva con climatización eléctrica, lo habitual hoy». **Básica** solo si el usuario confirma que no hay calefacción eléctrica ni aire acondicionado, no hay más de 160 m², no hay recarga en unifamiliar y no hay electrodomésticos que pidan circuitos adicionales. En la básica, ofrecer 5 750 o 7 360 W | A.2, A.6, A.10 |
| K-REBT.2 | Aerotermia | Bomba de calor para **calefacción o refrigeración** → **elevada** («sistema de calefacción eléctrica / acondicionamiento de aire», ITC-BT-10 2.1.2). Bomba de calor **solo de ACS** → C4 «termo eléctrico», **no** fuerza la elevada. Leer la producción de HE 4 si existe | A.14 |
| K-REBT.3 | Lista de la Guía | Lista de comprobación con los 8 criterios de la Guía BT-10 y BT-25, rotulada «Guía, no reglamentaria». Que cualquiera marcado pase a elevada, salvo las excepciones de A.5 | A.4, A.5 |
| K-REBT.4 | Escalones | Potencia por vivienda ∈ {5 750, 7 360, 9 200, 11 500, 14 490} W (tabla C). Por encima de 14 490 W, **suministro trifásico** (ap. 7) | A.9, A.13 |
| K-REBT.5 | Ascensor | **ITA-3, 11,5 kW** si no hay dato, rotulado «valor típico de la Guía BT-10, tabla A (NTE-ITA); cabina de ascensor accesible». El dato del proyecto manda | C.6 |
| K-REBT.6 | Alumbrado común LED | **8 W/m²** en portal y espacios comunes; **4 W/m²** en escalera (fluorescencia de la Guía, como cota del LED) | C.3, C.4 |
| K-REBT.7 | Otros servicios generales | Grupo de presión (de HS 4), producción centralizada de ACS o calefacción (de HE 4 o el RITE), telecomunicaciones, puertas: dato del usuario, sin valor por defecto, con aviso si falta. **No** contar la ventilación ni el alumbrado del garaje (van en P4) | C.5 |
| K-REBT.8 | Superficie de locales, oficinas y garaje | **Útil** (modelo de memoria técnica de diseño de la Guía BT-04), rotulado | D.4 |
| K-REBT.9 | Local u oficina | P = máx(dato; 100 · S_útil; 3 450) **por local**. Local sin uso: 100 W/m² con el mínimo, como «previsto» | D.1–D.5 |
| K-REBT.10 | Garaje con control de humo mecánico (uso Aparcamiento > 100 m² construidos, no abierto, ventilación mecánica) | P4 = máx(20 · S; 3 450; potencia declarada de ventiladores + alumbrado + resto). Aviso: «estudio específico (ITC-BT-10 ap. 3.4; DB-SI, SI 3 ap. 8: extracción de 150 l/plaza·s)». Sin dato, 20 W/m² y aviso | E.2–E.5 |
| K-REBT.11 | Garaje en edificio sin viviendas | P4 por analogía con el ap. 3.4. Recarga: **⌈plazas/40⌉ · 3 680 W** (HE 6 ap. 3 pto 2, «o fracción»); cubre el mínimo de la Guía, plazas/40 · 3,68 kW. Factor 1,0. Sin recarga si hay ≤ 10 plazas (exclusión del HE 6) | E.6, F.13, F.15 |
| K-REBT.12 | Recarga en viviendas | **P5 = 0,1 · plazas · 3 680 W, sin redondear** (literal y Guía). **Factor 1,0 por defecto**, rotulado «sin SPL; válido para cualquier esquema de la ITC-BT-52». 0,3 solo si el usuario declara **esquema 1a, 1b o 1c con SPL**, y entonces se muestra el valor Y = ⌊0,3 · N⌋ de la Guía. Mostrar **como información** la previsión del Anexo 2 de la Guía (FS1 · N · 3 680 W con N = plazas con conducción, el 100 % por el HE 6), rotulada «recomendación de la Guía BT-52, no reglamentaria». No usarla para el veredicto | F.6–F.12, F.16 |
| K-REBT.13 | Recuento de contadores | viviendas + locales u oficinas (uno por local) + 1 de servicios generales (el garaje comunitario va dentro). Más los **módulos de reserva** de la ITC-BT-52 3.2 b): ⌈0,2 · plazas no asociadas a vivienda⌉, **mínimo 1** si hay garaje. Más los contadores principales de recarga si el usuario declara esquema 1 o 3. Contar los módulos de reserva en el umbral de 16 (del lado de exigir local) y rotularlo | G.1, G.2, F.14 |
| K-REBT.14 | Edificio mixto | Con viviendas → ap. 3 para todo. Sin viviendas → ap. 4, más servicios generales y garaje por analogía | K.3 |
| K-REBT.15 | Intensidad de la línea general de alimentación | I = P / (√3 · 400 · 0,9). Unifamiliar: I = P / 230 hasta 14 490 W | J.4 |
| K-REBT.16 | Proyecto | Grupo e: total del edificio > 100 kW, suponiendo **una** CGP (avisarlo). Grupo f: unifamiliar > 50 kW. **g:** ventilación forzada; **h:** natural con > 5 plazas. Rotular «la instalación del aparcamiento requiere proyecto; la Administración autonómica puede pedir un único proyecto del edificio». Grupo z: P5 (sin factor) > 50 kW | H.1–H.9 |
| K-REBT.17 | Reserva de local para centro de transformación | Si la previsión total > 100 kW: **aviso, no veredicto**: «en suelo urbanizado, el solicitante debe reservar un local para centro de transformación; decae a los seis meses si la distribuidora no lo usa (REBT art. 13; RD 1048/2013 art. 26.1 y 26.2)». No citar el RD 1955/2000 | I.1–I.4 |
| K-REBT.18 | Cita y edición | Como en L.4. Las guías, con su edición | Apartado 0, L |

---

## Cifras para el código

```text
# REBT — RD 842/2002, consolidado BOE-A-2002-18099, últ. modif. 03-09-2025 (imagen salvo «texto»)
BT10.basica_W                     = 5750      # ap.2.2, a 230 V, mínimo
BT10.elevada_W                    = 9200      # ap.2.2, mínimo
BT10.elevada.superficieUtil_m2    = 160       # estricto ">" (ap.2.1.2; BT-25 C7)
BT10.monofasicoMax_W              = 14490     # ap.7
BT25.igaMin_A                     = 25        # ap.2.1
BT25.tabla1.maxPuntos             = {C1: 30, C2: 20, C5: 6}   # más → C6/C7/C12 → elevada (2.3.2)
BT25.tabla1.C8_C9_maxCircuito_W   = 5750      # nota (2)
BT10.tabla1.CS[n=1..21]           = [1,2,3,3.8,4.6,5.4,6.2,7,7.8,8.5,9.2,9.9,10.6,11.3,11.9,12.5,13.1,13.7,14.3,14.8,15.3]
BT10.tabla1.CS[n>21]              = 15.3 + (n-21)*0.5
BT10.tarifaNocturna.CS            = n
BT10.P1                           = media(Pvivienda) * CS
BT10.servicios.simultaneidad      = 1
BT10.locales.W_m2                 = 100       # «por metro cuadrado y planta»
BT10.locales.minimoPorLocal_W     = 3450
BT10.garaje.natural_W_m2          = 10
BT10.garaje.forzada_W_m2          = 20
BT10.garaje.minimo_W              = 3450
BT10.VE.porPlaza_W                = 3680      # ap.5.2
BT10.VE.fraccionPlazas            = 0.10      # de las plazas construidas; sin redondeo
BT52.factor.colectivoConSPL       = 0.3       # solo esquemas 1a/1b/1c (ap.4.1)
BT52.factor.colectivoSinSPL       = 1.0
BT52.factor.individual            = 1.0       # 2, 3a, 3b (ap.4.2)
BT52.factor.esquema4              = 1.0       # 4a, 4b (ap.4.3)
BT52.C13.monofasicoMax_W          = 9200      # ap.3.1
BT52.reserva.fraccionNoAsociadas  = 0.20      # módulos de reserva; mínimo 1 (ap.3.2 b)
BT16.localSiMasDe                 = 16        # ap.2.2 (estricto)
BT16.plantasConcentracionUnica    = 12        # ap.2.2
BT16.IGM_A                        = {hasta90kW: 160, hasta150kW: 250}   # ap.3 (texto)
BT04.e.edificioPorCGP_kW          = 100       # ">"
BT04.f.unifamiliar_kW             = 50        # ">"
BT04.h.naturalMasDe_plazas        = 5         # ">"
BT04.z.recarga_kW                 = 50        # ">"; exterior 10; modo 4 sin límite

# Guías (no reglamentarias)
G10.tablaC = [[5750,25],[7360,32],[9200,40],[11500,50],[14490,63]]   # W, A
G10.tablaA = ITA-1 400kg/5p/0.63/4.5 | ITA-2 400/5/1.00/7.5 | ITA-3 630/8/1.00/11.5 | ITA-4 630/8/1.60/18.5 | ITA-5 1000/13/1.60/29.5 | ITA-6 1000/13/2.50/46.0
G10.alumbrado.portal_W_m2  = {incandescencia: 15, fluorescencia: 8}
G10.alumbrado.escalera_W_m2 = {incandescencia: 7, fluorescencia: 4}
G52.P5min.noResidencial    = plazas/40 * 3680   # W (Guía p.28)
G52.anexo2.PVE             = FS1 * N * 3680     # N = plazas con preinstalación; FS1 0,3 con SPL / 1 sin
G52.Y                      = floor(0.3 * N)

# DB-HE, HE 6 (consolidado 14-06-2022, imagen pp.33–34)
HE6.residencial.conduccion = 1.00   # 100 % de las plazas
HE6.otros.conduccion       = 0.20   # al menos
HE6.otros.estaciones       = ceil(plazas/40)    # «o fracción»; AGE: ceil(plazas/20)
HE6.otros.excluidoHasta    = 10     # plazas (≤ 10 excluido)
HE6.accesibles.estaciones  = ceil(plazasAccesibles/5)   # computan

# Criterios del producto (NO son del REBT)
crit.ascensor           = "ITA-3"   # 11,5 kW
crit.alumbradoLED       = fluorescencia (8 / 4 W/m²)
crit.superficie         = "útil"
crit.cosPhi             = 0.9 ; U = 400 V
crit.VE.factorDefecto   = 1.0
crit.VE.redondeo        = ninguno
```

---

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Grado y potencias | REBT | RD 842/2002, consolidado | 2025-09-03 | ITC-BT-10 ap. 2.1.2 y 2.2; ITC-BT-25 ap. 2.1 | — | boe.es BOE-A-2002-18099, pp. 98, 167 (imagen) |
| Coeficiente de simultaneidad | REBT | ídem | 2025-09-03 | ITC-BT-10 ap. 3.1 | Tabla 1 | ídem pp. 98–99; erratas cotejadas con Guía BT-10 p. 4 |
| Locales, garajes, servicios | REBT | ídem | 2025-09-03 | ITC-BT-10 ap. 3.2, 3.3, 3.4 y 4.1 | — | ídem p. 99 |
| Recarga del vehículo eléctrico | REBT | ídem (ap. 5 por RD 1053/2014) | 2025-09-03 | ITC-BT-10 ap. 5; ITC-BT-52 ap. 3.1, 3.2 y 4 | ITC-BT-52 Tabla 1 | ídem pp. 99–100, 279–281 |
| Contadores | REBT | ídem | 2025-09-03 | ITC-BT-16 ap. 2.1, 2.2 y 3 | — | ídem pp. 114–116 |
| Proyecto o MTD | REBT | ídem | 2025-09-03 | ITC-BT-04 ap. 3.1, 3.3 y 4 | — | ídem pp. 52–53 |
| Escalones IGA | Guía técnica ITC-BT-10 | sep-03, rev. 1 | 2003-09 | ap. 6 | Tabla C | guia_bt_10_sep03R1.pdf p. 6 (= Guía BT-25 jul-12 rev. 2, Tabla A, p. 3) |
| Ascensores, alumbrado | Guía técnica ITC-BT-10 | sep-03, rev. 1 | 2003-09 | ap. 3.2 | Tabla A | ídem p. 5 |
| P5 mínimo no residencial; Anexo 2; Y | Guía técnica ITC-BT-52 | sept-2024, rev. 2 | 2024-09 | ap. 4; Anexo 2 | — | guia_bt_52_nov17R1.pdf pp. 27–29, 42–45 |
| Dotaciones de recarga | DB-HE | 2019, consolidado 14-06-2022 | 2022-06-14 | HE 6 ap. 1 y 3 | — | DBHE.pdf pp. 33–34 |

---

## Pendientes

1. ~~**P1 — RD 1048/2013, art. 26**~~ **Hecho (2026-10-05):** literal leído en la imagen del consolidado (I.2, I.3). Sin cambios después de 2016. K-REBT.17 sigue siendo un aviso, con el texto corregido.
2. **P2 — Guía-BT-Anexo 2 (cálculo de caídas de tensión, sep-03):** descargado, sin leer. Comprobar si fija el cos φ de la línea general de alimentación (J.2).
3. ~~**P3 — UNE-EN 81-20 y UNE-EN 81-70**~~ **Hecho (2026-10-05)**, sin la UNE de pago: tabla de carga y superficie leída en el borrador CEN público y relación 630 kg ↔ 1,10 × 1,40 en el DB-SI (C.6 bis). Queda sin fuente primaria el emparejamiento de tipos de la UNE-EN 81-70 (tipo 1: 450 kg, 1,00 × 1,25; tipo 2: 630 kg, 1,10 × 1,40). No hace falta para K-REBT.5.
4. **P4 — BOE del RD 1053/2014 y del RD 450/2022:** cotejar en el PDF del BOE qué apartados reescribieron (ITC-BT-10 ap. 1, 2.1.2, 5, 6 y 7; ITC-BT-04 grupos g, h, l y z; ITC-BT-25 ap. 2.3.2; ITC-BT-52 ap. 3.2 y 5.4). Ahora se apoyan en resúmenes web.
5. **P5 — DB-HE, HE 6:** comprobar qué disposición dio la redacción actual del ap. 3 (¿RD 450/2022?). No cambia las cifras.
6. **P6 — Texto sin imagen:** ITC-BT-14, ITC-BT-16 ap. 3 (interruptor general de maniobra), ITC-BT-28 ap. 1 y 3.3.1, arts. 12–13 del REBT, Guía BT-25 pp. 5, 7 y 10 y Guía BT-52 pp. 4 y 24–26. Renderizarlos si se van a citar literalmente en la ficha.
7. **P7 — Criterios a validar por el responsable:** K-REBT.1 (elevada por defecto), K-REBT.2 (aerotermia), K-REBT.5 (ITA-3), K-REBT.8 (útil), K-REBT.12 (factor 1,0 por defecto y el Anexo 2 solo como información) y K-REBT.13 (módulos de reserva en el recuento).
