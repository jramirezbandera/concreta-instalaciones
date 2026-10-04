// DB-HS4 — ESQUEMA DE COLUMNA de la red de fontanería (AF). RENDER SVG
// (feature-7, UX-RECONCEPT §7: muere el grafo genérico; el esquema es soporte
// compacto sincronizado con la tabla/outliner).
//
// Componente PURO de render (React 19 + React Compiler): consume `HS4Result`
// (→ ./calc) y la geometría determinista de ./svg-meta (`calcularEsquema`), y
// pinta SOLO con las primitivas planas compartidas de ../../lib/svg/* (svg2pdf-
// safe). Sin efectos, sin Date/Math.random.
//
// Dibujo: acometida/tubo de alimentación en la base (recuadro de red general +
// flecha de entrada), montante vertical, un nivel por derivación particular con
// ticks de aparato, forjados discontinuos, caption de totales.
//
// MULTICANAL (WCAG 1.4.1) — dos ejes, ambos con canal textual:
//   1. RECORRIDO CRÍTICO (`esCritico`): rojo + trazo grueso/discontinuo
//      (kind="critical") + etiqueta «crítico» («◆» en el punto más
//      desfavorable). Es el diferencial del módulo.
//   2. VEREDICTO (`estado`): «✗» (fail) / «△» (warn) junto a la etiqueta.
// Selección: acento + trazo grueso + anillo; hover: refuerzo intermedio.
// En mode="pdf" no hay interactividad ni estados de selección.

import type { ReactNode } from "react";
import { DiagramSvg, Seg, Tag, Arrow, Ring, Box, type SvgMode } from "../../lib/svg/primitives";
import type { Kind } from "../../lib/svg/helpers";
import { fmt } from "../../lib/units/format";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { HS4Result, ResultadoTramoHS4 } from "./calc";
// Geometría del esquema + constantes de layout: en ./svg-meta (módulo SIN JSX,
// única fuente de verdad de las medidas — la comparte hs4NativeSize/ficha PDF).
import {
  ESQ4,
  calcularEsquema,
  type BaseSegHS4,
  type ColumnaHS4,
  type DerivacionHS4,
  type NivelHS4,
  type TickHS4,
} from "./svg-meta";

interface HS4SVGProps {
  result: HS4Result;
  mode: SvgMode;
  width: number;
  height: number;
  /** Id (tramo o aparato) seleccionado en la tabla — acento + anillo. */
  selectedId?: string | null;
  /** Id bajo el cursor en la tabla — refuerzo intermedio. */
  hoverId?: string | null;
  /** Clic en un elemento del esquema → selecciona la fila en la tabla. */
  onSelect?: (id: string) => void;
  /** Nombres legibles por id (feature-7); sin entrada se enseña el id. */
  etiquetas?: Record<string, string>;
}

interface Trazo {
  kind: Kind;
  base: number;
  ring: boolean;
}

const TEXTO_VEREDICTO: Record<Veredicto, string> = {
  ok: "Cumple",
  warn: "Cumple con avisos",
  fail: "No cumple",
  neutral: "Sin veredicto",
};

/** Marca textual del veredicto del tramo (canal redundante al color). */
function marcaEstado(estado: Veredicto): string {
  if (estado === "fail") return " ✗";
  if (estado === "warn") return " △";
  return "";
}

function otxt(t: ResultadoTramoHS4): string {
  return t.diametro_mm == null ? "Ø—" : `Ø${fmt(t.diametro_mm, "", 0)}`;
}

/** Etiqueta hidráulica del tramo: Ø + Q de cálculo (2 dec) + v (m/s). */
function etiquetaHidraulica(t: ResultadoTramoHS4): string {
  const v = t.velocidad_m_s == null ? "—" : fmt(t.velocidad_m_s, "", 1);
  return `${otxt(t)} · Q ${fmt(t.caudalCalculo_dm3_s, "", 2)} · v ${v}`;
}

// Descripción accesible (WCAG): resumen del resultado + codificación del
// recorrido crítico. El SVG COMPLEMENTA, nunca sustituye, al texto/tabla.
function describir(result: HS4Result): string {
  const n = result.porTramo.length;
  const cumplen = result.porTramo.filter((t) => t.cumple).length;
  const criticos = result.porTramo.filter((t) => t.esCritico).length;
  const grupoTxt = result.grupoPresionNecesario
    ? "Requiere grupo de presión (ap. 4.2.2 pto 1 b)."
    : "No requiere grupo de presión.";
  const puntoTxt =
    result.puntoCriticoId == null
      ? "sin punto de consumo crítico identificado"
      : `punto de consumo más desfavorable «${result.puntoCriticoId}»`;
  const invalido = result.arbolValido
    ? ""
    : "Atención: la red no forma un árbol válido; el esquema es orientativo. ";
  return (
    `Esquema de columna de la red de fontanería (agua fría, DB-HS4): acometida y ` +
    `tubo de alimentación en la base, montante vertical y un nivel por derivación ` +
    `particular con sus aparatos como marcas verticales. ${invalido}` +
    `Veredicto global: ${TEXTO_VEREDICTO[result.veredictoGlobal]}. ` +
    `${cumplen} de ${n} tramos cumplen. ` +
    `Caudal de cálculo total ${fmt(result.caudalTotal_dm3_s, "dm³/s", 2)}; ` +
    `presión en el ${puntoTxt}: ${fmt(result.presionCritica_kPa, "kPa", 0)}. ${grupoTxt} ` +
    `El recorrido crítico (más desfavorable, ${criticos} tramos) se resalta con ` +
    `color rojo, trazo grueso discontinuo y la etiqueta «crítico».`
  );
}

// -----------------------------------------------------------------------------
// Componente
// -----------------------------------------------------------------------------
export function HS4SVG({
  result,
  mode,
  width,
  height,
  selectedId = null,
  hoverId = null,
  onSelect,
  etiquetas,
}: HS4SVGProps) {
  const esquema = calcularEsquema(result);
  const interactivo = mode === "screen" && onSelect !== undefined;
  const sel = mode === "screen" ? selectedId : null;
  const hov = mode === "screen" ? hoverId : null;

  // Tramo de la derivación del punto de consumo más desfavorable (el aparato
  // crítico expone su tramoId en porAparato): lleva la marca reforzada «◆».
  const apCritico = result.puntoCriticoId
    ? result.porAparato.find((a) => a.id === result.puntoCriticoId)
    : undefined;
  const idsPuntoCritico = new Set<string>(
    apCritico ? [apCritico.id, apCritico.tramoId] : [],
  );

  // Nombre legible del elemento: `etiquetas[id]`; sin entrada, el id (contrato).
  const nombreDe = (id: string): string => etiquetas?.[id] ?? id;

  /** Trazo MULTICANAL: crítico/fail manda (rojo); selección/hover añaden peso. */
  const trazoDe = (ids: readonly string[], critico: boolean, base: number): Trazo => {
    const esSel = ids.some((i) => i === sel);
    const esHov = ids.some((i) => i === hov);
    if (critico) {
      return { kind: "critical", base: esSel ? base * 1.35 : esHov ? base * 1.15 : base, ring: esSel };
    }
    if (esSel) return { kind: "flow", base: 3.5, ring: true };
    if (esHov) return { kind: "flow", base: Math.min(3, base + 1.1), ring: false };
    return { kind: "normal", base, ring: false };
  };

  /** ¿Se pinta en el canal crítico? Recorrido crítico O veredicto fail. */
  const esRojo = (t: ResultadoTramoHS4): boolean => t.esCritico || t.estado === "fail";

  /** Sufijo textual del recorrido crítico (canal redundante al rojo). */
  const sufijoCritico = (t: ResultadoTramoHS4): string =>
    t.esCritico ? (idsPuntoCritico.has(t.id) ? " — ◆ crítico" : " — crítico") : "";

  const envolver = (key: string, id: string, contenido: ReactNode, hit: ReactNode): ReactNode =>
    interactivo ? (
      <g
        key={key}
        data-el={id}
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(id);
        }}
      >
        {contenido}
        {hit}
      </g>
    ) : (
      <g key={key}>{contenido}</g>
    );

  const hitLine = (x1: number, y1: number, x2: number, y2: number): ReactNode =>
    interactivo ? (
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={12} strokeLinecap="round" />
    ) : null;

  // ── Piezas del dibujo ──────────────────────────────────────────────────────

  const forjados: ReactNode[] = [];
  for (let i = 0; i < esquema.nNiveles; i++) {
    const y = ESQ4.yNivel0 + i * ESQ4.nivelH + ESQ4.dyForjado;
    forjados.push(
      <Seg
        key={`forjado-${i}`}
        x1={ESQ4.margenX}
        y1={y}
        x2={esquema.contentW - ESQ4.margenX}
        y2={y}
        mode={mode}
        kind="dim"
        base={0.8}
        dash="5 4"
      />,
    );
  }

  const pintarTick = (tick: TickHS4, y: number): ReactNode => {
    const id = tick.clase === "aparato" ? tick.ap.id : tick.t.id;
    const rojo =
      tick.clase === "aparato" ? !tick.ap.cumple : esRojo(tick.t);
    const tr = trazoDe([id], rojo, 1.5);
    const esPunto = idsPuntoCritico.has(id);
    // Etiqueta del tick: caudal (dm³/s, 2 dec) + marcas multicanal.
    const q =
      tick.clase === "aparato"
        ? fmt(tick.ap.caudalInstantaneo_dm3_s, "", 2)
        : fmt(tick.t.caudalCalculo_dm3_s, "", 2);
    const marca =
      tick.clase === "aparato"
        ? tick.ap.cumple
          ? ""
          : " ✗"
        : marcaEstado(tick.t.estado);
    return envolver(
      `tick-${id}`,
      id,
      <>
        <Seg x1={tick.x} y1={y - ESQ4.tickH} x2={tick.x} y2={y} mode={mode} kind={tr.kind} base={tr.base} />
        <Tag
          x={tick.x}
          y={y - ESQ4.tickH - 5}
          mode={mode}
          size={7.5}
          anchor="middle"
          mono
          tone="dim"
          critical={rojo || esPunto}
        >
          {`${esPunto ? "◆ " : ""}${q}${marca}`}
        </Tag>
        {tr.ring && <Ring x={tick.x} y={y - ESQ4.tickH / 2} mode={mode} kind={tr.kind} />}
      </>,
      hitLine(tick.x, y - ESQ4.tickH - 8, tick.x, y),
    );
  };

  const pintarDerivacion = (deriv: DerivacionHS4, y: number): ReactNode => {
    const t = deriv.t;
    const rojo = esRojo(t);
    const tr = trazoDe([t.id], rojo, 1.3);
    const yStub = y - ESQ4.derivH;
    const extra = deriv.ocultos > 0 ? ` +${deriv.ocultos}` : "";
    // El punto de consumo más desfavorable puede estar COLAPSADO en un mini-tick
    // de esta derivación: la marca «◆» sube entonces a la etiqueta del stub.
    const contienePunto = deriv.miniTicks.some((mt) =>
      idsPuntoCritico.has(mt.clase === "aparato" ? mt.ap.id : mt.t.id),
    );
    return envolver(
      `deriv-${t.id}`,
      t.id,
      <>
        <Seg x1={deriv.x} y1={yStub} x2={deriv.x} y2={y} mode={mode} kind={tr.kind} base={tr.base} />
        <Seg
          x1={deriv.x - deriv.stubW / 2}
          y1={yStub}
          x2={deriv.x + deriv.stubW / 2}
          y2={yStub}
          mode={mode}
          kind={tr.kind}
          base={tr.base}
        />
        {deriv.miniTicks.map((mt) => {
          const mid = mt.clase === "aparato" ? mt.ap.id : mt.t.id;
          const mRojo = mt.clase === "aparato" ? !mt.ap.cumple : esRojo(mt.t);
          return (
            <Seg
              key={`mini-${mid}`}
              x1={mt.x}
              y1={yStub - ESQ4.miniTickH}
              x2={mt.x}
              y2={yStub}
              mode={mode}
              kind={mRojo ? "critical" : tr.kind === "flow" ? "flow" : "normal"}
              base={1.1}
            />
          );
        })}
        {/* Etiqueta compacta del tramo anidado: Ø·Q (+marcas multicanal). El
            refuerzo textual «crítico» va en línea propia para no chocar con las
            etiquetas de los stubs vecinos. */}
        <Tag
          x={deriv.x}
          y={yStub - ESQ4.miniTickH - 5}
          mode={mode}
          size={7.5}
          anchor="middle"
          mono
          tone="dim"
          critical={rojo}
        >
          {`${otxt(t)}·Q${fmt(t.caudalCalculo_dm3_s, "", 2)}${extra}${marcaEstado(t.estado)}`}
        </Tag>
        {(t.esCritico || contienePunto) && (
          <Tag x={deriv.x} y={yStub - ESQ4.miniTickH - 14} mode={mode} size={7.5} anchor="middle" mono critical>
            {contienePunto || idsPuntoCritico.has(t.id) ? "◆ crítico" : "crítico"}
          </Tag>
        )}
        {tr.ring && <Ring x={deriv.x} y={yStub} mode={mode} kind={tr.kind} />}
      </>,
      hitLine(deriv.x, yStub - ESQ4.miniTickH, deriv.x, y),
    );
  };

  const pintarNivel = (nivel: NivelHS4, indice: number, enZonaIzquierda: boolean): ReactNode => {
    const t = nivel.t;
    const rojo = esRojo(t);
    const tr = trazoDe([t.id], rojo, 2);
    // Etiquetas del nivel: la PRIMERA columna usa la zona izquierda (maqueta);
    // las siguientes etiquetan bajo el arranque de su propia horizontal para no
    // pisarse entre columnas.
    const etiquetasNivel = enZonaIzquierda ? (
      <>
        <Tag x={ESQ4.xEtiquetaNivel} y={nivel.y + 4} mode={mode} size={10.5} anchor="start" bold tone="section" critical={rojo}>
          {`${nombreDe(t.id)}${sufijoCritico(t)}`}
        </Tag>
        <Tag x={ESQ4.xEtiquetaNivel} y={nivel.y + 16} mode={mode} size={8} anchor="start" mono tone="dim" critical={rojo}>
          {`${etiquetaHidraulica(t)}${marcaEstado(t.estado)}`}
        </Tag>
        {/* Presión residual en el extremo (aguas arriba) del nivel. */}
        <Tag x={ESQ4.xEtiquetaNivel} y={nivel.y + 27} mode={mode} size={8} anchor="start" mono tone="dim">
          {`P ${fmt(t.presionResidual_kPa, "kPa", 0)}`}
        </Tag>
        {t.estado === "fail" && (
          <Tag x={ESQ4.xEtiquetaNivel} y={nivel.y + 38} mode={mode} size={8} anchor="start" critical>
            ✗ incumple
          </Tag>
        )}
      </>
    ) : (
      <>
        <Tag x={nivel.x0 + 4} y={nivel.y + 14} mode={mode} size={9.5} anchor="start" bold tone="section" critical={rojo}>
          {`${nombreDe(t.id)}${sufijoCritico(t)}`}
        </Tag>
        <Tag x={nivel.x0 + 4} y={nivel.y + 25} mode={mode} size={8} anchor="start" mono tone="dim" critical={rojo}>
          {`${etiquetaHidraulica(t)}${marcaEstado(t.estado)}`}
        </Tag>
        <Tag x={nivel.x0 + 4} y={nivel.y + 36} mode={mode} size={8} anchor="start" mono tone="dim">
          {`P ${fmt(t.presionResidual_kPa, "kPa", 0)}`}
        </Tag>
      </>
    );
    return (
      <g key={`nivel-${t.id}-${indice}`}>
        {envolver(
          `nivel-linea-${t.id}`,
          t.id,
          <>
            <Seg x1={nivel.x0} y1={nivel.y} x2={nivel.x1} y2={nivel.y} mode={mode} kind={tr.kind} base={tr.base} />
            {etiquetasNivel}
            {tr.ring && <Ring x={(nivel.x0 + nivel.x1) / 2} y={nivel.y} mode={mode} kind={tr.kind} />}
          </>,
          hitLine(nivel.x0, nivel.y, nivel.x1, nivel.y),
        )}
        {nivel.items.map((it) =>
          it.clase === "tick" ? pintarTick(it.tick, nivel.y) : pintarDerivacion(it.deriv, nivel.y),
        )}
      </g>
    );
  };

  const pintarColumna = (col: ColumnaHS4, indice: number): ReactNode => {
    const esMontante = col.cadena.length > 0;
    const principal = col.cadena[0] ?? null;
    const ids = col.cadena.map((t) => t.id);
    const rojo = col.cadena.some((t) => esRojo(t));
    const tr = trazoDe(ids, rojo, 2.5);
    const extraCadena = col.cadena.length > 1 ? ` (+${col.cadena.length - 1})` : "";
    const vertical = (
      <>
        <Seg x1={col.x} y1={col.yTop} x2={col.x} y2={esquema.yBase} mode={mode} kind={tr.kind} base={tr.base} />
        {esMontante && principal && (
          <>
            <Tag x={col.x + 12} y={col.yTop + 14} mode={mode} size={9} anchor="start" mono tone="section" critical={rojo}>
              {`${nombreDe(principal.id)} · ${otxt(principal)}${extraCadena}${marcaEstado(principal.estado)}`}
            </Tag>
            <Tag x={col.x + 12} y={col.yTop + 26} mode={mode} size={8} anchor="start" mono tone="dim">
              {`Q ${fmt(principal.caudalCalculo_dm3_s, "", 2)} · v ${
                principal.velocidad_m_s == null ? "—" : fmt(principal.velocidad_m_s, "", 1)
              }`}
            </Tag>
            {/* Refuerzo textual del recorrido crítico en línea propia (no
                desborda el margen derecho del viewBox). */}
            {principal.esCritico && (
              <Tag x={col.x + 12} y={col.yTop + 38} mode={mode} size={8} anchor="start" mono critical>
                {idsPuntoCritico.has(principal.id) ? "◆ crítico" : "crítico"}
              </Tag>
            )}
          </>
        )}
        {tr.ring && <Ring x={col.x} y={col.yTop + 22} mode={mode} kind={tr.kind} />}
      </>
    );
    return (
      <g key={`col-${principal?.id ?? "virtual"}-${indice}`}>
        {principal !== null
          ? envolver(`col-linea-${principal.id}`, principal.id, vertical, hitLine(col.x, col.yTop, col.x, esquema.yBase))
          : vertical}
        {col.niveles.map((n, i) => pintarNivel(n, i, indice === 0))}
      </g>
    );
  };

  const pintarBase = (seg: BaseSegHS4, indice: number): ReactNode => {
    const t = seg.t;
    const rojo = esRojo(t);
    const tr = trazoDe([t.id], rojo, 2.5);
    const y = esquema.yBase;
    // Etiquetas alternadas arriba/abajo para que segmentos consecutivos de la
    // cadena base no se pisen entre sí.
    const yTag = indice % 2 === 0 ? y - 10 : y + 15;
    return envolver(
      `base-${t.id}`,
      t.id,
      <>
        <Seg x1={seg.x0} y1={y} x2={seg.x1} y2={y} mode={mode} kind={tr.kind} base={tr.base} />
        {/* Etiqueta: nombre · Ø · P residual (presión en el extremo del tramo). */}
        <Tag x={seg.x0 + 4} y={yTag} mode={mode} size={8.5} anchor="start" mono tone="dim" critical={rojo}>
          {`${nombreDe(t.id)} · ${otxt(t)} · P ${fmt(t.presionResidual_kPa, "", 0)}${marcaEstado(t.estado)}${sufijoCritico(t)}`}
        </Tag>
        {tr.ring && <Ring x={(seg.x0 + seg.x1) / 2} y={y} mode={mode} kind={tr.kind} />}
      </>,
      hitLine(seg.x0, y, seg.x1, y),
    );
  };

  const cumplen = result.porTramo.filter((t) => t.cumple).length;
  const nTramos = result.porTramo.length;
  const hayBase = esquema.base.length > 0;
  const raizRoja = hayBase && esRojo(esquema.base[0].t);

  const captionTono = result.grupoPresionNecesario;

  return (
    <DiagramSvg
      viewBox={[0, 0, esquema.contentW, esquema.contentH]}
      width={width}
      height={height}
      mode={mode}
      title="Esquema de columna de la red de fontanería (DB-HS4)"
      desc={describir(result)}
    >
      {/* Aviso de red inválida: render degradado pero sin romper (multicanal). */}
      {!result.arbolValido && (
        <Tag x={ESQ4.margenX} y={ESQ4.yAviso} mode={mode} size={9} anchor="start" critical>
          {`⚠ Red no válida: esquema orientativo${
            esquema.omitidos.length > 0 ? ` · ${esquema.omitidos.length} tramo(s) sin dibujar` : ""
          }`}
        </Tag>
      )}
      {result.arbolValido && esquema.omitidos.length > 0 && (
        <Tag x={ESQ4.margenX} y={ESQ4.yAviso} mode={mode} size={8.5} anchor="start" tone="dim">
          {`${esquema.omitidos.length} tramo(s) no representados en el esquema`}
        </Tag>
      )}

      {/* Forjados discontinuos entre niveles. */}
      {forjados}

      {/* Columnas (montantes + niveles + aparatos). */}
      {esquema.columnas.map((c, i) => pintarColumna(c, i))}

      {/* Base: acometida + tubo de alimentación, red general y flecha de entrada. */}
      {esquema.base.map((s, i) => pintarBase(s, i))}
      {hayBase && (
        <>
          <Box
            x={ESQ4.xRedGeneral}
            y={esquema.yBase - ESQ4.ladoRedGeneral / 2}
            w={ESQ4.ladoRedGeneral}
            h={ESQ4.ladoRedGeneral}
            mode={mode}
            kind="dim"
          />
          {/* Flecha de ENTRADA: de la red general hacia la acometida. */}
          <Arrow
            x1={ESQ4.xFlechaIni}
            y1={esquema.yBase}
            x2={ESQ4.xBaseIzq - 2}
            y2={esquema.yBase}
            mode={mode}
            kind={raizRoja ? "critical" : "flow"}
            base={1.6}
          />
          <Tag x={ESQ4.xRedGeneral - 14} y={esquema.yBase + 24} mode={mode} size={8.5} anchor="start" tone="dim">
            red general / acometida
          </Tag>
        </>
      )}

      {/* Caption de totales (los datos numéricos también van en texto/tabla). */}
      <Tag
        x={ESQ4.margenX}
        y={esquema.yBase + ESQ4.dyCaption}
        mode={mode}
        size={9.5}
        anchor="start"
        tone="dim"
        critical={captionTono}
      >
        {`Q total ${fmt(result.caudalTotal_dm3_s, "dm³/s", 2)} · P crítica ${fmt(
          result.presionCritica_kPa,
          "kPa",
          0,
        )} · ${cumplen}/${nTramos} tramos cumplen${
          result.grupoPresionNecesario ? " · ✗ grupo de presión necesario" : ""
        }`}
      </Tag>
    </DiagramSvg>
  );
}
