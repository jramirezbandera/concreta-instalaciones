export type MobileTab = "inputs" | "diagramas" | "results";

interface MobileTabBarProps {
  tab: MobileTab;
  setTab: (t: MobileTab) => void;
}

const TABS: { id: MobileTab; label: string }[] = [
  { id: "inputs", label: "Datos" },
  { id: "diagramas", label: "Diagrama" },
  { id: "results", label: "Resultado" },
];

/** Conmutador de pestañas (solo móvil; en `lg` el layout es de 2 columnas). */
export function MobileTabBar({ tab, setTab }: MobileTabBarProps) {
  return (
    <div className="border-border-main bg-bg-surface flex shrink-0 border-b lg:hidden">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => setTab(t.id)}
          aria-pressed={tab === t.id}
          className={[
            "flex-1 py-2.5 text-xs font-medium transition-colors",
            tab === t.id
              ? "text-accent border-accent border-b-2"
              : "text-text-secondary border-b-2 border-transparent",
          ].join(" ")}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
