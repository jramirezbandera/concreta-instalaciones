// DB-HS5 — Pantalla del módulo de saneamiento (evacuación de aguas). Cablea el
// motor (./calc), el esquema de columna (./svg) y la ficha PDF (./ficha) sobre
// la anatomía v4 (<ModuleLayout>, REDISENO-V4 §3.3): el esquema de columna,
// grande, con la franja de selección debajo; a la izquierda lo que viene del
// proyecto y la ventilación de red; en Comprobaciones, el OUTLINER de tramos y
// aparatos (jerarquía por indentación — Enter añade, Tab/Shift-Tab
// anida/desanida, ↑↓ navega) con los presets de cuartos húmedos. Dibujo, tabla
// y franja comparten la selección (hover fila ↔ resalta elemento).
//
// La semántica del árbol vive AQUÍ (el outliner es agnóstico): anidar = colgar
// del hermano anterior; desanidar = subir al abuelo — por construcción no se
// pueden crear ciclos. Al borrar un tramo, sus hijos y aparatos pasan a su
// padre (si era raíz, los aparatos quedan colgando y el motor lo avisa).
//
// React 19 + React Compiler: componente PURO. El cálculo es síncrono en render
// (useMemo sobre el estado diferido); no hay efectos de cálculo. Los ids de
// tramos/aparatos se generan de forma DETERMINISTA en los handlers de evento
// (nunca en render, nunca con Math.random/Date), derivando un contador del
// estado actual. Las mutaciones de las listas son siempre INMUTABLES.

import { useDeferredValue, useMemo, useState } from "react";
import { useJustificacionState } from "../../hooks/useJustificacionState";
import { usePdfPreview } from "../../hooks/usePdfPreview";
import {
  ModuleLayout,
  type ResumenVeredicto,
} from "../../components/justificacion/ModuleLayout";
import { LienzoAjustado } from "../../components/justificacion/LienzoAjustado";
import { ajustar } from "../../lib/ui/ajustar";
import { FranjaDetalle } from "../../components/justificacion/FranjaDetalle";
import { FilaResumen } from "../../components/justificacion/FilaResumen";
import { PdfPreviewModal } from "../../components/ui/PdfPreviewModal";
import { CollapsibleSection } from "../../components/ui/CollapsibleSection";
import { showToast } from "../../components/ui/Toast";
import { Outliner } from "../../components/outliner/Outliner";
import type {
  OutlinerCelda,
  OutlinerColumna,
  OutlinerFila,
} from "../../components/outliner/tipos";
import {
  PRESETS_APARATOS,
  type PresetAparatos,
} from "../../data/presetsAparatos";
import { renderFicha } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import { notasExcepcionesLocales } from "../../lib/proyecto/herencia";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { generarHs5 } from "../../lib/proyecto/viviendaTipo";
import {
  calcHS5,
  hs5Defaults,
  type AparatoInput,
  type HS5Inputs,
  type TipoTramo,
  type TramoInput,
} from "./calc";
import type { TipoAparato } from "./tablas";
import { HS5SVG } from "./svg";
import { HS5_PDF_SVG_ID, hs5NativeSize } from "./svg-meta";
import { toFichaData } from "./ficha";
import { resumenHs5 } from "./resumen";

// -----------------------------------------------------------------------------
// Opciones de los selects (declaradas a módulo: estables entre renders).
// El tipo de fila del outliner FUSIONA tipo + disposición del colector (una sola
// celda select por fila; "colector_colgado"/"colector_enterrado" mapean a
// { tipo: "colector", disposicion }).
// -----------------------------------------------------------------------------
type TipoFilaTramo =
  | "ramal"
  | "bajante"
  | "colector_enterrado"
  | "colector_colgado";

const TIPO_FILA_TRAMO_OPTIONS: { value: string; label: string }[] = [
  { value: "ramal", label: "Ramal colector" },
  { value: "bajante", label: "Bajante" },
  { value: "colector_enterrado", label: "Colector enterrado" },
  { value: "colector_colgado", label: "Colector colgado" },
];

// Opciones de tipo de aparato = los TipoAparato reales del motor (Tabla 4.1).
const TIPO_APARATO_OPTIONS: { value: TipoAparato; label: string }[] = [
  { value: "lavabo", label: "Lavabo" },
  { value: "bide", label: "Bidé" },
  { value: "ducha", label: "Ducha" },
  { value: "banera", label: "Bañera" },
  { value: "inodoro_cisterna", label: "Inodoro (cisterna)" },
  { value: "inodoro_fluxometro", label: "Inodoro (fluxómetro)" },
  { value: "urinario_pedestal", label: "Urinario de pedestal" },
  { value: "urinario_suspendido", label: "Urinario suspendido" },
  { value: "urinario_bateria", label: "Urinario en batería" },
  { value: "fregadero_cocina", label: "Fregadero de cocina" },
  { value: "fregadero_lab_restaurante", label: "Fregadero (lab./rest.)" },
  { value: "lavadero", label: "Lavadero" },
  { value: "vertedero", label: "Vertedero" },
  { value: "fuente_beber", label: "Fuente para beber" },
  { value: "sumidero_sifonico", label: "Sumidero sifónico" },
  { value: "lavavajillas", label: "Lavavajillas" },
  { value: "lavadora", label: "Lavadora" },
  { value: "cuarto_bano_cisterna", label: "Cuarto de baño (cisterna)" },
  { value: "cuarto_bano_fluxometro", label: "Cuarto de baño (fluxómetro)" },
  { value: "cuarto_aseo_cisterna", label: "Cuarto de aseo (cisterna)" },
  { value: "cuarto_aseo_fluxometro", label: "Cuarto de aseo (fluxómetro)" },
];

const ESTADO_LABEL: Record<string, string> = {
  ok: "Cumple",
  warn: "Aviso",
  fail: "No cumple",
  neutral: "Informativo",
};

// Columnas del outliner HS5: inputs (nombre, tipo, pendiente) y resultados
// (UD acumuladas, Ø, estado) en la MISMA fila (§6 del reconcept).
const COLUMNAS_HS5: OutlinerColumna[] = [
  { key: "elemento", header: "Elemento", align: "left" },
  { key: "tipo", header: "Tipo", align: "left", width: "180px" },
  { key: "pend", header: "Pend.", align: "right", width: "90px" },
  { key: "ud", header: "UD", align: "right", width: "72px" },
  { key: "dia", header: "Ø", align: "right", width: "76px" },
  { key: "estado", header: "Estado", align: "left", width: "116px" },
];

// -----------------------------------------------------------------------------
// Ids deterministas (contador derivado del estado actual). NO usa Math.random ni
// Date (React-Compiler-safe; solo se invoca en handlers). Extrae el sufijo
// numérico mayor de los ids "t-N"/"a-N" y devuelve el siguiente; ignora los ids
// semilla con otra forma. Garantiza unicidad e idempotencia por estado.
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

/**
 * Alias mapeado de HS5Inputs para el generic de useJustificacionState: los
 * `interface` NO llevan index signature implícita y no satisfacen la
 * restricción `Record<string, unknown>` del hook; el alias mapeado (idéntico
 * estructuralmente y mutuamente asignable) sí.
 */
type Hs5State = { [K in keyof HS5Inputs]: HS5Inputs[K] };

/** Valor del select fusionado tipo+disposición para un tramo. */
function tipoFilaDe(t: TramoInput): TipoFilaTramo {
  if (t.tipo === "colector") {
    return (t.disposicion ?? "enterrado") === "colgado"
      ? "colector_colgado"
      : "colector_enterrado";
  }
  return t.tipo;
}

export function Hs5Module() {
  const { state, setField, reset, herencia } = useJustificacionState<Hs5State>(
    "hs5",
    hs5Defaults,
  );
  const { proyecto, derivados } = useProyecto();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const deferredState = useDeferredValue(state);
  const result = useMemo(() => calcHS5(deferredState), [deferredState]);

  // ── Validación de entrada ──────────────────────────────────────────────────
  const tramoPorId = new Map(state.tramos.map((t) => [t.id, t] as const));
  const valid =
    Number.isInteger(state.numPlantas) &&
    state.numPlantas >= 1 &&
    state.tramos.length >= 1 &&
    state.aparatos.length >= 1 &&
    state.aparatos.every((a) => tramoPorId.has(a.tramoId)) &&
    result.arbolValido;

  // La selección solo es vigente si el elemento sigue existiendo (borrar la
  // fila seleccionada no deja una selección fantasma).
  const selVigente =
    selectedId !== null &&
    (tramoPorId.has(selectedId) ||
      state.aparatos.some((a) => a.id === selectedId))
      ? selectedId
      : null;

  // Ficha con cabecera de expediente (patrón de feature-6). La misma función
  // alimenta el botón «Ficha PDF» y la pestaña Memoria.
  const generarFicha = () => {
    const base = toFichaData(deferredState, result);
    return renderFicha({
      ...base,
      proyecto: proyecto.nombre,
      fechaProyecto: formatearFecha(proyecto.modificado),
      observaciones: [
        ...(base.observaciones ?? []),
        ...notasExcepcionesLocales({
          key: "hs5",
          dg: proyecto.datosGenerales,
          d: derivados,
          state: deferredState,
          overrides: herencia.campos
            .filter((c) => c.override)
            .map((c) => c.campo),
        }),
      ],
    });
  };
  const {
    pdfExporting,
    pdfPreview,
    handleExportPdf,
    handleDownloadPdf,
    closePdfPreview,
  } = usePdfPreview(generarFicha, valid);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Enlace copiado al portapapeles", { autoDismiss: 2500 });
    } catch {
      showToast("No se pudo copiar el enlace", { autoDismiss: 3000 });
    }
  };

  // ── Mutaciones inmutables ──────────────────────────────────────────────────
  const patchTramo = (id: string, patch: Partial<TramoInput>) => {
    setField(
      "tramos",
      state.tramos.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  };

  const patchAparato = (id: string, patch: Partial<AparatoInput>) => {
    setField(
      "aparatos",
      state.aparatos.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );
  };

  const cambiarTipoFila = (id: string, v: string) => {
    if (v === "colector_enterrado" || v === "colector_colgado") {
      patchTramo(id, {
        tipo: "colector",
        disposicion: v === "colector_colgado" ? "colgado" : "enterrado",
      });
    } else {
      patchTramo(id, { tipo: v as TipoTramo });
    }
  };

  /**
   * Enter / "+ Añadir tramo". Referencia = fila desde la que se añade:
   *  - tramo → nuevo tramo HERMANO insertado justo después (mismo padre; si la
   *    referencia es una raíz, el nuevo cuelga de ella para no crear multi-raíz);
   *  - aparato → nuevo aparato en el mismo tramo, insertado justo después;
   *  - null (sin selección) → nuevo ramal colgando de la primera bajante (o de
   *    la raíz si no hay bajantes), al final de la lista.
   */
  const handleAdd = (afterId: string | null) => {
    const refAparato = afterId
      ? state.aparatos.find((a) => a.id === afterId)
      : undefined;
    if (refAparato) {
      const nuevo: AparatoInput = {
        id: nextId(state.aparatos, "a"),
        tipo: "lavabo",
        tramoId: refAparato.tramoId,
      };
      const i = state.aparatos.findIndex((a) => a.id === refAparato.id);
      setField("aparatos", [
        ...state.aparatos.slice(0, i + 1),
        nuevo,
        ...state.aparatos.slice(i + 1),
      ]);
      setSelectedId(nuevo.id);
      return;
    }

    const refTramo = afterId ? tramoPorId.get(afterId) : undefined;
    const parentId = refTramo
      ? (refTramo.parentId ?? refTramo.id)
      : (state.tramos.find((t) => t.tipo === "bajante")?.id ??
        state.tramos.find((t) => t.parentId === null)?.id ??
        null);
    const nuevo: TramoInput = {
      id: nextId(state.tramos, "t"),
      tipo: "ramal",
      parentId,
      pendiente_pct: 2,
    };
    const i = refTramo
      ? state.tramos.findIndex((t) => t.id === refTramo.id)
      : -1;
    setField(
      "tramos",
      i >= 0
        ? [...state.tramos.slice(0, i + 1), nuevo, ...state.tramos.slice(i + 1)]
        : [...state.tramos, nuevo],
    );
    setSelectedId(nuevo.id);
  };

  /** Tab: colgar del hermano ANTERIOR (mismo padre). Sin hermano anterior, no-op. */
  const handleNest = (id: string) => {
    const t = tramoPorId.get(id);
    if (!t) return;
    const hermanos = state.tramos.filter(
      (x) => x.parentId === t.parentId && x.id !== id,
    );
    const idx = state.tramos.findIndex((x) => x.id === id);
    const anterior = [...hermanos]
      .reverse()
      .find((x) => state.tramos.findIndex((y) => y.id === x.id) < idx);
    if (anterior) patchTramo(id, { parentId: anterior.id });
  };

  /** Shift-Tab: subir al abuelo. En una raíz, no-op. */
  const handleUnnest = (id: string) => {
    const t = tramoPorId.get(id);
    if (!t || t.parentId === null) return;
    const padre = tramoPorId.get(t.parentId);
    patchTramo(id, { parentId: padre?.parentId ?? null });
  };

  /**
   * Borrado: un tramo pasa sus hijos y aparatos a su PADRE (si era raíz, hijos a
   * raíz y aparatos quedan colgando — el motor lo marca). Un aparato se borra sin
   * más. Se exige conservar al menos un tramo y un aparato (paridad con la UI
   * anterior; el outliner ya deshabilita vía `borrable`).
   */
  const handleRemove = (id: string) => {
    const t = tramoPorId.get(id);
    if (t) {
      if (state.tramos.length <= 1) return;
      const nuevoPadre = t.parentId;
      setField(
        "tramos",
        state.tramos
          .filter((x) => x.id !== id)
          .map((x) => (x.parentId === id ? { ...x, parentId: nuevoPadre } : x)),
      );
      if (nuevoPadre !== null && state.aparatos.some((a) => a.tramoId === id)) {
        setField(
          "aparatos",
          state.aparatos.map((a) =>
            a.tramoId === id ? { ...a, tramoId: nuevoPadre } : a,
          ),
        );
      }
    } else {
      if (state.aparatos.length <= 1) return;
      setField(
        "aparatos",
        state.aparatos.filter((a) => a.id !== id),
      );
    }
    if (selectedId === id) setSelectedId(null);
  };

  /**
   * Preset (§6.1): crea un ramal nuevo con el nombre del cuarto y sus aparatos
   * colgando (Tabla 4.1 vía el motor). Cuelga de la primera bajante (o de la
   * raíz). Ids deterministas; todo editable después.
   */
  const aplicarPreset = (p: PresetAparatos) => {
    const idRamal = nextId(state.tramos, "t");
    const parentId =
      state.tramos.find((t) => t.tipo === "bajante")?.id ??
      state.tramos.find((t) => t.parentId === null)?.id ??
      null;
    setField("tramos", [
      ...state.tramos,
      {
        id: idRamal,
        nombre: `Ramal ${p.label.toLowerCase()}`,
        tipo: "ramal",
        parentId,
        pendiente_pct: 2,
      },
    ]);
    const nuevos: AparatoInput[] = [];
    for (const { tipo } of p.hs5) {
      nuevos.push({
        id: nextId([...state.aparatos, ...nuevos], "a"),
        tipo,
        tramoId: idRamal,
      });
    }
    setField("aparatos", [...state.aparatos, ...nuevos]);
    setSelectedId(idRamal);
  };

  // ── Generar desde viviendas tipo (feature-8 §C) ────────────────────────────
  // Dos pulsaciones: la primera ARMA la confirmación (el botón cambia a
  // "¿Reemplazar la red actual?"), la segunda aplica el generador puro y
  // REEMPLAZA tramos+aparatos (todo editable después). Nunca escribe sin
  // confirmar; blur desarma.
  const puedeGenerarVT = (proyecto.viviendasTipo?.length ?? 0) > 0;
  const [confirmarGenerarVT, setConfirmarGenerarVT] = useState(false);
  const handleGenerarVT = () => {
    if (!confirmarGenerarVT) {
      setConfirmarGenerarVT(true);
      return;
    }
    const gen = generarHs5(proyecto.viviendasTipo ?? [], proyecto.repartoPlantas);
    setField("tramos", gen.tramos);
    setField("aparatos", gen.aparatos);
    setConfirmarGenerarVT(false);
    setSelectedId(null);
    showToast("Red generada desde las viviendas tipo del proyecto", { autoDismiss: 3000 });
  };

  // ── Proyección estado+resultado → filas del outliner ───────────────────────
  // DFS desde las raíces en orden estable de entrada: fila del tramo, después
  // sus aparatos (depth+1), después sus tramos hijos (depth+1). Tramos en ciclo
  // y aparatos huérfanos se listan al final a depth 0 (el motor ya los avisa).
  const resultadoTramo = new Map(
    result.porTramo.map((r) => [r.id, r] as const),
  );
  const resultadoAparato = new Map(
    result.porAparato.map((r) => [r.id, r] as const),
  );

  const filaTramo = (t: TramoInput, depth: number): OutlinerFila => {
    const r = resultadoTramo.get(t.id);
    const celdas: OutlinerCelda[] = [
      {
        tipo: "nombre",
        valor: t.nombre ?? t.id,
        onChange: (v) => patchTramo(t.id, { nombre: v }),
      },
      {
        tipo: "select",
        valor: tipoFilaDe(t),
        opciones: TIPO_FILA_TRAMO_OPTIONS,
        onChange: (v) => cambiarTipoFila(t.id, v),
      },
      t.tipo === "bajante"
        ? { tipo: "texto", valor: "—", dim: true }
        : {
            tipo: "numero",
            valor: t.pendiente_pct ?? 2,
            onChange: (v) => patchTramo(t.id, { pendiente_pct: v }),
            min: 0,
            step: 0.5,
            unidad: "%",
          },
      { tipo: "texto", valor: r ? fmt(r.udAcumuladas) : "—", mono: true },
      {
        tipo: "texto",
        valor:
          r?.diametro_mm != null ? `Ø${fmt(r.diametro_mm, undefined, 0)}` : "—",
        mono: true,
      },
      r
        ? { tipo: "estado", veredicto: r.estado }
        : { tipo: "texto", valor: "—", dim: true },
    ];
    return {
      id: t.id,
      depth,
      kind: "tramo",
      anidable: true,
      borrable: state.tramos.length > 1,
      celdas,
    };
  };

  const filaAparato = (a: AparatoInput, depth: number): OutlinerFila => {
    const r = resultadoAparato.get(a.id);
    const celdas: OutlinerCelda[] = [
      {
        tipo: "nombre",
        valor: a.nombre ?? a.id,
        onChange: (v) => patchAparato(a.id, { nombre: v }),
      },
      {
        tipo: "select",
        valor: a.tipo,
        opciones: TIPO_APARATO_OPTIONS,
        onChange: (v) => patchAparato(a.id, { tipo: v as TipoAparato }),
      },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: r ? fmt(r.ud) : "—", mono: true },
      {
        tipo: "texto",
        valor:
          r?.diametroMin_mm != null
            ? `Ø${fmt(r.diametroMin_mm, undefined, 0)}`
            : "—",
        mono: true,
      },
      r
        ? { tipo: "estado", veredicto: r.estado }
        : { tipo: "texto", valor: "—", dim: true },
    ];
    return {
      id: a.id,
      depth,
      kind: "aparato",
      anidable: false,
      borrable: state.aparatos.length > 1,
      celdas,
    };
  };

  const filas: OutlinerFila[] = [];
  {
    const visto = new Set<string>();
    const empujar = (t: TramoInput, depth: number) => {
      if (visto.has(t.id)) return;
      visto.add(t.id);
      filas.push(filaTramo(t, depth));
      for (const a of state.aparatos.filter((a) => a.tramoId === t.id)) {
        filas.push(filaAparato(a, depth + 1));
      }
      for (const h of state.tramos.filter((x) => x.parentId === t.id)) {
        empujar(h, depth + 1);
      }
    };
    const raices = state.tramos.filter(
      (t) => t.parentId === null || !tramoPorId.has(t.parentId),
    );
    for (const r of raices) empujar(r, 0);
    for (const t of state.tramos) if (!visto.has(t.id)) empujar(t, 0);
    for (const a of state.aparatos.filter((a) => !tramoPorId.has(a.tramoId))) {
      filas.push(filaAparato(a, 0));
    }
  }

  // Etiquetas legibles (id→nombre) para el esquema y el pie de selección.
  const etiquetas: Record<string, string> = {};
  for (const t of state.tramos) if (t.nombre) etiquetas[t.id] = t.nombre;
  for (const a of state.aparatos) if (a.nombre) etiquetas[a.id] = a.nombre;

  // Pie de selección del panel de esquema ("Seleccionado: Ramal cocina — Ø63 · 9 UD · Cumple").
  let textoSeleccion: string | null = null;
  if (selVigente) {
    const nombre = etiquetas[selVigente] ?? selVigente;
    const rt = resultadoTramo.get(selVigente);
    const ra = resultadoAparato.get(selVigente);
    if (rt) {
      textoSeleccion = `${nombre} — ${rt.diametro_mm != null ? `Ø${fmt(rt.diametro_mm, undefined, 0)}` : "Ø —"} · ${fmt(rt.udAcumuladas, "UD")} · ${ESTADO_LABEL[rt.estado]}`;
    } else if (ra) {
      textoSeleccion = `${nombre} — ${fmt(ra.ud, "UD")} · Ø mín ${ra.diametroMin_mm != null ? fmt(ra.diametroMin_mm, "mm", 0) : "—"} · ${ESTADO_LABEL[ra.estado]}`;
    }
  }

  // Tamaño del esquema: cabe entero en el lienzo conservando la proporción del
  // viewBox nativo (hs5NativeSize, misma fuente de verdad que el PDF).
  const { nativeW, nativeH } = hs5NativeSize(result);

  const resumen: ResumenVeredicto | null = useMemo(
    () => (valid ? resumenHs5(result) : null),
    [valid, result],
  );

  const v = result.ventilacion;

  const tablaTramos = (
    <Outliner
      columnas={COLUMNAS_HS5}
      filas={filas}
      selectedId={selVigente}
      onSelect={setSelectedId}
      onHover={setHoverId}
      onAdd={handleAdd}
      onNest={handleNest}
      onUnnest={handleUnnest}
      onRemove={handleRemove}
      etiquetaAdd="+ Añadir tramo"
      toolbar={
        <div className="flex items-center gap-1.5">
          {puedeGenerarVT && (
            <button
              type="button"
              onClick={handleGenerarVT}
              onBlur={() => setConfirmarGenerarVT(false)}
              title="Reemplaza la red actual por la propuesta derivada de las viviendas tipo del proyecto"
              className={[
                "rounded border px-2 py-0.5 text-[11px] transition-colors",
                confirmarGenerarVT
                  ? "border-state-warn text-state-warn font-medium"
                  : "border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              ].join(" ")}
            >
              {confirmarGenerarVT
                ? "¿Reemplazar la red actual?"
                : "Generar desde viviendas tipo"}
            </button>
          )}
          {PRESETS_APARATOS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => aplicarPreset(p)}
              title={`Añadir un ramal de ${p.label.toLowerCase()} con sus aparatos`}
              className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary rounded border px-2 py-0.5 text-[11px] transition-colors"
            >
              + {p.label}
            </button>
          ))}
        </div>
      }
    />
  );

  const ventilacionRed = (
    <CollapsibleSection
      label="Ventilación de red"
      refNorma="DB-HS5 ap. 4.3"
    >
      <dl className="text-[13px]">
        <FilaResumen
          k="Ventilación primaria"
          v={
            v.primaria.suficienteSola
              ? "Suficiente sola"
              : "Requiere secundaria"
          }
          sub={`≥ ${fmt(v.primaria.prolongacionMin_m, "m")} sobre cubierta`}
        />
        <FilaResumen
          k="Ventilación secundaria (columna)"
          v={
            v.secundaria.diametroColumna_mm != null
              ? `Ø${fmt(v.secundaria.diametroColumna_mm, "mm", 0)}`
              : "No requerida"
          }
          sub={
            v.secundaria.modo === "no_requerida"
              ? "no requerida"
              : v.secundaria.modo === "alternas"
                ? "plantas alternas (4.10)"
                : "cada planta (4.11)"
          }
        />
        <FilaResumen
          k="Ventilación terciaria (ramales)"
          v={v.terciaria.obligatoria ? "Obligatoria" : "No requerida"}
          sub={
            v.terciaria.ramalesAfectados.length > 0
              ? `ramales: ${v.terciaria.ramalesAfectados.join(", ")}`
              : undefined
          }
        />
      </dl>
      <p className="text-text-disabled mt-2 text-[11px] leading-snug">
        El dimensionado de la ventilación de red es un resultado
        informativo y no entra en el veredicto global (
        {fmt(result.udTotales, "UD")} totales).
      </p>
    </CollapsibleSection>
  );

  return (
    <ModuleLayout
      justificacionKey="hs5"
      resultado={resumen}
      herencia={herencia}
      acciones={{
        onExportPdf: handleExportPdf,
        pdfExporting,
        onShare: handleShare,
        onReset: reset,
      }}
      avisos={result.warnings}
      errores={
        result.arbolValido
          ? []
          : [
              "La red de tramos no es un árbol válido (hay un ciclo, un huérfano o varias raíces): revisa la jerarquía en Comprobaciones con Tab/Shift-Tab.",
            ]
      }
      entradas={ventilacionRed}
      dibujo={{
        titulo: "Esquema de columna",
        lienzo: (
          <LienzoAjustado>
            {(caja) => {
              const { width, height } = ajustar(nativeW, nativeH, caja, { max: 900 });
              return (
                <HS5SVG
                  result={result}
                  mode="screen"
                  width={width}
                  height={height}
                  selectedId={selVigente}
                  hoverId={hoverId}
                  onSelect={setSelectedId}
                  etiquetas={etiquetas}
                />
              );
            }}
          </LienzoAjustado>
        ),
        franja: (
          <FranjaDetalle
            seleccion={textoSeleccion}
            pista="Pulsa un tramo o un aparato del esquema, o una fila en Comprobaciones."
          />
        ),
      }}
      comprobaciones={tablaTramos}
      memoria={{ generar: generarFicha, valid }}
    >
      {/* Clon oculto del SVG para el raster del PDF (mismo id que busca renderFicha). */}
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div
          id={HS5_PDF_SVG_ID}
          style={{ position: "absolute", left: "-9999px", top: 0 }}
        >
          <HS5SVG result={result} mode="pdf" width={420} height={315} />
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
    </ModuleLayout>
  );
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
