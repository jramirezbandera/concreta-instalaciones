// =============================================================================
// DB-SUA, SUA 9 — El dibujo (feature-20): la sección del edificio con el
// itinerario accesible desde la acera hasta la entrada (el símbolo de
// accesibilidad en la puerta), el ascensor recorriendo las plantas que comunica
// —o su previsión, en discontinuo—, las flechas del itinerario en cada planta y
// las plazas accesibles del garaje. A la derecha, la columna de la dotación.
// PURA; el render es el común del DB-SI.
// =============================================================================

import { SECCION_BASE, type BaseSeccion } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi, type ZonaDibujada } from "../si/seccion";
import type { DetalleSua9, JustificacionSua9 } from "./justificacion";

const S = SECCION_BASE;
/** Con la calle y la columna de la dotación a la derecha, más ancho que la sección común. */
const ANCHO = S.W + 150;
const PASO = 28;

/** Techo y suelo (y del dibujo) de un nivel, dibujado o dentro de una banda. */
function franjaNivel(base: BaseSeccion, nivel: number): { y0: number; y1: number; dibujado: boolean } | null {
  const p = base.pisos.find((x) => x.nivel === nivel);
  if (p) return { y0: p.yTecho, y1: p.ySuelo, dibujado: true };
  const b = base.bandas.find((x) => x.niveles.includes(nivel));
  return b ? { y0: b.y0, y1: b.y1, dibujado: false } : null;
}

export function dibujoSua9(j: JustificacionSua9, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const marcas: MarcaSi[] = [...marcasZonasNeutras(zonas)];
  const etiquetas: EtiquetaSi[] = [];
  const yR = base.yRasante;
  const x0 = S.X0;
  const x1 = S.X1;
  const xCol = (x1 + ANCHO) / 2 + 10;
  const dibujadas = zonas.filter((z) => !z.enBanda);
  const el = <C extends DetalleSua9["clase"]>(clase: C) => {
    const e = j.elementos.find((x) => x.detalle.clase === clase);
    return e ? { id: e.id, d: e.detalle as Extract<DetalleSua9, { clase: C }> } : null;
  };
  const inclinada = edificio.cubierta.tipo === "inclinada";

  // ── La calle y la entrada (a la derecha) ──────────────────────────────────
  const xPuerta = x1 + 4;
  marcas.push({ tipo: "linea", key: "acera", d: `M${x1 + 4} ${yR}H${ANCHO - 8}`, grosor: 2, tono: "suave" });
  marcas.push({ tipo: "texto", key: "t-via", x: ANCHO - 12, y: yR + 16, texto: "vía pública", ancla: "end" });

  if (j.unifamiliar) {
    const va = el("vivienda_accesible");
    if (va) marcas.push({ tipo: "icono", key: "accesible-entrada", icono: "accesible", x: xPuerta + 18, y: yR - 12, elementoId: va.id });
    const id = va?.id ?? "ambito";
    etiquetas.push({ key: `et-${id}`, elementoId: id, x: xCol, y: yR - 40 });
    return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: inclinada, ancho: ANCHO });
  }

  const ext = el("exterior");
  if (ext) {
    marcas.push({ tipo: "flecha", key: "itin-exterior", d: `M${ANCHO - 14} ${yR - 8}H${xPuerta + 6}`, elementoId: ext.id });
    marcas.push({ tipo: "icono", key: "accesible-entrada", icono: "accesible", x: xPuerta + 30, y: yR - 24, elementoId: ext.id });
    if (ext.d.acceso === "rampa") marcas.push({ tipo: "linea", key: "rampa", d: `M${xPuerta + 60} ${yR + 6}L${xPuerta + 6} ${yR - 2}`, grosor: 2, elementoId: ext.id, tono: "fuerte" });
    etiquetas.push({ key: "et-exterior", elementoId: ext.id, x: xCol, y: yR + 34 });
  }

  // ── El ascensor o su previsión ────────────────────────────────────────────
  const asc = el("ascensor");
  let xAsc = x1 - 26;
  if (asc) {
    const comunPB = dibujadas.find((z) => z.nivel === 0 && (z.uso === "zona_comun" || z.uso === "vestibulo"));
    if (comunPB) xAsc = (comunPB.x0 + comunPB.x1) / 2;
    const tramos = asc.d.niveles.map((n) => franjaNivel(base, n)).filter((f): f is NonNullable<typeof f> => f !== null);
    if (tramos.length > 0) {
      const yTop = Math.min(...tramos.map((t) => t.y0));
      const yBot = Math.max(...tramos.map((t) => t.y1));
      const dash = asc.d.hay ? undefined : "5 4";
      // El hueco: dos paredes.
      marcas.push(
        { tipo: "linea", key: "hueco-izq", d: `M${xAsc - 9} ${yBot}V${yTop + 2}`, grosor: 1.6, elementoId: asc.id, dash, tono: "fuerte" },
        { tipo: "linea", key: "hueco-der", d: `M${xAsc + 9} ${yBot}V${yTop + 2}`, grosor: 1.6, elementoId: asc.id, dash, tono: "fuerte" },
      );
      // El icono en cada planta dibujada que comunica (la previsión, solo en la de entrada).
      for (const n of asc.d.niveles) {
        const f = franjaNivel(base, n);
        if (!f || !f.dibujado) continue;
        if (!asc.d.hay && n !== 0) continue;
        marcas.push({ tipo: "icono", key: `asc-${n}`, icono: "ascensor", x: xAsc, y: f.y1 - 12, elementoId: asc.id });
      }
      const alta = franjaNivel(base, Math.max(...asc.d.niveles));
      const yEt = (alta?.y0 ?? yTop) + 16;
      const izquierda = xAsc > (x0 + x1) / 2;
      etiquetas.push({ key: "et-ascensor", elementoId: asc.id, x: izquierda ? xAsc - 70 : xAsc + 70, y: yEt });
      const cab = el("cabina");
      if (cab) etiquetas.push({ key: "et-cabina", elementoId: cab.id, x: izquierda ? xAsc - 70 : xAsc + 70, y: yEt + 24 });
    }
  }

  // ── El itinerario en las plantas: una flecha desde el ascensor ────────────
  const pl = el("plantas");
  if (pl && asc) {
    const haciaIzquierda = xAsc > (x0 + x1) / 2;
    let etiquetada = false;
    for (const n of asc.d.niveles) {
      const f = franjaNivel(base, n);
      if (!f || !f.dibujado) continue;
      const y = f.y1 - 30;
      const d = haciaIzquierda ? `M${xAsc - 14} ${y}H${Math.max(x0 + 20, xAsc - 110)}` : `M${xAsc + 14} ${y}H${Math.min(x1 - 20, xAsc + 110)}`;
      marcas.push({ tipo: "flecha", key: `itin-${n}`, d, elementoId: pl.id });
      if (n === 0 && !etiquetada) {
        etiquetas.push({ key: "et-plantas", elementoId: pl.id, x: haciaIzquierda ? Math.max(x0 + 70, xAsc - 170) : Math.min(x1 - 70, xAsc + 170), y: y });
        etiquetada = true;
      }
    }
  }

  // ── Las plazas accesibles del garaje ──────────────────────────────────────
  const pz = el("plazas");
  const garaje = dibujadas.find((z) => z.uso === "garaje");
  if (pz && garaje) {
    const yG = garaje.y1 - 14;
    const n = Math.min(pz.d.exigidas, 3);
    for (let i = 0; i < n; i++) {
      const x = garaje.x0 + 40 + i * 44;
      marcas.push(
        { tipo: "icono", key: `plaza-coche-${i}`, icono: "coche", x, y: yG, elementoId: pz.id },
        { tipo: "icono", key: `plaza-sia-${i}`, icono: "accesible", x: x + 18, y: yG, elementoId: pz.id },
      );
    }
    etiquetas.push({ key: "et-plazas", elementoId: pz.id, x: garaje.x0 + 40 + Math.max(1, n) * 44 + 50, y: (garaje.y0 + garaje.y1) / 2 });
  }

  // ── Los aseos en las oficinas; el local, en su sitio ──────────────────────
  const as = el("aseos");
  const ofi = dibujadas.find((z: ZonaDibujada) => z.uso === "oficinas");
  if (as && ofi) etiquetas.push({ key: "et-aseos", elementoId: as.id, x: (ofi.x0 + ofi.x1) / 2, y: (ofi.y0 + ofi.y1) / 2 + 6 });
  const lo = el("local");
  const zLocal = dibujadas.find((z) => z.uso === "local_sin_uso");
  if (lo && zLocal) etiquetas.push({ key: "et-local", elementoId: lo.id, x: (zLocal.x0 + zLocal.x1) / 2, y: (zLocal.y0 + zLocal.y1) / 2 + 6 });

  // ── La columna de la dotación, de abajo arriba ────────────────────────────
  let y = yR - 22;
  for (const clase of ["senalizacion", "mecanismos", "atencion", "piscina", "vivienda_accesible", "viviendas"] as const) {
    const e = el(clase);
    if (!e) continue;
    etiquetas.push({ key: `et-${e.id}`, elementoId: e.id, x: xCol, y });
    y -= PASO;
  }

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: inclinada, ancho: ANCHO });
}
