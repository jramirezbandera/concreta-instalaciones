import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { useContainerWidth } from "../../hooks/useContainerWidth";
import { usePdfPreview } from "../../hooks/usePdfPreview";
import { ModuleShell, type ResumenVeredicto } from "../../components/justificacion/ModuleShell";
import { PdfPreviewModal } from "../../components/ui/PdfPreviewModal";
import { MobileTabBar, type MobileTab } from "../../components/ui/MobileTabBar";
import { CollapsibleSection } from "../../components/ui/CollapsibleSection";
import { Field, NumberInput } from "../../components/ui/InputLabel";
import { renderFicha } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import { calcSmoke, smokeDefaults, type SmokeInputs } from "./calc";
import { SmokeSVG } from "./svg";
import { toFichaData, SMOKE_PDF_SVG_ID } from "./ficha";

// feature-6 T5.0: _smoke migrado al esqueleto nuevo como banco de pruebas del
// SHELL. Topbar + banda de veredicto inline desaparecen: los aporta
// <ModuleShell justificacionKey="smoke">; aquí solo queda la zona de trabajo
// (MobileTabBar + paneles) como children.
//
// DECISIÓN DE SANDBOX (documentada): _smoke usa un mini-estado LOCAL (useState
// + setField + reset, sin persistencia ni URL) en vez de useJustificacionState
// porque (1) useJustificacionState llama a useProyecto(), que LANZA fuera de
// <ProyectoProvider> — y /_smoke se monta sin provider a propósito —, y (2) su
// `key` está tipada como JustificacionKey, que no incluye "smoke". Al ser un
// banco de pruebas de desarrollo, no necesita guardar ni compartir estado: con
// la retirada del hook legacy (T6.2) desaparecen también la persistencia
// localStorage/URL y la acción "Compartir" (una URL sin estado no comparte
// nada). ModuleShell sí tolera contexto null (useContext directo), así que
// valida el shell sin necesidad de proyecto sintético ni wrapper SmokeSandbox.
// El sandbox con proyecto efímero (ProyectoProvider persistir={false}) queda
// para cuando haga falta validar el hook nuevo.

export function SmokeModule() {
  const [state, setState] = useState<SmokeInputs>(smokeDefaults);
  const setField = useCallback(
    <K extends keyof SmokeInputs>(field: K, value: SmokeInputs[K]) => {
      setState((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );
  const reset = useCallback(() => setState(smokeDefaults), []);
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

  // Resumen para la banda del shell, construido inline (smoke no necesita
  // resumen.ts propio): misma frase que la banda inline anterior. `null` con
  // datos inválidos → banda neutra "Datos insuficientes" del shell.
  const resumen: ResumenVeredicto | null = useMemo(
    () =>
      valid
        ? {
            veredicto: result.estado,
            sujeto: "Extracción de cocción",
            metricas: `${fmt(result.caudalPropuesto_l_s, "l/s")} vs mín. ${fmt(result.caudalRequerido_l_s, "l/s")}`,
          }
        : null,
    [valid, result],
  );

  const [canvasRef, canvasWidth] = useContainerWidth();
  const svgW =
    canvasWidth !== undefined && canvasWidth > 0
      ? Math.min(640, Math.max(280, canvasWidth - 32))
      : 480;
  const svgH = Math.round(svgW * 0.75);

  return (
    <ModuleShell
      justificacionKey="smoke"
      resultado={resumen}
      acciones={{
        onExportPdf: handleExportPdf,
        pdfExporting,
        onReset: reset,
      }}
    >
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

        {/* Right: SVG + results. En lg se apila junto (lienzo → tablas); en
            móvil se reparte por pestaña: "diagramas" = solo el lienzo,
            "results" = tablas (el veredicto vive ya en la banda del shell).
            Cada bloque se gatea por separado manteniendo intacto el orden y el
            layout en lg (lg:flex / lg:block). */}
        <div
          className={[
            "scroll-hide flex min-w-0 flex-col overflow-y-auto",
            "lg:flex-1",
            tab === "results" || tab === "diagramas" ? "flex-1" : "hidden",
            "lg:flex",
          ].join(" ")}
        >
          {/* Lienzo del diagrama (tab "diagramas" en móvil; siempre en lg). */}
          <div
            ref={canvasRef}
            className={[
              "border-border-main items-center justify-center border-b px-4 py-6",
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
    </ModuleShell>
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
