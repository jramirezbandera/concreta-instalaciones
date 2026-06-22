import { useDeferredValue, useMemo, useState } from "react";
import { useModuleState } from "../../hooks/useModuleState";
import { useContainerWidth } from "../../hooks/useContainerWidth";
import { usePdfPreview } from "../../hooks/usePdfPreview";
import { useDrawer } from "../../components/layout/AppShell";
import { Topbar } from "../../components/layout/Topbar";
import { PdfPreviewModal } from "../../components/ui/PdfPreviewModal";
import { MobileTabBar, type MobileTab } from "../../components/ui/MobileTabBar";
import { CollapsibleSection } from "../../components/ui/CollapsibleSection";
import { Field, NumberInput } from "../../components/ui/InputLabel";
import { showToast } from "../../components/ui/Toast";
import { renderFicha } from "../../lib/pdf/renderFicha";
import { STATUS_LABEL } from "../../lib/pdf/utils";
import { STATE_TEXT, STATE_TINT } from "../../lib/ui/veredicto";
import { fmt } from "../../lib/units/format";
import { calcSmoke, smokeDefaults } from "./calc";
import { SmokeSVG } from "./svg";
import { toFichaData, SMOKE_PDF_SVG_ID } from "./ficha";

export function SmokeModule() {
  const { state, setField, reset } = useModuleState("smoke", smokeDefaults);
  const { openDrawer } = useDrawer();
  const [tab, setTab] = useState<MobileTab>("inputs");

  const deferredState = useDeferredValue(state);
  const result = useMemo(() => calcSmoke(deferredState), [deferredState]);

  const valid =
    Number.isFinite(state.caudalPropuesto_l_s) &&
    state.caudalPropuesto_l_s > 0 &&
    Number.isInteger(state.numLocales) &&
    state.numLocales >= 1;

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

  const [canvasRef, canvasWidth] = useContainerWidth();
  const svgW =
    canvasWidth !== undefined && canvasWidth > 0
      ? Math.min(640, Math.max(280, canvasWidth - 32))
      : 480;
  const svgH = Math.round(svgW * 0.75);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Topbar
        moduleLabel="Demo cimientos"
        moduleGroup="feature-0 · vertical completo"
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
            "lg:border-border-main lg:w-72 lg:shrink-0 lg:border-r",
            tab === "inputs" ? "max-lg:flex-1" : "max-lg:hidden",
            "lg:flex",
          ].join(" ")}
        >
          <div className="scroll-hide flex-1 overflow-y-auto px-4 py-3">
            <CollapsibleSection label="Datos de entrada" refNorma="DB-HS3 ap. 2">
              <Field
                id="caudal"
                label="Caudal"
                sub="qv"
                unit="l/s"
                help="Caudal de extracción independiente propuesto para la cocción. El DB-HS3 exige un mínimo de 50 l/s."
                refText="DB-HS3 ap. 2, pto 4"
              >
                <NumberInput
                  id="caudal"
                  value={state.caudalPropuesto_l_s}
                  onChange={(v) => setField("caudalPropuesto_l_s", v)}
                  min={0}
                  step={1}
                />
              </Field>
              <Field
                id="locales"
                label="Locales"
                sub="n"
                help="Número de locales húmedos servidos por la red (solo informativo en esta demo)."
              >
                <NumberInput
                  id="locales"
                  value={state.numLocales}
                  onChange={(v) => setField("numLocales", v)}
                  min={1}
                  step={1}
                />
              </Field>
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
              `border-b px-6 py-2.5 ${STATE_TINT[result.estado]}`,
              tab === "results" ? "block" : "hidden",
              "lg:block",
            ].join(" ")}
          >
            <span className="text-text-secondary text-[13px]">
              Extracción de cocción —{" "}
              <span className={`font-semibold ${STATE_TEXT[result.estado]}`}>
                {STATUS_LABEL[result.estado]}
              </span>{" "}
              <span className="text-text-disabled">
                ({fmt(result.caudalPropuesto_l_s, "l/s")} vs mín. {fmt(result.caudalRequerido_l_s, "l/s")})
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
            <SmokeSVG result={result} mode="screen" width={svgW} height={svgH} />
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

      {/* Hidden PDF clone (rasterizado Acrobat-safe en la ficha) */}
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div id={SMOKE_PDF_SVG_ID} style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <SmokeSVG result={result} mode="pdf" width={420} height={315} />
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

function ResultsTable({ result }: { result: ReturnType<typeof calcSmoke> }) {
  // WCAG: el resultado numérico SIEMPRE en texto/tabla, no solo en el SVG.
  const rows: { k: string; v: string; strong?: boolean }[] = [
    { k: "Caudal propuesto", v: fmt(result.caudalPropuesto_l_s, "l/s") },
    { k: "Caudal requerido", v: fmt(result.caudalRequerido_l_s, "l/s") },
    { k: "Margen", v: fmt(result.margen_l_s, "l/s"), strong: true },
  ];
  return (
    <div className="max-w-md">
      <div className="text-text-disabled mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
        Resumen
      </div>
      <dl className="text-[13px]">
        {rows.map((r) => (
          <div
            key={r.k}
            className="border-border-sub flex items-baseline justify-between border-b py-1.5"
          >
            <dt className="text-text-secondary">{r.k}</dt>
            <dd
              className={`tabular-nums ${r.strong ? "text-text-primary font-semibold" : "text-text-primary"}`}
            >
              {r.v}
            </dd>
          </div>
        ))}
      </dl>
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
