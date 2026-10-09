import { describe, it, expect } from "vitest";
import { citaFlexibilidad, flexibilidadCompleta, motivosDe, notaFlexibilidad, type Flexibilidad } from "../flexibilidad";

// Criterio de flexibilidad (feature-27, paso 4): párrafo D.0.3 con la cita del cotejo.

const F: Flexibilidad = {
  motivo: "proteccion",
  porque: "la fachada está catalogada y no admite aislamiento por el exterior.",
  soluciones: "trasdosado interior con 40 mm de lana mineral",
  nivel: "una transmitancia de 0,62 W/m²K",
};

describe("citaFlexibilidad", () => {
  it("HE: la Parte I y el criterio 2 del DB-HE", () => {
    expect(citaFlexibilidad("he1", "tecnica")).toBe("CTE Parte I, art. 2.3; DB-HE, Introducción IV, criterio 2");
  });

  it("HE: los casos propios del DB-HE no están en la Parte I", () => {
    expect(citaFlexibilidad("he1", "sin_mejora")).toBe("DB-HE, Introducción IV, criterio 2");
  });

  it("HE: la razón urbanística solo está en la Parte I", () => {
    expect(citaFlexibilidad("he1", "urbanistica")).toBe("CTE Parte I, art. 2.3");
  });

  it("SI: el DB solo la admite por el grado de protección", () => {
    expect(citaFlexibilidad("si3", "proteccion")).toBe("CTE Parte I, art. 2.3; DB-SI, Introducción III");
    expect(citaFlexibilidad("si3", "economica")).toBe("CTE Parte I, art. 2.3");
  });

  it("SUA: técnica, económica o protección, no la naturaleza de la intervención", () => {
    expect(citaFlexibilidad("sua9", "tecnica")).toContain("DB-SUA");
    expect(citaFlexibilidad("sua9", "naturaleza")).toBe("CTE Parte I, art. 2.3");
  });

  it("HS: solo la Parte I", () => {
    expect(citaFlexibilidad("hs3", "proteccion")).toBe("CTE Parte I, art. 2.3");
  });
});

describe("motivosDe", () => {
  it("los casos propios del DB-HE solo en HE", () => {
    expect(motivosDe("he1").map((m) => m.value)).toContain("sin_mejora");
    expect(motivosDe("hs1").map((m) => m.value)).not.toContain("sin_mejora");
  });
});

describe("notaFlexibilidad", () => {
  it("redacta el párrafo con motivo, soluciones, nivel y documentación final", () => {
    const n = notaFlexibilidad("he1", "HE1 Limitación de la demanda", F);
    expect(n).toBe(
      "HE1 Limitación de la demanda: se aplica con criterio de flexibilidad. Su aplicación plena es incompatible con el grado de protección del edificio: la fachada está catalogada y no admite aislamiento por el exterior. Se adoptan las soluciones que permiten el mayor grado posible de adecuación efectiva: trasdosado interior con 40 mm de lana mineral, con las que se alcanza una transmitancia de 0,62 W/m²K. En la documentación final de la obra quedará constancia del nivel de prestación alcanzado y de los condicionantes de uso y mantenimiento que resulten (CTE Parte I, art. 2.3; DB-HE, Introducción IV, criterio 2).",
    );
  });

  it("con condicionantes, los nombra", () => {
    const n = notaFlexibilidad("sua1", "SUA1 Caídas", { ...F, motivo: "tecnica", condicionantes: "revisar el pasamanos cada año." });
    expect(n).toContain("mantenimiento: revisar el pasamanos cada año (CTE Parte I, art. 2.3; DB-SUA, Introducción III).");
  });
});

describe("flexibilidadCompleta", () => {
  it("pide motivo, por qué, soluciones y nivel", () => {
    expect(flexibilidadCompleta(F)).toBe(true);
    expect(flexibilidadCompleta({ ...F, nivel: " " })).toBe(false);
    expect(flexibilidadCompleta({ porque: "x", soluciones: "y", nivel: "z" })).toBe(false);
  });
});
