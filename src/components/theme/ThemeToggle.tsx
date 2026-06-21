import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../lib/theme/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      className="hover:bg-bg-elevated text-text-secondary hover:text-text-primary rounded-md p-2 transition-colors"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
