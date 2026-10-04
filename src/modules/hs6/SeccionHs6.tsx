// DB-HS6 — El dibujo de la justificación (feature-15, HS6): la sección por lo
// que toca el terreno. Componente PURO de render sobre `calcularSeccionHs6`.
//
// En pantalla las cifras van FUERA del SVG (etiquetas HTML); en papel, DENTRO,
// con colores fijos. Estado multicanal: lo que no cumple, en rojo y discontinuo;
// lo seleccionado, en el acento y más grueso; lo que se revisa, en ámbar.

import { useId, type JSX, type ReactNode } from "react";
import { estadosElementos } from "../../lib/cte/estados";
import type { EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Edificio } from "../../lib/edificio/tipos";
import type { SvgMode } from "../../lib/svg/helpers";
import { FUENTE_MONO, FUENTE_SANS, PALETA_PANTALLA, PALETA_PAPEL } from "../../lib/svg/paletaSeccion";
import type { JustificacionHs6 } from "./justificacion";
import { calcularSeccionHs6, SECCION_HS6, zonasPbDe, type SeccionHs6Geo } from "./seccion";
import { describirSeccionHs6, textoEtiqueta } from "./textos";

interface SeccionHs6Props {
  seccion: SeccionHs6Geo;
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

export function SeccionHs6({
  seccion: s,
  mode,
  width,
  height,
  titulo,
  descripcion,
  seleccion = null,
  estados,
  textos = {},
  onSelect,
}: SeccionHs6Props): JSX.Element {
  const S = SECCION_HS6;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const P = mode === "pdf" ? PALETA_PAPEL : PALETA_PANTALLA;
  const interactivo = mode === "screen" && onSelect !== undefined;
  const sel = mode === "screen" ? seleccion : null;
  const tinte = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, ${P.fondo})`;

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

  const yPb = S.Y_PB_SUELO;
  const so = s.sotano;
  const te = s.terreno;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${s.ancho} ${s.alto}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-labelledby={`${uid}-t ${uid}-d`}
      data-mode={mode}
      style={{ display: "block" }}
    >
      <title id={`${uid}-t`}>{titulo}</title>
      <desc id={`${uid}-d`}>{descripcion}</desc>
      <defs>
        <pattern id={`${uid}-tierra`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={P.earth} strokeWidth="1.2" />
        </pattern>
        <marker id={`${uid}-m`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill={P.texto3} />
        </marker>
      </defs>
      {mode === "pdf" && <rect x={0} y={0} width={s.ancho} height={s.alto} fill={P.fondo} />}

      {/* Terreno */}
      <rect x={0} y={yPb + 2} width={S.X0 - 12} height={s.alto - yPb} fill={`url(#${uid}-tierra)`} />
      <rect x={S.X1 + 8} y={yPb + 2} width={s.ancho - S.X1 - 8} height={s.alto - yPb} fill={`url(#${uid}-tierra)`} />
      {s.terrenoBajo.map((t, i) => (
        <rect key={`tb-${i}`} x={t.x0} y={t.y} width={t.x1 - t.x0} height={s.alto - t.y} fill={`url(#${uid}-tierra)`} />
      ))}
      <line x1={0} y1={yPb} x2={S.X0 - 8} y2={yPb} stroke={P.ink} strokeWidth={1.5} />
      <line x1={S.X1 + 4} y1={yPb} x2={s.ancho} y2={yPb} stroke={P.ink} strokeWidth={1.5} />

      {/* Plantas altas */}
      {s.altas &&
        pulsable(
          "altas",
          "no-tocan",
          <>
            <rect x={S.X0} y={S.Y_ALTAS} width={S.X1 - S.X0} height={S.Y_PB_TECHO - S.Y_ALTAS - S.LOSA} fill={tinte(P.slab, 50)} />
            <text x={S.X0 + 16} y={S.Y_ALTAS + 40} fontSize={12} fontFamily={FUENTE_SANS} fill={P.texto2}>
              {s.altas.texto}
            </text>
            <text x={S.X0 + 16} y={S.Y_ALTAS + 56} fontSize={10.5} fontFamily={FUENTE_SANS} fill={P.texto3}>
              {s.altas.sub}
            </text>
          </>,
        )}
      <rect x={S.X0} y={S.Y_PB_TECHO - S.LOSA} width={S.X1 - S.X0} height={S.LOSA} fill={P.slab} />

      {/* Planta baja */}
      <line x1={S.X0} y1={S.Y_PB_TECHO} x2={S.X0} y2={yPb} stroke={P.wall} strokeWidth={1.5} />
      <line x1={S.X1} y1={S.Y_PB_TECHO} x2={S.X1} y2={yPb} stroke={P.wall} strokeWidth={1.5} />
      {s.zonasPb.map((z, i) => (
        <g key={`z-${i}`}>
          {i > 0 && <line x1={z.x0} y1={S.Y_PB_TECHO + 10} x2={z.x0} y2={yPb - 6} stroke={P.wall} strokeWidth={1} strokeDasharray="3 4" />}
          <text x={z.xTexto} y={S.Y_PB_TECHO + 30} fontSize={z.x1 - z.x0 < 110 ? 10.5 : 12} fontFamily={FUENTE_SANS} fill={P.texto2}>
            {z.texto}
          </text>
        </g>
      ))}
      {so && te && (
        <text x={te.x0 + 12} y={yPb - 24} fontSize={10} fontFamily={FUENTE_SANS} fill={P.texto3}>
          {te.texto}
        </text>
      )}
      <text x={S.X0 + 8} y={yPb - 10} fontSize={10} fontFamily={FUENTE_MONO} fill={P.texto3}>
        PB
      </text>
      <rect x={S.X0} y={yPb} width={S.X1 - S.X0} height={S.LOSA} fill={P.slab} />

      {/* Sótano: el espacio de contención */}
      {so &&
        pulsable(
          "sotano",
          "contencion-garaje",
          <>
            <rect x={so.x0 - 8} y={yPb + S.LOSA} width={8} height={S.Y_SOTANO - yPb - S.LOSA} fill={P.fondo} stroke={P.ink} strokeWidth={0.8} />
            <rect x={so.x1} y={yPb + S.LOSA} width={8} height={S.Y_SOTANO - yPb - S.LOSA} fill={P.fondo} stroke={P.ink} strokeWidth={0.8} />
            <rect x={so.x0 - 8} y={S.Y_SOTANO - 8} width={so.x1 - so.x0 + 16} height={8} fill={P.fondo} stroke={P.ink} strokeWidth={0.8} />
            <text x={so.xRotulo} y={yPb + 32} fontSize={12} fontFamily={FUENTE_SANS} fill={color("contencion-garaje", P.texto2)}>
              {so.texto}
            </text>
            <text x={so.xRotulo} y={yPb + 48} fontSize={10.5} fontFamily={FUENTE_SANS} fill={P.texto3}>
              {so.sub}
            </text>
            <g stroke={P.texto3} strokeWidth={1.6} markerEnd={`url(#${uid}-m)`}>
              <line x1={so.flecha[0]} y1={yPb + 92} x2={so.flecha[1]} y2={yPb + 92} strokeDasharray="5 4" />
            </g>
          </>,
        )}

      {/* Lo que apoya en el terreno: cámara o despresurización */}
      {te && s.camara &&
        pulsable(
          "camara",
          "camara",
          <>
            <rect x={te.x0} y={S.Y_CAMARA - 4} width={te.x1 - te.x0} height={4} fill={P.slab} />
            {[0.25, 0.6].map((f) => (
              <line
                key={f}
                x1={te.x0 + (te.x1 - te.x0) * f}
                y1={yPb + S.LOSA}
                x2={te.x0 + (te.x1 - te.x0) * f}
                y2={S.Y_CAMARA - 4}
                stroke={P.wall}
                strokeWidth={1.2}
              />
            ))}
            <g stroke={color("camara", P.texto3)} strokeWidth={1.6} markerEnd={`url(#${uid}-m)`}>
              <line x1={te.flechaCamara[0]} y1={yPb + 22} x2={te.flechaCamara[1]} y2={yPb + 22} strokeDasharray="5 4" />
            </g>
          </>,
        )}
      {te && s.despresurizacion &&
        pulsable(
          "despr",
          "despresurizacion",
          <>
            <rect x={te.x0} y={yPb + S.LOSA} width={te.x1 - te.x0} height={22} fill={tinte(P.slab, 70)} />
            <line
              x1={te.x0 + 12}
              y1={yPb + S.LOSA + 11}
              x2={te.x1 - 12}
              y2={yPb + S.LOSA + 11}
              stroke={color("despresurizacion", P.ink)}
              strokeWidth={2}
              strokeDasharray="2 3"
            />
            <path d={`M${te.xConducto < te.x0 ? te.x0 + 12 : te.x1 - 12} ${yPb + S.LOSA + 11}H${te.xConducto}V${S.Y_ALTAS - 16}`} stroke={color("despresurizacion", P.ink)} strokeWidth={2.4} fill="none" />
            <circle cx={te.xConducto} cy={S.Y_ALTAS - 22} r={6} fill={P.fondo} stroke={color("despresurizacion", P.ink)} strokeWidth={1.4} />
          </>,
        )}

      {/* Núcleo de escalera y ascensor */}
      {s.nucleo &&
        pulsable(
          "nucleo",
          "nucleo",
          <>
            <rect
              x={s.nucleo.x0}
              y={S.Y_PB_TECHO}
              width={s.nucleo.x1 - s.nucleo.x0}
              height={S.Y_SOTANO - 12 - S.Y_PB_TECHO}
              fill={sel === "nucleo" ? tinte(P.accent, 12) : estados.nucleo === "rv" && mode === "screen" ? tinte(P.warn, 10) : P.fondo}
              stroke={color("nucleo", P.ink)}
              strokeWidth={1.4}
            />
            <text x={(s.nucleo.x0 + s.nucleo.x1) / 2} y={S.Y_SOTANO - 56} fontSize={9.5} textAnchor="middle" fontFamily={FUENTE_SANS} fill={P.texto3}>
              esc.
            </text>
            <text x={(s.nucleo.x0 + s.nucleo.x1) / 2} y={S.Y_SOTANO - 44} fontSize={9.5} textAnchor="middle" fontFamily={FUENTE_SANS} fill={P.texto3}>
              asc.
            </text>
          </>,
        )}

      {/* La barrera */}
      {s.barrera &&
        pulsable(
          "barrera",
          "barrera",
          <path d={s.barrera.d} stroke={color("barrera", P.accent)} strokeWidth={sel === "barrera" ? 4.5 : 3.5} fill="none" opacity={sel === "barrera" ? 1 : 0.85} />,
        )}

      {/* El radón sube del terreno */}
      <g stroke={P.texto3} strokeWidth={1.6} markerEnd={`url(#${uid}-m)`}>
        {s.radon.map((r, i) => (
          <line key={`rn-${i}`} x1={r.x} y1={r.y0} x2={r.x} y2={r.y1} />
        ))}
      </g>
      {s.radon.map((r, i) => (
        <text key={`rt-${i}`} x={r.x + 6} y={r.y0 - 2} fontSize={10} fontFamily={FUENTE_MONO} fill={P.texto3}>
          Rn
        </text>
      ))}
      <text x={s.ancho} y={s.alto - 4} fontSize={10.5} textAnchor="end" fontFamily={FUENTE_SANS} fill={P.texto3}>
        {s.rotuloTerreno}
      </text>

      {mode === "pdf" &&
        s.etiquetas.map((e) => {
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

/** El dibujo de HS6 en papel, para el clon oculto que rasteriza la ficha. */
export function DibujoPdfHs6({
  j,
  edificio,
  revisados,
  width,
  height,
}: {
  j: JustificacionHs6;
  edificio: Edificio;
  revisados: readonly string[];
  width: number;
  height: number;
}): JSX.Element {
  const estados = estadosElementos(j.elementos, j.avisos, revisados);
  const textos = Object.fromEntries(j.elementos.map((el) => [el.id, textoEtiqueta(el)]));
  return (
    <SeccionHs6
      seccion={calcularSeccionHs6(j, zonasPbDe(edificio))}
      mode="pdf"
      width={width}
      height={height}
      titulo="Sección por lo que toca el terreno (DB-HS6)"
      descripcion={describirSeccionHs6(j)}
      estados={estados}
      textos={textos}
    />
  );
}
