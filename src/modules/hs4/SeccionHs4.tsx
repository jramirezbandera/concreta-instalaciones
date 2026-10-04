// DB-HS4 — El dibujo de la justificación (feature-15, HS4): la sección del
// edificio con la batería y los montantes y, a la derecha, la presión que llega
// a cada planta. Componente PURO de render sobre `calcularSeccionHs4`.
//
// En pantalla, las cifras van FUERA del SVG, como botones HTML sobre las anclas
// (`DibujoConEtiquetas`). En papel (`mode="pdf"`) van DENTRO, como texto sobre un
// recuadro, y los colores son fijos.
//
// Estado multicanal: lo que no cumple va en rojo Y discontinuo; lo previsto,
// discontinuo; lo seleccionado, en el acento y más grueso.

import { useId, type JSX, type ReactNode } from "react";
import { PisosSeccion } from "../../components/edificio/PisosSeccion";
import { FUENTE_MONO, FUENTE_SANS, PALETA_PANTALLA, PALETA_PAPEL } from "../../lib/svg/paletaSeccion";
import { estadosElementos } from "../../lib/cte/estados";
import type { EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Edificio } from "../../lib/edificio/tipos";
import type { SvgMode } from "../../lib/svg/helpers";
import type { JustificacionHs4 } from "./justificacion";
import { calcularSeccionHs4, SECCION_HS4, type SeccionHs4Geo } from "./seccion";
import { HS4SVG } from "./svg";
import { describirSeccionHs4, textoEtiqueta } from "./textos";

interface SeccionHs4Props {
  seccion: SeccionHs4Geo;
  mode: SvgMode;
  width: number;
  height: number;
  titulo: string;
  descripcion: string;
  seleccion?: string | null;
  estados: Record<string, EstadoPresentacion>;
  /** Texto de cada etiqueta (solo se pinta en papel). */
  textos?: Record<string, string>;
  onSelect?: (elementoId: string) => void;
}

export function SeccionHs4({
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
}: SeccionHs4Props): JSX.Element {
  const S = SECCION_HS4;
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const P = mode === "pdf" ? PALETA_PAPEL : PALETA_PANTALLA;
  const interactivo = mode === "screen" && onSelect !== undefined;
  const sel = mode === "screen" ? seleccion : null;

  const trazo = (id: string | null, color = P.ink): { stroke: string; dash?: string; extra: number } => {
    if (id && id === sel) return { stroke: P.accent, extra: 0.8 };
    const e = id ? estados[id] : undefined;
    if (e === "ko") return { stroke: P.fail, dash: "6 3", extra: 0.4 };
    if (e === "rv" && mode === "screen") return { stroke: P.warn, extra: 0 };
    if (e === "pv") return { stroke: P.texto3, dash: "5 4", extra: 0 };
    return { stroke: color, extra: 0 };
  };

  const pulsable = (key: string, id: string | null, contenido: ReactNode): ReactNode =>
    interactivo && id ? (
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

  const golpe = (d: string): ReactNode =>
    interactivo ? <path d={d} stroke="transparent" strokeWidth={12} fill="none" /> : null;

  /** Relleno de una barra según su estado y la selección. */
  const rellenoBarra = (id: string, cumple: boolean): { fill: string; opacity: number } => {
    if (id === sel) return { fill: P.accent, opacity: 1 };
    if (!cumple) return { fill: P.fail, opacity: 0.85 };
    if (estados[id] === "rv" && mode === "screen") return { fill: P.warn, opacity: 0.7 };
    return { fill: P.texto3, opacity: 0.45 };
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
      <PisosSeccion
        base={s.base}
        ancho={s.x1 + 10}
        alto={s.alto}
        yTerrenoBajo={s.yTerrenoBajo}
        P={P}
        uid={uid}
        x1={s.x1}
        terrenoDerecha={false}
      />

      {/* Rótulos de zonas sin consumo */}
      {s.rotulos.map((r) => (
        <text key={`rot-${r.y}`} x={r.x} y={r.y} fontSize={10.5} fontFamily={FUENTE_SANS} fill={P.texto3}>
          {r.texto}
        </text>
      ))}

      {/* Montantes (uno por unidad) o montante general */}
      {s.montantes.map((m) => {
        const t = trazo(m.elementoId);
        const desde = s.bateria ? `M${s.bateria.x + s.bateria.w} ${m.y0}H${m.x}` : `M${m.x} ${m.y0}`;
        const d = `${desde}V${m.y1}H${m.xCaja}`;
        return pulsable(
          `m-${m.unidadId}-${m.y1}`,
          m.elementoId,
          <>
            <path d={d} stroke={t.stroke} strokeWidth={1.5 + t.extra} fill="none" strokeDasharray={t.dash} />
            {golpe(d)}
          </>,
        );
      })}
      {s.general &&
        pulsable(
          "general",
          "montante-general",
          <>
            <path
              d={`M${s.general.x} ${s.general.y0}V${s.general.y1}`}
              stroke={trazo("montante-general").stroke}
              strokeWidth={3 + trazo("montante-general").extra}
              fill="none"
            />
            {s.general.contadores.map((c) => (
              <circle key={c.y} cx={s.general!.x} cy={c.y} r={5} fill={P.fondo} stroke={P.caja} strokeWidth={1.2} />
            ))}
            {golpe(`M${s.general.x} ${s.general.y0}V${s.general.y1}`)}
          </>,
        )}

      {/* Cajas de las unidades */}
      {s.cajas.map((c) => {
        const activo = c.elementoId !== null && c.elementoId === sel && c.critica;
        const ko = c.elementoId !== null && estados[c.elementoId] === "ko" && c.critica;
        return pulsable(
          `caja-${c.id}`,
          c.elementoId,
          <>
            <rect
              x={c.x}
              y={c.y}
              width={c.w}
              height={c.h}
              rx={2}
              fill={activo ? `color-mix(in srgb, ${P.accent} 10%, ${P.fondo})` : P.fondo}
              stroke={activo ? P.accent : ko ? P.fail : P.caja}
              strokeWidth={activo || ko ? 1.6 : 1}
              strokeDasharray={ko ? "5 3" : undefined}
            />
            <text
              x={c.x + c.w / 2}
              y={c.y + 15}
              fontSize={c.w < 40 ? 9 : 10.5}
              textAnchor="middle"
              fontFamily={FUENTE_SANS}
              fill={P.texto2}
            >
              {c.texto}
            </text>
            {c.critica && (
              <text x={c.x} y={c.y + c.h + 11} fontSize={9} fontFamily={FUENTE_SANS} fill={P.texto3}>
                crítico
              </text>
            )}
          </>,
        );
      })}

      {/* Batería de contadores */}
      {s.bateria && (
        <g>
          <rect x={s.bateria.x} y={s.bateria.y} width={s.bateria.w} height={s.bateria.h} fill={P.fondo} stroke={P.caja} strokeWidth={1.4} />
          {Array.from({ length: Math.min(8, s.bateria.contadores) }, (_, k) => (
            <circle
              key={k}
              cx={s.bateria!.x + 12 + (k % 4) * 15}
              cy={s.bateria!.y + 11 + Math.floor(k / 4) * 14}
              r={4.5}
              fill={P.fondo}
              stroke={P.caja}
              strokeWidth={1}
            />
          ))}
          {s.bateria.contadores > 8 && (
            <text x={s.bateria.x + s.bateria.w - 4} y={s.bateria.y + s.bateria.h - 4} fontSize={9} textAnchor="end" fontFamily={FUENTE_MONO} fill={P.texto3}>
              +{s.bateria.contadores - 8}
            </text>
          )}
          <text x={s.bateria.x} y={s.bateria.y - 6} fontSize={9.5} fontFamily={FUENTE_SANS} fill={P.texto2}>
            {s.bateria.texto}
          </text>
        </g>
      )}

      {/* Locales: contador previsto */}
      {s.locales.map((l) => {
        const t = trazo(l.elementoId, P.caja);
        return pulsable(
          `loc-${l.elementoId}`,
          l.elementoId,
          <>
            {s.bateria && (
              <path
                d={`M${s.bateria.x + s.bateria.w} ${s.bateria.y + s.bateria.h - 6}H${l.x}`}
                stroke={t.stroke}
                strokeWidth={1.6}
                strokeDasharray="5 4"
                fill="none"
              />
            )}
            <rect x={l.x} y={l.y} width={l.w} height={l.h} rx={2} fill={P.fondo} stroke={t.stroke} strokeWidth={1.2} strokeDasharray="5 4" />
            <text x={l.x + l.w / 2} y={l.y + 15} fontSize={10.5} textAnchor="middle" fontFamily={FUENTE_SANS} fill={P.texto2}>
              {l.texto}
            </text>
            <text x={l.x + l.w / 2} y={l.y + 28} fontSize={9.5} textAnchor="middle" fontFamily={FUENTE_SANS} fill={P.texto3}>
              contador previsto
            </text>
          </>,
        );
      })}

      {/* Acometida desde la calle y grupo de presión */}
      {s.bateria || s.general
        ? pulsable(
            "acometida",
            "acometida",
            <>
              <path
                d={`M0 ${s.acometida.y}H${s.acometida.xGrupo}V${s.bateria ? s.bateria.y + s.bateria.h / 2 : s.general!.y0}H${s.bateria ? s.bateria.x : s.general!.x}`}
                stroke={trazo("acometida").stroke}
                strokeWidth={3 + trazo("acometida").extra}
                fill="none"
              />
              <circle cx={30} cy={s.acometida.y} r={4} fill={P.fondo} stroke={P.caja} strokeWidth={1.4} />
              <text x={4} y={s.acometida.y - 6} fontSize={9.5} fontFamily={FUENTE_SANS} fill={P.texto3}>
                Acometida
              </text>
              {golpe(`M0 ${s.acometida.y}H${s.acometida.xGrupo}`)}
            </>,
          )
        : null}
      {s.acometida.grupo &&
        pulsable(
          "grupo",
          "grupo-presion",
          <>
            <circle cx={s.acometida.xGrupo} cy={s.acometida.yGrupo} r={8} fill={P.fondo} stroke={trazo("grupo-presion", P.accent).stroke} strokeWidth={1.4} />
            <path d={`M${s.acometida.xGrupo - 4} ${s.acometida.yGrupo + 4}l4 -8l4 8z`} fill={trazo("grupo-presion", P.accent).stroke} />
          </>,
        )}

      {/* Gráfica: presión que llega a cada planta */}
      <text x={S.G_X0 - 10} y={S.ROOF - 30} fontSize={10} letterSpacing={1} fontFamily={FUENTE_MONO} fill={P.texto3}>
        PRESIÓN QUE LLEGA · kPa
      </text>
      <line x1={s.xMinimo} y1={S.ROOF - 18} x2={s.xMinimo} y2={s.yEje - 8} stroke={P.fail} strokeWidth={1} strokeDasharray="4 3" />
      <text x={s.xMinimo + 4} y={S.ROOF - 10} fontSize={10} fontFamily={FUENTE_MONO} fill={P.fail}>
        mín. 100
      </text>
      {s.barras.map((b) => {
        const r = rellenoBarra(b.elementoId, b.cumple);
        return pulsable(
          `b-${b.elementoId}`,
          b.elementoId,
          <>
            <line x1={S.X1} y1={b.y + 7} x2={S.G_X0 - 6} y2={b.y + 7} stroke={P.wall} strokeWidth={1} strokeDasharray="2 4" />
            <text x={S.G_X0} y={b.y - 5} fontSize={9.5} fontFamily={FUENTE_SANS} fill={P.texto3}>
              {b.rotulo}
            </text>
            <rect x={S.G_X0} y={b.y} width={b.w} height={14} rx={2} fill={r.fill} opacity={r.opacity} />
            {b.recortada && <path d={`M${S.G_X0 + b.w - 6} ${b.y}l6 7l-6 7`} stroke={P.fondo} strokeWidth={1.5} fill="none" />}
          </>,
        );
      })}
      {s.barraRed &&
        pulsable(
          "b-red",
          "presion-red",
          <>
            <text x={S.G_X0} y={s.barraRed.y - 5} fontSize={9.5} fontFamily={FUENTE_SANS} fill={P.texto3}>
              {s.barraRed.rotulo}
            </text>
            <rect
              x={S.G_X0}
              y={s.barraRed.y}
              width={s.barraRed.w}
              height={14}
              rx={2}
              {...rellenoBarra("presion-red", true)}
            />
          </>,
        )}
      {s.barraGrupo && (
        <g>
          <text x={S.G_X0} y={s.barraGrupo.y - 5} fontSize={9.5} fontFamily={FUENTE_SANS} fill={P.texto3}>
            {s.barraGrupo.rotulo}
          </text>
          <rect x={S.G_X0} y={s.barraGrupo.y} width={s.barraGrupo.w} height={14} rx={2} fill={P.accent} opacity={0.35} />
        </g>
      )}
      <line x1={S.G_X0} y1={s.yEje} x2={S.G_X1} y2={s.yEje} stroke={P.wall} strokeWidth={1} />
      {s.ticks.map((t) => (
        <g key={t.texto}>
          <line x1={t.x} y1={s.yEje} x2={t.x} y2={s.yEje + 5} stroke={P.wall} strokeWidth={1} />
          <text x={t.x} y={s.yEje + 17} fontSize={10} textAnchor="middle" fontFamily={FUENTE_MONO} fill={P.texto3}>
            {t.texto}
          </text>
        </g>
      ))}
      <text x={S.G_X1} y={s.yEje + 33} fontSize={9.5} textAnchor="end" fontFamily={FUENTE_SANS} fill={P.texto3}>
        máximo 500 kPa, fuera de escala
      </text>

      {/* En papel, las cifras van dentro del dibujo */}
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

/**
 * El dibujo de HS4 en papel, para el clon oculto que rasteriza la ficha: la
 * sección con las cifras dentro, o el esquema de columna si la red se ajustó a
 * mano. Lo montan la pantalla del módulo y el generador del anejo.
 */
export function DibujoPdfHs4({
  j,
  edificio,
  revisados,
  width,
  height,
}: {
  j: JustificacionHs4;
  edificio: Edificio;
  revisados: readonly string[];
  width: number;
  height: number;
}): JSX.Element | null {
  if (j.modo === "manual") {
    return j.resultado ? <HS4SVG result={j.resultado} mode="pdf" width={width} height={height} /> : null;
  }
  const estados = estadosElementos(j.elementos, j.avisos, revisados);
  const textos = Object.fromEntries(j.elementos.map((el) => [el.id, textoEtiqueta(el)]));
  return (
    <SeccionHs4
      seccion={calcularSeccionHs4(j, edificio)}
      mode="pdf"
      width={width}
      height={height}
      titulo="Sección del edificio con la red de suministro de agua (DB-HS4)"
      descripcion={describirSeccionHs4(j)}
      estados={estados}
      textos={textos}
    />
  );
}
