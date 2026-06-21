// Tablas CTE como DATOS versionados con metadatos de procedencia (SPEC §4/§11,
// innegociable de trazabilidad). Nunca hardcodear cifras sueltas en la lógica:
// envolver cada tabla en `TablaCTE<T>` para que su procedencia alimente también
// la cita de la ficha (renderFicha → CitaNormativa).

export interface ProcedenciaCTE {
  /** Documento básico, p.ej. "DB-HS3". */
  db: string;
  /** Edición/modificación vigente, p.ej. "FOM/588/2017" o "2019 (RD 732/2019)". */
  edicion: string;
  /** Fecha del texto consolidado, p.ej. "2022-06-14". */
  fecha?: string;
  /** Artículo o apartado, p.ej. "ap. 2 pto 4". */
  articulo?: string;
  /** Identificador de tabla, p.ej. "Tabla 2.1". */
  tabla?: string;
  /** Fuente (URL/documento), p.ej. "codigotecnico.org". */
  fuente?: string;
}

/** Tabla/valor normativo envuelto con su procedencia. `datos` es inmutable. */
export interface TablaCTE<T> {
  procedencia: ProcedenciaCTE;
  datos: T;
}

/** Helper para declarar una tabla versionada de forma legible. */
export function tablaCTE<const T>(procedencia: ProcedenciaCTE, datos: T): TablaCTE<T> {
  return { procedencia, datos };
}

/** Convierte la procedencia de una tabla en la cita de ficha (renderFicha). */
export function citaDe(p: ProcedenciaCTE): {
  db: string;
  exigencia?: string;
  articulo?: string;
  edicion: string;
} {
  return {
    db: p.db,
    articulo: p.tabla ?? p.articulo,
    edicion: p.edicion,
  };
}
