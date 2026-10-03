// DB-HE1 — Pantalla del módulo de ENVOLVENTE TÉRMICA. Cablea el motor (./calc),
// el render SVG (./svg) y la ficha PDF (./ficha) sobre el esqueleto de feature-6
// (<ModuleShell>) con la ZONA DE TRABAJO de feature-8 §B: réplica del módulo
// patrón (HS5/HS4: outliner + esquema sincronizado) sobre el modelo POR-ELEMENTO
// de HE1 — cerramiento (depth 0) → capas (depth 1, de INTERIOR a EXTERIOR) →
// puentes térmicos (depth 1, kind "puente", tras las capas).
//
// SEMÁNTICA DEL ÁRBOL: la jerarquía es FIJA por construcción (una capa pertenece
// a su cerramiento; no hay Tab/Shift-Tab → `anidable:false` en todo). El ORDEN
// del array de capas ES la física del muro (interior→exterior): Enter inserta la
// capa nueva TRAS la fila de referencia; el reordenado fino se hace borrando e
// insertando en esta fase (sin drag & drop, fuera de alcance de feature-8).
//
// PACKING DE COLUMNAS (decisiones dentro del patrón HS4 de columnas fusionadas):
//  - "Tipo / Material": cerramiento→tipoElemento · capa→material CEC (con opción
//    "— personalizado" que deja λ/µ manuales) · puente→tipo de encuentro (DA/3).
//  - "Flujo / L": cerramiento→select de flujo EXTENDIDO con la variante
//    "· interior" que codifica `caraInterior` (Tabla 6 DA/1: no habitable /
//    partición) — así el flag queda editable sin columna propia ni checkbox;
//    puente→longitud L [m]; capa→vacío.
//  - Las unidades de e/λ/R/Sd van en la CABECERA (no en cada celda) para
//    mantener la fila densa; la única unidad en celda es la L del puente (m),
//    porque comparte columna con un select.
//  - "U / R" (resultado mono): cerramiento "U 0,38 ≤ 0,49" (límite efectivo =
//    mín(Ulim, U_max_fRsi)); capa "R 1,76" (su R calculada); puente "ψ·L …"
//    (informativo, dim).
//  - "Estado": cerramiento = veredicto con `extra` acumulando "condensa"
//    (Glaser) y "fRsi ✗"; capa = "≈ λ tabla" dim si λ es orientativa del CEC.
//  - En los numéricos OPCIONALES (λ, R directa, µ, Sd) el vacío o el 0 del
//    input equivalen a "sin dato" (undefined): el editor inline del outliner
//    entrega Number("")=0, y un 0 no es un valor útil en ninguno de ellos.
//
// React 19 + React Compiler: componente PURO; cálculo síncrono en render sobre
// el estado diferido; ids deterministas en handlers (sin Math.random/Date);
// mutaciones inmutables. Los puentes NO tienen id en el modelo (PuenteInput):
// sus filas usan un id sintético por índice `${cerId}::ptN` (estable mientras no
// se borre un puente anterior; suficiente para selección/borrado).

import { useDeferredValue, useMemo, useState, type JSX, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useJustificacionState } from "../../hooks/useJustificacionState";
import { useContainerWidth } from "../../hooks/useContainerWidth";
import { usePdfPreview } from "../../hooks/usePdfPreview";
import { ModuleShell, type ResumenVeredicto } from "../../components/justificacion/ModuleShell";
import { PdfPreviewModal } from "../../components/ui/PdfPreviewModal";
import { MobileTabBar } from "../../components/ui/MobileTabBar";
import { CollapsibleSection } from "../../components/ui/CollapsibleSection";
import { Field, NumberInput, SelectInput } from "../../components/ui/InputLabel";
import { showToast } from "../../components/ui/Toast";
import { Outliner } from "../../components/outliner/Outliner";
import type {
  OutlinerCelda,
  OutlinerColumna,
  OutlinerFila,
} from "../../components/outliner/tipos";
import { renderFicha } from "../../lib/pdf/renderFicha";
import { STATUS_LABEL } from "../../lib/pdf/utils";
import { STATE_TEXT } from "../../lib/ui/veredicto";
import { fmt } from "../../lib/units/format";
import { notasExcepcionesLocales } from "../../lib/proyecto/herencia";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import {
  calcHE1,
  he1Defaults,
  type CapaInput,
  type CerramientoInput,
  type HE1Inputs,
  type HE1Result,
  type PuenteInput,
  type ResultadoCerramientoHE1,
} from "./calc";
import {
  CONDICIONES_DEFECTO,
  LAMBDA_REFERENCIA,
  PSI_PUENTES_TERMICOS_DA_DB_HE_3,
  psiDe,
  type ClaseHigrometria,
  type DireccionFlujo,
  type MaterialReferencia,
  type TipoElemento,
  type TipoEncuentroPT,
} from "./tablas";
import { He1SVG } from "./svg";
// Contrato feature-8 con svg-meta: `he1NativeSizeUno` dimensiona el viewBox del
// esquema de UN SOLO cerramiento (el que muestra el panel lateral), igual que
// `he1NativeSize` hace con el multi del clon PDF.
import { HE1_PDF_SVG_ID, he1NativeSize, he1NativeSizeUno } from "./svg-meta";
import { toFichaData } from "./ficha";
import { resumenHe1 } from "./resumen";

// -----------------------------------------------------------------------------
// Opciones de los selects (declaradas a módulo: estables entre renders).
// -----------------------------------------------------------------------------

// Clase de higrometría del espacio interior (EN ISO 13788, recogida en DA DB-HE/2).
const CLASE_HIGROMETRIA_OPTIONS: { value: ClaseHigrometria; label: string }[] = [
  { value: "clase_3_o_inferior", label: "Clase ≤ 3 — residencial (HR 55 %)" },
  { value: "clase_4", label: "Clase 4 — alta humedad (HR 62 %)" },
  { value: "clase_5", label: "Clase 5 — gran humedad (HR 70 %)" },
];

const TIPO_ELEMENTO_OPTIONS: { value: TipoElemento; label: string }[] = [
  { value: "muro_suelo_exterior", label: "Muro / suelo exterior (UM, US)" },
  { value: "cubierta_exterior", label: "Cubierta exterior (UC)" },
  { value: "contacto_no_habitable_terreno", label: "Contacto no habitable / terreno (UT)" },
  { value: "hueco", label: "Hueco (UH)" },
  { value: "puerta", label: "Puerta" },
  { value: "medianeria", label: "Medianería / partición (UMD)" },
];

// Columna "Flujo / L" del cerramiento: flujo de calor (selecciona Rsi/Rse del
// DA DB-HE/1) EXTENDIDO con la variante "· interior" que codifica `caraInterior`
// (Tabla 6: ambas caras interiores — no habitable / partición). El value usa el
// separador "|int"; el onChange lo parsea y fija `caraInterior` EXPLÍCITO (true/
// false), lo que también permite anular el default implícito del tipo UT.
const FLUJO_SEP = "|int";
const FLUJO_OPTIONS: { value: string; label: string }[] = [
  { value: "horizontal", label: "Horizontal (muro)" },
  { value: "ascendente", label: "Ascendente (cubierta)" },
  { value: "descendente", label: "Descendente (suelo)" },
  { value: `horizontal${FLUJO_SEP}`, label: "Horizontal · interior" },
  { value: `ascendente${FLUJO_SEP}`, label: "Ascendente · interior" },
  { value: `descendente${FLUJO_SEP}`, label: "Descendente · interior" },
];

// Sentinela para "sin material" en el select de capa (λ/R/µ/Sd manuales).
const MATERIAL_NINGUNO = "";

// Material de capa = claves de LAMBDA_REFERENCIA (CEC, orientativas). La primera
// opción deja la capa SIN material: λ/µ manuales, cámara con R directa, o
// barrera de vapor con Sd declarado.
const MATERIAL_OPTIONS: { value: string; label: string }[] = [
  { value: MATERIAL_NINGUNO, label: "— personalizado (λ / R manual)" },
  ...(Object.keys(LAMBDA_REFERENCIA.datos.lambda_W_mK) as MaterialReferencia[]).map((k) => ({
    value: k,
    label: LAMBDA_REFERENCIA.datos.lambda_W_mK[k].descripcion,
  })),
];

// Tipo de encuentro del puente térmico (DA DB-HE/3, ψ orientativos).
const PUENTE_OPTIONS: { value: string; label: string }[] = (
  Object.keys(PSI_PUENTES_TERMICOS_DA_DB_HE_3.datos.psi) as TipoEncuentroPT[]
).map((k) => ({
  value: k,
  label: PSI_PUENTES_TERMICOS_DA_DB_HE_3.datos.psi[k].descripcion,
}));

const ESTADO_LABEL: Record<string, string> = {
  ok: "Cumple",
  warn: "Aviso",
  fail: "No cumple",
  neutral: "Informativo",
};

// Columnas del outliner HE1 (ver decisiones de packing en la cabecera): inputs
// (nombre, tipo/material, flujo/L, e, λ, R, µ, Sd) y resultados (U/R, estado)
// en la MISMA fila. Unidades de los numéricos en la cabecera.
const COLUMNAS_HE1: OutlinerColumna[] = [
  { key: "elemento", header: "Elemento", align: "left" },
  { key: "tipo", header: "Tipo / Material", align: "left", width: "190px" },
  { key: "flujo", header: "Flujo / L", align: "left", width: "150px" },
  { key: "e", header: "e (m)", align: "right", width: "76px" },
  { key: "lambda", header: "λ (W/mK)", align: "right", width: "76px" },
  { key: "r", header: "R (m²K/W)", align: "right", width: "80px" },
  { key: "mu", header: "µ", align: "right", width: "68px" },
  { key: "sd", header: "Sd (m)", align: "right", width: "72px" },
  { key: "ur", header: "U / R", align: "right", width: "108px" },
  { key: "estado", header: "Estado", align: "left", width: "168px" },
];

type TabHe1 = "tabla" | "esquema";
const TABS_HE1: { id: TabHe1; label: string }[] = [
  { id: "tabla", label: "Tabla" },
  { id: "esquema", label: "Esquema" },
];

// -----------------------------------------------------------------------------
// Ids deterministas (contador derivado del estado actual; solo en handlers).
// -----------------------------------------------------------------------------
function nextId(items: { id: string }[], prefix: string): string {
  const re = new RegExp(`^${prefix}(\\d+)$`);
  let max = 0;
  for (const it of items) {
    const m = re.exec(it.id);
    if (m) {
      const n = Number(m[1]);
      if (n > max) max = n;
    }
  }
  return `${prefix}${max + 1}`;
}

// Ids sintéticos de fila de puente (PuenteInput no tiene id en el modelo).
const PUENTE_ROW_SEP = "::pt";
function puenteRowId(cerId: string, indice: number): string {
  return `${cerId}${PUENTE_ROW_SEP}${indice}`;
}

/** Numérico OPCIONAL desde el editor inline: vacío o ≤0 ⇒ sin dato (undefined). */
function opcional(v: number): number | undefined {
  return Number.isFinite(v) && v > 0 ? v : undefined;
}

/** Alias mapeado de HE1Inputs (mismo truco que Hs5State: interface → Record). */
type He1State = { [K in keyof HE1Inputs]: HE1Inputs[K] };

/** Resolución de un id de fila del outliner sobre el estado actual. */
type SelInfo =
  | { clase: "cerramiento"; cer: CerramientoInput }
  | { clase: "capa"; cer: CerramientoInput; capa: CapaInput }
  | { clase: "puente"; cer: CerramientoInput; indice: number };

export function He1Module(): JSX.Element {
  const { state, setField, reset, herencia } = useJustificacionState<He1State>(
    "he1",
    he1Defaults,
  );
  const { proyecto, derivados } = useProyecto();
  const [tab, setTab] = useState<TabHe1>("tabla");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [esquemaPlegado, setEsquemaPlegado] = useState(false);

  const deferredState = useDeferredValue(state);
  const result = useMemo(() => calcHE1(deferredState), [deferredState]);

  // ── Validación de entrada (paridad con la versión anterior) ────────────────
  const condFinitas =
    (state.tempInterior_C === undefined || Number.isFinite(state.tempInterior_C)) &&
    (state.hrInterior_pct === undefined || Number.isFinite(state.hrInterior_pct)) &&
    (state.tempExteriorEnero_C === undefined || Number.isFinite(state.tempExteriorEnero_C)) &&
    (state.hrExterior_pct === undefined || Number.isFinite(state.hrExterior_pct));
  const valid =
    state.cerramientos.length >= 1 &&
    state.cerramientos.every(
      (c) =>
        c.capas.length >= 1 &&
        c.capas.every((k) => Number.isFinite(k.espesor_m) && k.espesor_m >= 0),
    ) &&
    condFinitas;

  /** Resuelve un id de fila (cerramiento / capa / puente sintético) o null. */
  const resolverSel = (id: string | null): SelInfo | null => {
    if (id === null) return null;
    const sep = id.lastIndexOf(PUENTE_ROW_SEP);
    if (sep > 0) {
      const cer = state.cerramientos.find((c) => c.id === id.slice(0, sep));
      const indice = Number(id.slice(sep + PUENTE_ROW_SEP.length));
      if (cer && Number.isInteger(indice) && indice >= 0 && indice < (cer.puentes?.length ?? 0)) {
        return { clase: "puente", cer, indice };
      }
      return null;
    }
    for (const cer of state.cerramientos) {
      if (cer.id === id) return { clase: "cerramiento", cer };
      const capa = cer.capas.find((k) => k.id === id);
      if (capa) return { clase: "capa", cer, capa };
    }
    return null;
  };

  const sel = resolverSel(selectedId);
  const selVigente = sel !== null ? selectedId : null;

  // Ficha con cabecera de expediente (patrón de feature-6, sin cambios): el
  // clon PDF sigue pintando TODOS los cerramientos a tamaño nativo completo.
  const { pdfExporting, pdfPreview, handleExportPdf, handleDownloadPdf, closePdfPreview } =
    usePdfPreview(() => {
      const base = toFichaData(deferredState, result);
      return renderFicha({
        ...base,
        proyecto: proyecto.nombre,
        fechaProyecto: formatearFecha(proyecto.modificado),
        observaciones: [
          ...(base.observaciones ?? []),
          ...notasExcepcionesLocales({
            key: "he1",
            dg: proyecto.datosGenerales,
            d: derivados,
            state: deferredState,
            overrides: herencia.campos.filter((c) => c.override).map((c) => c.campo),
          }),
        ],
      });
    }, valid);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Enlace copiado al portapapeles", { autoDismiss: 2500 });
    } catch {
      showToast("No se pudo copiar el enlace", { autoDismiss: 3000 });
    }
  };

  // ── Mutaciones inmutables ──────────────────────────────────────────────────
  const patchCerramiento = (id: string, patch: Partial<CerramientoInput>) => {
    setField(
      "cerramientos",
      state.cerramientos.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  };

  const patchCapa = (cerId: string, capaId: string, patch: Partial<CapaInput>) => {
    setField(
      "cerramientos",
      state.cerramientos.map((c) =>
        c.id === cerId
          ? { ...c, capas: c.capas.map((k) => (k.id === capaId ? { ...k, ...patch } : k)) }
          : c,
      ),
    );
  };

  const patchPuente = (cerId: string, indice: number, patch: Partial<PuenteInput>) => {
    setField(
      "cerramientos",
      state.cerramientos.map((c) =>
        c.id === cerId
          ? {
              ...c,
              puentes: (c.puentes ?? []).map((p, i) => (i === indice ? { ...p, ...patch } : p)),
            }
          : c,
      ),
    );
  };

  /** Cerramiento nuevo (defaults del alta clásica), insertado en `indice`. */
  const insertarCerramiento = (indice: number) => {
    const id = nextId(state.cerramientos, "cer-");
    const nuevo: CerramientoInput = {
      id,
      nombre: `Cerramiento ${state.cerramientos.length + 1}`,
      tipoElemento: "muro_suelo_exterior",
      direccionFlujo: "horizontal",
      capas: [{ id: `${id}-cap-1`, material: "ladrillo_ceramico_perforado", espesor_m: 0.115 }],
    };
    setField("cerramientos", [
      ...state.cerramientos.slice(0, indice),
      nuevo,
      ...state.cerramientos.slice(indice),
    ]);
    setSelectedId(id);
  };

  /**
   * Capa nueva TRAS `indice` (o al final con indice = capas.length − 1). El
   * orden del array ES la física del muro (interior→exterior): insertar tras la
   * fila de referencia coloca la capa nueva justo "más al exterior" que ella.
   */
  const insertarCapa = (cer: CerramientoInput, indice: number) => {
    const capaId = nextId(
      cer.capas.map((k) => ({ id: k.id })),
      `${cer.id}-cap-`,
    );
    const nueva: CapaInput = { id: capaId, material: "xps", espesor_m: 0.04 };
    patchCerramiento(cer.id, {
      capas: [...cer.capas.slice(0, indice + 1), nueva, ...cer.capas.slice(indice + 1)],
    });
    setSelectedId(capaId);
  };

  /** Puente nuevo TRAS `indice` (o al final con indice = puentes.length − 1). */
  const insertarPuente = (cer: CerramientoInput, indice: number) => {
    const puentes = cer.puentes ?? [];
    const nuevo: PuenteInput = { tipo: "frente_forjado", longitud_m: 1 };
    patchCerramiento(cer.id, {
      puentes: [...puentes.slice(0, indice + 1), nuevo, ...puentes.slice(indice + 1)],
    });
    setSelectedId(puenteRowId(cer.id, indice + 1));
  };

  /**
   * Enter / botón "+ Añadir cerramiento": en fila cerramiento añade un
   * cerramiento hermano tras él; en capa, una capa tras ella (mismo
   * cerramiento); en puente, otro puente tras él; sin referencia (footer),
   * un cerramiento al final.
   */
  const handleAdd = (afterId: string | null) => {
    const ref = resolverSel(afterId);
    if (ref === null) {
      insertarCerramiento(state.cerramientos.length);
      return;
    }
    if (ref.clase === "cerramiento") {
      insertarCerramiento(state.cerramientos.findIndex((c) => c.id === ref.cer.id) + 1);
    } else if (ref.clase === "capa") {
      insertarCapa(ref.cer, ref.cer.capas.findIndex((k) => k.id === ref.capa.id));
    } else {
      insertarPuente(ref.cer, ref.indice);
    }
  };

  // Cerramiento OBJETIVO de la toolbar ("+ Capa" / "+ Puente térmico"): el de la
  // selección actual, o el último si no hay selección (siempre hay ≥1).
  const cerObjetivo = sel?.cer ?? state.cerramientos[state.cerramientos.length - 1];

  /** Borrado con mínimos: ≥1 cerramiento en total y ≥1 capa por cerramiento. */
  const handleRemove = (id: string) => {
    const ref = resolverSel(id);
    if (ref === null) return;
    if (ref.clase === "cerramiento") {
      if (state.cerramientos.length <= 1) return;
      setField(
        "cerramientos",
        state.cerramientos.filter((c) => c.id !== ref.cer.id),
      );
    } else if (ref.clase === "capa") {
      if (ref.cer.capas.length <= 1) return;
      patchCerramiento(ref.cer.id, {
        capas: ref.cer.capas.filter((k) => k.id !== ref.capa.id),
      });
    } else {
      patchCerramiento(ref.cer.id, {
        puentes: (ref.cer.puentes ?? []).filter((_, i) => i !== ref.indice),
      });
    }
    if (selectedId === id) setSelectedId(null);
  };

  // Jerarquía FIJA: sin anidar/desanidar (todas las filas son `anidable:false`,
  // el Outliner ni siquiera intercepta Tab). Handlers inertes por contrato.
  const handleNest = (_id: string) => {};
  const handleUnnest = (_id: string) => {};

  // ── Proyección estado+resultado → filas del outliner ───────────────────────
  const resultadoCer = new Map(result.porCerramiento.map((r) => [r.id, r] as const));

  const filaCerramiento = (c: CerramientoInput): OutlinerFila => {
    const r = resultadoCer.get(c.id);
    // Valor del select Flujo/L: flujo + variante "· interior" (caraInterior
    // efectivo, incluido el default implícito de contacto no habitable/terreno).
    const interior = c.caraInterior ?? c.tipoElemento === "contacto_no_habitable_terreno";
    const flujoValor = `${c.direccionFlujo}${interior ? FLUJO_SEP : ""}`;
    // Marcadores multicanal junto al estado (texto, no solo color): posible
    // condensación intersticial (Glaser) y fallo de la superficial (fRsi).
    const marcas = r
      ? [
          r.glaser.condensaIntersticial ? "condensa" : null,
          !r.cumpleFRsi ? "fRsi ✗" : null,
        ].filter((m): m is string => m !== null)
      : [];
    const celdas: OutlinerCelda[] = [
      {
        tipo: "nombre",
        valor: c.nombre,
        onChange: (v) => patchCerramiento(c.id, { nombre: v }),
      },
      {
        tipo: "select",
        valor: c.tipoElemento,
        opciones: TIPO_ELEMENTO_OPTIONS,
        onChange: (v) => patchCerramiento(c.id, { tipoElemento: v as TipoElemento }),
      },
      {
        tipo: "select",
        valor: flujoValor,
        opciones: FLUJO_OPTIONS,
        onChange: (v) => {
          const int = v.endsWith(FLUJO_SEP);
          const flujo = (int ? v.slice(0, -FLUJO_SEP.length) : v) as DireccionFlujo;
          patchCerramiento(c.id, { direccionFlujo: flujo, caraInterior: int });
        },
      },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: "", dim: true },
      {
        tipo: "texto",
        valor: r ? `U ${fmt(r.u_W_m2K, undefined, 2)} ≤ ${fmt(limiteUDe(r), undefined, 2)}` : "—",
        mono: true,
      },
      r
        ? { tipo: "estado", veredicto: r.estado, extra: marcas.join(" · ") || undefined }
        : { tipo: "texto", valor: "—", dim: true },
    ];
    return {
      id: c.id,
      depth: 0,
      kind: "cerramiento",
      anidable: false,
      borrable: state.cerramientos.length > 1,
      celdas,
    };
  };

  const filaCapa = (cer: CerramientoInput, capa: CapaInput, indice: number): OutlinerFila => {
    const rc = resultadoCer.get(cer.id)?.capas[indice];
    const celdas: OutlinerCelda[] = [
      {
        tipo: "nombre",
        valor: capa.nombre ?? capa.id,
        onChange: (v) => patchCapa(cer.id, capa.id, { nombre: v }),
      },
      {
        tipo: "select",
        valor: capa.material ?? MATERIAL_NINGUNO,
        opciones: MATERIAL_OPTIONS,
        onChange: (v) =>
          patchCapa(
            cer.id,
            capa.id,
            v === MATERIAL_NINGUNO
              ? { material: undefined }
              : { material: v as MaterialReferencia },
          ),
      },
      { tipo: "texto", valor: "", dim: true },
      {
        tipo: "numero",
        valor: capa.espesor_m,
        onChange: (v) =>
          patchCapa(cer.id, capa.id, { espesor_m: Number.isFinite(v) && v >= 0 ? v : 0 }),
        min: 0,
        step: 0.005,
      },
      {
        tipo: "numero",
        valor: capa.lambda_W_mK,
        onChange: (v) => patchCapa(cer.id, capa.id, { lambda_W_mK: opcional(v) }),
        min: 0,
        step: 0.01,
      },
      {
        tipo: "numero",
        valor: capa.resistencia_m2K_W,
        onChange: (v) => patchCapa(cer.id, capa.id, { resistencia_m2K_W: opcional(v) }),
        min: 0,
        step: 0.05,
      },
      {
        tipo: "numero",
        valor: capa.mu,
        onChange: (v) => patchCapa(cer.id, capa.id, { mu: opcional(v) }),
        min: 0,
        step: 1,
      },
      {
        tipo: "numero",
        valor: capa.sd_m,
        onChange: (v) => patchCapa(cer.id, capa.id, { sd_m: opcional(v) }),
        min: 0,
        step: 0.5,
      },
      {
        tipo: "texto",
        valor: rc ? `R ${fmt(rc.resistencia_m2K_W, undefined, 2)}` : "—",
        mono: true,
      },
      // Marca de dato orientativo: λ tomada de la tabla CEC (no del fabricante).
      rc?.lambdaOrientativa
        ? { tipo: "texto", valor: "≈ λ tabla", dim: true }
        : { tipo: "texto", valor: "", dim: true },
    ];
    return {
      id: capa.id,
      depth: 1,
      kind: "capa",
      anidable: false,
      borrable: cer.capas.length > 1,
      celdas,
    };
  };

  const filaPuente = (cer: CerramientoInput, p: PuenteInput, indice: number): OutlinerFila => {
    const rowId = puenteRowId(cer.id, indice);
    const L = Number.isFinite(p.longitud_m) && p.longitud_m >= 0 ? p.longitud_m : 0;
    const psiL = psiDe(p.tipo).psi_W_mK * L;
    const celdas: OutlinerCelda[] = [
      { tipo: "texto", valor: "Puente térmico", dim: true },
      {
        tipo: "select",
        valor: p.tipo,
        opciones: PUENTE_OPTIONS,
        onChange: (v) => patchPuente(cer.id, indice, { tipo: v as TipoEncuentroPT }),
      },
      {
        tipo: "numero",
        valor: p.longitud_m,
        onChange: (v) =>
          patchPuente(cer.id, indice, { longitud_m: Number.isFinite(v) && v >= 0 ? v : 0 }),
        min: 0,
        step: 0.5,
        unidad: "m",
      },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: `ψ·L ${fmt(psiL, undefined, 2)}`, mono: true, dim: true },
      // H_PT es INFORMATIVO (ψ orientativos DA/3): no lleva veredicto.
      { tipo: "texto", valor: "ψ orientativo", dim: true },
    ];
    return { id: rowId, depth: 1, kind: "puente", anidable: false, borrable: true, celdas };
  };

  const filas: OutlinerFila[] = [];
  for (const c of state.cerramientos) {
    filas.push(filaCerramiento(c));
    c.capas.forEach((k, i) => filas.push(filaCapa(c, k, i)));
    (c.puentes ?? []).forEach((p, i) => filas.push(filaPuente(c, p, i)));
  }

  // Etiquetas legibles (id→nombre) para el esquema y el pie de selección.
  const etiquetas: Record<string, string> = {};
  for (const c of state.cerramientos) {
    etiquetas[c.id] = c.nombre;
    for (const k of c.capas) etiquetas[k.id] = k.nombre ?? k.id;
  }

  // ── Cerramiento del panel de esquema (contrato feature-8) ──────────────────
  // El seleccionado (o el del PEOR estado si no hay selección): en pantalla el
  // panel muestra UN solo cerramiento apilado (sección + barra U + Glaser).
  const RANGO: Record<string, number> = { fail: 3, warn: 2, neutral: 1, ok: 0 };
  let soloCerramientoId: string | null = sel?.cer.id ?? null;
  if (soloCerramientoId === null) {
    let peorRango = -1;
    for (const r of result.porCerramiento) {
      const rango = RANGO[r.estado] ?? 0;
      if (rango > peorRango) {
        peorRango = rango;
        soloCerramientoId = r.id;
      }
    }
  }

  // Pie de selección del panel de esquema.
  let textoSeleccion: string | null = null;
  if (sel !== null) {
    if (sel.clase === "cerramiento") {
      const r = resultadoCer.get(sel.cer.id);
      if (r) {
        textoSeleccion =
          `${sel.cer.nombre} — U ${fmt(r.u_W_m2K, undefined, 2)} ≤ ` +
          `${fmt(limiteUDe(r), undefined, 2)} · ${ESTADO_LABEL[r.estado]}`;
      }
    } else if (sel.clase === "capa") {
      const indice = sel.cer.capas.findIndex((k) => k.id === sel.capa.id);
      const rc = resultadoCer.get(sel.cer.id)?.capas[indice];
      textoSeleccion =
        `${sel.capa.nombre ?? sel.capa.id} — e ${fmt(sel.capa.espesor_m, "m", 3)}` +
        (rc ? ` · R ${fmt(rc.resistencia_m2K_W, undefined, 2)}` : "");
    } else {
      const p = (sel.cer.puentes ?? [])[sel.indice];
      const fila = psiDe(p.tipo);
      const L = Number.isFinite(p.longitud_m) && p.longitud_m >= 0 ? p.longitud_m : 0;
      textoSeleccion =
        `${fila.descripcion} — L ${fmt(L, "m", 1)} · ψ·L ${fmt(fila.psi_W_mK * L, "W/K", 2)}`;
    }
  }

  // Tamaño del esquema del panel: proporción del viewBox nativo de UN
  // cerramiento (el completo solo si no hay ninguno que mostrar).
  const [canvasRef, canvasWidth] = useContainerWidth();
  const nativoAside =
    soloCerramientoId !== null
      ? he1NativeSizeUno(result, soloCerramientoId)
      : he1NativeSize(result);
  const svgW =
    canvasWidth !== undefined && canvasWidth > 0
      ? Math.max(240, Math.min(560, canvasWidth - 24))
      : 348;
  const svgH = Math.round(
    nativoAside.nativeW > 0 ? (svgW * nativoAside.nativeH) / nativoAside.nativeW : svgW * 1.2,
  );

  // Clon PDF: SIEMPRE todos los cerramientos a tamaño nativo completo (la ficha
  // no cambia en feature-8).
  const { nativeW: pdfW, nativeH: pdfH } = he1NativeSize(result);

  const resumen: ResumenVeredicto | null = useMemo(
    () => (valid ? resumenHe1(result) : null),
    [valid, result],
  );

  // Defaults del DA DB-HE/2 para la ayuda de condiciones interiores.
  const cd = CONDICIONES_DEFECTO.datos;
  const tempInteriorDefault = cd.tempInterior_C;
  const hrInteriorDefault = cd.hrInterior_pct[state.claseHigrometria];

  return (
    <ModuleShell
      justificacionKey="he1"
      resultado={resumen}
      herencia={herencia}
      acciones={{
        onExportPdf: handleExportPdf,
        pdfExporting,
        onShare: handleShare,
        onReset: reset,
      }}
    >
      <MobileTabBar<TabHe1> tab={tab} setTab={setTab} tabs={TABS_HE1} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Tabla (outliner) + ambiente + detalle. En móvil, pestaña "tabla". */}
        <div
          className={[
            "scroll-hide min-w-0 flex-col overflow-y-auto px-4 py-4 lg:px-6",
            "lg:flex lg:flex-1",
            tab === "tabla" ? "flex flex-1" : "hidden",
          ].join(" ")}
        >
          {/* Formulario corto (no-colecciones, fuera del outliner): clase de
              higrometría + condiciones de cálculo T/HR. La zona climática es
              heredada (chips de la BarraContexto del shell). */}
          <div className="max-w-2xl">
            <CollapsibleSection
              label="Ambiente y condiciones de cálculo"
              refNorma="DA DB-HE/2 / DB-HE (Anejo climático)"
            >
              <div className="grid gap-x-6 sm:grid-cols-2">
                <Field
                  id="clase-higrometria"
                  label="Higrometría"
                  help="Clase de higrometría del espacio interior (EN ISO 13788, recogida en el DA DB-HE/2). Las viviendas y, en general, los espacios residenciales son clase ≤ 3. Fija el fRsi,min y la HR interior de cálculo (55 / 62 / 70 %)."
                  refText="DA DB-HE/2"
                >
                  <SelectInput<ClaseHigrometria>
                    id="clase-higrometria"
                    value={state.claseHigrometria}
                    options={CLASE_HIGROMETRIA_OPTIONS}
                    onChange={(v) => setField("claseHigrometria", v)}
                  />
                </Field>
                <Field
                  id="temp-interior"
                  label="Temp. interior"
                  sub="θi"
                  unit="°C"
                  help={`Temperatura interior de cálculo. Si se deja vacío, se usa el default del DA DB-HE/2 (${tempInteriorDefault} °C).`}
                  refText="DA DB-HE/2 (condiciones interiores)"
                >
                  <NumberInput
                    id="temp-interior"
                    value={state.tempInterior_C ?? Number.NaN}
                    onChange={(v) => setField("tempInterior_C", Number.isFinite(v) ? v : undefined)}
                    step={1}
                  />
                </Field>
                <Field
                  id="hr-interior"
                  label="HR interior"
                  sub="φi"
                  unit="%"
                  help={`Humedad relativa interior. Si se deja vacío, la del DA DB-HE/2 por clase de higrometría (ahora ${hrInteriorDefault} %).`}
                  refText="DA DB-HE/2 (condiciones interiores)"
                >
                  <NumberInput
                    id="hr-interior"
                    value={state.hrInterior_pct ?? Number.NaN}
                    onChange={(v) => setField("hrInterior_pct", Number.isFinite(v) ? v : undefined)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </Field>
                <Field
                  id="temp-exterior"
                  label="Temp. ext. enero"
                  sub="θe"
                  unit="°C"
                  help="DATO CLIMÁTICO: temperatura media del mes de ENERO de la localidad (Anejo climático del DB-HE), no una constante del DA. Sin este dato no hay cálculo de condensación realista; si se omite, el motor usa un valor conservador y avisa."
                  refText="DB-HE (Anejo climático) — dato de la localidad"
                >
                  <NumberInput
                    id="temp-exterior"
                    value={state.tempExteriorEnero_C ?? Number.NaN}
                    onChange={(v) =>
                      setField("tempExteriorEnero_C", Number.isFinite(v) ? v : undefined)
                    }
                    step={1}
                  />
                </Field>
                <Field
                  id="hr-exterior"
                  label="HR ext. enero"
                  sub="φe"
                  unit="%"
                  help="DATO CLIMÁTICO: humedad relativa media del mes de ENERO de la localidad (Anejo climático del DB-HE). Si se omite, el motor usa el default informativo del DA DB-HE/2 (~85 %) y avisa."
                  refText="DB-HE (Anejo climático) — dato de la localidad"
                >
                  <NumberInput
                    id="hr-exterior"
                    value={state.hrExterior_pct ?? Number.NaN}
                    onChange={(v) => setField("hrExterior_pct", Number.isFinite(v) ? v : undefined)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </Field>
              </div>
            </CollapsibleSection>
          </div>

          <div className="overflow-x-auto">
            <Outliner
              columnas={COLUMNAS_HE1}
              filas={filas}
              selectedId={selVigente}
              onSelect={setSelectedId}
              onHover={setHoverId}
              onAdd={handleAdd}
              onNest={handleNest}
              onUnnest={handleUnnest}
              onRemove={handleRemove}
              etiquetaAdd="+ Añadir cerramiento"
              toolbar={
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => insertarCapa(cerObjetivo, cerObjetivo.capas.length - 1)}
                    title={`Añadir una capa al final de «${cerObjetivo.nombre}» (lado exterior)`}
                    className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary rounded border px-2 py-0.5 text-[11px] transition-colors"
                  >
                    + Capa
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertarPuente(cerObjetivo, (cerObjetivo.puentes?.length ?? 0) - 1)
                    }
                    title={`Añadir un puente térmico a «${cerObjetivo.nombre}»`}
                    className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary rounded border px-2 py-0.5 text-[11px] transition-colors"
                  >
                    + Puente térmico
                  </button>
                </div>
              }
            />
          </div>

          {/* Detalle bajo la tabla: lo que no cabe en las filas (fRsi, Glaser,
              H_PT y notas por cerramiento) + resumen + alcance + avisos. */}
          <div className="mt-4 max-w-2xl">
            <DetalleHe1 result={result} />
          </div>
        </div>

        {/* Esquema del cerramiento: panel compacto, plegable en lg; pestaña en
            móvil. Muestra SOLO el cerramiento seleccionado (o el peor). */}
        <aside
          aria-label="Esquema del cerramiento"
          className={[
            "border-border-main bg-bg-surface min-h-0 flex-col overflow-hidden",
            "lg:flex lg:shrink-0 lg:border-l",
            esquemaPlegado ? "lg:w-10" : "lg:w-[380px]",
            tab === "esquema" ? "flex flex-1" : "hidden",
          ].join(" ")}
        >
          {esquemaPlegado ? (
            <button
              type="button"
              onClick={() => setEsquemaPlegado(false)}
              aria-label="Mostrar esquema del cerramiento"
              title="Mostrar esquema"
              className="text-text-disabled hover:text-text-primary hidden h-full w-full items-start justify-center pt-3 transition-colors lg:flex"
            >
              <ChevronLeft size={15} />
            </button>
          ) : (
            <>
              <div className="border-border-sub flex items-center justify-between border-b px-3.5 py-2.5">
                <span className="text-text-disabled text-[10px] font-semibold tracking-[0.07em] uppercase">
                  Esquema del cerramiento
                </span>
                <button
                  type="button"
                  onClick={() => setEsquemaPlegado(true)}
                  aria-label="Plegar esquema del cerramiento"
                  title="Plegar esquema"
                  className="text-text-disabled hover:text-text-primary hidden transition-colors lg:block"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
              <div
                ref={canvasRef}
                className="scroll-hide flex flex-1 items-start justify-center overflow-y-auto px-3 py-4"
              >
                <He1SVG
                  result={result}
                  mode="screen"
                  width={svgW}
                  height={svgH}
                  selectedId={selVigente}
                  hoverId={hoverId}
                  onSelect={setSelectedId}
                  etiquetas={etiquetas}
                  soloCerramientoId={soloCerramientoId}
                />
              </div>
              {textoSeleccion && (
                <div className="border-border-sub bg-tint-accent flex items-center gap-2 border-t px-3.5 py-2">
                  <span className="bg-accent h-[3px] w-3.5 shrink-0 rounded-full" />
                  <span className="text-text-primary text-[11.5px]">
                    Seleccionado: {textoSeleccion}
                  </span>
                </div>
              )}
            </>
          )}
        </aside>
      </div>

      {/* Clon oculto del SVG para el raster del PDF (mismo id que busca
          renderFicha). Modo 'pdf' al tamaño NATIVO completo (he1NativeSize):
          TODOS los cerramientos, como en la ficha de siempre. */}
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div id={HE1_PDF_SVG_ID} style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <He1SVG result={result} mode="pdf" width={pdfW} height={pdfH} />
        </div>
      </div>

      {pdfPreview && (
        <PdfPreviewModal
          blobUrl={pdfPreview.blobUrl}
          filename={pdfPreview.filename}
          pageCount={pdfPreview.pageCount}
          onDownload={handleDownloadPdf}
          onClose={closePdfPreview}
        />
      )}
    </ModuleShell>
  );
}

/**
 * Límite de U EFECTIVO mostrado junto a la U: el MÁS restrictivo entre Ulim
 * (Tabla 3.1.1.a) y U_max_fRsi (condensación superficial). Si Ulim no aplicara
 * (rama defensiva, hoy ningún elemento), queda solo U_max_fRsi.
 */
function limiteUDe(r: ResultadoCerramientoHE1): number {
  return r.ulim_W_m2K != null ? Math.min(r.ulim_W_m2K, r.uMaxFRsi_W_m2K) : r.uMaxFRsi_W_m2K;
}

/**
 * "22 ago 2026" — fecha corta es-ES a partir de un ISO (mismo formato que el
 * listado de expedientes de InicioPage). Solo para la cabecera de la ficha; el
 * ISO llega ya construido desde la persistencia (aquí no hay Date.now).
 */
function formatearFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

// -----------------------------------------------------------------------------
// Detalle bajo la tabla (WCAG: el dato numérico SIEMPRE en texto, no solo en el
// SVG). Lo que NO cabe en las filas del outliner: condensación superficial
// (fRsi vs fRsi,min) e intersticial (Glaser) por cerramiento, H_PT y notas del
// motor; más el resumen global, la zona de alcance/supuestos y los avisos.
// -----------------------------------------------------------------------------
function DetalleHe1({ result }: { result: HE1Result }) {
  const notas = result.porCerramiento.flatMap((c) =>
    c.notas.map((n) => `${c.nombre}: ${n}`),
  );
  return (
    <>
      <CollapsibleSection label="Condensaciones y detalle" refNorma="DA DB-HE/2">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-text-disabled border-border-sub border-b text-left text-[11px] uppercase">
                <th scope="col" className="py-1.5 font-medium">Cerramiento</th>
                <th scope="col" className="py-1.5 text-right font-medium">fRsi</th>
                <th scope="col" className="py-1.5 text-right font-medium">Glaser (enero)</th>
                <th scope="col" className="py-1.5 text-right font-medium">H_PT</th>
              </tr>
            </thead>
            <tbody>
              {result.porCerramiento.map((c) => (
                <tr key={c.id} className="border-border-sub border-b">
                  <td className="text-text-secondary py-1.5">{c.nombre}</td>
                  <td
                    className={`py-1.5 text-right tabular-nums ${
                      c.cumpleFRsi ? "text-text-secondary" : "text-state-fail font-semibold"
                    }`}
                  >
                    {fmt(c.fRsi, "", 2)}
                    <span className="text-text-disabled ml-1 text-[10px]">
                      ≥ {fmt(c.fRsiMin, "", 2)}
                    </span>
                  </td>
                  <td className="py-1.5 text-right text-[12px]">
                    {c.glaser.condensaIntersticial ? (
                      <span className="text-state-warn font-semibold">condensa (revisar)</span>
                    ) : (
                      <span className="text-text-secondary">sin condensación</span>
                    )}
                  </td>
                  <td className="text-text-disabled py-1.5 text-right tabular-nums">
                    {c.hPuentes_W_K != null ? fmt(c.hPuentes_W_K, "W/K", 2) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {notas.length > 0 && (
          <ul className="text-text-disabled mt-2 list-disc space-y-0.5 pl-5 text-[11px]">
            {notas.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        )}
      </CollapsibleSection>

      <CollapsibleSection label="Resumen" refNorma="DB-HE1 Tabla 3.1.1.a">
        <dl className="text-[13px]">
          <SummaryRow
            k="Zona climática de invierno"
            v={result.zonaClimatica}
            sub="indexa Ulim y fRsi,min"
          />
          <SummaryRow
            k="Condiciones de cálculo"
            v={`${fmt(result.tempInterior_C, "°C", 0)} / ${fmt(result.hrInterior_pct, "%", 0)} int.`}
            sub={`${fmt(result.tempExteriorEnero_C, "°C", 0)} / ${fmt(
              result.hrExterior_pct,
              "%",
              0,
            )} ext. (enero)`}
          />
          <SummaryRow
            k="Veredicto global"
            v={STATUS_LABEL[result.veredictoGlobal]}
            estado={result.veredictoGlobal}
          />
        </dl>
      </CollapsibleSection>

      {/* Zona única de ALCANCE Y SUPUESTOS: limitaciones agrupadas, visibles. */}
      <div className="mt-4">
        <div className="text-text-disabled mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
          Alcance y supuestos
        </div>
        <DisclosureNote>
          <span className="font-semibold">Predimensionado por elemento:</span> esta versión verifica
          cada cerramiento de forma independiente (U, condensación superficial e intersticial). NO
          sustituye el cálculo de la demanda energética del edificio completo ni una herramienta
          oficial (HULC / CE3X).
        </DisclosureNote>
        <DisclosureNote>
          <span className="font-semibold">Condensación intersticial:</span> el método de Glaser se
          evalúa para el mes de enero (más desfavorable). Una posible condensación es un AVISO para
          revisar, no un «no cumple» definitivo: requiere el balance anual de evaporación (DA DB-HE/2).
        </DisclosureNote>
        <p className="text-text-disabled text-[11px] leading-snug">
          Los valores de λ y µ autocompletados son ORIENTATIVOS (Catálogo de Elementos
          Constructivos del CTE); en proyecto real prevalecen los datos del fabricante. Los puentes
          térmicos (H_PT) son informativos: sus ψ están pendientes de verificación literal.
        </p>
      </div>

      {result.warnings.length > 0 && (
        <ul className="text-state-warn mt-3 list-disc space-y-1 pl-5 text-[12px]">
          {result.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </>
  );
}

function SummaryRow({
  k,
  v,
  sub,
  estado,
}: {
  k: string;
  v: string;
  sub?: string;
  estado?: HE1Result["veredictoGlobal"];
}) {
  return (
    <div className="border-border-sub flex items-baseline justify-between gap-3 border-b py-1.5">
      <dt className="text-text-secondary">{k}</dt>
      <dd className="flex items-baseline gap-2">
        <span
          className={`tabular-nums ${estado ? `font-semibold ${STATE_TEXT[estado]}` : "text-text-primary"}`}
        >
          {v}
        </span>
        {sub && <span className="text-text-disabled text-[11px]">{sub}</span>}
      </dd>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Nota de alcance/limitación VISIBLE. Banner discreto pero no escondido: tinte
// neutral + icono + texto. Accesible: `role="note"` y el icono es decorativo
// (`aria-hidden`) porque el texto ya lo dice todo (no solo color).
// -----------------------------------------------------------------------------
function DisclosureNote({ children }: { children: ReactNode }) {
  return (
    <div
      role="note"
      className="bg-tint-neutral border-border-main text-text-secondary mb-3 flex items-start gap-2 rounded-md border px-3 py-2 text-[12px] leading-snug"
    >
      <Info size={15} className="text-text-disabled mt-0.5 shrink-0" aria-hidden="true" />
      <p className="min-w-0">{children}</p>
    </div>
  );
}
