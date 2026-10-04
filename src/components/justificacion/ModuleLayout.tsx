import { useContext, useEffect, useId, useState } from "react";
import type { JSX, ReactNode } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Topbar } from "../layout/Topbar";
import { useDrawer } from "../layout/AppShell";
import { getJustificacion } from "../../data/justificacionRegistry";
import { ProyectoContext } from "../../lib/proyecto/ProyectoContext";
import type { JustificacionKey, Veredicto } from "../../lib/proyecto/tipos";
import type { PdfResult } from "../../lib/pdf/utils";
import type { MemoriaDoc } from "../../lib/cte/presentacion";
import { DelProyecto } from "./DelProyecto";
import { MemoriaTexto } from "./MemoriaTexto";
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
  /**
   * La frase de la cabecera ya redactada (feature-14). Si está, sustituye a
   * «sujeto (contexto) · métricas»; esos siguen alimentando la caché del panel.
   */
  frase?: string;
}

/**
 * Un aviso con identidad (feature-14, REDISENO-V4 §3.4): se puede ver en el
 * dibujo y marcar como revisado. Revisado, deja de contar como pendiente.
 */
export interface AvisoModulo {
  id: string;
  /** Lo que pasa, en negrita: «El garaje queda por debajo del alcantarillado.» */
  titulo: string;
  detalle: string;
  revisado: boolean;
  /** «Ver en el dibujo»: selecciona el elemento y vuelve a Esquema. */
  onVer?: () => void;
  /** «Marcar como revisado» / «Deshacer». */
  onRevisar?: (revisado: boolean) => void;
  /** Un enlace propio («Indicarla en Datos de la obra»). */
  accion?: ReactNode;
  /** Texto del botón de revisar (por defecto «Marcar como revisado»): «Ya está confirmada». */
  etiquetaRevisar?: string;
  /** Lo que dice la fila una vez revisado (por defecto, el título). */
  textoRevisado?: string;
}

/**
 * Algo que no cumple, a lo ancho y en rojo (feature-15): con «Ver en el dibujo»
 * y, si lo hay, el cambio que lo arregla («Añadir grupo de presión»).
 */
export interface IncumplimientoModulo {
  id: string;
  titulo: string;
  detalle: string;
  onVer?: () => void;
  accion?: { etiqueta: string; onClick: () => void };
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
  /** Avisos: texto del motor, o avisos con identidad que se revisan (feature-14). */
  avisos?: (string | AvisoModulo)[];
  /** Errores que impiden calcular o que no cumplen: barra roja. */
  errores?: string[];
  /** Lo que no cumple, con «Ver en el dibujo» y el cambio que lo arregla (feature-15). */
  incumplimientos?: IncumplimientoModulo[];
  /** Lo que se introduce en la columna izquierda, bajo «Del proyecto». */
  entradas?: ReactNode;
  /**
   * «Qué entra» (feature-14): arriba de la columna izquierda, en lugar de «Del
   * proyecto», en los módulos que ya leen El edificio.
   */
  queEntra?: ReactNode;
  /** La columna izquierda también en Comprobaciones (lista estrecha, feature-14). */
  comprobacionesConColumna?: boolean;
  /** Cuántas comprobaciones hay: la cabecera lo dice cuando no queda nada por revisar. */
  totalComprobaciones?: number;
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
  /**
   * La pestaña Memoria: la ficha PDF (`generar`) o, desde feature-14, el texto
   * redactado (`texto`), con la ficha a un clic.
   */
  memoria?:
    | { generar: () => Promise<PdfResult>; valid: boolean }
    | { texto: MemoriaDoc; textoPlano: string; onFichaPdf?: () => void };
  /** Vista controlada desde el módulo («Ver en el dibujo» vuelve a Esquema). */
  vista?: VistaModulo;
  onVista?: (v: VistaModulo) => void;
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

export function Avisos({
  avisos,
  errores,
  incumplimientos = [],
}: {
  avisos: (string | AvisoModulo)[];
  errores: string[];
  incumplimientos?: IncumplimientoModulo[];
}): JSX.Element | null {
  const [todos, setTodos] = useState(false);
  const listaId = useId();
  const textos = avisos.filter((a): a is string => typeof a === "string");
  const conId = avisos.filter((a): a is AvisoModulo => typeof a !== "string");
  if (avisos.length === 0 && errores.length === 0 && incumplimientos.length === 0) return null;
  const visibles = todos ? textos : textos.slice(0, AVISOS_VISIBLES);
  const ocultos = textos.length - visibles.length;

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
      {incumplimientos.map((k) => (
        <div
          key={k.id}
          role="status"
          className="border-state-fail/35 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 border-b bg-[color-mix(in_srgb,var(--color-state-fail)_5%,var(--color-bg-primary))] px-6 py-2 text-[12.5px]"
        >
          <span className="text-state-fail flex shrink-0 items-center gap-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
            <XCircle size={12} aria-hidden="true" />
            No cumple
          </span>
          <span className="text-text-secondary min-w-0 flex-[1_1_380px] leading-snug">
            <b className="text-text-primary font-semibold">{k.titulo}</b> {k.detalle}
          </span>
          <span className="flex min-w-0 flex-wrap items-center gap-1.5">
            {k.onVer && (
              <button
                type="button"
                onClick={k.onVer}
                className="border-border-main bg-bg-primary text-text-secondary hover:text-text-primary h-7 rounded border px-2.5 text-[12px]"
              >
                Ver en el dibujo
              </button>
            )}
            {k.accion && (
              <button
                type="button"
                onClick={k.accion.onClick}
                className="border-accent/50 bg-tint-accent text-accent h-7 rounded border px-2.5 text-[12px] font-medium"
              >
                {k.accion.etiqueta}
              </button>
            )}
          </span>
        </div>
      ))}
      {conId.map((a) =>
        a.revisado ? (
          <div
            key={a.id}
            className="border-border-sub bg-bg-primary text-text-disabled flex flex-wrap items-center gap-x-3.5 gap-y-1.5 border-b px-6 py-2 text-[12.5px]"
          >
            <span className="text-state-ok flex shrink-0 items-center gap-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
              <CheckCircle2 size={12} aria-hidden="true" />
              Revisado
            </span>
            <span className="min-w-0 flex-1 leading-snug">{a.textoRevisado ?? a.titulo}</span>
            {a.onRevisar && (
              <button
                type="button"
                onClick={() => a.onRevisar?.(false)}
                className="text-accent hover:text-accent-hover text-[12px]"
              >
                Deshacer
              </button>
            )}
          </div>
        ) : (
          <div
            key={a.id}
            role="status"
            className="border-state-warn/35 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 border-b bg-[color-mix(in_srgb,var(--color-state-warn)_6%,var(--color-bg-primary))] px-6 py-2 text-[12.5px]"
          >
            <span className="text-state-warn flex shrink-0 items-center gap-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
              <AlertTriangle size={12} aria-hidden="true" />
              Por revisar
            </span>
            <span className="text-text-secondary min-w-0 flex-[1_1_380px] leading-snug">
              <b className="text-text-primary font-semibold">{a.titulo}</b> {a.detalle}
            </span>
            <span className="flex min-w-0 flex-wrap items-center gap-1.5">
              {a.accion}
              {a.onVer && (
                <button
                  type="button"
                  onClick={a.onVer}
                  className="border-border-main bg-bg-primary text-text-secondary hover:text-text-primary h-7 rounded border px-2.5 text-[12px]"
                >
                  Ver en el dibujo
                </button>
              )}
              {a.onRevisar && (
                <button
                  type="button"
                  onClick={() => a.onRevisar?.(true)}
                  className="border-accent/50 bg-tint-accent text-accent h-7 rounded border px-2.5 text-[12px] font-medium"
                >
                  {a.etiquetaRevisar ?? "Marcar como revisado"}
                </button>
              )}
            </span>
          </div>
        ),
      )}
      {textos.length > 0 && (
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
          {textos.length > AVISOS_VISIBLES && (
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
  incumplimientos = [],
  entradas,
  queEntra,
  comprobacionesConColumna = false,
  totalComprobaciones,
  dibujo,
  comprobaciones,
  memoria,
  vista: vistaControlada,
  onVista,
  children,
}: ModuleLayoutProps): JSX.Element {
  const { openDrawer } = useDrawer();
  // Tolerante a la ausencia de proyecto (sandbox _smoke): useContext directo,
  // NUNCA useProyecto() (que lanza fuera del provider).
  const ctx = useContext(ProyectoContext);
  const entry = getJustificacion(justificacionKey);
  const [vistaLocal, setVistaLocal] = useState<VistaModulo>("esquema");
  const vista = vistaControlada ?? vistaLocal;
  const setVista = (v: VistaModulo) => {
    setVistaLocal(v);
    onVista?.(v);
  };
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
  const porRevisar = avisos.filter((a) => typeof a === "string" || !a.revisado).length;
  const pistas = vista === "memoria" ? [] : avisos;

  // En móvil las zonas se apilan con el dibujo (o la lista) primero: lo
  // principal arriba; lo que se introduce, debajo.
  const columnaIzquierda = (
    <div className="scroll-hide border-border-main min-w-0 shrink-0 px-5 pb-6 max-lg:order-last max-lg:border-t lg:w-[300px] lg:shrink-0 lg:overflow-y-auto lg:border-r xl:w-[320px]">
      {queEntra ??
        (ctx?.proyecto && (
          <DelProyecto proyectoId={ctx.proyecto.id} herencia={herencia} />
        ))}
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
              {porRevisar > 0 ? (
                <span className="text-state-warn text-[12.5px] font-medium">
                  {porRevisar === 1
                    ? "1 cosa por revisar"
                    : `${porRevisar} cosas por revisar`}
                </span>
              ) : (
                totalComprobaciones !== undefined &&
                resultado && (
                  <span className="text-text-disabled text-[12.5px]">
                    {totalComprobaciones} comprobaciones
                    {avisos.length > 0 ? " · todo revisado" : ""}
                  </span>
                )
              )}
            </div>
            <p className="text-text-secondary max-w-[880px] text-[13.5px] leading-snug">
              {resultado?.frase ? (
                resultado.frase
              ) : resultado ? (
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

        <Avisos
          avisos={pistas}
          errores={vista === "memoria" ? [] : errores}
          incumplimientos={vista === "memoria" ? [] : incumplimientos}
        />

        <div
          id={`${tabsId}-panel`}
          role="tabpanel"
          aria-labelledby={`${tabsId}-${vista}`}
          className="flex min-h-0 flex-1 flex-col max-lg:flex-none lg:flex-row"
        >
          {vista === "memoria" ? (
            memoria && "texto" in memoria ? (
              <MemoriaTexto doc={memoria.texto} textoPlano={memoria.textoPlano} onFichaPdf={memoria.onFichaPdf} />
            ) : memoria ? (
              <VistaMemoria generar={memoria.generar} valid={memoria.valid} />
            ) : (
              <p className="text-text-disabled p-6 text-[13px]">
                Esta justificación aún no tiene ficha.
              </p>
            )
          ) : (
            <>
              {(vista === "esquema" || comprobacionesConColumna) && columnaIzquierda}
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
