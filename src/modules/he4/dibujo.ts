// =============================================================================
// DB-HE 4 — El dibujo (feature-22): la sección del edificio con la demanda de
// cada vivienda tipo (y de las oficinas) en sus plantas y la producción del ACS
// donde va: la bomba de calor en cada vivienda o en la cubierta, los captadores
// solares en la cubierta con su apoyo, la caldera de biomasa en el cuarto de
// instalaciones o la acometida de la red urbana. Las cifras del edificio, en una
// columna a la derecha (como SUA 8 y HE 5). PURA; el render es el común.
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
import type { JustificacionHe4 } from "./justificacion";
import { textoEtiquetaHe4 } from "./textos";

const S = SECCION_BASE;
const ANCHO = S.W + 130;
const VIVIENDA = new Set(["viviendas", "vivienda_unifamiliar"]);

export function dibujoHe4(j: JustificacionHe4, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const inclinada = edificio.cubierta.tipo === "inclinada";
  const yR = base.yRasante;
  const dibujadas = zonas.filter((z) => !z.enBanda);
  const ids = new Set(j.elementos.map((e) => e.id));
  const xCol = (S.X1 + ANCHO) / 2 + 8;

  // El elemento de demanda de cada zona de viviendas: el de su primer tipo.
  const tipoDeZona = (z: ZonaDibujada): string | null => {
    if (!VIVIENDA.has(z.uso)) return null;
    if (j.unifamiliar) return j.viviendas[0]?.tipoId ?? null;
    const zona = edificio.grupos.flatMap((g) => g.zonas).find((x) => x.id === z.zonaId);
    const tipo = (zona?.unidades ?? []).find((u) => j.viviendas.some((v) => v.tipoId === u.tipoId) && u.cantidad > 0);
    return tipo?.tipoId ?? null;
  };

  const marcas: MarcaSi[] = marcasZonasNeutras(zonas).map((m) => {
    if (m.tipo !== "zona") return m;
    if (m.zona.uso === "oficinas" && ids.has("oficinas")) return { ...m, elementoId: "oficinas" };
    const t = tipoDeZona(m.zona);
    return t && ids.has(`vivienda-${t}`) ? { ...m, elementoId: `vivienda-${t}` } : m;
  });
  const etiquetas: EtiquetaSi[] = [];

  // ── La producción ─────────────────────────────────────────────────────────
  const c = j.elementos.find((e) => e.id === "contribucion")?.detalle;
  if (c && c.clase === "contribucion") {
    const enCubierta = (x: number) => (inclinada ? S.ROOF + 2 - (32 * Math.abs(S.X1 + 14 - x)) / Math.abs(S.X1 + 14 - (S.X0 + S.X1) / 2) : S.ROOF);
    // El cuarto donde va una caldera: el de instalaciones, o la zona más baja.
    const cuarto =
      dibujadas.find((z) => z.uso === "instalaciones") ??
      [...dibujadas].sort((a, b) => a.nivel - b.nivel).find((z) => !VIVIENDA.has(z.uso)) ??
      dibujadas[dibujadas.length - 1];
    const enCuarto = (icono: "caldera" | "bomba_calor", key: string) => {
      if (cuarto) marcas.push({ tipo: "icono", key, icono, x: cuarto.x1 - 14, y: cuarto.y1 - 11, elementoId: "contribucion" });
    };
    const enTejado = (icono: "captador" | "bomba_calor", key: string, x: number) =>
      marcas.push({ tipo: "icono", key, icono, x, y: enCubierta(x) - 14, elementoId: "contribucion" });
    const individual = !j.plurifamiliar || j.decisiones.produccion === "individual";

    switch (c.sistema) {
      case "bomba_calor":
        if (individual) {
          for (const z of dibujadas) if (tipoDeZona(z)) marcas.push({ tipo: "icono", key: `bdc-${z.zonaId}-${z.nivel}`, icono: "bomba_calor", x: z.x1 - 14, y: z.y1 - 11, elementoId: "contribucion" });
          for (const z of dibujadas) if (z.uso === "oficinas") enTejado("bomba_calor", `bdc-ofi-${z.zonaId}`, S.X1 - 60);
        } else {
          enTejado("bomba_calor", "bdc", S.X1 - 60);
        }
        break;
      case "solar":
        enTejado("captador", "captador-1", inclinada ? (S.X0 + S.X1) / 2 + 60 : S.X0 + 60);
        enTejado("captador", "captador-2", inclinada ? (S.X0 + S.X1) / 2 + 90 : S.X0 + 90);
        if (c.apoyo === "bomba_calor") enTejado("bomba_calor", "apoyo", S.X1 - 60);
        else enCuarto("caldera", "apoyo");
        break;
      case "biomasa":
        enCuarto("caldera", "caldera");
        break;
      case "red":
        marcas.push(
          { tipo: "flecha", key: "red", d: `M${ANCHO - 14} ${yR - 8}H${S.X1 + 6}`, elementoId: "contribucion" },
          { tipo: "texto", key: "red-t", x: (S.X1 + ANCHO) / 2 + 4, y: yR + 16, texto: "red urbana", ancla: "middle" },
        );
        break;
    }
  }

  // ── Las etiquetas de las zonas, sin pisar iconos ni rótulos ───────────────
  const huecos = huecosEtiquetas(base, zonas, marcas);
  let debajo = 0;
  const poner = (elementoId: string, preds: ((z: ZonaDibujada) => boolean)[]) => {
    const el = j.elementos.find((e) => e.id === elementoId);
    if (!el) return;
    const texto = textoEtiquetaHe4(el);
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
  if (ids.has("oficinas")) poner("oficinas", [(z) => z.uso === "oficinas"]);

  // ── La columna de la derecha, de abajo arriba: demanda, energía y renovable ─
  const PASO = 28;
  // Arranca por encima del rótulo «terreno» de la rasante (y de la red urbana).
  let y = yR - 46 - (c?.clase === "contribucion" && c.sistema === "red" ? PASO : 0);
  etiquetas.push({ key: "et-demanda", elementoId: "demanda", x: xCol, y });
  if (ids.has("energia")) {
    y -= PASO;
    etiquetas.push({ key: "et-energia", elementoId: "energia", x: xCol, y });
  }
  if (ids.has("contribucion")) {
    y -= PASO;
    etiquetas.push({ key: "et-contribucion", elementoId: "contribucion", x: xCol, y });
  }

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: inclinada, ancho: ANCHO });
}
