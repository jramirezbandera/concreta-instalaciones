// =============================================================================
// DB-HE1 — La memoria redactada (feature-15, HE1): el texto que el proyectista
// copia a su memoria justificativa. Se redacta solo a partir de la
// justificación: se revisa, no se edita. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "../../lib/cte/presentacion";
import { listaY } from "../../lib/cte/redaccion";
import { fmt } from "../../lib/units/format";
import { ENGINE_VERSION } from "../../lib/version";
import { MATERIALES_CEC } from "../../lib/constructivo/materiales";
import { citaCec, designacionEnFrase } from "../../lib/constructivo/textos";
import { MARCOS } from "../../lib/constructivo/tipos";
import { aislanteDe, claseDe, nombresProtegidos, rangoNiveles, VIDRIOS, type RolCerramiento } from "./envolvente";
import { cerramientoDe, fachadaHe1De, rolesDe, ventanaHe1De, type JustificacionHe1 } from "./justificacion";
import { lugar, montajeEnTexto } from "./textos";

function n0(v: number): string {
  return fmt(v, undefined, 0);
}
function n1(v: number): string {
  return fmt(v, undefined, 1);
}
function n2(v: number): string {
  return Number.isFinite(v) ? v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
}

function cumple(u: number, lim: number | null): string {
  return lim === null ? "" : ` ${u <= lim ? "≤" : ">"} ${n2(lim)}`;
}

/** «marco de PVC de tres cámaras», «marco de madera de 500 kg/m³», «marco metálico sin RPT». */
function marcoEnTexto(nombre: string): string {
  const m = nombre.startsWith("PVC") ? nombre : nombre[0].toLowerCase() + nombre.slice(1);
  return m.startsWith("metálico") ? `marco ${m}` : `marco de ${m}`;
}

/** «forjado unidireccional, bovedilla de hormigón, 30 cm», «losa maciza de hormigón armado 20 cm». */
function forjadoEnTexto(nombre: string): string {
  const n = nombre[0].toLowerCase() + nombre.slice(1);
  return n.startsWith("losa") ? n : `forjado ${n}`;
}

/** «lana mineral», pero «XPS». */
function aislanteEnTexto(nombre: string): string {
  return nombre === nombre.toUpperCase() ? nombre : nombre.toLowerCase();
}

function linea(j: JustificacionHe1, rol: RolCerramiento): Trozo[] {
  const el = cerramientoDe(j, rol);
  const r = el.detalle.r;
  const d = j.propuesta.decisiones;
  const u: Trozo = { v: `${n2(r.u_W_m2K)} W/m²K` };
  switch (claseDe(rol)) {
    case "fachada": {
      const f = fachadaHe1De(j, rol);
      const donde = rol === "fachada-pb" ? " de la planta baja" : "";
      return [
        `– Fachada${donde}: ${designacionEnFrase(f.sol)}, con ${MATERIALES_CEC[f.sol.aislante].nombre} de `,
        { v: `${aislanteDe(d, rol as "fachada" | "fachada-pb")} mm` },
        ": U = ",
        u,
        `${cumple(r.u_W_m2K, r.ulim_W_m2K)}.`,
      ];
    }
    case "cubierta": {
      const t = j.propuesta.tipos;
      return [
        `– Cubierta: ${designacionEnFrase(t.cubierta)}${montajeEnTexto(j) ? `, ${montajeEnTexto(j)}` : ""}, con ${forjadoEnTexto(t.forjado.nombre)} (${citaCec(t.forjado)}) y XPS de `,
        { v: `${d.aislanteCubierta_mm} mm` },
        ": U = ",
        u,
        `${cumple(r.u_W_m2K, r.ulim_W_m2K)}.`,
      ];
    }
    case "suelo": {
      const s = el.detalle.suelo!;
      const que =
        s.tipo === "local"
          ? s.particion
            ? "sobre el local sin uso, partición entre unidades de distinto uso (tabla 3.2),"
            : "sobre el local sin uso, tratado como espacio no habitable,"
          : s.tipo === "garaje"
            ? "sobre el garaje, espacio no habitable,"
            : s.tipo === "no_habitable"
              ? "sobre el sótano no habitable,"
              : s.tipo === "zona_comun"
                ? "sobre el portal, partición con zona común (tabla 3.2),"
                : "sanitario sobre cámara ventilada, espacio no habitable,";
      return [`– Forjado de ${rangoNiveles([j.propuesta.envolvente.niveles[0] ?? 0])} ${que} con ${aislanteEnTexto(el.detalle.aislante?.nombre ?? "aislante")} de `, { v: `${d.aislanteSuelo_mm} mm` }, " bajo el forjado: U = ", u, `${cumple(r.u_W_m2K, r.ulim_W_m2K)}.`];
    }
    case "ventanas": {
      const h = r.hueco!;
      const v = ventanaHe1De(j, rol);
      const donde = rol === "ventanas-pb" ? " de la planta baja" : "";
      return [
        `– Ventanas${donde}: ${designacionEnFrase(v.sol)}, con ${marcoEnTexto(MARCOS[v.marco].nombre)} y vidrio ${VIDRIOS[d.vidrio].tipo} (Ug ${n1(h.ug_W_m2K)}, Uf ${n1(h.uf_W_m2K)}, Ψ ${n2(h.psi_W_mK)}, fracción de marco ${n0(h.fraccionMarco * 100)} %): UH = `,
        { v: `${n2(r.u_W_m2K)} W/m²K` },
        `${cumple(r.u_W_m2K, r.ulim_W_m2K)}.`,
      ];
    }
  }
}

export function memoriaHe1(j: JustificacionHe1): MemoriaDoc {
  const env = j.propuesta.envolvente;
  const donde = lugar(j);
  const sup = j.elementos.find((e) => e.id === "superficial");
  const condensan = j.avisos.filter((a) => a.id.startsWith("intersticial-")).map((a) => String(a.datos.rol));
  const c = j.clima;

  const p1: Trozo[] = [
    `Se ha comprobado la transmitancia de los elementos de la envolvente térmica de ${nombresProtegidos(env.usos) === "vivienda" ? "la vivienda" : `las ${nombresProtegidos(env.usos)}`} (${rangoNiveles(env.niveles)}) frente a los valores límite de la sección HE 1 del DB-HE para la `,
    { v: `zona climática ${j.zona}` },
    ` de invierno${donde ? ` (${donde})` : ""}:`,
  ];
  const condensacion: Trozo[] = [
    sup && "valor" in sup.valor
      ? `Como comprobación complementaria (DA DB-HE/2), el factor de temperatura de la superficie interior de los cerramientos opacos es como mínimo ${n2(sup.valor.valor)}, ${sup.veredicto === "ok" ? "superior" : "inferior"} al mínimo de ${n2(sup.limite?.valor ?? 0)}. `
      : "",
    c
      ? `La condensación intersticial se comprueba por el método de Glaser en el mes de enero, con ${n1(c.temp_C)} °C y ${n0(c.hr_pct)} % en el exterior (DA DB-HE/2, tabla C.1${c.corregido ? ", corregida por altitud" : ""}) y 20 °C y ${n0(j.resultado.hrInterior_pct)} % en el interior: `
      : `La condensación intersticial se comprueba por el método de Glaser en el mes de enero, a falta del clima de la obra con ${n0(j.resultado.tempExteriorEnero_C)} °C y ${n0(j.resultado.hrExterior_pct)} % en el exterior (lado seguro): `,
    condensan.length === 0
      ? "no se producen."
      : `puede haberlas en ${listaY(condensan.map((r) => (r === "suelo" ? "el forjado" : r === "fachada-pb" ? "la fachada de la planta baja" : `la ${r}`)))}, y se justifica aparte el balance anual de evaporación.`,
  ];
  return {
    titulo: "Envolvente térmica",
    norma: "DB-HE 1",
    parrafos: [
      p1,
      ...rolesDe(j.propuesta).map((rol) => linea(j, rol)),
      condensacion,
      [
        "Esta comprobación es un predimensionado por elementos. El coeficiente global de transmisión y el control solar se justifican con la herramienta oficial, que se adjunta como documento independiente.",
      ],
    ],
    fuente: [
      "DB-HE (RD 732/2019, consolidado 14-06-2022)",
      "HE 1 tablas 3.1.1.a y 3.2",
      "DA DB-HE/1 (ene. 2020) y DA DB-HE/2 (oct. 2013)",
      "λ, µ, Ug y Uf orientativos del Catálogo de Elementos Constructivos",
      "datos de El edificio",
      `motor ${ENGINE_VERSION}`,
    ].join(" · "),
  };
}
