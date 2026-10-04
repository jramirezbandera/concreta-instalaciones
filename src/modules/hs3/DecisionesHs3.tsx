// DB-HS3 — Las decisiones del proyectista (feature-15, maqueta v4): sistema ·
// por dónde entra el aire · qué se hace si no cuadra lo que entra · garaje. Cada
// una dice lo habitual o lo que supone apartarse de ello. Se guardan como
// «habitual» mientras coincidan con lo habitual.

import type { JSX } from "react";
import { Decision } from "../../components/justificacion/Decision";
import type { Edificio } from "../../lib/edificio/tipos";
import type { SistemaVentilacion } from "./calc";
import type { Hs3Estado } from "./estado";
import type { JustificacionHs3 } from "./justificacion";
import { decisionesHabitualesHs3, type Admision, type DecisionesEfectivasHs3, type Equilibrado, type SistemaGaraje } from "./red";

interface DecisionesHs3Props {
  state: Hs3Estado;
  setField: <K extends keyof Hs3Estado>(field: K, value: Hs3Estado[K]) => void;
  j: JustificacionHs3;
  edificio: Edificio;
}

export function DecisionesHs3({ state, setField, j, edificio }: DecisionesHs3Props): JSX.Element {
  const d: DecisionesEfectivasHs3 = j.red.decisiones;
  const h = decisionesHabitualesHs3(edificio);
  const hayViviendas = j.red.tipos.length > 0;
  const hayGaraje = j.red.garajes.length > 0;

  const elegir = <K extends keyof DecisionesEfectivasHs3>(k: K, v: DecisionesEfectivasHs3[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as Hs3Estado[K]);
  };
  const enLoHabitual =
    state.sistema === "habitual" &&
    state.admision === "habitual" &&
    state.equilibrado === "habitual" &&
    state.garaje === "habitual";
  const volverAloHabitual = () => {
    setField("sistema", "habitual");
    setField("admision", "habitual");
    setField("equilibrado", "habitual");
    setField("garaje", "habitual");
  };

  const pequeno = j.red.garajes.every((g) => g.plazas <= 5 && g.superficie_m2 <= 100);
  const bajoRasante = j.red.garajes.some((g) => g.bajoRasante);
  const nSistema = 1;
  const nAdmision = 2;
  const nEquilibrado = 3;
  const nGaraje = hayViviendas ? 4 : 1;

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
        Decisiones
      </div>
      {hayViviendas && (
        <>
          <Decision<SistemaVentilacion>
            numero={nSistema}
            pregunta="Sistema"
            opciones={[
              { valor: "mecanica", label: "Mecánica" },
              { valor: "hibrida", label: "Híbrida" },
            ]}
            valor={d.sistema}
            habitual={h.sistema}
            onChange={(v) => elegir("sistema", v)}
            texto={
              d.sistema === "mecanica"
                ? "Extractores en la cubierta; los conductos se dimensionan con S ≥ 2,5·qvt."
                : "Tiro natural asistido por extractores: los conductos salen de las tablas 4.2 a 4.4 y un colectivo no sirve a más de 6 plantas."
            }
          />
          <Decision<Admision>
            numero={nAdmision}
            pregunta="Por dónde entra el aire"
            opciones={[
              { valor: "aireadores", label: "Aireadores" },
              { valor: "fachada", label: "Aberturas en fachada" },
            ]}
            valor={d.admision}
            habitual={h.admision}
            onChange={(v) => elegir("admision", v)}
            texto={
              d.admision === "aireadores"
                ? "En la carpintería de dormitorios y salón, a más de 1,80 m del suelo."
                : "Aberturas fijas en el muro de fachada de cada local seco, con la misma área efectiva (4·qv)."
            }
          />
          <Decision<Equilibrado>
            numero={nEquilibrado}
            pregunta="Si no cuadra lo que entra"
            opciones={[
              { valor: "proporcional", label: "Se reparte" },
              { valor: "salon", label: "Al salón" },
            ]}
            valor={d.equilibrado}
            habitual={h.equilibrado}
            onChange={(v) => elegir("equilibrado", v)}
            texto={
              d.equilibrado === "proporcional"
                ? "Lo que falta para igualar se reparte entre los locales en proporción a la tabla 2.1, como propone el comentario del Ministerio."
                : "Lo que falta para igualar se suma al salón (o a la cocina, si sobra admisión)."
            }
          />
        </>
      )}
      {hayGaraje && (
        <Decision<SistemaGaraje>
          numero={nGaraje}
          pregunta="Garaje"
          opciones={[
            { valor: "mecanica", label: "Mecánica" },
            { valor: "natural", label: "Natural" },
          ]}
          valor={d.garaje}
          habitual={h.garaje}
          onChange={(v) => elegir("garaje", v)}
          texto={
            d.garaje === "mecanica"
              ? "Extracción a cubierta; el aire entra por las aberturas de admisión o por la rampa."
              : pequeno
                ? "Garaje pequeño: aberturas en el mismo cerramiento, separadas al menos 1,5 m en vertical."
                : bajoRasante
                  ? "Aberturas mixtas en dos fachadas opuestas: un sótano tiene que tenerlas (patios o rampa)."
                  : "Aberturas mixtas en dos fachadas opuestas; ningún punto a más de 25 m de una."
          }
        />
      )}
      {(hayViviendas || hayGaraje) && (
        <div className="border-border-sub border-t pt-3 text-[12px]">
          <button
            type="button"
            onClick={volverAloHabitual}
            disabled={enLoHabitual}
            className="text-accent hover:text-accent-hover disabled:text-text-disabled disabled:cursor-default"
          >
            Volver a lo habitual
          </button>
        </div>
      )}
    </section>
  );
}
