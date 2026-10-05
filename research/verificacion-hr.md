# Verificación normativa — DB-HR «Protección frente al ruido», opción simplificada, para el módulo HR (feature-25)

**Fecha:** 2026-10-05 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** DB-HR completo en lo que toca a vivienda (unifamiliar y plurifamiliar, con locales, oficinas, garaje, trasteros, zonas comunes y cuartos de instalaciones en el mismo edificio): Introducción II (ámbito), ap. 1.1, ap. 2 (2.1, 2.2, 2.3), opción simplificada 3.1.2 completa (tablas 3.1, 3.2, 3.3 y 3.4 transcritas celda a celda), 3.1.4 (uniones), 3.3 (instalaciones), Anejo A (términos), Anejo I (unifamiliar adosada, tabla I.1) y Anejo K (ficha K.1). Comentarios del Ministerio (DccHR) a todo lo anterior. Puntos A a P del encargo, en ese orden.

**Regla aplicada:** VERIFICADO solo si el literal se ha leído en la **imagen** de la página (PNG a 200 ppp ya renderizados). Imágenes leídas en esta sesión y usadas aquí: DBHR pp. 1, 2, 3, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 32, 33, 36, 37, 48, 51, 55, 56, 57, 71, 72, 75 y 76; DccHR pp. 4, 12, 24, 30 y 32. El resto se ha leído en el texto extraído y se marca «(texto)». **Las tablas 3.2, 3.3 y 3.4 se han transcrito SOLO desde la imagen** (el texto extraído sale desordenado; se ha usado únicamente para cotejar el orden de los números, y coincide en todas las celdas). Veredictos:
- **VERIFICADO**: literal del DB, leído en la imagen.
- **LEÍDO (comentario)**: literal del DB con comentarios del Ministerio (no reglamentario). Se puede mostrar, rotulado como tal.
- **CORREGIDO**: lo que dice el encargo, o una fuente previa del repo, no coincide con la fuente.
- **INTERPRETACIÓN**: se sigue del DB, pero el DB no lo escribe tal cual.
- **NO LO FIJA EL DB → CRITERIO**: decisión de producto. No es exigencia del CTE y la ficha la rotula así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [HR19] | CTE DB-HR «Protección frente al ruido», texto consolidado | **20 diciembre 2019** (portada, p. 1). p. 2: aprobado por RD 1371/2007 (BOE 23/10/2007); modificado por corrección de errores del RD 1371/2007 (BOE 20/12/2007), RD 1675/2008 (BOE 18/10/2008), Orden VIV/984/2009 (BOE 23/04/2009), corrección de errores y erratas de la Orden VIV/984/2009 (BOE 23/09/2009) y **RD 732/2019 (BOE 27/12/2019)**. No hay modificaciones posteriores | `research/pdf/DBHR.pdf` | Imagen: ver arriba |
| [DccHR] | DB-HR con comentarios del MITMA | Articulado 20-12-2019; comentarios 20-12-2019 (portada). Versiones previas de comentarios: 30-06-2011, 30-06-2015, 30-04-2016, 30-06-2016, 23-12-2016 | `research/pdf/DccHR.pdf` | Imagen: pp. 4, 12, 24, 30, 32. Texto: pp. 3, 5, 9–27, 31, 47, 67, 83–84 |
| [Guía-HR] | Guía de aplicación del DB-HR (V.03, citada por los comentarios como «versión publicada en la web del CTE en diciembre de 2016») | — | **No disponible** (descarga 404 según el encargo; la página `codigotecnico.org/Guias/GuiaHR.html` existe) | No leída. Varios pendientes dependen de ella |
| [REPO] | `src/lib/proyecto/aplicabilidad.ts`, `src/data/justificacionRegistry.ts`, `src/lib/obra/filas.ts` | Estado actual | repo | Revisión en el bloque Q |

Confirmación de edición (web, solo para ediciones): codigotecnico.org publica como vigente el DB-HR de **20-dic-2019** (y su versión con comentarios de la misma fecha). [Documento Básico HR](https://www.codigotecnico.org/pdf/Documentos/HR/DBHR.pdf) · [Protección frente al ruido](https://www.codigotecnico.org/DocumentosCTE/ProteccionRuido.html) · [Guía de aplicación del DB-HR](https://www.codigotecnico.org/Guias/GuiaHR.html).

Avisos de las propias fuentes:
- [HR19] p. 2 (imagen): «Este texto consolidado no tiene valor jurídico.»
- [DccHR] p. 3 (texto): «Los comentarios tienen un carácter orientativo e informativo no teniendo carácter reglamentario.» El mismo párrafo repite: «Este texto consolidado no tiene valor jurídico.»

**Correcciones (resumen; el detalle va en cada bloque):**
1. **El DB-HR SÍ se aplica a la vivienda unifamiliar aislada.** La regla de `aplicabilidad.ts` («el ámbito del DB-HR excluye las viviendas unifamiliares aisladas») es **FALSA**: las exclusiones de la Introducción II son solo a) recintos ruidosos, b) recintos de espectáculos, c) aulas y salas de conferencias > 350 m³ y d) obras en edificios existentes salvo rehabilitación integral. En la aislada aplican, como mínimo, la tabiquería RA ≥ 33 dBA (2.1.1 a.i y b.i), el aislamiento frente al exterior de los recintos protegidos (2.1.1 a.iv, tabla 2.1) y el ruido y vibraciones de las instalaciones (2.3 y 3.3). No hay ningún comentario del Ministerio sobre «unifamiliar aislada». (A.1–A.6)
2. La misma regla dice que en la **adosada** el DB-HR aplica «únicamente respecto de los elementos de separación con otros edificios». También es **falso**: el Anejo I da tabiquería, elementos de separación verticales entre viviendas (no medianería), horizontales si comparten estructura, y fachadas y cubiertas por 3.1.2.5. (A.4, M)
3. La edición del registro del repo, «DB-HR (consolidado 2022)», es **errónea**: el texto vigente es el consolidado de **20-12-2019**, cuya última modificación es el RD 732/2019. (0, Q.2)
4. **Garaje = recinto de actividad** por definición del propio DB (Anejo A), no solo por comentario, salvo el de uso privativo de una vivienda unifamiliar. **Local y oficinas en un edificio de viviendas = recinto de actividad** por comentario del Ministerio (el DB los define por > 70 dBA). **Trasteros = recinto no habitable** (Anejo A, literal). **Almacén de contenedores = recinto de instalaciones** (3.3.3.4). (B)
5. En residencial privado **no hay ninguna exigencia de tiempo de reverberación ni de absorción** (2.2 pto 2 cita residencial público, docente y hospitalario). Si un local fuese restaurante o cafetería con comidas: T ≤ 0,9 s. (D)
6. Las filas de la tabla 2.1 son **Ld ≤ 60 · 60 < Ld ≤ 65 · 65 < Ld ≤ 70 · 70 < Ld ≤ 75 · Ld > 75**. Los 60 dBA por defecto valen **solo para áreas acústicas de predominio residencial**. (C.9–C.11)
7. La tabla 3.4 tiene filas para **todos** los D2m,nT,Atr que puede dar la tabla 2.1 (30, 32, 37, 42, 47) y para los mismos +4 dBA de aeronaves (34, 36, 41, 46, 51). Un «31» solo aparece si lo impone otra norma (p. ej. una ordenanza). (J.4)
8. **Ascensor:** el DB dice RA «**mayor que** 50 dBA» (estricto); el comentario dice «≥ 50». (L.11)
9. Tablas 3.2 y 3.3: hay celdas con **alternativas dominadas** (p. ej. 3.3, forjado 400, fábrica con apoyo directo: (0;2), (2;0), (9;2), (5;5), (2;15)). Se transcriben literalmente; el motor debe aceptar cualquier alternativa cumplida (K-HR.11). Y la nota (6) de la tabla 3.2 tiene un **segundo párrafo** en la p. 18 con 45 dBA, distinto de los 42 dBA de la nota (5). (G.7, H.3)

---

## Bloque A — Ámbito (Introducción II) y su efecto en vivienda — punto A del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| A.1 | Regla general del ámbito | VERIFICADO | El del CTE (Parte I, art. 2), menos cuatro excepciones | «El ámbito de aplicación de este DB es el que se establece con carácter general para el CTE en su artículo 2 (Parte I) exceptuándose los casos que se indican a continuación:» | [HR19] p. 3 |
| A.2 | Las cuatro excepciones | VERIFICADO | a) «los *recintos ruidosos*, que se regirán por su reglamentación específica;» b) «los *recintos* y edificios de pública concurrencia destinados a espectáculos, tales como auditorios, salas de música, teatros, cines, etc., que serán objeto de estudio especial en cuanto a su diseño para el acondicionamiento acústico, y se considerarán *recintos de actividad* respecto a las unidades de uso colindantes a efectos de aislamiento acústico;» c) «las aulas y las salas de conferencias cuyo volumen sea mayor que 350 m³, … y se considerarán *recintos protegidos* respecto de otros *recintos* y del exterior a efectos de aislamiento acústico;» d) ver A.7 | ídem | [HR19] p. 3 |
| A.3 | «El DB-HR excluye las viviendas unifamiliares aisladas» (`aplicabilidad.ts`) | **CORREGIDO** | **Falso.** Ninguna de las cuatro excepciones nombra la vivienda unifamiliar, aislada ni adosada. La única mención a la unifamiliar en el articulado es para (i) la opción simplificada de la adosada (3.1.2.1 pto 1 y Anejo I) y (ii) el garaje privativo, que no es recinto de actividad (Anejo A) | A.2; 3.1.2.1 pto 1: «La opción simplificada es válida para edificios de cualquier uso. En el caso de vivienda unifamiliar adosada, puede aplicarse el Anejo I.» | [HR19] pp. 3, 12, 55 |
| A.4 | ¿Qué le aplica a la unifamiliar **aislada**? | VERIFICADO (exigencias) + INTERPRETACIÓN (cuáles tienen objeto) | (1) **Tabiquería RA ≥ 33 dBA** (2.1.1 a.i y b.i: «en edificios de uso residencial privado»). (2) **Aislamiento frente al exterior** de cada recinto protegido, D2m,nT,Atr ≥ tabla 2.1 (2.1.1 a.iv), que en simplificada se justifica con la tabla 3.4. (3) **Medianería** RA ≥ 45 dBA si la vivienda linda con otro edificio (2.1.1 c y 3.1.2.4); en una aislada estricta no hay. (4) **Ruido y vibraciones de las instalaciones** (2.3 y 3.3; p. ej. bomba de calor en cubierta, 2.3 pto 3). (5) Las uniones de 3.1.4 que tengan objeto. **No tienen objeto**: aislamiento entre unidades de uso (2.1.1 a.ii, b.ii) e impactos (2.1.2), porque solo hay una unidad de uso; ni recintos de actividad (su garaje es privativo, B.6) | 2.1.1 a) i): «Protección frente al ruido generado en recintos pertenecientes a la misma *unidad de* uso en edificios de uso residencial privado: − El índice global de reducción acústica, ponderado A, RA, de la *tabiquería* no será menor que 33 dBA.» · a) iv): «El *aislamiento acústico a ruido aéreo*, D2m,nT,Atr, entre un *recinto protegido* y el exterior no será menor que los valores indicados en la tabla 2.1, en función del uso del edificio y de los valores del índice de ruido día, Ld, definido en el Anexo I del Real Decreto 1513/2005, de 16 de diciembre, de la zona donde se ubica el edificio.» | [HR19] pp. 8, 9, 11 |
| A.5 | Comentarios del Ministerio sobre la unifamiliar aislada | VERIFICADO que **no hay** | Búsqueda en todo el texto de [DccHR]: «aislada» no aparece. «Unifamiliar» aparece solo en: Anejo I (adosada), excepción de escaleras (adosadas y dúplex, O.7) y garaje privativo (B.6). El comentario a 2.1 dice que las exigencias de aislamiento se aplican a «Edificios de uso residencial: Público y privado», sin excluir tipologías | «Las exigencias de aislamiento del DB HR se aplican a: - Edificios de uso residencial: Público y privado; - De uso sanitario: Hospitalario y centros de asistencia ambulatoria; - De uso docente; - Administrativos.» | [DccHR] p. 10 (texto) |
| A.6 | ¿Qué le aplica a la **adosada**? | VERIFICADO + LEÍDO (comentario) | Puede usar el Anejo I (M). El comentario: si las unidades de uso solo están separadas por elementos verticales (adosadas), se aplica solo lo relativo a elementos de separación verticales y a fachada, cubierta y suelos en contacto con el aire exterior; si comparten estructura horizontal, impactos sí | Comentario 3.1.2.2: «En el caso de que se tratase de un edificio en el que las unidades de uso sólo están separadas por elementos de separación verticales, tal como es el caso de viviendas adosadas, se aplicaría sólo el apartado relativo a los elementos de separación verticales y de fachada, cubierta y suelos en contacto con el aire exterior.» | [HR19] p. 71; [DccHR] p. 17 (texto) |
| A.7 | Edificios existentes (exclusión d) | VERIFICADO | **Excluidas** las obras de ampliación, modificación, reforma o rehabilitación en existentes, **salvo rehabilitación integral**. Y dentro de la rehabilitación integral, excluidos los edificios protegidos por su catalogación (BIC) cuando cumplir altere de modo incompatible fachada, distribución o acabado interior | «d) las obras de ampliación, modificación, reforma o rehabilitación en los edificios existentes, salvo cuando se trate de rehabilitación integral. Asimismo, quedan excluidas las obras de rehabilitación integral de los edificios protegidos oficialmente en razón de su catalogación, como bienes de interés cultural, cuando el cumplimiento de las exigencias suponga alterar la configuración de su *fachada* o su distribución o acabado interior, de modo incompatible con la conservación de dichos edificios.» | [HR19] p. 3 |
| A.8 | ¿Qué es «rehabilitación integral»? | **NO LO DEFINE el DB-HR** | No está en el Anejo A (búsqueda en el texto completo: solo aparece en la exclusión d). El DB-HR conserva esta exclusión propia tras el RD 732/2019. Decisión del usuario (K-HR.1) | — | [HR19] (texto) |
| A.9 | Recintos ruidosos y local sin uso definido | LEÍDO (comentario) | Ruidoso ≥ 80 dBA; entre 70 y 80 dBA es recinto de actividad. Como en proyecto rara vez se conoce la actividad del local, el proyectista puede considerarlo inicialmente **de actividad** y hacerlo constar en las Instrucciones de uso y mantenimiento. Si luego la actividad supera 80 dBA, se adoptan medidas | «Durante la realización del proyecto, rara vez se conoce la actividad concreta que va a desarrollarse en lo que en principio podrían calificarse como recintos de actividad, … Por ello, y a falta de información más precisa, el proyectista podría considerar dichos recintos inicialmente como de actividad, haciendo constar dicha calificación en las Instrucciones de uso y mantenimiento del edificio.» | [DccHR] p. 4 (imagen) |

**Frases de memoria:**
- Aplica (plurifamiliar): «El edificio es de nueva construcción y de uso residencial privado, por lo que le es de aplicación el DB-HR (Introducción II), sin que concurra ninguna de las excepciones a) a d). Se justifica mediante la opción simplificada (ap. 3.1.2).»
- Aplica (aislada): «La vivienda unifamiliar aislada está dentro del ámbito del DB-HR. Al constituir una única unidad de uso, las exigencias con objeto son: tabiquería (RA ≥ 33 dBA, ap. 2.1.1 a.i), aislamiento frente al ruido exterior de los recintos protegidos (ap. 2.1.1 a.iv, tablas 2.1 y 3.4) y ruido y vibraciones de las instalaciones (ap. 2.3 y 3.3).»
- No aplica: «La obra es una [reforma] en un edificio existente que no constituye rehabilitación integral, por lo que queda excluida del ámbito del DB-HR (Introducción II d).»

---

## Bloque B — Definiciones del Anejo A y clasificación de los recintos — punto B del encargo

| # | Término / pregunta | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| B.1 | Unidad de uso | VERIFICADO | En edificios de vivienda, **cada vivienda** | «*Unidad de uso*: Edificio o parte de un edificio que se destina a un uso específico, y cuyos usuarios están vinculados entre, sí bien por pertenecer a una misma unidad familiar, empresa, corporación, bien por formar parte de un grupo o colectivo que realiza la misma actividad. En cualquier caso, se consideran *unidades de uso*, las siguientes: a) en edificios de vivienda, cada una de las viviendas; b) en edificios de uso hospitalario, y residencial público, cada habitación incluidos sus anexos; c) en edificios docentes, cada aula o sala de conferencias incluyendo sus anexos;» | [HR19] p. 57 |
| B.2 | Recinto habitable | VERIFICADO | En vivienda: dormitorios, comedores, salones, bibliotecas…; **cocinas, baños, aseos, pasillos, distribuidores y escaleras** (en edificios de cualquier uso); oficinas, despachos, salas de reunión en uso administrativo | «*Recinto habitable*: *Recinto* interior destinado al uso de personas cuya densidad de ocupación y tiempo de estancia exigen unas condiciones acústicas, térmicas y de salubridad adecuadas. Se consideran *recintos habitables* los siguientes: a) habitaciones y estancias (dormitorios, comedores, bibliotecas, salones, etc.) en edificios residenciales; b) aulas, salas de conferencias, bibliotecas, despachos, en edificios de uso docente; c) quirófanos, habitaciones, salas de espera, en edificios de uso sanitario u hospitalario; d) oficinas, despachos; salas de reunión, en edificios de uso administrativo; e) cocinas, baños, aseos, pasillos. distribuidores y escaleras, en edificios de cualquier uso; f) cualquier otro con un uso asimilable a los anteriores.» | [HR19] p. 55 |
| B.3 | Recinto protegido | VERIFICADO | Los habitables de los casos a) a d). En vivienda: **dormitorios y estancias** (salón, comedor, estar…). Si un recinto combina usos y uno es protegido, **todo él es protegido** (salón con cocina integrada) | «*Recinto protegido*: *Recinto habitable* con mejores características acústicas. Se consideran *recintos protegidos* los *recintos habitables* de los casos a), b), c), d).» · «En el caso en el que en un *recinto* se combinen varios usos de los anteriores siempre que uno de ellos sea protegido, a los efectos de este DB se considerará *recinto protegido*.» · Comentario: «Siempre que un recinto se combinan usos propios de recintos protegidos y recintos habitables se considera que el recinto es protegido, como por ejemplo, el salón con la cocina integrada.» | [HR19] pp. 55, 56; [DccHR] p. 11 (texto) |
| B.4 | «Estancias» (columna de la tabla 2.1) | VERIFICADO | Recintos protegidos no dormitorio | «Estancias: *Recintos protegidos* tales como: salones, comedores, bibliotecas...etc. en edificios de uso residencial y despachos, salas de reuniones, salas de lectura...etc. en edificios de otros usos.» | [HR19] p. 48 |
| B.5 | Recinto no habitable / **trasteros** | VERIFICADO | **Los trasteros son recintos no habitables**, igual que cámaras técnicas, desvanes no acondicionados «y sus zonas comunes» | «Se consideran *recintos no habitables* aquellos no destinados al uso permanente de personas o cuya ocupación, por ser ocasional o excepcional y por ser bajo el tiempo de estancia, sólo exige unas condiciones de salubridad adecuadas. En esta categoría se incluyen explícitamente como no habitables los trasteros, las cámaras técnicas y desvanes no acondicionados, y sus zonas comunes.» | [HR19] p. 55 |
| B.6 | Recinto de actividad / **GARAJE** | VERIFICADO | **Todo aparcamiento es recinto de actividad** respecto a cualquier uso, **salvo el de uso privativo de una vivienda unifamiliar**. Lo dice el propio DB (Anejo A), no solo el comentario. No depende de los 70 dBA | «*Recinto de actividad*: Aquellos recintos, en los edificios de uso residencial (público y privado), hospitalario o administrativo, en los que se realiza una actividad distinta a la realizada en el resto de los *recintos* del edificio en el que se encuentra integrado, siempre que el nivel medio de presión sonora estandarizado, ponderado A, del *recinto* sea mayor que 70 dBA. Por ejemplo, actividad comercial, de pública concurrencia, etc. A partir de 80dBA se considera *recinto ruidoso*. Todos los aparcamientos se consideran recintos de actividad respecto a cualquier uso salvo los de uso privativo en vivienda unifamiliar.» | [HR19] p. 55 |
| B.7 | **LOCAL** comercial (sin uso definido) | VERIFICADO (definición) + LEÍDO (comentario) | Por el DB: es de actividad si supera 70 dBA (ejemplo literal: «actividad comercial»). Por el comentario: en edificios residenciales, los locales comerciales **se consideran** recintos de actividad; sin uso definido, el proyectista **puede** calificarlo de actividad y constarlo en las Instrucciones de uso (A.9). Ver K-HR.3 | Comentario a 2.1.1 a.iii: «En edificios de uso residencial público o privado u hospitalario, las zonas destinadas a usos diferentes a éstos, como locales comerciales, de uso administrativo, garajes, etc., se considera que son recintos de actividad.» | [HR19] p. 55; [DccHR] pp. 4, 12 (imagen) |
| B.8 | **OFICINAS** (otra unidad de uso, administrativa) en un edificio de viviendas | LEÍDO (comentario) + INTERPRETACIÓN | Por el mismo comentario de B.7, **recinto de actividad** respecto a las viviendas («zonas destinadas a usos diferentes … de uso administrativo»). A la vez, sus despachos son recintos protegidos (B.2 d), de modo que las oficinas tienen protección propia (fachada: tabla 2.1, columna administrativo). El DB no resuelve la doble condición; los valores entre paréntesis de las tablas 3.2/3.3 cubren las dos (55 dBA ≥ 50 dBA). Ver K-HR.3 | ídem B.7 | [DccHR] p. 12 (imagen) |
| B.9 | Recinto de actividad y unidad de uso | LEÍDO (comentario) | Los recintos de instalaciones o de actividad **no son unidad de uso** en sí mismos | «Los recintos de instalaciones o de actividad no se consideran una unidad de uso en sí mismos. Cuando pertenezcan a una unidad de uso, se aplicarán las exigencias de aislamiento acústico especificadas en los puntos 2.1.1.a.iii y 2.1.1.b.iii.» | [DccHR] p. 11 (texto) |
| B.10 | Recinto de instalaciones | VERIFICADO | Contiene equipos de instalaciones **colectivas** susceptibles de alterar las condiciones ambientales. El recinto del ascensor **solo** si la maquinaria está dentro | «*Recinto de instalaciones*: *Recinto* que contiene equipos de instalaciones colectivas del edificio, entendiendo como tales, todo equipamiento o instalación susceptible de alterar las condiciones ambientales de dicho *recinto*. A efectos de este DB, el recinto del ascensor no se considera un recinto de instalaciones a menos que la maquinaria esté dentro del mismo.» | [HR19] p. 55 |
| B.11 | Cuartos concretos | VERIFICADO (los citados) + **NO LO FIJA EL DB → CRITERIO** (el resto) | **Sí por texto del DB:** almacén de contenedores (3.3.3.4 b, «se considera un recinto de instalaciones»); recinto del ascensor con la maquinaria dentro (3.3.3.5); cuartos con quemadores, calderas, bombas de impulsión, maquinaria de ascensores, compresores, grupos electrógenos, extractores (2.3 pto 2 los llama «equipos generadores de ruido estacionario … situados en recintos de instalaciones»). **Calderas, grupo de presión, cuarto de máquinas de ascensor**: de instalaciones. **Contadores (agua, electricidad) y RITI/RITS:** el DB no los nombra; depende de si los equipos «alteran las condiciones ambientales». Ver K-HR.4 | 2.3 pto 2: «El nivel de potencia acústica máximo de los equipos generadores de *ruido estacionario* (como los quemadores, las calderas, las bombas de impulsión, la maquinaria de los ascensores, los compresores, grupos electrógenos, extractores, etc) situados en *recintos de instalaciones*, …» · 3.3.3.4 b): «El almacén de contenedores se considera un recinto de instalaciones y el suelo del almacén de contenedores debe ser flotante.» | [HR19] pp. 11, 36 |
| B.12 | Zona común (rellano, escalera, portal) | VERIFICADO + INTERPRETACIÓN | Da servicio a varias unidades de uso. Pasillos, distribuidores y escaleras son **recintos habitables** «en edificios de cualquier uso» (B.2 e); el portal, asimilable (f). Para una vivienda, la zona común es «otro recinto habitable del edificio no perteneciente a la misma unidad de uso» → 2.1.1 a.ii / b.ii (50 / 45 dBA, puertas 30 / 20). **No** es de actividad ni de instalaciones | «*Zona común*: Zona o zonas que dan servicio a varias *unidades de uso*.» | [HR19] pp. 55, 57 |
| B.13 | Recinto ruidoso | VERIFICADO | > 80 dBA, «de uso generalmente industrial». Fuera del DB (A.2 a) | «*Recinto ruidoso*: *Recinto*, de uso generalmente industrial, cuyas actividades producen un nivel medio de presión sonora estandarizado, ponderado A, en el interior del recinto, mayor que 80 dBA.» | [HR19] p. 56 |
| B.14 | Medianería | VERIFICADO | Linda con otros edificios construidos **o que puedan construirse legalmente** | «*Medianería*: Cerramiento que linda en toda su superficie o en parte de ella con otros edificios ya construidos, o que puedan construirse legalmente.» | [HR19] p. 51 |
| B.15 | Fachada / fachada ligera / cubierta | VERIFICADO (fachada) / (texto) cubierta | Fachada: vertical o ≤ 60°, incluye huecos. Ligera: < 200 kg/m². Cubierta: ≤ 60°, incluye lucernarios | «*Fachada*: Cerramiento perimétrico del edificio, vertical o con inclinación no mayor que 60º sobre la horizontal, que lo separa del exterior. Incluye tanto el muro de *fachada* como los huecos (puertas exteriores y ventanas).» · «*Fachada ligera*: *Fachada* continua y anclada a una estructura auxiliar, cuya masa por unidad de superficie es menor que 200 kg/m².» · Cubierta: «… Debe considerarse cubierta tanto la parte ciega de la misma como los lucernarios.» | [HR19] p. 48; p. 44 (texto) |
| B.16 | Tabiquería | VERIFICADO | Conjunto de particiones interiores de una unidad de uso; tres tipos (fábrica con apoyo directo; fábrica con bandas elásticas o apoyada sobre el suelo flotante; entramado autoportante) | 3.1.2.3.1 pto 3: «La tabiquería está formada por el conjunto de particiones interiores de una *unidad de uso*.» · Anejo A: «Tabiquería de fábrica: Tabiquería formada por unidades de montaje en húmedo, tales como ladrillos huecos, ladrillos perforados, bloques de hormigón, bloques de arcilla aligerada, tabiques de escayola maciza, etc.» · «Tabiquería de entramado: Elemento constructivo formado por dos o más placas de yeso laminado, sujetas a una perfilería autoportante y con una cámara que puede estar rellena con un material poroso, elástico y acústicamente absorbente.» | [HR19] pp. 13, 56 |
| B.17 | Elementos de separación | VERIFICADO | **Verticales:** separan una unidad de uso de cualquier recinto del edificio, o recintos protegidos/habitables de recintos de instalaciones o actividad. **Horizontales:** ídem, formados por forjado (F), suelo flotante (Sf) y, a veces, techo suspendido (Ts) | 3.1.2.3.1 pto 1: «Los elementos de separación verticales son aquellas particiones verticales que separan una *unidad de uso* de cualquier *recinto* del edificio o que separan *recintos protegidos* o *habitables* de *recintos de instalaciones* o *de actividad* …» · pto 2: «Los elementos de separación horizontales son aquellos que separan una *unidad de uso*,de cualquier otro *recinto* del edificio o que separan un *recinto protegido* o un *recinto habitable* de un *recinto de instalaciones* o de un *recinto de actividad*. Los elementos de separación horizontales están formados por el forjado (F), el *suelo flotante* (Sf) y, en algunos casos, el techo suspendido (Ts).» | [HR19] pp. 12, 13 |
| B.18 | Banda elástica, panel prefabricado pesado, trasdosado, suelo flotante | VERIFICADO (trasdosado, suelo flotante) / (texto) el resto | Banda elástica: **≥ 10 mm**, s' < 100 MN/m³. Panel pesado: hormigón, yeso o similar. Trasdosado: a) placas de yeso sobre entramado; b) placa de yeso + aislante adherido o anclado; c) hoja de fábrica con bandas elásticas perimétricas y cámara rellena. Suelo flotante: solado + capa de apoyo + capa de aislante a impactos | Anejo A | [HR19] pp. 56, 57; pp. 44, 55 (texto) |

**Tabla resumen de clasificación (para el modelo de datos):**

| Zona del edificio de viviendas | Clase DB-HR | Base |
|---|---|---|
| Dormitorio, salón, comedor, estar, cocina integrada en salón | Recinto **protegido** (de su vivienda) | B.3 |
| Cocina independiente, baño, aseo, pasillo, distribuidor, escalera interior | Recinto **habitable** (de su vivienda) | B.2 e |
| Rellano, escalera, pasillo común, portal | **Zona común**, recinto habitable de ninguna vivienda | B.12 |
| Trastero (y sus pasillos) | Recinto **no habitable** | B.5 |
| Garaje / aparcamiento (no privativo de unifamiliar) | Recinto **de actividad** (DB, literal) | B.6 |
| Garaje privativo de vivienda unifamiliar | No es de actividad: recinto de la propia vivienda (no habitable) | B.6 + K-HR.3 |
| Local comercial / sin uso definido | Recinto **de actividad** (comentario; constarlo en Instrucciones de uso) | B.7, A.9 |
| Oficinas | Recinto **de actividad** respecto a viviendas (comentario) | B.8 |
| Calderas / sala térmica, grupo de presión, cuarto de máquinas de ascensor, almacén de contenedores, centro de transformación, extracción de garaje | Recinto **de instalaciones** | B.10, B.11 |
| Contadores, RITI/RITS | **CRITERIO**: de instalaciones por defecto | K-HR.4 |
| Hueco de ascensor con maquinaria dentro (sin cuarto de máquinas) | Recinto **de instalaciones** | B.10, L.11 |
| Hueco de ascensor sin maquinaria | Elementos con **RA > 50 dBA** hacia cada unidad de uso | L.11 |

---

## Bloque C — Valores límite 2.1.1 y 2.1.2 y tabla 2.1 — punto C del encargo

| # | Exigencia | Veredicto | Valor | Cita exacta | Fuente |
|---|---|---|---|---|---|
| C.1 | a.i Tabiquería (recinto protegido, misma unidad, residencial privado) | VERIFICADO | **RA ≥ 33 dBA** | ver A.4 | [HR19] p. 8 |
| C.2 | a.ii Protegido ↔ habitable/protegido de **otra** unidad de uso, no instalaciones/actividad | VERIFICADO | **DnT,A ≥ 50 dBA** sin puertas ni ventanas compartidas. Si las comparten: **puerta/ventana RA ≥ 30 dBA** y **cerramiento RA ≥ 50 dBA** | «− El *aislamiento acústico a ruido aéreo*, DnT,A, entre un *recinto protegido* y cualquier otro recinto habitable o protegido del edificio no perteneciente a la misma *unidad de uso* y que no sea *recinto de instalaciones* o de *actividad*, colindante vertical u horizontalmente con él, no será menor que 50 dBA, siempre que no compartan puertas o ventanas. Cuando sí las compartan, el índice global de reducción acústica, ponderado A, RA, de éstas no será menor que 30 dBA y el índice global de reducción acústica, ponderado A, RA, del cerramiento no será menor que 50 dBA.» | [HR19] p. 8 |
| C.3 | a.iii Protegido ↔ instalaciones / actividad | VERIFICADO | **DnT,A ≥ 55 dBA**. **Sin cláusula de puertas** (ver K.3) | «− El *aislamiento acústico a ruido aéreo*, DnT,A, entre un *recinto protegido* y un *recinto de instalaciones* o un *recinto de actividad*, colindante vertical u horizontalmente con él, no será menor que 55 dBA.» | [HR19] p. 8 |
| C.4 | a.iv Protegido ↔ exterior | VERIFICADO | **D2m,nT,Atr ≥ tabla 2.1** | ver A.4 | [HR19] p. 8 |
| C.5 | b.i Tabiquería (recinto habitable) | VERIFICADO | **RA ≥ 33 dBA** (igual que C.1) | «b) En los *recintos habitables*: i) … en edificios de uso residencial privado: − El índice global de reducción acústica, ponderado A, RA, de la *tabiquería* no será menor que 33 dBA.» | [HR19] p. 9 |
| C.6 | b.ii Habitable ↔ habitable/protegido de otra unidad | VERIFICADO | **DnT,A ≥ 45 dBA** sin puertas/ventanas compartidas. Si las comparten **y** el edificio es residencial (público o privado) u hospitalario: **puerta/ventana RA ≥ 20 dBA**, **cerramiento RA ≥ 50 dBA** | «… no será menor que 45 dBA, siempre que no compartan puertas o ventanas. Cuando sí las compartan y sean edificios de uso residencial (público o privado) u hospitalario, el índice global de reducción acústica, ponderado A, RA, de éstas no será menor que 20 dBA y el índice global de reducción acústica, ponderado A, RA, del cerramiento no será menor que 50 dBA.» | [HR19] p. 9 |
| C.7 | b.iii Habitable ↔ instalaciones / actividad | VERIFICADO | **DnT,A ≥ 45 dBA** sin puertas. Con puertas: **puerta RA ≥ 30 dBA**, **cerramiento RA ≥ 50 dBA** | «… colindantes vertical u horizontalmente con él, siempre que no compartan puertas, no será menor que 45 dBA. Cuando sí las compartan, el índice global de reducción acústica, ponderado A, RA, de éstas, no será menor que 30 dBA y el índice global de reducción acústica, ponderado A, RA, del cerramiento no será menor que 50 dBA.» | [HR19] p. 10 |
| C.8 | c) Medianería | VERIFICADO | Cada cerramiento: **D2m,nT,Atr ≥ 40 dBA**, o alternativamente el conjunto de los dos: **DnT,A ≥ 50 dBA**. Aplica a recintos habitables **y** protegidos | «c) En los *recintos habitables* y *recintos protegidos* colindantes con otros edificios: El *aislamiento acústico a ruido aéreo* (D2m,nT,Atr) de cada uno de los *cerramientos* de una *medianería* entre dos edificios no será menor que 40 dBA o alternativamente el *aislamiento acústico a ruido aéreo* (DnT,A) correspondiente al conjunto de los dos cerramientos no será menor que 50 dBA.» | [HR19] p. 10 |
| C.9 | Tabla 2.1 | VERIFICADO (imagen, símbolos incluidos) | Ver tabla debajo | — | [HR19] p. 9 |
| C.10 | Ld: fuente y esquina | VERIFICADO | Administraciones competentes o mapas estratégicos de ruido. **Recinto expuesto a varios Ld (esquina): el mayor** | «− El valor del índice de ruido día, Ld, puede obtenerse en las administraciones competentes o mediante consulta de los mapas estratégicos de ruido. En el caso de que un recinto pueda estar expuesto a varios valores de Ld, como por ejemplo un recinto en esquina, se adoptará el mayor valor.» | [HR19] p. 9 |
| C.11 | Ld = 60 dBA sin datos oficiales | VERIFICADO + **CORREGIDO** (matiz) | **Solo** para áreas acústicas de **predominio de suelo residencial**. En otras áreas: lo que digan las normas de desarrollo de la Ley 37/2003 (zonificación y objetivos de calidad; RD 1367/2007). Los valores del RD 1367/2007 **no se han verificado** en esta sesión | «− Cuando no se disponga de datos oficiales del valor del índice de ruido día, Ld, se aplicará el valor de 60 dBA para el tipo de área acústica relativo a sectores de territorio con predominio de suelo de uso residencial. Para el resto de áreas acústicas, se aplicará lo dispuesto en las normas reglamentarias de desarrollo de la Ley 37/2003, de 17 de noviembre, del Ruido en lo referente a zonificación acústica, objetivos de calidad y emisiones acústicas.» | [HR19] p. 9 |
| C.12 | −10 dBA en fachadas no expuestas | VERIFICADO + LEÍDO (comentario) | Ld de la zona − 10 dBA para fachadas de patios de manzana cerrados o patios interiores, y fachadas exteriores en zonas o entornos tranquilos, no expuestas directamente. **No se aplica si el ruido dominante es de aeronaves** (comentario) | «− Cuando se prevea que algunas *fachadas*, tales como *fachadas* de patios de manzana cerrados o patios interiores, así como *fachadas* exteriores en zonas o entornos tranquilos, no van a estar expuestas directamente al ruido de automóviles, aeronaves, de actividades industriales, comerciales o deportivas, se considerará un índice de ruido día, Ld, 10 dBA menor que el índice de ruido día de la zona.» · Comentario: «Si el edificio tiene un patio interior o se trata de una manzana cerrada, la reducción de 10 dBA en el nivel de Ld no se aplica si el edificio se encuentra en una zona con ruido exterior dominante de aeronaves, ya que éste es un ruido que afecta a todo el edificio, incluidos los patios interiores o de manzana.» | [HR19] p. 9; [DccHR] p. 13 (texto) |
| C.13 | +4 dBA por aeronaves | VERIFICADO + LEÍDO (comentario) | Se suma a **D2m,nT,Atr** (no a Ld). Huella acústica de aeropuerto = ruido dominante de aeronaves (comentario) | «− Cuando en la zona donde se ubique el edificio el *ruido exterior dominante* sea el de aeronaves según se establezca en los mapas de ruido correspondientes, el valor de *aislamiento acústico a ruido aéreo*, D2m,nT,Atr, obtenido en la tabla 2.1 se incrementará en 4 dBA.» · Comentario: «Si la zona donde se ubica el edificio está en la huella acústica de un aeropuerto, se considerará que el ruido exterior dominante es de aeronaves.» | [HR19] p. 9; [DccHR] p. 13 (texto) |
| C.14 | El exterior solo protege recintos protegidos | LEÍDO (comentario) | Habitables, instalaciones y actividad: sin exigencia frente al exterior | «Las exigencias de aislamiento acústico del exterior **sólo se aplican a recintos protegidos**. En el caso de otros recintos, tales como recintos habitables, de instalaciones o actividad,. el DB HR no especifica ningún nivel de aislamiento acústico, …» | [DccHR] p. 12 (imagen) |
| C.15 | 2.1.2 a.i Impactos, protegido ↔ otra unidad | VERIFICADO | **L'nT,w ≤ 65 dB** en recinto protegido colindante vertical, horizontalmente **o con arista horizontal común** con cualquier habitable o protegido de otra unidad que no sea instalaciones/actividad | «El *nivel global de presión de ruido de impactos,* L'nT,w, en un *recinto protegido* colindante vertical, horizontalmente o que tenga una arista horizontal común con cualquier otro recinto habitable o protegido del edificio, no perteneciente a la misma *unidad de uso* y que no sea *recinto de instalaciones* o *de actividad*, no será mayor que 65 dB.» | [HR19] p. 10 |
| C.16 | Excepción de la escalera | VERIFICADO + LEÍDO (comentario) | No aplica (65 dB) a protegidos **colindantes horizontalmente** con una escalera. Comentario: solo escaleras **comunes** de edificios en altura; las **privativas** (adosadas, dúplex) colindantes con un protegido de otra unidad sí deben cumplir 65 (el comentario escribe «dBA», errata: es dB) | «Esta exigencia no es de aplicación en el caso de *recintos protegidos* colindantes horizontalmente con una escalera..» · Comentario: «Esta excepción solo es aplicable a escaleras que den servicio a varias unidades de uso en edificios en altura. En el caso de escaleras de uso privativo, tales como las escaleras de viviendas unifamiliares adosadas o de viviendas tipo dúplex, el nivel de presión de ruido de impactos, L'nT,w, entre un recinto que contenga una escalera que sea ésta colindante vertical u horizontalmente con un recinto protegido de una unidad de uso diferente, no será mayor que 65 dBA.» | [HR19] p. 10; [DccHR] p. 14 (texto) |
| C.17 | 2.1.2 a.ii Impactos, protegido ↔ instalaciones/actividad | VERIFICADO | **L'nT,w ≤ 60 dB** (colindante vertical, horizontal o arista horizontal común) | «… con un *recinto de actividad* o con un *recinto de instalaciones* no será mayor que 60 dB.» | [HR19] p. 10 |
| C.18 | 2.1.2 b.i Impactos, habitable ↔ instalaciones/actividad | VERIFICADO | **L'nT,w ≤ 60 dB**. Entre habitable y otra unidad **no** hay exigencia de impactos | «El *nivel global de presión de ruido de impactos*, L'nT,w, en un *recinto habitable* colindante vertical, horizontalmente o que tenga una arista horizontal común con un *recinto de actividad* o con un *recinto de instalaciones* no será mayor que 60 dB.» | [HR19] p. 10 |
| C.19 | Impactos hacia arriba y entre edificios | LEÍDO (comentario) | No hay exigencia de impactos entre un recinto y el **inmediatamente superior**, ni **entre edificios** | «… el DB HR no establece exigencias de aislamiento a ruido de impactos entre un recinto y el inmediatamente superior.» · «Entre dos edificios, no existen exigencias de aislamiento a ruido de impactos entre recintos colindantes, ni con una arista horizontal común.» | [DccHR] p. 14 (texto) |
| C.20 | Recinto acabado | VERIFICADO | Las condiciones se aplican a elementos **totalmente acabados**, con las instalaciones | ap. 2 pto 1: «… estas condiciones se aplicarán a los elementos constructivos totalmente acabados, es decir, albergando las instalaciones del edificio o incluyendo cualquier actuación que pueda modificar las características acústicas de dichos elementos.» | [HR19] p. 8 |

**Tabla 2.1** — D2m,nT,Atr en dBA, recinto protegido ↔ exterior (VERIFICADO, [HR19] p. 9, imagen)

| Ld (dBA) | Residencial y hospitalario: Dormitorios | Residencial y hospitalario: Estancias | Cultural, sanitario⁽¹⁾, docente y administrativo: Estancias | ídem: Aulas |
|---|---|---|---|---|
| Ld ≤ 60 | 30 | 30 | 30 | 30 |
| 60 < Ld ≤ 65 | 32 | 30 | 32 | 30 |
| 65 < Ld ≤ 70 | 37 | 32 | 37 | 32 |
| 70 < Ld ≤ 75 | 42 | 37 | 42 | 37 |
| Ld > 75 | 47 | 42 | 47 | 42 |

(1) «En edificios de uso no hospitalario, es decir, edificios de asistencia sanitaria de carácter ambulatorio, como despachos médicos, consultas, áreas destinadas al diagnóstico y tratamiento, etc.»

Orden de cálculo (INTERPRETACIÓN): Ld de la zona (o 60 por defecto en área residencial) → mayor Ld si hay varias fachadas → −10 dBA si la fachada no está expuesta (no con aeronaves) → fila de la tabla 2.1 → +4 dBA si aeronaves.

**Frases de memoria:**
- «Índice de ruido día de la zona Ld = [60] dBA ([valor por defecto para áreas de predominio residencial, a falta de datos oficiales] / [mapa estratégico de ruido de …]). Exigencia para dormitorios D2m,nT,Atr ≥ [30] dBA y para estancias ≥ [30] dBA (DB-HR, ap. 2.1.1 a.iv y tabla 2.1).»

---

## Bloque D — Tiempo de reverberación y absorción (2.2) — punto D del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| D.1 | Recintos con límite de T | VERIFICADO | Aulas y salas de conferencias < 350 m³ (0,7 s vacías; 0,5 s con butacas), **restaurantes y comedores vacíos ≤ 0,9 s** | 2.2 pto 1: «En conjunto los elementos constructivos, acabados superficiales y *revestimientos* que delimitan un aula o una sala de conferencias, un comedor y un restaurante, tendrán la absorción acústica suficiente de tal manera que: a) … 0,7 s. b) … 0,5 s. c) El *tiempo de reverberación* en restaurantes y comedores vacíos no será mayor que 0,9 s.» | [HR19] p. 10 |
| D.2 | Zonas comunes | VERIFICADO | **A ≥ 0,2 m² por m³** solo en zonas comunes de edificios de uso **residencial público, docente y hospitalario** colindantes con recintos protegidos con los que comparten puertas | 2.2 pto 2: «Para limitar el ruido reverberante en las *zonas comunes* los elementos constructivos, los acabados superficiales y los *revestimientos* que delimitan una *zona común* de un edificio de uso residencial publico, docente y hospitalario colindante con *recintos protegidos* con los que comparten puertas, tendrán la absorción acústica suficiente de tal manera que el área de absorción acústica equivalente, A, sea al menos 0,2 m² por cada metro cúbico del volumen del *recinto*.» | [HR19] pp. 10–11 |
| D.3 | Residencial privado | VERIFICADO (por omisión) + INTERPRETACIÓN | **Ninguna exigencia** de T ni de A en un edificio de viviendas: el pto 2 no cita el residencial privado, y el pto 1 se refiere a comedores y restaurantes como recintos de uso colectivo (el comedor de una vivienda no es el «comedor» de 2.2; INTERPRETACIÓN). La ficha lo dice como «no aplica» | ídem | [HR19] p. 10 |
| D.4 | Local que fuese restaurante | VERIFICADO + LEÍDO (comentario) | Al recinto del restaurante (y, por comentario, a cafeterías y bares donde se sirven comidas en mesas) le aplica **T ≤ 0,9 s** (vacío), por el método de 3.2.2 o el simplificado de 3.2.3 (techo absorbente). El aislamiento con las viviendas es el de recinto de actividad (C.3, C.7). Con local sin uso definido, la app no lo calcula: aviso | Comentario: «La exigencia de tiempo de reverberación menor que 0,9 s aplicable a comedores y restaurantes también es de aplicación a recintos como cafeterías y bares donde se sirven comidas en mesas, ya que dichos recintos tienen un uso asimilable a un comedor o restaurante.» · 3.2.1 pto 1 b): el método simplificado «sólo es válido en el caso de aulas de volumen hasta 350 m³, restaurantes y comedores.» | [HR19] pp. 10, 33; [DccHR] p. 15 (texto) |

**Frase de memoria:** «El edificio es de uso residencial privado: no le son de aplicación los valores límite de tiempo de reverberación ni de absorción acústica en zonas comunes (DB-HR, ap. 2.2, que se refiere a aulas, salas de conferencias, comedores y restaurantes, y a zonas comunes de edificios de uso residencial público, docente y hospitalario).»

---

## Bloque E — Opción simplificada: condiciones (3.1.2.1) y procedimiento (3.1.2.2) — punto E del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| E.1 | Cualquier uso; adosada por Anejo I | VERIFICADO | — | 3.1.2.1 pto 1 (ver A.3) | [HR19] p. 12 |
| E.2 | Forjados | VERIFICADO + LEÍDO (comentario) | Solo con estructura horizontal de **forjados de hormigón macizos o aligerados, o mixtos de hormigón y chapa**. **No** madera ni mixtos madera-hormigón; la tabla 3.4 (fachadas) sí vale en estructura de madera (comentario) | pto 2: «La opción simplificada es válida para edificios con una estructura horizontal resistente formada por forjados de hormigón macizos o aligerados, o forjados mixtos de hormigón y chapa de acero.» · Comentario: «Las tablas de la opción simplificada no se aplican a forjados de madera, ni a forjados mixtos de madera y hormigón. Sin embargo, la opción simplificada puede utilizarse para fachadas, cubiertas y suelos en contacto con el aire exterior en edificios de estructura de madera, …» | [HR19] p. 12; [DccHR] p. 17 (texto) |
| E.3 | Pensada para vivienda | LEÍDO (comentario) | En otros usos puede ser conservadora | «… la opción simplificada se ha diseñado para recintos de dimensiones similares a los que se dan normalmente en vivienda. La opción puede aplicarse a edificios de otros usos, pero en esos casos, puede resultar conservadora.» | [DccHR] p. 17 (texto) |
| E.4 | Procedimiento | VERIFICADO | Elegir: a) tabiquería; b) elementos de separación horizontales y verticales i) entre unidades de uso diferentes o entre una unidad de uso y **cualquier otro recinto** que no sea de instalaciones o de actividad, ii) entre protegido/habitable y actividad/instalaciones; c) medianerías; d) fachadas, cubiertas y suelos en contacto con el aire exterior | 3.1.2.2: «a) la tabiquería; b) los elementos de separación horizontales y los verticales (véase apartado 3.1.2.3): i) entre *unidades de uso* diferentes o entre una *unidad de uso* y cualquier otro *recinto* del edificio que no sea de *instalaciones* o de *actividad*; ii) entre un *recinto protegido* o un *recinto habitable* y un *recinto de actividad* o un *recinto de instalaciones*; c) las *medianerías* (véase apartado 3.1.2.4); d) las *fachadas*, las *cubiertas* y los suelos en contacto con el aire exterior. (véase apartado 3.1.2.5)» | [HR19] p. 12 |
| E.5 | Las uniones (3.1.4) son obligatorias en ambas opciones | VERIFICADO | — | 1.1 pto 2 a): «Independientemente de la opción elegida, deben cumplirse las condiciones de diseño de las uniones entre elementos constructivos especificadas en el apartado 3.1.4.» | [HR19] p. 7 |
| E.6 | La tabiquería condiciona todo | LEÍDO (comentario) | Por eso las tablas 3.2 y 3.3 tienen columnas por tipo de tabiquería | «En la opción simplificada, la elección del tipo de tabiquería condiciona la elección de los elementos de separación verticales y horizontales, ya que la tabiquería, además de ser una partición entre dos espacios, es un elemento de flanco …» | [DccHR] p. 17 (texto) |
| E.7 | Fachadas y medianerías admitidas | VERIFICADO | a) una hoja de fábrica u hormigón; b) dos hojas, ventilada o no: hoja exterior pesada (fábrica u hormigón) o ligera (panel sándwich, GRC); hoja interior de fábrica, hormigón o panel pesado (con apoyo directo, sobre suelo flotante o con bandas) o de entramado autoportante | 3.1.2.3.1 pto 4 | [HR19] pp. 13–14 |
| E.8 | Zonificar | LEÍDO (comentario) | «Para saber qué condiciones deben cumplirse en cada tipo de edificio es necesario zonificar el edificio y reconocer las unidades de uso y saber cómo se ubican.» | — | [DccHR] p. 17 (texto) |
| E.9 | Un mismo elemento vertical vale entre unidades sea cual sea el recinto | LEÍDO (comentario) | En simplificada, el vertical entre dos unidades de uso es el mismo tanto si separa habitables, protegidos u **otros recintos** (no instalaciones/actividad). Garantiza 50 / 45 dBA | «En la opción simplificada, se considera que el elemento de separación vertical proyectado entre dos unidades de uso es el mismo independientemente de que separe recintos habitables, protegidos u otros recintos del edificio, siempre que éstos últimos no sean de instalaciones o de actividad.» | [DccHR] p. 20 (texto) |
| E.10 | Mismo horizontal por planta | LEÍDO (comentario) | «En la opción simplificada, se elige el mismo elemento de separación horizontal para cada planta, excepto en aquellas zonas donde los recintos protegidos o habitables limiten con recintos de instalaciones o de actividad, en las que el aislamiento acústico exigido es mayor.» | — | [DccHR] p. 25 (texto) |

---

## Bloque F — Tabla 3.1 (tabiquería) — punto F del encargo

**Tabla 3.1. Parámetros de la tabiquería** (VERIFICADO, [HR19] p. 14, imagen)

| Tipo | m (kg/m²) | RA (dBA) |
|---|---|---|
| Fábrica o *paneles prefabricados pesados* con apoyo directo | 70 | 35 |
| Fábrica o *paneles prefabricados pesados* con *bandas elásticas* | 65 | 33 |
| *Entramado autoportante* | 25 | 43 |

Notas:
- La fila «con bandas elásticas» cubre también la tabiquería **apoyada sobre el suelo flotante** (3.1.2.3.1 pto 3 b, VERIFICADO p. 13; comentario: «la tabiquería apoyada sobre un suelo flotante, se asimila a la tabiquería apoyada sobre bandas elásticas», [DccHR] p. 25, texto).
- m y RA a la vez (INTERPRETACIÓN; la tabla lo da como mínimos de los dos parámetros).
- En la unifamiliar aislada y en la adosada con estructura independiente, la exigencia es solo **RA ≥ 33 dBA** (2.1.1 a.i; Anejo I.1.1). Ver K-HR.13.

**Frase de memoria:** «Tabiquería de [fábrica de ladrillo hueco doble con apoyo directo]: m = [..] kg/m² ≥ 70 kg/m²; RA = [..] dBA ≥ 35 dBA (DB-HR, tabla 3.1). CUMPLE.»

---

## Bloque G — Tabla 3.2 (elementos de separación verticales) — punto G del encargo

**Tabla 3.2. Parámetros acústicos de los componentes de los elementos de separación verticales** (VERIFICADO, [HR19] p. 17, imagen; cotejada con [DccHR] p. 24, imagen, idéntica)

Lectura de los símbolos (pto 1, VERIFICADO p. 14): valor **entre paréntesis** = el que deben cumplir los elementos que delimitan un **recinto de instalaciones o de actividad**; **sombreado** = elemento **inadecuado**; **guion** = **no necesita trasdosado**. Superíndices = notas.

| Tipo | Elemento base m (kg/m²) | Elemento base RA (dBA) | ΔRA trasdosado, tabiquería de fábrica o paneles pesados⁽⁴⁾ (dBA) | ΔRA trasdosado, tabiquería de entramado autoportante (dBA) |
|---|---|---|---|---|
| **TIPO 1** (una hoja o dos hojas de fábrica con trasdosado) | 67 | 33 | **SOMBREADO** | 16⁽⁸⁾⁽¹¹⁾ |
| TIPO 1 | 120 | 38 | **SOMBREADO** | 14⁽⁸⁾⁽¹¹⁾ |
| TIPO 1 | 150⁽⁷⁾ | 41⁽⁷⁾ | 16⁽⁸⁾ | 13⁽¹¹⁾ |
| TIPO 1 | 180 | 45 | 13 | 9⁽¹¹⁾ · (12)⁽¹¹⁾ |
| TIPO 1 | 200 | 46 | 11⁽¹¹⁾ | 10⁽¹³⁾ · (10)⁽¹¹⁾ |
| TIPO 1 | 250 | 51 | 6⁽¹³⁾ | 4⁽¹³⁾ · (8)⁽¹³⁾ |
| TIPO 1 | 300 | 52 | 3⁽¹³⁾ · 8 · (9) | 3⁽¹³⁾ · (8)⁽¹³⁾ |
| TIPO 1 | 300⁽⁷⁾ | 55⁽⁷⁾ | – | – |
| TIPO 1 | 350 | 55 | 5⁽¹³⁾ · (8)⁽¹¹⁾ | 0⁽¹³⁾ · (6)⁽¹³⁾ |
| TIPO 1 | 400 | 57 | 0⁽¹³⁾ · 2⁽¹³⁾ · (6)⁽¹³⁾ | 0⁽¹³⁾ · (6)⁽¹³⁾ |
| **TIPO 2** (dos hojas de fábrica con *bandas elásticas* perimétricas) | 130⁽⁵⁾ | 54⁽⁵⁾ | – | – |
| TIPO 2 | 170⁽⁵⁾ | 54⁽⁵⁾ | – | – |
| TIPO 2 | (200)⁽⁶⁾ | (61)⁽⁶⁾ | – | – |
| **TIPO 3** (entramado autoportante) | 44⁽¹²⁾ | 58⁽¹²⁾ | **SOMBREADO** | **SOMBREADO** |
| TIPO 3 | (52)⁽⁹⁾ | (64)⁽⁹⁾ | **SOMBREADO** | **SOMBREADO** |
| TIPO 3 | (60)⁽¹⁰⁾ | (68)⁽¹⁰⁾ | **SOMBREADO** | **SOMBREADO** |

«·» separa los valores que la celda apila verticalmente, en su orden. En la celda 300/52 fábrica el «8» y el «(9)» no llevan nota.

**Casillas sombreadas, una a una** (inadecuadas):
1. Tipo 1, 67/33, columna fábrica.
2. Tipo 1, 120/38, columna fábrica.
3. Tipo 3, 44/58, columna fábrica. 4. Tipo 3, 44/58, columna entramado.
5. Tipo 3, (52)/(64), columna fábrica. 6. Tipo 3, (52)/(64), columna entramado. (Las casillas 3–6 forman un único bloque sombreado.)
7. Tipo 3, (60)/(68), columna fábrica. 8. Tipo 3, (60)/(68), columna entramado (bloque aparte).

Lectura: base ligera de tipo 1 (67 y 120 kg/m²) no admite tabiquería de fábrica; el tipo 3 nunca lleva trasdosado.

**Filas sin ningún valor entre paréntesis** (no valen para instalaciones ni actividad): tipo 1 67, 120, 150, 300⁽⁷⁾/55⁽⁷⁾; tipo 1 180 y 200 con tabiquería de fábrica; tipo 1 250 con fábrica; tipo 2 130 y 170; tipo 3 44/58. **Filas solo entre paréntesis** (solo instalaciones/actividad): tipo 2 (200)/(61); tipo 3 (52)/(64) y (60)/(68).

**Notas de la tabla 3.2, literales** (VERIFICADO, [HR19] pp. 17–18):
- ⁽¹⁾ «En el caso de elementos de separación verticales de dos hojas de fábrica, el valor de m corresponde al de la suma de las masas por unidad de superficie de las hojas y el valor de RA corresponde al del conjunto.» → cabecera «Elemento base».
- ⁽²⁾ «Los elementos de separación verticales deben cumplir simultáneamente los valores de masa por unidad de superficie, m y de índice global de reducción acústica, ponderado A, RA.» → cabecera «Elemento base».
- ⁽³⁾ «El valor de la mejora del índice global de reducción acústica, ponderado A, ΔRA, corresponde al de un *trasdosado* instalado sobre un elemento base de masa mayor o igual a la que figura en la tabla 3.2.» → cabecera «Trasdosado».
- ⁽⁴⁾ «La columna tabiquería de fábrica o paneles prefabricados pesados se aplica indistintamente a todos los tipos de tabiquería de fábrica o *paneles prefabricados pesados* incluidos en el apartado 3.1.2.3.1.» → cabecera de la columna fábrica.
- ⁽⁵⁾ «La masa por unidad de superficie de cada hoja que tenga *bandas elásticas* perimétricas no será mayor que 150 kg/m² y en el caso de los elementos de tipo 2 que tengan *bandas elásticas* perimétricas únicamente en una de sus hojas, la hoja que apoya directamente sobre el forjado debe tener un índice global de reducción acústica, ponderado A, RA, de al menos 42 dBA.» → tipo 2, 130/54 y 170/54.
- ⁽⁶⁾ «Esta solución es válida únicamente para tabiquería de *entramado autoportante* o de fábrica o *paneles prefabricados pesados* con *bandas elásticas* en la base, dispuestas tanto en la tabiquería del *recinto de instalaciones*, como en la del *recinto protegido* inmediatamente superior. Por otra parte, esta solución no es válida cuando acometan a *medianerías* o *fachadas* de una sola hoja ventiladas o que tengan en aislamiento por el exterior.» **Y en p. 18, sin número, como continuación:** «La masa por unidad de superficie de cada hoja que tenga *bandas elásticas* perimétricas no será mayor que 150 kg/m² y en el caso de los elementos de tipo 2 que tengan *bandas elásticas* perimétricas únicamente en una de sus hojas, la hoja que apoya directamente sobre el forjado debe tener un índice global de reducción acústica, ponderado A, RA, de al menos 45 dBA.» → tipo 2, (200)/(61). INTERPRETACIÓN: el párrafo de p. 18 pertenece a la nota (6) (va justo después, sin número propio); para la solución de instalaciones la hoja apoyada exige **45 dBA**, no 42.
- ⁽⁷⁾ «Esta solución es válida si se disponen *bandas elásticas* en los encuentros del elemento de separación vertical con la tabiquería de fábrica que acomete al elemento, ya sea ésta con apoyo directo o con *bandas elásticas*.» → tipo 1, 150/41 y 300/55 (en m y en RA).
- ⁽⁸⁾ «Estas soluciones no son válidas si acometen a una fachada o *medianería* de una hoja de fábrica o ventilada con la hoja interior de fábrica o de hormigón.» → tipo 1: 67 entramado (16), 120 entramado (14), 150 fábrica (16).
- ⁽⁹⁾ «Esta solución de tipo 3 es válida para *recintos de instalaciones* o de *actividad* si se cumplen las condiciones siguientes: − Se dispone en el *recinto de instalaciones* o *recinto de actividad* y en el *recinto habitable* o *recinto* protegido colindante horizontalmente un suelo flotante con una mejora del índice global de reducción acústica, ponderado A, ΔRA mayor o igual que 6dBA; − Además, debe disponerse en el *recinto de instalaciones* o *recinto de actividad* un techo suspendido con una mejora del índice global de reducción acústica, ponderado A, ΔRA mayor o igual que: i. 6dBA, si el recinto de instalaciones es interior o el elemento de separación vertical acomete a una fachada ligera, con hoja interior de entramado autoportante; ii. 12dBA, si el elemento de separación vertical de tipo 3 acomete a una *medianería* o fachada pesada con hoja interior de entramado autoportante. Independientemente de lo especificado en esta nota, los suelos flotantes y los techos suspendidos deben cumplir lo especificado en el apartado 3.1.2.3.5.» → tipo 3, (52)/(64). **Ojo: la nota (9) NO está en la celda «(9)» del tipo 1 300/52 fábrica; esa «(9)» es un valor ΔRA = 9 dBA entre paréntesis, sin nota.**
- ⁽¹⁰⁾ «Solución válida si el forjado que separa el recinto de instalaciones o recinto de actividad de un recinto protegido o habitable tiene una masa por unidad de superficie mayor que 400 kg/m².» → tipo 3, (60)/(68).
- ⁽¹¹⁾ «Valores aplicables en combinación con un forjado de masa por unidad de superficie, m, de al menos 250kg/m² y un suelo flotante, tanto en el recinto emisor como en el recinto receptor, con una mejora del índice global de reducción acústica, ponderado A, ΔRA mayor o igual que 4dBA;» → tipo 1: 67 ent. 16; 120 ent. 14; 150 ent. 13; 180 ent. 9 y (12); 200 fáb. 11 y ent. (10); 350 fáb. (8).
- ⁽¹²⁾ «Valores aplicables en combinación con un forjado de masa por unidad de superficie, m, de al menos 200kg/m² y un suelo flotante y un techo suspendido, tanto en el recinto emisor como en el recinto receptor, con una mejora del índice global de reducción acústica, ponderado A, ΔRA mayor o igual que 10dBA y 6dBA respectivamente;» → tipo 3, 44/58.
- ⁽¹³⁾ «Valores aplicables en combinación con un forjado de masa por unidad de superficie, m, de al menos 175kg/m².» → tipo 1: 200 ent. 10; 250 fáb. 6, ent. 4 y (8); 300 fáb. 3, ent. 3 y (8); 350 fáb. 5, ent. 0 y (6); 400 fáb. 0, 2 y (6), ent. 0 y (6).
- Cierre: «Independientemente de los especificado en las notas 10, 11 y 12, los suelos flotantes y los techos suspendidos deben cumplir lo especificado en el apartado 3.1.2.3.5.»

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| G.1 | Trasdosado por una cara | VERIFICADO | Tipo 1: trasdosado **por ambas caras**. Si no es posible y la transmisión es principalmente directa, por una cara con **ΔRA de tabla + 4 dBA** | 3.1.2.3.4 pto 2: «En el caso de elementos de separación verticales de tipo 1, el *trasdosado* debe aplicarse por ambas caras del elemento constructivo base. Si no fuera posible trasdosar por ambas caras y la transmisión de ruido se produjera principalmente a través del elemento de separación vertical, podrá trasdosarse el elemento constructivo base solamente por una cara, incrementándose en 4 dBA la mejora ΔRA del *trasdosado* especificada en la tabla 3.2.» | [HR19] p. 14 |
| G.2 | Sin tabiquería interior | VERIFICADO | Cualquier elemento de la tabla | pto 3 | [HR19] p. 14 |
| G.3 | Forjado por defecto | VERIFICADO | Con carácter general, con forjados de **m ≥ 300 kg/m²**; con menos masa, solo si se cumplen las notas | pto 5: «Con carácter general, los elementos de la tabla 3.2 son aplicables junto con forjados de masa por unidad de superficie, m, de al menos 300kg/m². No obstante, pueden utilizarse con forjados de menor masa siempre que se cumplan las condiciones recogidas en las notas indicadas a pie de tabla para las diferentes soluciones.» | [HR19] p. 15 |
| G.4 | Muro cortina | VERIFICADO | Se asimila a una de las fachadas de la tabla según la unión | pto 6 | [HR19] p. 15 |
| G.5 | Condiciones de fachada/medianería por tipo (pto 7) | VERIFICADO | **Tipo 1:** i) una hoja o ventilada de fábrica u hormigón: hoja **m ≥ 135 kg/m²** y **RA ≥ 42 dBA**; **no vale con recintos de instalaciones**; ii) pesada de dos hojas no ventilada: hoja exterior **m ≥ 130 kg/m²**; iii) ventilada o ligera no ventilada con hoja interior de entramado: hoja interior **m ≥ 26 kg/m²**, **RA ≥ 43 dBA**. No contemplados: tipo 1 con fachada ligera no ventilada con hoja interior de fábrica; fachada de dos hojas con hoja interior pesada + tabiquería de entramado, y al revés. **Tipo 2:** i) dos hojas pesada: sin restricciones; ii) una hoja o ventilada con hoja interior de fábrica u hormigón: si m del separador **< 170 kg/m²**, prohibido; si **> 170 kg/m²**, la fachada/medianería **RA ≥ 50 dBA** y **m ≥ 225 kg/m²**. No contemplados: tipo 2 con fachada de dos hojas con hoja interior de entramado; tipo 2 con fachada ligera de dos hojas. **Tipo 3:** i) pesada de dos hojas con hoja interior de entramado: hoja exterior **m ≥ 145 kg/m²**, **RA ≥ 45 dBA**; ii) ventilada o ligera no ventilada con hoja interior de entramado: hoja interior **m ≥ 26 kg/m²**, **RA ≥ 43 dBA**. No contemplado: tipo 3 con fachada de una hoja o de dos con hoja interior de fábrica, hormigón o panel pesado. **Además**, medianerías y fachadas cumplen 3.1.2.4 y 3.1.2.5 | pto 7 a), b), c) (literal largo; ver imagen) | [HR19] pp. 15–16 |
| G.6 | Tipo 2 con m = 170 kg/m² exactos | **NO LO FIJA EL DB → CRITERIO** | El pto 7 b.ii dice «menor que 170» (prohibido) y «mayor que 170» (exigencias): **170 exactos queda sin regla**. Propuesta: tratar 170 como «mayor que» (aplica RA ≥ 50 y m ≥ 225 a la fachada), lo conservador | ídem | [HR19] p. 15 |
| G.7 | Alternativas dentro de una celda | INTERPRETACIÓN + **NO LO FIJA EL DB → CRITERIO** | Cada valor de una celda es una alternativa, con sus notas como condiciones; los valores sin nota (11), (12) o (13) exigen el forjado por defecto **≥ 300 kg/m²** (G.3). Algunas celdas tienen alternativas dominadas: 300/52 fábrica «3⁽¹³⁾ · 8» (con forjado ≥ 300 se cumplen las dos condiciones y basta 3); 400/57 fábrica «0⁽¹³⁾ · 2⁽¹³⁾» (basta 0). Puede que la Guía las explique. Propuesta (K-HR.11): CUMPLE si se cumple **cualquier** alternativa con sus notas; la ficha cita la alternativa usada | — | [HR19] p. 17 |
| G.8 | Elegir fila de elemento base | INTERPRETACIÓN + LEÍDO (comentario) | El elemento del proyecto debe tener **m y RA ≥ los de la fila** (nota 2). Si cumple varias filas, vale cualquiera. El ΔRA del trasdosado debe haberse obtenido sobre una base de masa ≥ la de la fila (nota 3; comentario: «Deben elegirse aquellos trasdosados cuyo valor es al menos el especificado en la tabla 3.2, siempre que se haya obtenido sobre un elemento base con masa de al menos la especificada en la tabla 3.2.») | — | [HR19] p. 17; [DccHR] p. 19 (texto) |
| G.9 | Ascensor con tipo 1 por una cara | LEÍDO (comentario) | «Si para el recinto del ascensor, se emplean elementos de tipo 1 trasdosados sólo por una cara, debe tenerse en cuenta que RA (e. base+trasdosado) = RA e. base + ∆RA trasdosado ≥ 50 dBA» | — | [DccHR] p. 20 (texto) |

**Frase de memoria:** «Elemento de separación vertical entre viviendas: tipo [1], elemento base [ladrillo perforado 1/2 pie + guarnecido], m = [..] kg/m² ≥ [180] kg/m², RA = [..] dBA ≥ [45] dBA; trasdosado por ambas caras ΔRA = [..] dBA ≥ [13] dBA, con tabiquería de [fábrica] y forjado de m ≥ 300 kg/m² (DB-HR, ap. 3.1.2.3.4 y tabla 3.2). Fachada a la que acomete: [una hoja de fábrica], m = [..] ≥ 135 kg/m², RA = [..] ≥ 42 dBA (ap. 3.1.2.3.4 pto 7 a.i). CUMPLE.»

---

## Bloque H — Tabla 3.3 (elementos de separación horizontales) — punto H del encargo

**Tabla 3.3. Parámetros acústicos de los componentes de los elementos de separación horizontales** (VERIFICADO, [HR19] pp. 20, 21 y 22, imagen; cotejo de orden con el texto extraído: coincide en todas las celdas; p. 22 cotejada con [DccHR] p. 30, imagen, idéntica)

Estructura de la tabla: por cada forjado (m, RA), tres columnas de tabiquería: **AD** = fábrica o paneles pesados con **apoyo directo** en el forjado; **BE** = fábrica o paneles pesados con **bandas elásticas o apoyada sobre el suelo flotante**; **ENT** = **entramado autoportante**. En cada una: suelo flotante (ΔLw dB, ΔRA dBA) y techo suspendido (ΔRA dBA). Solo ENT tiene la columna **«Condiciones de la fachada⁽⁶⁾»** (1H / 2H / «1H ó 2H»). Cada forjado tiene una fila **normal** (entre unidades de uso, o unidad ↔ otros recintos) y una fila **entre paréntesis** (protegido/habitable ↔ instalaciones o actividad, pto 6).

**Cómo se lee** (INTERPRETACIÓN; base: comentario [DccHR] p. 26, texto: «Para usar la tabla 3.3, debe elegirse el suelo flotante con el ΔLw requerido y según el caso, elegir un techo suspendido con la mejora ΔRA, especificada en la tabla.»): en cada celda hay **un único ΔLw** y una o varias **combinaciones** (ΔRA suelo flotante ; ΔRA techo suspendido) emparejadas por fila. Cumple si ΔLw(proyecto) ≥ ΔLw **y** existe una combinación i con ΔRA_Sf(proyecto) ≥ a_i **y** ΔRA_Ts(proyecto) ≥ b_i. Techo 0 = no hace falta techo. Abajo: «(a ; b)» = combinación; «⁽⁷⁾» = solución específica de garajes; **SOMBREADO** = inadecuado.

### Forjado m = 175 kg/m², RA = 44 dBA

| Tabiquería | Caso | Fachada | ΔLw Sf (dB) | Combinaciones (ΔRA Sf ; ΔRA Ts) (dBA) |
|---|---|---|---|---|
| AD | normal | — | **SOMBREADO** | **SOMBREADO** |
| AD | paréntesis | — | **SOMBREADO** | **SOMBREADO** |
| BE | normal | — | 26 | (3 ; 15) · (15 ; 4) |
| BE | paréntesis | — | **SOMBREADO** | **SOMBREADO** |
| ENT | normal | 2H | 26 | (0 ; 8) · (2 ; 7) · (6 ; 5) · (7 ; 1) · (8 ; 0) |
| ENT | normal | 1H | 26 | (4 ; 15) · (9 ; 12) · (14 ; 5) · (15 ; 4) · (19 ; 3) |
| ENT | paréntesis | 2H | (31) | (4 ; 15) · (9 ; 10) · (14 ; 5) · (15 ; 4) · (17 ; 1) · (18 ; 0) |
| ENT | paréntesis | 1H | **SOMBREADO** | **SOMBREADO** |

### Forjado m = 200 kg/m², RA = 45 dBA

| Tabiquería | Caso | Fachada | ΔLw | Combinaciones |
|---|---|---|---|---|
| AD | normal | — | **SOMBREADO** | **SOMBREADO** |
| AD | paréntesis | — | **SOMBREADO** | **SOMBREADO** |
| BE | normal | — | 25 | (2 ; 15) · (8 ; 5) · (15 ; 2) |
| BE | paréntesis | — | (30) | (14 ; 15) · (15 ; 14) · (19 ; 11) |
| ENT | normal | 2H | 24 | (0 ; 7) · (2 ; 6) · (4 ; 5) · (6 ; 1) · (7 ; 0) |
| ENT | normal | 1H | 24 | (2 ; 15) · (9 ; 5) · (15 ; 2) |
| ENT | paréntesis | 2H | (29) | (1 ; 15) · (2 ; 14) · (9 ; 7) · (11 ; 5) · (16 ; 0) |
| ENT | paréntesis | 1H | **SOMBREADO** | **SOMBREADO** |

### Forjado m = 225 kg/m², RA = 47 dBA

| Tabiquería | Caso | Fachada | ΔLw | Combinaciones |
|---|---|---|---|---|
| AD | normal | — | **SOMBREADO** | **SOMBREADO** |
| AD | paréntesis | — | **SOMBREADO** | **SOMBREADO** |
| BE | normal | — | 24 | (0 ; 15) · (2 ; 8) · (5 ; 5) · (15 ; 1) · (17 ; 0) |
| BE | paréntesis | — | (29) | (9 ; 15) · (15 ; 9) · (19 ; 7) |
| ENT | normal | 2H | 23 | (0 ; 4) · (2 ; 3) · (4 ; 0) |
| ENT | normal | 1H | 23 | (0 ; 15) · (2 ; 8) · (5 ; 5) · (9 ; 2) · (14 ; 1) · (15 ; 0) |
| ENT | paréntesis | 2H | (28) | (0 ; 13) · (2 ; 11) · (8 ; 5) · (9 ; 4) · (12 ; 1) · (13 ; 0) |
| ENT | paréntesis | 1H | **SOMBREADO** | **SOMBREADO** |

### Forjado m = 250 kg/m², RA = 49 dBA (sin llamada (4) en la tabla 3.3; la tabla I.1 sí pone 250⁽⁴⁾)

| Tabiquería | Caso | Fachada | ΔLw | Combinaciones |
|---|---|---|---|---|
| AD | normal | — | **SOMBREADO** | **SOMBREADO** |
| AD | paréntesis | — | **SOMBREADO** | **SOMBREADO** |
| BE | normal | — | 22 | (0 ; 10) · (2 ; 5) · (9 ; 0) |
| BE | paréntesis | — | (27) | (6 ; 15) · (9 ; 10) |
| ENT | normal | 2H | 21 | (0 ; 2) · (2 ; 0) |
| ENT | normal | 1H | 21 | (0 ; 9) · (2 ; 5) · (9 ; 0) |
| ENT | paréntesis | 2H | (26) | (0 ; 11) · (2 ; 9) · (6 ; 5) · (9 ; 2) · (11 ; 0) |
| ENT | paréntesis | 1H | **SOMBREADO** | **SOMBREADO** |

### Forjado m = 300⁽⁴⁾ kg/m², RA = 52 dBA

| Tabiquería | Caso | Fachada | ΔLw | Combinaciones |
|---|---|---|---|---|
| AD | normal | — | 18 | (3 ; 15) · (8 ; 5) · (9 ; 4) |
| AD | paréntesis | — | **SOMBREADO** | **SOMBREADO** |
| BE | normal | — | 16 | (0 ; 4) · (2 ; 1) · (4 ; 0) |
| BE | paréntesis | — | (21) | (3 ; 15) · (7 ; 6) · (8 ; 5) · (9 ; 4) |
| ENT | normal | 2H | 16 | (0 ; 0) |
| ENT | normal | 1H | 16 | (0 ; 2) · (2 ; 0) |
| ENT | paréntesis | 2H | (21) | (0 ; 5) · (2 ; 4) · (5 ; 0) · (10 ; 0)⁽⁷⁾ |
| ENT | paréntesis | 1H | (21) | (7 ; 15) · (9 ; 11) |

### Forjado m = 350⁽⁴⁾ kg/m², RA = 54 dBA

| Tabiquería | Caso | Fachada | ΔLw | Combinaciones |
|---|---|---|---|---|
| AD | normal | — | 16 | (0 ; 12) · (1 ; 8) · (2 ; 5) · (8 ; 1) · (12 ; 0) |
| AD | paréntesis | — | **SOMBREADO** | **SOMBREADO** |
| BE | normal | — | 15 | (0 ; 0) |
| BE | paréntesis | — | (19) | (1 ; 11) · (4 ; 5) · (5 ; 4) · (8 ; 2) |
| ENT | normal | 1H ó 2H | 14 | (0 ; 0) · (0 ; 5) · (5 ; 0) |
| ENT | paréntesis | 2H | (19) | (0 ; 3) · (2 ; 2) · (3 ; 0) · (8 ; 0)⁽⁷⁾ |
| ENT | paréntesis | 1H | (19) | (5 ; 7) · (7 ; 5) · (8 ; 4) |

### Forjado m = 400⁽⁴⁾ kg/m², RA = 57 dBA

| Tabiquería | Caso | Fachada | ΔLw | Combinaciones |
|---|---|---|---|---|
| AD | normal | — | 14 | (0 ; 2) · (2 ; 0) · (9 ; 2) · (5 ; 5) · (2 ; 15) |
| AD | paréntesis | — | **SOMBREADO** | **SOMBREADO** |
| BE | normal | — | 12 | (0 ; 0) |
| BE | paréntesis | — | (17) | (0 ; 6) · (4 ; 1) · (6 ; 0) · (10 ; 0)⁽⁷⁾ |
| ENT | normal | 1H ó 2H | 11 | (0 ; 0) |
| ENT | paréntesis | 2H | (16) | (0 ; 0) · (5 ; 0)⁽⁷⁾ |
| ENT | paréntesis | 1H | (16) | (0 ; 9) · (1 ; 7) · (4 ; 3) · (6 ; 1) · (8 ; 0) · (9 ; 0)⁽⁷⁾ |

### Forjado m = 450 kg/m², RA = 58 dBA

| Tabiquería | Caso | Fachada | ΔLw | Combinaciones |
|---|---|---|---|---|
| AD | normal | — | 12 | (0 ; 0) · (0 ; 4) · (5 ; 0) |
| AD | paréntesis | — | **SOMBREADO** | **SOMBREADO** |
| BE | normal | — | 10 | (0 ; 0) |
| BE | paréntesis | — | (15) | (0 ; 3) · (3 ; 0) · (6 ; 0)⁽⁷⁾ |
| ENT | normal | 1H ó 2H | 10 | (0 ; 0) |
| ENT | paréntesis | 2H | (15) | (0 ; 0) · (4 ; 0)⁽⁷⁾ |
| ENT | paréntesis | 1H | (15) | (0 ; 4) · (3 ; 2) · (4 ; 0) · (7 ; 0)⁽⁷⁾ |

La combinación (7 ; 0)⁽⁷⁾ está **en la cabecera de la p. 22**, encima del forjado 500, en las columnas ΔRA de ENT, bajo línea discontinua y con las tres casillas AD sombreadas. INTERPRETACIÓN: es la continuación de la fila 450 / paréntesis / 1H, partida por el salto de página (en la p. 22 la fila no tiene forjado ni ΔLw propios, y el texto extraído la sitúa justo antes de «500 60»).

### Forjado m = 500 kg/m², RA = 60 dBA

| Tabiquería | Caso | Fachada | ΔLw | Combinaciones |
|---|---|---|---|---|
| AD | normal | — | 12 | (0 ; 0) |
| AD | paréntesis | — | (17) | (4 ; 7) · (5 ; 5) |
| BE | normal | — | 10 | (0 ; 0) |
| BE | paréntesis | — | (15) | (0 ; 0) · (3 ; 0)⁽⁷⁾ |
| ENT | normal | 1H ó 2H | 9 | (0 ; 0) |
| ENT | paréntesis | 2H | (14) | (0 ; 0) · (1 ; 0)⁽⁷⁾ |
| ENT | paréntesis | 1H | (14) | (0 ; 1) · (1 ; 0) · (3 ; 0)⁽⁷⁾ |

**Celda no del todo legible:** en la fila normal del forjado 500, las tres casillas de **techo suspendido** (AD, BE y ENT) se leen «**0(**»: un 0 seguido de un paréntesis de apertura sin cerrar, que parece una llamada a nota cortada en la maquetación. Igual en [DccHR] p. 30 (imagen) y en el texto extraído. **Valor tomado: 0** (no hace falta techo). No se puede saber a qué nota llamaba.

Observaciones de transcripción (no son correcciones, son avisos para el motor):
- **Alternativas dominadas** (literal, se conservan): 350 ENT normal (0;0)·(0;5)·(5;0); 400 AD normal (0;2)·(2;0)·(9;2)·(5;5)·(2;15); 450 AD normal (0;0)·(0;4)·(5;0); 400 ENT paréntesis 2H (0;0)·(5;0)⁽⁷⁾; 450 ENT paréntesis 2H (0;0)·(4;0)⁽⁷⁾; 500 BE paréntesis (0;0)·(3;0)⁽⁷⁾; 500 ENT paréntesis 2H (0;0)·(1;0)⁽⁷⁾.
- **Fábrica con apoyo directo (AD) no vale con forjados de 175 a 250 kg/m²** (sombreado completo) y, **entre paréntesis, solo con 500 kg/m²**: con tabiquería de fábrica apoyada directamente, un local, garaje o cuarto de instalaciones bajo viviendas no se resuelve en simplificada si el forjado pesa menos de 500 kg/m².
- **ENT, paréntesis, fachada 1H**: sombreado con forjados de 175 a 250 kg/m².
- Las combinaciones **⁽⁷⁾ (garajes)** tienen siempre **techo 0** y piden **más** ΔRA de suelo flotante que la alternativa genérica de techo 0 de la misma celda. Ver H.6.

**Notas de la tabla 3.3, literales** (VERIFICADO, [HR19] p. 22):
- ⁽¹⁾ (cabecera «Forjado») «Los forjados deben cumplir simultáneamente los valores de masa por unidad de superficie, m y de índice global de reducción acústica ponderado A, RA.»
- ⁽²⁾ (cabecera «Suelo flotante») «Los *suelos flotantes* deben cumplir simultáneamente los valores de reducción del nivel global de presión de ruido de impactos, ΔLw, y de mejora del índice global de reducción acústica, ponderado A, ΔRA.»
- ⁽³⁾ (cabecera «Suelo flotante») «Los valores de mejora del aislamiento a ruido aéreo, ΔRA, y de reducción de ruido de impactos, ΔLw, corresponden a un único *suelo flotante*; la adición de mejoras sucesivas, una sobre otra, en un mismo lado no garantiza la obtención de los valores de aislamiento.»
- ⁽⁴⁾ (forjados 300, 350 y 400) «En el caso de forjados con piezas de entrevigado de poliestireno expandido (EPS), el valor de ΔLw correspondiente debe incrementarse en 4dB.»
- ⁽⁵⁾ (cabecera «Techo suspendido») «Los valores de mejora del aislamiento a ruido aéreo, ΔRA, corresponden a un único techo suspendido; la adición de mejoras sucesivas, una bajo otra, en un mismo lado no garantiza la obtención de los valores de aislamiento.»
- ⁽⁶⁾ (cabecera «Condiciones de la fachada», solo ENT) «Para limitar las transmisiones por flancos, en el caso de la tabiquería de entramado autoportante, en la tabla 3.3 aparecen los símbolos: − 1H, para fachadas o *medianerías* de 1 hoja o fachadas ventiladas de fábrica o de hormigón, que deben cumplir; i. la masa por unidad de superficie, m, de la hoja de fábrica o de hormigón deber ser al menos 135kg/m²; ii. el índice global de reducción acústica, ponderado A, RA, de la hoja de fábrica o de hormigón debe ser al menos 42dBA. − 2H, para fachadas o *medianerías* de dos hojas, que deben cumplir: i. para las fachadas pesadas no ventiladas o ventiladas por el exterior de la hoja principal con la hoja interior de *entramado autoportante* o adherido: − la masa por unidad de superficie, m, de la hoja exterior deber ser al menos 145kg/m²; − el índice global de reducción acústica, ponderado A, RA, de la hoja exterior debe ser al menos 45dBA. ii. para las fachadas o *medianerías* pesadas ventiladas por el interior de la hoja principal o ligeras ventiladas o no ventiladas, con la hoja interior de *entramado autoportante:* − la masa por unidad de superficie, m, de la hoja interior deber ser al menos 26kg/m²; − el índice global de reducción acústica, ponderado A, RA, de la hoja interior debe ser al menos 43dBA; Las soluciones para fachada de dos hojas también son aplicables en el caso de que los recintos sean interiores.»
- ⁽⁷⁾ (combinaciones marcadas) «Soluciones de elementos de separación horizontales específicas para el caso de garajes.»

**Puntos 2 a 8 de 3.1.2.3.5** (VERIFICADO, [HR19] pp. 18–19):

| # | Punto | Literal | Lectura para el motor |
|---|---|---|---|
| H.1 | pto 2 | «Los forjados que delimitan superiormente una *unidad de uso* deben disponer de un *suelo flotante* y, en su caso, de un techo suspendido con los que se cumplan los valores de mejora del índice global de reducción acústica, ponderado A, ΔRA y de reducción del nivel global de presión de ruido de impactos, ΔLw especificados en la tabla 3.3.» | Forjado entre la vivienda de abajo y lo de arriba: Sf (ΔLw + ΔRA) y Ts si lo pide la combinación |
| H.2 | pto 3 | «Los forjados que delimitan inferiormente una *unidad de uso* y la separan de cualquier otro recinto del edificio deben disponer de una combinación de *suelo flotante* y techo suspendido con los que se cumplan los valores de mejora del índice global de reducción acústica, ponderado A, ΔRA.» · Comentario: «En el caso de recintos de actividad o instalaciones que se sitúen debajo de unidades de uso, sólo se exige que la combinación de suelo flotante y techo suspendido cumpla con el valor de mejora del índice global de reducción acústica, ponderado A, ΔRA.» ([DccHR] p. 26, texto) | Vivienda **sobre** local, garaje o cuarto de instalaciones: solo combinación ΔRA de la fila entre paréntesis; el ΔLw entre paréntesis no aplica a ese forjado |
| H.3 | pto 4 | «Además, para limitar la transmisión de ruido de impactos, en el forjado de cualquier *recinto* colindante horizontalmente con un *recinto* perteneciente a *unidad de uso* o con una arista horizontal común con el mismo, debe disponerse un *suelo flotante* cuya reducción del nivel global de presión de ruido de impactos, ΔLw, sea la especificada en la tabla 3.3. (Véase figura 3.4). De la misma manera, en el forjado de cualquier *recinto de instalaciones* o de *actividad* que sea colindante horizontalmente con un *recinto protegido* o *habitable* del edificio o con una arista horizontal común con los mismos, debe disponerse de un *suelo flotante* cuya reducción del nivel global de presión de ruido de impactos, ΔLw, sea la especificada en la tabla 3.3.» | Suelo flotante con ΔLw también en **zonas comunes** (rellanos, pasillos) y en recintos de otras unidades colindantes en planta o con arista común (figura 3.4); el ΔLw **entre paréntesis** se exige en el suelo de instalaciones/actividad colindante en planta o con arista común con protegido/habitable, y en el que esté **encima** |
| H.4 | pto 5 | «En el caso de que una *unidad de uso* no tuviera tabiquería interior, como por ejemplo un aula, puede elegirse cualquier elemento de separación horizontal de la tabla 3.3.» | — |
| H.5 | pto 6 | «Entre paréntesis figuran los valores que deben cumplir los elementos de separación horizontales entre un *recinto protegido* o *habitable* y un *recinto de instalaciones* o de *actividad*.» | — |
| H.6 | pto 7 | «Además de lo especificado en las tablas, los techos suspendidos de los recintos de instalaciones deben instalarse con amortiguadores que eviten la transmisión de las bajas frecuencias (preferiblemente de acero). Asimismo los *suelos flotantes* instalados en *recintos de instalaciones*, pueden contar con un material aislante a ruido de impactos, con amortiguadores o con una combinación de ambos de manera que evite la transmisión de las bajas frecuencias.» | Declaración en la ficha (cuartos de instalaciones) |
| H.7 | pto 8 | «Con carácter general, la tabla 3.3 es aplicable a fachadas ligeras ventiladas y no ventiladas con la hoja interior de entramado autoportante. La hoja interior de la fachada debe cumplir las condiciones siguientes: a) La masa por unidad de superficie, m, debe ser al menos 26kg/m²; b) El índice global de reducción acústica, ponderado A, RA, debe ser al menos 43dBA.» | — |
| H.8 | Figura 3.4 | Sección: suelo flotante en todas las unidades de uso y en las zonas comunes (rellanos); leyenda «Recintos colindantes horizontalmente (1-1')» y «Recintos con una arista horizontal común (2-2')» | VERIFICADO, [HR19] p. 19 |

| # | Afirmación | Veredicto | Valor correcto | Cita | Fuente |
|---|---|---|---|---|---|
| H.9 | Masa del forjado | VERIFICADO | Sección tipo, **sin ábacos, vigas ni macizados** | 3.1.2.3.2 b) i): «m, masa por unidad de superficie del forjado, en kg/m², que corresponde al valor de masa por unidad de superficie de la sección tipo del forjado, excluyendo ábacos, vigas y macizados;» | [HR19] p. 14 |
| H.10 | Elegir fila de forjado | INTERPRETACIÓN + LEÍDO (comentario) | Forjado del proyecto con **m y RA ≥ los de la fila** (nota 1). Vale cualquier fila cumplida; la más alta cumplida suele ser la más favorable. El ΔRA/ΔLw del Sf o Ts debe haberse obtenido sobre un forjado de masa ≥ la de la fila: «De forma conservadora, deben elegirse aquellos suelos flotantes o techos cuyo valor es al menos el especificado en la tabla 3.3, siempre que se hayan obtenido sobre un forjado o losa de masa de al menos la especificada en la tabla 3.3.» | — | [HR19] p. 20; [DccHR] p. 20 (texto) |
| H.11 | Garajes, combinaciones ⁽⁷⁾ | **NO LO FIJA EL DB (con claridad) → CRITERIO** | La nota solo dice «específicas para el caso de garajes». Como cada combinación ⁽⁷⁾ es **más exigente** que la genérica de techo 0 de la misma celda, si fuese una alternativa más no se elegiría nunca. Lectura propuesta: **si el recinto de actividad es un garaje y la celda tiene combinación ⁽⁷⁾, se exige esa**; si no la tiene, valen las genéricas entre paréntesis. Las combinaciones ⁽⁷⁾ no valen para otros recintos. Pendiente de cotejar con la Guía (apartado 2.1.4.3.4.2). Ver K-HR.12 | — | [HR19] pp. 21–22 |
| H.12 | Tabiquería que cuenta | LEÍDO (comentario) | La columna es la tabiquería **del recinto receptor** | «En la tabla 3.3 se hace referencia a la tabiquería del recinto receptor, …» | [DccHR] p. 25 (texto) |

**Frase de memoria:** «Elemento de separación horizontal entre viviendas: forjado [unidireccional de hormigón, entrevigado cerámico], m = [..] kg/m² ≥ [300] kg/m², RA = [..] dBA ≥ [52] dBA; suelo flotante ΔLw = [..] dB ≥ [16] dB y ΔRA = [..] dBA ≥ [0] dBA; techo suspendido ΔRA = [..] dBA ≥ [4] dBA, con tabiquería de [fábrica con bandas elásticas] (DB-HR, ap. 3.1.2.3.5 y tabla 3.3). CUMPLE.»

---

## Bloque I — Medianerías (3.1.2.4) — punto I del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| I.1 | Parámetro y valor | VERIFICADO | **RA ≥ 45 dBA** de **toda** la superficie del cerramiento de medianería | «1 El parámetro que define una *medianería* es el índice global de reducción acústica, ponderado A, RA. 2 El valor del índice global de reducción acústica ponderado, RA, de toda la superficie del cerramiento que constituya una *medianería* de un edificio, no será menor que 45 dBA.» | [HR19] p. 22 |
| I.2 | Relación con 2.1.1 c) | LEÍDO (comentario) | RA ≥ 45 **basta** para las dos exigencias de 2.1.1 c) (40 por cerramiento / 50 el conjunto), esté construido o no el colindante | «Esta condición se aplica a los cerramientos de medianería de un edificio, independientemente de que el cerramiento del edificio colindante esté construido o no. Esta condición es suficiente para el cumplimiento de las dos exigencias relativas a las medianerías establecidas en el apartado 2.1 de este DB.» | [DccHR] p. 30 (imagen) |
| I.3 | Medianería descubierta | LEÍDO (comentario) | La parte que queda vista (solar sin edificar o exceso de superficie) debe cumplir D2m,nT,Atr ≥ 40 dBA. **DnT,A ≥ 50** del conjunto solo vale a efectos de medición con el colindante construido | «… las medianerías que vayan a quedar descubiertas porque no se ha edificado en los solares colindantes o porque la superficie de las mismas excede a las de las colindantes deben cumplir la exigencia de aislamiento acústico a ruido aéreo de D2m,nT,Atr ≥ 40 dBA.» · «La exigencia DnT,A ≥ 50 dBA para el conjunto de dos cerramientos, es una exigencia válida únicamente a efectos de medición de aislamiento y siempre que el edificio colindante esté construido.» | [DccHR] pp. 13–14 (texto) |
| I.4 | La medianería es también flanco | VERIFICADO | Debe cumplir además las condiciones de fachada de 3.1.2.3.4 pto 7 (G.5) y, si la tabiquería es de entramado, 1H/2H de la tabla 3.3 (nota 6) | pto 7 y nota 6 | [HR19] pp. 15, 22 |
| I.5 | Adosadas: no es medianería | INTERPRETACIÓN | Entre viviendas adosadas, el elemento lo regula el Anejo I.1.2 (dos hojas de RA ≥ 45 cada una, o tabla 3.2), no 3.1.2.4 | Anejo I.1.2 | [HR19] p. 71 |

**Frase de memoria:** «Medianería: [fábrica de 1 pie de ladrillo perforado + trasdosado], RA = [..] dBA ≥ 45 dBA (DB-HR, ap. 3.1.2.4), lo que satisface las exigencias del ap. 2.1.1 c). CUMPLE.»

---

## Bloque J — Tabla 3.4 (fachadas, cubiertas y suelos en contacto con el aire exterior) — punto J del encargo

**Tabla 3.4. Parámetros acústicos de fachadas, cubiertas y suelos en contacto con el aire exterior de recintos protegidos** (VERIFICADO, [HR19] p. 23, imagen; cotejada con [DccHR] p. 32, imagen, idéntica). RA,tr en dBA.

| Nivel límite exigido D2m,nT,Atr (dBA) | Parte ciega 100 % | Parte ciega ≠ 100 % | Huecos hasta 15 % | De 16 a 30 % | De 31 a 60 % | De 61 a 80 % | De 81 a 100 % |
|---|---|---|---|---|---|---|---|
| 30 | 33 | 35 | 26 | 29 | 31 | 32 | 33 |
| 30 | 33 | 40 | 25 | 28 | 30 | 31 | 33 |
| 30 | 33 | 45 | 25 | 28 | 30 | 31 | 33 |
| 32 | 35 | 35 | 30 | 32 | 34 | 34 | 35 |
| 32 | 35 | 40 | 27 | 30 | 32 | 34 | 35 |
| 32 | 35 | 45 | 26 | 29 | 32 | 33 | 35 |
| 34⁽¹⁾ | 36 | 40 | 30 | 33 | 35 | 36 | 36 |
| 34⁽¹⁾ | 36 | 45 | 29 | 32 | 34 | 36 | 36 |
| 34⁽¹⁾ | 36 | 50 | 28 | 31 | 34 | 35 | 36 |
| 36⁽¹⁾ | 38 | 40 | 33 | 35 | 37 | 38 | 38 |
| 36⁽¹⁾ | 38 | 45 | 31 | 34 | 36 | 37 | 38 |
| 36⁽¹⁾ | 38 | 50 | 30 | 33 | 36 | 37 | 38 |
| 37 | 39 | 40 | 35 | 37 | 39 | 39 | 39 |
| 37 | 39 | 45 | 32 | 35 | 37 | 38 | 39 |
| 37 | 39 | 50 | 31 | 34 | 37 | 38 | 39 |
| 41⁽¹⁾ | 43 | 45 | 39 | 40 | 42 | 43 | 43 |
| 41⁽¹⁾ | 43 | 50 | 36 | 39 | 41 | 42 | 43 |
| 41⁽¹⁾ | 43 | 55 | 35 | 38 | 41 | 42 | 43 |
| 42 | 44 | 50 | 37 | 40 | 42 | 43 | 44 |
| 42 | 44 | 55 | 36 | 39 | 42 | 43 | 44 |
| 42 | 44 | 60 | 36 | 39 | 42 | 43 | 44 |
| 46⁽¹⁾ | 48 | 50 | 43 | 45 | 47 | 48 | 48 |
| 46⁽¹⁾ | 48 | 55 | 41 | 44 | 46 | 47 | 48 |
| 46⁽¹⁾ | 48 | 60 | 40 | 43 | 46 | 47 | 48 |
| 47 | 49 | 55 | 42 | 45 | 47 | 48 | 49 |
| 47 | 49 | 60 | 41 | 44 | 47 | 48 | 49 |
| 51⁽¹⁾ | 53 | 55 | 48 | 50 | 52 | 53 | 53 |
| 51⁽¹⁾ | 53 | 60 | 46 | 49 | 51 | 52 | 53 |

En la imagen, «Parte ciega 100 %» y «De 81 a 100 %» son **una sola casilla combinada por nivel** (se repite aquí en cada fila para que sea tabla plana). **No hay celdas vacías.** Los niveles 30, 32, 37, 42 y 47 tienen 3 filas salvo 47 y 51, que tienen 2.

Notas (VERIFICADO, [HR19] p. 23):
- ⁽¹⁾ «Los valores de estos niveles límite se refieren a los que resultan de incrementar 4 dBA los exigidos en la tabla 2.1, cuando el *ruido exterior dominante* es el de aeronaves.»
- ⁽²⁾ (cabecera «RA,tr de los componentes del hueco») «El índice RA,tr de los componentes del hueco expresado en la tabla 3.4 se aplica a las ventanas que dispongan de aireadores, sistemas de microventilación o cualquier otro sistema de abertura de admisión de aire con dispositivos de cierre en posición cerrada.»

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| J.1 | % de huecos | VERIFICADO | Superficie del hueco / superficie total de la fachada **vista desde el interior de cada recinto protegido**. En esquina o con quiebros: sobre **toda la superficie del perímetro** de fachada vista desde el interior | 3.1.2.5 pto 1: «… del porcentaje de huecos expresado como la relación entre la superficie del hueco y la superficie total de la *fachada* vista desde el interior de cada *recinto protegido*.» · pto 4: «En el caso de que la fachada del *recinto protegido* fuera en esquina o tuviera quiebros, el porcentaje de huecos se determina en función de la superficie total del perímetro de la fachada vista desde el interior del *recinto*.» | [HR19] pp. 22, 23 |
| J.2 | Parámetro y conjunto del hueco | VERIFICADO | RA,tr de la parte ciega y de los elementos del hueco; el del hueco caracteriza **ventana + caja de persiana + aireador** | pto 2 y pto 3: «Este índice, RAtr, caracteriza al conjunto formado por la ventana, la caja de persiana y el aireador si lo hubiera.» | [HR19] p. 22 |
| J.3 | Aireador integrado | VERIFICADO + INTERPRETACIÓN | «Integrado» = el aireador está **en el hueco** (en la ventana, el marco o la caja de persiana) y entra en el RA,tr del conjunto. Si va **en el cerramiento** (muro), la simplificada no sirve: **opción general**. Por la nota (2), el RA,tr se toma con el aireador **cerrado** | pto 3: «En el caso de que el aireador no estuviera integrado en el hueco, sino que se colocara en el cerramiento, debe aplicarse la opción general.» | [HR19] p. 23 |
| J.4 | ¿Y si el nivel exigido no está en la tabla (p. ej. 31)? | INTERPRETACIÓN + **NO LO FIJA EL DB → CRITERIO** | Con el DB solo **no puede pasar**: la tabla 2.1 da 30, 32, 37, 42 o 47, y con aeronaves 34, 36, 41, 46 o 51; **todos** tienen fila. Solo si otra norma (ordenanza municipal) fija otro valor. Propuesta: usar el **nivel inmediatamente superior** de la tabla (31 → 32) o remitir a la opción general. Ver K-HR.8 | — | [HR19] pp. 9, 23 |
| J.5 | Cómo se lee la tabla | INTERPRETACIÓN | (1) Fachada **sin huecos** vista desde el recinto: parte ciega RA,tr ≥ «Parte ciega 100 %». (2) Con huecos: elegir una fila del nivel cuya «Parte ciega ≠ 100 %» sea **≤ RA,tr de la parte ciega del proyecto**; entonces el hueco debe tener RA,tr ≥ el valor de **esa fila** en la columna de su %. Si cumple varias filas, vale cualquiera (la de mayor parte ciega pide menos al hueco). (3) Si la parte ciega del proyecto es **menor** que la menor fila del nivel, la tabla no da solución: **NO CUMPLE por simplificada** → opción general. (4) Huecos de 81 a 100 %: hueco RA,tr ≥ valor de la casilla combinada, sea cual sea la fila. Sí: **basta con que la parte ciega del proyecto sea ≥ el valor de una fila y entonces el hueco debe cumplir esa fila** | 3.1.2.5 pto 1: «En la tabla 3.4 se expresan los valores mínimos que deben cumplir los elementos que forman los huecos y la parte ciega …» | [HR19] p. 22 |
| J.6 | Tramos de % | **NO LO FIJA EL DB → CRITERIO** | Los rótulos «Hasta 15 % / De 16 a 30 % / De 31 a 60 % / De 61 a 80 % / De 81 a 100 %» dejan huecos para decimales (15,4 %). Propuesta: límites superiores inclusivos sobre el valor real: ≤ 15; (15, 30]; (30, 60]; (60, 80]; (80, 100] | — | — |
| J.7 | Recinto más desfavorable | LEÍDO (comentario) | Se puede comprobar solo el caso más desfavorable para no multiplicar ventanas: mayor Ld, mayor % de huecos y mayor exigencia (en residencial, **dormitorios**) | «Para evitar la multiplicidad de ventanas con distinto aislamiento acústico en un edificio, puede seleccionarse el caso más desfavorable, que es: - El recinto más expuesto al ruido, es decir, con un índice de ruido día, Ld, mayor. - El recinto de mayor porcentaje de huecos - El recinto que tenga unas mayores exigencias de aislamiento acústico. • En edificios de uso residencial y hospitalario, los dormitorios. • En edificios de uso cultural, sanitario, docente, administrativo, las estancias.» | [DccHR] p. 31 (texto) |
| J.8 | Ventana + caja de persiana | LEÍDO (comentario) | RA,tr = −10·lg[(Sv·10^(−Rv,A,tr/10) + Sc·10^(−Rc,A,tr/10)) / S] (fórmula de elemento mixto; el texto extraído la desordena, reconstruida de sus símbolos) | «El aislamiento acústico de un elemento mixto, tal como una ventana con una caja de persiana incorporada, puede estimarse mediante la fórmula siguiente: …» | [DccHR] p. 31 (texto) |
| J.9 | Parte ciega ligera | LEÍDO (comentario) | Si el opaco aísla como la ventana (panel sándwich de madera), «parte ciega» = el de RA,tr **mayor** y «hueco» = el de RA,tr **menor** | «… puede usarse la tabla 3.4 del DB HR, teniendo en cuenta que "parte ciega" debe asimilarse al elemento constructivo con índice RA,tr mayor , ya sea este una ventana o cualquier cerramiento. "Hueco" debe asimilarse a aquel cerramiento con RA,tr menor.» | [DccHR] p. 32 (imagen) |
| J.10 | Cubiertas | INTERPRETACIÓN | La misma tabla; % de huecos = lucernarios / cubierta vista desde el recinto protegido | 3.1.2.5 pto 1 | [HR19] p. 22 |
| J.11 | Relación con HS3 | INTERPRETACIÓN | Las aberturas de admisión del HS3 en la ventana (aireadores, microventilación) son «integradas»: basta el RA,tr del conjunto con el dispositivo cerrado (nota 2). Si la admisión va en el muro: opción general | nota (2); pto 3 | [HR19] p. 23 |

**Frase de memoria:** «Fachada del [dormitorio 1] (recinto más desfavorable): D2m,nT,Atr exigido = [30] dBA. Parte ciega RA,tr = [..] dBA ≥ [45] dBA; huecos [22] % (de 16 a 30 %): RA,tr = [..] dBA ≥ [28] dBA (DB-HR, ap. 3.1.2.5 y tabla 3.4). CUMPLE.»

---

## Bloque K — Puertas y elementos con puertas o ventanas compartidas — punto K del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| K.1 | 3.1.2.3.4 pto 4 | VERIFICADO | Puerta de **recinto protegido** ↔ cualquier recinto que no sea instalaciones/actividad: **RA ≥ 30 dBA**. Puerta de **recinto habitable**, edificio residencial (público o privado) u hospitalario ↔ cualquiera que no sea instalaciones/actividad: **RA ≥ 20 dBA**. Puerta de **recinto habitable** ↔ instalaciones o actividad: **RA ≥ 30 dBA** | «De acuerdo con lo establecido en el apartado 2.1.1, las puertas que comunican un *recinto protegido* de una *unidad de uso* con cualquier otro del edificio que no sea *recinto de instalaciones* o de *actividad*, deben tener un índice global de reducción acústica, ponderado A, RA, no menor que 30 dBA y si comunican un *recinto habitable* de una *unidad de uso* en un edificio de uso residencial (público o privado) u hospitalario con cualquier otro del edificio que no sea *recinto de instalaciones* o de *actividad*, su índice global de reducción acústica, ponderado A, RA no será menor que 20 dBA. Si las puertas comunican un *recinto habitable* con un *recinto de instalaciones* o de *actividad*, su índice global de reducción acústica, ponderado A, RA, no será menor que 30 dBA.» | [HR19] pp. 14–15 |
| K.2 | Cerramiento con puerta o ventana | VERIFICADO + LEÍDO (comentario) | **Cerramiento RA ≥ 50 dBA** (2.1.1 a.ii, b.ii, b.iii; ficha K.1). Comentario: «Todos los elementos de la tabla 3.2 del DB HR tienen un RA mayor que 50dBA. Por lo tanto, todos los elementos de la tabla 3.2 son también válidos en el caso de particiones que tienen puertas o ventanas.» **Aviso:** el mismo documento da para el ascensor RA = RA base + ΔRA; con 67/33 + 16 saldría 49. El comentario no explica cómo se suman dos trasdosados. Ver K-HR.14 | ídem C.2, C.6, C.7 | [HR19] pp. 8–10, 75; [DccHR] p. 21 (texto) |
| K.3 | Puerta entre **recinto protegido** e instalaciones/actividad | **NO LO FIJA EL DB → CRITERIO** | 2.1.1 a.iii exige DnT,A ≥ 55 sin cláusula de puertas, y el pto 4 no la trata. Propuesta: la app **no la admite en simplificada** (aviso: rediseñar o ir a opción general) | — | [HR19] pp. 8, 14–15 |
| K.4 | Puerta de entrada a la vivienda desde el rellano | INTERPRETACIÓN | Si abre a un vestíbulo, pasillo o distribuidor (habitable): **RA ≥ 20 dBA**. Si abre directamente a un salón o comedor (protegido): **RA ≥ 30 dBA**. Cerramiento del rellano: RA ≥ 50 dBA | K.1 | — |
| K.5 | Puerta de vivienda a garaje, cuarto de instalaciones o local | INTERPRETACIÓN | Solo desde un **habitable** (vestíbulo, pasillo): **RA ≥ 30 dBA** + cerramiento ≥ 50. Ojo: puertas a garaje también tienen exigencia de DB-SI (vestíbulo de independencia, EI2 45-C5); no es objeto de esta ficha | K.1 | — |

**Frase de memoria:** «Elemento de separación vertical con puerta entre [el vestíbulo de la vivienda (recinto habitable)] y [la zona común]: puerta RA = [..] dBA ≥ 20 dBA; cerramiento RA = [..] dBA ≥ 50 dBA (DB-HR, ap. 2.1.1 b.ii y 3.1.2.3.4 pto 4). CUMPLE.»

---

## Bloque L — Uniones (3.1.4) y ruido y vibraciones de instalaciones (3.3) — punto L del encargo

Lista de condiciones que la ficha debe **declarar** (casilla «se cumple» con cita). VERIFICADO en imagen salvo indicación.

| # | Apartado | Condición |
|---|---|---|
| L.1 | 3.1.4.1.1.1 pto 1 | Tipo 1 de dos hojas con fachada de dos hojas: **interrumpir la hoja interior de la fachada**; no debe cerrar la cámara del separador ni conectar sus hojas |
| L.2 | 3.1.4.1.1.1 pto 2 | **Tabiquería interrumpida** en el encuentro con el separador, que debe ser continuo; no conecta las dos hojas ni interrumpe la cámara; si hay que trabar, solo a una hoja o con conectores |
| L.3 | 3.1.4.1.1.2 ptos 1–5 | Tipo 2: **bandas elásticas** en encuentros con forjados, fachadas y pilares; con fachada: en la hoja principal (una hoja, ventilada o SATE) o en la hoja exterior (dos hojas); interrumpir la hoja interior de la fachada; tabiquería interrumpida; con tabiquería de fábrica con bandas, bandas en su apoyo en forjado o suelo flotante |
| L.4 | 3.1.4.1.1.3 ptos 1–3 | Tipo 3: **banda de estanquidad** en el encuentro de la perfilería con forjado, pilares, otros separadores y hoja principal de fachada; interrumpir hoja interior de fachada; tabiquería interrumpida, sin conectar hojas ni interrumpir la cámara |
| L.5 | 3.1.4.1.2 | Conducto de instalaciones colectivas **adosado** a un separador vertical: revestido sin bajar el aislamiento, con continuidad de la solución |
| L.6 | 3.1.4.2.1 pto 1 | **Sin contacto** entre suelo flotante y separadores verticales, pilares y tabiques con apoyo directo: capa de material elástico o del propio aislante a impactos ([HR19] p. 33) |
| L.7 | 3.1.4.2.1 pto 2 | Techos suspendidos y suelos registrables **no continuos** entre unidades de uso; cámara interrumpida o cerrada en el encuentro con el separador vertical ([HR19] p. 33) |
| L.8 | 3.1.4.2.2 ptos 1–2 | Conducto que **atraviesa un forjado** (p. ej. bajante o ventilación): recubierto y holguras **selladas con material elástico**; conductos bajo el suelo flotante revestidos de material elástico, sin contacto ([HR19] p. 33) |
| L.9 | 3.3.1 a)–e) | Datos de suministradores: LW de equipos; s' y carga de lechos elásticos; amortiguamiento, transmisibilidad y carga de antivibratorios; α de absorbentes en conductos; atenuación de conductos y silenciadores (texto, p. 35) |
| L.10 | 3.3.2 ptos 1–5 | Equipos sobre **antivibratorios** o **bancada de inercia** (bombas: bancada de hormigón o acero con antivibratorios); válidos los que cumplan **UNE 100153 IN**; **conectores flexibles** a la entrada y salida de tuberías; **silenciadores** en chimeneas con extracción electromecánica (texto, p. 35) |
| L.11 | 3.3.3.5 ptos 1–3 — **ascensor** | Tracción anclada con **amortiguadores**; con maquinaria dentro del recinto → **recinto de instalaciones**; si no, elementos que separan el ascensor de una unidad de uso con **RA mayor que 50 dBA** (estricto: «mayor que»; el comentario escribe «≥ 50»); puertas de piso con **topes elásticos**; cuadro de mandos **montado elásticamente**. Comentario: ascensor sin cuarto de máquinas → DnT,A ≥ 55 dBA con el recinto protegido ([DccHR] p. 47, texto) |
| L.12 | 3.3.3.1 ptos 1–9 — **hidráulicas y bajantes** | Conducciones colectivas tratadas; **pasos con manguitos elásticos estancos, coquillas, pasamuros y abrazaderas desolidarizadoras**; anclaje de tuberías colectivas a elementos de **m > 150 kg/m²**; en cuartos húmedos con evacuación **descolgada del forjado: techo suspendido con absorbente** en la cámara; agua a ≤ 1 m/s en calefacción y radiadores de viviendas; grifería en recintos habitables **Grupo II** mínimo (UNE EN 200); sin cisternas elevadas por tubería ni grifos de llenado al aire; bañeras y platos de ducha con **elementos elásticos** en todos sus apoyos; radiadores no apoyados en el suelo y fijados a la pared a la vez, salvo pared sobre suelo flotante. El DB-HR **no** pide un RA concreto a la bajante: la tratan L.5, L.8 y este punto |
| L.13 | 3.3.3.2 | Conductos de aire acondicionado absorbentes cuando haga falta y silenciadores; antivibratorios en conductos |
| L.14 | 3.3.3.3 — ventilación | Conductos de extracción **dentro de una unidad de uso** revestidos con **RA ≥ 33 dBA**; si son de **humos de garaje**, **RA ≥ 45 dBA**; adosados a separador: L.5; unidades colindantes horizontalmente con conducto colectivo compartido: DB-HS3 |
| L.15 | 3.3.3.4 — residuos | Bajante de residuos tratada; **almacén de contenedores = recinto de instalaciones con suelo flotante** (enlace con el módulo HS2) |
| L.16 | 2.3 ptos 2–3 | Potencia acústica de equipos en recintos de instalaciones según niveles de inmisión de la Ley 37/2003; equipos en cubierta sin superar los objetivos de calidad. Remite además a 5.1.4 (no leído en esta sesión) |

---

## Bloque M — Anejo I (unifamiliar adosada) — punto M del encargo

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente |
|---|---|---|---|---|---|
| M.1 | I.1.1 Tabiquería | VERIFICADO | Estructura **independiente**: **RA ≥ 33 dBA**. Estructura **no independiente**: tabla 3.1 | «Si la estructura de cada una de las viviendas unifamiliares es independiente de las demás, el índice global de reducción acústica, ponderado A, RA, de la tabiquería de una vivienda unifamiliar adosada no será menor que 33 dBA. Si la estructura de cada una de las viviendas unifamiliares no es independiente de las demás, la tabiquería debe cumplir lo establecido en el apartado 3.1.2.3.3.» | [HR19] p. 71 |
| M.2 | I.1.2 pto 1 Vertical, estructura independiente | VERIFICADO | **Dos hojas, cada una RA ≥ 45 dBA** | «En el caso de que la estructura de cada una de las viviendas fuera independiente de las demás, el elemento de separación vertical de las viviendas debe estar formado por dos hojas, cada una de ellas con un índice global de reducción acústica, ponderado A, RA, de, al menos, 45 dBA.» | [HR19] p. 71 |
| M.3 | I.1.2 pto 2 Vertical, estructura horizontal compartida | VERIFICADO | **Tabla 3.2** (3.1.2.3.4) | «En el caso de que las viviendas compartan la estructura horizontal, el elemento de separación vertical de las mismas debe cumplir lo establecido en el apartado 3.1.2.3.4.» | [HR19] p. 71 |
| M.4 | I.1.2 pto 3 Instalaciones compartidas | VERIFICADO | Procurar que los equipos no linden con protegidos de otras viviendas; recinto de instalaciones compartido colindante: **valores entre paréntesis de la tabla 3.2** | «… En el caso de que varias viviendas compartan equipos dispuestos en un *recinto de instalaciones* colindante con alguna de ellas, los elementos de separación verticales que delimitan dicho *recinto* deben cumplir los valores que figuran entre paréntesis en la tabla 3.2 del apartado 3.1.2.3.4.» | [HR19] p. 71 |
| M.5 | I.1.3 pto 1 Horizontal | VERIFICADO | Si **comparten la estructura horizontal**: suelo flotante según **tabla I.1** | «Si las viviendas comparten la estructura horizontal, los forjados deben disponer de un *suelo flotante* que cumpla lo establecido en la tabla I.1.» | [HR19] p. 71 |
| M.6 | I.1.3 pto 2 | VERIFICADO | Recinto de instalaciones compartido colindante **verticalmente**: valores entre paréntesis de la **tabla 3.3** | «En el caso de que varias viviendas compartan equipos dispuestos en un *recinto de instalaciones* colindante verticalmente a alguna de ellas, los elementos de separación horizontales que separan ambos *recintos* deben cumplir los valores que figuran entre paréntesis en la tabla 3.3 del apartado 3.1.2.3.5.» | [HR19] p. 71 |
| M.7 | I.1.3 pto 3 | VERIFICADO | Sin estructura horizontal compartida, I.1.3 no aplica | «Estas condiciones no son aplicables en el caso de viviendas que no compartan la estructura horizontal.» | [HR19] p. 72 |
| M.8 | I.2 Fachadas | VERIFICADO | 3.1.2.5 (tabla 3.4) | «Las *fachadas*, *cubiertas* y suelos en contacto con el aire exterior, deben cumplir lo establecido en el apartado 3.1.2.5.» | [HR19] p. 72 |
| M.9 | Alcance del Anejo I | LEÍDO (comentario) | Vale para cualquier edificio cuyas unidades de uso estén separadas solo por elementos **verticales**. Con estructura horizontal compartida, los forjados cumplen impactos (colindantes en planta y arista común) pero no ruido aéreo. Escalera privativa colindante con protegido de otra vivienda: L'nT,w ≤ 65 dB. Unifamiliar con ascensor: 3.3.3.5 | «Este apartado se aplica a las viviendas unifamiliares adosadas, pero también se puede aplicar a cualquier edificio en la que las unidades de uso estén separadas del resto del edificio por elementos de separación verticales, pero no por elementos de separación horizontales.» · «En el caso de viviendas unifamiliares que dispongan de ascensor se deben cumplir las especificaciones contenidas en el apartado 3.3.3.5 de este DB.» | [DccHR] p. 83 (texto) |

**Tabla I.1. Parámetros de los componentes de los elementos de separación horizontales, cuando las viviendas comparten la estructura horizontal** (VERIFICADO, [HR19] p. 71, imagen). Suelo flotante⁽²⁾⁽³⁾ en función del elemento de separación vertical.

| Forjado⁽¹⁾ m (kg/m²) | Forjado RA (dBA) | ESV tipo 1: ΔLw (dB) | ESV tipo 1: ΔRA (dBA) | ESV tipo 2: ΔLw | ESV tipo 2: ΔRA | ESV tipo 3: ΔLw | ESV tipo 3: ΔRA |
|---|---|---|---|---|---|---|---|
| 175 | 44 | 14 | 10 | 22 | 10 | 23 | 10 |
| 200 | 45 | 13 | 10 | 20 | 10 | 21 | 10 |
| 225 | 47 | 13 | 10 | 19 | 10 | 20 | 10 |
| 250⁽⁴⁾ | 49 | 8 | 10 | 13 | 10 | 14 | 10 |
| 300⁽⁴⁾ | 52 | 9 | 0 | 11 | 0 | 12 | 0 |

Notas literales: ⁽¹⁾ «Los forjados deben cumplir simultáneamente los valores de masa por unidad de superficie, m y de índice global de reducción acústica, ponderado A, RA.» ⁽²⁾ «Los *suelos flotantes* deben cumplir simultáneamente los valores de reducción del nivel global de presión de ruido de impactos, ΔLw, y de mejora del índice global de reducción acústica, ponderado A, ΔRA.» ⁽³⁾ «Los valores de mejora del aislamiento a ruido aéreo, ΔRA, y de reducción de ruido de impactos, ΔLw, corresponden a un único *suelo flotante*; la adición de mejoras sucesivas, una sobre otra, en un mismo lado no garantiza la obtención de los valores de aislamiento.» ⁽⁴⁾ «En el caso de forjados con piezas de entrevigado de poliestireno expandido (EPS), este valor de ΔLw debe incrementarse en 4dB.»

Aviso de transcripción: en tipo 1, el ΔLw del forjado 300 (9) es **mayor** que el del 250 (8). Es literal.

---

## Bloque N — Anejo K, ficha K.1 (opción simplificada) — punto N del encargo

VERIFICADO, [HR19] pp. 75–76 (imagen). La ficha tiene cinco cuadros; en todos, columnas «Características **de proyecto**» y «**exigidas**» con «≥».

| Cuadro | Encabezado y texto fijo | Campos |
|---|---|---|
| 1. *Tabiquería.* (apartado 3.1.2.3.3) | — | **Tipo** · m (kg/m²) = [proy] ≥ [exig] · RA (dBA) = [proy] ≥ [exig] |
| 2. Elementos de separación verticales entre *recintos* (apartado 3.1.2.3.4) | «Debe comprobarse que se satisface la opción simplificada para los elementos de separación verticales situados entre: a) *un recinto de una unidad de uso* y cualquier otro del edificio; b) un *recinto* protegido o habitable y un *recinto de instalaciones* o un *recinto de actividad*.» · «Debe rellenarse una ficha como ésta para cada elemento de separación vertical diferente, proyectados entre a) y b)» · «Solución de elementos de separación verticales entre: …» | Columnas: Elementos constructivos · Tipo · Características. Filas: **Elemento de separación vertical** → *Elemento base*: m (kg/m²) ≥ ; RA (dBA) ≥ · *Trasdosado por ambos lados*: ΔRA (dBA) ≥. **Elemento de separación vertical con puertas y/o ventanas** → *Puerta o ventana*: RA (dBA) ≥ **20 / 30** (preimpreso) · *Cerramiento*: RA (dBA) ≥ **50** (preimpreso). Subcuadro «Condiciones de las *fachadas* a las que acometen los elementos de separación verticales»: *Fachada* · Tipo · m (kg/m²) ≥ ; RA (dBA) ≥ |
| 3. Elementos de separación horizontales entre *recintos* (apartado 3.1.2.3.5) | Mismo texto a) b) y «Debe rellenarse una ficha como ésta para cada elemento de separación horizontal diferente, proyectados entre a) y b)» · «Solución de elementos de separación horizontales entre: …» | **Elemento de separación horizontal** → *Forjado*: m (kg/m²) ≥ ; RA (dBA) ≥ · *Suelo flotante*: ΔRA (dBA) ≥ ; ΔLw (dB) ≥ · *Techo suspendido*: ΔRA (dBA) ≥ |
| 4. *Medianerías.* (apartado 3.1.2.4) | — | **Tipo** · RA (dBA) = [proy] ≥ **45** (preimpreso) |
| 5. *Fachadas, cubiertas* y suelos en contacto con el aire exterior (apartado 3.1.2.5) | «Solución de *fachada*, *cubierta* o suelo en contacto con el aire exterior: …» | Columnas: Elementos constructivos · Tipo · **Área⁽¹⁾ (m²)** · **% Huecos** · Características. Filas: *Parte ciega*: área = **Sc**; RA,tr (dBA) = ≥ · *Huecos*: área = **Sh**; RA,tr (dBA) = ≥. Nota ⁽¹⁾ «Área de la parte ciega o del hueco vista desde el interior del *recinto* considerado.» |

Observaciones para la app (INTERPRETACIÓN): la ficha **no** tiene casilla para la tabiquería del recinto receptor en el cuadro 3, ni para 1H/2H, ni para las notas de las tablas; la app las añade como líneas de «condiciones». El comentario permite otros formatos: «El Anejo K contiene un ejemplo de ficha justificativa de referencia. Pueden utilizarse otro tipo de formatos siempre que se consigne en el proyecto toda la información necesaria para garantizar el cumplimiento de la exigencias del DB HR.» ([DccHR] p. 9, texto). La ficha se incluye en la **memoria** (1.1 pto 3, VERIFICADO p. 7).

---

## Bloque O — Comentarios del Ministerio relevantes (resumen con página) — punto O del encargo

Todos LEÍDO (comentario), no reglamentarios. «(imagen)» o «(texto)» según la lectura.

| # | Tema | Página | Literal |
|---|---|---|---|
| O.1 | Recintos ruidosos y local sin uso | p. 4 (imagen) | Ver A.9 |
| O.2 | A qué edificios se aplica el aislamiento | p. 10 (texto) | Ver A.5. Y: «Existen otros tipos de edificios, como los de pública concurrencia destinados a espectáculos, uso comercial, edificios de aparcamiento, etc., en los que el DB HR no regula el aislamiento acústico.» |
| O.3 | Recintos residenciales dentro de otros usos | p. 10 (texto) | «… si un edificio de cualquier uso incluye recintos de uso residencial público o privado u hospitalario, estos recintos deben aislarse del resto de actividades del edificio. En el DB HR se consideran que son unidades de uso …» |
| O.4 | Exigencias que pasan a RA de elemento | p. 11 (texto) | Puertas/ventanas; tabiquería 33; ascensor con cuarto de máquinas independiente RA ≥ 50; conductos de extracción 33 / 45 en garajes |
| O.5 | Locales, oficinas y garajes = actividad; ascensor | p. 12 (imagen) | Ver B.7, B.6 y B.10 |
| O.6 | Exterior solo protegidos | p. 12 (imagen) | Ver C.14 |
| O.7 | Escaleras privativas | p. 14 (texto) | Ver C.16 |
| O.8 | Medianerías | pp. 13–14 (texto), p. 30 (imagen) | Ver I.2, I.3 |
| O.9 | Cafeterías y bares | p. 15 (texto) | Ver D.4 |
| O.10 | Forjados de madera | p. 17 (texto) | Ver E.2 |
| O.11 | Zonificar; adosadas | p. 17 (texto) | Ver A.6, E.8 |
| O.12 | Combinaciones no contempladas | pp. 17–18 (texto) | «Por lo general, los elementos de estas tablas pueden combinarse de cualquier manera, … sin embargo, algunas combinaciones son poco habituales en la práctica constructiva o no son recomendables desde el punto de vista del aislamiento acústico, de tal forma que en algunos casos la opción simplificada no contempla dichas combinaciones o las limita imponiendo condiciones más restrictivas.» |
| O.13 | Tabla 3.2: qué garantiza | p. 20 (texto) | Ver E.9 y G.9 |
| O.14 | Trasdosado de fachada en instalaciones | p. 21 (texto) | «En el caso de un elemento de separación vertical que separe un recinto de instalaciones o de actividad de cualquier otro recinto habitable o protegido y tenga una fachada de una hoja como elemento de flanco debe trasdosarse dicha fachada para evitar las transmisiones indirectas a través de la hoja principal.» |
| O.15 | Trasdosado de fachada y tabiquería, mismo material | p. 22 (texto) | «… para utilizar la tabla 3.2 el tipo de material: Fábrica o entramado del trasdosado de fachada y el de la tabiquería deben coincidir, aunque no es necesario que tengan el mismo espesor. Aún así, si en un edificio el tipo de trasdosado de fachada es de otro sistema constructivo al de la tabiquería, se puede utilizar la tabla 3.2, asimilando este caso al de tabiquería de fábrica, que es más restrictiva.» |
| O.16 | Entramado contra fachada de ladrillo | p. 23 (texto) | «La unión entre un elemento de separación vertical de entramado y una fachada con hoja interior de ladrillo debe estudiarse para evitar las transmisiones por flancos. En este sentido, el DB HR desaconseja esta unión.» |
| O.17 | Nota (12) solo para forjados de 200 | p. 25 (texto) | «Esta condición está motivada para limitar las transmisiones indirectas a través de los forjados. Esta condición es sólo aplicable en el caso de forjados de 200kg/m². Los forjados de masas mayores, no requieren de un suelo y un techo suspendido con estos valores de RA para limitar la transmisión indirecta.» |
| O.18 | Tabla 3.3: forjado estructural, tabiquería del receptor | p. 25 (texto) | «Se parte del dato de masa por unidad de superficie del forjado proyectado por motivos estructurales. A partir de este dato se obtiene el suelo flotante requerido, y si fuera necesario, un techo suspendido.» Y H.12 |
| O.19 | Actividad bajo vivienda: solo ΔRA | p. 26 (texto) | Ver H.2 |
| O.20 | Suelos flotantes en casi todo el edificio | p. 26 (texto) | «… conviene instalar suelos flotantes también en los recintos habitables, ya que suelen estar en contacto con un recinto protegido colindante horizontalmente, verticalmente o con una arista horizontal común. Es por ello que el uso de suelos flotantes se extiende a la práctica totalidad de recintos de un edificio, como puede verse en la figura 3.4.» |
| O.21 | Garajes (tabla 3.3, nota 7) | — | **No hay comentario** que explique las combinaciones ⁽⁷⁾ (búsqueda de «garaje» en todo [DccHR]: solo O.4, O.5 y la nota) |
| O.22 | % de huecos y recinto más desfavorable | p. 31 (texto) | Ver J.7 |
| O.23 | Panel sándwich | p. 32 (imagen) | Ver J.9 |
| O.24 | Ascensor sin cuarto de máquinas | p. 47 (texto) | Ver L.11 |
| O.25 | Anejo I | p. 83 (texto) | Ver M.9 |
| O.26 | Unifamiliar aislada | — | **No hay ningún comentario** (A.5) |

---

## Bloque P — Criterios propuestos para la app (lo que el DB no fija)

Todos son **CRITERIO** salvo donde se indica que solo ordenan lo que dice el DB. La ficha los rotula como criterio.

| # | Caso | Supuesto propuesto | Por qué |
|---|---|---|---|
| K-HR.1 | Ámbito | Obra nueva de vivienda (aislada, adosada o plurifamiliar): **aplica siempre**. Existentes: no aplica salvo que el usuario declare **rehabilitación integral** (el DB no la define). Recintos ruidosos (> 80 dBA): fuera; aviso | A.1–A.8 |
| K-HR.2 | Recintos de la vivienda | **Protegidos:** dormitorios y estancias (salón, comedor, estar, cocina abierta a estancia). **Habitables:** cocina independiente, baños, aseos, pasillos, vestíbulo, escalera interior. Para fachadas, la app calcula por tipo **dormitorio** y **estancia** | B.2–B.4 |
| K-HR.3 | Clasificación de zonas del edificio | Garaje → **actividad** (DB) salvo privativo de unifamiliar. Local (comercial o sin uso) → **actividad**, con texto para las Instrucciones de uso («el local se ha calificado como recinto de actividad (70–80 dBA); si la actividad supera 80 dBA requiere medidas adicionales»). Oficinas → **actividad** respecto a las viviendas (comentario), y se aplican los valores entre paréntesis. Trasteros → no habitable. Zona común → habitable de otra unidad | B.5–B.12, A.9 |
| K-HR.4 | Cuartos de instalaciones | Por defecto **recinto de instalaciones** todo cuarto técnico: calderas, grupo de presión, cuarto de máquinas de ascensor, almacén de contenedores, centro de transformación, ventilación de garaje, **contadores** y **RITI/RITS**. El usuario puede marcar «sin equipos que alteren las condiciones ambientales» en contadores y RITI, con aviso; pasan a recinto no habitable | B.10, B.11 |
| K-HR.5 | Ascensor | Pregunta «¿maquinaria dentro del hueco?». Sí → hueco = recinto de instalaciones (tabla 3.2 entre paréntesis). No → separador hueco–vivienda **RA > 50 dBA** (estricto) | L.11 |
| K-HR.6 | Ld por defecto | **60 dBA** solo si el usuario declara área acústica de **predominio residencial** y no hay mapa; aviso «valor por defecto del DB-HR, ap. 2.1.1, a falta de datos oficiales». En otras áreas el Ld es **obligatorio** (la app no inventa los objetivos de calidad del RD 1367/2007). Ld por fachada; recinto en esquina: mayor | C.10, C.11 |
| K-HR.7 | Correcciones de Ld y D | Casilla por fachada «no expuesta (patio cerrado, entorno tranquilo)»: Ld − 10. Casilla de edificio «ruido dominante de aeronaves / huella de aeropuerto»: D + 4 y **desactiva** el −10 | C.12, C.13 |
| K-HR.8 | Nivel fuera de la tabla 3.4 | Solo si el usuario impone otro D (ordenanza): **nivel superior más próximo** de la tabla, rotulado; por encima de 51: «opción general» | J.4 |
| K-HR.9 | % de huecos | Por recinto protegido, con la superficie de fachada vista desde dentro (todas las fachadas si es esquina). Tramos: ≤ 15; (15, 30]; (30, 60]; (60, 80]; (80, 100]. La app puede pedir solo el **recinto más desfavorable** (mayor Ld, mayor % de huecos, dormitorio), citando el comentario | J.1, J.6, J.7 |
| K-HR.10 | Lectura de la tabla 3.4 | Como J.5: el motor busca la fila de mayor «parte ciega ≠ 100 %» que no supere la del proyecto y compara el hueco; 0 % → columna «100 %»; 81–100 % → casilla combinada; parte ciega insuficiente → NO CUMPLE por simplificada | J.5 |
| K-HR.11 | Lectura de las tablas 3.2 y 3.3 | Fila: el elemento del proyecto debe tener m **y** RA ≥ la fila (se prueban todas las que cumple). Celda: CUMPLE si se cumple **alguna** alternativa con todas sus notas; valores sin nota 11/12/13 en la tabla 3.2 → forjado ≥ 300 kg/m²; tabla 3.3: ΔLw de la celda y una combinación (Sf ; Ts) completa. La ficha cita la fila y la alternativa usadas | G.3, G.7, G.8, H.10 |
| K-HR.12 | Garajes en la tabla 3.3 | Si el recinto de actividad es garaje y la celda tiene combinación ⁽⁷⁾, se exige la ⁽⁷⁾; si no, las genéricas entre paréntesis. ⁽⁷⁾ no vale para otros recintos. Rotular y dejar pendiente de la Guía | H.11 |
| K-HR.13 | Tabiquería | Un tipo de tabiquería por edificio (lo pide la estructura de las tablas). Plurifamiliar: tabla 3.1. **Aislada y adosada con estructura independiente: RA ≥ 33 dBA** (2.1.1 a.i; Anejo I.1.1 por analogía en la aislada) | F, M.1 |
| K-HR.14 | Cerramiento con puerta (RA ≥ 50) | Si el usuario da el RA del conjunto, se comprueba ≥ 50. Si no, se acepta el comentario «todos los elementos de la tabla 3.2 tienen RA > 50», rotulado como comentario | K.2 |
| K-HR.15 | Puerta protegido ↔ instalaciones/actividad | No admitida en simplificada; aviso | K.3 |
| K-HR.16 | Separaciones que se comprueban en un edificio descrito por plantas y zonas (solo ordena lo que pide el DB) | **(1)** Tabiquería (tabla 3.1). **(2)** Vertical vivienda–vivienda en la misma planta, si hay más de una (tabla 3.2, sin paréntesis). **(3)** Vertical vivienda–zona común y vivienda–trastero (tabla 3.2 sin paréntesis) + puerta de entrada (20 / 30) y cerramiento ≥ 50. **(4)** Vertical vivienda–local, oficinas, garaje o cuarto de instalaciones en la misma planta (tabla 3.2 **entre paréntesis**) + puerta (30) si la hay. **(5)** Vertical vivienda–hueco de ascensor (K-HR.5). **(6)** Horizontal vivienda sobre vivienda (tabla 3.3 sin paréntesis: ΔLw + combinación). **(7)** Horizontal vivienda sobre zona común o trasteros (planta baja con portal): combinación ΔRA sin paréntesis (pto 3). **(8)** Horizontal vivienda **sobre** local, oficinas, garaje o instalaciones: combinación ΔRA **entre paréntesis** (⁽⁷⁾ si garaje), sin ΔLw (pto 3 y comentario). **(9)** Horizontal local, instalaciones o actividad **sobre** vivienda (p. ej. cuarto técnico en cubierta, oficinas sobre viviendas): ΔLw y combinación entre paréntesis + techo con amortiguadores en instalaciones (pto 7). **(10)** Suelo flotante con ΔLw de la tabla en zonas comunes de cada planta (rellanos, pasillos; no en los tramos de escalera) y, entre paréntesis, en recintos de actividad o instalaciones colindantes en planta o con arista común con viviendas (pto 4, figura 3.4). **(11)** Medianerías: RA ≥ 45. **(12)** Fachadas y cubiertas por recinto protegido (tabla 3.4). **(13)** Lista de uniones (3.1.4) e instalaciones (3.3), declarativa | B, E.4, G, H.1–H.8, I, J |
| K-HR.17 | Forjado con EPS | Casilla «entrevigado de EPS»: ΔLw + 4 dB en los forjados con nota (4) (300, 350, 400 en la tabla 3.3; 250 y 300 en la I.1) | H, M |
| K-HR.18 | Tipo 2 con m = 170 | Como «mayor que 170» (fachada RA ≥ 50 y m ≥ 225) | G.6 |
| K-HR.19 | Estructura no de hormigón | Forjados de madera o mixtos madera-hormigón: la app **no** aplica las tablas 3.2/3.3 (aviso «opción general»); la tabla 3.4 sí | E.2 |
| K-HR.20 | Reverberación | Residencial privado: «no aplica». Local declarado restaurante, cafetería o bar con comidas: aviso «T ≤ 0,9 s (ap. 2.2), a justificar en el proyecto de actividad» | D |
| K-HR.21 | Unifamiliar aislada | Ficha reducida: tabiquería (≥ 33), fachadas y cubierta (tabla 3.4) e instalaciones (3.3). Sin separaciones ni impactos. Garaje propio: no es actividad | A.4 |
| K-HR.22 | Adosada / pareada | Anejo I con la pregunta «¿estructura independiente?». Independiente: tabiquería ≥ 33 y separador de dos hojas ≥ 45 cada una. Compartida: tabla 3.1, tabla 3.2 y tabla I.1 (según el tipo de vertical). La pareada se trata como adosada | M |
| K-HR.23 | Veredicto | **CUMPLE** si todas las separaciones aplicables cumplen con alguna alternativa. Si una no tiene solución en las tablas (celda sombreada, parte ciega insuficiente, combinación no contemplada): **«NO CUMPLE por la opción simplificada; justificar por la opción general (ap. 3.1.3)»**, no un NO CUMPLE genérico | 1.1 pto 2 |
| K-HR.24 | Cita y edición | «DB-HR Protección frente al ruido, texto consolidado de 20-12-2019 (modificado por RD 732/2019, BOE 27-12-2019); opción simplificada, ap. 3.1.2.» Comentarios: «DB-HR con comentarios del MITMA (20-12-2019), no reglamentario» | 0 |

---

## Bloque Q — Revisión del código existente (para `motor-calculo`; no se ha tocado código)

| # | Dónde | Qué | Propuesta | Base |
|---|---|---|---|---|
| Q.1 | `src/lib/proyecto/aplicabilidad.ts` l. 261–274 | Regla `cuando: (a) => a.esUnifamiliar → "no_aplica"`, con la nota «el ámbito del DB-HR excluye las viviendas unifamiliares aisladas; en unifamiliares adosadas … únicamente respecto de los elementos de separación con otros edificios». **Las dos afirmaciones son falsas** | Quitar la regla. En obra nueva el DB-HR aplica siempre; en la unifamiliar, nota «aplican tabiquería, fachadas e instalaciones» (K-HR.21) o «Anejo I» (K-HR.22). Cita: «DB-HR, Introducción II». Actualizar `aplicabilidad.test.ts` l. 150 | A.3–A.6 |
| Q.2 | `src/data/justificacionRegistry.ts` l. 331 | `edicionDB: "DB-HR (consolidado 2022)"` | `"DB-HR, consolidado 20-12-2019 (RD 732/2019)"` | 0 |
| Q.3 | `src/lib/obra/filas.ts` l. 121–123 | Solo «entre viviendas» (si numViviendas > 1) y «viviendas y otros usos» (locales u oficinas). Falta: garaje (actividad), cuartos de instalaciones, ascensor, zonas comunes, tabiquería, fachadas y medianerías. En la unifamiliar la fila queda vacía | Filas según K-HR.16: «tabiquería», «fachadas» siempre; «entre viviendas»; «zonas comunes»; «viviendas y actividad» (local, oficinas, **garaje**); «instalaciones»; «medianerías» si las hay | B, K-HR.16 |

---

## Cifras para el código

```text
# DB-HR, consolidado 20-12-2019 (últ. modif. RD 732/2019). Imagen pp. 3, 8-23, 55-57, 71, 75-76.
HR.ambito.excluye            = [recintoRuidoso(>80 dBA), espectaculos, aulas>350m3, existente && !rehabIntegral]
HR.ambito.unifamiliar        = APLICA                         # NO excluida (corrige aplicabilidad.ts)
HR.tabiqueria.RA_min         = 33                             # 2.1.1 a.i / b.i
HR.DnTA.protegido_otraUnidad = 50 ; puerta 30 ; cerramiento 50   # a.ii
HR.DnTA.protegido_instAct    = 55                                # a.iii (sin cláusula de puertas)
HR.DnTA.habitable_otraUnidad = 45 ; puerta 20 (residencial/hosp.) ; cerramiento 50   # b.ii
HR.DnTA.habitable_instAct    = 45 ; puerta 30 ; cerramiento 50   # b.iii
HR.medianeria.D2m_cerramiento= 40 ; DnTA_conjunto 50 ; RA_simplificada >= 45   # c) y 3.1.2.4
HR.impactos.protegido_otra   = L'nT,w <= 65 dB (no si colinda horizontalmente con escalera común)
HR.impactos.instAct          = L'nT,w <= 60 dB (protegido y habitable)
HR.ascensor.RA               = > 50 (estricto) si la maquinaria no está en el hueco

# Tabla 2.1 (residencial): filas [Ld<=60, 60<Ld<=65, 65<Ld<=70, 70<Ld<=75, Ld>75]
T21.dormitorios = [30, 32, 37, 42, 47]
T21.estancias   = [30, 30, 32, 37, 42]
T21.admin.estancias = [30, 32, 37, 42, 47] ; T21.aulas = [30, 30, 32, 37, 42]
Ld.defecto = 60 (solo área predominio residencial) ; esquina = max ; noExpuesta = -10 (no con aeronaves) ; aeronaves: D += 4

# Tabla 3.1
T31 = {fabricaApoyoDirecto: {m:70, RA:35}, fabricaBandas: {m:65, RA:33}, entramado: {m:25, RA:43}}

# Tabla 3.4: D -> {ciega100, filas: [[ciegaNo100, h15, h30, h60, h80]], h100}
T34 = {
 30: {c100:33, filas:[[35,26,29,31,32],[40,25,28,30,31],[45,25,28,30,31]], h100:33},
 32: {c100:35, filas:[[35,30,32,34,34],[40,27,30,32,34],[45,26,29,32,33]], h100:35},
 34: {c100:36, filas:[[40,30,33,35,36],[45,29,32,34,36],[50,28,31,34,35]], h100:36},
 36: {c100:38, filas:[[40,33,35,37,38],[45,31,34,36,37],[50,30,33,36,37]], h100:38},
 37: {c100:39, filas:[[40,35,37,39,39],[45,32,35,37,38],[50,31,34,37,38]], h100:39},
 41: {c100:43, filas:[[45,39,40,42,43],[50,36,39,41,42],[55,35,38,41,42]], h100:43},
 42: {c100:44, filas:[[50,37,40,42,43],[55,36,39,42,43],[60,36,39,42,43]], h100:44},
 46: {c100:48, filas:[[50,43,45,47,48],[55,41,44,46,47],[60,40,43,46,47]], h100:48},
 47: {c100:49, filas:[[55,42,45,47,48],[60,41,44,47,48]], h100:49},
 51: {c100:53, filas:[[55,48,50,52,53],[60,46,49,51,52]], h100:53},
}   # 34, 36, 41, 46, 51 = aeronaves (+4)

# Tabla I.1 (adosadas con estructura horizontal compartida): m, RA, [ΔLw, ΔRA] por tipo de vertical 1/2/3
TI1 = [[175,44,[14,10],[22,10],[23,10]], [200,45,[13,10],[20,10],[21,10]], [225,47,[13,10],[19,10],[20,10]],
       [250,49,[8,10],[13,10],[14,10]], [300,52,[9,0],[11,0],[12,0]]]   # EPS: ΔLw +4 en 250 y 300

# Tablas 3.2 y 3.3: usar las transcripciones de los bloques G y H tal cual (combinaciones, notas, ⁽⁷⁾, sombreados).
# Criterios (NO son CTE): K-HR.1 a K-HR.24.
```

---

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Ámbito | DB-HR | consolidado (RD 732/2019) | 2019-12-20 | Introducción II | — | codigotecnico.org, DBHR.pdf p. 3 (imagen) |
| Valores límite | DB-HR | ídem | 2019-12-20 | 2.1.1, 2.1.2 | Tabla 2.1 | DBHR.pdf pp. 8–10 (imagen) |
| Tabiquería | DB-HR | ídem | 2019-12-20 | 3.1.2.3.3 | Tabla 3.1 | DBHR.pdf p. 14 (imagen) |
| Verticales | DB-HR | ídem | 2019-12-20 | 3.1.2.3.4 | Tabla 3.2 + notas (1)–(13) | DBHR.pdf pp. 14–18 (imagen) |
| Horizontales | DB-HR | ídem | 2019-12-20 | 3.1.2.3.5 | Tabla 3.3 + notas (1)–(7) | DBHR.pdf pp. 18–22 (imagen) |
| Medianerías | DB-HR | ídem | 2019-12-20 | 3.1.2.4 | — | DBHR.pdf p. 22 (imagen) |
| Fachadas | DB-HR | ídem | 2019-12-20 | 3.1.2.5 | Tabla 3.4 + notas (1)–(2) | DBHR.pdf pp. 22–23 (imagen) |
| Adosadas | DB-HR | ídem | 2019-12-20 | Anejo I | Tabla I.1 | DBHR.pdf pp. 71–72 (imagen) |
| Ficha | DB-HR | ídem | 2019-12-20 | Anejo K, K.1 | — | DBHR.pdf pp. 75–76 (imagen) |
| Términos | DB-HR | ídem | 2019-12-20 | Anejo A | — | DBHR.pdf pp. 48, 51, 55–57 (imagen) |

---

## Pendientes

1. **P1 — Guía de aplicación del DB-HR (V.03):** no disponible. Puede resolver H.11 (combinaciones ⁽⁷⁾ de garajes; ap. 2.1.4.3.4.2), G.7 y las alternativas dominadas de las tablas 3.2 y 3.3 (ap. 2.1.4.3.3.4 y 2.1.4.3.4.2), y si contadores y RITI son recintos de instalaciones (K-HR.4).
2. **P2 — Llamada «0(» del forjado 500 (tabla 3.3):** sin resolver; se toma 0. Cotejar con la edición 2009 del DB-HR (`DBAnteriores`) o con la Guía.
3. **P3 — RD 1367/2007, objetivos de calidad (Ld por tipo de área acústica):** no verificado; la app pide Ld al usuario fuera de áreas residenciales (K-HR.6).
4. **P4 — Imagen de lo leído en «(texto)»:** DBHR pp. 35 (3.3.1, 3.3.2) y 44 (banda elástica, cubierta); DccHR pp. 9–11, 13–23, 25–27, 31, 47 y 83.
5. **P5 — DB-HR ap. 5.1.4** (ejecución de instalaciones), citado por 2.3 pto 4: no leído.
6. **P6 — Criterios a validar por el responsable:** K-HR.3 (oficinas = actividad), K-HR.4 (contadores y RITI), K-HR.11 (alternativas), K-HR.12 (garajes), K-HR.14 (cerramiento con puerta), K-HR.16 (lista de separaciones) y K-HR.21 (ficha reducida de la aislada).

---

## Bloque R — Guía de aplicación del DB-HR (V.03, dic-2016), leída después por la sesión principal

La Guía sí se puede descargar: `research/pdf/GUIA_DBHR_201612.pdf` (413 pp., enlazada desde codigotecnico.org/Guias/GuiaHR.html). Documento reconocido, no reglamentario.

| # | Punto | Veredicto | Lo que dice | Fuente |
|---|---|---|---|---|
| R.1 | Garajes en la tabla 3.3 (resuelve P1 y **cambia K-HR.12**) | VERIFICADO (imagen, Guía) | Figura 2.1.4.11, «Procedimiento de uso de la tabla 3.3 para garajes»: forjado 400/57, tabiquería con bandas elásticas, garaje debajo. La Guía marca la combinación **(6) ; (0)**, la genérica entre paréntesis con techo 0, **no** la (10 ; 0)⁽⁷⁾. Texto: «En los garajes suele ser inviable instalar un falso techo, por lo tanto el techo tiene un ∆RA = 0. El suelo flotante, es en este caso, el elemento que debe aportar el aislamiento acústico suplementario». Las ⁽⁷⁾ son **una alternativa más** válida para garajes, no una obligación | Guía p. 87 (imagen, pág. impresa 85) |
| R.2 | ΔLw del suelo flotante sobre un garaje o local | VERIFICADO (imagen, Guía) | En la misma figura: «Valor de ΔLw del suelo flotante **sin paréntesis**. El Sf debe cumplir simultáneamente los valores de ΔLw y ΔRA»: el ΔLw es el de la fila normal (12 dB con 400), el ΔRA el de la fila entre paréntesis. Y p. 80: «los suelos flotantes deben instalarse incluso en aquellas plantas en las que las unidades de uso estén superpuestas a recintos del edificio que no necesiten protección frente al ruido de impactos, como por ejemplo, en las viviendas sobre soportales, sobre un garaje, etc.» | Guía pp. 80 (texto), 87 (imagen) |
| R.3 | Instalaciones o actividad **encima** de viviendas | LEÍDO (Guía, texto) | DnT,A ≥ 55 y L'nT,w ≤ 60: ΔLw y combinación de la fila entre paréntesis (ejemplo: ΔLw ≥ 21, ΔRA Sf ≥ 3, techo ≥ 15) | Guía p. 85 (texto) |
| R.4 | Cuarto de contadores | LEÍDO (Guía, texto) | «Cuando el armario o cuarto de contadores sea colindante con recintos protegidos o habitables, se recomienda que el índice de reducción acústica RA del mismo será al menos 45 dBA.» Es una **recomendación**, no el tratamiento de recinto de instalaciones | Guía p. 288 (texto) |
| R.5 | Capas de nivelación | LEÍDO (Guía, texto) | La masa del forjado para la tabla 3.3 puede incluir las capas de nivelación dispuestas **debajo** del aislante a impactos | Guía p. 80 (texto) |

**Criterios que cambian:**
- **K-HR.12 (sustituido):** en garajes vale **cualquier** alternativa entre paréntesis de la celda (como en el resto de recintos de actividad), y además las marcadas ⁽⁷⁾; las ⁽⁷⁾ no valen para otros recintos. El suelo flotante de la vivienda cumple el ΔLw sin paréntesis (R.1, R.2).
- **K-HR.4 (matizado):** de instalaciones por defecto las calderas, salas de máquinas, maquinaria de ascensor, grupo electrógeno, almacén de residuos y cuartos de agua (grupo de presión). Los cuartos de contadores de electricidad, de telecomunicaciones y los demás, **no**: separación como «otro recinto» (tabla sin paréntesis), con la recomendación de RA ≥ 45 dBA de la Guía (R.4).
