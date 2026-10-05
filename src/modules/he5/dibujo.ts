// =============================================================================
// DB-HE 5 — El dibujo (feature-22): la sección del edificio con todas sus zonas
// (la superficie construida que cuenta, también el garaje), la cubierta no
// transitable que da Sc y, sobre ella, los paneles de la generación renovable y
// los captadores solares de HE 4. Las cifras, en una columna a la derecha (como
// SUA 8). PURA; el render es el común del DB-SI.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, seccionConZonas, terrenoBajo, type DibujoSi, type EtiquetaSi, type MarcaSi } from "../si/seccion";
import type { JustificacionHe5 } from "./justificacion";

const S = SECCION_BASE;
/** Con la columna de cifras a la derecha, el dibujo es más ancho que la sección común. */
const ANCHO = S.W + 130;

/** Altura de la cubierta en x: plana, a la cota del forjado; inclinada, sobre el faldón. */
function yCubierta(x: number, inclinada: boolean): number {
  if (!inclinada) return S.ROOF;
  const xm = (S.X0 + S.X1) / 2;
  const xb = x >= xm ? S.X1 + 14 : S.X0 - 14;
  return S.ROOF + 2 - (32 * Math.abs(xb - x)) / Math.abs(xb - xm);
}

export function dibujoHe5(j: JustificacionHe5, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const inclinada = edificio.cubierta.tipo === "inclinada";
  const ids = new Set(j.elementos.map((e) => e.id));
  // Todas las zonas cuentan en S: pulsarlas lleva a la superficie.
  const marcas: MarcaSi[] = marcasZonasNeutras(zonas).map((m) => (m.tipo === "zona" ? { ...m, elementoId: "superficie" } : m));
  const etiquetas: EtiquetaSi[] = [];
  const xCol = (S.X1 + ANCHO) / 2 + 8;

  const p2 = j.elementos.find((e) => e.id === "p2")?.detalle;
  if (p2 && p2.clase === "p2") {
    // La cubierta que cuenta para Sc: una línea sobre el forjado (o el faldón al sur).
    if (p2.sc_m2 > 0) {
      const d = inclinada
        ? `M${(S.X0 + S.X1) / 2 + 6} ${yCubierta((S.X0 + S.X1) / 2 + 6, true) - 4}L${S.X1 + 6} ${yCubierta(S.X1 + 6, true) - 4}`
        : `M${S.X0 + 4} ${S.ROOF - 4}H${S.X1 - 4}`;
      marcas.push({ tipo: "linea", key: "sc", d, grosor: 2, elementoId: "p2", dash: "6 4", tono: "suave" });
    }
    // Los captadores solares de HE 4, a la izquierda de los paneles.
    if (p2.captadores.solar) {
      const x = inclinada ? (S.X0 + S.X1) / 2 + 40 : S.X0 + 40;
      marcas.push({ tipo: "icono", key: "captador", icono: "captador", x, y: yCubierta(x, inclinada) - 14, elementoId: "p2" });
    }
  }

  if (ids.has("potencia")) {
    // Tres paneles sobre la cubierta, hacia la derecha.
    const xs = inclinada ? [S.X1 - 110, S.X1 - 80, S.X1 - 50] : [S.X1 - 150, S.X1 - 120, S.X1 - 90];
    xs.forEach((x, i) => marcas.push({ tipo: "icono", key: `panel-${i}`, icono: "fotovoltaica", x, y: yCubierta(x, inclinada) - 14, elementoId: "potencia" }));
    const yP = Math.min(...xs.map((x) => yCubierta(x, inclinada))) - 40;
    etiquetas.push({ key: "et-potencia", elementoId: "potencia", x: xs[1], y: Math.max(12, yP) });
  }

  // La columna de la derecha, de abajo arriba: S, P1 y P2.
  const PASO = 28;
  // Arranca por encima del rótulo «terreno» de la rasante.
  let y = base.yRasante - 46;
  etiquetas.push({ key: "et-superficie", elementoId: "superficie", x: xCol, y });
  if (ids.has("p1")) {
    y -= PASO;
    etiquetas.push({ key: "et-p1", elementoId: "p1", x: xCol, y });
  }
  if (ids.has("p2")) {
    y -= PASO;
    etiquetas.push({ key: "et-p2", elementoId: "p2", x: xCol, y: Math.min(y, S.ROOF + 4) });
  }
  // El garaje, dentro de S: un rótulo bajo el terreno si lo hay.
  if (j.superficies.garaje_m2 > 0 && base.haySotano) {
    marcas.push({ tipo: "texto", key: "garaje-cuenta", x: (S.X0 + S.X1) / 2, y: terrenoBajo(base) + 16, texto: "el garaje cuenta en S", ancla: "middle" });
  }

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: inclinada, ancho: ANCHO });
}
