# Concreta Instalaciones — Idea de producto

> App web de cálculo y justificación de **instalaciones de edificación** y cumplimiento del **CTE**
> para arquitectos españoles. Misma filosofía que Concreta (estructura): herramienta de mesa,
> simple, visual, rápida. **No es CYPE ni HULC**: es el predimensionado rápido + la ficha
> justificativa lista para pegar en la memoria del proyecto.

---

## 1. Encuadre estratégico

En estructura se compite contra CYPE/SAP. En instalaciones la competencia real es:

- **HULC / CYPETHERM / DesignBuilder** — pesados, oficiales, lentos (energía).
- **Hojas de Excel caseras** — fontanería, ventilación, saneamiento, incendios.
- **El propio CTE en PDF** + calculadora — predimensionados.

**El hueco:** el predimensionado rápido **+ la ficha justificativa** lista para la memoria.
El arquitecto no quiere modelar el edificio entero; quiere *"este patinillo de ventilación,
¿cumple HS3? dame el número y el papel"*. Ese es el producto.

### Valor diferencial (transversal a todos los módulos)

1. **Ficha justificativa autogenerada.** El cliente no paga por el número, paga por **no
   escribir la justificación del CTE**. Cada módulo exporta un PDF con: datos de entrada,
   referencia al artículo/tabla del DB, el cálculo y el veredicto. Se pega tal cual en la
   memoria. (Reutilizar el motor de export PDF de Concreta estructura.)
2. **Visual primero.** Render SVG en vivo de planta/sección/esquema con el elemento crítico
   en rojo. Sello de Concreta; casi nadie lo ofrece bien en instalaciones.
3. **Velocidad de mesa.** Cero modelado del edificio entero: entras un local/tramo/cerramiento,
   sale el número. "Desk tool, not CYPE" aplicado a instalaciones.

---

## 2. Módulos

### Tier 1 — Empezar aquí (mejor relación valor/esfuerzo)

Cálculos cerrados, repetitivos, hoy en Excel feo, encajan perfecto con "live SVG + checker".

#### HS3 — Ventilación / Calidad del aire interior
- **Qué hace:** caudales de ventilación por estancia (l/s) según ocupación y tipo de local;
  dimensionado de aberturas de admisión/extracción; conductos verticales; aspiradores
  híbridos/mecánicos.
- **Valor:** de los cálculos más repetitivos en vivienda. Render SVG de la vivienda con flechas
  de flujo (admisión salones/dormitorios → extracción cocinas/baños) y checker verde/rojo por
  estancia. Salida = ficha HS3 directa.

#### HS4 — Suministro de agua (fontanería)
- **Qué hace:** dimensionado de la red; caudales instantáneos con simultaneidad (K); diámetros
  de tramos; pérdida de carga; comprobación de presión en el grifo más desfavorable; necesidad
  de grupo de presión.
- **Valor:** esquema isométrico/columna en vivo con el tramo crítico en rojo. Excel aquí es muy
  doloroso; un visual interactivo gana solo.

#### HS5 — Evacuación de aguas (saneamiento)
- **Qué hace:** unidades de desagüe (UD); diámetros de derivaciones; botes sifónicos; bajantes
  y colectores; pendientes mínimas; ventilación de la red.
- **Valor:** las tablas de UD del HS5 son tediosas; automatizarlas + esquema de bajantes con
  diámetros es valor inmediato.

#### HE1 — Cálculo de transmitancia U + condensaciones
- **Qué hace:** transmitancia U de cerramientos por capas; comprobación contra valores límite
  por zona climática; condensaciones (Glaser); puentes térmicos. (No replicar HULC: solo el
  predimensionado de envolvente.)
- **Valor:** el cálculo de U por capas con render de la sección del muro + verificación Glaser
  es un clásico que casi todo el mundo hace mal en Excel. Autocontenido y muy demandado.

### Tier 2 — Diferenciadores baratos (gancho marketing/SEO)

Cortos, poco conocidos, se justifican con una ficha.

#### HS6 — Protección frente al radón
- **Qué hace:** consulta del nivel de zona (municipio/zona I–II); nivel de protección exigido;
  comprobación de la solución (barrera, espacio ventilado).
- **Valor:** **nuevo y poco conocido**, mucha gente aún no lo justifica bien. "Calculadora radón
  CTE" = diferenciación + SEO.

#### SUA8 — Riesgo de rayo
- **Qué hace:** cálculo de Ne/Na → necesidad de pararrayos y nivel de protección.
- **Valor:** cálculo cerrado, corto, que casi nadie recuerda hacer y se justifica con una ficha.
  Módulo MVP barato.

#### Extras SUA / HR
- **SUA1:** geometría de escaleras (huella-tabica, 2C+H), rampas y pendientes, protección de
  huecos. **SUA4:** iluminación mínima.
- **HR (acústica):** opción simplificada de aislamiento a ruido aéreo/impacto entre recintos,
  masa de particiones. La opción simplificada del DB-HR encaja perfecto con tablas + checker.

### Tier 3 — Premio gordo pero caro (cuando haya tracción)

Alto valor, alta complejidad de modelar.

#### DB-SI — Seguridad en caso de incendio
- **Qué hace:** cálculo de ocupación (SI3); anchos de evacuación y recorridos; sectorización y
  superficie máxima de sector; resistencia al fuego exigida (EI/REI); dotación de instalaciones
  (RIPCI).
- **Valor:** ocupación y recorridos de evacuación sobre esquema de planta = altísimo valor
  visual. Módulo "estrella" potencial, pero el más complejo de modelar bien.

#### HE0/HE1 completo + HE4/HE5
- **HE4:** contribución de renovables a ACS / demanda de ACS por nº de personas.
- **HE5:** dimensionado mínimo de fotovoltaica obligatoria.
- **HE0:** limitación de consumo energético (no replicar HULC).

### Complementario (fuera de CTE pero obligatorio)

#### REBT — Electricidad (Baja Tensión)
- **Qué hace:** previsión de cargas (grado de electrificación vivienda, ITC-BT-10); secciones de
  conductores por intensidad/caída de tensión; protecciones.
- **Valor:** cubre la electricidad que el CTE no contempla; muy demandado.

#### RITE — Instalaciones térmicas
- Climatización, ACS, ventilación. Relacionado con HE2.

---

## 3. Priorización recomendada

Orden por **(demanda × facilidad de modelar × autocontenido)**:

| Tier | Módulos | Por qué |
|------|---------|---------|
| **1** | HS3, HS4, HS5, HE1 (U + Glaser) | Cerrados, repetitivos, hoy en Excel, encajan con live SVG + checker |
| **2** | HS6 radón, SUA8 rayo (+ SUA1, HR) | Cortos, poco conocidos, gancho SEO/marketing |
| **3** | DB-SI incendios, HE0/HE1 completo | Alto valor, alta complejidad — esperar a tener tracción |

**Primer módulo a construir:** **HS3 ventilación** o **HE1 cálculo de U** (mejor relación
valor/esfuerzo).

---

## 4. Normativa de referencia

- **CTE — Documentos Básicos:**
  - DB-HE Ahorro de energía (HE0, HE1, HE2→RITE, HE3 iluminación, HE4 ACS renovable, HE5 FV)
  - DB-HS Salubridad (HS1 humedad, HS2 residuos, HS3 ventilación, HS4 agua, HS5 saneamiento,
    HS6 radón)
  - DB-HR Protección frente al ruido
  - DB-SI Seguridad en caso de incendio (SI1–SI6)
  - DB-SUA Seguridad de utilización y accesibilidad (incl. SUA4 iluminación, SUA8 rayo)
- **Reglamentos asociados:**
  - RITE — Instalaciones Térmicas en Edificios
  - REBT — Reglamento Electrotécnico de Baja Tensión (+ ITCs)
  - RIPCI — Instalaciones de Protección Contra Incendios
  - ICT — Infraestructuras Comunes de Telecomunicaciones

---

## 5. Stack sugerido (reutilizar Concreta)

React 19 + Vite · Tailwind CSS v4 · React Router · lucide-react · jsPDF + svg2pdf.js · PWA
estática. Mismo sistema de theming (light/dark) y motor de export PDF con ficha justificativa.

---

## 6. Próximos pasos para la sesión de trabajo

1. Elegir el primer módulo (recomendado: HS3 o HE1).
2. Redactar su SPECS.md: entradas, fórmulas/tablas del DB exactas, render SVG, checkers.
3. Definir el formato de la ficha justificativa PDF (plantilla común a todos los módulos).
4. Prototipo del módulo elegido.
