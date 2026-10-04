import { useEffect, type JSX } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";

// =============================================================================
// Aviso de versión nueva (PWA, `registerType: "prompt"`). Cuando hay un service
// worker nuevo esperando, se ofrece actualizar: «Actualizar» lo activa y recarga
// la página. Los proyectos no se pierden: viven en localStorage y lo pendiente
// del debounce se escribe en `beforeunload` (ProyectoContext).
//
// La app se deja abierta horas: además de la comprobación al cargar, se vuelve a
// mirar cada hora y al volver a la pestaña, siempre con red.
//
// Va en la raíz (RootLayout), no en el AppShell: también avisa en la portada.
// =============================================================================

/** Cada cuánto se busca una versión nueva con la app abierta [ms]. */
const COMPROBAR_CADA_MS = 60 * 60 * 1000;

export function AvisoActualizacion(): JSX.Element | null {
  const {
    needRefresh: [hayNueva, setHayNueva],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registro) {
      if (!registro) return;
      const comprobar = () => {
        if (registro.installing || !navigator.onLine) return;
        registro.update().catch(() => {
          // Sin red o el servidor no responde: se reintenta en la siguiente.
        });
      };
      setInterval(comprobar, COMPROBAR_CADA_MS);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") comprobar();
      });
    },
  });

  // Escape cierra el aviso (lo mismo que «Más tarde»).
  useEffect(() => {
    if (!hayNueva) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setHayNueva(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hayNueva, setHayNueva]);

  if (!hayNueva) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-bg-primary border-border-main fixed bottom-4 left-4 z-50 w-[min(360px,calc(100vw-32px))] rounded border p-4 shadow-lg"
    >
      <p className="text-text-primary text-[13.5px] font-semibold">Hay una versión nueva</p>
      <p className="text-text-secondary mt-1 text-[12.5px] leading-snug">
        Actualiza para usarla. Tus proyectos se quedan como están.
      </p>
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setHayNueva(false)}
          className="text-text-secondary hover:text-text-primary h-8 rounded px-3 text-[12.5px] transition-colors"
        >
          Más tarde
        </button>
        <button
          type="button"
          onClick={() => void updateServiceWorker(true)}
          className="bg-accent hover:bg-accent-hover text-bg-primary h-8 rounded px-3 text-[12.5px] font-medium transition-colors"
        >
          Actualizar
        </button>
      </div>
    </div>
  );
}
