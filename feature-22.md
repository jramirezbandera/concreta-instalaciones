# feature-22 — Fase D · HE 4 (ACS renovable) y HE 5 (generación eléctrica renovable)

> Quinta pieza de la Fase D de [UX-RECONCEPT.md](UX-RECONCEPT.md) §11 (HS1 → SI1–SI6 → SUA →
> HS2 → **HE4/HE5** → REBT → HR), con el patrón v4 y la pantalla común de SI
> ([feature-19.md](feature-19.md)), que ya usan SUA ([feature-20.md](feature-20.md)) y HS 2
> ([feature-21.md](feature-21.md)). Escrito al empezar, el 2026-10-05, y cerrado con lo que
> cambió en «Desviaciones».
>
> Verificación normativa, contra el PDF oficial (`research/pdf/DBHE.pdf`, consolidado
> 14-jun-2022), el DB comentado (`research/pdf/DccHE.pdf`) y la Guía de aplicación del DB-HE
> 2019 (`research/pdf/Guia_aplicacion_DBHE2019.pdf`):
> [research/verificacion-he4-he5.md](research/verificacion-he4-he5.md).

## Objetivo

Dos comprobaciones cortas que salen casi enteras de El edificio y de los datos de la obra:

- **HE 4.** La demanda de ACS de referencia (Anejo F: 28 l/día·persona a 60 °C con la
  ocupación mínima por dormitorios de cada vivienda tipo, el factor de centralización si la
  producción es central y la tabla c para las oficinas) decide si aplica (> 100 l/d) y la
  contribución renovable mínima (60 % o 70 %). Con el agua fría del Anejo G por la provincia
  y la altitud sale la demanda energética mes a mes (lo que pide el ap. 4 a). Lo único que no
  sabe el edificio es **con qué se produce el ACS**: bomba de calor (renovable =
  1 − 1/SCOPdhw, con SCOPdhw ≥ 2,5), solar térmica con su apoyo, biomasa o red urbana.
- **HE 5.** La superficie construida (con el garaje interior) decide si aplica (> 1.000 m²) y
  Pmin = menor de P1 = Fpr;el·S y P2 = 0,1·(0,5·Sc − Soc), con la cubierta no transitable de El
  edificio y los captadores térmicos de HE 4. Se compara con la potencia que se instala.

Hito: **HE4 y HE5 en la barra lateral como publicadas**, con los cuatro casos de El edificio,
en La obra (deja de verse la fila junta «HE4·5 · pronto»), en la memoria CTE y en el anejo;
«no aplica» calculado (demanda ≤ 100 l/d; S ≤ 1.000 m²) con su párrafo y su cita.

## Principios

- **La pantalla común, sin duplicarla.** Dos `DefinicionSi` más (`db: "DB-HE"`), carpetas
  `src/modules/he4/` y `src/modules/he5/`; iconos nuevos en el dibujo común.
- **Ninguna cifra sin verificar.** Agente `cte-normativa`, casilla a casilla contra la imagen
  del PDF (tabla a-Anejo G entera); lo que no fija el DB va rotulado como criterio.
- **La IA propone, el motor calcula; el proyectista aporta lo que es de su proyecto.** El
  SCOPdhw del equipo y la fracción solar de su cálculo son datos del proyecto, no cifras del
  CTE: sin ellos se supone el mínimo reglamentario y se avisa.
- **Un dato se escribe una vez.** HE 5 lee los captadores solares de HE 4 (estado guardado del
  expediente), no los vuelve a pedir.

## Alcance

| Sección | Elemento | Qué comprueba | Cita |
|---|---|---|---|
| HE 4 | Demanda de referencia | Σ 28 l/d·persona × ocupación (tabla a) × fc (tabla b) + oficinas (tabla c) | Anejo F |
| HE 4 | Demanda energética | Mes a mes con el agua fría del Anejo G (corrección por altitud) y las pérdidas | ap. 4 a, Anejo G |
| HE 4 | Contribución renovable | % renovable del sistema frente al 60 % / 70 % | ap. 3.1 |
| HE 5 | Superficie construida | S con el garaje interior, > 1.000 m² | ap. 1 |
| HE 5 | Potencia mínima | Pmin = mín(P1, P2) | ap. 3 |
| HE 5 | Potencia instalada | P ≥ Pmin | ap. 3 y 4 |

## Fuera de alcance

- Climatización de piscinas cubiertas (HE 4 ap. 1 d): la piscina de la obra es exterior.
- Cálculo de la fracción solar (f-chart, CHEQ4): la aporta el proyectista.
- Energía residual (HE 4 ap. 3.1 pto 5) y cogeneración.
- Reformas y ampliaciones (los supuestos b y c de los dos ámbitos): Fase E.
- HE 5 pto 2 (imposibilidad urbanística o protección): se cita en la memoria; no se calcula.

## Definición de hecho

- [x] Typecheck, lint y build limpios. Chunk principal de 1.102 a 1.159 kB (339 kB gzip): La
      obra y la aplicabilidad importan las dos definiciones y la tabla del Anejo G.
- [x] 1130 tests en verde, dos pasadas seguidas (1102 al empezar). Ningún snapshot cambia.
      Nuevos: `he4/test/he4.test.ts` (tablas a, b y c del Anejo F, 60/70 % con 5000 l/d
      estricto, Anejo G y su corrección por altitud, 1 − 1/SCOP y el 0 bajo 2,5, los cuatro
      casos, el estudio y la unifamiliar de 84 l/d que no aplica, centralización, oficinas,
      energía mes a mes, solar con apoyo, biomasa, red, comparación sin redondear, memoria,
      ficha y dibujo), `he5/test/he5.test.ts` (P1 y P2, los cuatro casos, edificio mixto,
      captadores de HE 4, cubierta transitable con Pmin = 0, potencia corta y su arreglo) y
      `ui.test.tsx` de los dos (router real con el Demo). Los de La obra, la memoria CTE, el
      anejo, la barra lateral y el progreso cuentan ya veintitrés.
- [x] Verificación en `research/verificacion-he4-he5.md` (imagen de DBHE pp. 28–32 y 36–56,
      la tabla a-Anejo G casilla a casilla a 300 ppp: 676 casillas sin discrepancias; DccHE
      22-12-2023; Guía de aplicación pp. 61–72).
- [x] Capturas revisadas: el Demo en claro y oscuro (HE 4 con bomba de calor y con solar,
      HE 5), La obra, las memorias y las fichas PDF.

## Desviaciones

- **Una sola altitud de las capitales: la de la tabla a-Anejo G** (`src/data/aguaFriaHE.ts`).
  La usan HE 4 (agua fría), HE 1 (clima de enero, que tenía su propia copia) y la zona
  climática que se sugiere al elegir la capital (`zonasClimaticasHE.ts`, cuyas altitudes
  orientativas no coincidían con el Anejo G en 34 de las 52). Cambia la zona sugerida de dos
  capitales: **Toledo** 445 → 629 m, C4 → D3, y **Zaragoza** 207 → 199 m, D3 → C3 (a 2 m del
  límite de 201 m: la app ya avisa de un tramo cercano). Pedido por el usuario al cerrar.
- **Pérdidas**: el DB no da cifra. Sin el dato, 10 % sin recirculación (producción
  individual) y 20 % con ella (centralizada), rotulado como hipótesis sin fuente normativa y
  con aviso «provisional». No cambia el porcentaje renovable, solo la energía.
- **ρ·c = 1,1628 Wh/(l·K)** (4,186/3,6, física): ni el DB ni la Guía lo fijan.
- **Tabla a-Anejo F**: las columnas «6» y «≥6» se solapan; se lee 6 → 6 personas y más de 6 →
  7 (criterio). El estudio cuenta como un dormitorio (1,5 personas).
- **Solar térmica**: sin la fracción solar del cálculo, la exigida como objetivo de diseño
  (aviso revisable); la herramienta no hace f-chart. La red urbana sin su fracción renovable
  no cuenta nada (no cumple hasta que se da).
- **El porcentaje renovable se compara sin redondear** (SCOP 3,33 da 69,97 %, que se muestra
  70 % y no cumple el 70 %).
- **HE 5 en edificio mixto**: cada uso con su Fpr;el (lo común, los trasteros, los cuartos y
  el garaje con el uso principal; el local sin actividad a 0,010), con aviso de criterio.
- **Pmin = máx(0; mín(P1, P2))**: con toda la cubierta transitable, Sc = 0 y no se deriva
  potencia mínima (lectura literal, sin comentario del Ministerio), con aviso.
- **Aplicabilidad calculada**: `AtributosProyecto` gana `demandaAcs_l_d` y
  `superficieConstruida_m2` (opcionales); las reglas de HE 4 y HE 5 los leen. La demanda usa
  lo guardado en HE 4 (centralización, ocupantes de oficinas).
- **`ProyectoSi.justificaciones`** (opcional): HE 5 lee los captadores de HE 4 de su estado
  guardado; la pantalla común lo pasa, La obra y el anejo ya pasaban el proyecto entero.
- **Registro**: HE 5 deja de llamarse «Fotovoltaica mínima» (la exigencia es neutra en
  tecnología): «Generación eléctrica renovable», ruta `he/generacion`; HE 4, «ACS de origen
  renovable», ruta `he/acs`. La fila junta «HE4·5 · pronto» de La obra ya no sale.
- **`CampoNumero.etiqueta`**: nombre accesible para los campos sueltos de una decisión.
- **Iconos nuevos** del dibujo común: captador, fotovoltaica, bomba de calor, caldera, grifo.
- **Títulos cortos en la ficha** («HE 4 — ACS renovable», «HE 5 — Generación renovable»): los
  largos pisaban la cabecera.

## Pendiente

- **Decisiones a validar por el usuario** (K-HE4.3, .4, .7 y K-HE5.3 a .6 de la verificación):
  bomba de calor como lo habitual con SCOPdhw supuesto 2,5 (da justo el 60 %); pérdidas del 10
  / 20 %; 6 dormitorios → 6 personas; ocupantes de oficinas por la densidad de SI 3; locales
  sin actividad fuera de la demanda; Fpr;el por usos en el edificio mixto; Pmin = 0 con la
  cubierta transitable; la potencia instalada por defecto = la mínima.
- **Bombas de calor térmicas** (SCOPdhw ≥ 1,15), **energía residual**, **FV conectada al ACS**
  (fototermia, reparto por consumos EPB) y **biomasa no densificada / redes de distrito** con
  sus factores (falta leer el documento reconocido del RITE de factores de paso).
- **Solar mes a mes** con el tope mensual (Guía p. 64): hoy se da la fracción anual.
- **Varios edificios en la misma parcela** (HE 5: se suman para el umbral) y **ampliaciones /
  reformas** (los supuestos b y c de los dos ámbitos): Fase E.
- **HE 5 pto 2** (imposibilidad): solo se cita; no hay vía para justificar menos potencia.
