// =============================================================================
// DB-SUA, SUA 1 — La memoria redactada (feature-20): el texto que el proyectista
// copia a su memoria, con las cifras y su cita. Frases de
// research/verificacion-sua1.md, bloque A7. Se redacta solo a partir de la
// justificación: se revisa, no se edita. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { ENGINE_VERSION } from "../../lib/version";
import type { DetalleEscalera, DetalleSua1, JustificacionSua1 } from "./justificacion";
import { SUA1_BARRERAS, SUA1_DISCONTINUIDADES, SUA1_ESCALERA_GENERAL, SUA1_RAMPAS } from "./tablas";
import { cm, escaleras, m, pct, rangoCm } from "./textos";

const G = SUA1_ESCALERA_GENERAL.datos;
const B = SUA1_BARRERAS.datos;
const RA = SUA1_RAMPAS.datos;
const D = SUA1_DISCONTINUIDADES.datos;

function detalles<C extends DetalleSua1["clase"]>(j: JustificacionSua1, clase: C): Extract<DetalleSua1, { clase: C }>[] {
  return j.elementos.flatMap((e) => (e.detalle.clase === clase ? [e.detalle as Extract<DetalleSua1, { clase: C }>] : []));
}

function parrafoUsos(j: JustificacionSua1): Trozo[] {
  const c = j.contexto;
  const p: Trozo[] = ["Se justifica la exigencia básica SUA 1 mediante la aplicación de la Sección SUA 1 del DB-SUA (texto consolidado de 14-06-2022). "];
  if (c.unifamiliar) {
    p.push("El edificio es una vivienda unifamiliar, de uso Residencial Vivienda: todas sus zonas, incluido el garaje, son interior de la vivienda, de ", { v: "uso restringido" }, " y uso privado (Anejo A).");
  } else if (c.residencial) {
    p.push(
      "El edificio es de uso Residencial Vivienda: el interior de las viviendas es de ",
      { v: "uso restringido" },
      " y las zonas comunes (portal, escalera, rellanos y garaje), de ",
      { v: "uso general" },
      "; en Residencial Vivienda todas las zonas son de uso privado (Anejo A).",
    );
    if (c.oficinas) p.push(" Las oficinas son de uso Administrativo y uso general.");
  } else {
    p.push(
      "El edificio es de uso Administrativo, de ",
      { v: "uso general" },
      c.oficinas && j.decisiones.usoPublico === "si" ? ", con zonas de uso público (atención al público y salas de visitas)" : ", sin zonas de uso público",
      "; el garaje es un aparcamiento privado (Anejo A).",
    );
  }
  return p;
}

function parrafoResbaladicidad(j: JustificacionSua1): Trozo[] {
  const c = j.contexto;
  const p: Trozo[] = [];
  if (c.residencial) {
    p.push("El uso Residencial Vivienda no figura entre los del apartado 1 de SUA 1: no se exige clase de resbaladicidad a sus suelos, ni al aparcamiento (SUA 1-1 pto 1).");
  }
  if (c.oficinas) {
    if (p.length > 0) p.push(" ");
    p.push(
      "Los suelos de las oficinas (uso Administrativo) tienen, como mínimo, ",
      { v: "clase 1" },
      " en zonas interiores secas con pendiente menor que el 6 %, ",
      { v: "clase 2" },
      " en zonas secas con pendiente igual o mayor que el 6 %, escaleras y zonas húmedas (entrada, aseos), y ",
      { v: "clase 3" },
      " en zonas húmedas con pendiente igual o mayor que el 6 % y escaleras, y en zonas exteriores (SUA 1-1, tablas 1.1 y 1.2), con Rd determinado por el ensayo del péndulo de la norma UNE 41901:2017 EX. Se excluyen las zonas de ocupación nula.",
    );
  }
  if (!c.residencial && !c.oficinas) {
    p.push("No hay zonas de los usos del apartado 1 de SUA 1: no se exige clase de resbaladicidad (SUA 1-1 pto 1).");
  }
  return p;
}

function parrafoDiscontinuidades(j: JustificacionSua1): Trozo[] {
  const c = j.contexto;
  if (c.unifamiliar) {
    return ["Al ser toda la vivienda de uso restringido, no le son de aplicación las condiciones de las discontinuidades del pavimento (SUA 1-2 pto 1)."];
  }
  const zonas = c.residencial ? (c.oficinas ? "En las zonas comunes, el garaje y las oficinas" : "En las zonas comunes y el garaje") : "En las oficinas, el vestíbulo y el garaje";
  const esc = c.residencial
    ? "Solo hay escalones aislados o dos consecutivos en el interior de las viviendas, en las zonas comunes o en el acceso al edificio, y nunca en el itinerario accesible (SUA 1-2 pto 3)."
    : "No hay escalones aislados ni dos consecutivos en zonas de circulación, salvo en el acceso o la salida del edificio y fuera del itinerario accesible (SUA 1-2 pto 3).";
  return [
    `${zonas} el pavimento no presenta juntas con resalto de más de ${D.resaltoJuntaMax_mm} mm; los elementos salientes puntuales no sobresalen más de ${D.salientePuntualMax_mm} mm y, si exceden de ${D.salienteConAngulo_mm} mm, forman con el pavimento un ángulo ≤ ${D.anguloSalienteMax_grados}º; los desniveles de hasta ${D.desnivelConPendiente_cm} cm se salvan con pendiente ≤ ${D.pendienteDesnivelMax_pct} %; y no hay huecos por los que pase una esfera de ${cm(D.esferaPerforacion_cm)} (SUA 1-2 pto 1). Las barreras que delimitan zonas de circulación miden ${D.barreraDelimitacionMin_cm} cm como mínimo (pto 2). ${c.residencial ? "No es exigible en el interior de las viviendas (uso restringido) ni en zonas exteriores." : "No es exigible en zonas exteriores."} `,
    esc,
  ];
}

function parrafoBarreras(j: JustificacionSua1): Trozo[] {
  const c = j.contexto;
  const xs = detalles(j, "barreras");
  const p: Trozo[] = [
    "Se disponen barreras de protección en los desniveles, huecos y aberturas con diferencia de cota mayor que 55 cm (SUA 1-3.1 pto 1), de altura ≥ 0,90 m donde la diferencia de cota no excede de 6 m y ≥ 1,10 m en el resto, medida desde el suelo o desde la línea de inclinación de la escalera (SUA 1-3.2.1).",
  ];
  for (const b of xs) {
    p.push(
      b.grupo === "cubierta"
        ? ` La cubierta transitable, a ${m(b.cotaMax_m)} sobre la rasante, tiene un peto o barandilla perimetral de `
        : ` En ${b.niveles.length === 1 ? "la planta" : "las plantas"} ${b.plantas}, con el suelo ${b.cotaMin_m === b.cotaMax_m ? `a ${m(b.cotaMax_m)}` : `entre ${m(b.cotaMin_m)} y ${m(b.cotaMax_m)}`} sobre la rasante, las barreras de terrazas, balcones y ventanas miden `,
      { v: m(b.altura_m) },
      ` (mínimo ${m(b.min_m)}).`,
    );
  }
  if (xs.length === 0) p.push(" El edificio no tiene plantas con el suelo a más de 55 cm sobre la rasante.");
  p.push(" Las barreras resisten la fuerza horizontal del DB SE-AE, apartado 3.2.1 (SUA 1-3.2.2).");
  if (c.residencial) {
    p.push(
      ` Al ser un edificio de uso Residencial Vivienda, las barreras, incluidas las de escaleras y rampas, no tienen puntos de apoyo entre 30 y 50 cm sobre el suelo o la línea de inclinación ni salientes horizontales de más de 15 cm de fondo entre 50 y 80 cm, y sus aberturas no dejan pasar una esfera de ${cm(B.esferaVivienda_cm, 0)}; el límite inferior de la barandilla de la escalera está a ≤ 5 cm de la línea de inclinación (SUA 1-3.2.3). No hay zonas de uso público: no es de aplicación la señalización de desniveles (SUA 1-3.1 pto 2) ni hay barreras delante de asientos fijos (SUA 1-3.2.4).`,
    );
  } else if (j.decisiones.usoPublico === "si") {
    p.push(
      ` En las zonas de uso público las barreras no tienen aberturas por las que pase una esfera de ${cm(B.esferaOtrosUsosPublico_cm, 0)} (SUA 1-3.2.3) y los desniveles de hasta 55 cm se señalizan con diferenciación visual y táctil a partir de 25 cm del borde (SUA 1-3.1 pto 2).`,
    );
  }
  if (c.cubierta !== "plana_transitable") {
    p.push(
      " La cubierta no es transitable: solo es accesible para mantenimiento, queda fuera del ámbito del DB-SUA (Introducción II) y se dota de los medios de seguridad para su conservación conforme al RD 1627/1997 y al RD 486/1997.",
    );
  }
  return p;
}

function parrafoEscalera(d: DetalleEscalera): Trozo[] {
  const plantas = d.porPlanta.map((t) => `${t.peldanos} peldaños de ${cm(t.c_cm, 2)} en ${t.etiqueta}`).join(", ");
  if (d.restringida) {
    return [
      `La escalera interior de la vivienda (${d.plantas}) es de uso restringido: anchura `,
      { v: m(d.anchura_m) },
      ` (≥ ${m(d.anchuraMin_m)}), contrahuella `,
      { v: cm(d.cMayor_cm, 2) },
      ` (≤ ${cm(d.cMax_cm, 0)}) y huella `,
      { v: cm(d.huella_cm) },
      ` (≥ 22 cm), con ${plantas}, y barandilla en sus lados abiertos de ${m(d.barandillaMin_m)} como mínimo (SUA 1-4.1).`,
    ];
  }
  const nombre = d.tipo === "comun" ? "La escalera común" : "La escalera del garaje";
  const ascensor = d.ascensor?.valor ? "con ascensor como alternativa" : "sin ascensor como alternativa";
  const uso = d.usoPublico ? "de uso general y uso público" : "de uso general y uso privado";
  return [
    `${nombre} (${d.plantas}) es ${uso}, ${ascensor}: huella H = `,
    { v: cm(d.huella_cm) },
    `, contrahuella de hasta C = `,
    { v: cm(d.cMayor_cm, 2) },
    ` (${cm(G.contrahuellaMin_cm, 0)} ≤ C ≤ ${cm(d.cMax_cm)}) y 2C + H = ${rangoCm(d.relacionMenor_cm, d.relacionMayor_cm, 1)} (${G.relacionMin_cm} ≤ 2C + H ≤ ${cm(G.relacionMax_cm, 0)}), con ${plantas}; misma contrahuella en toda la planta${d.porPlanta.length > 1 ? ` y una variación de ${cm(d.variacion_cm, 2)} entre plantas (≤ ${cm(G.variacionContrahuellaMax_cm, 0)})` : ""}. Tramos rectos, ${d.tramos} por planta, el mayor de los cuales salva `,
    { v: m(d.alturaTramoMayor_m) },
    ` (≤ ${m(d.tramoMax_m ?? 0)})${d.peldanosMinTramo === null ? "" : `, de ${d.peldanosMinTramo} peldaños como mínimo`}; ${d.tabica ? "tabicas verticales o inclinadas ≤ 15º y sin bocel" : "sin bocel"} (SUA 1-4.2.1 y 4.2.2). La anchura útil de los tramos es de `,
    { v: m(d.anchura_m) },
    ` (tabla 4.1, ${d.residencial ? "Residencial Vivienda, incluso escalera de comunicación con aparcamiento" : "casos restantes, escalera que comunica con una zona accesible"}; y la de evacuación de SI 3), medida entre paredes y barreras sin descontar el pasamanos, que vuela ≤ 12 cm; las mesetas tienen la anchura de la escalera y ${m(G.mesetaLongitudMin_m)} de longitud como mínimo, sin barrido de puertas en los cambios de dirección (SUA 1-4.2.2 y 4.2.3). La escalera salva más de 55 cm y dispone de pasamanos ${d.pasamanos === "ambos" ? `en ambos lados${d.prolongacion ? ", prolongados 30 cm en los extremos" : ""}` : "al menos en un lado"}, a una altura entre 90 y 110 cm, separado ≥ 4 cm del paramento (SUA 1-4.2.4). La barandilla del ojo${d.ojo === "estrecho" ? ", de anchura menor que 40 cm," : `, de 40 cm o más, sobre una caída de ${m(d.caida_m)},`} mide ${m(d.barandillaMin_m)} como mínimo (SUA 1-3.2.1).`,
  ];
}

function parrafoRampas(j: JustificacionSua1): Trozo[] {
  const c = j.contexto;
  const p: Trozo[] = [];
  const g = detalles(j, "rampa_garaje")[0];
  if (g) {
    if (g.peatonal) {
      p.push(
        "La rampa de vehículos del aparcamiento, prevista también para personas y no perteneciente a un itinerario accesible, tiene una pendiente de ",
        { v: pct(g.pendiente_pct) },
        ` (≤ ${pct(g.max_pct)}, SUA 1-4.3 pto 1 y 4.3.1 b) y cumple SUA 7.`,
      );
    } else {
      p.push("La rampa del garaje es solo de vehículos: el acceso peatonal se hace por la escalera, y la rampa no es un itinerario de personas a efectos de SUA 1-4.3; su pendiente se ajusta a las ordenanzas municipales.");
    }
  }
  const a = detalles(j, "rampa_acceso")[0];
  if (a) {
    if (p.length > 0) p.push(" ");
    p.push(
      "La rampa de acceso, perteneciente al itinerario accesible, tiene una pendiente del ",
      { v: pct(a.pendiente_pct) },
      ` en un tramo de ${m(a.longitud_m)} (≤ 10 % en menos de 3 m, ≤ 8 % en menos de 6 m, ≤ 6 % en el resto), transversal ≤ ${pct(RA.pendienteTransversalAccesible_pct)}, tramos ≤ ${m(a.tramoMax_m)} de anchura ≥ ${m(RA.anchuraAccesibleMin_m)}, superficies horizontales de ${m(RA.horizontalExtremosAccesible_m)} al principio y al final${a.pasamanosAmbos ? ` y pasamanos continuo en ambos lados a 90–110 y 65–75 cm${a.prolongacion ? ", prolongado 30 cm" : ""}, con zócalo de ${cm(RA.zocaloMin_cm, 0)} en los bordes libres` : ""} (SUA 1-4.3).`,
    );
  } else if (c.acceso) {
    if (p.length > 0) p.push(" ");
    p.push("La entrada principal está a la cota de la acera: no hay rampas en el itinerario de acceso.");
  }
  if (p.length > 0) p.push(" ");
  p.push("No existen pasillos escalonados de graderíos (SUA 1-4.4).");
  return p;
}

function parrafoLimpieza(j: JustificacionSua1): Trozo[] {
  const c = j.contexto;
  const l = detalles(j, "limpieza")[0];
  if (!c.residencial) return ["El apartado 5 de SUA 1 (limpieza de los acristalamientos exteriores) solo se aplica a edificios de uso Residencial Vivienda."];
  if (!l) return ["No hay acristalamientos de vidrio transparente a más de 6 m sobre la rasante exterior: no es de aplicación SUA 1-5."];
  if (l.carpinteria === "practicable") {
    return [
      `Los acristalamientos de vidrio transparente situados a más de 6 m sobre la rasante exterior (${l.plantas}) son `,
      { v: "practicables o fácilmente desmontables" },
      " y permiten su limpieza desde el interior (SUA 1-5).",
    ];
  }
  return [
    `En los acristalamientos de vidrio transparente situados a más de 6 m sobre la rasante exterior (${l.plantas}), toda su superficie exterior queda a `,
    { v: "≤ 0,85 m" },
    " de un punto del borde de la zona practicable situado a ≤ 1,30 m de altura, y los reversibles llevan un dispositivo que los bloquea en posición invertida durante la limpieza (SUA 1-5).",
  ];
}

export function memoriaSua1(j: JustificacionSua1): MemoriaDoc {
  const parrafos: Trozo[][] = [parrafoUsos(j), parrafoResbaladicidad(j), parrafoDiscontinuidades(j), parrafoBarreras(j), ...escaleras(j).map(parrafoEscalera), parrafoRampas(j), parrafoLimpieza(j)];
  if (j.contexto.locales) parrafos.push(["El local sin uso es una obra inacabada; su cumplimiento del DB-SUA se justificará en el proyecto de su actividad."]);
  const xs = escaleras(j);
  return {
    titulo: "Seguridad frente al riesgo de caídas",
    norma: "DB-SUA 1",
    parrafos: parrafos.filter((p) => p.length > 0),
    tabla:
      xs.length > 0
        ? {
            cabecera: ["Escalera", "Planta", "Altura", "Peldaños", "Contrahuella", "2C + H"],
            filas: xs.flatMap((x) =>
              x.porPlanta.map((t) => [
                x.tipo === "interior" ? "Interior" : x.tipo === "comun" ? "Común" : "Garaje",
                t.etiqueta,
                m(t.h_m),
                String(t.peldanos),
                cm(t.c_cm, 2),
                x.restringida ? "—" : cm(t.relacion_cm),
              ]),
            ),
          }
        : undefined,
    fuente: ["DB-SUA · SUA 1 (consolidado 14-jun-2022)", "ap. 1 a 5", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
