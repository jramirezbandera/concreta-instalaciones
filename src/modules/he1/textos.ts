// =============================================================================
// DB-HE1 — Textos de la justificación (feature-15, HE1): la frase de la cabecera,
// «lo que manda» y las cuentas de la franja, las etiquetas del dibujo y la
// lista, los avisos y los incumplimientos con el cambio que los arregla.
// Funciones PURAS.
// =============================================================================

import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import { listaY, mayuscula } from "../../lib/cte/redaccion";
import type { Aviso } from "../../lib/cte/resultado";
import { fmt } from "../../lib/units/format";
import { nombresProtegidos, rangoNiveles, VENTANA_TIPO, VIDRIOS, type DecisionesEfectivasHe1, type RolCerramiento } from "./envolvente";
import type { He1Estado } from "./estado";
import { cerramientoDe, type ElementoHe1, type JustificacionHe1 } from "./justificacion";

function n0(v: number): string {
  return fmt(v, undefined, 0);
}
function n1(v: number): string {
  return fmt(v, undefined, 1);
}
function n2(v: number): string {
  return Number.isFinite(v) ? v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
}

const CLASE: Record<DecisionesEfectivasHe1["higrometria"], string> = {
  clase_3_o_inferior: "clase ≤ 3",
  clase_4: "clase 4",
  clase_5: "clase 5",
};

const NOMBRE_ROL: Record<RolCerramiento, string> = {
  fachada: "la fachada",
  cubierta: "la cubierta",
  suelo: "el forjado",
  ventanas: "las ventanas",
};

/** «Cáceres, 459 m». */
export function lugar(j: JustificacionHe1): string {
  const quien = j.municipio || j.clima?.provincia || "";
  if (!quien) return "";
  return j.clima ? `${quien}, ${n0(j.clima.altitud_m)} m` : quien;
}

// -----------------------------------------------------------------------------
// Lo corto
// -----------------------------------------------------------------------------

export function valorCorto(el: ElementoHe1): string {
  if ("texto" in el.valor) return el.valor.texto;
  return n2(el.valor.valor);
}

export function textoEtiqueta(el: ElementoHe1): string {
  switch (el.detalle.clase) {
    case "cerramiento":
      return `${el.id === "ventanas" ? "UH" : "U"} ${valorCorto(el)} W/m²K`;
    case "superficial":
      return `fRsi ${valorCorto(el)}`;
    case "intersticial":
      return "Glaser";
    case "hulc":
      return "HULC";
  }
}

/** «ladrillo + XPS 60», «plana invertida · XPS 100», «EPS 60», «PVC · bajo emisivo». */
export function composicionCorta(j: JustificacionHe1, rol: RolCerramiento): string {
  const d = j.propuesta.decisiones;
  switch (rol) {
    case "fachada":
      return `ladrillo + XPS ${d.aislanteFachada_mm}`;
    case "cubierta":
      return `${j.propuesta.envolvente.cubierta === "inclinada" ? "inclinada" : "plana invertida"} · XPS ${d.aislanteCubierta_mm}`;
    case "suelo":
      return `${cerramientoDe(j, "suelo").detalle.aislante?.nombre ?? "aislante"} ${d.aislanteSuelo_mm} bajo el forjado`;
    case "ventanas":
      return `PVC · ${VIDRIOS[d.vidrio].corto}`;
  }
}

export function resultadoLista(el: ElementoHe1): string {
  const det = el.detalle;
  switch (det.clase) {
    case "cerramiento": {
      const lim = det.r.ulim_W_m2K;
      return lim === null ? n2(det.r.u_W_m2K) : `${n2(det.r.u_W_m2K)} ${det.r.cumpleU ? "≤" : ">"} ${n2(lim)}`;
    }
    case "superficial":
      return "valor" in el.valor ? `fRsi ${n2(el.valor.valor)} ${el.veredicto === "ok" ? "≥" : "<"} ${n2(det.fRsiMin)}` : "no procede";
    case "intersticial": {
      const c = det.filas.filter((f) => f.condensa === true);
      return c.length === 0 ? "no hay" : `posible en ${listaY(c.map((f) => NOMBRE_ROL[f.id]))}`;
    }
    case "hulc":
      return "HULC";
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

function filasCondensacion(j: JustificacionHe1, rol: RolCerramiento): { k: string; v: string }[] {
  const r = cerramientoDe(j, rol).detalle.r;
  return [
    {
      k: "Condensación superficial",
      v: r.fRsiAplica ? `fRsi ${n2(r.fRsi)} ${r.cumpleFRsi ? "≥" : "<"} ${n2(r.fRsiMin)}` : "no se comprueba",
    },
    { k: "Condensación intersticial", v: !r.glaserAplica ? "no procede" : r.glaser.condensaIntersticial ? "posible · revisar" : "no hay · Glaser" },
  ];
}

export function franjaDe(el: ElementoHe1, j: JustificacionHe1, estado: EstadoPresentacion): DetalleElemento {
  const base = { titulo: el.nombre, valor: valorCorto(el), estado, cita: el.cita.join(" · ") };
  const det = el.detalle;
  const z = j.zona;
  const d = j.propuesta.decisiones;

  switch (det.clase) {
    case "cerramiento": {
      const r = det.r;
      const lim = r.ulim_W_m2K;
      const unidad = lim === null ? "W/m²K" : `≤ ${n2(lim)} W/m²K`;
      const limite = { k: `Límite · zona ${z}`, v: lim === null ? "—" : `${n2(lim)} W/m²K` };
      const a = det.aislante;
      const desde = a?.minimo_mm != null ? ` Cumple desde ${a.minimo_mm} mm.` : "";
      const porFRsi =
        det.manda?.por === "fRsi"
          ? ` Con la humedad interior de ${CLASE[d.higrometria]}, manda la condensación superficial: U ≤ ${n2(det.manda.u)}.`
          : "";

      if (det.rol === "fachada") {
        return {
          ...base,
          clase: "Fachada · muro",
          titulo: "½ pie de ladrillo, XPS, cámara y tabique",
          unidad,
          manda: `El aislante: con ${a?.espesor_mm ?? 0} mm se lleva el ${n0((a?.parteR ?? 0) * 100)} % de la resistencia del muro.${desde}${porFRsi}`,
          filas: [
            limite,
            { k: "Cara interior en enero", v: `${n1(r.glaser.temperatura_C[0] ?? 20)} °C` },
            ...filasCondensacion(j, "fachada"),
          ],
          nota: "λ orientativos del Catálogo de Elementos Constructivos: en proyecto, los del fabricante.",
        };
      }
      if (det.rol === "cubierta") {
        const inclinada = j.propuesta.envolvente.cubierta === "inclinada";
        return {
          ...base,
          clase: "Cubierta",
          titulo: inclinada ? "Cubierta inclinada" : "Cubierta plana invertida",
          unidad,
          manda: `El aislante: XPS de ${a?.espesor_mm ?? 0} mm ${inclinada ? "sobre el forjado, bajo la teja" : "sobre la impermeabilización"}.${desde}${porFRsi}`,
          filas: [limite, ...filasCondensacion(j, "cubierta")],
        };
      }
      if (det.rol === "suelo") {
        const s = det.suelo!;
        let manda: string;
        if (s.tipo === "local") {
          manda = s.particion
            ? `Cómo se trata el local. Como otra unidad de uso, el forjado es una partición entre usos distintos: límite ${n2(lim ?? 0)}.`
            : `Cómo se trata el local. Como espacio no habitable, el forjado es envolvente: límite ${n2(lim ?? 0)}.`;
        } else if (s.tipo === "garaje") {
          manda = `El garaje es un espacio no habitable: el forjado es envolvente, con el límite de UT, ${n2(lim ?? 0)}.`;
        } else if (s.tipo === "no_habitable") {
          manda = `El sótano es un espacio no habitable: el forjado es envolvente, con el límite de UT, ${n2(lim ?? 0)}.`;
        } else if (s.tipo === "zona_comun") {
          manda = `Entre lo que se protege y el portal hay una partición con zona común: límite ${n2(lim ?? 0)} (tabla 3.2).`;
        } else {
          manda = `Sobre una cámara sanitaria, el forjado da a un espacio no habitable: límite de UT, ${n2(lim ?? 0)}.`;
        }
        const filas = [{ k: "Aislante", v: `${a?.nombre ?? "Aislante"} ${a?.espesor_mm ?? 0} mm bajo el forjado` }];
        if (s.otroLimite !== null) {
          filas.push({ k: "Con el otro criterio", v: `${n2(r.u_W_m2K)} ${r.u_W_m2K <= s.otroLimite ? "≤" : ">"} ${n2(s.otroLimite)}` });
        }
        if (!s.particion) filas.push({ k: "Coeficiente b", v: "1 · lado seguro" });
        filas.push({ k: "Condensación superficial", v: "no se comprueba · escasa producción de vapor" });
        return {
          ...base,
          clase: "Suelo de la envolvente",
          unidad,
          manda,
          filas,
        };
      }
      // Ventanas
      const h = r.hueco!;
      const v = VIDRIOS[d.vidrio];
      const pctVidrio = n0((1 - h.fraccionMarco) * 100);
      return {
        ...base,
        clase: "Huecos",
        titulo: "Ventanas de PVC",
        unidad,
        manda:
          d.vidrio === "doble"
            ? `El vidrio: ocupa el ${pctVidrio} % del hueco y, sin capa bajo emisiva, tiene Ug ${n1(v.ug)}.`
            : `El vidrio: es el ${pctVidrio} % del hueco. Con ${v.nombre} (Ug ${n1(v.ug)}) la ventana da ${n2(h.uh_W_m2K)}.`,
        nota: "Ug y Uf orientativos del Catálogo de Elementos Constructivos: en proyecto, los del fabricante.",
        filas: [
          { k: "Vidrio", v: `${v.corto} · Ug ${n1(h.ug_W_m2K)}` },
          { k: "Marco", v: `PVC tres cámaras · Uf ${n1(h.uf_W_m2K)} · ${n0(h.fraccionMarco * 100)} %` },
          { k: "Junta vidrio-marco", v: `Ψ ${n2(h.psi_W_mK)} · ${n1(h.lg_m)} m` },
          { k: "Ventana tipo", v: `${n2(VENTANA_TIPO.ancho_m)} × ${n2(VENTANA_TIPO.alto_m)} · dos hojas` },
        ],
      };
    }

    case "superficial":
      return {
        ...base,
        clase: "Condensación superficial",
        titulo: "Comprobación complementaria (DA DB-HE/2)",
        unidad: `≥ ${n2(det.fRsiMin)}`,
        manda: `La humedad interior: con ${CLASE[d.higrometria]} (20 °C y ${n0(j.resultado.hrInterior_pct)} %), fRsi,min es ${n2(det.fRsiMin)} en zona ${z}.`,
        nota: "El DB-HE 2019 solo cuantifica la condensación intersticial; esta es la del DA DB-HE/2.",
        filas: det.filas.map((f) => ({
          k: mayuscula(cerramientoDe(j, f.id).nombre),
          v: f.fRsi === null ? (f.id === "ventanas" ? "no procede" : "no se comprueba") : `${n2(f.fRsi)}`,
        })),
      };

    case "intersticial": {
      const c = j.clima;
      return {
        ...base,
        clase: "Condensación intersticial",
        titulo: "Glaser · mes de enero",
        manda: c
          ? `El clima de enero: ${c.provincia} a ${n1(c.temp_C)} °C y ${n0(c.hr_pct)} % (tabla C.1), frente a 20 °C y ${n0(j.resultado.hrInterior_pct)} % dentro.`
          : `Sin el clima de enero de la obra, se supone ${n0(j.resultado.tempExteriorEnero_C)} °C y ${n0(j.resultado.hrExterior_pct)} % (lado seguro).`,
        nota: c?.corregido
          ? `Corregido por altitud: −1 °C cada 100 m sobre la capital (${n0(c.altitudCapital_m)} m), con la misma humedad absoluta.`
          : undefined,
        filas: det.filas.map((f) => ({
          k: mayuscula(cerramientoDe(j, f.id).nombre),
          v: f.condensa === null ? "no procede" : f.condensa ? "posible · revisar" : "no condensa",
        })),
      };
    }

    case "hulc":
      return {
        ...base,
        clase: "Fuera de este módulo",
        titulo: "Coeficiente global y control solar",
        manda: "Se comprueban con la herramienta oficial, que se adjunta aparte.",
        filas: [
          { k: "K global", v: "HULC" },
          { k: "q sol;jul", v: "HULC" },
        ],
      };
  }
}

// -----------------------------------------------------------------------------
// La frase, las métricas, los avisos y los incumplimientos
// -----------------------------------------------------------------------------

export function fraseHe1(j: JustificacionHe1): string {
  const cers = j.elementos.filter((e) => e.detalle.clase === "cerramiento");
  const malos = cers.filter((e) => e.veredicto === "fail");
  const sup = j.elementos.find((e) => e.id === "superficial");
  const condensa = j.avisos.some((a) => a.id.startsWith("intersticial-"));
  if (malos.length === 0 && sup?.veredicto !== "fail") {
    return `Todos los elementos de la envolvente están por debajo de los límites de zona ${j.zona}${condensa ? ", pero hay que revisar una posible condensación intersticial" : " y no hay condensaciones"}. El coeficiente global se justifica con HULC.`;
  }
  const buenos = cers.filter((e) => e.veredicto === "ok").map((e) => (e.id === "suelo" ? e.nombre.toLowerCase() : e.nombre.toLowerCase()));
  const partes: string[] = [];
  if (buenos.length > 0) partes.push(`${mayuscula(listaY(buenos))} ${buenos.length === 1 && !buenos[0].endsWith("s") ? "cumple" : "cumplen"}.`);
  for (const e of malos) {
    if (e.id === "ventanas") {
      partes.push(
        j.propuesta.decisiones.vidrio === "doble"
          ? `Las ventanas no: con vidrio sin capa bajo emisiva pasan del límite de zona ${j.zona}.`
          : `Las ventanas no: con ${VIDRIOS[j.propuesta.decisiones.vidrio].corto} pasan del límite de zona ${j.zona}.`,
      );
    } else if (e.id === "fachada") {
      partes.push(`La fachada no, con ${j.propuesta.decisiones.aislanteFachada_mm} mm de aislante.`);
    } else {
      partes.push(`${mayuscula(NOMBRE_ROL[e.id as RolCerramiento])} no: U ${valorCorto(e)} pasa del límite.`);
    }
  }
  if (malos.length === 0 && sup?.veredicto === "fail") {
    partes.push(`La condensación superficial no: con ${CLASE[j.propuesta.decisiones.higrometria]} el aislante se queda corto.`);
  }
  partes.push("Arriba tienes el cambio que lo arregla.");
  return partes.join(" ");
}

export function metricasHe1(j: JustificacionHe1): string {
  return `${j.elementos.filter((e) => e.detalle.clase === "cerramiento").length} cerramientos · zona ${j.zona}`;
}

/** «viviendas P1–P3 · interior 20 °C». */
export function descripcionEnvolvente(j: JustificacionHe1): string {
  const env = j.propuesta.envolvente;
  return `${nombresProtegidos(env.usos)} ${rangoNiveles(env.niveles)} · interior ${n0(j.resultado.tempInterior_C)} °C`;
}

export interface TextoAviso {
  titulo: string;
  detalle: string;
}

export function textoAviso(a: Aviso, j: JustificacionHe1): TextoAviso {
  if (a.id === "clima-sin-dato") {
    return {
      titulo: "Falta el clima de enero de la obra.",
      detalle: `Sin la provincia en La obra no hay datos de la tabla C.1 del DA DB-HE/2: Glaser se hace con ${n0(j.resultado.tempExteriorEnero_C)} °C y ${n0(j.resultado.hrExterior_pct)} % (lado seguro).`,
    };
  }
  if (a.id.startsWith("intersticial-")) {
    const rol = String(a.datos.rol) as RolCerramiento;
    return {
      titulo: `Puede condensar dentro de ${NOMBRE_ROL[rol]} en enero.`,
      detalle:
        "Glaser marca condensación en el mes más frío. El DB admite que la haya si se evapora a lo largo del año: hay que comprobar el balance anual (DA DB-HE/2) o poner una barrera de vapor en la cara caliente.",
    };
  }
  return { titulo: "Revisa la envolvente.", detalle: "" };
}

export interface TextoIncumplimiento {
  titulo: string;
  detalle: string;
  cambio?: { etiqueta: string; aplicar: Partial<He1Estado> };
}

/** Lo que se guarda: «habitual» si coincide con lo habitual. */
function guardar<K extends keyof DecisionesEfectivasHe1>(j: JustificacionHe1, k: K, v: DecisionesEfectivasHe1[K]): Partial<He1Estado> {
  return { [k]: v === j.propuesta.habituales[k] ? "habitual" : v } as Partial<He1Estado>;
}

const CAMPO_AISLANTE = {
  fachada: "aislanteFachada_mm",
  cubierta: "aislanteCubierta_mm",
  suelo: "aislanteSuelo_mm",
} as const;

export function textoIncumplimiento(el: ElementoHe1, j: JustificacionHe1): TextoIncumplimiento | null {
  if (el.veredicto !== "fail") return null;
  const det = el.detalle;
  if (det.clase === "cerramiento") {
    const r = det.r;
    const lim = r.ulim_W_m2K ?? 0;
    if (det.rol === "ventanas") {
      const habitual = j.propuesta.habituales.vidrio;
      const otro = habitual === j.propuesta.decisiones.vidrio ? "bajo_emisivo_plus" : habitual;
      return {
        titulo: "Las ventanas no cumplen",
        detalle: `UH ${n2(r.u_W_m2K)} > ${n2(lim)}. Con vidrio ${VIDRIOS[otro].corto}, la ventana entra en el límite.`,
        cambio: { etiqueta: otro === "bajo_emisivo" ? "Cambiar a bajo emisivo" : "Cambiar a bajo emisivo + borde cálido", aplicar: guardar(j, "vidrio", otro) },
      };
    }
    const a = det.aislante;
    const nombre = el.id === "suelo" ? el.nombre : mayuscula(NOMBRE_ROL[det.rol]);
    const min = a?.minimo_mm ?? null;
    return {
      titulo: `${nombre} no cumple`,
      detalle: `Con ${a?.espesor_mm ?? 0} mm de ${a?.nombre ?? "aislante"}, U ${n2(r.u_W_m2K)} > ${n2(lim)}.${min !== null ? ` Cumple desde ${min} mm.` : ""}`,
      cambio: min !== null ? { etiqueta: `Poner ${min} mm`, aplicar: guardar(j, CAMPO_AISLANTE[det.rol], min) } : undefined,
    };
  }
  if (det.clase === "superficial") {
    const peor = det.filas.filter((f) => f.fRsi !== null).sort((a, b) => (a.fRsi ?? 1) - (b.fRsi ?? 1))[0];
    if (!peor || peor.id === "ventanas") return { titulo: "La condensación superficial no cumple", detalle: "" };
    const c = cerramientoDe(j, peor.id);
    const min = c.detalle.aislante?.minimo_mm ?? null;
    return {
      titulo: "La condensación superficial no cumple",
      detalle: `En ${NOMBRE_ROL[peor.id]}, fRsi ${n2(peor.fRsi ?? 0)} < ${n2(det.fRsiMin)} con ${CLASE[j.propuesta.decisiones.higrometria]}.${min !== null ? ` Cumple desde ${min} mm de aislante.` : ""}`,
      cambio:
        min !== null && peor.id !== "suelo"
          ? { etiqueta: `Poner ${min} mm`, aplicar: guardar(j, CAMPO_AISLANTE[peor.id], min) }
          : undefined,
    };
  }
  return null;
}

/** La descripción del dibujo para el lector de pantalla. */
export function describirDibujoHe1(j: JustificacionHe1, rol: RolCerramiento): string {
  const el = cerramientoDe(j, rol);
  if (rol === "ventanas") {
    const h = el.detalle.r.hueco!;
    return `Alzado de la ventana tipo de ${n2(VENTANA_TIPO.ancho_m)} por ${n2(VENTANA_TIPO.alto_m)} m, de dos hojas: el vidrio ocupa el ${n0((1 - h.fraccionMarco) * 100)} % y el marco de PVC el ${n0(h.fraccionMarco * 100)} %. UH ${n2(h.uh_W_m2K)} W/m²K, ${resultadoLista(el)}.`;
  }
  const capas = el.detalle.r.capas.map((c) => `${c.nombre} ${n0(c.espesor_m * 1000)} mm`).join(", ");
  return `Sección de ${NOMBRE_ROL[rol]} por capas, de dentro afuera: ${capas}. U ${n2(el.detalle.r.u_W_m2K)} W/m²K, ${resultadoLista(el)}.`;
}
