// =============================================================================
// DB-HS4 — Ficha justificativa. Transforma (inputs, result) del motor de cálculo
// en el `FichaData` que pinta la plantilla ÚNICA `renderFicha` (lib/pdf). Este
// módulo NO sabe de jsPDF: es una función PURA de transformación (sin React/DOM).
//
// Cumple el innegociable de TRAZABILIDAD (SPEC §4/§8): cada dato declara su
// ORIGEN y cada verificación cita su referencia normativa (DB-HS4 + tabla/art. +
// EDICIÓN 2009), construida desde la `.procedencia` de las tablas de ./tablas.ts —
// nunca cifras/citas sueltas. Veredicto CUMPLE/NO CUMPLE resaltado por renderFicha.
//
// CRITERIOS EXTERNOS (innegociable de §8 — NO confundir con exigencia CTE):
//  - El coeficiente de simultaneidad K = 1/√(n−1) procede de UNE 149201; el
//    DB-HS4 sólo remite a "un criterio adecuado". Se etiqueta como criterio
//    externo en datos de partida y observaciones (usa `result.kEsCriterioExterno`
//    / `result.normaCriterioK`).
//  - La estimación de pérdidas localizadas (≈20–30 % de las longitudinales) es
//    buena práctica de cálculo, NO cifra del DB. Se etiqueta en observaciones.
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
  HS4Inputs,
  HS4Result,
  ResultadoTramoHS4,
  TipoTramoHS4,
} from "./calc";
import { SERIE_DIAMETROS_COMERCIALES_mm } from "./calc";
import type { MaterialTuberia, TipoAparatoHS4 } from "./tablas";
import {
  ALIMENTACION_TABLA_4_3,
  CAUDAL_INSTANTANEO_TABLA_2_1,
  DERIVACIONES_TABLA_4_2,
  PERDIDAS_LOCALIZADAS,
  PRESIONES,
  SIMULTANEIDAD_K,
  VELOCIDADES_CALCULO,
  rangoVelocidad,
} from "./tablas";
import { HS4_PDF_SVG_ID, hs4NativeSize } from "./svg-meta";

// -----------------------------------------------------------------------------
// CONTRATO DE INTEGRACIÓN con svg-meta.ts (se hace EN PARALELO):
//  - El id del contenedor del clon oculto del SVG (modo 'pdf') que renderFicha
//    busca en el DOM se IMPORTA de ./svg-meta (`HS4_PDF_SVG_ID`), única fuente de
//    verdad. ui.tsx DEBE montar el clon oculto del HS4SVG con ESE mismo id.
//  - El tamaño nativo (`nativeW/H`) se IMPORTA de ./svg-meta (`hs4NativeSize`),
//    única fuente de verdad, para que `scale = CW / nativeW` de renderFicha no
//    deforme el raster.
//  (HS4_PDF_SVG_ID y hs4NativeSize se han movido de ./svg a ./svg-meta para que
//   la ficha —transformación pura, sin React/DOM— no dependa del módulo de SVG.)
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Etiquetas legibles de cada tipo de aparato (Tabla 2.1) para conceptos de ficha.
// -----------------------------------------------------------------------------
const ETIQUETA_APARATO: Record<TipoAparatoHS4, string> = {
  lavamanos: "Lavamanos",
  lavabo: "Lavabo",
  ducha: "Ducha",
  banera_ge_140: "Bañera (≥ 1,40 m)",
  banera_lt_140: "Bañera (< 1,40 m)",
  bide: "Bidé",
  inodoro_cisterna: "Inodoro con cisterna",
  inodoro_fluxor: "Inodoro con fluxor",
  urinario_temporizado: "Urinario temporizado",
  urinario_cisterna: "Urinario con cisterna",
  fregadero_domestico: "Fregadero doméstico",
  fregadero_no_domestico: "Fregadero no doméstico",
  lavavajillas_domestico: "Lavavajillas doméstico",
  lavavajillas_industrial: "Lavavajillas industrial",
  lavadero: "Lavadero",
  lavadora_domestica: "Lavadora doméstica",
  lavadora_industrial: "Lavadora industrial",
  grifo_aislado: "Grifo aislado",
  grifo_garaje: "Grifo de garaje",
  vertedero: "Vertedero",
};

/** Etiquetas legibles de cada tipo de tramo de la red de suministro. */
const ETIQUETA_TRAMO: Record<TipoTramoHS4, string> = {
  derivacion_aparato: "Derivación de aparato",
  derivacion_particular: "Derivación particular",
  columna_montante: "Columna / montante",
  tubo_alimentacion: "Tubo de alimentación",
  acometida: "Acometida",
};

/** Etiquetas legibles de cada material de tubería (para datos de partida). */
const ETIQUETA_MATERIAL: Record<MaterialTuberia, string> = {
  metalica: "Metálica",
  termoplastico_multicapa: "Termoplástico / multicapa",
};

const CRITERIO_K_LABEL: Record<HS4Inputs["criterioK"], string> = {
  une149201: "K = 1/√(n−1) (UNE 149201)",
  sin_simultaneidad: "K = 1 (sin simultaneidad)",
};

/** Nombre de presentación de un aparato: tipo + id, p.ej. "Lavabo (bano-lavabo)". */
function nombreAparato(tipo: TipoAparatoHS4, id: string): string {
  return `${ETIQUETA_APARATO[tipo] ?? tipo} (${id})`;
}

/** Nombre de presentación de un tramo: tipo + id, p.ej. "Columna / montante (montante)". */
function nombreTramo(t: Pick<ResultadoTramoHS4, "tipo" | "id">): string {
  return `${ETIQUETA_TRAMO[t.tipo] ?? t.tipo} (${t.id})`;
}

/** Referencia compacta de una tabla/artículo para la columna "Ref." / "Origen". */
function refDe(proc: { db: string; tabla?: string; articulo?: string }): string {
  return `${proc.db} ${proc.tabla ?? proc.articulo ?? ""}`.trim();
}

const REF_TABLA_2_1 = refDe(CAUDAL_INSTANTANEO_TABLA_2_1.procedencia); // "DB-HS4 Tabla 2.1"
const REF_TABLA_4_2 = refDe(DERIVACIONES_TABLA_4_2.procedencia); // "DB-HS4 Tabla 4.2"
const REF_TABLA_4_3 = refDe(ALIMENTACION_TABLA_4_3.procedencia); // "DB-HS4 Tabla 4.3"
const REF_VELOCIDAD = refDe(VELOCIDADES_CALCULO.procedencia); // "DB-HS4 ap. 4.2 d)"
const REF_PRESIONES = refDe(PRESIONES.procedencia); // "DB-HS4 ap. 2.1.3"

/** Ø mínimo del tramo por tabla (4.2 derivación de aparato / 4.3 alimentación). */
function refTramoMin(tipo: TipoTramoHS4): string {
  return tipo === "derivacion_aparato" ? REF_TABLA_4_2 : REF_TABLA_4_3;
}

// OV-7: la serie de Ø comerciales (SERIE_DIAMETROS_COMERCIALES_mm, en calc.ts) NO
// es del DB-HS4: es un CRITERIO DE PROYECTO de predimensionado (igual que K /
// pérdidas localizadas). Se etiqueta como tal en la ficha (origen del Ø y obs.).
const SERIE_DIAMETROS_LABEL = SERIE_DIAMETROS_COMERCIALES_mm.join("/");
const REF_SERIE_DIAMETROS =
  "Serie de Ø comerciales: criterio de proyecto, no exigencia CTE";

// -----------------------------------------------------------------------------
// TRANSFORMACIÓN: (inputs, result) → FichaData
// -----------------------------------------------------------------------------

/** Convierte (inputs, result) de HS4 en el FichaData que renderFicha pinta. */
export function toFichaData(inputs: HS4Inputs, result: HS4Result): FichaData {
  // ── Normativa de referencia (citas desde las procedencias) ────────────────
  // Las cifras VINCULANTES del DB-HS4 (edición 2009) primero; los CRITERIOS
  // EXTERNOS (UNE 149201, pérdidas localizadas) al final, etiquetados aparte.
  const normativa: CitaNormativa[] = [
    citaDe(CAUDAL_INSTANTANEO_TABLA_2_1.procedencia), // Tabla 2.1 — caudal instantáneo
    citaDe(DERIVACIONES_TABLA_4_2.procedencia), // Tabla 4.2 — Ø mín. derivaciones
    citaDe(ALIMENTACION_TABLA_4_3.procedencia), // Tabla 4.3 — Ø mín. alimentación
    citaDe(VELOCIDADES_CALCULO.procedencia), // ap. 4.2 d) — velocidades
    citaDe(PRESIONES.procedencia), // ap. 2.1.3 — presiones mín./máx.
    // Criterios EXTERNOS (no exigencia CTE): se citan con su norma de origen en
    // `exigencia` para que la ficha NO los presente como prescripción del DB.
    {
      ...citaDe(SIMULTANEIDAD_K.datos.procedencia),
      exigencia: `${SIMULTANEIDAD_K.datos.procedencia.norma ?? "UNE 149201"} — criterio externo (no exigencia CTE)`,
    },
    {
      ...citaDe(PERDIDAS_LOCALIZADAS.datos.procedencia),
      exigencia: "Pérdidas localizadas — buena práctica de cálculo (no exigencia CTE)",
    },
  ];

  // ── Datos de partida (cada dato declara su ORIGEN) ────────────────────────
  const datosPartida: FilaDato[] = [
    {
      // ARCH-2: alcance de esta versión. Se dimensiona solo la red de AGUA FRÍA.
      // La red de ACS NO se dimensiona en esta versión: el usuario no debe
      // asumir cobertura de ACS (los caudales de ACS de la Tabla 2.1 no entran
      // en el cálculo). Se declara aquí, en cabecera de los datos de partida.
      concepto: "Alcance del dimensionado",
      valor: "Solo agua fría (AF)",
      origen: "Criterio de versión — la red de ACS no se dimensiona (ver observaciones)",
    },
    {
      concepto: "Presión disponible en la acometida",
      valor: fmt(result.presionAcometida_kPa, "kPa"),
      origen: "Entrada del usuario",
    },
    {
      concepto: "Criterio de simultaneidad",
      valor: CRITERIO_K_LABEL[inputs.criterioK],
      origen: result.kEsCriterioExterno
        ? `${result.normaCriterioK ?? "UNE 149201"} — criterio externo (no exigencia CTE)`
        : "Suma directa (K = 1)",
    },
    {
      concepto: "Presión mínima exigida en grifos comunes",
      valor: fmt(PRESIONES.datos.presionMinGrifosComunes_kPa, "kPa"),
      origen: REF_PRESIONES,
    },
    {
      concepto: "Presión mínima exigida en fluxores / calentadores",
      valor: fmt(PRESIONES.datos.presionMinFluxorCalentador_kPa, "kPa"),
      origen: REF_PRESIONES,
    },
    {
      concepto: "Presión máxima admisible en puntos de consumo",
      valor: fmt(PRESIONES.datos.presionMaxConsumo_kPa, "kPa"),
      origen: REF_PRESIONES,
    },
  ];

  // Una fila por aparato: tipo + caudal instantáneo de AF (origen Tabla 2.1).
  for (const a of result.porAparato) {
    const flux = a.esFluxorOCalentador ? " · fluxor/calentador" : "";
    datosPartida.push({
      concepto: `Aparato — ${nombreAparato(a.tipo, a.id)}`,
      valor: `${fmt(a.caudalInstantaneo_dm3_s, "dm³/s", 3)}${flux}`,
      origen: REF_TABLA_2_1,
    });
  }

  // Material + longitud por tramo (origen: entrada del usuario / defaults motor).
  // El rango de velocidad admisible deriva del material (ap. 4.2 d)).
  for (const t of result.porTramo) {
    const rango = rangoVelocidad(t.material);
    datosPartida.push({
      concepto: `Tramo — ${nombreTramo(t)}`,
      valor: `${ETIQUETA_MATERIAL[t.material] ?? t.material} · L=${fmt(t.longitud_m, "m")}${
        t.altura_m > 0 ? ` · Δh=${fmt(t.altura_m, "m")}` : ""
      }`,
      origen: `Entrada del usuario · v∈[${fmt(rango.min_m_s, "", 1)}, ${fmt(
        rango.max_m_s,
        "m/s",
        1,
      )}] (${REF_VELOCIDAD})`,
    });
  }

  // ── Verificaciones (comparación contra el límite normativo) ───────────────
  const verificaciones: FilaVerificacion[] = [];

  // Una fila por tramo: Ø resultante · velocidad real vs rango admisible ·
  // presión residual a la salida. El motor ya fija `estado` por tramo (NO se
  // recomputa aquí): la ficha SOLO propaga `t.estado` (transformación pura).
  for (const t of result.porTramo) {
    const rango = rangoVelocidad(t.material);
    const diam = t.diametro_mm != null ? `Ø${fmt(t.diametro_mm, "mm", 0)}` : "—";
    const vel = t.velocidad_m_s != null ? fmt(t.velocidad_m_s, "m/s", 2) : "—";
    // Cambio 5 (Wave 1): superficie de los flags que el motor ya fija como `warn`.
    // No se recalcula veredicto: solo se ANOTA la causa junto al concepto/valor.
    const flags: string[] = [];
    if (t.velocidadFueraDeRango) flags.push("velocidad fuera de rango (ap. 4.2 d)");
    if (t.diametroFueraDeSerie) flags.push("Ø fuera de la serie comercial");
    const nota = flags.length ? ` — ${flags.join("; ")} [buena práctica, no exigencia CTE]` : "";
    verificaciones.push({
      concepto: `${nombreTramo(t)}${nota}`,
      valor: `${diam} · v=${vel}`,
      limite: `v∈[${fmt(rango.min_m_s, "", 1)}, ${fmt(rango.max_m_s, "m/s", 1)}] · Pr=${fmt(
        t.presionResidual_kPa,
        "kPa",
      )}`,
      // Veredicto del motor (única fuente de verdad): `warn` si el tramo trae
      // `velocidadFueraDeRango` o `diametroFueraDeSerie` (lo fija calc.ts).
      estado: t.estado,
      // OV-7: el Ø sale de la serie comercial (criterio de proyecto), además del
      // Ø mín. de tabla y el rango de velocidad (DB-HS4).
      referencia: `${refTramoMin(t.tipo)} · ${REF_VELOCIDAD} · ${REF_SERIE_DIAMETROS}`,
    });
  }

  // Fila RESUMEN: presión en el punto de consumo más desfavorable vs mínima
  // exigida en ese punto. Es la verificación clave del módulo (ap. 2.1.3).
  const apCritico = result.puntoCriticoId
    ? result.porAparato.find((a) => a.id === result.puntoCriticoId)
    : undefined;
  const minExigidaCritico =
    apCritico?.presionMinExigida_kPa ?? PRESIONES.datos.presionMinGrifosComunes_kPa;
  const conceptoCritico = apCritico
    ? `Presión en el punto crítico — ${nombreAparato(apCritico.tipo, apCritico.id)}`
    : "Presión en el punto crítico";
  verificaciones.push({
    // ARCH-1: la presión es una ESTIMACIÓN de predimensionado (modelo de pérdida
    // de carga orientativo). La advertencia va JUNTO al dato (concepto/valor),
    // no enterrada en observaciones.
    concepto: `${conceptoCritico} (presión estimada — predimensionado)`,
    valor: `${fmt(result.presionCritica_kPa, "kPa")} (orientativa)`,
    limite: `≥ ${fmt(minExigidaCritico, "kPa")}`,
    // El veredicto lo decide el motor (única fuente de verdad): propagamos el
    // `estado` del aparato crítico. Solo si no hay aparato crítico identificado
    // recurrimos a una comparación local de respaldo.
    estado:
      apCritico?.estado ??
      (result.presionCritica_kPa < minExigidaCritico
        ? "fail"
        : result.presionCritica_kPa > PRESIONES.datos.presionMaxConsumo_kPa
          ? "warn"
          : "ok"),
    referencia: REF_PRESIONES,
  });

  // Fila de GRUPO DE PRESIÓN: necesario/no necesario (ap. 4.5). Si es necesario
  // el dimensionado no cumple por presión ⇒ "fail"; si no, informativo ("ok").
  verificaciones.push({
    // ARCH-1: la necesidad de grupo de presión se decide sobre una presión
    // ESTIMADA (predimensionado). La nota acompaña al dato, no se entierra.
    concepto: "Grupo de presión (ap. 4.5) — sobre presión estimada (predimensionado)",
    valor: result.grupoPresionNecesario ? "Necesario" : "No necesario",
    limite: `Pr punto crítico ≥ ${fmt(minExigidaCritico, "kPa")}`,
    // El veredicto del grupo de presión lo decide el motor (no se recomputa):
    // `fail` si es necesario, informativo `ok` si no.
    estado: result.grupoPresionNecesario ? "fail" : "ok",
    referencia: refDe({ db: "DB-HS4", articulo: "ap. 4.5" }),
  });

  // ── Observaciones ─────────────────────────────────────────────────────────
  const observaciones: string[] = [
    ...result.warnings,
  ];

  // ARCH-1: la presión (residual / punto crítico / grupo de presión) es una
  // ESTIMACIÓN de PREDIMENSIONADO. El modelo de pérdida de carga es orientativo
  // (simplificación tipo Flamant/Hazen-Williams), NO Darcy-Weisbach con factor
  // de fricción de Colebrook. Estas presiones no sustituyen un cálculo hidráulico
  // de detalle: sirven para predimensionar y detectar la necesidad de grupo de
  // presión, no como verificación hidráulica definitiva.
  observaciones.push(
    "Presión ORIENTATIVA (predimensionado): los valores de presión residual, presión en el " +
      "punto crítico y la necesidad de grupo de presión (ap. 4.5) se obtienen con un modelo de " +
      "pérdida de carga simplificado (no Darcy-Weisbach / Colebrook). Es una estimación de " +
      "predimensionado que NO sustituye un cálculo hidráulico de detalle.",
  );

  // ARCH-2: alcance. Esta versión dimensiona SOLO la red de agua fría (AF); la
  // red de ACS no se dimensiona. El usuario no debe asumir cobertura de ACS.
  observaciones.push(
    "Alcance del cálculo: esta versión dimensiona ÚNICAMENTE la red de AGUA FRÍA (AF). La red de " +
      "ACS (agua caliente sanitaria) NO se dimensiona en esta versión —no se calculan sus caudales, " +
      "diámetros, presiones ni recirculación—; no debe asumirse cobertura de ACS.",
  );

  // Nota innegociable: K (UNE 149201), la estimación de pérdidas localizadas y la
  // serie de Ø comerciales (OV-7) son criterios EXTERNOS / DE PROYECTO, no
  // exigencias del DB-HS4.
  observaciones.push(
    `Criterios externos al DB-HS4 (no exigencias CTE): el coeficiente de simultaneidad ${
      result.kEsCriterioExterno
        ? `K = 1/√(n−1) procede de ${result.normaCriterioK ?? "UNE 149201"}`
        : "K = 1 (suma directa de caudales)"
    }; el DB-HS4 sólo remite a "un criterio adecuado" (ap. 4.2.1). La estimación de pérdidas localizadas (${
      PERDIDAS_LOCALIZADAS.datos.fraccionLongitudinalesMin_pct
    }–${
      PERDIDAS_LOCALIZADAS.datos.fraccionLongitudinalesMax_pct
    } % de las longitudinales) es buena práctica de cálculo de predimensionado, no cifra del DB. La selección de diámetros usa una serie de Ø comerciales (${SERIE_DIAMETROS_LABEL} mm): es un CRITERIO DE PROYECTO, no exigencia del CTE (el DB-HS4 sólo fija los Ø MÍNIMOS de las Tablas 4.2 y 4.3, que se respetan como cota inferior).`,
  );

  const { nativeW, nativeH } = hs4NativeSize(result);

  return {
    titulo: "HS4 — Suministro de agua (fontanería)",
    engineVersion: ENGINE_VERSION,
    edicionDB: "DB-HS4 (2009)",
    normativa,
    datosPartida,
    verificaciones,
    veredictoGlobal: result.veredictoGlobal,
    observaciones,
    svg: {
      elementId: HS4_PDF_SVG_ID,
      nativeW,
      nativeH,
      caption:
        "Esquema de la red de suministro: árbol de tramos con Ø, caudal de cálculo, velocidad y presión residual; recorrido crítico resaltado.",
    },
    inputs,
    slug: "hs4-fontaneria",
  };
}
