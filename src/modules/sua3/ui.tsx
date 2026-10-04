// DB-SUA, SUA 3 — Pantalla de aprisionamiento (feature-20). La pantalla es la
// común (`PantallaSi`); aquí van las dos decisiones que El edificio no describe:
// si los baños y aseos tienen pestillo y, en las oficinas, si el aseo accesible
// está en zona de uso público. La fuerza de apertura es declarativa.

import type { JSX } from "react";
import { Decision } from "../../components/justificacion/Decision";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { sua3 } from "./definicion";
import type { AseoPublico, Pestillos, Sua3Estado } from "./estado";
import type { JustificacionSua3 } from "./justificacion";

function DecisionesSua3({ setField, j }: PropsDecisionesSi<Sua3Estado, JustificacionSua3>): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  const conBloqueo = j.elementos.some((e) => e.id === "bloqueo");
  const nAseo = conBloqueo ? 2 : 1;

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {conBloqueo && (
        <Decision<Pestillos>
          numero={1}
          pregunta="Pestillos de baños y aseos"
          opciones={[
            { valor: "desbloqueo", label: "Con condena" },
            { valor: "sin_pestillo", label: "Sin pestillo" },
          ]}
          valor={d.pestillos}
          habitual={h.pestillos}
          onChange={(v) => setField("pestillos", v === h.pestillos ? "habitual" : v)}
          texto={
            d.pestillos === "desbloqueo"
              ? "Condena que se abre desde fuera con una moneda o una llave. En las oficinas, además, la luz se enciende desde dentro."
              : "Sin dispositivo de bloqueo interior: no hay riesgo de quedar encerrado."
          }
        />
      )}

      {j.oficinas && (
        <Decision<AseoPublico>
          numero={nAseo}
          pregunta="Aseo accesible de uso público"
          opciones={[
            { valor: "si", label: "Sí" },
            { valor: "no", label: "No" },
          ]}
          valor={d.aseoPublico}
          habitual={h.aseoPublico}
          onChange={(v) => setField("aseoPublico", v === h.aseoPublico ? "habitual" : v)}
          texto={
            d.aseoPublico === "si"
              ? "Sirve a la atención al público o a las salas de reuniones: lleva llamada de asistencia."
              : "Solo lo usa el personal: la llamada de asistencia no se exige."
          }
        />
      )}
    </section>
  );
}

export function Sua3Module(): JSX.Element {
  return <PantallaSi def={sua3} Decisiones={DecisionesSua3} />;
}
