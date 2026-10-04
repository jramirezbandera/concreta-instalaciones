// DB-HE1 — Las decisiones del proyectista (feature-15, maqueta v4): el aislante
// de la fachada · el local sin uso para la envolvente · la humedad interior · el
// vidrio de las ventanas. Cada una dice lo habitual o lo que supone apartarse de
// ello. Se guardan como «habitual» mientras coincidan con lo habitual.

import type { JSX } from "react";
import { Decision, DecisionValor, Paso } from "../../components/justificacion/Decision";
import { fmt } from "../../lib/units/format";
import { MAX_AISLANTE_mm, PASO_AISLANTE_mm, VIDRIOS, type DecisionesEfectivasHe1, type TratoLocal, type Vidrio } from "./envolvente";
import type { He1Estado } from "./estado";
import { cerramientoDe, type JustificacionHe1 } from "./justificacion";
import type { ClaseHigrometria } from "./tablas";

interface DecisionesHe1Props {
  state: He1Estado;
  setField: <K extends keyof He1Estado>(field: K, value: He1Estado[K]) => void;
  j: JustificacionHe1;
}

function n2(v: number): string {
  return Number.isFinite(v) ? v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
}

export function DecisionesHe1({ state, setField, j }: DecisionesHe1Props): JSX.Element {
  const d = j.propuesta.decisiones;
  const h = j.propuesta.habituales;
  const sobreLocal = j.propuesta.envolvente.suelo.tipo === "local";

  const elegir = <K extends keyof DecisionesEfectivasHe1>(k: K, v: DecisionesEfectivasHe1[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as He1Estado[K]);
  };
  const enLoHabitual =
    state.aislanteFachada_mm === "habitual" &&
    state.local === "habitual" &&
    state.higrometria === "habitual" &&
    state.vidrio === "habitual" &&
    state.aislanteCubierta_mm === "habitual" &&
    state.aislanteSuelo_mm === "habitual";
  const volverAloHabitual = () => {
    for (const k of ["aislanteFachada_mm", "local", "higrometria", "vidrio", "aislanteCubierta_mm", "aislanteSuelo_mm"] as const) {
      setField(k, "habitual");
    }
  };

  const fachada = cerramientoDe(j, "fachada").detalle;
  const uFachada = n2(fachada.r.u_W_m2K);
  const minimo = fachada.aislante?.minimo_mm ?? null;
  const suelo = cerramientoDe(j, "suelo").detalle;
  const ventanas = cerramientoDe(j, "ventanas").detalle.r;

  const nLocal = 2;
  const nHumedad = sobreLocal ? 3 : 2;
  const nVidrio = nHumedad + 1;

  const textoLocal = (t: TratoLocal): string =>
    t === "no_habitable"
      ? `El DB no dice cómo tratar un local en bruto. Así queda del lado seguro: el forjado es envolvente, límite ${n2(suelo.r.ulim_W_m2K ?? 0)}.`
      : `El local es otra unidad de uso: el forjado es una partición entre usos distintos, límite ${n2(suelo.r.ulim_W_m2K ?? 0)}.`;

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
        Decisiones
      </div>
      <DecisionValor
        numero={1}
        pregunta="Aislante de la fachada"
        control={
          <Paso
            etiqueta="Aislante de la fachada"
            valor={d.aislanteFachada_mm}
            unidad="mm"
            paso={PASO_AISLANTE_mm}
            min={PASO_AISLANTE_mm}
            max={MAX_AISLANTE_mm}
            onChange={(v) => elegir("aislanteFachada_mm", v)}
          />
        }
        marca={{ texto: "XPS · λ 0,034" }}
        texto={
          <>
            <b className="text-text-primary font-medium">
              {d.aislanteFachada_mm === h.aislanteFachada_mm ? "Lo habitual." : "No es lo habitual."}
            </b>{" "}
            {fachada.r.cumpleU
              ? `Con ${d.aislanteFachada_mm} mm la fachada da U ${uFachada}.${minimo !== null ? ` Cumple desde ${minimo} mm.` : ""}`
              : `Con ${d.aislanteFachada_mm} mm la U sube a ${uFachada} y no cumple.${minimo !== null ? ` Hace falta al menos ${minimo} mm.` : ""}`}
          </>
        }
      />
      {sobreLocal && (
        <Decision<TratoLocal>
          numero={nLocal}
          pregunta="El local sin uso, para la envolvente"
          opciones={[
            { valor: "no_habitable", label: "No habitable" },
            { valor: "otra_unidad", label: "Otra unidad" },
          ]}
          valor={d.local}
          habitual={h.local}
          onChange={(v) => elegir("local", v)}
          texto={textoLocal(d.local)}
        />
      )}
      <Decision<ClaseHigrometria>
        numero={nHumedad}
        pregunta="Humedad interior"
        opciones={[
          { valor: "clase_3_o_inferior", label: "Clase ≤ 3" },
          { valor: "clase_4", label: "4" },
          { valor: "clase_5", label: "5" },
        ]}
        valor={d.higrometria}
        habitual={h.higrometria}
        onChange={(v) => elegir("higrometria", v)}
        texto={
          d.higrometria === "clase_3_o_inferior"
            ? "Vivienda u oficina: 20 °C y 55 % de humedad en enero."
            : d.higrometria === "clase_4"
              ? "Cocinas, pabellones o duchas colectivas: 62 % de humedad; fRsi,min sube."
              : "Lavanderías, restaurantes o piscinas: 70 % de humedad; fRsi,min sube y puede mandar sobre el límite de U."
        }
      />
      <Decision<Vidrio>
        numero={nVidrio}
        pregunta="Vidrio de las ventanas"
        opciones={[
          { valor: "doble", label: "4/16/4" },
          { valor: "bajo_emisivo", label: "Bajo emisivo" },
          { valor: "bajo_emisivo_plus", label: "BE + cálido" },
        ]}
        valor={d.vidrio}
        habitual={h.vidrio}
        onChange={(v) => elegir("vidrio", v)}
        texto={`${VIDRIOS[d.vidrio].nombre[0].toUpperCase()}${VIDRIOS[d.vidrio].nombre.slice(1)}: Ug ${fmt(VIDRIOS[d.vidrio].ug, undefined, 1)}, y la ventana da UH ${n2(ventanas.u_W_m2K)}${ventanas.cumpleU ? "" : ", que no cumple"}.`}
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
