# feature-18 — Cuartos húmedos por planta en la unifamiliar y grifos de baldeo del garaje

Estado: hecho (sin commitear). 899 tests en verde; tsc y eslint limpios.

## Por qué

1. En la unifamiliar solo se decía cuántos baños y aseos tenía la vivienda. HS4 y HS5
   suponían los baños en la planta más alta y la cocina y los aseos en la más baja, y la
   única salida era «Ajustar a mano». No se podía describir un baño en PB, y en una casa de
   tres plantas la intermedia siempre quedaba sin cuartos.
2. El garaje podía tener grifos de baldeo (tabla 2.1: `grifo_garaje`, 0,20 dm³/s), y el
   motor los admitía, pero El edificio no los dejaba decir. HS4 marcaba el garaje como «sin
   puntos de consumo».

## Qué se ha hecho

### Datos (`lib/edificio/tipos.ts`)

- `Zona.cuartos?: CuartosZona` (`{ banos, aseos, cocina }`), solo en «vivienda unifamiliar»,
  y por planta del grupo.
- `Zona.grifos?: number`, solo en «garaje» y «garaje privado».

Los dos campos son opcionales: los proyectos guardados se abren igual.

### El reparto (`lib/edificio/reparto.ts`, nuevo, puro)

`repartoUnifamiliar(e)` resuelve los cuartos de cada planta de la unifamiliar y lo usan HS4
y HS5:

- **Sin dato:** se aplica la regla de siempre. Por eso las redes por defecto no cambian y
  los snapshots siguen igual.
- **Con dato:** manda el dato. Si no cuadra con la vivienda tipo:
  - lo que sobra se quita empezando por la planta más lejana a la de la regla;
  - lo que falta va a la planta de la regla, entre las zonas sin dato;
  - la cocina es una sola; si hay varias, se queda la más baja.
- **`supuesto`:** con varias plantas, algún cuarto no está donde lo dijo el proyectista.
  Es el aviso «Se ha supuesto dónde están los cuartos húmedos», que ahora dice el reparto
  real («P1: 2 baños · PB: 1 aseo y cocina») y remite a El edificio, no a «Ajustar a mano».

`repartirCuartos` coloca los cuartos ya generados por cada módulo: los baños se numeran de
arriba abajo y los aseos de abajo arriba.

### Edición (`lib/edificio/editar.ts`)

`setCuartosZona` fija el reparto entero:

- escribe en todas las zonas el reparto actual, aplica el cambio y deja la vivienda tipo
  con la suma;
- mover un baño es bajar uno aquí y subir otro allí;
- no deja la vivienda sin baño ni pasa los límites del tipo (5 baños, 4 aseos).

Otras reglas:

- `copiarZonas` no copia `cuartos`: una planta nueva no duplica baños.
- `setUso` quita `cuartos` y `grifos` si el uso nuevo no los admite.
- `setGrifos`: de 0 a 20.

Si se cambian los totales en la vivienda tipo después de fijar el reparto, vuelve a ser un
supuesto avisado. Es deliberado: el cuarto nuevo no se sitúa sin preguntar.

### Pantalla (`components/edificio/EditorSeleccion.tsx`)

- Zona «vivienda unifamiliar», con la vivienda en varias plantas: bloque «Cuartos húmedos
  en esta planta», con baños, aseos y la cocina («está aquí» o «Traer aquí»), y una nota
  que explica si el reparto es supuesto.
- Garajes: «Grifos de baldeo».
- Vivienda tipo, en «Dónde está»: los cuartos de cada planta.

### HS4

- **Unifamiliar:** el grifo del garaje es un cuarto más de la vivienda, detrás del
  contador general.
- **Resto de edificios:** se crea la unidad «Servicios comunes» (`clase: "comunes"`) en el
  garaje más alto. Tiene montante propio desde la batería o, con contadores por planta,
  desde el tubo de alimentación, fuera del montante general. Activa el contador de
  servicios comunes.
- Fila «Garaje» en «Qué entra»: «S1 · 1 grifo de baldeo · se calcula».
- La memoria y la ficha nombran los grifos y los servicios comunes.
- **Dibujo:**
  - las cajas de los sótanos van a la derecha del patinillo, para no tapar el nombre y la
    cota de la planta;
  - la barra de «Red de la calle» baja debajo de la última barra de planta;
  - la caja de la unifamiliar crece para que quepa su rótulo («Cocina, baño y aseo»).

### HS5

La pila de la unifamiliar lee el mismo reparto. El garaje no cambia: ya tenía su red de
sumideros con bombeo bajo la cota del alcantarillado.

### De paso: solapes del esquema de HS3

- Las cifras del dibujo que chocan se escalonan (`DibujoConEtiquetas`, común a todos los
  módulos).
- Los rótulos de los recintos llevan halo sobre las flechas.
- La rejilla de los cuartos estrechos baja a la altura del «sale».

## Fuera de alcance

- Puntos de agua exteriores (riego, piscina): servirían con el mismo patrón que los grifos.
- Unifamiliar con plantas repetidas («P1–P2 × 2»): los cuartos de la zona cuentan en cada
  planta del grupo, pero el panel muestra el valor de la planta más alta.
