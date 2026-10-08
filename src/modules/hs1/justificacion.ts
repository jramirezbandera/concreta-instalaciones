// =============================================================================
// DB-HS1 — La justificación entera (feature-17): de El edificio, los datos de la
// obra (clima y terreno) y las decisiones, el grado de impermeabilidad de cada
// elemento y las condiciones que debe cumplir su solución, con el contrato de
// resultado de REDISENO-V4 §3.2. PURA y DETERMINISTA; no redacta.
//
// Lo que no se sabe se supone del lado de la seguridad y se avisa, pero SOLO si
// cambia el resultado (research/verificacion-hs1.md, bloque 10):
//   - sin nivel freático, presencia de agua alta;
//   - sin Ks, la peor columna (Ks ≥ 10⁻² cm/s);
//   - sin zona pluviométrica, la I; sin zona eólica, la C; sin entorno, E0.
// Así, con 15 m o menos de altura la zona eólica no se pide (no influye).
// =============================================================================

import { cerramientosDe } from "../../lib/constructivo/cerramientos";
import { NOMBRE_CERRAMIENTO } from "../../lib/constructivo/textos";
import type { Aviso, ElementoResultado } from "../../lib/cte/resultado";
import type { Edificio } from "../../lib/edificio/tipos";
import type { DatosGenerales } from "../../lib/proyecto/tipos";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import { cubiertaDe, type CubiertaHs1 } from "./cubierta";
import {
  decisionesHabitualesHs1,
  IMPERMEABILIZACIONES_MURO,
  INTERVENCIONES_TERRENO,
  resolverDecisionesHs1,
  SUELO_HABITUAL,
  TIPOS_MURO,
  TIPOS_SUELO,
  type DecisionesEfectivasHs1,
  type ImpermeabilizacionMuro,
  type IntervencionTerreno,
  type SueloHabitual,
  type TipoMuro,
  type TipoSuelo,
} from "./decisiones";
import type { Hs1Estado } from "./estado";
import { evaluarFachada, type Niveles } from "./fachada";
import { deltaFreatico, partesDe, presenciaAguaDe, type PartesHs1, type SueloHs1 } from "./partes";
import {
  bloqueSuelo,
  canaletas,
  casillaMuro,
  casillaSuelo,
  entornoDe,
  exposicionViento,
  filaExposicion,
  gradoFachada,
  gradoMuro,
  gradoSuelo,
  maxSotanosMuro,
  orificiosDrenaje,
  tuboDrenaje,
  type BloqueMuroSuelo,
  type ColumnaFachada,
  type Exposicion,
  type Grado,
} from "./tablas";
import {
  CLASES_KS,
  TERRENOS_TIPO,
  ZONAS_EOLICAS,
  ZONAS_PLUVIOMETRICAS_HS1,
  type ClaseEntorno,
  type ClaseKs,
  type NivelFreatico,
  type PresenciaAgua,
  type TerrenoTipo,
  type ZonaEolica,
  type ZonaPluviometricaHs1,
} from "./tipos";

/** Los datos de la obra que usa HS1. */
export interface ObraHs1 {
  zonaPluviometricaHs1?: ZonaPluviometricaHs1;
  zonaEolica?: ZonaEolica;
  terrenoTipo?: TerrenoTipo;
  nivelFreatico?: NivelFreatico;
  permeabilidadTerreno?: ClaseKs;
  /** Para decidir si el drenaje se bombea (HS5 la usa para el saneamiento). */
  cotaAlcantarillado_m?: number;
}

/** Los datos de HS1 del expediente. */
export function obraHs1De(dg: DatosGenerales): ObraHs1 {
  return {
    zonaPluviometricaHs1: dg.zonaPluviometricaHs1,
    zonaEolica: dg.zonaEolica,
    terrenoTipo: dg.terrenoTipo,
    nivelFreatico: dg.nivelFreatico,
    permeabilidadTerreno: dg.permeabilidadTerreno,
    cotaAlcantarillado_m: dg.cotaAlcantarillado_m,
  };
}

/** Un dato con si se ha supuesto. */
export interface DatoHs1<T> {
  valor: T;
  supuesto: boolean;
}

/** Margen junto a los umbrales de presencia de agua (el espesor bajo el suelo es un criterio). */
export const MARGEN_UMBRAL_m = 0.3;
/** Altura habitual de un peto de cubierta para avisar cerca de los límites de la tabla 2.6 (criterio). */
export const PETO_CRITERIO_m = 1.1;

/** Lo que no cumple de una casilla y lo que la arreglaría. */
export type MotivoNoAceptable = "sombreada" | "sotanos";

export type DetalleHs1 =
  | {
      clase: "terreno";
      presencia: DatoHs1<PresenciaAgua>;
      ks: DatoHs1<ClaseKs>;
      freatico: NivelFreatico | null;
      /** Cara inferior del suelo más bajo [m]. */
      caraInferior_m: number;
      /** Cuánto queda la cara inferior por debajo del freático [m]. */
      delta_m: number | null;
    }
  | {
      clase: "muro";
      grado: Grado;
      presencia: PresenciaAgua;
      ks: ClaseKs;
      tipo: TipoMuro;
      imper: ImpermeabilizacionMuro;
      condiciones: readonly string[] | null;
      sotanos: number;
      maxSotanos: number | null;
      motivo: MotivoNoAceptable | null;
      arreglo: { tipo: TipoMuro; imper: ImpermeabilizacionMuro } | null;
      alturaEnterrada_m: number;
      perimetro_m: number;
    }
  | {
      clase: "suelo";
      suelo: SueloHs1;
      grado: Grado;
      presencia: PresenciaAgua;
      ks: ClaseKs;
      bloque: BloqueMuroSuelo;
      /** Sin muro en contacto con el terreno (planta baja sin sótano). */
      sinMuro: boolean;
      tipo: TipoSuelo;
      intervencion: IntervencionTerreno;
      condiciones: readonly string[] | null;
      motivo: MotivoNoAceptable | null;
      arreglo: { tipo: TipoSuelo; intervencion: IntervencionTerreno } | null;
    }
  | {
      clase: "fachada";
      rol: "fachada" | "fachada-pb";
      /** El tipo de El edificio (feature-26). */
      sol: { codigo: string; nombre: string; pagina: number };
      grado: Grado;
      zona: DatoHs1<ZonaPluviometricaHs1>;
      eolica: DatoHs1<ZonaEolica>;
      entorno: DatoHs1<ClaseEntorno>;
      terrenoTipo: TerrenoTipo | null;
      altura_m: number;
      /** Rótulo de la fila de la tabla 2.6 («≤ 15 m»). */
      filaAltura: string;
      exposicion: Exposicion;
      columna: ColumnaFachada;
      unaHoja: boolean;
      hidrofilo: boolean;
      /** Lo que aporta la fachada con lo declarado, y lo habitual propuesto. */
      niveles: Niveles;
      habituales: Niveles;
      declarado: boolean;
      opciones: { codigos: readonly string[]; nota1: boolean }[];
      /** La casilla de la combinación: la del grado o la de uno mayor que la fachada cubre. */
      gradoOpcion: Grado;
      opcion: number;
      /** Las condiciones de la combinación (con C2 si la nota de la hoja única aplica). */
      condiciones: readonly string[];
      hojaUnicaAplicada: boolean;
      cumple: boolean;
      /** Lo que falta de la combinación más cercana, si no cumple. */
      faltan: readonly string[];
      gradoMax: Grado | 0;
      /** El grado del CEC con lo declarado: contraste (K-CER.12). */
      cec: { clave: string; grado: number } | null;
      /** Si no cumple: con lo habitual sí cumpliría, o hay que cambiar la fachada en El edificio. */
      arreglo: "habitual" | "edificio" | null;
      fueraDeTabla: boolean;
      /** Los datos supuestos que cambian el grado (los demás no influyen). */
      influyen: ("zona" | "eolica" | "entorno")[];
    }
  | { clase: "cubierta"; cubierta: CubiertaHs1 }
  | {
      clase: "dren";
      donde: "muro" | "suelo";
      grado: Grado;
      dn_mm: number;
      pendienteMin_permil: number;
      pendienteMax_permil: number;
      orificios_cm2_m: number;
      /** Las condiciones que lo piden: «muro D3», «suelo D2»… */
      por: string[];
    }
  | {
      clase: "canaletas";
      grado: Grado;
      superficieMuro_m2: number;
      sumideros: number;
      m2PorSumidero: number;
      diametroSumidero_mm: number;
      pendienteMin_pct: number;
      pendienteMax_pct: number;
    }
  | {
      clase: "bombeo";
      /** Lo pide siempre (pozos drenantes) o porque la conexión queda por encima del drenaje. */
      siempre: boolean;
      por: string[];
      cotaDrenaje_m: number;
      cotaAlcantarillado_m: number | null;
      pozosMuro: number;
      pozosSuelo: number;
    };

export interface ElementoHs1 extends ElementoResultado {
  nombre: string;
  detalle: DetalleHs1;
}

export interface JustificacionHs1 {
  partes: PartesHs1;
  decisiones: DecisionesEfectivasHs1;
  /** Lo habitual en este edificio (el suelo depende de su grado). */
  habituales: DecisionesEfectivasHs1;
  cubierta: CubiertaHs1;
  elementos: ElementoHs1[];
  avisos: Aviso[];
  veredicto: Veredicto;
}

// -----------------------------------------------------------------------------
// Datos de la obra, con lo que se supone
// -----------------------------------------------------------------------------

const PEOR_KS: ClaseKs = "alto";

function freaticoValido(f: NivelFreatico | undefined): NivelFreatico | null {
  if (!f) return null;
  if (f.tipo === "profundidad" && !Number.isFinite(f.profundidad_m)) return null;
  return f;
}

function presenciaDe(caraInferior_m: number, f: NivelFreatico | null): DatoHs1<PresenciaAgua> {
  const p = f ? presenciaAguaDe(caraInferior_m, f) : null;
  return p ? { valor: p, supuesto: false } : { valor: "alta", supuesto: true };
}

// -----------------------------------------------------------------------------
// Muro y suelo
// -----------------------------------------------------------------------------

function muroAceptable(tipo: TipoMuro, imper: ImpermeabilizacionMuro, grado: Grado, sotanos: number): MotivoNoAceptable | null {
  if (casillaMuro(tipo, imper, grado) === null) return "sombreada";
  const max = maxSotanosMuro(tipo, imper, grado);
  return max !== null && sotanos > max ? "sotanos" : null;
}

/** El arreglo de un muro que no vale: otra impermeabilización del mismo muro y, si no, otro muro. */
function arregloMuro(tipo: TipoMuro, grado: Grado, sotanos: number): { tipo: TipoMuro; imper: ImpermeabilizacionMuro } | null {
  for (const t of [tipo, ...TIPOS_MURO.filter((x) => x !== tipo)]) {
    for (const i of IMPERMEABILIZACIONES_MURO) {
      if (muroAceptable(t, i, grado, sotanos) === null) return { tipo: t, imper: i };
    }
  }
  return null;
}

/** El arreglo de un suelo que no vale: otra intervención del mismo suelo y, si no, otro suelo. */
function arregloSuelo(bloque: BloqueMuroSuelo, tipo: TipoSuelo, grado: Grado): { tipo: TipoSuelo; intervencion: IntervencionTerreno } | null {
  for (const t of [tipo, ...TIPOS_SUELO.filter((x) => x !== tipo)]) {
    for (const i of INTERVENCIONES_TERRENO) {
      if (casillaSuelo(bloque, t, i, grado) !== null) return { tipo: t, intervencion: i };
    }
  }
  return null;
}

// -----------------------------------------------------------------------------
// Fachada
// -----------------------------------------------------------------------------

interface ClimaFachada {
  zona: DatoHs1<ZonaPluviometricaHs1>;
  eolica: DatoHs1<ZonaEolica>;
  entorno: DatoHs1<ClaseEntorno>;
}

function climaDe(o: ObraHs1): ClimaFachada {
  return {
    zona: o.zonaPluviometricaHs1 ? { valor: o.zonaPluviometricaHs1, supuesto: false } : { valor: "I", supuesto: true },
    eolica: o.zonaEolica ? { valor: o.zonaEolica, supuesto: false } : { valor: "C", supuesto: true },
    entorno: o.terrenoTipo ? { valor: entornoDe(o.terrenoTipo), supuesto: false } : { valor: "E0", supuesto: true },
  };
}

/** El grado de la fachada con los datos dados. */
function gradoFachadaCon(altura_m: number, entorno: ClaseEntorno, eolica: ZonaEolica, zona: ZonaPluviometricaHs1): Grado {
  return gradoFachada(exposicionViento(altura_m, entorno, eolica), zona);
}

/**
 * Los datos supuestos de la fachada que cambian el grado: para cada uno, el grado
 * con cualquier otro valor posible (dejando los demás como están).
 */
function climaQueInfluye(altura_m: number, c: ClimaFachada): ("zona" | "eolica" | "entorno")[] {
  const base = gradoFachadaCon(altura_m, c.entorno.valor, c.eolica.valor, c.zona.valor);
  const out: ("zona" | "eolica" | "entorno")[] = [];
  if (c.zona.supuesto && ZONAS_PLUVIOMETRICAS_HS1.some((z) => gradoFachadaCon(altura_m, c.entorno.valor, c.eolica.valor, z) !== base)) out.push("zona");
  if (c.eolica.supuesto && ZONAS_EOLICAS.some((z) => gradoFachadaCon(altura_m, c.entorno.valor, z, c.zona.valor) !== base)) out.push("eolica");
  if (
    c.entorno.supuesto &&
    TERRENOS_TIPO.some((t) => gradoFachadaCon(altura_m, entornoDe(t), c.eolica.valor, c.zona.valor) !== base)
  ) {
    out.push("entorno");
  }
  return out;
}

// -----------------------------------------------------------------------------

/**
 * El suelo habitual para los grados de los suelos: el primero, en este orden,
 * que la tabla 2.4 admite en todos (la solera sin intervención no vale con grado
 * 5, por ejemplo con la presencia alta que se supone sin estudio geotécnico).
 */
function sueloHabitualPara(suelos: { grado: Grado; bloque: BloqueMuroSuelo }[]): SueloHabitual {
  for (const tipo of TIPOS_SUELO) {
    for (const intervencion of INTERVENCIONES_TERRENO) {
      if (suelos.every((s) => casillaSuelo(s.bloque, tipo, intervencion, s.grado) !== null)) return { tipo, intervencion };
    }
  }
  return SUELO_HABITUAL;
}

export function justificarHs1(estado: Hs1Estado, edificio: Edificio, obra: ObraHs1 = {}): JustificacionHs1 {
  const partes = partesDe(edificio);
  const elementos: ElementoHs1[] = [];
  const avisos: Aviso[] = [];

  // ── El terreno ────────────────────────────────────────────────────────────
  const freatico = freaticoValido(obra.nivelFreatico);
  const ks: DatoHs1<ClaseKs> = obra.permeabilidadTerreno
    ? { valor: obra.permeabilidadTerreno, supuesto: false }
    : { valor: PEOR_KS, supuesto: true };

  // Las decisiones: el muro primero (decide el bloque de la tabla 2.4) y, con
  // los grados de los suelos, lo habitual del suelo.
  const tipoMuro = resolverDecisionesHs1(estado).muroTipo;
  const sueloHabitual = sueloHabitualPara(
    partes.suelos.map((s) => ({
      grado: gradoSuelo(presenciaDe(s.caraInferior_m, freatico).valor, ks.valor),
      bloque: bloqueSuelo(s.id === "suelo-pb" ? null : tipoMuro),
    })),
  );
  const d = resolverDecisionesHs1(estado, sueloHabitual);
  const habituales = decisionesHabitualesHs1(sueloHabitual);
  const caraMasBaja = Math.min(...partes.suelos.map((s) => s.caraInferior_m));
  const presenciaBaja = presenciaDe(caraMasBaja, freatico);
  const delta = deltaFreatico(caraMasBaja, freatico ?? undefined);

  elementos.push({
    id: "terreno",
    nombre: "El terreno",
    tipo: "dato",
    veredicto: "dato",
    valor: { texto: `presencia ${presenciaBaja.valor}` },
    manda: { tipo: "dato_de_partida", fuente: "estudio geotécnico" },
    cita: ["HS 1 · ap. 2.1.1 pto 2", "Apéndice A"],
    detalle: { clase: "terreno", presencia: presenciaBaja, ks, freatico, caraInferior_m: caraMasBaja, delta_m: delta },
  });

  if (presenciaBaja.supuesto) {
    avisos.push({ id: "freatico-supuesto", tipo: "supuesto", elementoId: "terreno", datos: {} });
  } else if (freatico?.tipo === "no_detectado") {
    const r = freatico.reconocimiento_m;
    const llega = r !== undefined && Number.isFinite(r) && -r <= caraMasBaja;
    if (!llega) {
      avisos.push({
        id: "freatico-reconocimiento",
        tipo: "supuesto",
        elementoId: "terreno",
        datos: { reconocimiento_m: r ?? null, caraInferior_m: caraMasBaja },
      });
    }
  }
  if (delta !== null && (Math.abs(delta) < MARGEN_UMBRAL_m || Math.abs(delta - 2) < MARGEN_UMBRAL_m)) {
    avisos.push({ id: "freatico-umbral", tipo: "caso_especial", elementoId: "terreno", datos: { delta_m: delta } });
  }

  // ── El muro ───────────────────────────────────────────────────────────────
  let gradoDelMuro: Grado | null = null;
  let condicionesMuro: readonly string[] = [];
  const sotanos = partes.sotanos;
  if (sotanos && partes.muro) {
    const presencia = presenciaDe(partes.muro.caraInferior_m, freatico).valor;
    const grado = gradoMuro(presencia, ks.valor);
    gradoDelMuro = grado;
    const motivo = muroAceptable(d.muroTipo, d.muroImper, grado, sotanos.n);
    const casilla = casillaMuro(d.muroTipo, d.muroImper, grado);
    condicionesMuro = motivo === null && casilla ? casilla : [];
    elementos.push({
      id: "muro",
      nombre: sotanos.n > 1 ? "Muros de los sótanos" : "Muros del sótano",
      tipo: "muro",
      veredicto: motivo === null ? "ok" : "fail",
      valor: { valor: grado, unidad: "grado" },
      manda: {
        tipo: "grado_tabla",
        tabla: "Tabla 2.1",
        entradas: [
          { k: "Presencia de agua", v: presencia },
          { k: "Ks", v: ks.valor },
        ],
      },
      cita: ["HS 1 · tablas 2.1 y 2.2", "ap. 2.1"],
      detalle: {
        clase: "muro",
        grado,
        presencia,
        ks: ks.valor,
        tipo: d.muroTipo,
        imper: d.muroImper,
        condiciones: motivo === null ? casilla : null,
        sotanos: sotanos.n,
        maxSotanos: maxSotanosMuro(d.muroTipo, d.muroImper, grado),
        motivo,
        arreglo: motivo === null ? null : arregloMuro(d.muroTipo, grado, sotanos.n),
        alturaEnterrada_m: partes.muro.alturaEnterrada_m,
        perimetro_m: sotanos.perimetro_m,
      },
    });
  }

  // ── Los suelos ────────────────────────────────────────────────────────────
  const condicionesSuelo: { suelo: SueloHs1; grado: Grado; condiciones: readonly string[] }[] = [];
  for (const s of partes.suelos) {
    const presencia = presenciaDe(s.caraInferior_m, freatico).valor;
    const grado = gradoSuelo(presencia, ks.valor);
    // El sótano usa el bloque de su muro; la planta baja sin sótano, el de
    // «flexorresistente o de gravedad» (comentario del Ministerio a 2.2.1).
    const sinMuro = s.id === "suelo-pb";
    const bloque = bloqueSuelo(sinMuro ? null : d.muroTipo);
    const casilla = casillaSuelo(bloque, d.sueloTipo, d.sueloIntervencion, grado);
    const motivo: MotivoNoAceptable | null = casilla === null ? "sombreada" : null;
    if (casilla) condicionesSuelo.push({ suelo: s, grado, condiciones: casilla });
    elementos.push({
      id: s.id,
      nombre: s.id === "suelo-sotano" ? "Suelo del sótano" : s.parcial ? "Suelo de la planta baja sin sótano" : "Suelo de la planta baja",
      tipo: "suelo",
      veredicto: motivo === null ? "ok" : "fail",
      valor: { valor: grado, unidad: "grado" },
      manda: {
        tipo: "grado_tabla",
        tabla: "Tabla 2.3",
        entradas: [
          { k: "Presencia de agua", v: presencia },
          { k: "Ks", v: ks.valor },
        ],
      },
      cita: ["HS 1 · tablas 2.3 y 2.4", "ap. 2.2"],
      detalle: {
        clase: "suelo",
        suelo: s,
        grado,
        presencia,
        ks: ks.valor,
        bloque,
        sinMuro,
        tipo: d.sueloTipo,
        intervencion: d.sueloIntervencion,
        condiciones: casilla,
        motivo,
        arreglo: motivo === null ? null : arregloSuelo(bloque, d.sueloTipo, grado),
      },
    });
    if (sinMuro && casilla && casilla.some((c) => ["I2", "S1", "S3", "P1", "P2", "D3"].includes(c))) {
      avisos.push({ id: "suelo-sin-muro", tipo: "caso_especial", elementoId: s.id, datos: { condiciones: casilla } });
    }
  }
  if (d.sueloTipo === "elevado" && partes.suelos.length > 0) {
    avisos.push({ id: "suelo-elevado", tipo: "caso_especial", elementoId: partes.suelos[0].id, datos: {} });
  }

  // Ks supuesto: solo si cambia algún grado de muro o suelo.
  if (ks.supuesto) {
    const cambia = CLASES_KS.some((k) => {
      if (partes.muro && gradoMuro(presenciaDe(partes.muro.caraInferior_m, freatico).valor, k) !== gradoMuro(presenciaDe(partes.muro.caraInferior_m, freatico).valor, ks.valor)) {
        return true;
      }
      return partes.suelos.some((s) => {
        const p = presenciaDe(s.caraInferior_m, freatico).valor;
        return gradoSuelo(p, k) !== gradoSuelo(p, ks.valor);
      });
    });
    if (cambia) avisos.push({ id: "ks-supuesto", tipo: "supuesto", elementoId: "terreno", datos: {} });
  }

  // ── El drenaje ────────────────────────────────────────────────────────────
  // Tubo en el arranque del muro: D3 del muro, o D3 del suelo (base del muro;
  // en la planta baja sin sótano, la cimentación perimetral). Grado: el mayor
  // del muro y del suelo (criterio para el D3 del suelo).
  const porMuro: string[] = [];
  let gradoDrenMuro = 0;
  if (condicionesMuro.includes("D3") && gradoDelMuro !== null) {
    porMuro.push("muro D3");
    gradoDrenMuro = gradoDelMuro;
  }
  for (const c of condicionesSuelo) {
    if (c.condiciones.includes("D3")) {
      if (!porMuro.includes("suelo D3")) porMuro.push("suelo D3");
      gradoDrenMuro = Math.max(gradoDrenMuro, c.grado, gradoDelMuro ?? 0);
    }
  }
  if (porMuro.length > 0) {
    const t = tuboDrenaje(gradoDrenMuro as Grado);
    elementos.push({
      id: "dren-muro",
      nombre: partes.muro ? "Tubo drenante del muro" : "Tubo drenante perimetral",
      tipo: "dren",
      veredicto: "ok",
      valor: { valor: t.dnPerimetroMuro_mm, unidad: "mm" },
      limite: { valor: t.dnPerimetroMuro_mm, unidad: "mm" },
      manda: { tipo: "grado_tabla", tabla: "Tabla 3.1", entradas: [{ k: "Grado", v: String(gradoDrenMuro) }] },
      cita: ["HS 1 · tablas 3.1 y 3.2", "ap. 3.1"],
      detalle: {
        clase: "dren",
        donde: "muro",
        grado: gradoDrenMuro as Grado,
        dn_mm: t.dnPerimetroMuro_mm,
        pendienteMin_permil: t.pendienteMin_permil,
        pendienteMax_permil: t.pendienteMax_permil,
        orificios_cm2_m: orificiosDrenaje(t.dnPerimetroMuro_mm),
        por: porMuro,
      },
    });
  }
  const conD2 = condicionesSuelo.filter((c) => c.condiciones.includes("D2"));
  if (conD2.length > 0) {
    const g = Math.max(...conD2.map((c) => c.grado)) as Grado;
    const t = tuboDrenaje(g);
    elementos.push({
      id: "dren-suelo",
      nombre: "Drenes bajo el suelo",
      tipo: "dren",
      veredicto: "ok",
      valor: { valor: t.dnBajoSuelo_mm, unidad: "mm" },
      limite: { valor: t.dnBajoSuelo_mm, unidad: "mm" },
      manda: { tipo: "grado_tabla", tabla: "Tabla 3.1", entradas: [{ k: "Grado", v: String(g) }] },
      cita: ["HS 1 · tablas 3.1 y 3.2", "ap. 3.1"],
      detalle: {
        clase: "dren",
        donde: "suelo",
        grado: g,
        dn_mm: t.dnBajoSuelo_mm,
        pendienteMin_permil: t.pendienteMin_permil,
        pendienteMax_permil: t.pendienteMax_permil,
        orificios_cm2_m: orificiosDrenaje(t.dnBajoSuelo_mm),
        por: ["suelo D2"],
      },
    });
  }

  // Canaletas: D4 del muro (muro parcialmente estanco).
  if (condicionesMuro.includes("D4") && gradoDelMuro !== null && partes.muro && sotanos) {
    const c = canaletas(gradoDelMuro);
    const superficieMuro_m2 = Math.round(sotanos.perimetro_m * partes.muro.alturaEnterrada_m);
    elementos.push({
      id: "canaletas",
      nombre: "Canaletas de la cámara",
      tipo: "canaletas",
      veredicto: "ok",
      valor: { valor: Math.max(1, Math.ceil(superficieMuro_m2 / c.m2MuroPorSumidero)), unidad: "sumideros" },
      manda: { tipo: "grado_tabla", tabla: "Tabla 3.3", entradas: [{ k: "Grado del muro", v: String(gradoDelMuro) }] },
      cita: ["HS 1 · tabla 3.3", "ap. 3.2"],
      detalle: {
        clase: "canaletas",
        grado: gradoDelMuro,
        superficieMuro_m2,
        sumideros: Math.max(1, Math.ceil(superficieMuro_m2 / c.m2MuroPorSumidero)),
        m2PorSumidero: c.m2MuroPorSumidero,
        diametroSumidero_mm: 110,
        pendienteMin_pct: c.pendienteMin_pct,
        pendienteMax_pct: c.pendienteMax_pct,
      },
    });
  }

  // Bombeo: siempre con pozos drenantes (muro D2, suelo D4); con tubos o
  // canaletas (muro D3 y D4, suelo D2 y D3), si la conexión al saneamiento queda
  // por encima del drenaje.
  const siempre: string[] = [];
  const siConexion: string[] = [];
  if (condicionesMuro.includes("D2")) siempre.push("muro D2");
  if (condicionesSuelo.some((c) => c.condiciones.includes("D4"))) siempre.push("suelo D4");
  if (condicionesMuro.includes("D3")) siConexion.push("muro D3");
  if (condicionesMuro.includes("D4")) siConexion.push("muro D4");
  if (condicionesSuelo.some((c) => c.condiciones.includes("D2"))) siConexion.push("suelo D2");
  if (condicionesSuelo.some((c) => c.condiciones.includes("D3"))) siConexion.push("suelo D3");
  const cotaAlc = obra.cotaAlcantarillado_m !== undefined && Number.isFinite(obra.cotaAlcantarillado_m) ? obra.cotaAlcantarillado_m : null;
  const cotaDrenaje_m = caraMasBaja;
  const porConexion = siConexion.length > 0 && (cotaAlc === null || cotaAlc > cotaDrenaje_m);
  if (siempre.length > 0 || porConexion) {
    const pozosMuro = condicionesMuro.includes("D2") && sotanos ? Math.max(1, Math.ceil(sotanos.perimetro_m / 50)) : 0;
    const supD4 = condicionesSuelo.filter((c) => c.condiciones.includes("D4")).reduce((a, c) => a + c.suelo.superficie_m2, 0);
    const pozosSuelo = supD4 > 0 ? Math.max(1, Math.ceil(supD4 / 800)) : 0;
    elementos.push({
      id: "bombeo",
      nombre: "Bombeo del drenaje",
      tipo: "bombeo",
      veredicto: "ok",
      valor: { texto: "2 bombas" },
      manda:
        siempre.length > 0
          ? { tipo: "decision_proyectista", decision: "pozos" }
          : { tipo: "cota", cota_m: cotaDrenaje_m, referencia_m: cotaAlc ?? cotaDrenaje_m },
      cita: ["HS 1 · tabla 3.4", "ap. 3.3"],
      detalle: {
        clase: "bombeo",
        siempre: siempre.length > 0,
        por: [...siempre, ...(porConexion ? siConexion : [])],
        cotaDrenaje_m,
        cotaAlcantarillado_m: cotaAlc,
        pozosMuro,
        pozosSuelo,
      },
    });
    if (porConexion && cotaAlc === null) {
      avisos.push({ id: "alcantarillado-supuesto", tipo: "supuesto", elementoId: "bombeo", datos: {} });
    }
  }

  // ── La fachada ────────────────────────────────────────────────────────────
  const clima = climaDe(obra);
  const altura_m = partes.fachada.alturaCoronacion_m;
  const exposicion = exposicionViento(altura_m, clima.entorno.valor, clima.eolica.valor);
  const grado = gradoFachada(exposicion, clima.zona.valor);
  const fila = filaExposicion(altura_m);
  const influyen = climaQueInfluye(altura_m, clima);
  // Las fachadas de El edificio: la general y, si es otro tipo, la de la planta baja.
  const cer = cerramientosDe(edificio);
  const conPB = cer.fachadaPB !== null && cer.fachadaPB.sol.id !== cer.fachada.sol.id;
  const fachadas = [
    { rol: "fachada" as const, nombre: conPB ? "Fachadas de las demás plantas" : "Fachadas", sol: cer.fachada.sol, declara: estado.fachadaDeclara?.general },
    ...(conPB && cer.fachadaPB
      ? [{ rol: "fachada-pb" as const, nombre: NOMBRE_CERRAMIENTO.fachadaPB, sol: cer.fachadaPB.sol, declara: estado.fachadaDeclara?.pb }]
      : []),
  ];
  for (const fa of fachadas) {
    const ev = evaluarFachada(fa.sol, grado, fa.declara);
    elementos.push({
      id: fa.rol,
      nombre: fa.nombre,
      tipo: "fachada",
      veredicto: ev.cumple ? "ok" : "fail",
      valor: { valor: grado, unidad: "grado" },
      manda: {
        tipo: "grado_tabla",
        tabla: "Tabla 2.5",
        entradas: [
          { k: "Zona pluviométrica", v: clima.zona.valor },
          { k: "Exposición al viento", v: exposicion },
        ],
      },
      cita: ["HS 1 · tablas 2.5, 2.6 y 2.7", "ap. 2.3"],
      detalle: {
        clase: "fachada",
        rol: fa.rol,
        sol: { codigo: fa.sol.codigo, nombre: fa.sol.nombre, pagina: fa.sol.pagina },
        grado,
        zona: clima.zona,
        eolica: clima.eolica,
        entorno: clima.entorno,
        terrenoTipo: obra.terrenoTipo ?? null,
        altura_m,
        filaAltura: (fila ?? { rotulo: "más de 100 m" }).rotulo,
        exposicion,
        columna: ev.columna,
        unaHoja: ev.unaHoja,
        hidrofilo: ev.hidrofilo,
        niveles: ev.niveles,
        habituales: ev.habituales,
        declarado: ev.declarado,
        opciones: ev.opciones,
        gradoOpcion: ev.gradoOpcion,
        opcion: ev.opcion,
        condiciones: ev.condiciones,
        hojaUnicaAplicada: ev.opciones[ev.opcion].nota1,
        cumple: ev.cumple,
        faltan: ev.faltan,
        gradoMax: ev.gradoMax,
        cec: ev.cec,
        arreglo: ev.cumple ? null : evaluarFachada(fa.sol, grado).cumple ? "habitual" : "edificio",
        fueraDeTabla: fila === null,
        influyen,
      },
    });
    // El CEC solo es contraste: se avisa si, con lo declarado, daría que no llega cuando la tabla 2.7 dice que sí.
    if (ev.cumple && ev.cec && ev.cec.grado < grado) {
      avisos.push({ id: `cec-${fa.rol}`, tipo: "caso_especial", elementoId: fa.rol, datos: { codigo: fa.sol.codigo, clave: ev.cec.clave, cec: ev.cec.grado, grado, gradoMax: ev.gradoMax } });
    }
  }
  if (influyen.length > 0) {
    avisos.push({ id: "clima-supuesto", tipo: "supuesto", elementoId: "fachada", datos: { faltan: influyen } });
  }
  if (fila === null) {
    avisos.push({ id: "altura-100", tipo: "fuera_de_alcance", elementoId: "fachada", datos: { altura_m } });
  } else if (
    exposicionViento(altura_m + PETO_CRITERIO_m, clima.entorno.valor, clima.eolica.valor) !== exposicion &&
    filaExposicion(altura_m + PETO_CRITERIO_m) !== fila
  ) {
    avisos.push({ id: "coronacion-peto", tipo: "caso_especial", elementoId: "fachada", datos: { altura_m, limite_m: fila.hasta_m } });
  }

  // ── La cubierta: la de El edificio (feature-26) ───────────────────────────
  const cubierta = cubiertaDe(cer.cubierta.sol, d);
  const p = cubierta.pendiente;
  elementos.push({
    id: "cubierta",
    nombre: "Cubierta",
    tipo: "cubierta",
    veredicto: "ok",
    valor: p ? { texto: p.estricta ? `> ${p.min_pct} %` : `${p.min_pct}–${p.max_pct} %` } : { texto: "Grado único" },
    manda: p
      ? { tipo: "grado_tabla", tabla: p.tabla, entradas: [{ k: cubierta.plana ? "Protección" : "Tejado", v: p.por }] }
      : { tipo: "decision_proyectista", decision: "impermeabilizacion" },
    cita: ["HS 1 · ap. 2.4", p ? p.tabla.toLowerCase() : "ap. 2.4.2"],
    detalle: { clase: "cubierta", cubierta },
  });

  const veredicto: Veredicto = elementos.some((e) => e.veredicto === "fail") ? "fail" : "ok";
  return { partes, decisiones: d, habituales, cubierta, elementos, avisos, veredicto };
}
