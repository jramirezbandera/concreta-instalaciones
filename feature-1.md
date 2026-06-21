# feature-1 — HS3 · Ventilación / Calidad del aire interior

> Primer módulo. Vertical completo (motor + schema + SVG + ficha + UI + tests).
> Bloqueado por: `feature-0`; **prerrequisito normativo** (transcribir HS3 Tablas 4.2/4.3).
> Referencia I+D: `IDR-INSTALACIONES.md` §2 (HS3) y §9 (conductos pendientes).

## Contexto normativo

**DB-HS3 vigente:** modificado por **Orden FOM/588/2017** (consolidado en RD 732/2019). Control
por **CO₂** (media anual < 900 ppm; acumulado ≤ 500.000 ppm·h) y distinción **caudal constante /
caudal variable**. *No mezclar con la edición 2009.*

## Prerrequisito bloqueante (§9)

Antes del sub-cálculo de conductos: **transcribir y verificar celda a celda contra el PDF de
codigotecnico.org** las **Tablas 4.2 / 4.3** (secciones de conducto de extracción en cm² por
caudal y **clase de tiro T-1…T-4** según nº de plantas). Guardarlas como datos versionados
(convención `shared/` de feature-0). El resto de tablas HS3 ya están verificadas en §2.

## Entradas

- Tipo y nº de dormitorios de la vivienda; locales (secos: dormitorios, salas/comedores; húmedos:
  cocinas, baños, aseos) con superficie.
- Sistema: híbrido o mecánico; caudal constante o variable.
- Datos de aberturas y trazado de conductos verticales (nº de plantas servidas para clase de tiro).

## Cálculo (tablas verificadas, §2)

- **Caudales mín. caudal constante (Tabla 2.1, l/s):** dormitorio principal 8; resto dormitorios
  4; salas/comedores 6/8/10 (según 0-1 / 2 / 3+ dorm.); húmedos total por vivienda 12/24/33;
  húmedos mín. por local 6/7/8.
- **Cocción:** extracción independiente **≥ 50 l/s**.
- **No ocupación:** ≥ 1,5 l/s por local habitable.
- **No habitables (Tabla 2.2):** trasteros 0,7 l/s·m²; almacenes de residuos 10 l/s·m²; garajes
  120 l/s·plaza.
- **Área efectiva de aberturas (Tabla 4.1, cm²):** admisión/extracción 4·qv; paso máx(70 cm², 8·qvp);
  mixtas 8·qv.
- **Sistema:** flujo **seco → húmedo**; conductos según Tablas 4.2/4.3 (del prerrequisito).

## Render SVG

Planta de la vivienda con **flechas de flujo** admisión (salones/dormitorios) → extracción
(cocinas/baños) y **checker verde/rojo por estancia**. Estancia que no cumple resaltada multicanal
(no solo color). Resultados numéricos también en tabla.

## Ficha PDF

Datos de partida (locales, superficies, sistema) con origen → caudales exigidos por estancia y
totales → dimensionado de aberturas y conductos → veredicto CUMPLE/NO CUMPLE. Cita DB-HS3 +
artículo/tabla + **edición FOM/588/2017** + sello motor.

## Definición de Hecho

La de `SPEC.md` §5 (los 6 puntos). Property-based: monotonía caudal↔ocupación; mínimos por local
nunca violados; conducto suficiente para el caudal total.

## Fuera de alcance

Control por CO₂ en tiempo real / sensores; ventilación de garajes detallada más allá del caudal
de Tabla 2.2.
