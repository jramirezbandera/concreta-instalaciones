import { useContext, type JSX } from "react";
import { Link, NavLink } from "react-router";
import { ChevronsUpDown, X } from "lucide-react";
import { justificacionesPorGrupo, type JustificacionEntry } from "../../data/justificacionRegistry";
import { ProyectoContext } from "../../lib/proyecto/ProyectoContext";
import { estadoDe } from "../../lib/proyecto/progreso";
import type { EstadoJustificacion, JustificacionKey, Proyecto } from "../../lib/proyecto/tipos";
import { ENGINE_VERSION } from "../../lib/version";

// =============================================================================
// Sidebar v4 (REDISENO-V4 §3.3). La barra lateral enseña TODO el expediente:
//
//   - «Proyecto»: La obra (dashboard) y El edificio (datos del edificio).
//   - Todas las justificaciones del registry agrupadas por DB, con su código y
//     un glifo de estado a la derecha: ✓ cumple · ! por revisar · ✕ no cumple ·
//     «pronto» si aún no existe · ↗ si se justifica fuera. Las no publicadas
//     se listan atenuadas y sin enlace: el mapa de cobertura se ve de un vistazo.
//
// Sin provider (`/_smoke`) solo aparece el grupo «Desarrollo».
// Accesibilidad: el glifo nunca va solo; lleva aria-label con el estado en texto.
// =============================================================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Glifo {
  texto: string;
  simbolo: string;
  clase: string;
}

/** Glifo de estado de una justificación publicada dentro del expediente. */
function glifoEstado(estado: EstadoJustificacion): Glifo | null {
  if (estado.aplicabilidad === "no_aplica") {
    return { texto: "No aplica", simbolo: "—", clase: "text-text-disabled" };
  }
  if (estado.aplicabilidad === "externo") {
    return { texto: "Se justifica fuera", simbolo: "↗", clase: "text-text-disabled" };
  }
  switch (estado.progreso) {
    case "no_cumple":
      return { texto: "No cumple", simbolo: "✕", clase: "text-state-fail font-bold" };
    case "cumple":
      return estado.veredicto === "warn"
        ? { texto: "Cumple, con cosas por revisar", simbolo: "!", clase: "text-state-warn font-bold" }
        : { texto: "Cumple", simbolo: "✓", clase: "text-state-ok" };
    case "en_curso":
      return { texto: "En curso", simbolo: "…", clase: "text-text-disabled" };
    case "sin_iniciar":
      return null;
  }
}

const ITEM =
  "relative flex items-center gap-2 px-4 py-[5px] text-[13px] whitespace-nowrap transition-colors";
const ITEM_ACTIVO =
  "bg-tint-accent text-accent before:bg-accent before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-r";
const ITEM_INACTIVO = "text-text-secondary hover:text-text-primary";

function navClass({ isActive }: { isActive: boolean }): string {
  return `${ITEM} ${isActive ? ITEM_ACTIVO : ITEM_INACTIVO}`;
}

function Codigo({ children }: { children: string }): JSX.Element {
  return (
    <span className="w-9 shrink-0 font-mono text-[10.5px] text-text-disabled">{children}</span>
  );
}

function NavJustificacion(props: {
  entrada: JustificacionEntry;
  proyecto: Proyecto | null;
  onClose: () => void;
}): JSX.Element {
  const { entrada, proyecto, onClose } = props;

  // No publicada (o externa sin pantalla): se lista, atenuada y sin enlace.
  if (!entrada.shipped || entrada.route === undefined) {
    const externa = entrada.formato === "externo";
    return (
      <div className={`${ITEM} text-text-disabled`} title={`${entrada.codigo} — ${entrada.label}`}>
        <Codigo>{entrada.codigo}</Codigo>
        <span className="min-w-0 flex-1 truncate">{entrada.label}</span>
        <span className="ml-auto font-mono text-[10px]">{externa ? "↗" : "pronto"}</span>
      </div>
    );
  }

  const to = proyecto !== null ? `/p/${proyecto.id}/${entrada.route}` : `/${entrada.route}`;
  const glifo =
    proyecto !== null && !entrada.dev
      ? glifoEstado(estadoDe(proyecto, entrada.key as JustificacionKey))
      : null;

  return (
    <NavLink to={to} onClick={onClose} className={navClass} title={`${entrada.codigo} — ${entrada.label}`}>
      {({ isActive }) => (
        <>
          <span className={`w-9 shrink-0 font-mono text-[10.5px] ${isActive ? "text-accent" : "text-text-disabled"}`}>
            {entrada.codigo}
          </span>
          <span className="min-w-0 flex-1 truncate">{entrada.label}</span>
          {glifo !== null && (
            <span
              className={`ml-auto font-mono text-[11px] ${glifo.clase}`}
              role="img"
              aria-label={`Estado: ${glifo.texto}`}
              title={glifo.texto}
            >
              {glifo.simbolo}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function CabeceraGrupo({ children }: { children: string }): JSX.Element {
  return (
    <div className="text-text-disabled truncate px-4 pt-3.5 pb-1 text-[10px] font-semibold tracking-[0.11em] uppercase">
      {children}
    </div>
  );
}

/** Quita el sufijo «(DB-HS)» del nombre de grupo: en la barra basta el nombre. */
function nombreGrupo(grupo: string): string {
  return grupo.replace(/\s*\(.*\)\s*$/, "");
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  // Tolerante a null: la Sidebar también se monta en /_smoke, sin provider.
  const ctx = useContext(ProyectoContext);
  const proyecto = ctx?.proyecto ?? null;

  const grupos = justificacionesPorGrupo()
    .map((g) => ({
      grupo: g.grupo,
      entradas: g.entradas.filter((e) => (proyecto !== null ? !e.dev : e.dev === true)),
    }))
    .filter((g) => g.entradas.length > 0);

  return (
    <aside
      className={[
        "bg-bg-surface border-border-main flex w-64 shrink-0 flex-col border-r",
        "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:transition-transform",
        isOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
      ].join(" ")}
    >
      <div className="border-border-main flex h-12 shrink-0 items-center justify-between gap-2 border-b px-4">
        <Link to="/" onClick={onClose} className="flex min-w-0 items-center gap-2">
          <span className="bg-accent h-2 w-2 shrink-0 rounded-full" aria-hidden="true" />
          <span className="text-text-primary truncate text-[15px] font-semibold">Concreta</span>
          <span className="text-text-disabled truncate text-[12px]">Instalaciones</span>
        </Link>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary shrink-0 p-1 lg:hidden"
          aria-label="Cerrar menú"
        >
          <X size={18} />
        </button>
      </div>

      {proyecto !== null && (
        <Link
          to="/"
          onClick={onClose}
          className="border-border-main bg-bg-primary text-text-primary hover:border-text-disabled mx-2.5 mt-2.5 mb-1 flex h-[34px] items-center gap-2 rounded border px-2.5 text-[12.5px] transition-colors"
          title={`${proyecto.nombre} — cambiar de proyecto`}
          aria-label={`Proyecto: ${proyecto.nombre}. Volver a la lista de proyectos`}
        >
          <span className="min-w-0 flex-1 truncate">{proyecto.nombre}</span>
          <ChevronsUpDown size={13} className="text-text-disabled shrink-0" aria-hidden="true" />
        </Link>
      )}

      <nav className="scroll-hide flex-1 overflow-y-auto pb-3" aria-label="Expediente">
        {proyecto !== null && (
          <div>
            <CabeceraGrupo>Proyecto</CabeceraGrupo>
            <NavLink to={`/p/${proyecto.id}`} end onClick={onClose} className={navClass}>
              La obra
            </NavLink>
            <NavLink to={`/p/${proyecto.id}/datos`} onClick={onClose} className={navClass}>
              El edificio
            </NavLink>
          </div>
        )}
        {grupos.map((g) => (
          <div key={g.grupo}>
            <CabeceraGrupo>{nombreGrupo(g.grupo)}</CabeceraGrupo>
            {g.entradas.map((e) => (
              <NavJustificacion key={e.key} entrada={e} proyecto={proyecto} onClose={onClose} />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-border-main text-text-disabled border-t px-4 py-2 font-mono text-[10px]">
        Motor v{ENGINE_VERSION}
      </div>
    </aside>
  );
}
