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
6. **Fichas y memoria**: cada ficha cita el tipo con su código y su página del CEC, por ejemplo
   «F1 · SATE sobre LP ½ pie (CEC F 4.1, p. 64)». El mismo nombre en HE1, HR y HS1.
7. **Tests**:
   - un proyecto sin `cerramientos` da el mismo veredicto que hoy en HE1, HR y HS1;
   - en HE1, la U por capas de cada fachada frente a la del CEC;
   - casos con la planta baja distinta;
   - capturas de El edificio y de HE1 con dos fachadas.

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
