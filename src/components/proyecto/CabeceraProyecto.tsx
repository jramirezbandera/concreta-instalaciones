import type { JSX, ReactNode } from "react";
import { Link } from "react-router";
import { Pencil } from "lucide-react";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import type { Intervencion, Uso } from "../../lib/proyecto/tipos";

// Cabecera del dashboard del expediente (feature-6 T3.5, UX-RECONCEPT §4.2):
// nombre del proyecto + chips legibles de los atributos discriminantes + chips
// de los DERIVADOS con su procedencia en `title` (trazabilidad §2.3). El enlace
// "Editar datos" navega a la subruta relativa `datos` del proyecto.

/** Etiquetas legibles de los ejes (local al componente — sin export, patrón Sidebar). */
const USO_LABEL: Record<Uso, string> = {
  vivienda_unifamiliar: "Vivienda unifamiliar",
  vivienda_colectiva: "Vivienda colectiva",
};

const INTERVENCION_LABEL: Record<Intervencion, string> = {
  obra_nueva: "Obra nueva",
  reforma: "Reforma",
  ampliacion: "Ampliación",
  cambio_uso: "Cambio de uso",
};

/** Chip neutro de atributo del proyecto. */
function ChipAtributo({ children, title }: { children: ReactNode; title?: string }): JSX.Element {
  return (
    <span
      title={title}
      className="border-border-sub bg-bg-primary text-text-secondary inline-flex items-center rounded border px-2 py-0.5 text-[11px] whitespace-nowrap"
    >
      {children}
    </span>
  );
}

/** Chip de dato DERIVADO: tinte de acento + procedencia en `title`. */
function ChipDerivado({ children, procedencia }: { children: ReactNode; procedencia: string }): JSX.Element {
  return (
    <span
      title={procedencia}
      className="bg-tint-accent text-accent inline-flex cursor-help items-center rounded px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
    >
      {children}
    </span>
  );
}

export function CabeceraProyecto(): JSX.Element {
  const { proyecto, derivados } = useProyecto();
  const dg = proyecto.datosGenerales;

  const plantas =
    `${dg.plantasSobreRasante} ${dg.plantasSobreRasante === 1 ? "planta" : "plantas"}` +
    (dg.tieneGaraje ? " + garaje" : "");

  return (
    <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h1 className="text-text-primary truncate text-[18px] leading-tight font-semibold">
          {proyecto.nombre}
        </h1>

        {/* Atributos del proyecto (los tres ejes, legibles). */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <ChipAtributo>{dg.municipio}</ChipAtributo>
          <ChipAtributo>{USO_LABEL[dg.uso]}</ChipAtributo>
          <ChipAtributo>{INTERVENCION_LABEL[dg.intervencion]}</ChipAtributo>
          <ChipAtributo>{plantas}</ChipAtributo>
          <ChipAtributo>
            {dg.numViviendas} {dg.numViviendas === 1 ? "vivienda" : "viviendas"}
          </ChipAtributo>
          <ChipAtributo title="Zona de radón del municipio (entrada manual, Apéndice B del DB-HS6)">
            Radón {dg.zonaRadon}
          </ChipAtributo>
        </div>

        {/* Contexto derivado, con procedencia (tabla/regla) en el title. */}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <ChipDerivado procedencia={derivados.zonaClimatica.procedencia}>
            Zona climática {derivados.zonaClimatica.valor}
          </ChipDerivado>
          <ChipDerivado procedencia={derivados.zonaTermicaHS3.procedencia}>
            Zona térmica HS3: {derivados.zonaTermicaHS3.valor}
          </ChipDerivado>
          <ChipDerivado procedencia={derivados.alturaEvacuacion_m.procedencia}>
            Alt. evacuación {derivados.alturaEvacuacion_m.valor} m
          </ChipDerivado>
        </div>
      </div>

      <Link
        to="datos"
        className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-accent flex shrink-0 items-center gap-1.5 rounded border px-2.5 py-1.5 text-[13px] transition-colors focus-visible:outline-2"
      >
        <Pencil size={14} aria-hidden="true" />
        Editar datos
      </Link>
    </header>
  );
}
