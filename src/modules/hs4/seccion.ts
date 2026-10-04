// =============================================================================
// DB-HS4 — Geometría del dibujo (feature-15, HS4). Sin JSX: la comparten el
// render (`SeccionHs4.tsx`), la ficha (tamaño nativo) y las etiquetas HTML de la
// pantalla (anclas). PURA y determinista.
//
// Lo que se dibuja (maqueta v4 de HS4):
//   - a la izquierda, la sección del edificio (común, `lib/edificio/seccion`),
//     más estrecha: la batería de contadores en la PB, la acometida desde la
//     calle (con el grupo de presión si lo hay), un montante por unidad (o el
//     montante general con los contadores en cada planta) y las unidades de
//     cada planta como cajas;
//   - a la derecha, la PRESIÓN QUE LLEGA al grifo más desfavorable de cada
//     planta, en barras frente al mínimo, y la de la red.
// =============================================================================

import { etiquetaNivel } from "../../lib/edificio/derivar";
import { baseSeccion, SECCION_BASE, type BaseSeccion } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { hs4NativeSize } from "./svg-meta";
import { idMontanteDe, type ElementoHs4, type JustificacionHs4 } from "./justificacion";
import { PRESIONES } from "./tablas";

export const SECCION_HS4 = {
  ...SECCION_BASE,
  /** El edificio es más estrecho: a la derecha va la gráfica de presiones. */
  X1: 330,
  /** Patinillo de los montantes. */
  X_PATINILLO: 186,
  CAJA_W: 54,
  /** Ancho de una caja sola en su lado. */
  CAJA_W_SOLA: 76,
  CAJA_H: 22,
  /** Batería de contadores (con su rótulo encima). */
  BAT_X: 70,
  BAT_W: 70,
  BAT_H: 36,
  /** Subida de la acometida, junto al muro. */
  X_SUBIDA: 64,
  /** Locales: a la derecha del patinillo, sin tocar las etiquetas de los montantes. */
  X_LOCAL: 232,
  /** Gráfica de presiones. */
  G_X0: 380,
  G_X1: 610,
  /** kPa que caben en la gráfica (más se recorta). */
  G_MAX: 400,
} as const;

export interface CajaUnidad {
  /** Id de la unidad. */
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  texto: string;
  /** Elemento al que pertenece (la presión de su planta). */
  elementoId: string | null;
  /** La del grifo más desfavorable. */
  critica: boolean;
}

export interface MontanteDibujo {
  /** Id del elemento de su tipo («montante-a»), si lo hay. */
  elementoId: string | null;
  unidadId: string;
  /** Vertical: de la batería a la planta. */
  x: number;
  y0: number;
  y1: number;
  /** Horizontal a la caja. */
  xCaja: number;
}

export interface BarraPresion {
  elementoId: string;
  y: number;
  /** Ancho de la barra en el viewBox. */
  w: number;
  rotulo: string;
  cumple: boolean;
  /** Recortada por pasar de la escala. */
  recortada: boolean;
}

export interface EtiquetaHs4 {
  key: string;
  elementoId: string;
  x: number;
  y: number;
}

export interface SeccionHs4Geo {
  ancho: number;
  alto: number;
  base: BaseSeccion;
  x1: number;
  yTerrenoBajo: number;
  cajas: CajaUnidad[];
  montantes: MontanteDibujo[];
  /** Montante general (contadores por planta). */
  general: { x: number; y0: number; y1: number; contadores: { y: number }[] } | null;
  bateria: { x: number; y: number; w: number; h: number; contadores: number; texto: string } | null;
  acometida: { y: number; xGrupo: number; yGrupo: number; grupo: boolean };
  locales: { elementoId: string; x: number; y: number; w: number; h: number; texto: string }[];
  rotulos: { x: number; y: number; texto: string }[];
  /** Gráfica. */
  barras: BarraPresion[];
  barraRed: BarraPresion | null;
  barraGrupo: { y: number; w: number; rotulo: string } | null;
  xMinimo: number;
  yGraficaTop: number;
  yEje: number;
  ticks: { x: number; texto: string }[];
  etiquetas: EtiquetaHs4[];
}

const ROTULO_ZONA: Record<string, string> = {
  zona_comun: "Portal",
  vestibulo: "Vestíbulo",
  garaje: "Garaje",
  trasteros: "Trasteros",
  instalaciones: "Instalaciones",
};

/** Ancho de una barra para una presión. */
function anchoBarra(kPa: number): { w: number; recortada: boolean } {
  const S = SECCION_HS4;
  const k = (S.G_X1 - S.G_X0) / S.G_MAX;
  return { w: Math.max(2, Math.min(kPa, S.G_MAX) * k), recortada: kPa > S.G_MAX };
}

export function calcularSeccionHs4(j: JustificacionHs4, edificio: Edificio): SeccionHs4Geo {
  const S = SECCION_HS4;
  const base = baseSeccion(edificio);
  const { pisos, ySueloDe, yRasante, yFondoEdificio, haySotano } = base;
  const red = j.red;
  const manual = j.modo === "manual";
  const elPorNivel = new Map<number, ElementoHs4>();
  for (const e of j.elementos) {
    if (e.detalle.clase === "planta" && e.detalle.nivel !== null) elPorNivel.set(e.detalle.nivel, e);
  }
  const unidadCritica =
    j.elementos.find((e) => e.detalle.clase === "planta" && e.detalle.critico)?.detalle;
  const idCritica = unidadCritica && unidadCritica.clase === "planta" ? unidadCritica.punto.unidad?.id : undefined;

  // ── Cajas de las unidades, por planta: a izquierda y derecha del patinillo ─
  const cajas: CajaUnidad[] = [];
  const centroCaja = new Map<string, { x: number; y: number; izquierda: boolean }>();
  if (!manual) {
    const porNivel = new Map<number, typeof red.unidades>();
    for (const u of red.unidades) {
      for (const g of u.cuartos) {
        if (!red.unifamiliar && g.nivel !== u.nivel) continue;
        porNivel.set(g.nivel, [...(porNivel.get(g.nivel) ?? []), u]);
      }
    }
    for (const [nivel, us] of porNivel) {
      const ySuelo = ySueloDe.get(nivel);
      if (ySuelo === undefined) continue;
      // En la PB, a la izquierda del patinillo va la batería: las unidades, a la derecha.
      const conBateria = nivel === 0 && !(red.decisiones.contadores === "por_planta" && red.unidades.length > 1);
      const izq = conBateria ? [] : us.filter((_, i) => i % 2 === 0);
      const der = conBateria ? us : us.filter((_, i) => i % 2 === 1);
      const huecoIzq = S.X_PATINILLO - 26 - (S.X0 + 30);
      const huecoDer = S.X1 - 12 - (S.X_PATINILLO + 26);
      // Una sola caja por lado puede ensancharse (oficinas, la unifamiliar).
      const ancho = (hueco: number, n: number) =>
        n === 1 ? Math.min(S.CAJA_W_SOLA, hueco - 6) : Math.min(S.CAJA_W, hueco / Math.max(1, n) - 6);
      const wIzq = ancho(huecoIzq, izq.length);
      const wDer = ancho(huecoDer, der.length);
      const y = ySuelo - 36;
      const texto = (u: (typeof us)[number]) =>
        red.unifamiliar ? cuartosTexto(u, nivel) : u.clase === "oficinas" ? "Aseos" : u.nombre;
      const critica = (u: (typeof us)[number]) =>
        u.id === idCritica && (!red.unifamiliar || critNivel(j) === nivel);
      const elementoId = elPorNivel.get(nivel)?.id ?? null;
      izq.forEach((u, k) => {
        const x = S.X_PATINILLO - 26 - (k + 1) * (wIzq + 6) + 6;
        cajas.push({ id: `${u.id}@${nivel}`, x, y, w: wIzq, h: S.CAJA_H, texto: texto(u), elementoId, critica: critica(u) });
        centroCaja.set(`${u.id}@${nivel}`, { x: x + wIzq, y: y + S.CAJA_H / 2, izquierda: true });
      });
      der.forEach((u, k) => {
        const x = S.X_PATINILLO + 26 + k * (wDer + 6);
        cajas.push({ id: `${u.id}@${nivel}`, x, y, w: wDer, h: S.CAJA_H, texto: texto(u), elementoId, critica: critica(u) });
        centroCaja.set(`${u.id}@${nivel}`, { x, y: y + S.CAJA_H / 2, izquierda: false });
      });
    }
  }

  // ── Batería, montantes o montante general ────────────────────────────────
  const yBat = yRasante - 8 - S.BAT_H;
  /** Salida de la batería hacia los montantes. */
  const ySalida = yBat + 10;
  const porPlanta = red.decisiones.contadores === "por_planta" && !red.unifamiliar && red.unidades.length > 1;
  const bateria =
    manual || porPlanta
      ? null
      : {
          x: S.BAT_X,
          y: yBat,
          w: S.BAT_W,
          h: S.BAT_H,
          contadores: red.unifamiliar ? 1 : red.contadores.total,
          texto: red.unifamiliar ? "Contador general" : `Batería · ${red.contadores.total} contadores`,
        };
  const montantes: MontanteDibujo[] = [];
  let general: SeccionHs4Geo["general"] = null;
  const idsElementos = new Set(j.elementos.map((e) => e.id));
  const elMontante = (u: (typeof red.unidades)[number]) => {
    const id = idMontanteDe(u);
    return idsElementos.has(id) ? id : null;
  };
  if (!manual && porPlanta) {
    const xs = S.X_PATINILLO;
    const niveles = [...new Set(red.unidades.map((u) => u.nivel))];
    const yTop = Math.min(...niveles.map((n) => (ySueloDe.get(n) ?? yRasante) - 25));
    general = {
      x: xs,
      y0: yRasante - 4,
      y1: yTop,
      contadores: niveles.flatMap((n) => {
        const y = ySueloDe.get(n);
        return y === undefined ? [] : [{ y: y - 25 }];
      }),
    };
    for (const u of red.unidades) {
      const c = centroCaja.get(`${u.id}@${u.nivel}`);
      if (!c) continue;
      montantes.push({ elementoId: "montante-general", unidadId: u.id, x: xs, y0: c.y, y1: c.y, xCaja: c.x });
    }
  } else if (!manual && !red.unifamiliar) {
    // Un montante por unidad, en haz por el patinillo.
    const lista = red.unidades;
    const paso = Math.min(6, 40 / Math.max(1, lista.length));
    const x0 = S.X_PATINILLO - ((lista.length - 1) * paso) / 2;
    lista.forEach((u, i) => {
      const c = centroCaja.get(`${u.id}@${u.nivel}`);
      const x = x0 + i * paso;
      const yTop = c ? c.y : (ySueloDe.get(u.nivel) ?? yRasante) - 25;
      montantes.push({
        elementoId: elMontante(u),
        unidadId: u.id,
        x,
        y0: ySalida,
        y1: yTop,
        xCaja: c ? c.x : x,
      });
    });
  } else if (!manual && red.unifamiliar) {
    const u = red.unidades[0];
    if (u) {
      for (const g of u.cuartos) {
        const c = centroCaja.get(`${u.id}@${g.nivel}`);
        if (!c) continue;
        montantes.push({ elementoId: null, unidadId: u.id, x: S.X_PATINILLO, y0: ySalida, y1: c.y, xCaja: c.x });
      }
    }
  }

  // ── Acometida y grupo ────────────────────────────────────────────────────
  const yAcom = yRasante + 22;
  const acometida = { y: yAcom, xGrupo: S.X_SUBIDA, yGrupo: yRasante + 16, grupo: red.decisiones.grupoPresion };

  // ── Locales y rótulos de zonas sin consumo ───────────────────────────────
  const locales: SeccionHs4Geo["locales"] = [];
  for (const l of red.locales) {
    const ySuelo = ySueloDe.get(l.nivel);
    if (ySuelo === undefined) continue;
    locales.push({
      elementoId: l.id,
      x: S.X_LOCAL,
      y: ySuelo - 46,
      w: S.X1 - 10 - S.X_LOCAL,
      h: 36,
      texto: l.numero > 1 ? "Locales" : "Local",
    });
  }
  const rotulos: SeccionHs4Geo["rotulos"] = [];
  const conCaja = new Set(cajas.map((c) => Number(c.id.split("@")[1])));
  for (const p of pisos) {
    if (conCaja.has(p.nivel) && p.nivel !== 0) continue;
    const textos = [...new Set(p.usos.map((u) => ROTULO_ZONA[u]).filter((t): t is string => !!t))];
    if (textos.length === 0) continue;
    if (p.nivel === 0 && (bateria || locales.length > 0)) continue;
    // Bajo rasante el nombre y la cota de la planta ya están dentro (los pinta la base).
    rotulos.push(
      p.nivel < 0
        ? { x: S.X0 + 78, y: p.ySuelo - 10, texto: textos.join(" · ").toLowerCase() }
        : { x: S.X0 + 12, y: p.ySuelo - 12, texto: `${p.etiqueta} · ${textos.join(" · ").toLowerCase()}` },
    );
  }

  // ── Gráfica de presiones ─────────────────────────────────────────────────
  const barras: BarraPresion[] = [];
  for (const [nivel, el] of elPorNivel) {
    const ySuelo = ySueloDe.get(nivel);
    if (ySuelo === undefined || el.detalle.clase !== "planta") continue;
    const a = el.detalle.punto.aparato;
    const { w, recortada } = anchoBarra(a.presionResidual_kPa);
    barras.push({
      elementoId: el.id,
      y: ySuelo - 25,
      w,
      rotulo: `${etiquetaNivel(nivel)} · ${puntoCorto(el)}`,
      cumple: a.presionResidual_kPa >= a.presionMinExigida_kPa,
      recortada,
    });
  }
  // A mano no hay plantas: una barra para el grifo más desfavorable.
  const pc = j.elementos.find((e) => e.id === "punto-critico");
  if (pc && pc.detalle.clase === "planta") {
    const a = pc.detalle.punto.aparato;
    const { w, recortada } = anchoBarra(a.presionResidual_kPa);
    barras.push({ elementoId: pc.id, y: (pisos[0]?.ySuelo ?? yRasante) - 25, w, rotulo: "Grifo más desfavorable", cumple: a.presionResidual_kPa >= a.presionMinExigida_kPa, recortada });
  }
  const yRed = yRasante + 30;
  const barraRed = j.resultado
    ? { elementoId: "presion-red", y: yRed, ...anchoBarra(j.presionRed_kPa), rotulo: "Red de la calle", cumple: true }
    : null;
  const barraGrupo = red.decisiones.grupoPresion && j.resultado
    ? { y: yRed + 34, w: anchoBarra(red.decisiones.presionGrupo_kPa).w, rotulo: "Salida del grupo" }
    : null;
  const yEje = (barraGrupo ? barraGrupo.y : yRed) + 28;
  const kx = (S.G_X1 - S.G_X0) / S.G_MAX;
  const ticks = [0, 100, 200, 300, 400].map((v) => ({ x: S.G_X0 + v * kx, texto: String(v) }));
  const xMinimo = S.G_X0 + PRESIONES.datos.presionMinGrifosComunes_kPa * kx;

  // ── Etiquetas ────────────────────────────────────────────────────────────
  const etiquetas: EtiquetaHs4[] = [];
  for (const b of barras) etiquetas.push({ key: `et-${b.elementoId}`, elementoId: b.elementoId, x: Math.min(S.G_X0 + b.w + 38, S.W - 34), y: b.y + 7 });
  if (barraRed) etiquetas.push({ key: "et-red", elementoId: "presion-red", x: Math.min(S.G_X0 + barraRed.w + 38, S.W - 34), y: barraRed.y + 7 });
  // Montantes: sobre las cajas de la primera planta con unidades por encima de la
  // PB, a los dos lados del patinillo; si no hay, en la PB junto a la batería.
  const idsMontante = [...new Set(montantes.flatMap((m) => (m.elementoId ? [m.elementoId] : [])))];
  const nivelesArriba = [...new Set(red.unidades.map((u) => u.nivel))].filter((n) => n > 0 && ySueloDe.has(n));
  const yBanda = nivelesArriba.length > 0 ? ySueloDe.get(Math.min(...nivelesArriba))! - 58 : null;
  idsMontante.forEach((id, k) => {
    const x =
      yBanda !== null && idsMontante.length > 1
        ? S.X_PATINILLO + (k % 2 === 0 ? -40 : 40)
        : S.X_PATINILLO;
    const y = yBanda !== null ? yBanda - Math.floor(k / 2) * 22 : ySalida - 22 - k * 22;
    etiquetas.push({ key: `et-${id}`, elementoId: id, x, y });
  });
  if (j.elementos.some((e) => e.id === "acometida")) etiquetas.push({ key: "et-acometida", elementoId: "acometida", x: 34, y: yAcom + 26 });
  for (const l of locales) etiquetas.push({ key: `et-${l.elementoId}`, elementoId: l.elementoId, x: l.x + l.w / 2, y: l.y - 10 });
  if (acometida.grupo) {
    etiquetas.push({ key: "et-grupo", elementoId: "grupo-presion", x: acometida.xGrupo + 66, y: acometida.yGrupo });
  }

  const alto = Math.max(yFondoEdificio + 12, yEje + 44, yAcom + 50);
  const yTerrenoBajo = haySotano ? yFondoEdificio : yRasante + S.LOSA + 30;
  return {
    ancho: S.W,
    alto,
    base,
    x1: S.X1,
    yTerrenoBajo,
    cajas,
    montantes,
    general,
    bateria,
    acometida,
    locales,
    rotulos,
    barras,
    barraRed,
    barraGrupo,
    xMinimo,
    yGraficaTop: S.ROOF - 30,
    yEje,
    ticks,
    etiquetas,
  };
}

/** «ducha de A3» para el rótulo de la barra. */
function puntoCorto(el: ElementoHs4): string {
  if (el.detalle.clase !== "planta") return "";
  const p = el.detalle.punto;
  const t = p.aparato.tipo;
  const ap =
    t === "banera_ge_140" || t === "banera_lt_140"
      ? "bañera"
      : t === "ducha"
        ? "ducha"
        : t === "lavabo"
          ? "lavabo"
          : t === "inodoro_cisterna"
            ? "inodoro"
            : t.startsWith("fregadero")
              ? "fregadero"
              : t.startsWith("lavadora")
                ? "lavadora"
                : t.startsWith("lavavajillas")
                  ? "lavavajillas"
                  : t === "bide"
                    ? "bidé"
                    : "grifo";
  if (!p.unidad) return ap;
  if (p.unidad.clase === "oficinas") return `${ap} de los aseos`;
  return p.unidad.id === "u" ? `${ap} · ${(p.cuarto ?? "").toLowerCase()}` : `${ap} de ${p.unidad.nombre}`;
}

function cuartosTexto(u: JustificacionHs4["red"]["unidades"][number], nivel: number): string {
  const g = u.cuartos.find((c) => c.nivel === nivel);
  if (!g) return u.nombre;
  const banos = g.cuartos.filter((c) => c.clase === "bano").length;
  if (banos > 0 && banos === g.cuartos.length) return banos === 1 ? "Baño" : "Baños";
  if (g.cuartos.some((c) => c.clase === "cocina")) return g.cuartos.some((c) => c.clase === "aseo") ? "Cocina y aseo" : "Cocina";
  return u.nombre;
}

function critNivel(j: JustificacionHs4): number | null {
  const e = j.elementos.find((x) => x.detalle.clase === "planta" && x.detalle.critico);
  return e && e.detalle.clase === "planta" ? e.detalle.nivel : null;
}

/** Tamaño nativo del dibujo de HS4: la sección, o el esquema de columna a mano. Lo usa la ficha. */
export function tamanoDibujoHs4(j: JustificacionHs4, edificio: Edificio): { nativeW: number; nativeH: number } {
  if (j.modo === "manual" && j.resultado) return hs4NativeSize(j.resultado);
  const s = calcularSeccionHs4(j, edificio);
  return { nativeW: s.ancho, nativeH: s.alto };
}
