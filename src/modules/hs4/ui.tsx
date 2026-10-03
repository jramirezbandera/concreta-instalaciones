// DB-HS4 — Pantalla del módulo de suministro de agua (fontanería). Cablea el
// motor (./calc), el esquema de columna (./svg) y la ficha PDF (./ficha) sobre
// la anatomía v4 (<ModuleLayout>, REDISENO-V4 §3.3), como el módulo patrón HS5
// (esquema grande + outliner en Comprobaciones + presets), sobre el modelo
// HIDRÁULICO de HS4 — caudal de cálculo (×K), Ø comercial, velocidad en rango,
// pérdida de carga y presión residual, con el RECORRIDO CRÍTICO marcado en la
// tabla (texto "◆ crítico" junto al estado) y en rojo en el esquema.
//
// El formulario corto de "Suministro" (presión de acometida — herencia
// CONDICIONAL —, criterio K y pérdidas localizadas) va en la columna izquierda
// con el resumen: no son colección, no van al outliner. La semántica del árbol es la de HS5
// (anidar = colgar del hermano anterior; desanidar = subir al abuelo; sin
// ciclos por construcción). Columna "Mat. / P mín": en tramos el material de la
// tubería; en aparatos el modo de presión mínima (auto / grifo / fluxor).
//
// React 19 + React Compiler: componente PURO; cálculo síncrono en render sobre
// el estado diferido; ids deterministas en handlers (sin Math.random/Date);
// mutaciones inmutables.

import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { Info } from "lucide-react";
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
import {
  Field,
  NumberInput,
  SelectInput,
} from "../../components/ui/InputLabel";
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
import { generarHs4 } from "../../lib/proyecto/viviendaTipo";
import {
  calcHS4,
  hs4Defaults,
  type AparatoInputHS4,
  type CriterioK,
  type HS4Inputs,
  type TipoTramoHS4,
  type TramoInputHS4,
} from "./calc";
import type { MaterialTuberia, TipoAparatoHS4 } from "./tablas";
import { HS4SVG } from "./svg";
import { HS4_PDF_SVG_ID, hs4NativeSize } from "./svg-meta";
import { toFichaData } from "./ficha";
import { resumenHs4 } from "./resumen";

// -----------------------------------------------------------------------------
// Opciones de los selects (declaradas a módulo: estables entre renders).
// -----------------------------------------------------------------------------

// Tipo de aparato = los TipoAparatoHS4 reales del motor (Tabla 2.1).
const TIPO_APARATO_OPTIONS: { value: TipoAparatoHS4; label: string }[] = [
  { value: "lavamanos", label: "Lavamanos" },
  { value: "lavabo", label: "Lavabo" },
  { value: "ducha", label: "Ducha" },
  { value: "banera_ge_140", label: "Bañera (≥ 1,40 m)" },
  { value: "banera_lt_140", label: "Bañera (< 1,40 m)" },
  { value: "bide", label: "Bidé" },
  { value: "inodoro_cisterna", label: "Inodoro con cisterna" },
  { value: "inodoro_fluxor", label: "Inodoro con fluxor" },
  { value: "urinario_temporizado", label: "Urinario temporizado" },
  { value: "urinario_cisterna", label: "Urinario con cisterna" },
  { value: "fregadero_domestico", label: "Fregadero doméstico" },
  { value: "fregadero_no_domestico", label: "Fregadero no doméstico" },
  { value: "lavavajillas_domestico", label: "Lavavajillas doméstico" },
  { value: "lavavajillas_industrial", label: "Lavavajillas industrial" },
  { value: "lavadero", label: "Lavadero" },
  { value: "lavadora_domestica", label: "Lavadora doméstica" },
  { value: "lavadora_industrial", label: "Lavadora industrial" },
  { value: "grifo_aislado", label: "Grifo aislado" },
  { value: "grifo_garaje", label: "Grifo de garaje" },
  { value: "vertedero", label: "Vertedero" },
];

const TIPO_TRAMO_OPTIONS: { value: string; label: string }[] = [
  { value: "derivacion_aparato", label: "Derivación de aparato" },
  { value: "derivacion_particular", label: "Derivación particular" },
  { value: "columna_montante", label: "Columna / montante" },
  { value: "tubo_alimentacion", label: "Tubo de alimentación" },
  { value: "acometida", label: "Acometida" },
];

const MATERIAL_OPTIONS: { value: string; label: string }[] = [
  { value: "metalica", label: "Metálica (0,5–2 m/s)" },
  {
    value: "termoplastico_multicapa",
    label: "Termopl./multicapa (0,5–3,5 m/s)",
  },
];

// Modo de presión mínima del aparato (columna "Mat. / P mín" en filas aparato):
// "auto" = derivada del tipo (undefined en el motor); el resto fuerza el flag.
const PRESION_MIN_OPTIONS: { value: string; label: string }[] = [
  { value: "auto", label: "Auto (según tipo)" },
  { value: "grifo", label: "Grifo común (100 kPa)" },
  { value: "fluxor", label: "Fluxor/calent. (150 kPa)" },
];

const CRITERIO_K_OPTIONS: { value: CriterioK; label: string }[] = [
  { value: "une149201", label: "UNE 149201 (1/√(n−1)) — criterio externo" },
  { value: "sin_simultaneidad", label: "Sin simultaneidad (K = 1)" },
];

const ESTADO_LABEL: Record<string, string> = {
  ok: "Cumple",
  warn: "Aviso",
  fail: "No cumple",
  neutral: "Informativo",
};

// Columnas del outliner HS4: inputs (nombre, tipo, material, L, Δh) y resultados
// hidráulicos (Q de cálculo, Ø, v, P residual, estado) en la MISMA fila.
const COLUMNAS_HS4: OutlinerColumna[] = [
  { key: "elemento", header: "Elemento", align: "left" },
  { key: "tipo", header: "Tipo", align: "left", width: "168px" },
  { key: "mat", header: "Mat. / P mín", align: "left", width: "150px" },
  { key: "lon", header: "L", align: "right", width: "70px" },
  { key: "dh", header: "Δh", align: "right", width: "70px" },
  { key: "q", header: "Q cálc.", align: "right", width: "84px" },
  { key: "dia", header: "Ø", align: "right", width: "64px" },
  { key: "vel", header: "v", align: "right", width: "72px" },
  { key: "pres", header: "P res.", align: "right", width: "76px" },
  { key: "estado", header: "Estado", align: "left", width: "150px" },
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

/** Alias mapeado de HS4Inputs (mismo truco que HS5: interface → Record). */
type Hs4State = { [K in keyof HS4Inputs]: HS4Inputs[K] };

export function Hs4Module() {
  const { state, setField, reset, herencia } = useJustificacionState<Hs4State>(
    "hs4",
    hs4Defaults,
  );
  const { proyecto, derivados } = useProyecto();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const deferredState = useDeferredValue(state);
  const result = useMemo(() => calcHS4(deferredState), [deferredState]);

  // ── Validación de entrada (paridad con la versión anterior) ────────────────
  const tramoPorId = new Map(state.tramos.map((t) => [t.id, t] as const));
  const valid =
    Number.isFinite(state.presionAcometida_kPa) &&
    state.presionAcometida_kPa > 0 &&
    state.tramos.length >= 1 &&
    state.aparatos.length >= 1 &&
    state.aparatos.every((a) => tramoPorId.has(a.tramoId)) &&
    result.arbolValido;

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
          key: "hs4",
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

  // Fracción de pérdidas localizadas expuesta como % entero (undefined ⇒ 25 %).
  const fraccionPct = Math.round(
    (state.fraccionPerdidasLocalizadas ?? 0.25) * 100,
  );

  // ── Mutaciones inmutables ──────────────────────────────────────────────────
  const patchTramo = (id: string, patch: Partial<TramoInputHS4>) => {
    setField(
      "tramos",
      state.tramos.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  };

  const patchAparato = (id: string, patch: Partial<AparatoInputHS4>) => {
    setField(
      "aparatos",
      state.aparatos.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );
  };

  /** Enter / "+ Añadir tramo" — misma semántica que HS5 (ver comentario allí). */
  const handleAdd = (afterId: string | null) => {
    const refAparato = afterId
      ? state.aparatos.find((a) => a.id === afterId)
      : undefined;
    if (refAparato) {
      const nuevo: AparatoInputHS4 = {
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
      : (state.tramos.find((t) => t.tipo === "columna_montante")?.id ??
        state.tramos.find((t) => t.parentId === null)?.id ??
        null);
    // El hermano nuevo clona tipo y material de la referencia (en una red de
    // fontanería lo habitual es añadir otro tramo del mismo escalón).
    const nuevo: TramoInputHS4 = {
      id: nextId(state.tramos, "t"),
      tipo: refTramo?.tipo ?? "derivacion_particular",
      parentId,
      material: refTramo?.material ?? "termoplastico_multicapa",
      longitud_m: 1.5,
      altura_m: 0,
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

  /** Tab: colgar del hermano ANTERIOR (mismo padre). */
  const handleNest = (id: string) => {
    const t = tramoPorId.get(id);
    if (!t) return;
    const idx = state.tramos.findIndex((x) => x.id === id);
    const anterior = [...state.tramos]
      .filter((x) => x.parentId === t.parentId && x.id !== id)
      .reverse()
      .find((x) => state.tramos.findIndex((y) => y.id === x.id) < idx);
    if (anterior) patchTramo(id, { parentId: anterior.id });
  };

  /** Shift-Tab: subir al abuelo. */
  const handleUnnest = (id: string) => {
    const t = tramoPorId.get(id);
    if (!t || t.parentId === null) return;
    const padre = tramoPorId.get(t.parentId);
    patchTramo(id, { parentId: padre?.parentId ?? null });
  };

  /** Borrado: hijos y aparatos pasan al padre del tramo borrado (como HS5). */
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
   * Preset (§6.1): en HS4 el cuarto se expande a una derivación particular +
   * una derivación de aparato por cada aparato (la red real de AF), con los
   * aparatos de la Tabla 2.1 colgando. Ids deterministas; todo editable.
   */
  const aplicarPreset = (p: PresetAparatos) => {
    const parentId =
      state.tramos.find((t) => t.tipo === "columna_montante")?.id ??
      state.tramos.find((t) => t.parentId === null)?.id ??
      null;
    const nuevosTramos: TramoInputHS4[] = [];
    const idDeriv = nextId(state.tramos, "t");
    nuevosTramos.push({
      id: idDeriv,
      nombre: `Deriv. ${p.label.toLowerCase()}`,
      tipo: "derivacion_particular",
      parentId,
      material: "termoplastico_multicapa",
      longitud_m: 3,
      altura_m: 0,
    });
    const nuevosAparatos: AparatoInputHS4[] = [];
    for (const { tipo } of p.hs4) {
      const idTramo = nextId([...state.tramos, ...nuevosTramos], "t");
      nuevosTramos.push({
        id: idTramo,
        tipo: "derivacion_aparato",
        parentId: idDeriv,
        material: "termoplastico_multicapa",
        longitud_m: 1.5,
        altura_m: 0,
      });
      nuevosAparatos.push({
        id: nextId([...state.aparatos, ...nuevosAparatos], "a"),
        tipo,
        tramoId: idTramo,
      });
    }
    setField("tramos", [...state.tramos, ...nuevosTramos]);
    setField("aparatos", [...state.aparatos, ...nuevosAparatos]);
    setSelectedId(idDeriv);
  };

  // ── Generar desde viviendas tipo (feature-8 §C) — mismo patrón que HS5 ─────
  const puedeGenerarVT = (proyecto.viviendasTipo?.length ?? 0) > 0;
  const [confirmarGenerarVT, setConfirmarGenerarVT] = useState(false);
  const handleGenerarVT = () => {
    if (!confirmarGenerarVT) {
      setConfirmarGenerarVT(true);
      return;
    }
    const gen = generarHs4(proyecto.viviendasTipo ?? [], proyecto.repartoPlantas);
    setField("tramos", gen.tramos);
    setField("aparatos", gen.aparatos);
    setConfirmarGenerarVT(false);
    setSelectedId(null);
    showToast("Red generada desde las viviendas tipo del proyecto", { autoDismiss: 3000 });
  };

  // ── Proyección estado+resultado → filas del outliner (patrón HS5) ──────────
  const resultadoTramo = new Map(
    result.porTramo.map((r) => [r.id, r] as const),
  );
  const resultadoAparato = new Map(
    result.porAparato.map((r) => [r.id, r] as const),
  );

  const filaTramo = (t: TramoInputHS4, depth: number): OutlinerFila => {
    const r = resultadoTramo.get(t.id);
    // Marcadores multicanal junto al estado: recorrido crítico + avisos de
    // buena práctica (velocidad fuera de rango / Ø fuera de serie comercial).
    const marcas = r
      ? [
          r.esCritico ? "◆ crítico" : null,
          r.velocidadFueraDeRango ? "v fuera de rango" : null,
          r.diametroFueraDeSerie ? "Ø fuera de serie" : null,
        ].filter((m): m is string => m !== null)
      : [];
    const celdas: OutlinerCelda[] = [
      {
        tipo: "nombre",
        valor: t.nombre ?? t.id,
        onChange: (v) => patchTramo(t.id, { nombre: v }),
      },
      {
        tipo: "select",
        valor: t.tipo,
        opciones: TIPO_TRAMO_OPTIONS,
        onChange: (v) => patchTramo(t.id, { tipo: v as TipoTramoHS4 }),
      },
      {
        tipo: "select",
        valor: t.material ?? "metalica",
        opciones: MATERIAL_OPTIONS,
        onChange: (v) => patchTramo(t.id, { material: v as MaterialTuberia }),
      },
      {
        tipo: "numero",
        valor: t.longitud_m ?? 1,
        onChange: (v) => patchTramo(t.id, { longitud_m: v }),
        min: 0,
        step: 0.5,
        unidad: "m",
      },
      {
        tipo: "numero",
        valor: t.altura_m ?? 0,
        onChange: (v) => patchTramo(t.id, { altura_m: v }),
        step: 0.5,
        unidad: "m",
      },
      {
        tipo: "texto",
        valor: r ? fmt(r.caudalCalculo_dm3_s, undefined, 2) : "—",
        mono: true,
      },
      {
        tipo: "texto",
        valor:
          r?.diametro_mm != null ? `Ø${fmt(r.diametro_mm, undefined, 0)}` : "—",
        mono: true,
      },
      {
        tipo: "texto",
        valor:
          r?.velocidad_m_s != null ? fmt(r.velocidad_m_s, undefined, 2) : "—",
        mono: true,
      },
      {
        tipo: "texto",
        valor: r ? fmt(r.presionResidual_kPa, undefined, 0) : "—",
        mono: true,
      },
      r
        ? {
            tipo: "estado",
            veredicto: r.estado,
            extra: marcas.join(" · ") || undefined,
          }
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

  const filaAparato = (a: AparatoInputHS4, depth: number): OutlinerFila => {
    const r = resultadoAparato.get(a.id);
    const modoPresion =
      a.esFluxorOCalentador === undefined
        ? "auto"
        : a.esFluxorOCalentador
          ? "fluxor"
          : "grifo";
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
        onChange: (v) => patchAparato(a.id, { tipo: v as TipoAparatoHS4 }),
      },
      {
        tipo: "select",
        valor: modoPresion,
        opciones: PRESION_MIN_OPTIONS,
        onChange: (v) =>
          patchAparato(a.id, {
            esFluxorOCalentador: v === "auto" ? undefined : v === "fluxor",
          }),
      },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: "", dim: true },
      {
        tipo: "texto",
        valor: r ? fmt(r.caudalInstantaneo_dm3_s, undefined, 2) : "—",
        mono: true,
      },
      {
        tipo: "texto",
        valor:
          r?.diametroMinDerivacion_mm != null
            ? `Ø${fmt(r.diametroMinDerivacion_mm, undefined, 0)}`
            : "—",
        mono: true,
      },
      { tipo: "texto", valor: "", dim: true },
      {
        tipo: "texto",
        valor: r ? fmt(r.presionMinExigida_kPa, undefined, 0) : "—",
        mono: true,
        dim: true,
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
    const empujar = (t: TramoInputHS4, depth: number) => {
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

  // Pie de selección del panel de esquema.
  let textoSeleccion: string | null = null;
  if (selVigente) {
    const nombre = etiquetas[selVigente] ?? selVigente;
    const rt = resultadoTramo.get(selVigente);
    const ra = resultadoAparato.get(selVigente);
    if (rt) {
      textoSeleccion = `${nombre} — ${rt.diametro_mm != null ? `Ø${fmt(rt.diametro_mm, undefined, 0)}` : "Ø —"} · ${fmt(rt.caudalCalculo_dm3_s, "dm³/s", 2)} · ${fmt(rt.presionResidual_kPa, "kPa", 0)} · ${ESTADO_LABEL[rt.estado]}`;
    } else if (ra) {
      textoSeleccion = `${nombre} — ${fmt(ra.caudalInstantaneo_dm3_s, "dm³/s", 2)} · P mín ${fmt(ra.presionMinExigida_kPa, "kPa", 0)} · ${ESTADO_LABEL[ra.estado]}`;
    }
  }

  // Tamaño del esquema: cabe entero en el lienzo (proporción del viewBox nativo).
  const { nativeW, nativeH } = hs4NativeSize(result);

  const resumen: ResumenVeredicto | null = useMemo(
    () => (valid ? resumenHs4(result) : null),
    [valid, result],
  );

  // Herencia CONDICIONAL de la presión de acometida (ver comentario de cabecera):
  // con el dato informado en el expediente, manda «Del proyecto» (columna izquierda) y
  // el Field local se oculta.
  const presionHeredada = herencia.campos.some(
    (c) => c.campo === "presionAcometida_kPa",
  );

  const apCritico =
    result.puntoCriticoId != null
      ? result.porAparato.find((a) => a.id === result.puntoCriticoId)
      : undefined;
  const presionMinCritico_kPa = apCritico?.presionMinExigida_kPa ?? null;

  const entradas = (
    <>
      <CollapsibleSection
        label="Suministro"
        refNorma="DB-HS4 ap. 2.1.3 / 4.2"
      >
        <div>
          {!presionHeredada && (
            <Field
              id="presion-acometida"
              label="Presión acometida"
              sub="P"
              unit="kPa"
              help="Presión disponible en la acometida (entrada de la red). Es el punto de partida de la presión residual: a lo largo del recorrido se le restan las pérdidas de carga y la cota. Si en el punto más desfavorable cae por debajo de la mínima exigida, hace falta grupo de presión (ap. 4.5)."
              refText="DB-HS4 ap. 2.1.3"
            >
              <NumberInput
                id="presion-acometida"
                value={state.presionAcometida_kPa}
                onChange={(v) => setField("presionAcometida_kPa", v)}
                min={0}
                step={10}
              />
            </Field>
          )}
          <Field
            id="criterio-k"
            label="Simultaneidad"
            sub="K"
            help="Coeficiente de simultaneidad K aplicado al caudal acumulado de cada tramo. UNE 149201 (K = 1/√(n−1)) es un CRITERIO EXTERNO, no exigencia del DB-HS4 (el DB sólo remite a «un criterio adecuado»). «Sin simultaneidad» suma directa de caudales (K = 1)."
            refText="UNE 149201 (criterio externo)"
          >
            <SelectInput<CriterioK>
              id="criterio-k"
              value={state.criterioK}
              options={CRITERIO_K_OPTIONS}
              onChange={(v) => setField("criterioK", v)}
            />
          </Field>
          <Field
            id="perdidas-localizadas"
            label="Pérdidas local."
            sub="%"
            unit="%"
            help="Fracción de pérdidas localizadas (codos, tes, válvulas…) estimada sobre las longitudinales. Es buena práctica de cálculo (20–30 %), NO cifra del DB-HS4. Por defecto 25 %."
            refText="Buena práctica (no DB)"
          >
            <NumberInput
              id="perdidas-localizadas"
              value={fraccionPct}
              onChange={(v) =>
                setField("fraccionPerdidasLocalizadas", v / 100)
              }
              min={20}
              max={30}
              step={1}
            />
          </Field>
        </div>
      </CollapsibleSection>
      <CollapsibleSection
        label="Resumen"
        refNorma="DB-HS4 ap. 2.1.3 / 4.5"
      >
        <dl className="text-[13px]">
          <FilaResumen
            k="Caudal de cálculo total"
            v={fmt(result.caudalTotal_dm3_s, "dm³/s", 2)}
            sub="que llega a la acometida"
          />
          <FilaResumen
            k="Presión en el punto crítico"
            v={fmt(result.presionCritica_kPa, "kPa", 0)}
            sub={
              presionMinCritico_kPa != null
                ? `mínima exigida ${fmt(presionMinCritico_kPa, "kPa", 0)}${
                    apCritico ? ` · ${apCritico.id}` : ""
                  }`
                : "sin punto de consumo crítico"
            }
          />
          <FilaResumen
            k="Grupo de presión (ap. 4.5)"
            v={
              result.grupoPresionNecesario ? "Necesario" : "No necesario"
            }
            sub={
              result.grupoPresionNecesario
                ? "la presión cae por debajo de la mínima en el punto más desfavorable"
                : "la presión de acometida es suficiente"
            }
          />
          <FilaResumen
            k="Criterio de simultaneidad"
            v={
              result.criterioK === "une149201"
                ? "K = 1/√(n−1)"
                : "K = 1 (sin simultaneidad)"
            }
            sub={
              result.kEsCriterioExterno
                ? `${result.normaCriterioK ?? "UNE 149201"} — criterio externo (no exigencia CTE)`
                : "suma directa de caudales"
            }
          />
        </dl>
      </CollapsibleSection>
      {/* Zona única de ALCANCE Y SUPUESTOS (ARCH-1 / ARCH-2): las
          limitaciones agrupadas, visibles y no solo color. */}
      <div className="mt-4">
        <div className="text-text-disabled mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
          Alcance y supuestos
        </div>
        <DisclosureNote>
          <span className="font-semibold">Alcance:</span> esta versión
          dimensiona solo la red de agua fría (AF). La red de ACS (agua
          caliente sanitaria) no se dimensiona en esta versión.
        </DisclosureNote>
        <DisclosureNote>
          <span className="font-semibold">Presión estimada:</span> los
          valores de presión (residual, en el punto crítico y la necesidad
          de grupo de presión) provienen de un modelo de predimensionado y
          son orientativos; no sustituyen un cálculo hidráulico de
          detalle.
        </DisclosureNote>
        <p className="text-text-disabled text-[11px] leading-snug">
          El coeficiente de simultaneidad K (UNE 149201) y la estimación
          de pérdidas localizadas (20–30 %) son criterios externos al
          DB-HS4, no exigencias del CTE. El modelo de pérdida de carga es
          de predimensionado.
        </p>
      </div>
    </>
  );

  const tablaTramos = (
    <div className="overflow-x-auto">
      <Outliner
        columnas={COLUMNAS_HS4}
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
                title={`Añadir una derivación de ${p.label.toLowerCase()} con sus aparatos`}
                className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary rounded border px-2 py-0.5 text-[11px] transition-colors"
              >
                + {p.label}
              </button>
            ))}
          </div>
        }
      />
    </div>
  );

  return (
    <ModuleLayout
      justificacionKey="hs4"
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
      entradas={entradas}
      dibujo={{
        titulo: "Esquema de columna",
        lienzo: (
          <LienzoAjustado>
            {(caja) => {
              const { width, height } = ajustar(nativeW, nativeH, caja, { max: 900 });
              return (
                <HS4SVG
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
            pista="Pulsa un tramo o un punto de consumo del esquema, o una fila en Comprobaciones."
          />
        ),
      }}
      comprobaciones={tablaTramos}
      memoria={{ generar: generarFicha, valid }}
    >
      {/* Clon oculto del SVG para el raster del PDF (mismo id que busca renderFicha). */}
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div
          id={HS4_PDF_SVG_ID}
          style={{ position: "absolute", left: "-9999px", top: 0 }}
        >
          <HS4SVG result={result} mode="pdf" width={420} height={315} />
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

// -----------------------------------------------------------------------------
// Nota de alcance/limitación VISIBLE (ARCH-1 / ARCH-2). Banner discreto pero no
// escondido: tinte neutral + icono + texto. Accesible: `role="note"` y el icono
// es decorativo (`aria-hidden`) porque el texto ya lo dice todo (no solo color).
// -----------------------------------------------------------------------------
function DisclosureNote({ children }: { children: ReactNode }) {
  return (
    <div
      role="note"
      className="bg-tint-neutral border-border-main text-text-secondary mb-3 flex items-start gap-2 rounded border px-3 py-2 text-[12px] leading-snug"
    >
      <Info
        size={15}
        className="text-text-disabled mt-0.5 shrink-0"
        aria-hidden="true"
      />
      <p className="min-w-0">{children}</p>
    </div>
  );
}
