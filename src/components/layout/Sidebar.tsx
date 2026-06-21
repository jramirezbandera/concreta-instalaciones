import { NavLink } from "react-router";
import { X } from "lucide-react";
import { modulesByGroup } from "../../data/moduleRegistry";
import { ENGINE_VERSION } from "../../lib/version";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const groups = modulesByGroup();

  return (
    <aside
      className={[
        "bg-bg-surface border-border-main flex w-60 shrink-0 flex-col border-r",
        "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-50 max-lg:transition-transform",
        isOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
      ].join(" ")}
    >
      <div className="border-border-main flex items-center justify-between border-b px-4 py-3">
        <div>
          <div className="text-text-primary text-[13px] leading-tight font-semibold">Concreta</div>
          <div className="text-text-disabled text-[11px] leading-tight">Instalaciones · CTE</div>
        </div>
        <button
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary p-1 lg:hidden"
          aria-label="Cerrar menú"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="scroll-hide flex-1 overflow-y-auto px-2.5 py-3">
        {groups.map((g) => (
          <div key={g.group} className="mb-4">
            <div className="text-text-disabled mb-1 px-2 text-[10px] font-semibold tracking-[0.07em] uppercase">
              {g.group}
            </div>
            {g.modules.map((m) => {
              const Icon = m.icon;
              const content = (
                <>
                  <Icon size={15} />
                  <span className="flex-1">{m.label}</span>
                  {!m.shipped && <span className="text-text-disabled text-[10px]">Próx.</span>}
                </>
              );
              const base =
                "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors";
              if (!m.shipped) {
                return (
                  <div
                    key={m.key}
                    className={`${base} text-text-disabled cursor-not-allowed`}
                    aria-disabled="true"
                  >
                    {content}
                  </div>
                );
              }
              return (
                <NavLink
                  key={m.key}
                  to={m.route}
                  onClick={onClose}
                  className={({ isActive }) =>
                    [
                      base,
                      isActive
                        ? "bg-tint-accent text-accent font-medium"
                        : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                    ].join(" ")
                  }
                >
                  {content}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-border-main text-text-disabled border-t px-4 py-2.5 text-[10px]">
        Motor v{ENGINE_VERSION}
      </div>
    </aside>
  );
}
