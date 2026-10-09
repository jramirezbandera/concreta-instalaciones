# feature-27 — Fase E · Reformas: asistente de alcance y motor de aplicabilidad

> Última fase del roadmap de [UX-RECONCEPT.md](UX-RECONCEPT.md) §11: «Reformas: asistente de
> alcance + motor de aplicabilidad + textos de no-aplica/flexibilidad. Hito: expediente de
> reforma». Escrito el 2026-10-09, tras cerrar los cerramientos comunes
> ([feature-26.md](feature-26.md)).
>
> Verificación normativa: [research/verificacion-reformas.md](research/verificacion-reformas.md)
> (CTE Parte I leída en imagen, ahora en `research/pdf/CTE_ParteI.pdf`; criterios de edificios
> existentes de DB-HE, DB-SI y DB-SUA; ámbitos de cada sección; REBT art. 2; Guía DB-HR cap. 2.0).
> Criterios K-REF.1 a K-REF.13.

## Lo que hay hoy

- `DatosGenerales.intervencion` es un valor único: obra nueva, reforma, ampliación o cambio de uso.
- `aplicabilidadBase` ([aplicabilidad.ts](src/lib/proyecto/aplicabilidad.ts)) solo sabe de obra
  nueva. En un edificio existente pone `aplica` a todo con la nota «alcance pendiente», salvo el
  DB-HR, que pone `no_aplica` en cualquier intervención (demasiado amplio: la exclusión II d) no
  nombra el cambio de uso, K-REF.4).
- `aplicabilidadForzada` existe en el modelo, pero ninguna pantalla deja forzarla.
- `aplica_reformado` y `aplica_flexibilidad` existen como tipos y el anejo los cuenta como
  exigibles, pero nadie los propone ni hay párrafo que los explique.
- Los módulos calculan siempre el edificio entero.

## Decisiones del usuario (2026-10-09)

1. **Qué se interviene se marca en El edificio**, zona a zona: nueva (ampliación), reformada,
   cambia de uso o existente sin tocar. Los módulos calculan solo lo intervenido y la ficha cuadra
   con lo que se calcula.
2. **El asistente de alcance va en Los datos de la obra**, bajo «Tipo de intervención». Aparece al
   elegir algo distinto de obra nueva.
3. **HR en cambios de uso** (K-REF.4): el característico, `aplica`; el parcial a vivienda o a
   recinto de actividad, `aplica_reformado`; la ampliación, `no_aplica` con la recomendación de la
   Guía DB-HR en el párrafo.
4. **HS 4/HS 5 con la instalación nueva completa** sin más aparatos: `aplica_reformado` (K-REF.7).
   Una modificación parcial sin más aparatos, `no_aplica`.
5. **HS 2 en cambio de uso característico a viviendas**: `aplica` por analogía, con estudio
   específico (K-REF.5).
6. **Integral**: una sola pregunta para HR, HE 4 y HE 5, con la definición de la Guía DB-HR
   rotulada como no reglamentaria (K-REF.3).
7. Por defecto, sin preguntar: HE 1 en cambio de uso sin la restricción de reformas (K-REF.8); la
   cita del cambio de uso sin número de apartado (K-REF.2).

## Lo que dice la norma (resumen de la verificación)

- **Parte I art. 2.3**: el CTE se aplica a las intervenciones; flexibilidad «bajo el criterio y
  responsabilidad del proyectista» cuando no sea urbanística, técnica o económicamente viable, o
  sea incompatible con la naturaleza de la intervención o con el grado de protección; no
  empeoramiento. **Art. 2.4**: el proyecto dice si se actúa en la estructura. **Cambio de uso**:
  el característico cumple todo el CTE; el parcial, en los términos de cada DB.
- **Mantenimiento** (y reparaciones puntuales) no es reforma: fuera del CTE.
- **DB-HE, DB-SI y DB-SUA** traen criterios propios para existentes (no empeoramiento,
  flexibilidad, «elementos modificados por la reforma», cambio de uso parcial, ampliación).
  **DB-HS y DB-HR no**: rige la Parte I.
- Cada sección tiene su umbral: HE 1 (Ulim solo en lo sustituido; K y control solar si se renueva
  más del 25 % de la envolvente final), HE 0 (generación **y** más del 25 %), HE 4 (reforma
  íntegra o cambio de uso característico con más de 100 l/d; o más de 5.000 l/d que crecen más
  del 50 %), HE 5 (más de 1.000 m²), HE 6 (cinco supuestos), HS 4/HS 5 (solo si aumentan los
  aparatos), HS 6 (parte nueva, zona afectada o todo), HR (solo rehabilitación integral), REBT (la
  parte modificada).

La tabla completa por justificación, con los párrafos de memoria redactados, está en el bloque D
de la verificación.

## Objetivo

- Un **asistente de alcance** de unas diez preguntas cerradas (bloque E de la verificación), que
  solo pregunta lo que El edificio no sabe.
- Un **motor de aplicabilidad de intervenciones**, puro, que propone para cada justificación
  `aplica`, `aplica_reformado` o `no_aplica` con su párrafo y su cita, y combina varios tipos de
  obra (gana el más exigente).
- **El proyectista dispone**: puede cambiar la propuesta de cualquier justificación, con nota, y
  elegir `aplica_flexibilidad` rellenando motivo, soluciones, nivel alcanzado y condicionantes.
- **Zonas marcadas en El edificio** y módulos que calculan solo lo intervenido.
- Fichas, memoria y anejo con el acotamiento («se aplica a…»), el no empeoramiento y la
  flexibilidad.

## Principios

- **Obra nueva no cambia.** Sin `alcance` ni marcas de zona, todo da lo mismo que hoy. El paso de
  cierre lo comprueba sobre todas las combinaciones, como en feature-26.
- **Sin migración.** `alcance` y la marca de zona son opcionales. Un proyecto de reforma antiguo
  sin alcance sigue con la nota «alcance pendiente» hasta que se responda el asistente.
- **La herramienta propone con cita; el proyectista dispone** (UX-RECONCEPT §5). Lo que la norma
  no define (sustancial, integral, mayor adecuación, mejora efectiva) queda como propuesta
  editable, rotulada.
- **Ninguna cita sin verificar.** Antes de publicar los párrafos, se cotejan en imagen las
  páginas que la verificación leyó solo en texto (F.13).
- **Por pasos, con los tests en verde en cada uno**, y commit a main al cerrar cada paso.

## Pasos

### Paso 0 · Cotejo en imagen

Leer en imagen DB-HE pp. 5, 9 y 15–18, DB-SI pp. 5–6, DB-SUA pp. 4–5, DB-HS pp. 81, 111 y 138, y
REBT p. 9. Anotar el resultado en la verificación. Sin código.

### Paso 1 · Modelo del alcance

- `DatosGenerales.alcance?: Alcance` (opcional). Tipos de obra como **conjunto** (reforma,
  ampliación, cambio de uso, solo mantenimiento; K-REF.1); `intervencion` se conserva como el
  tipo principal para rótulos y proyectos antiguos.
- Las respuestas P2 a P12 del bloque E, todas opcionales.
- `Zona.obra?: "nueva" | "reformada" | "cambia_uso" | "existente"` y `Zona.usoAnterior?` para el
  cambio de uso. Sin la marca, la zona cuenta como intervenida (lo de hoy).
- `lib/proyecto/alcance.ts`: deducciones puras de El edificio (superficie útil y construida
  ampliada, porcentaje de ampliación, zonas que cambian de uso y a qué, si alguna pasa a vivienda,
  si se reforman viviendas, trasteros o garaje). Tests.

### Paso 2 · Motor de aplicabilidad de intervenciones

- Reglas del bloque D por justificación y tipo de obra, con los párrafos de memoria y las citas.
- Orden: externas con reglas propias (K-REF.10: `dbse` según la estructura, `he0he1_global`
  según HE 0 y K) → reglas de atributos de hoy (SUA 5, SUA 6, SUA 7, HS 3, HE 6…) → reglas de
  intervención → `aplica`.
- Combinación de tipos: gana `aplica` > `aplica_reformado` > `no_aplica`.
- Párrafo de no empeoramiento en todo `aplica_reformado` (K-REF.12) y aviso de protegido
  (K-REF.13).
- Corrige HR (K-REF.4).
- Tests: tabla de casos por justificación; obra nueva idéntica a hoy.

### Paso 3 · El asistente de alcance

En Los datos de la obra, bajo «Tipo de intervención»: las preguntas que El edificio no responde,
con sus subpreguntas solo cuando tocan, y al lado la propuesta que sale (cuántas aplican, a lo
reformado, no aplican). Mismo lenguaje que las decisiones de los módulos.

### Paso 4 · El proyectista dispone

En La obra, en «Lo que se justifica»: cada fila deja cambiar la aplicabilidad propuesta, con nota,
y volver a la propuesta. `aplica_flexibilidad` abre un formulario corto (motivo de la Parte I
art. 2.3 o del DB-HE, soluciones, nivel alcanzado, condicionantes de uso y mantenimiento) que
redacta el párrafo D.0.3.

### Paso 5 · Las zonas en El edificio

En el editor de zonas, cuando la obra no es nueva: la marca de cada zona (nueva, reformada, cambia
de uso desde…, existente sin tocar) y su reflejo en la sección (lo existente sin tocar, atenuado).

### Paso 6 · Los módulos calculan lo intervenido

Un `edificioIntervenido()` que deja fuera las zonas «existente», y en cada módulo la decisión de
qué lee:

- solo lo intervenido: HS 1, HS 3, HS 4, HS 5, HS 6, HE 1, HR, SUA 1–4 y 9, SI 1, SI 2, SI 6;
- lo intervenido más lo que la norma arrastra: SI 3 (los medios de evacuación que sirven a la
  zona, criterio 8), SI 4 (la dotación del edificio ampliado), SUA 9 (el itinerario accesible
  hasta la vía pública);
- el edificio entero: SUA 8, HE 5 y HE 6 (sobre lo ampliado donde la norma lo dice), REBT con la
  previsión del conjunto.

Cada ficha declara a qué zonas se aplica.

### Paso 7 · Fichas, memoria y anejo

Los párrafos de `aplica_reformado`, flexibilidad y no empeoramiento en la memoria de cada módulo,
en el anejo y en la ficha. Un proyecto de demostración de reforma.

### Paso 8 · Cierre

Todas las combinaciones de obra nueva con el mismo veredicto que antes (contra el commit de
partida, worktree como en feature-26). Casos de reforma, ampliación y cambio de uso de punta a
punta. Capturas con el navegador de gstack.

## Decisiones a validar

Se rellenan al cerrar cada paso.

### Paso 1 (hecho)

- `DatosGenerales.alcance` con las respuestas P1–P12; `Zona.obra` y `Zona.usoAnterior`
  ([tipos.ts](src/lib/proyecto/tipos.ts), [edificio/tipos.ts](src/lib/edificio/tipos.ts)).
- [alcance.ts](src/lib/proyecto/alcance.ts): `tiposDeObra`, `obraDeZona`, `soloZonas` y
  `alcanceDeEdificio` (ampliada y existente, cambios de uso, paso a vivienda o a recinto de
  actividad, locales de HS 3, demanda de ACS antes y después).
- No se deduce de El edificio el «más del 10 %» de la ampliación: la norma lo mide sobre las
  unidades de uso en las que se interviene, no sobre el edificio (un ático que crece 60 m² en un
  bloque de 3.000 m² está por encima). Se pregunta.
- «Recinto de actividad» para HR: la zona pasa a local, oficinas o garaje en un edificio con
  viviendas, como en feature-25.
- En obra nueva la marca de zona no cuenta. Sin marca, en un edificio existente, la zona cuenta
  como reformada: la propuesta más prudente.
