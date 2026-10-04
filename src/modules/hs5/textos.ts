// =============================================================================
// DB-HS5 — Textos de la justificación (feature-14 §E): la frase de la cabecera,
// «lo que manda» y las cuentas de la franja, lo que dicen las etiquetas del
// dibujo y la lista, y el texto de los avisos. Funciones PURAS: los datos los
// pone `justificacion.ts`; aquí solo se redacta, en español y con coma decimal.
// =============================================================================

import { estadoElemento } from "../../lib/cte/estados";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import { cuantos, mayuscula } from "../../lib/cte/redaccion";
import type { Aviso } from "../../lib/cte/resultado";
import { etiquetaNivel, formatoCota } from "../../lib/edificio/derivar";
import { fmt } from "../../lib/units/format";
import type { ElementoHs5, JustificacionHs5 } from "./justificacion";
import type { CuartoRed } from "./red";
import {
  ARQUETAS_TABLA_4_13,
  BAJANTES_TABLA_4_4,
  COLECTORES_TABLA_4_5,
  VENT_PRIMARIA,
  type TipoAparato,
} from "./tablas";

// -----------------------------------------------------------------------------
// Estado de presentación
// -----------------------------------------------------------------------------

export { TEXTO_ESTADO, type EstadoPresentacion } from "../../lib/cte/presentacion";

/**
 * Estado con que se pinta un elemento: el veredicto, salvo que tenga un aviso
 * sin revisar, que lo deja «por revisar» (si no falla). Es el común de
 * `lib/cte/estados.ts` (feature-15 §A).
 */
export function estadoDe(el: ElementoHs5, conAvisoPendiente: ReadonlySet<string>): EstadoPresentacion {
  return estadoElemento(el, conAvisoPendiente);
}

// -----------------------------------------------------------------------------
// Helpers de redacción
// -----------------------------------------------------------------------------

export { cuantos } from "../../lib/cte/redaccion";

/** «Ø110». */
function d(mm: number | null): string {
  return mm === null ? "Ø—" : `Ø${fmt(mm, undefined, 0)}`;
}

/** Metros con dos decimales fijos, como en los planos: «1,80 m». */
function m2d(v: number): string {
  return `${v.toFixed(2).replace(".", ",")} m`;
}

/** Cifra redondeada a entero: «95». */
function n0(v: number): string {
  return fmt(v, undefined, 0);
}

function pct(uso: number | undefined): string {
  return uso === undefined ? "" : `${n0(uso * 100)} %`;
}

/** «planta baja», «planta 2», «sótano 1». */
function nombrePlanta(nivel: number): string {
  if (nivel === 0) return "planta baja";
  return nivel > 0 ? `planta ${nivel}` : `sótano ${-nivel}`;
}

/** Quién manda cuando es un aparato: «El inodoro», «El vertedero»… */
function elAparato(t: TipoAparato): string {
  if (t.startsWith("cuarto_") || t.startsWith("inodoro")) return "El inodoro";
  if (t === "vertedero") return "El vertedero";
  return "Un aparato";
}

const NOMBRE_APARATO: Partial<Record<TipoAparato, string>> = {
  fregadero_cocina: "fregadero",
  lavavajillas: "lavavajillas",
  lavadora: "lavadora",
  cuarto_bano_cisterna: "baño",
  cuarto_aseo_cisterna: "aseo",
  inodoro_cisterna: "inodoros",
  lavabo: "lavabos",
};

/** «2 baños», «baño y aseo», «cocina». */
export function describirCuartos(cuartos: CuartoRed[]): string {
  const banos = cuartos.filter((c) => c.clase === "bano").length;
  const aseos = cuartos.filter((c) => c.clase === "aseo").length;
  const partes: string[] = [];
  if (banos > 0) partes.push(banos === 1 ? "baño" : `${banos} baños`);
  if (aseos > 0) partes.push(aseos === 1 ? "aseo" : `${aseos} aseos`);
  if (cuartos.some((c) => c.clase === "cocina")) partes.push("cocina");
  if (cuartos.some((c) => c.clase === "aseos")) partes.push("aseos");
  return partes.length <= 1 ? (partes[0] ?? "") : `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

/** Dimensiones mínimas de la arqueta para un Ø de colector (Tabla 4.13, columna ≥ Ø por criterio). */
function arquetaDe(mm: number): string {
  const f = ARQUETAS_TABLA_4_13.datos.filas.find((x) => x.diametro_mm >= mm);
  return f ? `${f.largo_cm} × ${f.ancho_cm} cm` : "fuera de tabla";
}

/** Ø de bajante inmediatamente mayor (Tabla 4.4). */
function siguienteBajante(mm: number): number | null {
  return BAJANTES_TABLA_4_4.datos.filas.find((f) => f.diametro_mm > mm)?.diametro_mm ?? null;
}

// -----------------------------------------------------------------------------
// Lo corto: etiqueta del dibujo, valor y resultado en la lista
// -----------------------------------------------------------------------------

/** El valor tal y como se enseña en grande: «Ø110», «Primaria», «Bombeo». */
export function valorCorto(el: ElementoHs5): string {
  return "texto" in el.valor ? el.valor.texto : d(el.valor.valor);
}

/** Lo que dice la etiqueta del elemento en el dibujo. */
export function textoEtiqueta(el: ElementoHs5): string {
  const det = el.detalle;
  if (det.clase === "colector") return `${valorCorto(el)} · ${fmt(det.tramo.pendiente_pct)} %`;
  if (det.clase === "local") return `${valorCorto(el)} previsto`;
  return valorCorto(el);
}

/** La columna «Resultado» de la lista de comprobaciones. */
export function resultadoLista(el: ElementoHs5): string {
  const det = el.detalle;
  const v = valorCorto(el);
  switch (det.clase) {
    case "colector":
    case "ramal":
      return el.uso === undefined ? v : `${v} · ${pct(el.uso)}`;
    case "bajante":
      return el.uso !== undefined && el.uso >= 0.999 ? `${v} · justo` : v;
    case "pluviales_bajantes":
      return `${v} × ${det.p.bajantes}`;
    case "ventilacion":
    case "garaje":
      return v.toLowerCase();
    default:
      return v;
  }
}

// -----------------------------------------------------------------------------
// La franja de detalle
// -----------------------------------------------------------------------------

export type DetalleFranja = DetalleElemento;

export function franjaDe(el: ElementoHs5, j: JustificacionHs5, estado: EstadoPresentacion): DetalleFranja {
  const base = { titulo: el.nombre, valor: valorCorto(el), estado, cita: el.cita.join(" · ") };
  const det = el.detalle;
  const m = el.manda;
  const alt = el.alternativa;

  switch (det.clase) {
    case "colector": {
      const t = det.tramo;
      const minimo =
        det.disposicion === "colgado"
          ? COLECTORES_TABLA_4_5.datos.pendienteMinColgado_pct
          : COLECTORES_TABLA_4_5.datos.pendienteMinEnterrado_pct;
      let manda: string;
      if (t.pendiente_pct < minimo) {
        manda = `La pendiente. Un colector ${det.disposicion} necesita al menos el ${fmt(minimo)} % (tabla 4.5) y este va al ${fmt(t.pendiente_pct)} %.`;
      } else if (m.tipo === "no_menor_que_aguas_arriba") {
        const porCap = t.diametroPorCapacidad_mm;
        const capPorCap = alt && alt.valor.valor === porCap ? alt.capacidad?.valor : undefined;
        manda =
          `Las bajantes. Por unidades bastaría ${d(porCap)}` +
          (capPorCap !== undefined ? ` (${n0(capPorCap)} UD)` : "") +
          `, pero el colector no puede ser menor que las bajantes ${d(m.diametro_mm)} que recibe.`;
      } else if (m.tipo === "minimo_aparato") {
        manda = `${elAparato(m.aparato as TipoAparato)}: desagua en ${d(m.diametroMin_mm)} y el colector no puede ser menor.`;
      } else if (alt && alt.capacidad) {
        manda = `Las unidades de desagüe. Con ${d(alt.valor.valor)} solo admitiría ${n0(alt.capacidad.valor)} UD y le llegan ${n0(t.udAcumuladas)}.`;
      } else {
        manda = `Las unidades de desagüe: ${n0(t.udAcumuladas)} UD caben en ${d(t.diametro_mm)}, el menor de la tabla.`;
      }
      const filas = [
        {
          k: "Recibe",
          v: `${n0(t.udAcumuladas)} UD` + (det.bajantes > 0 ? ` · ${det.bajantes} ${det.bajantes === 1 ? "bajante" : "bajantes"}` : ""),
        },
        { k: `Admite con ${d(t.diametro_mm)}`, v: t.capacidad_ud === null ? "—" : `${n0(t.capacidad_ud)} UD` },
      ];
      if (alt) filas.push({ k: `Admitiría con ${d(alt.valor.valor)}`, v: alt.capacidad ? `${n0(alt.capacidad.valor)} UD` : "no admitido" });
      const colgadoDe = det.disposicion === "enterrado" ? null : (j.red.colgadoDe ?? "forjado_pb");
      const nota =
        colgadoDe === "garaje" || colgadoDe === "sotano"
          ? `Colgado del techo del ${colgadoDe}, registrable, hasta la arqueta de salida.`
          : colgadoDe === "forjado_pb"
            ? "Colgado bajo el forjado de la planta baja, registrable, hasta la arqueta de salida."
            : "Enterrado, con arquetas registrables, hasta la arqueta de salida.";
      return {
        ...base,
        clase: "Colector · residuales",
        unidad: `al ${fmt(t.pendiente_pct)} %`,
        manda,
        nota,
        filas,
        uso: el.uso,
      };
    }

    case "bajante": {
      const t = det.tramo;
      const b = t.bajante;
      const plantas = b?.plantas ?? 1;
      let manda: string;
      if (m.tipo === "minimo_aparato") {
        manda = `${elAparato(m.aparato as TipoAparato)}. Desagua en ${d(m.diametroMin_mm)} y la bajante no puede ser menor; por unidades bastaría ${d(t.diametroPorCapacidad_mm)}.`;
      } else if (m.tipo === "no_menor_que_aguas_arriba") {
        manda = `Lo que le vierte: no puede ser menor que ${d(m.diametro_mm)}.`;
      } else if (b?.porRamal && b.porTotal && b.porRamal.diametro_mm > b.porTotal.diametro_mm) {
        manda = `El ramal más cargado: ${n0(b.udMaxRamal)} UD en una planta piden ${d(b.porRamal.diametro_mm)} (tabla 4.4); por el total bastaría ${d(b.porTotal.diametro_mm)}.`;
      } else if (el.uso !== undefined && el.uso >= 0.999) {
        manda = `Las unidades de desagüe: ${n0(t.udAcumuladas)} de ${n0(t.capacidad_ud ?? 0)}. Cumple justo en el límite de ${d(t.diametro_mm)}.`;
      } else {
        manda = `Las unidades de desagüe: ${n0(t.udAcumuladas)} UD caben en ${d(t.diametro_mm)}` + (alt?.capacidad ? `; con ${d(alt.valor.valor)} solo admitiría ${n0(alt.capacidad.valor)}.` : ".");
      }
      const ramales = det.bajante?.ramales ?? [];
      const iguales = ramales.length > 1 && ramales.every((r) => r.ud === ramales[0].ud);
      const filas = [
        {
          k: "Recibe",
          v: `${n0(t.udAcumuladas)} UD` + (iguales ? ` · ${ramales.length} × ${n0(ramales[0].ud)}` : ""),
        },
      ];
      const claseB = det.bajante?.clase;
      if (claseB === "cocina" || claseB === "unica") {
        filas.push({
          k: "Aparatos",
          v: det.aparatos.map((a) => NOMBRE_APARATO[a] ?? a).join(" · "),
        });
      }
      if (alt) filas.push({ k: `Con ${d(alt.valor.valor)} admitiría`, v: alt.capacidad ? `${n0(alt.capacidad.valor)} UD` : "—" });
      if (m.tipo !== "capacidad_tabla" && t.capacidad_ud !== null) {
        filas.push({ k: `Con ${d(t.diametro_mm)} admite`, v: `${n0(t.capacidad_ud)} UD` });
      }
      if (b?.columna === "envolvente") {
        filas.push({ k: "Columna de la tabla 4.4", v: `las dos (${b.plantas} o ${b.plantasAtravesadas} plantas)` });
      }
      let nota: string | undefined;
      if (el.uso !== undefined && el.uso >= 0.999 && t.diametro_mm !== null) {
        const sig = siguienteBajante(t.diametro_mm);
        nota = `Sin margen: si ${claseB === "cocina" ? "la cocina suma" : "se suma"} un aparato, la bajante pasa a ${d(sig)}.`;
      } else if (det.vertical && det.vertical.instancias > 1) {
        nota = `Hay ${det.vertical.instancias} verticales iguales de ${det.vertical.nombre}: todas se resuelven igual.`;
      }
      return {
        ...base,
        clase: `Bajante · ${claseB === "unica" ? "baños y cocina" : (claseB ?? "residuales")}`,
        unidad: plantas === 1 ? "1 planta" : `${plantas} plantas`,
        manda,
        nota,
        filas,
        uso: el.uso,
      };
    }

    case "ramal": {
      const t = det.tramo;
      const cuartos = describirCuartos(det.cuartos);
      const titulo =
        det.nivel !== null && det.cuartos.length > 0
          ? `${mayuscula(el.nombre.replace(/^Ramal · /, "").replace(/ · [^·]+$/, ""))} · ${nombrePlanta(det.nivel)}`
          : el.nombre;
      const manda =
        m.tipo === "minimo_aparato"
          ? `${elAparato(m.aparato as TipoAparato)}: ${d(m.diametroMin_mm)} como mínimo. Por unidades bastaría ${d(t.diametroPorCapacidad_mm)}.`
          : `Las unidades de desagüe: ${n0(t.udAcumuladas)} UD caben en ${d(t.diametro_mm)}.`;
      return {
        ...base,
        titulo,
        clase: "Ramal",
        unidad: `al ${fmt(t.pendiente_pct)} %`,
        manda,
        nota: det.ramales > 1 ? "Es el ramal más cargado; todos los demás se resuelven igual o con menos." : undefined,
        filas: [
          { k: "Recibe", v: `${n0(t.udAcumuladas)} UD` + (cuartos ? ` · ${cuartos}` : "") },
          { k: `Admite con ${d(t.diametro_mm)}`, v: t.capacidad_ud === null ? "—" : `${n0(t.capacidad_ud)} UD` },
        ],
        uso: el.uso,
      };
    }

    case "pluviales_bajantes": {
      const p = det.p;
      const i = det.intensidad;
      const cada = p.bajantes === 1 ? "toda la cubierta" : `${n0(p.bajante.superficie_m2)} m² cada una`;
      const manda =
        p.f === 1
          ? `La superficie de cubierta: ${cada}. ${d(p.bajante.diametro_mm)} sirve hasta ${n0(p.bajante.capacidad_m2 ?? 0)} m².`
          : `La superficie de cubierta: ${cada}, que con ${n0(i.valor_mm_h)} mm/h equivalen a ${n0(p.bajante.corregida_m2)} m². ${d(p.bajante.diametro_mm)} sirve hasta ${n0(p.bajante.capacidad_m2 ?? 0)} m².`;
      const filas = [
        {
          k: "Cubierta",
          v: `${n0(p.superficie_m2)} m² · ` + (p.sumideros !== null ? cuantos(p.sumideros, "sumidero", "sumideros") : "canalones"),
        },
        {
          k: "Intensidad · apéndice B",
          v: i.supuesta ? `${n0(i.valor_mm_h)} mm/h · supuesta` : `${n0(i.valor_mm_h)} mm/h · f ${fmt(p.f, undefined, 2)}`,
        },
      ];
      if (alt) filas.push({ k: `Con ${d(alt.valor.valor)} serviría`, v: alt.capacidad ? `${n0(alt.capacidad.valor)} m²` : "—" });
      return {
        ...base,
        clase: "Pluviales",
        unidad: `× ${p.bajantes}`,
        manda,
        nota:
          j.red.decisiones.alcantarillado === "unitario"
            ? "Bajan por las fachadas y se unen a las residuales en la arqueta de salida."
            : "Bajan por las fachadas hasta la acometida de pluviales.",
        filas,
        uso: el.uso,
      };
    }

    case "pluviales_colector": {
      const p = det.p;
      const c = p.colector;
      const manda =
        m.tipo === "no_menor_que_aguas_arriba"
          ? `Las bajantes: por superficie bastaría ${d(c.diametroPorCapacidad_mm)}, pero no puede ser menor que las bajantes ${d(m.diametro_mm)}.`
          : p.f === 1
            ? `La cubierta entera: ${n0(c.superficie_m2)} m². ${d(c.diametro_mm)} admite ${n0(c.capacidad_m2 ?? 0)} m² al ${fmt(c.pendiente_pct)} %.`
            : `La cubierta entera: ${n0(c.superficie_m2)} m², que con ${n0(det.intensidad.valor_mm_h)} mm/h equivalen a ${n0(c.corregida_m2)} m². ${d(c.diametro_mm)} admite ${n0(c.capacidad_m2 ?? 0)} m² al ${fmt(c.pendiente_pct)} %.`;
      const filas = [
        { k: "Recibe", v: `${n0(c.superficie_m2)} m² · ${cuantos(p.bajantes, "bajante", "bajantes", "f")}` },
        { k: `Admite con ${d(c.diametro_mm)}`, v: c.capacidad_m2 === null ? "—" : `${n0(c.capacidad_m2)} m²` },
      ];
      if (alt) filas.push({ k: `Admitiría con ${d(alt.valor.valor)}`, v: alt.capacidad ? `${n0(alt.capacidad.valor)} m²` : "no admitido" });
      return {
        ...base,
        clase: "Pluviales · colector",
        unidad: `al ${fmt(c.pendiente_pct)} %`,
        manda,
        nota:
          j.red.decisiones.alcantarillado === "unitario"
            ? "Hasta la arqueta de salida, donde se une a las residuales con cierre hidráulico."
            : "Hasta la acometida de pluviales.",
        filas,
        uso: el.uso,
      };
    }

    case "canalones": {
      const p = det.p;
      const c = p.canalon!;
      return {
        ...base,
        clase: "Pluviales · canalones",
        unidad: `al ${fmt(c.pendiente_pct)} %`,
        manda:
          `Cada canalón recoge ${n0(c.superficie_m2)} m²` +
          (p.f === 1 ? "" : ` (${n0(c.corregida_m2)} m² con ${n0(det.intensidad.valor_mm_h)} mm/h)`) +
          `; ${d(c.diametro_mm)} admite ${n0(c.capacidad_m2 ?? 0)} m² al ${fmt(c.pendiente_pct)} %.`,
        filas: [
          { k: "Canalones", v: `${p.bajantes} · semicirculares` },
          ...(c.alternativa
            ? [{ k: `Con ${d(c.alternativa.diametro_mm)} serviría`, v: `${n0(c.alternativa.capacidad_m2 ?? 0)} m²` }]
            : []),
        ],
        uso: el.uso,
      };
    }

    case "ventilacion": {
      const limite = VENT_PRIMARIA.datos.maxPlantasSolo;
      const basta = det.plantas < limite;
      let manda: string;
      if (det.ventilacion === "primaria") {
        manda = basta
          ? `La altura del edificio: con menos de ${limite} plantas basta prolongar las bajantes sobre la cubierta.`
          : `La altura del edificio: con ${det.plantas} plantas la primaria no basta; hace falta ventilación secundaria.`;
      } else {
        manda = basta
          ? `Decisión de proyecto: con menos de ${limite} plantas bastaría la primaria.`
          : `La altura del edificio: con ${det.plantas} plantas hace falta ventilación secundaria` +
            (det.secundariaDiametro_mm ? `, con columna de ${d(det.secundariaDiametro_mm)}.` : ".");
      }
      return {
        ...base,
        clase: "Ventilación",
        manda,
        filas: [
          { k: "Plantas sobre rasante", v: String(det.plantas) },
          { k: "Bajantes ventiladas", v: `${det.bajantes} de residuales` },
          { k: "Prolongación sobre la cubierta", v: `≥ ${m2d(det.prolongacion_m)}` },
        ],
      };
    }

    case "local": {
      const l = det.local;
      return {
        ...base,
        titulo: `${el.nombre} · ${nombrePlanta(l.nivel)}`,
        clase: "Previsión",
        unidad: "previsto",
        manda:
          "Su actividad. El HS 5 no pide nada a un local sin aparatos: se deja la conexión como criterio de proyecto y se justificará cuando se instalen (ap. 1.1).",
        filas: [
          { k: "Conexión", v: `${valorCorto(el)} al colector general` },
          { k: "Unidades supuestas", v: "ninguna" },
          { k: "Superficie útil", v: `${n0(l.superficie_m2)} m²` },
        ],
      };
    }

    case "garaje": {
      const g = det.garaje;
      const c = formatoCota(g.cota_m);
      let manda: string;
      if (det.bombeo && det.cotaAlcantarillado_m !== null) {
        const dif = det.cotaAlcantarillado_m - g.cota_m;
        manda = `La cota. El suelo del garaje (${c}) queda ${m2d(dif)} por debajo de la acometida (${formatoCota(det.cotaAlcantarillado_m)}).`;
      } else if (det.bombeo) {
        manda = `La cota. No consta la del alcantarillado: se supone por encima del suelo del garaje (${c}).`;
      } else {
        manda = `La cota. El suelo del garaje (${c}) queda por encima de la acometida${det.cotaAlcantarillado_m !== null ? ` (${formatoCota(det.cotaAlcantarillado_m)})` : ""}: desagua por gravedad.`;
      }
      return {
        ...base,
        clase: `Garaje · ${etiquetaNivel(g.nivel)}`,
        manda,
        nota: det.bombeo
          ? `La impulsión sube por encima de la cota de la acometida (bucle antirreflujo) y baja por gravedad al colector ${det.colectores === "colgado" ? "colgado" : "de residuales"}; nunca a una bajante.`
          : undefined,
        filas: det.bombeo
          ? [
              { k: "Sumideros", v: "sifónicos" },
              { k: "Separador de grasas", v: "antes del pozo" },
              { k: "Pozo de bombeo", v: "≥ 2 bombas · alternancia" },
              { k: "Alimentación", v: "grupo o batería ≥ 24 h" },
            ]
          : [
              { k: "Sumideros", v: "sifónicos" },
              { k: "Separador de grasas", v: "antes de la conexión" },
            ],
      };
    }

    case "conexion": {
      const unitario = det.alcantarillado === "unitario";
      return {
        ...base,
        clase: "Acometida",
        manda: unitario
          ? "El alcantarillado de la calle, que es unitario: residuales y pluviales van separadas por dentro y se unen en la arqueta de salida, con cierre hidráulico."
          : "El alcantarillado de la calle, que es separativo: residuales y pluviales salen por acometidas distintas.",
        filas: [
          { k: "Residuales", v: det.residuales_mm === null ? "—" : `colector ${d(det.residuales_mm)}` },
          { k: "Pluviales", v: det.pluviales_mm === null ? "—" : `colector ${d(det.pluviales_mm)}` },
          { k: "Unión", v: unitario ? "arqueta con cierre hidráulico" : "ninguna" },
          ...(det.residuales_mm !== null ? [{ k: "Arqueta de salida", v: arquetaDe(det.residuales_mm) }] : []),
        ],
        nota: "La arqueta es el mínimo de la tabla 4.13 para el Ø del colector (la columna ≥ Ø nominal, por criterio).",
      };
    }
  }
}

// -----------------------------------------------------------------------------
// La frase de la cabecera
// -----------------------------------------------------------------------------

export function fraseHs5(j: JustificacionHs5): string {
  const partes: string[] = [];
  const fallan = j.elementos.filter((e) => e.veredicto === "fail");
  if (fallan.length > 0) {
    partes.push(`No cumple: ${fallan.map((e) => e.nombre.toLowerCase()).join(", ")}.`);
  }
  const d0 = j.red.decisiones;
  if (j.pluviales && j.residuales) {
    partes.push(
      d0.alcantarillado === "unitario"
        ? "Residuales y pluviales por redes separadas que se unen en la arqueta de salida."
        : "Residuales y pluviales por redes separadas, cada una con su acometida.",
    );
  }
  const nBajantes = j.residuales?.porTramo.filter((t) => t.tipo === "bajante").length ?? 0;
  const col = j.elementos.find((e) => e.detalle.clase === "colector");
  const trozos: string[] = [];
  if (nBajantes > 0) trozos.push(cuantos(nBajantes, "bajante de residuales", "bajantes de residuales", "f"));
  if (j.pluviales) trozos.push(`${cuantos(j.pluviales.bajantes, "", "", "f").trim()} de pluviales`);
  if (col && col.detalle.clase === "colector") {
    trozos.push(`colector ${col.detalle.disposicion} ${valorCorto(col)} al ${fmt(col.detalle.tramo.pendiente_pct)} %`);
  }
  if (j.modo === "manual") partes.push("Red de residuales ajustada a mano.");
  if (trozos.length > 0) {
    const frase = trozos.length === 1 ? trozos[0] : `${trozos.slice(0, -1).join(", ")} y ${trozos[trozos.length - 1]}`;
    partes.push(`${mayuscula(frase)}.`);
  }
  const garaje = j.elementos.find((e) => e.detalle.clase === "garaje" && e.detalle.bombeo);
  const local = j.elementos.find((e) => e.detalle.clase === "local");
  if (garaje) partes.push("El garaje queda por debajo del alcantarillado y evacua por bombeo.");
  else if (local && local.detalle.clase === "local") {
    partes.push(`El local de la ${nombrePlanta(local.detalle.local.nivel)} queda con la conexión prevista.`);
  }
  if (partes.length === 0) return "No hay cuartos húmedos ni cubierta que evacuar.";
  return partes.join(" ");
}

/** Las cifras clave en una línea (caché del veredicto, panel de la obra). */
export function metricasHs5(j: JustificacionHs5): string {
  const col = j.elementos.find((e) => e.detalle.clase === "colector");
  const partes: string[] = [];
  if (j.residuales) partes.push(`${n0(j.residuales.udTotales)} UD`);
  if (col) partes.push(`colector ${valorCorto(col)}`);
  if (j.pluviales?.bajante.diametro_mm) partes.push(`pluviales ${d(j.pluviales.bajante.diametro_mm)} × ${j.pluviales.bajantes}`);
  return partes.join(" · ");
}

// -----------------------------------------------------------------------------
// Avisos
// -----------------------------------------------------------------------------

export interface TextoAviso {
  titulo: string;
  detalle: string;
}

export function textoAviso(a: Aviso): TextoAviso {
  switch (a.id) {
    case "colector-bajo-sotano":
      return {
        titulo: "Los colectores enterrados quedan bajo el sótano.",
        detalle:
          "Por debajo del alcantarillado: toda la red tendría que evacuar por bombeo. Lo habitual es colgarlos del techo del sótano.",
      };
    case "pluviometria-supuesta":
      return {
        titulo: "Falta la intensidad de lluvia.",
        detalle:
          "No consta la zona pluviométrica en los datos de la obra: los pluviales se han calculado con 100 mm/h, la intensidad de las tablas. Léela en el mapa de la Figura B.1 (apéndice B).",
      };
    case "unifamiliar-reparto":
      return {
        titulo: "Se ha supuesto dónde están los cuartos húmedos.",
        detalle: "Baños en la planta alta; cocina y aseo en la baja. Si no es así, ajusta la red a mano.",
      };
    case "oficinas-sin-nucleos":
      return {
        titulo: "Hay oficinas sin núcleos de aseos.",
        detalle: "No aportan aparatos a la red. Añade sus núcleos en El edificio.",
      };
  }
  if (a.id.startsWith("garaje-") && a.id.endsWith("-bombeo")) {
    const cota = a.datos.cota_m as number;
    const alc = a.datos.cotaAlcantarillado_m as number | null;
    return {
      titulo: "El garaje queda por debajo del alcantarillado.",
      detalle:
        alc !== null
          ? `Su suelo (${formatoCota(cota)}) está ${m2d(alc - cota)} por debajo de la acometida (${formatoCota(alc)}): pozo con dos bombas y separador de grasas; el equipo se define en el proyecto.`
          : `No consta la cota de la acometida en los datos de la obra: se supone por encima del suelo del garaje (${formatoCota(cota)}). Pozo con dos bombas y separador de grasas; el equipo se define en el proyecto.`,
    };
  }
  return { titulo: "Revisa la red.", detalle: String(a.datos.texto ?? "") };
}

/** Descripción accesible del dibujo: lo que se ve y su veredicto, en texto. */
export function describirSeccion(j: JustificacionHs5): string {
  const partes = [
    "Sección del edificio con la red de evacuación de aguas.",
    fraseHs5(j),
    ...j.elementos.map((el) => `${el.nombre}: ${resultadoLista(el)}.`),
  ];
  return partes.join(" ");
}
