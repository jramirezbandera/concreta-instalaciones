// =============================================================================
// DB-SUA, SUA 3 — Seguridad frente al riesgo de aprisionamiento en recintos
// (feature-20). Cifras verificadas en la imagen de `research/pdf/DBSUA.pdf`,
// pp. 20 y 36–37: research/verificacion-sua2-sua5.md, bloque B3. SUA 3 tiene un
// solo apartado con cuatro puntos: NO trata las dimensiones de los aseos (el
// giro de Ø 1,50 m del aseo accesible es del Anejo A; la dotación, de SUA 9).
// =============================================================================

import { tablaCTE } from "../../lib/cte/tabla";
import { PROC_SUA } from "../sua/tablas";

/** SUA 3 ap. 1 (p. 20). */
export const APRISIONAMIENTO_SUA3 = tablaCTE(
  { ...PROC_SUA, articulo: "SUA 3 ap. 1 ptos 1 a 4" },
  {
    /** pto 1. Recinto con bloqueo interior y riesgo de quedar atrapado → desbloqueo desde el exterior. */
    desbloqueoExteriorSiBloqueoInterior: true,
    /** pto 1. Iluminación controlada desde el interior, EXCEPTO en baños y aseos de viviendas
     *  (la excepción alcanza solo a la luz, no al desbloqueo: B3.2). */
    iluminacionInteriorExceptoBanosViviendas: true,
    /** pto 2. Solo en zonas de uso público: aseos y cabinas de vestuario accesibles con llamada de asistencia. */
    llamadaAsistenciaSoloUsoPublico: true,
    /** pto 3. Fuerza de apertura máxima de las puertas de salida [N]. */
    fuerzaApertura_puertasSalida_maxN: 140,
    /** pto 3 + Anejo A «Itinerario accesible» (p. 36). */
    fuerzaApertura_itinerarioAccesible_maxN: 25,
    fuerzaApertura_itinerarioAccesible_resistenteFuego_maxN: 65,
    /** pto 4. Método de ensayo (manuales con pestillo de media vuelta; excluye las de cierre
     *  automático y las de herrajes especiales de salida de emergencia). */
    metodoEnsayo: "UNE-EN 12046-2:2000",
  } as const,
);

/** Anejo A, «Servicios higiénicos accesibles» y «Mecanismos accesibles» (pp. 36–37). NO es SUA 3. */
export const ASEO_ACCESIBLE_ANEJO_A = tablaCTE(
  { ...PROC_SUA, articulo: "Anejo A, «Servicios higiénicos accesibles»" },
  {
    giroLibre_diametro_m: 1.5,
    /** «Mecanismos accesibles»: no se admite iluminación con temporización en cabinas de aseos accesibles. */
    sinTemporizacionIluminacion: true,
  } as const,
);
