// DB-HS5 — Pantalla del módulo de saneamiento (evacuación de aguas). Cablea el
// motor (./calc), el render SVG (./svg) y la ficha PDF (./ficha) sobre el layout
// compartido (Topbar + panel de inputs + panel de resultados), replicando el
// patrón del módulo HS3 pero con un EDITOR DE ÁRBOL DE RED explícito: tramos
// (ramal → bajante → colector) y aparatos colgando de tramos.
//
// React 19 + React Compiler: componente PURO. El cálculo es síncrono en render
// (useMemo sobre el estado diferido); no hay efectos de cálculo. Los ids de
// tramos/aparatos se generan de forma DETERMINISTA en los handlers de evento
// (nunca en render, nunca con Math.random/Date), derivando un contador del
// estado actual. Las mutaciones de las listas son siempre INMUTABLES.

import { useDeferredValue, useMemo, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { useModuleState } from "../../hooks/useModuleState";
import { useContainerWidth } from "../../hooks/useContainerWidth";
import { usePdfPreview } from "../../hooks/usePdfPreview";
import { useDrawer } from "../../components/layout/AppShell";
import { Topbar } from "../../components/layout/Topbar";
import { PdfPreviewModal } from "../../components/ui/PdfPreviewModal";
import { MobileTabBar, type MobileTab } from "../../components/ui/MobileTabBar";
import { CollapsibleSection } from "../../components/ui/CollapsibleSection";
import { Field, NumberInput, SelectInput, InputLabel } from "../../components/ui/InputLabel";
import { showToast } from "../../components/ui/Toast";
import { renderFicha } from "../../lib/pdf/renderFicha";
import { STATUS_LABEL } from "../../lib/pdf/utils";
import { STATE_TEXT, STATE_TINT } from "../../lib/ui/veredicto";
import { fmt } from "../../lib/units/format";
import {
  calcHS5,
  hs5Defaults,
  type AparatoInput,
  type DisposicionColector,
  type HS5Inputs,
  type HS5Result,
  type TipoTramo,
  type TramoInput,
} from "./calc";
import type { TipoAparato, UsoAparato } from "./tablas";
import { HS5SVG } from "./svg";
import { HS5_PDF_SVG_ID } from "./svg-meta";
import { toFichaData } from "./ficha";

// -----------------------------------------------------------------------------
// Opciones de los selects (declaradas a módulo: estables entre renders).
// -----------------------------------------------------------------------------
const USO_OPTIONS: { value: UsoAparato; label: string }[] = [
  { value: "privado", label: "Privado (vivienda)" },
  { value: "publico", label: "Público (no residencial)" },
];

const CUBIERTA_OPTIONS: { value: "transitable" | "no_transitable"; label: string }[] = [
  { value: "no_transitable", label: "No transitable" },
  { value: "transitable", label: "Transitable" },
];

const TIPO_TRAMO_OPTIONS: { value: TipoTramo; label: string }[] = [
  { value: "ramal", label: "Ramal colector" },
  { value: "bajante", label: "Bajante" },
  { value: "colector", label: "Colector horizontal" },
];

const DISPOSICION_OPTIONS: { value: DisposicionColector; label: string }[] = [
  { value: "colgado", label: "Colgado" },
  { value: "enterrado", label: "Enterrado" },
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

const TIPO_APARATO_LABEL: Record<TipoAparato, string> = Object.fromEntries(
  TIPO_APARATO_OPTIONS.map((o) => [o.value, o.label]),
) as Record<TipoAparato, string>;

const TIPO_TRAMO_LABEL: Record<TipoTramo, string> = {
  ramal: "Ramal colector",
  bajante: "Bajante",
  colector: "Colector horizontal",
};

const ESTADO_LABEL: Record<string, string> = {
  ok: "Cumple",
  warn: "Aviso",
  fail: "No cumple",
  neutral: "Informativo",
};

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

export function Hs5Module() {
  const { state, setField, reset } = useModuleState<HS5Inputs>("hs5", hs5Defaults);
  const { openDrawer } = useDrawer();
  const [tab, setTab] = useState<MobileTab>("inputs");

  const deferredState = useDeferredValue(state);
  const result = useMemo(() => calcHS5(deferredState), [deferredState]);

  // ── Validación de entrada ──────────────────────────────────────────────────
  // numPlantas entero ≥ 1; al menos un tramo y un aparato; todos los aparatos
  // cuelgan de un tramo existente; árbol válido (el motor marca arbolValido).
  const tramoIds = new Set(state.tramos.map((t) => t.id));
  const valid =
    Number.isInteger(state.numPlantas) &&
    state.numPlantas >= 1 &&
    state.tramos.length >= 1 &&
    state.aparatos.length >= 1 &&
    state.aparatos.every((a) => tramoIds.has(a.tramoId)) &&
    result.arbolValido;

  const { pdfExporting, pdfPreview, handleExportPdf, handleDownloadPdf, closePdfPreview } =
    usePdfPreview(() => renderFicha(toFichaData(deferredState, result)), valid);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Enlace copiado al portapapeles", { autoDismiss: 2500 });
    } catch {
      showToast("No se pudo copiar el enlace", { autoDismiss: 3000 });
    }
  };

  // ── Mutaciones inmutables de la lista de tramos ────────────────────────────
  const addTramo = () => {
    const nuevo: TramoInput = {
      id: nextId(state.tramos, "t"),
      tipo: "ramal",
      parentId: state.tramos.length > 0 ? state.tramos[state.tramos.length - 1].id : null,
      pendiente_pct: 2,
    };
    setField("tramos", [...state.tramos, nuevo]);
  };

  const removeTramo = (id: string) => {
    // Al eliminar un tramo, los hijos que colgaban de él pasan a raíz (parentId
    // null) y los aparatos que descargaban en él quedan sin tramo (el motor lo
    // marcará); se mantiene el resto del árbol coherente sin mutaciones in situ.
    setField(
      "tramos",
      state.tramos
        .filter((t) => t.id !== id)
        .map((t) => (t.parentId === id ? { ...t, parentId: null } : t)),
    );
  };

  const patchTramo = (id: string, patch: Partial<TramoInput>) => {
    setField(
      "tramos",
      state.tramos.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  };

  // ── Mutaciones inmutables de la lista de aparatos ──────────────────────────
  const addAparato = () => {
    const nuevo: AparatoInput = {
      id: nextId(state.aparatos, "a"),
      tipo: "lavabo",
      tramoId: state.tramos.length > 0 ? state.tramos[0].id : "",
    };
    setField("aparatos", [...state.aparatos, nuevo]);
  };

  const removeAparato = (id: string) => {
    setField(
      "aparatos",
      state.aparatos.filter((a) => a.id !== id),
    );
  };

  const patchAparato = (id: string, patch: Partial<AparatoInput>) => {
    setField(
      "aparatos",
      state.aparatos.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    );
  };

  const [canvasRef, canvasWidth] = useContainerWidth();
  const svgW =
    canvasWidth !== undefined && canvasWidth > 0
      ? Math.min(640, Math.max(280, canvasWidth - 32))
      : 480;
  const svgH = Math.round(svgW * 0.6);

  const cubiertaValue: "transitable" | "no_transitable" = state.cubiertaTransitable
    ? "transitable"
    : "no_transitable";

  const dBajante = diametroDe(result, "bajante");
  const dColector = diametroDe(result, "colector");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Topbar
        moduleLabel="HS5 Saneamiento"
        moduleGroup="Salubridad (DB-HS) · evacuación de aguas"
        onExportPdf={handleExportPdf}
        pdfExporting={pdfExporting}
        onShare={handleShare}
        onReset={reset}
        onMenuOpen={openDrawer}
      />
      <MobileTabBar tab={tab} setTab={setTab} />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: inputs */}
        <div
          className={[
            "bg-bg-surface flex min-h-0 flex-col overflow-hidden",
            "lg:border-border-main lg:w-80 lg:shrink-0 lg:border-r",
            tab === "inputs" ? "max-lg:flex-1" : "max-lg:hidden",
            "lg:flex",
          ].join(" ")}
        >
          <div className="scroll-hide flex-1 overflow-y-auto px-4 py-3">
            <CollapsibleSection label="Edificio" refNorma="DB-HS5 ap. 4.1">
              <Field
                id="num-plantas"
                label="Plantas"
                sub="nº"
                help="Número de plantas servidas por las bajantes. Fija la columna de la Tabla 4.4 (hasta 3 / más de 3) y dispara la ventilación secundaria/terciaria de red."
                refText="DB-HS5 Tabla 4.4"
              >
                <NumberInput
                  id="num-plantas"
                  value={state.numPlantas}
                  onChange={(v) => setField("numPlantas", v)}
                  min={1}
                  step={1}
                />
              </Field>
              <Field
                id="cubierta"
                label="Cubierta"
                help="Tipo de cubierta. Afecta a la prolongación mínima de la ventilación primaria por encima de la cubierta (transitable exige mayor altura)."
                refText="DB-HS5 ventilación primaria"
              >
                <SelectInput<"transitable" | "no_transitable">
                  id="cubierta"
                  value={cubiertaValue}
                  options={CUBIERTA_OPTIONS}
                  onChange={(v) => setField("cubiertaTransitable", v === "transitable")}
                />
              </Field>
              <Field
                id="uso"
                label="Uso"
                help="Uso de la instalación: privado (vivienda) o público (no residencial). Selecciona la columna de UD y Ø mínimo de la Tabla 4.1."
                refText="DB-HS5 Tabla 4.1"
              >
                <SelectInput<UsoAparato>
                  id="uso"
                  value={state.uso}
                  options={USO_OPTIONS}
                  onChange={(v) => setField("uso", v)}
                />
              </Field>
            </CollapsibleSection>

            <CollapsibleSection label="Tramos de la red" refNorma="DB-HS5 Tablas 4.3–4.5">
              <div className="flex flex-col gap-2.5">
                {state.tramos.map((t) => (
                  <TramoRow
                    key={t.id}
                    tramo={t}
                    tramos={state.tramos}
                    onPatch={(patch) => patchTramo(t.id, patch)}
                    onRemove={() => removeTramo(t.id)}
                    canRemove={state.tramos.length > 1}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={addTramo}
                className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed py-2 text-[13px] transition-colors"
              >
                <Plus size={14} />
                Añadir tramo
              </button>
            </CollapsibleSection>

            <CollapsibleSection label="Aparatos sanitarios" refNorma="DB-HS5 Tabla 4.1">
              <div className="flex flex-col gap-2.5">
                {state.aparatos.map((a) => (
                  <AparatoRow
                    key={a.id}
                    aparato={a}
                    tramos={state.tramos}
                    onPatch={(patch) => patchAparato(a.id, patch)}
                    onRemove={() => removeAparato(a.id)}
                    canRemove={state.aparatos.length > 1}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={addAparato}
                className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed py-2 text-[13px] transition-colors"
              >
                <Plus size={14} />
                Añadir aparato
              </button>
            </CollapsibleSection>
          </div>
        </div>

        {/* Right: SVG + results. En lg se apila junto (banner → lienzo → tablas);
            en móvil se reparte por pestaña: "diagramas" = solo el lienzo,
            "results" = veredicto + tablas. Cada bloque se gatea por separado
            manteniendo intacto el orden y el layout en lg (lg:flex / lg:block). */}
        <div
          className={[
            "scroll-hide flex min-w-0 flex-col overflow-y-auto",
            "lg:flex-1",
            tab === "results" || tab === "diagramas" ? "flex-1" : "hidden",
            "lg:flex",
          ].join(" ")}
        >
          {/* Verdict banner (parte del resultado: tab "results" en móvil). */}
          <div
            className={[
              `border-b px-6 py-2.5 ${STATE_TINT[result.veredictoGlobal]}`,
              tab === "results" ? "block" : "hidden",
              "lg:block",
            ].join(" ")}
          >
            <span className="text-text-secondary text-[13px]">
              Red de evacuación ({result.uso === "privado" ? "uso privado" : "uso público"}) —{" "}
              <span className={`font-semibold ${STATE_TEXT[result.veredictoGlobal]}`}>
                {STATUS_LABEL[result.veredictoGlobal]}
              </span>{" "}
              <span className="text-text-disabled">
                ({fmt(result.udTotales, "UD")} totales · bajante{" "}
                {dBajante == null ? "Ø —" : `Ø${fmt(dBajante, "mm", 0)}`} · colector{" "}
                {dColector == null ? "Ø —" : `Ø${fmt(dColector, "mm", 0)}`})
              </span>
            </span>
          </div>

          {/* Lienzo del diagrama (tab "diagramas" en móvil; siempre en lg). */}
          <div
            ref={canvasRef}
            className={[
              "border-border-main canvas-dot-grid items-center justify-center border-b px-4 py-6",
              tab === "diagramas" ? "flex" : "hidden",
              "lg:flex",
            ].join(" ")}
          >
            <HS5SVG result={result} mode="screen" width={svgW} height={svgH} />
          </div>

          {/* Tablas/resultados (tab "results" en móvil; siempre en lg). */}
          <div
            className={[
              "px-6 py-4",
              tab === "results" ? "block" : "hidden",
              "lg:block",
            ].join(" ")}
          >
            <ResultsTable result={result} />
          </div>
        </div>
      </div>

      {/* Clon oculto del SVG para el raster del PDF (mismo id que busca renderFicha). */}
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div id={HS5_PDF_SVG_ID} style={{ position: "absolute", left: "-9999px", top: 0 }}>
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
    </div>
  );
}

/** Ø del mayor tramo de un tipo (mm) o `null` si no hay / no dimensiona. */
function diametroDe(result: HS5Result, tipo: TipoTramo): number | null {
  const ds = result.porTramo
    .filter((t) => t.tipo === tipo && t.diametro_mm != null)
    .map((t) => t.diametro_mm as number);
  return ds.length ? Math.max(...ds) : null;
}

// -----------------------------------------------------------------------------
// Fila editable de un TRAMO de la red (lista dinámica). Selector de tipo, de
// padre ("cuelga de" — entre los OTROS tramos + opción raíz, nunca a sí mismo
// para evitar el ciclo trivial; el motor valida el resto) y, según el tipo, la
// pendiente (ramal/colector) y la disposición (colector).
// -----------------------------------------------------------------------------
function TramoRow({
  tramo,
  tramos,
  onPatch,
  onRemove,
  canRemove,
}: {
  tramo: TramoInput;
  tramos: TramoInput[];
  onPatch: (patch: Partial<TramoInput>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  // Padres ofertados = todos los tramos menos el propio (impide el ciclo
  // trivial). El selector usa "" como sentinela de "— (raíz)" (parentId null).
  const parentOptions: { value: string; label: string }[] = [
    { value: "", label: "— (raíz / acometida)" },
    ...tramos
      .filter((t) => t.id !== tramo.id)
      .map((t) => ({ value: t.id, label: `${TIPO_TRAMO_LABEL[t.tipo]} · ${t.id}` })),
  ];

  const muestraPendiente = tramo.tipo === "ramal" || tramo.tipo === "colector";
  const esColector = tramo.tipo === "colector";

  return (
    <div className="border-border-sub bg-bg-primary rounded-md border p-2.5">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SelectInput<TipoTramo>
            id={`tipo-tramo-${tramo.id}`}
            value={tramo.tipo}
            options={TIPO_TRAMO_OPTIONS}
            onChange={(v) => onPatch({ tipo: v })}
          />
        </div>
        <span className="text-text-disabled shrink-0 font-mono text-[11px]">{tramo.id}</span>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Quitar tramo"
          title={canRemove ? "Quitar tramo" : "Debe haber al menos un tramo"}
          className="text-text-disabled hover:text-state-fail shrink-0 rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <InputLabel htmlFor={`parent-${tramo.id}`} label="Cuelga de" />
        <div className="w-40 shrink-0">
          <SelectInput<string>
            id={`parent-${tramo.id}`}
            value={tramo.parentId ?? ""}
            options={parentOptions}
            onChange={(v) => onPatch({ parentId: v === "" ? null : v })}
          />
        </div>
      </div>

      {muestraPendiente && (
        <div className="mt-2 flex items-center justify-between gap-3">
          <InputLabel htmlFor={`pendiente-${tramo.id}`} label="Pendiente" sub="i" />
          <div className="flex w-32 shrink-0 items-center gap-1.5">
            <div className="flex-1">
              <NumberInput
                id={`pendiente-${tramo.id}`}
                value={tramo.pendiente_pct ?? 2}
                onChange={(v) => onPatch({ pendiente_pct: v })}
                min={0}
                step={0.5}
              />
            </div>
            <span className="text-text-disabled w-8 shrink-0 text-[11px]">%</span>
          </div>
        </div>
      )}

      {esColector && (
        <div className="mt-2 flex items-center justify-between gap-3">
          <InputLabel htmlFor={`disposicion-${tramo.id}`} label="Disposición" />
          <div className="w-40 shrink-0">
            <SelectInput<DisposicionColector>
              id={`disposicion-${tramo.id}`}
              value={tramo.disposicion ?? "enterrado"}
              options={DISPOSICION_OPTIONS}
              onChange={(v) => onPatch({ disposicion: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Fila editable de un APARATO sanitario (lista dinámica). Tipo de aparato (los
// TipoAparato reales del motor) y el tramo al que descarga (entre los tramos
// existentes).
// -----------------------------------------------------------------------------
function AparatoRow({
  aparato,
  tramos,
  onPatch,
  onRemove,
  canRemove,
}: {
  aparato: AparatoInput;
  tramos: TramoInput[];
  onPatch: (patch: Partial<AparatoInput>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const tramoOptions: { value: string; label: string }[] = tramos.map((t) => ({
    value: t.id,
    label: `${TIPO_TRAMO_LABEL[t.tipo]} · ${t.id}`,
  }));

  return (
    <div className="border-border-sub bg-bg-primary rounded-md border p-2.5">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SelectInput<TipoAparato>
            id={`tipo-aparato-${aparato.id}`}
            value={aparato.tipo}
            options={TIPO_APARATO_OPTIONS}
            onChange={(v) => onPatch({ tipo: v })}
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Quitar aparato"
          title={canRemove ? "Quitar aparato" : "Debe haber al menos un aparato"}
          className="text-text-disabled hover:text-state-fail shrink-0 rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <InputLabel htmlFor={`tramo-aparato-${aparato.id}`} label="Descarga a" />
        <div className="w-40 shrink-0">
          {tramoOptions.length > 0 ? (
            <SelectInput<string>
              id={`tramo-aparato-${aparato.id}`}
              value={aparato.tramoId}
              options={tramoOptions}
              onChange={(v) => onPatch({ tramoId: v })}
            />
          ) : (
            <span className="text-state-warn text-[11px]">Sin tramos disponibles</span>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Tabla de resultados ACCESIBLE (WCAG: el dato numérico SIEMPRE en texto/tabla,
// no solo en el SVG). Por tramo: tipo · Ø resultante · UD acumuladas · pendiente
// · estado. Después, las filas de ventilación de red (resultado NEUTRAL: no
// degrada el veredicto global).
// -----------------------------------------------------------------------------
function ResultsTable({ result }: { result: HS5Result }) {
  const v = result.ventilacion;
  return (
    <div className="max-w-2xl">
      {!result.arbolValido && (
        <div className="text-state-fail mb-3 text-[12px] font-semibold">
          La red de tramos no es un árbol válido (hay un ciclo o un padre
          inexistente): corrige las conexiones «cuelga de».
        </div>
      )}

      <div className="text-text-disabled mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
        Dimensionado por tramo
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-text-disabled border-border-sub border-b text-left text-[11px] uppercase">
            <th scope="col" className="py-1.5 font-medium">Tramo</th>
            <th scope="col" className="py-1.5 text-right font-medium">Ø</th>
            <th scope="col" className="py-1.5 text-right font-medium">UD acum.</th>
            <th scope="col" className="py-1.5 text-right font-medium">Pendiente</th>
            <th scope="col" className="py-1.5 text-right font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {result.porTramo.map((t) => (
            <tr key={t.id} className="border-border-sub border-b">
              <td className="text-text-secondary py-1.5">
                {TIPO_TRAMO_LABEL[t.tipo]}{" "}
                <span className="text-text-disabled font-mono text-[11px]">({t.id})</span>
              </td>
              <td className="text-text-primary py-1.5 text-right tabular-nums">
                {t.diametro_mm == null ? "—" : `Ø${fmt(t.diametro_mm, "mm", 0)}`}
              </td>
              <td className="text-text-secondary py-1.5 text-right tabular-nums">
                {fmt(t.udAcumuladas, "UD")}
              </td>
              <td className="text-text-secondary py-1.5 text-right tabular-nums">
                {t.tipo === "bajante" ? "—" : fmt(t.pendiente_pct, "%")}
              </td>
              <td className={`py-1.5 text-right font-semibold ${STATE_TEXT[t.estado]}`}>
                {ESTADO_LABEL[t.estado]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-text-disabled mt-5 mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
        Verificación por aparato
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-text-disabled border-border-sub border-b text-left text-[11px] uppercase">
            <th scope="col" className="py-1.5 font-medium">Aparato</th>
            <th scope="col" className="py-1.5 text-right font-medium">UD</th>
            <th scope="col" className="py-1.5 text-right font-medium">Ø mín.</th>
            <th scope="col" className="py-1.5 text-right font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {result.porAparato.map((a) => (
            <tr key={a.id} className="border-border-sub border-b">
              <td className="text-text-secondary py-1.5">
                {TIPO_APARATO_LABEL[a.tipo]}{" "}
                <span className="text-text-disabled text-[11px]">
                  (→ {a.tramoId}
                  {a.agrupado ? " · agrupado" : ""})
                </span>
              </td>
              <td className="text-text-primary py-1.5 text-right tabular-nums">
                {fmt(a.ud, "UD")}
              </td>
              <td className="text-text-secondary py-1.5 text-right tabular-nums">
                {a.diametroMin_mm == null ? "—" : `Ø${fmt(a.diametroMin_mm, "mm", 0)}`}
              </td>
              <td className={`py-1.5 text-right font-semibold ${STATE_TEXT[a.estado]}`}>
                {ESTADO_LABEL[a.estado]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-text-disabled mt-5 mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
        Ventilación de red (informativa)
      </div>
      <dl className="text-[13px]">
        <SummaryRow
          k="Ventilación primaria"
          v={v.primaria.suficienteSola ? "Suficiente sola" : "Requiere secundaria"}
          sub={`≥ ${fmt(v.primaria.prolongacionMin_m, "m")} sobre cubierta`}
        />
        <SummaryRow
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
        <SummaryRow
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
        El dimensionado de la ventilación de red es un resultado informativo y no
        entra en el veredicto global ({fmt(result.udTotales, "UD")} totales).
      </p>

      {result.warnings.length > 0 && (
        <ul className="text-state-warn mt-3 list-disc space-y-1 pl-5 text-[12px]">
          {result.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SummaryRow({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="border-border-sub flex items-baseline justify-between gap-3 border-b py-1.5">
      <dt className="text-text-secondary">{k}</dt>
      <dd className="flex items-baseline gap-2">
        <span className="text-text-primary tabular-nums">{v}</span>
        {sub && <span className="text-text-disabled text-[11px]">{sub}</span>}
      </dd>
    </div>
  );
}
