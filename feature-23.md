# feature-23 — Fase D · REBT: grado de electrificación y previsión de cargas

> Sexta pieza de la Fase D de [UX-RECONCEPT.md](UX-RECONCEPT.md) §11 (HS1 → SI1–SI6 → SUA →
> HS2 → HE4/HE5 → **REBT** → HR), con el patrón v4 y la pantalla común de SI
> ([feature-19.md](feature-19.md)), que ya usan SUA, HS 2 y HE 4/HE 5
> ([feature-22.md](feature-22.md)). Escrito al empezar, el 2026-10-05, y cerrado con lo que
> cambió en «Desviaciones».
>
> Verificación normativa, contra el consolidado del BOE (`research/pdf/REBT.pdf`,
> BOE-A-2002-18099) y las guías técnicas de aplicación del Ministerio
> (`research/pdf/guia_bt_*.pdf`): [research/verificacion-rebt.md](research/verificacion-rebt.md).

## Objetivo

El REBT no es del CTE, pero la memoria de instalaciones de un edificio de viviendas lo
justifica igual, y casi todo sale de El edificio: la superficie útil de cada vivienda tipo,
cuántas hay, las zonas comunes, los locales y oficinas, el garaje con sus plazas y el ascensor.
La herramienta:

- da el **grado de electrificación** de cada vivienda tipo (básica 5 750 W o elevada 9 200 W,
  con el IGA de su escalón) por superficie, por la climatización eléctrica o por la recarga
  del vehículo eléctrico en la unifamiliar (ITC-BT-10 ap. 2; ITC-BT-25);
- calcula la **previsión de cargas** del edificio: las viviendas con la tabla 1, los servicios
  generales, los locales y oficinas a 100 W/m², el garaje a 10/20 W/m² y la recarga del
  vehículo eléctrico (ap. 3, 4 y 5; ITC-BT-52 ap. 4.1), con la intensidad de la línea general;
- comprueba **dónde van los contadores** (armario o local, ITC-BT-16 ap. 2), contra el cuarto
  «contadores de electricidad» de El edificio;
- dice si la instalación pide **proyecto o memoria técnica de diseño** (ITC-BT-04 ap. 3.1).

Hito: **REBT en la barra lateral como publicada** (grupo «Electricidad»), con los cuatro casos
de El edificio, en La obra, en la memoria y en el anejo.

## Principios

- **La pantalla común, sin duplicarla.** Una `DefinicionSi` más (`db: "REBT"`, union
  ampliada), carpeta `src/modules/rebt/`, iconos nuevos en el dibujo común (contador, punto de
  recarga).
- **Ninguna cifra sin verificar.** Agente `cte-normativa` contra la imagen del consolidado y de
  las guías; lo que solo dicen las guías se rotula como orientativo y lo que no fija nadie,
  como criterio («no es exigencia del REBT»).
- **Un dato se escribe una vez.** La ventilación del garaje es la de HS 3; el ascensor, el de
  El edificio (o el que exige SUA 9); el cuarto de contadores, el de El edificio; la producción
  centralizada de ACS se lee de HE 4.
- **Las potencias son mínimos.** La memoria y la ficha lo dicen: con una demanda real conocida
  mayor, se prevé esta.

## Alcance

| Elemento | Qué da o comprueba | Cita |
|---|---|---|
| Vivienda tipo | Grado (básica/elevada), potencia e IGA | ITC-BT-10 ap. 2.1, 2.2 y 5.1; ITC-BT-25 ap. 2 |
| Conjunto de viviendas | Media × coeficiente de la tabla 1 | ap. 3.1, tabla 1 |
| Servicios generales | Ascensor (Guía, tabla A), alumbrado común (Guía), otros | ap. 3.2 |
| Locales y oficinas | 100 W/m² y planta, mínimo 3 450 W por local | ap. 3.3 y 4.1 |
| Garaje | 10 / 20 W/m² según la ventilación de HS 3, mínimo 3 450 W | ap. 3.4 |
| Recarga del VE | 3 680 W × 10 % de las plazas × 0,3 (colectivo con SPL) o 1,0; en oficinas, una estación por cada 40 plazas | ap. 5.2; ITC-BT-52 ap. 4; HE 6 ap. 3 |
| Carga total | Suma e intensidad de la LGA (400 V, cos φ 0,9, criterio) | ap. 3, 4 y 6 |
| Contadores | Caja de protección y medida, armario (≤ 16) o local (> 16), en PB o primer sótano; con los módulos de reserva de la recarga | ITC-BT-16 ap. 2.1 y 2.2; ITC-BT-52 ap. 3.2 b |
| Documentación | Proyecto (grupos e, f, g, h, z) o memoria técnica de diseño | ITC-BT-04 ap. 3.1 y 4 |

## Fuera de alcance

- Secciones de la LGA, las derivaciones individuales y los circuitos interiores (caídas de
  tensión, ITC-BT-14, 15 y 25): son del proyecto o la MTD de la instalación.
- La tarifa nocturna (coeficiente = nº de viviendas) y la concentración de industrias (ap. 4.2).
- Concentraciones de contadores por plantas (edificios de más de 12 plantas): se avisa.
- La dotación de recarga del CTE (HE 6) no está en el registro: aquí solo su carga.
- El procedimiento del Anexo 2 de la Guía BT-52 (FS1·N·3 680 W con todas las plazas): se
  muestra como información, no se suma (es recomendación, no exigencia).
- Reformas y ampliaciones: Fase E.

## Definición de hecho

- [x] Typecheck, lint y build limpios. Chunk principal de 1.159 a 1.205 kB (352 kB gzip).
- [x] 1159 tests en verde, dos pasadas seguidas (1130 al empezar). Ningún snapshot cambia. Nuevos:
      `rebt/test/rebt.test.ts` (tabla 1 entera y n > 21, el ejemplo de la Guía, escalones e
      IGA, los cuatro casos, la unifamiliar elevada por la recarga, básica por superficie,
      oficinas por el ap. 4.1, mínimo de 3 450 W, SPL y plazas, ventilación de HS 3, servicios
      indicados, ACS centralizada de HE 4, más de 16 contadores con su arreglo, el local en una
      planta alta, la plaza en la parcela, monofásico hasta 14 490 W, el humo solo en uso
      Aparcamiento, la potencia estudiada del garaje, la recarga de oficinas por el HE 6, el
      contador de la recarga colectiva, frase, memoria, ficha y dibujo) y `ui.test.tsx`
      (router real con el Demo).
      Los de La obra, la memoria, el anejo, la barra lateral y el progreso cuentan ya
      veinticuatro publicadas y veinticinco apartados.
- [x] Verificación en `research/verificacion-rebt.md` (imagen del consolidado del BOE, pp.
      52–53, 97–100, 114–116, 166–169 y 266–282, y de las guías BT-10, 25, 52, 04 y 16; HE 6 de
      DBHE.pdf). Todas las cifras de `tablas.ts` coinciden; los diez huecos de su bloque M están
      corregidos.
- [x] Capturas revisadas: el Demo en claro y oscuro, la memoria, la ficha PDF y La obra.

## Desviaciones

- **La superficie de locales, oficinas y garaje es la útil** de El edificio: la ITC dice «por
  metro cuadrado y planta» sin precisar (criterio, como ya rotulaba El edificio).
- **Cada planta de un local u oficina es un local**, con su mínimo de 3 450 W y su contador.
- **Los servicios generales llevan un contador**; el garaje va con ellos (criterio).
- **El alumbrado común** con las cifras de fluorescencia de la Guía BT-10 (8 W/m² el portal y
  los vestíbulos; 4 W/m² la escalera de las demás plantas), como cota del LED.
- **El ascensor sin potencia**: el ITA-3 de la Guía (630 kg, 1 m/s, 11,5 kW), supuesto y con
  aviso.
- **La extracción del humo del garaje** (SI 3 ap. 8) no cabe en los 20 W/m²: aviso para
  sumarla en «otros servicios» (la ITC pide estudiarla de forma específica).
- **El garaje de un edificio de oficinas** con las cifras del ap. 3.4, por analogía, con aviso.
- **`ORIGEN_CRITERIO` propio**: «no es exigencia del REBT», no «del CTE».
- **Tras la verificación (bloque M):**
  - la unifamiliar es monofásica hasta 14 490 W (ap. 7), no hasta 9 200;
  - la unifamiliar sin garaje puede declarar plaza o zona prevista en la parcela: lleva el C13
    y es elevada (ITC-BT-52 ap. 3.1; ITC-BT-10 ap. 5.1);
  - el garaje de un edificio de oficinas con más de 10 plazas prevé una estación de 3 680 W
    por cada 40 plazas o fracción (HE 6 ap. 3; el ap. 5.2 de la ITC-BT-10 es solo de
    viviendas);
  - el 0,3 solo en el **esquema colectivo con SPL** (que suma su contador principal); sin
    SPL, 1,0, válido para cualquier esquema;
  - los contadores cuentan los **módulos de reserva** (20 % de las plazas no asociadas a una
    vivienda, suponiendo una por vivienda; al menos uno), del lado de exigir local;
  - el control de humo solo en el garaje de **uso Aparcamiento** (más de 100 m² construidos,
    SI 1) que no es abierto; su potencia estudiada (ventiladores, alumbrado) se puede dar y
    manda si supera los 20 W/m²;
  - grupo e con **una sola caja general de protección** supuesta; con solo el grupo g o h,
    «proyecto del aparcamiento» y el resto, memoria técnica de diseño;
  - aviso de **reserva de local para centro de transformación** con más de 100 kW (REBT art.
    13; RD 1048/2013 art. 26, ya no el RD 1955/2000, derogado en esos artículos);
  - cada guía con su edición (la BT-52 es de septiembre de 2024, aunque el fichero diga
    «nov17»).

## Pendiente

- **Decisiones a validar por el usuario** (K-REBT de la verificación): viviendas elevadas por
  lo habitual (K-REBT.1, climatización eléctrica; la bomba de calor solo de ACS no la fuerza,
  K-REBT.2); recarga sin SPL por defecto (K-REBT.12); ascensor ITA-3 (K-REBT.5); alumbrado
  con las cifras de fluorescencia; superficie útil (K-REBT.8); el garaje con los servicios
  generales; módulos de reserva en el recuento (K-REBT.13); cos φ = 0,9.
- **Pendientes de la verificación**: el literal del art. 26 del RD 1048/2013 (el aviso del
  centro de transformación), el cos φ del Anexo 2 de las guías, la correspondencia cabina /
  carga de la UNE-EN 81-20 (en la que se apoya el ITA-3) y el cotejo en el BOE de lo que
  cambiaron el RD 1053/2014 y el RD 450/2022.
- **Básica de 7 360 W** (IGA de 32 A, Guía BT-10): hoy la básica es siempre 5 750 W.
- **Lista de la Guía** (secadora, automatización, más de 30 puntos de luz…) como casillas: hoy
  va dentro de la opción «Elevada».
- **HE 6** (dotación de recarga del CTE): no está en el registro de justificaciones.
