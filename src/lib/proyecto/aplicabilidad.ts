import type {
  Aplicabilidad,
  DatosGenerales,
  Edificio,
  Intervencion,
  JustificacionKey,
  Proyecto,
} from "./tipos";
import { justificacionRegistry } from "../../data/justificacionRegistry";
import { resumenEdificio } from "../edificio/derivar";
import type { He4Estado } from "../../modules/he4/estado";
import { demandaReferencia } from "../../modules/he4/justificacion";
import { superficiesHe5 } from "../../modules/he5/justificacion";
import { recargaDeHe6 } from "../../modules/he6/justificacion";
import { edificioSi } from "../../modules/si/edificio";
import { alcanceDeEdificio, tiposDeObra } from "./alcance";
import {
  CITA_MANTENIMIENTO,
  NOTA_MANTENIMIENTO,
  REGLAS_EXISTENTES,
  casosDeObra,
  propuestaExistente,
  type CasoObra,
  type ContextoExistente,
} from "./reglasExistentes";

// Motor de aplicabilidad — Fase A, obra nueva (feature-6 §A, UX-RECONCEPT §2.3 y §5).
// Lib PURA: sin React/DOM/Date.now. Dados los atributos del proyecto propone, por
// justificación, una aplicabilidad CON párrafo redactado y cita de ámbito (los "no aplica"
// que hoy se copian con errores de memorias anteriores). El motor de reformas por DB llega
// en Fase E; aquí la intervención ≠ obra nueva solo añade el aviso de alcance pendiente.
// Principio §5: la herramienta propone con cita; el proyectista dispone (forzado).
//
// Desde feature-12 los atributos ya no se teclean: salen de El edificio (`atributosDe`),
// salvo la piscina y la intervención, que son datos de la obra.
//
// Citas a nivel de sección/ámbito, nunca números de artículo inventados (SPEC §11).

/** Lo que leen las reglas de aplicabilidad. */
export interface AtributosProyecto {
  intervencion: Intervencion;
  tienePiscina: boolean;
  esUnifamiliar: boolean;
  tieneViviendas: boolean;
  tieneGaraje: boolean;
  tieneTrasteros: boolean;
  /**
   * Demanda de ACS de referencia del edificio [l/d] (DB-HE Anejo F, feature-22),
   * con las decisiones guardadas de HE 4. Sin ella, la regla de HE 4 no se evalúa.
   */
  demandaAcs_l_d?: number;
  /** Superficie construida del edificio con el garaje [m²] (HE 5, feature-22). */
  superficieConstruida_m2?: number;
  /**
   * Plazas de aparcamiento, interiores y exteriores adscritas (HE 6, feature-24), y
   * si el edificio queda fuera por la exclusión de 10 plazas o menos.
   */
  plazasAparcamiento?: number;
  excluidoHe6?: boolean;
  /**
   * Obra en un edificio existente con el asistente de alcance respondido
   * (feature-27). Sin él, la intervención se queda con la nota «alcance pendiente».
   */
  existente?: {
    casos: CasoObra[];
    soloMantenimiento: boolean;
    contexto: ContextoExistente;
  };
}

/**
 * Atributos del proyecto: la piscina y la intervención de la obra; el resto, del
 * edificio. `estadoHe4`: lo guardado de HE 4, que cambia la demanda de ACS
 * (producción centralizada, ocupantes de las oficinas). `justificaciones`: lo
 * guardado de las demás (las plazas exteriores de HE 6, la plaza en la parcela
 * de REBT).
 */
export function atributosDe(
  dg: DatosGenerales,
  edificio: Edificio,
  estadoHe4?: Partial<He4Estado>,
  justificaciones?: Proyecto["justificaciones"],
): AtributosProyecto {
  const r = resumenEdificio(edificio);
  const he6 = recargaDeHe6({ edificio, datosGenerales: dg, justificaciones });
  const superficieConstruida_m2 = superficiesHe5(edificioSi(edificio).zonas, r.tieneViviendas).s_m2;
  const alcance = dg.intervencion !== "obra_nueva" ? dg.alcance : undefined;
  return {
    intervencion: dg.intervencion,
    tienePiscina: dg.tienePiscina,
    esUnifamiliar: r.esUnifamiliar,
    tieneViviendas: r.tieneViviendas,
    tieneGaraje: r.tieneGaraje,
    tieneTrasteros: r.tieneTrasteros,
    demandaAcs_l_d: demandaReferencia(edificio, estadoHe4),
    superficieConstruida_m2,
    plazasAparcamiento: he6.plazas,
    excluidoHe6: he6.plazas > 0 && !he6.aplica,
    existente: alcance && {
      casos: casosDeObra(tiposDeObra(dg), alcance),
      soloMantenimiento: alcance.soloMantenimiento === true,
      contexto: {
        alcance,
        edificio: alcanceDeEdificio(dg, edificio, estadoHe4),
        superficieConstruida_m2,
      },
    },
  };
}

/** Aplicabilidad propuesta por el motor para una justificación, con su redacción. */
export interface AplicabilidadCalculada {
  aplicabilidad: Aplicabilidad;
  /** Párrafo redactado listo para la memoria (p.ej. el "no aplica" de SUA6 sin piscina). */
  nota?: string;
  /** Referencia normativa del ámbito que respalda la propuesta. */
  cita?: string;
}

/** Regla de atributos: si `cuando(a)` es true, la justificación `key` toma `resultado`. */
export interface ReglaAtributo {
  key: JustificacionKey;
  /** true ⇒ se aplica la regla. */
  cuando: (a: AtributosProyecto) => boolean;
  resultado: Aplicabilidad;
  /** Párrafo REDACTADO listo para la memoria. */
  nota: string;
  /** Referencia normativa del ámbito. */
  cita: string;
}

/**
 * Reglas de atributos (§2.3): en orden de declaración, para cada key gana la
 * PRIMERA regla que casa. Las citas se quedan a nivel de sección/ámbito.
 */
export const REGLAS_ATRIBUTOS: readonly ReglaAtributo[] = [
  // ── SUA 5 · Alta ocupación (feature-20) ────────────────────────────────────
  {
    // Ámbito: graderíos para más de 3000 espectadores de pie. Un edificio de
    // viviendas u oficinas no los tiene nunca (research/verificacion-sua2-sua5.md B6).
    key: "sua5",
    cuando: () => true,
    resultado: "no_aplica",
    nota:
      "SUA 5 Seguridad frente al riesgo causado por situaciones de alta ocupación: " +
      "no es de aplicación — el edificio no contiene graderíos de estadios, " +
      "pabellones polideportivos, centros de reunión u otros edificios de uso " +
      "cultural previstos para más de 3000 espectadores de pie (SUA 5 ap. 1 pto 1).",
    cita: "DB-SUA 5, ámbito de aplicación",
  },
  // ── SUA 6 · Piscinas ───────────────────────────────────────────────────────
  // Verificado en feature-20 (research/verificacion-sua6-sua8.md, R1 y R2): el
  // ap. 2 (pozos y depósitos) no se limita a las piscinas, así que el párrafo
  // declara también que no los hay.
  {
    key: "sua6",
    cuando: (a) => !a.tienePiscina,
    resultado: "no_aplica",
    nota:
      "SUA 6 Seguridad frente al riesgo de ahogamiento: no es de aplicación — " +
      "el edificio no dispone de piscina de uso colectivo (SUA 6 ap. 1) ni de " +
      "pozos, depósitos o conducciones abiertas accesibles a personas que " +
      "presenten riesgo de ahogamiento (SUA 6 ap. 2).",
    cita: "DB-SUA 6, ámbito de aplicación",
  },
  {
    // Solo se evalúa cuando la anterior no casa (⇒ tienePiscina): el ámbito de
    // SUA 6 deja fuera las piscinas de las viviendas unifamiliares, igual que
    // el de SUA 7 deja fuera sus garajes. Sin esta regla, marcar "Piscina" en
    // una unifamiliar exigía justificar una sección que no le es de aplicación.
    key: "sua6",
    cuando: (a) => a.esUnifamiliar,
    resultado: "no_aplica",
    nota:
      "SUA 6 Seguridad frente al riesgo de ahogamiento: no es de aplicación — " +
      "la piscina es de una vivienda unifamiliar, excluida expresamente del " +
      "ámbito de la Sección (SUA 6 ap. 1 pto 1), y no hay pozos, depósitos o " +
      "conducciones abiertas accesibles con riesgo de ahogamiento (ap. 2). La " +
      "piscina queda sujeta a su reglamentación sanitaria específica.",
    cita: "DB-SUA 6, ámbito de aplicación",
  },
  // ── SUA 7 · Aparcamientos ──────────────────────────────────────────────────
  // Verificado en feature-20 (research/verificacion-sua6-sua8.md, R4 y R5).
  {
    key: "sua7",
    cuando: (a) => !a.tieneGaraje,
    resultado: "no_aplica",
    nota:
      "SUA 7 Seguridad frente al riesgo causado por vehículos en movimiento: " +
      "no es de aplicación — el edificio no tiene zonas de uso Aparcamiento ni " +
      "vías de circulación de vehículos, interiores o exteriores adscritas a él " +
      "(SUA 7 ap. 1).",
    cita: "DB-SUA 7, ámbito de aplicación",
  },
  {
    // Solo se evalúa cuando la anterior no casa (⇒ tieneGaraje): el ámbito de
    // SUA 7 excluye los garajes de las viviendas unifamiliares.
    key: "sua7",
    cuando: (a) => a.esUnifamiliar,
    resultado: "no_aplica",
    nota:
      "SUA 7 Seguridad frente al riesgo causado por vehículos en movimiento: " +
      "no es de aplicación — el garaje es de una vivienda unifamiliar, que no " +
      "es uso Aparcamiento cualquiera que sea su superficie (SUA 7 ap. 1: «lo " +
      "que excluye a los garajes de una vivienda unifamiliar»; DB-SUA Anejo A, " +
      "«Uso Aparcamiento»).",
    cita: "DB-SUA 7, ámbito de aplicación",
  },
  // ── DB-HS 2 · Recogida y evacuación de residuos (feature-21) ───────────────
  {
    // Ámbito (research/verificacion-hs2.md B1): edificios de viviendas de nueva
    // construcción; los de otros usos, con un estudio específico (ap. 1.1 pto 2).
    key: "hs2",
    cuando: (a) => !a.tieneViviendas,
    resultado: "no_aplica",
    nota:
      "DB-HS 2 Recogida y evacuación de residuos: no es de aplicación directa — " +
      "el edificio no tiene viviendas. La conformidad con la exigencia básica se " +
      "demuestra mediante un estudio específico, adoptando criterios análogos a " +
      "los establecidos en la Sección HS 2 (ap. 1.1 pto 2).",
    cita: "DB-HS 2, ámbito de aplicación",
  },
  // ── DB-HS 3 · Calidad del aire interior (feature-12) ───────────────────────
  {
    // Ámbito verificado el 2026-10-03 (research/verificacion-edificio-usos.md,
    // bloque C): interior de las viviendas, almacenes de residuos y trasteros de
    // los edificios de viviendas, y aparcamientos y garajes de cualquier uso. Un
    // edificio sin viviendas ni garaje (oficinas) queda fuera: RITE.
    key: "hs3",
    cuando: (a) => !a.tieneViviendas && !a.tieneGaraje,
    resultado: "no_aplica",
    nota:
      "DB-HS 3 Calidad del aire interior: no es de aplicación — el edificio no " +
      "tiene viviendas ni aparcamientos o garajes (el ámbito de la Sección HS 3 " +
      "se limita al interior de las viviendas, a los almacenes de residuos y " +
      "trasteros de los edificios de viviendas y a los aparcamientos y garajes " +
      "de cualquier edificio). En los demás locales las exigencias de calidad " +
      "del aire interior se consideran cumplidas con las condiciones del RITE.",
    cita: "DB-HS 3, ámbito de aplicación",
  },
  // ── DB-HE 4 y HE 5 (feature-22) ────────────────────────────────────────────
  {
    // Ámbito (research/verificacion-he4-he5.md): edificios nuevos con una demanda
    // de ACS superior a 100 l/d, calculada según el Anejo F.
    key: "he4",
    cuando: (a) => !a.existente && a.demandaAcs_l_d !== undefined && a.demandaAcs_l_d <= 100,
    resultado: "no_aplica",
    nota:
      "DB-HE 4 Contribución mínima de energía renovable para cubrir la demanda de " +
      "agua caliente sanitaria: no es de aplicación — la demanda de ACS de " +
      "referencia del edificio, calculada de acuerdo con el Anejo F, no supera " +
      "100 l/d (HE 4 ap. 1 pto 1 a).",
    cita: "DB-HE 4, ámbito de aplicación",
  },
  {
    // Ámbito: edificios nuevos que superen los 1.000 m² construidos, con el
    // aparcamiento interior (desde el RD 450/2022, de cualquier uso).
    key: "he5",
    cuando: (a) => !a.existente && a.superficieConstruida_m2 !== undefined && a.superficieConstruida_m2 <= 1000,
    resultado: "no_aplica",
    nota:
      "DB-HE 5 Generación mínima de energía eléctrica procedente de fuentes " +
      "renovables: no es de aplicación — la superficie construida del edificio, " +
      "incluida la de las zonas de aparcamiento en su interior, no supera " +
      "1.000 m² (HE 5 ap. 1 pto 1 a).",
    cita: "DB-HE 5, ámbito de aplicación",
  },
  // ── DB-HE 6 (feature-24) ──────────────────────────────────────────────────
  {
    // Ámbito (research/verificacion-he6.md): edificios con una zona destinada a
    // aparcamiento, interior o exterior adscrita.
    key: "he6",
    cuando: (a) => a.plazasAparcamiento === 0,
    resultado: "no_aplica",
    nota:
      "DB-HE 6 Dotaciones mínimas para la infraestructura de recarga de vehículos " +
      "eléctricos: no es de aplicación — el edificio no cuenta con zona destinada a " +
      "aparcamiento, interior ni exterior adscrita (HE 6 ap. 1 pto 1).",
    cita: "DB-HE 6, ámbito de aplicación",
  },
  {
    key: "he6",
    cuando: (a) => a.excluidoHe6 === true,
    resultado: "no_aplica",
    nota:
      "DB-HE 6 Dotaciones mínimas para la infraestructura de recarga de vehículos " +
      "eléctricos: no es de aplicación — edificio de uso distinto del residencial " +
      "privado con una zona de aparcamiento de 10 plazas o menos (HE 6 ap. 1 pto 2 a).",
    cita: "DB-HE 6, ámbito de aplicación",
  },
  // ── DB-HR · Protección frente al ruido (feature-25) ────────────────────────
  {
    // Ámbito (research/verificacion-hr.md, bloque A): el del CTE salvo recintos
    // ruidosos, espectáculos, aulas de más de 350 m³ y las obras en edificios
    // existentes que no sean de rehabilitación integral. La unifamiliar, aislada
    // o adosada, SÍ está dentro (tabiquería, fachada e instalaciones; Anejo I).
    // Con el asistente de alcance respondido manda la regla de existentes
    // (feature-27, K-REF.4: el cambio de uso no está en la exclusión).
    key: "hr",
    cuando: (a) => a.intervencion !== "obra_nueva" && !a.existente,
    resultado: "no_aplica",
    nota:
      "DB-HR Protección frente al ruido: no es de aplicación — la obra es una " +
      "intervención en un edificio existente, y el DB-HR excluye las obras de " +
      "ampliación, modificación, reforma o rehabilitación salvo cuando se trate " +
      "de rehabilitación integral (Introducción II d). Si es una rehabilitación " +
      "integral, el proyectista debe marcar que se aplica.",
    cita: "DB-HR, ámbito de aplicación (Introducción II d)",
  },
];

const NOTA_ALCANCE_PENDIENTE =
  "Intervención en edificio existente: el alcance de aplicación se " +
  "justificará con el asistente de alcance (pendiente, CTE Parte I art. 2).";
const CITA_PARTE_I = "CTE Parte I, art. 2";

/** Claves reales del expediente (el registry menos las entradas de desarrollo). */
const KEYS_EXPEDIENTE: readonly JustificacionKey[] = justificacionRegistry
  .filter((j) => !j.dev)
  .map((j) => j.key as JustificacionKey);

/**
 * Aplicabilidad PROPUESTA para cada justificación del expediente:
 *  0. Obra de solo mantenimiento (feature-27) → todo `no_aplica`: fuera del CTE.
 *  1. Entradas `formato: "externo"` del registry → `externo` ("Se justifica con <destino>"),
 *     salvo que en un edificio existente su regla diga que no aplica (K-REF.10).
 *  2. `REGLAS_ATRIBUTOS` en orden — para cada key gana la primera que casa.
 *  3. Edificio existente con el asistente respondido → `REGLAS_EXISTENTES`.
 *  4. Resto → `aplica`; en un edificio existente sin asistente, con el aviso de
 *     alcance pendiente.
 *  5. HE 1 va al programa de la verificación global si la hay (`he1SegunGlobal`).
 * Función pura y determinista: mismos atributos ⇒ mismo resultado.
 */
export function aplicabilidadBase(
  a: AtributosProyecto,
): Record<JustificacionKey, AplicabilidadCalculada> {
  const r = propuestasSinGlobal(a);
  return { ...r, he1: he1SegunGlobal(r.he1, r.he0he1_global.aplicabilidad) };
}

/** Pasos 0–4 de `aplicabilidadBase`: HE 1 aún sin mirar la verificación global. */
function propuestasSinGlobal(
  a: AtributosProyecto,
): Record<JustificacionKey, AplicabilidadCalculada> {
  const resultado = {} as Record<JustificacionKey, AplicabilidadCalculada>;
  const ex = a.existente;
  for (const key of KEYS_EXPEDIENTE) {
    const entry = justificacionRegistry.find((j) => j.key === key);
    // 0. Mantenimiento: no es intervención (CTE Parte I, Anejo III).
    if (ex?.soloMantenimiento) {
      resultado[key] = { aplicabilidad: "no_aplica", nota: NOTA_MANTENIMIENTO, cita: CITA_MANTENIMIENTO };
      continue;
    }
    // 1. Externas: se resuelven fuera de la app (HULC, Concreta estructura).
    if (entry?.formato === "externo") {
      const destino = `Se justifica con ${entry.externo?.destino ?? "herramienta externa"}.`;
      const p = ex && REGLAS_EXISTENTES[key] ? propuestaExistente(key, ex.casos, ex.contexto) : undefined;
      resultado[key] = p
        ? { aplicabilidad: p.aplicabilidad, nota: p.aplicabilidad === "externo" ? `${p.nota} ${destino}` : p.nota, cita: p.cita }
        : { aplicabilidad: "externo", nota: destino, cita: entry.db };
      continue;
    }
    // 2. Reglas de atributos: primera que casa gana.
    const regla = REGLAS_ATRIBUTOS.find((r) => r.key === key && r.cuando(a));
    if (regla) {
      resultado[key] = {
        aplicabilidad: regla.resultado,
        nota: regla.nota,
        cita: regla.cita,
      };
      continue;
    }
    // 3. Edificio existente con el alcance respondido.
    const p = ex ? propuestaExistente(key, ex.casos, ex.contexto) : undefined;
    if (p) {
      resultado[key] = p;
      continue;
    }
    // 4. Resto: aplica (obra nueva); intervención existente sin alcance ⇒ aviso.
    resultado[key] =
      a.intervencion === "obra_nueva" || ex
        ? { aplicabilidad: "aplica" }
        : {
            aplicabilidad: "aplica",
            nota: NOTA_ALCANCE_PENDIENTE,
            cita: CITA_PARTE_I,
          };
  }
  return resultado;
}

/**
 * HE 1 por elementos (el módulo de la app) solo cuando no hay verificación
 * energética global: es la reforma que no renueva más del 25 % de la envolvente.
 * Si la global se hace con HULC o CE3X (obra nueva, ampliación, cambio de uso,
 * reforma de más del 25 %), su informe justifica también la envolvente elemento
 * a elemento y las condensaciones, y
 * HE 1 va con ella. El proyectista puede forzar que se aplique aquí.
 */
function he1SegunGlobal(he1: AplicabilidadCalculada, global: Aplicabilidad): AplicabilidadCalculada {
  if (global !== "externo" || he1.aplicabilidad === "no_aplica") return he1;
  const destino = justificacionRegistry.find((j) => j.key === "he1")?.externo?.destino ?? "HULC o CE3X";
  const conGlobal = `Se justifica con ${destino}, junto con la verificación energética global.`;
  return {
    aplicabilidad: "externo",
    nota: he1.nota && he1.nota !== NOTA_ALCANCE_PENDIENTE ? `${he1.nota} ${conGlobal}` : conGlobal,
    cita: he1.cita && he1.cita !== CITA_PARTE_I ? he1.cita : "DB-HE1",
  };
}

/**
 * Aplicabilidad EFECTIVA de una justificación en un proyecto: si el proyectista
 * la forzó (`aplicabilidadForzada`) prevalece su valor con su nota (la
 * herramienta propone, el proyectista dispone); si no, la propuesta del motor.
 */
export function aplicabilidadEfectiva(
  p: Proyecto,
  key: JustificacionKey,
): AplicabilidadCalculada & { forzada: boolean } {
  const forzada = p.justificaciones[key]?.aplicabilidadForzada;
  if (forzada) {
    return { aplicabilidad: forzada.valor, nota: forzada.nota, forzada: true };
  }
  return { ...aplicabilidadPropuesta(p, key), forzada: false };
}

/** Lo que propone el motor para una justificación, se haya forzado o no. */
export function aplicabilidadPropuesta(p: Proyecto, key: JustificacionKey): AplicabilidadCalculada {
  const he4 = p.justificaciones.he4?.inputs as Partial<He4Estado> | undefined;
  const base = propuestasSinGlobal(atributosDe(p.datosGenerales, p.edificio, he4, p.justificaciones));
  if (key !== "he1") return base[key];
  // HE 1 sigue a la verificación global efectiva, también si el proyectista la forzó.
  const global = p.justificaciones.he0he1_global?.aplicabilidadForzada?.valor ?? base.he0he1_global.aplicabilidad;
  return he1SegunGlobal(base.he1, global);
}
