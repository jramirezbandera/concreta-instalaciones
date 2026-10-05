// =============================================================================
// DB-HE 6 — El dibujo (feature-24): la sección del edificio con sus garajes (la
// conducción de cables y las estaciones de recarga), la plaza exterior o en la
// parcela junto al edificio y, en una columna a la derecha, las plazas, el
// esquema y la estación (como HE 5). PURA; el render es el común del DB-SI.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, seccionConZonas, terrenoBajo, type DibujoSi, type EtiquetaSi, type MarcaSi, type ZonaDibujada } from "../si/seccion";
import { huecosEtiquetas } from "../sua/colocar";
import type { JustificacionHe6 } from "./justificacion";
import { textoEtiquetaHe6 } from "./textos";

const S = SECCION_BASE;
const ANCHO = S.W + 130;
const GARAJE = new Set(["garaje", "garaje_privado"]);

export function dibujoHe6(j: JustificacionHe6, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const inclinada = edificio.cubierta.tipo === "inclinada";
  const ids = new Set(j.elementos.map((e) => e.id));
  const dibujadas = zonas.filter((z) => !z.enBanda);
  const deGaraje = ids.has("conduccion") ? "conduccion" : "plazas";
  const marcas: MarcaSi[] = marcasZonasNeutras(zonas).map((m) => (m.tipo === "zona" && GARAJE.has(m.zona.uso) ? { ...m, elementoId: deGaraje } : m));
  const etiquetas: EtiquetaSi[] = [];
  const xCol = (S.X1 + ANCHO) / 2 + 8;

  // ── Las estaciones, en cada garaje (la de la unifamiliar, el circuito C13) ──
  const conEstacion = ids.has("estaciones") ? "estaciones" : ids.has("estacion") ? "estacion" : null;
  if (conEstacion) {
    for (const z of dibujadas) {
      if (GARAJE.has(z.uso)) marcas.push({ tipo: "icono", key: `recarga-${z.zonaId}-${z.nivel}`, icono: "recarga", x: z.x1 - 12, y: z.y1 - 11, elementoId: conEstacion });
    }
  }

  // ── La plaza exterior, a la derecha del edificio, sobre el terreno ──────────
  const pz = j.elementos.find((e) => e.id === "plazas")?.detalle;
  if (pz && pz.clase === "plazas" && pz.exteriores > 0) {
    marcas.push({ tipo: "icono", key: "exterior", icono: "coche", x: S.X1 + 24, y: base.yRasante - 14, elementoId: "plazas" });
  }

  // ── La conducción, en el garaje, sin pisar iconos ni rótulos ───────────────
  const huecos = huecosEtiquetas(base, zonas, marcas);
  const el = j.elementos.find((e) => e.id === deGaraje);
  let enGaraje = false;
  if (el && dibujadas.some((z) => GARAJE.has(z.uso))) {
    const h = huecos.tomar((z: ZonaDibujada) => GARAJE.has(z.uso), textoEtiquetaHe6(el), false);
    etiquetas.push(h ? { key: `et-${el.id}`, elementoId: el.id, x: h.x, y: h.y } : { key: `et-${el.id}`, elementoId: el.id, x: (S.X0 + S.X1) / 2, y: terrenoBajo(base) + 22 });
    enGaraje = true;
  }

  // ── La columna de la derecha, de abajo arriba ─────────────────────────────
  const PASO = 30;
  let y = base.yRasante - 46;
  const columna = ["plazas", "conduccion", "estaciones", "esquema", "estacion"].filter((id) => ids.has(id) && !(enGaraje && id === el?.id));
  for (const id of columna) {
    etiquetas.push({ key: `et-${id}`, elementoId: id, x: xCol, y });
    y -= PASO;
  }

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: inclinada, ancho: ANCHO });
}
