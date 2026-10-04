// DB-SUA, SUA 1 — Pantalla del riesgo de caídas (feature-20). La pantalla es la
// común (`PantallaSi`); aquí van las decisiones que El edificio no describe: cómo
// es la escalera (anchura, huella, tramos, ojo), la escalera interior, la altura
// de las barreras, las rampas, el uso público de las oficinas y la carpintería.
// El ascensor no se decide aquí: se lee de El edificio (SUA 9).

import type { JSX } from "react";
import { Decision, DecisionValor } from "../../components/justificacion/Decision";
import { CampoNumero } from "../../components/edificio/controles";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { sua1 } from "./definicion";
import type { Acceso, Carpinteria, DecisionesSua1, Ojo, RampaGaraje, SiNo, Sua1Estado, Tramos } from "./estado";
import type { DetalleEscalera, JustificacionSua1 } from "./justificacion";
import { pendienteAccesibleMax_pct, SUA1_ESCALERA_GENERAL, SUA1_ESCALERA_RESTRINGIDA, SUA1_RAMPAS } from "./tablas";
import { cm, m, pct } from "./textos";

type ClaveDecision = "general" | "tramos" | "ojo" | "interior" | "barreras" | "rampaGaraje" | "acceso" | "usoPublico" | "carpinteria";

/** El número de cada decisión visible, en un orden fijo (PURO, sin contadores). */
function numeracion(j: JustificacionSua1): Record<ClaveDecision, number> {
  const c = j.contexto;
  const visibles: [ClaveDecision, boolean][] = [
    ["general", c.general],
    ["tramos", c.general],
    ["ojo", c.general],
    ["interior", c.interior],
    ["barreras", c.barrerasBajas || c.barrerasAltas],
    ["rampaGaraje", c.rampaGaraje],
    ["acceso", c.acceso],
    ["usoPublico", c.oficinas],
    ["carpinteria", c.limpieza],
  ];
  const orden = visibles.filter(([, v]) => v).map(([k]) => k);
  return Object.fromEntries(visibles.map(([k]) => [k, orden.indexOf(k) + 1])) as Record<ClaveDecision, number>;
}

function escalera(j: JustificacionSua1, id: string): DetalleEscalera | null {
  const d = j.elementos.find((e) => e.id === id)?.detalle;
  return d && d.clase === "escalera" ? d : null;
}

function DecisionesSua1({ state, setField, j }: PropsDecisionesSi<Sua1Estado, JustificacionSua1>): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  const c = j.contexto;
  const n = numeracion(j);
  const elegir = <K extends keyof DecisionesSua1>(k: K, v: DecisionesSua1[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as Sua1Estado[K]);
  };
  const comun = escalera(j, "escalera-comun") ?? escalera(j, "escalera-garaje");
  const interior = escalera(j, "escalera-interior");
  const G = SUA1_ESCALERA_GENERAL.datos;
  const R = SUA1_ESCALERA_RESTRINGIDA.datos;
  const ascensor = c.ascensor.valor
    ? `Con ascensor${c.ascensor.supuesto ? " (supuesto: SUA 9 lo exige)" : ""}`
    : `Sin ascensor${c.ascensor.supuesto ? " (supuesto: SUA 9 no lo exige)" : ""}`;
  const accesoMax = pendienteAccesibleMax_pct(d.rampaLongitud_m);

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {c.general && (
        <p className="text-text-secondary border-border-sub border-t pt-3 pb-3 text-[12px] leading-normal">
          {ascensor} como alternativa a la escalera. Se indica en El edificio; decide la contrahuella máxima ({cm(c.ascensor.valor ? G.contrahuellaMaxConAscensor_cm : G.contrahuellaMax_cm)}), el tramo máximo y los pasamanos.
        </p>
      )}

      {c.general && comun && (
        <DecisionValor
          numero={n.general}
          pregunta="Escalera común: anchura y huella"
          marca={state.anchura_m === "habitual" && state.huella_cm === "habitual" ? { texto: "lo habitual" } : { texto: "indicada" }}
          control={
            <div className="flex items-center gap-1.5">
              <CampoNumero id="sua1-anchura" value={d.anchura_m} unidad="m" decimales={2} onChange={(v) => elegir("anchura_m", Math.round(v * 100) / 100)} />
              <CampoNumero id="sua1-huella" value={d.huella_cm} unidad="cm" decimales={1} onChange={(v) => elegir("huella_cm", Math.round(v * 10) / 10)} />
            </div>
          }
          texto={`Anchura útil ≥ ${m(comun.anchuraMin_m)} (tabla 4.1) y huella ≥ ${cm(G.huellaMin_cm, 0)}. Con ${cm(d.huella_cm)} de huella, 2C + H va de ${cm(comun.relacionMenor_cm)} a ${cm(comun.relacionMayor_cm)} (${G.relacionMin_cm}–${cm(G.relacionMax_cm, 0)}). Lo habitual: ${m(h.anchura_m)} y la huella que da 2C + H ≈ 63 cm.`}
        />
      )}

      {c.general && comun && (
        <Decision<Tramos>
          numero={n.tramos}
          pregunta="Tramos por planta"
          opciones={[
            { valor: 1, label: "1" },
            { valor: 2, label: "2" },
            { valor: 3, label: "3" },
            { valor: 4, label: "4" },
          ]}
          valor={d.tramos}
          habitual={h.tramos}
          onChange={(v) => elegir("tramos", v)}
          texto={`El tramo más largo salva ${m(comun.alturaTramoMayor_m)}; como máximo, ${m(comun.tramoMax_m ?? 0)} ${c.ascensor.valor && !comun.usoPublico ? "con ascensor como alternativa" : "sin ascensor o en uso público"}.`}
        />
      )}

      {c.general && comun && (
        <Decision<Ojo>
          numero={n.ojo}
          pregunta="Ojo de la escalera"
          opciones={[
            { valor: "estrecho", label: "Menor de 40 cm" },
            { valor: "ancho", label: "40 cm o más" },
          ]}
          valor={d.ojo}
          habitual={h.ojo}
          onChange={(v) => elegir("ojo", v)}
          texto={
            d.ojo === "estrecho"
              ? "Con el hueco de menos de 40 cm, la barandilla mide 0,90 m como mínimo, sea cual sea la caída."
              : `La barandilla protege la caída por el ojo, ${m(comun.caida_m)}: ${m(comun.barandillaMin_m)} como mínimo.`
          }
        />
      )}

      {c.interior && interior && (
        <DecisionValor
          numero={n.interior}
          pregunta="Escalera interior: anchura y huella"
          marca={state.interiorAnchura_m === "habitual" && state.interiorHuella_cm === "habitual" ? { texto: "lo habitual" } : { texto: "indicada" }}
          control={
            <div className="flex items-center gap-1.5">
              <CampoNumero id="sua1-int-anchura" value={d.interiorAnchura_m} unidad="m" decimales={2} onChange={(v) => elegir("interiorAnchura_m", Math.round(v * 100) / 100)} />
              <CampoNumero id="sua1-int-huella" value={d.interiorHuella_cm} unidad="cm" decimales={1} onChange={(v) => elegir("interiorHuella_cm", Math.round(v * 10) / 10)} />
            </div>
          }
          texto={`Uso restringido: anchura ≥ ${m(R.anchuraMin_m)}, huella ≥ ${cm(R.huellaMin_cm, 0)} y contrahuella ≤ ${cm(R.contrahuellaMax_cm, 0)}; sale de ${cm(interior.cMayor_cm, 2)}. Lo habitual: ${m(h.interiorAnchura_m)} y ${cm(h.interiorHuella_cm)}.`}
        />
      )}

      {(c.barrerasBajas || c.barrerasAltas) && (
        <DecisionValor
          numero={n.barreras}
          pregunta="Altura de las barreras"
          marca={state.barreraBaja_m === "habitual" && state.barreraAlta_m === "habitual" ? { texto: "lo habitual" } : { texto: "indicada" }}
          control={
            <div className="flex flex-wrap items-center gap-1.5">
              {c.barrerasBajas && (
                <label className="text-text-disabled flex items-center gap-1 text-[11px]">
                  hasta 6 m
                  <CampoNumero id="sua1-barrera-baja" value={d.barreraBaja_m} unidad="m" decimales={2} onChange={(v) => elegir("barreraBaja_m", Math.round(v * 100) / 100)} />
                </label>
              )}
              {c.barrerasAltas && (
                <label className="text-text-disabled flex items-center gap-1 text-[11px]">
                  más de 6 m
                  <CampoNumero id="sua1-barrera-alta" value={d.barreraAlta_m} unidad="m" decimales={2} onChange={(v) => elegir("barreraAlta_m", Math.round(v * 100) / 100)} />
                </label>
              )}
            </div>
          }
          texto={`Terrazas, balcones y ventanas: 0,90 m como mínimo con el suelo hasta 6 m sobre la rasante, 1,10 m por encima${c.cubierta === "plana_transitable" ? "; también la cubierta transitable" : ""}. Lo habitual: ${m(h.barreraAlta_m)} en todas.`}
        />
      )}

      {c.rampaGaraje && (
        <Decision<RampaGaraje>
          numero={n.rampaGaraje}
          pregunta="Rampa del garaje"
          opciones={[
            { valor: "vehiculos", label: "Solo vehículos" },
            { valor: "peatones", label: "También peatones" },
          ]}
          valor={d.rampaGaraje}
          habitual={h.rampaGaraje}
          onChange={(v) => elegir("rampaGaraje", v)}
          extra={
            d.rampaGaraje === "peatones" ? (
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-text-disabled text-[11px]">Pendiente</span>
                <CampoNumero id="sua1-pendiente-garaje" value={d.pendienteGaraje_pct} unidad="%" decimales={1} onChange={(v) => elegir("pendienteGaraje_pct", Math.round(v * 10) / 10)} />
              </div>
            ) : undefined
          }
          texto={
            d.rampaGaraje === "peatones"
              ? `Con paso de personas y fuera del itinerario accesible, ${pct(SUA1_RAMPAS.datos.aparcamientoMixta_pct)} como máximo (y SUA 7).`
              : "El peatón entra por la escalera: la rampa no es itinerario de personas y su pendiente la fija la ordenanza."
          }
        />
      )}

      {c.acceso && (
        <Decision<Acceso>
          numero={n.acceso}
          pregunta="Acceso al edificio"
          opciones={[
            { valor: "cota", label: "A cota de la acera" },
            { valor: "rampa", label: "Con rampa" },
          ]}
          valor={d.acceso}
          habitual={h.acceso}
          onChange={(v) => elegir("acceso", v)}
          extra={
            d.acceso === "rampa" ? (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <label className="text-text-disabled flex items-center gap-1 text-[11px]">
                  tramo
                  <CampoNumero id="sua1-rampa-longitud" value={d.rampaLongitud_m} unidad="m" decimales={2} onChange={(v) => elegir("rampaLongitud_m", Math.round(v * 100) / 100)} />
                </label>
                <label className="text-text-disabled flex items-center gap-1 text-[11px]">
                  pendiente
                  <CampoNumero id="sua1-rampa-pendiente" value={d.rampaPendiente_pct} unidad="%" decimales={1} onChange={(v) => elegir("rampaPendiente_pct", Math.round(v * 10) / 10)} />
                </label>
              </div>
            ) : undefined
          }
          texto={
            d.acceso === "rampa"
              ? `Rampa del itinerario accesible: con ${m(d.rampaLongitud_m)} de tramo, ${pct(accesoMax)} como máximo (10 % por debajo de 3 m, 8 % de 6 m, 6 % en el resto).`
              : "La entrada principal está a la cota de la acera: no hay rampa que justificar."
          }
        />
      )}

      {c.oficinas && (
        <Decision<SiNo>
          numero={n.usoPublico}
          pregunta="Zonas de uso público en las oficinas"
          opciones={[
            { valor: "no", label: "No" },
            { valor: "si", label: "Sí" },
          ]}
          valor={d.usoPublico}
          habitual={h.usoPublico}
          onChange={(v) => elegir("usoPublico", v)}
          texto={
            d.usoPublico === "si"
              ? "Atención al público o salas de visitas: la escalera, con 17,5 cm y tramos de 2,25 m como máximo; barreras sin aberturas de 15 cm."
              : "Oficinas de uso privado: sin atención al público ni salas de reuniones con visitas."
          }
        />
      )}

      {c.limpieza && (
        <Decision<Carpinteria>
          numero={n.carpinteria}
          pregunta="Carpintería por encima de 6 m"
          opciones={[
            { valor: "practicable", label: "Practicable" },
            { valor: "fijos", label: "Con fijos" },
          ]}
          valor={d.carpinteria}
          habitual={h.carpinteria}
          onChange={(v) => elegir("carpinteria", v)}
          texto={
            d.carpinteria === "practicable"
              ? "Hojas practicables o fácilmente desmontables: se limpian desde dentro."
              : "Los fijos quedan a 0,85 m como máximo de un punto del borde practicable a 1,30 m de altura o menos."
          }
        />
      )}
    </section>
  );
}

export function Sua1Module(): JSX.Element {
  return <PantallaSi def={sua1} Decisiones={DecisionesSua1} />;
}
