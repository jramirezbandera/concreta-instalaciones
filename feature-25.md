# feature-25 — Fase D · HR: protección frente al ruido, opción simplificada

> Última pieza de la pasada ancha de checkers de la Fase D ([UX-RECONCEPT.md](UX-RECONCEPT.md) §11),
> tras el HE 6 ([feature-24.md](feature-24.md)). Mismo patrón: una `DefinicionSi` sobre la pantalla
> común de SI. Escrito el 2026-10-05.
>
> Verificación normativa, contra la imagen de `research/pdf/DBHR.pdf` (consolidado 20-12-2019),
> los comentarios del Ministerio (`DccHR.pdf`) y la Guía de aplicación V.03 (`GUIA_DBHR_201612.pdf`):
> [research/verificacion-hr.md](research/verificacion-hr.md). Las soluciones constructivas salen
> del Catálogo de Elementos Constructivos (CEC v6.3, marzo 2010), leídas en imagen:
> [research/verificacion-hr-cec.md](research/verificacion-hr-cec.md). El usuario eligió las
> soluciones del Catálogo como desplegables (frente a teclear m y RA).

## Objetivo

La opción simplificada del DB-HR (ap. 3.1.2) da por buena una solución de aislamiento si cada
elemento constructivo que forma los recintos cumple las tablas 3.1 a 3.4. La herramienta:

- deduce de **El edificio** qué separaciones hay (K-HR.16): entre viviendas de una planta, con
  la zona común y los trasteros, con un local, oficinas, garaje o cuarto de instalaciones (recinto
  de actividad o de instalaciones, valores entre paréntesis), los forjados entre viviendas, sobre
  la zona común y sobre o bajo un recinto de actividad, la medianería (la de SI 2), la fachada y
  la cubierta;
- ofrece para cada elemento las **soluciones del Catálogo** (m, RA, ΔRA, ΔLw, RA,tr con su
  página), editables («Otra solución»), con el valor **mínimo** del Catálogo por defecto
  (K-CEC.1);
- comprueba la **tabiquería** (tabla 3.1; RA ≥ 33 en la unifamiliar), los **elementos de
  separación verticales** (tabla 3.2 con sus notas y las condiciones de la fachada a la que
  acometen, pto 7), los **horizontales** (tabla 3.3: ΔLw y una combinación de suelo flotante y
  techo; 1H/2H con tabiquería de entramado), la **medianería** (RA ≥ 45), y la **fachada y la
  cubierta** frente al ruido exterior (tablas 2.1 y 3.4, con el Ld de la zona, aeronaves y la
  fachada no expuesta);
- en la **unifamiliar aislada**, solo tabiquería, fachada, cubierta e instalaciones (K-HR.21);
  en la **adosada**, el Anejo I (estructura independiente o compartida, tabla I.1);
- declara la puerta de entrada (20/30 dBA), el ascensor (RA > 50 o recinto de instalaciones),
  y las condiciones de uniones (3.1.4) e instalaciones (3.3) que la ficha debe recoger.

Hito: **HR en la barra lateral como publicada**, en La obra, la memoria y el anejo, con
aplicabilidad corregida.

## Correcciones que trae la verificación

1. **El DB-HR sí se aplica a la unifamiliar** (A.3–A.6): la regla «no aplica a la unifamiliar»
   de `aplicabilidad.ts` es falsa. En obra nueva aplica siempre; en edificios existentes, solo en
   rehabilitación integral (Introducción II d).
2. **Edición**: consolidado de 20-12-2019 (RD 732/2019), no «2022».
3. **El garaje es recinto de actividad** por el propio DB; local y oficinas, por comentario.
4. **Garajes en la tabla 3.3** (Guía, R.1): vale cualquier combinación entre paréntesis; las ⁽⁷⁾
   son una alternativa más. El suelo flotante de la vivienda cumple el ΔLw sin paréntesis.

## Principios

- **Un dato se escribe una vez.** El Ld de la zona y el ruido de aeronaves son datos de la obra
  (como la zona de radón). Las medianeras son las de SI 2. El ascensor, el de El edificio / SUA 9.
- **Ninguna cifra sin verificar.** Tablas transcritas de la imagen; lo que no fija el DB, rotulado
  como criterio (K-HR.n, K-CEC.n).
- **La herramienta propone; el arquitecto dispone.** Cada solución se puede cambiar por otra.

## Plan

1. `src/modules/hr/`: `tablas.ts` (2.1, 3.1, 3.2, 3.3, 3.4, I.1, con procedencia), `catalogo.ts`
   (soluciones del CEC), `estado.ts`, `edificio.ts` (las separaciones que hay), `justificacion.ts`,
   `textos.ts`, `memoria.ts`, `dibujo.ts`, `definicion.ts`, `ui.tsx`, tests.
2. Datos de la obra: `ldZona` (tramo de la tabla 2.1) y `aeronaves`.
3. Registro (`shipped`, ruta `hr/ruido`), App, anejo, La obra, aplicabilidad (sin la regla de la
   unifamiliar; existentes «no aplica salvo rehabilitación integral»).
4. Tests de motor (celdas de las tablas, casos de la Guía) y de pantalla; capturas.

## Hecho

- `src/modules/hr/`: `tablas` (2.1, 3.1, 3.2 con notas, 3.3, 3.4, I.1 y límites, con procedencia),
  `catalogo` (52 soluciones del CEC con código y página, mínimo y medio), `estado`, `edificio`
  (clase de cada recinto y separaciones planta a planta), `comprobar` (lectura de las tablas con
  sus alternativas, notas y flancos), `justificacion`, `textos`, `memoria` (con la tabla de la
  ficha K.1), `dibujo`, `definicion`, `ui`; ruta `hr/ruido`, icono `Ear`.
- Elementos: tabiquería, separación entre viviendas y con la zona común, con locales, garaje e
  instalaciones, puerta de entrada, ascensor, forjados (entre viviendas, sobre la zona común, sobre
  y bajo recintos de actividad), medianería, adosadas (Anejo I: dos hojas o tabla I.1), fachada de
  dormitorios y de estancias, cubierta, y uniones e instalaciones (se declaran).
- Tipologías: plurifamiliar, unifamiliar aislada, adosada (medianeras de SI 2) y edificio sin
  viviendas (solo ruido exterior, con aviso).
- Datos de la obra: `ldZona` (Ld de la zona) y `aeronaves`. Sin Ld, 60 dBA con aviso.
- Avisos: Ld supuesto, huecos supuestos, local como recinto de actividad, techo con amortiguadores
  en instalaciones, edificio existente, edificio sin viviendas y «con los valores medios
  cumpliría» (con su arreglo de un clic).
- Aplicabilidad: fuera la regla falsa de la unifamiliar; existentes «no aplica salvo
  rehabilitación integral». Edición del registro corregida (20-dic-2019).
- La Guía de aplicación V.03 sí se descarga (`research/pdf/GUIA_DBHR_201612.pdf`): resuelve los
  garajes de la tabla 3.3 (bloque R de la verificación).
- 1217 tests (nuevos: 29 de motor y 1 de pantalla; actualizados los que contaban a HR como
  pendiente); lint, tsc y build limpios; capturas revisadas (Demo en claro: esquema, lista y
  memoria; unifamiliar aislada en oscuro; La obra y datos de la obra).

## Pendiente

- **Decisiones a validar por el usuario**:
  - K-HR.3: oficinas y local sin uso como recinto de actividad (por comentario del Ministerio).
  - K-HR.4 (matizado por la Guía): contadores y RITI no son recinto de instalaciones.
  - K-HR.11: basta con cumplir una alternativa de cada celda.
  - K-HR.16: todo lo que comparte planta se supone colindante y lo de abajo, debajo.
  - K-HR.25: tabiquería de entramado con fachada de hoja interior de fábrica se asimila a fábrica
    con apoyo directo en la tabla 3.3.
  - K-CEC.1: valores mínimos del Catálogo por defecto.
  - K-CEC.5: hoja de ½ pie de fachada de 135 kg/m² y 41 dBA.
  - K-CEC.8: caja de persiana del 13 % del hueco, sumada con la G.1.
  - Huecos supuestos del 20 % (dormitorio) y 30 % (estancia).
  - Lo habitual: P3.2 entre viviendas, hormigón de 16 cm con trasdosado hacia locales, techo en
    el local, estructura compartida en las adosadas.
- **Sin posición en planta**: el motor no sabe dónde está cada zona en la planta. Desde el
  2026-10-05 cada colindancia que deduce (viviendas de un grupo entre sí; cada zona en la planta
  de las viviendas, bajo ellas o sobre ellas) se puede negar en la decisión «Qué linda con qué»
  (`HrEstado.colindancias`, clave `relación:zona` o `entre:grupo`); sin indicar, se supone que
  linda, con el aviso «colindancias supuestas», y la memoria dice cuáles se justifican y cuáles
  no lindan. Las aristas comunes (figura 3.4) y los recintos de una misma vivienda siguen sin
  distinguirse.
- **Lo que no está**: suelos en contacto con el aire exterior (soportales), lucernarios en
  cubierta, corrección por tamaño de ventana (CEC 4.3.2 nota 6), suelo flotante propio del
  recinto de actividad encima de viviendas (se usa el de las viviendas), opción general.
- **Pendientes de la verificación**: P2 (llamada «0(» del forjado de 500), P3 (objetivos de
  calidad del RD 1367/2007 para Ld fuera de áreas residenciales), P5 (ap. 5.1.4).
