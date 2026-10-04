// =============================================================================
// DB-SI, SI 2 — El dibujo (feature-19): la sección con la medianera a la
// izquierda (si la hay), la fachada a la derecha con la franja de 1 m entre
// sectores, la separación entre sectores de una misma planta y la franja de la
// cubierta junto al colindante. PURA; el render es el común.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, pisoDe, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi } from "../si/seccion";
import type { JustificacionSi2 } from "./justificacion";

const S = SECCION_BASE;
const K = S.K;

export function dibujoSi2(j: JustificacionSi2, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const marcas: MarcaSi[] = [...marcasZonasNeutras(zonas)];
  const etiquetas: EtiquetaSi[] = [];
  const el = (id: string) => j.elementos.find((e) => e.id === id)?.detalle;
  const yR = base.yRasante;

  // La medianera, a la izquierda, de la cubierta a la rasante.
  const med = el("medianeras");
  if (med && med.clase === "medianeras" && med.tiene) {
    marcas.push({ tipo: "linea", key: "medianera", d: `M${S.X0 - 5} ${S.ROOF - 2}V${yR}`, grosor: 6, elementoId: "medianeras" });
    marcas.push({ tipo: "linea", key: "cubierta-franja", d: `M${S.X0} ${S.ROOF - 4}H${S.X0 + 0.5 * K}`, grosor: 5, elementoId: "cubierta" });
  }
  etiquetas.push({ key: "et-medianeras", elementoId: "medianeras", x: S.X0 + 80, y: S.ROOF + 22 });
  etiquetas.push({ key: "et-cubierta", elementoId: "cubierta", x: (S.X0 + S.X1) / 2, y: S.ROOF - 18 });

  // La franja vertical, en la fachada derecha, centrada en el forjado entre sectores.
  const v = el("vertical");
  if (v && v.clase === "vertical") {
    for (const x of v.encuentros) {
      const arriba = pisoDe(base, x.nivel + 1);
      if (!arriba) continue;
      const y = arriba.ySuelo + S.LOSA / 2;
      marcas.push({ tipo: "linea", key: `franja-${x.nivel}`, d: `M${S.X1 + 3} ${y - (0.5 * K)}V${y + 0.5 * K}`, grosor: 7, elementoId: "vertical" });
    }
    const primero = v.encuentros[0] ? pisoDe(base, v.encuentros[0].nivel + 1) : null;
    if (primero) etiquetas.push({ key: "et-vertical", elementoId: "vertical", x: S.X1 - 70, y: primero.ySuelo });
  }

  // La separación horizontal: entre las zonas de sectores distintos de una misma planta.
  const h = el("horizontal");
  if (h && h.clase === "horizontal") {
    for (const x of h.encuentros) {
      const ids = new Set(x.entre[0].zonas.map((z) => z.id));
      const fila = zonas.filter((z) => z.nivel === x.nivel && !z.enBanda);
      for (let i = 1; i < fila.length; i++) {
        if (ids.has(fila[i - 1].zonaId) !== ids.has(fila[i].zonaId)) {
          marcas.push({ tipo: "linea", key: `sep-${x.nivel}-${i}`, d: `M${fila[i].x0} ${fila[i].y0 + 4}V${fila[i].y1 - 4}`, grosor: 2, dash: "4 3", elementoId: "horizontal" });
          etiquetas.push({ key: `et-horizontal-${x.nivel}`, elementoId: "horizontal", x: Math.min(S.X1 - 70, fila[i].x0), y: (fila[i].y0 + fila[i].y1) / 2 + 14 });
        }
      }
    }
  }

  // La reacción al fuego, en la fachada, a media altura.
  const sobre = base.pisos.filter((p) => p.nivel >= 0);
  const yMedio = sobre.length > 0 ? (sobre[0].yTecho + sobre[sobre.length - 1].ySuelo) / 2 : yR - 40;
  etiquetas.push({ key: "et-reaccion", elementoId: "reaccion", x: S.X1 - 70, y: yMedio - 30 });

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada" });
}
