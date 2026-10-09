// =============================================================================
// Los esquemas para el plano (feature-16 §D y §F): la sección de saneamiento
// (HS5) y la de fontanería (HS4), con sus diámetros, en un DXF.
//
// No se redibujan: se renderiza el dibujo de la ficha en modo papel (el mismo
// que va al anejo, con las cifras dentro), se lee como SVG y se pasa a líneas y
// textos con `dibujoDeSvg`. Los dos esquemas van en el mismo fichero, uno al
// lado del otro y con su título encima, en metros (22 unidades del dibujo = 1 m,
// la escala de la sección). Se carga bajo demanda.
// =============================================================================

import { renderToStaticMarkup } from "react-dom/server";
import { estadoEfectivo } from "../obra/evaluar";
import { proyectoParaModulo } from "../proyecto/alcance";
import type { JustificacionKey, Proyecto } from "../proyecto/tipos";
import { SECCION_BASE } from "../edificio/seccion";
import { justificarHs5 } from "../../modules/hs5/justificacion";
import type { Hs5Estado } from "../../modules/hs5/estado";
import { tamanoDibujoHs5 } from "../../modules/hs5/seccion";
import { DibujoPdfHs5 } from "../../modules/hs5/SeccionHs5";
import { justificarHs4 } from "../../modules/hs4/justificacion";
import type { Hs4Estado } from "../../modules/hs4/estado";
import { tamanoDibujoHs4 } from "../../modules/hs4/seccion";
import { DibujoPdfHs4 } from "../../modules/hs4/SeccionHs4";
import { cajaDe, dxfBlob, type Dibujo, type Entidad } from "./escribir";
import { dibujoDeSvg } from "./svg";

/** Metros por unidad del dibujo de la sección. */
export const ESCALA_SECCION = 1 / SECCION_BASE.K;

/** Capas del esquema y su color ACI. */
const COLORES: Record<string, number> = {
  "INS-EDIFICIO": 8,
  "INS-SANEAMIENTO": 34,
  "INS-FONTANERIA": 5,
  "INS-TEXTOS": 7,
};

interface Esquema {
  titulo: string;
  capaRed: string;
  svg: string;
}

/** El dibujo en papel de un módulo, como texto SVG. */
function svgDe(proyecto: Proyecto, key: "hs5" | "hs4"): string {
  // En una obra existente, la red de lo intervenido (feature-27).
  const p = proyectoParaModulo(proyecto, key);
  const revisados = p.justificaciones[key]?.revisados ?? [];
  const estado = estadoEfectivo(p, key)!;
  const dg = p.datosGenerales;
  if (key === "hs5") {
    const obra = { pluviometria: dg.pluviometria, cotaAlcantarillado_m: dg.cotaAlcantarillado_m };
    const j = justificarHs5(estado as unknown as Hs5Estado, p.edificio, obra);
    const t = tamanoDibujoHs5(j, p.edificio);
    return renderToStaticMarkup(
      <DibujoPdfHs5 j={j} edificio={p.edificio} revisados={revisados} width={t.nativeW} height={t.nativeH} />,
    );
  }
  const j = justificarHs4(estado as unknown as Hs4Estado, p.edificio, { presionAcometida_kPa: dg.presionAcometida_kPa });
  const t = tamanoDibujoHs4(j, p.edificio);
  return renderToStaticMarkup(
    <DibujoPdfHs4 j={j} edificio={p.edificio} revisados={revisados} width={t.nativeW} height={t.nativeH} />,
  );
}

const ESQUEMAS: Record<"hs5" | "hs4", { titulo: string; capaRed: string }> = {
  hs5: { titulo: "Esquema de saneamiento · DB-HS 5", capaRed: "INS-SANEAMIENTO" },
  hs4: { titulo: "Esquema de fontanería · DB-HS 4", capaRed: "INS-FONTANERIA" },
};

/** Mueve las entidades de un dibujo. */
function mover(es: Entidad[], dx: number, dy: number): Entidad[] {
  return es.map((e) =>
    e.tipo === "linea" ? { ...e, x1: e.x1 + dx, y1: e.y1 + dy, x2: e.x2 + dx, y2: e.y2 + dy } : { ...e, x: e.x + dx, y: e.y + dy },
  );
}

/** Un dibujo con los esquemas uno al lado del otro, alineados por arriba. */
export function juntarEsquemas(esquemas: Esquema[]): Dibujo {
  const entidades: Entidad[] = [];
  const capas: Record<string, number> = {};
  let x = 0;
  const SEPARACION = 4; // m entre esquemas
  for (const e of esquemas) {
    const raiz = new DOMParser().parseFromString(e.svg, "text/html").querySelector("svg");
    if (!raiz) continue;
    const d = dibujoDeSvg(raiz, {
      escala: ESCALA_SECCION,
      capas: { edificio: "INS-EDIFICIO" },
      capaPorDefecto: e.capaRed,
      capaTextos: "INS-TEXTOS",
      colores: COLORES,
    });
    if (d.entidades.length === 0) continue;
    // Cada esquema empieza en su x y cuelga de y = 0; el título, encima.
    const dx = x - d.min.x;
    const dy = -d.max.y;
    entidades.push(...mover(d.entidades, dx, dy));
    entidades.push({ tipo: "texto", capa: "INS-TEXTOS", x, y: 1, altura: 0.5, texto: e.titulo, alineacion: "izquierda" });
    Object.assign(capas, d.capas);
    capas["INS-TEXTOS"] = COLORES["INS-TEXTOS"];
    x += d.max.x - d.min.x + SEPARACION;
  }
  return { entidades, capas, ...cajaDe(entidades) };
}

function slug(nombre: string): string {
  const s = nombre
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "proyecto";
}

/** El DXF de los esquemas listos (`claves`, en orden), y cómo se llama. */
export function esquemasDxf(p: Proyecto, claves: readonly JustificacionKey[]): { blob: Blob; filename: string } {
  const lista = claves.filter((k): k is "hs5" | "hs4" => k === "hs5" || k === "hs4");
  const dibujo = juntarEsquemas(lista.map((k) => ({ ...ESQUEMAS[k], svg: svgDe(p, k) })));
  return { blob: dxfBlob(dibujo), filename: `esquemas-instalaciones-${slug(p.nombre)}.dxf` };
}
