// =============================================================================
// DB-SUA, SUA 8 — La memoria redactada (feature-20): el texto que el proyectista
// copia a su memoria, con las cuentas y su cita. Se redacta solo a partir de la
// justificación: se revisa, no se edita. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { DetalleSua8, JustificacionSua8 } from "./justificacion";
import { SUA8_ANEJO_B, SUA8_SIEMPRE } from "./tablas";
import { frecuencia, NOMBRE_ENTORNO, textoE } from "./textos";

const B = SUA8_ANEJO_B.datos;

function m(v: number, dec = 2): string {
  return fmt(v, "m", dec);
}

function detalle<C extends DetalleSua8["clase"]>(j: JustificacionSua8, clase: C): Extract<DetalleSua8, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleSua8, { clase: C }>) : null;
}

function parrafoNe(j: JustificacionSua8): Trozo[] {
  const a = detalle(j, "altura")!;
  const n = detalle(j, "ne")!;
  return [
    "La frecuencia esperada de impactos es Ne = Ng · Ae · C1 · 10⁻⁶ = ",
    { v: frecuencia(n.ne) },
    ` impactos/año (SUA 8, ap. 1 pto 3), con una densidad de impactos sobre el terreno Ng = ${fmt(n.ng, undefined, 2)} impactos/año·km²${n.ngSupuesto ? ", el mayor valor del mapa de la figura 1.1, a falta del leído para el municipio" : ", leída en el mapa de la figura 1.1 para el municipio de la obra"}; una superficie de captura equivalente Ae = `,
    { v: fmt(a.ae_m2, "m²", 0) },
    `, la delimitada por una línea trazada a una distancia 3H del perímetro de una planta de ${m(a.largo_m, 1)} × ${m(a.ancho_m, 1)}${a.plantaSupuesta ? " (supuesta cuadrada, con la superficie de la cubierta)" : ""} y una altura H = ${m(a.h_m)}; y un coeficiente C1 = ${fmt(n.c1, undefined, 2)}, edificio ${NOMBRE_ENTORNO[j.decisiones.entorno]} (tabla 1.1).`,
  ];
}

function parrafoNa(j: JustificacionSua8): Trozo[] {
  const n = detalle(j, "na")!;
  return [
    "El riesgo admisible es Na = 5,5 / (C2 · C3 · C4 · C5) · 10⁻³ = ",
    { v: frecuencia(n.na) },
    ` impactos/año (SUA 8, ap. 1 pto 4), con C2 = ${fmt(n.c2, undefined, 2)} por el tipo de construcción (tabla 1.2), C3 = ${fmt(n.c3, undefined, 0)} por el contenido (tabla 1.3), C4 = ${fmt(n.c4, undefined, 1)} por el uso (tabla 1.4)${n.c4Supuesto ? ", con el local sin uso asimilado a uso Comercial" : ""} y C5 = ${fmt(n.c5, undefined, 0)} por la continuidad de la actividad (tabla 1.5).`,
  ];
}

function parrafoConclusion(j: JustificacionSua8): Trozo[] {
  const d = detalle(j, "proteccion")!;
  if (d.siempre === "peligrosas") {
    return ["En el edificio se manipulan sustancias tóxicas, radioactivas, altamente inflamables o explosivas: dispone de un sistema de protección contra el rayo de eficiencia E ≥ 0,98, ", { v: "nivel de protección 1" }, " (SUA 8, ap. 1 pto 2 y tabla 2.1)."];
  }
  if (d.siempre === "altura") {
    return [
      `La altura del edificio, ${m(j.h_m)}, es superior a ${fmt(SUA8_SIEMPRE.datos.alturaMayorQue_m, "m", 0)}: dispone de un sistema de protección contra el rayo de eficiencia E ≥ 0,98, `,
      { v: "nivel de protección 1" },
      " (SUA 8, ap. 1 pto 2 y tabla 2.1).",
    ];
  }
  if (!d.necesaria) {
    return ["Al no ser la frecuencia esperada de impactos mayor que el riesgo admisible (Ne ≤ Na), ", { v: "no es necesaria la instalación" }, " de un sistema de protección contra el rayo (SUA 8, ap. 1 pto 1)."];
  }
  if (!d.obligatoria) {
    const p: Trozo[] = [
      "Siendo Ne > Na, la eficiencia requerida es E = 1 − Na/Ne = ",
      { v: textoE(d.e!) },
      ", menor que 0,80, que corresponde al nivel de protección 4 (SUA 8, ap. 2, tabla 2.1). Dentro de estos límites de eficiencia requerida ",
      { v: "la instalación de protección contra el rayo no es obligatoria" },
      " (nota 1 de la tabla 2.1).",
    ];
    if (d.instalacion === "si") p.push(" No obstante, se proyecta una instalación de nivel de protección 4 conforme al Anejo B.");
    return p;
  }
  const p: Trozo[] = [
    "Siendo Ne > Na, la eficiencia requerida es E = 1 − Na/Ne = ",
    { v: textoE(d.e!) },
    `, que corresponde al `,
    { v: `nivel de protección ${d.nivel}` },
    " (SUA 8, ap. 2, tabla 2.1): es necesaria la instalación de un sistema de protección contra el rayo.",
  ];
  if (d.instalacion === "no") p.push(" La instalación no está proyectada y debe proyectarse.");
  return p;
}

function parrafoSistema(j: JustificacionSua8): Trozo[] {
  const s = detalle(j, "sistema");
  if (!s) return [];
  return [
    `El sistema de protección cumple el Anejo SUA B para el nivel ${s.nivel}: sistema externo con captadores (puntas, malla conductora o pararrayos con dispositivo de cebado) y derivadores, con malla de dimensión mayor no superior a `,
    { v: fmt(B.reticula_m[s.nivel], "m", 0) },
    ` (tabla B.3), radio de la esfera rodante de ${fmt(B.radioEsfera_m[s.nivel], "m", 0)} (tabla B.2) y separación media de los conductores de bajada no mayor que ${fmt(B.bajantesMalla_m[s.nivel], "m", 0)} (tabla B.5)${s.h_m > B.dosBajantesSiAlturaMayorQue_m ? ", con dos derivadores como mínimo" : ""}; sistema interno que une a la estructura las instalaciones metálicas y los circuitos eléctricos y de telecomunicación mediante conductores de equipotencialidad o protectores de sobretensiones; y red de tierra adecuada para dispersar en el terreno la corriente de las descargas atmosféricas.`,
  ];
}

export function memoriaSua8(j: JustificacionSua8): MemoriaDoc {
  const parrafos = [parrafoNe(j), parrafoNa(j), parrafoConclusion(j), parrafoSistema(j)].filter((p) => p.length > 0);
  return {
    titulo: "Seguridad frente al riesgo causado por la acción del rayo",
    norma: "DB-SUA 8",
    parrafos,
    fuente: ["DB-SUA · SUA 8 (consolidado 14-jun-2022)", j.decisiones.instalacion === "si" ? "ap. 1, ap. 2 y Anejo B" : "ap. 1 y ap. 2", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
