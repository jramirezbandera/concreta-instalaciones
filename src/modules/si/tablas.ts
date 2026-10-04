// =============================================================================
// DB-SI — La procedencia común y las tablas que comparten varias secciones
// (feature-19). Lo que solo usa una sección va en su carpeta (`si5/tablas.ts`…).
// Verificación: research/verificacion-si1-si2.md, research/verificacion-si3.md y
// research/verificacion-si4-si6.md.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

/**
 * DB-SI vigente: consolidado de 4-mar-2025 (incluye el RD 732/2019 y el RD
 * 164/2025). Todas las tablas se cotejaron casilla a casilla en la imagen de
 * `research/pdf/DBSI.pdf`.
 */
export const PROC_SI = {
  db: "DB-SI",
  edicion: "consolidado 4-mar-2025 (RD 164/2025)",
  fecha: "2025-03-04",
  fuente: "codigotecnico.org",
} as const;

/** Lo que va al pie de la ficha de cada sección. */
export const EDICION_SI = "DB-SI (consolidado 4-mar-2025)";

// =============================================================================
// SI 1 — Las tablas que comparten varias secciones: sectores (tabla 1.1),
// resistencia entre sectores (tabla 1.2), locales de riesgo especial (tablas
// 2.1 y 2.2) y reacción al fuego (tabla 4.1). research/verificacion-si1-si2.md,
// bloques A3, A4 y A6, leídas en la imagen de DBSI.pdf pp. 10–17.
// =============================================================================

/** Un intervalo con los signos del DB: «>» (gt), «≥» (ge), «<» (lt), «≤» (le). */
export interface Intervalo {
  gt?: number;
  ge?: number;
  lt?: number;
  le?: number;
}

/** Una casilla de la tabla 2.1: un intervalo, «en todo caso» o vacía. */
export type CasillaRiesgo = Intervalo | "en_todo_caso" | null;

/** ¿Está v en el intervalo? */
export function enIntervalo(v: number, i: Intervalo): boolean {
  return (
    (i.gt === undefined || v > i.gt) &&
    (i.ge === undefined || v >= i.ge) &&
    (i.lt === undefined || v < i.lt) &&
    (i.le === undefined || v <= i.le)
  );
}

/** SI 1 ap. 1, tabla 1.1 — lo que la herramienta usa de la compartimentación en sectores. */
export const SECTORES_TABLA_1_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 1 ap. 1 ptos 1 y 2", tabla: "Tabla 1.1" },
  {
    /** Residencial Vivienda, Administrativo y Comercial: superficie CONSTRUIDA máxima de un sector. */
    sectorMax_m2: 2500,
    /** «Los elementos que separan viviendas entre sí deben ser al menos EI 60.» */
    entreViviendas_EI: 60,
    /** Establecimiento Administrativo en un edificio de viviendas: exento de ser sector hasta 500 m² construidos. */
    establecimientoExento_m2: 500,
    /** Zona subsidiaria Administrativa o Comercial: sector si excede de 500 m² construidos. */
    zonaSubsidiaria_m2: 500,
    /** Uso Aparcamiento: más de 100 m² construidos (Anejo SI A); si no, local de riesgo especial bajo (nota 2). */
    aparcamiento_m2: 100,
  } as const,
);

/** Fila de la tabla 1.2 por uso del sector. */
export type FilaTabla12 = "residencial" | "comercial" | "aparcamiento";

/**
 * SI 1 ap. 1 pto 3, tabla 1.2 — EI de paredes y techos que separan al sector del
 * resto del edificio [min]. Columnas: plantas bajo rasante · h ≤ 15 m · 15 < h ≤ 28 m
 * · h > 28 m, con h la altura de evacuación DEL EDIFICIO. La fila «residencial» es
 * también la de Administrativo; «comercial», la de Pública concurrencia y
 * Hospitalario. Los techos que separan de una planta superior, el mismo valor como
 * REI (nota 3). Notas (5) y (7) en `excepciones`.
 */
export const RESISTENCIA_SECTORES_TABLA_1_2 = tablaCTE(
  { ...PROC_SI, articulo: "SI 1 ap. 1 pto 3", tabla: "Tabla 1.2" },
  {
    residencial: [120, 60, 90, 120],
    comercial: [120, 90, 120, 180],
    aparcamiento: [120, 120, 120, 120],
    excepciones: {
      /** Nota (5): comercial bajo rasante, EI 180 si la altura de evacuación del edificio > 28 m. */
      comercialBajoRasanteSiHMas28: 180,
    },
    /** Puertas de paso: EI2 t-C5 con t la mitad del EI de la pared, o la cuarta parte por vestíbulo y dos puertas. */
    puertaDirecta: 0.5,
    puertaConVestibulo: 0.25,
  } as const satisfies Record<FilaTabla12, readonly number[]> & Record<string, unknown>,
);

/** Anejo SI A, «Vestíbulo de independencia»: paredes EI 120, puertas de al menos EI2 30-C5. */
export const VESTIBULO_INDEPENDENCIA = tablaCTE(
  { ...PROC_SI, articulo: "Anejo SI A, «Vestíbulo de independencia»" },
  { paredes_EI: 120, puertaMin_EI2: 30, separacionBarridos_m: 0.5 } as const,
);

/** Columna de la tabla 1.2 (y de la 3.1 de SI 6) para una planta. */
export function columnaAltura(bajoRasante: boolean, hEdificio_m: number): 0 | 1 | 2 | 3 {
  if (bajoRasante) return 0;
  if (hEdificio_m <= 15) return 1;
  if (hEdificio_m <= 28) return 2;
  return 3;
}

/** EI de la tabla 1.2 para una fila y una columna, con la nota (5). */
export function eiTabla12(fila: FilaTabla12, col: 0 | 1 | 2 | 3, hEdificio_m: number): number {
  const t = RESISTENCIA_SECTORES_TABLA_1_2.datos;
  if (fila === "comercial" && col === 0 && hEdificio_m > 28) return t.excepciones.comercialBajoRasanteSiHMas28;
  return t[fila][col];
}

/** Puerta de paso [min]: ½ del EI de la pared; por vestíbulo y dos puertas, ¼ y al menos 30 (Anejo SI A). */
export function puertaEI2(eiPared: number, conVestibulo: boolean): number {
  const t = RESISTENCIA_SECTORES_TABLA_1_2.datos;
  return conVestibulo ? Math.max(VESTIBULO_INDEPENDENCIA.datos.puertaMin_EI2, eiPared * t.puertaConVestibulo) : eiPared * t.puertaDirecta;
}

/**
 * SI 1 ap. 2, tabla 2.1 — las filas de los locales de riesgo especial que se dan
 * en un edificio de viviendas u oficinas. S es superficie CONSTRUIDA; P, potencia
 * útil nominal. Signos exactos del DB.
 */
export const LOCALES_RIESGO_TABLA_2_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 1 ap. 2 pto 1", tabla: "Tabla 2.1" },
  {
    almacenResiduos: { bajo: { gt: 5, le: 15 }, medio: { gt: 15, le: 30 }, alto: { gt: 30 } },
    /** Aparcamiento de S ≤ 100 m² o integrado en una vivienda unifamiliar. */
    aparcamientoPequeno: { bajo: "en_todo_caso", medio: null, alto: null },
    salaCalderas: { bajo: { gt: 70, le: 200 }, medio: { gt: 200, le: 600 }, alto: { gt: 600 } },
    /** Salas de máquinas de instalaciones de climatización (según RITE). */
    salaMaquinasRite: { bajo: "en_todo_caso", medio: null, alto: null },
    contadoresElectricidad: { bajo: "en_todo_caso", medio: null, alto: null },
    maquinariaAscensores: { bajo: "en_todo_caso", medio: null, alto: null },
    grupoElectrogeno: { bajo: "en_todo_caso", medio: null, alto: null },
    /** Residencial Vivienda, nota (5): trasteros vinculados a las viviendas. */
    trasteros: { bajo: { gt: 50, le: 100 }, medio: { gt: 100, le: 500 }, alto: { gt: 500 } },
  } as const satisfies Record<string, Record<"bajo" | "medio" | "alto", CasillaRiesgo>>,
);

export type ClaseRiesgo = "bajo" | "medio" | "alto";

/** SI 1 ap. 2, tabla 2.2 — condiciones de las zonas de riesgo especial. */
export const CONDICIONES_RIESGO_TABLA_2_2 = tablaCTE(
  { ...PROC_SI, articulo: "SI 1 ap. 2 pto 1", tabla: "Tabla 2.2" },
  {
    bajo: { R: 90, EI: 90, vestibulo: false, puertas: 1, puerta_EI2: 45, recorrido_m: 25 },
    medio: { R: 120, EI: 120, vestibulo: true, puertas: 2, puerta_EI2: 30, recorrido_m: 25 },
    alto: { R: 180, EI: 180, vestibulo: true, puertas: 2, puerta_EI2: 45, recorrido_m: 25 },
  } as const satisfies Record<ClaseRiesgo, unknown>,
);

/** SI 1 ap. 4, tabla 4.1 — clases de reacción al fuego de los revestimientos. */
export const REACCION_TABLA_4_1 = tablaCTE(
  { ...PROC_SI, articulo: "SI 1 ap. 4 pto 1", tabla: "Tabla 4.1" },
  {
    zonasOcupables: { techosParedes: "C-s2,d0", suelos: "EFL" },
    protegidos: { techosParedes: "B-s1,d0", suelos: "CFL-s1" },
    aparcamientosRiesgo: { techosParedes: "B-s1,d0", suelos: "BFL-s1" },
    espaciosOcultos: { techosParedes: "B-s3,d0", suelos: "BFL-s2" },
    /** Nota (1): solo los revestimientos que superen el 5 % del conjunto de paredes, techos o suelos del recinto. */
    umbral_pct: 5,
  } as const,
);
