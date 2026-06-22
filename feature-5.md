# feature-5 — HS6 · Protección frente a la exposición al radón (predimensionado)

> Vertical completo. **Primer módulo del Tier 2** (gancho SEO, nicho joven, poca competencia;
> `IDEA §2` / `IDR §12`). Cálculo **cerrado por elemento** → patrón de referencia **HE1, no HS4**;
> **no usa el kernel de grafo**. Referencia I+D: dossier normativo de Fase 1 (este documento lo
> consolida).

## Contexto normativo

**DB-HS6 "Protección frente a la exposición al radón"**, introducido por **RD 732/2019** (BOE núm.
311, 27-dic-2019). **Sección nueva**, sin modificaciones posteriores (el RD 450/2022 modifica
DB-HE/SUA y solo HS4 dentro de HS; **HS6 queda inalterado**). Cadena de cita: `DB-HS6 (RD 732/2019)`.
Transpone la Directiva 2013/59/EURATOM.

**Solo predimensionado / verificación de solución por elemento** — NO se modela el edificio entero.

## Estado de verificación (prerrequisito §6 SPEC)

Verificado **por triangulación** (texto consolidado del BOE `BOE-A-2019-18528` + 5-6 fuentes
técnicas concordantes), mismo estándar aceptado en HS4/HS5/HE1. **Pendiente de auditoría literal
celda-a-celda contra el PDF maquetado** (poppler/Python/Bash no disponibles en los sub-agentes; usar
node+mupdf-WASM como en HE1 cuando se cierre):
- Estructura exacta de columnas del **Apéndice B** (¿código INE?, lista-por-zona vs fila-por-municipio).
- Numeración fina del art. 3 (3.1/3.2/3.3/3.4) y si los niveles son Tabla o texto.
- Valores MEDIA-ALTA: lámina-tipo (≤1e-11 m²/s, ≥2 mm), 10 cm²/ml de ventilación natural, altura
  cámara ~5 cm, 0,1 ren/h. Marcados como pendientes en la `procedencia` de `tablas.ts`.
- **Fórmula de exhalación E** (sub-cálculo de barrera) — diverge entre fuentes → **DIFERIDA** (ver Fuera de alcance).

## Entradas (`HS6Inputs`)

- **`zona: "I" | "II" | "sin_exigencia"`** — del Apéndice B según el municipio (entrada directa; el
  listado de municipios no se embebe). `municipio?: string` informativo para la ficha.
- **`localHabitableEnContactoConTerreno: boolean`** — ámbito (art. 1). Si es `false` o zona =
  `sin_exigencia` → HS6 no exige medidas.
- **`soluciones: SolucionHS6Input[]`** — unión discriminada por `tipo`:
  - **barrera**: `via` (`lamina_tipo` | `calculo`), `continuidadSellada`, `penetracionesSelladas`,
    `puertasEstancas`, `coefDifusion_m2_s?`, `espesor_mm?`.
  - **espacio_contencion**: `ventilacion` (`natural` | `mecanica`), `perimetro_m`,
    `areaAberturas_cm2?`, `alturaCamara_mm?`.
  - **despresurizacion**: `redCaptacion`, `extraccionMecanica`, `geotextil`.

## Cálculo (`calcHS6` — Nivel A)

1. **Ámbito**: ¿aplica HS6? (local habitable en contacto con terreno **y** zona ≠ `sin_exigencia`).
   Si no → veredicto neutral "Sin exigencia HS6".
2. **Nivel exigido por zona** (art. 3.1): **Zona I** = 1 medida (barrera **o** espacio de contención
   ventilado). **Zona II** = barrera **obligatoria** + 1 adicional (contención ventilado **o**
   despresurización).
3. **Adecuación de la combinación**: contar medidas válidas y comprobar `combinacionSuficiente`.
4. **Checklist cualitativo por medida** (barrera: sellados/penetraciones/puertas; espacio de
   contención natural: área ≥ 10 cm²/ml·perímetro, altura ≥ 5 cm; despresurización: captación +
   extracción + geotextil). Lámina-tipo: coef. difusión ≤ 1e-11 m²/s y espesor ≥ 2 mm.
5. **Veredicto** = `peor()` de todos los estados; `elementoCriticoId` señala la medida a resaltar
   (o el sentinela `HS6_FALTA_MEDIDA` cuando falta una medida exigida); `warnings[]` en español.

`hs6Defaults`: sótano habitable en Zona II que CUMPLE (barrera lámina-tipo + cámara ventilada
natural bien dimensionada).

## Render SVG

**Sección vertical** terreno → barrera → espacio de contención ventilado (aberturas/flechas) →
solera/forjado → local habitable; tubo de despresurización si está presente. **Elemento crítico
multicanal** (medida ausente/insuficiente en rojo + grosor + patrón + etiqueta; caso "falta medida").
Resultados también en tabla. `HS6_PDF_SVG_ID = "hs6-svg-pdf"`.

## Ficha PDF

Datos de partida (zona, municipio, soluciones propuestas) con origen → nivel exigido por zona →
evaluación de cada medida y checklist → veredicto CUMPLE/NO CUMPLE. Cita **DB-HS6 + art. (2 / 3.1 /
3.2-3.4 / Apéndice B) + edición RD 732/2019** + sello del motor.

## Definición de Hecho

`SPEC.md` §5. Property-based: nivel exigido Zona II ≥ Zona I; una solución que cumple Zona II cumple
Zona I; `sin_exigencia`/fuera de ámbito → no exige; veredicto siempre definido; determinismo.

## Fuera de alcance

- **Nivel B — sub-cálculo de barrera por difusión `E < Elim`**: fórmula de E divergente entre
  fuentes y no verificada literalmente. La vía `via: "calculo"` se reconoce en los tipos pero el
  motor la marca PENDIENTE (no cuenta como medida válida) hasta auditar el PDF maquetado.
- Listado completo de municipios del Apéndice B (entrada directa de zona; buscador opcional futuro).
- Medición real de radón, ventilación mecánica detallada (remite a DB-HS3 §3.2.1, ya implementado).
