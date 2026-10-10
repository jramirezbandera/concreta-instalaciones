import { describe, it, expect } from "vitest";
import {
  RADON_ZONA_I,
  RADON_ZONA_II,
  RADON_ZONA_POR_INE,
  zonaRadonDeIne,
} from "../radonHS6";
import { MUNICIPIOS_POR_PROVINCIA } from "../municipios";
import type { ZonaRadon } from "../../lib/proyecto/tipos";

// =============================================================================
// Zona de radón por municipio — DB-HS6 Apéndice B (DB-HS consolidado 14-jun-2022),
// transcrito por scripts/generar-radon-hs6.mjs y casado con los códigos INE de
// ./municipios.ts. Verificación: research/verificacion-radon-hs6.md.
//   1) TOTALES: los recuentos del PDF, por zona y por provincia, menos los 5
//      territorios no municipales (sin código INE) y la fusión Cerdedo-Cotobade.
//   2) INTEGRIDAD: toda clave es un código INE de la relación oficial; ninguno
//      en las dos zonas; sin repetidos.
//   3) SPOT-CHECKS leídos en el texto del PDF a mano.
//   4) zonaRadonDeIne: "sin_exigencia" fuera de la lista, null si no hay código.
// =============================================================================

const TODOS_INE = new Map<string, string>(); // ine → provincia
for (const [provincia, lista] of Object.entries(MUNICIPIOS_POR_PROVINCIA)) {
  for (const m of lista) TODOS_INE.set(m.ine, provincia);
}

/**
 * [zona I, zona II] por provincia: entradas del Apéndice B convertidas en código.
 * Del recuento del PDF (zona I 2403, zona II 1646) se restan:
 *   Jaén I «Cuarto del Madroño», Burgos I «Cabeza Alta», Salamanca I «Coto
 *   Mancomunado», Navarra I «Sierra de Aralar», Madrid II «Los Baldios»
 *   (territorios no municipales) y Pontevedra II «Cerdedo»+«Cotobade» → 36902.
 */
const POR_PROVINCIA: Record<string, [number, number]> = {
  "A Coruña": [2, 88],
  Albacete: [3, 0],
  Almería: [20, 23],
  Asturias: [38, 11],
  Badajoz: [57, 86],
  Baleares: [25, 0],
  Barcelona: [106, 56],
  Burgos: [100, 0], // PDF 101
  Cantabria: [50, 1],
  Castellón: [14, 0],
  Ceuta: [0, 1],
  "Ciudad Real": [40, 14],
  Cuenca: [21, 0],
  Cáceres: [19, 189],
  Córdoba: [11, 22],
  Girona: [116, 66],
  Granada: [30, 23],
  Guadalajara: [97, 14],
  Guipúzcoa: [70, 0],
  Huelva: [30, 8],
  Huesca: [59, 13],
  Jaén: [20, 4], // PDF 21
  "La Rioja": [70, 0],
  "Las Palmas": [0, 21],
  León: [93, 23],
  Lleida: [71, 42],
  Lugo: [11, 56],
  Madrid: [59, 85], // PDF 86
  Murcia: [3, 0],
  Málaga: [21, 0],
  Navarra: [65, 12], // PDF 66
  Ourense: [10, 82],
  Palencia: [57, 0],
  Pontevedra: [2, 58], // PDF 59
  Salamanca: [126, 233], // PDF 127
  "Santa Cruz de Tenerife": [0, 29],
  Segovia: [112, 51],
  Sevilla: [14, 9],
  Soria: [72, 0],
  Tarragona: [32, 11],
  Teruel: [90, 0],
  Toledo: [53, 99],
  Valencia: [5, 0],
  Valladolid: [102, 0],
  Vizcaya: [32, 0],
  Zamora: [164, 63],
  Zaragoza: [109, 0],
  Álava: [7, 0],
  Ávila: [91, 151],
};

describe("radón HS6 — totales contra el PDF", () => {
  it("zona I: 2403 entradas del PDF − 4 sin código = 2399 municipios", () => {
    expect(RADON_ZONA_I).toHaveLength(2399);
  });

  it("zona II: 1646 entradas del PDF − 1 sin código − 1 fusión = 1644 municipios", () => {
    expect(RADON_ZONA_II).toHaveLength(1644);
  });

  it("el mapa tiene exactamente las claves de las dos listas", () => {
    expect(Object.keys(RADON_ZONA_POR_INE)).toHaveLength(2399 + 1644);
  });

  it("recuento por provincia idéntico al del PDF (salvo las excepciones documentadas)", () => {
    const real: Record<string, [number, number]> = {};
    for (const [ine, zona] of Object.entries(RADON_ZONA_POR_INE)) {
      const prov = TODOS_INE.get(ine) ?? `?${ine}`;
      real[prov] ??= [0, 0];
      real[prov][zona === "I" ? 0 : 1]++;
    }
    expect(real).toEqual(POR_PROVINCIA);
  });

  it("sin municipios en Alicante, Cádiz ni Melilla", () => {
    for (const p of ["Alicante", "Cádiz", "Melilla"]) {
      const enZona = MUNICIPIOS_POR_PROVINCIA[p].filter(
        (m) => m.ine in RADON_ZONA_POR_INE,
      );
      expect(enZona, p).toEqual([]);
    }
  });
});

describe("radón HS6 — integridad de los códigos", () => {
  it("toda clave es un código INE de 5 dígitos presente en municipios.ts", () => {
    const malos = [...RADON_ZONA_I, ...RADON_ZONA_II].filter(
      (ine) => !/^\d{5}$/.test(ine) || !TODOS_INE.has(ine),
    );
    expect(malos).toEqual([]);
  });

  it("ningún municipio está en las dos zonas", () => {
    const zonaI = new Set(RADON_ZONA_I);
    expect(RADON_ZONA_II.filter((ine) => zonaI.has(ine))).toEqual([]);
  });

  it("sin códigos repetidos dentro de cada zona", () => {
    expect(new Set(RADON_ZONA_I).size).toBe(RADON_ZONA_I.length);
    expect(new Set(RADON_ZONA_II).size).toBe(RADON_ZONA_II.length);
  });

  it("el mapa respeta la zona de cada lista", () => {
    expect(RADON_ZONA_I.every((ine) => RADON_ZONA_POR_INE[ine] === "I")).toBe(
      true,
    );
    expect(RADON_ZONA_II.every((ine) => RADON_ZONA_POR_INE[ine] === "II")).toBe(
      true,
    );
  });
});

describe("radón HS6 — spot-checks leídos en el PDF", () => {
  it.each([
    ["14021", "Córdoba (capital), Córdoba, zona 2 (p. 146)", "II"],
    ["04066", "Níjar, Almería, zona 1 (p. 146)", "I"],
    ["04050", "Gérgal, Almería, zona 2 (p. 146)", "II"],
    ["14052", "Peñarroya-Pueblonuevo, Córdoba, zona 1 (p. 146)", "I"],
    ["04901", "Las Tres Villas, Almería, zona 2 (p. 146)", "II"],
    ["28006", "Alcobendas, Madrid, zona 1", "I"],
    ["28047", "Collado Villalba, Madrid, zona 2", "II"],
    ["33044", "Oviedo, Asturias, zona 1", "I"],
    ["08019", "Barcelona, zona 1", "I"],
    ["29067", "Málaga, zona 1", "I"],
    ["05019", "Ávila, zona 2", "II"],
    ["37274", "Salamanca, zona 2", "II"],
    ["32054", "Ourense, zona 2", "II"],
    ["51001", "Ceuta, zona 2", "II"],
    // Casamientos no literales (cambio de nombre, fusión, bilingüe, artículo).
    [
      "36902",
      "«Cerdedo» y «Cotobade» (Pontevedra, zona 2) → Cerdedo-Cotobade",
      "II",
    ],
    ["24036", "«Candín» (León, zona 2) → Valle de Ancares", "II"],
    ["46220", "«Sagunto/Sagunt» (Valencia, zona 1) → Sagunt/Sagunto", "I"],
    ["07902", "«Es Migjorn Gran» (Baleares, zona 1) → Migjorn Gran, Es", "I"],
    [
      "17901",
      "«Cruïlles, Monells i Sant Sadurní de l'Heura» (2 líneas, zona 1)",
      "I",
    ],
    [
      "28063",
      "«Gargantilla del Lozoya y Pinilla de Buitrago» (2 líneas, zona 2)",
      "II",
    ],
  ])("%s %s", (ine, _desc, zona) => {
    expect(zonaRadonDeIne(ine)).toBe(zona);
  });

  it.each([
    ["28079", "Madrid (capital): no figura en el Apéndice B"],
    ["41091", "Sevilla (capital): no figura"],
    ["46250", "València (capital): no figura"],
    ["18087", "Granada (capital): no figura"],
    ["11012", "Cádiz: provincia sin municipios en la lista"],
  ])("%s %s → sin_exigencia", (ine) => {
    expect(zonaRadonDeIne(ine)).toBe("sin_exigencia");
  });
});

describe("zonaRadonDeIne — sin código no se deriva", () => {
  it("null si no hay código", () => {
    expect(zonaRadonDeIne(undefined)).toBeNull();
  });

  it("null si el código no es de un municipio de la relación INE", () => {
    for (const ine of ["", "99999", "2807", "28079 ", "abcde"]) {
      expect(zonaRadonDeIne(ine), JSON.stringify(ine)).toBeNull();
    }
  });

  it("todo municipio de la relación INE tiene zona derivable (nunca null)", () => {
    const nulos = [...TODOS_INE.keys()].filter(
      (ine) => zonaRadonDeIne(ine) === null,
    );
    expect(nulos).toEqual([]);
  });

  it("su resultado es asignable al tipo ZonaRadon del proyecto", () => {
    const z: ZonaRadon | null = zonaRadonDeIne("14021");
    expect(z).toBe("II");
  });
});
