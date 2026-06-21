# feature-2 — HS5 · Evacuación de aguas (saneamiento)

> Vertical completo. Bloqueado por: `feature-0`.
> **Máxima confianza normativa:** tablas verificadas celda a celda → ideal para consolidar el
> patrón con bajo riesgo. Referencia I+D: `IDR-INSTALACIONES.md` §1.

## Contexto normativo

**DB-HS5 = versión 2009, NO modificada** por FOM/588/2017 ni RD 732/2019.

## Entradas

- Aparatos sanitarios por estancia (uso privado/público) y su agrupación en derivaciones, ramales,
  bajantes y colectores.
- Pendientes disponibles; nº de plantas (para bajantes y ventilación de red).

## Cálculo (tablas verificadas celda a celda, §1)

- **UD por aparato (Tabla 4.1):** lavabo 1/2 (Ø sifón/deriv. 32/40); ducha 2/3 (40/50); inodoro
  cisterna 4/5 (100/100); inodoro fluxómetro 8/10 (100/100); fregadero cocina 3/6 (40/50); cuarto
  de baño completo cisterna 7 UD / fluxómetro 8 UD.
- **UD por Ø de desagüe (Tabla 4.2):** 32→1, 40→2, 50→3, 60→4, 80→5, 100→6. Continuos: 1 UD por
  0,03 dm³/s.
- **Ramales colectores (Tabla 4.3):** UD máx. por pendiente 1/2/4 % → Ø (p.ej. 110 mm:
  123/151/181 UD).
- **Bajantes (Tabla 4.4):** UD según nº de alturas → Ø; agua ≤ 1/3 de sección; ±250 Pa.
  Desviaciones <45° sin cambio de sección; >45° se dimensiona como colector al 4 %.
- **Colectores horizontales (Tabla 4.5):** ≤ media sección; UD máx. por pendiente 1/2/4 % → Ø.
- **Sifones/botes (4.1.1.2):** sifón individual = Ø de la válvula; bote con altura suficiente.
- **Ventilación de red:** primaria sola si < 7 plantas (o <11 si sobredimensionada + ramales <5 m),
  prolongar bajante 1,30 m sobre cubierta no transitable (2,00 m si transitable), salida ≥6 m de
  tomas de aire. Secundaria: plantas alternas si <15, cada planta si ≥15. Terciaria: ramales >5 m
  o >14 plantas.

## Render SVG

Esquema de **bajantes y colectores** con diámetros y pendientes; tramo subdimensionado en rojo
(multicanal). Etiquetas de UD acumuladas por tramo. Resultados también en tabla.

## Ficha PDF

Datos de partida (aparatos, UD, pendientes) con origen → diámetros de derivaciones/ramales/
bajantes/colectores → ventilación de red → veredicto. Cita DB-HS5 + tabla + **edición 2009**.

## Definición de Hecho

`SPEC.md` §5. Property-based: UD monótono respecto a aparatos; Ø no decreciente aguas abajo;
respeto de ≤1/3 (bajantes) y ≤ media sección (colectores).

## Fuera de alcance

Cálculo de pluviales/cubiertas más allá de lo de evacuación residual; bombeo/elevación.
