// DB-HE 6 — Pantalla de las dotaciones mínimas para la recarga de vehículos
// eléctricos (feature-24). La pantalla es la común (`PantallaSi`); aquí van las
// decisiones que El edificio no describe: las plazas exteriores adscritas (en la
// unifamiliar, la plaza en la parcela de REBT), la titularidad de la
// Administración General del Estado, las plazas accesibles, las plazas con
// conducción y las estaciones que se instalan, el esquema de conexión (lo lee
// REBT) y la potencia de la estación.

import type { JSX } from "react";
import { Link } from "react-router";
import { CampoNumero } from "../../components/edificio/controles";
import { Decision, DecisionValor } from "../../components/justificacion/Decision";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { he6 } from "./definicion";
import { entero, esquemaHabitual, type Esquema, type He6Estado } from "./estado";
import type { JustificacionHe6 } from "./justificacion";
import { ESTACIONES_HE6 } from "./tablas";
import { kW, NOMBRE_ESQUEMA, plazas, TEXTO_SUBESQUEMA } from "./textos";

function DecisionesHe6({ state, setField, j, edificio }: PropsDecisionesSi<He6Estado, JustificacionHe6>): JSX.Element {
  const { proyecto } = useProyecto();
  const pz = j.elementos.find((e) => e.id === "plazas")?.detalle;
  const c = j.elementos.find((e) => e.id === "conduccion")?.detalle;
  const est = j.elementos.find((e) => e.id === "estaciones")?.detalle;
  const esq = j.elementos.find((e) => e.id === "esquema")?.detalle;
  const tipo = j.elementos.find((e) => e.id === "estacion")?.detalle;
  const otros = j.uso === "otros";
  const sinGaraje = j.unifamiliar && !edificio.grupos.some((g) => g.zonas.some((z) => z.uso === "garaje_privado"));
  const conduccion = c && c.clase === "conduccion" && !c.porC13 ? c : null;
  const estaciones = est && est.clase === "estaciones" ? est : null;
  const esquema = esq && esq.clase === "esquema" && !esq.unifamiliar ? esq : null;
  const estacion = tipo && tipo.clase === "estacion" ? tipo : null;
  // Números fijos: con el React Compiler, un contador mutado en el JSX se memoriza mal.
  const visibles = [true, otros && j.plazas > 0, !!estaciones, !!conduccion, !!estaciones, !!esquema, !!estacion];
  const n = visibles.map((_, i) => visibles.slice(0, i + 1).filter(Boolean).length);
  const H = ESTACIONES_HE6.datos;

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {j.unifamiliar ? (
        <DecisionValor
          numero={n[0]}
          pregunta="Aparcamiento de la vivienda"
          marca={sinGaraje ? { texto: "REBT" } : { texto: "El edificio" }}
          control={<span className="text-text-primary font-mono text-[13px]">{j.plazas > 0 ? plazas(j.plazas) : "Ninguno"}</span>}
          texto={
            sinGaraje ? (
              <>
                Sin garaje en El edificio, la plaza en la parcela se marca en{" "}
                <Link to={`/p/${proyecto.id}/rebt/prevision`} className="text-accent hover:text-accent-hover underline">
                  REBT
                </Link>
                : con ella, la vivienda lleva el circuito de recarga.
              </>
            ) : (
              "El garaje de la vivienda: lleva el circuito C13 de recarga del REBT, que cubre la conducción."
            )
          }
        />
      ) : (
        <DecisionValor
          numero={n[0]}
          pregunta="Plazas exteriores"
          marca={state.plazasExteriores > 0 ? { texto: "indicadas" } : { texto: "ninguna" }}
          control={<CampoNumero id="he6-exteriores" etiqueta="Plazas exteriores" value={state.plazasExteriores} unidad="plazas" decimales={0} onChange={(v) => setField("plazasExteriores", entero(v) ?? 0)} />}
          texto={`Las de automóvil al aire libre adscritas al edificio: cuentan con las ${pz && pz.clase === "plazas" ? pz.interiores : 0} de los garajes de El edificio.`}
        />
      )}

      {otros && j.plazas > 0 && (
        <Decision<"no" | "si">
          numero={n[1]}
          pregunta="Administración General del Estado"
          opciones={[
            { valor: "no", label: "No" },
            { valor: "si", label: "Sí" },
          ]}
          valor={state.age ? "si" : "no"}
          habitual="no"
          onChange={(v) => setField("age", v === "si")}
          texto={
            state.age
              ? "Edificio de la Administración General del Estado o de sus organismos: una estación por cada 20 plazas, en lugar de 40."
              : "Solo la Administración General del Estado y sus organismos llevan una estación cada 20 plazas; las comunidades autónomas y los ayuntamientos, no."
          }
        />
      )}

      {estaciones && (
        <DecisionValor
          numero={n[2]}
          pregunta="Plazas accesibles"
          marca={estaciones.accesiblesSua ? { texto: "SUA 9" } : { texto: "indicadas" }}
          control={<CampoNumero id="he6-accesibles" etiqueta="Plazas accesibles" value={estaciones.accesibles} unidad="plazas" decimales={0} onChange={(v) => setField("plazasAccesibles", entero(v))} />}
          texto="Las que pide SUA 9, o más si el proyecto las tiene: una estación por cada 5, que cuenta en el total."
        />
      )}

      {conduccion && (
        <DecisionValor
          numero={n[3]}
          pregunta="Plazas con conducción de cables"
          marca={conduccion.minimas ? { texto: "las mínimas" } : { texto: "indicadas" }}
          control={<CampoNumero id="he6-conduccion" etiqueta="Plazas con conducción" value={conduccion.previstas} unidad="plazas" decimales={0} onChange={(v) => setField("plazasConduccion", entero(v))} />}
          texto={
            otros
              ? `Al menos el 20 %: ${plazas(conduccion.exigidas)}. Las plazas con estación cuentan.`
              : "Todas: la conducción llega desde la centralización de contadores hasta cada plaza."
          }
        />
      )}

      {estaciones && (
        <DecisionValor
          numero={n[4]}
          pregunta="Estaciones de recarga"
          marca={estaciones.minimas ? { texto: "las mínimas" } : { texto: "indicadas" }}
          control={<CampoNumero id="he6-estaciones" etiqueta="Estaciones de recarga" value={estaciones.instaladas} unidad="estac." decimales={0} onChange={(v) => setField("estaciones", entero(v))} />}
          texto={`Mínimo ${estaciones.minimo}: ${estaciones.porPlazas} por plazas${estaciones.porAccesibles > 0 ? `, ${estaciones.porAccesibles} de ellas en plazas accesibles` : ""}.`}
        />
      )}

      {esquema && (
        <Decision<Esquema>
          numero={n[5]}
          pregunta="Esquema de conexión"
          opciones={(["1", "2", "3", "4"] as const).map((v) => ({
            valor: v,
            label: v,
            ...(v === "2" && otros ? { deshabilitada: true, motivo: "Sin viviendas, no hay contador común" } : {}),
          }))}
          valor={esquema.esquema}
          habitual={esquemaHabitual(!otros, false)}
          onChange={(v) => setField("esquema", v === esquemaHabitual(!otros, false) ? "habitual" : v)}
          texto={`${NOMBRE_ESQUEMA[esquema.esquema]} (${esquema.subesquema}): ${TEXTO_SUBESQUEMA[esquema.subesquema]}. REBT lo lee: el factor de 0,3 solo vale en el colectivo con SPL.`}
        />
      )}

      {estacion && (
        <Decision<number>
          numero={n[6]}
          pregunta="Potencia de la estación"
          opciones={H.opciones.map((o) => ({ valor: o.potencia_W, label: kW(o.potencia_W) }))}
          valor={estacion.potencia_W}
          habitual={H.habitual_W}
          onChange={(v) => setField("potenciaEstacion_W", v)}
          texto={`Punto de recarga tipo SAVE, modo 3, base tipo 2, ${estacion.texto}.${otros ? " REBT la prevé en la carga del edificio." : ""}`}
        />
      )}
    </section>
  );
}

export function He6Module(): JSX.Element {
  return <PantallaSi def={he6} Decisiones={DecisionesHe6} />;
}
