// =============================================================================
// DB-SI, SI 5 — Textos (feature-19): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas del dibujo y de la lista, los avisos y
// lo que no cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import { listaY } from "../../lib/cte/redaccion";
import { fmt } from "../../lib/units/format";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import type { EspacioManiobra, RejasFachada } from "./estado";
import type { DetalleSi5, ElementoSi5, JustificacionSi5 } from "./justificacion";
import { separacionMaxFachada, SI5_APROXIMACION, SI5_ENTORNO, SI5_FACHADA } from "./tablas";

const E = SI5_ENTORNO.datos;
const A = SI5_APROXIMACION.datos;
const F = SI5_FACHADA.datos;

function m(v: number, dec = 2): string {
  return fmt(v, "m", dec);
}

export const NOMBRE_MANIOBRA: Record<EspacioManiobra, string> = {
  calle: "la calle, que cumple",
  calle_no_cumple: "la calle, que no cumple",
  propio: "un espacio del proyecto",
};

export const NOMBRE_REJAS: Record<RejasFachada, string> = {
  sin: "sin rejas",
  hasta9: "rejas solo hasta 9 m",
  todas: "rejas también por encima de 9 m",
};

function det(el: ElementoSi<unknown>): DetalleSi5 {
  return (el as ElementoSi5).detalle;
}

/** «12 m» con la altura de evacuación. */
function textoAltura(h_m: number): string {
  return m(h_m);
}

export function fraseSi5(j: JustificacionSi5): string {
  const e = j.elementos.find((x) => x.id === "altura")!.detalle as Extract<DetalleSi5, { clase: "altura" }>;
  if (e.unifamiliar) {
    return "Vivienda unifamiliar: su interior no es origen de evacuación, así que no se exige espacio de maniobra ni fachada accesible.";
  }
  if (!j.exige) {
    return `Altura de evacuación de ${textoAltura(j.h_m)}, no mayor que 9 m: no se exige espacio de maniobra para los bomberos ni fachada accesible.`;
  }
  const sep = j.elementos.find((x) => x.id === "maniobra")!.detalle as Extract<DetalleSi5, { clase: "maniobra" }>;
  const fallo = j.veredicto === "fail" ? " Hay rejas en plantas donde no se admiten." : "";
  return `Altura de evacuación de ${textoAltura(j.h_m)}: espacio de maniobra de ${fmt(E.anchuraLibreMin_m, "m", 0)} con el camión a ${fmt(sep.separacionMax_m, "m", 0)} como mucho de la fachada, vial de ${fmt(A.anchuraLibreMin_m, "m", 1)} y huecos de acceso en cada planta.${fallo}`;
}

export function metricasSi5(j: JustificacionSi5): string {
  if (!j.exige) return "no se exige espacio de maniobra";
  const sep = (j.elementos.find((x) => x.id === "maniobra")!.detalle as Extract<DetalleSi5, { clase: "maniobra" }>).separacionMax_m;
  return `h ${textoAltura(j.h_m)} · camión a ≤ ${fmt(sep, "m", 0)}`;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "fu" ? "out" : "normal";
}

export function queEntraSi5(j: JustificacionSi5, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    switch (d.clase) {
      case "altura":
        filas.push({
          id: "altura",
          titulo: "Altura de evacuación",
          detalle: d.unifamiliar ? "vivienda unifamiliar" : "la de la última planta ocupable",
          trato: d.unifamiliar ? "sin orígenes" : textoAltura(d.h_m),
          estado: "normal",
          elementoId: "altura",
        });
        break;
      case "maniobra":
        filas.push({
          id: "maniobra",
          titulo: "Espacio de maniobra",
          detalle: d.exige ? NOMBRE_MANIOBRA[d.maniobra] : "h ≤ 9 m",
          trato: d.exige ? `≤ ${fmt(d.separacionMax_m, "m", 0)} a fachada` : "no se exige",
          estado: trato(estados.maniobra),
          elementoId: "maniobra",
        });
        break;
      case "vial":
        filas.push({ id: "vial", titulo: "Vial de aproximación", detalle: NOMBRE_MANIOBRA[d.maniobra], trato: "3,5 m · 4,5 m", estado: trato(estados.vial), elementoId: "vial" });
        break;
      case "fachada":
        filas.push({ id: "fachada", titulo: "Fachada accesible", detalle: NOMBRE_REJAS[d.rejas], trato: "huecos en cada planta", estado: trato(estados.fachada), elementoId: "fachada" });
        break;
      case "forestal":
        filas.push({ id: "forestal", titulo: "Zona forestal", detalle: "linda con un área forestal", trato: "franja de 25 m", estado: trato(estados.forestal), elementoId: "forestal" });
        break;
    }
  }
  return filas;
}

export function textoEtiquetaSi5(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "altura":
      return d.unifamiliar ? "unifamiliar" : `h ${textoAltura(d.h_m)}`;
    case "maniobra":
      return d.exige ? `camión a ≤ ${fmt(d.separacionMax_m, "m", 0)}` : "no se exige";
    case "vial":
      return "vial 3,5 m · gálibo 4,5 m";
    case "fachada":
      return d.rejas === "todas" && d.plantasAltas.length > 0 ? "rejas: no admitidas" : "huecos 0,80 × 1,20";
    case "forestal":
      return "franja 25 m";
  }
}

export function resultadoListaSi5(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "altura":
      return d.unifamiliar ? "vivienda unifamiliar: sin orígenes de evacuación" : `${textoAltura(d.h_m)} ${d.exige ? "> 9 m" : "≤ 9 m"}`;
    case "maniobra":
      return d.exige
        ? `${fmt(E.anchuraLibreMin_m, "m", 0)} de anchura · camión a ≤ ${fmt(d.separacionMax_m, "m", 0)} · ${NOMBRE_MANIOBRA[d.maniobra]}`
        : "no se exige (altura de evacuación ≤ 9 m)";
    case "vial":
      return `anchura ≥ ${m(A.anchuraLibreMin_m, 1)} · gálibo ≥ ${m(A.galiboMin_m, 1)} · ${fmt(A.capacidadPortante_kN_m2, "kN/m²", 0)}`;
    case "fachada":
      return `huecos ≥ ${m(F.huecoMin_m.horizontal)} × ${m(F.huecoMin_m.vertical)} · alféizar ≤ ${m(F.alfeizarMax_m)} · ${NOMBRE_REJAS[d.rejas]}`;
    case "forestal":
      return `franja de ${fmt(E.forestal.franja_m, "m", 0)} y camino perimetral de ${fmt(E.forestal.caminoPerimetral_m, "m", 0)}`;
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

export function franjaSi5(el: ElementoSi<unknown>, j: JustificacionSi5, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "altura":
      return {
        clase: "Dato de partida · El edificio",
        titulo: el.nombre,
        valor: d.unifamiliar ? "—" : fmt(d.h_m, undefined, 2),
        unidad: d.unifamiliar ? "unifamiliar" : "m",
        estado,
        manda: d.unifamiliar
          ? "El interior de una vivienda no es origen de evacuación, así que una unifamiliar no tiene altura de evacuación que pase de 9 m (Anejo SI A)."
          : `Es la cota del suelo de la última planta con ocupación sobre la salida del edificio. SI 5 pide espacio de maniobra si es mayor que 9 m${d.exige ? "" : ": con 9 m justos, no"}.`,
        filas: [
          { k: "Altura de evacuación", v: d.unifamiliar ? "—" : textoAltura(d.h_m) },
          { k: "Umbral del ap. 1.2", v: "mayor que 9 m" },
          { k: "Se exige", v: d.exige ? "espacio de maniobra, vial y fachada accesible" : "nada de ap. 1.1, 1.2 ni 2" },
        ],
        cita: "DB-SI · SI 5 ap. 1.2 pto 1 · Anejo SI A",
      };
    case "maniobra":
      if (!d.exige) {
        return {
          clase: "Entorno",
          titulo: el.nombre,
          valor: "No se exige",
          estado,
          manda: "Con una altura de evacuación de 9 m o menos no hace falta espacio de maniobra; tampoco, por tanto, vial de aproximación ni fachada accesible.",
          nota: "Siguen en pie, sin umbral de altura, el espacio para maniobrar en las vías sin salida de más de 20 m y las condiciones de las zonas forestales.",
          filas: [{ k: "Altura de evacuación", v: j.elementos[0].detalle.clase === "altura" && j.elementos[0].detalle.unifamiliar ? "unifamiliar" : textoAltura(d.h_m) }],
          cita: "DB-SI · SI 5 ap. 1.2",
        };
      }
      return {
        clase: "Entorno · ap. 1.2",
        titulo: el.nombre,
        valor: `≤ ${fmt(d.separacionMax_m, undefined, 0)}`,
        unidad: "m del camión a la fachada",
        estado,
        manda:
          d.maniobra === "propio"
            ? "Es un espacio del proyecto: se dimensiona y se comprueba en planta con estas condiciones, a lo largo de la fachada con los accesos."
            : d.maniobra === "calle"
              ? "Es la calle a la que da el portal. No forma parte del proyecto: la memoria la describe y dice que cumple estas condiciones."
              : "La calle no cumple alguna condición. Al no formar parte del proyecto no se le puede exigir (Introducción II); la memoria lo dice y conviene consultarlo con el servicio de extinción.",
        filas: [
          { k: "Anchura libre", v: `≥ ${fmt(E.anchuraLibreMin_m, "m", 0)}` },
          { k: "Altura libre", v: "la del edificio" },
          { k: "Separación del camión a la fachada", v: `≤ ${fmt(d.separacionMax_m, "m", 0)} (h ${d.h_m <= 15 ? "≤ 15 m" : d.h_m <= 20 ? "≤ 20 m" : "> 20 m"})` },
          { k: "Distancia a los accesos", v: `≤ ${fmt(E.distanciaMaxAccesos_m, "m", 0)}` },
          { k: "Pendiente", v: `≤ ${fmt(E.pendienteMax_pct, "%", 0)}` },
          { k: "Punzonamiento", v: `${fmt(E.punzonamiento.carga_kN, "kN", 0)} sobre ${fmt(E.punzonamiento.diametro_cm, "cm", 0)} Ø` },
          ...(d.columnaSeca ? [{ k: "Columna seca", v: `bombeo a < ${fmt(E.columnaSecaBombeoMax_m, "m", 0)} de cada toma` }] : []),
        ],
        cita: "DB-SI · SI 5 ap. 1.2 ptos 1 a 4",
      };
    case "vial":
      return {
        clase: "Entorno · ap. 1.1",
        titulo: el.nombre,
        valor: fmt(A.anchuraLibreMin_m, undefined, 1),
        unidad: "m de anchura libre",
        estado,
        manda: "El vial por el que llegan los bomberos al espacio de maniobra. Si es la calle pública, la memoria la describe; si es del proyecto, se dimensiona con estas cifras.",
        filas: [
          { k: "Anchura mínima libre", v: m(A.anchuraLibreMin_m, 1) },
          { k: "Gálibo", v: m(A.galiboMin_m, 1) },
          { k: "Capacidad portante", v: fmt(A.capacidadPortante_kN_m2, "kN/m²", 0) },
          { k: "Tramos curvos", v: `radios ${m(A.curva.radioMin1_m)} y ${m(A.curva.radioMin2_m)} · ${m(A.curva.anchuraLibre_m)} libres` },
        ],
        cita: "DB-SI · SI 5 ap. 1.1",
      };
    case "fachada": {
      const malo = d.rejas === "todas" && d.plantasAltas.length > 0;
      return {
        clase: "Accesibilidad por fachada · ap. 2",
        titulo: el.nombre,
        valor: "0,80 × 1,20",
        unidad: "m de hueco",
        estado,
        manda: malo
          ? `No se admiten rejas ni elementos de seguridad en los huecos de las plantas con altura de evacuación mayor que 9 m (${listaY(d.plantasAltas)}).`
          : "La fachada que da al espacio de maniobra tiene en cada planta huecos por los que pueden entrar los bomberos.",
        filas: [
          { k: "Alféizar", v: `≤ ${m(F.alfeizarMax_m)} sobre la planta` },
          { k: "Hueco", v: `≥ ${m(F.huecoMin_m.horizontal)} × ${m(F.huecoMin_m.vertical)}` },
          { k: "Entre ejes de huecos", v: `≤ ${fmt(F.separacionEjesMax_m, "m", 0)}` },
          { k: "Rejas", v: `solo en plantas con h ≤ ${fmt(F.elementosSeguridadHastaH_m, "m", 0)}` },
          { k: "Plantas por encima de 9 m", v: d.plantasAltas.length > 0 ? listaY(d.plantasAltas) : "ninguna" },
        ],
        cita: "DB-SI · SI 5 ap. 2 pto 1",
      };
    }
    case "forestal":
      return {
        clase: "Entorno · ap. 1.2 pto 6",
        titulo: el.nombre,
        valor: fmt(E.forestal.franja_m, undefined, 0),
        unidad: "m de franja",
        estado,
        manda: "En zonas edificadas limítrofes o interiores a áreas forestales, sin umbral de altura.",
        filas: [
          { k: "Franja libre de vegetación", v: fmt(E.forestal.franja_m, "m", 0) },
          { k: "Camino perimetral", v: fmt(E.forestal.caminoPerimetral_m, "m", 0) },
          { k: "Acceso", v: `dos vías, o fondo de saco de ${m(E.forestal.fondoSacoRadio_m)} de radio` },
        ],
        cita: "DB-SI · SI 5 ap. 1.2 pto 6",
      };
  }
}

// -----------------------------------------------------------------------------
// Avisos y lo que no cumple
// -----------------------------------------------------------------------------

export function textoAvisoSi5(a: Aviso): TextoSi {
  switch (a.id) {
    case "calle-no-cumple":
      return {
        titulo: "La calle no cumple como espacio de maniobra.",
        detalle: "No forma parte del proyecto y no se le puede exigir, pero la memoria debe decirlo. Conviene consultarlo con el servicio de extinción de incendios.",
      };
    case "maniobra-propia":
      return {
        titulo: "El espacio de maniobra es del proyecto.",
        detalle: "Compruébalo en planta: anchura, pendiente, distancia a la fachada y a los accesos, y que el firme resista el punzonamiento.",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoSi5(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "fachada") {
    return {
      titulo: "Rejas en plantas de más de 9 m.",
      detalle: `En ${listaY(d.plantasAltas)} los huecos de la fachada accesible no pueden tener rejas ni otros elementos que impidan entrar.`,
    };
  }
  return null;
}

export function describirDibujoSi5(j: JustificacionSi5): string {
  if (!j.exige) return `Sección del edificio con su altura de evacuación (${textoAltura(j.h_m)}): no se exige espacio de maniobra.`;
  return `Sección del edificio con el camión de bomberos en la calle, a ${fmt(separacionMaxFachada(j.h_m), "m", 0)} como mucho de la fachada, y los huecos de acceso de cada planta.`;
}

/** Las piezas de la fila de La obra. */
export function piezasSi5(j: JustificacionSi5): { texto: string; acento: boolean }[] {
  if (!j.exige) return [{ texto: "no se exige", acento: false }];
  return [
    { texto: "espacio de maniobra", acento: false },
    { texto: "fachada accesible", acento: false },
  ];
}
