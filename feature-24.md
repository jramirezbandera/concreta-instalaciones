# feature-24 — Fase D · HE 6: dotaciones mínimas para la recarga del vehículo eléctrico

> Pieza añadida a la Fase D de [UX-RECONCEPT.md](UX-RECONCEPT.md) §11 tras el REBT
> ([feature-23.md](feature-23.md)): el HE 6 no estaba en el registro de justificaciones y el
> REBT ya usaba su 1/40 para las oficinas. Mismo patrón que HE 4/HE 5
> ([feature-22.md](feature-22.md)): una `DefinicionSi` sobre la pantalla común de SI. Escrito y
> cerrado el 2026-10-05.
>
> Verificación normativa, contra la imagen de `research/pdf/DBHE.pdf` (pp. 33–34, consolidado
> 14-06-2022) y los comentarios del Ministerio (DccHE p. 38):
> [research/verificacion-he6.md](research/verificacion-he6.md).

## Objetivo

La sección HE 6 (introducida por el RD 450/2022, no por el RD 732/2019) pide en los edificios con
aparcamiento, interior o exterior adscrito, una infraestructura mínima de recarga. La herramienta:

- cuenta las **plazas**: las de los garajes de El edificio y las exteriores adscritas (en la
  unifamiliar sin garaje, la plaza en la parcela que se marca en REBT), y aplica la
  **exclusión** de 10 plazas o menos en edificios sin viviendas (ap. 1);
- comprueba la **conducción de cables**: el 100 % de las plazas en residencial privado y
  ⌈N/5⌉ (el 20 %, por exceso) en otros usos (ap. 3 ptos 1 y 2);
- comprueba las **estaciones de recarga** en otros usos: máx(⌈N/40⌉ o ⌈N/20⌉ de la
  Administración General del Estado; ⌈Nacc/5⌉), con las plazas accesibles de SUA 9;
- declara lo que pide el **ap. 4**: el esquema de conexión de la ITC-BT-52 y el tipo y la
  potencia de la estación.

Hito: **HE6 en la barra lateral como publicada** (grupo «Ahorro de energía»), en La obra, la
memoria y el anejo, con aplicabilidad calculada.

## Principios

- **Un dato se escribe una vez.** HE 6 es el dueño de las dotaciones (plazas exteriores,
  estaciones, esquema, potencia de la estación); REBT es el dueño de la potencia y lee de HE 6
  las estaciones, su potencia, las plazas con las exteriores y el esquema (`recargaDeHe6`). La
  plaza en la parcela de la unifamiliar sigue en REBT y la lee HE 6.
- **Ninguna cifra sin verificar.** Agente `cte-normativa`; lo que el DB no fija se rotula como
  criterio (tabla K-HE6 de la verificación).

## Hecho

- `src/modules/he6/` (`tablas`, `estado`, `justificacion`, `textos`, `memoria`, `dibujo`,
  `definicion`, `ui`), ruta `he/recarga`, icono `EvCharger`, clave `he6` en el union.
- Elementos: plazas (dato, ámbito), conducción (cumple/no cumple), estaciones (solo otros usos),
  esquema (ap. 4 a) y estación (ap. 4 d, con estaciones o en la unifamiliar).
- Decisiones: plazas exteriores, titularidad de la Administración General del Estado, plazas
  accesibles, plazas con conducción, estaciones, esquema (1–4; el 2 no vale sin viviendas; la
  unifamiliar, 4a obligado) y potencia (3,68 / 7,36 / 11,09 kW).
- Avisos: garaje sin plazas, edificio existente (se calcula obra nueva), viviendas con otros
  usos (uso característico, ap. 3 pto 3) y redondeo de las plazas accesibles cuando sube el
  mínimo.
- Aplicabilidad: «no aplica» sin aparcamiento o con la exclusión a); `atributosDe` recibe las
  justificaciones guardadas.
- REBT: la tabla `RECARGA_HE6` desaparece; P5 de oficinas = estaciones de HE 6 × su potencia;
  el SPL (factor 0,3) solo con el esquema colectivo de HE 6 (si no, la opción se deshabilita).
- De paso: «1 comprobación» en singular en la cabecera común (`ModuleLayout`).
- 1185 tests (los nuevos: motor y pantalla de HE 6, y su fila en La obra); lint, tsc y build limpios; capturas
  revisadas (Demo en claro; oficinas con 30 plazas exteriores en oscuro; REBT leyendo HE 6).

## Pendiente

- **Decisiones a validar por el usuario** (K-HE6 de la verificación): la exclusión a) no alcanza
  a un edificio con viviendas (K-HE6.3); ⌈Nacc/5⌉ por exceso (K-HE6.4); las plazas con estación
  cuentan en el 20 % (K-HE6.5); esquema habitual 1a en viviendas y 4b en otros usos (K-HE6.8);
  estación de 3 680 W, modo 3, tipo 2 (K-HE6.9).
- **Edificios mixtos con aparcamiento diferenciado** (ap. 3 pto 3): hoy todo sigue al uso
  característico, con aviso. Faltaría el reparto de plazas por uso.
- **Edificios existentes**: los supuestos del ap. 1 b) y la exclusión b) (7 % del PEM) solo se
  avisan.
- **REBT en viviendas** sigue con las plazas interiores para el 10 % del ap. 5.2 (las exteriores
  adscritas no entran).
- **Pendientes de la verificación** (P1–P3): imágenes de la ITC-BT-52 pp. 268, 273–278 y
  283–284, el BOE del RD 450/2022 y la FAQ del IDAE sobre el redondeo de las accesibles.
