// DB-SI, SI 1 — Pantalla de la propagación interior (feature-19). La pantalla
// es la común (`PantallaSi`); aquí van las decisiones, que son datos del
// edificio y se guardan en sus zonas: qué es cada cuarto de instalaciones, a qué
// uso se asimila el local sin uso y, cuando decide algo, la superficie construida.

import type { JSX } from "react";
import { Decision, DecisionValor } from "../../components/justificacion/Decision";
import { CampoNumero } from "../../components/edificio/controles";
import type { TipoCuarto, UsoPrevistoLocal } from "../../lib/edificio/tipos";
import { Construidas } from "../si/Construidas";
import { cambiarZonaSi } from "../si/editar";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { m2 } from "../si/textos";
import { si1 } from "./definicion";
import type { Si1Estado } from "./estado";
import { zonasConstruidaSi1, type JustificacionSi1 } from "./justificacion";
import { NOMBRE_CUARTO } from "./textos";

const SELECT =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent h-7 w-full rounded border px-1.5 text-[12px] focus:outline-none";

const ORDEN_CUARTOS: TipoCuarto[] = [
  "contadores_electricidad",
  "telecomunicaciones",
  "ascensor",
  "sala_maquinas",
  "calderas",
  "grupo_electrogeno",
  "residuos",
  "agua",
  "otro",
];

function DecisionesSi1({ j, edificio, cambiarEdificio }: PropsDecisionesSi<Si1Estado, JustificacionSi1>): JSX.Element {
  const e = j.comp.edificio;
  const cuartos = e.zonas.filter((z) => z.uso === "instalaciones");
  const locales = e.zonas.filter((z) => z.uso === "local_sin_uso");
  const construidas = zonasConstruidaSi1(j);
  // Números fijos: con el React Compiler, un contador mutado en el JSX se memoriza mal.
  const nCuartos = cuartos.length > 0 ? 1 : 0;
  const nConstruida = nCuartos + locales.length + 1;

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {cuartos.length === 0 && locales.length === 0 && construidas.length === 0 && (
        <p className="text-text-secondary border-border-sub border-t pt-3 pb-3 text-[12px] leading-normal">
          SI 1 sale entero de El edificio: no hay nada que decidir.
        </p>
      )}

      {cuartos.length > 0 && (
        <DecisionValor
          numero={1}
          pregunta={cuartos.length > 1 ? "Qué es cada cuarto de instalaciones" : "Qué es el cuarto de instalaciones"}
          marca={cuartos.some((z) => z.zona.cuarto === undefined) ? { texto: "sin definir", aviso: true } : undefined}
          control={
            <div className="flex w-full flex-col gap-2">
              {cuartos.map((z) => (
                <div key={z.id} className="flex flex-col gap-1">
                  <label htmlFor={`si1-cuarto-${z.id}`} className="text-text-disabled text-[11px]">
                    {z.plantas} · {m2(z.util_m2)}
                    {z.zona.nota ? ` · ${z.zona.nota}` : ""}
                  </label>
                  <select
                    id={`si1-cuarto-${z.id}`}
                    className={SELECT}
                    value={z.zona.cuarto ?? ""}
                    onChange={(ev) =>
                      cambiarEdificio(cambiarZonaSi(edificio, z.id, { cuarto: ev.target.value === "" ? undefined : (ev.target.value as TipoCuarto) }))
                    }
                  >
                    <option value="">Sin definir</option>
                    {ORDEN_CUARTOS.map((t) => (
                      <option key={t} value={t}>
                        {NOMBRE_CUARTO[t]}
                      </option>
                    ))}
                  </select>
                  {z.zona.cuarto === "calderas" && (
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor={`si1-potencia-${z.id}`} className="text-text-secondary text-[12px]">
                        Potencia útil nominal
                      </label>
                      <CampoNumero
                        id={`si1-potencia-${z.id}`}
                        value={z.zona.potencia_kW ?? 0}
                        unidad="kW"
                        onChange={(v) => cambiarEdificio(cambiarZonaSi(edificio, z.id, { potencia_kW: v > 0 ? v : undefined }))}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          }
          texto="Decide si es local de riesgo especial. Contadores eléctricos, telecomunicaciones, ascensor, sala de máquinas y grupo electrógeno lo son (riesgo bajo); los cuartos de agua, no."
        />
      )}

      {locales.map((z, i) => {
        const valor: UsoPrevistoLocal | "sin" = z.zona.usoPrevisto ?? "sin";
        return (
          <Decision<UsoPrevistoLocal | "sin">
            key={z.id}
            numero={nCuartos + i + 1}
            pregunta={locales.length > 1 ? `El local sin uso de ${z.plantas}` : "El local sin uso"}
            opciones={[
              { valor: "sin", label: "Sin definir" },
              { valor: "comercial", label: "Comercial" },
              { valor: "administrativo", label: "Oficina" },
            ]}
            valor={valor}
            habitual="sin"
            onChange={(v) => cambiarEdificio(cambiarZonaSi(edificio, z.id, { usoPrevisto: v === "sin" ? undefined : v }))}
            texto={
              valor === "administrativo"
                ? "Uso Administrativo: con 500 m² construidos o menos no precisa ser sector propio en un edificio de viviendas."
                : valor === "comercial"
                  ? "Uso Comercial: sector propio con cualquier superficie."
                  : "Sin actividad, se le aplica Comercial, lo más exigente, para no condicionar su uso futuro."
            }
          />
        );
      })}

      {construidas.length > 0 && (
        <Construidas
          numero={nConstruida}
          zonas={construidas}
          edificio={edificio}
          cambiarEdificio={cambiarEdificio}
          texto="Los límites del DB-SI son de superficie construida. Sin ella se supone la útil × 1,20; aquí aparecen las zonas en que eso decide algo."
        />
      )}
    </section>
  );
}

export function Si1Module(): JSX.Element {
  return <PantallaSi def={si1} Decisiones={DecisionesSi1} />;
}
