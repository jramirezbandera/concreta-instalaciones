// DB-SUA, SUA 6 — Pantalla del riesgo de ahogamiento (feature-20). La pantalla es
// la común (`PantallaSi`); aquí van las decisiones sobre la piscina comunitaria,
// que El edificio no describe (solo se sabe si la hay): el acceso de niños, los
// vasos y sus profundidades, el andén y las escaleras; y los pozos y depósitos.

import type { JSX } from "react";
import { CampoNumero } from "../../components/edificio/controles";
import { Decision, DecisionValor } from "../../components/justificacion/Decision";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { sua6 } from "./definicion";
import type { Acceso, Anden, DecisionesSua6, Escaleras, Pozos, Sua6Estado, Vasos } from "./estado";
import type { JustificacionSua6 } from "./justificacion";
import { m, metros } from "./textos";

function DecisionesSua6({ state, setField, j }: PropsDecisionesSi<Sua6Estado, JustificacionSua6>): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  const elegir = <K extends keyof DecisionesSua6>(k: K, v: DecisionesSua6[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as Sua6Estado[K]);
  };
  const cifra = (k: "barrera_m" | "profMin_m" | "profMax_m" | "profInfantil_m" | "anden_m" | "separacion_m", v: number) => {
    const r = Math.round(v * 100) / 100;
    elegir(k, r > 0 ? r : h[k]);
  };
  const recreo = d.vasos !== "infantil";
  const infantil = d.vasos !== "recreo";
  // Números fijos: con el React Compiler, un contador mutado en el JSX se memoriza mal.
  const n = {
    acceso: 1,
    vasos: 2,
    recreo: 3,
    infantil: recreo ? 4 : 3,
    anden: recreo && infantil ? 5 : 4,
    escaleras: infantil ? 6 : 5,
    pozos: !j.aplica ? 1 : recreo ? (infantil ? 7 : 6) : 5,
  };
  const habitual = (...k: (keyof Sua6Estado)[]) => k.every((x) => state[x] === "habitual" || state[x] === undefined);

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {!j.aplica && (
        <p className="text-text-secondary border-border-sub border-t pt-3 pb-3 text-[12px] leading-normal">
          {j.motivo === "sin_piscina"
            ? "Sin piscina de uso colectivo no hay nada que decidir sobre ella: solo se declaran los pozos y depósitos."
            : "La piscina de una vivienda unifamiliar queda fuera del ámbito: solo se declaran los pozos y depósitos."}
        </p>
      )}

      {j.aplica && (
        <Decision<Acceso>
          numero={n.acceso}
          pregunta="Acceso de niños a la zona de baño"
          opciones={[
            { valor: "barrera", label: "Barrera" },
            { valor: "controlado", label: "Controlado" },
          ]}
          valor={d.acceso}
          habitual={h.acceso}
          esHabitual={habitual("acceso", "barrera_m")}
          onChange={(v) => elegir("acceso", v)}
          extra={
            d.acceso === "barrera" ? (
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-text-disabled text-[11px]">Altura de la barrera</span>
                <CampoNumero id="sua6-barrera" value={d.barrera_m} unidad="m" decimales={2} onChange={(v) => cifra("barrera_m", v)} />
              </div>
            ) : undefined
          }
          texto={
            d.acceso === "barrera"
              ? "No está controlado: barrera de 1,20 m como mínimo, resistente a 0,5 kN/m y no escalable, con puerta de cierre y bloqueo."
              : "Las puertas o el recinto de la piscina se cierran fuera del horario de baño: no hace falta barrera en el vaso."
          }
        />
      )}

      {j.aplica && (
        <Decision<Vasos>
          numero={n.vasos}
          pregunta="Vasos"
          opciones={[
            { valor: "recreo", label: "Recreo" },
            { valor: "infantil", label: "Infantil" },
            { valor: "ambos", label: "Los dos" },
          ]}
          valor={d.vasos}
          habitual={h.vasos}
          onChange={(v) => elegir("vasos", v)}
          texto={
            d.vasos === "recreo"
              ? "Un vaso de recreo, sin chapoteo aparte."
              : d.vasos === "infantil"
                ? "Solo un vaso infantil, de 0,50 m como mucho y sin las condiciones de escaleras."
                : "Un vaso de recreo y un vaso infantil, de 0,50 m como mucho."
          }
        />
      )}

      {j.aplica && recreo && (
        <DecisionValor
          numero={n.recreo}
          pregunta="Profundidad del vaso de recreo"
          marca={habitual("profMin_m", "profMax_m") ? { texto: "lo habitual" } : { texto: "indicada" }}
          control={
            <div className="flex items-center gap-1.5">
              <CampoNumero id="sua6-prof-min" value={d.profMin_m} unidad="m" decimales={2} onChange={(v) => cifra("profMin_m", v)} />
              <span className="text-text-disabled text-[12px]">a</span>
              <CampoNumero id="sua6-prof-max" value={d.profMax_m} unidad="m" decimales={2} onChange={(v) => cifra("profMax_m", v)} />
            </div>
          }
          texto={`Mínima y máxima: hasta 3 m, con zonas de menos de 1,40 m.${d.profMax_m > 1.4 ? " Los puntos de más de 1,40 m se señalizan." : ""}`}
        />
      )}

      {j.aplica && infantil && (
        <DecisionValor
          numero={n.infantil}
          pregunta="Profundidad del vaso infantil"
          marca={habitual("profInfantil_m") ? { texto: "lo habitual" } : { texto: "indicada" }}
          control={<CampoNumero id="sua6-prof-infantil" value={d.profInfantil_m} unidad="m" decimales={2} onChange={(v) => cifra("profInfantil_m", v)} />}
          texto="La máxima del vaso infantil: 0,50 m como mucho, con pendientes de hasta el 6 %."
        />
      )}

      {j.aplica && (
        <Decision<Anden>
          numero={n.anden}
          pregunta="Andén alrededor del vaso"
          opciones={[
            { valor: "si", label: "Con andén" },
            { valor: "no", label: "Sin andén" },
          ]}
          valor={d.anden}
          habitual={h.anden}
          esHabitual={habitual("anden", "anden_m")}
          onChange={(v) => elegir("anden", v)}
          extra={
            d.anden === "si" ? (
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-text-disabled text-[11px]">Anchura</span>
                <CampoNumero id="sua6-anden" value={d.anden_m} unidad="m" decimales={2} onChange={(v) => cifra("anden_m", v)} />
              </div>
            ) : undefined
          }
          texto={
            d.anden === "si"
              ? `Andén de ${m(d.anden_m)}: 1,20 m como mínimo, de clase 3 y sin encharcamiento.`
              : "No es obligatorio tenerlo; si lo hay, 1,20 m como mínimo y de clase 3."
          }
        />
      )}

      {j.aplica && recreo && (
        <Decision<Escaleras>
          numero={n.escaleras}
          pregunta="Escaleras del vaso de recreo"
          opciones={[
            { valor: "un_metro", label: "1 m bajo el agua" },
            { valor: "fondo", label: "A 30 cm del fondo" },
          ]}
          valor={d.escaleras}
          habitual={h.escaleras}
          esHabitual={habitual("escaleras", "separacion_m")}
          onChange={(v) => elegir("escaleras", v)}
          extra={
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-text-disabled text-[11px]">Separación máxima</span>
              <CampoNumero id="sua6-separacion" value={d.separacion_m} unidad="m" decimales={1} onChange={(v) => cifra("separacion_m", v)} />
            </div>
          }
          texto={`Junto a los ángulos y en los cambios de pendiente, a ${metros(d.separacion_m)} como mucho entre ellas (15 m como máximo).`}
        />
      )}

      <Decision<Pozos>
        numero={n.pozos}
        pregunta="Pozos, depósitos o conducciones abiertas"
        opciones={[
          { valor: "no", label: "No hay" },
          { valor: "si", label: "Hay" },
        ]}
        valor={d.pozos}
        habitual={h.pozos}
        onChange={(v) => elegir("pozos", v)}
        texto={
          d.pozos === "si"
            ? "Accesibles a personas y con riesgo de ahogamiento: tapas o rejillas rígidas, con cierre que impida abrirlos."
            : "Ningún pozo, aljibe, depósito ni conducción abierta accesible a personas."
        }
      />
    </section>
  );
}

export function Sua6Module(): JSX.Element {
  return <PantallaSi def={sua6} Decisiones={DecisionesSua6} />;
}
