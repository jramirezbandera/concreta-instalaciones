// =============================================================================
// DB-SI, SI 4 — El dibujo (feature-19): la sección con un extintor en cada
// planta con orígenes de evacuación y junto a cada local de riesgo, las BIE y los
// detectores donde se exigen, la columna seca en la escalera y el hidrante en la
// calle. PURA; el render es el común.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi, type ZonaDibujada } from "../si/seccion";
import type { JustificacionSi4 } from "./justificacion";

const S = SECCION_BASE;
const ANCHO = 700;

export function dibujoSi4(j: JustificacionSi4, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const marcas: MarcaSi[] = [...marcasZonasNeutras(zonas)];
  const etiquetas: EtiquetaSi[] = [];
  const el = (id: string) => j.elementos.find((e) => e.id === id);
  const exige = (id: string) => {
    const d = el(id)?.detalle;
    return d !== undefined && (d.clase === "dotacion" || d.clase === "hidrantes") && d.exige;
  };
  const dibujadas = zonas.filter((z) => !z.enBanda);
  const yIcono = (z: ZonaDibujada) => z.y1 - 14;

  // Extintores: uno por planta con orígenes, en la zona común si la hay; y junto a cada local de riesgo.
  const ext = el("extintores")?.detalle;
  if (ext && ext.clase === "extintores") {
    const locales = new Set(ext.locales.map((z) => z.id));
    let primero = true;
    for (const p of ext.plantas) {
      const zs = dibujadas.filter((z) => z.nivel === p.nivel && p.zonas.some((x) => x.id === z.zonaId) && !locales.has(z.zonaId));
      const z = zs.find((x) => x.uso === "zona_comun" || x.uso === "vestibulo") ?? zs[0];
      if (!z) continue;
      // Bajo rasante, el rótulo de la planta va dentro, a la izquierda.
      const x = z.x0 + (z.nivel < 0 ? 96 : 16);
      marcas.push({ tipo: "icono", key: `ext-${p.nivel}`, icono: "extintor", x, y: yIcono(z), elementoId: "extintores" });
      if (primero) {
        etiquetas.push({ key: "et-extintores", elementoId: "extintores", x: Math.max(S.X0 + 70, x + 40), y: yIcono(z) - 22 });
        primero = false;
      }
    }
    for (const z of dibujadas.filter((x) => locales.has(x.zonaId))) {
      marcas.push({ tipo: "icono", key: `ext-local-${z.zonaId}`, icono: "extintor", x: z.x0 + 12, y: yIcono(z), elementoId: "extintores" });
    }
  }

  // BIE y detección en el garaje (o en el edificio).
  const garaje = dibujadas.find((z) => z.uso === "garaje");
  if (garaje) {
    if (exige("bie")) {
      marcas.push({ tipo: "icono", key: "bie", icono: "bie", x: garaje.x1 - 22, y: yIcono(garaje), elementoId: "bie" });
      etiquetas.push({ key: "et-bie", elementoId: "bie", x: Math.min(S.X1 - 60, garaje.x1 - 70), y: yIcono(garaje) - 22 });
    }
    const det = el("deteccion")?.detalle;
    if (det && det.clase === "dotacion" && (det.exige || det.nota)) {
      for (const f of [0.3, 0.55, 0.8]) {
        marcas.push({ tipo: "icono", key: `det-${f}`, icono: "detector", x: garaje.x0 + (garaje.x1 - garaje.x0) * f, y: garaje.y0 + 10, elementoId: "deteccion" });
      }
      etiquetas.push({ key: "et-deteccion", elementoId: "deteccion", x: garaje.x0 + (garaje.x1 - garaje.x0) * 0.55, y: garaje.y0 + 32 });
    }
  }

  // Columna seca: una toma por planta en la escalera.
  if (exige("columna")) {
    const escaleras = dibujadas.filter((z) => z.uso === "zona_comun");
    for (const z of escaleras) marcas.push({ tipo: "icono", key: `col-${z.nivel}`, icono: "columna", x: z.x1 - 14, y: yIcono(z), elementoId: "columna" });
    if (escaleras[0]) etiquetas.push({ key: "et-columna", elementoId: "columna", x: Math.min(S.X1 - 60, escaleras[0].x1 - 50), y: yIcono(escaleras[0]) - 22 });
  }

  // El hidrante, en la calle.
  const yR = base.yRasante;
  marcas.push({ tipo: "icono", key: "hidrante", icono: "hidrante", x: S.X1 + 50, y: yR - 9, elementoId: "hidrantes" });
  etiquetas.push({ key: "et-hidrantes", elementoId: "hidrantes", x: S.X1 + 40, y: yR + 26 });

  const local = j.elementos.find((e) => e.detalle.clase === "local");
  if (local && local.detalle.clase === "local") {
    const zl = local.detalle.zona.id;
    const z = dibujadas.find((x) => x.zonaId === zl);
    if (z) etiquetas.push({ key: "et-local", elementoId: local.id, x: (z.x0 + z.x1) / 2, y: (z.y0 + z.y1) / 2 });
  }

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada", ancho: ANCHO });
}
