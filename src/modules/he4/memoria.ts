// =============================================================================
// DB-HE 4 — La memoria redactada (feature-22): lo que pide el ap. 4 (la demanda
// mensual con las pérdidas, la contribución renovable, la residual y la
// comprobación) con las cifras y su cita, la tabla mensual y el mantenimiento
// del ap. 5.4. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { ENGINE_VERSION } from "../../lib/version";
import { lista } from "../sua/colocar";
import type { DetalleHe4, JustificacionHe4 } from "./justificacion";
import { AMBITO_HE4, CONTRIBUCION_HE4, DEMANDA_OTROS_HE4, DEMANDA_VIVIENDA_HE4 } from "./tablas";
import { kWh, ld, num, pct, textoSistema } from "./textos";

const C = CONTRIBUCION_HE4.datos;

function detalle<K extends DetalleHe4["clase"]>(j: JustificacionHe4, clase: K): Extract<DetalleHe4, { clase: K }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleHe4, { clase: K }>) : null;
}

function parrafoDemanda(j: JustificacionHe4): Trozo[] {
  const d = detalle(j, "demanda")!;
  const o = detalle(j, "oficinas");
  const partes: string[] = [];
  if (j.viviendas.length > 0) {
    const viv = j.unifamiliar
      ? `la vivienda, de ${j.viviendas[0].dormitorios} dormitorios, cuenta ${num(j.viviendas[0].personas, 1)} personas`
      : `las viviendas son ${lista(j.viviendas.map((v) => `${v.cantidad} del tipo ${v.nombre} (${v.dormitorios} dormitorios, ${num(v.personas, 1)} personas)`))}`;
    partes.push(
      `${viv}, con ${DEMANDA_VIVIENDA_HE4.datos.litrosPersonaDia} l/día·persona a 60 °C y la ocupación mínima de la tabla a-Anejo F${d.fc < 1 ? `, y un factor de centralización de ${num(d.fc)} (tabla b-Anejo F) por la producción centralizada` : ""}`,
    );
  }
  if (o) partes.push(`las oficinas, con ${o.ocupantes} ocupantes y ${DEMANDA_OTROS_HE4.datos.oficinas_l_persona_dia} l/día·persona (tabla c-Anejo F)`);
  const p: Trozo[] = [
    `La demanda de referencia de ACS del edificio, calculada según el Anejo F (${lista(partes)}), es de `,
    { v: ld(d.total_l_d) },
  ];
  if (d.aplica) {
    p.push(
      `, superior a ${ld(AMBITO_HE4.datos.demandaMayorQue_l_d)}, por lo que es de aplicación la Sección HE 4 (ap. 1). `,
      d.total_l_d < C.reducidaSiDemandaMenorQue_l_d
        ? `Al ser inferior a ${ld(C.reducidaSiDemandaMenorQue_l_d)}, la contribución renovable mínima es del `
        : "La contribución renovable mínima es del ",
      { v: pct(d.exigida_pct) },
      " de la demanda energética anual de ACS (ap. 3.1).",
    );
  } else {
    p.push(`, que no supera ${ld(AMBITO_HE4.datos.demandaMayorQue_l_d)}, por lo que la Sección HE 4 no es de aplicación (ap. 1).`);
  }
  if (j.local) p.push(" La demanda de los locales sin uso definido se justificará con su actividad.");
  return p;
}

function parrafoEnergia(j: JustificacionHe4): Trozo[] {
  const e = detalle(j, "energia");
  if (!e) return [];
  return [
    `La demanda energética mensual de ACS, con la temperatura del agua fría de red de ${e.capital} (tabla a-Anejo G)`,
    e.az !== 0 ? `, corregida por la diferencia de altitud con la capital (${e.az > 0 ? "+" : ""}${e.az} m, Anejo G pto 2)` : "",
    `, el salto hasta 60 °C y unas pérdidas térmicas por distribución, acumulación y recirculación del ${pct(e.perdidas_pct)}${e.perdidasSupuestas ? " (estimación)" : ""}, se recoge en la tabla adjunta. La demanda energética anual es de `,
    { v: kWh(e.total_kWh) },
    " (ap. 4 a).",
  ];
}

function parrafoContribucion(j: JustificacionHe4): Trozo[] {
  const c = detalle(j, "contribucion");
  if (!c) return [];
  const cumple = c.cumple;
  const p: Trozo[] = [`El ACS se produce con ${textoSistema(c)}`];
  if (c.sistema === "bomba_calor" || c.apoyo === "bomba_calor") {
    p.push(
      `; la energía renovable de la bomba de calor se obtiene como Qusable·(1 − 1/SCOP) y su SCOPdhw, a la temperatura de preparación del ACS (no inferior a ${C.temperaturaPreparacionMin_C} °C), ${c.scopBajo ? "es inferior" : "no es inferior"} a ${num(C.scopMinElectrica)} (ap. 3.1 pto 4)`,
    );
  }
  if (c.sistema === "biomasa" || (c.sistema === "solar" && c.apoyo === "biomasa")) p.push("; la biomasa sólida cuenta con su fracción renovable fep,ren / fep,tot");
  p.push(
    ". La contribución renovable aportada es del ",
    { v: pct(c.renovable_pct) },
    c.renovable_kWh > 0 ? ` (${kWh(c.renovable_kWh)} al año)` : "",
    cumple ? `, no inferior a la mínima del ${pct(c.exigida_pct)} (ap. 4 b y d).` : `, inferior a la mínima del ${pct(c.exigida_pct)}: NO CUMPLE (ap. 4 b y d).`,
    " No se computa energía residual (ap. 4 c).",
  );
  return p;
}

const MEDIDA_Y_MANTENIMIENTO =
  "Los sistemas de medida de la energía suministrada procedente de fuentes renovables se adecuan al RITE (ap. 3.2). El plan de mantenimiento del Libro del Edificio contempla las operaciones y su periodicidad para mantener los parámetros de diseño y las prestaciones de las instalaciones de energía renovable, y en él se documentan todas las intervenciones a lo largo de su vida útil (ap. 5.4).";

function tablaMeses(j: JustificacionHe4): MemoriaDoc["tabla"] {
  const e = detalle(j, "energia");
  if (!e) return undefined;
  const r = (v: number) => Math.round(v).toLocaleString("es-ES");
  return {
    cabecera: ["Mes", "Días", "Agua fría (°C)", "Útil (kWh)", "Con pérdidas (kWh)"],
    filas: [
      ...e.meses.map((m) => [m.mes, String(m.dias), num(m.tred, 1), r(m.util_kWh), r(m.kWh)]),
      ["Año", "365", "", r(e.util_kWh), r(e.total_kWh)],
    ],
  };
}

export function memoriaHe4(j: JustificacionHe4): MemoriaDoc {
  const fuente = ["DB-HE · HE 4 (consolidado 14-jun-2022)", "ap. 1, 3 y 4, Anejos F y G", "datos de El edificio y de la obra", `motor ${ENGINE_VERSION}`].join(" · ");
  const titulo = "Contribución mínima de energía renovable para ACS";
  if (!j.aplica) return { titulo, norma: "DB-HE 4", parrafos: [parrafoDemanda(j)], fuente };
  const parrafos = [parrafoDemanda(j), parrafoEnergia(j), parrafoContribucion(j), [MEDIDA_Y_MANTENIMIENTO]];
  return { titulo, norma: "DB-HE 4", parrafos: parrafos.filter((x) => x.length > 0), tabla: tablaMeses(j), fuente };
}
