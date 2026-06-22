// DB-HE1 — Pantalla del módulo de ENVOLVENTE TÉRMICA. Cablea el motor (./calc),
// el render SVG (./svg) y la ficha PDF (./ficha) sobre el layout compartido
// (Topbar + panel de inputs + panel de resultados), replicando el patrón del
// módulo HS4 (listas dinámicas) pero sobre el modelo POR-ELEMENTO de HE1: un
// array de cerramientos independientes (muro, cubierta, hueco…), cada uno con un
// array ANIDADO de capas de interior a exterior. Para cada cerramiento se verifica
// la transmitancia U vs Ulim (y vs U_max_fRsi), la condensación superficial (fRsi)
// y la intersticial (Glaser de enero).
//
// React 19 + React Compiler: componente PURO. El cálculo es síncrono en render
// (useMemo sobre el estado diferido); no hay efectos de cálculo ni botón
// "calcular" (feedback inmediato). Los ids de cerramientos/capas se generan de
// forma DETERMINISTA en los handlers de evento (nunca en render, nunca con
// Math.random/Date). Las mutaciones de las listas son siempre INMUTABLES.

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
  calcHE1,
  he1Defaults,
  type CapaInput,
  type CerramientoInput,
  type HE1Inputs,
  type HE1Result,
  type ResultadoCerramientoHE1,
} from "./calc";
import {
  CONDICIONES_DEFECTO,
  LAMBDA_REFERENCIA,
  type ClaseHigrometria,
  type DireccionFlujo,
  type MaterialReferencia,
  type TipoElemento,
  type ZonaClimatica,
} from "./tablas";
import { He1SVG } from "./svg";
import { HE1_PDF_SVG_ID, he1NativeSize } from "./svg-meta";
import { toFichaData } from "./ficha";

// -----------------------------------------------------------------------------
// Opciones de los selects (declaradas a módulo: estables entre renders).
// -----------------------------------------------------------------------------

// Zona climática de INVIERNO (Apéndice B del DB-HE): indexa Ulim y fRsi,min.
const ZONA_OPTIONS: { value: ZonaClimatica; label: string }[] = [
  { value: "α", label: "α (Canarias)" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
];

// Clase de higrometría del espacio interior (EN ISO 13788, recogida en DA DB-HE/2).
const CLASE_HIGROMETRIA_OPTIONS: { value: ClaseHigrometria; label: string }[] = [
  { value: "clase_3_o_inferior", label: "Clase ≤ 3 — residencial (HR 55 %)" },
  { value: "clase_4", label: "Clase 4 — alta humedad (HR 62 %)" },
  { value: "clase_5", label: "Clase 5 — gran humedad (HR 70 %)" },
];

const TIPO_ELEMENTO_OPTIONS: { value: TipoElemento; label: string }[] = [
  { value: "muro_suelo_exterior", label: "Muro / suelo exterior (UM, US)" },
  { value: "cubierta_exterior", label: "Cubierta exterior (UC)" },
  { value: "contacto_no_habitable_terreno", label: "Contacto no habitable / terreno (UT)" },
  { value: "hueco", label: "Hueco (UH)" },
  { value: "puerta", label: "Puerta" },
  { value: "medianeria", label: "Medianería / partición (UMD)" },
];

const TIPO_ELEMENTO_LABEL: Record<TipoElemento, string> = Object.fromEntries(
  TIPO_ELEMENTO_OPTIONS.map((o) => [o.value, o.label]),
) as Record<TipoElemento, string>;

const DIRECCION_FLUJO_OPTIONS: { value: DireccionFlujo; label: string }[] = [
  { value: "horizontal", label: "Horizontal (muro vertical)" },
  { value: "ascendente", label: "Ascendente (cubierta / techo)" },
  { value: "descendente", label: "Descendente (suelo)" },
];

// Sentinela para "sin material" en el select de capa (R directa / λ explícita).
const MATERIAL_NINGUNO = "";

// Opciones de material de capa = claves de LAMBDA_REFERENCIA (CEC, orientativas).
// La primera opción ("—") permite una capa SIN material (cámara con R directa,
// barrera de vapor con Sd, o λ declarada por el usuario).
const MATERIAL_OPTIONS: { value: string; label: string }[] = [
  { value: MATERIAL_NINGUNO, label: "— (R directa / λ manual)" },
  ...(Object.keys(LAMBDA_REFERENCIA.datos.lambda_W_mK) as MaterialReferencia[]).map((k) => ({
    value: k,
    label: LAMBDA_REFERENCIA.datos.lambda_W_mK[k].descripcion,
  })),
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

export function He1Module(): JSX.Element {
  const { state, setField, reset } = useModuleState<HE1Inputs>("he1", he1Defaults);
  const { openDrawer } = useDrawer();
  const [tab, setTab] = useState<MobileTab>("inputs");

  const deferredState = useDeferredValue(state);
  const result = useMemo(() => calcHE1(deferredState), [deferredState]);

  // ── Validación de entrada (pragmática, como hs4) ───────────────────────────
  // Al menos un cerramiento con ≥1 capa; todos los espesores finitos ≥ 0; y las
  // condiciones de cálculo (si se dan) finitas. El motor degrada el resto a warn.
  const condFinitas =
    (state.tempInterior_C === undefined || Number.isFinite(state.tempInterior_C)) &&
    (state.hrInterior_pct === undefined || Number.isFinite(state.hrInterior_pct)) &&
    (state.tempExteriorEnero_C === undefined || Number.isFinite(state.tempExteriorEnero_C)) &&
    (state.hrExterior_pct === undefined || Number.isFinite(state.hrExterior_pct));
  const valid =
    state.cerramientos.length >= 1 &&
    state.cerramientos.every(
      (c) => c.capas.length >= 1 && c.capas.every((k) => Number.isFinite(k.espesor_m) && k.espesor_m >= 0),
    ) &&
    condFinitas;

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

  // ── Mutaciones inmutables de la lista de cerramientos ──────────────────────
  const addCerramiento = () => {
    const id = nextId(state.cerramientos, "cer-");
    const nuevo: CerramientoInput = {
      id,
      nombre: `Cerramiento ${state.cerramientos.length + 1}`,
      tipoElemento: "muro_suelo_exterior",
      direccionFlujo: "horizontal",
      capas: [
        { id: `${id}-cap-1`, material: "ladrillo_ceramico_perforado", espesor_m: 0.115 },
      ],
    };
    setField("cerramientos", [...state.cerramientos, nuevo]);
  };

  const removeCerramiento = (id: string) => {
    setField(
      "cerramientos",
      state.cerramientos.filter((c) => c.id !== id),
    );
  };

  const patchCerramiento = (id: string, patch: Partial<CerramientoInput>) => {
    setField(
      "cerramientos",
      state.cerramientos.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  };

  // ── Mutaciones inmutables de las CAPAS de un cerramiento (array anidado) ───
  const addCapa = (cerId: string) => {
    setField(
      "cerramientos",
      state.cerramientos.map((c) => {
        if (c.id !== cerId) return c;
        const capaId = nextId(
          c.capas.map((k) => ({ id: k.id })),
          `${cerId}-cap-`,
        );
        const nueva: CapaInput = { id: capaId, material: "xps", espesor_m: 0.04 };
        return { ...c, capas: [...c.capas, nueva] };
      }),
    );
  };

  const removeCapa = (cerId: string, capaId: string) => {
    setField(
      "cerramientos",
      state.cerramientos.map((c) =>
        c.id === cerId ? { ...c, capas: c.capas.filter((k) => k.id !== capaId) } : c,
      ),
    );
  };

  const patchCapa = (cerId: string, capaId: string, patch: Partial<CapaInput>) => {
    setField(
      "cerramientos",
      state.cerramientos.map((c) =>
        c.id === cerId
          ? { ...c, capas: c.capas.map((k) => (k.id === capaId ? { ...k, ...patch } : k)) }
          : c,
      ),
    );
  };

  // ── Lienzo responsive: ancho fluido + proporción del tamaño nativo del SVG ─
  const [canvasRef, canvasWidth] = useContainerWidth();
  const { nativeW, nativeH } = he1NativeSize(result);
  const svgW =
    canvasWidth !== undefined && canvasWidth > 0
      ? Math.min(720, Math.max(320, canvasWidth - 32))
      : 540;
  const svgH = Math.round((svgW * nativeH) / nativeW);

  // Defaults del DA DB-HE/2 para los placeholders de condiciones interiores.
  const cd = CONDICIONES_DEFECTO.datos;
  const tempInteriorDefault = cd.tempInterior_C;
  const hrInteriorDefault = cd.hrInterior_pct[state.claseHigrometria];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Topbar
        moduleLabel="HE1 Envolvente"
        moduleGroup="Ahorro de energía (DB-HE) · demanda energética"
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
            <CollapsibleSection label="Zona y ambiente" refNorma="DB-HE1 Tabla 3.1.1.a / DA DB-HE/2">
              <Field
                id="zona-climatica"
                label="Zona climática"
                sub="inv."
                help="Zona climática de INVIERNO del municipio (Apéndice B del DB-HE). Indexa el límite de transmitancia Ulim (Tabla 3.1.1.a-HE1) y el fRsi,min de condensación superficial (Tabla 1 DA DB-HE/2). Es un dato climático de entrada, no se calcula."
                refText="DB-HE Apéndice B"
              >
                <SelectInput<ZonaClimatica>
                  id="zona-climatica"
                  value={state.zonaClimatica}
                  options={ZONA_OPTIONS}
                  onChange={(v) => setField("zonaClimatica", v)}
                />
              </Field>
              <Field
                id="clase-higrometria"
                label="Higrometría"
                help="Clase de higrometría del espacio interior (EN ISO 13788, recogida en el DA DB-HE/2). Las viviendas y, en general, los espacios residenciales son clase ≤ 3. Fija el fRsi,min y la HR interior de cálculo (55 / 62 / 70 %)."
                refText="DA DB-HE/2"
              >
                <SelectInput<ClaseHigrometria>
                  id="clase-higrometria"
                  value={state.claseHigrometria}
                  options={CLASE_HIGROMETRIA_OPTIONS}
                  onChange={(v) => setField("claseHigrometria", v)}
                />
              </Field>
            </CollapsibleSection>

            <CollapsibleSection label="Condiciones de cálculo" refNorma="DA DB-HE/2">
              <Field
                id="temp-interior"
                label="Temp. interior"
                sub="θi"
                unit="°C"
                help={`Temperatura interior de cálculo. Si se deja vacío, se usa el default del DA DB-HE/2 (${tempInteriorDefault} °C).`}
                refText="DA DB-HE/2 (condiciones interiores)"
              >
                <NumberInput
                  id="temp-interior"
                  value={state.tempInterior_C ?? Number.NaN}
                  onChange={(v) =>
                    setField("tempInterior_C", Number.isFinite(v) ? v : undefined)
                  }
                  step={1}
                />
              </Field>
              <Field
                id="hr-interior"
                label="HR interior"
                sub="φi"
                unit="%"
                help={`Humedad relativa interior. Si se deja vacío, la del DA DB-HE/2 por clase de higrometría (ahora ${hrInteriorDefault} %).`}
                refText="DA DB-HE/2 (condiciones interiores)"
              >
                <NumberInput
                  id="hr-interior"
                  value={state.hrInterior_pct ?? Number.NaN}
                  onChange={(v) =>
                    setField("hrInterior_pct", Number.isFinite(v) ? v : undefined)
                  }
                  min={0}
                  max={100}
                  step={1}
                />
              </Field>
              <Field
                id="temp-exterior"
                label="Temp. ext. enero"
                sub="θe"
                unit="°C"
                help="DATO CLIMÁTICO: temperatura media del mes de ENERO de la localidad (Anejo climático del DB-HE), no una constante del DA. Sin este dato no hay cálculo de condensación realista; si se omite, el motor usa un valor conservador y avisa."
                refText="DB-HE (Anejo climático) — dato de la localidad"
              >
                <NumberInput
                  id="temp-exterior"
                  value={state.tempExteriorEnero_C ?? Number.NaN}
                  onChange={(v) =>
                    setField("tempExteriorEnero_C", Number.isFinite(v) ? v : undefined)
                  }
                  step={1}
                />
              </Field>
              <Field
                id="hr-exterior"
                label="HR ext. enero"
                sub="φe"
                unit="%"
                help="DATO CLIMÁTICO: humedad relativa media del mes de ENERO de la localidad (Anejo climático del DB-HE). Si se omite, el motor usa el default informativo del DA DB-HE/2 (~85 %) y avisa."
                refText="DB-HE (Anejo climático) — dato de la localidad"
              >
                <NumberInput
                  id="hr-exterior"
                  value={state.hrExterior_pct ?? Number.NaN}
                  onChange={(v) =>
                    setField("hrExterior_pct", Number.isFinite(v) ? v : undefined)
                  }
                  min={0}
                  max={100}
                  step={1}
                />
              </Field>
            </CollapsibleSection>

            <CollapsibleSection label="Cerramientos" refNorma="DB-HE1 Tabla 3.1.1.a">
              <div className="flex flex-col gap-3">
                {state.cerramientos.map((c) => (
                  <CerramientoCard
                    key={c.id}
                    cerramiento={c}
                    onPatch={(patch) => patchCerramiento(c.id, patch)}
                    onRemove={() => removeCerramiento(c.id)}
                    canRemove={state.cerramientos.length > 1}
                    onAddCapa={() => addCapa(c.id)}
                    onRemoveCapa={(capaId) => removeCapa(c.id, capaId)}
                    onPatchCapa={(capaId, patch) => patchCapa(c.id, capaId, patch)}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={addCerramiento}
                className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary mt-3 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed py-2 text-[13px] transition-colors"
              >
                <Plus size={14} />
                Añadir cerramiento
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
              Envolvente térmica (zona {result.zonaClimatica}) —{" "}
              <span className={`font-semibold ${STATE_TEXT[result.veredictoGlobal]}`}>
                {STATUS_LABEL[result.veredictoGlobal]}
              </span>{" "}
              <span className="text-text-disabled">
                ({result.porCerramiento.length}{" "}
                {result.porCerramiento.length === 1 ? "cerramiento" : "cerramientos"} · θe{" "}
                {fmt(result.tempExteriorEnero_C, "°C", 0)} enero)
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
            <He1SVG result={result} mode="screen" width={svgW} height={svgH} />
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
          Modo 'pdf' al tamaño NATIVO del viewBox (he1NativeSize): renderFicha lo
          clona y rasteriza con scale = CW/nativeW sin deformar. */}
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div id={HE1_PDF_SVG_ID} style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <He1SVG result={result} mode="pdf" width={nativeW} height={nativeH} />
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
// Tarjeta editable de un CERRAMIENTO (lista dinámica). Cabecera con nombre + tipo
// + dirección de flujo, y la lista ANIDADA de capas (de interior a exterior). El
// tipo de elemento indexa Ulim; la dirección de flujo selecciona Rsi/Rse.
// -----------------------------------------------------------------------------
function CerramientoCard({
  cerramiento,
  onPatch,
  onRemove,
  canRemove,
  onAddCapa,
  onRemoveCapa,
  onPatchCapa,
}: {
  cerramiento: CerramientoInput;
  onPatch: (patch: Partial<CerramientoInput>) => void;
  onRemove: () => void;
  canRemove: boolean;
  onAddCapa: () => void;
  onRemoveCapa: (capaId: string) => void;
  onPatchCapa: (capaId: string, patch: Partial<CapaInput>) => void;
}) {
  const nombreId = `nombre-${cerramiento.id}`;
  return (
    <div className="border-border-sub bg-bg-primary rounded-md border p-2.5">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            id={nombreId}
            type="text"
            value={cerramiento.nombre}
            onChange={(e) => onPatch({ nombre: e.target.value })}
            aria-label="Nombre del cerramiento"
            placeholder="Nombre del cerramiento"
            className="border-border-main bg-bg-primary text-text-primary focus:border-accent focus:ring-accent/30 w-full rounded border px-2 py-1 text-[13px] font-medium transition-colors focus:ring-1 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Quitar cerramiento"
          title={canRemove ? "Quitar cerramiento" : "Debe haber al menos un cerramiento"}
          className="text-text-disabled hover:text-state-fail shrink-0 rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={15} />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <InputLabel htmlFor={`tipo-${cerramiento.id}`} label="Tipo" />
        <div className="w-44 shrink-0">
          <SelectInput<TipoElemento>
            id={`tipo-${cerramiento.id}`}
            value={cerramiento.tipoElemento}
            options={TIPO_ELEMENTO_OPTIONS}
            onChange={(v) => onPatch({ tipoElemento: v })}
          />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <InputLabel
          htmlFor={`flujo-${cerramiento.id}`}
          label="Flujo de calor"
          help="Sentido del flujo de calor en régimen de calefacción: muro vertical → horizontal; cubierta/techo (el calor sube) → ascendente; suelo (el calor baja) → descendente. Selecciona las resistencias superficiales Rsi/Rse (DA DB-HE/1)."
          refText="DA DB-HE/1 Tabla 1"
        />
        <div className="w-44 shrink-0">
          <SelectInput<DireccionFlujo>
            id={`flujo-${cerramiento.id}`}
            value={cerramiento.direccionFlujo}
            options={DIRECCION_FLUJO_OPTIONS}
            onChange={(v) => onPatch({ direccionFlujo: v })}
          />
        </div>
      </div>

      {/* Capas del cerramiento (de INTERIOR a EXTERIOR). */}
      <div className="border-border-sub mt-3 border-t pt-2">
        <div className="text-text-disabled mb-1.5 flex items-center justify-between text-[10px] font-semibold tracking-[0.07em] uppercase">
          <span>Capas (interior → exterior)</span>
        </div>
        <div className="flex flex-col gap-2">
          {cerramiento.capas.map((k, i) => (
            <CapaRow
              key={k.id}
              capa={k}
              indice={i}
              onPatch={(patch) => onPatchCapa(k.id, patch)}
              onRemove={() => onRemoveCapa(k.id)}
              canRemove={cerramiento.capas.length > 1}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onAddCapa}
          className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed py-1.5 text-[12px] transition-colors"
        >
          <Plus size={12} />
          Añadir capa
        </button>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Fila editable de una CAPA (lista anidada en un cerramiento). Material (select
// de LAMBDA_REFERENCIA que autocompleta λ), espesor en mm (se convierte a m al
// estado), y opciones avanzadas plegables: λ override, cámara/lámina con R
// directa, y µ/Sd para el método de Glaser. El espesor SIEMPRE se guarda en m.
// -----------------------------------------------------------------------------
function CapaRow({
  capa,
  indice,
  onPatch,
  onRemove,
  canRemove,
}: {
  capa: CapaInput;
  indice: number;
  onPatch: (patch: Partial<CapaInput>) => void;
  onRemove: () => void;
  canRemove: boolean;
}) {
  const [avanzado, setAvanzado] = useState(false);
  // El espesor se introduce en mm (más natural en obra) pero se almacena en m.
  const espesor_mm = Number.isFinite(capa.espesor_m) ? capa.espesor_m * 1000 : Number.NaN;
  // λ orientativa del material seleccionado (para el placeholder informativo).
  const lambdaOrientativa =
    capa.material != null ? LAMBDA_REFERENCIA.datos.lambda_W_mK[capa.material].lambda_W_mK : undefined;

  return (
    <div className="border-border-sub bg-bg-surface rounded border p-2">
      <div className="flex items-center gap-2">
        <span className="text-text-disabled w-4 shrink-0 text-center font-mono text-[11px]">
          {indice + 1}
        </span>
        <div className="flex-1">
          <SelectInput<string>
            id={`material-${capa.id}`}
            value={capa.material ?? MATERIAL_NINGUNO}
            options={MATERIAL_OPTIONS}
            onChange={(v) =>
              onPatch(
                v === MATERIAL_NINGUNO
                  ? { material: undefined }
                  : { material: v as MaterialReferencia },
              )
            }
          />
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Quitar capa"
          title={canRemove ? "Quitar capa" : "Debe haber al menos una capa"}
          className="text-text-disabled hover:text-state-fail shrink-0 rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        <InputLabel htmlFor={`espesor-${capa.id}`} label="Espesor" sub="e" />
        <div className="flex w-32 shrink-0 items-center gap-1.5">
          <div className="flex-1">
            <NumberInput
              id={`espesor-${capa.id}`}
              value={espesor_mm}
              onChange={(v) => onPatch({ espesor_m: Number.isFinite(v) ? v / 1000 : Number.NaN })}
              min={0}
              step={5}
            />
          </div>
          <span className="text-text-disabled w-8 shrink-0 text-[11px]">mm</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAvanzado((a) => !a)}
        aria-expanded={avanzado}
        className="text-text-disabled hover:text-text-secondary mt-1.5 text-[11px] transition-colors"
      >
        {avanzado ? "− Opciones avanzadas" : "+ Opciones avanzadas (λ, cámara R, µ/Sd)"}
      </button>

      {avanzado && (
        <div className="border-border-sub mt-2 flex flex-col gap-2 border-t pt-2">
          {/* λ override (prevalece sobre la tabla del material). */}
          <div className="flex items-center justify-between gap-3">
            <InputLabel
              htmlFor={`lambda-${capa.id}`}
              label="λ"
              help="Conductividad térmica de la capa [W/(m·K)]. Si se indica, PREVALECE sobre el λ orientativo del material (CEC). En proyecto real usa el λ del fabricante (marcado CE / DIT). Se ignora si la capa declara R directa."
              refText="Dato del fabricante (prevalece sobre CEC)"
            />
            <div className="flex w-32 shrink-0 items-center gap-1.5">
              <div className="flex-1">
                <NumberInput
                  id={`lambda-${capa.id}`}
                  value={capa.lambda_W_mK ?? Number.NaN}
                  onChange={(v) =>
                    onPatch({ lambda_W_mK: Number.isFinite(v) && v > 0 ? v : undefined })
                  }
                  min={0}
                  step={0.01}
                />
              </div>
              <span className="text-text-disabled w-8 shrink-0 text-[10px]">W/mK</span>
            </div>
          </div>
          {lambdaOrientativa !== undefined && capa.lambda_W_mK === undefined && (
            <p className="text-text-disabled -mt-1 text-right text-[10px]">
              orientativo CEC: λ = {fmt(lambdaOrientativa, "W/mK", 3)}
            </p>
          )}

          {/* Cámara / lámina con R directa. */}
          <div className="flex items-center justify-between gap-3">
            <InputLabel
              htmlFor={`rdirecta-${capa.id}`}
              label="R directa"
              help="Resistencia térmica DIRECTA de la capa [m²K/W]: cámara de aire sin ventilar, o lámina/conjunto (p.ej. un hueco) con R conocida. Si se indica, la capa aporta esta R y NO se usa espesor/λ para el término térmico (el espesor sigue dibujándose en la sección)."
              refText="DA DB-HE/1 Tabla 2 (cámara) / dato del producto"
            />
            <div className="flex w-32 shrink-0 items-center gap-1.5">
              <div className="flex-1">
                <NumberInput
                  id={`rdirecta-${capa.id}`}
                  value={capa.resistencia_m2K_W ?? Number.NaN}
                  onChange={(v) =>
                    onPatch({ resistencia_m2K_W: Number.isFinite(v) && v >= 0 ? v : undefined })
                  }
                  min={0}
                  step={0.05}
                />
              </div>
              <span className="text-text-disabled w-8 shrink-0 text-[10px]">m²K/W</span>
            </div>
          </div>

          {/* µ (difusión al vapor) para Glaser. */}
          <div className="flex items-center justify-between gap-3">
            <InputLabel
              htmlFor={`mu-${capa.id}`}
              label="µ"
              help="Factor de resistencia a la difusión del vapor µ (adimensional), para el método de Glaser. Si se omite, el motor usa el µ orientativo del CEC del material. Se ignora si la capa declara Sd."
              refText="DA DB-HE/2 (Glaser) / CEC"
            />
            <div className="w-32 shrink-0">
              <NumberInput
                id={`mu-${capa.id}`}
                value={capa.mu ?? Number.NaN}
                onChange={(v) => onPatch({ mu: Number.isFinite(v) && v >= 0 ? v : undefined })}
                min={0}
                step={1}
              />
            </div>
          </div>

          {/* Sd declarado (barrera de vapor / lámina). */}
          <div className="flex items-center justify-between gap-3">
            <InputLabel
              htmlFor={`sd-${capa.id}`}
              label="Sd"
              help="Espesor de aire equivalente Sd [m] (barrera de vapor / lámina con Sd declarado). Si se indica, la capa aporta este Sd al método de Glaser y NO se usa µ·e. Usa el Sd del producto."
              refText="DA DB-HE/2 (Glaser) / dato del producto"
            />
            <div className="flex w-32 shrink-0 items-center gap-1.5">
              <div className="flex-1">
                <NumberInput
                  id={`sd-${capa.id}`}
                  value={capa.sd_m ?? Number.NaN}
                  onChange={(v) => onPatch({ sd_m: Number.isFinite(v) && v >= 0 ? v : undefined })}
                  min={0}
                  step={1}
                />
              </div>
              <span className="text-text-disabled w-8 shrink-0 text-[11px]">m</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Tabla de resultados ACCESIBLE (WCAG: el dato numérico SIEMPRE en texto/tabla,
// no solo en el SVG). Por cerramiento: U vs límite (el MÁS restrictivo de Ulim y
// U_max_fRsi), fRsi vs fRsi,min y el resultado de Glaser (sin/con condensación),
// con color por `estado` (reforzado por la etiqueta textual, no solo color).
// Veredicto global resaltado y avisos del motor.
// -----------------------------------------------------------------------------
function ResultsTable({ result }: { result: HE1Result }) {
  return (
    <div className="max-w-3xl">
      <div className="text-text-disabled mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
        Verificación por cerramiento
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-text-disabled border-border-sub border-b text-left text-[11px] uppercase">
              <th scope="col" className="py-1.5 font-medium">Cerramiento</th>
              <th scope="col" className="py-1.5 text-right font-medium">U</th>
              <th scope="col" className="py-1.5 text-right font-medium">U lím.</th>
              <th scope="col" className="py-1.5 text-right font-medium">fRsi</th>
              <th scope="col" className="py-1.5 text-right font-medium">Glaser</th>
              <th scope="col" className="py-1.5 text-right font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {result.porCerramiento.map((c) => (
              <CerramientoResultRow key={c.id} c={c} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-text-disabled mt-5 mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
        Resumen
      </div>
      <dl className="max-w-2xl text-[13px]">
        <SummaryRow
          k="Zona climática de invierno"
          v={result.zonaClimatica}
          sub="indexa Ulim y fRsi,min"
        />
        <SummaryRow
          k="Condiciones de cálculo"
          v={`${fmt(result.tempInterior_C, "°C", 0)} / ${fmt(result.hrInterior_pct, "%", 0)} int.`}
          sub={`${fmt(result.tempExteriorEnero_C, "°C", 0)} / ${fmt(
            result.hrExterior_pct,
            "%",
            0,
          )} ext. (enero)`}
        />
        <SummaryRow
          k="Veredicto global"
          v={STATUS_LABEL[result.veredictoGlobal]}
          estado={result.veredictoGlobal}
        />
      </dl>

      {/* Zona de ALCANCE Y SUPUESTOS: limitaciones agrupadas tras el resumen. */}
      <div className="mt-5">
        <div className="text-text-disabled mb-1.5 text-[10px] font-semibold tracking-[0.07em] uppercase">
          Alcance y supuestos
        </div>
        <DisclosureNote>
          <span className="font-semibold">Predimensionado por elemento:</span> esta versión verifica
          cada cerramiento de forma independiente (U, condensación superficial e intersticial). NO
          sustituye el cálculo de la demanda energética del edificio completo ni una herramienta
          oficial (HULC / CE3X).
        </DisclosureNote>
        <DisclosureNote>
          <span className="font-semibold">Condensación intersticial:</span> el método de Glaser se
          evalúa para el mes de enero (más desfavorable). Una posible condensación es un AVISO para
          revisar, no un «no cumple» definitivo: requiere el balance anual de evaporación (DA DB-HE/2).
        </DisclosureNote>
        <p className="text-text-disabled text-[11px] leading-snug">
          Los valores de λ y µ autocompletados son ORIENTATIVOS (Catálogo de Elementos
          Constructivos del CTE); en proyecto real prevalecen los datos del fabricante. Los puentes
          térmicos (H_PT) son informativos: sus ψ están pendientes de verificación literal.
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
// Fila de la tabla de verificación por cerramiento. El límite de U mostrado es el
// MÁS restrictivo entre Ulim (Tabla 3.1.1.a) y U_max_fRsi (condensación
// superficial); si Ulim no aplica (medianería) se muestra solo U_max_fRsi. Cada
// verificación lleva su etiqueta textual (no solo color, WCAG 1.4.1).
// -----------------------------------------------------------------------------
function CerramientoResultRow({ c }: { c: ResultadoCerramientoHE1 }) {
  // Límite efectivo = min(Ulim, U_max_fRsi). Ulim null (medianería) → solo fRsi.
  const limiteU =
    c.ulim_W_m2K != null ? Math.min(c.ulim_W_m2K, c.uMaxFRsi_W_m2K) : c.uMaxFRsi_W_m2K;
  const uCondensa = c.glaser.condensaIntersticial;
  return (
    <tr className="border-border-sub border-b">
      <td className="text-text-secondary py-1.5">
        {c.nombre}{" "}
        <span className="text-text-disabled text-[11px]">({TIPO_ELEMENTO_LABEL[c.tipoElemento]})</span>
      </td>
      <td className="text-text-primary py-1.5 text-right tabular-nums">
        {fmt(c.u_W_m2K, "W/m²K", 3)}
      </td>
      <td className="text-text-secondary py-1.5 text-right tabular-nums">
        {c.ulim_W_m2K == null ? (
          <span className="text-text-disabled text-[11px]">no aplica</span>
        ) : (
          <>
            {fmt(limiteU, "W/m²K", 3)}
            <span className="text-text-disabled ml-1 text-[10px]">
              {c.ulim_W_m2K <= c.uMaxFRsi_W_m2K ? "(Ulim)" : "(fRsi)"}
            </span>
          </>
        )}
      </td>
      <td className="text-text-secondary py-1.5 text-right tabular-nums">
        {fmt(c.fRsi, "", 2)}
        <span className="text-text-disabled ml-1 text-[10px]">≥ {fmt(c.fRsiMin, "", 2)}</span>
      </td>
      <td className="py-1.5 text-right text-[12px]">
        {uCondensa ? (
          <span className="text-state-warn font-semibold">condensa (revisar)</span>
        ) : (
          <span className="text-text-secondary">sin condensación</span>
        )}
      </td>
      <td className={`py-1.5 text-right font-semibold ${STATE_TEXT[c.estado]}`}>
        {ESTADO_LABEL[c.estado]}
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
  estado?: HE1Result["veredictoGlobal"];
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
