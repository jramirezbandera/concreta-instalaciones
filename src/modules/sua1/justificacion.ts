// =============================================================================
// DB-SUA, SUA 1 — La justificación (feature-20): las escaleras que tiene el
// edificio, peldaño a peldaño por planta; las barreras por la cota de cada
// planta; las rampas; la resbaladicidad (solo oficinas) y la limpieza de los
// acristalamientos (solo vivienda). PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-sua1.md):
//   - el interior de la vivienda (y el garaje de la unifamiliar) es de uso
//     restringido (4.1); las zonas comunes, el garaje de la plurifamiliar y las
//     oficinas, de uso general (4.2). En vivienda todo es uso privado: lo que
//     lleva a 17,5 cm y 2,25 m es no tener ascensor como alternativa (A4.13);
//   - la contrahuella sale de la altura de cada planta: n = ⌈h / 17,5⌉ peldaños
//     (18,5 en la escalera interior) y C = h / n (K2, criterio);
//   - la variación de ±1 cm se comprueba entre cualquier par de plantas de la
//     misma escalera (INTERPRETACIÓN del lado de la seguridad);
//   - la anchura mínima es 1,00 m: Residencial Vivienda «incluso escalera de
//     comunicación con aparcamiento» y, en oficinas, la nota (2) de la tabla 4.1
//     (la escalera llega a la planta de entrada, que es zona accesible);
//   - el ascensor, si lo hay, llega a todas las plantas, también al garaje
//     (INTERPRETACIÓN); sin dato se supone el que exige SUA 9 y se avisa solo si
//     cambia el resultado;
//   - la diferencia de cota de cada planta es la cota de su suelo sobre la
//     rasante (K5); hasta 6 m incluidos, 0,90 m; por encima, 1,10 m (3.2.1);
//   - la limpieza de acristalamientos se aplica a las plantas de vivienda con
//     la cota del suelo más 2,20 m por encima de 6 m (K10).
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { PlantaFisica } from "../../lib/edificio/derivar";
import type { TipoCubierta } from "../../lib/edificio/tipos";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import type { DatoSi, ElementoSi, JustificacionSiBase } from "../si/tipos";
import { edificioSua, type EdificioSua, type EscaleraSua } from "../sua/edificio";
import {
  habitualesFijos,
  resolverSua1,
  type Carpinteria,
  type DecisionesSua1,
  type Ojo,
  type Sua1Estado,
  type Tramos,
} from "./estado";
import {
  alturaBarreraMin_m,
  alturaTramoMax_m,
  contrahuellaMax_cm,
  CRITERIOS_SUA1,
  pasamanosAmbosLados,
  pendienteAccesibleMax_pct,
  SUA1_ANCHURA_TABLA_4_1,
  SUA1_BARRERAS,
  SUA1_ESCALERA_GENERAL,
  SUA1_ESCALERA_RESTRINGIDA,
  SUA1_LIMPIEZA,
  SUA1_RAMPAS,
} from "./tablas";

const EPS = 1e-6;
const K = CRITERIOS_SUA1;
const G = SUA1_ESCALERA_GENERAL.datos;
const R = SUA1_ESCALERA_RESTRINGIDA.datos;

/** Lo que sube la escalera en una planta, de su suelo al de la de encima. */
export interface TramoPlanta {
  /** Nivel de la planta de salida (la de abajo). */
  nivel: number;
  /** «PB–P1». */
  etiqueta: string;
  h_m: number;
  peldanos: number;
  c_cm: number;
  /** 2C + H [cm]. */
  relacion_cm: number;
  /** Peldaños del tramo más largo y del más corto. */
  peldanosTramoMax: number;
  peldanosTramoMin: number;
  /** Altura que salva el tramo más largo [m]. */
  alturaTramo_m: number;
}

export type FalloEscalera = "anchura" | "huella" | "contrahuella" | "relacion" | "tramo" | "peldanos" | "variacion";
export type FalloRampa = "pendiente" | "longitud";
export type GrupoBarrera = "baja" | "alta" | "cubierta";

export interface DetalleEscalera {
  clase: "escalera";
  tipo: EscaleraSua["tipo"];
  plantas: string;
  /** Uso restringido (4.1) o general (4.2). */
  restringida: boolean;
  /** Edificio de Residencial Vivienda (tabla 4.1, peldaños sueltos admitidos). */
  residencial: boolean;
  usoPublico: boolean;
  /** El ascensor como alternativa (null en la escalera interior). */
  ascensor: DatoSi<boolean> | null;
  porPlanta: TramoPlanta[];
  /** Tramos por planta (null en la interior: no se comprueba). */
  tramos: Tramos | null;
  huella_cm: number;
  anchura_m: number;
  anchuraMin_m: number;
  /** Contrahuella con que se cuentan los peldaños (criterio). */
  cCalculo_cm: number;
  cMax_cm: number;
  cMin_cm: number | null;
  /** Las contrahuellas que salen, la mayor y la menor. */
  cMayor_cm: number;
  cMenor_cm: number;
  relacionMayor_cm: number;
  relacionMenor_cm: number;
  tramoMax_m: number | null;
  alturaTramoMayor_m: number;
  variacion_cm: number;
  /** 3 peldaños por tramo como mínimo, o null si se admiten 1 o 2 (zonas comunes de vivienda). */
  peldanosMinTramo: number | null;
  pasamanos: "ambos" | "uno" | null;
  prolongacion: boolean;
  tabica: boolean;
  bajaASotano: boolean;
  ojo: Ojo | null;
  /** Caída por el ojo: de la planta más alta a la más baja [m]. */
  caida_m: number;
  barandillaMin_m: number;
  fallos: FalloEscalera[];
}

export type DetalleSua1 =
  | DetalleEscalera
  | {
      clase: "barreras";
      grupo: GrupoBarrera;
      plantas: string;
      niveles: number[];
      cotaMin_m: number;
      cotaMax_m: number;
      altura_m: number;
      min_m: number;
      residencial: boolean;
      /** Esfera que no pasa por las aberturas: 10 cm en vivienda, 15 cm en uso público de oficinas. */
      esfera_cm: number | null;
    }
  | { clase: "rampa_garaje"; peatonal: boolean; pendiente_pct: number; max_pct: number }
  | {
      clase: "rampa_acceso";
      longitud_m: number;
      pendiente_pct: number;
      max_pct: number;
      tramoMax_m: number;
      desnivel_cm: number;
      pasamanosAmbos: boolean;
      prolongacion: boolean;
      fallos: FalloRampa[];
    }
  | { clase: "resbaladicidad"; usoPublico: boolean }
  | { clase: "limpieza"; plantas: string; niveles: number[]; carpinteria: Carpinteria };

export type ElementoSua1 = ElementoSi<DetalleSua1>;

/** Lo que la pantalla y los textos necesitan saber del edificio. */
export interface ContextoSua1 {
  residencial: boolean;
  unifamiliar: boolean;
  oficinas: boolean;
  /** Hay escalera común o del garaje (uso general). */
  general: boolean;
  interior: boolean;
  rampaGaraje: boolean;
  /** Se pregunta por el acceso (no en la unifamiliar). */
  acceso: boolean;
  ascensor: DatoSi<boolean>;
  ascensorExigido: boolean;
  cubierta: TipoCubierta;
  locales: boolean;
  limpieza: boolean;
  barrerasBajas: boolean;
  barrerasAltas: boolean;
}

export interface JustificacionSua1 extends JustificacionSiBase {
  elementos: ElementoSua1[];
  decisiones: DecisionesSua1;
  habituales: DecisionesSua1;
  contexto: ContextoSua1;
}

// -----------------------------------------------------------------------------
// Las escaleras
// -----------------------------------------------------------------------------

/** Peldaños de una altura con una contrahuella de cálculo: n = ⌈h / C⌉. */
export function peldanosDe(h_m: number, cCalculo_cm: number): number {
  return Math.max(1, Math.ceil((h_m * 100) / cCalculo_cm - EPS));
}

function tramosPorPlanta(plantas: readonly PlantaFisica[], niveles: readonly number[], cCalculo_cm: number, huella_cm: number, tramos: number): TramoPlanta[] {
  const lo = Math.min(...niveles);
  const hi = Math.max(...niveles);
  const out: TramoPlanta[] = [];
  for (let n = lo; n < hi; n++) {
    const p = plantas.find((x) => x.nivel === n);
    const arriba = plantas.find((x) => x.nivel === n + 1);
    if (!p || !arriba) continue;
    const peldanos = peldanosDe(p.altura_m, cCalculo_cm);
    const c_cm = (p.altura_m * 100) / peldanos;
    const tMax = Math.ceil(peldanos / tramos);
    out.push({
      nivel: n,
      etiqueta: `${p.etiqueta}–${arriba.etiqueta}`,
      h_m: p.altura_m,
      peldanos,
      c_cm,
      relacion_cm: 2 * c_cm + huella_cm,
      peldanosTramoMax: tMax,
      peldanosTramoMin: Math.floor(peldanos / tramos),
      alturaTramo_m: (tMax * c_cm) / 100,
    });
  }
  return out;
}

function cotaDe(plantas: readonly PlantaFisica[], nivel: number): number {
  return plantas.find((p) => p.nivel === nivel)?.cota_m ?? 0;
}

interface EntradasEscalera {
  e: EdificioSua;
  d: DecisionesSua1;
  ascensor: boolean;
  ascensorDato: DatoSi<boolean>;
  oficinas: boolean;
}

/** Una escalera con las decisiones: lo que sale y lo que no cumple. */
export function evaluarEscalera(esc: EscaleraSua, x: EntradasEscalera): DetalleEscalera {
  const { e, d } = x;
  const caida_m = Math.max(...esc.niveles.map((n) => cotaDe(e.plantas, n))) - Math.min(...esc.niveles.map((n) => cotaDe(e.plantas, n)));
  const fallos: FalloEscalera[] = [];

  if (esc.tipo === "interior") {
    const cCalculo_cm = K.contrahuellaCalculoInterior_cm;
    const porPlanta = tramosPorPlanta(e.plantas, esc.niveles, cCalculo_cm, d.interiorHuella_cm, 1);
    const cs = porPlanta.map((t) => t.c_cm);
    const rel = porPlanta.map((t) => t.relacion_cm);
    if (d.interiorAnchura_m < R.anchuraMin_m - EPS) fallos.push("anchura");
    if (d.interiorHuella_cm < R.huellaMin_cm - EPS) fallos.push("huella");
    if (cs.some((c) => c > R.contrahuellaMax_cm + EPS)) fallos.push("contrahuella");
    return {
      clase: "escalera",
      tipo: esc.tipo,
      plantas: esc.plantas,
      restringida: true,
      residencial: true,
      usoPublico: false,
      ascensor: null,
      porPlanta,
      tramos: null,
      huella_cm: d.interiorHuella_cm,
      anchura_m: d.interiorAnchura_m,
      anchuraMin_m: R.anchuraMin_m,
      cCalculo_cm,
      cMax_cm: R.contrahuellaMax_cm,
      cMin_cm: null,
      cMayor_cm: Math.max(...cs),
      cMenor_cm: Math.min(...cs),
      relacionMayor_cm: Math.max(...rel),
      relacionMenor_cm: Math.min(...rel),
      tramoMax_m: null,
      alturaTramoMayor_m: Math.max(...porPlanta.map((t) => t.alturaTramo_m)),
      variacion_cm: Math.max(...cs) - Math.min(...cs),
      peldanosMinTramo: null,
      pasamanos: null,
      prolongacion: false,
      tabica: false,
      bajaASotano: esc.bajaASotano,
      ojo: null,
      caida_m,
      barandillaMin_m: alturaBarreraMin_m(caida_m) ?? SUA1_BARRERAS.datos.alturaHasta6m_m,
      fallos,
    };
  }

  // Uso general: la común (con uso público si las oficinas lo tienen) y la del garaje.
  const usoPublico = esc.tipo === "comun" && x.oficinas && d.usoPublico === "si";
  const residencial = e.residencial;
  const cCalculo_cm = K.contrahuellaCalculo_cm;
  const porPlanta = tramosPorPlanta(e.plantas, esc.niveles, cCalculo_cm, d.huella_cm, d.tramos);
  const cs = porPlanta.map((t) => t.c_cm);
  const rel = porPlanta.map((t) => t.relacion_cm);
  const cMax_cm = contrahuellaMax_cm(usoPublico, x.ascensor);
  const tramoMax_m = alturaTramoMax_m(usoPublico, x.ascensor);
  const anchuraMin_m = residencial ? SUA1_ANCHURA_TABLA_4_1.datos.residencialVivienda[0] : SUA1_ANCHURA_TABLA_4_1.datos.comunicaZonaAccesible;
  const peldanosMinTramo = residencial ? null : G.peldanosMinPorTramo;
  const variacion_cm = Math.max(...cs) - Math.min(...cs);
  const alturaTramoMayor_m = Math.max(...porPlanta.map((t) => t.alturaTramo_m));

  if (d.anchura_m < anchuraMin_m - EPS) fallos.push("anchura");
  if (d.huella_cm < G.huellaMin_cm - EPS) fallos.push("huella");
  if (cs.some((c) => c > cMax_cm + EPS || c < G.contrahuellaMin_cm - EPS)) fallos.push("contrahuella");
  if (rel.some((r) => r < G.relacionMin_cm - EPS || r > G.relacionMax_cm + EPS)) fallos.push("relacion");
  if (alturaTramoMayor_m > tramoMax_m + EPS) fallos.push("tramo");
  if (peldanosMinTramo !== null && porPlanta.some((t) => t.peldanosTramoMin < peldanosMinTramo)) fallos.push("peldanos");
  if (variacion_cm > G.variacionContrahuellaMax_cm + EPS) fallos.push("variacion");

  const barandillaMin_m =
    d.ojo === "estrecho" ? SUA1_BARRERAS.datos.alturaHuecoEstrecho_m : (alturaBarreraMin_m(caida_m) ?? SUA1_BARRERAS.datos.alturaHasta6m_m);

  return {
    clase: "escalera",
    tipo: esc.tipo,
    plantas: esc.plantas,
    restringida: false,
    residencial,
    usoPublico,
    ascensor: x.ascensorDato,
    porPlanta,
    tramos: d.tramos,
    huella_cm: d.huella_cm,
    anchura_m: d.anchura_m,
    anchuraMin_m,
    cCalculo_cm,
    cMax_cm,
    cMin_cm: G.contrahuellaMin_cm,
    cMayor_cm: Math.max(...cs),
    cMenor_cm: Math.min(...cs),
    relacionMayor_cm: Math.max(...rel),
    relacionMenor_cm: Math.min(...rel),
    tramoMax_m,
    alturaTramoMayor_m,
    variacion_cm,
    peldanosMinTramo,
    pasamanos: pasamanosAmbosLados(d.anchura_m, x.ascensor) ? "ambos" : "uno",
    prolongacion: usoPublico || !x.ascensor,
    tabica: esc.bajaASotano || !x.ascensor,
    bajaASotano: esc.bajaASotano,
    ojo: d.ojo,
    caida_m,
    barandillaMin_m,
    fallos,
  };
}

/** La huella habitual: la que da 2C + H más cercano a 63 cm con la mayor contrahuella, a medio centímetro y ≥ 28 cm (K3). */
export function huellaHabitual(cMayor_cm: number): number {
  return Math.max(G.huellaMin_cm, Math.round((K.objetivo2CmasH_cm - 2 * cMayor_cm) * 2) / 2);
}

function etiquetaRango(plantas: readonly PlantaFisica[], niveles: readonly number[]): string {
  const alta = plantas.find((p) => p.nivel === Math.max(...niveles));
  const baja = plantas.find((p) => p.nivel === Math.min(...niveles));
  if (!alta || !baja) return "";
  return alta.nivel === baja.nivel ? alta.etiqueta : `${baja.etiqueta}–${alta.etiqueta}`;
}

/** Las escaleras con unas decisiones (sin huella ni tramos) y un ascensor: calcula su huella y tramos habituales. */
function escalerasCon(
  e: EdificioSua,
  estado: Sua1Estado,
  base: Omit<DecisionesSua1, "huella_cm" | "tramos">,
  ascensor: DatoSi<boolean>,
  oficinas: boolean,
): { detalles: DetalleEscalera[]; habituales: DecisionesSua1; decisiones: DecisionesSua1 } {
  const generales = e.escaleras.filter((s) => s.tipo !== "interior");
  // La huella habitual con la mayor contrahuella de las escaleras de uso general.
  const cMayor = Math.max(
    0,
    ...generales.flatMap((s) => tramosPorPlanta(e.plantas, s.niveles, K.contrahuellaCalculo_cm, G.huellaMin_cm, 1).map((t) => t.c_cm)),
  );
  const huella_cm = generales.length > 0 ? huellaHabitual(cMayor) : G.huellaMin_cm;
  const provisional: DecisionesSua1 = { ...base, huella_cm, tramos: K.tramosPorPlanta };
  const dHuella = resolverSua1(estado, provisional);
  // Los tramos habituales: dos, o los menos que cumplan la altura máxima de tramo.
  const opciones: Tramos[] = [2, 3, 4];
  const cumple = (t: Tramos) =>
    generales.every((s) => !evaluarEscalera(s, { e, d: { ...dHuella, tramos: t }, ascensor: ascensor.valor, ascensorDato: ascensor, oficinas }).fallos.includes("tramo"));
  const tramos = opciones.find(cumple) ?? 4;
  const habituales: DecisionesSua1 = { ...base, huella_cm, tramos };
  const decisiones = resolverSua1(estado, habituales);
  const detalles = e.escaleras.map((s) => evaluarEscalera(s, { e, d: decisiones, ascensor: ascensor.valor, ascensorDato: ascensor, oficinas }));
  return { detalles, habituales, decisiones };
}

function nombreEscalera(t: EscaleraSua["tipo"]): string {
  return t === "interior" ? "Escalera interior de la vivienda" : t === "comun" ? "Escalera común" : "Escalera del garaje";
}

// -----------------------------------------------------------------------------
// La justificación
// -----------------------------------------------------------------------------

export function justificarSua1(estado: Sua1Estado, p: ProyectoSi): JustificacionSua1 {
  const e = edificioSua(p.edificio);
  const avisos: Aviso[] = [];
  const oficinas = e.zonas.some((z) => z.clase === "oficinas");
  const resto = habitualesFijos();
  const asc = e.ascensor.hay;
  const r = escalerasCon(e, estado, resto, asc, oficinas);
  const d = r.decisiones;
  const elementos: ElementoSua1[] = [];

  // ── Las escaleras ─────────────────────────────────────────────────────────
  for (const det of r.detalles) {
    const id = `escalera-${det.tipo}`;
    elementos.push({
      id,
      nombre: nombreEscalera(det.tipo),
      tipo: "escalera",
      veredicto: det.fallos.length > 0 ? "fail" : "ok",
      valor: { valor: det.cMayor_cm, unidad: "cm" },
      limite: { valor: det.cMax_cm, unidad: "cm" },
      manda: {
        tipo: "formula",
        formula: `n = ⌈h / ${String(det.cCalculo_cm).replace(".", ",")}⌉ · C = h / n`,
        resultado: { valor: det.cMayor_cm, unidad: "cm" },
      },
      cita: det.restringida ? ["SUA 1 · ap. 4.1"] : ["SUA 1 · ap. 4.2", "Tabla 4.1"],
      detalle: det,
    });
  }

  // El ascensor supuesto: se avisa solo si el resultado de las escaleras cambia sin él (o con él).
  if (asc.supuesto && r.detalles.some((x) => !x.restringida)) {
    const otro: DatoSi<boolean> = { valor: !asc.valor, supuesto: true };
    const alt = escalerasCon(e, estado, resto, otro, oficinas);
    const firma = (xs: DetalleEscalera[]) => xs.map((x) => `${x.tipo}:${x.fallos.length > 0}:${x.tramos}`).join("|");
    if (firma(alt.detalles) !== firma(r.detalles)) {
      const cambia = alt.detalles.find((x, i) => x.fallos.length > 0 !== r.detalles[i].fallos.length > 0 || x.tramos !== r.detalles[i].tramos);
      avisos.push({
        id: "ascensor-supuesto",
        tipo: "supuesto",
        elementoId: `escalera-${cambia?.tipo ?? "comun"}`,
        datos: { hay: asc.valor, exigido: e.ascensor.exigido },
      });
    }
  }

  // ── Las barreras ──────────────────────────────────────────────────────────
  const conBarrera = e.plantas.filter(
    (pl) =>
      pl.nivel >= 1 &&
      pl.cota_m > SUA1_BARRERAS.datos.desnivelConBarrera_m &&
      pl.zonas.some((z) => z.uso !== "instalaciones"),
  );
  const esfera_cm = e.residencial
    ? SUA1_BARRERAS.datos.esferaVivienda_cm
    : oficinas && d.usoPublico === "si"
      ? SUA1_BARRERAS.datos.esferaOtrosUsosPublico_cm
      : null;
  const grupos: { grupo: "baja" | "alta"; plantas: PlantaFisica[]; altura_m: number }[] = [
    { grupo: "baja", plantas: conBarrera.filter((pl) => pl.cota_m <= SUA1_BARRERAS.datos.umbralCota_m), altura_m: d.barreraBaja_m },
    { grupo: "alta", plantas: conBarrera.filter((pl) => pl.cota_m > SUA1_BARRERAS.datos.umbralCota_m), altura_m: d.barreraAlta_m },
  ];
  for (const g of grupos) {
    if (g.plantas.length === 0) continue;
    const niveles = g.plantas.map((pl) => pl.nivel);
    const cotaMax_m = Math.max(...g.plantas.map((pl) => pl.cota_m));
    const cotaMin_m = Math.min(...g.plantas.map((pl) => pl.cota_m));
    const min_m = alturaBarreraMin_m(cotaMax_m) ?? SUA1_BARRERAS.datos.alturaHasta6m_m;
    elementos.push({
      id: `barreras-${g.grupo}`,
      nombre: g.grupo === "baja" ? "Barreras hasta 6 m de altura" : "Barreras a más de 6 m de altura",
      tipo: "barrera",
      veredicto: g.altura_m < min_m - EPS ? "fail" : "ok",
      valor: { valor: g.altura_m, unidad: "m" },
      limite: { valor: min_m, unidad: "m" },
      manda: { tipo: "cota", cota_m: cotaMax_m, referencia_m: SUA1_BARRERAS.datos.umbralCota_m },
      cita: ["SUA 1 · ap. 3.2.1", "Figura 3.1"],
      detalle: {
        clase: "barreras",
        grupo: g.grupo,
        plantas: etiquetaRango(e.plantas, niveles),
        niveles,
        cotaMin_m,
        cotaMax_m,
        altura_m: g.altura_m,
        min_m,
        residencial: e.residencial,
        esfera_cm,
      },
    });
  }
  if (p.edificio.cubierta.tipo === "plana_transitable") {
    const cota = e.alturaCubierta_m;
    const min_m = alturaBarreraMin_m(cota) ?? SUA1_BARRERAS.datos.alturaHasta6m_m;
    const altura_m = cota > SUA1_BARRERAS.datos.umbralCota_m ? d.barreraAlta_m : d.barreraBaja_m;
    elementos.push({
      id: "barreras-cubierta",
      nombre: "Barrera de la cubierta transitable",
      tipo: "barrera",
      veredicto: altura_m < min_m - EPS ? "fail" : "ok",
      valor: { valor: altura_m, unidad: "m" },
      limite: { valor: min_m, unidad: "m" },
      manda: { tipo: "cota", cota_m: cota, referencia_m: SUA1_BARRERAS.datos.umbralCota_m },
      cita: ["SUA 1 · ap. 3.2.1", "Figura 3.1"],
      detalle: {
        clase: "barreras",
        grupo: "cubierta",
        plantas: "cubierta",
        niveles: [],
        cotaMin_m: cota,
        cotaMax_m: cota,
        altura_m,
        min_m,
        residencial: e.residencial,
        esfera_cm,
      },
    });
  }

  // ── La rampa del garaje (plurifamiliar u oficinas con garaje bajo rasante) ─
  const rampaGaraje = e.garaje !== null && e.garaje.bajoRasante;
  if (rampaGaraje) {
    const peatonal = d.rampaGaraje === "peatones";
    const max_pct = SUA1_RAMPAS.datos.aparcamientoMixta_pct;
    elementos.push({
      id: "rampa-garaje",
      nombre: "Rampa del garaje",
      tipo: "rampa",
      veredicto: !peatonal ? "dato" : d.pendienteGaraje_pct > max_pct + EPS ? "fail" : "ok",
      valor: peatonal ? { valor: d.pendienteGaraje_pct, unidad: "%" } : { texto: "solo vehículos" },
      limite: peatonal ? { valor: max_pct, unidad: "%" } : undefined,
      manda: { tipo: "decision_proyectista", decision: peatonal ? "vehículos y personas" : "solo vehículos" },
      cita: ["SUA 1 · ap. 4.3.1 b)"],
      detalle: { clase: "rampa_garaje", peatonal, pendiente_pct: d.pendienteGaraje_pct, max_pct },
    });
  }

  // ── La rampa de acceso (itinerario accesible) ─────────────────────────────
  const acceso = !e.unifamiliar;
  if (acceso && d.acceso === "rampa") {
    const L = d.rampaLongitud_m;
    const pdt = d.rampaPendiente_pct;
    const max_pct = pendienteAccesibleMax_pct(L);
    const tramoMax_m = SUA1_RAMPAS.datos.tramoMaxAccesible_m;
    const desnivel_cm = L * pdt;
    const fallos: FalloRampa[] = [];
    if (pdt > max_pct + EPS) fallos.push("pendiente");
    if (L > tramoMax_m + EPS) fallos.push("longitud");
    elementos.push({
      id: "rampa-acceso",
      nombre: "Rampa de acceso al edificio",
      tipo: "rampa",
      veredicto: fallos.length > 0 ? "fail" : "ok",
      valor: { valor: pdt, unidad: "%" },
      limite: { valor: max_pct, unidad: "%" },
      manda: { tipo: "decision_proyectista", decision: "rampa del itinerario accesible" },
      cita: ["SUA 1 · ap. 4.3.1 a)", "SUA 1 · ap. 4.3.2 a 4.3.4"],
      detalle: {
        clase: "rampa_acceso",
        longitud_m: L,
        pendiente_pct: pdt,
        max_pct,
        tramoMax_m,
        desnivel_cm,
        pasamanosAmbos: pdt >= SUA1_RAMPAS.datos.pasamanosAmbosPendiente_pct - EPS && desnivel_cm > SUA1_RAMPAS.datos.pasamanosAmbosDesnivel_cm,
        prolongacion: L > SUA1_RAMPAS.datos.prolongacionSiTramoMasDe_m,
        fallos,
      },
    });
  }

  // ── La resbaladicidad (solo uso Administrativo) ───────────────────────────
  if (oficinas) {
    elementos.push({
      id: "resbaladicidad",
      nombre: "Resbaladicidad de los suelos",
      tipo: "suelo",
      veredicto: "ok",
      valor: { texto: "clases 1 a 3" },
      manda: { tipo: "grado_tabla", tabla: "Tabla 1.2", entradas: [{ k: "Uso", v: "Administrativo" }] },
      cita: ["SUA 1 · ap. 1", "Tablas 1.1 y 1.2"],
      detalle: { clase: "resbaladicidad", usoPublico: d.usoPublico === "si" },
    });
  }

  // ── La limpieza de los acristalamientos (solo Residencial Vivienda) ──────
  const conVidrioAlto = e.residencial
    ? e.plantas.filter(
        (pl) =>
          pl.nivel >= 0 &&
          pl.cota_m + K.dintelTipico_m > SUA1_LIMPIEZA.datos.alturaSobreRasanteMasDe_m &&
          pl.zonas.some((z) => z.uso === "viviendas" || z.uso === "vivienda_unifamiliar"),
      )
    : [];
  if (conVidrioAlto.length > 0) {
    const niveles = conVidrioAlto.map((pl) => pl.nivel);
    elementos.push({
      id: "limpieza",
      nombre: "Limpieza de los acristalamientos",
      tipo: "acristalamiento",
      veredicto: "ok",
      valor: { texto: d.carpinteria === "practicable" ? "practicables" : "con fijos" },
      manda: { tipo: "decision_proyectista", decision: d.carpinteria },
      cita: ["SUA 1 · ap. 5", "Figura 5.1"],
      detalle: { clase: "limpieza", plantas: etiquetaRango(e.plantas, niveles), niveles, carpinteria: d.carpinteria },
    });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return {
    elementos,
    avisos,
    veredicto,
    decisiones: d,
    habituales: r.habituales,
    contexto: {
      residencial: e.residencial,
      unifamiliar: e.unifamiliar,
      oficinas,
      general: e.escaleras.some((s) => s.tipo !== "interior"),
      interior: e.escaleras.some((s) => s.tipo === "interior"),
      rampaGaraje,
      acceso,
      ascensor: asc,
      ascensorExigido: e.ascensor.exigido,
      cubierta: p.edificio.cubierta.tipo,
      locales: e.zonas.some((z) => z.clase === "local"),
      limpieza: conVidrioAlto.length > 0,
      barrerasBajas: grupos[0].plantas.length > 0,
      barrerasAltas: grupos[1].plantas.length > 0 || (p.edificio.cubierta.tipo === "plana_transitable" && e.alturaCubierta_m > SUA1_BARRERAS.datos.umbralCota_m),
    },
  };
}
