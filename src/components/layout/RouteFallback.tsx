import { Loader2 } from "lucide-react";

export function RouteFallback() {
  return (
    <div className="flex h-full flex-1 items-center justify-center" aria-busy="true">
      <Loader2 className="text-text-disabled animate-spin" size={24} />
      <span className="sr-only">Cargando módulo…</span>
    </div>
  );
}
