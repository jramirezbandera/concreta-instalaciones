// DB-HS5 — ESQUEMA DE COLUMNA de la red de evacuación. RENDER SVG (feature-7,
// UX-RECONCEPT §7: muere el grafo genérico; el esquema es soporte compacto
// sincronizado con la tabla/outliner).
//
// Componente PURO de render (React 19 + React Compiler): consume `HS5Result`
// (→ ./calc) y la geometría determinista de ./svg-meta (`calcularEsquema`), y
// pinta SOLO con las primitivas planas compartidas de ../../lib/svg/* (svg2pdf-
// safe: sin foreignObject, filtros, máscaras, gradientes ni CSS externo). Sin
// efectos, sin Date/Math.random.
//
// Dibujo (maqueta validada): forjados discontinuos, bajante vertical gruesa con
// etiqueta "B1 · Ø110 / 66 UD", ventilación primaria discontinua arriba, un
// nivel por ramal con ticks de aparato (UD), colector en la base con flecha a la
// arqueta, caption de totales.
//
// MULTICANAL (WCAG 1.4.1): un tramo que NO cumple se distingue por color
// crítico + trazo grueso/discontinuo (kind="critical") + marca textual «✗» —
// NUNCA solo color. Selección: acento + trazo grueso + anillo; hover: refuerzo
// intermedio. En mode="pdf" no hay interactividad ni estados de selección.

import type { ReactNode } from "react";
import { DiagramSvg, Seg, Tag, Arrow, Ring, Box, type SvgMode } from "../../lib/svg/primitives";
import type { Kind } from "../../lib/svg/helpers";
import { fmt } from "../../lib/units/format";
import type { HS5Result, ResultadoTramo, TipoTramo } from "./calc";
// Geometría del esquema + constantes de layout: en ./svg-meta (módulo SIN JSX,
// única fuente de verdad de las medidas — la comparte hs5NativeSize/ficha PDF).
import {
  ESQ,
  calcularEsquema,
  type ColumnaHS5,
  type NivelHS5,
  type ColectorSegHS5,
  type DerivacionHS5,
  type TickHS5,
} from "./svg-meta";

interface HS5SVGProps {
  result: HS5Result;
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

/** Estilo MULTICANAL resuelto de un elemento (trazo + anillo). */
interface Trazo {
  kind: Kind;
  base: number;
  ring: boolean;
}

const TEXTO_VEREDICTO: Record<HS5Result["veredictoGlobal"], string> = {
  ok: "Cumple",
  warn: "Cumple con avisos",
  fail: "No cumple",
  neutral: "Sin veredicto",
};

/** Ø formateado del tramo ("Ø110" / "Ø—" si no dimensiona). */
function otxt(t: ResultadoTramo): string {
  return t.diametro_mm == null ? "Ø—" : `Ø${fmt(t.diametro_mm, "", 0)}`;
}

/** Etiqueta técnica del tramo: Ø + UD acumuladas + pendiente (ramal/colector). */
function etiquetaTecnica(t: ResultadoTramo): string {
  const base = `${otxt(t)} · ${fmt(t.udAcumuladas, "UD", 0)}`;
  return t.tipo === "bajante" ? base : `${base} · ${fmt(t.pendiente_pct, "%")}`;
}

/** Ø del mayor tramo de un tipo dado (mm) o `null` si no hay/no dimensiona. */
function diametroDe(result: HS5Result, tipo: TipoTramo): number | null {
  const ds = result.porTramo
    .filter((t) => t.tipo === tipo && t.diametro_mm != null)
    .map((t) => t.diametro_mm as number);
  return ds.length ? Math.max(...ds) : null;
}

// Descripción accesible (WCAG): veredicto + conteo + Ø principales. El SVG
// COMPLEMENTA, nunca sustituye, a los resultados en texto/tabla de la UI.
function describir(result: HS5Result): string {
  const n = result.porTramo.length;
  const cumplen = result.porTramo.filter((t) => t.cumple).length;
  const dBajante = diametroDe(result, "bajante");
  const dColector = diametroDe(result, "colector");
  const bajanteTxt = dBajante == null ? "sin bajante dimensionada" : `bajante Ø${fmt(dBajante, "mm")}`;
  const colectorTxt =
    dColector == null ? "sin colector dimensionado" : `colector Ø${fmt(dColector, "mm")}`;
  const invalido = result.arbolValido
    ? ""
    : "Atención: la red no forma un árbol válido; el esquema es orientativo. ";
  return (
    `Esquema de columna de la red de evacuación (DB-HS5): colector en la base con ` +
    `flecha hacia la arqueta, bajantes verticales con ventilación primaria, un nivel ` +
    `por ramal con sus aparatos como marcas verticales (UD). ${invalido}` +
    `Veredicto global: ${TEXTO_VEREDICTO[result.veredictoGlobal]}. ` +
    `${cumplen} de ${n} tramos cumplen. ${bajanteTxt}, ${colectorTxt}. ` +
    `Total ${fmt(result.udTotales, "UD")}. El tramo que incumple se resalta con ` +
    `color, trazo grueso discontinuo y la marca «✗».`
  );
}

// -----------------------------------------------------------------------------
// Componente
// -----------------------------------------------------------------------------
export function HS5SVG({
  result,
  mode,
  width,
  height,
  selectedId = null,
  hoverId = null,
  onSelect,
  etiquetas,
}: HS5SVGProps) {
  const esquema = calcularEsquema(result);
  // En PDF no hay interactividad NI estados de selección/hover.
  const interactivo = mode === "screen" && onSelect !== undefined;
  const sel = mode === "screen" ? selectedId : null;
  const hov = mode === "screen" ? hoverId : null;

  // Nombre legible del elemento: `etiquetas[id]`; sin entrada, el id (contrato).
  const nombreDe = (id: string): string => etiquetas?.[id] ?? id;

  /** Trazo MULTICANAL: fallo manda (crítico); luego selección/hover (acento). */
  const trazoDe = (ids: readonly string[], fallo: boolean, base: number): Trazo => {
    const esSel = ids.some((i) => i === sel);
    const esHov = ids.some((i) => i === hov);
    if (fallo) {
      // criticalStroke duplica el grosor y aplica trazo discontinuo.
      return { kind: "critical", base: esSel ? base * 1.35 : esHov ? base * 1.15 : base, ring: esSel };
    }
    if (esSel) return { kind: "flow", base: 3.5, ring: true };
    if (esHov) return { kind: "flow", base: Math.min(3, base + 1.1), ring: false };
    return { kind: "normal", base, ring: false };
  };

  /** Envoltorio interactivo: clic → onSelect(id); `hit` es la zona de golpeo. */
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

  /** Línea invisible de golpeo (solo pantalla interactiva). */
  const hitLine = (x1: number, y1: number, x2: number, y2: number): ReactNode =>
    interactivo ? (
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={12} strokeLinecap="round" />
    ) : null;

  // ── Piezas del dibujo ──────────────────────────────────────────────────────

  const forjados: ReactNode[] = [];
  for (let i = 0; i < esquema.nNiveles; i++) {
    const y = ESQ.yNivel0 + i * ESQ.nivelH + ESQ.dyForjado;
    forjados.push(
      <Seg
        key={`forjado-${i}`}
        x1={ESQ.margenX}
        y1={y}
        x2={esquema.contentW - ESQ.margenX}
        y2={y}
        mode={mode}
        kind="dim"
        base={0.8}
        dash="5 4"
      />,
    );
  }

  const pintarTick = (tick: TickHS5, y: number): ReactNode => {
    const fallo = !tick.ap.cumple;
    const tr = trazoDe([tick.ap.id], fallo, 1.5);
    return envolver(
      `tick-${tick.ap.id}`,
      tick.ap.id,
      <>
        <Seg x1={tick.x} y1={y - ESQ.tickH} x2={tick.x} y2={y} mode={mode} kind={tr.kind} base={tr.base} />
        <Tag
          x={tick.x}
          y={y - ESQ.tickH - 5}
          mode={mode}
          size={8}
          anchor="middle"
          mono
          tone="dim"
          critical={fallo}
        >
          {`${fmt(tick.ap.ud, "", 0)}${fallo ? " ✗" : ""}`}
        </Tag>
        {tr.ring && <Ring x={tick.x} y={y - ESQ.tickH / 2} mode={mode} kind={tr.kind} />}
      </>,
      hitLine(tick.x, y - ESQ.tickH - 8, tick.x, y),
    );
  };

  const pintarDerivacion = (deriv: DerivacionHS5, y: number): ReactNode => {
    const t = deriv.t;
    const fallo = !t.cumple;
    const tr = trazoDe([t.id], fallo, 1.3);
    const yStub = y - ESQ.derivH;
    const extra = deriv.ocultos > 0 ? ` +${deriv.ocultos}` : "";
    return envolver(
      `deriv-${t.id}`,
      t.id,
      <>
        {/* Bajada de la derivación al ramal padre + stub con mini-ticks. */}
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
        {deriv.miniTicks.map((mt) => (
          <Seg
            key={`mini-${mt.ap.id}`}
            x1={mt.x}
            y1={yStub - ESQ.miniTickH}
            x2={mt.x}
            y2={yStub}
            mode={mode}
            kind={!mt.ap.cumple ? "critical" : tr.kind === "flow" ? "flow" : "normal"}
            base={1.1}
          />
        ))}
        {/* Etiqueta compacta del tramo anidado: Ø·UD·pendiente (+✗ si incumple). */}
        <Tag
          x={deriv.x}
          y={yStub - ESQ.miniTickH - 5}
          mode={mode}
          size={7.5}
          anchor="middle"
          mono
          tone="dim"
          critical={fallo}
        >
          {`${otxt(t)}·${fmt(t.udAcumuladas, "", 0)}UD·${fmt(t.pendiente_pct, "", 1)}%${extra}${fallo ? " ✗" : ""}`}
        </Tag>
        {tr.ring && <Ring x={deriv.x} y={yStub} mode={mode} kind={tr.kind} />}
      </>,
      hitLine(deriv.x, yStub - ESQ.miniTickH, deriv.x, y),
    );
  };

  const pintarNivel = (nivel: NivelHS5, indice: number, enZonaIzquierda: boolean): ReactNode => {
    const t = nivel.t;
    const fallo = !t.cumple;
    const tr = trazoDe([t.id], fallo, 2);
    // Etiquetas del nivel: la PRIMERA columna usa la zona izquierda (maqueta);
    // las siguientes etiquetan bajo el arranque de su propia horizontal para no
    // pisarse entre columnas.
    const etiquetasNivel = enZonaIzquierda ? (
      <>
        <Tag x={ESQ.xEtiquetaNivel} y={nivel.y + 4} mode={mode} size={10.5} anchor="start" bold tone="section" critical={fallo}>
          {nombreDe(t.id)}
        </Tag>
        <Tag x={ESQ.xEtiquetaNivel} y={nivel.y + 16} mode={mode} size={8} anchor="start" mono tone="dim" critical={fallo}>
          {etiquetaTecnica(t)}
        </Tag>
        {fallo && (
          <Tag x={ESQ.xEtiquetaNivel} y={nivel.y + 27} mode={mode} size={8} anchor="start" critical>
            ✗ incumple
          </Tag>
        )}
      </>
    ) : (
      <>
        <Tag x={nivel.x0 + 4} y={nivel.y + 14} mode={mode} size={9.5} anchor="start" bold tone="section" critical={fallo}>
          {nombreDe(t.id)}
        </Tag>
        <Tag x={nivel.x0 + 4} y={nivel.y + 25} mode={mode} size={8} anchor="start" mono tone="dim" critical={fallo}>
          {`${etiquetaTecnica(t)}${fallo ? " ✗" : ""}`}
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

  const pintarColumna = (col: ColumnaHS5, indice: number): ReactNode => {
    const enZonaIzquierda = indice === 0;
    const esBajante = col.cadena.length > 0;
    const principal = col.cadena[0] ?? null;
    const ids = esBajante ? col.cadena.map((t) => t.id) : [];
    const fallo = col.cadena.some((t) => !t.cumple);
    const tr = trazoDe(ids, fallo, 2.5);
    const idClic = principal?.id;
    const extraCadena = col.cadena.length > 1 ? ` (+${col.cadena.length - 1})` : "";
    const vertical = (
      <>
        <Seg x1={col.x} y1={col.yTop} x2={col.x} y2={esquema.yBase} mode={mode} kind={tr.kind} base={tr.base} />
        {esBajante && principal && (
          <>
            {/* Ventilación primaria discontinua sobre el extremo superior. */}
            <Seg x1={col.x} y1={col.yTop} x2={col.x} y2={ESQ.yVentTop} mode={mode} kind="dim" base={1.2} dash="3 3" />
            <Tag x={col.x - 8} y={ESQ.yVentTop - 6} mode={mode} size={8} anchor="end" tone="dim">
              vent. 1ª
            </Tag>
            {/* Etiqueta de la bajante: nombre · Ø / UD acumuladas. */}
            <Tag x={col.x + 12} y={col.yTop + 14} mode={mode} size={9} anchor="start" mono tone="section" critical={fallo}>
              {`${nombreDe(principal.id)} · ${otxt(principal)}${extraCadena}${fallo ? " ✗" : ""}`}
            </Tag>
            <Tag x={col.x + 12} y={col.yTop + 26} mode={mode} size={8} anchor="start" mono tone="dim">
              {fmt(principal.udAcumuladas, "UD", 0)}
            </Tag>
          </>
        )}
        {tr.ring && <Ring x={col.x} y={col.yTop + 22} mode={mode} kind={tr.kind} />}
      </>
    );
    return (
      <g key={`col-${idClic ?? "virtual"}-${indice}`}>
        {idClic !== undefined
          ? envolver(`col-linea-${idClic}`, idClic, vertical, hitLine(col.x, col.yTop, col.x, esquema.yBase))
          : vertical}
        {col.niveles.map((n, i) => pintarNivel(n, i, enZonaIzquierda))}
      </g>
    );
  };

  const pintarColector = (seg: ColectorSegHS5, indice: number): ReactNode => {
    const t = seg.t;
    const fallo = !t.cumple;
    const tr = trazoDe([t.id], fallo, 2.5);
    const y = esquema.yBase;
    return envolver(
      `colector-${t.id}`,
      t.id,
      <>
        <Seg x1={seg.x1} y1={y} x2={seg.x0} y2={y} mode={mode} kind={tr.kind} base={tr.base} />
        <Tag x={seg.x0 + 4} y={y - 10} mode={mode} size={8.5} anchor="start" mono tone="dim" critical={fallo}>
          {`${nombreDe(t.id)} · ${etiquetaTecnica(t)}${fallo ? " ✗" : ""}`}
        </Tag>
        {/* La flecha hacia la arqueta la lleva el primer segmento (raíz). */}
        {indice === 0 && (
          <Arrow x1={seg.x0} y1={y} x2={ESQ.xFlecha} y2={y} mode={mode} kind={tr.kind === "normal" ? "flow" : tr.kind} base={tr.base * 0.8} />
        )}
        {tr.ring && <Ring x={(seg.x0 + seg.x1) / 2} y={y} mode={mode} kind={tr.kind} />}
      </>,
      hitLine(seg.x0, y, seg.x1, y),
    );
  };

  const cumplen = result.porTramo.filter((t) => t.cumple).length;
  const nTramos = result.porTramo.length;
  const hayColector = esquema.colectores.length > 0;

  return (
    <DiagramSvg
      viewBox={[0, 0, esquema.contentW, esquema.contentH]}
      width={width}
      height={height}
      mode={mode}
      title="Esquema de columna de la red de evacuación (DB-HS5)"
      desc={describir(result)}
    >
      {/* Aviso de red inválida: render degradado pero sin romper (multicanal). */}
      {!result.arbolValido && (
        <Tag x={ESQ.margenX} y={ESQ.yAviso} mode={mode} size={9} anchor="start" critical>
          {`⚠ Red no válida: esquema orientativo${
            esquema.omitidos.length > 0 ? ` · ${esquema.omitidos.length} tramo(s) sin dibujar` : ""
          }`}
        </Tag>
      )}
      {result.arbolValido && esquema.omitidos.length > 0 && (
        <Tag x={ESQ.margenX} y={ESQ.yAviso} mode={mode} size={8.5} anchor="start" tone="dim">
          {`${esquema.omitidos.length} tramo(s) no representados en el esquema`}
        </Tag>
      )}

      {/* Forjados discontinuos entre niveles. */}
      {forjados}

      {/* Columnas (bajantes + niveles + aparatos). */}
      {esquema.columnas.map((c, i) => pintarColumna(c, i))}

      {/* Colector(es) en la base + arqueta. */}
      {esquema.colectores.map((s, i) => pintarColector(s, i))}
      {hayColector && (
        <>
          <Box
            x={ESQ.xArqueta}
            y={esquema.yBase - ESQ.ladoArqueta / 2}
            w={ESQ.ladoArqueta}
            h={ESQ.ladoArqueta}
            mode={mode}
            kind="dim"
          />
          <Tag x={ESQ.xArqueta - 14} y={esquema.yBase + 24} mode={mode} size={8.5} anchor="start" tone="dim">
            arqueta / acometida
          </Tag>
        </>
      )}

      {/* Caption de totales (el dato numérico también va en texto/tabla). */}
      <Tag x={ESQ.margenX} y={esquema.yBase + ESQ.dyCaption} mode={mode} size={9.5} anchor="start" tone="dim">
        {`${fmt(result.udTotales, "UD", 0)} · ${cumplen}/${nTramos} tramos cumplen · uso ${
          result.uso === "privado" ? "privado" : "público"
        }`}
      </Tag>
    </DiagramSvg>
  );
}
