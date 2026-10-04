// =============================================================================
// DB-SUA, SUA 7 — La memoria redactada (feature-20): el texto que el proyectista
// copia a su memoria, con las cifras y su cita. Se redacta solo a partir de la
// justificación: se revisa, no se edita. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { ENGINE_VERSION } from "../../lib/version";
import { SUA_USO_APARCAMIENTO } from "../sua/tablas";
import type { DetalleSua7, JustificacionSua7 } from "./justificacion";
import { SUA7_ESPERA, SUA7_ITINERARIOS, SUA7_PEATONES, SUA7_SENALIZACION } from "./tablas";
import type { Alerta } from "./estado";
import { m, m2, NOMBRE_PROTECCION, pct } from "./textos";

const UMBRAL = SUA_USO_APARCAMIENTO.datos.construidaMayorQue_m2;

const ALERTA_MEMORIA: Record<Alerta, string> = {
  espejo_luminoso: "un espejo convexo y una señal luminosa de salida de vehículos",
  espejo: "un espejo convexo",
  detector: "un detector de presencia con indicador luminoso",
};

function detalle<C extends DetalleSua7["clase"]>(j: JustificacionSua7, clase: C): Extract<DetalleSua7, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleSua7, { clase: C }>) : null;
}

function parrafoAmbito(j: JustificacionSua7): Trozo[] {
  const a = detalle(j, "ambito")!;
  if (a.motivo === "sin_garaje") {
    return [
      "El edificio no tiene zonas de uso Aparcamiento ni vías de circulación de vehículos, interiores o exteriores adscritas a él, por lo que ",
      { v: "no le es de aplicación la Sección SUA 7" },
      " (ap. 1).",
    ];
  }
  if (a.motivo === "unifamiliar") {
    return [
      "El garaje pertenece a una vivienda unifamiliar, que no es uso Aparcamiento cualquiera que sea su superficie (DB-SUA, Anejo A), por lo que ",
      { v: "no le es de aplicación la Sección SUA 7" },
      " (ap. 1).",
    ];
  }
  const s = `${m2(a.construida_m2)} construidos${a.supuesta ? " (supuestos a partir de la superficie útil)" : ""}`;
  if (a.motivo === "vias") {
    return [
      `El garaje, de ${a.plazas} plazas y `,
      { v: s },
      `, no excede de ${m2(UMBRAL)} y no es zona de uso Aparcamiento (DB-SUA, Anejo A); se justifican las condiciones de sus vías de circulación de vehículos (SUA 7, ap. 1, 2.2 y 4.1).`,
    ];
  }
  return [`El garaje, de ${a.plazas} plazas y `, { v: s }, `, excede de ${m2(UMBRAL)} y es zona de uso Aparcamiento (DB-SUA, Anejo A; SUA 7, ap. 1).`];
}

function parrafoEspera(j: JustificacionSua7): Trozo[] {
  const e = detalle(j, "espera");
  if (!e) return [];
  if (!e.exigible) {
    return [
      "La incorporación del garaje al exterior se realiza en sentido descendente, por lo que no se dispone espacio de acceso y espera (SUA 7, ap. 2.1; comentario del Ministerio, no reglamentario).",
    ];
  }
  return [
    "En su incorporación al exterior dispone de un espacio de acceso y espera de ",
    { v: m(e.fondo_m) },
    ` de profundidad (mínimo ${m(SUA7_ESPERA.datos.fondoMin_m)}, adecuada a la longitud del tipo de vehículo) y una pendiente del `,
    { v: pct(e.pendiente_pct) },
    ` (máximo ${pct(SUA7_ESPERA.datos.pendienteMax_pct)}) (SUA 7, ap. 2.1).`,
  ];
}

function parrafoPeatones(j: JustificacionSua7): Trozo[] {
  const p = detalle(j, "peatones");
  if (!p) return [];
  if (!p.rampa) return ["El garaje se encuentra en la planta baja, a nivel de la calle, y no tiene rampa para vehículos (SUA 7, ap. 2.2)."];
  if (p.peatones === "no") {
    return [
      "No se prevén recorridos para peatones por la rampa para vehículos: el acceso peatonal al garaje se realiza por el núcleo de escalera",
      p.escalera ? ` que comunica las plantas ${p.escalera}` : " del edificio",
      " (SUA 7, ap. 2.2).",
    ];
  }
  return [
    "El recorrido para peatones previsto por la rampa para vehículos tiene una anchura de ",
    { v: m(p.anchura_m) },
    ` (mínimo ${m(SUA7_PEATONES.datos.anchuraMin_m)}) y está protegido mediante ${NOMBRE_PROTECCION[p.proteccion]}${p.proteccion === "acera" ? ", con el desnivel según el apartado 3.1 de la Sección SUA 1" : ""} (SUA 7, ap. 2.2).`,
  ];
}

function parrafoItinerarios(j: JustificacionSua7): Trozo[] {
  const i = detalle(j, "itinerarios");
  if (!i) return [];
  const T = SUA7_ITINERARIOS.datos;
  return [
    `El garaje es de uso privado y su planta mayor tiene ${i.plazasPlanta} plazas y ${m2(i.superficiePlanta_m2)}, ${i.supera ? "" : `sin superar los ${T.plazasMayorQue} vehículos ni los ${m2(T.superficieMayorQue_m2)}; `}`,
    { v: "no le es de aplicación el apartado 3" },
    ", que se refiere a los itinerarios peatonales de zonas de uso público (SUA 7, ap. 3; DB-SUA, Anejo A).",
  ];
}

function parrafoSenalizacion(j: JustificacionSua7): Trozo[] {
  const s = detalle(j, "senalizacion");
  if (!s) return [];
  const a = detalle(j, "alerta");
  const p: Trozo[] = [
    "Se señalizan, conforme a lo establecido en el código de la circulación, el sentido de la circulación y las salidas, la velocidad máxima de circulación de ",
    { v: `${SUA7_SENALIZACION.datos.velocidadMax_km_h} km/h` },
    " y las zonas de tránsito y paso de peatones en las vías y rampas de circulación y acceso (SUA 7, ap. 4.1). No acceden vehículos de transporte pesado ni hay zonas de almacenamiento o de carga y descarga.",
  ];
  if (a) {
    const plural = a.alerta === "espejo_luminoso";
    p.push(
      ` En el acceso de vehículos al vial exterior se dispone${plural ? "n" : ""} `,
      { v: ALERTA_MEMORIA[a.alerta] },
      `, que alerta${plural ? "n" : ""} al conductor de la presencia de peatones en sus proximidades (SUA 7, ap. 4.3).`,
    );
  }
  return p;
}

export function memoriaSua7(j: JustificacionSua7): MemoriaDoc {
  const parrafos = [parrafoAmbito(j), parrafoEspera(j), parrafoPeatones(j), parrafoItinerarios(j), parrafoSenalizacion(j)].filter((p) => p.length > 0);
  return {
    titulo: "Seguridad frente al riesgo causado por vehículos en movimiento",
    norma: "DB-SUA 7",
    parrafos,
    fuente: ["DB-SUA · SUA 7 (consolidado 14-jun-2022)", j.garaje ? "ap. 1 a 4 y Anejo A" : "ap. 1 y Anejo A", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
