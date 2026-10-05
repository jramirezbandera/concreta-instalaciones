// =============================================================================
// REBT — El dibujo (feature-23): la sección del edificio con la previsión de
// cada zona (el grado de cada vivienda tipo, la carga de los locales y
// oficinas, del garaje y de las zonas comunes), el ascensor, los contadores
// donde van (el local de El edificio, el armario del portal o la caja de
// protección y medida de la unifamiliar) y la recarga en el garaje. Las cifras
// del edificio, en una columna a la derecha (como HE 4). PURA; el render es el
// común.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import {
  componerDibujo,
  marcasZonasNeutras,
  seccionConZonas,
  terrenoBajo,
  type DibujoSi,
  type EtiquetaSi,
  type MarcaSi,
  type ZonaDibujada,
} from "../si/seccion";
import { huecosEtiquetas } from "../sua/colocar";
import type { JustificacionRebt } from "./justificacion";
import { textoEtiquetaRebt } from "./textos";

const S = SECCION_BASE;
const ANCHO = S.W + 130;
const VIVIENDA = new Set(["viviendas", "vivienda_unifamiliar"]);
const COMUN = new Set(["zona_comun", "vestibulo"]);

export function dibujoRebt(j: JustificacionRebt, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const inclinada = edificio.cubierta.tipo === "inclinada";
  const yR = base.yRasante;
  const dibujadas = zonas.filter((z) => !z.enBanda);
  const ids = new Set(j.elementos.map((e) => e.id));
  const xCol = (S.X1 + ANCHO) / 2 + 8;
  const contadores = j.elementos.find((e) => e.id === "contadores")?.detalle;

  // El elemento de previsión de cada zona de viviendas: el de su primer tipo.
  const tipoDeZona = (z: ZonaDibujada): string | null => {
    if (!VIVIENDA.has(z.uso)) return null;
    if (j.unifamiliar) return j.viviendas[0]?.tipoId ?? null;
    const zona = edificio.grupos.flatMap((g) => g.zonas).find((x) => x.id === z.zonaId);
    const tipo = (zona?.unidades ?? []).find((u) => j.viviendas.some((v) => v.tipoId === u.tipoId) && u.cantidad > 0);
    return tipo?.tipoId ?? null;
  };
  const elementoDeZona = (z: ZonaDibujada): string | null => {
    const t = tipoDeZona(z);
    if (t) return ids.has(`vivienda-${t}`) ? `vivienda-${t}` : null;
    if ((z.uso === "local_sin_uso" || z.uso === "oficinas") && ids.has(`local-${z.zonaId}`)) return `local-${z.zonaId}`;
    if (z.uso === "garaje" && ids.has("garaje")) return "garaje";
    if (COMUN.has(z.uso) && ids.has("servicios")) return "servicios";
    if (contadores?.clase === "contadores" && contadores.cuarto?.zonaId === z.zonaId) return "contadores";
    return null;
  };

  const marcas: MarcaSi[] = marcasZonasNeutras(zonas).map((m) => {
    if (m.tipo !== "zona") return m;
    const id = elementoDeZona(m.zona);
    return id ? { ...m, elementoId: id } : m;
  });
  const etiquetas: EtiquetaSi[] = [];

  // ── El ascensor, en la zona común de cada planta ─────────────────────────
  if (j.ascensor) {
    for (const z of dibujadas) {
      if (z.uso === "zona_comun") marcas.push({ tipo: "icono", key: `ascensor-${z.zonaId}-${z.nivel}`, icono: "ascensor", x: z.x1 - 12, y: z.y0 + 14, elementoId: "servicios" });
    }
  }

  // ── Los contadores ───────────────────────────────────────────────────────
  if (contadores?.clase === "contadores") {
    const enCuarto = contadores.cuarto ? dibujadas.find((z) => z.zonaId === contadores.cuarto!.zonaId) : undefined;
    const portal = dibujadas.find((z) => z.nivel === 0 && COMUN.has(z.uso));
    const pb = dibujadas.filter((z) => z.nivel === 0);
    const donde = enCuarto ?? portal ?? pb[pb.length - 1];
    if (donde) marcas.push({ tipo: "icono", key: "contadores", icono: "contador", x: donde.x1 - 12, y: donde.y1 - 11, elementoId: "contadores" });
  }

  // ── La recarga, en el garaje ─────────────────────────────────────────────
  for (const z of dibujadas) {
    if (z.uso === "garaje" && ids.has("recarga")) marcas.push({ tipo: "icono", key: `recarga-${z.zonaId}-${z.nivel}`, icono: "recarga", x: z.x1 - 12, y: z.y1 - 11, elementoId: "recarga" });
    if (z.uso === "garaje_privado" && j.unifamiliar && j.viviendas[0]?.motivos.includes("recarga")) {
      marcas.push({ tipo: "icono", key: `recarga-${z.zonaId}`, icono: "recarga", x: z.x1 - 12, y: z.y1 - 11, elementoId: `vivienda-${j.viviendas[0].tipoId}` });
    }
  }

  // ── Las etiquetas de las zonas, sin pisar iconos ni rótulos ───────────────
  const huecos = huecosEtiquetas(base, zonas, marcas);
  let debajo = 0;
  const poner = (elementoId: string, preds: ((z: ZonaDibujada) => boolean)[]) => {
    const el = j.elementos.find((e) => e.id === elementoId);
    if (!el) return;
    const texto = textoEtiquetaRebt(el);
    for (const p of preds) {
      const h = huecos.tomar(p, texto, false);
      if (h) {
        etiquetas.push({ key: `et-${elementoId}`, elementoId, x: h.x, y: h.y });
        return;
      }
    }
    etiquetas.push({ key: `et-${elementoId}`, elementoId, x: (S.X0 + S.X1) / 2, y: terrenoBajo(base) + 22 * ++debajo });
  };
  for (const v of j.viviendas) poner(`vivienda-${v.tipoId}`, [(z) => tipoDeZona(z) === v.tipoId, (z) => VIVIENDA.has(z.uso)]);
  for (const el of j.elementos) {
    if (el.detalle.clase === "local") {
      const zonaId = el.detalle.zonaId;
      poner(el.id, [(z) => z.zonaId === zonaId]);
    }
  }
  if (ids.has("garaje")) poner("garaje", [(z) => z.uso === "garaje"]);
  if (ids.has("recarga")) poner("recarga", [(z) => z.uso === "garaje"]);
  if (ids.has("servicios")) poner("servicios", [(z) => COMUN.has(z.uso) && z.nivel === 0, (z) => COMUN.has(z.uso)]);

  // ── La columna de la derecha, de abajo arriba: contadores, total y viviendas ─
  // (la documentación, solo en la lista: no es de ningún sitio del edificio).
  const PASO = 34;
  let y = yR - 46;
  etiquetas.push({ key: "et-contadores", elementoId: "contadores", x: xCol, y });
  y -= PASO;
  etiquetas.push({ key: "et-total", elementoId: "total", x: xCol, y });
  if (ids.has("viviendas")) {
    y -= PASO;
    etiquetas.push({ key: "et-viviendas", elementoId: "viviendas", x: xCol, y });
  }

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: inclinada, ancho: ANCHO });
}
