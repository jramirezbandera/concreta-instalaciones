// =============================================================================
// DB-HE 6 — La memoria redactada (feature-24): el ámbito y lo que pide el ap. 4
// (esquema de conexión, conducción con su porcentaje y el mínimo, estaciones
// instaladas y mínimas, y su tipo y potencia), con las cifras y su cita, y el
// mantenimiento del ap. 5.4. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { ENGINE_VERSION } from "../../lib/version";
import type { DetalleHe6, JustificacionHe6 } from "./justificacion";
import { AMBITO_HE6, DOTACION_HE6 } from "./tablas";
import { estaciones, kW, plazas, TEXTO_SUBESQUEMA } from "./textos";

const D = DOTACION_HE6.datos;

function detalle<C extends DetalleHe6["clase"]>(j: JustificacionHe6, clase: C): Extract<DetalleHe6, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleHe6, { clase: C }>) : null;
}

function pct(parte: number, total: number): string {
  return `${total > 0 ? Math.round((parte / total) * 100) : 0} %`;
}

function parrafoAmbito(j: JustificacionHe6): Trozo[] {
  const pz = detalle(j, "plazas")!;
  if (pz.plazas === 0) {
    return ["El edificio no cuenta con zona destinada a aparcamiento, interior ni exterior adscrita, por lo que la Sección HE 6 no es de aplicación (ap. 1)."];
  }
  const partes = [
    ...(pz.interiores > 0 ? [`${plazas(pz.interiores)} en el interior`] : []),
    ...(pz.exteriores > 0 ? [pz.parcela ? "una plaza en la parcela" : `${plazas(pz.exteriores)} exteriores adscritas al edificio`] : []),
  ].join(" y ");
  if (pz.excluido) {
    return [
      "El edificio, de uso distinto del residencial privado, cuenta con ",
      { v: plazas(pz.plazas) },
      ` de aparcamiento (${partes}), no más de ${AMBITO_HE6.datos.excluidoHastaPlazas}, por lo que queda excluido del ámbito de aplicación de la Sección HE 6 (ap. 1 pto 2 a).`,
    ];
  }
  return [
    "El edificio cuenta con una zona destinada a aparcamiento de ",
    { v: plazas(pz.plazas) },
    ` (${partes}), por lo que es de aplicación la Sección HE 6 (ap. 1). Se aplica el criterio del uso ${pz.uso === "residencial" ? "residencial privado" : "distinto del residencial privado"}${pz.uso === "residencial" ? ", uso característico del edificio (ap. 3 pto 3)" : ""}.`,
  ];
}

function parrafoEsquema(j: JustificacionHe6): Trozo[] {
  const e = detalle(j, "esquema")!;
  return [
    "a) Esquema de conexión utilizado para el dimensionado: ",
    { v: `esquema ${e.subesquema}` },
    `, ${TEXTO_SUBESQUEMA[e.subesquema]} (REBT, ITC-BT-52 ap. 3). La preinstalación permite la utilización posterior de cualquiera de los esquemas de la ITC-BT-52.`,
  ];
}

function parrafoConduccion(j: JustificacionHe6): Trozo[] {
  const c = detalle(j, "conduccion")!;
  const cumple = c.previstas >= c.exigidas;
  if (c.porC13) {
    return [
      "b) La vivienda dispone del circuito C13 de recarga del vehículo eléctrico (ITC-BT-52 ap. 3.1 e ITC-BT-25), que llega a la plaza de aparcamiento: ",
      { v: "el 100 % de las plazas" },
      " cuenta con conducción de cables, el mínimo exigido (ap. 3 pto 1).",
    ];
  }
  return [
    "b) La conducción principal parte de la centralización de contadores y discurre por las vías principales del aparcamiento, con canalizaciones hasta cada una de las plazas que cuentan con ella (ITC-BT-52 ap. 3.2 a): ",
    { v: `${plazas(c.previstas)}, el ${pct(c.previstas, c.plazas)}` },
    c.uso === "residencial"
      ? `, frente al 100 % exigido en uso residencial privado (ap. 3 pto 1)${cumple ? "." : ": NO CUMPLE."}`
      : `, frente al mínimo exigido del 20 %, ${plazas(c.exigidas)} (ap. 3 pto 2)${cumple ? "." : ": NO CUMPLE."}`,
  ];
}

function parrafoEstaciones(j: JustificacionHe6): Trozo[] {
  const e = detalle(j, "estaciones");
  if (!e) {
    return ["c) En uso residencial privado no se exige ninguna estación de recarga (ap. 3 pto 1): estaciones instaladas, ", { v: j.unifamiliar ? "la del circuito C13" : "0" }, "; mínimo, 0."];
  }
  const cumple = e.instaladas >= e.minimo;
  return [
    "c) Estaciones de recarga instaladas: ",
    { v: estaciones(e.instaladas) },
    `. El mínimo es de ${estaciones(e.minimo)}: una por cada ${e.age ? D.plazasPorEstacionAge : D.plazasPorEstacion} plazas o fracción${e.age ? " (edificio de titularidad de la Administración General del Estado)" : ""}, ${e.porPlazas}`,
    e.accesibles > 0
      ? `, y una por cada ${D.accesiblesPorEstacion} plazas accesibles (${e.accesibles}; por exceso, criterio de proyecto), ${e.porAccesibles}, que van en plazas accesibles y se computan en el total`
      : "",
    ` (ap. 3 pto 2)${cumple ? "." : ": NO CUMPLE."}`,
  ];
}

function parrafoEstacion(j: JustificacionHe6): Trozo[] | null {
  const t = detalle(j, "estacion");
  if (!t) return null;
  return [
    "d) Tipo de estación: punto de recarga tipo SAVE (sistema de alimentación específico del vehículo eléctrico), modo de carga 3, base de toma de corriente tipo 2, ",
    { v: `${t.texto}, ${kW(t.potencia_W)}` },
    " cada una (ITC-BT-52 ap. 5.4). La previsión de cargas correspondiente se justifica en el apartado del REBT (ITC-BT-10 ap. 5 e ITC-BT-52 ap. 4).",
  ];
}

const MANTENIMIENTO =
  "El plan de mantenimiento del Libro del Edificio contempla las operaciones y su periodicidad para mantener los parámetros de diseño y las prestaciones de la infraestructura de recarga de vehículos eléctricos, y en él se documentan todas las intervenciones a lo largo de su vida útil (ap. 5.4).";

export function memoriaHe6(j: JustificacionHe6): MemoriaDoc {
  const fuente = ["DB-HE · HE 6 (consolidado 14-jun-2022)", "ap. 1, 3 y 4", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · ");
  const titulo = "Dotaciones mínimas para la infraestructura de recarga de vehículos eléctricos";
  if (!j.aplica) return { titulo, norma: "DB-HE 6", parrafos: [parrafoAmbito(j)], fuente };
  const d = parrafoEstacion(j);
  return {
    titulo,
    norma: "DB-HE 6",
    parrafos: [parrafoAmbito(j), parrafoEsquema(j), parrafoConduccion(j), parrafoEstaciones(j), ...(d ? [d] : []), [MANTENIMIENTO]],
    fuente,
  };
}
