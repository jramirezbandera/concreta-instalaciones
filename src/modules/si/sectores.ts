// =============================================================================
// DB-SI — Los sectores de incendio (feature-19): cómo se compartimenta el
// edificio por la tabla 1.1 de SI 1, qué separa a cada sector del resto
// (tabla 1.2) y las condiciones de cada local de riesgo especial (tabla 2.2 con
// su nota 2). Lo usan SI 1, SI 2 (franjas de fachada entre sectores) y SI 6. PURO.
//
// Reglas (research/verificacion-si1-si2.md, bloques A1 y A3):
//   - el sector principal es el del uso principal: las viviendas (o la
//     unifamiliar, que nunca tiene sectores dentro) o las oficinas, con sus zonas
//     comunes y los trasteros y cuartos que no son local de riesgo especial;
//   - el garaje de más de 100 m² construidos (uso Aparcamiento) es sector propio
//     y se comunica con el resto por vestíbulo de independencia;
//   - el local sin uso es sector propio: se le aplica el uso Comercial salvo que
//     se diga que será Administrativo, y uno Administrativo de hasta 500 m²
//     construidos en un edificio de viviendas no precisa serlo (criterio C3);
//   - las oficinas en un edificio de viviendas, sector si exceden de 500 m²; las
//     viviendas en uno de oficinas, siempre;
//   - un sector principal de más de 2 500 m² construidos se divide por plantas;
//   - los locales de riesgo especial no son sectores ni cuentan en su superficie.
// La resistencia de lo que separa dos sectores es la mayor de las dos filas de la
// tabla 1.2 (criterio C6): cada sector la cumple con el fuego en su interior.
// =============================================================================

import { dependeDeConstruida, superficies, type EdificioSi, type UsoSi, type ZonaSi } from "./edificio";
import { clasificarRiesgo, type ClasificacionRiesgo, type LocalRiesgo } from "./riesgo";
import {
  columnaAltura,
  CONDICIONES_RIESGO_TABLA_2_2,
  eiTabla12,
  puertaEI2,
  SECTORES_TABLA_1_1,
  type FilaTabla12,
} from "./tablas";

/** Uso de un sector, por las filas de las tablas 1.1 y 1.2. */
export type UsoSector = "residencial" | "administrativo" | "comercial" | "aparcamiento";

export interface SuperficieSector {
  util_m2: number;
  construida_m2: number;
  supuesta: boolean;
}

export interface SectorSi {
  /** «principal», «garaje», «oficinas», «viviendas», «local-z2». */
  id: string;
  uso: UsoSector;
  /** El uso del local sin uso, supuesto Comercial. */
  usoSupuesto: boolean;
  principal: boolean;
  zonas: ZonaSi[];
  superficie: SuperficieSector;
  /** Superficie máxima de la tabla 1.1 [m²] (null: el aparcamiento no tiene). */
  limite_m2: number | null;
  /** El principal dividido por plantas: cada planta es un sector. */
  porPlantas: boolean;
  /** La planta más grande del sector principal dividido por plantas. */
  plantaMayor: (SuperficieSector & { etiqueta: string }) | null;
  /** La construida decide algo de este sector (si es sector, o si se divide). */
  dependeDeConstruida: boolean;
  /** Todas sus zonas están bajo rasante. */
  bajoRasante: boolean;
  /** Niveles que ocupa, de arriba abajo. */
  niveles: number[];
}

/** Lo que separa un sector del principal (tabla 1.2). */
export interface LimiteSector {
  sector: SectorSi;
  /** EI de paredes y techos [min]; el techo, como REI. */
  ei: number;
  /** Hay sector principal encima: el forjado es techo del sector (REI). */
  techo: boolean;
  /** Vestíbulo de independencia en cada comunicación (uso Aparcamiento). */
  vestibulo: boolean;
  /** Puerta de paso [min]: EI2 t-C5. */
  puerta_EI2: number;
}

/** Una zona de otro uso que no precisa ser sector y va con el principal. */
export interface ZonaExenta {
  zona: ZonaSi;
  motivo: "establecimiento" | "subsidiaria";
  dependeDeConstruida: boolean;
}

export interface Compartimentacion {
  edificio: EdificioSi;
  riesgo: ClasificacionRiesgo;
  sectores: SectorSi[];
  principal: SectorSi;
  exentas: ZonaExenta[];
  /** Altura de evacuación del edificio [m]: decide las columnas de la tabla 1.2. */
  h_m: number;
}

export function filaTabla12(uso: UsoSector): FilaTabla12 {
  return uso === "comercial" ? "comercial" : uso === "aparcamiento" ? "aparcamiento" : "residencial";
}

function usoSectorDe(u: UsoSi): UsoSector {
  switch (u) {
    case "residencial_vivienda":
    case "vivienda_unifamiliar":
      return "residencial";
    case "administrativo":
      return "administrativo";
    case "aparcamiento":
      return "aparcamiento";
    case "sin_uso":
      return "comercial";
  }
}

function niveles(zonas: readonly ZonaSi[]): number[] {
  return [...new Set(zonas.flatMap((z) => z.niveles))].sort((a, b) => b - a);
}

function sector(id: string, uso: UsoSector, zonas: ZonaSi[], extra: Partial<SectorSi> = {}): SectorSi {
  const ns = niveles(zonas);
  return {
    id,
    uso,
    usoSupuesto: false,
    principal: false,
    zonas,
    superficie: superficies(zonas),
    limite_m2: uso === "aparcamiento" ? null : SECTORES_TABLA_1_1.datos.sectorMax_m2,
    porPlantas: false,
    plantaMayor: null,
    dependeDeConstruida: false,
    bajoRasante: ns.length > 0 && ns.every((n) => n < 0),
    niveles: ns,
    ...extra,
  };
}

export function compartimentar(e: EdificioSi): Compartimentacion {
  const t = SECTORES_TABLA_1_1.datos;
  const riesgo = clasificarRiesgo(e);
  const enLocal = new Set(riesgo.locales.map((l) => l.zona.id));
  const enAparcamiento = new Set((riesgo.aparcamiento?.zonas ?? []).map((z) => z.id));
  const usoPrincipal = usoSectorDe(e.usoPrincipal);
  const residencial = e.usoPrincipal === "residencial_vivienda" || e.usoPrincipal === "vivienda_unifamiliar";
  const secundarios: SectorSi[] = [];
  const exentas: ZonaExenta[] = [];
  const fuera = new Set<string>([...enLocal, ...enAparcamiento]);

  // El garaje, uso Aparcamiento.
  if (riesgo.aparcamiento && usoPrincipal !== "aparcamiento") {
    secundarios.push(sector("garaje", "aparcamiento", riesgo.aparcamiento.zonas, { dependeDeConstruida: riesgo.aparcamiento.supuesto }));
  }

  // Los locales sin uso: Comercial salvo que se diga Administrativo.
  for (const z of e.zonas.filter((x) => x.uso === "local_sin_uso")) {
    const uso: UsoSector = z.zona.usoPrevisto === "administrativo" ? "administrativo" : "comercial";
    if (uso === "administrativo" && residencial) {
      const s = superficies([z]);
      const umbral = t.establecimientoExento_m2;
      if (s.construida_m2 <= umbral) {
        exentas.push({ zona: z, motivo: "establecimiento", dependeDeConstruida: dependeDeConstruida(s, (m2) => m2 > umbral) });
        continue;
      }
      secundarios.push(sector(`local-${z.id}`, uso, [z], { dependeDeConstruida: dependeDeConstruida(s, (m2) => m2 > umbral) }));
    } else {
      secundarios.push(sector(`local-${z.id}`, uso, [z], { usoSupuesto: z.zona.usoPrevisto === undefined }));
    }
    fuera.add(z.id);
  }

  // Oficinas en un edificio de viviendas (sector si exceden de 500 m²) y viviendas
  // en uno de oficinas (siempre).
  if (residencial) {
    const oficinas = e.zonas.filter((z) => z.uso === "oficinas");
    if (oficinas.length > 0) {
      const s = superficies(oficinas);
      const umbral = t.zonaSubsidiaria_m2;
      const depende = dependeDeConstruida(s, (m2) => m2 > umbral);
      if (s.construida_m2 > umbral) {
        secundarios.push(sector("oficinas", "administrativo", oficinas, { dependeDeConstruida: depende }));
        for (const z of oficinas) fuera.add(z.id);
      } else {
        for (const z of oficinas) exentas.push({ zona: z, motivo: "subsidiaria", dependeDeConstruida: depende });
      }
    }
  } else if (usoPrincipal === "administrativo") {
    const viviendas = e.zonas.filter((z) => z.uso === "viviendas" || z.uso === "vivienda_unifamiliar");
    if (viviendas.length > 0) {
      secundarios.push(sector("viviendas", "residencial", viviendas));
      for (const z of viviendas) fuera.add(z.id);
    }
  }

  // El sector principal: lo que queda.
  const zonasPrincipal = e.zonas.filter((z) => !fuera.has(z.id));
  const sp = superficies(zonasPrincipal);
  const max = t.sectorMax_m2;
  let principal = sector("principal", usoPrincipal, zonasPrincipal, { principal: true });
  const plantasPrincipal = niveles(zonasPrincipal);
  if (!e.resumen.esUnifamiliar && sp.construida_m2 > max && plantasPrincipal.length > 1) {
    // Por plantas: la superficie de cada planta física.
    const porNivel = plantasPrincipal.map((n) => {
      const zs = zonasPrincipal.filter((z) => z.niveles.includes(n));
      let util_m2 = 0;
      let construida_m2 = 0;
      for (const z of zs) {
        util_m2 += z.util_m2;
        construida_m2 += z.construida.valor;
      }
      const etiqueta = e.plantas.find((p) => p.nivel === n)?.etiqueta ?? String(n);
      return { etiqueta, util_m2: Math.round(util_m2), construida_m2: Math.round(construida_m2), supuesta: zs.some((z) => z.construida.supuesto) };
    });
    const mayor = porNivel.reduce((a, b) => (b.construida_m2 > a.construida_m2 ? b : a));
    principal = { ...principal, porPlantas: true, plantaMayor: mayor, dependeDeConstruida: dependeDeConstruida(sp, (m2) => m2 > max) };
  } else {
    principal = { ...principal, dependeDeConstruida: dependeDeConstruida(sp, (m2) => m2 > max) };
  }

  return { edificio: e, riesgo, sectores: [principal, ...secundarios], principal, exentas, h_m: e.alturaEvacuacion_m };
}

/** Lo que separa un sector secundario del principal. */
export function limiteDe(c: Compartimentacion, s: SectorSi): LimiteSector {
  const col = columnaAltura(s.bajoRasante, c.h_m);
  const ei = Math.max(eiTabla12(filaTabla12(s.uso), col, c.h_m), eiTabla12(filaTabla12(c.principal.uso), col, c.h_m));
  const masAlto = Math.max(...s.niveles);
  const techo = c.principal.niveles.some((n) => n > masAlto);
  const vestibulo = s.uso === "aparcamiento";
  return { sector: s, ei, techo, vestibulo, puerta_EI2: puertaEI2(ei, vestibulo) };
}

/** Las condiciones de un local de riesgo especial (tabla 2.2 y su nota 2). */
export interface CondicionesLocal {
  R: number;
  EI: number;
  vestibulo: boolean;
  puertas: number;
  puerta_EI2: number;
  recorrido_m: number;
  /** La nota 2 ha subido la R y el EI de la tabla 2.2 (al de los sectores del uso al que sirve). */
  subePorNota2: boolean;
}

export function condicionesLocal(c: Compartimentacion, l: LocalRiesgo): CondicionesLocal {
  const t = CONDICIONES_RIESGO_TABLA_2_2.datos[l.clase];
  // En la unifamiliar no hay sectores: la tabla 2.2 sola (interpretación 4.14).
  const minimo = c.edificio.resumen.esUnifamiliar
    ? 0
    : eiTabla12(filaTabla12(c.principal.uso), columnaAltura(l.zona.bajoRasante, c.h_m), c.h_m);
  return {
    R: Math.max(t.R, minimo),
    EI: Math.max(t.EI, minimo),
    vestibulo: t.vestibulo,
    puertas: t.puertas,
    puerta_EI2: t.puerta_EI2,
    recorrido_m: t.recorrido_m,
    subePorNota2: minimo > t.EI,
  };
}
