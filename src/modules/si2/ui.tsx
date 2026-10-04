// DB-SI, SI 2 — Pantalla de la propagación exterior (feature-19). La pantalla
// es la común (`PantallaSi`); aquí van las decisiones sobre el exterior, que El
// edificio no describe: medianeras, ángulo entre fachadas de sectores distintos,
// fachada ventilada y arranque accesible al público.

import type { JSX } from "react";
import { Decision } from "../../components/justificacion/Decision";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { si2 } from "./definicion";
import type { Arranque, DecisionesSi2, Encuentro, FachadaVentilada, Medianeras, Si2Estado } from "./estado";
import type { JustificacionSi2 } from "./justificacion";

function DecisionesSi2({ setField, j }: PropsDecisionesSi<Si2Estado, JustificacionSi2>): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  const elegir = <K extends keyof DecisionesSi2>(k: K, v: DecisionesSi2[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as Si2Estado[K]);
  };
  const horizontal = j.elementos.some((e) => e.id === "horizontal");
  const n = { medianeras: 1, encuentro: 2, ventilada: horizontal ? 3 : 2, arranque: horizontal ? 4 : 3 };
  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      <Decision<Medianeras>
        numero={n.medianeras}
        pregunta="Medianeras"
        opciones={[
          { valor: "si", label: "Entre medianeras" },
          { valor: "no", label: "Aislado" },
        ]}
        valor={d.medianeras}
        habitual={h.medianeras}
        onChange={(v) => elegir("medianeras", v)}
        texto={d.medianeras === "si" ? "Separación EI 120 con los edificios colindantes y franja REI 60 de 0,50 m en la cubierta." : "Sin edificios colindantes: no hay medianerías."}
      />

      {horizontal && (
        <Decision<Encuentro>
          numero={n.encuentro}
          pregunta="Fachadas de sectores distintos"
          opciones={[
            { valor: "plano", label: "En un plano" },
            { valor: "esquina", label: "En esquina" },
            { valor: "enfrentadas", label: "Enfrentadas" },
          ]}
          valor={d.encuentro}
          habitual={h.encuentro}
          onChange={(v) => elegir("encuentro", v)}
          texto={d.encuentro === "plano" ? "En un mismo plano (180°): huecos a 0,50 m." : d.encuentro === "esquina" ? "En esquina (90°): huecos a 2,00 m." : "Enfrentadas (0°): huecos a 3,00 m."}
        />
      )}

      <Decision<FachadaVentilada>
        numero={n.ventilada}
        pregunta="Fachada ventilada"
        opciones={[
          { valor: "no", label: "No" },
          { valor: "si", label: "Con cámara ventilada" },
        ]}
        valor={d.ventilada}
        habitual={h.ventilada}
        onChange={(v) => elegir("ventilada", v)}
        texto={d.ventilada === "si" ? "El aislamiento de la cámara tiene su propia clase, y barreras E 30 en los forjados entre sectores." : "Sin cámara ventilada, cuenta la clase de los sistemas de fachada."}
      />

      <Decision<Arranque>
        numero={n.arranque}
        pregunta="Arranque de la fachada"
        opciones={[
          { valor: "publico", label: "A la acera" },
          { valor: "privado", label: "No accesible" },
        ]}
        valor={d.arranque}
        habitual={h.arranque}
        onChange={(v) => elegir("arranque", v)}
        texto={d.arranque === "publico" ? "Accesible al público: B-s3,d0 hasta 3,5 m si la fachada no pasa de 18 m." : "En parcela privada o protegido: no se exige nada más en el arranque."}
      />
    </section>
  );
}

export function Si2Module(): JSX.Element {
  return <PantallaSi def={si2} Decisiones={DecisionesSi2} />;
}
