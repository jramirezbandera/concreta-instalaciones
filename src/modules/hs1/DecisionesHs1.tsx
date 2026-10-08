// DB-HS1 — Las decisiones del proyectista (feature-17): cómo es el muro, el
// suelo, la fachada y la cubierta. La fachada es la de El edificio (feature-26):
// aquí solo se declara lo que su tipo no dice (la R del revestimiento; J, N y H
// sin revestimiento). Son las columnas de las tablas de condiciones;
// cada una dice lo habitual o lo que supone apartarse de ello. Solo aparecen las
// que el edificio pide (sin sótano no hay muro). Se guardan como «habitual»
// mientras coincidan con lo habitual.

import type { JSX, ReactNode } from "react";
import { Link } from "react-router";
import { Decision, DecisionValor, Opciones } from "../../components/justificacion/Decision";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { CONDICIONES, codigos } from "./condiciones";
import { NOMBRE_PROTECCION } from "./cubierta";
import {
  INTERVENCIONES_TERRENO,
  proteccionesDe,
  type AislantePlana,
  type DecisionesEfectivasHs1,
  type ImpermeabilizacionInclinada,
  type ImpermeabilizacionMuro,
  type IntervencionTerreno,
  type TipoMuro,
  type TipoSuelo,
} from "./decisiones";
import type { Hs1Estado } from "./estado";
import type { DeclaraFachada } from "./fachada";
import type { DetalleHs1, JustificacionHs1 } from "./justificacion";
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

/** Las condiciones en palabras cortas: «hoja de espesor medio · revestimiento…». */
function enPalabras(c: readonly string[], el: "muro" | "suelo" | "fachada"): string {
  if (c.length === 0) return "La tabla no le exige ninguna condición.";
  return `${codigos(c)}: ${c.map((x) => CONDICIONES[el][x]?.corto.toLowerCase() ?? x).join(" · ")}.`;
}

type DetalleFachada = Extract<DetalleHs1, { clase: "fachada" }>;

/**
 * Una fachada de El edificio: su tipo (se cambia allí), lo que se declara y lo
 * que pide la tabla 2.7 con ello.
 */
function DecisionFachada({
  numero,
  det,
  declara,
  onDeclara,
  enlace,
}: {
  numero: number;
  det: DetalleFachada;
  declara: DeclaraFachada;
  onDeclara: (d: DeclaraFachada) => void;
  enlace: string;
}): JSX.Element {
  const h = det.habituales;
  const poner = <K extends keyof DeclaraFachada>(k: K, v: NonNullable<DeclaraFachada[K]>) => {
    const { [k]: _, ...resto } = declara;
    onDeclara(v === h[k] ? resto : { ...resto, [k]: v });
  };
  const pb = det.rol === "fachada-pb";
  const otraCasilla = det.cumple && det.gradoOpcion > det.grado ? ` Es una combinación del grado ${det.gradoOpcion}, que vale para el ${det.grado}.` : "";
  const texto = det.cumple
    ? `Grado ${det.grado}. ${enPalabras(det.condiciones, "fachada")}${otraCasilla}`
    : `Grado ${det.grado}: no llega. Falta ${det.faltan.map((c) => `${c} (${CONDICIONES.fachada[c]?.corto.toLowerCase() ?? c})`).join(" y ")}.`;
  return (
    <DecisionValor
      numero={numero}
      pregunta={pb ? "La fachada de la planta baja" : "La fachada"}
      control={
        <div className="flex w-full flex-col gap-2">
          <div className="border-border-main bg-bg-surface flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-[12.5px]">
            <span className="text-text-primary min-w-0">
              {det.sol.nombre} <span className="text-text-disabled font-mono text-[11px]">CEC {det.sol.codigo}</span>
            </span>
            <Link to={enlace} className="text-accent hover:text-accent-hover shrink-0 text-[11.5px] underline">
              Cambiar en El edificio
            </Link>
          </div>
          {det.columna === "con_revestimiento" ? (
            <Fila rotulo="Resistencia del revestimiento exterior">
              <Opciones<1 | 2 | 3>
                etiqueta={pb ? "Revestimiento de la planta baja" : "Revestimiento exterior"}
                pequenas
                valor={det.niveles.R as 1 | 2 | 3}
                onChange={(v) => poner("R", v)}
                opciones={[
                  { valor: 1, label: "R1 · media" },
                  { valor: 2, label: "R2 · alta" },
                  { valor: 3, label: "R3 · muy alta" },
                ]}
              />
            </Fila>
          ) : (
            <>
              <Fila rotulo="Juntas">
                <Opciones<1 | 2>
                  etiqueta={pb ? "Juntas de la planta baja" : "Juntas"}
                  pequenas
                  valor={det.niveles.J as 1 | 2}
                  onChange={(v) => poner("J", v)}
                  opciones={[
                    { valor: 1, label: "J1" },
                    { valor: 2, label: "J2 · hidrófugas" },
                  ]}
                />
              </Fila>
              {det.niveles.N > 0 && (
                <Fila rotulo="Enfoscado intermedio">
                  <Opciones<1 | 2>
                    etiqueta={pb ? "Enfoscado intermedio de la planta baja" : "Enfoscado intermedio"}
                    pequenas
                    valor={det.niveles.N as 1 | 2}
                    onChange={(v) => poner("N", v)}
                    opciones={[
                      { valor: 1, label: "N1" },
                      { valor: 2, label: "N2 · hidrófugo" },
                    ]}
                  />
                </Fila>
              )}
              <Fila rotulo="Hoja principal de baja higroscopicidad">
                <Opciones<0 | 1>
                  etiqueta={pb ? "Higroscopicidad de la planta baja" : "Higroscopicidad"}
                  pequenas
                  valor={det.niveles.H as 0 | 1}
                  onChange={(v) => poner("H", v)}
                  opciones={[
                    { valor: 0, label: "No consta" },
                    { valor: 1, label: "H1" },
                  ]}
                />
              </Fila>
            </>
          )}
        </div>
      }
      texto={
        <>
          <b className="text-text-primary font-medium">{det.declarado ? "Declarado." : "Lo habitual."}</b> {texto}
          {det.hidrofilo ? " El aislante es hidrófilo: no cuenta como barrera." : ""}
        </>
      }
    />
  );
}

export function DecisionesHs1({ state, setField, j }: DecisionesHs1Props): JSX.Element {
  const { proyecto } = useProyecto();
  const d = j.decisiones;
  const h = j.habituales;
  const elegir = <K extends keyof DecisionesEfectivasHs1>(k: K, v: DecisionesEfectivasHs1[K]) => {
    setField(k, (v === h[k] ? "habitual" : v) as Hs1Estado[K]);
  };
  const claves = Object.keys(h) as (keyof DecisionesEfectivasHs1)[];
  const declaradas = state.fachadaDeclara ?? {};
  const enLoHabitual =
    claves.every((k) => state[k] === "habitual" || state[k] === undefined) &&
    Object.values(declaradas).every((x) => !x || Object.keys(x).length === 0);
  const volverAloHabitual = () => {
    for (const k of claves) setField(k, "habitual" as Hs1Estado[typeof k]);
    setField("fachadaDeclara", undefined);
  };

  const muro = j.elementos.find((e) => e.id === "muro");
  const suelo = j.elementos.find((e) => e.detalle.clase === "suelo");
  const fachadas = j.elementos.flatMap((e) => (e.detalle.clase === "fachada" ? [e.detalle] : []));
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

      {fachadas.map((det) => (
        <DecisionFachada
          key={det.rol}
          numero={++n}
          det={det}
          declara={(det.rol === "fachada-pb" ? declaradas.pb : declaradas.general) ?? {}}
          onDeclara={(x) => setField("fachadaDeclara", { ...declaradas, [det.rol === "fachada-pb" ? "pb" : "general"]: x })}
          enlace={`/p/${proyecto.id}/edificio`}
        />
      ))}

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
