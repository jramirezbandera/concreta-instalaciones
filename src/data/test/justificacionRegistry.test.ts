import { describe, it, expect } from "vitest";
import {
  justificacionRegistry,
  getJustificacion,
  getJustificacionBySubruta,
  justificacionesPorGrupo,
  getModuleSchemaVersion,
  type JustificacionEntry,
} from "../justificacionRegistry";

// =============================================================================
// justificacionRegistry — invariantes del registry (feature-6 §C).
// Única fuente de verdad del expediente: claves cortas, cobertura completa del
// mapa UX-RECONCEPT §10 y consolidación de MODULE_SCHEMA_VERSIONS.
// =============================================================================

// Union del contrato (tipos.ts) + entrada de desarrollo "smoke". Se replica
// aquí literal a propósito: el test fija el CONTRATO, no lo importa.
const KEYS_ESPERADAS = [
  "hs3", "hs4", "hs5", "hs6", "he1",
  "hs1", "hs2",
  "si1", "si2", "si3", "si4", "si5", "si6",
  "sua1", "sua4", "sua6", "sua7", "sua8", "sua9",
  "hr", "he4", "he5", "rebt",
  "he0he1_global", "dbse",
  "smoke",
] as const;

describe("justificacionRegistry — consistencia estructural", () => {
  it("las keys son únicas", () => {
    const keys = justificacionRegistry.map((j) => j.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("cobertura §10 completa: el set de keys es exactamente el union esperado + smoke", () => {
    const keys = justificacionRegistry.map((j) => j.key).sort();
    expect(keys).toEqual([...KEYS_ESPERADAS].sort());
  });

  it("shipped ⇒ route definida (relativa, sin barra inicial) y schemaVersion definida", () => {
    for (const j of justificacionRegistry.filter((x) => x.shipped)) {
      expect(j.route, `route de ${j.key}`).toBeDefined();
      expect(j.route!.startsWith("/"), `route de ${j.key} debe ser relativa`).toBe(false);
      expect(j.schemaVersion, `schemaVersion de ${j.key}`).toBeDefined();
    }
  });

  it("no-shipped ⇒ sin route (solo smoke, que es shipped, usa '_smoke')", () => {
    for (const j of justificacionRegistry.filter((x) => !x.shipped)) {
      expect(j.route, `route de ${j.key}`).toBeUndefined();
    }
    // smoke es la única entrada de desarrollo y navega a "_smoke".
    const smoke = getJustificacion("smoke")!;
    expect(smoke.shipped).toBe(true);
    expect(smoke.dev).toBe(true);
    expect(smoke.route).toBe("_smoke");
  });

  it("externo ⇔ formato 'externo', y externo.destino no vacío", () => {
    for (const j of justificacionRegistry) {
      if (j.externo) {
        expect(j.formato, `formato de ${j.key}`).toBe("externo");
        expect(j.externo.destino.length, `destino de ${j.key}`).toBeGreaterThan(0);
      }
      if (j.formato === "externo") {
        expect(j.externo, `externo de ${j.key}`).toBeDefined();
        // Las externas no se resuelven en la app: nunca shipped ni con route.
        expect(j.shipped).toBe(false);
        expect(j.route).toBeUndefined();
      }
    }
  });

  it("las externas apuntan a los destinos del reconcept (§3/§10)", () => {
    expect(getJustificacion("he0he1_global")?.externo?.destino).toBe("HULC");
    expect(getJustificacion("dbse")?.externo?.destino).toBe("Concreta estructura");
  });
});

describe("getJustificacionBySubruta", () => {
  it("'hs/saneamiento' → hs5", () => {
    expect(getJustificacionBySubruta("hs/saneamiento")?.key).toBe("hs5");
  });

  it("'_smoke' → smoke", () => {
    expect(getJustificacionBySubruta("_smoke")?.key).toBe("smoke");
  });

  it("subruta desconocida → undefined", () => {
    expect(getJustificacionBySubruta("no/existe")).toBeUndefined();
    // La forma legacy con barra inicial ya NO es una subruta válida.
    expect(getJustificacionBySubruta("/hs/saneamiento")).toBeUndefined();
  });
});

describe("getModuleSchemaVersion — misma semántica que la histórica", () => {
  it("los 5 módulos shipped + smoke están en versión '1'", () => {
    for (const key of ["hs3", "hs4", "hs5", "hs6", "he1", "smoke"]) {
      expect(getModuleSchemaVersion(key), `versión de ${key}`).toBe("1");
    }
  });

  it("clave desconocida → fallback '1'", () => {
    expect(getModuleSchemaVersion("no-existe")).toBe("1");
  });
});

describe("justificacionesPorGrupo", () => {
  it("sin opciones: agrupa todo preservando el orden de declaración", () => {
    const grupos = justificacionesPorGrupo();
    // Orden de grupos = orden de primera aparición en el registry.
    const ordenEsperado: string[] = [];
    for (const j of justificacionRegistry) {
      if (!ordenEsperado.includes(j.grupo)) ordenEsperado.push(j.grupo);
    }
    expect(grupos.map((g) => g.grupo)).toEqual(ordenEsperado);
    // Y no se pierde ninguna entrada.
    const total = grupos.reduce((n, g) => n + g.entradas.length, 0);
    expect(total).toBe(justificacionRegistry.length);
  });

  it("dentro de cada grupo se preserva el orden de declaración", () => {
    const grupos = justificacionesPorGrupo();
    for (const g of grupos) {
      const declarado = justificacionRegistry.filter((j) => j.grupo === g.grupo);
      expect(g.entradas.map((j: JustificacionEntry) => j.key)).toEqual(
        declarado.map((j) => j.key),
      );
    }
  });

  it("soloShipped: no incluye grupos vacíos y respeta el orden de declaración", () => {
    const grupos = justificacionesPorGrupo({ soloShipped: true });
    // Ningún grupo vacío y todas las entradas shipped.
    for (const g of grupos) {
      expect(g.entradas.length).toBeGreaterThan(0);
      expect(g.entradas.every((j) => j.shipped)).toBe(true);
    }
    // Los grupos sin entradas shipped (SI, SUA, HR, Electricidad, Externas)
    // no aparecen; los que quedan mantienen el orden de declaración.
    expect(grupos.map((g) => g.grupo)).toEqual([
      "Salubridad (DB-HS)",
      "Ahorro de energía (DB-HE)",
      "Desarrollo",
    ]);
    // Contenido shipped exacto del grupo Salubridad, en orden numérico declarado.
    expect(grupos[0].entradas.map((j) => j.key)).toEqual(["hs1", "hs3", "hs4", "hs5", "hs6"]);
  });
});
