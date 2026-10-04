// DB-HS5 — La SECCIÓN del edificio con su red de evacuación (feature-14 §I).
// Componente PURO de render sobre la geometría de `./seccion` (`calcularSeccion`).
//
// En pantalla, las cifras van FUERA del SVG, como botones HTML sobre las anclas
// (`DibujoConEtiquetas`); el SVG se puede pulsar con el ratón para seleccionar
// tramos sin etiqueta (ramales, ventilación, arqueta). En papel (`mode="pdf"`)
// las cifras van DENTRO, como texto sobre un recuadro, y los colores son fijos
// (las variables CSS no se resuelven al rasterizar el SVG suelto).
//
// Estado multicanal: lo que no cumple va en rojo Y discontinuo; lo previsto,
// discontinuo; lo seleccionado, en el acento y más grueso. El texto del estado
// lo dan las etiquetas y la lista, nunca solo el color.

import { useId, type JSX, type ReactNode } from "react";
import { PisosSeccion } from "../../components/edificio/PisosSeccion";
import { FUENTE_MONO, FUENTE_SANS, PALETA_PANTALLA, PALETA_PAPEL } from "../../lib/svg/paletaSeccion";
import type { EstadoPresentacion } from "../../lib/cte/presentacion";
import type { SvgMode } from "../../lib/svg/helpers";
import type { Edificio } from "../../lib/edificio/tipos";
import type { JustificacionHs5 } from "./justificacion";
import { calcularSeccion, SECCION, type Seccion } from "./seccion";
import { HS5SVG } from "./svg";
import { describirSeccion, estadoDe, textoEtiqueta } from "./textos";

const PANTALLA = PALETA_PANTALLA;
const PAPEL = PALETA_PAPEL;
const MONO = FUENTE_MONO;
const SANS = FUENTE_SANS;

interface SeccionHs5Props {
  seccion: Seccion;
  mode: SvgMode;
  width: number;
  height: number;
  /** Título y descripción accesibles. */
  titulo: string;
  descripcion: string;
  seleccion?: string | null;
  /** Estado de cada elemento (para el color y el trazo). */
  estados: Record<string, EstadoPresentacion>;
  /** Texto de cada etiqueta (solo se pinta en papel). */
  textos?: Record<string, string>;
  onSelect?: (elementoId: string) => void;
}

export function SeccionHs5({
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
}: SeccionHs5Props): JSX.Element {
  const S = SECCION;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const P = mode === "pdf" ? PAPEL : PANTALLA;
  const interactivo = mode === "screen" && onSelect !== undefined;
  const sel = mode === "screen" ? seleccion : null;

  /** Color, grosor extra y discontinuo de un elemento según su estado. */
  const trazo = (id: string | null, color = P.ink): { stroke: string; dash?: string; extra: number } => {
    if (id && id === sel) return { stroke: P.accent, extra: 0.6 };
    const e = id ? estados[id] : undefined;
    if (e === "ko") return { stroke: P.fail, dash: "6 3", extra: 0.4 };
    // En papel lo pendiente no se colorea: la ficha lo dice en las observaciones.
    if (e === "rv" && mode === "screen") return { stroke: P.warn, extra: 0 };
    if (e === "pv") return { stroke: P.texto3, dash: "5 4", extra: 0 };
    return { stroke: color, extra: 0 };
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

  /** Línea invisible y gruesa para acertar con el ratón. */
  const golpe = (d: string): ReactNode =>
    interactivo ? <path d={d} stroke="transparent" strokeWidth={14} fill="none" /> : null;

  const linea = (key: string, id: string | null, d: string, ancho: number, color?: string, dashBase?: string) => {
    const t = trazo(id, color);
    const path = (
      <>
        <path d={d} stroke={t.stroke} strokeWidth={ancho + t.extra} fill="none" strokeDasharray={t.dash ?? dashBase} />
        {golpe(d)}
      </>
    );
    return id ? pulsable(key, id, path) : <g key={key}>{path}</g>;
  };

  const caja = (key: string, x: number, y: number, w: number, h: number, id: string | null, rx = 2) => {
    const t = trazo(id, P.caja);
    const activo = id !== null && id === sel;
    return (
      <rect
        key={key}
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={activo ? `color-mix(in srgb, ${P.accent} 10%, ${P.fondo})` : P.fondo}
        stroke={t.stroke}
        strokeWidth={1 + t.extra}
        strokeDasharray={t.dash}
      />
    );
  };

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
      {mode === "pdf" && <rect x={0} y={0} width={s.ancho} height={s.alto} fill={P.fondo} />}
      <PisosSeccion base={s} ancho={s.ancho} alto={s.alto} yTerrenoBajo={s.yTerrenoBajo} P={P} uid={uid} />
      {s.verticales.length > 0 && (
        <text x={S.W / 2} y={20} fontSize={10.5} fontFamily={SANS} fill={P.texto3} textAnchor="middle">
          {mode === "pdf" ? s.ventilacion.replace(/^↑ /, "") : s.ventilacion}
        </text>
      )}

      {/* Rótulos de zona */}
      {s.rotulos.map((r) => (
        <text key={`rot-${r.y}`} x={r.x} y={r.y} fontSize={11.5} fontFamily={SANS} fill={P.texto3}>
          {r.texto}
        </text>
      ))}

      {/* Verticales: rótulo, cajas, ramales y bajantes */}
      {s.verticales.map((v) => (
        <g key={`v-${v.id}`}>
          <text x={v.rotuloX} y={v.rotuloY} fontSize={9.5} letterSpacing={1} fontFamily={MONO} fill={P.texto3}>
            {v.rotulo}
          </text>
          {v.bajantes.map((b, bi) => (
            <g key={`b-${v.id}-${bi}`}>
              {b.ramales.map((r) => {
                const tr = trazo(r.id);
                const d = `M${r.x0} ${r.y}H${b.x}`;
                return pulsable(
                  `r-${r.id}`,
                  r.id,
                  <>
                    {r.cajas.map((c, ci) => (
                      <path
                        key={`t-${ci}`}
                        d={`M${c.x + c.w / 2} ${c.y + c.h}V${r.y}`}
                        stroke={tr.stroke}
                        strokeWidth={1.6 + tr.extra}
                        fill="none"
                      />
                    ))}
                    <path d={d} stroke={tr.stroke} strokeWidth={2.2 + tr.extra} fill="none" strokeDasharray={tr.dash} />
                    {r.cajas.map((c, ci) => (
                      <g key={`c-${ci}`}>
                        {caja(`cj-${ci}`, c.x, c.y, c.w, c.h, r.id)}
                        <text
                          x={c.x + c.w / 2}
                          y={c.y + 12.5}
                          fontSize={c.w < 34 ? 8 : 9.5}
                          textAnchor="middle"
                          fontFamily={SANS}
                          fill={P.texto2}
                        >
                          {c.etiqueta}
                        </text>
                      </g>
                    ))}
                    {golpe(d)}
                  </>,
                );
              })}
              {linea(`bl-${v.id}-${bi}`, b.id, `M${b.x} ${b.y0}V${b.y1}`, b.id ? 3.4 : 2.2)}
              {b.id && s.secundaria && (
                <path
                  d={`M${b.x + 9} ${b.y0 + 4}V${b.y1 - 6}`}
                  stroke={P.texto3}
                  strokeWidth={1.2}
                  strokeDasharray="3 3"
                  fill="none"
                />
              )}
              {b.id &&
                pulsable(
                  `cap-${v.id}-${bi}`,
                  "ventilacion",
                  caja(`capr-${v.id}-${bi}`, b.x - 8, S.ROOF - 30, 16, 6, "ventilacion", 0),
                )}
            </g>
          ))}
        </g>
      ))}

      {/* Pluviales: bajantes por las fachadas y colector */}
      {s.pluviales.map((p, k) => (
        <g key={`pl-${k}`}>
          {linea(`plb-${k}`, "pluviales-bajantes", `M${p.x} ${S.ROOF}V${s.colectorPluviales?.y ?? s.yRasante}`, 2.4, P.texto3)}
          {caja(
            `plr-${k}`,
            p.x - (s.recogida === "canalones" ? 10 : 7),
            S.ROOF - (s.recogida === "canalones" ? 8 : 6),
            s.recogida === "canalones" ? 20 : 14,
            s.recogida === "canalones" ? 8 : 6,
            null,
            s.recogida === "canalones" ? 3 : 0,
          )}
        </g>
      ))}
      {s.colectorPluviales &&
        linea(
          "plc",
          "pluviales-colector",
          `M${s.colectorPluviales.x1} ${s.colectorPluviales.y}H${s.colectorPluviales.x0}`,
          2.4,
          P.texto3,
        )}

      {/* Local sin uso: rótulo y conexión prevista */}
      {s.locales.map((l) => (
        <g key={`loc-${l.elementoId}`}>
          <text x={l.textoX} y={l.textoY} fontSize={12} fontFamily={SANS} fill={P.texto2}>
            {l.texto}
          </text>
          {pulsable(
            `locp-${l.elementoId}`,
            l.elementoId,
            <>
              {caja(`locc-${l.elementoId}`, l.x - 8, l.y0 - 6, 16, 6, l.elementoId, 0)}
              <path
                d={`M${l.x} ${l.y0}V${l.y1}`}
                stroke={trazo(l.elementoId).stroke}
                strokeWidth={2.4}
                strokeDasharray="5 4"
                fill="none"
              />
              {golpe(`M${l.x} ${l.y0}V${l.y1}`)}
            </>,
          )}
        </g>
      ))}

      {/* Colector de residuales y arqueta de salida */}
      {s.colector && linea("col", s.colector.id, `M${s.colector.x1} ${s.colector.y}H${s.colector.x0}`, 4)}
      {pulsable(
        "arq",
        "conexion",
        <>
          {caja("arqc", s.arqueta.x, s.arqueta.y, s.arqueta.lado, s.arqueta.lado, "conexion", 0)}
          <path
            d={`M${s.arqueta.x} ${s.arqueta.y + 16}H${s.arqueta.x - 12}`}
            stroke={P.ink}
            strokeWidth={3}
            fill="none"
          />
          <path d={`M${s.arqueta.x - 12} ${s.arqueta.y + 11}l-5 5l5 5`} stroke={P.ink} strokeWidth={2} fill="none" />
        </>,
      )}
      <line
        x1={s.arqueta.x + 14}
        y1={s.arqueta.y + s.arqueta.lado + 2}
        x2={s.arqueta.x + 14}
        y2={s.arqueta.y + s.arqueta.lado + 22}
        stroke={P.wall}
        strokeWidth={1}
      />
      <text x={4} y={s.arqueta.y + s.arqueta.lado + 34} fontSize={10.5} fontFamily={SANS} fill={P.texto2}>
        {s.arqueta.texto[0]}
      </text>
      <text x={4} y={s.arqueta.y + s.arqueta.lado + 47} fontSize={10.5} fontFamily={SANS} fill={P.texto2}>
        {s.arqueta.texto[1]}
      </text>
      {s.arquetaPluviales && (
        <g>
          {caja("arqp", s.arquetaPluviales.x, s.arquetaPluviales.y, s.arquetaPluviales.lado, s.arquetaPluviales.lado, null, 0)}
          <text
            x={s.ancho - 4}
            y={s.arquetaPluviales.y + s.arquetaPluviales.lado + 14}
            fontSize={10.5}
            fontFamily={SANS}
            fill={P.texto2}
            textAnchor="end"
          >
            → pluviales
          </text>
        </g>
      )}

      {/* Garaje: sumideros, separador y pozo de bombeo */}
      {s.garajes.map((g) => {
        const tr = trazo(g.elementoId);
        return (
          <g key={`gar-${g.elementoId}`}>
            <text x={g.textoX} y={g.textoY} fontSize={11} fontFamily={SANS} fill={P.texto3}>
              {g.texto}
            </text>
            {pulsable(
              `garp-${g.elementoId}`,
              g.elementoId,
              <>
                {g.sumideros.map((x) => (
                  <rect key={`sum-${x}`} x={x - 4} y={g.ySuelo - 9} width={8} height={5} fill={P.fondo} stroke={P.caja} />
                ))}
                <path
                  d={`M${g.sumideros[g.sumideros.length - 1]} ${g.ySuelo - 6}H${g.sg.x + g.sg.w}M${g.sg.x} ${g.ySuelo - 6}H${g.xSubida + 11}V${g.ySuelo + S.LOSA}`}
                  stroke={tr.stroke}
                  strokeWidth={1.6}
                  strokeDasharray="4 3"
                  fill="none"
                />
                {caja(`sg-${g.elementoId}`, g.sg.x, g.sg.y, g.sg.w, g.sg.h, g.elementoId, 0)}
                <text x={g.sg.x + g.sg.w / 2} y={g.sg.y + 10} fontSize={8.5} textAnchor="middle" fontFamily={MONO} fill={P.texto2}>
                  SG
                </text>
                {g.pozo && (
                  <>
                    {caja(`pozo-${g.elementoId}`, g.pozo.x, g.pozo.y, g.pozo.w, g.pozo.h, g.elementoId, 0)}
                    <circle cx={g.xSubida} cy={g.pozo.y + 20} r={7} fill={P.fondo} stroke={P.caja} strokeWidth={1.4} />
                    <path d={`M${g.xSubida - 4} ${g.pozo.y + 24}l4 -8l4 8z`} fill={P.ink} />
                  </>
                )}
                <path
                  d={`M${g.xSubida} ${g.pozo ? g.pozo.y : g.ySuelo}V${s.colector?.y ?? g.ySuelo}`}
                  stroke={tr.stroke}
                  strokeWidth={2}
                  fill="none"
                />
                {golpe(`M${g.sumideros[g.sumideros.length - 1]} ${g.ySuelo - 6}H${g.sg.x}`)}
              </>,
            )}
          </g>
        );
      })}

      {/* En papel, las cifras van dentro del dibujo */}
      {mode === "pdf" &&
        s.etiquetas.map((e) => {
          const t = textos[e.elementoId];
          if (!t) return null;
          const w = t.length * 6.4 + 12;
          return (
            <g key={e.key}>
              <rect x={e.x - w / 2} y={e.y - 9} width={w} height={18} rx={3} fill={P.fondo} stroke={P.caja} />
              <text x={e.x} y={e.y + 4} fontSize={11} textAnchor="middle" fontFamily={MONO} fill={P.texto}>
                {t}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

/**
 * El dibujo de HS5 en papel, para el clon oculto que rasteriza la ficha: la
 * sección con las cifras dentro, o el esquema de columna si la red se ajustó a
 * mano. Lo montan la pantalla del módulo y el generador del anejo.
 */
export function DibujoPdfHs5({
  j,
  edificio,
  revisados,
  width,
  height,
}: {
  j: JustificacionHs5;
  edificio: Edificio;
  revisados: readonly string[];
  width: number;
  height: number;
}): JSX.Element | null {
  if (j.modo === "manual") {
    return j.residuales ? <HS5SVG result={j.residuales} mode="pdf" width={width} height={height} /> : null;
  }
  const pendientes = new Set(
    j.avisos.filter((a) => !revisados.includes(a.id)).flatMap((a) => (a.elementoId ? [a.elementoId] : [])),
  );
  const estados = Object.fromEntries(j.elementos.map((el) => [el.id, estadoDe(el, pendientes)]));
  const textos = Object.fromEntries(j.elementos.map((el) => [el.id, textoEtiqueta(el)]));
  return (
    <SeccionHs5
      seccion={calcularSeccion(j, edificio)}
      mode="pdf"
      width={width}
      height={height}
      titulo="Sección del edificio con la red de evacuación (DB-HS5)"
      descripcion={describirSeccion(j)}
      estados={estados}
      textos={textos}
    />
  );
}
