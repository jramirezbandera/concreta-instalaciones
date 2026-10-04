// DB-SI, SI 4 — Pantalla de las instalaciones de protección contra incendios
// (feature-19). La pantalla es la común (`PantallaSi`); aquí van las decisiones:
// si hay un hidrante público cerca y, cuando decide una instalación, la
// superficie construida (que se guarda en la zona de El edificio).

import type { JSX } from "react";
import { Decision } from "../../components/justificacion/Decision";
import { Construidas } from "../si/Construidas";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { si4 } from "./definicion";
import type { HidrantePublico, Si4Estado } from "./estado";
import { zonasConstruidaSi4, type JustificacionSi4 } from "./justificacion";

function DecisionesSi4({ setField, j, edificio, cambiarEdificio }: PropsDecisionesSi<Si4Estado, JustificacionSi4>): JSX.Element {
  const hid = j.elementos.find((e) => e.id === "hidrantes")?.detalle;
  const exigeHidrantes = hid !== undefined && hid.clase === "hidrantes" && hid.exige;
  const construidas = zonasConstruidaSi4(j);
  const nConstruida = exigeHidrantes ? 2 : 1;
  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {!exigeHidrantes && construidas.length === 0 && (
        <p className="text-text-secondary border-border-sub border-t pt-3 pb-3 text-[12px] leading-normal">
          La dotación sale entera de El edificio: no hay nada que decidir.
        </p>
      )}

      {exigeHidrantes && (
        <Decision<HidrantePublico>
          numero={1}
          pregunta="Hidrante en la vía pública"
          opciones={[
            { valor: "si", label: "A menos de 100 m" },
            { valor: "no", label: "No hay" },
          ]}
          valor={j.decisiones.hidrantePublico}
          habitual={j.habituales.hidrantePublico}
          onChange={(v) => setField("hidrantePublico", v === j.habituales.hidrantePublico ? "habitual" : v)}
          texto={
            j.decisiones.hidrantePublico === "si"
              ? "Cuenta para la dotación el hidrante de la calle a menos de 100 m de la fachada accesible."
              : "El proyecto dispone su hidrante, que puede conectarse a la red pública."
          }
        />
      )}

      {construidas.length > 0 && (
        <Construidas
          numero={nConstruida}
          zonas={construidas}
          edificio={edificio}
          cambiarEdificio={cambiarEdificio}
          texto="Las BIE, la detección y los hidrantes dependen de la superficie construida. Sin ella se supone la útil × 1,20 (criterio)."
        />
      )}
    </section>
  );
}

export function Si4Module(): JSX.Element {
  return <PantallaSi def={si4} Decisiones={DecisionesSi4} />;
}
