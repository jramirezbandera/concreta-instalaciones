// =============================================================================
// DB-SUA, SUA 7 — El dibujo (feature-20): la sección del edificio con el garaje,
// la rampa que sale por la derecha, el espacio de espera con el coche antes de la
// calle, el dispositivo de alerta en la salida y, si hay paso de peatones por la
// rampa, su recorrido; si no, la subida por la escalera. La rampa y la calle no
// están en El edificio: se dibujan sin escala. PURA; el render es el común.
// =============================================================================

import { SECCION_BASE } from "../../lib/edificio/seccion";
import type { Edificio } from "../../lib/edificio/tipos";
import { centro, componerDibujo, marcasZonasNeutras, seccionConZonas, terrenoBajo, type DibujoSi, type EtiquetaSi, type MarcaSi } from "../si/seccion";
import type { JustificacionSua7 } from "./justificacion";
import { SUA7_SENALIZACION } from "./tablas";

const S = SECCION_BASE;
/** Con la rampa y la calle a la derecha, el dibujo es más ancho que la sección común. */
const ANCHO = 900;
/** Donde la rampa llega a la rasante, donde acaba el espacio de espera y la calle. */
const X_RAMPA = S.X1 + 130;
const X_SALIDA = X_RAMPA + 72;

export function dibujoSua7(j: JustificacionSua7, edificio: Edificio): DibujoSi {
  const { base, zonas } = seccionConZonas(edificio);
  const yR = base.yRasante;
  const inclinada = edificio.cubierta.tipo === "inclinada";
  const etiquetas: EtiquetaSi[] = [];

  if (!j.garaje) {
    const marcas = marcasZonasNeutras(zonas);
    etiquetas.push({ key: "et-ambito", elementoId: "ambito", x: (S.X0 + S.X1) / 2, y: inclinada ? 12 : S.ROOF - 18 });
    return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: inclinada });
  }

  // El garaje, pulsable: lleva al uso Aparcamiento.
  const marcas: MarcaSi[] = marcasZonasNeutras(zonas).map((mk) => (mk.tipo === "zona" && mk.zona.uso === "garaje" ? { ...mk, elementoId: "ambito" } : mk));
  const garajes = zonas.filter((z) => z.uso === "garaje");
  const d = j.decisiones;
  const hay = (id: string) => j.elementos.some((e) => e.id === id);

  // La planta del garaje por la que se sale: la más cercana a la rasante.
  const bajo = garajes.filter((z) => z.nivel < 0).sort((a, b) => b.nivel - a.nivel)[0];
  const alto = garajes.filter((z) => z.nivel > 0).sort((a, b) => a.nivel - b.nivel)[0];
  const salidaDe = bajo ?? alto ?? null;
  const yGaraje = j.rampa && salidaDe ? salidaDe.y1 : yR;

  // ── La rampa, la salida y la calle ──────────────────────────────────────
  if (j.rampa) {
    marcas.push(
      { tipo: "linea", key: "rampa", d: `M${S.X1} ${yGaraje}L${X_RAMPA} ${yR}`, grosor: 3, tono: "fuerte" },
      { tipo: "texto", key: "t-velocidad", x: (S.X1 + X_RAMPA) / 2 + 18, y: (yGaraje + yR) / 2 + 18, texto: `${SUA7_SENALIZACION.datos.velocidadMax_km_h} km/h`, ancla: "start" },
    );
  } else {
    marcas.push({ tipo: "texto", key: "t-velocidad", x: S.X1 + 12, y: yR - 10, texto: `${SUA7_SENALIZACION.datos.velocidadMax_km_h} km/h`, ancla: "start" });
  }
  const xEspera0 = j.rampa ? X_RAMPA : S.X1;
  marcas.push(
    {
      tipo: "linea",
      key: "espera",
      d: `M${xEspera0} ${yR}H${X_SALIDA}`,
      grosor: hay("espera") && d.salida !== "descendente" ? 4 : 3,
      tono: "fuerte",
      ...(hay("espera") ? { elementoId: "espera" } : {}),
    },
    { tipo: "icono", key: "coche", icono: "coche", x: (xEspera0 + X_SALIDA) / 2, y: yR - 9, ...(hay("espera") ? { elementoId: "espera" } : {}) },
    { tipo: "linea", key: "calle", d: `M${X_SALIDA} ${yR}H${ANCHO - 4}`, grosor: 2, tono: "suave" },
    { tipo: "texto", key: "t-calle", x: (X_SALIDA + ANCHO) / 2, y: yR + 16, texto: "calle", ancla: "middle" },
  );
  if (hay("alerta")) {
    marcas.push(
      { tipo: "linea", key: "poste-alerta", d: `M${X_SALIDA + 8} ${yR}V${yR - 24}`, grosor: 1.5, elementoId: "alerta", tono: "fuerte" },
      { tipo: "icono", key: "alerta", icono: "luz", x: X_SALIDA + 8, y: yR - 33, elementoId: "alerta" },
    );
  }

  // ── Los peatones: por la rampa, o por la escalera del edificio ──────────
  if (j.rampa) {
    if (d.peatones === "rampa") {
      marcas.push({ tipo: "linea", key: "paso-peatones", d: `M${S.X1} ${yGaraje - 9}L${X_RAMPA} ${yR - 9}`, grosor: 1.5, dash: "5 3", elementoId: "peatones", tono: "fuerte" });
    } else {
      // Por el núcleo de escalera: bajo el portal, si se dibuja; si no, a la izquierda.
      const portal = zonas.find((z) => z.nivel === 0 && (z.uso === "zona_comun" || z.uso === "vestibulo"));
      const xEsc = portal ? centro(portal).x : S.X0 + 140;
      marcas.push({ tipo: "flecha", key: "peatones-escalera", d: `M${xEsc} ${yGaraje - 6}V${yR - 6}`, elementoId: "peatones" });
    }
  }

  // ── Las etiquetas ───────────────────────────────────────────────────────
  const zg = salidaDe ?? garajes[0];
  if (zg) {
    const c = centro(zg);
    etiquetas.push({ key: "et-ambito", elementoId: "ambito", x: c.x, y: zg.enBanda ? c.y : c.y + 6 });
  }
  const xCol = (S.X1 + X_SALIDA) / 2 + 24;
  const PASO = 28;
  const arriba = ["senalizacion", "alerta", "espera"].filter(hay);
  arriba.forEach((id, i) => etiquetas.push({ key: `et-${id}`, elementoId: id, x: xCol, y: yR - 56 - (arriba.length - 1 - i) * PASO }));
  etiquetas.push({ key: "et-peatones", elementoId: "peatones", x: (S.X1 + X_RAMPA) / 2 + 30, y: (j.rampa ? Math.max(yGaraje, yR) : yR) + 26 });
  if (hay("itinerarios")) etiquetas.push({ key: "et-itinerarios", elementoId: "itinerarios", x: S.X0 + 90, y: terrenoBajo(base) + 22 });

  return componerDibujo(base, zonas, marcas, etiquetas, { cubiertaInclinada: inclinada, ancho: ANCHO });
}
