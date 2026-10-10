// =============================================================================
// Verificación energética global (HE0 y HE1) hecha con un programa reconocido.
// PURA.
//
// La app no calcula HE0 ni la verificación global de HE1: las hace HULC o CE3X
// (con el complemento de edificios nuevos). Aquí se lee el informe de ese
// programa, ya en texto (pdf.js, modo «líneas»), y se guardan sus resultados
// para que La obra, la memoria y el anejo los citen con su veredicto.
//
// Formato leído: el informe «Verificación de requisitos de CTE-HE0 y HE1» de
// CE3X v2.3 (caso PEDREGAL 41). Las tablas salen como «nombre | U | Ulim | Sí».
// Los informes de HULC aún no se reconocen: falta un ejemplo con que probarlo.
// =============================================================================

import type { JustificacionKey, Proyecto } from "../proyecto/tipos";
import { justificacionRegistry } from "../../data/justificacionRegistry";

/** Un valor del proyecto frente a su límite. */
export interface Comprobacion {
  valor: number;
  limite: number;
  cumple: boolean;
}

/** Una fila por elemento: transmitancia o permeabilidad de un hueco. */
export interface ComprobacionElemento extends Comprobacion {
  nombre: string;
}

export interface TransmitanciaElemento extends ComprobacionElemento {
  tipo: "opaco" | "hueco";
}

export interface CondensacionElemento {
  nombre: string;
  /** Solución constructiva que nombra el informe. */
  capas?: string;
  cumple: boolean;
}

/** Lo que se guarda del informe (en `justificaciones.he0he1_global`). */
export interface VerificacionEnergetica {
  formato: "ce3x";
  /** «CE3X v2.3». */
  programa: string;
  /** Nombre del PDF leído. */
  archivo: string;
  /** Fecha del informe, tal como la escribe: «24/2/2026». */
  fecha?: string;
  zonaClimatica?: string;
  /** Normativa que declara la portada («CTE 2013»): se avisa si no es la de 2019. */
  normativa?: string;
  /** HE0: energía primaria no renovable y total [kWh/m²·año]. */
  cepNren?: Comprobacion;
  cepTot?: Comprobacion;
  /** HE1: coeficiente global [W/m²K] y control solar [kWh/m²·mes]. */
  K?: Comprobacion;
  qsolJul?: Comprobacion;
  transmitancias: TransmitanciaElemento[];
  /** Q100 de los huecos [m³/h·m²]. */
  permeabilidad: ComprobacionElemento[];
  condensaciones: CondensacionElemento[];
}

export type LecturaVerificacion =
  | { ok: true; verificacion: VerificacionEnergetica }
  | { ok: false; error: string };

// ── Lectura ──────────────────────────────────────────────────────────────────

const NUM = String.raw`(\d+(?:[.,]\d+)?)`;

const num = (s: string): number => Number(s.replace(",", "."));

function comprobacion(valor: string | undefined, limite: string | undefined): Comprobacion | undefined {
  if (valor === undefined || limite === undefined) return undefined;
  const v = num(valor);
  const l = num(limite);
  return { valor: v, limite: l, cumple: v <= l };
}

/** El texto entre un rótulo y el siguiente de la lista (o el final). */
function seccion(texto: string, desde: RegExp, hasta: RegExp[]): string {
  const i = texto.search(desde);
  if (i < 0) return "";
  const resto = texto.slice(i);
  const fines = hasta.map((h) => resto.slice(1).search(h)).filter((n) => n >= 0);
  return fines.length > 0 ? resto.slice(0, Math.min(...fines) + 1) : resto;
}

/** «CEXv2.3» → «CE3X v2.3». */
function nombrePrograma(crudo: string): string {
  const t = crudo.trim();
  const ce3x = /^CE3?X\s*v?\s*([\d.]+)/i.exec(t);
  if (ce3x) return `CE3X v${ce3x[1]}`;
  return t;
}

/** Filas «nombre | valor | límite | Sí/No» de una tabla. */
function filasTabla(texto: string): { nombre: string; valor: number; limite: number; si: boolean }[] {
  const re = new RegExp(String.raw`^(.+?) \| ${NUM} \| ${NUM} \| (Sí|Si|No)\s*$`, "gm");
  return [...texto.matchAll(re)].map((m) => ({ nombre: m[1]!.trim(), valor: num(m[2]!), limite: num(m[3]!), si: m[4] !== "No" }));
}

/**
 * Lee el informe a partir del texto de sus páginas. Sin ningún resultado
 * reconocible, explica qué se lee hoy.
 */
export function leerVerificacion(paginas: readonly { texto: string }[], archivo: string): LecturaVerificacion {
  const texto = paginas.map((p) => p.texto).join("\n");
  if (/HULC|Herramienta unificada/i.test(texto) && !/CEXv|CE3X/i.test(texto)) {
    return {
      ok: false,
      error: "Es un informe de HULC: todavía no se leen. Por ahora se leen los informes de verificación de CE3X; anota el programa y la referencia del documento.",
    };
  }
  if (!/Verificación de requisitos de CTE-HE0 y HE1/i.test(texto)) {
    return {
      ok: false,
      error: "No parece un informe de verificación de HE0 y HE1. Se leen los informes «Verificación de requisitos de CTE-HE0 y HE1» de CE3X.",
    };
  }

  const programa = /Procedimiento de cálculo utilizado y versión:?\s*\|?\s*([^\n|]+)/i.exec(texto)?.[1];
  const fecha = /Fecha:\s*(\d{1,2}\/\d{1,2}\/\d{4})/.exec(texto)?.[1];
  const zona = /Zona climática(?: según el DB HE1)?\s*\|\s*([A-Eα]\d|ALPHA\d?)/i.exec(texto)?.[1];
  const normativa = /^(CTE \d{4})\s*$/m.exec(seccion(texto, /Normativa/, [/Referencia/]))?.[1];

  // HE0: la tabla del 2.k / 2.l (con más decimales que las gráficas del 1.1 / 1.2).
  const cepNren = comprobacion(
    new RegExp(String.raw`Consumo energía primaria no renovable[^\n]*\|\s*${NUM}`).exec(texto)?.[1],
    new RegExp(String.raw`Valor límite del consumo energía primaria no renovable[^\d]*?${NUM}`).exec(texto)?.[1],
  );
  const cepTot = comprobacion(
    new RegExp(String.raw`Consumo energía primaria total[^\n]*\|\s*${NUM}`).exec(texto)?.[1],
    new RegExp(String.raw`Valor límite del consumo energía primaria total[^\d]*?${NUM}`).exec(texto)?.[1],
  );
  // HE1, verificación global.
  const K = comprobacion(
    new RegExp(String.raw`^K = ${NUM}`, "m").exec(texto)?.[1],
    new RegExp(String.raw`^K lim = ${NUM}`, "m").exec(texto)?.[1],
  );
  const qsolJul = comprobacion(
    new RegExp(String.raw`qsol;jul:\s*${NUM}`).exec(texto)?.[1],
    new RegExp(String.raw`qsol;jul lim\s*${NUM}`).exec(texto)?.[1],
  );

  // HE1, por elementos.
  const transmitancias: TransmitanciaElemento[] = [];
  const secU = seccion(texto, /Transmitancia de la envolvente térmica/, [/Coeficiente global de transmisión/, /Control solar/]);
  const iHuecos = secU.search(/^Huecos\s*$/m);
  for (const [tipo, trozo] of [
    ["opaco", iHuecos >= 0 ? secU.slice(0, iHuecos) : secU],
    ["hueco", iHuecos >= 0 ? secU.slice(iHuecos) : ""],
  ] as const) {
    for (const f of filasTabla(trozo)) {
      transmitancias.push({ tipo, nombre: f.nombre, valor: f.valor, limite: f.limite, cumple: f.si && f.valor <= f.limite });
    }
  }
  const permeabilidad = filasTabla(seccion(texto, /Permeabilidad al aire/, [/condensaciones/i, /JUSTIFICACIÓN DEL CUMPLIMIENTO/])).map(
    (f): ComprobacionElemento => ({ nombre: f.nombre, valor: f.valor, limite: f.limite, cumple: f.si && f.valor <= f.limite }),
  );
  // La solución constructiva sigue en el renglón siguiente, sin « | ».
  const condensaciones: CondensacionElemento[] = [];
  for (const linea of seccion(texto, /Limitación de condensaciones/, [/^\d+\.\s/m, /Ref\. Catastral/]).split("\n")) {
    const m = /^(.+?) \| (.+?) \| (Cumple|No cumple)\s*$/.exec(linea);
    const ultima = condensaciones[condensaciones.length - 1];
    if (m && m[1] !== "Nombre") condensaciones.push({ nombre: m[1]!.trim(), capas: m[2]!.trim(), cumple: m[3] === "Cumple" });
    else if (!m && ultima && linea.trim() !== "" && !linea.includes("|")) ultima.capas = `${ultima.capas} ${linea.trim()}`;
  }

  if (!cepNren && !cepTot && !K && !qsolJul && transmitancias.length === 0) {
    return { ok: false, error: "No se encuentran resultados en el informe: ¿es el PDF completo, con sus anexos?" };
  }
  return {
    ok: true,
    verificacion: {
      formato: "ce3x",
      programa: programa ? nombrePrograma(programa) : "CE3X",
      archivo,
      ...(fecha ? { fecha } : {}),
      ...(zona ? { zonaClimatica: zona.toUpperCase() === "ALPHA" ? "α" : zona } : {}),
      ...(normativa ? { normativa } : {}),
      ...(cepNren ? { cepNren } : {}),
      ...(cepTot ? { cepTot } : {}),
      ...(K ? { K } : {}),
      ...(qsolJul ? { qsolJul } : {}),
      transmitancias,
      permeabilidad,
      condensaciones,
    },
  };
}

// ── Lo que dice del expediente ───────────────────────────────────────────────

/** Las justificaciones que resuelve el informe: la global y, con ella, HE1. */
export const CLAVES_ENERGIA: readonly JustificacionKey[] = ["he0he1_global", "he1"];

/** Un aspecto comprobado, ya redactado: una fila de la tabla de la memoria. */
export interface ResultadoVerificacion {
  /** «HE0 · Energía primaria no renovable». */
  exigencia: string;
  /** «104,88 kWh/m²·año». */
  proyecto: string;
  /** «≤ 106,65 kWh/m²·año». */
  limite: string;
  cumple: boolean;
}

const f2 = (n: number): string => n.toLocaleString("es-ES", { maximumFractionDigits: 2 });

function resultado(exigencia: string, c: Comprobacion | undefined, unidad: string): ResultadoVerificacion[] {
  return c ? [{ exigencia, proyecto: `${f2(c.valor)} ${unidad}`, limite: `≤ ${f2(c.limite)} ${unidad}`, cumple: c.cumple }] : [];
}

/** Por elementos: «12 elementos, el más desfavorable 0,46 ≤ 0,5». */
function porElementos(exigencia: string, els: readonly ComprobacionElemento[], unidad: string): ResultadoVerificacion[] {
  if (els.length === 0) return [];
  // El más desfavorable: el de mayor proporción valor/límite.
  const peor = els.reduce((a, b) => (b.valor / b.limite > a.valor / a.limite ? b : a));
  const fallan = els.filter((e) => !e.cumple);
  return [
    {
      exigencia,
      proyecto: fallan.length > 0 ? `${fallan.map((e) => e.nombre).join(", ")}: no cumple` : `${els.length} elementos; el más ajustado, ${peor.nombre}: ${f2(peor.valor)} ${unidad}`,
      limite: `≤ ${f2(peor.limite)} ${unidad}`,
      cumple: fallan.length === 0,
    },
  ];
}

/**
 * Los resultados del informe que tocan a cada justificación: la global lleva
 * HE0, K y el control solar; HE1, lo que se comprueba elemento a elemento.
 */
export function resultadosDe(v: VerificacionEnergetica, key: JustificacionKey): ResultadoVerificacion[] {
  if (key === "he0he1_global") {
    return [
      ...resultado("HE0 · Energía primaria no renovable (Cep,nren)", v.cepNren, "kWh/m²·año"),
      ...resultado("HE0 · Energía primaria total (Cep,tot)", v.cepTot, "kWh/m²·año"),
      ...resultado("HE1 · Coeficiente global de transmisión de calor (K)", v.K, "W/m²K"),
      ...resultado("HE1 · Control solar (qsol;jul)", v.qsolJul, "kWh/m²·mes"),
    ];
  }
  if (key === "he1") {
    const condensa = v.condensaciones;
    return [
      ...porElementos("HE1 · Transmitancia de los elementos opacos (U)", v.transmitancias.filter((t) => t.tipo === "opaco"), "W/m²K"),
      ...porElementos("HE1 · Transmitancia de los huecos (U)", v.transmitancias.filter((t) => t.tipo === "hueco"), "W/m²K"),
      ...porElementos("HE1 · Permeabilidad al aire de los huecos (Q100)", v.permeabilidad, "m³/h·m²"),
      ...(condensa.length > 0
        ? [
            {
              exigencia: "HE1 · Condensaciones intersticiales",
              proyecto: condensa.every((c) => c.cumple)
                ? `${condensa.length} cerramientos sin condensación`
                : `${condensa.filter((c) => !c.cumple).map((c) => c.nombre).join(", ")}: no cumple`,
              limite: "Sin condensación acumulada",
              cumple: condensa.every((c) => c.cumple),
            },
          ]
        : []),
    ];
  }
  return [];
}

/** Lo que conviene mirar del informe antes de darlo por bueno. */
export function avisosVerificacion(v: VerificacionEnergetica, zonaProyecto?: string): { id: string; titulo: string; detalle: string }[] {
  const avisos: { id: string; titulo: string; detalle: string }[] = [];
  if (v.normativa && v.normativa !== "CTE 2019") {
    avisos.push({
      id: "energia-normativa",
      titulo: `El informe dice «${v.normativa}» como normativa vigente`,
      detalle: "La verificación es la del CTE 2019 (DB-HE 2019): revisa el dato en el programa y vuelve a sacar el informe.",
    });
  }
  if (v.zonaClimatica && zonaProyecto && v.zonaClimatica !== zonaProyecto) {
    avisos.push({
      id: "energia-zona",
      titulo: `Zona climática del informe ${v.zonaClimatica}; la del proyecto, ${zonaProyecto}`,
      detalle: "La zona del informe no coincide con la que sale de la provincia y la altitud del proyecto (DB-HE Anejo B).",
    });
  }
  const faltan = [
    !v.cepNren && "energía primaria no renovable",
    !v.cepTot && "energía primaria total",
    v.transmitancias.length === 0 && "transmitancias",
  ].filter((x): x is string => typeof x === "string");
  if (faltan.length > 0) {
    avisos.push({
      id: "energia-incompleto",
      titulo: "El informe leído no trae todos los resultados",
      detalle: `No se han encontrado: ${faltan.join(", ")}.`,
    });
  }
  return avisos;
}

/** El programa con que se justifica la energía: el leído o anotado, o el genérico del registry. */
export function programaEnergia(p: Proyecto, key: JustificacionKey): string {
  const g = p.justificaciones.he0he1_global;
  const anotado = CLAVES_ENERGIA.includes(key) ? (g?.verificacion?.programa ?? g?.programa) : undefined;
  return anotado ?? justificacionRegistry.find((e) => e.key === key)?.externo?.destino ?? "otra herramienta";
}

/** Referencia del documento: HE1 comparte la de la verificación global. */
export function referenciaExterna(p: Proyecto, key: JustificacionKey): string | undefined {
  return p.justificaciones[CLAVES_ENERGIA.includes(key) ? "he0he1_global" : key]?.refExterna;
}
