// =============================================================================
// DB-HR — Textos (feature-25): la frase de la cabecera, «Qué entra», la franja
// de cada elemento, las etiquetas del dibujo y de la lista, los avisos y lo que
// no cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import type { Condicion } from "./comprobar";
import type { DetalleHr, ElementoHr, JustificacionHr, SolucionUsada } from "./justificacion";
import { TRAMOS_HUECOS, tramoHuecos, type ColumnaHorizontal, type TipoTabiqueria } from "./tablas";

/** «28,9». */
export function n(x: number): string {
  return x.toLocaleString("es-ES", { maximumFractionDigits: 1 });
}

export const dBA = (x: number): string => `${n(x)} dBA`;
export const dB = (x: number): string => `${n(x)} dB`;
export const kg = (x: number): string => `${n(x)} kg/m²`;

export const TABIQUERIA: Record<TipoTabiqueria, string> = {
  apoyo: "fábrica con apoyo directo",
  bandas: "fábrica con bandas elásticas",
  entramado: "entramado autoportante",
};

export const COLUMNA_H: Record<ColumnaHorizontal, string> = {
  AD: "fábrica con apoyo directo",
  BE: "fábrica con bandas elásticas",
  ENT1H: "entramado, fachada de una hoja (1H)",
  ENT2H: "entramado, fachada de dos hojas (2H)",
};

const RECINTO: Record<"dormitorios" | "estancias" | "administrativo" | "cubierta", string> = {
  dormitorios: "dormitorios",
  estancias: "estancias",
  administrativo: "despachos",
  cubierta: "recintos bajo cubierta",
};

/** «LP ½ pie + yeso por ambas caras (CEC P1.4)», o con «valores propios». */
export function textoSolucion(s: SolucionUsada): string {
  return `${s.nombre} (${s.propios ? "valores propios" : `CEC ${s.codigo}`})`;
}

/** Lo mismo en mitad de una frase: «mortero 5 cm…», pero «LP ½ pie…» y «PYL 15…». */
export function solucionEnFrase(s: SolucionUsada): string {
  const t = textoSolucion(s);
  return /^\p{Lu}\p{Ll}/u.test(t) ? t.charAt(0).toLowerCase() + t.slice(1) : t;
}

function det(el: ElementoSi<unknown>): DetalleHr {
  return (el as ElementoHr).detalle;
}

const plural = (k: number, uno: string, varios: string) => `${k} ${k === 1 ? uno : varios}`;

/** Lo que falla de una lista de condiciones, en una línea. */
function fallos(cs: readonly Condicion[]): string[] {
  return cs.filter((c) => c.cumple === false).map((c) => c.texto);
}

// ── Cabecera ────────────────────────────────────────────────────────────────

export function fraseHr(j: JustificacionHr): string {
  if (!j.aplica) return "Obra en un edificio existente: el DB-HR solo se aplica a la rehabilitación integral.";
  const malos = j.elementos.filter((e) => e.veredicto === "fail");
  if (malos.length > 0) {
    return `${plural(malos.length, "elemento no cumple", "elementos no cumplen")} la opción simplificada: ${malos.map((e) => e.nombre.toLowerCase()).join(", ")}.`;
  }
  const ld = `Ld ${dBA(j.ld.valor)}${j.ld.aeronaves ? " con aeronaves" : ""}`;
  switch (j.tipologia) {
    case "aislada":
      return `Vivienda aislada con ${ld}: tabiquería, fachada y cubierta cumplen la opción simplificada.`;
    case "adosada":
      return `Vivienda adosada con ${ld}: cumple la opción simplificada del Anejo I.`;
    case "otros":
      return `Edificio sin viviendas con ${ld}: fachada y cubierta cumplen la opción simplificada.`;
    default:
      return `${plural(j.separaciones.viviendas, "vivienda", "viviendas")} con ${ld}: tabiquería, separaciones, forjados y fachadas cumplen la opción simplificada.`;
  }
}

export function metricasHr(j: JustificacionHr): string {
  const d = j.elementos.find((e) => e.id === "fachada-dormitorios" || e.id === "fachada-estancias")?.detalle;
  const D = d && d.clase === "exterior" ? ` · D2m,nT,Atr ${dBA(d.D)}` : "";
  return `Ld ${dBA(j.ld.valor)}${j.ld.supuesto ? " (sin datos)" : ""}${D} · ${j.medios ? "valores medios" : "valores mínimos"} del Catálogo`;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : "normal";
}

export function queEntraHr(j: JustificacionHr, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const s = j.separaciones;
  const filas: FilaQueEntra[] = [];
  if (j.tipologia === "plurifamiliar") {
    filas.push({
      id: "viviendas",
      titulo: "Viviendas",
      detalle: `${s.viviendas}${s.entreViviendas.length > 0 ? ` · más de una en ${s.entreViviendas.join(", ")}` : ""}`,
      trato: "unidades de uso",
      estado: trato(estados.separacion ?? estados["forjado-viviendas"]),
      elementoId: s.entreViviendas.length > 0 ? "separacion" : s.sobreViviendas.length > 0 ? "forjado-viviendas" : "tabiqueria",
    });
    const comun = [...s.conComun, ...s.sobreComun].map((c) => c.nombre);
    if (comun.length > 0) {
      filas.push({ id: "comun", titulo: "Zona común y trasteros", detalle: [...new Set(comun)].join(" · "), trato: "otro recinto", estado: trato(estados.separacion ?? estados["forjado-comun"]), elementoId: s.conComun.length > 0 ? "separacion" : "forjado-comun" });
    }
    const act = [...s.conActividad, ...s.sobreActividad, ...s.actividadEncima];
    if (act.length > 0) {
      const id = s.conActividad.length > 0 ? "separacion-actividad" : s.sobreActividad.length > 0 ? "forjado-actividad" : "forjado-encima";
      filas.push({ id: "actividad", titulo: "Actividad e instalaciones", detalle: [...new Set(act.map((c) => c.nombre))].join(" · "), trato: "entre paréntesis", estado: trato(estados[id]), elementoId: id });
    }
  } else if (j.tipologia !== "otros") {
    filas.push({
      id: "vivienda",
      titulo: j.tipologia === "aislada" ? "Vivienda aislada" : "Vivienda adosada",
      detalle: j.tipologia === "aislada" ? "una sola unidad de uso" : "Anejo I",
      trato: j.tipologia === "aislada" ? "tabiquería y fachada" : "separación con las vecinas",
      estado: trato(estados.tabiqueria ?? estados.adosada),
      elementoId: j.tipologia === "adosada" ? (j.elementos.some((e) => e.id === "adosada") ? "adosada" : "separacion") : "tabiqueria",
    });
  }
  filas.push({
    id: "exterior",
    titulo: "Ruido exterior",
    detalle: `Ld ${dBA(j.ld.valor)}${j.ld.supuesto ? ", sin datos oficiales" : ""}${j.ld.aeronaves ? " · aeronaves" : ""}`,
    trato: "tablas 2.1 y 3.4",
    estado: trato(estados["fachada-dormitorios"] ?? estados["fachada-estancias"]),
    elementoId: j.elementos.some((e) => e.id === "fachada-dormitorios") ? "fachada-dormitorios" : "fachada-estancias",
  });
  if (s.medianeras) filas.push({ id: "medianeras", titulo: "Medianeras", detalle: "las de SI 2", trato: "RA ≥ 45 dBA", estado: trato(estados.medianeria), elementoId: "medianeria" });
  return filas;
}

export function piezasHr(j: JustificacionHr): { texto: string; acento: boolean }[] {
  if (!j.aplica) return [{ texto: "edificio existente", acento: false }];
  const mal = (ids: string[]) => j.elementos.some((e) => ids.includes(e.id) && e.veredicto === "fail");
  const piezas: { texto: string; acento: boolean }[] = [];
  if (j.elementos.some((e) => e.id === "tabiqueria")) piezas.push({ texto: "tabiquería", acento: mal(["tabiqueria"]) });
  const sep = ["separacion", "separacion-actividad", "adosada", "puerta", "ascensor"];
  if (j.elementos.some((e) => sep.includes(e.id))) piezas.push({ texto: j.tipologia === "adosada" ? "entre adosadas" : "separaciones", acento: mal(sep) });
  const fj = ["forjado-viviendas", "forjado-comun", "forjado-actividad", "forjado-encima", "forjado-adosada"];
  if (j.elementos.some((e) => fj.includes(e.id))) piezas.push({ texto: "forjados", acento: mal(fj) });
  piezas.push({ texto: "fachadas", acento: mal(["fachada-dormitorios", "fachada-estancias", "cubierta", "medianeria"]) });
  return piezas;
}

// ── Etiquetas y lista ───────────────────────────────────────────────────────

export function textoEtiquetaHr(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "tabiqueria":
      return `Tabiquería ${dBA(d.RA)}`;
    case "vertical":
      return `Tipo ${d.tipo} · ${dBA(d.RA)}${d.trasdosado ? ` + ${d.trasdosado.dRA}` : ""}`;
    case "puerta":
      return d.RA === null ? `Puerta ≥ ${d.exige} dBA` : `Puerta ${dBA(d.RA)}`;
    case "ascensor":
      return `Ascensor ${dBA(d.RA)}`;
    case "horizontal":
      return `ΔLw ${dB(d.suelo.dLw)}${d.techo ? ` · techo ${d.techo.dRA}` : ""}`;
    case "medianeria":
      return `Medianería ${dBA(d.RA)}`;
    case "adosada":
      return `2 hojas de ${dBA(d.RA)}`;
    case "forjado-adosada":
      return `ΔLw ${dB(d.suelo.dLw)}`;
    case "exterior":
      return d.recinto === "cubierta" ? `Cubierta ${dBA(d.ciega.RAtr)}` : `${d.recinto === "dormitorios" ? "Dormitorio" : d.recinto === "estancias" ? "Estancia" : "Despacho"} ${d.pct} %`;
    case "instalaciones":
      return "Instalaciones";
  }
}

export function resultadoListaHr(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "tabiqueria":
      return d.regla === "minimo"
        ? `RA ${dBA(d.RA)} frente a ${d.exigeRA}`
        : `m ${kg(d.m)} frente a ${d.exigeM}; RA ${dBA(d.RA)} frente a ${d.exigeRA} (${TABIQUERIA[d.tipo]})`;
    case "vertical": {
      const f = d.r.fila;
      if (!f) return `Tipo ${d.tipo}, ${kg(d.m)} y ${dBA(d.RA)}: sin fila en la tabla 3.2`;
      const tr = d.r.dRAExigido === null ? "sin trasdosado" : `trasdosado ${d.trasdosado ? dBA(d.trasdosado.dRA) : "ninguno"} frente a ${d.r.dRAExigido}`;
      return `Fila ${f.m} kg/m² · ${f.RA} dBA${d.caso === "actividad" ? " (entre paréntesis)" : ""}; ${tr}`;
    }
    case "puerta":
      return d.RA === null ? `Se declara RA ≥ ${d.exige} dBA; cerramiento ${dBA(d.cerramientoRA)} frente a 50` : `RA ${dBA(d.RA)} frente a ${d.exige}; cerramiento ${dBA(d.cerramientoRA)} frente a 50`;
    case "ascensor":
      return d.modo === "hueco" ? `Maquinaria en el hueco: recinto de instalaciones (${d.r?.cumple ? "cumple" : "no cumple"} la tabla 3.2 entre paréntesis)` : `Cerramiento ${dBA(d.RA)} frente a más de 50`;
    case "horizontal": {
      const f = d.r.fila;
      if (!f) return `Forjado de ${kg(d.forjado.m)}: sin solución en la tabla 3.3`;
      const c = d.r.comb;
      return `Forjado ${f.m} kg/m²; ΔLw ${dB(d.suelo.dLw)}${d.r.dLwExigido !== null ? ` frente a ${d.r.dLwExigido}` : ""}${c ? `; ΔRA ${d.suelo.dRA} + ${d.techo?.dRA ?? 0} frente a ${c.sf} + ${c.ts}` : ""}`;
    }
    case "medianeria":
    case "adosada":
      return `RA ${dBA(d.RA)} frente a ${d.exige}`;
    case "forjado-adosada":
      return d.r.fila ? `Forjado ${d.r.fila.m} kg/m²; ΔLw ${dB(d.suelo.dLw)} frente a ${d.r.dLwExigido}; ΔRA ${d.suelo.dRA} frente a ${d.r.dRAExigido}` : "Forjado sin fila en la tabla I.1";
    case "exterior":
      if (d.recinto === "cubierta") return `D2m,nT,Atr ${d.D}: RA,tr ${dBA(d.ciega.RAtr)} frente a ${d.r.ciegaExigida ?? "—"}`;
      return `D2m,nT,Atr ${d.D}, huecos ${d.pct} %: hueco ${dBA(d.hueco?.RAtr ?? 0)} frente a ${d.r.huecoExigido ?? "—"}; parte ciega ${dBA(d.ciega.RAtr)}`;
    case "instalaciones":
      return `${plural(d.condiciones.length, "condición", "condiciones")} de uniones e instalaciones que se declaran`;
  }
}

// ── La franja ───────────────────────────────────────────────────────────────

const filasCond = (cs: readonly Condicion[]) => cs.map((c) => ({ k: c.texto, v: c.cumple === false ? "no cumple" : c.cumple === null ? "se declara" : "cumple" }));

export function franjaHr(el: ElementoSi<unknown>, j: JustificacionHr, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "tabiqueria":
      return {
        clase: d.regla === "minimo" ? "Tabiquería · ap. 2.1.1 a) i" : "Tabiquería · tabla 3.1",
        titulo: el.nombre,
        valor: n(d.RA),
        unidad: `dBA · mínimo ${d.exigeRA}`,
        estado,
        manda:
          d.regla === "minimo"
            ? `En una vivienda ${j.tipologia === "adosada" ? "adosada con estructura independiente (Anejo I.1.1)" : "unifamiliar aislada"}, el RA de la tabiquería no baja de ${d.exigeRA} dBA.`
            : `La tabla 3.1 pide a la ${TABIQUERIA[d.tipo]} m ≥ ${d.exigeM} kg/m² y RA ≥ ${d.exigeRA} dBA. Su tipo decide la columna de las tablas 3.2 y 3.3.`,
        nota: d.sol.industrial ? "Producto industrial: el valor del Catálogo es orientativo; confírmalo con el fabricante." : undefined,
        filas: [
          { k: "Solución", v: textoSolucion(d.sol) },
          { k: "Tipo", v: TABIQUERIA[d.tipo] },
          { k: "m", v: d.exigeM === null ? kg(d.m) : `${kg(d.m)} · mínimo ${d.exigeM}` },
          { k: "RA", v: `${dBA(d.RA)} · mínimo ${d.exigeRA}` },
        ],
        cita: d.regla === "minimo" ? "DB-HR · ap. 2.1.1 a) i" : "DB-HR · tabla 3.1",
      };
    case "vertical": {
      const f = d.r.fila;
      return {
        clase: `Separación vertical · tabla 3.2${d.caso === "actividad" ? " (entre paréntesis)" : ""}`,
        titulo: el.nombre,
        valor: `Tipo ${d.tipo}`,
        unidad: `${kg(d.m)} · ${dBA(d.RA)}`,
        estado,
        manda:
          d.caso === "actividad"
            ? `Con un recinto de actividad o de instalaciones (DnT,A ≥ 55 dBA), los valores entre paréntesis de la tabla 3.2. Separa de: ${d.separa.join(", ")}.`
            : `Entre unidades de uso y con la zona común (DnT,A ≥ 50 dBA), la tabla 3.2. Separa de: ${d.separa.join(", ")}.`,
        nota: f ? `Fila de la tabla: ${f.m} kg/m² y ${f.RA} dBA, columna de tabiquería de ${d.columna === "fabrica" ? "fábrica" : "entramado"}.` : undefined,
        filas: [
          { k: "Solución", v: textoSolucion(d.sol) },
          ...(d.trasdosado ? [{ k: "Trasdosado", v: `${textoSolucion(d.trasdosado)}: ΔRA ${dBA(d.trasdosado.dRA)}${d.trasdosado.unaCara ? ", por una cara" : ", por ambas caras"}` }] : []),
          ...filasCond(d.r.condiciones),
          ...filasCond(d.r.flancos),
        ],
        cita: "DB-HR · tabla 3.2 y ap. 3.1.2.3.4",
      };
    }
    case "puerta":
      return {
        clase: "Puerta · ap. 3.1.2.3.4 pto 4",
        titulo: el.nombre,
        valor: d.RA === null ? `≥ ${d.exige}` : n(d.RA),
        unidad: "dBA",
        estado,
        manda: `La puerta que comunica la vivienda con la zona común: RA ≥ ${d.exige} dBA porque abre a ${d.abre === "estancia" ? "una estancia (recinto protegido)" : "un vestíbulo o pasillo (recinto habitable)"}; el cerramiento en que va, RA ≥ 50 dBA.`,
        nota: d.RA === null ? "Sin el RA de la puerta, la ficha declara el exigido para el pliego." : undefined,
        filas: [
          { k: "Abre a", v: d.abre === "estancia" ? "estancia" : "vestíbulo o pasillo" },
          { k: "Puerta", v: d.RA === null ? `RA ≥ ${d.exige} dBA (se declara)` : `${dBA(d.RA)} · mínimo ${d.exige}` },
          { k: "Cerramiento", v: `${dBA(d.cerramientoRA)} · mínimo 50` },
        ],
        cita: "DB-HR · ap. 3.1.2.3.4 pto 4 y ap. 2.1.1",
      };
    case "ascensor":
      return {
        clase: "Ascensor · ap. 3.3.3.5",
        titulo: el.nombre,
        valor: n(d.RA),
        unidad: "dBA",
        estado,
        manda:
          d.modo === "hueco"
            ? "Con la maquinaria dentro del hueco, el recinto del ascensor es un recinto de instalaciones: su cerramiento cumple la tabla 3.2 entre paréntesis (la solución hacia locales e instalaciones)."
            : "Con la maquinaria en un cuarto, los elementos que separan el hueco de cada vivienda tienen un RA mayor que 50 dBA (el elemento base con su trasdosado).",
        nota: d.habitual ? (d.modo === "hueco" ? "Sin cuarto de ascensor en El edificio: maquinaria en el hueco." : "El edificio tiene cuarto de ascensor.") : undefined,
        filas: [
          { k: "Maquinaria", v: d.modo === "hueco" ? "en el hueco" : "en un cuarto" },
          ...(d.r ? [...filasCond(d.r.condiciones), ...filasCond(d.r.flancos)] : [{ k: "RA", v: `${dBA(d.RA)} · más de 50` }]),
        ],
        cita: "DB-HR · ap. 3.3.3.5",
      };
    case "horizontal": {
      const f = d.r.fila;
      const caso = {
        viviendas: "Entre viviendas: el suelo flotante de la de arriba con su ΔLw, y una combinación de suelo flotante y techo suspendido (pto 2).",
        comun: "Sobre la zona común: la combinación de suelo flotante y techo de la fila normal (pto 3); el suelo flotante con su ΔLw, que protege también a las viviendas de al lado (pto 4).",
        actividad: "Sobre un recinto de actividad o de instalaciones (DnT,A ≥ 55 dBA): la combinación entre paréntesis, con el techo en el local; el suelo flotante con el ΔLw sin paréntesis (Guía, figura 2.1.4.11).",
        encima: "Bajo un recinto de actividad o de instalaciones (L'nT,w ≤ 60 dB): su suelo flotante con el ΔLw entre paréntesis y la combinación entre paréntesis, con el techo en la vivienda.",
      }[d.caso];
      return {
        clase: `Separación horizontal · tabla 3.3${d.caso === "actividad" || d.caso === "encima" ? " (entre paréntesis)" : ""}`,
        titulo: el.nombre,
        valor: n(d.suelo.dLw),
        unidad: `dB de ΔLw${d.r.dLwExigido !== null ? ` · mínimo ${d.r.dLwExigido}` : ""}`,
        estado,
        manda: `${caso} Separa de: ${d.separa.join(", ")}.`,
        nota: f ? `Fila del forjado ${f.m} kg/m² y ${f.RA} dBA; columna de ${COLUMNA_H[d.columna]}.${d.garaje ? " En el garaje valen además las soluciones (7)." : ""}` : undefined,
        filas: [
          { k: "Forjado", v: `${textoSolucion(d.forjado)}: ${kg(d.forjado.m)}, ${dBA(d.forjado.RA)}` },
          { k: "Suelo flotante", v: `${textoSolucion(d.suelo)}: ΔLw ${dB(d.suelo.dLw)}, ΔRA ${dBA(d.suelo.dRA)}` },
          { k: "Techo", v: d.techo ? `${textoSolucion(d.techo)}: ΔRA ${dBA(d.techo.dRA)}` : "sin techo suspendido" },
          ...filasCond(d.r.condiciones),
          ...filasCond(d.flancos),
        ],
        cita: "DB-HR · tabla 3.3 y ap. 3.1.2.3.5",
      };
    }
    case "medianeria":
      return {
        clase: "Medianería · ap. 3.1.2.4",
        titulo: el.nombre,
        valor: n(d.RA),
        unidad: `dBA · mínimo ${d.exige}`,
        estado,
        manda: "El RA de toda la superficie de la medianería no baja de 45 dBA, esté construido o no el edificio de al lado; con eso se cumplen las dos exigencias del ap. 2.1.1 c). Las medianeras son las de SI 2.",
        filas: [
          { k: "Solución", v: textoSolucion(d.sol) },
          { k: "RA", v: `${dBA(d.RA)} · mínimo ${d.exige}` },
        ],
        cita: "DB-HR · ap. 3.1.2.4",
      };
    case "adosada":
      return {
        clase: "Adosadas · Anejo I.1.2",
        titulo: el.nombre,
        valor: n(d.RA),
        unidad: `dBA cada hoja · mínimo ${d.exige}`,
        estado,
        manda: "Con la estructura de cada vivienda independiente, la separación con las vecinas es de dos hojas, cada una con RA ≥ 45 dBA.",
        filas: [
          { k: "Cada hoja", v: textoSolucion(d.sol) },
          { k: "RA", v: `${dBA(d.RA)} · mínimo ${d.exige}` },
        ],
        cita: "DB-HR · Anejo I.1.2 pto 1",
      };
    case "forjado-adosada":
      return {
        clase: "Adosadas · tabla I.1",
        titulo: el.nombre,
        valor: n(d.suelo.dLw),
        unidad: `dB de ΔLw${d.r.dLwExigido !== null ? ` · mínimo ${d.r.dLwExigido}` : ""}`,
        estado,
        manda: `Si las viviendas comparten la estructura horizontal, los forjados llevan un suelo flotante según la tabla I.1, por el tipo de la separación vertical (tipo ${d.tipo}).`,
        filas: [
          { k: "Forjado", v: `${textoSolucion(d.forjado)}: ${kg(d.forjado.m)}` },
          { k: "Suelo flotante", v: `${textoSolucion(d.suelo)}: ΔLw ${dB(d.suelo.dLw)}, ΔRA ${dBA(d.suelo.dRA)}` },
          ...(d.r.fila ? [{ k: "Pide", v: `ΔLw ≥ ${d.r.dLwExigido} dB y ΔRA ≥ ${d.r.dRAExigido} dBA (forjado ${d.r.fila.m} kg/m²)` }] : [{ k: "Pide", v: "el forjado no llega a 175 kg/m²: opción general" }]),
        ],
        cita: "DB-HR · tabla I.1 y Anejo I.1.3",
      };
    case "exterior": {
      const cubierta = d.recinto === "cubierta";
      return {
        clase: `Ruido exterior · tabla 3.4`,
        titulo: el.nombre,
        valor: n(cubierta ? d.ciega.RAtr : (d.hueco?.RAtr ?? 0)),
        unidad: cubierta ? `dBA de RA,tr · mínimo ${d.r.ciegaExigida ?? "—"}` : `dBA de RA,tr del hueco · mínimo ${d.r.huecoExigido ?? "—"}`,
        estado,
        manda: `Ld de la zona ${dBA(d.ldZona)}${d.noExpuesta ? `, ${dBA(d.ld)} en la fachada no expuesta` : ""}: los ${RECINTO[d.recinto]} piden D2m,nT,Atr ≥ ${d.D} dBA (tabla 2.1${d.aeronaves ? ", + 4 por aeronaves" : ""}). La tabla 3.4 lo convierte en un RA,tr de la parte ciega y de los huecos${cubierta ? "" : ` (${TRAMOS_HUECOS[tramoHuecos(d.pct)]})`}.`,
        nota: d.ldSupuesto
          ? "Sin el Ld en los datos de la obra, 60 dBA: el valor del DB sin datos oficiales en áreas de predominio residencial."
          : d.pctSupuesto
            ? "Porcentaje de huecos supuesto: indica el del recinto más desfavorable."
            : undefined,
        filas: [
          { k: cubierta ? "Cubierta" : "Parte ciega", v: `${textoSolucion(d.ciega)}: RA,tr ${dBA(d.ciega.RAtr)}${d.r.ciegaExigida !== null ? ` · mínimo ${d.r.ciegaExigida}` : ""}` },
          ...(d.hueco
            ? [
                { k: "Huecos", v: `${d.pct} %${d.pctSupuesto ? " (supuesto)" : ""} de la fachada vista desde dentro` },
                { k: "Ventana", v: `${textoSolucion(d.hueco)}: RA,tr ${dBA(d.hueco.ventanaRAtr)}` },
                ...(d.hueco.caja ? [{ k: "Caja de persiana", v: `${d.hueco.caja.codigo}: RA,tr ${dBA(d.hueco.caja.RAtr)}; con la ventana, ${dBA(d.hueco.RAtr)} (Anejo G, criterio)` }] : []),
              ]
            : []),
        ],
        cita: "DB-HR · tablas 2.1 y 3.4; ap. 3.1.2.5",
      };
    }
    case "instalaciones":
      return {
        clase: "Uniones e instalaciones · ap. 3.1.4 y 3.3",
        titulo: el.nombre,
        valor: String(d.condiciones.length),
        unidad: "condiciones que se declaran",
        estado,
        manda: "Con cualquier opción hay que cumplir las condiciones de diseño de las uniones (3.1.4) y las del ruido y las vibraciones de las instalaciones (3.3): la ficha las recoge.",
        filas: d.condiciones.map((c) => ({ k: c, v: "se declara" })),
        cita: "DB-HR · ap. 3.1.4 y 3.3",
      };
  }
}


// ── Avisos e incumplimientos ────────────────────────────────────────────────

export function textoAvisoHr(a: Aviso): TextoSi {
  switch (a.id) {
    case "ld":
      return {
        titulo: "Indica el Ld de la zona en los datos de la obra.",
        detalle: "Sin él se toman 60 dBA, el valor del DB sin datos oficiales solo para áreas de predominio residencial. Léelo en el mapa estratégico de ruido o pídelo al ayuntamiento; en una esquina, el mayor.",
      };
    case "huecos":
      return {
        titulo: "Porcentaje de huecos supuesto.",
        detalle: "Se suponen un 20 % en los dormitorios y un 30 % en las estancias. Indica el del recinto más desfavorable de cada uno: la superficie de huecos entre la de la fachada vista desde dentro, con todas sus fachadas si está en esquina.",
      };
    case "existente":
      return {
        titulo: "Edificio existente: el DB-HR solo se aplica a la rehabilitación integral.",
        detalle: "Las ampliaciones, modificaciones, reformas o rehabilitaciones quedan fuera (Introducción II d). Si es una rehabilitación integral, marca en La obra que se aplica.",
      };
    case "local":
      return {
        titulo: "El local se trata como recinto de actividad.",
        detalle: "Sin actividad definida, se califica de actividad (más de 70 dBA y menos de 80) y se hace constar en las Instrucciones de uso y mantenimiento; con más de 80 dBA, es un recinto ruidoso y necesita medidas aparte.",
      };
    case "techo-instalaciones":
      return {
        titulo: "Techo con amortiguadores en el cuarto de instalaciones.",
        detalle: "Los techos suspendidos de los recintos de instalaciones van con amortiguadores para las bajas frecuencias (preferiblemente de acero), y sus suelos flotantes pueden llevarlos (ap. 3.1.2.3.5 pto 7). Los ΔRA del Catálogo son sin amortiguadores.",
      };
    case "medios":
      return {
        titulo: "Con los valores medios del Catálogo cumpliría.",
        detalle: "Se usan los mínimos, que el Catálogo garantiza en todos los casos. Los medios valen si el producto lo justifica: márcalo en la última decisión.",
      };
    case "otros":
      return {
        titulo: "Edificio sin viviendas: solo el ruido exterior.",
        detalle: "La herramienta justifica la vivienda. Las separaciones entre las unidades de uso de oficinas o locales se justifican aparte.",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoHr(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  const general = " Sin solución en las tablas, se justifica por la opción general (ap. 3.1.3).";
  switch (d.clase) {
    case "tabiqueria":
      return { titulo: "La tabiquería no llega.", detalle: `Tiene ${dBA(d.RA)}${d.exigeM !== null ? ` y ${kg(d.m)}` : ""}; pide RA ≥ ${d.exigeRA} dBA${d.exigeM !== null ? ` y m ≥ ${d.exigeM} kg/m²` : ""}.` };
    case "vertical":
      return { titulo: `${el.nombre}: no cumple la tabla 3.2.`, detalle: `${[...fallos(d.r.condiciones), ...fallos(d.r.flancos)].join(". ") || "Sin fila aplicable"}.${general}` };
    case "horizontal":
      return { titulo: `${el.nombre}: no cumple la tabla 3.3.`, detalle: `${[...fallos(d.r.condiciones), ...fallos(d.flancos)].join(". ") || "Sin fila aplicable"}.${general}` };
    case "puerta":
      return { titulo: "La puerta o su cerramiento no llegan.", detalle: `Puerta ${d.RA === null ? "sin dato" : dBA(d.RA)} frente a ${d.exige}; cerramiento ${dBA(d.cerramientoRA)} frente a 50.` };
    case "ascensor":
      return { titulo: "El recinto del ascensor no llega.", detalle: d.r ? `${[...fallos(d.r.condiciones), ...fallos(d.r.flancos)].join(". ")}.` : `RA ${dBA(d.RA)}: debe ser mayor que 50 dBA.` };
    case "medianeria":
      return { titulo: "La medianería no llega a 45 dBA.", detalle: `Tiene ${dBA(d.RA)}. Añade un trasdosado o elige otra solución.` };
    case "adosada":
      return { titulo: "Cada hoja de la separación debe tener 45 dBA.", detalle: `Tiene ${dBA(d.RA)}.` };
    case "forjado-adosada":
      return { titulo: "El suelo flotante no cumple la tabla I.1.", detalle: d.r.fila ? `Pide ΔLw ≥ ${d.r.dLwExigido} dB y ΔRA ≥ ${d.r.dRAExigido} dBA; tiene ${dB(d.suelo.dLw)} y ${dBA(d.suelo.dRA)}.` : `El forjado no llega a 175 kg/m².${general}` };
    case "exterior":
      if (d.r.nivel === null) return { titulo: "Exigencia por encima de la tabla 3.4.", detalle: `D2m,nT,Atr ${d.D} dBA: se justifica por la opción general.` };
      if (d.recinto === "cubierta") return { titulo: "La cubierta no llega.", detalle: `RA,tr ${dBA(d.ciega.RAtr)} frente a ${d.r.ciegaExigida}.` };
      if (d.hueco && d.r.ciegaExigida !== null && d.ciega.RAtr < d.r.ciegaExigida) {
        return { titulo: "La parte ciega no llega a ninguna fila de la tabla 3.4.", detalle: `RA,tr ${dBA(d.ciega.RAtr)} frente a ${d.r.ciegaExigida} como mínimo.${general}` };
      }
      return { titulo: `Los huecos de los ${RECINTO[d.recinto]} no llegan.`, detalle: `RA,tr ${dBA(d.hueco?.RAtr ?? 0)} frente a ${d.r.huecoExigido} con un ${d.pct} % de huecos. Mejora la ventana o la caja de persiana.` };
    default:
      return null;
  }
}

export function describirDibujoHr(j: JustificacionHr): string {
  if (j.tipologia === "aislada") return "Sección de la vivienda con la tabiquería, la fachada y la cubierta frente al ruido exterior.";
  return "Sección del edificio con las separaciones verticales y horizontales entre viviendas y con otros recintos, la fachada y la cubierta.";
}
