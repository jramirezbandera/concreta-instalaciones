# feature-10 — Alturas reales por planta

> Hallazgo de la validación manual (2026-08-23, QA 1.4): la altura de evacuación se
> estima a 3 m/planta y "eso no se ajusta a la realidad". Referencia del usuario: el
> diálogo Plantas/Grupos de CYPE (tabla de plantas con altura + croquis de sección con
> cotas). No se clona CYPE: se hace la versión Concreta — densa, con procedencia, y
> con el esquema SVG en vivo que ya es el lenguaje de la casa.

## El problema

`derivarContexto` estima `alturaEvacuacion_m = (plantasSobreRasante − 1) × 3`. La
procedencia lo declara honestamente ("estimación 3 m/planta, revisable"), pero no hay
DÓNDE revisarlo: el dato es derivado y el proyectista no puede corregirlo. Una PB de
4,20 m + tipo de 3,00 (el caso normal con local en planta baja) da 7,20 m reales frente
a 6,00 estimados — y la altura de evacuación discrimina exigencias de SI/SUA por
umbrales (p. ej. resistencia estructural al fuego, número de escaleras), así que el
error de estimación puede caer justo en un umbral.

Además la geometría vertical es dato de entrada FUTURO de más módulos: cota de cubierta
para la presión en el punto más desfavorable (HS4) y la altura de bajantes (HS5), cotas
de sótanos para la evacuación ascendente (SI). Merece vivir en Datos generales, no
repetirse por módulo.

## Alcance

- **`DatosGenerales.alturasPlantas_m?: { sobre: number[]; bajo: number[] }`** — altura
  suelo-a-suelo de cada planta [m]. `sobre[0]` = planta baja hacia arriba; `bajo[0]` =
  sótano 1 hacia abajo. ADITIVO y OPCIONAL: el schema sigue en `"1"`, ausente ⇒ se
  mantiene la estimación de 3 m/planta con su procedencia actual.
- **`derivarContexto`** — con alturas declaradas, la altura de evacuación descendente es
  la COTA DEL SUELO de la última planta: `suma(sobre[0..n−2])` (la altura de la última
  planta no interviene: se evacúa desde su suelo). Procedencia nueva que lo declara.
  Redondeo a 2 decimales (los flotantes de sumar 3,30 no deben llegar a la ficha).
- **`EditorAlturasPlantas`** (components/proyecto) — en la sección Geometría del
  formulario. Sin definir: una fila discreta con botón "Definir alturas reales".
  Definido: tabla densa de plantas en orden de sección (cubierta → sótanos) con altura
  editable y cota de suelo calculada, esquema SVG de la sección al lado (rasante,
  sótanos bajo tierra, línea de la altura de evacuación acotada en acento), y botón
  para volver a la estimación.
- **Reconciliación** — cambiar el nº de plantas con alturas definidas conserva las
  existentes y completa las nuevas a 3,00 m (recorta por el otro extremo). Función pura
  `reconciliarAlturas` en `derivar.ts`; la UI nunca sincroniza con efectos.
- **Validación** — cada altura ∈ [2, 10] m; error inline en español como el resto.

## Decisiones

- **La altura de evacuación sigue siendo DERIVADA, no editable.** Lo que se declara son
  las alturas físicas (hechos del edificio); la cota de evacuación la calcula la
  herramienta y viaja con su procedencia. Editarla a mano sería volver al texto libre.
- **Sin nombres de planta** (CYPE los tiene): etiquetas automáticas "Planta baja",
  "Planta 1"…, "Sótano 1"…. Un nombre libre no alimenta ningún cálculo y añade estado.
- **`bajo` se declara y se dibuja pero aún no deriva nada**: la evacuación ascendente de
  sótanos es de SI (Tier futuro). Se captura ya porque el coste marginal es cero y el
  dato es del edificio, no del módulo.

## Futuro (fuera de alcance, apuntado por el usuario)

Asistente de IA al que se le pasa una sección dibujada del proyecto y propone estos
datos (plantas, alturas, cotas) para su confirmación. Esta feature define el MODELO que
ese asistente rellenaría — el editor manual es también su interfaz de revisión.

**Escaleras (SUA 1)** — la altura de planta es la ÚNICA entrada que restringe la
contrahuella, así que con este dato la comprobación se vuelve derivable: el nº de
peldaños n es entero, luego C = H/n toma valores discretos y la pregunta es si alguno
cae en la horquilla admisible (con 3,00 m: 16 peldaños se pasan, 17 y 18 valen; hay
alturas para las que NINGUNA n es válida, y hoy eso se descubre dibujando). Del mismo
dato sale la altura máxima salvable por tramo — que decide si hace falta meseta
intermedia, información de planta deducida de la sección — y la horquilla aplicable
depende del uso, que el expediente ya conoce: la escalera interior de unifamiliar es de
uso restringido y la de la comunidad de uso general. Nada de esto se implementa aquí; se
apunta porque es la primera justificación que este modelo desbloquea sin pedir un dato
más. Los valores concretos exigen la transcripción verificada contra el PDF oficial,
como el resto de tablas del repo.

## Definición de Hecho

- Definir alturas reales cambia la altura de evacuación del panel de derivados en vivo,
  con procedencia "suma de las alturas declaradas"; quitar las alturas vuelve a la
  estimación con su procedencia.
- Cambiar el nº de plantas con alturas definidas no pierde las ya escritas.
- Un proyecto guardado sin el campo sigue derivando como hasta ahora (aditivo).
- Tests: derivación con alturas (concretos + propiedad de equivalencia con la
  estimación cuando todas son 3), reconciliación, y el editor (definir, editar, quitar).
