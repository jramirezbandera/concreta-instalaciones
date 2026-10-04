// DB-SI, SI 5 — Pantalla de la intervención de los bomberos (feature-19). La
// pantalla es la común (`PantallaSi`); aquí van las decisiones sobre el entorno,
// que El edificio no describe: dónde maniobran los bomberos, las rejas de la
// fachada accesible y si el edificio linda con un área forestal.

import type { JSX } from "react";
import { Decision, Opciones } from "../../components/justificacion/Decision";
import { fmt } from "../../lib/units/format";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { si5 } from "./definicion";
import type { DecisionesSi5, EspacioManiobra, Forestal, RejasFachada, Si5Estado } from "./estado";
import type { JustificacionSi5 } from "./justificacion";

function DecisionesSi5({ state, setField, j }: PropsDecisionesSi<Si5Estado, JustificacionSi5>): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  const elegir = <K extends keyof DecisionesSi5>(k: K, v: DecisionesSi5[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as Si5Estado[K]);
  };
  const sep = j.elementos.find((e) => e.detalle.clase === "maniobra");
  const separacion = sep && sep.detalle.clase === "maniobra" ? fmt(sep.detalle.separacionMax_m, "m", 0) : "";
  const deCalle = d.maniobra !== "propio";
  // Números fijos: con el React Compiler, un contador mutado en el JSX se memoriza mal.
  const n = j.exige ? { maniobra: 1, rejas: 2, forestal: 3 } : { maniobra: 0, rejas: 0, forestal: 1 };

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {!j.exige && (
        <p className="text-text-secondary border-border-sub border-t pt-3 pb-3 text-[12px] leading-normal">
          Con esta altura de evacuación no se exige espacio de maniobra: no hay nada que decidir sobre la calle ni sobre la fachada.
        </p>
      )}

      {j.exige && (
        <Decision<"calle" | "propio">
          numero={n.maniobra}
          pregunta="Dónde maniobran los bomberos"
          opciones={[
            { valor: "calle", label: "La calle" },
            { valor: "propio", label: "Del proyecto" },
          ]}
          valor={deCalle ? "calle" : "propio"}
          habitual="calle"
          esHabitual={state.maniobra === "habitual"}
          onChange={(v) => elegir("maniobra", v as EspacioManiobra)}
          extra={
            deCalle ? (
              <div className="mt-2.5">
                <div className="text-text-disabled mb-1 text-[11px]">¿La calle cumple las condiciones?</div>
                <Opciones<EspacioManiobra>
                  etiqueta="¿La calle cumple?"
                  pequenas
                  opciones={[
                    { valor: "calle", label: "Sí" },
                    { valor: "calle_no_cumple", label: "No" },
                  ]}
                  valor={d.maniobra}
                  onChange={(v) => elegir("maniobra", v)}
                />
              </div>
            ) : undefined
          }
          texto={
            d.maniobra === "propio"
              ? `Es un espacio del proyecto: 5 m de anchura, el camión a ${separacion} de la fachada como mucho, y se comprueba en planta.`
              : d.maniobra === "calle"
                ? `La calle a la que da el portal: 5 m libres y el camión a ${separacion} de la fachada como mucho. La memoria la describe.`
                : "La calle no forma parte del proyecto: no se le puede exigir, pero la memoria lo hace constar."
          }
        />
      )}

      {j.exige && (
        <Decision<RejasFachada>
          numero={n.rejas}
          pregunta="Rejas en los huecos de la fachada"
          opciones={[
            { valor: "sin", label: "Sin rejas" },
            { valor: "hasta9", label: "Hasta 9 m" },
            { valor: "todas", label: "Más arriba" },
          ]}
          valor={d.rejas}
          habitual={h.rejas}
          onChange={(v) => elegir("rejas", v)}
          texto={
            d.rejas === "todas"
              ? "Por encima de 9 m de altura de evacuación los huecos no pueden tener rejas: los bomberos entran por ellos."
              : d.rejas === "hasta9"
                ? "Solo en las plantas con altura de evacuación de 9 m o menos, como la planta baja."
                : "Ningún hueco de esa fachada lleva rejas ni otros elementos que impidan entrar."
          }
        />
      )}

      <Decision<Forestal>
        numero={n.forestal}
        pregunta="Área forestal"
        opciones={[
          { valor: "no", label: "No linda" },
          { valor: "si", label: "Linda con una" },
        ]}
        valor={d.forestal}
        habitual={h.forestal}
        onChange={(v) => elegir("forestal", v)}
        texto={
          d.forestal === "si"
            ? "Franja de 25 m libre de vegetación, camino perimetral de 5 m y dos accesos (o un fondo de saco de 12,50 m de radio)."
            : "El edificio no está dentro ni al borde de un área forestal."
        }
      />
    </section>
  );
}

export function Si5Module(): JSX.Element {
  return <PantallaSi def={si5} Decisiones={DecisionesSi5} />;
}
