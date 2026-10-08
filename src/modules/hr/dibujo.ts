// =============================================================================
// DB-HR — El dibujo (feature-25): la sección del edificio con lo que separa a
// cada vivienda. Los forjados, tramo a tramo según lo que hay debajo (otra
// vivienda, la zona común, un local, el garaje o un cuarto de instalaciones);
// los encuentros entre zonas de una planta y, dentro de la zona de viviendas,
// la separación entre ellas; la medianera a la izquierda, la fachada a la
// derecha y la cubierta. Las cifras de los forjados y las separaciones van
// sobre su línea; el resto, en una columna a la derecha. PURA; el render es el
// común del DB-SI.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio, Zona } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, pisoDe, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi, type ZonaDibujada } from "../si/seccion";
import { claseRecinto, type ClaseRecinto } from "./edificio";
import type { JustificacionHr } from "./justificacion";

const S = SECCION_BASE;
const ANCHO = S.W + 130;

export function dibujoHr(j: JustificacionHr, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const ids = new Set(j.elementos.map((e) => e.id));
  // Lo que el proyectista dice que no linda no se dibuja.
  const noLinda = new Set(j.separaciones.colindancias.filter((c) => !c.linda).map((c) => c.clave));
  const zonaDe = new Map<string, Zona>();
  const grupoDe = new Map<string, string>();
  for (const g of edificio.grupos) {
    for (const z of g.zonas) {
      zonaDe.set(z.id, z);
      grupoDe.set(z.id, g.id);
    }
  }
  const clase = (z: ZonaDibujada): ClaseRecinto => {
    const zona = zonaDe.get(z.zonaId);
    return zona ? claseRecinto(zona) : "no_habitable";
  };
  const dibujadas = zonas.filter((z) => !z.enBanda);
  const yR = base.yRasante;

  const deZona = (z: ZonaDibujada): string | undefined => {
    const c = clase(z);
    if (c === "vivienda") return ids.has("separacion") ? "separacion" : ids.has("adosada") ? "adosada" : "tabiqueria";
    if (c === "actividad" || c === "instalaciones") return ids.has("separacion-actividad") ? "separacion-actividad" : ids.has("forjado-actividad") ? "forjado-actividad" : undefined;
    return undefined;
  };
  const marcas: MarcaSi[] = marcasZonasNeutras(zonas).map((m) => {
    if (m.tipo !== "zona") return m;
    const el = deZona(m.zona);
    return el ? { ...m, elementoId: el } : m;
  });
  const etiquetas: EtiquetaSi[] = [];
  const enLinea = new Set<string>();
  const etiquetar = (id: string, x: number, y: number) => {
    if (!ids.has(id) || enLinea.has(id)) return;
    enLinea.add(id);
    etiquetas.push({ key: `et-${id}`, elementoId: id, x: Math.max(S.X0 + 50, Math.min(S.X1 - 50, x)), y });
  };

  // ── Los forjados: un tramo por cada zona de la planta de abajo ─────────────
  for (const p of base.pisos) {
    const abajo = pisoDe(base, p.nivel - 1);
    if (!abajo) continue;
    const arriba = dibujadas.filter((z) => z.nivel === p.nivel);
    const debajo = dibujadas.filter((z) => z.nivel === abajo.nivel);
    const hayViviendaArriba = arriba.some((z) => clase(z) === "vivienda");
    const hayViviendaAbajo = debajo.some((z) => clase(z) === "vivienda");
    const y = p.ySuelo + S.LOSA / 2;
    for (const z of debajo) {
      const c = clase(z);
      let id: string | null = null;
      if (hayViviendaArriba && c !== "vivienda" && noLinda.has(`debajo:${z.zonaId}`)) continue;
      if (hayViviendaArriba) {
        if (c === "vivienda") id = ids.has("forjado-viviendas") ? "forjado-viviendas" : ids.has("forjado-adosada") ? "forjado-adosada" : null;
        else if (c === "comun" || c === "no_habitable") id = "forjado-comun";
        else id = "forjado-actividad";
      } else if (hayViviendaAbajo && c === "vivienda" && arriba.some((u) => (clase(u) === "actividad" || clase(u) === "instalaciones") && !noLinda.has(`encima:${u.zonaId}`))) {
        id = "forjado-encima";
      }
      if (!id || !ids.has(id)) continue;
      marcas.push({ tipo: "linea", key: `forjado-${p.nivel}-${z.zonaId}`, d: `M${z.x0 + 3} ${y}H${z.x1 - 3}`, grosor: 4, elementoId: id });
      etiquetar(id, (z.x0 + z.x1) / 2, y);
    }
  }

  // ── Las separaciones verticales de cada planta ────────────────────────────
  for (const p of base.pisos) {
    const fila = dibujadas.filter((z) => z.nivel === p.nivel);
    for (let i = 0; i < fila.length; i++) {
      const z = fila[i];
      const zona = zonaDe.get(z.zonaId);
      // Dentro de la zona de viviendas: entre ellas, si hay más de una.
      if (zona?.uso === "viviendas" && (zona.unidades ?? []).reduce((s, u) => s + u.cantidad, 0) > 1 && ids.has("separacion") && !noLinda.has(`entre:${grupoDe.get(z.zonaId)}`)) {
        const x = (z.x0 + z.x1) / 2;
        marcas.push({ tipo: "linea", key: `sv-${p.nivel}-${z.zonaId}`, d: `M${x} ${z.y0 + 4}V${z.y1 - 4}`, grosor: 3, elementoId: "separacion" });
        etiquetar("separacion", x, (z.y0 + z.y1) / 2);
      }
      if (i === 0) continue;
      const a = clase(fila[i - 1]);
      const b = clase(z);
      if (a !== "vivienda" && b !== "vivienda") continue;
      const otra = a === "vivienda" ? b : a;
      if (noLinda.has(`lado:${(a === "vivienda" ? z : fila[i - 1]).zonaId}`)) continue;
      const id = otra === "actividad" || otra === "instalaciones" ? "separacion-actividad" : otra === "vivienda" ? null : "separacion";
      if (!id || !ids.has(id)) continue;
      marcas.push({ tipo: "linea", key: `sv-${p.nivel}-${i}`, d: `M${z.x0} ${z.y0 + 4}V${z.y1 - 4}`, grosor: 3, elementoId: id });
      etiquetar(id, z.x0, (z.y0 + z.y1) / 2 + 14);
    }
  }

  // ── Medianera, fachada y cubierta ─────────────────────────────────────────
  const sobre = base.pisos.filter((p) => p.nivel >= 0);
  const yArriba = sobre.length > 0 ? sobre[0].yTecho : S.ROOF;
  if (ids.has("medianeria") || ids.has("adosada")) {
    marcas.push({ tipo: "linea", key: "medianera", d: `M${S.X0 - 5} ${S.ROOF - 2}V${yR}`, grosor: 6, elementoId: ids.has("medianeria") ? "medianeria" : "adosada" });
  }
  const fachada = ids.has("fachada-dormitorios") ? "fachada-dormitorios" : "fachada-estancias";
  marcas.push({ tipo: "linea", key: "fachada", d: `M${S.X1 + 4} ${yArriba}V${yR}`, grosor: 6, elementoId: fachada });
  if (ids.has("cubierta")) marcas.push({ tipo: "linea", key: "cubierta", d: `M${S.X0} ${S.ROOF - 4}H${S.X1}`, grosor: 5, elementoId: "cubierta" });

  // ── La columna de la derecha, de abajo arriba ─────────────────────────────
  const xCol = (S.X1 + ANCHO) / 2 + 8;
  const PASO = 30;
  let y = yR - 46;
  const columna = [
    "instalaciones",
    "puerta",
    "ascensor",
    "medianeria",
    "adosada",
    "tabiqueria",
    "forjado-viviendas",
    "forjado-comun",
    "forjado-actividad",
    "forjado-encima",
    "forjado-adosada",
    "separacion",
    "separacion-actividad",
    "fachada-estancias-pb",
    "fachada-dormitorios-pb",
    "fachada-estancias",
    "fachada-dormitorios",
    "cubierta",
  ].filter((id) => ids.has(id) && !enLinea.has(id));
  for (const id of columna) {
    etiquetas.push({ key: `et-${id}`, elementoId: id, x: xCol, y });
    y -= PASO;
  }

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada", ancho: ANCHO });
}
