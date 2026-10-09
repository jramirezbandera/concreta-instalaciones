import { describe, it, expect } from "vitest";
import { fotoExpedientes } from "./fotoExpediente";
import antes from "./foto-antes.json";

// =============================================================================
// Cierre de feature-27 (paso 8): sin asistente de alcance ni marcas de zona,
// el expediente es el mismo que con el código de partida (7e576d8). 40
// proyectos: el Demo y los cuatro casos de El edificio, cada intervención, con
// y sin piscina. Por justificación: aplicabilidad, estado, veredicto, nota y
// cita; y la huella del texto entero de la memoria.
// =============================================================================

describe("sin asistente de alcance, nada cambia", () => {
  const ahora = fotoExpedientes();

  it("los mismos proyectos", () => {
    expect(Object.keys(ahora).sort()).toEqual(Object.keys(antes).sort());
  });

  it.each(Object.keys(antes))("%s", (id) => {
    expect(ahora[id]).toEqual((antes as Record<string, Record<string, string>>)[id]);
  });
});
