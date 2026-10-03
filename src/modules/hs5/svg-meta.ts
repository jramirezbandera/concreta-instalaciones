// DB-HS5 — Metadatos + geometría NO-COMPONENTE del ESQUEMA DE COLUMNA (sin JSX).
// Separado de `svg.tsx` para que ese archivo exporte SOLO componentes React
// (regla `react-refresh/only-export-components`): aquí viven el id del clon PDF,
// las constantes de layout y `calcularEsquema` (función PURA que sustituye al
// antiguo `calcularArbol` jerárquico — feature-7 / UX-RECONCEPT §7: muere el
// grafo genérico). Lo consumen el render (`svg.tsx`), la ficha PDF (`./ficha.ts`)
// y la pantalla (`./ui.tsx`) sin arrastrar JSX. ÚNICA fuente de verdad de las
// medidas: el render importa de aquí para no divergir.
//
// EL DIBUJO (maqueta validada `JustificacionHS5.dc.html`):
//   • colector(es) horizontales en la BASE, con flecha hacia la arqueta;
//   • bajante(s) VERTICALES (columnas), con ventilación primaria discontinua
//     sobre su extremo superior;
//   • un NIVEL por ramal directo de cada bajante (orden estable de
//     `childrenIds`, arriba→abajo), con forjados discontinuos entre niveles;
//   • aparatos como TICKS verticales sobre la horizontal del ramal (con sus UD);
//   • ramales anidados bajo otro ramal: DERIVACIÓN elevada sobre la horizontal
//     del padre (stub con mini-ticks).

import type { HS5Result, ResultadoAparato, ResultadoTramo } from "./calc";

// Id del clon oculto que la ficha PDF clona y pasa a svg2pdf. Se exporta aquí
// para que el toFichaData del módulo lo importe sin duplicar el literal.
// CONGELADO: debe ser EXACTAMENTE "hs5-svg-pdf".
export const HS5_PDF_SVG_ID = "hs5-svg-pdf";

// -----------------------------------------------------------------------------
// Constantes de layout (unidades abstractas del viewBox, ~px). Deterministas:
// sin Math.random, sin Date. Calibradas contra la maqueta validada (340×540
// para la vivienda tipo de los defaults: 1 bajante × 3 niveles).
// -----------------------------------------------------------------------------
export const ESQ = {
  margenX: 20, // margen lateral del contenido (forjados, caption)
  xEtiquetaNivel: 28, // x de las etiquetas de nivel (zona izquierda)
  x0Ramal: 100, // x de arranque de la horizontal del primer nivel
  gapColumnas: 44, // separación horizontal entre columnas (multi-bajante)
  margenDerecho: 90, // hueco a la derecha de la última columna (etiquetas)
  yAviso: 18, // y de la línea de aviso (árbol inválido)
  yVentTop: 62, // extremo superior de la ventilación primaria
  yBajanteTop: 86, // arranque superior de la bajante
  yNivel0: 110, // y de la horizontal del primer nivel
  nivelH: 120, // paso vertical entre niveles
  dyForjado: 40, // forjado discontinuo bajo la línea de cada nivel
  dyBase: 116, // de la última línea de nivel a la base (colector)
  tickH: 16, // alto del tick vertical de un aparato
  tickSlotW: 36, // ancho de slot reservado a un tick simple
  derivH: 26, // elevación del stub de una derivación anidada
  miniTickH: 10, // alto de los mini-ticks de una derivación
  miniTickPaso: 12, // ancho por mini-tick para dimensionar el stub
  stubMin: 30, // ancho mínimo del stub de una derivación
  ramalLenMin: 150, // longitud mínima de la horizontal de un nivel
  slotPad: 55, // holgura fija añadida a la suma de slots de un nivel
  xArqueta: 56, // x del recuadro de la arqueta
  ladoArqueta: 16, // lado del recuadro de la arqueta
  xFlecha: 84, // punta de la flecha hacia la arqueta
  xBaseIzq: 100, // extremo izquierdo de la línea base de colectores
  dyCaption: 56, // de la base del colector al caption inferior
  dyInferior: 74, // de la base del colector al borde inferior del viewBox
} as const;

// -----------------------------------------------------------------------------
// Geometría del esquema, derivada SOLO del resultado (determinista). La consumen
// `HS5SVG` (para pintar) y `hs5NativeSize` (tamaño nativo del raster PDF), de
// modo que `scale = CW / nativeW` no deforme nada.
// -----------------------------------------------------------------------------

/** Tick de aparato sobre la horizontal de un nivel (o mini-tick de un stub). */
export interface TickHS5 {
  ap: ResultadoAparato;
  x: number;
}

/** Ramal anidado bajo otro ramal: derivación elevada sobre la horizontal padre. */
export interface DerivacionHS5 {
  t: ResultadoTramo;
  /** Centro x del stub. */
  x: number;
  /** Ancho del stub horizontal. */
  stubW: number;
  /** Aparatos de la derivación Y de sus descendientes (mini-ticks). */
  miniTicks: TickHS5[];
  /** Nº de tramos descendientes NO dibujados (colapsados en la derivación). */
  ocultos: number;
}

export type ItemNivelHS5 =
  | { clase: "tick"; tick: TickHS5 }
  | { clase: "derivacion"; deriv: DerivacionHS5 };

/** Un nivel = un ramal directo de la bajante (una planta del esquema). */
export interface NivelHS5 {
  t: ResultadoTramo;
  x0: number; // extremo izquierdo de la horizontal
  x1: number; // extremo derecho (= x de la columna)
  y: number;
  items: ItemNivelHS5[];
}

/** Una columna = cadena de bajantes (≥1) o columna virtual (cadena vacía). */
export interface ColumnaHS5 {
  /** Cadena bajante→bajante (aguas abajo → aguas arriba); vacía si es virtual
   *  (ramales que cuelgan directamente del colector). */
  cadena: ResultadoTramo[];
  x: number; // x de la vertical
  x0: number; // x de arranque de las horizontales de sus niveles
  yTop: number;
  niveles: NivelHS5[];
}

/** Segmento de la línea base: un colector de la cadena raíz. */
export interface ColectorSegHS5 {
  t: ResultadoTramo;
  x0: number;
  x1: number;
}

export interface EsquemaHS5 {
  columnas: ColumnaHS5[];
  /** Segmentos de colector en la base (raíz a la izquierda, junto a la arqueta). */
  colectores: ColectorSegHS5[];
  /** Nº de filas de nivel (≥1) — fija los forjados y la altura total. */
  nNiveles: number;
  /** y de la línea base (colector). */
  yBase: number;
  /** Extremo derecho de la línea base (x de la última columna). */
  xBaseDer: number;
  contentW: number;
  contentH: number;
  /** Ids de tramos NO dibujados (raíces extra / inalcanzables por ciclo). */
  omitidos: string[];
}

/** Item lógico previo a la asignación de coordenadas. */
type ItemTmp =
  | { clase: "tick"; ap: ResultadoAparato }
  | { clase: "deriv"; t: ResultadoTramo; miniAparatos: ResultadoAparato[]; ocultos: number; stubW: number };

interface NivelTmp {
  t: ResultadoTramo;
  items: ItemTmp[];
  /** Suma de anchos de slot (para dimensionar la horizontal del nivel). */
  ancho: number;
}

interface ColTmp {
  cadena: ResultadoTramo[];
  niveles: NivelTmp[];
}

/** Ancho de slot de un item (tick simple o derivación con stub). */
function anchoItem(it: ItemTmp): number {
  return it.clase === "tick" ? ESQ.tickSlotW : it.stubW + 20;
}

/**
 * Calcula la geometría del esquema de columna de forma 100% determinista a
 * partir del resultado. Función pura compartida por el render y `hs5NativeSize`.
 *
 * Decisiones de mapeo (documentadas):
 *  • RAÍZ dibujada: el primer tramo raíz de tipo `colector` (o la primera raíz
 *    si no hay colector). Con árbol VÁLIDO el motor garantiza raíz única; las
 *    raíces extra (solo en estado inválido) quedan en `omitidos` y se avisan.
 *  • CADENA DE COLECTORES: colector→colector se dibuja como segmentos
 *    consecutivos de la línea base (la raíz junto a la arqueta, a la izquierda).
 *  • COLUMNAS: cada bajante que cuelga de la cadena de colectores. Una cadena
 *    bajante→bajante (multiplanta) forma UNA columna; sus niveles se apilan
 *    aguas arriba primero (arriba) → aguas abajo al final (abajo).
 *  • NIVELES: los hijos no-bajante de cada bajante, en orden de `childrenIds`,
 *    arriba→abajo. Ramales directos del colector van a una COLUMNA VIRTUAL
 *    final (vertical sin etiqueta de bajante ni ventilación).
 *  • DERIVACIONES ANIDADAS: un ramal hijo de otro ramal se dibuja como stub
 *    elevado sobre la horizontal del padre. Los descendientes MÁS profundos se
 *    colapsan en la derivación (`ocultos`; sus aparatos sí aparecen como
 *    mini-ticks y sus UD ya están en `udAcumuladas`).
 */
export function calcularEsquema(result: HS5Result): EsquemaHS5 {
  const tramos = result.porTramo;

  // Sin tramos: esquema vacío de tamaño mínimo estable (no degenera a 0).
  if (tramos.length === 0) {
    const yBase = ESQ.yNivel0 + ESQ.dyBase;
    return {
      columnas: [],
      colectores: [],
      nNiveles: 1,
      yBase,
      xBaseDer: ESQ.x0Ramal + ESQ.ramalLenMin,
      contentW: ESQ.x0Ramal + ESQ.ramalLenMin + ESQ.margenDerecho,
      contentH: yBase + ESQ.dyInferior,
      omitidos: [],
    };
  }

  const porId = new Map<string, ResultadoTramo>();
  for (const t of tramos) porId.set(t.id, t);

  // Aparatos por tramo (orden estable de porAparato).
  const aparatosDe = new Map<string, ResultadoAparato[]>();
  for (const ap of result.porAparato) {
    const lista = aparatosDe.get(ap.tramoId) ?? [];
    lista.push(ap);
    aparatosDe.set(ap.tramoId, lista);
  }

  const visitados = new Set<string>();
  /** Hijos existentes y aún no visitados (corta ciclos de árboles inválidos). */
  const hijosDe = (t: ResultadoTramo): ResultadoTramo[] =>
    t.childrenIds
      .map((c) => porId.get(c))
      .filter((c): c is ResultadoTramo => c !== undefined && !visitados.has(c.id));

  // ── Raíz y cadena de colectores ─────────────────────────────────────────────
  const raices = tramos.filter((t) => t.parentId === null || !porId.has(t.parentId));
  const raiz = raices.find((t) => t.tipo === "colector") ?? raices[0] ?? tramos[0];

  const cadenaColectores: ResultadoTramo[] = [];
  // Colgantes: candidatos a columna/nivel (se AMPLÍA durante el recorrido con
  // ramificaciones de bajante y colectores extra; bucle por índice).
  const colgantes: ResultadoTramo[] = [];

  if (raiz.tipo === "colector") {
    let cursor: ResultadoTramo | undefined = raiz;
    while (cursor) {
      visitados.add(cursor.id);
      cadenaColectores.push(cursor);
      const hijos = hijosDe(cursor);
      const sigColectores = hijos.filter((h) => h.tipo === "colector");
      colgantes.push(...hijos.filter((h) => h.tipo !== "colector"));
      // El primer colector hijo continúa la cadena; el resto (raro, solo con
      // topologías bifurcadas) se cuelga como nivel virtual para no perderlo.
      colgantes.push(...sigColectores.slice(1));
      cursor = sigColectores[0];
    }
  } else {
    colgantes.push(raiz);
  }

  // ── Construcción de niveles (marca visitados el subárbol de cada nivel) ────
  const construirNivel = (r: ResultadoTramo): NivelTmp => {
    visitados.add(r.id);
    const items: ItemTmp[] = [];
    for (const ap of aparatosDe.get(r.id) ?? []) items.push({ clase: "tick", ap });
    for (const hijo of hijosDe(r)) {
      visitados.add(hijo.id);
      const miniAparatos: ResultadoAparato[] = [...(aparatosDe.get(hijo.id) ?? [])];
      let ocultos = 0;
      // BFS determinista de los descendientes profundos: se colapsan en la
      // derivación (contados en `ocultos`), pero sus aparatos sí se dibujan.
      const cola = hijosDe(hijo);
      for (let i = 0; i < cola.length; i++) {
        const d = cola[i];
        visitados.add(d.id);
        ocultos += 1;
        miniAparatos.push(...(aparatosDe.get(d.id) ?? []));
        cola.push(...hijosDe(d));
      }
      const stubW = Math.max(ESQ.stubMin, miniAparatos.length * ESQ.miniTickPaso);
      items.push({ clase: "deriv", t: hijo, miniAparatos, ocultos, stubW });
    }
    const ancho = items.reduce((s, it) => s + anchoItem(it), 0);
    return { t: r, items, ancho };
  };

  // ── Columnas (bajantes reales primero, virtual al final) ───────────────────
  const colsTmp: ColTmp[] = [];
  const nivelesVirtuales: NivelTmp[] = [];

  for (let i = 0; i < colgantes.length; i++) {
    const c = colgantes[i];
    if (visitados.has(c.id)) continue;
    if (c.tipo === "bajante") {
      const cadena: ResultadoTramo[] = [];
      // Bloques de niveles por tramo de la cadena; se invierten al final para
      // que lo más aguas arriba (última bajante de la cadena) quede ARRIBA.
      const bloques: ResultadoTramo[][] = [];
      let cursor: ResultadoTramo | undefined = c;
      while (cursor) {
        visitados.add(cursor.id);
        cadena.push(cursor);
        const hijos = hijosDe(cursor);
        const sigBajantes = hijos.filter((h) => h.tipo === "bajante");
        bloques.push(hijos.filter((h) => h.tipo !== "bajante"));
        // Ramificación de bajantes (raro): la primera continúa la cadena, el
        // resto forma columnas propias a la derecha.
        colgantes.push(...sigBajantes.slice(1));
        cursor = sigBajantes[0];
      }
      const niveles: NivelTmp[] = [];
      for (const bloque of bloques.reverse()) {
        for (const r of bloque) niveles.push(construirNivel(r));
      }
      colsTmp.push({ cadena, niveles });
    } else {
      // Ramal (o colector extra) directo: nivel de la columna virtual.
      nivelesVirtuales.push(construirNivel(c));
    }
  }
  if (nivelesVirtuales.length > 0) colsTmp.push({ cadena: [], niveles: nivelesVirtuales });

  // ── Asignación de coordenadas ──────────────────────────────────────────────
  const nNiveles = Math.max(1, ...colsTmp.map((ct) => ct.niveles.length));
  const yBase = ESQ.yNivel0 + (nNiveles - 1) * ESQ.nivelH + ESQ.dyBase;

  let xArranque = ESQ.x0Ramal;
  const columnas: ColumnaHS5[] = colsTmp.map((ct) => {
    const ramalLen = Math.max(ESQ.ramalLenMin, ...ct.niveles.map((n) => n.ancho + ESQ.slotPad));
    const x0 = xArranque;
    const x = x0 + ramalLen;
    const niveles: NivelHS5[] = ct.niveles.map((n, i) => {
      const y = ESQ.yNivel0 + i * ESQ.nivelH;
      // Slots repartidos con hueco uniforme en la zona útil de la horizontal.
      const u0 = x0 + 15;
      const u1 = x - 40;
      const gap = n.items.length > 0 ? Math.max(0, (u1 - u0 - n.ancho) / n.items.length) : 0;
      let cursorX = u0 + gap / 2;
      const items: ItemNivelHS5[] = n.items.map((it) => {
        const w = anchoItem(it);
        const centro = cursorX + w / 2;
        cursorX += w + gap;
        if (it.clase === "tick") {
          return { clase: "tick", tick: { ap: it.ap, x: centro } };
        }
        const paso = it.stubW / Math.max(1, it.miniAparatos.length);
        const miniTicks: TickHS5[] = it.miniAparatos.map((ap, k) => ({
          ap,
          x: centro - it.stubW / 2 + (k + 0.5) * paso,
        }));
        return {
          clase: "derivacion",
          deriv: { t: it.t, x: centro, stubW: it.stubW, miniTicks, ocultos: it.ocultos },
        };
      });
      return { t: n.t, x0, x1: x, y, items };
    });
    const yTop = ct.cadena.length > 0 ? ESQ.yBajanteTop : ESQ.yNivel0 - 24;
    xArranque = x + ESQ.gapColumnas;
    return { cadena: ct.cadena, x, x0, yTop, niveles };
  });

  const xBaseDer =
    columnas.length > 0 ? columnas[columnas.length - 1].x : ESQ.x0Ramal + ESQ.ramalLenMin;

  // Segmentos de colector: la cadena reparte la línea base [xBaseIzq, xBaseDer]
  // con la raíz a la IZQUIERDA (junto a la flecha/arqueta).
  const colectores: ColectorSegHS5[] = [];
  if (cadenaColectores.length > 0) {
    const span = Math.max(40, xBaseDer - ESQ.xBaseIzq);
    const n = cadenaColectores.length;
    cadenaColectores.forEach((t, i) => {
      colectores.push({
        t,
        x0: ESQ.xBaseIzq + (i * span) / n,
        x1: ESQ.xBaseIzq + ((i + 1) * span) / n,
      });
    });
  }

  const omitidos = tramos.filter((t) => !visitados.has(t.id)).map((t) => t.id);

  return {
    columnas,
    colectores,
    nNiveles,
    yBase,
    xBaseDer,
    contentW: xBaseDer + ESQ.margenDerecho,
    contentH: yBase + ESQ.dyInferior,
    omitidos,
  };
}

// -----------------------------------------------------------------------------
// Tamaño NATIVO del viewBox (ÚNICA fuente de verdad, consumida por la ficha PDF
// para `scale = CW / nativeW` del raster). Reproduce EXACTAMENTE el viewBox que
// `HS5SVG` pinta (`[0, 0, contentW, contentH]` de `calcularEsquema`).
// -----------------------------------------------------------------------------
export function hs5NativeSize(result: HS5Result): { nativeW: number; nativeH: number } {
  const { contentW, contentH } = calcularEsquema(result);
  return { nativeW: contentW, nativeH: contentH };
}
