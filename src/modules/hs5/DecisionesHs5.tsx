// DB-HS5 — Las cuatro decisiones del proyectista (feature-14 §J, maqueta v4):
// alcantarillado · colectores y pendiente · bajante de la cocina · ventilación.
// Cada una dice lo habitual o lo que supone apartarse de ello. Se guardan como
// «habitual» mientras coincidan con lo habitual, así que siguen al edificio si
// este cambia (un sótano nuevo vuelve colgados los colectores).

import type { JSX } from "react";
import { Decision, Opciones } from "../../components/justificacion/Decision";
import { resumenEdificio } from "../../lib/edificio/derivar";
import type { Edificio } from "../../lib/edificio/tipos";
import type { DisposicionColector } from "./calc";
import type { Hs5Estado } from "./estado";
import {
  decisionesHabituales,
  DECISIONES_POR_DEFECTO,
  type Alcantarillado,
  type BajanteCocina,
  type DecisionesEfectivas,
  type Ventilacion,
} from "./red";
import { COLECTORES_TABLA_4_5, VENT_PRIMARIA } from "./tablas";

interface DecisionesHs5Props {
  state: Hs5Estado;
  setField: <K extends keyof Hs5Estado>(field: K, value: Hs5Estado[K]) => void;
  edificio: Edificio;
  /** Las decisiones ya resueltas para este edificio. */
  efectivas: DecisionesEfectivas;
  /** Hay viviendas con cocina (si no, la decisión de la cocina no aplica). */
  hayCocinas: boolean;
  /** Dónde se cuelgan los colectores («garaje», «sotano»…), para el texto. */
  colgadoDe: "garaje" | "sotano" | "forjado_pb" | null;
}

export function DecisionesHs5({
  state,
  setField,
  edificio,
  efectivas: d,
  hayCocinas,
  colgadoDe,
}: DecisionesHs5Props): JSX.Element {
  const h = decisionesHabituales(edificio);
  const r = resumenEdificio(edificio);
  const sotano = r.plantasBajoRasante > 0;
  const plantas = r.plantasSobreRasante;
  const limite = VENT_PRIMARIA.datos.maxPlantasSolo;
  const minEnterrado = COLECTORES_TABLA_4_5.datos.pendienteMinEnterrado_pct;

  /** Guarda «habitual» si coincide con lo habitual: así sigue al edificio. */
  const elegir = <K extends "alcantarillado" | "colectores" | "bajanteCocina" | "ventilacion">(
    k: K,
    v: DecisionesEfectivas[K],
  ) => {
    setField(k, (v === h[k] ? "habitual" : v) as Hs5Estado[K]);
  };

  const cambiarColectores = (v: DisposicionColector) => {
    elegir("colectores", v);
    if (v === "enterrado" && state.pendienteColector_pct < minEnterrado) {
      setField("pendienteColector_pct", minEnterrado);
    }
  };

  const enLoHabitual =
    state.alcantarillado === "habitual" &&
    state.colectores === "habitual" &&
    state.bajanteCocina === "habitual" &&
    state.ventilacion === "habitual" &&
    state.pendienteColector_pct === DECISIONES_POR_DEFECTO.pendienteColector_pct;

  const volverAloHabitual = () => {
    setField("alcantarillado", "habitual");
    setField("colectores", "habitual");
    setField("bajanteCocina", "habitual");
    setField("ventilacion", "habitual");
    setField("pendienteColector_pct", DECISIONES_POR_DEFECTO.pendienteColector_pct);
  };

  const pendienteHabitual = d.pendienteColector_pct === DECISIONES_POR_DEFECTO.pendienteColector_pct;
  const textoPendiente = pendienteHabitual
    ? ""
    : d.pendienteColector_pct < DECISIONES_POR_DEFECTO.pendienteColector_pct
      ? ` Al ${d.pendienteColector_pct} %: menos capacidad, la mínima de un colector colgado.`
      : ` Al ${d.pendienteColector_pct} %: más capacidad, pero el colector baja más.`;
  const textoColectores =
    d.colectores === "colgado"
      ? colgadoDe === "garaje" || colgadoDe === "sotano"
        ? `Por el techo del ${colgadoDe}: se registran sin romper nada.`
        : "Bajo el forjado de la planta baja, en una cámara registrable."
      : sotano
        ? "Bajo el sótano quedan por debajo del alcantarillado: toda la red pediría bombeo."
        : "Bajo la solera, con arquetas registrables en cada encuentro.";

  let textoVentilacion: string;
  if (d.ventilacion === "primaria") {
    textoVentilacion =
      plantas < limite
        ? `Basta prolongarlas sobre la cubierta: el edificio tiene menos de ${limite} plantas.`
        : `No basta: con ${plantas} plantas hace falta ventilación secundaria.`;
  } else {
    textoVentilacion =
      plantas < limite
        ? `Columna paralela a cada bajante; no es obligatoria con menos de ${limite} plantas.`
        : `Obligatoria con ${limite} plantas o más: columna paralela conectada a la bajante.`;
  }

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
        Decisiones
      </div>
      <Decision<Alcantarillado>
        numero={1}
        pregunta="Alcantarillado de la calle"
        opciones={[
          { valor: "unitario", label: "Unitario" },
          { valor: "separativo", label: "Separativo" },
        ]}
        valor={d.alcantarillado}
        habitual={h.alcantarillado}
        onChange={(v) => elegir("alcantarillado", v)}
        texto={
          d.alcantarillado === "unitario"
            ? "Dentro van separadas y se unen antes de salir, con cierre hidráulico. Una sola acometida."
            : "Residuales y pluviales salen por acometidas distintas, cada una a su red."
        }
      />
      <Decision<DisposicionColector>
        numero={2}
        pregunta="Colectores"
        opciones={[
          { valor: "colgado", label: "Colgados" },
          { valor: "enterrado", label: "Enterrados" },
        ]}
        valor={d.colectores}
        habitual={h.colectores}
        onChange={cambiarColectores}
        esHabitual={d.colectores === h.colectores && pendienteHabitual}
        texto={`${textoColectores}${textoPendiente}`}
        extra={
          <div className="text-text-secondary mt-2 flex items-center justify-between gap-2 text-[12.5px]">
            <span>Pendiente</span>
            <div className="w-[150px]">
              <Opciones<number>
                etiqueta="Pendiente de los colectores"
                pequenas
                valor={d.pendienteColector_pct}
                onChange={(v) => setField("pendienteColector_pct", v)}
                opciones={[1, 2, 4].map((p) => ({
                  valor: p,
                  label: `${p} %`,
                  deshabilitada: d.colectores === "enterrado" && p < minEnterrado,
                  motivo:
                    d.colectores === "enterrado" && p < minEnterrado
                      ? `Enterrados: ${minEnterrado} % como mínimo`
                      : undefined,
                }))}
              />
            </div>
          </div>
        }
      />
      {hayCocinas && (
        <Decision<BajanteCocina>
          numero={3}
          pregunta="Bajante de la cocina"
          opciones={[
            { valor: "propia", label: "Propia" },
            { valor: "con_banos", label: "Con los baños" },
          ]}
          valor={d.bajanteCocina}
          habitual={h.bajanteCocina}
          onChange={(v) => elegir("bajanteCocina", v)}
          texto={
            d.bajanteCocina === "propia"
              ? "Cada vivienda tipo baja por dos verticales: baños y cocina."
              : "Baños y cocina comparten bajante: una vertical por vivienda tipo."
          }
        />
      )}
      <Decision<Ventilacion>
        numero={hayCocinas ? 4 : 3}
        pregunta="Ventilación de las bajantes"
        opciones={[
          { valor: "primaria", label: "Primaria" },
          { valor: "secundaria", label: "Secundaria" },
        ]}
        valor={d.ventilacion}
        habitual={h.ventilacion}
        onChange={(v) => elegir("ventilacion", v)}
        texto={textoVentilacion}
      />
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
