// =============================================================================
// Zonas climáticas del DB-HE — Anejo B, Tabla a-Anejo B. *** VERIFICADA CELDA A
// CELDA (confianza alta) ***
//
// Para cada una de las 52 provincias/ciudades autónomas, la tabla a-Anejo B da
// la zona climática (Z.C., p.ej. "D3": letra = severidad climática de INVIERNO
// α/A/B/C/D/E, número = severidad de VERANO 1..4) en función de la altitud del
// emplazamiento sobre el nivel del mar (h), por tramos de altitud.
//
// PROCEDENCIA DE LA VERIFICACIÓN (2026-08-22): descargado el PDF oficial
// maquetado de codigotecnico.org (Documento Básico HE Ahorro de energía, texto
// consolidado de 14-jun-2022; Anejo B, "Tabla a-Anejo B. Zonas climáticas",
// p. 46) y transcrito por DOBLE vía independiente:
//   (a) reconstrucción geométrica: extracción de las líneas verticales de la
//       rejilla (bordes de las celdas combinadas) + posiciones de las etiquetas
//       de zona, con ajuste de cada borde a los límites teóricos de columna
//       (paso ~14,3 pt) y comprobación de que cada etiqueta cae en su tramo; y
//   (b) lectura visual de la página rasterizada a ~288 dpi, fila a fila.
// Ambas lecturas COINCIDEN en las 52 filas. Además la transcripción cumple la
// MONOTONÍA de invierno (α≤A≤B≤C≤D≤E al crecer la altitud) en todas las filas.
//
// NOTA (cambios 2019 respecto al derogado DB-HE 2013 confirmados en el PDF):
// p.ej. Huelva capital pasa a A4 (antes B4), Oviedo a D1 (antes C1),
// Canarias introduce la letra α (Las Palmas / S.C. Tenerife capital: α3).
//
// ALTITUD DE LA CAPITAL (feature-22): la tabla a-Anejo B solo da tramos de
// altitud. `altitudCapital_m` es la columna «Altitud» de la tabla a-Anejo G del
// MISMO DB-HE (`./aguaFriaHE.ts`, verificada casilla a casilla), la única altitud
// de las capitales que da el DB; antes eran valores orientativos (INE / tabla B.1
// del DB-HE 2013, derogado) que no coincidían con el Anejo G en 34 capitales y
// cambiaban la zona de Toledo (445 m, C4 → 629 m, D3) y Zaragoza (207 m, D3 →
// 199 m, C3). `zonaCapital` se DERIVA de los tramos verificados + esa altitud
// (autoconsistente por construcción). Sigue siendo una SUGERENCIA: el DB-HE pide
// la altitud del emplazamiento.
// =============================================================================

import { tablaCTE, type ProcedenciaCTE, type TablaCTE } from "../lib/cte/tabla";
import { AGUA_FRIA_ANEJO_G } from "./aguaFriaHE";
import {
  ZONAS_TERMICAS_TABLA_4_4,
  type ZonaProvincia,
  type ZonaTermica,
} from "../modules/hs3/tablas";

/** Procedencia de la tabla a-Anejo B (verificada celda a celda, ver cabecera). */
const PROC_ANEJO_B: ProcedenciaCTE = {
  db: "DB-HE",
  edicion: "2019 (RD 732/2019)",
  /** Texto consolidado 14-jun-2022 (incorpora RD 450/2022 y corr. errores). */
  fecha: "2022-06-14",
  articulo: "Anejo B, pto 1",
  tabla: "Tabla a-Anejo B",
  fuente:
    "codigotecnico.org · DBHE.pdf (consolidado 14-jun-2022), Anejo B p. 46 — " +
    "VERIFICADA celda a celda el 2026-08-22 (reconstrucción geométrica del PDF " +
    "+ lectura visual de la página rasterizada, ambas coincidentes)",
};

/** Cita compacta que devuelven los resolutores como campo `procedencia`. */
const CITA_ANEJO_B =
  "DB-HE, Anejo B, Tabla a-Anejo B — ed. 2019 (RD 732/2019), consolidado 2022-06-14";

/** Letras de severidad de invierno, de más cálida a más fría (α < A < … < E). */
export const LETRAS_INVIERNO = ["α", "A", "B", "C", "D", "E"] as const;

/**
 * Índice de severidad de invierno de una zona climática ("D3" → índice de "D").
 * Devuelve -1 si la zona no empieza por una letra de invierno válida.
 * (α es U+03B1, una única unidad UTF-16: indexar zona[0] es seguro.)
 */
export function severidadInviernoDe(zona: string): number {
  return (LETRAS_INVIERNO as readonly string[]).indexOf(zona.charAt(0));
}

/** Un tramo de altitud de la tabla a-Anejo B con la zona que le corresponde. */
export interface TramoAltitud {
  /**
   * Primer metro (entero) de altitud en el que aplica la zona — coincide con el
   * límite inferior IMPRESO de la columna del DB-HE ("451 - 500 m" → 451). El
   * primer tramo de cada provincia arranca en 0.
   */
  readonly altitudMin_m: number;
  /** Zona climática del tramo, p.ej. "D3" o "α3". */
  readonly zona: string;
}

/** Entrada de una provincia/ciudad autónoma en la tabla a-Anejo B. */
export interface EntradaProvincia {
  /** Capital de la provincia (denominación de uso común). */
  capital: string;
  /** Altitud de la capital [m]: la de la tabla a-Anejo G (ver cabecera). */
  altitudCapital_m: number;
  /** Zona climática de la capital, derivada de `tramos` + `altitudCapital_m`. */
  zonaCapital: string;
  /**
   * Tramos ordenados por `altitudMin_m` ASCENDENTE. Tramo aplicable a una
   * altitud h = el de MAYOR `altitudMin_m` que cumpla `altitudMin_m ≤ h`.
   */
  tramos: ReadonlyArray<TramoAltitud>;
}

/** Resuelve la zona de unos tramos para una altitud (regla de EntradaProvincia). */
function zonaEnTramos(tramos: ReadonlyArray<TramoAltitud>, altitud_m: number): string {
  // Altitudes negativas (bajo el nivel del mar) saturan en el primer tramo.
  let zona = tramos[0].zona;
  for (const t of tramos) {
    if (t.altitudMin_m <= altitud_m) zona = t.zona;
  }
  return zona;
}

type TramosProvincia = Pick<EntradaProvincia, "capital" | "tramos">;

/**
 * Constructor legible de una fila: capital + pares [altitudMin_m, zona]. La
 * altitud de la capital y su zona se añaden después, del Anejo G.
 */
function p(capital: string, ...pares: ReadonlyArray<readonly [number, string]>): TramosProvincia {
  return { capital, tramos: pares.map(([altitudMin_m, zona]) => ({ altitudMin_m, zona })) };
}

/** Completa cada fila con la altitud de su capital (tabla a-Anejo G) y la zona que le toca. */
function conCapital(filas: Record<string, TramosProvincia>): Record<string, EntradaProvincia> {
  return Object.fromEntries(
    Object.entries(filas).map(([provincia, f]) => {
      const altitudCapital_m = AGUA_FRIA_ANEJO_G.datos.provincias[provincia].altitud_m;
      return [provincia, { ...f, altitudCapital_m, zonaCapital: zonaEnTramos(f.tramos, altitudCapital_m) }];
    }),
  );
}

// -----------------------------------------------------------------------------
// Tabla a-Anejo B completa. Claves de provincia EXACTAMENTE las mismas que en
// ZONAS_TERMICAS_TABLA_4_4 (hs3/tablas.ts) para poder cruzar ambas tablas.
// Cada fila transcribe los tramos verificados del PDF oficial (ver cabecera).
// -----------------------------------------------------------------------------

export const ZONAS_CLIMATICAS_ANEJO_B: TablaCTE<{
  provincias: Record<string, EntradaProvincia>;
}> = tablaCTE(PROC_ANEJO_B, {
  provincias: conCapital({
    "Álava": p("Vitoria-Gasteiz", [0, "D1"], [601, "E1"]),
    "Albacete": p("Albacete", [0, "C3"], [451, "D3"], [951, "E1"]),
    "Alicante": p("Alicante/Alacant", [0, "B4"], [251, "C3"], [701, "D3"]),
    "Almería": p("Almería", [0, "A4"], [101, "B4"], [251, "B3"], [401, "C3"], [801, "D3"]),
    "Asturias": p("Oviedo", [0, "C1"], [51, "D1"], [551, "E1"]),
    "Ávila": p("Ávila", [0, "D2"], [551, "D1"], [851, "E1"]),
    "Badajoz": p("Badajoz", [0, "C4"], [401, "C3"], [451, "D3"]),
    "Baleares": p("Palma", [0, "B3"], [251, "C3"]),
    "Barcelona": p("Barcelona", [0, "C2"], [251, "D2"], [451, "D1"], [751, "E1"]),
    "Burgos": p("Burgos", [0, "D1"], [601, "E1"]),
    "Cáceres": p("Cáceres", [0, "C4"], [601, "D3"], [1051, "E1"]),
    "Cádiz": p("Cádiz", [0, "A3"], [151, "B3"], [451, "C3"], [601, "C2"], [851, "D2"]),
    "Cantabria": p("Santander", [0, "C1"], [151, "D1"], [651, "E1"]),
    "Castellón": p(
      "Castelló de la Plana",
      [0, "B3"],
      [101, "C3"],
      [501, "D3"],
      [601, "D2"],
      [1001, "E1"],
    ),
    "Ceuta": p("Ceuta", [0, "B3"]),
    "Ciudad Real": p("Ciudad Real", [0, "C4"], [451, "C3"], [501, "D3"]),
    "Córdoba": p("Córdoba", [0, "B4"], [151, "C4"], [551, "D3"]),
    "A Coruña": p("A Coruña", [0, "C1"], [201, "D1"]),
    "Cuenca": p("Cuenca", [0, "D3"], [801, "D2"], [1051, "E1"]),
    "Girona": p("Girona", [0, "C2"], [101, "D2"], [601, "E1"]),
    "Granada": p(
      "Granada",
      [0, "A4"],
      [51, "B4"],
      [351, "C4"],
      [601, "C3"],
      [801, "D3"],
      [1301, "E1"],
    ),
    "Guadalajara": p("Guadalajara", [0, "D3"], [951, "D2"], [1001, "E1"]),
    "Guipúzcoa": p("Donostia/San Sebastián", [0, "D1"], [401, "E1"]),
    "Huelva": p("Huelva", [0, "A4"], [51, "B4"], [151, "B3"], [351, "C3"], [801, "D3"]),
    "Huesca": p("Huesca", [0, "C3"], [201, "D3"], [401, "D2"], [701, "E1"]),
    "Jaén": p("Jaén", [0, "B4"], [351, "C4"], [751, "D3"], [1251, "E1"]),
    "Las Palmas": p(
      "Las Palmas de Gran Canaria",
      [0, "α3"],
      [351, "A2"],
      [751, "B2"],
      [1001, "C2"],
    ),
    "León": p("León", [0, "E1"]),
    "Lleida": p("Lleida", [0, "C3"], [101, "D3"], [601, "E1"]),
    "Lugo": p("Lugo", [0, "D1"], [501, "E1"]),
    "Madrid": p("Madrid", [0, "C3"], [501, "D3"], [951, "D2"], [1001, "E1"]),
    "Málaga": p("Málaga", [0, "A3"], [101, "B3"], [301, "C3"], [701, "D3"]),
    "Melilla": p("Melilla", [0, "A3"]),
    "Murcia": p("Murcia", [0, "B3"], [101, "C3"], [551, "D3"]),
    "Navarra": p("Pamplona/Iruña", [0, "C2"], [101, "D2"], [351, "D1"], [601, "E1"]),
    "Ourense": p("Ourense", [0, "C3"], [151, "C2"], [301, "D2"], [801, "E1"]),
    "Palencia": p("Palencia", [0, "D1"], [801, "E1"]),
    "Pontevedra": p("Pontevedra", [0, "C1"], [351, "D1"]),
    "La Rioja": p("Logroño", [0, "C2"], [201, "D2"], [701, "E1"]),
    "Salamanca": p("Salamanca", [0, "D2"], [851, "E1"]),
    "Segovia": p("Segovia", [0, "D2"], [1051, "E1"]),
    "Sevilla": p("Sevilla", [0, "B4"], [201, "C4"]),
    "Soria": p("Soria", [0, "D2"], [751, "D1"], [801, "E1"]),
    "Santa Cruz de Tenerife": p(
      "Santa Cruz de Tenerife",
      [0, "α3"],
      [351, "A2"],
      [751, "B2"],
      [1001, "C2"],
    ),
    "Tarragona": p("Tarragona", [0, "B3"], [101, "C3"], [501, "D3"]),
    "Teruel": p("Teruel", [0, "C3"], [451, "C2"], [501, "D2"], [1001, "E1"]),
    "Toledo": p("Toledo", [0, "C4"], [501, "D3"]),
    "Valencia": p("València", [0, "B3"], [51, "C3"], [501, "D2"], [951, "E1"]),
    "Valladolid": p("Valladolid", [0, "D2"], [801, "E1"]),
    "Vizcaya": p("Bilbao", [0, "C1"], [251, "D1"]),
    "Zamora": p("Zamora", [0, "D2"], [801, "E1"]),
    "Zaragoza": p("Zaragoza", [0, "C3"], [201, "D3"], [651, "E1"]),
  } satisfies Record<string, TramosProvincia>),
});

/** Las 52 provincias/ciudades autónomas, en orden alfabético (colación española). */
export const PROVINCIAS: readonly string[] = Object.keys(
  ZONAS_CLIMATICAS_ANEJO_B.datos.provincias,
).sort((a, b) => a.localeCompare(b, "es"));

/**
 * Zona climática del DB-HE (Anejo B) para una provincia y una altitud [m].
 * Determinista y pura. Devuelve `null` si la provincia no existe o la altitud
 * no es un número finito. Altitudes negativas saturan en el primer tramo.
 */
export function zonaClimaticaDe(
  provincia: string,
  altitud_m: number,
): { zona: string; procedencia: string } | null {
  const entrada = ZONAS_CLIMATICAS_ANEJO_B.datos.provincias[provincia];
  if (entrada === undefined || !Number.isFinite(altitud_m)) return null;
  return { zona: zonaEnTramos(entrada.tramos, altitud_m), procedencia: CITA_ANEJO_B };
}

/** Cita compacta de la Tabla 4.4 del DB-HS3 (procedencia del wrapper de abajo). */
const CITA_TABLA_4_4 = (() => {
  const q = ZONAS_TERMICAS_TABLA_4_4.procedencia;
  return `${q.db}, ${q.tabla ?? q.articulo ?? ""} — ed. ${q.edicion}`.replace(/\s+—/, " —");
})();

/**
 * Zona TÉRMICA (W/X/Y/Z) del DB-HS3 para una provincia y una altitud [m]:
 * wrapper fino sobre ZONAS_TERMICAS_TABLA_4_4 (hs3/tablas.ts) — los datos viven
 * ÚNICAMENTE allí; aquí solo se aplica el corte ≤800 m / >800 m de la 4.4.
 * Devuelve `null` si la provincia no existe, la altitud no es finita o la
 * combinación no es aplicable (Ceuta/Melilla por encima de 800 m).
 */
export function zonaTermicaHS3De(
  provincia: string,
  altitud_m: number,
): { zona: ZonaTermica; procedencia: string } | null {
  const provincias = ZONAS_TERMICAS_TABLA_4_4.datos.provincias as Record<string, ZonaProvincia>;
  const entrada = provincias[provincia];
  if (entrada === undefined || !Number.isFinite(altitud_m)) return null;
  const zona = altitud_m <= 800 ? entrada.hasta800 : entrada.mas800;
  return zona === null ? null : { zona, procedencia: CITA_TABLA_4_4 };
}

/**
 * Límite de tramo de altitud MÁS CERCANO a `altitud_m` dentro de la provincia,
 * si cae a menos de `margen_m` (feature-9).
 *
 * Sirve para avisar al proyectista de que está al borde de un cambio de zona
 * climática: los tramos de la Tabla a-Anejo B rompen en cotas concretas (451,
 * 501, 601, 801, 951, 1051… según provincia), así que unos pocos metros de
 * diferencia entre la altitud del núcleo urbano y la de la parcela pueden
 * cambiar la zona y con ella el U_lim exigido. Devuelve `null` si no hay
 * provincia, la altitud no es finita o no hay ningún límite cerca.
 */
export function limiteTramoCercano(
  provincia: string,
  altitud_m: number,
  margen_m = 30,
): { limite_m: number; zonaDebajo: string; zonaEncima: string } | null {
  const entrada = ZONAS_CLIMATICAS_ANEJO_B.datos.provincias[provincia];
  if (entrada === undefined || !Number.isFinite(altitud_m)) return null;
  let mejor: { limite_m: number; zonaDebajo: string; zonaEncima: string } | null = null;
  let mejorDist = Infinity;
  for (const tramo of entrada.tramos) {
    const desde = tramo.altitudMin_m;
    // El primer tramo (desde 0) no es una frontera entre zonas.
    if (desde <= 0) continue;
    const dist = Math.abs(altitud_m - desde);
    if (dist <= margen_m && dist < mejorDist) {
      mejorDist = dist;
      mejor = {
        limite_m: desde,
        zonaDebajo: zonaEnTramos(entrada.tramos, desde - 1),
        zonaEncima: tramo.zona,
      };
    }
  }
  return mejor;
}

/**
 * Capital de la provincia y su altitud de referencia [m] (feature-9). Es la
 * ÚNICA altitud por municipio que el proyecto tiene verificada: se ofrece como
 * sugerencia cuando el municipio elegido ES la capital: la de la tabla a-Anejo G
 * (ver cabecera). El DB-HE exige la del EMPLAZAMIENTO.
 * `null` si la provincia no existe.
 */
export function altitudCapitalDe(
  provincia: string,
): { capital: string; altitud_m: number } | null {
  const entrada = ZONAS_CLIMATICAS_ANEJO_B.datos.provincias[provincia];
  if (entrada === undefined) return null;
  return { capital: entrada.capital, altitud_m: entrada.altitudCapital_m };
}
