// =============================================================================
// DB-HS4 — Textos de la justificación (feature-15, HS4): la frase de la
// cabecera, «lo que manda» y las cuentas de la franja, lo que dicen las
// etiquetas del dibujo y la lista, y el texto de los avisos y de lo que no
// cumple. Funciones PURAS: los datos los pone `justificacion.ts`; aquí solo se
// redacta, en español y con coma decimal.
// =============================================================================

import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import { cuantos, listaY, mayuscula } from "../../lib/cte/redaccion";
import type { Aviso } from "../../lib/cte/resultado";
import { etiquetaNivel } from "../../lib/edificio/derivar";
import { fmt } from "../../lib/units/format";
import type { ElementoHs4, JustificacionHs4, PuntoHs4 } from "./justificacion";
import { NOMBRE_TUBERIA, PRESION_GRUPO_POR_DEFECTO_kPa, type DecisionesHs4, type UnidadHs4 } from "./red";
import { GRUPO_PRESION, type TipoAparatoHS4 } from "./tablas";

// -----------------------------------------------------------------------------
// Helpers de redacción
// -----------------------------------------------------------------------------

function n0(v: number): string {
  return fmt(v, undefined, 0);
}

function n1(v: number): string {
  return fmt(v, undefined, 1);
}

function n2(v: number): string {
  return fmt(v, undefined, 2);
}

function kpa(v: number): string {
  return `${n0(v)} kPa`;
}

/** «Ø20». */
function d(mm: number | null): string {
  return mm === null ? "Ø—" : `Ø${n0(mm)}`;
}

/** «planta baja», «planta 2», «sótano 1». */
export function nombrePlanta(nivel: number): string {
  if (nivel === 0) return "planta baja";
  return nivel > 0 ? `planta ${nivel}` : `sótano ${-nivel}`;
}

/** El aparato con su artículo: «la ducha», «el lavabo». */
const APARATO: Partial<Record<TipoAparatoHS4, [string, "el" | "la"]>> = {
  lavamanos: ["lavamanos", "el"],
  lavabo: ["lavabo", "el"],
  ducha: ["ducha", "la"],
  banera_ge_140: ["bañera", "la"],
  banera_lt_140: ["bañera", "la"],
  bide: ["bidé", "el"],
  inodoro_cisterna: ["inodoro", "el"],
  inodoro_fluxor: ["inodoro con fluxor", "el"],
  urinario_temporizado: ["urinario", "el"],
  urinario_cisterna: ["urinario", "el"],
  fregadero_domestico: ["fregadero", "el"],
  fregadero_no_domestico: ["fregadero", "el"],
  lavavajillas_domestico: ["lavavajillas", "el"],
  lavavajillas_industrial: ["lavavajillas", "el"],
  lavadero: ["lavadero", "el"],
  lavadora_domestica: ["lavadora", "la"],
  lavadora_industrial: ["lavadora", "la"],
  grifo_aislado: ["grifo", "el"],
  grifo_garaje: ["grifo del garaje", "el"],
  vertedero: ["vertedero", "el"],
};

function aparato(t: TipoAparatoHS4): string {
  return APARATO[t]?.[0] ?? "grifo";
}

function conArticulo(t: TipoAparatoHS4): string {
  const a = APARATO[t] ?? ["grifo", "el"];
  return `${a[1]} ${a[0]}`;
}

/** «la ducha de A3», «la bañera del baño 1», «el lavabo de los aseos de P2». */
export function describirPunto(p: PuntoHs4, unifamiliar: boolean): string {
  const ap = conArticulo(p.aparato.tipo);
  if (!p.unidad) return `${ap} (${p.nombre})`;
  if (p.unidad.clase === "oficinas") return `${ap} de los aseos de ${etiquetaNivel(p.unidad.nivel)}`;
  if (unifamiliar) return `${ap} del ${(p.cuarto ?? "cuarto").toLowerCase()}`;
  return `${ap} de ${p.unidad.nombre}`;
}

/** «Ducha · vivienda A3», para el título de la franja. */
function tituloPunto(p: PuntoHs4, unifamiliar: boolean): string {
  const ap = mayuscula(aparato(p.aparato.tipo));
  if (!p.unidad) return `${ap} · ${p.nombre}`;
  if (p.unidad.clase === "oficinas") return `${ap} · aseos de ${etiquetaNivel(p.unidad.nivel)}`;
  if (unifamiliar) return `${ap} · ${(p.cuarto ?? "").toLowerCase()}${p.nivel !== null ? `, ${nombrePlanta(p.nivel)}` : ""}`;
  return `${ap} · vivienda ${p.unidad.nombre}`;
}

/** Los cuartos de una unidad: «2 baños y cocina», «aseos». */
function cuartosDe(u: UnidadHs4): string {
  const cs = u.cuartos.flatMap((g) => g.cuartos);
  const banos = cs.filter((c) => c.clase === "bano").length;
  const aseos = cs.filter((c) => c.clase === "aseo").length;
  const partes: string[] = [];
  if (banos > 0) partes.push(banos === 1 ? "baño" : `${banos} baños`);
  if (aseos > 0) partes.push(aseos === 1 ? "aseo" : `${aseos} aseos`);
  if (cs.some((c) => c.clase === "cocina")) partes.push("cocina");
  if (cs.some((c) => c.clase === "aseos")) partes.push("aseos");
  return listaY(partes);
}

/**
 * Lo que el DB pide al grupo y aquí no se calcula: que las plantas a las que
 * llega la red no dependan de él (ap. 3.2.1.5.1) y, si es convencional, que su
 * presión de parada no deje ningún punto por encima de 500 kPa (ap. 4.5.2.3).
 */
function notaGrupo(j: JustificacionHs4, presionGrupo_kPa: number): string {
  const directas: string[] = [];
  for (const e of j.elementos) {
    if (e.detalle.clase !== "planta" || e.detalle.nivel === null) continue;
    const a = e.detalle.punto.aparato;
    if (a.presionResidual_kPa - (presionGrupo_kPa - j.presionRed_kPa) >= a.presionMinExigida_kPa) {
      directas.push(etiquetaNivel(e.detalle.nivel));
    }
  }
  const g = GRUPO_PRESION.datos;
  const partes = [
    `Se supone de presión constante a su salida; uno convencional para entre ${g.margenParadaSobreArranqueMin_kPa} y ${g.margenParadaSobreArranqueMax_kPa} kPa más arriba.`,
  ];
  if (directas.length > 0) {
    partes.push(`A ${listaY(directas.reverse())} les llega la red sola: no deben depender del grupo.`);
  }
  return partes.join(" ");
}

/** Presión que propone el aviso para el grupo: la necesaria con algo de margen, en decenas. */
export function presionGrupoPropuesta(necesaria_kPa: number | null): number {
  if (necesaria_kPa === null) return PRESION_GRUPO_POR_DEFECTO_kPa;
  return Math.max(PRESION_GRUPO_POR_DEFECTO_kPa, Math.ceil((necesaria_kPa + 20) / 10) * 10);
}

// -----------------------------------------------------------------------------
// Lo corto: valor, etiqueta del dibujo y resultado en la lista
// -----------------------------------------------------------------------------

/** El valor tal y como se enseña en grande. */
export function valorCorto(el: ElementoHs4): string {
  if ("texto" in el.valor) return el.valor.texto;
  const v = el.valor;
  if (v.unidad === "mm") return d(v.valor);
  if (v.unidad === "dm³/s") return n2(v.valor);
  return n0(v.valor);
}

/** Lo que dice la etiqueta del elemento en el dibujo. */
export function textoEtiqueta(el: ElementoHs4): string {
  const det = el.detalle;
  switch (det.clase) {
    case "red":
    case "planta":
    case "maxima":
      return kpa(el.valor && "valor" in el.valor ? el.valor.valor : 0);
    case "montante":
      return det.general ? `${valorCorto(el)} general` : `${det.iguales} × ${valorCorto(el)}`;
    case "acometida":
      return `${valorCorto(el)} PE`;
    case "local":
      return `${valorCorto(el)} previsto`;
    case "grupo":
      return det.puesto ? `grupo ${kpa(det.presionGrupo_kPa)}` : "grupo";
    case "caudal":
      return `${valorCorto(el)} dm³/s`;
  }
}

/** La columna «Resultado» de la lista de comprobaciones. */
export function resultadoLista(el: ElementoHs4): string {
  const det = el.detalle;
  switch (det.clase) {
    case "red":
      return `${kpa(det.presion_kPa)} · ${det.sinDato ? "sin dato" : "de la compañía"}`;
    case "planta": {
      const a = det.punto.aparato;
      return `${n0(a.presionResidual_kPa)} ${a.presionResidual_kPa >= a.presionMinExigida_kPa ? "≥" : "<"} ${kpa(a.presionMinExigida_kPa)}`;
    }
    case "maxima":
      return `${n0(det.punto.aparato.presionResidual_kPa)} ${det.punto.aparato.presionResidual_kPa <= det.maxima_kPa ? "≤" : ">"} ${kpa(det.maxima_kPa)}`;
    case "grupo":
      return det.puesto ? `sí · ${kpa(det.presionGrupo_kPa)}` : det.necesario ? "hace falta" : "no hace falta";
    case "montante":
      return `${valorCorto(el)} · ${n1(det.tramo.velocidad_m_s ?? 0)} m/s`;
    case "caudal":
      return `${valorCorto(el)} dm³/s`;
    case "acometida":
      return `${valorCorto(el)} · ${n2(det.acometida.caudalCalculo_dm3_s)} dm³/s`;
    case "local":
      return "contador previsto";
  }
}

// -----------------------------------------------------------------------------
// La franja de detalle
// -----------------------------------------------------------------------------

export function franjaDe(el: ElementoHs4, j: JustificacionHs4, estado: EstadoPresentacion): DetalleElemento {
  const base = { titulo: el.nombre, valor: valorCorto(el), estado, cita: el.cita.join(" · ") };
  const det = el.detalle;
  const uni = j.red.unifamiliar;

  switch (det.clase) {
    case "red": {
      const manda = det.sinDato
        ? `No consta en los datos de la obra: se calcula con ${kpa(det.presion_kPa)}. Pide el dato a la compañía suministradora.`
        : estado === "rv"
          ? "Es un dato supuesto. Pide el certificado a la compañía antes de cerrar el proyecto."
          : "Confirmada por la compañía suministradora.";
      const filas = [];
      if (det.necesaria_kPa !== null) {
        filas.push({ k: "Necesaria sin grupo", v: kpa(det.necesaria_kPa) });
        filas.push({ k: "Margen", v: kpa(det.presion_kPa - det.necesaria_kPa) });
      }
      return {
        ...base,
        clase: "Dato de partida",
        unidad: "kPa",
        manda,
        nota: det.grupo ? "Con el grupo de presión, la red arranca con la presión de su salida." : undefined,
        filas,
      };
    }

    case "planta": {
      const a = det.punto.aparato;
      const ok = a.presionResidual_kPa >= a.presionMinExigida_kPa;
      const alt = a.perdidas.altura_kPa;
      const manda = ok
        ? `La altura. Subir ${n1(a.altura_m)} m se come ${kpa(alt)} de los ${n0(det.partida_kPa)} de partida.`
        : `La altura. Subir ${n1(a.altura_m)} m se come ${kpa(alt)} y no queda bastante.`;
      let nota: string | undefined;
      if (!ok) nota = `Faltan ${kpa(a.presionMinExigida_kPa - a.presionResidual_kPa)}.`;
      else if (det.critico && !det.grupo && det.necesaria_kPa !== null) {
        nota = `Funciona desde ${kpa(det.necesaria_kPa)} de red. Por debajo hace falta grupo de presión.`;
      }
      return {
        ...base,
        clase: det.critico ? "Grifo más desfavorable" : "Grifo de planta",
        titulo: tituloPunto(det.punto, uni),
        unidad: "kPa",
        manda,
        nota,
        filas: [
          { k: det.grupo ? "Salida del grupo" : "Presión de la red", v: kpa(det.partida_kPa) },
          { k: `Altura · ${n1(a.altura_m)} m`, v: `−${kpa(alt)}` },
          { k: "Rozamiento en tuberías", v: `−${kpa(a.perdidas.rozamiento_kPa)}` },
          { k: "Llaves, contador y codos", v: `−${kpa(a.perdidas.localizadas_kPa)}` },
          { k: `Llega · mínimo ${n0(a.presionMinExigida_kPa)}`, v: kpa(a.presionResidual_kPa) },
        ],
      };
    }

    case "maxima": {
      const p = det.punto.aparato.presionResidual_kPa;
      const ok = p <= det.maxima_kPa;
      return {
        ...base,
        clase: "Punto con más presión",
        titulo: tituloPunto(det.punto, uni),
        unidad: "kPa",
        manda: ok
          ? `Está por debajo del máximo de ${kpa(det.maxima_kPa)}: no hacen falta válvulas reductoras de presión.`
          : `Pasa del máximo de ${kpa(det.maxima_kPa)}: hacen falta válvulas reductoras de presión en las plantas bajas.`,
        filas: [
          { k: "Máximo admitido", v: kpa(det.maxima_kPa) },
          { k: "Margen", v: kpa(det.maxima_kPa - p) },
        ],
      };
    }

    case "grupo": {
      const planta =
        det.critico?.nivel !== null && det.critico?.nivel !== undefined ? `la ${nombrePlanta(det.critico.nivel)}` : "el punto más desfavorable";
      const min = det.critico?.aparato.presionMinExigida_kPa ?? 100;
      let manda: string;
      if (det.puesto) {
        manda = det.necesario
          ? `Lo pide ${planta}: con la red sola no llegaría a ${kpa(min)}.`
          : `No haría falta: la red sola llega a ${planta} con ${kpa(det.conRed_kPa ?? 0)}.`;
      } else {
        manda = det.necesario
          ? `Hace falta: la red sola no llega a ${kpa(min)} en ${planta}.`
          : `No hace falta: la red sola llega a ${planta} con ${kpa(det.conRed_kPa ?? 0)}.`;
      }
      const filas = [{ k: "Red de la calle", v: kpa(det.red_kPa) }];
      if (det.necesaria_kPa !== null) filas.push({ k: "Necesaria sin grupo", v: kpa(det.necesaria_kPa) });
      if (det.puesto) filas.push({ k: "Salida del grupo", v: kpa(det.presionGrupo_kPa) });
      return {
        ...base,
        clase: "Grupo de presión",
        unidad: det.puesto ? kpa(det.presionGrupo_kPa) : undefined,
        manda,
        nota: det.puesto ? notaGrupo(j, det.presionGrupo_kPa) : undefined,
        filas,
      };
    }

    case "montante": {
      const t = det.tramo;
      const m = el.manda.tipo === "velocidad" ? el.manda : null;
      const rango = m ? `entre ${n1(m.min_m_s)} y ${n1(m.max_m_s)} m/s` : "dentro de la horquilla";
      const tub = NOMBRE_TUBERIA[j.red.decisiones.tuberia];
      return {
        ...base,
        clase: det.general ? "Montante general" : "Montante",
        titulo: det.general
          ? "Montante general"
          : det.unidad?.clase === "oficinas"
            ? "Montantes de las oficinas"
            : `Montantes de las viviendas ${det.unidad?.nombreTipo ?? ""}`.trim(),
        unidad: `${tub}${det.iguales > 1 ? ` · × ${det.iguales}` : ""}`,
        manda: `La velocidad: se elige el diámetro para ir ${rango}. Con ${valorCorto(el)} va a ${n1(t.velocidad_m_s ?? 0)} m/s.`,
        nota: det.general ? "Lleva el agua de todas las unidades: los contadores están en cada planta." : undefined,
        filas: [
          { k: "Caudal de cálculo", v: `${n2(t.caudalCalculo_dm3_s)} dm³/s` },
          { k: "Velocidad", v: `${n1(t.velocidad_m_s ?? 0)} m/s` },
          { k: "Aparatos que abastece", v: String(t.numAparatos) },
        ],
      };
    }

    case "caudal": {
      const t = det.tramo;
      const u = det.unidad;
      const kTxt = t.numAparatos >= 2 ? `K = 1/√(${t.numAparatos}−1) = ${n2(t.k)}` : "K = 1";
      return {
        ...base,
        clase: "Caudal",
        titulo:
          u.clase === "oficinas"
            ? "Caudal de una planta de oficinas"
            : j.red.unifamiliar
              ? "Caudal de la vivienda"
              : `Caudal de una vivienda ${u.nombreTipo}`,
        unidad: "dm³/s",
        manda: `La simultaneidad. Los ${t.numAparatos} aparatos suman ${n2(t.caudalAcumulado_dm3_s)} dm³/s, pero no se abren todos a la vez: ${kTxt}.`,
        nota: "K = 1/√(n−1) es el método tradicional, como criterio de proyecto: el DB pide «un criterio adecuado» y no fija fórmula.",
        filas: [
          { k: "Aparatos", v: `${cuartosDe(u)} · ${t.numAparatos}` },
          { k: "Caudal instalado", v: `${n2(t.caudalAcumulado_dm3_s)} dm³/s` },
          { k: "Coeficiente K", v: n2(t.k) },
        ],
      };
    }

    case "acometida": {
      const t = det.acometida;
      const c = det.contadores;
      const abastece = c
        ? listaY(
            [
              c.viviendas > 0 ? cuantos(c.viviendas, "vivienda", "viviendas", "f") : "",
              c.oficinas > 0 ? (c.oficinas === 1 ? "una planta de oficinas" : `${c.oficinas} plantas de oficinas`) : "",
              c.locales > 0 ? (c.locales === 1 ? "local previsto" : `${c.locales} locales previstos`) : "",
            ].filter(Boolean),
          )
        : `${t.numAparatos} aparatos`;
      const filas = [
        { k: "Abastece", v: abastece },
        { k: "Caudal de cálculo", v: `${n2(t.caudalCalculo_dm3_s)} dm³/s` },
        { k: "Velocidad", v: `${n1(t.velocidad_m_s ?? 0)} m/s` },
      ];
      if (det.alimentacion) filas.push({ k: "Tubo de alimentación", v: d(det.alimentacion.diametro_mm) });
      return {
        ...base,
        clase: "Acometida",
        titulo: "Acometida y tubo de alimentación",
        unidad: "polietileno",
        manda: `El caudal de todo el edificio: ${n2(t.caudalCalculo_dm3_s)} dm³/s con la simultaneidad de sus ${t.numAparatos} aparatos.`,
        filas,
      };
    }

    case "local": {
      const l = det.local;
      return {
        ...base,
        titulo: `${el.nombre} · ${nombrePlanta(l.nivel)}`,
        clase: "Previsión",
        unidad: "en espera",
        manda: "Su actividad. Hoy se deja contador en la batería, llave de corte y tubería en espera.",
        filas: [
          { k: "Contador", v: j.red.decisiones.contadores === "bateria" ? "en la batería" : "en su planta" },
          { k: "Llave de corte", v: "en el local" },
          { k: "Superficie útil", v: `${n0(l.superficie_m2)} m²` },
        ],
      };
    }
  }
}

// -----------------------------------------------------------------------------
// La frase de la cabecera y las métricas
// -----------------------------------------------------------------------------

function elCritico(j: JustificacionHs4): ElementoHs4 | undefined {
  return j.elementos.find((e) => e.detalle.clase === "planta" && e.detalle.critico);
}

export function fraseHs4(j: JustificacionHs4): string {
  if (!j.resultado) return "No hay puntos de consumo que abastecer.";
  const crit = elCritico(j);
  const det = crit?.detalle.clase === "planta" ? crit.detalle : null;
  const a = det?.punto.aparato;
  const desc = det ? describirPunto(det.punto, j.red.unifamiliar) : "";
  const red = j.red;
  const d0 = red.decisiones;

  if (a && a.presionResidual_kPa < a.presionMinExigida_kPa) {
    return d0.grupoPresion
      ? `Con el grupo de presión a ${kpa(d0.presionGrupo_kPa)}, ${desc} solo recibe ${kpa(a.presionResidual_kPa)}: hay que subir la presión del grupo.`
      : `Con ${kpa(j.presionRed_kPa)} de red, ${desc} solo recibe ${kpa(a.presionResidual_kPa)}: hace falta grupo de presión.`;
  }
  let disposicion: string;
  if (j.modo === "manual") disposicion = "Red de agua fría ajustada a mano.";
  else if (red.unifamiliar) disposicion = "Contador general y la instalación interior de la vivienda.";
  else if (d0.contadores === "por_planta") disposicion = "Montante general con los contadores en cada planta.";
  else {
    const por = red.unidades.every((u) => u.clase === "oficinas") ? "planta de oficinas" : "vivienda";
    disposicion = `Batería de ${red.contadores.total} contadores en planta baja y un montante por ${por}.`;
  }
  if (!a) return disposicion;
  if (d0.grupoPresion) {
    return `${disposicion} Grupo de presión a ${kpa(d0.presionGrupo_kPa)}: el grifo más desfavorable —${desc}— recibe ${kpa(a.presionResidual_kPa)}.`;
  }
  return `${disposicion} Con ${kpa(j.presionRed_kPa)} de red, el grifo más desfavorable —${desc}— recibe ${kpa(a.presionResidual_kPa)}: no hace falta grupo de presión.`;
}

/** Las cifras clave en una línea (caché del veredicto, panel de la obra). */
export function metricasHs4(j: JustificacionHs4): string {
  const partes: string[] = [];
  const crit = elCritico(j) ?? j.elementos.find((e) => e.id === "punto-critico");
  if (crit && "valor" in crit.valor) partes.push(`grifo crítico ${kpa(crit.valor.valor)}`);
  const ac = j.elementos.find((e) => e.id === "acometida");
  if (ac) partes.push(`acometida ${valorCorto(ac)}`);
  if (j.red.decisiones.grupoPresion) partes.push(`grupo ${kpa(j.red.decisiones.presionGrupo_kPa)}`);
  return partes.join(" · ");
}

// -----------------------------------------------------------------------------
// Avisos y lo que no cumple
// -----------------------------------------------------------------------------

export interface TextoAviso {
  titulo: string;
  detalle: string;
}

export function textoAviso(a: Aviso, j: JustificacionHs4): TextoAviso {
  switch (a.id) {
    case "presion-red-supuesta": {
      const crit = elCritico(j);
      const det = crit?.detalle.clase === "planta" ? crit.detalle : null;
      const nec = j.resultado?.presionNecesaria_kPa ?? null;
      return {
        titulo: "La presión de la red es un dato supuesto.",
        detalle:
          det && nec !== null && !j.red.decisiones.grupoPresion
            ? `Pide el certificado a la compañía: con menos de ${kpa(nec)}, la ${det.nivel !== null ? nombrePlanta(det.nivel) : "red"} se queda sin los ${kpa(det.punto.aparato.presionMinExigida_kPa)} de mínimo.`
            : "Pide el certificado a la compañía suministradora antes de cerrar el proyecto.",
      };
    }
    case "presion-red-sin-dato":
      return {
        titulo: "No consta la presión de la red.",
        detalle: `Se ha calculado con ${kpa(Number(a.datos.presion_kPa ?? 0))}. Ajústala en la decisión 1 cuando la dé la compañía.`,
      };
    case "acs-central":
      return {
        titulo: "El agua caliente es central.",
        detalle:
          "La red de impulsión y retorno de ACS no se dimensiona aquí: se justifica aparte, y la producción, con HE 4.",
      };
    case "unifamiliar-reparto":
      return {
        titulo: "Se ha supuesto dónde están los cuartos húmedos.",
        detalle: "Baños en la planta alta; cocina y aseo en la baja. Si no es así, ajusta la red a mano.",
      };
    case "oficinas-sin-nucleos":
      return {
        titulo: "Hay oficinas sin núcleos de aseos.",
        detalle: "No tienen puntos de consumo. Añade sus núcleos en El edificio.",
      };
  }
  return { titulo: "Revisa la red.", detalle: String(a.datos.texto ?? "") };
}

/** Lo que no cumple, con el cambio que lo arregla (si lo hay). */
export interface TextoIncumplimiento {
  titulo: string;
  detalle: string;
  accion?: { etiqueta: string; cambio: Partial<DecisionesHs4> };
}

export function textoIncumplimiento(el: ElementoHs4, j: JustificacionHs4): TextoIncumplimiento | null {
  const det = el.detalle;
  if (det.clase === "planta") {
    // Un solo aviso por la presión: el del punto más desfavorable, que nombra
    // todas las plantas a las que no llega.
    if (!det.critico) return null;
    const a = det.punto.aparato;
    const desc = mayuscula(describirPunto(det.punto, j.red.unifamiliar));
    const sinPresion = j.elementos.flatMap((e) =>
      e.detalle.clase === "planta" && e.veredicto === "fail" && e.detalle.nivel !== null ? [e.detalle.nivel] : [],
    );
    const donde =
      det.nivel === null
        ? "el punto más desfavorable"
        : sinPresion.length > 1
          ? `las plantas ${listaY(sinPresion.sort((x, y) => x - y).map((nv) => (nv === 0 ? "baja" : String(nv))))}`
          : `la ${nombrePlanta(det.nivel)}`;
    const propuesta = presionGrupoPropuesta(det.necesaria_kPa);
    const conGrupo = a.presionResidual_kPa + (propuesta - det.partida_kPa);
    if (det.grupo) {
      return {
        titulo: `No llega presión a ${donde}.`,
        detalle: `${desc} se queda en ${kpa(a.presionResidual_kPa)} y necesita ${n0(a.presionMinExigida_kPa)}. Con el grupo a ${kpa(propuesta)} llegaría con ${kpa(conGrupo)}.`,
        accion: { etiqueta: `Subir el grupo a ${kpa(propuesta)}`, cambio: { presionGrupo_kPa: propuesta } },
      };
    }
    return {
      titulo: `No llega presión a ${donde}.`,
      detalle: `${desc} se queda en ${kpa(a.presionResidual_kPa)} y necesita ${n0(a.presionMinExigida_kPa)}. Con un grupo de presión a ${kpa(propuesta)} a la salida de la batería llegaría con ${kpa(conGrupo)}.`,
      accion: { etiqueta: "Añadir grupo de presión", cambio: { grupoPresion: true, presionGrupo_kPa: propuesta } },
    };
  }
  if (det.clase === "maxima") {
    return {
      titulo: "Sobra presión en las plantas bajas.",
      detalle: `${mayuscula(describirPunto(det.punto, j.red.unifamiliar))} recibe ${kpa(det.punto.aparato.presionResidual_kPa)}, por encima de ${kpa(det.maxima_kPa)}: hacen falta válvulas reductoras de presión.`,
    };
  }
  return null;
}

/** Descripción accesible del dibujo: lo que se ve y su veredicto, en texto. */
export function describirSeccionHs4(j: JustificacionHs4): string {
  return [
    "Sección del edificio con la batería de contadores, los montantes y la presión que llega a cada planta.",
    fraseHs4(j),
    ...j.elementos.map((el) => `${el.nombre}: ${resultadoLista(el)}.`),
  ].join(" ");
}
