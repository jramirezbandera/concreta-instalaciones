import type { JSX, ReactNode } from "react";
import type { LoUsa } from "../../lib/edificio/usos";

// =============================================================================
// Controles del editor de El edificio (feature-12): el paso a paso «− 3 +» y el
// campo numérico con unidad de las maquetas v4. El número central se puede
// escribir; se aplica al salir del campo o con Enter (no a cada tecla: la
// sección se redibuja con cada cambio y un «1» a medio teclear la descuadraría).
// =============================================================================

/** «2,85» → 2.85; vacío o no numérico → null. */
function leerNumero(txt: string): number | null {
  const limpio = txt.trim().replace(/\s/g, "").replace(",", ".");
  if (limpio === "") return null;
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

function formato(v: number, decimales: number): string {
  return decimales > 0 ? v.toFixed(decimales).replace(".", ",") : String(Math.round(v));
}

const INPUT_NUM =
  "text-text-primary min-w-0 bg-transparent text-center font-mono text-[13px] tabular-nums focus:outline-none";

/** Número escrito a mano: se confirma al salir o con Enter; Escape lo deshace. */
function NumeroEditable(props: {
  id?: string;
  value: number;
  decimales: number;
  onCommit: (v: number) => void;
  className: string;
  ariaLabel?: string;
}): JSX.Element {
  const { id, value, decimales, onCommit, className, ariaLabel } = props;
  const texto = formato(value, decimales);
  return (
    <input
      // La clave reinicia el borrador cuando el valor cambia desde fuera.
      key={texto}
      id={id}
      type="text"
      inputMode={decimales > 0 ? "decimal" : "numeric"}
      defaultValue={texto}
      aria-label={ariaLabel}
      onBlur={(e) => {
        const n = leerNumero(e.currentTarget.value);
        if (n === null) e.currentTarget.value = texto;
        else if (n !== value) onCommit(n);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.blur();
        if (e.key === "Escape") {
          e.currentTarget.value = texto;
          e.currentTarget.blur();
        }
      }}
      className={className}
    />
  );
}

/** «− 3 +» con el número editable en medio. */
export function PasoAPaso(props: {
  id: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  paso?: number;
  decimales?: number;
  unidad?: string;
  /** Qué se cuenta, para los nombres accesibles de los botones («Plantas iguales»). */
  nombre: string;
}): JSX.Element {
  const { id, value, onChange, min, max, paso = 1, decimales = 0, unidad, nombre } = props;
  const acotar = (v: number) => Math.min(max, Math.max(min, Math.round(v * 100) / 100));
  const boton =
    "bg-bg-surface text-text-secondary hover:text-text-primary w-8 shrink-0 text-[16px] leading-none transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div className="border-border-main bg-bg-primary inline-flex h-8 items-stretch overflow-hidden rounded border">
      <button
        type="button"
        aria-label={`${nombre}: menos`}
        disabled={value <= min}
        onClick={() => onChange(acotar(value - paso))}
        className={boton}
      >
        −
      </button>
      <span className="border-border-main flex w-[88px] items-center justify-center gap-1 border-x px-1.5">
        <NumeroEditable
          id={id}
          value={value}
          decimales={decimales}
          onCommit={(v) => onChange(acotar(v))}
          className={`${INPUT_NUM} w-full`}
        />
        {unidad && <small className="text-text-disabled text-[10.5px]">{unidad}</small>}
      </span>
      <button
        type="button"
        aria-label={`${nombre}: más`}
        disabled={value >= max}
        onClick={() => onChange(acotar(value + paso))}
        className={boton}
      >
        +
      </button>
    </div>
  );
}

/** Campo numérico con su unidad a la derecha («158 | m²»). */
export function CampoNumero(props: {
  id: string;
  value: number;
  onChange: (v: number) => void;
  unidad: string;
  decimales?: number;
  /** Nombre accesible cuando no hay un `<label>` que lo nombre (feature-22). */
  etiqueta?: string;
}): JSX.Element {
  const { id, value, onChange, unidad, decimales = 0, etiqueta } = props;
  return (
    <span className="inline-flex h-8 items-stretch">
      <NumeroEditable
        id={id}
        value={value}
        decimales={decimales}
        onCommit={(v) => onChange(Math.max(0, v))}
        ariaLabel={etiqueta}
        className="border-border-main bg-bg-primary text-text-primary focus:border-accent w-[76px] rounded-l border px-2 text-right font-mono text-[13px] tabular-nums focus:outline-none"
      />
      <span className="border-border-main bg-bg-elevated text-text-secondary flex items-center rounded-r border border-l-0 px-2 font-mono text-[11px]">
        {unidad}
      </span>
    </span>
  );
}

/** Fila del editor: etiqueta a la izquierda, control a la derecha. */
export function Fila(props: {
  etiqueta: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  columna?: boolean;
}): JSX.Element {
  const { etiqueta, htmlFor, children, columna } = props;
  return (
    <div
      className={[
        "border-border-sub text-text-secondary flex gap-3 border-t px-3.5 py-2 text-[12.5px]",
        columna ? "flex-col items-stretch gap-1.5" : "items-center justify-between",
      ].join(" ")}
    >
      {htmlFor ? <label htmlFor={htmlFor}>{etiqueta}</label> : <span>{etiqueta}</span>}
      {children}
    </div>
  );
}

/** Subtítulo de grupo dentro del editor («LO QUE SE DEDUCE»). */
export function Sub({ children }: { children: ReactNode }): JSX.Element {
  return (
    <h3 className="text-text-disabled px-3.5 pt-3 pb-1 text-[10px] font-semibold tracking-[0.09em] uppercase">
      {children}
    </h3>
  );
}

/** Par clave/valor de solo lectura. */
export function ParKV(props: { k: ReactNode; v: ReactNode; title?: string }): JSX.Element {
  return (
    <div
      title={props.title}
      className="border-border-sub text-text-secondary flex items-baseline justify-between gap-3 border-t px-3.5 py-[7px] text-[12.5px]"
    >
      <span>{props.k}</span>
      <b className="text-text-primary text-right font-mono text-[12px] font-medium">{props.v}</b>
    </div>
  );
}

/** Botón secundario pequeño («+ Añadir zona»). */
export function BotonSec(props: {
  onClick: () => void;
  children: ReactNode;
  peligro?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={props.onClick}
      onBlur={props.onBlur}
      disabled={props.disabled}
      className={[
        "bg-bg-primary inline-flex h-7 items-center gap-1 rounded border px-2.5 text-[12px] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        props.peligro
          ? "border-state-fail/35 text-state-fail hover:bg-tint-fail"
          : "border-border-main text-text-secondary hover:text-text-primary hover:border-text-disabled",
      ].join(" ")}
    >
      {props.children}
    </button>
  );
}

/** La tarjeta del editor: lo que es («ZONA · PB») y su título. */
export function Tarjeta(props: { k: string; titulo: string; children: ReactNode }): JSX.Element {
  return (
    <div className="border-border-main bg-bg-primary m-3.5 rounded border pb-1">
      <div className="text-text-disabled px-3.5 pt-3 text-[10px] font-semibold tracking-[0.09em] uppercase">
        {props.k}
      </div>
      <h2 className="text-text-primary px-3.5 pt-[3px] pb-3 text-[15px] leading-snug font-semibold">
        {props.titulo}
      </h2>
      {props.children}
    </div>
  );
}

const COLOR_TRATO: Record<LoUsa["trato"], string> = {
  si: "text-text-primary",
  otra: "text-accent",
  no: "text-text-disabled",
};

/** «Lo usan»: qué hace cada justificación con lo seleccionado. */
export function LoUsan({ filas }: { filas: LoUsa[] }): JSX.Element {
  return (
    <ul>
      {filas.map((f) => (
        <li
          key={f.codigo + f.texto}
          className="border-border-sub grid grid-cols-[46px_minmax(0,1fr)] gap-2.5 border-t px-3.5 py-[7px] text-[12.5px] leading-[1.4]"
        >
          <b className="text-text-secondary pt-px font-mono text-[11px] font-semibold">{f.codigo}</b>
          <span className={COLOR_TRATO[f.trato]}>{f.texto}</span>
        </li>
      ))}
    </ul>
  );
}
