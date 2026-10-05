# Verificación normativa — DB-HE, Sección HE 6 «Dotaciones mínimas para la infraestructura de recarga de vehículos eléctricos», para el módulo HE 6 (feature-24)

**Fecha:** 2026-10-05 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** HE 6 completa (DBHE pp. 33–35), Anejo A del DB-HE (términos de la recarga), comentarios del Ministerio a HE 6 (DccHE pp. 37–39), ITC-BT-52 ap. 2, 3, 4 y 5.4, ITC-BT-10 ap. 5, DB-SUA (SUA 9 ap. 1.2.3 y Anejo A), DB-SI (Anejo SI A, «Uso Aparcamiento»), Guía BT-52 y el BOE del RD 450/2022. Puntos 1 a 9 del encargo, en ese orden. Amplía el bloque F de `research/verificacion-rebt.md`; donde se separa de él, se dice.

**Regla aplicada:** VERIFICADO solo si el literal se ha leído en la **imagen** de la página. No se han podido renderizar páginas nuevas en esta sesión (sin Python ni `pdftoppm` en el entorno del agente). Se han usado las imágenes PNG ya renderizadas en sesiones anteriores a 200 ppp: DBHE pp. 33, 34, 39, 40, 43 y 44; DccHE p. 37; REBT pp. 267, 272, 279, 280 y 281; DBSUA pp. 32 y 37; DBSI p. 50. El resto se ha leído en el texto extraído de los mismos PDF y se marca «(texto)». Veredictos:
- **VERIFICADO**: literal del DB o del reglamento, leído en la imagen.
- **LEÍDO (comentario)** / **LEÍDO (Guía)**: literal de un documento no reglamentario del Ministerio. Se puede mostrar, rotulado como tal.
- **LEÍDO (web)**: leído en boe.es mediante una consulta resumida, no en la imagen. Cotejarlo antes de citar el literal.
- **CORREGIDO**: lo que dice el encargo, o una fuente previa del repo, no coincide con la fuente.
- **INTERPRETACIÓN**: se sigue del DB, pero el DB no lo escribe tal cual.
- **NO LO FIJA EL DB → CRITERIO**: decisión de producto. No es exigencia del CTE y la ficha la rotula así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [HE22] | CTE DB-HE «Ahorro de energía», consolidado | 14-06-2022. p. 2: RD 314/2006 … RD 732/2019 (BOE 27/12/2019); **RD 450/2022 (BOE 15/06/2022)**; corrección de errores del RD 450/2022 (BOE 02/02/2023) | `research/pdf/DBHE.pdf` | Imagen: pp. 33, 34 (HE 6), 39, 40, 43, 44 (Anejo A). Texto: p. 2 y p. 35 |
| [DccHE] | DB-HE con comentarios del Ministerio | Articulado 14-06-2022; comentarios 22-12-2023 | `research/pdf/DccHE.pdf` | Imagen: p. 37. Texto: pp. 38–39 y 44–45 |
| [Guía-HE] | Guía de aplicación DB-HE 2019 | Sin fecha; cabecera «DBHE2019» | `research/pdf/Guia_aplicacion_DBHE2019.pdf` | Texto completo: **no menciona HE 6 ni la recarga** (búsqueda sin resultados) |
| [REBT] | RD 842/2002, REBT, consolidado BOE-A-2002-18099 | Últ. modif. 03-09-2025 | `research/pdf/REBT.pdf` | Imagen: pp. 267, 272, 279, 280, 281. Texto: pp. 268, 273–278, 283–284 |
| [G52] | Guía técnica de aplicación ITC-BT-52 | **Ed. septiembre 2024, rev. 2** (el fichero dice «nov17R1») | `research/pdf/guia_bt_52_nov17R1.pdf` | Texto: pp. 4, 11–29, 33–34. Imagen (sesión REBT): pp. 27–30, 42–45 |
| [SUA] | CTE DB-SUA, consolidado | El del repo | `research/pdf/DBSUA.pdf` | Imagen: pp. 32 (SUA 9 ap. 1.2.3) y 37 (Anejo A) |
| [SI] | CTE DB-SI, consolidado | El del repo | `research/pdf/DBSI.pdf` | Imagen: p. 50 (Anejo SI A, «Uso Aparcamiento») |
| [RD450] | RD 450/2022, de 14 de junio, modifica el CTE | BOE-A-2022-9848, BOE 15-06-2022 | boe.es (`doc.php` y `txt.php`) | LEÍDO (web) |
| [CE450] | Corrección de errores del RD 450/2022 | BOE-A-2023-2722, BOE 02-02-2023 | boe.es (`txt.php`) | LEÍDO (web) |
| [REPO] | `src/modules/rebt/{tablas,justificacion}.ts`; `src/modules/sua9/tablas.ts`; `src/lib/edificio/tipos.ts` | Estado actual (rebt sin commit) | repo | Revisión en el bloque I |

Avisos de las propias fuentes:
- [HE22] p. 2: «Este texto consolidado no tiene valor jurídico.»
- [DccHE]: los comentarios «tienen un carácter orientativo e informativo no teniendo carácter reglamentario».
- **[DccHE] tiene un solo comentario en todo HE 6** (p. 38, texto): remite al Anejo A del DB-SUA para la accesibilidad de los puntos de recarga. **No hay comentarios sobre el ámbito, las exclusiones, el redondeo ni la forma de contar plazas.** La p. 37 (imagen) no tiene ningún comentario.

**Correcciones al encargo (resumen; el detalle va en cada bloque):**
1. **El HE 6 lo crea el RD 450/2022**, no el RD 732/2019. El artículo único del RD 450/2022 dice: «Se incorpora al Documento Básico DB-HE "Ahorro de energía", la sección HE 6 …» (LEÍDO web). La corrección de errores de 02-02-2023 solo pone cursivas en HE 6; no cambia ninguna cifra. La Guía DB-HE 2019 no tiene HE 6, lo que cuadra. (G.1–G.4)
2. La regla de **1 estación por cada 5 plazas accesibles** está dentro del **pto 2** (usos distintos del residencial privado). En residencial privado no aplica (INTERPRETACIÓN). Esas estaciones **no se suman** a las de 1/40: se cuentan dentro. (C.7, C.8)
3. «Por cada 5 plazas accesibles» **no lleva «o fracción»**, a diferencia de 1/40 y 1/20. El DB no dice si es por exceso o por defecto, y no hay comentario del Ministerio. Es CRITERIO. Propuesta: por exceso (C.9, K-HE6.4).
4. La **Administración General del Estado** no suma 1/20 a 1/40: lo **sustituye** («la dotación será mayor que la establecida con carácter general»). (C.6)
5. La exclusión b) **no** excluye por sí sola los edificios existentes de 20 plazas o menos. Pide además que el coste supere el **7 %** de la intervención. Y solo vale en edificios existentes. (B.3)
6. «Zona de uso aparcamiento» de la exclusión a) **no es** el «uso Aparcamiento» del DB-SI. El del DB-SI excluye el aparcamiento exterior y el de 100 m² o menos; el ámbito del HE 6 incluye el exterior. Se cuentan **todas** las plazas, interiores y exteriores adscritas. (B.2)
7. En la **vivienda unifamiliar nueva**, el REBT pide más que el HE 6. El HE 6 pide la conducción de cables; la ITC-BT-52 ap. 3.1 pide el **circuito C13 completo** si hay aparcamiento o zona prevista. (C.3, H.4)
8. El 20 % de plazas con conducción se redondea **por exceso**, pero en el código hay que calcularlo con enteros: `Math.ceil(0.2 * 15)` da **4** en JavaScript (0,2·15 = 3,0000000000000004). Usar `Math.ceil(n / 5)`. (C.5)
9. El RD 450/2022 también añadió la frase de la estación de recarga en la «plaza de aparcamiento accesible» del Anejo A del DB-SUA. Esto resuelve el pendiente 5 de `verificacion-sua9.md` (LEÍDO web). (C.10)
10. Código del repo: no cuenta las **plazas exteriores** adscritas, no tiene la regla de la **Administración General del Estado** ni la de **plazas accesibles**, y fija 3 680 W por estación sin leer el tipo de estación. (I)

---

## Bloque A — Ámbito de aplicación (ap. 1 pto 1) — punto 1 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A.1 | Condición previa | VERIFICADO | El edificio debe tener **una zona destinada a aparcamiento**, interior o exterior **adscrita al edificio**. Sin aparcamiento, HE 6 no aplica | ap. 1 pto 1: «Las condiciones establecidas en este apartado son de aplicación a edificios que cuenten con una zona destinada a aparcamiento, ya sea interior o exterior adscrita al edificio, en los siguientes supuestos:» | [HE22] p. 33 |
| A.2 | Obra nueva | VERIFICADO | Todo edificio nuevo con aparcamiento. Sin umbral de plazas en este punto (los umbrales están en las exclusiones) | «a) edificios de nueva construcción;» | [HE22] p. 33 |
| A.3 | Existentes, caso 1 | VERIFICADO | Cambio de uso característico. Sin más condición | «b) edificios existentes, en los siguientes casos: · cambios de uso característico del edificio;» | [HE22] p. 33 |
| A.4 | Existentes, caso 2 (ampliaciones) | VERIFICADO | Tres condiciones a la vez: (1) intervención en el aparcamiento; (2) incremento **> 10 %** de la superficie o del volumen construido de la unidad o unidades de uso intervenidas; (3) superficie **útil** ampliada **> 50 m²**. Todo estricto | «· ampliaciones, en aquellos casos en los que se incluyan intervenciones en el aparcamiento y se incremente más de un 10% la superficie o el volumen construido de la unidad o unidades de uso sobre las que se intervenga, siendo, además, la superficie útil ampliada superior a 50 m²;» | [HE22] p. 33 |
| A.5 | Existentes, caso 3 (reformas) | VERIFICADO | Intervención en el aparcamiento **y** renovación de **> 25 %** de la superficie total de la envolvente térmica **final** | «· reformas que incluyan intervenciones en el aparcamiento y en las que se renueve más del 25% de la superficie total de la envolvente térmica final del edificio.» (acaba en punto, no en punto y coma) | [HE22] p. 33 |
| A.6 | Existentes, caso 4 (instalación eléctrica del edificio) | VERIFICADO | **> 50 %** de la potencia instalada en el edificio antes de la intervención; solo si el aparcamiento está **en el interior** de la edificación **y** el promotor tiene derecho a actuar en él | «· intervenciones en la instalación eléctrica del edificio que afecten a más del 50% de la potencia instalada en el edificio antes de la intervención, para aquellos casos en los que el aparcamiento se sitúe en el interior de la edificación, siempre que exista un derecho para actuar en el aparcamiento por parte del promotor que realiza dicha intervención;» | [HE22] p. 33 |
| A.7 | Existentes, caso 5 (instalación eléctrica del aparcamiento) | VERIFICADO | **> 50 %** de la potencia instalada en el aparcamiento antes de la intervención. Sin más condición | «· intervenciones en la instalación eléctrica del aparcamiento que afecten a más del 50% de la potencia instalada en el mismo antes de la intervención;» | [HE22] p. 33 |
| A.8 | Qué es «zona destinada a aparcamiento … interior o exterior adscrita» | **NO LO FIJA EL DB** + INTERPRETACIÓN | El Anejo A del DB-HE no define «aparcamiento» ni «adscrita» (verificado en la imagen de pp. 39–44). Lectura: **interior** = garaje dentro del edificio (bajo rasante o en planta); **exterior adscrita** = plazas al aire libre o bajo marquesina, en la parcela, vinculadas al edificio. El límite lo da la ITC-BT-52 tal como la dejó el RD 450/2022: los aparcamientos «no ubicados en un edificio ni adscritos al mismo» quedan **fuera** del DB-HE y van por la disposición adicional primera del RD 1053/2014 (una estación por cada 40 plazas o fracción) | [G52] p. 4 (texto), que reproduce esa disposición: «En aparcamientos o estacionamientos de nueva construcción o sujetos a reformas importantes no ubicados en un edificio ni adscritos al mismo y, por lo tanto, fuera del ámbito de aplicación del Documento Básico de Ahorro de Energía (DB HE) del Código Técnico de la Edificación, se deberá instalar como mínimo una estación de recarga por cada 40 plazas de estacionamiento, o fracción.» | [HE22] pp. 33, 39–44; [G52] p. 4 |
| A.9 | Vivienda unifamiliar | INTERPRETACIÓN | Entra: es uso residencial privado (Anejo A: «vivienda unifamiliar, edificio de pisos …») y su garaje o su plaza en la parcela es «zona destinada a aparcamiento». La exclusión a) es solo para usos distintos del residencial privado. Para el DB-SI, el garaje de una unifamiliar no es «uso Aparcamiento», pero eso no importa aquí (B.2) | Anejo A: «Uso residencial privado: Edificio o zona destinada a alojamiento permanente, cualquiera que sea el tipo de edificio: vivienda unifamiliar, edificio de pisos o de apartamentos, etc, tanto de promoción pública como privada.» | [HE22] p. 44 |
| A.10 | «Este apartado» | INTERPRETACIÓN | El DB dice «las condiciones establecidas en este apartado», pero se refiere a la sección. Redacción imprecisa, sin efecto | ap. 1 pto 1 | [HE22] p. 33 |

**Para el módulo (obra nueva):** basta A.1 + A.2. Los cinco casos de existentes se pueden recoger como lista de comprobación, con el aviso de que la app calcula obra nueva.

**Frases de memoria:**
- Aplica: «El edificio es de nueva construcción y cuenta con una zona destinada a aparcamiento de [N] plazas ([Ni] interiores y [Ne] exteriores adscritas al edificio), por lo que le es de aplicación la Sección HE 6 (DB-HE, HE 6 ap. 1 pto 1 a).»
- Sin aparcamiento: «El edificio no cuenta con zona destinada a aparcamiento, interior ni exterior adscrita, por lo que no le es de aplicación la Sección HE 6 (DB-HE, HE 6 ap. 1 pto 1).»

---

## Bloque B — Exclusiones (ap. 1 pto 2) — punto 2 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B.1 | a) 10 plazas | VERIFICADO | Edificio de uso **distinto** del residencial privado con **≤ 10 plazas** → excluido. Con 11 plazas, aplica. **Vale también para obra nueva.** El residencial privado no tiene esta exclusión: una unifamiliar con 1 plaza sí está en el ámbito | «a) los edificios de uso distinto del residencial privado con una zona de uso aparcamiento de 10 plazas o menos;» | [HE22] p. 33 |
| B.2 | ¿Qué plazas se cuentan en a)? | **NO LO FIJA EL DB** + INTERPRETACIÓN + **CORREGIDO** (respecto a leerlo como el uso del DB-SI) | **Todas las plazas de la zona destinada a aparcamiento del edificio: interiores y exteriores adscritas.** Motivos: (1) el DB-HE no define «uso aparcamiento»; en la imagen va en redonda, no en cursiva (los términos del Anejo A van en cursiva, como «uso residencial privado» en la línea siguiente); (2) el «Uso Aparcamiento» del DB-SI exige **> 100 m² construidos** y **excluye** los aparcamientos exteriores; si se tomara ese, el aparcamiento exterior nunca contaría, y eso choca con el ap. 1 pto 1, que incluye el exterior; (3) la exclusión b) dice «zona destinada a aparcamiento», la misma expresión del pto 1. Ver K-HE6.2 | DB-SI, Anejo SI A: «Uso Aparcamiento: Edificio, establecimiento o zona independiente o accesoria de otro uso principal, destinado a estacionamiento de vehículos y cuya superficie construida exceda de 100 m², … Se excluyen de este uso los garajes, cualquiera que sea su superficie, de una vivienda unifamiliar, así como los aparcamientos en espacios exteriores del entorno de los edificios, aunque sus plazas estén cubiertas.» | [HE22] p. 33; [SI] p. 50 |
| B.3 | b) 20 plazas y 7 % | VERIFICADO + INTERPRETACIÓN (gramática) + **CORREGIDO** (encargo) | Solo **edificios existentes**. Dos grupos: (i) uso distinto del residencial privado con **≤ 20 plazas**; (ii) residencial privado, sin límite de plazas. **En ambos** («cuando, en ambos casos») hace falta además que el coste de cumplir HE 6 **supere el 7 %** del coste de la intervención, en **PEM** (coste de ejecución material). Las 20 plazas solas **no** excluyen | «b) los edificios existentes de uso distinto al residencial privado con una zona destinada a aparcamiento de 20 plazas o menos y los edificios existentes de uso residencial privado, cuando, en ambos casos, el coste derivado del cumplimiento de este apartado exceda del 7% del coste de la intervención de ampliación, cambio de uso o reforma que genera la obligación de cumplimiento. Para la determinación del coste de las intervenciones anteriormente referidas se considerará su coste real y efectivo, entendiendo como tal, su coste de ejecución material;» | [HE22] p. 33 |
| B.4 | Matiz «zona de uso aparcamiento» (a) frente a «zona destinada a aparcamiento» (b) | INTERPRETACIÓN | No se ha encontrado razón para leerlas distinto (B.2). El RD 450/2022 escribe lo mismo (LEÍDO web), así que no es una errata del consolidado. Ninguna de las dos está en el Anejo A | — | [HE22] p. 33; [RD450] |
| B.5 | c) protegidos | VERIFICADO | Solo «en la medida en que» el cumplimiento altere de manera inaceptable el carácter o el aspecto; los elementos inalterables los fija la autoridad que dicta la protección. No es una exclusión total automática | «c) los edificios protegidos oficialmente por ser parte de un entorno declarado o en razón de su particular valor arquitectónico o histórico, en la medida en que el cumplimiento de las exigencias establecidas en esta sección pudiese alterar de manera inaceptable su carácter o aspecto, siendo la autoridad que dicta la protección oficial quien determine los elementos inalterables.» | [HE22] p. 33 |
| B.6 | Edificio mixto y exclusión a) | **NO LO FIJA EL DB → CRITERIO** | a) habla de «edificios de uso distinto del residencial privado». Un edificio con viviendas y oficinas no es «de uso distinto» del residencial privado. Propuesta: la exclusión a) solo si el edificio **no tiene** unidades de uso residencial privado. Ver K-HE6.3 | — | — |
| B.7 | Comentarios | VERIFICADO: **no hay** | [DccHE] p. 37 (imagen) reproduce el ap. 1 sin comentario | — | [DccHE] p. 37 |

**Frases de memoria:**
- Excluido: «El edificio es de uso [administrativo] y su zona destinada a aparcamiento tiene [N] plazas, 10 o menos, por lo que queda excluido del ámbito de la Sección HE 6 (DB-HE, HE 6 ap. 1 pto 2 a).»
- No excluido: «… tiene [N] plazas, más de 10, por lo que no le alcanza la exclusión del ap. 1 pto 2 a).»

---

## Bloque C — Cuantificación (ap. 3 ptos 1 y 2) y términos — punto 3 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C.1 | Residencial privado: 100 % | VERIFICADO | Conducción de cables para el **100 %** de las plazas. **Ninguna estación** obligatoria por el HE 6 | 3 pto 1: «En los edificios de uso residencial privado se instalarán sistemas de conducción de cables que permitan el futuro suministro a estaciones de recarga para el 100% de las plazas de aparcamiento.» | [HE22] p. 34 |
| C.2 | Con el 100 %, ¿hasta dónde llega la conducción? | VERIFICADO | **Hasta cada una de las plazas** (ITC-BT-52 ap. 3.2 a), desde la centralización de contadores y por las vías principales del aparcamiento | 3.2 a): «Instalación de sistemas de conducción de cables desde la centralización de contadores y por las vías principales del aparcamiento o estacionamiento … Cuando la preinstalación esté prevista para el 100 % de las plazas, los sistemas de conducción de cables llegarán hasta cada una de las plazas.» | [REBT] p. 280 |
| C.3 | Unifamiliar nueva | VERIFICADO + INTERPRETACIÓN | HE 6 pide conducción al 100 %. Pero HE 6 ap. 2 remite a la ITC-BT-52, y su ap. 3.1 pide en la unifamiliar nueva con aparcamiento **o zona prevista** el **circuito C13**, esquema 4a. La Guía BT-52 añade que debe quedar totalmente instalado, punto de recarga incluido ([verificacion-rebt.md] F.3). En la unifamiliar, el REBT cubre de sobra el HE 6 | HE 6 ap. 2: «Esta infraestructura de recarga de vehículos eléctricos cumplirá con lo dispuesto en el vigente Reglamento electrotécnico de baja tensión y en su Instrucción Técnica Complementaria (ITC) BT 52 …» · ITC-BT-52 3.1 (ver [verificacion-rebt.md] F.3) | [HE22] p. 33; [REBT] p. 279 |
| C.4 | Otros usos: 20 % | VERIFICADO | Conducción para **al menos el 20 %** de las plazas | 3 pto 2: «En los edificios de uso distinto al residencial privado se instalarán sistemas de conducción de cables que permitan el futuro suministro a estaciones de recarga para al menos el 20% de las plazas de aparcamiento.» | [HE22] p. 34 |
| C.5 | ¿Se redondea el 20 %? | INTERPRETACIÓN (aritmética) | **Por exceso.** Las plazas son enteras y deben ser «al menos el 20 %»: n ≥ 0,2·N → **n = ⌈N/5⌉**. Con 11 plazas, 3 (2 serían el 18 %). La ITC-BT-52 3.2 a) obliga a **definir qué plazas** cumplen la dotación y a llegar hasta cada una. **Aviso de código:** en JavaScript, `Math.ceil(0.2 * 15)` = 4 (0,2·15 = 3,0000000000000004). Calcular `Math.ceil(N / 5)` | 3.2 a): «Cuando la preinstalación no esté prevista para el 100 % de las plazas, se definirán las plazas que se consideran para el cumplimiento de la dotación reglamentaria de sistemas de conducción de cables, y dichos sistemas llegarán hasta cada una de esas plazas.» | [HE22] p. 34; [REBT] p. 280 |
| C.6 | 1/40 y Administración General del Estado | VERIFICADO + INTERPRETACIÓN + **CORREGIDO** (no es aditivo) | **General: ⌈N/40⌉** («o fracción»). **AGE y organismos vinculados o dependientes: ⌈N/20⌉, en lugar de** ⌈N/40⌉ («la dotación será mayor que la establecida con carácter general»). El 20 % de conducción no cambia. Solo AGE; **no** comunidades autónomas ni entidades locales | «Además, se instalará una estación de recarga por cada 40 plazas de aparcamiento, o fracción.» · «En los edificios de uso distinto al residencial privado que sean titularidad de la Administración General del Estado o de los organismos públicos vinculados a ella o dependientes de la misma, la dotación será mayor que la establecida con carácter general, debiéndose instalar una estación de recarga por cada 20 plazas de aparcamiento, o fracción.» | [HE22] p. 34 |
| C.7 | Plazas accesibles: literal | VERIFICADO | **1 estación por cada 5 plazas accesibles**, y esas estaciones **computan** para cumplir la cuantificación | «En caso de que los aparcamientos dispongan de plazas de aparcamiento accesibles, según se establece en el DB SUA, se instalará una estación de recarga por cada 5 plazas de aparcamiento accesibles. Las estaciones de recarga de estas plazas se computarán a efectos de cumplimiento de la cuantificación de la exigencia.» | [HE22] p. 34 |
| C.8 | ¿Se suman a las de 1/40? | INTERPRETACIÓN (fuerte) | **No se suman: se cuentan dentro.** «Se computarán a efectos de cumplimiento» = cuentan para el total de 1/40 (o 1/20). Resultado: **estaciones = máx(⌈N/40⌉; Eacc)**, y de ellas **Eacc** van en plazas accesibles. Con las dotaciones mínimas del SUA 9, ⌈N/40⌉ ≥ Eacc siempre (ver ejemplos), así que la regla casi nunca cambia el número total: **cambia dónde va una estación**. Además, la regla está dentro del **pto 2**: en **residencial privado no aplica** (allí no hay estaciones que computar) | ídem | [HE22] p. 34 |
| C.9 | «Por cada 5 plazas accesibles»: ¿por exceso o por defecto? | **NO LO FIJA EL DB → CRITERIO** | El DB escribe «o fracción» en 1/40 y en 1/20, **y no** en 1/5. Leído al pie de la letra, son grupos completos (⌊Nacc/5⌋): con 1 a 4 plazas accesibles, ninguna estación en plaza accesible. El comentario del Ministerio no lo resuelve; la Guía BT-52 tampoco. Propuesta **⌈Nacc/5⌉** (al menos una estación en plaza accesible si hay alguna): no añade estaciones (C.8), solo fija dónde va una; es la lectura del lado de la accesibilidad. Rotular. Ver K-HE6.4 | — | [HE22] p. 34; [DccHE] p. 38 (texto) |
| C.10 | Accesibilidad del punto de recarga | LEÍDO (comentario) + VERIFICADO (DB-SUA) + LEÍDO (web, origen) | Comentario: «Las condiciones de accesibilidad de los puntos de recarga de las plazas de aparcamiento accesibles se encuentran en la definición de plaza de aparcamiento accesible, en el Anejo A del DB SUA.» DB-SUA, Anejo A: itinerario accesible hasta la estación; tomas y conectores con **contraste cromático**, a **80–120 cm** de altura y a **≥ 35 cm** de los rincones. La ITC-BT-52 ap. 5.4 repite lo mismo (texto). Esta frase la introdujo el **RD 450/2022** en el DB-SUA (resuelve el pendiente 5 de `verificacion-sua9.md`) | DB-SUA Anejo A, «Plaza de aparcamiento accesible»: «En caso de que la plaza de aparcamiento accesible cuente con una estación de recarga de vehículo eléctrico, el itinerario accesible llega también hasta esta estación de recarga. Las tomas de corriente y conectores de estas estaciones de recarga tienen contraste cromático respecto del entorno, se sitúan a una altura comprendida entre 80 y 120 cm y la distancia a encuentros en rincón es de, como mínimo, 35 cm.» | [DccHE] p. 38 (texto); [SUA] p. 37; [REBT] p. 283 (texto); [RD450] |
| C.11 | ¿Cuántas plazas accesibles hay? | VERIFICADO (DB-SUA) | Las del SUA 9 ap. 1.2.3 (mínimo) o las que declare el proyecto, si son más. **Residencial Vivienda:** una por vivienda accesible para silla de ruedas. **Otros usos con aparcamiento propio y > 100 m² construidos:** Residencial Público, una por alojamiento accesible; Comercial, Pública Concurrencia o Aparcamiento de uso público, **1 por cada 33 o fracción**; **cualquier otro uso, 1 por cada 50 o fracción hasta 200, y 1 más por cada 100 adicionales o fracción**; y siempre al menos una por plaza reservada para silla de ruedas. El repo ya tiene `plazasAccesiblesOtrosUsos()` en `src/modules/sua9/tablas.ts` para el caso c) | SUA 9 ap. 1.2.3 | [SUA] p. 32 |
| C.12 | «Sistema de conducción de cables» | **NO LO DEFINE el DB-HE** (ni la ITC-BT-52) + INTERPRETACIÓN | No está en el Anejo A del DB-HE: en la imagen de p. 43 se pasa de «Sistema de alimentación específico…» a «Sistema de control y regulación». La ITC-BT-52 tampoco lo define; lo describe en 3.2 a) (C.2) y dice cómo dimensionarlo en el esquema 4a: «utilizando cables y sistemas de conducción de los mismos tipos y características que para una derivación individual». Lectura: **canalización** (tubo, canal o bandeja) desde la centralización de contadores (o el cuadro de partida, según el esquema) por las vías principales y hasta cada plaza que cuenta para la dotación. **No incluye cables ni estaciones**. La Guía BT-52 lo dice: «no siendo obligatorio que la preinstalación incluya los cables de los circuitos de alimentación del vehículo eléctrico, ni las estaciones de recarga» | ITC-BT-52 3.2 (4a): «… utilizando cables y sistemas de conducción de los mismos tipos y características que para una derivación individual …» | [HE22] p. 43; [REBT] pp. 279–280; [G52] p. 26 (texto) |
| C.13 | «Estación de recarga» | VERIFICADO | **Igual en el DB-HE y en la ITC-BT-52.** «Conjunto de elementos necesarios para efectuar la conexión del vehículo eléctrico a la instalación eléctrica fija necesaria para su recarga.» Dos clases: **1. Punto de recarga simple** (protecciones + una o varias bases de toma de corriente **no específicas** para el VE + envolvente, en su caso); **2. Punto de recarga tipo SAVE**. **No fija potencia mínima ni modo de carga.** Una estación instalada incluye el circuito y sus protecciones, no solo la canalización | DB-HE Anejo A, «Estación de recarga» (literal arriba). ITC-BT-52 ap. 2: mismo texto | [HE22] p. 39; [REBT] p. 267 |
| C.14 | «Infraestructura de recarga de vehículos eléctricos» | VERIFICADO | Incluye las estaciones de recarga, el sistema de control, canalizaciones eléctricas, cuadros de mando y protección y equipos de medida, «cuando éstos sean exclusivos para la recarga del vehículo eléctrico». El DB-HE añade «previstos para cada caso por el Reglamento electrotécnico de baja tensión» | DB-HE Anejo A; ITC-BT-52 ap. 2 | [HE22] p. 40; [REBT] p. 267 |
| C.15 | SAVE | VERIFICADO | «… conjunto de equipos montados con el fin de suministrar energía eléctrica para la recarga de un vehículo eléctrico, incluyendo protecciones de la estación de recarga, el cable de conexión (con conductores de fase, neutro y protección) la base de toma de corriente o el conector y, en su caso, un convertidor alterna-continua. …» | DB-HE Anejo A | [HE22] p. 43 |
| C.16 | ¿Las plazas con estación cuentan en el 20 %? | **NO LO FIJA EL DB → CRITERIO** | El DB no lo dice. Una plaza con estación tiene canalización y circuito hasta ella, así que permite el suministro. Propuesta: **sí cuentan** en el 20 %. Ver K-HE6.5 | — | — |
| C.17 | Plazas de motos o bicicletas | **NO LO FIJA EL DB → CRITERIO** | El DB dice «plazas de aparcamiento» sin más. Propuesta: contar solo las plazas de **automóvil**; las de moto, aparte y sin exigencia. Ver K-HE6.6 | — | — |

**Ejemplos (aritmética, para los tests).** Plazas accesibles, mínimo del SUA 9 ap. 1.2.3 pto 2 c) («cualquier otro uso»), salvo donde se dice:

| Caso | N | Conducción | Estaciones (1/40 o 1/20) | Plazas accesibles | Estaciones en plaza accesible ⌈Nacc/5⌉ (⌊ ⌋) | Total |
|---|---|---|---|---|---|---|
| Oficinas | 10 | — | — | — | — | **Excluido** (a) |
| Oficinas | 11 | ⌈11/5⌉ = **3** | ⌈11/40⌉ = 1 | 1 | 1 (0) | **1** (en la accesible) |
| Oficinas | 15 | **3** (no 4) | 1 | 1 | 1 (0) | **1** |
| Oficinas | 40 | 8 | 1 | 1 | 1 (0) | **1** |
| Oficinas | 41 | 9 | 2 | 1 | 1 (0) | **2** |
| Oficinas | 50 | 10 | 2 | 1 | 1 (0) | **2** |
| Oficinas | 250 | 50 | 7 | 4 + 1 = 5 | 1 (1) | **7** |
| Comercial (1/33) | 100 | 20 | 3 | ⌈100/33⌉ = 4 | 1 (0) | **3** |
| Oficinas AGE | 50 | 10 | ⌈50/20⌉ = **3** | 1 | 1 (0) | **3** |
| Oficinas con 12 accesibles declaradas | 40 | 8 | 1 | 12 | 3 (2) | **3** (máx.) |
| Viviendas, 30 plazas | 30 | **30** (100 %) | — | — | no aplica (C.8) | **0** |

**Frases de memoria:**
- Residencial privado: «Se disponen sistemas de conducción de cables que permiten el futuro suministro a estaciones de recarga en las [N] plazas de aparcamiento, el 100 % (DB-HE, HE 6 ap. 3 pto 1), llevados desde la centralización de contadores por las vías principales hasta cada plaza (ITC-BT-52 ap. 3.2 a). CUMPLE.»
- Otros usos: «Aparcamiento de [N] plazas: conducción de cables hasta [n] plazas ([p] %; mínimo exigido el 20 %, [⌈N/5⌉] plazas) y [E] estaciones de recarga instaladas (mínimo una por cada [40 / 20] plazas o fracción: [⌈N/40⌉]); de ellas, [Eacc] en plazas de aparcamiento accesibles ([Nacc] plazas accesibles, una estación por cada 5; criterio de redondeo por exceso), que computan en el total (DB-HE, HE 6 ap. 3 pto 2). CUMPLE / NO CUMPLE.»

---

## Bloque D — Edificios mixtos (ap. 3 pto 3) — punto 4 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| D.1 | Literal | VERIFICADO | Si las zonas de aparcamiento de cada uso **no están claramente diferenciadas**, se aplica el criterio del **uso característico** a todas las plazas | 3 pto 3: «En los edificios que tengan unidades de uso residencial privado junto a otras de distinto uso, en los que las zonas de aparcamiento vinculadas a cada uso no estén claramente diferenciadas, se aplicará el criterio correspondiente al uso característico del edificio.» | [HE22] p. 34 |
| D.2 | Si están diferenciadas | INTERPRETACIÓN | Cada zona con su criterio: plazas de las viviendas, 100 % (pto 1); plazas del otro uso, 20 % + 1/40 (pto 2) | a contrario de D.1 | — |
| D.3 | ¿Qué es «uso característico»? | **NO LO DEFINE el DB-HE** | No está en el Anejo A del DB-HE (ver `verificacion-he4-he5.md` J.4). Se usa el del edificio en el resto del repo (el que ya fija El edificio). Ver K-HE6.7 | — | [HE22] pp. 39–44 |
| D.4 | ¿Qué es «claramente diferenciadas»? | **NO LO FIJA EL DB → CRITERIO** | Propuesta: zonas separadas físicamente o plazas vinculadas a cada uso en el proyecto (asignación registral o reparto declarado). Decisión del usuario, con «no diferenciadas» por defecto | — | — |

**Frase de memoria:** «El edificio tiene unidades de uso residencial privado y de uso [administrativo], y sus zonas de aparcamiento [no están claramente diferenciadas: se aplica a todas las plazas el criterio del uso característico, [residencial privado] / están diferenciadas: [Nv] plazas con el criterio del residencial privado y [No] plazas con el de otros usos] (DB-HE, HE 6 ap. 3 pto 3).»

---

## Bloque E — Justificación (ap. 4) y esquemas de conexión — punto 5 del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| E.1 | Contenido a)–d) | VERIFICADO | Cuatro contenidos | ap. 4 pto 1: «Para justificar que un edificio cumple las exigencias de este DB, los documentos de proyecto incluirán la siguiente información sobre el edificio o parte del edificio evaluada: a) esquema de conexión utilizado para el dimensionado, según los descritos en el Reglamento electrotécnico de baja tensión; b) descripción de la conducción principal y las canalizaciones dispuestas, indicando el porcentaje de plazas de aparcamiento que cuentan con sistemas de conducción de cables y el porcentaje mínimo exigido; c) número de estaciones de recarga instaladas y número mínimo resultante de la cuantificación de la exigencia. d) tipos de estaciones de recarga y potencia de las mismas.» | [HE22] p. 34 |
| E.2 | En residencial privado, c) y d) | INTERPRETACIÓN | Mínimo de estaciones = 0. c) se escribe «0 instaladas; mínimo 0». d) solo si se instalan estaciones (en la unifamiliar, el C13 del REBT) | — | — |
| E.3 | La ITC-BT-52 pide también el esquema | VERIFICADO | El proyecto o la memoria técnica de diseño indica el esquema de conexión a utilizar. Hay cuatro: | ITC-BT-52 ap. 3: «1. Esquema colectivo o troncal con un contador principal en el origen de la instalación. 2. Esquema individual con un contador común para la vivienda y la estación de recarga. 3. Esquema individual con un contador para cada estación de recarga. 4. Esquema con circuito o circuitos adicionales para la recarga del vehículo eléctrico.» | [REBT] p. 272 |
| E.4 | Subesquemas, en una línea cada uno | 1a VERIFICADO (pie de figura, imagen); resto LEÍDO (Guía, texto, pies de figura 6–12; el consolidado tiene las mismas figuras en pp. 273–278, no renderizadas) | **1a**: colectivo troncal; contador principal en el origen (en la centralización existente, en sus módulos de reserva) y contadores secundarios en las estaciones. **1b**: igual que 1a, con una **centralización nueva** para la recarga. **1c**: colectivo con un contador principal y contadores secundarios, con **circuito individual** a cada estación (no troncal). **2**: individual; **contador común vivienda + estación**, circuito desde la centralización. **3a**: individual; **un contador principal por estación** en la centralización existente. **3b**: como 3a, con **centralización nueva**. **4a**: **circuito adicional individual** desde el cuadro de la vivienda (el C13 de la unifamiliar; en propiedad horizontal solo si la infraestructura común lo permite). **4b**: **circuito o circuitos adicionales** que parten del cuadro de **servicios generales del garaje**, normalmente colectivos | Pies de figura 5 a 12; ITC-BT-52 3.2: «El esquema 4b se utilizará cuando la alimentación de las estaciones de recarga se proyecte como parte integrante o ampliación de la instalación eléctrica que atiende a los servicios generales de los garajes.» | [REBT] pp. 272, 280; [G52] pp. 12–23 (texto) |
| E.5 | Orden de preferencia 1a/1b y 3a/3b | VERIFICADO (texto) | Primero los módulos de reserva de la centralización existente (1a / 3a); si no basta, ampliarla (1a / 3a); en último caso, centralización nueva (1b / 3b) | ITC-BT-52 ap. 3 | [REBT] pp. 273, 277 (texto) |
| E.6 | Esquemas admitidos en aparcamientos de edificios | VERIFICADO | En aparcamientos interiores o adscritos a edificios, **cualquiera** de los esquemas; se pueden mezclar en un mismo edificio. La **preinstalación** debe permitir **cualquiera** de ellos después | ITC-BT-52 3.2: «… seguirán cualquiera de los esquemas descritos anteriormente. En un mismo edificio se podrán utilizar esquemas distintos …» · «La preinstalación eléctrica … facilitará la utilización posterior de cualquiera de los posibles esquemas de instalación.» | [REBT] pp. 279–280 |
| E.7 | Esquema 4a en propiedad horizontal | LEÍDO (Guía) | Se admite, pero la Guía lo recomienda solo para viviendas unifamiliares y fincas con un único suministro (caídas de tensión, patinillos grandes) | [G52] p. 22 (texto) | — |
| E.8 | ¿«Esquema utilizado para el dimensionado» si solo hay preinstalación? | **NO LO FIJA EL DB → CRITERIO** | En residencial privado sin estaciones, el esquema solo sirve para dimensionar canalización y centralización. Propuesta: el que declare el usuario; por defecto, **1a** en edificios de viviendas (aprovecha los módulos de reserva de la ITC-BT-52 3.2 b), **4b** en otros usos con estaciones de la propiedad (salen del cuadro de servicios del garaje) y **4a** en la unifamiliar (obligado por la ITC-BT-52 3.1). Es el mismo dato que el factor de simultaneidad del módulo REBT: **una sola decisión, compartida**. Ver K-HE6.8 | — | — |

**Frase de memoria (ap. 4):** «a) Esquema de conexión [1a: colectivo troncal con contador principal y contadores secundarios] (REBT, ITC-BT-52 ap. 3). b) Conducción principal desde la centralización de contadores por las vías principales del aparcamiento, con canalizaciones hasta [n] plazas, el [p] % (mínimo exigido [100 / 20] %). c) Estaciones de recarga instaladas: [E]; mínimo exigido: [Emin]. d) Tipo de estación: [punto de recarga tipo SAVE, modo 3, base tipo 2, monofásica 16 A], [3,7] kW cada una (DB-HE, HE 6 ap. 4).»

---

## Bloque F — Potencia y tipo de estación por defecto — punto 6 del encargo

| # | Afirmación | Veredicto | Valor | Cita / fuente |
|---|---|---|---|---|
| F.1 | ¿El HE 6 fija potencia o modo? | **NO** (VERIFICADO que no lo fija) | Solo pide declararlos (ap. 4 d). La definición de estación no tiene potencia mínima (C.13) | [HE22] pp. 34, 39 |
| F.2 | Modos de carga | VERIFICADO | **Modo 1**: tomas normalizadas, ≤ 16 A, ≤ 250 V monofásico o 480 V trifásico, sin control piloto. **Modo 2**: ≤ 32 A, tomas normalizadas con función de control piloto y protección diferencial en el cable. **Modo 3**: conexión directa a un SAVE fijo, con control piloto ampliado al SAVE. **Modo 4**: conexión indirecta, SAVE con cargador externo (corriente continua) | [REBT] p. 267 (modos 1 y 2, imagen); p. 268 (modos 3 y 4, texto) |
| F.3 | 3 680 W como unidad | VERIFICADO | La ITC-BT-10 ap. 5.2 prevé **3 680 W por plaza** (16 A a 230 V). La tabla 1 de la ITC-BT-52 calcula los circuitos trifásicos «suponiendo estaciones monofásicas de una potencia unitaria de 3.680 W» | [REBT] p. 100 (ap. 5.2, ver [verificacion-rebt.md] F.7); p. 279 (tabla 1, texto: «El número máximo de estaciones de recarga de la tabla 1 por cada circuito de recarga trifásico se ha calculado suponiendo estaciones monofásicas de una potencia unitaria de 3.680 W.») |
| F.4 | Escalones normalizados | VERIFICADO (tabla 1 ITC-BT-52) | 230 V: 2 300 / **3 680** / 4 600 / **7 360** / 9 200 W (10/16/20/32/40 A). 230/400 V: 11 085 / 13 856 / 22 170 / 27 713 W. Es la tabla «para una vivienda unifamiliar»: en otros usos, solo como referencia | [REBT] p. 279; [verificacion-rebt.md] F.4 |
| F.5 | Tipo de toma según potencia | VERIFICADO (texto) | Puntos de c.a. de **> 3,7 kW y ≤ 22 kW**: al menos **bases o conectores tipo 2**. **> 22 kW** c.a.: conectores tipo 2. Modo 4: **combo 2** (EN 62196-3). En modos 3 y 4, bases y conectores dentro de un SAVE. Estaciones monofásicas **≤ 3,7 kW** en viviendas: cualquier base de la tabla 3. En otros usos ≤ 3,7 kW (oficinas, empresas): también Schuko (C2a, C7a) **si hay al menos una tipo 2** (nota 6). **Lugares públicos** (centros comerciales, garajes de uso público): **modo 3 con base tipo 2** (nota 3) | ITC-BT-52 ap. 5.4 y tabla 3, notas (3) y (6) | [REBT] pp. 283–284 (texto); [G52] pp. 33–34 (texto) |
| F.6 | Altura de tomas | VERIFICADO (texto) / VERIFICADO (DB-SUA) | Mínimo **60 cm**. Uso público: máximo **120 cm**. Plaza accesible: **80–120 cm**, contraste cromático, **≥ 35 cm** a rincones. La Guía recomienda la caja de la estación a ≥ 1,5 m (1,0 m en plazas de movilidad reducida) para que no la golpeen los coches (recomendación) | [REBT] p. 283 (texto); [SUA] p. 37; [G52] p. 33 |
| F.7 | P5 mínimo en otros usos (Guía) | LEÍDO (Guía) | «P5 mínimo = (Nº plazas / 40) · 3,68 kW». Ya tratado en [verificacion-rebt.md] F.13: la base hoy es el HE 6 (⌈N/40⌉), no la disposición adicional primera | [G52] p. 28 |
| F.8 | Valor por defecto | **NO LO FIJA LA NORMA → CRITERIO** | **Punto de recarga tipo SAVE, modo 3, base tipo 2, monofásico 230 V, 16 A, 3 680 W.** Motivos: (1) es la unidad de la ITC-BT-10 5.2, de la tabla 1 de la ITC-BT-52 y del P5 mínimo de la Guía, así que la previsión del módulo REBT (⌈N/40⌉ · 3 680 W) cuadra sin más; (2) modo 3 con tipo 2 vale **en cualquier ubicación** de la tabla 3, también en lugares públicos (nota 3); (3) ≤ 3,7 kW no obliga a tipo 2, pero con modo 3 se pone igual. Ofrecer **7 360 W** (32 A monofásico) y **11 085 W** (16 A trifásico) como alternativas. Si el usuario elige otra potencia, el P5 del REBT debe leerla (I.5). Ver K-HE6.9 | — |
| F.9 | 7,4 kW | CRITERIO (no exigencia) | 7 360 W es el escalón de 32 A de la tabla 1. Es lo habitual del mercado en wallbox, pero **ninguna norma leída lo exige**. Con 7,36 kW por estación, P5 se dobla | [REBT] p. 279 |

**Frase de memoria (ap. 4 d):** «Estaciones de recarga: punto de recarga tipo SAVE (sistema de alimentación específico del vehículo eléctrico), modo de carga 3, base de toma de corriente tipo 2 (UNE-EN 62196-2), monofásico 230 V, 16 A, 3,68 kW cada una (tipo y potencia: criterio de proyecto; ITC-BT-52 ap. 5.4 y tabla 3).»

---

## Bloque G — Historia y cita — punto 7 del encargo

| # | Afirmación | Veredicto | Valor | Fuente |
|---|---|---|---|---|
| G.1 | ¿Qué disposición dio el HE 6? | LEÍDO (web) + **CORREGIDO** (no es el RD 732/2019) | **RD 450/2022, de 14 de junio** (BOE 15-06-2022), artículo único: «Se incorpora al Documento Básico DB-HE "Ahorro de energía", la sección HE 6 con el título "Dotaciones mínimas para la infraestructura de recarga de vehículos eléctricos"». Añade también a la Parte I el art. 15.7 «Exigencia básica HE 6» («Los edificios dispondrán de una infraestructura mínima que posibilite la recarga de vehículos eléctricos.»). Transpone el art. 8 de la Directiva (UE) 2018/844 (eficiencia energética de los edificios) | [RD450] |
| G.2 | ¿El RD 732/2019 tenía HE 6? | INTERPRETACIÓN (con dos indicios) | **No.** (1) El RD 450/2022 dice que «se incorpora» la sección, no que se modifica; (2) la Guía de aplicación del DB-HE 2019 no menciona HE 6 ni la recarga. El RD 450/2022 no cita el RD 732/2019 en lo leído | [RD450]; [Guía-HE] |
| G.3 | Corrección de errores (BOE 02-02-2023) | LEÍDO (web) | Solo **cursivas** en HE 6 («estación de recarga», «uso residencial privado», «envolvente térmica», …), en el Anejo A (estación de recarga, infraestructura, SAVE) y en el Anejo A del DB-SUA. **No cambia ninguna cifra** (10, 20, 40, 20 %, 100 %, 5, 7 %) | [CE450] |
| G.4 | Aplicación en el tiempo | LEÍDO (web) | En vigor el **16-06-2022**. Disp. transitorias: no se aplica a obras con licencia solicitada antes de la entrada en vigor; voluntaria si se solicita en los **6 meses** siguientes; **obligatoria** si se solicita después (desde el **16-12-2022**). En todos los casos, siempre que la obra empiece dentro de la vigencia de la licencia (o en 6 meses). Cotejar el literal antes de citarlo | [RD450] |
| G.5 | El mismo RD tocó el REBT | LEÍDO (web) + [verificacion-rebt.md] apartado 0 | Disposición final primera: modifica el RD 1053/2014 (disp. adicional primera, aparcamientos **no adscritos** a edificios: 1 estación por cada 40 plazas o fracción) y la ITC-BT-52 ap. 3.2 y 5.4 | [RD450] |
| G.6 | Cita para la ficha | — | **«DB-HE, Sección HE 6 (introducida por el RD 450/2022, BOE 15-06-2022), texto consolidado 14-06-2022 con la corrección de errores de 02-02-2023.»** Para la ITC-BT-52: «REBT, ITC-BT-52 ap. [x], consolidado BOE-A-2002-18099, últ. modif. 03-09-2025; ap. 3.2 y 5.4 según el RD 450/2022». Comentario del Ministerio: «DB-HE con comentarios (22-12-2023), no reglamentario» | — |

---

## Bloque H — Interacción con el REBT — punto 8 del encargo

| # | Afirmación | Veredicto | Valor correcto | Fuente |
|---|---|---|---|---|
| H.1 | Son cosas distintas | INTERPRETACIÓN | **HE 6** fija **dotaciones físicas**: plazas con canalización y estaciones instaladas. **ITC-BT-10 ap. 5.2** fija una **previsión de potencia** (3 680 W × 10 % de las plazas), no estaciones. **ITC-BT-52 ap. 3.2** fija **cómo** se hace la preinstalación (canalización hasta cada plaza; módulos de reserva) y **ap. 4** el **factor de simultaneidad** con el resto del edificio | [HE22] p. 34; [REBT] pp. 100, 280–281 |
| H.2 | El 10 % no es dotación | VERIFICADO + INTERPRETACIÓN | El 10 % de la ITC-BT-10 5.2 solo vale para viviendas nuevas en propiedad horizontal y es potencia. **No** obliga a instalar estaciones en el 10 % de las plazas, ni reduce el 100 % de conducción del HE 6 | [verificacion-rebt.md] F.1, F.7 |
| H.3 | Módulos de reserva frente al 20 % | VERIFICADO | Son dos 20 % distintos. HE 6: conducción para **≥ 20 % de las plazas** (otros usos). ITC-BT-52 3.2 b): **módulos de reserva** en la centralización para **≥ 20 % de las plazas no asociadas a una vivienda**, y **mínimo uno** aunque todas lo estén. Los módulos de reserva son de contadores, no de canalización | [HE22] p. 34; [REBT] p. 280 |
| H.4 | Unifamiliar | VERIFICADO + INTERPRETACIÓN | HE 6: 100 % de conducción. REBT: C13 completo, esquema 4a, y **electrificación elevada** (ITC-BT-10 5.1). Lo pide el REBT; HE 6 queda cubierto | [REBT] pp. 100, 279 |
| H.5 | Grupo z de la ITC-BT-04 | VERIFICADO en [verificacion-rebt.md] H.5 | Proyecto si la infraestructura de recarga supera **50 kW**; **10 kW** si las estaciones están **en el exterior**; siempre si hay modo 4. Con 3 680 W por estación: **3 estaciones exteriores** (11 040 W) ya piden proyecto, es decir, un aparcamiento exterior de **más de 80 plazas** en otros usos | [REBT] p. 53 |
| H.6 | Qué va en cada justificación (para no duplicar) | **CRITERIO** | **HE 6 (dueño de las dotaciones):** ámbito y exclusiones; plazas (interiores + exteriores, accesibles); % de conducción y mínimo; estaciones instaladas y mínimo (1/40, 1/20, 1/5 accesibles); tipo y potencia de estación; esquema declarado (el apartado 4 a). **REBT (dueño de la potencia):** P5 (10 % en viviendas; **estaciones del HE 6 × potencia de estación del HE 6** en otros usos); factor 0,3/1,0 según el esquema; módulos de reserva y contadores; proyecto (grupo z). **Un solo dato compartido** para el esquema y para el tipo de estación: lo decide el usuario una vez y lo leen los dos módulos. La ficha de HE 6 remite a la del REBT para la potencia («la previsión de cargas se justifica en el anejo de REBT, ITC-BT-10 ap. 5 e ITC-BT-52 ap. 4»), y la del REBT remite a la de HE 6 para el número de estaciones | — |

---

## Bloque I — Revisión del código existente (`src/modules/rebt/`) — punto 9 del encargo

Lo que está bien:
- `RECARGA_HE6.datos = { plazasPorEstacion: 40, excluidoHastaPlazas: 10 }` coincide con el DB (C.6, B.1).
- `otrosUsos = clasificacion === "oficinas" && plazasGaraje > 10`: la exclusión es **≤ 10** → aplica con **> 10**. **Correcto.** Y no se aplica a viviendas (residencial privado no tiene esa exclusión). **Correcto.**
- `Math.ceil(plazasGaraje / 40)`: «o fracción» = por exceso. **Correcto**, y con división entera exacta.
- Factor 1,0 en otros usos: correcto (esquemas 2, 3, 4 y 1 sin SPL; [verificacion-rebt.md] F.6).

Diferencias o huecos (para `motor-calculo`; no se ha tocado código):

| # | Dónde | Qué | Propuesta | Base |
|---|---|---|---|---|
| I.1 | `justificacion.ts` l. 357: `plazasGaraje` suma solo zonas `uso === "garaje"` | **No cuenta las plazas exteriores** adscritas al edificio. El HE 6 sí (A.1, B.2). Un edificio de oficinas con 8 plazas en sótano y 30 al aire libre queda excluido por error | Añadir al modelo de El edificio un dato «plazas de aparcamiento exteriores adscritas» (y si están cubiertas). Para la exclusión y la cuantificación del HE 6: interiores + exteriores. Para la ITC-BT-10 ap. 3.4 (garaje) siguen contando solo las interiores | A.8, B.2 |
| I.2 | `RECARGA_HE6` | Falta la **Administración General del Estado** (1/20) | Decisión «titularidad AGE» (no por defecto). `plazasPorEstacionAGE: 20`, que **sustituye** a 40 | C.6 |
| I.3 | `RECARGA_HE6` | Faltan las **plazas accesibles** (1/5, computan) | Leer las plazas accesibles del módulo SUA 9 (`plazasAccesiblesOtrosUsos`, o el dato del proyecto si es mayor). Estaciones = máx(⌈N/40⌉, ⌈Nacc/5⌉). Afecta sobre todo a la ficha de HE 6; en P5 casi nunca cambia (C.8) | C.7–C.9, C.11 |
| I.4 | Comentario de `RECARGA_HE6`: «excluidos los aparcamientos de 10 plazas o menos» | Impreciso: se excluyen **edificios** de uso distinto del residencial privado con 10 plazas o menos | Corregir el comentario. Metadatos: `articulo: "HE 6 ap. 1 pto 2 a) y ap. 3 pto 2"`; añadir «sección introducida por el RD 450/2022» | B.1, G.1 |
| I.5 | `R.porPlaza_W` (3 680 W) en otros usos | La potencia de la estación es la que el proyecto declare (HE 6 ap. 4 d). Si el usuario elige 7,4 kW, P5 debe seguirla | P5 (otros usos) = estaciones del HE 6 × potencia de estación del HE 6 (por defecto 3 680 W, K-HE6.9) | F.8, H.6 |
| I.6 | `clasificacion === "oficinas"` | Sirve para oficinas. Un edificio **comercial**, docente, etc. también es «de uso distinto». Y un edificio mixto con zonas diferenciadas no se trata | Usar el criterio de K-HE6.3 y K-HE6.7, no la clasificación eléctrica | B.6, D.1–D.4 |
| I.7 | `Math.ceil(noAsociadas * 0.2 - 1e-9)` (módulos de reserva) | Funciona, pero con un parche de coma flotante | Usar `Math.ceil(noAsociadas / 5)`. Mismo aviso para el 20 % de conducción del HE 6 | C.5 |
| I.8 | Unifamiliar | La recarga del REBT ya sale del C13; HE 6 queda cubierto | El módulo HE 6 debe leer el C13 del REBT y no pedir nada más: «CUMPLE por el circuito C13 (ITC-BT-52 ap. 3.1)» | C.3, H.4 |

---

## Decisiones de producto (lo que el DB no fija)

Todas son **CRITERIO** y se rotulan así en la ficha.

| # | Caso | Supuesto propuesto | Por qué |
|---|---|---|---|
| K-HE6.1 | Ámbito en la app | Obra nueva: aplica si hay **cualquier plaza**, interior o exterior adscrita. Los cinco supuestos de existentes, como lista de comprobación con aviso «la app calcula obra nueva» | A.1–A.7 |
| K-HE6.2 | Qué plazas se cuentan | **Interiores + exteriores adscritas**, de automóvil. El «uso Aparcamiento» del DB-SI no sirve aquí | B.2, C.17 |
| K-HE6.3 | Exclusión a) en edificios mixtos | Solo si el edificio **no tiene** unidades de uso residencial privado y tiene **≤ 10 plazas** en total. Un mixto con viviendas no se excluye por a) | B.1, B.6 |
| K-HE6.4 | Estaciones en plazas accesibles | **⌈Nacc/5⌉**, dentro del total: estaciones mínimas = máx(⌈N/40⌉ (o ⌈N/20⌉ AGE); ⌈Nacc/5⌉). Rotular: «el DB no dice "o fracción"; se toma por exceso». Nacc = máx(mínimo del SUA 9 ap. 1.2.3; dato del proyecto). Solo en usos distintos del residencial privado | C.7–C.9, C.11 |
| K-HE6.5 | Plazas con estación y el 20 % | **Cuentan** como plazas con conducción | C.16 |
| K-HE6.6 | Motos y bicicletas | No cuentan. Solo plazas de automóvil | C.17 |
| K-HE6.7 | Uso característico del mixto | El que ya fija El edificio. Zonas «no diferenciadas» por defecto; si el usuario las diferencia, pide el reparto de plazas por uso | D.1–D.4 |
| K-HE6.8 | Esquema por defecto | Viviendas: **1a**. Otros usos: **4b**. Unifamiliar: **4a** (obligado). **Un solo dato** con el módulo REBT | E.4, E.8, H.6 |
| K-HE6.9 | Tipo y potencia de estación | **SAVE, modo 3, base tipo 2, 230 V, 16 A, 3 680 W.** Alternativas: 7 360 W (32 A) y 11 085 W (16 A trifásico). El REBT lee este dato para P5 en otros usos | F.8, F.9, I.5 |
| K-HE6.10 | Titularidad AGE | Decisión explícita, «no» por defecto. Solo Administración General del Estado y sus organismos; **no** comunidades autónomas ni ayuntamientos | C.6 |
| K-HE6.11 | Conducción en otros usos por defecto | Exactamente ⌈N/5⌉ plazas, con un campo para declarar más | C.5 |
| K-HE6.12 | Veredicto | **CUMPLE** si: conducción ≥ mínimo **y** estaciones ≥ mínimo **y** estaciones en plazas accesibles ≥ ⌈Nacc/5⌉. **NO APLICA** si no hay aparcamiento o si cae en la exclusión a) | C.1–C.9 |

---

## Cifras para el código

```text
# DB-HE, Sección HE 6 — introducida por RD 450/2022 (BOE 15-06-2022);
# consolidado 14-06-2022 + corr. errores 02-02-2023 (solo cursivas). Imagen pp. 33–34.
HE6.ambito.requiere            = plazasInteriores + plazasExterioresAdscritas > 0   # ap.1 pto1
HE6.existentes.ampliacion      = {incrementoSupOVol: ">10 %", supUtilAmpliada_m2: ">50"}   # + intervención en aparcamiento
HE6.existentes.reforma         = {envolventeRenovada: ">25 %"}                            # + intervención en aparcamiento
HE6.existentes.electrica       = {potenciaAfectada: ">50 %"}   # edificio (aparc. interior + derecho) o aparcamiento
HE6.exclusion.a                = usoDistintoResidencialPrivado && plazas <= 10       # también obra nueva
HE6.exclusion.b                = existente && (noResidencial && plazas <= 20 || residencialPrivado) && coste > 0.07 * PEM
HE6.residencial.conduccion     = N                                  # 100 % (ap.3 pto1); 0 estaciones
HE6.otros.conduccionMin        = ceil(N / 5)                        # «al menos el 20 %»; NO usar ceil(0.2*N)
HE6.otros.estaciones           = ceil(N / 40)                       # «o fracción»
HE6.otros.estacionesAGE        = ceil(N / 20)                       # sustituye a la anterior
HE6.otros.estacionesAccesibles = ceil(Nacc / 5)                     # CRITERIO (el DB no dice «o fracción»); computan
HE6.otros.estacionesMin        = max(estaciones(AGE?), estacionesAccesibles)
HE6.mixto.noDiferenciado       = criterio del uso característico   # ap.3 pto3

# DB-SUA, SUA 9 ap. 1.2.3 (imagen p.32) — Nacc mínimo
SUA9.residencialVivienda       = 1 por vivienda accesible para silla de ruedas
SUA9.otros.siConstruida_m2     = ">100"
SUA9.residencialPublico        = 1 por alojamiento accesible
SUA9.comercialPCAparcPublico   = ceil(N / 33)
SUA9.otrosUsos                 = N <= 200 ? ceil(N / 50) : 4 + ceil((N - 200) / 100)   # = plazasAccesiblesOtrosUsos()
SUA.anejoA.recargaAccesible    = {altura_cm: [80, 120], aRincon_min_cm: 35, contrasteCromatico: true}

# REBT, ITC-BT-52 (consolidado BOE-A-2002-18099, últ. modif. 03-09-2025)
BT52.reserva.modulos           = max(1, ceil(plazasNoAsociadas / 5))   # ap.3.2 b)
BT52.tomas.alturaMin_cm        = 60 ; usoPublico.alturaMax_cm = 120    # ap.5.4 (texto)
BT52.tipo2.desde_kW            = 3.7   # > 3,7 kW c.a.: al menos tipo 2

# Criterios del producto (NO son del CTE)
crit.estacion                  = {tipo: "SAVE", modo: 3, base: "tipo 2", U_V: 230, I_A: 16, P_W: 3680}
crit.estacion.alternativas_W   = [7360, 11085]
crit.esquema                   = {viviendas: "1a", otros: "4b", unifamiliar: "4a"}
crit.plazas                    = interiores + exterioresAdscritas (solo automóvil)
crit.estacionesConConduccion   = cuentan en el 20 %
crit.exclusionA.mixto          = no se aplica si hay unidades de uso residencial privado

# Ejemplos (tests)
oficinas N=10  -> excluido
oficinas N=11  -> conduccion 3, estaciones 1 (1 en plaza accesible)
oficinas N=15  -> conduccion 3 (no 4)
oficinas N=41  -> conduccion 9, estaciones 2
oficinas N=250 -> conduccion 50, estaciones 7, Nacc 5, accesibles 1
comercial N=100 -> conduccion 20, estaciones 3, Nacc 4, accesibles 1
AGE N=50       -> conduccion 10, estaciones 3
N=40, Nacc=12  -> estaciones 3 (manda la de accesibles)
viviendas N=30 -> conduccion 30, estaciones 0; REBT P5 = 0,1·30·3680 = 11 040 W
```

---

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Ámbito y exclusiones | DB-HE | Sección HE 6 (RD 450/2022), consolidado | 2022-06-14 | HE 6 ap. 1 ptos 1 y 2 | — | codigotecnico.org, DBHE.pdf p. 33 (imagen) |
| Dotaciones | DB-HE | ídem | 2022-06-14 | HE 6 ap. 3 ptos 1, 2 y 3 | — | DBHE.pdf p. 34 (imagen) |
| Justificación | DB-HE | ídem | 2022-06-14 | HE 6 ap. 4 | — | DBHE.pdf p. 34 (imagen) |
| Términos | DB-HE | ídem | 2022-06-14 | Anejo A | — | DBHE.pdf pp. 39, 40, 43 (imagen) |
| Plazas accesibles | DB-SUA | consolidado del repo | — | SUA 9 ap. 1.2.3; Anejo A | — | DBSUA.pdf pp. 32, 37 (imagen) |
| Preinstalación y esquemas | REBT | RD 842/2002, consolidado (3.2 por RD 450/2022) | 2025-09-03 | ITC-BT-52 ap. 2, 3, 3.2 | — | BOE-A-2002-18099 pp. 267, 272, 279–280 (imagen) |
| Tomas | REBT | ídem | 2025-09-03 | ITC-BT-52 ap. 5.4 | Tabla 3 | ídem pp. 283–284 (texto) |

---

## Pendientes

1. **P1 — Renderizar y mirar en imagen** lo que aquí va como «(texto)»: DccHE p. 38 (comentario de accesibilidad), DBHE p. 35, ITC-BT-52 pp. 268, 273–278 (modos 3 y 4; figuras 6 a 12) y 283–284 (ap. 5.4 y tabla 3). En esta sesión no había Python ni `pdftoppm` disponibles para el agente.
2. **P2 — BOE del RD 450/2022 en PDF:** cotejar en la imagen el artículo único («Se incorpora … la sección HE 6»), las disposiciones transitorias (G.4) y el literal del HE 6 frente al consolidado. Ahora se apoya en consultas resumidas de boe.es.
3. **P3 — FAQ del Grupo de Trabajo de Infraestructura de Recarga (IDAE, abril 2024):** descargada en la caché de la sesión, sin poder leerla. Puede resolver C.9 (accesibles, por exceso o por defecto), B.2 (plazas exteriores) y C.16.
4. **P4 — Modelo de El edificio:** falta el dato de plazas exteriores adscritas (I.1), la titularidad AGE (I.2) y el reparto de plazas por uso en mixtos (K-HE6.7).
5. **P5 — Criterios a validar por el responsable:** K-HE6.3 (exclusión en mixtos), K-HE6.4 (⌈Nacc/5⌉), K-HE6.5 (estaciones dentro del 20 %), K-HE6.8 (esquema por defecto) y K-HE6.9 (3 680 W, modo 3, tipo 2).
6. **P6 — `verificacion-sua9.md`, pendiente 5:** se puede cerrar con C.10 (el RD 450/2022 añadió la frase de la recarga en la plaza accesible), tras cotejar P2.

**En el código (feature-24, 2026-10-05):** `src/modules/he6/` aplica K-HE6.1–12 salvo los existentes (solo aviso) y el reparto por usos de K-HE6.7 (aviso «mixto»). Del bloque I: I.1 (plazas exteriores, decisión de HE 6), I.2 (AGE), I.3 (accesibles de SUA 9), I.4 (la tabla `RECARGA_HE6` del REBT desaparece; las cifras viven en `he6/tablas.ts`), I.5 (P5 = estaciones × potencia de HE 6), I.6 (el uso sale de El edificio, no de la clasificación eléctrica) y I.8 (unifamiliar por el C13) están hechos. I.7 (módulos de reserva con `ceil(n/5)`) queda como estaba. El comentario de DccHE p. 38 se ha releído en texto (2026-10-05): no resuelve el redondeo de las accesibles.
