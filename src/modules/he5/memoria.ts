// =============================================================================
// DB-HE 5 — La memoria redactada (feature-22): lo que pide el ap. 4 (la potencia
// alcanzada y la mínima exigible) con las cifras y su cita, y el mantenimiento
// del ap. 5.4. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { ENGINE_VERSION } from "../../lib/version";
import type { DetalleHe5, JustificacionHe5 } from "./justificacion";
import { AMBITO_HE5, POTENCIA_HE5 } from "./tablas";
import { kW, m2 } from "./textos";

const F = POTENCIA_HE5.datos.fprEl;

function num(v: number): string {
  return v.toLocaleString("es-ES", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function detalle<C extends DetalleHe5["clase"]>(j: JustificacionHe5, clase: C): Extract<DetalleHe5, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleHe5, { clase: C }>) : null;
}

function parrafoAmbito(j: JustificacionHe5): Trozo[] {
  const s = j.superficies;
  return [
    "La superficie construida del edificio, incluida la de las zonas de aparcamiento en su interior y excluidas las zonas exteriores comunes, es de ",
    { v: m2(s.s_m2) },
    j.aplica
      ? `, superior a ${m2(AMBITO_HE5.datos.superficieMayorQue_m2)}, por lo que es de aplicación la Sección HE 5 (ap. 1).`
      : `, que no supera ${m2(AMBITO_HE5.datos.superficieMayorQue_m2)}, por lo que la Sección HE 5 no es de aplicación (ap. 1).`,
  ];
}

function parrafoPotencia(j: JustificacionHe5): Trozo[] {
  const p1 = detalle(j, "p1")!;
  const p2 = detalle(j, "p2")!;
  const p = detalle(j, "potencia")!;
  const reparto = [
    ...(p1.residencial_m2 > 0 ? [`${num(F.residencialPrivado)} kW/m² sobre ${m2(p1.residencial_m2)} de uso residencial privado`] : []),
    ...(p1.resto_m2 > 0 ? [`${num(F.resto)} kW/m² sobre ${m2(p1.resto_m2)} de otros usos`] : []),
  ].join(" y ");
  return [
    "La potencia a instalar mínima es la menor de P1 = Fpr;el·S, con ",
    reparto,
    ", que resulta ",
    { v: `P1 = ${kW(p1.p1_kW)}` },
    ", y P2 = 0,1·(0,5·Sc − Soc), con una superficie de cubierta no transitable o accesible únicamente para conservación de ",
    `${m2(p2.sc_m2)} y ${m2(p2.captadores.soc_m2)} ocupados por captadores solares térmicos, que resulta `,
    { v: `P2 = ${kW(p2.p2_kW)}` },
    ". Por tanto, ",
    { v: `Pmin = ${kW(p.pmin_kW)}` },
    " (ap. 3 pto 1).",
  ];
}

function parrafoInstalada(j: JustificacionHe5): Trozo[] {
  const p = detalle(j, "potencia")!;
  const cumple = p.instalada_kW + 1e-9 >= p.pmin_kW;
  return [
    "El edificio dispone de un sistema de generación de energía eléctrica procedente de fuentes renovables, para uso propio o suministro a la red, con una potencia instalada de ",
    { v: kW(p.instalada_kW) },
    cumple
      ? `, no inferior a la mínima exigible de ${kW(p.pmin_kW)} (ap. 3 y 4).`
      : `, inferior a la mínima exigible de ${kW(p.pmin_kW)}: NO CUMPLE, salvo que se justifique la imposibilidad de alcanzarla y la solución de máxima potencia posible (ap. 3 pto 2).`,
  ];
}

const MANTENIMIENTO =
  "El plan de mantenimiento del Libro del Edificio contempla las operaciones y su periodicidad para mantener los parámetros de diseño y las prestaciones de la instalación de generación eléctrica renovable, y en él se documentan todas las intervenciones a lo largo de su vida útil (ap. 5.4).";

export function memoriaHe5(j: JustificacionHe5): MemoriaDoc {
  const fuente = ["DB-HE · HE 5 (consolidado 14-jun-2022)", "ap. 1, 3 y 4", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · ");
  if (!j.aplica) {
    return { titulo: "Generación mínima de energía eléctrica renovable", norma: "DB-HE 5", parrafos: [parrafoAmbito(j)], fuente };
  }
  return {
    titulo: "Generación mínima de energía eléctrica renovable",
    norma: "DB-HE 5",
    parrafos: [parrafoAmbito(j), parrafoPotencia(j), parrafoInstalada(j), [MANTENIMIENTO]],
    fuente,
  };
}
