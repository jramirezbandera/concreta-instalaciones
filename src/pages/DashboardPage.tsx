import type { JSX } from "react";
import { CabeceraProyecto } from "../components/proyecto/CabeceraProyecto";
import { ChecklistJustificaciones } from "../components/proyecto/ChecklistJustificaciones";
import { TarjetaAnejo } from "../components/proyecto/TarjetaAnejo";
import { TarjetaDatosProyecto } from "../components/proyecto/TarjetaDatosProyecto";
import { TarjetaViviendasTipo } from "../components/proyecto/TarjetaViviendasTipo";

// Dashboard del expediente (feature-6 T3.5, UX-RECONCEPT §4.2) — la pieza nueva
// más importante: responde a "¿por dónde empiezo?" (checklist con estados) y
// "¿he terminado?" (tarjeta Anejo). Se renderiza DENTRO de <ProyectoProvider>
// (los hijos consumen useProyecto()); los enlaces `datos` y las rutas de
// justificación son RELATIVOS a la ruta del proyecto.

export function DashboardPage(): JSX.Element {
  return (
    <div className="scroll-hide flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-5xl px-4 py-5">
        <CabeceraProyecto />

        {/* Grid contenido + carril derecho (~340px); 1 columna en estrecho. */}
        <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ChecklistJustificaciones />
          <div className="flex min-w-0 flex-col gap-4">
            <TarjetaAnejo />
            <TarjetaViviendasTipo />
            <TarjetaDatosProyecto />
          </div>
        </div>
      </div>
    </div>
  );
}
