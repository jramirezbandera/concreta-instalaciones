// =============================================================================
// DB-HS6 — "Protección frente al radón". MOTOR DE CÁLCULO del predimensionado
// (Nivel A: clasificación + adecuación de la combinación de soluciones a la zona +
// checklist cualitativo + checks geométricos).
//
// Función PURA y DETERMINISTA (SPEC §4): `calcHS6(inputs): HS6Result`, sin
// React/DOM, sin Date.now/Math.random. Mismo input → mismo output (requisito de
// snapshots). Opera en IEEE-754 doble SIN redondear: el redondeo es solo de
// presentación (vive en la UI/ficha, no aquí). No lanza excepciones: detecta
// fallos y los reporta en `warnings[]` degradando el veredicto.
//
// Todas las cifras normativas provienen de ./tablas.ts (envueltas en TablaCTE con
// procedencia). Nunca se hardcodean cifras dispersas en esta lógica.
//
// FORMA POR-ELEMENTO (cf. HE1, NO árbol/grafo): HS6 es un cálculo CERRADO por local
// en contacto con el terreno; no hay topología de red. El motor NO usa
// src/lib/cte/grafo.ts salvo el helper genérico `peor(a,b)` para componer
// veredictos. La estructura del resultado expone, igual que HE1/HS4
// (`porCerramiento`/`porTramo`), un array `porMedida` con el `estado: Veredicto` +
// `motivo: string` de cada solución, y un `elementoCriticoId` para que el SVG
// resalte la medida que falta o el requisito incumplido.
//
// QUÉ CALCULA (art. 1/2/3 del DB-HS6):
//   1) APLICABILIDAD: ámbito (local habitable en contacto con terreno) + zona ≠
//      sin_exigencia. Si no aplica → veredicto OK/neutral "Sin exigencia HS6".
//   2) NIVEL DE PROTECCIÓN exigido por la zona (Zona I: 1 medida; Zona II: barrera
//      obligatoria + 1 adicional). Tabla REQUISITOS_POR_ZONA.
//   3) ADECUACIÓN de la combinación de soluciones PROPUESTA a la zona (¿suficiente?
//      barrera presente si es obligatoria; nº de medidas válidas ≥ exigido).
//   4) CHECKLIST cualitativo de cada solución presente:
//        · barrera: continuidad sellada + penetraciones selladas + puertas estancas;
//          vía lámina-tipo (coef. difusión ≤ 1e-11 m²/s y espesor ≥ 2 mm).
//        · espacio de contención: ventilación natural por el criterio 10 cm²/ml
//          (área ≥ 10·perímetro) o mecánica (remite a DB-HS3); altura ≥ 5 cm.
//        · despresurización: presencia de los elementos (captación + extracción +
//          geotextil).
//   5) ELEMENTO CRÍTICO: la medida que falta o el requisito incumplido (peor estado).
//   6) veredictoGlobal = peor() de todos los estados. warnings en español.
//
// DIFERIDO (NO implementado): el sub-cálculo cuantitativo de la barrera por difusión
// (E < Elim, "Nivel B"). La vía `calculo` de la barrera se reconoce en los tipos y
// se reporta como PENDIENTE (warn), pero el motor NO evalúa E (la fórmula diverge
// entre fuentes y no está verificada literalmente). El diseño queda preparado para
// añadirla luego sin romper el contrato.
//
// Unidades canónicas (src/lib/units/types.ts): Bq/m³ (concentración), m²/s (coef.
// difusión del radón), mm (espesor de lámina / altura de cámara), cm² (área de
// aberturas), cm²/ml (cm² por metro lineal de perímetro), m (perímetro). Los campos
// llevan SUFIJO DE UNIDAD en su nombre.
// =============================================================================

import type { Veredicto } from "../../lib/pdf/renderFicha";
import { peor } from "../../lib/cte/grafo";
import type {
  TipoSolucionHS6,
  TipoVentilacionContencion,
  ViaJustificacionBarrera,
  ZonaRadon,
} from "./tablas";
import {
  nivelReferenciaRadon_Bq_m3,
  parametrosBarrera,
  parametrosEspacioContencion,
  requisitoDeZona,
} from "./tablas";

// -----------------------------------------------------------------------------
// MODELO DE ENTRADA — el usuario declara la zona, el ámbito del local y las
// soluciones que PROPONE con sus características. Uniones discriminadas por
// `tipo` para que el compilador exija los campos correctos de cada solución.
// -----------------------------------------------------------------------------

/**
 * Barrera de protección PROPUESTA (art. 3.2). El usuario declara el checklist
 * cualitativo (sellados/penetraciones/puertas) y, para la vía simplificada
 * `lamina_tipo`, las características de la lámina (coef. de difusión + espesor).
 */
export interface SolucionBarreraInput {
  readonly tipo: "barrera";
  /** Identificador estable de la medida (lo consume SVG/ficha/UI). */
  readonly id: string;
  /** Nombre legible para UI/ficha. */
  readonly nombre?: string;
  /** Vía de justificación de la barrera. `calculo` (Nivel B) está DIFERIDO. */
  readonly via: ViaJustificacionBarrera;
  /** `true` ⇒ la lámina/membrana forma una capa CONTINUA y SELLADA en su superficie. */
  readonly continuidadSellada: boolean;
  /** `true` ⇒ las PENETRACIONES (tuberías, arquetas, juntas) están selladas. */
  readonly penetracionesSelladas: boolean;
  /** `true` ⇒ las puertas de comunicación con el espacio protegido son estancas. */
  readonly puertasEstancas: boolean;
  /**
   * Coeficiente de difusión del radón de la lámina [m²/s]. Requerido para la vía
   * `lamina_tipo` (umbral ≤ 1e-11 m²/s). Opcional para `calculo` (DIFERIDO).
   */
  readonly coefDifusion_m2_s?: number;
  /**
   * Espesor de la lámina [mm]. Requerido para la vía `lamina_tipo` (mínimo ≥ 2 mm).
   */
  readonly espesor_mm?: number;
}

/**
 * Espacio de contención ventilado PROPUESTO (art. 3.2). Para ventilación NATURAL,
 * el motor verifica el criterio geométrico (área de aberturas ≥ 10 cm²/ml ·
 * perímetro). Para MECÁNICA, remite a DB-HS3 §3.2.1 (informa, no dimensiona aquí).
 */
export interface SolucionEspacioContencionInput {
  readonly tipo: "espacio_contencion";
  /** Identificador estable de la medida. */
  readonly id: string;
  /** Nombre legible para UI/ficha. */
  readonly nombre?: string;
  /** Tipo de ventilación de la cámara. */
  readonly ventilacion: TipoVentilacionContencion;
  /** Perímetro de la cámara de contención [m]. Necesario para el criterio natural. */
  readonly perimetro_m: number;
  /**
   * Área TOTAL de aberturas de ventilación de la cámara [cm²]. Requerida para la
   * ventilación natural (se compara con 10 cm²/ml · perímetro).
   */
  readonly areaAberturas_cm2?: number;
  /** Altura libre de la cámara [mm]. Se compara con el mínimo (≈ 50 mm). */
  readonly alturaCamara_mm?: number;
}

/**
 * Despresurización del terreno PROPUESTA (art. 3.3) — CUALITATIVA. El usuario
 * declara la presencia de los tres elementos del sistema. Solo válida como medida
 * ADICIONAL en Zona II (no como medida única).
 */
export interface SolucionDespresurizacionInput {
  readonly tipo: "despresurizacion";
  /** Identificador estable de la medida. */
  readonly id: string;
  /** Nombre legible para UI/ficha. */
  readonly nombre?: string;
  /** `true` ⇒ hay red de captación embebida en relleno granular (grava) bajo solera. */
  readonly redCaptacion: boolean;
  /** `true` ⇒ hay sistema de extracción mecánica conectado a la red de captación. */
  readonly extraccionMecanica: boolean;
  /** `true` ⇒ hay geotextil de separación. */
  readonly geotextil: boolean;
}

/** Unión discriminada de las soluciones que el usuario puede proponer. */
export type SolucionHS6Input =
  | SolucionBarreraInput
  | SolucionEspacioContencionInput
  | SolucionDespresurizacionInput;

export interface HS6Inputs {
  /**
   * Zona de radón del edificio (Apéndice B): la consulta el proyectista por su
   * municipio. `sin_exigencia` ⇒ municipio no clasificado → HS6 no exige medidas.
   */
  zona: ZonaRadon;
  /**
   * Municipio (PURAMENTE INFORMATIVO, para la ficha). No condiciona el cálculo: la
   * clasificación efectiva es `zona` (el usuario la consulta en el Apéndice B).
   */
  municipio?: string;
  /**
   * Ámbito (art. 1): `true` ⇒ el local es HABITABLE y está en CONTACTO con el
   * terreno (planta baja / sótano / semisótano). `false` ⇒ HS6 no exige medidas
   * (local no habitable o sin contacto con el terreno).
   */
  localHabitableEnContactoConTerreno: boolean;
  /** Soluciones de protección PROPUESTAS por el usuario (con sus características). */
  soluciones: SolucionHS6Input[];
}

// -----------------------------------------------------------------------------
// FORMA DEL RESULTADO
// -----------------------------------------------------------------------------

/** Un requisito (check) cualitativo o geométrico evaluado dentro de una medida. */
export interface RequisitoEvaluado {
  /** Clave estable del requisito (p.ej. "penetraciones-selladas", "ventilacion-natural"). */
  clave: string;
  /** Etiqueta legible para UI/ficha. */
  etiqueta: string;
  /** `ok` si se cumple, `fail` si se incumple, `warn` si pendiente/remitido, `neutral` si N/A. */
  estado: Veredicto;
  /** Detalle/justificación (cita art./tabla de origen). */
  detalle: string;
}

/**
 * Resultado por medida (solución) propuesta: alimenta el SVG (resalta la medida
 * incumplida) y la ficha. Análogo a `ResultadoCerramientoHE1`/`ResultadoTramoHS4`.
 */
export interface ResultadoMedidaHS6 {
  /** Id estable de la medida (enlaza SVG ↔ ficha ↔ UI). */
  id: string;
  /** Nombre legible. */
  nombre: string;
  /** Tipo de solución. */
  tipo: TipoSolucionHS6;
  /** Requisitos (checks) evaluados de esta medida, en orden estable. */
  requisitos: RequisitoEvaluado[];
  /**
   * `true` si la medida es VÁLIDA (cumple sus requisitos exigidos) y por tanto
   * CUENTA para satisfacer el nivel de protección de la zona. Una barrera con la
   * vía DIFERIDA (`calculo`) o con requisitos incumplidos NO cuenta.
   */
  cuenta: boolean;
  /** Peor veredicto de los requisitos de la medida. */
  estado: Veredicto;
  /** Motivo/justificación de la medida (cita art./tabla de origen). */
  motivo: string;
}

export interface HS6Result {
  // --- Contexto (datos de partida con su origen, para la ficha) --------------
  /** Zona de radón usada (Apéndice B). */
  zona: ZonaRadon;
  /** Municipio informativo (si se aportó); `null` si no. */
  municipio: string | null;
  /** Ámbito: `true` si el local es habitable y está en contacto con el terreno. */
  localHabitableEnContactoConTerreno: boolean;
  /** Nivel de referencia de radón usado [Bq/m³] (art. 2). */
  nivelReferencia_Bq_m3: number;

  // --- Aplicabilidad y exigencia ---------------------------------------------
  /**
   * `true` si HS6 EXIGE medidas (ámbito aplica Y zona ≠ sin_exigencia). Si es
   * `false`, el módulo no requiere soluciones (veredicto OK "sin exigencia").
   */
  aplica: boolean;
  /** Razón de no aplicabilidad (`null` si aplica). */
  motivoNoAplica: string | null;
  /** `true` ⇒ la zona exige barrera de protección OBLIGATORIA (Zona II). */
  barreraObligatoria: boolean;
  /** Nº mínimo de medidas exigidas por la zona (0/1/2). */
  nMedidasMin: number;
  /** Descripción legible del nivel de protección exigido (art. 3.1). */
  nivelProteccion: string;

  // --- Adecuación de la combinación propuesta --------------------------------
  /** Nº de medidas propuestas que CUENTAN (válidas) para la zona. */
  nMedidasValidas: number;
  /** `true` si la combinación de soluciones propuesta SATISFACE el nivel de la zona. */
  combinacionSuficiente: boolean;

  // --- Por medida -------------------------------------------------------------
  /** Resultado por medida (solución) propuesta, en orden de entrada. */
  porMedida: ResultadoMedidaHS6[];

  // --- Elemento crítico (para el SVG) ----------------------------------------
  /**
   * Id de la medida del ELEMENTO CRÍTICO (la que falta o el peor requisito
   * incumplido) para que el SVG la resalte; `null` si todo cumple o no aplica. Si
   * falta una medida exigida sin que haya ninguna medida con ese id, vale
   * `"__falta_medida__"` (sentinela: no hay medida propuesta que resaltar).
   */
  elementoCriticoId: string | null;
  /** Descripción del elemento crítico (qué falta o qué requisito se incumple). */
  elementoCritico: string | null;

  // --- Veredicto global -------------------------------------------------------
  /** Peor veredicto de todas las verificaciones (adecuación + por medida). */
  veredictoGlobal: Veredicto;
  /** Avisos de rango/normativos / pendientes (mensajes en español, sin Zod). */
  warnings: string[];
}

/** Sentinela del `elementoCriticoId` cuando FALTA una medida exigida (no hay id que resaltar). */
export const HS6_FALTA_MEDIDA = "__falta_medida__";

// -----------------------------------------------------------------------------
// DEFAULTS — sótano habitable en Zona II que CUMPLE: barrera lámina-tipo
// (coef. difusión 8e-12 ≤ 1e-11 m²/s, espesor 2,5 ≥ 2 mm, todo sellado) + espacio
// de contención ventilado NATURAL bien dimensionado (perímetro 40 m → exige 400 cm²;
// se aportan 480 cm² ≥ 400; altura 80 ≥ 50 mm). Barrera obligatoria de Zona II
// presente y válida + 1 medida adicional válida → combinación SUFICIENTE → CUMPLE.
// -----------------------------------------------------------------------------
export const hs6Defaults: HS6Inputs = {
  zona: "II",
  municipio: "Cáceres",
  localHabitableEnContactoConTerreno: true,
  soluciones: [
    {
      tipo: "barrera",
      id: "barrera-lamina",
      nombre: "Barrera de protección (lámina-tipo sellada)",
      via: "lamina_tipo",
      continuidadSellada: true,
      penetracionesSelladas: true,
      puertasEstancas: true,
      coefDifusion_m2_s: 8e-12,
      espesor_mm: 2.5,
    },
    {
      tipo: "espacio_contencion",
      id: "camara-ventilada",
      nombre: "Espacio de contención ventilado (cámara, ventilación natural)",
      ventilacion: "natural",
      perimetro_m: 40,
      areaAberturas_cm2: 480,
      alturaCamara_mm: 80,
    },
  ],
};

// -----------------------------------------------------------------------------
// HELPERS PUROS
// -----------------------------------------------------------------------------

/** `n` finito y ≥ 0, si no `null` (para validar entradas numéricas). */
function numNoNeg(n: number | undefined): number | null {
  return Number.isFinite(n) && (n as number) >= 0 ? (n as number) : null;
}

/** Nombre legible de una solución (declarado o derivado del id/tipo). */
function nombreDe(s: SolucionHS6Input): string {
  if (s.nombre) return s.nombre;
  switch (s.tipo) {
    case "barrera":
      return "Barrera de protección";
    case "espacio_contencion":
      return "Espacio de contención ventilado";
    case "despresurizacion":
      return "Despresurización del terreno";
  }
}

// -----------------------------------------------------------------------------
// EVALUACIÓN POR MEDIDA — cada solución produce un ResultadoMedidaHS6 con sus
// requisitos (checks), su `cuenta` (válida para la zona) y su `estado`.
// -----------------------------------------------------------------------------

/** Evalúa una barrera de protección (art. 3.2). `cuenta` ⇒ válida para la zona. */
function evaluarBarrera(s: SolucionBarreraInput, warnings: string[]): ResultadoMedidaHS6 {
  const p = parametrosBarrera();
  const requisitos: RequisitoEvaluado[] = [];

  // --- Vía de justificación --------------------------------------------------
  let viaOk: boolean;
  if (s.via === "lamina_tipo") {
    const coef = numNoNeg(s.coefDifusion_m2_s);
    const esp = numNoNeg(s.espesor_mm);

    const coefOk = coef !== null && coef <= p.coefDifusionMax_m2_s;
    requisitos.push({
      clave: "coef-difusion",
      etiqueta: "Coeficiente de difusión del radón de la lámina",
      estado: coef === null ? "fail" : coefOk ? "ok" : "fail",
      detalle:
        coef === null
          ? `Falta el coeficiente de difusión de la lámina (vía lámina-tipo exige ≤ ${p.coefDifusionMax_m2_s} m²/s, art. 3.2).`
          : `${coef} m²/s ${coefOk ? "≤" : ">"} ${p.coefDifusionMax_m2_s} m²/s (art. 3.2) → ${coefOk ? "CUMPLE" : "NO CUMPLE"}.`,
    });

    const espOk = esp !== null && esp >= p.espesorMin_mm;
    requisitos.push({
      clave: "espesor-lamina",
      etiqueta: "Espesor de la lámina",
      estado: esp === null ? "fail" : espOk ? "ok" : "fail",
      detalle:
        esp === null
          ? `Falta el espesor de la lámina (vía lámina-tipo exige ≥ ${p.espesorMin_mm} mm, art. 3.2).`
          : `${esp} mm ${espOk ? "≥" : "<"} ${p.espesorMin_mm} mm (art. 3.2) → ${espOk ? "CUMPLE" : "NO CUMPLE"}.`,
    });

    viaOk = coefOk && espOk;
    if (!viaOk) {
      warnings.push(
        `Barrera "${s.id}": la lámina-tipo NO cumple la vía simplificada (coef. difusión ≤ ` +
          `${p.coefDifusionMax_m2_s} m²/s y espesor ≥ ${p.espesorMin_mm} mm, art. 3.2).`,
      );
    }
  } else {
    // Vía "calculo" (E < Elim, Nivel B): DIFERIDA, no soportada por el motor.
    viaOk = false;
    requisitos.push({
      clave: "via-calculo",
      etiqueta: "Justificación de la barrera por cálculo de difusión (E < Elim)",
      estado: "warn",
      detalle:
        "Vía por cálculo (Nivel B) DIFERIDA: el motor no evalúa E < Elim (fórmula no " +
        "verificada literalmente). Justifíquela manualmente o use la vía lámina-tipo.",
    });
    warnings.push(
      `Barrera "${s.id}": justificación por cálculo (E < Elim, Nivel B) NO soportada en esta ` +
        "versión (pendiente). Use la vía lámina-tipo (coef. difusión ≤ 1e-11 m²/s, espesor ≥ 2 mm).",
    );
  }

  // --- Checklist cualitativo (sellados / penetraciones / puertas) ------------
  requisitos.push({
    clave: "continuidad-sellada",
    etiqueta: "Continuidad sellada de la barrera",
    estado: s.continuidadSellada ? "ok" : "fail",
    detalle: s.continuidadSellada
      ? "La barrera forma una capa continua y sellada (art. 3.2)."
      : "La barrera NO es continua/sellada en toda su superficie (art. 3.2).",
  });
  requisitos.push({
    clave: "penetraciones-selladas",
    etiqueta: "Penetraciones selladas",
    estado: s.penetracionesSelladas ? "ok" : "fail",
    detalle: s.penetracionesSelladas
      ? "Las penetraciones (tuberías, juntas, arquetas) están selladas (art. 3.2)."
      : "Hay penetraciones SIN sellar (tuberías/juntas): vía de entrada de radón (art. 3.2).",
  });
  requisitos.push({
    clave: "puertas-estancas",
    etiqueta: "Puertas de comunicación estancas",
    estado: s.puertasEstancas ? "ok" : "fail",
    detalle: s.puertasEstancas
      ? "Las puertas de comunicación con el espacio protegido son estancas (art. 3.2)."
      : "Las puertas de comunicación NO son estancas (art. 3.2).",
  });

  if (!s.continuidadSellada || !s.penetracionesSelladas || !s.puertasEstancas) {
    warnings.push(
      `Barrera "${s.id}": el checklist cualitativo está INCOMPLETO (continuidad/penetraciones/` +
        "puertas), requisito de la barrera de protección (art. 3.2).",
    );
  }

  const checklistOk = s.continuidadSellada && s.penetracionesSelladas && s.puertasEstancas;
  const cuenta = viaOk && checklistOk;
  const estado = requisitos.reduce<Veredicto>((acc, r) => peor(acc, r.estado), "ok");

  const motivo =
    `Barrera de protección (art. 3.2), vía ${s.via === "lamina_tipo" ? "lámina-tipo" : "cálculo (DIFERIDA)"}: ` +
    `${cuenta ? "VÁLIDA (cuenta como medida)" : "NO válida (no cuenta como medida)"}. ` +
    `Checklist: continuidad ${s.continuidadSellada ? "OK" : "NO"}, penetraciones ` +
    `${s.penetracionesSelladas ? "OK" : "NO"}, puertas ${s.puertasEstancas ? "OK" : "NO"}.`;

  return {
    id: s.id,
    nombre: nombreDe(s),
    tipo: "barrera",
    requisitos,
    cuenta,
    estado,
    motivo,
  };
}

/** Evalúa un espacio de contención ventilado (art. 3.2). */
function evaluarEspacioContencion(
  s: SolucionEspacioContencionInput,
  warnings: string[],
): ResultadoMedidaHS6 {
  const p = parametrosEspacioContencion();
  const requisitos: RequisitoEvaluado[] = [];

  // --- Ventilación: natural (criterio geométrico) o mecánica (remite a HS3) ---
  let ventilacionOk: boolean;
  if (s.ventilacion === "natural") {
    const perimetro = numNoNeg(s.perimetro_m);
    const area = numNoNeg(s.areaAberturas_cm2);
    // Área de aberturas exigida = 10 cm²/ml · perímetro [cm²].
    const areaExigida_cm2 =
      perimetro !== null ? p.areaAberturasMin_cm2_ml * perimetro : null;
    const ventOk = area !== null && areaExigida_cm2 !== null && area >= areaExigida_cm2;
    ventilacionOk = ventOk;
    requisitos.push({
      clave: "ventilacion-natural",
      etiqueta: "Ventilación natural de la cámara (área de aberturas)",
      estado:
        perimetro === null || area === null ? "fail" : ventOk ? "ok" : "fail",
      detalle:
        perimetro === null
          ? "Falta el perímetro de la cámara para verificar el criterio 10 cm²/ml (art. 3.2)."
          : area === null
            ? `Falta el área de aberturas; se exigen ${areaExigida_cm2} cm² (= ${p.areaAberturasMin_cm2_ml} cm²/ml · ${perimetro} m, art. 3.2).`
            : `${area} cm² ${ventOk ? "≥" : "<"} ${areaExigida_cm2} cm² exigidos ` +
              `(${p.areaAberturasMin_cm2_ml} cm²/ml · ${perimetro} m, art. 3.2) → ${ventOk ? "CUMPLE" : "NO CUMPLE"}.`,
    });
    if (!ventOk) {
      warnings.push(
        `Espacio de contención "${s.id}": ventilación natural INSUFICIENTE (área de aberturas < ` +
          `${p.areaAberturasMin_cm2_ml} cm²/ml · perímetro, art. 3.2).`,
      );
    }
  } else {
    // Ventilación mecánica: el dimensionado del caudal remite a DB-HS3 §3.2.1.
    ventilacionOk = true;
    requisitos.push({
      clave: "ventilacion-mecanica",
      etiqueta: "Ventilación mecánica de la cámara",
      estado: "warn",
      detalle:
        `Ventilación mecánica: el caudal se dimensiona según ${p.remisionMecanica} ` +
        "(fuera de HS6). Verifíquelo en el módulo HS3.",
    });
    warnings.push(
      `Espacio de contención "${s.id}": ventilación mecánica → el caudal se dimensiona en ` +
        `${p.remisionMecanica} (DB-HS3), fuera de este módulo.`,
    );
  }

  // --- Altura mínima de la cámara (~5 cm) ------------------------------------
  const altura = numNoNeg(s.alturaCamara_mm);
  if (altura !== null) {
    const alturaOk = altura >= p.alturaMinCamara_mm;
    requisitos.push({
      clave: "altura-camara",
      etiqueta: "Altura libre de la cámara",
      estado: alturaOk ? "ok" : "fail",
      detalle: `${altura} mm ${alturaOk ? "≥" : "<"} ${p.alturaMinCamara_mm} mm mínimos (art. 3.2) → ${alturaOk ? "CUMPLE" : "NO CUMPLE"}.`,
    });
    if (!alturaOk) {
      warnings.push(
        `Espacio de contención "${s.id}": altura de cámara ${altura} mm < ` +
          `${p.alturaMinCamara_mm} mm mínimos (art. 3.2).`,
      );
    }
  } else {
    // Altura no aportada: informativo, no bloqueante (warn).
    requisitos.push({
      clave: "altura-camara",
      etiqueta: "Altura libre de la cámara",
      estado: "warn",
      detalle: `Altura de cámara no aportada; mínimo recomendado ${p.alturaMinCamara_mm} mm (art. 3.2).`,
    });
  }

  // La altura no aportada (warn) NO descalifica la medida; solo descalifica el
  // incumplimiento de la ventilación o de una altura aportada insuficiente.
  const alturaDescalifica = altura !== null && altura < p.alturaMinCamara_mm;
  const cuenta = ventilacionOk && !alturaDescalifica;
  const estado = requisitos.reduce<Veredicto>((acc, r) => peor(acc, r.estado), "ok");

  const motivo =
    `Espacio de contención ventilado (art. 3.2), ventilación ${s.ventilacion}: ` +
    `${cuenta ? "VÁLIDO (cuenta como medida)" : "NO válido (no cuenta como medida)"}.` +
    (s.ventilacion === "natural"
      ? ` Criterio geométrico ${p.areaAberturasMin_cm2_ml} cm²/ml · perímetro.`
      : ` Caudal remitido a ${p.remisionMecanica}.`);

  return {
    id: s.id,
    nombre: nombreDe(s),
    tipo: "espacio_contencion",
    requisitos,
    cuenta,
    estado,
    motivo,
  };
}

/** Evalúa la despresurización del terreno (art. 3.3) — cualitativa. */
function evaluarDespresurizacion(
  s: SolucionDespresurizacionInput,
  warnings: string[],
): ResultadoMedidaHS6 {
  const requisitos: RequisitoEvaluado[] = [
    {
      clave: "red-captacion",
      etiqueta: "Red de captación en relleno granular",
      estado: s.redCaptacion ? "ok" : "fail",
      detalle: s.redCaptacion
        ? "Red de captación embebida en relleno de áridos bajo la solera (art. 3.3)."
        : "Falta la red de captación en relleno granular bajo la solera (art. 3.3).",
    },
    {
      clave: "extraccion-mecanica",
      etiqueta: "Sistema de extracción mecánica",
      estado: s.extraccionMecanica ? "ok" : "fail",
      detalle: s.extraccionMecanica
        ? "Sistema de extracción mecánica conectado a la red de captación (art. 3.3)."
        : "Falta el sistema de extracción mecánica (art. 3.3).",
    },
    {
      clave: "geotextil",
      etiqueta: "Geotextil de separación",
      estado: s.geotextil ? "ok" : "fail",
      detalle: s.geotextil
        ? "Geotextil de separación presente (art. 3.3)."
        : "Falta el geotextil de separación (art. 3.3).",
    },
  ];

  const cuenta = s.redCaptacion && s.extraccionMecanica && s.geotextil;
  if (!cuenta) {
    warnings.push(
      `Despresurización "${s.id}": el sistema está INCOMPLETO (red de captación + extracción ` +
        "mecánica + geotextil), requisito del art. 3.3.",
    );
  }
  const estado = requisitos.reduce<Veredicto>((acc, r) => peor(acc, r.estado), "ok");

  const motivo =
    `Despresurización del terreno (art. 3.3): ${cuenta ? "VÁLIDA (cuenta como medida adicional)" : "NO válida (sistema incompleto)"}. ` +
    `Captación ${s.redCaptacion ? "OK" : "NO"}, extracción ${s.extraccionMecanica ? "OK" : "NO"}, ` +
    `geotextil ${s.geotextil ? "OK" : "NO"}.`;

  return {
    id: s.id,
    nombre: nombreDe(s),
    tipo: "despresurizacion",
    requisitos,
    cuenta,
    estado,
    motivo,
  };
}

/** Despacha la evaluación de una solución según su `tipo` (unión discriminada). */
function evaluarMedida(s: SolucionHS6Input, warnings: string[]): ResultadoMedidaHS6 {
  switch (s.tipo) {
    case "barrera":
      return evaluarBarrera(s, warnings);
    case "espacio_contencion":
      return evaluarEspacioContencion(s, warnings);
    case "despresurizacion":
      return evaluarDespresurizacion(s, warnings);
  }
}

// -----------------------------------------------------------------------------
// MOTOR
// -----------------------------------------------------------------------------

export function calcHS6(inp: HS6Inputs): HS6Result {
  const warnings: string[] = [];
  const nivelReferencia_Bq_m3 = nivelReferenciaRadon_Bq_m3();
  const req = requisitoDeZona(inp.zona);
  const municipio = inp.municipio?.trim() ? inp.municipio.trim() : null;

  // ===========================================================================
  // 1. APLICABILIDAD: ámbito (art. 1) + zona ≠ sin_exigencia (Apéndice B).
  // ===========================================================================
  const ambitoAplica = inp.localHabitableEnContactoConTerreno === true;
  const zonaExige = inp.zona !== "sin_exigencia";
  const aplica = ambitoAplica && zonaExige;

  let motivoNoAplica: string | null = null;
  if (!ambitoAplica) {
    motivoNoAplica =
      "El local no es habitable o no está en contacto con el terreno (art. 1): HS6 no exige medidas.";
  } else if (!zonaExige) {
    motivoNoAplica =
      "Municipio no clasificado en el Apéndice B (zona sin exigencia): HS6 no exige medidas.";
  }

  // Siempre se evalúan las medidas propuestas (informativo aunque no apliquen),
  // para que la ficha/SVG muestren su estado; pero el VEREDICTO de adecuación solo
  // se exige cuando `aplica`.
  const porMedida = inp.soluciones.map((s) => evaluarMedida(s, aplica ? warnings : []));

  // Si HS6 no exige medidas, no se requiere combinación: veredicto OK "sin exigencia".
  if (!aplica) {
    // Aviso suave si el usuario propuso medidas innecesarias (no es un fallo).
    if (inp.soluciones.length > 0) {
      warnings.push(
        "HS6 no exige medidas en este caso (" +
          (motivoNoAplica ?? "sin exigencia") +
          "). Las soluciones propuestas se muestran a título informativo.",
      );
    }
    return {
      zona: inp.zona,
      municipio,
      localHabitableEnContactoConTerreno: inp.localHabitableEnContactoConTerreno,
      nivelReferencia_Bq_m3,
      aplica: false,
      motivoNoAplica,
      barreraObligatoria: req.barreraObligatoria,
      nMedidasMin: req.nMedidasMin,
      nivelProteccion: req.descripcion,
      nMedidasValidas: porMedida.filter((m) => m.cuenta).length,
      combinacionSuficiente: true, // no se exige nada
      porMedida,
      elementoCriticoId: null,
      elementoCritico: null,
      veredictoGlobal: "ok",
      warnings,
    };
  }

  // ===========================================================================
  // 2/3. ADECUACIÓN de la combinación PROPUESTA al nivel de la zona (art. 3.1).
  //   - Barrera obligatoria (Zona II): debe existir ≥ 1 barrera VÁLIDA.
  //   - Medidas adicionales: las que CUENTAN y están entre las admitidas por la
  //     zona, distintas de la barrera que cubre la obligación.
  // ===========================================================================
  const barrerasValidas = porMedida.filter((m) => m.tipo === "barrera" && m.cuenta);
  const hayBarreraValida = barrerasValidas.length > 0;

  // Estados de adecuación (se reflejan como warnings/fail en el veredicto).
  let estadoAdecuacion: Veredicto = "ok";
  let elementoCriticoId: string | null = null;
  let elementoCritico: string | null = null;

  // (a) Barrera obligatoria (Zona II).
  if (req.barreraObligatoria && !hayBarreraValida) {
    estadoAdecuacion = peor(estadoAdecuacion, "fail");
    // Resaltar la barrera propuesta que falla, si existe; si no, sentinela.
    const barreraPropuesta = porMedida.find((m) => m.tipo === "barrera");
    elementoCriticoId = barreraPropuesta ? barreraPropuesta.id : HS6_FALTA_MEDIDA;
    elementoCritico = barreraPropuesta
      ? `Barrera de protección OBLIGATORIA (Zona II) presente pero NO válida: "${barreraPropuesta.id}".`
      : "FALTA la barrera de protección OBLIGATORIA en Zona II (art. 3.1).";
    warnings.push(
      "Zona II (art. 3.1): la barrera de protección es OBLIGATORIA y no hay ninguna barrera " +
        "válida entre las soluciones propuestas.",
    );
  }

  // (b) Recuento de medidas válidas que satisfacen el nivel de la zona.
  //   - Las medidas que CUENTAN y cuyo tipo está admitido por la zona.
  //   - En Zona II la barrera obligatoria cubre 1; la adicional debe ser de las
  //     admitidas (espacio_contencion | despresurizacion).
  let nMedidasValidas: number;
  if (req.barreraObligatoria) {
    // Zona II: 1 (barrera válida) + nº de adicionales válidas admitidas.
    const adicionalesValidas = porMedida.filter(
      (m) => m.cuenta && m.tipo !== "barrera" && req.medidasAdmitidas.includes(m.tipo),
    ).length;
    nMedidasValidas = (hayBarreraValida ? 1 : 0) + adicionalesValidas;
  } else {
    // Zona I: cualquier medida válida cuyo tipo esté admitido (barrera | espacio).
    nMedidasValidas = porMedida.filter(
      (m) => m.cuenta && req.medidasAdmitidas.includes(m.tipo),
    ).length;
  }

  const combinacionSuficiente = nMedidasValidas >= req.nMedidasMin && (!req.barreraObligatoria || hayBarreraValida);

  // (c) Falta de medidas (nº insuficiente) que no sea ya el fallo de barrera.
  if (!combinacionSuficiente && estadoAdecuacion !== "fail") {
    estadoAdecuacion = peor(estadoAdecuacion, "fail");
    // Resaltar una medida propuesta inválida (peor estado) o sentinela si no hay.
    const medidaInvalida = porMedida.find((m) => !m.cuenta);
    elementoCriticoId = medidaInvalida ? medidaInvalida.id : HS6_FALTA_MEDIDA;
    elementoCritico = medidaInvalida
      ? `Medida propuesta NO válida: "${medidaInvalida.id}" (${medidaInvalida.motivo}).`
      : `Faltan medidas: la zona exige ${req.nMedidasMin}, válidas ${nMedidasValidas} (art. 3.1).`;
    warnings.push(
      `Combinación INSUFICIENTE (art. 3.1): la zona ${inp.zona} exige ${req.nMedidasMin} medida(s); ` +
        `solo ${nMedidasValidas} válida(s).`,
    );
  }

  // Aviso si hay soluciones propuestas que NO cuentan para la zona (p.ej.
  // despresurización como medida única en Zona I — no admitida).
  for (const m of porMedida) {
    if (m.cuenta && !req.medidasAdmitidas.includes(m.tipo) && m.tipo !== "barrera") {
      warnings.push(
        `La medida "${m.id}" (${m.tipo}) no está admitida como medida de la zona ${inp.zona} ` +
          "(art. 3.1): no cuenta para satisfacer el nivel de protección.",
      );
    }
  }

  // ===========================================================================
  // 4/5. ELEMENTO CRÍTICO por requisito incumplido: si la adecuación cuadra pero
  //   alguna medida tiene requisitos en fail/warn, el peor de ellos es el crítico.
  // ===========================================================================
  let estadoMedidas: Veredicto = "ok";
  for (const m of porMedida) {
    estadoMedidas = peor(estadoMedidas, m.estado);
  }
  // Si aún no hay elemento crítico marcado (la adecuación cuadra), elegir la peor
  // medida (fail > warn) cuyo estado degrade, para que el SVG la resalte.
  if (elementoCriticoId === null) {
    let peorMedida: ResultadoMedidaHS6 | null = null;
    for (const m of porMedida) {
      if (m.estado === "fail") {
        peorMedida = m;
        break;
      }
      if (m.estado === "warn" && peorMedida === null) {
        peorMedida = m;
      }
    }
    if (peorMedida && peorMedida.estado !== "ok") {
      elementoCriticoId = peorMedida.id;
      const reqMalo = peorMedida.requisitos.find(
        (r) => r.estado === "fail" || r.estado === "warn",
      );
      elementoCritico = reqMalo
        ? `${peorMedida.nombre}: ${reqMalo.etiqueta} — ${reqMalo.detalle}`
        : peorMedida.motivo;
    }
  }

  // ===========================================================================
  // 6. VEREDICTO GLOBAL = peor de la adecuación y de los estados por medida.
  // ===========================================================================
  let veredictoGlobal: Veredicto = "ok";
  veredictoGlobal = peor(veredictoGlobal, estadoAdecuacion);
  veredictoGlobal = peor(veredictoGlobal, estadoMedidas);

  return {
    zona: inp.zona,
    municipio,
    localHabitableEnContactoConTerreno: inp.localHabitableEnContactoConTerreno,
    nivelReferencia_Bq_m3,
    aplica: true,
    motivoNoAplica: null,
    barreraObligatoria: req.barreraObligatoria,
    nMedidasMin: req.nMedidasMin,
    nivelProteccion: req.descripcion,
    nMedidasValidas,
    combinacionSuficiente,
    porMedida,
    elementoCriticoId,
    elementoCritico,
    veredictoGlobal,
    warnings,
  };
}
