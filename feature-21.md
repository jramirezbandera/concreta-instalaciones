# feature-21 — Fase D · HS 2: recogida y evacuación de residuos

> Cuarta pieza de la Fase D de [UX-RECONCEPT.md](UX-RECONCEPT.md) §11 (HS1 → SI1–SI6 → SUA →
> **HS2** → HE4/HE5 → REBT → HR), con el patrón v4 y la pantalla común que estrenó SI
> ([feature-19.md](feature-19.md)) y reutilizó SUA ([feature-20.md](feature-20.md)). Escrito
> al empezar, el 2026-10-05, y cerrado con lo que cambió en «Desviaciones».
>
> Verificación normativa, contra el PDF oficial (`research/pdf/DBHS.pdf`, consolidado
> 14-jun-2022, y `research/pdf/DccHS.pdf`, con los comentarios del Ministerio):
> [research/verificacion-hs2.md](research/verificacion-hs2.md).

## Objetivo

HS 2 es corto y casi todo sale de El edificio: cuántos ocupantes tiene (los dormitorios de cada
vivienda tipo) decide la superficie del almacén de contenedores o del espacio de reserva y la
capacidad del almacenamiento inmediato de cada vivienda. Lo único que no sabe el edificio es
cómo recoge el municipio cada fracción (puerta a puerta o contenedores de calle) y dónde va el
almacén o la reserva. La herramienta calcula las fórmulas 2.1, 2.2 y 2.3 con su cita, comprueba
la superficie que da El edificio (un cuarto de instalaciones de tipo «almacén de residuos») y
redacta la memoria con las condiciones de situación, recorrido, características y
mantenimiento.

Hito: **HS2 en la barra lateral como publicada**, con los cuatro casos de El edificio, en La
obra, en la memoria CTE y en el anejo; «no aplica» (estudio específico) en un edificio sin
viviendas.

## Principios

- **La pantalla común, sin duplicarla.** HS 2 es una `DefinicionSi` más (`db: "DB-HS"`): la
  pantalla, el dibujo de sección y la ficha de SI valen tal cual. Carpeta `src/modules/hs2/`.
- **Ninguna cifra sin verificar.** Agente `cte-normativa`, casilla a casilla contra la imagen
  del PDF; lo que no fija el DB va rotulado como criterio.
- **Lo que no se sabe se supone y se avisa.** Sin datos del servicio municipal, todas las
  fracciones con contenedores de calle de superficie (espacio de reserva); con recogida puerta
  a puerta sin periodos ni contenedores, los de la tabla A.2 del propio DB.

## Alcance

| Elemento | Qué comprueba | Cita |
|---|---|---|
| Ocupantes P | Σ dormitorios sencillos + 2 × dobles de todas las viviendas | ap. 2.1.2.1 |
| Espacio de reserva | SR = P·Σ(Ff·Mf) sobre las fracciones con contenedor de calle de superficie | ap. 2.1.2.2, tabla 2.2 |
| Almacén de contenedores | S = 0,8·P·Σ(Tf·Gf·Cf·Mf) sobre las fracciones puerta a puerta, frente a la superficie del cuarto de residuos de El edificio | ap. 2.1.2.1, tabla 2.1 |
| Situación y recorrido | < 25 m al acceso si está fuera; 1,20 m (1,00 m puntual ≤ 45 cm); puertas hacia fuera; ≤ 12 %; sin escalones | ap. 2.1.1 |
| Características del almacén | 30 °C, revestimientos, agua y sumidero, 100 lux, enchufe; SI 1 y HS 3 | ap. 2.1.3 |
| Almacenamiento inmediato | C = CA·Pv por fracción y vivienda tipo, ≥ 45 dm³ y 30 × 30 cm | ap. 2.3, tabla 2.3 |

Bajantes (ap. 2.2): fuera de alcance, la memoria declara que no se disponen. Mantenimiento
(ap. 3): párrafo de la memoria y observación de la ficha.

## Fuera de alcance

- Traslado por bajantes y recogida neumática (estaciones de carga).
- Edificios sin viviendas: estudio específico (ap. 1.1 pto 2).
- Las ordenanzas municipales de residuos: se citan, no se comprueban.

## Definición de hecho

- [x] Typecheck, lint y build limpios. Chunk principal de 1.074 a 1.102 kB (323 kB gzip).
- [x] 1102 tests en verde, dos pasadas seguidas (1086 al empezar). Ningún snapshot cambia.
      Nuevos: `hs2/test/hs2.test.ts` (Ff = Tf·Gf·Cf de la tabla A.2, SR = 0,268·P, S con la
      A.2, redondeo, C con el mínimo de 45 dm³, los cuatro casos, dobles, estudio, puerta a
      puerta, por fracción, superficie corta y su arreglo, el cuarto de residuos en el sótano,
      memoria, ficha y dibujo) y `hs2/test/ui.test.tsx` (router real con el Demo). Los de La
      obra, la memoria CTE, el anejo, la barra lateral y el progreso cuentan ya veintiuna.
- [x] Verificación en `research/verificacion-hs2.md` (imagen a 200 ppp de pp. 52–62).
- [x] Capturas revisadas: el Demo en claro (contenedores, puerta a puerta, por fracción), en
      oscuro, la memoria y la ficha PDF.

## Desviaciones

- **Lo que corrigió la verificación**: «dormitorio doble» no lo define el DB; «el principal
  doble y el resto sencillos» es un comentario del Ministerio y así se rotula (no como
  criterio propio). La dispensa de papel y vidrio de la unifamiliar (2.3 pto 2) exige almacén:
  con solo reserva, las cinco fracciones van en la vivienda. Las condiciones de 2.1.3 son del
  almacén, no de la reserva; el recorrido de 2.1.1 pto 2 se aplica a la reserva como
  interpretación, rotulada. El caudal de HS 3 es de su tabla 2.2.
- **«Otro»** (soterrados o neumática) junta dos casos: ni almacén ni reserva en los dos.
- **El cuarto de residuos de El edificio** (instalaciones, `cuarto: "residuos"`) es el almacén,
  o la reserva ya construida si no hay recogida puerta a puerta: su superficie y su planta
  mandan sobre las decisiones; el arreglo de «se queda corto» lo amplía en El edificio.
- **Estudio sin dormitorio**: Pv = 2 (criterio, para que no cuente 0).
- **Título corto en la ficha** («HS 2 — Recogida de residuos»): el largo pisaba la cabecera.
- **El icono de contenedor** se añade al dibujo común de SI (`IconoSi`).

## Pendiente

- **Decisiones a validar por el usuario**: recogida supuesta con contenedores de calle de
  superficie (aviso revisable); dobles por el comentario del Ministerio (aviso revisable;
  no va del lado de la seguridad); periodos y contenedores de la tabla A.2 para el almacén
  sin datos del servicio; reserva en la PB (en la parcela en la unifamiliar); superficie
  exigida redondeada hacia arriba a 0,01 m²; el recorrido aplicado a la reserva.
- **«Manejo adecuado»** (2.1.2.1 pto 2): sin cifra en el DB; la tabla A.1 (SC por
  contenedor) podría dar una referencia rotulada como criterio, sobre todo en la unifamiliar
  (SR ≈ 1,3 m²).
- **Fracción que no se separa** (sumarla a «varios», K4) y **capacidades fuera de la tabla
  2.1** (K5): no se ofrecen.
- **Reformas y ampliaciones** (K10): HS 2 es de obra nueva; lo resolverá el motor de alcance
  (Fase E).
- **HS 3 ap. 3.1.2** (ventilación del almacén de residuos) sin verificar en el repo.
