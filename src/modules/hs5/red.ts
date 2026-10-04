// =============================================================================
// DB-HS5 — La red de evacuación deducida de El edificio (feature-14 §D).
//
// Función PURA y DETERMINISTA: del edificio y de las decisiones del proyectista
// sale la red de residuales (el `HS5Inputs` de siempre, que dimensiona
// `calcHS5`) y lo que no es una red de UD: la previsión de los locales sin uso,
// el garaje y la cubierta para pluviales. Ids y nombres estables, derivados de
// la posición (tipo · instancia · clase de bajante · planta).
//
// Criterios de proyecto (no normativos, declarados en la memoria):
//   - las viviendas del mismo tipo se apilan: una VERTICAL por posición;
//   - cada vertical baja por una bajante de baños y otra de cocina («Propia»), o
//     por una sola («Con los baños»);
//   - un ramal por planta y bajante recoge los cuartos húmedos de esa vivienda;
//   - en la unifamiliar, los cuartos en las plantas que dice El edificio o, si
//     no lo dice, los baños en la más alta y la cocina y el aseo en la más baja
//     (`repartoUnifamiliar`, el mismo que HS4; el supuesto se avisa);
//   - lo que acomete en la planta que apoya sobre el colector va directo a él.
// Las composiciones de aparatos salen de `PRESETS_APARATOS` (baño y aseo como
// cuartos agrupados de la Tabla 4.1); las UD y los Ø los pone el motor.
// =============================================================================

import { PRESETS_APARATOS } from "../../data/presetsAparatos";
import { etiquetaNivel, plantasDe, resumenEdificio } from "../../lib/edificio/derivar";
import {
  repartirCuartos,
  repartoUnifamiliar,
  textoReparto,
  type RepartoUnifamiliar,
} from "../../lib/edificio/reparto";
import type { Edificio, NucleoAseos, TipoCubierta, ViviendaTipo } from "../../lib/edificio/tipos";
import {
  udDeAparato,
  type AparatoInput,
  type DisposicionColector,
  type HS5Inputs,
  type TramoInput,
} from "./calc";
import { VENT_PRIMARIA, type TipoAparato, type UsoAparato } from "./tablas";

// -----------------------------------------------------------------------------
// Decisiones
// -----------------------------------------------------------------------------

export type Alcantarillado = "unitario" | "separativo";
export type BajanteCocina = "propia" | "con_banos";
export type Ventilacion = "primaria" | "secundaria";
/** «habitual»: lo que se haría sin pensarlo, según el edificio. */
export type Opcion<T> = T | "habitual";

/** Las decisiones tal y como se guardan (con «habitual»). */
export interface DecisionesHs5 {
  alcantarillado: Opcion<Alcantarillado>;
  colectores: Opcion<DisposicionColector>;
  pendienteColector_pct: number;
  bajanteCocina: Opcion<BajanteCocina>;
  ventilacion: Opcion<Ventilacion>;
}

/** Las decisiones resueltas para este edificio. */
export interface DecisionesEfectivas {
  alcantarillado: Alcantarillado;
  colectores: DisposicionColector;
  pendienteColector_pct: number;
  bajanteCocina: BajanteCocina;
  ventilacion: Ventilacion;
}

export const DECISIONES_POR_DEFECTO: DecisionesHs5 = {
  alcantarillado: "habitual",
  colectores: "habitual",
  pendienteColector_pct: 2,
  bajanteCocina: "habitual",
  ventilacion: "habitual",
};

/**
 * Lo habitual para un edificio: alcantarillado unitario, colectores colgados
 * del techo del sótano si lo hay (si no, enterrados), al 2 %, bajante de cocina
 * propia y ventilación primaria por debajo de 7 plantas (ap. 3.3.3.1).
 */
export function decisionesHabituales(e: Edificio): DecisionesEfectivas {
  const r = resumenEdificio(e);
  return {
    alcantarillado: "unitario",
    colectores: r.plantasBajoRasante > 0 ? "colgado" : "enterrado",
    pendienteColector_pct: 2,
    bajanteCocina: "propia",
    ventilacion: r.plantasSobreRasante < VENT_PRIMARIA.datos.maxPlantasSolo ? "primaria" : "secundaria",
  };
}

export function resolverDecisiones(d: DecisionesHs5, e: Edificio): DecisionesEfectivas {
  const h = decisionesHabituales(e);
  const p = d.pendienteColector_pct;
  return {
    alcantarillado: d.alcantarillado === "habitual" ? h.alcantarillado : d.alcantarillado,
    colectores: d.colectores === "habitual" ? h.colectores : d.colectores,
    pendienteColector_pct: Number.isFinite(p) && p > 0 ? p : h.pendienteColector_pct,
    bajanteCocina: d.bajanteCocina === "habitual" ? h.bajanteCocina : d.bajanteCocina,
    ventilacion: d.ventilacion === "habitual" ? h.ventilacion : d.ventilacion,
  };
}

// -----------------------------------------------------------------------------
// Forma de la red
// -----------------------------------------------------------------------------

export type ClaseCuarto = "bano" | "aseo" | "cocina" | "aseos";

/** Un cuarto húmedo de una vivienda o un núcleo de aseos, con sus aparatos. */
export interface CuartoRed {
  clase: ClaseCuarto;
  /** «Baño», «Baño 2», «Aseo», «Cocina», «Aseos». */
  etiqueta: string;
  /** Sufijo de id estable: «bano-1», «aseo», «cocina»… */
  slug: string;
  aparatos: { tipo: TipoAparato; uso?: UsoAparato }[];
  /** UD del cuarto (Tabla 4.1). */
  ud: number;
}

/**
 * Clase de bajante: «fecales» (baños y aseos), «cocina», «unica» (con la
 * cocina) o «aseos» (núcleo de aseos de oficinas).
 */
export type ClaseBajante = "fecales" | "cocina" | "unica" | "aseos";

export interface RamalPlanta {
  nivel: number;
  /** Id del ramal en la PRIMERA instancia de la vertical. */
  id: string;
  cuartos: CuartoRed[];
  ud: number;
}

export interface BajanteHs5 {
  clase: ClaseBajante;
  /**
   * Id de la bajante en la primera instancia, o `null` si sus ramales acometen
   * directamente al colector (todo en la planta que apoya sobre él).
   */
  id: string | null;
  /** Altura en plantas: las plantas que desaguan en ella. */
  plantas: number;
  ramales: RamalPlanta[];
  /** UD de la bajante (de una instancia). */
  ud: number;
}

/** Una vertical: la pila de viviendas (o núcleos) iguales de una posición. */
export interface VerticalHs5 {
  /** «a», «b», «u», «n»; con «-2» si un mismo tipo forma dos verticales distintas. */
  id: string;
  tipoId: string;
  /** Nombre del tipo («A»). */
  nombre: string;
  clase: "vivienda" | "nucleo_aseos";
  /** Verticales idénticas (se dibujan una vez, «× n»). */
  instancias: number;
  /** Niveles en los que hay una unidad de la vertical (de abajo arriba). */
  niveles: number[];
  /** UD de una unidad (una vivienda o un núcleo). */
  udUnidad: number;
  bajantes: BajanteHs5[];
}

export interface LocalHs5 {
  nivel: number;
  /** Zonas de local sin uso en esa planta. */
  numero: number;
  superficie_m2: number;
}

export interface GarajeHs5 {
  nivel: number;
  /** Cota del suelo [m]. */
  cota_m: number;
  plazas: number;
  superficie_m2: number;
  /** Garaje privado de una vivienda. */
  privado: boolean;
}

export interface RedHs5 {
  decisiones: DecisionesEfectivas;
  /** La red de residuales que dimensiona `calcHS5` (vacía si no hay cuartos húmedos). */
  residuales: HS5Inputs;
  /** Id del colector general, o `null` si no hay red de residuales. */
  colectorId: string | null;
  /** Nivel de la planta que apoya sobre el colector (PB, o el sótano más bajo). */
  nivelBase: number;
  /**
   * Dónde se cuelga el colector: del techo del garaje o del sótano, o bajo el
   * forjado de la PB si no hay sótano. `null` si va enterrado.
   */
  colgadoDe: "garaje" | "sotano" | "forjado_pb" | null;
  verticales: VerticalHs5[];
  locales: LocalHs5[];
  garajes: GarajeHs5[];
  cubierta: { tipo: TipoCubierta; superficie_m2: number };
  /** Edificio de una sola vivienda (la unifamiliar). */
  unifamiliar: boolean;
  /** Supuestos de reparto que conviene revisar. */
  supuestos: { unifamiliarReparto: boolean };
  /** «P1: 2 baños · PB: 1 aseo y cocina» (unifamiliar), para el aviso. */
  repartoTexto: string;
  /** Hay oficinas sin núcleos de aseos: no aportan red. */
  oficinasSinNucleos: boolean;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** Entero ≥ 0 saneado. */
function sanea(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

/** Slug determinista para ids: minúsculas, sin diacríticos, [a-z0-9-]. */
export function slugDe(s: string): string {
  const limpio = s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return limpio === "" ? "tipo" : limpio;
}

function presetHs5(key: "bano" | "aseo" | "cocina"): { tipo: TipoAparato }[] {
  return PRESETS_APARATOS.find((p) => p.key === key)!.hs5;
}

function udDe(aparatos: CuartoRed["aparatos"], usoRed: UsoAparato): number {
  return aparatos.reduce((s, a) => s + (udDeAparato(a.tipo, a.uso ?? usoRed) ?? 0), 0);
}

/** Cuartos húmedos de una vivienda tipo: baños → aseos → cocina. */
function cuartosVivienda(vt: ViviendaTipo): CuartoRed[] {
  const banos = sanea(vt.banos);
  const aseos = sanea(vt.aseos);
  const out: CuartoRed[] = [];
  for (let i = 1; i <= banos; i++) {
    const aparatos = presetHs5("bano");
    out.push({
      clase: "bano",
      etiqueta: banos > 1 ? `Baño ${i}` : "Baño",
      slug: banos > 1 ? `bano-${i}` : "bano",
      aparatos,
      ud: udDe(aparatos, "privado"),
    });
  }
  for (let i = 1; i <= aseos; i++) {
    const aparatos = presetHs5("aseo");
    out.push({
      clase: "aseo",
      etiqueta: aseos > 1 ? `Aseo ${i}` : "Aseo",
      slug: aseos > 1 ? `aseo-${i}` : "aseo",
      aparatos,
      ud: udDe(aparatos, "privado"),
    });
  }
  const cocina = presetHs5("cocina");
  out.push({ clase: "cocina", etiqueta: "Cocina", slug: "cocina", aparatos: cocina, ud: udDe(cocina, "privado") });
  return out;
}

/** El núcleo de aseos de oficinas: inodoros con cisterna y lavabos de uso público. */
function cuartoNucleo(n: NucleoAseos): CuartoRed {
  const aparatos: CuartoRed["aparatos"] = [
    ...Array.from({ length: sanea(n.inodoros) }, () => ({ tipo: "inodoro_cisterna" as const, uso: "publico" as const })),
    ...Array.from({ length: sanea(n.lavabos) }, () => ({ tipo: "lavabo" as const, uso: "publico" as const })),
  ];
  return { clase: "aseos", etiqueta: "Aseos", slug: "aseos", aparatos, ud: udDe(aparatos, "publico") };
}

/** A qué bajante va un cuarto según la decisión de la cocina. */
function claseBajanteDe(c: ClaseCuarto, cocina: BajanteCocina): ClaseBajante {
  if (c === "aseos") return "aseos";
  if (cocina === "con_banos") return "unica";
  return c === "cocina" ? "cocina" : "fecales";
}

const ORDEN_BAJANTES: readonly ClaseBajante[] = ["fecales", "unica", "aseos", "cocina"];

export const NOMBRE_BAJANTE: Record<ClaseBajante, string> = {
  fecales: "fecales",
  cocina: "cocina",
  unica: "baños y cocina",
  aseos: "aseos",
};

/** Etiqueta del grupo de cuartos de un ramal: «baños de A», «cocina de B». */
function etiquetaRamal(clase: ClaseBajante, cuartos: CuartoRed[], nombre: string): string {
  if (clase === "cocina") return `cocina de ${nombre}`;
  if (clase === "aseos") return `aseos de ${nombre}`;
  if (cuartos.length === 1) return `${cuartos[0].etiqueta.toLowerCase()} de ${nombre}`;
  return `${clase === "unica" ? "cuartos húmedos" : "baños"} de ${nombre}`;
}

// -----------------------------------------------------------------------------
// Verticales
// -----------------------------------------------------------------------------

/** Una unidad tipo y sus cuartos en cada nivel en que aparece. */
interface Pila {
  tipoId: string;
  nombre: string;
  clase: "vivienda" | "nucleo_aseos";
  /** Instancia k (1…) → niveles en que existe. */
  instancias: number[][];
  /** Cuartos de una unidad en cada nivel (la unifamiliar los reparte). */
  cuartosEn: (nivel: number) => CuartoRed[];
  udUnidad: number;
}

/**
 * Pilas de unidades repetidas (plurifamiliar y oficinas): por tipo, la
 * instancia k existe en los niveles con al menos k unidades de ese tipo.
 */
function pilasRepetidas(e: Edificio, usoZona: "viviendas" | "oficinas"): Pila[] {
  const plantas = plantasDe(e);
  const pilas: Pila[] = [];
  for (const u of e.unidades) {
    if (usoZona === "viviendas" && u.clase !== "vivienda") continue;
    if (usoZona === "oficinas" && u.clase !== "nucleo_aseos") continue;
    const porNivel = new Map<number, number>();
    for (const p of plantas) {
      const n = p.zonas
        .filter((z) => z.uso === usoZona)
        .flatMap((z) => z.unidades ?? [])
        .filter((x) => x.tipoId === u.id)
        .reduce((s, x) => s + sanea(x.cantidad), 0);
      if (n > 0) porNivel.set(p.nivel, (porNivel.get(p.nivel) ?? 0) + n);
    }
    const max = Math.max(0, ...porNivel.values());
    if (max === 0) continue;
    const niveles = [...porNivel.keys()].sort((a, b) => a - b);
    const instancias: number[][] = [];
    for (let k = 1; k <= max; k++) instancias.push(niveles.filter((nv) => (porNivel.get(nv) ?? 0) >= k));
    const cuartos = u.clase === "vivienda" ? cuartosVivienda(u) : [cuartoNucleo(u)];
    pilas.push({
      tipoId: u.id,
      nombre: u.nombre,
      clase: u.clase,
      instancias,
      cuartosEn: () => cuartos,
      udUnidad: cuartos.reduce((s, c) => s + c.ud, 0),
    });
  }
  return pilas;
}

/**
 * La unifamiliar: una vivienda (la primera vivienda tipo) con sus cuartos en las
 * plantas que dice El edificio o, si no lo dice, los baños en la más alta y la
 * cocina y los aseos en la más baja (`repartoUnifamiliar`, el mismo que HS4).
 */
function pilaUnifamiliar(reparto: RepartoUnifamiliar): Pila {
  const cuartos = cuartosVivienda(reparto.tipo);
  const porNivel = repartirCuartos(cuartos, reparto.plantas);
  return {
    tipoId: reparto.tipo.id,
    nombre: reparto.tipo.nombre,
    clase: "vivienda",
    instancias: [porNivel.map((g) => g.nivel)],
    cuartosEn: (nivel) => porNivel.find((g) => g.nivel === nivel)?.cuartos ?? [],
    udUnidad: cuartos.reduce((s, c) => s + c.ud, 0),
  };
}

// -----------------------------------------------------------------------------
// Generador
// -----------------------------------------------------------------------------

export function generarRedHs5(e: Edificio, d: DecisionesHs5): RedHs5 {
  const decisiones = resolverDecisiones(d, e);
  const resumen = resumenEdificio(e);
  const plantas = plantasDe(e);
  const nivelMin = plantas.length > 0 ? Math.min(...plantas.map((p) => p.nivel)) : 0;
  // La planta que apoya sobre el colector: la PB (colgado del techo del sótano,
  // o enterrado bajo la solera) o el sótano más bajo si se entierra bajo él.
  const nivelBase = decisiones.colectores === "enterrado" && nivelMin < 0 ? nivelMin : 0;
  const sotano1 = plantas.find((p) => p.nivel === -1);
  const colgadoDe: RedHs5["colgadoDe"] =
    decisiones.colectores === "enterrado"
      ? null
      : !sotano1
        ? "forjado_pb"
        : sotano1.zonas.some((z) => z.uso === "garaje" || z.uso === "garaje_privado")
          ? "garaje"
          : "sotano";

  const pilas: Pila[] = [];
  const reparto = resumen.esUnifamiliar ? repartoUnifamiliar(e) : null;
  const unifamiliar = reparto ? pilaUnifamiliar(reparto) : null;
  if (unifamiliar) pilas.push(unifamiliar);
  else pilas.push(...pilasRepetidas(e, "viviendas"));
  pilas.push(...pilasRepetidas(e, "oficinas"));

  const usoRed: UsoAparato = pilas.some((p) => p.clase === "vivienda") ? "privado" : "publico";
  const colectorId = "colector-general";
  const tramos: TramoInput[] = [];
  const aparatos: AparatoInput[] = [];
  const verticales: VerticalHs5[] = [];
  const idsUsados = new Set<string>();

  for (const pila of pilas) {
    // Instancias con los mismos niveles forman una vertical (× n).
    const grupos = new Map<string, number[]>();
    pila.instancias.forEach((niveles) => {
      const firma = niveles.join(",");
      grupos.set(firma, [...(grupos.get(firma) ?? []), 0]);
    });
    let gi = 0;
    for (const [firma, miembros] of grupos) {
      gi += 1;
      const niveles = firma === "" ? [] : firma.split(",").map(Number);
      let base = slugDe(pila.tipoId) + (grupos.size > 1 ? `-${gi}` : "");
      while (idsUsados.has(base)) base += "x";
      idsUsados.add(base);

      const bajantes: BajanteHs5[] = [];
      for (let k = 1; k <= miembros.length; k++) {
        const inst = miembros.length > 1 ? `${base}${k}` : base;
        const prefNombre = miembros.length > 1 ? `${pila.nombre}${k}` : pila.nombre;
        // Cuartos de esta instancia agrupados por clase de bajante y nivel.
        const porClase = new Map<ClaseBajante, { nivel: number; cuartos: CuartoRed[] }[]>();
        for (const nivel of niveles) {
          for (const c of pila.cuartosEn(nivel)) {
            const clase = claseBajanteDe(c.clase, decisiones.bajanteCocina);
            const lista = porClase.get(clase) ?? [];
            const enNivel = lista.find((x) => x.nivel === nivel);
            if (enNivel) enNivel.cuartos.push(c);
            else lista.push({ nivel, cuartos: [c] });
            porClase.set(clase, lista);
          }
        }
        for (const clase of ORDEN_BAJANTES) {
          const ramalesNivel = porClase.get(clase);
          if (!ramalesNivel || ramalesNivel.length === 0) continue;
          ramalesNivel.sort((a, b) => a.nivel - b.nivel);
          const conBajante = ramalesNivel.some((r) => r.nivel > nivelBase);
          const bajanteId = conBajante ? `bajante-${inst}-${clase}` : null;
          // Plantas que atraviesa: de la más alta con acometida hasta la que
          // apoya sobre el colector (la Tabla 4.4 no dice cuáles cuentan).
          const atravesadas = ramalesNivel[ramalesNivel.length - 1].nivel - nivelBase + 1;
          if (bajanteId) {
            tramos.push({
              id: bajanteId,
              nombre: `Bajante ${prefNombre} · ${NOMBRE_BAJANTE[clase]}`,
              tipo: "bajante",
              parentId: colectorId,
              plantas: ramalesNivel.length,
              plantasAtravesadas: Math.max(ramalesNivel.length, atravesadas),
            });
          }
          const ramales: RamalPlanta[] = [];
          for (const r of ramalesNivel) {
            const et = etiquetaNivel(r.nivel);
            const ramalId = `ramal-${inst}-${clase}-${slugDe(et)}`;
            tramos.push({
              id: ramalId,
              nombre: `Ramal · ${etiquetaRamal(clase, r.cuartos, prefNombre)} · ${et}`,
              tipo: "ramal",
              parentId: bajanteId ?? colectorId,
              pendiente_pct: 2,
              longitud_m: clase === "cocina" ? 3 : 2,
            });
            for (const c of r.cuartos) {
              c.aparatos.forEach((a, i) => {
                aparatos.push({
                  id: `${ramalId}-${c.slug}-${i + 1}`,
                  nombre: `${et} · ${prefNombre} · ${c.etiqueta}`,
                  tipo: a.tipo,
                  tramoId: ramalId,
                  ...(a.uso && a.uso !== usoRed ? { uso: a.uso } : {}),
                });
              });
            }
            ramales.push({ nivel: r.nivel, id: ramalId, cuartos: r.cuartos, ud: r.cuartos.reduce((s, c) => s + c.ud, 0) });
          }
          // La vertical guarda la PRIMERA instancia: las demás son idénticas.
          if (k === 1) {
            bajantes.push({
              clase,
              id: bajanteId,
              plantas: ramalesNivel.length,
              ramales,
              ud: ramales.reduce((s, r) => s + r.ud, 0),
            });
          }
        }
      }
      verticales.push({
        id: base,
        tipoId: pila.tipoId,
        nombre: pila.nombre,
        clase: pila.clase,
        instancias: miembros.length,
        niveles,
        udUnidad: pila.udUnidad,
        bajantes,
      });
    }
  }

  const hayRed = tramos.length > 0;
  if (hayRed) {
    tramos.unshift({
      id: colectorId,
      nombre: "Colector general",
      tipo: "colector",
      parentId: null,
      pendiente_pct: decisiones.pendienteColector_pct,
      disposicion: decisiones.colectores,
    });
  }

  // Locales sin uso y garajes, por planta.
  const locales: LocalHs5[] = [];
  const garajes: GarajeHs5[] = [];
  for (const p of plantas) {
    const ls = p.zonas.filter((z) => z.uso === "local_sin_uso");
    if (ls.length > 0) {
      locales.push({
        nivel: p.nivel,
        numero: ls.length,
        superficie_m2: ls.reduce((s, z) => s + Math.max(0, z.superficieUtil_m2 || 0), 0),
      });
    }
    for (const z of p.zonas) {
      if (z.uso !== "garaje" && z.uso !== "garaje_privado") continue;
      garajes.push({
        nivel: p.nivel,
        cota_m: p.cota_m,
        plazas: sanea(z.plazas ?? 0),
        superficie_m2: Math.max(0, z.superficieUtil_m2 || 0),
        privado: z.uso === "garaje_privado",
      });
    }
  }
  locales.sort((a, b) => b.nivel - a.nivel);

  const oficinasSinNucleos = plantas.some((p) =>
    p.zonas.some(
      (z) =>
        z.uso === "oficinas" &&
        !(z.unidades ?? []).some((u) => sanea(u.cantidad) > 0 && e.unidades.some((t) => t.id === u.tipoId)),
    ),
  );

  return {
    decisiones,
    residuales: {
      uso: usoRed,
      numPlantas: Math.max(1, resumen.plantasSobreRasante),
      cubiertaTransitable: resumen.cubiertaTransitable,
      aparatos,
      tramos,
    },
    colectorId: hayRed ? colectorId : null,
    nivelBase,
    colgadoDe,
    verticales,
    locales,
    garajes,
    cubierta: { tipo: e.cubierta.tipo, superficie_m2: Math.max(0, e.cubierta.superficie_m2 || 0) },
    unifamiliar: unifamiliar !== null,
    supuestos: { unifamiliarReparto: reparto?.supuesto ?? false },
    repartoTexto: reparto ? textoReparto(reparto) : "",
    oficinasSinNucleos,
  };
}
