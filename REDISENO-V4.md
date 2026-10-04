# Rediseño v4 — plan de implementación

> Estado: **fases 0 a 6 hechas: plan completo** · 2026-10-04 (fase 1 en
> [feature-11.md](feature-11.md), fase 2 en [feature-12.md](feature-12.md), fase 3 en
> [feature-13.md](feature-13.md), fase 4 en [feature-14.md](feature-14.md), fase 5 en
> [feature-15.md](feature-15.md), fase 6 en [feature-16.md](feature-16.md)).
> Origen: maquetas validadas por el usuario
> (https://claude.ai/artifact/HS4vCeqgyM7Xozjzj9dnQg, versión 11).
> Relación con [UX-RECONCEPT.md](UX-RECONCEPT.md): lo amplía y **reabre tres de sus decisiones
> cerradas** (§2). El resto del reconcept —proyecto-céntrico, la IA propone y el motor calcula,
> la ficha trazable, PWA sin backend— sigue vigente.

---

## 1. Qué cambia, en una página

| Hoy | v4 |
|---|---|
| Tokens propios (acento `#0284c7`, oscuro azul marino). | **Tokens de Concreta**: acento `#0369a1`, oscuro «Ónice», Geist/Geist Mono, radio 4 px, sin sombras. |
| Barra lateral con las 5 justificaciones hechas. | **Barra lateral con todas**, agrupadas por DB, con estado: ✓ · ! (por revisar) · ✕ · «pronto». |
| `ModuleShell`: topbar + barra de contexto + banda de veredicto + zona de trabajo libre por módulo. | **Anatomía común en dos zonas**: cabecera (veredicto + una frase + pestañas) → avisos a lo ancho → izquierda «Qué entra» y decisiones → derecha dibujo grande con las cifras encima y franja de detalle debajo. |
| Tabla densa + outliner como entrada principal; esquema como apoyo. | **El dibujo es lo principal**; la entrada es «desde el edificio» + 3-4 decisiones. El editor de tramos queda como modo avanzado, «Ajustar a mano» (§7). |
| Datos generales con contadores de plantas, flags (`tieneGaraje`, `tieneLocalPB`…), viviendas tipo y reparto por planta. | **El edificio**: plantas agrupadas («P1–P3 × 3») con zonas de uso y superficie útil propia, más las unidades que se repiten (viviendas tipo, núcleos de aseos). Los flags pasan a ser **derivados**. |
| Solo vivienda. | Vivienda + **local en PB sin uso** (previsiones) + **oficinas** + garaje, trasteros e instalaciones. |
| Resultado = veredicto + filas. | Resultado = por elemento: valor, veredicto, **lo que manda**, alternativa descartada, cita; más **avisos por revisar** con estado persistido. |
| IA solo planificada. | **Importar cuadro de superficies** como pieza principal, portando la capa de IA de Concreta. |

## 2. Decisiones de UX-RECONCEPT que se reabren

Hay que actualizar el §13 del reconcept cuando se cierre este plan:

- **Decisión 2 — «Tabla densa + outliner como input principal de colecciones».** Pasa a ser modo
  avanzado. La entrada principal es el edificio + decisiones.
- **Decisión 3 — «Esquema como soporte compacto sincronizado (no hero, no canvas editable)».**
  Se invierte: el dibujo es el protagonista y, en El edificio, la sección *es* el editor.
- **Decisión 7 — «Usos: vivienda unifamiliar + colectiva».** Entran local sin uso en PB (como
  previsión), oficinas, garaje, trasteros e instalaciones.
- **Decisión 12 — lenguaje visual.** Se sustituye por los tokens de Concreta; las maquetas v4
  son la nueva referencia.

## 3. Arquitectura objetivo

### 3.1 El edificio (modelo de datos)

```ts
interface Edificio {
  cubierta: { tipo: TipoCubierta; superficie_m2: number };
  /** De arriba abajo. Un grupo = una o varias plantas IGUALES. */
  grupos: GrupoPlantas[];
  /** Lo que se repite: viviendas tipo y núcleos de aseos. */
  unidades: UnidadTipo[];
}

interface GrupoPlantas {
  id: string;
  nivelInicial: number;       // 0 = PB, 1, 2… ; -1 = S1, -2…
  repeticiones: number;       // «P1–P3 × 3» → nivelInicial 1, repeticiones 3
  altura_m: number;           // suelo a suelo de CADA planta del grupo
  zonas: Zona[];
}

interface Zona {
  id: string;
  uso: UsoZona;
  superficieUtil_m2: number;  // de ESTA zona, en cada planta del grupo
  unidades?: { tipoId: string; cantidad: number }[]; // viviendas / núcleos por planta
  plazas?: number;            // garaje
  numero?: number;            // trasteros
  nota?: string;              // «planta alta · noche» en la unifamiliar
}

type UsoZona =
  | "vivienda" | "local_sin_uso" | "comercial" | "oficinas"
  | "zona_comun" | "vestibulo" | "garaje" | "garaje_privado"
  | "trasteros" | "instalaciones";
```

**Superficie: siempre la útil de la zona, nunca la de la planta.** Así resolvemos lo que
apuntaste:

- Cada DB decide **qué zonas cuenta**, según el uso, en una tabla declarativa
  `CUENTA_SUPERFICIE: Record<UsoZona, …>`, versionada y con cita:
  - **SI 3:** ocupación por la densidad de cada uso. **Instalaciones = ocupación nula**: son
    las «zonas de ocupación ocasional y accesibles únicamente a efectos de mantenimiento» de la
    tabla 2.1.
  - **HS3:** garaje (por plaza) y trasteros (por m²).
  - **REBT:** W/m² según el uso.
  - **HE:** superficie habitable dentro de la envolvente.
- Los cuartos técnicos, de contadores o del grupo de presión **son zonas propias** de uso
  `instalaciones`, no superficie metida en otra zona.
- El total de la planta solo se **muestra**, nunca alimenta un cálculo.
- **En la UI:** el campo se llama «Superficie útil de la zona», y «Lo que se deduce» abre con
  «Su superficie cuenta para: SI · HE1 · REBT» o «nada: ocupación nula». Ya está en la maqueta.

**Lo que pasa a derivarse del edificio** (en `lib/edificio/derivar.ts`, puro y testeado):

- plantas sobre y bajo rasante;
- cotas de cada planta y altura de evacuación (sustituye a `alturasPlantas_m`);
- número de viviendas;
- `tieneGaraje`, `tieneTrasteros`, `tieneLocalPB`;
- qué zonas tocan el terreno: plantas bajo rasante y PB sin sótano debajo;
- la frontera de la envolvente: zonas habitables que lindan con zonas no habitables o con
  otro uso.

`aplicabilidad.ts` y `herencia.ts` leen de ahí, no de flags tecleados.

**Sin migración** (decisión de §7). El `Proyecto` pasa a schema `"2"` y se empieza de cero:

- se guarda bajo una clave nueva de `localStorage`; la de la versión 1 no se lee ni se borra;
- al importar un `.json` de la versión 1 se rechaza con un mensaje claro («este expediente es de
  una versión anterior»), no se intenta convertir;
- `plantasSobreRasante`, `alturasPlantas_m`, `repartoPlantas`, `viviendasTipo` y los flags
  desaparecen del modelo: todo sale de `Edificio` y de `derivar.ts`.

### 3.2 Contrato de resultado de los motores

Cada `calcular()` sigue siendo puro, y su resultado añade una capa de **explicación
estructurada**. No lleva prosa: la prosa la pone la UI con plantillas en español, así que el
motor sigue siendo testeable por datos.

```ts
interface ElementoResultado {
  id: string;                         // estable: «bajante-A-fecales», «colector-general»
  tipo: string;                       // «bajante», «colector», «grifo», «cerramiento»…
  veredicto: "ok" | "fail" | "previsto" | "criterio";
  valor: Cantidad;                    // Ø110, 124 kPa, U 0,38…
  limite?: Cantidad;
  manda: Gobierno;                    // lo que decide el valor (ver abajo)
  alternativa?: { valor: Cantidad; capacidad: Cantidad; porQueNo: Gobierno };
  uso?: number;                       // 0–1, capacidad usada
  cita: string[];                     // «HS 5 · tabla 4.4»
}

type Gobierno =
  | { tipo: "capacidad_tabla"; tabla: string; recibe: Cantidad; admite: Cantidad }
  | { tipo: "minimo_aparato"; aparato: string; diametroMin: number }
  | { tipo: "no_menor_que_aguas_arriba"; elementos: string[] }
  | { tipo: "presion_por_altura"; altura_m: number; perdidas: Desglose[] }
  | { tipo: "equilibrado"; entra: number; sale: number }
  | { tipo: "resistencia_capa"; capa: string; fraccion: number; espesorMinimo_mm: number }
  | { tipo: "decision_proyectista"; decision: string };

interface Aviso {
  id: string;                         // estable, para persistir que se revisó
  tipo: "supuesto" | "caso_especial" | "fuera_de_alcance";
  elementoId?: string;
  datos: Record<string, unknown>;     // la UI redacta
  accion?: { tipo: "aplicar_cambio"; cambio: Partial<unknown> };   // «Cambiar a bajo emisivo»
}
```

Más:

- **`frase(resultado)`**, que extiende el `resumen.ts` actual: la frase de la cabecera y la
  primera de la memoria.
- **`anclas(resultado)`** en `svg-meta.ts`: para cada elemento, su punto (x, y) en el viewBox
  del dibujo, que es donde se coloca la etiqueta HTML pulsable.

### 3.3 La cáscara común

En `components/justificacion/`:

| Componente | Sustituye a | Qué hace |
|---|---|---|
| `AppShell` + `Sidebar` v4 | los actuales | Barra lateral completa desde `justificacionRegistry`, con el glifo de estado (incluye «por revisar»). |
| `ModuleLayout` | `ModuleShell` + `BandaVeredicto` + `BarraContexto` | Cabecera (código, título, veredicto, frase, pestañas Esquema · Comprobaciones · Memoria) y avisos. |
| `QueEntra` | `BarraContexto` / `ExcepcionesLocales` | Partes del edificio y cómo las trata esta justificación. La excepción local sobrevive como «cambiar solo aquí». |
| `Decision` | — | Pregunta, opciones, «Lo habitual» y la consecuencia en una línea. |
| `DibujoConEtiquetas` | — | SVG del módulo + etiquetas HTML en % sobre las anclas; selección compartida con la lista. |
| `FranjaDetalle` | — | Qué es · lo que manda · cuentas y cita del elemento seleccionado. |
| `VistaComprobaciones` | filas actuales | Tabla accesible de todos los elementos. Es la alternativa en texto al dibujo (SPEC §4.4). |
| `VistaMemoria` | — | Texto de la memoria, sin edición, con «Copiar». **Hasta §3.2 enseña la ficha PDF dentro de la página** (fase 1). |

Para el PDF de la ficha el dibujo se renderiza en **modo papel**, con las etiquetas como
`<text>` dentro del SVG, porque `svg2pdf` no ve HTML. Es la misma geometría y los mismos
datos.

### 3.4 Estado por justificación

`JustificacionEnProyecto` gana `revisados: string[]` (ids de aviso marcados por el
proyectista) y `EstadoJustificacion` gana `pendientes: number`. Un aviso revisado viaja a la
ficha como «revisado por el proyectista». El chip y la barra lateral muestran **!** cuando
cumple pero quedan avisos sin revisar.

### 3.5 IA — «Leer el cuadro de superficies»

El reconcept ya lo marca como el momento *wow* (§12.3). El plan:

- **Portar la capa de IA de Concreta**: `src/lib/ai` y `src/components/ai`, unas 5.500 líneas
  con proveedores, clave compartida y propia, lectura de PDF e imágenes, revisión de propuesta
  y reglas de seguridad. Su adaptador de **Cargas por planta** —la tabla entera como payload,
  con reemplazo completo— es casi exactamente lo que necesita El edificio.
- **Adaptador `edificio`.** Entra la imagen o el PDF del cuadro de superficies. La propuesta
  trae los grupos, las zonas con uso y superficie útil, y las viviendas tipo con sus estancias.
  Se revisa en una **tabla de propuesta**:
  - cada fila del cuadro con la zona a la que va;
  - una confianza por fila;
  - aceptar o corregir antes de aplicar.
- **Reglas propias de este adaptador:**
  - las estancias de instalaciones se clasifican aparte (ocupación nula);
  - las superficies construidas se descartan con motivo;
  - las plantas con el mismo programa se proponen agrupadas.
- **Trazabilidad:** cada zona importada lleva «extraído de documento aportado (IA), revisado
  por el proyectista», que llega a la ficha.
- **Después**, con la misma tubería: «Importar cerramiento» (capas de HE1) e «Importar
  aparatos».

## 4. Fases

Cada fase se escribe como su `feature-N.md` antes de empezar y termina con tests en verde,
snapshots de ficha sin cambios no intencionados y capturas de pantalla para revisión visual.

| Fase | Contenido | Hito / criterio de hecho |
|---|---|---|
| **0 · Decisiones y arreglo urgente** ✅ | §7 respondido. UX-RECONCEPT §13 marcado (decisiones 2, 3, 7 y 12 sustituidas). Docs de UMD corregidos (`IDR-INSTALACIONES.md`, `research/normativa-he1-transmitancia.md`). **HS5:** ningún tramo queda por debajo del desagüe de sus aparatos (inodoro Ø100 → Ø110) y `capacidad_ud` pasa a ser la del Ø final; con test unitario y de propiedades. Las correcciones de `hs6/tablas.ts` se dejan para HS6 en la fase 5: piden verificar contra el PDF. | Hecho: 514 tests en verde; solo cambian los 3 snapshots de HS5, como se esperaba. |
| **1 · Chasis** ✅ | Tokens de Concreta y Ónice; barra lateral completa con estados; barra superior como ruta; `ModuleLayout` (cabecera con veredicto y frase, pestañas, avisos a lo ancho), `DelProyecto`, `LienzoAjustado`, `FranjaDetalle`, `ListaElementos`, `FilaResumen` y `VistaMemoria`. Los 5 módulos montados **sin tocar motores**: lo suelto y lo heredado a la izquierda, el dibujo grande, y el outliner en Comprobaciones a todo el ancho. `QueEntra`, `Decision` y `DibujoConEtiquetas` se aplazan a las fases 2 y 4, cuando tengan datos (ver feature-11 «Decisiones»). | Hecho: 527 tests en verde; ningún test de motor ni snapshot de ficha cambia; capturas en claro, Ónice y móvil. |
| **2 · El edificio** ✅ | Modelo `Edificio` (schema 2, sin migrador), derivaciones, pantalla con la sección como editor, editor a la izquierda, unidades que se repiten, 4 casos de partida. Generadores `viviendaTipo.ts` → `generadores/` leyendo zonas. | Hecho: 575 tests en verde; la demo sale de «Plurifamiliar con locales» y un `.json` v1 se rechaza con mensaje claro. Desviaciones en feature-12. |
| **3 · Cuadro de superficies** ✅ | Port de la capa IA (lo de una lectura de una pasada; el chat no), adaptador `edificio` (la IA transcribe y clasifica filas; `montar.ts` suma, saca los tipos y agrupa plantas), tabla de propuesta con el edificio al lado, trazabilidad hasta la portada del anejo. | Hecho: 657 tests en verde; lectura real con Gemini de un PDF, un plano A1 y una captura, con el edificio esperado. Desviaciones en feature-13. |
| **4 · HS5 patrón** ✅ | Contrato de §3.2 completo en HS5. **Pluviales** con las tablas 4.6–4.9 y B.1; la intensidad es un dato de la obra, porque no hay relación oficial por municipio. Red deducida de El edificio, con cuatro decisiones. Previsión del local y garaje con bombeo. Sección con etiquetas, franja, lista, memoria redactada, avisos revisables y «Ajustar a mano». | Hecho: 715 tests en verde; los cuatro casos como en la maqueta, con el motor detrás. Desviaciones en feature-14. |
| **5 · HS4, HS3, HS6, HE1** ✅ | Mismo contrato, módulo a módulo (detalle en §5). Cada motor corregido por su verificación normativa (`research/verificacion-*-v4.md`); justificación desde El edificio con decisiones, dibujo con etiquetas, franja, lista, memoria, avisos revisables, incumplimientos con su arreglo, ficha, Demo y anejo. Motor 0.2.0. | Hecho: 776 tests en verde; desviaciones (Uf del PVC, HE1 con ec. 10, aislante del forjado bajo el forjado, equilibrado «se reparte» en HS3, Cáceres en zona II por comprobar) en feature-15. |
| **6 · La obra** ✅ | «Lo que se justifica» con estados y «Antes de entregar» (avisos y no-cumples agregados); entregables: memoria CTE (página propia, Word y PDF), fichas (el anejo) y esquemas de saneamiento y fontanería en DXF. El estado de cada justificación se calcula del expediente: se retira el caché de veredictos. | Hecho: 831 tests en verde; la barra lateral cambia al cambiar El edificio sin abrir el módulo; el Word abierto en Word y el DXF auditado. Desviaciones en feature-16. |

**Orden.** Las fases 1 y 2 se pueden solapar: la 1 no toca datos y la 2 no toca módulos. La 3
va justo después de la 2 porque necesita el schema estable. Dentro de la 5, cada módulo es
independiente.

## 5. Por módulo: lo que falta en el motor

Punto de partida común: los cinco motores son puros, devuelven `veredictoGlobal` y
`warnings: string[]`, y **ninguno devuelve alternativas**. HS3, HS4, HS5 y HE1 ya tienen
selección por clic en el SVG, que es la base de las etiquetas pulsables; HS6 no. Hay que pasar
los `warnings` en texto a `Aviso[]` con id estable, y lo que hoy es `motivo` (texto libre) a
`Gobierno`.

| Módulo | Lo que ya hay | Lo que falta para v4 | Tamaño |
|---|---|---|---|
| **HS5** | Red por tramos con UD acumuladas, Ø por tabla y por monotonía (`motivo` en texto), ventilación. Generador desde vivienda tipo. | **Corregir el Ø mínimo por aparato.** Hoy la monotonía solo mira los tramos hijos y no el desagüe del aparato: el snapshot por defecto da un `ramal-aseo` Ø50 con inodoro, y el caso multiplanta da bajante Ø90 con inodoros (`calc.ts:357`). **Pluviales enteros**: sumideros (4.6), canalones (4.7), bajantes (4.8), colectores (4.9), intensidad por municipio (apéndice B). Red separativa con unión final y cierre hidráulico. Previsión del local. Garaje bajo la acometida → bombeo como aviso. UD por ramal de planta medidas, no estimadas como UD/plantas (`calc.ts:514`). | Grande |
| **HS4** | Árbol de tramos, presión residual por tramo, punto crítico por menor margen, `grupoPresionNecesario` (booleano). | Presión **por planta** para el gráfico. «Funciona desde X kPa», que es invertir el punto crítico. Grupo de presión como cambio aplicable, con la presión a la salida. Contador del local previsto. Veredicto `criterio` para la velocidad. Queda fuera de v4: dimensionar la bomba y el agua caliente. | Medio |
| **HS3** | Estancias de una vivienda, equilibrado, aberturas, conductos, red de colectivos. Generador de la vertical tipo. | **Tabla 2.2 sin usar**: `CAUDALES_NO_HABITABLES` existe (`tablas.ts:101`) pero ningún cálculo la lee. Hay que añadir garaje (120 l/s por plaza, admisión, detección de CO) y trasteros (0,7 l/s·m²). Varias viviendas tipo en una misma justificación, con una vista por tipo. Local y oficinas → «RITE» como fuera de alcance. | Medio |
| **HS6** | Zona, contacto con el terreno, lista de soluciones con requisitos, combinación suficiente. | Recalcular desde El edificio qué toca el terreno. **Garaje como espacio de contención** (ap. 3.2.1 y 3.2.5: basta la ventilación de HS3), cuando hoy es un aviso que remite a HS3. Posición de la barrera como decisión. Núcleo que comunica garaje y PB como aviso. Corregir la deuda de §6. Selección en el SVG. | Medio |
| **HE1** | Cerramientos por capas, U, fRsi, Glaser, puentes, límites por tipo. | **Particiones entre usos (tabla 3.2)** y la decisión del local (0,70/0,95). **Huecos de verdad**: Uw desde Ug, Uf y fracción de marco; hoy son una capa ficticia y se les aplica fRsi y Glaser. Espesor mínimo que cumple (invertir U). El límite que manda (Ulim frente a UmaxFRsi) pasa del SVG al resultado. Cambio mínimo aplicable cuando no cumple. | Medio-grande |

Además, comunes: `frase()` en lugar de `resumen()`, `anclas()` en cada `svg-meta.ts`, y
`toFichaData` con el modo papel de las etiquetas. Las rutas de `App.tsx` repiten las del
`justificacionRegistry`: conviene generarlas desde el registry ahora que la barra lateral lo
lee entero.

**Tests de hoy, que deben seguir en verde:**

| Módulo | Unitarios | Snapshots | Propiedades | Otros |
|---|---|---|---|---|
| HS3 | 23 | 3 | 7 | |
| HS4 | 12 | 4 | 10 | ficha 12, SVG 11 |
| HS5 | 14 | 3 | 5 | |
| HS6 | 11 | 10 | 8 | ficha 12, SVG 12 |
| HE1 | 17 | 5 | ~10 | |

Cambios de snapshot que sí se esperan:
- el de HS5 por la corrección del Ø, que es la intención;
- los de la ficha por el modo papel.

Cualquier otro cambio de snapshot es una regresión.

## 6. Deuda normativa encontrada (verificación del 2026-10-03)

- **HE1:** falta la **tabla 3.2** (particiones entre unidades de distinto uso, zona C 0,95). El
  forjado sobre un local es 0,95 si el local es otra unidad, o UT 0,70 si se trata como no
  habitable: es una decisión del módulo.
- **Docs:** `IDR-INSTALACIONES.md` §0 y `research/normativa-he1-transmitancia.md` dicen que UMD
  no tiene valor. Es incorrecto: comparte fila con UT.
- **HS6 (`hs6/tablas.ts`):**
  - corregir la cita «art. 3.1» → ap. 3, punto 1, a) y b);
  - la difusión es estrictamente < 10⁻¹¹, no ≤;
  - la altura de 5 cm solo aplica a edificios existentes;
  - no se localiza «0,1 ren/h»;
  - el garaje ventilado puede ser espacio de contención (ap. 3.2.1 y 3.2.5).
- **HS5:**
  - la ventilación secundaria en plantas alternas da la columna como ½ Ø de la bajante sin
    llevarla a un Ø de la Tabla 4.10 (sale «Ø55 mm»); hay que redondear al primer Ø tabulado y
    comprobar la longitud efectiva;
  - faltan las tablas de pluviales 4.6, 4.8 y 4.9 y la tabla B.1. La conexión con
  alcantarillado único se cita en el **ap. 3.2**, con cierre hidráulico.
- **RITE:** oficinas IDA 2 (12,5 dm³/s·pers.), comercio IDA 3 (8 dm³/s·pers.). Un local sin uso
  no tiene IDA: es un dato pendiente.
- **HS4:**
  - la horquilla de velocidad es criterio de dimensionado, no comprobación de cumplimiento
    (veredicto `criterio`, nunca «no cumple»);
  - revisar la cita de la temperatura de ACS (el repo pone ap. 2.3).
- **Pendiente:** la comprobación celda a celda contra el PDF oficial (no se pudo leer sin
  poppler). Regla del proyecto: no se cierra ninguna tabla nueva sin ella.

## 7. Decisiones tomadas (2026-10-03)

1. **El editor de tramos se queda como modo avanzado** de HS4 y HS5: un botón «Ajustar a mano»
   que lo abre sobre la red generada, fuera del camino principal.
2. **Oficinas:** el modelo de El edificio las admite desde la fase 2; los módulos las justifican
   a partir de la fase 5.
3. **Proveedor de IA:** se porta la capa de Concreta tal cual (Anthropic, OpenAI y Gemini tras la
   misma interfaz), con Gemini por defecto. *No se preguntó expresamente; es la propuesta por
   defecto mientras no se diga otra cosa.*
4. **No se migran expedientes.** Schema 2 desde cero (§3.1).
5. **Excel y DXF: de momento no.** Solo IA sobre PDF o imagen en la fase 3.
