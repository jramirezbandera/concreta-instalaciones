# feature-26 — Cerramientos del proyecto: un catálogo común para HE1, HR y HS1

> Tras la Fase D ([feature-25.md](feature-25.md), HR). Escrito el 2026-10-05 a petición del
> usuario: «el catálogo de elementos constructivos se usa en HR pero también podría usarse en HE;
> en HE1 no puedes decidir el tipo de cerramiento o está muy limitado, y un proyecto puede tener
> más variantes».

## Lo que hay hoy

La misma fachada se describe tres veces, sin nada que obligue a que coincidan:

- **HE1** ([envolvente.ts](src/modules/he1/envolvente.ts)): cuatro cerramientos fijos. La fachada
  es siempre ½ pie + XPS + cámara + LHD. La cubierta, plana invertida o inclinada, según El
  edificio. El suelo se deduce de lo que hay debajo. La ventana tipo es de PVC, de 1,20 × 1,40.
  Solo se decide el espesor del aislante de la fachada, el vidrio, el local sin uso y la humedad.
- **HR** ([catalogo.ts](src/modules/hr/catalogo.ts)): 52 soluciones del CEC (F 3.1, F 1.1, F 3.4,
  SATE, ventilada, cubiertas, ventanas, forjados…), con valores acústicos solamente. La fachada,
  la ventana, la cubierta y el forjado elegidos viven en el estado de HR.
- **HS1** ([decisiones.ts](src/modules/hs1/decisiones.ts)): decide por su cuenta si la fachada
  tiene revestimiento exterior y si es de una o de dos hojas.

HR puede decir «SATE sobre LP ½ pie» mientras HE1 calcula un ½ pie con cámara y HS1 supone dos
hojas.

## Decisiones del usuario (2026-10-05)

1. **Los tipos de cerramiento se eligen en El edificio**, una sola vez. HE1, HR y HS1 los leen
   igual que REBT lee de HE 6.
2. **Variantes:** lo normal es un tipo para todo el edificio y, como mucho, la **planta baja
   distinta**. No se asigna planta a planta. «Planta baja distinta» es un interruptor opcional.

## Verificación (2026-10-05)

[research/verificacion-cerramientos-cec.md](research/verificacion-cerramientos-cec.md): CEC v6.3
leído en imagen, bloques A a G y criterios K-CER.4 a K-CER.15. Lo que cambia el plan:

1. **Cada fila del CEC sirve a los tres DB.** Da la U como 1/(R0 + R_AT), el grado de
   impermeabilidad según el revestimiento, y RA, RA,tr y m.
2. **El cálculo por capas reproduce la R0 del CEC**, con una diferencia de 0,011 m²K/W o menos
   en 13 fachadas. HE1 sigue calculando por capas, que lo necesita para Glaser, y los tests
   contrastan con la R0 del CEC con una tolerancia de 0,02 (K-CER.4).
3. **Fábricas y forjados entran con la R directa del CEC** (3.17 y 3.18), no con un λ (K-CER.5).
   El repo usa λ 0,49 para el LP y 0,32 para el LH, y salen R de 0,235 y 0,219. El CEC da 0,18
   y 0,16. Hay además cuatro µ distintos del CEC: PYL, enlucido, HA y XPS.
   **Decisión del usuario: se corrige en todos los proyectos.** El aislante habitual no cambia
   en ninguna zona; solo puede cambiar el veredicto de un espesor fijado justo en el límite.
4. **Fachada habitual: F 3.2**, no F 3.1. Es la que HE1 calcula hoy, con cámara de 30 mm. En HR
   vale lo mismo que F 3.1 (K-CER.15).
5. **Cubierta = paquete + forjado de El edificio** (K-CER.10). El CEC tabula la U de cada
   cubierta con un forjado de 250 mm. Los dos ids de cubierta de HR pasan a ser paquetes.
6. **Cámara ventilada**: no cuenta la cámara ni lo que queda fuera de ella, y Rse = 0,13
   (K-CER.9).
7. **HS1 deduce el grado de los rasgos** de la fachada con su tabla 2.7: hojas, revestimiento,
   B, C, si el aislante es hidrófilo, N. El grado del CEC queda como contraste y avisa si
   difiere (K-CER.12): en F 3.5 y F 8.1 da un grado menos que la tabla 2.7.
8. **Ventanas**: se queda la ec. (10) del DA/1, que es más exigente que las tablas 4.3.1 del CEC
   porque estas no cuentan Ψ. La tabla 4.3.1 sirve de contraste.
9. **Fachadas que se añaden**: F 3.2, F 3.5, F 1.2, F 2.1, F 4.2, F 7.3, F 8.2 y F 3.9. Con las
   seis de HR suman catorce.

## Objetivo

- Un **catálogo común** (`src/lib/constructivo/`). Cada solución lleva:
  - sus **capas**, para la U de HE1, con el hueco del aislante cuyo espesor se decide;
  - sus **valores acústicos**, los de hoy, para HR;
  - sus **rasgos para HS1**: hojas, revestimiento exterior, aislante por el exterior.
- En **El edificio**, una sección **«Cerramientos»** con la fachada, la ventana, la cubierta y el
  forjado del proyecto, y la fachada y la ventana de la planta baja si son distintas.
- **HE1** comprueba cada tipo y deja de usar composiciones fijas. **HR** y **HS1** dejan de
  guardar su propia fachada.

## Principios

- **Un dato se escribe una vez.** El tipo de cerramiento se elige en El edificio. El espesor del
  aislante y el vidrio bajo emisivo siguen siendo decisiones de HE1, porque solo afectan a HE1: el
  RA,tr del CEC no depende del espesor del aislante.
- **Sin migración** (REDISENO-V4 §7.4). `edificio.cerramientos` es opcional, y si falta valen
  los habituales de hoy: F 3.1, la cubierta según su tipo, el forjado de 30 cm y la ventana
  batiente. Un proyecto existente no cambia de veredicto.
- **Ninguna cifra sin verificar.** Las capas de cada solución se leen en la imagen del CEC. Lo que
  no da el CEC se rotula como criterio (K-CER.n).

## Plan

0. ~~Verificación~~: hecha (arriba).
1. **Catálogo común**: mover `hr/catalogo.ts` a `src/lib/constructivo/catalogo.ts`. HR lo importa
   de ahí. Cada entrada sigue el modelo del bloque G de la verificación:
   - capas de interior a exterior, cada una con su rol, su material y su espesor, o «variable» en
     el aislante;
   - la fuente térmica de cada capa: la R directa (fábricas, forjados, cámaras) o el λ;
   - el µ del CEC, y la marca `fueraDelCalculo` en lo que queda fuera de una cámara ventilada;
   - la R0 del CEC, como contraste;
   - los rasgos para HS1;
   - el aislante por defecto y su λ (K-CER.6).

   Las cubiertas son paquetes sin el forjado; los forjados llevan su R por tipo y canto (3.18).
1b. **Corrección de HE1** en todos los proyectos: R de 3.17 para las fábricas y µ del CEC. Se
   revisan los tests de HE1 cuyas cifras cambien.

   **Hecho (2026-10-06), pasos 1 y 1b:**
   - `src/lib/constructivo/catalogo.ts` (el de HR, movido) y `materiales.ts` (R, λ y µ del CEC).
     Catorce fachadas con capas, R0 del CEC, aislante por defecto y rasgos de HS1; forjados con R
     y µ del 3.18; las dos cubiertas con su paquete (`R0_paquete`, `pendientesLigero`). HR sigue
     usando su RAtr fijo de cubierta hasta el paso 4.
   - HE1: la fachada sale de F 3.2 (`fachadaDe`, `capasDeFachada`); el motor admite capas
     `fueraDelCalculo` y `camaraMuyVentilada` (Rse = Rsi). µ del CEC: enlucido 6, PYL 4, HA 80,
     XPS hasta 220; EPS λ 0,039; LP y LH con el λ equivalente de su R (0,64 y 0,44).
   - Cifras: la U de la fachada del Demo pasa de 0,38 a 0,40; el mínimo de aislante no cambia. La
     cámara va ahora por fuera del aislante, como en la sección del CEC.
   - Tests: la R0 por capas de las catorce fachadas frente a la del CEC (±0,02, K-CER.4).

   **Decisiones a validar:**
   - Hoja principal (K-CEC.5) de las fachadas nuevas: F 3.5 269 / 48 (P1.5 con una cara
     revestida); F 2.1 y F 7.3 120 / 40 (½ pie sin revestir por ninguna cara: no llegan a
     «hoja exterior m ≥ 130»); F 3.9 195 / 43 (la de F 4.3 con una cara revestida).
   - Aislante por defecto de F 2.1 y F 7.3: XPS, porque va entre las dos hojas (K-CER.6).
   - El aplacado de las ventiladas se dibuja con 20 mm; no cuenta en la U.
   - Las cubiertas C 5.3, C 2.3 y C 12.3 se añaden cuando HR y HE1 lean el forjado de El edificio
     (pasos 2 a 4): sin forjado no tienen RAtr. El código «4.1.9» de HR pasa a «C 9.3».
2. **El edificio**: `Edificio.cerramientos?`:
   ```ts
   interface Cerramientos {
     fachada: Eleccion;           // la general
     fachadaPB: Eleccion | null;  // null = la misma
     ventana: Eleccion & { marco: Marco };
     ventanaPB: (Eleccion & { marco: Marco }) | null;
     cubierta: Eleccion | null;   // null = la habitual del tipo de cubierta
     forjado: Eleccion;
   }
   ```
   `Eleccion` es la de HR, con sus valores propios. Pantalla: sección «Cerramientos» en
   [EdificioPage](src/pages/EdificioPage.tsx), con desplegables del catálogo, la página del CEC y
   el interruptor «Planta baja distinta». Si la planta baja no es de viviendas ni de oficinas,
   avisa de que la fachada de planta baja no entra en HE1.

   **Hecho (2026-10-08), paso 2:**
   - Tipos en `src/lib/constructivo/tipos.ts` (`Eleccion`, que HR reexporta; `Marco`, los siete
     del 3.16 con las claves de `UF_REFERENCIA_CEC` y su familia de la Tabla 10; `Cerramientos`).
     `Edificio.cerramientos?` en `lib/edificio/tipos.ts`.
   - Lógica pura en `src/lib/constructivo/cerramientos.ts`: `CERRAMIENTOS_HABITUALES`,
     `cerramientosDe(e)` (las soluciones resueltas, con `supuestos`), `setCerramientos`,
     `elegir` (quita los valores propios al cambiar de solución), `elegirVentana` (conserva el
     marco), `setPlantaBajaDistinta`, `plantaBajaEnHe1` y `avisosCerramientos`.
   - Las cubiertas llevan `forma` (plana o inclinada) y se renombran como paquetes: «Plana
     transitable, no ventilada, con solado fijo» (C 1.3) e «Inclinada de tejas sobre forjado
     inclinado, no ventilada» (C 9.3).
   - Pantalla: tarjetas «Cerramientos» bajo lo que se repite; al pulsarlas, el editor de la
     izquierda (`EditorCerramientos.tsx`, selección `{ tipo: "cerramientos" }`). La cubierta de
     la sección enlaza con él. Cambiar de caso o leer un cuadro conserva los cerramientos, y el
     caso marcado no los tiene en cuenta.
   - «Lo usan» dice, por ahora, que HE1, HR y HS1 todavía no los leen: se cambia en cada paso.
   - Tests: 14 nuevos (lógica y editor), 1254 en verde.

   **Decisiones a validar:**
   - La fachada habitual es **F 3.2**, no F 3.1 como decía este plan: es la que HE1 calcula
     desde el paso 1, y en HR vale lo mismo que F 3.1 (K-CER.15; lo comprueba un test). En el
     paso 4, un proyecto con F 3.1 guardado en HR tendrá que decidir qué manda.
   - ~~«Planta baja dentro de HE1» con el vestíbulo~~: corregido en el paso 3. Es lo que
     protege HE1 (viviendas, unifamiliar u oficinas), como decía el plan.
   - La planta baja distinta empieza igual que la general; el interruptor cubre fachada y
     ventana juntas.
   - Los valores propios no se editan en El edificio: el tipo los guarda, y en el paso 4 HR
     los editará sobre la elección de El edificio (como SUA 9 escribe el ascensor).
   - Una cubierta que no casa con el tipo (inclinada en un edificio de cubierta plana) se
     descarta: vale la habitual y se avisa. Con una sola cubierta por forma, el editor la
     enseña sin desplegable; C 5.3, C 2.3 y C 12.3 siguen esperando a los pasos 3 y 4.
   - El marco no se pinta con su Uf en El edificio, para no duplicar la tabla de HE1.
3. **HE1**: los cerramientos salen de los tipos (fachada y, si la hay, fachada PB; cubierta;
   suelo con el forjado elegido; ventana o ventanas). Cada fachada con aislante propone su
   mínimo y lo decide aparte: `aislanteFachada_mm` pasa a ser por tipo. Las decisiones, el
   dibujo de la sección y la ficha cubren uno o dos tipos de fachada y de ventana.

   **Hecho (2026-10-08), paso 3:**
   - `envolvente.ts`: `tiposHe1(e, env)` saca de El edificio las fachadas, las ventanas, la
     cubierta y el forjado que entran. Roles nuevos `fachada-pb` y `ventanas-pb` (con
     `claseDe`, `esRol`, `capaAislante`, `aislanteDe`, `CAMPO_AISLANTE`); los cuatro ids de
     siempre no cambian.
   - La fachada de la planta baja es un cerramiento aparte si la planta 0 se protege y es
     otro tipo; si solo se protege la planta baja, su fachada es la única («fachada»). Las
     ventanas de la planta baja, si cambia el **marco** (el vidrio es de HE1 y el tipo
     acústico no cambia la UH).
   - Aislante por fachada: `aislanteFachada_mm` (la general) y `aislanteFachadaPB_mm`
     (opcional, «habitual» por defecto). Cada una propone su mínimo y su arreglo escribe su
     campo.
   - Cubierta y suelo: la capa de forjado es el de El edificio, con su R y su µ del 3.18
     (K-CER.10/11), en vez del hormigón armado con λ. Contraste: la cubierta plana por capas
     queda del lado seguro y a menos de 0,03 del R0 del CEC; la inclinada, a menos de 0,01.
   - Ventanas: Uf del 3.16 por el marco y Ψ de la Tabla 10 por su familia. El vidrio habitual
     es el primero con el que cumplen todas; el arreglo solo ofrece un vidrio que lo arregle
     de verdad y, si ninguno basta, pide otro marco en El edificio.
   - Decisiones, «Qué entra», dibujo, franja, ficha y memoria con una o dos fachadas y
     ventanas, cada una con su código del CEC. El aviso de El edificio sobre la planta baja
     usa ya lo que protege HE1 (viviendas u oficinas, sin el vestíbulo).
   - **Cifras que cambian** en todos los proyectos, por el forjado del CEC (R 0,21 del
     unidireccional de 30 cm frente a 0,13 del hormigón armado): en el Demo, U de la cubierta
     de 0,30 a 0,29 y del suelo de 0,45 a 0,43; mínimos de 80 a 70 mm (cubierta) y de 40 a
     30 mm (suelo). Lo propuesto no cambia (100 y 60 mm son los espesores de partida). Un
     espesor fijado solo puede pasar de no cumplir a cumplir.
   - Tests: `he1/test/cerramientos.test.ts` (28 nuevos); 1282 en verde. Comprobado en el
     navegador con el Plurifamiliar, planta baja con SATE y marco metálico con RPT.

   **Decisiones a validar:**
   - El aislante es **por fachada** (general y planta baja), no por id de tipo: si se
     cambia el tipo, un espesor fijado a mano se mantiene (y se ve «No es lo habitual»).
   - Un solo vidrio para todas las ventanas.
   - La cubierta sigue por capas (la necesita Glaser); el paquete del CEC solo contrasta.
     La plana queda 0,026 por debajo del R0 del CEC (no cuenta solado ni mortero).
   - El forjado elegido sirve también a la cubierta inclinada (antes, hormigón de 25 cm).
4. **HR**: lee fachada, ventana, cubierta y forjado de El edificio y quita esos campos de
   `HrEstado`. La fachada de la planta baja se comprueba con los recintos de la planta 0; la
   general, con los demás.

   **Hecho (2026-10-08), paso 4:**
   - `HrEstado` pierde `fachada`, `ventana`, `cubierta` y `forjado`: HR los lee de
     `cerramientosDe(edificio)`. Lo que guardaba un proyecto en esos campos se ignora.
   - `gruposExterior`: con la planta baja distinta y viviendas en ella (despachos, en un
     edificio sin viviendas), su fachada y su ventana se comprueban aparte
     (`fachada-dormitorios-pb`, `fachada-estancias-pb`); si solo la planta baja las tiene, la
     suya es la única. Una ventana de planta baja que solo cambia de marco no añade nada.
   - Los flancos de las separaciones, con la fachada general.
   - Cubierta: `RAtrCubierta(cubierta, forjado)` = RA,tr del forjado de El edificio + 2 dBA si
     hay pendientes de hormigón ligero (4.1.1 nota 4, K-CER.10). Con el forjado de referencia
     reproduce el 52 de C 1.3 y el 48 de C 9.3. La inclinada sobre el forjado habitual de 30 cm
     pasa de 48 a 50 (solo puede mejorar el veredicto).
   - Pantalla: la fachada, la ventana, la cubierta y el forjado se ven en solo lectura con
     «Cambiar en El edificio»; los valores propios se siguen editando aquí y se guardan en la
     elección de El edificio (como SUA 9 escribe el ascensor). Con la planta baja distinta,
     dos decisiones más: su fachada y su ventana. «Lo usan» de El edificio ya marca HR.
   - Tests: `hr/test/cerramientos.test.ts` (8) y uno de pantalla; 1292 en verde. Comprobado
     en el navegador con el Plurifamiliar y SATE en la planta baja.

   **Decisiones a validar:**
   - Los valores de fachada, ventana, cubierta y forjado que hubiera guardado HR en un
     proyecto se pierden (HR salió el 2026-10-05; no hay migración).
   - Los flancos (condiciones de fachada de las tablas 3.2 y 3.3) se comprueban solo con la
     fachada general, también para las separaciones de la planta baja.
   - El porcentaje de huecos, la caja de persiana y «fachada no expuesta» son los mismos para
     la planta baja y las demás.
   - C 5.3, C 2.3 y C 12.3 siguen fuera: HE1 calcula la cubierta por capas según su tipo y
     aún no distingue grava, solado flotante ni bajo cubierta ventilado.
5. **HS1**: `fachadaHojas`, `fachadaRevestimiento` y la combinación de la tabla 2.7 se deducen de
   los rasgos de la fachada. El grado del CEC se usa como contraste y avisa si difiere. Con la
   planta baja distinta, se comprueban las dos.

   **Hecho (2026-10-08), paso 5:**
   - `hs1/fachada.ts` (pura): de los rasgos del catálogo salen la columna, las hojas (nota (1))
     y B (con el aislante hidrófilo o no), C y N; se declaran R (desde la de su tipo hasta R3),
     y J, N y H sin revestimiento. Lo habitual es lo mínimo que pide la primera combinación que
     la fachada puede cumplir. La combinación es la primera cubierta, con la sustitución del
     2.3.2 pto 2. Si no cumple, lo que falta de la más cercana.
   - **Una solución de grado mayor vale para uno menor** (el grado es un mínimo): sin esto, un
     SATE (una hoja, C1) no cumpliría el grado 2, cuya casilla pide C2 por la nota (1).
   - `DecisionesHs1` pierde `fachadaRevestimiento`, `fachadaHojas` y `fachadaOpcion`; gana
     `fachadaDeclara?: { general?, pb? }`. Con la planta baja de otro tipo, `fachada-pb` aparte.
   - La fachada **puede no cumplir**: el arreglo es «Volver a lo propuesto» si lo habitual
     llega, o elegir otra fachada en El edificio si ni declarando lo máximo llega.
   - Contraste del CEC (K-CER.12): aviso solo si, con lo declarado, el CEC da un grado menor que
     el exigido y la tabla 2.7 dice que llega (F 3.5 con R1: CEC 3, tabla 4).
   - El Demo no cambia: grado 5 con R3 + C1, ahora como lo habitual de F 3.2.
   - Tests: `hs1/test/fachada.test.ts` (12, el cotejo F.3 de la verificación) y
     `hs1/test/cerramientos.test.ts` (5); 1310 en verde. Comprobado en el navegador.

   **Decisiones a validar:**
   - La R habitual es la menor que cumple (con grado 5, R3: «revestimiento estanco»), igual
     que HE1 propone el aislante; así ningún proyecto sin cerramientos cambia de veredicto.
   - Las declaraciones de antes (con o sin revestimiento, hojas, combinación) se ignoran.
   - J, N y H se pueden declarar en las fachadas sin revestimiento; N solo si la sección tiene
     enfoscado intermedio.
6. **Fichas y memoria**: cada ficha cita el tipo con su código y su página del CEC, por ejemplo
   «F1 · SATE sobre LP ½ pie (CEC F 4.1, p. 64)». El mismo nombre en HE1, HR y HS1.

   **Hecho (2026-10-08), paso 6:**
   - `src/lib/constructivo/textos.ts`: `citaCec` («CEC F 3.2, p. 59»), `designacion` (el nombre
     con esa cita), `enFrase`/`designacionEnFrase` (en minúscula salvo las siglas: «enfoscado +
     LP…», «SATE…») y `NOMBRE_CERRAMIENTO` («Fachada», «Fachada de la planta baja», «Ventanas»,
     «Ventanas de la planta baja», «Cubierta», «Forjados»).
   - **HE1**: en la ficha, la fachada, la cubierta, los forjados y las ventanas llevan su
     designación (la fila «Marco» pasa a ser «Ventanas», con el tipo y el marco); en la memoria,
     también la cubierta y las ventanas. El vidrio se nombra por su tipo («doble bajo emisivo»)
     y no por sus lunas, que son las del tipo de ventana; una observación lo explica.
   - **HR**: la ficha añade a los datos de partida la fachada, las ventanas, la cubierta y los
     forjados que comprueba (los de la planta baja, si van aparte), y la tabiquería con su
     cita. `textoSolucion` cita la página de todas las soluciones.
   - **HS1**: ficha y memoria con la misma designación.
   - Tests: `lib/constructivo/test/fichas.test.ts` (las tres fichas y memorias con la planta
     baja distinta dicen lo mismo); 1312 en verde.

   **Decisiones a validar:**
   - Sin etiquetas «F1», «F2»: los cerramientos se llaman por su papel («Fachada de la planta
     baja»). «C1» chocaría con las condiciones C1 y C2 de HS1, y «F1» con los códigos F 1.1 del
     CEC.
   - En HR, la página del CEC sale en todas las soluciones (tabiquería, separaciones, suelos),
     no solo en los cerramientos de El edificio.
   - ~~La cubierta de HS1 la decidía HS1~~: arreglado justo después (abajo).

   **Hecho (2026-10-08), la cubierta de HS1:** HS1 decidía la protección (grava en la no
   transitable) mientras El edificio solo tenía C 1.3 (transitable, solado fijo) para toda
   plana. Ahora:
   - El catálogo añade **C 2.3** (transitable, solado flotante, solo invertida; p. 38) y
     **C 5.3** (no transitable, grava; p. 41), con R0_paquete 0,25 y + 2 dBA por las
     pendientes (verificación C.1.3, C.1.4 y C.2). Cada cubierta lleva su `tipo` de El edificio,
     su `proteccion` de la tabla 2.9 y `soloInvertida`.
   - La cubierta casa con el **tipo** de cubierta de El edificio, no solo con la forma. La
     habitual: C 1.3 si es transitable, **C 5.3 si no lo es**, C 9.3 si es inclinada (las que
     suponía HS1).
   - **HS1** lee la cubierta de El edificio (`cubiertaDe(sol, d)`): su protección sale de
     allí y `cubiertaProteccion` desaparece de las decisiones. Solo decide la posición del
     aislante (invertida por defecto; C 2.3, siempre invertida) y, en la inclinada, la teja
     y la lámina. En pantalla se ve con «Cambiar en El edificio».
   - Fichas y memoria de HS1 nombran la cubierta como HE1 y HR.
   - Ningún veredicto cambia: en HR, C 5.3 da el mismo RA,tr que C 1.3 (52 con el forjado de
     30 cm); HE1 calcula la cubierta por capas según su tipo, como antes; en HS1, lo habitual
     era ya la grava. Cambia el nombre: el Demo y el Plurifamiliar pasan a C 5.3.
   - Tests: 1314 en verde.

   **Decisiones a validar:**
   - HS1 pierde tres protecciones de la tabla 2.9 que el catálogo no tiene: capa de rodadura,
     lámina autoprotegida y tierra vegetal. Volverán cuando se lean en imagen las tablas del
     CEC que faltan (4.1.3, 4.1.4, 4.1.6…). Lo guardado en `cubiertaProteccion` se ignora.
   - Una cubierta elegida de otro tipo (solado fijo en una no transitable) se descarta con
     aviso, y con ella sus valores propios de HR.
   - ~~HE1 siempre invertida y HS1 podía decir convencional~~: arreglado (abajo).

   **Hecho (2026-10-09), la posición del aislante de la cubierta, en El edificio:**
   - `Cerramientos.aislanteCubierta?: "invertida" | "convencional"` (sin dar, invertida; sin
     migración). `cerramientosDe` da `cubierta.invertida` (C 2.3, siempre; la inclinada, false).
     En El edificio, «Aislante de la cubierta» con Invertida / Convencional bajo la cubierta
     plana; con C 2.3, «Invertida: el Catálogo solo la da así». La tarjeta lo dice.
   - **HE1** calcula también la convencional (`MontajeCubierta`): forjado, pendientes, XPS e
     impermeabilización encima. La **barrera de vapor** bajo el aislante la pone HE1 solo si,
     sin ella, Glaser prevé condensaciones (el CEC: «B, solo si hay riesgo de condensación según
     el DB HE-1»); es la misma lámina que la impermeabilización (Sd 50 m, orientativo). El
     mínimo del aislante se calcula sin barrera (lado seguro; no cambia en el Plurifamiliar).
     Ficha, memoria y franja: «convencional con barrera de vapor». Si aun con la barrera
     condensa, el aviso pide el balance anual o una barrera de más Sd, no «poner una barrera».
   - **HS1** deja de decidir el aislante (`cubiertaAislante` sale de sus decisiones): lo lee
     de El edificio y lo enseña («Invertida, como en El edificio»).
   - Ningún proyecto cambia: sin decirlo, sigue invertida. Lo guardado en HS1 como
     convencional se ignora.
   - Tests: 1320 en verde (lógica, HE1 con Cáceres y Burgos, fichas y editor).

   **Decisiones a validar:**
   - En Burgos (y sin clima de la obra), la convencional con la barrera de Sd 50 m sigue
     marcando condensación en enero: el Sd orientativo de la lámina es bajo frente al de la
     impermeabilización de encima. Se queda en aviso (el DB admite condensación que se evapore
     en el año), sin inventar un Sd mayor.
   - El aislante de la cubierta sigue siendo XPS también en la convencional (salvo C 6.3).

   **Hecho (2026-10-09), las protecciones de HS1 que faltaban:** el agente de normativa leyó
   las 14 tablas de cubiertas del CEC (Bloque H de la verificación).
   - **C 6.3** (p. 42, 4.1.6), «Plana no transitable, con lámina autoprotegida»: **solo
     convencional**, R0_paquete 0,23, RA,tr 52. Aislante soldable: **lana mineral** por defecto
     (K-CER.18).
   - **C 7.3** (p. 43, 4.1.7), «Plana no transitable, ajardinada»: convencional o invertida,
     R0_paquete 0,82 (supone unos 30 cm de tierra; solo contraste, HE1 no cuenta la protección:
     lado seguro), RA,tr 52. El CEC también la llama no transitable.
   - **La capa de rodadura no está en el CEC**: sus cuatro planas transitables son de peatones.
   - Modelo: `soloInvertida` pasa a `posicion` («ambas», «invertida», «convencional») y cada
     cubierta lleva su `aislante`. HE1 usa ese aislante en la capa y en los textos. En El
     edificio, la no transitable ofrece C 5.3 (la habitual), C 6.3 y C 7.3.
   - Tests: 1323 en verde.

   **Decidido con el usuario (2026-10-09):**
   - **Capa de rodadura: no se ofrece** (no está en el CEC; K-CER.17 opción a). Se añadiría
     si un proyecto la necesita, rotulada como criterio.
   - **Pendiente de C 6.3**: el CEC la da del 1 al 5 % (nota 2) y la tabla 2.9, hasta el 15 %.
     Cada cubierta lleva `pendienteMax_pct` donde se ha leído (C 1.3, C 6.3 y C 7.3: 5 %), y
     HS1 avisa (`cubierta-pendiente-cec`) si la tabla 2.9 admite más: por encima, la cubierta
     ya no es la del Catálogo.
7. **Tests**:
   - un proyecto sin `cerramientos` da el mismo veredicto que hoy en HE1, HR y HS1;
   - en HE1, la U por capas de cada fachada frente a la del CEC;
   - casos con la planta baja distinta;
   - capturas de El edificio y de HE1 con dos fachadas.

   **Hecho (2026-10-09), paso 7:**
   - `lib/constructivo/test/sin-cerramientos.test.ts`: 420 combinaciones (los cuatro casos de
     El edificio y el Demo, con cada tipo de cubierta; HE1 con tres obras y aislantes habituales,
     finos, justos y medios; HR con cuatro niveles de ruido; HS1 con cinco obras) frente a los
     veredictos de **antes de feature-26**, sacados del código de 3f5b662 en un worktree
     (`veredictos-antes.ts`). HR y HS1, idénticos elemento a elemento, también lo que no cumple.
     En HE1 solo cambian la cubierta y el suelo con los espesores en el límite (70 y 30 mm), y
     solo de no cumplir a cumplir: es el forjado del CEC del paso 3.
   - La U por capas de las catorce fachadas frente a la R0 del CEC: `he1/test/catalogo.test.ts`
     (paso 1). La planta baja distinta: los tests de cerramientos de HE1, HR, HS1 y las fichas.
   - Capturas (navegador de gstack, `.gstack/browse-reports/2026-10-09-1039/`): El edificio con
     la planta baja distinta (F 4.1 y marco metálico con RPT) y HE1 con las dos fachadas y las
     dos ventanas; la de la planta baja no cumple (UH 2,19 > 2,10) y pide otro marco en El
     edificio. Sin errores de consola.
   - 1326 tests en verde. **feature-26 cerrada.**

## Criterios nuevos (a validar)

- K-CER.1: la «planta baja» es la planta 0. Las demás plantas sobre rasante llevan la general.
- K-CER.2: con dos tipos, cada uno se comprueba entero, sin ponderar por superficie (HE1-predim
  comprueba U elemento a elemento).
- K-CER.3: el espesor del aislante no cambia los valores acústicos del CEC. Lo confirma K-CER.7.
- K-CER.4 a K-CER.15: los fija la verificación (tabla final). K-CER.14 está decidido: la
  corrección se aplica a todos los proyectos.

## Fuera de alcance

- Varias cubiertas: El edificio tiene un solo tipo de cubierta.
- Cerramientos por orientación o por planta (salvo la planta baja), y medianerías por tipo (siguen
  en HR y SI 2).
- Suelos en contacto con el aire exterior (soportales) y lucernarios.
