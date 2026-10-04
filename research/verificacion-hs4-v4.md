# Verificación normativa — HS 4 v4: suministro de agua desde el modelo de edificio

**Fecha:** 2026-10-04
**Ámbito:** las 12 afirmaciones del encargo para la nueva pantalla de HS 4 (viviendas por planta, local sin uso en PB, oficinas con núcleos de aseos, garaje), más los hallazgos sobre `src/modules/hs4/tablas.ts` que salieron al leer el texto:
- A: presiones y temperatura del ACS (afirmaciones 1 y 2);
- B: ahorro de agua: retorno de ACS y contabilización (3 y 4);
- C: dimensionado: velocidades, simultaneidad, caudales, diámetros y pérdidas (5, 8, 9, 10 y 11);
- D: control de la presión: grupo de presión y reductoras (6 y 7);
- E: edición vigente del HS 4 y forma de citarla (12);
- F: hallazgos adicionales.

**Regla aplicada:** ninguna cifra se da por buena sin haber leído el texto. Cada fila indica qué fuente se leyó. Veredictos:
- VERIFICADO: literal en el DB.
- **CORREGIR**: la afirmación del encargo o del repo no coincide con el DB (valor, apartado o naturaleza).
- **NO LOCALIZADO**: el DB no lo dice, o la fuente no se puede leer.
- **CRITERIO**: decisión de proyecto propuesta. No es exigencia del CTE y la ficha debe etiquetarla así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición leída | Fuente | Lectura |
|---|---|---|---|---|
| [N22] | DB-HS, Sección HS 4 | Reproducción HTML del consolidado, rotulada «Versión 2022 Vigente» | normatia.com, `/normativa/cte-db-hs/2022/seccion-hs-4-suministro-de-agua` | 2.1.3, 2.2, 2.3, 3.1, 3.2.1.2.1/3/7, 3.2.1.5, 3.2.2.1, 4.1–4.5, 5.1.2, 5.1.3, 7.1, 7.3 y parte del Apéndice A. **Fuente secundaria** |
| [CYII] | DB-HS, Sección HS 4 (solo esta sección) | Texto **anterior a 2022**: en 3.2.2.1 pto 2 dice «energía solar» y en 4.5.2.1 pto 2 cita «UNE 100 030:1994». Ya incluye la corrección de errores de 2008 (fila Lavamanos; fregadero no doméstico, ACS 0,20). No trae línea de versión | canaldeisabelsegunda.es, `cte_Suministro_de_agua.pdf`, convertido a texto con r.jina.ai | 2.1.3, 2.3, 3.2.1.2.7, 3.2.2.1 ptos 2 y 3, 4.2.1 pto 2, 4.2.2 pto 1 a), 4.5.2.1 pto 2, Tablas 2.1 y 4.3 |
| [RD450] | RD 450/2022 (BOE 15/06/2022), BOE-A-2022-9848 | Texto publicado | boe.es | Modificaciones del DB-HS en HS 4 |
| [FOM588] | Orden FOM/588/2017, BOE-A-2017-7163 | Texto publicado | boe.es | Solo modifica HS 3. **No toca HS 4** |
| [RD732] | RD 732/2019, BOE-A-2019-18528 | Texto publicado | boe.es | Añade HS 6. **No toca HS 4** |
| [Acc] | Extracción previa del «DB-HS con comentarios» | La del repo | `research/verif-area-1.md`, A1-08 a A1-13 | Corrobora 2.1.3, 4.2.1, 4.2.2 y las Tablas 2.1 y 4.2 |
| [UNEsec] | Fuentes secundarias sobre UNE 149201 | — | proinstalaciones.com (04-06-2018); ingenierosindustriales.com (11-01-2019); ayuda de TK-HS4 (imventa.com); blog amrandado (Junta de Andalucía) | Solo describen la norma. **No es la norma** |

**Cómo se ha triangulado.** Las cifras de 2.1.3, 2.3, 3.2.1.2.7, 3.2.2.1, 4.2.1, 4.2.2 y las Tablas 2.1 y 4.3 coinciden en [N22] (2022) y [CYII] (anterior a 2022), y con [Acc]. Así se marcan en la columna de fuente. Lo que solo está en [N22] se indica: es confianza media hasta el cotejo con el PDF.

Avisos de las fuentes:
- Normatia es un agregador. Su texto no tiene valor jurídico.
- El propio consolidado de codigotecnico.org advierte que «no tiene valor jurídico». La referencia jurídica es el BOE.

**No leídos:**
- **PDF oficial `DBHS.pdf` de codigotecnico.org (consolidado 14-06-2022).** Lo descargué (4,4 MB), pero no lo pude leer en este entorno:
  - no hay `pdftoppm`, que es lo que necesita Read para abrir PDF;
  - WebFetch no descomprime el PDF;
  - r.jina.ai lo trunca a unos 184.000 caracteres, antes de HS 4 (corta en HS 1, 5.1.1.5.1). Un intento por esa vía devolvió texto inventado por el modelo intermedio y lo descarté.
- «DB-HS con comentarios» (comentarios del Ministerio): mismo problema.
- UNE 149201 (ediciones de 2008 y 2017): es de pago.
- BOE de 25/01/2008 (corrección de errores) y de VIV/984/2009: harían falta para fechar la excepción de vivienda de 2.1.3 pto 4 (ver A2).

---

## Bloque A — Presiones y temperatura del ACS (ap. 2.1.3)

Estructura de 2.1.3, «Condiciones mínimas de suministro», según [N22] y [CYII]:
- pto 1: caudales de la Tabla 2.1;
- pto 2: presión mínima;
- pto 3: presión máxima;
- pto 4: temperatura del ACS.

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| A1 | Presión mínima en los puntos de consumo: 100 kPa en grifos comunes y 150 kPa en fluxores y calentadores | VERIFICADO (valores). **CORREGIR** el punto | 100 kPa / 150 kPa | DB-HS 4, ap. 2.1.3 **pto 2**: «En los puntos de consumo la presión mínima debe ser: a) 100 kPa para grifos comunes; b) 150 kPa para fluxores y calentadores.» | [N22] [CYII] [Acc] |
| A1b | Presión máxima en cualquier punto: 500 kPa | VERIFICADO | 500 kPa | ap. 2.1.3 **pto 3**: «La presión en cualquier punto de consumo no debe superar 500 kPa.» | [N22] [CYII] [Acc] |
| A1c | ¿Es «2.1.3 puntos 1 y 2»? | **CORREGIR** | Mínima: pto 2. Máxima: pto 3. El pto 1 son los caudales | ap. 2.1.3 ptos 1 a 4 | [N22] [CYII] |
| A2 | Temperatura del ACS de 50 a 65 °C y su excepción para vivienda: ¿2.1.3 pto 3 o ap. 2.3? | **CORREGIR**: ni lo uno ni lo otro. El repo cita «ap. 2.3» en `TEMPERATURA_ACS`, y el ap. 2.3 es «Ahorro de agua» | 50–65 °C, con excepción | ap. 2.1.3 **pto 4**: «La temperatura de ACS en los puntos de consumo debe estar comprendida entre 50°C y 65°C excepto en las instalaciones ubicadas en edificios dedicados a uso exclusivo de vivienda siempre que estas no afecten al ambiente exterior de dichos edificios.» | [N22] [CYII] |
| A2b | ¿La excepción vale para este edificio (viviendas + oficinas + local + garaje)? | **No**, por el literal. Lo del garaje y los trasteros es **CRITERIO** | Un edificio con oficinas o con local no está «dedicado a uso exclusivo de vivienda»: rige 50–65 °C | ap. 2.1.3 pto 4 | [N22] |
| A2c | ¿Desde cuándo está la excepción? | **NO LOCALIZADO** (fecha) | Está en [CYII] (anterior a 2022), con un punto suelto («65ºC. excepto»), lo que sugiere un añadido posterior al texto original. No he leído el BOE que la introdujo | — | [CYII] |
| A3 | ¿Qué es un «calentador» a efectos de los 150 kPa? | **NO LOCALIZADO** (el DB no lo define) → **CRITERIO** | Con ACS individual instantánea (calentador o caldera mixta), exigir 150 kPa a la entrada del aparato. Con acumulador o aerotermia, 100 kPa en los grifos | ap. 2.1.3 pto 2 b) | [N22] |

**Nota A2 — qué hacer en la UI.**
- La temperatura del ACS es una condición de diseño: la app no la calcula. Mostrarla como condición declarada con la cita de 2.1.3 pto 4, nunca como «CUMPLE» calculado.
- Para el garaje y los trasteros vinculados a las viviendas, el criterio prudente es no aplicar la excepción si hay cualquier uso distinto de vivienda. Debe ir rotulado como criterio.
- La excepción tiene una segunda condición, «siempre que estas no afecten al ambiente exterior», que el DB no define. Si se aplica, citarla entera.

---

## Bloque B — Ahorro de agua: retorno de ACS y contabilización

Estructura del ap. 2.3, «Ahorro de agua»:
- pto 1: contabilización;
- pto 2: retorno de ACS;
- pto 3: dispositivos de ahorro en zonas de pública concurrencia.

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| B1 | Retorno de ACS obligatorio si la ida al punto más alejado mide ≥ 15 m: ¿2.3 pto 2 o 3.2.2.1? | VERIFICADO, **en los dos apartados** | ≥ 15 m («igual o mayor») | Exigencia: ap. 2.3 **pto 2**: «En las redes de ACS debe disponerse una red de retorno cuando la longitud de la tubería de ida al punto de consumo más alejado sea igual o mayor que 15 m.» Diseño: ap. 3.2.2.1 **pto 3**: «Tanto en instalaciones individuales como en instalaciones de producción centralizada, la red de distribución debe estar dotada de una red de retorno cuando la longitud de la tubería de ida al punto de consumo más alejado sea igual o mayor que 15 m.» | [N22] [CYII] |
| B1b | ¿Desde dónde se mide la ida? | **NO LOCALIZADO** → **CRITERIO** | Desde la salida del generador o acumulador. Es coherente con 4.4.2 pto 1, que habla de «desde la salida del acumulador o intercambiador» | ap. 2.3 pto 2; 4.4.2 pto 1 | [N22] |
| B1c | Dimensionado del retorno | VERIFICADO | Caída de temperatura ≤ 3 °C hasta el grifo más alejado. Recirculación ≥ 250 l/h por columna. Retorno ≥ 10 % del agua de alimentación. Ø interior mínimo del retorno: 16 mm. Tabla 4.4: ½" → 140; ¾" → 300; 1" → 600; 1¼" → 1.100; 1½" → 1.800; 2" → 3.300 l/h | ap. 4.4.2 ptos 1, 2 y 3 a) y b); Tabla 4.4 «Relación entre diámetro de tubería y caudal recirculado de ACS». Ida: ap. 4.4.1 («el mismo método de cálculo que para redes de agua fría») | [N22] (sola) |
| B2 | Contador de AF y de ACS por cada unidad de consumo individualizable (ap. 2.3 pto 1) | VERIFICADO | — | ap. 2.3 **pto 1**: «Debe disponerse un sistema de contabilización tanto de agua fría como de agua caliente para cada unidad de consumo individualizable.» | [N22] [CYII] |
| B2b | Con ACS individual, ¿hace falta un contador de ACS aparte? | **NO LOCALIZADO** → **CRITERIO** | Con producción individual, el contador de AF de la unidad mide también el agua que se calienta. El contador de ACS por unidad solo hace falta con producción centralizada | ap. 2.3 pto 1 | [N22] |
| B3 | Contador general frente a batería: ¿dónde lo describe el DB? | VERIFICADO (dos esquemas) | a) **Red con contador general único**: acometida; instalación general con armario o arqueta del contador general, tubo de alimentación y distribuidor principal; derivaciones colectivas. b) **Red con contadores aislados**: acometida; instalación general con los contadores aislados; instalaciones particulares; derivaciones colectivas | ap. 3.1 pto 1 a) y b) | [N22] |
| B3b | Contadores divisionarios: condiciones | VERIFICADO | En zonas de uso común, de fácil y libre acceso. Preinstalación para lectura a distancia. Llave de corte antes de cada contador y válvula de retención después | ap. 3.2.1.2.7 ptos 1 a 3: «Los contadores divisionarios deben situarse en zonas de uso común del edificio, de fácil y libre acceso.» / «Contarán con pre-instalación adecuada para una conexión de envío de señales para lectura a distancia del contador.» / «Antes de cada contador divisionario se dispondrá una llave de corte. Después de cada contador se dispondrá una válvula de retención.» | [N22] [CYII] |
| B3c | «Batería de contadores» como elemento regulado | **NO LOCALIZADO** como apartado propio | El término solo sale dos veces, y en ninguna se dan condiciones de la batería (ver nota B3c) | Apéndice A; ap. 7.3 pto 4 | [N22] |
| B3d | «En armario o cámara» | VERIFICADO, pero solo para el **contador general** y los **contadores aislados** | Ver nota B3d | ap. 4.1 pto 1; 3.2.1.2.3; 5.1.2.1; 5.1.2.2 | [N22] |
| B3e | «En planta baja» | **NO LOCALIZADO** | El DB no exige la planta baja. Solo pide zona de uso común, de fácil y libre acceso (3.2.1.2.7 pto 1). La llave de corte general va «dentro de la propiedad, en una zona de uso común, accesible para su manipulación» (3.2.1.2.1 pto 1). Poner la batería en PB suele venir de las normas de la entidad suministradora: **no citarlo como CTE** | ap. 3.2.1.2.1 pto 1; 3.2.1.2.7 pto 1 | [N22] |
| B4 | ¿El local sin uso necesita contador, o es criterio de proyecto dejarlo previsto? | **NO LOCALIZADO** (el DB no regula el local sin actividad) → **CRITERIO** | Ver nota B4 | ap. 2.3 pto 1; Tabla 4.3; ap. 7.1 ptos 1 y 2 | [N22] |
| B5 | Dispositivos de ahorro en zonas de pública concurrencia | VERIFICADO (el texto). **NO LOCALIZADO** si los aseos de oficinas lo son | Grifos de lavabos y cisternas con dispositivos de ahorro. HS 4 no define «zonas de pública concurrencia». Criterio prudente: aplicarlo a los núcleos de aseos de oficinas con acceso de público | ap. 2.3 **pto 3**: «En las zonas de pública concurrencia de los edificios, los grifos de los lavabos y las cisternas deben estar dotados de dispositivos de ahorro de agua.» | [N22] [CYII] |

**Nota B3c — dónde aparece «batería».**
- Apéndice A, definición de contadores divisionarios: «Aparatos que miden los consumos particulares de cada abonado y el de cada servicio que así lo requiera en el edificio. En general se instalarán sobre las baterías.»
- Ap. 7.3 pto 4: «En caso de contabilización del consumo mediante batería de contadores, las montantes hasta cada derivación particular se considerará que forman parte de la instalación general, a efectos de conservación y mantenimiento puesto que discurren por zonas comunes del edificio».

**Nota B3d — armario, cámara o arqueta.**
- **Reserva de espacio (4.1 pto 1):** «En los edificios dotados con contador general único se preverá un espacio para un armario o una cámara para alojar el contador general de las dimensiones indicadas en la tabla 4.1.»
- **Contenido del armario o arqueta del contador general (3.2.1.2.3 pto 1)**, en este orden: «la llave de corte general, un filtro de la instalación general, el contador, una llave, grifo o racor de prueba, una válvula de retención y una llave de salida». Instalado «en un plano paralelo al del suelo».
- **Ejecución del alojamiento (5.1.2.1):**
  - impermeabilizado;
  - desagüe con sumidero sifónico, a la red de saneamiento o, si esta no es capaz, a la red pública;
  - preinstalación para lectura a distancia;
  - puertas con cerradura y ventilación.
- **Contadores individuales aislados (5.1.2.2):** «Se alojarán en cámara, arqueta o armario», con desagüe.

**Nota B4 — local sin uso.**
- El ap. 2.3 pto 1 obliga por «unidad de consumo individualizable», pero no dice si un local sin actividad debe tener el contador ya instalado.
- Apoyos para el criterio:
  - La Tabla 4.3 incluye «local comercial» en la «Alimentación a derivación particular», con Ø ≥ 20 mm.
  - El ap. 7.1 pto 1 dice: «En las instalaciones de agua de consumo humano que no se pongan en servicio después de 4 semanas de su terminación, o aquellas que permanezcan fuera de servicio más de 6 meses, se cerrará su conexión y se procederá a su vaciado.»
  - El ap. 7.1 pto 2 dice que las acometidas no usadas se cierran y que, si pasa un año sin usarlas, se taponan.
- Redacción propuesta para la ficha: «Se reserva posición en la batería y una derivación particular (Ø ≥ 20 mm, Tabla 4.3) hasta el local, con llave de corte, cerrada y vacía hasta la implantación de la actividad (criterio de proyecto; DB-HS 4 ap. 2.3 pto 1 y ap. 7.1). El contador se instalará con el alta del suministro.»
- Los caudales del local no se suman al dimensionado, salvo que el proyectista lo decida como reserva. En ese caso, etiquetarlo como criterio.

---

## Bloque C — Dimensionado (ap. 4.2, 4.3 y Tabla 2.1)

Procedimiento literal de 4.2.1 pto 2 [N22] [CYII] [Acc]:
- a) «el caudal máximo de cada tramo será igual a la suma de los caudales de los puntos de consumo alimentados por el mismo» (Tabla 2.1);
- b) «establecimiento de los coeficientes de simultaneidad de cada tramo de acuerdo con un criterio adecuado»;
- c) «determinación del caudal de cálculo en cada tramo como producto del caudal máximo por el coeficiente de simultaneidad correspondiente»;
- d) velocidad de cálculo (ver C1);
- e) «Obtención del diámetro correspondiente a cada tramo en función del caudal y de la velocidad».

El circuito de cálculo es el más desfavorable: «aquel que cuente con la mayor pérdida de presión debida tanto al rozamiento como a su altura geométrica» (4.2.1 pto 1).

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| C1 | Velocidades: metálicas 0,50–2,00 m/s; termoplásticas y multicapas 0,50–3,50 m/s. ¿Es 4.2.1 pto 1 d)? | VERIFICADO (valores). **CORREGIR** la cita: es el **pto 2 d)**. El repo dice «ap. 4.2 d)» | 0,50–2,00 / 0,50–3,50 m/s | ap. 4.2.1 **pto 2 d)**: «elección de una velocidad de cálculo comprendida dentro de los intervalos siguientes: tuberías metálicas: entre 0,50 y 2,00 m/s; tuberías termoplásticas y multicapas: entre 0,50 y 3,50 m/s» | [N22] [CYII] [Acc] |
| C1b | Es un criterio de dimensionado, no una exigencia de cumplimiento; la UI nunca dirá «no cumple» | VERIFICADO, **con un matiz de rótulo** | Es un paso del **procedimiento** de dimensionado (4.2.1 pto 2), no una de las exigencias del ap. 2. Salirse del intervalo **no** es «NO CUMPLE». Pero el intervalo es **texto del DB**: no hay que rotularlo «buena práctica, no exigencia CTE», como hacen hoy `calc.ts` y `ficha.ts`. Rótulo propuesto: «fuera del intervalo de cálculo del DB-HS 4 (4.2.1 pto 2 d)», veredicto «criterio» | ap. 4.2.1 pto 2 (encabezado: «El dimensionado de los tramos se hará de acuerdo al procedimiento siguiente») | [N22] |
| C2 | El DB no da fórmula de simultaneidad | VERIFICADO | Solo exige «un criterio adecuado» | ap. 4.2.1 **pto 2 b)** (literal arriba) | [N22] [CYII] [Acc] |
| C2b | K = 1/√(n−1) «es de UNE 149201» (repo e IDR §3) | **NO VERIFICADO, y probablemente incorrecto** | Ver nota C2b | — | [UNEsec]. UNE 149201 no leída |
| C2c | Coeficiente de edificio de UNE 149201: Qc = A·(Qt)^B + C | **Criterio externo, NO VERIFICADO** | Ver nota C2c. No mostrar ni codificar sin leer la norma | — | [UNEsec] |
| C2d | Coeficiente entre viviendas K_v = (19 + N) / (10·(N + 1)) | **Criterio externo de origen NO VERIFICADO** | Ver nota C2d | — | [UNEsec] |
| C3 | La Tabla 2.1 no distingue uso privado y público (a diferencia del HS 5) | VERIFICADO | Una sola pareja de columnas por aparato: «Caudal instantáneo mínimo de agua fría [dm³/s]» y «… de ACS [dm³/s]». Los valores para oficinas, en nota C3 | ap. 2.1.3 pto 1, Tabla 2.1 «Caudal instantáneo mínimo para cada tipo de aparato» | [N22] [CYII] [Acc] |
| C3b | Tabla 2.1 del repo (`CAUDAL_INSTANTANEO_TABLA_2_1`) | VERIFICADO: coinciden las 20 filas | Incluye las correcciones del §0: Lavamanos 0,05 / 0,03 y Fregadero no doméstico 0,30 / 0,20 | Tabla 2.1 | [N22] [CYII] |
| C4 | Ø mínimos de alimentación de la Tabla 4.3, frente a `ALIMENTACION_TABLA_4_3` | VERIFICADO: coinciden las 8 filas. **CORREGIR** la cita y una etiqueta | Ver nota C4 | ap. 4.3 **pto 2**: «Los diámetros de los diferentes tramos de la red de suministro se dimensionarán conforme al procedimiento establecido en el apartado 4.2, adoptándose como mínimo los valores de la tabla 4.3». Tabla 4.3 «Diámetros mínimos de alimentación» | [N22] [CYII] |
| C4b | ¿Se puede dar CUMPLE / NO CUMPLE con la Tabla 4.3? | VERIFICADO | Sí: es un **mínimo** («adoptándose como mínimo»). A diferencia de la velocidad, aquí sí cabe «NO CUMPLE» | ap. 4.3 pto 2 | [N22] |
| C4c | Tramos de oficinas en la Tabla 4.3 | **NO LOCALIZADO** → **CRITERIO** | La tabla solo nombra «cuarto húmedo **privado**» y «derivación particular: vivienda, apartamento, local comercial». Un núcleo de aseos de oficinas (no privado) o una planta de oficinas se asimilan por criterio a esas filas (20 mm) | Tabla 4.3 | [N22] |
| C4d | ¿El Ø «cobre o plástico (mm)» es exterior o interior? | **NO LOCALIZADO** (el DB no lo dice) → **CRITERIO** | Es relevante en multicapa y PEX: por ejemplo, 20 × 2 tiene 16 mm de Ø interior. Propuesta: comparar el Ø nominal del catálogo con la tabla y declararlo | Tablas 4.2 y 4.3, cabecera | [N22] |
| C5 | Pérdida en el contador: ¿la fija el DB? (la maqueta resta «contador y llaves −9 kPa») | **NO LOCALIZADO** → supuesto de predimensionado | El DB no da ningún valor (ver nota C5) | ap. 4.5.1: «El calibre nominal de los distintos tipos de contadores se adecuará, tanto en agua fría como caliente, a los caudales nominales y máximos de la instalación.» | [N22] |
| C6 | (repo) «Pérdidas localizadas del 20–30 % de las longitudinales: NO es cifra del DB, es buena práctica» | **CORREGIR** | **Es texto del DB**, como opción admitida de estimación | ap. 4.2.2 **pto 1 a)**: «determinar la pérdida de presión del circuito sumando las pérdidas de presión total de cada tramo. Las perdidas de carga localizadas podrán estimarse en un 20% al 30% de la producida sobre la longitud real del tramo o evaluarse a partir de los elementos de la instalación.» | [N22] [CYII] [Acc] |

**Nota C2b — de dónde sale K = 1/√(n−1).** Ninguna de las fuentes secundarias atribuye esta fórmula a UNE 149201:
- Describen UNE 149201 (ediciones de 2008 y 2017) con una expresión **Qc = A·(Qt)^B + C**, cuyos A, B y C dependen del uso del edificio y de Qt.
- Según proinstalaciones (2018), la edición de 2017 la presenta con ábacos y tablas.
- La ayuda de TK-HS4 separa dos métodos: «[Ks] Simultaneidad UNE 149201:2017» (Qs = A·Qt^B + C) y «[Ka] Número de aparatos: Ka = 1/√(n−1)», este último con un término α según el uso.
- 1/√(n−1) es el método tradicional. **No hay que citar UNE 149201 como su origen** mientras no se lea la norma.
- Esto corrige lo que dicen el §0 y el §3 del IDR y `tablas.ts`, líneas 22–24 y 333–370.

**Nota C2c — lo que dicen las fuentes secundarias sobre UNE 149201 (sin verificar).**
- Viviendas con Qt ≤ 20 l/s y todos los aparatos por debajo de 0,5 l/s: Qc = 0,682·Qt^0,45 − 0,14.
- Viviendas con Qt > 20 l/s: Qc = 1,7·Qt^0,21 − 0,7.
- Otra fuente da Qc = 0,4·Qt^0,54 + 0,48 para la acometida, sin precisar el uso.
- Una fuente dice que, con UNE 149201, los caudales de todas las viviendas se suman **sin** coeficiente entre viviendas y la fórmula se aplica al total.

**Nota C2d — K_v = (19 + N) / (10·(N + 1)).**
- Aparece en proyectos académicos para N viviendas.
- No es CTE, y según las fuentes secundarias no es de UNE 149201.
- Una fuente avisa de que se ha escrito por error (N − 1) en lugar de (N + 1).

**Nota C2 — redacción y riesgo de doble simultaneidad.**
- Redacción correcta para la ficha: «Coeficiente de simultaneidad: criterio de proyecto. El DB-HS 4 (ap. 4.2.1 pto 2 b) exige "un criterio adecuado" y no fija fórmula. Se adopta K = 1/√(n−1) (método tradicional; no es exigencia CTE).»
- Si la UI ofrece una opción «UNE 149201», tiene que implementar Qc = A·Qt^B + C con los coeficientes leídos en la norma.
- Riesgo de doble simultaneidad: no combinar 1/√(n−1) sobre todos los aparatos del edificio con un K entre viviendas, ni con la fórmula de edificio. Hay que elegir un esquema por tramo:
  - K por vivienda en las derivaciones;
  - en los montantes y el distribuidor, el criterio de edificio.

**Nota C3 — Tabla 2.1 para oficinas** (AF / ACS, en dm³/s; las etiquetas son literales):
- Lavamanos 0,05 / 0,03.
- Lavabo 0,10 / 0,065.
- Inodoro con cisterna 0,10 / —.
- Inodoro con fluxor 1,25 / —.
- Urinarios con grifo temporizado 0,15 / —.
- Urinarios con cisterna (c/u) 0,04 / —.
- Vertedero 0,20 / —.
- Fregadero no doméstico 0,30 / 0,20.

Consecuencias para la pantalla:
- **Inodoro con fluxor:** exige 150 kPa (2.1.3 pto 2 b) y una derivación de Ø 25–40 mm (Tabla 4.2). Un núcleo de aseos con fluxores cambia la presión crítica y el Ø.
- **ACS en los aseos de oficinas:** el DB no obliga a ponerla. La columna de ACS solo se usa si el proyecto la prevé (criterio).
- **Garaje:** la Tabla 2.1 tiene la fila «Grifo garaje», 0,20 / —. HS 4 no exige un punto de agua en el garaje: si se pone, es criterio.

**Nota C4 — Tabla 4.3: el repo y el DB, fila a fila.** La primera columna es la etiqueta literal del DB; los valores van en Ø acero (pulgadas) / Ø cobre o plástico (mm).

| Fila del DB | DB | Repo |
|---|---|---|
| Alimentación a cuarto húmedo privado: baño, aseo, cocina. | ¾ / 20 | ¾ / 20 |
| Alimentación a derivación particular: vivienda, apartamento, local comercial | ¾ / 20 | ¾ / 20 |
| Columna (montante o descendente) | ¾ / 20 | ¾ / 20 |
| Distribuidor principal | 1 / 25 | 1 / 25 |
| Alimentación equipos de climatización < 50 kW | ½ / 12 | ½ / 12 |
| Ídem 50–250 kW | ¾ / 20 | ¾ / 20 |
| Ídem 250–500 kW | 1 / 25 | 1 / 25 |
| Ídem > 500 kW | 1¼ / 32 | 1¼ / 32 |

Dos correcciones:
- **Etiqueta:** el repo pone «Derivación particular (vivienda/apartamento/local)». El DB dice «local **comercial**».
- **Cita:** el repo pone «ap. 4.3». Debe ser «ap. 4.3 pto 2».

**Nota C5 — el «−9 kPa» del contador.**
- El DB no da ningún valor para la pérdida del contador.
- El ap. 4.2.2 pto 1 a) permite estimar las pérdidas localizadas en un 20–30 % de las longitudinales «o evaluarse a partir de los elementos de la instalación».
- El «−9 kPa» es por tanto un **supuesto de predimensionado** (dato del fabricante, según calibre y caudal).
- Si además se aplica el 20–30 % al tramo que contiene el contador y las llaves, hay doble cómputo. Va del lado de la seguridad, pero hay que declararlo.

---

## Bloque D — Control de la presión: grupo de presión y reductoras

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| D1 | ¿Cuándo es necesario el grupo? ¿«3.2.1.5: cuando la presión de la red no sea suficiente»? | **CORREGIR** la cita | La necesidad se establece en **4.2.2 pto 1 b)**. El 3.2.1.5 no dice cuándo: describe cómo es el sistema | ap. 4.2.2 pto 1 b): «En el caso de que la presión disponible en el punto de consumo fuera inferior a la presión mínima exigida sería necesaria la instalación de un grupo de presión.» El pto 1 manda comprobar que la presión disponible en el punto más desfavorable supera los mínimos de 2.1.3 y que no se supera el máximo en ningún punto | [N22] [Acc] |
| D2 | Diseño del sistema de sobreelevación | VERIFICADO | Ver nota D2 | ap. 3.2.1.5.1 ptos 1, 2 a) y b), y 3 | [N22] (pto 2 b) literal; ptos 1 y 3 resumidos por la herramienta) |
| D3 | ¿Dónde va el grupo? | VERIFICADO (el local). **NO LOCALIZADO** (la posición en el esquema) | Local de uso exclusivo, que puede compartir con el tratamiento de agua. Posición en la red y doble distribuidor, en nota D3 | ap. 3.2.1.5.1 pto 3; ap. 5.1.3.2 | [N22] (resumido por la herramienta) |
| D4 | Qué dice 4.5.2 de las presiones mínima y máxima del grupo | VERIFICADO | **Mínima o de arranque:** Pb = Ha + Hg + Pc + Pr. **Máxima (grupo convencional):** «entre 2 y 3 bar por encima del valor de la presión mínima». **Caudal variable:** presión constante. Resto del 4.5.2, en nota D4 | ap. 4.5.2.2 pto 4: «La presión mínima o de arranque (Pb) será el resultado de sumar la altura geométrica de aspiración (Ha), la altura geométrica (Hg), la pérdida de carga del circuito (Pc) y la presión residual en el grifo, llave o fluxor (Pr).» ap. 4.5.2.3 pto 1: «Este valor estará comprendido entre 2 y 3 bar por encima del valor de la presión mínima.» ap. 4.5.2.2 pto 1: «…siempre que no se instalen bombas de caudal variable. En este segundo caso la presión será función del caudal solicitado en cada momento y siempre constante.» | [N22] (sola) |
| D5 | ¿Se puede decir «con un grupo que dé X kPa a la salida» sin dimensionarlo? | **NO LOCALIZADO** (el DB ni lo admite ni lo prohíbe) → **CRITERIO** | Sí, como **supuesto declarado**. Mejor aún, calcular la Pb que exige el DB (ver nota D5) | ap. 4.2.2 pto 1 b); 4.5.2.2 pto 4; 4.5.2.3 pto 1; 3.2.1.5.2 pto 1 | [N22] |
| D6 | Reductoras: obligatorias si se superan 500 kPa en algún punto. ¿3.2.1.6 o 4.5.3? | VERIFICADO (la condición). **CORREGIR** la cita y el término | Obligación en **3.2.1.5.2** (el 3.2.1.6 es el tratamiento de agua). El DB las llama «válvulas limitadoras de presión» en 3.2.1.5.2 y «reductor de presión» en 4.5.3 y 5.1.3.3. Dimensionado y montaje, en nota D6 | ap. 3.2.1.5.2 pto 1: «Deben instalarse válvulas limitadoras de presión en el ramal o derivación pertinente» para no superar la presión de servicio máxima de 2.1.3 (500 kPa, pto 3). Pto 2: también cuando se prevean incrementos significativos de la presión de red | [N22] (pto 1, literal parcial; pto 2, resumido) |

**Nota D2 — diseño del sistema de sobreelevación (3.2.1.5.1).**
- **Pto 1:** el sistema debe permitir abastecer con presión de red, sin poner en marcha el grupo, las zonas del edificio que se puedan alimentar así.
- **Pto 2 a), grupo convencional:**
  - depósito auxiliar de alimentación;
  - al menos dos bombas iguales, en paralelo y de funcionamiento alterno;
  - depósitos de presión con membrana.
- **Pto 2 b)**, literal: «de accionamiento regulable, también llamados de caudal variable, que podrá prescindir del depósito auxiliar de alimentación y contará con un variador de frecuencia que accionará las bombas manteniendo constante la presión de salida, independientemente del caudal solicitado o disponible».
- **Pto 3:** el grupo va en un local de uso exclusivo, que puede albergar también el tratamiento de agua, con dimensiones suficientes para el mantenimiento.

**Nota D3 — posición del grupo en la red.**
- El DB no dice expresamente en qué punto del esquema va el grupo.
- El 5.1.3.2 describe un by-pass «uniendo tubo de alimentación con tubo de salida hacia la red interior», de donde se deduce que va en el tubo de alimentación (instalación general).
- El mismo apartado prevé un doble distribuidor principal, «para servir plantas con presión de red y plantas con grupo», o uno solo con una válvula de tres vías.
- En los grupos de accionamiento regulable el by-pass no es obligatorio, aunque es aconsejable.

**Nota D4 — resto del 4.5.2.**
- Nº de bombas, sin contar las de reserva: 2 hasta 10 dm³/s; 3 hasta 30 dm³/s; 4 para más de 30 dm³/s (4.5.2.2 pto 2).
- Caudal de las bombas = máximo simultáneo (4.5.2.2 pto 3).
- Depósito auxiliar: V = Q · t · 60, con t de 15 a 20 min (4.5.2.1 pto 1). Se puede estimar con UNE 100030:2017 (pto 2).
- Depósito de presión: Vn = Pb × Va / Pa, con presiones absolutas (4.5.2.3 pto 2).

**Nota D5 — cómo dar la presión del grupo sin dimensionarlo.**
- La Pb del DB (4.5.2.2 pto 4) sale casi entera del modelo de edificio:
  - Hg, por cotas;
  - Pc, por el cálculo de la red;
  - Pr = 100 o 150 kPa, enlazando con 2.1.3 pto 2 (esa conexión es criterio);
  - Ha solo cuenta si se aspira desde un depósito.
- Redacción propuesta: «Grupo de presión necesario (DB-HS 4, 4.2.2 pto 1 b). Presión mínima de arranque necesaria Pb = Ha + Hg + Pc + Pr = N kPa (4.5.2.2 pto 4). Consigna adoptada: X kPa (supuesto de proyecto; dimensionado del grupo según 4.5.2, pendiente).»
- Comprobaciones que el supuesto obliga a hacer:
  - X ≥ Pb.
  - Que el punto más bajo servido por el grupo no supere 500 kPa (2.1.3 pto 3). En un grupo convencional hay que hacerlo con la presión de **parada** (X + 200 a 300 kPa, 4.5.2.3 pto 1). Si se supera, hacen falta limitadoras (3.2.1.5.2 pto 1).
  - Que las plantas que se pueden abastecer con presión de red no dependan del grupo (3.2.1.5.1 pto 1).
- Unidades: el DB usa kPa en 2.1.3 y bar en 4.5.2.3 (1 bar = 100 kPa).

**Nota D6 — dimensionado y montaje de la reductora.**
- **Dimensionado (4.5.3):** con la Tabla 4.5, en función del caudal máximo simultáneo. Literal, tras la tabla: «Nunca se calcularán en función del diámetro nominal de las tuberías.»
- **Montaje (5.1.3.3):**
  - reducción centralizada si hay baterías mezcladoras (pto 1);
  - tramo de retardo de al menos 5 veces el Ø interior (pto 3);
  - válvula de seguridad, con la salida del reductor tarada al menos un 20 % por debajo de su presión de reacción (pto 4);
  - by-pass, si lo hay, también con reductor (pto 5).

---

## Bloque E — Edición vigente del HS 4

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| E1 | El HS 4 es la «versión 2009, no modificada» (repo, IDR §3, encargo) | **CORREGIR** | El RD 450/2022 sí modificó el HS 4, aunque ningún valor de cálculo (ver nota E1) | RD 450/2022, anexo, modificaciones del DB-HS | [RD450] [FOM588] [RD732] |
| E1b | ¿Cambió algún valor de cálculo? | VERIFICADO que no, en lo cotejado | Iguales en [CYII] (anterior a 2022) y [N22] (2022): 2.1.3 ptos 1–4, 2.3 ptos 1–3, 3.2.1.2.7, 3.2.2.1 pto 3, 4.2.1 pto 2, 4.2.2 pto 1 a), Tabla 2.1 y Tabla 4.3. **No cotejadas** con la versión anterior: Tablas 4.1, 4.2, 4.4 y 4.5, y 4.5.2 | — | [CYII] [N22] |
| E1c | Además, las referencias UNE se actualizaron entre 2009 y 2022 | VERIFICADO el hecho. **NO LOCALIZADA** la disposición | 4.5.2.1 pto 2 cita «UNE 100 030:1994» en [CYII] y «UNE 100030:2017» en [N22]. Antes del RD 450/2022, el 6.2 ya citaba normas de 2013. Según el BOE, no fueron ni FOM/588/2017 ni RD 732/2019 | — | [CYII] [N22] [RD450] [FOM588] [RD732] |
| E2 | `PROC_HS4`: `edicion: "2009"`, `fecha: "2009-04-23"` | **CORREGIR** | 2009-04-23 es la fecha del BOE de VIV/984/2009. El texto vigente es el consolidado de 14-06-2022 (RD 450/2022, BOE 15-06-2022) | — | [RD450] |
| E3 | Cómo citar en la ficha | **CRITERIO** (mismo patrón que HS 5) | «CTE DB-HS, Sección HS 4, texto consolidado de 14-06-2022 (última modificación: RD 450/2022). Valores de cálculo sin cambios desde la versión de 2009» | — | — |

**Nota E1 — qué cambió el RD 450/2022 en el HS 4.**
- **3.2.2.1 pto 2:** «la contribución mínima de energía solar para la producción de agua caliente sanitaria» pasa a ser «la contribución mínima de energía renovable para cubrir la demanda de agua caliente sanitaria».
- **6.2:** las referencias del PVC-C pasan a UNE-EN ISO 15877, y «polibutileno (PB)» pasa a «polibuteno (PB)».
- **Apéndice C:** las mismas actualizaciones de referencias.
- No tocó ningún valor de cálculo. La versión con marcas que leyó la verificación de HS 5 ([DcmHS] en `verificacion-hs5-pluviales.md`) señalaba precisamente 3.2.2.1 pto 2, 6.2 y el Apéndice C.

---

## Bloque F — Hallazgos adicionales

| # | Afirmación (repo) | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| F1 | «Grupo de presión NECESARIO (ap. 4.5)» (`calc.ts:929`, `ficha.ts:296-307`, `ui.tsx:647/716`, `svg.tsx:92`) | **CORREGIR** la cita | La necesidad: **4.2.2 pto 1 b)**. El 4.5.2 es el dimensionado del grupo | ap. 4.2.2 pto 1 b) | [N22] [Acc] |
| F2 | Tomas de agua caliente para lavadora y lavavajillas (equipos bitérmicos) | VERIFICADO (texto vigente) | En los edificios donde se aplique HE 4: «deben disponerse, además de las tomas de agua fría, previstas para la conexión de la lavadora y el lavavajillas, sendas tomas de agua caliente para permitir la instalación de equipos bitérmicos» | ap. 3.2.2.1 pto 2, en la redacción del RD 450/2022 («energía renovable para cubrir la demanda de agua caliente sanitaria») | [N22] [RD450] |
| F3 | Mantenimiento: el HS 4 remite al RD 865/2003 (legionelosis) | AVISO | El RD 865/2003 lo derogó el RD 487/2022 (BOE 22-06-2022; en vigor desde el 02-01-2023). Si la ficha cita el 7.3 pto 1, no presentar el RD 865/2003 como vigente | ap. 7.3 pto 1 | [N22]; búsqueda en boe.es (`BOE-A-2022-10297`) |
| F4 | Tabla 4.2 (`DERIVACIONES_TABLA_4_2`) | VERIFICADO (valores en mm), con dos etiquetas de acero | Coinciden los Ø en mm, incluida «Bañera <1,40 m» = 20 mm. Etiquetas de acero: inodoro con fluxor «1 - 1½» (el repo pone «1»); lavavajillas doméstico «½ (rosca a ¾)». La Tabla 4.2 llama «Fregadero industrial» a lo que la Tabla 2.1 llama «Fregadero no doméstico». Cita: ap. 4.3 **pto 1** | ap. 4.3 pto 1, Tabla 4.2 «Diámetros mínimos de derivaciones a los aparatos» | [N22] [Acc] |
| F5 | `SIMULTANEIDAD_K.textoCTE`: «…coeficiente de simultaneidad de acuerdo con un criterio adecuado.» | **CORREGIR** (literal) | Literal: «establecimiento de los coeficientes de simultaneidad de cada tramo de acuerdo con un criterio adecuado» | ap. 4.2.1 pto 2 b) | [N22] [CYII] [Acc] |
| F6 | `red.ts:13`: «contadores en BATERÍA en la planta baja» | Correcto **como CRITERIO** | El DB solo exige zona de uso común, de fácil y libre acceso (B3e). Las «unidades de consumo por planta de oficinas» también son criterio (2.3 pto 1 habla de unidad «individualizable») | ap. 3.2.1.2.7 pto 1 | [N22] |

---

## Cifras que SÍ se pueden mostrar en la UI, con su cita

Todas las citas son del DB-HS, Sección HS 4, consolidado de 14-06-2022.

- **Presión mínima:** 100 kPa en grifos comunes y 150 kPa en fluxores y calentadores (ap. 2.1.3 pto 2). Qué es un calentador, por criterio (A3).
- **Presión máxima:** 500 kPa en cualquier punto de consumo (ap. 2.1.3 pto 3).
- **Temperatura del ACS:** 50–65 °C en los puntos de consumo (ap. 2.1.3 pto 4).
  - En este edificio, con oficinas y local, **sin** la excepción de vivienda.
  - Mostrarla como condición de diseño, no como resultado calculado.
- **Retorno de ACS:** obligatorio si la ida al punto más alejado es ≥ 15 m (ap. 2.3 pto 2; 3.2.2.1 pto 3).
  - Dimensionado: 3 °C, 250 l/h por columna, 10 %, Ø interior ≥ 16 mm y Tabla 4.4 (ap. 4.4.2). Confianza media: solo [N22].
- **Contabilización:** contador de AF y de ACS por unidad de consumo individualizable (ap. 2.3 pto 1).
- **Contadores divisionarios:** en zona de uso común, de fácil y libre acceso; lectura a distancia; llave de corte antes y válvula de retención después (ap. 3.2.1.2.7).
- **Esquemas de la instalación:** contador general único o contadores aislados (ap. 3.1 pto 1).
- **Tabla 2.1 completa,** sin distinción privado/público.
- **Tabla 4.3** (Ø mínimos de alimentación), como **mínimo** que admite CUMPLE / NO CUMPLE (ap. 4.3 pto 2). Para las oficinas, la asimilación de filas va rotulada como criterio.
- **Tabla 4.2** (Ø mínimos de las derivaciones; ap. 4.3 pto 1).
- **Velocidades:** 0,50–2,00 m/s en tuberías metálicas y 0,50–3,50 m/s en termoplásticas y multicapas (ap. 4.2.1 pto 2 d).
  - Rótulo: «intervalo de cálculo del DB»; si se sale, veredicto «criterio».
  - **Nunca «no cumple»**, y tampoco «buena práctica, no CTE».
- **Pérdidas localizadas:** del 20 al 30 % de las longitudinales, como **opción del DB** (ap. 4.2.2 pto 1 a).
- **Necesidad de grupo de presión:** si la presión disponible en el punto más desfavorable no llega al mínimo (ap. 4.2.2 pto 1 b).
- **Fórmula de la presión de arranque:** Pb = Ha + Hg + Pc + Pr (ap. 4.5.2.2 pto 4). Presión de parada: Pb + 2 a 3 bar en grupos convencionales (ap. 4.5.2.3 pto 1). Confianza media: solo [N22].
- **Diseño del grupo:** las zonas que se pueden alimentar con presión de red no dependen del grupo, y el grupo va en un local de uso exclusivo (ap. 3.2.1.5.1 ptos 1 y 3).
- **Limitadoras de presión:** obligatorias donde se superarían los 500 kPa (ap. 3.2.1.5.2 pto 1).
- **Local sin uso:** «previsión cerrada y vacía» como **criterio**, apoyado en ap. 2.3 pto 1, Tabla 4.3 y ap. 7.1.
- **Tomas de ACS para lavadora y lavavajillas** en viviendas, si aplica HE 4 (ap. 3.2.2.1 pto 2).

## Cifras que NO deben mostrarse todavía

- **«K = 1/√(n−1) (UNE 149201)».** La atribución no está verificada y las fuentes secundarias la contradicen. Mostrar «K = 1/√(n−1), criterio de proyecto (método tradicional), no exigencia CTE».
- **Cualquier fórmula Qc = A·Qt^B + C, o K_v = (19 + N) / (10·(N + 1)), atribuida a una norma.** Primero hay que leer UNE 149201.
- **«Contador y llaves −9 kPa» como valor del DB.** Solo como «supuesto de predimensionado».
- **«Batería en planta baja» como exigencia del CTE.**
- **La excepción de temperatura de vivienda aplicada a este edificio** (tiene oficinas y local).
- **«Velocidad: NO CUMPLE».** Tampoco «buena práctica, no exigencia CTE»: es texto del DB.
- **«Pérdidas localizadas: buena práctica, no cifra del DB».** Lo es.
- **«Grupo de presión necesario (ap. 4.5)».** La cita correcta es 4.2.2 pto 1 b).
- **Tabla 4.5 (reductoras) y número de bombas (4.5.2.2 pto 2)** hasta cotejarlos con el PDF. La pantalla no los necesita para decir «hace falta reductora» o «hace falta grupo».
- **«HS 4, edición 2009 (no modificada)»** en la ficha.

---

## Procedencia sugerida para `shared/tablas`

| Tabla o regla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Caudales por aparato | DB-HS4 | Consolidado 14-06-2022 (valores de cálculo sin cambios desde 2009) | 2022-06-14 | ap. 2.1.3 pto 1 | Tabla 2.1 | codigotecnico.org · DBHS.pdf, Sección HS 4 |
| Presiones | ídem | ídem | 2022-06-14 | ap. 2.1.3 ptos 2 y 3 | — | ídem |
| Temperatura del ACS | ídem | ídem | 2022-06-14 | ap. 2.1.3 pto 4 | — | ídem |
| Ahorro de agua | ídem | ídem | 2022-06-14 | ap. 2.3 ptos 1 a 3 | — | ídem |
| Retorno de ACS | ídem | ídem | 2022-06-14 | ap. 2.3 pto 2; 3.2.2.1 pto 3; 4.4.2 | Tabla 4.4 | ídem |
| Contadores | ídem | ídem | 2022-06-14 | ap. 3.1 pto 1; 3.2.1.2.3; 3.2.1.2.7; 4.1 pto 1; 4.5.1; 5.1.2; 7.3 pto 4 | Tabla 4.1 | ídem |
| Velocidades | ídem | ídem | 2022-06-14 | ap. 4.2.1 pto 2 d) | — | ídem |
| Pérdidas localizadas | ídem | ídem | 2022-06-14 | ap. 4.2.2 pto 1 a) | — | ídem |
| Necesidad de grupo de presión | ídem | ídem | 2022-06-14 | ap. 4.2.2 pto 1 b) | — | ídem |
| Grupo de presión: diseño y cálculo | ídem | ídem | 2022-06-14 | ap. 3.2.1.5.1; 4.5.2; 5.1.3.1; 5.1.3.2 | — | ídem |
| Limitadoras y reductores de presión | ídem | ídem | 2022-06-14 | ap. 3.2.1.5.2; 4.5.3; 5.1.3.3 | Tabla 4.5 (cotejo pendiente) | ídem |
| Ø de las derivaciones | ídem | ídem | 2022-06-14 | ap. 4.3 pto 1 | Tabla 4.2 | ídem |
| Ø de la alimentación | ídem | ídem | 2022-06-14 | ap. 4.3 pto 2 | Tabla 4.3 | ídem |
| Interrupción del servicio | ídem | ídem | 2022-06-14 | ap. 7.1 ptos 1 y 2 | — | ídem |
| Coeficiente de simultaneidad | — (**no CTE**) | — | — | DB-HS 4 ap. 4.2.1 pto 2 b) solo exige «un criterio adecuado» | — | criterio de proyecto: método tradicional 1/√(n−1); atribución a UNE 149201 sin verificar |

## Pendientes

1. **Cotejo literal con el PDF oficial `DBHS.pdf` (14-06-2022).** Hace falta una herramienta de extracción (pdftotext o pdftoppm), porque en esta sesión no la había. Prioridad:
   - Tablas 4.2, 4.4 y 4.5;
   - 4.5.2.1 a 4.5.2.3;
   - 3.2.1.5.1 ptos 1 y 3, y 3.2.1.5.2 completo (aquí la herramienta solo devolvió resúmenes);
   - 5.1.3.1 y 5.1.3.2;
   - definiciones del Apéndice A.
   Lo cotejado en dos fuentes ([N22] + [CYII]) tiene confianza alta. Lo que solo está en [N22] queda en confianza media.
2. **Comentarios del Ministerio («DB-HS con comentarios»)** sobre:
   - «unidad de consumo individualizable» (2.3 pto 1) y el local sin actividad;
   - el alcance de la excepción de vivienda (2.1.3 pto 4);
   - «zonas de pública concurrencia» (2.3 pto 3).
3. **UNE 149201:2017** (de pago). Leerla antes de etiquetar nada como «UNE 149201» y antes de ofrecer la fórmula de edificio. Mientras tanto, corregir la atribución de 1/√(n−1) en el §0 y el §3 del IDR.
4. **BOE de 25/01/2008 y de VIV/984/2009,** para fechar la excepción de vivienda de 2.1.3 pto 4.
5. **Disposición que actualizó las referencias UNE del HS 4 entre 2009 y 2022** (E1c). Es el mismo pendiente que F1b de HS 5.
6. **Normas de la entidad suministradora** (ubicación de la batería, hueco del local). No son CTE: dato local del proyecto.
7. **Decisiones de criterio que debe validar el responsable del proyecto:**
   - 150 kPa a la entrada del calentador o caldera instantánea (A3);
   - que la excepción de temperatura no se aplique con usos mixtos (A2b);
   - la medición de la ida del ACS desde el generador (B1b);
   - el contador de ACS solo con producción central (B2b);
   - la previsión cerrada y vacía del local (B4);
   - los aseos de oficinas como pública concurrencia (B5);
   - la asimilación de oficinas en la Tabla 4.3 (C4c);
   - Ø nominal frente a interior en multicapa (C4d);
   - el «−9 kPa» del contador (C5);
   - la consigna X del grupo y su comprobación (D5);
   - el esquema de simultaneidad sin doble cómputo (nota C2).

---

## Para el código

Propuesta para `src/modules/hs4/tablas.ts`, siguiendo el patrón `tablaCTE(procedencia, datos)` de `src/lib/cte/tabla.ts`. **No está aplicada.**

**Qué cambia en las tablas que ya existen:**
- Se sustituye el `PROC_HS4` actual.
- Los cambios de cita y de naturaleza afectan a:
  - `PRESIONES`;
  - `TEMPERATURA_ACS`;
  - `VELOCIDADES_CALCULO`;
  - `CAUDAL_INSTANTANEO_TABLA_2_1`;
  - `DERIVACIONES_TABLA_4_2`;
  - `ALIMENTACION_TABLA_4_3`;
  - `PERDIDAS_LOCALIZADAS` (pasa de criterio externo a DB);
  - `SIMULTANEIDAD_K` (pierde la atribución a UNE 149201).
- Los criterios de proyecto van **aparte**, en un objeto que no es `tablaCTE`, para que la ficha no los cite como CTE.

```ts
import { tablaCTE } from "../../lib/cte/tabla";

/** HS 4 vigente: consolidado 14-06-2022. Última modificación: RD 450/2022, que solo
 *  toca 3.2.2.1 pto 2, 6.2 y el Apéndice C. Valores de cálculo sin cambios desde 2009.
 *  Verificado sobre [N22] y [CYII]; cotejo literal con el PDF pendiente (Pendientes, 1). */
const PROC_HS4 = {
  db: "DB-HS4",
  edicion: "Consolidado 14-06-2022 (valores de cálculo sin cambios desde 2009)",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DBHS.pdf, Sección HS 4",
} as const;

// ---- Citas corregidas de las tablas existentes (los datos no cambian) -----------
// CAUDAL_INSTANTANEO_TABLA_2_1 → articulo: "ap. 2.1.3 pto 1"
// DERIVACIONES_TABLA_4_2       → articulo: "ap. 4.3 pto 1"; inodoro_fluxor.acero_pulgadas: "1 - 1½";
//                                lavavajillas_domestico.acero_pulgadas: "½ (rosca a ¾)"
// ALIMENTACION_TABLA_4_3       → articulo: "ap. 4.3 pto 2";
//                                derivacion_particular.descripcion: "Derivación particular (vivienda, apartamento, local comercial)"
// VELOCIDADES_CALCULO          → articulo: "ap. 4.2.1 pto 2 d)"  (texto del DB; fuera de rango = aviso, no incumplimiento)

export const PRESIONES = tablaCTE({ ...PROC_HS4, articulo: "ap. 2.1.3 ptos 2 y 3" }, {
  presionMinGrifosComunes_kPa: 100, // pto 2 a)
  presionMinFluxorCalentador_kPa: 150, // pto 2 b)
  presionMaxConsumo_kPa: 500, // pto 3
} as const);

export const TEMPERATURA_ACS = tablaCTE({ ...PROC_HS4, articulo: "ap. 2.1.3 pto 4" }, {
  consumoMin_C: 50,
  consumoMax_C: 65,
  /** Excepción literal: «edificios dedicados a uso exclusivo de vivienda siempre que estas
   *  no afecten al ambiente exterior». Con oficinas o local en el edificio, NO aplica. */
  excepcion: "uso_exclusivo_vivienda_sin_afectar_ambiente_exterior",
} as const);

/** Opción del DB, no buena práctica externa: «podrán estimarse en un 20% al 30% de la
 *  producida sobre la longitud real del tramo o evaluarse a partir de los elementos de la instalación». */
export const PERDIDAS_LOCALIZADAS = tablaCTE({ ...PROC_HS4, articulo: "ap. 4.2.2 pto 1 a)" }, {
  fraccionLongitudinalesMin_pct: 20,
  fraccionLongitudinalesMax_pct: 30,
} as const);

// ---- Nuevas ------------------------------------------------------------------------

export const AHORRO_AGUA = tablaCTE({ ...PROC_HS4, articulo: "ap. 2.3 ptos 1 a 3; 3.2.2.1 pto 3" }, {
  contadorAFyACSPorUnidadIndividualizable: true, // 2.3 pto 1
  retornoACSDesdeLongitudIda_m: 15, // 2.3 pto 2 y 3.2.2.1 pto 3: «igual o mayor que 15 m» (comparar con >=)
  retornoTambienEnInstalacionIndividual: true, // 3.2.2.1 pto 3
  dispositivosAhorroEnPublicaConcurrencia: true, // 2.3 pto 3 (lavabos y cisternas)
} as const);

/** ap. 4.4.2 y Tabla 4.4. Confianza media (solo [N22]). */
export const RETORNO_ACS = tablaCTE({ ...PROC_HS4, articulo: "ap. 4.4.2 ptos 1 a 3", tabla: "Tabla 4.4" }, {
  caidaTemperaturaMax_C: 3,
  recirculacionMinPorColumna_l_h: 250,
  fraccionRecirculadaMin: 0.1,
  diametroInteriorMinRetorno_mm: 16,
  caudalPorDiametro: [
    { acero_pulgadas: "½", caudal_l_h: 140 },
    { acero_pulgadas: "¾", caudal_l_h: 300 },
    { acero_pulgadas: "1", caudal_l_h: 600 },
    { acero_pulgadas: "1¼", caudal_l_h: 1100 },
    { acero_pulgadas: "1½", caudal_l_h: 1800 },
    { acero_pulgadas: "2", caudal_l_h: 3300 },
  ],
} as const);

export const CONTADORES = tablaCTE(
  { ...PROC_HS4, articulo: "ap. 3.1 pto 1; 3.2.1.2.3; 3.2.1.2.7; 4.1 pto 1; 4.5.1; 5.1.2; 7.3 pto 4" },
  {
    esquemas: ["contador_general_unico", "contadores_aislados"], // 3.1 pto 1 a) y b)
    divisionarios: {
      ubicacion: "zona de uso común, de fácil y libre acceso", // NO dice «planta baja»
      lecturaADistancia: true,
      llaveCorteAntes: true,
      valvulaRetencionDespues: true,
    },
    /** 7.3 pto 4: con batería, los montantes hasta cada derivación particular son instalación general. */
    montantesDesdeBateriaSonInstalacionGeneral: true,
    perdidaPresionContador: null, // el DB no la fija (4.5.1): ver CRITERIOS_PROYECTO_HS4
  } as const,
);

export const GRUPO_PRESION = tablaCTE(
  { ...PROC_HS4, articulo: "ap. 4.2.2 pto 1 b); 3.2.1.5.1; 4.5.2.2 pto 4; 4.5.2.3 pto 1; 5.1.3.2" },
  {
    /** Necesario si la presión disponible en el punto más desfavorable < mínima de 2.1.3 pto 2. */
    criterioNecesidad: "presion_disponible_menor_que_minima",
    zonasConPresionDeRedSinGrupo: true, // 3.2.1.5.1 pto 1
    localUsoExclusivo: true, // 3.2.1.5.1 pto 3
    /** Pb = Ha + Hg + Pc + Pr (4.5.2.2 pto 4). */
    formulaPresionArranque: "Pb = Ha + Hg + Pc + Pr",
    /** Grupo convencional: parada = Pb + 2…3 bar (4.5.2.3 pto 1). */
    margenParadaSobreArranqueMin_kPa: 200,
    margenParadaSobreArranqueMax_kPa: 300,
  } as const,
);

export const LIMITACION_PRESION = tablaCTE(
  { ...PROC_HS4, articulo: "ap. 3.2.1.5.2 ptos 1 y 2; 4.5.3; 5.1.3.3" },
  {
    /** «válvulas limitadoras de presión» donde se superaría la máxima de 2.1.3 pto 3. */
    obligatoriaSiSuperaMax_kPa: 500,
    dimensionarPorCaudalMaxSimultaneo: true, // 4.5.3 (Tabla 4.5, cotejo pendiente)
    nuncaPorDiametroTuberia: true,
  } as const,
);

export const INTERRUPCION_SERVICIO = tablaCTE({ ...PROC_HS4, articulo: "ap. 7.1 ptos 1 y 2" }, {
  cerrarYVaciarSiSinServicioTras_semanas: 4,
  cerrarYVaciarSiFueraDeServicio_meses: 6,
  taponarAcometidaSinUso_anios: 1,
} as const);

// ---- Simultaneidad: criterio de proyecto, NO CTE y SIN atribución a UNE 149201 ----
// procedencia de SIMULTANEIDAD_K:
//   articulo: "ap. 4.2.1 pto 2 b)",
//   textoCTE: "establecimiento de los coeficientes de simultaneidad de cada tramo de acuerdo con un criterio adecuado",
//   naturaleza: "criterio de proyecto (método tradicional) — no exigencia CTE",
//   fuente: "método tradicional K = 1/√(n−1); atribución a UNE 149201 no verificada",
//   (eliminar `norma: "UNE 149201"` hasta leer la norma)
// formula: "K = 1 / sqrt(n - 1)  (método tradicional; n = nº de aparatos del tramo)"

// ---- Criterios de proyecto (NO son CTE: la ficha debe rotularlos así) -------------
export const CRITERIOS_PROYECTO_HS4 = {
  origen: "criterio de proyecto (no exigencia CTE)",
  presion150EnEntradaCalentadorInstantaneo: true, // A3
  excepcionTemperaturaSoloSiTodoVivienda: true, // A2b
  longitudIdaACSDesde: "salida del generador/acumulador", // B1b
  contadorACSSoloConProduccionCentral: true, // B2b
  bateriaEnPlantaBaja: "habitual (entidad suministradora), no CTE", // B3e
  localSinUso: "posición en batería + derivación ≥ 20 mm con llave, cerrada y vacía; caudal no computado", // B4
  aseosOficinaComoPublicaConcurrencia: true, // B5
  oficinasEnTabla4_3: "núcleo de aseos ≈ cuarto húmedo; planta de oficinas ≈ derivación particular", // C4c
  diametroTabla4_3: "Ø nominal de catálogo", // C4d
  perdidaContadorYLlaves_kPa: 9, // C5: supuesto de predimensionado (fabricante); declarar el posible doble cómputo con el 20–30 %
  simultaneidad: "K = 1/√(n−1) por derivación; sin doble coeficiente", // nota C2
  consignaGrupo: "supuesto declarado X ≥ Pb; comprobar 500 kPa con la presión de parada", // D5
} as const;
```

**Otros ficheros que dependen de estos cambios** (solo se señalan; no se han editado):
- **`calc.ts`:**
  - l. 143, 317–321, 627–632: atribución «UNE 149201».
  - l. 292, 702, 718, 735–736: rótulo «buena práctica» de la velocidad → «intervalo de cálculo del DB, 4.2.1 pto 2 d)».
  - l. 341, 922, 929: «ap. 4.5» → «ap. 4.2.2 pto 1 b)».
  - l. 969 y 980: «buena práctica 20–30 %, no DB» → «DB, 4.2.2 pto 1 a)».
- **`ficha.ts`:**
  - l. 8, 12–17, 103, 147–148, 159, 163, 249, 336–348: edición 2009, UNE 149201 y «buena práctica».
  - l. 296–307, 323: «ap. 4.5» → «ap. 4.2.2 pto 1 b)».
  - l. 356: `edicionDB: "DB-HS4 (2009)"` → «DB-HS 4 (consolidado 14-06-2022)».
- **`ui.tsx`:**
  - l. 123, 663–664, 735, 760: UNE 149201.
  - l. 647 y 716: «ap. 4.5».
  - l. 678: «NO cifra del DB-HS4» es falso.
- **`svg.tsx`:** l. 92, «ap. 4.5».
- **Tests:**
  - `test/ficha.test.ts` l. 104–112 (comprueban la edición «2009») y l. 128–144 (UNE 149201);
  - snapshots de `test/__snapshots__/ficha.test.ts.snap` y `calc.test.ts.snap`.
