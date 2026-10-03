import { useState, type JSX } from "react";
import { Navigate, useLocation } from "react-router";
import { inicializarStorage, proyectoActivoId } from "../lib/proyecto/storage";

// =============================================================================
// RedirectLegacy — feature-6 T4.1: compatibilidad con las URLs pre-expediente
// (`/hs/ventilacion`, `/he/envolvente?…`). Los enlaces "Compartir" antiguos
// apuntan ahí, así que redirigimos a la misma subruta DENTRO del proyecto
// activo, CONSERVANDO el query string (URL > proyecto: los inputs compartidos
// mandan sobre lo persistido).
//
// `inicializarStorage` corre ANTES de resolver el destino: es idempotente y
// garantiza que la migración legacy (claves sueltas → proyecto "Importado") ya
// ocurrió y que hay un activo fijado, incluso si esta URL es lo primero que se
// abre en un navegador con datos de la app antigua.
// =============================================================================

export function RedirectLegacy(): JSX.Element {
  const location = useLocation();

  // useState-initializer: el destino se resuelve UNA vez al montar (el redirect
  // desmonta este componente inmediatamente; no hay re-resoluciones).
  const [destino] = useState<string>(() => {
    inicializarStorage(new Date().toISOString());
    const activo = proyectoActivoId();
    if (activo === null) return "/"; // imposible en la práctica tras inicializar
    const subruta = location.pathname.replace(/^\//, "");
    return `/p/${activo}/${subruta}${location.search}`;
  });

  return <Navigate to={destino} replace />;
}
