// =============================================================================
// DB-SUA, SUA 7 — Vehículos en movimiento (feature-20): lo que la sección aporta
// a la pantalla común, a La obra y al anejo. PURA.
// =============================================================================

import { citaDe } from "../../lib/cte/tabla";
import type { FilaDato } from "../../lib/pdf/renderFicha";
import type { DefinicionSi } from "../si/definicion";
import { fichaSua, ORIGEN_CRITERIO, ORIGEN_DECISION, ORIGEN_EDIFICIO, ORIGEN_SUPUESTO } from "../sua/ficha";
import { SUA_USO_APARCAMIENTO } from "../sua/tablas";
import { dibujoSua7 } from "./dibujo";
import { esHabitualSua7, sua7EstadoDefaults, type Sua7Estado } from "./estado";
import { justificarSua7, type ElementoSua7, type JustificacionSua7 } from "./justificacion";
import { memoriaSua7 } from "./memoria";
import { SUA7_AMBITO, SUA7_ESPERA, SUA7_ITINERARIOS, SUA7_PEATONES, SUA7_SENALIZACION } from "./tablas";
import {
  describirDibujoSua7,
  franjaSua7,
  fraseSua7,
  limiteSua7,
  m,
  m2,
  metricasSua7,
  NOMBRE_ALERTA,
  NOMBRE_SALIDA,
  pct,
  piezasSua7,
  queEntraSua7,
  resultadoListaSua7,
  textoAvisoSua7,
  textoEtiquetaSua7,
  textoIncumplimientoSua7,
} from "./textos";

export const SUA7_PDF_SVG_ID = "sua7-svg-pdf";

function arregloSua7(el: ElementoSua7): { etiqueta: string; cambios: Partial<Sua7Estado> } | null {
  if (el.veredicto !== "fail") return null;
  const d = el.detalle;
  if (d.clase === "espera") {
    return { etiqueta: "Espera de 5 m al 4 %", cambios: { fondo_m: "habitual", pendiente_pct: "habitual" } };
  }
  if (d.clase === "peatones") return { etiqueta: "Paso de peatones de 1 m", cambios: { anchuraPeatones_m: "habitual" } };
  return null;
}

export const sua7: DefinicionSi<Sua7Estado, JustificacionSua7> = {
  key: "sua7",
  db: "DB-SUA",
  defaults: sua7EstadoDefaults,
  sujeto: "Vehículos en movimiento",
  justificar: justificarSua7,
  frase: fraseSua7,
  metricas: metricasSua7,
  queEntra: queEntraSua7,
  piezas: piezasSua7,
  franja: franjaSua7,
  etiqueta: textoEtiquetaSua7,
  resultadoLista: resultadoListaSua7,
  textoAviso: textoAvisoSua7,
  textoIncumplimiento: textoIncumplimientoSua7,
  arreglo: (el) => arregloSua7(el as ElementoSua7),
  avisosAEdificio: new Set(["construida-supuesta"]),
  tituloDibujo: "La salida del garaje",
  pistaDibujo: "Pulsa el garaje, la rampa, el coche o el dispositivo de la salida para ver lo que se exige.",
  dibujo: dibujoSua7,
  describirDibujo: describirDibujoSua7,
  seleccionInicial: (j) => j.elementos.find((e) => e.veredicto === "fail")?.id ?? (j.elementos.some((e) => e.id === "espera") ? "espera" : "ambito"),
  memoria: memoriaSua7,
  ficha: (j, o) => {
    const d = j.decisiones;
    const origen = (...k: (keyof Sua7Estado)[]) => (k.every((x) => esHabitualSua7(o.estado, x)) ? ORIGEN_CRITERIO : ORIGEN_DECISION);
    const datosPartida: FilaDato[] = [];
    if (j.garaje) {
      datosPartida.push(
        { concepto: "Plazas del garaje", valor: String(j.garaje.plazas), origen: ORIGEN_EDIFICIO },
        {
          concepto: `Superficie construida del garaje (uso Aparcamiento si > ${m2(SUA_USO_APARCAMIENTO.datos.construidaMayorQue_m2)})`,
          valor: m2(j.garaje.construida_m2),
          origen: j.garaje.supuesta ? ORIGEN_SUPUESTO : ORIGEN_EDIFICIO,
        },
      );
      if (j.motivo === "aparcamiento") {
        datosPartida.push({
          concepto: "Salida al exterior y espacio de espera",
          valor: d.salida === "descendente" ? NOMBRE_SALIDA[d.salida] : `${NOMBRE_SALIDA[d.salida]}; ${m(d.fondo_m)} al ${pct(d.pendiente_pct)}`,
          origen: origen("salida", "fondo_m", "pendiente_pct"),
        });
      }
      if (j.rampa) {
        datosPartida.push({
          concepto: "Recorrido de peatones por la rampa",
          valor: d.peatones === "no" ? "no: acceso por el núcleo de escalera" : `sí, de ${m(d.anchuraPeatones_m)}`,
          origen: origen("peatones", "anchuraPeatones_m", "proteccion"),
        });
      }
      if (j.motivo === "aparcamiento") datosPartida.push({ concepto: "Dispositivo de alerta en la salida", valor: NOMBRE_ALERTA[d.alerta], origen: origen("alerta") });
    } else {
      datosPartida.push({ concepto: "Garaje", valor: j.motivo === "unifamiliar" ? "de una vivienda unifamiliar" : "no hay", origen: ORIGEN_EDIFICIO });
    }
    return fichaSua(j, {
      titulo: "SUA 7 — Vehículos en movimiento",
      slug: "sua7-vehiculos",
      normativa:
        j.motivo === "aparcamiento"
          ? [citaDe(SUA_USO_APARCAMIENTO.procedencia), citaDe(SUA7_AMBITO.procedencia), citaDe(SUA7_ESPERA.procedencia), citaDe(SUA7_PEATONES.procedencia), citaDe(SUA7_ITINERARIOS.procedencia), citaDe(SUA7_SENALIZACION.procedencia)]
          : j.motivo === "vias"
            ? [citaDe(SUA_USO_APARCAMIENTO.procedencia), citaDe(SUA7_AMBITO.procedencia), citaDe(SUA7_PEATONES.procedencia), citaDe(SUA7_SENALIZACION.procedencia)]
            : [citaDe(SUA_USO_APARCAMIENTO.procedencia), citaDe(SUA7_AMBITO.procedencia)],
      datosPartida,
      limite: limiteSua7,
      valor: textoEtiquetaSua7,
      textoAviso: textoAvisoSua7,
      observaciones: j.garaje
        ? [
            "Interpretación: con 100 m² construidos o menos, el garaje no es uso Aparcamiento, pero sus vías de circulación siguen dentro del ámbito (ap. 2.2 y 4.1).",
            "Interpretación: el garaje es de uso privado, así que el ap. 3 (itinerarios de zonas de uso público) no se le aplica.",
            "Criterio de proyecto: el dispositivo de alerta del ap. 4.3 se dispone siempre que el garaje es uso Aparcamiento; el DB-SUA no define «establecimiento».",
            "La herramienta no modela aparcamientos ni vías rodadas exteriores de la parcela: se declara que no los hay.",
          ]
        : ["La herramienta no modela aparcamientos ni vías rodadas exteriores de la parcela: se declara que no los hay."],
      memoria: memoriaSua7(j),
      caption: j.garaje ? "Sección del edificio con el garaje, la rampa y la salida a la calle." : "Sección del edificio.",
      pdfSvgId: SUA7_PDF_SVG_ID,
      opciones: o,
    });
  },
  pdfSvgId: SUA7_PDF_SVG_ID,
};
