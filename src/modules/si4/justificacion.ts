// =============================================================================
// DB-SI, SI 4 — Instalaciones de protección contra incendios (feature-19): la
// dotación de la tabla 1.1 por el uso de cada parte del edificio, su altura de
// evacuación y su superficie construida. Cada instalación dice si se exige, dónde
// y por qué regla. PURA y DETERMINISTA; no redacta.
//
// Lecturas (research/verificacion-si4-si6.md, bloque C1):
//   - el garaje y el resto del edificio se dotan por separado (comentario);
//   - extintores en cada planta con orígenes de evacuación (no lo es el interior
//     de las viviendas: la unifamiliar solo los lleva en su garaje) y junto a la
//     puerta de cada local de riesgo especial (nota 1);
//   - la columna seca del garaje cuenta la máxima diferencia de cotas (comentario);
//   - un garaje bajo rasante no es «aparcamiento abierto»: su ventilación
//     mecánica se activa por detección (SI 3 ap. 8), aunque no pase de 500 m²;
//   - el local sin uso se deja previsto: se dotará con su actividad.
// =============================================================================

import type { Aviso } from "../../lib/cte/resultado";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { ProyectoSi } from "../si/definicion";
import { dependeDeConstruida, edificioSi, superficies, type ZonaSi } from "../si/edificio";
import { compartimentar, type Compartimentacion } from "../si/sectores";
import type { ElementoSi, JustificacionSiBase } from "../si/tipos";
import { HABITUALES_SI4, resolverSi4, type DecisionesSi4, type Si4Estado } from "./estado";
import { DOTACION_TABLA_1_1, numeroHidrantes } from "./tablas";

export type Instalacion = "bie" | "columna" | "deteccion" | "alarma" | "hidrantes" | "extincion" | "ascensor";

/** Una regla de la tabla 1.1 que se ha mirado: su texto, el valor del edificio y si la cumple. */
export interface ReglaSi4 {
  /** «Aparcamiento: superficie construida > 500 m²». */
  regla: string;
  /** «504 m² (supuestos)». */
  valor: string;
  exige: boolean;
  /** El valor es una superficie construida supuesta y decide la regla. */
  dependeDeConstruida: boolean;
  /** Dónde: «en el garaje», «en todo el edificio». */
  donde: string;
  /** Las zonas cuya superficie mide la regla (para pedir su construida). */
  zonas?: ZonaSi[];
}

/** Una planta con orígenes de evacuación y dónde va su extintor. */
export interface PlantaExtintor {
  nivel: number;
  etiqueta: string;
  /** Las zonas con orígenes de evacuación de la planta. */
  zonas: ZonaSi[];
}

export type DetalleSi4 =
  | { clase: "extintores"; plantas: PlantaExtintor[]; locales: ZonaSi[]; total: number; unifamiliar: boolean }
  | { clase: "dotacion"; inst: Instalacion; exige: boolean; reglas: ReglaSi4[]; nota?: string }
  | { clase: "hidrantes"; exige: boolean; reglas: ReglaSi4[]; numero: number; publico: boolean }
  | { clase: "local"; zona: ZonaSi }
  | { clase: "senalizacion" };

export type ElementoSi4 = ElementoSi<DetalleSi4>;

export interface JustificacionSi4 extends JustificacionSiBase {
  elementos: ElementoSi4[];
  decisiones: DecisionesSi4;
  habituales: DecisionesSi4;
  comp: Compartimentacion;
}

const T = DOTACION_TABLA_1_1.datos;

function m2s(s: { construida_m2: number; supuesta: boolean }): string {
  return `${s.construida_m2} m²${s.supuesta ? " (supuestos)" : ""}`;
}

/**
 * ¿Tiene la zona orígenes de evacuación? (Anejo SI A). Los locales de riesgo
 * especial también, pero su extintor va junto a su puerta y se cuentan aparte.
 */
function conOrigenes(z: ZonaSi): boolean {
  // En una plurifamiliar, la puerta de cada vivienda da a un rellano común: hay
  // orígenes de evacuación en cada planta de viviendas aunque El edificio no
  // dibuje el rellano como zona propia.
  if (z.uso === "viviendas") return true;
  if (z.uso === "vivienda_unifamiliar" || z.uso === "local_sin_uso") return false;
  // Las zonas de ocupación nula solo si exceden de 50 m².
  if (z.ocupacionNula) return z.util_m2 > 50;
  return true;
}

export function justificarSi4(estado: Si4Estado, p: ProyectoSi): JustificacionSi4 {
  const e = edificioSi(p.edificio);
  const c = compartimentar(e);
  const d = resolverSi4(estado);
  const h = e.alturaEvacuacion_m;
  const unifamiliar = e.resumen.esUnifamiliar;
  const elementos: ElementoSi4[] = [];
  const avisos: Aviso[] = [];
  const locales = new Set(c.riesgo.locales.map((l) => l.zona.id));
  const residencial = e.usoPrincipal === "residencial_vivienda" || e.usoPrincipal === "vivienda_unifamiliar";

  // ── Extintores ────────────────────────────────────────────────────────────
  const plantas: PlantaExtintor[] = e.plantas
    .map((pl) => ({ nivel: pl.nivel, etiqueta: pl.etiqueta, zonas: e.zonas.filter((z) => z.niveles.includes(pl.nivel) && !locales.has(z.id) && conOrigenes(z)) }))
    .filter((pl) => pl.zonas.length > 0);
  const zonasLocales = e.zonas.filter((z) => locales.has(z.id));
  // Uno por planta con orígenes y uno junto a cada local de riesgo (puede servir a varios: se cuenta uno por planta).
  const plantasConLocal = new Set(zonasLocales.flatMap((z) => z.niveles));
  const total = plantas.length + plantasConLocal.size;
  elementos.push({
    id: "extintores",
    nombre: "Extintores",
    tipo: "dotacion",
    veredicto: "ok",
    valor: total > 0 ? { valor: total, unidad: "extintores" } : { texto: "ninguno" },
    manda: { tipo: "grado_tabla", tabla: "Tabla 1.1", entradas: [{ k: "Instalación", v: "extintores 21A-113B" }] },
    cita: ["SI 4 · tabla 1.1", "nota (1)"],
    detalle: { clase: "extintores", plantas, locales: zonasLocales, total, unifamiliar },
  });

  // ── BIE ───────────────────────────────────────────────────────────────────
  const garaje = c.riesgo.aparcamiento;
  const reglasBie: ReglaSi4[] = [];
  if (garaje) {
    const s = { util_m2: garaje.util_m2, construida_m2: garaje.construida_m2, supuesta: garaje.zonas.some((z) => z.construida.supuesto) };
    reglasBie.push({
      regla: `Aparcamiento: superficie construida > ${T.aparcamiento.bieS_m2} m²`,
      valor: m2s(s),
      exige: s.construida_m2 > T.aparcamiento.bieS_m2,
      dependeDeConstruida: dependeDeConstruida(s, (m) => m > T.aparcamiento.bieS_m2),
      donde: "en el garaje",
      zonas: garaje.zonas,
    });
  }
  if (e.usoPrincipal === "administrativo") {
    const s = c.principal.superficie;
    reglasBie.push({
      regla: `Administrativo: superficie construida > ${T.administrativo.bieS_m2} m²`,
      valor: m2s(s),
      exige: s.construida_m2 > T.administrativo.bieS_m2,
      dependeDeConstruida: dependeDeConstruida(s, (m) => m > T.administrativo.bieS_m2),
      donde: "en las oficinas",
      zonas: c.principal.zonas,
    });
  }
  const altos = c.riesgo.locales.filter((l) => l.clase === "alto" && (l.tipo === "trasteros" || l.tipo === "residuos"));
  if (altos.length > 0) {
    reglasBie.push({ regla: "Zonas de riesgo especial alto por combustibles sólidos", valor: `${altos.length}`, exige: true, dependeDeConstruida: false, donde: "en los locales de riesgo alto" });
  }
  dotacion("bie", "Bocas de incendio equipadas", reglasBie);

  // ── Columna seca ──────────────────────────────────────────────────────────
  const reglasColumna: ReglaSi4[] = [];
  if (!unifamiliar) {
    reglasColumna.push({
      regla: `${residencial ? "Residencial Vivienda" : "Administrativo"}: altura de evacuación > ${T.residencialVivienda.columnaSecaH_m} m`,
      valor: `${h} m`,
      exige: h > T.residencialVivienda.columnaSecaH_m,
      dependeDeConstruida: false,
      donde: "en el edificio",
    });
  }
  if (garaje) {
    const bajo = Math.max(0, ...garaje.zonas.flatMap((z) => z.niveles.map((n) => -n)));
    reglasColumna.push({
      regla: `Aparcamiento: más de ${T.aparcamiento.columnaSecaPlantasBajo} plantas bajo rasante`,
      valor: `${bajo}`,
      exige: bajo > T.aparcamiento.columnaSecaPlantasBajo,
      dependeDeConstruida: false,
      donde: "en el garaje, con tomas en todas sus plantas",
    });
  }
  dotacion("columna", "Columna seca", reglasColumna);

  // ── Detección y alarma ────────────────────────────────────────────────────
  const reglasDeteccion: ReglaSi4[] = [];
  if (residencial && !unifamiliar) {
    reglasDeteccion.push({ regla: `Residencial Vivienda: altura de evacuación > ${T.residencialVivienda.deteccionAlarmaH_m} m`, valor: `${h} m`, exige: h > T.residencialVivienda.deteccionAlarmaH_m, dependeDeConstruida: false, donde: "en el edificio, con alarma" });
  }
  if (e.usoPrincipal === "administrativo") {
    const s = c.principal.superficie;
    reglasDeteccion.push({
      regla: `Administrativo: superficie construida > ${T.administrativo.deteccionRiesgoAltoS_m2} m²`,
      valor: m2s(s),
      exige: s.construida_m2 > T.administrativo.deteccionRiesgoAltoS_m2,
      dependeDeConstruida: dependeDeConstruida(s, (m) => m > T.administrativo.deteccionRiesgoAltoS_m2),
      donde: s.construida_m2 > T.administrativo.deteccionTodoS_m2 ? "en todo el edificio" : "en las zonas de riesgo alto",
      zonas: c.principal.zonas,
    });
  }
  let notaDeteccion: string | undefined;
  if (garaje) {
    const s = { util_m2: garaje.util_m2, construida_m2: garaje.construida_m2, supuesta: garaje.zonas.some((z) => z.construida.supuesto) };
    reglasDeteccion.push({
      regla: `Aparcamiento: superficie construida > ${T.aparcamiento.deteccionS_m2} m²`,
      valor: m2s(s),
      exige: s.construida_m2 > T.aparcamiento.deteccionS_m2,
      dependeDeConstruida: dependeDeConstruida(s, (m) => m > T.aparcamiento.deteccionS_m2),
      donde: "en el garaje",
      zonas: garaje.zonas,
    });
    if (garaje.zonas.every((z) => z.bajoRasante) && !(s.construida_m2 > T.aparcamiento.deteccionS_m2)) {
      notaDeteccion = "El garaje bajo rasante no es aparcamiento abierto: si su ventilación es mecánica, se activa por detección (SI 3 ap. 8).";
    }
  }
  dotacion("deteccion", "Detección de incendio", reglasDeteccion, notaDeteccion);

  if (e.usoPrincipal === "administrativo") {
    const s = c.principal.superficie;
    dotacion("alarma", "Sistema de alarma", [
      {
        regla: `Administrativo: superficie construida > ${T.administrativo.alarmaS_m2} m²`,
        valor: m2s(s),
        exige: s.construida_m2 > T.administrativo.alarmaS_m2,
        dependeDeConstruida: dependeDeConstruida(s, (m) => m > T.administrativo.alarmaS_m2),
        donde: "en el edificio",
        zonas: c.principal.zonas,
      },
    ]);
  }

  // ── Hidrantes ─────────────────────────────────────────────────────────────
  const reglasHidrantes: ReglaSi4[] = [
    { regla: `Altura de evacuación descendente > ${T.enGeneral.hidrantesHDescendente_m} m`, valor: `${h} m`, exige: h > T.enGeneral.hidrantesHDescendente_m, dependeDeConstruida: false, donde: "" },
    { regla: `Altura de evacuación ascendente > ${T.enGeneral.hidrantesHAscendente_m} m`, valor: `${e.alturaAscendente_m} m`, exige: e.alturaAscendente_m > T.enGeneral.hidrantesHAscendente_m, dependeDeConstruida: false, donde: "" },
  ];
  const resto = superficies(e.zonas.filter((z) => !(garaje?.zonas ?? []).some((g) => g.id === z.id)));
  const umbralUso = residencial ? T.residencialVivienda.hidrantesDesde_m2 : T.administrativo.hidrantesDesde_m2;
  reglasHidrantes.push({
    regla: `${residencial ? "Residencial Vivienda" : "Administrativo"}: superficie total construida desde ${umbralUso} m²`,
    valor: m2s(resto),
    exige: resto.construida_m2 >= umbralUso,
    dependeDeConstruida: dependeDeConstruida(resto, (m) => m >= umbralUso),
    donde: "",
    zonas: e.zonas.filter((z) => !(garaje?.zonas ?? []).some((g) => g.id === z.id)),
  });
  let sHidrantes = resto.construida_m2;
  if (garaje) {
    const s = { util_m2: garaje.util_m2, construida_m2: garaje.construida_m2, supuesta: garaje.zonas.some((z) => z.construida.supuesto) };
    reglasHidrantes.push({
      regla: `Aparcamiento: superficie construida desde ${T.aparcamiento.hidrantesDesde_m2} m²`,
      valor: m2s(s),
      exige: s.construida_m2 >= T.aparcamiento.hidrantesDesde_m2,
      dependeDeConstruida: dependeDeConstruida(s, (m) => m >= T.aparcamiento.hidrantesDesde_m2),
      donde: "",
      zonas: garaje.zonas,
    });
    sHidrantes = Math.max(sHidrantes, s.construida_m2);
  }
  const exigeHidrantes = reglasHidrantes.some((r) => r.exige);
  elementos.push({
    id: "hidrantes",
    nombre: "Hidrantes exteriores",
    tipo: "dotacion",
    veredicto: "ok",
    valor: exigeHidrantes ? { valor: numeroHidrantes(sHidrantes), unidad: "hidrantes" } : { texto: "no se exigen" },
    manda: { tipo: "grado_tabla", tabla: "Tabla 1.1", entradas: reglasHidrantes.map((r) => ({ k: r.regla, v: r.valor })) },
    cita: ["SI 4 · tabla 1.1", "nota (3)"],
    detalle: { clase: "hidrantes", exige: exigeHidrantes, reglas: reglasHidrantes, numero: exigeHidrantes ? numeroHidrantes(sHidrantes) : 0, publico: d.hidrantePublico === "si" },
  });
  for (const r of reglasHidrantes.filter((x) => x.dependeDeConstruida)) avisoConstruida(r, "hidrantes", "hidrantes");

  // ── Extinción automática y ascensor de emergencia ─────────────────────────
  dotacion("extincion", "Extinción automática", [
    { regla: `Altura de evacuación > ${T.enGeneral.extincionH_m} m`, valor: `${h} m`, exige: h > T.enGeneral.extincionH_m, dependeDeConstruida: false, donde: "en todo el edificio" },
  ]);
  const altas = e.plantas.filter((pl) => pl.nivel >= 0 && pl.cota_m > T.enGeneral.ascensorEmergenciaH_m);
  if (altas.length > 0) {
    dotacion("ascensor", "Ascensor de emergencia", [
      { regla: `Plantas con altura de evacuación > ${T.enGeneral.ascensorEmergenciaH_m} m`, valor: altas.map((x) => x.etiqueta).join(", "), exige: true, dependeDeConstruida: false, donde: "en esas plantas" },
    ]);
  }

  // ── El local sin uso, previsto ────────────────────────────────────────────
  for (const z of e.zonas.filter((x) => x.uso === "local_sin_uso")) {
    elementos.push({
      id: `local-${z.id}`,
      nombre: "Local sin uso",
      tipo: "local",
      veredicto: "previsto",
      valor: { texto: "con su actividad" },
      manda: { tipo: "decision_proyectista", decision: "previsto" },
      cita: ["SI 4 · ap. 1 pto 1"],
      detalle: { clase: "local", zona: z },
    });
  }

  elementos.push({
    id: "senalizacion",
    nombre: "Señalización",
    tipo: "senalizacion",
    veredicto: "ok",
    valor: { texto: "RIPCI" },
    manda: { tipo: "dato_de_partida", fuente: "RD 513/2017" },
    cita: ["SI 4 · ap. 2"],
    detalle: { clase: "senalizacion" },
  });

  const veredicto: Veredicto = elementos.some((x) => x.veredicto === "fail") ? "fail" : "ok";
  return { elementos, avisos, veredicto, decisiones: d, habituales: HABITUALES_SI4, comp: c };

  function dotacion(inst: Instalacion, nombre: string, reglas: ReglaSi4[], nota?: string): void {
    if (reglas.length === 0) return;
    const exige = reglas.some((r) => r.exige);
    const donde = [...new Set(reglas.filter((r) => r.exige).map((r) => r.donde))];
    elementos.push({
      id: inst,
      nombre,
      tipo: "dotacion",
      veredicto: "ok",
      valor: { texto: exige ? (inst === "bie" ? `BIE ${T.bie_mm} mm ${donde.join(" y ")}` : donde.join(" y ")) : nota ? "en el garaje (SI 3)" : "no se exige" },
      manda: { tipo: "grado_tabla", tabla: "Tabla 1.1", entradas: reglas.map((r) => ({ k: r.regla, v: r.valor })) },
      cita: ["SI 4 · tabla 1.1"],
      detalle: { clase: "dotacion", inst, exige, reglas, nota },
    });
    for (const r of reglas.filter((x) => x.dependeDeConstruida)) avisoConstruida(r, inst, nombre);
  }

  /** Un aviso por conjunto de zonas medidas (el garaje, el edificio…), con todo lo que decide. */
  function avisoConstruida(r: ReglaSi4, elementoId: string, nombre: string): void {
    const clave = (r.zonas ?? []).some((z) => z.uso === "garaje") ? "garaje" : "edificio";
    const id = `construida-${clave}`;
    const previo = avisos.find((a) => a.id === id);
    if (previo) (previo.datos.que as string[]).push(nombre.toLowerCase());
    else avisos.push({ id, tipo: "supuesto", elementoId, datos: { donde: clave, que: [nombre.toLowerCase()] } });
  }
}

/** Las zonas cuya superficie construida decide una instalación, o que ya la tienen indicada. */
export function zonasConstruidaSi4(j: JustificacionSi4): ZonaSi[] {
  const out = new Map<string, ZonaSi>();
  const reglas = j.elementos.flatMap((el) => (el.detalle.clase === "dotacion" || el.detalle.clase === "hidrantes" ? el.detalle.reglas : []));
  for (const r of reglas) if (r.dependeDeConstruida) for (const z of r.zonas ?? []) out.set(z.id, z);
  for (const r of reglas) for (const z of r.zonas ?? []) if (!z.construida.supuesto && z.uso === "garaje") out.set(z.id, z);
  return [...out.values()];
}
