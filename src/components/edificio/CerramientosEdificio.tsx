import type { JSX } from "react";
import { cerramientosDe } from "../../lib/constructivo/cerramientos";
import { MARCOS } from "../../lib/constructivo/tipos";
import type { Edificio } from "../../lib/edificio/tipos";
import { lineaFachada, lineaForjado, lineaVentana, type Seleccion } from "./presentacion";

// =============================================================================
// «Cerramientos» (feature-26, bajo lo que se repite): una tarjeta por fachada,
// ventana, cubierta y forjado, con la de la planta baja si es otra. Pulsar
// cualquiera los edita a la izquierda.
// =============================================================================

interface Ficha {
  k: string;
  nombre: string;
  linea: string;
  pb?: string;
}

export function CerramientosEdificio(props: {
  edificio: Edificio;
  seleccion: Seleccion | null;
  onSeleccionar: (s: Seleccion) => void;
}): JSX.Element {
  const { edificio: e, seleccion, onSeleccionar } = props;
  const r = cerramientosDe(e);
  const sel = seleccion?.tipo === "cerramientos";
  const fichas: Ficha[] = [
    {
      k: "Fachada",
      nombre: r.fachada.sol.nombre,
      linea: lineaFachada(r.fachada.sol),
      pb:
        r.fachadaPB && r.fachadaPB.sol.id !== r.fachada.sol.id
          ? `${r.fachadaPB.sol.codigo} · ${r.fachadaPB.sol.nombre}`
          : undefined,
    },
    {
      k: "Ventana",
      nombre: `${r.ventana.sol.nombre} · ${MARCOS[r.ventana.marco].nombre}`,
      linea: lineaVentana(r.ventana.sol),
      pb:
        r.ventanaPB && (r.ventanaPB.sol.id !== r.ventana.sol.id || r.ventanaPB.marco !== r.ventana.marco)
          ? `${r.ventanaPB.sol.nombre} · ${MARCOS[r.ventanaPB.marco].nombre}`
          : undefined,
    },
    {
      k: "Cubierta",
      nombre: r.cubierta.sol.nombre,
      linea: `${r.cubierta.sol.tipo === "inclinada" ? "" : r.cubierta.invertida ? "invertida · " : "convencional · "}CEC ${r.cubierta.sol.codigo}, p. ${r.cubierta.sol.pagina}`,
    },
    { k: "Forjado", nombre: r.forjado.sol.nombre, linea: lineaForjado(r.forjado.sol) },
  ];

  return (
    <section aria-labelledby="cerramientos-titulo" className="border-border-main border-t px-6 pt-1 pb-6">
      <div className="text-text-disabled flex items-baseline justify-between gap-2 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
        <h2 id="cerramientos-titulo">Cerramientos · del Catálogo de Elementos Constructivos</h2>
        <span className="text-[11.5px] font-medium tracking-normal normal-case">
          {r.supuestos ? "los habituales: cámbialos si son otros" : "se eligen una vez para todo el edificio"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {fichas.map((f) => (
          <button
            key={f.k}
            type="button"
            aria-pressed={sel}
            aria-label={`${f.k}: ${f.nombre}${f.pb ? `; planta baja: ${f.pb}` : ""}`}
            onClick={() => onSeleccionar({ tipo: "cerramientos" })}
            className={[
              "bg-bg-primary flex max-w-[340px] flex-[1_1_230px] flex-col gap-[3px] rounded border px-3.5 py-3 text-left transition-colors",
              sel
                ? "border-accent shadow-[inset_3px_0_0_var(--color-accent)]"
                : "border-border-main hover:border-text-disabled",
            ].join(" ")}
          >
            <span className="text-text-disabled text-[10px] font-semibold tracking-[0.09em] uppercase">{f.k}</span>
            <b className="text-text-primary text-[13px] leading-snug font-semibold">{f.nombre}</b>
            <em className="text-accent font-mono text-[11px] not-italic">{f.linea}</em>
            {f.pb && <span className="text-text-secondary text-[12px] leading-snug">Planta baja: {f.pb}</span>}
          </button>
        ))}
      </div>
    </section>
  );
}
