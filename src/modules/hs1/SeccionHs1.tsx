// DB-HS1 — La SECCIÓN del edificio con su envolvente (feature-17). Componente
// PURO de render sobre la geometría de `./seccion` (`calcularSeccionHs1`).
//
// En pantalla, las cifras van FUERA del SVG, como botones HTML sobre las anclas
// (`DibujoConEtiquetas`); el SVG se puede pulsar para seleccionar. En papel
// (`mode="pdf"`) las cifras van DENTRO, como texto sobre un recuadro, y los
// colores son fijos (las variables CSS no se resuelven al rasterizar).
//
// Estado multicanal: lo que no cumple va en rojo Y discontinuo; lo seleccionado,
// en el acento y más grueso. El texto del estado lo dan las etiquetas y la lista.

import { useId, type JSX, type ReactNode } from "react";
import { PisosSeccion } from "../../components/edificio/PisosSeccion";
import type { EstadoPresentacion } from "../../lib/cte/presentacion";
import { estadosElementos } from "../../lib/cte/estados";
import type { Edificio } from "../../lib/edificio/tipos";
import { FUENTE_MONO, FUENTE_SANS, PALETA_PANTALLA, PALETA_PAPEL } from "../../lib/svg/paletaSeccion";
import type { SvgMode } from "../../lib/svg/helpers";
import type { JustificacionHs1 } from "./justificacion";
import { calcularSeccionHs1, type SeccionHs1Geo } from "./seccion";
import { describirSeccionHs1, textoEtiqueta } from "./textos";


interface SeccionHs1Props {
  seccion: SeccionHs1Geo;
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

export function SeccionHs1({
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
}: SeccionHs1Props): JSX.Element {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const P = mode === "pdf" ? PALETA_PAPEL : PALETA_PANTALLA;
  const interactivo = mode === "screen" && onSelect !== undefined;
  const sel = mode === "screen" ? seleccion : null;

  const trazo = (id: string, color = P.ink): { stroke: string; dash?: string; extra: number } => {
    if (id === sel) return { stroke: P.accent, extra: 1 };
    const e = estados[id];
    if (e === "ko") return { stroke: P.fail, dash: "7 4", extra: 0.5 };
    if (e === "rv" && mode === "screen") return { stroke: P.warn, extra: 0 };
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

  const golpe = (d: string): ReactNode => (interactivo ? <path d={d} stroke="transparent" strokeWidth={16} fill="none" /> : null);

  const linea = (key: string, id: string, d: string, ancho: number, color?: string, dashBase?: string) => {
    const t = trazo(id, color);
    return pulsable(
      key,
      id,
      <>
        <path d={d} stroke={t.stroke} strokeWidth={ancho + t.extra} fill="none" strokeDasharray={t.dash ?? dashBase} strokeLinecap="square" />
        {golpe(d)}
      </>,
    );
  };

  const yR = s.yRasante;

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

      {/* El nivel freático: discontinuo, de lado a lado */}
      {s.freatico && (
        <g>
          <line x1={0} y1={s.freatico.y} x2={s.ancho} y2={s.freatico.y} stroke={P.accent} strokeWidth={1.2} strokeDasharray="10 4 2 4" opacity={0.75} />
          <path d={`M${s.ancho - 18} ${s.freatico.y - 9}l6 7l6 -7z`} fill={P.accent} opacity={0.75} />
          {s.freatico.recortado && (
            <text x={s.ancho - 26} y={s.freatico.y - 4} fontSize={10} textAnchor="end" fontFamily={FUENTE_SANS} fill={P.texto3}>
              más abajo
            </text>
          )}
        </g>
      )}

      {/* La cámara del suelo elevado */}
      {s.camara && (
        <g>
          <rect x={s.camara.x0} y={s.camara.y0 + 2} width={s.camara.x1 - s.camara.x0} height={s.camara.y1 - s.camara.y0 - 2} fill={P.fondo} />
          {[0.2, 0.5, 0.8].map((f) => (
            <rect
              key={f}
              x={s.camara!.x0 + (s.camara!.x1 - s.camara!.x0) * f - 3}
              y={s.camara!.y0 + 3}
              width={6}
              height={s.camara!.y1 - s.camara!.y0 - 3}
              fill={P.slab}
            />
          ))}
        </g>
      )}

      {/* Cubierta y fachadas */}
      {linea("cubierta", "cubierta", s.cubierta.d, 5)}
      {linea("fachada", "fachada", s.fachada, 4)}

      {/* Muros: el muro, la capa drenante y la impermeabilización */}
      {s.muro && (
        <>
          {s.muro.drenante && <path d={s.muro.drenante} stroke={P.texto3} strokeWidth={3} strokeDasharray="1 3" fill="none" />}
          {linea("muro", "muro", s.muro.d, 5)}
          {s.muro.imper && (
            <path
              d={s.muro.imper.d}
              stroke={trazo("muro", P.accent).stroke}
              strokeWidth={1.6}
              strokeDasharray={s.muro.imper.tipo === "camara" ? "3 3" : undefined}
              fill="none"
            />
          )}
        </>
      )}

      {/* Suelos en contacto con el terreno */}
      {s.suelos.map((x) => linea(`suelo-${x.id}`, x.id, x.d, 4))}

      {/* Drenaje y bombeo */}
      {s.drenes.map((dr, i) =>
        pulsable(
          `dren-${i}`,
          dr.elementoId,
          <circle cx={dr.cx} cy={dr.cy} r={5} fill={P.fondo} stroke={trazo(dr.elementoId).stroke} strokeWidth={1.6} />,
        ),
      )}
      {s.bombeo &&
        pulsable(
          "bombeo",
          "bombeo",
          <>
            <rect x={s.bombeo.x} y={s.bombeo.y} width={s.bombeo.w} height={s.bombeo.h} rx={2} fill={P.fondo} stroke={trazo("bombeo", P.caja).stroke} strokeWidth={1.2} />
            <text x={s.bombeo.x + s.bombeo.w / 2} y={s.bombeo.y + s.bombeo.h / 2 + 3.5} fontSize={9} textAnchor="middle" fontFamily={FUENTE_MONO} fill={P.texto2}>
              B×2
            </text>
          </>,
        )}

      {/* La rasante, rotulada */}
      <text x={s.ancho - 4} y={yR - 6} fontSize={10} textAnchor="end" fontFamily={FUENTE_SANS} fill={P.texto3}>
        terreno
      </text>

      {/* En papel, las cifras van dentro del dibujo */}
      {mode === "pdf" &&
        s.etiquetas.map((e) => {
          const t = textos[e.elementoId];
          if (!t) return null;
          const w = t.length * 6.4 + 12;
          return (
            <g key={e.key}>
              <rect x={e.x - w / 2} y={e.y - 9} width={w} height={18} rx={3} fill={P.fondo} stroke={P.caja} />
              <text x={e.x} y={e.y + 4} fontSize={11} textAnchor="middle" fontFamily={FUENTE_MONO} fill={P.texto}>
                {t}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

/**
 * El dibujo de HS1 en papel, para el clon oculto que rasteriza la ficha. Lo
 * montan la pantalla del módulo y el generador del anejo.
 */
export function DibujoPdfHs1({
  j,
  edificio,
  revisados,
  width,
  height,
}: {
  j: JustificacionHs1;
  edificio: Edificio;
  revisados: readonly string[];
  width: number;
  height: number;
}): JSX.Element {
  const estados = estadosElementos(j.elementos, j.avisos, revisados);
  const textos = Object.fromEntries(j.elementos.map((el) => [el.id, textoEtiqueta(el)]));
  return (
    <SeccionHs1
      seccion={calcularSeccionHs1(j, edificio)}
      mode="pdf"
      width={width}
      height={height}
      titulo="Sección del edificio con su envolvente (DB-HS1)"
      descripcion={describirSeccionHs1(j)}
      estados={estados}
      textos={textos}
    />
  );
}
