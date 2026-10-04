// =============================================================================
// Dónde están los cuartos húmedos de la unifamiliar (feature-18). PURO.
//
// La vivienda tipo dice CUÁNTOS (baños, aseos y una cocina); cada zona
// «vivienda unifamiliar» puede decir cuántos hay EN ELLA (`Zona.cuartos`). Lo
// leen HS4 y HS5, así que las dos redes ponen los cuartos en las mismas plantas.
//
//   - Sin ninguna zona con dato: el reparto supuesto de siempre — con varias
//     plantas, los baños en la más alta y la cocina y los aseos en la más baja.
//   - Con dato: manda el dato. Si no cuadra con la vivienda tipo, lo que sobra se
//     quita empezando por la planta más lejana a la de la regla, y lo que falta
//     va a la planta de la regla entre las zonas que no dicen nada (si todas
//     dicen, entre todas). La cocina es una: si hay varias, la más baja.
//   - `supuesto`: con varias plantas, algún cuarto no está donde lo dijo el
//     proyectista (no dijo nada, o no cuadraba). Es el aviso «por revisar».
// =============================================================================

import { etiquetaNivel, plantasDe } from "./derivar";
import type { CuartosZona, Edificio, ViviendaTipo } from "./tipos";

export interface CuartosPlanta {
  nivel: number;
  banos: number;
  aseos: number;
  cocina: boolean;
}

export interface RepartoUnifamiliar {
  tipo: ViviendaTipo;
  /** Cada planta con vivienda, de abajo arriba (también las que no tienen cuartos). */
  plantas: CuartosPlanta[];
  /** Lo que queda en cada zona, por planta del grupo. */
  porZona: Map<string, CuartosZona>;
  /** Alguna zona dice sus cuartos. */
  explicito: boolean;
  supuesto: boolean;
}

function sanea(n: number | undefined): number {
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n as number)) : 0;
}

/** El reparto de la unifamiliar, o `null` si el edificio no tiene vivienda unifamiliar. */
export function repartoUnifamiliar(e: Edificio): RepartoUnifamiliar | null {
  const tipo = e.unidades.find((u): u is ViviendaTipo => u.clase === "vivienda");
  if (!tipo) return null;
  // Un hueco por planta física y zona, de abajo arriba.
  const huecos = plantasDe(e)
    .flatMap((p) =>
      p.zonas
        .filter((z) => z.uso === "vivienda_unifamiliar")
        .map((z) => ({ zonaId: z.id, nivel: p.nivel, dato: z.cuartos })),
    )
    .sort((a, b) => a.nivel - b.nivel);
  if (huecos.length === 0) return null;

  const banos = sanea(tipo.banos);
  const aseos = sanea(tipo.aseos);
  const niveles = [...new Set(huecos.map((h) => h.nivel))];
  const asig: CuartosZona[] = huecos.map(() => ({ banos: 0, aseos: 0, cocina: false }));
  const alto = huecos.length - 1;
  // El primer hueco de la planta más alta (los baños) y el de la más baja.
  const primeroDeArriba = huecos.findIndex((h) => h.nivel === huecos[alto].nivel);
  const explicito = huecos.some((h) => h.dato);
  let ajustado = false;

  if (!explicito) {
    asig[primeroDeArriba].banos = banos;
    asig[0].aseos = aseos;
    asig[0].cocina = true;
  } else {
    huecos.forEach((h, i) => {
      if (!h.dato) return;
      asig[i] = { banos: sanea(h.dato.banos), aseos: sanea(h.dato.aseos), cocina: h.dato.cocina === true };
    });
    const sinDato = huecos.map((_, i) => i).filter((i) => !huecos[i].dato);
    const ajustar = (campo: "banos" | "aseos", total: number, arriba: boolean) => {
      let suma = asig.reduce((s, a) => s + a[campo], 0);
      if (suma === total) return;
      ajustado = true;
      // Sobra: se quita desde la planta más lejana a la de la regla.
      const orden = huecos.map((_, i) => i);
      if (!arriba) orden.reverse();
      for (const i of orden) {
        while (suma > total && asig[i][campo] > 0) {
          asig[i][campo]--;
          suma--;
        }
      }
      // Falta: a la planta de la regla, entre los huecos sin dato si los hay.
      if (suma < total) {
        const candidatos = sinDato.length > 0 ? sinDato : huecos.map((_, i) => i);
        const destino = arriba
          ? candidatos.find((i) => huecos[i].nivel === Math.max(...candidatos.map((c) => huecos[c].nivel)))!
          : candidatos[0];
        asig[destino][campo] += total - suma;
      }
    };
    ajustar("banos", banos, true);
    ajustar("aseos", aseos, false);
    const conCocina = asig.map((a, i) => (a.cocina ? i : -1)).filter((i) => i >= 0);
    if (conCocina.length !== 1) {
      ajustado = true;
      asig.forEach((a) => (a.cocina = false));
      asig[conCocina.length > 1 ? conCocina[0] : (sinDato[0] ?? 0)].cocina = true;
    }
  }

  const plantas: CuartosPlanta[] = niveles.map((nivel) => {
    const enNivel = asig.filter((_, i) => huecos[i].nivel === nivel);
    return {
      nivel,
      banos: enNivel.reduce((s, a) => s + a.banos, 0),
      aseos: enNivel.reduce((s, a) => s + a.aseos, 0),
      cocina: enNivel.some((a) => a.cocina),
    };
  });
  const porZona = new Map<string, CuartosZona>();
  huecos.forEach((h, i) => {
    if (!porZona.has(h.zonaId)) porZona.set(h.zonaId, asig[i]);
  });
  return {
    tipo,
    plantas,
    porZona,
    explicito,
    supuesto: niveles.length > 1 && (!explicito || ajustado),
  };
}

/**
 * Reparte los cuartos de la vivienda (en el orden baños → aseos → cocina, como
 * los generan HS4 y HS5) por plantas: los baños se numeran de arriba abajo; los
 * aseos, de abajo arriba. Solo devuelve las plantas con algún cuarto.
 */
export function repartirCuartos<C extends { clase: string }>(
  cuartos: C[],
  plantas: CuartosPlanta[],
): { nivel: number; cuartos: C[] }[] {
  const banos = cuartos.filter((c) => c.clase === "bano");
  const aseos = cuartos.filter((c) => c.clase === "aseo");
  const cocinas = cuartos.filter((c) => c.clase === "cocina");
  const enNivel = new Map<number, { banos: C[]; aseos: C[]; cocina: C[] }>(
    plantas.map((p) => [p.nivel, { banos: [], aseos: [], cocina: [] }]),
  );
  let ib = 0;
  for (const p of [...plantas].reverse()) {
    enNivel.get(p.nivel)!.banos.push(...banos.slice(ib, ib + p.banos));
    ib += p.banos;
  }
  let ia = 0;
  for (const p of plantas) {
    enNivel.get(p.nivel)!.aseos.push(...aseos.slice(ia, ia + p.aseos));
    ia += p.aseos;
  }
  const conCocina = plantas.find((p) => p.cocina) ?? plantas[0];
  if (conCocina) enNivel.get(conCocina.nivel)!.cocina.push(...cocinas);
  return plantas
    .map((p) => {
      const x = enNivel.get(p.nivel)!;
      return { nivel: p.nivel, cuartos: [...x.banos, ...x.aseos, ...x.cocina] };
    })
    .filter((g) => g.cuartos.length > 0);
}

function lista(partes: string[]): string {
  return partes.length <= 1 ? (partes[0] ?? "") : `${partes.slice(0, -1).join(", ")} y ${partes[partes.length - 1]}`;
}

/** «2 baños», «aseo y cocina», «sin cuartos húmedos». */
export function textoCuartos(c: { banos: number; aseos: number; cocina: boolean }): string {
  const partes: string[] = [];
  if (c.banos > 0) partes.push(c.banos === 1 ? "1 baño" : `${c.banos} baños`);
  if (c.aseos > 0) partes.push(c.aseos === 1 ? "1 aseo" : `${c.aseos} aseos`);
  if (c.cocina) partes.push("cocina");
  return partes.length > 0 ? lista(partes) : "sin cuartos húmedos";
}

/** «P1: 2 baños · PB: 1 aseo y cocina», de arriba abajo, sin las plantas vacías. */
export function textoReparto(r: RepartoUnifamiliar): string {
  return [...r.plantas]
    .reverse()
    .filter((p) => p.banos + p.aseos > 0 || p.cocina)
    .map((p) => `${etiquetaNivel(p.nivel)}: ${textoCuartos(p)}`)
    .join(" · ");
}
