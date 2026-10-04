// =============================================================================
// DB-SUA, SUA 2 — La memoria redactada (feature-20): el texto que el proyectista
// copia a su memoria, con las cifras y su cita. Lo declarativo (vuelos,
// salientes, vaivén, mamparas, atrapamiento) va aquí aunque no tenga decisión.
// Se redacta solo a partir de la justificación. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { ENGINE_VERSION } from "../../lib/version";
import { lista, metros } from "../sua/colocar";
import type { DetalleSua2, JustificacionSua2 } from "./justificacion";
import { ALTURAS_SUA2_1_1, ATRAPAMIENTO_SUA2_2, PUERTAS_SUA2_1_2, SENALIZACION_VIDRIOS_SUA2_1_4, VIDRIOS_SUA2_TABLA_1_1, type FilaVidrioSua2 } from "./tablas";
import { plantasVidrio } from "./textos";

const COTA_LARGA: Record<FilaVidrioSua2, string> = {
  menor055: "menor que 0,55 m",
  entre055y12: "comprendida entre 0,55 y 12 m",
  mayor12: "mayor que 12 m",
};

const A = ALTURAS_SUA2_1_1.datos;
const V = VIDRIOS_SUA2_TABLA_1_1.datos;
const SEN = SENALIZACION_VIDRIOS_SUA2_1_4.datos;
const P = PUERTAS_SUA2_1_2.datos;

function detalles<C extends DetalleSua2["clase"]>(j: JustificacionSua2, clase: C): Extract<DetalleSua2, { clase: C }>[] {
  return j.elementos.flatMap((x) => (x.detalle.clase === clase ? [x.detalle as Extract<DetalleSua2, { clase: C }>] : []));
}

const EN: Record<string, string> = {
  vivienda: "el interior de las viviendas",
  comun: "las zonas comunes",
  garaje: "el garaje",
  oficinas: "las oficinas",
};

function parrafoAltura(j: JustificacionSua2): Trozo[] {
  const ds = detalles(j, "altura");
  if (ds.length === 0) return [];
  const p: Trozo[] = ["La altura libre de paso en las zonas de circulación es de "];
  ds.forEach((d, i) => {
    if (i > 0) p.push(i === ds.length - 1 ? " y de " : ", de ");
    p.push({ v: metros(d.valor_m) }, ` en ${d.grupo === "vivienda" && j.unifamiliar ? "el interior de la vivienda y su garaje" : EN[d.grupo]}`);
  });
  const fallos = ds.filter((d) => d.valor_m < d.limite_m);
  if (fallos.length === 0) {
    p.push(
      `, que cumple el mínimo de ${metros(A.alturaLibrePaso_usoRestringido_m)} en zonas de uso restringido y de ${metros(A.alturaLibrePaso_resto_m)} en el resto; en los umbrales de las puertas es de al menos ${metros(A.alturaLibreUmbralPuertas_m)} (SUA 2, ap. 1.1 pto 1).`,
    );
  } else {
    p.push(
      `; el mínimo es de ${metros(A.alturaLibrePaso_usoRestringido_m)} en zonas de uso restringido y de ${metros(A.alturaLibrePaso_resto_m)} en el resto, y de ${metros(A.alturaLibreUmbralPuertas_m)} en los umbrales de las puertas (SUA 2, ap. 1.1 pto 1). La altura libre de ${fallos.map((d) => EN[d.grupo]).join(" y de ")} no alcanza el mínimo y debe aumentarse.`,
    );
  }
  return p;
}

function parrafoSalientes(): Trozo[] {
  return [
    `No existen elementos fijos que sobresalgan de las fachadas sobre zonas de circulación a menos de ${metros(A.alturaVuelosFachada_m)} de altura, ni salientes en las paredes de las zonas de circulación que, sin arrancar del suelo, vuelen más de `,
    { v: `${A.salientesParedes.vueloMax_cm} cm` },
    ` entre ${metros(A.salientesParedes.desde_m)} y ${metros(A.salientesParedes.hasta_m)} de altura. Los elementos volados de altura menor que ${metros(A.voladosAProteger_alturaMenorQue_m)}, como mesetas o tramos de escalera, se protegen con elementos fijos que restringen el acceso hasta ellos y que son detectables con bastón (SUA 2, ap. 1.1 ptos 2 a 4).`,
  ];
}

function parrafoPuertas(j: JustificacionSua2): Trozo[] {
  const d = detalles(j, "puertas")[0];
  const a = detalles(j, "automaticas")[0];
  const vaiven = `Las puertas de vaivén situadas entre zonas de circulación, si las hay, tienen partes transparentes o translúcidas que cubren como mínimo la altura comprendida entre ${metros(P.vaivenTransparente.desde_m)} y ${metros(P.vaivenTransparente.hasta_m)} (ap. 1.2 pto 2).`;
  const auto = a
    ? ` ${a.garajeVivienda ? "La puerta del garaje cumple las condiciones de seguridad de utilización de su reglamentación específica y tiene" : "La puerta del garaje y las puertas peatonales automáticas cumplen las condiciones de seguridad de utilización de su reglamentación específica y tienen"} marcado CE (ap. 1.2 ptos 3 y 4).`
    : "";
  if (!d) {
    return [`Por tratarse del interior de una vivienda, de uso restringido, no se aplica la condición sobre el barrido de las puertas en el lateral de los pasillos (SUA 2, ap. 1.2 pto 1). ${vaiven}${auto}`];
  }
  const sitio = lista(d.donde);
  if (d.barrido === "invaden") {
    return [
      `Las puertas de los recintos situadas en el lateral de ${sitio}, de anchura menor que ${metros(P.pasilloBarrido_anchuraMenorQue_m)}, `,
      { v: "invaden el pasillo con el barrido de su hoja" },
      ` y deben disponerse de forma que no lo invadan (SUA 2, ap. 1.2 pto 1 y figura 1.1). ${vaiven}${auto}`,
    ];
  }
  if (d.barrido === "pasillo_ancho") {
    return [
      `Las puertas de los recintos situadas en el lateral de ${sitio}, de anchura mayor que ${metros(P.pasilloBarrido_anchuraMenorQue_m)}, se disponen de forma que el barrido de su hoja `,
      { v: "no invade la anchura exigida" },
      ` por las condiciones de evacuación (SI 3, ap. 4) (SUA 2, ap. 1.2 pto 1). ${vaiven}${auto}`,
    ];
  }
  return [
    `Las puertas de los recintos que no son de ocupación nula situadas en el lateral de ${sitio}, de anchura menor que ${metros(P.pasilloBarrido_anchuraMenorQue_m)}, se disponen de forma que el barrido de su hoja `,
    { v: "no invade el pasillo" },
    ` (SUA 2, ap. 1.2 pto 1 y figura 1.1). ${vaiven}${auto}`,
  ];
}

function parrafoVidrios(j: JustificacionSua2): Trozo[] {
  const ds = detalles(j, "vidrios");
  const p: Trozo[] = [
    `Los vidrios de las áreas con riesgo de impacto que no disponen de una barrera de protección conforme a SUA 1 ap. 3.2 (en puertas, del suelo hasta ${metros(V.areasRiesgo.puertas.hasta_m)} de altura en el ancho de la puerta más ${metros(V.areasRiesgo.puertas.margenLateralCadaLado_m)} a cada lado; en paños fijos, del suelo hasta ${metros(V.areasRiesgo.panosFijos.hasta_m)}) tienen una clasificación de prestaciones X(Y)Z según ${V.norma} conforme a la tabla 1.1, en función de la diferencia de cota a ambos lados: `,
  ];
  ds.forEach((d, i) => {
    if (i > 0) p.push("; ");
    const c = V.filas[d.fila];
    const donde = d.plantas.length > 0 ? `${plantasVidrio(d.plantas)}${d.interiores ? " y vidrios interiores" : ""}` : "vidrios interiores";
    p.push(`${donde}, con diferencia de cota ${COTA_LARGA[d.fila]}, `, { v: `X ${c.X}, Y ${c.Y}, Z ${c.Z}` });
  });
  p.push(
    `. Se excluyen los vidrios cuya mayor dimensión no excede de ${metros(V.excluidosMayorDimensionHasta_m)} (SUA 2, ap. 1.3 ptos 1 y 2). Las partes vidriadas de las puertas y de los cerramientos de duchas y bañeras son de vidrio laminado o templado que resiste sin rotura un impacto de nivel ${V.puertasDuchasBaneras.nivelImpactoSinRotura} (ap. 1.3 pto 3).`,
  );
  return p;
}

function parrafoSenalizacion(j: JustificacionSua2): Trozo[] {
  const d = detalles(j, "senalizacion")[0];
  if (!d) return ["La condición de señalización de las grandes superficies acristaladas no se aplica al interior de las viviendas (SUA 2, ap. 1.4 pto 1)."];
  return [
    `Las grandes superficies acristaladas situadas en ${lista(d.donde)} que se pueden confundir con puertas o aberturas, y las puertas de vidrio sin cercos ni tiradores que las identifiquen, están provistas en toda su longitud de señalización visualmente contrastada situada entre `,
    { v: `${metros(SEN.franjaInferior.desde_m)} y ${metros(SEN.franjaInferior.hasta_m)}` },
    " y entre ",
    { v: `${metros(SEN.franjaSuperior.desde_m)} y ${metros(SEN.franjaSuperior.hasta_m)}` },
    ` de altura, salvo que tengan montantes separados ${metros(SEN.exentoMontantesSeparacionMax_m)} como máximo o un travesaño a la altura inferior (SUA 2, ap. 1.4). Esta condición no se aplica al interior de las viviendas.`,
  ];
}

function parrafoAtrapamiento(j: JustificacionSua2): Trozo[] {
  const a = detalles(j, "automaticas")[0];
  return [
    "Las puertas correderas de accionamiento manual, incluidos sus mecanismos de apertura y cierre, dejan una distancia de al menos ",
    { v: `${ATRAPAMIENTO_SUA2_2.datos.correderaManual_holguraMin_cm} cm` },
    ` hasta el objeto fijo más próximo (SUA 2, ap. 2 pto 1 y figura 2.1). ${a ? "Los elementos de apertura y cierre automáticos, como los de la puerta del garaje," : "Los elementos de apertura y cierre automáticos, si los hay,"} disponen de dispositivos de protección adecuados al tipo de accionamiento y cumplen sus especificaciones técnicas propias (ap. 2 pto 2).`,
  ];
}

function parrafoLocal(j: JustificacionSua2): Trozo[] {
  return detalles(j, "local").length > 0 ? ["El local sin uso justificará las condiciones de SUA 2 con el proyecto de su actividad."] : [];
}

export function memoriaSua2(j: JustificacionSua2): MemoriaDoc {
  const parrafos = [parrafoAltura(j), parrafoSalientes(), parrafoPuertas(j), parrafoVidrios(j), parrafoSenalizacion(j), parrafoAtrapamiento(j), parrafoLocal(j)].filter((p) => p.length > 0);
  return {
    titulo: "Seguridad frente al riesgo de impacto o de atrapamiento",
    norma: "DB-SUA 2",
    parrafos,
    fuente: ["DB-SUA · SUA 2 (consolidado 14-jun-2022)", "ap. 1 y ap. 2, tabla 1.1", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
