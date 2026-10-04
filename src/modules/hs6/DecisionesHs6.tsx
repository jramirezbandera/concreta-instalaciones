// DB-HS6 — Las decisiones del proyectista (feature-15, maqueta v4): dónde va la
// barrera bajo el garaje · qué lleva lo que apoya en el terreno · cómo se
// justifica la barrera. Cada una dice lo habitual o lo que supone apartarse de
// ello; solo aparecen las que el edificio pide. Se guardan como «habitual»
// mientras coincidan con lo habitual.

import type { JSX } from "react";
import { Decision } from "../../components/justificacion/Decision";
import type { Hs6Estado } from "./estado";
import type { JustificacionHs6 } from "./justificacion";
import {
  decisionesHabitualesHs6,
  medidasTerrenoDe,
  type DecisionesEfectivasHs6,
  type MedidaTerreno,
  type PosicionBarrera,
  type ViaBarrera,
} from "./proteccion";

interface DecisionesHs6Props {
  state: Hs6Estado;
  setField: <K extends keyof Hs6Estado>(field: K, value: Hs6Estado[K]) => void;
  j: JustificacionHs6;
}

const ETIQUETA_MEDIDA: Record<MedidaTerreno, string> = {
  camara: "Cámara ventilada",
  despresurizacion: "Despresurización",
  barrera: "Solo la barrera",
};

export function DecisionesHs6({ state, setField, j }: DecisionesHs6Props): JSX.Element | null {
  const pr = j.proteccion;
  const d = pr.decisiones;
  const h = decisionesHabitualesHs6(pr.zona);
  const hayBarrera = j.elementos.some((e) => e.id === "barrera");
  const garaje = pr.sobreNoHabitable?.conGaraje ? "garaje" : "sótano";

  const elegir = <K extends keyof DecisionesEfectivasHs6>(k: K, v: DecisionesEfectivasHs6[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as Hs6Estado[K]);
  };
  const enLoHabitual =
    state.posicionBarrera === "habitual" && state.medidaTerreno === "habitual" && state.viaBarrera === "habitual";
  const volverAloHabitual = () => {
    setField("posicionBarrera", "habitual");
    setField("medidaTerreno", "habitual");
    setField("viaBarrera", "habitual");
  };

  if (!pr.aplica) {
    return (
      <section aria-label="Decisiones" className="flex flex-col">
        <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
          Decisiones
        </div>
        <p className="text-text-secondary text-[12.5px] leading-relaxed">
          {pr.zona === "sin_exigencia"
            ? "El municipio no está en el Apéndice B: no hay nada que decidir."
            : "Nada habitable toca el terreno ni está sobre un sótano: no hay nada que decidir."}
        </p>
      </section>
    );
  }

  // Qué se pregunta: la posición solo si hay un sótano no habitable bajo lo
  // habitable; la medida, si algo apoya en el terreno o en zona I (donde es la
  // única medida); la vía, si hay barrera.
  const verPosicion = hayBarrera && pr.sobreNoHabitable !== null;
  const verMedida = pr.sobreTerreno.length > 0 || pr.zona === "I";
  const verVia = hayBarrera;
  const nPosicion = verPosicion ? 1 : 0;
  const nMedida = nPosicion + (verMedida ? 1 : 0);
  const nVia = nMedida + (verVia ? 1 : 0);

  const textoMedida = (m: MedidaTerreno): string => {
    if (m === "barrera") return "Basta la barrera de protección: en zona I es una de las dos medidas que valen.";
    if (m === "despresurizacion") return "Una red de captación bajo la solera conectada a un conducto con extracción mecánica.";
    return pr.sobreTerreno.length > 0
      ? "Forjado sanitario con cámara de aire ventilada: 10 cm² de aberturas por metro de perímetro."
      : `Sin nada que apoye en el terreno, el ${garaje} ventilado hace de cámara (criterio de proyecto).`;
  };

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
        Decisiones
      </div>
      {verPosicion && (
        <Decision<PosicionBarrera>
          numero={nPosicion}
          pregunta={`Dónde va la barrera bajo el ${garaje}`}
          opciones={[
            { valor: "solera", label: "Solera y muros" },
            { valor: "forjado", label: "Forjado de PB" },
          ]}
          valor={d.posicionBarrera}
          habitual={h.posicionBarrera}
          onChange={(v) => elegir("posicionBarrera", v)}
          texto={
            d.posicionBarrera === "solera"
              ? `Bajo la solera y en los muros del ${garaje}: todo el sótano queda dentro de la protección.`
              : `En el forjado de la planta baja: el ${garaje} queda fuera y lo que lo atraviesa —el núcleo, los pasos— se sella.`
          }
        />
      )}
      {verMedida && (
        <Decision<MedidaTerreno>
          numero={nMedida}
          pregunta={pr.zona === "I" ? "La medida" : "Además, bajo lo que apoya en el terreno"}
          opciones={medidasTerrenoDe(pr.zona).map((m) => ({ valor: m, label: ETIQUETA_MEDIDA[m] }))}
          valor={d.medidaTerreno}
          habitual={h.medidaTerreno}
          onChange={(v) => elegir("medidaTerreno", v)}
          texto={textoMedida(d.medidaTerreno)}
        />
      )}
      {verVia && (
        <Decision<ViaBarrera>
          numero={nVia}
          pregunta="La barrera"
          opciones={[
            { valor: "lamina_tipo", label: "Lámina tipo" },
            { valor: "calculo", label: "Por cálculo" },
          ]}
          valor={d.viaBarrera}
          habitual={h.viaBarrera}
          onChange={(v) => elegir("viaBarrera", v)}
          texto={
            d.viaBarrera === "lamina_tipo"
              ? "Al menos 2 mm y un coeficiente de difusión menor que 10⁻¹¹ m²/s: vale sin cálculo."
              : "La exhalación a través de la barrera se calcula (ap. 3.1.2) y se justifica en documento aparte."
          }
        />
      )}
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
    </section>
  );
}
