import type { JSX } from "react";
import { Check, X, Circle, CircleSlash, ExternalLink } from "lucide-react";
import type { EstadoJustificacion } from "../../lib/proyecto/tipos";

// Chip de estado de la checklist (feature-6 T3.5, UX-RECONCEPT §3/§4.2).
// SIEMPRE icono + texto (nunca solo color): las dos dimensiones ortogonales
// aplicabilidad × progreso colapsan aquí a una etiqueta única. Los colores son
// los tokens de veredicto del tema (text-state-*, ver src/index.css y
// lib/ui/veredicto.ts) — mismo mapa que usan los banners de módulo.

interface Presentacion {
  icono: JSX.Element;
  texto: string;
  /** Clase de color de texto (token de estado del tema). */
  clase: string;
}

function presentacionDe(estado: EstadoJustificacion): Presentacion {
  // 1. Aplicabilidad manda: fuera de ámbito / resuelta fuera de la app.
  if (estado.aplicabilidad === "no_aplica") {
    return {
      icono: <CircleSlash size={12} aria-hidden="true" />,
      texto: "No aplica",
      clase: "text-state-neutral",
    };
  }
  if (estado.aplicabilidad === "externo") {
    return {
      icono: <ExternalLink size={12} aria-hidden="true" />,
      texto: "Externa",
      clase: "text-state-neutral",
    };
  }
  // 2. Progreso derivado del cálculo real (nunca marcado a mano).
  switch (estado.progreso) {
    case "no_cumple":
      return {
        icono: <X size={13} aria-hidden="true" />,
        texto: "No cumple",
        clase: "text-state-fail",
      };
    case "cumple":
      // El matiz warn viaja en el veredicto crudo del cache (estadoDe).
      return estado.veredicto === "warn"
        ? {
            icono: <Check size={13} aria-hidden="true" />,
            texto: "Cumple con avisos",
            clase: "text-state-warn",
          }
        : {
            icono: <Check size={13} aria-hidden="true" />,
            texto: "Cumple",
            clase: "text-state-ok",
          };
    case "en_curso":
      return {
        icono: <Circle size={8} className="fill-current" aria-hidden="true" />,
        texto: "En curso",
        clase: "text-state-warn",
      };
    case "sin_iniciar":
      return {
        icono: <Circle size={11} aria-hidden="true" />,
        texto: "Sin iniciar",
        clase: "text-state-neutral",
      };
  }
}

export function ChipEstado({ estado }: { estado: EstadoJustificacion }): JSX.Element {
  const p = presentacionDe(estado);
  return (
    <span
      className={`${p.clase} inline-flex shrink-0 items-center gap-1 text-[12px] font-medium whitespace-nowrap`}
    >
      {p.icono}
      {p.texto}
    </span>
  );
}
