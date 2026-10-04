# feature-20 — Fase D · SUA 1 a SUA 9: seguridad de utilización y accesibilidad

> Tercera pieza de la Fase D de [UX-RECONCEPT.md](UX-RECONCEPT.md) §11 (HS1 → SI1–SI6 →
> **SUA** → HS2 → HE4/HE5 → REBT → HR), con el patrón v4 y el núcleo común que estrenó SI
> ([feature-19.md](feature-19.md)). Escrito al empezar, el 2026-10-04, y cerrado con lo que
> cambió en «Desviaciones».
>
> Verificación normativa, contra el PDF oficial (`research/pdf/DBSUA.pdf`, consolidado
> 14-jun-2022, RD 450/2022, y `research/pdf/DccSUA.pdf`, con los comentarios del Ministerio de
> 15-jul-2024): [research/verificacion-sua1.md](research/verificacion-sua1.md),
> [research/verificacion-sua2-sua5.md](research/verificacion-sua2-sua5.md),
> [research/verificacion-sua6-sua8.md](research/verificacion-sua6-sua8.md) y
> [research/verificacion-sua9.md](research/verificacion-sua9.md).

## Objetivo

Una memoria de vivienda justifica las nueve secciones del DB-SUA. Casi todo es declarativo
(exigencias de ejecución sin cifra) o depende de la planta (una huella, una anchura); lo que sí
sale de El edificio —las alturas de planta, las cotas, qué zonas son interior de vivienda o
zona común, el garaje, las escaleras que tiene que haber, si hace falta ascensor— decide las
comprobaciones. La herramienta redacta las nueve con su cita y el proyectista solo se aparta de
«lo habitual» cuando su proyecto es distinto.

Hito: **SUA 1 a SUA 9 en la barra lateral**: siete pantallas (SUA 1, 2, 3, 4, 7, 8 y 9, y la
SUA 6 cuando hay piscina comunitaria) y el párrafo de no aplicación de SUA 5 (y de SUA 6 y 7
cuando no hay piscina o garaje), en La obra, en la memoria CTE y en el anejo.

## Principios

- **El núcleo de SI, sin duplicarlo.** `DefinicionSi`, `PantallaSi`, el dibujo de sección
  (`SeccionSi`) y la ficha valen tal cual; la definición acepta ya cualquier clave y dice su DB
  (`db: "DB-SUA"`), y la ficha, su edición. SUA añade su propio núcleo de lectura del edificio
  (`src/modules/sua/`).
- **Ninguna cifra sin verificar.** Cuatro verificaciones del agente `cte-normativa`, casilla a
  casilla contra la imagen del PDF; lo que no fija el DB va rotulado como criterio y los
  comentarios del Ministerio, como no reglamentarios.
- **El DB prescribe; la herramienta no mide planos.** Lo que depende de la planta es una
  decisión o una cifra del proyectista con el límite al lado.
- **Lo que no se sabe se supone del lado de la seguridad y se avisa solo si cambia el
  resultado** (Ng de SUA 8, la forma de la planta, el ascensor, el local sin uso).

## Alcance

### A. Datos nuevos (aditivos; el schema sigue en «2»)

| Dato | Dónde | Para | Sin él |
|---|---|---|---|
| `Edificio.ascensor` | El edificio (se decide en SUA 9) | SUA 1 (contrahuella 17,5 / 18,5 cm, tramo 2,25 / 3,20 m) y SUA 9 | se supone que lo hay solo si SUA 9 lo exige |
| `DatosGenerales.densidadImpactosNg` | Datos de la obra, «Clima y terreno» | SUA 8 (figura 1.1: 0,5 a 6; no hay 3,5 ni 4,5) | 6, el mayor del mapa, aviso solo si cambia el resultado |

### B. El núcleo común (`src/modules/sua/`)

`edificio.ts` (`edificioSua`): la clase de cada zona para el DB-SUA (interior de vivienda,
garaje de la vivienda, zona común, oficinas, garaje —uso Aparcamiento si excede de 100 m²
construidos—, ocupación nula, local), las escaleras que tiene que haber (interior de la
unifamiliar, común, la del garaje), el ascensor que exige SUA 9 ap. 1.1.2 (plantas a salvar en
cada sentido desde la PB, viviendas o superficie útil sin entrada accesible) y la altura de la
cubierta. `tablas.ts` (procedencia y umbrales comunes), `ficha.ts`, `editar.ts`.

### C. Las secciones

| Sección | Qué justifica | Formato |
|---|---|---|
| **SUA1** Riesgo de caídas | escaleras (común, del garaje, interior) con contrahuella derivada de la altura de planta; barreras por cota (0,90 / 1,10 m); rampas; resbaladicidad (solo oficinas); acristalamientos | checker |
| **SUA2** Impacto y atrapamiento | alturas libres de paso; puertas en pasillos; vidrios por diferencia de cota (tabla 1.1); señalización de acristalamientos; atrapamiento | checker |
| **SUA3** Aprisionamiento | desbloqueo exterior, luz desde dentro, fuerza de apertura | checker |
| **SUA4** Iluminación | alumbrado normal por zona (100 / 50 / 20 lux, 40 %); zonas con alumbrado de emergencia (de El edificio y de SI 1) y sus características | checker |
| **SUA5** Alta ocupación | no aplica nunca a viviendas ni oficinas: párrafo | aplicabilidad |
| **SUA6** Ahogamiento | piscina comunitaria (barrera 1,20, profundidades, pendientes, andén, escaleras) y pozos; no aplica sin piscina ni en la unifamiliar | checker / párrafo |
| **SUA7** Vehículos en movimiento | espacio de espera, peatones por la rampa, señalización, alerta; no aplica sin garaje ni en la unifamiliar | checker / párrafo |
| **SUA8** Acción del rayo | Ne frente a Na, eficiencia y nivel (tabla 2.1), Anejo B | cálculo ligero |
| **SUA9** Accesibilidad | exterior, entre plantas (ascensor o previsión), en las plantas, dotación (viviendas y plazas accesibles, aseos, mecanismos), señalización; unifamiliar exenta | checker |

### D. Integración

Registro (nueve entradas, `shipped`, rutas `sua/…`), `App.tsx`, La obra (`moduloSi`), anejo
(`adaptadorSi`), Datos de la obra (Ng), aplicabilidad (SUA 5; párrafos de SUA 6 y 7 corregidos
por la verificación: pozos y depósitos, vías de circulación exteriores) y los tests que cuentan
las publicadas.

## Fuera de alcance

- Pública concurrencia, comercial con actividad, residencial público, docente, sanitario: el
  local sin uso se deja previsto.
- Medir en planta. Reformas y cambios de uso (Fase E).
- La reglamentación autonómica de accesibilidad (número de viviendas accesibles) y la de
  piscinas (RD 742/2013): se citan, no se comprueban.

## Definición de hecho

- [x] Typecheck, lint y build limpios. El chunk principal pasa de 791 a 1.074 kB (314 kB
      gzip): La obra importa las veinte definiciones de forma estática, como ya hacía con SI.
- [x] 1086 tests en verde, dos pasadas seguidas (961 al empezar). Ningún snapshot de otro
      módulo cambia. Tests nuevos en `sua/test/` y `suaN/test/` (tablas, justificación con los
      cuatro casos, bordes de los umbrales, avisos, memoria, ficha y dibujo); los de La obra,
      la memoria CTE, el anejo, la barra lateral y el progreso cuentan ya veinte publicadas.
      El límite de los tests sube a 30 s y la espera del primer módulo diferido a 20 s: con el
      grafo de módulos más grande, la batería en paralelo pasaba de los anteriores.
- [x] Verificaciones en `research/verificacion-sua*.md`, casilla a casilla contra la imagen.
- [x] Capturas revisadas: las siete pantallas con el Demo en claro, SUA 8 en oscuro y la ficha
      PDF de SUA 8 renderizada.

## Desviaciones

- **Ng en Datos de la obra.** Es un dato del emplazamiento, como las zonas de HS1: va en
  «Clima y terreno». El mapa no permite un valor por provincia; sin él se supone 6.
- **Las secciones se repartieron entre agentes** sobre SUA 8 como modelo, cada uno en su
  carpeta; la integración y los cambios comunes, aparte. Dos cambios comunes salieron de ahí:
  `arreglo` puede cambiar también El edificio (el ascensor de SUA 9) y las ayudas de colocación
  de etiquetas de SUA 2–4 viven en `sua/colocar.ts`.
- **SUA 5 sin pantalla**: regla de aplicabilidad que nunca aplica; la barra lateral la marca
  «—» (no aplica) en lugar de «pronto».
- **Las citas de los «no aplica»** siguen la convención «DB-SUA N, ámbito de aplicación»; el
  apartado exacto va en el párrafo.
- **Títulos cortos en las fichas** («SUA 8 — Acción del rayo»): el nombre completo de la
  sección no cabía en la cabecera.

## Pendiente

- **Decisiones propias que el usuario debe validar** (detalle en cada verificación, apartado
  «Criterios de proyecto»):
  - SUA 1: peldaños calculados con 17,5 cm (uso general) y 18,5 cm (interior); ±1 cm entre
    cualquier par de plantas; tabica en la escalera que baja a sótano; la caída de cada planta
    es la cota de su suelo (6,00 m justos → 0,90 m); barreras de 1,10 m como lo habitual;
    limpieza de vidrios en la planta cuyo suelo + 2,20 m pasa de 6 m.
  - SUA 2: alturas libres habituales (2,40 vivienda, 2,50 comunes y oficinas, 2,20 garaje) con
    aviso revisable del garaje; vidrios por la cota de cada planta; un pasillo de 2,50 m justos
    cuenta como estrecho.
  - SUA 3: la puerta del vestíbulo del garaje a 65 N; el aseo de las oficinas, de uso público
    por defecto.
  - SUA 4: alumbrado de emergencia en el garaje de la unifamiliar (lectura literal); en el
    pasillo de trasteros de 50 m² o menos; el cuarto sin tipo, de riesgo especial con aviso.
  - SUA 6: la piscina de comunidad es de uso colectivo; valores habituales del vaso.
  - SUA 7: el garaje de 100 m² o menos solo con 2.2 y 4.1; ap. 3 no aplica por ser uso
    privado; dispositivo de alerta siempre; peatones por la escalera.
  - SUA 8: H = forjado de cubierta + remate (0,50 / 1,10 / 1,50 m según la cubierta); planta
    cuadrada con la superficie de la cubierta si no se indica; local sin uso = Comercial
    (C4 = 3) con aviso solo si cambia el resultado.
  - SUA 9: entrada siempre en la PB; cómputo de plantas en cada sentido (garaje sí, trasteros
    no); la tabla de cabinas del comentario del Ministerio como límite (1,00 × 1,25 da «no
    cumple»); ninguna vivienda accesible por defecto, con aviso revisable.
- **Ascensor supuesto**: SUA 9 lo supone con motivos que `edificioSua` no conoce (cubierta
  comunitaria, viviendas accesibles fuera de la PB, plazas en sótano); en esos casos SUA 1
  podría suponer otra cosa. Indicarlo en SUA 9 lo resuelve.
- **La rampa del garaje con peatones** se decide en SUA 1 y en SUA 7 por separado: debería ser
  un dato único del garaje.
- **El editor de El edificio** no enseña aún el ascensor (se indica en SUA 9).
- **Chunk principal**: La obra podría cargar las definiciones de forma diferida.
- **Lecturas pendientes**: la fuerza horizontal de las barreras (DB SE-AE 3.2.1), la
  corrección de errores del RD 450/2022 (BOE 2-02-2023) y el porcentaje del RDL 1/2013
  art. 32 en el BOE.
