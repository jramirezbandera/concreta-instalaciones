// =============================================================================
// DB-SI, SI 6 — La memoria redactada (feature-19): la R de cada planta con su
// porqué, los locales de riesgo especial y, si es de hormigón, las dimensiones
// del Anejo C. Se redacta solo a partir de la justificación. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import { USOS } from "../../lib/edificio/usos";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { DetalleSi6, JustificacionSi6 } from "./justificacion";
import { NOMBRE_FORJADO, porQueR, textoForjado, textoSoporte } from "./textos";

function plantas(j: JustificacionSi6): Extract<DetalleSi6, { clase: "planta" }>[] {
  return j.elementos.flatMap((el) => (el.detalle.clase === "planta" ? [el.detalle] : []));
}

function parrafoR(j: JustificacionSi6): Trozo[] {
  const h = j.comp.h_m;
  const out: Trozo[] = [
    `La resistencia al fuego de los elementos estructurales principales se establece con las tablas 3.1 y 3.2 de SI 6, para una altura de evacuación del edificio de ${fmt(h, "m", 2)}: `,
  ];
  const ps = plantas(j);
  ps.forEach((p, i) => {
    if (i > 0) out.push(i === ps.length - 1 ? "; y " : "; ");
    out.push(`${p.plantas}, `, { v: `R ${p.R}` }, ` (${porQueR(p.manda, h)})`);
  });
  out.push(". La resistencia de cada forjado es la del sector que tiene debajo (tabla 3.1, nota 1).");
  return out;
}

function parrafoLocales(j: JustificacionSi6): Trozo[] {
  const locales = plantas(j).flatMap((p) => p.zonas.filter((z) => z.motivo === "riesgo"));
  if (locales.length === 0) return [];
  return [
    `La estructura de los locales de riesgo especial (${listaY(locales.map((z) => `${USOS[z.zona.uso].etiqueta.toLowerCase()} de ${z.zona.plantas}, R ${z.R}`))}) cumple la tabla 3.2, sin ser inferior a la de la estructura portante de su planta.`,
  ];
}

function parrafoHormigon(j: JustificacionSi6): Trozo[] {
  const el = j.elementos.find((x) => x.id === "hormigon");
  if (!el) return [];
  const d = el.detalle;
  if (d.clase === "otro_material") {
    return [`La estructura es de ${d.material}; su resistencia al fuego se justifica conforme al ${d.material === "acero" ? "Anejo SI D" : "Anejo SI E"}, con la protección que se defina o mediante ensayo.`];
  }
  if (d.clase !== "hormigon") return [];
  const dec = j.decisiones;
  const out: Trozo[] = [`La estructura es de hormigón armado y se justifica con las tablas del Anejo C: `];
  d.Rs.forEach((r, i) => {
    if (i > 0) out.push("; ");
    const enGaraje = d.garaje && j.plantas.some((p) => p.R === r && p.zonas.some((z) => z.zona.uso === "garaje"));
    out.push(`para `, { v: `R ${r}` }, `, ${textoSoporte(r)} (tabla C.2) y forjado ${NOMBRE_FORJADO[dec.forjado]} con ${textoForjado(dec.forjado, r, enGaraje && dec.techoGaraje === "sin_revestir")}`);
  });
  out.push(
    ". Las distancias a son distancias mínimas equivalentes al eje de las armaduras; los revestimientos de yeso cuentan 1,8 veces su espesor. Desde R 90, la armadura de negativos de los forjados continuos se prolonga hasta el 33 % del tramo con al menos el 25 % de la cuantía de los extremos.",
  );
  return out;
}

function parrafoEscaleras(): Trozo[] {
  return [
    "Los elementos estructurales contenidos en una escalera protegida o en un pasillo protegido son como mínimo R 30; a los de una escalera especialmente protegida no se les exige resistencia (SI 6, ap. 3 pto 3).",
  ];
}

export function memoriaSi6(j: JustificacionSi6): MemoriaDoc {
  const parrafos = [parrafoR(j), parrafoLocales(j), parrafoHormigon(j), parrafoEscaleras()].filter((p) => p.length > 0);
  return {
    titulo: "Resistencia al fuego de la estructura",
    norma: "DB-SI 6",
    parrafos,
    tabla: {
      cabecera: ["Planta", "Uso que manda", "R exigida"],
      filas: plantas(j).map((p) => [p.plantas, porQueR(p.manda, j.comp.h_m), `R ${p.R}`]),
    },
    fuente: ["DB-SI · SI 6 (consolidado 4-mar-2025)", "tablas 3.1 y 3.2", j.decisiones.material === "hormigon" ? "Anejo C" : "", "datos de El edificio", `motor ${ENGINE_VERSION}`]
      .filter((x) => x)
      .join(" · "),
  };
}
