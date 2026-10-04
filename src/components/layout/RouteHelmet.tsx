import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router";
import { getJustificacionBySubruta } from "../../data/justificacionRegistry";

/**
 * Sets <title>/<meta description> synchronously on navigation, BEFORE the lazy
 * chunk lands — so the previous module's title doesn't linger during load.
 *
 * feature-6 T4.1: las rutas de justificación ya no son exactas ("/hs/radon")
 * sino relativas al expediente ("/p/:id/hs/radon"), así que el título se
 * resuelve por PATRÓN de pathname, no por comparación exacta.
 */

const SUFIJO = "Concreta Instalaciones";
const DESC_GENERICA =
  "Predimensionado de instalaciones + ficha justificativa CTE para arquitectos.";

function resolver(pathname: string): { title: string; description: string } {
  if (pathname === "/") {
    return { title: `Proyectos · ${SUFIJO}`, description: DESC_GENERICA };
  }
  if (pathname === "/nuevo") {
    return { title: `Nuevo proyecto · ${SUFIJO}`, description: DESC_GENERICA };
  }

  // Subruta de justificación: "/_smoke" directo, o "/p/:id/<subruta>".
  let subruta: string | null = null;
  if (pathname === "/_smoke") {
    subruta = "_smoke";
  } else {
    const m = /^\/p\/[^/]+(?:\/(.*))?$/.exec(pathname);
    if (m !== null) {
      const resto = m[1] ?? "";
      if (resto === "") return { title: `La obra · ${SUFIJO}`, description: DESC_GENERICA };
      if (resto === "datos") {
        return { title: `Datos del proyecto · ${SUFIJO}`, description: DESC_GENERICA };
      }
      if (resto === "edificio") return { title: `El edificio · ${SUFIJO}`, description: DESC_GENERICA };
      if (resto === "memoria") return { title: `Memoria CTE · ${SUFIJO}`, description: DESC_GENERICA };
      subruta = resto;
    }
  }

  if (subruta !== null) {
    const j = getJustificacionBySubruta(subruta);
    if (j !== undefined) {
      return {
        title: `${j.codigo} ${j.label} · ${SUFIJO}`,
        description: `Predimensionado y ficha justificativa CTE — ${j.codigo} ${j.label} (${j.edicionDB}).`,
      };
    }
  }

  return { title: SUFIJO, description: DESC_GENERICA };
}

export function RouteHelmet() {
  const { pathname } = useLocation();
  const { title, description } = resolver(pathname);
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
}
