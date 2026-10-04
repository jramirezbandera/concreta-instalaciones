// =============================================================================
// DB-SI, SI 1 — La memoria redactada (feature-19): sectores, lo que los separa,
// los locales de riesgo especial, los espacios ocultos y la reacción al fuego,
// cada cosa con su cita. Se redacta solo a partir de la justificación. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import { limiteDe } from "../si/sectores";
import { REACCION_TABLA_4_1, SECTORES_TABLA_1_1, VESTIBULO_INDEPENDENCIA } from "../si/tablas";
import { construida, m2, NOMBRE_USO_SECTOR } from "../si/textos";
import type { DetalleSi1, JustificacionSi1 } from "./justificacion";
import { porQueLocal } from "./textos";

const R41 = REACCION_TABLA_4_1.datos;

function de<C extends DetalleSi1["clase"]>(j: JustificacionSi1, clase: C): { nombre: string; d: Extract<DetalleSi1, { clase: C }> }[] {
  return j.elementos.flatMap((el) => (el.detalle.clase === clase ? [{ nombre: el.nombre, d: el.detalle as Extract<DetalleSi1, { clase: C }> }] : []));
}

function parrafoSectores(j: JustificacionSi1): Trozo[] {
  const c = j.comp;
  const p = de(j, "principal")[0].d;
  const s = p.sector;
  const max = m2(SECTORES_TABLA_1_1.datos.sectorMax_m2);
  if (p.unifamiliar) {
    return [
      "La vivienda unifamiliar constituye un único sector de incendio, de ",
      { v: construida(s.superficie.construida_m2, s.superficie.supuesta) },
      ` construidos, que no excede de los ${max} que admite el uso Residencial Vivienda (SI 1, tabla 1.1); una vivienda unifamiliar no precisa sectores en su interior.`,
    ];
  }
  const out: Trozo[] = [`El edificio se compartimenta en ${c.sectores.length === 1 ? "un único sector" : `${c.sectores.length} sectores`} de incendio (SI 1, tabla 1.1). `];
  const quien = s.uso === "administrativo" ? "Las oficinas" : "Las viviendas, con sus zonas comunes,";
  if (s.porPlantas && s.plantaMayor) {
    out.push(`${quien} suman ${m2(s.superficie.construida_m2)} construidos y se sectorizan por plantas; la mayor, ${s.plantaMayor.etiqueta}, tiene `, { v: construida(s.plantaMayor.construida_m2, s.plantaMayor.supuesta) }, `, sin exceder de ${max}.`);
  } else {
    out.push(`${quien} forman un sector de `, { v: construida(s.superficie.construida_m2, s.superficie.supuesta) }, ` construidos, que no excede de ${max}.`);
  }
  for (const { d } of de(j, "sector")) {
    const sec = d.sector;
    if (sec.uso === "aparcamiento") {
      out.push(` El garaje, de ${construida(sec.superficie.construida_m2, sec.superficie.supuesta)} construidos, es uso Aparcamiento por exceder de 100 m² y constituye un sector diferenciado; toda comunicación con el resto del edificio se hace a través de vestíbulo de independencia.`);
    } else if (sec.id.startsWith("local-")) {
      out.push(
        sec.usoSupuesto
          ? " El local de planta baja, sin actividad definida, constituye un sector propio al que se aplican las condiciones del uso Comercial, el más exigente; la obra de terminación para su uso justificará lo que le corresponda."
          : ` El local constituye un sector propio de uso ${NOMBRE_USO_SECTOR[sec.uso]}.`,
      );
    } else {
      out.push(` ${sec.id === "oficinas" ? "Las oficinas" : "Las viviendas"} constituyen un sector propio.`);
    }
  }
  for (const { d } of de(j, "exenta")) {
    out.push(
      ` ${d.exenta.zona.uso === "oficinas" ? "Las oficinas" : "El local, de uso Administrativo,"} no exceden de 500 m² construidos y no precisan constituir sector propio.`,
    );
  }
  return out;
}

function parrafoResistencia(j: JustificacionSi1): Trozo[] {
  const c = j.comp;
  const sectores = c.sectores.filter((s) => !s.principal);
  if (sectores.length === 0 && !c.principal.porPlantas) return [];
  const out: Trozo[] = [`Conforme a la tabla 1.2 (altura de evacuación del edificio ${fmt(c.h_m, "m", 2)}), `];
  const frases: Trozo[][] = sectores.map((s) => {
    const l = limiteDe(c, s);
    const quien = s.uso === "aparcamiento" ? "el garaje" : s.id.startsWith("local-") ? "el local" : s.id === "oficinas" ? "las oficinas" : "las viviendas";
    const f: Trozo[] = [`los elementos que separan ${quien} del resto del edificio son `, { v: `EI ${l.ei}` }];
    if (l.techo) f.push(`, con techo REI ${l.ei}`);
    f.push(
      l.vestibulo
        ? `, y el vestíbulo de independencia tiene paredes EI ${VESTIBULO_INDEPENDENCIA.datos.paredes_EI} y dos puertas EI2 ${l.puerta_EI2}-C5`
        : `; sus puertas de paso, si las tiene, son EI2 ${l.puerta_EI2}-C5`,
    );
    return f;
  });
  frases.forEach((f, i) => {
    if (i > 0) out.push(i === frases.length - 1 ? "; y " : "; ");
    out.push(...f);
  });
  if (c.principal.porPlantas) out.push(`${frases.length > 0 ? "; " : ""}los forjados entre plantas mantienen la compartimentación de los sectores`);
  out.push(".");
  if (sectores.some((s) => s.uso === "aparcamiento")) {
    out.push(" El ascensor que comunica el garaje con otras plantas lo hace a través de vestíbulo de independencia (SI 1, ap. 1 pto 4).");
  }
  return out;
}

function parrafoEntreViviendas(j: JustificacionSi1): Trozo[] {
  const e = de(j, "entre_viviendas")[0];
  if (!e) return [];
  return ["Los elementos que separan las viviendas entre sí son al menos ", { v: `EI ${e.d.ei}` }, " (SI 1, tabla 1.1)."];
}

function parrafosLocales(j: JustificacionSi1): Trozo[][] {
  const out: Trozo[][] = [];
  for (const { nombre, d } of de(j, "local")) {
    const k = d.condiciones;
    const l = d.local;
    out.push([
      `${nombre} (${l.zona.plantas}) es local de riesgo especial `,
      { v: l.clase },
      ` (SI 1, tabla 2.1: ${porQueLocal(l)}). Cumple la tabla 2.2: estructura R ${k.R}, paredes y techo EI ${k.EI}${k.subePorNota2 ? ", no menos que los sectores del uso al que sirve (nota 2)" : ""}, ${k.vestibulo ? `vestíbulo de independencia con dos puertas EI2 ${k.puerta_EI2}-C5` : `puerta EI2 ${k.puerta_EI2}-C5`} y recorrido hasta alguna de sus salidas no mayor que ${fmt(k.recorrido_m, "m", 0)}.`,
    ]);
  }
  const no = de(j, "no_local");
  if (no.length > 0) {
    out.push([
      `${listaY(no.map(({ nombre, d }) => `${nombre.toLowerCase()} (${d.zona.plantas}${d.motivo === "trasteros" ? `, ${construida(d.zona.construida.valor, d.zona.construida.supuesto)}` : ""})`)).replace(/^./, (x) => x.toUpperCase())} no ${no.length > 1 ? "son locales" : "es local"} de riesgo especial conforme a la tabla 2.1.`,
    ]);
  }
  return out;
}

function parrafoOcultos(): Trozo[] {
  return [
    "La compartimentación se mantiene en los espacios ocultos (patinillos, cámaras, falsos techos, suelos elevados) y en los pasos de instalaciones, con compuertas o dispositivos EI t (i↔o) o elementos pasantes de la misma resistencia, salvo las penetraciones de sección de paso no mayor que 50 cm² (SI 1, ap. 3).",
  ];
}

function parrafoReaccion(j: JustificacionSi1): Trozo[] {
  const r = de(j, "reaccion")[0].d;
  const out: Trozo[] = [
    `Los revestimientos que superan el ${R41.umbral_pct} % de paredes, techos o suelos de cada recinto son de clase `,
    { v: `${R41.zonasOcupables.techosParedes} / ${R41.zonasOcupables.suelos}` },
    ` en las zonas ocupables, excluido el interior de las viviendas`,
  ];
  if (r.garaje || r.locales > 0) out.push(`; ${R41.aparcamientosRiesgo.techosParedes} / ${R41.aparcamientosRiesgo.suelos} en ${r.garaje ? "el garaje y " : ""}los locales de riesgo especial`);
  out.push(`; ${R41.protegidos.techosParedes} / ${R41.protegidos.suelos} en escaleras y pasillos protegidos, si los hay; y ${R41.espaciosOcultos.techosParedes} / ${R41.espaciosOcultos.suelos} en los espacios ocultos no estancos (SI 1, tabla 4.1).`);
  return out;
}

function tabla(j: JustificacionSi1): MemoriaDoc["tabla"] {
  const filas: string[][] = [];
  const c = j.comp;
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase === "principal") filas.push([el.nombre, d.unifamiliar ? "Residencial Vivienda" : NOMBRE_USO_SECTOR[d.sector.uso], construida(d.sector.superficie.construida_m2, d.sector.superficie.supuesta), "sector"]);
    if (d.clase === "sector") {
      const l = limiteDe(c, d.sector);
      filas.push([el.nombre, NOMBRE_USO_SECTOR[d.sector.uso], construida(d.sector.superficie.construida_m2, d.sector.superficie.supuesta), `EI ${l.ei}${l.vestibulo ? " · vestíbulo" : ""}`]);
    }
    if (d.clase === "local") filas.push([`${el.nombre} (${d.local.zona.plantas})`, `riesgo ${d.local.clase}`, d.local.s_m2 !== undefined ? m2(d.local.s_m2) : "—", `R ${d.condiciones.R} · EI ${d.condiciones.EI}`]);
  }
  return { cabecera: ["Sector o local", "Uso o riesgo", "Superficie construida", "Resistencia"], filas };
}

export function memoriaSi1(j: JustificacionSi1): MemoriaDoc {
  const parrafos = [parrafoSectores(j), parrafoResistencia(j), parrafoEntreViviendas(j), ...parrafosLocales(j), parrafoOcultos(), parrafoReaccion(j)].filter((p) => p.length > 0);
  return {
    titulo: "Propagación interior",
    norma: "DB-SI 1",
    parrafos,
    tabla: tabla(j),
    fuente: ["DB-SI · SI 1 (consolidado 4-mar-2025)", "tablas 1.1, 1.2, 2.1, 2.2 y 4.1", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
