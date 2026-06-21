# feature-3 — HS4 · Suministro de agua (fontanería)

> Vertical completo. Bloqueado por: `feature-0`; **prerrequisito** (confirmar emparejamiento de
> Tablas 2.1 / 4.2). Referencia I+D: `IDR-INSTALACIONES.md` §3 y §0 (corrección A1-08).

## Contexto normativo

**DB-HS4 = versión 2009, no modificada.**

## Prerrequisito bloqueante (§9 + §0)

**Confirmar celda a celda contra el PDF** el emparejamiento aparato↔valor de **Tabla 2.1** (caudal
instantáneo por aparato AF/ACS) y **Tabla 4.2** (Ø mín. derivaciones), que el PDF presenta
desalineadas. Aplicar la **corrección A1-08:** "Fregadero no doméstico" ACS = **0,20 dm³/s** (no
0,10); **añadir fila "Lavamanos 0,05/0,03"**. El resto de pares son correctos.

## Entradas

- Aparatos por estancia con caudal instantáneo (AF/ACS); nº de aparatos por tramo.
- Trazado de la red (tramos, longitudes, material), presión disponible en acometida.
- Criterio de simultaneidad elegido (ver abajo).

## Cálculo (§3)

- **Caudal de cálculo:** suma de caudales instantáneos (Tabla 2.1) × **coeficiente de
  simultaneidad K**. El **DB-HS4 NO prescribe fórmula** ("coeficiente según criterio adecuado");
  ofrecer la clásica **K = 1/√(n−1)** de **UNE 149201** como opción **etiquetada "criterio externo,
  no exigencia CTE"**.
- **Velocidades admisibles:** metálicas 0,50–2,00 m/s; termoplásticas/multicapa 0,50–3,50 m/s.
- **Diámetros (Tabla 4.2):** por tramo según caudal/velocidad (del prerrequisito).
- **Pérdida de carga:** longitudinales + **localizadas ≈ 20–30 %** de las longitudinales.
- **Presión:** mín. **100 kPa** (grifos) / **150 kPa** (fluxores y calentadores); **máx. 500 kPa**;
  ACS en consumo 50–65 °C. Comprobar en el **punto más desfavorable**.
- **Grupo de presión:** necesario si la presión disponible tras pérdidas < mínima exigida.

## Render SVG

Esquema **isométrico / en columna** con el **tramo crítico (más desfavorable) en rojo**
(multicanal). Etiquetas de Ø, caudal y presión por tramo. Resultados también en tabla.

## Ficha PDF

Datos de partida (aparatos, caudales, criterio K, material) con origen → caudales de cálculo →
diámetros → pérdidas y presión en el punto crítico → necesidad de grupo de presión → veredicto.
Cita DB-HS4 + tabla + **edición 2009**; cuando se use K, citar **UNE 149201** como criterio externo.

## Definición de Hecho

`SPEC.md` §5. Property-based: caudal de cálculo monótono respecto a nº de aparatos; velocidad dentro
de rango por material; presión crítica nunca sobre-reportada.

## Fuera de alcance

ACS solar / recirculación detallada; golpe de ariete; redes contra incendios (BIE).
