// =============================================================================
// DB-SUA, SUA 4 — La memoria redactada (feature-20): el alumbrado normal, la
// dotación de alumbrado de emergencia con las zonas deducidas de El edificio, la
// posición de las luminarias, la instalación y las señales. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { ENGINE_VERSION } from "../../lib/version";
import { nombreLocal } from "../si1/justificacion";
import { lista, metros } from "../sua/colocar";
import type { DetalleSua4, JustificacionSua4 } from "./justificacion";
import { ALUMBRADO_NORMAL_SUA4_1, INSTALACION_EMERGENCIA_SUA4_2_3, LUMINARIAS_EMERGENCIA_SUA4_2_2, SENALES_SUA4_2_4 } from "./tablas";
import { zonasRecorrido } from "./textos";

const N = ALUMBRADO_NORMAL_SUA4_1.datos;
const I = INSTALACION_EMERGENCIA_SUA4_2_3.datos;
const LU = LUMINARIAS_EMERGENCIA_SUA4_2_2.datos;
const SE = SENALES_SUA4_2_4.datos;
const num = (v: number) => v.toLocaleString("es-ES");
const pc = (f: number) => `${Math.round(f * 100)} %`;

function detalle<C extends DetalleSua4["clase"]>(j: JustificacionSua4, clase: C): Extract<DetalleSua4, { clase: C }> | null {
  const el = j.elementos.find((x) => x.detalle.clase === clase);
  return el ? (el.detalle as Extract<DetalleSua4, { clase: C }>) : null;
}

function parrafoNormal(j: JustificacionSua4): Trozo[] {
  const interior = j.elementos.some((x) => x.id === "normal-interior");
  const garaje = j.elementos.some((x) => x.id === "normal-garaje");
  const p: Trozo[] = [];
  if (interior || garaje) {
    p.push("Las zonas de circulación disponen de una instalación de alumbrado capaz de proporcionar, medida a nivel del suelo, una iluminancia mínima de ");
    if (interior) p.push({ v: `${N.interior_lx} lux` }, " en las zonas interiores");
    if (interior && garaje) p.push(", de ");
    if (garaje) p.push({ v: `${N.aparcamientoInterior_lx} lux` }, " en el aparcamiento, en toda su superficie");
    p.push(`${garaje ? "," : ""} y de ${N.exterior_lx} lux en las zonas exteriores de circulación que forman parte del proyecto, con un factor de uniformidad media del ${pc(N.uniformidadMediaMin)} como mínimo (SUA 4, ap. 1 pto 1).`);
  }
  if (j.residencial) {
    const g = detalle(j, "garaje");
    p.push(
      `${p.length > 0 ? " " : ""}En el interior de ${j.unifamiliar ? "la vivienda" : "las viviendas"}, los puntos de luz de pasillos y distribuidores permiten alcanzar ${N.interior_lx} lux${j.unifamiliar && g ? `, y ${N.aparcamientoInterior_lx} lux en su garaje` : ""} (SUA 4, ap. 1 pto 1).`,
    );
  }
  return p;
}

function parrafoDotacion(j: JustificacionSua4): Trozo[] {
  const g = detalle(j, "garaje");
  if (!j.conEmergencia) {
    return [
      `No se dispone alumbrado de emergencia: el interior de ${j.unifamiliar ? "la vivienda" : "las viviendas"}${g ? ", incluido su garaje," : ""} no es origen de evacuación (DB-SI, Anejo SI A) y no hay zonas ni elementos de los enumerados en SUA 4 ap. 2.1.`,
    ];
  }
  if (j.unifamiliar) {
    const p: Trozo[] = [];
    if (g?.dispone) {
      p.push(
        "El garaje de la vivienda, local de riesgo especial bajo según la tabla 2.1 de SI 1, dispone de ",
        { v: "alumbrado de emergencia" },
        " con una luminaria junto a su puerta de salida, que ilumina también la señal de su extintor (SUA 4, ap. 2.1 d) y g)).",
      );
    }
    const l = detalle(j, "locales");
    if (l) p.push(`${p.length > 0 ? " " : ""}Disponen de alumbrado de emergencia los locales de riesgo especial: ${lista(l.locales.map((x) => `${nombreLocal(x).toLowerCase()} (${x.zona.plantas})`))} (SUA 4, ap. 2.1 d)).`);
    p.push(" El resto de la vivienda no lo requiere: su interior no es origen de evacuación (DB-SI, Anejo SI A).");
    return p;
  }
  const partes: string[] = [];
  const r = detalle(j, "recorridos");
  if (r) {
    if (r.recintosMas100.length > 0) partes.push(`los recintos de ocupación mayor que 100 personas (${lista(r.recintosMas100.map((x) => x.zona.plantas))}) (a)`);
    partes.push(`los recorridos desde todo origen de evacuación hasta el espacio exterior seguro: ${lista(zonasRecorrido(r))} (b)`);
  }
  if (g) {
    partes.push(
      g.letra === "c"
        ? `el aparcamiento, de ${g.construida_m2} m² construidos, incluidos los pasillos y escaleras que conducen hasta el exterior o hasta las zonas generales del edificio (c)`
        : `el garaje, local de riesgo especial bajo según la tabla 2.1 de SI 1 (d)`,
    );
  }
  const l = detalle(j, "locales");
  if (l) partes.push(`los locales de riesgo especial: ${lista(l.locales.map((x) => `${nombreLocal(x).toLowerCase()} (${x.zona.plantas})`))} (d)`);
  if (r?.aseosOficinas) partes.push("los aseos generales de planta de las oficinas (e)");
  partes.push("los lugares en los que se ubican los cuadros de distribución o de accionamiento del alumbrado de esas zonas (f)", "las señales de seguridad (g)");
  if (r) partes.push(`los itinerarios accesibles: ${r.accesible} (h)`);
  // Punto y coma entre las partes: cada una lleva comas dentro.
  const texto = partes.length > 1 ? `${partes.slice(0, -1).join("; ")}; y ${partes[partes.length - 1]}` : partes.join("");
  return ["Disponen de ", { v: "alumbrado de emergencia" }, ` ${texto} (SUA 4, ap. 2.1).`];
}

function parrafoInstalacion(j: JustificacionSua4): Trozo[] {
  if (!j.conEmergencia) return [];
  const tipo = detalle(j, "instalacion")?.tipo ?? "autonomas";
  return [
    `Las luminarias se sitúan al menos a ${metros(LU.alturaMinimaSobreSuelo_m)} por encima del nivel del suelo, una en cada puerta de salida y en las posiciones en que es necesario destacar un peligro potencial o el emplazamiento de un equipo de seguridad, y como mínimo ${lista(LU.puntosMinimos)} (SUA 4, ap. 2.2). La instalación, `,
    { v: tipo === "autonomas" ? "con luminarias autónomas" : "con sistema centralizado" },
    `, es fija, está provista de fuente propia de energía y entra en funcionamiento automáticamente al descender la tensión de alimentación por debajo del ${pc(I.falloTensionPorDebajoDe)} de su valor nominal; alcanza el ${pc(I.respuesta.a5s)} del nivel de iluminación requerido a los 5 s y el ${pc(I.respuesta.a60s)} a los 60 s, y durante `,
    { v: `${I.autonomiaMin_h} h` },
    ` como mínimo proporciona en las vías de evacuación de hasta ${metros(I.viaEvacuacion.anchuraMax_m)} de anchura una iluminancia horizontal en el suelo de ${num(I.viaEvacuacion.ejeCentralMin_lx)} lux en el eje central y ${num(I.viaEvacuacion.bandaCentralMin_lx)} lux en la banda central, y de ${I.equiposYCuadrosMin_lx} lux en los equipos de seguridad, las instalaciones de protección contra incendios de uso manual y los cuadros de distribución del alumbrado, con una relación entre la iluminancia máxima y la mínima en el eje no mayor que ${I.relacionMaxMinEjeMax}:1 y lámparas de índice de rendimiento cromático Ra ≥ ${I.raMin}. Los niveles se obtienen considerando nulo el factor de reflexión de paredes y techos y con el factor de mantenimiento del fabricante (SUA 4, ap. 2.3).`,
  ];
}

function parrafoSenales(j: JustificacionSua4): Trozo[] {
  if (!j.conEmergencia) return [];
  return [
    `Las señales de evacuación indicativas de las salidas y las de los medios manuales de protección contra incendios y de primeros auxilios tienen una luminancia de al menos ${SE.luminanciaColorSeguridadMin_cd_m2} cd/m² en cualquier área de color de seguridad, una relación entre la luminancia máxima y la mínima no mayor que ${SE.relacionMaxMinMax}:1 y una relación entre la luminancia del blanco y la del color de seguridad entre ${SE.relacionBlancoColor.min}:1 y ${SE.relacionBlancoColor.max}:1, y alcanzan el ${pc(SE.respuesta.a5s)} de la iluminancia requerida a los 5 s y el ${pc(SE.respuesta.a60s)} a los 60 s (SUA 4, ap. 2.4).`,
  ];
}

export function memoriaSua4(j: JustificacionSua4): MemoriaDoc {
  const parrafos = [parrafoNormal(j), parrafoDotacion(j), parrafoInstalacion(j), parrafoSenales(j)];
  if (j.elementos.some((x) => x.detalle.clase === "local")) {
    parrafos.push(["El local sin uso justificará las condiciones de SUA 4 con el proyecto de su actividad; se deja previsto el alumbrado de emergencia del recorrido de su salida."]);
  }
  return {
    titulo: "Seguridad frente al riesgo causado por iluminación inadecuada",
    norma: "DB-SUA 4",
    parrafos: parrafos.filter((p) => p.length > 0),
    fuente: ["DB-SUA · SUA 4 (consolidado 14-jun-2022)", "ap. 1 y ap. 2", "locales de riesgo especial de SI 1", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
