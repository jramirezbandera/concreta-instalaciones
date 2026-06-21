# Área 5 — Estrategia de Producto, Mercado y SEO

Investigación I+D para app web de predimensionado de instalaciones CTE para arquitectos españoles.

**Producto:** herramienta de mesa (desk tool) simple/visual/rápida para predimensionado de instalaciones + ficha justificativa CTE. NO compite con CYPE/HULC en modelado completo. App hermana "Concreta estructura" del mismo equipo.

**Metodología:** WebSearch + WebFetch (junio 2026). Cada afirmación marca soporte (alto/medio/bajo) y fuentes. Cifras estimadas vs verificadas marcadas explícitamente. Escéptico por defecto: lo no verificable se marca como suposición.

**Aviso transversal sobre volumen de keywords:** Google Keyword Planner y herramientas de pago (Semrush/Ahrefs) están gated y no fueron accesibles en esta sesión. Por tanto, TODAS las afirmaciones sobre volumen de búsqueda concreto son ESTIMACIONES de baja confianza basadas en señales indirectas (existencia de múltiples calculadoras compitiendo por el término, número de artículos, foros). Validar con Keyword Planner antes de decidir.

---

## 1. PANORAMA COMPETITIVO

### [A5-01] CYPE ha migrado a suscripción "CYPE one"; el predimensionado de instalaciones está dentro de un suite caro y pesado
- **Afirmación:** CYPE (CYPECAD MEP, CYPEHVAC, CYPEPLUMBING, CYPEFIRE, CYPELEC, módulos CYPETHERM) opera hoy mayoritariamente bajo suscripción anual "CYPE one", con planes desde ~64 €/usuario/mes (≈768 €/año, perfil MEP specialist) hasta ~125 €/usuario/mes para perfiles avanzados. Es una solución BIM/Open BIM completa de cálculo y modelado, no una desk tool de predimensionado rápido.
- **Soporte:** alto
- **Fuente(s):** https://shop.cype.com/es/ (planes "CYPE one": 64€/89€/125€ usuario/mes, pago anual); https://shop.cype.com/es/software/cypecad-mep/ ; https://www.orientanet.es/cuanto-cuesta-la-licencia-de-cypecad/
- **Nota:** El rango de licencia perpetua/módulos CYPECAD MEP que cita un tercero (1.260 €–6.300 €) es de soporte medio (no verificado en shop.cype directamente; el shop empuja suscripción). La fricción de CYPE (curva de aprendizaje, modelado completo, precio) es precisamente el hueco para una desk tool.

### [A5-02] CYPETHERM HE Plus es GRATUITO y reconocido oficialmente por el Ministerio para HE1/HE0/HE4 — esto es una amenaza directa al Tier1-HE1
- **Afirmación:** CYPETHERM HE Plus es una herramienta gratuita de CYPE, reconocida por el Ministerio para la Transición Ecológica y por el Ministerio de Fomento, que cubre la justificación reglamentaria de CTE DB HE1 (demanda), HE0 (consumo), HE4 (renovables ACS) y la certificación energética. Las funciones core son gratis; solo la certificación con medidas de mejora requiere pago.
- **Soporte:** alto
- **Fuente(s):** https://info.cype.com/es/software/cypetherm-he-plus/ ; histórico convenio CSCAE-CYPE para HE1 (uniones.cype.es/cscae_he1.htm, hoy redirige a CYPETHERM HE Plus)
- **Nota:** IMPLICACIÓN ESTRATÉGICA FUERTE. HE1 ya tiene una herramienta gratuita, oficial y consolidada del líder de mercado. Competir en HE1 como gancho es difícil: o se ofrece algo radicalmente más rápido/simple para predimensionado (no certificación final), o se prioriza HE1 por debajo de módulos donde no hay regalo oficial equivalente. Cuestiona la inclusión de HE1 en Tier1 como prioridad alta.

### [A5-03] HULC (oficial, gratuito) es la herramienta de referencia para HE1/certificación pero es pesada, anticuada y no orientada a predimensionado
- **Afirmación:** HULC (Herramienta Unificada LIDER-CALENER), creada en 2016, es de uso prácticamente obligado/oficial para verificación HE y certificación en residencial y terciario pequeño/mediano. Limitación reconocida: no emite resultados directos que permitan analizar estrategias de reducción de consumo ni el comportamiento de instalaciones; UX anticuada y lenta.
- **Soporte:** alto
- **Fuente(s):** https://www.codigotecnico.org/Programas/HerramientaUnificadaLIDERCALENER.html ; https://www.certicalia.com/blog/hulc-herramienta-unificada-lider-calener
- **Nota:** Refuerza A5-02: el espacio HE1 está doblemente ocupado por herramientas oficiales gratuitas (HULC + CYPETHERM HE Plus). El hueco real ahí es "predimensionar rápido antes de meterse en HULC", no sustituir HULC.

### [A5-04] Existe un competidor casi idéntico al modelo propuesto: Normatia (calculadoras CTE gratuitas + tier de pago "Proyectos" + API)
- **Afirmación:** Normatia.com ofrece exactamente el modelo de "calculadora CTE gratuita como gancho SEO": calculadoras de ventilación HS3 (habitable y no habitable), riesgo de rayo SUA8, transmitancia térmica U (HE), escaleras/rampas SUA, VEEI HE3, más herramientas de localización (zona climática, zona radón, viento, nieve, sísmica). Tiene navegación a "Precios" y "Proyectos" (freemium con tier de pago) y expone API REST + MCP Server.
- **Soporte:** alto
- **Fuente(s):** https://normatia.com/es/recursos/ ; https://normatia.com/es/recursos/calculadora/ventilacion-habitable/ ; https://normatia.com/es/recursos/calculadora/riesgo-rayo/
- **Nota:** COMPETIDOR DIRECTO MÁS RELEVANTE de la sesión. Ya cubre HS3, SUA8 y radón como calculadoras gratis con SEO. El diferenciador del producto debe ser: (a) ficha justificativa CTE completa/exportable de calidad superior, (b) predimensionado de instalaciones (dimensionar tuberías/conductos/cuadros, no solo verificar caudales), (c) integración con la app hermana de estructura. La existencia de Normatia VALIDA la demanda del modelo pero ELIMINA la ventaja de "primer movimiento" en varios términos clave.

### [A5-05] El mercado de calculadoras CTE gratis gratuitas está poblado: konstruir, certificadosenergeticos, INGESCO, Casals, teoriadeconstruccion, etc.
- **Afirmación:** Para los términos gancho propuestos ya compiten múltiples herramientas gratuitas: HS3 (konstruir.com, teoriadeconstruccion.net, Casals, Normatia, garcigas), SUA8/pararrayos (Normatia, konstruir.com, INGESCO Calculus —gratis—, AT3W), radón HS6 (generadores de memoria justificativa de COACM, EasyCTE, certificadosenergeticos). Varios son fabricantes (Casals, INGESCO, AT3W) que regalan la calculadora para vender producto físico.
- **Soporte:** alto
- **Fuente(s):** http://konstruir.com/C.T.E/ ; https://www.ingesco.com/en/ingesco-calculus ; https://www.casals.com/es/herramientas-de-ventilacion/ ; https://teoriadeconstruccion.net/blog/calculos/calculadora-hs3-calidad-del-aire-interior/ ; https://www.coacm.es/es/7-Recursos/1-CTE/7-DB-HS
- **Nota:** El gancho "calculadora X gratis" no es un océano azul. La barra de calidad para destacar en SEO es alta (contenido y herramienta deben ser mejores que páginas establecidas). La defensibilidad NO está en la calculadora sino en lo aguas abajo (ficha + predimensionado + suite).

### [A5-06] DesignBuilder/EnergyPlus es una categoría aparte (simulación dinámica avanzada), no compite con desk tool
- **Afirmación:** DesignBuilder (interfaz sobre EnergyPlus) se vende por paquetes/módulos (Arquitectura, Ingeniería Lite/Plus/Pro) vía distribuidor (Aurea Consulting en España), licencia individual o en red, 1–3 años; orientado a simulación energética avanzada de consultores. No es desk tool de predimensionado ni de papeleo CTE.
- **Soporte:** medio
- **Fuente(s):** https://ecoeficiente.es/comprar-designbuilder/ ; https://ecoeficiente.es/licencias-profesionales/
- **Nota:** Precio profesional no público (cotización por distribuidor; solo se verifica versión estudiante 60 €+IVA/año, descuento 50% educativo). Confirma que el segmento "simulación pesada" está cubierto y NO es el target.

### [A5-07] Plataformas de validación/checker (VerificaciónCTE, BIM checkers) y servicios de apoyo (EasyCTE) son adyacentes, no sustitutos
- **Afirmación:** VerificaciónCTE valida proyectos (PDF/DWG/Excel/IFC) contra el CTE; EasyCTE (marca de acro arquitectos S.L.P., desde 2003/2009) es servicio de apoyo a equipos + reventa de CYPE con descuento. Son adyacentes: validan o externalizan, no predimensionan rápido en mesa.
- **Soporte:** medio
- **Fuente(s):** https://www.verificacioncte.es/blog/guia-completa-cte-2024 ; https://easycte.com/
- **Nota:** Posible canal/partner (EasyCTE ya revende CYPE; podría revender o integrar la desk tool). Estimación de oportunidad de partnership, sin validar.

---

## 2. MERCADO

### [A5-08] Hay ~50.000 arquitectos colegiados en España, repartidos en 30 colegios
- **Afirmación:** El número de arquitectos colegiados en España es "casi cincuenta mil", organizados en 30 Colegios Oficiales de Arquitectos y 2 Consejos autonómicos bajo el CSCAE.
- **Soporte:** medio
- **Fuente(s):** https://www.cscae.com/index.php/cscae ("de seis Colegios iniciales… treinta Colegios con casi cincuenta mil arquitectos"); corroboración indirecta: encuesta del barómetro con >6.800 arquitectos = "1 de cada 7" → ~47.600 (https://www.cscae.com/index.php/los-colegios-arquitectos/estadistica-y-barometro)
- **Nota:** Cifra de orden de magnitud (no un dato anual exacto verificado en registro). El colegiado total NO equivale a usuarios potenciales de pago: hay que descontar asalariados, no ejercientes, jubilados, paro. El TAM realista de "arquitectos que firman proyectos CTE con regularidad" es probablemente bastante menor (estimación: 15.000–30.000; SIN fuente directa). Validar con barómetro CSCAE.

### [A5-09] El paro/precariedad histórica del colectivo limita la disposición a pagar
- **Afirmación:** Los arquitectos han figurado entre los colectivos titulados con mayor tasa de desempleo en España (citas de ~23,5% en datos INE post-crisis, hoy probablemente menor tras recuperación del sector).
- **Soporte:** bajo
- **Fuente(s):** https://www.archdaily.cl/cl/766614/arquitectos-tercer-colectivo-con-mayor-tasa-de-desempleo-en-espana ; https://www.meneame.net/story/32-los-arquitectos-esta-paro
- **Nota:** Datos antiguos (2014–2015) y no aplicables a 2026 sin actualizar. Implicación: sensibilidad al precio alta; favorece freemium y tickets bajos (decenas de €, no cientos). Tratar como contexto, no como dato actual.

### [A5-10] El sector edificación se ha recuperado: 119.601 viviendas visadas obra nueva en 2024, 35,3 M m², +7% interanual
- **Afirmación:** En 2024 se visaron 119.601 viviendas de planta nueva en España; la superficie visada (obra nueva + rehabilitación) alcanzó 35.317.479 m², +7% vs 2023 — los mejores datos del sector desde 2019.
- **Soporte:** alto
- **Fuente(s):** https://www.cscae.com/index.php/cscae/sala-de-comunicacion/8868-el-ano-2024-arroja-los-mejores-datos-del-sector-de-la-edificacion-en-espana-desde-2019 ; informe de visado 2024 (https://visados.arquitectosgrancanaria.es/2025/01/31/250131_estadisticas_visado/)
- **Nota:** Cada proyecto visado requiere justificación CTE de instalaciones → volumen recurrente de "fichas" generables. Proxy útil de tamaño del problema (cientos de miles de fichas HS/HE/SUA/HR al año entre todos los proyectos). Verificado a nivel agregado.

### [A5-11] Disposición a pagar: benchmarks SaaS AEC sugieren tolerancia a tickets bajos-medios mensuales/anuales
- **Afirmación:** En SaaS AEC español/internacional conviven precios bajos (SketchUp 109–639 €/año; herramientas IA tipo Maket ~29 USD/mes, Spacely ~15 USD/mes) y altos (AutoCAD ~2.342 €/año; CYPE one 768–1.500 €/año). El predimensionado-desk-tool encaja en el rango bajo-medio (decenas de €/mes o 1–3 €/ficha), por debajo de las suites de cálculo.
- **Soporte:** medio
- **Fuente(s):** https://cedreo.com/es/blog/mejores-programas-arquitectura/ ; https://www.javadex.es/blog/mejores-herramientas-ia-arquitectura-ingenieria-construccion-aec-ranking-2026 ; A5-01
- **Nota:** No hay dato directo de "WTP por una ficha CTE". Estimación por analogía de pricing del mercado. La referencia mental del arquitecto será "vs gratis (HULC/Normatia/CYPETHERM HE Plus)" y "vs el coste de mi tiempo", no "vs CYPE".

---

## 3. SEO PARA NICHOS TÉCNICOS

### [A5-12] La estrategia "calculadora X CTE" como gancho es válida y demostradamente usada — pero ya saturada en los términos top
- **Afirmación:** La táctica de calculadora gratuita CTE como lead magnet SEO está validada por la práctica del sector (Normatia, konstruir, fabricantes) y por la literatura B2B SaaS (calculadoras interactivas convierten mucho mejor que PDFs estáticos; +70% de conversión vs contenido estático en algunos casos). Funciona especialmente bien para deal sizes > ~5k USD; para tickets bajos hay que apoyarse en volumen.
- **Soporte:** alto (táctica) / bajo (volumen concreto de los términos)
- **Fuente(s):** https://www.poweredbysearch.com/blog/lead-magnet-b2b-carthook-calculator/ ; https://www.postdigitalist.xyz/blog/lead-magnets-b2b-saas-semantic-authority ; A5-04, A5-05
- **Nota:** El volumen de "calculadora radón CTE", "cálculo ventilación HS3", etc. NO se pudo medir (Keyword Planner gated). Señal indirecta de demanda: que existan 4–6 calculadoras compitiendo por cada término sugiere demanda real pero también competencia establecida.

### [A5-13] Intención de búsqueda dominante en estos términos es informacional/transaccional-de-herramienta, no de compra — implica embudo largo
- **Afirmación:** Los términos long-tail técnicos ("cómo calcular HS6 radón", "ejemplo cálculo HS3", "cálculo pararrayos SU8") tienen intención de "resolver una tarea YA, gratis". El usuario que llega no quiere comprar; quiere calcular. La monetización exige convertir esa sesión gratuita en ficha de pago / cuenta, lo que requiere un gancho de valor muy claro en el momento del resultado ("tienes el cálculo → genera la ficha justificativa lista para visar por X €").
- **Soporte:** medio
- **Fuente(s):** patrón observado en resultados (certificadosenergeticos, konstruir, Normatia ofrecen el cálculo gratis y monetizan aparte); literatura lead magnet (A5-12)
- **Nota:** Inferencia razonada, no medición. El punto de conversión natural es la FICHA/MEMORIA exportable (ver A5-19), no la calculadora.

### [A5-14] Oportunidad SEO real: secciones nuevas/menos servidas (HS6 radón, SUA8 rayo) donde el contenido oficial es escaso y la confusión alta
- **Afirmación:** HS6 (radón, introducido en CTE 2019) genera confusión documentada y demanda de "cómo cumplir/justificar"; varios colegios (COACM) y blogs publican generadores de memoria. Es un nicho más joven y menos saturado por herramientas pulidas que HS3/HE1, lo que lo hace mejor candidato a gancho SEO diferencial.
- **Soporte:** medio
- **Fuente(s):** https://easycte.com/nuevo-db-hs-6/ ; https://www.certicalia.com/blog/nuevo-hs6-gas-radon ; https://blog.deltoroantunez.com/2022/10/herramientas-cumplimiento-HS-6.html ; https://observatorioedificacion.es/temas/el-calculo-para-cumplir-db-hs-6l-calculo-para-cumplir-db-hs-6/
- **Nota:** Coincide con la designación de HS6 como "gancho SEO" en la propuesta (Tier2). Lo respalda. Pero ojo: Normatia ya tiene zona-radón y HS3; validar qué falta exactamente (probablemente la barrera/dimensionado completo + ficha, no solo el mapa de zonas).

### [A5-15] Long-tail técnico + datos de localización (zona climática, zona radón, viento, nieve) es un activo SEO compuesto reutilizable
- **Afirmación:** Las herramientas de localización por municipio (zona climática CTE, zona radón, sobrecarga de nieve, zona eólica, sísmica) generan páginas long-tail municipio×parámetro de altísimo volumen agregado y bajo coste de mantenimiento. Normatia ya lo explota. Es un patrón SEO programático probado en el nicho.
- **Soporte:** medio
- **Fuente(s):** https://normatia.com/es/recursos/ (tablas por municipio de zona climática, radón, viento, nieve, sísmica)
- **Nota:** Estimación de valor SEO por analogía (SEO programático municipio-level). Recomendable replicar/superar como base de tráfico, alimentando luego las calculadoras y la ficha.

---

## 4. MODELOS DE PRICING

### [A5-16] El modelo dominante validado en el nicho es freemium: cálculo/verificación gratis + ficha/proyecto/funciones premium de pago
- **Afirmación:** El patrón que funciona en este nicho concreto es: motor de cálculo y verificación gratuitos (para SEO y captación), monetizando en (a) generación/exportación de la ficha-memoria justificativa, (b) guardar/gestionar proyectos, (c) funciones avanzadas/API. Lo siguen Normatia (calculadoras free + "Proyectos"/"Precios" + API) y CYPETHERM HE Plus (core gratis, certificación con mejoras de pago).
- **Soporte:** alto
- **Fuente(s):** https://normatia.com/es/recursos/ ; https://info.cype.com/es/software/cypetherm-he-plus/
- **Nota:** Pricing de Normatia exacto no verificado (página /precios no inspeccionada en esta sesión; existe). Recomendación: validar tier y precio de Normatia como benchmark directo antes de fijar el propio.

### [A5-17] El "pago por ficha/proyecto" es un modelo coherente con la frecuencia de uso del arquitecto y reduce fricción de compromiso
- **Afirmación:** Para un colectivo sensible al precio y de uso intermitente (proyectos esporádicos), un modelo de pago por ficha/proyecto (créditos) o suscripción ligera de bajo ticket reduce la barrera frente a la suscripción anual cara de CYPE. Encaja con tickets bajos del mercado (A5-11).
- **Soporte:** bajo
- **Fuente(s):** inferencia de A5-09, A5-11; práctica de créditos en herramientas IA AEC (Spacely, PromeAI) (https://www.javadex.es/blog/...)
- **Nota:** Estimación sin fuente directa de pay-per-ficha en CTE. Híbrido recomendado a testear: free (calcular) → pay-per-ficha (1–3 €/ficha) → suscripción que desbloquea fichas ilimitadas + multi-módulo + guardado. Suscripción para usuarios frecuentes, créditos para esporádicos.

### [A5-18] El bundling con la app hermana "Concreta estructura" es palanca de pricing y retención
- **Afirmación:** Ofrecer un bundle "Concreta estructura + Concreta instalaciones" (o suscripción única que cubra ambas) aumenta el LTV, diferencia frente a CYPE (que también bundlea, pero caro/pesado) y aprovecha base de usuarios existente del mismo equipo.
- **Soporte:** bajo
- **Fuente(s):** suposición estratégica; no se localizó información pública verificable de "Concreta estructura" (no indexada de forma identificable en esta búsqueda)
- **Nota:** Estimación sin fuente directa. La existencia y tracción de "Concreta estructura" debe confirmarse internamente; si tiene base de usuarios, es el mejor canal de lanzamiento (cross-sell, A5-22).

---

## 5. PRIORIZACIÓN DE MÓDULOS

### [A5-19] CUESTIONAMIENTO del orden: HE1 NO debería ir primero por estar regalado oficialmente; HS3/HS5 son mejor cabeza de Tier1
- **Afirmación:** Dado que HE1 ya tiene dos herramientas oficiales gratuitas y consolidadas (HULC y CYPETHERM HE Plus, A5-02/A5-03), priorizar HE1 como módulo de entrada es subóptimo: alto coste de modelar (demanda energética es complejo y autocontenido-débil: depende de geometría/cerramientos completos) y baja diferenciación. En cambio HS3 (ventilación) y HS5 (saneamiento/evacuación) son cálculos más acotados, autocontenidos, fáciles de predimensionar y con dolor real de "papeleo" — mejores para validar el modelo desk-tool + ficha.
- **Soporte:** medio
- **Fuente(s):** A5-02, A5-03 (HE1 regalado); A5-04/A5-05 (HS3 ya tiene demanda probada por nº de calculadoras compitiendo); criterio demanda×facilidad×autocontenido
- **Nota:** Recomendación: orden sugerido Tier1 = HS3 → HS5 → HS4 → (HE1 al final del Tier1 o degradado), porque HE1 compite contra "gratis oficial" y es el más difícil de modelar bien. HE1 puede aportar SEO ("calculadora transmitancia U", "VEEI") aunque la certificación final se ceda a HULC/CYPETHERM.

### [A5-20] HS6 (radón) confirmado como buen gancho SEO Tier2 por nicho joven y confusión normativa; SUA8 (rayo) es fácil y autocontenido pero ya tiene calculadoras
- **Afirmación:** HS6 radón puntúa alto en "facilidad de gancho SEO" (nicho joven, dolor de comprensión, A5-14) aunque su demanda de búsqueda absoluta sea menor que HS3. SUA8 (riesgo de rayo) es el cálculo MÁS autocontenido y fácil de toda la lista (fórmula Ne/Na cerrada), buen primer "win" técnico, pero ya está muy servido por calculadoras gratis (Normatia, INGESCO, konstruir, AT3W) → bajo diferencial salvo por la ficha.
- **Soporte:** medio
- **Fuente(s):** A5-05, A5-14; http://konstruir.com/C.T.E/SU-8...
- **Nota:** SUA8 como ejercicio de validación técnica/MVP rápido (barato de construir), no como ventaja competitiva. Diferenciación en ambos = ficha justificativa exportable lista para visado.

### [A5-21] Tier3 (DB-SI incendios, HE0/HE4/HE5) acertado como "caro/después": alta complejidad, menor encaje con desk-tool de predimensionado
- **Afirmación:** DB-SI (incendios) y HE0/HE4/HE5 son los más complejos de modelar y los que más se solapan con el dominio de suites pesadas (CYPEFIRE, CYPETHERM). Posicionarlos en Tier3 (tarde y a mayor precio) es coherente con la estrategia de empezar por lo autocontenido y barato de construir.
- **Soporte:** medio
- **Fuente(s):** A5-01, A5-06; criterio de complejidad de modelado
- **Nota:** Valida el orden propuesto en Tier3. REBT/RITE (complementarios) coherentes como "después", dado que son reglamentos extensos y mejor servidos por software especializado (iMventa TeKton3D, CYPE).

---

## 6. GO-TO-MARKET

### [A5-22] La app hermana "Concreta estructura" es el canal de lanzamiento de mayor ROI (cross-sell a base existente)
- **Afirmación:** El canal más eficiente para los primeros usuarios es la base de "Concreta estructura" (mismo equipo): cross-sell, bundle y prueba social compartida. Reduce CAC frente a captación fría de arquitectos.
- **Soporte:** bajo
- **Fuente(s):** suposición estratégica (no se verificó públicamente la tracción de Concreta estructura, A5-18)
- **Nota:** Estimación sin fuente. Depende de que Concreta estructura tenga usuarios activos. Confirmar internamente.

### [A5-23] Los Colegios de Arquitectos (30 COAs + CSCAE) son canal de distribución y credibilidad; CYPE ya lo explotó con convenios
- **Afirmación:** Los COAs ofrecen formación, recursos y convenios a colegiados; son canal de credibilidad y distribución. Precedente: el convenio CSCAE–CYPE para facilitar HE1 (hoy CYPETHERM HE Plus) y los generadores de memoria de COACM (radón). Conseguir presencia en recursos/formación de COAs da alcance y sello de confianza.
- **Soporte:** medio
- **Fuente(s):** convenio CSCAE-CYPE (uniones.cype.es/cscae_he1.htm → CYPETHERM HE Plus); https://www.coacm.es/es/7-Recursos/1-CTE/7-DB-HS ; formación COA Valencia DesignBuilder (https://arquitectosdevalencia.es/...)
- **Nota:** CYPE ya tiene relación privilegiada con CSCAE → competir por convenio nacional es difícil; más realista empezar por COAs territoriales (formación, webinars, recursos) y boca a boca.

### [A5-24] La ficha justificativa CTE es el diferenciador defendible y el punto de monetización — no la calculadora
- **Afirmación:** Dado que el cálculo está comoditizado y regalado (A5-05, A5-16), la ventaja defendible es la FICHA/MEMORIA justificativa de calidad, completa, actualizada a la versión vigente del CTE, exportable y "lista para visar". Es lo que el arquitecto valora (papeleo) y lo más caro de replicar bien (mantenimiento normativo continuo). Es también el evento de conversión natural del embudo SEO.
- **Soporte:** medio
- **Fuente(s):** patrón de monetización Normatia ("Proyectos"/fichas) y CYPE Memorias CTE; literatura lead magnet (el valor está en el resultado accionable, A5-12)
- **Nota:** Inferencia estratégica respaldada por el comportamiento de competidores. El moat real = (1) actualización normativa continua, (2) calidad/aceptación de la ficha en visado, (3) suite multi-módulo + estructura. La velocidad/UX de "predimensionar en mesa" es el gancho de adquisición; la ficha es la retención y el cobro.

### [A5-25] Canales digitales: SEO programático + contenido técnico + comunidad (foros, redes) son el motor de adquisición de bajo CAC
- **Afirmación:** Para un ticket bajo y un colectivo técnico, la adquisición rentable es orgánica: SEO programático (municipio×parámetro, A5-15), calculadoras-gancho (A5-12), contenido técnico de calidad (cómo justificar X), y presencia en comunidades del sector (Foros Sólo Arquitectura, Arquiparados, LinkedIn, YouTube tutoriales). El boca a boca entre arquitectos es fuerte en un gremio pequeño (~50k).
- **Soporte:** medio
- **Fuente(s):** comunidades activas observadas (https://www.soloarquitectura.com/foros/ ; https://www.arquiparados.com/) ; tutoriales HULC/CYPE en foros; literatura SEO/lead magnet (A5-12)
- **Nota:** El tamaño reducido del colectivo (A5-08) hace que el boca a boca y la reputación pesen mucho: una ficha rechazada en visado o un cálculo erróneo se difunde rápido. Calidad normativa = supervivencia, no solo feature.

---

## SÍNTESIS DE IMPLICACIONES (resumen accionable)

1. **El hueco existe pero está parcialmente ocupado** por Normatia (calculadoras + ficha + freemium). El diferencial debe ser predimensionado real de instalaciones + ficha superior + suite con estructura, no "otra calculadora más".
2. **Repriorizar Tier1:** HS3/HS5 antes que HE1 (HE1 compite contra herramientas oficiales gratuitas y es el más caro de modelar).
3. **Freemium es el modelo correcto:** calcular gratis (SEO), cobrar por la ficha/proyecto (créditos) + suscripción para frecuentes; bundle con Concreta estructura.
4. **La ficha justificativa es el moat y el cobro**, no la calculadora. Su valor depende del mantenimiento normativo continuo.
5. **GTM:** arrancar por base de Concreta estructura + COAs territoriales + SEO programático + comunidades; el boca a boca pesa en un gremio de ~50k.
6. **Pendiente de validar con datos de pago:** volumen de keywords (Keyword Planner), pricing exacto de Normatia, TAM real de arquitectos ejercientes de pago, tracción de Concreta estructura.
