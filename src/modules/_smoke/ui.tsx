import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { usePdfPreview } from "../../hooks/usePdfPreview";
import { ModuleLayout, type ResumenVeredicto } from "../../components/justificacion/ModuleLayout";
import { LienzoAjustado } from "../../components/justificacion/LienzoAjustado";
import { ajustar } from "../../lib/ui/ajustar";
import { PdfPreviewModal } from "../../components/ui/PdfPreviewModal";
import { CollapsibleSection } from "../../components/ui/CollapsibleSection";
import { Field, NumberInput } from "../../components/ui/InputLabel";
import { renderFicha } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import { calcSmoke, smokeDefaults, type SmokeInputs } from "./calc";
import { SmokeSVG } from "./svg";
import { toFichaData, SMOKE_PDF_SVG_ID } from "./ficha";

// _smoke: banco de pruebas del armazón de módulo (<ModuleLayout
// justificacionKey="smoke">). Aquí solo se reparte el contenido en sus zonas:
// entradas a la izquierda, dibujo, comprobaciones y memoria.
//
// DECISIÓN DE SANDBOX (documentada): _smoke usa un mini-estado LOCAL (useState
// + setField + reset, sin persistencia ni URL) en vez de useJustificacionState
// porque (1) useJustificacionState llama a useProyecto(), que LANZA fuera de
// <ProyectoProvider> — y /_smoke se monta sin provider a propósito —, y (2) su
// `key` está tipada como JustificacionKey, que no incluye "smoke". Al ser un
// banco de pruebas de desarrollo, no necesita guardar ni compartir estado: con
// la retirada del hook legacy (T6.2) desaparecen también la persistencia
// localStorage/URL y la acción "Compartir" (una URL sin estado no comparte
// nada). ModuleLayout sí tolera contexto null (useContext directo), así que
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

  const deferredState = useDeferredValue(state);
  const result = useMemo(() => calcSmoke(deferredState), [deferredState]);

  const valid =
    Number.isFinite(state.caudalPropuesto_l_s) &&
    state.caudalPropuesto_l_s > 0 &&
    Number.isInteger(state.numLocales) &&
    state.numLocales >= 1;

  const generarFicha = () => renderFicha(toFichaData(deferredState, result));
  const { pdfExporting, pdfPreview, handleExportPdf, handleDownloadPdf, closePdfPreview } =
    usePdfPreview(generarFicha, valid);

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


  return (
    <ModuleLayout
      justificacionKey="smoke"
      resultado={resumen}
      acciones={{
        onExportPdf: handleExportPdf,
        pdfExporting,
        onReset: reset,
      }}
      avisos={result.warnings}
      entradas={
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
      }
      dibujo={{
        titulo: "Esquema",
        lienzo: (
          <LienzoAjustado>
            {(caja) => {
              const { width, height } = ajustar(4, 3, caja, { max: 640 });
              return <SmokeSVG result={result} mode="screen" width={width} height={height} />;
            }}
          </LienzoAjustado>
        ),
      }}
      comprobaciones={<ResultsTable result={result} />}
      memoria={{ generar: generarFicha, valid }}
    >
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
    </ModuleLayout>
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
    </div>
  );
}
