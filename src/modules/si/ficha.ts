// =============================================================================
// DB-SI — La ficha común de las seis secciones (feature-19): lo que cada
// sección da (datos de partida, citas, observaciones) se completa aquí con la
// tabla de verificación, los avisos y la memoria. PURA.
// =============================================================================

import { VEREDICTO_FICHA } from "../../lib/cte/estados";
import { textoParrafo } from "../../lib/cte/memoria";
import type { MemoriaDoc } from "../../lib/cte/presentacion";
import type { Aviso } from "../../lib/cte/resultado";
import { procedenciaEdificio } from "../../lib/edificio/derivar";
import type { CitaNormativa, FichaData, FilaDato } from "../../lib/pdf/renderFicha";
import { ENGINE_VERSION } from "../../lib/version";
import type { OpcionesFichaSi, TextoSi } from "./definicion";
import { EDICION_SI } from "./tablas";
import type { ElementoSi, JustificacionSiBase } from "./tipos";

export const ORIGEN_EDIFICIO = "El edificio";
export const ORIGEN_DECISION = "Decisión del proyectista";
export const ORIGEN_SUPUESTO = "Supuesto del lado de la seguridad (falta el dato)";
export const ORIGEN_CRITERIO = "Criterio de proyecto (no es exigencia del CTE)";

export interface PiezasFichaSi<E> {
  /** «SI 5 — Intervención de los bomberos». */
  titulo: string;
  slug: string;
  normativa: CitaNormativa[];
  /** Los datos de partida propios (la descripción del edificio va primero, sola). */
  datosPartida: FilaDato[];
  /** El límite de cada elemento para la tabla de verificación. */
  limite: (el: ElementoSi<unknown>) => string;
  /** El valor de cada elemento en la tabla, corto: el de su etiqueta del dibujo. */
  valor: (el: ElementoSi<unknown>) => string;
  textoAviso: (a: Aviso) => TextoSi;
  observaciones?: string[];
  /** Edición del DB y documento de las citas: los del DB-SI si no se dicen (feature-20, DB-SUA). */
  edicionDB?: string;
  db?: string;
  memoria: MemoriaDoc;
  caption: string;
  pdfSvgId: string;
  opciones: OpcionesFichaSi<E>;
}

export function fichaSi<E>(j: JustificacionSiBase, p: PiezasFichaSi<E>): FichaData {
  const o = p.opciones;
  const datosPartida: FilaDato[] = [
    { concepto: "Descripción del edificio", valor: procedenciaEdificio(o.edificio), origen: ORIGEN_EDIFICIO },
    ...p.datosPartida,
  ];
  const observaciones = j.avisos.map((a) => {
    const t = p.textoAviso(a);
    return `${t.titulo} ${t.detalle} — ${o.revisados.includes(a.id) ? "Revisado por el proyectista." : "Pendiente de revisar."}`;
  });
  observaciones.push(...(p.observaciones ?? []));
  return {
    titulo: p.titulo,
    engineVersion: ENGINE_VERSION,
    edicionDB: p.edicionDB ?? EDICION_SI,
    normativa: p.normativa,
    datosPartida,
    verificaciones: j.elementos.map((el) => ({
      concepto: el.nombre,
      valor: p.valor(el),
      limite: p.limite(el),
      estado: VEREDICTO_FICHA[el.veredicto],
      referencia: el.cita[0] ?? p.db ?? "DB-SI",
    })),
    veredictoGlobal: j.veredicto,
    observaciones,
    memoria: p.memoria.parrafos.map(textoParrafo),
    svg: { elementId: p.pdfSvgId, nativeW: o.svg.nativeW, nativeH: o.svg.nativeH, caption: p.caption },
    inputs: { estado: o.estado, edificio: o.edificio },
    slug: p.slug,
  };
}
