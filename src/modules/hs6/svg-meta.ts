// DB-HS6 — Metadatos + geometría NO-COMPONENTE del render SVG (sin JSX). Separado
// de `svg.tsx` para que ese archivo exporte SOLO componentes React (regla
// `react-refresh/only-export-components`): aquí viven el id del clon PDF, las
// constantes de layout, la geometría 100% DETERMINISTA (sin Math.random, sin
// Date) y `hs6NativeSize`. Lo consumen el render (`svg.tsx`), la ficha PDF
// (`./ficha.ts`) y la pantalla (`./ui.tsx`) sin arrastrar JSX. ÚNICA fuente de
// verdad de las medidas: el render importa de aquí para no divergir.
//
// QUÉ REPRESENTA (cf. HE1 "sección por capas", NO árbol/grafo): una SECCIÓN
// VERTICAL conceptual del encuentro del local con el terreno. Bandas APILADAS de
// arriba (interior protegido) hacia abajo (terreno):
//   ┌───────────────────────────────────────────┐
//   │  LOCAL habitable (≤ nivel de referencia)    │  recinto protegido
//   ├───────────────────────────────────────────┤
//   │  SOLERA / forjado sanitario                 │  cierre superior
//   ├───────────────────────────────────────────┤
//   │  ESPACIO de contención ventilado (cámara)   │  medida (si existe)
//   │      aberturas de ventilación → exterior    │
//   ├───────────────────────────────────────────┤
//   │  BARRERA de protección (lámina sellada)     │  medida (si existe)
//   ├───────────────────────────────────────────┤
//   │  TERRENO (trama + flechas de radón ↑)       │  origen del radón
//   └───────────────────────────────────────────┘
//   (+ tubo de DESPRESURIZACIÓN que atraviesa el terreno → ventilador, si existe)
//
// La sección es DECLARATIVA según `porMedida`: solo se dibujan las bandas de las
// medidas presentes. Cada banda lleva su `id` y su `estado` para que `svg.tsx`
// resalte el ELEMENTO CRÍTICO (banda cuyo `id === result.elementoCriticoId`, o la
// banda-hueco del sentinela `HS6_FALTA_MEDIDA`). Casos "no aplica"/"sin exigencia"
// → sección simplificada con mensaje.
//
// El bbox SIEMPRE es [0,0]→(CONTENT_W, contentH); `hs6NativeSize` reproduce
// EXACTAMENTE el viewBox que `HS6SVG` pinta vía `fitViewBox`, de modo que
// `scale = CW / nativeW` del raster PDF no deforme nada.

import type { Kind } from "../../lib/svg/helpers";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import { HS6_FALTA_MEDIDA, type HS6Result, type ResultadoMedidaHS6 } from "./calc";

// Re-export del sentinela para que `svg.tsx` lo importe desde un único sitio
// (geometría) sin volver a tocar `calc.ts`.
export { HS6_FALTA_MEDIDA } from "./calc";

// Id del clon oculto que la ficha PDF clona y pasa a svg2pdf. Se exporta aquí
// (única fuente de verdad) para que toFichaData/renderFicha lo importen sin
// duplicar el literal. CONGELADO (Fase 5): debe ser EXACTAMENTE "hs6-svg-pdf".
export const HS6_PDF_SVG_ID = "hs6-svg-pdf";

// -----------------------------------------------------------------------------
// Constantes de layout (en unidades del dominio, mm-ish). ÚNICA fuente de verdad
// compartida por el render (`HS6SVG`, vía import) y por `hs6NativeSize`. La
// rejilla arranca en (0,0); el bbox es siempre [0,0]→(CONTENT_W, contentH).
// -----------------------------------------------------------------------------
export const VB_PAD = 12; // padding de fitViewBox (única fuente de verdad)
export const BANDA_TOTALES = 18; // franja inferior para la línea de veredicto global

// Anchura del cuerpo de la sección (la columna de bandas apiladas). El terreno y
// la despresurización sobresalen a la derecha para el tubo/ventilador.
export const SEC_W = 260; // ancho del bloque de bandas apiladas
export const LABEL_GUTTER = 150; // canal derecho para etiquetas de banda + tubo de despresurización
export const CONTENT_W = SEC_W + LABEL_GUTTER; // ancho total del contenido

// Altos de banda por papel (cada banda es un rectángulo horizontal de ancho SEC_W).
export const BAND_GAP = 6; // separación vertical entre bandas
export const H_LOCAL = 64; // local habitable (recinto protegido) — banda alta para la etiqueta del nivel
export const H_SOLERA = 26; // solera / forjado sanitario
export const H_CAMARA = 48; // espacio de contención ventilado (cámara)
export const H_BARRERA = 18; // barrera de protección (lámina fina)
export const H_TERRENO = 72; // terreno (trama + flechas de radón ascendente)
export const H_HUECO = 40; // banda-hueco del caso "falta medida" (aviso)
export const H_NOAPLICA = 96; // sección simplificada del caso "no aplica"/"sin exigencia"

// Geometría del tubo de despresurización (atraviesa el terreno → ventilador).
export const DESPRES_TUBO_DX = 40; // separación del tubo respecto al borde derecho de la sección
export const DESPRES_VENT_R = 14; // radio del símbolo de ventilador de extracción

// -----------------------------------------------------------------------------
// TIPOS de la geometría derivada. `svg.tsx` SOLO pinta lo que aquí se describe.
// -----------------------------------------------------------------------------

/** Papel semántico de una banda de la sección (fija su estilo de relleno/trama). */
export type RolBandaHS6 =
  | "local" // recinto habitable protegido (arriba)
  | "solera" // solera / forjado sanitario
  | "espacio_contencion" // cámara ventilada (medida)
  | "barrera" // lámina/membrana sellada (medida)
  | "terreno" // terreno con trama + flechas de radón
  | "hueco" // medida exigida que FALTA (banda de aviso)
  | "mensaje"; // banda de la sección simplificada ("no aplica")

/** Una abertura de ventilación de la cámara (lado fachada → barrido al exterior). */
export interface AberturaHS6 {
  /** Esquina superior izquierda y dimensiones del hueco (unidades del dominio). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Punta de la flecha de barrido al exterior (a la derecha del hueco). */
  flechaX: number;
}

/** Flecha de radón ascendente desde el terreno (codificación de la amenaza). */
export interface FlechaRadonHS6 {
  /** Base (en el terreno) y punta (hacia la barrera/solera) de la flecha. */
  x: number;
  yBase: number;
  yPunta: number;
}

/** Tubo de despresurización: captación en el terreno → extracción por ventilador. */
export interface DespresurizacionGeomHS6 {
  /** Id de la medida de despresurización (para resaltarla si es crítica). */
  id: string;
  /** Estado/veredicto de la medida. */
  estado: Veredicto;
  /** `true` si es el elemento crítico (la pinta `svg.tsx` en rojo multicanal). */
  critico: boolean;
  /** Tramo vertical del tubo dentro del terreno (captación). */
  tuboX: number;
  tuboYInf: number; // punta inferior (red de captación en el terreno)
  tuboYSup: number; // codo superior (sale hacia el ventilador)
  /** Centro del símbolo del ventilador de extracción (arriba a la derecha). */
  ventCx: number;
  ventCy: number;
  ventR: number;
  /** Centro X/Y de la etiqueta del sistema. */
  labelX: number;
  labelY: number;
}

/**
 * Una banda horizontal de la sección. Es la unidad que `svg.tsx` pinta y, si su
 * `id === result.elementoCriticoId`, resalta como crítico. Coordenadas en
 * unidades del dominio (mm-ish), origen (0,0) en la esquina sup-izq del contenido.
 */
export interface BandaHS6 {
  /** Papel semántico (fija el estilo de relleno/trama). */
  rol: RolBandaHS6;
  /**
   * Id estable de la banda. Para bandas de medida = `id` de la medida (enlaza con
   * `elementoCriticoId`). Para bandas de contexto (terreno/solera/local) = id
   * sintético estable (p.ej. "terreno", "solera", "local"). Para el hueco del caso
   * "falta medida" = `HS6_FALTA_MEDIDA`.
   */
  id: string;
  /** Medida origen (si la banda representa una medida de `porMedida`); si no, `null`. */
  medida: ResultadoMedidaHS6 | null;
  /** Estado/veredicto de la banda (para el tono y el refuerzo textual). */
  estado: Veredicto;
  /** `kind` del trazo derivado del estado/criticidad (normal | critical). */
  kind: Kind;
  /** `true` si esta banda es el ELEMENTO CRÍTICO a resaltar. */
  critico: boolean;
  /** Título corto de la banda (rótulo principal). */
  titulo: string;
  /** Subtítulo/detalle (p.ej. el criterio o el motivo); puede ser vacío. */
  subtitulo: string;
  /** Rectángulo de la banda. */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Centro de la banda (para anclar etiquetas/flechas). */
  cx: number;
  cy: number;
  /** Aberturas de ventilación (solo en la banda de espacio de contención). */
  aberturas: AberturaHS6[];
  /** Flechas de radón ascendente (solo en la banda de terreno). */
  flechasRadon: FlechaRadonHS6[];
}

/** Geometría completa de la sección HS6, 100% determinista a partir del resultado. */
export interface SeccionGeomHS6 {
  /** Bandas apiladas de arriba (local) a abajo (terreno), en orden de pintado. */
  bandas: BandaHS6[];
  /** Tubo de despresurización (si hay una medida de ese tipo); si no, `null`. */
  despresurizacion: DespresurizacionGeomHS6 | null;
  /** `true` si HS6 no exige medidas (sección simplificada con mensaje). */
  simplificada: boolean;
  /** Mensaje de la sección simplificada (motivo de no aplicabilidad o veredicto). */
  mensaje: string | null;
  /** Ancho/alto del contenido (bbox [0,0]→(contentW, contentH)). */
  contentW: number;
  contentH: number;
}

// -----------------------------------------------------------------------------
// HELPERS de derivación (puros).
// -----------------------------------------------------------------------------

/** `kind` del trazo según el veredicto (rojo solo en `fail`; el resto, normal). */
function kindDeVeredicto(estado: Veredicto): Kind {
  return estado === "fail" ? "critical" : "normal";
}

/** Alto de la banda de una medida según su tipo. */
function altoDeMedida(m: ResultadoMedidaHS6): number {
  switch (m.tipo) {
    case "barrera":
      return H_BARRERA;
    case "espacio_contencion":
      return H_CAMARA;
    case "despresurizacion":
      // La despresurización no ocupa banda propia en la columna (se dibuja como
      // tubo lateral que atraviesa el terreno); reservamos 0 de banda.
      return 0;
  }
}

/** Rótulo principal de la banda de una medida. */
function tituloDeMedida(m: ResultadoMedidaHS6): string {
  switch (m.tipo) {
    case "barrera":
      return "Barrera de protección";
    case "espacio_contencion":
      return "Espacio de contención ventilado";
    case "despresurizacion":
      return "Despresurización del terreno";
  }
}

/**
 * Construye las aberturas de ventilación de la cámara: dos huecos en el lado
 * derecho (fachada) con su flecha de barrido al exterior. Geometría fija
 * (determinista) relativa al rectángulo de la banda.
 */
function aberturasCamara(x: number, y: number, w: number, h: number): AberturaHS6[] {
  const hueco = Math.min(10, h * 0.35);
  const xDer = x + w - 4; // pegadas al borde derecho (fachada)
  const ys = [y + h * 0.28, y + h * 0.62];
  return ys.map((yy) => ({
    x: xDer - 6,
    y: yy - hueco / 2,
    w: 6,
    h: hueco,
    flechaX: xDer + 16, // punta de la flecha de barrido al exterior
  }));
}

/**
 * Flechas de radón ascendente desde el terreno hacia la barrera/solera. Tres
 * flechas equiespaciadas a lo ancho del terreno (codificación de la amenaza, no
 * solo color).
 */
function flechasRadon(x: number, y: number, w: number, h: number): FlechaRadonHS6[] {
  const n = 3; // tres flechas equiespaciadas a lo ancho del terreno
  const margen = w * 0.18;
  const util = w - 2 * margen;
  const flechas: FlechaRadonHS6[] = [];
  for (let i = 0; i < n; i++) {
    const fx = x + margen + (util * i) / (n - 1);
    flechas.push({ x: fx, yBase: y + h - 6, yPunta: y + 6 });
  }
  return flechas;
}

// -----------------------------------------------------------------------------
// GEOMETRÍA DETERMINISTA de la sección, derivada SOLO del resultado. Función pura
// compartida por el render (`HS6SVG`) y por `hs6NativeSize` (tamaño nativo del
// viewBox del raster PDF), de modo que `scale = CW / nativeW` no deforme nada.
// -----------------------------------------------------------------------------

/**
 * Calcula la sección vertical HS6 de forma 100% determinista a partir del
 * resultado. Apila, de arriba abajo: LOCAL → SOLERA → (cámaras) → (barreras) →
 * TERRENO, dibujando solo las bandas de las medidas presentes en `porMedida`. La
 * despresurización se devuelve aparte como tubo lateral. Casos "no aplica"/"sin
 * exigencia" → sección simplificada (una banda-mensaje + terreno). Si FALTA una
 * medida exigida (sentinela `HS6_FALTA_MEDIDA`), inserta una banda-hueco de aviso.
 */
export function calcularSeccionHS6(result: HS6Result): SeccionGeomHS6 {
  const criticoId = result.elementoCriticoId;
  const x0 = 0;

  // --- Caso "no aplica" / "sin exigencia": sección simplificada --------------
  if (!result.aplica) {
    const bandas: BandaHS6[] = [];
    let y = 0;

    // Banda-mensaje (recinto sin exigencia) sobre el terreno.
    const mensaje =
      result.motivoNoAplica ??
      `Zona ${result.zona}: HS6 no exige medidas de protección frente al radón.`;
    bandas.push({
      rol: "mensaje",
      id: "mensaje",
      medida: null,
      estado: "neutral",
      kind: "normal",
      critico: false,
      titulo: "Sin exigencia HS6",
      subtitulo: mensaje,
      x: x0,
      y,
      w: SEC_W,
      h: H_NOAPLICA,
      cx: x0 + SEC_W / 2,
      cy: y + H_NOAPLICA / 2,
      aberturas: [],
      flechasRadon: [],
    });
    y += H_NOAPLICA + BAND_GAP;

    // Terreno de contexto (sin flechas de amenaza destacadas; informativo).
    bandas.push({
      rol: "terreno",
      id: "terreno",
      medida: null,
      estado: "neutral",
      kind: "normal",
      critico: false,
      titulo: "Terreno",
      subtitulo: "",
      x: x0,
      y,
      w: SEC_W,
      h: H_TERRENO,
      cx: x0 + SEC_W / 2,
      cy: y + H_TERRENO / 2,
      aberturas: [],
      flechasRadon: [],
    });
    y += H_TERRENO;

    return {
      bandas,
      despresurizacion: null,
      simplificada: true,
      mensaje,
      contentW: CONTENT_W,
      contentH: y,
    };
  }

  // --- Caso general: sección por bandas según las medidas presentes ----------
  const bandas: BandaHS6[] = [];
  let y = 0;

  const pushBanda = (b: Omit<BandaHS6, "cx" | "cy">) => {
    bandas.push({ ...b, cx: b.x + b.w / 2, cy: b.y + b.h / 2 });
    y = b.y + b.h + BAND_GAP;
  };

  // 1) LOCAL habitable (recinto protegido, arriba): etiqueta del nivel de referencia.
  pushBanda({
    rol: "local",
    id: "local",
    medida: null,
    estado: "neutral",
    kind: "normal",
    critico: false,
    titulo: "Local habitable (recinto protegido)",
    subtitulo: `Nivel de referencia ≤ ${result.nivelReferencia_Bq_m3} Bq/m³`,
    x: x0,
    y,
    w: SEC_W,
    h: H_LOCAL,
    aberturas: [],
    flechasRadon: [],
  });

  // 2) SOLERA / forjado sanitario (cierre superior del encuentro con el terreno).
  pushBanda({
    rol: "solera",
    id: "solera",
    medida: null,
    estado: "neutral",
    kind: "normal",
    critico: false,
    titulo: "Solera / forjado sanitario",
    subtitulo: "",
    x: x0,
    y,
    w: SEC_W,
    h: H_SOLERA,
    aberturas: [],
    flechasRadon: [],
  });

  // 3) Bandas de medida en orden físico (cámaras encima de barreras). Las medidas
  //    de despresurización NO ocupan banda (van como tubo lateral). Orden estable.
  const camaras = result.porMedida.filter((m) => m.tipo === "espacio_contencion");
  const barreras = result.porMedida.filter((m) => m.tipo === "barrera");
  const despres = result.porMedida.filter((m) => m.tipo === "despresurizacion");

  for (const m of camaras) {
    const h = altoDeMedida(m);
    const critico = m.id === criticoId;
    const ab = aberturasCamara(x0, y, SEC_W, h);
    pushBanda({
      rol: "espacio_contencion",
      id: m.id,
      medida: m,
      estado: m.estado,
      kind: critico ? "critical" : kindDeVeredicto(m.estado),
      critico,
      titulo: tituloDeMedida(m),
      subtitulo: m.motivo,
      x: x0,
      y,
      w: SEC_W,
      h,
      aberturas: ab,
      flechasRadon: [],
    });
  }

  for (const m of barreras) {
    const h = altoDeMedida(m);
    const critico = m.id === criticoId;
    pushBanda({
      rol: "barrera",
      id: m.id,
      medida: m,
      estado: m.estado,
      kind: critico ? "critical" : kindDeVeredicto(m.estado),
      critico,
      titulo: tituloDeMedida(m),
      subtitulo: m.motivo,
      x: x0,
      y,
      w: SEC_W,
      h,
      aberturas: [],
      flechasRadon: [],
    });
  }

  // 4) Banda-HUECO del caso "falta una medida exigida" (sentinela): aviso visible
  //    de que no hay medida propuesta que resaltar pero la zona exige más.
  if (criticoId === HS6_FALTA_MEDIDA) {
    const critico = true;
    pushBanda({
      rol: "hueco",
      id: HS6_FALTA_MEDIDA,
      medida: null,
      estado: "fail",
      kind: "critical",
      critico,
      titulo: "Falta una medida exigida",
      subtitulo:
        result.elementoCritico ??
        `La zona ${result.zona} exige ${result.nMedidasMin} medida(s); válidas ${result.nMedidasValidas}.`,
      x: x0,
      y,
      w: SEC_W,
      h: H_HUECO,
      aberturas: [],
      flechasRadon: [],
    });
  }

  // 5) TERRENO (abajo): trama + flechas de radón ascendente (la amenaza).
  pushBanda({
    rol: "terreno",
    id: "terreno",
    medida: null,
    estado: "neutral",
    kind: "normal",
    critico: false,
    titulo: "Terreno (radón ascendente)",
    subtitulo: `Zona ${result.zona}`,
    x: x0,
    y,
    w: SEC_W,
    h: H_TERRENO,
    aberturas: [],
    flechasRadon: flechasRadon(x0, y, SEC_W, H_TERRENO),
  });

  // El último pushBanda dejó `y` con un BAND_GAP sobrante: el contenido termina en
  // el borde inferior de la última banda (el terreno).
  const ultima = bandas[bandas.length - 1];
  const contentH = ultima.y + ultima.h;

  // 6) Tubo de DESPRESURIZACIÓN (si hay esa medida): captación en el terreno →
  //    ventilador de extracción arriba a la derecha. Lateral, fuera de la columna.
  let despresurizacion: DespresurizacionGeomHS6 | null = null;
  if (despres.length > 0) {
    const m = despres[0]; // una sola representación gráfica (la primera, estable)
    const critico = m.id === criticoId;
    const terreno = bandas.find((b) => b.rol === "terreno")!;
    const tuboX = x0 + SEC_W + DESPRES_TUBO_DX;
    const ventCx = tuboX;
    const ventCy = VB_PAD; // a la altura superior del contenido (junto al local)
    despresurizacion = {
      id: m.id,
      estado: m.estado,
      critico,
      tuboX,
      tuboYInf: terreno.y + terreno.h - 8, // red de captación en el fondo del terreno
      tuboYSup: ventCy + DESPRES_VENT_R,
      ventCx,
      ventCy,
      ventR: DESPRES_VENT_R,
      labelX: tuboX + DESPRES_VENT_R + 6,
      labelY: ventCy + 2,
    };
  }

  return {
    bandas,
    despresurizacion,
    simplificada: false,
    mensaje: null,
    contentW: CONTENT_W,
    contentH,
  };
}

// -----------------------------------------------------------------------------
// Tamaño NATIVO del viewBox (ÚNICA fuente de verdad, consumida por la ficha PDF
// para `scale = CW / nativeW` del raster). Reproduce EXACTAMENTE lo que `HS6SVG`
// calcula vía `fitViewBox(esquinas, VB_PAD)` + BANDA_TOTALES, derivado de la
// sección del resultado. El contenido arranca en (0,0). CONGELADO (Fase 5).
// -----------------------------------------------------------------------------
export function hs6NativeSize(result: HS6Result): { nativeW: number; nativeH: number } {
  const { contentW, contentH } = calcularSeccionHS6(result);
  return {
    nativeW: contentW + 2 * VB_PAD,
    nativeH: contentH + 2 * VB_PAD + BANDA_TOTALES,
  };
}
