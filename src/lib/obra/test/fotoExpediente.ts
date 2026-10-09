import { justificacionRegistry } from "../../../data/justificacionRegistry";
import { CASOS_OBRA_NUEVA, edificioDeCaso } from "../../edificio/casos";
import { crearProyectoDemo } from "../../proyecto/demo";
import type { Intervencion, JustificacionKey, Proyecto } from "../../proyecto/tipos";
import { evaluarExpediente } from "../evaluar";
import { memoriaCte, textoPlanoMemoriaCte } from "../memoria";

// =============================================================================
// Foto del expediente (feature-27, paso 8): por proyecto, la aplicabilidad, la
// nota, la cita, el estado y el veredicto de cada justificación, y una huella
// del texto entero de la memoria. Se genera igual con el código de partida
// (7e576d8) y con el de ahora: obra nueva y las reformas sin asistente deben
// dar lo mismo.
// =============================================================================

/** FNV-1a de 32 bits: huella estable del texto de la memoria. */
function huella(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0");
}

const INTERVENCIONES: Intervencion[] = ["obra_nueva", "reforma", "ampliacion", "cambio_uso"];

function proyectos(): [string, Proyecto][] {
  const lista: [string, Proyecto][] = [];
  const base = crearProyectoDemo("2026-10-09T10:00:00.000Z");
  const edificios: [string, () => Proyecto["edificio"]][] = [
    ["demo", () => structuredClone(base.edificio)],
    // Los cuatro casos de partida de antes de feature-27 (sin el ejemplo de reforma).
    ...CASOS_OBRA_NUEVA.map(
      (c): [string, () => Proyecto["edificio"]] => [c, () => edificioDeCaso(c)],
    ),
  ];
  for (const [nombre, edificio] of edificios) {
    for (const intervencion of INTERVENCIONES) {
      for (const tienePiscina of [false, true]) {
        const p: Proyecto = {
          ...structuredClone(base),
          edificio: edificio(),
          justificaciones: nombre === "demo" ? structuredClone(base.justificaciones) : {},
        };
        p.datosGenerales = { ...p.datosGenerales, intervencion, tienePiscina };
        lista.push([`${nombre}|${intervencion}|${tienePiscina ? "piscina" : "sin"}`, p]);
      }
    }
  }
  return lista;
}

export type FotoExpediente = Record<string, Record<string, string>>;

export function fotoExpedientes(): FotoExpediente {
  const foto: FotoExpediente = {};
  for (const [id, p] of proyectos()) {
    const ev = evaluarExpediente(p);
    const fila: Record<string, string> = {};
    for (const e of justificacionRegistry) {
      if (e.dev) continue;
      const j = ev.porClave[e.key as JustificacionKey];
      if (!j) continue;
      fila[e.key] = [j.aplicabilidad, j.estado, j.veredicto ?? "", huella(j.nota ?? ""), j.cita ?? ""].join("|");
    }
    fila.memoria = huella(textoPlanoMemoriaCte(memoriaCte(p), "9 de octubre de 2026"));
    foto[id] = fila;
  }
  return foto;
}
