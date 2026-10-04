// =============================================================================
// DB-HS6 — La justificación entera (feature-15, HS6): qué toca el terreno según
// El edificio y las medidas de cada parte, con el contrato de resultado de
// REDISENO-V4 §3.2. PURA y DETERMINISTA; no redacta.
//
// La herramienta PROPONE la protección: la barrera se especifica por lo que pide
// el DB a la lámina tipo (espesor ≥ 2 mm y difusión < 1e-11 m²/s), sin inventar
// un producto; el garaje es el espacio de contención si está debajo; lo que apoya
// en el terreno lleva cámara ventilada o despresurización.
// =============================================================================

import type { Aviso, ElementoResultado } from "../../lib/cte/resultado";
import type { Edificio, UsoZona } from "../../lib/edificio/tipos";
import type { Veredicto } from "../../lib/pdf/renderFicha";
import type { Hs6Estado } from "./estado";
import { proteccionDe, type ProteccionHs6, type SobreNoHabitable, type SobreTerreno } from "./proteccion";
import { nivelReferenciaRadon_Bq_m3, parametrosBarrera, parametrosEspacioContencion, type ZonaRadon } from "./tablas";

export type DetalleHs6 =
  | { clase: "zona"; zona: ZonaRadon; municipio: string; nivelReferencia_Bq_m3: number }
  | {
      clase: "barrera";
      /** Dónde va: bajo el sótano, en el forjado de la PB, sobre la cámara… */
      donde: ("solera_sotano" | "forjado_pb" | "terreno" | "sotano_habitable")[];
      via: "lamina_tipo" | "calculo";
      espesorMin_mm: number;
      coefLimite_m2_s: number;
    }
  | { clase: "contencion_garaje"; parte: SobreNoHabitable; criterio: boolean }
  | { clase: "camara"; partes: SobreTerreno[]; aberturas_cm2: number; distanciaMax_m: number }
  | { clase: "despresurizacion"; partes: SobreTerreno[] }
  | { clase: "nucleo" }
  | { clase: "no_tocan"; niveles: number[]; usos: UsoZona[] };

export interface ElementoHs6 extends ElementoResultado {
  nombre: string;
  detalle: DetalleHs6;
}

export interface JustificacionHs6 {
  proteccion: ProteccionHs6;
  municipio: string;
  elementos: ElementoHs6[];
  avisos: Aviso[];
  veredicto: Veredicto;
}

export function justificarHs6(estado: Hs6Estado, edificio: Edificio): JustificacionHs6 {
  const zona = estado.zona;
  const pr = proteccionDe(edificio, zona, estado);
  const d = pr.decisiones;
  const elementos: ElementoHs6[] = [];
  const avisos: Aviso[] = [];
  const municipio = estado.municipio?.trim() ?? "";

  elementos.push({
    id: "zona",
    nombre: "Zona de radón",
    tipo: "dato",
    veredicto: "dato",
    valor: { texto: zona === "sin_exigencia" ? "Sin exigencia" : zona },
    manda: { tipo: "dato_de_partida", fuente: "Apéndice B, consultado por el proyectista" },
    cita: ["HS 6 · ap. 2 y ap. 3 pto 1", "apéndice B"],
    detalle: { clase: "zona", zona, municipio, nivelReferencia_Bq_m3: nivelReferenciaRadon_Bq_m3() },
  });

  if (pr.aplica) {
    const zonaII = zona === "II";
    const conBarrera = zonaII || d.medidaTerreno === "barrera";
    const pb = parametrosBarrera();

    // ── Barrera ────────────────────────────────────────────────────────────
    if (conBarrera) {
      const donde: ("solera_sotano" | "forjado_pb" | "terreno" | "sotano_habitable")[] = [];
      if (pr.sobreNoHabitable) donde.push(d.posicionBarrera === "solera" ? "solera_sotano" : "forjado_pb");
      for (const t of pr.sobreTerreno) donde.push(t.nivel < 0 ? "sotano_habitable" : "terreno");
      elementos.push({
        id: "barrera",
        nombre: "Barrera de protección",
        tipo: "barrera",
        veredicto: d.viaBarrera === "calculo" ? "fuera" : "ok",
        valor: d.viaBarrera === "calculo" ? { texto: "Por cálculo" } : { valor: pb.espesorMin_mm, unidad: "mm" },
        limite: { valor: pb.espesorMin_mm, unidad: "mm" },
        manda:
          d.viaBarrera === "calculo"
            ? { tipo: "decision_proyectista", decision: "calculo" }
            : { tipo: "formula", formula: "lámina tipo", resultado: { valor: pb.coefDifusionLimite_m2_s, unidad: "m²/s" } },
        cita: d.viaBarrera === "calculo" ? ["HS 6 · ap. 3.1.2"] : ["HS 6 · ap. 3.1.1", "ap. 5.1.1"],
        detalle: {
          clase: "barrera",
          donde,
          via: d.viaBarrera,
          espesorMin_mm: pb.espesorMin_mm,
          coefLimite_m2_s: pb.coefDifusionLimite_m2_s,
        },
      });
    }

    // ── El garaje (o el sótano no habitable), espacio de contención ────────
    if (pr.sobreNoHabitable && (zonaII || d.medidaTerreno === "camara")) {
      elementos.push({
        id: "contencion-garaje",
        nombre: pr.sobreNoHabitable.conGaraje ? "El garaje, espacio de contención" : "El sótano, espacio de contención",
        tipo: "espacio_contencion",
        veredicto: zonaII ? "ok" : "criterio",
        valor: { texto: pr.sobreNoHabitable.conGaraje ? "Garaje" : "Sótano" },
        manda: { tipo: "decision_proyectista", decision: "local_no_habitable" },
        cita: zonaII ? ["HS 6 · ap. 3.2 ptos 1 y 5"] : ["HS 6 · ap. 3 pto 1 (protección análoga)", "ap. 3.2 pto 5"],
        detalle: { clase: "contencion_garaje", parte: pr.sobreNoHabitable, criterio: !zonaII },
      });
    }

    // ── Lo que apoya en el terreno: cámara o despresurización ─────────────
    if (pr.sobreTerreno.length > 0 && d.medidaTerreno === "camara") {
      const pe = parametrosEspacioContencion();
      elementos.push({
        id: "camara",
        nombre: "Cámara ventilada",
        tipo: "espacio_contencion",
        veredicto: "ok",
        valor: { valor: pr.aberturasCamara_cm2 ?? 0, unidad: "cm²" },
        manda: {
          tipo: "formula",
          formula: "10 cm² por metro de perímetro",
          resultado: { valor: pr.aberturasCamara_cm2 ?? 0, unidad: "cm²" },
        },
        cita: ["HS 6 · ap. 3.2 ptos 1 a 4"],
        detalle: {
          clase: "camara",
          partes: pr.sobreTerreno,
          aberturas_cm2: pr.aberturasCamara_cm2 ?? 0,
          distanciaMax_m: pe.distanciaMaxAAbertura_m,
        },
      });
    }
    if (pr.sobreTerreno.length > 0 && d.medidaTerreno === "despresurizacion") {
      elementos.push({
        id: "despresurizacion",
        nombre: "Despresurización del terreno",
        tipo: "despresurizacion",
        veredicto: "ok",
        valor: { texto: "Captación" },
        manda: { tipo: "decision_proyectista", decision: "despresurizacion" },
        cita: ["HS 6 · ap. 3.3", "ap. 5.1.4"],
        detalle: { clase: "despresurizacion", partes: pr.sobreTerreno },
      });
    }

    // ── El núcleo que comunica el garaje con lo habitable ─────────────────
    // Importa si el garaje es el espacio de contención (el cerramiento que lo
    // separa de lo habitable no puede tener discontinuidades) o si la barrera va
    // en el forjado de la planta baja (el núcleo la atraviesa).
    const garajeContencion = elementos.some((e) => e.id === "contencion-garaje");
    const barreraEnForjado = conBarrera && pr.sobreNoHabitable !== null && d.posicionBarrera === "forjado";
    if (pr.nucleo && (garajeContencion || barreraEnForjado)) {
      elementos.push({
        id: "nucleo",
        nombre: "Escalera y ascensor",
        tipo: "nucleo",
        veredicto: "ok",
        valor: { texto: "Núcleo" },
        manda: { tipo: "decision_proyectista", decision: "nucleo" },
        cita: ["HS 6 · ap. 3 pto 1 y ap. 3.1.1 pto 3 c"],
        detalle: { clase: "nucleo" },
      });
      avisos.push({ id: "nucleo-garaje", tipo: "caso_especial", elementoId: "nucleo", datos: { posicion: d.posicionBarrera } });
    }
  }

  // ── Lo que no toca el terreno ─────────────────────────────────────────────
  if (pr.noTocan.niveles.length > 0 && zona !== "sin_exigencia") {
    elementos.push({
      id: "no-tocan",
      nombre: "Plantas altas",
      tipo: "fuera",
      veredicto: "dato",
      valor: { texto: "Sin contacto" },
      manda: { tipo: "decision_proyectista", decision: "no_tocan" },
      cita: ["HS 6 · ap. 1 pto 2"],
      detalle: { clase: "no_tocan", niveles: pr.noTocan.niveles, usos: pr.noTocan.usos },
    });
  }

  let veredicto: Veredicto = "ok";
  if (elementos.some((e) => e.veredicto === "fail")) veredicto = "fail";

  return { proteccion: pr, municipio, elementos, avisos, veredicto };
}
