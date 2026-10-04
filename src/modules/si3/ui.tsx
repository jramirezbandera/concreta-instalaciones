// DB-SI, SI 3 — Pantalla de la evacuación de ocupantes (feature-19). La
// pantalla es la común (`PantallaSi`); aquí van las decisiones que El edificio no
// dice: cómo es la escalera y su anchura, los recorridos más largos medidos en
// planta y cómo se ventila el garaje.

import type { JSX } from "react";
import {
  Decision,
  DecisionValor,
} from "../../components/justificacion/Decision";
import { CampoNumero } from "../../components/edificio/controles";
import { fmt } from "../../lib/units/format";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { si3 } from "./definicion";
import type { Si3Estado, VentilacionGaraje } from "./estado";
import type { JustificacionSi3 } from "./justificacion";
import type { ProteccionEscalera } from "./tablas";
import { NOMBRE_ESCALERA, tramoRecorrido } from "./textos";

const SELECT =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent h-7 w-full rounded border px-1.5 text-[12px] focus:outline-none";

const PROTECCIONES: ProteccionEscalera[] = [
  "no_protegida",
  "compartimentada",
  "protegida",
  "especialmente_protegida",
];
const ANCHURAS = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5];

function DecisionesSi3({
  state,
  setField,
  j,
}: PropsDecisionesSi<Si3Estado, JustificacionSi3>): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  const salidas = j.elementos.find((e) => e.id === "salidas")?.detalle;
  const humo = j.elementos.some((e) => e.id === "humo");
  const n = { escalera: 1, recorrido: j.conEscalera ? 2 : 1 };
  const nGaraje = (salidas ? n.recorrido : 0) + 1;
  const nHumo = nGaraje + 1;

  if (j.comp.edificio.resumen.esUnifamiliar) {
    return (
      <section aria-label="Decisiones" className="flex flex-col">
        <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
          Decisiones
        </div>
        <p className="text-text-secondary border-border-sub border-t pt-3 pb-3 text-[12px] leading-normal">
          En una vivienda unifamiliar no hay recorridos de evacuación que medir
          ni escaleras que proteger.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
        Decisiones
      </div>

      {j.conEscalera && (
        <DecisionValor
          numero={n.escalera}
          pregunta="La escalera"
          marca={
            d.escalera === h.escalera &&
            d.anchuraEscalera_m === h.anchuraEscalera_m
              ? { texto: "lo habitual" }
              : undefined
          }
          control={
            <div className="grid w-full grid-cols-[1fr_88px] gap-2">
              <select
                aria-label="Protección de la escalera"
                className={SELECT}
                value={d.escalera}
                onChange={(ev) => {
                  const v = ev.target.value as ProteccionEscalera;
                  setField("escalera", v === h.escalera ? "habitual" : v);
                }}
              >
                {PROTECCIONES.map((p) => (
                  <option key={p} value={p}>
                    {NOMBRE_ESCALERA[p].charAt(0).toUpperCase() +
                      NOMBRE_ESCALERA[p].slice(1)}
                  </option>
                ))}
              </select>
              <select
                aria-label="Anchura de la escalera"
                className={SELECT}
                value={String(d.anchuraEscalera_m)}
                onChange={(ev) => {
                  const v = Number(ev.target.value);
                  setField(
                    "anchuraEscalera_m",
                    v === h.anchuraEscalera_m ? "habitual" : v,
                  );
                }}
              >
                {ANCHURAS.map((a) => (
                  <option key={a} value={String(a)}>
                    {fmt(a, "m", 2)}
                  </option>
                ))}
              </select>
            </div>
          }
          texto={
            d.escalera === "no_protegida"
              ? "No protegida: no es salida de planta, y el recorrido sigue por ella hasta el portal."
              : d.escalera === "compartimentada"
                ? "Compartimentada como los sectores: su arranque es la salida de planta."
                : `${NOMBRE_ESCALERA[d.escalera].charAt(0).toUpperCase() + NOMBRE_ESCALERA[d.escalera].slice(1)}: el recorrido acaba en su puerta. Recinto EI 120 y puertas EI2 60-C5.`
          }
        />
      )}

      {salidas && salidas.clase === "salidas" && (
        <DecisionValor
          numero={n.recorrido}
          pregunta="Recorrido más largo de las plantas"
          marca={
            state.recorrido_m === null
              ? { texto: "sin medir", aviso: true }
              : { texto: `≤ ${salidas.limite_m} m` }
          }
          control={
            <>
              <label htmlFor="si3-recorrido" className="sr-only">
                Recorrido más largo de las plantas
              </label>
              <CampoNumero
                id="si3-recorrido"
                value={state.recorrido_m ?? 0}
                unidad="m"
                decimales={1}
                onChange={(v) => setField("recorrido_m", v > 0 ? v : null)}
              />
            </>
          }
          texto={`Mídelo en planta ${tramoRecorrido(salidas)}. Límite: ${salidas.limite_m} m.`}
        />
      )}

      {j.conGaraje && (
        <DecisionValor
          numero={nGaraje}
          pregunta="Recorrido más largo del garaje"
          marca={
            state.recorridoGaraje_m === null
              ? { texto: "sin medir", aviso: true }
              : { texto: "≤ 35 m" }
          }
          control={
            <>
              <label htmlFor="si3-recorrido-garaje" className="sr-only">
                Recorrido más largo del garaje
              </label>
              <CampoNumero
                id="si3-recorrido-garaje"
                value={state.recorridoGaraje_m ?? 0}
                unidad="m"
                decimales={1}
                onChange={(v) =>
                  setField("recorridoGaraje_m", v > 0 ? v : null)
                }
              />
            </>
          }
          texto="Desde el punto más alejado hasta la puerta del vestíbulo de la escalera, por las calles de circulación. Límite: 35 m."
        />
      )}

      {humo && (
        <Decision<VentilacionGaraje>
          numero={nHumo}
          pregunta="Ventilación del garaje"
          opciones={[
            { valor: "mecanica", label: "Mecánica" },
            { valor: "natural", label: "Natural" },
          ]}
          valor={d.ventilacionGaraje}
          habitual={h.ventilacionGaraje}
          onChange={(v) =>
            setField(
              "ventilacionGaraje",
              v === h.ventilacionGaraje ? "habitual" : v,
            )
          }
          texto={
            d.ventilacionGaraje === "mecanica"
              ? "La de HS 3, que en incendio extrae 150 l/s por plaza y arranca por detección."
              : "Natural conforme a HS 3: vale como control del humo sin condiciones adicionales."
          }
        />
      )}
    </section>
  );
}

export function Si3Module(): JSX.Element {
  return <PantallaSi def={si3} Decisiones={DecisionesSi3} />;
}
