// REBT — Pantalla del grado de electrificación y la previsión de cargas
// (feature-23). La pantalla es la común (`PantallaSi`); aquí van las decisiones
// que El edificio no describe: el grado de las viviendas (por superficie o
// elevada por la climatización eléctrica), la plaza en la parcela de la
// unifamiliar sin garaje, la potencia del ascensor y de los demás servicios
// generales, la recarga del vehículo eléctrico (esquema colectivo con SPL o sin
// él, y cuántas plazas) y la potencia del garaje que controla el humo con
// ventiladores. La ventilación del garaje se cambia en HS 3.

import type { JSX } from "react";
import { Link } from "react-router";
import { CampoNumero } from "../../components/edificio/controles";
import { Decision, DecisionValor } from "../../components/justificacion/Decision";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { rebt } from "./definicion";
import type { Electrificacion, RebtEstado, Spl } from "./estado";
import type { JustificacionRebt } from "./justificacion";
import { CRITERIOS_REBT, GRADO_REBT } from "./tablas";
import { kW, num, W } from "./textos";

function DecisionesRebt({ state, setField, j, edificio }: PropsDecisionesSi<RebtEstado, JustificacionRebt>): JSX.Element {
  const { proyecto } = useProyecto();
  const d = j.decisiones;
  const h = j.habituales;
  const s = j.elementos.find((e) => e.id === "servicios")?.detalle;
  const servicios = s && s.clase === "servicios" ? s : null;
  const rc = j.elementos.find((e) => e.id === "recarga")?.detalle;
  const recarga = rc && rc.clase === "recarga" ? rc : null;
  const g = j.elementos.find((e) => e.id === "garaje")?.detalle;
  const garaje = g && g.clase === "garaje" ? g : null;
  const conViviendas = j.viviendas.length > 0;
  const sinGaraje = j.unifamiliar && !edificio.grupos.some((gr) => gr.zonas.some((z) => z.uso === "garaje_privado"));
  const recargaViviendas = recarga?.ambito === "viviendas" ? recarga : null;
  // Números fijos: con el React Compiler, un contador mutado en el JSX se memoriza mal.
  const hasta = {
    electrificacion: conViviendas ? 1 : 0,
    parcela: (conViviendas ? 1 : 0) + (sinGaraje ? 1 : 0),
  };
  const hastaAscensor = hasta.parcela + (servicios?.ascensor ? 1 : 0);
  const hastaOtros = hastaAscensor + (servicios ? 1 : 0);
  const hastaRecarga = hastaOtros + (recargaViviendas ? 1 : 0);
  const n = {
    parcela: hasta.electrificacion + 1,
    ascensor: hasta.parcela + 1,
    otros: hastaAscensor + 1,
    recarga: hastaOtros + 1,
    garaje: hastaRecarga + 1,
    humo: hastaRecarga + 2,
  };
  const numero = (v: number) => (Number.isFinite(v) && v >= 0 ? v : null);
  const G = GRADO_REBT.datos;

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {conViviendas && (
        <Decision<Electrificacion>
          numero={1}
          pregunta="Electrificación de las viviendas"
          opciones={[
            { valor: "superficie", label: "Por superficie" },
            { valor: "elevada", label: "Elevada" },
          ]}
          valor={d.electrificacion}
          habitual={h.electrificacion}
          onChange={(v) => setField("electrificacion", v === h.electrificacion ? "habitual" : v)}
          texto={
            d.electrificacion === "elevada"
              ? `Con calefacción eléctrica o aire acondicionado (la aerotermia lo es), secadora o automatización: ${W(G.elevada_W)} por vivienda, IGA de 40 A.`
              : `Sin climatización eléctrica: básica, ${W(G.basica_W)} (IGA de 25 A), salvo con más de ${G.superficieElevadaMasDe_m2} m² útiles${j.unifamiliar ? " o con garaje (recarga del vehículo eléctrico)" : ""}.`
          }
        />
      )}

      {sinGaraje && (
        <Decision<"si" | "no">
          numero={n.parcela}
          pregunta="Plaza en la parcela"
          opciones={[
            { valor: "no", label: "No" },
            { valor: "si", label: "Sí" },
          ]}
          valor={state.plazaParcela ? "si" : "no"}
          habitual="no"
          onChange={(v) => setField("plazaParcela", v === "si")}
          texto={
            state.plazaParcela
              ? "Con aparcamiento o zona prevista para un vehículo, la vivienda lleva el circuito C13 de recarga (ITC-BT-52 ap. 3.1) y es de electrificación elevada (ITC-BT-10 ap. 5.1)."
              : "Sin garaje en El edificio ni plaza en la parcela, no lleva circuito de recarga."
          }
        />
      )}

      {servicios?.ascensor && (
        <DecisionValor
          numero={n.ascensor}
          pregunta="Potencia del ascensor"
          marca={servicios.ascensor.kWSupuesta ? { texto: "supuesta", aviso: true } : { texto: "indicada" }}
          control={
            <CampoNumero id="rebt-ascensor" etiqueta="Potencia del ascensor" value={servicios.ascensor.kW} unidad="kW" decimales={1} onChange={(v) => setField("ascensor_kW", numero(v))} />
          }
          texto={`La del equipo. Sin ella, ${num(servicios.ascensor.kW, 1)} kW: el ${CRITERIOS_REBT.datos.ascensorHabitual} de la Guía BT-10 (630 kg, 8 personas, 1 m/s).`}
        />
      )}

      {servicios && (
        <DecisionValor
          numero={n.otros}
          pregunta="Otros servicios generales"
          marca={servicios.otrosIndicados ? { texto: "indicados" } : { texto: "sin indicar", aviso: true }}
          control={
            <CampoNumero id="rebt-otros" etiqueta="Otros servicios generales" value={servicios.otros_kW} unidad="kW" decimales={1} onChange={(v) => setField("otrosServicios_kW", numero(v))} />
          }
          texto="Grupo de presión, central térmica o de ACS, ventilación, telecomunicaciones, alumbrado de los trasteros…: lo que se conozca, sin simultaneidad."
        />
      )}

      {recargaViviendas && (
        <Decision<Spl>
          numero={n.recarga}
          pregunta="Recarga del vehículo eléctrico"
          opciones={[
            { valor: "sin_spl", label: "Sin SPL" },
            { valor: "con_spl", label: "Colectivo con SPL" },
          ]}
          valor={d.spl}
          habitual={h.spl}
          onChange={(v) => setField("spl", v === h.spl ? "habitual" : v)}
          esHabitual={d.spl === h.spl && state.plazasRecarga === null}
          extra={
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <label htmlFor="rebt-plazas" className="text-text-secondary text-[12px]">
                Plazas con previsión
              </label>
              <CampoNumero id="rebt-plazas" value={recargaViviendas.plazasPrevision} unidad="plazas" decimales={1} onChange={(v) => setField("plazasRecarga", numero(v))} />
            </div>
          }
          texto={
            d.spl === "con_spl"
              ? `Esquema colectivo con el sistema que protege la línea general de alimentación (SPL): ${kW(recargaViviendas.p5_W)} × 0,3, y un contador principal más en la centralización.`
              : `Sin SPL vale para cualquier esquema: ${kW(recargaViviendas.p5_W)} × 1,0. Mínimo, el 10 % de las ${recargaViviendas.plazas} plazas.`
          }
        />
      )}

      {garaje && (
        <DecisionValor
          numero={n.garaje}
          pregunta="Ventilación del garaje"
          marca={{ texto: "HS 3" }}
          control={<span className="text-text-primary font-mono text-[13px]">{garaje.ventilacion === "forzada" ? "Forzada" : "Natural"}</span>}
          texto={
            <>
              {garaje.ventilacion === "forzada" ? "20 W/m²" : "10 W/m²"}. Se cambia en{" "}
              <Link to={`/p/${proyecto.id}/hs/ventilacion`} className="text-accent hover:text-accent-hover underline">
                HS 3
              </Link>
              .
            </>
          }
        />
      )}

      {garaje?.humo && (
        <DecisionValor
          numero={n.humo}
          pregunta="Potencia del garaje"
          marca={garaje.estudiada_kW !== null ? { texto: "estudiada" } : { texto: "sin estudiar", aviso: true }}
          control={
            <CampoNumero
              id="rebt-garaje"
              etiqueta="Potencia del garaje"
              value={garaje.estudiada_kW ?? garaje.p_W / 1000}
              unidad="kW"
              decimales={1}
              onChange={(v) => setField("garaje_kW", numero(v))}
            />
          }
          texto={`Con los ventiladores de extracción del humo (150 l/s por plaza), el alumbrado y lo demás: la ITC-BT-10 pide estudiarla. No baja de ${garaje.W_m2} W/m².`}
        />
      )}
    </section>
  );
}

export function RebtModule(): JSX.Element {
  return <PantallaSi def={rebt} Decisiones={DecisionesRebt} />;
}
