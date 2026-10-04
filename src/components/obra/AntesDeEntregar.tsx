import type { JSX } from "react";
import { Link } from "react-router";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { antesDeEntregar } from "../../lib/obra/entrega";
import { RotuloSeccion } from "./LoQueSeJustifica";

// =============================================================================
// «Antes de entregar» (feature-16 §C): lo que no cumple, en rojo, y los avisos
// sin revisar, en ámbar, con el código de su módulo y el texto que redacta el
// módulo. Cada uno lleva al módulo, que es donde se ve en el dibujo y se marca
// como revisado o se arregla.
// =============================================================================

const CAJA =
  "hover:brightness-[0.98] focus-visible:outline-accent flex items-start gap-2 rounded border px-3 py-[9px] text-[12.5px] leading-[1.45] transition focus-visible:outline-2";
const ROJO =
  "border-state-fail/40 bg-[color-mix(in_srgb,var(--color-state-fail)_5%,var(--color-bg-primary))]";
const AMBAR =
  "border-state-warn/40 bg-[color-mix(in_srgb,var(--color-state-warn)_6%,var(--color-bg-primary))]";

export function AntesDeEntregar(): JSX.Element {
  const { proyecto } = useProyecto();
  const pendientes = antesDeEntregar(proyecto);

  return (
    <section aria-label="Antes de entregar">
      <RotuloSeccion>Antes de entregar</RotuloSeccion>
      {pendientes.length === 0 ? (
        <p className="border-border-main bg-bg-primary text-text-secondary flex items-start gap-2 rounded border px-3 py-[9px] text-[12.5px]">
          <CheckCircle2 size={14} className="text-state-ok mt-0.5 shrink-0" aria-hidden="true" />
          Nada pendiente: todo lo justificado cumple y está revisado.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {pendientes.map((x) => {
            const fallo = x.tipo === "no_cumple";
            const contenido = (
              <>
                {fallo ? (
                  <XCircle size={14} className="text-state-fail mt-0.5 shrink-0" aria-hidden="true" />
                ) : (
                  <AlertTriangle size={14} className="text-state-warn mt-0.5 shrink-0" aria-hidden="true" />
                )}
                <span className="min-w-0">
                  <span className="sr-only">{fallo ? "No cumple: " : "Por revisar: "}</span>
                  <b className="font-semibold">{x.codigo}</b> · {x.titulo}{" "}
                  <span className="text-text-secondary">{x.detalle}</span>
                </span>
              </>
            );
            return (
              <li key={x.id}>
                {x.ruta ? (
                  <Link to={x.ruta} className={`${CAJA} ${fallo ? ROJO : AMBAR} text-text-primary`}>
                    {contenido}
                  </Link>
                ) : (
                  <div className={`${CAJA} ${fallo ? ROJO : AMBAR} text-text-primary`}>{contenido}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
