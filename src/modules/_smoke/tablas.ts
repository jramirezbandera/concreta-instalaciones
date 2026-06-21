import { tablaCTE } from "../../lib/cte/tabla";

// Tabla/valor normativo de ejemplo para el módulo de humo: la extracción
// independiente mínima de cocción del DB-HS3. Demuestra el patrón
// "tabla-como-dato versionado con procedencia" (SPEC §4/§11) que alimenta la
// cita de la ficha. Valor real verificado [A1-03, IDR §2].
export const COCCION_MIN = tablaCTE(
  {
    db: "DB-HS3",
    edicion: "FOM/588/2017",
    fecha: "2019-12-24",
    articulo: "ap. 2, pto 4",
    fuente: "codigotecnico.org",
  },
  { caudalMin_l_s: 50 } as const,
);
