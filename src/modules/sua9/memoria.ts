// =============================================================================
// DB-SUA, SUA 9 — La memoria redactada (feature-20): el texto que el proyectista
// copia a su memoria, con sus cifras y su cita. Se redacta solo a partir de la
// justificación: se revisa, no se edita. Frases de research/verificacion-sua9.md
// (D1 a D6). PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import { dim, type DetalleSua9, type JustificacionSua9 } from "./justificacion";
import {
  ASEO_ACCESIBLE,
  ASEO_CENTRO_PEQUENO,
  CABINA_CORREGIDA,
  CABINA_DB,
  ITINERARIO_ACCESIBLE,
  MECANISMOS_ACCESIBLES,
  PLAZAS_ACCESIBLES,
  PUNTO_ATENCION,
  SENALIZACION,
  VIVIENDA_ACCESIBLE,
} from "./tablas";
import { m, NOMBRE_PUERTAS, textoCabinas, textoMotivos } from "./textos";

const IT = ITINERARIO_ACCESIBLE.datos;
const MEC = MECANISMOS_ACCESIBLES.datos;
const PZ = PLAZAS_ACCESIBLES.datos;
const VA = VIVIENDA_ACCESIBLE.datos;
const AS = ASEO_ACCESIBLE.datos;
const PA = PUNTO_ATENCION.datos;
const SE = SENALIZACION.datos;

function detalle<C extends DetalleSua9["clase"]>(j: JustificacionSua9, clase: C): Extract<DetalleSua9, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleSua9, { clase: C }>) : null;
}

function m2(v: number): string {
  return fmt(v, "m²", 0);
}

function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

// ── La unifamiliar ────────────────────────────────────────────────────────────

function parrafosUnifamiliar(j: JustificacionSua9): Trozo[][] {
  const d = j.decisiones.unifamiliar;
  const ambito =
    "Conforme al DB-SUA, SUA 9 ap. 1 pto 2, dentro de los límites de las viviendas, incluidas las unifamiliares y sus zonas exteriores privativas, las condiciones de accesibilidad únicamente son exigibles en aquellas que deban ser accesibles.";
  if (d === "no") {
    return [[`${ambito} La vivienda proyectada no debe ser accesible conforme a la reglamentación aplicable, por lo que `, { v: "no le son exigibles las condiciones de la Sección SUA 9" }, "."]];
  }
  const v = detalle(j, "vivienda_accesible")!;
  return [[`${ambito} La vivienda proyectada debe ser accesible conforme a la reglamentación aplicable.`], parrafoViviendaAccesible(v)];
}

function parrafoViviendaAccesible(v: Extract<DetalleSua9, { clase: "vivienda_accesible" }>): Trozo[] {
  const sujeto = v.unifamiliar ? "La vivienda" : "Cada vivienda accesible";
  const p: Trozo[] = [];
  if (v.sr > 0) {
    p.push(
      `${sujeto} para usuarios de silla de ruedas cumple la definición del Anejo A del DB-SUA: no tiene escalones; sus pasillos y pasos tienen una anchura libre `,
      { v: `≥ ${m(VA.pasillo_m)}` },
      `, con estrechamientos puntuales ≥ ${m(IT.estrechamiento.anchura_m)} de longitud ≤ ${m(IT.estrechamiento.longitudMax_m)}; el vestíbulo, la estancia principal, los dormitorios, la cocina y al menos un baño tienen un espacio de giro de Ø ${m(VA.giro_m)} libre de obstáculos, considerando el amueblamiento; los dormitorios tienen un espacio de transferencia en un lado de la cama y de paso a los pies de la cama ≥ ${m(VA.transferenciaCama_m)}; la cocina tiene la encimera a ≤ ${VA.encimeraMax_cm} cm y un espacio libre bajo el fregadero y la cocina de ${VA.libreFregadero_cm.alto} × ${VA.libreFregadero_cm.ancho} × ${VA.libreFregadero_cm.fondo} cm como mínimo; el baño tiene espacios de transferencia lateral ≥ ${VA.transferenciaInodoroDucha_cm} cm al inodoro y a la ducha, el asiento del inodoro a ${VA.asientoInodoro_cm.min}–${VA.asientoInodoro_cm.max} cm y la ducha enrasada con pendiente ≤ ${VA.pendienteDucha_pct} %; la terraza tiene un giro de Ø ${m(VA.giroTerraza_m)} y la carpintería enrasada o con un resalto ≤ ${VA.resaltoTerrazaMax_cm} cm; las puertas cumplen las condiciones del itinerario accesible y los mecanismos son accesibles.`,
    );
    if (v.unifamiliar) p.push(" Su espacio exterior dispone de itinerarios accesibles que permiten su uso y disfrute por usuarios de silla de ruedas.");
  }
  if (v.auditiva > 0) {
    p.push(
      `${p.length > 0 ? " " : ""}${v.unifamiliar ? "La vivienda" : "Cada vivienda accesible"} para personas con discapacidad auditiva dispone de avisador luminoso y sonoro de timbre para apertura de la puerta del edificio y de la vivienda, visible desde todos los recintos de la vivienda, de sistema de bucle magnético y de vídeo-comunicador bidireccional para apertura de la puerta del edificio (Anejo A).`,
    );
  }
  return p;
}

// ── El edificio ───────────────────────────────────────────────────────────────

function parrafoExterior(j: JustificacionSua9): Trozo[] {
  const d = detalle(j, "exterior")!;
  if (d.acceso === "escalones") {
    return [
      "La entrada principal tiene escalones: ",
      { v: "no hay itinerario accesible desde la vía pública" },
      " y el desnivel debe salvarse dentro de la parcela con una rampa accesible conforme a SUA 1 ap. 4 o con un ascensor accesible (SUA 9 ap. 1.1.1).",
    ];
  }
  const como =
    d.acceso === "a_nivel"
      ? "La entrada principal está a la cota de la acera."
      : d.acceso === "rampa"
        ? "El desnivel entre la acera y la entrada principal se salva dentro de la parcela con una rampa accesible conforme a SUA 1 ap. 4."
        : "El desnivel entre la acera y la entrada principal se salva dentro de la parcela con un ascensor accesible.";
  return [
    `La parcela dispone de un `,
    { v: "itinerario accesible" },
    ` que comunica la entrada principal del edificio con la vía pública${d.piscina ? " y con las zonas comunes exteriores, como la piscina" : ""}, sin escalones, con pendiente en el sentido de la marcha ≤ ${IT.pendienteMarcha_pct} % y transversal ≤ ${IT.pendienteTransversal_pct} % (DB-SUA, SUA 9 ap. 1.1.1 y Anejo A, «Itinerario accesible»). ${como}`,
  ];
}

function parrafoAscensor(j: JustificacionSua9): Trozo[] {
  const a = detalle(j, "ascensor")!;
  const cita = a.residencial ? "SUA 9 ap. 1.1.2 pto 1" : "SUA 9 ap. 1.1.2 pto 2";
  if (a.exigido) {
    const p: Trozo[] = [`Al ${textoMotivos(a, true)}, `];
    if (!a.hay) {
      p.push("el edificio debe disponer de ", { v: "ascensor accesible" }, ` o rampa accesible que comunique las plantas que no son de ocupación nula con la planta de entrada (${cita}). El edificio no lo tiene y debe proyectarse.`);
      return p;
    }
    p.push("el edificio dispone de ", { v: "ascensor accesible" }, ` que comunica todas las plantas que no son de ocupación nula, ${a.plantas}${a.cubierta ? " y la cubierta" : ""}, con la planta de entrada (${cita}).`);
    return p;
  }
  if (a.residencial) {
    const p: Trozo[] = [
      `Desde la entrada principal accesible hay que salvar ${plural(a.plantasASalvar, "planta", "plantas")}, no más de dos, y hay ${a.viviendasSinEntrada} viviendas, no más de 12, en plantas sin entrada principal accesible, por lo que `,
      { v: "no se exige ascensor accesible" },
    ];
    if (a.hay) p.push(`; no obstante, el edificio dispone de ascensor accesible que comunica ${a.plantas} (${cita}).`);
    else p.push(`. Conforme a ${cita}, se prevé dimensional y estructuralmente su instalación, con un espacio de giro de Ø ${m(IT.giro_m)} libre de obstáculos frente a él.`);
    return p;
  }
  return [
    `Desde la entrada principal accesible hay que salvar ${plural(a.plantasASalvar, "planta", "plantas")}, no más de dos, y en las plantas sin entrada accesible hay ${m2(a.utilSinEntrada_m2)} útiles sin las zonas de ocupación nula, no más de 200 m², por lo que `,
    { v: "no se exige ascensor accesible" },
    ` (${cita})${a.hay ? "; no obstante, el edificio dispone de ascensor accesible" : ""}.`,
  ];
}

function parrafoCabina(j: JustificacionSua9): Trozo[] {
  const c = detalle(j, "cabina");
  if (!c) return [];
  const base = `El ascensor accesible cumple la norma UNE-EN 81-70, con la botonera con caracteres en Braille y en alto relieve contrastados cromáticamente, y tiene una cabina de `;
  const tablas = `la tabla de la definición «Ascensor accesible» del Anejo A, ${textoCabinas(c.minimoDb)} m con ${CABINA_DB.datos.norma}, con la tabla corregida por la ${CABINA_CORREGIDA.datos.norma} que el Ministerio declara aplicable desde el ${CABINA_CORREGIDA.datos.desde} (comentario, no reglamentario): ${textoCabinas(c.minimo)} m`;
  if (!c.cumple) {
    return [base, { v: `${dim(c.ancho_m)} × ${dim(c.fondo_m)} m` }, ` (anchura × fondo) con ${NOMBRE_PUERTAS[c.puertas]}, menor que la mínima de ${tablas}. Debe ampliarse.`];
  }
  return [base, { v: `${dim(c.ancho_m)} × ${dim(c.fondo_m)} m` }, ` (anchura × fondo) con ${NOMBRE_PUERTAS[c.puertas]}, no menor que la mínima de ${tablas}.`];
}

function parrafoPlantas(j: JustificacionSua9): Trozo[] {
  const d = detalle(j, "plantas")!;
  const inicio = d.residencial
    ? `En cada planta, un itinerario accesible comunica el ascensor accesible${d.ascensor ? "" : ", o su previsión,"} con las viviendas y con las zonas de uso comunitario${d.garaje ? ", el garaje incluido" : ""} (DB-SUA, SUA 9 ap. 1.1.3 pto 1). Los trasteros y cuartos de instalaciones son zonas de ocupación nula (DB-SI, Anejo SI A).`
    : "En cada planta, un itinerario accesible comunica el acceso a ella con las zonas de uso público, con todo origen de evacuación de las zonas de uso privado, salvo las de ocupación nula, y con los elementos accesibles (DB-SUA, SUA 9 ap. 1.1.3 pto 2).";
  const anchura = d.pasillo_m !== null ? `${m(d.pasillo_m)}` : `≥ ${m(d.minimo_m)}`;
  const p: Trozo[] = [
    `${inicio} El itinerario tiene una anchura libre de paso de `,
    { v: anchura },
    d.residencial ? ` (${m(IT.pasillo_m)} con carácter general; en las zonas comunes de los edificios de uso Residencial Vivienda se admite ${m(IT.pasilloZonasComunesVivienda_m)})` : "",
    `, estrechamientos puntuales ≥ ${m(IT.estrechamiento.anchura_m)} de longitud ≤ ${m(IT.estrechamiento.longitudMax_m)} y separados ≥ ${m(IT.estrechamiento.separacion_m)} de huecos de paso y cambios de dirección, un espacio de giro de Ø ${m(IT.giro_m)} libre de obstáculos en el vestíbulo de entrada, frente al ascensor${d.ascensor ? "" : " o al espacio previsto para él"} y al fondo de los pasillos de más de ${fmt(IT.pasilloFondoGiroMasDe_m, "m", 0)}, y puertas con una anchura libre de paso ≥ ${m(IT.puerta.pasoMarco_m)} medida en el marco y aportada por una sola hoja (≥ ${m(IT.puerta.pasoMaximaApertura_m)} en el ángulo de máxima apertura), mecanismos de apertura a ${dim(IT.puerta.mecanismo_m.min)}–${m(IT.puerta.mecanismo_m.max)} de altura y a ≥ ${m(IT.puerta.mecanismoARincon_m)} del encuentro en rincón, y un espacio libre del barrido de las hojas de Ø ${m(IT.puerta.libreBarrido_m)} a ambas caras (Anejo A, «Itinerario accesible»).`,
  ];
  if (d.pasillo_m !== null && d.pasillo_m < d.minimo_m) p.push(` La anchura indicada es menor que ${m(d.minimo_m)} y debe ampliarse.`);
  return p;
}

function parrafoViviendas(j: JustificacionSua9): Trozo[] {
  const v = detalle(j, "viviendas");
  if (!v) return [];
  if (v.sr + v.auditiva === 0) {
    return [
      "Conforme a la reglamentación aplicable, el edificio ",
      { v: "no dispone de viviendas accesibles" },
      " para usuarios de silla de ruedas ni para personas con discapacidad auditiva (DB-SUA, SUA 9 ap. 1.2.1).",
    ];
  }
  const sr = v.sr > 0 ? plural(v.sr, "vivienda accesible", "viviendas accesibles") : "ninguna vivienda accesible";
  const aud = v.auditiva > 0 ? (v.sr > 0 ? String(v.auditiva) : plural(v.auditiva, "vivienda accesible", "viviendas accesibles")) : "ninguna";
  return [
    "Conforme a la reglamentación aplicable, el edificio dispone de ",
    { v: `${sr} para usuarios de silla de ruedas` },
    " y de ",
    { v: `${aud} para personas con discapacidad auditiva` },
    " (DB-SUA, SUA 9 ap. 1.2.1).",
  ];
}

function parrafoPlazas(j: JustificacionSua9): Trozo[] {
  const p = detalle(j, "plazas");
  if (!p) return [];
  const una = p.exigidas === 1;
  const condiciones = `, ${una ? "próxima" : "próximas"} al acceso peatonal al aparcamiento y ${una ? "comunicada" : "comunicadas"} con él mediante un itinerario accesible, con un espacio de aproximación lateral ≥ ${m(PZ.aproximacionLateral_m)} si ${una ? "está" : "están"} en batería, que pueden compartir dos plazas contiguas, o trasero ≥ ${m(PZ.aproximacionTrasera_m)} si ${una ? "está" : "están"} en línea (Anejo A, «Plaza de aparcamiento accesible»)`;
  if (p.residencial) {
    if (p.sr === 0) return ["Al no haber viviendas accesibles para usuarios de silla de ruedas, ", { v: "no se exigen plazas de aparcamiento accesibles" }, " (SUA 9 ap. 1.2.3 pto 1)."];
    const r: Trozo[] = ["Se dispone una plaza de aparcamiento accesible por cada vivienda accesible para usuarios de silla de ruedas: ", { v: plural(p.exigidas, "plaza", "plazas") }, ` (SUA 9 ap. 1.2.3 pto 1)${condiciones}.`];
    if (p.exigidas > p.plazas) r.push(` El garaje tiene ${plural(p.plazas, "plaza", "plazas")}: no caben y debe revisarse.`);
    return r;
  }
  if (!p.usoAparcamiento) {
    return [`El aparcamiento propio tiene ${m2(p.construida_m2)} construidos${p.supuesta ? " (supuestos)" : ""}, no más de ${fmt(PZ.otrosUsosConstruidaMasDe_m2, "m²", 0)}, por lo que `, { v: "no se exigen plazas de aparcamiento accesibles" }, " (SUA 9 ap. 1.2.3 pto 2)."];
  }
  return [
    `El aparcamiento propio tiene ${m2(p.construida_m2)} construidos${p.supuesta ? " (supuestos)" : ""}, más de ${fmt(PZ.otrosUsosConstruidaMasDe_m2, "m²", 0)}, y ${plural(p.plazas, "plaza", "plazas")}: se dispone una plaza accesible por cada ${PZ.otros.unaCada} plazas o fracción: `,
    { v: plural(p.exigidas, "plaza accesible", "plazas accesibles") },
    ` (SUA 9 ap. 1.2.3 pto 2 c))${condiciones}.`,
  ];
}

function parrafoPiscina(j: JustificacionSua9): Trozo[] {
  const p = detalle(j, "piscina");
  if (!p) return [];
  if (!p.exige) return ["Al no haber viviendas accesibles para usuarios de silla de ruedas, a la piscina comunitaria ", { v: "no se le exige entrada accesible al vaso" }, " (SUA 9 ap. 1.2.5)."];
  return ["La piscina comunitaria dispone de alguna entrada al vaso mediante ", { v: "grúa para piscina u otro elemento adaptado" }, " (SUA 9 ap. 1.2.5)."];
}

function parrafoOficinas(j: JustificacionSua9): Trozo[] {
  const a = detalle(j, "aseos");
  if (!a) return [];
  const p: Trozo[] = [];
  if (a.excepcion) {
    p.push(
      `Las oficinas no exceden de ${fmt(ASEO_CENTRO_PEQUENO.datos.utilPrivadaMax_m2, "m²", 0)} útiles de uso privado, los trabajadores no son más de ${ASEO_CENTRO_PEQUENO.datos.trabajadoresMax} y el aseo es solo para ellos: `,
      { v: "el aseo no necesita ser accesible" },
      " (SUA 9 ap. 1.2.6, según el comentario del Ministerio «Aseo accesible en centros de trabajo pequeños», no reglamentario).",
    );
  } else {
    p.push(
      `Al ser exigibles los aseos en un lugar de trabajo (RD 486/1997), con ${plural(a.inodoros, "inodoro instalado", "inodoros instalados")} se dispone `,
      { v: plural(a.exigidos, "aseo accesible", "aseos accesibles") },
      `, uno por cada 10 inodoros o fracción (SUA 9 ap. 1.2.6), comunicado con un itinerario accesible, con un espacio de giro de Ø ${m(AS.giro_m)}, puertas abatibles hacia el exterior o correderas, espacio de transferencia lateral al inodoro ≥ ${AS.transferenciaInodoro_cm} cm y ≥ ${AS.fondoInodoro_cm} cm de fondo hasta su borde frontal, asiento a ${AS.asientoInodoro_cm.min}–${AS.asientoInodoro_cm.max} cm y lavabo sin pedestal con un espacio libre inferior de ${AS.lavaboLibre_cm.alto} × ${AS.lavaboLibre_cm.fondo} cm y la cara superior a ≤ ${AS.lavaboMax_cm} cm (Anejo A, «Servicios higiénicos accesibles»).`,
    );
  }
  if (detalle(j, "atencion")) {
    p.push(
      ` El mobiliario fijo de la zona de atención al público incluye un `,
      { v: "punto de atención accesible" },
      `, comunicado con la entrada principal mediante un itinerario accesible, con un plano de trabajo de ${m(PA.plano_m)} de anchura como mínimo, a ${m(PA.alturaMax_m)} de altura como máximo y un espacio libre inferior de ${PA.libreInferior_cm.alto} × ${PA.libreInferior_cm.ancho} × ${PA.libreInferior_cm.fondo} cm como mínimo (SUA 9 ap. 1.2.7 y Anejo A).`,
    );
  }
  return p;
}

function parrafoMecanismos(j: JustificacionSua9): Trozo[] {
  const zonas = j.residencial ? `de las zonas comunes${detalle(j, "plazas") ? " y del garaje" : ""}` : `de las oficinas${detalle(j, "plazas") ? ", del garaje" : ""} y de las zonas comunes`;
  return [
    `Los interruptores, los dispositivos de intercomunicación y los pulsadores de alarma ${zonas} son `,
    { v: "mecanismos accesibles" },
    ` (SUA 9 ap. 1.2.8): los elementos de mando y control están entre ${MEC.mando_cm.min} y ${MEC.mando_cm.max} cm de altura y las tomas de corriente o de señal entre ${MEC.tomas_cm.min} y ${MEC.tomas_cm.max} cm, a ${MEC.aRincon_cm} cm como mínimo de los encuentros en rincón; se accionan con el puño cerrado, el codo y con una mano, o son automáticos; no hay interruptores de giro y palanca, y tienen contraste cromático respecto del entorno (Anejo A, «Mecanismos accesibles»).`,
  ];
}

function parrafoSenalizacion(j: JustificacionSua9): Trozo[] {
  const s = detalle(j, "senalizacion")!;
  const ascensor = s.ascensor
    ? ` El ascensor accesible se señaliza mediante SIA, con el número de planta en Braille y arábigo en alto relieve a una altura entre ${dim(SE.brailleAscensor_m.min)} y ${m(SE.brailleAscensor_m.max)}, en la jamba derecha en sentido salida de la cabina (ap. 2.2).`
    : "";
  if (s.residencial) {
    return [
      "Todas las zonas del edificio son de uso privado (DB-SUA, Anejo A). Conforme a la ",
      { v: "tabla 2.1 de SUA 9" },
      `, se señalizan mediante SIA (${SE.sia}) la entrada y el itinerario accesibles cuando existan varias entradas o recorridos alternativos, y las plazas de aparcamiento accesibles que no estén vinculadas a un residente.${ascensor}`,
    ];
  }
  const publico = s.publico
    ? ` En la zona de atención al público, de uso público, se señalizan en todo caso las entradas, los itinerarios, las plazas y los servicios higiénicos accesibles, los servicios higiénicos de uso general, con pictogramas de sexo en alto relieve a una altura entre ${dim(SE.pictogramas_m.min)} y ${m(SE.pictogramas_m.max)}, y el itinerario hasta el punto de atención accesible.`
    : "";
  return [
    "Conforme a la ",
    { v: "tabla 2.1 de SUA 9" },
    `, en las zonas de uso privado se señalizan mediante SIA (${SE.sia}) las plazas de aparcamiento accesibles y, cuando existan varias entradas o recorridos alternativos, la entrada y el itinerario accesibles.${publico}${ascensor}`,
  ];
}

function parrafoLocal(j: JustificacionSua9): Trozo[] {
  const l = detalle(j, "local");
  if (!l) return [];
  return [
    `El local sin uso de ${l.plantas} `,
    { v: "se justificará con el proyecto de su actividad" },
    "; todo establecimiento debe disponer de al menos una entrada principal accesible desde el exterior mediante un itinerario accesible (DB-SUA, Introducción II y SUA 9 ap. 1.1.1).",
  ];
}

export function memoriaSua9(j: JustificacionSua9): MemoriaDoc {
  const va = detalle(j, "vivienda_accesible");
  const parrafos = j.unifamiliar
    ? parrafosUnifamiliar(j)
    : [
        parrafoExterior(j),
        parrafoAscensor(j),
        parrafoCabina(j),
        parrafoPlantas(j),
        parrafoViviendas(j),
        va ? parrafoViviendaAccesible(va) : [],
        parrafoPlazas(j),
        parrafoPiscina(j),
        parrafoOficinas(j),
        parrafoMecanismos(j),
        parrafoSenalizacion(j),
        parrafoLocal(j),
      ];
  return {
    titulo: "Accesibilidad",
    norma: "DB-SUA 9",
    parrafos: parrafos.filter((p) => p.length > 0),
    fuente: ["DB-SUA · SUA 9 y Anejo A (consolidado 14-jun-2022)", "comentarios del Ministerio (15-jul-2024, no reglamentarios)", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
