// DB-HS4 — Metadatos + geometría NO-COMPONENTE del ESQUEMA DE COLUMNA (sin JSX).
// Separado de `svg.tsx` para que ese archivo exporte SOLO componentes React
// (regla `react-refresh/only-export-components`): aquí viven el id del clon PDF,
// las constantes de layout y `calcularEsquema` (función PURA que sustituye al
// antiguo `calcularArbol` jerárquico — feature-7 / UX-RECONCEPT §7: muere el
// grafo genérico). Lo consumen el render (`svg.tsx`), la ficha PDF (`./ficha.ts`)
// y la pantalla (`./ui.tsx`) sin arrastrar JSX. ÚNICA fuente de verdad de las
// medidas: el render importa de aquí para no divergir.
//
// EL DIBUJO (mismo patrón que HS5, con el dominio de suministro):
//   • acometida + tubo de alimentación horizontales en la BASE, con el recuadro
//     de la red general y flecha de entrada a la izquierda;
//   • columna(s)/montante(s) VERTICALES;
//   • un NIVEL por derivación particular directa del montante (orden estable de
//     `childrenIds`, arriba→abajo), con forjados discontinuos entre niveles;
//   • derivaciones de aparato como TICKS verticales sobre la horizontal (con su
//     caudal de cálculo); derivaciones anidadas como stub elevado.
//   • El RECORRIDO CRÍTICO (`esCritico`) se pinta MULTICANAL (rojo + trazo
//     grueso/discontinuo + etiqueta) en svg.tsx.

import type { HS4Result, ResultadoAparatoHS4, ResultadoTramoHS4 } from "./calc";

// Id del clon oculto que la ficha PDF clona y pasa a svg2pdf. Se exporta aquí
// (única fuente de verdad) para que toFichaData/renderFicha lo importen sin
// duplicar el literal. CONGELADO (Fase 2): debe ser EXACTAMENTE "hs4-svg-pdf".
export const HS4_PDF_SVG_ID = "hs4-svg-pdf";

// -----------------------------------------------------------------------------
// Constantes de layout (unidades abstractas del viewBox, ~px). Deterministas.
// Mismo esqueleto vertical que HS5 (feature-7); margen derecho mayor porque las
// etiquetas hidráulicas (Ø · Q · v) son más largas.
// -----------------------------------------------------------------------------
export const ESQ4 = {
  margenX: 20,
  xEtiquetaNivel: 28,
  x0Ramal: 100,
  gapColumnas: 44,
  margenDerecho: 104,
  yAviso: 18,
  yMontanteTop: 86,
  yNivel0: 110,
  nivelH: 120,
  dyForjado: 40,
  dyBase: 116,
  tickH: 16,
  tickSlotW: 36,
  derivH: 26,
  miniTickH: 10,
  miniTickPaso: 12,
  stubMin: 30,
  ramalLenMin: 150,
  slotPad: 55,
  xRedGeneral: 52, // x del recuadro de la red general (fuente)
  ladoRedGeneral: 16,
  xFlechaIni: 78, // flecha de ENTRADA: de la red general hacia la base
  xBaseIzq: 100,
  dyCaption: 56,
  dyInferior: 74,
} as const;

// -----------------------------------------------------------------------------
// Geometría del esquema, derivada SOLO del resultado (determinista). La consumen
// `HS4SVG` (para pintar) y `hs4NativeSize` (tamaño nativo del raster PDF), de
// modo que `scale = CW / nativeW` no deforme nada. CONGELADO: firma estable de
// `hs4NativeSize`.
// -----------------------------------------------------------------------------

/** Tick sobre un nivel: derivación de aparato (tramo) o aparato directo. */
export type TickHS4 =
  | { clase: "aparato"; ap: ResultadoAparatoHS4; x: number }
  | { clase: "tramo"; t: ResultadoTramoHS4; x: number };

/** Tramo anidado bajo un nivel: derivación elevada sobre la horizontal padre. */
export interface DerivacionHS4 {
  t: ResultadoTramoHS4;
  x: number;
  stubW: number;
  /** Derivaciones de aparato/aparatos de la sub-red (mini-ticks). */
  miniTicks: TickHS4[];
  /** Nº de tramos intermedios NO dibujados (colapsados en la derivación). */
  ocultos: number;
}

export type ItemNivelHS4 =
  | { clase: "tick"; tick: TickHS4 }
  | { clase: "derivacion"; deriv: DerivacionHS4 };

/** Un nivel = un tramo directo del montante (derivación particular). */
export interface NivelHS4 {
  t: ResultadoTramoHS4;
  x0: number;
  x1: number;
  y: number;
  items: ItemNivelHS4[];
}

/** Una columna = cadena de montantes (≥1) o columna virtual (cadena vacía). */
export interface ColumnaHS4 {
  cadena: ResultadoTramoHS4[];
  x: number;
  x0: number;
  yTop: number;
  niveles: NivelHS4[];
}

/** Segmento de la línea base: acometida / tubo de alimentación de la cadena. */
export interface BaseSegHS4 {
  t: ResultadoTramoHS4;
  x0: number;
  x1: number;
}

export interface EsquemaHS4 {
  columnas: ColumnaHS4[];
  /** Segmentos de la base (raíz/acometida a la IZQUIERDA, junto a la fuente). */
  base: BaseSegHS4[];
  nNiveles: number;
  yBase: number;
  xBaseDer: number;
  contentW: number;
  contentH: number;
  /** Ids de tramos NO dibujados (raíces extra / inalcanzables por ciclo). */
  omitidos: string[];
}

type TickTmp =
  | { clase: "aparato"; ap: ResultadoAparatoHS4 }
  | { clase: "tramo"; t: ResultadoTramoHS4 };

type ItemTmp =
  | { clase: "tick"; tick: TickTmp }
  | { clase: "deriv"; t: ResultadoTramoHS4; minis: TickTmp[]; ocultos: number; stubW: number };

interface NivelTmp {
  t: ResultadoTramoHS4;
  items: ItemTmp[];
  ancho: number;
}

interface ColTmp {
  cadena: ResultadoTramoHS4[];
  niveles: NivelTmp[];
}

/** ¿Tipo que discurre por la LÍNEA BASE del esquema? */
function esTipoBase(t: ResultadoTramoHS4): boolean {
  return t.tipo === "acometida" || t.tipo === "tubo_alimentacion";
}

function anchoItem(it: ItemTmp): number {
  return it.clase === "tick" ? ESQ4.tickSlotW : it.stubW + 20;
}

/**
 * Calcula la geometría del esquema de columna de forma 100% determinista a
 * partir del resultado. Función pura compartida por el render y `hs4NativeSize`.
 *
 * Decisiones de mapeo (documentadas, análogas a HS5):
 *  • RAÍZ dibujada: la primera raíz de tipo `acometida` (después
 *    `tubo_alimentacion`, después la primera). Raíces extra → `omitidos`.
 *  • BASE: cadena acometida→tubo de alimentación como segmentos consecutivos
 *    de la línea base (raíz junto a la fuente, a la izquierda).
 *  • COLUMNAS: cada `columna_montante` que cuelga de la base; una cadena
 *    montante→montante forma UNA columna (niveles aguas arriba primero).
 *  • NIVELES: los hijos no-montante de cada montante (derivaciones
 *    particulares), arriba→abajo. Tramos no-montante que cuelgan directamente
 *    de la base van a una COLUMNA VIRTUAL final.
 *  • TICKS de un nivel: sus aparatos directos + sus hijos `derivacion_aparato`.
 *  • DERIVACIONES ANIDADAS: cualquier otro hijo se dibuja como stub elevado;
 *    en su sub-red, las `derivacion_aparato` y los aparatos aparecen como
 *    mini-ticks y los tramos intermedios se colapsan (`ocultos`).
 */
export function calcularEsquema(result: HS4Result): EsquemaHS4 {
  const tramos = result.porTramo;

  if (tramos.length === 0) {
    const yBase = ESQ4.yNivel0 + ESQ4.dyBase;
    return {
      columnas: [],
      base: [],
      nNiveles: 1,
      yBase,
      xBaseDer: ESQ4.x0Ramal + ESQ4.ramalLenMin,
      contentW: ESQ4.x0Ramal + ESQ4.ramalLenMin + ESQ4.margenDerecho,
      contentH: yBase + ESQ4.dyInferior,
      omitidos: [],
    };
  }

  const porId = new Map<string, ResultadoTramoHS4>();
  for (const t of tramos) porId.set(t.id, t);

  const aparatosDe = new Map<string, ResultadoAparatoHS4[]>();
  for (const ap of result.porAparato) {
    const lista = aparatosDe.get(ap.tramoId) ?? [];
    lista.push(ap);
    aparatosDe.set(ap.tramoId, lista);
  }

  const visitados = new Set<string>();
  const hijosDe = (t: ResultadoTramoHS4): ResultadoTramoHS4[] =>
    t.childrenIds
      .map((c) => porId.get(c))
      .filter((c): c is ResultadoTramoHS4 => c !== undefined && !visitados.has(c.id));

  // ── Raíz y cadena base (acometida → tubo de alimentación) ─────────────────
  const raices = tramos.filter((t) => t.parentId === null || !porId.has(t.parentId));
  const raiz =
    raices.find((t) => t.tipo === "acometida") ??
    raices.find((t) => t.tipo === "tubo_alimentacion") ??
    raices[0] ??
    tramos[0];

  const cadenaBase: ResultadoTramoHS4[] = [];
  const colgantes: ResultadoTramoHS4[] = [];

  if (esTipoBase(raiz)) {
    let cursor: ResultadoTramoHS4 | undefined = raiz;
    while (cursor) {
      visitados.add(cursor.id);
      cadenaBase.push(cursor);
      const hijos = hijosDe(cursor);
      const sigBase = hijos.filter((h) => esTipoBase(h));
      colgantes.push(...hijos.filter((h) => !esTipoBase(h)));
      colgantes.push(...sigBase.slice(1)); // bifurcación de base (raro) → nivel
      cursor = sigBase[0];
    }
  } else {
    colgantes.push(raiz);
  }

  /** Marca visitada una sub-red completa (colapso silencioso, determinista). */
  const visitarSubred = (t: ResultadoTramoHS4): void => {
    visitados.add(t.id);
    const cola = hijosDe(t);
    for (let i = 0; i < cola.length; i++) {
      const d = cola[i];
      visitados.add(d.id);
      cola.push(...hijosDe(d));
    }
  };

  // ── Niveles (marca visitados el subárbol de cada nivel) ────────────────────
  const construirNivel = (r: ResultadoTramoHS4): NivelTmp => {
    visitados.add(r.id);
    const items: ItemTmp[] = [];
    for (const ap of aparatosDe.get(r.id) ?? []) items.push({ clase: "tick", tick: { clase: "aparato", ap } });
    for (const hijo of hijosDe(r)) {
      visitados.add(hijo.id);
      if (hijo.tipo === "derivacion_aparato") {
        // Tick directo: la derivación de aparato representa también su aparato
        // (colgado de ella vía tramoId), sin duplicar marcas.
        items.push({ clase: "tick", tick: { clase: "tramo", t: hijo } });
        // Sub-red bajo una derivación de aparato (rarísimo): colapsa.
        for (const nieto of hijosDe(hijo)) visitarSubred(nieto);
        continue;
      }
      // Derivación anidada: stub con mini-ticks de su sub-red.
      const minis: TickTmp[] = (aparatosDe.get(hijo.id) ?? []).map((ap) => ({ clase: "aparato", ap }));
      let ocultos = 0;
      const cola = hijosDe(hijo);
      for (let i = 0; i < cola.length; i++) {
        const d = cola[i];
        visitados.add(d.id);
        if (d.tipo === "derivacion_aparato") {
          minis.push({ clase: "tramo", t: d });
        } else {
          ocultos += 1;
          minis.push(...(aparatosDe.get(d.id) ?? []).map((ap): TickTmp => ({ clase: "aparato", ap })));
        }
        cola.push(...hijosDe(d));
      }
      const stubW = Math.max(ESQ4.stubMin, minis.length * ESQ4.miniTickPaso);
      items.push({ clase: "deriv", t: hijo, minis, ocultos, stubW });
    }
    const ancho = items.reduce((s, it) => s + anchoItem(it), 0);
    return { t: r, items, ancho };
  };

  // ── Columnas (montantes reales primero, virtual al final) ──────────────────
  const colsTmp: ColTmp[] = [];
  const nivelesVirtuales: NivelTmp[] = [];

  for (let i = 0; i < colgantes.length; i++) {
    const c = colgantes[i];
    if (visitados.has(c.id)) continue;
    if (c.tipo === "columna_montante") {
      const cadena: ResultadoTramoHS4[] = [];
      const bloques: ResultadoTramoHS4[][] = [];
      let cursor: ResultadoTramoHS4 | undefined = c;
      while (cursor) {
        visitados.add(cursor.id);
        cadena.push(cursor);
        const hijos = hijosDe(cursor);
        const sigMontantes = hijos.filter((h) => h.tipo === "columna_montante");
        bloques.push(hijos.filter((h) => h.tipo !== "columna_montante"));
        colgantes.push(...sigMontantes.slice(1)); // ramificación → columna propia
        cursor = sigMontantes[0];
      }
      const niveles: NivelTmp[] = [];
      // Aguas arriba (último montante de la cadena) ARRIBA del esquema.
      for (const bloque of bloques.reverse()) {
        for (const r of bloque) niveles.push(construirNivel(r));
      }
      colsTmp.push({ cadena, niveles });
    } else {
      nivelesVirtuales.push(construirNivel(c));
    }
  }
  if (nivelesVirtuales.length > 0) colsTmp.push({ cadena: [], niveles: nivelesVirtuales });

  // ── Asignación de coordenadas ──────────────────────────────────────────────
  const nNiveles = Math.max(1, ...colsTmp.map((ct) => ct.niveles.length));
  const yBase = ESQ4.yNivel0 + (nNiveles - 1) * ESQ4.nivelH + ESQ4.dyBase;

  let xArranque = ESQ4.x0Ramal;
  const columnas: ColumnaHS4[] = colsTmp.map((ct) => {
    const ramalLen = Math.max(ESQ4.ramalLenMin, ...ct.niveles.map((n) => n.ancho + ESQ4.slotPad));
    const x0 = xArranque;
    const x = x0 + ramalLen;
    const niveles: NivelHS4[] = ct.niveles.map((n, i) => {
      const y = ESQ4.yNivel0 + i * ESQ4.nivelH;
      const u0 = x0 + 15;
      const u1 = x - 40;
      const gap = n.items.length > 0 ? Math.max(0, (u1 - u0 - n.ancho) / n.items.length) : 0;
      let cursorX = u0 + gap / 2;
      const items: ItemNivelHS4[] = n.items.map((it) => {
        const w = anchoItem(it);
        const centro = cursorX + w / 2;
        cursorX += w + gap;
        if (it.clase === "tick") {
          const tick: TickHS4 =
            it.tick.clase === "aparato"
              ? { clase: "aparato", ap: it.tick.ap, x: centro }
              : { clase: "tramo", t: it.tick.t, x: centro };
          return { clase: "tick", tick };
        }
        const paso = it.stubW / Math.max(1, it.minis.length);
        const miniTicks: TickHS4[] = it.minis.map((mt, k) => {
          const mx = centro - it.stubW / 2 + (k + 0.5) * paso;
          return mt.clase === "aparato"
            ? { clase: "aparato", ap: mt.ap, x: mx }
            : { clase: "tramo", t: mt.t, x: mx };
        });
        return {
          clase: "derivacion",
          deriv: { t: it.t, x: centro, stubW: it.stubW, miniTicks, ocultos: it.ocultos },
        };
      });
      return { t: n.t, x0, x1: x, y, items };
    });
    const yTop = ct.cadena.length > 0 ? ESQ4.yMontanteTop : ESQ4.yNivel0 - 24;
    xArranque = x + ESQ4.gapColumnas;
    return { cadena: ct.cadena, x, x0, yTop, niveles };
  });

  const xBaseDer =
    columnas.length > 0 ? columnas[columnas.length - 1].x : ESQ4.x0Ramal + ESQ4.ramalLenMin;

  // Segmentos de la base: la cadena reparte [xBaseIzq, xBaseDer] con la raíz
  // (acometida) a la IZQUIERDA, junto a la fuente (red general).
  const base: BaseSegHS4[] = [];
  if (cadenaBase.length > 0) {
    const span = Math.max(40, xBaseDer - ESQ4.xBaseIzq);
    const n = cadenaBase.length;
    cadenaBase.forEach((t, i) => {
      base.push({
        t,
        x0: ESQ4.xBaseIzq + (i * span) / n,
        x1: ESQ4.xBaseIzq + ((i + 1) * span) / n,
      });
    });
  }

  const omitidos = tramos.filter((t) => !visitados.has(t.id)).map((t) => t.id);

  return {
    columnas,
    base,
    nNiveles,
    yBase,
    xBaseDer,
    contentW: xBaseDer + ESQ4.margenDerecho,
    contentH: yBase + ESQ4.dyInferior,
    omitidos,
  };
}

// -----------------------------------------------------------------------------
// Tamaño NATIVO del viewBox (ÚNICA fuente de verdad, consumida por la ficha PDF
// para `scale = CW / nativeW` del raster). Reproduce EXACTAMENTE el viewBox que
// `HS4SVG` pinta (`[0, 0, contentW, contentH]` de `calcularEsquema`). CONGELADO
// (Fase 2): firma estable.
// -----------------------------------------------------------------------------
export function hs4NativeSize(result: HS4Result): { nativeW: number; nativeH: number } {
  const { contentW, contentH } = calcularEsquema(result);
  return { nativeW: contentW, nativeH: contentH };
}
