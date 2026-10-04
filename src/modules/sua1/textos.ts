// =============================================================================
// DB-SUA, SUA 1 — Textos (feature-20): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas del dibujo y de la lista, los avisos,
// lo que no cumple y su arreglo. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import { fmt } from "../../lib/units/format";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import type { Sua1Estado } from "./estado";
import type { DetalleEscalera, DetalleSua1, ElementoSua1, FalloEscalera, JustificacionSua1 } from "./justificacion";
import { CRITERIOS_SUA1, SUA1_BARRERAS, SUA1_ESCALERA_GENERAL, SUA1_LIMPIEZA, SUA1_RAMPAS } from "./tablas";

const G = SUA1_ESCALERA_GENERAL.datos;
const B = SUA1_BARRERAS.datos;
const RA = SUA1_RAMPAS.datos;

/** Una longitud con dos decimales fijos: «1,10 m». */
export function m(v: number): string {
  return `${v.toFixed(2).replace(".", ",")} m`;
}

/** Centímetros con hasta `dec` decimales: «17,5 cm». */
export function cm(v: number, dec = 1): string {
  return fmt(v, "cm", dec);
}

export function pct(v: number): string {
  return fmt(v, "%", 1);
}

function det(el: ElementoSi<unknown>): DetalleSua1 {
  return (el as ElementoSua1).detalle;
}

export function escaleras(j: JustificacionSua1): DetalleEscalera[] {
  return j.elementos.flatMap((e) => (e.detalle.clase === "escalera" ? [e.detalle] : []));
}

/** La escalera que da la cara: la común, la interior o la del garaje. */
function principal(j: JustificacionSua1): DetalleEscalera | null {
  const xs = escaleras(j);
  return xs.find((x) => x.tipo === "comun") ?? xs.find((x) => x.tipo === "interior") ?? xs[0] ?? null;
}

function barreras(j: JustificacionSua1): Extract<DetalleSua1, { clase: "barreras" }>[] {
  return j.elementos.flatMap((e) => (e.detalle.clase === "barreras" ? [e.detalle] : []));
}

/** «1,10 m», o «0,90 / 1,10 m» si cambian por planta. */
function alturasBarreras(j: JustificacionSua1): string | null {
  const xs = barreras(j);
  if (xs.length === 0) return null;
  const alturas = [...new Set(xs.map((x) => x.altura_m))].sort((a, b) => a - b);
  return alturas.length === 1 ? m(alturas[0]) : `${alturas.map((a) => a.toFixed(2).replace(".", ",")).join(" / ")} m`;
}

/** «16,67 cm» o «16,67–17,39 cm» si cambia. */
export function rangoCm(a: number, b: number, dec = 2): string {
  return Math.abs(a - b) < 0.005 ? cm(a, dec) : `${fmt(a, undefined, dec)}–${cm(b, dec)}`;
}

/** «C 17,4 · H 28»: la etiqueta de una escalera. */
export function cifrasEscalera(d: DetalleEscalera): string {
  return `C ${fmt(d.cMayor_cm, undefined, 1)} · H ${fmt(d.huella_cm, undefined, 1)}`;
}

function textoAscensor(d: DetalleEscalera): string {
  if (!d.ascensor) return "";
  const s = d.ascensor.supuesto ? " (supuesto)" : "";
  return d.ascensor.valor ? `con ascensor${s}` : `sin ascensor${s}`;
}

const TEXTO_FALLO: Record<FalloEscalera, (d: DetalleEscalera) => string> = {
  anchura: (d) => `La anchura útil, ${m(d.anchura_m)}, es menor que ${m(d.anchuraMin_m)}.`,
  huella: (d) => `La huella, ${cm(d.huella_cm)}, es menor que ${cm(d.restringida ? 22 : G.huellaMin_cm, 0)}.`,
  contrahuella: (d) => `Hay contrahuellas de ${cm(d.cMayor_cm, 2)}, por encima de ${cm(d.cMax_cm)}.`,
  relacion: (d) =>
    `2C + H va de ${cm(d.relacionMenor_cm)} a ${cm(d.relacionMayor_cm)}, fuera de ${fmt(G.relacionMin_cm, undefined, 0)}–${cm(G.relacionMax_cm, 0)}.`,
  tramo: (d) => `El tramo más largo salva ${m(d.alturaTramoMayor_m)}, más de ${m(d.tramoMax_m ?? 0)}.`,
  peldanos: () => `Algún tramo tiene menos de ${G.peldanosMinPorTramo} peldaños.`,
  variacion: (d) => `La contrahuella cambia ${cm(d.variacion_cm, 2)} de una planta a otra, más de ${cm(G.variacionContrahuellaMax_cm, 0)}.`,
};

// -----------------------------------------------------------------------------
// Cabecera
// -----------------------------------------------------------------------------

export function fraseSua1(j: JustificacionSua1): string {
  const fallan = j.elementos.filter((e) => e.veredicto === "fail");
  if (fallan.length > 0) {
    const t = textoIncumplimientoSua1(fallan[0]);
    return `${t?.titulo ?? fallan[0].nombre}${fallan.length > 1 ? ` Y ${fallan.length - 1} ${fallan.length === 2 ? "cosa más" : "cosas más"} por resolver.` : ""}`;
  }
  const partes: string[] = [];
  const p = principal(j);
  if (p) {
    partes.push(
      p.restringida
        ? `La escalera interior, de uso restringido, sube con contrahuellas de ${cm(p.cMayor_cm)} y huella de ${cm(p.huella_cm)}`
        : `La escalera común sube cada planta con contrahuellas de hasta ${cm(p.cMayor_cm)}, huella de ${cm(p.huella_cm)} y ${p.tramos === 1 ? "un tramo" : `${p.tramos} tramos`}`,
    );
  } else {
    partes.push("El edificio no tiene escaleras entre plantas");
  }
  const b = alturasBarreras(j);
  if (b) partes.push(`las barreras miden ${b}`);
  return `${partes.join("; ")}. Cumple SUA 1.`;
}

export function metricasSua1(j: JustificacionSua1): string {
  const p = principal(j);
  const b = alturasBarreras(j);
  return [p ? cifrasEscalera(p) : null, b ? `barreras ${b}` : null].filter((x) => x !== null).join(" · ") || "sin escaleras ni barreras";
}

export function piezasSua1(j: JustificacionSua1): { texto: string; acento: boolean }[] {
  const p = principal(j);
  const b = alturasBarreras(j);
  const out: { texto: string; acento: boolean }[] = [];
  if (p) out.push({ texto: cifrasEscalera(p), acento: p.fallos.length > 0 });
  if (b) out.push({ texto: `barreras ${b}`, acento: barreras(j).some((x) => x.altura_m < x.min_m) });
  if (out.length === 0) out.push({ texto: "una planta", acento: false });
  return out;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "fu" ? "out" : "normal";
}

export function queEntraSua1(j: JustificacionSua1, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  return j.elementos.map((el) => {
    const d = el.detalle;
    const base = { id: el.id, elementoId: el.id, estado: trato(estados[el.id]) };
    switch (d.clase) {
      case "escalera":
        return {
          ...base,
          titulo: el.nombre,
          detalle: [d.plantas, d.restringida ? "uso restringido" : textoAscensor(d)].filter((x) => x).join(" · "),
          trato: cifrasEscalera(d),
        };
      case "barreras":
        return {
          ...base,
          titulo: d.grupo === "cubierta" ? "Cubierta transitable" : `Barreras ${d.plantas}`,
          detalle: d.grupo === "cubierta" ? `a ${m(d.cotaMax_m)}` : d.grupo === "baja" ? "hasta 6 m sobre la rasante" : "a más de 6 m",
          trato: `${m(d.altura_m)} (≥ ${m(d.min_m)})`,
        };
      case "rampa_garaje":
        return { ...base, titulo: "Rampa del garaje", detalle: d.peatonal ? "vehículos y personas" : "el peatón va por la escalera", trato: d.peatonal ? pct(d.pendiente_pct) : "fuera de 4.3" };
      case "rampa_acceso":
        return { ...base, titulo: "Rampa de acceso", detalle: `${m(d.longitud_m)} · itinerario accesible`, trato: `${pct(d.pendiente_pct)} (≤ ${pct(d.max_pct)})` };
      case "resbaladicidad":
        return { ...base, titulo: "Suelos de las oficinas", detalle: "uso Administrativo", trato: "clase 1 a 3" };
      case "limpieza":
        return { ...base, titulo: "Acristalamientos", detalle: `${d.plantas} · a más de 6 m`, trato: d.carpinteria === "practicable" ? "practicables" : "con fijos" };
    }
  });
}

// -----------------------------------------------------------------------------
// Etiquetas y lista
// -----------------------------------------------------------------------------

export function textoEtiquetaSua1(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "escalera":
      return cifrasEscalera(d);
    case "barreras":
      return d.altura_m < d.min_m ? `${m(d.altura_m)} < ${m(d.min_m)}` : m(d.altura_m);
    case "rampa_garaje":
      return d.peatonal ? pct(d.pendiente_pct) : "solo vehículos";
    case "rampa_acceso":
      return `${pct(d.pendiente_pct)} · ${m(d.longitud_m)}`;
    case "resbaladicidad":
      return "clase 1 a 3";
    case "limpieza":
      return d.carpinteria === "practicable" ? "practicables" : "con fijos";
  }
}

export function resultadoListaSua1(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "escalera": {
      const base = `C ${rangoCm(d.cMenor_cm, d.cMayor_cm)} (≤ ${cm(d.cMax_cm)}) · H ${cm(d.huella_cm)} · ${m(d.anchura_m)}`;
      return d.restringida ? base : `${base} · 2C+H ${rangoCm(d.relacionMenor_cm, d.relacionMayor_cm, 1)} · tramo ${m(d.alturaTramoMayor_m)}`;
    }
    case "barreras":
      return `${d.plantas === "cubierta" ? "cubierta" : d.plantas} · ${m(d.altura_m)} frente a ${m(d.min_m)}`;
    case "rampa_garaje":
      return d.peatonal ? `${pct(d.pendiente_pct)} frente a ${pct(d.max_pct)}` : "solo vehículos: el peatón va por la escalera";
    case "rampa_acceso":
      return `${pct(d.pendiente_pct)} frente a ${pct(d.max_pct)} · tramo ${m(d.longitud_m)} (≤ ${m(d.tramoMax_m)})`;
    case "resbaladicidad":
      return "clase 1 seco, 2 húmedo o escalera, 3 exterior";
    case "limpieza":
      return `${d.plantas} · ${d.carpinteria === "practicable" ? "hojas practicables o desmontables" : "fijos al alcance desde el interior"}`;
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

function franjaEscalera(el: ElementoSi<unknown>, d: DetalleEscalera, estado: EstadoPresentacion): DetalleElemento {
  const filasPlanta = d.porPlanta.map((t) => ({
    k: `${t.etiqueta} · ${m(t.h_m)}`,
    v: `${t.peldanos} peldaños de ${cm(t.c_cm, 2)}${d.restringida ? "" : ` · 2C+H ${fmt(t.relacion_cm, undefined, 1)}`}`,
  }));
  const nota = d.fallos.length > 0 ? d.fallos.map((f) => TEXTO_FALLO[f](d)).join(" ") : undefined;
  if (d.restringida) {
    return {
      clase: "Escalera de uso restringido · ap. 4.1",
      titulo: el.nombre,
      valor: fmt(d.cMayor_cm, undefined, 1),
      unidad: "cm de contrahuella",
      estado,
      manda: `Dentro de la vivienda: anchura ≥ ${m(d.anchuraMin_m)}, contrahuella ≤ ${cm(d.cMax_cm, 0)} y huella ≥ 22 cm, con barandilla en los lados abiertos. Ni 2C + H ni altura de tramo. Los peldaños se cuentan con ${cm(d.cCalculo_cm)} de contrahuella.`,
      nota,
      filas: [
        ...filasPlanta,
        { k: "Huella", v: `${cm(d.huella_cm)} (≥ 22 cm)` },
        { k: "Anchura", v: `${m(d.anchura_m)} (≥ ${m(d.anchuraMin_m)})` },
        { k: "Barandilla", v: `lados abiertos, ≥ ${m(d.barandillaMin_m)}, no escalable` },
      ],
      cita: "DB-SUA · SUA 1 ap. 4.1 y 3.2",
    };
  }
  const porque = d.usoPublico ? "zona de uso público" : d.ascensor?.valor ? "uso privado con ascensor como alternativa" : "sin ascensor como alternativa";
  const asc = d.ascensor?.supuesto
    ? d.ascensor.valor
      ? "El ascensor se supone porque SUA 9 lo exige."
      : "El ascensor no se ha indicado y SUA 9 no lo exige: se supone que no lo hay."
    : undefined;
  return {
    clase: "Escalera de uso general · ap. 4.2",
    titulo: el.nombre,
    valor: fmt(d.cMayor_cm, undefined, 1),
    unidad: "cm de contrahuella",
    estado,
    manda: `Contrahuella entre ${cm(G.contrahuellaMin_cm, 0)} y ${cm(d.cMax_cm)} (${porque}), huella ≥ ${cm(G.huellaMin_cm, 0)} y ${G.relacionMin_cm} ≤ 2C + H ≤ ${cm(G.relacionMax_cm, 0)}; tramos de ${m(d.tramoMax_m ?? 0)} como máximo. Los peldaños salen de la altura de cada planta: n = ⌈h / ${fmt(d.cCalculo_cm, undefined, 1)}⌉ y C = h / n.`,
    nota: [nota, asc].filter((x) => x).join(" ") || undefined,
    filas: [
      ...filasPlanta,
      { k: "Huella", v: `${cm(d.huella_cm)} (≥ ${cm(G.huellaMin_cm, 0)})` },
      { k: "Anchura útil", v: `${m(d.anchura_m)} (≥ ${m(d.anchuraMin_m)}, tabla 4.1)` },
      { k: "Tramos por planta", v: `${d.tramos} · el mayor salva ${m(d.alturaTramoMayor_m)} (≤ ${m(d.tramoMax_m ?? 0)})` },
      { k: "Peldaños por tramo", v: d.peldanosMinTramo === null ? "uno o dos admitidos (zona común de vivienda)" : `≥ ${d.peldanosMinTramo}` },
      { k: "Pasamanos", v: d.pasamanos === "ambos" ? `en ambos lados${d.prolongacion ? ", prolongados 30 cm" : ""}` : "al menos en un lado" },
      { k: "Tabicas", v: d.tabica ? "obligatorias, verticales o ≤ 15º; sin bocel" : "sin bocel" },
      { k: "Barandilla del ojo", v: `≥ ${m(d.barandillaMin_m)} (ojo ${d.ojo === "estrecho" ? "< 40 cm" : `≥ 40 cm, caída de ${m(d.caida_m)}`})` },
    ],
    cita: "DB-SUA · SUA 1 ap. 4.2 · tabla 4.1",
  };
}

export function franjaSua1(el: ElementoSi<unknown>, _j: JustificacionSua1, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "escalera":
      return franjaEscalera(el, d, estado);
    case "barreras":
      return {
        clase: "Barreras de protección · ap. 3.2",
        titulo: el.nombre,
        valor: d.altura_m.toFixed(2).replace(".", ","),
        unidad: "m",
        estado,
        manda: `Donde la diferencia de cota supera 55 cm hay barrera, de ${m(B.alturaHasta6m_m)} como mínimo si no excede de 6 m y de ${m(B.alturaMasDe6m_m)} en el resto, medida desde el suelo. La diferencia de cota es la del suelo de la planta sobre la rasante.`,
        nota: d.residencial
          ? `No escalables: sin apoyos entre 30 y 50 cm ni salientes de más de 15 cm entre 50 y 80 cm, y sin aberturas por las que pase una esfera de ${cm(B.esferaVivienda_cm, 0)}.`
          : d.esfera_cm !== null
            ? `En las zonas de uso público, sin aberturas por las que pase una esfera de ${cm(d.esfera_cm, 0)}.`
            : undefined,
        filas: [
          { k: d.grupo === "cubierta" ? "Cubierta" : "Plantas", v: d.grupo === "cubierta" ? `a ${m(d.cotaMax_m)}` : d.plantas },
          { k: "Cota del suelo", v: d.cotaMin_m === d.cotaMax_m ? m(d.cotaMax_m) : `${m(d.cotaMin_m)} a ${m(d.cotaMax_m)}` },
          { k: "Altura mínima", v: m(d.min_m) },
          { k: "Altura proyectada", v: m(d.altura_m) },
        ],
        cita: "DB-SUA · SUA 1 ap. 3.1, 3.2.1 y 3.2.3",
      };
    case "rampa_garaje":
      return {
        clase: "Rampa de vehículos · ap. 4.3",
        titulo: el.nombre,
        valor: d.peatonal ? fmt(d.pendiente_pct, undefined, 1) : "Solo vehículos",
        unidad: d.peatonal ? "%" : undefined,
        estado,
        manda: d.peatonal
          ? `Rampa de vehículos prevista también para personas y fuera del itinerario accesible: pendiente ≤ ${pct(d.max_pct)}; sin límite de tramo, y con SUA 7.`
          : "Si el peatón entra por la escalera, la rampa no es un itinerario de personas: no entra en el ap. 4.3 y su pendiente la fijan las ordenanzas, no el CTE.",
        filas: d.peatonal ? [{ k: "Pendiente", v: `${pct(d.pendiente_pct)} (≤ ${pct(d.max_pct)})` }] : [{ k: "Acceso peatonal", v: "por la escalera del garaje" }],
        cita: "DB-SUA · SUA 1 ap. 4.3 pto 1 y 4.3.1 b)",
      };
    case "rampa_acceso":
      return {
        clase: "Rampa del itinerario accesible · ap. 4.3",
        titulo: el.nombre,
        valor: fmt(d.pendiente_pct, undefined, 1),
        unidad: "%",
        estado,
        manda: `Pendiente ≤ 10 % en tramos de menos de 3 m, ≤ 8 % de menos de 6 m y ≤ 6 % en el resto; transversal ≤ ${pct(RA.pendienteTransversalAccesible_pct)}; tramos de ${m(d.tramoMax_m)} como máximo y ${m(RA.anchuraAccesibleMin_m)} de anchura.`,
        nota: d.fallos.includes("longitud") ? `Un tramo de más de ${m(d.tramoMax_m)} necesita una meseta intermedia de ${m(RA.mesetaIntermediaAccesible_m)}.` : undefined,
        filas: [
          { k: "Longitud del tramo", v: `${m(d.longitud_m)} (≤ ${m(d.tramoMax_m)})` },
          { k: "Pendiente", v: `${pct(d.pendiente_pct)} (≤ ${pct(d.max_pct)})` },
          { k: "Desnivel", v: cm(d.desnivel_cm, 0) },
          { k: "Pasamanos", v: d.pasamanosAmbos ? `en ambos lados, a 90–110 y 65–75 cm${d.prolongacion ? ", prolongados 30 cm" : ""}` : "no exigidos a ambos lados" },
        ],
        cita: "DB-SUA · SUA 1 ap. 4.3.1 a 4.3.4",
      };
    case "resbaladicidad":
      return {
        clase: "Resbaladicidad · ap. 1",
        titulo: el.nombre,
        valor: "1 a 3",
        unidad: "clase",
        estado,
        manda: "Los suelos de uso Administrativo tienen la clase de la tabla 1.2 según dónde están, salvo las zonas de ocupación nula. En vivienda y aparcamiento no se exige.",
        nota: "Los aseos cuentan como zona húmeda aunque SI 3 no les dé ocupación (comentario del Ministerio, no reglamentario).",
        filas: [
          { k: "Interior seco, pendiente < 6 %", v: "clase 1" },
          { k: "Interior seco, ≥ 6 % y escaleras", v: "clase 2" },
          { k: "Interior húmedo (entrada, aseos), < 6 %", v: "clase 2" },
          { k: "Interior húmedo, ≥ 6 % y escaleras", v: "clase 3" },
          { k: "Exterior", v: "clase 3" },
        ],
        cita: "DB-SUA · SUA 1 ap. 1 · tablas 1.1 y 1.2",
      };
    case "limpieza":
      return {
        clase: "Limpieza de acristalamientos · ap. 5",
        titulo: el.nombre,
        valor: d.carpinteria === "practicable" ? "Practicables" : "Con fijos",
        estado,
        manda: `En vivienda, el vidrio transparente a más de ${m(SUA1_LIMPIEZA.datos.alturaSobreRasanteMasDe_m)} sobre la rasante se limpia desde el interior: o es practicable o desmontable, o toda su cara exterior queda a ${m(SUA1_LIMPIEZA.datos.radioAlcance_m)} de un punto del borde practicable a ${m(SUA1_LIMPIEZA.datos.alturaMaxPuntoBorde_m)} como máximo.`,
        nota: `Se aplica a las plantas con el suelo más ${m(CRITERIOS_SUA1.dintelTipico_m)} de dintel por encima de 6 m (criterio).`,
        filas: [
          { k: "Plantas", v: d.plantas },
          { k: "Carpintería", v: d.carpinteria === "practicable" ? "practicable o desmontable" : "con fijos al alcance; reversibles con bloqueo" },
        ],
        cita: "DB-SUA · SUA 1 ap. 5 · figura 5.1",
      };
  }
}

// -----------------------------------------------------------------------------
// Avisos, lo que no cumple y su arreglo
// -----------------------------------------------------------------------------

export function textoAvisoSua1(a: Aviso): TextoSi {
  switch (a.id) {
    case "ascensor-supuesto":
      return a.datos.hay
        ? {
            titulo: "El ascensor se supone.",
            detalle: "SUA 9 lo exige y se ha supuesto que lo hay; sin él cambia la escalera (contrahuella de 17,5 cm y tramos de 2,25 m como máximo). Indica en El edificio si hay ascensor.",
          }
        : {
            titulo: "No se sabe si hay ascensor.",
            detalle: "SUA 9 no lo exige y se ha supuesto que no lo hay; con ascensor la escalera cambia. Indica en El edificio si hay ascensor.",
          };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoSua1(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  switch (d.clase) {
    case "escalera":
      return { titulo: `${el.nombre}: no cumple.`, detalle: d.fallos.map((f) => TEXTO_FALLO[f](d)).join(" ") };
    case "barreras":
      return {
        titulo: `${el.nombre}: barrera baja.`,
        detalle: `Mide ${m(d.altura_m)} y hace falta ${m(d.min_m)} con el suelo a ${m(d.cotaMax_m)} sobre la rasante.`,
      };
    case "rampa_garaje":
      return { titulo: "La rampa del garaje es demasiado empinada.", detalle: `Con paso de personas, ${pct(d.max_pct)} como máximo; tiene ${pct(d.pendiente_pct)}.` };
    case "rampa_acceso":
      return {
        titulo: "La rampa de acceso no cumple.",
        detalle: [
          d.fallos.includes("pendiente") ? `Con ${m(d.longitud_m)} de tramo la pendiente es de ${pct(d.max_pct)} como máximo; tiene ${pct(d.pendiente_pct)}.` : "",
          d.fallos.includes("longitud") ? `El tramo pasa de ${m(d.tramoMax_m)}: hace falta una meseta intermedia.` : "",
        ]
          .filter((x) => x)
          .join(" "),
      };
    default:
      return null;
  }
}

/** El cambio de las decisiones que arregla lo que no cumple. */
export function arregloSua1(el: ElementoSi<unknown>, _j: JustificacionSua1): { etiqueta: string; cambios: Partial<Sua1Estado> } | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  switch (d.clase) {
    case "escalera": {
      const cambios: Partial<Sua1Estado> = {};
      const f = new Set(d.fallos);
      if (d.restringida) {
        if (f.has("anchura")) cambios.interiorAnchura_m = "habitual";
        if (f.has("huella")) cambios.interiorHuella_cm = "habitual";
      } else {
        if (f.has("anchura")) cambios.anchura_m = "habitual";
        if (f.has("huella") || f.has("relacion")) cambios.huella_cm = "habitual";
        if (f.has("tramo")) cambios.tramos = "habitual";
      }
      return Object.keys(cambios).length > 0 ? { etiqueta: "Volver a lo habitual", cambios } : null;
    }
    case "barreras":
      return { etiqueta: `Barreras de ${m(CRITERIOS_SUA1.alturaBarrera_m)}`, cambios: d.grupo === "baja" ? { barreraBaja_m: "habitual" } : d.grupo === "alta" ? { barreraAlta_m: "habitual" } : { barreraBaja_m: "habitual", barreraAlta_m: "habitual" } };
    case "rampa_garaje":
      return { etiqueta: `Pendiente del ${pct(d.max_pct)}`, cambios: { pendienteGaraje_pct: d.max_pct } };
    case "rampa_acceso":
      return d.fallos.includes("pendiente") ? { etiqueta: `Pendiente del ${pct(d.max_pct)}`, cambios: { rampaPendiente_pct: d.max_pct } } : null;
    default:
      return null;
  }
}

export function describirDibujoSua1(j: JustificacionSua1): string {
  const xs = escaleras(j);
  const partes = [
    xs.length > 0 ? `${xs.map((x) => `la ${x.tipo === "interior" ? "escalera interior" : x.tipo === "comun" ? "escalera común" : "escalera del garaje"} (${cifrasEscalera(x)})`).join(", ")}` : null,
    barreras(j).length > 0 ? `las barreras de cada planta en la fachada (${alturasBarreras(j)})` : null,
    j.elementos.some((e) => e.id === "rampa-garaje") ? "la rampa del garaje" : null,
    j.elementos.some((e) => e.id === "rampa-acceso") ? "la rampa de acceso" : null,
  ].filter((x): x is string => x !== null);
  return `Sección del edificio con ${partes.length > 0 ? partes.join(", ") : "sus plantas"}.`;
}
