import type { ComponentType, JSX } from "react";
import { AlertTriangle, CheckCircle2, MinusCircle, XCircle } from "lucide-react";
import type { Veredicto } from "../../lib/proyecto/tipos";
import { STATE_TEXT, STATE_TINT } from "../../lib/ui/veredicto";
import { STATUS_LABEL } from "../../lib/pdf/utils";
import type { ResumenVeredicto } from "./ModuleShell";

// Banda de veredicto del ModuleShell (feature-6 T3.3-bis): banda fija bajo la
// barra de contexto, misma gramática que el banner de hs5/ui.tsx —
// `sujeto (contexto) — VEREDICTO (métricas)` — con la cita normativa en mono a
// la derecha. Accesibilidad: NUNCA solo color — icono + texto SIEMPRE.

/** Icono por veredicto (paridad con STATE_TEXT/STATE_TINT de lib/ui/veredicto). */
const STATE_ICON: Record<Veredicto, ComponentType<{ size?: number | string; className?: string }>> =
  {
    ok: CheckCircle2,
    warn: AlertTriangle,
    fail: XCircle,
    neutral: MinusCircle,
  };

interface BandaVeredictoProps {
  /** null → banda neutra "Datos insuficientes para el cálculo". */
  resultado: ResumenVeredicto | null;
  /** Cita por defecto (edición del DB del registry) si `resultado.cita` falta. */
  edicionDB: string;
}

export function BandaVeredicto({ resultado, edicionDB }: BandaVeredictoProps): JSX.Element {
  if (resultado === null) {
    return (
      <div
        className={`flex shrink-0 items-center gap-2 border-b px-4 py-2.5 ${STATE_TINT.neutral}`}
      >
        <MinusCircle size={14} className="text-state-neutral shrink-0" aria-hidden="true" />
        <span className="text-text-secondary text-[13px]">
          Datos insuficientes para el cálculo
        </span>
      </div>
    );
  }

  const Icon = STATE_ICON[resultado.veredicto];
  const cita = resultado.cita ?? edicionDB;

  return (
    <div
      className={`flex shrink-0 items-center gap-2 border-b px-4 py-2.5 ${STATE_TINT[resultado.veredicto]}`}
    >
      <Icon
        size={14}
        className={`${STATE_TEXT[resultado.veredicto]} shrink-0`}
        aria-hidden="true"
      />
      <span className="text-text-secondary min-w-0 flex-1 truncate text-[13px]">
        {resultado.sujeto}
        {resultado.contexto && ` (${resultado.contexto})`} —{" "}
        <span className={`font-semibold ${STATE_TEXT[resultado.veredicto]}`}>
          {STATUS_LABEL[resultado.veredicto]}
        </span>
        {resultado.metricas && <span className="text-text-disabled"> ({resultado.metricas})</span>}
      </span>
      <span
        className="text-text-secondary shrink-0 font-mono text-[11px] max-sm:hidden"
        title={cita}
      >
        {cita}
      </span>
    </div>
  );
}
