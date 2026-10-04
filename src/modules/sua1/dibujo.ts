// =============================================================================
// DB-SUA, SUA 1 — El dibujo (feature-20): la sección del edificio con las
// escaleras (un zigzag por planta, un trazo por tramo), las barreras como trazos
// gruesos en la fachada de cada planta con su altura, la rampa del garaje y la
// de acceso, las oficinas (resbaladicidad) y las plantas cuyo vidrio hay que
// limpiar desde dentro. PURA; el render es el común del DB-SI.
// =============================================================================

import { SECCION_BASE, type BaseSeccion } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { centro, componerDibujo, marcasZonasNeutras, pisoDe, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi, type ZonaDibujada } from "../si/seccion";
import type { DetalleEscalera, JustificacionSua1 } from "./justificacion";

const S = SECCION_BASE;
/** Con las barreras y la rampa de acceso a la derecha, el dibujo es más ancho que la sección común. */
const ANCHO = S.W + 120;
/** Medio ancho del zigzag de una escalera. */
const MEDIO = 16;
/** Separación entre la escalera común y la del garaje. */
const PASO_ESCALERAS = 48;
/** Distancia del centro de una escalera al de su etiqueta. */
const LADO_ETIQUETA = MEDIO + 56;

/** Lo que sube una escalera dentro de cada planta (o banda) dibujada: del suelo al suelo de encima. */
function tramosVerticales(base: BaseSeccion, niveles: readonly number[]): { nivel: number; ySup: number; yInf: number }[] {
  const lo = Math.min(...niveles);
  const hi = Math.max(...niveles);
  const out: { nivel: number; ySup: number; yInf: number }[] = [];
  const bandasVistas = new Set<number>();
  for (let n = lo; n < hi; n++) {
    const p = pisoDe(base, n);
    if (p) {
      out.push({ nivel: n, ySup: p.yTecho - S.LOSA, yInf: p.ySuelo });
      continue;
    }
    const i = base.bandas.findIndex((b) => b.niveles.includes(n));
    if (i >= 0 && !bandasVistas.has(i)) {
      bandasVistas.add(i);
      out.push({ nivel: n, ySup: base.bandas[i].y0 - S.LOSA, yInf: base.bandas[i].y1 });
    }
  }
  return out;
}

/** El zigzag de un tramo de planta: `tramos` trazos alternos entre xa y xb. */
function zigzag(xa: number, xb: number, yInf: number, ySup: number, tramos: number): string {
  const pasos = Array.from({ length: tramos }, (_, i) => {
    const k = i + 1;
    const x = k % 2 === 1 ? xb : xa;
    const y = yInf - (k * (yInf - ySup)) / tramos;
    return `L${x.toFixed(1)} ${y.toFixed(1)}`;
  });
  return `M${xa.toFixed(1)} ${yInf.toFixed(1)}${pasos.join("")}`;
}

/** El centro de la escalera común: el portal o vestíbulo de la PB, o junto a la fachada derecha. */
function xEscalera(zonas: readonly ZonaDibujada[], d: DetalleEscalera): number {
  if (d.tipo === "interior") {
    const lo = Math.min(...d.porPlanta.map((t) => t.nivel));
    const z = zonas.find((x) => x.nivel === lo && x.uso === "vivienda_unifamiliar" && !x.enBanda);
    return z ? Math.max(z.x0 + 40, z.x1 - 40) : S.X1 - 70;
  }
  const z = zonas.find((x) => x.nivel === 0 && (x.uso === "zona_comun" || x.uso === "vestibulo"));
  return z ? centro(z).x : S.X1 - 70;
}

export function dibujoSua1(j: JustificacionSua1, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const yR = base.yRasante;
  const marcas: MarcaSi[] = [];
  const etiquetas: EtiquetaSi[] = [];
  const medio = (S.X0 + S.X1) / 2;

  // Las zonas; las oficinas, pulsables (resbaladicidad).
  const conSuelo = j.elementos.some((e) => e.id === "resbaladicidad");
  for (const mz of marcasZonasNeutras(zonas)) {
    if (mz.tipo === "zona" && conSuelo && mz.zona.uso === "oficinas") marcas.push({ ...mz, elementoId: "resbaladicidad" });
    else marcas.push(mz);
  }
  if (conSuelo) {
    const ofi = zonas.filter((z) => z.uso === "oficinas" && !z.enBanda);
    const z = ofi[0];
    if (z) etiquetas.push({ key: "et-resbaladicidad", elementoId: "resbaladicidad", x: centro(z).x, y: centro(z).y + 6 });
  }

  // ── Las escaleras ─────────────────────────────────────────────────────────
  const comun = j.elementos.find((e) => e.id === "escalera-comun")?.detalle as DetalleEscalera | undefined;
  const xComun = comun ? xEscalera(zonas, comun) : S.X1 - 70;
  /** Hacia el centro del edificio desde la escalera común: ahí van la del garaje y las etiquetas. */
  const haciaDentro = xComun > medio ? -1 : 1;
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase !== "escalera") continue;
    const xc =
      d.tipo === "garaje"
        ? Math.min(S.X1 - MEDIO - 4, Math.max(S.X0 + MEDIO + 4, (comun ? xComun : S.X1 - 70) + haciaDentro * PASO_ESCALERAS))
        : xEscalera(zonas, d);
    const tramos = d.tramos ?? 1;
    const verticales = tramosVerticales(base, d.porPlanta.length > 0 ? [...d.porPlanta.map((t) => t.nivel), Math.max(...d.porPlanta.map((t) => t.nivel)) + 1] : []);
    for (const v of verticales) {
      marcas.push({ tipo: "linea", key: `${el.id}-${v.nivel}`, d: zigzag(xc - MEDIO, xc + MEDIO, v.yInf, v.ySup, tramos), grosor: 2, elementoId: el.id, tono: "fuerte" });
    }
    const ref = verticales.find((v) => v.nivel === 0) ?? verticales[0];
    if (ref) {
      // La etiqueta, hacia el centro del edificio (fuera no cabe).
      const lado = d.tipo === "garaje" ? haciaDentro : xc > medio ? -1 : 1;
      etiquetas.push({ key: `et-${el.id}`, elementoId: el.id, x: xc + lado * LADO_ETIQUETA, y: (ref.yInf + ref.ySup) / 2 });
    }
  }

  // ── Las barreras: trazos gruesos en las dos fachadas, con la altura a escala ─
  const xEt = S.X1 + 62;
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase !== "barreras") continue;
    const alto = d.altura_m * S.K;
    if (d.grupo === "cubierta") {
      const y = S.ROOF;
      marcas.push(
        { tipo: "linea", key: `${el.id}-d`, d: `M${S.X1 + 4} ${y}V${y - alto}`, grosor: 4, elementoId: el.id, tono: "fuerte" },
        { tipo: "linea", key: `${el.id}-i`, d: `M${S.X0 - 4} ${y}V${y - alto}`, grosor: 4, elementoId: el.id, tono: "fuerte" },
      );
      etiquetas.push({ key: `et-${el.id}`, elementoId: el.id, x: xEt, y: y - alto - 4 });
      continue;
    }
    const ys: number[] = [];
    const bandas = new Set<number>();
    for (const n of d.niveles) {
      const p = pisoDe(base, n);
      let y: number | null = p ? p.ySuelo : null;
      if (y === null) {
        const i = base.bandas.findIndex((b) => b.niveles.includes(n));
        if (i < 0 || bandas.has(i)) continue;
        bandas.add(i);
        y = base.bandas[i].y1;
      }
      ys.push(y);
      marcas.push(
        { tipo: "linea", key: `${el.id}-${n}-d`, d: `M${S.X1 + 4} ${y}V${y - alto}`, grosor: 4, elementoId: el.id, tono: "fuerte" },
        { tipo: "linea", key: `${el.id}-${n}-i`, d: `M${S.X0 - 4} ${y}V${y - alto}`, grosor: 4, elementoId: el.id, tono: "fuerte" },
      );
    }
    if (ys.length > 0) etiquetas.push({ key: `et-${el.id}`, elementoId: el.id, x: xEt, y: Math.min(...ys) - alto / 2 });
  }

  // ── La rampa del garaje: del terreno al suelo del sótano, por la izquierda ──
  const rg = j.elementos.find((e) => e.id === "rampa-garaje");
  if (rg) {
    const sotanos = base.pisos.filter((p) => p.nivel < 0);
    const s1 = sotanos.find((p) => p.nivel === -1) ?? sotanos[0];
    if (s1) {
      const d = rg.detalle.clase === "rampa_garaje" ? rg.detalle : null;
      marcas.push(
        { tipo: "linea", key: "rampa-garaje", d: `M8 ${yR}L${S.X0 - 2} ${s1.ySuelo}`, grosor: 3, elementoId: "rampa-garaje", tono: "fuerte", dash: d?.peatonal ? undefined : "6 4" },
        { tipo: "icono", key: "coche", icono: "coche", x: 26, y: yR + 16, elementoId: "rampa-garaje" },
      );
      etiquetas.push({ key: "et-rampa-garaje", elementoId: "rampa-garaje", x: S.X0 + 16, y: base.yFondoEdificio + 22 });
    }
  }

  // ── La rampa de acceso: de la acera al portal, por la derecha ─────────────
  if (j.elementos.some((e) => e.id === "rampa-acceso")) {
    marcas.push(
      { tipo: "linea", key: "rampa-acceso", d: `M${S.X1 + 100} ${yR + 8}L${S.X1 + 6} ${yR}`, grosor: 3, elementoId: "rampa-acceso", tono: "fuerte" },
      { tipo: "icono", key: "accesible", icono: "accesible", x: S.X1 + 96, y: yR - 12, elementoId: "rampa-acceso" },
    );
    etiquetas.push({ key: "et-rampa-acceso", elementoId: "rampa-acceso", x: xEt, y: yR + 26 });
  }

  // ── La limpieza de los acristalamientos: la fachada izquierda de esas plantas ─
  const lim = j.elementos.find((e) => e.id === "limpieza");
  if (lim && lim.detalle.clase === "limpieza") {
    const pisos = lim.detalle.niveles.map((n) => pisoDe(base, n)).filter((p) => p !== null);
    const bandas = base.bandas.filter((b) => b.niveles.some((n) => lim.detalle.clase === "limpieza" && lim.detalle.niveles.includes(n)));
    const yInf = Math.max(...pisos.map((p) => p.ySuelo), ...bandas.map((b) => b.y1));
    const ySup = Math.min(...pisos.map((p) => p.yTecho), ...bandas.map((b) => b.y0));
    if (Number.isFinite(yInf) && Number.isFinite(ySup)) {
      marcas.push({ tipo: "linea", key: "limpieza", d: `M${S.X0 + 3} ${yInf}V${ySup}`, grosor: 2, elementoId: "limpieza", tono: "suave", dash: "3 3" });
      const alta = pisos.reduce<(typeof pisos)[number] | null>((a, p) => (a === null || p.ySuelo < a.ySuelo ? p : a), null);
      if (alta) etiquetas.push({ key: "et-limpieza", elementoId: "limpieza", x: S.X0 + 70, y: alta.ySuelo - 20 });
    }
  }

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada", ancho: ANCHO });
}
