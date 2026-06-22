# Normativa HE1 — Condensaciones (superficial + intersticial Glaser) y puentes térmicos

> **Tarea T0.2 de feature-4** (módulo HE1, predimensionado de envolvente).
> Documento normativo verificado, listo para transcribir a `src/modules/he1/tablas.ts`
> y para que el motor implemente el algoritmo. NO contiene código de aplicación;
> contiene procedimiento, fórmulas y datos tabulados con su procedencia y cita.
>
> **Edición de referencia:** DB-HE = edición **2019** (RD 732/2019), texto consolidado
> **14-jun-2022** (incorpora RD 450/2022). El procedimiento de condensaciones y los ψ
> NO viven en el cuerpo del DB-HE sino en sus **Documentos de Apoyo**:
> - **DA DB-HE/1** "Cálculo de parámetros característicos de la envolvente" → U, Rsi/Rse.
> - **DA DB-HE/2** "Comprobación de limitación de condensaciones superficiales e
>   intersticiales en los cerramientos" → fRsi, fRsi,min, Glaser, Psat.
> - **DA DB-HE/3** "Puentes térmicos" → ψ lineales.
> - El **Catálogo de Elementos Constructivos del CTE (CEC)** → λ y µ de materiales.
>
> Estado de verificación: 2026-06-22. Las fórmulas y la tabla fRsi,min están
> **trianguladas contra múltiples fuentes independientes** (codigotecnico.org / cgate.es /
> referencias técnicas reconocidas). Los **ψ exactos del DA DB-HE/3 siguen BLOQUEADOS por
> §9** (las tablas maquetadas no se pudieron leer celda a celda con las herramientas
> disponibles; los valores ψ que aquí figuran son ORIENTATIVOS y deben verificarse
> literalmente contra el PDF maquetado antes de codificarse como dato cerrado).

---

## 0 · Nivel de confianza y nota metodológica (LEER ANTES DE USAR CIFRAS)

| Bloque | Confianza | Cómo se verificó |
|---|---|---|
| Fórmula `fRsi = 1 − U·0,25` (Rsi=0,25 FIJO) | **ALTA** | Confirmada literal por 4 fuentes independientes (cgate, codigotecnico, blogs técnicos, ejemplos de informe). |
| Tabla 1 fRsi,min (DA DB-HE/2) | **ALTA** | Triangulada: clase 5 = 0,80/0,80/0,80/0,90/0,90; clase 4 = 0,66/0,66/0,69/0,75/0,78; clase 3 = 0,50/0,52/0,56/0,61/0,64 (zonas A–E). Coincidente en 2 reproducciones. Verificar el layout exacto de columnas (split de zona C) contra PDF maquetado. |
| Definición de clases de higrometría 3/4/5 | **ALTA** | Texto literal (basado en EN ISO 13788:2002), confirmado. |
| Psat(θ) fórmula de dos ramas, coeficientes 610,5 / 17,269 / 237,3 / 21,875 / 265,5 | **ALTA** | Coeficientes confirmados como ecuaciones [3] (θ≥0) y [4] (θ<0) del DA DB-HE/2 por varias fuentes; coinciden con la fórmula de Magnus estándar. |
| Condiciones interiores por defecto (20 °C; HR clase 5=70%, clase 4=62%, clase 3=55%) | **ALTA** | Confirmadas por referencia técnica que cita el DA DB-HE/2. |
| Procedimiento Glaser paso a paso | **ALTA** (método) / **MEDIA** (parametrización fina) | El método es estándar y coherente entre fuentes; los detalles de condiciones exteriores mensuales por localidad requieren el fichero climático del DB. |
| Criterio binario condensación / balance anual | **ALTA** | Texto literal del DB-HE ap. 3.3 (verificado en verif-area-1, A1-25). |
| µ (factor de resistencia a la difusión) de materiales | **MEDIA** | Rangos del Catálogo de Elementos Constructivos del CTE (CEC). Son rangos genéricos: en proyecto real se usa el µ de la ficha técnica del producto. Para predimensionado, valores de referencia. |
| **ψ tabulados (DA DB-HE/3)** | **BAJA / §9-BLOQUEADO** | La web solo expone rangos orientativos no homogéneos. Las tablas maquetadas del DA DB-HE/3 (función de U del muro, posición del aislante, etc.) **NO se pudieron transcribir celda a celda**. NO codificar como cerradas. |

**Regla de oro mantenida:** todo dato declara `db / edicion / fecha / articulo / tabla / fuente`
y se etiqueta CUMPLE / NO CUMPLE de forma explícita. Lo que es exigencia CTE se separa de lo
que es criterio externo o valor orientativo.

---

## 1 · CONDENSACIÓN SUPERFICIAL — factor de temperatura de la superficie interior fRsi

### 1.1 Fórmula del factor del cerramiento (fRsi)

El factor de temperatura de la superficie interior de un **cerramiento opaco plano** se obtiene
directamente de su transmitancia:

```
fRsi = 1 − U · 0,25
```

- `U` = transmitancia térmica del cerramiento [W/m²K] (la calculada en DA DB-HE/1: U = 1/RT).
- `0,25` = **resistencia superficial interior FIJA [m²K/W]** que el DA DB-HE/2 impone para
  la comprobación de condensaciones superficiales. ⚠️ **No** es el Rsi=0,13 de la Tabla 1 del
  DA DB-HE/1 (ese se usa para U). Para la comprobación de fRsi, el DA fija **Rsi = 0,25**
  (caso desfavorable: mueble adosado, cortina, etc.).

> Definición general (de la que deriva la fórmula anterior bajo régimen estacionario):
> `fRsi = (θsi − θe) / (θi − θe)`, con θsi temperatura superficial interior, θi temperatura
> interior, θe temperatura exterior. Para un cerramiento opaco plano se reduce a `1 − U·Rsi`.
> **Para puentes térmicos** fRsi NO se obtiene de esta fórmula simplificada: requiere el factor
> de temperatura del propio puente (modelo 2D / valores del DA DB-HE/3). En predimensionado por
> elemento usamos la fórmula simplificada del cerramiento plano y avisamos de que los puentes se
> comprueban aparte.

**Procedencia sugerida (bloque fRsi):**
```
{ db: "DA DB-HE/2", edicion: "2019 (RD 732/2019)", fecha: "2022-06-14",
  articulo: "Comprobación de condensaciones superficiales", tabla: "ec. fRsi = 1 − U·0,25",
  fuente: "codigotecnico.org · DA DB-HE/2 Condensaciones" }
```
Confianza: **ALTA**.

### 1.2 Clases de higrometría del espacio interior (de qué depende fRsi,min)

`fRsi,min` depende de (a) la **clase de higrometría** del espacio interior y (b) la **zona
climática de invierno** de la localidad. Las clases (basadas en EN ISO 13788:2002, recogidas
por el DA DB-HE/2):

| Clase | Definición (texto normativo) | HR interior por defecto a 20 °C |
|---|---|---|
| **Clase 5** | Espacios con **gran** producción de humedad: lavanderías, piscinas, etc. | 70 % |
| **Clase 4** | Espacios con **alta** producción de humedad: cocinas industriales, restaurantes, pabellones deportivos, duchas colectivas, similares. | 62 % |
| **Clase 3 o inferior** | Espacios **sin** alta producción de humedad: **todos los espacios de edificios residenciales** y el resto de espacios no incluidos arriba. | 55 % |

> Para predimensionado de **vivienda**, el default es **clase 3 o inferior** (HR interior 55 %
> a 20 °C). Esto cubre la inmensa mayoría de los casos de la app.

**Procedencia:**
```
{ db: "DA DB-HE/2", edicion: "2019 (RD 732/2019)", fecha: "2022-06-14",
  articulo: "Clases de higrometría (EN ISO 13788:2002)",
  fuente: "codigotecnico.org · DA DB-HE/2" }
```
Confianza: **ALTA** (definiciones literales). Las HR interiores por defecto (70/62/55 %):
**ALTA** (confirmadas por referencia técnica que cita el DA).

### 1.3 Tabla 1 — fRsi,min exigido (DA DB-HE/2)

`fRsi,min` por **clase de higrometría** (filas) y **zona climática de invierno** (columnas).
Valores triangulados (verificar el layout de columnas — algunas ediciones desdoblan la zona C):

| Clase de higrometría | A | B | C | D | E |
|---|---|---|---|---|---|
| **Clase 5** | 0,80 | 0,80 | 0,80 | 0,90 | 0,90 |
| **Clase 4** | 0,66 | 0,66 | 0,69 | 0,75 | 0,78 |
| **Clase 3 o inferior** | 0,50 | 0,52 | 0,56 | 0,61 | 0,64 |

> NOTA de maquetación: una fuente devolvió para clase 4 la serie de **6** valores
> "0,56 / 0,66 / 0,66 / 0,69 / 0,75 / 0,78", lo que sugiere que el DA DB-HE/2 puede presentar una
> columna adicional (p.ej. zona α, o desdoble de C en C1/C2). **Verificar celda a celda el número
> y orden de columnas contra el PDF maquetado** (§9) antes de cerrar la tabla. Las 5 columnas A–E
> de arriba son las canónicas y consistentes entre fuentes; la zona **α** (Canarias) usa los
> valores de la columna menos exigente (A) salvo confirmación literal.

**Procedencia:**
```
{ db: "DA DB-HE/2", edicion: "2019 (RD 732/2019)", fecha: "2022-06-14",
  articulo: "Limitación de condensaciones superficiales", tabla: "Tabla 1 (fRsi,min)",
  fuente: "codigotecnico.org · DA DB-HE/2" }
```
Confianza: **ALTA** en los valores A–E; **MEDIA** en el layout de columnas (verificar §9).

### 1.4 Criterio de cumplimiento (binario para el motor)

```
CUMPLE  ⟺  fRsi ≥ fRsi,min
NO CUMPLE ⟺ fRsi < fRsi,min
```

Equivalente operable directamente sobre U (útil para el motor y la barra de "U vs límite"):
```
fRsi = 1 − U·0,25 ≥ fRsi,min   ⟺   U ≤ (1 − fRsi,min) / 0,25
```
es decir, existe una **U máxima por condensación superficial**
`U_max_fRsi = (1 − fRsi,min) / 0,25` que el cerramiento no debe superar. El motor puede
mostrar el más restrictivo entre `Ulim` (Tabla 3.1.1.a, §0) y `U_max_fRsi`.

Ejemplo (vivienda, clase 3, zona D, fRsi,min=0,61): `U_max_fRsi = (1−0,61)/0,25 = 1,56 W/m²K`.
Un muro con U=0,41 → fRsi = 1−0,41·0,25 = 0,8975 ≥ 0,61 → **CUMPLE**.

---

## 2 · CONDENSACIÓN INTERSTICIAL — método de Glaser (DA DB-HE/2)

Procedimiento determinista, apto para implementar como **función pura** `glaser(capas, condiciones)`.
Entrada: cerramiento por capas (cada capa con espesor `e [m]`, conductividad `λ [W/mK]` → R y
factor de difusión `µ [-]` → Sd); condiciones interiores y exteriores (T, HR) del **mes de enero**.

### 2.1 PASO 1 — Distribución de temperaturas por capa

Resistencia térmica total y de cada capa (DA DB-HE/1):
```
R_capa,i = e_i / λ_i                         [m²K/W]
RT       = Rsi + Σ R_capa,i + Rse             [m²K/W]
```
Para el flujo de calor: usar **Rsi/Rse de la Tabla 1 del DA DB-HE/1** según orientación
(vertical 0,13/0,04; ascendente 0,10/0,04; descendente 0,17/0,04). ⚠️ Aquí Rsi es el real
(0,13…0,17), **NO el 0,25** de la comprobación superficial.

Temperatura en cada interfaz (acumulando resistencias desde el interior):
```
θ_se_int = θi − (Rsi / RT) · (θi − θe)        // tras la resistencia superficial interior
θ_n      = θ_(n−1) − (R_capa,n / RT) · (θi − θe)   // tras la capa n
```
Se obtiene el perfil de temperaturas `θ(x)` en cada cara de capa, de interior a exterior.

### 2.2 PASO 2 — Presión de vapor de SATURACIÓN Psat(θ) — forma cerrada programable

El DA DB-HE/2 usa la **fórmula de Magnus** en dos ramas (θ en °C; Psat en Pa):

```
si θ ≥ 0 °C:   Psat(θ) = 610,5 · exp( 17,269 · θ / (237,3 + θ) )      // ec. [3]
si θ <  0 °C:  Psat(θ) = 610,5 · exp( 21,875 · θ / (265,5 + θ) )      // ec. [4]
```

Coeficientes EXACTOS (verificados): `610,5` (Pa) · `17,269` / `237,3` (rama positiva) ·
`21,875` / `265,5` (rama negativa). Se evalúa Psat en CADA interfaz usando la θ del PASO 1.

**Procedencia:**
```
{ db: "DA DB-HE/2", edicion: "2019 (RD 732/2019)", fecha: "2022-06-14",
  articulo: "Presión de vapor de saturación", tabla: "ec. [3] y [4]",
  fuente: "codigotecnico.org · DA DB-HE/2" }
```
Confianza: **ALTA**.

### 2.3 PASO 3 — Presión de vapor REAL (interior y exterior)

La presión de vapor en un ambiente es la fracción de su saturación dada por la humedad relativa:
```
P = φ · Psat(θ)            // φ = humedad relativa [fracción 0..1]
Pi = φi · Psat(θi)         // interior  (φi: 0,55 / 0,62 / 0,70 según clase de higrometría)
Pe = φe · Psat(θe)         // exterior  (θe, φe del mes de enero de la localidad)
```

### 2.4 PASO 4 — Difusividad al vapor por capa (Sd) y reparto de presiones

Resistencia a la difusión de vapor de cada capa, expresada como **espesor de aire equivalente Sd**:
```
Sd_i = µ_i · e_i           [m]   (µ adimensional; e en m)
Sd_T = Σ Sd_i              [m]
```
La presión de vapor REAL **sin condensación** varía LINEALMENTE con la resistencia al vapor
acumulada (no con la temperatura):
```
P_n = Pi − (Σ_{k≤n} Sd_k / Sd_T) · (Pi − Pe)
```
(El plano de referencia es la cara interior. Las resistencias superficiales al vapor se
desprecian frente a las de las capas — convención del método.)

### 2.5 PASO 5 — Criterio interfaz a interfaz (condensación SÍ/NO)

En cada interfaz se compara la **presión de vapor real** con la **de saturación** a esa temperatura:
```
Si  P_n ≤ Psat(θ_n)  en TODAS las interfaces  → NO hay condensación intersticial.
Si  P_n >  Psat(θ_n) en ALGUNA interfaz       → SÍ se produce condensación en el cerramiento.
```
Cuando hay condensación, la recta de presión real `P_n` se corrige geométricamente
(método de Glaser: tangentes a la curva de saturación desde Pi y Pe, "envolvente convexa")
para localizar el/los plano(s) de condensación y calcular el caudal condensado.

### 2.6 PASO 6 — Balance anual (criterio CTE literal) y veredicto binario del motor

Exigencia literal del DB-HE ap. 3.3 (verificado, A1-25):
> "En ningún caso, la **máxima condensación acumulada** en cada periodo anual podrá superar la
> cantidad de **evaporación posible** en el mismo periodo."

```
CUMPLE  ⟺  (no hay condensación en ninguna interfaz)
            OR  (Σ condensación anual ≤ Σ evaporación anual)
NO CUMPLE ⟺  condensación anual acumulada > evaporación anual
```

**Decisión de alcance para PREDIMENSIONADO (motor binario simplificado):**
El balance mensual completo (12 meses con datos climáticos por localidad) es propio de HULC/
CYPETHERM. Para el predimensionado por elemento, el motor usa el criterio conservador del
**mes de enero** (el más desfavorable):
- Si **no hay condensación en enero** (PASO 5 todo `P_n ≤ Psat`) → **CUMPLE** (verde): si no
  condensa en el mes peor, no condensa el año → evaporación anual ≥ 0 = condensación.
- Si **hay condensación en enero** → marcar **REVISAR / advertencia** (ámbar), NO un NO CUMPLE
  tajante: el balance anual (evaporación de meses cálidos) podría compensarlo, y eso excede el
  predimensionado. La ficha debe indicar "requiere comprobación de balance anual (DA DB-HE/2)".

Esto es coherente con el no-goal de feature-4 (no modelar el edificio entero) y mantiene el
veredicto honesto.

### 2.7 Condiciones de cálculo por defecto (defaults razonables, citados)

| Magnitud | Valor por defecto | Origen | Confianza |
|---|---|---|---|
| Temperatura interior θi | **20 °C** | DA DB-HE/2 (condición interior de cálculo) | ALTA |
| HR interior φi (clase 3 — vivienda) | **55 %** | DA DB-HE/2 / clase higrometría 3 | ALTA |
| HR interior φi (clase 4) | **62 %** | DA DB-HE/2 / clase higrometría 4 | ALTA |
| HR interior φi (clase 5) | **70 %** | DA DB-HE/2 / clase higrometría 5 | ALTA |
| Temperatura exterior θe (enero) | **dato climático de la localidad** | Ficheros/zonas climáticas del DB-HE (Anejo). NO es constante. | — (input) |
| HR exterior φe (enero) | **dato climático de la localidad** | Ídem. Para predimensionado, valor típico ~80–90 % si no se dispone del dato. | MEDIA (default) |

> El θe y φe de enero por localidad provienen del **Anejo de zonas climáticas del DB-HE** /
> ficheros climáticos. El motor debe pedirlos como input (o derivarlos de la zona climática) y
> declararlos como **dato climático** en la ficha, NO como cifra del DA.

### 2.8 µ — factor de resistencia a la difusión del vapor de agua (referencia de predimensionado)

`µ` (adimensional) del **Catálogo de Elementos Constructivos del CTE (CEC)**. Son rangos
genéricos para predimensionado; en proyecto real prevalece el µ de la ficha técnica del producto.
`Sd = µ · e`.

| Material | µ [-] (referencia CEC) | Notas |
|---|---|---|
| Cámara de aire sin ventilar | ≈ 1 | (ventilada → se considera no resistente, exterior). |
| Lana mineral (MW) | ≈ 1 | Muy permeable al vapor. |
| Hormigón armado | 70 – 120 | Según densidad. |
| Mortero de cemento / enfoscado | ≈ 10 | |
| Ladrillo perforado / hueco | ≈ 10 | |
| Ladrillo macizo | ≈ 10 | |
| Placa de yeso laminado / yeso | ≈ 6 – 10 | |
| EPS (poliestireno expandido) | 20 – 100 | |
| XPS (poliestireno extruido) | 100 – 2.200 | Alta resistencia al vapor (barrera intrínseca). |
| PUR / PIR (poliuretano) | 20 – 150 | |
| Lámina impermeabilizante / barrera de vapor | muy alto (≈ ∞ / Sd≥equivalente declarado) | Usar Sd declarado del producto. |
| Madera | 20 – 50 | Según especie/densidad. |
| Corcho | ≈ 5 – 10 | |

**Procedencia:**
```
{ db: "Catálogo de Elementos Constructivos del CTE (CEC)", edicion: "CEC vigente",
  articulo: "Propiedades higrotérmicas de materiales (µ)",
  fuente: "codigotecnico.org · CEC", }  // criterio de predimensionado, NO exigencia numérica
```
Confianza: **MEDIA** (rangos genéricos). ⚠️ Etiquetar en la ficha como "valor de referencia CEC;
en proyecto, usar el µ/Sd de la ficha técnica del producto".

---

## 3 · PUENTES TÉRMICOS — ψ lineales tabulados (DA DB-HE/3)

> ⚠️⚠️ **§9-BLOQUEADO.** Las tablas maquetadas del DA DB-HE/3 (ψ en función de la transmitancia
> del muro, la posición del aislamiento, el tipo de forjado, etc.) **NO se han podido transcribir
> celda a celda** con las herramientas disponibles (el PDF es maquetado y la web solo expone
> rangos orientativos heterogéneos). Los valores de abajo son **ORIENTATIVOS** y **NO deben
> codificarse como dato cerrado** hasta su verificación literal contra el PDF maquetado de
> codigotecnico.org. Esta sección DESBLOQUEA el procedimiento y la estructura de datos, pero NO
> las cifras finales.

### 3.1 Qué es exigencia y qué es criterio

- **Exigencia CTE (verificado, A1-26):** el DB-HE ap. 4.1.d) obliga a **caracterizar** los
  puentes térmicos de la envolvente. El **cálculo de ψ** se remite al **DA DB-HE/3**. El método
  global **Klim** (Tablas 3.1.1.b/c-HE1) ya **engloba** el efecto de los puentes térmicos a nivel
  de coeficiente global de transmisión → alternativa NO bloqueante para feature-4.
- **Criterio / orientativo:** los valores ψ por tipo de encuentro de abajo (rangos) son
  orientativos del DA DB-HE/3 / práctica habitual, no un único número exigible: el ψ real depende
  del detalle constructivo (continuidad del aislante, frente de forjado aislado o no, etc.).

### 3.2 Cómo se integra ψ en el predimensionado

El puente térmico lineal aporta al coeficiente de transmisión de la envolvente un término
proporcional a su **longitud L** y a su transmitancia lineal **ψ**:
```
H_PT = Σ ( ψ_j · L_j )      [W/K]      // suma sobre todos los encuentros lineales j
```
que se añade a las pérdidas 1D de los cerramientos `Σ U_i·A_i`. Convención de longitudes:
medir L según el sistema de dimensiones del DA DB-HE/3 (habitualmente **dimensiones interiores**;
verificar contra PDF). **A título informativo por elemento** en el predimensionado: mostrar el
ψ del encuentro asociado al cerramiento, sin recalcular el edificio entero (no-goal). Si se quiere
un veredicto, se compara contra los límites del DA (ver 3.4), no contra Ulim.

### 3.3 Tabla ORIENTATIVA de ψ por tipo de encuentro (PENDIENTE de verificación literal §9)

| Tipo de encuentro (puente térmico lineal) | ψ orientativo [W/(m·K)] | Confianza |
|---|---|---|
| Frente de forjado (entre pisos) | 0,2 – 0,8 (≤ ~0,1 si aislamiento continuo por el exterior) | BAJA — verificar §9 |
| Encuentro fachada–cubierta | hasta ~1,0 (caso desfavorable) | BAJA — verificar §9 |
| Encuentro fachada–solera / forjado en contacto con terreno | variable según detalle | BAJA — verificar §9 |
| Esquina saliente (vertical) | 0,05 – 0,15 | BAJA — verificar §9 |
| Esquina entrante | negativo o ≈ 0 (geometría favorable) | BAJA — verificar §9 |
| Contorno de hueco (jamba / dintel / alféizar) | 0,05 – 0,3 (≤ ~0,5 límite) | BAJA — verificar §9 |
| Pilar integrado en fachada | según U del muro y aislamiento del pilar | BAJA — verificar §9 |
| Pilar en esquina | según detalle | BAJA — verificar §9 |
| Partición interior con fachada | bajo | BAJA — verificar §9 |

> ⚠️ Estos rangos NO son la tabla del DA DB-HE/3. El DA tabula ψ en función de variables
> (U del muro, posición del aislamiento, espesor del forjado…) que aquí no se han transcrito.
> **NO codificar como `as const` cerrado** — dejar la estructura de datos con un flag
> `pendienteVerificacionPDF: true` y bloquear el cierre de HS/HE1-PT hasta la transcripción literal.

### 3.4 Límites orientativos reportados (verificar — NO confirmados literal)

Algunas fuentes secundarias reportan límites máximos de ψ (p.ej. ≤ 1,0 W/(m·K) en frentes de
forjado/encuentro fachada-cubierta; ≤ 0,5 W/(m·K) en contornos de hueco). **NO están confirmados
contra el DA DB-HE/3 maquetado** y podrían ser criterios de programas de certificación, no del DA.
Tratar como ORIENTATIVO hasta verificación (§9).

**Procedencia (bloque puentes térmicos):**
```
{ db: "DA DB-HE/3", edicion: "2019 (RD 732/2019)", fecha: "2022-06-14",
  articulo: "Puentes térmicos (transmitancia térmica lineal ψ)", tabla: "PENDIENTE §9",
  fuente: "codigotecnico.org · DA DB-HE/3" }
```
Confianza: **BAJA / §9-BLOQUEADO**. Exigencia de caracterizar (DB-HE ap. 4.1.d): **ALTA**.

---

## 4 · Estructura de datos sugerida para `src/modules/he1/tablas.ts`

Siguiendo el patrón verificado del repo (`tablaCTE()` + `ProcedenciaCTE`, ver
`src/lib/cte/tabla.ts` y `src/modules/hs4/tablas.ts`), con separación exigencia / criterio /
pendiente:

```ts
// --- fRsi,min (DA DB-HE/2, Tabla 1) — EXIGENCIA ---
export type ClaseHigrometria = "clase_3_o_inferior" | "clase_4" | "clase_5";
export type ZonaInvierno = "A" | "B" | "C" | "D" | "E"; // + "alpha" si se confirma
export const FRSI_MIN_TABLA_1 = tablaCTE(
  { db: "DA DB-HE/2", edicion: "2019 (RD 732/2019)", fecha: "2022-06-14",
    articulo: "Limitación de condensaciones superficiales", tabla: "Tabla 1",
    fuente: "codigotecnico.org · DA DB-HE/2" },
  { fRsiMin: {
      clase_5:           { A: 0.80, B: 0.80, C: 0.80, D: 0.90, E: 0.90 },
      clase_4:           { A: 0.66, B: 0.66, C: 0.69, D: 0.75, E: 0.78 },
      clase_3_o_inferior:{ A: 0.50, B: 0.52, C: 0.56, D: 0.61, E: 0.64 },
    } satisfies Record<ClaseHigrometria, Record<ZonaInvierno, number>>,
  },
);

// --- Constantes de condensación superficial e intersticial ---
export const COND_SUPERFICIAL = tablaCTE(
  { db: "DA DB-HE/2", edicion: "2019 (RD 732/2019)", fecha: "2022-06-14",
    articulo: "fRsi = 1 − U·0,25", fuente: "codigotecnico.org · DA DB-HE/2" },
  { rsiCondensacion_m2KW: 0.25 } as const, // FIJO, distinto del Rsi de U
);

// HR interior por clase de higrometría (a 20 °C) — condiciones de cálculo del DA DB-HE/2
export const HR_INTERIOR = tablaCTE(
  { db: "DA DB-HE/2", edicion: "2019 (RD 732/2019)", fecha: "2022-06-14",
    articulo: "Condiciones interiores / clases de higrometría",
    fuente: "codigotecnico.org · DA DB-HE/2" },
  { tempInterior_C: 20,
    hrInterior_pct: { clase_3_o_inferior: 55, clase_4: 62, clase_5: 70 } } as const,
);

// Coeficientes de la curva de saturación de Magnus (ec. [3] θ≥0 / [4] θ<0)
export const PSAT_MAGNUS = tablaCTE(
  { db: "DA DB-HE/2", edicion: "2019 (RD 732/2019)", fecha: "2022-06-14",
    articulo: "Presión de vapor de saturación", tabla: "ec. [3] y [4]",
    fuente: "codigotecnico.org · DA DB-HE/2" },
  { p0_Pa: 610.5,
    positiva: { a: 17.269, b: 237.3 },   // θ ≥ 0 °C
    negativa: { a: 21.875, b: 265.5 } }  // θ < 0 °C
  as const,
);

// --- µ de materiales (CEC) — CRITERIO de predimensionado, no exigencia numérica ---
// usar `ProcedenciaCriterioExterno`-style: naturaleza "referencia CEC" + flag.

// --- ψ puentes térmicos (DA DB-HE/3) — PENDIENTE §9 ---
// NO cerrar. Estructura con flag `pendienteVerificacionPDF: true`.
```

Notas de implementación:
- La fórmula Psat se programa con la `tablaCTE` `PSAT_MAGNUS` arriba; el motor implementa
  `psat(theta): number` puro a partir de esos coeficientes (sin hardcodear cifras en la lógica).
- `U_max_fRsi = (1 − fRsi,min)/0,25` permite mostrar la condensación superficial en la misma
  barra "U vs límite" del SVG (delega el render en `svg-visualizacion`).
- El motor Glaser es una **función pura** `glaser(capas, condiciones): ResultadoGlaser`
  (delegar el algoritmo en `motor-calculo`; este documento le da el procedimiento exacto).

---

## 5 · Trazabilidad de fuentes

- DB-HE (texto consolidado 14-jun-2022): `https://www.codigotecnico.org/pdf/Documentos/HE/DBHE.pdf`
- DA DB-HE/1 (U, Rsi/Rse): `https://www.codigotecnico.org/pdf/Documentos/HE/DA_DB-HE-1.pdf`
- DA DB-HE/2 (condensaciones): `https://www.codigotecnico.org/pdf/Documentos/HE/DA-DB-HE-2_-_Condensaciones.pdf`
  (mirror: `https://www.cgate.es/hit/Hit2016-2/DA-DB-HE-2_-_Condensaciones.pdf`)
- DA DB-HE/3 (puentes térmicos): `https://www.codigotecnico.org/pdf/Documentos/HE/DA-DB-HE-3_Puentes_termicos.pdf`
  (mirror: `https://www.cgate.es/hit/Hit2016-2/DA-DB-HE-3_Puentes_termicos.pdf`)  ← §9 PENDIENTE literal
- Catálogo de Elementos Constructivos (µ, λ): `https://www.codigotecnico.org/Programas/CatalogoElementosConstructivos.html`
- Cross-checks técnicos: deltoroantunez.com (HE 2019 condensaciones), construmatica.com
  (clases de higrometría), certificadosenergeticos.com (puentes térmicos), verificacioncte.es.
- Repo: `IDR-INSTALACIONES.md` §4/§9; `research/area-1-calculo-cte-tier1.md` (A1-22..A1-26);
  `research/verif-area-1.md` (A1-23 REFUTADO → tabla Ulim corregida en §0; A1-25/A1-26).

### Pendientes a cerrar antes de dar HE1-condensaciones/PT por cerrado (§9)
1. **ψ del DA DB-HE/3**: transcribir las tablas maquetadas celda a celda (BLOQUEANTE).
2. **fRsi,min Tabla 1**: confirmar nº y orden de columnas (¿zona α?, ¿desdoble C1/C2?) contra PDF.
3. **θe / φe de enero por zona climática**: localizar el Anejo climático del DB-HE (input del motor).
4. Confirmar convención de dimensiones (interiores/exteriores) para L en H_PT.
