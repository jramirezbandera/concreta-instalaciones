// =============================================================================
// DB-SUA, SUA 6 — Textos (feature-20): la frase de la cabecera, «Qué entra», la
// franja de cada elemento, las etiquetas del dibujo y de la lista, los avisos y
// lo que no cumple. Funciones PURAS, en español.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import { fmt } from "../../lib/units/format";
import type { TextoSi } from "../si/definicion";
import type { ElementoSi } from "../si/tipos";
import type { Acceso, Escaleras, Vasos } from "./estado";
import type { DetalleSua6, ElementoSua6, JustificacionSua6 } from "./justificacion";
import { SUA6_ANDEN, SUA6_BARRERA, SUA6_ESCALERAS, SUA6_VASO } from "./tablas";

const V = SUA6_VASO.datos;
const E = SUA6_ESCALERAS.datos;

/** Una longitud con dos decimales: «1,20 m». */
export function m(v: number): string {
  return `${v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`;
}

/** Una distancia en metros enteros o con un decimal: «12 m», «12,5 m». */
export function metros(v: number): string {
  return fmt(v, "m", 1);
}

export const NOMBRE_ACCESO: Record<Acceso, string> = {
  barrera: "barrera de protección",
  controlado: "acceso controlado",
};

export const NOMBRE_VASOS: Record<Vasos, string> = {
  recreo: "vaso de recreo",
  infantil: "vaso infantil",
  ambos: "vaso de recreo y vaso infantil",
};

export const NOMBRE_ESCALERAS: Record<Escaleras, string> = {
  un_metro: "hasta 1 m bajo el agua",
  fondo: "hasta 30 cm del fondo",
};

function det(el: ElementoSi<unknown>): DetalleSua6 {
  return (el as ElementoSua6).detalle;
}

function trato(e: EstadoPresentacion | undefined): FilaQueEntra["estado"] {
  return e === "ko" ? "ko" : e === "rv" ? "rv" : e === "fu" ? "out" : "normal";
}

/** Lo que no cumple, en pocas palabras. */
function fallos(j: JustificacionSua6): string[] {
  return j.elementos.filter((x) => x.veredicto === "fail").map((x) => textoEtiquetaSua6(x));
}

/** «1,10–1,90 m», la profundidad de la piscina. */
function rangoProfundidad(j: JustificacionSua6): string {
  const d = j.decisiones;
  if (d.vasos === "infantil") return m(d.profInfantil_m);
  return `${m(d.profMin_m).replace(" m", "")}–${m(d.profMax_m)}`;
}

export function fraseSua6(j: JustificacionSua6): string {
  const d = j.decisiones;
  const pozos = d.pozos === "si" ? "los pozos y depósitos accesibles llevan tapa o rejilla con cierre" : "no hay pozos ni depósitos accesibles";
  if (j.motivo === "sin_piscina") return `El edificio no tiene piscina de uso colectivo y ${pozos}: no hay riesgo de ahogamiento que proteger.`;
  if (j.motivo === "unifamiliar") return `La piscina es de una vivienda unifamiliar, excluida del ámbito del ap. 1; ${pozos}.`;
  const f = fallos(j);
  if (f.length > 0) return `La piscina comunitaria no cumple: ${f.join("; ")}.`;
  const acceso = d.acceso === "barrera" ? `barrera de ${m(d.barrera_m)}` : "acceso de niños controlado";
  const anden = d.anden === "si" ? `, andén de ${m(d.anden_m)}` : "";
  const vasos =
    d.vasos === "ambos" ? `vaso de recreo de ${rangoProfundidad(j)} y vaso infantil de ${m(d.profInfantil_m)}` : `${NOMBRE_VASOS[d.vasos]} de ${rangoProfundidad(j)}`;
  return `Piscina comunitaria de uso colectivo con ${acceso}, ${vasos}${anden}: cumple SUA 6.`;
}

export function metricasSua6(j: JustificacionSua6): string {
  const d = j.decisiones;
  if (!j.aplica) return `Sin piscina de uso colectivo · pozos ${d.pozos === "si" ? "con tapa" : "no hay"}`;
  const partes = [d.acceso === "barrera" ? `Barrera ${m(d.barrera_m)}` : "Acceso controlado", `prof. ${rangoProfundidad(j)}`];
  if (d.anden === "si") partes.push(`andén ${m(d.anden_m)}`);
  return partes.join(" · ");
}

export function queEntraSua6(j: JustificacionSua6, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const d = j.decisiones;
  const filas: FilaQueEntra[] = [];
  if (!j.aplica) {
    filas.push({
      id: "ambito",
      titulo: "Piscina",
      detalle: j.motivo === "sin_piscina" ? "Datos de la obra: sin piscina" : "de la vivienda unifamiliar",
      trato: "no se aplica el ap. 1",
      estado: "out",
      elementoId: "ambito",
    });
  } else {
    const prof = j.elementos.find((x) => x.id === "profundidad" || x.id === "infantil");
    filas.push({
      id: "piscina",
      titulo: "Piscina comunitaria",
      detalle: `${NOMBRE_VASOS[d.vasos]} · ${rangoProfundidad(j)}`,
      trato: "uso colectivo",
      estado: trato(prof ? estados[prof.id] : undefined),
      elementoId: prof?.id,
    });
    filas.push({
      id: "acceso",
      titulo: "Acceso al vaso",
      detalle: d.acceso === "barrera" ? `barrera de ${m(d.barrera_m)} con puerta de cierre y bloqueo` : "recinto cerrado fuera del horario de baño",
      trato: d.acceso === "barrera" ? "barrera" : "controlado",
      estado: trato(estados.acceso),
      elementoId: "acceso",
    });
    filas.push({
      id: "anden",
      titulo: "Andén",
      detalle: d.anden === "si" ? `${m(d.anden_m)} · clase 3` : "sin andén",
      trato: d.anden === "si" ? "se comprueba" : "no hay",
      estado: trato(estados.anden),
      elementoId: "anden",
    });
    if (j.elementos.some((x) => x.id === "escaleras")) {
      filas.push({
        id: "escaleras",
        titulo: "Escaleras",
        detalle: `${NOMBRE_ESCALERAS[d.escaleras]} · cada ${metros(d.separacion_m)} como mucho`,
        trato: "se comprueba",
        estado: trato(estados.escaleras),
        elementoId: "escaleras",
      });
    }
  }
  filas.push({
    id: "pozos",
    titulo: "Pozos y depósitos",
    detalle: d.pozos === "si" ? "accesibles: tapa o rejilla con cierre" : "ninguno accesible",
    trato: d.pozos === "si" ? "protegidos" : "no hay",
    estado: trato(estados.pozos),
    elementoId: "pozos",
  });
  return filas;
}

export function textoEtiquetaSua6(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ambito":
      return d.motivo === "sin_piscina" ? "sin piscina" : "piscina de la unifamiliar";
    case "acceso":
      return d.acceso === "barrera" ? `barrera ${m(d.altura_m)}` : "acceso controlado";
    case "profundidad":
      if (!d.maxCumple) return `prof. máx. ${m(d.max_m)} > 3 m`;
      if (!d.someraCumple) return "sin zona < 1,40 m";
      return `prof. ${m(d.min_m).replace(" m", "")}–${m(d.max_m)}`;
    case "infantil":
      return d.cumple ? `infantil ${m(d.max_m)}` : `infantil ${m(d.max_m)} > 0,50 m`;
    case "senalizacion":
      return d.supera ? "señales > 1,40 m" : "señales máx. y mín.";
    case "pendientes":
      return d.vasos === "infantil" ? `pend. ≤ ${V.pendienteInfantil_pct} %` : `pend. ≤ ${V.pendienteHasta140_pct} % / ${V.pendienteResto_pct} %`;
    case "fondo":
      return d.todo ? "fondo clase 3" : "clase 3 hasta 1,50 m";
    case "anden":
      if (!d.hay) return "sin andén";
      return d.cumple ? `andén ${m(d.anchura_m)}` : `andén ${m(d.anchura_m)} < 1,20 m`;
    case "escaleras":
      return d.cumple ? `escaleras a ≤ ${metros(d.separacion_m)}` : `escaleras a ${metros(d.separacion_m)} > 15 m`;
    case "pozos":
      return d.hay ? "pozos con tapa" : "sin pozos";
  }
}

export function resultadoListaSua6(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ambito":
      return d.motivo === "sin_piscina" ? "no hay piscina de uso colectivo: no se aplica el ap. 1" : "piscina de vivienda unifamiliar: excluida del ap. 1";
    case "acceso":
      return d.acceso === "barrera" ? `${m(d.altura_m)} (≥ ${m(SUA6_BARRERA.datos.alturaMin_m)}) · 0,5 kN/m · cierre y bloqueo` : "recinto cerrado fuera de uso: sin barrera en el vaso";
    case "profundidad":
      return `máxima ${m(d.max_m)} (≤ 3 m) · mínima ${m(d.min_m)} (< 1,40 m)`;
    case "infantil":
      return `${m(d.max_m)} (≤ 0,50 m)`;
    case "senalizacion":
      return `máxima ${m(d.max_m)} y mínima ${m(d.min_m)}${d.supera ? " · puntos de más de 1,40 m" : ""} · paredes y andén`;
    case "pendientes":
      if (d.vasos === "infantil") return `infantil ≤ ${V.pendienteInfantil_pct} %`;
      return `≤ ${V.pendienteHasta140_pct} % hasta 1,40 m · ≤ ${V.pendienteResto_pct} % en el resto${d.vasos === "ambos" ? ` · infantil ≤ ${V.pendienteInfantil_pct} %` : ""}`;
    case "fondo":
      return `${d.todo ? "todo el fondo" : "hasta 1,50 m de profundidad"} de clase 3 · color claro`;
    case "anden":
      return d.hay ? `${m(d.anchura_m)} (≥ ${m(SUA6_ANDEN.datos.anchuraMin_m)}) · clase 3 · sin encharcamiento` : "sin andén: el ap. 1.3 se aplica cuando lo hay";
    case "escaleras":
      return `${NOMBRE_ESCALERAS[d.escaleras]} · separación ${metros(d.separacion_m)} (≤ 15 m)`;
    case "pozos":
      return d.hay ? "tapas o rejillas rígidas con cierre" : "ninguno accesible a personas";
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

export function franjaSua6(el: ElementoSi<unknown>, _j: JustificacionSua6, estado: EstadoPresentacion): DetalleElemento {
  const d = det(el);
  switch (d.clase) {
    case "ambito":
      return {
        clase: "Ámbito · ap. 1 pto 1",
        titulo: el.nombre,
        valor: d.motivo === "sin_piscina" ? "No hay" : "Unifamiliar",
        estado,
        manda:
          d.motivo === "sin_piscina"
            ? "La Sección se aplica a las piscinas de uso colectivo, y el edificio no tiene piscina (Datos de la obra)."
            : "Quedan excluidas las piscinas de viviendas unifamiliares, que cumplen su reglamentación específica.",
        nota: "Los pozos y depósitos (ap. 2) se declaran igualmente.",
        filas: [{ k: "Piscina", v: d.motivo === "sin_piscina" ? "no" : "de una vivienda unifamiliar" }],
        cita: "DB-SUA · SUA 6 ap. 1 pto 1",
      };
    case "acceso":
      return d.acceso === "barrera"
        ? {
            clase: "Barreras de protección · ap. 1.1",
            titulo: el.nombre,
            valor: m(d.altura_m).replace(" m", ""),
            unidad: "m",
            estado,
            manda: `El acceso de niños a la zona de baño no está controlado: barrera que impide llegar al vaso salvo por los puntos previstos, con cierre y bloqueo. Altura mínima ${m(SUA6_BARRERA.datos.alturaMin_m)}, ${fmt(SUA6_BARRERA.datos.fuerza_kN_m, "kN/m", 1)} en el borde superior y las condiciones constructivas de SUA 1 ap. 3.2.3.`,
            nota: d.cumple ? undefined : `Le faltan ${m(SUA6_BARRERA.datos.alturaMin_m - d.altura_m)} de altura.`,
            filas: [
              { k: "Altura", v: `${m(d.altura_m)} (≥ ${m(SUA6_BARRERA.datos.alturaMin_m)})` },
              { k: "Fuerza en el borde superior", v: fmt(SUA6_BARRERA.datos.fuerza_kN_m, "kN/m", 1) },
              { k: "Condiciones constructivas", v: SUA6_BARRERA.datos.constructivas },
              { k: "Puntos de acceso", v: "con sistema de cierre y bloqueo" },
            ],
            cita: "DB-SUA · SUA 6 ap. 1.1",
          }
        : {
            clase: "Acceso controlado · ap. 1.1",
            titulo: el.nombre,
            valor: "Controlado",
            estado,
            manda: "Solo las piscinas en las que el acceso de niños a la zona de baño no esté controlado necesitan barreras en torno al vaso.",
            nota: "Comentario del Ministerio, no reglamentario: el control exige elementos físicos interpuestos entre las zonas comunes de uso habitual y el vaso (puertas o recinto cerrados fuera del horario de baño).",
            filas: [{ k: "Barrera en torno al vaso", v: "no se exige" }],
            cita: "DB-SUA · SUA 6 ap. 1.1",
          };
    case "profundidad":
      return {
        clase: "Profundidad · ap. 1.2.1",
        titulo: el.nombre,
        valor: m(d.max_m).replace(" m", ""),
        unidad: "m de máxima",
        estado,
        manda: "Fuera de las piscinas infantiles, la profundidad máxima es de 3 m y tiene que haber zonas de profundidad menor que 1,40 m.",
        nota: !d.maxCumple ? "La profundidad máxima pasa de 3 m." : !d.someraCumple ? "No hay ninguna zona de menos de 1,40 m de profundidad." : undefined,
        filas: [
          { k: "Máxima", v: `${m(d.max_m)} (≤ ${m(V.restoMax_m)})` },
          { k: "Mínima", v: `${m(d.min_m)} (< ${m(V.zonaSomeraMenorQue_m)})` },
        ],
        cita: "DB-SUA · SUA 6 ap. 1.2.1",
      };
    case "infantil":
      return {
        clase: "Piscina infantil · ap. 1.2.1",
        titulo: el.nombre,
        valor: m(d.max_m).replace(" m", ""),
        unidad: "m",
        estado,
        manda: `En las piscinas infantiles la profundidad es de ${m(V.infantilMax_m)} como máximo.`,
        nota: d.cumple ? undefined : "Pasa de 0,50 m: o se reduce, o el vaso no es infantil.",
        filas: [{ k: "Profundidad máxima", v: `${m(d.max_m)} (≤ ${m(V.infantilMax_m)})` }],
        cita: "DB-SUA · SUA 6 ap. 1.2.1",
      };
    case "senalizacion":
      return {
        clase: "Señalización · ap. 1.2.1",
        titulo: el.nombre,
        valor: d.supera ? "Más de 1,40 m" : "Máx. y mín.",
        estado,
        manda: "Se señalizan los puntos donde se supera la profundidad de 1,40 m y el valor de la máxima y la mínima en sus puntos, con rótulos al menos en las paredes del vaso y en el andén, visibles desde dentro y desde fuera del vaso.",
        filas: [
          { k: "Máxima", v: m(d.max_m) },
          { k: "Mínima", v: m(d.min_m) },
          { k: "Puntos de más de 1,40 m", v: d.supera ? "sí: se señalizan" : "no hay" },
        ],
        cita: "DB-SUA · SUA 6 ap. 1.2.1",
      };
    case "pendientes":
      return {
        clase: "Pendientes · ap. 1.2.2",
        titulo: el.nombre,
        valor: d.vasos === "infantil" ? `≤ ${V.pendienteInfantil_pct} %` : `≤ ${V.pendienteHasta140_pct} %`,
        unidad: d.vasos === "infantil" ? undefined : `hasta 1,40 m · ≤ ${V.pendienteResto_pct} % en el resto`,
        estado,
        manda: "Pendientes máximas del fondo: 6 % en las piscinas infantiles; en las de recreo o polivalentes, 10 % hasta 1,40 m de profundidad y 35 % en el resto. Se proyectan dentro de ellas.",
        filas: [
          ...(d.vasos !== "infantil"
            ? [
                { k: "Recreo, hasta 1,40 m", v: `≤ ${V.pendienteHasta140_pct} %` },
                { k: "Recreo, resto", v: `≤ ${V.pendienteResto_pct} %` },
              ]
            : []),
          ...(d.vasos !== "recreo" ? [{ k: "Infantil", v: `≤ ${V.pendienteInfantil_pct} %` }] : []),
        ],
        cita: "DB-SUA · SUA 6 ap. 1.2.2",
      };
    case "fondo":
      return {
        clase: "Materiales · ap. 1.2.4",
        titulo: el.nombre,
        valor: `Clase ${V.claseFondo}`,
        unidad: d.todo ? "todo el fondo" : "hasta 1,50 m",
        estado,
        manda: "En las zonas cuya profundidad no excede de 1,50 m el fondo es de clase 3 de resbaladicidad (SUA 1), y el revestimiento interior del vaso es de color claro.",
        filas: [
          { k: "Profundidad máxima", v: m(d.max_m) },
          { k: "Fondo de clase 3", v: d.todo ? "todo" : "hasta 1,50 m de profundidad" },
          { k: "Revestimiento", v: "color claro" },
        ],
        cita: "DB-SUA · SUA 6 ap. 1.2.4",
      };
    case "anden":
      return d.hay
        ? {
            clase: "Andenes · ap. 1.3",
            titulo: el.nombre,
            valor: m(d.anchura_m).replace(" m", ""),
            unidad: "m",
            estado,
            manda: `El andén o playa que circunda el vaso tiene ${m(SUA6_ANDEN.datos.anchuraMin_m)} de anchura como mínimo, suelo de clase 3 y una construcción que evita el encharcamiento.`,
            nota: d.cumple ? undefined : `Le faltan ${m(SUA6_ANDEN.datos.anchuraMin_m - d.anchura_m)} de anchura.`,
            filas: [
              { k: "Anchura", v: `${m(d.anchura_m)} (≥ ${m(SUA6_ANDEN.datos.anchuraMin_m)})` },
              { k: "Suelo", v: "clase 3" },
            ],
            cita: "DB-SUA · SUA 6 ap. 1.3",
          }
        : {
            clase: "Andenes · ap. 1.3",
            titulo: el.nombre,
            valor: "No hay",
            estado,
            manda: "El apartado regula el andén cuando existe, pero no obliga a que lo haya (comentario del Ministerio, no reglamentario).",
            filas: [{ k: "Andén", v: "no" }],
            cita: "DB-SUA · SUA 6 ap. 1.3",
          };
    case "escaleras":
      return {
        clase: "Escaleras · ap. 1.4",
        titulo: el.nombre,
        valor: metros(d.separacion_m).replace(" m", ""),
        unidad: "m entre escaleras",
        estado,
        manda: `Alcanzan 1 m bajo el agua, o hasta 30 cm del suelo del vaso; junto a los ángulos y en los cambios de pendiente, a no más de ${metros(E.separacionMax_m)} entre ellas. Peldaños antideslizantes, sin aristas vivas y sin sobresalir de la pared.`,
        nota: d.cumple ? undefined : "Hace falta alguna escalera más.",
        filas: [
          { k: "Llegan", v: NOMBRE_ESCALERAS[d.escaleras] },
          { k: "Separación máxima", v: `${metros(d.separacion_m)} (≤ ${metros(E.separacionMax_m)})` },
        ],
        cita: "DB-SUA · SUA 6 ap. 1.4",
      };
    case "pozos":
      return {
        clase: "Pozos y depósitos · ap. 2",
        titulo: el.nombre,
        valor: d.hay ? "Con tapa" : "No hay",
        estado,
        manda: "Los pozos, depósitos o conducciones abiertas accesibles a personas y con riesgo de ahogamiento llevan tapas o rejillas rígidas y resistentes, con cierres que impiden abrirlos al personal no autorizado.",
        filas: [{ k: "Accesibles a personas", v: d.hay ? "sí: tapa o rejilla con cierre" : "ninguno" }],
        cita: "DB-SUA · SUA 6 ap. 2",
      };
  }
}

// -----------------------------------------------------------------------------
// Avisos y lo que no cumple
// -----------------------------------------------------------------------------

export function textoAvisoSua6(a: Aviso): TextoSi {
  switch (a.id) {
    case "acceso-controlado":
      return {
        titulo: "Sin barrera: el acceso de niños tiene que estar controlado.",
        detalle:
          "Según el comentario del Ministerio (no reglamentario), con elementos físicos entre las zonas comunes de uso habitual y el vaso: las puertas del edificio al entorno de la piscina, o todo el recinto, cerrados fuera del horario de baño. Compruébalo en planta.",
      };
    default:
      return { titulo: "Revisa este punto.", detalle: "" };
  }
}

export function textoIncumplimientoSua6(el: ElementoSi<unknown>): TextoSi | null {
  if (el.veredicto !== "fail") return null;
  const d = det(el);
  switch (d.clase) {
    case "acceso":
      return { titulo: "La barrera es demasiado baja.", detalle: `Mide ${m(d.altura_m)} y tiene que tener ${m(SUA6_BARRERA.datos.alturaMin_m)} como mínimo.` };
    case "profundidad":
      return !d.maxCumple
        ? { titulo: "El vaso es demasiado profundo.", detalle: `Su profundidad máxima es ${m(d.max_m)} y no puede pasar de 3 m.` }
        : { titulo: "Falta una zona de poca profundidad.", detalle: `La mínima es ${m(d.min_m)} y tiene que haber zonas de menos de 1,40 m.` };
    case "infantil":
      return { titulo: "El vaso infantil es demasiado profundo.", detalle: `Tiene ${m(d.max_m)} y no puede pasar de 0,50 m.` };
    case "anden":
      return { titulo: "El andén es demasiado estrecho.", detalle: `Tiene ${m(d.anchura_m)} y tiene que tener ${m(SUA6_ANDEN.datos.anchuraMin_m)} como mínimo.` };
    case "escaleras":
      return { titulo: "Las escaleras están demasiado separadas.", detalle: `Hay ${metros(d.separacion_m)} entre ellas y no pueden pasar de 15 m.` };
    default:
      return null;
  }
}

export function describirDibujoSua6(j: JustificacionSua6): string {
  const d = j.decisiones;
  if (!j.aplica) return "Sección del edificio: no hay piscina de uso colectivo.";
  return `Sección del edificio con el vaso de la piscina al lado, sobre el terreno: ${NOMBRE_VASOS[d.vasos]} de ${rangoProfundidad(j)} de profundidad${d.anden === "si" ? `, andén de ${m(d.anden_m)}` : ""}${d.acceso === "barrera" ? ` y barrera de ${m(d.barrera_m)}` : ""}.`;
}

/** Las piezas de la fila de La obra. */
export function piezasSua6(j: JustificacionSua6): { texto: string; acento: boolean }[] {
  const d = j.decisiones;
  if (!j.aplica) return [{ texto: j.motivo === "sin_piscina" ? "sin piscina" : "piscina unifamiliar", acento: false }];
  return [
    { texto: d.acceso === "barrera" ? `barrera ${m(d.barrera_m)}` : "acceso controlado", acento: false },
    { texto: `prof. ${rangoProfundidad(j)}`, acento: j.veredicto === "fail" },
  ];
}

/** El límite de cada elemento para la tabla de verificación de la ficha. */
export function limiteSua6(el: ElementoSi<unknown>): string {
  const d = det(el);
  switch (d.clase) {
    case "ambito":
      return "piscinas de uso colectivo";
    case "acceso":
      return d.acceso === "barrera" ? `≥ ${m(SUA6_BARRERA.datos.alturaMin_m)} · 0,5 kN/m` : "acceso controlado";
    case "profundidad":
      return "≤ 3 m · zona < 1,40 m";
    case "infantil":
      return "≤ 0,50 m";
    case "senalizacion":
      return "> 1,40 m, máxima y mínima";
    case "pendientes":
      return d.vasos === "infantil" ? "≤ 6 %" : "≤ 10 % hasta 1,40 m · ≤ 35 %";
    case "fondo":
      return "clase 3 hasta 1,50 m";
    case "anden":
      return d.hay ? "≥ 1,20 m · clase 3" : "solo si lo hay";
    case "escaleras":
      return "≤ 15 m · 1 m o 30 cm del fondo";
    case "pozos":
      return "tapa o rejilla con cierre";
  }
}
