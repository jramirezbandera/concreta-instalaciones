import { useRouteError } from "react-router";

/**
 * Router errorElement — catches `route.lazy()` rejections (stale chunk URLs
 * after a deploy) that fire before the new route's boundary exists.
 */
export function ChunkErrorElement() {
  const error = useRouteError();
  console.error("Route load error:", error);
  return (
    <div className="bg-bg-primary text-text-primary flex h-screen flex-col items-center justify-center gap-3 p-8 text-center">
      <p className="text-text-secondary text-sm">
        No se pudo cargar la página. Puede deberse a una versión nueva publicada.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg rounded-md px-4 py-1.5 text-sm font-medium"
      >
        Recargar
      </button>
    </div>
  );
}
