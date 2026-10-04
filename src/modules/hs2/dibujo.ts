// =============================================================================
// DB-HS 2 — El dibujo (feature-21): la sección del edificio con la calle a la
// derecha y el camión en el punto de recogida, el almacén o el espacio de
// reserva donde estén (el cuarto de residuos de El edificio, la planta baja, el
// sótano o la parcela), el recorrido hasta la calle y un contenedor en cada
// zona de viviendas para el almacenamiento inmediato. PURA; el render es el común.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import {
  componerDibujo,
  marcasZonasNeutras,
  seccionConZonas,
  terrenoBajo,
  type DibujoSi,
  type EtiquetaSi,
  type MarcaSi,
  type ZonaDibujada,
} from "../si/seccion";
import { huecosEtiquetas } from "../sua/colocar";
import type { JustificacionHs2 } from "./justificacion";
import { textoEtiquetaHs2 } from "./textos";

const S = SECCION_BASE;
/** Con la calle a la derecha, el dibujo es más ancho que la sección común (como en SI 5). */
const ANCHO = 780;
const X_CAMION = 712;
/** El espacio en la parcela, entre la fachada y la calle. */
const X_PARCELA = 640;

const VIVIENDA = new Set(["viviendas", "vivienda_unifamiliar"]);

export function dibujoHs2(j: JustificacionHs2, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const yR = base.yRasante;
  const dibujadas = zonas.filter((z) => !z.enBanda);
  const ids = new Set(j.elementos.map((e) => e.id));
  const espacioId = ids.has("almacen") ? "almacen" : ids.has("reserva") ? "reserva" : null;

  // El elemento de almacenamiento inmediato de cada zona de viviendas: el de su primer tipo.
  const tipoDeZona = (z: ZonaDibujada): string | null => {
    if (!VIVIENDA.has(z.uso)) return null;
    if (j.unifamiliar) return j.viviendas[0]?.tipoId ?? null;
    const zona = edificio.grupos.flatMap((g) => g.zonas).find((x) => x.id === z.zonaId);
    const tipo = (zona?.unidades ?? []).find((u) => j.viviendas.some((v) => v.tipoId === u.tipoId) && u.cantidad > 0);
    return tipo?.tipoId ?? null;
  };

  const marcas: MarcaSi[] = marcasZonasNeutras(zonas).map((m) => {
    if (m.tipo !== "zona") return m;
    if (j.cuarto && m.zona.zonaId === j.cuarto.zonaId && espacioId) return { ...m, elementoId: espacioId };
    const t = tipoDeZona(m.zona);
    return t && ids.has(`inmediato-${t}`) ? { ...m, elementoId: `inmediato-${t}` } : m;
  });
  const etiquetas: EtiquetaSi[] = [];

  // La calle y el camión: el punto de recogida.
  marcas.push(
    { tipo: "texto", key: "calle", x: (S.X1 + ANCHO) / 2 + 30, y: yR + 16, texto: "calle", ancla: "middle" },
    { tipo: "icono", key: "camion", icono: "camion", x: X_CAMION, y: yR - 11, elementoId: ids.has("recorrido") ? "recorrido" : undefined },
  );

  // Un contenedor en cada zona de viviendas.
  for (const z of dibujadas) {
    const t = tipoDeZona(z);
    if (t && ids.has(`inmediato-${t}`)) {
      marcas.push({ tipo: "icono", key: `inmediato-${z.zonaId}-${z.nivel}`, icono: "contenedor", x: z.x1 - 14, y: z.y0 + 13, elementoId: `inmediato-${t}` });
    }
  }

  // El almacén o la reserva y el recorrido hasta la calle.
  let espacio: { x: number; y: number; zona: ZonaDibujada | null } | null = null;
  if (espacioId) {
    const enCuarto = j.cuarto ? dibujadas.find((z) => z.zonaId === j.cuarto!.zonaId) : undefined;
    const ub = j.decisiones.ubicacion;
    const zona =
      enCuarto ??
      (ub === "sotano"
        ? (dibujadas.find((z) => z.nivel < 0 && z.uso === "garaje") ?? dibujadas.find((z) => z.nivel < 0))
        : ub === "planta_baja"
          ? (dibujadas.find((z) => z.nivel === 0 && (z.uso === "zona_comun" || z.uso === "vestibulo")) ?? dibujadas.find((z) => z.nivel === 0))
          : undefined);
    espacio = zona
      ? { x: zona.x1 - 14, y: zona.y1 - 11, zona }
      : { x: X_PARCELA, y: yR - 11, zona: null };
    marcas.push({ tipo: "icono", key: "espacio", icono: "contenedor", x: espacio.x, y: espacio.y, elementoId: espacioId });
    if (ids.has("recorrido")) {
      const yS = espacio.y + 4;
      const d =
        espacio.zona && espacio.zona.nivel < 0
          ? `M${espacio.x - 12} ${yS}H${S.X1 - 8}V${yR - 6}H${X_CAMION - 24}`
          : `M${espacio.x + 12} ${yR - 6}H${X_CAMION - 24}`;
      marcas.push({ tipo: "flecha", key: "recorrido", d, elementoId: "recorrido" });
    }
  }

  // Las etiquetas, sin pisar los iconos ni los rótulos.
  const huecos = huecosEtiquetas(base, zonas, marcas);
  let debajo = 0;
  const poner = (elementoId: string, preds: ((z: ZonaDibujada) => boolean)[], desdeAbajo = false) => {
    const el = j.elementos.find((e) => e.id === elementoId);
    if (!el) return;
    const texto = textoEtiquetaHs2(el);
    for (const p of preds) {
      const h = huecos.tomar(p, texto, desdeAbajo);
      if (h) {
        etiquetas.push({ key: `et-${elementoId}`, elementoId, x: h.x, y: h.y });
        return;
      }
    }
    etiquetas.push({ key: `et-${elementoId}`, elementoId, x: (S.X0 + S.X1) / 2, y: terrenoBajo(base) + 22 * ++debajo });
  };

  for (const v of j.viviendas) {
    poner(`inmediato-${v.tipoId}`, [(z) => tipoDeZona(z) === v.tipoId, (z) => VIVIENDA.has(z.uso)]);
  }
  if (espacioId && espacio) {
    if (espacio.zona) {
      const zona = espacio.zona;
      poner(espacioId, [(z) => z === zona, (z) => z.nivel === zona.nivel], true);
    } else {
      etiquetas.push({ key: `et-${espacioId}`, elementoId: espacioId, x: X_PARCELA, y: yR - 40 });
    }
  }
  // El otro espacio, si hay los dos (el almacén y la reserva), junto al primero.
  if (espacioId === "almacen" && ids.has("reserva") && espacio) {
    const zona = espacio.zona;
    if (zona) poner("reserva", [(z) => z === zona, (z) => z.nivel === zona.nivel], true);
    else etiquetas.push({ key: "et-reserva", elementoId: "reserva", x: X_PARCELA, y: yR - 64 });
  }
  if (ids.has("recorrido")) etiquetas.push({ key: "et-recorrido", elementoId: "recorrido", x: X_CAMION - 4, y: yR - 64 });
  if (ids.has("caracteristicas") && espacio?.zona) {
    const zona = espacio.zona;
    poner("caracteristicas", [(z) => z === zona, (z) => z.nivel === zona.nivel, () => true], true);
  }
  if (ids.has("ocupantes")) etiquetas.push({ key: "et-ocupantes", elementoId: "ocupantes", x: (S.X0 + S.X1) / 2, y: edificio.cubierta.tipo === "inclinada" ? 12 : S.ROOF - 18 });

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada", ancho: ANCHO });
}
