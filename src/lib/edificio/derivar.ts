// =============================================================================
// Derivaciones de El edificio (feature-12, REDISENO-V4 §3.1). Funciones PURAS:
// sin React/DOM, sin Date.now ni Math.random. Mismo edificio → mismo resultado.
//
// Lo que antes se tecleaba en los datos generales (plantas, viviendas, garaje,
// local en PB…) sale de aquí. Los niveles se calculan SIEMPRE desde el orden de
// los grupos y sus repeticiones (`renumerar`), así que un `nivelInicial`
// incoherente en un archivo importado no descuadra ninguna derivación.
// =============================================================================

import type { Edificio, GrupoPlantas, TipoCubierta, UsoZona, Zona } from "./tipos";
import { USOS } from "./usos";

// -----------------------------------------------------------------------------
// Niveles y nombres
// -----------------------------------------------------------------------------

/** Entero ≥ 1 saneado (no finito o menor → 1). */
function repeticionesDe(g: GrupoPlantas): number {
  return Number.isFinite(g.repeticiones) ? Math.max(1, Math.trunc(g.repeticiones)) : 1;
}

/** Altura válida de planta [m]; lo no válido cuenta como 0 en las cotas (y se avisa). */
function alturaDe(g: GrupoPlantas): number {
  return Number.isFinite(g.altura_m) && g.altura_m > 0 ? g.altura_m : 0;
}

/** Redondeo a centímetros: los residuos flotantes de sumar 3,30 no llegan a la UI. */
function cm(v: number): number {
  return Math.round(v * 100) / 100;
}

/** ¿El grupo está bajo rasante? Lo decide el signo de su `nivelInicial`. */
export function esBajoRasante(g: GrupoPlantas): boolean {
  return g.nivelInicial < 0;
}

/**
 * Recalcula `nivelInicial` de cada grupo a partir del orden (de arriba abajo) y
 * las repeticiones. Los grupos sobre rasante van primero y los sótanos después
 * (orden estable dentro de cada clase); la planta más baja sobre rasante es la
 * PB (nivel 0) y el primer sótano empieza en -1. Devuelve un edificio nuevo.
 */
export function renumerar(e: Edificio): Edificio {
  const sobre = e.grupos.filter((g) => !esBajoRasante(g));
  const bajo = e.grupos.filter(esBajoRasante);
  const nivelDe = new Map<GrupoPlantas, number>();
  let acc = 0;
  for (let i = sobre.length - 1; i >= 0; i--) {
    nivelDe.set(sobre[i], acc);
    acc += repeticionesDe(sobre[i]);
  }
  acc = 0;
  for (const g of bajo) {
    acc -= repeticionesDe(g);
    nivelDe.set(g, acc);
  }
  return {
    ...e,
    grupos: [...sobre, ...bajo].map((g) => ({ ...g, nivelInicial: nivelDe.get(g) ?? 0 })),
  };
}

/** PB, P1, P2… ; S1, S2… */
export function etiquetaNivel(nivel: number): string {
  if (nivel === 0) return "PB";
  return nivel > 0 ? `P${nivel}` : `S${-nivel}`;
}

function nombreLargoNivel(nivel: number): string {
  if (nivel === 0) return "Planta baja";
  return nivel > 0 ? `Planta ${nivel}` : `Sótano ${-nivel}`;
}

/**
 * Nombre de un grupo (ya renumerado): corto para la sección («P1–P3», «PB»,
 * «S1–S2») y largo para leer («Plantas 1 a 3», «Sótanos 1 y 2»).
 */
export function nombreGrupo(g: GrupoPlantas): { corto: string; largo: string } {
  const n = repeticionesDe(g);
  if (n === 1) {
    return { corto: etiquetaNivel(g.nivelInicial), largo: nombreLargoNivel(g.nivelInicial) };
  }
  const bajo = esBajoRasante(g);
  // Sótanos: de arriba abajo (S1–S2). Sobre rasante: de abajo arriba (P1–P3).
  const a = bajo ? g.nivelInicial + n - 1 : g.nivelInicial;
  const b = bajo ? g.nivelInicial : g.nivelInicial + n - 1;
  const corto = `${etiquetaNivel(a)}–${etiquetaNivel(b)}`;
  const y = n === 2 ? " y " : " a ";
  if (bajo) return { corto, largo: `Sótanos ${-a}${y}${-b}` };
  if (a === 0) return { corto, largo: `Planta baja${y}planta ${b}` };
  return { corto, largo: `Plantas ${a}${y}${b}` };
}

// -----------------------------------------------------------------------------
// Plantas físicas
// -----------------------------------------------------------------------------

/** Una planta concreta del edificio desplegado. */
export interface PlantaFisica {
  nivel: number;
  /** PB, P1, S1… */
  etiqueta: string;
  grupoId: string;
  /** Cota del suelo respecto a la rasante [m] (PB = 0). */
  cota_m: number;
  altura_m: number;
  zonas: Zona[];
}

/**
 * El edificio desplegado en plantas físicas, de ARRIBA abajo. Cotas: el suelo de
 * la PB es ±0,00; cada planta sobre rasante suma la altura de la de debajo; cada
 * sótano resta la suya.
 */
export function plantasDe(e: Edificio): PlantaFisica[] {
  const r = renumerar(e);
  const plantas: Omit<PlantaFisica, "cota_m">[] = [];
  for (const g of r.grupos) {
    const n = repeticionesDe(g);
    for (let k = n - 1; k >= 0; k--) {
      const nivel = g.nivelInicial + k;
      plantas.push({
        nivel,
        etiqueta: etiquetaNivel(nivel),
        grupoId: g.id,
        altura_m: alturaDe(g),
        zonas: g.zonas,
      });
    }
  }
  plantas.sort((a, b) => b.nivel - a.nivel);

  const cota = new Map<number, number>([[0, 0]]);
  const sobre = plantas.filter((p) => p.nivel >= 0).sort((a, b) => a.nivel - b.nivel);
  for (let i = 1; i < sobre.length; i++) {
    cota.set(sobre[i].nivel, cm((cota.get(sobre[i - 1].nivel) ?? 0) + sobre[i - 1].altura_m));
  }
  let acc = 0;
  for (const p of plantas.filter((x) => x.nivel < 0)) {
    acc += p.altura_m;
    cota.set(p.nivel, cm(-acc));
  }
  return plantas.map((p) => ({ ...p, cota_m: cota.get(p.nivel) ?? 0 }));
}

/** Cota del suelo de la planta más alta de un grupo y de la más baja [m]. */
export function cotasGrupo(e: Edificio, grupoId: string): { baja: number; alta: number } | null {
  const ps = plantasDe(e).filter((p) => p.grupoId === grupoId);
  if (ps.length === 0) return null;
  return { baja: ps[ps.length - 1].cota_m, alta: ps[0].cota_m };
}

/** Cota con signo en notación de plano: «±0,00», «+3,00», «−3,00». */
export function formatoCota(v: number): string {
  if (Math.abs(v) < 0.005) return "±0,00";
  const txt = Math.abs(v).toFixed(2).replace(".", ",");
  return (v > 0 ? "+" : "−") + txt;
}

// -----------------------------------------------------------------------------
// Resumen
// -----------------------------------------------------------------------------

/** Tipo de edificio, para el uso que hasta la v1 se tecleaba. */
export type TipoEdificio = "unifamiliar" | "plurifamiliar" | "oficinas" | "otro";

export interface ResumenEdificio {
  tipo: TipoEdificio;
  plantasSobreRasante: number;
  plantasBajoRasante: number;
  numViviendas: number;
  tieneViviendas: boolean;
  esUnifamiliar: boolean;
  /** Garaje o garaje privado. */
  tieneGaraje: boolean;
  tieneTrasteros: boolean;
  /** Local sin uso en cualquier planta. */
  tieneLocales: boolean;
  /** Local sin uso en la planta baja. */
  tieneLocalPB: boolean;
  tieneOficinas: boolean;
  tipoCubierta: TipoCubierta;
  cubiertaTransitable: boolean;
  /**
   * Cota del suelo de la última planta sobre rasante [m] (evacuación descendente),
   * sin contar las plantas más altas que solo tienen zonas de ocupación nula.
   */
  alturaEvacuacion_m: number;
  /** Superficie útil por uso [m²] (zona × repeticiones). Solo se muestra. */
  superficiePorUso: Partial<Record<UsoZona, number>>;
  superficieUtilTotal_m2: number;
}

/** Cantidad saneada (entero ≥ 0). */
function cantidad(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

/** Viviendas que aloja una zona «viviendas», en cada planta del grupo. */
export function viviendasEnZona(e: Edificio, z: Zona): number {
  if (z.uso !== "viviendas") return 0;
  const tiposVivienda = new Set(e.unidades.filter((u) => u.clase === "vivienda").map((u) => u.id));
  return (z.unidades ?? [])
    .filter((u) => tiposVivienda.has(u.tipoId))
    .reduce((a, u) => a + cantidad(u.cantidad), 0);
}

/**
 * ¿Zona de ocupación nula? Los cuartos de instalaciones siempre; los trasteros,
 * solo en edificios de viviendas. DB-SI (consolidado 4-mar-2025), Anejo SI A,
 * «Zona de ocupación nula»: «…salas de máquinas y cuartos de instalaciones, […]
 * trasteros de viviendas, etc.» (verificado en feature-13).
 */
function esOcupacionNula(uso: UsoZona, conViviendas: boolean): boolean {
  return uso === "instalaciones" || (uso === "trasteros" && conViviendas);
}

export function resumenEdificio(e: Edificio): ResumenEdificio {
  const r = renumerar(e);
  let plantasSobreRasante = 0;
  let plantasBajoRasante = 0;
  let numViviendas = 0;
  const superficiePorUso: Partial<Record<UsoZona, number>> = {};
  const usos = new Set<UsoZona>();
  let tieneLocalPB = false;

  for (const g of r.grupos) {
    const n = repeticionesDe(g);
    if (esBajoRasante(g)) plantasBajoRasante += n;
    else plantasSobreRasante += n;
    for (const z of g.zonas) {
      usos.add(z.uso);
      const sup = Number.isFinite(z.superficieUtil_m2) ? Math.max(0, z.superficieUtil_m2) : 0;
      superficiePorUso[z.uso] = cm((superficiePorUso[z.uso] ?? 0) + sup * n);
      numViviendas += viviendasEnZona(r, z) * n;
      // La PB es el nivel 0: un grupo que empieza en la PB la contiene.
      if (z.uso === "local_sin_uso" && g.nivelInicial === 0) tieneLocalPB = true;
    }
  }

  const esUnifamiliar = usos.has("vivienda_unifamiliar");
  if (esUnifamiliar) numViviendas += 1;
  const tieneViviendas = numViviendas > 0 || usos.has("viviendas");
  const tieneOficinas = usos.has("oficinas");
  const tipo: TipoEdificio = esUnifamiliar
    ? "unifamiliar"
    : tieneViviendas
      ? "plurifamiliar"
      : tieneOficinas
        ? "oficinas"
        : "otro";

  // DB-SI, Anejo SI A, «Altura de evacuación»: «no se consideran las plantas más
  // altas del edificio en las que únicamente existan zonas de ocupación nula».
  // Solo las MÁS ALTAS: una planta intermedia de instalaciones sí cuenta.
  const sobre = plantasDe(r).filter((p) => p.nivel >= 0); // de arriba abajo
  const ultima = sobre.find(
    (p) => p.zonas.length === 0 || !p.zonas.every((z) => esOcupacionNula(z.uso, tieneViviendas)),
  );
  const alturaEvacuacion_m = Math.max(0, ultima?.cota_m ?? 0);

  return {
    tipo,
    plantasSobreRasante,
    plantasBajoRasante,
    numViviendas,
    tieneViviendas,
    esUnifamiliar,
    tieneGaraje: usos.has("garaje") || usos.has("garaje_privado"),
    tieneTrasteros: usos.has("trasteros"),
    tieneLocales: usos.has("local_sin_uso"),
    tieneLocalPB,
    tieneOficinas,
    tipoCubierta: r.cubierta.tipo,
    cubiertaTransitable: r.cubierta.tipo === "plana_transitable",
    alturaEvacuacion_m: cm(alturaEvacuacion_m),
    superficiePorUso,
    superficieUtilTotal_m2: cm(Object.values(superficiePorUso).reduce((a, v) => a + (v ?? 0), 0)),
  };
}

/** «Vivienda plurifamiliar con locales», «Oficinas»… (portada del anejo, Inicio). */
export function etiquetaEdificio(r: ResumenEdificio): string {
  const con = [r.tieneLocales ? "locales" : null, r.tieneOficinas && r.tieneViviendas ? "oficinas" : null]
    .filter((x): x is string => x !== null)
    .join(" y ");
  switch (r.tipo) {
    case "unifamiliar":
      return "Vivienda unifamiliar";
    case "plurifamiliar":
      return con ? `Vivienda plurifamiliar con ${con}` : "Vivienda plurifamiliar";
    case "oficinas":
      return r.tieneLocales ? "Oficinas con locales" : "Oficinas";
    case "otro":
      return "Edificio sin viviendas ni oficinas";
  }
}

function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

/**
 * De dónde sale el edificio, para la portada del anejo (feature-13): las zonas
 * leídas del cuadro de superficies llevan su documento; las demás las tecleó el
 * proyectista. «Cuadro de superficies «cuadro.pdf» leído con IA y revisado por
 * el proyectista (7 de 9 zonas)».
 */
export function procedenciaEdificio(e: Edificio): string {
  const zonas = e.grupos.flatMap((g) => g.zonas);
  const leidas = zonas.filter((z) => z.origen);
  if (leidas.length === 0) return "Introducido por el proyectista en El edificio";
  const documentos = [...new Set(leidas.map((z) => `«${z.origen!.documento}»`))];
  const cuantas = leidas.length === zonas.length ? "" : ` (${leidas.length} de ${zonas.length} zonas)`;
  return `${documentos.length > 1 ? "Cuadros de superficies" : "Cuadro de superficies"} ${documentos.join(", ")} leído con IA y revisado por el proyectista${cuantas}`;
}

/**
 * Una frase que resume el edificio, para la cabecera de El edificio:
 * «4 plantas sobre rasante y 1 sótano · 6 viviendas de 2 tipos · local sin uso
 * en planta baja · garaje de 14 plazas.»
 */
export function fraseEdificio(e: Edificio): string {
  const r = renumerar(e);
  const res = resumenEdificio(r);
  const partes: string[] = [
    plural(res.plantasSobreRasante, "planta", "plantas") +
      " sobre rasante" +
      (res.plantasBajoRasante > 0
        ? ` y ${plural(res.plantasBajoRasante, "sótano", "sótanos")}`
        : ""),
  ];
  if (res.esUnifamiliar) partes.push("una vivienda unifamiliar");
  else if (res.numViviendas > 0) {
    const tiposUsados = new Set<string>();
    for (const g of r.grupos)
      for (const z of g.zonas)
        if (z.uso === "viviendas")
          for (const u of z.unidades ?? []) if (cantidad(u.cantidad) > 0) tiposUsados.add(u.tipoId);
    partes.push(
      plural(res.numViviendas, "vivienda", "viviendas") +
        (tiposUsados.size > 1 ? ` de ${tiposUsados.size} tipos` : ""),
    );
  }
  for (const g of r.grupos) {
    for (const z of g.zonas) {
      const n = repeticionesDe(g);
      if (z.uso === "local_sin_uso") {
        partes.push(`local sin uso en ${nombreGrupo(g).largo.toLowerCase()}`);
      } else if (z.uso === "oficinas") {
        partes.push(`${Math.round(z.superficieUtil_m2 * n)} m² de oficinas`);
      } else if (z.uso === "garaje" && z.plazas !== undefined) {
        partes.push(`garaje de ${plural(cantidad(z.plazas), "plaza", "plazas")}`);
      }
    }
  }
  return partes.join(" · ") + ".";
}

// -----------------------------------------------------------------------------
// Terreno y vecindad
// -----------------------------------------------------------------------------

/**
 * Niveles en contacto con el terreno: todos los sótanos y, si no hay sótanos,
 * la planta baja (sobre solera).
 */
export function nivelesContactoTerreno(e: Edificio): number[] {
  const plantas = plantasDe(e);
  const bajo = plantas.filter((p) => p.nivel < 0).map((p) => p.nivel);
  return bajo.length > 0 ? bajo : plantas.some((p) => p.nivel === 0) ? [0] : [];
}

/** ¿Alguna planta del grupo toca el terreno? */
export function grupoTocaTerreno(e: Edificio, grupoId: string): boolean {
  const niveles = new Set(nivelesContactoTerreno(e));
  return plantasDe(e).some((p) => p.grupoId === grupoId && niveles.has(p.nivel));
}

export interface Vecina {
  /** PB, P1… o «Cubierta» / «Terreno». */
  etiqueta: string;
  usos: UsoZona[];
}

/**
 * Qué hay encima y debajo de un grupo: la planta inmediatamente superior a la
 * más alta del grupo y la inmediatamente inferior a la más baja. Encima de la
 * última planta está la cubierta; debajo de la más baja, el terreno. La frontera
 * de la envolvente la decide HE1 (fase 5) con esto.
 */
export function vecinasDe(e: Edificio, grupoId: string): { encima: Vecina; debajo: Vecina } | null {
  const plantas = plantasDe(e);
  const propias = plantas.filter((p) => p.grupoId === grupoId);
  if (propias.length === 0) return null;
  const alta = propias[0].nivel;
  const baja = propias[propias.length - 1].nivel;
  const arriba = plantas.find((p) => p.nivel === alta + 1);
  const abajo = plantas.find((p) => p.nivel === baja - 1);
  const usosDe = (p: PlantaFisica) => [...new Set(p.zonas.map((z) => z.uso))];
  return {
    encima: arriba ? { etiqueta: arriba.etiqueta, usos: usosDe(arriba) } : { etiqueta: "Cubierta", usos: [] },
    debajo: abajo ? { etiqueta: abajo.etiqueta, usos: usosDe(abajo) } : { etiqueta: "Terreno", usos: [] },
  };
}

// -----------------------------------------------------------------------------
// Validación: avisos «por revisar» (no bloquean el guardado)
// -----------------------------------------------------------------------------

export function validarEdificio(e: Edificio): string[] {
  const r = renumerar(e);
  const avisos: string[] = [];
  const res = resumenEdificio(r);
  const tipos = new Map(r.unidades.map((u) => [u.id, u]));

  if (res.plantasSobreRasante === 0) {
    avisos.push("Falta la planta baja: el edificio necesita al menos una planta sobre rasante.");
  }
  if (res.esUnifamiliar && r.grupos.some((g) => g.zonas.some((z) => z.uso === "viviendas"))) {
    avisos.push(
      "Una vivienda unifamiliar no comparte edificio con otras viviendas: usa «Viviendas» en todas las zonas o «Vivienda unifamiliar» en todas.",
    );
  }
  if (res.esUnifamiliar && !r.unidades.some((u) => u.clase === "vivienda")) {
    avisos.push("Define la vivienda tipo de la unifamiliar: de ella salen las redes de HS3, HS4 y HS5.");
  }

  for (const g of r.grupos) {
    const nombre = nombreGrupo(g).corto;
    if (!(Number.isFinite(g.altura_m) && g.altura_m >= 2 && g.altura_m <= 10)) {
      avisos.push(`${nombre}: la altura de planta debe estar entre 2 y 10 m.`);
    }
    for (const z of g.zonas) {
      const etiqueta = USOS[z.uso].etiqueta;
      if (!(Number.isFinite(z.superficieUtil_m2) && z.superficieUtil_m2 > 0)) {
        avisos.push(`${nombre}: la zona «${etiqueta}» no tiene superficie útil.`);
      }
      if (z.uso === "viviendas") {
        const n = viviendasEnZona(r, z);
        if (n === 0) {
          avisos.push(`${nombre}: la zona de viviendas no tiene viviendas asignadas.`);
        } else {
          const suma = (z.unidades ?? []).reduce((a, u) => {
            const t = tipos.get(u.tipoId);
            return t?.clase === "vivienda" ? a + t.superficieUtil_m2 * cantidad(u.cantidad) : a;
          }, 0);
          if (suma > z.superficieUtil_m2 + 0.5) {
            avisos.push(
              `${nombre}: las viviendas suman ${Math.round(suma)} m² útiles y la zona tiene ${Math.round(z.superficieUtil_m2)} m².`,
            );
          }
        }
      }
      if (z.uso === "garaje" && cantidad(z.plazas ?? 0) === 0) {
        avisos.push(`${nombre}: el garaje no tiene plazas.`);
      }
    }
  }
  return avisos;
}
