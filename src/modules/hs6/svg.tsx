// DB-HS6 — Protección frente al radón. RENDER SVG (visual primero).
//
// Componente PURO de render (React 19 + React Compiler): consume `HS6Result`
// (→ ./calc) y pinta SOLO con las primitivas compartidas de ../../lib/svg/*.
// No muta props, no usa efectos, no usa Date/Math.random (geometría 100%
// determinista, derivada en ./svg-meta). Compatible con el export PDF (svg2pdf):
// SOLO primitivas planas en px, atributos de presentación inline (sin
// foreignObject / filtros / máscaras / gradientes / patterns nativos). Las tramas
// (terreno, lámina, hueco) se dibujan con SEGMENTOS PLANOS inline — lección de
// producción: svg2pdf genera degradados/soft-masks que Acrobat rechaza.
//
// QUÉ REPRESENTA (cf. HE1 "sección por capas", NO árbol/grafo): una SECCIÓN
// VERTICAL del encuentro del local con el terreno, en BANDAS apiladas de arriba
// (interior protegido) abajo (terreno, origen del radón). Cada banda lleva su
// papel (`rol`), su estado y, si es el ELEMENTO CRÍTICO (`banda.critico` /
// `kind==="critical"`), se resalta MULTICANAL (WCAG 1.4.1): color rojo + trazo
// grueso/discontinuo + trama + etiqueta directa, NUNCA solo color. La amenaza
// (radón) se codifica con flechas ascendentes; la ventilación de la cámara con
// flechas de barrido al exterior; la despresurización con tubo + ventilador.
//
// La geometría (bandas, aberturas, flechas, tubo, tamaño nativo) vive en
// ./svg-meta (ÚNICA fuente de verdad, módulo SIN JSX). Este archivo SOLO pinta lo
// que aquella describe. Los resultados numéricos van TAMBIÉN en la tabla de la
// UI/ficha: el SVG complementa, nunca sustituye, al texto (WCAG 1.4.1).

import { DiagramSvg, Seg, Arrow, Tag, type SvgMode } from "../../lib/svg/primitives";
import { palette, type Kind } from "../../lib/svg/helpers";
import { fitViewBox } from "../../lib/svg/helpers";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { HS6Result } from "./calc";
// Id del clon PDF, constantes de layout, geometría determinista y tamaño nativo
// del viewBox: viven en ./svg-meta (módulo SIN JSX) para que este archivo
// exporte SOLO componentes (react-refresh/only-export-components). ÚNICA fuente
// de verdad de las medidas y de `calcularSeccionHS6`.
import {
  VB_PAD,
  BANDA_TOTALES,
  HS6_FALTA_MEDIDA,
  calcularSeccionHS6,
  type BandaHS6,
  type DespresurizacionGeomHS6,
  type SeccionGeomHS6,
} from "./svg-meta";

interface HS6SVGProps {
  result: HS6Result;
  mode: SvgMode;
  width: number;
  height: number;
}

const TEXTO_VEREDICTO: Record<Veredicto, string> = {
  ok: "Cumple",
  warn: "Cumple con avisos",
  fail: "No cumple",
  neutral: "Sin veredicto",
};

const VEREDICTO_MARCA: Record<Veredicto, string> = {
  ok: "✓ cumple",
  warn: "△ aviso",
  fail: "✗ incumple",
  neutral: "· no aplica",
};

// -----------------------------------------------------------------------------
// Marco rectangular de una banda (4 segmentos planos). El crítico se refuerza
// MULTICANAL: trazo grueso/discontinuo (criticalStroke vía kind) — el color es
// solo UNO de los canales. Se reutiliza `Seg` (paleta + criticalStroke).
// -----------------------------------------------------------------------------
function MarcoBanda({ b, mode }: { b: BandaHS6; mode: SvgMode }) {
  const kind = b.kind;
  const base = b.critico ? 1.4 : 0.9;
  return (
    <g>
      <Seg x1={b.x} y1={b.y} x2={b.x + b.w} y2={b.y} mode={mode} kind={kind} base={base} />
      <Seg x1={b.x + b.w} y1={b.y} x2={b.x + b.w} y2={b.y + b.h} mode={mode} kind={kind} base={base} />
      <Seg x1={b.x + b.w} y1={b.y + b.h} x2={b.x} y2={b.y + b.h} mode={mode} kind={kind} base={base} />
      <Seg x1={b.x} y1={b.y + b.h} x2={b.x} y2={b.y} mode={mode} kind={kind} base={base} />
    </g>
  );
}

// -----------------------------------------------------------------------------
// Trama de líneas diagonales recortada a la caja (Acrobat-safe: segmentos planos
// inline, sin <pattern>/gradiente). Sirve de relleno para el terreno y para la
// banda-hueco del aviso «falta medida». `step` controla la densidad.
// -----------------------------------------------------------------------------
function Hatch({
  x,
  y,
  w,
  h,
  step,
  stroke,
  strokeWidth,
  idKey,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  step: number;
  stroke: string;
  strokeWidth: number;
  idKey: string;
}) {
  // Diagonales a 45°: barremos el origen desde (x - h) para cubrir toda la caja.
  const rayas: number[] = [];
  for (let xr = x - h; xr < x + w; xr += step) rayas.push(xr);
  return (
    <g>
      {rayas.map((xr) => {
        const x1 = Math.max(x, xr);
        const y1 = y + (x1 - xr);
        const x2 = Math.min(x + w, xr + h);
        const y2 = y + (x2 - xr);
        if (x2 <= x1) return null;
        return (
          <line
            key={`hatch-${idKey}-${xr}`}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
        );
      })}
    </g>
  );
}

// -----------------------------------------------------------------------------
// Etiquetas de banda en el canal derecho (LABEL_GUTTER): título (+ marca de
// veredicto multicanal si crítico) y subtítulo. El dato fino numérico vive en la
// tabla "Resultado"; aquí va el rótulo de la banda. Línea guía del borde derecho
// de la banda a la etiqueta.
// -----------------------------------------------------------------------------
function EtiquetasBanda({ b, mode }: { b: BandaHS6; mode: SvgMode }) {
  const xLab = b.x + b.w + 8;
  const yTit = b.cy - (b.subtitulo ? 3 : 0);
  return (
    <g>
      <Seg x1={b.x + b.w} y1={b.cy} x2={xLab - 2} y2={b.cy} mode={mode} base={0.5} />
      <Tag x={xLab} y={yTit} mode={mode} anchor="start" size={4.2} critical={b.critico}>
        {b.critico ? `${b.titulo} — ${VEREDICTO_MARCA[b.estado]}` : b.titulo}
      </Tag>
      {b.subtitulo ? (
        <Tag x={xLab} y={b.cy + 6} mode={mode} anchor="start" size={3.2} critical={b.critico}>
          {b.subtitulo}
        </Tag>
      ) : null}
    </g>
  );
}

// -----------------------------------------------------------------------------
// Bandas por ROL. Cada una pinta su marco + su relleno/trama + adornos (flechas,
// aberturas, marcas de aviso). El crítico ya viene en `b.kind`/`b.critico`.
// -----------------------------------------------------------------------------

/** TERRENO: trama densa + flechas de radón ascendente (codifica la amenaza). */
function BandaTerreno({ b, mode }: { b: BandaHS6; mode: SvgMode }) {
  const pal = palette(mode);
  return (
    <g>
      <MarcoBanda b={b} mode={mode} />
      <Hatch
        x={b.x}
        y={b.y}
        w={b.w}
        h={b.h}
        step={9}
        stroke={pal.section}
        strokeWidth={0.7}
        idKey={`terreno-${b.id}`}
      />
      {/* Flechas de radón ↑ (sentido de la amenaza). `flow` = canal de flujo. */}
      {b.flechasRadon.map((f, i) => (
        <Arrow
          key={`radon-${b.id}-${i}`}
          x1={f.x}
          y1={f.yBase}
          x2={f.x}
          y2={f.yPunta}
          mode={mode}
          kind="flow"
          base={1.2}
        />
      ))}
      {/* Marca textual de la amenaza dentro del terreno (refuerzo, no solo color). */}
      {b.flechasRadon.length > 0 ? (
        <Tag x={b.x + 4} y={b.y + 8} mode={mode} anchor="start" size={3.2}>
          radón ↑
        </Tag>
      ) : null}
    </g>
  );
}

/** BARRERA: lámina/membrana sellada (banda fina con su trama de sellado). */
function BandaBarrera({ b, mode }: { b: BandaHS6; mode: SvgMode }) {
  const pal = palette(mode);
  const stroke = b.critico ? pal.critical : pal.section;
  return (
    <g>
      <MarcoBanda b={b} mode={mode} />
      {/* Trama fina y tupida = lámina continua sellada. */}
      <Hatch
        x={b.x}
        y={b.y}
        w={b.w}
        h={b.h}
        step={5}
        stroke={stroke}
        strokeWidth={b.critico ? 1 : 0.7}
        idKey={`barrera-${b.id}`}
      />
    </g>
  );
}

/** ESPACIO DE CONTENCIÓN: cámara ventilada + aberturas con barrido al exterior. */
function BandaCamara({ b, mode }: { b: BandaHS6; mode: SvgMode }) {
  const pal = palette(mode);
  return (
    <g>
      <MarcoBanda b={b} mode={mode} />
      {/* Aberturas de ventilación (huecos en la fachada) + flecha de barrido →. */}
      {b.aberturas.map((a, i) => (
        <g key={`abert-${b.id}-${i}`}>
          {/* Hueco (relleno claro: el aire de la cámara sale por aquí). */}
          <rect
            x={a.x}
            y={a.y}
            width={a.w}
            height={a.h}
            fill={pal.section}
            fillOpacity={0.18}
            stroke={pal.section}
            strokeWidth={0.6}
          />
          <Arrow
            x1={a.x + a.w}
            y1={a.y + a.h / 2}
            x2={a.flechaX}
            y2={a.y + a.h / 2}
            mode={mode}
            kind="flow"
            base={1}
          />
        </g>
      ))}
    </g>
  );
}

/** SOLERA / forjado sanitario: cierre superior (banda llena con trama de hormigón). */
function BandaSolera({ b, mode }: { b: BandaHS6; mode: SvgMode }) {
  const pal = palette(mode);
  return (
    <g>
      <MarcoBanda b={b} mode={mode} />
      <Hatch
        x={b.x}
        y={b.y}
        w={b.w}
        h={b.h}
        step={12}
        stroke={pal.section}
        strokeWidth={0.6}
        idKey={`solera-${b.id}`}
      />
    </g>
  );
}

/** LOCAL habitable (recinto protegido): caja limpia + etiqueta «≤ 300 Bq/m³». */
function BandaLocal({ b, mode }: { b: BandaHS6; mode: SvgMode }) {
  return (
    <g>
      <MarcoBanda b={b} mode={mode} />
      {/* Nivel de referencia DENTRO del recinto (dato clave, también en tabla). */}
      <Tag x={b.cx} y={b.cy + 1} mode={mode} anchor="middle" size={4.4}>
        ≤ 300 Bq/m³
      </Tag>
    </g>
  );
}

/** HUECO de aviso (sentinela FALTA_MEDIDA): banda vacía con trama y marca crítica. */
function BandaHueco({ b, mode }: { b: BandaHS6; mode: SvgMode }) {
  const pal = palette(mode);
  return (
    <g>
      <MarcoBanda b={b} mode={mode} />
      {/* Trama crítica diagonal = vacío/ausencia de medida (refuerzo del rojo). */}
      <Hatch
        x={b.x}
        y={b.y}
        w={b.w}
        h={b.h}
        step={8}
        stroke={pal.critical}
        strokeWidth={1}
        idKey={`hueco-${b.id}`}
      />
      {/* Marca de aviso «falta medida» (texto directo, no solo color). */}
      <Tag x={b.cx} y={b.cy + 1} mode={mode} anchor="middle" size={4.2} critical>
        ⚠ falta medida
      </Tag>
    </g>
  );
}

/** MENSAJE de la sección simplificada («Sin exigencia HS6» / no aplica). */
function BandaMensaje({ b, mode }: { b: BandaHS6; mode: SvgMode }) {
  return (
    <g>
      <MarcoBanda b={b} mode={mode} />
      <Tag x={b.cx} y={b.cy - 3} mode={mode} anchor="middle" size={5}>
        {b.titulo}
      </Tag>
      {b.subtitulo ? (
        <Tag x={b.cx} y={b.cy + 7} mode={mode} anchor="middle" size={3.4}>
          {b.subtitulo}
        </Tag>
      ) : null}
    </g>
  );
}

/** Pinta el RELLENO/adornos de la banda según su `rol` (sin las etiquetas del canal). */
function RellenoBanda({ b, mode }: { b: BandaHS6; mode: SvgMode }) {
  switch (b.rol) {
    case "terreno":
      return <BandaTerreno b={b} mode={mode} />;
    case "barrera":
      return <BandaBarrera b={b} mode={mode} />;
    case "espacio_contencion":
      return <BandaCamara b={b} mode={mode} />;
    case "solera":
      return <BandaSolera b={b} mode={mode} />;
    case "local":
      return <BandaLocal b={b} mode={mode} />;
    case "hueco":
      return <BandaHueco b={b} mode={mode} />;
    case "mensaje":
      return <BandaMensaje b={b} mode={mode} />;
  }
}

/**
 * Banda completa: relleno + etiquetas del canal derecho. La banda «mensaje» (caso
 * no aplica) ya rotula su texto CENTRADO en la propia caja, así que no añade la
 * etiqueta lateral (evita duplicar el rótulo).
 */
function Banda({ b, mode }: { b: BandaHS6; mode: SvgMode }) {
  return (
    <g>
      <RellenoBanda b={b} mode={mode} />
      {b.rol !== "mensaje" ? <EtiquetasBanda b={b} mode={mode} /> : null}
    </g>
  );
}

// -----------------------------------------------------------------------------
// TUBO de DESPRESURIZACIÓN: captación en el terreno → codo → ventilador de
// extracción (arriba a la derecha). Crítico MULTICANAL (kind + etiqueta) si es el
// elemento crítico. El ventilador es un círculo con un aspa (segmentos planos).
// -----------------------------------------------------------------------------
function TuboDespresurizacion({
  d,
  mode,
}: {
  d: DespresurizacionGeomHS6;
  mode: SvgMode;
}) {
  const pal = palette(mode);
  const kind: Kind = d.critico ? "critical" : "flow";
  const stroke = d.critico ? pal.critical : pal.flow;
  const r = d.ventR;
  return (
    <g>
      {/* Tramo vertical del tubo (captación en el terreno → codo superior). */}
      <Seg x1={d.tuboX} y1={d.tuboYInf} x2={d.tuboX} y2={d.tuboYSup} mode={mode} kind={kind} base={1.6} />
      {/* Flujo de extracción ascendente (aire del terreno → ventilador). */}
      <Arrow
        x1={d.tuboX}
        y1={d.tuboYInf - 2}
        x2={d.tuboX}
        y2={d.tuboYSup}
        mode={mode}
        kind={kind}
        base={1.2}
      />
      {/* Símbolo de ventilador: círculo + aspa de dos segmentos planos. */}
      <circle
        cx={d.ventCx}
        cy={d.ventCy}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={d.critico ? 2 : 1.2}
        strokeDasharray={d.critico ? "4 2" : undefined}
      />
      <line
        x1={d.ventCx - r * 0.7}
        y1={d.ventCy - r * 0.7}
        x2={d.ventCx + r * 0.7}
        y2={d.ventCy + r * 0.7}
        stroke={stroke}
        strokeWidth={1.2}
      />
      <line
        x1={d.ventCx - r * 0.7}
        y1={d.ventCy + r * 0.7}
        x2={d.ventCx + r * 0.7}
        y2={d.ventCy - r * 0.7}
        stroke={stroke}
        strokeWidth={1.2}
      />
      {/* Etiqueta del sistema (refuerzo textual; marca el veredicto si crítico). */}
      <Tag x={d.labelX} y={d.labelY} mode={mode} anchor="start" size={3.6} critical={d.critico}>
        {d.critico ? `Despresurización — ${VEREDICTO_MARCA[d.estado]}` : "Despresurización del terreno"}
      </Tag>
    </g>
  );
}

// -----------------------------------------------------------------------------
// Descripción accesible (WCAG 1.4.1): resumen del resultado (zona, exigencia,
// medidas válidas, elemento crítico) + cómo se codifica el crítico. Español. El
// SVG COMPLEMENTA, nunca sustituye, a los resultados en texto/tabla.
// -----------------------------------------------------------------------------
function describir(result: HS6Result, seccion: SeccionGeomHS6): string {
  if (!result.aplica) {
    return (
      `Protección frente al radón (DB-HS6): sección del encuentro del local con el ` +
      `terreno. ${seccion.mensaje ?? "HS6 no exige medidas en este caso."} ` +
      `Veredicto: ${TEXTO_VEREDICTO[result.veredictoGlobal]}.`
    );
  }
  const exige = result.barreraObligatoria
    ? `Zona ${result.zona}: barrera de protección OBLIGATORIA + ${result.nMedidasMin - 1} medida(s) adicional(es).`
    : `Zona ${result.zona}: ${result.nMedidasMin} medida(s) de protección.`;
  const critTxt =
    result.elementoCriticoId === HS6_FALTA_MEDIDA
      ? "Falta una medida exigida (se resalta una banda-hueco de aviso)."
      : result.elementoCritico
        ? `Elemento crítico: ${result.elementoCritico}`
        : "Todas las medidas propuestas cumplen.";
  return (
    `Protección frente al radón (DB-HS6): sección vertical del encuentro del local ` +
    `(recinto protegido, ≤ ${result.nivelReferencia_Bq_m3} Bq/m³) con el terreno ` +
    `(origen del radón, flechas ascendentes). De arriba abajo: local, solera, las ` +
    `medidas de protección (barrera y/o cámara ventilada) y el terreno. ${exige} ` +
    `Medidas válidas: ${result.nMedidasValidas} de ${result.nMedidasMin} exigidas. ` +
    `Veredicto: ${TEXTO_VEREDICTO[result.veredictoGlobal]}. ${critTxt} ` +
    `El elemento crítico se resalta con color rojo, trazo grueso discontinuo, trama y ` +
    `etiqueta directa (no solo color). Los valores numéricos están también en la tabla.`
  );
}

export function HS6SVG({ result, mode, width, height }: HS6SVGProps) {
  const seccion = calcularSeccionHS6(result);

  // viewBox auto-encuadrado a partir de los DATOS (esquinas del contenido) +
  // padding (helper fitViewBox; no getBBox del DOM). El contenido arranca en
  // (0,0) y mide (contentW × contentH); se reserva BANDA_TOTALES abajo para la
  // línea de veredicto global. Reproduce EXACTAMENTE `hs6NativeSize`.
  const esquinas = [
    { x: 0, y: 0 },
    { x: seccion.contentW, y: seccion.contentH },
  ];
  const [vbX, vbY, vbW, vbHRaw] = fitViewBox(esquinas, VB_PAD);
  const vbH = vbHRaw + BANDA_TOTALES;
  const viewBox: [number, number, number, number] = [vbX, vbY, vbW, vbH];

  const yTotales = vbY + vbH - 6;
  const xTotales = vbX + vbW / 2;

  const lineaTotales = result.aplica
    ? `Zona ${result.zona} · ${result.nMedidasValidas}/${result.nMedidasMin} medidas válidas · ${TEXTO_VEREDICTO[result.veredictoGlobal]}`
    : `Zona ${result.zona} · sin exigencia HS6 · ${TEXTO_VEREDICTO[result.veredictoGlobal]}`;

  return (
    <DiagramSvg
      viewBox={viewBox}
      width={width}
      height={height}
      mode={mode}
      title="Protección frente al radón (DB-HS6): sección local–terreno"
      desc={describir(result, seccion)}
    >
      {/* Bandas apiladas de arriba (local) a abajo (terreno), en orden de pintado. */}
      {seccion.bandas.map((b) => (
        <Banda key={`banda-${b.id}`} b={b} mode={mode} />
      ))}

      {/* Tubo de despresurización (si hay esa medida): tubo + ventilador laterales. */}
      {seccion.despresurizacion ? (
        <TuboDespresurizacion d={seccion.despresurizacion} mode={mode} />
      ) : null}

      {/* Banda de totales (el dato numérico también va en texto/tabla, no solo SVG). */}
      <Tag x={xTotales} y={yTotales} mode={mode} size={4.2}>
        {lineaTotales}
      </Tag>
    </DiagramSvg>
  );
}
