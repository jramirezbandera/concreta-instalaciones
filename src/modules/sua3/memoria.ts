// =============================================================================
// DB-SUA, SUA 3 — La memoria redactada (feature-20): el texto que el proyectista
// copia a su memoria, con las cifras y su cita. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { ENGINE_VERSION } from "../../lib/version";
import { lista } from "../sua/colocar";
import type { DetalleSua3, JustificacionSua3 } from "./justificacion";
import { APRISIONAMIENTO_SUA3 } from "./tablas";

const T = APRISIONAMIENTO_SUA3.datos;

function detalle<C extends DetalleSua3["clase"]>(j: JustificacionSua3, clase: C): Extract<DetalleSua3, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleSua3, { clase: C }>) : null;
}

function parrafoBloqueo(j: JustificacionSua3): Trozo[] {
  const b = detalle(j, "bloqueo");
  if (!b) return [];
  const mayus = (s: string) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
  if (b.pestillos === "sin_pestillo") {
    return [`${mayus(lista(b.recintos))} no tienen dispositivo de bloqueo desde el interior, por lo que no existe riesgo de aprisionamiento accidental en ellos (SUA 3, ap. 1 pto 1).`];
  }
  const p: Trozo[] = [`${mayus(lista(b.recintos))}, cuyas puertas tienen dispositivo de bloqueo desde el interior, disponen de `, { v: "sistema de desbloqueo desde el exterior" }];
  const viviendas = b.recintos.some((r) => r.includes("viviend"));
  if (b.luzInterior.length > 0 && b.luzInterior.length === b.recintos.length) {
    p.push(", y su iluminación se controla desde el interior");
  } else if (b.luzInterior.length > 0) {
    p.push(`; ${lista(b.luzInterior)} tienen además la iluminación controlada desde su interior${viviendas ? ", condición que no se exige en los baños y aseos de las viviendas" : ""}`);
  } else if (viviendas) {
    p.push("; al tratarse de baños y aseos de viviendas, no se exige que su iluminación se controle desde el interior");
  }
  p.push(" (SUA 3, ap. 1 pto 1).");
  return p;
}

function parrafoLlamada(j: JustificacionSua3): Trozo[] {
  const l = detalle(j, "llamada");
  if (!l || !l.publico) {
    return [
      `No existen aseos accesibles ni cabinas de vestuario accesibles en zonas de uso público${j.oficinas ? "" : ", al ser de uso privado todas las zonas del edificio"}, por lo que no es de aplicación la exigencia de dispositivo de llamada de asistencia (SUA 3, ap. 1 pto 2).`,
    ];
  }
  return [
    "El aseo accesible de las oficinas, situado en zona de uso público, dispone en su interior de un ",
    { v: "dispositivo de llamada de asistencia" },
    " fácilmente accesible, que transmite una llamada perceptible desde un punto de control y permite al usuario verificar que ha sido recibida, o perceptible desde un paso frecuente de personas (SUA 3, ap. 1 pto 2).",
  ];
}

function parrafoFuerza(j: JustificacionSua3): Trozo[] {
  const f = detalle(j, "fuerza")!;
  const p: Trozo[] = [`La fuerza de apertura de las puertas de salida (${lista(f.salidas)}) no excede de `, { v: `${T.fuerzaApertura_puertasSalida_maxN} N` }];
  if (f.accesibles.length > 0) {
    p.push(`; en ${lista(f.accesibles)} no excede de `, { v: `${T.fuerzaApertura_itinerarioAccesible_maxN} N` });
    if (f.resistentes.length > 0) p.push(`, ni de ${T.fuerzaApertura_itinerarioAccesible_resistenteFuego_maxN} N en ${lista(f.resistentes)}`);
  }
  p.push(` (SUA 3, ap. 1 pto 3${f.accesibles.length > 0 ? "; Anejo A, «Itinerario accesible»" : ""}), determinada según el método de ensayo de ${T.metodoEnsayo} en las puertas manuales con pestillo de media vuelta (ap. 1 pto 4).`);
  return p;
}

export function memoriaSua3(j: JustificacionSua3): MemoriaDoc {
  const parrafos = [parrafoBloqueo(j), parrafoLlamada(j), parrafoFuerza(j)];
  if (j.local) parrafos.push(["El local sin uso justificará las condiciones de SUA 3 con el proyecto de su actividad."]);
  return {
    titulo: "Seguridad frente al riesgo de aprisionamiento en recintos",
    norma: "DB-SUA 3",
    parrafos: parrafos.filter((x) => x.length > 0),
    fuente: ["DB-SUA · SUA 3 (consolidado 14-jun-2022)", "ap. 1 y Anejo A", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
