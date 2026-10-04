// =============================================================================
// Usos de zona — tabla DECLARATIVA (feature-12, REDISENO-V4 §3.1).
//
// Para cada uso: cómo se llama, de qué familia es en la sección, qué cuenta lleva
// (viviendas, plazas…), para qué justificaciones cuenta su superficie y qué hace
// cada justificación con la zona («Lo usan»). Es texto de interfaz, no cálculo:
// las cifras que se enseñan junto a estos textos salen de `deducciones.ts`, que
// las toma de tablas verificadas con su cita.
// =============================================================================

import type { UsoZona } from "./tipos";

/** Familia visual de la sección (fondo de la zona y leyenda). */
export type FamiliaUso = "vivienda" | "local" | "oficinas" | "comun" | "garaje";

/**
 * Qué hace una justificación con la zona:
 *   - `si`: la justifica aquí;
 *   - `otra`: la trata con otro criterio (previsión, decisión, otro reglamento);
 *   - `no`: no le afecta.
 */
export type TratoZona = "si" | "otra" | "no";

export interface LoUsa {
  codigo: string;
  texto: string;
  trato: TratoZona;
}

export interface DefUso {
  etiqueta: string;
  familia: FamiliaUso;
  /** Qué unidades se reparten en la zona por planta. */
  unidades?: "vivienda" | "nucleo_aseos";
  /** Contador propio de la zona. */
  contador?: { campo: "plazas" | "numero"; etiqueta: string; min: number; max: number };
  /**
   * Justificaciones que usan la SUPERFICIE de la zona en una cuenta («Su superficie
   * cuenta para»). Vacío ⇒ `cuentaParaNota` explica por qué no cuenta.
   */
  cuentaPara: string[];
  cuentaParaNota?: string;
  loUsan: LoUsa[];
}

export const USOS: Record<UsoZona, DefUso> = {
  viviendas: {
    etiqueta: "Viviendas",
    familia: "vivienda",
    unidades: "vivienda",
    cuentaPara: ["SI", "REBT"],
    loUsan: [
      { codigo: "HS3", texto: "ventilación de cada vivienda tipo", trato: "si" },
      { codigo: "HS4", texto: "suministro de cada vivienda", trato: "si" },
      { codigo: "HS5", texto: "desagües de cada vivienda", trato: "si" },
      { codigo: "HE1", texto: "dentro de la envolvente", trato: "si" },
      { codigo: "SI", texto: "uso Residencial Vivienda", trato: "si" },
      { codigo: "REBT", texto: "grado de electrificación de cada vivienda", trato: "si" },
    ],
  },
  vivienda_unifamiliar: {
    etiqueta: "Vivienda unifamiliar",
    familia: "vivienda",
    cuentaPara: ["SI", "REBT"],
    loUsan: [
      { codigo: "HS3", texto: "una vivienda, sin conducto colectivo", trato: "si" },
      { codigo: "HS4", texto: "contador único", trato: "si" },
      { codigo: "HS5", texto: "desagües de la vivienda", trato: "si" },
      { codigo: "HE1", texto: "dentro de la envolvente", trato: "si" },
      { codigo: "SUA", texto: "SUA 6 y SUA 7 no se aplican a la unifamiliar", trato: "no" },
    ],
  },
  local_sin_uso: {
    etiqueta: "Local sin uso",
    familia: "local",
    cuentaPara: ["SI", "REBT"],
    loUsan: [
      { codigo: "HS3", texto: "no aplica: el aire irá por el RITE cuando tenga actividad", trato: "otra" },
      { codigo: "HS4", texto: "se deja previsto su contador", trato: "otra" },
      { codigo: "HS5", texto: "se deja prevista su acometida a la red", trato: "otra" },
      { codigo: "HE1", texto: "frontera con lo habitable: como otro uso o como no habitable", trato: "otra" },
      { codigo: "SI", texto: "ocupación según el uso que se le asimile", trato: "si" },
      { codigo: "REBT", texto: "previsión de cargas del local", trato: "si" },
    ],
  },
  oficinas: {
    etiqueta: "Oficinas",
    familia: "oficinas",
    unidades: "nucleo_aseos",
    cuentaPara: ["SI", "RITE", "REBT"],
    loUsan: [
      { codigo: "HS3", texto: "no aplica: la calidad del aire va por el RITE (IDA 2)", trato: "otra" },
      { codigo: "HS4", texto: "núcleos de aseos", trato: "si" },
      { codigo: "HS5", texto: "núcleos de aseos", trato: "si" },
      { codigo: "HE1", texto: "dentro de la envolvente", trato: "si" },
      { codigo: "SI", texto: "uso Administrativo", trato: "si" },
      { codigo: "REBT", texto: "previsión de cargas", trato: "si" },
    ],
  },
  zona_comun: {
    etiqueta: "Portal y escalera",
    familia: "comun",
    cuentaPara: [],
    cuentaParaNota: "ninguna: es recorrido de evacuación",
    loUsan: [
      { codigo: "SI", texto: "recorrido de evacuación", trato: "si" },
      { codigo: "SUA", texto: "escaleras, rampas y desniveles", trato: "si" },
      { codigo: "REBT", texto: "servicios comunes", trato: "si" },
      { codigo: "HS", texto: "no le afecta", trato: "no" },
    ],
  },
  vestibulo: {
    etiqueta: "Vestíbulo",
    familia: "comun",
    cuentaPara: ["SI"],
    loUsan: [
      { codigo: "HS3", texto: "no aplica: RITE", trato: "otra" },
      { codigo: "HE1", texto: "dentro de la envolvente", trato: "si" },
      { codigo: "SI", texto: "recorrido de evacuación", trato: "si" },
    ],
  },
  garaje: {
    etiqueta: "Garaje",
    familia: "garaje",
    contador: { campo: "plazas", etiqueta: "Plazas", min: 1, max: 500 },
    cuentaPara: ["SI", "REBT"],
    loUsan: [
      { codigo: "HS3", texto: "ventilación por plaza", trato: "si" },
      { codigo: "HS5", texto: "sumideros; bombeo si queda por debajo de la red", trato: "si" },
      { codigo: "HS6", texto: "puede ser el espacio de contención si está ventilado", trato: "otra" },
      { codigo: "HE1", texto: "frontera con lo que tiene encima", trato: "otra" },
      { codigo: "SI", texto: "uso Aparcamiento", trato: "si" },
      { codigo: "SUA7", texto: "vehículos en movimiento", trato: "si" },
      { codigo: "REBT", texto: "previsión de cargas", trato: "si" },
    ],
  },
  garaje_privado: {
    etiqueta: "Garaje privado",
    familia: "garaje",
    cuentaPara: [],
    cuentaParaNota: "ninguna: va con la vivienda",
    loUsan: [
      { codigo: "HS3", texto: "ventilación del garaje", trato: "si" },
      { codigo: "HE1", texto: "frontera con la vivienda", trato: "otra" },
      { codigo: "SUA7", texto: "no aplica: es de una vivienda unifamiliar", trato: "no" },
    ],
  },
  trasteros: {
    etiqueta: "Trasteros",
    familia: "garaje",
    contador: { campo: "numero", etiqueta: "Trasteros", min: 1, max: 200 },
    cuentaPara: ["HS3"],
    loUsan: [
      { codigo: "HS3", texto: "ventilación por m² útil, en edificios de viviendas", trato: "si" },
      { codigo: "HS6", texto: "no habitable", trato: "no" },
      { codigo: "SI", texto: "ocupación nula en los trasteros de viviendas", trato: "no" },
    ],
  },
  instalaciones: {
    etiqueta: "Instalaciones",
    familia: "comun",
    cuentaPara: [],
    cuentaParaNota: "ninguna: ocupación nula",
    loUsan: [
      { codigo: "SI", texto: "ocupación nula: solo se entra a mantener", trato: "no" },
      { codigo: "HS3", texto: "según el cuarto; las salas de máquinas, por el RITE", trato: "otra" },
      { codigo: "REBT", texto: "servicios comunes", trato: "si" },
    ],
  },
};

/** Orden del selector de uso. */
export const ORDEN_USOS: readonly UsoZona[] = [
  "viviendas",
  "vivienda_unifamiliar",
  "local_sin_uso",
  "oficinas",
  "zona_comun",
  "vestibulo",
  "garaje",
  "garaje_privado",
  "trasteros",
  "instalaciones",
];

/** «Su superficie cuenta para: SI · REBT» o «ninguna: ocupación nula». */
export function textoCuentaPara(uso: UsoZona): string {
  const d = USOS[uso];
  return d.cuentaPara.length > 0 ? d.cuentaPara.join(" · ") : (d.cuentaParaNota ?? "—");
}
