import type {
  Alcance,
  Aplicabilidad,
  ElementoEnvolvente,
  ElementoInterior,
  JustificacionKey,
  TipoObraExistente,
} from "./tipos";
import type { AlcanceEdificio } from "./alcance";

// Reglas de aplicabilidad en edificios existentes (feature-27, paso 2).
// Lib PURA. Para cada justificación y cada tipo de obra, la propuesta del bloque D
// de research/verificacion-reformas.md con su párrafo de memoria y su cita. Con
// varios tipos a la vez gana el más exigente (K-REF.1). Lo que el asistente no ha
// respondido se queda en la propuesta más prudente: «aplica a lo intervenido».
// La herramienta propone con cita; el proyectista dispone (UX-RECONCEPT §5).

/** Un tipo de obra tal como lo leen las reglas: el cambio de uso, partido en dos. */
export type CasoObra = "reforma" | "ampliacion" | "cambio_uso_parcial" | "cambio_uso_caracteristico";

/** Lo que leen las reglas. */
export interface ContextoExistente {
  alcance: Alcance;
  edificio: AlcanceEdificio;
  /** Superficie construida del edificio [m²] (HE 5). */
  superficieConstruida_m2?: number;
}

/** Propuesta de una regla. */
export interface PropuestaExistente {
  aplicabilidad: Aplicabilidad;
  nota: string;
  cita: string;
}

/** Los casos de la obra: el cambio de uso es característico o parcial (P3a). */
export function casosDeObra(tipos: readonly TipoObraExistente[], alcance: Alcance): CasoObra[] {
  return tipos.map((t) =>
    t === "cambio_uso" ? (alcance.cambioUsoCaracteristico ? "cambio_uso_caracteristico" : "cambio_uso_parcial") : t,
  );
}

// ─── Citas y frases comunes ──────────────────────────────────────────────────

const CAMBIO_USO = "CTE Parte I, art. 2 (cambio de uso)";

/** Párrafo de mantenimiento (D.0.1). */
export const NOTA_MANTENIMIENTO =
  "Las obras proyectadas consisten exclusivamente en trabajos de mantenimiento y reparaciones " +
  "puntuales del edificio, sin el carácter de reforma, ampliación ni cambio de uso (CTE Parte I, " +
  "Anejo III, «Intervención en los edificios existentes» y «Mantenimiento»). No les es exigible " +
  "la aplicación del CTE.";
export const CITA_MANTENIMIENTO = "CTE Parte I, Anejo III";

/** Familia de una justificación, para la frase de no empeoramiento (D.0.2, K-REF.12). */
function familia(key: JustificacionKey): "he" | "si" | "sua" | "hs" | "hr" | "rebt" | "otro" {
  if (key === "he1" || key === "he4" || key === "he5" || key === "he6" || key === "he0he1_global") return "he";
  if (key.startsWith("si")) return "si";
  if (key.startsWith("sua")) return "sua";
  if (key.startsWith("hs")) return "hs";
  if (key === "hr") return "hr";
  if (key === "rebt") return "rebt";
  return "otro";
}

/** Frase de no empeoramiento que cierra todo «aplica a lo intervenido» (D.0.2). */
export function fraseNoEmpeoramiento(key: JustificacionKey): string | null {
  switch (familia(key)) {
    case "he":
      return "En el resto del edificio no se reducen las condiciones preexistentes relacionadas con esta exigencia (CTE Parte I, art. 2.3; DB-HE, Introducción IV, criterio 1).";
    case "si":
      return "La obra no menoscaba las condiciones de seguridad preexistentes (DB-SI, Introducción III, criterio 11).";
    case "sua":
      return "La obra no menoscaba las condiciones preexistentes de seguridad de utilización y accesibilidad (DB-SUA, Introducción III, criterio 4).";
    case "hs":
    case "hr":
      return "En el resto del edificio no se reducen las condiciones preexistentes relacionadas con esta exigencia básica (CTE Parte I, art. 2.3).";
    default:
      return null;
  }
}

/** Aviso de edificio protegido (D.0.5, K-REF.13). */
export function avisoProtegido(key: JustificacionKey): string | null {
  const f = familia(key);
  if (key === "he1" || key === "he0he1_global" || key === "he6") {
    return "El edificio está protegido oficialmente: la Sección no se aplica en la medida en que su cumplimiento altere de manera inaceptable su carácter o aspecto (ap. 1 pto 2); los elementos inalterables los fija la autoridad que dicta la protección.";
  }
  if (key === "hr") {
    return "El edificio está protegido oficialmente: si es una rehabilitación integral de un edificio catalogado y cumplir supone alterar su fachada, distribución o acabado interior de modo incompatible con su conservación, queda excluida (DB-HR, Introducción II d).";
  }
  if (f === "si" || f === "sua" || key === "he5") {
    return "El edificio está protegido oficialmente: si la aplicación plena es incompatible con su grado de protección, cabe justificar las soluciones que permiten el mayor grado posible de adecuación (CTE Parte I, art. 2.3).";
  }
  return null;
}

// ─── Lectura del alcance ─────────────────────────────────────────────────────

/** ¿Se modifica alguno de estos elementos de la envolvente? Sin responder, sí (prudente). */
function tocaEnvolvente(a: Alcance, el: readonly ElementoEnvolvente[]): boolean {
  if (a.envolvente === undefined) return true;
  return a.envolvente.some((e) => el.includes(e));
}

/** ¿Se modifica alguno de estos elementos interiores? Sin responder, sí (prudente). */
function tocaInterior(a: Alcance, el: readonly ElementoInterior[]): boolean {
  if (a.interior === undefined) return true;
  return a.interior.some((e) => el.includes(e));
}

/** HS 4/HS 5: la intervención entra si aumentan los aparatos o la instalación es nueva (K-REF.7). */
function aparatosEntran(a: Alcance): boolean {
  return a.aparatos === undefined || a.aparatos === "aumentan" || a.aparatos === "nueva";
}

function reformado(nota: string, cita: string): PropuestaExistente {
  return { aplicabilidad: "aplica_reformado", nota, cita };
}
function noAplica(nota: string, cita: string): PropuestaExistente {
  return { aplicabilidad: "no_aplica", nota, cita };
}
function aplica(nota: string, cita: string): PropuestaExistente {
  return { aplicabilidad: "aplica", nota, cita };
}

/** «Se aplica al edificio completo» en el cambio de uso característico. */
function caracteristico(nombre: string): PropuestaExistente {
  return aplica(
    `${nombre}: se aplica al edificio completo, que cambia su uso característico (CTE Parte I, art. 2, cambio de uso).`,
    CAMBIO_USO,
  );
}

// ─── DB-HS ───────────────────────────────────────────────────────────────────

const HS1 = "DB-HS 1 Protección frente a la humedad";
const HS1_ENV: ElementoEnvolvente[] = ["fachadas", "huecos", "cubiertas", "terreno", "medianerias"];

function hs1(caso: CasoObra, c: ContextoExistente): PropuestaExistente {
  const cita = "DB-HS 1, ámbito de aplicación (ap. 1.1)";
  if (caso === "cambio_uso_caracteristico") return caracteristico(HS1);
  if (caso === "ampliacion") {
    return reformado(`${HS1}: se aplica a los cerramientos y a los muros y suelos en contacto con el terreno de la parte ampliada (HS 1 ap. 1.1; CTE Parte I, art. 2.3).`, cita);
  }
  if (tocaEnvolvente(c.alcance, HS1_ENV)) {
    return reformado(`${HS1}: se aplica a los elementos objeto de la intervención en contacto con el aire exterior (fachadas y cubiertas) o con el terreno (HS 1 ap. 1.1; CTE Parte I, art. 2.3).`, cita);
  }
  return noAplica(
    `${HS1}: no es de aplicación — la intervención no actúa sobre los muros y suelos en contacto con el terreno ni sobre los cerramientos en contacto con el aire exterior (fachadas y cubiertas), que son los elementos a los que se aplica la Sección (HS 1 ap. 1.1), y sus exigencias no dependen del uso.`,
    cita,
  );
}

const HS2 = "DB-HS 2 Recogida y evacuación de residuos";

function hs2(caso: CasoObra, c: ContextoExistente): PropuestaExistente {
  const cita = "DB-HS 2, ámbito de aplicación (ap. 1.1)";
  if (caso === "cambio_uso_caracteristico" && c.edificio.pasaAVivienda) {
    // K-REF.5: por analogía, con estudio específico.
    return aplica(
      `${HS2}: el edificio cambia su uso característico a residencial vivienda, por lo que debe cumplir la exigencia básica HS 2 (CTE Parte I, art. 2, cambio de uso). Como el ámbito de la Sección se limita a la nueva construcción, la conformidad se justifica con un estudio específico que adopta los criterios de la Sección HS 2 (HS 2 ap. 1.1 pto 2).`,
      `${cita}; ${CAMBIO_USO}`,
    );
  }
  return noAplica(
    `${HS2}: no es de aplicación — el ámbito de la Sección son los edificios de viviendas de nueva construcción (HS 2 ap. 1.1 pto 1), y la obra es una intervención en un edificio existente.`,
    cita,
  );
}

const HS3 = "DB-HS 3 Calidad del aire interior";

function hs3(caso: CasoObra, c: ContextoExistente): PropuestaExistente {
  const cita = "DB-HS 3, ámbito de aplicación (ap. 1.1)";
  if (caso === "cambio_uso_caracteristico") return caracteristico(HS3);
  if (c.edificio.intervieneLocalesHs3) {
    return reformado(
      `${HS3}: se aplica a los locales del ámbito de la Sección objeto de la intervención — interior de las viviendas, trasteros y aparcamientos o garajes que se amplían, reforman o cambian de uso (HS 3 ap. 1.1; CTE Parte I, art. 2.3).`,
      cita,
    );
  }
  return noAplica(
    `${HS3}: no es de aplicación — la intervención no actúa sobre el interior de las viviendas, los almacenes de residuos, los trasteros ni los aparcamientos y garajes, que son los locales del ámbito de la Sección (HS 3 ap. 1.1).`,
    cita,
  );
}

function hs45(nombre: string, ap: string, pluviales: boolean) {
  return (caso: CasoObra, c: ContextoExistente): PropuestaExistente => {
    const cita = `${ap}, ámbito de aplicación (ap. 1.1)`;
    if (caso === "cambio_uso_caracteristico") return caracteristico(nombre);
    const a = c.alcance;
    if (aparatosEntran(a)) {
      const que =
        a.aparatos === "nueva"
          ? "la instalación, que se ejecuta nueva en su totalidad"
          : "la parte de la instalación objeto de la intervención, que amplía el número o la capacidad de los aparatos receptores existentes";
      return reformado(`${nombre}: se aplica a ${que} (${ap.replace("DB-", "")} ap. 1.1).`, cita);
    }
    if (pluviales && a.pluviales !== false) {
      return reformado(
        `${nombre}: se aplica a la red de evacuación de aguas pluviales de las cubiertas que se modifican o amplían. En la red de aguas residuales no se amplía el número ni la capacidad de los aparatos receptores (HS 5 ap. 1.1).`,
        cita,
      );
    }
    return noAplica(
      `${nombre}: no es de aplicación — la intervención en la instalación existente no amplía el número ni la capacidad de los aparatos receptores, condición con la que las ampliaciones, modificaciones, reformas o rehabilitaciones de las instalaciones existentes quedan incluidas en el ámbito de la Sección (${ap.replace("DB-", "")} ap. 1.1).`,
      cita,
    );
  };
}

const HS6 = "DB-HS 6 Protección frente a la exposición al radón";

function hs6(caso: CasoObra, c: ContextoExistente): PropuestaExistente {
  const cita = "DB-HS 6, ámbito de aplicación (ap. 1 pto 1 b)";
  if (caso === "cambio_uso_caracteristico") {
    return aplica(`${HS6}: se aplica a todo el edificio, que cambia su uso característico (HS 6 ap. 1 pto 1 b ii).`, cita);
  }
  const alternativas =
    " En intervenciones en edificios existentes se admiten las soluciones alternativas del ap. 3 pto 3 y las específicas de los ap. 3.1.1 pto 4, 3.2 pto 6 y 3.3 pto 3.";
  if (caso === "ampliacion") return reformado(`${HS6}: se aplica a la parte nueva de la ampliación (HS 6 ap. 1 pto 1 b i).${alternativas}`, cita);
  if (caso === "cambio_uso_parcial") return reformado(`${HS6}: se aplica a la zona que cambia de uso (HS 6 ap. 1 pto 1 b ii).${alternativas}`, cita);
  if (tocaEnvolvente(c.alcance, ["terreno"])) {
    return reformado(`${HS6}: se aplica a la zona afectada por la reforma, que modifica los cerramientos en contacto con el terreno (HS 6 ap. 1 pto 1 b iii).${alternativas}`, cita);
  }
  return noAplica(
    `${HS6}: no es de aplicación — en las obras de reforma la Sección se aplica a la zona afectada solo cuando se realicen modificaciones que permitan aumentar la protección frente al radón o alteren la protección inicial (HS 6 ap. 1 pto 1 b iii), y la intervención no actúa sobre los cerramientos en contacto con el terreno.`,
    cita,
  );
}

// ─── DB-SI ───────────────────────────────────────────────────────────────────

const CITA_SI = "DB-SI, Introducción III (criterios para edificios existentes)";

function si(nombre: string, enReforma: (a: Alcance) => boolean, queNoModifica: string, extra?: { ampliacion?: string; cambioParcial?: (c: ContextoExistente) => PropuestaExistente | null }) {
  return (caso: CasoObra, c: ContextoExistente): PropuestaExistente => {
    if (caso === "cambio_uso_caracteristico") return caracteristico(nombre);
    if (caso === "ampliacion") {
      return reformado(
        `${nombre}: se aplica a la parte ampliada como obra nueva, considerada parte integrante del edificio ampliado, y a los elementos de la parte existente que se modifican o que sirven de evacuación a la zona ampliada (CTE Parte I, art. 2; criterio de los comentarios del Ministerio al DB-SI, que no trae uno propio para las ampliaciones).${extra?.ampliacion ?? ""}`,
        "CTE Parte I, art. 2; comentarios del Ministerio al DB-SI, Introducción III",
      );
    }
    if (caso === "cambio_uso_parcial") {
      const propia = extra?.cambioParcial?.(c);
      if (propia) return propia;
      return reformado(
        c.edificio.viviendaEnEdificioDeViviendas
          ? `${nombre}: se aplica a la zona que se transforma en uso Residencial Vivienda; no es preciso aplicarlo a los elementos comunes de evacuación del edificio (DB-SI, Introducción III, criterio 8).`
          : `${nombre}: se aplica a la zona que cambia de uso y a los medios de evacuación que la sirven hasta el espacio exterior seguro, estén o no situados en ella (DB-SI, Introducción III, criterio 8).`,
        CITA_SI,
      );
    }
    if (enReforma(c.alcance)) {
      return reformado(
        `${nombre}: se aplica a los elementos modificados por la reforma, siempre que ello suponga una mayor adecuación a las condiciones de seguridad establecidas en el DB (DB-SI, Introducción III, criterios 9 y 10).`,
        CITA_SI,
      );
    }
    return noAplica(
      `${nombre}: no es de aplicación — en las obras de reforma en las que se mantiene el uso, el DB-SI se aplica a los elementos del edificio modificados por la reforma (DB-SI, Introducción III, criterio 9), y la intervención no modifica ${queNoModifica}.`,
      CITA_SI,
    );
  };
}

const si5NoAplica = (c: ContextoExistente): PropuestaExistente | null =>
  !tocaEnvolvente(c.alcance, ["fachadas", "huecos"]) && c.alcance.ampliacionCambiaAltura !== true
    ? noAplica(
        "SI 5 Intervención de los bomberos: no es de aplicación — el cambio de uso de una parte del edificio no modifica las fachadas, sus huecos ni la altura de evacuación, de los que dependen las condiciones de aproximación, entorno y accesibilidad por fachada (DB-SI, Introducción III, criterio 8).",
        CITA_SI,
      )
    : null;

// ─── DB-SUA ──────────────────────────────────────────────────────────────────

const CITA_SUA = "DB-SUA, Introducción III (criterios para edificios existentes)";

function sua(nombre: string, enReforma: (a: Alcance) => boolean, queNoModifica: string, itinerario = false) {
  return (caso: CasoObra, c: ContextoExistente): PropuestaExistente => {
    if (caso === "cambio_uso_caracteristico") return caracteristico(nombre);
    if (caso === "ampliacion" || caso === "cambio_uso_parcial") {
      const parte = caso === "ampliacion" ? "la parte ampliada" : "la parte del edificio que cambia de uso";
      const extra = itinerario
        ? " Cuando lo exija la Sección SUA 9, se dispone al menos un itinerario accesible que la comunica con la vía pública."
        : "";
      return reformado(`${nombre}: se aplica a ${parte} (DB-SUA, Introducción III, criterio 2).${extra}`, CITA_SUA);
    }
    if (enReforma(c.alcance)) {
      return reformado(
        `${nombre}: se aplica a los elementos modificados por la reforma, siempre que ello suponga una mayor adecuación a las condiciones del DB (DB-SUA, Introducción III, criterio 3).`,
        CITA_SUA,
      );
    }
    return noAplica(
      `${nombre}: no es de aplicación — en las obras de reforma en las que se mantiene el uso, el DB-SUA se aplica a los elementos del edificio modificados por la reforma (DB-SUA, Introducción III, criterio 3), y la intervención no modifica ${queNoModifica}.`,
      CITA_SUA,
    );
  };
}

function sua6(caso: CasoObra): PropuestaExistente {
  const nombre = "SUA 6 Seguridad frente al riesgo de ahogamiento";
  if (caso === "cambio_uso_caracteristico") return caracteristico(nombre);
  return reformado(`${nombre}: se aplica a la piscina, los pozos o los depósitos solo si son objeto de la intervención (DB-SUA, Introducción III, criterios 2 y 3).`, CITA_SUA);
}

function sua7(caso: CasoObra, c: ContextoExistente): PropuestaExistente {
  const nombre = "SUA 7 Seguridad frente al riesgo causado por vehículos en movimiento";
  if (caso === "cambio_uso_caracteristico") return caracteristico(nombre);
  if (c.alcance.aparcamiento === false) {
    return noAplica(`${nombre}: no es de aplicación — la intervención no actúa sobre el aparcamiento ni sobre sus vías de circulación (DB-SUA, Introducción III, criterios 2 y 3).`, CITA_SUA);
  }
  return reformado(`${nombre}: se aplica a la parte del aparcamiento y de sus vías de circulación objeto de la intervención (DB-SUA, Introducción III, criterios 2 y 3).`, CITA_SUA);
}

function sua8(caso: CasoObra): PropuestaExistente {
  const nombre = "SUA 8 Seguridad frente al riesgo causado por la acción del rayo";
  if (caso === "reforma") {
    // K-REF.11.
    return noAplica(
      `${nombre}: no es de aplicación — la reforma no modifica las dimensiones del edificio, su uso ni su entorno, de los que depende la evaluación de la necesidad de instalación de protección contra el rayo (DB-SUA, Introducción III, criterio 3).`,
      CITA_SUA,
    );
  }
  return aplica(
    `${nombre}: se evalúa para el edificio completo, porque la ${caso === "ampliacion" ? "ampliación modifica sus dimensiones" : "obra modifica su uso"}, de los que depende la necesidad de instalación de protección contra el rayo (DB-SUA, Introducción III, criterio 2).`,
    CITA_SUA,
  );
}

// ─── DB-HR ───────────────────────────────────────────────────────────────────

const HR = "DB-HR Protección frente al ruido";
const CITA_HR = "DB-HR, ámbito de aplicación (Introducción II d)";

function hr(caso: CasoObra, c: ContextoExistente): PropuestaExistente {
  if (caso === "cambio_uso_caracteristico") {
    return aplica(
      `${HR}: es de aplicación — el edificio cambia su uso característico, caso en el que deben cumplirse las exigencias básicas del CTE (CTE Parte I, art. 2, cambio de uso); la exclusión de la Introducción II d) del DB-HR no menciona los cambios de uso.`,
      `${CITA_HR}; ${CAMBIO_USO}`,
    );
  }
  if (c.alcance.integral === true) {
    return aplica(
      `${HR}: es de aplicación — la obra es una rehabilitación integral, en la que se modifican sustancialmente y de forma simultánea particiones, forjados y envolvente, supuesto que queda dentro del ámbito del DB-HR (Introducción II d).`,
      CITA_HR,
    );
  }
  if (caso === "cambio_uso_parcial" && (c.edificio.pasaAVivienda || c.edificio.pasaARecintoActividad)) {
    // K-REF.4.
    const a = c.edificio.pasaAVivienda ? "vivienda" : "recinto de actividad colindante con otras unidades de uso";
    return reformado(
      `${HR}: se aplica a la zona que cambia de uso a ${a}. La exclusión de la Introducción II d) del DB-HR no menciona los cambios de uso, y la Guía de aplicación del DB-HR recomienda aplicar sus exigencias en estos casos. Si alguna limitación técnica impide la adecuación completa, se adoptan las soluciones que permiten el mayor grado posible de adecuación efectiva (CTE Parte I, art. 2.3).`,
      CITA_HR,
    );
  }
  const obra = caso === "ampliacion" ? "una ampliación" : caso === "reforma" ? "una reforma" : "un cambio de uso parcial";
  const guia =
    caso === "ampliacion"
      ? " No obstante, la Guía de aplicación del DB-HR recomienda que las zonas ampliadas cumplan sus exigencias, por ser asimilables a una obra nueva."
      : "";
  return noAplica(
    `${HR}: no es de aplicación — la obra es ${obra} en un edificio existente que no constituye rehabilitación integral, y el DB-HR excluye de su ámbito las obras de ampliación, modificación, reforma o rehabilitación en los edificios existentes, salvo cuando se trate de rehabilitación integral (DB-HR, Introducción II d).${guia}`,
    CITA_HR,
  );
}

// ─── DB-HE y REBT ────────────────────────────────────────────────────────────

const HE1 = "DB-HE 1 Condiciones para el control de la demanda energética";
const CITA_HE1 = "DB-HE 1, ámbito de aplicación y ap. 3.1.1 pto 2, 3.1.3 pto 3 y 3.2 pto 2";

function he1(caso: CasoObra, c: ContextoExistente): PropuestaExistente {
  const a = c.alcance;
  if (caso === "cambio_uso_caracteristico") {
    return aplica(`${HE1}: se aplica a la envolvente térmica del edificio, que cambia su uso característico, con los valores límite correspondientes a cambios de uso (tablas 3.1.1.b/c y ap. 3.1.2).`, "DB-HE 1, ámbito de aplicación");
  }
  if (caso === "cambio_uso_parcial") {
    // K-REF.8: sin la restricción de reformas.
    return reformado(
      `${HE1}: se aplica a la envolvente térmica de las unidades de uso que cambian de uso, con los valores límite correspondientes a cambios de uso (tablas 3.1.1.b/c y ap. 3.1.2). La limitación a los elementos sustituidos o modificados del ap. 3.1.1 pto 2 es propia de las reformas.`,
      "DB-HE 1, ámbito de aplicación",
    );
  }
  if (caso === "ampliacion") {
    const k =
      a.ampliacionMas10 === false
        ? " La superficie o el volumen construido no aumentan más del 10 %: no se aplica el valor límite de K (notas de las tablas 3.1.1.b/c)."
        : a.ampliacionMas10 === true
          ? " La superficie o el volumen construido aumentan más del 10 %: se verifica también el coeficiente global K."
          : "";
    return reformado(
      `${HE1}: se aplica a la envolvente térmica de la parte ampliada; los cerramientos que separan la zona ampliada de la existente se consideran de la zona ampliada (DB-HE, Anejo A). El control solar de la parte ampliada se verifica en la justificación global (ap. 3.1.2).${k}`,
      "DB-HE 1, ámbito de aplicación",
    );
  }
  const k =
    a.envolventeMas25 === true
      ? " Se renueva más del 25 % de la superficie total de la envolvente térmica final: el coeficiente global K y el control solar se verifican en la justificación energética global (tablas 3.1.1.b/c, fila de reformas, y ap. 3.1.2); según los comentarios del Ministerio al DB-HE, K se calcula con todos los elementos de la envolvente, estén o no afectados."
      : a.envolventeMas25 === false
        ? " Se renueva el 25 % o menos de la superficie total de la envolvente térmica final, por lo que no se verifican el coeficiente global K ni el control solar."
        : "";
  if (a.envolvente === undefined || a.envolvente.length > 0 || a.pasaAcondicionado === true) {
    return reformado(
      `${HE1}: los valores límite de transmitancia se aplican a los elementos de la envolvente térmica y particiones interiores que se sustituyen, incorporan o modifican sustancialmente, y a los que ven modificadas sus condiciones con incremento de las necesidades energéticas (HE 1 ap. 3.1.1 pto 2 y 3.2 pto 2); el de permeabilidad al aire, a los huecos que se sustituyen, incorporan o modifican sustancialmente (ap. 3.1.3 pto 3).${k}`,
      CITA_HE1,
    );
  }
  return noAplica(
    `${HE1}: no es de aplicación — en las reformas los valores límite de transmitancia de la envolvente térmica y de las particiones interiores se aplican únicamente a los elementos que se sustituyen, incorporan o modifican sustancialmente, o que ven modificadas sus condiciones con incremento de las necesidades energéticas (HE 1 ap. 3.1.1 pto 2 y 3.2 pto 2), y el de permeabilidad al aire, a los huecos que se sustituyen, incorporan o modifican sustancialmente (ap. 3.1.3 pto 3); la intervención no actúa sobre la envolvente térmica ni sobre las particiones interiores ni modifica sus condiciones.${k}`,
    CITA_HE1,
  );
}

const GLOBAL = "DB-HE 0 y verificación global del HE 1";
const CITA_GLOBAL = "DB-HE 0, ámbito de aplicación; DB-HE 1, tablas 3.1.1.b/c y ap. 3.1.2";

function he0he1(caso: CasoObra, c: ContextoExistente): PropuestaExistente {
  const a = c.alcance;
  const ext = (nota: string): PropuestaExistente => ({ aplicabilidad: "externo", nota, cita: CITA_GLOBAL });
  if (caso === "cambio_uso_caracteristico" || caso === "cambio_uso_parcial") {
    const he0 = c.edificio.utilCambioUso_m2 > 50 || caso === "cambio_uso_caracteristico";
    return ext(
      `${GLOBAL}: el coeficiente global K y el control solar se verifican con los valores límite de cambios de uso (HE 1, tablas 3.1.1.b/c y ap. 3.1.2)${he0 ? ", y el consumo de energía primaria con los de HE 0, a la unidad o unidades de uso que cambian de uso (HE 0 ap. 1)" : ""}.`,
    );
  }
  if (caso === "ampliacion") {
    // El control solar se exige en toda ampliación (HE 1 ap. 3.1.2 pto 1, sin
    // umbral); el 10 % solo está en las notas de K (cotejo en imagen, feature-27).
    if (a.ampliacionMas10 === false) {
      return ext(
        `${GLOBAL}: en la parte ampliada se verifica solo el control solar (HE 1 ap. 3.1.2 pto 1). La superficie o el volumen construido no aumentan más del 10 %, por lo que no se aplican el valor límite de K (notas de las tablas 3.1.1.b/c) ni la Sección HE 0 (HE 0 ap. 1 pto 1 b).`,
      );
    }
    const he0 = c.edificio.ampliada.util_m2 > 50;
    return ext(
      `${GLOBAL}: en la parte ampliada se verifican el control solar (HE 1 ap. 3.1.2 pto 1) y, al aumentar más del 10 % la superficie o el volumen construido, el coeficiente global K (HE 1, tablas 3.1.1.b/c)${he0 ? ", y el consumo de energía primaria (HE 0), al superar la superficie útil ampliada 50 m²" : ""}.`,
    );
  }
  if (a.envolventeMas25 === false) {
    return noAplica(`${GLOBAL}: no son de aplicación — no se renueva más del 25 % de la superficie total de la envolvente térmica final, por lo que no se verifican K ni el control solar (HE 1, tablas 3.1.1.b/c y ap. 3.1.2), ni HE 0, que en reformas exige renovar a la vez la generación térmica y más del 25 % de la envolvente (HE 0 ap. 1 pto 1 b).`, CITA_GLOBAL);
  }
  const he0 = a.generacionTermica === "general";
  return ext(
    `${GLOBAL}: se renueva más del 25 % de la superficie total de la envolvente térmica final: el coeficiente global K, con todos los elementos de la envolvente, y el control solar se verifican con los valores límite de reformas (HE 1, tablas 3.1.1.b/c y ap. 3.1.2)${he0 ? "; al renovarse también la generación térmica, HE 0 se aplica al conjunto del edificio (HE 0 ap. 1)" : ""}.`,
  );
}

const HE4 = "DB-HE 4 Contribución mínima de energía renovable para cubrir la demanda de agua caliente sanitaria";
const CITA_HE4 = "DB-HE 4, ámbito de aplicación (ap. 1 pto 1 b y c)";

function he4(caso: CasoObra, c: ContextoExistente): PropuestaExistente {
  const a = c.alcance;
  const { inicial_l_d, final_l_d } = c.edificio.demandaAcs;
  if (inicial_l_d > 5000 && final_l_d > inicial_l_d * 1.5) {
    return aplica(`${HE4}: es de aplicación — la demanda inicial de ACS supera 5.000 l/día y la intervención la incrementa más del 50 %; la contribución renovable mínima se establece sobre el incremento (HE 4 ap. 1 pto 1 c y ap. 3.1 pto 2).`, CITA_HE4);
  }
  if ((caso === "cambio_uso_caracteristico" || caso === "reforma") && final_l_d <= 100) {
    return noAplica(`${HE4}: no es de aplicación — la demanda de ACS de referencia del edificio, calculada de acuerdo con el Anejo F, no supera 100 l/d (HE 4 ap. 1 pto 1 b).`, CITA_HE4);
  }
  if (caso === "cambio_uso_caracteristico") {
    return aplica(`${HE4}: es de aplicación — el edificio, con una demanda de ACS superior a 100 l/d, cambia su uso característico (HE 4 ap. 1 pto 1 b).`, CITA_HE4);
  }
  if (caso === "reforma") {
    if (a.integral === true || a.generacionTermica === "general") {
      const que = a.integral === true ? "se reforma íntegramente el edificio" : "se reforma íntegramente la instalación de generación térmica";
      return aplica(`${HE4}: es de aplicación — en el edificio, con una demanda de ACS superior a 100 l/d, ${que} (HE 4 ap. 1 pto 1 b).`, CITA_HE4);
    }
    if (a.integral === undefined || a.generacionTermica === undefined) {
      return aplica(`${HE4}: se propone su aplicación mientras no se precise si la obra reforma íntegramente el edificio o su instalación de generación térmica (HE 4 ap. 1 pto 1 b).`, CITA_HE4);
    }
  }
  const parcial =
    a.generacionTermica === "parcial"
      ? " La sustitución de generadores en solo una parte de las unidades de uso de una instalación descentralizada no supone la aplicación de la Sección."
      : "";
  return noAplica(
    `${HE4}: no es de aplicación — en edificios existentes la Sección se aplica cuando se reforma íntegramente el edificio o la instalación de generación térmica, o cuando cambia el uso característico (HE 4 ap. 1 pto 1 b), o en ampliaciones e intervenciones con demanda inicial superior a 5.000 l/día que la aumenten más del 50 % (c), y la intervención no está en ninguno de esos casos.${parcial}`,
    CITA_HE4,
  );
}

const HE5 = "DB-HE 5 Generación mínima de energía eléctrica procedente de fuentes renovables";
const CITA_HE5 = "DB-HE 5, ámbito de aplicación (ap. 1 pto 1 b y c)";

function he5(caso: CasoObra, c: ContextoExistente): PropuestaExistente {
  const a = c.alcance;
  if (caso === "ampliacion") {
    if (c.edificio.ampliada.construida_m2 > 1000) {
      return aplica(`${HE5}: es de aplicación — la ampliación incrementa la superficie construida en más de 1.000 m²; la potencia mínima se calcula sobre la superficie ampliada (HE 5 ap. 1 pto 1 b).`, CITA_HE5);
    }
    return noAplica(`${HE5}: no es de aplicación — la ampliación no incrementa la superficie construida en más de 1.000 m² (HE 5 ap. 1 pto 1 b).`, CITA_HE5);
  }
  const grande = (c.superficieConstruida_m2 ?? 0) > 1000;
  if (grande && (caso === "cambio_uso_caracteristico" || (caso === "reforma" && a.integral !== false))) {
    const que = caso === "cambio_uso_caracteristico" ? "cambia su uso característico" : a.integral === true ? "se reforma íntegramente" : "se reforma (se propone mientras no se precise si la reforma es íntegra)";
    return aplica(`${HE5}: es de aplicación — el edificio, de más de 1.000 m² construidos, ${que} (HE 5 ap. 1 pto 1 c).`, CITA_HE5);
  }
  return noAplica(
    grande
      ? `${HE5}: no es de aplicación — la intervención no es una reforma íntegra ni un cambio de uso característico del edificio (HE 5 ap. 1 pto 1 c).`
      : `${HE5}: no es de aplicación — la superficie construida del edificio, incluida la de las zonas de aparcamiento en su interior, no supera 1.000 m² (HE 5 ap. 1 pto 1 c).`,
    CITA_HE5,
  );
}

const HE6 = "DB-HE 6 Dotaciones mínimas para la infraestructura de recarga de vehículos eléctricos";
const CITA_HE6 = "DB-HE 6, ámbito de aplicación (ap. 1 pto 1 b)";

function he6(caso: CasoObra, c: ContextoExistente): PropuestaExistente {
  const a = c.alcance;
  if (caso === "cambio_uso_caracteristico") {
    return aplica(`${HE6}: es de aplicación — el edificio, con zona de aparcamiento, cambia su uso característico (HE 6 ap. 1 pto 1 b).`, CITA_HE6);
  }
  if (a.electrica50 === true) {
    return aplica(`${HE6}: es de aplicación — la intervención en la instalación eléctrica afecta a más del 50 % de la potencia instalada del edificio o del aparcamiento (HE 6 ap. 1 pto 1 b).`, CITA_HE6);
  }
  const enAparcamiento = a.aparcamiento !== false;
  if (caso === "ampliacion" && enAparcamiento && a.ampliacionMas10 !== false && c.edificio.ampliada.util_m2 > 50) {
    return aplica(`${HE6}: es de aplicación — ampliación con intervención en el aparcamiento que incrementa más del 10 % la superficie o el volumen de las unidades intervenidas, con más de 50 m² útiles ampliados (HE 6 ap. 1 pto 1 b).`, CITA_HE6);
  }
  if (caso === "reforma" && enAparcamiento && a.envolventeMas25 !== false) {
    return aplica(`${HE6}: es de aplicación — reforma con intervención en el aparcamiento que renueva más del 25 % de la superficie total de la envolvente térmica final (HE 6 ap. 1 pto 1 b).`, CITA_HE6);
  }
  return noAplica(
    `${HE6}: no es de aplicación — la intervención no está en ninguno de los supuestos de edificios existentes de la Sección: cambio de uso característico; ampliación con intervención en el aparcamiento que incremente más del 10 % la superficie o el volumen de las unidades intervenidas con más de 50 m² útiles ampliados; reforma con intervención en el aparcamiento que renueve más del 25 % de la envolvente térmica final; o intervención en la instalación eléctrica que afecte a más del 50 % de la potencia instalada del edificio o del aparcamiento (HE 6 ap. 1 pto 1 b).`,
    CITA_HE6,
  );
}

const REBT = "REBT, previsión de cargas";
const CITA_REBT = "REBT, art. 2.2";

function rebt(caso: CasoObra, c: ContextoExistente): PropuestaExistente {
  const e = c.alcance.electrica;
  if (caso === "cambio_uso_caracteristico" || e === "nueva") {
    return aplica(`${REBT}: es de aplicación — ${e === "nueva" ? "la instalación eléctrica se ejecuta nueva" : "el edificio cambia su uso característico y su instalación se adecua al nuevo uso"} (REBT, art. 2.2 a).`, CITA_REBT);
  }
  if (e === "no") {
    return noAplica(`${REBT}: no es de aplicación — la intervención no modifica, repara ni amplía la instalación eléctrica (REBT, art. 2.2).`, CITA_REBT);
  }
  return reformado(
    `${REBT}: se aplica a la parte de la instalación eléctrica que se modifica o amplía, tomando las medidas necesarias para garantizar las condiciones de seguridad del conjunto de la instalación (REBT, art. 2.2).`,
    CITA_REBT,
  );
}

function dbse(caso: CasoObra, c: ContextoExistente): PropuestaExistente {
  const cita = "CTE Parte I, art. 2.4";
  if (caso === "ampliacion" || c.alcance.estructura !== false) {
    return {
      aplicabilidad: "externo",
      nota: `La intervención incluye actuaciones en la estructura${caso === "ampliacion" ? " (la de la parte ampliada)" : " preexistente"} (CTE Parte I, art. 2.4), que se justifican en el anejo de estructura.`,
      cita,
    };
  }
  return noAplica(
    "DB-SE Seguridad estructural: la intervención no incluye actuaciones en la estructura preexistente; se entiende, por tanto, que las obras no implican el riesgo de daño citado en el artículo 17.1.a) de la Ley 38/1999, de Ordenación de la Edificación (CTE Parte I, art. 2.4).",
    cita,
  );
}

// ─── Tabla de reglas ─────────────────────────────────────────────────────────

type Regla = (caso: CasoObra, c: ContextoExistente) => PropuestaExistente;

const SI_DISTRIBUCION: ElementoInterior[] = ["distribucion", "evacuacion"];

/** Una regla por justificación (SUA 5 sigue en las reglas de atributos: nunca aplica). */
export const REGLAS_EXISTENTES: Partial<Record<JustificacionKey, Regla>> = {
  hs1,
  hs2,
  hs3,
  hs4: hs45("DB-HS 4 Suministro de agua", "DB-HS 4", false),
  hs5: hs45("DB-HS 5 Evacuación de aguas", "DB-HS 5", true),
  hs6,
  si1: si(
    "SI 1 Propagación interior",
    (a) => tocaInterior(a, ["compartimentacion", "revestimientos"]),
    "la compartimentación, los locales de riesgo especial, los espacios ocultos ni los revestimientos",
  ),
  si2: si(
    "SI 2 Propagación exterior",
    (a) => tocaEnvolvente(a, ["fachadas", "huecos", "medianerias", "cubiertas"]),
    "las fachadas, medianerías ni cubiertas",
  ),
  si3: si(
    "SI 3 Evacuación de ocupantes",
    (a) => tocaInterior(a, SI_DISTRIBUCION),
    "los elementos de evacuación, ni altera la ocupación o su distribución respecto a ellos (criterio 10)",
  ),
  si4: si(
    "SI 4 Instalaciones de protección contra incendios",
    (a) => tocaInterior(a, ["instalaciones_pci"]),
    "las instalaciones de protección contra incendios, los elementos que les sirven de soporte ni las zonas por las que discurren sus componentes (criterio 10)",
    { ampliacion: " La dotación de instalaciones de protección contra incendios de la parte ampliada es la exigible al edificio ampliado." },
  ),
  si5: si(
    "SI 5 Intervención de los bomberos",
    (a) => tocaEnvolvente(a, ["fachadas", "huecos"]),
    "las fachadas ni sus huecos, de los que dependen las condiciones de aproximación, entorno y accesibilidad por fachada",
    { cambioParcial: si5NoAplica },
  ),
  si6: si(
    "SI 6 Resistencia al fuego de la estructura",
    (a) => a.estructura !== false,
    "la estructura",
  ),
  sua1: sua(
    "SUA 1 Seguridad frente al riesgo de caídas",
    (a) => tocaInterior(a, ["suelos_escaleras"]) || tocaEnvolvente(a, ["huecos"]),
    "suelos, desniveles, barreras, escaleras, rampas ni huecos acristalados",
  ),
  sua2: sua(
    "SUA 2 Seguridad frente al riesgo de impacto o de atrapamiento",
    (a) => tocaInterior(a, ["vidrios_puertas"]) || tocaEnvolvente(a, ["huecos"]),
    "vidrios, puertas ni elementos salientes",
  ),
  sua3: sua(
    "SUA 3 Seguridad frente al riesgo de aprisionamiento en recintos",
    (a) => tocaInterior(a, ["vidrios_puertas", "aseos"]),
    "puertas con dispositivo de bloqueo desde el interior ni aseos",
  ),
  sua4: sua(
    "SUA 4 Seguridad frente al riesgo causado por iluminación inadecuada",
    (a) => tocaInterior(a, ["alumbrado"]),
    "el alumbrado normal ni el de emergencia de las zonas de circulación",
  ),
  sua6,
  sua7,
  sua8,
  sua9: sua(
    "SUA 9 Accesibilidad",
    (a) => tocaInterior(a, ["accesibilidad", "aseos"]),
    "itinerarios, accesos, aseos, plazas reservadas ni otros elementos de accesibilidad",
    true,
  ),
  hr,
  he1,
  he0he1_global: he0he1,
  he4,
  he5,
  he6,
  rebt,
  dbse,
};

/** Cuánto exige cada aplicabilidad, para combinar varios tipos de obra. */
const RANGO: Record<Aplicabilidad, number> = {
  aplica: 4,
  externo: 3,
  aplica_flexibilidad: 2,
  aplica_reformado: 2,
  no_aplica: 0,
};

/**
 * Propuesta para una justificación en una obra en un edificio existente: cada
 * caso de obra con su regla; gana el más exigente; en empate de «aplica a lo
 * intervenido», se juntan las notas distintas. Cierra con el no empeoramiento y,
 * si el edificio está protegido, con su aviso. `undefined` si no hay regla.
 */
export function propuestaExistente(
  key: JustificacionKey,
  casos: readonly CasoObra[],
  c: ContextoExistente,
): PropuestaExistente | undefined {
  const regla = REGLAS_EXISTENTES[key];
  if (!regla || casos.length === 0) return undefined;
  const props = casos.map((caso) => regla(caso, c));
  const max = Math.max(...props.map((p) => RANGO[p.aplicabilidad]));
  const ganan = props.filter((p) => RANGO[p.aplicabilidad] === max);
  const elegida = ganan[0];
  const notas = elegida.aplicabilidad === "aplica_reformado" ? [...new Set(ganan.map((p) => p.nota))] : [elegida.nota];
  const citas = [...new Set(ganan.map((p) => p.cita))];
  const cola: string[] = [];
  if (elegida.aplicabilidad === "aplica_reformado") {
    const f = fraseNoEmpeoramiento(key);
    if (f) cola.push(f);
  }
  if (c.alcance.protegido === true) {
    const p = avisoProtegido(key);
    if (p) cola.push(p);
  }
  return {
    aplicabilidad: elegida.aplicabilidad,
    nota: [...notas, ...cola].join(" "),
    cita: citas.join("; "),
  };
}
