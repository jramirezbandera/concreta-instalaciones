import { describe, expect, it } from "vitest";
import { componerMemoriaPdf, renderMemoriaPdf } from "../memoria";
import { bloquesMemoria, memoriaCte, nombreArchivoMemoria } from "../../obra/memoria";
import { crearProyectoDemo } from "../../proyecto/demo";

// =============================================================================
// La memoria CTE en PDF (feature-16 §F).
// =============================================================================

describe("renderMemoriaPdf", () => {
  const p = crearProyectoDemo("2026-10-04T10:00:00.000Z");
  const bloques = bloquesMemoria(memoriaCte(p), "4 oct 2026");

  it("pagina el Demo con su nombre de fichero", () => {
    const r = renderMemoriaPdf(bloques, p.nombre);
    expect(r.filename).toBe("memoria-cte-demo-vivienda-c-mayor-12.pdf");
    expect(r.pageCount).toBeGreaterThanOrEqual(2);
  });

  it("escribe los títulos y el pie con el motor en cada página", () => {
    const doc = componerMemoriaPdf(bloques, p.nombre);
    const crudo = doc.output();
    expect(crudo).toContain("(Memoria CTE de instalaciones)");
    expect(crudo).toContain("(Salubridad \\(DB-HS\\))");
    expect(crudo.match(/\(Motor v/g)).toHaveLength(doc.getNumberOfPages());
  });

  it("nombre de fichero sin acentos ni símbolos", () => {
    expect(nombreArchivoMemoria("Viviendas y local · C/ Mayor 12", "docx")).toBe("memoria-cte-viviendas-y-local-c-mayor-12.docx");
  });
});
