import type { JSX } from "react";
import { Link } from "react-router";
import { Building2, Pencil } from "lucide-react";
import { Topbar } from "../components/layout/Topbar";
import { useDrawer } from "../components/layout/AppShell";
import { AntesDeEntregar } from "../components/obra/AntesDeEntregar";
import { LoQueSeEntrega } from "../components/obra/LoQueSeEntrega";
import { LoQueSeJustifica } from "../components/obra/LoQueSeJustifica";
import { useProyecto } from "../lib/proyecto/ProyectoContext";
import type { Intervencion, ZonaRadon } from "../lib/proyecto/tipos";

// =============================================================================
// La obra (feature-16, maqueta v4): el sitio desde el que se entrega. Arriba,
// la obra en piezas y por dónde se empieza; a la izquierda, lo que se justifica
// y cómo va cada cosa; a la derecha, los entregables y lo que queda por mirar
// antes de entregar. Todo se calcula del expediente al pintar: no hay nada que
// sincronizar con los módulos.
// =============================================================================

const INTERVENCION: Record<Intervencion, string> = {
  obra_nueva: "Obra nueva",
  reforma: "Reforma",
  ampliacion: "Ampliación",
  cambio_uso: "Cambio de uso",
};

const RADON: Record<ZonaRadon, string> = { I: "radón I", II: "radón II", sin_exigencia: "radón sin exigencia" };

function Pieza({ children, title }: { children: string; title?: string }): JSX.Element {
  return (
    <span
      title={title}
      className="border-border-sub bg-bg-surface text-text-primary inline-flex h-[26px] items-center rounded border px-2 text-[12px] whitespace-nowrap"
    >
      {children}
    </span>
  );
}

function Cabecera(): JSX.Element {
  const { proyecto, derivados } = useProyecto();
  const dg = proyecto.datosGenerales;
  const ed = derivados.edificio;
  const usos = [
    ed.numViviendas > 0 ? (ed.numViviendas === 1 ? "1 vivienda" : `${ed.numViviendas} viviendas`) : null,
    ed.tieneOficinas ? "oficinas" : null,
    ed.tieneLocales ? "local" : null,
    ed.tieneGaraje ? "garaje" : null,
  ].filter((x): x is string => x !== null);

  return (
    <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="flex min-w-0 flex-col gap-2.5">
        <h1 className="text-text-primary text-[22px] leading-tight font-semibold tracking-[-0.01em]">{proyecto.nombre}</h1>
        <div className="flex flex-wrap gap-1.5">
          <Pieza>{INTERVENCION[dg.intervencion]}</Pieza>
          <Pieza>{`${dg.municipio} · ${dg.altitud_m} m`}</Pieza>
          <Pieza title={derivados.zonaClimatica.procedencia}>{`zona climática ${derivados.zonaClimatica.valor}`}</Pieza>
          <Pieza title="Zona de radón del municipio (dato de la obra, apéndice B del DB-HS 6)">{RADON[dg.zonaRadon]}</Pieza>
          {usos.length > 0 && <Pieza>{usos.join(" · ")}</Pieza>}
        </div>
      </div>
      <Link
        to="datos"
        className="border-border-main bg-bg-primary text-text-secondary hover:text-text-primary focus-visible:outline-accent inline-flex h-[30px] shrink-0 items-center gap-1.5 rounded border px-2.5 text-[12.5px] transition-colors focus-visible:outline-2"
      >
        <Pencil size={12} aria-hidden="true" />
        Editar los datos
      </Link>
    </header>
  );
}

function PorDondeEmpezar(): JSX.Element {
  const { proyecto } = useProyecto();
  const vacio = proyecto.edificio.grupos.every((g) => g.zonas.length === 0);
  return (
    <aside
      aria-label="Por dónde se empieza"
      className="border-accent/40 flex items-start gap-3 rounded border bg-[color-mix(in_srgb,var(--color-accent)_5%,var(--color-bg-primary))] px-3.5 py-3"
    >
      <Building2 size={16} className="text-accent mt-0.5 shrink-0" aria-hidden="true" />
      <div className="flex flex-col gap-1.5">
        <h2 className="text-text-primary text-[13px] font-semibold">Por dónde se empieza</h2>
        <p className="text-text-secondary text-[12.5px] leading-normal">
          Primero el edificio: plantas, zonas y usos. Cada justificación lee de ahí a qué partes aplica y deja su
          apartado de la memoria redactado. Esta pantalla dice en todo momento qué queda.
        </p>
        <Link to="edificio" className="text-accent hover:text-accent-hover w-fit text-[12.5px] font-medium hover:underline">
          {vacio ? "Definir El edificio" : "Revisar El edificio"} →
        </Link>
      </div>
    </aside>
  );
}

export function ObraPage(): JSX.Element {
  const { openDrawer } = useDrawer();
  return (
    <>
      <Topbar moduleLabel="La obra" moduleGroup="Proyecto" onMenuOpen={openDrawer} />
      <div className="scroll-hide flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-4 py-6 sm:px-6 lg:px-9">
          <Cabecera />
          <PorDondeEmpezar />
          <div className="flex flex-wrap items-start gap-6">
            <div className="min-w-0 flex-[999_1_600px]">
              <LoQueSeJustifica />
            </div>
            <div className="flex min-w-0 flex-[1_1_340px] flex-col gap-4">
              <LoQueSeEntrega />
              <AntesDeEntregar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
