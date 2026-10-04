# feature-19 — Fase D · SI1 a SI6: seguridad en caso de incendio

> Segunda pieza de la Fase D de [UX-RECONCEPT.md](UX-RECONCEPT.md) §11 (HS1 → **SI1–SI6** →
> SUA → HS2 → HE4/HE5 → REBT → HR), con el patrón v4 de [REDISENO-V4.md](REDISENO-V4.md) §3
> que ya siguen HS1, HS3, HS4, HS5, HS6 y HE1. Escrito antes de empezar y cerrado el
> 2026-10-04, con lo que cambió respecto al plan en «Desviaciones». (feature-18 fue otra pieza
> del mismo día: los cuartos húmedos de la unifamiliar.)
>
> Verificación normativa, contra el PDF oficial (`research/pdf/DBSI.pdf`, consolidado
> 4-mar-2025, RD 164/2025, y `research/pdf/DccSI.pdf`, con los comentarios del Ministerio):
> [research/verificacion-si1-si2.md](research/verificacion-si1-si2.md),
> [research/verificacion-si3.md](research/verificacion-si3.md) y
> [research/verificacion-si4-si6.md](research/verificacion-si4-si6.md).

## Objetivo

El DB-SI de una vivienda o unas oficinas es casi todo consulta de tablas (UX-RECONCEPT §2.1):
el uso de cada zona, la altura de evacuación y unas pocas superficies deciden los sectores,
la resistencia de lo que los separa, los locales de riesgo especial, las salidas, las
dotaciones, el entorno de los bomberos y la resistencia de la estructura. La herramienta lo
saca de **El edificio** y el proyectista toma tres o cuatro decisiones por sección; se lleva
el texto de la memoria con cada exigencia explicada y su cita.

Hito: **SI1 a SI6 en la barra lateral como publicadas**, con los cuatro casos de El edificio,
en La obra, en la memoria CTE y en el anejo.

## Principios

- **Seis pantallas, un núcleo.** Cada sección es una justificación propia (como en la
  memoria: «SI 1 Propagación interior»…), pero las seis leen el edificio con los mismos ojos
  (`src/modules/si/`): el uso del DB-SI de cada zona, su superficie construida, los sectores,
  los locales de riesgo especial y las alturas de evacuación. La pantalla, el dibujo y la
  ficha son comunes; cada sección aporta su justificación, sus textos, sus marcas en el dibujo
  y sus decisiones (`DefinicionSi`).
- **Ninguna cifra sin verificar.** Cada tabla se transcribe casilla a casilla contra la imagen
  del PDF oficial por el agente `cte-normativa` antes de entrar en `tablas.ts`.
- **El DB prescribe; la herramienta no mide planos.** Lo que depende de la planta (la longitud
  de un recorrido, la anchura de una escalera, el vial) es una decisión o una cifra medida por
  el proyectista. Sin ella, la herramienta dice el límite y avisa (aviso revisable).
- **Lo que no se sabe se supone del lado de la seguridad y se avisa SOLO si cambia el
  resultado**, como en HS1. Sobre todo la **superficie construida**: El edificio guarda la útil
  de cada zona; si no se indica la construida, se supone útil × 1,20 (criterio) y solo se pide
  cuando un umbral (2 500 m² de un sector, 500 m² de un garaje…) queda entre las dos.

## Alcance

### A. El edificio (`lib/edificio/tipos.ts`, aditivo: el schema sigue en «2»)

`Zona` gana cuatro datos opcionales, que también podrán usar REBT y HS3:

| Dato | Para | Sin él |
|---|---|---|
| `superficieConstruida_m2` | SI 1 (sectores, locales, garaje de más de 100 m²), SI 4 (dotaciones) | útil × 1,20 (criterio), aviso solo si cambia algo |
| `cuarto` (qué es un cuarto de instalaciones) | SI 1 tabla 2.1, SI 4, SI 6 | riesgo especial bajo provisional, con aviso |
| `potencia_kW` (sala de calderas) | SI 1 tabla 2.1 | ídem |
| `usoPrevisto` del local sin uso (Comercial o Administrativo) | SI 1, SI 2, SI 3, SI 6 | Comercial, el más exigente, con aviso |

Se editan desde las decisiones de SI1 (y la construida también desde SI4); `setUso` los quita
cuando la zona cambia a un uso en que no tienen sentido. El editor de El edificio aún no los
enseña.

### B. El núcleo común (`src/modules/si/`)

- `edificio.ts`: uso del DB-SI de cada zona, superficie construida (dada o supuesta) y
  alturas de evacuación descendente y ascendente.
- `riesgo.ts` y `sectores.ts`: locales de riesgo especial (tabla 2.1) y sectores de incendio
  con lo que los separa (tablas 1.1, 1.2 y 2.2), que usan SI 1, SI 2, SI 4 y SI 6.
- `seccion.ts` + `SeccionSi.tsx`: la sección de El edificio con las zonas de cada planta en
  horizontal, en proporción a su superficie, y las marcas de cada sección (tonos de zona,
  líneas, flechas, iconos).
- `PantallaSi.tsx` + `definicion.ts`: la pantalla común y el contrato de cada sección.

### C. Las secciones

| Sección | Qué justifica (de El edificio) | Decisiones (con «lo habitual») | Dibujo |
|---|---|---|---|
| **SI1** Propagación interior | sectores y su superficie (tabla 1.1); resistencia de paredes, techos y puertas entre sectores (tabla 1.2); separación entre viviendas; garaje con vestíbulo de independencia; locales de riesgo especial (tablas 2.1 y 2.2); reacción al fuego (tabla 4.1) | qué es cada cuarto de instalaciones; sectores de las viviendas (uno o por plantas); superficies construidas cuando importan | zonas teñidas por sector, rayado en riesgo especial, los forjados y paredes entre sectores con su EI |
| **SI2** Propagación exterior | medianeras; franjas de fachada entre sectores (vertical y horizontal); reacción al fuego de la fachada por altura; cubierta (franjas, huecos) | entre medianeras o aislado; fachadas enfrentadas o en ángulo; fachada ventilada | fachadas y medianeras con las franjas |
| **SI3** Evacuación | ocupación por zona (tabla 2.1); salidas y recorridos (tabla 3.1); dimensionado (tablas 4.1 y 4.2); protección de escaleras (tabla 5.1); puertas; señalización; control de humo del garaje; personas con discapacidad | recorrido más largo medido; anchura de escalera y de la puerta de salida; salidas del garaje | la escalera, las salidas y los recorridos con flechas |
| **SI4** Instalaciones de protección | dotación de la tabla 1.1 por uso: extintores, BIE, columna seca, alarma, detección, hidrantes, extinción automática; señalización | superficie construida del garaje si decide algo | iconos de cada instalación en su planta |
| **SI5** Intervención de los bomberos | aproximación y entorno (si la altura de evacuación excede de 9 m); accesibilidad por fachada | el espacio de maniobra (la calle o propio); la fachada accesible | el camión, el vial y los huecos de fachada |
| **SI6** Resistencia al fuego de la estructura | R de cada planta por uso y altura (tabla 3.1), del sector de debajo; riesgo especial (tabla 3.2); y, para hormigón, las dimensiones de los anejos | material de la estructura; tipo de forjado | la R de cada forjado y de los soportes de cada planta |

### D. Textos, memoria y ficha

Como HS1: frase de la cabecera, métricas, franja de cada elemento, etiquetas, lista, avisos;
la memoria con un párrafo por exigencia y su cita, y la ficha con sus datos de partida.

### E. Integración

Registro (`shipped`, rutas `si/…`), rutas en `App.tsx`, adaptador común de La obra, generador
del anejo, Demo y los tests que hoy cuentan SI1–SI6 como «pronto».

## Fuera de alcance

- Pública concurrencia, comercial con actividad, hospitalario, docente y residencial público:
  el local sin uso se deja previsto («se justificará con su actividad»).
- Medir en planta (recorridos, distancias entre huecos): las da el proyectista.
- Métodos de cálculo de la estructura (Anejo B, simplificados de acero y madera): solo las
  tablas de hormigón y fábrica que usa una memoria habitual.
- Reformas y cambios de uso (Fase E).

## Definición de hecho

- [x] Typecheck, lint y build limpios. El chunk principal pasa de 633 a 791 kB: La obra importa
      las seis definiciones de forma estática, como ya hacía con las HS (el build sigue avisando
      de las importaciones dinámicas que no parten el chunk).
- [x] 962 tests en verde (882 al empezar HS1, ~900 al empezar SI). Ningún snapshot de otro módulo
      cambia. Tests nuevos: `si/test/` (reparto de la sección, núcleo común con los cuatro casos,
      UI de SI1 y SI3 sobre el router real) y `siN/test/` (tablas y justificación de cada
      sección, memoria y ficha). Los de La obra, la memoria CTE, el anejo, la barra lateral y el
      progreso ahora cuentan doce publicadas. La batería completa sigue fallando a veces por
      tiempo en algún test de interfaz que pasa solo (máquina cargada).
- [x] Verificaciones en `research/verificacion-si1-si2.md`, `verificacion-si3.md` y
      `verificacion-si4-si6.md`, casilla a casilla contra la imagen del PDF oficial.
- [x] Capturas revisadas: las seis con el Demo en claro, SI1 y SI6 en Ónice, SI3 en móvil
      (390 px) y la ficha PDF de SI1 renderizada página a página.

## Desviaciones

- **Una pantalla común y una definición por sección.** `PantallaSi` + `DefinicionSi` (justificar,
  redactar, dibujar, memoria, ficha) en lugar de seis `ui.tsx` completos; La obra y el anejo
  usan un adaptador común (`moduloSi`, `adaptadorSi`). El dibujo es también común
  (`SeccionSi`): las zonas de cada planta en horizontal y, encima, las marcas de cada sección.
- **La sectorización por plantas no es una decisión.** Se deduce sola si las viviendas (u
  oficinas) pasan de 2.500 m² construidos; así SI2 (franjas) y SI6 ven los mismos sectores
  que SI1 sin leer su estado. Una planta de más de 2.500 m² no cumple.
- **El garaje solo es uso Aparcamiento con más de 100 m² construidos** y nunca el de la
  unifamiliar, que es local de riesgo especial bajo en todo caso (Anejo SI A, tabla 2.1). La
  verificación lo pidió; el plan lo daba por hecho.
- **Nota 2 de la tabla 2.2.** Un local de riesgo bajo en el sótano de un edificio de viviendas
  sube a EI 120 y R 120 (la de los sectores del uso al que sirve); la puerta sigue EI2 45-C5.
  En la unifamiliar, la tabla 2.2 sola.
- **SI3 no estima recorridos.** Sin medir, dice el límite, desde dónde y hasta dónde se mide, y
  avisa; con escalera no protegida el recorrido llega a la salida del edificio (la escalera no
  es salida de planta, interpretación de la verificación). La escalera del garaje es siempre
  especialmente protegida con vestíbulo.
- **SI4 cuenta orígenes de evacuación en cada planta de viviendas** de una plurifamiliar (el
  rellano), aunque El edificio no dibuje el rellano como zona. La detección del garaje pequeño
  bajo rasante se menciona por SI 3 ap. 8, no por la tabla 1.1.
- **SI6 lee la tabla 3.1 planta a planta** y avisa del comentario del Ministerio que extiende la
  R de sótano a todo el sector cuando baja al sótano (aviso «sector-sotano» en el Demo, por los
  trasteros).
- **La obra enseña piezas propias** de cada sección (`DefinicionSi.piezas`), no las de «Qué
  entra», que en SI no son partes del edificio.
- **`pdfStr` traduce «↔» y «→»** (afecta a todas las fichas, solo para esas flechas).

## Pendiente

- **Decisiones propias que el usuario debe validar:**
  - superficie construida supuesta = útil × 1,20, y que solo se pida cuando cambia el resultado;
  - cuarto de instalaciones sin tipo = riesgo bajo provisional; RITI/RITS = riesgo bajo
    (comentario del Ministerio); sala de calderas sin potencia = riesgo bajo;
  - local sin uso = Comercial mientras no se diga otra cosa (sector, EI 90 con h ≤ 15 m, R 90,
    salidas propias, 2 m²/persona);
  - el elemento entre sectores de usos distintos toma la mayor de las dos filas de la tabla 1.2;
  - lo habitual: plurifamiliar y oficinas entre medianeras, unifamiliar aislada; la escalera
    con la menor protección que admite la tabla 5.1 (no protegida hasta 14 m), de 1,00 m;
    hormigón con forjado de viguetas y techo del garaje sin revestir; hidrante público a menos
    de 100 m; la calle como espacio de maniobra; rejas solo hasta 9 m; ventilación mecánica
    del garaje bajo rasante;
  - la altura total de la fachada (SI 2) hasta el forjado de cubierta, con aviso si un peto
    cruza 10, 18 o 28 m;
  - las interpretaciones de la verificación: el recorrido llega al portal con escalera no
    protegida; el vial y la fachada accesible de SI 5 solo con espacio de maniobra; el garaje de
    la unifamiliar R 90; la columna de la tabla 3.1 por la altura del edificio.
- **Lecturas pendientes** (verificaciones, «Pendientes»): DB SUA 1, tabla 4.1 (anchura mínima de
  la escalera; hoy 1,00 m es criterio) y SUA 9; el BOE del RD 164/2025 y del RD 732/2019; el
  RIPCI consolidado; la casilla «REI-80» de la tabla F.2 (probable errata); el RITE para saber
  qué es «sala de máquinas».
- **Fuera de alcance de esta fase:** centros de transformación, cocinas y almacenes por volumen
  en la tabla 2.1; escaleras protegidas por la fórmula con su superficie real; dos escaleras
  (altura de evacuación de más de 28 m); el Anejo F (EI de las fábricas) no se ofrece aún;
  acero y madera se quedan en «se justifica aparte».
- **El editor de El edificio** debería enseñar la superficie construida, el tipo de cuarto y el
  uso previsto del local (hoy solo se editan desde SI1 y SI4). Y el lector del cuadro de
  superficies podría conservar la construida que hoy descarta (verificación K2).
- **Posible fallo ajeno:** las decisiones de HS1 numeran con un contador mutado en el JSX
  (`++n`); con el React Compiler y alguna decisión oculta, SI5 repetía números. En SI se usan
  números fijos; HS1 no se ha tocado.
