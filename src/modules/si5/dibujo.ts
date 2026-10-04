// =============================================================================
// DB-SI, SI 5 — El dibujo (feature-19): la sección del edificio con la calle a
// la derecha, el camión de bomberos y la cota hasta la fachada, y los huecos de
// acceso de cada planta en esa fachada. PURA; el render es el común.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi } from "../si/seccion";
import type { JustificacionSi5 } from "./justificacion";

const S = SECCION_BASE;
/** Con la calle a la derecha, el dibujo es más ancho que la sección común. */
const ANCHO = 780;
const X_CAMION = 700;
/** Px por metro de altura de planta: el alféizar y el hueco, a escala. */
const K = S.K;

export function dibujoSi5(j: JustificacionSi5, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const yR = base.yRasante;
  const marcas: MarcaSi[] = [...marcasZonasNeutras(zonas)];
  const etiquetas: EtiquetaSi[] = [];
  const hay = (id: string) => j.elementos.some((e) => e.id === id);

  // La calle y el camión.
  marcas.push(
    { tipo: "texto", key: "calle", x: (S.X1 + ANCHO) / 2, y: yR + 16, texto: "calle", ancla: "middle" },
    { tipo: "icono", key: "camion", icono: "camion", x: X_CAMION, y: yR - 11, elementoId: "maniobra" },
  );
  if (j.exige) {
    marcas.push({ tipo: "flecha", key: "cota", d: `M${X_CAMION - 18} ${yR - 32}H${S.X1 + 6}`, elementoId: "maniobra" });
  }
  etiquetas.push({ key: "et-maniobra", elementoId: "maniobra", x: X_CAMION - 6, y: yR - 50 });
  if (hay("vial")) etiquetas.push({ key: "et-vial", elementoId: "vial", x: X_CAMION - 10, y: yR + 34 });

  // Los huecos de la fachada accesible, en cada planta sobre rasante.
  if (hay("fachada")) {
    for (const p of base.pisos.filter((x) => x.nivel >= 0)) {
      const alfeizar = p.ySuelo - 1.2 * K;
      const dintel = Math.max(p.yTecho + 4, alfeizar - 1.2 * K);
      marcas.push({ tipo: "linea", key: `hueco-${p.nivel}`, d: `M${S.X1} ${alfeizar}V${dintel}`, grosor: 4, elementoId: "fachada" });
    }
    const sobre = base.pisos.filter((x) => x.nivel >= 0);
    const yMedio = sobre.length > 0 ? (sobre[0].yTecho + sobre[sobre.length - 1].ySuelo) / 2 : yR - 40;
    etiquetas.push({ key: "et-fachada", elementoId: "fachada", x: S.X1 - 84, y: yMedio });
  }

  // La altura de evacuación, sobre la cubierta.
  etiquetas.push({ key: "et-altura", elementoId: "altura", x: (S.X0 + S.X1) / 2, y: edificio.cubierta.tipo === "inclinada" ? 12 : S.ROOF - 18 });
  if (hay("forestal")) etiquetas.push({ key: "et-forestal", elementoId: "forestal", x: 34, y: yR + 30 });

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada", ancho: ANCHO });
}
