// =============================================================================
// DB-HS1 — La memoria redactada (feature-17): el texto que el proyectista copia
// a su memoria justificativa, con cada condición explicada en una frase. Se
// redacta solo a partir de la justificación: se revisa, no se edita. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import { formatoCota } from "../../lib/edificio/derivar";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import { CONDICIONES, codigos, type ElementoCondiciones } from "./condiciones";
import type { ImpermeabilizacionMuro, TipoMuro } from "./decisiones";
import { ESPESOR_SUELO_CRITERIO_m } from "./partes";
import type { DetalleHs1, ElementoHs1, JustificacionHs1 } from "./justificacion";
import {
  NOMBRE_KS,
  solucionCubierta,
  solucionMuro,
  textoFreatico,
  textoPendiente,
  unaSolucionSuelo,
} from "./textos";

function n0(v: number): string {
  return fmt(v, undefined, 0);
}

function n1(v: number): string {
  return fmt(v, undefined, 1);
}

/** Un párrafo por condición: «I2 — Pintura impermeabilizante…» (con el caso en que se pide). */
function condicionesEnParrafos(c: readonly string[], el: ElementoCondiciones): Trozo[][] {
  return c.map((cod) => {
    const t = CONDICIONES[el][cod];
    if (!t) return [{ v: cod }];
    return [{ v: cod }, ` — ${t.siAplica ? `${t.siAplica.charAt(0).toUpperCase()}${t.siAplica.slice(1)}: ` : ""}${t.siAplica ? t.texto.charAt(0).toLowerCase() + t.texto.slice(1) : t.texto}`];
  });
}

function det<C extends DetalleHs1["clase"]>(j: JustificacionHs1, clase: C): { el: ElementoHs1; d: Extract<DetalleHs1, { clase: C }> }[] {
  return j.elementos.flatMap((el) => (el.detalle.clase === clase ? [{ el, d: el.detalle as Extract<DetalleHs1, { clase: C }> }] : []));
}

function parrafoAmbito(): Trozo[] {
  return [
    "La sección HS 1 se aplica a los muros y los suelos en contacto con el terreno y a los cerramientos en contacto con el aire exterior: las fachadas y la cubierta. La limitación de las condensaciones se comprueba en la sección HE 1 del DB-HE.",
  ];
}

function parrafoTerreno(j: JustificacionHs1): Trozo[] {
  const t = det(j, "terreno")[0]?.d;
  if (!t) return [];
  const donde = j.partes.sotanos ? "del suelo del sótano" : "del suelo de la planta baja";
  const cara = formatoCota(t.caraInferior_m);
  const p: Trozo[] = [];
  if (t.presencia.supuesto) {
    p.push(
      `No se dispone aún del nivel freático: se supone una presencia de agua `,
      { v: "alta" },
      `, del lado de la seguridad, hasta contar con el estudio geotécnico.`,
    );
  } else if (t.freatico?.tipo === "no_detectado") {
    p.push(
      `Según el estudio geotécnico, el nivel freático ${t.freatico.reconocimiento_m !== undefined ? `no se ha detectado hasta ${n1(t.freatico.reconocimiento_m)} m de profundidad` : "no se ha detectado"}, por lo que la cara inferior ${donde} (${cara}) queda por encima de él: presencia de agua `,
      { v: "baja" },
      " (ap. 2.1.1).",
    );
  } else if (t.freatico?.tipo === "profundidad") {
    const dl = t.delta_m ?? 0;
    p.push(
      `Según el estudio geotécnico, el nivel freático (valor medio anual) está a ${textoFreatico(t.freatico)}, y la cara inferior ${donde} a ${cara}, que ${dl < 0 ? "queda por encima de él" : `queda ${fmt(dl, "m", 2)} por debajo`}: presencia de agua `,
      { v: t.presencia.valor },
      " (ap. 2.1.1).",
    );
  }
  p.push(
    ` El coeficiente de permeabilidad del terreno es ${t.ks.supuesto ? "desconocido: se toma la columna más desfavorable, " : ""}`,
    { v: NOMBRE_KS[t.ks.valor] },
    `. La cara inferior del suelo se toma ${n0(ESPESOR_SUELO_CRITERIO_m * 100)} cm por debajo de su cota terminada (criterio de proyecto).`,
  );
  return p;
}

const MURO_PLURAL: Record<TipoMuro, string> = {
  flexorresistente: "flexorresistentes",
  gravedad: "de gravedad",
  pantalla: "muros pantalla",
};

const IMPER_PLURAL: Record<ImpermeabilizacionMuro, string> = {
  exterior: "impermeabilizados por el exterior",
  interior: "impermeabilizados por el interior",
  parcialmente_estanco: "parcialmente estancos",
};

function parrafosMuro(j: JustificacionHs1): Trozo[][] {
  const m = det(j, "muro")[0];
  if (!m) return [];
  const d = m.d;
  const p: Trozo[] = [
    `Los ${m.el.nombre.toLowerCase()} son ${MURO_PLURAL[d.tipo]}, ${IMPER_PLURAL[d.imper]}. Con presencia de agua ${d.presencia} y ${NOMBRE_KS[d.ks]}, el grado de impermeabilidad mínimo exigido es `,
    { v: `${d.grado}` },
    " (tabla 2.1). ",
  ];
  if (d.condiciones === null) {
    p.push(`La tabla 2.2 no admite esta solución con ${d.motivo === "sotanos" ? `${n0(d.sotanos)} sótanos` : `grado ${d.grado}`}: debe justificarse otra de prestaciones equivalentes.`);
    return [p];
  }
  if (d.condiciones.length === 0) {
    p.push("Para esta solución la tabla 2.2 no exige ninguna condición.");
    return [p];
  }
  p.push("La solución cumple las condiciones ", { v: codigos(d.condiciones) }, " de la tabla 2.2:");
  return [p, ...condicionesEnParrafos(d.condiciones, "muro")];
}

function parrafosSuelos(j: JustificacionHs1): Trozo[][] {
  return det(j, "suelo").flatMap(({ el, d }) => {
    const p: Trozo[] = [
      `El ${el.nombre.toLowerCase()} (${fmt(d.suelo.superficie_m2, "m²", 0)}) es ${unaSolucionSuelo(d.tipo, d.intervencion)}. Con presencia de agua ${d.presencia} y ${NOMBRE_KS[d.ks]}, su grado de impermeabilidad mínimo es `,
      { v: `${d.grado}` },
      ` (tabla 2.3)${d.sinMuro ? "; al no haber muros en contacto con el terreno se usa el bloque de muros flexorresistentes o de gravedad de la tabla 2.4" : ""}. `,
    ];
    if (d.condiciones === null) {
      p.push("La tabla 2.4 no admite esta solución con ese grado: debe justificarse otra de prestaciones equivalentes.");
      return [p];
    }
    if (d.condiciones.length === 0) {
      p.push("Para esta solución la tabla 2.4 no exige ninguna condición.");
      return [p];
    }
    p.push("La solución cumple las condiciones ", { v: codigos(d.condiciones) }, " de la tabla 2.4:");
    return [p, ...condicionesEnParrafos(d.condiciones, "suelo")];
  });
}

function parrafoDrenaje(j: JustificacionHs1): Trozo[] {
  const p: Trozo[] = [];
  for (const { d } of det(j, "dren")) {
    p.push(
      `${p.length > 0 ? " " : ""}${d.donde === "muro" ? (j.partes.muro ? "El tubo drenante del arranque del muro" : "El tubo drenante de la cimentación perimetral") : "Los tubos drenantes bajo el suelo"} tiene${d.donde === "suelo" ? "n" : ""} un diámetro nominal de al menos `,
      { v: `${n0(d.dn_mm)} mm` },
      `, una pendiente entre el ${n0(d.pendienteMin_permil)} y el ${n0(d.pendienteMax_permil)} ‰ y al menos ${n0(d.orificios_cm2_m)} cm² de orificios por metro (tablas 3.1 y 3.2, grado ${d.grado}).`,
    );
  }
  for (const { d } of det(j, "canaletas")) {
    p.push(
      `${p.length > 0 ? " " : ""}Las canaletas de la cámara del muro llevan `,
      { v: `${n0(d.sumideros)} sumideros` },
      ` de Ø ≥ ${n0(d.diametroSumidero_mm)} mm, uno cada ${n0(d.m2PorSumidero)} m² de muro, con una pendiente entre el ${n0(d.pendienteMin_pct)} y el ${n0(d.pendienteMax_pct)} % (tabla 3.3).`,
    );
  }
  for (const { d } of det(j, "bombeo")) {
    const porque = d.siempre
      ? "Los pozos drenantes se vacían con"
      : d.cotaAlcantarillado_m === null
        ? "Al no conocerse aún la cota del alcantarillado, se prevé"
        : `Como el drenaje (${formatoCota(d.cotaDrenaje_m)}) queda por debajo de la acometida al alcantarillado (${formatoCota(d.cotaAlcantarillado_m)}), se dispone`;
    p.push(
      `${p.length > 0 ? " " : ""}${porque} una cámara de bombeo con `,
      { v: "dos bombas de achique" },
      ", cada una dimensionada para el caudal total de drenaje, y un volumen de cámara no menor que el de la tabla 3.4 para ese caudal.",
    );
  }
  return p;
}

function parrafosFachada(j: JustificacionHs1): Trozo[][] {
  const f = det(j, "fachada")[0]?.d;
  if (!f) return [];
  const sup = (s: boolean) => (s ? " (supuesta, del lado de la seguridad)" : "");
  const eolica =
    f.eolica.supuesto && !f.influyen.includes("eolica")
      ? "; con esa altura la zona eólica no influye"
      : `, en la zona eólica ${f.eolica.valor}${sup(f.eolica.supuesto)}`;
  const p: Trozo[] = [
    `Las fachadas tienen una altura de coronación de ${n1(f.altura_m)} m y el edificio está en la zona pluviométrica de promedios ${f.zona.valor}${sup(f.zona.supuesto)} y en un entorno ${f.entorno.valor}${f.terrenoTipo ? ` (terreno tipo ${f.terrenoTipo})` : sup(f.entorno.supuesto)}${eolica}: grado de exposición al viento ${f.exposicion} (tabla 2.6) y grado de impermeabilidad mínimo `,
    { v: `${f.grado}` },
    " (tabla 2.5). ",
    `La fachada, ${f.columna === "con_revestimiento" ? "con" : "sin"} revestimiento exterior${f.unaHoja ? " y de una sola hoja" : ""}, cumple las condiciones `,
    { v: codigos(f.condiciones) },
    " de la tabla 2.7",
    f.hojaUnicaAplicada ? " (al ser de una sola hoja, la hoja principal es de espesor alto, C2, como pide la nota de la tabla):" : ":",
  ];
  const cierre: Trozo[] = ["Cualquier condición de número mayor del mismo bloque puede sustituir a la de número menor (ap. 2.3.2)."];
  if (f.grado === 5) {
    cierre.push(
      " Con grado 5, si las carpinterías están retranqueadas, se dispone precerco y una barrera impermeable en las jambas prolongada 10 cm hacia el interior (ap. 2.3.3.6).",
    );
  }
  return [p, ...condicionesEnParrafos(f.condiciones, "fachada"), cierre];
}

function parrafoCubierta(j: JustificacionHs1): Trozo[] {
  const c = j.cubierta;
  const exigidas = c.capas.filter((x) => x.exigida);
  const segun = c.capas.filter((x) => !x.exigida);
  const pend = textoPendiente(c);
  const p: Trozo[] = [
    `La cubierta es ${solucionCubierta(c)}. Su grado de impermeabilidad es único e independiente del clima (ap. 2.4.1), y se alcanza con los elementos de 2.4.2: ${listaY(exigidas.map((x) => x.elemento.charAt(0).toLowerCase() + x.elemento.slice(1)))}.`,
  ];
  if (pend) {
    p.push(" La pendiente es ", { v: pend }, ` (${c.pendiente!.tabla.toLowerCase()}).`);
  }
  if (segun.length > 0) {
    p.push(` Además, ${listaY(segun.map((x) => `${x.elemento.charAt(0).toLowerCase() + x.elemento.slice(1)} ${x.porque}`))}.`);
  }
  if (c.tejado?.nota3) {
    p.push(" Las pendientes de la teja valen para faldones de menos de 6,5 m; para faldones mayores se toman las de UNE 136020 o UNE 127100.");
  }
  return p;
}

function parrafoResto(): Trozo[] {
  return [
    "Se cumplen además las condiciones de los puntos singulares (ap. 2.1.3, 2.2.3, 2.3.3 y 2.4.4), de los productos de construcción (ap. 4), de la ejecución (ap. 5) y de mantenimiento y conservación (ap. 6).",
  ];
}

function tablaResumen(j: JustificacionHs1): MemoriaDoc["tabla"] {
  const filas: string[][] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase === "muro") filas.push([el.nombre, String(d.grado), solucionMuro(d.tipo, d.imper), d.condiciones ? codigos(d.condiciones) : "no aceptable"]);
    if (d.clase === "suelo") filas.push([el.nombre, String(d.grado), unaSolucionSuelo(d.tipo, d.intervencion).replace(/^una? /, ""), d.condiciones ? codigos(d.condiciones) : "no aceptable"]);
    if (d.clase === "fachada") filas.push([el.nombre, String(d.grado), d.columna === "con_revestimiento" ? "con revestimiento exterior" : "sin revestimiento exterior", codigos(d.condiciones)]);
    if (d.clase === "cubierta") filas.push([el.nombre, "único", solucionCubierta(d.cubierta), textoPendiente(d.cubierta) ? `pendiente ${textoPendiente(d.cubierta)}` : "ap. 2.4.2"]);
  }
  return { cabecera: ["Elemento", "Grado", "Solución", "Condiciones"], filas };
}

export function memoriaHs1(j: JustificacionHs1): MemoriaDoc {
  const parrafos = [
    parrafoAmbito(),
    parrafoTerreno(j),
    ...parrafosMuro(j),
    ...parrafosSuelos(j),
    parrafoDrenaje(j),
    ...parrafosFachada(j),
    parrafoCubierta(j),
    parrafoResto(),
  ].filter((p) => p.length > 0);
  const tablas = ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7"];
  if (j.cubierta.pendiente) tablas.push(j.cubierta.pendiente.tabla.replace("Tabla ", ""));
  if (j.elementos.some((e) => e.detalle.clase === "dren")) tablas.push("3.1", "3.2");
  if (j.elementos.some((e) => e.detalle.clase === "canaletas")) tablas.push("3.3");
  if (j.elementos.some((e) => e.detalle.clase === "bombeo")) tablas.push("3.4");
  return {
    titulo: "Protección frente a la humedad",
    norma: "DB-HS 1",
    parrafos,
    tabla: tablaResumen(j),
    fuente: [
      "DB-HS · HS 1 (consolidado 14-06-2022)",
      `tablas ${listaY(tablas)}`,
      "datos de El edificio y de la obra",
      `motor ${ENGINE_VERSION}`,
    ].join(" · "),
  };
}
