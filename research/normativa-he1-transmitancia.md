# Normativa HE1 — Transmitancia U y límites (T0.1 feature-4) · documento verificado

> **Tarea T0.1 — feature-4 (módulo HE1, predimensionado de envolvente).**
> Documento NORMATIVO VERIFICADO para transcribir a `src/modules/he1/tablas.ts`.
> Cada bloque trae: valores exactos, cita (DB + tabla/artículo + edición/fecha + fuente),
> una `ProcedenciaCTE` sugerida (estructura de `src/lib/cte/tabla.ts`) y veredicto de confianza.
> NO contiene código de aplicación; son DATOS con procedencia, listos para `tablaCTE(proc, datos)`.
>
> **Edición vigente única para todo este documento:** DB-HE **edición 2019** (introducida por
> **RD 732/2019**, BOE 27-12-2019), **texto consolidado 14-jun-2022** (incorpora RD 450/2022 y
> corrección de errores BOE 02-02-2023). No mezclar con DB-HE-2009 ni con borradores 2018.
> *(IDR §4 · A1-22 VERIFICADO confianza alta.)*
>
> **Convenciones de procedencia (innegociable, SPEC §4/§11):** todo valor va envuelto en
> `tablaCTE(procedencia, datos)`. `ProcedenciaCTE = { db, edicion, fecha?, articulo?, tabla?, fuente? }`.

---

## Estado de verificación de fuentes (transparencia de método)

| Bloque | Fuente primaria de verdad | Reverificación esta sesión | Confianza |
|---|---|---|---|
| 1 · Ulim 3.1.1.a | `verif-area-1.md` A1-23 (pdftotext del PDF oficial DB-HE + Guía aplicación DB-HE 2019, **celda a celda**) | WebSearch ×2 coincidentes (atribución de filas) | **ALTA** |
| 2 · Rsi/Rse DA DB-HE/1 T.1 | `verif-area-1.md` A1-24 (pdftotext literal DA DB-HE/1 Tabla 1 y Tabla 6) | WebSearch confirma estructura | **ALTA** |
| 3 · λ materiales | Catálogo de Elementos Constructivos del CTE (CEC) / DA DB-HE/1 | WebSearch (valores orientativos) | **MEDIA — orientativo, NO exigencia** |

⚠️ **Limitación de esta sesión:** los PDF maquetados de codigotecnico.org tienen las tablas
**rasterizadas (JPEG embebido)**; `WebFetch` no puede extraerlas (devuelve "contenido codificado").
Es la misma limitación que sufrió la investigación original. La verdad celda a celda proviene de la
**verificación inversa del repo, que sí usó `pdftotext`** sobre el PDF oficial y la Guía de aplicación
(A1-23 marcada VERIFICADO/REFUTÓ-la-afirmación-original con confianza ALTA). Recomendación operativa:
en la cámara de implementación de feature-4, reverificar visualmente la Tabla 3.1.1.a contra el PDF
maquetado oficial con poppler/lector PDF (no disponible en este entorno: `pdftoppm`/`pdftotext` no
instalados aquí). Los números de abajo NO están en §9 (pendientes); están verificados, pero el PDF
maquetado es la prueba final.

---

## BLOQUE 1 — Tabla Ulim CORREGIDA (Tabla 3.1.1.a-HE1)

**Cita exacta:** DB-HE, Sección HE1 "Condiciones para el control de la demanda energética",
apartado **3.1.1**, **Tabla 3.1.1.a-HE1** "Valores límite de transmitancia térmica, Ulim [W/m²K]".
Edición **2019 (RD 732/2019)**, consolidado **14-jun-2022**. Fuente: `codigotecnico.org/.../DBHE.pdf`
+ Guía de aplicación DB-HE 2019.

Columnas = **zona climática de invierno** (la letra de invierno de la zona del municipio: α/A/B/C/D/E).
Valores en **W/m²K**.

| Elemento (símbolo) | α | A | B | C | D | E |
|---|---|---|---|---|---|---|
| Muros y suelos en contacto con el aire exterior (**UM, US**) | 0,80 | 0,70 | 0,56 | 0,49 | 0,41 | 0,37 |
| Cubiertas en contacto con el aire exterior (**UC**) | 0,55 | 0,50 | 0,44 | 0,40 | 0,35 | 0,33 |
| Muros, suelos y cubiertas en contacto con espacios no habitables o con el terreno (**UT**) | 0,90 | 0,80 | 0,75 | 0,70 | 0,65 | 0,59 |
| Huecos (marco + vidrio + cajón de persiana) (**UH**) | 3,2 | 2,7 | 2,3 | 2,1 | 1,8 | 1,80 |
| Puertas con superficie semitransparente ≤ 50 % | **5,7** (valor único, todas las zonas) | | | | | |
| Medianerías o particiones interiores de la envolvente (**UMD**) | **— (sin valor de Ulim en esta tabla)** | | | | | |

### Correcciones aplicadas (§0 / A1-23 REFUTÓ la afirmación original)
- **Huecos NO se limitan a 5,7.** Esa cifra es la de **PUERTAS**. La serie **3,2 / 2,7 / 2,3 / 2,1 /
  1,8 / 1,80 corresponde a HUECOS (UH)**, no a medianerías.
- **Medianerías (UMD): NO llevan valor numérico de Ulim en la Tabla 3.1.1.a.** La limitación de
  particiones interiores se trata aparte (Tabla 3.2-HE1, fuera del alcance de predimensionado por
  elemento de envolvente exterior). → En `tablas.ts`, modelar UMD como `null` y que el motor NO
  aplique veredicto de transmitancia a una medianería contra esta tabla.
- **UT = 0,90 / 0,80 / 0,75 / 0,70 / 0,65 / 0,59** (contacto con no habitables o terreno). Confirmado;
  no confundir con medianerías (un resumen automático de buscador llegó a atribuir esta serie a
  medianerías — es FALSO; pertenece a UT).

### Notas de aplicación (del propio DB, relevantes para el motor)
- La **zona climática** se toma de la tabla del Apéndice B del DB-HE por municipio/altitud; la **letra
  de invierno** (α, A, B, C, D, E) es la que indexa columnas de esta tabla. (En la app es un INPUT del
  usuario con origen "dato climático", no se calcula aquí.)
- "Muros y suelos en contacto con el aire exterior" comparten fila (mismo Ulim para UM y US).
- Estos son valores **límite** (techo): veredicto **CUMPLE si U_elemento ≤ Ulim(zona, tipo)**;
  **NO CUMPLE si U > Ulim**. Para puertas, comparar contra 5,7 único. Para medianerías, no aplica
  esta limitación (devolver "no aplica", no "cumple").

### ProcedenciaCTE sugerida
```ts
const PROC_HE1_ULIM = {
  db: "DB-HE1",
  edicion: "2019 (RD 732/2019)",
  fecha: "2022-06-14",            // texto consolidado
  articulo: "ap. 3.1.1",
  tabla: "Tabla 3.1.1.a-HE1",
  fuente: "codigotecnico.org · DB-HE · Valores límite de transmitancia Ulim [W/m²K]",
} as const;
```

**Estructura de datos sugerida** (zona → tipo → Ulim; `null` = sin límite en esta tabla):
```ts
type ZonaInvierno = "alpha" | "A" | "B" | "C" | "D" | "E";
type TipoElementoHE1 =
  | "muro_suelo_exterior"   // UM, US
  | "cubierta_exterior"     // UC
  | "contacto_nh_terreno"   // UT
  | "hueco"                 // UH
  | "puerta"                // ≤50% semitransparente (valor único)
  | "medianeria";           // UMD — sin Ulim aquí (null)

// W/m²K. null => no se limita por esta tabla (medianería).
const ULIM_W_m2K /* : Record<TipoElementoHE1, Record<ZonaInvierno, number | null>> */ = {
  muro_suelo_exterior: { alpha: 0.80, A: 0.70, B: 0.56, C: 0.49, D: 0.41, E: 0.37 },
  cubierta_exterior:   { alpha: 0.55, A: 0.50, B: 0.44, C: 0.40, D: 0.35, E: 0.33 },
  contacto_nh_terreno: { alpha: 0.90, A: 0.80, B: 0.75, C: 0.70, D: 0.65, E: 0.59 },
  hueco:               { alpha: 3.2,  A: 2.7,  B: 2.3,  C: 2.1,  D: 1.8,  E: 1.80 },
  puerta:              { alpha: 5.7,  A: 5.7,  B: 5.7,  C: 5.7,  D: 5.7,  E: 5.7  }, // valor único 5,7
  medianeria:          { alpha: null, A: null, B: null, C: null, D: null, E: null }, // sin Ulim aquí
} as const;
```

**Confianza:** ALTA. (Triple coincidencia: PDF oficial vía pdftotext + Guía de aplicación DB-HE 2019 +
cross-check web. Recomendado: una reverificación visual final del PDF maquetado al cerrar el módulo.)

---

## BLOQUE 2 — Resistencias térmicas superficiales Rsi / Rse (DA DB-HE/1, Tabla 1)

**Cita exacta:** **Documento de Apoyo DA DB-HE/1** "Cálculo de parámetros característicos de la
envolvente", **ecuación (2)** y **Tabla 1** "Resistencias térmicas superficiales de cerramientos en
contacto con el aire exterior [m²K/W]". Fuente: `codigotecnico.org/.../DA_DB-HE-1...pdf`.
Documento de apoyo asociado al DB-HE edición 2019.

**Fórmula:** `U = 1 / RT`, con `RT = Rsi + ΣRi + Rse` y `Ri (capa) = espesor_m / λ_W_mK`. [m²K/W]

### Tabla 1 — cerramientos en contacto con el aire EXTERIOR [m²K/W]
| Posición / sentido del flujo de calor | Rsi | Rse |
|---|---|---|
| Cerramiento **vertical** o ±60° con la horizontal — **flujo horizontal** | **0,13** | **0,04** |
| Cerramiento **horizontal** — **flujo ascendente** (cubiertas/techos) | **0,10** | **0,04** |
| Cerramiento **horizontal** — **flujo descendente** (suelos) | **0,17** | **0,04** |

> Regla de selección del flujo (para el motor): el sentido del flujo lo define la dirección
> predominante de la pérdida de calor en régimen de calefacción. Muro vertical → horizontal (0,13).
> Cubierta/techo (calor sube) → ascendente (0,10). Suelo (calor baja) → descendente (0,17).
> Rse exterior es **0,04** en los tres casos.

### Tabla 6 — particiones INTERIORES y cerramientos en contacto con espacios no habitables [m²K/W]
(Para UT con espacio no habitable / particiones interiores: **ambas caras interiores**.)
| Posición / sentido del flujo | Rsi | Rse |
|---|---|---|
| Flujo **horizontal** | 0,13 | 0,13 |
| Flujo **ascendente** | 0,10 | 0,10 |
| Flujo **descendente** | 0,17 | 0,17 |

> Uso: para un elemento en contacto con un espacio **no habitable**, las dos resistencias
> superficiales son interiores (0,13/0,13, etc.); para contacto con el **terreno** el cálculo del DA
> DB-HE/1 es específico (resistencia del terreno), fuera del predimensionado simple por capas. Para el
> predimensionado por elemento exterior (caso por defecto de la app) usar **Tabla 1**.

### Cámaras de aire (mismo DA DB-HE/1, Tabla 2 — "sin ventilar") [m²K/W] — ORIENTATIVO
Resistencia térmica de cámaras de aire **sin ventilar** (valores típicos para predimensionar; la tabla
oficial interpola linealmente por espesor):

| Espesor cámara | Flujo horizontal | Flujo ascendente | Flujo descendente |
|---|---|---|---|
| 5 mm | 0,11 | 0,11 | 0,11 |
| 10 mm | 0,15 | 0,15 | 0,15 |
| 15 mm | 0,16 | 0,16 | 0,17 |
| 25 mm | 0,18 | 0,16 | 0,19 |
| ≥ 25 mm (valor estable) | ~0,18 | ~0,16 | ~0,21 |

> ⚠️ **Confianza MEDIA** para esta sub-tabla de cámaras: la búsqueda confirma que **existe la Tabla 2
> del DA DB-HE/1 con interpolación lineal por espesor** y la regla "a partir de 20 mm (horizontal) la
> resistencia se mantiene constante", pero **no se transcribió celda a celda con pdftotext** en esta
> sesión (PDF rasterizado). Los valores de arriba son los de referencia habituales de esa tabla pero
> deben **verificarse contra el PDF maquetado del DA DB-HE/1 antes de usarse en cálculo** (igual estatus
> que §9). Para una cámara de aire sin ventilar de ~20–50 mm, **0,16–0,18 m²K/W** es la cifra de
> predimensionado segura. Cámaras **ventiladas/muy ventiladas** se tratan distinto (no se considera la
> cámara ni las capas exteriores a ella) → fuera de predimensionado simple.

### ProcedenciaCTE sugerida
```ts
const PROC_DA_HE1_RSUP = {
  db: "DA DB-HE/1",
  edicion: "2019 (asociado a RD 732/2019)",
  fecha: "2022-06-14",
  articulo: "ec. (2)",
  tabla: "Tabla 1 (Rsi/Rse exterior) · Tabla 6 (interiores) · Tabla 2 (cámaras de aire)",
  fuente: "codigotecnico.org · DA DB-HE/1 Cálculo de parámetros característicos de la envolvente",
} as const;
```

**Estructura de datos sugerida:**
```ts
type SentidoFlujo = "horizontal" | "ascendente" | "descendente";

// [m²K/W] cerramientos en contacto con aire exterior (Tabla 1)
const RESISTENCIAS_SUPERFICIALES_EXT_m2K_W = {
  horizontal:  { rsi: 0.13, rse: 0.04 }, // muro vertical
  ascendente:  { rsi: 0.10, rse: 0.04 }, // cubierta/techo
  descendente: { rsi: 0.17, rse: 0.04 }, // suelo
} as const;

// [m²K/W] particiones interiores / contacto con no habitable (Tabla 6) — ambas caras interiores
const RESISTENCIAS_SUPERFICIALES_INT_m2K_W = {
  horizontal:  { rsi: 0.13, rse: 0.13 },
  ascendente:  { rsi: 0.10, rse: 0.10 },
  descendente: { rsi: 0.17, rse: 0.17 },
} as const;
```

**Confianza:** ALTA para Tabla 1 y Tabla 6 (leídas literal con pdftotext, A1-24 VERIFICADO).
MEDIA para la sub-tabla de cámaras de aire (no transcrita celda a celda; verificar PDF al implementar).

---

## BLOQUE 3 — Valores λ (conductividad térmica) de referencia — ORIENTATIVO (criterio de predimensionado)

> 🟡 **NO es exigencia del CTE.** Estos λ son **valores orientativos** para montar cerramientos de
> ejemplo realistas en el predimensionado. La fuente reglada es el **Catálogo de Elementos Constructivos
> del CTE (CEC)** y el **DA DB-HE/1**; en proyecto real, λ se toma del **marcado CE / DIT / ficha técnica
> del fabricante** del producto concreto (declaración de prestaciones), que prevalece. En la app deben
> presentarse como valores **por defecto editables**, con la etiqueta "orientativo (CEC del CTE) —
> sustituir por λ del fabricante en proyecto". El λ que use el usuario es un INPUT con origen declarado.

**Cita de la fuente orientativa:** **Catálogo de Elementos Constructivos del CTE (CEC)**, tablas de
materiales (conductividad térmica de diseño λ); coherente con DA DB-HE/1 y UNE-EN ISO 10456.
Fuente pública: `codigotecnico.org/.../CEC/...pdf`.

λ en **W/(m·K)** (valores de diseño habituales; densidad orientativa entre paréntesis):

| Material | λ [W/(m·K)] | Notas |
|---|---|---|
| Hormigón armado (2300–2500 kg/m³) | **2,30** | estructural; conductor (no aísla) |
| Hormigón en masa / áridos densos | 1,65 | |
| Mortero de cemento / enfoscado (1525–1800 kg/m³) | **1,30** | revoco/enfoscado |
| Mortero de cemento denso (>2000 kg/m³) | 1,80 | |
| Enlucido de yeso (1000–1300 kg/m³) | **0,57** | guarnecido/enlucido |
| Placa de yeso laminado PYL / cartón-yeso (≈900 kg/m³) | **0,25** | trasdosados |
| Ladrillo cerámico **perforado** (LP) | **0,49** | fábrica de 1/2 pie habitual |
| Ladrillo cerámico **hueco** (LH) | **0,32** | tabiquería |
| Ladrillo cerámico **macizo** | **0,87** | fábrica vista pesada |
| Bloque de hormigón convencional | 1,00 | (según geometría/relleno) |
| Baldosa cerámica / gres | 1,00 | acabados de suelo |
| Madera de densidad media (frondosa ligera/conífera) | 0,18 | carpintería/estructura ligera |
| **EPS** poliestireno expandido | **0,037** | rango catálogo 0,029–0,046 |
| **XPS** poliestireno extruido | **0,034** | rango 0,033–0,036 |
| **Lana mineral** (MW: roca / vidrio) | **0,035** | rango 0,031–0,050 |
| **PUR / PIR** espuma de poliuretano | **0,028** | rango 0,022–0,040 (proyectado/plancha) |
| **Cámara de aire sin ventilar** | usar **R** (BLOQUE 2), **no λ** | ~0,16–0,18 m²K/W para 20–50 mm |
| Betún / lámina impermeabilizante asfáltica | 0,23 | espesor pequeño, R despreciable |

> **Cerramiento de ejemplo realista** (para tests/property-based y demo de la ficha) — muro de fachada,
> zona D, flujo horizontal:
> 1. Enfoscado de mortero de cemento, 15 mm, λ 1,30 → R = 0,015/1,30 = 0,0115
> 2. Ladrillo perforado LP, 115 mm, λ 0,49 → R = 0,115/0,49 = 0,2347
> 3. **XPS**, 60 mm, λ 0,034 → R = 0,060/0,034 = 1,7647
> 4. Cámara de aire sin ventilar, 30 mm → R ≈ 0,18 (de tabla, BLOQUE 2)
> 5. Tabique LH, 70 mm, λ 0,32 → R = 0,070/0,32 = 0,2188
> 6. Enlucido de yeso, 15 mm, λ 0,57 → R = 0,015/0,57 = 0,0263
> + Rsi 0,13 + Rse 0,04 (flujo horizontal exterior).
> `RT ≈ 0,13 + 0,0115 + 0,2347 + 1,7647 + 0,18 + 0,2188 + 0,0263 + 0,04 = 2,606 m²K/W`
> `U = 1/RT ≈ 0,384 W/m²K`. **Ulim muro zona D = 0,41 → 0,384 ≤ 0,41 ⇒ CUMPLE.** (Si se quita el XPS,
> U sube muy por encima de 0,41 ⇒ NO CUMPLE: sirve de invariante "U decrece al añadir aislante".)

### ProcedenciaCTE sugerida
```ts
const PROC_LAMBDA_REF = {
  db: "Catálogo de Elementos Constructivos del CTE (CEC)", // NO exigencia: criterio orientativo
  edicion: "CEC (valores de diseño) · coherente con DA DB-HE/1 y UNE-EN ISO 10456",
  articulo: "valores λ de diseño orientativos — sustituibles por λ del fabricante (marcado CE/DIT)",
  fuente: "codigotecnico.org · Catálogo de Elementos Constructivos del CTE",
} as const;
```

**Confianza:** MEDIA (valores orientativos por su naturaleza; los rangos son los del catálogo y de la
literatura técnica habitual). Suficiente y honesto para predimensionado. **NO usar como veredicto de
cumplimiento de un producto concreto** — para eso, λ del fabricante.

---

## Resumen de lo que entra (y lo que NO) en `src/modules/he1/tablas.ts`

**Entra como tabla versionada (`tablaCTE`):**
1. `ULIM_W_m2K` (Tabla 3.1.1.a-HE1) — **valores duros, confianza alta**, con la corrección §0 aplicada.
2. `RESISTENCIAS_SUPERFICIALES_EXT_m2K_W` y `..._INT_m2K_W` (DA DB-HE/1 Tablas 1 y 6) — confianza alta.
3. `LAMBDA_REF_W_mK` — **valores por defecto editables, etiquetados orientativos** (no exigencia).

**Queda como PENDIENTE de transcripción literal (mismo estatus que §9), NO inventar:**
- Sub-tabla de **cámaras de aire** (Tabla 2 DA DB-HE/1) — verificar celda a celda contra PDF maquetado.
- **ψ de puentes térmicos (DA DB-HE/3)** — no es objeto de T0.1; lo aporta el prerrequisito de feature-4.
- **Procedimiento Glaser + fRsi,min (DA DB-HE/2)** — no es objeto de T0.1 (límites de transmitancia).

**Reglas de veredicto para el motor (no código, criterio normativo):**
- `CUMPLE` ⇔ `U ≤ Ulim(zona, tipo)`; `NO CUMPLE` ⇔ `U > Ulim`.
- Medianerías: **no aplica** la Tabla 3.1.1.a (devolver "no aplica", no "cumple"/"no cumple").
- Puertas: comparar contra 5,7 único, sin indexar por zona.
- Toda cifra de la ficha cita: **DB-HE1 · Tabla 3.1.1.a · edición 2019 (RD 732/2019), consolidado
  14-jun-2022**; resistencias citan **DA DB-HE/1, Tabla 1**; λ se etiqueta **orientativo (CEC del CTE)**.
