// =============================================================================
// DB-HE 5 — Textos (feature-22): la frase de la cabecera, «Qué entra», la franja
// de cada elemento, las etiquetas del dibujo y de la lista, los avisos y lo que
// no cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import type { TextoSi } from "../si/definicion";
import { FACTOR_CONSTRUIDA } from "../si/edificio";
import type { ElementoSi } from "../si/tipos";
import type { DetalleHe5, ElementoHe5, JustificacionHe5 } from "./justificacion";
import { AMBITO_HE5, POTENCIA_HE5 } from "./tablas";

const LIM = AMBITO_HE5.datos.superficieMayorQue_m2;
const F = POTENCIA_HE5.datos.fprEl;

/** «1368 m²»: sin separar los miles de cuatro cifras, como el resto de la app (es-ES). */
export function m2(v: number): string {
  return `${Math.round(v).toLocaleString("es-ES")} m²`;
}

/** «6,84 kW». */
export function kW(v: number): string {
  return `${v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kW`;
}

function num(v: number, dec = 3): string {
  return v.toLocaleString("es-ES", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

const LIMITE = m2(LIM);

function det(el: ElementoSi<unknown>): DetalleHe5 {
  return (el as ElementoHe5).detalle;
}

function buscar<C extends DetalleHe5["clase"]>(j: JustificacionHe5, clase: C): Extract<DetalleHe5, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleHe5, { clase: C }>) : null;
}

const NOMBRE_CUBIERTA = {
  plana_transitable: "plana transitable",
  plana_no_transitable: "plana no transitable",
  inclinada: "inclinada",
} as const;

// ── Cabecera ────────────────────────────────────────────────────────────────

export function fraseHe5(j: JustificacionHe5): string {
  const s = j.superficies;
  if (!j.aplica) return `${m2(s.s_m2)} construidos, no más de ${LIMITE}: HE 5 no se aplica.`;
  const p = buscar(j, "potencia")!;
  if (p.pmin_kW <= 0) return `${m2(s.s_m2)} construidos, pero sin cubierta no transitable: no se deriva potencia mínima (P2 = 0).`;
  const porQue = p.manda === "p1" ? "por superficie construida" : "por la cubierta disponible";
  const instala = p.instalada_kW + 1e-9 < p.pmin_kW ? `se instalan ${kW(p.instalada_kW)}, menos de lo exigido` : `se instalan ${kW(p.instalada_kW)}`;
  return `${m2(s.s_m2)} construidos: potencia mínima de ${kW(p.pmin_kW)} (${porQue}); ${instala}.`;
}

export function metricasHe5(j: JustificacionHe5): string {
  if (!j.aplica) return `S = ${m2(j.superficies.s_m2)} · no aplica`;
  const p = buscar(j, "potencia")!;
  return `S = ${m2(j.superficies.s_m2)} · Pmin ${kW(p.pmin_kW)} · P ${kW(p.instalada_kW)}`;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : "normal";
}

export function queEntraHe5(j: JustificacionHe5, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const s = j.superficies;
  const filas: FilaQueEntra[] = [];
  if (s.residencial_m2 > 0) {
    filas.push({
      id: "residencial",
      titulo: j.unifamiliar ? "Vivienda" : "Residencial",
      detalle: `${m2(s.residencial_m2)} construidos${s.garaje_m2 > 0 && !j.mixto ? ", con el garaje" : ""}`,
      trato: j.aplica ? `× ${num(F.residencialPrivado)} kW/m²` : "entra en S",
      estado: trato(estados.p1),
      elementoId: j.aplica ? "p1" : "superficie",
    });
  }
  if (s.resto_m2 > 0) {
    filas.push({
      id: "resto",
      titulo: s.residencial_m2 > 0 ? "Locales y oficinas" : "Otros usos",
      detalle: `${m2(s.resto_m2)} construidos`,
      trato: j.aplica ? `× ${num(F.resto)} kW/m²` : "entra en S",
      estado: trato(estados.p1),
      elementoId: j.aplica ? "p1" : "superficie",
    });
  }
  const p2 = buscar(j, "p2");
  if (p2) {
    filas.push({
      id: "cubierta",
      titulo: "Cubierta",
      detalle: `${NOMBRE_CUBIERTA[p2.tipoCubierta]}${p2.captadores.soc_m2 > 0 ? ` · captadores ${m2(p2.captadores.soc_m2)}` : ""}`,
      trato: `Sc = ${m2(p2.sc_m2)}`,
      estado: trato(estados.p2),
      elementoId: "p2",
    });
  }
  return filas;
}

export function piezasHe5(j: JustificacionHe5): { texto: string; acento: boolean }[] {
  if (!j.aplica) return [{ texto: `${m2(j.superficies.s_m2)} construidos`, acento: false }];
  const p = buscar(j, "potencia")!;
  return [
    { texto: `${m2(j.superficies.s_m2)} construidos`, acento: false },
    { texto: `${kW(p.instalada_kW)} instalados`, acento: p.instalada_kW + 1e-9 < p.pmin_kW },
  ];
}

// ── Etiquetas y lista ───────────────────────────────────────────────────────

export function textoEtiquetaHe5(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "superficie":
      return `S ${m2(d.s_m2)}`;
    case "p1":
      return `P1 ${kW(d.p1_kW)}`;
    case "p2":
      return `P2 ${kW(d.p2_kW)}`;
    case "potencia":
      return `P ${kW(d.instalada_kW)}`;
  }
}

export function resultadoListaHe5(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "superficie":
      return d.aplica ? `${m2(d.s_m2)}, más de ${LIMITE}: se aplica` : `${m2(d.s_m2)}, no más de ${LIMITE}: no se aplica`;
    case "p1":
      return [
        ...(d.residencial_m2 > 0 ? [`${num(F.residencialPrivado)} × ${m2(d.residencial_m2)}`] : []),
        ...(d.resto_m2 > 0 ? [`${num(F.resto)} × ${m2(d.resto_m2)}`] : []),
      ].join(" + ") + ` = ${kW(d.p1_kW)}`;
    case "p2":
      return `0,1 × (0,5 × ${m2(d.sc_m2)} − ${m2(d.captadores.soc_m2)}) = ${kW(d.p2_kW)}`;
    case "potencia":
      return `${kW(d.instalada_kW)} frente a Pmin = ${kW(d.pmin_kW)} (${d.manda === "p1" ? "P1" : "P2"})`;
  }
}

// ── La franja ───────────────────────────────────────────────────────────────

export function franjaHe5(el: ElementoSi<unknown>, j: JustificacionHe5, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "superficie":
      return {
        clase: "Ámbito · ap. 1",
        titulo: el.nombre,
        valor: m2(d.s_m2).replace(" m²", ""),
        unidad: `m² · ${d.aplica ? "se aplica" : "no se aplica"}`,
        estado,
        manda: `La sección se aplica a los edificios nuevos de más de ${LIMITE} construidos. La superficie construida incluye la del aparcamiento dentro del edificio y excluye las zonas exteriores comunes.`,
        nota: d.supuesta
          ? `Las zonas sin superficie construida indicada cuentan su útil × ${FACTOR_CONSTRUIDA.toLocaleString("es-ES", { minimumFractionDigits: 2 })} (criterio).`
          : undefined,
        filas: [
          ...(d.residencial_m2 > 0 ? [{ k: "Residencial privado", v: m2(d.residencial_m2) }] : []),
          ...(d.resto_m2 > 0 ? [{ k: "Otros usos", v: m2(d.resto_m2) }] : []),
          ...(d.garaje_m2 > 0 ? [{ k: "De ello, garaje", v: m2(d.garaje_m2) }] : []),
          { k: "Útil total", v: m2(d.util_m2) },
        ],
        cita: "DB-HE · HE 5 ap. 1",
      };
    case "p1":
      return {
        clase: "Potencia mínima · ap. 3",
        titulo: el.nombre,
        valor: kW(d.p1_kW).replace(" kW", ""),
        unidad: "kW",
        estado,
        manda: `P1 = Fpr;el·S, con un factor de producción eléctrica de ${num(F.residencialPrivado)} kW/m² en uso residencial privado y ${num(F.resto)} kW/m² en el resto de usos.`,
        nota: j.mixto ? "El edificio tiene viviendas y otros usos: cada parte cuenta con su factor (criterio)." : undefined,
        filas: [
          ...(d.residencial_m2 > 0 ? [{ k: "Residencial privado", v: `${num(F.residencialPrivado)} × ${m2(d.residencial_m2)}` }] : []),
          ...(d.resto_m2 > 0 ? [{ k: "Otros usos", v: `${num(F.resto)} × ${m2(d.resto_m2)}` }] : []),
          { k: "P1", v: kW(d.p1_kW) },
        ],
        cita: "DB-HE · HE 5 ap. 3 pto 1",
      };
    case "p2":
      return {
        clase: "Potencia mínima · ap. 3",
        titulo: el.nombre,
        valor: kW(d.p2_kW).replace(" kW", ""),
        unidad: "kW",
        estado,
        manda: "P2 = 0,1·(0,5·Sc − Soc), con Sc la cubierta no transitable o accesible solo para conservación y Soc la parte de ella que ocupan los captadores solares térmicos. Limita la exigencia a lo que cabe en la cubierta.",
        nota:
          d.tipoCubierta === "plana_transitable" && d.origenSc === "edificio"
            ? "La cubierta es transitable: no cuenta para Sc. Si una parte es solo para conservación, indícala."
            : d.captadores.supuesto
              ? "HE 4 produce el ACS con solar térmica, pero no dice cuántos m² ocupan los captadores: se cuentan 0."
              : undefined,
        filas: [
          { k: "Sc", v: `${m2(d.sc_m2)} (${d.origenSc === "edificio" ? `cubierta ${NOMBRE_CUBIERTA[d.tipoCubierta]} de El edificio` : "indicada"})` },
          { k: "Soc", v: d.captadores.solar ? `${m2(d.captadores.soc_m2)} (captadores de HE 4)` : "0 m² (sin solar térmica)" },
          { k: "P2", v: kW(d.p2_kW) },
        ],
        cita: "DB-HE · HE 5 ap. 3 pto 1",
      };
    case "potencia":
      return {
        clase: "Potencia instalada · ap. 3 y 4",
        titulo: el.nombre,
        valor: kW(d.instalada_kW).replace(" kW", ""),
        unidad: `kW · mínima ${kW(d.pmin_kW)}`,
        estado,
        manda: `La potencia a instalar mínima es la menor de P1 y P2: ${kW(d.pmin_kW)}, la ${d.manda === "p1" ? "de la superficie construida" : "de la cubierta"}. La generación puede ser de cualquier fuente renovable, para uso propio o para verterla a la red.`,
        nota:
          d.pmin_kW <= 0
            ? "Pmin = máx(0; mín(P1, P2)): con P2 nula no se deriva potencia mínima exigible (lectura literal, sin comentario del Ministerio). Conviene justificar en la memoria por qué la cubierta es transitable."
            : d.minima
              ? "Sin indicar la potencia que se instala, se toma la mínima."
              : undefined,
        filas: [
          { k: "P1", v: kW(d.p1_kW) },
          { k: "P2", v: kW(d.p2_kW) },
          { k: "Pmin", v: kW(d.pmin_kW) },
          { k: "Instalada", v: kW(d.instalada_kW) },
        ],
        uso: el.uso,
        cita: "DB-HE · HE 5 ap. 3 pto 1",
      };
  }
}

// ── Avisos e incumplimientos ────────────────────────────────────────────────

export function textoAvisoHe5(a: Aviso): TextoSi {
  switch (a.id) {
    case "construida":
      return {
        titulo: "Indica la superficie construida.",
        detalle: `Se supone la útil × ${FACTOR_CONSTRUIDA.toLocaleString("es-ES", { minimumFractionDigits: 2 })} en las zonas que no la tienen, y con ese supuesto cambia el resultado (si la sección se aplica o la potencia mínima). Dala zona a zona.`,
      };
    case "captadores":
      return {
        titulo: "Indica la superficie de los captadores solares.",
        detalle: "HE 4 produce el ACS con solar térmica, pero no dice cuántos m² de cubierta ocupan los captadores. Se cuentan 0, y P2 sale mayor de lo que será: dalos en HE 4.",
      };
    case "mixto":
      return {
        titulo: "Confirma el factor de producción de cada uso.",
        detalle: `El DB no dice qué factor lleva un edificio con viviendas y otros usos. Se aplica ${num(F.residencialPrivado)} kW/m² a lo residencial (con lo común, los trasteros y el garaje) y ${num(F.resto)} kW/m² a los locales y las oficinas (criterio).`,
      };
    case "transitable":
      return {
        titulo: "La cubierta transitable no cuenta para P2.",
        detalle: "Con toda la cubierta transitable, Sc = 0 y P2 sale nula. Si hay cubierta solo para conservación (casetones, zonas de instalaciones), indícala: entra en Sc.",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoHe5(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase === "potencia") {
    return {
      titulo: "La potencia instalada no llega a la mínima.",
      detalle: `Se instalan ${kW(d.instalada_kW)} y la mínima es ${kW(d.pmin_kW)}. Solo se admite menos si razones urbanísticas, arquitectónicas o de protección lo impiden, justificándolo con la máxima potencia posible (ap. 3 pto 2).`,
    };
  }
  return null;
}

export function describirDibujoHe5(j: JustificacionHe5): string {
  if (!j.aplica) return `Sección del edificio: ${m2(j.superficies.s_m2)} construidos.`;
  return "Sección del edificio con la superficie construida que cuenta, la cubierta no transitable y la generación renovable sobre ella.";
}
