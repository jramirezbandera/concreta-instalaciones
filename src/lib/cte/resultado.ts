// =============================================================================
// Contrato de resultado de los motores (REDISENO-V4 §3.2, feature-14 §A).
//
// Cada `calcular()` sigue siendo puro y devuelve DATOS: por elemento, su valor,
// su veredicto, lo que decide el valor (`Gobierno`), la alternativa que se
// descartó y la cita. La prosa (la frase de la cabecera, «lo que manda», la
// memoria) la ponen funciones de texto aparte, así que el motor se testea por
// datos y los textos por separado.
//
// Solo tipos: cero lógica. Lo comparten todos los módulos desde la fase 4.
// =============================================================================

/** Una cifra con su unidad: Ø110 → { valor: 110, unidad: "mm" }. */
export interface Cantidad {
  valor: number;
  /** "mm", "UD", "m²", "kPa", "%", "plantas"… */
  unidad: string;
}

/** Valor de un elemento: una cifra, o una solución sin cifra («Primaria», «Bombeo»). */
export type ValorElemento = Cantidad | { texto: string };

/**
 * Veredicto de un elemento:
 *   - `ok` / `fail`: comprobación de cumplimiento;
 *   - `previsto`: se deja preparado y se justificará después (local sin uso);
 *   - `criterio`: criterio de proyecto, no exigencia (la horquilla de velocidad de HS4);
 *   - `dato`: un dato de partida, no una comprobación (la zona de radón, la presión de la red);
 *   - `fuera`: fuera del alcance de la herramienta (el coeficiente global de HE1).
 */
export type VeredictoElemento = "ok" | "fail" | "previsto" | "criterio" | "dato" | "fuera";

/** Lo que decide el valor de un elemento. */
export type Gobierno =
  /** La tabla: con lo que recibe, el valor es el primero que lo admite. */
  | { tipo: "capacidad_tabla"; tabla: string; recibe: Cantidad; admite: Cantidad }
  /** El desagüe de un aparato fija un Ø mínimo (el inodoro, Ø100). */
  | { tipo: "minimo_aparato"; aparato: string; diametroMin_mm: number }
  /** No puede ser menor que lo que le vierte (el colector frente a sus bajantes). */
  | { tipo: "no_menor_que_aguas_arriba"; elementos: string[]; diametro_mm: number }
  /** El número de plantas del edificio (ventilación de las bajantes). */
  | { tipo: "altura_edificio"; plantas: number; limite: number }
  /** Una cota frente a otra (el suelo del garaje frente al alcantarillado). */
  | { tipo: "cota"; cota_m: number; referencia_m: number }
  /** Lo decide el proyectista (previsión de un local, configuración de la red). */
  | { tipo: "decision_proyectista"; decision: string }
  /** La altura y las pérdidas se comen la presión de partida (HS4). */
  | { tipo: "presion_por_altura"; partida_kPa: number; altura_m: number; perdidas_kPa: number }
  /** Se elige el Ø para ir dentro de una horquilla de velocidad (HS4, criterio). */
  | { tipo: "velocidad"; velocidad_m_s: number; min_m_s: number; max_m_s: number }
  /** No se abren todos los aparatos a la vez (HS4, coeficiente K). */
  | { tipo: "simultaneidad"; instalado: Cantidad; k: number; aparatos: number }
  /** Un dato de la obra o de la compañía, no una comprobación. */
  | { tipo: "dato_de_partida"; fuente: string }
  /** Una fórmula del DB: S ≥ 2,5·qvt (HS3), U = 1/ΣR (HE1). */
  | { tipo: "formula"; formula: string; resultado: Cantidad }
  /** El caudal sale de una tabla por unidad: 120 l/s por plaza, 0,7 l/s·m² (HS3). */
  | { tipo: "caudal_por_unidad"; tabla: string; unidades: Cantidad; porUnidad: Cantidad }
  /** Equilibrar lo que entra con lo que sale (HS3). */
  | { tipo: "equilibrado"; entra: number; sale: number }
  /** Un grado o una clase leídos en una tabla de doble entrada (HS1, tablas 2.1, 2.3, 2.5 y 2.6). */
  | { tipo: "grado_tabla"; tabla: string; entradas: { k: string; v: string }[] };

/** Alternativa descartada: el valor inmediatamente menor y por qué no vale. */
export interface Alternativa {
  valor: Cantidad;
  /** Lo que admitiría (null si la tabla no lo admite a esa pendiente). */
  capacidad: Cantidad | null;
  /** «capacidad»: no le cabe lo que recibe; «minimo»: lo impide un mínimo. */
  porQueNo: "capacidad" | "minimo";
}

export interface ElementoResultado {
  /** Estable entre cálculos: «colector-general», «bajante-A-fecales»… */
  id: string;
  /** «bajante», «colector», «ramal», «pluviales», «ventilacion»… */
  tipo: string;
  veredicto: VeredictoElemento;
  valor: ValorElemento;
  limite?: Cantidad;
  manda: Gobierno;
  alternativa?: Alternativa;
  /** Capacidad usada, de 0 a 1 (lo que recibe / lo que admite). */
  uso?: number;
  /** «HS 5 · tabla 4.4», del más específico al más general. */
  cita: string[];
}

/**
 * Algo que el proyectista debe mirar. El id es estable para que su revisión se
 * pueda guardar en el expediente. Los datos los redacta la capa de textos.
 *   - `supuesto`: se calculó con un dato supuesto (la cota del alcantarillado);
 *   - `caso_especial`: la norma lo resuelve, pero pide algo más (bombeo);
 *   - `fuera_de_alcance`: la herramienta no lo justifica.
 */
export interface Aviso {
  id: string;
  tipo: "supuesto" | "caso_especial" | "fuera_de_alcance";
  /** Elemento del dibujo al que se refiere («Ver en el dibujo»). */
  elementoId?: string;
  datos: Record<string, unknown>;
}
