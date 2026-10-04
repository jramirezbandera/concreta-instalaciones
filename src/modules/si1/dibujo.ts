// =============================================================================
// DB-SI, SI 1 — El dibujo (feature-19): la sección con las zonas de cada planta,
// los locales de riesgo especial rayados, el local sin uso en discontinuo y una
// línea gruesa en cada pared o forjado que separa sectores o locales. Pulsar una
// zona selecciona su sector o su local. PURA; el render es el común.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { USOS } from "../../lib/edificio/usos";
import { centro, componerDibujo, seccionConZonas, tonoDe, type DibujoSi, type EtiquetaSi, type MarcaSi, type ZonaDibujada } from "../si/seccion";
import { elementoDeZona, type JustificacionSi1 } from "./justificacion";

const S = SECCION_BASE;
/** Margen para que un chip centrado en una zona estrecha no se salga del dibujo. */
const MARGEN_CHIP = 72;

export function dibujoSi1(j: JustificacionSi1, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const locales = new Set(j.comp.riesgo.locales.map((l) => l.zona.id));
  // El compartimento de cada zona, con el id de su elemento: su sector o el local
  // de riesgo que es. Una separación se atribuye al compartimento que no es el principal.
  const compartimento = (zonaId: string): string => {
    if (locales.has(zonaId)) return `local-${zonaId}`;
    const s = j.comp.sectores.find((x) => x.zonas.some((z) => z.id === zonaId));
    return `sector-${s ? s.id : "principal"}`;
  };
  const elementoLimite = (a: string, b: string): string => (a === "sector-principal" ? b : a);

  const marcas: MarcaSi[] = zonas.map((z) => ({
    tipo: "zona",
    key: `zona-${z.zonaId}-${z.nivel}`,
    zona: z,
    tono: tonoDe(z.uso),
    rayado: locales.has(z.zonaId),
    previsto: z.uso === "local_sin_uso",
    rotulo: USOS[z.uso].etiqueta,
    elementoId: elementoDeZona(j, z.zonaId) ?? undefined,
  }));

  // Las separaciones entre compartimentos: paredes entre zonas vecinas de una
  // planta y forjados entre una zona y la de encima.
  const dibujadas = zonas.filter((z) => !z.enBanda);
  const porNivel = new Map<number, ZonaDibujada[]>();
  for (const z of dibujadas) porNivel.set(z.nivel, [...(porNivel.get(z.nivel) ?? []), z]);
  for (const [nivel, fila] of porNivel) {
    for (let i = 1; i < fila.length; i++) {
      const a = compartimento(fila[i - 1].zonaId);
      const b = compartimento(fila[i].zonaId);
      if (a === b) continue;
      marcas.push({
        tipo: "linea",
        key: `pared-${nivel}-${i}`,
        d: `M${fila[i].x0} ${fila[i].y0}V${fila[i].y1}`,
        grosor: 3,
        elementoId: elementoLimite(a, b),
      });
    }
    const encima = porNivel.get(nivel + 1) ?? [];
    for (const z of fila) {
      for (const u of encima) {
        const x0 = Math.max(z.x0, u.x0);
        const x1 = Math.min(z.x1, u.x1);
        if (x1 - x0 < 1) continue;
        const a = compartimento(z.zonaId);
        const b = compartimento(u.zonaId);
        if (a === b) continue;
        const y = z.y0 - S.LOSA / 2;
        marcas.push({ tipo: "linea", key: `forjado-${z.zonaId}-${u.zonaId}-${nivel}`, d: `M${x0} ${y}H${x1}`, grosor: 3, elementoId: elementoLimite(a, b) });
      }
    }
  }

  // Las etiquetas: cada elemento en la mayor de sus zonas dibujadas.
  const etiquetas: EtiquetaSi[] = [];
  const ancla = (z: ZonaDibujada, dy = 0) => {
    const c = centro(z);
    return { x: Math.min(S.X1 - MARGEN_CHIP, Math.max(S.X0 + MARGEN_CHIP, c.x)), y: c.y + dy };
  };
  for (const el of j.elementos) {
    if (el.id === "reaccion") continue;
    const suyas = dibujadas.filter((z) => elementoDeZona(j, z.zonaId) === el.id);
    if (el.id === "entre-viviendas") {
      const viv = dibujadas.filter((z) => z.uso === "viviendas");
      if (viv.length > 0) etiquetas.push({ key: "et-entre-viviendas", elementoId: el.id, ...ancla(viv[0], 16) });
      continue;
    }
    if (suyas.length === 0) continue;
    const mayor = suyas.reduce((a, b) => (b.x1 - b.x0 > a.x1 - a.x0 ? b : a));
    const principal = el.id === "sector-principal" && suyas.some((z) => z.uso === "viviendas");
    // En papel las etiquetas no se escalonan solas: los locales, arriba, y lo que
    // no es local de riesgo, abajo, por si sus zonas estrechas quedan juntas.
    const dy = principal ? -12 : el.detalle.clase === "local" ? -12 : el.detalle.clase === "no_local" ? 14 : 0;
    etiquetas.push({ key: `et-${el.id}`, elementoId: el.id, ...ancla(mayor, dy) });
  }

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada" });
}
