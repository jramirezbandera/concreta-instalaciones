import { describe, expect, it } from "vitest";
import { deCategoria, FACHADA_HABITUAL, solucionDe } from "../../../lib/constructivo/catalogo";
import { MATERIALES_CEC } from "../../../lib/constructivo/materiales";
import { calcHE1 } from "../calc";
import { fachadaDe } from "../envolvente";

// feature-26 · K-CER.4: HE1 calcula por capas (lo necesita para Glaser) y la R0
// que sale debe reproducir la de la fórmula U = 1/(R0 + e_AT/λ_AT) del CEC.

function rtDe(id: string, e_mm: number) {
  const f = solucionDe("fachada", id);
  const r = calcHE1({ zonaClimatica: "D", claseHigrometria: "clase_3_o_inferior", cerramientos: [fachadaDe(f, e_mm)] }).porCerramiento[0];
  const at = MATERIALES_CEC[f.aislante].termico;
  const lambda = at.tipo === "lambda" ? at.lambda_W_mK : NaN;
  return { f, r, r0: r.rt_m2K_W - e_mm / 1000 / lambda };
}

describe("HE1 · fachadas del catálogo común", () => {
  it.each(deCategoria("fachada").map((f) => [f.codigo, f.id]))("%s: la R0 por capas reproduce la del CEC (±0,02)", (_codigo, id) => {
    const { f, r0 } = rtDe(id, 60);
    expect(Math.abs(r0 - f.R0_CEC)).toBeLessThanOrEqual(0.02);
  });

  it("F 3.2, la habitual: R0 0,721 con las R de fábrica del CEC (antes 0,825 con λ 0,49 y 0,32)", () => {
    const { r0, r } = rtDe(FACHADA_HABITUAL, 60);
    expect(r0).toBeCloseTo(0.13 + 0.015 / 0.57 + 0.16 + 0.17333 + 0.18 + 0.015 / 1.3 + 0.04, 3);
    expect(r.capas.map((c) => c.id)).toEqual(["fachada-enlucido", "fachada-tabique", "fachada-aislante", "fachada-camara", "fachada-ladrillo", "fachada-enfoscado"]);
    expect(r.capas.map((c) => c.mu)).toEqual([6, 10, 150, 1, 10, 10]);
  });

  it("ventilada (F 8.1): la cámara y el aplacado no cuentan y Rse = Rsi", () => {
    const { r } = rtDe("fa-ventilada-lp115", 60);
    const fuera = r.capas.filter((c) => c.id.endsWith("-camara-ventilada") || c.id.endsWith("-aplacado"));
    expect(fuera.map((c) => [c.resistencia_m2K_W, c.sd_m])).toEqual([[0, 0], [0, 0]]);
    expect(r.rse_m2K_W).toBe(0.13);
  });
});
