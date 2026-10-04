// DB-SUA, SUA 2 — Pantalla de impacto y atrapamiento (feature-20). La pantalla es
// la común (`PantallaSi`); aquí van las dos decisiones que El edificio no
// describe: la altura libre de paso de cada clase de zona y cómo abren las
// puertas a los pasillos comunes. Lo demás es declarativo y va a la memoria.

import type { JSX } from "react";
import { CampoNumero } from "../../components/edificio/controles";
import { Decision, DecisionValor } from "../../components/justificacion/Decision";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { metros } from "../sua/colocar";
import { sua2 } from "./definicion";
import { CLAVE_ALTURA, type BarridoPuertas, type Sua2Estado } from "./estado";
import type { JustificacionSua2 } from "./justificacion";
import { ALTURAS_SUA2_1_1 } from "./tablas";
import { nombreGrupo } from "./textos";

function DecisionesSua2({ state, setField, j }: PropsDecisionesSi<Sua2Estado, JustificacionSua2>): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  const todasHabituales = j.clases.every((c) => state[CLAVE_ALTURA[c]] === "habitual");
  const nPuertas = j.clases.length > 0 ? 2 : 1;
  const A = ALTURAS_SUA2_1_1.datos;

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {j.clases.length > 0 && (
        <DecisionValor
          numero={1}
          pregunta="Altura libre de paso"
          marca={todasHabituales ? { texto: "lo habitual" } : { texto: "indicada" }}
          control={
            <div className="flex flex-col gap-1.5">
              {j.clases.map((c) => (
                <label key={c} className="flex items-center justify-between gap-3">
                  <span className="text-text-secondary text-[12px]">{nombreGrupo(c, j.unifamiliar)}</span>
                  <CampoNumero
                    id={`sua2-${c}`}
                    value={d.alturas[c]}
                    unidad="m"
                    decimales={2}
                    onChange={(v) => {
                      const r = Math.round(v * 100) / 100;
                      setField(CLAVE_ALTURA[c], r <= 0 || r === h.alturas[c] ? "habitual" : r);
                    }}
                  />
                </label>
              ))}
            </div>
          }
          texto={`La más baja en pasillos y zonas de paso, bajo vigas, conductos y falsos techos. Mínimo ${metros(A.alturaLibrePaso_usoRestringido_m)} en la vivienda y ${metros(A.alturaLibrePaso_resto_m)} en el resto; lo habitual, con falso techo.`}
        />
      )}

      {j.conPasillos && (
        <Decision<BarridoPuertas>
          numero={nPuertas}
          pregunta="Puertas a pasillos comunes"
          opciones={[
            { valor: "no_invaden", label: "No barren" },
            { valor: "pasillo_ancho", label: "Pasillo > 2,50 m" },
            { valor: "invaden", label: "Barren" },
          ]}
          valor={d.puertas}
          habitual={h.puertas}
          onChange={(v) => setField("puertas", v === h.puertas ? "habitual" : v)}
          texto={
            d.puertas === "invaden"
              ? "La hoja invade un pasillo de menos de 2,50 m: no cumple."
              : d.puertas === "pasillo_ancho"
                ? "Pasillos de más de 2,50 m: el barrido no invade la anchura que exige SI 3."
                : "Las puertas de las viviendas, oficinas y recintos abren hacia dentro o van en hornacina. Las de trasteros y cuartos de instalaciones pueden abrir al pasillo."
          }
        />
      )}
    </section>
  );
}

export function Sua2Module(): JSX.Element {
  return <PantallaSi def={sua2} Decisiones={DecisionesSua2} />;
}
