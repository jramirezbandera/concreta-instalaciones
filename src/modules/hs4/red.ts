// =============================================================================
// DB-HS4 — La red de suministro deducida de El edificio (feature-15, HS4).
//
// Función PURA y DETERMINISTA: del edificio y de las decisiones del proyectista
// sale la red de agua fría (el `HS4Inputs` de siempre, que dimensiona `calcHS4`)
// y lo que no es red: las unidades de consumo con su contador, los locales sin
// uso (previstos) y si hay zonas comunes. Ids y nombres estables, derivados de
// la posición (tipo · planta · instancia).
//
// Criterios de proyecto (no normativos, declarados en la memoria):
//   - una UNIDAD DE CONSUMO por vivienda y por planta de oficinas, con su
//     contador; el local sin uso, con contador previsto y sin aparatos;
//   - contadores en BATERÍA en la planta baja (lo habitual con más de una
//     unidad): un montante por unidad desde la batería hasta su planta; o POR
//     PLANTA: un montante general con los contadores en cada planta; la
//     unifamiliar, con contador general;
//   - la batería y la acometida, a la cota de la planta baja; cada punto de
//     consumo, 1 m sobre el suelo de su planta;
//   - longitudes horizontales tipo (`LONGITUDES_M`), editables con «Ajustar a
//     mano»;
//   - en la unifamiliar, los cuartos húmedos en las plantas que dice El edificio
//     o, si no lo dice, los baños en la más alta y la cocina y el aseo en la más
//     baja (`repartoUnifamiliar`, el mismo que HS5; el supuesto se avisa);
//   - los grifos de baldeo de los garajes cuelgan de la vivienda en la
//     unifamiliar y, si no, del contador de servicios comunes.
// Las composiciones de aparatos salen de `PRESETS_APARATOS` (Tabla 2.1, sin
// agrupados); los caudales, Ø y presiones los pone el motor.
// =============================================================================

import { PRESETS_APARATOS } from "../../data/presetsAparatos";
import { etiquetaNivel, plantasDe, resumenEdificio } from "../../lib/edificio/derivar";
import { repartirCuartos, repartoUnifamiliar, textoReparto } from "../../lib/edificio/reparto";
import type { Edificio, NucleoAseos, ViviendaTipo } from "../../lib/edificio/tipos";
import type { AparatoInputHS4, TramoInputHS4 } from "./calc";
import type { MaterialTuberia, TipoAparatoHS4 } from "./tablas";

// -----------------------------------------------------------------------------
// Decisiones
// -----------------------------------------------------------------------------

export type Contadores = "bateria" | "por_planta";
export type Tuberia = "multicapa" | "pex" | "cobre";
export type AguaCaliente = "individual" | "central";
/** «habitual»: lo que se haría sin pensarlo, según el edificio. */
export type Opcion<T> = T | "habitual";

/** Las decisiones tal y como se guardan (con «habitual»). */
export interface DecisionesHs4 {
  contadores: Opcion<Contadores>;
  tuberia: Opcion<Tuberia>;
  aguaCaliente: Opcion<AguaCaliente>;
  /** Grupo de presión: se añade desde el aviso de falta de presión. */
  grupoPresion: boolean;
  /** Presión a la salida del grupo [kPa]. */
  presionGrupo_kPa: number;
}

/** Las decisiones resueltas para este edificio. */
export interface DecisionesEfectivasHs4 {
  contadores: Contadores;
  tuberia: Tuberia;
  aguaCaliente: AguaCaliente;
  grupoPresion: boolean;
  presionGrupo_kPa: number;
}

/** Presión a la salida del grupo cuando se añade (criterio de proyecto). */
export const PRESION_GRUPO_POR_DEFECTO_kPa = 300;

export const DECISIONES_HS4_POR_DEFECTO: DecisionesHs4 = {
  contadores: "habitual",
  tuberia: "habitual",
  aguaCaliente: "habitual",
  grupoPresion: false,
  presionGrupo_kPa: PRESION_GRUPO_POR_DEFECTO_kPa,
};

/** Lo habitual: batería de contadores, tubería multicapa y ACS individual. */
export function decisionesHabitualesHs4(): Pick<DecisionesEfectivasHs4, "contadores" | "tuberia" | "aguaCaliente"> {
  return { contadores: "bateria", tuberia: "multicapa", aguaCaliente: "individual" };
}

export function resolverDecisionesHs4(d: DecisionesHs4): DecisionesEfectivasHs4 {
  const h = decisionesHabitualesHs4();
  const pg = d.presionGrupo_kPa;
  return {
    contadores: d.contadores === "habitual" ? h.contadores : d.contadores,
    tuberia: d.tuberia === "habitual" ? h.tuberia : d.tuberia,
    aguaCaliente: d.aguaCaliente === "habitual" ? h.aguaCaliente : d.aguaCaliente,
    grupoPresion: d.grupoPresion === true,
    presionGrupo_kPa: Number.isFinite(pg) && pg > 0 ? pg : PRESION_GRUPO_POR_DEFECTO_kPa,
  };
}

/** Material del motor según la tubería: el PE-X y el multicapa, plásticos; el cobre, metálico. */
export function materialDe(t: Tuberia): MaterialTuberia {
  return t === "cobre" ? "metalica" : "termoplastico_multicapa";
}

export const NOMBRE_TUBERIA: Record<Tuberia, string> = {
  multicapa: "multicapa",
  pex: "PE-X",
  cobre: "cobre",
};

// -----------------------------------------------------------------------------
// Criterios geométricos (no normativos; editables con «Ajustar a mano»)
// -----------------------------------------------------------------------------

/** Altura del punto de consumo sobre el suelo de su planta [m]. */
export const ALTURA_PUNTO_CONSUMO_M = 1;

export const LONGITUDES_M = {
  /** De la red de la calle a la llave de registro. */
  acometida: 3,
  /** De la llave de registro a la batería (o al contador general). */
  tuboAlimentacion: 5,
  /** Recorrido horizontal de cada montante, de la batería al patinillo. */
  montanteHorizontal: 3,
  /** De la planta a los cuartos húmedos de la unidad. */
  derivacionParticular: 4,
  /** Dentro del cuarto húmedo. */
  cuarto: 3,
  /** Al aparato. */
  derivacionAparato: 1.5,
} as const;

// -----------------------------------------------------------------------------
// Forma de la red
// -----------------------------------------------------------------------------

export type ClaseCuartoHs4 = "bano" | "aseo" | "cocina" | "aseos" | "garaje";

export interface CuartoHs4 {
  clase: ClaseCuartoHs4;
  /** «Baño», «Baño 2», «Aseo», «Cocina», «Aseos», «Garaje». */
  etiqueta: string;
  slug: string;
  aparatos: TipoAparatoHS4[];
}

/**
 * Una unidad de consumo con su contador: una vivienda, una planta de oficinas o
 * los servicios comunes (los grifos del garaje de un edificio de varias unidades).
 */
export interface UnidadHs4 {
  /** «a-p3», «a-p3-2», «u», «of-p1», «comunes». */
  id: string;
  /** Id del tipo en El edificio («A», «N»…); en oficinas, el del primer núcleo; «comunes». */
  tipoId: string;
  /** «A3», «B1», «Vivienda», «Oficinas P1», «Servicios comunes». */
  nombre: string;
  /** Nombre del tipo («A»), para agrupar. */
  nombreTipo: string;
  clase: "vivienda" | "oficinas" | "comunes";
  /** Planta del contador / de la derivación particular. */
  nivel: number;
  /** Cuartos húmedos por planta (la unifamiliar los reparte). */
  cuartos: { nivel: number; cuartos: CuartoHs4[] }[];
  /** Tramo que arranca en la batería (o en el montante general) hacia la unidad. */
  montanteId: string | null;
  derivacionId: string;
  /** Ids de sus aparatos. */
  aparatoIds: string[];
  numAparatos: number;
}

/** Dónde está cada punto de consumo de la red generada. */
export interface PuntoRedHs4 {
  unidadId: string;
  nivel: number;
  /** «Baño 2», «Cocina», «Aseos». */
  cuarto: string;
}

export interface LocalHs4 {
  id: string;
  nivel: number;
  numero: number;
  superficie_m2: number;
}

export interface RedHs4 {
  decisiones: DecisionesEfectivasHs4;
  /** Red de agua fría que dimensiona `calcHS4` (sin la presión: la pone la justificación). */
  tramos: TramoInputHS4[];
  aparatos: AparatoInputHS4[];
  unidades: UnidadHs4[];
  /** Por id de aparato: su unidad, su planta y su cuarto. */
  puntos: Record<string, PuntoRedHs4>;
  locales: LocalHs4[];
  /** Cota de cada nivel con unidades [m]. */
  cotas: Map<number, number>;
  /** Contadores de la batería (o de las plantas). */
  contadores: { viviendas: number; oficinas: number; locales: number; comunes: boolean; total: number };
  unifamiliar: boolean;
  material: MaterialTuberia;
  /** Niveles con unidades, de abajo arriba. */
  niveles: number[];
  /** Supuestos de reparto que conviene revisar. */
  supuestos: { unifamiliarReparto: boolean };
  /** «P1: 2 baños · PB: 1 aseo y cocina» (unifamiliar), para el aviso. */
  repartoTexto: string;
  /** Hay oficinas sin núcleos de aseos: no aportan red. */
  oficinasSinNucleos: boolean;
  /** Hay garaje. */
  garaje: boolean;
  /** Grifos de baldeo de los garajes (0: el garaje no tiene consumo). */
  grifosGaraje: number;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function sanea(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

function slugDe(s: string): string {
  const limpio = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return limpio === "" ? "tipo" : limpio;
}

function presetHs4(key: "bano" | "aseo" | "cocina"): TipoAparatoHS4[] {
  return PRESETS_APARATOS.find((p) => p.key === key)!.hs4.map((a) => a.tipo);
}

/** Cuartos húmedos de una vivienda tipo: baños → aseos → cocina. */
function cuartosVivienda(vt: ViviendaTipo): CuartoHs4[] {
  const banos = sanea(vt.banos);
  const aseos = sanea(vt.aseos);
  const out: CuartoHs4[] = [];
  for (let i = 1; i <= banos; i++) {
    out.push({
      clase: "bano",
      etiqueta: banos > 1 ? `Baño ${i}` : "Baño",
      slug: banos > 1 ? `bano-${i}` : "bano",
      aparatos: presetHs4("bano"),
    });
  }
  for (let i = 1; i <= aseos; i++) {
    out.push({
      clase: "aseo",
      etiqueta: aseos > 1 ? `Aseo ${i}` : "Aseo",
      slug: aseos > 1 ? `aseo-${i}` : "aseo",
      aparatos: presetHs4("aseo"),
    });
  }
  out.push({ clase: "cocina", etiqueta: "Cocina", slug: "cocina", aparatos: presetHs4("cocina") });
  return out;
}

/** Los grifos de baldeo de los garajes de una planta. */
function cuartoGaraje(grifos: number): CuartoHs4 {
  return {
    clase: "garaje",
    etiqueta: "Garaje",
    slug: "garaje",
    aparatos: Array.from({ length: grifos }, () => "grifo_garaje" as const),
  };
}

/** Los aseos de los núcleos de una planta de oficinas, juntos. */
function cuartoOficinas(nucleos: { n: NucleoAseos; cantidad: number }[]): CuartoHs4 {
  const aparatos: TipoAparatoHS4[] = [];
  for (const { n, cantidad } of nucleos) {
    for (let k = 0; k < cantidad; k++) {
      for (let i = 0; i < sanea(n.inodoros); i++) aparatos.push("inodoro_cisterna");
      for (let i = 0; i < sanea(n.lavabos); i++) aparatos.push("lavabo");
    }
  }
  return { clase: "aseos", etiqueta: "Aseos", slug: "aseos", aparatos };
}

/** «A3», «A PB», con «·2» si hay más de una del mismo tipo en la planta. */
function nombreUnidad(tipo: string, nivel: number, k: number, total: number): string {
  const base = nivel === 0 ? `${tipo} PB` : nivel > 0 ? `${tipo}${nivel}` : `${tipo} ${etiquetaNivel(nivel)}`;
  return total > 1 ? `${base}·${k}` : base;
}

// -----------------------------------------------------------------------------
// Generador
// -----------------------------------------------------------------------------

/** Una unidad antes de colgarla de la red. */
interface Prov {
  id: string;
  tipoId: string;
  nombre: string;
  nombreTipo: string;
  clase: UnidadHs4["clase"];
  nivel: number;
  cuartos: { nivel: number; cuartos: CuartoHs4[] }[];
}

interface Unidades {
  provs: Prov[];
  unifamiliarReparto: boolean;
  repartoTexto: string;
  oficinasSinNucleos: boolean;
  grifosGaraje: number;
}

function unidadesDe(e: Edificio): Unidades {
  const plantas = plantasDe(e); // de arriba abajo
  const resumen = resumenEdificio(e);
  const provs: Prov[] = [];
  let unifamiliarReparto = false;
  let repartoTexto = "";

  // Grifos de baldeo por planta, de abajo arriba.
  const garajes = [...plantas]
    .reverse()
    .map((p) => ({
      nivel: p.nivel,
      grifos: p.zonas
        .filter((z) => z.uso === "garaje" || z.uso === "garaje_privado")
        .reduce((s, z) => s + sanea(z.grifos ?? 0), 0),
    }))
    .filter((g) => g.grifos > 0);
  const grifosGaraje = garajes.reduce((s, g) => s + g.grifos, 0);

  if (resumen.esUnifamiliar) {
    const reparto = repartoUnifamiliar(e);
    if (reparto) {
      const porNivel = repartirCuartos(cuartosVivienda(reparto.tipo), reparto.plantas);
      // El garaje es un cuarto más de la vivienda, detrás de su contador.
      for (const g of garajes) {
        const enNivel = porNivel.find((x) => x.nivel === g.nivel);
        if (enNivel) enNivel.cuartos.push(cuartoGaraje(g.grifos));
        else porNivel.push({ nivel: g.nivel, cuartos: [cuartoGaraje(g.grifos)] });
      }
      porNivel.sort((a, b) => a.nivel - b.nivel);
      unifamiliarReparto = reparto.supuesto;
      repartoTexto = textoReparto(reparto);
      provs.push({
        id: "u",
        tipoId: reparto.tipo.id,
        nombre: "Vivienda",
        nombreTipo: reparto.tipo.nombre,
        clase: "vivienda",
        nivel: reparto.plantas[0].nivel,
        cuartos: porNivel,
      });
    }
  } else {
    const tipos = new Map(e.unidades.filter((u): u is ViviendaTipo => u.clase === "vivienda").map((u) => [u.id, u]));
    // De abajo arriba: las unidades de la PB primero (orden estable de la batería).
    for (const p of [...plantas].reverse()) {
      const porTipo = new Map<string, number>();
      for (const z of p.zonas) {
        if (z.uso !== "viviendas") continue;
        for (const u of z.unidades ?? []) {
          if (!tipos.has(u.tipoId)) continue;
          porTipo.set(u.tipoId, (porTipo.get(u.tipoId) ?? 0) + sanea(u.cantidad));
        }
      }
      for (const [tipoId, n] of porTipo) {
        const vt = tipos.get(tipoId)!;
        const cuartos = cuartosVivienda(vt);
        for (let k = 1; k <= n; k++) {
          const base = `${slugDe(vt.nombre)}-${slugDe(etiquetaNivel(p.nivel))}`;
          provs.push({
            id: n > 1 ? `${base}-${k}` : base,
            tipoId,
            nombre: nombreUnidad(vt.nombre, p.nivel, k, n),
            nombreTipo: vt.nombre,
            clase: "vivienda",
            nivel: p.nivel,
            cuartos: [{ nivel: p.nivel, cuartos }],
          });
        }
      }
    }
  }

  // Oficinas: una unidad por planta con sus núcleos de aseos.
  const nucleos = new Map(e.unidades.filter((u): u is NucleoAseos => u.clase === "nucleo_aseos").map((u) => [u.id, u]));
  let oficinasSinNucleos = false;
  for (const p of [...plantas].reverse()) {
    const zonas = p.zonas.filter((z) => z.uso === "oficinas");
    if (zonas.length === 0) continue;
    const enPlanta = zonas
      .flatMap((z) => z.unidades ?? [])
      .filter((u) => nucleos.has(u.tipoId) && sanea(u.cantidad) > 0)
      .map((u) => ({ n: nucleos.get(u.tipoId)!, cantidad: sanea(u.cantidad) }));
    const cuarto = cuartoOficinas(enPlanta);
    if (cuarto.aparatos.length === 0) {
      oficinasSinNucleos = true;
      continue;
    }
    provs.push({
      id: `of-${slugDe(etiquetaNivel(p.nivel))}`,
      tipoId: enPlanta[0].n.id,
      nombre: `Oficinas ${etiquetaNivel(p.nivel)}`,
      nombreTipo: "Oficinas",
      clase: "oficinas",
      nivel: p.nivel,
      cuartos: [{ nivel: p.nivel, cuartos: [cuarto] }],
    });
  }
  // Fuera de la unifamiliar, los grifos del garaje van al contador de servicios
  // comunes; la unidad está en el garaje más alto (el más cercano a la batería).
  if (!resumen.esUnifamiliar && garajes.length > 0) {
    provs.push({
      id: "comunes",
      tipoId: "comunes",
      nombre: "Servicios comunes",
      nombreTipo: "Comunes",
      clase: "comunes",
      nivel: garajes[garajes.length - 1].nivel,
      cuartos: garajes.map((g) => ({ nivel: g.nivel, cuartos: [cuartoGaraje(g.grifos)] })),
    });
  }
  return { provs, unifamiliarReparto, repartoTexto, oficinasSinNucleos, grifosGaraje };
}

export function generarRedHs4(e: Edificio, d: DecisionesHs4): RedHs4 {
  const decisiones = resolverDecisionesHs4(d);
  const resumen = resumenEdificio(e);
  const plantas = plantasDe(e);
  const cotaDe = new Map(plantas.map((p) => [p.nivel, p.cota_m] as const));
  const material = materialDe(decisiones.tuberia);
  const { provs, unifamiliarReparto, repartoTexto, oficinasSinNucleos, grifosGaraje } = unidadesDe(e);
  const unifamiliar = resumen.esUnifamiliar;
  const porPlanta = decisiones.contadores === "por_planta" && !unifamiliar && provs.length > 1;

  // Locales sin uso: contador previsto, sin aparatos.
  const locales: LocalHs4[] = [];
  for (const p of [...plantas].reverse()) {
    const zonas = p.zonas.filter((z) => z.uso === "local_sin_uso");
    if (zonas.length === 0) continue;
    locales.push({
      id: `local-${slugDe(etiquetaNivel(p.nivel))}`,
      nivel: p.nivel,
      numero: zonas.length,
      superficie_m2: zonas.reduce((s, z) => s + (Number.isFinite(z.superficieUtil_m2) ? z.superficieUtil_m2 : 0), 0),
    });
  }
  const usos = new Set(plantas.flatMap((p) => p.zonas.map((z) => z.uso)));
  const comunes =
    !unifamiliar && (usos.has("zona_comun") || usos.has("vestibulo") || provs.some((u) => u.clase === "comunes"));
  const nViv = provs.filter((u) => u.clase === "vivienda").length;
  const nOf = provs.filter((u) => u.clase === "oficinas").length;
  const nLoc = locales.reduce((s, l) => s + l.numero, 0);
  const contadores = {
    viviendas: nViv,
    oficinas: nOf,
    locales: nLoc,
    comunes,
    total: nViv + nOf + nLoc + (comunes ? 1 : 0),
  };

  const vacia: RedHs4 = {
    decisiones,
    tramos: [],
    aparatos: [],
    unidades: [],
    puntos: {},
    locales,
    cotas: cotaDe,
    contadores,
    unifamiliar,
    material,
    niveles: [],
    supuestos: { unifamiliarReparto },
    repartoTexto,
    oficinasSinNucleos,
    garaje: resumen.tieneGaraje,
    grifosGaraje,
  };
  if (provs.length === 0) return vacia;

  const tramos: TramoInputHS4[] = [
    {
      id: "acometida",
      nombre: "Acometida",
      tipo: "acometida",
      parentId: null,
      // La acometida es de polietileno (plástico), sea cual sea la tubería interior.
      material: "termoplastico_multicapa",
      longitud_m: LONGITUDES_M.acometida,
    },
    {
      id: "alimentacion",
      nombre: "Tubo de alimentación",
      tipo: "tubo_alimentacion",
      parentId: "acometida",
      material,
      longitud_m: LONGITUDES_M.tuboAlimentacion,
    },
  ];
  const aparatos: AparatoInputHS4[] = [];
  const cota = (nivel: number) => cotaDe.get(nivel) ?? 0;

  // ── Montante general por planta (contadores por planta) ───────────────────
  // Los servicios comunes no van por el montante general: tienen el suyo.
  const niveles = [...new Set(provs.filter((u) => u.clase !== "comunes").map((u) => u.nivel))].sort(
    (a, b) => a - b,
  );
  const generalDe = new Map<number, string>();
  if (porPlanta) {
    let parent = "alimentacion";
    let cotaAnterior = 0;
    let primero = true;
    for (const nivel of niveles) {
      const subida = Math.max(0, cota(nivel) - cotaAnterior);
      const id = `montante-${slugDe(etiquetaNivel(nivel))}`;
      tramos.push({
        id,
        nombre: `Montante general · ${etiquetaNivel(nivel)}`,
        tipo: "columna_montante",
        parentId: parent,
        tramoAlimentacion: "distribuidor_principal",
        material,
        longitud_m: Math.max(1, subida) + (primero ? LONGITUDES_M.montanteHorizontal : 0),
        ...(subida > 0 ? { altura_m: subida } : {}),
      });
      generalDe.set(nivel, id);
      parent = id;
      cotaAnterior = Math.max(cotaAnterior, cota(nivel));
      primero = false;
    }
  }

  const unidades: UnidadHs4[] = [];
  const puntos: Record<string, PuntoRedHs4> = {};
  for (const u of provs) {
    let montanteId: string | null = null;
    let parentDeriv: string;
    if (unifamiliar) {
      parentDeriv = "alimentacion";
    } else if (porPlanta && u.clase !== "comunes") {
      parentDeriv = generalDe.get(u.nivel)!;
    } else {
      // Batería en PB: un montante por unidad, desde la batería hasta su planta.
      montanteId = `montante-${u.id}`;
      const subida = Math.max(0, cota(u.nivel));
      tramos.push({
        id: montanteId,
        nombre: `Montante · ${u.nombre}`,
        tipo: "columna_montante",
        parentId: "alimentacion",
        material,
        longitud_m: subida + LONGITUDES_M.montanteHorizontal,
        ...(subida > 0 ? { altura_m: subida } : {}),
      });
      parentDeriv = montanteId;
    }
    const derivacionId = `deriv-${u.id}`;
    tramos.push({
      id: derivacionId,
      nombre: `Derivación · ${u.nombre}`,
      tipo: "derivacion_particular",
      parentId: parentDeriv,
      material,
      longitud_m: LONGITUDES_M.derivacionParticular,
    });

    const aparatoIds: string[] = [];
    for (const grupo of u.cuartos) {
      // En la unifamiliar, los cuartos de otra planta suben por un montante interior.
      let parentCuarto = derivacionId;
      const subida = cota(grupo.nivel) - cota(u.nivel);
      if (subida > 0) {
        parentCuarto = `${u.id}-subida-${slugDe(etiquetaNivel(grupo.nivel))}`;
        tramos.push({
          id: parentCuarto,
          nombre: `Subida a ${etiquetaNivel(grupo.nivel)}`,
          tipo: "columna_montante",
          parentId: derivacionId,
          material,
          longitud_m: subida + 1,
          altura_m: subida,
        });
      }
      for (const c of grupo.cuartos) {
        const cuartoId = `${u.id}-${c.slug}`;
        tramos.push({
          id: cuartoId,
          nombre: `${c.etiqueta} · ${u.nombre}`,
          tipo: "derivacion_particular",
          parentId: parentCuarto,
          tramoAlimentacion: "cuarto_humedo_privado",
          material,
          longitud_m: LONGITUDES_M.cuarto,
        });
        const vistos = new Map<string, number>();
        for (const tipo of c.aparatos) {
          const n = (vistos.get(tipo) ?? 0) + 1;
          vistos.set(tipo, n);
          const apId = `${cuartoId}-${slugDe(tipo)}${n > 1 ? `-${n}` : ""}`;
          tramos.push({
            id: `d-${apId}`,
            nombre: `Derivación · ${c.etiqueta.toLowerCase()}`,
            tipo: "derivacion_aparato",
            parentId: cuartoId,
            material,
            longitud_m: LONGITUDES_M.derivacionAparato,
            altura_m: ALTURA_PUNTO_CONSUMO_M,
          });
          aparatos.push({ id: apId, nombre: `${u.nombre} · ${c.etiqueta}`, tipo, tramoId: `d-${apId}` });
          aparatoIds.push(apId);
          puntos[apId] = { unidadId: u.id, nivel: grupo.nivel, cuarto: c.etiqueta };
        }
      }
    }
    unidades.push({
      id: u.id,
      tipoId: u.tipoId,
      nombre: u.nombre,
      nombreTipo: u.nombreTipo,
      clase: u.clase,
      nivel: u.nivel,
      cuartos: u.cuartos,
      montanteId,
      derivacionId,
      aparatoIds,
      numAparatos: aparatoIds.length,
    });
  }

  return {
    ...vacia,
    tramos,
    aparatos,
    unidades,
    puntos,
    niveles: [...new Set(unidades.flatMap((u) => u.cuartos.map((c) => c.nivel)))].sort((a, b) => a - b),
  };
}
