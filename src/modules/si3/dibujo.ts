// =============================================================================
// DB-SI, SI 3 — El dibujo (feature-19): la sección con la escalera común a la
// derecha (sus tramos en zigzag), su tramo especialmente protegido hasta el
// garaje con el vestíbulo, los recorridos de evacuación con flechas y la salida
// del edificio. PURA; el render es el común.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi } from "../si/seccion";
import type { JustificacionSi3 } from "./justificacion";

const S = SECCION_BASE;
/** La caja de la escalera, junto a la fachada derecha. */
const XE0 = S.X1 - 64;
const XE1 = S.X1 - 12;

export function dibujoSi3(j: JustificacionSi3, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const marcas: MarcaSi[] = [...marcasZonasNeutras(zonas)];
  const etiquetas: EtiquetaSi[] = [];
  const hay = (id: string) => j.elementos.some((e) => e.id === id);
  const salidas = j.elementos.find((e) => e.id === "salidas")?.detalle;
  const hastaEdificio = salidas?.clase === "salidas" && salidas.hastaEdificio;

  etiquetas.push({ key: "et-ocupacion", elementoId: "ocupacion", x: (S.X0 + S.X1) / 2 - 60, y: edificio.cubierta.tipo === "inclinada" ? 12 : S.ROOF - 18 });

  // La escalera común: un zigzag por planta, de la más alta a la PB.
  if (hay("escalera")) {
    for (const p of base.pisos.filter((x) => x.nivel > 0)) {
      const yA = p.yTecho + 6;
      const yB = p.ySuelo - 2;
      const ym = (yA + yB) / 2;
      marcas.push({ tipo: "linea", key: `tramo-${p.nivel}`, d: `M${XE1} ${ym}L${XE0} ${yB}M${XE0} ${yA}L${XE1} ${ym}`, grosor: 2, elementoId: "escalera" });
      // El tramo que baja a la planta de debajo.
      marcas.push({ tipo: "linea", key: `caja-${p.nivel}`, d: `M${XE0 - 2} ${yA - 4}V${yB + 4}`, grosor: 1.5, elementoId: "escalera", tono: "suave" });
    }
    const arriba = base.pisos.find((x) => x.nivel > 0);
    if (arriba) etiquetas.push({ key: "et-escalera", elementoId: "escalera", x: XE0 - 70, y: arriba.yTecho + 18 });
  }

  // Los recorridos de las plantas: desde la puerta más alejada hasta la escalera.
  if (hay("salidas")) {
    const pisos = base.pisos.filter((x) => x.nivel >= 0);
    const alto = pisos[0];
    if (alto) {
      const y = alto.ySuelo - 16;
      marcas.push({ tipo: "flecha", key: "recorrido", d: `M${S.X0 + 30} ${y}H${XE0 - 6}`, elementoId: "salidas" });
      etiquetas.push({ key: "et-salidas", elementoId: "salidas", x: (S.X0 + XE0) / 2 - 20, y: y - 16 });
    }
    // Con escalera no protegida, el recorrido sigue escalera abajo hasta la salida.
    const pb = pisos.find((x) => x.nivel === 0);
    if (pb && hastaEdificio && alto && alto.nivel > 0) {
      marcas.push({ tipo: "flecha", key: "baja", d: `M${XE1 + 6} ${alto.ySuelo - 10}V${pb.ySuelo - 22}`, elementoId: "salidas" });
    }
  }

  // La salida del edificio, en la fachada de la planta baja.
  const pb = base.pisos.find((x) => x.nivel === 0);
  if (pb && hay("puertas")) {
    marcas.push({ tipo: "flecha", key: "a-la-calle", d: `M${XE0} ${pb.ySuelo - 12}H${S.X1 + 22}`, elementoId: "puertas" });
    marcas.push({ tipo: "icono", key: "salida", icono: "salida", x: S.X1 + 12, y: pb.ySuelo - 30, elementoId: "puertas" });
    etiquetas.push({ key: "et-puertas", elementoId: "puertas", x: S.X1 - 50, y: pb.ySuelo - 46 });
  }

  // El garaje: escalera especialmente protegida con su vestíbulo y su recorrido.
  if (hay("escalera-garaje") && pb) {
    const garajes = base.pisos.filter((x) => x.nivel < 0);
    for (const g of garajes) {
      const yA = g.yTecho + 6;
      const yB = g.ySuelo - 2;
      const ym = (yA + yB) / 2;
      marcas.push({ tipo: "linea", key: `tramo-g-${g.nivel}`, d: `M${XE1} ${ym}L${XE0} ${yB}M${XE0} ${yA}L${XE1} ${ym}`, grosor: 2, elementoId: "escalera-garaje" });
      // El vestíbulo de independencia, delante de la escalera.
      marcas.push({ tipo: "linea", key: `vest-${g.nivel}`, d: `M${XE0 - 30} ${g.ySuelo - 26}H${XE0 - 4}V${g.ySuelo - 1}M${XE0 - 30} ${g.ySuelo - 26}V${g.ySuelo - 1}`, grosor: 1.5, elementoId: "escalera-garaje" });
    }
    const g0 = garajes[0];
    if (g0) {
      etiquetas.push({ key: "et-escalera-garaje", elementoId: "escalera-garaje", x: XE0 - 70, y: g0.yTecho + 16 });
      if (hay("garaje")) {
        const y = g0.ySuelo - 12;
        marcas.push({ tipo: "flecha", key: "recorrido-garaje", d: `M${S.X0 + 70} ${y}H${XE0 - 34}`, elementoId: "garaje" });
        etiquetas.push({ key: "et-garaje", elementoId: "garaje", x: (S.X0 + XE0) / 2, y: y - 18 });
      }
      if (hay("humo")) {
        marcas.push({ tipo: "icono", key: "humo", icono: "humo", x: S.X0 + 120, y: g0.yTecho + 14, elementoId: "humo" });
        etiquetas.push({ key: "et-humo", elementoId: "humo", x: S.X0 + 200, y: g0.yTecho + 16 });
      }
    }
  }

  const local = j.elementos.find((e) => e.detalle.clase === "local");
  if (local && local.detalle.clase === "local") {
    const id = local.detalle.zona.id;
    const z = zonas.find((x) => x.zonaId === id && !x.enBanda);
    if (z) etiquetas.push({ key: "et-local", elementoId: local.id, x: (z.x0 + z.x1) / 2, y: (z.y0 + z.y1) / 2 });
  }
  if (hay("unifamiliar")) {
    const alto = base.pisos[0];
    if (alto) etiquetas.push({ key: "et-unifamiliar", elementoId: "unifamiliar", x: (S.X0 + S.X1) / 2, y: (alto.yTecho + alto.ySuelo) / 2 });
  }

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada" });
}
