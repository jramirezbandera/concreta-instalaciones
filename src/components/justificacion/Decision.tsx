import type { JSX, ReactNode } from "react";

// =============================================================================
// Una decisión del proyectista (REDISENO-V4 §3.3, feature-14 §H): pregunta
// numerada, opciones como botones con `aria-pressed`, y debajo «Lo habitual» o
// la consecuencia de haberse apartado de ello, en una línea. `extra` deja meter
// un segundo control dentro de la misma decisión (la pendiente de los colectores).
// =============================================================================

export interface OpcionDecision<T extends string | number> {
  valor: T;
  label: string;
  /** Opción que no se puede elegir aquí, con el porqué en `motivo`. */
  deshabilitada?: boolean;
  motivo?: string;
}

interface DecisionProps<T extends string | number> {
  numero: number;
  pregunta: string;
  opciones: OpcionDecision<T>[];
  valor: T;
  onChange: (v: T) => void;
  /** La opción que se haría sin pensarlo, según el edificio. */
  habitual: T;
  /** Qué supone la opción elegida, en una línea. */
  texto: ReactNode;
  extra?: ReactNode;
  /** Si la decisión incluye más de un control (`extra`), si todo está en lo habitual. */
  esHabitual?: boolean;
}

/** Grupo de botones de opción (también para controles secundarios, como la pendiente). */
export function Opciones<T extends string | number>({
  etiqueta,
  opciones,
  valor,
  onChange,
  pequenas = false,
}: {
  etiqueta: string;
  opciones: OpcionDecision<T>[];
  valor: T;
  onChange: (v: T) => void;
  pequenas?: boolean;
}): JSX.Element {
  return (
    <div role="group" aria-label={etiqueta} className="flex gap-1">
      {opciones.map((o) => {
        const on = o.valor === valor;
        return (
          <button
            key={String(o.valor)}
            type="button"
            aria-pressed={on}
            disabled={o.deshabilitada}
            title={o.motivo}
            onClick={() => onChange(o.valor)}
            className={[
              "min-w-0 flex-1 truncate rounded border px-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-45",
              pequenas ? "h-7 text-[12px]" : "h-8 text-[12.5px]",
              on
                ? "border-accent/50 bg-tint-accent text-accent font-medium"
                : "border-border-main bg-bg-primary text-text-secondary hover:text-text-primary",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Decision<T extends string | number>({
  numero,
  pregunta,
  opciones,
  valor,
  onChange,
  habitual,
  texto,
  extra,
  esHabitual,
}: DecisionProps<T>): JSX.Element {
  return (
    <div className="border-border-sub border-t pt-3 pb-3.5">
      <div className="text-text-primary mb-2 flex items-baseline gap-2 text-[13px] font-medium">
        <span className="text-text-disabled font-mono text-[10.5px] font-medium">{numero}</span>
        {pregunta}
      </div>
      <Opciones etiqueta={pregunta} opciones={opciones} valor={valor} onChange={onChange} />
      {extra}
      <p className="text-text-secondary mt-2 text-[12px] leading-normal">
        <b className="text-text-primary font-medium">{(esHabitual ?? valor === habitual) ? "Lo habitual." : "No es lo habitual."}</b>{" "}
        {texto}
      </p>
    </div>
  );
}

/**
 * Un valor que se ajusta a pasos (feature-15): la presión de la red en HS4, el
 * espesor del aislante en HE1. Botones − y + con su nombre accesible y la cifra
 * en medio, como `<output>`.
 */
export function Paso({
  etiqueta,
  valor,
  unidad,
  paso,
  min,
  max,
  onChange,
}: {
  /** «Presión de la red»: da nombre a los botones («Bajar 10 kPa la presión de la red»). */
  etiqueta: string;
  valor: number | null;
  unidad: string;
  paso: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}): JSX.Element {
  const v = valor ?? min;
  const boton =
    "h-full w-8 shrink-0 text-[15px] leading-none text-text-secondary hover:bg-bg-surface hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40";
  return (
    <div role="group" aria-label={etiqueta} className="border-border-main bg-bg-primary flex h-8 items-stretch overflow-hidden rounded border">
      <button
        type="button"
        aria-label={`Bajar ${paso} ${unidad}`}
        disabled={valor !== null && v - paso < min}
        onClick={() => onChange(Math.max(min, valor === null ? min : v - paso))}
        className={boton}
      >
        −
      </button>
      <output className="border-border-sub text-text-primary flex min-w-[84px] items-center justify-center gap-1 border-x px-2 font-mono text-[13px]">
        {valor === null ? "—" : valor}
        <small className="text-text-disabled text-[10.5px]">{unidad}</small>
      </output>
      <button
        type="button"
        aria-label={`Subir ${paso} ${unidad}`}
        disabled={valor !== null && v + paso > max}
        onClick={() => onChange(Math.min(max, valor === null ? min : v + paso))}
        className={boton}
      >
        +
      </button>
    </div>
  );
}

/**
 * Una decisión que no es elegir entre opciones sino ajustar un valor (feature-15):
 * pregunta numerada, el control (un `Paso`), una marca a la derecha («supuesta»,
 * «confirmada») y el texto de debajo.
 */
export function DecisionValor({
  numero,
  pregunta,
  control,
  marca,
  texto,
}: {
  numero: number;
  pregunta: string;
  control: ReactNode;
  marca?: { texto: string; aviso?: boolean };
  texto: ReactNode;
}): JSX.Element {
  return (
    <div className="border-border-sub border-t pt-3 pb-3.5">
      <div className="text-text-primary mb-2 flex items-baseline gap-2 text-[13px] font-medium">
        <span className="text-text-disabled font-mono text-[10.5px] font-medium">{numero}</span>
        {pregunta}
      </div>
      <div className="flex items-center justify-between gap-2">
        {control}
        {marca && (
          <span
            className={[
              "shrink-0 rounded border px-[7px] py-[5px] text-[11.5px] leading-none",
              marca.aviso
                ? "border-state-warn/45 text-state-warn bg-[color-mix(in_srgb,var(--color-state-warn)_6%,var(--color-bg-primary))]"
                : "border-border-sub text-text-secondary",
            ].join(" ")}
          >
            {marca.texto}
          </span>
        )}
      </div>
      <p className="text-text-secondary mt-2 text-[12px] leading-normal">{texto}</p>
    </div>
  );
}
