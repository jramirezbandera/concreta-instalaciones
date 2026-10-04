// =============================================================================
// DB-HS5 — Ficha justificativa (feature-14 §K). Transforma la justificación
// (`justificarHs5`) en el `FichaData` que pinta la plantilla ÚNICA
// `renderFicha` (lib/pdf). Función PURA de transformación: no sabe de jsPDF.
//
// Trazabilidad (SPEC §4/§8): cada dato declara su ORIGEN (El edificio, datos de
// la obra, decisión del proyectista, tabla del DB) y cada verificación cita su
// referencia. Los avisos viajan a las observaciones con su estado: «revisado
// por el proyectista» o «pendiente de revisar». La memoria redactada abre la
// ficha. El dibujo es la sección en modo papel (o el esquema de columna si la
// red se ajustó a mano).
// =============================================================================

import type {
  CitaNormativa,
  FichaData,
  FilaDato,
  FilaVerificacion,
} from "../../lib/pdf/renderFicha";
import { VEREDICTO_FICHA } from "../../lib/cte/estados";
import { citaDe } from "../../lib/cte/tabla";
import { procedenciaEdificio } from "../../lib/edificio/derivar";
import type { Edificio } from "../../lib/edificio/tipos";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import type { ElementoHs5, JustificacionHs5, ObraHs5 } from "./justificacion";
import { memoriaHs5, textoParrafo } from "./memoria";
import type { Hs5Estado } from "./estado";
import { HS5_PDF_SVG_ID } from "./svg-meta";
import { textoAviso, valorCorto } from "./textos";
import {
  ARQUETAS_TABLA_4_13,
  BAJANTES_PLUVIALES_TABLA_4_8,
  BAJANTES_TABLA_4_4,
  CANALONES_TABLA_4_7,
  COLECTORES_PLUVIALES_TABLA_4_9,
  COLECTORES_TABLA_4_5,
  INTENSIDAD_TABLA_B_1,
  RAMALES_COLECTORES_TABLA_4_3,
  SIFONES,
  SUMIDEROS_TABLA_4_6,
  UD_APARATOS_TABLA_4_1,
  VENT_PRIMARIA,
  VENT_SECUNDARIA,
  VENT_SECUNDARIA_ALTERNAS_TABLA_4_10,
} from "./tablas";

const ORIGEN_EDIFICIO = "El edificio";
const ORIGEN_OBRA = "Datos de la obra";
const ORIGEN_DECISION = "Decisión del proyectista";


const DISPOSICION: Record<string, string> = { colgado: "Colgados", enterrado: "Enterrados" };

/** Lo que recibe y lo que admite un elemento, para las columnas de la ficha. */
function cuentas(el: ElementoHs5): { valor: string; limite: string } {
  const det = el.detalle;
  const v = valorCorto(el);
  switch (det.clase) {
    case "colector":
    case "bajante":
    case "ramal":
      return {
        valor: `${v} · ${fmt(det.tramo.udAcumuladas, "UD")}`,
        limite: det.tramo.capacidad_ud === null ? "sin Ø admisible" : `≤ ${fmt(det.tramo.capacidad_ud, "UD")}`,
      };
    case "pluviales_bajantes":
      return {
        valor: `${v} × ${det.p.bajantes} · ${fmt(det.p.bajante.corregida_m2, "m²", 0)}`,
        limite:
          det.p.bajante.capacidad_m2 === null ? "fuera de tabla" : `≤ ${fmt(det.p.bajante.capacidad_m2, "m²", 0)}`,
      };
    case "pluviales_colector":
      return {
        valor: `${v} · ${fmt(det.p.colector.corregida_m2, "m²", 0)}`,
        limite:
          det.p.colector.capacidad_m2 === null ? "fuera de tabla" : `≤ ${fmt(det.p.colector.capacidad_m2, "m²", 0)}`,
      };
    case "canalones":
      return {
        valor: `${v} · ${fmt(det.p.canalon?.corregida_m2 ?? 0, "m²", 0)}`,
        limite:
          det.p.canalon?.capacidad_m2 == null ? "fuera de tabla" : `≤ ${fmt(det.p.canalon.capacidad_m2, "m²", 0)}`,
      };
    case "ventilacion":
      return { valor: v, limite: `< ${VENT_PRIMARIA.datos.maxPlantasSolo} plantas` };
    case "local":
      return { valor: `${v} previsto`, limite: "criterio de proyecto" };
    case "garaje":
      return { valor: v, limite: det.bombeo ? "≥ 2 bombas" : "—" };
    case "conexion":
      return {
        valor: v,
        limite: det.alcantarillado === "unitario" ? "cierre hidráulico" : "conexiones independientes",
      };
  }
}

export interface OpcionesFichaHs5 {
  estado: Hs5Estado;
  edificio: Edificio;
  obra: ObraHs5;
  /** Ids de los avisos que el proyectista marcó como revisados. */
  revisados: readonly string[];
  /** Tamaño nativo del dibujo que se rasteriza. */
  svg: { nativeW: number; nativeH: number };
}

/** Convierte la justificación de HS5 en el FichaData que renderFicha pinta. */
export function toFichaData(j: JustificacionHs5, o: OpcionesFichaHs5): FichaData {
  const d = j.red.decisiones;

  // ── Normativa de referencia ───────────────────────────────────────────────
  const normativa: CitaNormativa[] = [
    citaDe(UD_APARATOS_TABLA_4_1.procedencia),
    citaDe(RAMALES_COLECTORES_TABLA_4_3.procedencia),
    citaDe(BAJANTES_TABLA_4_4.procedencia),
    citaDe(COLECTORES_TABLA_4_5.procedencia),
  ];
  if (j.pluviales) {
    if (j.pluviales.sumideros !== null) normativa.push(citaDe(SUMIDEROS_TABLA_4_6.procedencia));
    if (j.pluviales.canalon) normativa.push(citaDe(CANALONES_TABLA_4_7.procedencia));
    normativa.push(
      citaDe(BAJANTES_PLUVIALES_TABLA_4_8.procedencia),
      citaDe(COLECTORES_PLUVIALES_TABLA_4_9.procedencia),
      citaDe(INTENSIDAD_TABLA_B_1.procedencia),
    );
  }
  normativa.push(
    citaDe(ARQUETAS_TABLA_4_13.procedencia),
    citaDe(SIFONES.procedencia),
    citaDe(VENT_PRIMARIA.procedencia),
    citaDe(VENT_SECUNDARIA.procedencia),
  );
  if (j.residuales?.ventilacion.secundaria.modo === "alternas") {
    normativa.push(citaDe(VENT_SECUNDARIA_ALTERNAS_TABLA_4_10.procedencia));
  }

  // ── Datos de partida ──────────────────────────────────────────────────────
  const manual = j.modo === "manual";
  const cubierta =
    j.red.cubierta.tipo === "inclinada"
      ? "Inclinada"
      : j.red.cubierta.tipo === "plana_transitable"
        ? "Plana transitable"
        : "Plana no transitable";
  const datosPartida: FilaDato[] = [
    { concepto: "Descripción del edificio", valor: procedenciaEdificio(o.edificio), origen: ORIGEN_EDIFICIO },
    {
      concepto: "Uso de los aparatos (Tabla 4.1)",
      valor: j.residualesInputs.uso === "privado" ? "Privado (vivienda)" : "Público",
      origen: manual ? "Entrada del usuario" : ORIGEN_EDIFICIO,
    },
    {
      concepto: "Plantas sobre rasante",
      valor: String(j.residualesInputs.numPlantas),
      origen: manual ? "Entrada del usuario" : ORIGEN_EDIFICIO,
    },
    {
      concepto: "Cubierta",
      valor: `${cubierta} · ${fmt(j.red.cubierta.superficie_m2, "m²", 0)}`,
      origen: ORIGEN_EDIFICIO,
    },
    {
      concepto: "Intensidad pluviométrica",
      valor: j.intensidad.supuesta
        ? `${fmt(j.intensidad.valor_mm_h, "mm/h", 0)} (supuesta)`
        : `${fmt(j.intensidad.valor_mm_h, "mm/h", 0)} · zona ${j.intensidad.zona}, isoyeta ${j.intensidad.isoyeta}`,
      origen: j.intensidad.supuesta
        ? "Supuesta: no consta en la obra"
        : `${ORIGEN_OBRA} · Figura B.1 y Tabla B.1`,
    },
    {
      concepto: "Cota del alcantarillado en la acometida",
      valor:
        o.obra.cotaAlcantarillado_m === undefined
          ? "No consta"
          : `${o.obra.cotaAlcantarillado_m.toFixed(2).replace(".", ",")} m`,
      origen: ORIGEN_OBRA,
    },
    {
      concepto: "Alcantarillado público",
      valor: d.alcantarillado === "unitario" ? "Unitario" : "Separativo",
      origen: ORIGEN_DECISION,
    },
    {
      concepto: "Colectores",
      valor: `${DISPOSICION[d.colectores]} · ${fmt(d.pendienteColector_pct, "%")}`,
      origen: ORIGEN_DECISION,
    },
    {
      concepto: "Bajante de la cocina",
      valor: d.bajanteCocina === "propia" ? "Propia" : "Con los baños",
      origen: ORIGEN_DECISION,
    },
    {
      concepto: "Ventilación de las bajantes",
      valor: d.ventilacion === "primaria" ? "Primaria" : "Secundaria",
      origen: ORIGEN_DECISION,
    },
  ];
  if (!manual) {
    for (const v of j.red.verticales) {
      datosPartida.push({
        concepto: `${v.clase === "nucleo_aseos" ? "Núcleo de aseos" : "Vivienda tipo"} ${v.nombre}`,
        valor: fmt(v.udUnidad, "UD"),
        origen: `${ORIGEN_EDIFICIO} · Tabla 4.1`,
      });
    }
  } else {
    datosPartida.push({
      concepto: "Red de residuales",
      valor: `${j.residualesInputs.tramos.length} tramos · ${j.residualesInputs.aparatos.length} aparatos`,
      origen: "Ajustada a mano por el proyectista",
    });
  }

  // ── Verificaciones: una por elemento (y por tramo si la red es manual) ────
  const verificaciones: FilaVerificacion[] = j.elementos.map((el) => {
    const c = cuentas(el);
    return {
      concepto: el.nombre,
      valor: c.valor,
      limite: c.limite,
      estado: VEREDICTO_FICHA[el.veredicto],
      referencia: el.cita[0] ?? "DB-HS5",
    };
  });
  if (manual && j.residuales) {
    const ya = new Set(j.elementos.map((e) => e.id));
    for (const t of j.residuales.porTramo) {
      if (ya.has(t.id)) continue;
      verificaciones.push({
        concepto: j.residualesInputs.tramos.find((x) => x.id === t.id)?.nombre ?? t.id,
        valor: `${t.diametro_mm === null ? "—" : `Ø${fmt(t.diametro_mm, "mm", 0)}`} · ${fmt(t.udAcumuladas, "UD")}`,
        limite: t.capacidad_ud === null ? "sin Ø admisible" : `≤ ${fmt(t.capacidad_ud, "UD")}`,
        estado: t.estado,
        referencia: t.tipo === "ramal" ? "Tabla 4.3" : t.tipo === "bajante" ? "Tabla 4.4" : "Tabla 4.5",
      });
    }
  }

  // ── Observaciones: avisos con su revisión y criterios de la herramienta ──
  const observaciones: string[] = j.avisos.map((a) => {
    const t = textoAviso(a);
    const revisado = o.revisados.includes(a.id);
    return `${t.titulo} ${t.detalle} — ${revisado ? "Revisado por el proyectista." : "Pendiente de revisar."}`;
  });
  const envolvente = (j.residuales?.porTramo ?? []).some((t) => t.bajante?.columna === "envolvente");
  if (envolvente) {
    observaciones.push(
      "Criterio: la Tabla 4.4 no define la «altura de bajante». Cuando las plantas que desaguan en una bajante y las que atraviesa quedan a distinto lado de 3, se comprueba con las dos columnas y se toma lo más desfavorable.",
    );
  }
  if (j.pluviales && j.pluviales.f !== 1) {
    observaciones.push(
      "Criterio: el factor f = i/100 se aplica también al colector de pluviales (Tabla 4.9), referida a 100 mm/h; el DB solo lo pide expresamente para las tablas 4.7 y 4.8.",
    );
  }
  const longitud = j.residuales?.ventilacion.secundaria.longitudSupuesta_m;
  if (longitud) {
    observaciones.push(
      `Criterio: la columna de ventilación secundaria se dimensiona con la Tabla 4.10 para una longitud de ${fmt(longitud, "m", 0)} (3 m por planta); hay que comprobarla con el trazado real.`,
    );
  }

  const memoria = memoriaHs5(j);

  return {
    titulo: "HS5 — Evacuación de aguas (saneamiento)",
    engineVersion: ENGINE_VERSION,
    edicionDB: "DB-HS5 (consolidado 2022)",
    normativa,
    datosPartida,
    verificaciones,
    veredictoGlobal: j.veredicto,
    observaciones,
    memoria: memoria.parrafos.map(textoParrafo),
    svg: {
      elementId: HS5_PDF_SVG_ID,
      nativeW: o.svg.nativeW,
      nativeH: o.svg.nativeH,
      caption: manual
        ? "Esquema de la red de evacuación: bajantes y colectores con Ø, UD y pendiente."
        : "Sección del edificio con la red de evacuación: bajantes, colectores, pluviales y su Ø.",
    },
    inputs: { estado: o.estado, edificio: o.edificio, obra: o.obra },
    slug: "hs5-saneamiento",
  };
}
