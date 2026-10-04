// =============================================================================
// Del SVG de un dibujo a entidades DXF (feature-16 §F).
//
// Los esquemas para el plano son los mismos dibujos de la ficha, en modo papel:
// en vez de redibujarlos para el CAD, se leen. El SVG (sacado con
// `renderToStaticMarkup`) se recorre con `DOMParser`:
//   - `line`, `rect`, `polyline`, `polygon` y `path` → LINE (de los `path` se
//     leen M, L, H, V y Z y sus relativas; una curva se aproxima por su cuerda,
//     que en estos dibujos solo aparece en flechas);
//   - `circle` → CIRCLE;
//   - `text` → TEXT, con su alineación y la altura de las mayúsculas.
// Lo que no se ve no pasa: trazos transparentes (las zonas de clic), rellenos
// blancos (el fondo), tramas (`url(#…)`), `defs`, `title` y `desc`. Una figura
// solo rellena pasa por su contorno (los forjados).
//
// Capas: el atributo `data-capa` del elemento o de su grupo más cercano; los
// textos van a la capa de textos salvo que digan otra. Escala: unidades del
// dibujo a metros, con el eje Y hacia arriba.
// =============================================================================

import { cajaDe, type Dibujo, type Entidad } from "./escribir";

export interface OpcionesSvgDxf {
  /** Metros por unidad del dibujo (la sección: 1/22). */
  escala: number;
  /** De `data-capa` a capa del DXF: { edificio: "INS-EDIFICIO" }. */
  capas: Record<string, string>;
  /** Capa de lo que no lleva `data-capa`. */
  capaPorDefecto: string;
  /** Capa de los textos sin `data-capa` propio. */
  capaTextos: string;
  /** Color ACI de cada capa del DXF. */
  colores: Record<string, number>;
}

/** Afín 2D: [a b c d e f] como en SVG (x' = a·x + c·y + e; y' = b·x + d·y + f). */
type Matriz = [number, number, number, number, number, number];
const IDENTIDAD: Matriz = [1, 0, 0, 1, 0, 0];

function multiplicar(m: Matriz, n: Matriz): Matriz {
  return [
    m[0] * n[0] + m[2] * n[1],
    m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3],
    m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4],
    m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}

function numeros(s: string): number[] {
  return (s.match(/-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gi) ?? []).map(Number);
}

/** `translate`, `scale`, `rotate` y `matrix`, en el orden en que se escriben. */
export function leerTransform(t: string | null): Matriz {
  if (!t) return IDENTIDAD;
  let m = IDENTIDAD;
  for (const [, op, args] of t.matchAll(/(\w+)\s*\(([^)]*)\)/g)) {
    const a = numeros(args);
    let n: Matriz = IDENTIDAD;
    if (op === "translate") n = [1, 0, 0, 1, a[0] ?? 0, a[1] ?? 0];
    else if (op === "scale") n = [a[0] ?? 1, 0, 0, a[1] ?? a[0] ?? 1, 0, 0];
    else if (op === "matrix" && a.length === 6) n = a as Matriz;
    else if (op === "rotate") {
      const r = ((a[0] ?? 0) * Math.PI) / 180;
      const rot: Matriz = [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0];
      n = a.length === 3 ? multiplicar(multiplicar([1, 0, 0, 1, a[1], a[2]], rot), [1, 0, 0, 1, -a[1], -a[2]]) : rot;
    }
    m = multiplicar(m, n);
  }
  return m;
}

/** Los segmentos de un `d`: M, L, H, V, Z (y sus relativas); las curvas, por su cuerda. */
export function segmentosPath(d: string): [number, number, number, number][] {
  const segs: [number, number, number, number][] = [];
  let x = 0;
  let y = 0;
  let x0 = 0;
  let y0 = 0;
  const ARGS: Record<string, number> = { m: 2, l: 2, h: 1, v: 1, z: 0, c: 6, s: 4, q: 4, t: 2, a: 7 };
  for (const [, cmd, cuerpo] of d.matchAll(/([MmLlHhVvZzCcSsQqTtAa])([^MmLlHhVvZzCcSsQqTtAa]*)/g)) {
    const a = numeros(cuerpo);
    const c = cmd.toLowerCase();
    const rel = cmd !== cmd.toUpperCase();
    const n = ARGS[c];
    if (c === "z") {
      if (x !== x0 || y !== y0) segs.push([x, y, x0, y0]);
      x = x0;
      y = y0;
      continue;
    }
    for (let i = 0; i + n <= a.length; i += n) {
      const p = a.slice(i, i + n);
      let nx = x;
      let ny = y;
      if (c === "h") nx = rel ? x + p[0] : p[0];
      else if (c === "v") ny = rel ? y + p[0] : p[0];
      else {
        nx = rel ? x + p[n - 2] : p[n - 2];
        ny = rel ? y + p[n - 1] : p[n - 1];
      }
      // Tras un M, los pares siguientes son L.
      if (c === "m" && i === 0) {
        x0 = nx;
        y0 = ny;
      } else {
        segs.push([x, y, nx, ny]);
      }
      x = nx;
      y = ny;
    }
  }
  return segs;
}

/** Estilo heredado mientras se baja por el árbol. */
interface Contexto {
  m: Matriz;
  capa: string | null;
  stroke: string | null;
  fill: string | null;
  fontSize: number;
  anchor: string;
  baseline: string;
  oculto: boolean;
}

const NO_SE_VE = new Set(["none", "transparent"]);
const BLANCO = new Set(["#fff", "#ffffff", "white"]);
const SALTAR = new Set(["defs", "title", "desc", "pattern", "clippath", "mask", "marker", "symbol", "style", "foreignobject"]);

function attr(el: Element, nombre: string): string | null {
  return el.getAttribute(nombre);
}

function visible(color: string | null): boolean {
  if (color === null) return false;
  const c = color.trim().toLowerCase();
  return !NO_SE_VE.has(c) && !c.startsWith("url(");
}

export function dibujoDeSvg(raiz: Element, op: OpcionesSvgDxf): Dibujo {
  const entidades: Entidad[] = [];
  const usadas = new Set<string>();
  const k = op.escala;

  const punto = (m: Matriz, x: number, y: number): [number, number] => [
    (m[0] * x + m[2] * y + m[4]) * k,
    -(m[1] * x + m[3] * y + m[5]) * k,
  ];
  const linea = (ctx: Contexto, capa: string, xa: number, ya: number, xb: number, yb: number, discontinua: boolean) => {
    const [x1, y1] = punto(ctx.m, xa, ya);
    const [x2, y2] = punto(ctx.m, xb, yb);
    if (Math.hypot(x2 - x1, y2 - y1) < 1e-9) return;
    usadas.add(capa);
    entidades.push({ tipo: "linea", capa, x1, y1, x2, y2, ...(discontinua ? { discontinua } : {}) });
  };
  const capaDe = (ctx: Contexto) => (ctx.capa !== null ? (op.capas[ctx.capa] ?? op.capaPorDefecto) : op.capaPorDefecto);

  function texto(el: Element, ctx: Contexto): void {
    const contenido = (el.textContent ?? "").replace(/\s+/g, " ").trim();
    if (contenido === "") return;
    const x = Number(attr(el, "x") ?? 0) + Number(attr(el, "dx") ?? 0);
    let y = Number(attr(el, "y") ?? 0) + Number(attr(el, "dy") ?? 0);
    // La línea base del DXF es la del SVG; si el SVG centra en vertical, se baja.
    if (ctx.baseline === "middle" || ctx.baseline === "central") y += ctx.fontSize * 0.35;
    const [px, py] = punto(ctx.m, x, y);
    const escalaM = Math.sqrt(Math.abs(ctx.m[0] * ctx.m[3] - ctx.m[1] * ctx.m[2]));
    const capa = attr(el, "data-capa") !== null ? (op.capas[attr(el, "data-capa")!] ?? op.capaPorDefecto) : op.capaTextos;
    usadas.add(capa);
    entidades.push({
      tipo: "texto",
      capa,
      x: px,
      y: py,
      // La altura del DXF es la de las mayúsculas: ~0,7 del cuerpo.
      altura: ctx.fontSize * 0.7 * escalaM * k,
      texto: contenido,
      alineacion: ctx.anchor === "middle" ? "centro" : ctx.anchor === "end" ? "derecha" : "izquierda",
    });
  }

  function forma(el: Element, ctx: Contexto, tag: string): void {
    const conTrazo = visible(ctx.stroke);
    const conRelleno = visible(ctx.fill) && !BLANCO.has((ctx.fill ?? "").trim().toLowerCase());
    if (!conTrazo && !conRelleno) return;
    // Un trazo abierto sin línea no se ve aunque tenga relleno (las zonas de clic).
    if (!conTrazo && (tag === "line" || tag === "polyline" || (tag === "path" && !/z/i.test(attr(el, "d") ?? "")))) return;
    const capa = capaDe(ctx);
    const disc = conTrazo && (attr(el, "stroke-dasharray") ?? "none") !== "none";
    const n = (a: string) => Number(attr(el, a) ?? 0);
    if (tag === "line") {
      linea(ctx, capa, n("x1"), n("y1"), n("x2"), n("y2"), disc);
    } else if (tag === "rect") {
      const [x, y, w, h] = [n("x"), n("y"), n("width"), n("height")];
      if (w <= 0 || h <= 0) return;
      linea(ctx, capa, x, y, x + w, y, disc);
      linea(ctx, capa, x + w, y, x + w, y + h, disc);
      linea(ctx, capa, x + w, y + h, x, y + h, disc);
      linea(ctx, capa, x, y + h, x, y, disc);
    } else if (tag === "circle") {
      const [cx, cy] = punto(ctx.m, n("cx"), n("cy"));
      const r = n("r") * Math.sqrt(Math.abs(ctx.m[0] * ctx.m[3] - ctx.m[1] * ctx.m[2])) * k;
      if (r <= 0) return;
      usadas.add(capa);
      entidades.push({ tipo: "circulo", capa, x: cx, y: cy, r });
    } else if (tag === "polyline" || tag === "polygon") {
      const p = numeros(attr(el, "points") ?? "");
      for (let i = 2; i + 1 < p.length; i += 2) linea(ctx, capa, p[i - 2], p[i - 1], p[i], p[i + 1], disc);
      if (tag === "polygon" && p.length >= 6) linea(ctx, capa, p[p.length - 2], p[p.length - 1], p[0], p[1], disc);
    } else if (tag === "path") {
      for (const [xa, ya, xb, yb] of segmentosPath(attr(el, "d") ?? "")) linea(ctx, capa, xa, ya, xb, yb, disc);
    }
  }

  function bajar(el: Element, padre: Contexto): void {
    const tag = el.tagName.toLowerCase();
    if (SALTAR.has(tag)) return;
    const opacidad = attr(el, "opacity");
    const ctx: Contexto = {
      m: multiplicar(padre.m, leerTransform(attr(el, "transform"))),
      capa: attr(el, "data-capa") ?? padre.capa,
      stroke: attr(el, "stroke") ?? padre.stroke,
      fill: attr(el, "fill") ?? padre.fill,
      fontSize: Number(attr(el, "font-size") ?? padre.fontSize),
      anchor: attr(el, "text-anchor") ?? padre.anchor,
      baseline: attr(el, "dominant-baseline") ?? padre.baseline,
      oculto:
        padre.oculto ||
        attr(el, "display") === "none" ||
        attr(el, "visibility") === "hidden" ||
        (opacidad !== null && Number(opacidad) === 0),
    };
    if (ctx.oculto) return;
    if (tag === "text") {
      texto(el, ctx);
      return;
    }
    if (tag === "svg" || tag === "g" || tag === "a") {
      for (const hijo of Array.from(el.children)) bajar(hijo, ctx);
      return;
    }
    forma(el, ctx, tag);
  }

  // El viewBox de la raíz no se aplica: las coordenadas ya son las del dibujo.
  bajar(raiz, {
    m: IDENTIDAD,
    capa: null,
    stroke: null,
    fill: "black",
    fontSize: 10,
    anchor: "start",
    baseline: "auto",
    oculto: false,
  });

  const capas: Record<string, number> = {};
  for (const c of [...usadas].sort()) capas[c] = op.colores[c] ?? 7;
  return { entidades, capas, ...cajaDe(entidades) };
}
