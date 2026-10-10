import { describe, expect, it } from "vitest";
import { avisosVerificacion, leerVerificacion, resultadosDe, type VerificacionEnergetica } from "../verificacion";
import { PAGINAS, verificacionDePrueba } from "./informeSintetico";

// =============================================================================
// Lectura del informe «Verificación de requisitos de CTE-HE0 y HE1» de CE3X,
// sobre el informe sintético de `informeSintetico.ts`.
// =============================================================================



const leido = (paginas = PAGINAS): VerificacionEnergetica => verificacionDePrueba(paginas);

describe("leerVerificacion — informe de CE3X", () => {
  const v = leido();

  it("el programa, la fecha, la zona y la normativa que declara", () => {
    expect(v).toMatchObject({ formato: "ce3x", programa: "CE3X v2.3", archivo: "informe.pdf", fecha: "3/5/2026", zonaClimatica: "C3", normativa: "CTE 2013" });
  });

  it("HE0 con los decimales de la tabla 2.k / 2.l, no los de la gráfica", () => {
    expect(v.cepNren).toEqual({ valor: 48.07, limite: 60.21, cumple: true });
    expect(v.cepTot).toEqual({ valor: 95.4, limite: 167, cumple: true });
  });

  it("K y control solar", () => {
    expect(v.K).toEqual({ valor: 0.52, limite: 0.66, cumple: true });
    expect(v.qsolJul).toEqual({ valor: 2.4, limite: 4, cumple: true });
  });

  it("transmitancias por elemento, opacos y huecos", () => {
    expect(v.transmitancias.map((t) => `${t.tipo}:${t.nombre}:${t.valor}/${t.limite}`)).toEqual([
      "opaco:FACHADA PRINCIPAL:0.41/0.49",
      "opaco:MEDIANERA:0/0.7",
      "opaco:CUBIERTA:0.33/0.4",
      "hueco:V1:1.6/2.1",
      "hueco:PUERTA:2.2/5.7",
    ]);
  });

  it("permeabilidad (igual al límite cumple) y condensaciones", () => {
    expect(v.permeabilidad).toEqual([
      { nombre: "V1", valor: 9, limite: 9, cumple: true },
      { nombre: "PUERTA", valor: 9, limite: 9, cumple: true },
    ]);
    expect(v.condensaciones).toEqual([
      { nombre: "FACHADA PRINCIPAL", capas: "Fachada ladrillo con aislamiento por el interior", cumple: true },
      { nombre: "CUBIERTA", capas: "Cubierta plana invertida", cumple: true },
    ]);
  });

  it("un valor por encima del límite no cumple, aunque la tabla diga «Sí»", () => {
    const mal = PAGINAS.map((p) => ({ texto: p.texto.replace("CUBIERTA | 0.33 | 0.4 | Sí", "CUBIERTA | 0.45 | 0.4 | Sí").replace("K = 0.52", "K = 0.70") }));
    const w = leido(mal);
    expect(w.transmitancias.find((t) => t.nombre === "CUBIERTA")!.cumple).toBe(false);
    expect(w.K!.cumple).toBe(false);
  });

  it("decimales con coma", () => {
    const coma = PAGINAS.map((p) => ({ texto: p.texto.replace("| 48.07", "| 48,07") }));
    expect(leido(coma).cepNren!.valor).toBe(48.07);
  });
});

describe("leerVerificacion — lo que no lee", () => {
  it("un informe de HULC: lo dice y pide anotar el programa", () => {
    const r = leerVerificacion([{ texto: "HULC Herramienta unificada LIDER-CALENER\nCumplimiento DB-HE" }], "hulc.pdf");
    expect(r).toMatchObject({ ok: false });
    expect(!r.ok && r.error).toMatch(/HULC: todavía no se leen/);
  });

  it("otro PDF cualquiera", () => {
    const r = leerVerificacion([{ texto: "Estudio geotécnico" }], "otro.pdf");
    expect(!r.ok && r.error).toMatch(/No parece un informe de verificación/);
  });

  it("el informe sin sus anexos", () => {
    const r = leerVerificacion([{ texto: PAGINAS[0]!.texto }], "portada.pdf");
    expect(!r.ok && r.error).toMatch(/No se encuentran resultados/);
  });
});

describe("resultadosDe y avisosVerificacion", () => {
  const v = leido();

  it("la global lleva HE0, K y control solar", () => {
    expect(resultadosDe(v, "he0he1_global")).toEqual([
      { exigencia: "HE0 · Energía primaria no renovable (Cep,nren)", proyecto: "48,07 kWh/m²·año", limite: "≤ 60,21 kWh/m²·año", cumple: true },
      { exigencia: "HE0 · Energía primaria total (Cep,tot)", proyecto: "95,4 kWh/m²·año", limite: "≤ 167 kWh/m²·año", cumple: true },
      { exigencia: "HE1 · Coeficiente global de transmisión de calor (K)", proyecto: "0,52 W/m²K", limite: "≤ 0,66 W/m²K", cumple: true },
      { exigencia: "HE1 · Control solar (qsol;jul)", proyecto: "2,4 kWh/m²·mes", limite: "≤ 4 kWh/m²·mes", cumple: true },
    ]);
  });

  it("HE1, por elementos con el más ajustado", () => {
    const r = resultadosDe(v, "he1");
    expect(r.map((x) => x.exigencia)).toEqual([
      "HE1 · Transmitancia de los elementos opacos (U)",
      "HE1 · Transmitancia de los huecos (U)",
      "HE1 · Permeabilidad al aire de los huecos (Q100)",
      "HE1 · Condensaciones intersticiales",
    ]);
    // 0,41/0,49 = 0,84 > 0,33/0,4 = 0,83.
    expect(r[0]!.proyecto).toBe("3 elementos; el más ajustado, FACHADA PRINCIPAL: 0,41 W/m²K");
    expect(r[3]!.proyecto).toBe("2 cerramientos sin condensación");
  });

  it("avisa de la normativa que no es CTE 2019 y de la zona distinta a la del proyecto", () => {
    expect(avisosVerificacion(v, "C3").map((a) => a.id)).toEqual(["energia-normativa"]);
    expect(avisosVerificacion(v, "B4").map((a) => a.id)).toEqual(["energia-normativa", "energia-zona"]);
    expect(avisosVerificacion({ ...v, normativa: "CTE 2019" }, "C3")).toEqual([]);
  });
});
