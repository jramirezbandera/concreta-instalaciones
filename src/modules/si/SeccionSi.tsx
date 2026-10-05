// DB-SI — El dibujo común de las seis secciones (feature-19): la sección de El
// edificio con sus zonas y, encima, las marcas de cada sección del DB. Componente
// PURO de render sobre la geometría de `./seccion`.
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
import { SECCION_BASE } from "../../lib/edificio/seccion";
import { FUENTE_MONO, FUENTE_SANS, PALETA_PANTALLA, PALETA_PAPEL, type PaletaSeccion } from "../../lib/svg/paletaSeccion";
import type { SvgMode } from "../../lib/svg/helpers";
import type { DibujoSi, IconoSi, MarcaSi, TonoZona } from "./seccion";

const S = SECCION_BASE;

/** Rellenos de las zonas, en pantalla (variables del tema) y en papel. */
const TONOS: Record<"screen" | "pdf", Record<TonoZona, string>> = {
  screen: {
    vivienda: "var(--color-bg-primary)",
    comun: "var(--color-bg-surface)",
    garaje: "var(--color-bg-elevated)",
    local: "var(--color-bg-primary)",
    oficinas: "var(--color-tint-accent-soft)",
    acento: "var(--color-tint-accent)",
  },
  pdf: {
    vivienda: "#ffffff",
    comun: "#f8fafc",
    garaje: "#f1f5f9",
    local: "#ffffff",
    oficinas: "#f2f8fc",
    acento: "#e3f0f8",
  },
};

interface SeccionSiProps {
  dibujo: DibujoSi;
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

/** Un pictograma de 16 × 16 centrado en (x, y). */
function Icono({ icono, x, y, color, P }: { icono: IconoSi; x: number; y: number; color: string; P: PaletaSeccion }): JSX.Element {
  const t = `translate(${x - 8} ${y - 8})`;
  const sw = 1.4;
  switch (icono) {
    case "extintor":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <rect x={4.5} y={4} width={7} height={11} rx={2.5} fill={P.fondo} />
          <path d="M8 4V1.5h3.5M11.5 1.5l1.5 2.5" />
        </g>
      );
    case "bie":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <rect x={1} y={1} width={14} height={14} rx={1.5} fill={P.fondo} />
          <circle cx={8} cy={8} r={4} />
          <circle cx={8} cy={8} r={1.2} fill={color} />
        </g>
      );
    case "columna":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <rect x={2} y={3} width={12} height={10} rx={1.5} fill={P.fondo} />
          <path d="M5.5 8h5M8 5.5v5" />
        </g>
      );
    case "hidrante":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <path d="M5 15V6a3 3 0 0 1 6 0v9M3 15h10M3 9h2M11 9h2" />
        </g>
      );
    case "detector":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <path d="M2 4h12" />
          <path d="M4 4a4 4 0 0 0 8 0" fill={P.fondo} />
          <circle cx={8} cy={6} r={0.9} fill={color} />
        </g>
      );
    case "alarma":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <rect x={3} y={3} width={10} height={10} rx={1.5} fill={P.fondo} />
          <circle cx={8} cy={8} r={2.2} fill={color} />
        </g>
      );
    case "camion":
      return (
        <g transform={`translate(${x - 16} ${y - 9})`} fill="none" stroke={color} strokeWidth={sw}>
          <rect x={1} y={3} width={20} height={10} rx={1} fill={P.fondo} />
          <path d="M21 6h6l3 4v3h-9z" fill={P.fondo} />
          <path d="M3 3l12-2.5" />
          <circle cx={7} cy={15} r={2.2} fill={P.fondo} />
          <circle cx={25} cy={15} r={2.2} fill={P.fondo} />
        </g>
      );
    case "salida":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <rect x={7} y={1.5} width={7.5} height={13} fill={P.fondo} />
          <path d="M1 8h8M6.5 5.5 9 8l-2.5 2.5" />
        </g>
      );
    case "humo":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <path d="M3 13c2-2-1-3 1-5s-1-3 1-5M8 13c2-2-1-3 1-5s-1-3 1-5M13 13c2-2-1-3 1-5s-1-3 1-5" />
        </g>
      );
    case "ascensor":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <rect x={2.5} y={1.5} width={11} height={13} rx={1} fill={P.fondo} />
          <path d="M8 3.5 10.5 6.5h-5zM8 12.5 5.5 9.5h5z" fill={color} stroke="none" />
        </g>
      );
    case "rayo":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <path d="M9.5 1 4 9h4l-1.5 6L12 7H8z" fill={P.fondo} strokeLinejoin="round" />
        </g>
      );
    case "luz":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <rect x={2} y={5} width={12} height={6} rx={1} fill={P.fondo} />
          <path d="M5 13.5 4 15M8 13.5V15.5M11 13.5l1 1.5" />
          <path d="M5.5 8h5" />
        </g>
      );
    case "accesible":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <circle cx={7} cy={2.5} r={1.4} fill={color} stroke="none" />
          <path d="M7 4.5v5h4l1.5 4M7 7h3.5" />
          <path d="M5 8.2a4 4 0 1 0 5.6 4.6" />
        </g>
      );
    case "coche":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <path d="M1.5 11V8.5l2-4h9l2 4V11z" fill={P.fondo} strokeLinejoin="round" />
          <circle cx={4.5} cy={12} r={1.6} fill={P.fondo} />
          <circle cx={11.5} cy={12} r={1.6} fill={P.fondo} />
        </g>
      );
    case "puerta":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <rect x={3.5} y={1.5} width={9} height={13.5} fill={P.fondo} />
          <circle cx={10} cy={8.5} r={0.9} fill={color} stroke="none" />
        </g>
      );
    case "contenedor":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <path d="M3.5 5h9l-1 8.5h-7z" fill={P.fondo} strokeLinejoin="round" />
          <path d="M2 3.2h12M6.5 3.2V1.8h3v1.4M6.5 7.5v3.5M9.5 7.5v3.5" />
          <circle cx={5.5} cy={14.6} r={1} fill={color} stroke="none" />
        </g>
      );
    case "captador":
      // Inclinado sobre su soporte, con los tubos del absorbedor.
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <path d="M1.5 12 12.5 3.5l2 3L3.5 15z" fill={P.fondo} strokeLinejoin="round" />
          <path d="M4.2 11.5 12.4 5.2M5.7 13.4l8-6.2" />
          <path d="M12 6.5V15" />
        </g>
      );
    case "fotovoltaica":
      // Inclinado, con la rejilla de células.
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <path d="M1.5 12 12.5 3.5l2 3L3.5 15z" fill={P.fondo} strokeLinejoin="round" />
          <path d="M7 7.8l2 3.1M10 5.5l2 3.1M2.5 13.5l11-8.5" strokeWidth={0.9} />
          <path d="M12 6.5V15" />
        </g>
      );
    case "bomba_calor":
      // La unidad exterior: caja con el ventilador.
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <rect x={1.5} y={3} width={13} height={10} rx={1} fill={P.fondo} />
          <circle cx={6.5} cy={8} r={3} />
          <path d="M6.5 5v6M3.5 8h6" strokeWidth={0.9} />
          <path d="M11 5.5v5" />
        </g>
      );
    case "caldera":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <rect x={3} y={1.5} width={10} height={13} rx={1.5} fill={P.fondo} />
          <path d="M8 12c-1.8 0-2.6-1.3-2.2-2.7.3-1 1.3-1.6 1.2-3.1 1.4.8 3.2 2.4 3.2 3.9 0 1.1-.9 1.9-2.2 1.9z" />
        </g>
      );
    case "grifo":
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <path d="M2 5.5h7a3 3 0 0 1 3 3v1.5" fill="none" />
          <path d="M5.5 5.5V3M3.5 3h4" />
          <path d="M12 12.5c-.8 1-.8 1.8 0 2.5.8-.7.8-1.5 0-2.5z" fill={color} stroke="none" />
        </g>
      );
    case "contador":
      // La caja del contador con su visor y el rayo.
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <rect x={2.5} y={1.5} width={11} height={13} rx={1} fill={P.fondo} />
          <rect x={4.5} y={3.5} width={7} height={3.5} strokeWidth={0.9} />
          <path d="M8.6 8.5 6.6 11.4h2l-.6 2.3 2.2-3h-2z" fill={color} stroke="none" />
        </g>
      );
    case "recarga":
      // El poste de recarga con su manguera.
      return (
        <g transform={t} fill="none" stroke={color} strokeWidth={sw}>
          <rect x={2.5} y={1.5} width={7} height={13} rx={1} fill={P.fondo} />
          <path d="M6.6 4.2 4.9 7.2h1.8l-.6 2.4 2-3.2H6.4z" fill={color} stroke="none" />
          <path d="M9.5 6.5h2a1.5 1.5 0 0 1 1.5 1.5v4.5a1 1 0 0 0 2 0V9" />
        </g>
      );
  }
}

export function SeccionSi({
  dibujo: s,
  mode,
  width,
  height,
  titulo,
  descripcion,
  seleccion = null,
  estados,
  textos = {},
  onSelect,
}: SeccionSiProps): JSX.Element {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const P = mode === "pdf" ? PALETA_PAPEL : PALETA_PANTALLA;
  const tonos = TONOS[mode === "pdf" ? "pdf" : "screen"];
  const interactivo = mode === "screen" && onSelect !== undefined;
  const sel = mode === "screen" ? seleccion : null;

  const color = (id: string | undefined, base: string): { stroke: string; dash?: string; extra: number } => {
    if (id === undefined) return { stroke: base, extra: 0 };
    if (id === sel) return { stroke: P.accent, extra: 1 };
    const e = estados[id];
    if (e === "ko") return { stroke: P.fail, dash: "7 4", extra: 0.5 };
    if (e === "rv" && mode === "screen") return { stroke: P.warn, extra: 0 };
    return { stroke: base, extra: 0 };
  };

  const pulsable = (key: string, id: string | undefined, contenido: ReactNode): ReactNode =>
    interactivo && id !== undefined ? (
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

  const zonas = s.marcas.filter((m): m is Extract<MarcaSi, { tipo: "zona" }> => m.tipo === "zona");
  const resto = s.marcas.filter((m) => m.tipo !== "zona");
  const xm = (S.X0 + S.X1) / 2;
  const cubierta = s.cubiertaInclinada
    ? `M${S.X0 - 14} ${S.ROOF + 2}L${xm} ${S.ROOF - 30}L${S.X1 + 14} ${S.ROOF + 2}`
    : `M${S.X0 - 4} ${S.ROOF}H${S.X1 + 4}`;

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
        <pattern id={`${uid}-rayado`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={P.ink} strokeWidth="0.9" opacity="0.55" />
        </pattern>
      </defs>
      {mode === "pdf" && <rect x={0} y={0} width={s.ancho} height={s.alto} fill={P.fondo} />}

      {/* Las zonas, debajo de los forjados */}
      {zonas.map((m) => {
        const z = m.zona;
        const c = color(m.elementoId, P.caja);
        const marcada = m.elementoId !== undefined && (m.elementoId === sel || estados[m.elementoId] === "ko");
        return pulsable(
          m.key,
          m.elementoId,
          <>
            <rect x={z.x0} y={z.y0} width={z.x1 - z.x0} height={z.y1 - z.y0} fill={tonos[m.tono]} />
            {m.rayado && <rect x={z.x0} y={z.y0} width={z.x1 - z.x0} height={z.y1 - z.y0} fill={`url(#${uid}-rayado)`} />}
            {(m.previsto || marcada) && (
              <rect
                x={z.x0 + 1.5}
                y={z.y0 + 1.5}
                width={Math.max(0, z.x1 - z.x0 - 3)}
                height={Math.max(0, z.y1 - z.y0 - 3)}
                fill="none"
                stroke={marcada ? c.stroke : P.caja}
                strokeWidth={marcada ? 2 : 1}
                strokeDasharray={marcada ? c.dash : "4 3"}
              />
            )}
            {m.rotulo && !z.enBanda && (
              <text x={z.x0 + 6} y={z.y0 + 13} fontSize={9.5} fontFamily={FUENTE_SANS} fill={P.texto3}>
                {m.rotulo}
              </text>
            )}
          </>,
        );
      })}

      <PisosSeccion base={s} ancho={s.ancho} alto={s.alto} yTerrenoBajo={s.yTerrenoBajo} P={P} uid={uid} />

      {/* Cubierta y fachadas */}
      <path d={cubierta} stroke={P.ink} strokeWidth={4} fill="none" strokeLinecap="square" />

      {/* Lo de cada sección: líneas, flechas, iconos y textos */}
      {resto.map((m) => {
        switch (m.tipo) {
          case "linea": {
            const c = color(m.elementoId, m.tono === "suave" ? P.caja : P.texto2);
            return pulsable(
              m.key,
              m.elementoId,
              <>
                <path d={m.d} stroke={c.stroke} strokeWidth={m.grosor + c.extra} fill="none" strokeDasharray={c.dash ?? m.dash} strokeLinecap="square" />
                {interactivo && m.elementoId !== undefined && <path d={m.d} stroke="transparent" strokeWidth={14} fill="none" />}
              </>,
            );
          }
          case "flecha": {
            const c = color(m.elementoId, P.texto2);
            return pulsable(
              m.key,
              m.elementoId,
              <>
                <path
                  d={m.d}
                  stroke={c.stroke}
                  strokeWidth={1.6 + c.extra}
                  fill="none"
                  strokeDasharray={c.dash ?? "5 3"}
                  markerEnd={`url(#${uid}-punta)`}
                />
                {interactivo && m.elementoId !== undefined && <path d={m.d} stroke="transparent" strokeWidth={14} fill="none" />}
              </>,
            );
          }
          case "icono": {
            const c = color(m.elementoId, P.texto2);
            return pulsable(
              m.key,
              m.elementoId,
              <>
                {interactivo && m.elementoId !== undefined && <rect x={m.x - 11} y={m.y - 11} width={22} height={22} fill="transparent" />}
                <Icono icono={m.icono} x={m.x} y={m.y} color={c.stroke} P={P} />
              </>,
            );
          }
          case "texto":
            return (
              <text key={m.key} x={m.x} y={m.y} fontSize={10} textAnchor={m.ancla ?? "start"} fontFamily={FUENTE_SANS} fill={P.texto3}>
                {m.texto}
              </text>
            );
        }
      })}
      <defs>
        <marker id={`${uid}-punta`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0L8 4L0 8z" fill={P.texto2} />
        </marker>
      </defs>

      {/* La rasante, rotulada */}
      <text x={s.ancho - 4} y={s.yRasante - 6} fontSize={10} textAnchor="end" fontFamily={FUENTE_SANS} fill={P.texto3}>
        terreno
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
