// =============================================================================
// DB-HE 4 — Textos (feature-22): la frase de la cabecera, «Qué entra», la franja
// de cada elemento, las etiquetas del dibujo y de la lista, los avisos y lo que
// no cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import type { Apoyo, Sistema } from "./estado";
import type { DetalleHe4, ElementoHe4, JustificacionHe4, ViviendaHe4 } from "./justificacion";
import { AMBITO_HE4, CONTRIBUCION_HE4, CRITERIOS_HE4, DEMANDA_OTROS_HE4, DEMANDA_VIVIENDA_HE4, FRACCION_RENOVABLE_HE4 } from "./tablas";

const LIM = AMBITO_HE4.datos.demandaMayorQue_l_d;
const C = CONTRIBUCION_HE4.datos;
const L = DEMANDA_VIVIENDA_HE4.datos.litrosPersonaDia;

/** «588 l/d», «42 l/d». */
export function ld(v: number): string {
  return `${v.toLocaleString("es-ES", { maximumFractionDigits: 1 })} l/d`;
}

/** «11 870 kWh» con el separador de miles de es-ES. */
export function kWh(v: number): string {
  return `${Math.round(v).toLocaleString("es-ES")} kWh`;
}

/** «60 %», «71,4 %». */
export function pct(v: number): string {
  return `${v.toLocaleString("es-ES", { maximumFractionDigits: 1 })} %`;
}

/** Un número con coma: «2,5», «0,95». */
export function num(v: number, dec = 2): string {
  return v.toLocaleString("es-ES", { maximumFractionDigits: dec });
}

export const NOMBRE_SISTEMA: Record<Sistema, string> = {
  bomba_calor: "bomba de calor",
  solar: "solar térmica",
  biomasa: "caldera de biomasa",
  red: "red urbana de calor",
};

export const NOMBRE_APOYO: Record<Apoyo, string> = {
  convencional: "caldera o termo convencional",
  bomba_calor: "bomba de calor",
  biomasa: "caldera de biomasa",
};

/** «3 dormitorios · 4 personas · 112 l/d». */
export function textoVivienda(v: ViviendaHe4): string {
  const dorm = v.dormitorios === 0 ? "estudio" : `${v.dormitorios} dormitorio${v.dormitorios === 1 ? "" : "s"}`;
  return `${dorm} · ${num(v.personas, 1)} personas · ${ld(v.l_d)}`;
}

function det(el: ElementoSi<unknown>): DetalleHe4 {
  return (el as ElementoHe4).detalle;
}

function buscar<C extends DetalleHe4["clase"]>(j: JustificacionHe4, clase: C): Extract<DetalleHe4, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleHe4, { clase: C }>) : null;
}

/** «bomba de calor (SCOPdhw 2,5)», «solar térmica (60 %) con apoyo de caldera…». */
export function textoSistema(d: Extract<DetalleHe4, { clase: "contribucion" }>): string {
  switch (d.sistema) {
    case "bomba_calor":
      return `bomba de calor con SCOPdhw ${num(d.scop)}`;
    case "solar":
      return `solar térmica con una fracción solar del ${pct(d.fraccionSolar_pct)} y apoyo de ${NOMBRE_APOYO[d.apoyo]}${d.apoyo === "bomba_calor" ? ` (SCOPdhw ${num(d.scop)})` : ""}`;
    case "biomasa":
      return "caldera de biomasa";
    case "red":
      return `red urbana de calor${d.renovableRed_pct !== null ? ` con un ${pct(d.renovableRed_pct)} renovable` : ""}`;
  }
}

// ── Cabecera ────────────────────────────────────────────────────────────────

export function fraseHe4(j: JustificacionHe4): string {
  if (!j.aplica) return `Demanda de ACS de ${ld(j.total_l_d)}, no más de ${ld(LIM)}: HE 4 no se aplica.`;
  const c = buscar(j, "contribucion")!;
  const cumple = c.cumple;
  return `Demanda de ACS de ${ld(j.total_l_d)}: ${NOMBRE_SISTEMA[c.sistema]} con un ${pct(c.renovable_pct)} renovable, ${cumple ? "no menos" : "menos"} del ${pct(c.exigida_pct)} exigido.`;
}

export function metricasHe4(j: JustificacionHe4): string {
  if (!j.aplica) return `D = ${ld(j.total_l_d)} · no aplica`;
  const c = buscar(j, "contribucion")!;
  const en = buscar(j, "energia");
  return [`D = ${ld(j.total_l_d)}`, ...(en ? [`${kWh(en.total_kWh)}/año`] : []), `renovable ${pct(c.renovable_pct)} ≥ ${pct(c.exigida_pct)}`].join(" · ");
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : "normal";
}

export function queEntraHe4(j: JustificacionHe4, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const filas: FilaQueEntra[] = [];
  const dem = buscar(j, "demanda")!;
  if (j.viviendas.length > 0) {
    const n = j.viviendas.reduce((a, v) => a + v.cantidad, 0);
    filas.push({
      id: "viviendas",
      titulo: j.unifamiliar ? "Vivienda" : "Viviendas",
      detalle: j.unifamiliar ? textoVivienda(j.viviendas[0]) : `${n} · ${j.viviendas.map((v) => `${v.cantidad} ${v.nombre} (${num(v.personas, 1)} p.)`).join(" · ")}`,
      trato: dem.fc < 1 ? `${ld(dem.viviendas_l_d)} · fc ${num(dem.fc)}` : ld(dem.viviendas_l_d),
      estado: trato(estados.demanda),
      elementoId: `vivienda-${j.viviendas[0].tipoId}`,
    });
  }
  const o = buscar(j, "oficinas");
  if (o) {
    filas.push({ id: "oficinas", titulo: "Oficinas", detalle: `${o.ocupantes} ocupantes${o.supuestos ? " (1 por 10 m²)" : ""}`, trato: ld(o.l_d), estado: trato(estados.oficinas), elementoId: "oficinas" });
  }
  if (j.local) filas.push({ id: "local", titulo: "Local", detalle: "sin actividad", trato: "con su actividad", estado: "pv" });
  const c = buscar(j, "contribucion");
  if (c) {
    filas.push({ id: "sistema", titulo: "Producción", detalle: NOMBRE_SISTEMA[c.sistema], trato: `≥ ${pct(c.exigida_pct)}`, estado: trato(estados.contribucion), elementoId: "contribucion" });
  }
  return filas;
}

export function piezasHe4(j: JustificacionHe4): { texto: string; acento: boolean }[] {
  if (!j.aplica) return [{ texto: ld(j.total_l_d), acento: false }];
  const c = buscar(j, "contribucion")!;
  return [
    { texto: ld(j.total_l_d), acento: false },
    { texto: `${NOMBRE_SISTEMA[c.sistema]} ${pct(c.renovable_pct)}`, acento: !c.cumple },
  ];
}

// ── Etiquetas y lista ───────────────────────────────────────────────────────

export function textoEtiquetaHe4(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "vivienda":
      return `${num(d.vivienda.personas, 1)} p · ${ld(d.vivienda.l_d)}`;
    case "oficinas":
      return `${d.ocupantes} p · ${ld(d.l_d)}`;
    case "demanda":
      return `D ${ld(d.total_l_d)}`;
    case "energia":
      return `${kWh(d.total_kWh)}/año`;
    case "contribucion":
      return `${pct(d.renovable_pct)} renovable`;
  }
}

export function resultadoListaHe4(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "vivienda":
      return `${textoVivienda(d.vivienda)}${d.vivienda.cantidad > 1 ? ` × ${d.vivienda.cantidad}${d.fc < 1 ? ` × fc ${num(d.fc)}` : ""} = ${ld(d.total_l_d)}` : ""}`;
    case "oficinas":
      return `${d.ocupantes} ocupantes × ${DEMANDA_OTROS_HE4.datos.oficinas_l_persona_dia} l/día·persona = ${ld(d.l_d)}`;
    case "demanda":
      return `${ld(d.total_l_d)}, ${d.aplica ? `más de ${ld(LIM)}: se aplica; contribución mínima del ${pct(d.exigida_pct)}` : `no más de ${ld(LIM)}: no se aplica`}`;
    case "energia":
      return `${kWh(d.util_kWh)} útiles + ${pct(d.perdidas_pct)} de pérdidas = ${kWh(d.total_kWh)} al año (agua fría de ${d.capital}${d.az !== 0 ? `, corregida ${d.az > 0 ? "+" : ""}${d.az} m` : ""})`;
    case "contribucion":
      return `${pct(d.renovable_pct)} con ${textoSistema(d)}, frente al ${pct(d.exigida_pct)}`;
  }
}

// ── La franja ───────────────────────────────────────────────────────────────

export function franjaHe4(el: ElementoSi<unknown>, j: JustificacionHe4, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "vivienda":
      return {
        clase: "Demanda de referencia · Anejo F",
        titulo: el.nombre,
        valor: ld(d.vivienda.l_d).replace(" l/d", ""),
        unidad: "l/d a 60 °C por vivienda",
        estado,
        manda: `${L} litros por persona y día a 60 °C, con la ocupación mínima de la tabla a-Anejo F por el número de dormitorios.`,
        nota:
          d.vivienda.dormitorios === 0
            ? "Un estudio sin dormitorio cuenta como uno (criterio)."
            : d.fc < 1
              ? `Producción centralizada para ${j.viviendas.reduce((a, v) => a + v.cantidad, 0)} viviendas: factor de centralización ${num(d.fc)} (tabla b).`
              : undefined,
        filas: [
          { k: "Dormitorios", v: d.vivienda.dormitorios === 0 ? "estudio" : String(d.vivienda.dormitorios) },
          { k: "Personas (tabla a)", v: num(d.vivienda.personas, 1) },
          { k: "Por vivienda", v: `${num(d.vivienda.personas, 1)} × ${L} = ${ld(d.vivienda.l_d)}` },
          ...(j.unifamiliar ? [] : [{ k: `${d.vivienda.cantidad} viviendas`, v: `${ld(d.total_l_d)}${d.fc < 1 ? ` (× ${num(d.fc)})` : ""}` }]),
        ],
        cita: "DB-HE · Anejo F pto 1, tablas a y b",
      };
    case "oficinas":
      return {
        clase: "Demanda de referencia · Anejo F",
        titulo: el.nombre,
        valor: ld(d.l_d).replace(" l/d", ""),
        unidad: "l/d a 60 °C",
        estado,
        manda: `Para usos distintos del residencial privado, la tabla c-Anejo F da valores orientativos: ${DEMANDA_OTROS_HE4.datos.oficinas_l_persona_dia} litros por persona y día en oficinas.`,
        nota: d.supuestos ? "Sin indicar los ocupantes, uno por cada 10 m² útiles, la densidad de SI 3 (criterio)." : undefined,
        filas: [
          { k: "Superficie útil", v: `${d.util_m2} m²` },
          { k: "Ocupantes", v: `${d.ocupantes}${d.supuestos ? " (supuestos)" : ""}` },
          { k: "Demanda", v: `${d.ocupantes} × ${DEMANDA_OTROS_HE4.datos.oficinas_l_persona_dia} = ${ld(d.l_d)}` },
        ],
        cita: "DB-HE · Anejo F pto 2, tabla c",
      };
    case "demanda":
      return {
        clase: "Ámbito · ap. 1 y 3.1",
        titulo: el.nombre,
        valor: ld(d.total_l_d).replace(" l/d", ""),
        unidad: `l/d · ${d.aplica ? `exige ${pct(d.exigida_pct)}` : "no se aplica"}`,
        estado,
        manda: `La sección se aplica con más de ${ld(LIM)}. La contribución renovable mínima es el ${pct(C.general_pct)}, que puede bajar al ${pct(C.reducida_pct)} con menos de ${ld(C.reducidaSiDemandaMenorQue_l_d)}. La exigencia es del edificio entero, aunque cada vivienda produzca su ACS.`,
        nota: j.local ? "El local sin uso no cuenta: su demanda se justificará con su actividad." : undefined,
        filas: [
          ...(d.viviendas_l_d > 0 ? [{ k: "Viviendas", v: `${ld(d.viviendas_l_d)}${d.fc < 1 ? ` (fc ${num(d.fc)})` : ""}` }] : []),
          ...(d.oficinas_l_d > 0 ? [{ k: "Oficinas", v: ld(d.oficinas_l_d) }] : []),
          { k: "Producción", v: d.centralizada ? "centralizada" : j.plurifamiliar ? "individual" : j.unifamiliar ? "de la vivienda" : "del edificio" },
          { k: "Total", v: ld(d.total_l_d) },
        ],
        cita: "DB-HE · HE 4 ap. 1 y 3.1",
      };
    case "energia":
      return {
        clase: "Demanda energética · ap. 4 a)",
        titulo: el.nombre,
        valor: kWh(d.total_kWh).replace(" kWh", ""),
        unidad: "kWh al año",
        estado,
        manda: `Mes a mes, la demanda diaria por los días del mes, el calor específico del agua (${num(CRITERIOS_HE4.datos.calorEspecifico_Wh_lK, 3)} Wh por litro y grado) y el salto de 60 °C a la temperatura del agua fría de la red (Anejo G), más las pérdidas de distribución, acumulación y recirculación.`,
        nota: d.perdidasSupuestas ? `Pérdidas sin calcular: se toma un ${pct(d.perdidas_pct)} de la demanda útil (criterio).` : undefined,
        filas: [
          { k: "Agua fría", v: `${d.capital}${d.az !== 0 ? `, corregida por ${d.az > 0 ? "+" : ""}${d.az} m de altitud` : ""}` },
          { k: "Enero · julio", v: `${num(d.meses[0].tred, 1)} °C · ${num(d.meses[6].tred, 1)} °C` },
          { k: "Útil", v: `${kWh(d.util_kWh)} al año` },
          { k: "Pérdidas", v: pct(d.perdidas_pct) },
        ],
        cita: "DB-HE · HE 4 ap. 4 a) y Anejo G",
      };
    case "contribucion":
      return {
        clase: "Contribución renovable · ap. 3.1",
        titulo: el.nombre,
        valor: pct(d.renovable_pct).replace(" %", ""),
        unidad: `% · exige ${pct(d.exigida_pct)}`,
        estado,
        manda: mandaSistema(d),
        nota: notaSistema(d),
        filas: d.partes.map((x) => ({ k: x.que.charAt(0).toUpperCase() + x.que.slice(1), v: `cubre ${pct(x.cubre * 100)} · renovable ${pct(x.renovable * 100)}` })),
        uso: el.uso,
        cita: "DB-HE · HE 4 ap. 3.1",
      };
  }
}

function mandaSistema(d: Extract<DetalleHe4, { clase: "contribucion" }>): string {
  const B = `La bomba de calor aporta como renovable Qusable·(1 − 1/SCOP) y solo cuenta con un SCOPdhw de ${num(C.scopMinElectrica)} o más (eléctrica), a ${C.temperaturaPreparacionMin_C} °C o más.`;
  switch (d.sistema) {
    case "bomba_calor":
      return B;
    case "solar":
      return `La producción útil de los captadores es toda renovable; el apoyo cubre el resto con su propia fracción renovable.${d.apoyo === "bomba_calor" ? ` ${B}` : ""}`;
    case "biomasa":
      return `La biomasa sólida es renovable en la fracción fep,ren / fep,tot: ${num(FRACCION_RENOVABLE_HE4.datos.fepRenBiomasa, 3)} / ${num(FRACCION_RENOVABLE_HE4.datos.fepTotBiomasa, 3)} en los pellets (Guía de aplicación).`;
    case "red":
      return "De la red urbana cuenta la fracción renovable de su energía (fep,ren / fep,tot), que da la compañía.";
  }
}

function notaSistema(d: Extract<DetalleHe4, { clase: "contribucion" }>): string | undefined {
  if (d.scopBajo) return `Con un SCOPdhw de ${num(d.scop)}, por debajo de ${num(C.scopMinElectrica)}, la bomba de calor no cuenta como renovable.`;
  if (d.scopSupuesto && (d.sistema === "bomba_calor" || d.apoyo === "bomba_calor")) return `Sin el SCOPdhw del equipo, se toma el mínimo, ${num(C.scopMinElectrica)}.`;
  if (d.sistema === "solar" && d.fraccionSupuesta) return "Sin la fracción solar del cálculo de la instalación, se toma la exigida como objetivo de diseño.";
  if (d.sistema === "red" && d.renovableRed_pct === null) return "Falta la fracción renovable de la red: sin ella no cuenta nada.";
  return undefined;
}

// ── Avisos e incumplimientos ────────────────────────────────────────────────

export function textoAvisoHe4(a: Aviso): TextoSi {
  switch (a.id) {
    case "scop":
      return {
        titulo: "Indica el SCOPdhw de la bomba de calor.",
        detalle: `Se toma el mínimo para que cuente como renovable, ${num(C.scopMinElectrica)}, que da justo un 60 %. Da el del equipo (el declarado por el fabricante o el estimado con el documento reconocido del RITE), a la temperatura de preparación del ACS.`,
      };
    case "fraccion":
      return {
        titulo: "Indica la fracción solar de la instalación.",
        detalle: "Se toma la contribución exigida como objetivo: la instalación solar debe dimensionarse para alcanzarla, con un cálculo mensual (no se computa en un mes más que su demanda).",
      };
    case "perdidas":
      return {
        titulo: "Indica las pérdidas térmicas del ACS.",
        detalle: `El DB pide que el proyectista calcule las pérdidas de distribución, acumulación y recirculación (UNE-EN 15316-3 y 15316-5) y no da ninguna cifra. Mientras tanto la energía es provisional: se toma un ${pct(Number(a.datos.perdidas_pct ?? CRITERIOS_HE4.datos.perdidasSinRecirculacion_pct))} de la demanda útil (${a.datos.centralizada ? "con recirculación" : "sin recirculación"}, hipótesis sin fuente normativa). No cambia el porcentaje renovable.`,
      };
    case "agua-fria":
      return {
        titulo: "El agua fría corregida baja de 2 °C.",
        detalle: "Con la corrección por altitud del Anejo G, algún mes sale por debajo de 2 °C. El DB admite otras temperaturas del agua de red de fuentes de reconocida solvencia (Anejo G pto 3): compruébalas.",
      };
    case "oficinas":
      return {
        titulo: "Indica los ocupantes de las oficinas.",
        detalle: "Se supone uno por cada 10 m² útiles (la densidad de SI 3), y con ese supuesto cambia el resultado (si la sección se aplica o la contribución mínima).",
      };
    case "provincia":
      return {
        titulo: "La provincia no está en el Anejo G.",
        detalle: "Sin la temperatura del agua fría de red no se calcula la demanda energética. Revisa la provincia en Datos de la obra.",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoHe4(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  if (d.clase !== "contribucion") return null;
  if (d.scopBajo) {
    return {
      titulo: "La bomba de calor no llega al SCOPdhw mínimo.",
      detalle: `Con un SCOPdhw de ${num(d.scop)} su aportación no cuenta como renovable (ap. 3.1 pto 4): hace falta ${num(C.scopMinElectrica)} o más.`,
    };
  }
  if (d.sistema === "red" && d.renovableRed_pct === null) {
    return { titulo: "Falta la fracción renovable de la red.", detalle: "Indica qué parte de la energía de la red urbana es renovable (fep,ren / fep,tot)." };
  }
  return {
    titulo: "La contribución renovable no llega a la mínima.",
    detalle: `Con ${textoSistema(d)} se cubre un ${pct(d.renovable_pct)} renovable y se exige un ${pct(d.exigida_pct)}.`,
  };
}

export function describirDibujoHe4(j: JustificacionHe4): string {
  if (!j.aplica) return `Sección del edificio: demanda de ACS de ${ld(j.total_l_d)}.`;
  const c = buscar(j, "contribucion")!;
  return `Sección del edificio con la demanda de ACS de cada vivienda y la producción con ${NOMBRE_SISTEMA[c.sistema]}.`;
}
