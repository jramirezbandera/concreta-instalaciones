// =============================================================================
// DB-HE1 — "Condiciones para el control de la demanda energética". MOTOR DE
// CÁLCULO del predimensionado de la ENVOLVENTE TÉRMICA (por elemento).
//
// Función PURA y DETERMINISTA (SPEC §4): `calcHE1(inputs): HE1Result`, sin
// React/DOM, sin Date.now/Math.random. Mismo input → mismo output (requisito de
// snapshots). Opera en IEEE-754 doble SIN redondear: el redondeo es solo de
// presentación (vive en la UI/ficha, no aquí). No lanza excepciones: detecta
// fallos y los reporta en `warnings[]` degradando el veredicto.
//
// Todas las cifras normativas provienen de ./tablas.ts (envueltas en TablaCTE
// con procedencia). Nunca se hardcodean cifras dispersas en esta lógica.
//
// FORMA POR-ELEMENTO (cf. HS3, NO árbol/grafo): la entrada es un array de
// cerramientos INDEPENDIENTES (muro, cubierta, hueco, …), cada uno por CAPAS de
// interior a exterior. El motor NO usa src/lib/cte/grafo.ts (no hay topología de
// red); solo reutiliza de allí el helper genérico `peor(a,b)` para componer
// veredictos. Para cada cerramiento calcula:
//   1) Transmitancia U = 1/RT (RT = Rsi + ΣRi + Rse) vs Ulim (Tabla 3.1.1.a).
//   2) Condensación superficial fRsi = 1 − U·0,25 (Rsi=0,25 FIJO) vs fRsi,min.
//   3) Condensación intersticial (Glaser, mes de enero, binario predimensionado).
//   4) Puentes térmicos H_PT = Σ(ψ·L) — INFORMATIVO (ψ §10 pendiente, conf. BAJA).
//
// Unidades canónicas (src/lib/units/types.ts): W/m²K (U, Ulim), m²K/W (R, Rsi,
// Rse, RT), W/(m·K) (λ, ψ), m (espesores/longitudes), Pa (presión de vapor), °C
// (temperaturas), % (humedad relativa), W/K (H_PT). Los campos llevan SUFIJO DE
// UNIDAD en su nombre.
//
// =============================================================================
// CONTRATO DE INTEGRACIÓN con svg-meta.ts y ficha.ts (Fase 3, EN PARALELO):
//
//  - `svg-meta.ts` EXPORTARÁ, como ÚNICA fuente de verdad (igual patrón que
//    hs4/svg-meta.ts — metadatos + geometría SIN JSX, para no romper
//    `react-refresh/only-export-components` en svg.tsx):
//        export const HE1_PDF_SVG_ID = "he1-svg-pdf";
//        export function he1NativeSize(
//          result: HE1Result,
//        ): { nativeW: number; nativeH: number };
//    El literal del id es EXACTAMENTE  "he1-svg-pdf"  (alineado con el patrón
//    "hs3/hs4/hs5-svg-pdf"). ui.tsx montará el clon oculto del HE1SVG (modo
//    'pdf') con ESE mismo id; renderFicha lo busca en el DOM por ese id.
//
//  - `ficha.ts` IMPORTARÁ ambos desde "./svg-meta":
//        import { HE1_PDF_SVG_ID, he1NativeSize } from "./svg-meta";
//    NO los redefine: evita deriva entre el raster del SVG y el `scale` del PDF.
//
//  - El SVG consume de cada `ResultadoCerramientoHE1`:
//      • `capas` (espesor_m + λ/R efectivos + material) → SECCIÓN del cerramiento
//        por capas (anchos proporcionales al espesor, etiqueta λ por capa).
//      • `u_W_m2K` / `ulim_W_m2K` / `uMaxFRsi_W_m2K` / `estado` → BARRA "U vs
//        límite" MULTICANAL (pinta U contra el MÁS restrictivo de Ulim y
//        U_max_fRsi; rojo si U lo supera). La medianería (UMD) tiene Ulim real
//        (= UT) y se pinta como un elemento normal. `ulim_W_m2K=null` (hoy ningún
//        elemento) ⇒ "no aplica": rama defensiva, no se pintaría línea de Ulim.
//      • `glaser` (arrays `posicionSd`, `temperatura_C`, `psat_Pa`, `pvapor_Pa`,
//        `condensa` + `condensaIntersticial`) → DIAGRAMA de presiones de vapor /
//        saturación de Glaser (eje X = Sd acumulado normalizado; dos curvas
//        Psat/Pvapor; marca las interfaces donde `condensa`).
//      • `id` (estable) para enlazar SVG ↔ ficha ↔ UI.
//    La FICHA consume: `id`/`nombre`/`tipoElemento`, `capas` (datos de partida con
//    origen), `rt_m2K_W`/`u_W_m2K`/`ulim_W_m2K`/`margenU`/`cumpleU`,
//    `fRsi`/`fRsiMin`/`cumpleFRsi`/`uMaxFRsi_W_m2K`, `glaser.condensaIntersticial`,
//    `hPuentes_W_K`, `estado`/`motivo`; y globales `zonaClimatica`,
//    `veredictoGlobal`, `warnings`.
//
//  - CONGELADO (esta fase congela el contrato): `HE1Inputs`, `HE1Result`,
//    `ResultadoCerramientoHE1` y subtipos (incl. la forma de `glaser`), el literal
//    `HE1_PDF_SVG_ID = "he1-svg-pdf"` y la firma de `he1NativeSize`, y los nombres
//    de los tipos exportados de este archivo NO cambian tras esta fase. Las 3
//    tareas paralelas de la Fase 3 (svg, ficha, tests) dependen de este contrato.
// =============================================================================

import type { Veredicto } from "../../lib/pdf/renderFicha";
import { peor } from "../../lib/cte/grafo";
import type {
  ClaseHigrometria,
  DireccionFlujo,
  MaterialDifusion,
  MaterialReferencia,
  TipoElemento,
  TipoEncuentroPT,
  ZonaClimatica,
} from "./tablas";
import {
  CAMARA_AIRE_SIN_VENTILAR_R,
  CONDICIONES_DEFECTO,
  fRsiMinDe,
  lambdaDe,
  muDe,
  psiDe,
  PSAT_MAGNUS,
  rsiRseDe,
  RSI_CONDENSACION_m2K_W,
  ulimDe,
} from "./tablas";

// -----------------------------------------------------------------------------
// MODELO DE ENTRADA — cerramientos independientes, cada uno por capas.
// -----------------------------------------------------------------------------

/**
 * Una capa del cerramiento (de interior a exterior). El motor resuelve λ y µ por
 * este orden de preferencia (el valor explícito PREVALECE sobre la tabla):
 *   térmico:   `resistencia_m2K_W` (cámara/lámina con R directa) > `lambda_W_mK`
 *              explícito > λ de tabla por `material`.
 *   difusión:  `sd_m` (barrera de vapor con Sd declarado) > `mu` explícito >
 *              µ de tabla por `materialDifusion`/`material`.
 */
export interface CapaInput {
  /** Identificador estable de la capa (lo consume el SVG para la sección). */
  id: string;
  /** Nombre legible para UI/ficha (p.ej. "Aislante XPS"). */
  nombre?: string;
  /**
   * Clave del material de referencia (CEC) para AUTOCOMPLETAR λ (y µ si no se da
   * `materialDifusion`). ORIENTATIVO — sustituible por el dato del fabricante.
   */
  material?: MaterialReferencia;
  /**
   * Clave del material para AUTOCOMPLETAR µ (difusión al vapor) si difiere de la
   * clave térmica. Si se omite, se intenta derivar de `material`.
   */
  materialDifusion?: MaterialDifusion;
  /** Espesor de la capa [m]. */
  espesor_m: number;
  /**
   * λ explícita [W/(m·K)]. Si se da, PREVALECE sobre el λ de tabla del material.
   * Ignorada si la capa declara `resistencia_m2K_W` (cámara de aire / R directa).
   */
  lambda_W_mK?: number;
  /**
   * Resistencia térmica DIRECTA [m²K/W] (cámara de aire sin ventilar, lámina con
   * R conocida): si se da, la capa aporta esta R y NO se usa espesor/λ para el
   * término térmico. (El espesor sigue usándose para dibujar la sección.)
   */
  resistencia_m2K_W?: number;
  /** µ explícito (adimensional). Si se da, PREVALECE sobre el µ de tabla. */
  mu?: number;
  /**
   * Sd declarado [m] (barrera de vapor / lámina). Si se da, la capa aporta este
   * Sd al método Glaser y NO se usa µ·e. Para una barrera, usar el Sd del producto.
   */
  sd_m?: number;
}

/** Un cerramiento (elemento de la envolvente) con sus capas, de interior a exterior. */
export interface CerramientoInput {
  /** Identificador estable (lo consume SVG/ficha/UI). */
  id: string;
  /** Nombre legible (p.ej. "Muro de fachada"). */
  nombre: string;
  /** Tipo de elemento (indexa Ulim en la Tabla 3.1.1.a). */
  tipoElemento: TipoElemento;
  /** Sentido del flujo de calor (selecciona Rsi/Rse y el perfil de temperaturas). */
  direccionFlujo: DireccionFlujo;
  /**
   * `true` ⇒ el cerramiento da a un espacio NO habitable / partición interior:
   * usa la Tabla 6 (Rsi=Rse por flujo), no la Tabla 1 exterior. Por defecto
   * `false` salvo para `contacto_no_habitable_terreno`, donde se asume `true`.
   */
  caraInterior?: boolean;
  /** Capas del cerramiento, de INTERIOR a EXTERIOR. */
  capas: CapaInput[];
  /**
   * Encuentros (puentes térmicos lineales) asociados al cerramiento, para el
   * H_PT informativo. ψ §10 PENDIENTE de verificación literal (confianza BAJA).
   */
  puentes?: PuenteInput[];
}

/** Un encuentro lineal (puente térmico) asociado a un cerramiento. */
export interface PuenteInput {
  /** Tipo de encuentro (DA DB-HE/3, ψ orientativo). */
  tipo: TipoEncuentroPT;
  /** Longitud del encuentro [m]. */
  longitud_m: number;
}

export interface HE1Inputs {
  /** Cerramientos independientes de la envolvente (cada uno por capas). */
  cerramientos: CerramientoInput[];
  /** Zona climática de INVIERNO (dato climático): indexa Ulim y fRsi,min. */
  zonaClimatica: ZonaClimatica;
  /** Clase de higrometría del espacio interior (default vivienda = clase ≤3). */
  claseHigrometria: ClaseHigrometria;
  /**
   * Temperatura interior de cálculo [°C]. Si se omite, el default del DA DB-HE/2
   * (`CONDICIONES_DEFECTO`, 20 °C).
   */
  tempInterior_C?: number;
  /**
   * HR interior [%]. Si se omite, la del DA DB-HE/2 por clase de higrometría
   * (55 / 62 / 70 %).
   */
  hrInterior_pct?: number;
  /**
   * Temperatura exterior del mes de ENERO [°C]. DATO CLIMÁTICO de entrada (Anejo
   * del DB-HE), NO una constante del DA. Sin defecto razonado no hay condensación
   * realista: si se omite se usa un valor conservador con aviso.
   */
  tempExteriorEnero_C?: number;
  /**
   * HR exterior del mes de enero [%]. DATO CLIMÁTICO; si se omite, el default
   * informativo del DA DB-HE/2 (`hrExteriorDefecto_pct`, ~85 %) con aviso.
   */
  hrExterior_pct?: number;
}

// -----------------------------------------------------------------------------
// FORMA DEL RESULTADO
// -----------------------------------------------------------------------------

/** Una capa RESUELTA (λ/R/µ/Sd efectivos): la consume la sección del SVG y la ficha. */
export interface ResultadoCapaHE1 {
  id: string;
  /** Nombre legible (de la capa o derivado del material). */
  nombre: string;
  /** Clave del material térmico usada (`null` si se dio λ/R explícitos sin material). */
  material: MaterialReferencia | null;
  /** Espesor efectivo [m]. */
  espesor_m: number;
  /** λ efectiva usada [W/(m·K)]; `null` si la capa aporta R directa (cámara/lámina). */
  lambda_W_mK: number | null;
  /** Resistencia térmica efectiva de la capa [m²K/W] (e/λ, o R directa). */
  resistencia_m2K_W: number;
  /** µ efectivo usado (adimensional); `null` si la capa usa Sd declarado. */
  mu: number | null;
  /** Sd efectivo de la capa [m] (µ·e, o Sd declarado). */
  sd_m: number;
  /** `true` si λ/µ provienen de la tabla orientativa (CEC), no de dato explícito. */
  lambdaOrientativa: boolean;
  /** `true` si µ/Sd provienen de la tabla orientativa (CEC), no de dato explícito. */
  muOrientativo: boolean;
}

/**
 * Sub-resultado del método de Glaser por cerramiento (mes de enero). Los arrays
 * van por INTERFAZ, de interior a exterior, e incluyen los dos ambientes (cara
 * interior tras Rsi y cara exterior tras Rse) y las caras de cada capa. Todos los
 * arrays tienen la MISMA longitud `N = nCapas + 1` (interfaces entre ambientes y
 * capas) y están alineados por índice. El SVG dibuja el diagrama con estos arrays.
 */
export interface ResultadoGlaserHE1 {
  /**
   * Sd acumulado NORMALIZADO en cada interfaz [0..1] (eje X del diagrama): 0 en la
   * cara interior, 1 en la exterior. Útil para situar las curvas a escala de Sd.
   */
  posicionSd: number[];
  /** Sd acumulado SIN normalizar en cada interfaz [m]. */
  posicionSd_m: number[];
  /** Temperatura en cada interfaz [°C], de interior a exterior. */
  temperatura_C: number[];
  /** Presión de vapor de SATURACIÓN Psat(θ) en cada interfaz [Pa]. */
  psat_Pa: number[];
  /** Presión de vapor REAL (reparto lineal con Sd) en cada interfaz [Pa]. */
  pvapor_Pa: number[];
  /** `true` en las interfaces donde Pvapor ≥ Psat (condensa). */
  condensa: boolean[];
  /** `true` si hay condensación intersticial en ALGUNA interfaz (mes de enero). */
  condensaIntersticial: boolean;
  /** Sd total del cerramiento [m]. */
  sdTotal_m: number;
}

/** Resultado por cerramiento: alimenta el SVG (sección + barra U + Glaser) y la ficha. */
export interface ResultadoCerramientoHE1 {
  id: string;
  nombre: string;
  tipoElemento: TipoElemento;
  direccionFlujo: DireccionFlujo;
  /** Capas resueltas (λ/R/µ/Sd efectivos), de interior a exterior. */
  capas: ResultadoCapaHE1[];
  /** Resistencia superficial interior usada para U/Glaser [m²K/W] (Tabla 1/6 DA/1). */
  rsi_m2K_W: number;
  /** Resistencia superficial exterior usada para U/Glaser [m²K/W]. */
  rse_m2K_W: number;

  // --- Transmitancia (Tabla 3.1.1.a) -----------------------------------------
  /** Resistencia térmica total RT = Rsi + ΣRi + Rse [m²K/W]. */
  rt_m2K_W: number;
  /** Transmitancia térmica U = 1/RT [W/m²K]. */
  u_W_m2K: number;
  /** Ulim de la zona/tipo [W/m²K]; `null` si no aplica (hoy ningún elemento). */
  ulim_W_m2K: number | null;
  /** Margen = Ulim − U [W/m²K] (positivo = holgura); `null` si Ulim no aplica. */
  margenU: number | null;
  /** `true` si U ≤ Ulim (o si Ulim no aplica: `true` informativo, rama defensiva). */
  cumpleU: boolean;

  // --- Condensación superficial (DA DB-HE/2) ---------------------------------
  /** Factor de temperatura superficial interior fRsi = 1 − U·0,25 (adimensional). */
  fRsi: number;
  /** fRsi,min exigido por clase de higrometría y zona (adimensional). */
  fRsiMin: number;
  /** `true` si fRsi ≥ fRsi,min. */
  cumpleFRsi: boolean;
  /** U máxima por condensación superficial U_max_fRsi = (1 − fRsi,min)/0,25 [W/m²K]. */
  uMaxFRsi_W_m2K: number;

  // --- Condensación intersticial (Glaser, enero) -----------------------------
  glaser: ResultadoGlaserHE1;

  // --- Puentes térmicos (informativo) ----------------------------------------
  /** H_PT = Σ(ψ·L) del cerramiento [W/K]; `null` si no se declararon puentes. */
  hPuentes_W_K: number | null;

  /** Peor veredicto de las verificaciones REALES del cerramiento (U + fRsi + Glaser). */
  estado: Veredicto;
  /** Motivo/justificación de la base de cálculo (RT/U vs Ulim, fRsi, Glaser). */
  motivo: string;
  /** Notas informativas (puentes pendientes, R de cámara orientativa, …). */
  notas: string[];
}

export interface HE1Result {
  /** Zona climática de invierno usada (dato climático). */
  zonaClimatica: ZonaClimatica;
  /** Clase de higrometría del espacio interior usada. */
  claseHigrometria: ClaseHigrometria;
  /** Temperatura interior de cálculo efectiva [°C]. */
  tempInterior_C: number;
  /** HR interior efectiva [%]. */
  hrInterior_pct: number;
  /** Temperatura exterior de enero efectiva (dato climático) [°C]. */
  tempExteriorEnero_C: number;
  /** HR exterior efectiva (dato climático) [%]. */
  hrExterior_pct: number;
  /** Resultado por cerramiento, en el orden de entrada. */
  porCerramiento: ResultadoCerramientoHE1[];
  /**
   * Veredicto global = peor de los veredictos REALES de los cerramientos. La
   * medianería (UMD) compara U vs su Ulim (= UT) como cualquier elemento. Solo un
   * elemento sin Ulim (hoy ninguno) sería neutral en U y arrastraría fRsi/Glaser.
   */
  veredictoGlobal: Veredicto;
  /** Avisos de rango/normativos / pendientes (mensajes en español, sin Zod). */
  warnings: string[];
}

// -----------------------------------------------------------------------------
// DEFAULTS — muro de fachada multicapa (ejemplo del research, zona D, flujo
// horizontal) que da CUMPLE en U (≈0,384 ≤ 0,41), CUMPLE en fRsi y SIN
// condensación intersticial en enero; + una cubierta plana y un hueco, para que
// el caso ilustre los 3 tipos de verificación. Vivienda → clase 3 o inferior.
//
// Muro (research §BLOQUE 3): enfoscado 15 mm · LP 115 mm · XPS 60 mm · cámara
// 30 mm (R directa) · LH 70 mm · enlucido 15 mm. RT ≈ 2,606 → U ≈ 0,384 W/m²K.
// -----------------------------------------------------------------------------
export const he1Defaults: HE1Inputs = {
  zonaClimatica: "D",
  claseHigrometria: "clase_3_o_inferior",
  // θe/φe de enero: dato climático orientativo de una localidad de zona D.
  tempExteriorEnero_C: 5,
  hrExterior_pct: 85,
  cerramientos: [
    {
      id: "muro-fachada",
      nombre: "Muro de fachada (½ pie + XPS + cámara + tabique)",
      tipoElemento: "muro_suelo_exterior",
      direccionFlujo: "horizontal",
      capas: [
        { id: "muro-enlucido", nombre: "Enlucido de yeso", material: "enlucido_yeso", espesor_m: 0.015 },
        { id: "muro-tabique", nombre: "Tabique LH", material: "ladrillo_ceramico_hueco", materialDifusion: "ladrillo_ceramico", espesor_m: 0.07 },
        {
          id: "muro-camara",
          nombre: "Cámara de aire sin ventilar (30 mm)",
          materialDifusion: "camara_aire_sin_ventilar",
          espesor_m: 0.03,
          // R directa de cámara sin ventilar, flujo horizontal (Tabla 2 DA/1).
          resistencia_m2K_W: CAMARA_AIRE_SIN_VENTILAR_R.datos.r_m2K_W.horizontal,
        },
        { id: "muro-xps", nombre: "Aislante XPS (60 mm)", material: "xps", espesor_m: 0.06 },
        { id: "muro-lp", nombre: "Ladrillo perforado LP (½ pie)", material: "ladrillo_ceramico_perforado", materialDifusion: "ladrillo_ceramico", espesor_m: 0.115 },
        { id: "muro-enfoscado", nombre: "Enfoscado de mortero", material: "mortero_cemento", espesor_m: 0.015 },
      ],
      puentes: [
        { tipo: "frente_forjado", longitud_m: 3 },
        { tipo: "contorno_hueco", longitud_m: 5 },
      ],
    },
    {
      id: "cubierta-plana",
      nombre: "Cubierta plana invertida",
      tipoElemento: "cubierta_exterior",
      direccionFlujo: "ascendente",
      capas: [
        { id: "cub-enlucido", nombre: "Enlucido de yeso", material: "enlucido_yeso", espesor_m: 0.015 },
        { id: "cub-forjado", nombre: "Forjado de hormigón", material: "hormigon_armado", espesor_m: 0.25 },
        { id: "cub-barrera", nombre: "Barrera de vapor (lámina)", materialDifusion: "barrera_vapor", espesor_m: 0.002, lambda_W_mK: 0.23, sd_m: 50 },
        { id: "cub-xps", nombre: "Aislante XPS (100 mm)", material: "xps", espesor_m: 0.1 },
        { id: "cub-mortero", nombre: "Mortero de pendientes", material: "mortero_cemento", espesor_m: 0.05 },
      ],
      puentes: [{ tipo: "fachada_cubierta", longitud_m: 12 }],
    },
    {
      id: "ventana-salon",
      nombre: "Ventana de salón (doble acristalamiento)",
      tipoElemento: "hueco",
      direccionFlujo: "horizontal",
      // El hueco se predimensiona por su U declarada (marco+vidrio): una sola
      // "capa" con R directa que reproduce la U del conjunto (1/U − Rsi − Rse).
      // Con U≈1,4: R_capa = 1/1,4 − 0,13 − 0,04 = 0,5443 m²K/W. fRsi = 1 −
      // 1,4·0,25 = 0,65 ≥ fRsi,min(D)=0,61 → CUMPLE también la superficial.
      capas: [
        {
          id: "ventana-conjunto",
          nombre: "Acristalamiento bajo emisivo + marco (U declarada ≈ 1,4 W/m²K)",
          espesor_m: 0.024,
          resistencia_m2K_W: 0.5443,
          mu: 1_000_000, // vidrio/marco: prácticamente impermeable al vapor.
        },
      ],
      puentes: [{ tipo: "contorno_hueco", longitud_m: 6 }],
    },
  ],
};

// -----------------------------------------------------------------------------
// HELPERS PUROS
// -----------------------------------------------------------------------------

/** Espesor efectivo de una capa [m] (no negativo; 0 si no finito). */
function espesorDe(c: CapaInput): number {
  return Number.isFinite(c.espesor_m) && c.espesor_m >= 0 ? c.espesor_m : 0;
}

/**
 * Presión de vapor de saturación Psat(θ) [Pa] por la fórmula de Magnus de dos
 * ramas (DA DB-HE/2, ec. [3] θ≥0 / [4] θ<0). Coeficientes desde `PSAT_MAGNUS`
 * (NO hardcodeados aquí).
 */
function psat_Pa(theta_C: number): number {
  const m = PSAT_MAGNUS.datos;
  const rama = theta_C >= 0 ? m.positiva : m.negativa;
  return m.p0_Pa * Math.exp((rama.a * theta_C) / (rama.b_C + theta_C));
}

/**
 * Resuelve λ/R/µ/Sd efectivos de una capa según el orden de preferencia
 * (explícito > tabla). No lanza: una capa sin datos térmicos válidos aporta R=0.
 */
function resolverCapa(c: CapaInput): ResultadoCapaHE1 {
  const espesor_m = espesorDe(c);

  // --- Término térmico (R efectiva) ------------------------------------------
  let lambda_W_mK: number | null = null;
  let resistencia_m2K_W = 0;
  let lambdaOrientativa = false;

  if (Number.isFinite(c.resistencia_m2K_W) && (c.resistencia_m2K_W as number) >= 0) {
    // R directa (cámara de aire / lámina con R conocida): no se usa e/λ.
    resistencia_m2K_W = c.resistencia_m2K_W as number;
    lambda_W_mK = null;
  } else {
    // e/λ con λ explícita (prevalece) o λ de tabla por material (orientativa).
    if (Number.isFinite(c.lambda_W_mK) && (c.lambda_W_mK as number) > 0) {
      lambda_W_mK = c.lambda_W_mK as number;
    } else if (c.material) {
      lambda_W_mK = lambdaDe(c.material);
      lambdaOrientativa = true;
    } else {
      lambda_W_mK = null;
    }
    resistencia_m2K_W =
      lambda_W_mK != null && lambda_W_mK > 0 ? espesor_m / lambda_W_mK : 0;
  }

  // --- Término de difusión al vapor (µ / Sd efectivos) -----------------------
  let mu: number | null = null;
  let sd_m = 0;
  let muOrientativo = false;

  if (Number.isFinite(c.sd_m) && (c.sd_m as number) >= 0) {
    // Sd declarado (barrera de vapor): no se usa µ·e.
    sd_m = c.sd_m as number;
    mu = null;
  } else {
    if (Number.isFinite(c.mu) && (c.mu as number) >= 0) {
      mu = c.mu as number;
    } else {
      const claveDifusion = c.materialDifusion ?? materialDifusionDe(c.material);
      if (claveDifusion) {
        mu = muDe(claveDifusion);
        muOrientativo = true;
      } else {
        mu = null;
      }
    }
    sd_m = mu != null && mu >= 0 ? mu * espesor_m : 0;
  }

  return {
    id: c.id,
    nombre: c.nombre ?? c.material ?? c.id,
    material: c.material ?? null,
    espesor_m,
    lambda_W_mK,
    resistencia_m2K_W,
    mu,
    sd_m,
    lambdaOrientativa,
    muOrientativo,
  };
}

/**
 * Mapea una clave de material térmico (CEC) a su clave de difusión equivalente
 * cuando coinciden por nombre; `null` si no hay correspondencia directa (el
 * usuario debe dar `materialDifusion` o `mu`/`sd_m`). Conservador: solo mapea
 * las claves que existen idénticas en `MaterialDifusion`.
 */
function materialDifusionDe(material: MaterialReferencia | undefined): MaterialDifusion | null {
  switch (material) {
    case "hormigon_armado":
      return "hormigon_armado";
    case "mortero_cemento":
    case "mortero_cemento_denso":
      return "mortero_cemento";
    case "placa_yeso_laminado":
      return "placa_yeso_laminado";
    case "ladrillo_ceramico_perforado":
    case "ladrillo_ceramico_hueco":
      return "ladrillo_ceramico";
    case "ladrillo_ceramico_macizo":
      return "ladrillo_macizo";
    case "eps":
      return "eps";
    case "xps":
      return "xps";
    case "pur_pir":
      return "pur_pir";
    case "lana_mineral":
      return "lana_mineral";
    case "madera_densidad_media":
      return "madera";
    default:
      // enlucido_yeso, hormigon_masa, bloque_hormigon, baldosa, betún…:
      // sin clave de difusión directa → el motor pedirá µ explícito si hace falta.
      return null;
  }
}

// -----------------------------------------------------------------------------
// MOTOR
// -----------------------------------------------------------------------------

export function calcHE1(inp: HE1Inputs): HE1Result {
  const warnings: string[] = [];
  const cd = CONDICIONES_DEFECTO.datos;

  // --- Condiciones de cálculo efectivas (defaults del DA DB-HE/2) ------------
  const tempInterior_C = Number.isFinite(inp.tempInterior_C)
    ? (inp.tempInterior_C as number)
    : cd.tempInterior_C;
  const hrInterior_pct = Number.isFinite(inp.hrInterior_pct)
    ? (inp.hrInterior_pct as number)
    : cd.hrInterior_pct[inp.claseHigrometria];

  // θe/φe de ENERO son DATO CLIMÁTICO de entrada (Anejo DB-HE), no del DA.
  let tempExteriorEnero_C: number;
  if (Number.isFinite(inp.tempExteriorEnero_C)) {
    tempExteriorEnero_C = inp.tempExteriorEnero_C as number;
  } else {
    // Sin dato climático: 0 °C conservador (mes frío) con aviso explícito.
    tempExteriorEnero_C = 0;
    warnings.push(
      "Temperatura exterior de enero no aportada: se usa 0 °C (valor conservador). " +
        "Es un DATO CLIMÁTICO de la localidad (Anejo del DB-HE); aporta el valor real.",
    );
  }
  let hrExterior_pct: number;
  if (Number.isFinite(inp.hrExterior_pct)) {
    hrExterior_pct = inp.hrExterior_pct as number;
  } else {
    hrExterior_pct = cd.hrExteriorDefecto_pct;
    warnings.push(
      `HR exterior de enero no aportada: se usa ${cd.hrExteriorDefecto_pct} % (default informativo, ` +
        "confianza media). Es un DATO CLIMÁTICO de la localidad; aporta el valor real.",
    );
  }

  // Aviso único sobre los ψ orientativos (afecta a todo H_PT del informe).
  const algunPuente = inp.cerramientos.some((c) => (c.puentes?.length ?? 0) > 0);
  if (algunPuente) {
    warnings.push(
      "Puentes térmicos (H_PT): los ψ usados son ORIENTATIVOS (DA DB-HE/3, §10 PENDIENTE de " +
        "verificación literal, confianza BAJA). El H_PT es INFORMATIVO; no determina CUMPLE/NO CUMPLE.",
    );
  }

  const porCerramiento: ResultadoCerramientoHE1[] = [];
  let veredictoGlobal: Veredicto = "neutral";

  for (const cer of inp.cerramientos) {
    const r = calcularCerramiento(
      cer,
      inp.zonaClimatica,
      inp.claseHigrometria,
      tempInterior_C,
      hrInterior_pct,
      tempExteriorEnero_C,
      hrExterior_pct,
      warnings,
    );
    porCerramiento.push(r);
    veredictoGlobal = peor(veredictoGlobal, r.estado);
  }

  return {
    zonaClimatica: inp.zonaClimatica,
    claseHigrometria: inp.claseHigrometria,
    tempInterior_C,
    hrInterior_pct,
    tempExteriorEnero_C,
    hrExterior_pct,
    porCerramiento,
    veredictoGlobal,
    warnings,
  };
}

// -----------------------------------------------------------------------------
// Cálculo por cerramiento (U + fRsi + Glaser + H_PT).
// -----------------------------------------------------------------------------
function calcularCerramiento(
  cer: CerramientoInput,
  zona: ZonaClimatica,
  clase: ClaseHigrometria,
  tempInterior_C: number,
  hrInterior_pct: number,
  tempExteriorEnero_C: number,
  hrExterior_pct: number,
  warnings: string[],
): ResultadoCerramientoHE1 {
  const notas: string[] = [];

  // --- Capas resueltas (λ/R/µ/Sd efectivos) ---------------------------------
  const capas = cer.capas.map(resolverCapa);

  // Avisos por capa sin datos térmicos / R de cámara orientativa.
  for (let i = 0; i < cer.capas.length; i++) {
    const cIn = cer.capas[i];
    const cOut = capas[i];
    if (cOut.resistencia_m2K_W === 0 && cIn.resistencia_m2K_W === undefined) {
      warnings.push(
        `Cerramiento "${cer.id}", capa "${cOut.id}": sin λ ni R válidos (R=0). ` +
          "Indica un material, una λ o una R directa (cámara de aire).",
      );
    }
    if (cIn.resistencia_m2K_W !== undefined) {
      notas.push(
        `Capa "${cOut.id}": R directa ${cOut.resistencia_m2K_W} m²K/W (cámara/lámina; ` +
          "valor de la Tabla 2 DA DB-HE/1 orientativo o declarado).",
      );
    }
  }

  // --- Resistencias superficiales (Tabla 1 exterior / Tabla 6 interior) -------
  // Por defecto, contacto con no habitable/terreno usa Tabla 6 (ambas caras
  // interiores); el resto, Tabla 1 (exterior). Se puede forzar con `caraInterior`.
  const usarInterior =
    cer.caraInterior ?? cer.tipoElemento === "contacto_no_habitable_terreno";
  const sup = rsiRseDe(cer.direccionFlujo, usarInterior);
  const rsi_m2K_W = sup.rsi_m2K_W;
  const rse_m2K_W = sup.rse_m2K_W;

  // --- Transmitancia U = 1/RT (RT = Rsi + ΣRi + Rse) -------------------------
  const sumaRi = capas.reduce((acc, c) => acc + c.resistencia_m2K_W, 0);
  const rt_m2K_W = rsi_m2K_W + sumaRi + rse_m2K_W;
  // RT siempre ≥ Rsi+Rse > 0; U finita y positiva.
  const u_W_m2K = rt_m2K_W > 0 ? 1 / rt_m2K_W : Number.POSITIVE_INFINITY;

  // --- Veredicto de transmitancia vs Ulim (Tabla 3.1.1.a) --------------------
  const ulim_W_m2K = ulimDe(cer.tipoElemento, zona);
  let margenU: number | null = null;
  let cumpleU: boolean;
  let estadoU: Veredicto;
  if (ulim_W_m2K === null) {
    // Rama DEFENSIVA: ningún tipo de la Tabla 3.1.1.a devuelve hoy Ulim null
    // (la medianería UMD comparte fila con UT). Si alguna vez se añadiera un
    // elemento sin límite, se trataría como "no aplica" (estado neutral, no
    // contamina el veredicto). INERTE con las tablas actuales.
    cumpleU = true;
    estadoU = "neutral";
    notas.push(
      "Elemento sin Ulim en la Tabla 3.1.1.a-HE1 (no aplica el veredicto de transmitancia).",
    );
  } else {
    margenU = ulim_W_m2K - u_W_m2K;
    cumpleU = u_W_m2K <= ulim_W_m2K;
    estadoU = cumpleU ? "ok" : "fail";
  }

  // --- Condensación superficial: fRsi = 1 − U·0,25 (Rsi=0,25 FIJO) -----------
  // ⚠️ 0,25 es el Rsi FIJO de la comprobación de fRsi, NO el Rsi de la U.
  const fRsi = 1 - u_W_m2K * RSI_CONDENSACION_m2K_W;
  const fRsiMin = fRsiMinDe(clase, zona);
  const cumpleFRsi = fRsi >= fRsiMin;
  const estadoFRsi: Veredicto = cumpleFRsi ? "ok" : "fail";
  // U máxima por condensación superficial: U_max_fRsi = (1 − fRsi,min)/0,25.
  const uMaxFRsi_W_m2K = (1 - fRsiMin) / RSI_CONDENSACION_m2K_W;

  // --- Condensación intersticial (Glaser, mes de enero, binario) -------------
  const glaser = calcularGlaser(
    capas,
    rsi_m2K_W,
    rt_m2K_W,
    tempInterior_C,
    hrInterior_pct,
    tempExteriorEnero_C,
    hrExterior_pct,
  );
  // SIN condensación → ok; CON condensación → warn (revisar), NUNCA fail tajante
  // (el balance anual de evaporación excede el predimensionado por elemento).
  const estadoGlaser: Veredicto = glaser.condensaIntersticial ? "warn" : "ok";
  if (glaser.condensaIntersticial) {
    warnings.push(
      `Cerramiento "${cer.id}": posible condensación intersticial en enero (Glaser). ` +
        "REVISAR: requiere comprobación del balance anual (DA DB-HE/2); el predimensionado " +
        "por mes desfavorable no es un NO CUMPLE definitivo.",
    );
  }

  // --- Puentes térmicos: H_PT = Σ(ψ·L), INFORMATIVO -------------------------
  let hPuentes_W_K: number | null = null;
  if ((cer.puentes?.length ?? 0) > 0) {
    let h = 0;
    for (const p of cer.puentes ?? []) {
      const fila = psiDe(p.tipo);
      const L = Number.isFinite(p.longitud_m) && p.longitud_m >= 0 ? p.longitud_m : 0;
      h += fila.psi_W_mK * L;
    }
    hPuentes_W_K = h;
    notas.push(
      `H_PT = Σ(ψ·L) = ${h.toFixed(3)} W/K (INFORMATIVO; ψ orientativos DA DB-HE/3, §10 pendiente).`,
    );
  }

  // --- Veredicto del cerramiento: peor de las verificaciones REALES ----------
  // U (neutral en medianería) + fRsi + Glaser. El H_PT NO entra (informativo).
  let estado: Veredicto = "neutral";
  estado = peor(estado, estadoU);
  estado = peor(estado, estadoFRsi);
  estado = peor(estado, estadoGlaser);

  // --- Motivo (justificación de la base de cálculo) --------------------------
  const ulimTxt = ulim_W_m2K === null ? "no aplica (medianería)" : `${ulim_W_m2K} W/m²K`;
  const motivo =
    `RT = Rsi(${rsi_m2K_W}) + ΣRi(${sumaRi.toFixed(3)}) + Rse(${rse_m2K_W}) = ` +
    `${rt_m2K_W.toFixed(3)} m²K/W → U = ${u_W_m2K.toFixed(3)} W/m²K · Ulim ${ulimTxt}` +
    (ulim_W_m2K !== null ? ` (${cumpleU ? "CUMPLE" : "NO CUMPLE"})` : "") +
    ` · fRsi = 1 − U·0,25 = ${fRsi.toFixed(3)} ≥ fRsi,min ${fRsiMin} ` +
    `(${cumpleFRsi ? "CUMPLE" : "NO CUMPLE"}) · Glaser enero: ` +
    `${glaser.condensaIntersticial ? "posible condensación (REVISAR)" : "sin condensación"}.`;

  return {
    id: cer.id,
    nombre: cer.nombre,
    tipoElemento: cer.tipoElemento,
    direccionFlujo: cer.direccionFlujo,
    capas,
    rsi_m2K_W,
    rse_m2K_W,
    rt_m2K_W,
    u_W_m2K,
    ulim_W_m2K,
    margenU,
    cumpleU,
    fRsi,
    fRsiMin,
    cumpleFRsi,
    uMaxFRsi_W_m2K,
    glaser,
    hPuentes_W_K,
    estado,
    motivo,
    notas,
  };
}

// -----------------------------------------------------------------------------
// Método de Glaser (DA DB-HE/2) — mes de enero, binario de predimensionado.
//
// Interfaces de interior a exterior: índice 0 = cara interior (tras Rsi), índice
// k = cara exterior de la capa k (k=1..nCapas), índice nCapas = cara exterior
// (tras Rse). N = nCapas + 1 interfaces.
//  - Temperatura: perfil proporcional a la R térmica ACUMULADA (Rsi + ΣR_capa).
//  - Pvapor real: reparto LINEAL con el Sd ACUMULADO (las R superficiales al
//    vapor se desprecian; convención del método).
//  - condensa[k] = Pvapor[k] ≥ Psat[k] (con tolerancia IEEE-754).
// -----------------------------------------------------------------------------
function calcularGlaser(
  capas: ResultadoCapaHE1[],
  rsi_m2K_W: number,
  rt_m2K_W: number,
  tempInterior_C: number,
  hrInterior_pct: number,
  tempExteriorEnero_C: number,
  hrExterior_pct: number,
): ResultadoGlaserHE1 {
  const n = capas.length;
  const N = n + 1; // nº de interfaces (cara interior … cara exterior)

  const sdTotal_m = capas.reduce((acc, c) => acc + c.sd_m, 0);
  const deltaT = tempInterior_C - tempExteriorEnero_C;
  const phiI = hrInterior_pct / 100;
  const phiE = hrExterior_pct / 100;
  const piVapor_Pa = phiI * psat_Pa(tempInterior_C);
  const peVapor_Pa = phiE * psat_Pa(tempExteriorEnero_C);

  const posicionSd: number[] = new Array<number>(N);
  const posicionSd_m: number[] = new Array<number>(N);
  const temperatura_C: number[] = new Array<number>(N);
  const psatArr_Pa: number[] = new Array<number>(N);
  const pvapor_Pa: number[] = new Array<number>(N);
  const condensa: boolean[] = new Array<boolean>(N);

  // Resistencia térmica acumulada para el perfil de temperaturas: arranca tras
  // Rsi (cara interior) y suma cada R de capa; termina en RT − Rse (cara exterior).
  let rAcum = rsi_m2K_W;
  let sdAcum = 0;

  // Tolerancia para no marcar condensación espúria por epsilon de IEEE-754.
  const EPS = 1e-9;

  for (let k = 0; k < N; k++) {
    if (k > 0) {
      // Avanzar a la cara exterior de la capa (k-1): suma su R y su Sd.
      rAcum += capas[k - 1].resistencia_m2K_W;
      sdAcum += capas[k - 1].sd_m;
    }
    // Perfil de temperaturas: proporcional a R acumulada / RT.
    const theta = rt_m2K_W > 0 ? tempInterior_C - (rAcum / rt_m2K_W) * deltaT : tempInterior_C;
    // Reparto lineal de la presión real con el Sd acumulado / Sd total.
    const pvap = sdTotal_m > 0 ? piVapor_Pa - (sdAcum / sdTotal_m) * (piVapor_Pa - peVapor_Pa) : piVapor_Pa;
    const psatK = psat_Pa(theta);

    temperatura_C[k] = theta;
    psatArr_Pa[k] = psatK;
    pvapor_Pa[k] = pvap;
    posicionSd_m[k] = sdAcum;
    posicionSd[k] = sdTotal_m > 0 ? sdAcum / sdTotal_m : k / (N - 1 || 1);
    condensa[k] = pvap >= psatK + EPS;
  }

  const condensaIntersticial = condensa.some((b) => b);

  return {
    posicionSd,
    posicionSd_m,
    temperatura_C,
    psat_Pa: psatArr_Pa,
    pvapor_Pa,
    condensa,
    condensaIntersticial,
    sdTotal_m,
  };
}
