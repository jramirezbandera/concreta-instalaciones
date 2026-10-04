import { describe, expect, it } from "vitest";
import { crearProyectoDemo } from "../../proyecto/demo";
import type { Proyecto } from "../../proyecto/tipos";
import { antesDeEntregar, entregables } from "../entrega";
import { bloquesMemoria, memoriaCte, textoPlanoMemoriaCte } from "../memoria";

// =============================================================================
// «Antes de entregar», los entregables y la memoria CTE (feature-16 §C–§E).
// =============================================================================

const demo = (): Proyecto => crearProyectoDemo("2026-10-04T10:00:00.000Z");

/** El Demo con la red a 60 kPa: HS4 no cumple. */
function conHs4Fallando(): Proyecto {
  const p = demo();
  return { ...p, datosGenerales: { ...p.datosGenerales, presionAcometida_kPa: 60 } };
}

describe("antesDeEntregar", () => {
  it("el Demo: los avisos sin revisar, en el orden del registry", () => {
    const l = antesDeEntregar(demo());
    expect(l.map((x) => `${x.codigo}:${x.tipo}`)).toEqual(["HS1:revisar", "HS4:revisar", "HS5:revisar", "HS5:revisar", "HS6:revisar"]);
    expect(l[0]).toMatchObject({ id: "hs1:clima-supuesto", ruta: "hs/humedad" });
    expect(l[0].detalle.length).toBeGreaterThan(10);
  });

  it("lo que no cumple va primero", () => {
    const l = antesDeEntregar(conHs4Fallando());
    expect(l[0]).toMatchObject({ codigo: "HS4", tipo: "no_cumple" });
    expect(l.filter((x) => x.tipo === "no_cumple").every((x, i) => l[i] === x)).toBe(true);
  });

  it("revisado todo, no queda nada", () => {
    const p = demo();
    const j = p.justificaciones;
    const q: Proyecto = {
      ...p,
      justificaciones: {
        ...j,
        hs1: { ...j.hs1, revisados: ["clima-supuesto"] },
        hs4: { ...j.hs4, revisados: ["presion-red-supuesta"] },
        hs5: { ...j.hs5, revisados: ["garaje-s1-bombeo", "pluviometria-supuesta"] },
        hs6: { ...j.hs6, revisados: ["nucleo-garaje"] },
      },
    };
    expect(antesDeEntregar(q)).toEqual([]);
  });
});

describe("entregables", () => {
  it("el Demo: todo listo", () => {
    expect(entregables(demo())).toEqual({
      memoria: { listos: 7, total: 7, noCumplen: [] },
      fichas: { listos: 6, total: 6, noCumplen: [] },
      esquemas: { listos: 2, total: 2, noCumplen: [], claves: ["hs5", "hs4"] },
    });
  });

  it("lo que no cumple no cuenta como listo", () => {
    expect(entregables(conHs4Fallando())).toEqual({
      memoria: { listos: 6, total: 7, noCumplen: ["HS4"] },
      fichas: { listos: 5, total: 6, noCumplen: ["HS4"] },
      esquemas: { listos: 1, total: 2, noCumplen: ["HS4"], claves: ["hs5"] },
    });
  });
});

describe("memoriaCte", () => {
  it("los apartados en el orden del registry y lo pendiente al final", () => {
    const m = memoriaCte(demo());
    expect(m.apartados.map((a) => `${a.codigo}:${a.tipo}`)).toEqual([
      "HS1:redactado",
      "HS3:redactado",
      "HS4:redactado",
      "HS5:redactado",
      "HS6:redactado",
      "SUA6:no_aplica",
      "HE1:redactado",
      "HE0:externo",
      "DB-SE:externo",
    ]);
    expect(m.apartados[3].encabezado).toBe("DB-HS 5 · Evacuación de aguas");
    expect(m.apartados[0].encabezado).toBe("DB-HS 1 · Protección frente a la humedad");
    expect(m.pendientes.map((x) => x.codigo)).toContain("HS2");
    expect(m.pendientes.map((x) => x.codigo)).not.toContain("HS1");
    expect(m.pendientes).toHaveLength(16);
  });

  it("lo que no cumple sale como pendiente, sin su texto", () => {
    const m = memoriaCte(conHs4Fallando());
    const hs4 = m.apartados.find((a) => a.key === "hs4")!;
    expect(hs4.tipo).toBe("no_cumple");
    const b = bloquesMemoria(m, "4 oct 2026");
    const i = b.findIndex((x) => x.tipo === "titulo" && x.texto === "DB-HS 4 · Suministro de agua");
    expect(b[i + 1].tipo).toBe("pendiente");
    // Un motivo por línea —los que enseña HS4— y ni una frase de su memoria.
    const j = b.findIndex((x, k) => k > i && x.tipo === "titulo");
    const motivos = b.slice(i + 2, j);
    expect(motivos.length).toBe(hs4.tipo === "no_cumple" ? hs4.motivos.length : -1);
    expect(motivos.every((x) => x.tipo === "parrafo" && x.texto.startsWith("– "))).toBe(true);
    expect(motivos.map((x) => (x.tipo === "parrafo" ? x.texto : ""))).toContain("– No llega presión a las plantas 1, 2 y 3.");
  });

  it("bloques: título, grupos por DB y el párrafo del «no aplica» con su cita", () => {
    const b = bloquesMemoria(memoriaCte(demo()), "4 oct 2026");
    expect(b[0]).toEqual({ tipo: "titulo", nivel: 1, texto: "Memoria CTE de instalaciones" });
    expect(b[1]).toEqual({ tipo: "parrafo", texto: "Demo — Vivienda C/ Mayor 12 · 4 oct 2026" });
    expect(b.flatMap((x) => (x.tipo === "titulo" && x.nivel === 2 ? [x.texto] : []))).toEqual([
      "Salubridad (DB-HS)",
      "Utilización y accesibilidad (DB-SUA)",
      "Ahorro de energía (DB-HE)",
      "Externas",
      "Apartados pendientes",
    ]);
    expect(b.some((x) => x.tipo === "nota" && x.texto === "DB-SUA 6, ámbito de aplicación")).toBe(true);
    expect(b.some((x) => x.tipo === "tabla")).toBe(true);
  });

  it("el texto plano lleva todo, con las tablas por tabuladores", () => {
    const t = textoPlanoMemoriaCte(memoriaCte(demo()), "4 oct 2026");
    expect(t).toMatch(/^Memoria CTE de instalaciones\n\n/);
    expect(t).toContain("SUA 6 Seguridad frente al riesgo de ahogamiento");
    expect(t).toContain("Se justifica con HULC. Pendiente de adjuntar el documento.");
    expect(t).toContain("\t");
  });
});
