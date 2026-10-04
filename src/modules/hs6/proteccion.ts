// =============================================================================
// DB-HS6 — Lo que toca el terreno, deducido de El edificio (feature-15, HS6).
//
// Función PURA y DETERMINISTA. Del edificio y las decisiones salen las partes que
// hay que proteger y cómo:
//   - SOBRE UN LOCAL NO HABITABLE: lo habitable de la planta baja que está sobre un
//     sótano cerrado no habitable (el garaje, los trasteros). Ese local es el
//     espacio de contención y su ventilación de HS 3 se considera suficiente
//     (ap. 3.2 ptos 1 y 5). La barrera, bajo el sótano (solera y muros) o en el
//     forjado de la planta baja: decisión 1;
//   - SOBRE EL TERRENO: lo habitable que apoya directamente en el terreno —la
//     planta baja sin sótano, o la parte que excede la superficie del sótano— y
//     los sótanos habitables. En zona II, barrera y además cámara ventilada o
//     despresurización; en zona I, barrera o cámara: decisión 2;
//   - lo que NO TOCA el terreno (las plantas altas) no necesita medidas propias.
//
// Criterios de proyecto (declarados en la memoria y la ficha):
//   - se toma la superficie útil como huella: la parte de la planta baja que
//     excede la del sótano apoya en el terreno;
//   - habitables: viviendas, oficinas, locales y zonas comunes; no habitables:
//     garajes, trasteros e instalaciones (Apéndice A);
//   - la cámara ventilada se dimensiona con un perímetro de 4·√superficie (planta
//     cuadrada equivalente);
//   - si un sótano con garaje está bajo una planta baja con portal o vestíbulo, se
//     supone un núcleo de escalera y ascensor que los comunica (aviso).
// =============================================================================

import { etiquetaNivel, plantasDe } from "../../lib/edificio/derivar";
import type { Edificio, UsoZona } from "../../lib/edificio/tipos";
import { parametrosEspacioContencion, requisitoDeZona, type ZonaRadon } from "./tablas";

// -----------------------------------------------------------------------------
// Decisiones
// -----------------------------------------------------------------------------

/** Dónde va la barrera cuando el garaje es el espacio de contención. */
export type PosicionBarrera = "solera" | "forjado";
/** La medida de lo que apoya en el terreno: en zona II, la adicional; en zona I, la única. */
export type MedidaTerreno = "camara" | "despresurizacion" | "barrera";
export type ViaBarrera = "lamina_tipo" | "calculo";
export type Opcion<T> = T | "habitual";

export interface DecisionesHs6 {
  posicionBarrera: Opcion<PosicionBarrera>;
  medidaTerreno: Opcion<MedidaTerreno>;
  viaBarrera: Opcion<ViaBarrera>;
}

export interface DecisionesEfectivasHs6 {
  posicionBarrera: PosicionBarrera;
  medidaTerreno: MedidaTerreno;
  viaBarrera: ViaBarrera;
}

export const DECISIONES_HS6_POR_DEFECTO: DecisionesHs6 = {
  posicionBarrera: "habitual",
  medidaTerreno: "habitual",
  viaBarrera: "habitual",
};

/**
 * Lo habitual: la barrera bajo el sótano (solera y muros), con el garaje entre
 * ella y lo habitable; en lo que apoya en el terreno, una cámara ventilada (zona
 * II) o la barrera (zona I); y la lámina tipo, que no pide cálculo.
 */
export function decisionesHabitualesHs6(zona: ZonaRadon): DecisionesEfectivasHs6 {
  return {
    posicionBarrera: "solera",
    medidaTerreno: zona === "I" ? "barrera" : "camara",
    viaBarrera: "lamina_tipo",
  };
}

/** Las opciones de la decisión 2 en cada zona. */
export function medidasTerrenoDe(zona: ZonaRadon): MedidaTerreno[] {
  return zona === "I" ? ["barrera", "camara"] : ["camara", "despresurizacion"];
}

export function resolverDecisionesHs6(d: DecisionesHs6, zona: ZonaRadon): DecisionesEfectivasHs6 {
  const h = decisionesHabitualesHs6(zona);
  const medida = d.medidaTerreno === "habitual" ? h.medidaTerreno : d.medidaTerreno;
  return {
    posicionBarrera: d.posicionBarrera === "habitual" ? h.posicionBarrera : d.posicionBarrera,
    // Una opción de la otra zona (la zona cambió) vuelve a lo habitual.
    medidaTerreno: medidasTerrenoDe(zona).includes(medida) ? medida : h.medidaTerreno,
    viaBarrera: d.viaBarrera === "habitual" ? h.viaBarrera : d.viaBarrera,
  };
}

// -----------------------------------------------------------------------------
// Forma
// -----------------------------------------------------------------------------

const HABITABLES: ReadonlySet<UsoZona> = new Set<UsoZona>([
  "viviendas",
  "vivienda_unifamiliar",
  "local_sin_uso",
  "oficinas",
  "zona_comun",
  "vestibulo",
]);

const NOMBRE_USO: Partial<Record<UsoZona, string>> = {
  viviendas: "viviendas",
  vivienda_unifamiliar: "vivienda",
  local_sin_uso: "local",
  oficinas: "oficinas",
  zona_comun: "portal",
  vestibulo: "vestíbulo",
  garaje: "garaje",
  garaje_privado: "garaje",
  trasteros: "trasteros",
  instalaciones: "instalaciones",
};

export function esHabitable(uso: UsoZona): boolean {
  return HABITABLES.has(uso);
}

/** Lo habitable de la planta baja sobre un sótano no habitable cerrado. */
export interface SobreNoHabitable {
  /** El sótano: «garaje», «trasteros»… */
  nivel: number;
  usosSotano: UsoZona[];
  /** Lo habitable que protege: «portal y local». */
  usosProtegidos: UsoZona[];
  superficie_m2: number;
  /** El sótano tiene garaje (su ventilación de HS 3 es mecánica o natural). */
  conGaraje: boolean;
}

/** Lo habitable que apoya en el terreno. */
export interface SobreTerreno {
  /** La planta: PB, o un sótano habitable. */
  nivel: number;
  usos: UsoZona[];
  superficie_m2: number;
  /** Solo es la parte de la planta baja que excede la superficie del sótano. */
  parcial: boolean;
  /** Para la cámara: perímetro de la planta cuadrada equivalente [m]. */
  perimetro_m: number;
}

export interface ProteccionHs6 {
  zona: ZonaRadon;
  decisiones: DecisionesEfectivasHs6;
  /** La HS 6 se aplica: zona del Apéndice B y algo habitable que proteger. */
  aplica: boolean;
  sobreNoHabitable: SobreNoHabitable | null;
  sobreTerreno: SobreTerreno[];
  /** Plantas con algo habitable que no tocan el terreno (las altas). */
  noTocan: { niveles: number[]; usos: UsoZona[] };
  /** Se supone un núcleo de escalera y ascensor que comunica el garaje con lo habitable. */
  nucleo: boolean;
  /** Aberturas de la cámara ventilada (si la hay) [cm²]. */
  aberturasCamara_cm2: number | null;
}

// -----------------------------------------------------------------------------

function sup(z: { superficieUtil_m2: number }): number {
  return Number.isFinite(z.superficieUtil_m2) ? Math.max(0, z.superficieUtil_m2) : 0;
}

export function proteccionDe(e: Edificio, zona: ZonaRadon, d: DecisionesHs6): ProteccionHs6 {
  const decisiones = resolverDecisionesHs6(d, zona);
  const plantas = plantasDe(e); // de arriba abajo
  const pb = plantas.find((p) => p.nivel === 0) ?? null;
  const s1 = plantas.find((p) => p.nivel === -1) ?? null;
  const sotanos = plantas.filter((p) => p.nivel < 0);

  const sobreTerreno: SobreTerreno[] = [];
  let sobreNoHabitable: SobreNoHabitable | null = null;

  // Sótanos habitables: apoyan en el terreno (muros y solera).
  for (const p of sotanos) {
    const hab = p.zonas.filter((z) => esHabitable(z.uso));
    if (hab.length === 0) continue;
    const s = hab.reduce((a, z) => a + sup(z), 0);
    sobreTerreno.push({
      nivel: p.nivel,
      usos: [...new Set(hab.map((z) => z.uso))],
      superficie_m2: s,
      parcial: false,
      perimetro_m: 4 * Math.sqrt(s),
    });
  }

  if (pb) {
    const habPb = pb.zonas.filter((z) => esHabitable(z.uso));
    const supPb = pb.zonas.reduce((a, z) => a + sup(z), 0);
    const supHabPb = habPb.reduce((a, z) => a + sup(z), 0);
    if (habPb.length > 0) {
      if (!s1) {
        sobreTerreno.push({
          nivel: 0,
          usos: [...new Set(habPb.map((z) => z.uso))],
          superficie_m2: supHabPb,
          parcial: false,
          perimetro_m: 4 * Math.sqrt(supHabPb),
        });
      } else {
        const supS1 = s1.zonas.reduce((a, z) => a + sup(z), 0);
        const habS1 = s1.zonas.some((z) => esHabitable(z.uso));
        if (!habS1) {
          sobreNoHabitable = {
            nivel: -1,
            usosSotano: [...new Set(s1.zonas.map((z) => z.uso))],
            usosProtegidos: [...new Set(habPb.map((z) => z.uso))],
            superficie_m2: Math.min(supHabPb, supS1),
            conGaraje: s1.zonas.some((z) => z.uso === "garaje" || z.uso === "garaje_privado"),
          };
        }
        // La parte de la planta baja que excede la del sótano apoya en el terreno.
        const exceso = Math.min(supHabPb, supPb - supS1);
        if (exceso > 0.5) {
          sobreTerreno.push({
            nivel: 0,
            usos: [...new Set(habPb.map((z) => z.uso))],
            superficie_m2: exceso,
            parcial: true,
            perimetro_m: 4 * Math.sqrt(exceso),
          });
        }
      }
    }
  }

  const altas = plantas.filter((p) => p.nivel > 0 && p.zonas.some((z) => esHabitable(z.uso)));
  const noTocan = {
    niveles: altas.map((p) => p.nivel).sort((a, b) => a - b),
    usos: [...new Set(altas.flatMap((p) => p.zonas.filter((z) => esHabitable(z.uso)).map((z) => z.uso)))],
  };

  const nucleo =
    sobreNoHabitable !== null &&
    sobreNoHabitable.conGaraje &&
    (pb?.zonas.some((z) => z.uso === "zona_comun" || z.uso === "vestibulo") ?? false);

  const aplica = zona !== "sin_exigencia" && (sobreNoHabitable !== null || sobreTerreno.length > 0);
  const camara = sobreTerreno.length > 0 && decisiones.medidaTerreno === "camara";
  const aberturasCamara_cm2 = camara
    ? sobreTerreno.reduce((a, t) => a + parametrosEspacioContencion().areaAberturasMin_cm2_ml * t.perimetro_m, 0)
    : null;

  return {
    zona,
    decisiones,
    aplica,
    sobreNoHabitable,
    sobreTerreno,
    noTocan,
    nucleo,
    aberturasCamara_cm2,
  };
}

/** «portal y local», «vivienda». */
export function nombresUsos(usos: UsoZona[]): string {
  const xs = [...new Set(usos.map((u) => NOMBRE_USO[u] ?? u))];
  return xs.length <= 1 ? (xs[0] ?? "") : `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`;
}

/** «P1–P3». */
export function rangoNiveles(ns: number[]): string {
  if (ns.length === 0) return "";
  const a = Math.min(...ns);
  const b = Math.max(...ns);
  return a === b ? etiquetaNivel(a) : `${etiquetaNivel(a)}–${etiquetaNivel(b)}`;
}

/** Lo que exige la zona, para la memoria y la franja. */
export function exigenciaDe(zona: ZonaRadon): ReturnType<typeof requisitoDeZona> {
  return requisitoDeZona(zona);
}
