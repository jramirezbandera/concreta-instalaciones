// =============================================================================
// DB-HS4 — Ficha justificativa (feature-15). Transforma la JUSTIFICACIÓN (la red
// deducida de El edificio, dimensionada por el motor) en el `FichaData` que
// pinta la plantilla ÚNICA `renderFicha`. Función PURA (sin React/DOM).
//
// Trazabilidad (SPEC §4/§8): cada dato declara su ORIGEN (El edificio, Datos de
// la obra, decisión del proyectista o criterio de proyecto) y cada verificación
// cita su apartado, desde la `.procedencia` de las tablas. Los criterios que no
// son CTE (simultaneidad por el método tradicional, longitudes tipo, batería en
// planta baja, grupo de presión constante) se rotulan como tales.
// =============================================================================

import { VEREDICTO_FICHA } from "../../lib/cte/estados";
import { textoParrafo } from "../../lib/cte/memoria";
import { citaDe } from "../../lib/cte/tabla";
import { procedenciaEdificio } from "../../lib/edificio/derivar";
import type { Edificio } from "../../lib/edificio/tipos";
import type { CitaNormativa, FichaData, FilaDato, FilaVerificacion } from "../../lib/pdf/renderFicha";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { Hs4Estado } from "./estado";
import type { ElementoHs4, JustificacionHs4, ObraHs4 } from "./justificacion";
import { memoriaHs4 } from "./memoria";
import { ALTURA_PUNTO_CONSUMO_M, LONGITUDES_M, NOMBRE_TUBERIA } from "./red";
import { HS4_PDF_SVG_ID } from "./svg-meta";
import {
  AHORRO_AGUA,
  ALIMENTACION_TABLA_4_3,
  CAUDAL_INSTANTANEO_TABLA_2_1,
  CRITERIOS_PROYECTO_HS4,
  DERIVACIONES_TABLA_4_2,
  GRUPO_PRESION,
  PERDIDAS_LOCALIZADAS,
  PRESIONES,
  SIMULTANEIDAD_K,
  VELOCIDADES_CALCULO,
} from "./tablas";
import { textoAviso, valorCorto } from "./textos";

const ORIGEN_EDIFICIO = "El edificio";
const ORIGEN_OBRA = "Datos de la obra";
const ORIGEN_DECISION = "Decisión del proyectista";
const ORIGEN_CRITERIO = "Criterio de proyecto (no CTE)";

function kpa(v: number): string {
  return fmt(v, "kPa", 0);
}

/** Valor y límite de un elemento, para las columnas de la ficha. */
function cuentas(el: ElementoHs4): { valor: string; limite: string } {
  const det = el.detalle;
  const v = valorCorto(el);
  switch (det.clase) {
    case "red":
      return { valor: kpa(det.presion_kPa), limite: det.necesaria_kPa === null ? "—" : `≥ ${kpa(det.necesaria_kPa)} sin grupo` };
    case "planta":
      return {
        valor: kpa(det.punto.aparato.presionResidual_kPa),
        limite: `≥ ${kpa(det.punto.aparato.presionMinExigida_kPa)}`,
      };
    case "maxima":
      return { valor: kpa(det.punto.aparato.presionResidual_kPa), limite: `≤ ${kpa(det.maxima_kPa)}` };
    case "grupo":
      return {
        valor: det.puesto ? `Sí · ${kpa(det.presionGrupo_kPa)}` : "No",
        limite: det.necesario ? "necesario" : "no necesario",
      };
    case "montante":
      return {
        valor: `${v} · ${fmt(det.tramo.velocidad_m_s ?? 0, "m/s", 1)}`,
        limite: (() => {
          const m = el.manda.tipo === "velocidad" ? el.manda : null;
          return m ? `${fmt(m.min_m_s, undefined, 1)}–${fmt(m.max_m_s, "m/s", 1)} (criterio)` : "—";
        })(),
      };
    case "caudal":
      return { valor: `${fmt(det.tramo.caudalCalculo_dm3_s, "dm³/s", 2)} · K ${fmt(det.tramo.k, undefined, 2)}`, limite: "criterio" };
    case "acometida":
      return { valor: `${v} · ${fmt(det.acometida.caudalCalculo_dm3_s, "dm³/s", 2)}`, limite: "criterio" };
    case "local":
      return { valor: `${v} previsto`, limite: "criterio de proyecto" };
  }
}

export interface OpcionesFichaHs4 {
  estado: Hs4Estado;
  edificio: Edificio;
  obra: ObraHs4;
  /** Ids de los avisos que el proyectista marcó como revisados. */
  revisados: readonly string[];
  /** Tamaño nativo del dibujo que se rasteriza. */
  svg: { nativeW: number; nativeH: number };
}

/** Convierte la justificación de HS4 en el FichaData que renderFicha pinta. */
export function toFichaData(j: JustificacionHs4, o: OpcionesFichaHs4): FichaData {
  const d = j.red.decisiones;
  const manual = j.modo === "manual";

  // ── Normativa de referencia ───────────────────────────────────────────────
  const normativa: CitaNormativa[] = [
    citaDe(CAUDAL_INSTANTANEO_TABLA_2_1.procedencia),
    citaDe(PRESIONES.procedencia),
    citaDe(DERIVACIONES_TABLA_4_2.procedencia),
    citaDe(ALIMENTACION_TABLA_4_3.procedencia),
    citaDe(VELOCIDADES_CALCULO.procedencia),
    citaDe(PERDIDAS_LOCALIZADAS.procedencia),
    citaDe(AHORRO_AGUA.procedencia),
  ];
  if (d.grupoPresion || j.elementos.some((e) => e.detalle.clase === "grupo" && e.detalle.necesario)) {
    normativa.push(citaDe(GRUPO_PRESION.procedencia));
  }
  normativa.push({
    ...citaDe(SIMULTANEIDAD_K.procedencia),
    exigencia: "Coeficiente de simultaneidad: criterio de proyecto (método tradicional), no exigencia CTE",
  });

  // ── Datos de partida ──────────────────────────────────────────────────────
  const datosPartida: FilaDato[] = [
    { concepto: "Descripción del edificio", valor: procedenciaEdificio(o.edificio), origen: ORIGEN_EDIFICIO },
    {
      concepto: "Presión de la red en la acometida",
      valor: j.presionSinDato ? `${kpa(j.presionRed_kPa)} (supuesta)` : kpa(j.presionRed_kPa),
      origen: j.presionSinDato
        ? "Supuesta: no consta en la obra"
        : `${ORIGEN_OBRA} · ${o.revisados.includes("presion-red-supuesta") ? "confirmada por el proyectista" : "pendiente de confirmar con la compañía"}`,
    },
    {
      concepto: "Contadores",
      valor: j.red.unifamiliar
        ? "Contador general"
        : d.contadores === "bateria"
          ? `Batería de ${j.red.contadores.total} en planta baja`
          : "En cada planta, con montante general",
      origen: j.red.unifamiliar ? ORIGEN_EDIFICIO : ORIGEN_DECISION,
    },
    { concepto: "Tubería", valor: NOMBRE_TUBERIA[d.tuberia], origen: ORIGEN_DECISION },
    { concepto: "Agua caliente", valor: d.aguaCaliente === "individual" ? "Individual (HE 4)" : "Central (red de ACS aparte)", origen: ORIGEN_DECISION },
    {
      concepto: "Grupo de presión",
      valor: d.grupoPresion ? `Sí · ${kpa(d.presionGrupo_kPa)} a su salida` : "No",
      origen: d.grupoPresion ? `${ORIGEN_DECISION} · presión constante supuesta` : ORIGEN_DECISION,
    },
    {
      concepto: "Simultaneidad",
      valor: j.inputs.criterioK === "une149201" ? "K = 1/√(n−1) por tramo" : "K = 1 (sin simultaneidad)",
      origen: `${ORIGEN_CRITERIO} · método tradicional`,
    },
    {
      concepto: "Pérdidas localizadas",
      valor: `${fmt((j.inputs.fraccionPerdidasLocalizadas ?? 0.25) * 100, "%", 0)} de las longitudinales`,
      origen: "DB-HS4 ap. 4.2.2 pto 1 a)",
    },
  ];
  if (!manual) {
    const tipos = new Map<string, (typeof j.red.unidades)[number]>();
    for (const u of j.red.unidades) if (!tipos.has(u.tipoId + u.clase)) tipos.set(u.tipoId + u.clase, u);
    for (const u of tipos.values()) {
      datosPartida.push({
        concepto: u.clase === "oficinas" ? "Planta de oficinas" : j.red.unifamiliar ? "Vivienda" : `Vivienda tipo ${u.nombreTipo}`,
        valor: `${u.numAparatos} aparatos`,
        origen: `${ORIGEN_EDIFICIO} · Tabla 2.1`,
      });
    }
    datosPartida.push({
      concepto: "Geometría de la red",
      valor: `grifos a ${fmt(ALTURA_PUNTO_CONSUMO_M, "m", 0)}; derivación ${fmt(LONGITUDES_M.derivacionParticular, "m", 0)}; cuarto ${fmt(LONGITUDES_M.cuarto, "m", 0)}`,
      origen: ORIGEN_CRITERIO,
    });
  } else {
    datosPartida.push({
      concepto: "Red de agua fría",
      valor: `${j.inputs.tramos.length} tramos · ${j.inputs.aparatos.length} aparatos`,
      origen: "Ajustada a mano por el proyectista",
    });
  }

  // ── Verificaciones: una por elemento ──────────────────────────────────────
  const verificaciones: FilaVerificacion[] = j.elementos.map((el) => {
    const c = cuentas(el);
    return {
      concepto: el.nombre,
      valor: c.valor,
      limite: c.limite,
      estado: VEREDICTO_FICHA[el.veredicto],
      referencia: el.cita[0] ?? "DB-HS4",
    };
  });

  // ── Observaciones: avisos con su revisión y criterios ─────────────────────
  const observaciones: string[] = j.avisos.map((a) => {
    const t = textoAviso(a, j);
    const revisado = o.revisados.includes(a.id);
    return `${t.titulo} ${t.detalle} — ${revisado ? "Revisado por el proyectista." : "Pendiente de revisar."}`;
  });
  observaciones.push(
    "Criterio: el coeficiente de simultaneidad K = 1/√(n−1) es el método tradicional; el DB pide «un criterio adecuado» (ap. 4.2.1 pto 2 b) y no fija fórmula.",
    "Criterio: las pérdidas por rozamiento se estiman con un modelo de predimensionado y las localizadas, como un 20–30 % de las longitudinales (ap. 4.2.2 pto 1 a); no sustituyen un cálculo de detalle.",
  );
  if (d.grupoPresion) {
    observaciones.push(
      `Criterio: el grupo de presión se supone de presión constante a su salida. Si es convencional, la presión de parada sube entre ${GRUPO_PRESION.datos.margenParadaSobreArranqueMin_kPa} y ${GRUPO_PRESION.datos.margenParadaSobreArranqueMax_kPa} kPa (ap. 4.5.2.3) y debe comprobarse con los 500 kPa del punto más bajo. El equipo se dimensiona en el proyecto de la instalación.`,
    );
  }
  if (!manual && !j.red.unifamiliar && d.contadores === "bateria") {
    observaciones.push(
      "Criterio: la batería de contadores en planta baja es lo habitual de las compañías suministradoras; el DB pide los divisionarios en una zona de uso común, de fácil y libre acceso (ap. 3.2.1.2.7).",
    );
  }
  if (j.red.locales.length > 0) observaciones.push(`Criterio: local sin uso con ${CRITERIOS_PROYECTO_HS4.localSinUso}.`);

  const memoria = memoriaHs4(j);

  return {
    titulo: "HS4 — Suministro de agua (fontanería)",
    engineVersion: ENGINE_VERSION,
    edicionDB: "DB-HS4 (consolidado 14-06-2022)",
    normativa,
    datosPartida,
    verificaciones,
    veredictoGlobal: j.veredicto,
    observaciones,
    memoria: memoria.parrafos.map(textoParrafo),
    svg: {
      elementId: HS4_PDF_SVG_ID,
      nativeW: o.svg.nativeW,
      nativeH: o.svg.nativeH,
      caption: manual
        ? "Esquema de la red de agua fría: tramos con Ø, caudal, velocidad y presión residual."
        : "Sección del edificio con la batería de contadores y los montantes, y la presión que llega a cada planta.",
    },
    inputs: { estado: o.estado, edificio: o.edificio, obra: o.obra },
    slug: "hs4-fontaneria",
  };
}
