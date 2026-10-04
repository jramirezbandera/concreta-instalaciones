// DB-HS 2 — Pantalla de recogida y evacuación de residuos (feature-21). La
// pantalla es la común (`PantallaSi`); aquí van las decisiones que El edificio
// no describe: cómo recoge el municipio cada fracción (con los periodos y los
// contenedores de la recogida puerta a puerta), los dormitorios dobles de cada
// vivienda tipo, dónde va el almacén o la reserva y la superficie que se le da.

import type { JSX } from "react";
import { Decision, DecisionValor, Opciones } from "../../components/justificacion/Decision";
import { CampoNumero, PasoAPaso } from "../../components/edificio/controles";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { hs2 } from "./definicion";
import { recogidaPuerta, type Hs2Estado, type ModoFraccion, type Recogida, type Ubicacion } from "./estado";
import type { JustificacionHs2 } from "./justificacion";
import { CAPACIDADES, FRACCIONES, NOMBRE_FRACCION, type CapacidadContenedor } from "./tablas";
import { m2 } from "./textos";

const MODOS: { valor: ModoFraccion; label: string }[] = [
  { valor: "calle", label: "Calle" },
  { valor: "puerta", label: "Puerta" },
  { valor: "otro", label: "Otro" },
];

function DecisionesHs2({ state, setField, j, edificio }: PropsDecisionesSi<Hs2Estado, JustificacionHs2>): JSX.Element {
  const d = j.decisiones;
  const h = j.habituales;
  if (!j.residencial) {
    return (
      <section aria-label="Decisiones" className="flex flex-col">
        <p className="text-text-secondary pt-5 text-[12.5px] leading-normal">
          El edificio no tiene viviendas: HS 2 no se aplica de forma directa y los residuos se justifican con un estudio específico, con criterios análogos a los de la sección (ap. 1.1 pto 2).
        </p>
      </section>
    );
  }

  const puerta = FRACCIONES.filter((f) => j.modos[f] === "puerta");
  const almacen = j.elementos.find((e) => e.detalle.clase === "almacen")?.detalle;
  const reserva = j.elementos.find((e) => e.detalle.clase === "reserva")?.detalle;
  const conEspacio = j.elementos.some((e) => e.id === "recorrido");
  const haySotano = edificio.grupos.some((g) => g.nivelInicial < 0);
  const conDobles = j.viviendas.filter((v) => v.dormitorios > 1);

  // Los números de las decisiones, antes del JSX (el React Compiler memoriza mal un contador en el render).
  const nDobles = 2;
  const nUbicacion = conDobles.length > 0 ? 3 : 2;
  const nSuperficie = nUbicacion + (conEspacio && !j.cuarto ? 1 : 0);

  const elegirModo = (f: (typeof FRACCIONES)[number], m: ModoFraccion) => setField("modos", { ...state.modos, [f]: m });
  const setPeriodo = (f: (typeof FRACCIONES)[number], v: number) => setField("periodos", { ...state.periodos, [f]: v });
  const setContenedor = (f: (typeof FRACCIONES)[number], c: CapacidadContenedor) => setField("contenedores", { ...state.contenedores, [f]: c });

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      <Decision<Recogida>
        numero={1}
        pregunta="Recogida municipal"
        opciones={[
          { valor: "calle", label: "Calle" },
          { valor: "puerta", label: "Puerta" },
          { valor: "fraccion", label: "Por fracción" },
        ]}
        valor={d.recogida}
        habitual={h.recogida}
        onChange={(v) => {
          // Fracción a fracción, cada una parte del modo que ya tenía.
          if (v === "fraccion" && d.recogida !== "fraccion") setField("modos", { ...j.modos });
          setField("recogida", v === h.recogida ? "habitual" : v);
        }}
        texto={
          d.recogida === "calle"
            ? "Contenedores de calle de superficie: el edificio deja un espacio de reserva para un almacén futuro."
            : d.recogida === "puerta"
              ? "Puerta a puerta: el servicio recoge los contenedores del edificio y hace falta un almacén."
              : "Cada fracción, como la recoja el municipio. «Otro»: contenedores soterrados o recogida neumática."
        }
        extra={
          d.recogida === "fraccion" || puerta.length > 0 ? (
            <div className="mt-2.5 flex flex-col gap-1.5">
              {FRACCIONES.map((f) => {
                const rp = recogidaPuerta(state, f);
                const datos = j.modos[f] === "puerta" && (
                  <div className="flex items-center gap-1.5">
                    <CampoNumero id={`hs2-tf-${f}`} value={rp.tf} unidad="d" decimales={0} onChange={(v) => setPeriodo(f, v)} />
                    <select
                      aria-label={`Contenedor de ${NOMBRE_FRACCION[f].toLowerCase()}`}
                      value={rp.contenedor}
                      onChange={(e) => setContenedor(f, Number(e.target.value) as CapacidadContenedor)}
                      className="border-border-main bg-bg-primary text-text-primary h-8 w-[72px] rounded border px-1 font-mono text-[12px]"
                    >
                      {CAPACIDADES.map((c) => (
                        <option key={c} value={c}>
                          {c} l
                        </option>
                      ))}
                    </select>
                  </div>
                );
                return (
                  <div key={f} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-text-secondary w-[96px] shrink-0 text-[11.5px]">{NOMBRE_FRACCION[f]}</span>
                      {d.recogida === "fraccion" ? (
                        <div className="min-w-0 flex-1">
                          <Opciones<ModoFraccion> etiqueta={`Recogida de ${NOMBRE_FRACCION[f].toLowerCase()}`} pequenas opciones={MODOS} valor={j.modos[f]} onChange={(m) => elegirModo(f, m)} />
                        </div>
                      ) : (
                        datos
                      )}
                    </div>
                    {d.recogida === "fraccion" && datos && <div className="pl-[104px]">{datos}</div>}
                  </div>
                );
              })}
            </div>
          ) : undefined
        }
        esHabitual={d.recogida === h.recogida && puerta.length === 0}
      />

      {conDobles.length > 0 && (
        <DecisionValor
          numero={nDobles}
          pregunta="Dormitorios dobles"
          marca={conDobles.some((v) => v.doblesSupuestos) ? { texto: "supuestos", aviso: true } : { texto: "indicados" }}
          control={
            <div className="flex flex-col gap-1.5">
              {conDobles.map((v) => (
                <div key={v.tipoId} className="flex items-center gap-2">
                  <span className="text-text-secondary w-[44px] shrink-0 text-[11.5px]">{j.unifamiliar ? "" : `Tipo ${v.nombre}`}</span>
                  <PasoAPaso
                    id={`hs2-dobles-${v.tipoId}`}
                    nombre={`Dormitorios dobles del tipo ${v.nombre}`}
                    value={v.dobles}
                    min={0}
                    max={v.dormitorios}
                    onChange={(n) => setField("dobles", { ...state.dobles, [v.tipoId]: n })}
                  />
                </div>
              ))}
            </div>
          }
          texto="Cada dormitorio doble cuenta dos ocupantes y cada sencillo, uno. Sin indicarlo, doble solo el principal."
        />
      )}

      {conEspacio &&
        (j.cuarto ? (
          <DecisionValor
            numero={nUbicacion}
            pregunta="Almacén de residuos"
            marca={{ texto: "El edificio" }}
            control={<span className="text-text-primary font-mono text-[13px]">{`${j.cuarto.plantas} · ${m2(j.cuarto.util_m2)}`}</span>}
            texto="El cuarto de instalaciones «almacén de residuos» de El edificio: su planta y su superficie útil mandan. Se cambian allí."
          />
        ) : (
          <Decision<Ubicacion>
            numero={nUbicacion}
            pregunta={almacen ? "Ubicación del almacén" : "Ubicación de la reserva"}
            opciones={[
              { valor: "planta_baja", label: "Planta baja" },
              { valor: "sotano", label: "Sótano", deshabilitada: !haySotano, motivo: haySotano ? undefined : "El edificio no tiene sótano" },
              { valor: "exterior", label: "Parcela" },
            ]}
            valor={d.ubicacion}
            habitual={h.ubicacion}
            onChange={(v) => setField("ubicacion", v === h.ubicacion ? "habitual" : v)}
            texto={
              d.ubicacion === "exterior"
                ? "Fuera del edificio, a menos de 25 m de su acceso."
                : d.ubicacion === "sotano"
                  ? "El recorrido hasta la calle, sin escalones y con 12 % como mucho: la rampa del garaje no suele valer."
                  : "Junto al portal: el recorrido hasta la calle es corto y llano."
            }
          />
        ))}

      {conEspacio && !j.cuarto && (
        <DecisionValor
          numero={nSuperficie}
          pregunta="Superficie"
          marca={state.superficieAlmacen_m2 === null && state.superficieReserva_m2 === null ? { texto: "la exigida" } : { texto: "indicada" }}
          control={
            <div className="flex flex-col gap-1.5">
              {almacen && almacen.clase === "almacen" && (
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary w-[64px] shrink-0 text-[11.5px]">Almacén</span>
                  <CampoNumero id="hs2-sup-almacen" value={almacen.dada_m2} unidad="m²" decimales={2} onChange={(v) => setField("superficieAlmacen_m2", v > 0 ? v : null)} />
                </div>
              )}
              {reserva && reserva.clase === "reserva" && (
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary w-[64px] shrink-0 text-[11.5px]">Reserva</span>
                  <CampoNumero id="hs2-sup-reserva" value={reserva.dada_m2} unidad="m²" decimales={2} onChange={(v) => setField("superficieReserva_m2", v > 0 ? v : null)} />
                </div>
              )}
            </div>
          }
          texto="La superficie útil que le da el proyecto. Sin indicarla, la que exige la fórmula del DB. Si es un cuarto, defínelo en El edificio como «almacén de residuos»."
        />
      )}
    </section>
  );
}

export function Hs2Module(): JSX.Element {
  return <PantallaSi def={hs2} Decisiones={DecisionesHs2} />;
}
