// =============================================================================
// DB-HS3 — La memoria redactada (feature-15, HS3): el texto que el proyectista
// copia a su memoria justificativa. Se redacta solo a partir de la
// justificación: se revisa, no se edita. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { ElementoHs3, JustificacionHs3 } from "./justificacion";
import type { TipoVentilacion } from "./red";
import { elLocal, q } from "./textos";

export interface MemoriaHs3 extends MemoriaDoc {
  tabla: { cabecera: string[]; filas: string[][] };
}

const NUM = ["cero", "un", "dos", "tres", "cuatro", "cinco", "seis"];

function n0(v: number): string {
  return fmt(v, undefined, 0);
}

function dormitorios(n: number): string {
  return `${n <= 6 ? NUM[n] : n} ${n === 1 ? "dormitorio" : "dormitorios"}`;
}

function delTipo(j: JustificacionHs3, t: TipoVentilacion): ElementoHs3[] {
  return j.elementos.filter((e) => "tipo" in e.detalle && (e.detalle as { tipo?: TipoVentilacion }).tipo === t);
}

// -----------------------------------------------------------------------------

function parrafoSistema(j: JustificacionHs3): Trozo[] {
  if (j.red.tipos.length === 0) return [];
  const d = j.red.decisiones;
  const entra = d.admision === "aireadores" ? "aireadores en la carpintería" : "aberturas fijas en la fachada";
  return [
    `${j.red.unifamiliar ? "La vivienda se ventila" : "Las viviendas se ventilan"} con un sistema ${d.sistema === "mecanica" ? "mecánico" : "híbrido"} conforme a la sección HS 3 del DB-HS. El aire entra por ${entra} de dormitorios y salón, pasa por las puertas interiores y se extrae por rejillas en los locales húmedos, conectadas a conductos que ${d.sistema === "mecanica" ? "llegan a extractores en la cubierta" : "lo sacan a la cubierta por tiro natural, asistido por extractores cuando no basta"}.`,
  ];
}

function parrafoCaudales(j: JustificacionHs3): Trozo[] {
  if (j.red.tipos.length === 0) return [];
  const p: Trozo[] = ["Los caudales se toman de la tabla 2.1."];
  const proporcional = j.red.decisiones.equilibrado === "proporcional";
  for (const t of j.red.tipos) {
    const e = t.equilibrado;
    const humedos = t.locales.filter((l) => l.humedo);
    const quien = j.red.unifamiliar ? "En la vivienda" : `En la vivienda ${t.nombre}`;
    p.push(
      ` ${quien}, de ${dormitorios(t.dormitorios)}, los locales húmedos deben extraer al menos `,
      { v: `${q(e.saleTabla_l_s)} l/s` },
      humedos.every((l) => Math.abs(l.conTotal_l_s - humedos[0].conTotal_l_s) < 0.05)
        ? humedos.length > 1
          ? ` (${q(humedos[0].conTotal_l_s)} l/s cada uno)`
          : ""
        : ` (${humedos.map((l) => `${l.nombre.toLowerCase()}: ${q(l.conTotal_l_s)}`).join("; ")})`,
    );
    if (e.aumenta === "admision") {
      const salon = t.locales.find((l) => l.id === "salon");
      p.push(
        `, mientras que los secos solo piden ${q(e.entraTabla_l_s)}; para igualar admisión y extracción, `,
        proporcional
          ? `todos los secos suben en proporción hasta sumar ${q(e.equilibrado_l_s)} l/s.`
          : `el salón pasa de ${q(salon?.minimo_l_s ?? 0)} a `,
      );
      if (!proporcional) p.push({ v: `${q(salon?.adoptado_l_s ?? 0)} l/s` }, ".");
    } else if (e.aumenta === "extraccion") {
      p.push(
        `, y los secos piden ${q(e.entraTabla_l_s)}; para igualar, ${proporcional ? "los húmedos suben en proporción" : "la cocina extrae la diferencia"} hasta sumar ${q(e.equilibrado_l_s)} l/s.`,
      );
    } else {
      p.push(", lo mismo que piden los secos.");
    }
  }
  p.push(" La cocina dispone además de una extracción de 50 l/s para la campana, con conducto propio.");
  return p;
}

function parrafoAberturas(j: JustificacionHs3): Trozo[] {
  if (j.red.tipos.length === 0) return [];
  let mayor: { area: number; nombre: string; tipo: string } | null = null;
  for (const t of j.red.tipos) {
    const paso = delTipo(j, t).find((e) => e.detalle.clase === "paso");
    if (paso && paso.detalle.clase === "paso") {
      const m = paso.detalle.pasos.reduce((a, b) => (b.area_cm2 > a.area_cm2 ? b : a));
      if (!mayor || m.area_cm2 > mayor.area) mayor = { area: m.area_cm2, nombre: elLocal(m.local), tipo: t.nombre };
    }
  }
  const p: Trozo[] = [
    "Las aberturas se dimensionan con la tabla 4.1 sobre el caudal adoptado: admisión y extracción de 4·qv, y pasos de al menos 70 cm² u 8·qv",
  ];
  if (mayor && mayor.area > 70) {
    p.push(`, que en ${mayor.nombre}${j.red.unifamiliar ? "" : ` de ${mayor.tipo}`} llega a `, { v: `${n0(mayor.area)} cm²` });
  }
  p.push(".");
  return p;
}

function parrafoConductos(j: JustificacionHs3): Trozo[] {
  const cs = j.elementos.filter((e) => e.detalle.clase === "conductos");
  if (cs.length === 0) return [];
  const mecanica = j.red.decisiones.sistema === "mecanica";
  const p: Trozo[] = [
    mecanica
      ? "Los conductos de extracción se dimensionan con la fórmula 4.1 del apartado 4.2.2 (S ≥ 2,5·qvt)."
      : `Los conductos de extracción se dimensionan con las tablas 4.2 a 4.4, para la zona térmica ${j.zona}.`,
  ];
  for (const el of cs) {
    if (el.detalle.clase !== "conductos") continue;
    const m = el.detalle.manda;
    const donde = j.red.unifamiliar ? "" : ` de la vertical ${el.detalle.tipo.nombre}`;
    p.push(
      ` El más cargado${donde}, el de ${elLocal({ tipo: m.localId === "cocina" ? "cocina" : "bano", nombre: m.nombre })}, recoge ${m.plantas > 1 ? `${m.plantas} plantas × ${q(m.qvt_l_s / m.plantas)} = ` : ""}${q(m.qvt_l_s)} l/s y necesita ${n0(m.seccion_cm2)} cm²`,
      ...(m.diametro_mm !== null ? [", un ", { v: `Ø${n0(m.diametro_mm)}` }] : [` (clase de tiro ${m.claseTiro})`]),
      ".",
    );
  }
  return p;
}

function parrafoGaraje(j: JustificacionHs3): Trozo[] {
  const p: Trozo[] = [];
  const mecanica = j.red.decisiones.garaje === "mecanica";
  for (const g of j.red.garajes) {
    const ab = j.elementos.find((e) => e.id === `${g.id}-aberturas`);
    const co = j.elementos.find((e) => e.id === `${g.id}-co`);
    const conCo = co?.detalle.clase === "co" && co.detalle.exigida;
    p.push(
      `${p.length > 0 ? " " : ""}El garaje, de ${g.plazas} ${g.plazas === 1 ? "plaza" : "plazas"}, se ventila ${mecanica ? "mecánicamente" : "de forma natural"} con un caudal de `,
      { v: `${n0(g.caudal_l_s)} l/s` },
      " (120 l/s por plaza, tabla 2.2)",
    );
    if (ab?.detalle.clase === "aberturas_garaje") {
      const a = ab.detalle;
      p.push(
        mecanica
          ? `, con ${a.pares} aberturas de admisión y ${a.pares} de extracción${a.redes > 1 ? " en dos redes" : ""}`
          : `, con aberturas mixtas de ${n0(a.mixtasPorFachada_cm2)} cm² en dos fachadas opuestas`,
      );
    }
    p.push(conCo ? " y detección de monóxido de carbono que activa los extractores." : ".");
  }
  for (const t of j.red.trasteros) {
    p.push(
      `${p.length > 0 ? " " : ""}Los trasteros, de ${n0(t.superficie_m2)} m², extraen `,
      { v: `${q(t.caudal_l_s)} l/s` },
      t.conGarajeId ? " con la ventilación del garaje." : " con su propio sistema.",
    );
  }
  return p;
}

function parrafoRite(j: JustificacionHs3): Trozo[] {
  const r = j.red.rite;
  const p: string[] = [];
  if (r.locales > 0) p.push("El local sin uso definido se ventilará conforme al RITE cuando se proyecte su actividad.");
  if (r.oficinas > 0) p.push("Las oficinas quedan fuera del ámbito del HS 3: su calidad del aire se justifica con el RITE (IT 1.1.4.2).");
  return p.length > 0 ? [p.join(" ")] : [];
}

function tabla(j: JustificacionHs3): MemoriaHs3["tabla"] {
  const t = j.red.tipos[0];
  if (!t) return { cabecera: [], filas: [] };
  const calc = j.porTipo.get(t.tipoId);
  const filas = t.locales.map((l) => {
    const r = calc?.porEstancia.find((e) => e.id === l.id);
    return [l.nombre, `${q(l.minimo_l_s)}`, `${q(l.adoptado_l_s)} l/s`, r ? `${n0(r.areaAbertura_cm2)} cm²` : "—"];
  });
  return {
    cabecera: [j.red.unifamiliar ? "Local" : `Local · vivienda ${t.nombre}`, "Mínimo", "Adoptado", "Abertura"],
    filas,
  };
}

export function memoriaHs3(j: JustificacionHs3): MemoriaHs3 {
  const tablas = ["2.1"];
  if (j.red.garajes.length > 0 || j.red.trasteros.length > 0) tablas.push("2.2");
  tablas.push("4.1");
  if (j.red.decisiones.sistema === "hibrida") tablas.push("4.2", "4.3", "4.4");
  return {
    titulo: "Calidad del aire interior",
    norma: "DB-HS 3",
    parrafos: [
      parrafoSistema(j),
      parrafoCaudales(j),
      parrafoAberturas(j),
      parrafoConductos(j),
      parrafoGaraje(j),
      parrafoRite(j),
    ].filter((p) => p.length > 0),
    tabla: tabla(j),
    fuente: [
      "DB-HS · HS 3 (consolidado 14-06-2022)",
      `tablas ${listaY(tablas)}`,
      "ap. 3.1 y 4.2",
      "datos de El edificio y de las viviendas tipo",
      `motor ${ENGINE_VERSION}`,
    ].join(" · "),
  };
}
