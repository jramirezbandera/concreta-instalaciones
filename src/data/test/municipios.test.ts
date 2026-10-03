import { describe, it, expect } from "vitest";
import { MUNICIPIOS_POR_PROVINCIA, buscarMunicipioPorIne } from "../municipios";
import { PROVINCIAS } from "../zonasClimaticasHE";

// =============================================================================
// Dataset de municipios (feature-9) — integridad estructural.
//
// Códigos y denominaciones OFICIALES (INE, relación a 01-01-2026). El dataset
// NO lleva altitud a propósito (ver la nota de alcance de `municipios.ts`), así
// que aquí se fija la ESTRUCTURA: cobertura, unicidad y coherencia de los
// códigos, correspondencia exacta con las 52 provincias del Anejo B, y las
// normalizaciones de nombre (artículo antepuesto, bilingües intactos, orden).
// =============================================================================

const TODOS = Object.values(MUNICIPIOS_POR_PROVINCIA).flat();

/** Código de provincia INE (2 dígitos) → clave del proyecto, del propio dataset. */
const PROV_POR_CODIGO = new Map<string, string>();
for (const [provincia, lista] of Object.entries(MUNICIPIOS_POR_PROVINCIA)) {
  for (const m of lista) {
    const cp = m.ine.slice(0, 2);
    if (!PROV_POR_CODIGO.has(cp)) PROV_POR_CODIGO.set(cp, provincia);
  }
}

describe("municipios — cobertura y correspondencia con las provincias del CTE", () => {
  it("tiene los 8.132 municipios de la relación INE a 01-01-2026", () => {
    expect(TODOS).toHaveLength(8132);
  });

  it("sus claves son EXACTAMENTE las 52 provincias del Anejo B", () => {
    const claves = Object.keys(MUNICIPIOS_POR_PROVINCIA).sort((a, b) => a.localeCompare(b, "es"));
    expect(claves).toEqual([...PROVINCIAS].sort((a, b) => a.localeCompare(b, "es")));
  });

  it("Ceuta y Melilla tienen un único municipio cada una", () => {
    expect(MUNICIPIOS_POR_PROVINCIA["Ceuta"]).toHaveLength(1);
    expect(MUNICIPIOS_POR_PROVINCIA["Melilla"]).toHaveLength(1);
  });
});

describe("municipios — integridad de los códigos INE", () => {
  it("todos tienen 5 dígitos y son únicos en todo el dataset", () => {
    const malos = TODOS.filter((m) => !/^\d{5}$/.test(m.ine));
    expect(malos).toEqual([]);
    expect(new Set(TODOS.map((m) => m.ine)).size).toBe(TODOS.length);
  });

  it("los 2 primeros dígitos son coherentes con la provincia en TODOS", () => {
    const incoherentes: string[] = [];
    for (const [provincia, lista] of Object.entries(MUNICIPIOS_POR_PROVINCIA)) {
      for (const m of lista) {
        if (PROV_POR_CODIGO.get(m.ine.slice(0, 2)) !== provincia) {
          incoherentes.push(`${m.ine} ${m.nombre} → ${provincia}`);
        }
      }
    }
    expect(incoherentes).toEqual([]);
  });

  it("los códigos de provincia cubren 01..52 sin huecos", () => {
    const codigos = [...PROV_POR_CODIGO.keys()].sort();
    expect(codigos).toHaveLength(52);
    expect(codigos[0]).toBe("01");
    expect(codigos[51]).toBe("52");
  });

  it("`buscarMunicipioPorIne` resuelve un código real y rechaza uno inventado", () => {
    expect(buscarMunicipioPorIne("10037")).toEqual({
      provincia: "Cáceres",
      municipio: { ine: "10037", nombre: "Cáceres" },
    });
    expect(buscarMunicipioPorIne("99999")).toBeNull();
    expect(buscarMunicipioPorIne("")).toBeNull();
  });
});

describe("municipios — denominaciones", () => {
  it("no hay nombres vacíos, con espacios sobrantes ni corrupción de codificación", () => {
    const sospechosos = TODOS.filter(
      (m) =>
        m.nombre.trim() === "" ||
        m.nombre !== m.nombre.trim() ||
        /�/.test(m.nombre) ||
        /Ã.|Â./.test(m.nombre),
    );
    expect(sospechosos).toEqual([]);
  });

  it("el artículo pospuesto del INE se antepone («La Iglesuela del Cid»)", () => {
    // El INE escribe "Iglesuela del Cid, La"; el dataset lo presenta natural.
    expect(TODOS.some((m) => m.nombre === "La Iglesuela del Cid")).toBe(true);
    // Y no queda ningún nombre con la coma del artículo pospuesto.
    const pospuestos = TODOS.filter((m) => /, (la|el|los|las|les|els|lo|l'|a|o|as|os)$/i.test(m.nombre));
    expect(pospuestos).toEqual([]);
  });

  it("conserva íntegras las denominaciones bilingües", () => {
    expect(TODOS.some((m) => m.nombre === "Donostia/San Sebastián")).toBe(true);
    expect(TODOS.some((m) => m.nombre === "Vitoria-Gasteiz")).toBe(true);
  });

  it("cada provincia está ordenada alfabéticamente (colación española)", () => {
    for (const [provincia, lista] of Object.entries(MUNICIPIOS_POR_PROVINCIA)) {
      const ordenada = [...lista].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
      expect(lista.map((m) => m.nombre), `orden en ${provincia}`).toEqual(
        ordenada.map((m) => m.nombre),
      );
    }
  });
});
