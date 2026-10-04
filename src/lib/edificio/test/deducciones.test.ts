import { describe, it, expect } from "vitest";
import { edificioDeCaso } from "../casos";
import { cifrasTipo, deduccionesTipo, deduccionesZona, dondeEstaTipo, loUsanZona } from "../deducciones";
import { textoCuentaPara, USOS, ORDEN_USOS } from "../usos";
import type { NucleoAseos, ViviendaTipo } from "../tipos";

// =============================================================================
// «Lo que se deduce» (feature-12 §E). Las cifras salen de tablas verificadas:
// aquí se comprueba que se leen bien y que cada una lleva su cita, no las
// tablas en sí (tienen sus propios tests).
// =============================================================================

const LOCALES = edificioDeCaso("plurifamiliar_locales");
const OFICINAS = edificioDeCaso("oficinas");

function valor(lista: { etiqueta: string; valor: string }[], etiqueta: string): string | undefined {
  return lista.find((d) => d.etiqueta.startsWith(etiqueta))?.valor;
}

describe("por tipo", () => {
  const A = LOCALES.unidades[0] as ViviendaTipo; // T3, 2 baños, 0 aseos

  it("vivienda: UD de HS5 (privado), caudal AF de HS4 y aparatos de los presets", () => {
    const c = cifrasTipo(A);
    // 2 baños agrupados (7 UD) + cocina (3 + 3 + 3) = 23 UD
    expect(c.ud).toBe(23);
    // baño: 0,1 + 0,1 + 0,3 + 0,1 = 0,6 ×2; cocina 0,2 + 0,15 + 0,2 = 0,55
    expect(c.caudalAF_dm3_s).toBeCloseTo(1.75, 6);
    expect(c.aparatos).toBe(11);
    expect(c.aire_l_s).toBeGreaterThan(0);
  });

  it("núcleo de aseos: uso público", () => {
    const N = OFICINAS.unidades[0] as NucleoAseos; // 4 inodoros, 4 lavabos
    const c = cifrasTipo(N);
    expect(c.ud).toBe(4 * 5 + 4 * 2);
    expect(c.caudalAF_dm3_s).toBeCloseTo(0.8, 6);
    expect(c.aire_l_s).toBeUndefined();
  });

  it("electrificación: básica hasta 160 m² útiles, elevada por encima", () => {
    expect(valor(deduccionesTipo(A), "Electrificación")).toBe("básica · 5750 W");
    expect(valor(deduccionesTipo({ ...A, superficieUtil_m2: 170 }), "Electrificación")).toBe(
      "elevada · 9200 W",
    );
  });

  it("cada cifra numérica lleva su cita", () => {
    for (const d of deduccionesTipo(A)) if (d.etiqueta !== "Aparatos") expect(d.cita, d.etiqueta).toBeTruthy();
  });

  it("dónde está", () => {
    expect(dondeEstaTipo(LOCALES, A)).toEqual({ donde: "P1–P3", cuantas: "3 viviendas" });
    expect(dondeEstaTipo(OFICINAS, OFICINAS.unidades[0]).cuantas).toBe("2 núcleos");
    // La unifamiliar no reparte unidades: su tipo es la vivienda, en sus plantas.
    const uni = edificioDeCaso("unifamiliar");
    expect(dondeEstaTipo(uni, uni.unidades[0]!)).toEqual({ donde: "P1, PB", cuantas: "1 vivienda" });
  });
});

describe("por zona", () => {
  it("viviendas: total, superficie de las viviendas, ocupación (20 m²/p) y UD por planta", () => {
    const d = deduccionesZona(LOCALES, "z1");
    expect(valor(d, "Su superficie cuenta para")).toBe("SI · REBT");
    expect(valor(d, "Viviendas")).toBe("6 (2 por planta)");
    expect(valor(d, "Superficie de las viviendas")).toBe("158 m²");
    expect(valor(d, "Ocupación")).toBe("8 personas");
    expect(valor(d, "Encima")).toBe("Cubierta");
    expect(valor(d, "Debajo")).toBe("PB: Local sin uso, Portal y escalera");
  });

  it("garaje: 120 l/s por plaza (HS3 tabla 2.2) y 40 m²/persona en residencial", () => {
    const d = deduccionesZona(LOCALES, "z4");
    expect(valor(d, "Ventilación")).toBe("1680 l/s");
    expect(valor(d, "Ocupación")).toBe("11 personas");
    expect(d.find((x) => x.etiqueta.startsWith("Ocupación"))?.etiqueta).toContain("40 m²/persona");
    // En oficinas el aparcamiento está vinculado a una actividad con horario: 15.
    const oficinas = deduccionesZona(OFICINAS, "z4");
    expect(valor(oficinas, "Ocupación")).toBe("20 personas");
    expect(oficinas.find((x) => x.etiqueta.startsWith("Ocupación"))?.etiqueta).toContain("15 m²/persona");
  });

  it("trasteros: HS3 solo en edificios de viviendas", () => {
    expect(valor(deduccionesZona(LOCALES, "z5"), "Ventilación")).toBe("25,2 l/s");
    const enOficinas = structuredClone(OFICINAS);
    enOficinas.grupos[2].zonas.push({ id: "z9", uso: "trasteros", superficieUtil_m2: 30, numero: 4 });
    const d = deduccionesZona(enOficinas, "z9");
    expect(valor(d, "Ventilación")).toBe("por el RITE");
    expect(loUsanZona(enOficinas, "z9").find((f) => f.codigo === "HS3")?.texto).toContain("no aplica");
  });

  it("oficinas: 10 m²/persona, RITE IDA 2 y previsión de 100 W/m² (mínimo 3.450 W)", () => {
    const d = deduccionesZona(OFICINAS, "z1");
    expect(valor(d, "Ocupación")).toBe("32 personas");
    expect(valor(d, "Aire exterior")).toBe("12,5 dm³/s por persona");
    expect(valor(d, "Previsión eléctrica")).toBe("32 kW");
  });

  it("instalaciones: ocupación nula", () => {
    expect(valor(deduccionesZona(LOCALES, "z6"), "Ocupación")).toBe("nula: solo mantenimiento");
    expect(textoCuentaPara("instalaciones")).toBe("ninguna: ocupación nula");
  });

  it("local sin uso: sin densidad propia (uso asimilable)", () => {
    expect(valor(deduccionesZona(LOCALES, "z2"), "Ocupación")).toBe("según el uso que se le asimile");
  });
});

describe("Lo usan", () => {
  it("HS6 según toque o no el terreno", () => {
    const pb = loUsanZona(LOCALES, "z2").find((f) => f.codigo === "HS6");
    expect(pb?.trato).toBe("no"); // hay sótano debajo
    const uni = edificioDeCaso("unifamiliar");
    expect(loUsanZona(uni, "z2").find((f) => f.codigo === "HS6")?.trato).toBe("si");
  });

  it("todos los usos tienen etiqueta, «cuenta para» y al menos una fila", () => {
    for (const u of ORDEN_USOS) {
      expect(USOS[u].etiqueta.length).toBeGreaterThan(0);
      expect(textoCuentaPara(u).length).toBeGreaterThan(0);
      expect(USOS[u].loUsan.length).toBeGreaterThan(0);
    }
  });
});
