// DB-HE1 — El dibujo de la justificación (feature-15, HE1): la sección del
// cerramiento seleccionado (fachada a escala con la curva de temperaturas,
// cubierta y suelo por capas, alzado de la ventana). Componente PURO de render
// sobre `calcularDibujoHe1`.
//
// En pantalla las cifras van FUERA del SVG (etiquetas HTML); en papel, DENTRO,
// con colores fijos (los tintes se calculan en hexadecimal: svg2pdf no resuelve
// `color-mix`).

import { useId, type JSX, type ReactNode } from "react";
import { estadosElementos } from "../../lib/cte/estados";
import type { EstadoPresentacion } from "../../lib/cte/presentacion";
import type { SvgMode } from "../../lib/svg/helpers";
import { FUENTE_MONO, FUENTE_SANS, PALETA_PANTALLA, PALETA_PAPEL, type PaletaSeccion } from "../../lib/svg/paletaSeccion";
import { calcularDibujoHe1, type DibujoHe1Geo, type DibujoHorizontal, type DibujoMuro, type DibujoVentana, type PatronCapa } from "./dibujo";
import type { JustificacionHe1 } from "./justificacion";
import { describirDibujoHe1, textoEtiqueta } from "./textos";

interface DibujoHe1Props {
  geo: DibujoHe1Geo;
  mode: SvgMode;
  width: number;
  height: number;
  titulo: string;
  descripcion: string;
  seleccion?: string | null;
  estados: Record<string, EstadoPresentacion>;
  textos?: Record<string, string>;
  onSelect?: (elementoId: string) => void;
}

/** Mezcla dos colores hexadecimales (#rrggbb): `pct` % de `c` sobre `fondo`. */
function mezclaHex(c: string, pct: number, fondo: string): string {
  const a = c.replace("#", "");
  const b = fondo.replace("#", "");
  const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  const m = [0, 2, 4].map((i) => Math.round((ch(a, i) * pct + ch(b, i) * (100 - pct)) / 100));
  return `#${m.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

interface Ctx {
  P: PaletaSeccion;
  uid: string;
  mode: SvgMode;
  sel: string | null;
  estados: Record<string, EstadoPresentacion>;
  tinte: (c: string, pct: number) => string;
  pulsable: (key: string, id: string, contenido: ReactNode) => ReactNode;
  color: (id: string, base?: string) => string;
}

function relleno(p: PatronCapa, c: Ctx): string {
  const { P, uid, tinte } = c;
  switch (p) {
    case "ladrillo":
      return `url(#${uid}-ladrillo)`;
    case "hormigon":
      return `url(#${uid}-hormigon)`;
    case "aislante":
      return `url(#${uid}-aislante)`;
    case "camara":
      return P.fondo;
    case "lamina":
      return P.ink;
    case "pavimento":
      return tinte(P.ink, 22);
    case "grava":
      return `url(#${uid}-grava)`;
    case "teja":
      return tinte(P.fail, 16);
    case "yeso":
    case "mortero":
      return P.slab;
  }
}

export function DibujoHe1({
  geo,
  mode,
  width,
  height,
  titulo,
  descripcion,
  seleccion = null,
  estados,
  textos = {},
  onSelect,
}: DibujoHe1Props): JSX.Element {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const P = mode === "pdf" ? PALETA_PAPEL : PALETA_PANTALLA;
  const interactivo = mode === "screen" && onSelect !== undefined;
  const sel = mode === "screen" ? seleccion : null;
  const tinte = (c: string, pct: number) =>
    mode === "pdf" ? mezclaHex(c, pct, P.fondo) : `color-mix(in srgb, ${c} ${pct}%, ${P.fondo})`;
  const color = (id: string, base = P.ink): string => {
    if (id === sel) return P.accent;
    const e = estados[id];
    if (e === "ko") return P.fail;
    if (e === "rv" && mode === "screen") return P.warn;
    return base;
  };
  const pulsable = (key: string, id: string, contenido: ReactNode): ReactNode =>
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
      </g>
    ) : (
      <g key={key}>{contenido}</g>
    );
  const c: Ctx = { P, uid, mode, sel, estados, tinte, pulsable, color };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${geo.ancho} ${geo.alto}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby={`${uid}-t ${uid}-d`}
      data-mode={mode}
      style={{ display: "block" }}
    >
      <title id={`${uid}-t`}>{titulo}</title>
      <desc id={`${uid}-d`}>{descripcion}</desc>
      <defs>
        <pattern id={`${uid}-ladrillo`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill={tinte(P.fail, 7)} />
          <line x1="0" y1="0" x2="0" y2="7" stroke={P.texto3} strokeWidth="0.8" />
        </pattern>
        <pattern id={`${uid}-hormigon`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <rect width="5" height="5" fill={P.slab} />
          <line x1="0" y1="0" x2="0" y2="5" stroke={P.texto3} strokeWidth="0.5" />
        </pattern>
        <pattern id={`${uid}-aislante`} width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill={tinte(P.warn, 16)} />
          <circle cx="2" cy="2" r="0.8" fill={P.warn} />
        </pattern>
        <pattern id={`${uid}-grava`} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill={P.fondo} />
          <circle cx="2" cy="3" r="1.6" fill="none" stroke={P.texto3} strokeWidth="0.8" />
          <circle cx="6" cy="6.5" r="1.2" fill="none" stroke={P.texto3} strokeWidth="0.8" />
        </pattern>
        <marker id={`${uid}-m`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill={P.texto3} />
        </marker>
      </defs>
      {mode === "pdf" && <rect x={0} y={0} width={geo.ancho} height={geo.alto} fill={P.fondo} />}
      {geo.tipo === "muro" && <Muro g={geo} c={c} />}
      {geo.tipo === "horizontal" && <Horizontal g={geo} c={c} />}
      {geo.tipo === "ventana" && <Ventana g={geo} c={c} />}
      {mode === "pdf" &&
        geo.etiquetas.map((e) => {
          const t = textos[e.elementoId];
          if (!t) return null;
          const w = t.length * 6.2 + 12;
          return (
            <g key={e.key}>
              <rect x={e.x - w / 2} y={e.y - 9} width={w} height={18} rx={3} fill={P.fondo} stroke={P.caja} />
              <text x={e.x} y={e.y + 4} fontSize={10.5} textAnchor="middle" fontFamily={FUENTE_MONO} fill={P.texto}>
                {t}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

function Muro({ g, c }: { g: DibujoMuro; c: Ctx }): JSX.Element {
  const { P } = c;
  const h = g.yBot - g.yTop;
  return (
    <>
      <text x={16} y={200} fontSize={11} fontFamily={FUENTE_MONO} fill={P.texto2} letterSpacing="0.08em">
        {g.interior.texto}
      </text>
      <text x={16} y={216} fontSize={10.5} fontFamily={FUENTE_SANS} fill={P.texto3}>
        {g.interior.sub}
      </text>
      {c.pulsable(
        "muro",
        "fachada",
        <>
          {g.capas.map((k) => (
            <rect key={k.id} x={k.x0} y={g.yTop} width={k.x1 - k.x0} height={h} fill={relleno(k.patron, c)} stroke={P.ink} strokeWidth={0.6} />
          ))}
          <rect x={g.x0} y={g.yTop} width={g.xe - g.x0} height={h} fill="none" stroke={c.color("fachada", "transparent")} strokeWidth={2} />
        </>,
      )}
      {g.capas.map((k) => {
        const cx = (k.x0 + k.x1) / 2;
        const r = Math.max(5, Math.min(9, (k.x1 - k.x0) / 2 + 2));
        return (
          <g key={`n-${k.id}`}>
            <circle cx={cx} cy={50} r={r} fill={P.fondo} stroke={P.texto3} strokeWidth={0.8} />
            <text x={cx} y={53.5} fontSize={r < 8 ? 8.5 : 10} textAnchor="middle" fontFamily={FUENTE_MONO} fill={P.texto2}>
              {k.numero}
            </text>
            <text x={cx} y={316} fontSize={9.5} textAnchor="middle" fontFamily={FUENTE_MONO} fill={P.texto3}>
              {Math.round(k.espesor_mm)}
            </text>
          </g>
        );
      })}
      <polyline points={g.curva} fill="none" stroke={P.accent} strokeWidth={1.8} strokeLinejoin="round" />
      {g.temperaturas.map((t, i) => (
        <text key={`t-${i}`} x={t.x} y={t.y} fontSize={10} textAnchor={t.ancla} fontFamily={FUENTE_MONO} fill={P.accent}>
          {t.texto}
        </text>
      ))}
      {g.condensa.map((p, i) => (
        <g key={`c-${i}`} stroke={P.warn} strokeWidth={1.8}>
          <line x1={p.x - 5} y1={p.y - 5} x2={p.x + 5} y2={p.y + 5} />
          <line x1={p.x - 5} y1={p.y + 5} x2={p.x + 5} y2={p.y - 5} />
        </g>
      ))}
      <text x={g.exterior.x} y={200} fontSize={11} fontFamily={FUENTE_MONO} fill={P.texto2} letterSpacing="0.08em">
        {g.exterior.texto}
      </text>
      <text x={g.exterior.x} y={216} fontSize={10.5} fontFamily={FUENTE_SANS} fill={P.texto3}>
        {g.exterior.sub}
      </text>
      <g stroke={P.texto3} strokeWidth={0.8}>
        <line x1={g.cota.x0} y1={g.cota.y} x2={g.cota.x1} y2={g.cota.y} />
        <line x1={g.cota.x0} y1={g.cota.y - 5} x2={g.cota.x0} y2={g.cota.y + 5} />
        <line x1={g.cota.x1} y1={g.cota.y - 5} x2={g.cota.x1} y2={g.cota.y + 5} />
      </g>
      <text x={(g.cota.x0 + g.cota.x1) / 2} y={g.cota.y + 18} fontSize={10.5} textAnchor="middle" fontFamily={FUENTE_MONO} fill={P.texto2}>
        {g.cota.texto}
      </text>
    </>
  );
}

function Horizontal({ g, c }: { g: DibujoHorizontal; c: Ctx }): JSX.Element {
  const { P } = c;
  const yFin = g.capas[g.capas.length - 1]?.y1 ?? 80;
  return (
    <>
      <text x={g.x0} y={70} fontSize={11} fontFamily={FUENTE_MONO} fill={P.texto2} letterSpacing="0.06em">
        {g.arriba}
      </text>
      {c.pulsable(
        "capas",
        g.rol,
        <>
          {g.capas.map((k) => (
            <rect
              key={k.id}
              x={g.x0}
              y={k.y0}
              width={g.x1 - g.x0}
              height={k.y1 - k.y0}
              fill={relleno(k.patron, c)}
              stroke={P.ink}
              strokeWidth={0.6}
              strokeDasharray={k.computa ? undefined : "3 3"}
            />
          ))}
          <rect x={g.x0} y={g.capas.find((k) => k.computa)?.y0 ?? 80} width={g.x1 - g.x0} height={yFin - (g.capas.find((k) => k.computa)?.y0 ?? 80)} fill="none" stroke={c.color(g.rol, "transparent")} strokeWidth={2} />
        </>,
      )}
      {g.rotulos.map((r, i) => (
        <g key={`r-${i}`}>
          <polyline points={`${g.x1},${r.yCapa} ${g.x1 + 12},${r.yCapa} ${g.x1 + 20},${r.y - 4}`} fill="none" stroke={P.texto3} strokeWidth={0.8} />
          <text x={g.x1 + 26} y={r.y} fontSize={10.5} fontFamily={FUENTE_SANS} fontWeight={r.aislante ? 600 : 400} fill={r.aislante ? P.texto : P.texto2}>
            {r.texto}
          </text>
        </g>
      ))}
      <text x={g.x0} y={yFin + 28} fontSize={11} fontFamily={FUENTE_MONO} fill={P.texto2} letterSpacing="0.06em">
        {g.abajo}
      </text>
    </>
  );
}

function Ventana({ g, c }: { g: DibujoVentana; c: Ctx }): JSX.Element {
  const { P } = c;
  return (
    <>
      {c.pulsable(
        "ventana",
        "ventanas",
        <>
          <rect x={g.marco.x} y={g.marco.y} width={g.marco.w} height={g.marco.h} fill={P.slab} stroke={c.color("ventanas", P.ink)} strokeWidth={1.4} />
          <rect x={g.montante.x} y={g.montante.y0} width={g.montante.w} height={g.montante.y1 - g.montante.y0} fill={P.slab} stroke={P.ink} strokeWidth={0.6} />
          {g.vidrios.map((v, i) => (
            <rect key={i} x={v.x} y={v.y} width={v.w} height={v.h} fill={c.tinte(P.accent, 9)} stroke={P.ink} strokeWidth={0.8} />
          ))}
        </>,
      )}
      {g.guias.map((l, i) => (
        <line key={i} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke={P.texto3} strokeWidth={0.8} />
      ))}
      {g.textos.map((t, i) => (
        <text key={i} x={t.x} y={t.y} fontSize={t.fuerte ? 11.5 : 10.5} fontWeight={t.fuerte ? 600 : 400} fontFamily={FUENTE_SANS} fill={t.fuerte ? P.texto : P.texto2}>
          {t.texto}
        </text>
      ))}
      {g.cotas.map((t, i) => (
        <text key={i} x={t.x} y={t.y} fontSize={10.5} textAnchor={t.ancla} fontFamily={FUENTE_MONO} fill={P.texto2}>
          {t.texto}
        </text>
      ))}
    </>
  );
}

/** El dibujo de HE1 en papel (la fachada), para el clon oculto que rasteriza la ficha. */
export function DibujoPdfHe1({
  j,
  revisados,
  width,
  height,
}: {
  j: JustificacionHe1;
  revisados: readonly string[];
  width: number;
  height: number;
}): JSX.Element {
  const estados = estadosElementos(j.elementos, j.avisos, revisados);
  const textos = Object.fromEntries(j.elementos.map((el) => [el.id, textoEtiqueta(el)]));
  return (
    <DibujoHe1
      geo={calcularDibujoHe1(j, "fachada")}
      mode="pdf"
      width={width}
      height={height}
      titulo="Sección de la fachada (DB-HE1)"
      descripcion={describirDibujoHe1(j, "fachada")}
      estados={estados}
      textos={textos}
    />
  );
}
