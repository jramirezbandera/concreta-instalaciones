// DB-HS4 — Las decisiones del proyectista (feature-15, maqueta v4): presión de
// la red · contadores · tubería · agua caliente. Cada una dice lo habitual o lo
// que supone apartarse de ello. La presión de la red es un dato de la obra: el
// control la edita allí (`onPresion`). Las demás se guardan como «habitual»
// mientras coincidan con lo habitual.

import type { JSX } from "react";
import { Decision, DecisionValor, Paso } from "../../components/justificacion/Decision";
import { fmt } from "../../lib/units/format";
import type { Hs4Estado } from "./estado";
import type { JustificacionHs4 } from "./justificacion";
import {
  decisionesHabitualesHs4,
  type AguaCaliente,
  type Contadores,
  type DecisionesEfectivasHs4,
  type Tuberia,
} from "./red";
import { AHORRO_AGUA, rangoVelocidad } from "./tablas";
import { nombrePlanta } from "./textos";

interface DecisionesHs4Props {
  state: Hs4Estado;
  setField: <K extends keyof Hs4Estado>(field: K, value: Hs4Estado[K]) => void;
  j: JustificacionHs4;
  /** Escribe la presión de la red en los datos de la obra. */
  onPresion: (kPa: number) => void;
  /** El aviso de la presión supuesta está revisado (la compañía la confirmó). */
  presionConfirmada: boolean;
}

function kpa(v: number): string {
  return `${fmt(v, undefined, 0)} kPa`;
}

export function DecisionesHs4({ state, setField, j, onPresion, presionConfirmada }: DecisionesHs4Props): JSX.Element {
  const d: DecisionesEfectivasHs4 = j.red.decisiones;
  const h = decisionesHabitualesHs4();
  const red = j.red;
  const conContadores = !red.unifamiliar && red.unidades.length + red.locales.length > 1;

  const elegir = <K extends "contadores" | "tuberia" | "aguaCaliente">(k: K, v: DecisionesEfectivasHs4[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as Hs4Estado[K]);
  };
  const enLoHabitual =
    state.contadores === "habitual" && state.tuberia === "habitual" && state.aguaCaliente === "habitual";
  const volverAloHabitual = () => {
    setField("contadores", "habitual");
    setField("tuberia", "habitual");
    setField("aguaCaliente", "habitual");
  };

  // ── 1 · Presión de la red ────────────────────────────────────────────────
  const crit = j.elementos.find((e) => e.detalle.clase === "planta" && e.detalle.critico);
  const det = crit?.detalle.clase === "planta" ? crit.detalle : null;
  const nec = j.resultado?.presionNecesaria_kPa ?? null;
  let textoPresion: string;
  if (d.grupoPresion) textoPresion = `El grupo de presión da ${kpa(d.presionGrupo_kPa)} a su salida.`;
  else if (j.presionSinDato) textoPresion = `No consta el dato de la compañía: se calcula con ${kpa(j.presionRed_kPa)}.`;
  else if (nec !== null && j.presionRed_kPa >= nec) textoPresion = `Dato de la compañía. Funciona desde ${kpa(nec)}.`;
  else if (nec !== null && det) {
    textoPresion = `Con menos de ${kpa(nec)} la ${det.nivel !== null ? nombrePlanta(det.nivel) : "red"} no llega a ${fmt(det.punto.aparato.presionMinExigida_kPa, undefined, 0)}.`;
  } else textoPresion = "Dato de la compañía suministradora.";

  // ── Textos del resto ─────────────────────────────────────────────────────
  const c = red.contadores;
  const quienes = [
    c.viviendas > 0 ? `${c.viviendas} ${c.viviendas === 1 ? "vivienda" : "viviendas"}` : null,
    c.oficinas > 0 ? `${c.oficinas} ${c.oficinas === 1 ? "planta de oficinas" : "plantas de oficinas"}` : null,
    c.locales > 0 ? (c.locales === 1 ? "el local" : "los locales") : null,
    c.comunes ? "las zonas comunes" : null,
  ].filter((x): x is string => x !== null);
  const lista = quienes.length <= 1 ? (quienes[0] ?? "") : `${quienes.slice(0, -1).join(", ")} y ${quienes[quienes.length - 1]}`;
  const textoContadores =
    d.contadores === "bateria"
      ? `${c.total} contadores en una zona común de la planta baja: ${lista}.`
      : "Un montante general sube por el edificio y cada planta tiene sus contadores, en zona común.";
  const rango = rangoVelocidad(d.tuberia === "cobre" ? "metalica" : "termoplastico_multicapa");
  const textoTuberia =
    d.tuberia === "cobre"
      ? `Metálica: se dimensiona para ir entre ${fmt(rango.min_m_s, undefined, 1)} y ${fmt(rango.max_m_s, undefined, 1)} m/s.`
      : `Plástica: se dimensiona para ir entre ${fmt(rango.min_m_s, undefined, 1)} y ${fmt(rango.max_m_s, undefined, 1)} m/s.`;
  const textoAcs =
    d.aguaCaliente === "individual"
      ? `Un equipo por unidad, que justifica HE 4. Si la ida al grifo más alejado llega a ${AHORRO_AGUA.datos.retornoACSDesdeLongitudIda_m} m, necesita retorno.`
      : "Producción centralizada: la red de impulsión y retorno se justifica aparte.";

  // Numeración fija antes del render: la decisión de contadores no siempre está.
  const nContadores = 2;
  const nTuberia = conContadores ? 3 : 2;
  const nAcs = nTuberia + 1;
  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
        Decisiones
      </div>
      <DecisionValor
        numero={1}
        pregunta="Presión de la red"
        control={
          <Paso
            etiqueta="Presión de la red"
            valor={j.presionRed_kPa}
            unidad="kPa"
            paso={10}
            min={100}
            max={1000}
            onChange={onPresion}
          />
        }
        marca={
          j.presionSinDato
            ? { texto: "sin dato", aviso: true }
            : presionConfirmada
              ? { texto: "confirmada" }
              : { texto: "supuesta", aviso: true }
        }
        texto={textoPresion}
      />
      {conContadores && (
        <Decision<Contadores>
          numero={nContadores}
          pregunta="Contadores"
          opciones={[
            { valor: "bateria", label: "Batería en PB" },
            { valor: "por_planta", label: "Por planta" },
          ]}
          valor={d.contadores}
          habitual={h.contadores}
          onChange={(v) => elegir("contadores", v)}
          texto={textoContadores}
        />
      )}
      <Decision<Tuberia>
        numero={nTuberia}
        pregunta="Tubería"
        opciones={[
          { valor: "multicapa", label: "Multicapa" },
          { valor: "pex", label: "PE-X" },
          { valor: "cobre", label: "Cobre" },
        ]}
        valor={d.tuberia}
        habitual={h.tuberia}
        onChange={(v) => elegir("tuberia", v)}
        texto={textoTuberia}
      />
      <Decision<AguaCaliente>
        numero={nAcs}
        pregunta="Agua caliente"
        opciones={[
          { valor: "individual", label: "Individual" },
          { valor: "central", label: "Central" },
        ]}
        valor={d.aguaCaliente}
        habitual={h.aguaCaliente}
        onChange={(v) => elegir("aguaCaliente", v)}
        texto={textoAcs}
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
