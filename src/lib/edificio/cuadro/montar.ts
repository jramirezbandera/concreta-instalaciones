// =============================================================================
// Leer el cuadro de superficies — la parte que CALCULA (feature-13). Pura: sin
// React, sin red, sin Date.now. Mismas filas → mismo edificio.
//
// Recibe las filas que transcribió la IA (`leer.ts`), con las correcciones de la
// tabla de revisión, y monta el edificio:
//   - las viviendas, agrupando sus filas por unidad; la superficie, la de su
//     línea si la tiene y, si no, la suma de sus estancias; el programa
//     (dormitorios, baños, aseos), contando estancias;
//   - los tipos: viviendas del mismo tipo declarado o, si el cuadro no lo dice,
//     con el mismo programa y superficie;
//   - una sola vivienda ⇒ unifamiliar: una zona por planta con lo suyo;
//   - el resto de usos, una zona por planta y uso (locales y oficinas, una por
//     unidad), sumando superficies, plazas y trasteros;
//   - las plantas consecutivas con el mismo programa, en un grupo («P1–P3 × 3»).
// Cada zona y cada tipo guarda de qué filas sale (`origen`): es la trazabilidad
// que llega al anejo.
// =============================================================================

import { etiquetaNivel, plantasDe, renumerar } from "../derivar";
import type {
  Edificio,
  GrupoPlantas,
  OrigenDocumento,
  UsoZona,
  ViviendaTipo,
  Zona,
} from "../tipos";
import { ORDEN_USOS, USOS } from "../usos";
import type { FilaLeida, LecturaCuadro, Que } from "./leer";

// -----------------------------------------------------------------------------
// Filas en revisión
// -----------------------------------------------------------------------------

/** Una fila de la tabla de revisión: lo leído, con las correcciones del proyectista. */
export interface FilaRevisable extends FilaLeida {
  /** Posición en la lectura: identifica la fila aunque se corrija. */
  i: number;
  /** Si entra en el edificio. */
  usar: boolean;
}

/** Usos de zona a los que puede ir una fila (el resto de `Que` son de vivienda o no se usan). */
const USO_DE_QUE: Partial<Record<Que, UsoZona>> = {
  local_sin_uso: "local_sin_uso",
  oficinas: "oficinas",
  zona_comun: "zona_comun",
  vestibulo: "vestibulo",
  garaje: "garaje",
  garaje_privado: "garaje_privado",
  trasteros: "trasteros",
  instalaciones: "instalaciones",
};

/**
 * Por qué una fila no entra por defecto; "" si entra. Es lo que la tabla enseña
 * junto a la casilla «usar» desmarcada.
 */
export function motivoDescarte(f: FilaLeida): string {
  if (f.que === "total") return "Total o subtotal: la aplicación suma sus líneas";
  if (f.que === "exterior") return "Exterior: no es superficie útil de una zona";
  if (f.que === "otro") return "No es superficie de una zona";
  // La cubierta mide lo que mide: el cuadro suele darla en la columna de construida.
  if (f.que === "cubierta") return f.superficie_m2 > 0 ? "" : "Sin superficie";
  if (f.tipoSuperficie === "construida") return "Superficie construida: el cálculo usa la útil";
  if (f.tipoSuperficie === "otra") return "No es superficie útil";
  // Sin superficie también cuentan las plazas de un garaje, los trasteros que se
  // enumeran y una vivienda de un tipo descrito aparte (la superficie es la del tipo).
  const cuentaSinSuperficie =
    (f.que === "garaje" && f.plazas > 0) ||
    (f.que === "trasteros" && f.numero > 0) ||
    (f.que === "vivienda" && f.tipoVivienda !== "");
  if (f.superficie_m2 <= 0 && !cuentaSinSuperficie) return "Sin superficie";
  return "";
}

/** Una fila merece revisión si no es de confianza alta o trae nota. */
export const esDudosa = (f: FilaLeida): boolean => f.confianza !== "alta" || f.nota !== "";

export function filasRevisables(l: LecturaCuadro): FilaRevisable[] {
  return l.filas.map((f, i) => ({ ...f, i, usar: motivoDescarte(f) === "" }));
}

/** Lo que la tabla deja corregir de una fila. */
export type CorreccionFila = Partial<
  Pick<FilaRevisable, "usar" | "que" | "estancia" | "superficie_m2" | "nivel" | "plantas" | "unidad">
>;

/**
 * Aplica una corrección de la tabla. Cambiar a qué va una fila (o su superficie)
 * decide de nuevo si entra: pasarla a «Total» la saca y pasarla a «Zonas
 * comunes» la mete, salvo que la misma corrección diga otra cosa de `usar`.
 */
export function corregirFila(filas: FilaRevisable[], i: number, c: CorreccionFila): FilaRevisable[] {
  return filas.map((f) => {
    if (f.i !== i) return f;
    const siguiente: FilaRevisable = { ...f, ...c };
    if (siguiente.que !== "estancia" && siguiente.que !== "estancia_tipo") siguiente.estancia = "otra";
    if (c.usar === undefined && (c.que !== undefined || c.superficie_m2 !== undefined)) {
      // Una superficie construida que el proyectista reclasifica sigue fuera hasta
      // que la marque él: el motivo no cambia por cambiar el destino.
      siguiente.usar = motivoDescarte(siguiente) === "";
    }
    return siguiente;
  });
}

// -----------------------------------------------------------------------------
// Montaje
// -----------------------------------------------------------------------------

export interface Montaje {
  /** `null` si no hay ninguna planta sobre rasante que montar. */
  edificio: Edificio | null;
  /** Lo que el montaje ha tenido que suponer o no cuadra. */
  avisos: string[];
  /**
   * A qué va cada fila usada (por su `i`): ids de zona, `tipo:<id>` o
   * `cubierta`. Una fila de «plantas 1.ª a 3.ª» puede ir a varias zonas si esas
   * plantas no quedaron agrupadas.
   */
  destino: Map<number, string[]>;
}

const ALTURA_POR_DEFECTO_M = 3;

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s.ºª°_-]+/g, "")
    .toLowerCase();

const m2 = (v: number) => `${v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m²`;
const cm = (v: number) => Math.round(v * 100) / 100;

/** «Dormitorio 1 · 12,00 m²»: la fila como venía, con su número. */
const lineaDe = (f: FilaLeida) => (f.superficie_m2 > 0 ? `${f.texto} · ${m2(f.superficie_m2)}` : f.texto);

function origenDe(documento: string, filas: readonly FilaLeida[], lineas?: string[]): OrigenDocumento {
  const paginas = [...new Set(filas.map((f) => f.pagina).filter((p) => p > 0))].sort((a, b) => a - b);
  const todas = lineas ?? filas.map(lineaDe);
  return { documento, paginas, filas: [...new Set(todas)] };
}

/** Niveles que cubre una fila: del suyo hacia arriba, tantos como plantas iguales. */
const nivelesDe = (f: FilaLeida) => Array.from({ length: Math.max(1, f.plantas) }, (_, k) => f.nivel + k);

interface Programa {
  dormitorios: number;
  banos: number;
  aseos: number;
}

function programaDeEstancias(es: readonly FilaLeida[]): Programa {
  const cuenta = (e: string) => es.filter((f) => f.estancia === e).length;
  return { dormitorios: cuenta("dormitorio"), banos: cuenta("bano"), aseos: cuenta("aseo") };
}

const firma = (p: Programa) => `${p.dormitorios}D${p.banos}B${p.aseos}A`;

/** La más repetida; a igualdad, la mayor (del lado seguro para la previsión eléctrica). */
function moda(valores: number[]): number {
  const cuenta = new Map<number, number>();
  for (const v of valores) cuenta.set(cm(v), (cuenta.get(cm(v)) ?? 0) + 1);
  return [...cuenta.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? 0;
}

/** «Tipo A» → «A»; «tipo 2» → «2». */
const nombreTipo = (s: string) => s.replace(/^tipo\s+/i, "").trim();

/** Una vivienda concreta del cuadro. */
interface Instancia {
  nombre: string;
  tipo: string;
  /** Superficie útil por planta (una entrada salvo dúplex y unifamiliares). */
  porPlanta: Map<number, number>;
  superficie: number;
  programa: Programa | null;
  /** Viviendas iguales que representa (una fila «2 viviendas tipo A»). */
  veces: number;
  filas: FilaRevisable[];
}

/** Una zona en construcción, en una planta concreta. */
interface ZonaEnPlanta {
  uso: UsoZona;
  superficie: number;
  plazas: number;
  numero: number;
  unidades: Map<string, number>;
  filas: FilaRevisable[];
  lineas: string[];
  nota?: string;
  /** Locales y oficinas: la unidad a la que pertenece (una zona por unidad). */
  claveUnidad?: string;
}

export function montarEdificio(filas: readonly FilaRevisable[], base: Edificio, documento: string): Montaje {
  const avisos: string[] = [];
  const usadas = filas.filter((f) => f.usar && motivoUsable(f));

  // ── Viviendas ────────────────────────────────────────────────────────────
  const definiciones = definicionesDeTipo(usadas.filter((f) => f.que === "estancia_tipo"));
  const deVivienda = usadas.filter((f) => f.que === "estancia" || f.que === "vivienda");
  // Un tipo descrito aparte que ninguna línea coloca («Vivienda tipo A (1.º A,
  // 2.º A, 3.º A)» sin «Planta 1.ª: …» después): una vivienda de ese tipo en
  // cada planta que cubren sus filas. Es una suposición, y se dice.
  const colocados = new Set(deVivienda.map((f) => norm(nombreTipo(f.tipoVivienda))).filter((t) => t !== ""));
  for (const [clave, def] of definiciones) {
    if (colocados.has(clave)) continue;
    const nombre = `Tipo ${nombreTipo(def.filas[0]!.tipoVivienda || def.filas[0]!.unidad || clave)}`;
    deVivienda.push(...def.filas.map((f) => ({ ...f, que: "estancia" as const, unidad: nombre })));
    const niveles = [...new Set(def.filas.flatMap(nivelesDe))].sort((a, b) => a - b).map(etiquetaNivel);
    avisos.push(
      `Ninguna línea dice dónde van las viviendas del ${nombre.replace(/^Tipo/, "tipo")}: se pone una en ${niveles.length === 1 ? "" : "cada planta de "}${niveles.join(", ")}. Revísalo.`,
    );
  }
  const instancias = instanciasDeVivienda(deVivienda, avisos);
  completarProgramas(instancias, definiciones, avisos);
  const totalViviendas = instancias.reduce((a, v) => a + v.veces, 0);
  const unifamiliar = totalViviendas === 1;

  const plantas = new Map<number, ZonaEnPlanta[]>();
  const zonaEn = (nivel: number, clave: (z: ZonaEnPlanta) => boolean, nueva: () => ZonaEnPlanta) => {
    const lista = plantas.get(nivel) ?? [];
    plantas.set(nivel, lista);
    let z = lista.find(clave);
    if (!z) {
      z = nueva();
      lista.push(z);
    }
    return z;
  };
  const vacia = (uso: UsoZona): ZonaEnPlanta => ({
    uso,
    superficie: 0,
    plazas: 0,
    numero: 0,
    unidades: new Map(),
    filas: [],
    lineas: [],
  });

  const unidades: ViviendaTipo[] = [];
  /** Tipo de cada instancia (por su posición en `instancias`). */
  const tipoDe = new Map<Instancia, ViviendaTipo>();

  if (unifamiliar) {
    const v = instancias[0]!;
    const programa = v.programa ?? { dormitorios: 2, banos: 1, aseos: 0 };
    const tipo: ViviendaTipo = {
      clase: "vivienda",
      id: "U",
      nombre: v.tipo !== "" ? nombreTipo(v.tipo) : "U",
      ...acotarPrograma(programa),
      superficieUtil_m2: cm(v.superficie),
      origen: origenDe(documento, filasDefinitorias(v, definiciones)),
    };
    unidades.push(tipo);
    tipoDe.set(v, tipo);
    for (const [nivel, sup] of v.porPlanta) {
      const z = zonaEn(nivel, (x) => x.uso === "vivienda_unifamiliar", () => vacia("vivienda_unifamiliar"));
      z.superficie += sup;
      const deEsta = v.filas.filter((f) => nivelesDe(f).includes(nivel));
      z.filas.push(...deEsta);
      z.lineas.push(...deEsta.map(lineaDe));
    }
  } else if (instancias.length > 0) {
    for (const [t, grupo] of agruparEnTipos(instancias, definiciones, documento, avisos)) {
      unidades.push(t);
      for (const v of grupo) tipoDe.set(v, t);
    }
    for (const v of instancias) {
      const t = tipoDe.get(v)!;
      // Un dúplex cuenta en la planta donde tiene más superficie.
      const principal = [...v.porPlanta.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]![0];
      if (v.porPlanta.size > 1) {
        avisos.push(
          `«${v.nombre}» ocupa ${v.porPlanta.size} plantas (dúplex): se cuenta como vivienda en ${etiquetaNivel(principal)}.`,
        );
      }
      for (const [nivel, sup] of v.porPlanta) {
        const z = zonaEn(nivel, (x) => x.uso === "viviendas", () => vacia("viviendas"));
        z.superficie += sup * v.veces;
        if (nivel === principal) z.unidades.set(t.id, (z.unidades.get(t.id) ?? 0) + v.veces);
        z.filas.push(...v.filas.filter((f) => nivelesDe(f).includes(nivel)));
        z.lineas.push(`${v.veces > 1 ? `${v.veces} × ` : ""}${v.nombre} · ${m2(v.superficie)}`);
      }
    }
  }

  // ── El resto de usos ─────────────────────────────────────────────────────
  for (const f of usadas) {
    let uso = USO_DE_QUE[f.que];
    if (!uso) continue;
    if (unifamiliar && uso === "garaje") uso = "garaje_privado";
    for (const nivel of nivelesDe(f)) {
      // Locales y oficinas: una zona por unidad (cada local tiene su previsión);
      // un local sin nombre es la propia línea. El resto: una zona por uso.
      const unidad = norm(f.unidad);
      const clave =
        uso === "local_sin_uso" ? unidad || `#${f.i}` : uso === "oficinas" ? unidad : "";
      const z = zonaEn(
        nivel,
        (x) => x.uso === uso && (x.claveUnidad ?? "") === clave,
        () => ({ ...vacia(uso), ...(clave !== "" ? { claveUnidad: clave } : {}) }),
      );
      z.superficie += f.superficie_m2;
      z.plazas += uso === "garaje" ? f.plazas : 0;
      z.numero += uso === "trasteros" ? (f.numero > 0 ? f.numero : 1) : 0;
      z.filas.push(f);
      z.lineas.push(lineaDe(f));
    }
  }
  for (const lista of plantas.values()) {
    for (const z of lista) {
      if (z.uso === "instalaciones") {
        const nota = [...new Set(z.filas.map((f) => f.texto))].join(" · ");
        z.nota = nota.length > 60 ? `${nota.slice(0, 57)}…` : nota;
      }
    }
  }

  // ── Plantas ──────────────────────────────────────────────────────────────
  const niveles = [...plantas.keys()].sort((a, b) => b - a);
  if (!niveles.some((n) => n >= 0)) {
    avisos.push("El cuadro no trae ninguna planta sobre rasante: no se puede montar el edificio.");
    return { edificio: null, avisos, destino: new Map() };
  }
  avisarHuecos(niveles, avisos);

  const alturaBase = new Map(plantasDe(base).map((p) => [p.nivel, p.altura_m]));
  const nuevas = niveles.filter((n) => !alturaBase.has(n));
  avisos.push(
    nuevas.length === 0
      ? "Un cuadro de superficies no trae alturas: se conservan las del edificio que había, planta a planta. Revísalas."
      : `Un cuadro de superficies no trae alturas: se conservan las del edificio que había y se ponen ${ALTURA_POR_DEFECTO_M.toFixed(2).replace(".", ",")} m en ${nuevas.map(etiquetaNivel).join(", ")}. Revísalas.`,
  );

  if ([...plantas.values()].flat().some((z) => z.uso === "oficinas")) {
    avisos.push(
      "Los núcleos de aseos de las oficinas no salen del cuadro: añádelos en cada planta de oficinas.",
    );
  }

  // Grupos de plantas consecutivas iguales, de arriba abajo.
  const ordenadas = niveles.map((nivel) => ({
    nivel,
    altura: alturaBase.get(nivel) ?? ALTURA_POR_DEFECTO_M,
    zonas: [...plantas.get(nivel)!].sort(
      (a, b) => ORDEN_USOS.indexOf(a.uso) - ORDEN_USOS.indexOf(b.uso) || b.superficie - a.superficie,
    ),
  }));
  const firmaPlanta = (p: (typeof ordenadas)[number]) =>
    JSON.stringify([
      p.nivel < 0,
      p.altura,
      p.zonas.map((z) => [
        z.uso,
        cm(z.superficie),
        [...z.unidades.entries()].sort(),
        z.plazas,
        z.numero,
        z.nota ?? "",
      ]),
    ]);
  const bloques: (typeof ordenadas)[] = [];
  for (const p of ordenadas) {
    const ultimo = bloques[bloques.length - 1];
    const previa = ultimo?.[ultimo.length - 1];
    if (previa && previa.nivel === p.nivel + 1 && firmaPlanta(previa) === firmaPlanta(p)) ultimo!.push(p);
    else bloques.push([p]);
  }

  const destino = new Map<number, string[]>();
  const anotar = (i: number, id: string) => {
    const lista = destino.get(i) ?? [];
    if (!lista.includes(id)) lista.push(id);
    destino.set(i, lista);
  };

  let nz = 0;
  const grupos: GrupoPlantas[] = bloques.map((bloque, k) => {
    const modelo = bloque[0]!;
    return {
      id: `g${k + 1}`,
      nivelInicial: bloque[bloque.length - 1]!.nivel,
      repeticiones: bloque.length,
      altura_m: modelo.altura,
      zonas: modelo.zonas.map((z, j) => {
        const id = `z${++nz}`;
        // Las filas de esta zona en TODAS las plantas del bloque.
        const filasZona = bloque.flatMap((p) => p.zonas[j]!.filas);
        const lineasZona = bloque.flatMap((p) => p.zonas[j]!.lineas);
        for (const f of filasZona) anotar(f.i, id);
        const zona: Zona = {
          id,
          uso: z.uso,
          superficieUtil_m2: cm(z.superficie),
          ...(USOS[z.uso].unidades
            ? { unidades: [...z.unidades.entries()].map(([tipoId, cantidad]) => ({ tipoId, cantidad })) }
            : {}),
          ...(USOS[z.uso].contador?.campo === "plazas" ? { plazas: z.plazas } : {}),
          ...(USOS[z.uso].contador?.campo === "numero" ? { numero: z.numero } : {}),
          ...(z.nota ? { nota: z.nota } : {}),
          origen: origenDe(documento, filasZona, lineasZona),
        };
        return zona;
      }),
    };
  });

  // Las filas que describen un tipo aparte van a ese tipo.
  for (const u of unidades) {
    for (const f of definiciones.get(norm(u.nombre))?.filas ?? []) anotar(f.i, `tipo:${u.id}`);
  }

  // ── Cubierta ─────────────────────────────────────────────────────────────
  const filasCubierta = usadas.filter((f) => f.que === "cubierta");
  let superficieCubierta = cm(filasCubierta.reduce((a, f) => a + f.superficie_m2, 0));
  if (filasCubierta.length > 0) {
    for (const f of filasCubierta) anotar(f.i, "cubierta");
  } else {
    const alta = ordenadas[0]!;
    superficieCubierta = cm(alta.zonas.reduce((a, z) => a + z.superficie, 0));
    avisos.push(
      `El cuadro no da la cubierta: se toma la superficie útil de ${etiquetaNivel(alta.nivel)} (${m2(superficieCubierta)}). Revísala.`,
    );
  }

  const ocupados = new Set([...grupos.map((g) => g.id), ...grupos.flatMap((g) => g.zonas.map((z) => z.id))]);
  const edificio = renumerar({
    cubierta: { tipo: base.cubierta.tipo, superficie_m2: superficieCubierta },
    grupos,
    unidades: unidades.map((u) => ({ ...u, id: idLibre(u.id, ocupados) })),
  });
  // Si un tipo cambió de id por chocar, las zonas lo siguen.
  const renombrados = new Map(unidades.map((u, k) => [u.id, edificio.unidades[k]!.id]));
  const final: Edificio = {
    ...edificio,
    grupos: edificio.grupos.map((g) => ({
      ...g,
      zonas: g.zonas.map((z) =>
        z.unidades
          ? { ...z, unidades: z.unidades.map((u) => ({ ...u, tipoId: renombrados.get(u.tipoId) ?? u.tipoId })) }
          : z,
      ),
    })),
  };
  for (const [i, ids] of destino) {
    destino.set(
      i,
      ids.map((id) => (id.startsWith("tipo:") ? `tipo:${renombrados.get(id.slice(5)) ?? id.slice(5)}` : id)),
    );
  }
  return { edificio: final, avisos, destino };
}

// -----------------------------------------------------------------------------
// Piezas del montaje
// -----------------------------------------------------------------------------

/** Una fila marcada como «usar» solo cuenta si va a algún sitio. */
function motivoUsable(f: FilaRevisable): boolean {
  return f.que !== "total" && f.que !== "exterior" && f.que !== "otro";
}

/** Programas de los tipos descritos aparte («Vivienda tipo A: …»), por nombre de tipo. */
function definicionesDeTipo(filas: FilaRevisable[]): Map<string, { programa: Programa; superficie: number; filas: FilaRevisable[] }> {
  const porTipo = new Map<string, FilaRevisable[]>();
  for (const f of filas) {
    const clave = norm(nombreTipo(f.tipoVivienda || f.unidad || "tipo"));
    porTipo.set(clave, [...(porTipo.get(clave) ?? []), f]);
  }
  return new Map(
    [...porTipo].map(([clave, fs]) => [
      clave,
      { programa: programaDeEstancias(fs), superficie: cm(fs.reduce((a, f) => a + f.superficie_m2, 0)), filas: fs },
    ]),
  );
}

/**
 * Las viviendas concretas. Las filas de una misma `unidad` son una vivienda,
 * aunque estén en varias plantas (dúplex, unifamiliar). Si alguna de sus filas
 * cubre varias plantas iguales («plantas 1.ª a 3.ª»), la unidad se repite en
 * cada planta: una vivienda por planta.
 */
function instanciasDeVivienda(filas: FilaRevisable[], avisos: string[]): Instancia[] {
  const porUnidad = new Map<string, FilaRevisable[]>();
  for (const f of filas) {
    // Una línea «vivienda» sin unidad es ella misma; las estancias sin unidad son
    // de LA vivienda (el caso de la unifamiliar que no se nombra).
    const clave = norm(f.unidad) || (f.que === "vivienda" ? `#${f.i}` : "vivienda");
    porUnidad.set(clave, [...(porUnidad.get(clave) ?? []), f]);
  }
  const out: Instancia[] = [];
  for (const fs of porUnidad.values()) {
    const repetida = fs.some((f) => f.plantas > 1);
    const tandas = repetida
      ? [...new Set(fs.flatMap(nivelesDe))].sort((a, b) => a - b).map((n) => ({
          nivel: n as number | null,
          filas: fs.filter((f) => nivelesDe(f).includes(n)),
        }))
      : [{ nivel: null as number | null, filas: fs }];
    for (const t of tandas) out.push(instancia(t.filas, t.nivel, avisos));
  }
  return out;
}

function instancia(fs: FilaRevisable[], soloNivel: number | null, avisos: string[]): Instancia {
  const estancias = fs.filter((f) => f.que === "estancia");
  const lineas = fs.filter((f) => f.que === "vivienda");
  const nombre = fs.find((f) => f.unidad !== "")?.unidad ?? lineas[0]?.texto ?? "Vivienda";
  const nombreVisible = soloNivel !== null && fs.some((f) => f.plantas > 1) ? `${nombre} (${etiquetaNivel(soloNivel)})` : nombre;
  const porPlanta = new Map<number, number>();
  const sumar = (nivel: number, v: number) => porPlanta.set(nivel, cm((porPlanta.get(nivel) ?? 0) + v));
  const plantaDe = (f: FilaRevisable) => soloNivel ?? f.nivel;

  let superficie: number;
  if (lineas.length > 0) {
    for (const f of lineas) sumar(plantaDe(f), f.superficie_m2);
    superficie = cm(lineas.reduce((a, f) => a + f.superficie_m2, 0));
    const deEstancias = cm(estancias.reduce((a, f) => a + f.superficie_m2, 0));
    if (estancias.length > 0 && Math.abs(deEstancias - superficie) > 1) {
      avisos.push(
        `«${nombreVisible}»: sus estancias suman ${m2(deEstancias)} y su línea dice ${m2(superficie)}; se toma la línea.`,
      );
    }
  } else {
    for (const f of estancias) sumar(plantaDe(f), f.superficie_m2);
    superficie = cm(estancias.reduce((a, f) => a + f.superficie_m2, 0));
  }

  let programa: Programa | null = null;
  if (estancias.length > 0) programa = programaDeEstancias(estancias);
  else {
    const conPrograma = lineas.find((f) => f.dormitorios > 0 || f.banos > 0);
    if (conPrograma) programa = { dormitorios: conPrograma.dormitorios, banos: conPrograma.banos, aseos: conPrograma.aseos };
  }

  return {
    nombre: nombreVisible,
    tipo: fs.find((f) => f.tipoVivienda !== "")?.tipoVivienda ?? "",
    porPlanta,
    superficie,
    programa,
    veces: Math.max(1, ...lineas.map((f) => f.numero)),
    filas: fs,
  };
}

/** Las viviendas sin desglose toman el programa de su tipo, o de otra del mismo tipo que sí lo tenga. */
function completarProgramas(
  instancias: Instancia[],
  definiciones: ReturnType<typeof definicionesDeTipo>,
  avisos: string[],
): void {
  const supuestas: string[] = [];
  for (const v of instancias) {
    const clave = norm(nombreTipo(v.tipo));
    const def = clave !== "" ? definiciones.get(clave) : undefined;
    if (v.superficie <= 0 && def) {
      v.superficie = def.superficie;
      const nivel = [...v.porPlanta.keys()][0];
      if (nivel !== undefined) v.porPlanta.set(nivel, def.superficie);
    }
    if (v.programa) continue;
    const otra = clave !== "" ? instancias.find((x) => x !== v && x.programa && norm(nombreTipo(x.tipo)) === clave) : undefined;
    v.programa = def?.programa ?? otra?.programa ?? null;
    if (!v.programa) supuestas.push(v.nombre);
  }
  if (supuestas.length > 0) {
    avisos.push(
      `El cuadro no dice cuántos dormitorios y baños tiene${supuestas.length > 1 ? "n" : ""} ${lista(supuestas)}: se suponen 2 dormitorios y 1 baño. Revísalo en su tipo.`,
    );
  }
}

const lista = (xs: string[]) =>
  xs.length <= 3 ? xs.map((x) => `«${x}»`).join(", ") : `${xs.slice(0, 3).map((x) => `«${x}»`).join(", ")} y ${xs.length - 3} más`;

function acotarPrograma(p: Programa): Programa {
  return {
    dormitorios: Math.min(8, Math.max(0, p.dormitorios)),
    banos: Math.min(5, Math.max(1, p.banos)),
    aseos: Math.min(4, Math.max(0, p.aseos)),
  };
}

/** Las filas que describen el programa de una vivienda: sus estancias o, si no, las de su tipo. */
function filasDefinitorias(v: Instancia, definiciones: ReturnType<typeof definicionesDeTipo>): FilaRevisable[] {
  const propias = v.filas.filter((f) => f.que === "estancia");
  if (propias.length > 0) return propias;
  const def = definiciones.get(norm(nombreTipo(v.tipo)));
  return def ? def.filas : v.filas;
}

/**
 * Los tipos: por el tipo que dice el cuadro o, si no lo dice, por programa y
 * superficie al m². Nombres: los del cuadro, y A, B, C… para los que no tienen.
 */
function agruparEnTipos(
  instancias: Instancia[],
  definiciones: ReturnType<typeof definicionesDeTipo>,
  documento: string,
  avisos: string[],
): [ViviendaTipo, Instancia[]][] {
  const grupos = new Map<string, Instancia[]>();
  for (const v of instancias) {
    const p = v.programa ?? { dormitorios: 2, banos: 1, aseos: 0 };
    const clave = v.tipo !== "" ? `L:${norm(nombreTipo(v.tipo))}` : `S:${firma(p)}:${Math.round(v.superficie)}`;
    grupos.set(clave, [...(grupos.get(clave) ?? []), v]);
  }
  const usados = new Set(
    [...grupos.values()].map((g) => g[0]!.tipo).filter((t) => t !== "").map(nombreTipo),
  );
  const letraLibre = () => {
    for (let c = 65; c <= 90; c++) {
      const l = String.fromCharCode(c);
      if (!usados.has(l)) {
        usados.add(l);
        return l;
      }
    }
    return `T${usados.size + 1}`;
  };

  const out: [ViviendaTipo, Instancia[]][] = [];
  for (const grupo of grupos.values()) {
    const primera = grupo[0]!;
    const nombre = primera.tipo !== "" ? nombreTipo(primera.tipo) : letraLibre();
    const superficies = grupo.map((v) => v.superficie);
    const superficie = moda(superficies);
    const min = Math.min(...superficies);
    const max = Math.max(...superficies);
    if (max - min > 1) {
      avisos.push(
        `Las viviendas ${nombre} no miden todas lo mismo (de ${m2(min)} a ${m2(max)}): el tipo toma ${m2(superficie)}, la más repetida.`,
      );
    }
    const firmas = new Map<string, { p: Programa; n: number }>();
    for (const v of grupo) {
      const p = v.programa ?? { dormitorios: 2, banos: 1, aseos: 0 };
      const e = firmas.get(firma(p));
      firmas.set(firma(p), { p, n: (e?.n ?? 0) + v.veces });
    }
    const programa = [...firmas.values()].sort((a, b) => b.n - a.n)[0]!.p;
    if (firmas.size > 1) {
      avisos.push(
        `Las viviendas ${nombre} no tienen todas el mismo número de dormitorios y baños: el tipo toma el más repetido.`,
      );
    }
    const conDesglose = grupo.find((v) => v.filas.some((f) => f.que === "estancia")) ?? primera;
    out.push([
      {
        clase: "vivienda",
        id: nombre,
        nombre,
        ...acotarPrograma(programa),
        superficieUtil_m2: superficie,
        origen: origenDe(documento, filasDefinitorias(conDesglose, definiciones)),
      },
      grupo,
    ]);
  }
  return out;
}

/**
 * Id del tipo: su nombre si es una palabra y no choca con nada; si no, `t<N>`.
 * Lo que devuelve queda ocupado, así que dos tipos nunca comparten id.
 */
function idLibre(id: string, ocupados: Set<string>): string {
  let libre = id;
  if (ocupados.has(libre) || !/^[\p{L}\p{N}]+$/u.test(libre)) {
    let k = 1;
    while (ocupados.has(`t${k}`)) k++;
    libre = `t${k}`;
  }
  ocupados.add(libre);
  return libre;
}

/** Plantas que faltan entre las que trae el cuadro (renumerar las juntaría sin decir nada). */
function avisarHuecos(niveles: number[], avisos: string[]): void {
  const faltan: string[] = [];
  const max = Math.max(...niveles);
  const min = Math.min(...niveles);
  for (let n = 0; n <= max; n++) if (!niveles.includes(n)) faltan.push(etiquetaNivel(n));
  for (let n = -1; n >= min; n--) if (!niveles.includes(n)) faltan.push(etiquetaNivel(n));
  if (faltan.length > 0) {
    avisos.push(
      `El cuadro no trae ${faltan.length === 1 ? "la planta" : "las plantas"} ${faltan.join(", ")}: en el edificio, las de encima bajan un nivel. Si es igual a otra, súbele las plantas iguales.`,
    );
  }
}
