// =============================================================================
// DB-SUA, SUA 6 — El dibujo (feature-20): la sección del edificio con el vaso de
// la piscina dibujado al lado, sobre el terreno: la barrera, el andén, el perfil
// del fondo con sus profundidades, la línea de 1,40 m y las escaleras. La
// piscina no está en El edificio: se dibuja con las decisiones, sin escala de
// planta (las profundidades sí van a la escala de la sección). PURA; el render
// es el común del DB-SI.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { componerDibujo, marcasZonasNeutras, seccionConZonas, terrenoBajo, type DibujoSi, type EtiquetaSi, type MarcaSi } from "../si/seccion";
import type { JustificacionSua6 } from "./justificacion";
import { SUA6_VASO } from "./tablas";

const S = SECCION_BASE;
/** Con la piscina a la derecha, el dibujo es más ancho que la sección común. */
const ANCHO = 930;
/** Las barreras, a cada lado del recinto del vaso. */
const X_BARRERA_IZQ = S.X1 + 26;
/** A la derecha queda sitio para el rótulo «terreno» del dibujo común. */
const X_BARRERA_DER = ANCHO - 64;
/** El vaso (o los dos vasos), entre los andenes. */
const X_VASO_0 = X_BARRERA_IZQ + 44;
const X_VASO_1 = X_BARRERA_DER - 36;
/** Profundidad máxima dibujada [m]: más abajo no cabe. */
const PROF_MAX_DIBUJO = 3.4;

const py = (m: number) => Math.min(m, PROF_MAX_DIBUJO) * S.K;

/** Una escalera de pates junto a la pared, de la coronación hasta `hasta` px bajo el agua. */
function escalera(x: number, yR: number, hasta: number): string {
  const y1 = yR + hasta;
  const peldanos: string[] = [];
  for (let y = yR + 4; y < y1; y += 7) peldanos.push(`M${x} ${y}H${x + 6}`);
  return `M${x} ${yR - 8}V${y1}M${x + 6} ${yR - 8}V${y1}${peldanos.join("")}`;
}

export function dibujoSua6(j: JustificacionSua6, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const yR = base.yRasante;
  const inclinada = edificio.cubierta.tipo === "inclinada";
  const marcas: MarcaSi[] = [...marcasZonasNeutras(zonas)];
  const etiquetas: EtiquetaSi[] = [];
  const yPozos = terrenoBajo(base) + 22;

  if (!j.aplica) {
    etiquetas.push({ key: "et-ambito", elementoId: "ambito", x: (S.X0 + S.X1) / 2, y: inclinada ? 12 : S.ROOF - 18 });
    etiquetas.push({ key: "et-pozos", elementoId: "pozos", x: S.X0 + 80, y: yPozos });
    return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: inclinada });
  }

  const d = j.decisiones;
  const recreo = d.vasos !== "infantil";
  const infantil = d.vasos !== "recreo";
  const hay = (id: string) => j.elementos.some((e) => e.id === id);

  // Los vasos: con los dos, el infantil a la izquierda, junto al edificio.
  const xInf0 = X_VASO_0;
  const xInf1 = recreo ? X_VASO_0 + 46 : X_VASO_1;
  const xRec0 = infantil ? xInf1 + 20 : X_VASO_0;
  const xRec1 = X_VASO_1;

  // ── Barrera ─────────────────────────────────────────────────────────────
  if (d.acceso === "barrera") {
    const yB = yR - py(d.barrera_m);
    marcas.push(
      { tipo: "linea", key: "barrera", d: `M${X_BARRERA_IZQ} ${yR}V${yB}M${X_BARRERA_DER} ${yR}V${yB}`, grosor: 2.5, elementoId: "acceso", tono: "fuerte" },
      { tipo: "linea", key: "barrera-pasamanos", d: `M${X_BARRERA_IZQ - 4} ${yB}H${X_BARRERA_IZQ + 4}M${X_BARRERA_DER - 4} ${yB}H${X_BARRERA_DER + 4}`, grosor: 2, elementoId: "acceso", tono: "fuerte" },
    );
  } else {
    marcas.push({ tipo: "texto", key: "t-controlado", x: X_BARRERA_IZQ, y: yR - 10, texto: "sin barrera", ancla: "start" });
  }

  // ── Andén ───────────────────────────────────────────────────────────────
  if (d.anden === "si") {
    const tramos = [`M${X_BARRERA_IZQ + 6} ${yR - 2}H${X_VASO_0 - 2}`, `M${X_VASO_1 + 2} ${yR - 2}H${X_BARRERA_DER - 6}`];
    if (recreo && infantil) tramos.push(`M${xInf1 + 3} ${yR - 2}H${xRec0 - 3}`);
    marcas.push({ tipo: "linea", key: "anden", d: tramos.join(""), grosor: 4, elementoId: "anden", tono: "fuerte" });
  }

  // ── El vaso infantil ────────────────────────────────────────────────────
  if (infantil) {
    const yF = yR + py(d.profInfantil_m);
    marcas.push(
      { tipo: "linea", key: "agua-infantil", d: `M${xInf0 + 2} ${yR + 3}H${xInf1 - 2}`, grosor: 1, dash: "4 3", tono: "suave" },
      { tipo: "linea", key: "vaso-infantil", d: `M${xInf0} ${yR}V${yF}H${xInf1}V${yR}`, grosor: 2.5, elementoId: "infantil", tono: "fuerte" },
    );
  }

  // ── El vaso de recreo: zona somera, pendiente y zona honda ──────────────
  if (recreo) {
    const w = xRec1 - xRec0;
    const xb = xRec0 + 0.35 * w;
    const xc = xRec0 + 0.68 * w;
    const yMin = yR + py(d.profMin_m);
    const yMax = yR + py(d.profMax_m);
    marcas.push(
      { tipo: "linea", key: "agua-recreo", d: `M${xRec0 + 2} ${yR + 3}H${xRec1 - 2}`, grosor: 1, dash: "4 3", tono: "suave" },
      { tipo: "linea", key: "vaso-recreo", d: `M${xRec0} ${yR}V${yMin}H${xb}L${xc} ${yMax}H${xRec1}V${yR}`, grosor: 2.5, elementoId: "profundidad", tono: "fuerte" },
      { tipo: "flecha", key: "cota-min", d: `M${xRec0 + 22} ${yR + 1}V${yMin - 1}`, elementoId: "profundidad" },
      { tipo: "flecha", key: "cota-max", d: `M${xRec1 - 26} ${yR + 1}V${yMax - 1}`, elementoId: "profundidad" },
    );
    // La línea de 1,40 m: desde donde el fondo la pasa, hasta la pared honda.
    const L = SUA6_VASO.datos.senalizarSiSupera_m;
    if (d.profMax_m > L) {
      const x140 = d.profMin_m >= L ? xRec0 : xb + ((L - d.profMin_m) / (d.profMax_m - d.profMin_m)) * (xc - xb);
      marcas.push(
        { tipo: "linea", key: "linea-140", d: `M${x140} ${yR + py(L)}H${xRec1 - 2}`, grosor: 1.2, dash: "3 3", elementoId: "senalizacion", tono: "suave" },
        { tipo: "texto", key: "t-140", x: xRec1 + 5, y: yR + py(L) + 4, texto: "1,40", ancla: "start" },
      );
    }
    if (hay("escaleras")) {
      const bajo = py(Math.min(1, d.profMin_m));
      marcas.push({ tipo: "linea", key: "escaleras", d: `${escalera(xRec0 + 4, yR, bajo)}${escalera(xRec1 - 10, yR, py(1))}`, grosor: 1.2, elementoId: "escaleras", tono: "fuerte" });
    }
  }

  // ── Las etiquetas ───────────────────────────────────────────────────────
  // Encima del terreno, en columna sobre el vaso; debajo, en dos columnas.
  const xCol = (X_BARRERA_IZQ + X_BARRERA_DER) / 2;
  const PASO = 26;
  const arriba = ["acceso", "anden", "pendientes", "senalizacion"].filter(hay);
  arriba.forEach((id, i) => etiquetas.push({ key: `et-${id}`, elementoId: id, x: xCol, y: yR - 22 - (arriba.length - 1 - i) * PASO }));
  const fondoVaso = yR + py(Math.max(recreo ? d.profMax_m : 0, infantil ? d.profInfantil_m : 0));
  const xIzq = S.X1 + 76;
  const xDer = ANCHO - 74;
  const izquierda = ["profundidad", "escaleras"].filter(hay);
  const derecha = ["infantil", "fondo"].filter(hay);
  const columnaIzq = izquierda.length > 0 ? izquierda : derecha.splice(0, 1);
  columnaIzq.forEach((id, i) => etiquetas.push({ key: `et-${id}`, elementoId: id, x: xIzq, y: fondoVaso + 26 + i * PASO }));
  derecha.forEach((id, i) => etiquetas.push({ key: `et-${id}`, elementoId: id, x: xDer, y: fondoVaso + 26 + i * PASO }));
  etiquetas.push({ key: "et-pozos", elementoId: "pozos", x: S.X0 + 80, y: yPozos });

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: inclinada, ancho: ANCHO });
}
