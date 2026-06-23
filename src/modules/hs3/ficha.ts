// =============================================================================
// DB-HS3 — Ficha justificativa. Transforma (inputs, result) del motor de cálculo
// en el `FichaData` que pinta la plantilla ÚNICA `renderFicha` (lib/pdf). Este
// módulo NO sabe de jsPDF: es una función PURA de transformación (sin React/DOM).
//
// Cumple el innegociable de TRAZABILIDAD (SPEC §4/§8): cada dato declara su
// ORIGEN y cada verificación cita su referencia normativa (DB + tabla/artículo +
// edición), construida desde la `.procedencia` de las tablas de ./tablas.ts —
// nunca cifras/citas sueltas. Veredicto CUMPLE/NO CUMPLE resaltado por renderFicha.
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
import type { HS3Inputs, HS3Result, TipoEstancia } from "./calc";
import { HS3_PDF_SVG_ID, hs3NativeSize } from "./svg-meta";
import {
  AREA_EFECTIVA_ABERTURAS,
  CAUDALES_LOCALES_HABITABLES,
  COCCION_MIN,
  SECCION_CONDUCTO_TABLA_4_2,
  TIRO_TABLA_4_3,
} from "./tablas";

// -----------------------------------------------------------------------------
// CONTRATO DE INTEGRACIÓN con svg.tsx:
//  - El id del contenedor del clon oculto del SVG (modo 'pdf') que renderFicha
//    busca en el DOM (`document.getElementById(...)`) se IMPORTA de ./svg
//    (`HS3_PDF_SVG_ID`), única fuente de verdad. ui.tsx DEBE montar el clon
//    oculto del HS3SVG con ESE mismo id.
//  - El viewBox del HS3SVG es DEPENDIENTE DE LOS DATOS: svg.tsx lo autoencuadra
//    con `fitViewBox` sobre una rejilla de COLS columnas. El tamaño nativo
//    (`nativeW/H`) se IMPORTA de ./svg (`hs3NativeSize`), única fuente de
//    verdad, para que `scale = CW / nativeW` de renderFicha no deforme el raster.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Etiquetas legibles de cada tipo de estancia (para conceptos de la ficha).
// -----------------------------------------------------------------------------
const ETIQUETA_TIPO: Record<TipoEstancia, string> = {
  dorm_principal: "Dormitorio principal",
  dormitorio: "Dormitorio",
  salon_comedor: "Salón-comedor",
  cocina: "Cocina",
  bano: "Baño",
  aseo: "Aseo",
};

/** Nombre de presentación de una estancia: tipo + id, p.ej. "Cocina (cocina)". */
function nombreEstancia(tipo: TipoEstancia, id: string): string {
  return `${ETIQUETA_TIPO[tipo] ?? tipo} (${id})`;
}

/** Referencia compacta de una tabla para la columna "Ref." / "Origen". */
function refDe(proc: { db: string; tabla?: string; articulo?: string }): string {
  return `${proc.db} ${proc.tabla ?? proc.articulo ?? ""}`.trim();
}

const ZONA_TERMICA_LABEL: Record<HS3Inputs["zonaTermica"], string> = {
  W: "W (Tm ≤ 14 °C)",
  X: "X (14 < Tm ≤ 16 °C)",
  Y: "Y (16 < Tm ≤ 18 °C)",
  Z: "Z (Tm > 18 °C)",
};

// -----------------------------------------------------------------------------
// TRANSFORMACIÓN: (inputs, result) → FichaData
// -----------------------------------------------------------------------------

/** Convierte (inputs, result) de HS3 en el FichaData que renderFicha pinta. */
export function toFichaData(inputs: HS3Inputs, result: HS3Result): FichaData {
  // ── Normativa de referencia (citas desde las procedencias) ────────────────
  const normativa: CitaNormativa[] = [
    citaDe(CAUDALES_LOCALES_HABITABLES.procedencia), // Tabla 2.1
    citaDe(COCCION_MIN.procedencia), // ap. 2, pto 4 (cocción)
    citaDe(AREA_EFECTIVA_ABERTURAS.procedencia), // Tabla 4.1
    citaDe(SECCION_CONDUCTO_TABLA_4_2.procedencia), // Tabla 4.2
    citaDe(TIRO_TABLA_4_3.procedencia), // Tabla 4.3
  ];

  const ref21 = refDe(CAUDALES_LOCALES_HABITABLES.procedencia);
  const refCoccion = refDe(COCCION_MIN.procedencia);
  const refConducto = `${SECCION_CONDUCTO_TABLA_4_2.procedencia.db} Tabla 4.2/4.3`;

  // ── Datos de partida (cada dato declara su ORIGEN) ────────────────────────
  const datosPartida: FilaDato[] = [
    {
      concepto: "Nº de dormitorios",
      valor: String(inputs.numDormitorios),
      origen: "Entrada del usuario",
    },
    {
      concepto: "Categoría de vivienda (Tabla 2.1)",
      valor: result.categoriaDormitorios,
      origen: ref21,
    },
    {
      concepto: "Zona térmica del edificio",
      valor: ZONA_TERMICA_LABEL[inputs.zonaTermica],
      origen: "Entrada del usuario (Tabla 4.4)",
    },
  ];
  // Plantas servidas: en modo rápido es entrada directa; en modo red se DERIVA
  // del span de cada colectivo (Tabla 4.3).
  if (!result.red) {
    datosPartida.push({
      concepto: "Nº de plantas servidas por el conducto",
      valor: String(inputs.numPlantasConducto),
      origen: "Entrada del usuario (Tabla 4.3)",
    });
  } else {
    for (const c of result.red.colectivos) {
      datosPartida.push({
        concepto: `Colectivo ${c.id} — plantas servidas (span)`,
        valor: String(c.plantasServidas),
        origen: "Derivado de la red (Tabla 4.3)",
      });
    }
  }

  // Una fila de caudal PROPUESTO (origen usuario) + una de caudal REQUERIDO
  // (origen Tabla 2.1) por cada estancia.
  for (const e of result.porEstancia) {
    const nombre = nombreEstancia(e.tipo, e.id);
    datosPartida.push({
      concepto: `Caudal propuesto — ${nombre}`,
      valor: fmt(e.caudalPropuesto_l_s, "l/s"),
      origen: "Entrada del usuario",
    });
    datosPartida.push({
      concepto: `Caudal requerido — ${nombre}`,
      valor: fmt(e.caudalRequerido_l_s, "l/s"),
      origen: ref21,
    });
  }

  // ── Verificaciones (comparación contra el límite normativo) ───────────────
  const verificaciones: FilaVerificacion[] = [];

  // Una fila por estancia: propuesto vs requerido (Tabla 2.1).
  for (const e of result.porEstancia) {
    verificaciones.push({
      concepto: nombreEstancia(e.tipo, e.id),
      valor: fmt(e.caudalPropuesto_l_s, "l/s"),
      limite: `≥ ${fmt(e.caudalRequerido_l_s, "l/s")}`,
      estado: e.estado,
      referencia: ref21,
    });
  }

  // Húmedos: verificación TOTAL de la vivienda (Tabla 2.1).
  verificaciones.push({
    concepto: "Extracción total de húmedos (vivienda)",
    valor: fmt(result.humedosTotalPropuesto_l_s, "l/s"),
    limite: `≥ ${fmt(result.humedosTotalRequerido_l_s, "l/s")}`,
    estado: result.estadoHumedosTotal,
    referencia: ref21,
  });

  // Balance admisión / extracción (warn informativo, no fail).
  verificaciones.push({
    concepto: "Equilibrio admisión / extracción",
    valor: fmt(result.totalAdmision_l_s, "l/s"),
    limite: `= ${fmt(result.totalExtraccion_l_s, "l/s")}`,
    estado: result.estadoBalance,
    referencia: ref21,
  });

  // Cocción: extracción INDEPENDIENTE ≥ 50 l/s (no cuenta como ventilación
  // general), una fila por estancia esCoccion con su propio caudal de cocción.
  for (const e of result.porEstancia) {
    if (!e.esCoccion) continue;
    verificaciones.push({
      concepto: `Extracción de cocción (independiente) — ${nombreEstancia(e.tipo, e.id)}`,
      valor: fmt(e.caudalCoccion_l_s ?? 0, "l/s"),
      limite: `≥ ${fmt(COCCION_MIN.datos.caudalMin_l_s, "l/s")}`,
      estado: e.cumpleCoccion ? "ok" : "fail",
      referencia: refCoccion,
    });
  }

  // Conducto de extracción: sección mínima exigida (Tablas 4.2/4.3, verificadas),
  // estado NEUTRAL: es un resultado de DIMENSIONADO (no una verificación contra
  // un valor propuesto), por lo que no entra en el veredicto global.
  if (result.red) {
    // Modo red: una fila por colectivo con su sección dimensionante (boca).
    for (const c of result.red.colectivos) {
      const seccionMax = c.tramos.reduce((m, t) => Math.max(m, t.seccionRequerida_cm2), 0);
      verificaciones.push({
        concepto: `Conducto colectivo ${c.id} — sección dimensionante (clase ${c.claseTiro})`,
        valor: fmt(seccionMax, "cm²", 0),
        limite: `qvt boca ${fmt(c.qvtBoca_l_s, "l/s")}`,
        estado: "neutral",
        referencia: refConducto,
      });
    }
  } else {
    verificaciones.push({
      concepto: `Sección del conducto de extracción (clase ${result.conducto.claseTiro})`,
      valor: fmt(result.conducto.seccionRequerida_cm2, "cm²", 0),
      limite: `qvt ${fmt(result.conducto.qvt_l_s, "l/s")}`,
      estado: result.conducto.estado, // "neutral"
      referencia: refConducto,
    });
  }

  // ── Observaciones ─────────────────────────────────────────────────────────
  const observaciones: string[] = [...result.warnings];
  if (result.red) {
    if (!result.red.estadoRed.valida) {
      observaciones.push(
        `Red colectiva NO válida (exportación bloqueada): ${result.red.estadoRed.bloqueos.join(" ")}`,
      );
    }
    observaciones.push(
      "Red colectiva: la sección de cada tramo se dimensiona con su caudal acumulado (Tabla 4.2) y la clase de tiro del colectivo (span de plantas servidas, Tabla 4.3). Es un resultado de dimensionado (neutral): no entra en el veredicto global. La extracción de cocción NO se incluye en el caudal de la red.",
    );
  } else {
    observaciones.push(
      `Conducto de extracción: ${result.conducto.aviso} La clase de tiro se obtiene de la Tabla 4.3 según el nº de plantas y la zona térmica; la sección es un resultado de dimensionado (Tabla 4.2) y NO entra en el veredicto global.`,
    );
  }

  return {
    titulo: "HS3 — Calidad del aire interior (Ventilación)",
    engineVersion: ENGINE_VERSION,
    edicionDB: "DB-HS3 (FOM/588/2017)",
    normativa,
    datosPartida,
    verificaciones,
    veredictoGlobal: result.veredictoGlobal,
    observaciones,
    svg: {
      elementId: HS3_PDF_SVG_ID,
      ...hs3NativeSize(result),
      caption: result.red
        ? "Esquema de la red colectiva de extracción (tramo que manda resaltado)"
        : "Esquema de ventilación: admisión, paso y extracción de la vivienda",
    },
    inputs,
    slug: "hs3-ventilacion",
  };
}
