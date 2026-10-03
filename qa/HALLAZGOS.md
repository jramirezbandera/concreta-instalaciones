# Hallazgos — validación manual fases A/B/C

> Cuaderno de la sesión de QA. Guion de pruebas:
> https://claude.ai/code/artifact/2c538ac9-aca6-465e-a7a1-7a29698a3269
>
> Apunta aquí lo que veas y dime "lee qa/HALLAZGOS.md" cuando quieras que actúe.
> No hace falta que rellenes todos los campos: con el número de prueba y una
> frase me suele bastar. Las capturas van en `qa/capturas/` (ignoradas por git).

## Cómo apuntar

- **Número de prueba**: el del guion (`2.3`, `5.4`…). Si no cuadra con ninguna, pon `libre`.
- **Captura**: nombra el archivo con el número (`2.3-tab-no-anida.png`) y cítalo aquí.
- **Tipo**: `bug` (no hace lo que dice el guion) · `criterio` (funciona, pero no me gusta) ·
  `duda` (no sé si es correcto).

---

## Pendientes

<!-- Copia este bloque por cada cosa que veas. Borra los campos que no uses. -->

### [ ] 0.0 — título corto
- **Tipo:** bug | criterio | duda
- **Esperaba:** …
- **He visto:** …
- **Captura:** `qa/capturas/…png`
- **Notas:** …

---

---

## Resueltos

### [x] 1.6 — el menú ⋯ de la checklist no se cerraba al pulsar fuera
- **Tipo:** bug.
- **He visto:** abierto el menú de aplicabilidad de una fila, pinchar fuera no lo cerraba.
- **Reproducido y era peor:** tampoco cerraba con **Escape** ni con el **segundo clic en
  el propio ⋯**. De los cuatro comportamientos esperados solo funcionaba "abrir otra fila
  cierra la anterior".
- **Causa raíz:** las piezas de fila (`MenuFila`, `FilaNormal`, `CuerpoFila`…) estaban
  definidas DENTRO del cuerpo de `ChecklistJustificaciones`. Un componente definido así es
  un **tipo nuevo en cada render**, así que React desmonta y remonta su subárbol en cada
  cambio de estado — y el foco se perdía justo al abrir el menú. Con el foco en `body`
  morían sus tres cierres: el `onBlur` del contenedor no volvía a dispararse, el
  `onKeyDown` de Escape (que colgaba del contenedor) ya no recibía la tecla, y en el
  segundo clic el blur ponía `null` ANTES de que el `onClick` volviera a abrirlo.
- **Arreglado:** todas las piezas de fila subidas a nivel de módulo, y el cierre por clic
  fuera ya no se confía al foco: listener de `pointerdown` en el documento que cierra
  salvo que el clic caiga dentro de `[data-menu-fila]` (mismo patrón que
  `SelectorMunicipio`). Escape pasa a escucharse en `window`. + 4 tests de integración.
- **Comprobado que no se repite:** barrido del repo en busca del mismo patrón de
  componente anidado — no hay más casos en código de aplicación.

### [x] 1.5 — borrar una altura de planta cerraba la edición y perdía lo escrito
- **Tipo:** bug.
- **He visto:** al dar a Backspace a la izquierda del primer dígito de una altura, la app
  se fue a la pantalla principal cerrando "Datos generales".
- **Investigado:** reproducido sobre el router real. **Nuestro código NO navega** — el
  hash se queda en `#/p/demo/datos` tras varios Backspace. La navegación es del NAVEGADOR
  (Backspace = "atrás" cuando el foco no está en un campo editable; sigue activo en varios
  navegadores y en contenedores webview/PWA). Con HashRouter, "atrás" desde
  `#/p/<id>/datos` es justo el dashboard, y como los datos generales no se persisten hasta
  pulsar Guardar, se pierde lo escrito.
- **Pero el repro destapó el bug de verdad:** el campo no se borraba. `Number("") === 0`
  hacía que al vaciarlo se repintara como **"0"**, así que parecía que Backspace no hacía
  nada y se seguía pulsando — probablemente hasta sacar el foco del campo y disparar el
  "atrás" del navegador.
- **Arreglado:**
  - `NumberInput` gana `permitirVacio` (opt-in): vaciar emite `NaN` y el campo se queda
    **en blanco**. Lo usa el editor de alturas. La validación lo caza con un mensaje
    propio ("Faltan alturas de planta por rellenar") y bloquea el guardado; `NaN` nunca
    llega a persistirse.
  - `FormDatosGeneralesPage` neutraliza Backspace cuando el foco NO está en
    input/textarea/select/contenteditable, mientras el formulario está montado. Dentro de
    un campo, Backspace sigue borrando.
  - 5 tests nuevos, incluidos dos de integración sobre el router real.

### [x] 1.4 — la altura de evacuación se estimaba a 3 m/planta sin poder corregirla
- **Tipo:** criterio (con consecuencia normativa). Referencia del usuario: el diálogo
  Plantas/Grupos de CYPE.
- **He visto:** el derivado "3 m/planta (revisable)" no tenía DÓNDE revisarse. Una PB de
  4,20 + tipo de 3,00 da 7,20 m reales frente a 6,00 estimados, y la altura de evacuación
  discrimina exigencias de SI/SUA por umbrales.
- **Arreglado** (`feature-10.md`): `alturasPlantas_m` en DatosGenerales (aditivo, schema
  "1"); editor en Geometría con tabla de plantas (cubierta → sótanos, altura editable,
  cota de suelo calculada) y sección esquemática SVG con la rasante y la altura de
  evacuación acotada en acento. `derivarContexto` suma las alturas declaradas (cota del
  suelo de la última planta) con procedencia nueva; sin definirlas, todo sigue igual.
  Cambiar el nº de plantas no pierde alturas (reconciliación pura, sin efectos).
- **Nota:** la altura de evacuación sigue siendo DERIVADA — se declaran los hechos
  (alturas físicas), no el resultado. Los sótanos se capturan y dibujan pero aún no
  derivan nada (evacuación ascendente = SI, Tier futuro). El asistente de IA que lea una
  sección dibujada y proponga estos datos queda apuntado en `feature-10.md` como futuro:
  esta feature define el modelo que rellenaría y su interfaz de revisión.

### [x] 1.3 — las casillas de programa no decían qué marcar (y SUA6 estaba mal)
- **Tipo:** duda del usuario → destapó un **bug** real.
- **He visto:** "no tengo claro si marcar Garaje / Trasteros en una unifamiliar aislada con
  garaje privado". La ayuda de Garaje prometía *"arrastra HS3-garajes, SI-aparcamiento y
  SUA7"* (solo SUA7 existe), y Trasteros y Local en PB no tenían ayuda ninguna.
- **Bug destapado:** el motor tenía la excepción de ámbito de **SUA7** para unifamiliares
  (garaje de unifamiliar ⇒ `no_aplica`) pero **le faltaba la simétrica de SUA6**: marcar
  "Piscina" en una unifamiliar daba SUA6 `aplica`, exigiendo justificar una sección cuyo
  ámbito se limita a las piscinas de uso colectivo y deja fuera las de unifamiliar.
- **Arreglado:**
  - `aplicabilidad.ts` — regla nueva de SUA6 para unifamiliar, calcada de la de SUA7, con
    su párrafo redactado y su cita de ámbito. + 2 tests (uno comprueba que los dos
    "no aplica" de SUA6 **no comparten motivo**: el párrafo va literal al anejo, y decir
    "no dispone de piscina" en un chalet que sí la tiene sería falso en un documento firmado).
  - `FormDatosGeneralesPage.tsx` — ⓘ en las cuatro casillas de Programa, cada una con el
    criterio de qué cuenta, qué desencadena y qué está **pendiente**; referencia normativa
    en la 2ª línea del tooltip (`CheckRow` gana `refText`, que `Field` ya tenía).
- **Criterio que ahora dice la UI:** las casillas describen **el edificio**, no la
  aplicabilidad — quién aplica lo decide el motor. Garaje y piscina se marcan aunque sean
  privados de una unifamiliar. Trastero solo si es **local independiente** (sótano, anexo,
  zona común): un cuarto dentro de la vivienda ya lo cubre su ventilación general.

### [x] 1.2 — el municipio era texto libre y no podía cruzarse con tablas
- **Tipo:** criterio (con consecuencia técnica real)
- **He visto:** el municipio se tecleaba a mano, así que con acentos, mayúsculas o
  variantes ("Vitoria" / "Vitoria-Gasteiz") no casaría con las tablas que clasifican POR
  municipio (aceleración sísmica, y sobre todo la zona de radón del DB-HS6, que hoy se
  pide a mano precisamente por esto).
- **Arreglado** (`feature-9.md`): listado OFICIAL del INE (8.132 municipios a 01-01-2026,
  descargado del XLSX del INE) en `src/data/municipios.ts`, cargado en su propio chunk
  (74 kB gzip, fuera del bundle inicial). La provincia va primero y filtra; el municipio
  se elige con autocompletado y queda guardado con su `municipioIne`. Un municipio no
  reconocido se admite igualmente, avisando de lo que se pierde.
- **Ojo — cambio sobre lo acordado:** el alcance incluía autocompletar la ALTITUD y se
  descartó tras evaluarla con datos. La única fuente masiva disponible (Wikidata) mezcla
  criterios: da 2.123 m para Aller (cota del pico del concejo, cuyo núcleo está a ~500 m)
  y 0 m para Ferrol o Siero; y sobre las capitales se desviaba hasta 78 m (Toledo 523 vs
  445 m), suficiente para cruzar un tramo del Anejo B y cambiar la zona climática. En su
  lugar: se sugiere la altitud sólo si el municipio es la CAPITAL (dato ya verificado en
  el repo), y se avisa siempre que la altitud tecleada quede a menos de 30 m de un límite
  de tramo, que es el error de verdad probable y el que tiene consecuencia normativa.

### [x] 0.0 — aviso de `apple-mobile-web-app-capable` en consola
- **Tipo:** bug
- **He visto:** al abrir la app, Chrome avisa: *«`<meta name="apple-mobile-web-app-capable">`
  is deprecated. Please include `<meta name="mobile-web-app-capable" content="yes">`»*.
- **Arreglado:** `index.html` — se añade el meta ESTÁNDAR `mobile-web-app-capable` y se
  CONSERVA el de Apple (iOS Safari sigue necesitándolo para el modo standalone; van juntos
  a propósito, no es duplicado). Verificado en el HTML servido por el dev server.
- **Nota:** el otro mensaje de la consola («Download the React DevTools…») es informativo
  de React en modo desarrollo, no un problema.
