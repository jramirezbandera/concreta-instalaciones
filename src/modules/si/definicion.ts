// =============================================================================
// DB-SI — Lo que cada sección (SI 1 a SI 6) aporta a la pantalla común, a La obra
// y al anejo (feature-19). Las seis comparten la anatomía v4 entera (cabecera,
// «Qué entra», decisiones, el dibujo con sus etiquetas, la franja, la lista y la
// memoria), así que cada sección solo da sus funciones PURAS: justificar,
// redactar y dibujar. Las decisiones (React) van aparte, en su `ui.tsx`, para
// que La obra pueda importar la definición sin arrastrar componentes.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { DetalleElemento, EstadoPresentacion, MemoriaDoc } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import type { Edificio } from "../../lib/edificio/tipos";
import type { FichaData } from "../../lib/pdf/renderFicha";
import type { DatosGenerales } from "../../lib/proyecto/tipos";
import type { DibujoSi } from "./seccion";
import type { ClaveSi, ElementoSi, JustificacionSiBase } from "./tipos";

/** Un título y su explicación: un aviso o lo que no cumple, ya redactado. */
export interface TextoSi {
  titulo: string;
  detalle: string;
}

/** Lo que una sección lee del expediente. */
export interface ProyectoSi {
  edificio: Edificio;
  datosGenerales: DatosGenerales;
}

export interface OpcionesFichaSi<E> {
  estado: E;
  edificio: Edificio;
  revisados: readonly string[];
  svg: { nativeW: number; nativeH: number };
}

export interface DefinicionSi<E extends Record<string, unknown>, J extends JustificacionSiBase> {
  key: ClaveSi;
  defaults: E;
  /** Sujeto de la cabecera: «Propagación interior». */
  sujeto: string;
  justificar(estado: E, proyecto: ProyectoSi): J;

  // ── Textos ────────────────────────────────────────────────────────────────
  frase(j: J): string;
  metricas(j: J): string;
  queEntra(j: J, estados: Record<string, EstadoPresentacion>): FilaQueEntra[];
  /** Las piezas de su fila en La obra: lo que decide la sección, en dos o tres palabras. */
  piezas(j: J): { texto: string; acento: boolean }[];
  franja(el: ElementoSi<unknown>, j: J, estado: EstadoPresentacion): DetalleElemento;
  etiqueta(el: ElementoSi<unknown>): string;
  resultadoLista(el: ElementoSi<unknown>): string;
  textoAviso(a: Aviso): TextoSi;
  textoIncumplimiento(el: ElementoSi<unknown>): TextoSi | null;
  /** El cambio de las decisiones que arregla lo que no cumple. */
  arreglo?(el: ElementoSi<unknown>, j: J): { etiqueta: string; cambios: Partial<E> } | null;
  /** Avisos que se arreglan en Datos de la obra o en El edificio (llevan el enlace). */
  avisosADatos?: ReadonlySet<string>;
  avisosAEdificio?: ReadonlySet<string>;

  // ── El dibujo ─────────────────────────────────────────────────────────────
  tituloDibujo: string;
  pistaDibujo: string;
  dibujo(j: J, edificio: Edificio): DibujoSi;
  describirDibujo(j: J): string;
  /** El elemento que se ve al abrir (lo que no cumple, si lo hay). */
  seleccionInicial(j: J): string | null;

  // ── Memoria y ficha ───────────────────────────────────────────────────────
  memoria(j: J): MemoriaDoc;
  ficha(j: J, o: OpcionesFichaSi<E>): FichaData;
  /** Id del clon oculto del dibujo en papel. */
  pdfSvgId: string;
}
