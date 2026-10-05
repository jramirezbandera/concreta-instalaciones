// =============================================================================
// «Lo que se justifica» (feature-16 §B): las filas de La obra, por DB. PURO.
//
// Una fila por justificación, con su estado, su código, su título y las partes
// del edificio que entran, como piezas. Las piezas de las publicadas salen de
// su «Qué entra»; las de las que aún no existen son solo descriptivas (qué
// partes del edificio tocarán), sin cifras de normas que la herramienta aún no
// justifica. Las «pronto» de una misma familia se juntan en una fila.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import { resumenEdificio, type ResumenEdificio } from "../edificio/derivar";
import type { JustificacionKey, Proyecto } from "../proyecto/tipos";
import { evaluarExpediente, type EstadoObra, type EvaluacionJustificacion } from "./evaluar";

/** Una parte del edificio que entra: «6 viviendas», «garaje · bombeo». */
export interface PiezaObra {
  texto: string;
  /** Trato especial (previsión, bombeo, contención…): va en el color de acento. */
  acento: boolean;
}

export interface FilaObra {
  /** La clave, o `junta-<familia>` si junta varias «pronto». */
  id: string;
  claves: JustificacionKey[];
  estado: EstadoObra;
  codigo: string;
  titulo: string;
  piezas: PiezaObra[];
  /** Subruta del módulo (relativa al proyecto), si se puede abrir. */
  ruta?: string;
  /** Lo forzó el proyectista. */
  forzada: boolean;
  /** Párrafo del «no aplica», con su cita. */
  nota?: string;
  cita?: string;
  /** Externas: con qué se justifica y la referencia aportada. */
  destino?: string;
  refExterna?: string;
  /** La frase del módulo (para el `title` de la fila). */
  frase?: string;
}

export interface GrupoObra {
  /** Nombre del registry: «Salubridad (DB-HS)». */
  grupo: string;
  /** Rótulo: «Salubridad · DB HS». */
  rotulo: string;
  filas: FilaObra[];
}

/** «Salubridad (DB-HS)» → «Salubridad · DB HS». */
export function rotuloGrupo(grupo: string): string {
  const m = /^(.*?)\s*\((.*)\)\s*$/.exec(grupo);
  return m ? `${m[1]} · ${m[2].replace(/-/g, " ")}` : grupo;
}

// ── Piezas de las publicadas: su «Qué entra» ────────────────────────────────

/** Filas de «Qué entra» que son datos de partida, no partes del edificio. */
const NO_SON_PARTES = new Set(["zona", "envolvente", "acometida"]);
const SIN_PIEZA: Partial<Record<JustificacionKey, Set<string>>> = {
  hs5: new Set(["cubierta"]),
  // El terreno es un dato de partida de HS1, no una parte del edificio.
  hs1: new Set(["terreno"]),
};

function minuscula(s: string): string {
  return s.length === 0 ? s : s[0].toLowerCase() + s.slice(1);
}

function viviendas(n: number): string {
  return n === 1 ? "1 vivienda" : `${n} viviendas`;
}

/**
 * Las piezas de una justificación publicada, a partir de su «Qué entra»:
 *   - las viviendas, juntas: «6 viviendas»;
 *   - el trato se añade si es una palabra («bombeo», «previsión»), no una cifra;
 *   - lo que queda fuera solo se enseña si va a otra norma («local → RITE»).
 */
export function piezasDeQueEntra(key: JustificacionKey, filas: readonly FilaQueEntra[], r: ResumenEdificio): PiezaObra[] {
  const piezas: PiezaObra[] = [];
  const add = (p: PiezaObra) => {
    if (!piezas.some((x) => x.texto === p.texto)) piezas.push(p);
  };
  for (const f of filas) {
    if (NO_SON_PARTES.has(f.id) || SIN_PIEZA[key]?.has(f.id)) continue;
    if (f.estado === "out") {
      if (f.trato === "RITE") add({ texto: `${minuscula(f.titulo)} → RITE`, acento: true });
      continue;
    }
    const conTrato = f.trato !== "se calcula" && !/\d/.test(f.trato);
    if (/^viviendas?\b/i.test(f.titulo)) {
      add({ texto: viviendas(r.numViviendas) + (conTrato ? ` · ${f.trato}` : ""), acento: conTrato });
      continue;
    }
    add({ texto: minuscula(f.titulo) + (conTrato ? ` · ${f.trato}` : ""), acento: conTrato });
  }
  return piezas;
}

// ── Piezas de las que aún no existen: solo partes del edificio ──────────────

function piezasPronto(claves: readonly JustificacionKey[], r: ResumenEdificio): PiezaObra[] {
  const p = (texto: string): PiezaObra => ({ texto, acento: false });
  const con = (cond: boolean, texto: string) => (cond ? [p(texto)] : []);
  const k = claves[0];
  if (k === "hs1") {
    return [...con(r.plantasBajoRasante > 0, "muros de sótano"), ...con(r.plantasBajoRasante === 0, "suelos"), p("fachadas"), p("cubierta")];
  }
  if (k === "hs2") return [...con(r.tieneViviendas, viviendas(r.numViviendas)), ...con(r.tieneLocales, "local")];
  if (k.startsWith("si")) {
    return [...con(r.tieneViviendas, "viviendas"), ...con(r.tieneLocales, "local"), ...con(r.tieneOficinas, "oficinas"), ...con(r.tieneGaraje, "garaje")];
  }
  if (k.startsWith("sua")) {
    const plantas = r.plantasSobreRasante + r.plantasBajoRasante;
    return [...con(plantas > 1, "escaleras"), ...con(r.tieneGaraje, "garaje"), ...con(!r.esUnifamiliar, "itinerario accesible")];
  }
  if (k === "he4" || k === "he5") {
    return [...con(r.tieneViviendas, viviendas(r.numViviendas)), ...con(r.tieneLocales, "local"), ...con(r.tieneOficinas, "oficinas")];
  }
  return [];
}

// ── Las «pronto» que se juntan ─────────────────────────────────────────────

interface Junta {
  familia: string;
  claves: JustificacionKey[];
  /** Código de la fila; de título, los códigos de las que entran. */
  codigo: string;
  /** Código y título cuando entran todas. */
  todas?: { codigo: string; titulo: string };
}

const JUNTAS: Junta[] = [
  {
    familia: "si",
    claves: ["si1", "si2", "si3", "si4", "si5", "si6"],
    codigo: "SI",
    todas: { codigo: "SI1–6", titulo: "Seis apartados" },
  },
  { familia: "sua", claves: ["sua1", "sua2", "sua3", "sua4", "sua5", "sua6", "sua7", "sua8", "sua9"], codigo: "SUA" },
  { familia: "he45", claves: ["he4", "he5"], codigo: "HE", todas: { codigo: "HE4·5", titulo: "ACS y fotovoltaica" } },
];

function juntaDe(key: JustificacionKey): Junta | undefined {
  return JUNTAS.find((j) => j.claves.includes(key));
}

// ── Filas ──────────────────────────────────────────────────────────────────

function filaDe(ev: EvaluacionJustificacion, p: Proyecto, r: ResumenEdificio): FilaObra {
  const e = ev.entrada;
  const fila: FilaObra = {
    id: ev.key,
    claves: [ev.key],
    estado: ev.estado,
    codigo: e.codigo,
    titulo: e.label,
    piezas: [],
    forzada: ev.forzada,
    ...(ev.nota !== undefined ? { nota: ev.nota } : {}),
    ...(ev.cita !== undefined ? { cita: ev.cita } : {}),
  };
  switch (ev.estado) {
    case "no_aplica":
      fila.piezas = [{ texto: "párrafo redactado", acento: false }];
      break;
    case "externo": {
      const ref = p.justificaciones[ev.key]?.refExterna;
      fila.destino = e.externo?.destino ?? "otra herramienta";
      if (ref) fila.refExterna = ref;
      fila.piezas = [{ texto: `${fila.destino} · ${ref ?? "adjuntar documento"}`, acento: true }];
      break;
    }
    case "pronto":
      fila.piezas = piezasPronto([ev.key], r);
      break;
    case "sin_datos":
      fila.piezas = [{ texto: "nada de El edificio entra", acento: false }];
      break;
    case "error":
      fila.piezas = [{ texto: "no se puede calcular", acento: false }];
      break;
    default:
      fila.piezas = ev.calculado ? (ev.calculado.piezas ?? piezasDeQueEntra(ev.key, ev.calculado.queEntra, r)) : [];
      if (ev.calculado) fila.frase = ev.calculado.frase;
  }
  if (e.shipped && e.route && ev.estado !== "no_aplica" && ev.estado !== "externo") fila.ruta = e.route;
  return fila;
}

/** Las filas de La obra, agrupadas por DB, en el orden del registry. */
export function filasObra(p: Proyecto): GrupoObra[] {
  const r = resumenEdificio(p.edificio);
  const evs = evaluarExpediente(p).justificaciones;
  const grupos: GrupoObra[] = [];
  const hechas = new Set<JustificacionKey>();

  for (const ev of evs) {
    if (hechas.has(ev.key)) continue;
    let g = grupos.find((x) => x.grupo === ev.entrada.grupo);
    if (!g) {
      g = { grupo: ev.entrada.grupo, rotulo: rotuloGrupo(ev.entrada.grupo), filas: [] };
      grupos.push(g);
    }

    // Las «pronto» de la misma familia, juntas, donde aparece la primera.
    const junta = ev.estado === "pronto" && !ev.forzada ? juntaDe(ev.key) : undefined;
    const miembros = junta
      ? evs.filter((x) => junta.claves.includes(x.key) && x.estado === "pronto" && !x.forzada)
      : [];
    if (junta && miembros.length > 1) {
      const todas = miembros.length === junta.claves.length ? junta.todas : undefined;
      const claves = miembros.map((m) => m.key);
      g.filas.push({
        id: `junta-${junta.familia}`,
        claves,
        estado: "pronto",
        codigo: todas?.codigo ?? junta.codigo,
        titulo: todas?.titulo ?? miembros.map((m) => m.entrada.codigo).join(" · "),
        piezas: piezasPronto(claves, r),
        forzada: false,
      });
      for (const k of claves) hechas.add(k);
      continue;
    }

    g.filas.push(filaDe(ev, p, r));
    hechas.add(ev.key);
  }
  return grupos;
}

// ── Recuento ───────────────────────────────────────────────────────────────

export type RecuentoObra = Record<EstadoObra, number>;

/** Cuántas justificaciones hay en cada estado (una a una, no por filas). */
export function recuentoObra(p: Proyecto): RecuentoObra {
  const r: RecuentoObra = {
    cumple: 0, revisar: 0, no_cumple: 0, sin_datos: 0, error: 0, no_aplica: 0, externo: 0, pronto: 0,
  };
  for (const ev of evaluarExpediente(p).justificaciones) r[ev.estado]++;
  return r;
}

const ROTULO_RECUENTO: [EstadoObra, string][] = [
  ["cumple", "cumple"],
  ["revisar", "por revisar"],
  ["no_cumple", "no cumple"],
  ["sin_datos", "sin datos"],
  ["error", "sin calcular"],
  ["no_aplica", "no aplica"],
  ["externo", "externo"],
  ["pronto", "pronto"],
];

/** «1 cumple · 3 por revisar · 1 no cumple · 1 no aplica · 2 externo · 15 pronto». */
export function textoRecuento(r: RecuentoObra): string {
  return ROTULO_RECUENTO.filter(([k]) => r[k] > 0)
    .map(([k, t]) => `${r[k]} ${t}`)
    .join(" · ");
}
