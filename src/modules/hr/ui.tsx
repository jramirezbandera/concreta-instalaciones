// DB-HR — Pantalla de la protección frente al ruido (feature-25). La pantalla es
// la común (`PantallaSi`); aquí van las decisiones que El edificio no describe:
// la solución constructiva de cada elemento, elegida del Catálogo de Elementos
// Constructivos (con valores propios si el proyectista los tiene), el
// porcentaje de huecos, la puerta de entrada, el ascensor y si se usan los
// valores medios del Catálogo. El Ld y las aeronaves son datos de la obra.

import { useState, type JSX, type ReactNode } from "react";
import { Link } from "react-router";
import { CampoNumero } from "../../components/edificio/controles";
import { Decision, DecisionValor, Opciones } from "../../components/justificacion/Decision";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { CAPIALZADOS, deCategoria, solucionDe, valor, type Capialzado, type Categoria, type Solucion } from "./catalogo";
import { hr } from "./definicion";
import { conValoresPropios, HUECOS_SUPUESTOS, hrEstadoDefaults, numero, type Eleccion, type HrEstado, type ParametroHr } from "./estado";
import type { DetalleHr, JustificacionHr } from "./justificacion";
import { dB, dBA, kg, TABIQUERIA } from "./textos";

const SELECT =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent h-8 w-full rounded border px-1.5 text-[12.5px] focus:outline-none";

/** Los parámetros que se pueden dar a mano en cada categoría. */
const PARAMETROS: Record<Categoria, { k: ParametroHr; etiqueta: string; unidad: string }[]> = {
  tabiqueria: [{ k: "m", etiqueta: "m", unidad: "kg/m²" }, { k: "RA", etiqueta: "RA", unidad: "dBA" }],
  base: [{ k: "m", etiqueta: "m", unidad: "kg/m²" }, { k: "RA", etiqueta: "RA", unidad: "dBA" }],
  trasdosado: [{ k: "dRA", etiqueta: "ΔRA", unidad: "dBA" }],
  forjado: [{ k: "m", etiqueta: "m", unidad: "kg/m²" }, { k: "RA", etiqueta: "RA", unidad: "dBA" }],
  suelo: [{ k: "dLw", etiqueta: "ΔLw", unidad: "dB" }, { k: "dRA", etiqueta: "ΔRA", unidad: "dBA" }],
  techo: [{ k: "dRA", etiqueta: "ΔRA", unidad: "dBA" }],
  fachada: [{ k: "RAtr", etiqueta: "RA,tr", unidad: "dBA" }, { k: "m", etiqueta: "m hoja", unidad: "kg/m²" }, { k: "RA", etiqueta: "RA hoja", unidad: "dBA" }],
  cubierta: [{ k: "RAtr", etiqueta: "RA,tr", unidad: "dBA" }],
  ventana: [{ k: "RAtr", etiqueta: "RA,tr", unidad: "dBA" }],
};

/** Los valores del Catálogo de una solución, en una línea. */
function valoresCatalogo(s: Solucion, medios: boolean): string {
  switch (s.categoria) {
    case "tabiqueria":
    case "base":
      return `m ${kg(valor(s.m, medios))} · RA ${dBA(valor(s.RA, medios))}${s.categoria === "base" ? ` · tipo ${s.tipo}` : ""}`;
    case "trasdosado":
      return s.baseMax ? `ΔRA ${dBA(s.dRA[0][1])} sobre bases de hasta ${s.baseMax} kg/m²` : `ΔRA de ${s.dRA[0][1]} a ${s.dRA[s.dRA.length - 1][1]} dBA según la base`;
    case "forjado":
      return `m ${kg(s.m)} · RA ${dBA(s.RA)}${s.eps ? " · EPS" : ""}`;
    case "suelo":
      return `ΔLw ${dB(s.dLw)} · ΔRA según el forjado`;
    case "techo":
      return `ΔRA ${dBA(s.dRA[0])} con forjados de hasta 350 kg/m²`;
    case "fachada":
      return `RA,tr ${dBA(valor(s.RAtr, medios))} · ${s.clase === "dos_hojas" ? "dos hojas" : s.clase === "una_hoja" ? "una hoja" : s.clase}`;
    case "cubierta":
    case "ventana":
      return `RA,tr ${dBA(s.RAtr)}`;
  }
}

/**
 * Una decisión que elige una solución del Catálogo: el desplegable, sus valores
 * con la página del CEC y, si se quiere, los valores propios.
 */
function DecisionSolucion({
  numero: num,
  pregunta,
  categoria,
  eleccion,
  onChange,
  habitual,
  medios,
  texto,
  ninguna,
  extra,
}: {
  numero: number;
  pregunta: string;
  categoria: Categoria;
  eleccion: Eleccion | null;
  onChange: (e: Eleccion | null) => void;
  habitual: string | null;
  medios: boolean;
  texto: ReactNode;
  /** Rótulo de la opción «ninguno» (trasdosado, techo), si la hay. */
  ninguna?: string;
  extra?: ReactNode;
}): JSX.Element {
  const [abierto, setAbierto] = useState(false);
  const opciones = deCategoria(categoria);
  const s = eleccion ? solucionDe(categoria, eleccion.id) : null;
  const propios = conValoresPropios(eleccion);
  const enHabitual = (eleccion?.id ?? null) === habitual && !propios;
  const idSel = `hr-${categoria}-${num}`;
  return (
    <div className="border-border-sub border-t pt-3 pb-3.5">
      <label htmlFor={idSel} className="text-text-primary mb-2 flex items-baseline gap-2 text-[13px] font-medium">
        <span className="text-text-disabled font-mono text-[10.5px] font-medium">{num}</span>
        {pregunta}
      </label>
      <select id={idSel} value={eleccion?.id ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : { id: e.target.value })} className={SELECT}>
        {ninguna && <option value="">{ninguna}</option>}
        {opciones.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nombre}
          </option>
        ))}
      </select>
      {s && eleccion && (
        <div className="text-text-secondary mt-1.5 flex items-center justify-between gap-2 text-[11.5px]">
          <span className="font-mono tabular-nums">
            {propios ? "Valores propios" : valoresCatalogo(s, medios)} · CEC {s.codigo}, p. {s.pagina}
          </span>
          <button type="button" aria-expanded={abierto || propios} onClick={() => setAbierto((v) => !v)} className="text-accent hover:text-accent-hover shrink-0 underline">
            {propios ? "Editar" : "Valores propios"}
          </button>
        </div>
      )}
      {s && eleccion && (abierto || propios) && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {PARAMETROS[categoria].map((p) => (
            <label key={p.k} className="text-text-secondary flex items-center gap-1.5 text-[11.5px]">
              {p.etiqueta}
              <CampoNumero
                id={`${idSel}-${p.k}`}
                etiqueta={`${pregunta}: ${p.etiqueta}`}
                value={numero(eleccion.valores?.[p.k]) ?? 0}
                unidad={p.unidad}
                decimales={0}
                onChange={(v) => onChange({ id: eleccion.id, valores: { ...eleccion.valores, [p.k]: v } })}
              />
            </label>
          ))}
          {propios && (
            <button type="button" onClick={() => onChange({ id: eleccion.id })} className="text-accent hover:text-accent-hover text-[11.5px] underline">
              Volver al Catálogo
            </button>
          )}
        </div>
      )}
      {extra}
      <p className="text-text-secondary mt-2 text-[12px] leading-normal">
        <b className="text-text-primary font-medium">{enHabitual ? "Lo habitual." : propios ? "Con valores propios." : "No es lo habitual."}</b> {texto}
      </p>
    </div>
  );
}

function detalle<C extends DetalleHr["clase"]>(j: JustificacionHr, id: string): Extract<DetalleHr, { clase: C }> | null {
  return (j.elementos.find((e) => e.id === id)?.detalle as Extract<DetalleHr, { clase: C }> | undefined) ?? null;
}

function DecisionesHr({ state, setField, j }: PropsDecisionesSi<HrEstado, JustificacionHr>): JSX.Element {
  const { proyecto } = useProyecto();
  const D = hrEstadoDefaults;
  const medios = state.medios === true;
  const ids = new Set(j.elementos.map((e) => e.id));
  const tab = solucionDe("tabiqueria", state.tabiqueria.id);
  const sv = solucionDe("base", state.separacion.id);
  const sa = solucionDe("base", state.separacionActividad.id);
  const asc = detalle<"ascensor">(j, "ascensor");
  const puerta = detalle<"puerta">(j, "puerta");
  const dorm = detalle<"exterior">(j, "fachada-dormitorios");
  const est = detalle<"exterior">(j, "fachada-estancias");
  const adosada = j.tipologia === "adosada";
  // Una sola unidad de uso: la tabiquería solo tiene que llegar a 33 dBA y no hay tablas 3.2 ni 3.3.
  const soloMinimo = j.tipologia === "aislada" || (adosada && state.estructura === "independiente");
  const forjados = ["forjado-viviendas", "forjado-comun", "forjado-actividad", "forjado-encima", "forjado-adosada"].some((id) => ids.has(id));
  const conActividad = ids.has("separacion-actividad") || asc?.modo === "hueco";
  const cubiertaHabitual = proyecto.edificio.cubierta.tipo === "inclinada" ? "cu-incl-fu-bovhorm-250" : "cu-plana-fu-bovhorm-300";

  // Números fijos: con el React Compiler, un contador mutado en el JSX se memoriza mal.
  const visibles = [
    j.tipologia !== "otros",
    adosada,
    ids.has("separacion"),
    ids.has("adosada"),
    conActividad,
    forjados,
    forjados && (ids.has("forjado-viviendas") || ids.has("forjado-encima")),
    forjados && (ids.has("forjado-actividad") || ids.has("forjado-comun")),
    true,
    true,
    ids.has("cubierta"),
    ids.has("medianeria"),
    !!puerta,
    !!asc,
    true,
  ];
  const n = visibles.map((_, i) => visibles.slice(0, i + 1).filter(Boolean).length);

  const datos = (
    <Link to={`/p/${proyecto.id}/datos`} className="text-accent hover:text-accent-hover underline">
      datos de la obra
    </Link>
  );

  return (
    <section aria-label="Decisiones" className="flex flex-col">
      <div className="text-text-disabled pt-5 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">Decisiones</div>

      {visibles[0] && (
        <DecisionSolucion
          numero={n[0]}
          pregunta="Tabiquería"
          categoria="tabiqueria"
          eleccion={state.tabiqueria}
          onChange={(e) => e && setField("tabiqueria", e)}
          habitual={D.tabiqueria.id}
          medios={medios}
          texto={soloMinimo ? "Una sola unidad de uso: basta con RA ≥ 33 dBA." : `${TABIQUERIA[j.tabiqueria]}: decide la columna de las tablas 3.2 y 3.3.`}
          extra={
            tab.material === "fabrica" && !soloMinimo ? (
              <div className="mt-2">
                <Opciones<"directo" | "bandas">
                  etiqueta="Apoyo de la tabiquería"
                  pequenas
                  opciones={[
                    { valor: "directo", label: "Apoyo directo" },
                    { valor: "bandas", label: "Bandas elásticas" },
                  ]}
                  valor={state.apoyo}
                  onChange={(v) => setField("apoyo", v)}
                />
              </div>
            ) : undefined
          }
        />
      )}

      {visibles[1] && (
        <Decision<"compartida" | "independiente">
          numero={n[1]}
          pregunta="Estructura de las adosadas"
          opciones={[
            { valor: "compartida", label: "Compartida" },
            { valor: "independiente", label: "Independiente" },
          ]}
          valor={state.estructura}
          habitual={D.estructura}
          onChange={(v) => setField("estructura", v)}
          texto={
            state.estructura === "independiente"
              ? "Cada vivienda con su estructura: separación de dos hojas de 45 dBA y tabiquería de 33 dBA (Anejo I)."
              : "Forjados compartidos con las vecinas: tabla 3.1, tabla 3.2 y suelo flotante de la tabla I.1."
          }
        />
      )}

      {visibles[2] && (
        <DecisionSolucion
          numero={n[2]}
          pregunta={adosada ? "Separación con las adosadas" : "Entre viviendas y con la zona común"}
          categoria="base"
          eleccion={state.separacion}
          onChange={(e) => e && setField("separacion", e)}
          habitual={D.separacion.id}
          medios={medios}
          texto={`Tipo ${sv.tipo}${sv.tipo === 1 ? ", con trasdosado por ambas caras" : sv.tipo === 2 ? ", dos hojas con bandas elásticas" : ", entramado autoportante"}. Tabla 3.2 sin paréntesis.`}
          extra={
            sv.tipo === 1 ? (
              <TrasdosadoExtra eleccion={state.trasdosado} unaCara={state.unaCara} onChange={(e) => setField("trasdosado", e)} onUnaCara={(v) => setField("unaCara", v)} id="sv" />
            ) : undefined
          }
        />
      )}

      {visibles[3] && (
        <DecisionSolucion
          numero={n[3]}
          pregunta="Cada hoja de la separación"
          categoria="base"
          eleccion={state.hojaAdosada}
          onChange={(e) => e && setField("hojaAdosada", e)}
          habitual={D.hojaAdosada.id}
          medios={medios}
          texto="Dos hojas, cada una con RA ≥ 45 dBA (Anejo I.1.2)."
        />
      )}

      {visibles[4] && (
        <DecisionSolucion
          numero={n[4]}
          pregunta="Con locales, garaje e instalaciones"
          categoria="base"
          eleccion={state.separacionActividad}
          onChange={(e) => e && setField("separacionActividad", e)}
          habitual={D.separacionActividad.id}
          medios={medios}
          texto={`Tipo ${sa.tipo}: valores entre paréntesis de la tabla 3.2 (DnT,A ≥ 55 dBA).${asc?.modo === "hueco" ? " También cierra el hueco del ascensor." : ""}`}
          extra={
            sa.tipo === 1 ? (
              <TrasdosadoExtra
                eleccion={state.trasdosadoActividad}
                unaCara={state.unaCaraActividad}
                onChange={(e) => setField("trasdosadoActividad", e)}
                onUnaCara={(v) => setField("unaCaraActividad", v)}
                id="sa"
              />
            ) : undefined
          }
        />
      )}

      {visibles[5] && (
        <DecisionSolucion
          numero={n[5]}
          pregunta="Forjado y suelo flotante"
          categoria="forjado"
          eleccion={state.forjado}
          onChange={(e) => e && setField("forjado", e)}
          habitual={D.forjado.id}
          medios={medios}
          texto="La masa de la sección tipo, sin vigas ni ábacos, decide la fila de la tabla 3.3."
          extra={
            <div className="mt-2.5">
              <DecisionSolucionSimple label="Suelo flotante" categoria="suelo" eleccion={state.suelo} onChange={(e) => e && setField("suelo", e)} medios={medios} />
            </div>
          }
        />
      )}

      {visibles[6] && (
        <DecisionSolucion
          numero={n[6]}
          pregunta="Techo entre viviendas"
          categoria="techo"
          eleccion={state.techo}
          onChange={(e) => setField("techo", e)}
          habitual={null}
          ninguna="Sin techo suspendido"
          medios={medios}
          texto="En la vivienda de abajo. Con forjados de más de 400 kg/m² no mejora nada."
        />
      )}

      {visibles[7] && (
        <DecisionSolucion
          numero={n[7]}
          pregunta="Techo bajo las viviendas"
          categoria="techo"
          eleccion={state.techoBajo}
          onChange={(e) => setField("techoBajo", e)}
          habitual={D.techoBajo?.id ?? null}
          ninguna="Sin techo suspendido"
          medios={medios}
          texto="En el local, el garaje, el portal o el cuarto de debajo. En los garajes suele ser inviable: entonces aporta el suelo flotante."
        />
      )}

      {visibles[8] && (
        <DecisionSolucion
          numero={n[8]}
          pregunta="Fachada"
          categoria="fachada"
          eleccion={state.fachada}
          onChange={(e) => e && setField("fachada", e)}
          habitual={D.fachada.id}
          medios={medios}
          texto="Su parte ciega frente al ruido exterior (tabla 3.4) y como flanco de las separaciones."
          extra={
            <div className="mt-2">
              <Opciones<"si" | "no">
                etiqueta="Fachada del recinto más desfavorable"
                pequenas
                opciones={[
                  { valor: "no", label: "Expuesta al ruido" },
                  { valor: "si", label: "A patio o entorno tranquilo", deshabilitada: j.ld.aeronaves, motivo: "Con aeronaves no se resta" },
                ]}
                valor={state.noExpuesta ? "si" : "no"}
                onChange={(v) => setField("noExpuesta", v === "si")}
              />
            </div>
          }
        />
      )}

      {visibles[9] && (
        <DecisionSolucion
          numero={n[9]}
          pregunta="Ventanas"
          categoria="ventana"
          eleccion={state.ventana}
          onChange={(e) => e && setField("ventana", e)}
          habitual={D.ventana.id}
          medios={medios}
          texto={
            <>
              Con el Ld de los {datos}: {dorm ? `dormitorios D2m,nT,Atr ≥ ${dorm.D} dBA` : ""}
              {dorm && est ? ", " : ""}
              {est ? `${j.tipologia === "otros" ? "despachos" : "estancias"} ≥ ${est.D} dBA` : ""}. La caja de persiana se suma a la ventana (Anejo G).
            </>
          }
          extra={
            <div className="mt-2 flex flex-col gap-2">
              <Opciones<Capialzado>
                etiqueta="Caja de persiana"
                pequenas
                opciones={[
                  { valor: "no", label: "Sin caja" },
                  { valor: "cp1", label: CAPIALZADOS.cp1.codigo },
                  { valor: "cp2", label: CAPIALZADOS.cp2.codigo },
                ]}
                valor={state.capialzado}
                onChange={(v) => setField("capialzado", v)}
              />
              <div className="flex flex-wrap gap-3">
                {j.tipologia !== "otros" && (
                  <label className="text-text-secondary flex items-center gap-1.5 text-[11.5px]">
                    Huecos del dormitorio
                    <CampoNumero id="hr-huecos-dorm" etiqueta="Huecos del dormitorio" value={state.huecosDormitorio ?? HUECOS_SUPUESTOS.dormitorio} unidad="%" onChange={(v) => setField("huecosDormitorio", Math.min(100, v))} />
                  </label>
                )}
                <label className="text-text-secondary flex items-center gap-1.5 text-[11.5px]">
                  {j.tipologia === "otros" ? "Huecos del despacho" : "Huecos de la estancia"}
                  <CampoNumero id="hr-huecos-est" etiqueta={j.tipologia === "otros" ? "Huecos del despacho" : "Huecos de la estancia"} value={state.huecosEstancia ?? HUECOS_SUPUESTOS.estancia} unidad="%" onChange={(v) => setField("huecosEstancia", Math.min(100, v))} />
                </label>
              </div>
            </div>
          }
        />
      )}

      {visibles[10] && (
        <DecisionSolucion
          numero={n[10]}
          pregunta="Cubierta"
          categoria="cubierta"
          eleccion={state.cubierta ?? { id: cubiertaHabitual }}
          onChange={(e) => setField("cubierta", e && e.id === cubiertaHabitual && !conValoresPropios(e) ? null : e)}
          habitual={cubiertaHabitual}
          medios={medios}
          texto="Sobre los recintos de la última planta, sin lucernarios: la columna de parte ciega al 100 % de la tabla 3.4."
        />
      )}

      {visibles[11] && (
        <DecisionSolucion
          numero={n[11]}
          pregunta="Medianería"
          categoria="base"
          eleccion={state.medianeria}
          onChange={(e) => e && setField("medianeria", e)}
          habitual={D.medianeria.id}
          medios={medios}
          texto="Las medianeras se deciden en SI 2. Toda la medianería, RA ≥ 45 dBA."
        />
      )}

      {visibles[12] && puerta && (
        <Decision<"vestibulo" | "estancia">
          numero={n[12]}
          pregunta="Puerta de entrada a la vivienda"
          opciones={[
            { valor: "vestibulo", label: "Abre a un vestíbulo" },
            { valor: "estancia", label: "Abre a una estancia" },
          ]}
          valor={state.puertaAbre}
          habitual={D.puertaAbre}
          onChange={(v) => setField("puertaAbre", v)}
          texto={`RA ≥ ${puerta.exige} dBA${state.puertaRA === null ? ": la ficha lo declara para el pliego" : ""}; el cerramiento en que va, RA ≥ 50 dBA.`}
          extra={
            <label className="text-text-secondary mt-2 flex items-center gap-1.5 text-[11.5px]">
              RA de la puerta, si se conoce
              <CampoNumero id="hr-puerta" etiqueta="RA de la puerta" value={state.puertaRA ?? 0} unidad="dBA" onChange={(v) => setField("puertaRA", v > 0 ? v : null)} />
            </label>
          }
        />
      )}

      {visibles[13] && asc && (
        <Decision<"hueco" | "cuarto">
          numero={n[13]}
          pregunta="Maquinaria del ascensor"
          opciones={[
            { valor: "hueco", label: "En el hueco" },
            { valor: "cuarto", label: "En un cuarto" },
          ]}
          valor={asc.modo}
          habitual={j.separaciones.ascensorHabitual}
          onChange={(v) => setField("ascensor", v === j.separaciones.ascensorHabitual ? null : v)}
          texto={
            asc.modo === "hueco"
              ? "El hueco es un recinto de instalaciones: lo cierra la solución hacia locales e instalaciones."
              : "Hueco sin maquinaria: su cerramiento con las viviendas, RA mayor que 50 dBA."
          }
        />
      )}

      <DecisionValor
        numero={n[14]}
        pregunta="Valores del Catálogo"
        marca={medios ? { texto: "medios", aviso: true } : { texto: "mínimos" }}
        control={
          <Opciones<"min" | "medio">
            etiqueta="Valores del Catálogo"
            pequenas
            opciones={[
              { valor: "min", label: "Mínimos" },
              { valor: "medio", label: "Medios" },
            ]}
            valor={medios ? "medio" : "min"}
            onChange={(v) => setField("medios", v === "medio")}
          />
        }
        texto="Los mínimos los garantiza el Catálogo en todos los casos; los medios tienen en cuenta la dispersión de la producción y valen si el producto lo justifica."
      />
    </section>
  );
}

/** El trasdosado de un elemento de tipo 1: la solución y si va por una sola cara. */
function TrasdosadoExtra({
  eleccion,
  unaCara,
  onChange,
  onUnaCara,
  id,
}: {
  eleccion: Eleccion | null;
  unaCara: boolean;
  onChange: (e: Eleccion | null) => void;
  onUnaCara: (v: boolean) => void;
  id: string;
}): JSX.Element {
  return (
    <div className="mt-2.5 flex flex-col gap-2">
      <label htmlFor={`hr-tr-${id}`} className="text-text-disabled text-[11px]">
        Trasdosado
      </label>
      <select id={`hr-tr-${id}`} value={eleccion?.id ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : { id: e.target.value })} className={SELECT}>
        <option value="">Sin trasdosado</option>
        {deCategoria("trasdosado").map((o) => (
          <option key={o.id} value={o.id}>
            {o.nombre} (CEC {o.codigo})
          </option>
        ))}
      </select>
      {eleccion && (
        <Opciones<"ambas" | "una">
          etiqueta="Caras trasdosadas"
          pequenas
          opciones={[
            { valor: "ambas", label: "Por ambas caras" },
            { valor: "una", label: "Por una cara (+ 4 dBA)" },
          ]}
          valor={unaCara ? "una" : "ambas"}
          onChange={(v) => onUnaCara(v === "una")}
        />
      )}
    </div>
  );
}

/** Un segundo desplegable dentro de una decisión (el suelo flotante del forjado). */
function DecisionSolucionSimple({
  label,
  categoria,
  eleccion,
  onChange,
  medios,
}: {
  label: string;
  categoria: Categoria;
  eleccion: Eleccion;
  onChange: (e: Eleccion | null) => void;
  medios: boolean;
}): JSX.Element {
  const s = solucionDe(categoria, eleccion.id);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`hr-${categoria}`} className="text-text-disabled text-[11px]">
        {label}
      </label>
      <select id={`hr-${categoria}`} value={eleccion.id} onChange={(e) => onChange({ id: e.target.value })} className={SELECT}>
        {deCategoria(categoria).map((o) => (
          <option key={o.id} value={o.id}>
            {o.nombre}
          </option>
        ))}
      </select>
      <span className="text-text-secondary font-mono text-[11.5px] tabular-nums">
        {valoresCatalogo(s, medios)} · CEC {s.codigo}, p. {s.pagina}
      </span>
    </div>
  );
}

export function HrModule(): JSX.Element {
  return <PantallaSi def={hr} Decisiones={DecisionesHr} />;
}
