// =============================================================================
// DB-SUA, SUA 8 — El dibujo (feature-20): la sección del edificio con la altura
// H, la superficie de captura a 3H a cada lado sobre el terreno y, si se
// proyecta, la instalación (el captador en la cubierta y una bajante por la
// fachada). PURA; el render es el común del DB-SI.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi } from "../si/seccion";
import type { JustificacionSua8 } from "./justificacion";

const S = SECCION_BASE;
/** Con la superficie de captura a la derecha, el dibujo es más ancho que la sección común. */
const ANCHO = S.W + 130;

export function dibujoSua8(j: JustificacionSua8, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const x0 = S.X0;
  const x1 = S.X1;
  const yR = base.yRasante;
  const yCub = S.ROOF;
  const inclinada = edificio.cubierta.tipo === "inclinada";
  const yTope = inclinada ? 22 : yCub - 10;
  const marcas: MarcaSi[] = [...marcasZonasNeutras(zonas)];
  const etiquetas: EtiquetaSi[] = [];
  /** La columna de la derecha, entre la fachada y el borde: la cota H y las cuentas. */
  const xCota = x1 + 18;
  const xCol = (x1 + ANCHO) / 2 + 8;

  // La superficie de captura: una línea sobre el terreno a cada lado, más allá del dibujo.
  marcas.push(
    { tipo: "linea", key: "captura-izq", d: `M${x0 - 4} ${yR + 10}H8`, grosor: 2.5, elementoId: "altura", dash: "6 4", tono: "suave" },
    { tipo: "linea", key: "captura-der", d: `M${x1 + 4} ${yR + 10}H${ANCHO - 8}`, grosor: 2.5, elementoId: "altura", dash: "6 4", tono: "suave" },
    { tipo: "texto", key: "t-3h-izq", x: (8 + x0) / 2, y: yR + 24, texto: "3H", ancla: "middle" },
    { tipo: "texto", key: "t-3h-der", x: (x1 + ANCHO) / 2, y: yR + 24, texto: "3H", ancla: "middle" },
  );
  // La altura H junto a la fachada, de la rasante al remate.
  marcas.push({ tipo: "flecha", key: "cota-h", d: `M${xCota} ${yR}V${yTope}`, elementoId: "altura" });

  // El rayo sobre la cubierta y la conclusión.
  const xRayo = (x0 + x1) / 2;
  const yRayo = Math.max(10, yTope - 14);
  marcas.push({ tipo: "icono", key: "rayo", icono: "rayo", x: xRayo, y: yRayo, elementoId: "proteccion" });
  etiquetas.push({ key: "et-proteccion", elementoId: "proteccion", x: xRayo + 92, y: yRayo });

  if (j.decisiones.instalacion === "si") {
    // Captador sobre la cubierta y bajante por la fachada derecha hasta el terreno.
    marcas.push(
      { tipo: "linea", key: "malla", d: `M${x0 + 6} ${yCub - 4}H${x1 - 6}`, grosor: 2, elementoId: "sistema", tono: "fuerte" },
      { tipo: "linea", key: "bajante", d: `M${x1 + 6} ${yCub - 4}V${yR + 4}`, grosor: 2, elementoId: "sistema", tono: "fuerte" },
    );
  }

  // La columna de la derecha, de abajo arriba: Na, Ne, el sistema y H.
  const PASO = 28;
  let y = yR - 18;
  etiquetas.push({ key: "et-na", elementoId: "na", x: xCol, y });
  y -= PASO;
  etiquetas.push({ key: "et-ne", elementoId: "ne", x: xCol, y });
  if (j.decisiones.instalacion === "si") {
    y -= PASO;
    etiquetas.push({ key: "et-sistema", elementoId: "sistema", x: xCol, y });
  }
  etiquetas.push({ key: "et-altura", elementoId: "altura", x: xCol, y: Math.min(yTope + 16, y - PASO) });

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: inclinada, ancho: ANCHO });
}
