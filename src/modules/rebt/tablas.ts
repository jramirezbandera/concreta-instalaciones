// =============================================================================
// REBT — Grado de electrificación y previsión de cargas (feature-23). Valores
// reglamentarios como DATOS versionados con procedencia (SPEC §4/§11). Aquí
// SOLO datos y funciones puras de tabla; la justificación vive en
// `justificacion.ts`.
//
// EDICIÓN: REBT (RD 842/2002) consolidado del BOE (BOE-A-2002-18099), última
// modificación 03-09-2025, con el RD 1053/2014 (ITC-BT-52 y los apartados 1, 2.1.2
// y 5 de la ITC-BT-10) y el RD 450/2022 (ITC-BT-52 ap. 3.2).
//
// VERIFICACIÓN (research/verificacion-rebt.md): cotejado en la imagen de las
// páginas del consolidado (ITC-BT-04, 10, 16, 25 y 52) y de las guías técnicas
// de aplicación del Ministerio (BT-10, BT-16, BT-25 y BT-52). Lo que hay que saber:
//   - las potencias son MÍNIMOS: el proyectista puede prever más si conoce la
//     demanda real (ITC-BT-10 ap. 4 y 5.2; Guía BT-10);
//   - el coeficiente de la tabla 1 es un número EQUIVALENTE de viviendas (10
//     viviendas → 8,5), no un factor menor que 1;
//   - el índice del consolidado de la ITC-BT-10 no está al día: en el cuerpo, el
//     ap. 5 es la recarga del vehículo eléctrico, el 6 la previsión de cargas y
//     el 7 los suministros monofásicos. Se cita por el cuerpo.
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";

export const PROC_REBT = {
  db: "REBT",
  edicion: "RD 842/2002, consolidado 03-09-2025",
  fecha: "2025-09-03",
  fuente: "boe.es · BOE-A-2002-18099 (cotejado en imagen)",
} as const;

// Las guías técnicas de aplicación del Ministerio no son reglamentarias; cada una
// con su edición.
const PROC_GUIA_BT10 = {
  db: "Guía técnica de aplicación ITC-BT-10",
  edicion: "sep-03, rev. 1",
  fecha: "2003-09",
  fuente: "industria.gob.es · guia_bt_10_sep03R1.pdf (cotejado en imagen)",
} as const;

const PROC_GUIA_BT52 = {
  db: "Guía técnica de aplicación ITC-BT-52",
  edicion: "sept-2024, rev. 2",
  fecha: "2024-09",
  fuente: "industria.gob.es · guia_bt_52_nov17R1.pdf (cotejado en imagen)",
} as const;

/** Lo que va al pie de la ficha. */
export const EDICION_REBT = "REBT (RD 842/2002), consolidado BOE-A-2002-18099, últ. modif. 03-09-2025";

/**
 * ITC-BT-10 ap. 2.1.2 y 2.2: potencia a prever por vivienda, no inferior a
 * 5 750 W a 230 V (básica) ni a 9 200 W (elevada). Es elevada con previsión de
 * electrodomésticos por encima de la básica, de calefacción eléctrica o de aire
 * acondicionado, con más de 160 m² útiles o con recarga del vehículo eléctrico
 * en la unifamiliar. ITC-BT-25 ap. 2.1: IGA de 25 A como mínimo. ap. 7: la
 * distribuidora da suministro monofásico hasta 14 490 W si se le pide.
 */
export const GRADO_REBT = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-10 ap. 2.1.2, 2.2 y 7; ITC-BT-25 ap. 2.1" },
  {
    basica_W: 5750,
    elevada_W: 9200,
    /** «superficies útiles de la vivienda superiores a 160 m²»: estricto. */
    superficieElevadaMasDe_m2: 160,
    tension_V: 230,
    igaMin_A: 25,
    monofasicoMax_W: 14490,
  } as const,
);

/**
 * Guía BT-10, tabla C: escalones de la potencia prevista en suministro
 * monofásico con el calibre del IGA. La básica abarca 5 750 y 7 360 W.
 */
export const ESCALONES_REBT = tablaCTE(
  { ...PROC_GUIA_BT10, articulo: "ap. 6", tabla: "Tabla C" },
  [
    { potencia_W: 5750, iga_A: 25 },
    { potencia_W: 7360, iga_A: 32 },
    { potencia_W: 9200, iga_A: 40 },
    { potencia_W: 11500, iga_A: 50 },
    { potencia_W: 14490, iga_A: 63 },
  ] as const,
);

/**
 * El IGA del escalón monofásico de una potencia (el primero que la cubre). Solo
 * para potencias de hasta 14 490 W: por encima, el suministro es trifásico.
 */
export function igaDe(potencia_W: number): number {
  const e = ESCALONES_REBT.datos.find((x) => x.potencia_W >= potencia_W);
  return e ? e.iga_A : Math.ceil(potencia_W / GRADO_REBT.datos.tension_V);
}

/**
 * ITC-BT-10 ap. 3.1, tabla 1: coeficiente de simultaneidad según el número de
 * viviendas. El consolidado imprime «14 3» y «15 3» en n = 19 y 21: son 14,3 y
 * 15,3 (Guía BT-10 y la fórmula de n > 21).
 */
export const SIMULTANEIDAD_REBT = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-10 ap. 3.1", tabla: "Tabla 1" },
  {
    /** n = 1 … 21. */
    coeficientes: [1, 2, 3, 3.8, 4.6, 5.4, 6.2, 7, 7.8, 8.5, 9.2, 9.9, 10.6, 11.3, 11.9, 12.5, 13.1, 13.7, 14.3, 14.8, 15.3],
    /** n > 21: 15,3 + (n − 21) · 0,5. */
    base21: 15.3,
    pasoMasDe21: 0.5,
  } as const,
);

/** Coeficiente de simultaneidad de la tabla 1 (0 sin viviendas). */
export function coeficienteSimultaneidad(n: number): number {
  const T = SIMULTANEIDAD_REBT.datos;
  const v = Math.max(0, Math.trunc(n));
  if (v === 0) return 0;
  if (v <= T.coeficientes.length) return T.coeficientes[v - 1];
  return Math.round((T.base21 + (v - 21) * T.pasoMasDe21) * 10) / 10;
}

/**
 * ITC-BT-10 ap. 3.2: servicios generales sin reducción por simultaneidad. Las
 * cifras son de la Guía BT-10 (no reglamentarias): tabla A de aparatos
 * elevadores (NTE ITE-ITA) y alumbrado de los espacios comunes.
 */
export const SERVICIOS_REBT = tablaCTE(
  { ...PROC_GUIA_BT10, articulo: "ap. 3.2", tabla: "Tabla A" },
  {
    ascensores: [
      { tipo: "ITA-1", carga_kg: 400, personas: 5, velocidad_m_s: 0.63, potencia_kW: 4.5 },
      { tipo: "ITA-2", carga_kg: 400, personas: 5, velocidad_m_s: 1, potencia_kW: 7.5 },
      { tipo: "ITA-3", carga_kg: 630, personas: 8, velocidad_m_s: 1, potencia_kW: 11.5 },
      { tipo: "ITA-4", carga_kg: 630, personas: 8, velocidad_m_s: 1.6, potencia_kW: 18.5 },
      { tipo: "ITA-5", carga_kg: 1000, personas: 13, velocidad_m_s: 1.6, potencia_kW: 29.5 },
      { tipo: "ITA-6", carga_kg: 1000, personas: 13, velocidad_m_s: 2.5, potencia_kW: 46 },
    ],
    /** Portal y otros espacios comunes [W/m²]: 15 con incandescencia, 8 con fluorescencia. */
    alumbradoPortal_W_m2: { incandescencia: 15, fluorescencia: 8 },
    /** Caja de escalera [W/m²]: 7 con incandescencia, 4 con fluorescencia. */
    alumbradoEscalera_W_m2: { incandescencia: 7, fluorescencia: 4 },
  } as const,
);

/**
 * ITC-BT-10 ap. 3.3 y 4.1: locales comerciales y oficinas, 100 W por m² y
 * planta, con un mínimo por local de 3 450 W a 230 V y simultaneidad 1.
 */
export const LOCALES_REBT = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-10 ap. 3.3 y 4.1" },
  { W_m2: 100, minimoLocal_W: 3450 } as const,
);

/**
 * ITC-BT-10 ap. 3.4: garajes, 10 W por m² y planta con ventilación natural y 20
 * con forzada, mínimo 3 450 W a 230 V y simultaneidad 1. Si la ventilación
 * forzada evacua el humo del incendio, se estudia de forma específica.
 */
export const GARAJES_REBT = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-10 ap. 3.4" },
  { natural_W_m2: 10, forzada_W_m2: 20, minimo_W: 3450 } as const,
);

/**
 * ITC-BT-10 ap. 5.2 e ITC-BT-52 ap. 4.1: recarga del vehículo eléctrico en el
 * aparcamiento colectivo de un edificio de viviendas nuevo en propiedad
 * horizontal: 3 680 W por el 10 % de las plazas construidas, con un factor de
 * simultaneidad con el resto del edificio de 0,3 si se instala el SPL (esquema
 * colectivo) y de 1,0 si no. ITC-BT-10 ap. 5.1: la unifamiliar con recarga es
 * de electrificación elevada.
 */
export const RECARGA_REBT = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-10 ap. 5; ITC-BT-52 ap. 3.1, 3.2 y 4" },
  {
    porPlaza_W: 3680,
    /** Del total de las plazas construidas, sin redondear a plazas enteras. */
    fraccionPlazas: 0.1,
    /** Solo el esquema colectivo (1a, 1b, 1c) con SPL (ap. 4.1). */
    factorColectivoConSpl: 0.3,
    /** Sin SPL y en los esquemas individuales y 4 (ap. 4.1 a 4.3). */
    factorSinSpl: 1,
    /** ITC-BT-52 ap. 3.2 b): módulos de reserva para el 20 % de las plazas no asociadas a una vivienda, al menos uno. */
    reservaPlazasNoAsociadas: 0.2,
  } as const,
);

/**
 * Guía BT-52, Anexo 2 (recomendación, no reglamentaria): con preinstalación en más
 * de la mitad de las plazas, PVE = FS1·N·3 680 W, con N las plazas con
 * preinstalación (todas en residencial privado, por el HE 6). Se muestra como
 * información, no se suma.
 */
export const ANEXO2_GUIA_BT52 = tablaCTE(
  { ...PROC_GUIA_BT52, articulo: "Anexo 2" },
  { porPlaza_W: 3680, fs1ConSpl: 0.3, fs1SinSpl: 1 } as const,
);

/**
 * ITC-BT-16 ap. 2.2: con más de 16 contadores, la concentración va en local;
 * hasta 16, en armario o en local, en la planta baja, el entresuelo o el primer
 * sótano (edificios de hasta 12 plantas). ap. 2.1: un único usuario, caja de
 * protección y medida.
 */
export const CONTADORES_REBT = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-16 ap. 2.1 y 2.2" },
  { localSiMasDe: 16, plantasMaxConcentracionUnica: 12 } as const,
);

/**
 * Criterios de proyecto (no son exigencia del REBT; research/verificacion-rebt.md,
 * «Decisiones de producto»):
 *   - el ascensor que se supone sin su potencia: el de la Guía para 630 kg y
 *     1 m/s. La cabina más pequeña de un ascensor accesible (1,00 × 1,25 m,
 *     DB-SUA) mide 1,25 m², y la tabla 6 de la UNE-EN 81-20 da a 400 kg 1,17 m²
 *     como máximo y a 450 kg, 1,30 m² (leída en el borrador CEN prEN 81-20:2011,
 *     tabla 5): hace falta al menos 450 kg, y la tabla A de la Guía salta de 400
 *     a 630. Es también la carga mínima del ascensor de emergencia, con cabina de
 *     1,10 × 1,40 m (DB-SI, Anejo SI A);
 *   - el alumbrado común con las cifras de fluorescencia de la Guía, como cota
 *     superior del LED de hoy;
 *   - la intensidad de la línea general de alimentación, trifásica a 400 V con
 *     cos φ = 0,9.
 */
export const CRITERIOS_REBT = tablaCTE(
  { db: "Criterio de proyecto", edicion: "Concreta Memorias" },
  {
    ascensorHabitual: "ITA-3",
    tensionTrifasica_V: 400,
    cosPhi: 0.9,
  } as const,
);

/** La potencia del ascensor habitual de la Guía [kW]. */
export function potenciaAscensorHabitual(): number {
  return SERVICIOS_REBT.datos.ascensores.find((a) => a.tipo === CRITERIOS_REBT.datos.ascensorHabitual)!.potencia_kW;
}

/**
 * Reserva de local para centro de transformación: el art. 13 del REBT remite a la
 * reglamentación de distribución, hoy el RD 1048/2013, art. 26 (consolidado
 * BOE-A-2013-13767, últ. modif. 03-11-2016, cotejado en imagen, pp. 32-33). En
 * suelo urbanizado, con una potencia solicitada «superior a 100 kW», «el solicitante
 * deberá reservar un local» cerrado y adaptado, con fácil acceso desde la vía
 * pública, para la distribuidora; la obligación decae si no lo usa en seis meses.
 * Solo avisa: la app no sabe si el suelo es urbanizado, y la potencia solicitada
 * no tiene por qué ser la prevista.
 */
export const RESERVA_CT_REBT = tablaCTE(
  { ...PROC_REBT, articulo: "art. 13; RD 1048/2013 art. 26.1 y 26.2" },
  { masDe_kW: 100 } as const,
);

/**
 * ITC-BT-04 ap. 3.1: instalaciones nuevas que precisan proyecto (el resto,
 * memoria técnica de diseño, ap. 4). P es la potencia prevista con la ITC-BT-10.
 */
export const PROYECTO_REBT = tablaCTE(
  { ...PROC_REBT, articulo: "ITC-BT-04 ap. 3.1" },
  {
    /** Grupo e: edificios de viviendas, locales y oficinas, P > 100 kW por CGP. */
    edificioMasDe_kW: 100,
    /** Grupo f: viviendas unifamiliares, P > 50 kW. */
    unifamiliarMasDe_kW: 50,
    /** Grupo h: aparcamientos con ventilación natural de más de 5 plazas (g: forzada, siempre). */
    garajeNaturalMasDe_plazas: 5,
    /** Grupo z: infraestructura de recarga, P > 50 kW. */
    recargaMasDe_kW: 50,
  } as const,
);
