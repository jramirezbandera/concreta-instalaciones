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
    expect(l.map((x) => `${x.codigo}:${x.tipo}`)).toEqual([
      "HS1:revisar",
      "HS2:revisar",
      "HS2:revisar",
      "HS4:revisar",
      "HS5:revisar",
      "HS5:revisar",
      "HS6:revisar",
      "SI1:revisar",
      "SI1:revisar",
      "SI3:revisar",
      "SI3:revisar",
      "SI4:revisar",
      "SI6:revisar",
      "SUA2:revisar",
      "SUA3:revisar",
      "SUA4:revisar",
      "SUA8:revisar",
      "SUA8:revisar",
      "SUA9:revisar",
      "HR:revisar",
      "HR:revisar",
      "HR:revisar",
      "HE4:revisar",
      "HE4:revisar",
      "HE5:revisar",
      "HE5:revisar",
      "HE6:revisar",
      "REBT:revisar",
      "REBT:revisar",
      "REBT:revisar",
    ]);
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
        hs2: { revisados: ["dobles", "recogida"] },
        hs4: { ...j.hs4, revisados: ["presion-red-supuesta"] },
        hs5: { ...j.hs5, revisados: ["garaje-s1-bombeo", "pluviometria-supuesta"] },
        hs6: { ...j.hs6, revisados: ["nucleo-garaje"] },
        si1: { revisados: ["uso-local-z2", "cuarto-z6"] },
        si3: { revisados: ["recorrido", "recorrido-garaje"] },
        si4: { revisados: ["construida-garaje"] },
        si6: { revisados: ["sector-sotano"] },
        sua2: { revisados: ["garaje-altura"] },
        sua3: { revisados: ["cierrapuertas"] },
        sua4: { revisados: ["cuarto-sin-tipo"] },
        sua8: { revisados: ["ng-supuesto", "local-comercial"] },
        sua9: { revisados: ["viviendas-accesibles"] },
        he4: { revisados: ["perdidas", "scop"] },
        he5: { revisados: ["construida", "mixto"] },
        he6: { revisados: ["mixto"] },
        rebt: { revisados: ["ascensor-supuesto", "servicios", "humo"] },
        hr: { revisados: ["huecos", "ld", "local"] },
      },
    };
    expect(antesDeEntregar(q)).toEqual([]);
  });
});

describe("entregables", () => {
  it("el Demo: todo listo", () => {
    expect(entregables(demo())).toEqual({
      memoria: { listos: 27, total: 27, noCumplen: [] },
      fichas: { listos: 25, total: 25, noCumplen: [] },
      esquemas: { listos: 2, total: 2, noCumplen: [], claves: ["hs5", "hs4"] },
    });
  });

  it("lo que no cumple no cuenta como listo", () => {
    expect(entregables(conHs4Fallando())).toEqual({
      memoria: { listos: 26, total: 27, noCumplen: ["HS4"] },
      fichas: { listos: 24, total: 25, noCumplen: ["HS4"] },
      esquemas: { listos: 1, total: 2, noCumplen: ["HS4"], claves: ["hs5"] },
    });
  });
});

describe("memoriaCte", () => {
  it("los apartados en el orden del registry, sin nada pendiente", () => {
    const m = memoriaCte(demo());
    expect(m.apartados.map((a) => `${a.codigo}:${a.tipo}`)).toEqual([
      "HS1:redactado",
      "HS2:redactado",
      "HS3:redactado",
      "HS4:redactado",
      "HS5:redactado",
      "HS6:redactado",
      "SI1:redactado",
      "SI2:redactado",
      "SI3:redactado",
      "SI4:redactado",
      "SI5:redactado",
      "SI6:redactado",
      "SUA1:redactado",
      "SUA2:redactado",
      "SUA3:redactado",
      "SUA4:redactado",
      "SUA5:no_aplica",
      "SUA6:no_aplica",
      "SUA7:redactado",
      "SUA8:redactado",
      "SUA9:redactado",
      "HR:redactado",
      "HE1:redactado",
      "HE0:externo",
      "HE4:redactado",
      "HE5:redactado",
      "HE6:redactado",
      "REBT:redactado",
      "DB-SE:externo",
    ]);
    expect(m.apartados[4].encabezado).toBe("DB-HS 5 · Evacuación de aguas");
    expect(m.apartados[1].encabezado).toBe("DB-HS 2 · Recogida y evacuación de residuos");
    expect(m.apartados[0].encabezado).toBe("DB-HS 1 · Protección frente a la humedad");
    // Desde feature-25 (HR) no queda ningún apartado por redactar.
    expect(m.pendientes).toEqual([]);
    expect(m.apartados.find((a) => a.key === "he4")!.encabezado).toBe("DB-HE 4 · Contribución mínima de energía renovable para ACS");
    expect(m.apartados.find((a) => a.key === "rebt")!.encabezado).toBe("REBT ITC-BT-10 · Grado de electrificación y previsión de cargas");
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
      "Seguridad en caso de incendio (DB-SI)",
      "Utilización y accesibilidad (DB-SUA)",
      "Ruido (DB-HR)",
      "Ahorro de energía (DB-HE)",
      "Electricidad (REBT)",
      "Externas",
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
