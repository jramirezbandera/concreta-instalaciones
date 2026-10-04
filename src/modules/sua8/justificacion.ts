// =============================================================================
// DB-SUA, SUA 8 — La justificación (feature-20): la frecuencia esperada de
// impactos Ne frente al riesgo admisible Na y, si hace falta, la eficiencia y el
// nivel de protección de la instalación. PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-sua6-sua8.md, bloques C3 y C4):
//   - SUA 8 no tiene ámbito propio: se aplica a todo edificio (A.14);
//   - Ne ≤ Na: no hace falta instalación; Ne > Na con E < 0,80 (nivel 4): no es
//     obligatoria (nota 1 de la tabla 2.1); E ≥ 0,80: obligatoria (C4.4);
//   - siempre nivel 1 con sustancias peligrosas o altura mayor que 43 m (ap. 1 pto 2);
//   - Ae de la planta rectangular a 3H, con H la altura máxima (C3.7, C3.8);
//   - C4 = 3 si hay un uso Comercial: el local sin uso, sin uso previsto, se
//     supone Comercial (como en el DB-SI) y se avisa solo si cambia algo.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { edificioSua } from "../sua/edificio";
import { habitualesSua8, resolverSua8, type DecisionesSua8, type Instalacion, type Sua8Estado } from "./estado";
import {
  areaCaptura,
  eficiencia,
  frecuenciaEsperada,
  NG_SUPUESTO,
  nivelDe,
  riesgoAdmisible,
  SUA8_C1,
  SUA8_C2,
  SUA8_C3,
  SUA8_C4,
  SUA8_C5,
  SUA8_SIEMPRE,
  type NivelProteccion,
} from "./tablas";

/** Lado del rectángulo de la planta supuesta alargada, para ver si la forma importa (1 : 3). */
const PROPORCION_ALARGADA = 3;

export type DetalleSua8 =
  | {
      clase: "altura";
      h_m: number;
      cubierta_m: number;
      remate_m: number;
      largo_m: number;
      ancho_m: number;
      plantaSupuesta: boolean;
      ae_m2: number;
    }
  | { clase: "ne"; ng: number; ngSupuesto: boolean; ae_m2: number; c1: number; ne: number }
  | { clase: "na"; c2: number; c3: number; c4: number; c4Supuesto: boolean; c5: number; na: number }
  | {
      clase: "proteccion";
      ne: number;
      na: number;
      /** Ne > Na. */
      necesaria: boolean;
      /** E = 1 − Na/Ne; null si Ne ≤ Na y no hay caso de «siempre». */
      e: number | null;
      nivel: NivelProteccion | null;
      obligatoria: boolean;
      siempre: "peligrosas" | "altura" | null;
      instalacion: Instalacion;
    }
  | { clase: "sistema"; nivel: NivelProteccion; h_m: number };

export type ElementoSua8 = ElementoSi<DetalleSua8>;

export interface ResultadoSua8 {
  ae_m2: number;
  ne: number;
  na: number;
  e: number | null;
  nivel: NivelProteccion | null;
  obligatoria: boolean;
  siempre: "peligrosas" | "altura" | null;
}

export interface JustificacionSua8 extends JustificacionSiBase {
  elementos: ElementoSua8[];
  decisiones: DecisionesSua8;
  habituales: DecisionesSua8;
  resultado: ResultadoSua8;
  /** Las dimensiones de la planta con las que se calcula y si se suponen. */
  planta: { largo_m: number; ancho_m: number; supuesta: boolean };
  h_m: number;
}

interface Entradas {
  ng: number;
  largo_m: number;
  ancho_m: number;
  h_m: number;
  c1: number;
  c2: number;
  c3: number;
  c4: number;
  c5: number;
  peligrosas: boolean;
}

/** El cálculo del DB con unas entradas: lo que se compara para saber si un supuesto importa. */
export function calcularSua8(x: Entradas): ResultadoSua8 {
  const ae_m2 = areaCaptura(x.largo_m, x.ancho_m, x.h_m);
  const ne = frecuenciaEsperada(x.ng, ae_m2, x.c1);
  const na = riesgoAdmisible(x.c2, x.c3, x.c4, x.c5);
  const siempre = x.peligrosas ? "peligrosas" : x.h_m > SUA8_SIEMPRE.datos.alturaMayorQue_m ? "altura" : null;
  if (siempre) return { ae_m2, ne, na, e: ne > na ? eficiencia(na, ne) : null, nivel: 1, obligatoria: true, siempre };
  if (ne <= na) return { ae_m2, ne, na, e: null, nivel: null, obligatoria: false, siempre: null };
  const e = eficiencia(na, ne);
  const nivel = nivelDe(e);
  return { ae_m2, ne, na, e, nivel, obligatoria: nivel < 4, siempre: null };
}

/** Lo que dice la memoria: si es obligatoria y con qué nivel. */
function conclusion(r: ResultadoSua8): string {
  return r.obligatoria ? `nivel-${r.nivel}` : "no";
}

export function justificarSua8(estado: Sua8Estado, p: ProyectoSi): JustificacionSua8 {
  const e = edificioSua(p.edificio);
  const tipoCubierta = p.edificio.cubierta.tipo;
  // Lo habitual de todo menos la instalación, que depende del resultado.
  const h0 = habitualesSua8(tipoCubierta, e.unifamiliar, false);
  const d0 = resolverSua8(estado, h0);
  const avisos: Aviso[] = [];

  // ── La planta y la altura ─────────────────────────────────────────────────
  const dadas = (estado.largo_m ?? 0) > 0 && (estado.ancho_m ?? 0) > 0;
  const mayorPlanta = Math.max(0, ...e.zonas.filter((z) => !z.bajoRasante).map((z) => z.construida.valor));
  const superficie = p.edificio.cubierta.superficie_m2 > 0 ? p.edificio.cubierta.superficie_m2 : mayorPlanta;
  const lado = Math.round(Math.sqrt(Math.max(superficie, 1)) * 100) / 100;
  const largo_m = dadas ? estado.largo_m! : lado;
  const ancho_m = dadas ? estado.ancho_m! : lado;
  const h_m = Math.round((e.alturaCubierta_m + d0.remate_m) * 100) / 100;

  // ── Los coeficientes ──────────────────────────────────────────────────────
  const ngDado = p.datosGenerales.densidadImpactosNg;
  const ng = ngDado !== undefined && ngDado > 0 ? ngDado : NG_SUPUESTO;
  const ngSupuesto = !(ngDado !== undefined && ngDado > 0);
  const c1 = SUA8_C1.datos[d0.entorno];
  const c2 = SUA8_C2.datos[d0.estructura][d0.cubierta];
  const c3 = SUA8_C3.datos[d0.contenido];
  const locales = e.zonas.filter((z) => z.clase === "local");
  const comercial = locales.some((z) => z.zona.usoPrevisto === "comercial");
  const c4Supuesto = !comercial && locales.some((z) => z.zona.usoPrevisto === undefined);
  const c4 = comercial || c4Supuesto ? SUA8_C4.datos.publicaConcurrenciaSanitarioComercialDocente : SUA8_C4.datos.resto;
  const c5 = d0.especial === "servicio" ? SUA8_C5.datos.servicioImprescindible : SUA8_C5.datos.resto;
  const peligrosas = d0.especial === "peligrosas";

  const entradas: Entradas = { ng, largo_m, ancho_m, h_m, c1, c2, c3, c4, c5, peligrosas };
  const r = calcularSua8(entradas);

  // Los supuestos solo se avisan si cambian lo que dice la memoria.
  const cambia = (x: Partial<Entradas>) => conclusion(calcularSua8({ ...entradas, ...x })) !== conclusion(r);
  if (ngSupuesto && cambia({ ng: 0.5 })) avisos.push({ id: "ng-supuesto", tipo: "supuesto", elementoId: "ne", datos: { ng } });
  if (!dadas) {
    const area = largo_m * ancho_m;
    const corto = Math.sqrt(area / PROPORCION_ALARGADA);
    if (cambia({ largo_m: corto * PROPORCION_ALARGADA, ancho_m: corto })) {
      avisos.push({ id: "planta-supuesta", tipo: "supuesto", elementoId: "altura", datos: { lado } });
    }
  }
  if (c4Supuesto && cambia({ c4: SUA8_C4.datos.resto })) avisos.push({ id: "local-comercial", tipo: "supuesto", elementoId: "na", datos: {} });

  const habituales = habitualesSua8(tipoCubierta, e.unifamiliar, r.obligatoria);
  const instalacion: Instalacion = estado.instalacion === "habitual" || estado.instalacion === undefined ? habituales.instalacion : estado.instalacion;
  const decisiones: DecisionesSua8 = { ...d0, instalacion };

  const elementos: ElementoSua8[] = [
    {
      id: "altura",
      nombre: "Superficie de captura",
      tipo: "dato",
      veredicto: "dato",
      valor: { valor: Math.round(r.ae_m2), unidad: "m²" },
      manda: { tipo: "formula", formula: "Ae: franja a 3H del perímetro", resultado: { valor: Math.round(r.ae_m2), unidad: "m²" } },
      cita: ["SUA 8 · ap. 1 pto 3"],
      detalle: { clase: "altura", h_m, cubierta_m: e.alturaCubierta_m, remate_m: d0.remate_m, largo_m, ancho_m, plantaSupuesta: !dadas, ae_m2: r.ae_m2 },
    },
    {
      id: "ne",
      nombre: "Frecuencia esperada de impactos",
      tipo: "dato",
      veredicto: "dato",
      valor: { valor: r.ne, unidad: "impactos/año" },
      manda: { tipo: "formula", formula: "Ne = Ng·Ae·C1·10⁻⁶", resultado: { valor: r.ne, unidad: "impactos/año" } },
      cita: ["SUA 8 · ap. 1 pto 3", "Figura 1.1", "Tabla 1.1"],
      detalle: { clase: "ne", ng, ngSupuesto, ae_m2: r.ae_m2, c1, ne: r.ne },
    },
    {
      id: "na",
      nombre: "Riesgo admisible",
      tipo: "dato",
      veredicto: "dato",
      valor: { valor: r.na, unidad: "impactos/año" },
      manda: { tipo: "formula", formula: "Na = 5,5/(C2·C3·C4·C5)·10⁻³", resultado: { valor: r.na, unidad: "impactos/año" } },
      cita: ["SUA 8 · ap. 1 pto 4", "Tablas 1.2 a 1.5"],
      detalle: { clase: "na", c2, c3, c4, c4Supuesto, c5, na: r.na },
    },
  ];

  const falta = r.obligatoria && instalacion === "no";
  elementos.push({
    id: "proteccion",
    nombre: "Instalación de protección contra el rayo",
    tipo: "instalacion",
    veredicto: falta ? "fail" : "ok",
    valor: r.obligatoria ? { texto: `nivel ${r.nivel}` } : { texto: r.e === null ? "no es necesaria" : "no obligatoria" },
    manda: r.siempre
      ? { tipo: "decision_proyectista", decision: r.siempre }
      : { tipo: "formula", formula: "E = 1 − Na/Ne", resultado: { valor: r.e ?? 0, unidad: "" } },
    cita: r.siempre ? ["SUA 8 · ap. 1 pto 2", "Tabla 2.1"] : ["SUA 8 · ap. 1 pto 1", "SUA 8 · ap. 2", "Tabla 2.1"],
    detalle: { clase: "proteccion", ne: r.ne, na: r.na, necesaria: r.ne > r.na, e: r.e, nivel: r.nivel, obligatoria: r.obligatoria, siempre: r.siempre, instalacion },
  });
  if (!r.obligatoria && instalacion === "si") avisos.push({ id: "voluntaria", tipo: "caso_especial", elementoId: "proteccion", datos: {} });

  if (instalacion === "si") {
    elementos.push({
      id: "sistema",
      nombre: "Sistema de protección",
      tipo: "instalacion",
      veredicto: "ok",
      valor: { texto: `nivel ${r.nivel ?? 4}` },
      manda: { tipo: "grado_tabla", tabla: "Anejo B, tablas B.2 a B.5", entradas: [{ k: "Nivel de protección", v: String(r.nivel ?? 4) }] },
      cita: ["Anejo SUA B"],
      detalle: { clase: "sistema", nivel: r.nivel ?? 4, h_m },
    });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, decisiones, habituales, resultado: r, planta: { largo_m, ancho_m, supuesta: !dadas }, h_m };
}
