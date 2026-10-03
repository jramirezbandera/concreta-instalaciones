# feature-6 — Fase A · Shell del expediente

> Primera feature del rediseño `UX-RECONCEPT.md` (§2–§4, §9, §11 Fase A). Convierte el producto
> de "5 calculadoras con sidebar" en **gestor de expedientes de justificación CTE**. NO rehace
> ningún motor ni la zona de trabajo interna de los módulos (eso es Fase B/C): construye la capa
> de proyecto, la herencia de contexto y el esqueleto común, y migra los 5 módulos existentes a
> él. Referencia visual validada: maquetas
> `https://claude.ai/code/artifact/877b8b8c-6d1d-437d-a77e-228de6183c4e` (decisión cerrada §13.12).
> Tamaño: una tarea de Modo Planificación.

## Objetivo

Al terminar, el usuario crea un proyecto (uso × intervención × atributos), ve la checklist de
justificaciones con su estado real, entra en cualquiera de los 5 módulos existentes con el
contexto heredado, y todo persiste por proyecto con export/import. Obra nueva es el caso
completo; el modelo de datos ya contempla reformas (estados de aplicabilidad) aunque su motor
llegue en Fase E.

## Alcance

### A. Modelo de datos del expediente (`src/lib/proyecto/`)

- **`Proyecto`**: `{ id, nombre, creado/modificado (ISO, inyectados desde la UI — el motor sigue
  sin Date.now), datosGenerales, justificaciones }`.
- **`DatosGenerales`** (§2.3 del reconcept, ~12 campos): `municipio` + `provincia`,
  `altitud_m`, `uso: "vivienda_unifamiliar" | "vivienda_colectiva"`,
  `intervencion: "obra_nueva" | "reforma" | "ampliacion" | "cambio_uso"`,
  `plantasSobreRasante`, `plantasBajoRasante`, `tipoCubierta`, `numViviendas`,
  `tieneGaraje`, `tieneTrasteros`, `tienePiscina`, `tieneLocalPB`. Usos no soportados: el
  selector no los ofrece (rechazo honesto en UI, §2.1).
- **`derivados`** (calculados, nunca almacenados como verdad): `zonaClimatica` (de
  provincia + altitud), `zonaRadon` (entrada manual con procedencia Apéndice B — coherente con
  la decisión de feature-5 de no embeber el listado de municipios), `alturaEvacuacion_m`
  (de plantas). Función pura `derivarContexto(datosGenerales)` en el motor, testeable.
- **Estado por justificación = dos dimensiones ortogonales** (§3):
  - `aplicabilidad: "aplica" | "aplica_reformado" | "aplica_flexibilidad" | "no_aplica" |
    "externo"` + `nota?` + `cita?`. En Fase A la calcula `aplicabilidadBase(proyecto)`: obra
    nueva → todo `aplica`, salvo reglas de atributos (sin piscina → SUA6 `no_aplica` con párrafo
    y cita de ámbito; sin garaje → análogo). Intervención ≠ obra nueva → las justificaciones
    quedan `aplica` con aviso "asistente de alcance pendiente" (motor completo en Fase E). El
    usuario puede **forzar** cualquier valor (la herramienta propone, el proyectista dispone).
  - `progreso: "sin_iniciar" | "en_curso" | "cumple" | "no_cumple"` — **derivado, nunca
    marcado a mano**: `sin_iniciar` = sin inputs guardados; `en_curso` = inputs guardados pero
    la validación no pasa o el motor no emite veredicto; `cumple`/`no_cumple` = veredicto del
    motor sobre los inputs guardados.
- **Tabla provincia→zona climática** como datos versionados con procedencia (DB-HE1 Tabla a,
  Anejo B del DB-HE): 52 capitales + regla de corrección por altitud. Prerrequisito §6 del
  SPEC: transcribir y verificar contra el PDF de codigotecnico.org antes de codificar la
  derivación.

### B. Persistencia multi-proyecto (`src/lib/proyecto/storage.ts`)

- localStorage con clave por proyecto (`concreta-inst-proyecto-<id>`) + índice
  (`concreta-inst-proyectos`) + versión de schema (patrón `getModuleSchemaVersion` actual,
  elevado a proyecto). Escrituras con debounce ~300 ms como hoy.
- **Los inputs de cada módulo pasan a vivir dentro del proyecto activo**
  (`proyecto.justificaciones[key].inputs`), no en la clave suelta por módulo. `useModuleState`
  se adapta: misma API (`state/setField/reset`) sobre el proyecto activo; prioridad pasa a ser
  URL (import puntual de "Compartir") > proyecto > defaults.
- **Migración**: al primer arranque, si existen claves legacy (`concreta-inst-hs3`…), se crea
  un proyecto "Importado" con esos inputs y se conservan las claves legacy (rollback barato).
- **Export/import de proyecto** como archivo `.json` (schema + versión + fingerprint); el
  "Compartir" por query-string se mantiene por justificación.
- **Proyecto "Demo"** precargado (los defaults actuales de los 5 módulos, colectiva 4 plantas,
  Cáceres) — es la demo de validación con conocidos.

### C. Registry y aplicabilidad (`src/data/justificacionRegistry.ts`)

Evolución del `moduleRegistry` actual (una sola fuente de verdad; el registry viejo se elimina):
`{ key, codigo ("HS5"), label, grupo, db, edicionDB, formato: "calculo" | "checker",
shipped, route, icon }` + entradas **no-shipped** para las justificaciones del mapa de
cobertura (§10: HS1, HS2, SI1–SI6, SUA1/4/8/9, HR, HE4/HE5, REBT → "Próximamente") y entradas
**externas** (HE0/HE1 global → HULC con campo de referencia de documento; DB-SE → Concreta
estructura). La checklist del dashboard se genera de aquí + `aplicabilidadBase`.

### D. Pantallas nuevas (maquetas como referencia)

- **Inicio `/`** — lista de proyectos: nombre · municipio · uso/intervención · progreso
  (n/m justificadas) · última edición; nuevo/duplicar/eliminar/import/export.
- **Dashboard `/p/:id`** — cabecera del proyecto (nombre + chips de atributos y derivados +
  editar), checklist agrupada por DB con chip combinado aplicabilidad×progreso, grupos
  "No aplicables" y "Externas", carril derecho con tarjeta Anejo (recuento por estados +
  pendientes; el botón "Generar anejo" queda **deshabilitado con nota "Fase C"** — la ficha
  suelta por justificación sigue disponible) y tarjeta Datos del proyecto.
- **Formulario de datos generales** (crear/editar): al elegir municipio/provincia+altitud se
  muestran los derivados con su procedencia; validación con límites físicos y mensajes ES.
- **Routing**: `/p/:id/hs/saneamiento`… Las rutas legacy (`/hs/saneamiento`) redirigen al
  proyecto activo (último abierto) para no romper marcadores/PWA instalada.

### E. Esqueleto común de justificación + migración de los 5 módulos

- Componente de layout compartido (§4.3 del reconcept): **barra de contexto** (chips de solo
  lectura con datos heredados + "editar en proyecto"), **banda de veredicto fija** (estado +
  porqué crítico en una línea + cita DB en mono), zona de trabajo (children — la UI actual de
  cada módulo TAL CUAL), acceso a ficha.
- Los 5 módulos (HS3/HS4/HS5/HS6/HE1) se montan dentro del esqueleto. Los campos que ahora
  duplican datos del proyecto (plantas, uso, municipio/zona…) se **eliminan de la UI del
  módulo** y se alimentan del contexto heredado; un override local se declara explícitamente
  y viaja a la ficha como "excepción local". Sus motores, SVG y fichas no se tocan.
- **Light-first** (§9): light pasa a ser el tema por defecto, se elimina el fondo dot-grid
  (`canvas-dot-grid`), se ajustan Topbar/Sidebar al lenguaje de las maquetas (densidad,
  filetes, citas como metadatos). El dark se conserva como opción.
- La ficha PDF incorpora el bloque de proyecto en cabecera (nombre, municipio, uso,
  intervención) — el `renderFicha` ya recibe datos de proyecto; solo se conecta.

## Definición de Hecho

- Flujo completo: crear proyecto → datos generales con derivados → dashboard con checklist
  real → abrir HS5 con contexto heredado → veredicto refleja `progreso` en el dashboard →
  export/import `.json` reproduce el proyecto byte-a-byte (fingerprint estable).
- Migración legacy verificada (estado previo de los 5 módulos aparece en el proyecto
  "Importado"); PWA sigue instalando y funcionando offline; los 180 tests existentes siguen
  en verde (re-bless solo de snapshots de UI afectados por el esqueleto, nunca de motores).
- Tests nuevos: `derivarContexto` (property: la zona climática es función pura de
  provincia+altitud; monotonía de altura de evacuación), `aplicabilidadBase` (obra nueva ⇒
  todo aplica salvo reglas de atributos; piscina=false ⇒ SUA6 no_aplica con cita),
  `progreso` derivado (matriz inputs×veredicto), storage (versionado, migración, import
  rechaza schema incompatible con mensaje ES).
- Accesibilidad AA en lo nuevo: estados con icono+texto (nunca solo color), foco visible,
  navegación por teclado en la checklist.

## Fuera de alcance

- **Fase B**: rediseño de la zona de trabajo (tabla densa/outliner, esquema de columna,
  presets de aparatos) — aquí los módulos conservan su UI interna actual.
- **Fase C**: vivienda tipo · anejo PDF completo (portada/índice/no-aplica).
- **Fase D**: checkers nuevos (HS1, SI, SUA, REBT…) — en Fase A solo existen como entradas
  "Próximamente" del registry.
- **Fase E**: asistente de alcance de reformas y motor de aplicabilidad por DB (aquí solo el
  modelo de estados y las reglas de atributos de obra nueva).
- Asistente de IA (§12 del reconcept) · backend/cuentas · buscador de municipios del
  Apéndice B (zona de radón sigue siendo entrada directa, como decidió feature-5).
