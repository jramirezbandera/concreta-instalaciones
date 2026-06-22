// DB-HS4 — Pantalla del módulo de suministro de agua (fontanería). Cablea el
// motor (./calc), el render SVG (./svg) y la ficha PDF (./ficha) sobre el layout
// compartido (Topbar + panel de inputs + panel de resultados), replicando el
// patrón del módulo HS5 (editor de ÁRBOL DE RED explícito) pero sobre el modelo
// HIDRÁULICO de HS4: caudal de cálculo (×K), Ø comercial, velocidad en rango,
// pérdida de carga y presión residual; recorrido crítico resaltado.
//
// React 19 + React Compiler: componente PURO. El cálculo es síncrono en render
// (useMemo sobre el estado diferido); no hay efectos de cálculo ni botón
// "calcular" (feedback inmediato). Los ids de tramos/aparatos se generan de
// forma DETERMINISTA en los handlers de evento (nunca en render, nunca con
// Math.random/Date). Las mutaciones de las listas son siempre INMUTABLES.

import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { Trash2, Plus, Info, AlertTriangle } from "lucide-react";
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
  calcHS4,
  hs4Defaults,
  type AparatoInputHS4,
  type CriterioK,
  type HS4Inputs,
  type HS4Result,
  type TipoTramoHS4,
  type TramoInputHS4,
} from "./calc";
import { rangoVelocidad, type MaterialTuberia, type TipoAparatoHS4 } from "./tablas";
import { HS4SVG } from "./svg";
import { HS4_PDF_SVG_ID } from "./svg-meta";
import { toFichaData } from "./ficha";

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

const TIPO_APARATO_LABEL: Record<TipoAparatoHS4, string> = Object.fromEntries(
  TIPO_APARATO_OPTIONS.map((o) => [o.value, o.label]),
) as Record<TipoAparatoHS4, string>;

const TIPO_TRAMO_OPTIONS: { value: TipoTramoHS4; label: string }[] = [
  { value: "derivacion_aparato", label: "Derivación de aparato" },
  { value: "derivacion_particular", label: "Derivación particular" },
  { value: "columna_montante", label: "Columna / montante" },
  { value: "tubo_alimentacion", label: "Tubo de alimentación" },
  { value: "acometida", label: "Acometida" },
];

const TIPO_TRAMO_LABEL: Record<TipoTramoHS4, string> = {
  derivacion_aparato: "Derivación de aparato",
  derivacion_particular: "Derivación particular",
  columna_montante: "Columna / montante",
  tubo_alimentacion: "Tubo de alimentación",
  acometida: "Acometida",
};

const MATERIAL_OPTIONS: { value: MaterialTuberia; label: string }[] = [
  { value: "metalica", label: "Metálica (v 0,5–2,0 m/s)" },
  { value: "termoplastico_multicapa", label: "Termoplástico / multicapa (v 0,5–3,5 m/s)" },
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

export function Hs4Module() {
  const { state, setField, reset } = useModuleState<HS4Inputs>("hs4", hs4Defaults);
  const { openDrawer } = useDrawer();
  const [tab, setTab] = useState<MobileTab>("inputs");

  const deferredState = useDeferredValue(state);
  const result = useMemo(() => calcHS4(deferredState), [deferredState]);

  // ── Validación de entrada ──────────────────────────────────────────────────
  // presión de acometida finita y positiva; al menos un tramo y un aparato; todos
  // los aparatos cuelgan de un tramo existente; árbol válido (el motor lo marca).
  const tramoIds = new Set(state.tramos.map((t) => t.id));
  const valid =
    Number.isFinite(state.presionAcometida_kPa) &&
    state.presionAcometida_kPa > 0 &&
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

  // ── Pérdidas localizadas (fracción opcional 0..1 expuesta como % entero) ─────
  // `undefined` ⇒ el motor usa el valor medio del rango de buena práctica (25 %).
  const fraccionPct = Math.round((state.fraccionPerdidasLocalizadas ?? 0.25) * 100);

  // ── Mutaciones inmutables de la lista de tramos ────────────────────────────
  const addTramo = () => {
    const nuevo: TramoInputHS4 = {
      id: nextId(state.tramos, "t"),
      tipo: "derivacion_aparato",
      parentId: state.tramos.length > 0 ? state.tramos[state.tramos.length - 1].id : null,
      material: "termoplastico_multicapa",
      longitud_m: 1.5,
      altura_m: 0,
    };
    setField("tramos", [...state.tramos, nuevo]);
  };

  const removeTramo = (id: string) => {
    // Al eliminar un tramo, los hijos que colgaban de él pasan a raíz (parentId
    // null); los aparatos que descargaban en él quedan sin tramo (el motor lo
    // marca). Se mantiene el resto del árbol coherente sin mutaciones in situ.
    setField(
      "tramos",
      state.tramos
        .filter((t) => t.id !== id)
        .map((t) => (t.parentId === id ? { ...t, parentId: null } : t)),
    );
  };

  const patchTramo = (id: string, patch: Partial<TramoInputHS4>) => {
    setField(
      "tramos",
      state.tramos.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  };

  // ── Mutaciones inmutables de la lista de aparatos ──────────────────────────
  const addAparato = () => {
    const nuevo: AparatoInputHS4 = {
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

  const patchAparato = (id: string, patch: Partial<AparatoInputHS4>) => {
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

  // Presión mínima exigida en el punto crítico (para el banner: cumple/no contra
  // ESE umbral). El motor ya la calcula por aparato; aquí la leemos del crítico.
  const apCritico =
    result.puntoCriticoId != null
      ? result.porAparato.find((a) => a.id === result.puntoCriticoId)
      : undefined;
  const presionMinCritico_kPa = apCritico?.presionMinExigida_kPa ?? null;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Topbar
        moduleLabel="HS4 Fontanería"
        moduleGroup="Salubridad (DB-HS) · suministro de agua"
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
            <CollapsibleSection label="Suministro" refNorma="DB-HS4 ap. 2.1.3 / 4.2">
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
                  onChange={(v) => setField("fraccionPerdidasLocalizadas", v / 100)}
                  min={20}
                  max={30}
                  step={1}
                />
              </Field>
            </CollapsibleSection>

            <CollapsibleSection label="Tramos de la red" refNorma="DB-HS4 Tablas 4.2–4.3">
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

            <CollapsibleSection label="Aparatos sanitarios" refNorma="DB-HS4 Tabla 2.1">
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
              Red de suministro (agua fría) —{" "}
              <span className={`font-semibold ${STATE_TEXT[result.veredictoGlobal]}`}>
                {STATUS_LABEL[result.veredictoGlobal]}
              </span>{" "}
              <span className="text-text-disabled">
                ({fmt(result.caudalTotal_dm3_s, "dm³/s", 2)} de cálculo · P crítica{" "}
                {fmt(result.presionCritica_kPa, "kPa", 0)}
                {presionMinCritico_kPa != null ? ` / ${fmt(presionMinCritico_kPa, "kPa", 0)} mín.` : ""}
                {result.grupoPresionNecesario ? " · grupo de presión necesario" : ""})
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
            <HS4SVG result={result} mode="screen" width={svgW} height={svgH} />
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
        <div id={HS4_PDF_SVG_ID} style={{ position: "absolute", left: "-9999px", top: 0 }}>
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
    </div>
  );
}

// -----------------------------------------------------------------------------
// Fila editable de un TRAMO de la red (lista dinámica). Selector de tipo, de
// padre ("cuelga de" — entre los OTROS tramos + opción raíz, nunca a sí mismo
// para evitar el ciclo trivial; el motor valida el resto), material (fija el
// rango de velocidad), longitud y cota (altura respecto al padre).
// -----------------------------------------------------------------------------
function TramoRow({
  tramo,
  tramos,
  onPatch,
  onRemove,
  canRemove,
}: {
  tramo: TramoInputHS4;
  tramos: TramoInputHS4[];
  onPatch: (patch: Partial<TramoInputHS4>) => void;
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

  return (
    <div className="border-border-sub bg-bg-primary rounded-md border p-2.5">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SelectInput<TipoTramoHS4>
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

      <div className="mt-2 flex items-center justify-between gap-3">
        <InputLabel htmlFor={`material-${tramo.id}`} label="Material" />
        <div className="w-40 shrink-0">
          <SelectInput<MaterialTuberia>
            id={`material-${tramo.id}`}
            value={tramo.material ?? "metalica"}
            options={MATERIAL_OPTIONS}
            onChange={(v) => onPatch({ material: v })}
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <InputLabel htmlFor={`longitud-${tramo.id}`} label="Longitud" sub="L" />
        <div className="flex w-32 shrink-0 items-center gap-1.5">
          <div className="flex-1">
            <NumberInput
              id={`longitud-${tramo.id}`}
              value={tramo.longitud_m ?? 1}
              onChange={(v) => onPatch({ longitud_m: v })}
              min={0}
              step={0.5}
            />
          </div>
          <span className="text-text-disabled w-8 shrink-0 text-[11px]">m</span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <InputLabel
          htmlFor={`altura-${tramo.id}`}
          label="Cota"
          sub="Δh"
          help="Altura del tramo respecto a su padre. Positiva si SUBE (resta presión hidrostática, ≈ 9,81 kPa por metro)."
        />
        <div className="flex w-32 shrink-0 items-center gap-1.5">
          <div className="flex-1">
            <NumberInput
              id={`altura-${tramo.id}`}
              value={tramo.altura_m ?? 0}
              onChange={(v) => onPatch({ altura_m: v })}
              step={0.5}
            />
          </div>
          <span className="text-text-disabled w-8 shrink-0 text-[11px]">m</span>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Fila editable de un APARATO sanitario (lista dinámica). Tipo de aparato (los
// TipoAparatoHS4 reales del motor), el tramo al que descarga (entre los tramos
// existentes) y un flag para forzar la presión de fluxor/calentador (150 kPa).
// -----------------------------------------------------------------------------
function AparatoRow({
  aparato,
  tramos,
  onPatch,
  onRemove,
  canRemove,
}: {
  aparato: AparatoInputHS4;
  tramos: TramoInputHS4[];
  onPatch: (patch: Partial<AparatoInputHS4>) => void;
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
          <SelectInput<TipoAparatoHS4>
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

      <div className="mt-2 flex items-center justify-between gap-3">
        <InputLabel
          htmlFor={`fluxor-${aparato.id}`}
          label="Fluxor / calentador"
          help="Fuerza la presión mínima de fluxor/calentador (150 kPa) en el punto de consumo, en vez de la de grifo común (100 kPa). Por defecto se deriva del tipo de aparato."
        />
        <input
          id={`fluxor-${aparato.id}`}
          type="checkbox"
          checked={aparato.esFluxorOCalentador ?? false}
          onChange={(e) => onPatch({ esFluxorOCalentador: e.target.checked })}
          className="accent-accent h-4 w-4 shrink-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Tabla de resultados ACCESIBLE (WCAG: el dato numérico SIEMPRE en texto/tabla,
// no solo en el SVG). Por tramo: tipo · Ø resultante · caudal de cálculo · K ·
// velocidad (con su rango) · pérdida · presión residual · estado. El recorrido
// crítico se resalta (no solo color: marca «◆ crítico» en texto). Después, el
// resumen (caudal total, presión crítica vs mínima, grupo de presión, criterio
// K) y los avisos del motor.
// -----------------------------------------------------------------------------
function ResultsTable({ result }: { result: HS4Result }) {
  const apCritico =
    result.puntoCriticoId != null
      ? result.porAparato.find((a) => a.id === result.puntoCriticoId)
      : undefined;
  const presionMinCritico_kPa = apCritico?.presionMinExigida_kPa ?? null;

  return (
    <div className="max-w-3xl">
      {!result.arbolValido && (
        <div className="text-state-fail mb-3 text-[12px] font-semibold">
          La red de tramos no es un árbol válido (hay un ciclo o un padre
          inexistente): corrige las conexiones «cuelga de».
        </div>
      )}

      <div className="text-text-disabled mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
        Dimensionado por tramo
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-text-disabled border-border-sub border-b text-left text-[11px] uppercase">
              <th scope="col" className="py-1.5 font-medium">Tramo</th>
              <th scope="col" className="py-1.5 text-right font-medium">Ø</th>
              <th scope="col" className="py-1.5 text-right font-medium">Q cálc.</th>
              <th scope="col" className="py-1.5 text-right font-medium">K</th>
              <th scope="col" className="py-1.5 text-right font-medium">v</th>
              <th scope="col" className="py-1.5 text-right font-medium">Pérdida</th>
              <th scope="col" className="py-1.5 text-right font-medium">P resid.</th>
              <th scope="col" className="py-1.5 text-right font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {result.porTramo.map((t) => {
              const rango = rangoVelocidad(t.material);
              return (
                <tr key={t.id} className="border-border-sub border-b">
                  <td className="text-text-secondary py-1.5">
                    {TIPO_TRAMO_LABEL[t.tipo]}{" "}
                    <span className="text-text-disabled font-mono text-[11px]">({t.id})</span>
                    {t.esCritico && (
                      <span className="text-state-fail ml-1 text-[11px] font-semibold">
                        ◆ crítico
                      </span>
                    )}
                  </td>
                  <td className="text-text-primary py-1.5 text-right tabular-nums">
                    {t.diametro_mm == null ? "—" : `Ø${fmt(t.diametro_mm, "mm", 0)}`}
                    {t.diametroFueraDeSerie && (
                      <FlagBadge
                        label="fuera de serie"
                        title="Ø requerido fuera de la serie comercial (> 110 mm): el tramo no tiene un Ø válido de la serie. Aviso, no incumplimiento del CTE."
                      />
                    )}
                  </td>
                  <td className="text-text-secondary py-1.5 text-right tabular-nums">
                    {fmt(t.caudalCalculo_dm3_s, "dm³/s", 3)}
                  </td>
                  <td className="text-text-secondary py-1.5 text-right tabular-nums">
                    {fmt(t.k, "", 2)}
                  </td>
                  <td className="text-text-secondary py-1.5 text-right tabular-nums">
                    {t.velocidad_m_s == null ? "—" : fmt(t.velocidad_m_s, "m/s", 2)}
                    <span className="text-text-disabled ml-1 text-[10px]">
                      [{fmt(rango.min_m_s, "", 1)}–{fmt(rango.max_m_s, "", 1)}]
                    </span>
                    {t.velocidadFueraDeRango && (
                      <FlagBadge
                        label="fuera de rango"
                        title="Velocidad fuera del rango recomendado del material (ap. 4.2 d). Buena práctica de proyecto; aviso, no incumplimiento prestacional del CTE."
                      />
                    )}
                  </td>
                  <td className="text-text-secondary py-1.5 text-right tabular-nums">
                    {fmt(t.perdida_kPa, "kPa", 1)}
                  </td>
                  <td className="text-text-primary py-1.5 text-right tabular-nums">
                    {fmt(t.presionResidual_kPa, "kPa", 0)}
                  </td>
                  <td className={`py-1.5 text-right font-semibold ${STATE_TEXT[t.estado]}`}>
                    {ESTADO_LABEL[t.estado]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="text-text-disabled mt-5 mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
        Verificación por aparato
      </div>
      <table className="w-full max-w-2xl text-[13px]">
        <thead>
          <tr className="text-text-disabled border-border-sub border-b text-left text-[11px] uppercase">
            <th scope="col" className="py-1.5 font-medium">Aparato</th>
            <th scope="col" className="py-1.5 text-right font-medium">Q inst.</th>
            <th scope="col" className="py-1.5 text-right font-medium">P mín.</th>
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
                  {a.esFluxorOCalentador ? " · fluxor" : ""})
                </span>
              </td>
              <td className="text-text-primary py-1.5 text-right tabular-nums">
                {fmt(a.caudalInstantaneo_dm3_s, "dm³/s", 3)}
              </td>
              <td className="text-text-secondary py-1.5 text-right tabular-nums">
                {fmt(a.presionMinExigida_kPa, "kPa", 0)}
              </td>
              <td className={`py-1.5 text-right font-semibold ${STATE_TEXT[a.estado]}`}>
                {ESTADO_LABEL[a.estado]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-text-disabled mt-5 mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
        Resumen
      </div>
      <dl className="max-w-2xl text-[13px]">
        <SummaryRow
          k="Caudal de cálculo total"
          v={fmt(result.caudalTotal_dm3_s, "dm³/s", 2)}
          sub="que llega a la acometida"
        />
        <SummaryRow
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
        <SummaryRow
          k="Grupo de presión (ap. 4.5)"
          v={result.grupoPresionNecesario ? "Necesario" : "No necesario"}
          sub={
            result.grupoPresionNecesario
              ? "la presión cae por debajo de la mínima en el punto más desfavorable"
              : "la presión de acometida es suficiente"
          }
        />
        <SummaryRow
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

      {/* Zona única de ALCANCE Y SUPUESTOS (ARCH-1 / ARCH-2): todas las
          limitaciones agrupadas tras el resumen para verlas de un vistazo —
          alcance (solo AF), presión orientativa y criterios externos (K /
          pérdidas). Cada nota mantiene su `role="note"` (no solo color). */}
      <div className="mt-5">
        <div className="text-text-disabled mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
          Alcance y supuestos
        </div>

        {/* ARCH-2: alcance de esta versión. Solo se dimensiona agua fría (AF); la
            red de ACS NO se dimensiona aquí. Visible (no enterrado), no solo color. */}
        <DisclosureNote>
          <span className="font-semibold">Alcance:</span> esta versión dimensiona solo la red de
          agua fría (AF). La red de ACS (agua caliente sanitaria) no se dimensiona en esta versión.
        </DisclosureNote>

        {/* ARCH-1: la presión (residual, crítica, grupo de presión) es ORIENTATIVA. */}
        <DisclosureNote>
          <span className="font-semibold">Presión estimada:</span> los valores de presión (residual,
          en el punto crítico y la necesidad de grupo de presión) provienen de un modelo de
          predimensionado y son orientativos; no sustituyen un cálculo hidráulico de detalle.
        </DisclosureNote>

        <p className="text-text-disabled text-[11px] leading-snug">
          El coeficiente de simultaneidad K (UNE 149201) y la estimación de pérdidas
          localizadas (20–30 %) son criterios externos al DB-HS4, no exigencias del
          CTE. El modelo de pérdida de carga es de predimensionado.
        </p>
      </div>

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

// -----------------------------------------------------------------------------
// Nota de alcance/limitación VISIBLE (ARCH-1 / ARCH-2). Banner discreto pero no
// escondido: tinte neutral + icono + texto. Accesible: `role="note"` y el icono
// es decorativo (`aria-hidden`) porque el texto ya lo dice todo (no solo color).
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

// -----------------------------------------------------------------------------
// Distintivo MULTICANAL de aviso por tramo (velocidad fuera de rango / Ø fuera de
// serie, flags Wave 1). No depende solo del color (WCAG 1.4.1): icono + etiqueta
// textual visible + `title`/`aria-label` con la explicación completa. El tono
// `state-warn` solo REFUERZA.
// -----------------------------------------------------------------------------
function FlagBadge({ label, title }: { label: string; title: string }) {
  return (
    <span
      title={title}
      aria-label={title}
      className="bg-tint-warn text-state-warn ml-1.5 inline-flex items-center gap-0.5 rounded px-1 py-0.5 align-middle text-[10px] font-semibold whitespace-nowrap"
    >
      <AlertTriangle size={10} className="shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}
