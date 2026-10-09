// =============================================================================
// DB-HE1 — Ficha justificativa (feature-15). Transforma la JUSTIFICACIÓN (la
// envolvente deducida de El edificio, verificada por el motor) en el `FichaData`
// que pinta la plantilla ÚNICA `renderFicha`. Función PURA.
//
// Trazabilidad (SPEC §4/§8): cada dato declara su ORIGEN y cada verificación
// cita su apartado. Lo orientativo (λ, µ, Ug, Uf del CEC) y los criterios de
// proyecto (composiciones tipo, b = 1, la ventana tipo, la altitud de la
// capital) se rotulan. Los tipos de fachada, ventana, cubierta y forjado vienen
// de El edificio y se nombran como en HR y HS1, con su código y su página del
// CEC (feature-26). El vidrio y el marco se declaran por separado (HE1 ap. 4
// párr. 3 d).
// =============================================================================

import { VEREDICTO_FICHA } from "../../lib/cte/estados";
import { textoParrafo } from "../../lib/cte/memoria";
import { citaDe } from "../../lib/cte/tabla";
import { procedenciaEdificio } from "../../lib/edificio/derivar";
import type { Edificio } from "../../lib/edificio/tipos";
import type { CitaNormativa, FichaData, FilaDato, FilaVerificacion } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import { MATERIALES_CEC } from "../../lib/constructivo/materiales";
import { designacion, NOMBRE_CERRAMIENTO } from "../../lib/constructivo/textos";
import { MARCOS } from "../../lib/constructivo/tipos";
import { aislanteDe, claseDe, VIDRIOS, type RolCerramiento } from "./envolvente";
import type { He1Estado } from "./estado";
import { cerramientoDe, type ElementoHe1, type JustificacionHe1 } from "./justificacion";
import { memoriaHe1 } from "./memoria";
import { HE1_PDF_SVG_ID } from "./svg-meta";
import {
  CLIMA_TABLA_C1,
  FRSI_MIN_TABLA_1,
  PSI_HUECO_TABLA_10,
  RESISTENCIAS_SUPERFICIALES,
  UF_REFERENCIA_CEC,
  ULIM_PARTICIONES_TABLA_3_2,
  ULIM_TABLA_3_1_1_a,
} from "./tablas";
import { aislanteCubiertaDe, composicionCorta, descripcionEnvolvente, lugar, montajeEnTexto, textoAviso } from "./textos";

const ORIGEN_EDIFICIO = "El edificio";
const ORIGEN_DECISION = "Decisión del proyectista";
const ORIGEN_TIPO = "Composición tipo · λ orientativas";

function n0(v: number): string {
  return fmt(v, undefined, 0);
}
function n1(v: number): string {
  return fmt(v, undefined, 1);
}
function n2(v: number): string {
  return Number.isFinite(v) ? v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
}

const CLASE = { clase_3_o_inferior: "Clase ≤ 3", clase_4: "Clase 4", clase_5: "Clase 5" } as const;

function capasDe(j: JustificacionHe1, rol: RolCerramiento): string {
  return cerramientoDe(j, rol)
    .detalle.r.capas.map((c) => `${c.nombre} ${n0(c.espesor_m * 1000)}`)
    .join(" · ");
}

function verificacion(el: ElementoHe1): FilaVerificacion {
  const det = el.detalle;
  let valor = "";
  let limite = "—";
  switch (det.clase) {
    case "cerramiento":
      valor = `${claseDe(det.rol) === "ventanas" ? "UH" : "U"} ${n2(det.r.u_W_m2K)} W/m²K`;
      limite = det.r.ulim_W_m2K === null ? "—" : `≤ ${n2(det.r.ulim_W_m2K)}`;
      break;
    case "superficial":
      valor = "valor" in el.valor ? `fRsi ${n2(el.valor.valor)}` : "no procede";
      limite = `≥ ${n2(det.fRsiMin)}`;
      break;
    case "intersticial":
      valor = "texto" in el.valor ? el.valor.texto : "";
      limite = "ap. 3.3";
      break;
    case "hulc":
      valor = "HULC";
      break;
  }
  return { concepto: el.nombre, valor, limite, estado: VEREDICTO_FICHA[el.veredicto], referencia: el.cita[0] ?? "DB-HE1" };
}

export interface OpcionesFichaHe1 {
  estado: He1Estado;
  edificio: Edificio;
  revisados: readonly string[];
  svg: { nativeW: number; nativeH: number };
}

export function toFichaData(j: JustificacionHe1, o: OpcionesFichaHe1): FichaData {
  const d = j.propuesta.decisiones;
  const t = j.propuesta.tipos;
  const suelo = cerramientoDe(j, "suelo").detalle;
  const ventana = cerramientoDe(j, "ventanas").detalle.r.hueco!;

  const normativa: CitaNormativa[] = [citaDe(ULIM_TABLA_3_1_1_a.procedencia)];
  if (suelo.suelo?.particion) normativa.push(citaDe(ULIM_PARTICIONES_TABLA_3_2.procedencia));
  normativa.push(
    citaDe(RESISTENCIAS_SUPERFICIALES.procedencia),
    citaDe(PSI_HUECO_TABLA_10.procedencia),
    citaDe(FRSI_MIN_TABLA_1.procedencia),
  );
  if (j.clima) normativa.push(citaDe(CLIMA_TABLA_C1.procedencia));
  normativa.push(citaDe(UF_REFERENCIA_CEC.procedencia));

  const datosPartida: FilaDato[] = [
    { concepto: "Descripción del edificio", valor: procedenciaEdificio(o.edificio), origen: ORIGEN_EDIFICIO },
    { concepto: "Zona climática de invierno", valor: `${j.zona}${lugar(j) ? ` · ${lugar(j)}` : ""}`, origen: "La obra (DB-HE Anejo B)" },
    j.clima
      ? {
          concepto: "Clima exterior de enero",
          valor: `${n1(j.clima.temp_C)} °C · ${n0(j.clima.hr_pct)} %`,
          origen: `DA DB-HE/2 Tabla C.1 (${j.clima.provincia})${j.clima.corregido ? " · corregido por altitud (criterio)" : ""}`,
        }
      : {
          concepto: "Clima exterior de enero",
          valor: `${n0(j.resultado.tempExteriorEnero_C)} °C · ${n0(j.resultado.hrExterior_pct)} %`,
          origen: "Cota del lado seguro (sin dato de la obra)",
        },
    {
      concepto: "Interior",
      valor: `${n0(j.resultado.tempInterior_C)} °C · ${n0(j.resultado.hrInterior_pct)} % · ${CLASE[d.higrometria]}`,
      origen: `${ORIGEN_DECISION} · DA DB-HE/2 §2.2.2`,
    },
    { concepto: "Envolvente", valor: descripcionEnvolvente(j), origen: ORIGEN_EDIFICIO },
    ...t.fachadas.map((f) => ({
      concepto: f.nombre,
      valor: `${designacion(f.sol)} · ${MATERIALES_CEC[f.sol.aislante].nombre} ${aislanteDe(d, f.rol)} mm`,
      origen: `${ORIGEN_EDIFICIO} · aislante: decisión`,
    })),
    {
      concepto: NOMBRE_CERRAMIENTO.cubierta,
      valor: `${designacion(t.cubierta)} · ${montajeEnTexto(j) ? `${montajeEnTexto(j)} · ` : ""}${aislanteCubiertaDe(j)} ${d.aislanteCubierta_mm} mm`,
      origen: `${ORIGEN_EDIFICIO} · composición tipo · λ orientativas`,
    },
    { concepto: cerramientoDe(j, "suelo").nombre, valor: composicionCorta(j, "suelo"), origen: ORIGEN_TIPO },
    {
      concepto: NOMBRE_CERRAMIENTO.forjado,
      valor: `${designacion(t.forjado)} · R ${n2(t.forjado.R)} m²K/W · µ ${n0(t.forjado.mu)}`,
      origen: ORIGEN_EDIFICIO,
    },
  ];
  if (suelo.suelo?.tipo === "local") {
    datosPartida.push({
      concepto: "El local sin uso, para la envolvente",
      valor: suelo.suelo.particion ? "Otra unidad de uso (tabla 3.2)" : "Espacio no habitable (UT)",
      origen: `${ORIGEN_DECISION} · DB-HE Anejo C`,
    });
  }
  datosPartida.push(
    { concepto: "Ventana tipo", valor: `${n2(1.2)} × ${n2(1.4)} m · dos hojas · lg ${n1(ventana.lg_m)} m`, origen: "Criterio de proyecto" },
    { concepto: "Vidrio", valor: `${VIDRIOS[d.vidrio].tipo} · Ug ${n1(ventana.ug_W_m2K)} · ${n2(ventana.ag_m2)} m²`, origen: `${ORIGEN_DECISION} · Ug orientativo CEC` },
    ...t.ventanas.flatMap((v) => {
      const h = cerramientoDe(j, v.rol).detalle.r.hueco!;
      const pb = v.rol === "ventanas-pb" ? " de la planta baja" : "";
      return [
        {
          concepto: v.nombre,
          valor: `${designacion(v.sol)} · ${MARCOS[v.marco].nombre} · Uf ${n1(h.uf_W_m2K)} · ${n2(h.af_m2)} m²`,
          origen: `${ORIGEN_EDIFICIO} · Uf orientativo CEC 3.16`,
        },
        { concepto: `Junta vidrio-marco${pb}`, valor: `Ψ ${n2(h.psi_W_mK)} W/mK`, origen: "DA DB-HE/1 Tabla 10" },
      ];
    }),
  );

  const verificaciones = j.elementos.map(verificacion);

  const observaciones: string[] = j.avisos.map((a) => {
    const t = textoAviso(a, j);
    return `${t.titulo} ${t.detalle} — ${o.revisados.includes(a.id) ? "Revisado por el proyectista." : "Pendiente de revisar."}`;
  });
  observaciones.push(
    `Composiciones, de dentro afuera. ${t.fachadas.map((f) => `${f.nombre} (CEC ${f.sol.codigo}): ${capasDe(j, f.rol)} mm.`).join(" ")} Cubierta: ${capasDe(j, "cubierta")} mm. ${cerramientoDe(j, "suelo").nombre}: ${capasDe(j, "suelo")} mm.`,
    "Predimensionado por elementos con composiciones tipo: λ, µ, Ug y Uf son orientativos del Catálogo de Elementos Constructivos y se sustituyen por los declarados por el fabricante (HE1 ap. 5.1). Las fábricas entran con la R de la pieza del Catálogo (apartado 3.17), no con una λ.",
    `Los forjados de la cubierta y del suelo son el elegido en El edificio y entran con la R y la µ de su fila del Catálogo (apartado 3.18). Criterio: el contacto con espacios no habitables, con b = 1 (lado seguro, DA DB-HE/1 ec. 6).`,
    ...(j.propuesta.montajeCubierta.invertida
      ? []
      : [
          "Criterio: la cubierta convencional lleva barrera de vapor bajo el aislante solo si, sin ella, Glaser prevé condensaciones (CEC: «solo si hay riesgo de condensación según el DB HE-1»); la barrera y la impermeabilización, láminas bituminosas con Sd 50 m (orientativo).",
        ]),
    `Criterio: el forjado sobre ${suelo.suelo?.tipo === "terreno" ? "la cámara sanitaria" : suelo.suelo?.tipo === "garaje" ? "el garaje" : "el local"} no comprueba fRsi por la escasa producción de vapor del espacio inferior (DA DB-HE/2 §4.1.1); a los huecos no se les aplican fRsi ni Glaser.`,
    "Criterio: la ventana tipo es de 1,20 × 1,40 m de dos hojas; la fracción de marco es 0,25 (DB-HE Anejo A) y la junta, el perímetro de los vidrios. La Ug es la del CEC para un doble 4/16/4; las lunas las fija el tipo de ventana, y su espesor apenas cambia la Ug.",
  );
  if (j.clima?.corregido) {
    observaciones.push(
      `El clima de enero se corrige por altitud (−1 °C cada 100 m, DA DB-HE/2 §2.1) desde la altitud de la capital de la Tabla a-Anejo G del DB-HE (${n0(j.clima.altitudCapital_m)} m, criterio).`,
    );
  }
  observaciones.push("El coeficiente global de transmisión (K) y el control solar (q sol;jul) se justifican con la herramienta oficial, en documento aparte.");

  return {
    titulo: "HE1 — Envolvente térmica",
    engineVersion: ENGINE_VERSION,
    edicionDB: "DB-HE (consolidado 14-06-2022)",
    normativa,
    datosPartida,
    verificaciones,
    veredictoGlobal: j.veredicto,
    observaciones,
    memoria: memoriaHe1(j).parrafos.map(textoParrafo),
    svg: {
      elementId: HE1_PDF_SVG_ID,
      nativeW: o.svg.nativeW,
      nativeH: o.svg.nativeH,
      caption: "Sección de la fachada a escala, con el perfil de temperaturas de enero.",
    },
    inputs: { estado: o.estado, edificio: o.edificio },
    slug: "he1-envolvente",
  };
}
