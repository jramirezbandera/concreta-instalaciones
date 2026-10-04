// =============================================================================
// DB-SI, SI 6 — El dibujo (feature-19): la sección con las zonas de cada planta,
// tres soportes por planta y el forjado de techo de cada una, pulsables, con la
// R de cada grupo de plantas. PURA; el render es el común.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi } from "../si/seccion";
import type { JustificacionSi6 } from "./justificacion";

const S = SECCION_BASE;
/** Dónde van los soportes, en fracción del ancho entre fachadas. */
const SOPORTES = [0.22, 0.5, 0.78];

export function dibujoSi6(j: JustificacionSi6, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const marcas: MarcaSi[] = [...marcasZonasNeutras(zonas)];
  const etiquetas: EtiquetaSi[] = [];
  const elementoDeNivel = (nivel: number): string | undefined => {
    const grupo = j.comp.edificio.plantas.find((p) => p.nivel === nivel)?.grupoId;
    return grupo && j.elementos.some((e) => e.id === `planta-${grupo}`) ? `planta-${grupo}` : undefined;
  };

  for (const p of base.pisos) {
    const id = elementoDeNivel(p.nivel);
    // El forjado de techo de la planta: lleva su R (es el suelo del sector de encima).
    marcas.push({ tipo: "linea", key: `forjado-${p.nivel}`, d: `M${S.X0} ${p.yTecho - S.LOSA / 2}H${S.X1}`, grosor: 4, elementoId: id, tono: "suave" });
    // Los soportes empiezan bajo el rótulo de las zonas para no taparlo.
    for (const f of SOPORTES) {
      const x = S.X0 + (S.X1 - S.X0) * f;
      marcas.push({ tipo: "linea", key: `soporte-${p.nivel}-${f}`, d: `M${x} ${p.yTecho + 18}V${p.ySuelo - 1}`, grosor: 5, elementoId: id, tono: "suave" });
    }
  }

  // La R de cada grupo, en su planta dibujada más alta, entre los dos primeros soportes.
  const vistos = new Set<string>();
  for (const p of base.pisos) {
    const id = elementoDeNivel(p.nivel);
    if (!id || vistos.has(id)) continue;
    vistos.add(id);
    etiquetas.push({ key: `et-${id}`, elementoId: id, x: S.X0 + (S.X1 - S.X0) * 0.36, y: (p.yTecho + p.ySuelo) / 2 });
  }
  if (j.elementos.some((e) => e.id === "hormigon")) {
    const arriba = base.pisos[0];
    etiquetas.push({ key: "et-hormigon", elementoId: "hormigon", x: S.X0 + (S.X1 - S.X0) * 0.66, y: arriba ? (arriba.yTecho + arriba.ySuelo) / 2 : S.ROOF + 30 });
  }

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada" });
}
