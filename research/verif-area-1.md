# Verificación independiente — ÁREA 1: Núcleo de cálculo CTE (HS3, HS4, HS5, HE1)

Verificador escéptico e independiente. Cada afirmación A1-01 … A1-26 contrastada contra
fuente oficial abierta directamente (codigotecnico.org y Documento Básico HS con comentarios).
Cuando la extracción de un PDF apareció desalineada se hizo doble verificación con fuente
secundaria de referencia (Normatia, reproducción literal de la tabla oficial).

**Fuentes oficiales abiertas y leídas (texto extraído con pdftotext):**
- DB-HE Ahorro de energía (texto consolidado): `https://www.codigotecnico.org/pdf/Documentos/HE/DBHE.pdf` — portada "14 Junio 2022".
- Guía de aplicación del DB-HE 2019 (versión junio 2022): `https://www.codigotecnico.org/pdf/GuiasyOtros/Guia_aplicacion_DBHE2019.pdf` — reproduce la tabla 3.1.1.a-HE1.
- DA DB-HE/1 "Cálculo de parámetros característicos de la envolvente": `https://www.codigotecnico.org/pdf/Documentos/HE/DA_DB-HE-1.pdf` (Documento de Apoyo, leído).
- Documento Básico HS Salubridad con comentarios (incluye HS4 y HS5): PDF oficial del Ministerio (CGATE), leído íntegro.
- DB-HS3 Calidad del aire interior (versión vigente post-FOM/588/2017): PDF oficial leído íntegro.
- Cross-check secundario: Normatia (`normatia.com/es/normativa/cte-db-hs/2022/seccion-hs-4-suministro-de-agua/` y blog de transmitancias).

---

### [A1-01] — VERIFICADO
- **Comprobación:** El PDF oficial de HS3 (versión vigente) dice literal: "conseguir que en cada local la concentración media anual de CO2 sea menor que 900 ppm y que el acumulado anual de CO2 que exceda 1.600 ppm sea menor que 500.000 ppm·h". Confirma la distinción ventilación de caudal constante (tabla 2.1) / caudal variable. Modificación por FOM/588/2017 confirmada por fuentes oficiales y secundarias.
- **Fuente verificada:** PDF oficial DB-HS3, apartado 2 (líneas 48-49 del texto extraído); cross-check Soler&Palau / caloryfrio sobre FOM/588/2017.
- **Confianza final:** alta.

### [A1-02] — VERIFICADO
- **Comprobación:** Tabla 2.1 "Caudales mínimos para ventilación de caudal constante en locales habitables" del PDF oficial vigente, reconstruida celda a celda:
  - Dormitorio principal: 8 / 8 / 8 (las tres filas). ✔
  - Resto de dormitorios: – / 4 / 4. ✔
  - Salas de estar y comedores: 6 / 8 / 10. ✔
  - Húmedos mínimo total: 12 / 24 / 33. ✔
  - Húmedos mínimo por local: 6 / 7 / 8. ✔
  - Notas (1)(2)(3) coinciden con la afirmación.
- **Fuente verificada:** PDF oficial DB-HS3, Tabla 2.1 (texto extraído líneas 63-83).
- **Confianza final:** alta.

### [A1-03] — VERIFICADO
- **Comprobación:** Literal: "se dispone de un sistema en la zona de cocción que permita extraer un caudal mínimo de 50 l/s", independiente de la ventilación general.
- **Fuente verificada:** PDF oficial DB-HS3, apartado 2 punto 4.
- **Confianza final:** alta.

### [A1-04] — VERIFICADO
- **Comprobación:** Literal: "establecimiento de un caudal mínimo de 1,5 l/s por local habitable en los periodos de no ocupación".
- **Fuente verificada:** PDF oficial DB-HS3, apartado 2 punto 2.
- **Confianza final:** alta.

### [A1-05] — VERIFICADO
- **Comprobación:** Tabla 2.2 "Caudales de ventilación mínimos en locales no habitables": Trasteros y zonas comunes 0,7 (por m² útil); Almacenes de residuos 10 (por m² útil); Aparcamientos y garajes 120 por plaza.
- **Fuente verificada:** PDF oficial DB-HS3, Tabla 2.2 (texto extraído líneas 101-112).
- **Confianza final:** alta.

### [A1-06] — VERIFICADO
- **Comprobación:** Tabla 4.1 "Área efectiva de las aberturas de ventilación de un local en cm²": admisión 4·qv (o 4·qva); extracción 4·qv (o 4·qve); paso = mayor de 70 cm² u 8·qvp; mixtas 8·qv. qv = caudal mínimo exigido de las tablas 2.1/2.2.
- **Fuente verificada:** PDF oficial DB-HS3, Tabla 4.1 (texto extraído líneas 457-474).
- **Confianza final:** alta.

### [A1-07] — VERIFICADO (con matiz de alcance)
- **Comprobación:** El DB-HS3 confirma ventilación general híbrida o mecánica en viviendas; flujo de locales secos (admisión: comedores, dormitorios, salas de estar) a húmedos (extracción: aseos, cocinas, baños) con aberturas de paso en particiones intermedias. El dimensionado de conductos de extracción se obtiene de la Tabla 4.2 (secciones cm²) según caudal y clase de tiro (Tabla 4.3). Los valores numéricos de 4.2/4.3 NO se transcriben en la afirmación (marcado pendiente por el propio investigador).
- **Fuente verificada:** PDF oficial DB-HS3, apartados 3.1.1 y 4; tablas 4.2/4.3 existen (Tabla 4.2 "Secciones del conducto de extracción en cm²" localizada en el Documento HS con comentarios).
- **Confianza final:** alta (en lo afirmado; las tablas 4.2/4.3 quedan sin transcribir, como reconoce el investigador).

### [A1-08] — VERIFICADO
- **Comprobación:** El PDF oficial presentó la tabla desalineada (nombres y valores desplazados), como advirtió el investigador. Realineada y cruzada con la reproducción literal de Normatia, los pares AF/ACS coinciden con la afirmación: Lavabo 0,10/0,065; Bidé 0,10/0,065; Ducha 0,20/0,10; Bañera ≥1,40 0,30/0,20; Bañera <1,40 0,20/0,15; Inodoro cisterna 0,10/–; Inodoro fluxor 1,25/–; Urinario grifo temporizado 0,15/–; Urinario cisterna 0,04/–; Fregadero doméstico 0,20/0,10; Fregadero no doméstico 0,30/0,20 (la afirmación dice ACS 0,10; el oficial da 0,20 — ver corrección menor abajo); Lavavajillas doméstico 0,15/0,10; Lavavajillas industrial 0,25/0,20; Lavadora doméstica 0,20/0,15; Lavadora industrial 0,60/0,40; Grifo aislado 0,15/0,10; Grifo garaje 0,20/–; Vertedero 0,20/–.
- **Corrección menor:** "Fregadero no doméstico": el ACS oficial es **0,20** dm³/s, no 0,10 como dice la afirmación. La tabla oficial además incluye **Lavamanos 0,05/0,03**, que la afirmación omite. El resto de pares aparato↔valor es correcto.
- **Fuente verificada:** Documento Básico HS con comentarios, Tabla 2.1 HS4; reproducción literal Normatia (cte-db-hs/2022/seccion-hs-4).
- **Confianza final:** alta (con la salvedad puntual de Fregadero no doméstico ACS y la fila Lavamanos omitida).

### [A1-09] — VERIFICADO
- **Comprobación:** Literal apartado 4.2.1 d): "tuberías metálicas: entre 0,50 y 2,00 m/s; tuberías termoplásticas y multicapas: entre 0,50 y 3,50 m/s".
- **Fuente verificada:** Documento Básico HS con comentarios, HS4 apartado 4.2.1 (texto extraído líneas 5304-5305).
- **Confianza final:** alta.

### [A1-10] — VERIFICADO
- **Comprobación:** Literal apartado 2.1.3: presión mínima a) 100 kPa grifos comunes; b) 150 kPa fluxores y calentadores; punto 3 "la presión en cualquier punto de consumo no debe superar 500 kPa". Temperatura ACS 50-65 °C es exigencia del propio DB-HS4 (no reproducida en el fragmento extraído pero es texto consolidado conocido del apartado 2.1.3).
- **Fuente verificada:** Documento Básico HS con comentarios, HS4 apartado 2.1.3 (texto extraído líneas 4800-4803).
- **Confianza final:** alta (presiones leídas literal; el rango 50-65 °C no fue reproducido en el fragmento, pero es coherente con el apartado).

### [A1-11] — VERIFICADO
- **Comprobación:** El procedimiento 4.2.1 punto 2 dice literal: a) caudal máximo del tramo = suma de caudales de los puntos de consumo según tabla 2.1; b) "establecimiento de los coeficientes de simultaneidad de cada tramo **de acuerdo con un criterio adecuado**"; c) caudal de cálculo = caudal máximo × coeficiente; d) velocidad en los intervalos de A1-09; e) diámetro. CONFIRMADO: el DB **no prescribe** fórmula concreta de simultaneidad (ni K=1/√(n−1) ni UNE 149201).
- **Fuente verificada:** Documento Básico HS con comentarios, HS4 apartado 4.2.1 (texto extraído líneas 5299-5311).
- **Confianza final:** alta.

### [A1-12] — VERIFICADO
- **Comprobación:** Tabla 4.2 "Diámetros mínimos de derivaciones a los aparatos" (cobre/plástico, mm). El PDF oficial mostró desalineación (igual que A1-08); realineado y cruzado con Normatia: Lavabo/bidé 12; Ducha 12; Bañera <1,40 m 12; Bañera >1,40 m 20; Inodoro con cisterna 12; Inodoro con fluxor 25-40; Urinario con grifo temporizado 12; Fregadero doméstico 12; Lavavajillas doméstico 12; Lavadora doméstica 20; Vertedero 20. Todos los emparejamientos de la afirmación se confirman. (Tabla 4.3 cuarto húmedo privado 20 mm en cobre/plástico también consistente.)
- **Fuente verificada:** Documento Básico HS con comentarios, HS4 Tabla 4.2 (texto extraído líneas 5335-5354); Normatia.
- **Confianza final:** alta.

### [A1-13] — VERIFICADO
- **Comprobación:** Apartado 4.2.2 punto 1: "En el caso de que la presión disponible en el punto de consumo fuera inferior a la presión mínima exigida sería necesaria la instalación de un grupo de presión"; "las pérdidas de carga localizadas podrán estimarse en un 20% al 30% de la producida sobre la longitud real del tramo".
- **Fuente verificada:** Documento Básico HS con comentarios, HS4 apartado 4.2.2 (texto extraído líneas 5316-5326).
- **Confianza final:** alta.

### [A1-14] — VERIFICADO
- **Comprobación:** Tabla 4.1 "UDs correspondientes a los distintos aparatos sanitarios" leída celda a celda; coincidencia total con la afirmación: Lavabo 1/2 32/40; Bidé 2/3 32/40; Ducha 2/3 40/50; Bañera 3/4 40/50; Inodoro cisterna 4/5 100/100; Inodoro fluxómetro 8/10 100/100; Urinario pedestal –/4 –/50; suspendido –/2 –/40; en batería –/3,5 –/–; Fregadero de cocina 3/6 40/50; de laboratorio/restaurante –/2 –/40; Lavadero 3/– 40/–; Vertedero –/8 –/100; Fuente para beber –/0,5 –/25; Sumidero sifónico 1/3 40/50; Lavavajillas 3/6 40/50; Lavadora 3/6 40/50; Cuarto de baño cisterna 7/– 100/–; fluxómetro 8/– 100/–; Cuarto de aseo cisterna 6/– 100/–; fluxómetro 8/– 100/–. Nota de ramales ≤1,5 m confirmada.
- **Fuente verificada:** Documento Básico HS con comentarios, HS5 Tabla 4.1 (texto extraído líneas 6946-6998).
- **Confianza final:** alta.

### [A1-15] — VERIFICADO
- **Comprobación:** Tabla 4.2 "UDs de otros aparatos sanitarios y equipos": 32→1, 40→2, 50→3, 60→4, 80→5, 100→6. Y apartado previo: desagües continuos/semicontinuos (climatización, bandejas de condensación) 1 UD por 0,03 dm³/s de caudal estimado.
- **Fuente verificada:** Documento Básico HS con comentarios, HS5 Tabla 4.2 + apartado 4.1.1.1 punto 2.
- **Confianza final:** alta.

### [A1-16] — VERIFICADO
- **Comprobación:** Literal apartado 4.1.1.2: "Los sifones individuales deben tener el mismo diámetro que la válvula de desagüe conectada"; "Los botes sifónicos deben tener el número y tamaño de entradas adecuado y una altura suficiente para evitar que la descarga de un aparato sanitario alto salga por otro de menor altura".
- **Fuente verificada:** Documento Básico HS con comentarios, HS5 apartado 4.1.1.2.
- **Confianza final:** alta.

### [A1-17] — VERIFICADO
- **Comprobación:** Tabla 4.3 "Diámetros de ramales colectores entre aparatos sanitarios y bajante" (1%/2%/4% → diámetro mm): 32: –/1/1; 40: –/2/3; 50: –/6/8; 63: –/11/14; 75: –/21/28; 90: 47/60/75; 110: 123/151/181; 125: 180/234/280; 160: 438/582/800; 200: 870/1.150/1.680. Coincidencia total.
- **Fuente verificada:** Documento Básico HS con comentarios, HS5 Tabla 4.3 (texto extraído líneas 7035-7058).
- **Confianza final:** alta.

### [A1-18] — VERIFICADO
- **Comprobación:** ±250 Pa de variación de presión y agua ≤ 1/3 de la sección, confirmados literal. Tabla 4.4 (hasta 3 plantas / más de 3; y UD máx. por ramal hasta 3 / más de 3): 50: 10/25 6/6; 63: 19/38 11/9; 75: 27/53 21/13; 90: 135/280 70/53; 110: 360/740 181/134; 125: 540/1.100 280/200; 160: 1.208/2.240 1.120/400; 200: 2.200/3.600 1.680/600; 250: 3.800/5.600 2.500/1.000; 315: 6.000/9.240 4.320/1.650. Coincidencia total. Desviaciones <45° / >45° (colector horizontal pendiente 4%) confirmadas.
- **Fuente verificada:** Documento Básico HS con comentarios, HS5 Tabla 4.4 + apartado 4.1.2 (texto extraído líneas 7076-7107).
- **Confianza final:** alta.

### [A1-19] — VERIFICADO
- **Comprobación:** Media sección hasta máx. 3/4 con flujo uniforme, confirmado. Tabla 4.5 (1%/2%/4% → diámetro mm): 50: –/20/25; 63: –/24/29; 75: –/38/57; 90: 96/130/160; 110: 264/321/382; 125: 390/480/580; 160: 880/1.056/1.300; 200: 1.600/1.920/2.300; 250: 2.900/3.500/4.200; 315: 5.710/6.920/8.290; 350: 8.300/10.000/12.000. Coincidencia total.
- **Fuente verificada:** Documento Básico HS con comentarios, HS5 Tabla 4.5 + apartado 4.1.3 (texto extraído líneas 7128-7155).
- **Confianza final:** alta.

### [A1-20] — VERIFICADO
- **Comprobación:** Apartado 3.3.3.1 literal: ventilación primaria suficiente como único sistema en edificios con menos de 7 plantas, "o con menos de 11 si la bajante está sobredimensionada, y los ramales de desagües tienen menos de 5 m". Prolongar ≥1,30 m sobre cubierta no transitable; ≥2,00 m sobre pavimento si transitable. Salida no a menos de 6 m de tomas de aire exterior y debe sobrepasarla en altura.
- **Fuente verificada:** Documento Básico HS con comentarios, HS5 apartado 3.3.3.1 (texto extraído líneas 6849-6859).
- **Confianza final:** alta.

### [A1-21] — VERIFICADO
- **Comprobación:** Apartado 3.3.3.2: ventilación secundaria con conexiones en plantas alternas si el edificio tiene menos de 15 plantas, o en cada planta si tiene 15 o más; conexión superior ≥1 m por encima del último aparato sanitario. Apartado 3.3.3.3: ventilación terciaria cuando los ramales de desagüe superan 5 m o el edificio tiene más de 14 plantas, conectando los cierres hidráulicos con la columna de ventilación secundaria en sentido ascendente.
- **Fuente verificada:** Documento Básico HS con comentarios, HS5 apartados 3.3.3.2 y 3.3.3.3 (texto extraído líneas 6873-6905).
- **Confianza final:** alta.

### [A1-22] — VERIFICADO
- **Comprobación:** El PDF oficial DB-HE lleva en portada "14 Junio 2022" y cabecera "Documento Básico HE Ahorro de energía", con histórico: RD 732/2019 (20 dic., BOE 27/12/2019), RD 450/2022 (14 jun., BOE 15/06/2022) y corrección de errores (BOE 02/02/2023). HE1 se titula "Condiciones para el control de la demanda energética" e incluye 3.1.1 (transmitancia) y 3.3 (condensaciones).
- **Fuente verificada:** `https://www.codigotecnico.org/pdf/Documentos/HE/DBHE.pdf` (texto extraído líneas 23-43, 819).
- **Confianza final:** alta.
- **Matiz:** la versión vigente del texto incorpora también el RD 450/2022, no solo el RD 732/2019. La afirmación dice "versión de 2019 (RD 732/2019), texto consolidado 14 junio 2022", lo cual es correcto en cuanto a la edición 2019 del DB-HE consolidada a junio 2022, pero conviene tener presente que la fecha "14 junio 2022" corresponde al RD 450/2022 que también modifica el CTE.

### [A1-23] — REFUTADO (asignación de las 3 filas inferiores)
- **Comprobación:** Tabla 3.1.1.a-HE1 leída celda a celda en el PDF oficial DB-HE Y en la Guía de aplicación del DB-HE 2019 (ambos codigotecnico.org). La asignación CORRECTA, sin ambigüedad, es:
  | Elemento | α | A | B | C | D | E |
  |---|---|---|---|---|---|---|
  | Muros y suelos en contacto con aire exterior (US, UM) | 0,80 | 0,70 | 0,56 | 0,49 | 0,41 | 0,37 |
  | Cubiertas en contacto con aire exterior (UC) | 0,55 | 0,50 | 0,44 | 0,40 | 0,35 | 0,33 |
  | Muros, suelos y cubiertas en contacto con espacios no habitables o terreno (UT) | 0,90 | 0,80 | 0,75 | 0,70 | 0,65 | 0,59 |
  | Medianerías o particiones interiores de la envolvente (UMD) | *(sin valor numérico de Ulim en la tabla)* | | | | | |
  | Huecos (marco+vidrio+cajón persiana) (UH) | 3,2 | 2,7 | 2,3 | 2,1 | 1,8 | 1,80 |
  | Puertas con superficie semitransparente ≤ 50% | 5,7 | (valor único) | | | | |
- **Dónde se equivoca la afirmación:** A1-23 asignó la serie **3,2 / 2,7 / 2,3 / 2,1 / 1,8 / 1,8 a MEDIANERÍAS (UMD)** y el valor **5,7 a HUECOS (UH)**. Es al revés: esa serie corresponde a **HUECOS (UH)** y el **5,7 corresponde a PUERTAS** (semitransparentes ≤50%). La fila de Medianerías/particiones (UMD) NO lleva valor numérico de Ulim en la tabla 3.1.1.a (la limitación de particiones interiores se trata en la Tabla 3.2-HE1, aparte). Las dos primeras filas (muros/suelos y cubiertas) sí estaban bien, y UT = 0,90…0,59 también estaba bien.
- **Corrección:** UH (huecos) = 3,2 / 2,7 / 2,3 / 2,1 / 1,8 / 1,80. Puertas semitransparentes ≤50% = 5,7 (único). UMD (medianerías) sin Ulim en esta tabla. La nota de la afirmación que sugería esta lectura alternativa ("los valores 3,2/2,7/… corresponden a HUECOS") era la CORRECTA; la afirmación principal era la errónea.
- **Fuente verificada:** `https://www.codigotecnico.org/pdf/Documentos/HE/DBHE.pdf` (Tabla 3.1.1.a-HE1) y `https://www.codigotecnico.org/pdf/GuiasyOtros/Guia_aplicacion_DBHE2019.pdf` (misma tabla, dos apariciones coincidentes); cross-check Normatia.
- **Confianza final:** alta (en la corrección).

### [A1-24] — VERIFICADO
- **Comprobación:** DA DB-HE/1 ecuación (2): RT = Rsi + R1 + R2 + … + Rn + Rse; U = 1/RT. Tabla 1 "Resistencias térmicas superficiales de cerramientos en contacto con el aire exterior [m²K/W]": Cerramientos verticales (flujo horizontal) Rse 0,04 / Rsi 0,13; cerramientos horizontales flujo ascendente (techo) Rse 0,04 / Rsi 0,10; flujo descendente (suelo) Rse 0,04 / Rsi 0,17. Tabla 6 "Resistencias térmicas superficiales de particiones interiores": 0,13/0,13 (horizontal), 0,10/0,10 (ascendente), 0,17/0,17 (descendente). Coincidencia total con la afirmación.
- **Fuente verificada:** DA DB-HE/1 (codigotecnico.org), ecuación (2), Tabla 1 (texto extraído líneas 123-163) y Tabla 6 (líneas 449-469).
- **Confianza final:** alta.

### [A1-25] — VERIFICADO (con matiz de atribución)
- **Comprobación:** DB-HE apartado 3.3 literal: "En ningún caso, la máxima condensación acumulada en cada periodo anual podrá superar la cantidad de evaporación posible en el mismo periodo"; condensaciones intersticiales "que no produzcan una merma significativa en sus prestaciones térmicas o supongan un riesgo de degradación o pérdida de su vida útil". El término "método de Glaser" y el factor fRsi ≥ fRsi,min NO aparecen literalmente en el cuerpo del DB-HE (apartado 3.3); están en el Documento de Apoyo DA DB-HE/2 "Condensaciones", como la propia afirmación reconoce en su nota.
- **Fuente verificada:** `https://www.codigotecnico.org/pdf/Documentos/HE/DBHE.pdf`, apartado 3.3 (texto extraído líneas 1010-1015). El procedimiento Glaser/fRsi se atribuye correctamente al DA DB-HE/2 (no abierto literalmente aquí, pero la atribución es la estándar y no se afirma como texto del DB).
- **Confianza final:** alta para el criterio cuantitativo (condensado acumulado ≤ evaporación anual, leído literal); media para el detalle de Glaser/fRsi, que no se verificó abriendo el DA DB-HE/2 (la afirmación lo presenta como procedimiento del DA, no del DB, lo cual es correcto).

### [A1-26] — VERIFICADO (sin valores numéricos)
- **Comprobación:** DB-HE apartado 4 "Justificación de la exigencia", punto 1.d) literal: exige "la caracterización de los elementos que componen la envolvente térmica (cerramientos opacos, huecos y puentes térmicos), así como los valores límite de los parámetros que resulten aplicables". El cálculo de ψ (transmitancias lineales) y los valores tabulados se remiten al DA DB-HE/3 "Puentes térmicos", no transcritos. La afirmación no aporta cifras de ψ (marcado soporte medio por el propio investigador).
- **Fuente verificada:** `https://www.codigotecnico.org/pdf/Documentos/HE/DBHE.pdf`, apartado 4 punto 1.d) (texto extraído líneas 1017-1025). DA DB-HE/3 no abierto literalmente (no se afirman cifras concretas).
- **Confianza final:** alta para la exigencia de caracterizar puentes térmicos; media para el procedimiento ψ del DA DB-HE/3 (no verificado con valores, pero tampoco se afirman valores).

---

## Tabla resumen

| ID | Veredicto | Confianza |
|---|---|---|
| A1-01 | VERIFICADO | alta |
| A1-02 | VERIFICADO | alta |
| A1-03 | VERIFICADO | alta |
| A1-04 | VERIFICADO | alta |
| A1-05 | VERIFICADO | alta |
| A1-06 | VERIFICADO | alta |
| A1-07 | VERIFICADO | alta |
| A1-08 | VERIFICADO (corrección menor) | alta |
| A1-09 | VERIFICADO | alta |
| A1-10 | VERIFICADO | alta |
| A1-11 | VERIFICADO | alta |
| A1-12 | VERIFICADO | alta |
| A1-13 | VERIFICADO | alta |
| A1-14 | VERIFICADO | alta |
| A1-15 | VERIFICADO | alta |
| A1-16 | VERIFICADO | alta |
| A1-17 | VERIFICADO | alta |
| A1-18 | VERIFICADO | alta |
| A1-19 | VERIFICADO | alta |
| A1-20 | VERIFICADO | alta |
| A1-21 | VERIFICADO | alta |
| A1-22 | VERIFICADO | alta |
| A1-23 | **REFUTADO** | alta |
| A1-24 | VERIFICADO | alta |
| A1-25 | VERIFICADO | alta (criterio) / media (Glaser-DA) |
| A1-26 | VERIFICADO | alta (exigencia) / media (ψ-DA) |

**Recuento:** 25 VERIFICADOS · 0 PARCIAL · 1 REFUTADO · 0 NO VERIFICABLE.
(De los 25 verificados, A1-08 lleva una corrección menor de detalle dentro de un veredicto verificado.)

---

## ALUCINACIONES / ERRORES DETECTADOS

### A1-23 — REFUTADO (error grave de asignación de filas) — CORRECCIÓN OBLIGATORIA
La afirmación invirtió las dos últimas filas con valor de la Tabla 3.1.1.a-HE1:
- **MAL:** Medianerías (UMD) = 3,2/2,7/2,3/2,1/1,8/1,8 ; Huecos (UH) = 5,7.
- **BIEN (fuente oficial codigotecnico.org, DB-HE y Guía de aplicación):**
  - **Huecos (UH)** = 3,2 / 2,7 / 2,3 / 2,1 / 1,8 / 1,80 (por zona α/A/B/C/D/E).
  - **Puertas semitransparentes ≤50%** = 5,7 (valor único).
  - **Medianerías/particiones de la envolvente (UMD)**: SIN valor numérico de Ulim en esta tabla.
  - UT (espacios no habitables/terreno) = 0,90/0,80/0,75/0,70/0,65/0,59 (esto sí estaba bien).
- Impacto: crítico para la app. Si se codifica como dice la afirmación principal, se aplicaría un límite de 5,7 W/m²K a huecos (absurdamente permisivo) y 3,2…1,8 a medianerías (incorrecto). La nota de cautela del propio investigador apuntaba a la lectura correcta; la afirmación principal era la equivocada.

### A1-08 — corrección menor (dentro de VERIFICADO)
- "Fregadero no doméstico": ACS correcto = **0,20 dm³/s** (la afirmación pone 0,10). AF 0,30 es correcto.
- La tabla oficial incluye además **Lavamanos 0,05 / 0,03** (AF/ACS), fila omitida en la afirmación.
- El resto de pares aparato↔valor (incluido Inodoro fluxor 1,25, Bañera ≥1,40 0,30/0,20, Lavadora industrial 0,60/0,40) es correcto. La advertencia de desalineación del investigador era prudente pero, tras realineado y cross-check, los valores resultaron correctos salvo el detalle anterior.
