// DB-HE 4 — Pantalla de la contribución renovable al ACS (feature-22). La
// pantalla es la común (`PantallaSi`); aquí van las decisiones que El edificio no
// describe: con qué se produce el ACS (con el SCOPdhw de la bomba de calor, la
// fracción solar y su apoyo, o la parte renovable de la red), si la producción es
// individual o centralizada, los ocupantes de las oficinas y las pérdidas.

import type { JSX } from "react";
import { CampoNumero } from "../../components/edificio/controles";
import { Decision, DecisionValor, Opciones } from "../../components/justificacion/Decision";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { he4 } from "./definicion";
import type { Apoyo, He4Estado, Produccion, Sistema } from "./estado";
import type { JustificacionHe4 } from "./justificacion";
import { CRITERIOS_HE4 } from "./tablas";
import { num, pct } from "./textos";

const SISTEMAS: { valor: Sistema; label: string }[] = [
  { valor: "bomba_calor", label: "Bomba" },
  { valor: "solar", label: "Solar" },
  { valor: "biomasa", label: "Biomasa" },
  { valor: "red", label: "Red" },
];

const APOYOS: { valor: Apoyo; label: string }[] = [
  { valor: "convencional", label: "Convencional" },
  { valor: "bomba_calor", label: "Bomba" },
  { valor: "biomasa", label: "Biomasa" },
];

function Campo({ id, etiqueta, children }: { id: string; etiqueta: string; children: JSX.Element }): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={id} className="text-text-secondary text-[12px]">
        {etiqueta}
      </label>
      {children}
    </div>
  );
}

function DecisionesHe4({ state, setField, j }: PropsDecisionesSi<He4Estado, JustificacionHe4>): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  const c = j.elementos.find((e) => e.id === "contribucion")?.detalle;
  const ofi = j.elementos.find((e) => e.id === "oficinas")?.detalle;
  const en = j.elementos.find((e) => e.id === "energia")?.detalle;
  const contribucion = c && c.clase === "contribucion" ? c : null;
  // Números fijos: con el React Compiler, un contador mutado en el JSX se memoriza mal.
  const n = {
    produccion: 2,
    oficinas: j.aplica ? (j.plurifamiliar ? 3 : 2) : 1,
    perdidas: (j.plurifamiliar ? 3 : 2) + (ofi ? 1 : 0),
  };
  const numero = (v: number | null) => (v !== null && Number.isFinite(v) && v > 0 ? v : null);
  const usaBomba = d.sistema === "bomba_calor" || (d.sistema === "solar" && d.apoyo === "bomba_calor");

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {!j.aplica && (
        <p className="text-text-secondary border-border-sub border-t pt-3 pb-3 text-[12px] leading-normal">
          Con una demanda de ACS de 100 l/d o menos, HE 4 no se aplica: no hay nada que decidir sobre la producción.
        </p>
      )}

      {j.aplica && contribucion && (
        <Decision<Sistema>
          numero={1}
          pregunta="Producción de ACS"
          opciones={SISTEMAS}
          valor={d.sistema}
          habitual={h.sistema}
          onChange={(v) => setField("sistema", v === h.sistema ? "habitual" : v)}
          esHabitual={d.sistema === h.sistema && state.scop === null}
          extra={
            <div className="mt-2.5 flex flex-col gap-1.5">
              {d.sistema === "solar" && (
                <>
                  <Campo id="he4-fraccion" etiqueta="Fracción solar del cálculo">
                    <CampoNumero id="he4-fraccion" value={contribucion.fraccionSolar_pct} unidad="%" decimales={1} onChange={(v) => setField("fraccionSolar_pct", numero(v))} />
                  </Campo>
                  <Campo id="he4-captadores" etiqueta="Captadores en cubierta (HE 5)">
                    <CampoNumero id="he4-captadores" value={state.captadores_m2 ?? 0} unidad="m²" decimales={1} onChange={(v) => setField("captadores_m2", numero(v))} />
                  </Campo>
                  <div className="text-text-disabled pt-1 text-[11px]">Apoyo</div>
                  <Opciones<Apoyo> etiqueta="Apoyo de la solar" pequenas opciones={APOYOS} valor={d.apoyo} onChange={(v) => setField("apoyo", v === h.apoyo ? "habitual" : v)} />
                </>
              )}
              {usaBomba && (
                <Campo id="he4-scop" etiqueta="SCOPdhw del equipo">
                  <CampoNumero id="he4-scop" value={contribucion.scop} unidad="W/W" decimales={2} onChange={(v) => setField("scop", numero(v))} />
                </Campo>
              )}
              {d.sistema === "red" && (
                <Campo id="he4-red" etiqueta="Parte renovable de la red">
                  <CampoNumero
                    id="he4-red"
                    value={contribucion.renovableRed_pct ?? 0}
                    unidad="%"
                    decimales={1}
                    onChange={(v) => setField("renovableRed_pct", Number.isFinite(v) && v >= 0 ? v : null)}
                  />
                </Campo>
              )}
            </div>
          }
          texto={
            d.sistema === "bomba_calor"
              ? `Bomba de calor (aerotermia o geotermia): renovable 1 − 1/SCOP. Con SCOPdhw ${num(contribucion.scop)}, un ${pct(contribucion.renovable_pct)}.`
              : d.sistema === "solar"
                ? "Captadores térmicos y un apoyo (caldera o termo, bomba de calor o biomasa) para el resto. La fracción solar sale del cálculo mensual de la instalación."
                : d.sistema === "biomasa"
                  ? "Caldera de pellets: renovable en la fracción fep,ren / fep,tot."
                  : "Conexión a una red urbana de calor: cuenta su fracción renovable."
          }
        />
      )}

      {j.aplica && j.plurifamiliar && (
        <Decision<Produccion>
          numero={n.produccion}
          pregunta="Centralización"
          opciones={[
            { valor: "individual", label: "Individual" },
            { valor: "centralizada", label: "Centralizada" },
          ]}
          valor={d.produccion}
          habitual={h.produccion}
          onChange={(v) => setField("produccion", v === h.produccion ? "habitual" : v)}
          texto={
            d.produccion === "individual"
              ? "Un equipo en cada vivienda, como en HS 4. La exigencia es del edificio entero igualmente."
              : "Un equipo para todo el edificio: la demanda baja con el factor de centralización (tabla b)."
          }
        />
      )}

      {ofi && ofi.clase === "oficinas" && (
        <DecisionValor
          numero={n.oficinas}
          pregunta="Ocupantes de las oficinas"
          marca={ofi.supuestos ? { texto: "supuestos" } : { texto: "indicados" }}
          control={<CampoNumero id="he4-ocupantes" etiqueta="Ocupantes de las oficinas" value={ofi.ocupantes} unidad="pers." onChange={(v) => setField("ocupantesOficinas", numero(v))} />}
          texto="Las personas que trabajan en ellas. Sin indicarlas, una por cada 10 m² útiles (SI 3)."
        />
      )}

      {j.aplica && en && en.clase === "energia" && (
        <DecisionValor
          numero={n.perdidas}
          pregunta="Pérdidas térmicas"
          marca={en.perdidasSupuestas ? { texto: "supuestas", aviso: true } : { texto: "calculadas" }}
          control={
            <CampoNumero
              id="he4-perdidas"
              etiqueta="Pérdidas térmicas"
              value={en.perdidas_pct}
              unidad="%"
              decimales={1}
              onChange={(v) => setField("perdidas_pct", Number.isFinite(v) && v >= 0 ? v : null)}
            />
          }
          texto={`De distribución, acumulación y recirculación, sobre la demanda útil. El DB no da cifra: sin calcularlas, un ${pct(CRITERIOS_HE4.datos.perdidasSinRecirculacion_pct)} (individual) o un ${pct(CRITERIOS_HE4.datos.perdidasConRecirculacion_pct)} (centralizada, con recirculación), provisional.`}
        />
      )}
    </section>
  );
}

export function He4Module(): JSX.Element {
  return <PantallaSi def={he4} Decisiones={DecisionesHe4} />;
}
