// DB-HR — Pantalla de la protección frente al ruido (feature-25). La pantalla es
// la común (`PantallaSi`); aquí van las decisiones que El edificio no describe:
// la solución constructiva de cada elemento, elegida del Catálogo de Elementos
// Constructivos (con valores propios si el proyectista los tiene). La fachada,
// la ventana, la cubierta y el forjado se eligen en El edificio (feature-26):
// aquí se ven, y sus valores propios se guardan en esa elección. También el
// porcentaje de huecos, la puerta de entrada, el ascensor y si se usan los
// valores medios del Catálogo. El Ld y las aeronaves son datos de la obra.

import { useState, type JSX, type ReactNode } from "react";
import { Link } from "react-router";
import { CampoNumero } from "../../components/edificio/controles";
import { Decision, DecisionValor, Opciones } from "../../components/justificacion/Decision";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { PantallaSi, type PropsDecisionesSi } from "../si/PantallaSi";
import { CAPIALZADOS, deCategoria, RAtrCubierta, solucionDe, valor, type Capialzado, type Categoria, type Solucion } from "../../lib/constructivo/catalogo";
import { CERRAMIENTOS_HABITUALES, cerramientosDe, cubiertaHabitual, eleccionesDe, setCerramientos } from "../../lib/constructivo/cerramientos";
import { hr } from "./definicion";
import { conValoresPropios, HUECOS_SUPUESTOS, hrEstadoDefaults, numero, type Eleccion, type HrEstado, type ParametroHr } from "./estado";
import { gruposExterior } from "./justificacion";
import type { DetalleHr, JustificacionHr } from "./justificacion";
import type { ColindanciaHr } from "./edificio";
import { dB, dBA, kg, RELACION_HR, TABIQUERIA } from "./textos";

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
  deEdificio,
  linea,
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
  /** Se elige en El edificio (feature-26): sin desplegable, con el enlace. */
  deEdificio?: string;
  /** Los valores del Catálogo, si no son los de la solución sola (la cubierta, con su forjado). */
  linea?: string;
}): JSX.Element {
  const [abierto, setAbierto] = useState(false);
  const opciones = deCategoria(categoria);
  const s = eleccion ? solucionDe(categoria, eleccion.id) : null;
  const propios = conValoresPropios(eleccion);
  const enHabitual = (eleccion?.id ?? null) === habitual && !propios;
  const idSel = `hr-${categoria}-${num}`;
  return (
    <div className="border-border-sub border-t pt-3 pb-3.5">
      {deEdificio ? (
        <>
          <div className="text-text-primary mb-2 flex items-baseline gap-2 text-[13px] font-medium">
            <span className="text-text-disabled font-mono text-[10.5px] font-medium">{num}</span>
            {pregunta}
          </div>
          <div className="border-border-main bg-bg-surface flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-[12.5px]">
            <span className="text-text-primary min-w-0">{s?.nombre ?? "—"}</span>
            <Link to={deEdificio} className="text-accent hover:text-accent-hover shrink-0 text-[11.5px] underline">
              Cambiar en El edificio
            </Link>
          </div>
        </>
      ) : (
        <>
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
        </>
      )}
      {s && eleccion && (
        <div className="text-text-secondary mt-1.5 flex items-center justify-between gap-2 text-[11.5px]">
          <span className="font-mono tabular-nums">
            {propios ? "Valores propios" : (linea ?? valoresCatalogo(s, medios))} · CEC {s.codigo}, p. {s.pagina}
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

/** Escribe los valores propios de una elección de El edificio, sin tocar el marco de la ventana. */
function conValores<T extends Eleccion>(actual: T, e: Eleccion): T {
  const { valores: _, ...resto } = actual;
  return { ...resto, id: e.id, ...(e.valores ? { valores: e.valores } : {}) } as T;
}

function DecisionesHr({ state, setField, j, edificio, cambiarEdificio }: PropsDecisionesSi<HrEstado, JustificacionHr>): JSX.Element {
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
  const c = eleccionesDe(edificio);
  const r = cerramientosDe(edificio);
  const H = CERRAMIENTOS_HABITUALES;
  const aEdificio = `/p/${proyecto.id}/edificio`;
  const guardar = (patch: Parameters<typeof setCerramientos>[1]) => cambiarEdificio(setCerramientos(edificio, patch));
  const conPB = gruposExterior({ edificio, datosGenerales: proyecto.datosGenerales }, j.tipologia).some((g) => g.sufijo === "-pb");
  const nota = "Se elige en El edificio: la leen también HE1 y HS1.";

  // Números fijos: con el React Compiler, un contador mutado en el JSX se memoriza mal.
  const colindancias = j.separaciones.colindancias;
  const visibles = [
    colindancias.length > 0,
    j.tipologia !== "otros",
    adosada,
    ids.has("separacion"),
    ids.has("adosada"),
    conActividad,
    forjados,
    forjados && (ids.has("forjado-viviendas") || ids.has("forjado-encima")),
    forjados && (ids.has("forjado-actividad") || ids.has("forjado-comun")),
    true,
    conPB,
    true,
    conPB,
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
        <DecisionColindancias
          numero={n[0]}
          colindancias={colindancias}
          onChange={(clave, linda) => setField("colindancias", { ...(state.colindancias ?? {}), [clave]: linda })}
        />
      )}

      {visibles[1] && (
        <DecisionSolucion
          numero={n[1]}
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

      {visibles[2] && (
        <Decision<"compartida" | "independiente">
          numero={n[2]}
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

      {visibles[3] && (
        <DecisionSolucion
          numero={n[3]}
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

      {visibles[4] && (
        <DecisionSolucion
          numero={n[4]}
          pregunta="Cada hoja de la separación"
          categoria="base"
          eleccion={state.hojaAdosada}
          onChange={(e) => e && setField("hojaAdosada", e)}
          habitual={D.hojaAdosada.id}
          medios={medios}
          texto="Dos hojas, cada una con RA ≥ 45 dBA (Anejo I.1.2)."
        />
      )}

      {visibles[5] && (
        <DecisionSolucion
          numero={n[5]}
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

      {visibles[6] && (
        <DecisionSolucion
          numero={n[6]}
          pregunta="Forjado y suelo flotante"
          categoria="forjado"
          eleccion={r.forjado.eleccion}
          onChange={(e) => e && guardar({ forjado: conValores(c.forjado, e) })}
          habitual={H.forjado.id}
          deEdificio={aEdificio}
          medios={medios}
          texto={`La masa de la sección tipo, sin vigas ni ábacos, decide la fila de la tabla 3.3. ${nota}`}
          extra={
            <div className="mt-2.5">
              <DecisionSolucionSimple label="Suelo flotante" categoria="suelo" eleccion={state.suelo} onChange={(e) => e && setField("suelo", e)} medios={medios} />
            </div>
          }
        />
      )}

      {visibles[7] && (
        <DecisionSolucion
          numero={n[7]}
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

      {visibles[8] && (
        <DecisionSolucion
          numero={n[8]}
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

      {visibles[9] && (
        <DecisionSolucion
          numero={n[9]}
          pregunta={conPB ? "Fachada de las demás plantas" : "Fachada"}
          categoria="fachada"
          eleccion={r.fachada.eleccion}
          onChange={(e) => e && guardar({ fachada: conValores(c.fachada, e) })}
          habitual={H.fachada.id}
          deEdificio={aEdificio}
          medios={medios}
          texto={`Su parte ciega frente al ruido exterior (tabla 3.4) y como flanco de las separaciones. ${nota}`}
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

      {visibles[10] && (
        <DecisionSolucion
          numero={n[10]}
          pregunta="Fachada de la planta baja"
          categoria="fachada"
          eleccion={(r.fachadaPB ?? r.fachada).eleccion}
          onChange={(e) => e && guardar({ fachadaPB: conValores(c.fachadaPB ?? c.fachada, e) })}
          habitual={H.fachada.id}
          deEdificio={aEdificio}
          medios={medios}
          texto="Se comprueba con los recintos de la planta baja; la de las demás plantas, con los suyos."
        />
      )}

      {visibles[11] && (
        <DecisionSolucion
          numero={n[11]}
          pregunta={conPB ? "Ventanas de las demás plantas" : "Ventanas"}
          categoria="ventana"
          eleccion={r.ventana.eleccion}
          onChange={(e) => e && guardar({ ventana: conValores(c.ventana, e) })}
          habitual={H.ventana.id}
          deEdificio={aEdificio}
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

      {visibles[12] && (
        <DecisionSolucion
          numero={n[12]}
          pregunta="Ventanas de la planta baja"
          categoria="ventana"
          eleccion={(r.ventanaPB ?? r.ventana).eleccion}
          onChange={(e) => e && guardar({ ventanaPB: conValores(c.ventanaPB ?? c.ventana, e) })}
          habitual={H.ventana.id}
          deEdificio={aEdificio}
          medios={medios}
          texto="Se comprueban con los recintos de la planta baja, con la misma caja de persiana y los mismos huecos."
        />
      )}

      {visibles[13] && (
        <DecisionSolucion
          numero={n[13]}
          pregunta="Cubierta"
          categoria="cubierta"
          eleccion={r.cubierta.eleccion}
          onChange={(e) => e && guardar({ cubierta: e })}
          habitual={cubiertaHabitual(edificio.cubierta.tipo)}
          deEdificio={aEdificio}
          linea={`RA,tr ${dBA(RAtrCubierta(r.cubierta.sol, r.forjado.sol))} con el forjado de El edificio`}
          medios={medios}
          texto={`Sobre los recintos de la última planta, sin lucernarios: la columna de parte ciega al 100 % de la tabla 3.4. ${nota}`}
        />
      )}

      {visibles[14] && (
        <DecisionSolucion
          numero={n[14]}
          pregunta="Medianería"
          categoria="base"
          eleccion={state.medianeria}
          onChange={(e) => e && setField("medianeria", e)}
          habitual={D.medianeria.id}
          medios={medios}
          texto="Las medianeras se deciden en SI 2. Toda la medianería, RA ≥ 45 dBA."
        />
      )}

      {visibles[15] && puerta && (
        <Decision<"vestibulo" | "estancia">
          numero={n[15]}
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

      {visibles[16] && asc && (
        <Decision<"hueco" | "cuarto">
          numero={n[16]}
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
        numero={n[17]}
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

/**
 * Qué linda con qué (K-HR.16): cada colindancia que se deduce de El edificio,
 * con Sí o No. Sin indicarla, se supone que sí, del lado de la seguridad.
 */
function DecisionColindancias({
  numero: num,
  colindancias,
  onChange,
}: {
  numero: number;
  colindancias: readonly ColindanciaHr[];
  onChange: (clave: string, linda: boolean) => void;
}): JSX.Element {
  const supuestas = colindancias.filter((c) => c.supuesta).length;
  const negadas = colindancias.filter((c) => !c.linda).length;
  return (
    <div className="border-border-sub border-t pt-3 pb-3.5">
      <div className="text-text-primary mb-2 flex items-baseline gap-2 text-[13px] font-medium">
        <span className="text-text-disabled font-mono text-[10.5px] font-medium">{num}</span>
        Qué linda con qué
      </div>
      <ul className="flex flex-col gap-1.5">
        {colindancias.map((c) => (
          <li key={c.clave} className="flex items-center justify-between gap-2">
            <span className="min-w-0 text-[12px] leading-tight">
              <span className="text-text-primary">{c.nombre}</span>{" "}
              <span className="text-text-secondary">{RELACION_HR[c.relacion]}</span>
              {c.supuesta && <span className="text-text-disabled"> · supuesto</span>}
            </span>
            <div className="w-28 shrink-0">
              <Opciones<"si" | "no">
                etiqueta={`${c.nombre} ${RELACION_HR[c.relacion]}`}
                pequenas
                opciones={[
                  { valor: "si", label: "Linda" },
                  { valor: "no", label: "No" },
                ]}
                valor={c.linda ? "si" : "no"}
                onChange={(v) => onChange(c.clave, v === "si")}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="text-text-secondary mt-2 text-[12px] leading-normal">
        <b className="text-text-primary font-medium">{supuestas === colindancias.length ? "Supuesto." : supuestas > 0 ? "En parte supuesto." : "Indicado."}</b>{" "}
        {supuestas > 0
          ? "Sin la planta, lo que comparte planta con las viviendas se supone colindante y lo de abajo, debajo: lo más desfavorable. "
          : ""}
        {negadas > 0 ? "Lo que no linda no se justifica." : "Si algo no linda, márcalo: deja de justificarse."}
      </p>
    </div>
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
