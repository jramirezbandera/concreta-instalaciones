// DB-SUA, SUA 8 — Pantalla de la acción del rayo (feature-20). La pantalla es la
// común (`PantallaSi`); aquí van las decisiones que El edificio no describe: la
// planta, el remate de la cubierta, el entorno, los materiales, el contenido, el
// uso especial y si se proyecta la instalación. Ng es un dato de la obra.

import type { JSX } from "react";
import { Decision, DecisionValor, Opciones } from "../../components/justificacion/Decision";
import { CampoNumero } from "../../components/edificio/controles";
import { fmt } from "../../lib/units/format";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { sua8 } from "./definicion";
import type { Contenido, DecisionesSua8, Instalacion, Sua8Estado, UsoEspecial } from "./estado";
import type { JustificacionSua8 } from "./justificacion";
import type { EntornoC1, MaterialC2 } from "./tablas";
import { NOMBRE_ENTORNO } from "./textos";

const MATERIALES: { valor: MaterialC2; label: string }[] = [
  { valor: "hormigon", label: "Hormigón" },
  { valor: "metalica", label: "Metálica" },
  { valor: "madera", label: "Madera" },
];

function DecisionesSua8({ state, setField, j }: PropsDecisionesSi<Sua8Estado, JustificacionSua8>): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  const elegir = <K extends keyof DecisionesSua8>(k: K, v: DecisionesSua8[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as Sua8Estado[K]);
  };
  const p = j.planta;
  const obligatoria = j.resultado.obligatoria;

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      <DecisionValor
        numero={1}
        pregunta="Planta del edificio"
        marca={p.supuesta ? { texto: "supuesta", aviso: false } : { texto: "indicada" }}
        control={
          <div className="flex items-center gap-1.5">
            <CampoNumero id="sua8-largo" value={p.largo_m} unidad="m" decimales={1} onChange={(v) => setField("largo_m", v > 0 ? v : null)} />
            <span className="text-text-disabled text-[12px]">×</span>
            <CampoNumero id="sua8-ancho" value={p.ancho_m} unidad="m" decimales={1} onChange={(v) => setField("ancho_m", v > 0 ? v : null)} />
          </div>
        }
        texto={
          p.supuesta
            ? "Se supone cuadrada, con la superficie de la cubierta. Indica el largo y el ancho si la forma importa: se avisa cuando cambia el resultado."
            : "Largo y ancho de la planta: de ellos y de la altura sale la superficie de captura a 3H."
        }
      />

      <DecisionValor
        numero={2}
        pregunta="Remate sobre la cubierta"
        marca={state.remate_m === "habitual" ? { texto: "lo habitual" } : { texto: "indicado" }}
        control={<CampoNumero id="sua8-remate" value={d.remate_m} unidad="m" decimales={2} onChange={(v) => elegir("remate_m", Math.round(v * 100) / 100)} />}
        texto={`Peto, cumbrera o casetón por encima del forjado de cubierta. Con él, H = ${fmt(j.h_m, "m", 2)}.`}
      />

      <Decision<EntornoC1>
        numero={3}
        pregunta="Entorno"
        opciones={[
          { valor: "proximo", label: "Próximo" },
          { valor: "rodeado_bajos", label: "Más alto" },
          { valor: "aislado", label: "Aislado" },
          { valor: "colina", label: "Colina" },
        ]}
        valor={d.entorno}
        habitual={h.entorno}
        onChange={(v) => elegir("entorno", v)}
        texto={`Edificio ${NOMBRE_ENTORNO[d.entorno]} (C1, tabla 1.1). Aislado: sin edificios a menos de 3H.`}
      />

      <Decision<MaterialC2>
        numero={4}
        pregunta="Estructura y cubierta"
        opciones={MATERIALES}
        valor={d.estructura}
        habitual={h.estructura}
        esHabitual={d.estructura === h.estructura && d.cubierta === h.cubierta}
        onChange={(v) => elegir("estructura", v)}
        extra={
          <div className="mt-2.5">
            <div className="text-text-disabled mb-1 text-[11px]">Estructura de la cubierta</div>
            <Opciones<MaterialC2> etiqueta="Estructura de la cubierta" pequenas opciones={MATERIALES} valor={d.cubierta} onChange={(v) => elegir("cubierta", v)} />
          </div>
        }
        texto="Coeficiente C2 (tabla 1.2). Un muro de fábrica se asimila al hormigón."
      />

      <Decision<Contenido>
        numero={5}
        pregunta="Contenido"
        opciones={[
          { valor: "otros", label: "Normal" },
          { valor: "inflamable", label: "Inflamable" },
        ]}
        valor={d.contenido}
        habitual={h.contenido}
        onChange={(v) => elegir("contenido", v)}
        texto={d.contenido === "inflamable" ? "Grandes cantidades de material inflamable, como papel: C3 = 3." : "Viviendas, oficinas y garaje: C3 = 1."}
      />

      <Decision<UsoEspecial>
        numero={6}
        pregunta="Uso especial"
        opciones={[
          { valor: "ninguno", label: "Ninguno" },
          { valor: "servicio", label: "Servicio" },
          { valor: "peligrosas", label: "Sustancias" },
        ]}
        valor={d.especial}
        habitual={h.especial}
        onChange={(v) => elegir("especial", v)}
        texto={
          d.especial === "servicio"
            ? "Su deterioro interrumpiría un servicio imprescindible: C5 = 5."
            : d.especial === "peligrosas"
              ? "Se manipulan sustancias tóxicas, radioactivas, altamente inflamables o explosivas: siempre nivel 1."
              : "Ni servicio imprescindible ni sustancias peligrosas."
        }
      />

      <Decision<Instalacion>
        numero={7}
        pregunta="Instalación de protección"
        opciones={[
          { valor: "si", label: "Se proyecta" },
          { valor: "no", label: "No" },
        ]}
        valor={d.instalacion}
        habitual={h.instalacion}
        onChange={(v) => elegir("instalacion", v)}
        texto={
          obligatoria
            ? `Es obligatoria, de nivel ${j.resultado.nivel}.`
            : d.instalacion === "si"
              ? "No es obligatoria; se proyecta igualmente."
              : "No es obligatoria con este cálculo."
        }
      />
    </section>
  );
}

export function Sua8Module(): JSX.Element {
  return <PantallaSi def={sua8} Decisiones={DecisionesSua8} />;
}
