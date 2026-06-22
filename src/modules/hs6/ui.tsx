// DB-HS6 — Pantalla del módulo de PROTECCIÓN FRENTE AL RADÓN. Cablea el motor
// (./calc), el render SVG (./svg) y la ficha PDF (./ficha) sobre el layout
// compartido (Topbar + panel de inputs + panel de resultados), replicando el
// patrón POR-ELEMENTO de HE1 (emplazamiento + lista de medidas independientes) con
// el editor de LISTA DINÁMICA de HS4 (añadir/quitar soluciones con menú de tipo e
// ids deterministas). El motor clasifica por zona, comprueba la adecuación de la
// COMBINACIÓN de soluciones propuesta y el checklist cualitativo/geométrico de cada
// medida; el elemento crítico (la medida que falta o el requisito incumplido) se
// resalta en el SVG y en la tabla.
//
// React 19 + React Compiler: componente PURO. El cálculo es síncrono en render
// (useMemo sobre el estado diferido); no hay efectos de cálculo ni botón
// "calcular" (feedback inmediato). Los ids de las soluciones se generan de forma
// DETERMINISTA en los handlers de evento (nunca en render, nunca con
// Math.random/Date). Las mutaciones de la lista son siempre INMUTABLES.

import { useDeferredValue, useMemo, useState, type JSX, type ReactNode } from "react";
import { Trash2, Plus, Info } from "lucide-react";
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
  calcHS6,
  hs6Defaults,
  type HS6Inputs,
  type HS6Result,
  type ResultadoMedidaHS6,
  type SolucionBarreraInput,
  type SolucionDespresurizacionInput,
  type SolucionEspacioContencionInput,
  type SolucionHS6Input,
} from "./calc";
import type {
  TipoSolucionHS6,
  TipoVentilacionContencion,
  ViaJustificacionBarrera,
  ZonaRadon,
} from "./tablas";
import { HS6SVG } from "./svg";
import { HS6_PDF_SVG_ID, hs6NativeSize } from "./svg-meta";
import { toFichaData } from "./ficha";

// -----------------------------------------------------------------------------
// Opciones de los selects (declaradas a módulo: estables entre renders).
// -----------------------------------------------------------------------------

// Zona de radón del edificio (Apéndice B): la consulta el proyectista por su
// municipio. Indexa el nivel de protección exigido (art. 3.1).
const ZONA_OPTIONS: { value: ZonaRadon; label: string }[] = [
  { value: "I", label: "Zona I (potencial medio)" },
  { value: "II", label: "Zona II (potencial alto)" },
  { value: "sin_exigencia", label: "Sin exigencia (no clasificada)" },
];

// Ámbito (art. 1): expuesto como select Sí/No para que cierre la columna como el
// resto de controles del panel (paridad visual con HE1/HS4).
const AMBITO_OPTIONS: { value: "si" | "no"; label: string }[] = [
  { value: "si", label: "Sí — habitable y en contacto" },
  { value: "no", label: "No — fuera de ámbito" },
];

const TIPO_SOLUCION_OPTIONS: { value: TipoSolucionHS6; label: string }[] = [
  { value: "barrera", label: "Barrera de protección" },
  { value: "espacio_contencion", label: "Espacio de contención ventilado" },
  { value: "despresurizacion", label: "Despresurización del terreno" },
];

const TIPO_SOLUCION_LABEL: Record<TipoSolucionHS6, string> = {
  barrera: "Barrera de protección",
  espacio_contencion: "Espacio de contención ventilado",
  despresurizacion: "Despresurización del terreno",
};

const VIA_BARRERA_OPTIONS: { value: ViaJustificacionBarrera; label: string }[] = [
  { value: "lamina_tipo", label: "Lámina-tipo (vía simplificada)" },
  { value: "calculo", label: "Cálculo de difusión (Nivel B — diferida)" },
];

const VENTILACION_OPTIONS: { value: TipoVentilacionContencion; label: string }[] = [
  { value: "natural", label: "Natural (criterio 10 cm²/ml)" },
  { value: "mecanica", label: "Mecánica (remite a DB-HS3)" },
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
// numérico mayor de los ids "<prefix>N" y devuelve el siguiente; ignora los ids
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

// -----------------------------------------------------------------------------
// Plantillas de solución por tipo (defaults razonables para cada medida nueva).
// `id` lo asigna el handler (determinista); aquí solo se fija la forma + valores.
// -----------------------------------------------------------------------------
function nuevaSolucion(tipo: TipoSolucionHS6, id: string): SolucionHS6Input {
  switch (tipo) {
    case "barrera":
      return {
        tipo: "barrera",
        id,
        via: "lamina_tipo",
        continuidadSellada: true,
        penetracionesSelladas: true,
        puertasEstancas: true,
        coefDifusion_m2_s: 8e-12,
        espesor_mm: 2.5,
      };
    case "espacio_contencion":
      return {
        tipo: "espacio_contencion",
        id,
        ventilacion: "natural",
        perimetro_m: 40,
        areaAberturas_cm2: 480,
        alturaCamara_mm: 80,
      };
    case "despresurizacion":
      return {
        tipo: "despresurizacion",
        id,
        redCaptacion: true,
        extraccionMecanica: true,
        geotextil: true,
      };
  }
}

export function Hs6Module(): JSX.Element {
  const { state, setField, reset } = useModuleState<HS6Inputs>("hs6", hs6Defaults);
  const { openDrawer } = useDrawer();
  const [tab, setTab] = useState<MobileTab>("inputs");

  const deferredState = useDeferredValue(state);
  const result = useMemo(() => calcHS6(deferredState), [deferredState]);

  // ── Validación de entrada (pragmática, como he1/hs4) ───────────────────────
  // El motor degrada cualquier dato faltante/incoherente a warn/fail y nunca
  // lanza; la ficha es útil incluso "sin exigencia". Solo exigimos que los campos
  // numéricos aportados sean finitos para no emitir una ficha con NaN.
  const numerosFinitos = state.soluciones.every((s) => {
    if (s.tipo === "barrera") {
      return (
        (s.coefDifusion_m2_s === undefined || Number.isFinite(s.coefDifusion_m2_s)) &&
        (s.espesor_mm === undefined || Number.isFinite(s.espesor_mm))
      );
    }
    if (s.tipo === "espacio_contencion") {
      return (
        Number.isFinite(s.perimetro_m) &&
        (s.areaAberturas_cm2 === undefined || Number.isFinite(s.areaAberturas_cm2)) &&
        (s.alturaCamara_mm === undefined || Number.isFinite(s.alturaCamara_mm))
      );
    }
    return true;
  });
  const valid = numerosFinitos;

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

  // ── Mutaciones inmutables de la lista de soluciones ────────────────────────
  const addSolucion = (tipo: TipoSolucionHS6) => {
    const id = nextId(state.soluciones, "sol-");
    setField("soluciones", [...state.soluciones, nuevaSolucion(tipo, id)]);
  };

  const removeSolucion = (id: string) => {
    setField(
      "soluciones",
      state.soluciones.filter((s) => s.id !== id),
    );
  };

  // Patch tipado: el patch debe pertenecer al MISMO `tipo` que la solución (la
  // unión discriminada se conserva porque solo se parchea la solución de ese id).
  const patchSolucion = <S extends SolucionHS6Input>(id: string, patch: Partial<S>) => {
    setField(
      "soluciones",
      state.soluciones.map((s) => (s.id === id ? ({ ...s, ...patch } as SolucionHS6Input) : s)),
    );
  };

  // ── Lienzo responsive: ancho fluido + proporción del tamaño nativo del SVG ─
  const [canvasRef, canvasWidth] = useContainerWidth();
  const { nativeW, nativeH } = hs6NativeSize(result);
  const svgW =
    canvasWidth !== undefined && canvasWidth > 0
      ? Math.min(640, Math.max(320, canvasWidth - 32))
      : 480;
  const svgH = Math.round((svgW * nativeH) / nativeW);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Topbar
        moduleLabel="HS6 Protección frente al radón"
        moduleGroup="Salubridad (DB-HS) · protección frente al radón"
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
            <CollapsibleSection label="Emplazamiento" refNorma="DB-HS6 art. 1 / Apéndice B">
              <Field
                id="zona-radon"
                label="Zona de radón"
                help="Zona de radón del edificio según su municipio (Apéndice B del DB-HS6). La consulta el proyectista; es un INPUT, no se calcula. Indexa el nivel de protección exigido (art. 3.1): Zona I → una medida; Zona II → barrera obligatoria + una adicional; «sin exigencia» → HS6 no exige medidas."
                refText="DB-HS6 Apéndice B"
              >
                <SelectInput<ZonaRadon>
                  id="zona-radon"
                  value={state.zona}
                  options={ZONA_OPTIONS}
                  onChange={(v) => setField("zona", v)}
                />
              </Field>
              <Field
                id="municipio"
                label="Municipio"
                help="Municipio del edificio. PURAMENTE INFORMATIVO (para la ficha): no condiciona el cálculo; la clasificación efectiva es la zona, que el usuario consulta en el Apéndice B."
                refText="Informativo (no condiciona el cálculo)"
              >
                <input
                  id="municipio"
                  type="text"
                  value={state.municipio ?? ""}
                  onChange={(e) => setField("municipio", e.target.value)}
                  aria-label="Municipio (informativo)"
                  placeholder="Municipio"
                  className="border-border-main bg-bg-primary text-text-primary focus:border-accent focus:ring-accent/30 w-full rounded border px-2 py-1 text-[13px] transition-colors focus:ring-1 focus:outline-none"
                />
              </Field>
              <Field
                id="ambito"
                label="Local en contacto"
                help="Ámbito de aplicación (art. 1): ¿el local es HABITABLE y está en CONTACTO con el terreno (planta baja, sótano, semisótano)? Si no lo es (local no habitable o con una planta interpuesta), HS6 no exige medidas."
                refText="DB-HS6 art. 1"
              >
                <SelectInput<"si" | "no">
                  id="ambito"
                  value={state.localHabitableEnContactoConTerreno ? "si" : "no"}
                  options={AMBITO_OPTIONS}
                  onChange={(v) =>
                    setField("localHabitableEnContactoConTerreno", v === "si")
                  }
                />
              </Field>
            </CollapsibleSection>

            <CollapsibleSection
              label="Soluciones propuestas"
              refNorma="DB-HS6 art. 3.1–3.3"
            >
              <div className="flex flex-col gap-3">
                {state.soluciones.map((s) => (
                  <SolucionCard
                    key={s.id}
                    solucion={s}
                    onPatch={(patch) => patchSolucion(s.id, patch)}
                    onRemove={() => removeSolucion(s.id)}
                  />
                ))}
                {state.soluciones.length === 0 && (
                  <p className="text-text-disabled px-1 text-[12px] leading-snug">
                    No hay soluciones propuestas. Añada al menos una medida de protección
                    según el nivel exigido por la zona (art. 3.1).
                  </p>
                )}
              </div>
              <AddSolucionMenu onAdd={addSolucion} />
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
              Protección frente al radón (zona {result.zona}) —{" "}
              <span className={`font-semibold ${STATE_TEXT[result.veredictoGlobal]}`}>
                {STATUS_LABEL[result.veredictoGlobal]}
              </span>{" "}
              <span className="text-text-disabled">
                (
                {result.aplica
                  ? `${result.nMedidasValidas} de ${result.nMedidasMin} medida(s) válida(s)${
                      result.barreraObligatoria ? " · barrera obligatoria" : ""
                    }`
                  : "sin exigencia HS6"}
                )
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
            <HS6SVG result={result} mode="screen" width={svgW} height={svgH} />
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

      {/* Clon oculto del SVG para el raster del PDF (mismo id que busca renderFicha).
          Modo 'pdf' al tamaño NATIVO del viewBox (hs6NativeSize): renderFicha lo
          clona y rasteriza con scale = CW/nativeW sin deformar. */}
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div id={HS6_PDF_SVG_ID} style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <HS6SVG result={result} mode="pdf" width={nativeW} height={nativeH} />
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
// Menú de "añadir solución": botón "+ Añadir" que despliega los tres tipos de
// medida (barrera / espacio de contención / despresurización). Determinista: el
// id lo asigna el handler en el padre; aquí solo se elige el tipo.
// -----------------------------------------------------------------------------
function AddSolucionMenu({ onAdd }: { onAdd: (tipo: TipoSolucionHS6) => void }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed py-2 text-[13px] transition-colors"
      >
        <Plus size={14} />
        Añadir solución
      </button>
      {abierto && (
        <div className="border-border-sub bg-bg-primary mt-1.5 flex flex-col gap-1 rounded-md border p-1.5">
          {TIPO_SOLUCION_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onAdd(o.value);
                setAbierto(false);
              }}
              className="text-text-secondary hover:bg-bg-elevated hover:text-text-primary rounded px-2 py-1.5 text-left text-[13px] transition-colors"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Tarjeta editable de una SOLUCIÓN (lista dinámica). Cabecera con el tipo (fijo,
// se elige al añadir) + nombre opcional + botón quitar; cuerpo según el `tipo`
// (unión discriminada): barrera, espacio de contención o despresurización. El
// `onPatch` está tipado al tipo concreto de la solución para preservar la unión.
// -----------------------------------------------------------------------------
function SolucionCard({
  solucion,
  onPatch,
  onRemove,
}: {
  solucion: SolucionHS6Input;
  onPatch: (patch: Partial<SolucionHS6Input>) => void;
  onRemove: () => void;
}) {
  const nombreId = `nombre-${solucion.id}`;
  return (
    <div className="border-border-sub bg-bg-primary rounded-md border p-2.5">
      <div className="flex items-center gap-2">
        <span className="text-text-disabled flex-1 truncate text-[11px] font-semibold tracking-[0.04em] uppercase">
          {TIPO_SOLUCION_LABEL[solucion.tipo]}
        </span>
        <span className="text-text-disabled shrink-0 font-mono text-[11px]">{solucion.id}</span>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Quitar solución"
          title="Quitar solución"
          className="text-text-disabled hover:text-state-fail shrink-0 rounded p-1 transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-2">
        <input
          id={nombreId}
          type="text"
          value={solucion.nombre ?? ""}
          onChange={(e) => onPatch({ nombre: e.target.value })}
          aria-label="Nombre de la solución"
          placeholder="Nombre (opcional)"
          className="border-border-main bg-bg-primary text-text-primary focus:border-accent focus:ring-accent/30 w-full rounded border px-2 py-1 text-[13px] transition-colors focus:ring-1 focus:outline-none"
        />
      </div>

      <div className="border-border-sub mt-3 border-t pt-2">
        {solucion.tipo === "barrera" && (
          <BarreraFields
            solucion={solucion}
            onPatch={(p) => onPatch(p as Partial<SolucionHS6Input>)}
          />
        )}
        {solucion.tipo === "espacio_contencion" && (
          <EspacioContencionFields
            solucion={solucion}
            onPatch={(p) => onPatch(p as Partial<SolucionHS6Input>)}
          />
        )}
        {solucion.tipo === "despresurizacion" && (
          <DespresurizacionFields
            solucion={solucion}
            onPatch={(p) => onPatch(p as Partial<SolucionHS6Input>)}
          />
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Fila de checkbox densa (label-izq con ayuda / control-der), para los checklists
// cualitativos (sellados, penetraciones, captación…). El `title`/aria del input
// describe el efecto; el texto refuerza (no solo color).
// -----------------------------------------------------------------------------
function CheckRow({
  id,
  label,
  help,
  refText,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  help?: string;
  refText?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <InputLabel htmlFor={id} label={label} help={help} refText={refText} />
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-accent h-4 w-4 shrink-0 cursor-pointer"
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Campos de una BARRERA de protección (art. 3.2): vía de justificación + checklist
// (continuidad / penetraciones / puertas) + (solo lámina-tipo) coef. difusión y
// espesor de la lámina. El motor exige coef ≤ 1e-11 m²/s y espesor ≥ 2 mm.
// -----------------------------------------------------------------------------
function BarreraFields({
  solucion,
  onPatch,
}: {
  solucion: SolucionBarreraInput;
  onPatch: (patch: Partial<SolucionBarreraInput>) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <InputLabel
          htmlFor={`via-${solucion.id}`}
          label="Vía"
          help="Vía de justificación de la barrera. «Lámina-tipo» es la vía simplificada cuantitativa (coef. difusión ≤ 1e-11 m²/s y espesor ≥ 2 mm). «Cálculo» (E < Elim, Nivel B) está DIFERIDA: el motor no la evalúa (fórmula no verificada literalmente); justifíquela manualmente."
          refText="DB-HS6 art. 3.2"
        />
        <div className="w-44 shrink-0">
          <SelectInput<ViaJustificacionBarrera>
            id={`via-${solucion.id}`}
            value={solucion.via}
            options={VIA_BARRERA_OPTIONS}
            onChange={(v) => onPatch({ via: v })}
          />
        </div>
      </div>

      {solucion.via === "lamina_tipo" && (
        <>
          <div className="mt-2 flex items-center justify-between gap-3">
            <InputLabel
              htmlFor={`coef-${solucion.id}`}
              label="Coef. difusión"
              sub="D"
              help="Coeficiente de difusión del radón de la lámina [m²/s]. Para la vía lámina-tipo debe ser ≤ 1e-11 m²/s (art. 3.2). Use el dato del fabricante (DIT/ETE)."
              refText="DB-HS6 art. 3.2 (≤ 1e-11 m²/s)"
            />
            <div className="flex w-32 shrink-0 items-center gap-1.5">
              <div className="flex-1">
                <NumberInput
                  id={`coef-${solucion.id}`}
                  value={solucion.coefDifusion_m2_s ?? Number.NaN}
                  onChange={(v) =>
                    onPatch({ coefDifusion_m2_s: Number.isFinite(v) ? v : undefined })
                  }
                  min={0}
                  step={1e-12}
                />
              </div>
              <span className="text-text-disabled w-8 shrink-0 text-[10px]">m²/s</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <InputLabel
              htmlFor={`espesor-${solucion.id}`}
              label="Espesor"
              sub="e"
              help="Espesor de la lámina [mm]. Para la vía lámina-tipo debe ser ≥ 2 mm (art. 3.2)."
              refText="DB-HS6 art. 3.2 (≥ 2 mm)"
            />
            <div className="flex w-32 shrink-0 items-center gap-1.5">
              <div className="flex-1">
                <NumberInput
                  id={`espesor-${solucion.id}`}
                  value={solucion.espesor_mm ?? Number.NaN}
                  onChange={(v) =>
                    onPatch({ espesor_mm: Number.isFinite(v) ? v : undefined })
                  }
                  min={0}
                  step={0.5}
                />
              </div>
              <span className="text-text-disabled w-8 shrink-0 text-[11px]">mm</span>
            </div>
          </div>
        </>
      )}

      <CheckRow
        id={`continuidad-${solucion.id}`}
        label="Continuidad sellada"
        help="La barrera forma una capa CONTINUA y SELLADA en toda su superficie (art. 3.2)."
        refText="DB-HS6 art. 3.2"
        checked={solucion.continuidadSellada}
        onChange={(v) => onPatch({ continuidadSellada: v })}
      />
      <CheckRow
        id={`penetraciones-${solucion.id}`}
        label="Penetraciones selladas"
        help="Las penetraciones (tuberías, juntas, arquetas) que atraviesan la barrera están selladas (art. 3.2)."
        refText="DB-HS6 art. 3.2"
        checked={solucion.penetracionesSelladas}
        onChange={(v) => onPatch({ penetracionesSelladas: v })}
      />
      <CheckRow
        id={`puertas-${solucion.id}`}
        label="Puertas estancas"
        help="Las puertas de comunicación con el espacio protegido son estancas (art. 3.2)."
        refText="DB-HS6 art. 3.2"
        checked={solucion.puertasEstancas}
        onChange={(v) => onPatch({ puertasEstancas: v })}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Campos de un ESPACIO DE CONTENCIÓN ventilado (art. 3.2): tipo de ventilación +
// perímetro + (solo natural) área de aberturas + altura de cámara. El motor exige,
// para natural, área ≥ 10 cm²/ml · perímetro y altura ≥ 50 mm; mecánica remite a HS3.
// -----------------------------------------------------------------------------
function EspacioContencionFields({
  solucion,
  onPatch,
}: {
  solucion: SolucionEspacioContencionInput;
  onPatch: (patch: Partial<SolucionEspacioContencionInput>) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-3">
        <InputLabel
          htmlFor={`vent-${solucion.id}`}
          label="Ventilación"
          help="Tipo de ventilación de la cámara. «Natural» se verifica por el criterio geométrico (área de aberturas ≥ 10 cm²/ml de perímetro). «Mecánica» remite el dimensionado del caudal a DB-HS3 §3.2.1 (fuera de este módulo)."
          refText="DB-HS6 art. 3.2"
        />
        <div className="w-44 shrink-0">
          <SelectInput<TipoVentilacionContencion>
            id={`vent-${solucion.id}`}
            value={solucion.ventilacion}
            options={VENTILACION_OPTIONS}
            onChange={(v) => onPatch({ ventilacion: v })}
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <InputLabel
          htmlFor={`perimetro-${solucion.id}`}
          label="Perímetro"
          sub="p"
          help="Perímetro de la cámara de contención [m]. Fija el área de aberturas exigida en ventilación natural (10 cm²/ml · perímetro, art. 3.2)."
          refText="DB-HS6 art. 3.2"
        />
        <div className="flex w-32 shrink-0 items-center gap-1.5">
          <div className="flex-1">
            <NumberInput
              id={`perimetro-${solucion.id}`}
              value={solucion.perimetro_m}
              onChange={(v) => onPatch({ perimetro_m: v })}
              min={0}
              step={1}
            />
          </div>
          <span className="text-text-disabled w-8 shrink-0 text-[11px]">m</span>
        </div>
      </div>

      {solucion.ventilacion === "natural" && (
        <div className="mt-2 flex items-center justify-between gap-3">
          <InputLabel
            htmlFor={`area-${solucion.id}`}
            label="Aberturas"
            sub="A"
            help="Área TOTAL de aberturas de ventilación de la cámara [cm²]. En ventilación natural debe alcanzar 10 cm²/ml · perímetro (art. 3.2)."
            refText="DB-HS6 art. 3.2 (≥ 10 cm²/ml)"
          />
          <div className="flex w-32 shrink-0 items-center gap-1.5">
            <div className="flex-1">
              <NumberInput
                id={`area-${solucion.id}`}
                value={solucion.areaAberturas_cm2 ?? Number.NaN}
                onChange={(v) =>
                  onPatch({ areaAberturas_cm2: Number.isFinite(v) ? v : undefined })
                }
                min={0}
                step={10}
              />
            </div>
            <span className="text-text-disabled w-8 shrink-0 text-[11px]">cm²</span>
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center justify-between gap-3">
        <InputLabel
          htmlFor={`altura-${solucion.id}`}
          label="Altura cámara"
          sub="h"
          help="Altura libre de la cámara [mm]. Mínimo recomendado ≥ 50 mm (art. 3.2). Si se deja vacío, el motor lo trata como informativo (no descalifica la medida)."
          refText="DB-HS6 art. 3.2 (≥ 50 mm)"
        />
        <div className="flex w-32 shrink-0 items-center gap-1.5">
          <div className="flex-1">
            <NumberInput
              id={`altura-${solucion.id}`}
              value={solucion.alturaCamara_mm ?? Number.NaN}
              onChange={(v) =>
                onPatch({ alturaCamara_mm: Number.isFinite(v) ? v : undefined })
              }
              min={0}
              step={5}
            />
          </div>
          <span className="text-text-disabled w-8 shrink-0 text-[11px]">mm</span>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Campos de la DESPRESURIZACIÓN del terreno (art. 3.3) — cualitativa: presencia
// de los tres elementos del sistema (red de captación + extracción mecánica +
// geotextil). Solo válida como medida ADICIONAL en Zona II.
// -----------------------------------------------------------------------------
function DespresurizacionFields({
  solucion,
  onPatch,
}: {
  solucion: SolucionDespresurizacionInput;
  onPatch: (patch: Partial<SolucionDespresurizacionInput>) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <CheckRow
        id={`captacion-${solucion.id}`}
        label="Red de captación"
        help="Red de captación embebida en relleno de áridos (grava) bajo la solera (art. 3.3)."
        refText="DB-HS6 art. 3.3"
        checked={solucion.redCaptacion}
        onChange={(v) => onPatch({ redCaptacion: v })}
      />
      <CheckRow
        id={`extraccion-${solucion.id}`}
        label="Extracción mecánica"
        help="Sistema de extracción mecánica conectado a la red de captación (art. 3.3)."
        refText="DB-HS6 art. 3.3"
        checked={solucion.extraccionMecanica}
        onChange={(v) => onPatch({ extraccionMecanica: v })}
      />
      <CheckRow
        id={`geotextil-${solucion.id}`}
        label="Geotextil"
        help="Geotextil de separación entre el relleno granular y el terreno (art. 3.3)."
        refText="DB-HS6 art. 3.3"
        checked={solucion.geotextil}
        onChange={(v) => onPatch({ geotextil: v })}
      />
    </div>
  );
}

// -----------------------------------------------------------------------------
// Tabla de resultados ACCESIBLE (WCAG: el dato SIEMPRE en texto/tabla, no solo en
// el SVG). Resumen de exigencia (zona, nivel de referencia, medidas válidas/mín,
// combinación suficiente) + una fila por medida con su estado/motivo + los avisos
// del motor. Cada verificación lleva su etiqueta textual (no solo color, WCAG 1.4.1).
// -----------------------------------------------------------------------------
function ResultsTable({ result }: { result: HS6Result }) {
  return (
    <div className="max-w-3xl">
      <div className="text-text-disabled mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
        Verificación por medida
      </div>
      {result.porMedida.length === 0 ? (
        <p className="text-text-disabled text-[12px] leading-snug">
          No hay soluciones propuestas que verificar.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-text-disabled border-border-sub border-b text-left text-[11px] uppercase">
                <th scope="col" className="py-1.5 font-medium">Medida</th>
                <th scope="col" className="py-1.5 text-center font-medium">Cuenta</th>
                <th scope="col" className="py-1.5 text-right font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {result.porMedida.map((m) => (
                <MedidaResultRow key={m.id} m={m} critico={m.id === result.elementoCriticoId} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-text-disabled mt-5 mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
        Resumen
      </div>
      <dl className="max-w-2xl text-[13px]">
        <SummaryRow
          k="Zona de radón"
          v={`Zona ${result.zona}`}
          sub={result.aplica ? "indexa el nivel de protección" : "sin exigencia HS6"}
        />
        <SummaryRow
          k="Nivel de referencia"
          v={`≤ ${fmt(result.nivelReferencia_Bq_m3, "Bq/m³", 0)}`}
          sub="concentración media anual (art. 2)"
        />
        <SummaryRow
          k="Nivel de protección exigido"
          v={
            result.aplica
              ? `${result.nMedidasMin} medida(s)${
                  result.barreraObligatoria ? " · barrera obligatoria" : ""
                }`
              : "Sin exigencia"
          }
          sub={result.aplica ? "art. 3.1" : result.motivoNoAplica ?? undefined}
        />
        {result.aplica && (
          <SummaryRow
            k="Combinación propuesta"
            v={`${result.nMedidasValidas} válida(s) de ${result.nMedidasMin} exigida(s)`}
            sub={result.combinacionSuficiente ? "suficiente" : "INSUFICIENTE"}
            estado={result.combinacionSuficiente ? "ok" : "fail"}
          />
        )}
        <SummaryRow
          k="Veredicto global"
          v={STATUS_LABEL[result.veredictoGlobal]}
          estado={result.veredictoGlobal}
        />
      </dl>

      {result.elementoCritico && (
        <div className="mt-3">
          <div className="text-text-disabled mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
            Elemento crítico
          </div>
          <p className="text-state-fail text-[12px] leading-snug">{result.elementoCritico}</p>
        </div>
      )}

      {/* Zona de ALCANCE Y SUPUESTOS: limitaciones agrupadas tras el resumen. */}
      <div className="mt-5">
        <div className="text-text-disabled mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
          Alcance y supuestos
        </div>
        <DisclosureNote>
          <span className="font-semibold">Predimensionado de Nivel A:</span> este módulo clasifica
          por zona, comprueba la adecuación de la combinación de soluciones a la exigencia de la zona
          y el checklist cualitativo/geométrico de cada medida. NO calcula la concentración de radón
          resultante (eso exigiría un modelo de transporte) ni sustituye una medición en el local
          terminado.
        </DisclosureNote>
        <DisclosureNote>
          <span className="font-semibold">Barrera por cálculo (Nivel B):</span> el sub-cálculo de la
          barrera por difusión (E &lt; Elim) está DIFERIDO (la fórmula diverge entre fuentes y no
          está verificada literalmente). Solo se soporta la vía «lámina-tipo» (coef. difusión ≤
          1e-11 m²/s y espesor ≥ 2 mm).
        </DisclosureNote>
        <p className="text-text-disabled text-[11px] leading-snug">
          Los umbrales cuantitativos de la vía simplificada (lámina-tipo, ventilación natural, altura
          de cámara) están transcritos por triangulación y pendientes de auditoría literal del PDF
          maquetado. La estructura de la exigencia (ámbito art. 1, nivel de referencia art. 2,
          niveles por zona art. 3.1 y zonas del Apéndice B) es de confianza alta.
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

// -----------------------------------------------------------------------------
// Fila de la tabla de verificación por medida. Nombre + tipo, si CUENTA como
// medida válida (texto, no solo color), su estado (etiqueta textual + color), y su
// motivo bajo el nombre. La medida crítica se marca «◆ crítica» (no solo color).
// -----------------------------------------------------------------------------
function MedidaResultRow({ m, critico }: { m: ResultadoMedidaHS6; critico: boolean }) {
  return (
    <tr className="border-border-sub border-b align-top">
      <td className="text-text-secondary py-1.5">
        <span className="text-text-primary">{m.nombre}</span>{" "}
        <span className="text-text-disabled text-[11px]">({TIPO_SOLUCION_LABEL[m.tipo]})</span>
        {critico && (
          <span className="text-state-fail ml-1 text-[11px] font-semibold">◆ crítica</span>
        )}
        <span className="text-text-disabled mt-0.5 block text-[11px] leading-snug">{m.motivo}</span>
      </td>
      <td className="py-1.5 text-center">
        {m.cuenta ? (
          <span className="text-state-ok text-[12px] font-semibold">Sí</span>
        ) : (
          <span className="text-text-disabled text-[12px]">No</span>
        )}
      </td>
      <td className={`py-1.5 text-right font-semibold ${STATE_TEXT[m.estado]}`}>
        {ESTADO_LABEL[m.estado]}
      </td>
    </tr>
  );
}

function SummaryRow({
  k,
  v,
  sub,
  estado,
}: {
  k: string;
  v: string;
  sub?: string;
  estado?: HS6Result["veredictoGlobal"];
}) {
  return (
    <div className="border-border-sub flex items-baseline justify-between gap-3 border-b py-1.5">
      <dt className="text-text-secondary">{k}</dt>
      <dd className="flex items-baseline gap-2">
        <span
          className={`tabular-nums ${estado ? `font-semibold ${STATE_TEXT[estado]}` : "text-text-primary"}`}
        >
          {v}
        </span>
        {sub && <span className="text-text-disabled text-[11px]">{sub}</span>}
      </dd>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Nota de alcance/limitación VISIBLE. Banner discreto pero no escondido: tinte
// neutral + icono + texto. Accesible: `role="note"` y el icono es decorativo
// (`aria-hidden`) porque el texto ya lo dice todo (no solo color).
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
