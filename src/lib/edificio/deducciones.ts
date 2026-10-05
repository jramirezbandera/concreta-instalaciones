// =============================================================================
// «Lo que se deduce» de El edificio (feature-12, REDISENO-V4 §3.1). PURO.
//
// Regla: aquí solo hay cifras que salen de tablas verificadas, cada una con su
// cita:
//   - HS3 tabla 2.1 (vía el generador, que propone caudales que cumplen) y
//     tabla 2.2 (garajes por plaza; trasteros por m², solo en edificios de
//     viviendas, que es el ámbito de HS3 para ellos);
//   - HS5 tabla 4.1 (UD por aparato, uso privado o público);
//   - HS4 tabla 2.1 (caudal instantáneo mínimo de agua fría);
//   - SI 3 tabla 2.1, ITC-BT-10 y RITE tabla 1.4.2.1, verificados en
//     `research/verificacion-edificio-usos.md` (ver `./tablas.ts`).
// Lo que la verificación dejó fuera (densidad de un local sin uso, W/m² de
// garaje sin saber su ventilación…) se queda en texto, sin número (feature-12 §E).
// =============================================================================

import { fmt } from "../units/format";
import { CAUDALES_NO_HABITABLES } from "../../modules/hs3/tablas";
import { UD_APARATOS_TABLA_4_1, type TipoAparato } from "../../modules/hs5/tablas";
import { caudalInstantaneo, type TipoAparatoHS4 } from "../../modules/hs4/tablas";
import { buscarZona, usosDeTipo } from "./editar";
import {
  grupoTocaTerreno,
  nombreGrupo,
  renumerar,
  resumenEdificio,
  vecinasDe,
  viviendasEnZona,
} from "./derivar";
import { AIRE_EXTERIOR_RITE, DENSIDADES_SI3, PREVISION_ITC_BT_10 } from "./tablas";
import { aparatosDeVivienda, caudalVentilacionVivienda_l_s } from "./generadores/viviendas";
import type { Edificio, UnidadTipo, UsoZona } from "./tipos";
import { USOS, textoCuentaPara, type LoUsa } from "./usos";

export interface Deduccion {
  etiqueta: string;
  valor: string;
  /** Tabla de la que sale la cifra (si la hay). */
  cita?: string;
}

// -----------------------------------------------------------------------------
// Por tipo (lo que se repite)
// -----------------------------------------------------------------------------

/** Cifras de una unidad tipo, sin formatear. */
export interface CifrasTipo {
  /** Ventilación propuesta (solo viviendas) [l/s]. */
  aire_l_s?: number;
  /** Unidades de desagüe [UD]. */
  ud: number;
  /** Caudal instalado de agua fría: suma de los mínimos por aparato [dm³/s]. */
  caudalAF_dm3_s: number;
  aparatos: number;
}

function udDe(tipo: TipoAparato, uso: "privado" | "publico"): number {
  const fila = UD_APARATOS_TABLA_4_1.datos.aparatos[tipo];
  return (uso === "privado" ? fila.ud_privado : fila.ud_publico) ?? 0;
}

function caudalAF(tipos: TipoAparatoHS4[]): number {
  return tipos.reduce((a, t) => a + caudalInstantaneo(t).af_dm3_s, 0);
}

export function cifrasTipo(t: UnidadTipo): CifrasTipo {
  if (t.clase === "vivienda") {
    const ap = aparatosDeVivienda(t);
    return {
      aire_l_s: caudalVentilacionVivienda_l_s(t),
      ud: ap.hs5.reduce((a, x) => a + udDe(x, "privado"), 0),
      caudalAF_dm3_s: caudalAF(ap.hs4),
      aparatos: ap.hs4.length,
    };
  }
  // Núcleo de aseos de oficinas: inodoros con cisterna y lavabos, uso público.
  const ino = Math.max(0, Math.trunc(t.inodoros));
  const lav = Math.max(0, Math.trunc(t.lavabos));
  return {
    ud: ino * udDe("inodoro_cisterna", "publico") + lav * udDe("lavabo", "publico"),
    caudalAF_dm3_s: caudalAF([
      ...Array<TipoAparatoHS4>(ino).fill("inodoro_cisterna"),
      ...Array<TipoAparatoHS4>(lav).fill("lavabo"),
    ]),
    aparatos: ino + lav,
  };
}

const CITA_UD = "DB-HS5 tabla 4.1";
const CITA_AF = "DB-HS4 tabla 2.1";
const CITA_SI = "DB-SI, SI 3, ap. 2.1, tabla 2.1";

/** «19 UD · 1,85 dm³/s» y, en viviendas, el aire delante. Para las tarjetas. */
export function resumenCifrasTipo(t: UnidadTipo): string {
  const c = cifrasTipo(t);
  const partes = [
    ...(c.aire_l_s !== undefined ? [fmt(c.aire_l_s, "l/s", 0)] : []),
    `${fmt(c.ud, "UD", 1)}`,
    fmt(c.caudalAF_dm3_s, "dm³/s", 2),
  ];
  return partes.join(" · ");
}

export function deduccionesTipo(t: UnidadTipo): Deduccion[] {
  const c = cifrasTipo(t);
  const out: Deduccion[] = [];
  if (c.aire_l_s !== undefined) {
    out.push({ etiqueta: "Aire · entra = sale · HS3", valor: fmt(c.aire_l_s, "l/s", 1), cita: "DB-HS3 tabla 2.1" });
  }
  out.push(
    {
      etiqueta: `Unidades de desagüe · HS5${t.clase === "nucleo_aseos" ? " · uso público" : ""}`,
      valor: fmt(c.ud, "UD", 1),
      cita: CITA_UD,
    },
    { etiqueta: "Caudal instalado de agua fría · HS4", valor: fmt(c.caudalAF_dm3_s, "dm³/s", 2), cita: CITA_AF },
    { etiqueta: "Aparatos", valor: String(c.aparatos) },
  );
  if (t.clase === "vivienda") {
    const p = PREVISION_ITC_BT_10.datos;
    const elevada = t.superficieUtil_m2 > p.superficieElevada_m2;
    out.push({
      etiqueta: "Electrificación por superficie · ITC-BT-10",
      valor: elevada
        ? `elevada · ${fmt(p.electrificacionElevada_W, "W", 0)}`
        : `básica · ${fmt(p.electrificacionBasica_W, "W", 0)}`,
      cita:
        `ITC-BT-10 ap. 2.1 y 2.2: elevada con más de ${p.superficieElevada_m2} m² útiles; ` +
        "la calefacción eléctrica o el aire acondicionado también la hacen elevada (se decide en REBT)",
    });
  }
  return out;
}

/** Dónde se usa un tipo, legible: «P1–P3, PB» y «6 viviendas». */
export function dondeEstaTipo(e: Edificio, t: UnidadTipo): { donde: string; cuantas: string } {
  const r = renumerar(e);
  // La unifamiliar no reparte unidades en sus zonas: su tipo es el primero de
  // vivienda y está en todas las plantas que tienen «vivienda unifamiliar».
  const plantasUnifamiliar = r.grupos.filter((g) => g.zonas.some((z) => z.uso === "vivienda_unifamiliar"));
  if (plantasUnifamiliar.length > 0 && t.id === r.unidades.find((u) => u.clase === "vivienda")?.id) {
    return { donde: plantasUnifamiliar.map((g) => nombreGrupo(g).corto).join(", "), cuantas: "1 vivienda" };
  }
  const { grupos, total } = usosDeTipo(r, t.id);
  const nombres = r.grupos.filter((g) => grupos.includes(g.id)).map((g) => nombreGrupo(g).corto);
  const unidad =
    t.clase === "vivienda"
      ? total === 1
        ? "vivienda"
        : "viviendas"
      : total === 1
        ? "núcleo"
        : "núcleos";
  return { donde: nombres.length > 0 ? nombres.join(", ") : "sin usar", cuantas: `${total} ${unidad}` };
}

// -----------------------------------------------------------------------------
// Por zona
// -----------------------------------------------------------------------------

function listaUsos(usos: UsoZona[]): string {
  return usos.length > 0 ? usos.map((u) => USOS[u].etiqueta).join(", ") : "";
}

export function deduccionesZona(e: Edificio, zonaId: string): Deduccion[] {
  const r = renumerar(e);
  const hallada = buscarZona(r, zonaId);
  if (!hallada) return [];
  const { grupo, zona } = hallada;
  const n = Math.max(1, grupo.repeticiones);
  const porPlanta = n > 1 ? " por planta" : "";
  const out: Deduccion[] = [{ etiqueta: "Su superficie cuenta para", valor: textoCuentaPara(zona.uso) }];

  const res = resumenEdificio(r);
  const si = DENSIDADES_SI3.datos;
  const ocupacion = (densidad: number) => ({
    etiqueta: `Ocupación${porPlanta} · SI 3, ${densidad} m²/persona`,
    valor: `${Math.ceil(zona.superficieUtil_m2 / densidad)} personas`,
    cita: CITA_SI,
  });
  const previsionLocal = () => {
    const p = PREVISION_ITC_BT_10.datos;
    const w = Math.max(p.minimoLocal_W, p.localesOficinas_W_m2 * zona.superficieUtil_m2);
    return {
      etiqueta: `Previsión eléctrica${porPlanta} · ITC-BT-10`,
      valor: fmt(w / 1000, "kW", 1),
      cita: `${p.localesOficinas_W_m2} W/m² sobre la superficie útil de la zona (criterio: la ITC no precisa útil o construida), mínimo ${fmt(p.minimoLocal_W, "W", 0)}`,
    };
  };

  if (zona.uso === "viviendas") {
    const v = viviendasEnZona(r, zona);
    out.push({
      etiqueta: "Viviendas",
      valor: n > 1 ? `${v * n} (${v} por planta)` : String(v),
    });
    let sup = 0;
    let ud = 0;
    for (const u of zona.unidades ?? []) {
      const t = r.unidades.find((x) => x.id === u.tipoId);
      if (t?.clase !== "vivienda") continue;
      const k = Math.max(0, Math.trunc(u.cantidad));
      sup += t.superficieUtil_m2 * k;
      ud += cifrasTipo(t).ud * k;
    }
    out.push(
      { etiqueta: `Superficie de las viviendas${porPlanta}`, valor: fmt(sup, "m²", 0) },
      ocupacion(si.residencialVivienda),
      { etiqueta: `Unidades de desagüe${porPlanta} · HS5`, valor: fmt(ud, "UD", 1), cita: CITA_UD },
    );
  } else if (zona.uso === "vivienda_unifamiliar") {
    out.push(ocupacion(si.residencialVivienda));
  } else if (zona.uso === "oficinas") {
    const nucleos = (zona.unidades ?? []).reduce((a, u) => a + Math.max(0, Math.trunc(u.cantidad)), 0);
    out.push(
      ocupacion(si.administrativoOficinas),
      {
        etiqueta: "Aire exterior · RITE IDA 2",
        valor: `${fmt(AIRE_EXTERIOR_RITE.datos.ida2_dm3_s_persona, "dm³/s", 1)} por persona`,
        cita: "RITE IT 1.1.4.2.3.1, método A, tabla 1.4.2.1 (mínimo)",
      },
      previsionLocal(),
      { etiqueta: `Núcleos de aseos${porPlanta}`, valor: String(nucleos) },
    );
  } else if (zona.uso === "local_sin_uso") {
    out.push(
      { etiqueta: "Ocupación · SI 3", valor: "según el uso que se le asimile", cita: "DB-SI, SI 3, ap. 2.1" },
      previsionLocal(),
    );
  } else if (zona.uso === "vestibulo" && res.tipo === "oficinas") {
    out.push(ocupacion(si.administrativoVestibulos));
  } else if (zona.uso === "garaje") {
    const plazas = Math.max(0, Math.trunc(zona.plazas ?? 0));
    out.push(
      {
        etiqueta: `Ventilación${porPlanta} · HS3`,
        valor: fmt(plazas * CAUDALES_NO_HABITABLES.datos.aparcamiento_l_s_plaza, "l/s", 0),
        cita: "DB-HS3 tabla 2.2",
      },
      // Vinculado a oficinas: actividad sujeta a horarios; a viviendas, «otros casos».
      ocupacion(res.tipo === "oficinas" ? si.aparcamientoConHorario : si.aparcamientoOtros),
    );
  } else if (zona.uso === "trasteros") {
    if (res.tieneViviendas) {
      out.push(
        {
          etiqueta: `Ventilación${porPlanta} · HS3`,
          valor: fmt(zona.superficieUtil_m2 * CAUDALES_NO_HABITABLES.datos.trasteros_l_s_m2, "l/s", 1),
          cita: "DB-HS3 tabla 2.2",
        },
        { etiqueta: "Ocupación · SI", valor: "nula", cita: "DB-SI, Anejo SI A: trasteros de vivienda" },
      );
    } else {
      out[0] = { etiqueta: "Su superficie cuenta para", valor: "ninguna: fuera de HS3 en este edificio" };
      out.push({ etiqueta: "Ventilación", valor: "por el RITE", cita: "DB-HS3 ap. 1.1" });
    }
  } else if (zona.uso === "instalaciones") {
    out.push({
      etiqueta: "Ocupación · SI 3",
      valor: "nula: solo mantenimiento",
      cita: CITA_SI,
    });
  }

  const vecinas = vecinasDe(r, grupo.id);
  if (vecinas) {
    const encima = listaUsos(vecinas.encima.usos);
    const debajo = listaUsos(vecinas.debajo.usos);
    out.push(
      { etiqueta: "Encima", valor: encima ? `${vecinas.encima.etiqueta}: ${encima}` : vecinas.encima.etiqueta },
      { etiqueta: "Debajo", valor: debajo ? `${vecinas.debajo.etiqueta}: ${debajo}` : vecinas.debajo.etiqueta },
    );
  }
  return out;
}

/** Usos con espacios habitables: los que HS6 protege si tocan el terreno. */
const HABITABLES_HS6: ReadonlySet<UsoZona> = new Set([
  "viviendas",
  "vivienda_unifamiliar",
  "local_sin_uso",
  "oficinas",
  "vestibulo",
]);

/** «Lo usan» de una zona, con la fila de HS6 según toque o no el terreno. */
export function loUsanZona(e: Edificio, zonaId: string): LoUsa[] {
  const r = renumerar(e);
  const hallada = buscarZona(r, zonaId);
  if (!hallada) return [];
  const { grupo, zona } = hallada;
  let filas = [...USOS[zona.uso].loUsan];
  // Los trasteros solo entran en HS3 en edificios de viviendas (DB-HS3 ap. 1.1).
  if (zona.uso === "trasteros" && !resumenEdificio(r).tieneViviendas) {
    filas = filas.map((f) =>
      f.codigo === "HS3" ? { codigo: "HS3", texto: "no aplica en este edificio: RITE", trato: "otra" } : f,
    );
  }
  if (HABITABLES_HS6.has(zona.uso)) {
    const toca = grupoTocaTerreno(r, grupo.id);
    const fila: LoUsa = toca
      ? { codigo: "HS6", texto: "toca el terreno: radón, si el municipio está en el Apéndice B", trato: "si" }
      : { codigo: "HS6", texto: "no toca el terreno", trato: "no" };
    // Detrás de HS5 (orden de la barra lateral).
    const i = filas.findIndex((f) => f.codigo === "HS5");
    filas.splice(i >= 0 ? i + 1 : filas.length, 0, fila);
  }
  return filas;
}
