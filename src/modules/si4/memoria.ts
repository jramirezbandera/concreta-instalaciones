// =============================================================================
// DB-SI, SI 4 — La memoria redactada (feature-19): la dotación de la tabla 1.1,
// lo que se exige con su porqué y lo que no, y la señalización. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import { ENGINE_VERSION } from "../../lib/version";
import type { DetalleSi4, JustificacionSi4 } from "./justificacion";

function parrafoExtintores(d: Extract<DetalleSi4, { clase: "extintores" }>): Trozo[] {
  if (d.total === 0) {
    return ["El interior de la vivienda no es origen de evacuación, por lo que no se requieren extintores portátiles conforme a la tabla 1.1 de SI 4."];
  }
  const out: Trozo[] = ["Se disponen extintores portátiles de eficacia ", { v: "21A-113B" }, " de modo que el recorrido hasta alguno de ellos, desde todo origen de evacuación, no excede de 15 m en cada planta"];
  if (d.plantas.length > 0) out.push(` (${listaY(d.plantas.map((p) => p.etiqueta))})`);
  if (d.locales.length > 0) out.push(", y uno en el exterior de cada local de riesgo especial, próximo a su puerta de acceso, con los necesarios en su interior para que el recorrido no exceda de 15 m");
  out.push(" (SI 4, tabla 1.1 y su nota 1). Su parte superior queda entre 80 y 120 cm sobre el suelo (RD 513/2017).");
  return out;
}

export function memoriaSi4(j: JustificacionSi4): MemoriaDoc {
  const parrafos: Trozo[][] = [];
  const no: string[] = [];
  for (const el of j.elementos) {
    const d = el.detalle;
    if (d.clase === "extintores") parrafos.push(parrafoExtintores(d));
    if (d.clase === "dotacion") {
      if (d.exige) {
        const reglas = d.reglas.filter((r) => r.exige);
        parrafos.push([`Se dispone `, { v: el.nombre.toLowerCase() }, ` ${listaY([...new Set(reglas.map((r) => r.donde))])}, por exigirlo la tabla 1.1 (${reglas.map((r) => `${r.regla.toLowerCase()}: ${r.valor}`).join("; ")})${d.inst === "bie" ? ", con equipos de 25 mm" : ""}.`]);
      } else if (d.nota) {
        parrafos.push([d.nota]);
      } else {
        no.push(el.nombre.toLowerCase());
      }
    }
    if (d.clase === "hidrantes") {
      if (d.exige) {
        parrafos.push([
          `Se requiere${d.numero > 1 ? "n" : ""} `,
          { v: `${d.numero} hidrante${d.numero > 1 ? "s" : ""} exterior${d.numero > 1 ? "es" : ""}` },
          d.publico ? ", que se cubre con el hidrante de la vía pública situado a menos de 100 m de la fachada accesible del edificio (tabla 1.1, nota 3)." : " del proyecto, que puede conectarse a la red pública de abastecimiento (tabla 1.1, nota 3).",
        ]);
      } else {
        no.push("hidrantes exteriores");
      }
    }
    if (d.clase === "local") {
      parrafos.push(["El local sin actividad definida se dotará de las instalaciones que correspondan a su uso en el proyecto de su actividad."]);
    }
  }
  if (no.length > 0) parrafos.push([`Conforme a la tabla 1.1, no se requieren ${listaY(no)}.`]);
  parrafos.push([
    "La señalización de las instalaciones manuales de protección contra incendios cumple el Reglamento de instalaciones de protección contra incendios (RD 513/2017), Anexo I, sección 2.ª (SI 4, ap. 2).",
  ]);
  return {
    titulo: "Instalaciones de protección contra incendios",
    norma: "DB-SI 4",
    parrafos,
    fuente: ["DB-SI · SI 4 (consolidado 4-mar-2025)", "tabla 1.1", "datos de El edificio", `motor ${ENGINE_VERSION}`].join(" · "),
  };
}
