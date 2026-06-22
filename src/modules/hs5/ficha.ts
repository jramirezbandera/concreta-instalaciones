// =============================================================================
// DB-HS5 — Ficha justificativa. Transforma (inputs, result) del motor de cálculo
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
import type {
  HS5Inputs,
  HS5Result,
  ResultadoTramo,
  TipoTramo,
} from "./calc";
import type { TipoAparato } from "./tablas";
import { HS5_PDF_SVG_ID, hs5NativeSize } from "./svg-meta";
import {
  BAJANTES_TABLA_4_4,
  COLECTORES_TABLA_4_5,
  RAMALES_COLECTORES_TABLA_4_3,
  SIFONES,
  UD_APARATOS_TABLA_4_1,
  UD_POR_DIAMETRO_TABLA_4_2,
  VENT_PRIMARIA,
  VENT_SECUNDARIA,
  VENT_SECUNDARIA_ALTERNAS_TABLA_4_10,
  VENT_SECUNDARIA_CADA_PLANTA_TABLA_4_11,
  VENT_TERCIARIA,
  VENT_TERCIARIA_TABLA_4_12,
} from "./tablas";

// -----------------------------------------------------------------------------
// CONTRATO DE INTEGRACIÓN con svg.tsx (se hace EN PARALELO):
//  - El id del contenedor del clon oculto del SVG (modo 'pdf') que renderFicha
//    busca en el DOM se IMPORTA de ./svg (`HS5_PDF_SVG_ID`), única fuente de
//    verdad. ui.tsx DEBE montar el clon oculto del HS5SVG con ESE mismo id.
//  - El tamaño nativo (`nativeW/H`) se IMPORTA de ./svg (`hs5NativeSize`), única
//    fuente de verdad, para que `scale = CW / nativeW` de renderFicha no deforme
//    el raster.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Etiquetas legibles de cada tipo de aparato (para conceptos de la ficha).
// -----------------------------------------------------------------------------
const ETIQUETA_APARATO: Record<TipoAparato, string> = {
  lavabo: "Lavabo",
  bide: "Bidé",
  ducha: "Ducha",
  banera: "Bañera",
  inodoro_cisterna: "Inodoro con cisterna",
  inodoro_fluxometro: "Inodoro con fluxómetro",
  urinario_pedestal: "Urinario de pedestal",
  urinario_suspendido: "Urinario suspendido",
  urinario_bateria: "Urinario en batería",
  fregadero_cocina: "Fregadero de cocina",
  fregadero_lab_restaurante: "Fregadero (lab./restaurante)",
  lavadero: "Lavadero",
  vertedero: "Vertedero",
  fuente_beber: "Fuente para beber",
  sumidero_sifonico: "Sumidero sifónico",
  lavavajillas: "Lavavajillas",
  lavadora: "Lavadora",
  cuarto_bano_cisterna: "Cuarto de baño (con cisterna)",
  cuarto_bano_fluxometro: "Cuarto de baño (con fluxómetro)",
  cuarto_aseo_cisterna: "Cuarto de aseo (con cisterna)",
  cuarto_aseo_fluxometro: "Cuarto de aseo (con fluxómetro)",
};

/** Etiquetas legibles de cada tipo de tramo de la red. */
const ETIQUETA_TRAMO: Record<TipoTramo, string> = {
  ramal: "Ramal colector",
  bajante: "Bajante",
  colector: "Colector horizontal",
};

/** Nombre de presentación de un aparato: tipo + id, p.ej. "Lavabo (lav-1)". */
function nombreAparato(tipo: TipoAparato, id: string): string {
  return `${ETIQUETA_APARATO[tipo] ?? tipo} (${id})`;
}

/** Nombre de presentación de un tramo: tipo + id, p.ej. "Bajante (bajante)". */
function nombreTramo(t: Pick<ResultadoTramo, "tipo" | "id">): string {
  return `${ETIQUETA_TRAMO[t.tipo] ?? t.tipo} (${t.id})`;
}

/** Referencia compacta de una tabla para la columna "Ref." / "Origen". */
function refDe(proc: { db: string; tabla?: string; articulo?: string }): string {
  return `${proc.db} ${proc.tabla ?? proc.articulo ?? ""}`.trim();
}

/** Tabla de capacidad aplicable a un tramo según su tipo (para la columna "Ref."). */
function refTramo(tipo: TipoTramo): string {
  switch (tipo) {
    case "ramal":
      return refDe(RAMALES_COLECTORES_TABLA_4_3.procedencia); // Tabla 4.3
    case "bajante":
      return refDe(BAJANTES_TABLA_4_4.procedencia); // Tabla 4.4
    case "colector":
      return refDe(COLECTORES_TABLA_4_5.procedencia); // Tabla 4.5
  }
}

const USO_LABEL: Record<HS5Inputs["uso"], string> = {
  privado: "Privado (vivienda)",
  publico: "Público (no residencial)",
};

// -----------------------------------------------------------------------------
// TRANSFORMACIÓN: (inputs, result) → FichaData
// -----------------------------------------------------------------------------

/** Convierte (inputs, result) de HS5 en el FichaData que renderFicha pinta. */
export function toFichaData(inputs: HS5Inputs, result: HS5Result): FichaData {
  // ── Normativa de referencia (citas desde las procedencias) ────────────────
  const normativa: CitaNormativa[] = [
    citaDe(UD_APARATOS_TABLA_4_1.procedencia), // Tabla 4.1 — UD por aparato
    citaDe(UD_POR_DIAMETRO_TABLA_4_2.procedencia), // Tabla 4.2 — UD por Ø
    citaDe(RAMALES_COLECTORES_TABLA_4_3.procedencia), // Tabla 4.3 — ramales
    citaDe(BAJANTES_TABLA_4_4.procedencia), // Tabla 4.4 — bajantes
    citaDe(COLECTORES_TABLA_4_5.procedencia), // Tabla 4.5 — colectores
    citaDe(SIFONES.procedencia), // sifones / cierre hidráulico
    citaDe(VENT_PRIMARIA.procedencia), // ventilación primaria
    citaDe(VENT_SECUNDARIA.procedencia), // ventilación secundaria
    citaDe(VENT_SECUNDARIA_ALTERNAS_TABLA_4_10.procedencia), // Tabla 4.10
    citaDe(VENT_SECUNDARIA_CADA_PLANTA_TABLA_4_11.procedencia), // Tabla 4.11
    citaDe(VENT_TERCIARIA.procedencia), // ventilación terciaria
    citaDe(VENT_TERCIARIA_TABLA_4_12.procedencia), // Tabla 4.12
  ];

  const ref41 = refDe(UD_APARATOS_TABLA_4_1.procedencia); // "DB-HS5 Tabla 4.1"

  // ── Datos de partida (cada dato declara su ORIGEN) ────────────────────────
  const datosPartida: FilaDato[] = [
    {
      concepto: "Uso de la instalación",
      valor: USO_LABEL[inputs.uso],
      origen: "Entrada del usuario",
    },
    {
      concepto: "Nº de plantas servidas por las bajantes",
      valor: String(inputs.numPlantas),
      origen: "Entrada del usuario",
    },
    {
      concepto: "Cubierta",
      valor: inputs.cubiertaTransitable ? "Transitable" : "No transitable",
      origen: "Entrada del usuario",
    },
  ];

  // Una fila por aparato: tipo + UD (origen Tabla 4.1).
  for (const a of result.porAparato) {
    datosPartida.push({
      concepto: `Aparato — ${nombreAparato(a.tipo, a.id)}`,
      valor: `${fmt(a.ud, "UD")}${a.agrupado ? " (agrupado)" : ""}`,
      origen: ref41,
    });
  }

  // Pendiente de cada tramo dimensionable (ramales/colectores; la bajante es
  // vertical). Origen: entrada del usuario (default 2 %).
  for (const t of result.porTramo) {
    if (t.tipo === "bajante") continue;
    datosPartida.push({
      concepto: `Pendiente — ${nombreTramo(t)}`,
      valor: fmt(t.pendiente_pct, "%"),
      origen: "Entrada del usuario",
    });
  }

  // ── Verificaciones (comparación contra el límite normativo) ───────────────
  const verificaciones: FilaVerificacion[] = [];

  // Una fila por tramo del árbol: Ø resultante vs UD acumuladas ≤ capacidad de
  // la tabla aplicable (4.3 ramal / 4.4 bajante / 4.5 colector).
  for (const t of result.porTramo) {
    const cap =
      t.capacidad_ud != null ? `≤ ${fmt(t.capacidad_ud, "UD")}` : "sin Ø admisible";
    const diam = t.diametro_mm != null ? `Ø${fmt(t.diametro_mm, "mm", 0)}` : "—";
    verificaciones.push({
      concepto: nombreTramo(t),
      valor: `${diam} · ${fmt(t.udAcumuladas, "UD")}`,
      limite: cap,
      estado: t.estado,
      referencia: refTramo(t.tipo),
    });
  }

  // Ventilación de red (primaria / secundaria / terciaria). Es DIMENSIONADO:
  // su veredicto es neutral y NO degrada el global (el motor lo marca así).
  const v = result.ventilacion;
  verificaciones.push({
    concepto: "Ventilación primaria (prolongación sobre cubierta)",
    valor: v.primaria.suficienteSola ? "Suficiente sola" : "Requiere secundaria",
    limite: `≥ ${fmt(v.primaria.prolongacionMin_m, "m")}`,
    estado: v.primaria.estado,
    referencia: refDe(VENT_PRIMARIA.procedencia),
  });
  verificaciones.push({
    concepto: "Ventilación secundaria (columna)",
    valor:
      v.secundaria.diametroColumna_mm != null
        ? `Ø${fmt(v.secundaria.diametroColumna_mm, "mm", 0)}`
        : "No requerida",
    limite:
      v.secundaria.modo === "no_requerida"
        ? `< ${VENT_SECUNDARIA.datos.minPlantasObligatoria} plantas`
        : v.secundaria.modo === "alternas"
          ? "Plantas alternas (4.10)"
          : "Cada planta (4.11)",
    estado: v.secundaria.estado,
    referencia: refDe(VENT_SECUNDARIA.procedencia),
  });
  verificaciones.push({
    concepto: "Ventilación terciaria (ramales)",
    valor: v.terciaria.obligatoria ? "Obligatoria" : "No requerida",
    limite: `ramales ≤ ${fmt(VENT_TERCIARIA.datos.longitudRamalObligatoria_m, "m")}`,
    estado: v.terciaria.estado,
    referencia: refDe(VENT_TERCIARIA.procedencia),
  });

  // ── Observaciones ─────────────────────────────────────────────────────────
  const observaciones: string[] = [
    ...result.warnings,
    `Ventilación de red: ${v.primaria.aviso} ${v.secundaria.aviso} ${v.terciaria.aviso} El dimensionado de la ventilación es un resultado NEUTRAL: no entra en el veredicto global.`,
  ];

  const { nativeW, nativeH } = hs5NativeSize(result);

  return {
    titulo: "HS5 — Evacuación de aguas (saneamiento)",
    engineVersion: ENGINE_VERSION,
    edicionDB: "DB-HS5 (2009)",
    normativa,
    datosPartida,
    verificaciones,
    veredictoGlobal: result.veredictoGlobal,
    observaciones,
    svg: {
      elementId: HS5_PDF_SVG_ID,
      nativeW,
      nativeH,
      caption:
        "Esquema de la red de evacuación: bajantes y colectores con Ø, UD y pendiente.",
    },
    inputs,
    slug: "hs5-saneamiento",
  };
}
