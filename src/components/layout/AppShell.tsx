import { Suspense, createContext, useContext, useState } from "react";
import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";
import { ToastContainer } from "../ui/Toast";
import { RouteFallback } from "./RouteFallback";
import { ChunkErrorBoundary } from "./ChunkErrorBoundary";

interface DrawerContextType {
  openDrawer: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components -- context co-located with the AppShell provider; HMR full-reload is acceptable
export const DrawerContext = createContext<DrawerContextType>({ openDrawer: () => {} });

// eslint-disable-next-line react-refresh/only-export-components
export function useDrawer() {
  return useContext(DrawerContext);
}

export function AppShell() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <DrawerContext.Provider value={{ openDrawer: () => setDrawerOpen(true) }}>
      {/* `relative` en la caja y en la columna: un overflow solo recorta a los
          hijos absolutos (p. ej. los `sr-only`) si es su bloque contenedor. Sin
          él escapan a su posición en la lista, estiran el documento y la ventana
          entera se desplaza arrastrando la app. */}
      <div className="bg-bg-primary text-text-primary relative flex h-screen overflow-hidden">
        {/* Mobile backdrop */}
        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
        )}

        <Sidebar isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          <ChunkErrorBoundary>
            <Suspense fallback={<RouteFallback />}>
              <Outlet />
            </Suspense>
          </ChunkErrorBoundary>
        </div>

        <ToastContainer />
      </div>
    </DrawerContext.Provider>
  );
}
