import { useContext, useEffect, useId, useState } from "react";
import type { JSX, ReactNode } from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import { Topbar } from "../layout/Topbar";
import { useDrawer } from "../layout/AppShell";
import { getJustificacion } from "../../data/justificacionRegistry";
import { ProyectoContext } from "../../lib/proyecto/ProyectoContext";
import type { JustificacionKey, Veredicto } from "../../lib/proyecto/tipos";
import type { PdfResult } from "../../lib/pdf/utils";
import { DelProyecto } from "./DelProyecto";
import { VistaMemoria } from "./VistaMemoria";

// =============================================================================
// ModuleLayout — anatomía v4 de una justificación (REDISENO-V4 §3.3). Sustituye
// a ModuleShell + BarraContexto + BandaVeredicto.
//
//   Topbar ─ grupo / módulo · acciones
//   Cabecera ─ código, título, veredicto, «N por revisar», una frase, pestañas
//   Avisos ─ a lo ancho: lo que no cumple y lo que hay que revisar
//   Esquema ─ dos zonas: izquierda «Del proyecto» + lo que se introduce;
//             derecha el dibujo, grande, con la franja de detalle debajo
//   Comprobaciones ─ la lista de comprobaciones a todo el ancho (hoy es la
//             tabla editable de cada módulo), con la misma franja debajo
//   Memoria ─ a todo el ancho, la ficha que va al anejo
//
// El módulo decide QUÉ va en cada zona; el layout decide DÓNDE. Persiste el
// último veredicto en el proyecto (cache del dashboard y de la barra lateral).
// =============================================================================

/** Resumen del resultado del motor para la cabecera. */
export interface ResumenVeredicto {
  veredicto: Veredicto;
  /** Sujeto de la comprobación: "Red de evacuación", "Instalación de ventilación"… */
  sujeto: string;
  /** Matiz entre paréntesis tras el sujeto: "uso privado", "zona Y"… */
  contexto?: string;
  /** Métricas clave en una línea: "24 UD totales · bajante Ø90 · colector Ø110". */
  metricas?: string;
  /** Cita normativa; si falta se usa la edición del DB. */
  cita?: string;
}

/** Binding del contexto heredado del proyecto (lo produce el hook de herencia). */
export interface HerenciaBinding {
  campos: {
    campo: string;
    etiqueta: string;
    valorProyecto: unknown;
    valorActual: unknown;
    override: boolean;
    editor: {
      tipo: "number" | "select" | "boolean" | "text";
      opciones?: { valor: string; etiqueta: string }[];
      unidad?: string;
    };
  }[];
  toggleOverride(campo: string, activo: boolean): void;
  setCampo(campo: string, valor: unknown): void;
}

export type VistaModulo = "esquema" | "comprobaciones" | "memoria";

export interface ModuleLayoutProps {
  justificacionKey: JustificacionKey | "smoke";
  /** null → «Sin datos suficientes». */
  resultado: ResumenVeredicto | null;
  herencia?: HerenciaBinding;
  acciones?: {
    onExportPdf?: () => void;
    pdfExporting?: boolean;
    onShare?: () => void;
    onReset?: () => void;
  };
  /** Avisos del motor (texto): se muestran a lo ancho como «Por revisar». */
  avisos?: string[];
  /** Errores que impiden calcular o que no cumplen: barra roja. */
  errores?: string[];
  /** Lo que se introduce en la columna izquierda, bajo «Del proyecto». */
  entradas?: ReactNode;
  /** El dibujo (ya dentro de su lienzo) y su franja de detalle. */
  dibujo: {
    /** Nombre accesible de la zona: «Esquema de columna», «Esquema»… */
    titulo: string;
    /** Leyenda o controles a la derecha del título. */
    cabecera?: ReactNode;
    lienzo: ReactNode;
    franja?: ReactNode;
  };
  /** La lista de comprobaciones (pestaña Comprobaciones). */
  comprobaciones: ReactNode;
  /** Genera la ficha para la pestaña Memoria. */
  memoria?: { generar: () => Promise<PdfResult>; valid: boolean };
  /** Lo que no se ve: clon del SVG para el PDF, modal de vista previa. */
  children?: ReactNode;
}

const ETIQUETA_VEREDICTO: Record<Veredicto, string> = {
  ok: "Cumple",
  warn: "Cumple",
  fail: "No cumple",
  neutral: "Informativo",
};

const PILL: Record<Veredicto, string> = {
  ok: "bg-tint-ok text-state-ok",
  warn: "bg-tint-ok text-state-ok",
  fail: "bg-tint-fail text-state-fail",
  neutral: "bg-tint-neutral text-state-neutral",
};

/** Cuántos avisos se enseñan antes de «Ver N más». */
const AVISOS_VISIBLES = 2;

function Avisos({
  avisos,
  errores,
}: {
  avisos: string[];
  errores: string[];
}): JSX.Element | null {
  const [todos, setTodos] = useState(false);
  const listaId = useId();
  if (avisos.length === 0 && errores.length === 0) return null;
  const visibles = todos ? avisos : avisos.slice(0, AVISOS_VISIBLES);
  const ocultos = avisos.length - visibles.length;

  return (
    <div role="region" aria-label="Avisos" className="shrink-0">
      {errores.map((e, i) => (
        <div
          key={`e${i}`}
          className="border-state-fail/35 flex items-start gap-3 border-b bg-[color-mix(in_srgb,var(--color-state-fail)_5%,var(--color-bg-primary))] px-6 py-2 text-[12.5px]"
        >
          <span className="text-state-fail flex shrink-0 items-center gap-1.5 pt-px text-[10px] font-semibold tracking-[0.09em] uppercase">
            <XCircle size={12} aria-hidden="true" />
            No se puede calcular
          </span>
          <span className="text-text-secondary min-w-0 flex-1 leading-snug">
            {e}
          </span>
        </div>
      ))}
      {avisos.length > 0 && (
        <div className="border-state-warn/35 flex items-start gap-3 border-b bg-[color-mix(in_srgb,var(--color-state-warn)_6%,var(--color-bg-primary))] px-6 py-2 text-[12.5px]">
          <span className="text-state-warn flex shrink-0 items-center gap-1.5 pt-px text-[10px] font-semibold tracking-[0.09em] uppercase">
            <AlertTriangle size={12} aria-hidden="true" />
            Por revisar
          </span>
          <ul
            id={listaId}
            className="text-text-secondary min-w-0 flex-1 space-y-1 leading-snug"
          >
            {visibles.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
          {avisos.length > AVISOS_VISIBLES && (
            <button
              type="button"
              onClick={() => setTodos((t) => !t)}
              aria-expanded={todos}
              aria-controls={listaId}
              className="text-accent hover:text-accent-hover shrink-0 text-[12px]"
            >
              {todos ? "Ver menos" : `Ver ${ocultos} más`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const PESTANAS: { id: VistaModulo; label: string }[] = [
  { id: "esquema", label: "Esquema" },
  { id: "comprobaciones", label: "Comprobaciones" },
  { id: "memoria", label: "Memoria" },
];

export function ModuleLayout({
  justificacionKey,
  resultado,
  herencia,
  acciones,
  avisos = [],
  errores = [],
  entradas,
  dibujo,
  comprobaciones,
  memoria,
  children,
}: ModuleLayoutProps): JSX.Element {
  const { openDrawer } = useDrawer();
  // Tolerante a la ausencia de proyecto (sandbox _smoke): useContext directo,
  // NUNCA useProyecto() (que lanza fuera del provider).
  const ctx = useContext(ProyectoContext);
  const entry = getJustificacion(justificacionKey);
  const [vista, setVista] = useState<VistaModulo>("esquema");
  const tabsId = useId();

  // Persiste el último veredicto en el proyecto. Solo con proyecto activo y
  // nunca para la entrada de desarrollo "smoke".
  const actualizarResultado = ctx?.actualizarResultado;
  useEffect(() => {
    if (!resultado || justificacionKey === "smoke" || !actualizarResultado)
      return;
    actualizarResultado(justificacionKey, {
      veredicto: resultado.veredicto,
      resumen: resultado.metricas
        ? `${resultado.sujeto} — ${resultado.metricas}`
        : resultado.sujeto,
    });
  }, [resultado, justificacionKey, actualizarResultado]);

  const codigo = entry?.codigo ?? justificacionKey;
  const titulo = entry?.label ?? justificacionKey;
  const grupo = (entry?.grupo ?? "").replace(/\s*\(.*\)\s*$/, "");
  const cita = resultado?.cita ?? entry?.edicionDB ?? "";
  const porRevisar = avisos.length;
  const pistas = vista === "memoria" ? [] : avisos;

  // En móvil las zonas se apilan con el dibujo (o la lista) primero: lo
  // principal arriba; lo que se introduce, debajo.
  const columnaIzquierda = (
    <div className="scroll-hide border-border-main min-w-0 shrink-0 px-5 pb-6 max-lg:order-last max-lg:border-t lg:w-[300px] lg:shrink-0 lg:overflow-y-auto lg:border-r xl:w-[320px]">
      {ctx?.proyecto && (
        <DelProyecto proyectoId={ctx.proyecto.id} herencia={herencia} />
      )}
      {entradas}
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Topbar
        moduleLabel={`${codigo} · ${titulo}`}
        moduleGroup={grupo}
        onExportPdf={acciones?.onExportPdf}
        pdfExporting={acciones?.pdfExporting}
        onShare={acciones?.onShare}
        onReset={acciones?.onReset}
        onMenuOpen={openDrawer}
      />

      <div className="scroll-hide flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
        {/* Cabecera: veredicto + una frase + pestañas. */}
        <header className="border-border-main flex shrink-0 flex-wrap items-end gap-x-6 gap-y-3 border-b px-6 pt-4 pb-3.5">
          <div className="flex min-w-0 flex-[1_1_480px] flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="text-text-primary text-[20px] leading-tight font-semibold tracking-[-0.01em]">
                <span className="text-text-disabled mr-2 font-mono text-[14px] font-medium">
                  {codigo}
                </span>
                {titulo}
              </h1>
              <span
                className={`inline-flex h-6 items-center gap-1.5 rounded px-2 text-[12.5px] font-semibold ${PILL[resultado?.veredicto ?? "neutral"]}`}
              >
                <span
                  className="h-[7px] w-[7px] rounded-full bg-current"
                  aria-hidden="true"
                />
                {resultado
                  ? ETIQUETA_VEREDICTO[resultado.veredicto]
                  : "Sin datos suficientes"}
              </span>
              {porRevisar > 0 && (
                <span className="text-state-warn text-[12.5px] font-medium">
                  {porRevisar === 1
                    ? "1 cosa por revisar"
                    : `${porRevisar} cosas por revisar`}
                </span>
              )}
            </div>
            <p className="text-text-secondary max-w-[880px] text-[13.5px] leading-snug">
              {resultado ? (
                <>
                  {resultado.sujeto}
                  {resultado.contexto && ` (${resultado.contexto})`}
                  {resultado.metricas && (
                    <span className="text-text-primary font-mono text-[12.5px]">
                      {" "}
                      · {resultado.metricas}
                    </span>
                  )}
                </>
              ) : (
                "Datos insuficientes para el cálculo."
              )}
              {cita && (
                <span className="text-text-disabled font-mono text-[11px]">
                  {" "}
                  — {cita}
                </span>
              )}
            </p>
          </div>
          <div
            role="tablist"
            aria-label="Vistas de la justificación"
            className="border-border-main bg-bg-surface flex shrink-0 gap-0.5 rounded border p-0.5"
          >
            {PESTANAS.map((p) => (
              <button
                key={p.id}
                type="button"
                role="tab"
                id={`${tabsId}-${p.id}`}
                aria-selected={vista === p.id}
                aria-controls={`${tabsId}-panel`}
                onClick={() => setVista(p.id)}
                className={[
                  "h-7 rounded-[3px] px-3 text-[12.5px] transition-colors",
                  vista === p.id
                    ? "bg-bg-primary text-text-primary ring-border-main font-medium ring-1"
                    : "text-text-secondary hover:text-text-primary",
                ].join(" ")}
              >
                {p.label}
              </button>
            ))}
          </div>
        </header>

        <Avisos avisos={pistas} errores={vista === "memoria" ? [] : errores} />

        <div
          id={`${tabsId}-panel`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-${vista}`}
          className="flex min-h-0 flex-1 flex-col max-lg:flex-none lg:flex-row"
        >
          {vista === "memoria" ? (
            memoria ? (
              <VistaMemoria generar={memoria.generar} valid={memoria.valid} />
            ) : (
              <p className="text-text-disabled p-6 text-[13px]">
                Esta justificación aún no tiene ficha.
              </p>
            )
          ) : (
            <>
              {vista === "esquema" && columnaIzquierda}
              {vista === "esquema" ? (
                <aside
                  aria-label={dibujo.titulo}
                  className="flex min-h-0 min-w-0 flex-1 flex-col"
                >
                  <div className="border-border-sub flex min-h-[42px] shrink-0 flex-wrap items-center gap-x-4 gap-y-1 border-b px-5 py-2">
                    <span className="text-text-disabled font-mono text-[10.5px] tracking-[0.08em] uppercase">
                      {dibujo.titulo}
                    </span>
                    {dibujo.cabecera}
                  </div>
                  {dibujo.lienzo}
                  {dibujo.franja}
                </aside>
              ) : (
                <section
                  aria-label="Comprobaciones"
                  className="flex min-h-0 min-w-0 flex-1 flex-col"
                >
                  <div className="scroll-hide bg-bg-primary min-h-0 flex-1 px-5 pt-4 pb-6 lg:overflow-y-auto">
                    {comprobaciones}
                  </div>
                  {dibujo.franja}
                </section>
              )}
            </>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
