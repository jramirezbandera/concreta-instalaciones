// =============================================================================
// DB-SUA, SUA 3 — El dibujo (feature-20): la sección con una puerta en cada
// planta con recintos que se pueden bloquear desde dentro (los baños de las
// viviendas, los aseos de las oficinas), el símbolo de accesibilidad en el aseo
// de las oficinas y la salida en el portal y en el garaje con su fuerza de
// apertura. PURA; el render es el común del DB-SI.
// =============================================================================

import type { Edificio, UsoZona } from "../../lib/edificio/tipos";
import { SECCION_BASE } from "../../lib/edificio/seccion";
import { componerDibujo, terrenoBajo, marcasZonasNeutras, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi, type ZonaDibujada } from "../si/seccion";
import { huecosEtiquetas } from "../sua/colocar";
import type { JustificacionSua3 } from "./justificacion";
import { textoEtiquetaSua3 } from "./textos";

const CON_BLOQUEO: readonly UsoZona[] = ["viviendas", "vivienda_unifamiliar", "oficinas"];
const S = SECCION_BASE;
const COMUN: readonly UsoZona[] = ["zona_comun", "vestibulo"];

export function dibujoSua3(j: JustificacionSua3, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const ids = new Set(j.elementos.map((e) => e.id));
  // Las zonas con recintos que se bloquean se pueden pulsar: llevan al elemento.
  const marcas: MarcaSi[] = marcasZonasNeutras(zonas).map((m) =>
    m.tipo === "zona" && ids.has("bloqueo") && CON_BLOQUEO.includes(m.zona.uso) ? { ...m, elementoId: "bloqueo" } : m,
  );
  const etiquetas: EtiquetaSi[] = [];
  const dibujadas = zonas.filter((z) => !z.enBanda);

  // Una puerta arriba a la derecha de cada zona con baños o aseos.
  if (ids.has("bloqueo")) {
    for (const z of dibujadas.filter((x) => CON_BLOQUEO.includes(x.uso))) {
      marcas.push({ tipo: "icono", key: `puerta-${z.zonaId}-${z.nivel}`, icono: "puerta", x: z.x1 - 14, y: z.y0 + 13, elementoId: "bloqueo" });
    }
  }

  // El aseo accesible de las oficinas.
  const zAseo = ids.has("llamada") ? dibujadas.find((x) => x.uso === "oficinas") : undefined;
  if (zAseo) marcas.push({ tipo: "icono", key: "aseo-accesible", icono: "accesible", x: zAseo.x1 - 36, y: zAseo.y0 + 13, elementoId: "llamada" });

  // Las salidas: el portal (o la entrada de la vivienda) y el garaje.
  const portal =
    dibujadas.find((x) => x.nivel === 0 && COMUN.includes(x.uso)) ??
    dibujadas.find((x) => x.nivel === 0 && x.uso !== "local_sin_uso") ??
    dibujadas[dibujadas.length - 1];
  if (portal) marcas.push({ tipo: "icono", key: "salida-portal", icono: "salida", x: portal.x1 - 14, y: portal.y1 - 10, elementoId: "fuerza" });
  const garaje = dibujadas.find((x) => x.uso === "garaje");
  if (garaje) marcas.push({ tipo: "icono", key: "salida-garaje", icono: "salida", x: garaje.x1 - 14, y: garaje.y1 - 10, elementoId: "fuerza" });

  // Las etiquetas, sin pisar los iconos ni los rótulos.
  const huecos = huecosEtiquetas(base, zonas, marcas);
  let debajo = 0;
  const poner = (elementoId: string, preds: ((z: ZonaDibujada) => boolean)[], desdeAbajo = false) => {
    const el = j.elementos.find((e) => e.id === elementoId);
    if (!el) return;
    const texto = textoEtiquetaSua3(el);
    for (const p of [...preds, () => true]) {
      const h = huecos.tomar(p, texto, desdeAbajo);
      if (h) {
        etiquetas.push({ key: `et-${elementoId}`, elementoId, x: h.x, y: h.y });
        return;
      }
    }
    // Sin sitio dentro: debajo del edificio.
    etiquetas.push({ key: `et-${elementoId}`, elementoId, x: (S.X0 + S.X1) / 2, y: terrenoBajo(base) + 22 * ++debajo });
  };
  poner("bloqueo", [(z) => CON_BLOQUEO.includes(z.uso)]);
  poner("llamada", [(w) => w === zAseo, (w) => w.uso === "oficinas"]);
  poner("fuerza", [(w) => w === portal, (w) => w.nivel === 0], true);

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada" });
}
