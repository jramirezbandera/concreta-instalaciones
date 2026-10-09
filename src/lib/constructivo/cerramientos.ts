// =============================================================================
// Los cerramientos del edificio (feature-26): qué fachada, ventana, cubierta y
// forjado lleva, elegidos una vez en El edificio y leídos por HE1, HR y HS1.
//
// `edificio.cerramientos` es opcional y sin migración (REDISENO-V4 §7.4): si
// falta, valen los habituales de hoy, con los que ningún proyecto cambia de
// veredicto: F 3.2 (K-CER.15; en HR vale lo mismo que F 3.1), la ventana
// batiente de PVC, la cubierta habitual de su tipo (la que HS1 suponía: solado
// fijo si es transitable, grava si no, tejas si es inclinada) y el forjado de
// 30 cm.
//
// Criterios:
//   - K-CER.1: la «planta baja» es la planta 0; las demás plantas sobre
//     rasante llevan la general;
//   - una cubierta que no casa con el tipo de El edificio (plana transitable,
//     plana no transitable o inclinada) no vale: se usa la habitual del tipo y
//     se avisa.
// =============================================================================

import { renumerar } from "../edificio/derivar";
import type { Edificio, TipoCubierta, UsoZona } from "../edificio/tipos";
import {
  FACHADA_HABITUAL,
  solucion,
  solucionDe,
  type SolCubierta,
  type SolFachada,
  type SolForjado,
  type SolVentana,
} from "./catalogo";
import type { Cerramientos, Eleccion, EleccionVentana, Marco } from "./tipos";

export const CERRAMIENTOS_HABITUALES: Cerramientos = {
  fachada: { id: FACHADA_HABITUAL },
  fachadaPB: null,
  ventana: { id: "ve-4-c-6-batiente", marco: "pvc_tres_camaras" },
  ventanaPB: null,
  cubierta: null,
  forjado: { id: "fu-bovhorm-300" },
};

const CUBIERTA_HABITUAL: Record<TipoCubierta, string> = {
  plana_transitable: "cu-plana-fu-bovhorm-300",
  plana_no_transitable: "cu-plana-grava",
  inclinada: "cu-incl-fu-bovhorm-250",
};

/** La cubierta habitual de cada tipo de cubierta. */
export function cubiertaHabitual(tipo: TipoCubierta): string {
  return CUBIERTA_HABITUAL[tipo];
}

const NOMBRE_TIPO_CUBIERTA: Record<TipoCubierta, string> = {
  plana_transitable: "plana transitable",
  plana_no_transitable: "plana no transitable",
  inclinada: "inclinada",
};

/** Una elección con su solución del Catálogo. */
export interface Cerramiento<S> {
  eleccion: Eleccion;
  sol: S;
}

export type CerramientoVentana = Cerramiento<SolVentana> & { marco: Marco };

export interface CerramientosDelEdificio {
  fachada: Cerramiento<SolFachada>;
  /** null = la misma que la general. */
  fachadaPB: Cerramiento<SolFachada> | null;
  ventana: CerramientoVentana;
  ventanaPB: CerramientoVentana | null;
  /**
   * `habitual`: la del tipo de cubierta; `descartada`: la elegida no casaba con él;
   * `invertida`: plana con el aislante sobre la impermeabilización (false en la inclinada).
   */
  cubierta: Cerramiento<SolCubierta> & { habitual: boolean; descartada: boolean; invertida: boolean };
  forjado: Cerramiento<SolForjado>;
  /** No se han indicado: son los habituales. */
  supuestos: boolean;
}

/** Lo que guarda el edificio, o los habituales. */
export function eleccionesDe(e: Edificio): Cerramientos {
  return e.cerramientos ?? CERRAMIENTOS_HABITUALES;
}

function fachadaDe(el: Eleccion): Cerramiento<SolFachada> {
  return { eleccion: el, sol: solucionDe("fachada", el.id) };
}

function ventanaDe(el: EleccionVentana): CerramientoVentana {
  return { eleccion: el, sol: solucionDe("ventana", el.id), marco: el.marco };
}

/** Los cerramientos del edificio con sus soluciones del Catálogo. */
export function cerramientosDe(e: Edificio): CerramientosDelEdificio {
  const c = eleccionesDe(e);
  const habitual = cubiertaHabitual(e.cubierta.tipo);
  const elegida = c.cubierta ? solucion(c.cubierta.id) : undefined;
  const vale = elegida?.categoria === "cubierta" && elegida.tipo === e.cubierta.tipo;
  const cubierta = vale && c.cubierta ? c.cubierta : { id: habitual };
  const cubiertaSol = solucionDe("cubierta", cubierta.id);
  return {
    fachada: fachadaDe(c.fachada),
    fachadaPB: c.fachadaPB ? fachadaDe(c.fachadaPB) : null,
    ventana: ventanaDe(c.ventana),
    ventanaPB: c.ventanaPB ? ventanaDe(c.ventanaPB) : null,
    cubierta: {
      eleccion: cubierta,
      sol: cubiertaSol,
      habitual: cubierta.id === habitual && !cubierta.valores,
      descartada: c.cubierta !== null && !vale,
      invertida:
        cubiertaSol.tipo !== "inclinada" &&
        (cubiertaSol.posicion === "invertida" || (cubiertaSol.posicion === "ambas" && c.aislanteCubierta !== "convencional")),
    },
    forjado: { eleccion: c.forjado, sol: solucionDe("forjado", c.forjado.id) },
    supuestos: e.cerramientos === undefined,
  };
}

/** La planta baja es distinta (fachada o ventana). */
export function plantaBajaDistinta(c: Cerramientos): boolean {
  return c.fachadaPB !== null || c.ventanaPB !== null;
}

// -----------------------------------------------------------------------------
// Edición: operaciones puras que devuelven un edificio nuevo.
// -----------------------------------------------------------------------------

export function setCerramientos(e: Edificio, patch: Partial<Cerramientos>): Edificio {
  const actual = eleccionesDe(e);
  const cubierta = patch.cubierta !== undefined ? patch.cubierta : actual.cubierta;
  return {
    ...e,
    cerramientos: {
      ...actual,
      ...patch,
      // La habitual del tipo, sin valores propios, se guarda como «la habitual»:
      // así sigue al tipo si cambia.
      cubierta: cubierta && cubierta.id === cubiertaHabitual(e.cubierta.tipo) && !cubierta.valores ? null : cubierta,
    },
  };
}

/** Elegir otra solución: los valores propios eran de la anterior y se quitan. */
export function elegir(actual: Eleccion, id: string): Eleccion {
  return actual.id === id ? actual : { id };
}

export function elegirVentana(actual: EleccionVentana, patch: { id?: string; marco?: Marco }): EleccionVentana {
  const id = patch.id ?? actual.id;
  return id === actual.id ? { ...actual, ...patch } : { id, marco: patch.marco ?? actual.marco };
}

/** Con la planta baja distinta, empieza siendo igual que la general. */
export function setPlantaBajaDistinta(e: Edificio, distinta: boolean): Edificio {
  const c = eleccionesDe(e);
  if (distinta === plantaBajaDistinta(c)) return e;
  return setCerramientos(
    e,
    distinta ? { fachadaPB: { ...c.fachada }, ventanaPB: { ...c.ventana } } : { fachadaPB: null, ventanaPB: null },
  );
}

// -----------------------------------------------------------------------------

/** Lo que protege HE1: viviendas u oficinas (los mismos usos que `envolventeDe` de HE1). */
const PROTEGIDOS_HE1: ReadonlySet<UsoZona> = new Set<UsoZona>(["viviendas", "vivienda_unifamiliar", "oficinas"]);

/**
 * La planta baja entra en HE1: tiene viviendas u oficinas o, si el edificio no
 * tiene ninguna, es la que HE1 protege (un local).
 */
export function plantaBajaEnHe1(e: Edificio): boolean {
  const grupos = renumerar(e).grupos;
  const protege = (zs: { uso: UsoZona }[]) => zs.some((z) => PROTEGIDOS_HE1.has(z.uso));
  if (!grupos.some((g) => protege(g.zonas))) return true;
  const pb = grupos.find((g) => g.nivelInicial === 0);
  return !!pb && protege(pb.zonas);
}

export function avisosCerramientos(e: Edificio): string[] {
  const avisos: string[] = [];
  const c = eleccionesDe(e);
  const r = cerramientosDe(e);
  if (plantaBajaDistinta(c) && !plantaBajaEnHe1(e)) {
    avisos.push(
      "Cerramientos: la planta baja no tiene viviendas ni oficinas, así que su fachada y su ventana no entran en HE1. Sí en HS1.",
    );
  }
  if (r.cubierta.descartada) {
    avisos.push(
      `Cerramientos: la cubierta elegida no es ${NOMBRE_TIPO_CUBIERTA[e.cubierta.tipo]}, como el tipo de cubierta. Se usa la habitual (CEC ${r.cubierta.sol.codigo}).`,
    );
  }
  return avisos;
}
