// =============================================================================
// DB-HS1 — Textos de la justificación (feature-17): la frase de la cabecera,
// «lo que manda» y las cuentas de la franja, las etiquetas del dibujo y de la
// lista, los avisos y lo que no cumple. Funciones PURAS, en español.
// =============================================================================

import type { DetalleElemento, EstadoPresentacion } from "../../lib/cte/presentacion";
import { listaY, mayuscula } from "../../lib/cte/redaccion";
import type { Aviso } from "../../lib/cte/resultado";
import { formatoCota } from "../../lib/edificio/derivar";
import { fmt } from "../../lib/units/format";
import { CONDICIONES, codigos, type ElementoCondiciones } from "./condiciones";
import { NOMBRE_PROTECCION, type CubiertaHs1 } from "./cubierta";
import type { ImpermeabilizacionMuro, IntervencionTerreno, TipoMuro, TipoSuelo } from "./decisiones";
import { ESPESOR_SUELO_CRITERIO_m } from "./partes";
import { MARGEN_UMBRAL_m, PETO_CRITERIO_m, type DetalleHs1, type ElementoHs1, type JustificacionHs1 } from "./justificacion";
import { CARPINTERIA_GRADO_5, CANALETAS_TABLA_3_3, PENDIENTES_CUBIERTA_INCLINADA_TABLA_2_10 } from "./tablas";
import type { ClaseKs, NivelFreatico } from "./tipos";

// -----------------------------------------------------------------------------
// Nombres
// -----------------------------------------------------------------------------

export const NOMBRE_MURO: Record<TipoMuro, string> = {
  flexorresistente: "muro flexorresistente",
  gravedad: "muro de gravedad",
  pantalla: "muro pantalla",
};

export const NOMBRE_IMPER: Record<ImpermeabilizacionMuro, string> = {
  exterior: "impermeabilizado por el exterior",
  interior: "impermeabilizado por el interior",
  parcialmente_estanco: "parcialmente estanco",
};

export const NOMBRE_SUELO: Record<TipoSuelo, string> = {
  solera: "solera",
  placa: "placa",
  elevado: "suelo elevado",
};

export const NOMBRE_INTERVENCION: Record<IntervencionTerreno, string> = {
  sin_intervencion: "sin intervención en el terreno",
  sub_base: "con sub-base",
  inyecciones: "con inyecciones",
};

export const NOMBRE_KS: Record<ClaseKs, string> = {
  alto: "Ks ≥ 10⁻² cm/s",
  medio: "10⁻⁵ < Ks < 10⁻² cm/s",
  bajo: "Ks ≤ 10⁻⁵ cm/s",
};

const NOMBRE_TIPO_CUBIERTA: Record<CubiertaHs1["tipo"], string> = {
  plana_transitable: "plana transitable",
  plana_no_transitable: "plana no transitable",
  inclinada: "inclinada",
};

function n1(v: number): string {
  return fmt(v, undefined, 1);
}

function n0(v: number): string {
  return fmt(v, undefined, 0);
}

function m2d(v: number): string {
  return fmt(v, "m", 2);
}

/** «−8,00» o «no detectado». */
export function textoFreatico(f: NivelFreatico | null): string {
  if (!f) return "sin indicar";
  if (f.tipo === "no_detectado") {
    return f.reconocimiento_m !== undefined && Number.isFinite(f.reconocimiento_m)
      ? `no detectado hasta ${n1(f.reconocimiento_m)} m`
      : "no detectado";
  }
  return formatoCota(-f.profundidad_m);
}

/** «la solución cumple», la descripción de la solución de un muro o un suelo. */
export function solucionMuro(tipo: TipoMuro, imper: ImpermeabilizacionMuro): string {
  return `${NOMBRE_MURO[tipo]} ${NOMBRE_IMPER[imper]}`;
}

export function solucionSuelo(tipo: TipoSuelo, intervencion: IntervencionTerreno): string {
  return `${NOMBRE_SUELO[tipo]} ${NOMBRE_INTERVENCION[intervencion]}`;
}

/** «una solera sin intervención…», «un suelo elevado…». */
export function unaSolucionSuelo(tipo: TipoSuelo, intervencion: IntervencionTerreno): string {
  return `${tipo === "elevado" ? "un" : "una"} ${solucionSuelo(tipo, intervencion)}`;
}

export function solucionCubierta(c: CubiertaHs1): string {
  if (c.plana) {
    return `${NOMBRE_TIPO_CUBIERTA[c.tipo]}${c.proteccion === "lamina_autoprotegida" ? "" : c.invertida ? ", invertida" : ", convencional"}, con ${NOMBRE_PROTECCION[c.proteccion!].toLowerCase()}`;
  }
  return `inclinada de ${c.tejado!.pieza.toLowerCase()}${c.impermeabilizacion ? ", con impermeabilización bajo el tejado" : ""}`;
}

/** La pendiente de la cubierta: «del 1 al 5 %», «mayor que el 30 %». */
export function textoPendiente(c: CubiertaHs1): string | null {
  const p = c.pendiente;
  if (!p) return null;
  return p.estricta ? `mayor que el ${n0(p.min_pct)} %` : `del ${n0(p.min_pct)} al ${n0(p.max_pct ?? 0)} %`;
}

/** Las condiciones de un elemento, cortas: «I2+I3+D1+D5»; muchas, «9 condiciones». */
function condicionesCortas(c: readonly string[]): string {
  if (c.length === 0) return "sin condiciones";
  return c.length > 4 ? `${c.length} condiciones` : codigos(c);
}

function filasCondiciones(c: readonly string[], el: ElementoCondiciones): { k: string; v: string }[] {
  if (c.length === 0) return [{ k: "Condiciones", v: "ninguna (casilla en blanco)" }];
  return c.map((cod) => {
    const t = CONDICIONES[el][cod];
    return { k: cod, v: t ? `${t.corto}${t.siAplica ? ` · ${t.siAplica}` : ""}` : cod };
  });
}

// -----------------------------------------------------------------------------
// Lo corto
// -----------------------------------------------------------------------------

export function valorCorto(el: ElementoHs1): string {
  const det = el.detalle;
  switch (det.clase) {
    case "terreno":
      return det.presencia.valor;
    case "muro":
    case "suelo":
    case "fachada":
      return `Grado ${det.grado}`;
    case "cubierta":
      return "texto" in el.valor ? el.valor.texto : "";
    case "dren":
      return `Ø${n0(det.dn_mm)}`;
    case "canaletas":
      return n0(det.sumideros);
    case "bombeo":
      return "2 bombas";
  }
}

export function textoEtiqueta(el: ElementoHs1): string {
  const det = el.detalle;
  switch (det.clase) {
    case "terreno":
      return `presencia ${det.presencia.valor}${det.presencia.supuesto ? " (supuesta)" : ""}`;
    case "muro":
    case "suelo":
      return det.condiciones === null ? `grado ${det.grado} · no vale` : `grado ${det.grado} · ${condicionesCortas(det.condiciones)}`;
    case "fachada":
      return det.cumple ? `grado ${det.grado} · ${condicionesCortas(det.condiciones)}` : `grado ${det.grado} · no llega`;
    case "cubierta":
      return det.cubierta.pendiente ? `pendiente ${valorCorto(el)}` : "grado único";
    case "dren":
      return `dren Ø${n0(det.dn_mm)}`;
    case "canaletas":
      return `${n0(det.sumideros)} sumideros`;
    case "bombeo":
      return "bombeo · 2 bombas";
  }
}

export function resultadoLista(el: ElementoHs1): string {
  const det = el.detalle;
  switch (det.clase) {
    case "terreno":
      return `presencia ${det.presencia.valor}${det.presencia.supuesto ? " (supuesta)" : ""} · ${NOMBRE_KS[det.ks.valor]}${det.ks.supuesto ? " (supuesto)" : ""}`;
    case "muro":
      return det.condiciones === null
        ? `grado ${det.grado} · ${solucionMuro(det.tipo, det.imper)}: no aceptable`
        : `grado ${det.grado} · ${codigos(det.condiciones)}`;
    case "suelo":
      return det.condiciones === null
        ? `grado ${det.grado} · ${solucionSuelo(det.tipo, det.intervencion)}: no aceptable`
        : `grado ${det.grado} · ${codigos(det.condiciones)}`;
    case "fachada":
      return det.cumple ? `grado ${det.grado} · ${codigos(det.condiciones)}` : `grado ${det.grado} · falta ${codigos(det.faltan)}`;
    case "cubierta":
      return det.cubierta.pendiente ? `grado único · pendiente ${textoPendiente(det.cubierta)}` : "grado único";
    case "dren":
      return `Ø ≥ ${n0(det.dn_mm)} mm · ${n0(det.pendienteMin_permil)}–${n0(det.pendienteMax_permil)} ‰`;
    case "canaletas":
      return `${n0(det.sumideros)} sumideros de Ø ≥ ${n0(det.diametroSumidero_mm)} mm`;
    case "bombeo":
      return "cámara con 2 bombas de achique";
  }
}

// -----------------------------------------------------------------------------
// La franja
// -----------------------------------------------------------------------------

function mandaTerreno(det: Extract<DetalleHs1, { clase: "terreno" }>, donde: string): string {
  const cara = formatoCota(det.caraInferior_m);
  if (det.presencia.supuesto) {
    return `Sin el nivel freático no se sabe dónde queda la cara inferior ${donde} (${cara}) respecto a él: se supone presencia alta, del lado de la seguridad.`;
  }
  const f = det.freatico!;
  if (f.tipo === "no_detectado") {
    return `El estudio geotécnico no detecta el nivel freático: la cara inferior ${donde} (${cara}) queda por encima. Presencia baja.`;
  }
  const dl = det.delta_m ?? 0;
  if (dl < 0) return `La cara inferior ${donde} (${cara}) queda por encima del nivel freático (${textoFreatico(f)}): presencia baja.`;
  return `La cara inferior ${donde} (${cara}) queda ${m2d(dl)} por debajo del nivel freático (${textoFreatico(f)}): ${dl < 2 ? "a menos de 2 m, presencia media" : "2 m o más, presencia alta"}.`;
}

export function franjaDe(el: ElementoHs1, j: JustificacionHs1, estado: EstadoPresentacion): DetalleElemento {
  const base = { titulo: el.nombre, valor: valorCorto(el), estado, cita: el.cita.join(" · ") };
  const det = el.detalle;
  switch (det.clase) {
    case "terreno": {
      const donde = j.partes.sotanos ? "del suelo del sótano" : "del suelo de la planta baja";
      return {
        ...base,
        clase: "Punto de partida",
        unidad: "presencia de agua",
        manda: mandaTerreno(det, donde),
        nota: `La cara inferior del suelo se toma ${n1(ESPESOR_SUELO_CRITERIO_m * 100)} cm por debajo de su cota (solera y base, criterio).`,
        filas: [
          { k: "Nivel freático", v: `${textoFreatico(det.freatico)}${det.freatico?.tipo === "profundidad" ? " · medio anual" : ""}` },
          { k: "Cara inferior del suelo", v: formatoCota(det.caraInferior_m) },
          ...(det.delta_m !== null ? [{ k: "Bajo el freático", v: det.delta_m < 0 ? "no (por encima)" : m2d(det.delta_m) }] : []),
          { k: "Permeabilidad", v: `${NOMBRE_KS[det.ks.valor]}${det.ks.supuesto ? " (supuesta)" : ""}` },
        ],
      };
    }

    case "muro": {
      const sol = solucionMuro(det.tipo, det.imper);
      const filas = [
        { k: "Presencia de agua", v: det.presencia },
        { k: "Permeabilidad", v: NOMBRE_KS[det.ks] },
        { k: "Sótanos", v: n0(det.sotanos) },
      ];
      if (det.condiciones === null) {
        return {
          ...base,
          clase: "Muros en contacto con el terreno",
          titulo: mayuscula(sol),
          unidad: "no aceptable",
          manda: noAceptableMuro(det),
          nota: "El DB admite otra solución de prestaciones equivalentes (CTE Parte I, art. 5), justificada aparte.",
          filas,
        };
      }
      return {
        ...base,
        clase: "Muros en contacto con el terreno",
        titulo: mayuscula(sol),
        unidad: codigos(det.condiciones),
        manda: `La presencia de agua ${det.presencia} y la permeabilidad del terreno dan el grado ${det.grado} (tabla 2.1). Para un ${sol}, la tabla 2.2 pide ${det.condiciones.length === 0 ? "nada: la casilla está en blanco" : codigos(det.condiciones)}.`,
        nota:
          det.maxSotanos !== null
            ? `Esta solución no vale con más de ${det.maxSotanos === 1 ? "un sótano" : `${n0(det.maxSotanos)} sótanos`} (nota de la tabla 2.2).`
            : undefined,
        filas: [...filas, ...filasCondiciones(det.condiciones, "muro")],
      };
    }

    case "suelo": {
      const sol = solucionSuelo(det.tipo, det.intervencion);
      const bloque = det.bloque === "pantalla" ? "muro pantalla" : "muro flexorresistente o de gravedad";
      const filas = [
        { k: "Presencia de agua", v: det.presencia },
        { k: "Permeabilidad", v: NOMBRE_KS[det.ks] },
        { k: "Bloque de la tabla 2.4", v: bloque },
        { k: "Superficie", v: fmt(det.suelo.superficie_m2, "m²", 0) },
      ];
      const nota = det.sinMuro
        ? "Sin muro en contacto con el terreno se usa el bloque de muro flexorresistente o de gravedad (comentario del Ministerio). Si parte de la planta baja queda bajo el terreno exterior, ese tramo es muro."
        : undefined;
      if (det.condiciones === null) {
        return {
          ...base,
          clase: "Suelo en contacto con el terreno",
          titulo: mayuscula(sol),
          unidad: "no aceptable",
          manda: noAceptableSuelo(det),
          nota: "El DB admite otra solución de prestaciones equivalentes (CTE Parte I, art. 5), justificada aparte.",
          filas,
        };
      }
      return {
        ...base,
        clase: "Suelo en contacto con el terreno",
        titulo: mayuscula(sol),
        unidad: codigos(det.condiciones),
        manda: `La presencia de agua ${det.presencia} y la permeabilidad del terreno dan el grado ${det.grado} (tabla 2.3). Para ${unaSolucionSuelo(det.tipo, det.intervencion)}, la tabla 2.4 pide ${det.condiciones.length === 0 ? "nada: la casilla está en blanco" : codigos(det.condiciones)}.`,
        nota,
        filas: [...filas, ...filasCondiciones(det.condiciones, "suelo")],
      };
    }

    case "fachada": {
      const sup = (s: boolean, k: "zona" | "eolica" | "entorno") => (!s ? "" : det.influyen.includes(k) ? " (supuesta)" : " · no influye");
      return {
        ...base,
        clase: det.rol === "fachada-pb" ? "Fachada de la planta baja" : "Fachadas",
        titulo: det.sol.nombre,
        unidad: det.cumple ? codigos(det.condiciones) : `falta ${codigos(det.faltan)}`,
        manda: `La zona pluviométrica ${det.zona.valor} y la exposición al viento ${det.exposicion} dan el grado ${det.grado} (tabla 2.5). La exposición sale de la altura de coronación, ${n1(det.altura_m)} m, ${det.eolica.supuesto && !det.influyen.includes("eolica") ? `y el entorno ${det.entorno.valor} (tabla 2.6); a esta altura la zona eólica no influye.` : `el entorno ${det.entorno.valor} y la zona eólica ${det.eolica.valor} (tabla 2.6).`}`,
        nota:
          det.grado === CARPINTERIA_GRADO_5.datos.grado
            ? "Con grado 5 y la carpintería retranqueada: precerco y barrera impermeable en las jambas, 10 cm hacia el interior (ap. 2.3.3.6)."
            : "Una condición de número mayor del mismo bloque sustituye a la de número menor (ap. 2.3.2).",
        filas: [
          { k: "Zona pluviométrica", v: `${det.zona.valor}${sup(det.zona.supuesto, "zona")}` },
          { k: "Altura de coronación", v: `${n1(det.altura_m)} m (${det.filaAltura})` },
          { k: "Zona eólica", v: det.eolica.supuesto && !det.influyen.includes("eolica") ? "sin indicar · no influye" : `${det.eolica.valor}${sup(det.eolica.supuesto, "eolica")}` },
          { k: "Entorno", v: `${det.entorno.valor}${det.terrenoTipo ? ` · terreno tipo ${det.terrenoTipo}` : ""}${sup(det.entorno.supuesto, "entorno")}` },
          { k: "Exposición al viento", v: det.exposicion },
          { k: "Tipo", v: `CEC ${det.sol.codigo}, p. ${det.sol.pagina} · El edificio` },
          {
            k: "Lo que aporta",
            v: `${det.columna === "con_revestimiento" ? `revestimiento R${det.niveles.R}` : "sin revestimiento"} · ${det.niveles.B > 0 ? `B${det.niveles.B}` : "sin barrera"}${det.hidrofilo ? " (aislante hidrófilo)" : ""} · C${det.niveles.C} · ${det.unaHoja ? "una hoja" : "dos hojas"}`,
          },
          ...(det.cumple
            ? [
                ...(det.gradoOpcion > det.grado ? [{ k: "Combinación", v: `la del grado ${det.gradoOpcion}, que vale para el ${det.grado}` }] : []),
                ...filasCondiciones(det.condiciones, "fachada"),
              ]
            : [{ k: "No llega", v: `falta ${codigos(det.faltan)} (tabla 2.7)` }]),
          ...(det.hojaUnicaAplicada ? [{ k: "Una sola hoja", v: "C1 pasa a C2 (nota de la tabla 2.7)" }] : []),
          ...(det.cec ? [{ k: "Contraste CEC", v: `con ${det.cec.clave}, grado ${det.cec.grado}; por la tabla 2.7, ${det.gradoMax}` }] : []),
        ],
      };
    }

    case "cubierta": {
      const c = det.cubierta;
      const exigidas = c.capas.filter((x) => x.exigida);
      return {
        ...base,
        clase: "Cubierta",
        titulo: `Cubierta ${solucionCubierta(c)}`,
        valor: c.pendiente ? (c.pendiente.estricta ? `> ${n0(c.pendiente.min_pct)} %` : `${n0(c.pendiente.min_pct)}–${n0(c.pendiente.max_pct ?? 0)} %`) : "Grado único",
        unidad: c.pendiente ? "de pendiente" : undefined,
        manda: c.pendiente
          ? `El grado de impermeabilidad de la cubierta es único: lo alcanza cualquier solución con los elementos de 2.4.2. La pendiente, por la ${c.pendiente.tabla.toLowerCase()} (${c.pendiente.por.toLowerCase()}).`
          : "El grado de impermeabilidad de la cubierta es único: lo alcanza cualquier solución con los elementos de 2.4.2. Con impermeabilización bajo el tejado, la tabla 2.10 no obliga.",
        nota:
          c.tejado?.nota3
            ? `Las pendientes de la teja valen para faldones de menos de ${fmt(PENDIENTES_CUBIERTA_INCLINADA_TABLA_2_10.datos.faldonMaxNota3_m, "m", 1)}; si no, las de UNE 136020 o UNE 127100.`
            : c.ajardinadaCriterio
              ? "La ajardinada es un uso aparte en la tabla 2.9; aquí se trata con la cubierta no transitable (criterio)."
              : undefined,
        filas: exigidas.map((x) => ({ k: `${x.letra})`, v: x.elemento })),
      };
    }

    case "dren": {
      const titulo = det.donde === "muro" ? (j.partes.muro ? "Tubo drenante en el arranque del muro" : "Tubo drenante en la cimentación perimetral") : "Tubos drenantes bajo el suelo";
      return {
        ...base,
        clase: "Dimensionado",
        titulo,
        unidad: "mm nominal",
        manda: `Lo pide${det.por.length > 1 ? "n" : ""} ${listaY(det.por)}. Con grado ${det.grado}, la tabla 3.1 da un diámetro nominal mínimo de ${n0(det.dn_mm)} mm ${det.donde === "muro" ? "en el perímetro del muro" : "bajo el suelo"}.`,
        nota: "Rodeado de árido y envuelto en lámina filtrante: recubrimiento ≥ 1,5 Ø con árido de aluvión, ≥ 3 Ø de machaqueo (ap. 5.1.1.6).",
        filas: [
          { k: "Pendiente", v: `${n0(det.pendienteMin_permil)}–${n0(det.pendienteMax_permil)} ‰` },
          { k: "Orificios", v: `≥ ${n0(det.orificios_cm2_m)} cm²/m (tabla 3.2)` },
        ],
      };
    }

    case "canaletas":
      return {
        ...base,
        clase: "Dimensionado",
        titulo: "Canaletas de recogida en la cámara del muro",
        unidad: "sumideros",
        manda: `Lo pide D4 del muro parcialmente estanco. Con grado ${det.grado}, un sumidero cada ${n0(det.m2PorSumidero)} m² de muro (tabla 3.3): ${n0(det.superficieMuro_m2)} m² de muro.`,
        nota: "La superficie de muro sale del perímetro de una planta cuadrada de la superficie del sótano (criterio).",
        filas: [
          { k: "Sumideros", v: `Ø ≥ ${n0(CANALETAS_TABLA_3_3.datos.sumideroDiametroMin_mm)} mm` },
          { k: "Pendiente", v: `${n0(det.pendienteMin_pct)}–${n0(det.pendienteMax_pct)} %` },
        ],
      };

    case "bombeo": {
      const manda = det.siempre
        ? "Los pozos drenantes se vacían con dos bombas de achique: el DB las pide siempre."
        : det.cotaAlcantarillado_m === null
          ? `El drenaje queda a ${formatoCota(det.cotaDrenaje_m)}; sin la cota del alcantarillado se supone que la conexión queda por encima.`
          : `El drenaje (${formatoCota(det.cotaDrenaje_m)}) queda por debajo de la acometida al alcantarillado (${formatoCota(det.cotaAlcantarillado_m)}): no desagua por gravedad.`;
      return {
        ...base,
        clase: "Dimensionado",
        titulo: "Cámara de bombeo del drenaje",
        unidad: "de achique",
        manda,
        nota: "Cada bomba, para el caudal total del drenaje (apéndice C en muros); el volumen de la cámara, por la tabla 3.4 con ese caudal.",
        filas: [
          { k: "Lo piden", v: det.por.join(" · ") },
          ...(det.pozosMuro > 0 ? [{ k: "Pozos junto al muro", v: `${n0(det.pozosMuro)} · Ø ≥ 0,7 m · cada ≤ 50 m` }] : []),
          ...(det.pozosSuelo > 0 ? [{ k: "Pozos bajo el suelo", v: `${n0(det.pozosSuelo)} · Ø ≥ 70 cm · 1 cada 800 m²` }] : []),
          { k: "Volumen de la cámara", v: "tabla 3.4 · de 2,4 m³ (0,15 l/s) a 20 m³ (3,1 l/s)" },
        ],
      };
    }
  }
}

function noAceptableMuro(det: Extract<DetalleHs1, { clase: "muro" }>): string {
  const sol = solucionMuro(det.tipo, det.imper);
  const porque =
    det.motivo === "sotanos"
      ? `con ${n0(det.sotanos)} sótanos (la tabla 2.2 la limita a ${det.maxSotanos === 1 ? "uno" : n0(det.maxSotanos ?? 0)})`
      : `con grado ${det.grado} (casilla sombreada de la tabla 2.2)`;
  const arreglo = det.arreglo ? ` Vale un ${solucionMuro(det.arreglo.tipo, det.arreglo.imper)}.` : "";
  return `La tabla 2.2 no admite un ${sol} ${porque}.${arreglo}`;
}

function noAceptableSuelo(det: Extract<DetalleHs1, { clase: "suelo" }>): string {
  const arreglo = det.arreglo ? ` Vale ${unaSolucionSuelo(det.arreglo.tipo, det.arreglo.intervencion)}.` : "";
  return `La tabla 2.4 no admite ${unaSolucionSuelo(det.tipo, det.intervencion)} con grado ${det.grado} (casilla sombreada).${arreglo}`;
}

/** Lo que no cumple, para La obra y los avisos a lo ancho; null si cumple. */
export function textoIncumplimiento(el: ElementoHs1): { titulo: string; detalle: string } | null {
  const det = el.detalle;
  if (det.clase === "muro" && det.condiciones === null) {
    return { titulo: `${mayuscula(solucionMuro(det.tipo, det.imper))}: no vale con grado ${det.grado}.`, detalle: noAceptableMuro(det) };
  }
  if (det.clase === "suelo" && det.condiciones === null) {
    return { titulo: `${mayuscula(solucionSuelo(det.tipo, det.intervencion))}: no vale con grado ${det.grado}.`, detalle: noAceptableSuelo(det) };
  }
  if (det.clase === "fachada" && !det.cumple) {
    const falta = det.faltan.map((c) => `${c} (${CONDICIONES.fachada[c]?.corto.toLowerCase() ?? c})`).join(" y ");
    return {
      titulo: `${det.rol === "fachada-pb" ? "La fachada de la planta baja" : "La fachada"} no llega al grado ${det.grado}.`,
      detalle:
        det.arreglo === "habitual"
          ? `${det.sol.nombre} (CEC ${det.sol.codigo}) con lo declarado: falta ${falta}. Con lo propuesto, sí cumple.`
          : `${det.sol.nombre} (CEC ${det.sol.codigo}) no llega ni declarando lo máximo: falta ${falta}. Elige otra fachada en El edificio.`,
    };
  }
  return null;
}

// -----------------------------------------------------------------------------
// La frase, las métricas y los avisos
// -----------------------------------------------------------------------------

export function fraseHs1(j: JustificacionHs1): string {
  const fallo = j.elementos.find((e) => e.veredicto === "fail");
  if (fallo) {
    const t = textoIncumplimiento(fallo);
    if (t) return t.detalle;
  }
  // «Grado 1 en los muros del sótano, 2 en el suelo del sótano y 5 en las fachadas.»
  const partes: string[] = [];
  for (const e of j.elementos) {
    const d = e.detalle;
    if (d.clase === "muro" || d.clase === "suelo") {
      partes.push(`${partes.length === 0 ? "grado " : ""}${d.grado} en ${d.clase === "muro" ? "los" : "el"} ${e.nombre.toLowerCase()}`);
    }
    if (d.clase === "fachada" && d.rol === "fachada") partes.push(`${partes.length === 0 ? "grado " : ""}${d.grado} en las fachadas`);
  }
  const c = j.cubierta;
  const pend = textoPendiente(c);
  const cubierta = `La cubierta tiene grado único${pend ? `, con pendiente ${pend}` : ""}.`;
  return `${mayuscula(listaY(partes))}. ${cubierta}`;
}

export function metricasHs1(j: JustificacionHs1): string {
  const xs: string[] = [];
  for (const e of j.elementos) {
    const d = e.detalle;
    if (d.clase === "muro") xs.push(`muro G${d.grado}`);
    if (d.clase === "suelo") xs.push(`suelo G${d.grado}`);
    if (d.clase === "fachada" && d.rol === "fachada") xs.push(`fachada G${d.grado}`);
  }
  return [...new Set(xs)].join(" · ");
}

export interface TextoAviso {
  titulo: string;
  detalle: string;
}

const NOMBRE_FALTA: Record<string, string> = {
  zona: "zona pluviométrica I",
  eolica: "zona eólica C",
  entorno: "entorno E0",
};

export function textoAviso(a: Aviso): TextoAviso {
  switch (a.id) {
    case "freatico-supuesto":
      return {
        titulo: "Falta el nivel freático: se ha supuesto presencia de agua alta.",
        detalle:
          "Sin el estudio geotécnico, los grados de muros y suelos se calculan del lado de la seguridad. Indica el nivel freático (valor medio anual) en Datos de la obra.",
      };
    case "freatico-reconocimiento": {
      const r = a.datos.reconocimiento_m as number | null;
      const cara = formatoCota(a.datos.caraInferior_m as number);
      return {
        titulo: "El freático no se detectó, pero no consta que el reconocimiento llegara a la cota del suelo.",
        detalle: `Se toma presencia baja. Solo vale si el reconocimiento llegó más hondo que la cara inferior del suelo (${cara})${r !== null ? `; llegó a ${n1(r)} m` : ""}.`,
      };
    }
    case "freatico-umbral":
      return {
        titulo: `La cara inferior del suelo queda a menos de ${n0(MARGEN_UMBRAL_m * 100)} cm de un límite de presencia de agua.`,
        detalle: `Con ${n0(ESPESOR_SUELO_CRITERIO_m * 100)} cm de solera y base supuestos, la presencia de agua podría cambiar de clase. Compruébalo con el espesor real del suelo.`,
      };
    case "ks-supuesto":
      return {
        titulo: "Falta la permeabilidad del terreno: se ha supuesto Ks ≥ 10⁻² cm/s.",
        detalle: "Es la columna más desfavorable de las tablas 2.1 y 2.3. Indica el coeficiente del estudio geotécnico en Datos de la obra.",
      };
    case "suelo-sin-muro": {
      const cs = (a.datos.condiciones as string[]).filter((c) => ["I2", "S1", "S3", "P1", "P2", "D3"].includes(c));
      return {
        titulo: "El suelo, sin muro, pide condiciones que nombran el muro.",
        detalle: `${listaY(cs)} se aplican a la cimentación perimetral: zapata corrida, viga riostra o murete (criterio).`,
      };
    }
    case "suelo-elevado":
      return {
        titulo: "Comprueba que el suelo es elevado.",
        detalle: "Lo es si la superficie de contacto con el terreno más la de apoyo es menor que 1/7 de la superficie del suelo (Apéndice A).",
      };
    case "alcantarillado-supuesto":
      return {
        titulo: "Falta la cota del alcantarillado: se supone que el drenaje se bombea.",
        detalle: "Sin la cota de la acometida no se sabe si el drenaje desagua por gravedad. Indícala en Datos de la obra.",
      };
    case "clima-supuesto": {
      const faltan = (a.datos.faltan as string[]).map((f) => NOMBRE_FALTA[f] ?? f);
      return {
        titulo: `Faltan datos del clima: se ha supuesto ${listaY(faltan)}.`,
        detalle: "Son los más desfavorables de las tablas 2.5 y 2.6. Léelos en las figuras 2.4 y 2.5 del DB y ponlos en Datos de la obra.",
      };
    }
    case "altura-100":
      return {
        titulo: "Más de 100 m de altura: fuera de la tabla 2.6.",
        detalle: "La exposición al viento se estudia según el DB SE-AE; aquí se ha tomado la última fila de la tabla.",
      };
    default:
      if (a.id.startsWith("cec-")) {
        return {
          titulo: `El Catálogo da a ${String(a.datos.codigo)} un grado menor que la tabla 2.7.`,
          detalle: `Con ${String(a.datos.clave)}, el CEC le da grado ${String(a.datos.cec)}; por sus rasgos y la tabla 2.7 llega a ${String(a.datos.gradoMax)}, y el exigido es ${String(a.datos.grado)}. Manda el DB-HS1: el grado del Catálogo es solo un contraste (criterio). Revisa la sección si hay dudas.`,
        };
      }
      return textoAvisoResto(a);
  }
}

function textoAvisoResto(a: Aviso): TextoAviso {
  switch (a.id) {
    case "coronacion-peto":
      return {
        titulo: "Un peto podría cambiar la exposición al viento.",
        detalle: `La altura de coronación se toma en la cara superior del forjado de cubierta (${n1(a.datos.altura_m as number)} m); con un peto de ${fmt(PETO_CRITERIO_m, "m", 2)} pasaría de ${n0(a.datos.limite_m as number)} m y la exposición cambiaría.`,
      };
    default:
      return { titulo: "Revisa la protección frente a la humedad.", detalle: "" };
  }
}

/** Los avisos que llevan a Datos de la obra. */
export const AVISOS_A_DATOS_OBRA: ReadonlySet<string> = new Set([
  "freatico-supuesto",
  "freatico-reconocimiento",
  "ks-supuesto",
  "alcantarillado-supuesto",
  "clima-supuesto",
]);

export function describirSeccionHs1(j: JustificacionHs1): string {
  return [
    "Sección del edificio con su envolvente: fachadas y cubierta frente a la lluvia, muros y suelos frente al agua del terreno.",
    fraseHs1(j),
    ...j.elementos.map((e) => `${e.nombre}: ${resultadoLista(e)}.`),
  ].join(" ");
}
