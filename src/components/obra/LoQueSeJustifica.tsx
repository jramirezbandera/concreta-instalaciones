import { useId, useState, type JSX, type ReactNode } from "react";
import { Link } from "react-router";
import { ChevronRight } from "lucide-react";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import type { EstadoObra } from "../../lib/obra/evaluar";
import { filasObra, recuentoObra, textoRecuento, type FilaObra, type PiezaObra } from "../../lib/obra/filas";
import { MenuAplicabilidad, type AccionesAplicabilidad } from "./MenuAplicabilidad";

// =============================================================================
// «Lo que se justifica» (feature-16 §B, maqueta v4 de La obra): todas las
// justificaciones por DB, con su estado, su código, su título y las partes del
// edificio que entran. Las publicadas llevan a su módulo; los «no aplica»
// despliegan su párrafo; las externas piden su documento; las «pronto» solo se
// listan. Cada fila conserva el menú ⋯ para forzar la aplicabilidad.
// =============================================================================

const ESTADO: Record<EstadoObra, { glifo: string; texto: string; clase: string }> = {
  cumple: { glifo: "✓", texto: "cumple", clase: "text-state-ok" },
  revisar: { glifo: "!", texto: "revisar", clase: "text-state-warn" },
  no_cumple: { glifo: "✕", texto: "no cumple", clase: "text-state-fail" },
  sin_datos: { glifo: "○", texto: "sin datos", clase: "text-text-disabled" },
  error: { glifo: "✕", texto: "sin calcular", clase: "text-state-fail" },
  no_aplica: { glifo: "–", texto: "no aplica", clase: "text-text-disabled" },
  externo: { glifo: "↗", texto: "externo", clase: "text-accent" },
  pronto: { glifo: "○", texto: "pronto", clase: "text-text-disabled" },
};

/** Rótulo de sección de La obra: «LO QUE SE JUSTIFICA  1 cumple · …  ───». */
export function RotuloSeccion({ children, dato }: { children: ReactNode; dato?: string }): JSX.Element {
  return (
    <div className="text-text-disabled mb-2 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
      <h2 className="shrink-0">{children}</h2>
      {dato && <span className="font-mono text-[10.5px] font-medium tracking-normal normal-case">{dato}</span>}
      <span className="bg-border-sub h-px min-w-4 flex-1 max-sm:hidden" aria-hidden="true" />
    </div>
  );
}

function Estado({ estado }: { estado: EstadoObra }): JSX.Element {
  const e = ESTADO[estado];
  return (
    <span className={`font-mono text-[11px] whitespace-nowrap ${e.clase}`}>
      <span aria-hidden="true">{e.glifo}</span> {e.texto}
    </span>
  );
}

const PIEZA = "inline-flex h-5 items-center rounded-[3px] px-1.5 text-[11px] whitespace-nowrap";
const PIEZA_NEUTRA = `${PIEZA} bg-bg-elevated text-text-secondary`;
const PIEZA_ACENTO = `${PIEZA} bg-tint-accent text-accent`;

function Piezas({ piezas }: { piezas: PiezaObra[] }): JSX.Element {
  return (
    <span className="flex flex-wrap gap-1">
      {piezas.map((p) => (
        <span key={p.texto} className={p.acento ? PIEZA_ACENTO : PIEZA_NEUTRA}>
          {p.texto}
        </span>
      ))}
    </span>
  );
}

/** La rejilla de una fila: estado · código · título · piezas · ›. En móvil, las piezas debajo. */
const REJILLA =
  "grid min-h-11 flex-1 grid-cols-[84px_48px_minmax(0,1fr)] items-center gap-x-2.5 gap-y-1 px-3.5 py-1.5 md:grid-cols-[92px_52px_minmax(140px,1fr)_minmax(0,1.3fr)_14px]";
const PIEZAS_CELDA = "col-span-3 col-start-1 min-w-0 md:col-span-1 md:col-start-auto";

function Cuerpo({ f, chevron }: { f: FilaObra; chevron: boolean }): JSX.Element {
  return (
    <>
      <Estado estado={f.estado} />
      <span className="text-text-disabled font-mono text-[11px] whitespace-nowrap">{f.codigo}</span>
      <span className="text-text-primary min-w-0 text-[13px]">
        {f.titulo}
        {f.forzada && <span className="text-state-warn ml-1.5 text-[10.5px] whitespace-nowrap">· forzado</span>}
      </span>
      <span className={PIEZAS_CELDA}>
        <Piezas piezas={f.piezas} />
      </span>
      <span className="text-text-disabled hidden md:block" aria-hidden="true">
        {chevron && <ChevronRight size={14} />}
      </span>
    </>
  );
}

function FilaJustificacion({
  f,
  acciones,
  onReferencia,
}: {
  f: FilaObra;
  acciones: AccionesAplicabilidad;
  onReferencia: (f: FilaObra) => void;
}): JSX.Element {
  const [abierta, setAbierta] = useState(false);
  const panelId = useId();
  const unica = f.claves.length === 1;

  let principal: JSX.Element;
  if (f.ruta) {
    principal = (
      <Link to={f.ruta} title={f.frase} className={`${REJILLA} hover:bg-bg-surface focus-visible:outline-accent transition-colors focus-visible:-outline-offset-2 focus-visible:outline-2`}>
        <Cuerpo f={f} chevron />
      </Link>
    );
  } else if (f.estado === "no_aplica" && f.nota) {
    principal = (
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls={panelId}
        onClick={() => setAbierta((a) => !a)}
        className={`${REJILLA} hover:bg-bg-surface focus-visible:outline-accent text-left transition-colors focus-visible:-outline-offset-2 focus-visible:outline-2`}
      >
        <Cuerpo f={f} chevron />
      </button>
    );
  } else if (f.estado === "externo") {
    principal = (
      <div className={REJILLA}>
        <Estado estado={f.estado} />
        <span className="text-text-disabled font-mono text-[11px] whitespace-nowrap">{f.codigo}</span>
        <span className="text-text-primary min-w-0 text-[13px]">{f.titulo}</span>
        <span className={PIEZAS_CELDA}>
          <button
            type="button"
            onClick={() => onReferencia(f)}
            title="Referencia del documento externo — pulsar para editarla"
            className={`${PIEZA_ACENTO} hover:underline focus-visible:outline-accent focus-visible:outline-2`}
          >
            {f.piezas[0]?.texto}
          </button>
        </span>
        <span className="hidden md:block" />
      </div>
    );
  } else {
    principal = (
      <div className={REJILLA}>
        <Cuerpo f={f} chevron={false} />
      </div>
    );
  }

  return (
    <li className="border-border-sub border-b last:border-b-0">
      <div className="flex items-stretch">
        {principal}
        <div className="flex w-9 shrink-0 items-center justify-center">
          {unica && (
            <MenuAplicabilidad clave={f.claves[0]} codigo={f.codigo} forzada={f.forzada} acciones={acciones} />
          )}
        </div>
      </div>
      {f.estado === "no_aplica" && f.nota && (
        <div id={panelId} hidden={!abierta} className="text-text-secondary px-3.5 pb-3 text-[12.5px] leading-relaxed md:pl-[166px]">
          <p>{f.nota}</p>
          {f.cita && <p className="text-text-disabled mt-1 font-mono text-[10.5px]">{f.cita}</p>}
        </div>
      )}
    </li>
  );
}

export function LoQueSeJustifica(): JSX.Element {
  const { proyecto, forzarAplicabilidad, setRefExterna } = useProyecto();
  const grupos = filasObra(proyecto);
  const recuento = textoRecuento(recuentoObra(proyecto));

  const acciones: AccionesAplicabilidad = {
    forzar: (key, valor, nota) => forzarAplicabilidad(key, valor, nota),
  };
  const onReferencia = (f: FilaObra) => {
    const ref = window.prompt("Referencia del documento externo (expediente, archivo, código):", f.refExterna ?? "");
    if (ref === null) return;
    setRefExterna(f.claves[0], ref.trim());
  };

  return (
    <section aria-label="Lo que se justifica" className="min-w-0">
      <RotuloSeccion dato={recuento}>Lo que se justifica</RotuloSeccion>
      <div className="border-border-main bg-bg-primary rounded border">
        {grupos.map((g) => (
          <div key={g.grupo}>
            <h3 className="bg-bg-surface text-text-disabled border-border-sub border-b px-3.5 py-[7px] text-[10px] font-semibold tracking-[0.09em] uppercase [div:first-child>&]:rounded-t">
              {g.rotulo}
            </h3>
            <ul className="border-border-sub border-b [div:last-child>&]:border-b-0">
              {g.filas.map((f) => (
                <FilaJustificacion key={f.id} f={f} acciones={acciones} onReferencia={onReferencia} />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
