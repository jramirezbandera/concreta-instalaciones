// DB-SI, SI 6 — Pantalla de la resistencia al fuego de la estructura
// (feature-19). La pantalla es la común (`PantallaSi`); aquí van las decisiones
// sobre la estructura, que El edificio no describe: el material, el tipo de
// forjado y si el techo del garaje va revestido.

import type { JSX } from "react";
import { Decision } from "../../components/justificacion/Decision";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { si6 } from "./definicion";
import type { DecisionesSi6, MaterialEstructura, Si6Estado, TechoGaraje, TipoForjado } from "./estado";
import type { JustificacionSi6 } from "./justificacion";

function DecisionesSi6({ setField, j }: PropsDecisionesSi<Si6Estado, JustificacionSi6>): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  const elegir = <K extends keyof DecisionesSi6>(k: K, v: DecisionesSi6[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as Si6Estado[K]);
  };
  const hormigon = d.material === "hormigon";
  const garaje = hormigon && j.comp.sectores.some((s) => s.uso === "aparcamiento");
  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      <Decision<MaterialEstructura>
        numero={1}
        pregunta="Material de la estructura"
        opciones={[
          { valor: "hormigon", label: "Hormigón" },
          { valor: "acero", label: "Acero" },
          { valor: "madera", label: "Madera" },
        ]}
        valor={d.material}
        habitual={h.material}
        onChange={(v) => elegir("material", v)}
        texto={hormigon ? "Hormigón armado: la herramienta da las dimensiones del Anejo C para cada R." : "Da la R exigida; la estructura se justifica con su anejo, con protección o por ensayo."}
      />

      {hormigon && (
        <Decision<TipoForjado>
          numero={2}
          pregunta="Forjado"
          opciones={[
            { valor: "unidireccional", label: "Viguetas" },
            { valor: "reticular", label: "Reticular" },
            { valor: "losa", label: "Losa" },
          ]}
          valor={d.forjado}
          habitual={h.forjado}
          onChange={(v) => elegir("forjado", v)}
          texto={
            d.forjado === "unidireccional"
              ? "Viguetas y bovedillas con el techo revestido: basta la distancia al eje de las losas, hasta R 120."
              : d.forjado === "reticular"
                ? "Forjado bidireccional: ancho de nervio y distancia al eje de la tabla C.5."
                : "Losa maciza: espesor y distancia al eje de la tabla C.4."
          }
        />
      )}

      {garaje && d.forjado === "unidireccional" && (
        <Decision<TechoGaraje>
          numero={3}
          pregunta="Techo del garaje"
          opciones={[
            { valor: "sin_revestir", label: "Sin revestir" },
            { valor: "revestido", label: "Revestido" },
          ]}
          valor={d.techoGaraje}
          habitual={h.techoGaraje}
          onChange={(v) => elegir("techoGaraje", v)}
          texto={
            d.techoGaraje === "sin_revestir"
              ? "Sin revestimiento inferior, los nervios se comprueban como vigas de la tabla C.3; la bovedilla cerámica cuenta el doble."
              : "Con revestimiento inferior, basta la distancia al eje de las losas, como en las plantas de arriba."
          }
        />
      )}
    </section>
  );
}

export function Si6Module(): JSX.Element {
  return <PantallaSi def={si6} Decisiones={DecisionesSi6} />;
}
