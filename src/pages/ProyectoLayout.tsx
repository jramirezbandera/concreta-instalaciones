import { useEffect, useMemo, type JSX } from "react";
import { Navigate, useParams } from "react-router";
import { AppShell } from "../components/layout/AppShell";
import { ProyectoProvider } from "../lib/proyecto/ProyectoContext";
import { cargarProyecto, setProyectoActivo } from "../lib/proyecto/storage";

// =============================================================================
// ProyectoLayout — feature-6 T4.1: layout route de `/p/:id`. Carga el proyecto
// del storage y monta el ProyectoProvider + AppShell; las rutas hijas (index =
// dashboard, `datos`, y las justificaciones lazy) renderizan en el <Outlet/>
// interno del AppShell. El `key={id}` en el provider fuerza el remonte completo
// al cambiar de proyecto: `proyectoInicial` solo se lee al montar (init-una-vez
// del provider y de los hooks de módulo), así que dos ids distintos NUNCA deben
// compartir instancia.
// =============================================================================

export function ProyectoLayout(): JSX.Element {
  const { id } = useParams<{ id: string }>();

  // Carga memoizada por id: una lectura de localStorage por proyecto abierto,
  // no una por render. El provider persiste después por su propio camino.
  const proyecto = useMemo(() => (id === undefined ? null : cargarProyecto(id)), [id]);

  // Fijar el activo es bookkeeping (side effect), no render: en efecto.
  useEffect(() => {
    if (id !== undefined && proyecto !== null) setProyectoActivo(id);
  }, [id, proyecto]);

  if (id === undefined || proyecto === null) {
    // Id desconocido, proyecto borrado o clave corrupta → a la lista.
    return <Navigate to="/" replace />;
  }

  return (
    <ProyectoProvider key={id} proyectoInicial={proyecto}>
      <AppShell />
    </ProyectoProvider>
  );
}
