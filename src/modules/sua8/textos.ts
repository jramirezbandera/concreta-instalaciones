// =============================================================================
// DB-SUA, SUA 8 — Textos (feature-20): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas del dibujo y de la lista, los avisos y
// lo que no cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import { fmt } from "../../lib/units/format";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import type { Contenido, UsoEspecial } from "./estado";
import type { DetalleSua8, ElementoSua8, JustificacionSua8 } from "./justificacion";
import { SUA8_ANEJO_B, SUA8_SIEMPRE, type EntornoC1, type MaterialC2, type NivelProteccion } from "./tablas";

const B = SUA8_ANEJO_B.datos;

export const NOMBRE_ENTORNO: Record<EntornoC1, string> = {
  proximo: "próximo a edificios o árboles de su altura o más altos",
  rodeado_bajos: "rodeado de edificios más bajos",
  aislado: "aislado",
  colina: "aislado sobre una colina o promontorio",
};

export const NOMBRE_MATERIAL: Record<MaterialC2, string> = {
  metalica: "metálica",
  hormigon: "de hormigón",
  madera: "de madera",
};

export const NOMBRE_CONTENIDO: Record<Contenido, string> = {
  otros: "sin contenido inflamable",
  inflamable: "con contenido inflamable",
};

export const NOMBRE_ESPECIAL: Record<UsoEspecial, string> = {
  ninguno: "ninguno",
  servicio: "servicio imprescindible",
  peligrosas: "sustancias peligrosas",
};

/** Una frecuencia en impactos/año: «0,0132». */
export function frecuencia(v: number): string {
  return fmt(v, undefined, 4);
}

/** La eficiencia sin redondear para comparar, con tres decimales para leer. */
export function textoE(e: number): string {
  return fmt(e, undefined, 3);
}

function m(v: number, dec = 2): string {
  return fmt(v, "m", dec);
}

function det(el: ElementoSi<unknown>): DetalleSua8 {
  return (el as ElementoSua8).detalle;
}

function proteccion(j: JustificacionSua8): Extract<DetalleSua8, { clase: "proteccion" }> {
  return j.elementos.find((x) => x.id === "proteccion")!.detalle as Extract<DetalleSua8, { clase: "proteccion" }>;
}

/** Lo que dice la conclusión en pocas palabras. */
function conclusionCorta(d: Extract<DetalleSua8, { clase: "proteccion" }>): string {
  if (d.obligatoria) return `nivel ${d.nivel}`;
  return d.e === null ? "no es necesaria" : "no obligatoria (nivel 4)";
}

export function fraseSua8(j: JustificacionSua8): string {
  const d = proteccion(j);
  const r = j.resultado;
  if (d.siempre === "peligrosas") return "Se manipulan sustancias peligrosas: el edificio dispone siempre de protección contra el rayo de nivel 1 (E ≥ 0,98).";
  if (d.siempre === "altura") {
    return `El edificio mide ${m(j.h_m)}, más de ${fmt(SUA8_SIEMPRE.datos.alturaMayorQue_m, "m", 0)}: dispone siempre de protección contra el rayo de nivel 1 (E ≥ 0,98).`;
  }
  if (!d.necesaria) return `Ne = ${frecuencia(r.ne)} no es mayor que Na = ${frecuencia(r.na)} impactos al año: no es necesaria instalación de protección contra el rayo.`;
  if (!d.obligatoria) {
    return `Ne = ${frecuencia(r.ne)} supera Na = ${frecuencia(r.na)}, pero la eficiencia exigida, E = ${textoE(d.e!)}, es menor que 0,80: nivel 4, la instalación no es obligatoria.`;
  }
  const falta = d.instalacion === "no" ? " Hay que proyectarla." : "";
  return `Ne = ${frecuencia(r.ne)} supera Na = ${frecuencia(r.na)} y la eficiencia exigida es E = ${textoE(d.e!)}: instalación de protección contra el rayo de nivel ${d.nivel}.${falta}`;
}

export function metricasSua8(j: JustificacionSua8): string {
  const d = proteccion(j);
  return `Ne ${frecuencia(j.resultado.ne)} · Na ${frecuencia(j.resultado.na)} · ${conclusionCorta(d)}`;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "fu" ? "out" : "normal";
}

export function queEntraSua8(j: JustificacionSua8, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    switch (d.clase) {
      case "altura":
        filas.push({
          id: "altura",
          titulo: "El edificio",
          detalle: `${m(d.largo_m, 1)} × ${m(d.ancho_m, 1)}${d.plantaSupuesta ? " (supuesta)" : ""} · H ${m(d.h_m)}`,
          trato: `Ae ${fmt(d.ae_m2, "m²", 0)}`,
          estado: trato(estados.altura),
          elementoId: "altura",
        });
        break;
      case "ne":
        filas.push({
          id: "ne",
          titulo: "Frecuencia de impactos",
          detalle: `Ng ${fmt(d.ng, undefined, 2)}${d.ngSupuesto ? " (supuesto)" : ""} · C1 ${fmt(d.c1, undefined, 2)}`,
          trato: `Ne ${frecuencia(d.ne)}`,
          estado: trato(estados.ne),
          elementoId: "ne",
        });
        break;
      case "na":
        filas.push({
          id: "na",
          titulo: "Riesgo admisible",
          detalle: `C2 ${fmt(d.c2, undefined, 2)} · C3 ${fmt(d.c3, undefined, 0)} · C4 ${fmt(d.c4, undefined, 1)} · C5 ${fmt(d.c5, undefined, 0)}`,
          trato: `Na ${frecuencia(d.na)}`,
          estado: trato(estados.na),
          elementoId: "na",
        });
        break;
      case "proteccion":
        filas.push({
          id: "proteccion",
          titulo: "Protección contra el rayo",
          detalle: d.e === null ? "Ne ≤ Na" : `E = ${textoE(d.e)}`,
          trato: conclusionCorta(d),
          estado: trato(estados.proteccion),
          elementoId: "proteccion",
        });
        break;
      case "sistema":
        break;
    }
  }
  return filas;
}

export function textoEtiquetaSua8(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "altura":
      return `H ${m(d.h_m)}`;
    case "ne":
      return `Ne ${frecuencia(d.ne)}`;
    case "na":
      return `Na ${frecuencia(d.na)}`;
    case "proteccion":
      return d.obligatoria && d.instalacion === "no" ? "falta la instalación" : conclusionCorta(d);
    case "sistema":
      return `malla ≤ ${fmt(B.reticula_m[d.nivel], "m", 0)}`;
  }
}

export function resultadoListaSua8(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "altura":
      return `${m(d.largo_m, 1)} × ${m(d.ancho_m, 1)} · H ${m(d.h_m)} · Ae ${fmt(d.ae_m2, "m²", 0)}`;
    case "ne":
      return `Ng ${fmt(d.ng, undefined, 2)} · C1 ${fmt(d.c1, undefined, 2)} · Ne ${frecuencia(d.ne)} impactos/año`;
    case "na":
      return `C2·C3·C4·C5 = ${fmt(d.c2 * d.c3 * d.c4 * d.c5, undefined, 2)} · Na ${frecuencia(d.na)} impactos/año`;
    case "proteccion":
      if (d.siempre) return `siempre nivel 1 (${d.siempre === "altura" ? "altura > 43 m" : "sustancias peligrosas"})`;
      if (d.e === null) return "Ne ≤ Na: no es necesaria";
      return `E = ${textoE(d.e)} · ${conclusionCorta(d)}${d.obligatoria && d.instalacion === "no" ? " · no se proyecta" : ""}`;
    case "sistema":
      return textoSistema(d.nivel);
  }
}

export function textoSistema(nivel: NivelProteccion): string {
  return `malla ≤ ${fmt(B.reticula_m[nivel], "m", 0)} · esfera ${fmt(B.radioEsfera_m[nivel], "m", 0)} · bajantes ≤ ${fmt(B.bajantesMalla_m[nivel], "m", 0)}`;
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

export function franjaSua8(el: ElementoSi<unknown>, _j: JustificacionSua8, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "altura":
      return {
        clase: "Superficie de captura · ap. 1 pto 3",
        titulo: el.nombre,
        valor: fmt(d.ae_m2, undefined, 0),
        unidad: "m²",
        estado,
        manda: `La superficie delimitada por una línea a 3H (${m(3 * d.h_m, 1)}) de todo el perímetro de la planta. Con una planta rectangular, Ae = L·B + 6H(L+B) + 9πH².`,
        nota: d.plantaSupuesta
          ? "La planta se supone cuadrada, con la superficie de la cubierta. Indica sus dimensiones si la forma importa."
          : "Para una planta en L o en U la fórmula da algo más que la superficie real: queda del lado de la seguridad.",
        filas: [
          { k: "Planta", v: `${m(d.largo_m, 1)} × ${m(d.ancho_m, 1)}${d.plantaSupuesta ? " (supuesta)" : ""}` },
          { k: "Forjado de cubierta", v: m(d.cubierta_m) },
          { k: "Remate (peto, cumbrera)", v: m(d.remate_m) },
          { k: "Altura H", v: m(d.h_m) },
        ],
        cita: "DB-SUA · SUA 8 ap. 1 pto 3",
      };
    case "ne":
      return {
        clase: "Frecuencia esperada · fórmula 1.1",
        titulo: el.nombre,
        valor: frecuencia(d.ne),
        unidad: "impactos/año",
        estado,
        manda: "Ne = Ng · Ae · C1 · 10⁻⁶, con Ng leído en el mapa de la figura 1.1 para el municipio y C1 por el entorno (tabla 1.1).",
        nota: d.ngSupuesto ? `Sin Ng en Datos de la obra se toma ${fmt(d.ng, undefined, 2)}, el mayor del mapa.` : undefined,
        filas: [
          { k: "Ng (figura 1.1)", v: `${fmt(d.ng, undefined, 2)} impactos/año·km²${d.ngSupuesto ? " (supuesto)" : ""}` },
          { k: "Ae", v: fmt(d.ae_m2, "m²", 0) },
          { k: "C1 (tabla 1.1)", v: fmt(d.c1, undefined, 2) },
        ],
        cita: "DB-SUA · SUA 8 ap. 1 pto 3 · figura 1.1 · tabla 1.1",
      };
    case "na":
      return {
        clase: "Riesgo admisible · fórmula 1.2",
        titulo: el.nombre,
        valor: frecuencia(d.na),
        unidad: "impactos/año",
        estado,
        manda: "Na = 5,5 / (C2 · C3 · C4 · C5) · 10⁻³, con los coeficientes de la construcción, el contenido, el uso y la continuidad de la actividad.",
        nota: d.c4Supuesto ? "El local sin uso se supone Comercial (C4 = 3) mientras no se diga otra cosa." : undefined,
        filas: [
          { k: "C2 construcción (tabla 1.2)", v: fmt(d.c2, undefined, 2) },
          { k: "C3 contenido (tabla 1.3)", v: fmt(d.c3, undefined, 0) },
          { k: "C4 uso (tabla 1.4)", v: `${fmt(d.c4, undefined, 1)}${d.c4Supuesto ? " (supuesto)" : ""}` },
          { k: "C5 continuidad (tabla 1.5)", v: fmt(d.c5, undefined, 0) },
        ],
        cita: "DB-SUA · SUA 8 ap. 1 pto 4 · tablas 1.2 a 1.5",
      };
    case "proteccion":
      return {
        clase: "Tipo de instalación · ap. 2",
        titulo: el.nombre,
        valor: d.obligatoria ? `Nivel ${d.nivel}` : d.e === null ? "No necesaria" : "Nivel 4",
        unidad: d.obligatoria ? "obligatoria" : d.e === null ? undefined : "no obligatoria",
        estado,
        manda: d.siempre
          ? d.siempre === "altura"
            ? `Los edificios de más de ${fmt(SUA8_SIEMPRE.datos.alturaMayorQue_m, "m", 0)} disponen siempre de protección con eficiencia E ≥ 0,98 (nivel 1).`
            : "Donde se manipulan sustancias tóxicas, radioactivas, altamente inflamables o explosivas, siempre nivel 1."
          : d.e === null
            ? "La frecuencia esperada no es mayor que el riesgo admisible: no hace falta instalación (ap. 1 pto 1)."
            : d.obligatoria
              ? `La eficiencia exigida E = 1 − Na/Ne = ${textoE(d.e)} cae en el nivel ${d.nivel} de la tabla 2.1.`
              : `E = 1 − Na/Ne = ${textoE(d.e)} es menor que 0,80: nivel 4, y en ese tramo la instalación no es obligatoria (nota 1 de la tabla 2.1).`,
        nota: d.obligatoria && d.instalacion === "no" ? "Es obligatoria y no se proyecta: hay que proyectarla." : !d.obligatoria && d.instalacion === "si" ? "Se proyecta aunque no sea obligatoria." : undefined,
        filas: [
          { k: "Ne", v: frecuencia(d.ne) },
          { k: "Na", v: frecuencia(d.na) },
          { k: "E = 1 − Na/Ne", v: d.e === null ? "—" : textoE(d.e) },
          { k: "Tabla 2.1", v: "≥ 0,98 → 1 · ≥ 0,95 → 2 · ≥ 0,80 → 3 · < 0,80 → 4" },
        ],
        cita: d.siempre ? "DB-SUA · SUA 8 ap. 1 pto 2 · tabla 2.1" : "DB-SUA · SUA 8 ap. 1 y 2 · tabla 2.1",
      };
    case "sistema":
      return {
        clase: "Anejo SUA B",
        titulo: el.nombre,
        valor: `Nivel ${d.nivel}`,
        estado,
        manda: "Sistema externo (captadores y derivadores), sistema interno (equipotencialidad o protectores de sobretensiones) y red de tierra capaz de dispersar la corriente de las descargas.",
        filas: [
          { k: "Malla, dimensión mayor (B.3)", v: `≤ ${fmt(B.reticula_m[d.nivel], "m", 0)}` },
          { k: "Radio de la esfera rodante (B.2)", v: fmt(B.radioEsfera_m[d.nivel], "m", 0) },
          { k: "Separación media de bajantes (B.5)", v: `≤ ${fmt(B.bajantesMalla_m[d.nivel], "m", 0)}` },
          { k: "Derivadores", v: d.h_m > B.dosBajantesSiAlturaMayorQue_m ? "dos como mínimo (más de 28 m)" : "uno por punta como mínimo" },
          { k: "Uniones equipotenciales", v: `al nivel del suelo y cada ${fmt(B.equipotencialesCada_m, "m", 0)}` },
        ],
        cita: "DB-SUA · Anejo B · tablas B.2 a B.5",
      };
  }
}

// -----------------------------------------------------------------------------
// Avisos y lo que no cumple
// -----------------------------------------------------------------------------

export function textoAvisoSua8(a: Aviso): TextoSi {
  switch (a.id) {
    case "ng-supuesto":
      return {
        titulo: "Falta la densidad de impactos Ng.",
        detalle: "Se ha tomado el mayor valor del mapa de la figura 1.1 y cambia el resultado. Léelo en el mapa para el municipio de la obra e indícalo en Datos de la obra.",
      };
    case "planta-supuesta":
      return {
        titulo: "La forma de la planta cambia el resultado.",
        detalle: "Se ha supuesto una planta cuadrada con la superficie de la cubierta; con una más alargada el resultado es otro. Indica el largo y el ancho de la planta.",
      };
    case "local-comercial":
      return {
        titulo: "El local sin uso se supone Comercial.",
        detalle: "Con uso Comercial el coeficiente C4 es 3 y cambia el resultado. Si el local será otra cosa, indícalo en la decisión de SI 1 sobre su uso previsto.",
      };
    case "voluntaria":
      return {
        titulo: "La instalación se proyecta sin ser obligatoria.",
        detalle: "El cálculo no la exige; la memoria lo dice y la describe con el nivel de protección que le corresponde.",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoSua8(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "proteccion") {
    return {
      titulo: "Falta la instalación de protección contra el rayo.",
      detalle: `Es obligatoria, de nivel ${d.nivel}, y no se proyecta.`,
    };
  }
  return null;
}

export function describirDibujoSua8(j: JustificacionSua8): string {
  const d = proteccion(j);
  return `Sección del edificio, de ${m(j.h_m)} de altura, con la superficie de captura a 3H a cada lado${d.instalacion === "si" ? ` y la instalación de protección contra el rayo de nivel ${d.nivel ?? 4}` : ""}.`;
}

/** Las piezas de la fila de La obra. */
export function piezasSua8(j: JustificacionSua8): { texto: string; acento: boolean }[] {
  const d = proteccion(j);
  return [
    { texto: `Ne ${frecuencia(j.resultado.ne)} · Na ${frecuencia(j.resultado.na)}`, acento: false },
    { texto: conclusionCorta(d), acento: d.obligatoria },
  ];
}

