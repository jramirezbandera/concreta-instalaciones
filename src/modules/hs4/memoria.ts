// =============================================================================
// DB-HS4 — La memoria redactada (feature-15, HS4): el texto que el proyectista
// copia a su memoria justificativa. Se redacta solo a partir de la
// justificación: se revisa, no se edita. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { cuantos, listaY } from "../../lib/cte/redaccion";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { ElementoHs4, JustificacionHs4 } from "./justificacion";
import { NOMBRE_TUBERIA } from "./red";
import { describirPunto, nombrePlanta, valorCorto } from "./textos";

export interface MemoriaHs4 extends MemoriaDoc {
  tabla: { cabecera: string[]; filas: string[][] };
}

function n0(v: number): string {
  return fmt(v, undefined, 0);
}
function n1(v: number): string {
  return fmt(v, undefined, 1);
}
function n2(v: number): string {
  return fmt(v, undefined, 2);
}
function mm(v: number | null): string {
  return v === null ? "Ø—" : `Ø${n0(v)} mm`;
}

function delTipo<T extends ElementoHs4["detalle"]["clase"]>(
  j: JustificacionHs4,
  clase: T,
): (ElementoHs4 & { detalle: Extract<ElementoHs4["detalle"], { clase: T }> })[] {
  return j.elementos.filter((e) => e.detalle.clase === clase) as (ElementoHs4 & {
    detalle: Extract<ElementoHs4["detalle"], { clase: T }>;
  })[];
}

// -----------------------------------------------------------------------------
// Párrafos
// -----------------------------------------------------------------------------

function parrafoRed(j: JustificacionHs4): Trozo[] {
  const p: Trozo[] = ["La instalación se ha dimensionado conforme a la sección HS 4 del DB-HS."];
  const ac = j.elementos.find((e) => e.detalle.clase === "acometida");
  const red = j.red;
  const tub = NOMBRE_TUBERIA[red.decisiones.tuberia];
  if (j.modo === "manual") {
    p.push(" La red de agua fría se ha definido tramo a tramo");
    if (ac) p.push(", con una acometida ", { v: mm(ac.detalle.clase === "acometida" ? ac.detalle.acometida.diametro_mm : null) });
    p.push(".");
    return p;
  }
  if (ac && ac.detalle.clase === "acometida") {
    p.push(" La acometida de polietileno ", { v: mm(ac.detalle.acometida.diametro_mm) });
  }
  const c = red.contadores;
  const quienes = listaY(
    [
      c.viviendas > 0 ? cuantos(c.viviendas, "vivienda", "viviendas", "f") : "",
      c.oficinas > 0 ? (c.oficinas === 1 ? "la planta de oficinas" : `${c.oficinas} plantas de oficinas`) : "",
      c.locales > 0 ? (c.locales === 1 ? "el local" : "los locales") : "",
      c.comunes ? "las zonas comunes" : "",
    ].filter(Boolean),
  );
  const montantes = delTipo(j, "montante");
  const dM = montantes.length > 0 ? listaY([...new Set(montantes.map((m) => valorCorto(m)))]) : null;
  if (red.unifamiliar) {
    p.push(` llega al contador general, del que sale la instalación interior de ${tub}.`);
  } else if (red.decisiones.contadores === "por_planta") {
    p.push(
      ` alimenta un montante general de ${tub}`,
      ...(dM ? [" ", { v: `${dM} mm` }] : []),
      ` con los contadores de cada planta (${quienes}).`,
    );
  } else {
    p.push(
      ` llega a una batería de ${c.total} contadores en planta baja —${quienes}—, de la que sale un montante por ${c.oficinas > 0 && c.viviendas === 0 ? "planta" : "vivienda"} de ${tub}`,
      ...(dM ? [" ", { v: `${dM} mm` }] : []),
      ".",
    );
  }
  return p;
}

function parrafoCaudal(j: JustificacionHs4): Trozo[] {
  const caudales = delTipo(j, "caudal");
  if (caudales.length === 0) return [];
  const p: Trozo[] = [];
  caudales.forEach((el, i) => {
    const t = el.detalle.tramo;
    const u = el.detalle.unidad;
    const sujeto =
      u.clase === "oficinas"
        ? "cada planta de oficinas"
        : u.clase === "comunes"
          ? "los servicios comunes"
          : j.red.unifamiliar
          ? "la vivienda"
          : `cada vivienda ${u.nombreTipo}`;
    p.push(
      `${i === 0 ? "El" : " El"} caudal de cálculo de ${sujeto} es de `,
      { v: `${n2(t.caudalCalculo_dm3_s)} dm³/s` },
      `: sus ${t.numAparatos} aparatos suman ${n2(t.caudalAcumulado_dm3_s)} dm³/s (tabla 2.1) y se aplica un coeficiente de simultaneidad K = ${t.numAparatos >= 2 ? `1/√(n−1) = ${n2(t.k)}` : "1"}.`,
    );
  });
  p.push(" El coeficiente es el del método tradicional, como el criterio adecuado que pide el DB (ap. 4.2.1).");
  const montantes = delTipo(j, "montante");
  if (montantes.length > 0) {
    const vs = montantes.map((m) => m.detalle.tramo.velocidad_m_s ?? 0);
    const m0 = montantes[0].manda;
    const rango = m0.tipo === "velocidad" ? `${n1(m0.min_m_s)} a ${n1(m0.max_m_s)} m/s` : "";
    const vTxt =
      vs.length === 1 || Math.abs(Math.max(...vs) - Math.min(...vs)) < 0.05
        ? `en ${n1(vs[0])} m/s`
        : `entre ${n1(Math.min(...vs))} y ${n1(Math.max(...vs))} m/s`;
    p.push(
      ` La velocidad en ${montantes.length === 1 && montantes[0].detalle.general ? "el montante general" : "los montantes"} queda ${vTxt}, dentro del intervalo de ${rango} para tubería ${j.red.material === "metalica" ? "metálica" : "plástica"}.`,
    );
  }
  return p;
}

function parrafoPresion(j: JustificacionHs4): Trozo[] {
  const crit = j.elementos.find((e) => e.detalle.clase === "planta" && e.detalle.critico) ??
    j.elementos.find((e) => e.id === "punto-critico");
  if (!crit || crit.detalle.clase !== "planta") return [];
  const det = crit.detalle;
  const a = det.punto.aparato;
  const desc = describirPunto(det.punto, j.red.unifamiliar);
  const donde = det.nivel !== null ? ` en la ${nombrePlanta(det.nivel)}` : "";
  const g = j.red.decisiones;
  const p: Trozo[] = [
    `La presión de la red es de ${n0(j.presionRed_kPa)} kPa${j.presionSinDato ? " (supuesta: no consta el dato de la compañía)" : ""}`,
  ];
  if (g.grupoPresion) p.push(`, y se dispone un grupo de presión que da ${n0(g.presionGrupo_kPa)} kPa a su salida`);
  if (a.presionResidual_kPa >= a.presionMinExigida_kPa) {
    p.push(
      `. El grifo más desfavorable, ${desc}${donde}, dispone de `,
      { v: `${n0(a.presionResidual_kPa)} kPa` },
      `, por encima del mínimo de ${n0(a.presionMinExigida_kPa)} kPa`,
    );
  } else {
    p.push(
      `. El grifo más desfavorable, ${desc}${donde}, quedaría en `,
      { v: `${n0(a.presionResidual_kPa)} kPa` },
      `, por debajo del mínimo de ${n0(a.presionMinExigida_kPa)} kPa: es necesario un grupo de presión`,
    );
  }
  const max = j.elementos.find((e) => e.detalle.clase === "maxima");
  if (max && max.detalle.clase === "maxima") {
    const pm = max.detalle.punto.aparato.presionResidual_kPa;
    p.push(
      `; el punto con más presión queda en ${n0(pm)} kPa, ${pm <= max.detalle.maxima_kPa ? "por debajo" : "por encima"} del máximo de ${n0(max.detalle.maxima_kPa)} kPa.`,
    );
  } else p.push(".");
  if (!g.grupoPresion && det.necesaria_kPa !== null && a.presionResidual_kPa >= a.presionMinExigida_kPa) {
    p.push(` La instalación funciona sin grupo de presión con una presión de red de al menos ${n0(det.necesaria_kPa)} kPa.`);
  }
  return p;
}

function parrafoOtros(j: JustificacionHs4): Trozo[] {
  const p: Trozo[] = [];
  const g = j.red.decisiones;
  p.push(
    g.aguaCaliente === "individual"
      ? "El agua caliente se produce de forma individual en cada unidad; su producción se justifica con HE 4."
      : "El agua caliente se produce de forma centralizada; su red de impulsión y retorno se justifica aparte.",
  );
  const locales = delTipo(j, "local");
  if (locales.length > 0) {
    p.push(
      ` Para ${locales.length === 1 && locales[0].detalle.local.numero === 1 ? "el local" : "los locales"}, sin uso definido, se deja contador${g.contadores === "bateria" ? " en la batería" : ""}, llave de corte y tubería en espera ${mm(locales[0].detalle.diametro_mm)}.`,
    );
  }
  const grifos = j.red.grifosGaraje;
  if (grifos > 0) {
    p.push(
      ` El garaje tiene ${grifos === 1 ? "un grifo" : `${grifos} grifos`} de baldeo (agua fría, 0,20 dm³/s cada uno según la tabla 2.1), ${j.red.unifamiliar ? "detrás del contador de la vivienda" : "con el contador de servicios comunes"}.`,
    );
  } else if (j.red.garaje) p.push(" El garaje no tiene puntos de consumo.");
  return p;
}

function tablaPresiones(j: JustificacionHs4): MemoriaHs4["tabla"] {
  const filas: string[][] = [];
  for (const el of j.elementos) {
    const det = el.detalle;
    if (det.clase !== "planta" && det.clase !== "maxima") continue;
    if (det.clase === "maxima" && j.elementos.some((e) => e.detalle.clase === "planta" && e.detalle.punto === det.punto)) continue;
    const a = det.punto.aparato;
    const desc = describirPunto(det.punto, j.red.unifamiliar);
    const nivel = det.clase === "planta" ? det.nivel : det.punto.nivel;
    const etiqueta =
      nivel !== null ? `${desc[0].toUpperCase()}${desc.slice(1)} · ${nombrePlanta(nivel)}` : `${desc[0].toUpperCase()}${desc.slice(1)}`;
    filas.push([
      etiqueta,
      `${n1(a.altura_m)} m`,
      `${n0(a.perdidas.altura_kPa + a.perdidas.rozamiento_kPa + a.perdidas.localizadas_kPa)} kPa`,
      `${n0(a.presionResidual_kPa)} kPa`,
    ]);
  }
  return { cabecera: ["Punto", "Altura", "Pérdidas", "Presión"], filas };
}

function fuente(j: JustificacionHs4): string {
  const partes = [
    "DB-HS · HS 4 (consolidado 14-06-2022)",
    "ap. 2.1.3, 2.3, 4.2 y 4.3",
    "tablas 2.1, 4.2 y 4.3",
    "simultaneidad por el método tradicional",
    j.modo === "manual" ? "red definida por el proyectista" : "datos de El edificio",
    `motor ${ENGINE_VERSION}`,
  ];
  return partes.join(" · ");
}

export function memoriaHs4(j: JustificacionHs4): MemoriaHs4 {
  const parrafos = [parrafoRed(j), parrafoCaudal(j), parrafoPresion(j), parrafoOtros(j)].filter((p) => p.length > 0);
  return {
    titulo: "Suministro de agua",
    norma: "DB-HS 4",
    parrafos,
    tabla: tablaPresiones(j),
    fuente: fuente(j),
  };
}
