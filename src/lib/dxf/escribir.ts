// =============================================================================
// Un dibujo a DXF R12 (AC1009) (feature-16 §F). Port de `src/lib/dxf/escribir.ts`
// de Concreta, con capas libres, tipo de línea discontinua y círculos.
//
// R12 porque es el DXF que lee todo —AutoCAD, BricsCAD, LibreCAD, visores
// web— y no necesita manejadores ni sección OBJECTS: el fichero es una lista de
// pares código/valor. Un código de grupo en una línea y su valor en la
// siguiente, SIEMPRE: un salto de más y el CAD abre un dibujo vacío sin decir
// por qué. Los reales, con punto decimal y precisión fija. El fichero va en
// cp1252 (`aLatin1`) y lo dice en la cabecera, o los acentos salen como
// símbolos.
// =============================================================================

import { aLatin1, dxfStr } from "./texto";

export type Entidad =
  | { tipo: "linea"; capa: string; x1: number; y1: number; x2: number; y2: number; discontinua?: boolean }
  | { tipo: "circulo"; capa: string; x: number; y: number; r: number }
  | {
      tipo: "texto";
      capa: string;
      /** Punto de inserción en la línea base. */
      x: number;
      y: number;
      altura: number;
      texto: string;
      alineacion: "izquierda" | "centro" | "derecha";
    };

export interface Dibujo {
  entidades: Entidad[];
  /** Color ACI de cada capa. */
  capas: Record<string, number>;
  /** Caja del conjunto, para la vista inicial. */
  min: { x: number; y: number };
  max: { x: number; y: number };
}

/** Estilo de texto propio, con Arial: la `txt.shx` no tiene «²» ni se lee bien. */
export const ESTILO_TEXTO = "CONCRETA-INST";

const nl = "\r\n";

function par(codigo: number, valor: string | number): string {
  return `${codigo}${nl}${valor}${nl}`;
}

function real(v: number): string {
  return (Object.is(v, -0) ? 0 : v).toFixed(6);
}

/** La caja de un conjunto de entidades (0,0 si no hay ninguna). */
export function cajaDe(entidades: readonly Entidad[]): Pick<Dibujo, "min" | "max"> {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const ver = (x: number, y: number) => {
    x0 = Math.min(x0, x);
    y0 = Math.min(y0, y);
    x1 = Math.max(x1, x);
    y1 = Math.max(y1, y);
  };
  for (const e of entidades) {
    if (e.tipo === "linea") {
      ver(e.x1, e.y1);
      ver(e.x2, e.y2);
    } else if (e.tipo === "circulo") {
      ver(e.x - e.r, e.y - e.r);
      ver(e.x + e.r, e.y + e.r);
    } else {
      ver(e.x, e.y);
      ver(e.x, e.y + e.altura);
    }
  }
  if (!Number.isFinite(x0)) return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
  return { min: { x: x0, y: y0 }, max: { x: x1, y: y1 } };
}

const RELACION_VISTA = 1.6;
const AIRE_VISTA = 1.15;

function vista(d: Dibujo): { cx: number; cy: number; alto: number } {
  const ancho = Math.max(d.max.x - d.min.x, 1);
  const alto = Math.max(d.max.y - d.min.y, 1);
  return {
    cx: (d.min.x + d.max.x) / 2,
    cy: (d.min.y + d.max.y) / 2,
    alto: Math.max(alto, ancho / RELACION_VISTA) * AIRE_VISTA,
  };
}

function cabecera(d: Dibujo): string {
  const v = vista(d);
  return (
    par(0, "SECTION") +
    par(2, "HEADER") +
    par(9, "$ACADVER") +
    par(1, "AC1009") +
    par(9, "$DWGCODEPAGE") +
    par(3, "ANSI_1252") +
    par(9, "$INSUNITS") +
    par(70, 6) + // metros
    par(9, "$EXTMIN") +
    par(10, real(d.min.x)) +
    par(20, real(d.min.y)) +
    par(30, real(0)) +
    par(9, "$EXTMAX") +
    par(10, real(d.max.x)) +
    par(20, real(d.max.y)) +
    par(30, real(0)) +
    par(9, "$LIMMIN") +
    par(10, real(d.min.x)) +
    par(20, real(d.min.y)) +
    par(9, "$LIMMAX") +
    par(10, real(d.max.x)) +
    par(20, real(d.max.y)) +
    par(9, "$LTSCALE") +
    par(40, real(1)) +
    // La vista guardada va aquí y en VPORT: no todos los programas miran la misma.
    par(9, "$VIEWCTR") +
    par(10, real(v.cx)) +
    par(20, real(v.cy)) +
    par(9, "$VIEWSIZE") +
    par(40, real(v.alto)) +
    par(0, "ENDSEC")
  );
}

/** El registro *ACTIVE de VPORT, completo: a uno incompleto hay programas que lo ignoran. */
function vport(d: Dibujo): string {
  const v = vista(d);
  const paso = v.alto / 10;
  return (
    par(0, "TABLE") +
    par(2, "VPORT") +
    par(70, 1) +
    par(0, "VPORT") +
    par(2, "*ACTIVE") +
    par(70, 0) +
    par(10, real(0)) +
    par(20, real(0)) +
    par(11, real(1)) +
    par(21, real(1)) +
    par(12, real(v.cx)) +
    par(22, real(v.cy)) +
    par(13, real(0)) +
    par(23, real(0)) +
    par(14, real(paso)) +
    par(24, real(paso)) +
    par(15, real(paso)) +
    par(25, real(paso)) +
    par(16, real(0)) +
    par(26, real(0)) +
    par(36, real(1)) +
    par(17, real(0)) +
    par(27, real(0)) +
    par(37, real(0)) +
    par(40, real(v.alto)) +
    par(41, real(RELACION_VISTA)) +
    par(42, real(50)) +
    par(43, real(0)) +
    par(44, real(0)) +
    par(45, real(0)) +
    par(50, real(0)) +
    par(51, real(0)) +
    par(71, 0) +
    par(72, 100) +
    par(73, 1) +
    par(74, 3) +
    par(75, 0) +
    par(76, 0) +
    par(77, 0) +
    par(78, 0) +
    par(0, "ENDTAB")
  );
}

/** Tipos de línea: continua y discontinua (trazos de 0,10 m, huecos de 0,05 m). */
function ltypes(): string {
  const ltype = (nombre: string, descripcion: string, trazos: number[]) =>
    par(0, "LTYPE") +
    par(2, nombre) +
    par(70, 0) +
    par(3, descripcion) +
    par(72, 65) +
    par(73, trazos.length) +
    par(40, real(trazos.reduce((a, b) => a + Math.abs(b), 0))) +
    trazos.map((t) => par(49, real(t))).join("");
  return (
    par(0, "TABLE") +
    par(2, "LTYPE") +
    par(70, 2) +
    ltype("CONTINUOUS", "Solid line", []) +
    ltype("DASHED", "Dashed __ __ __", [0.1, -0.05]) +
    par(0, "ENDTAB")
  );
}

function tablas(d: Dibujo): string {
  let s = par(0, "SECTION") + par(2, "TABLES") + vport(d) + ltypes();
  const estilo = (nombre: string, fuente: string) =>
    par(0, "STYLE") +
    par(2, nombre) +
    par(70, 0) +
    par(40, real(0)) +
    par(41, real(1)) +
    par(50, real(0)) +
    par(71, 0) +
    par(42, real(0.2)) +
    par(3, fuente) +
    par(4, "");
  s += par(0, "TABLE") + par(2, "STYLE") + par(70, 2) + estilo("STANDARD", "txt") + estilo(ESTILO_TEXTO, "arial.ttf") + par(0, "ENDTAB");
  const capas = Object.entries(d.capas).sort(([a], [b]) => a.localeCompare(b));
  s += par(0, "TABLE") + par(2, "LAYER") + par(70, capas.length);
  for (const [nombre, color] of capas) {
    s += par(0, "LAYER") + par(2, nombre) + par(70, 0) + par(62, color) + par(6, "CONTINUOUS");
  }
  s += par(0, "ENDTAB");
  return s + par(0, "ENDSEC");
}

const JUSTIFICACION = { izquierda: 0, centro: 1, derecha: 2 } as const;

function entidad(e: Entidad): string {
  if (e.tipo === "linea") {
    return (
      par(0, "LINE") +
      par(8, e.capa) +
      (e.discontinua ? par(6, "DASHED") : "") +
      par(10, real(e.x1)) +
      par(20, real(e.y1)) +
      par(30, real(0)) +
      par(11, real(e.x2)) +
      par(21, real(e.y2)) +
      par(31, real(0))
    );
  }
  if (e.tipo === "circulo") {
    return par(0, "CIRCLE") + par(8, e.capa) + par(10, real(e.x)) + par(20, real(e.y)) + par(30, real(0)) + par(40, real(e.r));
  }
  let s =
    par(0, "TEXT") +
    par(8, e.capa) +
    par(10, real(e.x)) +
    par(20, real(e.y)) +
    par(30, real(0)) +
    par(40, real(e.altura)) +
    par(1, dxfStr(e.texto)) +
    par(7, ESTILO_TEXTO);
  // El punto de alineación (11/21) solo cuenta si la justificación no es la de por defecto.
  if (e.alineacion !== "izquierda") {
    s += par(72, JUSTIFICACION[e.alineacion]) + par(11, real(e.x)) + par(21, real(e.y)) + par(31, real(0));
  }
  return s;
}

export function escribirDxf(d: Dibujo): string {
  return (
    cabecera(d) +
    tablas(d) +
    par(0, "SECTION") +
    par(2, "ENTITIES") +
    d.entidades.map(entidad).join("") +
    par(0, "ENDSEC") +
    par(0, "EOF")
  );
}

/** El DXF como fichero, ya en cp1252. */
export function dxfBlob(d: Dibujo): Blob {
  return new Blob([aLatin1(escribirDxf(d))], { type: "image/vnd.dxf" });
}
