import type { ReactNode } from "react";
import { HelpTooltip } from "./HelpTooltip";

interface InputLabelProps {
  htmlFor?: string;
  label: string;
  /** Subtexto atenuado tras el label (p.ej. símbolo o aclaración corta). */
  sub?: string;
  /** Texto de ayuda → pinta el icono ⓘ. */
  help?: string;
  /** Referencia normativa para la 2ª línea del tooltip. */
  refText?: string;
  className?: string;
}

/** Label inline denso (paridad con "Concreta estructura"): 13px secundario + sub 11px + ⓘ. */
export function InputLabel({ htmlFor, label, sub, help, refText, className }: InputLabelProps) {
  const fieldLabel = `${label}${sub ? " " + sub : ""}`.trim();
  return (
    <span className={`flex min-w-0 items-center gap-1 ${className ?? ""}`}>
      <label
        htmlFor={htmlFor}
        className="text-text-secondary min-w-0 truncate text-[13px]"
        title={help ? undefined : fieldLabel}
      >
        {label}
        {sub && <span className="text-text-disabled ml-1 text-[11px]">{sub}</span>}
      </label>
      {help && <HelpTooltip text={help} refText={refText} fieldLabel={fieldLabel} />}
    </span>
  );
}

interface FieldProps {
  id?: string;
  label: string;
  sub?: string;
  help?: string;
  refText?: string;
  /** Unidad visible a la derecha del control (p.ej. "l/s"). */
  unit?: string;
  /** Aviso inline (validación / advertencia normativa). */
  warning?: string;
  children: ReactNode;
}

/**
 * Fila densa de formulario (label-izq / control-der + unidad), al estilo del
 * panel de inputs del hermano. Feedback inmediato; sin botón "calcular".
 */
export function Field({ id, label, sub, help, refText, unit, warning, children }: FieldProps) {
  return (
    <div className="py-1">
      <div className="flex items-center justify-between gap-3">
        <InputLabel htmlFor={id} label={label} sub={sub} help={help} refText={refText} />
        <div className="flex w-32 shrink-0 items-center gap-1.5">
          <div className="flex-1">{children}</div>
          {unit && <span className="text-text-disabled w-8 shrink-0 text-[11px]">{unit}</span>}
        </div>
      </div>
      {warning && <div className="text-state-warn mt-0.5 text-right text-[11px]">{warning}</div>}
    </div>
  );
}

interface NumberInputProps {
  id?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

/** Campo numérico compacto (13px, derecha, tabular). */
export function NumberInput({ id, value, onChange, min, max, step = 1 }: NumberInputProps) {
  return (
    <input
      id={id}
      type="number"
      value={Number.isFinite(value) ? value : ""}
      min={min}
      max={max}
      step={step}
      onChange={(e) => onChange(Number(e.target.value))}
      className="border-border-main bg-bg-primary text-text-primary focus:border-accent focus:ring-accent/30 w-full rounded border px-2 py-1 text-right text-[13px] tabular-nums transition-colors focus:ring-1 focus:outline-none"
    />
  );
}

interface SelectInputProps<T extends string> {
  id?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

/** Select compacto, mismo lenguaje visual que NumberInput. */
export function SelectInput<T extends string>({ id, value, options, onChange }: SelectInputProps<T>) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="border-border-main bg-bg-primary text-text-primary focus:border-accent focus:ring-accent/30 w-full rounded border px-2 py-1 text-[13px] transition-colors focus:ring-1 focus:outline-none"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
