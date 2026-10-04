// DB-SUA, SUA 4 — Pantalla de iluminación (feature-20). La pantalla es la común
// (`PantallaSi`); las zonas con alumbrado de emergencia salen de El edificio.
// Aquí van las dos decisiones: el alumbrado de emergencia del garaje de la
// unifamiliar y el tipo de instalación.

import type { JSX } from "react";
import { Decision } from "../../components/justificacion/Decision";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { sua4 } from "./definicion";
import type { EmergenciaGaraje, Sua4Estado, TipoInstalacion } from "./estado";
import type { JustificacionSua4 } from "./justificacion";
import { INSTALACION_EMERGENCIA_SUA4_2_3 } from "./tablas";

function DecisionesSua4({ setField, j }: PropsDecisionesSi<Sua4Estado, JustificacionSua4>): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  const nInstalacion = j.garajeVivienda ? 2 : 1;

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {j.garajeVivienda && (
        <Decision<EmergenciaGaraje>
          numero={1}
          pregunta="Emergencia en el garaje"
          opciones={[
            { valor: "si", label: "Sí" },
            { valor: "no", label: "No" },
          ]}
          valor={d.garajeVivienda}
          habitual={h.garajeVivienda}
          onChange={(v) => setField("garajeVivienda", v === h.garajeVivienda ? "habitual" : v)}
          texto={
            d.garajeVivienda === "si"
              ? "Una luminaria junto a la puerta de salida del garaje: es local de riesgo especial bajo (SI 1) y SUA 4 ap. 2.1 d) lo pide en lectura literal."
              : "Sin luminaria de emergencia en el garaje: la memoria tendrá que justificarlo."
          }
        />
      )}

      {j.conEmergencia && (
        <Decision<TipoInstalacion>
          numero={nInstalacion}
          pregunta="Instalación de emergencia"
          opciones={[
            { valor: "autonomas", label: "Autónomas" },
            { valor: "centralizada", label: "Centralizada" },
          ]}
          valor={d.instalacion}
          habitual={h.instalacion}
          onChange={(v) => setField("instalacion", v === h.instalacion ? "habitual" : v)}
          texto={
            d.instalacion === "autonomas"
              ? `Luminarias autónomas con su batería: fuente propia, ${INSTALACION_EMERGENCIA_SUA4_2_3.datos.autonomiaMin_h} h de autonomía.`
              : "Sistema centralizado de baterías: también es fuente propia de energía."
          }
        />
      )}
    </section>
  );
}

export function Sua4Module(): JSX.Element {
  return <PantallaSi def={sua4} Decisiones={DecisionesSua4} />;
}
