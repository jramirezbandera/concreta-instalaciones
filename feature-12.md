# feature-12 — Rediseño v4 · Fase 2: El edificio

> Fase 2 de [REDISENO-V4.md](REDISENO-V4.md) §4. Escrito antes de empezar y cerrado el
> 2026-10-03, con lo que cambió respecto al plan en «Desviaciones».
> Referencia visual: la pantalla «El edificio» de las maquetas v4
> (https://claude.ai/artifact/HS4vCeqgyM7Xozjzj9dnQg).

## Objetivo

El expediente deja de describir el edificio con contadores y casillas
(`plantasSobreRasante`, `tieneGaraje`, `viviendasTipo` + `repartoPlantas`…) y pasa a
tener **un modelo del edificio**: plantas agrupadas, zonas de uso con su superficie útil y
las unidades que se repiten. Todo lo que hoy se teclea como bandera se **deriva**. La
pantalla El edificio es la sección del edificio, y la sección es el editor.

Hito (REDISENO-V4 §4): **la demo se crea desde «Plurifamiliar con locales»** y **un
`.json` v1 se rechaza con un mensaje claro**.

## Alcance

### A. Modelo (`src/lib/edificio/`)

`tipos.ts` — sin lógica:

```ts
interface Edificio {
  cubierta: { tipo: TipoCubierta; superficie_m2: number };
  grupos: GrupoPlantas[];   // de arriba abajo
  unidades: UnidadTipo[];   // viviendas tipo y núcleos de aseos
}
interface GrupoPlantas {
  id: string;
  nivelInicial: number;     // el MÁS BAJO del grupo: P1–P3 → 1; S1–S2 → -2
  repeticiones: number;     // plantas iguales
  altura_m: number;         // suelo a suelo de cada planta del grupo
  zonas: Zona[];
}
interface Zona {
  id: string;
  uso: UsoZona;
  superficieUtil_m2: number;              // de ESTA zona, en cada planta del grupo
  unidades?: { tipoId: string; cantidad: number }[]; // viviendas o núcleos por planta
  plazas?: number;                         // garaje
  numero?: number;                         // trasteros
  nota?: string;                           // «planta alta · noche»
}
type UsoZona =
  | "viviendas" | "vivienda_unifamiliar" | "local_sin_uso" | "oficinas"
  | "zona_comun" | "vestibulo" | "garaje" | "garaje_privado"
  | "trasteros" | "instalaciones";
type UnidadTipo =
  | { clase: "vivienda"; id; nombre; dormitorios; banos; aseos; superficieUtil_m2 }
  | { clase: "nucleo_aseos"; id; nombre; inodoros; lavabos; superficieUtil_m2 };
```

`nivelInicial` se guarda (el JSON se lee solo y la IA de la fase 3 lo rellenará), pero
**toda edición lo recalcula** a partir del orden y las repeticiones (`renumerar`): nunca
puede quedar un hueco ni un solape de niveles.

`usos.ts` — tabla declarativa por uso: etiqueta, familia de color de la sección, si cuenta
como vivienda, «Su superficie cuenta para» (`CUENTA_SUPERFICIE`) y «Lo usan» (qué hace
cada justificación con la zona). Las cifras que muestra salen de tablas ya verificadas del
repo o de la verificación de normativa de esta fase (ver E).

`derivar.ts` — puro y testeado:

- `plantasDe(e)`: el edificio desplegado en plantas físicas, con nivel, etiqueta (PB, P1,
  S1), cota del suelo y altura.
- `resumenEdificio(e)`: plantas sobre y bajo rasante, número de viviendas, tipo de edificio
  (unifamiliar · plurifamiliar · con locales · oficinas), `tieneGaraje`, `tieneTrasteros`,
  `tieneLocalPB`, `tieneOficinas`, cubierta transitable, altura de evacuación y superficie
  útil por uso (solo se **muestra**).
- `contactoTerreno(e)`: las plantas bajo rasante y la PB si no tiene sótano debajo.
- `vecinas(e, zonaId)`: qué usos hay en la planta de encima y en la de debajo (la frontera
  de la envolvente la decide HE1 en la fase 5; aquí solo se expone).
- `validarEdificio(e)`: avisos «por revisar» en español (zona de viviendas sin tipos,
  vivienda unifamiliar mezclada con viviendas, superficie nula…).

`editar.ts` — operaciones puras que devuelven un edificio nuevo: añadir planta o sótano,
plantas iguales, altura, separar un grupo en plantas sueltas, eliminar planta, añadir,
cambiar de uso y eliminar zona, superficie, plazas, trasteros, unidades por planta,
añadir/editar/eliminar tipos (al eliminar un tipo desaparecen sus referencias), cubierta.

`casos.ts` — los cuatro casos de partida de la maqueta: vivienda unifamiliar,
plurifamiliar, plurifamiliar con locales y oficinas.

### B. Schema 2 del proyecto, sin migración

- `Proyecto` gana `edificio: Edificio` y pierde `viviendasTipo` y `repartoPlantas`.
- `DatosGenerales` se queda con lo que es de **la obra**: municipio, INE, provincia,
  altitud, intervención, zona de radón, piscina y presión de acometida. Desaparecen `uso`,
  `plantasSobreRasante`, `plantasBajoRasante`, `alturasPlantas_m`, `numViviendas`,
  `tieneGaraje`, `tieneTrasteros` y `tieneLocalPB`.
- `PROYECTO_SCHEMA_VERSION = "2"` y **claves nuevas** de `localStorage`
  (`concreta-inst-v2-…`). Las de la versión 1 no se leen ni se borran.
- La migración de claves sueltas por módulo (`migrarLegacy`, feature-6) se retira: con
  «schema 2 desde cero» sería una puerta trasera de migración que solo algunos usuarios
  verían.
- Importar un `.json` v1 → «Este expediente es de una versión anterior de Concreta
  Instalaciones y no se puede abrir en esta…». Un archivo v2 sin un edificio con forma
  válida también se rechaza.
- Inicio avisa, sin bloquear, si en el navegador quedan expedientes de la versión anterior.

### C. Lo que pasa a leer del edificio

- `derivarContexto(dg, edificio)`: la altura de evacuación sale de las cotas del edificio;
  el contexto gana `edificio: ResumenEdificio` para la herencia.
- `herencia.ts`: HS5 hereda nº de plantas, cubierta transitable y uso (privado si hay
  viviendas; público si no).
- `aplicabilidad.ts`: las reglas leen atributos derivados (`esUnifamiliar`,
  `tieneGaraje`, `tienePiscina`…) en vez de banderas tecleadas. Regla nueva si la
  verificación de E la respalda: HS3 «no aplica» en un edificio sin viviendas, garaje ni
  trasteros (la calidad del aire va por el RITE).
- Generadores: `lib/proyecto/viviendaTipo.ts` → `lib/edificio/generadores/`. El núcleo no
  cambia (vivienda tipo + reparto por planta); un adaptador saca el reparto de las zonas de
  viviendas de cada planta física. HS3, HS4 y HS5 llaman a `generarHsN(edificio)`. Los
  núcleos de aseos de oficinas no generan red todavía (fase 5).
- Cabecera del dashboard, tarjeta de datos, lista de Inicio y portada del anejo: el uso y
  los contadores salen de `resumenEdificio`.

### D. Pantallas

- **El edificio** (`/p/:id/edificio`, nueva): barra superior «PROYECTO / El edificio»;
  cabecera con el título, una frase de resumen, «Partir de un caso» (sustituye el edificio
  previa confirmación) y la línea de la obra con enlace a sus datos. Dos zonas:
  - **izquierda**, el editor de lo seleccionado: grupo de plantas (plantas iguales, altura,
    cota, sus zonas, añadir zona, separar, eliminar), zona (uso, viviendas por tipo o
    plazas o trasteros, superficie útil, «Lo que se deduce», «Lo usan»), tipo (dormitorios,
    baños, aseos o inodoros y lavabos, superficie, lo que se deduce y dónde está) o
    cubierta;
  - **derecha**, la sección de arriba abajo con la altura a escala: canalón con
    «P1–P3 × 3», altura y cota; zonas proporcionales a su superficie; rasante; sótanos con
    borde discontinuo; local sin uso rayado; «+ Planta sobre rasante», «+ Sótano» y
    leyenda; debajo, «Viviendas tipo · lo que se repite» (o «Núcleos de aseos»).
  - Todo es HTML con botones: la sección es accesible por teclado y lector, con la
    selección en `aria-pressed`. En móvil, la sección arriba y el editor debajo.
  - «Leer el cuadro de superficies» aparece desactivado con «pronto» (fase 3).
- **Datos de la obra** (`/p/:id/datos`): el formulario actual sin Geometría ni Programa.
  En el alta (`/nuevo`) el selector de uso se sustituye por «Partir de un caso», y al crear
  se abre El edificio.
- **Barra lateral**: «El edificio» apunta a la pantalla nueva.
- **La obra (dashboard)**: sale la tarjeta de viviendas tipo (vive ya en El edificio); la de
  datos resume la obra y el edificio con un enlace a cada pantalla.
- `EditorAlturasPlantas` y `TarjetaViviendasTipo` se borran: su papel lo hace El edificio.

### E. Cifras de «Lo que se deduce»

La maqueta enseña ocupación (SI 3), previsión eléctrica (ITC-BT-10), ventilación (HS3
tabla 2.2) y, por tipo, aire, UD y caudal. Solo se publica una cifra si sale de una tabla
del repo ya verificada (HS3 tabla 2.2, HS5 tabla 4.1, HS4 tabla 2.1) o si la verificación
de normativa de esta fase la confirma con cita (`research/verificacion-edificio-usos.md`).
Lo que no se verifique se queda en texto, sin número.

### F. Demo

El Demo pasa a ser el caso «Plurifamiliar con locales» en Cáceres (459 m, radón II,
250 kPa). Las entradas de sus cinco justificaciones **no cambian**: generarlas desde el
edificio es trabajo de las fases 4 y 5, y los tests de interfaz de los módulos se apoyan en
ellas. El nº de plantas que hereda HS5 sigue siendo 4.

## Fuera de alcance

- Leer el cuadro de superficies (fase 3).
- Que los módulos justifiquen locales u oficinas (fases 4 y 5).
- Uso comercial con actividad: el modelo no lo ofrece hasta que algún módulo lo justifique.
- Deshacer.

## Definición de hecho

- [x] Typecheck, lint y build limpios. El aviso de Vite de un chunk de más de 500 kB ya
      salía antes: el Demo importa los motores de forma estática desde feature-6.
- [x] 575 tests en verde. Ningún test de motor ni snapshot de ficha cambia.
- [x] Tests nuevos:
      - `lib/edificio/test/`: derivaciones, edición y deducciones;
      - `generadores/test/edificio.test.ts`: generadores desde el edificio;
      - storage v2, con el rechazo del `.json` v1;
      - aplicabilidad con atributos derivados y la regla del HS3;
      - `src/test/edificio.test.tsx`: la pantalla por el router real;
      - el alta con caso de partida en `form-datos-generales.test.tsx`.
- [x] La demo se crea desde «Plurifamiliar con locales».
- [x] Capturas revisadas: El edificio en claro y Ónice, los cuatro casos, móvil (390 px)
      con el editor debajo, La obra y Datos de la obra.

## Desviaciones

- **Usos.** El plan tenía un solo uso «vivienda». Ahora hay dos, como en el selector de la
  maqueta:
  - «viviendas»: las de una plurifamiliar, con cuántas de cada tipo por planta;
  - «vivienda_unifamiliar»: una parte de la casa, que puede ocupar varias plantas. La casa
    es la primera vivienda tipo.
  «comercial» no se ofrece: ningún módulo lo justifica todavía.
- **Plurifamiliar, PB.** La maqueta ponía una A y una B (158 m²) en 123 m², y no caben. En
  la PB va una A, así que el caso tiene 7 viviendas. El resto de los casos es el de la
  maqueta.
- **Piscina.** Sigue siendo un dato de la obra: está en la parcela, no es una zona del
  edificio.
- **Migración legacy retirada.** `migrarLegacy` y `CLAVES_LEGACY` desaparecen. Con «schema
  2 desde cero», las claves sueltas por módulo de antes de los expedientes habrían sido
  una migración por la puerta de atrás.
- **Verificación de normativa** (agente `cte-normativa`, en
  [research/verificacion-edificio-usos.md](research/verificacion-edificio-usos.md)).
  Leyó el DB-SI de 2025, el DB-HS de 2022, el RITE y el REBT consolidados. Lo que cambió:
  - **HS3 «no aplica»** en un edificio sin viviendas ni garaje (regla nueva en
    `aplicabilidad.ts`). Los trasteros solo entran en HS3 en edificios de viviendas; en
    otro uso, RITE.
  - **Se muestran con su cita** (`lib/edificio/tablas.ts`):
    - densidades del SI 3: vivienda 20, oficinas 10, vestíbulo administrativo 2,
      aparcamiento 15 u 40;
    - ocupación nula de trasteros de vivienda y cuartos de instalaciones;
    - grado de electrificación por vivienda (ITC-BT-10);
    - 100 W/m² con 3 450 W de mínimo en locales y oficinas, declarando que la ITC no dice
      si es superficie útil o construida;
    - aire exterior del RITE, IDA 2.
  - **No se muestran:**
    - densidad de un local sin uso: el DB remite a un uso asimilable que aún no se pide;
    - W/m² de garaje: depende de si la ventilación es natural o forzada;
    - coeficiente de la tabla 1 de la ITC-BT-10: el consolidado tiene erratas;
    - un «HS6 aplica» automático: el Apéndice B no está transcrito.
- **HS5 hereda el uso del edificio:** «privado» si tiene viviendas, «público» si no
  (oficinas).
- **Controles.** El número central de los «− n +» se puede escribir (la maqueta solo tenía
  los botones). Se aplica al salir del campo o con Enter, para que la sección no se
  descuadre a media tecla.
- **Móvil.** Al pulsar una zona, la página baja hasta el editor, que va debajo de la
  sección.
- **Módulos.** El botón «Generar desde viviendas tipo» de HS3, HS4 y HS5 pasa a «Generar
  desde El edificio». Como el Demo ya tiene viviendas, ahora se ve en el Demo.
- **Inicio** avisa, sin bloquear, si en el navegador quedan expedientes de la versión 1.

## Pendiente

- La nota de una zona («planta alta · noche») se ve en la sección pero no se edita.
- Pedir el uso asimilable del local sin uso (densidad del SI 3 e IDA del RITE).
- Las fronteras de la envolvente: `vecinasDe` solo las expone; las decide HE1 en la
  fase 5.
- Los núcleos de aseos de oficinas no generan red (fase 5).
- Lo que dejó abierto la verificación:
  - cotejar la tabla 1 de la ITC-BT-10 con el BOE de 2002;
  - transcribir el Apéndice B del HS6;
  - la guía técnica de la ITC-BT-10.
