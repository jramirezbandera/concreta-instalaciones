// =============================================================================
// DB-SI, SI 5 — La memoria redactada (feature-19): el texto que el proyectista
// copia a su memoria, con cada condición y su cita. Se redacta solo a partir de
// la justificación: se revisa, no se edita. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { DetalleSi5, JustificacionSi5 } from "./justificacion";
import { SI5_APROXIMACION, SI5_ENTORNO, SI5_FACHADA } from "./tablas";

const E = SI5_ENTORNO.datos;
const A = SI5_APROXIMACION.datos;
const F = SI5_FACHADA.datos;

function m(v: number, dec = 2): string {
  return fmt(v, "m", dec);
}

function detalle<C extends DetalleSi5["clase"]>(j: JustificacionSi5, clase: C): Extract<DetalleSi5, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleSi5, { clase: C }>) : null;
}

function parrafoAltura(j: JustificacionSi5): Trozo[] {
  const a = detalle(j, "altura")!;
  if (a.unifamiliar) {
    return [
      "El edificio es una vivienda unifamiliar. El interior de una vivienda no es origen de evacuación (Anejo SI A), por lo que el edificio no tiene una altura de evacuación descendente ",
      { v: "mayor que 9 m" },
      " y no se exigen espacio de maniobra ni accesibilidad por fachada (SI 5, ap. 1.2 y 2).",
    ];
  }
  if (!a.exige) {
    return [
      "La altura de evacuación descendente del edificio es de ",
      { v: m(a.h_m) },
      `, no mayor que ${fmt(E.umbralHDescendente_m, "m", 0)}: no se exige espacio de maniobra para los bomberos (SI 5, ap. 1.2) y, con él, tampoco las condiciones del vial de aproximación (ap. 1.1) ni la accesibilidad por fachada (ap. 2).`,
    ];
  }
  return [
    "La altura de evacuación descendente del edificio es de ",
    { v: m(a.h_m) },
    `, mayor que ${fmt(E.umbralHDescendente_m, "m", 0)}: el edificio dispone de un espacio de maniobra para los bomberos a lo largo de la fachada en la que están los accesos (SI 5, ap. 1.2).`,
  ];
}

function parrafoManiobra(j: JustificacionSi5): Trozo[] {
  const d = detalle(j, "maniobra");
  if (!d || !d.exige) return [];
  const condiciones: Trozo[] = [
    `anchura mínima libre de ${fmt(E.anchuraLibreMin_m, "m", 0)}, altura libre la del edificio, separación máxima del vehículo de bomberos a la fachada de `,
    { v: fmt(d.separacionMax_m, "m", 0) },
    `, distancia hasta los accesos del edificio no mayor que ${fmt(E.distanciaMaxAccesos_m, "m", 0)}, pendiente no mayor que el ${fmt(E.pendienteMax_pct, "%", 0)} y resistencia al punzonamiento del suelo de ${fmt(E.punzonamiento.carga_kN, "kN", 0)} sobre ${fmt(E.punzonamiento.diametro_cm, "cm", 0)} de diámetro, también en las tapas de registro de más de 0,15 × 0,15 m (UNE-EN 124:2015). Está libre de mobiliario urbano, arbolado, jardines, mojones u otros obstáculos`,
  ];
  const p: Trozo[] =
    d.maniobra === "propio"
      ? ["El espacio de maniobra forma parte del proyecto y cumple: ", ...condiciones]
      : d.maniobra === "calle"
        ? ["El espacio de maniobra es la vía pública a la que da el acceso del edificio, que cumple: ", ...condiciones]
        : [
            "El espacio de maniobra es la vía pública a la que da el acceso del edificio, que no reúne todas las condiciones del ap. 1.2 (",
            ...condiciones,
            "). Al no formar parte del proyecto de edificación, sus condiciones no le son exigibles (DB-SI, Introducción II); se hace constar aquí",
          ];
  p.push(".");
  if (d.columnaSeca) {
    p.push(` El equipo de bombeo puede acceder a menos de ${fmt(E.columnaSecaBombeoMax_m, "m", 0)} de cada punto de conexión de la columna seca, que es visible desde el camión (ap. 1.2 pto 4).`);
  }
  return p;
}

function parrafoVial(j: JustificacionSi5): Trozo[] {
  const d = detalle(j, "vial");
  if (!d) return [];
  const cifras = `anchura mínima libre de ${m(A.anchuraLibreMin_m, 1)}, gálibo de ${m(A.galiboMin_m, 1)} y capacidad portante de ${fmt(A.capacidadPortante_kN_m2, "kN/m²", 0)}; en los tramos curvos, corona circular de radios ${m(A.curva.radioMin1_m)} y ${m(A.curva.radioMin2_m)} con ${m(A.curva.anchuraLibre_m)} libres`;
  if (d.maniobra === "propio") return [`El vial de aproximación al espacio de maniobra cumple las condiciones del ap. 1.1: ${cifras}.`];
  if (d.maniobra === "calle") return [`Los bomberos llegan por la vía pública, que reúne las condiciones del ap. 1.1: ${cifras}.`];
  return [`Las condiciones del vial de aproximación (ap. 1.1: ${cifras}) no son exigibles a la vía pública existente.`];
}

function parrafoFachada(j: JustificacionSi5): Trozo[] {
  const d = detalle(j, "fachada");
  if (!d) return [];
  const p: Trozo[] = [
    "La fachada a la que da el espacio de maniobra tiene en cada planta huecos que permiten el acceso del personal de extinción (SI 5, ap. 2): alféizar a no más de ",
    { v: m(F.alfeizarMax_m) },
    " sobre el nivel de la planta, dimensiones de al menos ",
    { v: `${m(F.huecoMin_m.horizontal)} × ${m(F.huecoMin_m.vertical)}` },
    ` y una distancia entre ejes de huecos consecutivos no mayor que ${fmt(F.separacionEjesMax_m, "m", 0)}, medida sobre la fachada.`,
  ];
  if (d.rejas === "sin") {
    p.push(" No hay en la fachada elementos que impidan o dificulten el acceso a través de esos huecos.");
  } else if (d.rejas === "hasta9" || d.plantasAltas.length === 0) {
    p.push(` Solo hay elementos de seguridad en los huecos de las plantas con altura de evacuación no mayor que ${fmt(F.elementosSeguridadHastaH_m, "m", 0)}.`);
  } else {
    p.push(` Las plantas ${listaY(d.plantasAltas)} tienen elementos de seguridad en sus huecos, lo que no se admite por encima de ${fmt(F.elementosSeguridadHastaH_m, "m", 0)}: deben retirarse.`);
  }
  return p;
}

function parrafoForestal(j: JustificacionSi5): Trozo[] {
  if (!detalle(j, "forestal")) return [];
  return [
    `El edificio linda con un área forestal (ap. 1.2 pto 6): se dispone una franja de ${fmt(E.forestal.franja_m, "m", 0)} de anchura libre de vegetación que pueda propagar un incendio, con un camino perimetral de ${fmt(E.forestal.caminoPerimetral_m, "m", 0)}, y dos vías de acceso alternativas o, si solo hay una, un fondo de saco de ${m(E.forestal.fondoSacoRadio_m)} de radio.`,
  ];
}

export function memoriaSi5(j: JustificacionSi5): MemoriaDoc {
  const parrafos = [parrafoAltura(j), parrafoManiobra(j), parrafoVial(j), parrafoFachada(j), parrafoForestal(j)].filter((p) => p.length > 0);
  const apartados = j.exige ? ["1.1", "1.2", "2"] : ["1.2"];
  return {
    titulo: "Intervención de los bomberos",
    norma: "DB-SI 5",
    parrafos,
    fuente: [`DB-SI · SI 5 (consolidado 4-mar-2025)`, `ap. ${listaY(apartados)}`, "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
