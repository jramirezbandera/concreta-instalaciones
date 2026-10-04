// =============================================================================
// DB-HS3 — Textos de la justificación (feature-15, HS3): la frase de la
// cabecera, «lo que manda» y las cuentas de la franja, lo que dicen las
// etiquetas del dibujo y la lista, y el texto de los avisos. Funciones PURAS.
// =============================================================================

import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import type { Aviso } from "../../lib/cte/resultado";
import { etiquetaNivel } from "../../lib/edificio/derivar";
import { fmt } from "../../lib/units/format";
import type { ElementoHs3, JustificacionHs3 } from "./justificacion";
import type { LocalHs3, TipoVentilacion } from "./red";
import { AREA_EFECTIVA_ABERTURAS, CAUDALES_NO_HABITABLES, COCCION_MIN, GARAJE_HS3 } from "./tablas";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function n0(v: number): string {
  return fmt(v, undefined, 0);
}

/** Caudal: entero si lo es, con un decimal si no («8», «10,2»). */
export function q(v: number): string {
  return Math.abs(v - Math.round(v)) < 0.05 ? n0(v) : fmt(v, undefined, 1);
}

function ls(v: number): string {
  return `${q(v)} l/s`;
}

function cm2(v: number): string {
  return `${n0(v)} cm²`;
}

/** El local con su artículo, en minúscula: «el salón-comedor», «la cocina», «el baño 2». */
export function elLocal(l: Pick<LocalHs3, "tipo" | "nombre">): string {
  return `${l.tipo === "cocina" ? "la" : "el"} ${l.nombre.toLowerCase()}`;
}

/** «el dormitorio principal», «cada dormitorio que no es el principal», «el salón-comedor». */
function quien(l: LocalHs3, t: TipoVentilacion): string {
  if (l.tipo === "dorm_principal") return "el dormitorio principal";
  if (l.tipo === "dormitorio") return "cada dormitorio que no es el principal";
  if (l.tipo === "salon_comedor") return `el salón-comedor de una vivienda de ${t.dormitorios} ${t.dormitorios === 1 ? "dormitorio" : "dormitorios"}`;
  return "cada local húmedo";
}

/** «Cocina y baños», «cocina, baño y aseo». */
function losHumedos(t: TipoVentilacion): string {
  const banos = t.locales.filter((l) => l.tipo === "bano").length;
  const aseos = t.locales.filter((l) => l.tipo === "aseo").length;
  const partes = ["cocina"];
  if (banos > 0) partes.push(banos === 1 ? "baño" : "baños");
  if (aseos > 0) partes.push(aseos === 1 ? "aseo" : "aseos");
  const s = listaY(partes);
  return s[0].toUpperCase() + s.slice(1);
}

function factor(t: TipoVentilacion): string {
  const e = t.equilibrado;
  if (e.aumenta === "admision") return fmt(e.saleTabla_l_s / e.entraTabla_l_s, undefined, 2);
  if (e.aumenta === "extraccion") return fmt(e.entraTabla_l_s / e.saleTabla_l_s, undefined, 2);
  return "1";
}

// -----------------------------------------------------------------------------
// Lo corto
// -----------------------------------------------------------------------------

export function valorCorto(el: ElementoHs3): string {
  const det = el.detalle;
  if ("texto" in el.valor) return el.valor.texto;
  switch (det.clase) {
    case "equilibrio":
      return `${q(el.valor.valor)} = ${q(el.valor.valor)}`;
    case "paso":
      return `≥ ${n0(AREA_EFECTIVA_ABERTURAS.datos.pasoMin_cm2)}`;
    case "conductos":
      return det.manda.diametro_mm !== null ? `Ø${n0(det.manda.diametro_mm)}` : n0(det.manda.seccion_cm2);
    case "aberturas_garaje":
      return n0(el.valor.valor);
    case "garaje":
      return n0(el.valor.valor);
    default:
      return q(el.valor.valor);
  }
}

export function textoEtiqueta(el: ElementoHs3): string {
  const det = el.detalle;
  switch (det.clase) {
    case "local":
      return ls(det.local.adoptado_l_s);
    case "campana":
      return `+${n0(det.caudal_l_s)} campana`;
    case "paso":
      return `pasos ≥ ${n0(AREA_EFECTIVA_ABERTURAS.datos.pasoMin_cm2)} cm²`;
    case "equilibrio":
      return `${valorCorto(el)} l/s`;
    case "conductos":
      return det.manda.diametro_mm !== null ? `Ø${n0(det.manda.diametro_mm)}` : cm2(det.manda.seccion_cm2);
    case "garaje":
      return `${n0(det.garaje.caudal_l_s)} l/s`;
    case "aberturas_garaje":
      return det.sistema === "mecanica" ? `${det.pares} + ${det.pares} aberturas` : `${cm2(det.mixtasPorFachada_cm2)} × 2`;
    case "co":
      return det.exigida ? "CO" : "sin CO";
    case "trasteros":
      return ls(det.trasteros.caudal_l_s);
  }
}

export function resultadoLista(el: ElementoHs3): string {
  const det = el.detalle;
  switch (det.clase) {
    case "local": {
      const l = det.local;
      return l.adoptado_l_s - l.minimo_l_s > 0.05 ? `${q(l.minimo_l_s)} → ${ls(l.adoptado_l_s)}` : ls(l.adoptado_l_s);
    }
    case "campana":
      return ls(det.caudal_l_s);
    case "paso":
      return `${cm2(AREA_EFECTIVA_ABERTURAS.datos.pasoMin_cm2)} a ${cm2(el.valor && "valor" in el.valor ? el.valor.valor : 0)}`;
    case "equilibrio":
      return `${valorCorto(el)} l/s`;
    case "conductos":
      return det.manda.diametro_mm !== null
        ? `Ø${n0(det.manda.diametro_mm)} · ${cm2(det.manda.seccion_cm2)}`
        : `${cm2(det.manda.seccion_cm2)} · ${det.manda.claseTiro}`;
    case "garaje":
      return `${n0(det.garaje.caudal_l_s)} l/s`;
    case "aberturas_garaje":
      return det.sistema === "mecanica"
        ? `${det.pares} + ${det.pares}${det.redes > 1 ? " · 2 redes" : ""}`
        : `${cm2(det.mixtasPorFachada_cm2)} por fachada`;
    case "co":
      return det.exigida ? `sí · ${det.ppm} ppm` : "no exigida";
    case "trasteros":
      return det.garaje ? `${ls(det.trasteros.caudal_l_s)} · con el garaje` : ls(det.trasteros.caudal_l_s);
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

export function franjaDe(el: ElementoHs3, j: JustificacionHs3, estado: EstadoPresentacion): DetalleElemento {
  const base = { titulo: el.nombre, valor: valorCorto(el), estado, cita: el.cita.join(" · ") };
  const det = el.detalle;
  const t41 = AREA_EFECTIVA_ABERTURAS.datos;
  const proporcional = j.red.decisiones.equilibrado === "proporcional";

  switch (det.clase) {
    case "local": {
      const { local: l, tipo: t, resultado: r } = det;
      const e = t.equilibrado;
      const subeTotal = l.humedo && l.conTotal_l_s - l.minimo_l_s > 1e-9;
      const subeEq = l.adoptado_l_s - l.conTotal_l_s > 1e-9;
      let manda: string;
      if (!l.humedo && subeEq) {
        manda = proporcional
          ? `El equilibrio. ${losHumedos(t)} sacan ${ls(e.saleTabla_l_s)} y los secos solo piden ${q(e.entraTabla_l_s)}: todos suben en proporción, × ${factor(t)}.`
          : `El equilibrio. ${losHumedos(t)} sacan ${ls(e.saleTabla_l_s)}; para que entre lo mismo, el salón pasa de ${q(l.minimo_l_s)} a ${q(l.adoptado_l_s)}.`;
      } else if (l.humedo && subeEq) {
        manda = proporcional
          ? `El equilibrio. Los secos piden ${ls(e.entraTabla_l_s)} y los húmedos sacan ${q(e.saleTabla_l_s)}: todos suben en proporción, × ${factor(t)}.`
          : `El equilibrio. Los secos piden ${ls(e.entraTabla_l_s)}; para que salga lo mismo, la cocina pasa de ${q(l.conTotal_l_s)} a ${q(l.adoptado_l_s)}.`;
      } else if (subeTotal) {
        manda = `El total de los húmedos: tienen que sacar ${ls(e.saleTabla_l_s)} entre todos, y a este le tocan ${q(l.adoptado_l_s)}.`;
      } else {
        manda = `La tabla 2.1: ${ls(l.minimo_l_s)} para ${quien(l, t)}.`;
      }
      const filas = [{ k: l.humedo ? "Mínimo por local · tabla 2.1" : "Mínimo · tabla 2.1", v: ls(l.minimo_l_s) }];
      if (l.adoptado_l_s - l.minimo_l_s > 0.05) filas.push({ k: l.humedo && !subeEq ? "Por el total de húmedos" : "Se añade para igualar", v: `+${ls(l.adoptado_l_s - l.minimo_l_s)}` });
      const admisionPor = j.red.decisiones.admision === "aireadores" ? "Aireador" : "Abertura en fachada";
      filas.push({
        k: l.humedo ? `Rejilla · 4 × ${q(Math.max(l.minimo_l_s, l.adoptado_l_s))}` : `${admisionPor} · 4 × ${q(Math.max(l.minimo_l_s, l.adoptado_l_s))}`,
        v: cm2(r.areaAbertura_cm2),
      });
      filas.push({ k: "Paso por su puerta", v: cm2(r.areaPaso_cm2) });
      return {
        ...base,
        clase: l.humedo ? "Sale aire · local húmedo" : "Entra aire · local seco",
        titulo: j.red.unifamiliar ? l.nombre : `${l.nombre} · vivienda ${t.nombre}`,
        unidad: "l/s",
        manda,
        nota: l.tipo === "cocina" ? "La campana va aparte, con su conducto." : undefined,
        filas,
      };
    }

    case "campana":
      return {
        ...base,
        clase: "Extracción adicional",
        titulo: j.red.unifamiliar ? "Campana de la cocina" : `Campana de la cocina · vivienda ${det.tipo.nombre}`,
        unidad: "l/s",
        manda: `Mientras se cocina, ${n0(COCCION_MIN.datos.caudalMin_l_s)} l/s por un conducto propio que no se mezcla con el de la ventilación general.`,
        filas: [
          { k: "Conducto", v: "propio hasta la cubierta" },
          { k: "Filtro de grasas", v: "sí" },
          { k: "Antirretorno", v: "sí" },
        ],
      };

    case "paso": {
      const mayor = det.pasos.reduce((a, b) => (b.area_cm2 > a.area_cm2 ? b : a));
      const qMayor = Math.max(mayor.local.minimo_l_s, mayor.local.adoptado_l_s);
      const filas = [...det.pasos]
        .sort((a, b) => b.area_cm2 - a.area_cm2)
        .slice(0, 4)
        .map((p) => ({ k: p.local.nombre, v: cm2(p.area_cm2) }));
      return {
        ...base,
        clase: "Aberturas de paso",
        titulo: j.red.unifamiliar ? "Puertas interiores" : `Puertas interiores · vivienda ${det.tipo.nombre}`,
        unidad: "cm²",
        manda:
          mayor.area_cm2 > t41.pasoMin_cm2
            ? `Lo mayor entre ${n0(t41.pasoMin_cm2)} cm² y 8 veces el caudal que pasa por cada puerta. Manda ${elLocal(mayor.local)}: 8 × ${q(qMayor)} = ${cm2(mayor.area_cm2)}.`
            : `Lo mayor entre ${n0(t41.pasoMin_cm2)} cm² y 8 veces el caudal que pasa: en todas las puertas bastan ${cm2(t41.pasoMin_cm2)}.`,
        nota: "Una holgura bajo la puerta o una rejilla de paso.",
        filas,
      };
    }

    case "equilibrio": {
      const t = det.tipo;
      const e = t.equilibrado;
      const como =
        e.aumenta === "nada"
          ? "ya coinciden."
          : e.aumenta === "admision"
            ? proporcional
              ? "la diferencia se reparte entre los secos en proporción."
              : "la diferencia se suma al salón."
            : proporcional
              ? "la diferencia se reparte entre los húmedos en proporción."
              : "la diferencia se suma a la cocina.";
      return {
        ...base,
        clase: "Equilibrio",
        titulo: j.red.unifamiliar ? "Lo que entra y lo que sale" : `Lo que entra y lo que sale · vivienda ${t.nombre}`,
        unidad: "l/s",
        manda:
          e.aumenta === "extraccion"
            ? `Los secos piden ${ls(e.entraTabla_l_s)} y ${losHumedos(t).toLowerCase()} solo ${q(e.saleTabla_l_s)}: ${como}`
            : `${losHumedos(t)} sacan ${ls(e.saleTabla_l_s)}. Los locales secos piden ${q(e.entraTabla_l_s)} por tabla: ${como}`,
        filas: [
          { k: "Entra por tabla", v: ls(e.entraTabla_l_s) },
          { k: "Sale por tabla", v: ls(e.saleTabla_l_s) },
          { k: e.aumenta === "extraccion" ? "Se añade a la extracción" : "Se añade a la admisión", v: `+${ls(e.diferencia_l_s)}` },
        ],
        nota: "Cómo se reparte la diferencia es criterio de proyecto (decisión 3).",
      };
    }

    case "conductos": {
      const m = det.manda;
      const t = det.tipo;
      const mecanica = det.sistema === "mecanica";
      const local = elLocal({ tipo: m.localId === "cocina" ? "cocina" : "bano", nombre: m.nombre });
      const qLocal = m.qvt_l_s / m.plantas;
      const manda = mecanica
        ? `El caudal que lleva: ${m.plantas === 1 ? `${ls(qLocal)} de ${local}` : `${m.plantas} plantas × ${ls(qLocal)} de ${local}`}. Con extracción mecánica, S ≥ 2,5 × ${q(m.qvt_l_s)} = ${cm2(m.seccion_cm2)}.`
        : `El caudal y el tiro: ${ls(m.qvt_l_s)} en ${m.plantas} ${m.plantas === 1 ? "planta" : "plantas"}, clase de tiro ${m.claseTiro} en la zona térmica ${det.zona} (tablas 4.2 a 4.4).`;
      return {
        ...base,
        clase: "Conductos de extracción",
        titulo: j.red.unifamiliar ? `Conducto de ${local}` : `Conducto de ${local} · vertical ${t.nombre}`,
        unidad: mecanica ? cm2(m.seccion_cm2) : `cm² · ${m.claseTiro}`,
        manda,
        nota: mecanica
          ? "El Ø es el circular que cubre la sección (criterio). En patinillo se aplica la misma fórmula, del lado seguro."
          : "Un colectivo no sirve a más de 6 plantas, y las dos últimas llevan conducto individual.",
        filas: det.conductos.map((c) => ({
          k: c.nombre,
          v: `${c.plantas > 1 ? `${c.plantas} × ${q(c.qvt_l_s / c.plantas)} = ` : ""}${ls(c.qvt_l_s)} · ${c.diametro_mm !== null ? `Ø${n0(c.diametro_mm)}` : cm2(c.seccion_cm2)}`,
        })),
      };
    }

    case "garaje": {
      const g = det.garaje;
      const filas = [
        { k: "Plazas", v: String(g.plazas) },
        { k: "Por plaza · tabla 2.2", v: ls(CAUDALES_NO_HABITABLES.datos.aparcamiento_l_s_plaza) },
        { k: "Sistema", v: det.sistema === "mecanica" ? "mecánico · a cubierta" : "natural · aberturas mixtas" },
      ];
      const conTr = det.trasteros.reduce((s, t) => s + t.caudal_l_s, 0);
      if (conTr > 0) filas.push({ k: "Con los trasteros", v: `${n0(g.caudal_l_s + conTr)} l/s` });
      return {
        ...base,
        clase: `Garaje · ${etiquetaNivel(g.nivel)}`,
        unidad: "l/s",
        manda: `Las plazas: ${ls(CAUDALES_NO_HABITABLES.datos.aparcamiento_l_s_plaza)} por cada una, y hay ${g.plazas}.`,
        nota:
          det.sistema === "mecanica"
            ? "El aire entra por las aberturas de admisión (o la rampa) y los extractores lo sacan a la cubierta."
            : "Aberturas mixtas en dos fachadas opuestas; ningún punto a más de 25 m de una.",
        filas,
      };
    }

    case "aberturas_garaje": {
      const g = det.garaje;
      const G = GARAJE_HS3.datos;
      if (det.sistema === "mecanica") {
        return {
          ...base,
          clase: `Garaje · ${etiquetaNivel(g.nivel)}`,
          titulo: "Aberturas de admisión y extracción",
          unidad: "pares",
          manda: `La superficie: una abertura de admisión y otra de extracción por cada ${n0(G.mecSuperficiePorParAberturas_m2)} m², y hay ${n0(g.superficie_m2)} m².`,
          filas: [
            { k: "Separación entre extracciones", v: `< ${n0(G.mecSeparacionExtracciones_m)} m` },
            { k: "Extracciones cerca del techo", v: "2/3 a ≤ 0,5 m" },
            { k: "Redes de extracción", v: det.redes > 1 ? `2 por planta (≥ ${G.mecPlazasDosRedes} plazas)` : "1" },
          ],
          nota: "Redondear al par entero superior es criterio de proyecto.",
        };
      }
      return {
        ...base,
        clase: `Garaje · ${etiquetaNivel(g.nivel)}`,
        titulo: "Aberturas mixtas",
        unidad: "cm² por fachada",
        manda: `8·qv en cada una de dos fachadas opuestas: 8 × ${n0(g.caudal_l_s)} = ${cm2(det.mixtasPorFachada_cm2)} en cada una.`,
        filas: [
          { k: "Distancia a una abertura", v: `≤ ${n0(G.natDistMaxAbertura_m)} m` },
          ...(det.pequeno ? [{ k: "Garaje pequeño", v: "aberturas en un cerramiento, a ≥ 1,5 m" }] : []),
        ],
      };
    }

    case "co": {
      const G = GARAJE_HS3.datos;
      return {
        ...base,
        clase: `Garaje · ${etiquetaNivel(det.garaje.nivel)}`,
        unidad: det.exigida ? `${det.ppm} ppm` : undefined,
        manda: det.exigida
          ? `Pasa de ${G.coUmbralPlazas} plazas o de ${n0(G.coUmbralSuperficie_m2)} m²: detectores que arrancan los extractores a ${G.coPpmSinEmpleados} ppm (${G.coPpmConEmpleados} si hay empleados).`
          : `No hace falta: no pasa de ${G.coUmbralPlazas} plazas ni de ${n0(G.coUmbralSuperficie_m2)} m².`,
        filas: [
          { k: "Plazas", v: String(det.garaje.plazas) },
          { k: "Superficie útil", v: `${n0(det.garaje.superficie_m2)} m²` },
        ],
      };
    }

    case "trasteros": {
      const t = det.trasteros;
      return {
        ...base,
        clase: `Trasteros · ${etiquetaNivel(t.nivel)}`,
        unidad: "l/s",
        manda: `La superficie: ${q(CAUDALES_NO_HABITABLES.datos.trasteros_l_s_m2)} l/s por m², y hay ${n0(t.superficie_m2)} m².`,
        nota: det.garaje
          ? "Están en el recinto del garaje, que es mecánico: ventilan con él y su caudal se suma (criterio)."
          : "Tienen su propio sistema de ventilación (ap. 3.1.3).",
        filas: [
          { k: "Trasteros", v: String(t.numero) },
          { k: "Superficie útil", v: `${n0(t.superficie_m2)} m²` },
        ],
      };
    }
  }
}

// -----------------------------------------------------------------------------
// La frase, las métricas y los avisos
// -----------------------------------------------------------------------------

export function fraseHs3(j: JustificacionHs3): string {
  const partes: string[] = [];
  const fallan = j.elementos.filter((e) => e.veredicto === "fail");
  if (fallan.length > 0) partes.push(`No cumple: ${listaY([...new Set(fallan.map((e) => e.nombre.toLowerCase()))])}.`);
  const d = j.red.decisiones;
  if (j.red.tipos.length > 0) {
    const entra = d.admision === "aireadores" ? "aireadores" : "aberturas en la fachada";
    partes.push(
      d.sistema === "mecanica"
        ? `Ventilación mecánica: el aire entra por ${entra} en dormitorios y salón, cruza por las puertas y sale por cocina y baños hacia la cubierta.`
        : `Ventilación híbrida: el aire entra por ${entra} en dormitorios y salón, cruza por las puertas y sale por cocina y baños; el tiro natural lo saca a la cubierta y los extractores ayudan cuando no basta.`,
    );
  }
  for (const g of j.red.garajes) {
    const co = j.elementos.find((e) => e.id === `${g.id}-co`);
    const conCo = co?.detalle.clase === "co" && co.detalle.exigida;
    partes.push(
      d.garaje === "mecanica"
        ? `El garaje extrae ${n0(g.caudal_l_s)} l/s${conCo ? " con detección de monóxido" : ""}.`
        : `El garaje ventila de forma natural (${n0(g.caudal_l_s)} l/s)${conCo ? ", con detección de monóxido" : ""}.`,
    );
  }
  const r = j.red.rite;
  if (r.locales > 0 && r.oficinas > 0) partes.push("Las oficinas, y el local cuando tenga actividad, se ventilan según el RITE.");
  else if (r.oficinas > 0) partes.push("Las oficinas se ventilan según el RITE.");
  else if (r.locales > 0) partes.push("El local se ventilará según el RITE cuando tenga actividad.");
  if (partes.length === 0) return "No hay viviendas ni garajes que ventilar por el HS 3.";
  return partes.join(" ");
}

export function metricasHs3(j: JustificacionHs3): string {
  const partes = j.red.tipos.map((t) => `${t.nombre} ${q(t.equilibrado.equilibrado_l_s)} l/s`);
  for (const g of j.red.garajes) partes.push(`garaje ${n0(g.caudal_l_s)} l/s`);
  return partes.join(" · ");
}

export interface TextoAviso {
  titulo: string;
  detalle: string;
}

export function textoAviso(a: Aviso): TextoAviso {
  if (a.id.endsWith("hibrida-ultimas-plantas")) {
    return {
      titulo: "Las dos últimas plantas, con conducto individual.",
      detalle: `En ventilación híbrida, los locales húmedos de las dos últimas plantas no pueden ir al colectivo (ap. 3.2.3): llevan su propio conducto hasta la cubierta.`,
    };
  }
  if (a.id.startsWith("garaje-") && a.id.endsWith("-natural")) {
    return {
      titulo: "El garaje está bajo rasante.",
      detalle:
        "La ventilación natural necesita aberturas mixtas en dos fachadas opuestas y que ningún punto quede a más de 25 m de una: comprueba que el sótano las tiene (patios o rampa).",
    };
  }
  return { titulo: "Revisa la ventilación.", detalle: String(a.datos.texto ?? "") };
}

export function describirDibujoHs3(j: JustificacionHs3, parte: string): string {
  const p = j.partes.find((x) => x.id === parte);
  return [
    p ? `${p.nombre}: el camino del aire, de los locales secos a los húmedos.` : "",
    ...j.elementos.filter((e) => e.parte === parte).map((e) => `${e.nombre}: ${resultadoLista(e)}.`),
  ]
    .filter(Boolean)
    .join(" ");
}
