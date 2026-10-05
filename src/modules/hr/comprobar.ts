// =============================================================================
// DB-HR — La lectura de las tablas de la opción simplificada (feature-25): con
// los valores ya resueltos de cada solución, busca la fila y la alternativa que
// se cumplen (K-HR.11) y las condiciones de la fachada a la que acometen.
// PURO; no redacta (las condiciones llevan un texto corto para la franja y la
// ficha, que es dato del DB).
// =============================================================================

import type { ClaseFachada } from "./catalogo";
import {
  ADOSADAS_HR,
  exigenciaHueco,
  FLANCOS_HR,
  HORIZONTALES_HR,
  LIMITES_HR,
  nivelFachada,
  tramoHuecos,
  NOTAS_VERTICALES_HR,
  VERTICALES_HR,
  type AltVertical,
  type CeldaHorizontal,
  type ColumnaHorizontal,
  type Combinacion,
  type FilaAdosada,
  type FilaHorizontal,
  type FilaVertical,
  type TipoTabiqueria,
} from "./tablas";

/** Una condición de la solución: se cumple, no se cumple o se declara (null). */
export interface Condicion {
  texto: string;
  cumple: boolean | null;
}

/** La fachada a la que acometen las separaciones, resuelta. */
export interface FachadaFlanco {
  clase: ClaseFachada;
  interior: "fabrica" | "entramado";
  aislExterior: boolean;
  principal: { m: number; RA: number };
  hojaInterior: { m: number; RA: number } | null;
}

const fmt = (n: number) => n.toLocaleString("es-ES", { maximumFractionDigits: 1 });
const unaHojaDeFabrica = (f: FachadaFlanco) => f.clase === "una_hoja" || (f.clase === "ventilada" && f.interior === "fabrica");

function cumpleHoja(nombre: string, hoja: { m: number; RA: number } | null, min: { m: number; RA?: number }): Condicion {
  const pide = `m ≥ ${min.m} kg/m²${min.RA !== undefined ? ` y RA ≥ ${min.RA} dBA` : ""}`;
  if (!hoja) return { texto: `${nombre}: ${pide} (falta el dato)`, cumple: false };
  const ok = hoja.m >= min.m && (min.RA === undefined || hoja.RA >= min.RA);
  return { texto: `${nombre}: m ${fmt(hoja.m)} kg/m²${min.RA !== undefined ? `, RA ${fmt(hoja.RA)} dBA` : ""}; ${pide}`, cumple: ok };
}

// ── Flancos de la tabla 3.2 (3.1.2.3.4 pto 7) ───────────────────────────────

export function flancosVertical(tipo: 1 | 2 | 3, f: FachadaFlanco, mSeparador: number, instalaciones: boolean): Condicion[] {
  const F = FLANCOS_HR.datos;
  const noContemplado = (t: string): Condicion[] => [{ texto: `La tabla 3.2 no contempla ${t}: opción general`, cumple: false }];
  if (tipo === 1) {
    if (unaHojaDeFabrica(f)) {
      const c = [cumpleHoja("Hoja de fábrica de la fachada", f.principal, F.unaHoja)];
      if (instalaciones) c.push({ texto: "Esta fachada no vale junto a un recinto de instalaciones", cumple: false });
      return c;
    }
    if (f.clase === "dos_hojas") return [cumpleHoja("Hoja exterior de la fachada", f.principal, F.exteriorDosHojasTipo1)];
    if (f.interior === "entramado") return [cumpleHoja("Hoja interior de entramado", f.hojaInterior, F.interiorEntramado)];
    return noContemplado("el tipo 1 con fachada ligera y hoja interior de fábrica");
  }
  if (tipo === 2) {
    if (f.clase === "dos_hojas" && f.interior === "fabrica") return [{ texto: "Fachada pesada de dos hojas: sin restricciones", cumple: true }];
    if (unaHojaDeFabrica(f)) {
      // «Menor que 170» prohibido; con 170 exactos, las exigencias de «mayor que 170» (K-HR.18).
      if (mSeparador < F.tipo2Separador) return [{ texto: `Separador de ${fmt(mSeparador)} kg/m² (< ${F.tipo2Separador}) contra una fachada de una hoja: no permitido`, cumple: false }];
      return [cumpleHoja("Fachada de una hoja", f.principal, F.tipo2Fachada)];
    }
    return noContemplado("el tipo 2 con fachadas ligeras o con hoja interior de entramado");
  }
  if (f.clase === "dos_hojas" && f.interior === "entramado") return [cumpleHoja("Hoja exterior de la fachada", f.principal, F.exteriorEntramado)];
  if ((f.clase === "ventilada" || f.clase === "ligera") && f.interior === "entramado") return [cumpleHoja("Hoja interior de entramado", f.hojaInterior, F.interiorEntramado)];
  return noContemplado("el tipo 3 con fachadas de una hoja o con hoja interior de fábrica");
}

// ── Tabla 3.2 ───────────────────────────────────────────────────────────────

export interface EntradaVertical {
  tipo: 1 | 2 | 3;
  m: number;
  RA: number;
  /** ΔRA del trasdosado sobre esta base, o null si no lleva. */
  dRA: number | null;
  unaCara: boolean;
  /** Columna de la tabla 3.2. */
  columna: "fabrica" | "entramado";
  tabiqueria: TipoTabiqueria;
  /** Recinto de instalaciones o de actividad: valores entre paréntesis. */
  paren: boolean;
  instalaciones: boolean;
  forjadoM: number;
  sueloDRA: number;
  techoDRA: number;
  fachada: FachadaFlanco;
  bandas?: { en: "dos" | "una"; hojaM: number; apoyadaRA?: number };
}

export interface ResultadoVertical {
  cumple: boolean;
  /** La fila y la alternativa que se usan (la que cumple o, si ninguna, la más próxima). */
  fila: FilaVertical | null;
  alt: AltVertical | null;
  /** El ΔRA que pide la alternativa al trasdosado (con + 4 por una cara), o null si no lo necesita. */
  dRAExigido: number | null;
  condiciones: Condicion[];
  flancos: Condicion[];
}

function forjadoPorNotas(notas: readonly number[], e: EntradaVertical): Condicion[] {
  const N = NOTAS_VERTICALES_HR.datos;
  const c: Condicion[] = [];
  if (notas.includes(13)) c.push({ texto: `Forjado m ≥ ${N.n13.forjado} kg/m² (nota 13)`, cumple: e.forjadoM >= N.n13.forjado });
  if (notas.includes(11)) {
    c.push({ texto: `Forjado m ≥ ${N.n11.forjado} kg/m² (nota 11)`, cumple: e.forjadoM >= N.n11.forjado });
    c.push({ texto: `Suelo flotante ΔRA ≥ ${N.n11.sueloDRA} dBA a los dos lados (nota 11)`, cumple: e.sueloDRA >= N.n11.sueloDRA });
  }
  if (notas.includes(12)) {
    c.push({ texto: `Forjado m ≥ ${N.n12.forjado} kg/m² (nota 12)`, cumple: e.forjadoM >= N.n12.forjado });
    c.push({ texto: `Suelo flotante ΔRA ≥ ${N.n12.sueloDRA} y techo ΔRA ≥ ${N.n12.techoDRA} dBA a los dos lados (nota 12)`, cumple: e.sueloDRA >= N.n12.sueloDRA && e.techoDRA >= N.n12.techoDRA });
  }
  if (notas.includes(10)) c.push({ texto: `Forjado m > ${N.n10.forjadoMasDe} kg/m² (nota 10)`, cumple: e.forjadoM > N.n10.forjadoMasDe });
  if (![10, 11, 12, 13].some((n) => notas.includes(n))) {
    const F = LIMITES_HR.datos.forjadoPorDefecto;
    c.push({ texto: `Forjado m ≥ ${F} kg/m² (ap. 3.1.2.3.4 pto 5)`, cumple: e.forjadoM >= F });
  }
  return c;
}

function condicionesAlt(fila: FilaVertical, alt: AltVertical, e: EntradaVertical): Condicion[] {
  const notas = [...fila.notas, ...alt.notas];
  const N = NOTAS_VERTICALES_HR.datos;
  const c = forjadoPorNotas(notas, e);
  if (notas.includes(8)) c.push({ texto: "No vale contra una fachada de una hoja de fábrica o ventilada con hoja interior de fábrica (nota 8)", cumple: !unaHojaDeFabrica(e.fachada) });
  if (notas.includes(9)) {
    const techo = e.fachada.clase === "ligera" ? N.n9.techoInterior : N.n9.techoPesada;
    c.push({ texto: `Suelo flotante ΔRA ≥ ${N.n9.sueloDRA} a los dos lados y techo ΔRA ≥ ${techo} dBA en el recinto de instalaciones o actividad (nota 9)`, cumple: e.sueloDRA >= N.n9.sueloDRA && e.techoDRA >= techo });
  }
  if (notas.includes(6)) {
    c.push({ texto: "Tabiquería de entramado o de fábrica con bandas en los dos recintos (nota 6)", cumple: e.tabiqueria !== "apoyo" });
    c.push({ texto: "No vale contra fachadas ventiladas o con aislamiento por el exterior (nota 6)", cumple: e.fachada.clase !== "ventilada" && !e.fachada.aislExterior });
  }
  if ((notas.includes(5) || notas.includes(6)) && e.bandas) {
    c.push({ texto: `Cada hoja con bandas, m ≤ 150 kg/m² (nota ${notas.includes(6) ? 6 : 5})`, cumple: e.bandas.hojaM <= 150 });
    if (e.bandas.en === "una") {
      const ra = notas.includes(6) ? 45 : 42;
      c.push({ texto: `Hoja apoyada en el forjado, RA ≥ ${ra} dBA (nota ${notas.includes(6) ? 6 : 5})`, cumple: (e.bandas.apoyadaRA ?? 0) >= ra });
    }
  }
  if (notas.includes(7)) c.push({ texto: "Bandas elásticas en los encuentros con la tabiquería de fábrica (nota 7)", cumple: e.tabiqueria === "entramado" ? true : null });
  return c;
}

export function comprobarVertical(e: EntradaVertical): ResultadoVertical {
  const flancos = flancosVertical(e.tipo, e.fachada, e.m, e.instalaciones);
  const flancosOk = flancos.every((c) => c.cumple !== false);
  const extra = e.unaCara ? LIMITES_HR.datos.trasdosadoUnaCara : 0;
  const filas = VERTICALES_HR.datos.filas.filter((f) => f.tipo === e.tipo && f.m <= e.m && f.RA <= e.RA);
  let proxima: ResultadoVertical | null = null;
  // De la fila más pesada a la más ligera: la primera que cumple es la que se cita.
  for (const fila of [...filas].reverse()) {
    const celda = fila[e.columna];
    if (!celda) continue;
    for (const alt of celda) {
      if (alt.paren !== e.paren) continue;
      const dRAExigido = alt.dRA === null ? null : alt.dRA + extra;
      const condiciones = condicionesAlt(fila, alt, e);
      if (dRAExigido !== null) condiciones.unshift({ texto: `Trasdosado ΔRA ≥ ${dRAExigido} dBA${e.unaCara ? " (por una cara, + 4)" : ""}`, cumple: e.dRA !== null && e.dRA >= dRAExigido });
      const ok = condiciones.every((c) => c.cumple !== false);
      const r = { cumple: ok && flancosOk, fila, alt, dRAExigido, condiciones, flancos };
      if (ok) return r;
      proxima ??= r;
    }
  }
  return proxima ?? { cumple: false, fila: null, alt: null, dRAExigido: null, condiciones: [{ texto: `La tabla 3.2 no tiene ninguna fila de tipo ${e.tipo} con m ≤ ${fmt(e.m)} kg/m² y RA ≤ ${fmt(e.RA)} dBA${e.paren ? " entre paréntesis" : ""}`, cumple: false }], flancos };
}

// ── Tabla 3.3 ───────────────────────────────────────────────────────────────

export interface EntradaHorizontal {
  forjado: { m: number; RA: number; eps: boolean };
  columna: ColumnaHorizontal;
  /** Fila de la tabla: normal o entre paréntesis (recinto de actividad o instalaciones). */
  caso: "normal" | "paren";
  /** El ΔLw que se pide al suelo flotante: el de la fila normal, el de la de paréntesis o ninguno. */
  dLw: "normal" | "paren" | null;
  garaje: boolean;
  sueloDLw: number;
  sueloDRA: number;
  techoDRA: number;
}

export interface ResultadoHorizontal {
  cumple: boolean;
  fila: FilaHorizontal | null;
  celda: CeldaHorizontal | null;
  dLwExigido: number | null;
  comb: Combinacion | null;
  /** La combinación más próxima si ninguna se cumple: la de menor falta. */
  condiciones: Condicion[];
}

function falta(c: Combinacion, sf: number, ts: number): number {
  return Math.max(0, c.sf - sf) + Math.max(0, c.ts - ts);
}

export function comprobarHorizontal(e: EntradaHorizontal): ResultadoHorizontal {
  const H = HORIZONTALES_HR.datos;
  const filas = H.filas.filter((f) => f.m <= e.forjado.m && f.RA <= e.forjado.RA);
  let proxima: ResultadoHorizontal | null = null;
  for (const fila of [...filas].reverse()) {
    const celda = fila[e.caso][e.columna];
    if (!celda) continue;
    const celdaLw = e.dLw === "normal" ? fila.normal[e.columna] : e.dLw === "paren" ? fila.paren[e.columna] : null;
    if (e.dLw !== null && !celdaLw) continue;
    const dLwExigido = celdaLw ? celdaLw.dLw + (fila.eps && e.forjado.eps ? H.epsDLw : 0) : null;
    const validas = celda.combinaciones.filter((c) => !c.garaje || e.garaje);
    const cumpleLw = dLwExigido === null || e.sueloDLw >= dLwExigido;
    const comb = validas.find((c) => e.sueloDRA >= c.sf && e.techoDRA >= c.ts) ?? null;
    const cercana = comb ?? [...validas].sort((a, b) => falta(a, e.sueloDRA, e.techoDRA) - falta(b, e.sueloDRA, e.techoDRA))[0] ?? null;
    const condiciones: Condicion[] = [];
    if (dLwExigido !== null) condiciones.push({ texto: `Suelo flotante ΔLw ≥ ${dLwExigido} dB${fila.eps && e.forjado.eps ? " (EPS, + 4)" : ""}`, cumple: cumpleLw });
    if (cercana) condiciones.push({ texto: `Suelo flotante ΔRA ≥ ${cercana.sf} dBA y techo ΔRA ≥ ${cercana.ts} dBA${cercana.garaje ? " (solución de garaje)" : ""}`, cumple: !!comb });
    const r = { cumple: cumpleLw && !!comb, fila, celda, dLwExigido, comb: cercana, condiciones };
    if (r.cumple) return r;
    proxima ??= r;
  }
  return (
    proxima ?? {
      cumple: false,
      fila: null,
      celda: null,
      dLwExigido: null,
      comb: null,
      condiciones: [{ texto: `La tabla 3.3 no tiene solución para un forjado de ${fmt(e.forjado.m)} kg/m² y RA ${fmt(e.forjado.RA)} dBA con esta tabiquería${e.caso === "paren" ? ", entre paréntesis" : ""}`, cumple: false }],
    }
  );
}

/**
 * La columna de la tabla 3.3: la de la tabiquería del recinto receptor; con
 * entramado, 1H o 2H según la fachada (nota 6). Una fachada de dos hojas con
 * hoja interior de fábrica junto a tabiquería de entramado no está en la tabla:
 * se asimila a la de fábrica con apoyo directo, la más restrictiva (comentario
 * a la tabla 3.2, DccHR p. 22; criterio K-HR.25).
 */
export function columnaHorizontal(tab: TipoTabiqueria, f: FachadaFlanco): ColumnaHorizontal {
  if (tab === "apoyo") return "AD";
  if (tab === "bandas") return "BE";
  if (unaHojaDeFabrica(f)) return "ENT1H";
  if (f.clase === "dos_hojas" && f.interior === "fabrica") return "AD";
  return "ENT2H";
}

/** Las condiciones 1H/2H de la nota (6) de la tabla 3.3. */
export function flancosHorizontal(col: ColumnaHorizontal, tab: TipoTabiqueria, f: FachadaFlanco): Condicion[] {
  const F = FLANCOS_HR.datos;
  if (tab !== "entramado") return [];
  if (col === "AD") return [{ texto: "Tabiquería de entramado con fachada de hoja interior de fábrica: se asimila a fábrica con apoyo directo (criterio)", cumple: null }];
  if (col === "ENT1H") return [cumpleHoja("Fachada 1H, hoja de fábrica", f.principal, F.unaHoja)];
  if (f.clase === "dos_hojas") return [cumpleHoja("Fachada 2H, hoja exterior", f.principal, F.exteriorEntramado)];
  return [cumpleHoja("Fachada 2H, hoja interior de entramado", f.hojaInterior, F.interiorEntramado)];
}

/** La columna de la tabla 3.2: fábrica, salvo tabiquería de entramado con fachada de hoja interior de entramado o de una hoja (comentario a la tabla 3.2). */
export function columnaVertical(tab: TipoTabiqueria, f: FachadaFlanco): "fabrica" | "entramado" {
  if (tab !== "entramado") return "fabrica";
  return f.clase === "dos_hojas" && f.interior === "fabrica" ? "fabrica" : "entramado";
}

// ── Tabla I.1 (adosadas con la estructura horizontal compartida) ────────────

export interface ResultadoAdosada {
  cumple: boolean;
  fila: FilaAdosada | null;
  dLwExigido: number | null;
  dRAExigido: number | null;
}

export function comprobarAdosada(forjado: { m: number; RA: number; eps: boolean }, tipo: 1 | 2 | 3, sueloDLw: number, sueloDRA: number): ResultadoAdosada {
  const A = ADOSADAS_HR.datos;
  const filas = A.filas.filter((f) => f.m <= forjado.m && f.RA <= forjado.RA);
  let proxima: ResultadoAdosada | null = null;
  for (const fila of [...filas].reverse()) {
    const t = fila.porTipo[tipo];
    const dLwExigido = t.dLw + (fila.eps && forjado.eps ? A.epsDLw : 0);
    const r = { cumple: sueloDLw >= dLwExigido && sueloDRA >= t.dRA, fila, dLwExigido, dRAExigido: t.dRA };
    if (r.cumple) return r;
    proxima ??= r;
  }
  return proxima ?? { cumple: false, fila: null, dLwExigido: null, dRAExigido: null };
}

// ── Tabla 3.4 ───────────────────────────────────────────────────────────────

export interface ResultadoFachada {
  cumple: boolean;
  /** El nivel de la tabla que se usa (null: por encima de 51, opción general). */
  nivel: number | null;
  /** Lo que se pide a la parte ciega (con huecos, la de la fila; sin huecos, la de 100 %). */
  ciegaExigida: number | null;
  /** Lo que se pide al hueco (null sin huecos). */
  huecoExigido: number | null;
}

export function comprobarFachada(D: number, ciegaRAtr: number, huecoRAtr: number | null, pct: number): ResultadoFachada {
  const n = nivelFachada(D);
  if (!n) return { cumple: false, nivel: null, ciegaExigida: null, huecoExigido: null };
  if (pct <= 0 || huecoRAtr === null) return { cumple: ciegaRAtr >= n.ciega100, nivel: n.D, ciegaExigida: n.ciega100, huecoExigido: null };
  const ex = exigenciaHueco(n, ciegaRAtr, pct);
  if (!ex) return { cumple: false, nivel: n.D, ciegaExigida: n.filas[0][0], huecoExigido: n.filas[0][1 + tramoHuecos(pct)] };
  return { cumple: huecoRAtr >= ex.hueco, nivel: n.D, ciegaExigida: ex.fila === -1 ? null : ex.ciegaFila, huecoExigido: ex.hueco };
}
