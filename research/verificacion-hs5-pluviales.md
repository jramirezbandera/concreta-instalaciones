# Verificación normativa — HS 5, fase 4: pluviales, unión con el alcantarillado, bombeo del garaje y previsión del local

**Fecha:** 2026-10-04
**Ámbito:** bloques A–G del encargo:
- A: pluviales (Tablas 4.6, 4.7, 4.8 y 4.9; factor f; Apéndice B);
- B: unión con el alcantarillado (ap. 3.2); colectores colgados y enterrados; Tabla 4.13;
- C: garaje (bombeo y elevación, separador de grasas, sumideros);
- D: bajantes de residuales (Tabla 4.4: «altura de bajante» y «UD en cada ramal»);
- E: ventilación secundaria (Tabla 4.10 y regla de ½ Ø; umbrales de 7, 11 y 15 plantas);
- F: edición vigente del HS 5 y forma de citarla;
- G: previsión de conexión para un local sin uso.

**Regla aplicada:** ninguna cifra se da por buena sin haber leído el texto oficial. Cada fila indica qué fuente se leyó. Veredictos:
- VERIFICADO: literal en el DB.
- **CORREGIDO**: la afirmación del encargo o del repo no coincide con el DB.
- **NO VERIFICABLE**: el DB no lo dice, o la fuente no se puede leer.
- **CRITERIO**: decisión de proyecto propuesta. No es exigencia del CTE y la ficha debe etiquetarla así.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición leída | Fuente | Lectura |
|---|---|---|---|---|
| [HS22] | DB-HS, Sección HS 5 | Texto consolidado «14 junio 2022» (incluye FOM/588/2017, RD 732/2019 y RD 450/2022) | codigotecnico.org, `DBHS.pdf` | HS 5 íntegra (pp. 111–137). La Figura B.1 aparece como miniatura ilegible (p. 136) |
| [DcmHS] | DB-HS, versión con marcas | «14 junio 2022 — Modificaciones conforme al RD 450/2022», cambios en amarillo | codigotecnico.org | Íntegra. Hay marcas en HS 4 (3.2.2.1 pto 2; 6.2; Apéndice C). **Ninguna en HS 5** |
| [HS09] | DB-HS, Sección HS 5 | Versión «septiembre 2009» (`DBHS_20090923.pdf`, con la corrección de errores de VIV/984/2009, BOE 23/09/2009) | codigotecnico.org | HS 5 íntegra (HS5-1 a HS5-32). Figura B.1 a página completa (HS5-27) |
| [DccHS] | DB-HS con comentarios del Ministerio | Articulado de 14-06-2022; comentarios de 12-02-2025 | codigotecnico.org | HS 5 íntegra (pp. 119–145), con todos sus comentarios. Figura B.1 algo mayor (p. 144) |
| [HS1] | DB-HS, Sección HS 1 | Mismo consolidado de 14-06-2022 | `DBHS.pdf` | Solo ap. 2.4.4 (puntos singulares de cubiertas) |

Avisos de los propios documentos:
- «Este texto consolidado no tiene valor jurídico» (DB-HS, p. 2).
- «Los comentarios tienen un carácter orientativo e informativo no teniendo carácter reglamentario» ([DccHS]).

La cadena de disposiciones del DB-HS, según su p. 2:
1. RD 314/2006 (BOE 28/03/2006).
2. RD 1371/2007 (BOE 23/10/2007) y su corrección (BOE 20/12/2007).
3. Corrección de errores del RD 314/2006 (BOE 25/01/2008).
4. Orden VIV/984/2009 (BOE 23/04/2009) y su corrección (BOE 23/09/2009).
5. Orden FOM/588/2017 (BOE 23/06/2017).
6. RD 732/2019 (BOE 27/12/2019).
7. RD 450/2022 (BOE 15/06/2022).

**No leídos:**
- BOE originales (RD 314/2006; VIV/984/2009 y su corrección). Hacen falta para tres cosas:
  - cotejar la celda Ø315 / 1 % de la Tabla 4.9 (ver A5);
  - cotejar la fórmula 4.2 del bombeo (ver C2);
  - identificar qué disposición actualizó las referencias UNE del HS 5 (ver F1).
- Figura B.1 en resolución cartográfica: no hay versión vectorial en codigotecnico.org (ver A6).
- Comentarios del Ministerio a la Parte I del CTE (ver G1).
- UNE-EN 12056 (partes 2, 3 y 4). Es criterio externo, no exigencia CTE, y no se cita ninguna cifra suya.

---

## Bloque A — Red de aguas pluviales (ap. 4.2 y Apéndice B)

Todas las tablas de este bloque están referidas a **100 mm/h**. Para otra intensidad se corrige la superficie con el factor f (ver A3).

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| A1 | Nº mínimo de sumideros según la superficie de cubierta (Tabla 4.6) | VERIFICADO | S < 100 → 2; 100 ≤ S < 200 → 3; 200 ≤ S < 500 → 4; S > 500 → 1 cada 150 m² | DB-HS 5, ap. 4.2.1 pto 2, Tabla 4.6 «Número de sumideros en función de la superficie de cubierta». S = «superficie proyectada horizontalmente de la cubierta a la que sirven» | [HS22] [HS09] [DccHS] |
| A1b | S = 500 m² exactos, y cómo redondear «1 cada 150 m²» | **NO VERIFICABLE** (laguna del DB) → **CRITERIO** | Para S ≥ 500: ⌈S / 150⌉. En S = 500 da 4, igual que el tramo anterior, así que no hay salto | Tabla 4.6: no cubre S = 500 ni dice cómo redondear | [HS22] |
| A1c | Resto del ap. 4.2.1 | VERIFICADO | Filtro de la caldereta: entre 1,5 y 2 veces la sección de la tubería. Desnivel entre puntos de recogida ≤ 150 mm. Sin puntos de recogida, otra evacuación (p. ej. rebosaderos) | ap. 4.2.1 ptos 1, 3 y 4 (ver nota A1) | [HS22] [HS09] |
| A1d | Ejecución de calderetas y sumideros | VERIFICADO | Boca de la caldereta ≥ 1,5 × la sección de la bajante; profundidad ≥ 15 cm; solape ≥ 5 cm. Sumideros de cubiertas, terrazas y garajes: sifónicos. Sumidero sifónico a ≤ 5 m de la bajante. Hormigón de pendiente ≤ 15 cm. Ø del sumidero > 1,5 × Ø de la bajante | ap. 5.1.3 ptos 1, 3 y 5 | [HS22] [HS09] |
| A1e | Rebosaderos | VERIFICADO (es HS 1, no HS 5) | En cubierta plana con paramento en todo el perímetro, son obligatorios si: hay una sola bajante; o una bajante obturada no puede evacuar por otras; o la carga compromete el soporte. Σ áreas de rebosaderos ≥ Σ áreas de bajantes. Deben sobresalir ≥ 5 cm | DB-HS 1, ap. 2.4.4.1.5 ptos 1, 2 y 4 | [HS1] |
| A2 | Diámetro del canalón semicircular (Tabla 4.7) | VERIFICADO | Superficie máx. [m²] a 0,5 / 1 / 2 / 4 %: Ø100: 35 / 45 / 65 / 95. Ø125: 60 / 80 / 115 / 165. Ø150: 90 / 125 / 175 / 255. Ø200: 185 / 260 / 370 / 520. Ø250: 335 / 475 / 670 / 930 | ap. 4.2.2 pto 1, Tabla 4.7 «Diámetro del canalón para un régimen pluviométrico de 100 mm/h» | [HS22] [HS09] [DccHS] |
| A2b | Canalón no semicircular: +10 % | VERIFICADO (la regla) + **CRITERIO** (cómo se calcula) | Sección cuadrangular ≥ 1,10 × sección semicircular del Ø obtenido. Criterio: sección semicircular = π·Ø²/8, con Ø nominal | ap. 4.2.2 pto 3: «la sección cuadrangular equivalente debe ser un 10 % superior a la obtenida como sección semicircular» | [HS22] [HS09] |
| A2c | Pendiente mínima de canalones | VERIFICADO, **con conflicto entre secciones** | HS 5: 0,5 % (0,16 % en canalones de plástico). HS 1, en cubiertas inclinadas: 1 % | HS 5 ap. 5.1.4 ptos 1 y 3; HS 1 ap. 2.4.4.2.9 pto 2 | [HS22] [HS1] |
| A3 | Factor f = i / 100 sobre la superficie | VERIFICADO | Superficie de cálculo = superficie real × i / 100 | ap. 4.2.2 pto 2, fórmula (4.1): «debe aplicarse un factor f de corrección a la superficie servida tal que: f = i / 100» | [HS22] [HS09] [DccHS] |
| A3b | ¿A qué tablas se aplica f? | VERIFICADO para 4.7, 4.8 y 4.3. **CORREGIDO** si se dice que el DB lo exige literalmente para 4.9 | Literal en tres sitios: Tabla 4.7 (4.2.2 pto 2); Tabla 4.8 (4.2.3 pto 2, «Análogamente al caso de los canalones…»); superficies equivalentes del mixto (ap. 4.3, párrafo 3). En la Tabla 4.9 se aplica por **CRITERIO**: el ap. 4.2.4 no menciona f, pero la tabla está referida a 100 mm/h | ap. 4.2.2 pto 2; 4.2.3 pto 2; 4.2.4; 4.3 | [HS22] [HS09] [DccHS] |
| A3c | Remisión «véase el Anexo B» | VERIFICADO (errata) | Es el **Apéndice B** | ap. 4.2.2 pto 2. La errata sigue en la versión comentada de 2025 | [HS22] [DccHS] |
| A4 | Diámetro de las bajantes pluviales (Tabla 4.8) | VERIFICADO | Superficie máx. [m²] → Ø [mm]: 65 → 50; 113 → 63; 177 → 75; 318 → 90; 580 → 110; 805 → 125; 1.544 → 160; 2.700 → 200 | ap. 4.2.3 pto 1, Tabla 4.8 | [HS22] [HS09] [DccHS] |
| A5 | Diámetro de los colectores pluviales (Tabla 4.9) | VERIFICADO | Superficie máx. [m²] a 1 / 2 / 4 %: Ø90: 125 / 178 / 253. Ø110: 229 / 323 / 458. Ø125: 310 / 440 / 620. Ø160: 614 / 862 / 1.228. Ø200: 1.070 / 1.510 / 2.140. Ø250: 1.920 / 2.710 / 3.850. Ø315: 2.016 / 4.589 / 6.500 | ap. 4.2.4 pto 2, Tabla 4.9. Pto 1: colectores pluviales «a sección llena en régimen permanente» | [HS22] [HS09] [DccHS] [DcmHS] |
| A5b | Ø315 a 1 % = 2.016 m² | VERIFICADO (literal), **probable errata** | 2.016 en las cuatro versiones leídas. Las demás filas guardan 2 % / 1 % ≈ 1,41–1,42; para Ø315 cabría esperar ≈ 3.250. Usar el literal (queda del lado de la seguridad) y avisar | Tabla 4.9, fila 315. Sin comentario del Ministerio que lo corrija | [HS09] [HS22] [DcmHS] [DccHS]. BOE no leído |
| A6 | Cómo se obtiene la intensidad i | VERIFICADO | Tabla B.1, con la isoyeta y la zona pluviométrica (A o B) de la localidad, leídas en el mapa de la Figura B.1 | Apéndice B pto 1: «La intensidad pluviométrica i se obtendrá en la tabla B.1 en función de la isoyeta y de la zona pluviométrica correspondientes a la localidad determinadas mediante el mapa de la figura B.1» | [HS22] [HS09] [DccHS] |
| A6b | Tabla B.1 | VERIFICADO | Isoyeta 10 a 120, de 10 en 10. Zona A: 30, 65, 90, 125, 155, 180, 210, 240, 275, 300, 330, 365 mm/h. Zona B: 30, 50, 70, 90, 110, 135, 150, 170, 195, 220, 240, 265 mm/h | Apéndice B, Tabla B.1 «Intensidad Pluviométrica i (mm/h)» | [HS22] [HS09] [DccHS] [DcmHS] |
| A6c | ¿Existe una lista oficial municipio → i? | VERIFICADO que no está en el DB. **NO VERIFICABLE** fuera del DB | El HS 5 no relaciona municipios (el HS 6, Apéndice B, sí lo hace, pero solo para el radón). No he encontrado ninguna relación oficial del Ministerio | Apéndice B: solo mapa y tabla | [HS22] [DccHS]; búsqueda web sin resultado |
| A6d | ¿Se pueden usar valores mayores? | VERIFICADO (comentario, no reglamentario) | «Pueden emplearse valores mayores si se considera necesario por la experiencia previa o por la disposición de datos facilitados por entidades oficiales.» | Comentario del Ministerio a la Tabla B.1 | [DccHS] |
| A6e | Isoyeta y zona de Cáceres | **NO VERIFICABLE** | En la Figura B.1, Cáceres cae junto al límite entre zonas A y B y entre las isoyetas 30 y 40. Lecturas posibles: A-30 = 90; A-40 = 125; B-30 = 70; B-40 = 90 mm/h. Envolvente: 125 mm/h | Figura B.1 «Mapa de isoyetas y zonas pluviométricas» | [HS09] (página completa) y [DccHS]. [HS22] ilegible |

**Nota A1 — texto literal de 4.2.1 ptos 3 y 4.**
- Pto 3: «El número de puntos de recogida debe ser suficiente para que no haya desniveles mayores que 150 mm y pendientes máximas del 0,5 %, y para evitar una sobrecarga excesiva de la cubierta.»
- La frase «pendientes máximas del 0,5 %» choca con la Tabla 2.9 de HS 1 (cubiertas planas, del 1 % al 5 %). Mostrarla como cita, pero **no** comprobarla automáticamente.
- Pto 4: «Cuando por razones de diseño no se instalen estos puntos de recogida debe preverse de algún modo la evacuación de las aguas de precipitación, como por ejemplo colocando rebosaderos.»
- Lectura: la Tabla 4.6 es para cubiertas que desaguan por sumideros. Una cubierta inclinada que vierte a canalón se dimensiona con la Tabla 4.7; aplicarle la 4.6 es **CRITERIO**, no exigencia.
- HS 1, ap. 2.4.4.1.4 pto 6: el sumidero en la parte horizontal de la cubierta debe estar a 50 cm, como mínimo, de los paramentos verticales.

**Nota A2c — pendiente de canalones.** En cubiertas inclinadas manda HS 1 (1 %), porque es exigencia de la propia cubierta. Si el usuario elige la columna 0,5 % de la Tabla 4.7 en una cubierta inclinada, avisar: «HS 1 2.4.4.2.9 exige 1 %».

**Nota A3 — cómo se aplica f.** Se multiplica la **superficie** (no el diámetro ni el caudal) por f = i / 100, y se entra en la tabla con la superficie corregida.
- Ejemplo: 200 m² con i = 125 mm/h → se entra con 250 m².
- Párrafo 3 del ap. 4.3: «Si el régimen pluviométrico es diferente, deben multiplicarse los valores de las superficies equivalentes por el factor f de corrección indicado en 4.2.2.» En [HS22] y [DcmHS] ese párrafo aparece numerado «1» (errata de numeración). Citarlo como «ap. 4.3, párrafo 3».

**Nota A5 — uso de la Tabla 4.9.**
- No interpolar entre pendientes. Criterio conservador: usar la columna de pendiente igual o inmediatamente inferior a la real.
- Pendientes mínimas: 1 % colgado, 2 % enterrado (ver B3). La columna 1 % solo vale para colectores colgados.
- La tabla empieza en Ø90 y termina en Ø315. Por encima de 2.016 / 4.589 / 6.500 m² (corregidos por f): fuera de tabla, aviso y cálculo específico.
- Además, el Ø no debe disminuir aguas abajo (ap. 3.3.1.3 pto 2 para bajantes; ap. 4.1.1.1 pto 4 para residuales). Criterio: Ø del colector ≥ el mayor Ø que acomete aguas arriba.

**Nota A6 — qué hacer con i en la app.**
- No hay dato oficial por municipio, así que i debe ser un **input del proyectista**. Se rellena eligiendo isoyeta y zona en la Tabla B.1, y la procedencia queda como «lectura de la Figura B.1 por el proyectista».
- Opcionalmente, «valor mayor justificado» (comentario A6d).
- Si la localidad cae entre dos isoyetas, el DB no dice si se interpola. Criterio conservador: isoyeta superior.
- Para la demo de Cáceres, si hace falta un valor por defecto, usar 125 mm/h con la etiqueta «envolvente por criterio (A-40), pendiente de lectura». Nunca presentarlo como «el valor del DB para Cáceres».

---

## Bloque B — Unión con el alcantarillado y red horizontal

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| B1 | Una única red pública: sistema mixto o separativo con conexión final, con cierre hidráulico | VERIFICADO | Literal en la nota B1 | ap. 3.2 pto 1 | [HS22] [HS09] [DccHS] |
| B1b | Bajante pluvial en colector colgado mixto | VERIFICADO | Conexión separada ≥ 3 m de la de la bajante residual más próxima aguas arriba | ap. 3.3.1.4.1 pto 2 | [HS22] [HS09] |
| B1c | Válvula antirretorno de seguridad | VERIFICADO | «para prevenir las posibles inundaciones cuando la red exterior de alcantarillado se sobrecargue, particularmente en sistemas mixtos (doble clapeta con cierre manual), dispuestas en lugares de fácil acceso para su registro y mantenimiento» | ap. 3.3.2.2 pto 1 | [HS22] [HS09] |
| B1d | Cómo se dimensiona un mixto | VERIFICADO | Primero se dimensiona como separativo (residuales y pluviales por separado). Después, el colector mixto se calcula con la Tabla 4.9 y la superficie total: pluvial + equivalente de las UD | ap. 4 pto 1; ap. 4.3 ptos 1 y 2 | [HS22] [HS09] |
| B1e | Conversión de UD a superficie equivalente (a 100 mm/h) | VERIFICADO | UD ≤ 250 → 90 m². UD > 250 → 0,36 × UD m² (continuo en 250). Si i ≠ 100 → × f | ap. 4.3 ptos 2 a) y b), párrafo 3 | [HS22] [HS09] [DccHS] |
| B2 | Dos redes públicas (pluviales y residuales) | VERIFICADO | Sistema separativo, «y cada red de canalizaciones debe conectarse de forma independiente con la exterior correspondiente» | ap. 3.2 pto 2 | [HS22] [HS09] |
| B2b | Sin alcantarillado público | VERIFICADO | Sistemas separados: residuales con estación depuradora particular; pluviales al terreno | ap. 3.1 pto 2 | [HS22] |
| B3 | Pendiente mínima: colgados 1 %, enterrados 2 % | VERIFICADO | 1 % / 2 % | ap. 3.3.1.4.1 pto 3; ap. 3.3.1.4.2 pto 2 | [HS22] [HS09] |
| B3b | Registros en la red colgada | VERIFICADO | Registros (piezas especiales) en tramos rectos, en cada encuentro o acoplamiento y en las derivaciones; tramos entre registros ≤ 15 m. Tapón de registro en cada entronque y, en tramos rectos, cada 15 m, en la mitad superior. Entronque con la bajante libre de conexiones ≥ 1 m a cada lado. Máx. 2 colectores en un mismo punto. Bajante–colector con piezas especiales, nunca con simples codos | ap. 3.3.1.4.1 ptos 1, 4 y 5; ap. 5.4.1 ptos 1 y 2 | [HS22] [HS09] |
| B3c | Registros en la red enterrada | VERIFICADO | Arqueta en cada unión vertical–horizontal, encuentro y derivación. Un colector por cara, con ángulo > 90°. Arqueta a pie de bajante **no** sifónica. Arqueta de paso: máx. 3 colectores. Tramos entre registros ≤ 15 m. Arqueta de trasdós si llega más de un colector al pozo general. Pozo general al final de la instalación. Pozo de resalto si el desnivel con la acometida es > 1 m | ap. 3.3.1.4.2 ptos 3 y 4; ap. 3.3.1.5 ptos 1 a 5 | [HS22] [HS09] |
| B4 | Dimensiones mínimas de arquetas (Tabla 4.13) | VERIFICADO | Ø del colector de salida [mm] → L × A [cm]: 100 → 40 × 40; 150 → 50 × 50; 200 → 60 × 60; 250 → 60 × 70; 300 → 70 × 70; 350 → 70 × 80; 400 → 80 × 80; 450 → 80 × 90; 500 → 90 × 90 | ap. 4.5 pto 1, Tabla 4.13 «Dimensiones de las arquetas» | [HS22] [HS09] [DccHS] |
| B4b | Cómo leer la Tabla 4.13 con Ø de PVC (90, 110, 125, 160) | **NO VERIFICABLE** (el DB no da regla) → **CRITERIO** | Criterio conservador: primera columna ≥ Ø nominal. 90 → 40 × 40; 110 y 125 → 50 × 50; 160 → 60 × 60 | Tabla 4.13 (solo columnas de 100, 150, 200… mm) | [HS22] |

**Nota B1 — texto literal del ap. 3.2 pto 1.** «Cuando exista una única red de alcantarillado público debe disponerse un sistema mixto o un sistema separativo con una conexión final de las aguas pluviales y las residuales, antes de su salida a la red exterior. La conexión entre la red de pluviales y la de residuales debe hacerse con interposición de un cierre hidráulico que impida la transmisión de gases de una a otra y su salida por los puntos de captación tales como calderetas, rejillas o sumideros. Dicho cierre puede estar incorporado a los puntos de captación de las aguas o ser un sifón final en la propia conexión.»

**Nota B1 — definiciones y cierres.**
- Definiciones del Apéndice A:
  - «Sistema mixto o semiseparativo: aquel en el que las derivaciones y bajantes son independientes para aguas residuales y pluviales, unificándose ambas redes en los colectores.»
  - «Sistema separativo: aquel en el que las derivaciones, bajantes y colectores son independientes para aguas residuales y pluviales.»
- El cierre hidráulico puede estar en varios puntos:
  - sumideros sifónicos (5.1.3 pto 3);
  - conexión de canalones «a través de sumidero sifónico» (5.1.4 pto 4);
  - arqueta sifónica en los encuentros enterrados de pluviales y residuales (3.3.1.1 pto 1 d).
- Comentario del Ministerio a 3.3.1.1 ([DccHS]): «En casos excepcionales, puede justificarse la necesidad de emplear cierres mecánicos, en especial en los desagües de cubierta en climas secos.» Viene al caso en Cáceres, por el estiaje.

---

## Bloque C — Garaje: bombeo, separador y sumideros

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| C1 | ¿Cuándo es obligatorio el bombeo? | VERIFICADO | «Cuando la red interior o parte de ella se tenga que disponer por debajo de la cota del punto de acometida debe preverse un sistema de bombeo y elevación.» | ap. 3.3.2.1 pto 1 | [HS22] [HS09] [DccHS] |
| C1b | ¿Pueden ir pluviales al bombeo? | VERIFICADO | No, «salvo por imperativos de diseño del edificio, tal como sucede con las aguas que se recogen en patios interiores o rampas de acceso a garajes-aparcamientos, que quedan a un nivel inferior a la cota de salida por gravedad» | ídem | [HS22] [HS09] |
| C1c | Residuales de las plantas superiores | VERIFICADO | No deben verter al bombeo las aguas residuales de las partes del edificio por encima del punto de acometida | ídem | [HS22] [HS09] |
| C1d | Desagües bombeados en la pequeña evacuación | VERIFICADO | «excepto en instalaciones temporales, deben evitarse en estas redes los desagües bombeados» | ap. 3.3.1.2 pto 1 j) | [HS22] |
| C2 | Número de bombas y alternancia | VERIFICADO | Al menos 2 bombas, «con el fin de garantizar el servicio de forma permanente en casos de avería, reparaciones o sustituciones». Si son 2 o más: interruptores de nivel multiplicados, dispositivo de alternancia y funcionamiento secuencial | ap. 3.3.2.1 pto 2; ap. 5.5.2 pto 3 | [HS22] [HS09] |
| C2b | Suministro eléctrico | VERIFICADO | Si hay grupo electrógeno, conectarlas a él; si no, grupo exclusivo o batería con autonomía ≥ 24 h. Suministro autónomo complementario «cuando la continuidad del servicio lo haga necesario» | ap. 3.3.2.1 ptos 2, 6 y 7 | [HS22] [HS09] |
| C2c | Antirretorno y antirreflujo | VERIFICADO | Bucle antirreflujo «por encima del nivel de salida del sistema general de desagüe». Llave de corte a la entrada, a la salida y después de la válvula de retención | ap. 3.3.2.1 pto 8; ap. 5.5.2 pto 6 | [HS22] [HS09] |
| C2d | ¿A qué se conecta la impulsión? | VERIFICADO | Sin conexiones en la tubería de descarga. Nunca a una bajante. Conexión con el colector «siempre por gravedad». Sin válvulas de aireación en la descarga. Desde el punto de conexión con el colector horizontal se dimensiona como un colector más | ap. 5.5.2 pto 6; ap. 4.6.2 pto 3 | [HS22] [HS09] |
| C2e | Pozo y equipos | VERIFICADO | Protección de las bombas contra sólidos en suspensión. Pozo accesible. Tubería de ventilación del depósito. Al pozo no deben entrar «aguas que contengan grasas, aceites, gasolinas o cualquier líquido inflamable». Interruptores de marcha y paro, nivel de alarma por encima y de seguridad por debajo | ap. 3.3.2.1 ptos 2 a 5; ap. 5.5.2 ptos 1 y 2 | [HS22] [HS09] |
| C2f | Dimensionado (ap. 4.6) | VERIFICADO (cita) | Máx. 12 arranques/h. Vu = 0,3 · Qb (fórmula 4.2). Vu > ½ de la aportación media diaria de residuales. Entrada de aire = caudal de las bombas. Ventilación ≥ ½ Ø de la acometida y ≥ 80 mm. Caudal de cada bomba ≥ 125 % del de aportación, todas iguales. Presión = altura geométrica + pérdidas | ap. 4.6.1 ptos 1 a 5; ap. 4.6.2 ptos 1 a 3 | [HS22] [HS09] [DcmHS] |
| C2g | Fórmula 4.2 | VERIFICADO (literal), **incoherente en unidades** | Literal: «Vu = 0,3 Qb (dm³)», con «Qb caudal de la bomba (dm³/s)». Equivale a 0,3 s de bombeo. No usarla sola (ver nota C2) | ap. 4.6.1 pto 2 | [HS22] [HS09] [DcmHS]. BOE no leído |
| C2h | Depósito de recepción (ejecución) | VERIFICADO | Estanco. Ventilación ≥ ½ Ø de la acometida y ≥ 80 mm. ≥ 10 cm entre el nivel máximo y la generatriz inferior de la acometida. ≥ 20 cm entre el nivel mínimo y el fondo. Altura ≥ 1 m. Fondo con pendiente ≥ 25 %. Fosa seca: 600 mm libres, sumidero ≥ 100 mm, 200 lux. Si contiene fecales, no integrado en la estructura | ap. 5.5.1 ptos 1 a 8; ap. 5.5.2 ptos 4 y 5 | [HS22] [HS09] |
| C3 | Separador de grasas en garajes | VERIFICADO | «el separador de grasas debe disponerse cuando se prevea que las aguas residuales del edificio puedan transportar una cantidad excesiva de grasa, (en locales tales como restaurantes, garajes, etc.), o de líquidos combustibles que podría dificultar el buen funcionamiento de los sistemas de depuración, o crear un riesgo en el sistema de bombeo y elevación.» Preferiblemente al final de la red horizontal, antes del pozo de resalto y de la acometida | ap. 3.3.1.5 pto 2 e) | [HS22] [HS09] [DccHS] |
| C3b | Garaje con bombeo | VERIFICADO (combinando dos artículos) | Si el agua del garaje va al pozo de bombeo, debe pasar antes por un separador: el pozo no admite grasas, aceites ni gasolinas | ap. 3.3.2.1 pto 4 + ap. 3.3.1.5 pto 2 e) | [HS22] |
| C3c | Rampas de garaje | VERIFICADO | Arqueta sumidero con rejilla plana desmontable. Desagüe lateral de Ø ≥ 110 mm, «vertiendo a una arqueta sifónica o a un separador de grasas y fangos» | ap. 5.4.5.1 pto 2 | [HS22] [HS09] |
| C3d | Separador: ejecución y mantenimiento | VERIFICADO | Ventilación con tubo de 100 mm hasta la cubierta. Dos etapas (fangos y grasas) cuando lo exijan las condiciones de evacuación. Salida de gres vidriado con pendiente ≥ 3 %. Limpieza cada 6 meses | ap. 5.4.5.3 ptos 3, 4 y 6; ap. 7 pto 6 | [HS22] |
| C4 | Nº mínimo de sumideros en el garaje | VERIFICADO (el DB no lo fija) | No hay mínimo. La Tabla 4.6 es para cubiertas | ap. 4.2.1 pto 2 | [HS22] [DccHS] |
| C4b | UD del sumidero del garaje | VERIFICADO (valores). **NO VERIFICABLE** (privado o público) → **CRITERIO** | Tabla 4.1, sumidero sifónico: privado 1 UD, Ø 40; público 3 UD, Ø 50. El DB no define «uso privado» ni «uso público», ni hay comentario del Ministerio. Criterio: **público** (3 UD, Ø 50), por ser más desfavorable | ap. 4.1.1.1, Tabla 4.1; ap. 4 pto 2 | [HS22] [DccHS] |
| C4c | Tipo de sumidero | VERIFICADO | Sifónicos, «capaces de soportar, de forma constante, cargas de 100 kg/cm²» (cifra literal) | ap. 5.1.3 pto 3 | [HS22] [HS09] |

**Nota C2 — fórmula 4.2.**
- Tomada al pie de la letra no limita nada: con Qb = 2 dm³/s da 0,6 dm³.
- La condición que de verdad dimensiona es la del pto 3 (> ½ de la aportación media diaria), junto con la de 12 arranques/h.
- Propuesta para el motor:
  - Vu ≥ max(0,3 · Qb, 0,5 · aportación media diaria).
  - Aviso visible: «Fórmula 4.2 del DB dimensionalmente dudosa; prevalece 4.6.1 pto 3».
- No introducir otra fórmula (p. ej. de UNE-EN 12056-4) sin leerla. Si se introduce, etiquetarla como criterio externo.

**Nota C2 — dónde va la impulsión.** Sube por encima de la cota de salida (bucle antirreflujo) y baja por gravedad a un colector horizontal, nunca a una bajante. Que ese colector sea el pozo general no lo dice el DB. El ap. 3.1 pto 1 solo pide que los colectores desagüen «preferentemente por gravedad, en el pozo o arqueta general».

**Nota C2 — no confundir con HS 1.** Las «bombas de achique» y la Tabla 3.4 «Cámaras de bombeo» de HS 1 (soluciones D2, D3 y D4) son del drenaje de muros y suelos. No sirven para el bombeo de evacuación.

**Nota C4 — qué es residual y qué es pluvial en un garaje (CRITERIO).**
- Los sumideros interiores del garaje recogen goteo y lavado: son residuales y se cuentan en UD (Tabla 4.1).
- La rampa abierta a la lluvia recoge pluviales: se cuenta como superficie proyectada × f, y es la única pluvial que el ap. 3.3.2.1 admite en el bombeo.

---

## Bloque D — Bajantes de residuales (Tabla 4.4)

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| D1 | ¿Qué es la «altura de bajante» de la Tabla 4.4? | **NO VERIFICABLE** (el DB no la define) → **CRITERIO** | Calcular con las dos columnas y quedarse con el Ø mayor (ver nota D1) | Cabeceras de la Tabla 4.4: «Máximo número de UD, para una altura de bajante de: Hasta 3 plantas / Más de 3 plantas». Título: «según el número de alturas del edificio». Ap. 4.1.2 pto 2: «en función del número de plantas». No hay definición en el Apéndice A ni comentario | [HS22] [HS09] [DccHS] |
| D2 | «UD en cada ramal» = UD de la bajante / nº de plantas (repo, `calc.ts:514`) | **CORREGIDO** | UD del **ramal más cargado** que acomete a la bajante, medido, no promediado | ap. 4.1.2 pto 2: «el máximo número de UD en la bajante y el máximo número de UD en cada ramal». Ramal = ramal colector entre aparatos y bajante (ap. 4.1.1.3, Tabla 4.3) | [HS22] |
| D3 | Bajante de Ø90 con inodoros (repo, `calc.ts:357`) | **CORREGIDO** | Si recibe un inodoro, Ø ≥ 100. En la serie de la Tabla 4.4, **110** | Tabla 4.1: inodoro, Ø mínimo de sifón y derivación 100 mm. Ap. 4.1.1.1 pto 4: «El diámetro de las conducciones no debe ser menor que el de los tramos situados aguas arriba». Ap. 3.3.1.3 pto 1 menciona expresamente el caso de los inodoros | [HS22] [HS09] |

**Nota D1 — por qué la envolvente.**
- Las columnas «Más de 3 plantas» no son uniformemente más exigentes:
  - Admiten **más** UD en la bajante (Ø110: 740 frente a 360).
  - Admiten **menos** UD por ramal (Ø110: 134 frente a 181).
- Ninguna lectura es siempre la del lado de la seguridad.
- En el ejemplo (bajante de viviendas en P1–P3 que atraviesa el local de PB y llega al colector colgado del techo del sótano) caben tres lecturas:
  - (a) plantas con acometida: 3 → «hasta 3»;
  - (b) plantas que atraviesa la bajante (P3, P2, P1 y PB): 4 → «más de 3»;
  - (c) plantas del edificio: 4 o 5 → «más de 3».
- Criterio propuesto:
  - Calcular el Ø con las dos columnas (bajante total y ramal) y tomar el mayor.
  - Declarar como dato «nº de plantas atravesadas por la bajante» (lectura b).
  - Si las dos columnas dan Ø distinto, avisar.
- En vivienda con inodoros el resultado casi siempre es Ø110 por D3, así que la ambigüedad rara vez cambia el Ø. Pero el motor no debe elegir una columna en silencio.

**Nota D2 — cuando no se conocen los ramales.** Si el modelo no tiene los ramales individuales, la cota segura es la suma de UD de la planta que vierte a esa bajante, no la media UD / plantas. La media subestima en cuanto una planta tiene más aparatos que otra.

---

## Bloque E — Ventilación secundaria y umbrales

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| E1 | Ø de la columna secundaria con conexiones en plantas alternas: ¿Tabla 4.10 o regla de ½ Ø? | VERIFICADO: **las dos a la vez** | Ø de la Tabla 4.10 (por Ø de bajante, UD y longitud efectiva) **y** ≥ ½ Ø de la bajante | ap. 4.4.2 pto 4: «El diámetro de la columna de ventilación debe ser al menos igual a la mitad del diámetro de la bajante a la que sirve». Pto 5: «Los diámetros nominales de la columna de ventilación secundaria se obtienen de la tabla 4.10 en función del diámetro de la bajante, del número de UD y de la longitud efectiva» | [HS22] [HS09] [DccHS] |
| E1b | El motor da «Ø55» | **CORREGIDO** | 55 no es un Ø de la tabla: es solo la cota ½ × 110. Para bajante Ø110 la Tabla 4.10 empieza en **63**. Ø63 vale para longitudes efectivas de hasta 15 / 10 / 8 m (escalones de 180 / 360 / 740 UD). Si la longitud es mayor: 65, 80 o 100 según la fila | Tabla 4.10, fila de bajante 110 | [HS22] [HS09] |
| E1c | Uniformidad y unión | VERIFICADO | Ø uniforme en todo el recorrido. La unión bajante–columna tiene el Ø de la columna. Con desviaciones de la bajante, el tramo anterior se dimensiona para su carga y el posterior para la de toda la bajante | ap. 4.4.2 ptos 1, 2 y 3 | [HS22] |
| E1d | Conexión en cada planta (≥ 15 plantas) | VERIFICADO | Tabla 4.11, Ø bajante → Ø columna: 40 → 32; 50 → 32; 63 → 40; 75 → 40; 90 → 50; 110 → 63; 125 → 75; 160 → 90; 200 → 110; 250 → 125; 315 → 160 | ap. 4.4.2 pto 6, Tabla 4.11 | [HS22] [HS09] |
| E1e | Longitud efectiva | VERIFICADO | «Longitud efectiva: de una red de ventilación, es igual a la longitud equivalente dividida por 1,5, para incluir sin pormenorizar, las pérdidas localizadas por elementos singulares de la red». Longitud equivalente: L = 2,58 × 10⁻⁷ × d⁵ / (f × q²), para 250 Pa | Apéndice A | [HS22] [HS09] |
| E2 | Primaria sola con < 7 plantas, o < 11 si la bajante está sobredimensionada | VERIFICADO, con matiz | «Se considera suficiente como único sistema de ventilación en edificios con menos de 7 plantas, o con menos de 11 si la bajante está sobredimensionada, y los ramales de desagües tienen menos de 5 m.» | ap. 3.3.3.1 pto 1 | [HS22] [HS09] |
| E2b | Secundaria: plantas alternas con < 15 plantas, cada planta con ≥ 15 | VERIFICADO | «con conexiones en plantas alternas a la bajante si el edificio tiene menos de 15 plantas, o en cada planta si tiene 15 plantas o más» | ap. 3.3.3.2 pto 1 | [HS22] [HS09] |
| E2c | Terciaria | VERIFICADO | Obligatoria si los ramales de desagüe miden > 5 m o si el edificio tiene > 14 plantas | ap. 3.3.3.3 pto 1 | [HS22] |
| E2d | Válvulas de aireación | VERIFICADO | Una única válvula en edificios de 5 plantas o menos; una cada 4 plantas en los de mayor altura | ap. 3.3.3.4 pto 1 | [HS22] |
| E2e | Qué es una bajante «sobredimensionada» | **NO VERIFICABLE** (no está definida) → **CRITERIO** | Propuesta: Ø al menos un escalón por encima del exigido por la Tabla 4.4. Etiquetarlo como criterio | ap. 3.3.3.1 pto 1; Apéndice A sin definición | [HS22] [DccHS] |

**Nota E1 — procedimiento para la Tabla 4.10.**
1. Fila: el Ø de la bajante.
2. Escalón de UD: el primero ≥ UD de la bajante. No interpolar; es criterio conservador.
3. Columna: el menor Ø de ventilación cuya longitud máxima sea ≥ la longitud real de la columna.
4. Ese Ø debe ser además ≥ ½ Ø de la bajante. Si no lo es, tomar el siguiente de la fila que sí lo sea.

Si las UD superan el último escalón de la fila, o la longitud supera todas las columnas: fuera de tabla, aviso.

Casos en que la Tabla 4.4 admite más UD que la 4.10 (quedan fuera de tabla):
- Ø50: 25 frente a 24.
- Ø90: 280 frente a 153.
- Ø160: 2.240 frente a 1.960.
- Ø315: 9.240 frente a 9.046.

**Nota E2 — matiz del literal.** La coma de «…sobredimensionada, y los ramales de desagües tienen menos de 5 m» admite que la condición de los ramales afecte a los dos casos (7 y 11 plantas).
- El comentario de `VENT_PRIMARIA` en `tablas.ts` la liga solo al caso de 11 plantas.
- Criterio prudente: exigir ramales < 5 m en ambos casos.
- En la práctica coincide con el disparador de la terciaria (ramales > 5 m). Conviene avisar si algún ramal pasa de 5 m, aunque el edificio tenga menos de 7 plantas.

---

## Bloque F — Edición vigente del HS 5

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| F1 | El HS 5 del consolidado es la versión de 2009 «sin modificar» (IDR §1) | VERIFICADO en articulado y tablas. **CORREGIDO** en lo de «sin modificar» | Articulado, tablas, figuras y apéndices A y B **idénticos** entre [HS09] y [HS22], y también en [DccHS]. Solo cambian las normas UNE citadas en el ap. 6.2 y en el Apéndice C (ver nota F1). [DcmHS] no marca nada en HS 5: el RD 450/2022 no lo modificó | Cotejo directo | [HS09] [HS22] [DcmHS] [DccHS] |
| F1b | ¿Qué disposición actualizó esas referencias UNE? | **NO VERIFICABLE** | No es el RD 450/2022, porque no está marcada en [DcmHS]. Queda entre FOM/588/2017 y RD 732/2019. Hay que leer el BOE | p. 2 del DB-HS (cadena de disposiciones) | BOE no leído |
| F1c | Cómo citar la edición | **CRITERIO** | «CTE DB-HS, Sección HS 5, texto consolidado de 14-06-2022 (codigotecnico.org). Tablas de dimensionado sin cambios desde la versión de 23-09-2009» | — | — |
| F1d | `PROC_HS5.fecha = "2009-04-23"` en `tablas.ts` | **CORREGIDO** (matiz) | 2009-04-23 es la fecha del BOE de VIV/984/2009. El texto de 2009 que circula es el de 23-09-2009, que incluye su corrección de errores. Y la edición vigente es la consolidada de 2022-06-14. Propuesta en «Para el código» | — | [HS09] [HS22] |

**Nota F1 — qué cambia en las referencias UNE.** En 2022 y 2025 se citan:
- UNE-EN 598:2008+A1:2009;
- UNE-EN 877:2000 (+A1:2007);
- UNE-EN 1329-1:2014+A1:2018;
- UNE-EN 1401-1:2009;
- UNE-EN 1453-1:2017;
- UNE-EN 1566-1:1999;
- UNE-EN ISO 1452-1 y -2:2010;
- UNE-EN 1852-1:2018;
- UNE-EN 295-1:2013;
- UNE-EN 1916:2008 + UNE 127916:2014.

La versión de 2009 citaba ediciones anteriores. Ningún valor numérico de dimensionado cambia.

---

## Bloque G — Previsión de conexión para un local sin uso

| # | Afirmación | Veredicto | Valor correcto | Cita exacta | Fuente leída |
|---|---|---|---|---|---|
| G1 | ¿Hay base en el HS 5 para «dejar prevista una conexión» del local? | **No hay base** → **CRITERIO** | El HS 5 no contiene ninguna exigencia de previsión para locales sin uso. Es un criterio de proyecto, no una exigencia | ap. 1.1 pto 1: «Esta Sección se aplica a la instalación de evacuación de aguas residuales y pluviales en los edificios incluidos en el ámbito de aplicación general del CTE. Las ampliaciones, modificaciones, reformas o rehabilitaciones de las instalaciones existentes se consideran incluidas cuando se amplía el número o la capacidad de los aparatos receptores existentes en la instalación.» | [HS22] [HS09] [DccHS] |
| G1b | Comentario del Ministerio «local sin uso = obra inacabada» | **NO VERIFICABLE** | No está en los comentarios a HS 5 (leídos todos). Los comentarios a la Parte I del CTE no se han leído | — | [DccHS] |
| G1c | Lo más parecido en el DB-HS | VERIFICADO (es HS 4, no HS 5) | Solo para el suministro de agua: «Las acometidas que no sean utilizadas inmediatamente tras su terminación o que estén paradas temporalmente, deben cerrarse en la conducción de abastecimiento. Las acometidas que no se utilicen durante 1 año deben ser taponadas.» | DB-HS 4, ap. 7.1 pto 2 | [DcmHS] |

**Nota G1 — redacción propuesta para la ficha.** «Se deja prevista una conexión de saneamiento para el local (criterio de proyecto; el DB-HS 5 no lo exige). El acondicionamiento futuro del local deberá justificar el HS 5 cuando se instalen aparatos receptores (DB-HS 5, ap. 1.1).»

Las UD del local no se suman al dimensionado, salvo que el proyectista lo decida como reserva. Si lo hace, etiquetarlo como criterio.

---

## Cifras que SÍ se pueden mostrar en la UI, con su cita

- Tabla 4.6 (sumideros por superficie de cubierta). Para S ≥ 500, ⌈S/150⌉ etiquetado como criterio de redondeo.
- Tabla 4.7 (canalones) y factor 1,10 para sección cuadrangular. Pendiente mínima: 0,5 % (HS 5) y 1 % (HS 1, cubiertas inclinadas).
- Tabla 4.8 (bajantes pluviales).
- Tabla 4.9 (colectores pluviales). La celda Ø315 / 1 % = 2.016, con aviso de probable errata.
- Ap. 4.3 (superficie equivalente del mixto: 90 m² hasta 250 UD; 0,36 × UD por encima).
- Factor f = i / 100, citando 4.2.2 pto 2, 4.2.3 pto 2 y 4.3 párrafo 3. En la Tabla 4.9, con la etiqueta «criterio».
- Tabla B.1 completa (isoyetas 10–120, zonas A y B).
- Tabla 4.13 (arquetas). La correspondencia con Ø de PVC, etiquetada como criterio.
- Pendientes mínimas 1 % (colgado) y 2 % (enterrado). Registros cada ≤ 15 m. Separación de 3 m entre pluvial y residual en colector colgado mixto. Máx. 2 colectores en un punto. Arqueta de paso con máx. 3. Pozo de resalto si el desnivel es > 1 m.
- Bombeo: ≥ 2 bombas; alternancia; batería ≥ 24 h; ≤ 12 arranques/h; Vu > ½ de la aportación diaria; Qb ≥ 1,25 × Q de aportación; ventilación ≥ ½ Ø de la acometida y ≥ 80 mm; depósito con 10 cm / 20 cm / 1 m / 25 %.
- Separador de grasas en garajes (3.3.1.5 pto 2 e) y prohibición de grasas en el pozo de bombeo (3.3.2.1 pto 4).
- Sumidero sifónico de la Tabla 4.1 (1 UD / Ø40 en uso privado; 3 UD / Ø50 en público), con la elección de uso como criterio.
- Ventilación secundaria: Tabla 4.10 + ½ Ø; Tabla 4.11; umbrales de 7, 11, 14 y 15 plantas; 5 m de ramal.

## Cifras que NO deben mostrarse todavía

- **Intensidad pluviométrica de Cáceres (o de cualquier municipio) como «valor del DB».** No hay lista oficial y la Figura B.1 no se puede leer con certeza. Debe entrar como input del proyectista. Como mucho, 125 mm/h con la etiqueta «envolvente por criterio».
- **Vu de la fórmula 4.2 por sí sola.** Es incoherente en unidades. Mostrarla solo junto a la condición del pto 3 y con aviso.
- **«Ø55»** como Ø de una columna de ventilación.
- **«UD por ramal = UD / plantas»** como si fuera el dato de la Tabla 4.4.
- **Bajante de Ø90 con inodoros.**

## Procedencia sugerida para `shared/tablas`

| Tabla | db | edicion | fecha | articulo | tabla | fuente |
|---|---|---|---|---|---|---|
| Sumideros de cubierta | DB-HS5 | Consolidado 14-06-2022 (tablas sin cambios desde 23-09-2009) | 2022-06-14 | ap. 4.2.1 pto 2 | Tabla 4.6 | codigotecnico.org · DBHS.pdf, Sección HS 5 |
| Canalones | ídem | ídem | 2022-06-14 | ap. 4.2.2 ptos 1 y 3 | Tabla 4.7 | ídem |
| Factor de intensidad | ídem | ídem | 2022-06-14 | ap. 4.2.2 pto 2 (fórm. 4.1); 4.2.3 pto 2; 4.3 párr. 3 | — | ídem |
| Bajantes pluviales | ídem | ídem | 2022-06-14 | ap. 4.2.3 pto 1 | Tabla 4.8 | ídem |
| Colectores pluviales | ídem | ídem | 2022-06-14 | ap. 4.2.4 pto 2 | Tabla 4.9 | ídem |
| Colectores mixtos | ídem | ídem | 2022-06-14 | ap. 4.3 ptos 1 y 2 | — | ídem |
| Intensidad pluviométrica | ídem | ídem | 2022-06-14 | Apéndice B pto 1 | Tabla B.1 | ídem |
| Arquetas | ídem | ídem | 2022-06-14 | ap. 4.5 pto 1 | Tabla 4.13 | ídem |
| Bombeo y elevación | ídem | ídem | 2022-06-14 | ap. 3.3.2.1; 4.6; 5.5 | — | ídem |
| Configuración frente al alcantarillado | ídem | ídem | 2022-06-14 | ap. 3.1 y 3.2 | — | ídem |
| Red horizontal (pendientes, registros) | ídem | ídem | 2022-06-14 | ap. 3.3.1.4; 3.3.1.5; 5.4.1 | — | ídem |
| Separador de grasas | ídem | ídem | 2022-06-14 | ap. 3.3.1.5 pto 2 e); 5.4.5.3; 7 pto 6 | — | ídem |
| Rebosaderos de cubierta | DB-HS1 | Consolidado 14-06-2022 | 2022-06-14 | ap. 2.4.4.1.5 | — | ídem, Sección HS 1 |

## Pendientes

1. **Figura B.1 legible.** Buscar el mapa en el BOE de 28/03/2006 (RD 314/2006) o en una fuente cartográfica oficial. Mientras tanto, i es input del proyectista.
2. **BOE originales.**
   - Cotejar la celda Ø315 / 1 % de la Tabla 4.9 (2.016).
   - Cotejar la fórmula 4.2 (Vu = 0,3 Qb).
   - Identificar la disposición que actualizó las referencias UNE del HS 5 (F1b).
3. **Comentarios a la Parte I del CTE**, para el supuesto comentario «local sin uso = obra inacabada» (G1b).
4. **Decisiones de criterio que el responsable del proyecto debe validar:**
   - envolvente en la Tabla 4.4 (D1);
   - uso público del sumidero de garaje (C4b);
   - columna de la Tabla 4.13 para Ø de PVC (B4b);
   - f en la Tabla 4.9 (A3b);
   - definición de «sobredimensionada» (E2e).

---

## Para el código

Propuesta de datos para `src/modules/hs5/tablas.ts`, siguiendo el patrón `tablaCTE(procedencia, datos)` de `src/lib/cte/tabla.ts`. No está aplicada. Todos los valores salen de [HS22] y se han cotejado con [HS09] y [DccHS].

**Sobre la procedencia común.**
- Se propone sustituir el `PROC_HS5` actual.
- Si los tests del anejo o de la ficha comprueban la cadena `edicion`, habrá que actualizarlos.
- Los criterios de proyecto van **aparte**, en un objeto que no es `tablaCTE`, para que la ficha no los cite como CTE.

```ts
import { tablaCTE } from "../../lib/cte/tabla";

/** HS 5 vigente: texto consolidado 14-06-2022. Articulado y tablas sin cambios
 *  desde la versión de 23-09-2009 (solo cambian las referencias UNE de 6.2 y del Apéndice C). */
const PROC_HS5 = {
  db: "DB-HS5",
  edicion: "Consolidado 14-06-2022 (tablas sin cambios desde 23-09-2009)",
  fecha: "2022-06-14",
  fuente: "codigotecnico.org · DBHS.pdf, Sección HS 5",
} as const;

// ---- Pluviales ---------------------------------------------------------------

/** Tabla 4.6. S = superficie de cubierta en proyección horizontal [m²]. */
export const SUMIDEROS_CUBIERTA_TABLA_4_6 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.2.1 pto 2", tabla: "Tabla 4.6" },
  {
    /** Tramos [desde, hasta) → nº mínimo de sumideros. */
    tramos: [
      { desde_m2: 0, hasta_m2: 100, sumiderosMin: 2 },
      { desde_m2: 100, hasta_m2: 200, sumiderosMin: 3 },
      { desde_m2: 200, hasta_m2: 500, sumiderosMin: 4 },
    ],
    /** «S > 500 → 1 cada 150 m²». S = 500 exacto no lo cubre el DB; el redondeo es criterio. */
    umbralPorSuperficie_m2: 500,
    superficiePorSumidero_m2: 150,
    /** ap. 4.2.1 pto 3: desnivel máximo entre puntos de recogida. */
    desnivelMax_mm: 150,
    /** ap. 4.2.1 pto 1: filtro de la caldereta entre 1,5 y 2 veces la sección de la tubería. */
    filtroCalderetaMin_xSeccion: 1.5,
    filtroCalderetaMax_xSeccion: 2,
  } as const,
);

/** ap. 5.1.3: ejecución de calderetas y sumideros sifónicos. */
export const PUNTOS_CAPTACION_PLUVIALES = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 5.1.3 ptos 1, 3 y 5" },
  {
    bocaCalderetaMin_xSeccionBajante: 1.5, // «como mínimo un 50 % mayor»
    profundidadCalderetaMin_cm: 15,
    solapeCalderetaMin_cm: 5,
    sumideroADistanciaBajanteMax_m: 5,
    hormigonPendienteMax_cm: 15,
    /** «Su diámetro será superior a 1,5 veces el diámetro de la bajante» (desigualdad estricta). */
    diametroSumideroMin_xBajante: 1.5,
  } as const,
);

/** Tabla 4.7: superficie máxima [m²] por pendiente del canalón, a 100 mm/h. */
export interface FilaCanalon4_7 {
  readonly diametro_mm: number;
  readonly p0_5: number;
  readonly p1: number;
  readonly p2: number;
  readonly p4: number;
}
export const CANALONES_TABLA_4_7 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.2.2 ptos 1 y 3; ap. 5.1.4", tabla: "Tabla 4.7" },
  {
    intensidadReferencia_mm_h: 100,
    filas: [
      { diametro_mm: 100, p0_5: 35, p1: 45, p2: 65, p4: 95 },
      { diametro_mm: 125, p0_5: 60, p1: 80, p2: 115, p4: 165 },
      { diametro_mm: 150, p0_5: 90, p1: 125, p2: 175, p4: 255 },
      { diametro_mm: 200, p0_5: 185, p1: 260, p2: 370, p4: 520 },
      { diametro_mm: 250, p0_5: 335, p1: 475, p2: 670, p4: 930 },
    ] satisfies readonly FilaCanalon4_7[],
    /** ap. 4.2.2 pto 3: sección cuadrangular ≥ 1,10 × sección semicircular. */
    factorSeccionCuadrangular: 1.1,
    /** ap. 5.1.4 ptos 1 y 3 (HS 5). En cubierta inclinada, HS 1 2.4.4.2.9 exige 1 %. */
    pendienteMin_pct: 0.5,
    pendienteMinPlastico_pct: 0.16,
  } as const,
);

/** Fórmula 4.1: superficie de cálculo = superficie × i / 100. */
export const FACTOR_INTENSIDAD = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.2.2 pto 2 (fórm. 4.1); 4.2.3 pto 2; 4.3 párr. 3" },
  {
    intensidadReferencia_mm_h: 100,
    /** Literal en el DB para estas tablas: */
    aplicaLiteral: ["Tabla 4.7", "Tabla 4.8", "ap. 4.3 superficie equivalente"],
    /** No literal (4.2.4 no menciona f); se aplica por criterio, porque la tabla está referida a 100 mm/h. */
    aplicaPorCriterio: ["Tabla 4.9"],
  } as const,
);

/** Tabla 4.8: superficie máxima servida [m²] → Ø nominal de la bajante, a 100 mm/h. */
export const BAJANTES_PLUVIALES_TABLA_4_8 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.2.3 pto 1", tabla: "Tabla 4.8" },
  {
    intensidadReferencia_mm_h: 100,
    filas: [
      { diametro_mm: 50, superficieMax_m2: 65 },
      { diametro_mm: 63, superficieMax_m2: 113 },
      { diametro_mm: 75, superficieMax_m2: 177 },
      { diametro_mm: 90, superficieMax_m2: 318 },
      { diametro_mm: 110, superficieMax_m2: 580 },
      { diametro_mm: 125, superficieMax_m2: 805 },
      { diametro_mm: 160, superficieMax_m2: 1544 },
      { diametro_mm: 200, superficieMax_m2: 2700 },
    ],
  } as const,
);

/** Tabla 4.9: colectores pluviales a sección llena. Reutiliza `FilaPendiente`
 *  (p1/p2/p4), pero aquí los valores son SUPERFICIE [m²] a 100 mm/h, no UD. */
export const COLECTORES_PLUVIALES_TABLA_4_9 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.2.4 ptos 1 y 2", tabla: "Tabla 4.9" },
  {
    intensidadReferencia_mm_h: 100,
    filas: [
      { diametro_mm: 90, p1: 125, p2: 178, p4: 253 },
      { diametro_mm: 110, p1: 229, p2: 323, p4: 458 },
      { diametro_mm: 125, p1: 310, p2: 440, p4: 620 },
      { diametro_mm: 160, p1: 614, p2: 862, p4: 1228 },
      { diametro_mm: 200, p1: 1070, p2: 1510, p4: 2140 },
      { diametro_mm: 250, p1: 1920, p2: 2710, p4: 3850 },
      // Ø315 a 1 %: 2.016 literal en 2009, 2022 y comentarios 2025. Probable errata
      // (≈3.250 por proporción). Se usa el literal, que queda del lado de la seguridad,
      // y el motor debe emitir un aviso cuando se use esta celda.
      { diametro_mm: 315, p1: 2016, p2: 4589, p4: 6500 },
    ] satisfies readonly FilaPendiente[],
  } as const,
);

/** ap. 4.3: UD → superficie equivalente [m²] a 100 mm/h (luego × f). */
export const COLECTORES_MIXTOS_4_3 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.3 ptos 1 y 2" },
  {
    udUmbral: 250,
    superficieHastaUmbral_m2: 90, // UD ≤ 250
    superficiePorUDSobreUmbral_m2: 0.36, // UD > 250 → 0,36 × UD
  } as const,
);

/** Tabla B.1: i [mm/h] por isoyeta y zona. Isoyeta y zona se leen en la Figura B.1:
 *  son input del proyectista, porque no hay relación oficial por municipio. */
export const INTENSIDAD_PLUVIOMETRICA_TABLA_B_1 = tablaCTE(
  { ...PROC_HS5, articulo: "Apéndice B pto 1", tabla: "Tabla B.1" },
  {
    isoyetas: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
    zonaA_mm_h: [30, 65, 90, 125, 155, 180, 210, 240, 275, 300, 330, 365],
    zonaB_mm_h: [30, 50, 70, 90, 110, 135, 150, 170, 195, 220, 240, 265],
  } as const,
);

// ---- Red horizontal y alcantarillado ------------------------------------------

/** ap. 3.1 y 3.2: configuración según la red pública. */
export const CONFIGURACION_ALCANTARILLADO = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 3.1 pto 2; ap. 3.2 ptos 1 y 2" },
  {
    unica: {
      sistemasAdmitidos: ["mixto", "separativo_con_conexion_final"],
      /** En los puntos de captación (sumideros sifónicos) o con un sifón final en la conexión. */
      cierreHidraulicoEntreRedes: true,
    },
    doble: { sistema: "separativo", conexionesIndependientes: true },
    sinRed: { residuales: "depuradora_particular", pluviales: "al_terreno" },
  } as const,
);

/** ap. 3.3.1.4, 3.3.1.5, 3.3.2.2 y 5.4.1. Las pendientes mínimas ya están en COLECTORES_TABLA_4_5. */
export const RED_HORIZONTAL = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 3.3.1.4; 3.3.1.5; 3.3.2.2; 5.4.1" },
  {
    distanciaMaxEntreRegistros_m: 15,
    maxColectoresMismoPuntoColgado: 2,
    maxColectoresArquetaPaso: 3,
    separacionBajantePluvialMixto_m: 3,
    entronqueLibreConexiones_m: 1,
    desnivelPozoResalto_m: 1, // si el desnivel es > 1 m
    arquetaPieBajanteSifonica: false,
    antirretornoSeguridad: "doble_clapeta_cierre_manual_en_mixtos",
  } as const,
);

/** Tabla 4.13: Ø del colector de salida [mm] → L × A mínimas [cm]. */
export const ARQUETAS_TABLA_4_13 = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 4.5 pto 1", tabla: "Tabla 4.13" },
  {
    filas: [
      { diametroSalida_mm: 100, l_cm: 40, a_cm: 40 },
      { diametroSalida_mm: 150, l_cm: 50, a_cm: 50 },
      { diametroSalida_mm: 200, l_cm: 60, a_cm: 60 },
      { diametroSalida_mm: 250, l_cm: 60, a_cm: 70 },
      { diametroSalida_mm: 300, l_cm: 70, a_cm: 70 },
      { diametroSalida_mm: 350, l_cm: 70, a_cm: 80 },
      { diametroSalida_mm: 400, l_cm: 80, a_cm: 80 },
      { diametroSalida_mm: 450, l_cm: 80, a_cm: 90 },
      { diametroSalida_mm: 500, l_cm: 90, a_cm: 90 },
    ],
  } as const,
);

// ---- Garaje ----------------------------------------------------------------------

/** ap. 3.3.2.1, 4.6, 5.5: bombeo y elevación. */
export const BOMBEO_ELEVACION = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 3.3.2.1; 4.6.1; 4.6.2; 5.5.1; 5.5.2" },
  {
    bombasMin: 2,
    alternanciaSecuencial: true,
    autonomiaElectricaMin_h: 24,
    arranquesMaxHora: 12,
    /** Fórmula 4.2 literal: Vu [dm³] = 0,3 · Qb [dm³/s]. Incoherente en unidades:
     *  no usarla sola, porque prevalece fraccionAportacionDiariaMin. */
    coefVolumenUtilLiteral: 0.3,
    fraccionAportacionDiariaMin: 0.5, // Vu > ½ de la aportación media diaria
    caudalBombaMin_xAportacion: 1.25, // todas las bombas iguales
    ventilacionMin_xDiametroAcometida: 0.5,
    ventilacionMin_mm: 80,
    resguardoNivelMaxAcometida_cm: 10,
    resguardoNivelMinFondo_cm: 20,
    alturaDepositoMin_m: 1,
    pendienteFondoMin_pct: 25,
    fosaSecaHolguraMin_mm: 600,
    fosaSecaSumideroMin_mm: 100,
    fosaSecaIluminacionMin_lux: 200,
    descargaPorGravedadAColector: true,
    descargaABajantePermitida: false,
    valvulasAireacionEnDescarga: false,
    bucleAntirreflujo: true,
    grasasOAceitesEnPozo: false,
    pluvialesAdmitidas: ["patios_interiores_bajo_cota", "rampas_garaje_bajo_cota"],
  } as const,
);

/** ap. 3.3.1.5 pto 2 e), 5.4.5.1 pto 2, 5.4.5.3 y 7 pto 6. */
export const SEPARADOR_GRASAS = tablaCTE(
  { ...PROC_HS5, articulo: "ap. 3.3.1.5 pto 2 e); 5.4.5.1 pto 2; 5.4.5.3; 7 pto 6" },
  {
    ejemplosLiterales: ["restaurantes", "garajes"],
    /** Obligatorio antes del pozo si el agua del garaje se bombea (3.3.2.1 pto 4). */
    obligatorioAntesDeBombeo: true,
    desagueArquetaRampaMin_mm: 110,
    ventilacionTubo_mm: 100,
    pendienteEvacuacionMin_pct: 3,
    limpiezaCada_meses: 6,
  } as const,
);

// ---- HS 1 (cubiertas) --------------------------------------------------------------

export const REBOSADEROS_CUBIERTA_HS1 = tablaCTE(
  {
    db: "DB-HS1",
    edicion: "Consolidado 14-06-2022",
    fecha: "2022-06-14",
    articulo: "ap. 2.4.4.1.5 ptos 1, 2 y 4; ap. 2.4.4.1.4 pto 6; ap. 2.4.4.2.9 pto 2",
    fuente: "codigotecnico.org · DBHS.pdf, Sección HS 1",
  },
  {
    /** En cubierta plana con paramento perimetral: obligatorio con una sola bajante, entre otros casos. */
    obligatorioConUnaBajante: true,
    areaRebosaderosMin_xAreaBajantes: 1,
    vuelaMin_cm: 5,
    sumideroADistanciaParamentoMin_cm: 50,
    pendienteMinCanalonCubiertaInclinada_pct: 1,
  } as const,
);

// ---- Criterios de proyecto (NO son CTE: la ficha debe rotularlos así) -------------

export const CRITERIOS_PROYECTO_HS5 = {
  origen: "criterio de proyecto (no exigencia CTE)",
  sumiderosCubiertaRedondeo: "ceil", // Tabla 4.6, S ≥ 500 → ⌈S/150⌉
  factorIntensidadEnTabla4_9: true, // A3b
  tablasSinInterpolar: "pendiente igual o inferior; escalón de UD superior; isoyeta superior",
  arquetaColumnaPorDiametro: "primera >= Ø nominal", // 90 → 100; 110 y 125 → 150; 160 → 200
  bajantesTabla4_4: "envolvente de ambas columnas; dato = plantas atravesadas por la bajante", // D1
  udRamalTabla4_4: "ramal más cargado medido; si no se conoce, UD de la planta", // D2
  usoSumideroGaraje: "publico", // 3 UD, Ø50 (C4b)
  ventPrimariaRamalMenor5mEnAmbosCasos: true, // E2
  bajanteSobredimensionada: "un escalón de Ø por encima del exigido por la Tabla 4.4", // E2e
  intensidadPorDefectoCaceres_mm_h: 125, // envolvente A-40, pendiente de lectura (A6e)
  previsionLocalSinUso: "conexión prevista; UD no computadas salvo decisión expresa", // G1
} as const;
```

**Procedimiento para la ventilación secundaria con plantas alternas (no requiere tabla nueva).** Usa `VENT_SECUNDARIA_ALTERNAS_TABLA_4_10` y `VENT_SECUNDARIA` (`fraccionMinDiametroBajante: 0.5`), que ya existen.

```ts
// Ø columna = menor Ø de DIAMETROS_VENT_4_10 tal que:
//   (1) existe celda en la fila (Ø bajante, primer udEscalon ≥ UD bajante),
//   (2) longitudMax_m[Ø] ≥ longitud real de la columna,
//   (3) Ø ≥ 0,5 × Ø bajante.
// Si no hay ninguno: fuera de tabla y aviso. Nunca devolver 0,5 × Ø bajante como Ø.
```
