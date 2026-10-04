// =============================================================================
// DB-SUA, SUA 4 — El dibujo (feature-20): la sección con cada zona teñida por la
// iluminancia de su alumbrado normal (100 lux, más intenso; 50 lux, suave; sin
// comprobar, blanco) y una luminaria de emergencia («luz») en cada zona que la
// lleva; los locales de riesgo especial, rayados. PURA; el render es el común.
// =============================================================================

import type { Edificio, UsoZona } from "../../lib/edificio/tipos";
import { USOS } from "../../lib/edificio/usos";
import { SECCION_BASE } from "../../lib/edificio/seccion";
import { componerDibujo, terrenoBajo, seccionConZonas, type DibujoSi, type EtiquetaSi, type MarcaSi, type TonoZona, type ZonaDibujada } from "../si/seccion";
import { cabeRotulo, huecosEtiquetas, zonaGeneral } from "../sua/colocar";
import type { JustificacionSua4 } from "./justificacion";
import { textoEtiquetaSua4 } from "./textos";

const S = SECCION_BASE;
const COMUN: readonly UsoZona[] = ["zona_comun", "vestibulo"];

function tonoLux(lux: number | undefined): TonoZona {
  if (lux === undefined) return "vivienda";
  return lux >= 100 ? "acento" : "oficinas";
}

export function dibujoSua4(j: JustificacionSua4, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const marcas: MarcaSi[] = [];
  const etiquetas: EtiquetaSi[] = [];
  const locales = new Set(j.elementos.flatMap((e) => (e.detalle.clase === "locales" ? e.detalle.locales.map((l) => l.zona.id) : [])));
  const normalDe = (zonaId: string): string | undefined => {
    for (const el of j.elementos) if (el.detalle.clase === "normal" && el.detalle.zonas.some((z) => z.id === zonaId)) return el.id;
    return undefined;
  };
  const localDe = (zonaId: string): string | undefined => j.elementos.find((e) => e.detalle.clase === "local" && e.detalle.zona.id === zonaId)?.id;

  // ── Las zonas, por su alumbrado normal ────────────────────────────────────
  for (const z of zonas) {
    const lux = j.luxDe[z.zonaId];
    marcas.push({
      tipo: "zona",
      key: `zona-${z.zonaId}-${z.nivel}`,
      zona: z,
      tono: tonoLux(lux),
      rayado: locales.has(z.zonaId),
      previsto: z.uso === "local_sin_uso",
      rotulo: lux !== undefined && cabeRotulo(z, `${USOS[z.uso].etiqueta} · ${lux} lx`) ? `${USOS[z.uso].etiqueta} · ${lux} lx` : USOS[z.uso].etiqueta,
      elementoId: normalDe(z.zonaId) ?? localDe(z.zonaId) ?? j.emergenciaDe[z.zonaId],
    });
  }

  // ── Una luminaria de emergencia en cada zona que la lleva ─────────────────
  for (const z of zonas) {
    const id = j.emergenciaDe[z.zonaId];
    if (!id) continue;
    // Abajo a la derecha: arriba a la izquierda va el rótulo de la zona.
    const y = z.enBanda ? (z.y0 + z.y1) / 2 : z.y1 - 10;
    marcas.push({ tipo: "icono", key: `luz-${z.zonaId}-${z.nivel}`, icono: "luz", x: z.x1 - 14, y, elementoId: id });
  }

  // Las etiquetas, sin pisar los iconos ni los rótulos.
  const huecos = huecosEtiquetas(base, zonas, marcas);
  let debajo = 0;
  const poner = (elementoId: string, preds: ((z: ZonaDibujada) => boolean)[], desdeAbajo = false) => {
    const el = j.elementos.find((e) => e.id === elementoId);
    if (!el) return;
    const texto = textoEtiquetaSua4(el);
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
  const de = (id: string) => (w: ZonaDibujada) => j.emergenciaDe[w.zonaId] === id || normalDe(w.zonaId) === id;
  const cualquiera = zonaGeneral;

  poner("normal-interior", [(w) => COMUN.includes(w.uso), de("normal-interior")], true);
  poner("normal-garaje", [de("normal-garaje")]);
  poner("emergencia-recorridos", [(w) => w.uso === "viviendas" || w.uso === "oficinas", de("emergencia-recorridos")]);
  poner("emergencia-garaje", [de("emergencia-garaje"), (w) => w.uso === "garaje" || w.uso === "garaje_privado"]);
  poner("emergencia-locales", [de("emergencia-locales"), (w) => w.nivel < 0, cualquiera], true);
  poner("emergencia", [cualquiera]);
  for (const el of j.elementos) {
    if (el.detalle.clase !== "local") continue;
    const zl = el.detalle.zona.id;
    poner(el.id, [(w) => w.zonaId === zl, cualquiera]);
  }
  // Lo común de la instalación, donde quede sitio: primero fuera de las viviendas.
  const fuera = (w: ZonaDibujada) => w.uso !== "viviendas" && w.uso !== "vivienda_unifamiliar" && zonaGeneral(w);
  for (const id of ["emergencia-cuadros", "emergencia-senales", "emergencia-luminarias", "emergencia-instalacion"]) {
    poner(id, [fuera, cualquiera], true);
  }

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada" });
}
