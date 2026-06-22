// =============================================================================
// DB-HE Sección HE1 — Ficha justificativa. Transforma (inputs, result) del motor
// de cálculo de la ENVOLVENTE TÉRMICA en el `FichaData` que pinta la plantilla
// ÚNICA `renderFicha` (lib/pdf). Este módulo NO sabe de jsPDF: es una función
// PURA de transformación (sin React/DOM).
//
// Cumple el innegociable de TRAZABILIDAD (SPEC §4/§8): cada dato declara su
// ORIGEN y cada verificación cita su referencia normativa (DB-HE1 + tabla/art. +
// EDICIÓN 2019, consolidado 14-jun-2022), construida desde la `.procedencia` de
// las tablas de ./tablas.ts —nunca cifras/citas sueltas. Veredicto CUMPLE/NO
// CUMPLE resaltado por renderFicha.
//
// SEPARACIÓN exigencia / criterio / pendiente (igual espíritu que hs4/ficha.ts):
//  - EXIGENCIA CTE (confianza alta): Ulim (Tabla 3.1.1.a-HE1), Rsi/Rse (DA DB-HE/1),
//    fRsi,min (Tabla 1 DA DB-HE/2), Rsi=0,25 fijo, Magnus (Glaser).
//  - ORIENTATIVO (NO exigencia, sustituible por dato del fabricante): λ/µ del CEC.
//    Se etiqueta el origen de cada capa autocompletada como "orientativo (CEC)".
//  - PENDIENTE §10 / CONFIANZA BAJA: los ψ de puentes térmicos (DA DB-HE/3). El
//    H_PT es una fila INFORMATIVA (estado neutral, no entra en el veredicto) y se
//    deja constancia en observaciones de que NO se cita como cifra cerrada del CTE.
//
// PREDIMENSIONADO: la ficha es de predimensionado por elemento; NO sustituye el
// cálculo de detalle de la envolvente ni una herramienta oficial (HULC/CE3X). Se
// declara en observaciones.
// =============================================================================

import type {
  CitaNormativa,
  FichaData,
  FilaDato,
  FilaVerificacion,
} from "../../lib/pdf/renderFicha";
import { citaDe } from "../../lib/cte/tabla";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type {
  HE1Inputs,
  HE1Result,
  ResultadoCapaHE1,
  ResultadoCerramientoHE1,
} from "./calc";
import type {
  ClaseHigrometria,
  DireccionFlujo,
  TipoElemento,
} from "./tablas";
import {
  CONDICIONES_DEFECTO,
  FRSI_MIN_TABLA_1,
  PSAT_MAGNUS,
  PSI_PUENTES_TERMICOS_DA_DB_HE_3,
  RESISTENCIAS_SUPERFICIALES,
  RSI_CONDENSACION,
  ULIM_TABLA_3_1_1_a,
} from "./tablas";
import { HE1_PDF_SVG_ID, he1NativeSize } from "./svg-meta";

// -----------------------------------------------------------------------------
// CONTRATO DE INTEGRACIÓN con svg-meta.ts (se hace EN PARALELO):
//  - El id del contenedor del clon oculto del SVG (modo 'pdf') que renderFicha
//    busca en el DOM se IMPORTA de ./svg-meta (`HE1_PDF_SVG_ID`, literal congelado
//    "he1-svg-pdf"), única fuente de verdad. ui.tsx DEBE montar el clon oculto del
//    HE1SVG con ESE mismo id.
//  - El tamaño nativo (`nativeW/H`) se IMPORTA de ./svg-meta (`he1NativeSize`),
//    única fuente de verdad, para que `scale = CW / nativeW` de renderFicha no
//    deforme el raster.
//  (Igual patrón que hs4/svg-meta.ts: metadatos + geometría SIN JSX, para que la
//   ficha —transformación pura, sin React/DOM— no dependa del módulo de SVG.)
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Etiquetas legibles del dominio (para conceptos de ficha).
// -----------------------------------------------------------------------------

/** Etiqueta legible de cada tipo de elemento de la envolvente (símbolo del DB). */
const ETIQUETA_TIPO: Record<TipoElemento, string> = {
  muro_suelo_exterior: "Muro / suelo exterior (UM, US)",
  cubierta_exterior: "Cubierta exterior (UC)",
  contacto_no_habitable_terreno: "Contacto con no habitable / terreno (UT)",
  hueco: "Hueco (UH)",
  puerta: "Puerta (≤ 50 % semitransparente)",
  medianeria: "Medianería / partición (UMD)",
};

/** Etiqueta legible del sentido del flujo de calor (selecciona Rsi/Rse). */
const ETIQUETA_FLUJO: Record<DireccionFlujo, string> = {
  horizontal: "horizontal (muro)",
  ascendente: "ascendente (cubierta/techo)",
  descendente: "descendente (suelo)",
};

/** Etiqueta legible de la clase de higrometría del espacio interior. */
const ETIQUETA_HIGROMETRIA: Record<ClaseHigrometria, string> = {
  clase_3_o_inferior: "clase 3 o inferior (residencial)",
  clase_4: "clase 4 (alta producción de humedad)",
  clase_5: "clase 5 (gran producción de humedad)",
};

/** Referencia compacta de una tabla/artículo para la columna "Ref." / "Origen". */
function refDe(proc: { db: string; tabla?: string; articulo?: string }): string {
  return `${proc.db} ${proc.tabla ?? proc.articulo ?? ""}`.trim();
}

const REF_ULIM = refDe(ULIM_TABLA_3_1_1_a.procedencia); // "DB-HE1 Tabla 3.1.1.a-HE1"
const REF_RSI_RSE = refDe(RESISTENCIAS_SUPERFICIALES.procedencia); // "DA DB-HE/1 Tabla 1 …"
const REF_FRSI = refDe(FRSI_MIN_TABLA_1.procedencia); // "DA DB-HE/2 Tabla 1 (fRsi,min)"
const REF_RSI_COND = refDe(RSI_CONDENSACION.procedencia); // "DA DB-HE/2 ec. fRsi = 1 − U·0,25"
const REF_GLASER = refDe(PSAT_MAGNUS.procedencia); // "DA DB-HE/2 ec. [3] y [4]"
const REF_PSI = refDe(PSI_PUENTES_TERMICOS_DA_DB_HE_3.procedencia); // "DA DB-HE/3 PENDIENTE §10"

/** Origen "orientativo (CEC)" vs dato explícito, para λ/µ de una capa. */
const ORIGEN_CEC = "Catálogo de Elementos Constructivos (CEC) — orientativo (no exigencia CTE)";

/** Nombre de presentación de un cerramiento: nombre + id, p.ej. "Muro de fachada (muro-fachada)". */
function nombreCerramiento(c: Pick<ResultadoCerramientoHE1, "nombre" | "id">): string {
  return `${c.nombre} (${c.id})`;
}

/**
 * Descripción de una capa resuelta para los datos de partida: espesor (mm) + λ
 * [W/(m·K)] (o R directa de cámara/lámina), marcando si λ es orientativa (CEC).
 */
function descripcionCapa(capa: ResultadoCapaHE1): string {
  const espesor = fmt(capa.espesor_m * 1000, "mm", 0);
  if (capa.lambda_W_mK === null) {
    // Cámara de aire / lámina con R directa (no se modela por e/λ).
    return `e=${espesor} · R=${fmt(capa.resistencia_m2K_W, "m²K/W", 2)} (R directa)`;
  }
  const lambda = `λ=${fmt(capa.lambda_W_mK, "W/(m·K)", 3)}`;
  const marca = capa.lambdaOrientativa ? " (orientativo CEC)" : "";
  return `e=${espesor} · ${lambda}${marca} · R=${fmt(capa.resistencia_m2K_W, "m²K/W", 3)}`;
}

/** Origen del λ/material de una capa: input del usuario o tabla orientativa CEC. */
function origenCapa(capa: ResultadoCapaHE1): string {
  if (capa.lambda_W_mK === null) {
    // R directa: cámara sin ventilar (Tabla 2 DA DB-HE/1, orientativa) o lámina declarada.
    return `R de cámara/lámina (Tabla 2 ${RESISTENCIAS_SUPERFICIALES.procedencia.db} orientativa, o declarada)`;
  }
  return capa.lambdaOrientativa ? ORIGEN_CEC : "Entrada del usuario (λ del fabricante)";
}

// -----------------------------------------------------------------------------
// TRANSFORMACIÓN: (inputs, result) → FichaData
// -----------------------------------------------------------------------------

/** Convierte (inputs, result) de HE1 en el FichaData que renderFicha pinta. */
export function toFichaData(inputs: HE1Inputs, result: HE1Result): FichaData {
  // ── Normativa de referencia (citas desde las procedencias) ────────────────
  // Las exigencias VINCULANTES (Ulim, Rsi/Rse, fRsi,min, Rsi fijo, Glaser/Magnus)
  // primero; el dato PENDIENTE §10 (ψ de puentes térmicos, confianza BAJA) al
  // final, etiquetado como ORIENTATIVO / pendiente (no se cita como cifra cerrada).
  const normativa: CitaNormativa[] = [
    citaDe(ULIM_TABLA_3_1_1_a.procedencia), // Tabla 3.1.1.a-HE1 — Ulim
    citaDe(RESISTENCIAS_SUPERFICIALES.procedencia), // DA DB-HE/1 — Rsi/Rse
    citaDe(FRSI_MIN_TABLA_1.procedencia), // DA DB-HE/2 — fRsi,min
    citaDe(RSI_CONDENSACION.procedencia), // DA DB-HE/2 — Rsi=0,25 (fRsi superficial)
    citaDe(PSAT_MAGNUS.procedencia), // DA DB-HE/2 — Glaser (Psat, ec. [3]/[4])
    // PENDIENTE §10 (no exigencia numérica cerrada): se cita con su naturaleza en
    // `exigencia` para que la ficha NO presente los ψ como prescripción del DA.
    {
      ...citaDe(PSI_PUENTES_TERMICOS_DA_DB_HE_3.procedencia),
      exigencia:
        "Puentes térmicos ψ — ORIENTATIVO, PENDIENTE de verificación literal (§10, confianza BAJA); H_PT informativo",
    },
  ];

  const cdHr = CONDICIONES_DEFECTO.datos.hrInterior_pct[result.claseHigrometria];

  // ── Datos de partida (cada dato declara su ORIGEN) ────────────────────────
  const datosPartida: FilaDato[] = [
    {
      concepto: "Zona climática de invierno",
      valor: `Zona ${result.zonaClimatica}`,
      // La zona de invierno indexa Ulim y fRsi,min; origen Apéndice B (dato climático).
      origen: "Dato climático (Apéndice B del DB-HE) — entrada del usuario",
    },
    {
      concepto: "Clase de higrometría del espacio interior",
      valor: ETIQUETA_HIGROMETRIA[result.claseHigrometria] ?? result.claseHigrometria,
      origen: "Entrada del usuario (clase EN ISO 13788, recogida por DA DB-HE/2)",
    },
    {
      concepto: "Temperatura interior de cálculo θi",
      valor: fmt(result.tempInterior_C, "°C", 1),
      origen:
        inputs.tempInterior_C != null
          ? "Entrada del usuario"
          : `Defecto DA DB-HE/2 (${fmt(CONDICIONES_DEFECTO.datos.tempInterior_C, "°C", 0)})`,
    },
    {
      concepto: "Humedad relativa interior HRi",
      valor: fmt(result.hrInterior_pct, "%", 0),
      origen:
        inputs.hrInterior_pct != null
          ? "Entrada del usuario"
          : `Defecto DA DB-HE/2 por clase de higrometría (${fmt(cdHr, "%", 0)})`,
    },
    {
      concepto: "Temperatura exterior de enero θe",
      valor: fmt(result.tempExteriorEnero_C, "°C", 1),
      origen:
        inputs.tempExteriorEnero_C != null
          ? "Dato climático de la localidad (Anejo del DB-HE) — entrada del usuario"
          : "Dato climático NO aportado: valor conservador (ver observaciones)",
    },
    {
      concepto: "Humedad relativa exterior de enero HRe",
      valor: fmt(result.hrExterior_pct, "%", 0),
      origen:
        inputs.hrExterior_pct != null
          ? "Dato climático de la localidad (Anejo del DB-HE) — entrada del usuario"
          : `Dato climático NO aportado: defecto informativo DA DB-HE/2 (${fmt(
              CONDICIONES_DEFECTO.datos.hrExteriorDefecto_pct,
              "%",
              0,
            )})`,
    },
  ];

  // Por cada cerramiento: cabecera (tipo + flujo + Rsi/Rse usados) y una fila por
  // capa (material, espesor mm, λ con marca "orientativo CEC" si procede).
  for (const cer of result.porCerramiento) {
    datosPartida.push({
      concepto: `Cerramiento — ${nombreCerramiento(cer)}`,
      valor: `${ETIQUETA_TIPO[cer.tipoElemento] ?? cer.tipoElemento} · flujo ${
        ETIQUETA_FLUJO[cer.direccionFlujo] ?? cer.direccionFlujo
      }`,
      // El tipo selecciona Ulim (Tabla 3.1.1.a); el flujo selecciona Rsi/Rse (DA/1).
      origen: `Entrada del usuario · Rsi=${fmt(cer.rsi_m2K_W, "", 2)} / Rse=${fmt(
        cer.rse_m2K_W,
        "m²K/W",
        2,
      )} (${REF_RSI_RSE})`,
    });
    // Capas de interior a exterior (orden del motor): material/nombre, e, λ, R.
    for (const capa of cer.capas) {
      datosPartida.push({
        concepto: `  · Capa — ${capa.nombre}`,
        valor: descripcionCapa(capa),
        origen: origenCapa(capa),
      });
    }
  }

  // ── Verificaciones (comparación contra el límite normativo) ────────────────
  // Por cada cerramiento, en este orden: (a) U vs límite (min de Ulim y U_max_fRsi),
  // (b) fRsi vs fRsi,min, (c) Glaser intersticial, (d) H_PT informativo. El motor
  // ya fija el veredicto por verificación (NO se recomputa aquí): la ficha SOLO
  // propaga `cumpleU`/`cumpleFRsi`/`glaser.condensaIntersticial`/`estado`.
  const verificaciones: FilaVerificacion[] = [];

  for (const cer of result.porCerramiento) {
    const nombre = nombreCerramiento(cer);

    // (a) Transmitancia U vs límite. El límite efectivo es el MÁS restrictivo
    // entre Ulim (Tabla 3.1.1.a) y U_max_fRsi = (1 − fRsi,min)/0,25 (DA DB-HE/2):
    // se indica cuál manda. Medianería (ulim_W_m2K === null) → "no aplica" (neutral).
    if (cer.ulim_W_m2K === null) {
      verificaciones.push({
        concepto: `${nombre} — Transmitancia U (medianería: Ulim no aplica)`,
        valor: fmt(cer.u_W_m2K, "W/m²K", 2),
        limite: "no aplica",
        // La Tabla 3.1.1.a no fija Ulim para medianerías: estado neutral, no contamina.
        estado: "neutral",
        referencia: REF_ULIM,
      });
    } else {
      // Límite efectivo y cuál de los dos manda (sin recomputar el veredicto de U).
      const ulim = cer.ulim_W_m2K;
      const uMaxFRsi = cer.uMaxFRsi_W_m2K;
      const limiteEfectivo = Math.min(ulim, uMaxFRsi);
      const mandaFRsi = uMaxFRsi < ulim;
      const quien = mandaFRsi
        ? `manda U_max,fRsi=${fmt(uMaxFRsi, "", 2)}; Ulim=${fmt(ulim, "W/m²K", 2)}`
        : `manda Ulim=${fmt(ulim, "", 2)}; U_max,fRsi=${fmt(uMaxFRsi, "W/m²K", 2)}`;
      verificaciones.push({
        concepto: `${nombre} — Transmitancia U ≤ límite (${quien})`,
        valor: fmt(cer.u_W_m2K, "W/m²K", 2),
        limite: `≤ ${fmt(limiteEfectivo, "W/m²K", 2)}`,
        // Veredicto del motor (única fuente de verdad): ok si U ≤ Ulim, fail si no.
        estado: cer.cumpleU ? "ok" : "fail",
        referencia: `${REF_ULIM} · ${REF_FRSI}`,
      });
    }

    // (b) Condensación superficial: fRsi = 1 − U·0,25 vs fRsi,min (Tabla 1 DA/2).
    verificaciones.push({
      concepto: `${nombre} — fRsi ≥ fRsi,min (condensación superficial)`,
      valor: `fRsi=${fmt(cer.fRsi, "", 2)}`,
      limite: `≥ ${fmt(cer.fRsiMin, "", 2)}`,
      // Veredicto del motor: ok si fRsi ≥ fRsi,min, fail si no.
      estado: cer.cumpleFRsi ? "ok" : "fail",
      referencia: `${REF_FRSI} · ${REF_RSI_COND}`,
    });

    // (c) Condensación intersticial (Glaser, mes de enero, binario predimensionado).
    // CON condensación → warn (REVISAR, requiere balance anual), no fail tajante.
    const condensa = cer.glaser.condensaIntersticial;
    verificaciones.push({
      concepto: `${nombre} — Condensación intersticial (Glaser, enero)`,
      valor: condensa ? "Condensación — revisar" : "Sin condensación",
      limite: `Sd total=${fmt(cer.glaser.sdTotal_m, "m", 2)}`,
      // Veredicto del motor (estadoGlaser): ok sin condensación, warn con condensación.
      estado: condensa ? "warn" : "ok",
      referencia: REF_GLASER,
    });

    // (d) Puentes térmicos H_PT = Σ(ψ·L) — fila INFORMATIVA (estado neutral). NO
    // entra en el veredicto: los ψ son ORIENTATIVOS (DA DB-HE/3 §10, confianza BAJA).
    if (cer.hPuentes_W_K !== null) {
      verificaciones.push({
        concepto: `${nombre} — Puentes térmicos H_PT = Σ(ψ·L) [informativo]`,
        valor: fmt(cer.hPuentes_W_K, "W/K", 3),
        limite: "ψ orientativo (no exigencia)",
        // Informativo: el motor no lo cuenta en el veredicto → estado neutral.
        estado: "neutral",
        referencia: `${REF_PSI} (PENDIENTE §10, confianza BAJA)`,
      });
    }
  }

  // ── Observaciones ──────────────────────────────────────────────────────────
  const observaciones: string[] = [...result.warnings];

  // Nota innegociable: los ψ de puentes térmicos son ORIENTATIVOS / pendientes de
  // verificación literal (DA DB-HE/3, §10, confianza BAJA). El H_PT es informativo.
  observaciones.push(
    "Puentes térmicos (H_PT = Σ(ψ·L)): los coeficientes ψ son ORIENTATIVOS y están PENDIENTES de " +
      "verificación literal contra el DA DB-HE/3 maquetado (§10, confianza BAJA). El H_PT se presenta " +
      "como INFORMATIVO y NO determina el veredicto CUMPLE / NO CUMPLE; no debe citarse como cifra " +
      "cerrada del CTE. La exigencia (DB-HE ap. 4.1.d) obliga a caracterizar los puentes térmicos; el " +
      "método global Klim (Tablas 3.1.1.b/c-HE1) ya engloba su efecto como alternativa no bloqueante.",
  );

  // Estatus de λ/µ: valores de referencia del CEC, sustituibles por el dato del
  // fabricante (marcado CE/DIT). Lo que el usuario use es un INPUT con origen.
  observaciones.push(
    "Conductividades λ y factores de difusión µ: cuando provienen del Catálogo de Elementos " +
      "Constructivos del CTE (CEC) son valores de referencia ORIENTATIVOS (marcados como tales en los " +
      "datos de partida), NO exigencias numéricas del CTE. En proyecto real prevalecen el λ y el µ/Sd " +
      "del fabricante (declaración de prestaciones / marcado CE / DIT).",
  );

  // Alcance: predimensionado por elemento, no sustituye el cálculo de detalle ni
  // una herramienta oficial (HULC/CE3X). El balance anual de Glaser queda fuera.
  observaciones.push(
    "Alcance del cálculo: PREDIMENSIONADO de la envolvente térmica por elemento (transmitancia U, " +
      "condensación superficial fRsi y condensación intersticial por el método de Glaser para el mes de " +
      "enero). La condensación intersticial detectada es una alerta del mes desfavorable: requiere la " +
      "comprobación del balance anual de condensación/evaporación (DA DB-HE/2), no es un NO CUMPLE " +
      "definitivo. Este predimensionado NO sustituye el cálculo de detalle de la envolvente ni la " +
      "verificación con la herramienta oficial (HULC / CE3X).",
  );

  const { nativeW, nativeH } = he1NativeSize(result);

  return {
    titulo: "HE1 — Transmitancia U + condensaciones (envolvente térmica)",
    engineVersion: ENGINE_VERSION,
    edicionDB: "DB-HE 2019 (RD 732/2019, consolidado 14-jun-2022)",
    normativa,
    datosPartida,
    verificaciones,
    veredictoGlobal: result.veredictoGlobal,
    observaciones,
    svg: {
      elementId: HE1_PDF_SVG_ID,
      nativeW,
      nativeH,
      caption:
        "Sección de cerramientos por capas y diagrama de Glaser (presiones de vapor real / saturación, mes de enero); barra U frente al límite por cerramiento.",
    },
    inputs,
    slug: "he1-envolvente",
  };
}
