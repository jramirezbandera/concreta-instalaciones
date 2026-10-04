// DB-HS3 — Los dibujos de la justificación (feature-15, HS3): la planta
// esquemática de cada vivienda tipo con el camino del aire, y el garaje con los
// trasteros. Componente PURO de render sobre `calcularDibujoHs3`.
//
// En pantalla las cifras van FUERA del SVG (etiquetas HTML, `DibujoConEtiquetas`);
// en papel van DENTRO, como texto sobre un recuadro, con colores fijos. Estado
// multicanal: lo que no cumple va en rojo Y discontinuo; lo seleccionado, en el
// acento y más grueso.

import { useId, type JSX, type ReactNode } from "react";
import { estadosElementos } from "../../lib/cte/estados";
import type { EstadoPresentacion } from "../../lib/cte/presentacion";
import type { SvgMode } from "../../lib/svg/helpers";
import { FUENTE_MONO, FUENTE_SANS, PALETA_PANTALLA, PALETA_PAPEL } from "../../lib/svg/paletaSeccion";
import type { JustificacionHs3 } from "./justificacion";
import { calcularDibujoHs3, PLANTA, type DibujoHs3, type PlantaGaraje, type PlantaVivienda } from "./planta";
import { describirDibujoHs3, textoEtiqueta } from "./textos";

interface PlantaHs3Props {
  dibujo: DibujoHs3;
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

export function PlantaHs3({
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
}: PlantaHs3Props): JSX.Element {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const P = mode === "pdf" ? PALETA_PAPEL : PALETA_PANTALLA;
  const interactivo = mode === "screen" && onSelect !== undefined;
  const sel = mode === "screen" ? seleccion : null;
  const tinte = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, ${P.fondo})`;

  const borde = (id: string | null): { stroke: string; dash?: string; w: number } => {
    if (id && id === sel) return { stroke: P.accent, w: 1.8 };
    if (id && estados[id] === "ko") return { stroke: P.fail, dash: "6 3", w: 1.6 };
    return { stroke: P.ink, w: 1.2 };
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
        <marker id={`${uid}-m`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0 0L10 5L0 10z" fill={P.texto3} />
        </marker>
      </defs>
      {mode === "pdf" && <rect x={0} y={0} width={s.ancho} height={s.alto} fill={P.fondo} />}
      {s.clase === "vivienda" ? (
        <Vivienda s={s} P={P} uid={uid} borde={borde} pulsable={pulsable} tinte={tinte} sel={sel} />
      ) : (
        <Garaje s={s} P={P} uid={uid} borde={borde} pulsable={pulsable} tinte={tinte} sel={sel} />
      )}

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

type Paleta = typeof PALETA_PANTALLA;
interface PartesProps<T> {
  s: T;
  P: Paleta;
  uid: string;
  borde: (id: string | null) => { stroke: string; dash?: string; w: number };
  pulsable: (key: string, id: string | null, contenido: ReactNode) => ReactNode;
  tinte: (c: string, pct: number) => string;
  sel: string | null;
}

function Vivienda({ s, P, uid, borde, pulsable, tinte, sel }: PartesProps<PlantaVivienda>): JSX.Element {
  const L = PLANTA;
  return (
    <g>
      {/* Recintos */}
      {s.recintos.map((r) => {
        const b = borde(r.elementoId);
        const activo = r.elementoId !== null && r.elementoId === sel;
        return pulsable(
          `r-${r.localId ?? "entrada"}`,
          r.elementoId,
          <>
            <rect
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              fill={activo ? tinte(P.accent, 12) : r.humedo ? tinte(P.accent, 4) : P.fondo}
              stroke={b.stroke}
              strokeWidth={b.w}
              strokeDasharray={b.dash}
            />
            <text x={r.x + 10} y={r.y + 20} fontSize={r.w < 100 ? 10.5 : 12} fontFamily={FUENTE_SANS} fill={P.texto2}>
              {r.nombre}
            </text>
            {r.sub && (
              <text x={r.x + 10} y={r.y + 34} fontSize={9.5} fontFamily={FUENTE_SANS} fill={P.texto3}>
                {r.w < 100 ? r.sub.replace("sale por rejilla", "sale") : r.sub}
              </text>
            )}
          </>,
        );
      })}
      {/* Pasillo y fachada */}
      <rect x={L.X0} y={L.Y_PASILLO} width={L.X1 - L.X0} height={L.Y_BAJA - L.Y_PASILLO} fill="none" stroke={P.ink} strokeWidth={1.2} />
      <rect x={L.X0} y={L.Y_TOP} width={L.X1 - L.X0} height={L.Y_FONDO - L.Y_TOP} fill="none" stroke={P.ink} strokeWidth={3} />

      {/* Puertas (pasos), aireadores y rejillas */}
      {s.puertas.map((p, i) => (
        <rect key={`pu-${i}`} x={p.x - 20} y={p.y - 4} width={40} height={8} fill={P.fondo} />
      ))}
      {s.admisiones.map((a) => (
        <rect key={`ad-${a.elementoId}`} x={a.x - 15} y={a.y - 4} width={30} height={8} fill={P.fondo} stroke={borde(a.elementoId).stroke} strokeWidth={1.2} />
      ))}
      {s.extracciones.map((e) => (
        <rect key={`ex-${e.elementoId}`} x={e.x} y={e.y} width={14} height={14} fill={P.slab} stroke={borde(e.elementoId).stroke} strokeWidth={1.2} />
      ))}
      {s.campana &&
        pulsable(
          "campana",
          s.campana.elementoId,
          <>
            <rect
              x={s.campana.x - 28}
              y={s.campana.y - 9}
              width={56}
              height={18}
              rx={2}
              fill={s.campana.elementoId === sel ? tinte(P.accent, 14) : P.fondo}
              stroke={borde(s.campana.elementoId).stroke}
              strokeWidth={1.2}
            />
            <text x={s.campana.x} y={s.campana.y + 4} fontSize={9} textAnchor="middle" fontFamily={FUENTE_SANS} fill={P.texto3}>
              campana
            </text>
          </>,
        )}

      {/* Camino del aire */}
      <g stroke={P.texto3} strokeWidth={1.6} markerEnd={`url(#${uid}-m)`}>
        {s.flechas.map((f, i) => (
          <line key={`f-${i}`} x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} />
        ))}
      </g>

      {/* Lo que entra y lo que sale */}
      <text x={L.X0} y={L.Y_ENTRA + 12} fontSize={10} letterSpacing={1} fontFamily={FUENTE_MONO} fill={P.texto3}>
        ENTRA
      </text>
      <text x={L.X0} y={L.Y_SALE + 12} fontSize={10} letterSpacing={1} fontFamily={FUENTE_MONO} fill={P.texto3}>
        SALE
      </text>
      {[
        ...s.entra.map((g) => ({ ...g, y: L.Y_ENTRA })),
        ...s.sale.map((g) => ({ ...g, y: L.Y_SALE })),
      ].map((g, i) =>
        pulsable(
          `seg-${i}`,
          g.elementoId,
          <>
            <rect
              x={g.x}
              y={g.y}
              width={Math.max(0.5, g.w)}
              height={16}
              fill={g.anadido ? tinte(P.accent, 18) : g.elementoId === sel ? tinte(P.accent, 10) : P.slab}
              stroke={g.anadido ? P.accent : P.wall}
              strokeWidth={1}
            />
            {g.w >= 20 && (
              <text x={g.x + g.w / 2} y={g.y + 12} fontSize={10} textAnchor="middle" fontFamily={FUENTE_MONO} fill={g.anadido ? P.accent : P.texto2}>
                {g.texto}
              </text>
            )}
          </>,
        ),
      )}
      <text x={L.X_BARRAS + L.W_BARRAS + 14} y={L.Y_SALE + 30} fontSize={10} fontFamily={FUENTE_SANS} fill={P.texto3}>
        la campana va aparte
      </text>
    </g>
  );
}

function Garaje({ s, P, uid, borde, pulsable, tinte, sel }: PartesProps<PlantaGaraje>): JSX.Element {
  const r = s.recinto;
  return (
    <g>
      {r && (
        <>
          <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={P.fondo} stroke={P.ink} strokeWidth={3} />
          {s.plazas.map((p) => (
            <g key={`p-${p.n}`}>
              <rect x={p.x} y={p.y} width={p.w} height={p.h} fill="none" stroke={P.wall} strokeWidth={1} />
              <text x={p.x + p.w / 2} y={p.y + p.h / 2 + 4} fontSize={10} textAnchor="middle" fontFamily={FUENTE_MONO} fill={P.texto3}>
                {p.n}
              </text>
            </g>
          ))}
        </>
      )}
      {s.rampa && (
        <g>
          <rect x={s.rampa.x - 2} y={s.rampa.y0} width={6} height={s.rampa.y1 - s.rampa.y0} fill={P.fondo} />
          <line
            x1={s.rampa.x + 100}
            y1={(s.rampa.y0 + s.rampa.y1) / 2}
            x2={s.rampa.x + 10}
            y2={(s.rampa.y0 + s.rampa.y1) / 2}
            stroke={P.texto3}
            strokeWidth={1.6}
            markerEnd={`url(#${uid}-m)`}
          />
          <text x={s.rampa.x + 12} y={s.rampa.y0 + 22} fontSize={11} fontFamily={FUENTE_SANS} fill={P.texto2}>
            Rampa
          </text>
        </g>
      )}
      {s.conducto &&
        pulsable(
          "conducto",
          s.conducto.elementoId,
          <>
            <path d={s.conducto.d} stroke={borde(s.conducto.elementoId).stroke} strokeWidth={s.conducto.elementoId === sel ? 5 : 4} fill="none" />
            <text x={(r?.x ?? 0) + (r?.w ?? 0) - 26} y={50} fontSize={10} textAnchor="end" fontFamily={FUENTE_SANS} fill={P.texto3}>
              a cubierta ↑
            </text>
          </>,
        )}
      {s.rejillas.map((g, i) => (
        <rect key={`rj-${i}`} x={g.x - 6} y={g.y - 6} width={12} height={12} fill={P.slab} stroke={P.ink} strokeWidth={1.2} />
      ))}
      {s.mixtas.map((m, i) => (
        <rect key={`mx-${i}`} x={m.x} y={m.y} width={m.w} height={m.h} fill={tinte(P.accent, 20)} stroke={P.accent} strokeWidth={1} />
      ))}
      {s.co.map((c, i) => (
        <g key={`co-${i}`}>
          <circle cx={c.x} cy={c.y} r={9} fill={P.fondo} stroke={P.ink} strokeWidth={1.2} />
          <text x={c.x} y={c.y + 3} fontSize={7.5} textAnchor="middle" fontFamily={FUENTE_SANS} fill={P.texto2}>
            CO
          </text>
        </g>
      ))}
      {s.trasteros &&
        pulsable(
          "trasteros",
          s.trasteros.elementoId,
          <>
            <rect
              x={s.trasteros.x}
              y={s.trasteros.y}
              width={s.trasteros.w}
              height={s.trasteros.h}
              fill={s.trasteros.elementoId === sel ? tinte(P.accent, 12) : tinte(P.accent, 4)}
              stroke={borde(s.trasteros.elementoId).stroke}
              strokeWidth={1.2}
            />
            <text x={s.trasteros.x + 10} y={s.trasteros.y + 20} fontSize={11} fontFamily={FUENTE_SANS} fill={P.texto2}>
              Trasteros
            </text>
            <text x={s.trasteros.x + 10} y={s.trasteros.y + 34} fontSize={10} fontFamily={FUENTE_MONO} fill={P.texto3}>
              {s.trasteros.texto}
            </text>
          </>,
        )}
      <text x={PLANTA.X0} y={440} fontSize={11} fontFamily={FUENTE_SANS} fill={P.texto3}>
        {s.rotulo}
      </text>
    </g>
  );
}

/**
 * El dibujo de HS3 en papel, para el clon oculto que rasteriza la ficha: la
 * parte indicada (la primera vivienda tipo, por defecto) con las cifras dentro.
 */
export function DibujoPdfHs3({
  j,
  parte,
  revisados,
  width,
  height,
}: {
  j: JustificacionHs3;
  parte: string | null;
  revisados: readonly string[];
  width: number;
  height: number;
}): JSX.Element | null {
  const p = parte ?? j.partes[0]?.id ?? null;
  const dibujo = p ? calcularDibujoHs3(j, p) : null;
  if (!p || !dibujo) return null;
  const estados = estadosElementos(j.elementos, j.avisos, revisados);
  const textos = Object.fromEntries(j.elementos.map((el) => [el.id, textoEtiqueta(el)]));
  return (
    <PlantaHs3
      dibujo={dibujo}
      mode="pdf"
      width={width}
      height={height}
      titulo={`Ventilación (DB-HS3): ${j.partes.find((x) => x.id === p)?.nombre ?? ""}`}
      descripcion={describirDibujoHs3(j, p)}
      estados={estados}
      textos={textos}
    />
  );
}
