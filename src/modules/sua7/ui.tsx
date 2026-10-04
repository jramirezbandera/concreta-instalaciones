// DB-SUA, SUA 7 — Pantalla de los vehículos en movimiento (feature-20). La
// pantalla es la común (`PantallaSi`); aquí van las decisiones sobre el garaje
// que El edificio no describe: cómo sale a la calle y su espacio de espera, si
// hay paso de peatones por la rampa y el dispositivo de alerta de la salida.

import type { JSX } from "react";
import { CampoNumero } from "../../components/edificio/controles";
import { Decision, Opciones } from "../../components/justificacion/Decision";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { sua7 } from "./definicion";
import type { Alerta, DecisionesSua7, Peatones, Proteccion, Salida, Sua7Estado } from "./estado";
import type { JustificacionSua7 } from "./justificacion";
import { m, NOMBRE_ALERTA, pct } from "./textos";

function DecisionesSua7({ state, setField, j }: PropsDecisionesSi<Sua7Estado, JustificacionSua7>): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  const elegir = <K extends keyof DecisionesSua7>(k: K, v: DecisionesSua7[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as Sua7Estado[K]);
  };
  const cifra = (k: "fondo_m" | "pendiente_pct" | "anchuraPeatones_m", v: number) => {
    const r = Math.round(v * 100) / 100;
    elegir(k, r > 0 || k === "pendiente_pct" ? r : h[k]);
  };
  const habitual = (...k: (keyof Sua7Estado)[]) => k.every((x) => state[x] === "habitual" || state[x] === undefined);
  const aparcamiento = j.motivo === "aparcamiento";
  // Números fijos: con el React Compiler, un contador mutado en el JSX se memoriza mal.
  const n = { salida: 1, peatones: aparcamiento ? 2 : 1, alerta: j.rampa ? 3 : 2 };

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {!j.garaje && (
        <p className="text-text-secondary border-border-sub border-t pt-3 pb-3 text-[12px] leading-normal">
          {j.motivo === "unifamiliar"
            ? "El garaje de una vivienda unifamiliar queda fuera del ámbito: no hay nada que decidir."
            : "Sin garaje ni vías de circulación de vehículos no hay nada que decidir."}
        </p>
      )}

      {j.motivo === "vias" && !j.rampa && (
        <p className="text-text-secondary border-border-sub border-t pt-3 pb-3 text-[12px] leading-normal">
          El garaje no es uso Aparcamiento y está en la planta baja, sin rampa: solo se declara su señalización.
        </p>
      )}

      {aparcamiento && (
        <Decision<Salida>
          numero={n.salida}
          pregunta="Salida a la calle"
          opciones={[
            { valor: "ascendente", label: "Sube" },
            { valor: "nivel", label: "A nivel" },
            { valor: "descendente", label: "Baja" },
          ]}
          valor={d.salida}
          habitual={h.salida}
          esHabitual={habitual("salida", "fondo_m", "pendiente_pct")}
          onChange={(v) => elegir("salida", v)}
          extra={
            d.salida !== "descendente" ? (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="text-text-disabled text-[11px]">Espacio de espera</span>
                <CampoNumero id="sua7-fondo" value={d.fondo_m} unidad="m" decimales={2} onChange={(v) => cifra("fondo_m", v)} />
                <span className="text-text-disabled text-[12px]">al</span>
                <CampoNumero id="sua7-pendiente" value={d.pendiente_pct} unidad="%" decimales={1} onChange={(v) => cifra("pendiente_pct", v)} />
              </div>
            ) : undefined
          }
          texto={
            d.salida === "descendente"
              ? "Bajando a la calle no hace falta espacio de espera (comentario del Ministerio, no reglamentario)."
              : `Antes de la calle, un tramo de ${m(d.fondo_m)} al ${pct(d.pendiente_pct)}: 4,50 m como mínimo y 5 % como máximo.`
          }
        />
      )}

      {j.rampa && (
        <Decision<Peatones>
          numero={n.peatones}
          pregunta="Peatones por la rampa"
          opciones={[
            { valor: "no", label: "Por la escalera" },
            { valor: "rampa", label: "Por la rampa" },
          ]}
          valor={d.peatones}
          habitual={h.peatones}
          esHabitual={habitual("peatones", "anchuraPeatones_m", "proteccion")}
          onChange={(v) => elegir("peatones", v)}
          extra={
            d.peatones === "rampa" ? (
              <div className="mt-2.5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-text-disabled text-[11px]">Anchura del paso</span>
                  <CampoNumero id="sua7-anchura" value={d.anchuraPeatones_m} unidad="m" decimales={2} onChange={(v) => cifra("anchuraPeatones_m", v)} />
                </div>
                <Opciones<Proteccion>
                  etiqueta="Protección del paso"
                  pequenas
                  opciones={[
                    { valor: "barrera", label: "Barrera de 0,80 m" },
                    { valor: "acera", label: "Acera elevada" },
                  ]}
                  valor={d.proteccion}
                  onChange={(v) => elegir("proteccion", v)}
                />
              </div>
            ) : undefined
          }
          texto={
            d.peatones === "no"
              ? "Los peatones bajan al garaje por el núcleo de escalera del edificio: la rampa es solo para vehículos."
              : "Paso de 0,80 m como mínimo, protegido por una barrera de 0,80 m o por pavimento más elevado."
          }
        />
      )}

      {aparcamiento && (
        <Decision<Alerta>
          numero={n.alerta}
          pregunta="Dispositivo de alerta en la salida"
          opciones={[
            { valor: "espejo_luminoso", label: "Espejo y luz" },
            { valor: "espejo", label: "Espejo" },
            { valor: "detector", label: "Detector" },
          ]}
          valor={d.alerta}
          habitual={h.alerta}
          onChange={(v) => elegir("alerta", v)}
          texto={`Avisa al conductor de que hay peatones junto a la salida: ${NOMBRE_ALERTA[d.alerta]}.`}
        />
      )}
    </section>
  );
}

export function Sua7Module(): JSX.Element {
  return <PantallaSi def={sua7} Decisiones={DecisionesSua7} />;
}
