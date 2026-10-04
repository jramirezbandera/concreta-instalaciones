// DB-HS4 — «Ajustar a mano» (feature-15, decisión 1 de REDISENO-V4 §7): el
// OUTLINER de tramos y aparatos de siempre, ahora fuera del camino principal.
// Se abre sobre la red generada desde El edificio y, desde ese momento, manda
// la tabla.
//
// La semántica del árbol vive AQUÍ (el outliner es agnóstico): anidar = colgar
// del hermano anterior; desanidar = subir al abuelo — por construcción no se
// pueden crear ciclos. Al borrar un tramo, sus hijos y aparatos pasan a su padre.
//
// React 19 + React Compiler: componente PURO. Los ids se generan de forma
// DETERMINISTA en los handlers (nunca en render), derivando un contador del
// estado actual. Las mutaciones de las listas son siempre INMUTABLES.

import type { JSX } from "react";
import { Outliner } from "../../components/outliner/Outliner";
import type { OutlinerCelda, OutlinerColumna, OutlinerFila } from "../../components/outliner/tipos";
import { PRESETS_APARATOS, type PresetAparatos } from "../../data/presetsAparatos";
import { fmt } from "../../lib/units/format";
import type { AparatoInputHS4, CriterioK, HS4Result, TipoTramoHS4, TramoInputHS4 } from "./calc";
import type { Hs4Estado } from "./estado";
import type { MaterialTuberia, TipoAparatoHS4 } from "./tablas";

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
  { value: "termoplastico_multicapa", label: "Plástica (0,5–3,5 m/s)" },
];

// «auto» = derivada del tipo (undefined en el motor); el resto fuerza el flag.
const PRESION_MIN_OPTIONS: { value: string; label: string }[] = [
  { value: "auto", label: "Auto (según tipo)" },
  { value: "grifo", label: "Grifo común (100 kPa)" },
  { value: "fluxor", label: "Fluxor/calent. (150 kPa)" },
];

const CRITERIO_K_OPTIONS: { value: CriterioK; label: string }[] = [
  { value: "une149201", label: "K = 1/√(n−1)" },
  { value: "sin_simultaneidad", label: "Sin simultaneidad" },
];

const COLUMNAS: OutlinerColumna[] = [
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

interface RedManualProps {
  state: Hs4Estado;
  setField: <K extends keyof Hs4Estado>(field: K, value: Hs4Estado[K]) => void;
  result: HS4Result | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onHover: (id: string | null) => void;
}

export function RedManualHs4({ state, setField, result, selectedId, onSelect, onHover }: RedManualProps): JSX.Element {
  const tramoPorId = new Map(state.tramos.map((t) => [t.id, t] as const));

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

  const handleAdd = (afterId: string | null) => {
    const refAparato = afterId ? state.aparatos.find((a) => a.id === afterId) : undefined;
    if (refAparato) {
      const nuevo: AparatoInputHS4 = { id: nextId(state.aparatos, "a"), tipo: "lavabo", tramoId: refAparato.tramoId };
      const i = state.aparatos.findIndex((a) => a.id === refAparato.id);
      setField("aparatos", [...state.aparatos.slice(0, i + 1), nuevo, ...state.aparatos.slice(i + 1)]);
      onSelect(nuevo.id);
      return;
    }
    const refTramo = afterId ? tramoPorId.get(afterId) : undefined;
    const parentId = refTramo
      ? (refTramo.parentId ?? refTramo.id)
      : (state.tramos.find((t) => t.tipo === "columna_montante")?.id ??
        state.tramos.find((t) => t.parentId === null)?.id ??
        null);
    const nuevo: TramoInputHS4 = {
      id: nextId(state.tramos, "t"),
      tipo: refTramo?.tipo ?? "derivacion_particular",
      parentId,
      material: refTramo?.material ?? "termoplastico_multicapa",
      longitud_m: 1.5,
      altura_m: 0,
    };
    const i = refTramo ? state.tramos.findIndex((t) => t.id === refTramo.id) : -1;
    setField(
      "tramos",
      i >= 0 ? [...state.tramos.slice(0, i + 1), nuevo, ...state.tramos.slice(i + 1)] : [...state.tramos, nuevo],
    );
    onSelect(nuevo.id);
  };

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

  const handleUnnest = (id: string) => {
    const t = tramoPorId.get(id);
    if (!t || t.parentId === null) return;
    const padre = tramoPorId.get(t.parentId);
    patchTramo(id, { parentId: padre?.parentId ?? null });
  };

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

  /** Un cuarto: una derivación particular y una derivación por aparato, con sus aparatos. */
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
      nuevosAparatos.push({ id: nextId([...state.aparatos, ...nuevosAparatos], "a"), tipo, tramoId: idTramo });
    }
    setField("tramos", [...state.tramos, ...nuevosTramos]);
    setField("aparatos", [...state.aparatos, ...nuevosAparatos]);
    onSelect(idDeriv);
  };

  // ── Proyección estado + resultado → filas ─────────────────────────────────
  const resultadoTramo = new Map((result?.porTramo ?? []).map((r) => [r.id, r] as const));
  const resultadoAparato = new Map((result?.porAparato ?? []).map((r) => [r.id, r] as const));

  const filaTramo = (t: TramoInputHS4, depth: number): OutlinerFila => {
    const r = resultadoTramo.get(t.id);
    const marcas = r
      ? [
          r.esCritico ? "◆ crítico" : null,
          r.velocidadFueraDeRango ? "v fuera de intervalo" : null,
          r.diametroFueraDeSerie ? "Ø fuera de serie" : null,
        ].filter((m): m is string => m !== null)
      : [];
    const celdas: OutlinerCelda[] = [
      { tipo: "nombre", valor: t.nombre ?? t.id, onChange: (v) => patchTramo(t.id, { nombre: v }) },
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
      { tipo: "numero", valor: t.altura_m ?? 0, onChange: (v) => patchTramo(t.id, { altura_m: v }), step: 0.5, unidad: "m" },
      { tipo: "texto", valor: r ? fmt(r.caudalCalculo_dm3_s, undefined, 2) : "—", mono: true },
      { tipo: "texto", valor: r?.diametro_mm != null ? `Ø${fmt(r.diametro_mm, undefined, 0)}` : "—", mono: true },
      { tipo: "texto", valor: r?.velocidad_m_s != null ? fmt(r.velocidad_m_s, undefined, 2) : "—", mono: true },
      { tipo: "texto", valor: r ? fmt(r.presionResidual_kPa, undefined, 0) : "—", mono: true },
      r
        ? { tipo: "estado", veredicto: r.estado, extra: marcas.join(" · ") || undefined }
        : { tipo: "texto", valor: "—", dim: true },
    ];
    return { id: t.id, depth, kind: "tramo", anidable: true, borrable: state.tramos.length > 1, celdas };
  };

  const filaAparato = (a: AparatoInputHS4, depth: number): OutlinerFila => {
    const r = resultadoAparato.get(a.id);
    const modoPresion = a.esFluxorOCalentador === undefined ? "auto" : a.esFluxorOCalentador ? "fluxor" : "grifo";
    const celdas: OutlinerCelda[] = [
      { tipo: "nombre", valor: a.nombre ?? a.id, onChange: (v) => patchAparato(a.id, { nombre: v }) },
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
        onChange: (v) => patchAparato(a.id, { esFluxorOCalentador: v === "auto" ? undefined : v === "fluxor" }),
      },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: r ? fmt(r.caudalInstantaneo_dm3_s, undefined, 2) : "—", mono: true },
      {
        tipo: "texto",
        valor: r?.diametroMinDerivacion_mm != null ? `Ø${fmt(r.diametroMinDerivacion_mm, undefined, 0)}` : "—",
        mono: true,
      },
      { tipo: "texto", valor: "", dim: true },
      { tipo: "texto", valor: r ? fmt(r.presionResidual_kPa, undefined, 0) : "—", mono: true },
      r ? { tipo: "estado", veredicto: r.estado } : { tipo: "texto", valor: "—", dim: true },
    ];
    return { id: a.id, depth, kind: "aparato", anidable: false, borrable: state.aparatos.length > 1, celdas };
  };

  const filas: OutlinerFila[] = [];
  {
    const visto = new Set<string>();
    const empujar = (t: TramoInputHS4, depth: number) => {
      if (visto.has(t.id)) return;
      visto.add(t.id);
      filas.push(filaTramo(t, depth));
      for (const a of state.aparatos.filter((x) => x.tramoId === t.id)) filas.push(filaAparato(a, depth + 1));
      for (const h of state.tramos.filter((x) => x.parentId === t.id)) empujar(h, depth + 1);
    };
    const raices = state.tramos.filter((t) => t.parentId === null || !tramoPorId.has(t.parentId));
    for (const r of raices) empujar(r, 0);
    for (const t of state.tramos) if (!visto.has(t.id)) empujar(t, 0);
    for (const a of state.aparatos.filter((x) => !tramoPorId.has(x.tramoId))) filas.push(filaAparato(a, 0));
  }

  const fraccionPct = Math.round((state.fraccionPerdidasLocalizadas ?? 0.25) * 100);

  return (
    <div className="overflow-x-auto">
      <Outliner
        columnas={COLUMNAS}
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
          <div className="flex flex-wrap items-center gap-1.5">
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
            <label className="text-text-secondary ml-2 flex items-center gap-1 text-[11px]">
              Simultaneidad
              <select
                value={state.criterioK}
                onChange={(e) => setField("criterioK", e.target.value as CriterioK)}
                className="border-border-main bg-bg-primary rounded border px-1 py-0.5 text-[11px]"
              >
                {CRITERIO_K_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-text-secondary flex items-center gap-1 text-[11px]">
              Localizadas
              <input
                type="number"
                min={20}
                max={30}
                step={1}
                value={fraccionPct}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (Number.isFinite(v)) setField("fraccionPerdidasLocalizadas", v / 100);
                }}
                className="border-border-main bg-bg-primary w-12 rounded border px-1 py-0.5 text-right text-[11px]"
              />
              %
            </label>
          </div>
        }
      />
    </div>
  );
}
