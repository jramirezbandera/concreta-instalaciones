// =============================================================================
// DB-HE 6 — Textos (feature-24): la frase de la cabecera, «Qué entra», la franja
// de cada elemento, las etiquetas del dibujo y de la lista, los avisos y lo que
// no cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import type { Esquema } from "./estado";
import type { DetalleHe6, ElementoHe6, JustificacionHe6, Subesquema } from "./justificacion";
import { AMBITO_HE6, DOTACION_HE6 } from "./tablas";

const D = DOTACION_HE6.datos;
const HASTA = AMBITO_HE6.datos.excluidoHastaPlazas;

/** «12 plazas», «1 plaza». */
export function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

export const plazas = (n: number): string => plural(n, "plaza", "plazas");
export const estaciones = (n: number): string => plural(n, "estación", "estaciones");

/** «3,68 kW». */
export function kW(W: number): string {
  return `${(W / 1000).toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kW`;
}

/** «20 %». */
function pct(parte: number, total: number): string {
  return `${total > 0 ? Math.round((parte / total) * 100) : 0} %`;
}

/** Lo que es cada esquema, en pocas palabras (ITC-BT-52 ap. 3). */
export const NOMBRE_ESQUEMA: Record<Esquema, string> = {
  "1": "Colectivo",
  "2": "Contador común con la vivienda",
  "3": "Contador por estación",
  "4": "Circuitos adicionales",
};

export const TEXTO_SUBESQUEMA: Record<Subesquema, string> = {
  "1a": "colectivo o troncal, con un contador principal en la centralización (en sus módulos de reserva) y contadores secundarios en las estaciones",
  "2": "individual, con un contador común para la vivienda y su estación, con el circuito desde la centralización",
  "3a": "individual, con un contador principal para cada estación en la centralización",
  "4a": "circuito adicional individual desde el cuadro de la vivienda",
  "4b": "circuitos adicionales desde el cuadro de los servicios generales del garaje",
};

function det(el: ElementoSi<unknown>): DetalleHe6 {
  return (el as ElementoHe6).detalle;
}

function buscar<C extends DetalleHe6["clase"]>(j: JustificacionHe6, clase: C): Extract<DetalleHe6, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleHe6, { clase: C }>) : null;
}

// ── Cabecera ────────────────────────────────────────────────────────────────

export function fraseHe6(j: JustificacionHe6): string {
  const pz = buscar(j, "plazas")!;
  if (j.plazas === 0) return "Sin aparcamiento, ni dentro ni fuera del edificio: HE 6 no se aplica.";
  if (pz.excluido) return `${plazas(j.plazas)} en un edificio sin viviendas, ${HASTA} o menos: HE 6 no se aplica.`;
  const c = buscar(j, "conduccion")!;
  if (j.unifamiliar) return `${plazas(j.plazas)}: la conducción la da el circuito de recarga que pide el REBT.`;
  if (j.uso === "residencial") {
    return c.previstas < c.exigidas
      ? `${plazas(j.plazas)}: la conducción de cables llega a ${c.previstas}, y debe llegar a todas.`
      : `${plazas(j.plazas)}: conducción de cables hasta todas; ninguna estación exigida.`;
  }
  const e = buscar(j, "estaciones")!;
  const falta = c.previstas < c.exigidas || e.instaladas < e.minimo;
  return `${plazas(j.plazas)}: conducción hasta ${c.previstas} (mínimo ${c.exigidas}) y ${estaciones(e.instaladas)} (mínimo ${e.minimo})${falta ? ", menos de lo exigido" : ""}.`;
}

export function metricasHe6(j: JustificacionHe6): string {
  if (!j.aplica) return `${plazas(j.plazas)} · no aplica`;
  const c = buscar(j, "conduccion")!;
  const e = buscar(j, "estaciones");
  return `${plazas(j.plazas)} · conducción ${c.previstas}/${c.exigidas}${e ? ` · estaciones ${e.instaladas}/${e.minimo}` : ""}`;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : "normal";
}

export function queEntraHe6(j: JustificacionHe6, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const pz = buscar(j, "plazas")!;
  const filas: FilaQueEntra[] = [];
  if (pz.interiores > 0) {
    filas.push({
      id: "interiores",
      titulo: j.unifamiliar ? "Garaje de la vivienda" : "Garaje",
      detalle: plazas(pz.interiores),
      trato: j.aplica ? (j.uso === "residencial" ? "conducción al 100 %" : "20 % y 1 cada 40") : "no aplica",
      estado: trato(estados.conduccion),
      elementoId: j.aplica ? "conduccion" : "plazas",
    });
  }
  if (pz.exteriores > 0) {
    filas.push({
      id: "exteriores",
      titulo: pz.parcela ? "Plaza en la parcela" : "Plazas exteriores",
      detalle: pz.parcela ? "marcada en REBT" : `${plazas(pz.exteriores)} adscritas`,
      trato: j.aplica ? "cuentan" : "no aplica",
      estado: trato(estados.conduccion),
      elementoId: j.aplica ? "conduccion" : "plazas",
    });
  }
  const e = buscar(j, "estaciones");
  if (e && e.accesibles > 0) {
    filas.push({
      id: "accesibles",
      titulo: "Plazas accesibles",
      detalle: e.accesiblesSua ? `${e.accesibles}, las de SUA 9` : `${e.accesibles}, indicadas`,
      trato: `${estaciones(e.porAccesibles)} en ellas`,
      estado: trato(estados.estaciones),
      elementoId: "estaciones",
    });
  }
  return filas;
}

export function piezasHe6(j: JustificacionHe6): { texto: string; acento: boolean }[] {
  if (!j.aplica) return [{ texto: j.plazas > 0 ? plazas(j.plazas) : "sin aparcamiento", acento: false }];
  const c = buscar(j, "conduccion")!;
  const e = buscar(j, "estaciones");
  return [
    { texto: `conducción ${pct(c.previstas, c.plazas)}`, acento: c.previstas < c.exigidas },
    ...(e ? [{ texto: estaciones(e.instaladas), acento: e.instaladas < e.minimo }] : []),
  ];
}

// ── Etiquetas y lista ───────────────────────────────────────────────────────

export function textoEtiquetaHe6(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "plazas":
      return plazas(d.plazas);
    case "conduccion":
      return `Conducción ${d.previstas}/${d.plazas}`;
    case "estaciones":
      return estaciones(d.instaladas);
    case "esquema":
      return `Esquema ${d.subesquema}`;
    case "estacion":
      return kW(d.potencia_W);
  }
}

export function resultadoListaHe6(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "plazas":
      if (d.plazas === 0) return "Sin aparcamiento: no se aplica";
      if (d.excluido) return `${plazas(d.plazas)}, ${HASTA} o menos sin viviendas: no se aplica`;
      return [d.interiores > 0 ? `${d.interiores} interiores` : "", d.exteriores > 0 ? `${d.exteriores} exteriores` : ""].filter(Boolean).join(" + ") + ` = ${plazas(d.plazas)}`;
    case "conduccion":
      return d.porC13
        ? "El circuito C13 de recarga (REBT) llega a la plaza"
        : `${plazas(d.previstas)} (${pct(d.previstas, d.plazas)}) frente a ${d.exigidas} (${d.uso === "residencial" ? "100 %" : "20 %"})`;
    case "estaciones":
      return `${estaciones(d.instaladas)} frente a ${d.minimo}: ${d.porPlazas} por plazas${d.porAccesibles > 0 ? `, ${d.porAccesibles} en plazas accesibles` : ""}`;
    case "esquema":
      return `${d.subesquema}: ${TEXTO_SUBESQUEMA[d.subesquema]}`;
    case "estacion":
      return `SAVE, modo 3, base tipo 2, ${d.texto}: ${kW(d.potencia_W)}`;
  }
}

// ── La franja ───────────────────────────────────────────────────────────────

export function franjaHe6(el: ElementoSi<unknown>, j: JustificacionHe6, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "plazas":
      return {
        clase: "Ámbito · ap. 1",
        titulo: el.nombre,
        valor: String(d.plazas),
        unidad: `plazas · ${d.aplica ? "se aplica" : "no se aplica"}`,
        estado,
        manda: `La sección se aplica a los edificios con aparcamiento, interior o exterior adscrito. Se excluyen los de uso distinto del residencial privado con ${HASTA} plazas o menos.`,
        nota:
          d.uso === "residencial"
            ? "Edificio con viviendas: se aplica el criterio del residencial privado a todas las plazas (uso característico, ap. 3 pto 3)."
            : undefined,
        filas: [
          { k: "Interiores", v: plazas(d.interiores) },
          { k: d.parcela ? "En la parcela" : "Exteriores adscritas", v: plazas(d.exteriores) },
          { k: "Uso", v: d.uso === "residencial" ? "residencial privado" : "distinto del residencial privado" },
        ],
        cita: "DB-HE · HE 6 ap. 1",
      };
    case "conduccion":
      return {
        clase: `Conducción de cables · ap. 3 pto ${d.uso === "residencial" ? 1 : 2}`,
        titulo: el.nombre,
        valor: String(d.previstas),
        unidad: `plazas · mínimo ${d.exigidas}`,
        estado,
        manda:
          d.uso === "residencial"
            ? "En uso residencial privado, sistemas de conducción de cables que permitan el futuro suministro a estaciones de recarga en el 100 % de las plazas: desde la centralización de contadores, por las vías principales del aparcamiento, hasta cada plaza (ITC-BT-52 ap. 3.2 a)."
            : `En otros usos, conducción de cables para al menos el 20 % de las plazas (${d.exigidas} de ${d.plazas}, por exceso), hasta cada una de ellas. Las plazas con estación cuentan (criterio).`,
        nota: d.porC13
          ? "La unifamiliar con aparcamiento lleva el circuito C13 de recarga completo (ITC-BT-52 ap. 3.1, esquema 4a): cubre la conducción."
          : d.minimas
            ? "Sin indicar las plazas con conducción, se toman las mínimas."
            : undefined,
        filas: [
          { k: "Plazas", v: String(d.plazas) },
          { k: "Con conducción", v: `${d.previstas} (${pct(d.previstas, d.plazas)})` },
          { k: "Mínimo", v: `${d.exigidas} (${d.uso === "residencial" ? "100 %" : "20 %"})` },
        ],
        uso: el.uso,
        cita: `DB-HE · HE 6 ap. 3 pto ${d.uso === "residencial" ? 1 : 2}`,
      };
    case "estaciones":
      return {
        clase: "Estaciones de recarga · ap. 3 pto 2",
        titulo: el.nombre,
        valor: String(d.instaladas),
        unidad: `${d.instaladas === 1 ? "estación" : "estaciones"} · mínimo ${d.minimo}`,
        estado,
        manda: `Una estación por cada ${d.age ? D.plazasPorEstacionAge : D.plazasPorEstacion} plazas o fracción${d.age ? " (edificio de la Administración General del Estado)" : ""}, y una por cada ${D.accesiblesPorEstacion} plazas accesibles, que cuentan dentro del total.`,
        nota:
          d.porAccesibles > 0
            ? `${plural(d.porAccesibles, "estación va", "estaciones van")} en plazas accesibles: el DB no dice «o fracción», se toma por exceso (criterio).`
            : undefined,
        filas: [
          { k: `Por plazas (1/${d.age ? D.plazasPorEstacionAge : D.plazasPorEstacion})`, v: String(d.porPlazas) },
          { k: "Plazas accesibles", v: `${d.accesibles}${d.accesiblesSua ? " (SUA 9)" : ""}` },
          { k: "En plazas accesibles (1/5)", v: String(d.porAccesibles) },
          { k: "Mínimo", v: String(d.minimo) },
          { k: "Instaladas", v: String(d.instaladas) },
        ],
        cita: "DB-HE · HE 6 ap. 3 pto 2",
      };
    case "esquema":
      return {
        clase: "Justificación · ap. 4 a)",
        titulo: el.nombre,
        valor: d.subesquema,
        unidad: NOMBRE_ESQUEMA[d.esquema].toLowerCase(),
        estado,
        manda: `El proyecto indica el esquema de conexión de la ITC-BT-52 con el que se dimensiona: ${TEXTO_SUBESQUEMA[d.subesquema]}. La preinstalación debe permitir después cualquier esquema.`,
        nota: d.unifamiliar
          ? "En la unifamiliar, el circuito C13 desde el cuadro de la vivienda (ITC-BT-52 ap. 3.1)."
          : d.habitual
            ? "El habitual del uso (criterio). REBT lee este esquema: el factor de 0,3 solo vale en el colectivo con SPL."
            : "REBT lee este esquema: el factor de 0,3 solo vale en el colectivo con SPL.",
        filas: [
          { k: "Esquema", v: `${d.subesquema} · ${NOMBRE_ESQUEMA[d.esquema].toLowerCase()}` },
          { k: "Elegido", v: d.unifamiliar ? "obligado (C13)" : d.habitual ? "el habitual" : "indicado" },
        ],
        cita: "DB-HE · HE 6 ap. 4 a); ITC-BT-52 ap. 3",
      };
    case "estacion":
      return {
        clase: "Justificación · ap. 4 d)",
        titulo: el.nombre,
        valor: kW(d.potencia_W).replace(" kW", ""),
        unidad: "kW por estación",
        estado,
        manda: `Punto de recarga tipo SAVE, modo de carga 3, base de toma de corriente tipo 2, ${d.texto}. El HE 6 no fija el tipo ni la potencia: pide declararlos.`,
        nota: j.uso === "otros" ? "REBT prevé esta potencia por estación en la carga del edificio." : undefined,
        filas: [
          { k: "Estaciones", v: String(d.estaciones) },
          { k: "Potencia", v: kW(d.potencia_W) },
          { k: "Total", v: kW(d.potencia_W * d.estaciones) },
        ],
        cita: "DB-HE · HE 6 ap. 4 d); ITC-BT-52 ap. 5.4",
      };
  }
}

// ── Avisos e incumplimientos ────────────────────────────────────────────────

export function textoAvisoHe6(a: Aviso): TextoSi {
  switch (a.id) {
    case "plazas-garaje":
      return {
        titulo: "Indica las plazas del garaje.",
        detalle: "Hay un garaje sin plazas en El edificio: no cuenta para la dotación. Dalas en la zona.",
      };
    case "existente":
      return {
        titulo: "Edificio existente: comprueba si se aplica.",
        detalle:
          "La herramienta calcula obra nueva. En un edificio existente, HE 6 se aplica con un cambio de uso característico, una ampliación o una reforma que intervengan en el aparcamiento (más del 10 % y 50 m² útiles, o más del 25 % de la envolvente) o una intervención en más del 50 % de la potencia eléctrica, y se excluye si cumplirlo cuesta más del 7 % de la intervención (ap. 1).",
      };
    case "mixto":
      return {
        titulo: "Viviendas y otros usos: se aplica el criterio del uso característico.",
        detalle:
          "Si el aparcamiento de cada uso no está claramente diferenciado, todas las plazas siguen el criterio del residencial privado (ap. 3 pto 3). Si lo está, las plazas del otro uso llevan el 20 % y sus estaciones: justifícalo aparte.",
      };
    case "accesibles":
      return {
        titulo: "Las plazas accesibles suben el mínimo de estaciones.",
        detalle: `Una estación por cada ${D.accesiblesPorEstacion} plazas accesibles: el DB no dice «o fracción», y se toma por exceso (criterio). Con grupos completos saldría una menos.`,
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoHe6(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "conduccion") {
    return {
      titulo: "La conducción de cables no llega a las plazas exigidas.",
      detalle: `Llega a ${plazas(d.previstas)} y el mínimo es ${d.exigidas} (${d.uso === "residencial" ? "todas, el 100 %" : "el 20 %, por exceso"}).`,
    };
  }
  if (d.clase === "estaciones") {
    return {
      titulo: "Faltan estaciones de recarga.",
      detalle: `Se instalan ${estaciones(d.instaladas)} y el mínimo es ${d.minimo}${d.porAccesibles > 0 ? `, ${d.porAccesibles} de ellas en plazas accesibles` : ""}.`,
    };
  }
  return null;
}

export function describirDibujoHe6(j: JustificacionHe6): string {
  if (!j.aplica) return `Sección del edificio: ${j.plazas > 0 ? plazas(j.plazas) : "sin aparcamiento"}.`;
  return "Sección del edificio con el aparcamiento, la conducción de cables desde la centralización de contadores y las estaciones de recarga.";
}
