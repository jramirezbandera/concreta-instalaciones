// =============================================================================
// DB-HR — La memoria redactada (feature-25): el ámbito, el ruido exterior, la
// opción simplificada elemento por elemento con sus cifras y su cita, el tiempo
// de reverberación (que no se aplica a la vivienda) y lo que se declara de
// uniones e instalaciones. Debajo, la tabla de la ficha K.1: cada elemento con
// lo de proyecto y lo exigido. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { ENGINE_VERSION } from "../../lib/version";
import type { DetalleHr, JustificacionHr } from "./justificacion";
import { EDICION_HR, TRAMOS_HUECOS, tramoHuecos } from "./tablas";
import { COLUMNA_H, dB, dBA, kg, RELACION_HR, solucionEnFrase, TABIQUERIA, textoSolucion } from "./textos";

const CUMPLE = (ok: boolean) => (ok ? "CUMPLE." : "NO CUMPLE por la opción simplificada: se justifica por la opción general (ap. 3.1.3).");

function parrafoAmbito(j: JustificacionHr): Trozo[] {
  if (!j.aplica) {
    return ["La obra es una intervención en un edificio existente que no constituye rehabilitación integral, por lo que queda excluida del ámbito del DB-HR (Introducción II d)."];
  }
  switch (j.tipologia) {
    case "aislada":
      return [
        "La vivienda unifamiliar aislada, de nueva construcción, está dentro del ámbito del DB-HR (Introducción II). Al constituir una única unidad de uso, las exigencias con objeto son la tabiquería (RA ≥ 33 dBA, ap. 2.1.1 a.i), el aislamiento frente al ruido exterior de los recintos protegidos (ap. 2.1.1 a.iv, tablas 2.1 y 3.4) y el ruido y las vibraciones de las instalaciones (ap. 2.3 y 3.3).",
      ];
    case "adosada":
      return [
        "La vivienda unifamiliar adosada, de nueva construcción, está dentro del ámbito del DB-HR (Introducción II) y se justifica por la opción simplificada para vivienda unifamiliar adosada (Anejo I), con las fachadas y la cubierta por el ap. 3.1.2.5.",
      ];
    case "otros":
      return ["El edificio, de nueva construcción y sin viviendas, está dentro del ámbito del DB-HR (Introducción II). Este apartado justifica el aislamiento frente al ruido exterior; las separaciones entre las unidades de uso se justifican aparte."];
    default:
      return [
        "El edificio es de nueva construcción y de uso residencial privado, por lo que le es de aplicación el DB-HR (Introducción II), sin que concurra ninguna de las excepciones a) a d). Se justifica mediante la opción simplificada (ap. 3.1.2), con forjados de hormigón (ap. 3.1.2.1).",
      ];
  }
}

/** Qué linda con las viviendas: lo que se justifica y lo que el proyecto dice que no linda (K-HR.16). */
function parrafoColindancias(j: JustificacionHr): Trozo[] {
  const cs = j.separaciones.colindancias;
  if (cs.length === 0) return [];
  const lista = (xs: typeof cs) => xs.map((c) => `${c.nombre}, ${RELACION_HR[c.relacion]}`).join("; ");
  const si = cs.filter((c) => c.linda);
  const no = cs.filter((c) => !c.linda);
  const supuestas = si.filter((c) => c.supuesta).length;
  return [
    si.length > 0 ? `Recintos que lindan con las viviendas y cuyas separaciones se justifican: ${lista(si)}. ` : "Ningún otro recinto linda con las viviendas. ",
    no.length > 0 ? `Según el proyecto, no lindan con las viviendas: ${lista(no)}. ` : "",
    supuestas === 0
      ? "Las colindancias son las del proyecto."
      : supuestas === si.length
        ? "Sin la distribución en planta, se suponen todas del lado de la seguridad: lo que comparte planta con las viviendas, colindante, y lo de la planta de abajo, debajo."
        : "Las no indicadas se suponen del lado de la seguridad.",
  ];
}

function parrafoExterior(j: JustificacionHr): Trozo[] {
  const d = j.elementos.find((e) => e.id === "fachada-dormitorios")?.detalle ?? j.elementos.find((e) => e.id === "fachada-estancias")?.detalle;
  if (!d || d.clase !== "exterior") return [];
  const est = j.elementos.find((e) => e.id === "fachada-estancias")?.detalle;
  return [
    "Índice de ruido día de la zona ",
    { v: `Ld = ${dBA(j.ld.valor)}` },
    j.ld.supuesto ? " (valor por defecto del DB para áreas de predominio residencial, a falta de datos oficiales)" : " (mapa estratégico de ruido o administración competente)",
    j.ld.aeronaves ? ", con el ruido de aeronaves como ruido exterior dominante (+ 4 dBA)" : "",
    d.noExpuesta ? `; la fachada del recinto más desfavorable no está expuesta directamente, Ld − 10 dBA` : "",
    ". Exigencia de aislamiento frente al exterior: ",
    { v: `D2m,nT,Atr ≥ ${d.D} dBA` },
    j.tipologia === "otros" ? " en los despachos" : " en los dormitorios",
    est && est.clase === "exterior" && j.tipologia !== "otros" ? ` y ≥ ${est.D} dBA en las estancias` : "",
    " (DB-HR ap. 2.1.1 a.iv y tabla 2.1).",
  ];
}

function linea(d: DetalleHr, nombre: string): Trozo[] | null {
  switch (d.clase) {
    case "tabiqueria":
      return d.regla === "minimo"
        ? [`${nombre}: ${solucionEnFrase(d.sol)}, `, { v: `RA = ${dBA(d.RA)}` }, ` ≥ ${d.exigeRA} dBA. ${CUMPLE(d.RA >= d.exigeRA)}`]
        : [`${nombre} de ${TABIQUERIA[d.tipo]}: ${solucionEnFrase(d.sol)}, `, { v: `m = ${kg(d.m)}` }, ` ≥ ${d.exigeM} kg/m² y `, { v: `RA = ${dBA(d.RA)}` }, ` ≥ ${d.exigeRA} dBA (tabla 3.1). ${CUMPLE(d.m >= (d.exigeM ?? 0) && d.RA >= d.exigeRA)}`];
    case "vertical": {
      const f = d.r.fila;
      return [
        `Elemento de separación vertical ${d.caso === "actividad" ? "con recintos de actividad o de instalaciones" : "entre unidades de uso"} (${d.separa.join(", ")}): tipo ${d.tipo}, ${solucionEnFrase(d.sol)}, `,
        { v: `m = ${kg(d.m)}, RA = ${dBA(d.RA)}` },
        d.trasdosado ? `, con trasdosado ${d.trasdosado.unaCara ? "por una cara" : "por ambas caras"} ${solucionEnFrase(d.trasdosado)}, ΔRA = ${dBA(d.trasdosado.dRA)}` : "",
        f ? `. Fila de la tabla 3.2: m ≥ ${f.m} kg/m², RA ≥ ${f.RA} dBA${d.r.dRAExigido !== null ? `, trasdosado ΔRA ≥ ${d.r.dRAExigido} dBA` : ", sin trasdosado"}${d.caso === "actividad" ? " (valores entre paréntesis)" : ""}, con tabiquería de ${d.columna === "fabrica" ? "fábrica" : "entramado"}` : ". Ninguna fila de la tabla 3.2",
        `. ${CUMPLE(d.r.cumple)}`,
      ];
    }
    case "horizontal": {
      const f = d.r.fila;
      return [
        `Elemento de separación horizontal ${{ viviendas: "entre viviendas", comun: "sobre la zona común", actividad: "sobre recintos de actividad o de instalaciones", encima: "bajo recintos de actividad o de instalaciones" }[d.caso]} (${d.separa.join(", ")}): forjado ${solucionEnFrase(d.forjado)}, `,
        { v: `m = ${kg(d.forjado.m)}, RA = ${dBA(d.forjado.RA)}` },
        `; suelo flotante ${solucionEnFrase(d.suelo)}, `,
        { v: `ΔLw = ${dB(d.suelo.dLw)}, ΔRA = ${dBA(d.suelo.dRA)}` },
        d.techo ? `; techo suspendido ${solucionEnFrase(d.techo)}, ΔRA = ${dBA(d.techo.dRA)}` : "; sin techo suspendido",
        f
          ? `. Tabla 3.3, forjado ${f.m} kg/m², ${COLUMNA_H[d.columna]}${d.r.dLwExigido !== null ? `: ΔLw ≥ ${d.r.dLwExigido} dB` : ""}${d.r.comb ? `, suelo flotante ΔRA ≥ ${d.r.comb.sf} dBA y techo ΔRA ≥ ${d.r.comb.ts} dBA` : ""}`
          : ". Ninguna fila de la tabla 3.3",
        `. ${CUMPLE(d.r.cumple && d.flancos.every((c) => c.cumple !== false))}`,
      ];
    }
    case "puerta":
      return [
        `Puerta de entrada a la vivienda, que abre a ${d.abre === "estancia" ? "una estancia" : "un vestíbulo"}: `,
        { v: d.RA === null ? `RA ≥ ${d.exige} dBA` : `RA = ${dBA(d.RA)}` },
        `${d.RA === null ? " (se exige en el pliego)" : ` ≥ ${d.exige} dBA`}; cerramiento en que se sitúa, RA = ${dBA(d.cerramientoRA)} ≥ 50 dBA (ap. 3.1.2.3.4 pto 4).`,
      ];
    case "ascensor":
      return d.modo === "hueco"
        ? ["Recinto del ascensor con la maquinaria en el hueco: recinto de instalaciones, cerrado con la solución de la tabla 3.2 entre paréntesis (ap. 3.3.3.5). ", CUMPLE(d.r?.cumple ?? false)]
        : ["Recinto del ascensor con la maquinaria en un cuarto: elementos de separación con las viviendas de ", { v: `RA = ${dBA(d.RA)}` }, ` > 50 dBA (ap. 3.3.3.5). ${CUMPLE(d.RA > 50)}`];
    case "medianeria":
      return [`Medianería: ${solucionEnFrase(d.sol)}, `, { v: `RA = ${dBA(d.RA)}` }, ` ≥ 45 dBA (ap. 3.1.2.4), que satisface las exigencias del ap. 2.1.1 c). ${CUMPLE(d.RA >= d.exige)}`];
    case "adosada":
      return [`Separación con las viviendas adosadas, de estructura independiente: dos hojas de ${solucionEnFrase(d.sol)}, `, { v: `RA = ${dBA(d.RA)}` }, ` cada una ≥ 45 dBA (Anejo I.1.2). ${CUMPLE(d.RA >= d.exige)}`];
    case "forjado-adosada":
      return [
        `Forjados compartidos con las viviendas adosadas: ${solucionEnFrase(d.forjado)} con suelo flotante ${solucionEnFrase(d.suelo)}, `,
        { v: `ΔLw = ${dB(d.suelo.dLw)}, ΔRA = ${dBA(d.suelo.dRA)}` },
        d.r.fila ? ` (tabla I.1: ΔLw ≥ ${d.r.dLwExigido} dB, ΔRA ≥ ${d.r.dRAExigido} dBA). ` : ". ",
        CUMPLE(d.r.cumple),
      ];
    case "exterior":
      if (d.recinto === "cubierta") {
        return [`Cubierta: ${solucionEnFrase(d.ciega)}, `, { v: `RA,tr = ${dBA(d.ciega.RAtr)}` }, ` ≥ ${d.r.ciegaExigida ?? "—"} dBA (tabla 3.4, sin huecos). ${CUMPLE(d.r.cumple)}`];
      }
      return [
        `${nombre} (recinto más desfavorable, ${d.pct} % de huecos, ${TRAMOS_HUECOS[tramoHuecos(d.pct)]}): parte ciega ${solucionEnFrase(d.ciega)}, `,
        { v: `RA,tr = ${dBA(d.ciega.RAtr)}` },
        d.r.ciegaExigida !== null ? ` ≥ ${d.r.ciegaExigida} dBA` : "",
        `; huecos ${d.hueco ? solucionEnFrase(d.hueco) : ""}${d.hueco?.caja ? ` con caja de persiana ${d.hueco.caja.codigo}` : ""}, `,
        { v: `RA,tr = ${dBA(d.hueco?.RAtr ?? 0)}` },
        ` ≥ ${d.r.huecoExigido ?? "—"} dBA (tabla 3.4). ${CUMPLE(d.r.cumple)}`,
      ];
    case "instalaciones":
      return null;
  }
}

function tablaK1(j: JustificacionHr): MemoriaDoc["tabla"] {
  const filas: string[][] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    const ok = el.veredicto === "ok" ? "Cumple" : el.veredicto === "fail" ? "No cumple" : "Se declara";
    switch (d.clase) {
      case "tabiqueria":
        filas.push([el.nombre, textoSolucion(d.sol), `m ${d.m} · RA ${d.RA}`, `${d.exigeM !== null ? `m ≥ ${d.exigeM} · ` : ""}RA ≥ ${d.exigeRA}`, ok]);
        break;
      case "vertical":
        filas.push([el.nombre, `${textoSolucion(d.sol)}${d.trasdosado ? ` + ${d.trasdosado.codigo}` : ""}`, `m ${d.m} · RA ${d.RA}${d.trasdosado ? ` · ΔRA ${d.trasdosado.dRA}` : ""}`, d.r.fila ? `m ≥ ${d.r.fila.m} · RA ≥ ${d.r.fila.RA}${d.r.dRAExigido !== null ? ` · ΔRA ≥ ${d.r.dRAExigido}` : ""}` : "—", ok]);
        break;
      case "horizontal":
        filas.push([el.nombre, `${d.forjado.nombre} + ${d.suelo.codigo}${d.techo ? ` + ${d.techo.codigo}` : ""}`, `m ${d.forjado.m} · ΔLw ${d.suelo.dLw} · ΔRA ${d.suelo.dRA}/${d.techo?.dRA ?? 0}`, d.r.fila ? `m ≥ ${d.r.fila.m}${d.r.dLwExigido !== null ? ` · ΔLw ≥ ${d.r.dLwExigido}` : ""}${d.r.comb ? ` · ΔRA ≥ ${d.r.comb.sf}/${d.r.comb.ts}` : ""}` : "—", ok]);
        break;
      case "exterior":
        filas.push([el.nombre, d.recinto === "cubierta" ? textoSolucion(d.ciega) : `${d.ciega.codigo} + ${d.hueco?.nombre ?? ""}`, d.recinto === "cubierta" ? `RA,tr ${d.ciega.RAtr}` : `RA,tr ${d.ciega.RAtr} · huecos ${d.hueco?.RAtr ?? 0} (${d.pct} %)`, d.recinto === "cubierta" ? `≥ ${d.r.ciegaExigida ?? "—"}` : `≥ ${d.r.ciegaExigida ?? "—"} · ≥ ${d.r.huecoExigido ?? "—"}`, ok]);
        break;
      case "medianeria":
      case "adosada":
        filas.push([el.nombre, textoSolucion(d.sol), `RA ${d.RA}`, `RA ≥ ${d.exige}`, ok]);
        break;
      case "forjado-adosada":
        filas.push([el.nombre, `${d.forjado.nombre} + ${d.suelo.codigo}`, `ΔLw ${d.suelo.dLw} · ΔRA ${d.suelo.dRA}`, d.r.fila ? `ΔLw ≥ ${d.r.dLwExigido} · ΔRA ≥ ${d.r.dRAExigido}` : "—", ok]);
        break;
      case "puerta":
        filas.push([el.nombre, d.abre === "estancia" ? "abre a estancia" : "abre a vestíbulo", d.RA === null ? "—" : `RA ${d.RA}`, `RA ≥ ${d.exige}`, ok]);
        break;
      case "ascensor":
        filas.push([el.nombre, d.modo === "hueco" ? "maquinaria en el hueco" : "maquinaria en cuarto", `RA ${d.RA}`, d.modo === "hueco" ? "tabla 3.2 (paréntesis)" : "RA > 50", ok]);
        break;
      case "instalaciones":
        break;
    }
  }
  return { cabecera: ["Elemento", "Solución", "De proyecto", "Exigido", ""], filas };
}

const REVERBERACION =
  "El edificio es de uso residencial privado: no le son de aplicación los valores límite de tiempo de reverberación ni de absorción acústica en zonas comunes (ap. 2.2, que se refiere a aulas, salas de conferencias, comedores y restaurantes, y a zonas comunes de edificios de uso residencial público, docente y hospitalario).";

const CATALOGO =
  "Los valores de los elementos son los mínimos del Catálogo de Elementos Constructivos del CTE (versión de marzo de 2010), que tienen garantía legal para las soluciones que se construyen en obra; los de productos industriales son orientativos y se exigirán con su ensayo en el pliego de condiciones.";

export function memoriaHr(j: JustificacionHr): MemoriaDoc {
  const fuente = [`${EDICION_HR}`, "opción simplificada, ap. 3.1.2", "Catálogo de Elementos Constructivos (CEC, marzo 2010)", `motor ${ENGINE_VERSION}`].join(" · ");
  const titulo = "Protección frente al ruido";
  if (!j.aplica) return { titulo, norma: "DB-HR", parrafos: [parrafoAmbito(j)], fuente };
  const parrafos: Trozo[][] = [parrafoAmbito(j)];
  const col = parrafoColindancias(j);
  if (col.length > 0) parrafos.push(col);
  const ex = parrafoExterior(j);
  if (ex.length > 0) parrafos.push(ex);
  for (const el of j.elementos) {
    const l = linea(el.detalle, el.nombre);
    if (l) parrafos.push(l);
  }
  const inst = j.elementos.find((e) => e.id === "instalaciones")?.detalle;
  if (inst && inst.clase === "instalaciones") {
    parrafos.push([`Se cumplen las condiciones de diseño de las uniones entre elementos constructivos (ap. 3.1.4) y las de ruido y vibraciones de las instalaciones (ap. 3.3): ${inst.condiciones.map((c) => c.charAt(0).toLowerCase() + c.slice(1)).join("; ")}.`]);
  }
  if (j.tipologia !== "otros") parrafos.push([REVERBERACION]);
  parrafos.push([j.medios ? CATALOGO.replace("los mínimos", "los medios") : CATALOGO]);
  return { titulo, norma: "DB-HR", parrafos, tabla: tablaK1(j), fuente };
}
