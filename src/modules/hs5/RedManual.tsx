// DB-HS5 — «Ajustar a mano» (feature-14 §J, decisión 1 de REDISENO-V4 §7): el
// OUTLINER de tramos y aparatos de siempre, ahora fuera del camino principal.
// Se abre sobre la red generada desde El edificio y, desde ese momento, manda
// la tabla.
//
// La semántica del árbol vive AQUÍ (el outliner es agnóstico): anidar = colgar
// del hermano anterior; desanidar = subir al abuelo — por construcción no se
// pueden crear ciclos. Al borrar un tramo, sus hijos y aparatos pasan a su
// padre (si era raíz, los aparatos quedan colgando y el motor lo avisa).
//
// React 19 + React Compiler: componente PURO. Los ids de tramos/aparatos se
// generan de forma DETERMINISTA en los handlers (nunca en render, nunca con
// Math.random/Date), derivando un contador del estado actual. Las mutaciones de
// las listas son siempre INMUTABLES.

import type { JSX } from "react";
import { Outliner } from "../../components/outliner/Outliner";
import type { OutlinerCelda, OutlinerColumna, OutlinerFila } from "../../components/outliner/tipos";
import { PRESETS_APARATOS, type PresetAparatos } from "../../data/presetsAparatos";
import { fmt } from "../../lib/units/format";
import type { AparatoInput, HS5Result, TipoTramo, TramoInput } from "./calc";
import type { Hs5Estado } from "./estado";
import type { TipoAparato } from "./tablas";

// El tipo de fila del outliner FUSIONA tipo + disposición del colector (una sola
// celda select por fila; "colector_colgado"/"colector_enterrado" mapean a
// { tipo: "colector", disposicion }).
type TipoFilaTramo = "ramal" | "bajante" | "colector_enterrado" | "colector_colgado";

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

// Columnas: inputs (nombre, tipo, pendiente) y resultados (UD acumuladas, Ø,
// estado) en la MISMA fila (§6 del reconcept).
const COLUMNAS_HS5: OutlinerColumna[] = [
  { key: "elemento", header: "Elemento", align: "left" },
  { key: "tipo", header: "Tipo", align: "left", width: "180px" },
  { key: "pend", header: "Pend.", align: "right", width: "90px" },
  { key: "ud", header: "UD", align: "right", width: "72px" },
  { key: "dia", header: "Ø", align: "right", width: "76px" },
  { key: "estado", header: "Estado", align: "left", width: "116px" },
];

/**
 * Siguiente id libre "t-N"/"a-N" derivado del estado actual (sin Math.random ni
 * Date; solo se invoca en handlers). Ignora los ids con otra forma.
 */
function nextId(items: { id: string }[], prefix: string): string {
  const re = new RegExp(`^${prefix}(\\d+)$`);
  let max = 0;
  for (const it of items) {
    const m = re.exec(it.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}${max + 1}`;
}

/** Valor del select fusionado tipo+disposición para un tramo. */
function tipoFilaDe(t: TramoInput): TipoFilaTramo {
  if (t.tipo === "colector") {
    return (t.disposicion ?? "enterrado") === "colgado" ? "colector_colgado" : "colector_enterrado";
  }
  return t.tipo;
}

interface RedManualProps {
  state: Hs5Estado;
  setField: <K extends keyof Hs5Estado>(field: K, value: Hs5Estado[K]) => void;
  result: HS5Result | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

export function RedManual({ state, setField, result, selectedId, onSelect, onHover }: RedManualProps): JSX.Element {
  const tramoPorId = new Map(state.tramos.map((t) => [t.id, t] as const));

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
      patchTramo(id, { tipo: "colector", disposicion: v === "colector_colgado" ? "colgado" : "enterrado" });
    } else {
      patchTramo(id, { tipo: v as TipoTramo });
    }
  };

  /**
   * Enter / "+ Añadir tramo". Referencia = fila desde la que se añade:
   *  - tramo → nuevo tramo HERMANO justo después (mismo padre; si la
   *    referencia es una raíz, el nuevo cuelga de ella para no crear multi-raíz);
   *  - aparato → nuevo aparato en el mismo tramo, justo después;
   *  - null → nuevo ramal colgando de la primera bajante (o de la raíz).
   */
  const handleAdd = (afterId: string | null) => {
    const refAparato = afterId ? state.aparatos.find((a) => a.id === afterId) : undefined;
    if (refAparato) {
      const nuevo: AparatoInput = { id: nextId(state.aparatos, "a"), tipo: "lavabo", tramoId: refAparato.tramoId };
      const i = state.aparatos.findIndex((a) => a.id === refAparato.id);
      setField("aparatos", [...state.aparatos.slice(0, i + 1), nuevo, ...state.aparatos.slice(i + 1)]);
      onSelect(nuevo.id);
      return;
    }
    const refTramo = afterId ? tramoPorId.get(afterId) : undefined;
    const parentId = refTramo
      ? (refTramo.parentId ?? refTramo.id)
      : (state.tramos.find((t) => t.tipo === "bajante")?.id ??
        state.tramos.find((t) => t.parentId === null)?.id ??
        null);
    const nuevo: TramoInput = { id: nextId(state.tramos, "t"), tipo: "ramal", parentId, pendiente_pct: 2 };
    const i = refTramo ? state.tramos.findIndex((t) => t.id === refTramo.id) : -1;
    setField(
      "tramos",
      i >= 0 ? [...state.tramos.slice(0, i + 1), nuevo, ...state.tramos.slice(i + 1)] : [...state.tramos, nuevo],
    );
    onSelect(nuevo.id);
  };

  /** Tab: colgar del hermano ANTERIOR (mismo padre). Sin hermano anterior, no-op. */
  const handleNest = (id: string) => {
    const t = tramoPorId.get(id);
    if (!t) return;
    const hermanos = state.tramos.filter((x) => x.parentId === t.parentId && x.id !== id);
    const idx = state.tramos.findIndex((x) => x.id === id);
    const anterior = [...hermanos].reverse().find((x) => state.tramos.findIndex((y) => y.id === x.id) < idx);
    if (anterior) patchTramo(id, { parentId: anterior.id });
  };

  /** Shift-Tab: subir al abuelo. En una raíz, no-op. */
  const handleUnnest = (id: string) => {
    const t = tramoPorId.get(id);
    if (!t || t.parentId === null) return;
    const padre = tramoPorId.get(t.parentId);
    patchTramo(id, { parentId: padre?.parentId ?? null });
  };

  /** Borrado: un tramo pasa sus hijos y aparatos a su PADRE; un aparato se borra sin más. */
  const handleRemove = (id: string) => {
    const t = tramoPorId.get(id);
    if (t) {
      if (state.tramos.length <= 1) return;
      const nuevoPadre = t.parentId;
      setField(
        "tramos",
        state.tramos.filter((x) => x.id !== id).map((x) => (x.parentId === id ? { ...x, parentId: nuevoPadre } : x)),
      );
      if (nuevoPadre !== null && state.aparatos.some((a) => a.tramoId === id)) {
        setField(
          "aparatos",
          state.aparatos.map((a) => (a.tramoId === id ? { ...a, tramoId: nuevoPadre } : a)),
        );
      }
    } else {
      if (state.aparatos.length <= 1) return;
      setField(
        "aparatos",
        state.aparatos.filter((a) => a.id !== id),
      );
    }
    if (selectedId === id) onSelect(null);
  };

  /** Preset: un ramal nuevo con el nombre del cuarto y sus aparatos. */
  const aplicarPreset = (p: PresetAparatos) => {
    const idRamal = nextId(state.tramos, "t");
    const parentId =
      state.tramos.find((t) => t.tipo === "bajante")?.id ?? state.tramos.find((t) => t.parentId === null)?.id ?? null;
    setField("tramos", [
      ...state.tramos,
      { id: idRamal, nombre: `Ramal ${p.label.toLowerCase()}`, tipo: "ramal", parentId, pendiente_pct: 2 },
    ]);
    const nuevos: AparatoInput[] = [];
    for (const { tipo } of p.hs5) {
      nuevos.push({ id: nextId([...state.aparatos, ...nuevos], "a"), tipo, tramoId: idRamal });
    }
    setField("aparatos", [...state.aparatos, ...nuevos]);
    onSelect(idRamal);
  };

  // ── Proyección estado+resultado → filas del outliner ───────────────────────
  // DFS desde las raíces en orden estable: fila del tramo, sus aparatos, sus
  // tramos hijos. Tramos en ciclo y aparatos huérfanos van al final.
  const resultadoTramo = new Map((result?.porTramo ?? []).map((r) => [r.id, r] as const));
  const resultadoAparato = new Map((result?.porAparato ?? []).map((r) => [r.id, r] as const));

  const filaTramo = (t: TramoInput, depth: number): OutlinerFila => {
    const r = resultadoTramo.get(t.id);
    const celdas: OutlinerCelda[] = [
      { tipo: "nombre", valor: t.nombre ?? t.id, onChange: (v) => patchTramo(t.id, { nombre: v }) },
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
      { tipo: "texto", valor: r?.diametro_mm != null ? `Ø${fmt(r.diametro_mm, undefined, 0)}` : "—", mono: true },
      r ? { tipo: "estado", veredicto: r.estado } : { tipo: "texto", valor: "—", dim: true },
    ];
    return { id: t.id, depth, kind: "tramo", anidable: true, borrable: state.tramos.length > 1, celdas };
  };

  const filaAparato = (a: AparatoInput, depth: number): OutlinerFila => {
    const r = resultadoAparato.get(a.id);
    const celdas: OutlinerCelda[] = [
      { tipo: "nombre", valor: a.nombre ?? a.id, onChange: (v) => patchAparato(a.id, { nombre: v }) },
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
        valor: r?.diametroMin_mm != null ? `Ø${fmt(r.diametroMin_mm, undefined, 0)}` : "—",
        mono: true,
      },
      r ? { tipo: "estado", veredicto: r.estado } : { tipo: "texto", valor: "—", dim: true },
    ];
    return { id: a.id, depth, kind: "aparato", anidable: false, borrable: state.aparatos.length > 1, celdas };
  };

  const filas: OutlinerFila[] = [];
  {
    const visto = new Set<string>();
    const empujar = (t: TramoInput, depth: number) => {
      if (visto.has(t.id)) return;
      visto.add(t.id);
      filas.push(filaTramo(t, depth));
      for (const a of state.aparatos.filter((a) => a.tramoId === t.id)) filas.push(filaAparato(a, depth + 1));
      for (const h of state.tramos.filter((x) => x.parentId === t.id)) empujar(h, depth + 1);
    };
    const raices = state.tramos.filter((t) => t.parentId === null || !tramoPorId.has(t.parentId));
    for (const r of raices) empujar(r, 0);
    for (const t of state.tramos) if (!visto.has(t.id)) empujar(t, 0);
    for (const a of state.aparatos.filter((a) => !tramoPorId.has(a.tramoId))) filas.push(filaAparato(a, 0));
  }

  return (
    <Outliner
      columnas={COLUMNAS_HS5}
      filas={filas}
      selectedId={selectedId}
      onSelect={onSelect}
      onHover={onHover}
      onAdd={handleAdd}
      onNest={handleNest}
      onUnnest={handleUnnest}
      onRemove={handleRemove}
      etiquetaAdd="+ Añadir tramo"
      toolbar={
        <div className="flex items-center gap-1.5">
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
}
