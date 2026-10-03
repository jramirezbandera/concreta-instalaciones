# feature-11 — Rediseño v4 · Fase 1: el chasis

> Fase 1 de [REDISENO-V4.md](REDISENO-V4.md) §4. Escrito al cerrar la fase (2026-10-03),
> con lo que se hizo y lo que cambió respecto al plan.

## Objetivo

Que la app entera tenga el aspecto de Concreta y la anatomía v4 de las maquetas, **sin
tocar ningún motor**. Los cinco módulos se montan en la cáscara común con lo que ya
tienen: sus entradas, su dibujo y su tabla.

## Alcance

### A. Tokens de Concreta (`src/index.css`)

- **Claro:**
  - acento `#0369a1` / hover `#075985`;
  - `text-disabled` `#586880` y `state-neutral` `#57667c`, que pasan AA en todas las
    superficies;
  - `--color-dot-grid` y `--color-tint-accent-soft`.
- **Oscuro Ónice:** `#0c0c0e` / `#161619` / `#202024`, bordes `#2c2c34` / `#202027`, acento
  `#38bdf8`. Los `chart-*` neutros pasan a gris. `theme-color` es `#0c0c0e`.
- **Papel de puntos** del lienzo: `.canvas-dot-grid`, a 22 px.
- **Radios y sombras:**
  - `rounded-md` → `rounded` (4 px) y `rounded-lg` → `rounded-md`;
  - las píldoras `rounded-full` pasan a `rounded` (los puntos de estado se quedan);
  - fuera las sombras (el modal de la ficha se separa con un borde).

### B. Barra lateral y barra superior

- **`Sidebar` v4:**
  - lista **todas** las justificaciones del registry por DB, con su código y un glifo de
    estado: ✓ cumple · ! por revisar · ✕ no cumple · … en curso · — no aplica ·
    «pronto» · ↗ externa;
  - las no publicadas salen atenuadas y sin enlace;
  - arriba, el proyecto (lleva a la lista de proyectos) y el grupo «Proyecto»: La obra y
    El edificio (hoy, el formulario de datos generales);
  - el glifo lleva `aria-label` con el estado en texto.
- **`Topbar`:**
  - es una ruta de navegación «GRUPO / CÓDIGO · Título», a 48 px;
  - en móvil, «Ficha PDF» queda solo con el icono, sin perder el `aria-label`.

### C. Cáscara común (`src/components/justificacion/`)

| Pieza | Qué hace |
|---|---|
| `ModuleLayout` | Sustituye a `ModuleShell` + `BarraContexto` + `BandaVeredicto` (borrados). Cabecera: código, título, píldora de veredicto, «N cosas por revisar», la frase del resumen con su cita y las pestañas **Esquema · Comprobaciones · Memoria**. Avisos del motor a lo ancho («Por revisar», plegados a partir del tercero) y errores en barra roja. Persiste el veredicto en el proyecto, como antes. |
| `DelProyecto` | Lo heredado del expediente arriba de la columna izquierda, con el valor efectivo y un lápiz si es una excepción local. Abre `ExcepcionesLocales`. Lleva un enlace «Cambiar en El edificio». |
| `LienzoAjustado` + `lib/ui/ajustar` | Mide la caja del lienzo (ancho **y** alto) y encaja el SVG entero, con su proporción y un ancho máximo. Sustituye al ancho fijo de 348 a 560 px del panel plegable. |
| `FranjaDetalle` | La banda baja bajo el dibujo, con lo seleccionado. Hoy recibe el resumen en texto de cada módulo; tiene huecos `manda` y `cuentas` para cuando los motores devuelvan §3.2. |
| `ListaElementos` | Lista compacta y seleccionable (punto + nombre + cifra + estado en texto) para la columna izquierda. La usan los cerramientos de HE1 y las estancias de HS3. |
| `FilaResumen` | Sustituye a las cinco copias de `SummaryRow`. El valor y su nota van apilados a la derecha para caber en la columna estrecha. |
| `VistaMemoria` | La pestaña Memoria: la ficha PDF dentro de la página, con «Descargar PDF». |

`MobileTabBar` desaparece. En móvil las zonas se apilan con el dibujo arriba y lo que se
introduce debajo.

### D. Los cinco módulos en la cáscara

| Módulo | Izquierda (Esquema) | Dibujo | Comprobaciones |
|---|---|---|---|
| HS5 | Del proyecto · ventilación de red | Esquema de columna | Outliner de tramos y aparatos + presets |
| HS4 | Del proyecto · suministro · resumen · alcance | Esquema de columna | Outliner de tramos y puntos de consumo + presets |
| HS3 | Del proyecto · vivienda y conducto · **lista de estancias** · balance · conducto | Esquema | Outliner de estancias, outliner de la red colectiva y resultados de la red |
| HE1 | Del proyecto · ambiente · **lista de cerramientos** · resumen · alcance | Esquema del cerramiento (el elegido o el peor) | Outliner de cerramientos, capas y puentes + condensaciones |
| HS6 | Del proyecto · emplazamiento · soluciones | Sección en contacto con el terreno; la franja dice «Lo que falta» | Tabla de verificación por medida + resumen + alcance |

La selección es una sola: la comparten el dibujo, la lista de la izquierda, la tabla y la
franja, y sobrevive al cambio de pestaña. `_smoke` también usa la cáscara y sigue
funcionando sin proyecto.

## Decisiones (lo que cambió respecto al plan)

- **La tabla de tramos va a Comprobaciones, a todo el ancho.** El plan decía «los inputs
  actuales a la izquierda». Pero en HS3, HS4, HS5 y HE1 los inputs son el outliner (de seis
  a once columnas): en una columna de 300 px volvía a encajonar el dibujo, que es justo lo
  que se rechazó. Como cada fila ya lleva su resultado, el outliner es la lista de
  comprobaciones. En la fase 4 pasa a ser «Ajustar a mano» y Comprobaciones se queda en una
  lista de solo lectura.
- **Comprobaciones no lleva columna izquierda.** La tabla de HS4 no cabía ni a 1440 px con
  ella. Las entradas sueltas se quedan en Esquema.
- **Memoria es la ficha PDF**, no el texto redactado. El texto necesita la explicación
  estructurada de §3.2, que llega con las fases 4 y 5.
- **`QueEntra`, `Decision` y `DibujoConEtiquetas` no se construyen todavía.** No tienen
  datos que mostrar hasta El edificio (fase 2) y el contrato §3.2 (fase 4). Hacerlos ahora
  sería código muerto. Su sitio en la cáscara ya existe: «Del proyecto» se convertirá en
  «Qué entra», `entradas` recibirá las decisiones y el lienzo, las etiquetas.
- **Prettier solo en los archivos nuevos.** El repo no está formateado de forma uniforme y
  reformatear los existentes metería ruido en el diff.

## Definición de hecho

- [x] Typecheck, lint y build de producción limpios.
- [x] 527 tests en verde. Ningún test de motor ni snapshot de ficha cambia.
- [x] Los tests de interfaz de HS3, HS5 y HE1 se adaptan a las pestañas y cubren lo nuevo:
      la lista de estancias o cerramientos de la izquierda, «Del proyecto» con su popover de
      excepciones, y la franja bajo la lista y bajo el esquema.
- [x] Tests propios de `ModuleLayout` (pestañas, avisos plegables, errores, columna solo
      en Esquema) y de `ajustar`.
- [x] Capturas revisadas: los cinco módulos en claro, HE1 y HS4 en Ónice, HS5 y HE1 en móvil
      (390 px), La obra y El edificio con la barra nueva.

## Pendiente, visto en las capturas

- **SVG de HE1 y HS6:** el texto queda pequeño al encajar el dibujo, porque sus tamaños de
  letra están pensados para el panel de 380 px. Se rehacen en la fase 5 con etiquetas HTML.
- **SVG de HS4:** las etiquetas del ramal crítico se pisan («deriv-particular» con
  «crítico»). Ya pasaba antes; ahora se ve más porque el dibujo es grande. Fase 5.
- **HS4:** el aviso de K (UNE 149201, criterio externo) sale como «Por revisar», pero no es
  un supuesto que revisar sino una nota de alcance. Se reclasifica con los `Aviso` tipados
  de §3.2.
- **La obra y El edificio** conservan su maquetación: se rehacen en las fases 6 y 2.
