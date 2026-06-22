// =============================================================================
// DB-HS6 — "Protección frente al radón". Ficha justificativa. Transforma
// (inputs, result) del motor de cálculo (Nivel A: clasificación + adecuación de la
// combinación de soluciones a la zona + checklist cualitativo/geométrico) en el
// `FichaData` que pinta la plantilla ÚNICA `renderFicha` (lib/pdf). Este módulo NO
// sabe de jsPDF: es una función PURA de transformación (sin React/DOM).
//
// Cumple el innegociable de TRAZABILIDAD (SPEC §4/§8): cada dato declara su ORIGEN
// y cada verificación cita su referencia normativa (DB-HS6 + artículo / Apéndice B
// + EDICIÓN RD 732/2019), construida desde la `.procedencia` de las tablas de
// ./tablas.ts —nunca cifras/citas sueltas. Veredicto CUMPLE/NO CUMPLE resaltado
// por renderFicha. Veredicto y cifras NO se recomputan aquí: la ficha SOLO propaga
// `result.veredictoGlobal`, `m.estado`, `m.cuenta`, `combinacionSuficiente`, etc.
//
// SEPARACIÓN exigencia / pendiente (mismo espíritu que he1/hs4):
//  - EXIGENCIA CTE (confianza alta): nivel de referencia 300 Bq/m³ (art. 2);
//    ámbito (art. 1); niveles de protección por zona (art. 3.1); estructura de las
//    soluciones (art. 3.2/3.3); zonas (Apéndice B).
//  - PENDIENTE de verificación literal (confianza MEDIA-ALTA): los umbrales
//    cuantitativos de la vía simplificada (lámina-tipo ≤ 1e-11 m²/s y ≥ 2 mm;
//    ventilación natural ≥ 10 cm²/ml; altura de cámara). Transcritos por
//    triangulación (precedente HS4/HS5), pendientes de auditoría literal del PDF.
//  - DIFERIDO (no implementado): el sub-cálculo cuantitativo de la barrera por
//    difusión (E < Elim, "Nivel B"). Se declara en observaciones.
//
// PREDIMENSIONADO: la ficha es de predimensionado de Nivel A por local; NO sustituye
// una medición de radón ni un cálculo de transporte. Se declara en observaciones.
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
  HS6Inputs,
  HS6Result,
  ResultadoMedidaHS6,
  SolucionHS6Input,
} from "./calc";
import {
  AMBITO_APLICACION,
  NIVEL_REFERENCIA_RADON,
  PARAMETROS_SOLUCIONES,
  REQUISITOS_POR_ZONA,
  type ZonaRadon,
} from "./tablas";
import { HS6_PDF_SVG_ID, hs6NativeSize } from "./svg-meta";

// -----------------------------------------------------------------------------
// CONTRATO DE INTEGRACIÓN con svg-meta.ts:
//  - El id del contenedor del clon oculto del SVG (modo 'pdf') que renderFicha
//    busca en el DOM se IMPORTA de ./svg-meta (`HS6_PDF_SVG_ID`, literal congelado
//    "hs6-svg-pdf"), única fuente de verdad. ui.tsx DEBE montar el clon oculto del
//    HS6SVG con ESE mismo id.
//  - El tamaño nativo (`nativeW/H`) se IMPORTA de ./svg-meta (`hs6NativeSize`),
//    única fuente de verdad, para que `scale = CW / nativeW` de renderFicha no
//    deforme el raster.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Procedencias / referencias compactas (desde las tablas, NUNCA cifras sueltas).
// Las tablas de ./tablas.ts ya envuelven cada cifra con su ProcedenciaCTE; aquí se
// derivan las citas (`citaDe`) y los rótulos cortos de referencia para las filas.
// El artículo de cada solución (3.2 barrera/espacio, 3.3 despresurización) se cita
// con su propia procedencia (PARAMETROS_SOLUCIONES) más el detalle del tipo.
// -----------------------------------------------------------------------------

/** Edición del DB para cabecera/pie (innegociable: el DB se modifica, citar edición). */
const EDICION_DB_HS6 = "DB-HS6 (RD 732/2019)";

/** Referencia compacta de una procedencia para la columna "Ref." / "Origen". */
function refDe(proc: { db: string; tabla?: string; articulo?: string }): string {
  return `${proc.db} ${proc.tabla ?? proc.articulo ?? ""}`.trim();
}

const REF_NIVEL = refDe(NIVEL_REFERENCIA_RADON.procedencia); // DB-HS6 art. 2
const REF_AMBITO = refDe(AMBITO_APLICACION.procedencia); // DB-HS6 art. 1
const REF_ZONA = refDe({ db: "DB-HS6", articulo: "Apéndice B (zonificación)" }); // DB-HS6 Apéndice B
const REF_NIVELES = refDe(REQUISITOS_POR_ZONA.procedencia); // DB-HS6 art. 3.1

/** Artículo concreto de cada tipo de solución (para la columna de referencia). */
const ART_POR_TIPO: Record<ResultadoMedidaHS6["tipo"], string> = {
  barrera: "DB-HS6 art. 3.2 (barrera de protección)",
  espacio_contencion: "DB-HS6 art. 3.2 (espacio de contención ventilado)",
  despresurizacion: "DB-HS6 art. 3.3 (despresurización del terreno)",
};

/** Etiqueta legible de la zona de radón (Apéndice B) para datos de partida. */
const ETIQUETA_ZONA: Record<ZonaRadon, string> = {
  I: "Zona I (potencial medio)",
  II: "Zona II (potencial alto)",
  sin_exigencia: "Sin clasificar (sin exigencia)",
};

/** Nombre de presentación de una medida: nombre + id, p.ej. "Barrera … (barrera-lamina)". */
function nombreMedida(m: Pick<ResultadoMedidaHS6, "nombre" | "id">): string {
  return `${m.nombre} (${m.id})`;
}

// -----------------------------------------------------------------------------
// DATOS DE PARTIDA — descripción de cada solución PROPUESTA (con sus
// características de entrada) para la tabla "Datos de partida". La descripción se
// deriva del INPUT (no del result) para reflejar exactamente lo que declaró el
// usuario; el origen es la entrada del usuario verificada contra el art. 3.2/3.3.
// -----------------------------------------------------------------------------

const PB = PARAMETROS_SOLUCIONES.datos.barrera;
const PE = PARAMETROS_SOLUCIONES.datos.espacioContencion;

/** Descripción legible de una solución propuesta a partir de su input. */
function descripcionSolucion(s: SolucionHS6Input): string {
  switch (s.tipo) {
    case "barrera": {
      if (s.via === "lamina_tipo") {
        const coef =
          s.coefDifusion_m2_s != null ? `coef. difusión ${s.coefDifusion_m2_s} m²/s` : "coef. difusión no aportado";
        const esp = s.espesor_mm != null ? `espesor ${fmt(s.espesor_mm, "mm", 1)}` : "espesor no aportado";
        return `Vía lámina-tipo · ${coef} · ${esp}`;
      }
      return "Vía por cálculo de difusión (E < Elim, Nivel B — DIFERIDA)";
    }
    case "espacio_contencion": {
      if (s.ventilacion === "natural") {
        const perim = `perímetro ${fmt(s.perimetro_m, "m", 1)}`;
        const area = s.areaAberturas_cm2 != null ? `aberturas ${fmt(s.areaAberturas_cm2, "cm²", 0)}` : "aberturas no aportadas";
        const alt = s.alturaCamara_mm != null ? `altura ${fmt(s.alturaCamara_mm, "mm", 0)}` : "altura no aportada";
        return `Ventilación natural · ${perim} · ${area} · ${alt}`;
      }
      return `Ventilación mecánica (caudal remitido a ${PE.remisionMecanica})`;
    }
    case "despresurizacion": {
      const partes = [
        `captación ${s.redCaptacion ? "sí" : "no"}`,
        `extracción mecánica ${s.extraccionMecanica ? "sí" : "no"}`,
        `geotextil ${s.geotextil ? "sí" : "no"}`,
      ];
      return `Sistema cualitativo · ${partes.join(" · ")}`;
    }
  }
}

// -----------------------------------------------------------------------------
// TRANSFORMACIÓN: (inputs, result) → FichaData
// -----------------------------------------------------------------------------

/** Convierte (inputs, result) de HS6 en el FichaData que renderFicha pinta. */
export function toFichaData(inputs: HS6Inputs, result: HS6Result): FichaData {
  // ── Normativa de referencia (citas desde las procedencias) ────────────────
  // Exigencias VINCULANTES del DB-HS6 primero (art. 2 nivel de referencia, art. 1
  // ámbito, art. 3.1 niveles por zona, Apéndice B zonas); los umbrales de la vía
  // simplificada (art. 3.2/3.3) se citan con su naturaleza PENDIENTE en `exigencia`
  // para que la ficha NO los presente como cifras cerradas verificadas literalmente.
  const normativa: CitaNormativa[] = [
    citaDe(NIVEL_REFERENCIA_RADON.procedencia), // art. 2 — nivel de referencia 300 Bq/m³
    citaDe(AMBITO_APLICACION.procedencia), // art. 1 — ámbito de aplicación
    citaDe(REQUISITOS_POR_ZONA.procedencia), // art. 3.1 — niveles de protección por zona
    {
      db: "DB-HS6",
      articulo: "Apéndice B (zonificación por municipio)",
      edicion: NIVEL_REFERENCIA_RADON.procedencia.edicion,
      exigencia: "Zonas de radón I / II / sin clasificar — INPUT consultado por el proyectista",
    },
    {
      ...citaDe(PARAMETROS_SOLUCIONES.procedencia),
      exigencia:
        "Soluciones (vía simplificada): umbrales cuantitativos PENDIENTES de verificación literal del PDF maquetado (confianza MEDIA-ALTA)",
    },
  ];

  // ── Datos de partida (cada dato declara su ORIGEN) ────────────────────────
  const datosPartida: FilaDato[] = [
    {
      concepto: "Zona de radón del edificio",
      valor: ETIQUETA_ZONA[result.zona] ?? result.zona,
      // La zona indexa el nivel de protección exigido (art. 3.1). Origen: Apéndice B.
      origen: `Apéndice B (consultada por el proyectista por su municipio) · ${REF_ZONA}`,
    },
    {
      concepto: "Municipio",
      valor: result.municipio ?? "No especificado",
      // Informativo: NO condiciona el cálculo (la zona es el dato efectivo).
      origen: "Entrada del usuario — informativo (no condiciona el cálculo; la zona es el dato efectivo)",
    },
    {
      concepto: "Local habitable en contacto con el terreno",
      valor: result.localHabitableEnContactoConTerreno ? "Sí" : "No",
      // Ámbito de aplicación (art. 1): si no aplica, HS6 no exige medidas.
      origen: `Entrada del usuario (condición de ámbito) · ${REF_AMBITO}`,
    },
    {
      concepto: "Nivel de protección exigido por la zona",
      valor: result.aplica
        ? `${result.nMedidasMin} medida(s)${result.barreraObligatoria ? " · barrera obligatoria" : ""}`
        : "Sin exigencia",
      origen: `${REF_NIVELES} — ${result.nivelProteccion}`,
    },
  ];

  // Una fila por solución PROPUESTA: sus características de entrada + su artículo de
  // origen. Se describe el INPUT (lo que declaró el usuario), verificado contra el
  // art. 3.2/3.3 (cuyos umbrales evalúa el motor; aquí solo se declara el dato).
  for (const s of inputs.soluciones) {
    datosPartida.push({
      concepto: `Solución propuesta — ${nombreMedida({ nombre: s.nombre ?? tituloDeTipo(s.tipo), id: s.id })}`,
      valor: descripcionSolucion(s),
      origen: `Entrada del usuario · ${ART_POR_TIPO[s.tipo]}`,
    });
  }

  // ── Verificaciones (comparación contra el límite/exigencia normativa) ──────
  // El motor ya fija el veredicto por medida y la suficiencia de la combinación (NO
  // se recomputa aquí): la ficha SOLO propaga `m.estado`, `m.cuenta`,
  // `combinacionSuficiente` y los requisitos críticos incumplidos.
  const verificaciones: FilaVerificacion[] = [];

  // (1) Nivel de referencia 300 Bq/m³ — fila INFORMATIVA (el Nivel A no calcula la
  //     concentración resultante; es el VALOR LÍMITE citable, no un veredicto).
  verificaciones.push({
    concepto: "Nivel de referencia de radón (concentración media anual)",
    valor: `límite ≤ ${fmt(result.nivelReferencia_Bq_m3, "Bq/m³", 0)}`,
    limite: `≤ ${fmt(NIVEL_REFERENCIA_RADON.datos.concentracionMax_Bq_m3, "Bq/m³", 0)}`,
    // El Nivel A no estima la concentración (no hay modelo de transporte): neutral.
    estado: "neutral",
    referencia: `${REF_NIVEL} (edición ${NIVEL_REFERENCIA_RADON.procedencia.edicion})`,
  });

  // (2) Adecuación de la combinación: nivel de protección exigido por la zona vs
  //     medidas válidas aportadas. Estado = combinacionSuficiente (lo fija el motor).
  if (result.aplica) {
    verificaciones.push({
      concepto: result.barreraObligatoria
        ? "Combinación suficiente para la zona (barrera obligatoria + medidas)"
        : "Combinación suficiente para la zona (nº de medidas válidas)",
      valor: `${result.nMedidasValidas} medida(s) válida(s)`,
      limite: `≥ ${result.nMedidasMin}${result.barreraObligatoria ? " (con barrera)" : ""}`,
      // Veredicto del motor: ok si la combinación satisface el nivel de la zona.
      estado: result.combinacionSuficiente ? "ok" : "fail",
      referencia: `${REF_NIVELES} (edición ${REQUISITOS_POR_ZONA.procedencia.edicion})`,
    });
  } else {
    // No aplica: HS6 no exige medidas → fila neutral "sin exigencia".
    verificaciones.push({
      concepto: "Exigencia de HS6 en este local",
      valor: "Sin exigencia",
      limite: result.motivoNoAplica ?? "Fuera de ámbito / municipio no clasificado",
      estado: "neutral",
      referencia: `${REF_AMBITO} · ${REF_ZONA}`,
    });
  }

  // (3) Una fila por medida con su `estado` y `motivo` (el motor ya los fija).
  for (const m of result.porMedida) {
    verificaciones.push({
      concepto: `${nombreMedida(m)} — ${m.cuenta ? "válida (cuenta)" : "no válida (no cuenta)"}`,
      valor: m.motivo,
      limite: m.cuenta ? "cuenta como medida" : "no cuenta",
      // Veredicto del motor por medida (peor de sus requisitos): NO se recomputa.
      estado: m.estado,
      referencia: `${ART_POR_TIPO[m.tipo]} (edición ${PARAMETROS_SOLUCIONES.procedencia.edicion})`,
    });

    // (3b) Requisitos críticos de la medida (fail/warn): una fila por requisito
    //      incumplido o pendiente, con su detalle (que ya cita el artículo). Los
    //      requisitos `ok`/`neutral` no se listan (la fila de la medida los resume).
    for (const req of m.requisitos) {
      if (req.estado === "fail" || req.estado === "warn") {
        verificaciones.push({
          concepto: `  · ${m.id} — ${req.etiqueta}`,
          valor: req.detalle,
          limite: req.estado === "fail" ? "requisito incumplido" : "requisito pendiente / remitido",
          estado: req.estado,
          referencia: ART_POR_TIPO[m.tipo],
        });
      }
    }
  }

  // ── Observaciones ──────────────────────────────────────────────────────────
  const observaciones: string[] = [...result.warnings];

  // Caso "no aplica": deja constancia explícita de que HS6 no exige medidas.
  if (!result.aplica) {
    observaciones.push(
      "Sin exigencia HS6 (fuera de ámbito / municipio no clasificado): " +
        (result.motivoNoAplica ??
          "el local no es habitable o no está en contacto con el terreno, o el municipio no está clasificado en el Apéndice B.") +
        " Las soluciones propuestas se muestran a título informativo.",
    );
  }

  // Disclosure DIFERIDO: el sub-cálculo de la barrera por difusión (E < Elim, Nivel
  // B) NO está en el predimensionado actual. Solo se soporta la vía lámina-tipo.
  observaciones.push(
    "Barrera por cálculo de difusión (E < Elim, \"Nivel B\"): este predimensionado NO evalúa el " +
      "sub-cálculo cuantitativo de la barrera por difusión (la fórmula de E diverge entre fuentes y no " +
      "está verificada literalmente). La barrera se justifica por la vía simplificada \"lámina-tipo\" (coef. " +
      `difusión ≤ ${PB.coefDifusionMax_m2_s} m²/s y espesor ≥ ${PB.espesorMin_mm} mm, art. 3.2); la vía por ` +
      "cálculo queda fuera del módulo y debe justificarse manualmente.",
  );

  // Disclosure PENDIENTE: los umbrales cuantitativos de la vía simplificada
  // (lámina-tipo, ventilación natural, altura de cámara) están transcritos por
  // triangulación y PENDIENTES de auditoría literal del PDF maquetado (precedente
  // HS4/HS5). La estructura (zonas, niveles, ámbito) es de confianza alta.
  observaciones.push(
    "Parámetros de la vía simplificada (confianza MEDIA-ALTA): los umbrales cuantitativos de las " +
      `soluciones (lámina-tipo coef. difusión ≤ ${PB.coefDifusionMax_m2_s} m²/s y espesor ≥ ${PB.espesorMin_mm} mm; ` +
      `ventilación natural ≥ ${PE.areaAberturasMin_cm2_ml} cm²/ml de perímetro; altura de cámara ≥ ${PE.alturaMinCamara_mm} mm) ` +
      "están transcritos por triangulación y PENDIENTES de auditoría literal contra el PDF maquetado del " +
      "DB-HS6 (mismo procedimiento que HS4/HS5). La estructura de la exigencia (ámbito art. 1, nivel de " +
      "referencia art. 2, niveles de protección por zona art. 3.1 y zonas del Apéndice B) es de confianza alta.",
  );

  // Alcance: predimensionado de Nivel A (clasificación + adecuación + checklist),
  // no sustituye una medición de radón ni un cálculo de transporte.
  observaciones.push(
    "Alcance del cálculo: PREDIMENSIONADO de Nivel A (clasificación por zona, adecuación de la " +
      "combinación de soluciones a la exigencia de la zona y checklist cualitativo/geométrico de cada " +
      "solución). El motor NO calcula la concentración de radón resultante (eso exigiría un modelo de " +
      "transporte fuera del predimensionado). Este predimensionado NO sustituye una medición de radón " +
      "en el local terminado ni un cálculo de detalle.",
  );

  const { nativeW, nativeH } = hs6NativeSize(result);

  return {
    titulo: "HS6 — Protección frente al radón",
    engineVersion: ENGINE_VERSION,
    edicionDB: EDICION_DB_HS6,
    normativa,
    datosPartida,
    verificaciones,
    veredictoGlobal: result.veredictoGlobal,
    observaciones,
    svg: {
      elementId: HS6_PDF_SVG_ID,
      nativeW,
      nativeH,
      caption:
        "Sección vertical del encuentro del local con el terreno: bandas apiladas (local protegido, solera, espacio de contención, barrera, terreno) con la medida crítica resaltada; tubo de despresurización si procede.",
    },
    inputs,
    slug: "hs6-radon",
  };
}

/** Título por tipo de solución cuando el input no declara `nombre` (para datos de partida). */
function tituloDeTipo(tipo: ResultadoMedidaHS6["tipo"]): string {
  switch (tipo) {
    case "barrera":
      return "Barrera de protección";
    case "espacio_contencion":
      return "Espacio de contención ventilado";
    case "despresurizacion":
      return "Despresurización del terreno";
  }
}
