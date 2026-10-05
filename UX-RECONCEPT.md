# UX-RECONCEPT — Concreta Instalaciones

> Reconceptualización de producto y UX (sesión de trabajo 2026-08-22). El producto pasa de
> "cinco calculadoras con sidebar" a **gestor de expedientes de justificación CTE para
> vivienda**. Complementa `SPEC.md`: los innegociables de su §4 (estática/offline, motor
> determinista, trazabilidad de ficha, WCAG AA) siguen vigentes en su totalidad. En lo relativo
> a layout y flujo de UX (§12 del I+D: layout inputs-izq / visual-der, módulos independientes)
> **manda este documento**.
>
> **Enmendado por [REDISENO-V4.md](REDISENO-V4.md) (2026-10-03):** las decisiones 2, 3, 7 y 12
> de §13 quedan sustituidas. Lo que se contradiga con aquel plan, manda aquel plan.

---

## 0. Diagnóstico del estado actual (por qué se rehace)

1. **Grafo genérico como hero.** El árbol auto-layout de cajas es una estructura de datos
   pintada, no un dibujo técnico. Ningún arquitecto dibuja así una red; lo canónico es el
   esquema de columna (HS4/HS5), la sección constructiva (HE1), la planta con flechas (HS3).
   Ocupa el 60 % de la pantalla, aporta poco y con >10 tramos es ilegible.
2. **Topología por dropdowns.** Construir el árbol eligiendo "Cuelga de…" en un select por
   card obliga a mantener la topología en la cabeza. Cada card gasta ~200 px para 3 campos;
   con 15 tramos son 3 pantallas de scroll y cero visión de conjunto.
3. **No existe el "proyecto".** Cada módulo es una calculadora aislada que repite datos comunes
   (municipio, plantas, uso…). El entregable real del usuario es la memoria de UN proyecto, y
   el moat declarado del producto es la ficha — pero la UI no está orientada al documento.
4. **Todo a la vez, sin flujo.** Inputs + esquema + tablas + verificaciones + resumen
   simultáneos. No hay respuesta a "¿por dónde empiezo?" ni a "¿he terminado?".

---

## 1. Tesis de producto

- **El entregable es el anejo**, no el número: un PDF con portada, índice, las fichas
  justificativas de cada apartado y los apartados no aplicables con su párrafo redactado.
- **Público objetivo: el 80 % de los casos** = vivienda (unifamiliar y colectiva), obra nueva
  y reforma. Los usos complejos (hospitalario, pública concurrencia…) quedan explícitamente
  fuera y se rechazan con honestidad, no se soportan a medias.
- **Historia de producto / demo:** *"Memoria de vivienda unifamiliar: el anejo CTE completo
  en una tarde."*
- **Cobertura > profundidad.** Una memoria de vivienda necesita ~18 justificaciones. Para
  "darle al arquitecto todo hecho" vale más una pasada ancha de checkers baratos que un quinto
  módulo de cálculo perfecto.

---

## 2. Los tres ejes del proyecto

El modelo del expediente es: **uso × intervención × atributos → checklist de justificaciones**.

### 2.1 Uso (eje estructural, no un campo más)

- Soportados: **Vivienda unifamiliar** · **Vivienda colectiva**. (Futuro posible:
  administrativo/comercial pequeño. Nunca: hospitalario, pública concurrencia.)
- Cada motor implementa **solo la rama de vivienda** de su DB — no la tabla genérica con 12
  usos. Menos filas que transcribir, menos casos que testear, UI más corta.
- Consecuencia clave: **DB-SI para vivienda es barato** (Tier 2, no Tier 3). La complejidad de
  SI está en pública concurrencia; para vivienda SI1–SI6 son casi todo lookups tabulados
  (sector ≤ 2.500 m², EI60 entre viviendas, escalera no protegida hasta h ≤ 14 m, extintor
  cada 15 m, R30/R60 según altura…).

### 2.2 Intervención

**Obra nueva / Reforma / Ampliación / Cambio de uso.** Marco legal: CTE Parte I art. 2
(no empeoramiento, flexibilidad, proporcionalidad) + la sección de ámbito de aplicación de
cada DB (p. ej. HE1 si se renueva > 25 % de la envolvente; HS4 si se amplía/modifica la
instalación; SUA/SI sobre lo modificado). Son reglas tabulables → motor de aplicabilidad (§5).
Obra nueva es el caso particular donde todo `Aplica`.

### 2.3 Atributos discriminantes (~12 campos, se rellenan una vez)

- Identificación: nombre, **municipio** → deriva automáticamente provincia, zona climática
  (HE), zona de radón (HS6), altitud… (tablas versionadas con procedencia; futuro: viento,
  pluviometría para HS1).
- Geometría gruesa: plantas sobre/bajo rasante (→ altura de evacuación), tipo de cubierta.
- Programa: nº de viviendas, **¿garaje?**, ¿trasteros?, ¿piscina?, ¿local en planta baja?
- El garaje entra en el 80 %: la colectiva típica lo tiene y arrastra HS3-garajes,
  SI-aparcamiento y SUA7, todos tabulados para este caso.

Estos atributos generan la checklist aplicable **incluyendo los no-aplica con párrafo
redactado** ("SUA6 Piscinas: no aplica — el edificio no dispone de piscina de uso colectivo").
Esa lista es media memoria y hoy se copia con errores de memorias anteriores.

---

## 3. Arquitectura de información

```
Proyectos (inicio)
└── Proyecto "Vivienda C/ Mayor 12"     ← dashboard del expediente
    └── Justificación (HS5, SI1, …)     ← pantalla de trabajo
```

- **Nomenclatura:** "justificaciones" (nombra el valor), no "apartados"/"módulos" en la UI.
- **Persistencia:** multi-proyecto en localStorage + export/import de archivo `.json`
  (sin backend, coherente con SPEC §4.1). Proyecto "Demo" precargado.
- **Estado de cada justificación = dos dimensiones ortogonales:**
  - **Aplicabilidad:** `Aplica` · `Aplica a lo reformado` · `Aplica con flexibilidad` ·
    `No aplica` · `Externo` (HE0/HE1 global → HULC; DB-SE → Concreta estructura).
  - **Progreso:** `Sin iniciar` · `En curso` · `✓ Cumple` · `✗ No cumple`.
  - La UI los combina en un chip; el progreso sale del cálculo real, no lo marca el usuario.

---

## 4. Pantallas

### 4.1 Inicio — lista de proyectos

Filas: nombre · municipio · uso/intervención · progreso (12/18 justificadas) · última edición.
Acciones: nuevo proyecto, duplicar, import/export.

### 4.2 Dashboard del expediente (la pieza nueva más importante)

```
┌────────────────────────────────────────────────────────────────┐
│ Vivienda C/ Mayor 12          Cáceres · Zona D · Radón II      │
│ Vivienda colectiva · Obra nueva · 4 plantas · garaje           │
│ [Editar datos]  [Alcance de la intervención]* (*solo reforma)  │
├────────────────────────────────────────────────────────────────┤
│ JUSTIFICACIONES                              12/18 · 1 ✗       │
│  SALUBRIDAD                                                    │
│   HS3 Ventilación            Aplica        ✓ Cumple            │
│   HS4 Fontanería             Aplica        En curso            │
│   HS5 Saneamiento            Aplica        ✓ Cumple            │
│   HS6 Radón                  Aplica        ✗ No cumple         │
│   HS1 Humedad                Aplica        Sin iniciar         │
│  SEGURIDAD INCENDIO                                            │
│   SI1 Propagación interior   Aplica        ✓ Cumple            │
│   …                                                            │
│  NO APLICABLES                                                 │
│   SUA6 Piscinas              No aplica     ✓ (párrafo listo)   │
│  EXTERNAS                                                      │
│   HE0/HE1 global             Externo → HULC   [ref. documento] │
│   DB-SE Estructura           Externo → Concreta estructura     │
├────────────────────────────────────────────────────────────────┤
│                              [Generar anejo CTE (PDF)]         │
└────────────────────────────────────────────────────────────────┘
```

Responde a las dos preguntas que hoy no responde nada: *¿por dónde empiezo?* y *¿he
terminado?*. El botón "Generar anejo" es el momento del producto; la ficha suelta por
justificación sigue existiendo.

### 4.3 Pantalla de justificación — anatomía común

Todos los formatos comparten esqueleto:

```
┌─────────────────────────────────────────────────────────────┐
│ ← Proyecto   HS5 Saneamiento     [Cáceres · Zona D · 4 pl.] │  barra contexto
├─────────────────────────────────────────────────────────────┤
│ ✓ CUMPLE — 22 UD · bajante Ø90 · colector Ø90               │  veredicto fijo
├──────────────────────────────────────────┬──────────────────┤
│  ZONA DE TRABAJO                         │  ESQUEMA         │
│  (tabla densa / formulario según formato)│  (~380 px,       │
│                                          │   plegable)      │
├──────────────────────────────────────────┴──────────────────┤
│ Detalle / verificaciones secundarias          [Ver ficha →] │
└─────────────────────────────────────────────────────────────┘
```

- **Barra de contexto:** datos heredados del proyecto como chips de solo lectura con enlace
  "editar en proyecto". Se acaba repetir municipio/plantas/uso en cada módulo. Solo los
  overrides locales viven en la justificación.
- **Veredicto siempre visible** con el porqué crítico en una línea ("P en grifo más
  desfavorable 209 kPa ≥ 100 kPa"), no solo el color.
- **Ficha como destino:** preview del documento accesible en todo momento (side sheet o
  página), no modal gigante.

**Dos formatos de zona de trabajo:**

| Formato | Para | Justificaciones |
|---|---|---|
| **Cálculo** — tabla densa + esquema | Colecciones de elementos | HS3, HS4, HS5, HE1-predim, HS1 |
| **Checker** — formulario corto + veredicto | 5–15 inputs contra tablas | HS2, HS6, SI1–SI6, SUA*, HR, HE4/HE5/HE6, REBT |

HS6 actual es de facto el prototipo del formato checker. No se fuerza tabla donde no hay
colección.

---

## 5. Motor de aplicabilidad (reformas)

Para intervención ≠ obra nueva, entre datos generales y checklist aparece el **asistente de
alcance**: ~10 preguntas cerradas (¿se renueva envolvente? ¿% aprox.? · ¿se modifica la
instalación de fontanería? · ¿se actúa sobre estructura? · ¿cambio de uso de alguna zona?…).

De ahí se deriva, por justificación, un veredicto de aplicabilidad **con cita**:

- `Aplica` — se justifica normal.
- `Aplica a lo reformado` — la ficha declara el acotamiento ("la exigencia se verifica en los
  elementos objeto de la intervención, art. 2.3 Parte I").
- `No aplica` — párrafo redactado citando el ámbito del DB correspondiente. **El texto que hoy
  nadie sabe escribir bien**; probablemente el mayor valor unitario del producto en reformas.
- `Aplica con flexibilidad` — cumplimiento pleno inviable técnica/económicamente → se justifica
  el mayor grado de adecuación posible; exige nota del usuario y la ficha lo formaliza.

**Principio: la herramienta propone con cita; el arquitecto dispone.** El veredicto es una
propuesta editable — el criterio en reforma tiene zonas grises y la responsabilidad es del
proyectista. Los motores de cálculo no se enteran de nada de esto: todo el peso de reformas
cae en la capa de expediente.

---

## 6. Input principal: tabla densa + outliner

Para colecciones (tramos, estancias, capas), muere el card-stack con dropdowns "Cuelga de":

```
TRAMO             UD  PTE   Ø      ESTADO
▾ colector        22  2%   Ø90    ✓ Cumple
  ▾ bajante       22   —   Ø90    ✓ Cumple
      ramal-bano   7  2%   Ø63    ✓ Cumple
      ramal-aseo   6  2%   Ø50    ✓ Cumple
[+ tramo]   (Tab = anidar bajo el anterior)
```

- Una fila por elemento: **inputs y resultados en la misma fila**, edición inline.
- **Teclado primero:** Enter = nueva fila · Tab/Shift-Tab = anidar/desanidar (jerarquía por
  indentación, no por selects) · navegación por flechas.
- Cifras tabulares alineadas a la derecha, unidades en gris junto al valor.
- Accesibilidad WCAG AA se mantiene innegociable: estado por color + icono + texto.

### 6.1 Presets de aparatos (HS4/HS5)

"Baño completo", "Aseo", "Cocina" expanden a sus aparatos con UD/caudales de tabla (editables
después). Reduce el 80 % del tecleo en vivienda.

### 6.2 Vivienda tipo (clave para colectiva)

En colectiva la unidad repetitiva es la vivienda. Se definen **viviendas tipo** (T2: 2 dorm.,
baño + aseo, cocina…) y cuántas hay por planta. De ahí se derivan solos HS3 (caudales por
estancia), HS4 (aparatos), HS5 (UD), HE4 (personas → demanda ACS), SI3 (ocupación)… Es la
generalización de los presets: preset "Baño" dentro de "Vivienda tipo T2", repetida ×4
plantas. La unifamiliar es el caso degenerado: 1 vivienda tipo implícita.

---

## 7. Esquemas específicos por dominio (muere el grafo genérico)

El esquema es **soporte compacto** (~380 px, plegable), sincronizado con la tabla
(hover fila ↔ resalta elemento; clic elemento ↔ selecciona fila). La tabla manda.

| Justificación | Esquema |
|---|---|
| HS4 / HS5 | **Esquema de columna** (montante): bajante vertical, ramales horizontales por planta, Ø etiquetados. Es el dibujo que va en los planos; legible a cualquier escala porque crece con plantas, no con nº de nodos. |
| HE1 | Sección del cerramiento por capas (lo actual, compactado). |
| HS3 | Planta esquemática con flechas admisión → extracción por estancia. |
| HS6 | Sección terreno–solera–cámara (lo actual, compactado). |
| Checkers | Sin esquema o pictograma mínimo; no se fuerza. |

Crítico en rojo + etiqueta + grosor (multicanal, WCAG AA, como hasta ahora).

---

## 8. Ficha y anejo

- **Ficha por justificación** (la actual, con trazabilidad SPEC §4.3): entrada con origen →
  cita DB/artículo/tabla/edición → cálculo → veredicto.
- **Anejo del proyecto** (nuevo): portada + índice + fichas de cada justificación aplicable +
  no-aplicables con párrafo + referencias a las externas (HULC, Concreta estructura). Un solo
  PDF listo para la memoria. Reutiliza `renderFicha` unificada; añade portada/índice.

---

## 9. Lenguaje visual: "memoria técnica", no "dashboard SaaS"

- **Light-first.** El arquitecto trabaja de día junto a CAD en blanco y el entregable es papel.
  El dark actual con fondo de puntitos lee "devtool"; dark se mantiene como opción.
- **Densidad técnica:** tipografía más pequeña, menos padding, tablas con filetes finos,
  cifras monoespaciadas/tabulares. Referencia de tono: memoria bien maquetada + Linear en
  densidad.
- **Color solo con significado:** verde/ámbar/rojo de estado + un acento de selección. Cero
  decoración; el rojo del crítico recupera su fuerza.
- Las citas normativas (`DB-HS5 ap. 4.1`) se quedan como metadatos discretos junto a cada
  bloque, no en títulos de sección.

---

## 10. Mapa de cobertura (vivienda)

| Justificación | Formato | Unif. | Colect. | Coste | Estado |
|---|---|---|---|---|---|
| HS3 · HS4 · HS5 · HE1-predim | Cálculo | ✓ | ✓ (vivienda tipo) | — | Hecho (Tier 1), a re-patronar |
| HS6 radón | Checker | ✓ | ✓ | — | Hecho, a re-patronar |
| HS1 humedad (fachadas/muros/suelos/cubiertas) | Cálculo ligero | ✓ | ✓ | Medio | **Hecho** (feature-17, patrón v4) |
| HS2 residuos | Checker (fórmulas 2.1–2.3) | ✓ | ✓ | Bajo | **Hecho** (feature-21, pantalla de SI) |
| SI1–SI6 (rama vivienda) | Checkers | ✓ | ✓ | Medio total, bajo por sección | **Hecho** (feature-19, patrón v4, núcleo común) |
| SUA1–SUA9 | Checkers (SUA 8: cálculo ligero; SUA 5: no aplica) | ✓ | ✓ | Bajo | **Hecho** (feature-20, núcleo de SI) |
| HR opción simplificada | Checker (tablas 3.1–3.4, Anejo I; soluciones del CEC) | ✓ (aislada: tabiquería y fachada; adosada: Anejo I) | ✓ | Medio | **Hecho** (feature-25, pantalla de SI) |
| HE4 ACS · HE5 generación | Checkers (Anejos F y G; Pmin = mín(P1, P2)) | ✓ | ✓ | Bajo | **Hecho** (feature-22, pantalla de SI) |
| HE6 recarga del vehículo eléctrico | Checker (conducción 100 % / 20 %, estaciones 1/40) | ✓ | ✓ | Bajo | **Hecho** (feature-24, pantalla de SI; comparte esquema y estación con REBT) |
| REBT grado electrificación + previsión de cargas (ITC-BT-10) | Checker (ITC-BT-10, 16, 04 y 52) | ✓ | ✓ | Bajo | **Hecho** (feature-23, pantalla de SI) |
| ICT telecomunicaciones | Checker | — | ✓ | Bajo | **Aparcado** (post-lanzamiento) |
| HE0/HE1 global | `Externo` → HULC/CYPETHERM | — | — | — | Estado externo con ref. |
| DB-SE estructura | `Externo` → Concreta estructura | — | — | — | Cross-sell en checklist |

**El agujero honesto:** HE0/HE1 completo exige el cálculo oficial (lo confirma el I+D §0/§4);
Concreta da predimensionado de envolvente + HE4, y el dashboard lo refleja como `Externo` con
hueco para referenciar el documento — el anejo sigue estando completo.

---

## 11. Roadmap repriorizado (orientativo)

| Fase | Contenido | Hito |
|---|---|---|
| **A** | Shell del expediente: proyectos + datos generales + derivación municipio + checklist con estados (2 dimensiones) + herencia de contexto. Migrar los 5 módulos existentes al esqueleto común (sin rehacer motores). Light-first. | El producto "es" un expediente |
| **B** | Módulo patrón rediseñado: **HS5** (tabla outliner + esquema de columna + presets de aparatos) → replicar en HS4. | El patrón de cálculo validado |
| **C** | HS3 y HE1 al patrón · **vivienda tipo** · **anejo PDF** (portada, índice, no-aplica). | **Demo para validación con conocidos:** "anejo de unifamiliar en una tarde" |
| **D** | Pasada ancha de checkers: HS1 (prioridad alta) → SI1–SI6 vivienda → SUA → HS2 → HE4/HE5 → REBT → HR. | Cobertura de memoria completa |
| **E** | Reformas: asistente de alcance + motor de aplicabilidad + textos de no-aplica/flexibilidad. | Expediente de reforma |

El orden A→B→C prima tener una historia completa que enseñar; D prima cobertura sobre
profundidad; E reutiliza toda la infraestructura de checklist de A.

**Pista transversal IA (§12):** el panel de dudas puede arrancar en cualquier momento; la
extracción de documentos arranca tras B (necesita schemas estables) y "importar cuadro de
superficies" entra en el hito de demo de C.

---

## 12. Asistente de IA (capa transversal)

> Objetivo: quitarle al usuario el trabajo tedioso (transcribir datos que ya existen en otros
> documentos) y acompañarle en dudas de la app y de normativa. Referente: el modelo de
> Concreta estructura — BYOK + clave compartida en free tier de Google, todo en cliente.

### 12.1 Principio innegociable: la IA propone, el motor calcula

- **La IA nunca produce un resultado normativo.** Solo (a) rellena inputs y (b) explica.
  Todo cálculo pasa por el motor puro determinista (SPEC §4.2 intacto). Si el asistente
  "dice" que algo cumple, está leyendo el resultado del motor, no calculando.
- **Toda extracción aterriza como propuesta revisable** (tabla de revisión con confianza por
  campo → aceptar/corregir), nunca escribe directo en el estado. El proyectista confirma.
- **Trazabilidad:** la ficha ya declara el origen de cada dato; se añade el origen
  *"extraído de documento aportado (IA), revisado y confirmado por el proyectista"*.
  La ficha sigue siendo defendible.
- Implementación barata por diseño: el schema de inputs tipado de cada justificación se pasa
  a Gemini como *structured output*. Añadir extracción a un módulo = prompt + mapeo al schema
  que ya existe.

### 12.2 Modelo de acceso (proveedor: Gemini Flash — visión + structured output)

| Modo | Qué es | Etapa |
|---|---|---|
| **Clave compartida** (free tier Google) | Demo/trial con throttling en cliente. Asumido: una clave en bundle estático es pública, la cuota es común y es terreno gris de ToS → solo válido mientras los usuarios son conocidos. | Validación |
| **BYOK** | El usuario pone su clave de Google AI Studio (flujo guiado "consigue tu clave gratis"). Clave solo en localStorage. | El modo real de esta etapa |
| **Proxy propio + créditos** | Primer backend del producto y monetización natural (el cálculo sigue 100 % local y gratis; la IA es la capa opcional de pago). No se construye ahora; se decide ya que esa es la salida. | Futuro (post-validación) |

Los tres conviven tras la misma interfaz de proveedor. **Privacidad**: en free tier Google
puede usar los datos enviados para entrenar; el usuario sube documentos de sus clientes →
avisar en la UI sin letra pequeña (argumento pro-BYOK de pago / proxy). Offline: las funciones
de IA se degradan con elegancia; el cálculo nunca depende de ellas.

### 12.3 Superficies de UX (en este orden de importancia)

**a) Acciones mágicas inline** — botones donde está el tedio, con documento como input:

| Acción | Input | Rellena |
|---|---|---|
| "Importar cuadro de superficies" ⭐ | captura/PDF del cuadro | Estancias + superficies → HS3, vivienda tipo, SI3 ocupación |
| "Importar cerramiento" | sección constructiva o párrafo de memoria de calidades | Capas HE1 |
| "Importar aparatos" | tabla o descripción | Presets HS4/HS5 |
| "Leer memoria descriptiva" | texto de la intervención | Respuestas propuestas del asistente de alcance (reforma) |
| "Redactar nota" | contexto de la justificación | Textos de `No aplica` / `Aplica con flexibilidad` |

**b) Panel acompañante** (drawer lateral, no burbuja flotante genérica): chat con contexto del
proyecto y de la justificación abierta (inputs + resultados del motor). Dudas de la app y de
normativa **citando DB/artículo** (grounding con las tablas CTE versionadas de la propia app);
"¿por qué no cumple?" → explica el check fallido del motor y qué tocar; acciones por lenguaje
natural ("añade un aseo a la T2") que desembocan en el mismo flujo propuesta-revisión.

### 12.4 Encaje en el roadmap

Pista transversal que arranca tras la Fase B (la extracción necesita schemas estables):

- El **panel de dudas** puede llegar antes (barato, no depende de schemas).
- Las acciones de importación llegan módulo a módulo.
- **"Importar cuadro de superficies" debe estar lista para el hito de demo de la Fase C** —
  es el momento *wow* de la validación con conocidos.

---

## 13. Decisiones

### Cerradas (sesión 2026-08-22)

1. Proyecto-céntrico (no calculadoras sueltas ni híbrido).
2. ~~Tabla densa + outliner como input principal de colecciones.~~ **Sustituida (v4):** la
   entrada principal es El edificio + 3-4 decisiones por módulo; el editor de tramos queda como
   modo avanzado «Ajustar a mano» en HS4/HS5. Ver REDISENO-V4 §2 y §7.
3. ~~Esquema como soporte compacto sincronizado (no hero, no canvas editable).~~ **Sustituida
   (v4):** el dibujo es lo principal, con las cifras encima y la franja de detalle debajo; en El
   edificio la sección *es* el editor.
4. Público inmediato: validación con arquitectos de confianza.
5. Nomenclatura: **"justificaciones"**.
6. Presets de aparatos en HS4/HS5: sí.
7. ~~Usos: vivienda unifamiliar + colectiva~~; hospitalario/pública concurrencia fuera.
   **Ampliada (v4):** entran también local sin uso en PB (como previsión), oficinas, garaje,
   trasteros e instalaciones. El modelo admite oficinas desde la fase 2; los módulos las
   justifican desde la fase 5.
8. Reformas dentro de la visión (ejes uso × intervención).
9. REBT entra; ICT aparcado.
10. Asistente de IA como capa transversal: **la IA propone, el motor calcula**; extracciones
    siempre como propuesta revisable con origen declarado en la ficha.
11. Acceso IA: clave compartida (demo, validación) + BYOK Gemini (modo real); proxy propio +
    créditos como salida futura de monetización — decidido el destino, no se construye ahora.
12. **Sustituida (v4):** tokens de Concreta (acento #0369a1, oscuro «Ónice», radio 4 px, sin
    sombras); las maquetas v4 (https://claude.ai/artifact/HS4vCeqgyM7Xozjzj9dnQg) son la
    referencia. Lo que sigue queda como histórico.
    ~~Lenguaje visual (§9) validado sobre maquetas (2026-08-22): dashboard, justificación
    HS5, checker SI4 y lámina de lenguaje —
    https://claude.ai/code/artifact/877b8b8c-6d1d-437d-a77e-228de6183c4e
    Extiende los tokens light existentes de `src/index.css` (Geist/Geist Mono, slate,
    acento #0284c7, estados #15803d/#b45309/#dc2626).~~

### Abiertas

- Diseño exacto del asistente de alcance (lista de preguntas por DB) → requiere transcribir
  los ámbitos de aplicación de cada DB (misma disciplina que SPEC §6: verificar contra PDF
  oficial).
- ~~Detalle de interacción del outliner~~ → pierde prioridad: el outliner pasa a modo avanzado (v4).
- ¿"Modo rápido" sin proyecto para SEO/landing de calculadoras? Descartado del producto; puede
  reconsiderarse solo como táctica de captación web (fuera de este doc).

---

## 14. Trazabilidad

- Estado previo: `SPEC.md` (innegociables §4 vigentes; UX §12 del I+D superada por este doc) ·
  `IDEA-INSTALACIONES.md` · `IDR-INSTALACIONES.md`.
- Este documento es la base para los próximos `feature-N.md` del shell (Fase A) y del módulo
  patrón (Fase B).
- Fase A especificada en `feature-6.md` (shell del expediente).
