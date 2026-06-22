// DB-HE1 — Envolvente térmica. RENDER SVG (visual primero).
//
// Componente PURO de render (React 19 + React Compiler): consume `HE1Result`
// (→ ./calc) y pinta SOLO con las primitivas compartidas de ../../lib/svg/*.
// No muta props, no usa efectos, no usa Date/Math.random (layout determinista
// por índice). Compatible con el export PDF (svg2pdf): SOLO primitivas planas en
// px, atributos de presentación inline (sin foreignObject/filtros/gradientes).
//
// Diferencial "visual primero": por cada cerramiento de la envolvente (apilados
// verticalmente, como HS3 apila estancias) se dibujan TRES vistas:
//   1) SECCIÓN del muro por capas (interior→exterior), anchos ∝ espesor, con la
//      capa aislante destacada (patrón rayado + etiqueta «AISLANTE»).
//   2) BARRA U vs límite MULTICANAL (WCAG 1.4.1): U frente al MÁS restrictivo de
//      Ulim y U_max_fRsi. Si U > límite → rojo + trazo grueso/discontinuo +
//      etiqueta «U > Ulim», NUNCA solo color. Medianería (Ulim=null) → «no aplica».
//   3) DIAGRAMA de Glaser: dos poligonales (Psat saturación / Pvapor real) sobre
//      el eje Sd (0..1); las interfaces donde `condensa` se marcan con punto rojo
//      + aspa; si `condensaIntersticial` → etiqueta «condensación (revisar)».
//
// Todos los resultados numéricos van TAMBIÉN en texto (la ficha/UI los tabula);
// el SVG complementa, nunca sustituye, al texto (WCAG 1.4.1).

import { DiagramSvg, Seg, Dot, Tag, type SvgMode } from "../../lib/svg/primitives";
import { palette, type Kind } from "../../lib/svg/helpers";
import { fitViewBox } from "../../lib/svg/helpers";
import { fmt } from "../../lib/units/format";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type {
  HE1Result,
  ResultadoCapaHE1,
  ResultadoCerramientoHE1,
  ResultadoGlaserHE1,
} from "./calc";
import type { MaterialReferencia } from "./tablas";
// Id del clon PDF, constantes de layout, geometría determinista y tamaño nativo
// del viewBox: viven en ./svg-meta (módulo SIN JSX) para que este archivo
// exporte SOLO componentes (react-refresh/only-export-components). ÚNICA fuente
// de verdad de las medidas y de `calcularLayout`.
import {
  VB_PAD,
  BANDA_TOTALES,
  SEC_AXIS_H,
  calcularLayout,
  esCompacto,
  type CerramientoGeom,
  type SeccionGeom,
} from "./svg-meta";

interface He1SVGProps {
  result: HE1Result;
  mode: SvgMode;
  width: number;
  height: number;
}

// Materiales de la tabla CEC considerados AISLANTES térmicos: se destacan en la
// sección (patrón + etiqueta), porque son el dato que más mueve la U.
const MATERIALES_AISLANTES: ReadonlySet<MaterialReferencia> = new Set<MaterialReferencia>([
  "eps",
  "xps",
  "lana_mineral",
  "pur_pir",
]);

const TEXTO_VEREDICTO: Record<Veredicto, string> = {
  ok: "Cumple",
  warn: "Cumple con avisos",
  fail: "No cumple",
  neutral: "Sin veredicto",
};

/** Una capa con R directa (cámara/lámina) no expone λ → la sección la rotula como R. */
function esCapaAislante(c: ResultadoCapaHE1): boolean {
  return c.material != null && MATERIALES_AISLANTES.has(c.material);
}

/** `kind` del trazo de un cerramiento según su veredicto REAL (rojo si fail). */
function kindDeVeredicto(estado: Veredicto): Kind {
  return estado === "fail" ? "critical" : "normal";
}

// -----------------------------------------------------------------------------
// PANEL 1 — SECCIÓN del muro por capas (interior → exterior). Cada capa es un
// rectángulo de ancho ∝ espesor, etiquetado con material + espesor (mm) + λ
// (W/mK) o «R=… (cámara)». La capa AISLANTE se distingue MULTICANAL: relleno
// rayado (patrón de líneas, sin gradiente — Acrobat-safe) + etiqueta «AISLANTE»,
// no solo por color. Se marcan las caras interior/exterior.
// -----------------------------------------------------------------------------
function RellenoCapa({
  capa,
  geom,
  bodyY,
  bodyH,
  mode,
}: {
  capa: ResultadoCapaHE1;
  geom: { x: number; w: number; cx: number };
  bodyY: number;
  bodyH: number;
  mode: SvgMode;
}) {
  const pal = palette(mode);
  const aislante = esCapaAislante(capa);
  const fill = aislante ? pal.section : "none";
  // Patrón rayado dibujado a mano (segmentos diagonales) — sin <pattern>/gradiente
  // para fidelidad con el raster PDF. Refuerza visualmente la capa aislante.
  const rayas: number[] = [];
  if (aislante) {
    const step = 8;
    for (let xr = geom.x - bodyH; xr < geom.x + geom.w; xr += step) {
      rayas.push(xr);
    }
  }
  return (
    <g>
      {/* Marco del rectángulo de la capa (4 segmentos planos). */}
      <Seg x1={geom.x} y1={bodyY} x2={geom.x + geom.w} y2={bodyY} mode={mode} />
      <Seg x1={geom.x + geom.w} y1={bodyY} x2={geom.x + geom.w} y2={bodyY + bodyH} mode={mode} />
      <Seg x1={geom.x + geom.w} y1={bodyY + bodyH} x2={geom.x} y2={bodyY + bodyH} mode={mode} />
      <Seg x1={geom.x} y1={bodyY + bodyH} x2={geom.x} y2={bodyY} mode={mode} />

      {/* Relleno rayado de la capa aislante (diagonales recortadas a la caja). */}
      {aislante && (
        <g>
          {/* Tinte de fondo suave para reforzar (color secundario al patrón). */}
          <rect
            x={geom.x}
            y={bodyY}
            width={geom.w}
            height={bodyH}
            fill={fill}
            fillOpacity={0.12}
          />
          {rayas.map((xr) => {
            // Diagonal 45°: recortada a los bordes del rectángulo de la capa.
            const x1 = Math.max(geom.x, xr);
            const y1 = bodyY + (x1 - xr);
            const x2raw = xr + bodyH;
            const x2 = Math.min(geom.x + geom.w, x2raw);
            const y2 = bodyY + (x2 - xr);
            if (x2 <= x1) return null;
            return (
              <line
                key={`raya-${capa.id}-${xr}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={pal.section}
                strokeWidth={0.8}
              />
            );
          })}
        </g>
      )}
    </g>
  );
}

function PanelSeccion({
  cer,
  seccion,
  mode,
  compact,
}: {
  cer: ResultadoCerramientoHE1;
  seccion: SeccionGeom;
  mode: SvgMode;
  /** Esquema compacto (móvil): oculta las microetiquetas densas por capa. */
  compact: boolean;
}) {
  const { bodyY, bodyH, capas } = seccion;
  const yEtiquetas = bodyY + bodyH + 8;
  const yCaras = seccion.y0 + SEC_AXIS_H - 3;
  const xIni = capas.length > 0 ? capas[0].x : seccion.x0;
  const xFin = capas.length > 0 ? capas[capas.length - 1].x + capas[capas.length - 1].w : seccion.x0;

  return (
    <g>
      {/* Marcas de cara INTERIOR (izquierda) y EXTERIOR (derecha). */}
      <Tag x={xIni} y={yCaras} mode={mode} anchor="start" size={3.6}>
        ← interior
      </Tag>
      <Tag x={xFin} y={yCaras} mode={mode} anchor="end" size={3.6}>
        exterior →
      </Tag>

      {/* Rectángulos de capa (interior → exterior). */}
      {capas.map((g) => {
        const capa = cer.capas[g.i];
        return (
          <RellenoCapa
            key={`capa-${capa.id}`}
            capa={capa}
            geom={g}
            bodyY={bodyY}
            bodyH={bodyH}
            mode={mode}
          />
        );
      })}

      {/* Etiquetas por capa (debajo de la franja): nombre, espesor, λ o R. La
          etiqueta «AISLANTE» refuerza el patrón rayado (multicanal). El texto se
          alterna en dos alturas para que capas estrechas no se solapen.
          En COMPACTO (móvil) las microetiquetas de espesor y λ/R encogen hasta
          ser ilegibles: se ocultan (el dato fino vive en la tabla "Resultado").
          Se CONSERVA la etiqueta «AISLANTE» (sin la λ fina) como refuerzo
          multicanal del rayado. */}
      {capas.map((g) => {
        const capa = cer.capas[g.i];
        const aislante = esCapaAislante(capa);
        const dy = g.i % 2 === 0 ? 0 : 9;

        // Esquema compacto: solo la marca «AISLANTE» de la capa aislante.
        if (compact) {
          if (!aislante) return null;
          return (
            <Tag
              key={`lab-${capa.id}`}
              x={g.cx}
              y={yEtiquetas + dy}
              mode={mode}
              size={3.6}
              critical
            >
              AISLANTE
            </Tag>
          );
        }

        const espesorTxt = fmt(capa.espesor_m * 1000, "mm", 0);
        const propTxt =
          capa.lambda_W_mK != null
            ? `λ ${fmt(capa.lambda_W_mK, "W/mK", 2)}`
            : `R ${fmt(capa.resistencia_m2K_W, "m²K/W", 2)} (cámara)`;
        return (
          <g key={`lab-${capa.id}`}>
            {/* Línea guía fina del centro de la capa a su etiqueta. */}
            <Seg x1={g.cx} y1={bodyY + bodyH} x2={g.cx} y2={yEtiquetas - 6 + dy} mode={mode} base={0.5} />
            <Tag x={g.cx} y={yEtiquetas + dy} mode={mode} size={3.2}>
              {espesorTxt}
            </Tag>
            <Tag x={g.cx} y={yEtiquetas + 5 + dy} mode={mode} size={3} critical={aislante}>
              {aislante ? `AISLANTE · ${propTxt}` : propTxt}
            </Tag>
          </g>
        );
      })}
    </g>
  );
}

// -----------------------------------------------------------------------------
// PANEL 2 — BARRA U vs LÍMITE (MULTICANAL, WCAG 1.4.1). Pinta la U del
// cerramiento frente al límite MÁS restrictivo = min(Ulim, U_max_fRsi):
//   • Una escala horizontal [0 .. max(U, límite)·1,25].
//   • La barra de U: si U > límite → kind="critical" (rojo + trazo grueso
//     discontinuo) + etiqueta «U > Ulim». Si cumple → kind del veredicto.
//   • Una línea vertical en el límite, con su etiqueta numérica.
//   • Si Ulim es null (medianería) → no se pinta línea de límite; etiqueta
//     «Ulim no aplica» en neutro.
// El dato numérico (U y límite) va SIEMPRE en texto, no solo en la barra.
// -----------------------------------------------------------------------------
function PanelBarraU({
  cer,
  box,
  mode,
}: {
  cer: ResultadoCerramientoHE1;
  box: { x: number; y: number; w: number; h: number };
  mode: SvgMode;
}) {
  const { x, y, w, h } = box;
  const margenIzq = x + 4;
  const ejeY = y + h - 14;
  const ejeW = w - 8;

  // Límite más restrictivo: min(Ulim, U_max_fRsi). Medianería → solo U_max_fRsi.
  const limite =
    cer.ulim_W_m2K != null ? Math.min(cer.ulim_W_m2K, cer.uMaxFRsi_W_m2K) : cer.uMaxFRsi_W_m2K;
  const u = Number.isFinite(cer.u_W_m2K) ? cer.u_W_m2K : limite * 2;

  // Escala: encuadra U y el límite con holgura. Evita división por cero.
  const escalaMax = Math.max(u, limite, 0.1) * 1.25;
  const px = (valor: number) => margenIzq + (Math.max(0, valor) / escalaMax) * ejeW;

  const supera = cer.ulim_W_m2K != null && u > limite;
  const kind: Kind = supera ? "critical" : kindDeVeredicto(cer.estado);
  const xU = px(u);
  const xLim = px(limite);

  return (
    <g>
      {/* Título del sub-panel. */}
      <Tag x={x} y={y + 6} mode={mode} anchor="start" size={4}>
        U vs límite
      </Tag>

      {/* Eje base (0 → escalaMax). */}
      <Seg x1={margenIzq} y1={ejeY} x2={margenIzq + ejeW} y2={ejeY} mode={mode} base={0.8} />

      {/* Barra de U (desde 0 hasta U). MULTICANAL si supera el límite. */}
      <Seg x1={margenIzq} y1={ejeY - 7} x2={xU} y2={ejeY - 7} mode={mode} kind={kind} base={3} />
      <Tag x={xU} y={ejeY - 11} mode={mode} anchor="middle" size={3.6} critical={supera}>
        {`U ${fmt(cer.u_W_m2K, "W/m²K", 2)}`}
      </Tag>

      {/* Línea vertical del límite (solo si aplica) + etiqueta numérica. */}
      {cer.ulim_W_m2K != null ? (
        <g>
          <Seg x1={xLim} y1={ejeY - 16} x2={xLim} y2={ejeY + 2} mode={mode} base={1} />
          <Tag x={xLim} y={ejeY + 9} mode={mode} anchor="middle" size={3.2}>
            {`lím ${fmt(limite, "W/m²K", 2)}`}
          </Tag>
        </g>
      ) : (
        <Tag x={margenIzq + ejeW} y={ejeY + 9} mode={mode} anchor="end" size={3.4}>
          Ulim no aplica (medianería)
        </Tag>
      )}

      {/* Veredicto textual MULTICANAL: refuerza el color de la barra. */}
      <Tag x={x} y={y + h} mode={mode} anchor="start" size={3.6} critical={supera}>
        {supera ? "✗ U > Ulim" : cer.cumpleU ? "✓ U ≤ límite" : "△ revisar"}
      </Tag>
    </g>
  );
}

// -----------------------------------------------------------------------------
// PANEL 3 — DIAGRAMA de GLASER (presiones de vapor). Eje X = posicionSd (0..1,
// de interior a exterior); dos poligonales por las interfaces:
//   • Psat (saturación): línea de referencia (kind normal).
//   • Pvapor (real): si en ALGUNA interfaz Pvapor ≥ Psat (condensa) → kind
//     "critical" (rojo + trazo grueso discontinuo). Las interfaces con condensa
//     llevan punto rojo + aspa. Si `condensaIntersticial` → etiqueta
//     «condensación (revisar)» en el tono crítico (refuerzo textual del color).
// Las presiones (Pa) van también en texto en la ficha; aquí es una vista de
// tendencia, etiquetada con los extremos.
// -----------------------------------------------------------------------------
function PanelGlaser({
  glaser,
  box,
  mode,
  compact,
}: {
  glaser: ResultadoGlaserHE1;
  box: { x: number; y: number; w: number; h: number };
  mode: SvgMode;
  /** Esquema compacto (móvil): oculta las etiquetas finas de ejes/escala. */
  compact: boolean;
}) {
  const pal = palette(mode);
  const { x, y, w, h } = box;
  const margen = 8;
  const plotX0 = x + margen;
  const plotX1 = x + w - margen;
  const plotW = plotX1 - plotX0;
  const plotY0 = y + 12; // bajo el título
  const plotY1 = y + h - 14; // sobre el eje X
  const plotH = plotY1 - plotY0;

  const n = glaser.posicionSd.length;
  // Escala vertical común a las dos curvas: máximo de Psat y Pvapor (con holgura).
  const pmax = Math.max(
    1,
    ...glaser.psat_Pa.filter((v) => Number.isFinite(v)),
    ...glaser.pvapor_Pa.filter((v) => Number.isFinite(v)),
  );
  const escalaMax = pmax * 1.1;

  const sx = (sd: number) => plotX0 + Math.min(1, Math.max(0, sd)) * plotW;
  const sy = (p: number) => plotY1 - (Math.max(0, p) / escalaMax) * plotH;

  // Poligonales (cadenas de segmentos) — no <polyline> punteable por animación;
  // segmentos planos por compatibilidad PDF. Pvapor en crítico si condensa.
  const ptsPsat = glaser.psat_Pa.map((p, i) => ({ x: sx(glaser.posicionSd[i]), y: sy(p) }));
  const ptsPvap = glaser.pvapor_Pa.map((p, i) => ({ x: sx(glaser.posicionSd[i]), y: sy(p) }));
  const condensa = glaser.condensaIntersticial;
  const kindVap: Kind = condensa ? "critical" : "flow";

  return (
    <g>
      {/* Título del sub-panel. */}
      <Tag x={x} y={y + 6} mode={mode} anchor="start" size={4}>
        Glaser (vapor)
      </Tag>

      {/* Ejes: X (Sd 0→1) e Y (presión). */}
      <Seg x1={plotX0} y1={plotY1} x2={plotX1} y2={plotY1} mode={mode} base={0.8} />
      <Seg x1={plotX0} y1={plotY0} x2={plotX0} y2={plotY1} mode={mode} base={0.8} />

      {/* Curva Psat (saturación) — referencia. */}
      {ptsPsat.slice(0, -1).map((p, i) => (
        <Seg
          key={`psat-${i}`}
          x1={p.x}
          y1={p.y}
          x2={ptsPsat[i + 1].x}
          y2={ptsPsat[i + 1].y}
          mode={mode}
          base={1.2}
        />
      ))}

      {/* Curva Pvapor (real) — crítica (rojo/gruesa/discontinua) si condensa. */}
      {ptsPvap.slice(0, -1).map((p, i) => (
        <Seg
          key={`pvap-${i}`}
          x1={p.x}
          y1={p.y}
          x2={ptsPvap[i + 1].x}
          y2={ptsPvap[i + 1].y}
          mode={mode}
          kind={kindVap}
          base={1.2}
        />
      ))}

      {/* Interfaces con condensación: punto rojo + aspa (multicanal, no solo color). */}
      {glaser.condensa.map((cond, i) =>
        cond ? (
          <g key={`cond-${i}`}>
            <Dot x={ptsPvap[i].x} y={ptsPvap[i].y} r={2.4} mode={mode} kind="critical" />
            <line
              x1={ptsPvap[i].x - 3}
              y1={ptsPvap[i].y - 3}
              x2={ptsPvap[i].x + 3}
              y2={ptsPvap[i].y + 3}
              stroke={pal.critical}
              strokeWidth={1.4}
            />
            <line
              x1={ptsPvap[i].x - 3}
              y1={ptsPvap[i].y + 3}
              x2={ptsPvap[i].x + 3}
              y2={ptsPvap[i].y - 3}
              stroke={pal.critical}
              strokeWidth={1.4}
            />
          </g>
        ) : null,
      )}

      {/* Marcas del eje X (interior / exterior) y leyenda de curvas. En COMPACTO
          (móvil) estas etiquetas finas (size 3) encogen hasta ser ilegibles: se
          ocultan; el diagrama queda como esquema de tendencia. El título grande
          «Glaser (vapor)» y las marcas de condensación se conservan siempre. */}
      {!compact && (
        <g>
          <Tag x={plotX0} y={plotY1 + 8} mode={mode} anchor="start" size={3}>
            int. (Sd 0)
          </Tag>
          <Tag x={plotX1} y={plotY1 + 8} mode={mode} anchor="end" size={3}>
            ext. (Sd 1)
          </Tag>
          <Tag x={plotX0} y={plotY0 - 1} mode={mode} anchor="start" size={3}>
            Psat / Pvapor
          </Tag>
        </g>
      )}

      {/* Etiqueta de condensación intersticial (refuerzo textual del color). */}
      {condensa && (
        <Tag x={plotX1} y={plotY0 + 5} mode={mode} anchor="end" size={3.4} critical>
          condensación (revisar)
        </Tag>
      )}
      {!condensa && n > 0 && (
        <Tag x={plotX1} y={plotY0 + 5} mode={mode} anchor="end" size={3.2}>
          sin condensación
        </Tag>
      )}
    </g>
  );
}

// -----------------------------------------------------------------------------
// Fila completa de un cerramiento: título (nombre + tipo + veredicto) + los tres
// paneles. El veredicto del cerramiento se rotula MULTICANAL (marca textual +
// tono) en el título.
// -----------------------------------------------------------------------------
const VEREDICTO_MARCA: Record<Veredicto, string> = {
  ok: "✓ cumple",
  warn: "△ aviso",
  fail: "✗ incumple",
  neutral: "· no aplica",
};

function FilaCerramiento({
  fila,
  mode,
  compact,
}: {
  fila: CerramientoGeom;
  mode: SvgMode;
  compact: boolean;
}) {
  const { cer, rowY, seccion, ubar, glaser } = fila;
  const critico = cer.estado === "fail";
  return (
    <g>
      {/* Título de la fila: nombre del cerramiento + veredicto multicanal. */}
      <Tag x={0} y={rowY + 9} mode={mode} anchor="start" size={4.6} critical={critico}>
        {`${cer.nombre} — ${VEREDICTO_MARCA[cer.estado]}`}
      </Tag>

      <PanelSeccion cer={cer} seccion={seccion} mode={mode} compact={compact} />
      {/* PanelBarraU no recibe `compact`: todas sus etiquetas (título, «U …»,
          línea/etiqueta del límite y veredicto) están en la lista de las que
          deben permanecer SIEMPRE, así que no cambia entre modos. */}
      <PanelBarraU cer={cer} box={ubar} mode={mode} />
      <PanelGlaser glaser={cer.glaser} box={glaser} mode={mode} compact={compact} />
    </g>
  );
}

// -----------------------------------------------------------------------------
// Descripción accesible (WCAG 1.4.1): resumen del resultado (zona climática,
// nº de cerramientos que cumplen, condensaciones) + cómo se codifica el elemento
// crítico. Texto en español. El SVG COMPLEMENTA, nunca sustituye, a los
// resultados en texto/tabla de la UI/ficha.
// -----------------------------------------------------------------------------
function describir(result: HE1Result): string {
  const n = result.porCerramiento.length;
  const cumplenU = result.porCerramiento.filter((c) => c.cumpleU).length;
  const conCondensacion = result.porCerramiento.filter((c) => c.glaser.condensaIntersticial).length;
  const condTxt =
    conCondensacion === 0
      ? "Sin condensación intersticial en enero."
      : `${conCondensacion} cerramiento(s) con posible condensación intersticial en enero (revisar).`;
  return (
    `Envolvente térmica (DB-HE1): por cada cerramiento se muestra la sección por ` +
    `capas (interior a exterior, con el aislante destacado), la barra de transmitancia ` +
    `U frente a su límite, y el diagrama de Glaser de presiones de vapor. ` +
    `Zona climática ${result.zonaClimatica}. Veredicto global: ` +
    `${TEXTO_VEREDICTO[result.veredictoGlobal]}. ${cumplenU} de ${n} cerramientos cumplen U ≤ Ulim. ` +
    `${condTxt} ` +
    `El cerramiento que no cumple se resalta con color rojo, trazo grueso discontinuo y ` +
    `la etiqueta «U > Ulim»; las interfaces donde condensa el vapor llevan punto rojo y aspa.`
  );
}

export function He1SVG({ result, mode, width, height }: He1SVGProps) {
  const layout = calcularLayout(result);

  // Esquema COMPACTO en pantallas estrechas (móvil): oculta las microetiquetas
  // densas (espesor/λ por capa, ejes finos del Glaser) que encogen hasta ser
  // ilegibles al escalar el viewBox. Nunca en PDF (se rasteriza a `nativeW`
  // grande y debe llevar todo el detalle). Los datos finos viven en la tabla
  // de la pestaña "Resultado". → ./svg-meta (esCompacto / COMPACT_WIDTH).
  const compact = esCompacto(mode, width);

  // viewBox auto-encuadrado a partir de los DATOS (esquinas del contenido) +
  // padding (helper fitViewBox; no getBBox del DOM). Reserva extra abajo para la
  // banda de veredicto global. El contenido arranca en (0,0).
  const esquinas = [
    { x: 0, y: 0 },
    { x: layout.contentW, y: layout.contentH },
  ];
  const [vbX, vbY, vbW, vbHRaw] = fitViewBox(esquinas, VB_PAD);
  const vbH = vbHRaw + BANDA_TOTALES;
  const viewBox: [number, number, number, number] = [vbX, vbY, vbW, vbH];

  const yTotales = vbY + vbH - 6;
  const xTotales = vbX + vbW / 2;
  const cumplenU = result.porCerramiento.filter((c) => c.cumpleU).length;

  return (
    <DiagramSvg
      viewBox={viewBox}
      width={width}
      height={height}
      mode={mode}
      title="Envolvente térmica (DB-HE1): sección, transmitancia y Glaser"
      desc={describir(result)}
    >
      {/* Una fila por cerramiento, apiladas verticalmente. */}
      {layout.filas.map((fila) => (
        <FilaCerramiento key={fila.cer.id} fila={fila} mode={mode} compact={compact} />
      ))}

      {/* Banda de totales (el dato numérico también va en texto, no solo SVG). */}
      <Tag x={xTotales} y={yTotales} mode={mode} size={4.2}>
        {`Zona ${result.zonaClimatica} · ${cumplenU}/${result.porCerramiento.length} cumplen U ≤ Ulim · ${TEXTO_VEREDICTO[result.veredictoGlobal]}`}
      </Tag>
    </DiagramSvg>
  );
}
