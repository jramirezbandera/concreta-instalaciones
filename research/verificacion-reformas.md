# Verificación normativa — Intervenciones en edificios existentes (reforma, ampliación, cambio de uso) para el asistente de alcance y el motor de aplicabilidad (Fase E)

**Fecha:** 2026-10-09 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** CTE Parte I (art. 1.4, art. 2, art. 8.2, Anejo I y Anejo III); criterios para edificios existentes de las Introducciones del DB-HE, DB-HS, DB-SI, DB-SUA y DB-HR; ámbitos de aplicación de HE 0, HE 1, HE 4, HE 5, HE 6, HS 1 a HS 6, SI, SUA y HR para intervenciones; REBT art. 2 e ITC-BT-04 ap. 3.2 y 4. Comentarios del Ministerio (DccHE, DccHS, DccSI, DccSUA, DccHR) y Guía de aplicación del DB-HR (V.03) como contraste. Bloques A a F del encargo, en ese orden.

**Regla aplicada.** En esta sesión **no hay `pdftoppm` ni Bash**: no se han podido renderizar páginas de los PDF de `research/pdf`. Se ha trabajado así:
- **CTE Parte I**: descargada de codigotecnico.org (`/pdf/Documentos/Parte1/Parte_I_jun2022.pdf`) y **leída en imagen, página a página** (27 pp.). → **VERIFICADO (imagen)**.
- **Guía de aplicación del DB-HR V.03, cap. 2.0** (pp. 19–22): descargada de codigotecnico.org y leída en imagen. → **LEÍDO (Guía, imagen)**.
- **DB-HE, DB-HS, DB-SI, DB-SUA, DB-HR, REBT y sus Dcc**: literal leído en el **texto extraído con `pdftotext`** de los mismos PDF de `research/pdf` en sesiones anteriores (volcados con marca de página `PAGE n` / `PÁGINA n` en los scratchpads de esas sesiones). La página que se cita es la del PDF, que en todos estos documentos coincide con el folio impreso (comprobado en los volcados). → **VERIFICADO (texto)**. DB-HR p. 3 ya estaba **VERIFICADO (imagen)** en `verificacion-hr.md` A.7.
- **BOE** (consolidado del RD 314/2006 y RD 732/2019): consulta resumida por web. → **LEÍDO (web)**; cotejar antes de citar el literal.

Veredictos:
- **VERIFICADO (imagen)** / **VERIFICADO (texto)**: literal de la norma, con página.
- **LEÍDO (comentario)**: DB con comentarios del Ministerio. «Los comentarios tienen un carácter orientativo e informativo no teniendo carácter reglamentario». Se puede mostrar, rotulado.
- **LEÍDO (Guía)**: guía del Ministerio, no reglamentaria.
- **LEÍDO (web)**: boe.es, consulta resumida.
- **CORREGIDO**: el encargo o una fuente previa del repo no coincide con la fuente.
- **INTERPRETACIÓN**: se sigue de la norma, pero la norma no lo escribe tal cual.
- **NO LO FIJA LA NORMA → CRITERIO**: decisión de producto, rotulada como tal.
- **NO VERIFICADO**: no se ha podido leer en fuente oficial en esta sesión.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [PI22] | CTE **Parte I**, texto consolidado del Ministerio | **14 junio 2022** (portada). p. 2: RD 314/2006; RD 1371/2007; corr. errores RD 314/2006 (BOE 25/01/2008); RD 173/2010; RD 410/2010; STS 4/5/2010; **RD 732/2019**; **RD 450/2022**. «Este texto consolidado no tiene valor jurídico.» | codigotecnico.org `/pdf/Documentos/Parte1/Parte_I_jun2022.pdf`. Copia descargada en `C:\Users\javie\.claude\projects\d--PROGRAMACION-Instalaciones\5c467a85-1121-42c0-8aa8-ce92f02fd91e\tool-results\webfetch-1791544122424-yzv084.pdf` (**pendiente de copiar a `research/pdf/CTE_ParteI.pdf`**: el agente no puede copiar binarios) | Imagen, pp. 1–27 |
| [BOE-PI] | RD 314/2006, consolidado BOE-A-2006-5515 | Art. 2: «última actualización 27/06/2013» | boe.es `act.php?id=BOE-A-2006-5515` | LEÍDO (web) |
| [RD732] | RD 732/2019 | BOE-A-2019-18528 | boe.es | LEÍDO (web): solo toca de la Parte I el art. 13 (HS 6), el art. 15 y la definición «Demanda energética» del Anejo III |
| [HE22] | DB-HE, consolidado | 14 junio 2022 (RD 732/2019, RD 450/2022 y su corr. 02/02/2023) | `research/pdf/DBHE.pdf` | Texto: pp. 2, 4, 5, 9, 15–18, 28, 31, 33, 36, 41 |
| [DccHE] | DB-HE con comentarios | Articulado 14-06-2022; comentarios 22-12-2023 | `research/pdf/DccHE.pdf` | Texto: pp. 5, 9, 16–19, 31, 35, 37 |
| [HS22] | DB-HS, consolidado | 14 junio 2022 (incl. FOM/588/2017, RD 732/2019, RD 450/2022) | `research/pdf/DBHS.pdf` | Texto: pp. 2–5, 10, 52, 63, 81, 111, 138–141 |
| [DccHS] | DB-HS con comentarios | Articulado 14-06-2022; comentarios 12-02-2025 | `research/pdf/DccHS.pdf` | Texto: pp. 10–11, 88, 119, 146 |
| [SI25] | DB-SI, consolidado | **4 marzo 2025** (RD 164/2025, BOE 10/04/2025) | `research/pdf/DBSI.pdf` | Texto: pp. 2, 4, 5, 6 |
| [DccSI] | DB-SI con comentarios | 4 marzo 2025 | `research/pdf/DccSI.pdf` | Texto: pp. 5–9 |
| [SUA22] | DB-SUA, consolidado | 14 junio 2022 | `research/pdf/DBSUA.pdf` | Texto: pp. 2, 4, 5, 13 |
| [DccSUA] | DB-SUA con comentarios | Articulado 14-06-2022; comentarios 15-07-2024 | `research/pdf/DccSUA.pdf` | Texto: pp. 5–11, 54 |
| [HR19] | DB-HR, consolidado | 20 diciembre 2019 | `research/pdf/DBHR.pdf` | p. 3 imagen (sesión HR); p. 4 texto |
| [DccHR] | DB-HR con comentarios | 20-12-2019 | `research/pdf/DccHR.pdf` | Texto: sin comentario a la exclusión d) |
| [GuíaHR] | Guía de aplicación del DB-HR | **V.03, diciembre 2016** | codigotecnico.org, cap. 2.0 (`/pdf/GuiasyOtros/GuiaHR/03_Capitulo2_0_...pdf`); es el mismo documento que `research/pdf/GUIA_DBHR_201612.pdf` | Imagen, pp. 19–22 |
| [REBT] | RD 842/2002, consolidado BOE-A-2002-18099 | Últ. modif. 03-09-2025 | `research/pdf/REBT.pdf` | Texto: pp. 8–9 (art. 2), 53 (ITC-BT-04) |
| — | Guía DB-HE 2019 (cap. HE 1), DA DB-SUA/2, Guía técnica del articulado del REBT | — | No legibles en esta sesión (sin renderizador) o no disponibles en local | **No leídos.** Solo se citan a través de los comentarios del Ministerio |
| — | RD 1048/2013 | — | `research/pdf/RD1048_2013.pdf` | No aporta nada a intervenciones en edificios (no se usa) |

### Correcciones al encargo y avisos (resumen; el detalle va en cada bloque)

1. **El art. 2 de la Parte I no lo tocó el RD 732/2019.** Su redacción es la de la **Ley 8/2013** (disposición final undécima); el BOE lo da con «última actualización 27/06/2013» y el RD 732/2019 solo modifica de la Parte I el art. 13, el art. 15 y la definición «Demanda energética» (LEÍDO web). Los comentarios del Ministerio lo confirman: «mediante la modificación del artículo 2 de la Parte I del CTE introducida por la Ley 8/2013 de 26 de junio» ([DccSI] p. 5; [DccSUA] p. 6). Aviso: la lista de disposiciones de [PI22] p. 2 **no menciona** la Ley 8/2013. (A.1)
2. **Numeración del cambio de uso.** En el consolidado del Ministerio es el **art. 2 apartado 5** ([PI22] p. 6). En el consolidado del BOE es el **apartado 6**, con el 5 «(Derogado)» y el 7 «(Anulado)» (LEÍDO web). Los comentarios del Ministerio citan «punto 5». Recomendación: en la memoria citar «CTE Parte I, art. 2 (cambio de uso)», sin número. (A.6, K-REF.2)
3. **El Anejo III de la Parte I no define** «cambio de uso» (solo lo enumera), «uso característico», «reforma integral», «rehabilitación integral» ni «envolvente». Sí define «Intervención en los edificios existentes» (ampliación, reforma, cambio de uso), «Mantenimiento», «Cerramiento», «Particiones interiores», «Uso del edificio» y «Uso previsto». (A.9–A.15)
4. **Solo DB-HE, DB-SI y DB-SUA** traen criterios propios para edificios existentes en su Introducción. **DB-HS y DB-HR no**: para ellos rige el art. 2.3 de la Parte I. (B)
5. **HS 4 y HS 5** incluyen las intervenciones en instalaciones existentes **solo «cuando se amplía el número o la capacidad de los aparatos receptores»**. Una reforma de fontanería que no añade ni agranda aparatos queda, leída a contrario, fuera del ámbito literal. (C.HS4)
6. **DB-HR:** la exclusión d) nombra «ampliación, modificación, reforma o rehabilitación», **no el cambio de uso**. La Guía DB-HR lo trata como intervención excluida, pero **recomienda** adecuar todo el edificio en un cambio de uso característico y aplicar el DB en los cambios de uso a vivienda. La Guía es además la **única fuente oficial** que dice qué es una «reforma o rehabilitación integral». La regla actual de `aplicabilidad.ts` (HR `no_aplica` en todo `intervencion !== "obra_nueva"`, también en `cambio_uso`) es demasiado amplia. (C.HR)
7. **HE 1 en reformas:** K y control solar solo si se renueva **más del 25 %** de la superficie total de la envolvente térmica **final**. Ulim, solo en los elementos que se sustituyen, incorporan o modifican sustancialmente, o que empeoran sus condiciones. n50 solo en edificios nuevos. (C.HE1)
8. **HE 0 en reformas** exige las dos cosas a la vez: renovar la generación térmica **y** más del 25 % de la envolvente. Entonces aplica al **conjunto del edificio**. (C.HE0)
9. Los comentarios del DB-SI hablan de los criterios «6, 7 y 8» de la Introducción III ([DccSI] p. 9). Es **numeración antigua**: hoy son los criterios **9, 10 y 11** ([SI25] p. 6). (B.SI)

---

## Bloque A — CTE Parte I

### A.1 Artículo 2. Ámbito de aplicación (literal completo)

| # | Afirmación | Veredicto | Cita exacta | Fuente |
|---|---|---|---|---|
| A.1 | Ap. 1: regla general | VERIFICADO (imagen) | «1. El CTE será de aplicación, en los términos establecidos en la LOE y con las limitaciones que en el mismo se determinan, a las edificaciones públicas y privadas cuyos proyectos precisen disponer de la correspondiente licencia o autorización legalmente exigible.» | [PI22] p. 5 |
| A.2 | Ap. 2: obra nueva | VERIFICADO (imagen) | «2. El CTE se aplicará a las obras de edificación de nueva construcción, excepto a aquellas construcciones de sencillez técnica y de escasa entidad constructiva, que no tengan carácter residencial o público, ya sea de forma eventual o permanente, que se desarrollen en una sola planta y no afecten a la seguridad de las personas.» | [PI22] p. 5 |
| A.3 | Ap. 3, párrafo 1: intervenciones en existentes y dónde se justifican | VERIFICADO (imagen) | «3 Igualmente, el Código Técnico de la Edificación se aplicará también a intervenciones en los edificios existentes y su cumplimiento se justificará en el proyecto o en una memoria suscrita por técnico competente, junto a la solicitud de licencia o de autorización administrativa para las obras. En caso de que la exigencia de licencia o autorización previa sea sustituida por la de declaración responsable o comunicación previa, de conformidad con lo establecido en la normativa vigente, se deberá manifestar explícitamente que se está en posesión del correspondiente proyecto o memoria justificativa, según proceda.» | [PI22] p. 5 |
| A.4 | Ap. 3, párrafo 2: **flexibilidad** (cuatro causas) | VERIFICADO (imagen) | «Cuando la aplicación del Código Técnico de la Edificación no sea urbanística, técnica o económicamente viable o, en su caso, sea incompatible con la naturaleza de la intervención o con el grado de protección del edificio, se podrán aplicar, bajo el criterio y responsabilidad del proyectista o, en su caso, del técnico que suscriba la memoria, aquellas soluciones que permitan el mayor grado posible de adecuación efectiva.» | [PI22] p. 5 |
| A.5 | Ap. 3, párrafo 3: **qué debe constar** en proyecto y en la documentación final | VERIFICADO (imagen) | «La posible inviabilidad o incompatibilidad de aplicación o las limitaciones derivadas de razones técnicas, económicas o urbanísticas se justificarán en el proyecto o en la memoria, según corresponda, y bajo la responsabilidad y el criterio respectivo del proyectista o del técnico competente que suscriba la memoria. En la documentación final de la obra deberá quedar constancia del nivel de prestación alcanzado y de los condicionantes de uso y mantenimiento del edificio, si existen, que puedan ser necesarios como consecuencia del grado final de adecuación efectiva alcanzado y que deban ser tenidos en cuenta por los propietarios y usuarios.» | [PI22] p. 5 |
| A.5b | Ap. 3, párrafo 4: **no empeoramiento** | VERIFICADO (imagen) | «En las intervenciones en los edificios existentes no se podrán reducir las condiciones preexistentes relacionadas con las exigencias básicas, cuando dichas condiciones sean menos exigentes que las establecidas en los documentos básicos del Código Técnico de la Edificación, salvo que en éstos se establezca un criterio distinto. Las que sean más exigentes, únicamente podrán reducirse hasta los niveles de exigencia que establecen los documentos básicos.» | [PI22] p. 5 |
| A.5c | Ap. 4: **estructura** | VERIFICADO (imagen) | «4. En las intervenciones en edificios existentes el proyectista deberá indicar en la documentación del proyecto si la intervención incluye o no actuaciones en la estructura preexistente; entendiéndose, en caso negativo, que las obras no implican el riesgo de daño citado en el artículo 17.1,a) de la Ley 38/1999, de 5 de noviembre, de Ordenación de la Edificación.» | [PI22] p. 5 |
| A.6 | Ap. 5 (Ministerio) / ap. 6 (BOE): **cambio de uso** | VERIFICADO (imagen) + LEÍDO (web, numeración) | «5 En todo cambio de uso característico de un edificio existente se deberán cumplir las exigencias básicas del CTE. Cuando un cambio de uso afecte únicamente a parte de un edificio o de un establecimiento, se cumplirán dichas exigencias en los términos en que se establece en los Documentos Básicos del CTE.» En el BOE este párrafo es el **ap. 6**; el 5 figura «(Derogado)» y el 7 «(Anulado)» | [PI22] p. 6; [BOE-PI] |
| A.7 | Art. 1.4: las exigencias rigen también en intervenciones | VERIFICADO (imagen) | «4. Las exigencias básicas deben cumplirse, de la forma que reglamentariamente se establezca, en el proyecto, la construcción, el mantenimiento, la conservación y el uso de los edificios y sus instalaciones, así como en las intervenciones en los edificios existentes.» | [PI22] p. 5 |
| A.8 | **Edificios protegidos** | VERIFICADO (imagen) + INTERPRETACIÓN | El art. 2 **no los excluye**: solo los cita como causa de flexibilidad («incompatible … con el grado de protección del edificio», A.4). Las exclusiones por protección están en cada DB (HE 0, HE 1 y HE 6 ap. 1 pto 2; DB-HR II d; flexibilidad del DB-SI y DB-SUA). Ver B y C | [PI22] p. 5 |

### A.2 Anejo III. Terminología

| # | Término | Veredicto | Literal | Fuente |
|---|---|---|---|---|
| A.9 | Intervención en los edificios existentes | VERIFICADO (imagen) | «Se consideran intervenciones en los edificios existentes, las siguientes: a) Ampliación: Aquellas en las que se incrementa la superficie o el volumen construidos. b) Reforma: Cualquier trabajo u obra en un edificio existente distinto del que se lleve a cabo para el exclusivo mantenimiento del edificio. c) Cambio de uso.» | [PI22] p. 24 |
| A.10 | Mantenimiento | VERIFICADO (imagen) | «Conjunto de trabajos y obras a efectuar periódicamente para prevenir el deterioro de un edificio o reparaciones puntuales que se realicen en el mismo, con el objeto mantenerlo en buen estado para que, con una fiabilidad adecuada, cumpla con los requisitos básicos de la edificación establecidos.» | [PI22] p. 24 |
| A.11 | Cambio de uso | VERIFICADO (imagen) que **no se define** | Solo aparece como letra c) de «Intervención». DccHE: «Puede entenderse por cambio de uso tanto el referido al uso característico del edificio como el referido a una o varias unidades de uso y, por reforma, toda aquella intervención en edificios existentes que no consista en una ampliación o en un cambio de uso» (LEÍDO comentario) | [PI22] p. 24; [DccHE] pp. 9, 16 |
| A.12 | Uso característico | VERIFICADO (imagen) que **no se define** en la Parte I | La Parte I define «Uso del edificio» («Actividades que se realizan en un edificio, o determinadas zonas de un edificio, después de su puesta en servicio.») y «Uso previsto» («Uso específico para el que se proyecta y realiza un edificio y que se debe reflejar documentalmente. El uso previsto se caracteriza por las actividades que se han de desarrollar en el edificio y por el tipo de usuario.»). Comentarios: «Los únicos DBs que establecen expresamente los usos característicos que consideran y que los definen en sus anejos de terminología son el DB SI y el DB SUA» ([DccSUA] p. 8); el DB-HE «a la hora de contemplar un cambio de uso debe remitirse a la clasificación de usos que resulte de la aplicación de las normas urbanísticas» ([DccHE] p. 9) | [PI22] p. 26; [DccSUA] p. 8; [DccHE] p. 9 |
| A.13 | Reforma integral / rehabilitación integral | **NO LO DEFINE la Parte I ni ningún DB** | Búsqueda en la imagen del Anejo III (pp. 23–27): no está. En el DB-HR solo aparece en la exclusión d); en HE 4 y HE 5 se dice «se reforme íntegramente». Única definición oficial encontrada, **no reglamentaria**: Guía DB-HR: «La reforma o rehabilitación integral, es decir, las obras en las que se modifican sustancialmente y de forma simultánea en los recintos particiones, forjados y envolvente» (LEÍDO Guía, imagen) | [PI22] pp. 23–27; [GuíaHR] p. 20 |
| A.14 | Cerramiento / Particiones interiores | VERIFICADO (imagen) | «Cerramiento: Elemento constructivo del edificio que lo separa del exterior, ya sea aire, terreno u otros edificios.» · «Particiones interiores: Elemento constructivo del edificio que divide su interior en recintos independientes. Pueden ser verticales u horizontales (suelos y techos).» El DB-HE añade a ambas, en su Anejo A: «En la intervención en edificios existentes, cuando un elemento de cerramiento separe una zona ampliada respecto a otra existente, se considerará perteneciente a la zona ampliada» | [PI22] pp. 23, 25; [HE22] pp. 36, 41 |
| A.15 | «Envolvente» / «envolvente térmica» | VERIFICADO (imagen) que **no está** en la Parte I | Es término del DB-HE (Anejo A y Anejo C). Ver `verificacion-he1-v4.md` | [PI22] pp. 23–27 |

### A.3 Otros artículos que tocan a las intervenciones

| # | Afirmación | Veredicto | Cita | Fuente |
|---|---|---|---|---|
| A.16 | Libro del Edificio: documentar reparaciones, reformas y rehabilitaciones | VERIFICADO (imagen) | Art. 8.2 pto 2 c): «documentar a lo largo de la vida útil del edificio todas las intervenciones, ya sean de reparación, reforma o rehabilitación realizadas sobre el mismo, consignándolas en el Libro del Edificio.» | [PI22] p. 11 |
| A.17 | Contenido del proyecto en existentes | VERIFICADO (imagen) | Anejo I, Memoria 1.2 Información previa: «Datos del edificio en caso de rehabilitación, reforma o ampliación. Informes realizados.» · II. Planos: «En caso de obras de rehabilitación se incluirán planos del edificio antes de la intervención.» | [PI22] pp. 17, 19 |
| A.18 | Soluciones alternativas | VERIFICADO (imagen) | Art. 5.1 pto 3 b): «soluciones alternativas, entendidas como aquéllas que se aparten total o parcialmente de los DB. El proyectista o el director de obra pueden, bajo su responsabilidad y previa conformidad del promotor, adoptar soluciones alternativas, siempre que justifiquen documentalmente que el edificio proyectado cumple las exigencias básicas del CTE porque sus prestaciones son, al menos, equivalentes a los que se obtendrían por la aplicación de los DB.» **No es lo mismo que la flexibilidad** del art. 2.3: la solución alternativa iguala la prestación; la flexibilidad admite una prestación menor, justificada | [PI22] p. 7 |

### A.4 ¿Qué obras quedan fuera del CTE?

| # | Caso | Veredicto | Valor | Fuente |
|---|---|---|---|---|
| A.19 | Mantenimiento y reparaciones puntuales | VERIFICADO (definiciones) + LEÍDO (comentario, conclusión) | No son «reforma» (A.9 b: reforma es lo «distinto del que se lleve a cabo para el exclusivo mantenimiento»), y el mantenimiento incluye las «reparaciones puntuales» (A.10). Conclusión de los comentarios del Ministerio, idéntica en SI y SUA: «En consecuencia, en una obra que conforme a lo anterior sea de mantenimiento no es exigible la aplicación del CTE.» Ejemplos de los comentarios: reparar bovedillas desmontando y reponiendo el falso techo ([DccSI] p. 9); sustituir una baldosa ([DccSUA] p. 10); sellar grietas y juntas, limpiar aberturas de ventilación de una cámara frente al radón ([DccHS] p. 146) | [PI22] p. 24; [DccSI] pp. 8–9; [DccSUA] pp. 10–11; [DccHS] p. 146 |
| A.20 | Construcciones de sencillez técnica (obra nueva) | VERIFICADO (imagen) | Art. 2.2 (A.2). No es un supuesto de intervención | [PI22] p. 5 |
| A.21 | Cambio de actividad sin obra y sin cambio de uso | LEÍDO (comentario) | «La competencia para regular los cambios de actividad y las legalizaciones es de los ayuntamientos … No obstante, cuando un cambio de actividad vaya acompañado de una obra de reforma o de un cambio de uso característico se debe aplicar el CTE en la forma establecida en este.» Ejemplos: zapatería → papelería no cambia el uso (Comercial); zapatería → bar sí (Pública Concurrencia). Una consulta profesional dentro de una vivienda que sigue siéndolo no es cambio de uso; toda la vivienda dedicada a la actividad, sí | [DccSI] pp. 6, 8; [DccSUA] pp. 8–9 |
| A.22 | Cambio de uso **sin obras** | LEÍDO (comentario) | Sí entra: «cuando se cambie el uso característico de un edificio o de un establecimiento, este debe adecuarse a las condiciones de este DB, aun cuando no estuviera previsto realizar obras» | [DccSUA] p. 8 |
| A.23 | Local sin uso que se acondiciona | LEÍDO (comentario) | No es reforma: «Un local diáfano sin ningún uso declarado es, a efectos del CTE, una obra inacabada» y se le aplica el CTE vigente al pedir la licencia de terminación ([DccSI] p. 6; [DccSUA] p. 9). Para el DB-HE, «El acondicionamiento de locales sin uso previamente definido, en los que no se aumenta el volumen o la superficie construida, se considera un cambio de uso» ([DccHE] p. 9) | [DccSI] p. 6; [DccSUA] p. 9; [DccHE] p. 9 |
| A.24 | Rehabilitación total con primera actividad | LEÍDO (comentario) | «Un establecimiento nuevo resultante de la rehabilitación total de un edificio y que tiene su primera actividad no se considera cambio de uso sino obra nueva.» | [DccSUA] p. 9 |
| A.25 | Bajo cubierta (trasteros) convertido en viviendas | LEÍDO (comentario) | «tiene la consideración de obra de ampliación» (SUA) y, como aumenta la altura de evacuación, el edificio debe adecuarse al DB-SI en lo asociado a la nueva altura | [DccSUA] p. 9 |

### A.5 Regla tabulable (bloque A)

- **R-A1** (alcance general): obra nueva → todo aplica; intervención → se aplica el CTE con los ámbitos de cada DB (A.3, A.7).
- **R-A2** (mantenimiento): si el usuario declara que la obra es **solo mantenimiento o reparación puntual**, todas las justificaciones → `no_aplica` con el párrafo D.0.1. Pregunta P1.
- **R-A3** (cambio de uso característico): todas las exigencias básicas → `aplica` al edificio, salvo donde el ámbito del propio DB diga otra cosa (HS 2, HE 0, HE 4, HE 5, HE 6, HR). Pregunta P3.
- **R-A4** (cambio de uso parcial): «en los términos en que se establece en los Documentos Básicos» → regla de cada DB (bloque C).
- **R-A5** (estructura): la respuesta a P9 decide `dbse` y entra en la memoria con el literal del art. 2.4 (D.0.4).
- **R-A6** (siempre en intervenciones): párrafo de no empeoramiento (A.5b) y, si hay flexibilidad, párrafos de justificación y de documentación final (A.4, A.5).

---

## Bloque B — Criterios generales de cada DB para edificios existentes

### B.HE — DB-HE, Introducción IV (tres criterios)

| # | Afirmación | Veredicto | Cita exacta | Fuente |
|---|---|---|---|---|
| B.1 | Criterio 1: no empeoramiento | VERIFICADO (texto) | «Salvo en los casos en los que un DB establezca un criterio distinto, las condiciones preexistentes que sean menos exigentes que las establecidas en algún DB no se podrán reducir, y las que sean más exigentes únicamente podrán reducirse hasta el nivel establecido en el correspondiente DB.» | [HE22] p. 5 |
| B.2 | Criterio 2: flexibilidad (cuatro casos propios del DB-HE) | VERIFICADO (texto) | «En los casos en los que no sea posible alcanzar el nivel de prestación establecido con carácter general en este DB, podrán adoptarse soluciones que permitan el mayor grado de adecuación posible, determinándose el mismo, siempre que se dé alguno de los siguientes casos: a) en edificios con valor histórico o arquitectónico reconocido, cuando otras soluciones pudiesen alterar de manera inaceptable su carácter o aspecto, o; b) la aplicación de otras soluciones no suponga una mejora efectiva en las prestaciones relacionadas con el requisito básico de "Ahorro de energía", o; c) otras soluciones no sean técnica o económicamente viables, o; d) otras soluciones impliquen cambios sustanciales en elementos de la envolvente térmica o en las instalaciones de generación térmica sobre los que no se fuera a actuar inicialmente.» | [HE22] p. 5 |
| B.3 | Criterio 2: qué hay que dejar escrito | VERIFICADO (texto) | «En el proyecto debe justificarse el motivo de la aplicación de este criterio de flexibilidad. En la documentación final de la obra debe quedar constancia del nivel de prestación alcanzado y los condicionantes de uso y mantenimiento, si existen.» | [HE22] p. 5 |
| B.4 | Criterio 3: reparación de daños | VERIFICADO (texto) | «Los elementos de la parte existente no afectados por ninguna de las condiciones establecidas en este DB, podrán conservarse en su estado actual siempre que no presente, antes de la intervención, daños que hayan mermado de forma significativa sus prestaciones iniciales. Si el edificio presenta daños relacionados con el requisito básico de "Ahorro de energía", la intervención deberá contemplar medidas específicas para su resolución.» | [HE22] p. 5 |
| B.5 | Comentarios a la Introducción IV | VERIFICADO (texto) que **no hay** | [DccHE] p. 5 reproduce los tres criterios sin comentario | [DccHE] p. 5 |

### B.HS — DB-HS

| # | Afirmación | Veredicto | Valor | Fuente |
|---|---|---|---|---|
| B.6 | ¿Criterios propios para existentes? | VERIFICADO (texto) que **no hay** | La Introducción del DB-HS solo tiene I Objeto, II Ámbito («El ámbito de aplicación en este DB se especifica, para cada sección de las que se compone el mismo, en sus respectivos apartados.»), III Criterios generales (soluciones alternativas, Catálogo, normas), IV Condiciones particulares y V Terminología. Sin no empeoramiento, sin flexibilidad, sin reparación de daños. **Rige el art. 2.3 de la Parte I** (A.4–A.5b) | [HS22] pp. 3–5 |
| B.7 | Comentario HS 6 | LEÍDO (comentario) | «Se recuerda que en las intervenciones en edificaciones existentes es de aplicación el criterio de flexibilidad el artículo 2 de la Parte I del CTE sobre mayor grado de adecuación efectiva.» | [DccHS] p. 146 |

### B.SI — DB-SI, Introducción III

| # | Afirmación | Veredicto | Cita exacta | Fuente |
|---|---|---|---|---|
| B.8 | Ámbito: el del art. 2 de la Parte I | VERIFICADO (texto) | «El ámbito de aplicación de este DB es el que se establece con carácter general para el conjunto del CTE en su artículo 2 (Parte I) excluyendo los edificios, establecimientos y zonas de uso industrial a los que les sea de aplicación el "Reglamento de seguridad contra incendios en los establecimientos industriales".» | [SI25] p. 4 |
| B.9 | Flexibilidad del DB-SI (solo protegidos en el DB; la Ley 8/2013 la extendió a todo existente) | VERIFICADO (texto) + LEÍDO (comentario) | «Cuando la aplicación de este DB en obras en edificios protegidos sea incompatible con su grado de protección, se podrán aplicar aquellas soluciones alternativas que permitan la mayor adecuación posible, desde los puntos de vista técnico y económico, de las condiciones de seguridad en caso de incendio. En la documentación final de la obra deberá quedar constancia de aquellas limitaciones al uso del edificio que puedan ser necesarias como consecuencia del grado final de adecuación alcanzado y que deban ser tenidas en cuenta por los titulares de las actividades.» Comentario: «Esta condición se ha hecho extensiva, para el conjunto del CTE y de sus requisitos básicos y para todos los edificios existentes, mediante la modificación del artículo 2 de la Parte I del CTE introducida por la Ley 8/2013» | [SI25] p. 4; [DccSI] p. 5 |
| B.10 | Criterio 8: cambio de uso parcial | VERIFICADO (texto) | «Cuando un cambio de uso afecte únicamente a parte de un edificio o de un establecimiento, este DB se debe aplicar a dicha parte, así como a los medios de evacuación que la sirvan y que conduzcan hasta el espacio exterior seguro, estén o no situados en ella. Como excepción a lo anterior, cuando en edificios de uso Residencial Vivienda existentes se trate de transformar en dicho uso zonas destinadas a cualquier otro, no es preciso aplicar este DB a los elementos comunes de evacuación del edificio.» | [SI25] pp. 5–6 |
| B.11 | Criterio 9: reforma con el mismo uso | VERIFICADO (texto) | «En las obras de reforma en las que se mantenga el uso, este DB debe aplicarse a los elementos del edificio modificados por la reforma, siempre que ello suponga una mayor adecuación a las condiciones de seguridad establecidas en este DB.» | [SI25] p. 6 |
| B.12 | Criterio 10: evacuación e instalaciones | VERIFICADO (texto) | «Si la reforma altera la ocupación o su distribución con respecto a los elementos de evacuación, la aplicación de este DB debe afectar también a éstos. Si la reforma afecta a elementos constructivos que deban servir de soporte a las instalaciones de protección contra incendios, o a zonas por las que discurren sus componentes, dichas instalaciones deben adecuarse a lo establecido en este DB.» | [SI25] p. 6 |
| B.13 | Criterio 11: no empeoramiento | VERIFICADO (texto) | «En todo caso, las obras de reforma no podrán menoscabar las condiciones de seguridad preexistentes, cuando éstas sean menos estrictas que las contempladas en este DB.» | [SI25] p. 6 |
| B.14 | Ampliación (comentario) | LEÍDO (comentario) | «En una obra de ampliación de un edificio, a la parte ampliada se le debe aplicar el DB SI como a una obra de nueva planta, pero considerándola parte integrante del edificio ampliado. Por ejemplo, dicha parte deberá contar las instalaciones de protección que sean exigibles conforme a SI 4 al edificio ampliado, aunque no sea obligatorio instalarlas también en la parte preexistente.» A la parte preexistente: elementos que se modifiquen (si mejora), elementos de evacuación que sirvan a la zona ampliada e instalaciones PCI cuyo soporte se afecte «en un grado tal que haga justificable y proporcionada» su actualización. (El comentario dice «puntos 6, 7 y 8»: numeración antigua, hoy 9, 10 y 11) | [DccSI] p. 9 |
| B.15 | Proporcionalidad (comentario) | LEÍDO (comentario) | «Con estos criterios generales no se pretende que cualquier intervención, en la que se mantenga el uso, suponga la total adecuación del edificio al DB (lo que en muchos casos sería imposible) sino que haya proporcionalidad entre el alcance constructivo de la intervención y el grado de mejora de las condiciones de seguridad en caso de incendio que se lleve a cabo.» | [DccSI] p. 8 |
| B.16 | Cambio de perfil de riesgo sin cambio de uso (comentario) | LEÍDO (comentario) | «Este DB también debe aplicarse cuando se modifique el perfil de riesgo del edificio, establecimiento o zona considerada sin que necesariamente se dé un cambio de uso. Puede ser el caso del cambio de una zona de uso público a un uso no público…» | [DccSI] p. 7 |
| B.17 | Escaleras en cambios de uso parciales (comentario) | LEÍDO (comentario) | Con carácter general, las escaleras que sirvan al nuevo establecimiento deben adecuarse en toda su altura (tipo, número, anchura); dada la dificultad, «dicha adecuación podría hacerse sólo hasta la planta o las plantas de acceso al nuevo establecimiento» | [DccSI] p. 8 |

### B.SUA — DB-SUA, Introducción III

| # | Afirmación | Veredicto | Cita exacta | Fuente |
|---|---|---|---|---|
| B.18 | Ámbito: el del art. 2; también a establecimientos | VERIFICADO (texto) | «El ámbito de aplicación de este DB es el que se establece con carácter general para el conjunto del CTE en el artículo 2 de la Parte I.» · «Las exigencias que se establezcan en este DB para los edificios serán igualmente aplicables a los establecimientos.» | [SUA22] p. 4 |
| B.19 | Flexibilidad del DB-SUA (todo existente) y documentación final | VERIFICADO (texto) | «Cuando la aplicación de las condiciones de este DB en obras en edificios existentes no sea técnica o económicamente viable o, en su caso, sea incompatible con su grado de protección, se podrán aplicar aquellas soluciones alternativas que permitan la mayor adecuación posible a dichas condiciones. En la documentación final de la obra deberá quedar constancia de aquellas limitaciones al uso del edificio que puedan ser necesarias como consecuencia del grado final de adecuación alcanzado y que deban ser tenidas en cuenta por los titulares de las actividades.» Nota (1): «En edificios existentes se pueden proponer soluciones alternativas basadas en la utilización de elementos y dispositivos mecánicos capaces de cumplir la misma función.» | [SUA22] pp. 4–5 |
| B.20 | Criterio 2: cambio de uso parcial y ampliación | VERIFICADO (texto) | «Cuando un cambio de uso afecte únicamente a parte de un edificio o cuando se realice una ampliación a un edificio existente, este DB deberá aplicarse a dicha parte, y disponer cuando sea exigible según la Sección SUA 9, al menos un itinerario accesible que la comunique con la vía pública.» | [SUA22] p. 5 |
| B.21 | Criterio 3: reforma con el mismo uso | VERIFICADO (texto) | «En obras de reforma en las que se mantenga el uso, este DB debe aplicarse a los elementos del edificio modificados por la reforma, siempre que ello suponga una mayor adecuación a las condiciones de seguridad de utilización y accesibilidad establecidas en este DB.» | [SUA22] p. 5 |
| B.22 | Criterio 4: no empeoramiento | VERIFICADO (texto) | «En todo caso, las obras de reforma no podrán menoscabar las condiciones de seguridad de utilización y accesibilidad preexistentes, cuando éstas sean menos estrictas que las contempladas en este DB.» | [SUA22] p. 5 |
| B.23 | Elementos «afectados» aunque no se toquen (comentario) | LEÍDO (comentario) | El criterio 3 alcanza a los elementos que se sustituyen, incorporan o modifican sustancialmente, «así como para aquellos que, aun no estando prevista su adecuación, vean modificadas las exigencias que tienen que cumplir como consecuencia de la intervención». Ejemplos: ampliar un desnivel obliga a revisar la barrera; ampliar usuarios puede obligar a ensanchar la escalera; adaptar un aseo sin acceso accesible no es mejora efectiva y «no sería exigible» | [DccSUA] p. 10 |
| B.24 | Ajustes razonables | LEÍDO (comentario) | **No es una exigencia del CTE**: «El mandato de que los edificios existentes se adecuen a las condiciones básicas de accesibilidad en aquello que sea susceptible de ajustes razonables antes del 4 de diciembre de 2017 no se establece en el CTE DB SUA, sino el Real Decreto Legislativo 1/2013» | [DccSUA] p. 5 |
| B.25 | DA DB-SUA/2 «Adecuación efectiva de las condiciones de accesibilidad en edificios existentes» | LEÍDO (comentario) + **NO VERIFICADO** (el DA no se ha leído) | Da criterios de flexibilidad y tolerancias (tabla 2 de su ap. 3). Existentes, a estos efectos: licencia solicitada antes del **12-09-2010** (DT 3.ª del RD 173/2010). Ejemplos de no viabilidad del comentario: obras que afecten significativamente a estructura o instalaciones generales; rampa que ocupe más del 5 % de la superficie útil de la planta en pequeños establecimientos; acceso en planta sin ascensor si en su día cumplió; viales impracticables; falta de plena propiedad; desalojo prolongado | [DccSUA] pp. 6–7 |
| B.26 | Ejemplo de flexibilidad en el propio articulado | VERIFICADO (texto) | SUA 1, tabla 4.1, nota (1): «En edificios existentes, cuando se trate de instalar un ascensor que permita mejorar las condiciones de accesibilidad para personas con discapacidad, se puede admitir una anchura menor siempre que se acredite la no viabilidad técnica y económica de otras alternativas que no supongan dicha reducción de anchura y se aporten las medidas complementarias de mejora de la seguridad que en cada caso se estimen necesarias.» | [SUA22] p. 13 |
| B.27 | Cambio de uso que reduce exigencias (comentario) | LEÍDO (comentario) | Se puede aplicar flexibilidad si el elemento afectado tiene exigencias menores que con el uso previo (p. ej. «cuando se convierta un local comercial situado en un edificio de viviendas en vivienda»). Si aumentan, se deben alcanzar las condiciones del DB, y si no es posible, solo las tolerancias de la tabla 2 del DA DB-SUA/2. «En todo caso, dicha flexibilidad no es admisible en edificios o establecimientos construidos posteriormente a la entrada en vigor del DB.» | [DccSUA] p. 9 |

### B.HR — DB-HR

| # | Afirmación | Veredicto | Valor | Fuente |
|---|---|---|---|---|
| B.28 | ¿Criterios propios para existentes? | VERIFICADO (texto) que **no hay** | La Introducción III del DB-HR solo trata soluciones alternativas, Catálogo y normas. El tratamiento de los existentes es la **exclusión II d)** (C.HR) | [HR19] p. 4 |

### B.R — Regla tabulable (bloque B)

- **R-B1**: toda propuesta `aplica_reformado` añade la frase de no empeoramiento con la cita del DB que la tenga (DB-HE IV crit. 1; DB-SI III crit. 11; DB-SUA III crit. 4) o, si el DB no la tiene (DB-HS, DB-HR), la del art. 2.3 de la Parte I.
- **R-B2**: `aplica_flexibilidad` solo la elige el usuario. La ficha le pide (a) el motivo, uno de los de la Parte I art. 2.3 (urbanística, técnica o económicamente no viable; incompatible con la naturaleza de la intervención; incompatible con el grado de protección) o, solo en DB-HE, los casos b) y d) del criterio 2; (b) el nivel de prestación alcanzado; (c) los condicionantes de uso y mantenimiento. Párrafo D.0.3.
- **R-B3**: en DB-HE, aviso del criterio 3: si los elementos que no se tocan tienen daños que afectan al ahorro de energía, la intervención debe resolverlos.

---

## Bloque C — Ámbito de aplicación por sección

### C.HE0 — HE 0 (solo para decidir `he0he1_global`; se justifica con HULC)

| # | Afirmación | Veredicto | Cita exacta | Fuente |
|---|---|---|---|---|
| C.1 | Ámbito en existentes | VERIFICADO (texto) | «b) intervenciones en edificios existentes, en los siguientes casos: · ampliaciones en las que se incremente más de un 10% la superficie o el volumen construido de la unidad o unidades de uso sobre las que se intervenga, cuando la superficie útil ampliada supere los 50 m2; · cambios de uso, cuando la superficie útil total supere los 50 m2; · reformas en las que se renueven de forma conjunta las instalaciones de generación térmica y más del 25% de la superficie total de la envolvente térmica final del edificio.» | [HE22] p. 9 |
| C.2 | A qué parte | VERIFICADO (texto) | «Las exigencias derivadas de ampliaciones y cambios de uso son de aplicación, respectivamente, a la parte ampliada y a la unidad o unidades de uso que cambian su uso, mientras que en el caso de las reformas referidas en este apartado, son de aplicación al conjunto del edificio.» | [HE22] p. 9 |
| C.3 | Exclusiones (las mismas que HE 1) | VERIFICADO (texto) | a) protegidos «en la medida en que» el cumplimiento altere de manera inaceptable su carácter o aspecto; b) construcciones provisionales de 2 años o menos; c) industriales, defensa y agrícolas no residenciales de baja demanda; d) «edificios aislados con una superficie útil total inferior a 50 m2» | [HE22] p. 9 |
| C.4 | Ejemplo de ampliación y otros comentarios | LEÍDO (comentario) | Terraza de 60 m² útiles incorporada a un ático de 70 m²: 60 > 0,10·70 y 60 > 50 → afectada. El uso turístico de una vivienda sin servicios comunes **no** es cambio de uso. Edificio aislado = «aquel edificio independiente que no está en contacto con otros edificios» | [DccHE] p. 9 |
| C.5 | Límites distintos para reformas y cambios de uso | VERIFICADO (texto) | Tabla 3.1.a-HE0 (residencial privado) tiene una fila «Cambios de uso a residencial privado y reformas» (40/50/55/65/70/80 kW·h/m²·año, α a E) distinta de «Edificios nuevos y ampliaciones» (20/25/28/32/38/43). Lo calcula HULC | [HE22] p. 10 |

### C.HE1 — HE 1 (módulo `he1` y parte K/qsol de `he0he1_global`)

| # | Afirmación | Veredicto | Cita exacta | Fuente |
|---|---|---|---|---|
| C.6 | Ámbito: todas las intervenciones | VERIFICADO (texto) | «b) intervenciones en edificios existentes: · ampliaciones; · cambios de uso; · reformas.» Exclusiones a)–d) iguales a HE 0 (C.3) | [HE22] p. 15 |
| C.7 | Cómo se leen los apartados (comentario) | LEÍDO (comentario) | «Los diferentes apartados de esta sección son de aplicación general a estos casos, salvo cuando así se indique expresamente, mediante una exclusión o mediante particularización individual, que normalmente se establecerá en relación al alcance de la intervención o al uso del edificio o parte del edificio.» · «Debe observarse el distinto alcance de las obras de reforma incluidas en esta sección con respecto a la sección HE0.» | [DccHE] p. 16 |
| C.8 | **Ulim en reformas** (3.1.1 pto 2) | VERIFICADO (texto) | «En el caso de reformas, el valor límite (Ulim) de la tabla 3.1.1.a-HE1 será de aplicación únicamente a aquellos elementos de la envolvente térmica: a) que se sustituyan, incorporen, o modifiquen sustancialmente; b) que vean modificadas sus condiciones interiores o exteriores como resultado de la intervención, cuando estas supongan un incremento de las necesidades energéticas del edificio. Asimismo, en reformas se podrán superar los valores de la tabla 3.1.1.a-HE1 cuando el coeficiente global de transmisión de calor (K) obtenido considerando la transmitancia térmica final de los elementos afectados no supere el obtenido aplicando los valores de la tabla.» | [HE22] p. 16 |
| C.9 | Qué es el caso b) (comentario) | LEÍDO (comentario) | Elementos sobre los que no se actúa pero que cambian su papel: «elementos que con anterioridad a la intervención no formaban parte de la envolvente térmica, como podría ser el caso de algunas particiones interiores, y pasan a formar parte de la misma, cambiando sus condiciones exteriores, o de elementos de la envolvente térmica, adyacentes a espacios que cambian su uso previsto con impacto en el perfil de uso» | [DccHE] p. 17 |
| C.10 | **K** (Klim, residencial privado) | VERIFICADO (texto) | Tabla 3.1.1.b: filas «Edificios nuevos y ampliaciones» y «Cambios de uso. Reformas en las que se renueve más del 25% de la superficie total de la envolvente térmica final del edificio». Nota: «En el caso de ampliaciones los valores límite se aplicarán sólo en caso de que la superficie o el volumen construido se incrementen más del 10%.» Tabla 3.1.1.c (otros usos): una sola fila para nuevos, ampliaciones, cambios de uso y reformas de más del 25 %, con la misma nota del 10 %. **En reformas de 25 % o menos no hay Klim** | [HE22] pp. 16–17 |
| C.11 | Cómo contar el 25 % y el K en reformas (comentario) | LEÍDO (comentario) | «para el cálculo del porcentaje de la envolvente térmica afectada deben considerarse todas las superficies de los cerramientos que definen dicha envolvente, incluyendo fachadas, cubiertas, medianeras, superficies en contacto con el terreno, etc.» · «En los casos de reformas en los que se renueva más del 25% de la envolvente térmica, para el cálculo del coeficiente global de transmisión de calor (K), a diferencia de la exigencia de transmitancia térmica (U), se considerarán todos los elementos de la envolvente térmica, estén afectados por la intervención o no.» | [DccHE] p. 18 |
| C.12 | Exclusión de K por baja demanda | VERIFICADO (texto) | 3.1.1 pto 6: «Alternativamente, los edificios o, cuando se trate de intervenciones parciales en edificios existentes, las partes de los mismos sobre las que se intervenga, cuyas demandas de calefacción y refrigeración sean menores, en ambos casos, de 15 kWh/m2, podrán excluirse del cumplimiento del coeficiente global de transmisión de calor a través de la envolvente térmica (K).» | [HE22] p. 17 |
| C.13 | **Control solar** | VERIFICADO (texto) | 3.1.2 pto 1: «En el caso de edificios nuevos y ampliaciones, cambios de uso o reformas en las que se renueve más del 25% de la superficie total de la envolvente térmica final del edificio, el parámetro de control solar (qsol;jul) no superará el valor límite de la tabla 3.1.2-HE1» | [HE22] p. 17 |
| C.14 | **Permeabilidad de huecos** en reformas | VERIFICADO (texto) | 3.1.3 pto 3: «En el caso de reformas, la anterior tabla 3.1.3.a-HE1 solo será de aplicación a aquellos elementos de la envolvente térmica que se sustituyan, incorporen, o modifiquen sustancialmente.» | [HE22] p. 18 |
| C.15 | **n50** solo en nuevos | VERIFICADO (texto) + LEÍDO (comentario) | 3.1.3 pto 4: «En edificios nuevos de uso residencial privado con una superficie útil total superior a 120 m2…». Comentario: «Esta exigencia, que resulta de aplicación solo a edificios nuevos, se fija para el conjunto del edificio» | [HE22] p. 18; [DccHE] p. 19 |
| C.16 | **Particiones interiores** en reformas | VERIFICADO (texto) | 3.2 pto 2: «En el caso de reformas, el valor límite (Ulim) de la tabla 3.2-HE1 será de aplicación únicamente a aquellas particiones interiores: a) que se sustituyan, incorporen, o modifiquen sustancialmente; b) que vean modificadas sus condiciones interiores o exteriores como resultado de la intervención, cuando estas supongan un incremento de las necesidades energéticas del edificio.» | [HE22] p. 18 |
| C.17 | **Condensaciones** (3.3) | VERIFICADO (texto) que **no tiene** regla para reformas | El 3.3 no distingue intervenciones. Ver K-REF.9 | [HE22] p. 18 |
| C.18 | Cerramiento entre zona ampliada y existente | VERIFICADO (texto) | Anejo A, «Cerramiento» y «Partición interior»: «En la intervención en edificios existentes, cuando un elemento de cerramiento separe una zona ampliada respecto a otra existente, se considerará perteneciente a la zona ampliada» | [HE22] pp. 36, 41 |
| C.19 | Cambio de uso: ¿Ulim a todos los elementos? | **NO LO FIJA EL DB** + INTERPRETACIÓN | La restricción de Ulim del 3.1.1 pto 2 y la del 3.1.3 pto 3 son solo «en el caso de reformas»; el comentario separa «cambio de uso» de «reforma» (A.11). Leído al pie de la letra, en un cambio de uso Ulim, permeabilidad, K (fila «Cambios de uso») y qsol se aplican sin restricción. ¿A qué parte? HE 1 no lo dice; HE 0 sí («a la unidad o unidades de uso que cambian su uso», C.2) y la Parte I remite a los DB en el cambio de uso parcial (A.6). Lectura: a la envolvente térmica de las unidades de uso que cambian de uso. Ver K-REF.8 | [HE22] pp. 9, 15–18 |

### C.HE4 — HE 4

| # | Afirmación | Veredicto | Cita exacta | Fuente |
|---|---|---|---|---|
| C.20 | b) reforma íntegra o cambio de uso característico | VERIFICADO (texto) | «b) edificios existentes con una demanda de agua caliente sanitaria (ACS) superior a 100 l/d, calculada de acuerdo al Anejo F, en los que se reforme íntegramente, bien el edificio en sí, o bien la instalación de generación térmica, o en los que se produzca un cambio de uso característico del mismo.» | [HE22] p. 28 |
| C.21 | c) ampliaciones con demanda grande | VERIFICADO (texto) | «c) ampliaciones o intervenciones, no cubiertas en el punto anterior, en edificios existentes con una demanda inicial de ACS superior a 5.000 l/día, que supongan un incremento superior al 50% de la demanda inicial;» | [HE22] p. 28 |
| C.22 | d) piscinas | VERIFICADO (texto) | «d) climatizaciones de: piscinas cubiertas nuevas, piscinas cubiertas existentes en las que se renueve la instalación de generación térmica o piscinas descubiertas existentes que pasen a ser cubiertas.» | [HE22] p. 28 |
| C.23 | c) se calcula sobre el incremento | VERIFICADO (texto) | 3.1 pto 2: «En el caso de ampliaciones e intervenciones en edificios existentes, contemplados en el punto 1 c) del ámbito de aplicación, la contribución renovable mínima se establece sobre el incremento de la demanda de ACS respecto a la demanda inicial.» | [HE22] p. 28 |
| C.24 | Qué es «reforma íntegra de la instalación de generación térmica» y alcance | LEÍDO (comentario) | «Por reforma íntegra de una instalación de generación térmica se entiende la sustitución o cambio del generador térmico sin necesidad de cambio de los circuitos de distribución…» (ejemplo: caldera de carbón o gasóleo por una de condensación en un bloque > 100 l/d → entra). «Las exigencias de esta sección se refieren al conjunto del edificio o a su ampliación y no a partes del mismo o a las unidades de uso. En instalaciones descentralizadas, por tanto, la intervención en solo una parte de los sistemas de generación correspondientes a las unidades de uso no supondría la aplicación de esta sección.» «El cambio del quemador … para su adaptación a otro combustible, no se considera una reforma íntegra». Recuerda que cabe la flexibilidad | [DccHE] p. 31 |
| C.25 | «Reforme íntegramente … el edificio en sí» | **NO LO DEFINE el DB** | Ver A.13 y K-REF.3 | — |

### C.HE5 — HE 5

| # | Afirmación | Veredicto | Cita exacta | Fuente |
|---|---|---|---|---|
| C.26 | b) y c) | VERIFICADO (texto) | «b) ampliaciones de edificios existentes cuando se incremente la superficie construida en más de 1.000 m2 · c) edificios existentes que se reformen íntegramente, o en los que se produzca un cambio de uso característico del mismo, cuando se superen los 1.000 m2 de superficie construida;» · «Se considerará que la superficie construida incluye la superficie de las zonas destinadas a aparcamiento en el interior del edificio y excluye las zonas exteriores comunes.» | [HE22] p. 31 |
| C.27 | En ampliaciones se calcula sobre lo ampliado (comentario) | LEÍDO (comentario) | Edificio de 1.800 m² + dos plantas de 1.200 m²: aplica, porque la parte ampliada supera 1.000 m²; «El cálculo de la potencia mínima a instalar se realizará exclusivamente sobre la superficie ampliada». Varios edificios en la misma parcela catastral: se suma su superficie construida | [DccHE] p. 35 |
| C.28 | Imposibilidad (protegidos, razones urbanísticas o arquitectónicas) | VERIFICADO (texto) | 3 pto 2: «En aquellos edificios en los que, por razones urbanísticas o arquitectónicas o porque se trate de edificios protegidos oficialmente, siendo la autoridad que dicta la protección oficial quien determina los elementos inalterables, no se pueda alcanzar la potencia a instalar mínima, se deberá justificar esta imposibilidad, analizando las distintas alternativas, y se adoptará la solución que alcance la máxima potencia instalada posible.» | [HE22] p. 31 |

### C.HE6 — HE 6

Ya verificado en `verificacion-he6.md` A.3–A.7 y B.3–B.5 ([HE22] p. 33). Se confirma el texto en esta sesión ([HE22] p. 33, texto; [DccHE] p. 37, **sin comentarios**). Resumen para la tabla:
- b) existentes, solo si hay zona de aparcamiento: (1) **cambio de uso característico**; (2) **ampliación** con intervención en el aparcamiento, **> 10 %** de superficie o volumen de las unidades intervenidas **y** superficie útil ampliada **> 50 m²**; (3) **reforma** con intervención en el aparcamiento **y > 25 %** de la envolvente térmica final; (4) instalación eléctrica del **edificio** que afecte a **> 50 %** de su potencia instalada, con aparcamiento **interior** y **derecho del promotor** a actuar en él; (5) instalación eléctrica del **aparcamiento** que afecte a **> 50 %** de su potencia.
- Exclusiones: a) uso distinto del residencial privado con 10 plazas o menos; b) existentes (no residencial con 20 plazas o menos, o residencial privado) **cuando el coste de cumplir supere el 7 % del PEM** de la intervención; c) protegidos «en la medida en que».
- **El cambio de uso parcial no está** entre los supuestos (solo el característico). VERIFICADO (texto).

### C.HS — DB-HS, secciones

| # | Sección | Veredicto | Cita exacta | Fuente |
|---|---|---|---|---|
| C.29 | HS 1 | VERIFICADO (texto) | 1.1 pto 1: «Esta sección se aplica a los muros y los suelos que están en contacto con el terreno y a los cerramientos que están en contacto con el aire exterior (fachadas y cubiertas) de todos los edificios incluidos en el ámbito de aplicación general del CTE. Los suelos elevados se consideran suelos que están en contacto con el terreno. Las medianerías que vayan a quedar descubiertas porque no se ha edificado en los solares colindantes o porque la superficie de las mismas excede a las de las colindantes se consideran fachadas. Los suelos de las terrazas y los de los balcones se consideran cubiertas.» **Sin regla propia para existentes.** Comentario: las soluciones del ap. 2 incluyen algunas «poco usuales, pero que son factibles y pueden darse en algunos casos, como por ejemplo en rehabilitación» | [HS22] p. 10; [DccHS] p. 11 |
| C.30 | HS 2 | VERIFICADO (texto) | 1.1: «1 Esta sección se aplica a los edificios de viviendas de nueva construcción, tengan o no locales destinados a otros usos, en lo referente a la recogida de los residuos ordinarios generados en ellos. 2 Para los edificios y locales con otros usos la demostración de la conformidad con las exigencias básicas debe realizarse mediante un estudio específico adoptando criterios análogos a los establecidos en esta sección.» Sin comentario sobre existentes (ver `verificacion-hs2.md` B1.6–B1.7) | [HS22] p. 52 |
| C.31 | HS 3 | VERIFICADO (texto) | 1.1: «1 Esta sección se aplica, en los edificios de viviendas, al interior de las mismas, los almacenes de residuos, los trasteros, los aparcamientos y garajes; y, en los edificios de cualquier otro uso, a los aparcamientos y los garajes. … 2 Para locales de cualquier otro tipo se considera que se cumplen las exigencias básicas si se observan las condiciones establecidas en el RITE.» **Sin regla propia para existentes** | [HS22] p. 63 |
| C.32 | **HS 4** | VERIFICADO (texto) | 1.1 pto 1: «Esta sección se aplica a la instalación de suministro de agua en los edificios incluidos en el ámbito de aplicación general del CTE. Las ampliaciones, modificaciones, reformas o rehabilitaciones de las instalaciones existentes se consideran incluidas cuando se amplía el número o la capacidad de los aparatos receptores existentes en la instalación.» Sin comentario | [HS22] p. 81; [DccHS] p. 88 |
| C.33 | **HS 5** | VERIFICADO (texto) | 1.1 pto 1: «Esta Sección se aplica a la instalación de evacuación de aguas residuales y pluviales en los edificios incluidos en el ámbito de aplicación general del CTE. Las ampliaciones, modificaciones, reformas o rehabilitaciones de las instalaciones existentes se consideran incluidas cuando se amplía el número o la capacidad de los aparatos receptores existentes en la instalación.» Sin comentario | [HS22] p. 111; [DccHS] p. 119 |
| C.34 | **HS 6** | VERIFICADO (texto) | 1 pto 1 b): «intervenciones en edificios existentes: i) en ampliaciones, a la parte nueva; ii) en cambio de uso, a todo el edificio si se trata de un cambio de uso característico o a la zona afectada, si se trata de un cambio de uso que afecta únicamente a parte de un edificio o de un establecimiento; iii) en obras de reforma, a la zona afectada, cuando se realicen modificaciones que permitan aumentar la protección frente al radón o alteren la protección inicial.» pto 2: no aplica a locales no habitables ni a habitables separados del terreno por espacios abiertos con ventilación análoga al exterior | [HS22] p. 138 |
| C.35 | HS 6 en existentes: soluciones propias | VERIFICADO (texto) | 3 pto 3: soluciones alternativas «que, en conjunto, permitan limitar adecuadamente la entrada de radón» con ventilación interior reglamentaria; 3 pto 4: con mediciones del Apéndice C, entre 1 y 2 veces el nivel de referencia → soluciones de zona I; más de 2 veces → zona II; 3.1.1 pto 4: si no cabe barrera, los cerramientos hacen de barrera (grietas y juntas selladas, letras b y c); 3.2 pto 6: cámara de al menos 5 cm por el interior; 3.3 pto 3: despresurización perimetral con estudio específico | [HS22] pp. 138–141 |

### C.SI y C.SUA

No hay ámbito propio por sección: rige la Introducción (B.8–B.17 y B.18–B.27). Lo que cambia de una sección a otra es **qué elementos** son los «modificados por la reforma». Reparto propuesto (INTERPRETACIÓN; base: el contenido de cada sección):

| Sección | Elementos cuya modificación activa la sección en una reforma | Además |
|---|---|---|
| SI 1 Propagación interior | Compartimentación (sectores), locales de riesgo especial, espacios ocultos y pasos de instalaciones, revestimientos (reacción al fuego) | Cambio de perfil de riesgo (B.16) |
| SI 2 Propagación exterior | Fachadas, medianerías, cubiertas | — |
| SI 3 Evacuación | Elementos de evacuación (puertas, pasillos, escaleras, salidas, señalización) | **Si se altera la ocupación o su distribución** respecto a ellos (crit. 10) |
| SI 4 Instalaciones PCI | Las instalaciones PCI | **Si se afectan los elementos que les sirven de soporte o por donde discurren** (crit. 10). En ampliación, dotación según el **edificio ampliado** (B.14) |
| SI 5 Intervención de bomberos | Fachadas (huecos accesibles), accesos, entorno | Ampliaciones que cambian altura de evacuación o fachadas |
| SI 6 Resistencia al fuego de la estructura | Estructura | Pregunta P9 |
| SUA 1 Caídas | Suelos, desniveles y barreras, escaleras y rampas, huecos (limpieza de acristalamientos) | Elementos cuyo requisito cambia (B.23) |
| SUA 2 Impacto y atrapamiento | Vidrios, puertas, elementos salientes | — |
| SUA 3 Aprisionamiento | Puertas con bloqueo interior, aseos accesibles | — |
| SUA 4 Iluminación | Alumbrado normal y de emergencia de zonas de circulación | — |
| SUA 5 Alta ocupación | — (sin graderíos: sigue `no_aplica`) | — |
| SUA 6 Ahogamiento | Piscina, pozos, depósitos | Regla actual (sin piscina / unifamiliar) |
| SUA 7 Vehículos | Aparcamiento y vías de circulación | Regla actual (sin garaje / unifamiliar) |
| SUA 8 Rayo | — en reforma interior | Ampliación (cambian dimensiones) y cambio de uso (cambian los coeficientes de uso) |
| SUA 9 Accesibilidad | Itinerarios, accesos, aseos, plazas, mecanismos | Ampliación y cambio de uso parcial: **itinerario accesible hasta la vía pública** si SUA 9 lo exige (crit. 2) |

### C.HR — DB-HR

| # | Afirmación | Veredicto | Cita / valor | Fuente |
|---|---|---|---|---|
| C.36 | Exclusión d) | VERIFICADO (imagen, sesión HR) | «d) las obras de ampliación, modificación, reforma o rehabilitación en los edificios existentes, salvo cuando se trate de rehabilitación integral. Asimismo, quedan excluidas las obras de rehabilitación integral de los edificios protegidos oficialmente en razón de su catalogación, como bienes de interés cultural, cuando el cumplimiento de las exigencias suponga alterar la configuración de su fachada o su distribución o acabado interior, de modo incompatible con la conservación de dichos edificios.» Confirmado en texto en esta sesión. [DccHR]: sin comentario a d) | [HR19] p. 3 |
| C.37 | ¿Y el cambio de uso? | VERIFICADO (literal) + **AMBIGUO** | d) **no nombra el cambio de uso**. La Parte I obliga a cumplir las exigencias básicas en todo cambio de uso característico (A.6). La Guía lee d) como «intervenciones» en general (C.38) | [HR19] p. 3; [PI22] p. 6 |
| C.38 | Guía DB-HR: regla general | LEÍDO (Guía, imagen) | 2.0.2: «En lo relativo a intervenciones sobre edificios existentes, no será de aplicación el DB HR salvo cuando se trate de rehabilitación integral.» | [GuíaHR] p. 19 |
| C.39 | Guía DB-HR: criterios recomendados («a modo de recomendación») | LEÍDO (Guía, imagen) | **Rehabilitación integral**: «debe aplicarse el DB HR». **Reformas parciales**: «es conveniente adecuar los elementos constructivos o instalaciones sustituidos, incorporados o modificados», salvo casos de inviabilidad. **Ampliación**: «las zonas ampliadas deben cumplir las exigencias establecidas en el DB HR, ya que pueden ser asimilables a una obra nueva, y en cuanto a las partes existentes, en la medida en la que se interviene en ellas, su tratamiento será el de las reformas.» **Cambio de uso característico**: «se debería adecuar todo el edificio a las exigencias establecidas en el DB HR con carácter general, ya que una intervención como un cambio de uso global de un edificio, puede asimilarse a una obra nueva.» **Cambio de uso parcial**: a) si se generan recintos de actividad o instalaciones colindantes con unidades de uso, «es conveniente el cumplimiento del DB HR»; b) «En los cambios de uso a vivienda, es conveniente aplicar las exigencias del DB HR»; c) a una actividad menos ruidosa, lo fija la propiedad, el promotor o el proyectista. **Instalaciones**: si se introduce, sustituye o amplía una instalación ruidosa, «es conveniente seguir las especificaciones del DB HR del apartado 2.3» | [GuíaHR] pp. 20–21 |
| C.40 | Errata de la Guía | LEÍDO (Guía, imagen) | Caso b) de inviabilidad en reformas parciales: «Cuando la aplicación del DB HR suponga la mejora efectiva…». Por el sentido (y por el criterio 2 b del DB-HE), debería decir «**no** suponga». No citar esa línea literal | [GuíaHR] p. 20 |

### C.REBT — REBT

| # | Afirmación | Veredicto | Cita exacta | Fuente |
|---|---|---|---|---|
| C.41 | Art. 2.2 | VERIFICADO (texto) | «2. El presente Reglamento se aplicará: a) A las nuevas instalaciones, a sus modificaciones y a sus ampliaciones. b) A las modificaciones, reparaciones y ampliaciones, sean o no de importancia, de las instalaciones existentes antes de su entrada en vigor, solo en lo que afecta a la parte modificada, reparada o ampliada, y siempre y cuando se tomen las medidas necesarias para garantizar las condiciones de seguridad del conjunto de la instalación. c) A las instalaciones existentes antes de su entrada en vigor, en lo referente al régimen de inspecciones, si bien los criterios técnicos aplicables en dichas inspecciones serán los correspondientes a la reglamentación con la que se aprobaron.» | [REBT] p. 9 |
| C.42 | «Modificaciones o reparaciones de importancia» | VERIFICADO (texto) | «Se entenderá por modificaciones o reparaciones de importancia, a los efectos de la documentación exigible y de la obligatoriedad de inspección inicial, a las que afectan a más del 50 por 100 de la potencia instalada. Igualmente se considerará modificación de importancia la que afecte a líneas completas de procesos productivos con nuevos circuitos y cuadros, aun con reducción de potencia.» **Ojo:** el 50 % sirve para la **documentación y la inspección**, no para decidir si el REBT se aplica: con importancia o sin ella, se aplica a la parte modificada | [REBT] p. 9 |
| C.43 | Riesgo grave | VERIFICADO (texto) | 2.3: también a instalaciones existentes cuando «su estado, situación o características impliquen un riesgo grave para las personas o los bienes … a juicio del órgano competente de la Comunidad Autónoma» | [REBT] p. 9 |
| C.44 | Proyecto en ampliaciones y modificaciones | VERIFICADO (texto) | ITC-BT-04 3.2: requieren proyecto «a) Las ampliaciones de las instalaciones de los tipos (b, c, g, i, j, l, m) y modificaciones de importancia de las instalaciones señaladas en 3.1. b) Las ampliaciones de las instalaciones que, siendo de los tipos señalados en 3.1 no alcanzasen los límites de potencia prevista establecidos para las mismas, pero que los superan al producirse la ampliación. c) Las ampliaciones de instalaciones que requirieron proyecto originalmente si en una o en varias ampliaciones se supera el 50 % de la potencia prevista en el proyecto anterior.» · 4: «Requerirán Memoria Técnica de Diseño todas las instalaciones sean nuevas, ampliaciones o modificaciones no incluidas en los grupos indicados en el apartado 3.» | [REBT] p. 53 |
| C.45 | Guía técnica del articulado (qué es «modificación») | **NO VERIFICADO** | No está en local ni se ha podido leer | — |

---

## Bloque D — Tablas de aplicabilidad por justificación

### D.0 Convenciones y párrafos comunes

**Columnas.** R = reforma con el mismo uso · A = ampliación · CUp = cambio de uso parcial (parte del edificio o de un establecimiento) · CUc = cambio de uso característico del edificio. Valores: `aplica`, `aplica_reformado` (solo lo intervenido), `no_aplica`, `aplica_flexibilidad` (solo por elección del usuario, R-B2), `Pn` = lo decide la pregunta n del bloque E.

**Combinación.** Una obra puede ser a la vez reforma y ampliación, o reforma y cambio de uso. Se evalúa cada tipo marcado y gana el más exigente: `aplica` > `aplica_reformado` > `no_aplica` (K-REF.1).

**Reglas actuales que se conservan** (atributos del edificio, valen también en existentes): SUA 5 siempre `no_aplica`; SUA 6 sin piscina o unifamiliar; SUA 7 sin garaje o unifamiliar; HS 3 sin viviendas ni garaje; HE 6 sin aparcamiento o exclusión a). Se evalúan **antes** que las de intervención.

Párrafos comunes (se añaden a los de cada justificación):

- **D.0.1 Mantenimiento** (todas → `no_aplica`): «Las obras proyectadas consisten exclusivamente en trabajos de mantenimiento y reparaciones puntuales del edificio, sin el carácter de reforma, ampliación ni cambio de uso (CTE Parte I, Anejo III, «Intervención en los edificios existentes» y «Mantenimiento»). No les es exigible la aplicación del CTE.» Cita: «CTE Parte I, Anejo III». *(La conclusión «no es exigible» es de los comentarios del Ministerio, [DccSI] p. 8 y [DccSUA] p. 11; las definiciones son reglamentarias.)*
- **D.0.2 No empeoramiento** (cola de todo `aplica_reformado`): «En el resto del edificio, no afectado por la intervención, no se reducen las condiciones preexistentes relacionadas con esta exigencia básica (CTE Parte I, art. 2.3[; DB-xx, Introducción, criterio n]).»
- **D.0.3 Flexibilidad** (`aplica_flexibilidad`, rellena el usuario): «[Sección]: se aplica con criterio de flexibilidad. La aplicación plena de [exigencia] no es [urbanística / técnica / económicamente viable | compatible con la naturaleza de la intervención | compatible con el grado de protección del edificio] por [motivo]. Se adoptan las soluciones que permiten el mayor grado posible de adecuación efectiva: [soluciones], con las que se alcanza [nivel de prestación]. En la documentación final de la obra quedará constancia del nivel de prestación alcanzado y de los condicionantes de uso y mantenimiento que resulten (CTE Parte I, art. 2.3[; DB-HE, Introducción IV, criterio 2 | DB-SI, Introducción III | DB-SUA, Introducción III]).»
- **D.0.4 Estructura** (`dbse`): sin actuación en estructura → `no_aplica`: «DB-SE Seguridad estructural: la intervención no incluye actuaciones en la estructura preexistente; se entiende, por tanto, que las obras no implican el riesgo de daño citado en el artículo 17.1.a) de la Ley 38/1999, de Ordenación de la Edificación (CTE Parte I, art. 2.4).» Con actuación → `externo` (Concreta estructura), con la frase «La intervención incluye actuaciones en la estructura preexistente (CTE Parte I, art. 2.4), que se justifican en el anejo de estructura.»
- **D.0.5 Protegido** (si P11 = sí, aviso en HE 0, HE 1, HE 6, HR y en todas las de SI y SUA): el usuario puede elegir `no_aplica` (HE 0/HE 1/HE 6: «en la medida en que» el cumplimiento altere de manera inaceptable el carácter o aspecto; HR: solo rehabilitación integral de un edificio catalogado, cuando cumplir sea incompatible con su conservación) o `aplica_flexibilidad` (resto). La app no decide qué elementos son inalterables: los fija la autoridad que dicta la protección.

### D.1 Salubridad (DB-HS)

| Clave | R | A | CUp | CUc | Cita |
|---|---|---|---|---|---|
| hs1 | P5: se actúa en muros o suelos en contacto con el terreno, fachadas o cubiertas → `aplica_reformado`; si no → `no_aplica` | `aplica_reformado` (parte ampliada) | Como R (P5) | `aplica` | DB-HS 1 ap. 1.1; CTE Parte I art. 2 |
| hs2 | `no_aplica` | `no_aplica` (K-REF.6) | `no_aplica` | Pasa a edificio de viviendas → `aplica` por analogía (K-REF.5). A otro uso → `no_aplica` (estudio específico) | DB-HS 2 ap. 1.1 ptos 1 y 2 |
| hs3 | P8: se reforman viviendas, trasteros, almacén de residuos o garaje → `aplica_reformado`; si no → `no_aplica` | `aplica_reformado` (locales del ámbito en la parte ampliada) | La zona pasa a vivienda, trastero o garaje → `aplica_reformado`; a otro uso → `no_aplica` (RITE) | `aplica` si el nuevo uso tiene locales del ámbito | DB-HS 3 ap. 1.1 |
| hs4 | P7a: aumentan número o capacidad de aparatos → `aplica_reformado`; instalación nueva completa → `aplica_reformado` (K-REF.7); sin aumento → `no_aplica` | Igual que R (P7a); lo normal es `aplica_reformado` | Igual que R (P7a) | `aplica` | DB-HS 4 ap. 1.1 |
| hs5 | Residuales: como hs4 (P7a). Pluviales: P7b (cubiertas o red de pluviales modificadas) → `aplica_reformado` | `aplica_reformado` (aparatos y cubiertas de la parte ampliada) | Como R | `aplica` | DB-HS 5 ap. 1.1 |
| hs6 | Municipio fuera del Apéndice B → `no_aplica` (regla actual). Dentro: P5 (se modifican soleras o muros en contacto con el terreno de locales habitables, o su protección) → `aplica_reformado`; si no → `no_aplica` | `aplica_reformado` (parte nueva) | `aplica_reformado` (zona afectada) | `aplica` (todo el edificio) | DB-HS 6 ap. 1 pto 1 b) |

Párrafos:

- **hs1 · no aplica (R/CUp):** «DB-HS 1 Protección frente a la humedad: no es de aplicación — la intervención no actúa sobre los muros y suelos en contacto con el terreno ni sobre los cerramientos en contacto con el aire exterior (fachadas y cubiertas), que son los elementos a los que se aplica la Sección (HS 1 ap. 1.1), y las exigencias de la Sección no dependen del uso.»
- **hs1 · a lo reformado:** «DB-HS 1 Protección frente a la humedad: se aplica a los elementos objeto de la intervención — [la fachada / la cubierta / el suelo en contacto con el terreno … | los cerramientos de la parte ampliada] (HS 1 ap. 1.1; CTE Parte I, art. 2.3).» + D.0.2.
- **hs2 · no aplica (R/A/CUp):** «DB-HS 2 Recogida y evacuación de residuos: no es de aplicación — el ámbito de la Sección son los edificios de viviendas de nueva construcción (HS 2 ap. 1.1 pto 1), y la obra es una intervención en un edificio existente.»
- **hs2 · cambio de uso característico a viviendas (K-REF.5):** «DB-HS 2 Recogida y evacuación de residuos: el edificio cambia su uso característico a residencial vivienda, por lo que debe cumplir la exigencia básica HS 2 (CTE Parte I, art. 2, cambio de uso). Como el ámbito literal de la Sección se limita a la nueva construcción, la conformidad se justifica con un estudio específico que adopta los criterios de la Sección HS 2 (HS 2 ap. 1.1 pto 2).»
- **hs3 · no aplica (R):** «DB-HS 3 Calidad del aire interior: no es de aplicación — la intervención no actúa sobre el interior de las viviendas, los almacenes de residuos, los trasteros ni los aparcamientos y garajes, que son los locales del ámbito de la Sección (HS 3 ap. 1.1).»
- **hs3 · a lo reformado:** «DB-HS 3 Calidad del aire interior: se aplica a los locales objeto de la intervención — [vivienda(s) reformada(s) / trasteros / garaje / la parte ampliada] (HS 3 ap. 1.1; CTE Parte I, art. 2.3).» + D.0.2.
- **hs4 · no aplica (R sin aumento):** «DB-HS 4 Suministro de agua: no es de aplicación — la intervención en la instalación existente no amplía el número ni la capacidad de los aparatos receptores, condición con la que las ampliaciones, modificaciones, reformas o rehabilitaciones de las instalaciones existentes quedan incluidas en el ámbito de la Sección (HS 4 ap. 1.1).»
- **hs4 · a lo reformado:** «DB-HS 4 Suministro de agua: se aplica a la parte de la instalación objeto de la intervención, que amplía el número o la capacidad de los aparatos receptores existentes (HS 4 ap. 1.1). Se comprueba además que los tramos existentes que alimentan a los nuevos aparatos tienen capacidad suficiente.» + D.0.2. *(La segunda frase es INTERPRETACIÓN: no la escribe el DB.)*
- **hs5 · no aplica / a lo reformado:** las mismas frases que hs4, con «DB-HS 5 Evacuación de aguas» y «HS 5 ap. 1.1». Para pluviales: «… se aplica a la red de evacuación de aguas pluviales de [las cubiertas modificadas / la parte ampliada].»
- **hs6 · no aplica (R):** «DB-HS 6 Protección frente a la exposición al radón: no es de aplicación — en las obras de reforma la Sección se aplica a la zona afectada solo cuando se realicen modificaciones que permitan aumentar la protección frente al radón o alteren la protección inicial (HS 6 ap. 1 pto 1 b iii), y la intervención no actúa sobre los cerramientos en contacto con el terreno de los locales habitables.»
- **hs6 · a lo reformado:** «DB-HS 6 Protección frente a la exposición al radón: se aplica a [la parte nueva de la ampliación (ap. 1 pto 1 b i) / la zona que cambia de uso (b ii) / la zona afectada por la reforma (b iii)]. En intervenciones en edificios existentes se admiten las soluciones alternativas del ap. 3 pto 3 y las específicas de los ap. 3.1.1 pto 4, 3.2 pto 6 y 3.3 pto 3.» + D.0.2.

### D.2 Seguridad en caso de incendio (DB-SI)

Regla común: R → `aplica_reformado` si P8 marca elementos de la sección (tabla de C.SI); si no, `no_aplica`. A → `aplica_reformado` (parte ampliada como obra nueva, integrada en el edificio ampliado). CUp → `aplica_reformado` (la parte y sus medios de evacuación hasta el espacio exterior seguro; con la excepción de vivienda en edificio de viviendas, P3c). CUc → `aplica`.

| Clave | R | A | CUp | CUc | Cita |
|---|---|---|---|---|---|
| si1 | P8 (compartimentación, locales de riesgo especial, espacios ocultos, revestimientos) | `aplica_reformado` | `aplica_reformado` | `aplica` | DB-SI, Introducción III, criterios 8, 9 y 11 |
| si2 | P5 (fachadas, medianerías, cubiertas) | `aplica_reformado` | `aplica_reformado` | `aplica` | ídem |
| si3 | P8 (elementos de evacuación) **o** P8 (cambia ocupación o distribución) | `aplica_reformado` + elementos de evacuación que sirvan a la zona ampliada | `aplica_reformado` + medios de evacuación hasta el espacio exterior seguro (salvo P3c) | `aplica` | criterios 8, 9, 10 y 11 |
| si4 | P8 (instalaciones PCI o sus soportes) | `aplica_reformado`, con la dotación del edificio ampliado | `aplica_reformado` | `aplica` | criterios 8, 10 y 11; [DccSI] p. 9 |
| si5 | `no_aplica` salvo P5 (fachadas) o P4 (cambia la altura de evacuación) | `aplica_reformado` | `no_aplica` salvo P4/P5 | `aplica` | criterios 8, 9 y 11 |
| si6 | P9 (estructura) | `aplica_reformado` (estructura de la ampliación) | `aplica_reformado` si el nuevo uso exige más resistencia (CRITERIO) | `aplica` | criterios 8, 9 y 11 |

Párrafos (sustituir [n] y [Sección]):

- **si· no aplica (R):** «[SI n Nombre]: no es de aplicación — en las obras de reforma en las que se mantiene el uso, el DB-SI se aplica a los elementos del edificio modificados por la reforma (DB-SI, Introducción III, criterio 9), y la intervención no modifica [la compartimentación, los locales de riesgo especial, los espacios ocultos ni los revestimientos | las fachadas, medianerías ni cubiertas | los elementos de evacuación, ni altera la ocupación o su distribución respecto a ellos (criterio 10) | las instalaciones de protección contra incendios ni los elementos que les sirven de soporte (criterio 10) | las condiciones de aproximación, entorno y accesibilidad por fachada | la estructura]. La reforma no menoscaba las condiciones de seguridad preexistentes (criterio 11).»
- **si· a lo reformado (R):** «[SI n Nombre]: se aplica a los elementos modificados por la reforma — [lista] —, en la medida en que ello supone una mayor adecuación a las condiciones del DB (DB-SI, Introducción III, criterio 9[; criterio 10]). La reforma no menoscaba las condiciones de seguridad preexistentes (criterio 11).»
- **si· ampliación:** «[SI n Nombre]: se aplica a la parte ampliada como obra nueva, considerada parte integrante del edificio ampliado, y a los elementos de la parte existente que se modifican o que sirven de evacuación a la zona ampliada (CTE Parte I, art. 2; DB-SI, Introducción III, criterios 9 a 11).» Para si4 añadir: «La dotación de instalaciones de protección contra incendios de la parte ampliada es la exigible al edificio ampliado.»
- **si· cambio de uso parcial:** «[SI n Nombre]: se aplica a la zona que cambia de uso y a los medios de evacuación que la sirven hasta el espacio exterior seguro, estén o no situados en ella (DB-SI, Introducción III, criterio 8).» Con P3c = sí, sustituir por: «… se aplica a la zona que se transforma en uso Residencial Vivienda; no es preciso aplicarlo a los elementos comunes de evacuación del edificio (DB-SI, Introducción III, criterio 8).»
- **si· cambio de uso característico:** «[SI n Nombre]: se aplica al edificio completo, que cambia su uso característico (CTE Parte I, art. 2, cambio de uso).»

### D.3 Seguridad de utilización y accesibilidad (DB-SUA)

Regla común: R → `aplica_reformado` si P8 marca elementos de la sección; si no, `no_aplica`. A y CUp → `aplica_reformado` (la parte + itinerario accesible si SUA 9 lo exige). CUc → `aplica`.

| Clave | R | A | CUp | CUc | Cita |
|---|---|---|---|---|---|
| sua1 | P8 (suelos, desniveles, barreras, escaleras, rampas) o P5 (huecos: limpieza de acristalamientos) | `aplica_reformado` | `aplica_reformado` | `aplica` | DB-SUA, Introducción III, criterios 2 a 4 |
| sua2 | P8 (vidrios, puertas, salientes) o P5 (huecos) | `aplica_reformado` | `aplica_reformado` | `aplica` | ídem |
| sua3 | P8 (puertas con bloqueo, aseos) | `aplica_reformado` | `aplica_reformado` | `aplica` | ídem |
| sua4 | P8 (zonas de circulación o su alumbrado) | `aplica_reformado` | `aplica_reformado` | `aplica` | ídem |
| sua5 | `no_aplica` (regla actual) | ídem | ídem | ídem | SUA 5 ap. 1 |
| sua6 | Reglas actuales; si hay piscina y no se interviene en ella → `no_aplica` | Piscina nueva → `aplica_reformado` | Como R | `aplica` (con las reglas actuales) | SUA 6 ap. 1; criterios 2 a 4 |
| sua7 | Reglas actuales; si hay aparcamiento y P10a = no → `no_aplica` | Aparcamiento ampliado → `aplica_reformado` | Como R | `aplica` (con las reglas actuales) | SUA 7 ap. 1; criterios 2 a 4 |
| sua8 | `no_aplica` (K-REF.11) | `aplica` (edificio ampliado) | `aplica` (CRITERIO prudente, K-REF.11) | `aplica` | criterios 2 a 4 |
| sua9 | P8 (elementos de accesibilidad) | `aplica_reformado` + itinerario accesible a la vía pública si SUA 9 lo exige | ídem | `aplica` | criterios 2 a 4 |

Párrafos:

- **sua· no aplica (R):** «[SUA n Nombre]: no es de aplicación — en las obras de reforma en las que se mantiene el uso, el DB-SUA se aplica a los elementos del edificio modificados por la reforma (DB-SUA, Introducción III, criterio 3), y la intervención no modifica [suelos, desniveles, escaleras ni rampas | vidrios, puertas ni elementos salientes | puertas con dispositivo de bloqueo ni aseos | el alumbrado de las zonas de circulación | elementos de accesibilidad]. La reforma no menoscaba las condiciones preexistentes de seguridad de utilización y accesibilidad (criterio 4).»
- **sua· a lo reformado (R):** «[SUA n Nombre]: se aplica a los elementos modificados por la reforma — [lista] —, siempre que ello suponga una mayor adecuación a las condiciones del DB (DB-SUA, Introducción III, criterio 3). La reforma no menoscaba las condiciones preexistentes (criterio 4).»
- **sua· ampliación o cambio de uso parcial:** «[SUA n Nombre]: se aplica a [la parte ampliada / la parte del edificio que cambia de uso] (DB-SUA, Introducción III, criterio 2).» Para sua9 añadir: «Se dispone al menos un itinerario accesible que la comunica con la vía pública, al ser exigible según SUA 9.» o «No es exigible itinerario accesible según SUA 9 ap. 1.1.1 porque [motivo].»
- **sua8 · no aplica (R):** «SUA 8 Seguridad frente al riesgo causado por la acción del rayo: no es de aplicación — la reforma no modifica las dimensiones del edificio, su uso ni su entorno, de los que depende la evaluación de la necesidad de instalación de protección contra el rayo; tampoco se actúa sobre una instalación de protección existente (DB-SUA, Introducción III, criterio 3).»
- **sua9 · aviso** (siempre en existentes, no cambia la aplicabilidad): «La adecuación de los edificios existentes en lo que sea susceptible de ajustes razonables la exige el Real Decreto Legislativo 1/2013, no el DB-SUA.» Rotular LEÍDO (comentario), [DccSUA] p. 5.

### D.4 Protección frente al ruido (DB-HR)

| Clave | R | A | CUp | CUc | Cita |
|---|---|---|---|---|---|
| hr | P2 = no → `no_aplica`; P2 = sí → `aplica` (salvo protegido catalogado incompatible, D.0.5) | `no_aplica` (literal d), con la recomendación de la Guía en la nota; P2 = sí → `aplica` | P3d (la zona pasa a vivienda o a recinto de actividad) → `aplica_reformado` (prudente, K-REF.4); si no → `no_aplica` | `aplica` (K-REF.4) | DB-HR, Introducción II d); CTE Parte I art. 2; [GuíaHR] pp. 20–21 |

Párrafos:

- **hr · no aplica (R y A):** «DB-HR Protección frente al ruido: no es de aplicación — la obra es una [reforma / ampliación] en un edificio existente que no constituye rehabilitación integral, y el DB-HR excluye de su ámbito las obras de ampliación, modificación, reforma o rehabilitación en los edificios existentes, salvo cuando se trate de rehabilitación integral (DB-HR, Introducción II d).» Para A añadir: «No obstante, la Guía de aplicación del DB-HR recomienda que las zonas ampliadas cumplan sus exigencias, por ser asimilables a una obra nueva.»
- **hr · rehabilitación integral:** «DB-HR Protección frente al ruido: es de aplicación — la obra es una rehabilitación integral, en la que se modifican sustancialmente y de forma simultánea particiones, forjados y envolvente, supuesto que queda dentro del ámbito del DB-HR (Introducción II d).» *(La definición de rehabilitación integral es de la Guía DB-HR, no reglamentaria; la decide el proyectista.)*
- **hr · cambio de uso característico:** «DB-HR Protección frente al ruido: es de aplicación — el edificio cambia su uso característico, caso en el que deben cumplirse las exigencias básicas del CTE (CTE Parte I, art. 2, cambio de uso); la exclusión de la Introducción II d) del DB-HR no menciona los cambios de uso.»
- **hr · cambio de uso parcial a vivienda o a recinto de actividad:** «DB-HR Protección frente al ruido: se aplica a la zona que cambia de uso a [vivienda / recinto de actividad colindante con otras unidades de uso]. La exclusión de la Introducción II d) del DB-HR no menciona los cambios de uso, y la Guía de aplicación del DB-HR recomienda aplicar sus exigencias en estos casos. Si alguna limitación técnica impide la adecuación completa, se adoptan las soluciones que permiten el mayor grado posible de adecuación efectiva (CTE Parte I, art. 2.3).»

### D.5 Ahorro de energía (DB-HE) y REBT

| Clave | R | A | CUp | CUc | Cita |
|---|---|---|---|---|---|
| he1 | P5a = no (ni envolvente ni particiones) y P5c = no → `no_aplica`; si no → `aplica_reformado` (Ulim, permeabilidad y particiones de los elementos afectados; condensaciones en esos elementos) | `aplica_reformado` (envolvente de la parte ampliada) | `aplica_reformado` a la envolvente de las unidades que cambian de uso, sin la restricción de reformas (K-REF.8) | `aplica` | HE 1 ap. 1, 3.1.1 pto 2, 3.1.3 pto 3, 3.2 pto 2 |
| he0he1_global | `externo` si P5b > 25 % (K y qsol; además HE 0 si P6 = sí, todo el edificio). Si no → `no_aplica` | `externo` si P4b (> 10 %) [K]; HE 0 además si P4a > 50 m². Si no → `no_aplica` | `externo` (K «cambios de uso» y qsol; HE 0 si > 50 m² útiles) | `externo` | HE 0 ap. 1; HE 1 tablas 3.1.1.b/c, 3.1.2 |
| he4 | `aplica` si (P2 = sí o P6 = sí, en generación centralizada) **y** demanda > 100 l/d; o si demanda inicial > 5.000 l/d y aumenta > 50 %. Si no → `no_aplica` | `aplica` solo si demanda inicial > 5.000 l/d y aumento > 50 % (sobre el incremento). Si no → `no_aplica` | `no_aplica` (salvo el caso c) | `aplica` si demanda > 100 l/d | HE 4 ap. 1 pto 1 b), c), d); 3.1 pto 2 |
| he5 | `aplica` si P2 = sí y S construida > 1.000 m². Si no → `no_aplica` | `aplica` si la superficie construida **ampliada** > 1.000 m² (cálculo sobre lo ampliado). Si no → `no_aplica` | `no_aplica` | `aplica` si S > 1.000 m² | HE 5 ap. 1 pto 1 b), c) |
| he6 | `aplica` si hay aparcamiento y (P10a y P5b > 25 %) o P10b (eléctrica del edificio > 50 %, aparcamiento interior y derecho del promotor) o P10c (eléctrica del aparcamiento > 50 %); exclusiones a) y b). Si no → `no_aplica` | `aplica` si P10a y P4b (> 10 %) y P4a (> 50 m² útiles); o P10b/P10c | `no_aplica` (salvo P10b/P10c) | `aplica` si hay aparcamiento | HE 6 ap. 1 ptos 1 b) y 2 |
| rebt | P12: no se actúa → `no_aplica`; se modifica o amplía → `aplica_reformado` (parte modificada) | `aplica_reformado` (instalación de la ampliación y su efecto en la previsión) | `aplica_reformado` (instalación de la zona con su nuevo uso) | `aplica` | REBT art. 2.2; ITC-BT-04 ap. 3.2 y 4 |
| dbse | P9 = sí → `externo`; no → `no_aplica` (D.0.4) | `externo` | P9 | P9 | CTE Parte I art. 2.4 |

Párrafos:

- **he1 · no aplica (R):** «DB-HE 1 Condiciones para el control de la demanda energética: no es de aplicación — en las reformas los valores límite de transmitancia, de permeabilidad al aire y de particiones interiores se aplican únicamente a los elementos que se sustituyen, incorporan o modifican sustancialmente, o que ven modificadas sus condiciones con incremento de las necesidades energéticas (HE 1 ap. 3.1.1 pto 2, 3.1.3 pto 3 y 3.2 pto 2), y la intervención no actúa sobre la envolvente térmica ni sobre las particiones interiores ni modifica sus condiciones. No se renueva más del 25 % de la envolvente térmica, por lo que no se verifican el coeficiente global K ni el control solar (tablas 3.1.1.b/c y ap. 3.1.2).»
- **he1 · a lo reformado (R ≤ 25 %):** «DB-HE 1: se aplica a los elementos de la envolvente térmica y particiones interiores que se sustituyen, incorporan o modifican sustancialmente — [lista] — y a los que ven modificadas sus condiciones con incremento de las necesidades energéticas (HE 1 ap. 3.1.1 pto 2, 3.1.3 pto 3 y 3.2 pto 2). Se renueva el [p] % de la superficie total de la envolvente térmica final, 25 % o menos, por lo que no se verifican el coeficiente global K ni el control solar.» + D.0.2 (DB-HE, Introducción IV, criterio 1).
- **he1 · a lo reformado (R > 25 %):** igual, terminando: «Se renueva el [p] % (más del 25 %) de la superficie total de la envolvente térmica final: el coeficiente global K, calculado con todos los elementos de la envolvente estén o no afectados, y el control solar se verifican en la justificación energética global (tablas 3.1.1.b/c, fila de reformas, y ap. 3.1.2).»
- **he1 · ampliación:** «DB-HE 1: se aplica a la envolvente térmica de la parte ampliada; los cerramientos que separan la zona ampliada de la existente se consideran de la zona ampliada (DB-HE, Anejo A). [La superficie o el volumen construido aumentan más del 10 %: se verifica el coeficiente global K en la justificación global. | No aumentan más del 10 %: no se aplica el valor límite de K (notas de las tablas 3.1.1.b/c).]»
- **he1 · cambio de uso:** «DB-HE 1: se aplica a la envolvente térmica de [las unidades de uso que cambian de uso / el edificio], con los valores límite correspondientes a cambios de uso (tablas 3.1.1.b/c y ap. 3.1.2). La limitación a los elementos sustituidos o modificados del ap. 3.1.1 pto 2 es propia de las reformas.» Rotular INTERPRETACIÓN (K-REF.8).
- **he0he1_global · no aplica:** «DB-HE 0 y verificación global del HE 1: no son de aplicación — [reforma: no se renuevan de forma conjunta las instalaciones de generación térmica y más del 25 % de la superficie total de la envolvente térmica final (HE 0 ap. 1 pto 1 b), y al no renovarse más del 25 % de la envolvente no se verifican K ni el control solar (HE 1, tablas 3.1.1.b/c y ap. 3.1.2) | ampliación: la superficie o el volumen construido no aumentan más del 10 % (HE 0 ap. 1 pto 1 b; notas de las tablas 3.1.1.b/c)].»
- **he4 · no aplica (R):** «DB-HE 4 Contribución mínima de energía renovable para cubrir la demanda de ACS: no es de aplicación — en edificios existentes la Sección se aplica cuando se reforma íntegramente el edificio o la instalación de generación térmica, o cuando cambia el uso característico (HE 4 ap. 1 pto 1 b), o en ampliaciones e intervenciones con demanda inicial superior a 5.000 l/día que la aumenten más del 50 % (c), y la intervención no está en ninguno de esos casos.» Con generación individual parcial añadir: «La sustitución de generadores en solo una parte de las unidades de uso de una instalación descentralizada no supone la aplicación de la Sección.» (LEÍDO comentario, [DccHE] p. 31).
- **he5 · no aplica:** «DB-HE 5 Generación mínima de energía eléctrica procedente de fuentes renovables: no es de aplicación — [la ampliación no incrementa la superficie construida en más de 1.000 m² (HE 5 ap. 1 pto 1 b) | la intervención no es una reforma íntegra ni un cambio de uso característico de un edificio de más de 1.000 m² construidos (c)].»
- **he6 · no aplica (existentes):** «DB-HE 6 Dotaciones mínimas para la infraestructura de recarga de vehículos eléctricos: no es de aplicación — la intervención no está en ninguno de los supuestos de edificios existentes de la Sección: cambio de uso característico; ampliación con intervención en el aparcamiento que incremente más del 10 % la superficie o el volumen de las unidades intervenidas con más de 50 m² útiles ampliados; reforma con intervención en el aparcamiento que renueve más del 25 % de la envolvente térmica final; o intervención en la instalación eléctrica que afecte a más del 50 % de la potencia instalada del edificio (con aparcamiento interior y derecho del promotor a actuar en él) o del aparcamiento (HE 6 ap. 1 pto 1 b).»
- **he6 · exclusión b):** «… queda excluido por el ap. 1 pto 2 b): edificio existente [de uso residencial privado | de uso distinto con 20 plazas o menos] en el que el coste de cumplir la Sección, [x] €, supera el 7 % del coste de ejecución material de la intervención, [y] €.»
- **rebt · no aplica:** «REBT, previsión de cargas: no es de aplicación — la intervención no modifica, repara ni amplía la instalación eléctrica (REBT, art. 2.2).»
- **rebt · a lo reformado:** «REBT: se aplica a la parte de la instalación eléctrica que se modifica o amplía — [lista] — (REBT, art. 2.2). [Instalación anterior al REBT de 2002: solo a la parte modificada, reparada o ampliada, tomando las medidas necesarias para garantizar la seguridad del conjunto de la instalación (art. 2.2 b).] [La modificación afecta a más del 50 % de la potencia instalada: es de importancia a efectos de documentación e inspección inicial (art. 2.2).]»

---

## Bloque E — Preguntas cerradas del asistente de alcance

Once preguntas; las que tienen subapartado solo se muestran si la principal lo pide. La app ya conoce el municipio (Apéndice B del HS 6), el uso, las plazas de aparcamiento, la superficie y la demanda de ACS de El edificio.

| # | Pregunta | Respuestas | Reglas que dispara |
|---|---|---|---|
| **P1** | ¿Qué tipo de obra es? (varias a la vez) | ☐ Reforma · ☐ Ampliación · ☐ Cambio de uso · ☐ Solo mantenimiento o reparación puntual | Todas. «Solo mantenimiento» → D.0.1 y fin. Hoy `Intervencion` es un valor único: hace falta un conjunto (K-REF.1) |
| **P2** | ¿Es una reforma o rehabilitación integral? (se modifican sustancialmente y a la vez particiones, forjados y envolvente) | Sí / No | hr, he4 (b), he5 (c) |
| **P3** | (si cambio de uso) a) ¿Cambia el uso característico de todo el edificio o solo el de una parte o un establecimiento? b) ¿La superficie útil que cambia de uso supera 50 m²? c) ¿Se transforma en vivienda una zona de otro uso dentro de un edificio de viviendas existente? d) ¿La zona pasa a vivienda o a recinto de actividad colindante con otras unidades de uso? | a) Característico / Parcial · b–d) Sí / No | a) R-A3 en todas; hs2, he4, he5, he6. b) he0he1_global (HE 0). c) si1–si6 (excepción del criterio 8). d) hr |
| **P4** | (si ampliación) a) Superficie útil ampliada [m²]. b) ¿Aumenta más del 10 % la superficie o el volumen construido de las unidades de uso afectadas? c) Superficie construida ampliada [m²]. d) ¿Cambia la altura de evacuación o se añaden plantas? | Números / Sí-No | a, b) he0he1_global, he6. c) he5 (> 1.000). d) si3, si5, sua8, sua9 |
| **P5** | Envolvente: a) ¿Se sustituyen, incorporan o modifican sustancialmente elementos de la envolvente térmica o particiones interiores? ¿Cuáles? b) ¿Qué parte de la superficie total de la envolvente térmica **final** se renueva? c) ¿Algún espacio pasa a estar acondicionado, o algún elemento pasa a ser envolvente? | a) ☐ Fachadas · ☐ Huecos · ☐ Cubiertas · ☐ Suelos o muros en contacto con el terreno · ☐ Medianerías · ☐ Particiones interiores. b) 25 % o menos / Más del 25 %. c) Sí / No | a) hs1, hs6, he1, si2, si5, sua1, sua2. b) he0he1_global, he6. c) he1 (3.1.1 pto 2 b) |
| **P6** | ¿Se renueva la instalación de generación térmica (generador de calefacción o ACS)? | No / Sí, la general del edificio / Sí, solo en algunas unidades | he4 (b), he0he1_global (HE 0, junto con P5b) |
| **P7** | Agua: a) ¿Se amplía el número o la capacidad de los aparatos receptores (sanitarios, puntos de consumo)? b) ¿Se modifican cubiertas o la red de pluviales? | a) No se actúa / Se modifica sin aumentar aparatos / Se aumentan / Instalación nueva completa. b) Sí / No | hs4, hs5 |
| **P8** | Interior: ¿qué se modifica? | ☐ Distribución u ocupación respecto a los elementos de evacuación · ☐ Elementos de evacuación (puertas, pasillos, escaleras) · ☐ Compartimentación o locales de riesgo especial · ☐ Revestimientos o falsos techos · ☐ Soportes o recorridos de instalaciones PCI · ☐ Suelos, barandillas, escaleras o rampas · ☐ Vidrios o puertas · ☐ Aseos · ☐ Alumbrado de zonas de circulación · ☐ Itinerarios o elementos de accesibilidad · ☐ Viviendas, trasteros o almacén de residuos (locales de ventilación) | si1, si3, si4, sua1–sua4, sua9, hs3 |
| **P9** | ¿La intervención incluye actuaciones en la estructura preexistente? | Sí / No | dbse (Parte I art. 2.4), si6 |
| **P10** | Aparcamiento: a) ¿Se interviene en el aparcamiento? b) ¿Se interviene en la instalación eléctrica del edificio afectando a más del 50 % de su potencia instalada, con el aparcamiento en el interior y derecho del promotor a actuar en él? c) ¿Se interviene en la instalación eléctrica del aparcamiento afectando a más del 50 % de su potencia? | Sí / No | he6, sua7, hs3 (garaje) |
| **P11** | ¿El edificio está protegido oficialmente (catalogado, BIC o en un entorno declarado)? | Sí / No | D.0.5 en he0he1_global, he1, he6, hr, si1–si6, sua1–sua9, he5 (3 pto 2) |
| P12 | (incluida en P10/P8 si se prefiere) Instalación eléctrica | No se actúa / Se modifica o amplía / Instalación nueva completa; ☐ es anterior al REBT de 2002 | rebt |

**Lo que no se resuelve con preguntas cerradas** (queda al proyectista, con la propuesta rotulada como editable):
1. Si una modificación es «sustancial» (HE 1) y qué cuenta como «renovar» envolvente (pintar no; cambiar ventanas o añadir aislamiento, probablemente sí). El DB no lo define.
2. Si la obra es «reforma integral / rehabilitación integral»: ningún texto reglamentario lo define (A.13). P2 da la definición de la Guía DB-HR como ayuda.
3. Si aplicar el DB a un elemento «supone una mayor adecuación» (SI crit. 9; SUA crit. 3) o una «mejora efectiva» (DB-HE crit. 2 b): juicio técnico, y la proporcionalidad de los comentarios.
4. Si procede la flexibilidad y con qué motivo, qué nivel se alcanza y qué condicionantes de uso quedan (A.4, A.5, B.2, B.3).
5. Mantenimiento frente a reforma en casos límite (reparación puntual frente a sustitución).
6. Qué uso es el «característico», en edificios mixtos y en el DB-HE (normas urbanísticas, [DccHE] p. 9).
7. Si el cambio de actividad cambia el perfil de riesgo (DB-SI, comentario).
8. El coste de cumplir HE 6 frente al 7 % del PEM (exclusión b): cifra del proyecto.
9. Si un elemento existente sin intervenir tiene daños que «hayan mermado de forma significativa sus prestaciones» (DB-HE crit. 3).
10. En protegidos, qué elementos son inalterables: lo fija la autoridad que dicta la protección, no la app.

---

## Bloque F — Lo no verificable o ambiguo, con la recomendación más prudente

| # | Duda | Por qué | Recomendación prudente |
|---|---|---|---|
| F.1 | Numeración del cambio de uso en el art. 2 (5 o 6) | Ministerio: ap. 5; BOE: ap. 6, con 5 derogado y 7 anulado (LEÍDO web) | Citar «CTE Parte I, art. 2 (cambio de uso)» sin número (K-REF.2). Cotejar el BOE antes de fijar un número |
| F.2 | HR en cambio de uso | d) no nombra el cambio de uso; la Guía lo lee como excluido pero recomienda aplicarlo; la Parte I obliga a las exigencias básicas en el característico | CUc → `aplica`. CUp a vivienda o recinto de actividad → `aplica_reformado`. Resto → `no_aplica` (K-REF.4) |
| F.3 | HR en ampliación | d) la excluye; la Guía recomienda que la zona ampliada cumpla | `no_aplica` con la recomendación en el párrafo. Si la ampliación crea viviendas nuevas, avisar al usuario |
| F.4 | HE 1 en cambio de uso: ¿Ulim a todos los elementos? | La restricción del 3.1.1 pto 2 es solo para reformas | Aplicar sin restricción a la envolvente de las unidades que cambian de uso; flexibilidad si no es viable (K-REF.8) |
| F.5 | HE 1 condensaciones (3.3) en reformas | El 3.3 no distingue | Comprobar los elementos intervenidos; en los no intervenidos, solo el criterio 3 (daños) (K-REF.9) |
| F.6 | HS 4/HS 5 en renovación completa sin más aparatos | El literal incluye las intervenciones «cuando se amplía el número o la capacidad»; a contrario, la renovación sin aumento queda fuera | Renovación completa → `aplica_reformado` (prudente); modificación parcial sin aumento → `no_aplica` (K-REF.7) |
| F.7 | HS 5 pluviales | El criterio de «aparatos receptores» no encaja con la red de pluviales | Aplicar a la red de pluviales de las cubiertas modificadas o ampliadas |
| F.8 | HS 2 en cambio de uso característico a viviendas | Ámbito literal: nueva construcción. La Parte I exige la exigencia básica | `aplica` con estudio específico por analogía (K-REF.5) |
| F.9 | HS 1, HS 3 sin regla propia | El DB-HS no tiene criterios de existentes | Aplicar a lo intervenido (Parte I art. 2.3); en CUc, todo |
| F.10 | «Reforma íntegra» (HE 4, HE 5) y «rehabilitación integral» (HR) | Sin definición reglamentaria | Una sola pregunta (P2) con la definición de la Guía DB-HR, rotulada como no reglamentaria (K-REF.3) |
| F.11 | SUA 8 en cambio de uso parcial | El cálculo es del edificio entero y depende del uso | `aplica` (prudente; el cálculo es barato) (K-REF.11) |
| F.12 | Guía DB-HE (HE 1 en existentes), DA DB-SUA/2, Guía del articulado del REBT | No leídos en esta sesión | Releer con renderizador antes de añadir tolerancias numéricas (DA DB-SUA/2 tabla 2) o ejemplos de la Guía DB-HE |
| F.13 | Lectura de los DB en texto, no en imagen | Sin `pdftoppm` | Las frases son prosa sin tablas; riesgo bajo. Cotejar en imagen [HE22] pp. 5, 9, 15–18 y [SI25] pp. 5–6 antes de publicar los párrafos |

---

## Decisiones de producto (K-REF)

Todas son **CRITERIO**: la norma no las fija y la ficha las rotula así.

| # | Caso | Supuesto propuesto | Base |
|---|---|---|---|
| K-REF.1 | Tipo de intervención | Pasar `Intervencion` a un **conjunto** (reforma + ampliación + cambio de uso) más «solo mantenimiento». Se evalúa cada tipo y gana el más exigente | A.9; D.0 |
| K-REF.2 | Cita del cambio de uso | «CTE Parte I, art. 2 (cambio de uso)», sin número de apartado | F.1 |
| K-REF.3 | Integral | Una pregunta (P2) para HR, HE 4 b) y HE 5 c), con la definición de la Guía DB-HR | A.13; F.10 |
| K-REF.4 | HR y cambio de uso | CUc → `aplica`; CUp a vivienda o recinto de actividad → `aplica_reformado`; resto → `no_aplica`. **Cambia la regla actual** (hoy `no_aplica` en todo existente) | C.36–C.39 |
| K-REF.5 | HS 2 en CUc a viviendas | `aplica`, como estudio específico con los criterios de la Sección | C.30; A.6 |
| K-REF.6 | HS 2 en ampliación | `no_aplica`; aviso si la ampliación crea un edificio de viviendas nuevo independiente (sería obra nueva) | `verificacion-hs2.md` K10 |
| K-REF.7 | HS 4/HS 5 | Cuatro respuestas en P7a; «instalación nueva completa» → `aplica_reformado` | C.32–C.33; F.6 |
| K-REF.8 | HE 1 en cambio de uso | Sin la restricción de reformas; fila «Cambios de uso» de Klim | C.19 |
| K-REF.9 | HE 1 condensaciones en reformas | En los elementos intervenidos | C.17 |
| K-REF.10 | Externas | El motor evalúa reglas también para `he0he1_global` y `dbse` **antes** de marcar `externo` (hoy el paso 1 de `aplicabilidadBase` las cortocircuita) | D.5; A.5c |
| K-REF.11 | SUA 8 | R → `no_aplica`; A, CUp, CUc → `aplica` | C.SUA |
| K-REF.12 | Párrafo de no empeoramiento | Se añade siempre a `aplica_reformado` | R-B1 |
| K-REF.13 | Protegidos | P11 = sí no cambia la propuesta por sí solo: añade el aviso D.0.5 y habilita `no_aplica` (HE 0, HE 1, HE 6, HR) o `aplica_flexibilidad` (resto) | D.0.5 |

---

## Cifras para el código

```
# CTE Parte I (consolidado Ministerio 14-06-2022; art. 2 = redacción Ley 8/2013)
PARTE_I.intervencion           = ["ampliacion", "reforma", "cambio_uso"]   # Anejo III, p. 24
PARTE_I.mantenimiento          = fuera del CTE (comentario: DccSI p. 8, DccSUA p. 11)
PARTE_I.cita.flexibilidad      = "CTE Parte I, art. 2.3"
PARTE_I.cita.estructura        = "CTE Parte I, art. 2.4"
PARTE_I.cita.cambioUso         = "CTE Parte I, art. 2 (cambio de uso)"      # ap. 5 Ministerio / ap. 6 BOE

# HE 0 (p. 9) — estrictos ">"
HE0.ampliacion   = {incrementoSupOVol: 0.10, supUtilAmpliada_m2: 50}       # ambas
HE0.cambioUso    = {supUtilTotal_m2: 50}
HE0.reforma      = {renuevaGeneracion: true, envolventeRenovada: 0.25}     # ambas → todo el edificio
# HE 1 (pp. 15–18)
HE1.K.ampliacion = {incrementoSupOVol: 0.10}                               # notas tablas 3.1.1.b/c
HE1.K.reforma    = {envolventeRenovada: 0.25}                              # sobre la envolvente FINAL
HE1.qsol         = nuevo | ampliacion | cambioUso | reforma>0.25
HE1.n50          = solo edificios nuevos residencial privado > 120 m² útiles
HE1.Kexento      = demandas calef. y refrig. < 15 kWh/m² (ambas)
# HE 4 (p. 28)
HE4.existente.b  = demanda > 100 l/d && (reformaIntegra(edificio|generacion) || cambioUsoCaracteristico)
HE4.existente.c  = demandaInicial > 5000 l/d && incremento > 0.50          # sobre el incremento
# HE 5 (p. 31)
HE5.ampliacion   = supConstruidaAmpliada > 1000 m²                         # cálculo sobre lo ampliado
HE5.reforma      = (reformaIntegra || cambioUsoCaracteristico) && supConstruida > 1000 m²
# HE 6 (p. 33): ver verificacion-he6.md (10 %, 50 m², 25 %, 50 %, 7 % PEM)
# HS 4 / HS 5 (pp. 81, 111)
HS45.intervencionIncluida = aumentaNumeroOCapacidadAparatos
# HS 6 (p. 138)
HS6.existente = {ampliacion: "parte nueva", cambioUsoCaracteristico: "todo", cambioUsoParcial: "zona afectada", reforma: "zona afectada si modifica la protección"}
# REBT (p. 9)
REBT.modificacionImportancia = potenciaAfectada > 0.50   # a efectos de documentación e inspección inicial
```
