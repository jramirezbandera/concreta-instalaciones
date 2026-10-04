// =============================================================================
// Operaciones de edición de El edificio (feature-12). PURAS: reciben un edificio
// y devuelven uno nuevo (nunca mutan). Todas acaban en `renumerar`, así que los
// niveles nunca quedan con huecos ni solapes. Los ids nuevos son deterministas
// (siguiente número libre), igual que el `nextId` de los módulos.
//
// Las operaciones que no tienen sentido (borrar la única planta sobre rasante,
// la única zona de una planta…) devuelven el edificio sin cambios: la UI ya no
// las ofrece, esto es la red de seguridad.
// =============================================================================

import { esBajoRasante, renumerar } from "./derivar";
import { repartoUnifamiliar } from "./reparto";
import type {
  CuartosZona,
  Edificio,
  GrupoPlantas,
  NucleoAseos,
  TipoCubierta,
  UnidadTipo,
  UsoZona,
  ViviendaTipo,
  Zona,
} from "./tipos";
import { USOS } from "./usos";

// -----------------------------------------------------------------------------
// Ids
// -----------------------------------------------------------------------------

/** Siguiente id `<prefijo><N>` libre entre los ids de grupos, zonas y tipos. */
function siguienteId(e: Edificio, prefijo: string): string {
  const re = new RegExp(`^${prefijo}(\\d+)$`);
  let max = 0;
  const ids = [
    ...e.grupos.map((g) => g.id),
    ...e.grupos.flatMap((g) => g.zonas.map((z) => z.id)),
    ...e.unidades.map((u) => u.id),
  ];
  for (const id of ids) {
    const m = re.exec(id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefijo}${max + 1}`;
}

/**
 * Copia las zonas con ids nuevos (`z<N>` consecutivos). Los cuartos húmedos de
 * la unifamiliar no se copian: la vivienda no gana un baño por tener otra planta.
 */
function copiarZonas(e: Edificio, zonas: Zona[]): Zona[] {
  let base = Number(siguienteId(e, "z").slice(1));
  return zonas.map((z) => {
    const { cuartos: _c, ...resto } = structuredClone(z);
    return { ...resto, id: `z${base++}` };
  });
}

// -----------------------------------------------------------------------------
// Helpers de búsqueda
// -----------------------------------------------------------------------------

function conGrupo(e: Edificio, grupoId: string, f: (g: GrupoPlantas) => GrupoPlantas): Edificio {
  return renumerar({ ...e, grupos: e.grupos.map((g) => (g.id === grupoId ? f(g) : g)) });
}

function conZona(e: Edificio, zonaId: string, f: (z: Zona) => Zona): Edificio {
  return renumerar({
    ...e,
    grupos: e.grupos.map((g) =>
      g.zonas.some((z) => z.id === zonaId)
        ? { ...g, zonas: g.zonas.map((z) => (z.id === zonaId ? f(z) : z)) }
        : g,
    ),
  });
}

export function buscarZona(e: Edificio, zonaId: string): { grupo: GrupoPlantas; zona: Zona } | null {
  for (const g of e.grupos) {
    const z = g.zonas.find((x) => x.id === zonaId);
    if (z) return { grupo: g, zona: z };
  }
  return null;
}

function entero(n: number, min: number, max: number): number {
  const v = Number.isFinite(n) ? Math.trunc(n) : min;
  return Math.min(max, Math.max(min, v));
}

// -----------------------------------------------------------------------------
// Plantas
// -----------------------------------------------------------------------------

/** Altura de una planta nueva [m] — criterio de proyecto, editable. */
const ALTURA_NUEVA_M = 3;

/**
 * Añade una planta sobre rasante encima de la más alta, con las mismas zonas que
 * ella (ids nuevos). Sin plantas sobre rasante, crea la PB con una zona común.
 */
export function anadirPlantaArriba(e: Edificio): { edificio: Edificio; grupoId: string } {
  const id = siguienteId(e, "g");
  const arriba = e.grupos.find((g) => !esBajoRasante(g));
  const zonas = arriba
    ? copiarZonas(e, arriba.zonas)
    : [{ id: siguienteId(e, "z"), uso: "zona_comun" as const, superficieUtil_m2: 20 }];
  const nuevo: GrupoPlantas = {
    id,
    nivelInicial: 0, // ≥ 0 ⇒ sobre rasante; `renumerar` le da su nivel
    repeticiones: 1,
    altura_m: arriba?.altura_m ?? ALTURA_NUEVA_M,
    zonas,
  };
  return { edificio: renumerar({ ...e, grupos: [nuevo, ...e.grupos] }), grupoId: id };
}

/**
 * Añade un sótano debajo del más bajo. Copia las zonas del sótano más bajo si lo
 * hay; si no, empieza con un garaje (lo habitual bajo rasante).
 */
export function anadirSotano(e: Edificio): { edificio: Edificio; grupoId: string } {
  const id = siguienteId(e, "g");
  const sotanos = e.grupos.filter(esBajoRasante);
  const ultimo = sotanos[sotanos.length - 1];
  const zonas = ultimo
    ? copiarZonas(e, ultimo.zonas)
    : [{ id: siguienteId(e, "z"), uso: "garaje" as const, superficieUtil_m2: 300, plazas: 10 }];
  const nuevo: GrupoPlantas = {
    id,
    nivelInicial: -1, // < 0 ⇒ bajo rasante
    repeticiones: 1,
    altura_m: ultimo?.altura_m ?? ALTURA_NUEVA_M,
    zonas,
  };
  return { edificio: renumerar({ ...e, grupos: [...e.grupos, nuevo] }), grupoId: id };
}

export function setRepeticiones(e: Edificio, grupoId: string, n: number): Edificio {
  return conGrupo(e, grupoId, (g) => ({ ...g, repeticiones: entero(n, 1, 30) }));
}

export function setAltura(e: Edificio, grupoId: string, altura_m: number): Edificio {
  if (!Number.isFinite(altura_m)) return e;
  const h = Math.round(Math.min(10, Math.max(2, altura_m)) * 100) / 100;
  return conGrupo(e, grupoId, (g) => ({ ...g, altura_m: h }));
}

/** «P1–P3 × 3» → P3, P2 y P1 sueltas, cada una con una copia de las zonas. */
export function separarGrupo(e: Edificio, grupoId: string): Edificio {
  const i = e.grupos.findIndex((g) => g.id === grupoId);
  if (i < 0 || e.grupos[i].repeticiones <= 1) return e;
  const g = e.grupos[i];
  let acc: Edificio = e;
  const sueltos: GrupoPlantas[] = [];
  for (let k = 0; k < g.repeticiones; k++) {
    // La de más abajo conserva el id y las zonas originales (la selección sigue en ella).
    const esLaUltima = k === g.repeticiones - 1;
    const nuevo: GrupoPlantas = esLaUltima
      ? { ...g, repeticiones: 1 }
      : { ...g, id: siguienteId(acc, "g"), repeticiones: 1, zonas: copiarZonas(acc, g.zonas) };
    sueltos.push(nuevo);
    acc = { ...acc, grupos: [...acc.grupos, nuevo] }; // reserva los ids usados
  }
  return renumerar({ ...e, grupos: [...e.grupos.slice(0, i), ...sueltos, ...e.grupos.slice(i + 1)] });
}

export function puedeEliminarGrupo(e: Edificio, grupoId: string): boolean {
  const g = e.grupos.find((x) => x.id === grupoId);
  if (!g) return false;
  return esBajoRasante(g) || e.grupos.filter((x) => !esBajoRasante(x)).length > 1;
}

export function eliminarGrupo(e: Edificio, grupoId: string): Edificio {
  if (!puedeEliminarGrupo(e, grupoId)) return e;
  return renumerar({ ...e, grupos: e.grupos.filter((g) => g.id !== grupoId) });
}

// -----------------------------------------------------------------------------
// Zonas
// -----------------------------------------------------------------------------

/** Añade una zona común de 20 m² al grupo (el uso se elige justo después). */
export function anadirZona(e: Edificio, grupoId: string): { edificio: Edificio; zonaId: string } {
  const zonaId = siguienteId(e, "z");
  return {
    edificio: conGrupo(e, grupoId, (g) => ({
      ...g,
      zonas: [...g.zonas, { id: zonaId, uso: "zona_comun", superficieUtil_m2: 20 }],
    })),
    zonaId,
  };
}

export function eliminarZona(e: Edificio, zonaId: string): Edificio {
  const hallada = buscarZona(e, zonaId);
  if (!hallada || hallada.grupo.zonas.length <= 1) return e;
  return conGrupo(e, hallada.grupo.id, (g) => ({ ...g, zonas: g.zonas.filter((z) => z.id !== zonaId) }));
}

/** Vivienda tipo por defecto: la «A» de la maqueta (T3, 2 baños, 90 m²). */
function viviendaPorDefecto(id: string, nombre: string): ViviendaTipo {
  return { clase: "vivienda", id, nombre, dormitorios: 3, banos: 2, aseos: 0, superficieUtil_m2: 90 };
}

/** Núcleo de aseos por defecto: el «N» de la maqueta. */
function nucleoPorDefecto(id: string, nombre: string): NucleoAseos {
  return { clase: "nucleo_aseos", id, nombre, inodoros: 4, lavabos: 4, superficieUtil_m2: 22 };
}

/** Primer nombre libre de una serie: A, B, C… para viviendas; N, N2… para núcleos. */
function nombreLibre(e: Edificio, clase: UnidadTipo["clase"]): string {
  const usados = new Set(e.unidades.map((u) => u.nombre));
  if (clase === "vivienda") {
    for (let c = 65; c <= 90; c++) {
      const n = String.fromCharCode(c);
      if (!usados.has(n)) return n;
    }
    return `T${e.unidades.length + 1}`;
  }
  if (!usados.has("N")) return "N";
  for (let k = 2; ; k++) if (!usados.has(`N${k}`)) return `N${k}`;
}

/** Id libre para un tipo: su nombre si no choca con nada; si no, `t<N>`. */
function idTipoLibre(e: Edificio, nombre: string): string {
  const ids = new Set([
    ...e.grupos.map((g) => g.id),
    ...e.grupos.flatMap((g) => g.zonas.map((z) => z.id)),
    ...e.unidades.map((u) => u.id),
  ]);
  return ids.has(nombre) ? siguienteId(e, "t") : nombre;
}

/**
 * Cambia el uso de una zona y deja solo los campos que ese uso usa. Pasar a
 * «Viviendas» u «Oficinas» reparte una unidad del primer tipo que corresponda,
 * y lo crea si el edificio aún no tiene ninguno.
 */
export function setUso(e: Edificio, zonaId: string, uso: UsoZona): Edificio {
  const hallada = buscarZona(e, zonaId);
  if (!hallada) return e;
  const def = USOS[uso];
  let base = e;
  let unidades: Zona["unidades"];
  if (def.unidades) {
    const clase = def.unidades;
    let tipo = e.unidades.find((u) => u.clase === clase);
    if (!tipo) {
      const nombre = nombreLibre(e, clase);
      const id = idTipoLibre(e, nombre);
      tipo = clase === "vivienda" ? viviendaPorDefecto(id, nombre) : nucleoPorDefecto(id, nombre);
      base = { ...e, unidades: [...e.unidades, tipo] };
    }
    const previas = (hallada.zona.unidades ?? []).filter(
      (u) => base.unidades.find((t) => t.id === u.tipoId)?.clase === clase,
    );
    unidades = previas.length > 0 ? previas : [{ tipoId: tipo.id, cantidad: 1 }];
  }
  return conZona(base, zonaId, (z) => {
    const { unidades: _u, plazas: _p, numero: _n, cuartos, grifos, cuarto, potencia_kW, usoPrevisto, ...resto } = z;
    return {
      ...resto,
      uso,
      ...(unidades ? { unidades } : {}),
      ...(def.contador?.campo === "plazas" ? { plazas: z.plazas ?? 10 } : {}),
      ...(def.contador?.campo === "numero" ? { numero: z.numero ?? 4 } : {}),
      ...(cuartos && uso === "vivienda_unifamiliar" ? { cuartos } : {}),
      ...(grifos !== undefined && admiteGrifos(uso) ? { grifos } : {}),
      // Los datos del DB-SI (feature-19) que solo tienen sentido en su uso.
      ...(cuarto && uso === "instalaciones" ? { cuarto } : {}),
      ...(potencia_kW !== undefined && uso === "instalaciones" ? { potencia_kW } : {}),
      ...(usoPrevisto && uso === "local_sin_uso" ? { usoPrevisto } : {}),
    };
  });
}

/** Los garajes pueden llevar grifos de baldeo. */
export function admiteGrifos(uso: UsoZona): boolean {
  return uso === "garaje" || uso === "garaje_privado";
}

export function setGrifos(e: Edificio, zonaId: string, n: number): Edificio {
  const hallada = buscarZona(e, zonaId);
  if (!hallada || !admiteGrifos(hallada.zona.uso)) return e;
  return conZona(e, zonaId, (z) => ({ ...z, grifos: entero(n, 0, 20) }));
}

/** Límites de los cuartos de la vivienda tipo (los mismos que `editarTipo`). */
const MAX_BANOS = 5;
const MAX_ASEOS = 4;

/**
 * Cambia los cuartos húmedos de una zona de la unifamiliar. El reparto pasa a ser
 * del proyectista: se escribe el que hay ahora (supuesto o no) en todas las zonas
 * de la vivienda, se aplica el cambio y la vivienda tipo queda con la suma. Así
 * mover un baño de planta es bajar uno aquí y subir otro allí, y nunca se pierde
 * ni se duplica un cuarto. La cocina es una: traerla a esta zona la quita de las
 * demás; quitarla la lleva a la zona más baja de las otras. Lo que dejaría la
 * vivienda sin baño o por encima de los límites no se aplica.
 */
export function setCuartosZona(e: Edificio, zonaId: string, patch: Partial<CuartosZona>): Edificio {
  const hallada = buscarZona(e, zonaId);
  const reparto = repartoUnifamiliar(e);
  if (!hallada || hallada.zona.uso !== "vivienda_unifamiliar" || !reparto) return e;
  const actual = new Map<string, CuartosZona>([...reparto.porZona].map(([id, c]) => [id, { ...c }]));
  const destino = actual.get(zonaId);
  if (!destino) return e;
  if (patch.banos !== undefined) destino.banos = entero(patch.banos, 0, MAX_BANOS);
  if (patch.aseos !== undefined) destino.aseos = entero(patch.aseos, 0, MAX_ASEOS);
  if (patch.cocina === true) {
    for (const c of actual.values()) c.cocina = false;
    destino.cocina = true;
  } else if (patch.cocina === false && destino.cocina) {
    // A la zona más baja de las demás (el reparto las da de abajo arriba).
    const otra = [...actual.keys()].find((id) => id !== zonaId);
    if (!otra) return e;
    destino.cocina = false;
    actual.get(otra)!.cocina = true;
  }
  // Totales: cada zona cuenta en todas las plantas de su grupo.
  const r = renumerar(e);
  let banos = 0;
  let aseos = 0;
  for (const g of r.grupos) {
    for (const z of g.zonas) {
      const c = actual.get(z.id);
      if (!c) continue;
      banos += c.banos * Math.max(1, g.repeticiones);
      aseos += c.aseos * Math.max(1, g.repeticiones);
    }
  }
  if (banos < 1 || banos > MAX_BANOS || aseos > MAX_ASEOS) return e;
  const conCuartos: Edificio = {
    ...r,
    grupos: r.grupos.map((g) => ({
      ...g,
      zonas: g.zonas.map((z) => (actual.has(z.id) ? { ...z, cuartos: actual.get(z.id)! } : z)),
    })),
  };
  return editarTipo(conCuartos, reparto.tipo.id, { banos, aseos });
}

export function setSuperficie(e: Edificio, zonaId: string, m2: number): Edificio {
  if (!Number.isFinite(m2)) return e;
  return conZona(e, zonaId, (z) => ({ ...z, superficieUtil_m2: Math.max(0, Math.round(m2 * 100) / 100) }));
}

export function setContador(e: Edificio, zonaId: string, campo: "plazas" | "numero", n: number): Edificio {
  return conZona(e, zonaId, (z) => ({ ...z, [campo]: entero(n, 0, 999) }));
}

/** Cuántas unidades de un tipo hay en la zona por planta (0 = se quita). */
export function setUnidades(e: Edificio, zonaId: string, tipoId: string, cantidad: number): Edificio {
  const n = entero(cantidad, 0, 99);
  return conZona(e, zonaId, (z) => {
    const lista = z.unidades ?? [];
    if (n === 0) return { ...z, unidades: lista.filter((u) => u.tipoId !== tipoId) };
    // Conserva la posición del tipo en la lista (el orden se ve en la sección).
    return lista.some((u) => u.tipoId === tipoId)
      ? { ...z, unidades: lista.map((u) => (u.tipoId === tipoId ? { tipoId, cantidad: n } : u)) }
      : { ...z, unidades: [...lista, { tipoId, cantidad: n }] };
  });
}

// -----------------------------------------------------------------------------
// Tipos (lo que se repite)
// -----------------------------------------------------------------------------

export function anadirTipo(
  e: Edificio,
  clase: UnidadTipo["clase"],
): { edificio: Edificio; tipoId: string } {
  const nombre = nombreLibre(e, clase);
  const id = idTipoLibre(e, nombre);
  const tipo =
    clase === "vivienda"
      ? { ...viviendaPorDefecto(id, nombre), dormitorios: 2, banos: 1, aseos: 0, superficieUtil_m2: 70 }
      : nucleoPorDefecto(id, nombre);
  return { edificio: { ...e, unidades: [...e.unidades, tipo] }, tipoId: id };
}

type PatchVivienda = Partial<Omit<ViviendaTipo, "clase" | "id">>;
type PatchNucleo = Partial<Omit<NucleoAseos, "clase" | "id">>;

/** Edita un tipo; los contadores se acotan (al menos 1 dormitorio y 1 baño, etc.). */
export function editarTipo(e: Edificio, tipoId: string, patch: PatchVivienda | PatchNucleo): Edificio {
  return {
    ...e,
    unidades: e.unidades.map((u) => {
      if (u.id !== tipoId) return u;
      if (u.clase === "vivienda") {
        const p = patch as PatchVivienda;
        return {
          ...u,
          ...p,
          dormitorios: entero(p.dormitorios ?? u.dormitorios, 0, 8),
          banos: entero(p.banos ?? u.banos, 1, 5),
          aseos: entero(p.aseos ?? u.aseos, 0, 4),
          superficieUtil_m2: Math.max(0, p.superficieUtil_m2 ?? u.superficieUtil_m2),
        };
      }
      const p = patch as PatchNucleo;
      return {
        ...u,
        ...p,
        inodoros: entero(p.inodoros ?? u.inodoros, 1, 20),
        lavabos: entero(p.lavabos ?? u.lavabos, 1, 20),
        superficieUtil_m2: Math.max(0, p.superficieUtil_m2 ?? u.superficieUtil_m2),
      };
    }),
  };
}

/** Borra un tipo y sus referencias en las zonas. */
export function eliminarTipo(e: Edificio, tipoId: string): Edificio {
  return renumerar({
    ...e,
    unidades: e.unidades.filter((u) => u.id !== tipoId),
    grupos: e.grupos.map((g) => ({
      ...g,
      zonas: g.zonas.map((z) =>
        z.unidades ? { ...z, unidades: z.unidades.filter((u) => u.tipoId !== tipoId) } : z,
      ),
    })),
  });
}

/** Dónde se usa un tipo: etiquetas de los grupos y nº total de unidades. */
export function usosDeTipo(e: Edificio, tipoId: string): { grupos: string[]; total: number } {
  const r = renumerar(e);
  const grupos: string[] = [];
  let total = 0;
  for (const g of r.grupos) {
    let enGrupo = 0;
    for (const z of g.zonas) {
      for (const u of z.unidades ?? []) if (u.tipoId === tipoId) enGrupo += Math.max(0, Math.trunc(u.cantidad));
    }
    if (enGrupo > 0) {
      grupos.push(g.id);
      total += enGrupo * Math.max(1, g.repeticiones);
    }
  }
  return { grupos, total };
}

// -----------------------------------------------------------------------------
// Cubierta
// -----------------------------------------------------------------------------

export function setCubierta(
  e: Edificio,
  patch: Partial<{ tipo: TipoCubierta; superficie_m2: number }>,
): Edificio {
  const sup = patch.superficie_m2;
  return {
    ...e,
    cubierta: {
      ...e.cubierta,
      ...patch,
      ...(sup !== undefined ? { superficie_m2: Number.isFinite(sup) ? Math.max(0, sup) : e.cubierta.superficie_m2 } : {}),
    },
  };
}
