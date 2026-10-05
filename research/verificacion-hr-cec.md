# Verificación normativa: soluciones del Catálogo de Elementos Constructivos (CEC) para el módulo HR (DB-HR, opción simplificada)

**Fecha:** 2026-10-05 · Agente: cte-normativa · **No se ha editado código.**
**Ámbito:** elegir y leer en imagen las soluciones del CEC que la app ofrecerá como desplegables en el módulo HR, con sus valores acústicos (m, RA, RA,tr, ΔRA, ΔLw), y cruzarlas con el parámetro que pide cada tabla del DB-HR (tablas 3.1, 3.2, 3.3 y 3.4). Puntos 1 a 9 del encargo, en ese orden.

**Regla aplicada:** VERIFICADO solo si el valor se ha leído en la **imagen** de la página (PNG a 200 ppp, ya renderizados). Lo que solo se ha leído en el texto extraído se marca «(texto)». Veredictos:
- **VERIFICADO**: valor o literal leído en la imagen del CEC o del DB-HR.
- **LEÍDO (texto)**: leído en el texto extraído del PDF, no en la imagen. Cotejar antes de citar.
- **PENDIENTE**: página no renderizada o texto desordenado. No se da el valor.
- **INTERPRETACIÓN**: se sigue del CEC o del DB, pero no lo escriben tal cual.
- **ARITMÉTICA**: valor calculado aquí con una regla que sí está escrita (se dice cuál).
- **NO LO DA EL CEC / NO LO FIJA EL DB → CRITERIO**: decisión de producto. No es exigencia del CTE y la ficha la rotula así.
- **DESCARTADO**: solución sombreada en gris (sin datos) o que no sirve para la opción simplificada.

---

## 0. Fuentes y ediciones

| Clave | Documento | Edición | Fuente | Lectura |
|---|---|---|---|---|
| [CEC] | Catálogo de Elementos Constructivos del CTE. Redacción: IETcc con CEPCO y AICIA | **«Versión preliminar: Marzo 10. Borrador»**, archivo CAT-EC-v6.3 (marzo 2010) | codigotecnico.org/pdf/Programas/CEC/CAT-EC-v06.3_marzo_10.pdf (copia en el scratchpad de la sesión, `CEC.pdf`) | Imagen: pp. 26, 27, 29, 30, 31 (3.17, 3.18); 37, 38 (4.1.1, 4.1.2); 54–61, 63–68 (4.2.1 a 4.2.6); 97–99 (4.3.2, 4.3.3); 100–113 (4.4); 114–119 (4.5). Texto: p. 3 (preámbulo), p. 45 (4.1.9), p. 76 (4.2.8) |
| [HR] | CTE DB-HR «Protección frente al ruido», consolidado | Articulado RD 1371/2007 (BOE 23/10/2007); corr. err. BOE 20/12/2007; RD 1675/2008 (BOE 18/10/2008); Orden VIV/984/2009 (BOE 23/04/2009) y su corr. err. (BOE 23/09/2009); RD 732/2019 (BOE 27/12/2019). «Este texto consolidado no tiene valor jurídico» | `research/pdf/DBHR.pdf` | Imagen: pp. 13 (HR-7), 14 (HR-8, tabla 3.1), 15 (HR-9), 16 (HR-10), 17 (HR-11, tabla 3.2), 18 (HR-12), 20 (HR-14, tabla 3.3), 22 (HR-16), 23 (HR-17, tabla 3.4). Texto: Anejo A (A.15, A.16), Anejo G (G.1, G.2) |

**Naturaleza del CEC (avisos que la ficha debe llevar):**
1. **No es reglamentario.** Preámbulo (texto, p. 3): «Este documento no tiene carácter reglamentario, por lo que el proyectista podrá utilizar cualquier solución constructiva no contemplada en él, siempre que justifique el cumplimiento de las exigencias establecidas en el CTE.» LEÍDO (texto).
2. **Garantía legal solo para soluciones hechas en obra.** Preámbulo (texto, p. 3): «Los valores que el Catálogo asigna a soluciones constructivas que no se fabrican industrialmente sino que se generan en la obra tienen garantía legal en cuanto a su aplicación en los proyectos, mientras que para los productos de construcción fabricados industrialmente dichos valores tienen únicamente carácter genérico y orientativo.» LEÍDO (texto). Consecuencia: los valores de **fábricas, hormigón, forjados hormigonados y morteros** tienen esa garantía; los de **placa de yeso laminado, lanas minerales, láminas de polietileno, EEPS, ventanas y capialzados** son **orientativos** (los da el fabricante).
3. **Es un borrador** («Versión preliminar: Marzo 10. Borrador», portada; VERIFICADO en texto, p. 1). Es la versión publicada en codigotecnico.org a fecha de hoy; no hay versión definitiva posterior localizada en esta sesión.
4. **Mínimo y medio.** Preámbulo (texto, p. 3): «el Catálogo incluye en la mayoría de los casos valores mínimos y medios. Los valores mínimos son valores conservadores que se garantizan en todos los casos, y los valores medios son aquellos que tienen en cuenta la dispersión de la producción de un mismo producto.» Cómo se distinguen en las tablas: bloque 0.1.
5. **Gris = sin datos.** Preámbulo (texto, p. 3): «Las soluciones sombreadas en gris son soluciones de las que no se disponen datos.»

### 0.1 Notación de corchetes y paréntesis: no significa siempre lo mismo

**VERIFICADO** en las notas de cada tabla. El motor no puede tratar «[x]» de forma uniforme:

| Dónde | «x [y]» o «x (y)» significa | Nota y página |
|---|---|---|
| 4.4.1.1, 4.4.1.2, 4.4.2 (particiones de fábrica cerámica) | x = **mínimo**; [y] = **medio** («que tiene en cuenta la amplitud de los productos existentes en el mercado») | 4.4.1.1 nota (8), p. 105; 4.4.1.2 nota (6), p. 107; 4.4.2 nota (3), p. 110 |
| 4.2.x fachadas de fábrica de ladrillo | x = **mínimo**; [y] = **medio**, en m, RA y RA,tr | 4.2.1 nota (6), p. 56; 4.2.3 nota (4), p. 63; 4.2.4 nota (2), p. 65 |
| Bloque de picón (P1.18–P1.22, P3.4, F x.8/x.9/x.38) | x = densidad 1 800 kg/m³; [y] = densidad **1 500 kg/m³** | 4.4.1.1 nota (13), p. 105; 4.2.4 nota (7), p. 65 |
| 4.4.1.3 trasdosados | ΔRA [m] = mejora del trasdosado [**masa del elemento base** sobre el que se aplica] | nota (4), p. 108 |
| 4.5.1 suelos flotantes | ΔRA [m] = mejora [**masa máxima** del forjado o losa sobre el que se aplica] | nota (9), p. 117 |
| 3.18.1 y 3.18.2 forjados con piezas de hormigón de áridos ligeros | (y) = piezas de densidad **ρ ≤ 1 200 kg/m³** | 3.18.1 nota (3), p. 29; 3.18.2 nota (3), p. 31 |
| 4.2.6 fachada con revestimiento discontinuo | (y) = aplacado **pegado**; sin paréntesis = fijado mecánicamente | 4.2.6 nota (5) (texto, p. 69) |
| 4.3.2 ventanas | 4–(6…20)–6: (…) = **rango de cámara** en mm | 4.3.2.1 nota (4), p. 97 |

**Hormigón y bloque de hormigón no tienen par mínimo/medio** (un solo valor; VERIFICADO pp. 103, 105, 106).

**Correcciones o matices al encargo (resumen; el detalle va en cada bloque):**
1. El CEC **sí da RA de los forjados directamente** (3.18, también RA,tr y Ln,w). No hace falta aplicar la ley de masa del Anejo A. Además, los RA del CEC coinciden con A.16 redondeada (B4.6), así que el motor puede usar A.15/A.16 para forjados que no estén en el catálogo sin incoherencias. (Bloque D)
2. La m del forjado del CEC **incluye la capa de compresión de 50 mm** y **excluye vigas** (unidireccional) o **ábacos** (reticular), como pide el DB-HR. (D.2)
3. **LH de gran formato con apoyo directo no cumple la tabla 3.1**: RA = 33 [34] < 35 dBA. Solo vale con bandas elásticas (65/33). (A.3)
4. **El CEC no tiene 2×15+48+48+2×15.** Las de dos montantes con 2×15 son de 70 mm (P4.8 y P4.9). La de 48 mm es P4.6 con 2×12,5: **RA = 55 dBA con perfiles arriostrados**, **62 dBA no arriostrados**; con 55 **no llega** a los 58 dBA del tipo 3. (B.6)
5. **Tipo 2 LHD + LHD con bandas en ambas hojas (P3.1): con el valor mínimo (RA 53) no cumple** la fila 130/54 de la tabla 3.2; con el medio (55) sí. La elección mínimo/medio cambia el veredicto. (B.5, K-CEC.1)
6. **Hormigón armado:** el CEC tiene 12, 16 y 20 cm (no 15). Valores para **hormigón visto**; con enlucido de 15 mm por ambas caras, m + 15 kg/m². (B.2)
7. **Fachadas: el CEC da m, RA y RA,tr del conjunto**, no de la hoja principal ni de la interior. Las condiciones de flancos de la tabla 3.2 (pto 7) y de la nota (6) de la tabla 3.3 piden m y RA **de una hoja**. Eso no lo da el CEC → CRITERIO. (G.3)
8. **Ventanas:** el CEC no tiene «laminar acústico» (su laminar es con butiral de 0,36 mm, estándar), y las filas 3+3 y 4+4 están en gris. Tampoco distingue 4/12/6 de 6/12/4. (I.2, I.3)
9. **Capialzado:** el CEC da solo un mínimo de RA,tr de la caja (≥ 25 o ≥ 30 dBA). La tabla de ventanas vale para «VENTANA sin capialzado o capialzado por el exterior». El conjunto ventana + caja se compone con el **Anejo G del DB-HR** (G.1); aplicarlo a RA,tr es CRITERIO. (I.5, I.6)
10. **Fachada ventilada con aplacado sobre ½ pie (4.2.8, F 8.x)**: p. 76 no renderizada y texto desordenado → PENDIENTE. (G.6)

---

## Bloque A — Tabiquería (DB-HR tabla 3.1) — punto 1 del encargo

**Qué pide el DB (VERIFICADO, HR p. 14, HR-8, tabla 3.1):** m (kg/m²) y RA (dBA) mínimos por tipo: **fábrica o paneles prefabricados pesados con apoyo directo 70 / 35**; **con bandas elásticas 65 / 33**; **entramado autoportante 25 / 43**. La m del DB-HR es del elemento base (3.1.2.3.2 a i, p. 14).

| # | Código CEC | Descripción | m (kg/m²) mín [medio] | RA (dBA) mín [medio] | Tipo y veredicto con el mínimo | Veredicto | Página |
|---|---|---|---|---|---|---|---|
| A.1 | P1.1 | LHD (LH pequeño formato) 7 cm + guarnecido y enlucido de yeso 1,5 cm por ambas caras | 89 [97] | 36 [37] | Fábrica con apoyo directo: 89 ≥ 70 y 36 ≥ 35. **CUMPLE** (también con bandas) | VERIFICADO | CEC p. 101 (PIV 2) |
| A.2 | P1.2 | Ladrillo hueco de gran formato 7 cm + yeso 1,5 cm por ambas caras | 70 [80] | 33 [34] | Apoyo directo: m 70 ≥ 70, pero **RA 33 < 35: NO CUMPLE** (ni con el medio, 34). **Con bandas elásticas** (65/33): **CUMPLE** | VERIFICADO | CEC p. 101 |
| A.3 | Nota (9) de P1.1 y P1.2 | «Los valores de RA que figuran en la tabla se aplican también a particiones con bandas elásticas dispuestas en su perímetro.» → el mismo RA vale con bandas | — | — | Permite usar P1.2 como tabiquería con bandas | VERIFICADO | CEC p. 105 |
| A.4 | Nota (1) de 4.4.1.1 | «Los valores expresados en la tabla para las particiones de ladrillo hueco de gran formato son aplicables a los paneles prefabricados de cerámica y yeso» | — | — | P1.2 cubre también los paneles cerámica-yeso | VERIFICADO | CEC p. 105 |
| A.5 | P4.1 | PYL 15 + montante 48 con lana mineral + PYL 15 (una placa por cara) | 26 | 43 | Entramado autoportante: 26 ≥ 25 y 43 ≥ 43. **CUMPLE** (justo) | VERIFICADO | CEC p. 111 (PIV 12) |
| A.6 | P4.1, nota (2) | Con **guata o fieltro de poliéster** en la cámara: RA = **40** → **NO CUMPLE** (< 43). La app debe pedir lana mineral | 26 | 40 | — | VERIFICADO | CEC pp. 111, 112 |
| A.7 | P4.2 | 2×PYL 12,5 + montante 48 con lana mineral + 2×PYL 12,5 | 44 | 52 | **CUMPLE** | VERIFICADO | CEC p. 111 |
| A.8 | P4.3 | PYL 15 + montante 70 con lana mineral + PYL 15 | 26 | 47 | **CUMPLE** | VERIFICADO | CEC p. 111 |
| A.9 | Nota (1) de 4.4.3 | m de entramado: «Los valores de m expresados en la tabla incluyen la perfilería y la tornillería» | — | — | — | VERIFICADO | CEC p. 112 |
| A.10 | Nota (8) de 4.4.1.1 | m y RA son **con enlucido por ambas caras**. Sin enlucir: **m − 30 kg/m²** y **RA − 2 dBA** | — | — | P1.1 sin enlucir: 59 / 34 → no cumple. La app no debe ofrecer tabiques sin revestir | VERIFICADO | CEC p. 105 |
| A.11 | Lana mineral (4.4.3) | «aislante: lana mineral de resistividad al flujo del aire, r ≥ 5 kPa·s/m²» | — | — | Condición del producto, a rotular | VERIFICADO | CEC p. 111 |
| A.12 | 4.4.4 entramado de madera P5.2–P5.4 | RA **en gris** | — | — | **DESCARTADO** | VERIFICADO | CEC p. 113 |

**Frase de memoria:** «Tabiquería de fábrica con apoyo directo: tabique de ladrillo hueco doble de 7 cm guarnecido y enlucido de yeso por ambas caras (CEC P1.1), m = 89 kg/m² ≥ 70 kg/m² y RA = 36 dBA ≥ 35 dBA (DB-HR tabla 3.1). CUMPLE. Valores mínimos del Catálogo de Elementos Constructivos (CEC, versión preliminar marzo 2010, no reglamentario).»

---

## Bloque B — Elementos de separación vertical (DB-HR tabla 3.2) — punto 2 del encargo

**Qué pide el DB (VERIFICADO, HR p. 17, HR-11, tabla 3.2):**
- Tipo 1 (una o dos hojas de fábrica con trasdosado): pares m/RA del elemento base (67/33, 120/38, 150/41 (7), 180/45, 200/46, 250/51, 300/52, 300/55 (7), 350/55, 400/57) y ΔRA del trasdosado según la tabiquería (fábrica o entramado).
- Tipo 2 (dos hojas de fábrica con bandas elásticas perimétricas): 130/54 (5), 170/54 (5), (200)/(61) (6).
- Tipo 3 (entramado autoportante): 44/58 (12), (52)/(64) (9), (60)/(68) (10).
- Nota (1): «En el caso de elementos de separación verticales de dos hojas de fábrica, el valor de m corresponde al de la suma de las masas por unidad de superficie de las hojas y el valor de RA corresponde al del conjunto.» Nota (2): m y RA se cumplen **simultáneamente**. Nota (3): ΔRA es el de un trasdosado sobre un elemento base de masa **≥** la de la tabla.
- 3.1.2.3.4 pto 2 (VERIFICADO, HR p. 14): el trasdosado va **por ambas caras**; si solo por una, «incrementándose en 4 dBA la mejora ΔRA del trasdosado especificada en la tabla 3.2».
- 3.1.2.3.4 pto 5 (VERIFICADO, HR p. 15): con carácter general, la tabla 3.2 vale con forjados de **m ≥ 300 kg/m²**; con menos, solo con las condiciones de las notas.

### B.1 Tipo 1, elemento base de una hoja (4.4.1.1)

| # | Código CEC | Descripción | m mín [medio] | RA mín [medio] | Veredicto | Página |
|---|---|---|---|---|---|---|
| B.1.1 | P1.4 | LP ½ pie (11,5 cm) + guarnecido y enlucido de yeso 1,5 cm por ambas caras | 150 [161] | 42 [44] | VERIFICADO | CEC p. 101 |
| B.1.2 | P1.5 | LP 1 pie (24 cm) + yeso 1,5 cm por ambas caras | 284 [313] | 49 [50] | VERIFICADO | CEC p. 102 |
| B.1.3 | P1.14 (BH AD) | Bloque de hormigón de áridos densos 19 cm + enlucido 1,5 cm por ambas caras | 239 | 48 | VERIFICADO | CEC p. 103 |
| B.1.4 | P1.15 (BH AD) | Bloque de hormigón de áridos densos 24 cm + enlucido por ambas caras | 294 | 52 | VERIFICADO | CEC p. 103 |
| B.1.5 | P1.23 (H C) | Muro de hormigón armado 12 cm (visto) | 300 | 52 | VERIFICADO | CEC p. 105 |
| B.1.6 | P1.24 (H C) | Muro de hormigón armado 16 cm (visto) | 400 | 57 | VERIFICADO | CEC p. 105 |
| B.1.7 | P1.25 (H C) | Muro de hormigón armado 20 cm (visto) | 500 | 60 | VERIFICADO | CEC p. 105 |
| B.1.8 | Nota (12) de 4.4.1.1 | «Valores de RA y m válidos para muros de hormigón visto. Para muros de hormigón con un enlucido de 15 mm por ambas caras, se incrementará su m en 15 kg/m². En el caso de los muros de hormigón con áridos ligeros, se incrementará el RA en 1 dBA.» | — | — | VERIFICADO | CEC p. 105 |
| B.1.9 | Nota (2) de 4.4.1.1 | BH AD = densidad seca absoluta del material entre 1 700 y 2 400 kg/m³ | — | — | VERIFICADO | CEC p. 105 |
| B.1.10 | Hormigón 15 cm | **No está en el CEC** (12, 16 y 20 cm). **CORREGIDO** respecto al encargo. Para 15 cm: CRITERIO = ley de masa A.16 con m = 0,15·2 500 = 375 kg/m² (no se calcula aquí; K-CEC.6) | — | — | NO LO DA EL CEC → CRITERIO | — |

### B.2 Tipo 1, elemento base de dos hojas (4.4.1.2)

| # | Código CEC | Descripción | m mín [medio] (suma de hojas) | RA mín [medio] (conjunto) | Veredicto | Página |
|---|---|---|---|---|---|---|
| B.2.1 | P2.1 (LH PF) | LHD 7 + lana mineral ≥ 3 cm + LHD 7, yeso 1,5 cm por las caras exteriores | 130 [170] | 44 [45] | VERIFICADO | CEC p. 106 |
| B.2.2 | P2.3 | LP ½ pie + lana mineral ≥ 3 cm + LP ½ pie, yeso por las caras exteriores | 264 [358] | 47 [48] | VERIFICADO | CEC p. 106 |
| B.2.3 | Nota (7) de 4.4.1.2 | Todas las de 4.4.1.2 llevan la nota «Soluciones de particiones poco eficaces desde el punto de vista del aislamiento acústico» | — | — | VERIFICADO | CEC p. 107 |
| B.2.4 | Nota (4) | RA válido con la cámara rellena de lana mineral u otro absorbente de r ≥ 5 kPa·s/m² | — | — | VERIFICADO | CEC p. 107 |

### B.3 Trasdosados (4.4.1.3): ΔRA en función de la masa del elemento base

**VERIFICADO**, CEC p. 108 (PIV 9). Nota (4): «En la tabla aparecen parejas de valores en las que el primer valor corresponde al valor de ΔRA del trasdosado y el segundo valor, que figura entre corchetes, es la masa del elemento base sobre la que se aplica el trasdosado.»

| Código | Descripción | ΔRA [m elemento base, kg/m²] | Condición |
|---|---|---|---|
| TR1 | Trasdosado **autoportante**: separación 10 mm + montante con **lana mineral 50 mm** + **PYL 15** o **2×PYL 12,5** (mismo ΔRA en las dos variantes) | 17 [70] · 16 [100] · 15 [140] · 14 [160] · 13 [180] · 12 [200] · 10 [250] · 9 [300] · 8 [350] · 7 [400] | Lana o absorbente con r ≥ 5 kPa·s/m² (nota 1) |
| TR2 | Trasdosado **directo (adherido)**: lana mineral 30 mm + PYL 15 | 10 [70] · 9 [100] · 8 [140] · 7 [160] · 6 [180] · 5 [200] · 3 [250] · 2 [300] · 1 [350] · 0 [400] | Lana con rigidez dinámica **s' ≤ 9 MN/m³** (nota 1) |
| TR3 | Trasdosado **cerámico**: lana mineral 40 mm + LH 5 cm con **bandas elásticas** + enlucido | 16 | Solo sobre elemento base de **m ≤ 200 kg/m²**; vale para LH sencillo, doble o gran formato de 7 cm (nota 5). Bandas: EEPS 1 cm, s' < 100 MN/m³ (nota 2) |

| # | Afirmación | Veredicto | Detalle | Fuente |
|---|---|---|---|---|
| B.3.1 | Regla de suma del CEC | VERIFICADO | 4.4.1: RA = RA,EB + ΔRA,T (una cara); RA,EB + 1,5·ΔRA,T (iguales por ambas caras); distintos: RA,EB + ΔRA,T1 + 0,5·ΔRA,T2 (T2 el de menor ΔRA) | CEC p. 100 (PIV 1), notas (1) y (2) |
| B.3.2 | ¿La usa la opción simplificada? | INTERPRETACIÓN | **No.** La tabla 3.2 compara el **ΔRA de un trasdosado** con el ΔRA exigido (por ambas caras, o +4 dBA si solo por una). La suma de B.3.1 es un dato informativo del CEC, no el que se compara. El motor toma ΔRA de la tabla TR | HR p. 14, 3.1.2.3.4 pto 2; p. 17 nota (3) |
| B.3.3 | Masa intermedia | **NO LO FIJA EL CEC → CRITERIO** | Para una m del elemento base entre dos columnas, tomar el ΔRA de la **masa inmediatamente superior** (ΔRA baja al subir la masa: es el lado seguro). P. ej., LP ½ pie m = 150 → TR1 = **14** (fila [160]), no 15. K-CEC.4 | — |

### B.4 Tipo 2, dos hojas de fábrica con bandas elásticas (4.4.2)

**VERIFICADO**, CEC p. 109 (PIV 10). m = suma de hojas, RA = conjunto (coherente con la nota (1) de la tabla 3.2).

| # | Código CEC | Descripción | Bandas en | m mín [medio] | RA mín [medio] | Página |
|---|---|---|---|---|---|---|
| B.4.1 | P3.1 (LH PF) | LHD 7 + B + lana mineral ≥ 4 cm + LHD 7 + B, yeso por las caras exteriores | **Las dos hojas** (dibujo: B arriba y abajo de cada hoja) | 148 [170] | 53 [55] | CEC p. 109 |
| B.4.2 | P3.1 (LH GF) | Ídem con ladrillo hueco de gran formato | Las dos hojas | 110 [130] | 53 [55] | CEC p. 109 |
| B.4.3 | P3.2 (LP + LH PF) | LP ½ pie (apoyo directo) + lana mineral ≥ 4 cm + LHD 5 cm con B, yeso por las caras exteriores | **Solo la hoja de LH** | 184 [241] | 58 [61] | CEC p. 109 |
| B.4.4 | P3.3 (BC + LH PF) | Bloque cerámico aligerado 14 cm + lana mineral ≥ 4 cm + LH 5 cm con B | Solo la hoja de LH | 173 [217] | 58 [61] | CEC p. 109 |
| B.4.5 | Notas 4.4.2 | (1) banda ≥ 10 mm, s' < 100 MN/m³, valores para EEPS de 1 cm. (2) cámara con 4 cm de lana mineral u otro absorbente r ≥ 5 kPa·s/m². (3) mínimo / [medio] | — | — | — | CEC p. 110 |

| # | Afirmación | Veredicto | Detalle | Fuente |
|---|---|---|---|---|
| B.5 | Comprobación con la tabla 3.2 | ARITMÉTICA + **aviso** | P3.1 PF con mínimos: m 148 ≥ 130 pero **RA 53 < 54 → NO CUMPLE**; con medios (170 / 55) cumple la fila 170/54. P3.2 y P3.3: 58 ≥ 54 y m ≥ 170 → cumplen. **La elección mínimo/medio cambia el veredicto** (K-CEC.1) | CEC p. 109; HR p. 17 |
| B.5.1 | Bandas en una sola hoja | VERIFICADO (DB) | Nota (5) de la tabla 3.2: cada hoja con bandas ≤ 150 kg/m², y si las bandas van solo en una hoja, la hoja que apoya directamente en el forjado debe tener **RA ≥ 42 dBA**. Para la solución (200)/(61), la nota (6) repite la condición con **RA ≥ 45 dBA** (HR p. 18, parte superior). En P3.2, la hoja de apoyo directo es LP ½ pie: RA 42 [44] (P1.4) → cumple 42 con el mínimo; **no** cumple 45 | HR pp. 17, 18; CEC p. 101 |
| B.5.2 | m de cada hoja | **NO LO DA EL CEC (4.4.2) → CRITERIO** | 4.4.2 da solo la m del conjunto. Para comprobar «≤ 150 kg/m² cada hoja con bandas» y el RA de la hoja de apoyo directo: tomar la hoja equivalente de 4.4.1.1 (LHD 7 = P1.1, 89 [97]; LP ½ pie = P1.4, 150 [161]). Ojo: P1.x incluye yeso por **ambas** caras; en la hoja de un tipo 2 solo hay yeso por una. K-CEC.5 | CEC pp. 101, 109 |

### B.6 Tipo 3, entramado autoportante metálico (4.4.3)

**VERIFICADO**, CEC pp. 111–112 (PIV 12–13). m incluye perfilería y tornillería (nota 1).

| # | Código CEC | Descripción | m | RA | Comprobación tipo 3 (44 / 58) | Página |
|---|---|---|---|---|---|---|
| B.6.1 | P4.4 | 2×PYL 12,5 + 48 con LM + **chapa de acero 0,6 mm** + 48 con LM + 2×PYL 12,5 | 50 | 58 (3) | CUMPLE (justo) | CEC p. 111 |
| B.6.2 | P4.5 | 2×PYL 12,5 + 48 LM + PYL 12,5 + sep. 10 mm + 48 LM + 2×PYL 12,5 | 55 | 58 (3) | CUMPLE (justo) | CEC p. 111 |
| B.6.3 | P4.6 | 2×PYL 12,5 + 48 LM + sep. + 48 LM + 2×PYL 12,5 (doble estructura) | 45 | **55 (3)** arriostrados / **62 (4)** no arriostrados | **Arriostrados: NO CUMPLE** (55 < 58). No arriostrados: CUMPLE | CEC p. 111 |
| B.6.4 | P4.7 | 2×PYL 12,5 + 70 LM + PYL 12,5 + sep. + 70 LM + 2×PYL 12,5 | 55 | 65 (3) | CUMPLE | CEC p. 112 |
| B.6.5 | P4.8 | **2×PYL 15** + 70 LM + sep. + 70 LM + **2×PYL 15** | 54 | 67 (4) | CUMPLE (perfiles no arriostrados) | CEC p. 112 |
| B.6.6 | Notas | (3) «Valor de RA para perfiles arriostrados»; (4) «Valor de RA para perfiles no arriostrados» | — | — | La app debe preguntar si los montantes de las dos estructuras están arriostrados entre sí | CEC p. 112 |
| B.6.7 | «2×15 + 48 + 48 + 2×15» | **CORREGIDO** (encargo) | No existe en el CEC. Lo más próximo: P4.6 (48 mm, 2×12,5) o P4.8 (70 mm, 2×15) | NO LO DA EL CEC | — |

**Frase de memoria (tipo 1):** «Elemento de separación vertical tipo 1 entre unidades de uso: elemento base de ladrillo perforado de ½ pie enlucido por ambas caras (CEC P1.4; m = 150 kg/m², RA = 42 dBA), con trasdosado autoportante de placa de yeso laminado con lana mineral por ambas caras (CEC TR1; ΔRA = 14 dBA sobre elemento base de 160 kg/m²). Exigido (DB-HR tabla 3.2, fila m 150 / RA 41, tabiquería de fábrica): ΔRA ≥ 16 dBA → NO CUMPLE [o la fila que toque].»

---

## Bloque C — Medianerías — punto 3 del encargo

| # | Afirmación | Veredicto | Detalle | Fuente |
|---|---|---|---|---|
| C.1 | Exigencia | VERIFICADO | 3.1.2.4: el parámetro es RA; «El valor del índice global de reducción acústica ponderado, RA, de toda la superficie del cerramiento que constituya una medianería de un edificio, no será menor que 45 dBA.» | HR p. 22 (HR-16) |
| C.2 | ¿De qué tabla del CEC salen? | VERIFICADO | De **4.4**: las tablas 4.4.1, 4.4.1.1, 4.4.1.2, 4.4.2 y 4.4.3 se titulan «PARTICIÓN INTERIOR VERTICAL / MEDIANERÍA». La 4.4.4 (madera) solo «PARTICIÓN INTERIOR VERTICAL» | CEC pp. 100, 101, 106, 109, 111, 113 |
| C.3 | RA de un tipo 1 trasdosado como medianería | INTERPRETACIÓN | Para la medianería sí se usa la **suma de B.3.1** (RA,EB + ΔRA,T…), porque se compara un RA del conjunto con 45 dBA | CEC p. 100 |
| C.4 | Medianería que queda vista (fachada provisional) | **NO LO FIJA EL DB → CRITERIO** | Si una solución de fachada del bloque G sirve de medianería, su RA del conjunto también vale para C.1 (es un RA de toda la superficie). Ofrecer **las mismas soluciones del bloque B** y, como opción, las de fachada | — |

---

## Bloque D — Forjados (DB-HR tabla 3.3) — punto 4 del encargo

**Qué pide el DB (VERIFICADO, HR p. 14, 3.1.2.3.2 b i):** «m, masa por unidad de superficie del forjado, en kg/m², que corresponde al valor de masa por unidad de superficie de la sección tipo del forjado, excluyendo ábacos, vigas y macizados»; y RA del forjado.

| # | Afirmación | Veredicto | Detalle | Fuente |
|---|---|---|---|---|
| D.1 | ¿Da el CEC RA directamente? | VERIFICADO | **Sí.** 3.18 da m, RA, **RA,tr** y **Ln,w** de cada forjado. No hay que calcularlo | CEC pp. 29–31 |
| D.2 | ¿m con o sin capa de compresión? | VERIFICADO | **Con capa de compresión de 50 mm.** Nota (1) de 3.18.1: m «orientativos y corresponden a la sección sin contar con las vigas. Se han estimado para: un intereje de 70 cm y una capa de compresión de 50 mm» (piezas cerámicas, de hormigón y aligeradas); «intereje de 60 cm y una capa de compresión de 50 mm» (EPS). 3.18.2: «sección de la retícula, sin contar con los ábacos»; intereje 70 (80 sin piezas), capa 50 mm. Coincide con la m del DB-HR | CEC pp. 29, 30 |
| D.3 | ¿«Canto» incluye la capa? | INTERPRETACIÓN | El CEC no lo dice para unidireccionales y reticulares con piezas. Para las de EPS descolgadas y reticulares de EPS descolgadas sí: nota «Valores del canto estructural». Lectura: **canto = canto total** (pieza + capa de 5 cm), así que un «25+5» es la fila **300**. La masa lo confirma (bovedilla de hormigón 300 → 372 kg/m²). Pedir al usuario el canto total | CEC pp. 29, 30 |
| D.4 | Enlucido inferior | VERIFICADO | 3.18.1 nota (6) y 3.18.2 nota (7): RA, RA,tr y Ln,w son de forjados **sin enlucir**; enlucidos por su cara inferior, **RA y RA,tr + 2 dBA** y **Ln,w − 2 dB**. Losas macizas (3.18.4 nota 1): valen «tanto a losas sin enlucir como enlucidas» (sin +2). Losas alveolares (3.18.3 nota 2): igual que unidireccionales (+2) | CEC pp. 29, 31 |
| D.5 | EPS e impactos | VERIFICADO (DB) | Tabla 3.3 nota (4): forjados con piezas de entrevigado de **EPS** → el ΔLw exigido **se incrementa en 4 dB** | HR p. 22 |
| D.6 | Ley de masa | ARITMÉTICA | Los RA de 3.18 coinciden con **A.16** redondeada: 305 → 52,2 (CEC 52); 372 → 55,4 (55); 225 → 47,4 (47); 500 → 60,0 (60). Para forjados fuera del catálogo, el motor puede aplicar **A.15**: RA = 16,6·lg m + 5 (m ≤ 150 kg/m²) y **A.16**: RA = 36,5·lg m − 38,5 (m ≥ 150 kg/m²). **CRITERIO** (opción «otro forjado») | HR Anejo A, (A.15) y (A.16) (texto); CEC p. 29 |

**Soluciones (todas VERIFICADO en imagen):**

| # | Tipo | Canto (mm) | m (kg/m²) | RA (dBA) | RA,tr (dBA) | Ln,w (dB) | Página |
|---|---|---|---|---|---|---|---|
| D.7 | Unidireccional, bovedilla de hormigón | 250 | 332 | 53 | 48 | 76 | CEC p. 29 (MyP 17) |
| D.8 | Unidireccional, bovedilla de hormigón | 300 | 372 | 55 | 50 | 74 | CEC p. 29 |
| D.9 | Unidireccional, bovedilla cerámica | 250 | 305 | 52 | 48 | 77 | CEC p. 29 |
| D.10 | Unidireccional, bovedilla cerámica | 300 | 333 | 53 | 48 | 76 | CEC p. 29 |
| D.11 | Unidireccional, bovedilla de EPS mecanizada enrasada | 300 | 225 | 47 | 45 | 86 | CEC p. 29 |
| D.12 | Reticular, casetón de hormigón | 300 | 385 | 56 | 51 | 73 | CEC p. 30 (MyP 18) |
| D.13 | Reticular, sin piezas de entrevigado (casetón recuperable) | 300 | 344 | 54 | 49 | 75 | CEC p. 30 |
| D.14 | Losa alveolar con capa de compresión | 250 | 395 | 56 | 51 | 73 | CEC p. 31 (MyP 19) |
| D.15 | Losa maciza de HA (ρ = 2 500 kg/m³) | 200 | 500 | 60 | 55 | 70 | CEC p. 31 |
| D.16 | Losa maciza de HA | 250 | 625 | 64 | 59 | 66 | CEC p. 31 |

Otros valores leídos (no propuestos): unidireccional cerámica 350 (360/55/50/75), hormigón 350 (413/57/52/72); EPS moldeada enrasada 300 (222/47/45/86); EPS descolgada 300 (201/46/44/87); reticular cerámica 300 (365/55/50/74); alveolar sin capa 250 (345/54/49/75); losa 300 (750/67/62/63).

**Frase de memoria:** «Forjado unidireccional de 30 cm de canto total con bovedilla de hormigón (CEC 3.18.1): m = 372 kg/m² (sección tipo con capa de compresión de 5 cm, sin vigas), RA = 55 dBA (sin enlucir).»

---

## Bloque E — Suelos flotantes (4.5.1) — punto 5 del encargo

**Qué pide el DB (VERIFICADO, HR p. 14, 3.1.2.3.2 b iii y iv):** ΔLw del suelo flotante y ΔRA del suelo flotante o techo. Tabla 3.3 nota (2): ΔLw y ΔRA del suelo flotante se cumplen **simultáneamente**; nota (3): corresponden a **un único** suelo flotante (no se suman) (HR p. 22).

**Lectura del corchete:** CEC nota (9): «el segundo valor, que figura entre corchetes, es la **masa máxima** del forjado o de la losa sobre el que se aplica el suelo» (VERIFICADO, p. 117). **INTERPRETACIÓN**: con m del forjado = 372 se toma la primera columna con [m] ≥ 372, es decir [400]. Con m > 500, ΔRA = 0.

**S01, capa de mortero de 50 mm** (nota 1) sobre material aislante a ruido de impactos (VERIFICADO, pp. 115–116):

| # | Aislante | Condición del producto (notas 4–7) | ΔLw (dB) | ΔRA [masa máxima del forjado] | Página |
|---|---|---|---|---|---|
| E.1 | Lana mineral 20 mm | s' < 13 MN/m³ | **30** | 13 [175] · 12 [200] · 11 [225] · 10 [250] · 9 [300] · 8 [350] · 6 [400] · 6 [450] · 5 [500] · 0 [> 500] | CEC p. 115 |
| E.2 | Lana mineral 30 mm | s' < 9 MN/m³ | **33** | Igual que 20 mm (13 … 0), leído así en la imagen | CEC p. 115 |
| E.3 | Polietileno reticulado (PE-R) 5 mm | ρ > 25 kg/m³, s' < 90 MN/m³ (10 mm: s' < 75) | **19** (3 mm: 18; ≥ 10 mm: 21) | 7 [175] · 6 [200] · 6 [225] · 5 [250] · 5 [300] · 4 [350] · 4 [400] · 3 [450] · 3 [500] · 0 [> 500] | CEC p. 115 |
| E.4 | Polietileno expandido (PE-E) ≥ 5 mm | ρ > 35 kg/m³, s' < 70 MN/m³ | **20** (3 mm: 16) | Igual que PE-R (7 … 0) | CEC p. 115 |
| E.5 | EPS elastificado (EEPS) 30 mm | s' < 20 MN/m³ (20 mm: < 30; 40 mm: < 15) | **28** (20 mm: 25; 40 mm: 30) | 15 [175–250] · 8 [300] · 7 [350] · 6 [400] · 5 [450] · 5 [500] · 0 [> 500] | CEC p. 116 |
| E.6 | Lana mineral 12 mm (referencia) | s' < 20 MN/m³ | 27 | 10 [175] · 10 [200] · 9 [225] · 8 [250] · 7 [300] · 6 [350] · 5 [400] · 5 [450] · 4 [500] · 0 [> 500] | CEC p. 115 |

| # | Afirmación | Veredicto | Detalle | Fuente |
|---|---|---|---|---|
| E.7 | Barrera impermeable | VERIFICADO | Nota (3): «Debe interponerse una barrera impermeable entre la capa de mortero y el material aislante a ruido de impactos, cuando este último no sea impermeable.» (afecta a lana mineral y EEPS) | CEC p. 117 |
| E.8 | Láminas de 3 mm | VERIFICADO | Nota (10) bis: evitar desgarros; «se recomienda utilizar láminas de PE de espesores mayores» | CEC p. 117 |
| E.9 | S02 (suelo seco, 2 PYL ≥ 12,5, 22 kg/m²) | VERIFICADO, no propuesto | MW 20: ΔLw 23; EEPS 30: ΔLw 20. Poco habitual en vivienda | CEC p. 116 |
| E.10 | S03 (tarima de madera) | VERIFICADO | **ΔRA = 0** siempre; ΔLw 11–17 (MW), 15 (PE). Solo sirve para impactos | CEC p. 117 |
| E.11 | Productos industriales | INTERPRETACIÓN (preámbulo) | Lana, PE y EEPS se fabrican industrialmente: valores **orientativos**; la ficha debe pedir s' y espesor del producto real | CEC p. 3 (texto) |

**Ejemplo (ARITMÉTICA):** forjado D.8 (m 372) + S01 con lana mineral 20 mm → ΔRA = 6 dBA (columna [400]), ΔLw = 30 dB.

---

## Bloque F — Techos suspendidos (4.5.2.1) — punto 6 del encargo

**VERIFICADO**, CEC p. 118 (PIH 5). YL = placa de yeso laminado suspendida con tirantes metálicos; MW = lana mineral r ≥ 5 kPa·s/m² (nota 1); C = cámara.

| # | Código | Descripción | ΔRA (dBA) | ΔLw (dB) |
|---|---|---|---|---|
| F.1 | T01 | PYL 15 suspendida, cámara ≥ 100 mm, **sin** lana | 5 | 5 |
| F.2 | T01 | PYL 15, lana ≥ 50 mm, cámara ≥ 100 mm | 13 | 9 |
| F.3 | T01 | PYL 15, lana ≥ 50 mm, cámara ≥ 150 mm | 15 | 9 |
| F.4 | T01 | 2×PYL 12,5, lana ≥ 50 mm, cámara ≥ 100 mm | 14 | 9 |
| F.5 | T03 | PYL 15 sobre perfilería directa, cámara 48 mm, sin lana | 0 | 0 |

| # | Afirmación | Veredicto | Detalle | Fuente |
|---|---|---|---|---|
| F.6 | Límite de masa del forjado | VERIFICADO | Nota (5): ΔRA válidos para forjados de **m ≤ 350 kg/m²**. Entre 350 y 400: **7 dBA** para T01 y T02 con lana; T03 nulo. **m > 400: mejora nula** | CEC p. 118 |
| F.7 | Amortiguadores | VERIFICADO | Nota (3): valores para techos **sin amortiguadores**. Nota (4): luminarias empotradas con fijaciones específicas; trampillas de registro con cierres herméticos | CEC p. 118 |
| F.8 | ΔLw del techo | INTERPRETACIÓN | La tabla 3.3 del DB-HR **no pide ΔLw del techo**, solo ΔRA. El ΔLw de 4.5.2.1 es informativo | HR p. 20 |
| F.9 | Recinto de instalaciones | VERIFICADO (DB) | 3.1.2.3.5 pto 7: techos de recintos de instalaciones **con amortiguadores** (los ΔRA del CEC son sin amortiguadores: no aplican tal cual) | HR p. 18 |

**Ejemplo (ARITMÉTICA):** forjado D.8 (372 kg/m²) + T01 con lana: ΔRA = 7 dBA (nota 5), no 13.

---

## Bloque G — Fachadas (DB-HR tabla 3.4 y condiciones de flancos) — punto 7 del encargo

**Qué pide el DB:**
- Tabla 3.4: **RA,tr de la parte ciega** (VERIFICADO, HR p. 23, HR-17).
- Flancos (tabla 3.2, 3.1.2.3.4 pto 7, VERIFICADO HR pp. 15–16): tipo de fachada (una hoja / dos hojas pesada no ventilada / ventilada o ligera), hoja interior de fábrica o de entramado, y **m y RA de una hoja**: tipo 1 + fachada de una hoja o ventilada de fábrica: hoja de fábrica **m ≥ 135 y RA ≥ 42**; dos hojas pesada no ventilada: **hoja exterior m ≥ 130**; ventilada o ligera con hoja interior de entramado: **hoja interior m ≥ 26 y RA ≥ 43**. Tipo 2 + una hoja o ventilada con hoja interior de fábrica: si m del separador ≥ 170, fachada **RA ≥ 50 y m ≥ 225**. Tipo 3 + fachada pesada de dos hojas con interior de entramado: **hoja exterior m ≥ 145 y RA ≥ 45**.
- Tabla 3.3 nota (6) (VERIFICADO, HR p. 22): mismos umbrales 1H / 2H para tabiquería de entramado.

**Soluciones (VERIFICADO en imagen; valores del conjunto; mín [medio]):**

| # | Código | Descripción | RA | RA,tr | m | Tipo DB-HR (INTERPRETACIÓN) | Hoja interior | Página |
|---|---|---|---|---|---|---|---|---|
| G.1 | F 3.1 | Enfoscado exterior + LP ½ pie + aislante no hidrófilo + LHD 7 cm + enlucido | 48 [49] | **45 [46]** | 220 [240] | Dos hojas pesada no ventilada | Fábrica | CEC p. 59 (Fachadas 7) |
| G.2 | F 1.1 | LP ½ pie cara vista + enfoscado intermedio 1,5 cm + aislante + LHD 7 cm + enlucido | 50 [50] | **47 [47]** | 247 [271] | Dos hojas pesada no ventilada | Fábrica | CEC p. 54 (Fachadas 2) |
| G.3 | F 3.4 | Enfoscado + LP ½ pie + separación 10 mm + aislante (lana) + PYL (trasdosado autoportante) | 59 [60] | **54 [55]** | 157 [169] | Dos hojas pesada no ventilada | **Entramado autoportante** | CEC p. 59 |
| G.4 | F 4.3 | SATE: revestimiento continuo + aislante exterior + bloque de hormigón 14 cm (áridos densos) + enlucido | 44 | **41** | 210 | **Una hoja** de fábrica | — | CEC p. 64 (Fachadas 12) |
| G.5 | F 4.1 | SATE + LP ½ pie + enlucido | 42 [43] | **39 [40]** | 161 [173] | Una hoja de fábrica | — | CEC p. 64 |
| G.6 | F 8.x (4.2.8, aplacado ventilado + aislante exterior sobre ½ pie) | Fachada ventilada sobre ½ pie | — | — | — | Ventilada | — | **PENDIENTE**: p. 76 no renderizada; texto desordenado (aparecen 143 [167], 42 [44], 39 [41] sin poder asignarlos con seguridad a F 8.1) |

| # | Afirmación | Veredicto | Detalle | Fuente |
|---|---|---|---|---|
| G.7 | Hoja interior de LH gran formato | VERIFICADO | RA y RA,tr valen igual con hoja interior de LH o de LGF; **m − 15 kg/m²** si la hoja interior es de gran formato | CEC pp. 56, 63 |
| G.8 | Bandas en la hoja interior | VERIFICADO | RA y RA,tr «válidos para fachadas en las que indistintamente se dispongan o no bandas elásticas en la base de la hoja interior» | CEC pp. 56, 63 |
| G.9 | Hoja interior de PYL | VERIFICADO | Valores válidos solo si hay lana mineral o absorbente con r ≥ 5 kPa·s/m² en la cámara | CEC pp. 56, 63, 67 |
| G.10 | Hoja principal cerámica | VERIFICADO | Valores solo si es de **ladrillo perforado o macizo** | CEC pp. 63, 65 |
| G.11 | Cámara parcialmente ventilada | VERIFICADO | 500 ≤ A < 1 500 mm²: RA y RA,tr − 1 dB; 1 500 ≤ A < 3 600 mm²: − 2 dB | CEC pp. 56, 63 |
| G.12 | BH: densos o ligeros | VERIFICADO | En 4.2.3 y 4.2.4 hay dos filas: (3)/(5) = hormigón convencional o áridos densos; (4)/(6) = áridos ligeros. F 4.3 con áridos ligeros: 41 / 38 / 182 | CEC pp. 63, 64, 65 |
| G.3bis | **m y RA de la hoja principal o de la interior** | **NO LO DA EL CEC → CRITERIO** | Las tablas 4.2.x solo dan el conjunto. Propuesta (K-CEC.5): hoja de fábrica = valor de 4.4.1.1 (P1.4 LP ½ pie: 150 [161] / 42 [44], con yeso por ambas caras) corregido por la nota (8) de 4.4.1.1 a «una cara sin revestir»: **− 15 kg/m², − 1 dBA** → **135 / 41**. Esa corrección es la mitad de la regla del CEC para «sin enlucir» (− 30 / − 2) y es CRITERIO. Mejor: campo editable con ese valor por defecto. Con 135 / 41, la condición «hoja exterior m ≥ 130» se cumple; la de «m ≥ 135 y RA ≥ 42» (fachada de una hoja) **no**. Hoja interior de entramado (m ≥ 26 y RA ≥ 43): **sin valor por defecto** (un trasdosado de una placa no es P4.1); que lo declare el usuario | CEC pp. 101, 105 |

**Frase de memoria:** «Parte ciega de fachada: enfoscado + ladrillo perforado de ½ pie + aislante + ladrillo hueco doble de 7 cm enlucido (CEC F 3.1): RA,tr = 45 dBA ≥ [exigido, tabla 3.4]. Fachada pesada de dos hojas no ventilada con hoja interior de fábrica.»

---

## Bloque H — Cubiertas — punto 8 del encargo

| # | Afirmación | Veredicto | Detalle | Fuente |
|---|---|---|---|---|
| H.1 | El CEC no tabula cubiertas: remite a forjados | VERIFICADO | 4.1.1 nota (4): «Para obtener los valores de m, RA y RAtr de cubiertas, se utilizarán los valores de m, RA y RAtr de forjados y losas del apartado 3.18. Cuando la cubierta tenga una capa de formación de pendientes de hormigón con áridos ligeros, el valor de los índices RA y RAtr del forjado se incrementará 2 dBA.» | CEC p. 37 (Cubiertas 1); igual en 4.1.2, p. 38 |
| H.2 | Techo suspendido bajo cubierta | VERIFICADO | Misma nota: RA = RA forjado + ΔRA del techo; RA,tr = RA,tr forjado + ΔRA,tr del techo «si está disponible o, en su defecto, de ΔRA» (de 4.5.2.1) | CEC pp. 37, 38 |
| H.3 | Inclinada | LEÍDO (texto) | 4.1.9 (forjado inclinado) repite la remisión a 3.18 (nota 5) | CEC p. 45 (texto) |

| # | Solución | Cálculo | RA,tr parte ciega | Veredicto |
|---|---|---|---|---|
| H.4 | Cubierta plana transitable, no ventilada, solado fijo (4.1.1, C 1.3), sobre unidireccional con bovedilla de hormigón de 30 cm, formación de pendientes de hormigón ligero | 50 (D.8) + 2 | **52 dBA** (RA 57; m 372) | ARITMÉTICA con la regla H.1 |
| H.5 | Cubierta inclinada sobre forjado unidireccional con bovedilla de hormigón de 25 cm, sin formación de pendientes | 48 (D.7) | **48 dBA** (RA 53; m 332) | ARITMÉTICA con H.3 (regla LEÍDA en texto) |

---

## Bloque I — Huecos (tabla 3.4, RA,tr de ventana + caja de persiana + aireador) — punto 9 del encargo

**Qué pide el DB (VERIFICADO, HR p. 22, 3.1.2.5 pto 3):** «Este índice, RAtr, caracteriza al conjunto formado por la ventana, la caja de persiana y el aireador si lo hubiera.» Tabla 3.4 nota (2) (HR p. 23): el RA,tr del hueco «se aplica a las ventanas que dispongan de aireadores, sistemas de microventilación o cualquier otro sistema de abertura de admisión de aire con dispositivos de cierre en posición cerrada». 3.1.2.5 pto 3 (HR p. 23): si el aireador no va en el hueco sino en el cerramiento, **opción general**.

**Ventanas sencillas (4.3.2.1), VERIFICADO, CEC p. 97 (Huecos 8).** Tabla titulada «VENTANA sin capialzado o capialzado por el exterior».

| # | Acristalamiento | Deslizante (clase de permeabilidad ≥ 2): RA / **RA,tr** | Practicable, batiente u oscilobatiente (clase ≥ 3): RA / **RA,tr** |
|---|---|---|---|
| I.1a | 4–(6…20)–4 | 26 / **25** | 31 / **27** |
| I.1b | 4–(6…20)–6 | 28 / **27** | 33 / **30** |
| I.1c | 6–(6…20)–6 | 27 / **26** | 32 / **29** |
| I.1d | 6–(6…20)–10 (nota 5) | 28 / **28** | 34 / **32** |
| I.1e | 6–(6…20)–6+6 (laminar) | 28 / **27** | 33 / **30** |
| I.1f | 6–(6…20)–10+10 (nota 5) | — (guion) | 35 / **32** |
| I.1g | Vidrio sencillo 4 | 26 / **26** | 27 / **26** |

| # | Afirmación | Veredicto | Detalle | Fuente |
|---|---|---|---|---|
| I.2 | Laminar «acústico» | **CORREGIDO** | El laminar del CEC es con «un butiral de 0,36 mm» (nota 3), es decir, PVB estándar. **No hay PVB acústico**. Laminares 3+3 y 4+4 **en gris → DESCARTADO** | CEC p. 97 |
| I.3 | 4/12/6 frente a 6/12/4 | **NO LO DA EL CEC → CRITERIO** | El CEC solo escribe 4–(6…20)–6 y no distingue el orden. Tomar el mismo valor para 6/12/4 | CEC p. 97 |
| I.4 | Condiciones | VERIFICADO | Nota (1): deslizantes, clase de permeabilidad al aire **≥ 2**; nota (2): resto, **≥ 3**; nota (5): las oscilobatientes necesitan **dos juntas de estanquidad** para los valores marcados. Nota (6): valores para ventanas de **hasta 1,5 × 1,25 m**; corrección por área total: S ≤ 2,7 m² sin corrección; 2,7–3,6: **− 1 dB**; 3,6–4,6: **− 2 dB**; > 4,6: **− 3 dB** | CEC p. 97 |
| I.4b | Ventanas dobles | VERIFICADO | Exterior deslizante (6, 8 o 4-6-4) + interior UVA 4–(6…12)–(4…8), d ≥ 10 cm: interior deslizante RA 41 / **RA,tr 40**; interior oscilobatiente 46 / **44**. Cabecera en «(dB)» | CEC p. 98 (Huecos 9) |
| I.5 | Capialzados (4.3.3) | VERIFICADO | **CP1**: perfiles de PVC o madera ≥ 10 mm o metálicos ≥ 10 kg/m², holgura < 20 mm: **RA,tr ≥ 25 dBA**. **CP2**: ídem + material absorbente ≥ 25 mm: **RA,tr ≥ 30 dBA**, «válido para capialzados con una junta de estanquidad en el perfil de tapa» (nota 1) | CEC p. 99 (Huecos 10) |
| I.6 | Cómo se combinan ventana y capialzado | VERIFICADO (CEC no combina) + LEÍDO (texto, DB) + **CRITERIO** | El CEC da por separado la ventana (sin capialzado o con capialzado exterior) y la caja. El DB pide el RA,tr del **conjunto**. El DB-HR tiene el **Anejo G**: Rm,A = −10·lg( Σ (Si/S)·10^(−Ri,A/10) ) (G.1). El Anejo G está escrito para RA; **aplicarlo a RA,tr es CRITERIO** (es la misma suma energética). Si el capialzado es exterior (no integrado en el hueco), solo cuenta la ventana | CEC pp. 97, 99; HR Anejo G (G.1) (texto, p. 67) |
| I.7 | Ejemplo | ARITMÉTICA | Ventana batiente 4–(6…20)–6, 1,60 m², RA,tr 30 + caja CP1 0,25 m², RA,tr 25 → Rm = −10·lg((1,60·10^−3,0 + 0,25·10^−2,5)/1,85) = **28,9 dBA**. La caja baja el conjunto 1 dB | — |
| I.8 | Aireador | NO LO DA EL CEC | No hay aireadores en el CEC. Si hay aireador integrado: su D_n,e,A,tr (dato del fabricante) entra en la suma; si va en el muro, opción general (DB) | HR p. 23 |

---

## Decisiones de producto (lo que ni el CEC ni el DB fijan)

Todas son **CRITERIO** y se rotulan así en la ficha.

| # | Caso | Supuesto propuesto | Por qué |
|---|---|---|---|
| K-CEC.1 | Mínimo o medio | **Mínimo por defecto** (el preámbulo lo define como «conservador, se garantiza en todos los casos»). Opción «valor medio» solo si el usuario declara que el producto lo justifica, y la ficha lo dice. Avisar cuando el veredicto cambie entre ambos (p. ej. P3.1) | 0.1, B.5 |
| K-CEC.2 | Garantía legal | Rotular cada solución como «hecha en obra (valor con garantía legal del CEC)» o «producto industrial (valor orientativo; confirmar con el fabricante)» | 0, punto 2 |
| K-CEC.3 | Corchetes | El motor guarda cada significado por separado (medio / densidad 1 500 / masa del elemento base / masa máxima del forjado), nunca un «[ ]» genérico | 0.1 |
| K-CEC.4 | Masa intermedia en tablas ΔRA[m] | Trasdosados: tomar la columna de masa **inmediatamente superior** (lado seguro). Suelos flotantes: la primera [m] ≥ m del forjado (es «masa máxima») | B.3.3, E |
| K-CEC.5 | m y RA de una hoja (tipo 2 y flancos de fachada) | Valor de 4.4.1.1 de la hoja equivalente; si tiene revestimiento solo por una cara, − 15 kg/m² y − 1 dBA. Campo editable. Hoja interior de entramado: sin valor por defecto | B.5.2, G.3bis |
| K-CEC.6 | Elementos fuera del catálogo | Opción «otro»: el usuario da m y RA (o RA,tr) con su origen (ensayo, fabricante). Para una hoja homogénea o un forjado, permitir A.15/A.16 | D.6, B.1.10 |
| K-CEC.7 | Enlucido bajo forjado | Por defecto **sin** el + 2 dBA de 3.18; casilla «forjado enlucido por su cara inferior» que lo suma (no en losas macizas) | D.4 |
| K-CEC.8 | Ventana + capialzado | Sumar con G.1 aplicada a RA,tr; si el capialzado es exterior, solo la ventana. Aplicar la corrección por tamaño de 4.3.2 nota (6) | I.4, I.6 |
| K-CEC.9 | Arriostramiento en tipo 3 | Preguntar; por defecto **arriostrados** (valor menor) | B.6.6 |

---

## Catálogo propuesto para la app

Valores mínimos del CEC (entre corchetes, el medio cuando existe). Todas las páginas son del PDF del CEC (v6.3, marzo 2010). Todas VERIFICADO en imagen salvo las marcadas.

| id propuesto | Categoría | Descripción | Parámetros | Página CEC |
|---|---|---|---|---|
| tab-lhd70-yeso | Tabiquería, fábrica con apoyo directo | LHD 7 cm + yeso 1,5 cm por ambas caras (P1.1) | m 89 [97]; RA 36 [37] | p. 101 |
| tab-lhgf70-yeso-bandas | Tabiquería, fábrica con bandas elásticas | Ladrillo hueco gran formato 7 cm + yeso por ambas caras, con bandas (P1.2) | m 70 [80]; RA 33 [34]. Con apoyo directo no cumple | p. 101 |
| tab-pyl-15-48-15-lm | Tabiquería, entramado autoportante | PYL 15 + 48 con lana mineral + PYL 15 (P4.1) | m 26; RA 43 (40 con fieltro de poliéster) | p. 111 |
| tab-pyl-2x125-48-2x125-lm | Tabiquería, entramado autoportante | 2×PYL 12,5 + 48 con lana mineral + 2×PYL 12,5 (P4.2) | m 44; RA 52 | p. 111 |
| sv-lp115-yeso | Separación vertical tipo 1, una hoja | LP ½ pie + yeso 1,5 cm por ambas caras (P1.4) | m 150 [161]; RA 42 [44] | p. 101 |
| sv-lp240-yeso | Separación vertical tipo 1, una hoja | LP 1 pie + yeso por ambas caras (P1.5) | m 284 [313]; RA 49 [50] | p. 102 |
| sv-bhad190-enl | Separación vertical tipo 1, una hoja | Bloque de hormigón de áridos densos 19 cm enlucido por ambas caras (P1.14) | m 239; RA 48 | p. 103 |
| sv-ha160 | Separación vertical tipo 1, una hoja | Muro de hormigón armado 16 cm visto (P1.24) | m 400; RA 57 (+15 kg/m² si enlucido 15 mm por ambas caras) | p. 105 |
| sv-ha200 | Separación vertical tipo 1, una hoja | Muro de hormigón armado 20 cm visto (P1.25) | m 500; RA 60 | p. 105 |
| sv-lhd-lm-lhd | Separación vertical tipo 1, dos hojas | LHD 7 + lana mineral ≥ 3 cm + LHD 7, yeso por las caras exteriores (P2.1) | m 130 [170]; RA 44 [45] | p. 106 |
| tr-autoportante-pyl-lm | Trasdosado | Autoportante: sep. 10 mm + lana mineral 50 mm + PYL 15 o 2×12,5 (TR1) | ΔRA 17 [70] · 16 [100] · 15 [140] · 14 [160] · 13 [180] · 12 [200] · 10 [250] · 9 [300] · 8 [350] · 7 [400] | p. 108 |
| tr-directo-pyl-lm | Trasdosado | Directo: lana mineral 30 mm (s' ≤ 9) + PYL 15 (TR2) | ΔRA 10 [70] · 9 [100] · 8 [140] · 7 [160] · 6 [180] · 5 [200] · 3 [250] · 2 [300] · 1 [350] · 0 [400] | p. 108 |
| tr-ceramico-lh50-lm | Trasdosado | Lana mineral 40 mm + LH 5 cm con bandas + enlucido (TR3) | ΔRA 16 (base m ≤ 200) | p. 108 |
| sv2-lhd-lhd-bandas | Separación vertical tipo 2 | LHD 7 + B + lana mineral ≥ 4 cm + LHD 7 + B; bandas en las dos hojas (P3.1) | m 148 [170]; RA 53 [55] | p. 109 |
| sv2-lp115-lh-bandas | Separación vertical tipo 2 | LP ½ pie (apoyo directo) + lana mineral ≥ 4 cm + LH 5 con bandas (P3.2) | m 184 [241]; RA 58 [61]; bandas solo en la hoja de LH | p. 109 |
| sv3-pyl-2x125-48-cm-48-2x125 | Separación vertical tipo 3 | 2×PYL 12,5 + 48 LM + chapa 0,6 mm + 48 LM + 2×PYL 12,5 (P4.4) | m 50; RA 58 | p. 111 |
| sv3-pyl-2x125-48-48-2x125 | Separación vertical tipo 3 | 2×PYL 12,5 + 48 LM + sep. + 48 LM + 2×PYL 12,5 (P4.6) | m 45; RA 55 arriostrados / 62 no arriostrados | p. 111 |
| sv3-pyl-2x15-70-70-2x15 | Separación vertical tipo 3 | 2×PYL 15 + 70 LM + sep. + 70 LM + 2×PYL 15 (P4.8) | m 54; RA 67 (no arriostrados) | p. 112 |
| fu-bovhorm-250 | Forjado | Unidireccional, bovedilla de hormigón, canto total 25 cm | m 332; RA 53; RA,tr 48; Ln,w 76 | p. 29 |
| fu-bovhorm-300 | Forjado | Unidireccional, bovedilla de hormigón, canto total 30 cm | m 372; RA 55; RA,tr 50; Ln,w 74 | p. 29 |
| fu-bovcer-300 | Forjado | Unidireccional, bovedilla cerámica, canto total 30 cm | m 333; RA 53; RA,tr 48; Ln,w 76 | p. 29 |
| fu-boveps-300 | Forjado | Unidireccional, bovedilla de EPS mecanizada enrasada, 30 cm (ΔLw exigido + 4 dB) | m 225; RA 47; RA,tr 45; Ln,w 86 | p. 29 |
| fr-casetonhorm-300 | Forjado | Reticular, casetón de hormigón, 30 cm | m 385; RA 56; RA,tr 51; Ln,w 73 | p. 30 |
| losa-ha-200 | Forjado | Losa maciza de hormigón armado 20 cm | m 500; RA 60; RA,tr 55; Ln,w 70 | p. 31 |
| losa-ha-250 | Forjado | Losa maciza de hormigón armado 25 cm | m 625; RA 64; RA,tr 59; Ln,w 66 | p. 31 |
| alv-capa-250 | Forjado | Losa alveolar 25 cm con capa de compresión | m 395; RA 56; RA,tr 51; Ln,w 73 | p. 31 |
| sf-mortero-lm20 | Suelo flotante | Mortero 50 mm sobre lana mineral 20 mm (s' < 13) | ΔLw 30; ΔRA 13 [175] · 12 [200] · 11 [225] · 10 [250] · 9 [300] · 8 [350] · 6 [400] · 6 [450] · 5 [500] · 0 [> 500] | p. 115 |
| sf-mortero-lm30 | Suelo flotante | Mortero 50 mm sobre lana mineral 30 mm (s' < 9) | ΔLw 33; ΔRA igual que sf-mortero-lm20 | p. 115 |
| sf-mortero-per5 | Suelo flotante | Mortero 50 mm sobre polietileno reticulado 5 mm (ρ > 25, s' < 90) | ΔLw 19; ΔRA 7 [175] · 6 [200] · 6 [225] · 5 [250] · 5 [300] · 4 [350] · 4 [400] · 3 [450] · 3 [500] · 0 [> 500] | p. 115 |
| sf-mortero-pee5 | Suelo flotante | Mortero 50 mm sobre polietileno expandido ≥ 5 mm (ρ > 35, s' < 70) | ΔLw 20; ΔRA igual que sf-mortero-per5 | p. 115 |
| sf-mortero-eeps30 | Suelo flotante | Mortero 50 mm sobre EPS elastificado 30 mm (s' < 20) | ΔLw 28; ΔRA 15 [175–250] · 8 [300] · 7 [350] · 6 [400] · 5 [450] · 5 [500] · 0 [> 500] | p. 116 |
| ts-pyl15-sin-lm | Techo suspendido | PYL 15 suspendida, cámara ≥ 100 mm, sin lana (T01) | ΔRA 5 (m forjado ≤ 350; 350–400: dato no dado para sin lana; > 400: 0) | p. 118 |
| ts-pyl15-lm50-c100 | Techo suspendido | PYL 15, lana mineral ≥ 50 mm, cámara ≥ 100 mm (T01) | ΔRA 13 (m ≤ 350); 7 (350–400); 0 (> 400) | p. 118 |
| ts-2pyl125-lm50-c100 | Techo suspendido | 2×PYL 12,5, lana ≥ 50 mm, cámara ≥ 100 mm (T01) | ΔRA 14 (m ≤ 350); 7 (350–400); 0 (> 400) | p. 118 |
| fa-enf-lp115-at-lhd70 | Fachada, parte ciega | Enfoscado + LP ½ pie + aislante + LHD 7 + enlucido (F 3.1); dos hojas pesada no ventilada, hoja interior de fábrica | RA,tr 45 [46]; RA 48 [49]; m 220 [240] | p. 59 |
| fa-cv-lp115-at-lhd70 | Fachada, parte ciega | LP ½ pie cara vista + enfoscado intermedio + aislante + LHD 7 + enlucido (F 1.1); dos hojas pesada no ventilada, hoja interior de fábrica | RA,tr 47 [47]; RA 50 [50]; m 247 [271] | p. 54 |
| fa-enf-lp115-trasd-pyl | Fachada, parte ciega | Enfoscado + LP ½ pie + sep. 10 mm + lana + PYL (F 3.4); dos hojas pesada no ventilada, hoja interior de entramado | RA,tr 54 [55]; RA 59 [60]; m 157 [169] | p. 59 |
| fa-sate-bh140 | Fachada, parte ciega | SATE sobre bloque de hormigón de áridos densos 14 cm + enlucido (F 4.3); una hoja | RA,tr 41; RA 44; m 210 | p. 64 |
| fa-sate-lp115 | Fachada, parte ciega | SATE sobre LP ½ pie + enlucido (F 4.1); una hoja | RA,tr 39 [40]; RA 42 [43]; m 161 [173] | p. 64 |
| fa-ventilada-lp115 | Fachada, parte ciega | Aplacado ventilado + aislante exterior sobre LP ½ pie + enlucido (4.2.8, F 8.1); ventilada, hoja principal de fábrica (1H) | RA,tr 39 [40]; RA 42 [43]; m 156 [168] (VERIFICADO en imagen p. 76 por la sesión principal, nota (2): mínimo y [medio]) | p. 76 |
| cu-plana-fu-bovhorm-300 | Cubierta, parte ciega | Plana transitable, solado fijo, sobre fu-bovhorm-300 con formación de pendientes de hormigón ligero (C 1.3) | RA,tr 52 (50 + 2); RA 57 | pp. 37, 29 |
| cu-incl-fu-bovhorm-250 | Cubierta, parte ciega | Inclinada sobre forjado inclinado fu-bovhorm-250, sin formación de pendientes | RA,tr 48; RA 53 (regla 4.1.9 LEÍDA en texto) | pp. 45 (texto), 29 |
| ve-4-c-6-batiente | Hueco, ventana | Batiente u oscilobatiente, 4–(6…20)–6, clase ≥ 3 | RA,tr 30; RA 33 | p. 97 |
| ve-4-c-6-corredera | Hueco, ventana | Deslizante, 4–(6…20)–6, clase ≥ 2 | RA,tr 27; RA 28 | p. 97 |
| ve-4-c-4-batiente | Hueco, ventana | Batiente, 4–(6…20)–4, clase ≥ 3 | RA,tr 27; RA 31 | p. 97 |
| ve-6-c-66-batiente | Hueco, ventana | Batiente, 6–(6…20)–6+6 laminar (PVB 0,36), clase ≥ 3 | RA,tr 30; RA 33 | p. 97 |
| ve-6-c-1010-oscilo | Hueco, ventana | Oscilobatiente con dos juntas, 6–(6…20)–10+10, clase ≥ 3 | RA,tr 32; RA 35 | p. 97 |
| ve-doble-oscilo | Hueco, ventana | Doble ventana: exterior deslizante + interior oscilobatiente UVA 4–(6…12)–(4…8), d ≥ 10 cm | RA,tr 44; RA 46 | p. 98 |
| cp1 | Hueco, caja de persiana | Capialzado de PVC o madera ≥ 10 mm o metálico ≥ 10 kg/m², holgura < 20 mm | RA,tr ≥ 25 | p. 99 |
| cp2 | Hueco, caja de persiana | CP1 + absorbente ≥ 25 mm + junta en el perfil de tapa | RA,tr ≥ 30 | p. 99 |

**Lo que no se ha podido leer:**
- ~~**4.2.8 (fachada ventilada con aplacado y aislante exterior), p. 76**~~: resuelto después por la sesión principal, leído en la imagen p. 76 (F 8.1: m 156 [168], RA 42 [43], RA,tr 39 [40]; los valores de ladrillo cerámico valen solo con ladrillo perforado o macizo).
- **Preámbulo (p. 3)**: leído solo en texto (avisos de no reglamentario, garantía legal y mínimo/medio). Renderizar p. 3 si se va a citar literal en la ficha.
- **4.1.9 cubierta inclinada (p. 45)**: la remisión a 3.18 solo en texto.
- **DB-HR Anejo A (A.15, A.16) y Anejo G (G.1)**: leídos en texto, no en imagen.
- Las imágenes pp. 9–12 (estructura y notación del catálogo) se abrieron al principio de la sesión, pero los valores de este documento salen de las notas al pie de cada tabla, leídas en imagen.
