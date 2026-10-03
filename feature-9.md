# feature-9 — El municipio deja de ser texto libre

> Hallazgo de la validación manual de las fases A/B/C (2026-08-23). No es una fase del
> roadmap de `UX-RECONCEPT.md`: es una corrección de **modelo de datos** que desbloquea
> varias justificaciones futuras. Tamaño: pequeña, pero con dataset externo que verificar.

## El problema

`DatosGenerales.municipio` es un `<input type="text">` libre. Hoy no se cruza con nada —la
zona climática se deriva de *provincia + altitud*— y el municipio solo se pinta en la
cabecera, la tarjeta de datos y la portada del anejo. Pero el municipio **es una clave**,
no una etiqueta, y ya hay un caso vivo del fallo: la **zona de radón** (DB-HS6 Apéndice B
clasifica por municipio) se le pide al usuario a mano porque no había listado.

Escrito a mano, "Vitoria", "Vitoria-Gasteiz" y "Gasteiz" son tres municipios distintos.
La clave estable no es el nombre: es el **código INE**.

Lo que queda desbloqueado al guardarlo: zona de radón (HS6, hoy manual), aceleración
sísmica (NCSE-02), pluviometría y viento (HS1, DB-SE-AE), y la **altitud** — que hoy se
teclea y es la que decide la zona climática, así que un dedazo cambia la exigencia
térmica del edificio entero.

## Alcance (decidido con el usuario: municipio + altitud)

- **`src/data/municipios.ts`** — listado oficial por provincia con `{ ine, nombre,
  altitud_m }`, agrupado por las 52 claves EXACTAS de `PROVINCIAS`. Cargado con `import()`
  dinámico: solo lo necesita el formulario, no debe pesar en el arranque. Procedencia y
  método documentados en la cabecera, con la disciplina de `zonasClimaticasHE.ts`.
- **`DatosGenerales.municipioIne?: string`** — aditivo, el schema sigue en `"1"`; los
  expedientes anteriores no lo tienen y quien lo consuma debe tolerar su ausencia.
- **`SelectorMunicipio`** — la provincia va primero y filtra; el municipio se escribe con
  autocompletado sobre el listado (`datalist`) y se resuelve a código INE. Cambiar de
  provincia limpia el municipio (pertenecía a la anterior).
- **Altitud propuesta** al elegir municipio, con nota de procedencia bajo el campo. En
  cuanto el usuario la edita, manda él y la nota desaparece.

## Decisiones

- **La entrada libre se tolera, no se bloquea.** Si el texto no casa con el listado se
  guarda igual, sin código INE y avisando de lo que se pierde: hay fusiones y altas de
  municipios, y bloquear sería mentir sobre la completitud del dataset.
- **La altitud por municipio se DESCARTÓ tras evaluarla** (cambio sobre el alcance
  inicial, documentado abajo). El dataset solo lleva código y nombre.
- **La zona de radón NO se deriva todavía** aunque ya sea posible: exige transcribir y
  verificar el Apéndice B del DB-HS6 contra el PDF oficial, y eso es trabajo propio.

### Por qué el dataset no lleva altitud (evidencia)

El alcance aprobado era "municipio + altitud". Se obtuvo la altitud de Wikidata (P2044
cruzada por P772, exigiendo unidad metro) con 98 % de cobertura, y se contrastó contra los
`altitudCapital_m` ya verificados en `zonasClimaticasHE.ts`. El resultado la descarta:

- **Mezcla criterios sin distinguirlos**: da 2.123 m para Aller (esa es la cota del pico
  del concejo; su núcleo está a ~500 m), 1.900 m para San Bartolomé de Tirajana, y 0 m
  para Ferrol, Siero o El Puerto de Santa María.
- **Sobre las capitales** el error medio era 8,3 m, pero con casos que **cruzan un tramo**
  de la Tabla a-Anejo B: Toledo 523 vs 445 m, Cuenca 946 vs 999 m. Cruzar un tramo cambia
  la zona climática y con ella la transmitancia límite exigida al edificio.
- Ningún aviso automático detecta un error de 78 m, así que no había mitigación posible.

**En su lugar**: (a) cuando el municipio elegido ES la capital de su provincia se sugiere
`altitudCapital_m`, que sí está verificado, y aun así se ofrece —no se escribe— porque el
DB-HE exige la cota del emplazamiento; y (b) `limiteTramoCercano` avisa siempre que la
altitud tecleada quede a menos de 30 m de un límite de tramo, que es el error que de
verdad se puede cometer a mano y el que tiene consecuencia normativa.

## Definición de Hecho

- Elegir provincia → municipio del listado rellena el código INE y propone la altitud;
  la zona climática derivada cambia en consecuencia y se ve en el panel de derivados.
- Un municipio tecleado que no existe se guarda con aviso y sin código INE.
- El dataset se sirve en su propio chunk (no engorda el bundle inicial).
- Tests del dataset (integridad de códigos, correspondencia con las 52 provincias, rangos
  de altitud, sondeo contra capitales conocidas) y del selector, en verde con el resto.

## Fuera de alcance

- Derivar zona de radón, sismo o pluviometría (cada una es su propia transcripción
  verificada). · Buscador global de municipios sin provincia previa. · Geocodificación.
