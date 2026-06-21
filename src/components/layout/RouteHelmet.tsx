import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router";
import { getModuleByRoute } from "../../data/moduleRegistry";

/**
 * Sets <title>/<meta description> synchronously on navigation, BEFORE the lazy
 * chunk lands — so the previous module's title doesn't linger during load.
 */
export function RouteHelmet() {
  const { pathname } = useLocation();
  const mod = getModuleByRoute(pathname);
  const title = mod
    ? `${mod.label} · Concreta Instalaciones`
    : "Concreta Instalaciones";
  const description = mod
    ? `Predimensionado y ficha justificativa CTE — ${mod.label} (${mod.edicionDB}).`
    : "Predimensionado de instalaciones + ficha justificativa CTE para arquitectos.";
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
}
