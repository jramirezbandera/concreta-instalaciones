import { describe, expect, it } from "vitest";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import { hs5EstadoDefaults } from "../estado";
import { toFichaData } from "../ficha";
import { justificarHs5, type ObraHs5 } from "../justificacion";
import { memoriaHs5, textoPlano } from "../memoria";
import { calcularSeccion, SECCION, tamanoDibujoHs5 } from "../seccion";
import { estadoDe, franjaDe, fraseHs5, resultadoLista, textoAviso, textoEtiqueta } from "../textos";

// =============================================================================
// Lo que se lee (feature-14 §E y §I): la frase, la franja, los avisos, la
// memoria, la ficha y la geometría de la sección, sobre el Demo de la maqueta.
// =============================================================================

const OBRA: ObraHs5 = { pluviometria: { zona: "A", isoyeta: 30 }, cotaAlcantarillado_m: -1.2 };
const edificio = edificioDeCaso("plurifamiliar_locales");
const j = justificarHs5(hs5EstadoDefaults, edificio, OBRA);
const sinPendientes = new Set<string>();
const el = (id: string) => j.elementos.find((x) => x.id === id)!;

describe("textos de HS5", () => {
  it("la frase de la cabecera es la de la maqueta", () => {
    expect(fraseHs5(j)).toBe(
      "Residuales y pluviales por redes separadas que se unen en la arqueta de salida. " +
        "Cuatro bajantes de residuales, dos de pluviales y colector colgado Ø110 al 2 %. " +
        "El garaje queda por debajo del alcantarillado y evacua por bombeo.",
    );
  });

  it("la franja del colector: lo que manda, sus cuentas y la capacidad usada", () => {
    const f = franjaDe(el("colector-general"), j, "ok");
    expect(f).toMatchObject({
      clase: "Colector · residuales",
      titulo: "Colector general",
      valor: "Ø110",
      unidad: "al 2 %",
      manda: "Las unidades de desagüe. Con Ø90 solo admitiría 130 UD y le llegan 135.",
      nota: "Colgado del techo del garaje, registrable, hasta la arqueta de salida.",
      cita: "HS 5 · tabla 4.5 · ap. 4.1.3",
    });
    expect(f.filas).toEqual([
      { k: "Recibe", v: "135 UD · 4 bajantes" },
      { k: "Admite con Ø110", v: "321 UD" },
      { k: "Admitiría con Ø90", v: "130 UD" },
    ]);
  });

  it("con la pendiente al 4 % el colector lo mandan las bajantes", () => {
    const j4 = justificarHs5({ ...hs5EstadoDefaults, pendienteColector_pct: 4 }, edificio, OBRA);
    const c = j4.elementos.find((x) => x.id === "colector-general")!;
    expect(franjaDe(c, j4, "ok").manda).toBe(
      "Las bajantes. Por unidades bastaría Ø90 (160 UD), pero el colector no puede ser menor que las bajantes Ø110 que recibe.",
    );
  });

  it("las bajantes: el inodoro manda en la de baños; la de cocina va justa", () => {
    expect(franjaDe(el("bajante-a-fecales"), j, "ok").manda).toBe(
      "El inodoro. Desagua en Ø100 y la bajante no puede ser menor; por unidades bastaría Ø90.",
    );
    const cocina = franjaDe(el("bajante-a-cocina"), j, "ok");
    expect(cocina.manda).toBe("Las unidades de desagüe: 27 de 27. Cumple justo en el límite de Ø75.");
    expect(cocina.nota).toBe("Sin margen: si la cocina suma un aparato, la bajante pasa a Ø90.");
    expect(cocina.filas).toContainEqual({ k: "Recibe", v: "27 UD · 3 × 9" });
    expect(cocina.filas).toContainEqual({ k: "Columna de la tabla 4.4", v: "las dos (3 o 4 plantas)" });
  });

  it("pluviales con 90 mm/h", () => {
    expect(franjaDe(el("pluviales-bajantes"), j, "ok").manda).toBe(
      "La superficie de cubierta: 105 m² cada una, que con 90 mm/h equivalen a 95 m². Ø63 sirve hasta 113 m².",
    );
  });

  it("la lista y las etiquetas del dibujo", () => {
    expect(resultadoLista(el("colector-general"))).toBe("Ø110 · 42 %");
    expect(resultadoLista(el("bajante-a-cocina"))).toBe("Ø75 · justo");
    expect(resultadoLista(el("pluviales-bajantes"))).toBe("Ø63 × 2");
    expect(resultadoLista(el("ventilacion"))).toBe("primaria");
    expect(textoEtiqueta(el("colector-general"))).toBe("Ø110 · 2 %");
    expect(textoEtiqueta(el("local-pb"))).toBe("Ø110 previsto");
  });

  it("el estado: por revisar mientras su aviso no se revise; el local, previsto", () => {
    expect(estadoDe(el("garaje-s1"), new Set(["garaje-s1"]))).toBe("rv");
    expect(estadoDe(el("garaje-s1"), sinPendientes)).toBe("ok");
    expect(estadoDe(el("local-pb"), sinPendientes)).toBe("pv");
  });

  it("el aviso del garaje, con las cotas", () => {
    expect(textoAviso(j.avisos[0])).toEqual({
      titulo: "El garaje queda por debajo del alcantarillado.",
      detalle:
        "Su suelo (−3,00) está 1,80 m por debajo de la acometida (−1,20): pozo con dos bombas y separador de grasas; el equipo se define en el proyecto.",
    });
  });
});

describe("memoria de HS5", () => {
  const m = memoriaHs5(j);
  const plano = textoPlano(m);

  it("redacta la red como en la maqueta", () => {
    expect(plano).toContain(
      "Como el alcantarillado público es unitario, las aguas residuales y las pluviales discurren por redes separadas y se unen en la arqueta de salida, con cierre hidráulico antes de la acometida.",
    );
    expect(plano).toContain("Las viviendas tipo A y B suman 23 y 22 UD (tabla 4.1).");
    expect(plano).toContain(
      "Cada tipo se apila en una vertical de tres plantas con dos bajantes: fecales de Ø110 mm —por unidades bastaría Ø90, pero no puede ser menor que el desagüe del inodoro, de 100 mm— y cocina de Ø75 mm, que recibe 27 UD (tabla 4.4).",
    );
    expect(plano).toContain("El colector general recoge 135 UD y se resuelve en Ø110 mm, que admite 321 UD (tabla 4.5).");
    expect(plano).toContain(
      "La cubierta, de 210 m², desagua por cuatro sumideros (tabla 4.6) a dos bajantes de pluviales de Ø63 mm.",
    );
    expect(plano).toContain("criterio de proyecto; el DB-HS 5 no lo exige");
  });

  it("resalta las cifras y lleva la tabla resumen y las fuentes", () => {
    expect(m.parrafos.flat()).toContainEqual({ v: "Ø110 mm" });
    expect(m.tabla.filas[0]).toEqual(["Bajantes de fecales A · B", "42 · 39 UD", "360 UD", "110"]);
    expect(m.fuente).toContain("HS 5 (consolidado 14-06-2022)");
    expect(m.fuente).toContain("apéndice B");
  });
});

describe("ficha de HS5", () => {
  const svg = tamanoDibujoHs5(j, edificio);

  it("abre con la memoria, una verificación por elemento y el aviso pendiente", () => {
    const f = toFichaData(j, { estado: hs5EstadoDefaults, edificio, obra: OBRA, revisados: [], svg });
    expect(f.memoria?.length).toBeGreaterThan(3);
    expect(f.verificaciones).toHaveLength(j.elementos.length);
    expect(f.observaciones?.[0]).toMatch(/El garaje queda por debajo del alcantarillado\..*Pendiente de revisar\.$/);
    expect(f.datosPartida).toContainEqual({
      concepto: "Intensidad pluviométrica",
      valor: "90 mm/h · zona A, isoyeta 30",
      origen: "Datos de la obra · Figura B.1 y Tabla B.1",
    });
    expect(f.svg).toMatchObject({ elementId: "hs5-svg-pdf", nativeW: svg.nativeW, nativeH: svg.nativeH });
  });

  it("un aviso revisado llega como «revisado por el proyectista»", () => {
    const f = toFichaData(j, { estado: hs5EstadoDefaults, edificio, obra: OBRA, revisados: ["garaje-s1-bombeo"], svg });
    expect(f.observaciones?.[0]).toMatch(/Revisado por el proyectista\.$/);
  });
});

describe("sección de HS5", () => {
  const s = calcularSeccion(j, edificio);

  it("las plantas del edificio, la rasante en la PB y el colector bajo ella", () => {
    expect(s.pisos.map((p) => p.etiqueta)).toEqual(["P3", "P2", "P1", "PB", "S1"]);
    expect(s.yRasante).toBe(s.pisos.find((p) => p.nivel === 0)!.ySuelo);
    expect(s.colector!.y).toBeGreaterThan(s.yRasante);
    expect(s.colector!.y).toBeLessThan(s.pisos.find((p) => p.nivel === -1)!.ySuelo);
  });

  it("una etiqueta por bajante, dos de pluviales, colector, local y garaje, dentro del dibujo", () => {
    expect(s.etiquetas.map((e) => e.elementoId)).toEqual([
      "bajante-a-fecales",
      "bajante-a-cocina",
      "bajante-b-fecales",
      "bajante-b-cocina",
      "pluviales-bajantes",
      "pluviales-bajantes",
      "colector-general",
      "local-pb",
      "garaje-s1",
    ]);
    for (const e of s.etiquetas) {
      expect(e.x).toBeGreaterThan(0);
      expect(e.x).toBeLessThan(s.ancho);
      expect(e.y).toBeGreaterThan(0);
      expect(e.y).toBeLessThan(s.alto);
    }
    const xs = s.verticales.flatMap((v) => v.bajantes.map((b) => b.x));
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(SECCION.XL);
    expect(Math.max(...xs)).toBeLessThanOrEqual(SECCION.XR);
  });

  it("más de tres plantas iguales se comprimen en una banda", () => {
    const alto = structuredClone(edificio);
    alto.grupos[0].repeticiones = 6;
    const sa = calcularSeccion(justificarHs5(hs5EstadoDefaults, alto, OBRA), alto);
    expect(sa.pisos.map((p) => p.etiqueta)).toEqual(["P6", "P1", "PB", "S1"]);
    expect(sa.bandas).toHaveLength(1);
    expect(sa.bandas[0].niveles).toEqual([5, 4, 3, 2]);
    expect(sa.bandas[0].texto).toBe("P2–P5 · 4 plantas iguales");
  });

  it("es determinista", () => {
    expect(calcularSeccion(j, edificio)).toEqual(s);
  });
});
