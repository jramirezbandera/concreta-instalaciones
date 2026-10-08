// =============================================================================
// DB-HE1 — La envolvente, deducida de El edificio (feature-15, HE1).
//
// Función PURA y DETERMINISTA. Del edificio y las decisiones salen los
// cerramientos que se predimensionan, con los tipos que se eligen en El edificio
// (feature-26, `lib/constructivo/cerramientos.ts`):
//   - la FACHADA de lo que se protege, con las capas del catálogo común: la
//     habitual es la F 3.2 del CEC (½ pie de ladrillo, cámara, aislante y
//     tabique); el espesor del aislante es una decisión. Con la planta baja
//     distinta y protegida, su fachada es un segundo cerramiento, con su propio
//     aislante (K-CER.1: la planta 0; K-CER.2: cada tipo se comprueba entero);
//   - la CUBIERTA (plana invertida o inclinada, según El edificio) sobre el
//     forjado elegido (K-CER.10);
//   - el SUELO de la envolvente (con el aislante bajo el forjado, en su cara
//     fría), según lo que haya debajo de la planta más baja que se protege: un local sin uso (decisión 2: no habitable, UT, u otra
//     unidad de uso, Tabla 3.2), el garaje o un sótano no habitable (UT), o el
//     terreno (forjado sanitario sobre cámara, UT);
//   - las VENTANAS: una tipo de 1,20 × 1,40 de dos hojas, con el marco elegido
//     en El edificio, por la ec. (10) del DA DB-HE/1; el vidrio es una decisión.
//     Con la planta baja distinta y otro marco, una segunda ventana.
//
// La herramienta PROPONE: el aislante de la cubierta y del suelo, y el de la
// fachada si se deja en lo habitual, es el mayor entre el de la composición tipo
// y el mínimo que cumple el límite que manda (Ulim o, si es más exigente, la U
// máxima por condensación superficial), en pasos de 10 mm. El vidrio habitual es
// el primero que cumple. Criterios de proyecto (en la ficha):
//   - lo que se protege son las viviendas o las oficinas (sus plantas);
//   - λ y µ orientativos del CEC; Ug y Uf orientativos del CEC;
//   - fábricas con la R de la pieza del CEC (3.17), no con un λ (K-CER.5);
//   - el forjado de la cubierta y del suelo, el elegido en El edificio, con su R
//     y su µ del CEC (3.18, K-CER.11);
//   - b = 1 en el contacto con no habitables (lado seguro, DA/1 Tabla 7);
//   - el forjado sobre un local en bruto, un garaje o una cámara sanitaria no
//     comprueba fRsi (escasa producción de vapor, DA/2 §4.1.1).
// =============================================================================

import { indiceFuera, type SolCubierta, type SolFachada, type SolForjado, type SolVentana } from "../../lib/constructivo/catalogo";
import { cerramientosDe } from "../../lib/constructivo/cerramientos";
import { MATERIALES_CEC, type ClaveMaterial } from "../../lib/constructivo/materiales";
import { NOMBRE_CERRAMIENTO } from "../../lib/constructivo/textos";
import { MARCOS, type Marco } from "../../lib/constructivo/tipos";
import { etiquetaNivel, plantasDe } from "../../lib/edificio/derivar";
import type { Edificio, TipoCubierta, UsoZona } from "../../lib/edificio/tipos";
import { calcHE1, espesorMinimoCapa_m, type CapaInput, type CerramientoInput, type HE1Inputs, type HuecoInput } from "./calc";
import {
  fRsiMinDe,
  psiHuecoDe,
  rCamaraDe,
  RSI_CONDENSACION_m2K_W,
  UF_REFERENCIA_CEC,
  UG_REFERENCIA_CEC,
  type ClaseHigrometria,
  type MaterialReferencia,
  type ZonaClimatica,
} from "./tablas";

// -----------------------------------------------------------------------------
// Decisiones
// -----------------------------------------------------------------------------

/** Cómo se trata un local sin uso bajo lo que se protege. */
export type TratoLocal = "no_habitable" | "otra_unidad";
/** El vidrio de las ventanas: doble 4/16/4, bajo emisivo o bajo emisivo reforzado con borde cálido. */
export type Vidrio = "doble" | "bajo_emisivo" | "bajo_emisivo_plus";
export type Opcion<T> = T | "habitual";

export interface DecisionesHe1 {
  /** El aislante de la fachada general (o de la única). */
  aislanteFachada_mm: number | "habitual";
  /** El de la fachada de la planta baja, si es otro tipo y entra (feature-26). */
  aislanteFachadaPB_mm?: number | "habitual";
  local: Opcion<TratoLocal>;
  higrometria: Opcion<ClaseHigrometria>;
  vidrio: Opcion<Vidrio>;
  /** El aislante de la cubierta y del suelo: propuesto; solo lo cambia un arreglo. */
  aislanteCubierta_mm: number | "habitual";
  aislanteSuelo_mm: number | "habitual";
}

export interface DecisionesEfectivasHe1 {
  aislanteFachada_mm: number;
  /** null: no hay fachada de planta baja aparte. */
  aislanteFachadaPB_mm: number | null;
  local: TratoLocal;
  higrometria: ClaseHigrometria;
  vidrio: Vidrio;
  aislanteCubierta_mm: number;
  aislanteSuelo_mm: number;
}

export const DECISIONES_HE1_POR_DEFECTO: DecisionesHe1 = {
  aislanteFachada_mm: "habitual",
  aislanteFachadaPB_mm: "habitual",
  local: "habitual",
  higrometria: "habitual",
  vidrio: "habitual",
  aislanteCubierta_mm: "habitual",
  aislanteSuelo_mm: "habitual",
};

/** Espesores de partida de la composición tipo [mm]. */
export const ESPESOR_TIPO_mm = { fachada: 60, cubierta: 100, suelo: 60 } as const;
/** El paso del aislante [mm] y su máximo. */
export const PASO_AISLANTE_mm = 10;
export const MAX_AISLANTE_mm = 300;

// -----------------------------------------------------------------------------
// Forma
// -----------------------------------------------------------------------------

const PROTEGIDOS: ReadonlySet<UsoZona> = new Set<UsoZona>(["viviendas", "vivienda_unifamiliar", "oficinas"]);

const NOMBRE_USO: Partial<Record<UsoZona, string>> = {
  viviendas: "viviendas",
  vivienda_unifamiliar: "vivienda",
  oficinas: "oficinas",
};

/** Lo que hay debajo de la planta más baja que se protege. */
export type SueloEnvolvente =
  | { tipo: "local"; nivel: number }
  | { tipo: "garaje"; nivel: number }
  | { tipo: "no_habitable"; nivel: number }
  | { tipo: "zona_comun"; nivel: number }
  | { tipo: "terreno"; nivel: number };

export interface EnvolventeHe1 {
  /** «viviendas», «oficinas». */
  usos: UsoZona[];
  niveles: number[];
  cubierta: TipoCubierta;
  suelo: SueloEnvolvente;
}

export function envolventeDe(e: Edificio): EnvolventeHe1 {
  const plantas = plantasDe(e); // de arriba abajo
  let prot = plantas.filter((p) => p.zonas.some((z) => PROTEGIDOS.has(z.uso)));
  // Sin viviendas ni oficinas, se protege la planta baja (un local).
  if (prot.length === 0) prot = plantas.filter((p) => p.nivel === 0);
  const niveles = prot.map((p) => p.nivel).sort((a, b) => a - b);
  const usos = [...new Set(prot.flatMap((p) => p.zonas.filter((z) => PROTEGIDOS.has(z.uso)).map((z) => z.uso)))];
  const L = niveles[0] ?? 0;
  const debajo = plantas.find((p) => p.nivel === L - 1) ?? null;
  let suelo: SueloEnvolvente;
  if (!debajo) suelo = { tipo: "terreno", nivel: L };
  else if (debajo.zonas.some((z) => z.uso === "local_sin_uso")) suelo = { tipo: "local", nivel: L };
  else if (debajo.zonas.some((z) => z.uso === "garaje" || z.uso === "garaje_privado")) suelo = { tipo: "garaje", nivel: L };
  else if (debajo.zonas.every((z) => z.uso === "zona_comun" || z.uso === "vestibulo")) suelo = { tipo: "zona_comun", nivel: L };
  else suelo = { tipo: "no_habitable", nivel: L };
  return { usos, niveles, cubierta: e.cubierta.tipo, suelo };
}

/** «viviendas», «vivienda», «oficinas». */
export function nombresProtegidos(usos: UsoZona[]): string {
  const xs = [...new Set(usos.map((u) => NOMBRE_USO[u] ?? u))];
  return xs.length <= 1 ? (xs[0] ?? "planta baja") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`;
}

/** «P1–P3». */
export function rangoNiveles(ns: number[]): string {
  if (ns.length === 0) return "";
  const a = Math.min(...ns);
  const b = Math.max(...ns);
  return a === b ? etiquetaNivel(a) : `${etiquetaNivel(a)}–${etiquetaNivel(b)}`;
}

// -----------------------------------------------------------------------------
// Composiciones tipo (de INTERIOR a EXTERIOR)
// -----------------------------------------------------------------------------

/**
 * Ids de los cerramientos (estables: son los ids de los elementos). «fachada-pb»
 * y «ventanas-pb» solo existen con la planta baja distinta y protegida.
 */
export type RolCerramiento = "fachada" | "fachada-pb" | "cubierta" | "suelo" | "ventanas" | "ventanas-pb";
export type RolOpaco = Exclude<RolCerramiento, "ventanas" | "ventanas-pb">;
export type ClaseCerramiento = "fachada" | "cubierta" | "suelo" | "ventanas";

/** Qué clase de cerramiento es un rol: la de la planta baja es una fachada o unas ventanas más. */
export function claseDe(rol: RolCerramiento): ClaseCerramiento {
  return rol === "fachada-pb" ? "fachada" : rol === "ventanas-pb" ? "ventanas" : rol;
}

export function esRol(id: string | null): id is RolCerramiento {
  return id === "fachada" || id === "fachada-pb" || id === "cubierta" || id === "suelo" || id === "ventanas" || id === "ventanas-pb";
}

/** La capa aislante de cada cerramiento opaco. */
export function capaAislante(rol: RolOpaco): string {
  return `${rol}-aislante`;
}

// -----------------------------------------------------------------------------
// Los tipos de El edificio (feature-26)
// -----------------------------------------------------------------------------

export interface FachadaHe1 {
  rol: "fachada" | "fachada-pb";
  nombre: string;
  sol: SolFachada;
  /** Las plantas protegidas que la llevan. */
  niveles: number[];
}

export interface VentanaHe1 {
  rol: "ventanas" | "ventanas-pb";
  nombre: string;
  sol: SolVentana;
  marco: Marco;
}

export interface TiposHe1 {
  fachadas: FachadaHe1[];
  ventanas: VentanaHe1[];
  cubierta: SolCubierta;
  forjado: SolForjado;
}

/**
 * Los tipos que entran en HE1. La fachada y la ventana de la planta baja solo
 * son cerramientos aparte si la planta 0 se protege y son otras: para HE1, una
 * ventana es otra si cambia el marco (el vidrio es una decisión de HE1 y el tipo
 * acústico no cambia la UH).
 */
export function tiposHe1(e: Edificio, env: EnvolventeHe1): TiposHe1 {
  const c = cerramientosDe(e);
  const altas = env.niveles.filter((n) => n !== 0);
  const conPB = env.niveles.includes(0);

  const fs: { sol: SolFachada; niveles: number[] }[] = [];
  if (altas.length > 0 || !conPB) fs.push({ sol: c.fachada.sol, niveles: altas });
  if (conPB) {
    const pb = (c.fachadaPB ?? c.fachada).sol;
    const misma = fs.find((f) => f.sol.id === pb.id);
    if (misma) misma.niveles = [0, ...misma.niveles];
    else fs.push({ sol: pb, niveles: [0] });
  }

  const vs: { sol: SolVentana; marco: Marco }[] = [];
  if (altas.length > 0 || !conPB) vs.push({ sol: c.ventana.sol, marco: c.ventana.marco });
  if (conPB) {
    const pb = c.ventanaPB ?? c.ventana;
    if (!vs.some((v) => v.marco === pb.marco)) vs.push({ sol: pb.sol, marco: pb.marco });
  }

  return {
    fachadas: fs.map((f, i) => ({
      rol: i === 0 ? "fachada" : "fachada-pb",
      nombre: i === 0 ? NOMBRE_CERRAMIENTO.fachada : NOMBRE_CERRAMIENTO.fachadaPB,
      ...f,
    })),
    ventanas: vs.map((v, i) => ({
      rol: i === 0 ? "ventanas" : "ventanas-pb",
      nombre: i === 0 ? NOMBRE_CERRAMIENTO.ventana : NOMBRE_CERRAMIENTO.ventanaPB,
      ...v,
    })),
    cubierta: c.cubierta.sol,
    forjado: c.forjado.sol,
  };
}

/** El material de HE1 de cada material del catálogo (para el dibujo de la sección). */
const MATERIAL_HE1: Partial<Record<ClaveMaterial, MaterialReferencia>> = {
  mortero: "mortero_cemento",
  enlucido: "enlucido_yeso",
  pyl: "placa_yeso_laminado",
  lp_medio_pie: "ladrillo_ceramico_perforado",
  lp_un_pie: "ladrillo_ceramico_perforado",
  lhd: "ladrillo_ceramico_hueco",
  bh_ad_140: "bloque_hormigon",
  xps: "xps",
  eps: "eps",
  lana_mineral: "lana_mineral",
};

/**
 * Las capas de HE1 de una fachada del catálogo, con su aislante de `e_mm`. Cada
 * capa lleva la R o el λ y el µ del CEC; la cámara sin ventilar, la R de la
 * Tabla 2 del DA/1 por su espesor; lo que queda por fuera de una cámara muy
 * ventilada no cuenta (K-CER.9).
 */
export function capasDeFachada(f: SolFachada, prefijo: string, e_mm: number): CapaInput[] {
  const iFuera = indiceFuera(f);
  return f.capas.map((c, i): CapaInput => {
    const clave: ClaveMaterial = c.rol === "AT" ? f.aislante : c.material;
    const m = MATERIALES_CEC[clave];
    const espesor_m = (c.rol === "AT" ? e_mm : c.espesor_mm) / 1000;
    const base = { id: `${prefijo}-${c.clave}`, nombre: (c.rol !== "AT" && c.nombre) || m.nombre, material: MATERIAL_HE1[clave], espesor_m };
    if (iFuera >= 0 && i >= iFuera) return { ...base, fueraDelCalculo: true };
    const t = m.termico;
    switch (t.tipo) {
      case "R":
        return { ...base, resistencia_m2K_W: t.R_m2K_W, mu: m.mu };
      case "camara":
        return { ...base, resistencia_m2K_W: rCamaraDe(espesor_m, "horizontal"), mu: m.mu };
      case "lambda":
        return { ...base, lambda_W_mK: t.lambda_W_mK, mu: m.mu };
      case "fuera":
        return { ...base, fueraDelCalculo: true };
    }
  });
}

/** Una fachada del catálogo como cerramiento de HE1. */
export function fachadaDe(f: SolFachada, e_mm: number, id = "fachada", nombre = "Fachada"): CerramientoInput {
  return {
    id,
    nombre,
    tipoElemento: "muro_suelo_exterior",
    direccionFlujo: "horizontal",
    camaraMuyVentilada: indiceFuera(f) >= 0,
    capas: capasDeFachada(f, id, e_mm),
  };
}

/** El forjado de El edificio como capa: su R y su µ del CEC (3.18, K-CER.11), con su canto. */
function capaForjado(id: string, nombre: string, f: SolForjado): CapaInput {
  return { id, nombre, material: "hormigon_armado", espesor_m: f.canto_mm / 1000, resistencia_m2K_W: f.R, mu: f.mu };
}

export function cubiertaDe(tipo: TipoCubierta, e_mm: number, forjado: SolForjado): CerramientoInput {
  const capas: CapaInput[] =
    tipo === "inclinada"
      ? [
          { id: "cubierta-enlucido", nombre: "Enlucido de yeso", material: "enlucido_yeso", espesor_m: 0.015 },
          capaForjado("cubierta-forjado", "Forjado inclinado", forjado),
          { id: capaAislante("cubierta"), nombre: "XPS", material: "xps", espesor_m: e_mm / 1000 },
          { id: "cubierta-mortero", nombre: "Capa de mortero", material: "mortero_cemento", espesor_m: 0.03 },
        ]
      : [
          { id: "cubierta-enlucido", nombre: "Enlucido de yeso", material: "enlucido_yeso", espesor_m: 0.015 },
          capaForjado("cubierta-forjado", "Forjado", forjado),
          { id: "cubierta-pendientes", nombre: "Hormigón de pendientes", material: "hormigon_masa_aridos_densos", materialDifusion: "hormigon_armado", espesor_m: 0.1 },
          // Lámina bituminosa: Sd del producto (orientativo, criterio).
          { id: "cubierta-impermeabilizacion", nombre: "Impermeabilización", material: "betun_lamina_asfaltica", espesor_m: 0.004, sd_m: 50 },
          { id: capaAislante("cubierta"), nombre: "XPS", material: "xps", espesor_m: e_mm / 1000 },
        ];
  return {
    id: "cubierta",
    nombre: "Cubierta",
    tipoElemento: "cubierta_exterior",
    direccionFlujo: "ascendente",
    capas,
  };
}

/**
 * El suelo: el aislante va BAJO el forjado, en su cara fría (lana mineral en el
 * techo del local, del garaje o del sótano; XPS en la cámara sanitaria). Con el
 * aislante sobre el forjado, bajo el mortero, Glaser marca condensación en su
 * cara inferior con el aire exterior de enero bajo el forjado (lado seguro).
 */
function suelo(s: SueloEnvolvente, local: TratoLocal, e_mm: number, forjado: SolForjado): CerramientoInput {
  const capas: CapaInput[] = [
    { id: "suelo-pavimento", nombre: "Pavimento", material: "baldosa_ceramica_gres", materialDifusion: "mortero_cemento", espesor_m: 0.02 },
    { id: "suelo-mortero", nombre: "Mortero", material: "mortero_cemento", espesor_m: 0.05 },
    capaForjado("suelo-forjado", "Forjado", forjado),
    s.tipo === "terreno"
      ? { id: capaAislante("suelo"), nombre: "XPS", material: "xps", espesor_m: e_mm / 1000 }
      : { id: capaAislante("suelo"), nombre: "Lana mineral", material: "lana_mineral", espesor_m: e_mm / 1000 },
  ];
  const particion = (s.tipo === "local" && local === "otra_unidad") || s.tipo === "zona_comun";
  return particion
    ? {
        id: "suelo",
        nombre: "Suelo",
        tipoElemento: "particion_interior",
        direccionFlujo: "descendente",
        caraInterior: true,
        particion: { relacion: s.tipo === "zona_comun" ? "zona_comun" : "distinto_uso", orientacion: "horizontal" },
        capas,
      }
    : {
        id: "suelo",
        nombre: "Suelo",
        tipoElemento: "contacto_no_habitable_terreno",
        direccionFlujo: "descendente",
        b: 1,
        fRsiExento: true,
        capas,
      };
}

/**
 * Ug de cada vidrio (CEC) y su fila de la Tabla 10 del DA/1 para la Ψ, que depende del marco.
 * `tipo` es el vidrio sin las lunas: en las fichas, junto al tipo acústico de la ventana
 * (4-cámara-6…), que es el que fija las lunas (feature-26).
 */
export const VIDRIOS: Record<
  Vidrio,
  { ug: number; filaPsi: "doble_o_triple" | "doble_be_o_triple_2be"; separadorMejorado: boolean; nombre: string; corto: string; tipo: string }
> = {
  doble: {
    ug: UG_REFERENCIA_CEC.datos.doble_4_16_4.normal,
    filaPsi: "doble_o_triple",
    separadorMejorado: false,
    nombre: "doble 4/16/4",
    corto: "4/16/4",
    tipo: "doble",
  },
  bajo_emisivo: {
    ug: UG_REFERENCIA_CEC.datos.doble_4_16_4.be_0_03,
    filaPsi: "doble_be_o_triple_2be",
    separadorMejorado: false,
    nombre: "doble 4/16/4 bajo emisivo",
    corto: "bajo emisivo",
    tipo: "doble bajo emisivo",
  },
  bajo_emisivo_plus: {
    ug: UG_REFERENCIA_CEC.datos.doble_4_16_4.be_menor_0_03,
    filaPsi: "doble_be_o_triple_2be",
    separadorMejorado: true,
    nombre: "doble 4/16/4 bajo emisivo reforzado con borde cálido",
    corto: "bajo emisivo + borde cálido",
    tipo: "doble bajo emisivo reforzado con borde cálido",
  },
};

export const VENTANA_TIPO = { ancho_m: 1.2, alto_m: 1.4, hojas: 2 as const };

/** La ventana tipo con un vidrio y un marco: Uf del 3.16 del CEC y Ψ de la Tabla 10 por la familia del marco. */
export function huecoDe(v: Vidrio, marco: Marco = "pvc_tres_camaras"): HuecoInput {
  return {
    ...VENTANA_TIPO,
    ug_W_m2K: VIDRIOS[v].ug,
    uf_W_m2K: UF_REFERENCIA_CEC.datos.uf_W_m2K[marco],
    psi_W_mK: psiHuecoDe(MARCOS[marco].familiaPsi, VIDRIOS[v].filaPsi, VIDRIOS[v].separadorMejorado),
  };
}

function ventanasDe(v: Vidrio, w: Pick<VentanaHe1, "rol" | "nombre" | "marco">): CerramientoInput {
  return { id: w.rol, nombre: w.nombre, tipoElemento: "hueco", direccionFlujo: "horizontal", capas: [], hueco: huecoDe(v, w.marco) };
}

// -----------------------------------------------------------------------------
// La propuesta: espesores y vidrio habituales
// -----------------------------------------------------------------------------

export interface ClimaHe1 {
  tempExteriorEnero_C?: number;
  hrExterior_pct?: number;
}

function inputsDe(cers: CerramientoInput[], zona: ZonaClimatica, clase: ClaseHigrometria, clima: ClimaHe1): HE1Inputs {
  return {
    zonaClimatica: zona,
    claseHigrometria: clase,
    tempExteriorEnero_C: clima.tempExteriorEnero_C,
    hrExterior_pct: clima.hrExterior_pct,
    cerramientos: cers,
  };
}

/** El límite que manda en un cerramiento opaco: Ulim o, si es menor, la U máxima por fRsi. */
export function limiteQueManda(
  ulim: number | null,
  fRsiAplica: boolean,
  clase: ClaseHigrometria,
  zona: ZonaClimatica,
): { u: number; por: "ulim" | "fRsi" } | null {
  const uFRsi = fRsiAplica ? (1 - fRsiMinDe(clase, zona)) / RSI_CONDENSACION_m2K_W : Number.POSITIVE_INFINITY;
  if (ulim === null) return Number.isFinite(uFRsi) ? { u: uFRsi, por: "fRsi" } : null;
  return uFRsi < ulim ? { u: uFRsi, por: "fRsi" } : { u: ulim, por: "ulim" };
}

/** Espesor mínimo del aislante [mm], redondeado al paso, para cumplir el límite que manda. */
export function minimoAislante_mm(cer: CerramientoInput, zona: ZonaClimatica, clase: ClaseHigrometria, clima: ClimaHe1): number | null {
  const r = calcHE1(inputsDe([cer], zona, clase, clima)).porCerramiento[0];
  const lim = limiteQueManda(r.ulim_W_m2K, r.fRsiAplica, clase, zona);
  const capa = cer.capas.find((c) => c.id.endsWith("-aislante"));
  if (!lim || !capa) return null;
  const e = espesorMinimoCapa_m(r, capa.id, lim.u);
  if (e === null) return null;
  // Un margen de 1e-9 evita subir un paso por ruido de coma flotante.
  return Math.ceil(e * 1000 / PASO_AISLANTE_mm - 1e-9) * PASO_AISLANTE_mm;
}

/** El vidrio habitual: el primero con el que cumplen todas las ventanas (bajo emisivo, o reforzado con borde cálido). */
export function vidrioHabitual(zona: ZonaClimatica, clase: ClaseHigrometria, clima: ClimaHe1, ventanas: VentanaHe1[]): Vidrio {
  for (const v of ["bajo_emisivo", "bajo_emisivo_plus"] as const) {
    const r = calcHE1(inputsDe(ventanas.map((w) => ventanasDe(v, w)), zona, clase, clima));
    if (r.porCerramiento.every((x) => x.cumpleU)) return v;
  }
  return "bajo_emisivo_plus";
}

export interface PropuestaHe1 {
  envolvente: EnvolventeHe1;
  /** Los tipos de El edificio que entran. */
  tipos: TiposHe1;
  decisiones: DecisionesEfectivasHe1;
  /** Lo habitual de cada decisión (para «Lo habitual» y para guardar «habitual»). */
  habituales: DecisionesEfectivasHe1;
  /** El mínimo que cumple de cada aislante [mm] (null si no se puede invertir). */
  minimos: Partial<Record<RolOpaco, number | null>>;
  inputs: HE1Inputs;
}

export function propuestaHe1(e: Edificio, zona: ZonaClimatica, d: DecisionesHe1, clima: ClimaHe1): PropuestaHe1 {
  const env = envolventeDe(e);
  const tipos = tiposHe1(e, env);
  const higrometria: ClaseHigrometria = d.higrometria === "habitual" ? "clase_3_o_inferior" : d.higrometria;
  const local: TratoLocal = d.local === "habitual" ? "no_habitable" : d.local;
  const minimos: Partial<Record<RolOpaco, number | null>> = {};
  for (const f of tipos.fachadas) {
    minimos[f.rol] = minimoAislante_mm(fachadaDe(f.sol, ESPESOR_TIPO_mm.fachada, f.rol, f.nombre), zona, higrometria, clima);
  }
  minimos.cubierta = minimoAislante_mm(cubiertaDe(env.cubierta, ESPESOR_TIPO_mm.cubierta, tipos.forjado), zona, higrometria, clima);
  minimos.suelo = minimoAislante_mm(suelo(env.suelo, local, ESPESOR_TIPO_mm.suelo, tipos.forjado), zona, higrometria, clima);
  const propio = (rol: RolOpaco) => {
    const clase = claseDe(rol) as keyof typeof ESPESOR_TIPO_mm;
    return Math.min(MAX_AISLANTE_mm, Math.max(ESPESOR_TIPO_mm[clase], minimos[rol] ?? 0));
  };
  const hayPB = tipos.fachadas.some((f) => f.rol === "fachada-pb");
  const habituales: DecisionesEfectivasHe1 = {
    aislanteFachada_mm: propio("fachada"),
    aislanteFachadaPB_mm: hayPB ? propio("fachada-pb") : null,
    local: "no_habitable",
    higrometria: "clase_3_o_inferior",
    vidrio: vidrioHabitual(zona, higrometria, clima, tipos.ventanas),
    aislanteCubierta_mm: propio("cubierta"),
    aislanteSuelo_mm: propio("suelo"),
  };
  const pb = d.aislanteFachadaPB_mm ?? "habitual";
  const decisiones: DecisionesEfectivasHe1 = {
    aislanteFachada_mm: d.aislanteFachada_mm === "habitual" ? habituales.aislanteFachada_mm : d.aislanteFachada_mm,
    aislanteFachadaPB_mm: hayPB ? (pb === "habitual" ? habituales.aislanteFachadaPB_mm : pb) : null,
    local,
    higrometria,
    vidrio: d.vidrio === "habitual" ? habituales.vidrio : d.vidrio,
    aislanteCubierta_mm: d.aislanteCubierta_mm === "habitual" ? habituales.aislanteCubierta_mm : d.aislanteCubierta_mm,
    aislanteSuelo_mm: d.aislanteSuelo_mm === "habitual" ? habituales.aislanteSuelo_mm : d.aislanteSuelo_mm,
  };
  const cers = [
    ...tipos.fachadas.map((f) => fachadaDe(f.sol, aislanteDe(decisiones, f.rol), f.rol, f.nombre)),
    cubiertaDe(env.cubierta, decisiones.aislanteCubierta_mm, tipos.forjado),
    suelo(env.suelo, decisiones.local, decisiones.aislanteSuelo_mm, tipos.forjado),
    ...tipos.ventanas.map((w) => ventanasDe(decisiones.vidrio, w)),
  ];
  return { envolvente: env, tipos, decisiones, habituales, minimos, inputs: inputsDe(cers, zona, higrometria, clima) };
}

/** El aislante decidido de un cerramiento opaco [mm]. */
export function aislanteDe(d: DecisionesEfectivasHe1, rol: RolOpaco): number {
  switch (rol) {
    case "fachada":
      return d.aislanteFachada_mm;
    case "fachada-pb":
      return d.aislanteFachadaPB_mm ?? 0;
    case "cubierta":
      return d.aislanteCubierta_mm;
    case "suelo":
      return d.aislanteSuelo_mm;
  }
}

/** El campo del estado que guarda el aislante de un cerramiento opaco. */
export const CAMPO_AISLANTE = {
  fachada: "aislanteFachada_mm",
  "fachada-pb": "aislanteFachadaPB_mm",
  cubierta: "aislanteCubierta_mm",
  suelo: "aislanteSuelo_mm",
} as const satisfies Record<RolOpaco, keyof DecisionesEfectivasHe1>;
