// =============================================================================
// DB-HE, Anejo G — Temperatura del agua fría de red y altitud de las capitales de
// provincia (tabla a-Anejo G). Es la ÚNICA altitud de las capitales que da el
// DB-HE, y la comparten tres usos (feature-22):
//   - HE 4: el agua fría de cada mes y su corrección por altitud (Anejo G pto 2);
//   - HE 1: la corrección del clima de enero desde la capital (DA DB-HE/2);
//   - la zona climática que se sugiere al elegir la capital (`zonasClimaticasHE`).
//
// VERIFICACIÓN (research/verificacion-he4-he5.md, bloque E6): las 676 casillas
// (52 capitales × altitud y 12 meses) cotejadas en la imagen a 300 ppp de la p. 54
// de research/pdf/DBHE.pdf (consolidado 14-jun-2022), sin discrepancias. Claves de
// provincia: las de `zonasClimaticasHE.ts`.
// =============================================================================

import { tablaCTE } from "../lib/cte/tabla";

export interface AguaFriaCapital {
  capital: string;
  altitud_m: number;
  /** Temperatura diaria media mensual del agua fría [°C], de enero a diciembre. */
  t: readonly number[];
}

/**
 * Anejo G, tabla a: temperatura diaria media mensual del agua fría de red en las
 * capitales de provincia, con su altitud. Claves de provincia: las de
 * `src/data/zonasClimaticasHE.ts`.
 */
export const AGUA_FRIA_ANEJO_G = tablaCTE(
  {
    db: "DB-HE",
    edicion: "Consolidado 14-06-2022",
    fecha: "2022-06-14",
    articulo: "Anejo G pto 1",
    tabla: "Tabla a-Anejo G",
    fuente: "codigotecnico.org · DBHE.pdf p. 54 (cotejado en imagen casilla a casilla)",
  },
  {
    provincias: {
      "Álava": { capital: "Vitoria-Gasteiz", altitud_m: 540, t: [7, 7, 8, 10, 12, 14, 16, 16, 14, 12, 8, 7] },
      "Albacete": { capital: "Albacete", altitud_m: 686, t: [7, 8, 9, 11, 14, 17, 19, 19, 17, 13, 9, 7] },
      "Alicante": { capital: "Alicante/Alacant", altitud_m: 8, t: [11, 12, 13, 14, 16, 18, 20, 20, 19, 16, 13, 12] },
      "Almería": { capital: "Almería", altitud_m: 16, t: [12, 12, 13, 14, 16, 18, 20, 21, 19, 17, 14, 12] },
      "Asturias": { capital: "Oviedo", altitud_m: 232, t: [9, 9, 10, 10, 12, 14, 15, 16, 15, 13, 10, 9] },
      "Ávila": { capital: "Ávila", altitud_m: 1131, t: [6, 6, 7, 9, 11, 14, 17, 16, 14, 11, 8, 6] },
      "Badajoz": { capital: "Badajoz", altitud_m: 186, t: [9, 10, 11, 13, 15, 18, 20, 20, 18, 15, 12, 9] },
      "Baleares": { capital: "Palma de Mallorca", altitud_m: 15, t: [11, 11, 12, 13, 15, 18, 20, 20, 19, 17, 14, 12] },
      "Barcelona": { capital: "Barcelona", altitud_m: 12, t: [9, 10, 11, 12, 14, 17, 19, 19, 17, 15, 12, 10] },
      "Burgos": { capital: "Burgos", altitud_m: 929, t: [5, 6, 7, 9, 11, 13, 16, 16, 14, 11, 7, 6] },
      "Cáceres": { capital: "Cáceres", altitud_m: 459, t: [9, 10, 11, 12, 14, 18, 21, 20, 19, 15, 11, 9] },
      "Cádiz": { capital: "Cádiz", altitud_m: 14, t: [12, 12, 13, 14, 16, 18, 19, 20, 19, 17, 14, 12] },
      "Cantabria": { capital: "Santander", altitud_m: 11, t: [10, 10, 11, 11, 13, 15, 16, 16, 16, 14, 12, 10] },
      "Castellón": { capital: "Castellón/Castelló", altitud_m: 27, t: [10, 11, 12, 13, 15, 18, 19, 20, 18, 16, 12, 11] },
      "Ceuta": { capital: "Ceuta", altitud_m: 40, t: [11, 11, 12, 13, 14, 16, 18, 18, 17, 15, 13, 12] },
      "Ciudad Real": { capital: "Ciudad Real", altitud_m: 628, t: [7, 8, 10, 11, 14, 17, 20, 20, 17, 13, 10, 7] },
      "Córdoba": { capital: "Córdoba", altitud_m: 106, t: [10, 11, 12, 14, 16, 19, 21, 21, 19, 16, 12, 10] },
      "A Coruña": { capital: "A Coruña", altitud_m: 26, t: [10, 10, 11, 12, 13, 14, 16, 16, 15, 14, 12, 11] },
      "Cuenca": { capital: "Cuenca", altitud_m: 999, t: [6, 7, 8, 10, 13, 16, 18, 18, 16, 12, 9, 7] },
      "Girona": { capital: "Girona", altitud_m: 70, t: [8, 9, 10, 11, 14, 16, 19, 18, 17, 14, 10, 9] },
      "Granada": { capital: "Granada", altitud_m: 683, t: [8, 9, 10, 12, 14, 17, 20, 19, 17, 14, 11, 8] },
      "Guadalajara": { capital: "Guadalajara", altitud_m: 685, t: [7, 8, 9, 11, 14, 17, 19, 19, 16, 13, 9, 7] },
      "Guipúzcoa": { capital: "San Sebastián", altitud_m: 12, t: [9, 9, 10, 11, 12, 14, 16, 16, 15, 14, 11, 9] },
      "Huelva": { capital: "Huelva", altitud_m: 30, t: [12, 12, 13, 14, 16, 18, 20, 20, 19, 17, 14, 12] },
      "Huesca": { capital: "Huesca", altitud_m: 488, t: [7, 8, 10, 11, 14, 16, 19, 18, 17, 13, 9, 7] },
      "Jaén": { capital: "Jaén", altitud_m: 568, t: [9, 10, 11, 13, 16, 19, 21, 21, 19, 15, 12, 9] },
      "Las Palmas": { capital: "Las Palmas de Gran Canaria", altitud_m: 13, t: [15, 15, 16, 16, 17, 18, 19, 19, 19, 18, 17, 16] },
      "León": { capital: "León", altitud_m: 838, t: [6, 6, 8, 9, 12, 14, 16, 16, 15, 11, 8, 6] },
      "Lleida": { capital: "Lleida", altitud_m: 182, t: [7, 9, 10, 12, 15, 17, 20, 19, 17, 14, 10, 7] },
      "Lugo": { capital: "Lugo", altitud_m: 454, t: [7, 8, 9, 10, 11, 13, 15, 15, 14, 12, 9, 8] },
      "Madrid": { capital: "Madrid", altitud_m: 655, t: [8, 8, 10, 12, 14, 17, 20, 19, 17, 13, 10, 8] },
      "Málaga": { capital: "Málaga", altitud_m: 11, t: [12, 12, 13, 14, 16, 18, 20, 20, 19, 16, 14, 12] },
      "Melilla": { capital: "Melilla", altitud_m: 15, t: [12, 13, 13, 14, 16, 18, 20, 20, 19, 17, 14, 13] },
      "Murcia": { capital: "Murcia", altitud_m: 39, t: [11, 11, 12, 13, 15, 17, 19, 20, 18, 16, 13, 11] },
      "Navarra": { capital: "Pamplona/Iruña", altitud_m: 490, t: [7, 8, 9, 10, 12, 15, 17, 17, 16, 13, 9, 7] },
      "Ourense": { capital: "Ourense", altitud_m: 139, t: [8, 10, 11, 12, 14, 16, 18, 18, 17, 13, 11, 9] },
      "Palencia": { capital: "Palencia", altitud_m: 734, t: [6, 7, 8, 10, 12, 15, 17, 17, 15, 12, 9, 6] },
      "Pontevedra": { capital: "Pontevedra", altitud_m: 27, t: [10, 11, 11, 13, 14, 16, 17, 17, 16, 14, 12, 10] },
      "La Rioja": { capital: "Logroño", altitud_m: 385, t: [7, 8, 10, 11, 13, 16, 18, 18, 16, 13, 10, 8] },
      "Salamanca": { capital: "Salamanca", altitud_m: 800, t: [6, 7, 8, 10, 12, 15, 17, 17, 15, 12, 8, 6] },
      "Segovia": { capital: "Segovia", altitud_m: 1002, t: [6, 7, 8, 10, 12, 15, 18, 18, 15, 12, 8, 6] },
      "Sevilla": { capital: "Sevilla", altitud_m: 11, t: [11, 11, 13, 14, 16, 19, 21, 21, 20, 16, 13, 11] },
      "Soria": { capital: "Soria", altitud_m: 1063, t: [5, 6, 7, 9, 11, 14, 17, 16, 14, 11, 8, 6] },
      "Santa Cruz de Tenerife": { capital: "Santa Cruz de Tenerife", altitud_m: 5, t: [15, 15, 16, 16, 17, 18, 20, 20, 20, 18, 17, 16] },
      "Tarragona": { capital: "Tarragona", altitud_m: 69, t: [10, 11, 12, 14, 16, 18, 20, 20, 19, 16, 12, 11] },
      "Teruel": { capital: "Teruel", altitud_m: 912, t: [6, 7, 8, 10, 12, 15, 18, 17, 15, 12, 8, 6] },
      "Toledo": { capital: "Toledo", altitud_m: 629, t: [8, 9, 11, 12, 15, 18, 21, 20, 18, 14, 11, 8] },
      "Valencia": { capital: "Valencia", altitud_m: 13, t: [10, 11, 12, 13, 15, 17, 19, 20, 18, 16, 13, 11] },
      "Valladolid": { capital: "Valladolid", altitud_m: 698, t: [6, 8, 9, 10, 12, 15, 18, 18, 16, 12, 9, 7] },
      "Vizcaya": { capital: "Bilbao/Bilbo", altitud_m: 6, t: [9, 10, 10, 11, 13, 15, 17, 17, 16, 14, 11, 10] },
      "Zamora": { capital: "Zamora", altitud_m: 649, t: [6, 8, 9, 10, 13, 16, 18, 18, 16, 12, 9, 7] },
      "Zaragoza": { capital: "Zaragoza", altitud_m: 199, t: [8, 9, 10, 12, 15, 17, 20, 19, 17, 14, 10, 8] },
    } as Record<string, AguaFriaCapital>,
  },
);
