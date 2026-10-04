// =============================================================================
// VIVIENDA TIPO — generadores de redes por módulo (feature-8 §C, UX-RECONCEPT
// §6.2): "la herramienta propone, el proyectista dispone".
//
// Núcleo de los generadores: trabaja con viviendas tipo y un reparto por planta
// física. Desde feature-12 nadie lo llama directamente: `./index.ts` saca el
// reparto de las zonas de viviendas de El edificio.
//
// Funciones PURAS y DETERMINISTAS (SPEC §4): sin React/DOM, sin Date.now ni
// Math.random. Mismo input → mismo output. Ids y nombres ESTABLES derivados de
// la posición (planta · tipo · instancia): `p2-t2a-bano` / "P2 · T2a · Ramal
// baño". El resultado REEMPLAZA las colecciones del módulo (previa confirmación
// en la UI) y todo queda editable después: son propuestas, no verdades.
//
// Cifras: aquí NO se fija ninguna cifra normativa. Los caudales propuestos de
// HS3 salen de la Tabla 2.1 (`CAUDALES_LOCALES_HABITABLES`) y la cocción de
// `COCCION_MIN`; las composiciones de aparatos, de `PRESETS_APARATOS`
// (feature-7). Las longitudes/alturas son criterio geométrico de proyecto
// (editables), documentadas junto a cada constante.
//
// -----------------------------------------------------------------------------
// SEMÁNTICA HS3 (decidida con el motor delante — ver hs3/calc.ts):
//
// El modo red de HS3 exige que cada `PlantaColectivo` referencie estancias
// DISTINTAS (asignar la misma estancia a dos plantas es bloqueo por "doble
// conteo") y reconcilia el qvt de la red contra el total de húmedos de
// `estancias`. Por tanto la ÚNICA representación honesta del edificio en
// colectiva es la **VERTICAL TIPO**: una instancia de la vivienda tipo MÁS
// desfavorable por cada nivel del reparto (sus estancias completas, secas y
// húmedas), y un colectivo por cuarto húmedo cuyas plantas referencian la
// instancia de ese cuarto en cada nivel. Consecuencias (van en `notas` para que
// la UI las muestre):
//  - Si una planta tiene varias viviendas, NO son representables sin doble
//    conteo: se genera UNA vertical tipo y se avisa ("duplica colectivos si
//    procede") — cada vertical adicional es idéntica a la generada.
//  - Las verificaciones agregadas del motor (extracción total de húmedos,
//    balance admisión/extracción, área de paso) suman TODA la vertical; por
//    vivienda corresponden a los valores de UNA planta. Las verificaciones por
//    estancia (Tabla 2.1 por local) sí son exactas para cada vivienda.
//  - Los caudales propuestos nacen CUMPLIENDO: mínimos de la Tabla 2.1 por
//    local, mínimo total de húmedos repartido a partes iguales y equilibrado
//    admisión/extracción al mayor (anejo de términos del DB) añadiendo el
//    déficit al salón (o a la cocina si sobra admisión).
// =============================================================================

import type { ViviendaTipo as ViviendaTipoEdificio } from "../tipos";
import type { AparatoInput, TramoInput } from "../../../modules/hs5/calc";
import type { AparatoInputHS4, TramoInputHS4 } from "../../../modules/hs4/calc";
import type { Colectivo, Estancia, HS3Inputs, TipoEstancia } from "../../../modules/hs3/calc";
import { categoriaDeDormitorios } from "../../../modules/hs3/calc";
import { CAUDALES_LOCALES_HABITABLES, COCCION_MIN } from "../../../modules/hs3/tablas";
import { PRESETS_APARATOS, type PresetAparatos } from "../../../data/presetsAparatos";

/** Lo que los generadores leen de una vivienda tipo. */
export type ViviendaTipo = Pick<
  ViviendaTipoEdificio,
  "id" | "nombre" | "dormitorios" | "banos" | "aseos"
>;

/**
 * Viviendas tipo de una planta FÍSICA (0 = PB, 1, 2…), coherente con
 * `PlantaColectivo.nivel` de HS3.
 */
export interface RepartoPlanta {
  nivel: number;
  viviendas: { tipoId: string; cantidad: number }[];
}

// -----------------------------------------------------------------------------
// CRITERIOS GEOMÉTRICOS DE PROYECTO (NO normativos, editables tras generar)
// -----------------------------------------------------------------------------

/**
 * Altura entre plantas [m] para el montante de HS4 — criterio geométrico de
 * proyecto (coherente con la estimación 3 m/planta de `derivar.ts` para la
 * altura de evacuación). NO es cifra del DB.
 */
const ALTURA_PLANTA_M = 3;

/** Longitudes propuestas [m] (criterio de proyecto, espejo de los defaults de módulo). */
const LONGITUDES_M = {
  /** HS5: ramal de baño/aseo. */
  ramalBanoAseo: 2,
  /** HS5: ramal de cocina. */
  ramalCocina: 3,
  /** HS4: acometida. */
  acometida: 3,
  /** HS4: tubo de alimentación. */
  tuboAlimentacion: 5,
  /** HS4: derivación particular de cada vivienda. */
  derivacionParticular: 4,
  /** HS4: derivación individual de aparato. */
  derivacionAparato: 1.5,
} as const;

// -----------------------------------------------------------------------------
// HELPERS PUROS DE NOMBRADO Y SANEAMIENTO
// -----------------------------------------------------------------------------

/** Entero ≥ 0 saneado (no finito o negativo → 0). */
function sanea(n: number): number {
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0;
}

/** Slug determinista para ids: minúsculas, sin diacríticos, [a-z0-9-]. */
function slugDe(s: string): string {
  const limpio = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return limpio === "" ? "tipo" : limpio;
}

/** "baño" → "Baño". Para nombres legibles (los ids siguen usando `slugDe`). */
function capitalizar(s: string): string {
  return s.length === 0 ? s : s[0].toUpperCase() + s.slice(1);
}

/** Letra de instancia (0→"a", 1→"b", …, 25→"z", 26→"aa" — estilo hoja de cálculo). */
function letraDe(k: number): string {
  let n = k + 1;
  let s = "";
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(97 + r) + s;
    n = Math.trunc((n - 1) / 26);
  }
  return s;
}

// -----------------------------------------------------------------------------
// CUARTOS HÚMEDOS DE UNA VIVIENDA TIPO
// -----------------------------------------------------------------------------

/** Un cuarto húmedo concreto de la vivienda tipo (cocina SIEMPRE presente: 1 por vivienda). */
interface CuartoHumedo {
  /** Clave del preset de aparatos (feature-7). */
  key: PresetAparatos["key"];
  /** Sufijo de id estable: "bano", "bano-2", "aseo", "cocina"… */
  slug: string;
  /** Etiqueta legible en minúscula: "baño 2", "aseo", "cocina". */
  etiqueta: string;
}

/**
 * Cuartos húmedos de una vivienda tipo, en orden estable: baños → aseos →
 * cocina. El índice solo aparece cuando hay más de un cuarto del mismo tipo
 * (1 baño → "bano"; 2 baños → "bano-1"/"bano-2").
 */
function cuartosHumedosDe(vt: ViviendaTipo): CuartoHumedo[] {
  const banos = sanea(vt.banos);
  const aseos = sanea(vt.aseos);
  const out: CuartoHumedo[] = [];
  for (let i = 1; i <= banos; i++) {
    out.push({
      key: "bano",
      slug: banos > 1 ? `bano-${i}` : "bano",
      etiqueta: banos > 1 ? `baño ${i}` : "baño",
    });
  }
  for (let i = 1; i <= aseos; i++) {
    out.push({
      key: "aseo",
      slug: aseos > 1 ? `aseo-${i}` : "aseo",
      etiqueta: aseos > 1 ? `aseo ${i}` : "aseo",
    });
  }
  out.push({ key: "cocina", slug: "cocina", etiqueta: "cocina" });
  return out;
}

/** Preset de aparatos por clave (feature-7). Las tres claves existen siempre. */
function presetDe(key: PresetAparatos["key"]): PresetAparatos {
  return PRESETS_APARATOS.find((p) => p.key === key)!;
}

// -----------------------------------------------------------------------------
// RESOLUCIÓN DEL REPARTO → POSICIONES DE VIVIENDA (compartida por HS4/HS5)
// -----------------------------------------------------------------------------

/** Una vivienda concreta colocada en el edificio (planta · tipo · instancia). */
interface PosicionVivienda {
  nivel: number;
  vt: ViviendaTipo;
  /** Prefijo de id, p.ej. "p2-t2a-" (vacío en unifamiliar). */
  prefId: string;
  /** Prefijo de nombre, p.ej. "P2 · T2a · " (vacío en unifamiliar). */
  prefNombre: string;
}

/** Reparto resuelto y saneado (determinista). */
interface RepartoResuelto {
  posiciones: PosicionVivienda[];
  /** Niveles únicos con viviendas, en orden ascendente. */
  niveles: number[];
  /** `true` si hubo reparto efectivo (modo colectiva). */
  esColectiva: boolean;
  /** Ids de vivienda tipo realmente usados por el reparto. */
  tiposUsados: Set<string>;
  /** Alguna planta aloja más de una vivienda (⇒ vertical tipo en HS3). */
  multiplesViviendasPorPlanta: boolean;
}

const REPARTO_VACIO: RepartoResuelto = {
  posiciones: [],
  niveles: [],
  esColectiva: false,
  tiposUsados: new Set(),
  multiplesViviendasPorPlanta: false,
};

/**
 * Resuelve el reparto en posiciones concretas de vivienda. Saneado determinista:
 * niveles no finitos y tipos desconocidos se ignoran; niveles repetidos y tipos
 * repetidos dentro de una planta se FUSIONAN (suman cantidades); cantidades se
 * truncan y las ≤ 0 se descartan. Sin reparto (unifamiliar, caso degenerado):
 * una sola vivienda —la PRIMERA de la lista— en una planta (nivel 0), con
 * prefijos vacíos (ids "bano", "cocina"… sin posición).
 */
function resolverReparto(
  vts: ViviendaTipo[],
  reparto: RepartoPlanta[] | undefined,
): RepartoResuelto {
  if (vts.length === 0) return REPARTO_VACIO;

  if (!reparto || reparto.length === 0) {
    return {
      posiciones: [{ nivel: 0, vt: vts[0], prefId: "", prefNombre: "" }],
      niveles: [0],
      esColectiva: false,
      tiposUsados: new Set([vts[0].id]),
      multiplesViviendasPorPlanta: false,
    };
  }

  // Índice de tipos: ante id duplicado gana la PRIMERA aparición (determinista).
  const vtPorId = new Map<string, ViviendaTipo>();
  for (const v of vts) if (!vtPorId.has(v.id)) vtPorId.set(v.id, v);

  // Fusión por nivel → tipo → cantidad (orden de primera aparición).
  const porNivel = new Map<number, Map<string, number>>();
  for (const p of reparto) {
    if (!Number.isFinite(p.nivel)) continue;
    const nivel = Math.trunc(p.nivel);
    let m = porNivel.get(nivel);
    if (!m) {
      m = new Map();
      porNivel.set(nivel, m);
    }
    for (const v of p.viviendas) {
      if (!vtPorId.has(v.tipoId)) continue; // tipo desconocido: se ignora
      const cantidad = Number.isFinite(v.cantidad) ? Math.trunc(v.cantidad) : 0;
      if (cantidad <= 0) continue;
      m.set(v.tipoId, (m.get(v.tipoId) ?? 0) + cantidad);
    }
  }

  const niveles = [...porNivel.keys()]
    .filter((n) => (porNivel.get(n)?.size ?? 0) > 0)
    .sort((a, b) => a - b);

  const posiciones: PosicionVivienda[] = [];
  const tiposUsados = new Set<string>();
  const prefijosUsados = new Set<string>();
  let multiples = false;

  for (const nivel of niveles) {
    const m = porNivel.get(nivel)!;
    let totalPlanta = 0;
    for (const c of m.values()) totalPlanta += c;
    if (totalPlanta > 1) multiples = true;

    for (const [tipoId, cantidad] of m) {
      const vt = vtPorId.get(tipoId)!;
      tiposUsados.add(tipoId);
      for (let k = 0; k < cantidad; k++) {
        const letra = cantidad > 1 ? letraDe(k) : "";
        let prefId = `p${nivel}-${slugDe(vt.id)}${letra}-`;
        // Dedupe defensivo (colisión de slugs entre tipos con ids distintos).
        const base = prefId.slice(0, -1);
        for (let s = 2; prefijosUsados.has(prefId); s++) prefId = `${base}x${s}-`;
        prefijosUsados.add(prefId);
        posiciones.push({
          nivel,
          vt,
          prefId,
          prefNombre: `P${nivel} · ${vt.nombre}${letra} · `,
        });
      }
    }
  }

  if (posiciones.length === 0) return REPARTO_VACIO;
  return {
    posiciones,
    niveles,
    esColectiva: true,
    tiposUsados,
    multiplesViviendasPorPlanta: multiples,
  };
}

/**
 * Vivienda tipo MÁS desfavorable para HS3: entre las usadas por el reparto (o
 * todas si el reparto no usa ninguna), la de más dormitorios; a igualdad, la de
 * más cuartos húmedos (baños + aseos); a igualdad, la primera de la lista.
 *
 * El pool se DEDUPLICA por id con la misma regla que `resolverReparto` (gana la
 * PRIMERA aparición): ante ids repetidos (p.ej. un `.json` importado a mano), la
 * vivienda que el reparto coloca es la primera, así que HS3 debe dimensionar esa
 * y no la homónima ensombrecida (si no, HS3 y HS4/HS5 propondrían viviendas
 * distintas para la misma posición).
 */
function masDesfavorable(vts: ViviendaTipo[], usados: ReadonlySet<string>): ViviendaTipo {
  const porId = new Map<string, ViviendaTipo>();
  for (const v of vts) if (!porId.has(v.id)) porId.set(v.id, v);
  const unicas = [...porId.values()];
  const candidatas = unicas.filter((v) => usados.has(v.id));
  const pool = candidatas.length > 0 ? candidatas : unicas;
  let mejor = pool[0];
  for (const v of pool.slice(1)) {
    const dv = sanea(v.dormitorios);
    const dm = sanea(mejor.dormitorios);
    const hv = sanea(v.banos) + sanea(v.aseos);
    const hm = sanea(mejor.banos) + sanea(mejor.aseos);
    if (dv > dm || (dv === dm && hv > hm)) mejor = v;
  }
  return mejor;
}

// =============================================================================
// GENERADOR HS5 — saneamiento (colector → bajante → ramal por cuarto húmedo)
// =============================================================================

/**
 * Genera la red de saneamiento propuesta: colector raíz (enterrado) → bajante
 * única → un ramal por cuarto húmedo de cada vivienda del reparto, con los
 * aparatos de `PRESETS_APARATOS` (baño/aseo como "cuartos" AGRUPADOS de la
 * Tabla 4.1; cocina desglosada). Pendientes y disposición se omiten: aplican
 * los defaults del motor. Sin reparto (unifamiliar): una sola vivienda (la
 * primera) en una planta.
 */
export function generarHs5Reparto(
  vts: ViviendaTipo[],
  reparto: RepartoPlanta[] | undefined,
): { tramos: TramoInput[]; aparatos: AparatoInput[] } {
  const { posiciones } = resolverReparto(vts, reparto);
  if (posiciones.length === 0) return { tramos: [], aparatos: [] };

  const tramos: TramoInput[] = [
    { id: "colector", nombre: "Colector", tipo: "colector", parentId: null },
    { id: "bajante", nombre: "Bajante", tipo: "bajante", parentId: "colector" },
  ];
  const aparatos: AparatoInput[] = [];

  for (const pos of posiciones) {
    for (const cuarto of cuartosHumedosDe(pos.vt)) {
      const ramalId = pos.prefId + cuarto.slug;
      tramos.push({
        id: ramalId,
        nombre: `${pos.prefNombre}Ramal ${cuarto.etiqueta}`,
        tipo: "ramal",
        parentId: "bajante",
        longitud_m: cuarto.key === "cocina" ? LONGITUDES_M.ramalCocina : LONGITUDES_M.ramalBanoAseo,
      });
      for (const a of presetDe(cuarto.key).hs5) {
        aparatos.push({
          id: `${ramalId}-${slugDe(a.tipo)}`,
          // El nombre sitúa el aparato (planta · vivienda · cuarto); el TIPO
          // exacto lo muestra la columna contigua del outliner, así que no se
          // repite aquí. Sin nombre, la tabla enseñaría el id crudo.
          nombre: `${pos.prefNombre}${capitalizar(cuarto.etiqueta)}`,
          tipo: a.tipo,
          tramoId: ramalId,
        });
      }
    }
  }
  return { tramos, aparatos };
}

// =============================================================================
// GENERADOR HS4 — suministro (acometida → alimentación → montante → viviendas)
// =============================================================================

/**
 * Genera la red de agua fría propuesta: acometida (raíz) → tubo de alimentación
 * → montante por tramos (un segmento por nivel con viviendas, subiendo
 * `ALTURA_PLANTA_M` por planta de diferencia) → por vivienda una derivación
 * particular y una derivación individual por cada aparato de los presets
 * (Tabla 2.1 de HS4: sin agrupados, siempre desglosado). Materiales: metálica
 * en la vertical común, multicapa dentro de la vivienda (espejo de los
 * defaults del módulo; editable).
 */
export function generarHs4Reparto(
  vts: ViviendaTipo[],
  reparto: RepartoPlanta[] | undefined,
): { tramos: TramoInputHS4[]; aparatos: AparatoInputHS4[] } {
  const { posiciones, niveles, esColectiva } = resolverReparto(vts, reparto);
  if (posiciones.length === 0) return { tramos: [], aparatos: [] };

  const tramos: TramoInputHS4[] = [
    {
      id: "acometida",
      nombre: "Acometida",
      tipo: "acometida",
      parentId: null,
      material: "metalica",
      longitud_m: LONGITUDES_M.acometida,
    },
    {
      id: "alimentacion",
      nombre: "Tubo de alimentación",
      tipo: "tubo_alimentacion",
      parentId: "acometida",
      material: "metalica",
      longitud_m: LONGITUDES_M.tuboAlimentacion,
    },
  ];
  const aparatos: AparatoInputHS4[] = [];

  // --- Montante por segmentos: cada nivel cuelga del anterior. La subida es
  //     proporcional a la diferencia de plantas (los huecos también suben).
  const montanteId = (nivel: number) => (esColectiva ? `montante-p${nivel}` : "montante");
  let nivelAnterior = 0;
  let parentAnterior = "alimentacion";
  for (const nivel of niveles) {
    const subida_m = (nivel - nivelAnterior) * ALTURA_PLANTA_M;
    tramos.push({
      id: montanteId(nivel),
      nombre: esColectiva ? `Montante · P${nivel}` : "Montante",
      tipo: "columna_montante",
      parentId: parentAnterior,
      material: "metalica",
      // Vertical: la longitud del segmento es su subida (mínimo 1 m de conexión).
      longitud_m: subida_m > 0 ? subida_m : 1,
      ...(subida_m > 0 ? { altura_m: subida_m } : {}),
    });
    parentAnterior = montanteId(nivel);
    nivelAnterior = nivel;
  }

  // --- Por vivienda: derivación particular + derivación por aparato.
  for (const pos of posiciones) {
    const derivId = `${pos.prefId}deriv-particular`;
    tramos.push({
      id: derivId,
      nombre: `${pos.prefNombre}Derivación particular`,
      tipo: "derivacion_particular",
      parentId: montanteId(pos.nivel),
      material: "termoplastico_multicapa",
      longitud_m: LONGITUDES_M.derivacionParticular,
    });
    for (const cuarto of cuartosHumedosDe(pos.vt)) {
      for (const a of presetDe(cuarto.key).hs4) {
        const apId = `${pos.prefId}${cuarto.slug}-${slugDe(a.tipo)}`;
        tramos.push({
          id: `d-${apId}`,
          nombre: `Deriv. ${cuarto.etiqueta}`,
          tipo: "derivacion_aparato",
          parentId: derivId,
          material: "termoplastico_multicapa",
          longitud_m: LONGITUDES_M.derivacionAparato,
        });
        // Ver la nota de `generarHs5`: nombre = situación, tipo = columna propia.
        aparatos.push({
          id: apId,
          nombre: `${pos.prefNombre}${capitalizar(cuarto.etiqueta)}`,
          tipo: a.tipo,
          tramoId: `d-${apId}`,
        });
      }
    }
  }
  return { tramos, aparatos };
}

// =============================================================================
// GENERADOR HS3 — ventilación (vertical tipo, ver decisión en la cabecera)
// =============================================================================

/** Retorno de `generarHs3`: los campos de `HS3Inputs` que el generador propone. */
export interface GeneracionHs3
  extends Pick<HS3Inputs, "numDormitorios" | "estancias" | "modoConducto" | "redColectivos"> {
  /** Nº de plantas del conducto (modo rápido / conducto informativo): span de niveles. */
  numPlantasConducto: number;
  /** Notas de honestidad para la UI (limitaciones de la representación). */
  notas: string[];
}

/**
 * Genera la propuesta de HS3. Sin reparto (unifamiliar): estancias de la
 * primera vivienda tipo, modo rápido con 1 planta y sin red. Con reparto
 * (colectiva): VERTICAL TIPO en modo avanzado — una instancia completa de la
 * vivienda más desfavorable por nivel y un colectivo por cuarto húmedo cuyas
 * plantas referencian la instancia de ese cuarto en cada nivel (semántica del
 * kernel multiplanta: sin doble conteo y con reconciliación exacta del qvt).
 */
export function generarHs3Reparto(
  vts: ViviendaTipo[],
  reparto: RepartoPlanta[] | undefined,
): GeneracionHs3 {
  const info = resolverReparto(vts, reparto);
  if (info.posiciones.length === 0) {
    return {
      numDormitorios: 0,
      estancias: [],
      modoConducto: "rapido",
      numPlantasConducto: 1,
      notas: ["Define al menos una vivienda tipo (y un reparto válido) para generar las estancias."],
    };
  }

  // --- Unifamiliar (caso degenerado): una vivienda, modo rápido, sin red. ----
  if (!info.esColectiva) {
    const vt = info.posiciones[0].vt;
    return {
      numDormitorios: sanea(vt.dormitorios),
      estancias: estanciasDeVivienda(vt, ""),
      modoConducto: "rapido",
      numPlantasConducto: 1,
      notas: [],
    };
  }

  // --- Colectiva: vertical tipo con la vivienda más desfavorable. ------------
  const vt = masDesfavorable(vts, info.tiposUsados);
  const niveles = info.niveles;
  const estancias = niveles.flatMap((n) => estanciasDeVivienda(vt, `p${n}-`));

  const colectivos: Colectivo[] = cuartosHumedosDe(vt).map((cuarto) => ({
    // TODO(feature-8 ¶A): cuando `Colectivo`/`Estancia` ganen `nombre?`, poner aquí
    // "Colectivo baño" / "P2 · Baño" (hoy el modelo de hs3/calc.ts no lo tiene).
    id: `col-${cuarto.slug}`,
    plantas: niveles.map((n) => ({ nivel: n, estanciasIds: [`p${n}-${cuarto.slug}`] })),
  }));

  const span = niveles[niveles.length - 1] - niveles[0] + 1;

  const notas: string[] = [
    `Vertical tipo generada con la vivienda más desfavorable ("${vt.nombre}"): una vivienda por planta y un colectivo de extracción por cuarto húmedo.`,
    "Las verificaciones agregadas (extracción total de húmedos, balance y área de paso) suman toda la vertical; por vivienda corresponden a los valores de una planta.",
  ];
  if (info.multiplesViviendasPorPlanta) {
    notas.push(
      "Hay plantas con más de una vivienda: la red modela UNA vertical tipo (HS3 no permite referenciar la misma estancia en varias plantas sin doble conteo). Duplica los colectivos por cada vertical adicional si procede.",
    );
  }
  if (info.tiposUsados.size > 1) {
    notas.push(
      `El reparto mezcla varios tipos de vivienda: la vertical se genera con el más desfavorable ("${vt.nombre}").`,
    );
  }

  return {
    numDormitorios: sanea(vt.dormitorios),
    estancias,
    modoConducto: "avanzado",
    redColectivos: colectivos,
    numPlantasConducto: span,
    notas,
  };
}

/**
 * Estancias de UNA vivienda tipo con caudales propuestos que CUMPLEN de
 * partida (todas las cifras salen de la Tabla 2.1 / `COCCION_MIN`):
 *  - Secas: dormitorio principal (si hay dormitorios) + resto de dormitorios +
 *    salón, cada una con su mínimo de tabla.
 *  - Húmedas: baños + aseos + cocina, todas con el mismo caudal
 *    `max(mínimo por local, mínimo total de vivienda / nº de húmedos)`.
 *  - Cocina: además, extracción de COCCIÓN independiente al mínimo exigido.
 *  - Equilibrado admisión/extracción al MAYOR (anejo de términos del DB): el
 *    déficit de admisión se añade al salón; el de extracción, a la cocina.
 */
function estanciasDeVivienda(vt: ViviendaTipo, prefId: string): Estancia[] {
  const t = CAUDALES_LOCALES_HABITABLES.datos;
  const dormitorios = sanea(vt.dormitorios);
  const cat = categoriaDeDormitorios(dormitorios);
  const cuartos = cuartosHumedosDe(vt);
  const qHumedo = Math.max(
    t.humedosPorLocal[cat] ?? 0,
    (t.humedosTotalVivienda[cat] ?? 0) / cuartos.length,
  );

  // TODO(feature-8 ¶A): cuando `Estancia` gane `nombre?`, añadir aquí nombres
  // legibles ("P2 · Dormitorio principal"…) con el prefijo de posición.
  const secas: Estancia[] = [];
  if (dormitorios >= 1) {
    secas.push({
      id: `${prefId}dorm-principal`,
      tipo: "dorm_principal",
      caudalPropuesto_l_s: t.dormitorioPrincipal[cat] ?? 0,
    });
  }
  for (let i = 2; i <= dormitorios; i++) {
    secas.push({
      id: `${prefId}dorm-${i}`,
      tipo: "dormitorio",
      caudalPropuesto_l_s: t.restoDormitorios[cat] ?? 0,
    });
  }
  const salon: Estancia = {
    id: `${prefId}salon`,
    tipo: "salon_comedor",
    caudalPropuesto_l_s: t.salasEstarComedores[cat] ?? 0,
  };
  secas.push(salon);

  const tipoDeCuarto: Record<PresetAparatos["key"], TipoEstancia> = {
    bano: "bano",
    aseo: "aseo",
    cocina: "cocina",
  };
  const humedas: Estancia[] = cuartos.map((cuarto) => ({
    id: prefId + cuarto.slug,
    tipo: tipoDeCuarto[cuarto.key],
    caudalPropuesto_l_s: qHumedo,
    ...(cuarto.key === "cocina"
      ? { esCoccion: true, caudalCoccion_l_s: COCCION_MIN.datos.caudalMin_l_s }
      : {}),
  }));
  const cocina = humedas[humedas.length - 1]; // siempre presente (última)

  // Equilibrado al mayor: la propuesta nace con balance exacto.
  const sumaAdm = secas.reduce((a, e) => a + e.caudalPropuesto_l_s, 0);
  const sumaExt = humedas.reduce((a, e) => a + e.caudalPropuesto_l_s, 0);
  if (sumaExt > sumaAdm) salon.caudalPropuesto_l_s += sumaExt - sumaAdm;
  else if (sumaAdm > sumaExt) cocina.caudalPropuesto_l_s += sumaAdm - sumaExt;

  return [...secas, ...humedas];
}

// =============================================================================
// LO QUE SE DEDUCE DE UNA VIVIENDA TIPO (El edificio, feature-12)
// =============================================================================

/**
 * Aparatos que el generador pone en una vivienda tipo: los de los presets de
 * cada cuarto húmedo (baños, aseos y la cocina).
 */
export function aparatosDeVivienda(vt: ViviendaTipo): {
  hs5: PresetAparatos["hs5"][number]["tipo"][];
  hs4: PresetAparatos["hs4"][number]["tipo"][];
} {
  const cuartos = cuartosHumedosDe(vt);
  return {
    hs5: cuartos.flatMap((c) => presetDe(c.key).hs5.map((a) => a.tipo)),
    hs4: cuartos.flatMap((c) => presetDe(c.key).hs4.map((a) => a.tipo)),
  };
}

/**
 * Caudal de ventilación de la vivienda tal y como la propone el generador de HS3
 * [l/s]: admisión por los locales secos, ya equilibrada con la extracción de los
 * húmedos (entra = sale).
 */
export function caudalVentilacionVivienda_l_s(vt: ViviendaTipo): number {
  const SECOS: ReadonlySet<TipoEstancia> = new Set(["dorm_principal", "dormitorio", "salon_comedor"]);
  return estanciasDeVivienda(vt, "")
    .filter((e) => SECOS.has(e.tipo))
    .reduce((a, e) => a + e.caudalPropuesto_l_s, 0);
}
