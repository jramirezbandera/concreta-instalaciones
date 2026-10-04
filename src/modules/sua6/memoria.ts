// =============================================================================
// DB-SUA, SUA 6 — La memoria redactada (feature-20): el texto que el proyectista
// copia a su memoria, con las cifras y su cita. Se redacta solo a partir de la
// justificación: se revisa, no se edita. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { ENGINE_VERSION } from "../../lib/version";
import type { JustificacionSua6 } from "./justificacion";
import { SUA6_ANDEN, SUA6_BARRERA, SUA6_ESCALERAS, SUA6_VASO } from "./tablas";
import { m, metros } from "./textos";

const V = SUA6_VASO.datos;

function parrafoAmbito(j: JustificacionSua6): Trozo[] {
  if (j.motivo === "sin_piscina") {
    return ["El edificio no dispone de piscina de uso colectivo, por lo que ", { v: "no le es de aplicación el apartado 1" }, " de la Sección SUA 6 (ap. 1 pto 1)."];
  }
  if (j.motivo === "unifamiliar") {
    return [
      "La piscina pertenece a una vivienda unifamiliar, ",
      { v: "excluida expresamente del ámbito" },
      " del apartado 1 de la Sección SUA 6 (ap. 1 pto 1); queda sujeta a su reglamentación específica.",
    ];
  }
  return [
    "La piscina comunitaria del edificio es de uso colectivo, no destinada exclusivamente a competición ni a enseñanza, y le es de aplicación el apartado 1 de la Sección SUA 6 (ap. 1 pto 1).",
  ];
}

function parrafoAcceso(j: JustificacionSua6): Trozo[] {
  const d = j.decisiones;
  if (d.acceso === "controlado") {
    return [
      "El acceso de niños a la zona de baño está controlado: el entorno de la piscina queda cerrado fuera del horario de baño mediante elementos físicos interpuestos entre las zonas comunes de uso habitual y el vaso, por lo que ",
      { v: "no se precisan barreras de protección" },
      " en torno al vaso (SUA 6, ap. 1.1).",
    ];
  }
  const B = SUA6_BARRERA.datos;
  return [
    "Al no estar controlado el acceso de niños a la zona de baño, la piscina dispone de una barrera de protección de ",
    { v: m(d.barrera_m) },
    ` de altura (mínimo ${m(B.alturaMin_m)}) que impide el acceso al vaso salvo por los puntos previstos para ello, dotados de puerta con sistema de cierre y bloqueo; resiste una fuerza horizontal de ${B.fuerza_kN_m.toLocaleString("es-ES")} kN/m aplicada en su borde superior y cumple las condiciones constructivas del apartado 3.2.3 de la Sección SUA 1 (SUA 6, ap. 1.1).`,
  ];
}

function parrafoVaso(j: JustificacionSua6): Trozo[] {
  const d = j.decisiones;
  const recreo = d.vasos !== "infantil";
  const infantil = d.vasos !== "recreo";
  const s = j.elementos.find((x) => x.detalle.clase === "senalizacion")?.detalle;
  const supera = s?.clase === "senalizacion" && s.supera;
  const p: Trozo[] = [];
  if (recreo) {
    p.push(
      "El vaso de recreo tiene una profundidad máxima de ",
      { v: m(d.profMax_m) },
      ` (no mayor que ${metros(V.restoMax_m)}) y zonas de profundidad menor que ${m(V.zonaSomeraMenorQue_m)}, con una mínima de `,
      { v: m(d.profMin_m) },
      infantil ? "; el vaso infantil tiene una profundidad de " : " (SUA 6, ap. 1.2.1).",
    );
  } else {
    p.push("El vaso infantil tiene una profundidad de ");
  }
  if (infantil) p.push({ v: m(d.profInfantil_m) }, ` (no mayor que ${m(V.infantilMax_m)}) (SUA 6, ap. 1.2.1).`);
  p.push(
    ` Se señalizan ${supera ? `los puntos donde se supera la profundidad de ${m(V.senalizarSiSupera_m)} y ` : ""}el valor de la máxima y la mínima profundidad en sus puntos correspondientes, con rótulos al menos en las paredes del vaso y en el andén, visibles desde dentro y desde fuera del vaso (ap. 1.2.1).`,
  );
  const pendientes = recreo
    ? `no superan el ${V.pendienteHasta140_pct} % hasta una profundidad de ${m(V.zonaSomeraMenorQue_m)} ni el ${V.pendienteResto_pct} % en el resto${infantil ? ` en el vaso de recreo, ni el ${V.pendienteInfantil_pct} % en el vaso infantil` : ""}`
    : `no superan el ${V.pendienteInfantil_pct} %`;
  p.push(
    ` Las pendientes del fondo ${pendientes} (ap. 1.2.2). Los huecos del vaso están protegidos mediante rejas u otro dispositivo que impide el atrapamiento (ap. 1.2.3). El fondo es de clase 3 de resbaladicidad en las zonas cuya profundidad no excede de ${m(V.fondoHasta_m)} y el revestimiento interior del vaso es de color claro (ap. 1.2.4).`,
  );
  return p;
}

function parrafoAnden(j: JustificacionSua6): Trozo[] {
  const d = j.decisiones;
  if (d.anden === "no") {
    return ["El vaso no está circundado por un andén o playa; las condiciones del apartado 1.3 se aplican a los andenes cuando existen (comentario del Ministerio, no reglamentario)."];
  }
  return [
    "El andén que circunda el vaso tiene una anchura de ",
    { v: m(d.anden_m) },
    ` (mínimo ${m(SUA6_ANDEN.datos.anchuraMin_m)}), suelo de clase ${SUA6_ANDEN.datos.clase} y una construcción que evita el encharcamiento (SUA 6, ap. 1.3).`,
  ];
}

function parrafoEscaleras(j: JustificacionSua6): Trozo[] {
  const d = j.decisiones;
  if (d.vasos === "infantil") return [];
  const E = SUA6_ESCALERAS.datos;
  return [
    `Las escaleras del vaso de recreo alcanzan ${d.escaleras === "un_metro" ? `una profundidad bajo el agua de ${metros(E.bajoAguaMin_m)}` : `hasta ${fmtCm(E.sobreFondo_m)} por encima del suelo del vaso`}, se colocan en la proximidad de los ángulos del vaso y en los cambios de pendiente, con una separación entre ellas no mayor que `,
    { v: metros(d.separacion_m) },
    ` (máximo ${metros(E.separacionMax_m)}), y tienen peldaños antideslizantes, sin aristas vivas, que no sobresalen del plano de la pared del vaso (SUA 6, ap. 1.4).`,
  ];
}

function fmtCm(v_m: number): string {
  return `${Math.round(v_m * 100)} cm`;
}

function parrafoPozos(j: JustificacionSua6): Trozo[] {
  if (j.decisiones.pozos === "si") {
    return [
      "Los pozos, depósitos y conducciones abiertas accesibles a personas que presentan riesgo de ahogamiento están equipados con ",
      { v: "tapas o rejillas" },
      " de suficiente rigidez y resistencia y con cierres que impiden su apertura por personal no autorizado (SUA 6, ap. 2).",
    ];
  }
  return ["No hay ", { v: "pozos, depósitos ni conducciones abiertas" }, " accesibles a personas que presenten riesgo de ahogamiento (SUA 6, ap. 2)."];
}

export function memoriaSua6(j: JustificacionSua6): MemoriaDoc {
  const parrafos = j.aplica
    ? [parrafoAmbito(j), parrafoAcceso(j), parrafoVaso(j), parrafoAnden(j), parrafoEscaleras(j), parrafoPozos(j)]
    : [parrafoAmbito(j), parrafoPozos(j)];
  return {
    titulo: "Seguridad frente al riesgo de ahogamiento",
    norma: "DB-SUA 6",
    parrafos: parrafos.filter((p) => p.length > 0),
    fuente: ["DB-SUA · SUA 6 (consolidado 14-jun-2022)", j.aplica ? "ap. 1 y ap. 2" : "ap. 1 pto 1 y ap. 2", j.aplica ? "decisiones del proyectista" : "Datos de la obra", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
