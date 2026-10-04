// =============================================================================
// DB-HS5 — La memoria redactada (feature-14 §E): el texto que el proyectista
// copia a su memoria justificativa. Se redacta solo a partir de la
// justificación: se revisa, no se edita. PURA.
//
// Un párrafo es una lista de trozos: texto normal o una cifra (`{ v }`), que la
// pantalla resalta y el texto plano deja tal cual.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { ElementoHs5, JustificacionHs5 } from "./justificacion";
import type { ClaseBajante, VerticalHs5 } from "./red";
import { cuantos, valorCorto } from "./textos";
import { VENT_PRIMARIA, type TipoAparato } from "./tablas";

export type { Trozo } from "../../lib/cte/presentacion";

export interface MemoriaHs5 extends MemoriaDoc {
  tabla: { cabecera: string[]; filas: string[][] };
}

const NOMBRE_CLASE: Record<ClaseBajante, string> = {
  fecales: "fecales",
  cocina: "cocina",
  unica: "baños y cocina",
  aseos: "aseos",
};

function mm(v: number | null): string {
  return v === null ? "Ø—" : `Ø${fmt(v, undefined, 0)} mm`;
}

function n0(v: number): string {
  return fmt(v, undefined, 0);
}

function lista(xs: string[]): string {
  if (xs.length <= 1) return xs[0] ?? "";
  return `${xs.slice(0, -1).join(", ")} y ${xs[xs.length - 1]}`;
}

/** «la cocina», «el aseo y la cocina», «los 2 baños». */
function conArticulo(cuartos: { clase: string }[]): string {
  const n = (c: string) => cuartos.filter((x) => x.clase === c).length;
  const partes: string[] = [];
  if (n("bano") > 0) partes.push(n("bano") === 1 ? "el baño" : `los ${n("bano")} baños`);
  if (n("aseo") > 0) partes.push(n("aseo") === 1 ? "el aseo" : `los ${n("aseo")} aseos`);
  if (n("aseos") > 0) partes.push("los aseos");
  if (n("cocina") > 0) partes.push("la cocina");
  return lista(partes);
}

function desagueAparato(t: TipoAparato): string {
  return t.startsWith("cuarto_") || t.startsWith("inodoro") ? "el desagüe del inodoro" : "el desagüe de un aparato";
}

/** Bajantes de residuales de la justificación, con su vertical y su clase. */
function bajantesDe(j: JustificacionHs5): { el: ElementoHs5; v: VerticalHs5; clase: ClaseBajante }[] {
  const out: { el: ElementoHs5; v: VerticalHs5; clase: ClaseBajante }[] = [];
  for (const el of j.elementos) {
    const det = el.detalle;
    if (det.clase === "bajante" && det.vertical && det.bajante) {
      out.push({ el, v: det.vertical, clase: det.bajante.clase });
    }
  }
  return out;
}

// -----------------------------------------------------------------------------
// Párrafos
// -----------------------------------------------------------------------------

function parrafoMetodo(j: JustificacionHs5): Trozo[] {
  const p: Trozo[] = [
    "La red de evacuación se ha dimensionado conforme a la sección HS 5 del DB-HS por el método de las unidades de desagüe.",
  ];
  if (j.pluviales && j.residuales) {
    p.push(
      j.red.decisiones.alcantarillado === "unitario"
        ? " Como el alcantarillado público es unitario, las aguas residuales y las pluviales discurren por redes separadas y se unen en la arqueta de salida, con cierre hidráulico antes de la acometida."
        : " Como el alcantarillado público es separativo, las aguas residuales y las pluviales discurren por redes separadas hasta sus acometidas.",
    );
  }
  return p;
}

function frasesBajantes(j: JustificacionHs5): Trozo[] {
  const bs = bajantesDe(j);
  const p: Trozo[] = [];
  if (bs.length === 0) return p;
  const verticales = [...new Map(bs.map((b) => [b.v.id, b.v])).values()];
  const plantas = new Set(bs.map((b) => (b.el.detalle.clase === "bajante" ? b.el.detalle.tramo.bajante?.plantas : 0)));
  const clases = [...new Set(bs.map((b) => b.clase))];
  const porVertical = Math.max(...verticales.map((v) => v.bajantes.filter((x) => x.id !== null).length));
  const unaVertical = verticales.length === 1;
  if (unaVertical) {
    p.push(porVertical === 1 ? " La red baja por una bajante de " : ` La red baja por ${cuantos(porVertical, "bajante", "bajantes", "f")}: `);
  } else {
    p.push(" Cada tipo se apila en una vertical");
    if (plantas.size === 1) {
      const n = [...plantas][0] ?? 1;
      p.push(` de ${cuantos(n, "planta", "plantas", "f")}`);
    }
    p.push(` con ${porVertical === 1 ? "una bajante de " : `${cuantos(porVertical, "bajante", "bajantes", "f")}: `}`);
  }
  const descr: Trozo[][] = [];
  for (const clase of clases) {
    const deClase = bs.filter((b) => b.clase === clase);
    const diametros = [...new Set(deClase.map((b) => valorCorto(b.el)))];
    const t: Trozo[] = [`${NOMBRE_CLASE[clase]} de `];
    if (diametros.length === 1) {
      const el = deClase[0].el;
      const det = el.detalle;
      t.push({ v: mm("texto" in el.valor ? null : el.valor.valor) });
      if (el.manda.tipo === "minimo_aparato" && det.clase === "bajante") {
        t.push(
          ` —por unidades bastaría Ø${fmt(det.tramo.diametroPorCapacidad_mm ?? 0, undefined, 0)}, pero no puede ser menor que ${desagueAparato(el.manda.aparato as TipoAparato)}, de ${n0(el.manda.diametroMin_mm)} mm—`,
        );
      } else {
        const uds = [...new Set(deClase.map((b) => (b.el.detalle.clase === "bajante" ? b.el.detalle.tramo.udAcumuladas : 0)))];
        t.push(uds.length === 1 ? `, que recibe ${n0(uds[0])} UD (tabla 4.4)` : " (tabla 4.4)");
      }
    } else {
      t.push(`${diametros.join(" a ")} (tabla 4.4)`);
    }
    descr.push(t);
  }
  descr.forEach((t, i) => {
    if (i > 0) p.push(i === descr.length - 1 ? " y " : ", ");
    p.push(...t);
  });
  p.push(".");
  // Lo que acomete directamente al colector (planta que apoya sobre él).
  const directos = verticales.flatMap((v) => v.bajantes.filter((b) => b.id === null));
  const cuartosDirectos = directos.flatMap((b) => b.ramales.flatMap((r) => r.cuartos));
  if (cuartosDirectos.length > 0) {
    const planta = j.red.nivelBase === 0 ? "la planta baja" : `el sótano ${-j.red.nivelBase}`;
    const quien = conArticulo(cuartosDirectos);
    p.push(` En ${planta}, ${quien} ${cuartosDirectos.length > 1 ? "acometen" : "acomete"} directamente al colector.`);
  }
  return p;
}

function parrafoResiduales(j: JustificacionHs5): Trozo[] {
  const p: Trozo[] = [];
  if (!j.residuales) return p;
  if (j.modo === "manual") {
    const nB = j.residuales.porTramo.filter((t) => t.tipo === "bajante").length;
    p.push(
      `La red de residuales se ha definido tramo a tramo, con ${cuantos(nB, "bajante", "bajantes", "f")}, y suma `,
      { v: `${n0(j.residuales.udTotales)} UD` },
      " (tablas 4.1, 4.3 y 4.4).",
    );
    return p;
  }
  const verticales = j.red.verticales;
  const viviendas = verticales.filter((v) => v.clase === "vivienda");
  const nucleos = verticales.filter((v) => v.clase === "nucleo_aseos");
  const tipos = (vs: VerticalHs5[]) => [...new Map(vs.map((v) => [v.tipoId, v])).values()];
  if (viviendas.length > 0) {
    const ts = tipos(viviendas);
    if (j.red.unifamiliar) {
      p.push("La vivienda suma ", { v: `${n0(ts[0].udUnidad)} UD` }, " (tabla 4.1).");
    } else if (ts.length === 1) {
      p.push(`Las viviendas tipo ${ts[0].nombre} suman `, { v: `${n0(ts[0].udUnidad)} UD` }, " cada una (tabla 4.1).");
    } else {
      p.push(`Las viviendas tipo ${lista(ts.map((t) => t.nombre))} suman `);
      ts.forEach((t, i) => {
        if (i > 0) p.push(i === ts.length - 1 ? " y " : ", ");
        p.push({ v: n0(t.udUnidad) });
      });
      p.push(" UD (tabla 4.1).");
    }
  }
  if (nucleos.length > 0) {
    const ts = tipos(nucleos);
    p.push(
      `${viviendas.length > 0 ? " " : ""}Los núcleos de aseos ${lista(ts.map((t) => t.nombre))} suman `,
      { v: `${lista(ts.map((t) => n0(t.udUnidad)))} UD` },
      " (tabla 4.1, uso público).",
    );
  }
  p.push(...frasesBajantes(j));
  const vent = j.elementos.find((e) => e.detalle.clase === "ventilacion");
  if (vent && vent.detalle.clase === "ventilacion") {
    const v = vent.detalle;
    const limite = VENT_PRIMARIA.datos.maxPlantasSolo;
    if (v.ventilacion === "primaria" && v.plantas < limite) {
      p.push(
        v.bajantes === 1
          ? " Se prolonga sobre la cubierta como ventilación primaria, suficiente al tener el edificio menos de siete plantas."
          : " Todas se prolongan sobre la cubierta como ventilación primaria, suficiente al tener el edificio menos de siete plantas.",
      );
    } else if (v.ventilacion === "primaria") {
      p.push(` Se prolongan sobre la cubierta como ventilación primaria, que no basta con ${v.plantas} plantas: hace falta ventilación secundaria.`);
    } else {
      p.push(" Además de prolongarse sobre la cubierta, llevan ventilación secundaria");
      if (v.secundariaDiametro_mm) p.push(", con columna de ", { v: mm(v.secundariaDiametro_mm) });
      p.push(v.plantas >= limite ? `, obligatoria al tener el edificio ${v.plantas} plantas.` : ".");
    }
  }
  return p;
}

function parrafoColector(j: JustificacionHs5): Trozo[] {
  const col = j.elementos.find((e) => e.detalle.clase === "colector");
  if (!col || col.detalle.clase !== "colector") return [];
  const t = col.detalle.tramo;
  const donde =
    col.detalle.disposicion === "enterrado"
      ? "enterrados, con arquetas registrables,"
      : j.red.colgadoDe === "garaje" || j.red.colgadoDe === "sotano"
        ? `colgados del techo del ${j.red.colgadoDe}`
        : "colgados bajo el forjado de la planta baja";
  const p: Trozo[] = [
    `Los colectores van ${donde} con pendiente del `,
    { v: `${fmt(t.pendiente_pct)} %` },
    `. ${j.modo === "manual" ? col.nombre : "El colector general"} recoge `,
    { v: `${n0(t.udAcumuladas)} UD` },
    " y se resuelve en ",
    { v: mm(t.diametro_mm) },
  ];
  if (col.manda.tipo === "no_menor_que_aguas_arriba") {
    p.push(
      `: por unidades bastaría Ø${fmt(t.diametroPorCapacidad_mm ?? 0, undefined, 0)}, pero no puede ser menor que las bajantes que recibe (tabla 4.5).`,
    );
  } else {
    p.push(`, que admite ${n0(t.capacidad_ud ?? 0)} UD (tabla 4.5).`);
  }
  return p;
}

function parrafoPluviales(j: JustificacionHs5): Trozo[] {
  const pl = j.pluviales;
  if (!pl) return [];
  const i = j.intensidad;
  const p: Trozo[] = [`La cubierta, de ${n0(pl.superficie_m2)} m², `];
  const bajantes = cuantos(pl.bajantes, "bajante de pluviales", "bajantes de pluviales", "f");
  if (pl.sumideros !== null) {
    p.push(`desagua por ${cuantos(pl.sumideros, "sumidero", "sumideros")} (tabla 4.6) a ${bajantes} de `, { v: mm(pl.bajante.diametro_mm) }, ".");
  } else if (pl.canalon) {
    p.push("vierte a canalones de ", { v: mm(pl.canalon.diametro_mm) }, ` (tabla 4.7) que bajan por ${bajantes} de `, { v: mm(pl.bajante.diametro_mm) }, ".");
  }
  const intensidadTxt = i.supuesta
    ? `con la intensidad de referencia de ${n0(i.valor_mm_h)} mm/h, a falta de la del emplazamiento,`
    : `con una intensidad de ${n0(i.valor_mm_h)} mm/h (zona ${i.zona}, isoyeta ${i.isoyeta}, apéndice B)`;
  const servida = pl.bajantes === 1 ? "La bajante sirve toda la cubierta" : `Cada una sirve ${n0(pl.bajante.superficie_m2)} m²`;
  if (pl.f === 1) {
    p.push(` ${servida}, ${intensidadTxt.replace(/,$/, "")}, por debajo de los ${n0(pl.bajante.capacidad_m2 ?? 0)} m² que admite ese diámetro (tabla 4.8).`);
  } else {
    p.push(` ${servida}; ${intensidadTxt} equivalen a ${n0(pl.bajante.corregida_m2)} m², por debajo de los ${n0(pl.bajante.capacidad_m2 ?? 0)} m² que admite ese diámetro (tabla 4.8).`);
  }
  p.push(" El colector de pluviales, de ", { v: mm(pl.colector.diametro_mm) }, `, recoge la cubierta entera al ${fmt(pl.colector.pendiente_pct)} % (tabla 4.9).`);
  return p;
}

function parrafoEspeciales(j: JustificacionHs5): Trozo[] {
  const p: Trozo[] = [];
  for (const el of j.elementos) {
    const det = el.detalle;
    if (det.clase === "local") {
      const planta = det.local.nivel === 0 ? "planta baja" : `la planta ${det.local.nivel}`;
      p.push(
        `${p.length > 0 ? " " : ""}Para ${det.local.numero > 1 ? "los locales" : "el local"} de ${planta}, sin uso definido, se deja prevista una conexión de `,
        { v: mm(110) },
        " al colector (criterio de proyecto; el DB-HS 5 no lo exige). Su acondicionamiento deberá justificar el HS 5 cuando se instalen aparatos receptores (ap. 1.1).",
      );
    }
    if (det.clase === "garaje") {
      p.push(
        `${p.length > 0 ? " " : ""}` +
          (det.bombeo
            ? "La red del garaje, por debajo de la cota del alcantarillado, se resuelve con sumideros sifónicos, separador de grasas antes del pozo y bombeo con al menos dos bombas en alternancia (ap. 3.3.2.1); el equipo se dimensiona según el ap. 4.6."
            : "La red del garaje desagua por gravedad, con sumideros sifónicos y separador de grasas."),
      );
    }
  }
  return p;
}

// -----------------------------------------------------------------------------
// Tabla y fuentes
// -----------------------------------------------------------------------------

function tablaResumen(j: JustificacionHs5): MemoriaHs5["tabla"] {
  const filas: string[][] = [];
  const bs = bajantesDe(j);
  const clases = [...new Set(bs.map((b) => b.clase))];
  for (const clase of clases) {
    const deClase = bs.filter((b) => b.clase === clase);
    const nombres = [...new Set(deClase.map((b) => b.v.nombre))];
    const uds = deClase.map((b) => (b.el.detalle.clase === "bajante" ? n0(b.el.detalle.tramo.udAcumuladas) : ""));
    const caps = [...new Set(deClase.map((b) => (b.el.limite ? n0(b.el.limite.valor) : "—")))];
    const ds = [...new Set(deClase.map((b) => ("texto" in b.el.valor ? "—" : fmt(b.el.valor.valor, undefined, 0))))];
    filas.push([
      `Bajantes de ${NOMBRE_CLASE[clase]} ${nombres.join(" · ")}`,
      `${[...new Set(uds)].join(" · ")} UD`,
      `${caps.join(" · ")} UD`,
      ds.join(" · "),
    ]);
  }
  if (j.modo === "manual") {
    for (const el of j.elementos.filter((e) => e.detalle.clase === "bajante")) {
      if (el.detalle.clase !== "bajante") continue;
      filas.push([el.nombre, `${n0(el.detalle.tramo.udAcumuladas)} UD`, el.limite ? `${n0(el.limite.valor)} UD` : "—", valorCorto(el).replace("Ø", "")]);
    }
  }
  for (const el of j.elementos) {
    const det = el.detalle;
    if (det.clase === "colector") {
      filas.push([
        `${el.nombre} · ${fmt(det.tramo.pendiente_pct)} %`,
        `${n0(det.tramo.udAcumuladas)} UD`,
        det.tramo.capacidad_ud === null ? "—" : `${n0(det.tramo.capacidad_ud)} UD`,
        valorCorto(el).replace("Ø", ""),
      ]);
    }
  }
  const pl = j.pluviales;
  if (pl) {
    filas.push([
      "Bajantes de pluviales",
      `${n0(pl.bajante.corregida_m2)} m²`,
      pl.bajante.capacidad_m2 === null ? "—" : `${n0(pl.bajante.capacidad_m2)} m²`,
      pl.bajante.diametro_mm === null ? "—" : fmt(pl.bajante.diametro_mm, undefined, 0),
    ]);
    filas.push([
      `Colector de pluviales · ${fmt(pl.colector.pendiente_pct)} %`,
      `${n0(pl.colector.corregida_m2)} m²`,
      pl.colector.capacidad_m2 === null ? "—" : `${n0(pl.colector.capacidad_m2)} m²`,
      pl.colector.diametro_mm === null ? "—" : fmt(pl.colector.diametro_mm, undefined, 0),
    ]);
  }
  return { cabecera: ["Elemento", "Recibe", "Admite", "Ø"], filas };
}

function fuente(j: JustificacionHs5): string {
  const tablas = ["4.1"];
  if (j.elementos.some((e) => e.detalle.clase === "ramal")) tablas.push("4.3");
  if (j.elementos.some((e) => e.detalle.clase === "bajante")) tablas.push("4.4");
  if (j.elementos.some((e) => e.detalle.clase === "colector")) tablas.push("4.5");
  if (j.pluviales?.sumideros !== null && j.pluviales) tablas.push("4.6");
  if (j.pluviales?.canalon) tablas.push("4.7");
  if (j.pluviales) tablas.push("4.8", "4.9");
  const ap = ["3.2", "3.3.3", "4.1"];
  if (j.pluviales) ap.push("4.2");
  if (j.elementos.some((e) => e.detalle.clase === "garaje" && e.detalle.bombeo)) ap.push("4.6");
  const partes = [
    "DB-HS · HS 5 (consolidado 14-06-2022)",
    `ap. ${lista(ap)}`,
    `tablas ${lista(tablas)}`,
  ];
  if (j.pluviales && !j.intensidad.supuesta) partes.push("apéndice B");
  partes.push(j.modo === "manual" ? "red definida por el proyectista" : "datos de El edificio");
  partes.push(`motor ${ENGINE_VERSION}`);
  return partes.join(" · ");
}

// -----------------------------------------------------------------------------
// API
// -----------------------------------------------------------------------------

export function memoriaHs5(j: JustificacionHs5): MemoriaHs5 {
  const parrafos = [
    parrafoMetodo(j),
    parrafoResiduales(j),
    parrafoColector(j),
    parrafoPluviales(j),
    parrafoEspeciales(j),
  ].filter((p) => p.length > 0);
  return {
    titulo: "Evacuación de aguas",
    norma: "DB-HS 5",
    parrafos,
    tabla: tablaResumen(j),
    fuente: fuente(j),
  };
}

/** El párrafo como texto plano. */
export function textoParrafo(p: Trozo[]): string {
  return p.map((t) => (typeof t === "string" ? t : t.v)).join("").trim();
}

/** La memoria entera como texto plano, lista para pegar. */
export function textoPlano(m: MemoriaHs5): string {
  const tabla = [m.tabla.cabecera, ...m.tabla.filas].map((f) => f.join("\t")).join("\n");
  return [m.titulo, ...m.parrafos.map(textoParrafo), tabla, m.fuente].join("\n\n");
}
