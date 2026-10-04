// =============================================================================
// DB-SUA, SUA 2 — El dibujo (feature-20): la sección con la altura libre de paso
// de cada clase de zona (una cota vertical y su etiqueta) y, en la fachada, el
// área con riesgo de impacto de cada planta con su diferencia de cota y la fila
// de la tabla 1.1. Las puertas a pasillos comunes y la de garaje, con su icono;
// lo declarativo, con su etiqueta en la zona donde se aplica. PURA; el render es
// el común del DB-SI.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio, UsoZona } from "../../lib/edificio/tipos";
import { USOS } from "../../lib/edificio/usos";
import { componerDibujo, seccionConZonas, tonoDe, type DibujoSi, type EtiquetaSi, type MarcaSi, type ZonaDibujada } from "../si/seccion";
import { huecosEtiquetas, metros, zonaGeneral } from "../sua/colocar";
import type { JustificacionSua2 } from "./justificacion";
import { filaVidrioSua2, type FilaVidrioSua2 } from "./tablas";
import { textoEtiquetaSua2 } from "./textos";

const S = SECCION_BASE;
/** A la derecha de la fachada van las cotas de cada planta y la fila de sus vidrios. */
const ANCHO = S.W + 150;
const X_FILA = S.X1 + 125;

const COMUN: readonly UsoZona[] = ["zona_comun", "vestibulo"];
const VIVIENDA: readonly UsoZona[] = ["viviendas", "vivienda_unifamiliar"];

export function dibujoSua2(j: JustificacionSua2, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const marcas: MarcaSi[] = [];
  const etiquetas: EtiquetaSi[] = [];
  const ids = new Set(j.elementos.map((e) => e.id));
  const dibujadas = zonas.filter((z) => !z.enBanda);

  // De cada zona, el elemento de su altura libre (o el del local).
  const elementoDe = new Map<string, string>();
  for (const el of j.elementos) {
    if (el.detalle.clase === "altura") for (const z of el.detalle.zonas) elementoDe.set(z.id, el.id);
    if (el.detalle.clase === "local") elementoDe.set(el.detalle.zona.id, el.id);
  }
  for (const z of zonas) {
    marcas.push({
      tipo: "zona",
      key: `zona-${z.zonaId}-${z.nivel}`,
      zona: z,
      tono: tonoDe(z.uso),
      previsto: z.uso === "local_sin_uso",
      rotulo: USOS[z.uso].etiqueta,
      elementoId: elementoDe.get(z.zonaId),
    });
  }

  // ── La altura libre: una cota en la zona más alta de cada clase ───────────
  const zonaAltura = new Map<string, ZonaDibujada>();
  for (const el of j.elementos) {
    if (el.detalle.clase !== "altura") continue;
    const suyas = new Set(el.detalle.zonas.map((z) => z.id));
    const z = dibujadas.find((x) => suyas.has(x.zonaId));
    if (!z) continue;
    zonaAltura.set(el.id, z);
    // Bajo el rótulo de la zona; bajo rasante, a la derecha del de la planta.
    const x = z.x0 + (z.nivel < 0 && z.x0 <= S.X0 + 1 ? 100 : 5);
    marcas.push({ tipo: "flecha", key: `cota-${el.id}`, d: `M${x} ${z.y1 - 3}V${z.y0 + 18}`, elementoId: el.id });
  }

  // ── Puertas: la del pasillo común en el portal; la de garaje ──────────────
  const zPuertas = ids.has("puertas")
    ? (dibujadas.find((x) => COMUN.includes(x.uso)) ?? dibujadas.find((x) => x.uso === "oficinas") ?? dibujadas.find((x) => x.uso === "garaje"))
    : undefined;
  if (zPuertas) marcas.push({ tipo: "icono", key: "puerta-pasillo", icono: "puerta", x: zPuertas.x1 - 14, y: zPuertas.y1 - 10, elementoId: "puertas" });
  const zGaraje = ids.has("automaticas") ? dibujadas.find((x) => x.uso === "garaje" || x.uso === "garaje_privado") : undefined;
  if (zGaraje) marcas.push({ tipo: "icono", key: "puerta-garaje", icono: "puerta", x: zGaraje.x1 - 14, y: zGaraje.y1 - 10, elementoId: "automaticas" });

  // ── Los vidrios: el área con riesgo de cada planta en la fachada ──────────
  const alto = 0.9 * S.K; // paño fijo: del suelo a 0,90 m
  const yPorFila = new Map<FilaVidrioSua2, number[]>();
  const anotar = (f: FilaVidrioSua2, y: number) => yPorFila.set(f, [...(yPorFila.get(f) ?? []), y]);
  const plantas = j.elementos.flatMap((e) => (e.detalle.clase === "vidrios" ? e.detalle.plantas : []));
  const cotaDe = (nivel: number) => plantas.find((p) => p.nivel === nivel)?.cota_m;
  for (const p of base.pisos) {
    const c = cotaDe(p.nivel);
    if (c === undefined) continue;
    const f = filaVidrioSua2(c);
    marcas.push(
      { tipo: "linea", key: `vidrio-${p.nivel}`, d: `M${S.X1 + 6} ${p.ySuelo - 1}V${p.ySuelo - alto}`, grosor: 4, elementoId: `vidrios-${f}`, tono: "fuerte" },
      { tipo: "texto", key: `cota-${p.nivel}`, x: S.X1 + 14, y: p.ySuelo - 6, texto: `Δ ${metros(c)}` },
    );
    anotar(f, p.ySuelo - 22);
  }
  for (const b of base.bandas) {
    const cotas = b.niveles.map(cotaDe).filter((c): c is number => c !== undefined);
    if (cotas.length === 0) continue;
    const filas = [...new Set(cotas.map(filaVidrioSua2))];
    const paso = (b.y1 - b.y0 - 8) / filas.length;
    filas.forEach((f, i) => {
      const y1 = b.y1 - 4 - i * paso;
      marcas.push({ tipo: "linea", key: `vidrio-banda-${b.niveles[0]}-${f}`, d: `M${S.X1 + 6} ${y1}V${y1 - paso + 2}`, grosor: 4, elementoId: `vidrios-${f}`, tono: "fuerte" });
      anotar(f, (b.y0 + b.y1) / 2);
    });
    marcas.push({ tipo: "texto", key: `cota-banda-${b.niveles[0]}`, x: S.X1 + 14, y: (b.y0 + b.y1) / 2 + 4, texto: `Δ ${metros(Math.min(...cotas))}–${metros(Math.max(...cotas)).replace(" m", "")}` });
  }
  for (const [f, ys] of yPorFila) {
    if (!ids.has(`vidrios-${f}`)) continue;
    const y = ys.reduce((a, v) => a + v, 0) / ys.length;
    etiquetas.push({ key: `et-vidrios-${f}`, elementoId: `vidrios-${f}`, x: X_FILA, y: Math.round(y) });
  }

  // ── Las etiquetas dentro de las zonas, sin pisar nada ─────────────────────
  const huecos = huecosEtiquetas(base, zonas, marcas);
  let arriba = 0;
  const poner = (elementoId: string, preds: ((z: ZonaDibujada) => boolean)[], desdeAbajo = false) => {
    const el = j.elementos.find((e) => e.id === elementoId);
    if (!el) return;
    const texto = textoEtiquetaSua2(el);
    for (const p of [...preds, () => true]) {
      const h = huecos.tomar(p, texto, desdeAbajo);
      if (h) {
        etiquetas.push({ key: `et-${elementoId}`, elementoId, x: h.x, y: h.y });
        return;
      }
    }
    // Sin sitio dentro: encima de la cubierta, a la derecha.
    etiquetas.push({ key: `et-${elementoId}`, elementoId, x: X_FILA, y: Math.max(12, S.ROOF - 24 - 22 * arriba++) });
  };
  const cualquiera = zonaGeneral;
  const noVivienda = (w: ZonaDibujada) => !VIVIENDA.includes(w.uso) && zonaGeneral(w);

  for (const [id, z] of zonaAltura) {
    const suyas = new Set(j.elementos.flatMap((e) => (e.id === id && e.detalle.clase === "altura" ? e.detalle.zonas.map((x) => x.id) : [])));
    poner(id, [(w) => w === z, (w) => suyas.has(w.zonaId)]);
  }
  if (ids.has("puertas")) poner("puertas", [(w) => w === zPuertas, (w) => COMUN.includes(w.uso) || w.uso === "oficinas", (w) => w.uso === "viviendas", cualquiera]);
  if (ids.has("automaticas")) poner("automaticas", [(w) => w === zGaraje, cualquiera], true);
  for (const el of j.elementos) {
    if (el.detalle.clase !== "local") continue;
    const zl = el.detalle.zona.id;
    poner(el.id, [(w) => w.zonaId === zl, cualquiera]);
  }
  if (ids.has("senalizacion")) poner("senalizacion", [(w) => COMUN.includes(w.uso), noVivienda, cualquiera], true);
  poner("salientes", [(w) => COMUN.includes(w.uso), cualquiera]);
  poner("mamparas", [(w) => VIVIENDA.includes(w.uso) || w.uso === "oficinas", cualquiera]);
  poner("atrapamiento", [(w) => VIVIENDA.includes(w.uso) || w.uso === "oficinas", cualquiera]);
  // Los vidrios interiores sin planta sobre rasante (no debería pasar).
  if (ids.has("vidrios-menor055") && !yPorFila.has("menor055")) poner("vidrios-menor055", [cualquiera]);

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: edificio.cubierta.tipo === "inclinada", ancho: ANCHO });
}
