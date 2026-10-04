// =============================================================================
// DB-HE1 — La envolvente, deducida de El edificio (feature-15, HE1).
//
// Función PURA y DETERMINISTA. Del edificio y las decisiones salen los cuatro
// cerramientos que se predimensionan, cada uno con una composición tipo:
//   - la FACHADA de lo que se protege (½ pie de ladrillo, aislante, cámara y
//     tabique): el espesor del aislante es la decisión 1;
//   - la CUBIERTA (plana invertida o inclinada, según El edificio);
//   - el SUELO de la envolvente (con el aislante bajo el forjado, en su cara
//     fría), según lo que haya debajo de la planta más baja que se protege: un local sin uso (decisión 2: no habitable, UT, u otra
//     unidad de uso, Tabla 3.2), el garaje o un sótano no habitable (UT), o el
//     terreno (forjado sanitario sobre cámara, UT);
//   - las VENTANAS: una tipo de 1,20 × 1,40 de dos hojas, PVC, por la ec. (10)
//     del DA DB-HE/1; el vidrio es la decisión 4.
//
// La herramienta PROPONE: el aislante de la cubierta y del suelo, y el de la
// fachada si se deja en lo habitual, es el mayor entre el de la composición tipo
// y el mínimo que cumple el límite que manda (Ulim o, si es más exigente, la U
// máxima por condensación superficial), en pasos de 10 mm. El vidrio habitual es
// el primero que cumple. Criterios de proyecto (en la ficha):
//   - lo que se protege son las viviendas o las oficinas (sus plantas);
//   - λ y µ orientativos del CEC; Ug y Uf orientativos del CEC;
//   - forjados con λ del hormigón armado (lado seguro);
//   - b = 1 en el contacto con no habitables (lado seguro, DA/1 Tabla 7);
//   - el forjado sobre un local en bruto, un garaje o una cámara sanitaria no
//     comprueba fRsi (escasa producción de vapor, DA/2 §4.1.1).
// =============================================================================

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
  aislanteFachada_mm: number | "habitual";
  local: Opcion<TratoLocal>;
  higrometria: Opcion<ClaseHigrometria>;
  vidrio: Opcion<Vidrio>;
  /** El aislante de la cubierta y del suelo: propuesto; solo lo cambia un arreglo. */
  aislanteCubierta_mm: number | "habitual";
  aislanteSuelo_mm: number | "habitual";
}

export interface DecisionesEfectivasHe1 {
  aislanteFachada_mm: number;
  local: TratoLocal;
  higrometria: ClaseHigrometria;
  vidrio: Vidrio;
  aislanteCubierta_mm: number;
  aislanteSuelo_mm: number;
}

export const DECISIONES_HE1_POR_DEFECTO: DecisionesHe1 = {
  aislanteFachada_mm: "habitual",
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

/** Ids de los cuatro cerramientos (estables: son los ids de los elementos). */
export type RolCerramiento = "fachada" | "cubierta" | "suelo" | "ventanas";

/** La capa aislante de cada cerramiento opaco. */
export const CAPA_AISLANTE: Record<Exclude<RolCerramiento, "ventanas">, string> = {
  fachada: "fachada-aislante",
  cubierta: "cubierta-aislante",
  suelo: "suelo-aislante",
};

function fachada(e_mm: number): CerramientoInput {
  return {
    id: "fachada",
    nombre: "Fachada",
    tipoElemento: "muro_suelo_exterior",
    direccionFlujo: "horizontal",
    capas: [
      { id: "fachada-enlucido", nombre: "Enlucido de yeso", material: "enlucido_yeso", materialDifusion: "placa_yeso_laminado", espesor_m: 0.015 },
      { id: "fachada-tabique", nombre: "Tabique de ladrillo hueco", material: "ladrillo_ceramico_hueco", espesor_m: 0.07 },
      {
        id: "fachada-camara",
        nombre: "Cámara de aire sin ventilar",
        materialDifusion: "camara_aire_sin_ventilar",
        espesor_m: 0.03,
        resistencia_m2K_W: rCamaraDe(0.03, "horizontal"),
      },
      { id: CAPA_AISLANTE.fachada, nombre: "XPS", material: "xps", espesor_m: e_mm / 1000 },
      { id: "fachada-ladrillo", nombre: "½ pie de ladrillo perforado", material: "ladrillo_ceramico_perforado", espesor_m: 0.115 },
      { id: "fachada-enfoscado", nombre: "Enfoscado de mortero", material: "mortero_cemento", espesor_m: 0.015 },
    ],
  };
}

function cubierta(tipo: TipoCubierta, e_mm: number): CerramientoInput {
  const capas: CapaInput[] =
    tipo === "inclinada"
      ? [
          { id: "cubierta-enlucido", nombre: "Enlucido de yeso", material: "enlucido_yeso", materialDifusion: "placa_yeso_laminado", espesor_m: 0.015 },
          { id: "cubierta-forjado", nombre: "Forjado inclinado", material: "hormigon_armado", espesor_m: 0.25 },
          { id: CAPA_AISLANTE.cubierta, nombre: "XPS", material: "xps", espesor_m: e_mm / 1000 },
          { id: "cubierta-mortero", nombre: "Capa de mortero", material: "mortero_cemento", espesor_m: 0.03 },
        ]
      : [
          { id: "cubierta-enlucido", nombre: "Enlucido de yeso", material: "enlucido_yeso", materialDifusion: "placa_yeso_laminado", espesor_m: 0.015 },
          { id: "cubierta-forjado", nombre: "Forjado", material: "hormigon_armado", espesor_m: 0.3 },
          { id: "cubierta-pendientes", nombre: "Hormigón de pendientes", material: "hormigon_masa_aridos_densos", materialDifusion: "hormigon_armado", espesor_m: 0.1 },
          // Lámina bituminosa: Sd del producto (orientativo, criterio).
          { id: "cubierta-impermeabilizacion", nombre: "Impermeabilización", material: "betun_lamina_asfaltica", espesor_m: 0.004, sd_m: 50 },
          { id: CAPA_AISLANTE.cubierta, nombre: "XPS", material: "xps", espesor_m: e_mm / 1000 },
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
function suelo(s: SueloEnvolvente, local: TratoLocal, e_mm: number): CerramientoInput {
  const capas: CapaInput[] = [
    { id: "suelo-pavimento", nombre: "Pavimento", material: "baldosa_ceramica_gres", materialDifusion: "mortero_cemento", espesor_m: 0.02 },
    { id: "suelo-mortero", nombre: "Mortero", material: "mortero_cemento", espesor_m: 0.05 },
    { id: "suelo-forjado", nombre: "Forjado", material: "hormigon_armado", espesor_m: 0.3 },
    s.tipo === "terreno"
      ? { id: CAPA_AISLANTE.suelo, nombre: "XPS", material: "xps", espesor_m: e_mm / 1000 }
      : { id: CAPA_AISLANTE.suelo, nombre: "Lana mineral", material: "lana_mineral", espesor_m: e_mm / 1000 },
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

/** Ug y Ψ de cada vidrio (CEC y DA/1 Tabla 10), con marco de PVC. */
export const VIDRIOS: Record<Vidrio, { ug: number; psi: number; nombre: string; corto: string }> = {
  doble: {
    ug: UG_REFERENCIA_CEC.datos.doble_4_16_4.normal,
    psi: psiHuecoDe("madera_plastico", "doble_o_triple", false),
    nombre: "doble 4/16/4",
    corto: "4/16/4",
  },
  bajo_emisivo: {
    ug: UG_REFERENCIA_CEC.datos.doble_4_16_4.be_0_03,
    psi: psiHuecoDe("madera_plastico", "doble_be_o_triple_2be", false),
    nombre: "doble 4/16/4 bajo emisivo",
    corto: "bajo emisivo",
  },
  bajo_emisivo_plus: {
    ug: UG_REFERENCIA_CEC.datos.doble_4_16_4.be_menor_0_03,
    psi: psiHuecoDe("madera_plastico", "doble_be_o_triple_2be", true),
    nombre: "doble 4/16/4 bajo emisivo reforzado con borde cálido",
    corto: "bajo emisivo + borde cálido",
  },
};

export const VENTANA_TIPO = { ancho_m: 1.2, alto_m: 1.4, hojas: 2 as const };

export function huecoDe(v: Vidrio): HuecoInput {
  return {
    ...VENTANA_TIPO,
    ug_W_m2K: VIDRIOS[v].ug,
    uf_W_m2K: UF_REFERENCIA_CEC.datos.uf_W_m2K.pvc_tres_camaras,
    psi_W_mK: VIDRIOS[v].psi,
  };
}

function ventanas(v: Vidrio): CerramientoInput {
  return { id: "ventanas", nombre: "Ventanas", tipoElemento: "hueco", direccionFlujo: "horizontal", capas: [], hueco: huecoDe(v) };
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

/** El vidrio habitual: el primero que cumple (bajo emisivo, o reforzado con borde cálido). */
export function vidrioHabitual(zona: ZonaClimatica, clase: ClaseHigrometria, clima: ClimaHe1): Vidrio {
  for (const v of ["bajo_emisivo", "bajo_emisivo_plus"] as const) {
    const r = calcHE1(inputsDe([ventanas(v)], zona, clase, clima)).porCerramiento[0];
    if (r.cumpleU) return v;
  }
  return "bajo_emisivo_plus";
}

export interface PropuestaHe1 {
  envolvente: EnvolventeHe1;
  decisiones: DecisionesEfectivasHe1;
  /** Lo habitual de cada decisión (para «Lo habitual» y para guardar «habitual»). */
  habituales: DecisionesEfectivasHe1;
  /** El mínimo que cumple de cada aislante [mm] (null si no se puede invertir). */
  minimos: Record<Exclude<RolCerramiento, "ventanas">, number | null>;
  inputs: HE1Inputs;
}

export function propuestaHe1(e: Edificio, zona: ZonaClimatica, d: DecisionesHe1, clima: ClimaHe1): PropuestaHe1 {
  const env = envolventeDe(e);
  const higrometria: ClaseHigrometria = d.higrometria === "habitual" ? "clase_3_o_inferior" : d.higrometria;
  const local: TratoLocal = d.local === "habitual" ? "no_habitable" : d.local;
  const minimos = {
    fachada: minimoAislante_mm(fachada(ESPESOR_TIPO_mm.fachada), zona, higrometria, clima),
    cubierta: minimoAislante_mm(cubierta(env.cubierta, ESPESOR_TIPO_mm.cubierta), zona, higrometria, clima),
    suelo: minimoAislante_mm(suelo(env.suelo, local, ESPESOR_TIPO_mm.suelo), zona, higrometria, clima),
  };
  const propio = (rol: keyof typeof minimos) => Math.min(MAX_AISLANTE_mm, Math.max(ESPESOR_TIPO_mm[rol], minimos[rol] ?? 0));
  const habituales: DecisionesEfectivasHe1 = {
    aislanteFachada_mm: propio("fachada"),
    local: "no_habitable",
    higrometria: "clase_3_o_inferior",
    vidrio: vidrioHabitual(zona, higrometria, clima),
    aislanteCubierta_mm: propio("cubierta"),
    aislanteSuelo_mm: propio("suelo"),
  };
  const decisiones: DecisionesEfectivasHe1 = {
    aislanteFachada_mm: d.aislanteFachada_mm === "habitual" ? habituales.aislanteFachada_mm : d.aislanteFachada_mm,
    local,
    higrometria,
    vidrio: d.vidrio === "habitual" ? habituales.vidrio : d.vidrio,
    aislanteCubierta_mm: d.aislanteCubierta_mm === "habitual" ? habituales.aislanteCubierta_mm : d.aislanteCubierta_mm,
    aislanteSuelo_mm: d.aislanteSuelo_mm === "habitual" ? habituales.aislanteSuelo_mm : d.aislanteSuelo_mm,
  };
  const cers = [
    fachada(decisiones.aislanteFachada_mm),
    cubierta(env.cubierta, decisiones.aislanteCubierta_mm),
    suelo(env.suelo, decisiones.local, decisiones.aislanteSuelo_mm),
    ventanas(decisiones.vidrio),
  ];
  return { envolvente: env, decisiones, habituales, minimos, inputs: inputsDe(cers, zona, higrometria, clima) };
}
