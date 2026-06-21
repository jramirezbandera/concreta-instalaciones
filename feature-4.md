# feature-4 — HE1 · Transmitancia U + condensaciones (predimensionado de envolvente)

> Vertical completo. **Último del Tier 1** (compite con gratis oficial que exige modelar el
> edificio, y es el más caro de modelar bien). Bloqueado por: `feature-0`; **prerrequisito**
> (transcribir ψ y procedimiento Glaser). Referencia I+D: `IDR-INSTALACIONES.md` §4, §0 (tabla
> Ulim corregida) y §9.

## Contexto normativo

**DB-HE = edición 2019** (RD 732/2019), texto consolidado 14-jun-2022. **Solo predimensionado por
elemento** — NO replicar HULC/CYPETHERM ni modelar el edificio entero (ver no-goal en `SPEC.md` §3).

## Prerrequisito bloqueante (§9 + §0)

- Usar la **tabla Ulim CORREGIDA del §0** (la investigación original invirtió filas; **los huecos
  NO se limitan a 5,7**). Verificar contra el PDF maquetado al implementar.
- Transcribir **ψ de puentes térmicos (DA DB-HE/3)** y **procedimiento Glaser + fRsi,min
  (DA DB-HE/2)**. Alternativa no bloqueante: método **global Klim** (engloba puentes térmicos a
  nivel de coeficiente).

## Entradas

- Cerramiento por **capas** (espesor + conductividad λ por capa); tipo de elemento (muro/suelo,
  cubierta, contacto con no habitable/terreno, hueco, puerta).
- Zona climática (α/A/B/C/D/E); condiciones interiores/exteriores para condensaciones.

## Cálculo (§4)

- **Transmitancia:** U = 1/RT, con RT = Rsi + ΣRi + Rse. **Rsi/Rse (DA DB-HE/1, Tabla 1):**
  vertical 0,13/0,04; ascendente 0,10/0,04; descendente 0,17/0,04 [m²K/W]. Ri capa = espesor/λ.
- **Valores límite Ulim (tabla corregida §0), Ulim [W/m²K] por zona α/A/B/C/D/E:**
  - Muros y suelos exterior (UM, US): 0,80 / 0,70 / 0,56 / 0,49 / 0,41 / 0,37
  - Cubiertas exterior (UC): 0,55 / 0,50 / 0,44 / 0,40 / 0,35 / 0,33
  - Contacto con no habitables o terreno (UT): 0,90 / 0,80 / 0,75 / 0,70 / 0,65 / 0,59
  - Huecos (UH): 3,2 / 2,7 / 2,3 / 2,1 / 1,8 / 1,80
  - Puertas (sup. semitransparente ≤ 50 %): 5,7 (valor único)
  - Medianerías (UMD): sin valor de Ulim en esta tabla
- **Condensaciones (3.3):** superficial por **fRsi ≥ fRsi,min**; intersticial: acumulada anual ≤
  evaporación anual (**método de Glaser**, DA DB-HE/2).
- **Puentes térmicos:** ψ según DA DB-HE/3 (o método global Klim).

## Render SVG

**Sección del muro por capas** con espesores y λ; verificación visual U vs Ulim (rojo si U > Ulim,
multicanal). Diagrama de presiones de vapor/saturación (Glaser) si se implementa el detalle.
Resultados también en tabla.

## Ficha PDF

Datos de partida (capas, λ, zona) con origen → RT y U → comparación con Ulim → fRsi y Glaser →
veredicto CUMPLE/NO CUMPLE. Cita DB-HE + tabla 3.1.1.a + DA DB-HE/1/2/3 + **edición 2019
(consolidado 14-jun-2022)** + sello motor.

## Definición de Hecho

`SPEC.md` §5. Property-based: U decrece al añadir aislante; U comparada con la Ulim correcta de la
zona; sin condensación intersticial acumulada neta cuando evaporación ≥ condensación.

## Fuera de alcance

HE0 (consumo), HE4/HE5, certificación energética, demanda del edificio completo, puentes térmicos
geométricos avanzados (más allá de ψ tabulados / Klim).
