// DB-HS1 — Las decisiones del proyectista (feature-17): cómo es el muro, el
// suelo, la fachada y la cubierta. Son las columnas de las tablas de condiciones;
// cada una dice lo habitual o lo que supone apartarse de ello. Solo aparecen las
// que el edificio pide (sin sótano no hay muro). Se guardan como «habitual»
// mientras coincidan con lo habitual.

import type { JSX, ReactNode } from "react";
import { Decision, Opciones } from "../../components/justificacion/Decision";
import { CONDICIONES, codigos } from "./condiciones";
import { NOMBRE_PROTECCION } from "./cubierta";
import {
  INTERVENCIONES_TERRENO,
  proteccionesDe,
  type AislantePlana,
  type DecisionesEfectivasHs1,
  type HojasFachada,
  type ImpermeabilizacionInclinada,
  type ImpermeabilizacionMuro,
  type IntervencionTerreno,
  type RevestimientoFachada,
  type TipoMuro,
  type TipoSuelo,
} from "./decisiones";
import type { Hs1Estado } from "./estado";
import type { JustificacionHs1 } from "./justificacion";
import { PENDIENTES_CUBIERTA_INCLINADA_TABLA_2_10, type ProteccionPlana } from "./tablas";
import { textoIncumplimiento, textoPendiente } from "./textos";

interface DecisionesHs1Props {
  state: Hs1Estado;
  setField: <K extends keyof Hs1Estado>(field: K, value: Hs1Estado[K]) => void;
  j: JustificacionHs1;
}

const ETIQUETA_INTERVENCION: Record<IntervencionTerreno, string> = {
  sin_intervencion: "Ninguna",
  sub_base: "Sub-base",
  inyecciones: "Inyecciones",
};

/** Un control secundario dentro de una decisión, con su rótulo encima (todo el ancho para las opciones). */
function Fila({ rotulo, children }: { rotulo: string; children: ReactNode }): JSX.Element {
  return (
    <div className="mt-2.5">
      <div className="text-text-disabled mb-1 text-[11px]">{rotulo}</div>
      {children}
    </div>
  );
}

const SELECT =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent h-7 w-full rounded border px-1.5 text-[12px] focus:outline-none";

/** Las combinaciones de una casilla de la tabla 2.7, una por línea (algunas son largas). */
function Combinaciones({ opciones, valor, onChange }: { opciones: string[]; valor: number; onChange: (i: number) => void }): JSX.Element {
  return (
    <div role="group" aria-label="Combinación de condiciones" className="flex flex-col gap-1">
      {opciones.map((o, i) => (
        <button
          key={o}
          type="button"
          aria-pressed={i === valor}
          onClick={() => onChange(i)}
          className={[
            "h-7 rounded border px-2 text-left font-mono text-[12px] transition-colors",
            i === valor
              ? "border-accent/50 bg-tint-accent text-accent font-medium"
              : "border-border-main bg-bg-primary text-text-secondary hover:text-text-primary",
          ].join(" ")}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Las condiciones en palabras cortas: «hoja de espesor medio · revestimiento…». */
function enPalabras(c: readonly string[], el: "muro" | "suelo" | "fachada"): string {
  if (c.length === 0) return "La tabla no le exige ninguna condición.";
  return `${codigos(c)}: ${c.map((x) => CONDICIONES[el][x]?.corto.toLowerCase() ?? x).join(" · ")}.`;
}

export function DecisionesHs1({ state, setField, j }: DecisionesHs1Props): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  const elegir = <K extends keyof DecisionesEfectivasHs1>(k: K, v: DecisionesEfectivasHs1[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as Hs1Estado[K]);
  };
  const claves = Object.keys(h) as (keyof DecisionesEfectivasHs1)[];
  const enLoHabitual = claves.every((k) => state[k] === "habitual" || state[k] === undefined);
  const volverAloHabitual = () => {
    for (const k of claves) setField(k, "habitual" as Hs1Estado[typeof k]);
  };

  const muro = j.elementos.find((e) => e.id === "muro");
  const suelo = j.elementos.find((e) => e.detalle.clase === "suelo");
  const fachada = j.elementos.find((e) => e.id === "fachada");
  let n = 0;

  const textoMuro = (): string => {
    if (!muro || muro.detalle.clase !== "muro") return "";
    const t = textoIncumplimiento(muro);
    if (t) return t.detalle;
    return `Grado ${muro.detalle.grado}. ${enPalabras(muro.detalle.condiciones ?? [], "muro")}`;
  };
  const textoSuelo = (): string => {
    if (!suelo || suelo.detalle.clase !== "suelo") return "";
    const t = textoIncumplimiento(suelo);
    if (t) return t.detalle;
    return `Grado ${suelo.detalle.grado}. ${enPalabras(suelo.detalle.condiciones ?? [], "suelo")}`;
  };

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {muro && muro.detalle.clase === "muro" && (
        <Decision<ImpermeabilizacionMuro>
          numero={++n}
          pregunta="El muro del sótano"
          opciones={[
            { valor: "exterior", label: "Por fuera" },
            { valor: "interior", label: "Por dentro" },
            { valor: "parcialmente_estanco", label: "Con cámara" },
          ]}
          valor={d.muroImper}
          habitual={h.muroImper}
          onChange={(v) => elegir("muroImper", v)}
          esHabitual={d.muroImper === h.muroImper && d.muroTipo === h.muroTipo}
          texto={textoMuro()}
          extra={
            <Fila rotulo="Tipo de muro">
              <select aria-label="Tipo de muro" value={d.muroTipo} onChange={(e) => elegir("muroTipo", e.target.value as TipoMuro)} className={SELECT}>
                <option value="flexorresistente">Flexorresistente (armado, tras el vaciado)</option>
                <option value="gravedad">De gravedad (sin armar)</option>
                <option value="pantalla">Pantalla (antes del vaciado)</option>
              </select>
            </Fila>
          }
        />
      )}

      {suelo && (
        <Decision<TipoSuelo>
          numero={++n}
          pregunta={j.partes.sotanos ? "El suelo del sótano" : "El suelo de la planta baja"}
          opciones={[
            { valor: "solera", label: "Solera" },
            { valor: "placa", label: "Placa" },
            { valor: "elevado", label: "Elevado" },
          ]}
          valor={d.sueloTipo}
          habitual={h.sueloTipo}
          onChange={(v) => elegir("sueloTipo", v)}
          esHabitual={d.sueloTipo === h.sueloTipo && d.sueloIntervencion === h.sueloIntervencion}
          texto={textoSuelo()}
          extra={
            <Fila rotulo="Intervención en el terreno">
              <Opciones<IntervencionTerreno>
                etiqueta="Intervención en el terreno"
                pequenas
                valor={d.sueloIntervencion}
                onChange={(v) => elegir("sueloIntervencion", v)}
                opciones={INTERVENCIONES_TERRENO.map((i) => ({ valor: i, label: ETIQUETA_INTERVENCION[i] }))}
              />
            </Fila>
          }
        />
      )}

      {fachada && fachada.detalle.clase === "fachada" && (
        <Decision<RevestimientoFachada>
          numero={++n}
          pregunta="La fachada"
          opciones={[
            { valor: "con", label: "Con revestimiento" },
            { valor: "sin", label: "Sin revestimiento" },
          ]}
          valor={d.fachadaRevestimiento}
          habitual={h.fachadaRevestimiento}
          onChange={(v) => {
            elegir("fachadaRevestimiento", v);
            // La combinación es de la casilla de la otra columna: vuelve a la primera.
            setField("fachadaOpcion", "habitual");
          }}
          esHabitual={
            d.fachadaRevestimiento === h.fachadaRevestimiento && d.fachadaHojas === h.fachadaHojas && fachada.detalle.opcion === 0
          }
          texto={`Grado ${fachada.detalle.grado}. ${enPalabras(fachada.detalle.condiciones, "fachada")}`}
          extra={
            <>
              {fachada.detalle.opciones.length > 1 && (
                <Fila rotulo="Combinación de la tabla 2.7">
                  <Combinaciones
                    opciones={fachada.detalle.opciones.map((o) => codigos(o.codigos))}
                    valor={fachada.detalle.opcion}
                    onChange={(v) => elegir("fachadaOpcion", v)}
                  />
                </Fila>
              )}
              <Fila rotulo="Hojas de la fachada">
                <Opciones<HojasFachada>
                  etiqueta="Hojas de la fachada"
                  pequenas
                  valor={d.fachadaHojas}
                  onChange={(v) => elegir("fachadaHojas", v)}
                  opciones={[
                    { valor: "dos", label: "Dos o más" },
                    { valor: "una", label: "Una" },
                  ]}
                />
              </Fila>
            </>
          }
        />
      )}

      {j.cubierta.plana ? (
        <Decision<ProteccionPlana>
          numero={++n}
          pregunta="La cubierta"
          opciones={proteccionesDe(j.cubierta.tipo).map((p) => ({ valor: p, label: NOMBRE_PROTECCION[p] }))}
          valor={d.cubiertaProteccion}
          habitual={h.cubiertaProteccion}
          onChange={(v) => elegir("cubiertaProteccion", v)}
          esHabitual={d.cubiertaProteccion === h.cubiertaProteccion && d.cubiertaAislante === h.cubiertaAislante}
          texto={`Pendiente ${textoPendiente(j.cubierta) ?? ""} (tabla 2.9).${j.cubierta.ajardinadaCriterio ? " La ajardinada es un uso aparte en la tabla 2.9: se trata con la no transitable (criterio)." : ""}`}
          extra={
            d.cubiertaProteccion !== "lamina_autoprotegida" ? (
              <Fila rotulo="Aislante">
                <Opciones<AislantePlana>
                  etiqueta="Posición del aislante"
                  pequenas
                  valor={d.cubiertaAislante}
                  onChange={(v) => elegir("cubiertaAislante", v)}
                  opciones={[
                    { valor: "sobre", label: "Invertida" },
                    { valor: "bajo", label: "Convencional" },
                  ]}
                />
              </Fila>
            ) : undefined
          }
        />
      ) : (
        <Decision<ImpermeabilizacionInclinada>
          numero={++n}
          pregunta="La cubierta"
          opciones={[
            { valor: "sin", label: "Solo el tejado" },
            { valor: "con", label: "Con lámina" },
          ]}
          valor={d.cubiertaImpermeabilizacion}
          habitual={h.cubiertaImpermeabilizacion}
          onChange={(v) => elegir("cubiertaImpermeabilizacion", v)}
          esHabitual={d.cubiertaImpermeabilizacion === h.cubiertaImpermeabilizacion && d.cubiertaTejado === h.cubiertaTejado}
          texto={
            j.cubierta.pendiente
              ? `Sin capa de impermeabilización, la pendiente debe ser ${textoPendiente(j.cubierta)} (tabla 2.10).`
              : "Con capa de impermeabilización bajo el tejado, la tabla 2.10 no obliga."
          }
          extra={
            <Fila rotulo="Tejado">
              <select
                aria-label="Tejado"
                value={d.cubiertaTejado}
                onChange={(e) => elegir("cubiertaTejado", Number(e.target.value))}
                className={SELECT}
              >
                {PENDIENTES_CUBIERTA_INCLINADA_TABLA_2_10.datos.filas.map((f, i) => (
                  <option key={i} value={i}>
                    {f.grupo === "Teja" || f.grupo === "Pizarra" || f.grupo === "Cinc" ? f.pieza : `${f.grupo} · ${f.pieza.toLowerCase()}`} · {f.min_pct} %
                  </option>
                ))}
              </select>
            </Fila>
          }
        />
      )}

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
