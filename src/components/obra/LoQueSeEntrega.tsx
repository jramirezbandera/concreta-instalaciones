import { useState, type JSX, type ReactNode } from "react";
import { Link } from "react-router";
import { Loader2 } from "lucide-react";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { entregables, type RecuentoEntregable } from "../../lib/obra/entrega";
import { descargarBlob } from "../../lib/export/descargar";
import { GeneradorAnejo } from "../proyecto/GeneradorAnejo";
import { showToast } from "../ui/Toast";
import { RotuloSeccion } from "./LoQueSeJustifica";
import { useExportarMemoria } from "./useExportarMemoria";

// =============================================================================
// «Lo que se entrega» (feature-16 §D, maqueta v4 de La obra): la memoria CTE
// (Word y PDF), las fichas justificativas (el anejo en PDF) y los esquemas para
// el plano (DXF), cada uno con lo que tiene listo. Lo que no cumple no cuenta
// como listo y se nombra.
// =============================================================================

const ACCION =
  "text-accent hover:text-accent-hover focus-visible:outline-accent inline-flex items-center gap-1 text-[12.5px] font-medium hover:underline focus-visible:outline-2 disabled:cursor-wait disabled:opacity-60 disabled:no-underline";

function Miniatura({ tipo }: { tipo: "memoria" | "fichas" | "esquemas" }): JSX.Element {
  const trazo = "var(--color-text-disabled)";
  return (
    <svg width="56" height="70" viewBox="0 0 56 70" aria-hidden="true" className="shrink-0">
      <rect x="5" y="4" width="46" height="62" rx="2" fill="var(--color-bg-primary)" stroke="var(--color-border-main)" />
      {tipo === "memoria" && <path d="M12 14h22M12 22h32M12 27h32M12 32h26M12 40h32M12 45h32M12 50h18" stroke={trazo} strokeWidth="1.6" />}
      {tipo === "fichas" && (
        <>
          <path d="M12 12h20" stroke={trazo} strokeWidth="1.6" />
          <rect x="12" y="18" width="32" height="20" fill="none" stroke={trazo} />
          <path d="M12 44h32M12 49h32M12 54h22" stroke={trazo} strokeWidth="1.6" />
        </>
      )}
      {tipo === "esquemas" && <path d="M34 12v46M14 22h20M14 34h20M14 46h20M34 58H14" stroke={trazo} strokeWidth="1.6" />}
    </svg>
  );
}

/** «✓ 5 de 6 apartados  HE1 no cumple». */
function Recuento({ r, unidad }: { r: RecuentoEntregable; unidad: [string, string] }): JSX.Element {
  const [uno, varios] = unidad;
  const texto =
    r.total === 0
      ? `sin ${varios}`
      : r.listos === r.total
        ? `${r.total} ${r.total === 1 ? uno : varios}`
        : `${r.listos} de ${r.total} ${r.total === 1 ? uno : varios}`;
  return (
    <>
      <span className={`font-mono text-[11px] whitespace-nowrap ${r.listos > 0 ? "text-state-ok" : "text-text-disabled"}`}>
        {r.listos > 0 && <span aria-hidden="true">✓ </span>}
        {texto}
      </span>
      {r.noCumplen.length > 0 && (
        <span className="text-state-fail font-mono text-[11px] whitespace-nowrap">
          {r.noCumplen.join(" · ")} no cumple{r.noCumplen.length > 1 ? "n" : ""}
        </span>
      )}
    </>
  );
}

function Entregable(props: {
  tipo: "memoria" | "fichas" | "esquemas";
  titulo: string;
  descripcion: string;
  estado: ReactNode;
  acciones: ReactNode;
}): JSX.Element {
  return (
    <li className="border-border-sub grid grid-cols-[62px_minmax(0,1fr)] gap-3.5 border-b p-4 last:border-b-0">
      <Miniatura tipo={props.tipo} />
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="text-text-primary text-[13.5px] font-semibold">{props.titulo}</h3>
        <p className="text-text-secondary text-[12.5px] leading-normal">{props.descripcion}</p>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          {props.estado}
          {props.acciones}
        </div>
      </div>
    </li>
  );
}

export function LoQueSeEntrega(): JSX.Element {
  const { proyecto } = useProyecto();
  const e = entregables(proyecto);
  const memoria = useExportarMemoria();
  const [dxf, setDxf] = useState(false);

  const descargarDxf = async () => {
    setDxf(true);
    try {
      const { esquemasDxf } = await import("../../lib/dxf/esquemas");
      const { blob, filename } = esquemasDxf(proyecto, e.esquemas.claves);
      descargarBlob(blob, filename);
    } catch {
      showToast("No se pudieron generar los esquemas", { autoDismiss: 4000 });
    } finally {
      setDxf(false);
    }
  };

  const girando = <Loader2 size={12} className="animate-spin" aria-hidden="true" />;

  return (
    <section aria-label="Lo que se entrega">
      <RotuloSeccion>Lo que se entrega</RotuloSeccion>
      <ul className="border-border-main bg-bg-primary rounded border">
        <Entregable
          tipo="memoria"
          titulo="Memoria CTE de instalaciones"
          descripcion="Los apartados justificados, ya redactados, y los que no aplican con su párrafo. Para pegar en la memoria del proyecto."
          estado={<Recuento r={e.memoria} unidad={["apartado", "apartados"]} />}
          acciones={
            <>
              <Link to="memoria" className={ACCION}>
                Leer
              </Link>
              <button type="button" onClick={memoria.word} disabled={memoria.ocupado !== null || e.memoria.total === 0} className={ACCION}>
                {memoria.ocupado === "word" && girando}
                Word
              </button>
              <button type="button" onClick={memoria.pdf} disabled={memoria.ocupado !== null || e.memoria.total === 0} className={ACCION}>
                {memoria.ocupado === "pdf" && girando}
                PDF
              </button>
            </>
          }
        />
        <Entregable
          tipo="fichas"
          titulo="Fichas justificativas"
          descripcion="Una por apartado, con su esquema, los datos de partida con su origen y la cita de cada tabla."
          estado={<Recuento r={e.fichas} unidad={["ficha", "fichas"]} />}
          acciones={
            <GeneradorAnejo>
              {({ generar, ocupado }) => (
                <button
                  type="button"
                  onClick={generar}
                  disabled={ocupado || e.fichas.total === 0}
                  aria-label="Fichas justificativas en PDF"
                  className={ACCION}
                >
                  {ocupado && girando}
                  PDF
                </button>
              )}
            </GeneradorAnejo>
          }
        />
        <Entregable
          tipo="esquemas"
          titulo="Esquemas para el plano"
          descripcion="Columnas de saneamiento y fontanería, con diámetros, listas para el plano de instalaciones."
          estado={<Recuento r={e.esquemas} unidad={["esquema", "esquemas"]} />}
          acciones={
            <button
              type="button"
              onClick={() => void descargarDxf()}
              disabled={dxf || e.esquemas.claves.length === 0}
              aria-label="Esquemas para el plano en DXF"
              className={ACCION}
            >
              {dxf && girando}
              DXF
            </button>
          }
        />
      </ul>
      {memoria.modal}
    </section>
  );
}
