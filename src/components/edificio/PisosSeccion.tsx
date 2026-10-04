// =============================================================================
// La base de la sección de El edificio (feature-15 §B): terreno y rasante,
// muros, forjados, bandas de plantas iguales y el nombre y la cota de cada
// planta. Lo que cada módulo dibuja encima (la red de HS5, los montantes de HS4,
// la barrera de HS6) va después, en su propio componente.
//
// Las paletas de pantalla y de papel están en `lib/svg/paletaSeccion.ts`.
// =============================================================================

import type { JSX } from "react";
import { SECCION_BASE, type BaseSeccion } from "../../lib/edificio/seccion";
import { FUENTE_MONO, FUENTE_SANS, type PaletaSeccion } from "../../lib/svg/paletaSeccion";

interface PisosSeccionProps {
  base: Pick<BaseSeccion, "pisos" | "bandas" | "cotaCubierta" | "yRasante" | "yFondoEdificio">;
  /** Ancho y alto del viewBox. */
  ancho: number;
  alto: number;
  /** Bajo el edificio, el terreno empieza aquí (bajo la solera o bajo el colector enterrado). */
  yTerrenoBajo: number;
  P: PaletaSeccion;
  /** Prefijo único de ids (el patrón del terreno). */
  uid: string;
  /** Fachada derecha (por defecto, la de la sección común). HS4 la acerca para la gráfica. */
  x1?: number;
  /** Terreno a la derecha del edificio (por defecto sí). */
  terrenoDerecha?: boolean;
}

export function PisosSeccion({
  base: s,
  ancho,
  alto,
  yTerrenoBajo,
  P,
  uid,
  x1,
  terrenoDerecha = true,
}: PisosSeccionProps): JSX.Element {
  const S = { ...SECCION_BASE, X1: x1 ?? SECCION_BASE.X1 };
  const yR = s.yRasante;
  const altoTerreno = alto - yR;
  return (
    <g>
      <defs>
        <pattern id={`${uid}-tierra`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="7" stroke={P.earth} strokeWidth="1.2" />
        </pattern>
      </defs>

      {/* Terreno y rasante */}
      <rect x={0} y={yR + 2} width={S.X0} height={altoTerreno} fill={`url(#${uid}-tierra)`} />
      {terrenoDerecha && (
        <rect x={S.X1} y={yR + 2} width={ancho - S.X1} height={altoTerreno} fill={`url(#${uid}-tierra)`} />
      )}
      <rect x={S.X0} y={yTerrenoBajo} width={S.X1 - S.X0} height={alto - yTerrenoBajo} fill={`url(#${uid}-tierra)`} />
      <line x1={0} y1={yR} x2={S.X0} y2={yR} stroke={P.ink} strokeWidth={1.5} />
      {terrenoDerecha && <line x1={S.X1} y1={yR} x2={ancho} y2={yR} stroke={P.ink} strokeWidth={1.5} />}

      {/* Muros y forjados */}
      <line x1={S.X0} y1={S.ROOF} x2={S.X0} y2={s.yFondoEdificio} stroke={P.wall} strokeWidth={1.5} />
      <line x1={S.X1} y1={S.ROOF} x2={S.X1} y2={s.yFondoEdificio} stroke={P.wall} strokeWidth={1.5} />
      <rect x={S.X0} y={S.ROOF} width={S.X1 - S.X0} height={S.LOSA} fill={P.slab} />
      {s.pisos.map((p) => (
        <rect key={`losa-${p.nivel}`} x={S.X0} y={p.ySuelo} width={S.X1 - S.X0} height={S.LOSA} fill={P.slab} />
      ))}
      {s.bandas.map((b) => (
        <g key={`banda-${b.niveles[0]}`}>
          <rect x={S.X0} y={b.y0} width={S.X1 - S.X0} height={b.y1 - b.y0} fill={P.fondo} opacity={0.6} />
          <line x1={S.X0} y1={b.y0 + 4} x2={S.X1} y2={b.y0 + 4} stroke={P.slab} strokeWidth={2} strokeDasharray="6 5" />
          <line x1={S.X0} y1={b.y1 - 4} x2={S.X1} y2={b.y1 - 4} stroke={P.slab} strokeWidth={2} strokeDasharray="6 5" />
          <text x={S.X0 + 12} y={(b.y0 + b.y1) / 2 + 4} fontSize={10.5} fontFamily={FUENTE_SANS} fill={P.texto3}>
            {`⋮  ${b.texto}`}
          </text>
        </g>
      ))}

      {/* Plantas: nombre y cota */}
      {s.pisos.map((p) =>
        p.nivel >= 0 ? (
          <g key={`niv-${p.nivel}`}>
            <text x={10} y={p.ySuelo - 26} fontSize={12} fontWeight={600} fontFamily={FUENTE_SANS} fill={P.texto2}>
              {p.etiqueta}
            </text>
            <text x={10} y={p.ySuelo - 12} fontSize={10} fontFamily={FUENTE_MONO} fill={P.texto3}>
              {p.cota}
            </text>
          </g>
        ) : (
          <g key={`niv-${p.nivel}`}>
            <text x={S.X0 + 8} y={p.ySuelo - 10} fontSize={12} fontWeight={600} fontFamily={FUENTE_SANS} fill={P.texto2}>
              {p.etiqueta}
            </text>
            <text x={S.X0 + 28} y={p.ySuelo - 10} fontSize={10} fontFamily={FUENTE_MONO} fill={P.texto3}>
              {p.cota}
            </text>
          </g>
        ),
      )}
      <text x={10} y={S.ROOF - 4} fontSize={10} fontFamily={FUENTE_MONO} fill={P.texto3}>
        {s.cotaCubierta}
      </text>
    </g>
  );
}
