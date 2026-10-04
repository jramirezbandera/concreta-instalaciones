// =============================================================================
// DB-SUA, SUA 2 — La justificación (feature-20): la altura libre de paso de cada
// clase de zona, los salientes, las puertas que dan a pasillos comunes, las
// puertas automáticas y de garaje, los vidrios de cada planta por su diferencia
// de cota (tabla 1.1), las mamparas, la señalización de los acristalamientos y
// el atrapamiento. PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-sua2-sua5.md, bloques B1 y B2):
//   - el interior de las viviendas (y el garaje de la unifamiliar) es de uso
//     restringido: 2,10 m; las zonas comunes, el garaje comunitario, los pasillos
//     de trasteros y las oficinas, 2,20 m (B1.2, B1.5 a B1.7, criterio S2);
//   - el barrido de las puertas no se comprueba en uso restringido (B1.19);
//   - la diferencia de cota de los vidrios de fachada es la cota del suelo de la
//     planta sobre la rasante (INTERPRETACIÓN B1.36, criterio S4); los interiores
//     y la planta baja, fila «menor que 0,55 m»;
//   - la señalización de acristalamientos excluye el interior de las viviendas
//     (B1.38): la unifamiliar no la tiene;
//   - el local sin uso se justificará con su actividad.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { edificioSua, type ClaseSua, type ZonaSua } from "../sua/edificio";
import {
  ALTURA_LIBRE_HABITUAL_m,
  CLAVE_ALTURA,
  PUERTAS_HABITUAL,
  type BarridoPuertas,
  type ClaseAltura,
  type Sua2Estado,
} from "./estado";
import { ALTURAS_SUA2_1_1, filaVidrioSua2, type FilaVidrioSua2 } from "./tablas";

export const CLASES_ALTURA: readonly ClaseAltura[] = ["vivienda", "comun", "garaje", "oficinas"];
export const FILAS_VIDRIO: readonly FilaVidrioSua2[] = ["menor055", "entre055y12", "mayor12"];

/** Una planta sobre rasante con la diferencia de cota de sus vidrios de fachada. */
export interface PlantaVidrio {
  nivel: number;
  etiqueta: string;
  cota_m: number;
}

export type DetalleSua2 =
  | {
      clase: "altura";
      grupo: ClaseAltura;
      zonas: ZonaSua[];
      /** «P1–P3, PB». */
      plantas: string;
      limite_m: number;
      valor_m: number;
      /** La altura de planta (suelo a suelo) más baja de esas zonas [m]. */
      alturaPlanta_m: number;
      habitual_m: number;
      indicada: boolean;
      unifamiliar: boolean;
    }
  | { clase: "salientes" }
  | { clase: "puertas"; barrido: BarridoPuertas; donde: string[] }
  | { clase: "automaticas"; garajeVivienda: boolean }
  | { clase: "vidrios"; fila: FilaVidrioSua2; plantas: PlantaVidrio[]; interiores: boolean }
  | { clase: "mamparas"; viviendas: boolean }
  | { clase: "senalizacion"; donde: string[] }
  | { clase: "atrapamiento" }
  | { clase: "local"; zona: ZonaSua };

export type ElementoSua2 = ElementoSi<DetalleSua2>;

export interface DecisionesSua2 {
  alturas: Record<ClaseAltura, number>;
  puertas: BarridoPuertas;
}

export interface JustificacionSua2 extends JustificacionSiBase {
  elementos: ElementoSua2[];
  decisiones: DecisionesSua2;
  habituales: DecisionesSua2;
  unifamiliar: boolean;
  /** Las clases de zona presentes, para las decisiones. */
  clases: ClaseAltura[];
  /** Hay pasillos o rellanos comunes (zonas que no son de uso restringido). */
  conPasillos: boolean;
}

/** La clase de altura de una zona; null si el DB-SUA no la mira (cuartos de mantenimiento, local sin uso). */
export function claseAltura(z: ZonaSua): ClaseAltura | null {
  const porClase: Partial<Record<ClaseSua, ClaseAltura>> = {
    vivienda: "vivienda",
    garaje_vivienda: "vivienda",
    comun: "comun",
    garaje: "garaje",
    oficinas: "oficinas",
  };
  // Los pasillos de trasteros son zona común (comentario D1b); los cuartos de
  // instalaciones reservados a mantenimiento quedan fuera del DB-SUA (D12).
  if (z.uso === "trasteros") return "comun";
  return porClase[z.clase] ?? null;
}

/** Centímetros enteros: para comparar alturas sin errores de coma flotante. */
function cm(v: number): number {
  return Math.round(v * 100);
}

export function justificarSua2(estado: Sua2Estado, p: ProyectoSi): JustificacionSua2 {
  const e = edificioSua(p.edificio);
  const T = ALTURAS_SUA2_1_1.datos;
  const unifamiliar = e.unifamiliar;
  const elementos: ElementoSua2[] = [];
  const avisos: Aviso[] = [];
  const alturaDe = (nivel: number) => e.plantas.find((pl) => pl.nivel === nivel)?.altura_m ?? 3;

  // ── Altura libre de paso, por clase de zona ───────────────────────────────
  const clases: ClaseAltura[] = [];
  const alturas = { ...ALTURA_LIBRE_HABITUAL_m };
  const habitualesAltura = { ...ALTURA_LIBRE_HABITUAL_m };
  for (const grupo of CLASES_ALTURA) {
    const zonas = e.zonas.filter((z) => claseAltura(z) === grupo);
    if (zonas.length === 0) continue;
    clases.push(grupo);
    const alturaPlanta_m = Math.min(...zonas.flatMap((z) => z.niveles.map(alturaDe)));
    // Lo habitual no puede pasar de la altura de planta.
    const habitual_m = Math.min(ALTURA_LIBRE_HABITUAL_m[grupo], Math.round(alturaPlanta_m * 100) / 100);
    habitualesAltura[grupo] = habitual_m;
    const dado = estado[CLAVE_ALTURA[grupo]];
    const indicada = typeof dado === "number" && dado > 0;
    const valor_m = indicada ? dado : habitual_m;
    alturas[grupo] = valor_m;
    const limite_m = grupo === "vivienda" ? T.alturaLibrePaso_usoRestringido_m : T.alturaLibrePaso_resto_m;
    const plantas = [...new Set(zonas.map((z) => z.plantas))].join(", ");
    elementos.push({
      id: `altura-${grupo}`,
      nombre: grupo === "vivienda" ? "Altura libre en la vivienda" : grupo === "comun" ? "Altura libre en zonas comunes" : grupo === "garaje" ? "Altura libre en el garaje" : "Altura libre en las oficinas",
      tipo: "altura",
      veredicto: cm(valor_m) >= cm(limite_m) ? "ok" : "fail",
      valor: { valor: valor_m, unidad: "m" },
      limite: { valor: limite_m, unidad: "m" },
      manda: { tipo: "decision_proyectista", decision: "altura libre de paso" },
      cita: ["SUA 2 · ap. 1.1 pto 1"],
      detalle: { clase: "altura", grupo, zonas, plantas, limite_m, valor_m, alturaPlanta_m, habitual_m, indicada, unifamiliar },
    });
    // El garaje es donde más suele fallar (criterio S3): se avisa mientras no se indique.
    if (grupo === "garaje" && !indicada && cm(valor_m) >= cm(limite_m)) {
      avisos.push({ id: "garaje-altura", tipo: "caso_especial", elementoId: "altura-garaje", datos: { limite_m } });
    }
  }

  // ── Salientes y volados ───────────────────────────────────────────────────
  elementos.push({
    id: "salientes",
    nombre: "Salientes y elementos volados",
    tipo: "impacto",
    veredicto: "ok",
    valor: { texto: `≤ ${T.salientesParedes.vueloMax_cm} cm` },
    manda: { tipo: "decision_proyectista", decision: "salientes" },
    cita: ["SUA 2 · ap. 1.1 ptos 2 a 4"],
    detalle: { clase: "salientes" },
  });

  // ── Puertas a pasillos comunes ────────────────────────────────────────────
  const donde: string[] = [];
  const hay = (c: ClaseSua) => e.zonas.some((z) => z.clase === c);
  if (!unifamiliar && e.residencial) donde.push("los rellanos y pasillos comunes");
  else if (hay("comun")) donde.push("el vestíbulo y los pasillos comunes");
  if (hay("oficinas")) donde.push("los pasillos de las oficinas");
  if (e.garaje) donde.push("los pasillos peatonales del garaje");
  const conPasillos = donde.length > 0;
  const puertasDadas = estado.puertas === "habitual" || estado.puertas === undefined ? PUERTAS_HABITUAL : estado.puertas;
  if (conPasillos) {
    elementos.push({
      id: "puertas",
      nombre: "Puertas a pasillos comunes",
      tipo: "puertas",
      veredicto: puertasDadas === "invaden" ? "fail" : "ok",
      valor: { texto: puertasDadas === "invaden" ? "barren el pasillo" : "no barren el pasillo" },
      manda: { tipo: "decision_proyectista", decision: "barrido de las puertas" },
      cita: ["SUA 2 · ap. 1.2 pto 1", "Figura 1.1"],
      detalle: { clase: "puertas", barrido: puertasDadas, donde },
    });
  }

  // ── Puertas automáticas y de garaje ───────────────────────────────────────
  const garajeVivienda = hay("garaje_vivienda");
  if (e.garaje || garajeVivienda) {
    elementos.push({
      id: "automaticas",
      nombre: "Puerta de garaje y puertas automáticas",
      tipo: "puertas",
      veredicto: "ok",
      valor: { texto: "marcado CE" },
      manda: { tipo: "decision_proyectista", decision: "reglamentación específica" },
      cita: ["SUA 2 · ap. 1.2 ptos 3 y 4", "SUA 2 · ap. 2 pto 2"],
      detalle: { clase: "automaticas", garajeVivienda },
    });
  }

  // ── Vidrios: una fila de la tabla 1.1 por cada rango de diferencia de cota ─
  const sobre: PlantaVidrio[] = e.plantas
    .filter((pl) => pl.nivel >= 0 && pl.zonas.length > 0)
    .map((pl) => ({ nivel: pl.nivel, etiqueta: pl.etiqueta, cota_m: Math.round(pl.cota_m * 100) / 100 }));
  for (const fila of FILAS_VIDRIO) {
    const plantas = sobre.filter((pl) => filaVidrioSua2(pl.cota_m) === fila);
    // Las puertas y mamparas interiores no tienen desnivel: siempre la fila menor.
    const interiores = fila === "menor055";
    if (plantas.length === 0 && !interiores) continue;
    elementos.push({
      id: `vidrios-${fila}`,
      nombre: fila === "menor055" ? "Vidrios de planta baja e interiores" : fila === "entre055y12" ? "Vidrios de fachada, de 0,55 a 12 m" : "Vidrios de fachada, a más de 12 m",
      tipo: "vidrio",
      veredicto: "ok",
      valor: { texto: "X(Y)Z de la tabla 1.1" },
      manda: { tipo: "grado_tabla", tabla: "Tabla 1.1", entradas: [{ k: "Diferencia de cotas", v: fila }] },
      cita: ["SUA 2 · ap. 1.3 pto 1", "Tabla 1.1"],
      detalle: { clase: "vidrios", fila, plantas, interiores },
    });
  }

  // ── Mamparas y puertas de vidrio ──────────────────────────────────────────
  elementos.push({
    id: "mamparas",
    nombre: "Puertas de vidrio y mamparas de ducha",
    tipo: "vidrio",
    veredicto: "ok",
    valor: { texto: "laminado o templado" },
    manda: { tipo: "decision_proyectista", decision: "vidrio de seguridad" },
    cita: ["SUA 2 · ap. 1.3 pto 3"],
    detalle: { clase: "mamparas", viviendas: e.residencial },
  });

  // ── Señalización de grandes acristalamientos (no en el interior de viviendas) ─
  const dondeSenal: string[] = [];
  if (hay("comun")) dondeSenal.push(e.residencial ? "el portal y las zonas comunes" : "el vestíbulo");
  if (hay("oficinas")) dondeSenal.push("las oficinas");
  if (e.garaje) dondeSenal.push("el garaje");
  if (dondeSenal.length > 0) {
    elementos.push({
      id: "senalizacion",
      nombre: "Señalización de acristalamientos",
      tipo: "vidrio",
      veredicto: "ok",
      valor: { texto: "0,85–1,10 y 1,50–1,70 m" },
      manda: { tipo: "decision_proyectista", decision: "señalización" },
      cita: ["SUA 2 · ap. 1.4"],
      detalle: { clase: "senalizacion", donde: dondeSenal },
    });
  }

  // ── Atrapamiento ──────────────────────────────────────────────────────────
  elementos.push({
    id: "atrapamiento",
    nombre: "Atrapamiento con puertas correderas",
    tipo: "atrapamiento",
    veredicto: "ok",
    valor: { valor: 20, unidad: "cm" },
    manda: { tipo: "decision_proyectista", decision: "holgura de correderas" },
    cita: ["SUA 2 · ap. 2", "Figura 2.1"],
    detalle: { clase: "atrapamiento" },
  });

  // ── El local sin uso ──────────────────────────────────────────────────────
  for (const z of e.zonas.filter((x) => x.clase === "local")) {
    elementos.push({
      id: `local-${z.id}`,
      nombre: `Local sin uso (${z.plantas})`,
      tipo: "local",
      veredicto: "previsto",
      valor: { texto: "con su actividad" },
      manda: { tipo: "decision_proyectista", decision: "previsión" },
      cita: ["SUA 2"],
      detalle: { clase: "local", zona: z },
    });
  }

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return {
    elementos,
    avisos,
    veredicto,
    decisiones: { alturas, puertas: puertasDadas },
    habituales: { alturas: habitualesAltura, puertas: PUERTAS_HABITUAL },
    unifamiliar,
    clases,
    conPasillos,
  };
}
