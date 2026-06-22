// DB-HS3 — Pantalla del módulo de ventilación. Cablea el motor (./calc), el
// render SVG (./svg) y la ficha PDF (./ficha) sobre el layout compartido
// (Topbar + panel de inputs + panel de resultados), replicando el patrón del
// módulo de cimientos (_smoke/ui).
//
// React 19 + React Compiler: componente PURO. El cálculo es síncrono en render
// (useMemo sobre el estado diferido); no hay efectos de cálculo. Los ids de las
// estancias se generan de forma DETERMINISTA en los handlers de evento (nunca en
// render, nunca con Math.random/Date), derivando un contador del estado actual.

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
import { renderFicha, type Veredicto } from "../../lib/pdf/renderFicha";
import { STATUS_LABEL } from "../../lib/pdf/utils";
import { STATE_TEXT, STATE_TINT } from "../../lib/ui/veredicto";
import { fmt } from "../../lib/units/format";
import {
  calcHS3,
  hs3Defaults,
  type Estancia,
  type HS3Inputs,
  type HS3Result,
  type TipoEstancia,
} from "./calc";
import type { ZonaTermica } from "./tablas";
import { HS3SVG } from "./svg";
import { HS3_PDF_SVG_ID } from "./svg-meta";
import { toFichaData } from "./ficha";


// -----------------------------------------------------------------------------
// Opciones de los selects (declaradas a módulo: estables entre renders).
// -----------------------------------------------------------------------------
const TIPO_OPTIONS: { value: TipoEstancia; label: string }[] = [
  { value: "dorm_principal", label: "Dorm. principal" },
  { value: "dormitorio", label: "Dormitorio" },
  { value: "salon_comedor", label: "Salón-comedor" },
  { value: "cocina", label: "Cocina" },
  { value: "bano", label: "Baño" },
  { value: "aseo", label: "Aseo" },
];

const ZONA_OPTIONS: { value: ZonaTermica; label: string }[] = [
  { value: "W", label: "W (Tm ≤ 14 °C)" },
  { value: "X", label: "X (14–16 °C)" },
  { value: "Y", label: "Y (16–18 °C)" },
  { value: "Z", label: "Z (Tm > 18 °C)" },
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

export function Hs3Module() {
  const { state, setField, reset } = useModuleState<HS3Inputs>("hs3", hs3Defaults);
  const { openDrawer } = useDrawer();
  const [tab, setTab] = useState<MobileTab>("inputs");

  const deferredState = useDeferredValue(state);
  const result = useMemo(() => calcHS3(deferredState), [deferredState]);

  // Validación de entrada (patrón de _smoke): nº dormitorios entero ≥ 0, al menos
  // una estancia y todos los caudales finitos > 0.
  const valid =
    Number.isInteger(state.numDormitorios) &&
    state.numDormitorios >= 0 &&
    state.estancias.length >= 1 &&
    state.estancias.every(
      (e) => Number.isFinite(e.caudalPropuesto_l_s) && e.caudalPropuesto_l_s > 0,
    );

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

  // ── Mutaciones inmutables de la lista de estancias ─────────────────────────
  const addEstancia = () => {
    const nueva: Estancia = {
      id: nextEstanciaId(state.estancias),
      tipo: "dormitorio",
      caudalPropuesto_l_s: 4,
    };
    setField("estancias", [...state.estancias, nueva]);
  };

  const removeEstancia = (id: string) => {
    setField(
      "estancias",
      state.estancias.filter((e) => e.id !== id),
    );
  };

  const patchEstancia = (id: string, patch: Partial<Estancia>) => {
    setField(
      "estancias",
      state.estancias.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  };

  const [canvasRef, canvasWidth] = useContainerWidth();
  const svgW =
    canvasWidth !== undefined && canvasWidth > 0
      ? Math.min(640, Math.max(280, canvasWidth - 32))
      : 480;
  const svgH = Math.round(svgW * 0.6);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Topbar
        moduleLabel="HS3 Ventilación"
        moduleGroup="Salubridad (DB-HS) · calidad del aire interior"
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
            <CollapsibleSection label="Vivienda" refNorma="DB-HS3 Tabla 2.1 / 4.3">
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
              <Field
                id="zona-termica"
                label="Zona térmica"
                help="Zona térmica del edificio (Tabla 4.4) que, junto con el nº de plantas, fija la clase de tiro del conducto (Tabla 4.3)."
                refText="DB-HS3 Tabla 4.3 / 4.4"
              >
                <SelectInput<ZonaTermica>
                  id="zona-termica"
                  value={state.zonaTermica}
                  options={ZONA_OPTIONS}
                  onChange={(v) => setField("zonaTermica", v)}
                />
              </Field>
              <Field
                id="num-plantas-conducto"
                label="Plantas (conducto)"
                sub="nº"
                help="Nº de plantas entre la más baja que vierte al conducto y la última (ambas incluidas). Con la zona térmica fija la clase de tiro (Tabla 4.3). Se satura en 8 (8 o más)."
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
            </CollapsibleSection>

            <CollapsibleSection label="Estancias" refNorma="DB-HS3 Tabla 2.1">
              <div className="flex flex-col gap-2.5">
                {state.estancias.map((e) => (
                  <EstanciaRow
                    key={e.id}
                    estancia={e}
                    onPatch={(patch) => patchEstancia(e.id, patch)}
                    onRemove={() => removeEstancia(e.id)}
                    canRemove={state.estancias.length > 1}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={addEstancia}
                className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed py-2 text-[13px] transition-colors"
              >
                <Plus size={14} />
                Añadir estancia
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
              Ventilación de la vivienda (cat. {result.categoriaDormitorios}) —{" "}
              <span className={`font-semibold ${STATE_TEXT[result.veredictoGlobal]}`}>
                {STATUS_LABEL[result.veredictoGlobal]}
              </span>{" "}
              <span className="text-text-disabled">
                (extracción {fmt(result.totalExtraccion_l_s, "l/s")} · admisión{" "}
                {fmt(result.totalAdmision_l_s, "l/s")})
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
            <HS3SVG result={result} mode="screen" width={svgW} height={svgH} />
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
        <div id={HS3_PDF_SVG_ID} style={{ position: "absolute", left: "-9999px", top: 0 }}>
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
    </div>
  );
}

// -----------------------------------------------------------------------------
// Fila editable de una estancia (lista dinámica). El toggle "cocción" solo es
// relevante para cocinas; se deshabilita en el resto para evitar entradas sin
// efecto normativo (la extracción de cocción independiente de 50 l/s aplica a la
// zona de cocción).
// -----------------------------------------------------------------------------
function EstanciaRow({
  estancia,
  onPatch,
  onRemove,
  canRemove,
}: {
  estancia: Estancia;
  onPatch: (patch: Partial<Estancia>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const esCocina = estancia.tipo === "cocina";
  const coccionId = `coccion-${estancia.id}`;
  return (
    <div className="border-border-sub bg-bg-primary rounded-md border p-2.5">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SelectInput<TipoEstancia>
            id={`tipo-${estancia.id}`}
            value={estancia.tipo}
            options={TIPO_OPTIONS}
            onChange={(v) =>
              onPatch(v === "cocina" ? { tipo: v } : { tipo: v, esCoccion: false })
            }
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Quitar estancia"
          title={canRemove ? "Quitar estancia" : "Debe haber al menos una estancia"}
          className="text-text-disabled hover:text-state-fail shrink-0 rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <InputLabel htmlFor={`caudal-${estancia.id}`} label="Caudal" sub="qv" />
        <div className="flex w-32 shrink-0 items-center gap-1.5">
          <div className="flex-1">
            <NumberInput
              id={`caudal-${estancia.id}`}
              value={estancia.caudalPropuesto_l_s}
              onChange={(v) => onPatch({ caudalPropuesto_l_s: v })}
              min={0}
              step={1}
            />
          </div>
          <span className="text-text-disabled w-8 shrink-0 text-[11px]">l/s</span>
        </div>
      </div>

      {esCocina && (
        <>
          <label
            htmlFor={coccionId}
            className="text-text-secondary mt-2 flex cursor-pointer items-center gap-2 text-[13px]"
          >
            <input
              id={coccionId}
              type="checkbox"
              checked={!!estancia.esCoccion}
              onChange={(ev) =>
                onPatch(
                  ev.target.checked
                    ? { esCoccion: true, caudalCoccion_l_s: estancia.caudalCoccion_l_s ?? 50 }
                    : { esCoccion: false, caudalCoccion_l_s: undefined },
                )
              }
              className="accent-accent h-3.5 w-3.5"
            />
            Zona de cocción (extracción independiente ≥ 50 l/s)
          </label>

          {estancia.esCoccion && (
            <div className="mt-2 flex items-center justify-between gap-3">
              <InputLabel
                htmlFor={`coccion-caudal-${estancia.id}`}
                label="Cocción"
                sub="indep."
              />
              <div className="flex w-32 shrink-0 items-center gap-1.5">
                <div className="flex-1">
                  <NumberInput
                    id={`coccion-caudal-${estancia.id}`}
                    value={estancia.caudalCoccion_l_s ?? 50}
                    onChange={(v) => onPatch({ caudalCoccion_l_s: v })}
                    min={0}
                    step={1}
                  />
                </div>
                <span className="text-text-disabled w-8 shrink-0 text-[11px]">l/s</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Tabla de resultados accesible (WCAG: el dato numérico SIEMPRE en texto/tabla,
// no solo en el SVG). Por estancia: propuesto / requerido / cumple; más húmedos
// total, balance, cocción y el conducto (estado neutral con su aviso).
// -----------------------------------------------------------------------------
const TIPO_LABEL: Record<TipoEstancia, string> = {
  dorm_principal: "Dorm. principal",
  dormitorio: "Dormitorio",
  salon_comedor: "Salón-comedor",
  cocina: "Cocina",
  bano: "Baño",
  aseo: "Aseo",
};

const ESTADO_LABEL: Record<string, string> = {
  ok: "Cumple",
  warn: "Aviso",
  fail: "No cumple",
  neutral: "Informativo",
};

function ResultsTable({ result }: { result: HS3Result }) {
  return (
    <div className="max-w-2xl">
      <div className="text-text-disabled mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
        Verificación por estancia
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-text-disabled border-border-sub border-b text-left text-[11px] uppercase">
            <th scope="col" className="py-1.5 font-medium">Estancia</th>
            <th scope="col" className="py-1.5 text-right font-medium">Propuesto</th>
            <th scope="col" className="py-1.5 text-right font-medium">Requerido</th>
            <th scope="col" className="py-1.5 text-right font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {result.porEstancia.map((e) => (
            <tr key={e.id} className="border-border-sub border-b">
              <td className="text-text-secondary py-1.5">
                {TIPO_LABEL[e.tipo]}{" "}
                <span className="text-text-disabled text-[11px]">
                  ({e.tipoAbertura === "extraccion" ? "extracción" : "admisión"}
                  {e.esCoccion ? " · cocción" : ""})
                </span>
              </td>
              <td className="text-text-primary py-1.5 text-right tabular-nums">
                {fmt(e.caudalPropuesto_l_s, "l/s")}
              </td>
              <td className="text-text-secondary py-1.5 text-right tabular-nums">
                {fmt(e.caudalRequerido_l_s, "l/s")}
              </td>
              <td className={`py-1.5 text-right font-semibold ${STATE_TEXT[e.estado]}`}>
                {ESTADO_LABEL[e.estado]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="text-text-disabled mt-5 mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
        Resumen de vivienda
      </div>
      <dl className="text-[13px]">
        <SummaryRow
          k="Extracción de húmedos (total)"
          v={`${fmt(result.humedosTotalPropuesto_l_s, "l/s")} (mín. ${fmt(result.humedosTotalRequerido_l_s, "l/s")})`}
          estado={result.estadoHumedosTotal}
        />
        <SummaryRow
          k="Equilibrio admisión / extracción"
          v={`${fmt(result.totalAdmision_l_s, "l/s")} ↔ ${fmt(result.totalExtraccion_l_s, "l/s")}`}
          estado={result.estadoBalance}
        />
        <SummaryRow
          k="Área de abertura de paso"
          v={fmt(result.areaPaso_cm2, "cm²", 0)}
        />
        {result.porEstancia
          .filter((e) => e.esCoccion)
          .map((e) => (
            <SummaryRow
              key={`coccion-${e.id}`}
              k={`Cocción — ${TIPO_LABEL[e.tipo]} (independiente)`}
              v={`${fmt(e.caudalCoccion_l_s ?? 0, "l/s")} (mín. 50 l/s)`}
              estado={e.cumpleCoccion ? "ok" : "fail"}
            />
          ))}
        <SummaryRow
          k={`Conducto de extracción (clase ${result.conducto.claseTiro})`}
          v={`${fmt(result.conducto.seccionRequerida_cm2, "cm²", 0)} · qvt ${fmt(result.conducto.qvt_l_s, "l/s")}`}
          estado="neutral"
        />
      </dl>

      <p className="text-text-disabled mt-2 text-[11px] leading-snug">
        {result.conducto.aviso}. La sección del conducto se reporta a título
        informativo y no entra en el veredicto global.
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

function SummaryRow({ k, v, estado }: { k: string; v: string; estado?: Veredicto }) {
  return (
    <div className="border-border-sub flex items-baseline justify-between gap-3 border-b py-1.5">
      <dt className="text-text-secondary">{k}</dt>
      <dd className="flex items-baseline gap-2">
        <span className="text-text-primary tabular-nums">{v}</span>
        {estado && (
          <span className={`text-[11px] font-semibold ${STATE_TEXT[estado]}`}>
            {ESTADO_LABEL[estado]}
          </span>
        )}
      </dd>
    </div>
  );
}
