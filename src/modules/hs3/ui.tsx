// DB-HS3 — Pantalla del módulo de ventilación. Cablea el motor (./calc), el
// esquema (./svg) y la ficha PDF (./ficha) sobre el esqueleto de feature-6
// en la anatomía v4 (<ModuleLayout>, REDISENO-V4 §3.3): a la izquierda el
// formulario corto (dormitorios + modo de conducto), la lista de estancias y el
// balance; el esquema grande con su franja; en Comprobaciones el OUTLINER de
// estancias (inputs y resultados en la misma fila) y, en modo avanzado, el
// SEGUNDO outliner jerárquico de la red de colectivos (colectivo → planta →
// estancia húmeda que vierte). Todo comparte la misma selección.
//
// La jerarquía del outliner de red es FIJA por construcción (colectivo →
// planta → referencia): no hay Tab/Shift-Tab (filas `anidable:false`); Enter
// añade un HERMANO del mismo kind. Los ids de fila de plantas/referencias se
// componen de forma determinista (`<colectivoId>#p<índice>[#<estanciaId>]`)
// SOLO para el outliner: el estado persiste con la forma real de `Colectivo[]`.
//
// React 19 + React Compiler: componente PURO. El cálculo es síncrono en render
// (useMemo sobre el estado diferido); no hay efectos de cálculo. Los ids de
// estancias/colectivos se generan de forma DETERMINISTA en los handlers de
// evento (nunca en render, nunca con Math.random/Date), derivando un contador
// del estado actual. Las mutaciones de las listas son siempre INMUTABLES.

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
import { ListaElementos } from "../../components/justificacion/ListaElementos";
import { PdfPreviewModal } from "../../components/ui/PdfPreviewModal";
import { CollapsibleSection } from "../../components/ui/CollapsibleSection";
import { Field, InputLabel, NumberInput } from "../../components/ui/InputLabel";
import { showToast } from "../../components/ui/Toast";
import { Outliner } from "../../components/outliner/Outliner";
import type {
  OutlinerCelda,
  OutlinerColumna,
  OutlinerFila,
} from "../../components/outliner/tipos";
import { renderFicha } from "../../lib/pdf/renderFicha";
import { STATE_TEXT, STATE_TINT } from "../../lib/ui/veredicto";
import { fmt } from "../../lib/units/format";
import { notasExcepcionesLocales } from "../../lib/proyecto/herencia";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { generarHs3 } from "../../lib/proyecto/viviendaTipo";
import {
  calcHS3,
  esHumedo,
  hs3Defaults,
  type Colectivo,
  type Estancia,
  type HS3Inputs,
  type HS3Result,
  type ModoConducto,
  type PlantaColectivo,
  type ResultadoTramoRed,
  type TipoEstancia,
} from "./calc";
import { HS3SVG } from "./svg";
import { HS3_PDF_SVG_ID, hs3NativeSize } from "./svg-meta";
import { toFichaData } from "./ficha";
import { resumenHs3 } from "./resumen";

// -----------------------------------------------------------------------------
// Opciones y etiquetas de los selects (declaradas a módulo: estables entre
// renders).
// -----------------------------------------------------------------------------
const TIPO_OPTIONS: { value: TipoEstancia; label: string }[] = [
  { value: "dorm_principal", label: "Dorm. principal" },
  { value: "dormitorio", label: "Dormitorio" },
  { value: "salon_comedor", label: "Salón-comedor" },
  { value: "cocina", label: "Cocina" },
  { value: "bano", label: "Baño" },
  { value: "aseo", label: "Aseo" },
];

const ESTADO_LABEL: Record<string, string> = {
  ok: "Cumple",
  warn: "Aviso",
  fail: "No cumple",
  neutral: "Informativo",
};

// Columnas del outliner de ESTANCIAS: inputs (nombre, tipo, caudal, cocción) y
// resultados (requerido, abertura, estado) en la MISMA fila (§6 del reconcept).
const COLUMNAS_ESTANCIAS: OutlinerColumna[] = [
  { key: "estancia", header: "Estancia", align: "left" },
  { key: "tipo", header: "Tipo", align: "left", width: "148px" },
  { key: "caudal", header: "Caudal", align: "right", width: "104px" },
  { key: "coccion", header: "Cocción", align: "right", width: "104px" },
  { key: "req", header: "Requerido", align: "right", width: "90px" },
  { key: "abertura", header: "Abertura", align: "right", width: "110px" },
  { key: "estado", header: "Estado", align: "left", width: "140px" },
];

// Columnas del outliner de RED (modo avanzado): colectivo (nombre) → planta
// (nivel) → referencia (select de húmedas), con qvt/sección por tramo y la
// clase de tiro + «◆ manda» en el canal textual (nunca solo color).
const COLUMNAS_RED: OutlinerColumna[] = [
  { key: "elemento", header: "Elemento", align: "left" },
  { key: "nivel", header: "Nivel", align: "right", width: "90px" },
  { key: "qvt", header: "qvt", align: "right", width: "90px" },
  { key: "seccion", header: "Sección", align: "right", width: "96px" },
  { key: "tiro", header: "Tiro", align: "left", width: "130px" },
];

// -----------------------------------------------------------------------------
// Id determinista para una nueva estancia: contador derivado del estado actual.
// NO usa Math.random ni Date (React-Compiler-safe; solo se invoca en handlers).
// Extrae el sufijo numérico mayor de los ids "estancia-N" + de los ids semilla,
// y devuelve el siguiente. Garantiza unicidad e idempotencia por estado.
// -----------------------------------------------------------------------------
function nextEstanciaId(estancias: Estancia[]): string {
  let max = 0;
  for (const e of estancias) {
    const m = /^estancia-(\d+)$/.exec(e.id);
    if (m) {
      const n = Number(m[1]);
      if (n > max) max = n;
    }
  }
  return `estancia-${max + 1}`;
}

/** Id determinista para un nuevo colectivo: "C1", "C2"… (sufijo mayor + 1). */
function nextColectivoId(cols: Colectivo[]): string {
  let max = 0;
  for (const c of cols) {
    const m = /^C(\d+)$/.exec(c.id);
    if (m) {
      const n = Number(m[1]);
      if (n > max) max = n;
    }
  }
  return `C${max + 1}`;
}

// -----------------------------------------------------------------------------
// Ids de fila del outliner de RED — SOLO presentación (el estado persiste con la
// forma real `Colectivo[]`). Composición determinista:
//   colectivo → `<colectivoId>`
//   planta    → `<colectivoId>#p<índice>`
//   referencia→ `<colectivoId>#p<índice>#<estanciaId>`
// Los ids de colectivo son "CN" y los de estancia no llevan "#", así que el
// parseo por split es unívoco.
// -----------------------------------------------------------------------------
const plantaRowId = (cid: string, pIdx: number) => `${cid}#p${pIdx}`;
const refRowId = (cid: string, pIdx: number, eid: string) =>
  `${cid}#p${pIdx}#${eid}`;

type RedRowRef =
  | { kind: "colectivo"; cid: string }
  | { kind: "planta"; cid: string; pIdx: number }
  | { kind: "ref"; cid: string; pIdx: number; eid: string };

function parseRedRowId(id: string): RedRowRef {
  const [cid, p, ...resto] = id.split("#");
  if (p === undefined) return { kind: "colectivo", cid };
  const pIdx = Number(p.slice(1));
  if (resto.length === 0) return { kind: "planta", cid, pIdx };
  return { kind: "ref", cid, pIdx, eid: resto.join("#") };
}

/**
 * Alias mapeado de HS3Inputs para el generic de useJustificacionState: los
 * `interface` NO llevan index signature implícita y no satisfacen la
 * restricción `Record<string, unknown>` del hook; el alias mapeado (idéntico
 * estructuralmente y mutuamente asignable) sí. Mismo truco que en HS5 (T5.1).
 */
type Hs3State = { [K in keyof HS3Inputs]: HS3Inputs[K] };

export function Hs3Module() {
  const { state, setField, reset, herencia } = useJustificacionState<Hs3State>(
    "hs3",
    hs3Defaults,
  );
  const { proyecto, derivados } = useProyecto();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const deferredState = useDeferredValue(state);
  const result = useMemo(() => calcHS3(deferredState), [deferredState]);

  // ── Modo del conducto + red colectiva (modo avanzado) ──────────────────────
  const modo: ModoConducto = state.modoConducto ?? "rapido";
  const redColectivos = state.redColectivos ?? [];
  const humedos = state.estancias.filter((e) => esHumedo(e.tipo));

  // ── Validación de entrada (paridad con la versión anterior) ────────────────
  const valid =
    Number.isInteger(state.numDormitorios) &&
    state.numDormitorios >= 0 &&
    state.estancias.length >= 1 &&
    state.estancias.every(
      (e) =>
        Number.isFinite(e.caudalPropuesto_l_s) && e.caudalPropuesto_l_s > 0,
    ) &&
    // Modo avanzado: una red colectiva no válida bloquea la exportación de la
    // ficha (errores duros), sin tocar el veredicto normativo.
    (state.modoConducto !== "avanzado" ||
      (result.red?.estadoRed.valida ?? false));

  // La selección solo es vigente si la fila sigue existiendo (borrar la fila
  // seleccionada no deja una selección fantasma). El universo de ids incluye
  // las filas compuestas del outliner de red (solo en modo avanzado).
  const idsEstancias = new Set(state.estancias.map((e) => e.id));
  const idsRed = new Set<string>();
  if (modo === "avanzado") {
    for (const c of redColectivos) {
      idsRed.add(c.id);
      c.plantas.forEach((p, pi) => {
        idsRed.add(plantaRowId(c.id, pi));
        for (const eid of p.estanciasIds) idsRed.add(refRowId(c.id, pi, eid));
      });
    }
  }
  const selVigente =
    selectedId !== null &&
    (idsEstancias.has(selectedId) || idsRed.has(selectedId))
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
          key: "hs3",
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

  // ── Mutaciones inmutables — estancias ──────────────────────────────────────
  const patchEstancia = (id: string, patch: Partial<Estancia>) => {
    setField(
      "estancias",
      state.estancias.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  };

  /** Enter / "+ Añadir estancia": inserta tras la fila de referencia (o al final). */
  const handleAddEstancia = (afterId: string | null) => {
    const nueva: Estancia = {
      id: nextEstanciaId(state.estancias),
      tipo: "dormitorio",
      caudalPropuesto_l_s: 4,
    };
    const i = afterId
      ? state.estancias.findIndex((e) => e.id === afterId)
      : -1;
    setField(
      "estancias",
      i >= 0
        ? [
            ...state.estancias.slice(0, i + 1),
            nueva,
            ...state.estancias.slice(i + 1),
          ]
        : [...state.estancias, nueva],
    );
    setSelectedId(nueva.id);
  };

  /** Supr / papelera: respeta el mínimo de 1 estancia (`borrable` ya lo gatea). */
  const handleRemoveEstancia = (id: string) => {
    if (state.estancias.length <= 1) return;
    setField(
      "estancias",
      state.estancias.filter((e) => e.id !== id),
    );
    if (selectedId === id) setSelectedId(null);
  };

  // ── Mutaciones inmutables — red colectiva (modo avanzado) ──────────────────
  const setRed = (cols: Colectivo[]) => setField("redColectivos", cols);

  // Siembra UN colectivo con todos los húmedos en la planta baja (editable).
  const seedFromEstancias = () =>
    setRed([
      {
        id: "C1",
        plantas: [{ nivel: 0, estanciasIds: humedos.map((e) => e.id) }],
      },
    ]);

  // ── Generar desde viviendas tipo (feature-8 §C) ────────────────────────────
  // Dos pulsaciones (la primera ARMA la confirmación, la segunda aplica): el
  // generador puro propone estancias + red colectiva de la vivienda tipo y su
  // reparto por plantas, REEMPLAZANDO lo actual. Todo queda editable después;
  // sus `notas` (p.ej. varias viviendas por planta ⇒ vertical tipo) se avisan.
  const puedeGenerarVT = (proyecto.viviendasTipo?.length ?? 0) > 0;
  const [confirmarGenerarVT, setConfirmarGenerarVT] = useState(false);
  const handleGenerarVT = () => {
    if (!confirmarGenerarVT) {
      setConfirmarGenerarVT(true);
      return;
    }
    const gen = generarHs3(proyecto.viviendasTipo ?? [], proyecto.repartoPlantas);
    setField("numDormitorios", gen.numDormitorios);
    setField("estancias", gen.estancias);
    setField("modoConducto", gen.modoConducto);
    setField("redColectivos", gen.redColectivos ?? []);
    setConfirmarGenerarVT(false);
    setSelectedId(null);
    showToast(
      gen.notas.length > 0
        ? `Estancias generadas · ${gen.notas[0]}`
        : "Estancias y red generadas desde las viviendas tipo del proyecto",
      { autoDismiss: gen.notas.length > 0 ? 6000 : 3000 },
    );
  };

  const patchColectivo = (cid: string, patch: Partial<Colectivo>) =>
    setRed(redColectivos.map((c) => (c.id === cid ? { ...c, ...patch } : c)));

  const patchPlanta = (
    cid: string,
    pIdx: number,
    patch: Partial<PlantaColectivo>,
  ) => {
    const col = redColectivos.find((c) => c.id === cid);
    if (!col) return;
    patchColectivo(cid, {
      plantas: col.plantas.map((p, k) => (k === pIdx ? { ...p, ...patch } : p)),
    });
  };

  /**
   * Cambia a qué estancia húmeda apunta una referencia. Duplicar la misma
   * estancia dentro de una planta rompería las claves de fila y el motor lo
   * marcaría como doble conteo: en ese caso, no-op honesto.
   */
  const cambiarRefEstancia = (
    cid: string,
    pIdx: number,
    eidActual: string,
    eidNuevo: string,
  ) => {
    const col = redColectivos.find((c) => c.id === cid);
    const p = col?.plantas[pIdx];
    if (!col || !p || eidActual === eidNuevo) return;
    if (p.estanciasIds.includes(eidNuevo)) return;
    patchPlanta(cid, pIdx, {
      estanciasIds: p.estanciasIds.map((x) => (x === eidActual ? eidNuevo : x)),
    });
    setSelectedId(refRowId(cid, pIdx, eidNuevo));
  };

  /**
   * Enter / "+ Añadir colectivo" en el outliner de red. La jerarquía es fija,
   * así que Enter añade un HERMANO del mismo kind que la fila de referencia:
   *  - colectivo → colectivo nuevo insertado justo después;
   *  - planta → planta nueva en el mismo colectivo (nivel = máximo + 1);
   *  - referencia → otra referencia en la MISMA planta (primera húmeda aún no
   *    asignada en ella; si no queda ninguna libre, no-op — no se duplica);
   *  - null / fuera de la red → colectivo nuevo al final.
   */
  const handleAddRed = (afterId: string | null) => {
    const nuevoColectivo = (): Colectivo => ({
      id: nextColectivoId(redColectivos),
      plantas: [{ nivel: 0, estanciasIds: [] }],
    });
    if (afterId === null || !idsRed.has(afterId)) {
      const nuevo = nuevoColectivo();
      setRed([...redColectivos, nuevo]);
      setSelectedId(nuevo.id);
      return;
    }
    const ref = parseRedRowId(afterId);
    const ci = redColectivos.findIndex((c) => c.id === ref.cid);
    if (ci < 0) return;
    const col = redColectivos[ci];

    if (ref.kind === "colectivo") {
      const nuevo = nuevoColectivo();
      setRed([
        ...redColectivos.slice(0, ci + 1),
        nuevo,
        ...redColectivos.slice(ci + 1),
      ]);
      setSelectedId(nuevo.id);
      return;
    }

    if (ref.kind === "planta") {
      const maxNivel = col.plantas.reduce((m, p) => Math.max(m, p.nivel), -1);
      patchColectivo(col.id, {
        plantas: [
          ...col.plantas.slice(0, ref.pIdx + 1),
          { nivel: maxNivel + 1, estanciasIds: [] },
          ...col.plantas.slice(ref.pIdx + 1),
        ],
      });
      setSelectedId(plantaRowId(col.id, ref.pIdx + 1));
      return;
    }

    const p = col.plantas[ref.pIdx];
    if (!p) return;
    const libre = humedos.find((e) => !p.estanciasIds.includes(e.id));
    if (!libre) return;
    patchPlanta(col.id, ref.pIdx, {
      estanciasIds: [...p.estanciasIds, libre.id],
    });
    setSelectedId(refRowId(col.id, ref.pIdx, libre.id));
  };

  /**
   * Borrado en la red, con las mismas garantías que la UI anterior: un
   * colectivo se quita entero (la red puede quedar vacía → vuelve el estado
   * vacío); una planta exige conservar al menos una por colectivo; una
   * referencia simplemente deja de verter en esa planta.
   */
  const handleRemoveRed = (id: string) => {
    const ref = parseRedRowId(id);
    const col = redColectivos.find((c) => c.id === ref.cid);
    if (!col) return;
    if (ref.kind === "colectivo") {
      setRed(redColectivos.filter((c) => c.id !== ref.cid));
    } else if (ref.kind === "planta") {
      if (col.plantas.length <= 1) return;
      patchColectivo(ref.cid, {
        plantas: col.plantas.filter((_, k) => k !== ref.pIdx),
      });
    } else {
      const p = col.plantas[ref.pIdx];
      if (!p) return;
      patchPlanta(ref.cid, ref.pIdx, {
        estanciasIds: p.estanciasIds.filter((x) => x !== ref.eid),
      });
    }
    if (selectedId === id) setSelectedId(null);
  };

  /** La jerarquía de ambos outliners es fija: Tab/Shift-Tab no hacen nada. */
  const sinAnidar = () => {};

  // ── Proyección estado+resultado → filas del outliner de ESTANCIAS ─────────
  const resultadoEstancia = new Map(
    result.porEstancia.map((r) => [r.id, r] as const),
  );

  const filasEstancias: OutlinerFila[] = state.estancias.map((e) => {
    const r = resultadoEstancia.get(e.id);
    const esCocina = e.tipo === "cocina";
    const celdas: OutlinerCelda[] = [
      {
        tipo: "nombre",
        valor: e.nombre ?? e.id,
        onChange: (v) => patchEstancia(e.id, { nombre: v }),
      },
      {
        tipo: "select",
        valor: e.tipo,
        opciones: TIPO_OPTIONS,
        // Al dejar de ser cocina se apaga la cocción (entrada sin efecto).
        onChange: (v) =>
          patchEstancia(
            e.id,
            v === "cocina"
              ? { tipo: "cocina" }
              : { tipo: v as TipoEstancia, esCoccion: false },
          ),
      },
      {
        tipo: "numero",
        valor: e.caudalPropuesto_l_s,
        onChange: (v) => patchEstancia(e.id, { caudalPropuesto_l_s: v }),
        min: 0,
        step: 1,
        unidad: "l/s",
      },
      // Cocción SOLO en cocinas: >0 activa la extracción independiente con ese
      // caudal; vacío/0 la apaga. En el resto de filas, celda vacía atenuada.
      esCocina
        ? {
            tipo: "numero",
            valor: e.esCoccion ? (e.caudalCoccion_l_s ?? 50) : undefined,
            onChange: (v) =>
              patchEstancia(
                e.id,
                v > 0
                  ? { esCoccion: true, caudalCoccion_l_s: v }
                  : { esCoccion: false },
              ),
            min: 0,
            step: 1,
            unidad: "l/s",
          }
        : { tipo: "texto", valor: "", dim: true },
      {
        tipo: "texto",
        valor: r ? fmt(r.caudalRequerido_l_s, "l/s") : "—",
        mono: true,
      },
      {
        tipo: "texto",
        valor: r
          ? `${fmt(r.areaAbertura_cm2, "cm²", 0)} · ${
              r.tipoAbertura === "extraccion" ? "extr." : "adm."
            }`
          : "—",
        mono: true,
      },
      r
        ? {
            tipo: "estado",
            veredicto: r.estado,
            extra: r.cumpleCoccion === false ? "cocción ✗" : undefined,
          }
        : { tipo: "texto", valor: "—", dim: true },
    ];
    return {
      id: e.id,
      depth: 0,
      kind: "estancia",
      anidable: false,
      borrable: state.estancias.length > 1,
      celdas,
    };
  });

  // ── Proyección → filas del outliner de RED (modo avanzado) ─────────────────
  const estanciaPorId = new Map(state.estancias.map((e) => [e.id, e] as const));
  const tramoRedPorId = new Map<string, ResultadoTramoRed>();
  if (result.red) {
    for (const c of result.red.colectivos)
      for (const t of c.tramos) tramoRedPorId.set(t.id, t);
  }
  const colectivoResultado = new Map(
    (result.red?.colectivos ?? []).map((c) => [c.id, c] as const),
  );

  // Opciones del select de una referencia: las húmedas actuales; si la
  // referencia apunta a una estancia que ya no existe o dejó de ser húmeda, se
  // añade como opción marcada para no falsear el valor mostrado.
  const opcionesHumedas = humedos.map((e) => ({
    value: e.id,
    label: e.nombre ?? e.id,
  }));
  const opcionesRef = (eid: string) =>
    opcionesHumedas.some((o) => o.value === eid)
      ? opcionesHumedas
      : [{ value: eid, label: `${eid} (no es húmeda)` }, ...opcionesHumedas];

  const filasRed: OutlinerFila[] = [];
  for (const c of redColectivos) {
    const rc = colectivoResultado.get(c.id);
    const boca = tramoRedPorId.get(`${c.id}:boca`);
    filasRed.push({
      id: c.id,
      depth: 0,
      kind: "colectivo",
      anidable: false,
      borrable: true,
      celdas: [
        {
          tipo: "nombre",
          valor: c.nombre ?? c.id,
          onChange: (v) => patchColectivo(c.id, { nombre: v }),
        },
        { tipo: "texto", valor: "", dim: true },
        {
          tipo: "texto",
          valor: rc ? fmt(rc.qvtBoca_l_s, "l/s") : "—",
          mono: true,
        },
        {
          tipo: "texto",
          valor: boca ? fmt(boca.seccionRequerida_cm2, "cm²", 0) : "—",
          mono: true,
        },
        {
          tipo: "texto",
          valor: rc
            ? `clase ${rc.claseTiro}${boca?.esManda ? " · ◆ manda" : ""}`
            : "—",
          dim: !boca?.esManda,
        },
      ],
    });
    c.plantas.forEach((p, pi) => {
      const t = tramoRedPorId.get(`${c.id}:${p.nivel}`);
      filasRed.push({
        id: plantaRowId(c.id, pi),
        depth: 1,
        kind: "planta",
        anidable: false,
        borrable: c.plantas.length > 1,
        celdas: [
          { tipo: "texto", valor: "Planta", dim: true },
          {
            tipo: "numero",
            valor: p.nivel,
            onChange: (v) => patchPlanta(c.id, pi, { nivel: v }),
            min: 0,
            step: 1,
          },
          {
            tipo: "texto",
            valor: t ? fmt(t.qvtAcum_l_s, "l/s") : "—",
            mono: true,
          },
          {
            tipo: "texto",
            valor: t ? fmt(t.seccionRequerida_cm2, "cm²", 0) : "—",
            mono: true,
          },
          t?.esManda
            ? { tipo: "texto", valor: "◆ manda", mono: true }
            : { tipo: "texto", valor: "", dim: true },
        ],
      });
      for (const eid of p.estanciasIds) {
        const e = estanciaPorId.get(eid);
        filasRed.push({
          id: refRowId(c.id, pi, eid),
          depth: 2,
          kind: "ref",
          anidable: false,
          borrable: true,
          celdas: [
            {
              tipo: "select",
              valor: eid,
              opciones: opcionesRef(eid),
              onChange: (v) => cambiarRefEstancia(c.id, pi, eid, v),
            },
            { tipo: "texto", valor: "", dim: true },
            {
              tipo: "texto",
              valor:
                e && esHumedo(e.tipo)
                  ? fmt(e.caudalPropuesto_l_s, "l/s")
                  : "—",
              mono: true,
              dim: true,
            },
            { tipo: "texto", valor: "", dim: true },
            { tipo: "texto", valor: "", dim: true },
          ],
        });
      }
    });
  }

  // Etiquetas legibles (id→nombre) para el esquema y el pie de selección:
  // estancias y colectivos CON nombre (contrato de sincronía de feature-7).
  const etiquetas: Record<string, string> = {};
  for (const e of state.estancias) if (e.nombre) etiquetas[e.id] = e.nombre;
  for (const c of redColectivos) if (c.nombre) etiquetas[c.id] = c.nombre;

  // Pie de selección del panel de esquema. Solo las ESTANCIAS tienen resumen
  // ("bano — 8 l/s ≥ 7 l/s · Cumple"); una fila de la red no lo tiene (pie vacío).
  let textoSeleccion: string | null = null;
  if (selVigente) {
    const re = resultadoEstancia.get(selVigente);
    if (re) {
      const nombre = etiquetas[selVigente] ?? selVigente;
      textoSeleccion = `${nombre} — ${fmt(re.caudalPropuesto_l_s, "l/s")} ≥ ${fmt(re.caudalRequerido_l_s, "l/s")} · ${ESTADO_LABEL[re.estado]}`;
    }
  }

  // Tamaño del esquema: cabe entero en el lienzo conservando la proporción del
  // viewBox nativo. `hs3NativeSize` ya elige por sí misma la geometría de la RED
  // cuando hay `result.red` (misma elección que hace HS3SVG al pintar).
  const { nativeW, nativeH } = hs3NativeSize(result);

  // Resumen para la banda del shell (mismo contenido que la antigua banda
  // inline, ver ./resumen). `null` con datos inválidos → banda neutra "Datos
  // insuficientes" del shell.
  const resumen: ResumenVeredicto | null = useMemo(
    () => (valid ? resumenHs3(result) : null),
    [valid, result],
  );

  // Estancias para la lista de la izquierda (mismo id que la fila y el dibujo).
  const elementosEstancias = result.porEstancia.map((r) => ({
    id: r.id,
    nombre: etiquetas[r.id] ?? r.id,
    valor: fmt(r.caudalPropuesto_l_s, "l/s"),
    estado: r.estado,
  }));

  const entradas = (
    <>
      <CollapsibleSection
        label="Vivienda y conducto"
        refNorma="DB-HS3 Tabla 2.1 / 4.3"
      >
        <div className="flex flex-col gap-1">
          <div>
            <Field
              id="num-dormitorios"
              label="Dormitorios"
              sub="nº"
              help="Número de dormitorios de la vivienda. Deriva la categoría de la Tabla 2.1 (0-1 · 2 · 3+) que fija los caudales mínimos."
              refText="DB-HS3 Tabla 2.1"
            >
              <NumberInput
                id="num-dormitorios"
                value={state.numDormitorios}
                onChange={(v) => setField("numDormitorios", v)}
                min={0}
                step={1}
              />
            </Field>
            {modo === "rapido" && (
              // numPlantasConducto NO se hereda: son las plantas que
              // vierten AL CONDUCTO (saturado en 8), no las plantas del
              // edificio. La ayuda recuerda el dato del expediente a
              // título orientativo — el proyecto propone, el proyectista
              // decide.
              <Field
                id="num-plantas-conducto"
                label="Plantas (conducto)"
                sub="nº"
                help={
                  "Nº de plantas entre la más baja que vierte al conducto y la última (ambas incluidas). Con la zona térmica fija la clase de tiro (Tabla 4.3). Se satura en 8 (8 o más). " +
                  `El proyecto declara ${proyecto.datosGenerales.plantasSobreRasante} plantas sobre rasante, pero este dato es propio del conducto: el proyecto propone, el proyectista decide.`
                }
                refText="DB-HS3 Tabla 4.3"
              >
                <NumberInput
                  id="num-plantas-conducto"
                  value={state.numPlantasConducto}
                  onChange={(v) => setField("numPlantasConducto", v)}
                  min={1}
                  step={1}
                />
              </Field>
            )}
          </div>
          <div className="py-1">
            <InputLabel
              label="Conducto de extracción"
              help="Rápido: un único conducto agregado (nº de plantas + zona térmica → clase de tiro). Avanzado: red de conductos colectivos multiplanta, editada abajo. Los datos de cada modo persisten; solo el activo calcula/exporta."
              refText="DB-HS3 Tabla 4.2 / 4.3"
            />
            <ModoToggle
              modo={modo}
              onChange={(m) => setField("modoConducto", m)}
            />
          </div>
        </div>
      </CollapsibleSection>
      <ListaElementos
        titulo="Estancias"
        elementos={elementosEstancias}
        activoId={selVigente}
        onSelect={setSelectedId}
      />
      <CollapsibleSection
        label="Balance de vivienda"
        refNorma="DB-HS3 Tabla 2.1 / 4.1"
      >
        <dl className="text-[13px]">
          <FilaResumen
            k="Extracción de húmedos (total)"
            v={`${fmt(result.humedosTotalPropuesto_l_s, "l/s")} (mín. ${fmt(result.humedosTotalRequerido_l_s, "l/s")})`}
            estado={result.estadoHumedosTotal}
            sub={ESTADO_LABEL[result.estadoHumedosTotal]}
          />
          <FilaResumen
            k="Equilibrio admisión / extracción"
            v={`${fmt(result.totalAdmision_l_s, "l/s")} ↔ ${fmt(result.totalExtraccion_l_s, "l/s")}`}
            estado={result.estadoBalance}
            sub={ESTADO_LABEL[result.estadoBalance]}
          />
          <FilaResumen
            k="Área de abertura de paso"
            v={fmt(result.areaPaso_cm2, "cm²", 0)}
          />
        </dl>
      </CollapsibleSection>
      {!result.red && (
        <CollapsibleSection
          label="Conducto de extracción"
          refNorma="DB-HS3 Tabla 4.2 / 4.3"
        >
          <dl className="text-[13px]">
            <FilaResumen
              k={`Sección requerida (clase ${result.conducto.claseTiro})`}
              v={`${fmt(result.conducto.seccionRequerida_cm2, "cm²", 0)} · qvt ${fmt(result.conducto.qvt_l_s, "l/s")}`}
              estado="neutral"
              sub={ESTADO_LABEL.neutral}
            />
            <FilaResumen
              k="Desglose de conductos"
              v={result.conducto.conductos
                .map((cc) => `${cc.n} × ${fmt(cc.seccion_cm2, "cm²", 0)}`)
                .join(" · ")}
            />
          </dl>
          <p className="text-text-disabled mt-2 text-[11px] leading-snug">
            {result.conducto.aviso}. La sección del conducto se reporta a
            título informativo y no entra en el veredicto global.
          </p>
        </CollapsibleSection>
      )}
    </>
  );

  const comprobaciones = (
    <>
      <Outliner
        columnas={COLUMNAS_ESTANCIAS}
        filas={filasEstancias}
        selectedId={selVigente}
        onSelect={setSelectedId}
        onHover={setHoverId}
        onAdd={handleAddEstancia}
        onNest={sinAnidar}
        onUnnest={sinAnidar}
        onRemove={handleRemoveEstancia}
        etiquetaAdd="+ Añadir estancia"
        toolbar={
          puedeGenerarVT ? (
            <button
              type="button"
              onClick={handleGenerarVT}
              onBlur={() => setConfirmarGenerarVT(false)}
              title="Reemplaza las estancias (y la red colectiva) por la propuesta derivada de las viviendas tipo del proyecto"
              className={[
                "rounded border px-2 py-0.5 text-[11px] transition-colors",
                confirmarGenerarVT
                  ? "border-state-warn text-state-warn font-medium"
                  : "border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              ].join(" ")}
            >
              {confirmarGenerarVT
                ? "¿Reemplazar las estancias?"
                : "Generar desde viviendas tipo"}
            </button>
          ) : undefined
        }
      />
      {modo === "avanzado" && (
        <div className="mt-6">
          <div className="text-text-disabled mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
            Red de conductos colectiva
          </div>
          {redColectivos.length === 0 && (
            <p
              role="note"
              className="text-text-secondary border-border-sub mb-2 rounded border border-dashed px-3 py-2 text-[12px] leading-snug"
            >
              Define las columnas colectivas: cada colectivo agrupa las
              plantas que vierten a una misma boca de cubierta. Usa «+
              Añadir colectivo» o «Generar desde estancias» para sembrar la
              red con tus húmedas actuales.
            </p>
          )}
          <Outliner
            columnas={COLUMNAS_RED}
            filas={filasRed}
            selectedId={selVigente}
            onSelect={setSelectedId}
            onHover={setHoverId}
            onAdd={handleAddRed}
            onNest={sinAnidar}
            onUnnest={sinAnidar}
            onRemove={handleRemoveRed}
            etiquetaAdd="+ Añadir colectivo"
            toolbar={
              <button
                type="button"
                onClick={seedFromEstancias}
                disabled={humedos.length === 0}
                title={
                  humedos.length > 0
                    ? "Sembrar un colectivo con todas las estancias húmedas en la planta baja"
                    : "No hay estancias húmedas que asignar"
                }
                className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary rounded border px-2 py-0.5 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                Generar desde estancias
              </button>
            }
          />
        </div>
      )}
      <div className="mt-4 max-w-3xl">
        {result.red && (
          <CollapsibleSection
            label="Red colectiva de extracción"
            refNorma="DB-HS3 Tabla 4.2 / 4.3"
          >
            <RedResults red={result.red} />
          </CollapsibleSection>
        )}
      </div>
    </>
  );

  return (
    <ModuleLayout
      justificacionKey="hs3"
      resultado={resumen}
      herencia={herencia}
      acciones={{
        onExportPdf: handleExportPdf,
        pdfExporting,
        onShare: handleShare,
        onReset: reset,
      }}
      avisos={result.warnings}
      entradas={entradas}
      dibujo={{
        titulo: "Esquema",
        lienzo: (
          <LienzoAjustado>
            {(caja) => {
              const { width, height } = ajustar(nativeW, nativeH, caja, { max: 960 });
              return (
                <HS3SVG
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
            pista="Pulsa una estancia del dibujo o de la lista para ver su caudal."
          />
        ),
      }}
      comprobaciones={comprobaciones}
      memoria={{ generar: generarFicha, valid }}
    >
      {/* Clon oculto del SVG para el raster del PDF (mismo id que busca renderFicha). */}
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div
          id={HS3_PDF_SVG_ID}
          style={{ position: "absolute", left: "-9999px", top: 0 }}
        >
          <HS3SVG result={result} mode="pdf" width={420} height={252} />
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
// Conmutador de modo del conducto: rápido (tubo agregado) ↔ avanzado (red
// colectiva). Segmentado, no destructivo: los datos de cada modo persisten en el
// estado; solo el modo activo calcula/exporta.
// -----------------------------------------------------------------------------
function ModoToggle({
  modo,
  onChange,
}: {
  modo: ModoConducto;
  onChange: (m: ModoConducto) => void;
}) {
  const opt = (m: ModoConducto, label: string, sub: string) => {
    const active = modo === m;
    return (
      <button
        type="button"
        onClick={() => onChange(m)}
        aria-pressed={active}
        className={[
          "flex-1 rounded px-2 py-1.5 text-[12px] transition-colors",
          active
            ? "bg-bg-surface text-text-primary font-semibold"
            : "text-text-secondary hover:text-text-primary",
        ].join(" ")}
      >
        {label}
        <span className="text-text-disabled ml-1 text-[10px]">{sub}</span>
      </button>
    );
  };
  return (
    <div className="border-border-sub bg-bg-primary mt-1 flex gap-1 rounded border p-1">
      {opt("rapido", "Rápido", "1 conducto")}
      {opt("avanzado", "Avanzado", "red colectiva")}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Detalle de la red colectiva (modo avanzado). Si la red no es válida, los
// bloqueos van en un bloque propio (errores duros que impiden exportar) — mismo
// patrón que el aviso de árbol inválido de HS4/HS5; NO degrada el veredicto.
// El qvt/sección por tramo ya vive en las filas del outliner: aquí queda el
// resumen por colectivo con el tramo que manda (◆) y su desglose de conductos.
// -----------------------------------------------------------------------------
function RedResults({ red }: { red: NonNullable<HS3Result["red"]> }) {
  return (
    <div>
      {!red.estadoRed.valida && (
        <div className={`mb-2 rounded border px-3 py-2 ${STATE_TINT.fail}`}>
          <p className={`text-[12px] font-semibold ${STATE_TEXT.fail}`}>
            Red no válida — exportación bloqueada
          </p>
          <ul
            className={`mt-1 list-disc space-y-0.5 pl-4 text-[11px] ${STATE_TEXT.fail}`}
          >
            {red.estadoRed.bloqueos.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      <dl className="text-[13px]">
        {red.colectivos.map((c) => {
          const manda = c.tramos.find((t) => t.esManda);
          return (
            <div key={c.id} className="border-border-sub border-b py-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-text-secondary">
                  Colectivo {c.id}{" "}
                  <span className="text-text-disabled text-[11px]">
                    (clase {c.claseTiro} · {c.plantasServidas} plantas)
                  </span>
                </dt>
                <dd className="text-text-primary tabular-nums">
                  {fmt(c.qvtBoca_l_s, "l/s")}
                </dd>
              </div>
              {manda && (
                <p className="text-text-disabled mt-0.5 text-[11px]">
                  ◆ tramo que manda: {fmt(manda.seccionRequerida_cm2, "cm²", 0)}{" "}
                  (qvt {fmt(manda.qvtAcum_l_s, "l/s")}) — desglose{" "}
                  {manda.conductos
                    .map((cc) => `${cc.n} × ${fmt(cc.seccion_cm2, "cm²", 0)}`)
                    .join(" · ")}
                  .
                </p>
              )}
            </div>
          );
        })}
      </dl>

      <p className="text-text-disabled mt-2 text-[11px] leading-snug">
        Secciones de la Tabla 4.2 por tramo (dimensionado, neutral): no entran
        en el veredicto global.
      </p>
    </div>
  );
}
