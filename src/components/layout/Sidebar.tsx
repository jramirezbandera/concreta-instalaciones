import { useContext, type JSX } from "react";
import { Link, NavLink } from "react-router";
import { ArrowLeft, X } from "lucide-react";
import { justificacionesPorGrupo, type JustificacionEntry } from "../../data/justificacionRegistry";
import { ProyectoContext } from "../../lib/proyecto/ProyectoContext";
import { estadoDe } from "../../lib/proyecto/progreso";
import type { EstadoJustificacion, JustificacionKey, Proyecto } from "../../lib/proyecto/tipos";
import { ENGINE_VERSION } from "../../lib/version";

// =============================================================================
// Sidebar del expediente (feature-6 T4.1). Dos modos según contexto:
//
//   - DENTRO de un proyecto (`/p/:id`, hay ProyectoProvider): cabecera con
//     "← Proyectos" + nombre del expediente (enlace al dashboard), y nav con
//     las justificaciones SHIPPED no-dev agrupadas por DB, cada una con un dot
//     compacto de estado (estadoDe). Las no-shipped NO se listan: la checklist
//     del dashboard ya muestra el mapa de cobertura completo — la sidebar queda
//     corta y útil.
//   - SIN provider (`/_smoke`): cabecera genérica de la app y solo el grupo
//     "Desarrollo" (el sandbox no pertenece a ningún expediente).
// =============================================================================

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Dot compacto de estado — misma semántica de colores que ChipEstado, sin texto. */
function DotEstado({ estado }: { estado: EstadoJustificacion }): JSX.Element {
  let clase: string;
  let texto: string;
  if (estado.aplicabilidad === "no_aplica") {
    clase = "bg-state-neutral";
    texto = "No aplica";
  } else if (estado.aplicabilidad === "externo") {
    clase = "bg-state-neutral";
    texto = "Externa";
  } else {
    switch (estado.progreso) {
      case "no_cumple":
        clase = "bg-state-fail";
        texto = "No cumple";
        break;
      case "cumple":
        if (estado.veredicto === "warn") {
          clase = "bg-state-warn";
          texto = "Cumple con avisos";
        } else {
          clase = "bg-state-ok";
          texto = "Cumple";
        }
        break;
      case "en_curso":
        clase = "bg-state-warn";
        texto = "En curso";
        break;
      case "sin_iniciar":
        clase = "border-border-main border bg-transparent";
        texto = "Sin iniciar";
        break;
    }
  }
  return (
    <span
      className={`h-2 w-2 shrink-0 rounded-full ${clase}`}
      role="img"
      aria-label={`Estado: ${texto}`}
      title={texto}
    />
  );
}

const LINK_BASE =
  "flex items-center gap-2.5 rounded-md px-2.5 py-1 text-[13px] transition-colors";

function linkClass({ isActive }: { isActive: boolean }): string {
  return [
    LINK_BASE,
    isActive
      ? "bg-tint-accent text-accent font-medium"
      : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
  ].join(" ");
}

function NavJustificacion(props: {
  entrada: JustificacionEntry;
  to: string;
  proyecto: Proyecto | null;
  onClose: () => void;
}): JSX.Element {
  const { entrada, to, proyecto, onClose } = props;
  const Icon = entrada.icon;
  return (
    <NavLink to={to} onClick={onClose} className={linkClass} title={`${entrada.codigo} — ${entrada.label}`}>
      {Icon !== undefined && <Icon size={15} className="shrink-0" />}
      <span className="min-w-0 flex-1 truncate">{entrada.label}</span>
      {proyecto !== null && !entrada.dev && (
        <DotEstado estado={estadoDe(proyecto, entrada.key as JustificacionKey)} />
      )}
    </NavLink>
  );
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  // Tolerante a null: la Sidebar también se monta en /_smoke, sin provider.
  const ctx = useContext(ProyectoContext);
  const proyecto = ctx?.proyecto ?? null;

  // En modo proyecto: solo shipped no-dev (nada de "Desarrollo" dentro del
  // expediente). En /_smoke: solo el grupo dev, con su ruta absoluta.
  const grupos = justificacionesPorGrupo({ soloShipped: true })
    .map((g) => ({
      grupo: g.grupo,
      entradas: g.entradas.filter(
        (e) => e.route !== undefined && (proyecto !== null ? !e.dev : e.dev === true),
      ),
    }))
    .filter((g) => g.entradas.length > 0);

  return (
    <aside
      className={[
        "bg-bg-surface border-border-sub flex w-60 shrink-0 flex-col border-r",
        "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:transition-transform",
        isOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
      ].join(" ")}
    >
      <div className="border-border-sub flex items-center justify-between gap-2 border-b px-4 py-2.5">
        {proyecto !== null ? (
          <div className="min-w-0">
            <Link
              to="/"
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary flex items-center gap-1 text-[11px] leading-tight transition-colors"
            >
              <ArrowLeft size={12} aria-hidden="true" />
              Proyectos
            </Link>
            <Link
              to={`/p/${proyecto.id}`}
              onClick={onClose}
              className="text-text-primary hover:text-accent block truncate text-[13px] leading-tight font-semibold transition-colors"
              title={proyecto.nombre}
            >
              {proyecto.nombre}
            </Link>
          </div>
        ) : (
          <div>
            <div className="text-text-primary text-[13px] leading-tight font-semibold">Concreta</div>
            <div className="text-text-disabled text-[11px] leading-tight">Instalaciones · CTE</div>
          </div>
        )}
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary shrink-0 p-1 lg:hidden"
          aria-label="Cerrar menú"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="scroll-hide flex-1 overflow-y-auto px-2.5 py-3">
        {grupos.map((g) => (
          <div key={g.grupo} className="mb-3">
            <div className="text-text-disabled mb-1 truncate px-2 text-[11px] font-medium tracking-[0.07em] uppercase">
              {g.grupo}
            </div>
            {g.entradas.map((e) => (
              <NavJustificacion
                key={e.key}
                entrada={e}
                to={proyecto !== null ? `/p/${proyecto.id}/${e.route}` : `/${e.route}`}
                proyecto={proyecto}
                onClose={onClose}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="border-border-sub text-text-disabled font-mono border-t px-4 py-2 text-[10.5px]">
        Motor v{ENGINE_VERSION}
      </div>
    </aside>
  );
}
