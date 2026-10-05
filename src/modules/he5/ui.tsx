// DB-HE 5 — Pantalla de la generación mínima de energía eléctrica renovable
// (feature-22). La pantalla es la común (`PantallaSi`); aquí van las decisiones:
// la superficie construida de cada zona (se guarda en El edificio, como en SI),
// la cubierta no transitable que cuenta para P2 y la potencia que se instala.
// Los captadores solares se leen de HE 4.

import type { JSX } from "react";
import { Link } from "react-router";
import { CampoNumero } from "../../components/edificio/controles";
import { DecisionValor } from "../../components/justificacion/Decision";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { Construidas } from "../si/Construidas";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { he5 } from "./definicion";
import type { He5Estado } from "./estado";
import type { JustificacionHe5 } from "./justificacion";
import { kW, m2 } from "./textos";

function DecisionesHe5({ state, setField, j, edificio, cambiarEdificio }: PropsDecisionesSi<He5Estado, JustificacionHe5>): JSX.Element {
  const { proyecto } = useProyecto();
  const p2 = j.elementos.find((e) => e.id === "p2")?.detalle;
  const pot = j.elementos.find((e) => e.id === "potencia")?.detalle;
  const solar = j.captadores.solar;
  // Números fijos: con el React Compiler, un contador mutado en el JSX se memoriza mal.
  const n = { cubierta: 2, captadores: 3, potencia: solar ? 4 : 3 };

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      <Construidas
        numero={1}
        zonas={j.zonas}
        edificio={edificio}
        cambiarEdificio={cambiarEdificio}
        texto={`Todas las zonas cuentan, también el garaje. Sin la construida de una zona se toma su útil × 1,20. ${j.aplica ? "Se aplica" : "No se aplica"} con ${m2(j.superficies.s_m2)}: el límite es más de 1000 m².`}
      />

      {p2 && p2.clase === "p2" && (
        <DecisionValor
          numero={n.cubierta}
          pregunta="Cubierta no transitable"
          marca={p2.origenSc === "indicada" ? { texto: "indicada" } : { texto: "El edificio" }}
          control={
            <CampoNumero
              id="he5-sc"
              etiqueta="Cubierta no transitable"
              value={p2.sc_m2}
              unidad="m²"
              onChange={(v) => setField("cubiertaNoTransitable_m2", Number.isFinite(v) && v >= 0 ? v : null)}
            />
          }
          texto={
            state.cubiertaNoTransitable_m2 === null
              ? "Sc: la cubierta de El edificio si no es transitable. Sin los patios de luces; con lo que ocupan las instalaciones."
              : "Sc indicada. Sin los patios de luces; con lo que ocupan las instalaciones. Bórrala para volver a la de El edificio."
          }
        />
      )}

      {p2 && p2.clase === "p2" && solar && (
        <DecisionValor
          numero={n.captadores}
          pregunta="Captadores solares térmicos"
          marca={j.captadores.supuesto ? { texto: "sin dar", aviso: true } : { texto: "HE 4" }}
          control={<span className="text-text-primary font-mono text-[13px]">{`Soc ${m2(j.captadores.soc_m2)}`}</span>}
          texto={
            <>
              Los de la solar térmica del ACS, en la cubierta: restan de P2. Se cambian en{" "}
              <Link to={`/p/${proyecto.id}/he/acs`} className="text-accent hover:text-accent-hover underline">
                HE 4
              </Link>
              .
            </>
          }
        />
      )}

      {pot && pot.clase === "potencia" && (
        <DecisionValor
          numero={n.potencia}
          pregunta="Potencia instalada"
          marca={pot.minima ? { texto: "la mínima" } : { texto: "indicada" }}
          control={<CampoNumero id="he5-potencia" etiqueta="Potencia instalada" value={pot.instalada_kW} unidad="kW" decimales={2} onChange={(v) => setField("potencia_kW", v > 0 ? v : null)} />}
          texto={`La de la instalación renovable (habitualmente fotovoltaica en la cubierta). La mínima es ${kW(pot.pmin_kW)}.`}
        />
      )}
    </section>
  );
}

export function He5Module(): JSX.Element {
  return <PantallaSi def={he5} Decisiones={DecisionesHe5} />;
}
