// =============================================================================
// REBT — La memoria redactada (feature-23): el lugar de consumo, el grado de
// electrificación de las viviendas, la carga de cada parte del edificio y la
// total (ITC-BT-10), dónde van los contadores (ITC-BT-16) y la documentación
// que pide la instalación (ITC-BT-04), con la tabla de la previsión. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { ENGINE_VERSION } from "../../lib/version";
import { lista } from "../sua/colocar";
import type { DetalleRebt, JustificacionRebt } from "./justificacion";
import { CONTADORES_REBT, CRITERIOS_REBT, GARAJES_REBT, GRADO_REBT, LOCALES_REBT, RECARGA_REBT, RESERVA_CT_REBT } from "./tablas";
import { kW, m2, NOMBRE_GRADO, num, textoDesglose, textoMotivos, textoUbicacion, W } from "./textos";

function detalle<K extends DetalleRebt["clase"]>(j: JustificacionRebt, clase: K): Extract<DetalleRebt, { clase: K }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleRebt, { clase: K }>) : null;
}

function detalles<K extends DetalleRebt["clase"]>(j: JustificacionRebt, clase: K): Extract<DetalleRebt, { clase: K }>[] {
  return j.elementos.filter((x) => x.detalle.clase === clase).map((x) => x.detalle as Extract<DetalleRebt, { clase: K }>);
}

const LUGAR = {
  unifamiliar: "una vivienda unifamiliar",
  viviendas: "un edificio destinado principalmente a viviendas",
  oficinas: "un edificio de oficinas",
} as const;

function parrafoLugar(j: JustificacionRebt): Trozo[] {
  return [
    `La previsión de cargas se realiza de acuerdo con la ITC-BT-10 del Reglamento electrotécnico para baja tensión (RD 842/2002). El lugar de consumo es ${LUGAR[j.clasificacion]} (ITC-BT-10 ap. 1)`,
    j.clasificacion === "oficinas" ? ", cuya carga no puede ser inferior a los valores del ap. 4." : ".",
    " Las potencias que siguen son las mínimas reglamentarias: si se conoce una demanda real mayor, se prevé esta.",
  ];
}

function parrafoGrado(j: JustificacionRebt): Trozo[] {
  if (j.viviendas.length === 0) return [];
  const G = GRADO_REBT.datos;
  if (j.unifamiliar) {
    const v = j.viviendas[0];
    return [
      `La vivienda, de ${m2(v.superficie_m2)} útiles, es de electrificación ${NOMBRE_GRADO[v.grado]} ${textoMotivos(v)}, con una potencia prevista de `,
      { v: W(v.potencia_W) },
      ` a ${G.tension_V} V, que se corresponde con un interruptor general automático de ${v.iga_A} A (ITC-BT-10 ap. 2.1 y 2.2; ITC-BT-25 ap. 2).`,
      ...(v.motivos.includes("recarga") ? [" Al disponer de garaje, la instalación interior incluye el circuito C13 para la recarga del vehículo eléctrico, con su interruptor diferencial exclusivo (ITC-BT-10 ap. 5.1; ITC-BT-52 ap. 3.1)."] : []),
    ];
  }
  const v0 = j.viviendas[0];
  const iguales = j.viviendas.every((v) => v.grado === v0.grado && v.motivos.join() === v0.motivos.join());
  if (iguales && j.viviendas.length > 1) {
    const n = j.viviendas.reduce((a, v) => a + v.cantidad, 0);
    return [
      `Las ${n} viviendas (${lista(j.viviendas.map((v) => `${v.cantidad} del tipo ${v.nombre}, de ${m2(v.superficie_m2)} útiles`))}) son de electrificación ${NOMBRE_GRADO[v0.grado]} ${textoMotivos(v0)}, con una potencia prevista de `,
      { v: W(v0.potencia_W) },
      ` a ${G.tension_V} V por vivienda (IGA de ${v0.iga_A} A) (ITC-BT-10 ap. 2.1 y 2.2; ITC-BT-25 ap. 2).`,
    ];
  }
  return [
    `Las viviendas son ${lista(
      j.viviendas.map(
        (v) => `${v.cantidad} del tipo ${v.nombre}, de ${m2(v.superficie_m2)} útiles, de electrificación ${NOMBRE_GRADO[v.grado]} ${textoMotivos(v)}, con ${W(v.potencia_W)} a ${G.tension_V} V (IGA de ${v.iga_A} A)`,
      ),
    )} (ITC-BT-10 ap. 2.1 y 2.2; ITC-BT-25 ap. 2).`,
  ];
}

function parrafoCargas(j: JustificacionRebt): Trozo[] {
  if (j.unifamiliar) return [];
  const p: Trozo[] = [];
  const vv = detalle(j, "viviendas");
  if (vv) {
    p.push(
      `La carga del conjunto de las ${vv.n} viviendas es la media aritmética de sus potencias previstas, ${W(vv.media_W)}, por el coeficiente de simultaneidad de la tabla 1 para ${vv.n} viviendas, ${num(vv.coeficiente, 1)}: `,
      { v: kW(vv.p_W) },
      " (ap. 3.1).",
    );
  }
  const s = detalle(j, "servicios");
  if (s) {
    const que = [
      ...(s.ascensor ? [`el ascensor (${num(s.ascensor.kW, 1)} kW${s.ascensor.kWSupuesta ? `, valor orientativo de la Guía técnica BT-10 para el tipo ${CRITERIOS_REBT.datos.ascensorHabitual}` : ""})`] : []),
      ...(s.alumbrado.length > 0 ? [`el alumbrado del portal, la escalera y los espacios comunes (${W(s.alumbrado.reduce((a, x) => a + x.W, 0))}, con los ratios orientativos de la Guía técnica BT-10)`] : []),
      ...(s.otrosIndicados && s.otros_kW > 0 ? [`los demás servicios del edificio (${num(s.otros_kW, 1)} kW)`] : []),
    ];
    p.push(` Los servicios generales suman ${que.length > 0 ? lista(que) : "nada"}, sin reducción por simultaneidad: `, { v: kW(s.p_W) }, " (ap. 3.2).");
  }
  for (const l of detalles(j, "local")) {
    p.push(
      ` ${l.uso === "oficinas" ? "Las oficinas" : "El local"} de ${l.plantas}, con ${m2(l.m2)}${l.locales > 1 ? " en cada planta" : ""}, ${l.uso === "local_sin_uso" ? "sin actividad definida, deja prevista " : "prevén "}`,
      l.minimo ? `el mínimo de ${W(LOCALES_REBT.datos.minimoLocal_W)} por local` : `${LOCALES_REBT.datos.W_m2} W/m²`,
      `: `,
      { v: kW(l.p_W) },
      ` (ap. ${j.clasificacion === "oficinas" ? "4.1" : "3.3"}).`,
    );
  }
  const g = detalle(j, "garaje");
  if (g) {
    if (g.humo) {
      p.push(
        ` El garaje, de ${m2(g.m2)}, es de uso Aparcamiento no abierto y controla el humo del incendio con ventilación mecánica (DB-SI, SI 3 ap. 8), por lo que su previsión se estudia de forma específica (ap. 3.4${j.clasificacion === "oficinas" ? ", por analogía" : ""}): `,
        { v: kW(g.p_W) },
        g.estudiada_kW !== null ? `, no inferior a ${g.W_m2} W/m².` : `, de momento con ${g.W_m2} W/m², pendiente de la potencia de los ventiladores.`,
      );
    } else {
      p.push(
        ` El garaje, de ${m2(g.m2)} y ventilación ${g.ventilacion}, prevé ${g.minimo ? `el mínimo de ${W(GARAJES_REBT.datos.minimo_W)}` : `${g.W_m2} W/m²`}: `,
        { v: kW(g.p_W) },
        ` (ap. 3.4${j.clasificacion === "oficinas" ? ", por analogía" : ""}).`,
      );
    }
  }
  const rc = detalle(j, "recarga");
  if (rc && rc.ambito === "otros") {
    p.push(
      ` Para la recarga del vehículo eléctrico se prevén las ${rc.estaciones} estaciones que se instalan por el DB-HE (HE 6 ap. 3), a ${W(rc.porEstacion_W)} cada una y con un factor de simultaneidad de 1,0: `,
      { v: kW(rc.p_W) },
      " (ITC-BT-52 ap. 4).",
    );
  } else if (rc) {
    p.push(
      ` Para la recarga del vehículo eléctrico se prevén ${W(RECARGA_REBT.datos.porPlaza_W)} por ${rc.indicadas ? `${num(rc.plazasPrevision, 2)} plazas` : `el 10 % de las ${rc.plazas} plazas construidas`} (${kW(rc.p5_W)}), con un factor de simultaneidad con el resto del edificio de ${num(rc.factor, 1)} ${rc.spl === "con_spl" ? "en esquema colectivo con sistema de protección de la línea general de alimentación (SPL)" : "sin sistema de protección de la línea general de alimentación (SPL), válido para cualquier esquema de la ITC-BT-52"}: `,
      { v: kW(rc.p_W) },
      " (ITC-BT-10 ap. 5.2; ITC-BT-52 ap. 4). La conducción de cables llega a todas las plazas (DB-HE, HE 6 ap. 3) y la centralización deja módulos de reserva (ITC-BT-52 ap. 3.2 b).",
    );
  }
  if (typeof p[0] === "string") p[0] = p[0].trimStart();
  return p;
}

function parrafoTotal(j: JustificacionRebt): Trozo[] {
  const t = detalle(j, "total")!;
  if (j.unifamiliar) {
    return [
      "La previsión de la vivienda es de ",
      { v: W(t.p_W) },
      `, la que se considera en el cálculo de la derivación individual y de la acometida (${num(t.i_A, 1)} A a ${t.trifasica ? `${CRITERIOS_REBT.datos.tensionTrifasica_V} V` : `${GRADO_REBT.datos.tension_V} V`}) (ap. 6).`,
    ];
  }
  return [
    "La carga total prevista del edificio es de ",
    { v: kW(t.p_W) },
    `, la que se considera en el cálculo de la acometida y de las instalaciones de enlace (ap. 6); a ${CRITERIOS_REBT.datos.tensionTrifasica_V} V con cos φ = ${num(CRITERIOS_REBT.datos.cosPhi, 1)} (criterio de cálculo: el REBT no fija el factor de potencia), una intensidad de ${num(t.i_A, 1)} A en la línea general de alimentación.`,
    t.p_W > RESERVA_CT_REBT.datos.masDe_kW * 1000
      ? ` Al superar ${RESERVA_CT_REBT.datos.masDe_kW} kW, en suelo urbanizado el solicitante reservará a la empresa distribuidora un local cerrado y adaptado, con fácil acceso desde la vía pública, para centro de transformación (art. 13 del REBT; RD 1048/2013, art. 26.1); la obligación decae si la distribuidora no lo usa en seis meses (art. 26.2). Se coordinará con ella.`
      : "",
  ];
}

function parrafoContadores(j: JustificacionRebt): Trozo[] {
  const c = detalle(j, "contadores")!;
  if (c.ubicacion === "cpm") {
    return ["El contador se instala en una caja de protección y medida, con los fusibles generales de protección, al tratarse de un único usuario (ITC-BT-16 ap. 2.1)."];
  }
  const C = CONTADORES_REBT.datos;
  const cumple = (!c.exigeLocal || c.cuarto !== null) && c.plantaOk;
  return [
    `Los ${c.n} contadores (${lista(c.desglose.map(textoDesglose))}) se concentran ${textoUbicacion(c)}`,
    c.cuarto ? ` situado en ${c.cuarto.plantas}` : " en la zona común de la entrada, en planta baja",
    c.exigeLocal
      ? `, obligatorio con más de ${C.localSiMasDe} contadores`
      : `, admisible con ${C.localSiMasDe} contadores o menos`,
    cumple ? " (ITC-BT-16 ap. 2.2)." : ": NO CUMPLE la ITC-BT-16 ap. 2.2.",
  ];
}

function parrafoDocumentacion(j: JustificacionRebt): Trozo[] {
  const d = detalle(j, "documentacion")!;
  const grupos = lista(d.grupos.map((g) => `grupo ${g.grupo}: ${g.motivo}`));
  if (d.soloAparcamiento) {
    return [
      `La instalación del aparcamiento precisa proyecto, redactado y firmado por técnico titulado competente (ITC-BT-04 ap. 3.1, ${grupos}); el resto del edificio no supera los límites del ap. 3.1 y se documenta con memoria técnica de diseño, salvo que la Administración pida un único proyecto.`,
    ];
  }
  return d.proyecto
    ? [`La instalación precisa proyecto, redactado y firmado por técnico titulado competente (ITC-BT-04 ap. 3.1, ${grupos}).`]
    : ["La instalación no está en ninguno de los grupos que precisan proyecto: se documenta con una memoria técnica de diseño (ITC-BT-04 ap. 4)."];
}

function tablaPrevision(j: JustificacionRebt): MemoriaDoc["tabla"] {
  const t = detalle(j, "total")!;
  const filas: string[][] = [];
  for (const v of j.viviendas) filas.push([`Vivienda ${v.nombre}`, `${v.cantidad} × ${m2(v.superficie_m2)}`, NOMBRE_GRADO[v.grado], W(v.potencia_W)]);
  const vv = detalle(j, "viviendas");
  if (vv) filas.push(["Conjunto de viviendas", `${vv.n} viviendas`, `coef. ${num(vv.coeficiente, 1)}`, W(vv.p_W)]);
  const s = detalle(j, "servicios");
  if (s) filas.push(["Servicios generales", s.ascensor ? "ascensor y zonas comunes" : "zonas comunes", "simult. 1", W(s.p_W)]);
  for (const l of detalles(j, "local")) filas.push([l.uso === "oficinas" ? `Oficinas (${l.plantas})` : `Local (${l.plantas})`, `${l.locales > 1 ? `${l.locales} × ` : ""}${m2(l.m2)}`, l.minimo ? "mínimo" : `${LOCALES_REBT.datos.W_m2} W/m²`, W(l.p_W)]);
  const g = detalle(j, "garaje");
  if (g) filas.push(["Garaje", m2(g.m2), g.minimo ? "mínimo" : `${g.W_m2} W/m²`, W(g.p_W)]);
  const rc = detalle(j, "recarga");
  if (rc) {
    filas.push(
      rc.ambito === "otros"
        ? ["Recarga del vehículo eléctrico", `${rc.estaciones} estaciones (HE 6)`, "× 1", W(rc.p_W)]
        : ["Recarga del vehículo eléctrico", `${num(rc.plazasPrevision, 2)} plazas`, `× ${num(rc.factor, 1)}`, W(rc.p_W)],
    );
  }
  filas.push([j.unifamiliar ? "Previsión de la vivienda" : "Carga total", "", "", W(t.p_W)]);
  return { cabecera: ["Concepto", "Base", "Criterio", "Potencia"], filas };
}

export function memoriaRebt(j: JustificacionRebt): MemoriaDoc {
  const fuente = ["REBT (RD 842/2002), consolidado BOE 03-09-2025", "ITC-BT-04, 10, 16, 25 y 52", "guías técnicas BT-10 y BT-52", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · ");
  const parrafos = [parrafoLugar(j), parrafoGrado(j), parrafoCargas(j), parrafoTotal(j), parrafoContadores(j), parrafoDocumentacion(j)];
  return {
    titulo: "Grado de electrificación y previsión de cargas",
    norma: "REBT ITC-BT-10",
    parrafos: parrafos.filter((x) => x.length > 0),
    tabla: tablaPrevision(j),
    fuente,
  };
}
