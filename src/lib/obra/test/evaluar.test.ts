import { afterEach, describe, expect, it, vi } from "vitest";
import { crearProyectoDemo } from "../../proyecto/demo";
import { edificioDeCaso, CASOS_EDIFICIO } from "../../edificio/casos";
import type { Proyecto } from "../../proyecto/tipos";
import { estadoEfectivo, evaluarExpediente } from "../evaluar";
import { MODULOS_OBRA } from "../modulos";
import { veredictoConRevision } from "../../cte/estados";
import { justificarHs4 } from "../../../modules/hs4/justificacion";
import type { Hs4Estado } from "../../../modules/hs4/estado";

// =============================================================================
// La evaluación del expediente (feature-16 §A): el estado de cada
// justificación se calcula con su motor, con las mismas entradas que el módulo.
// =============================================================================

const NOW = "2026-10-04T10:00:00.000Z";
const demo = (): Proyecto => crearProyectoDemo(NOW);

afterEach(() => vi.restoreAllMocks());

describe("evaluarExpediente — el Demo", () => {
  const ev = evaluarExpediente(demo()).porClave;

  it("cada justificación con su estado de La obra", () => {
    expect(ev.hs3!.estado).toBe("cumple");
    expect(ev.hs4!.estado).toBe("revisar");
    expect(ev.hs5!.estado).toBe("revisar");
    expect(ev.hs6!.estado).toBe("revisar");
    expect(ev.he1!.estado).toBe("cumple");
    expect(ev.sua6!.estado).toBe("no_aplica");
    expect(ev.he0he1_global!.estado).toBe("externo");
    expect(ev.hs1!.estado).toBe("pronto");
  });

  it("los avisos sin revisar, redactados por el módulo", () => {
    expect(ev.hs5!.avisos.map((a) => a.id)).toEqual(["garaje-s1-bombeo", "pluviometria-supuesta"]);
    expect(ev.hs5!.avisos[0].titulo).toBe("El garaje queda por debajo del alcantarillado.");
    expect(ev.hs5!.avisos[0].elementoId).toBeDefined();
    expect(ev.hs4!.avisos.map((a) => a.id)).toEqual(["presion-red-supuesta"]);
  });

  it("la frase y «Qué entra» salen del módulo", () => {
    expect(ev.hs5!.calculado!.frase).toMatch(/^Residuales y pluviales/);
    expect(ev.hs5!.calculado!.queEntra.map((f) => f.titulo)).toContain("Garaje");
  });

  it("un aviso revisado deja de contar y, sin ninguno, cumple", () => {
    const p = demo();
    const q: Proyecto = {
      ...p,
      justificaciones: { ...p.justificaciones, hs6: { ...p.justificaciones.hs6, revisados: ["nucleo-garaje"] } },
    };
    const hs6 = evaluarExpediente(q).porClave.hs6!;
    expect(hs6.avisos).toEqual([]);
    expect(hs6.estado).toBe("cumple");
    expect(hs6.veredicto).toBe("ok");
  });
});

describe("evaluarExpediente — lo que no cumple", () => {
  it("con poca presión de red, HS4 no cumple y explica por qué", () => {
    const p = demo();
    const q: Proyecto = { ...p, datosGenerales: { ...p.datosGenerales, presionAcometida_kPa: 60 } };
    const hs4 = evaluarExpediente(q).porClave.hs4!;
    expect(hs4.estado).toBe("no_cumple");
    expect(hs4.veredicto).toBe("fail");
    expect(hs4.incumplimientos.length).toBeGreaterThan(0);
    expect(hs4.incumplimientos[0].titulo.length).toBeGreaterThan(10);
  });

  it("si el motor no calcula, queda «error» con su explicación y no revienta", () => {
    vi.spyOn(MODULOS_OBRA.hs5!, "calcular").mockImplementation(() => {
      throw new Error("tramos rotos");
    });
    const hs5 = evaluarExpediente(demo()).porClave.hs5!;
    expect(hs5.estado).toBe("error");
    expect(hs5.incumplimientos.map((i) => i.id)).toEqual(["calculo"]);
  });

  it("si nada de El edificio entra, queda «sin datos»", () => {
    const real = MODULOS_OBRA.hs4!.calcular.bind(MODULOS_OBRA.hs4);
    vi.spyOn(MODULOS_OBRA.hs4!, "calcular").mockImplementation((e, p, r) => ({ ...real(e, p, r), elementos: [], avisos: [] }));
    const hs4 = evaluarExpediente(demo()).porClave.hs4!;
    expect(hs4.estado).toBe("sin_datos");
    expect(hs4.veredicto).toBeUndefined();
  });
});

describe("estadoEfectivo — las entradas del módulo al abrirse", () => {
  it("por defecto ← guardadas ← heredadas: lo heredado manda", () => {
    const p = demo();
    const q: Proyecto = {
      ...p,
      justificaciones: { hs3: { inputs: { ...p.justificaciones.hs3!.inputs, zonaTermica: "W" } } },
    };
    expect(estadoEfectivo(q, "hs3")!.zonaTermica).toBe("Z"); // Cáceres a 459 m
  });

  it("salvo una excepción local declarada", () => {
    const p = demo();
    const q: Proyecto = {
      ...p,
      justificaciones: {
        hs3: { inputs: { ...p.justificaciones.hs3!.inputs, zonaTermica: "W" }, overridesContexto: ["zonaTermica"] },
      },
    };
    expect(estadoEfectivo(q, "hs3")!.zonaTermica).toBe("W");
  });

  it("sin nada guardado, los valores por defecto con lo heredado", () => {
    const p: Proyecto = { ...demo(), justificaciones: {} };
    expect(estadoEfectivo(p, "hs6")).toMatchObject({ zona: "II", municipio: "Cáceres" });
    expect(estadoEfectivo(p, "hs1")).toBeNull();
  });

  it("en los cuatro casos de El edificio, el veredicto es el del motor del módulo", () => {
    for (const caso of CASOS_EDIFICIO) {
      const p: Proyecto = { ...demo(), edificio: edificioDeCaso(caso.key), justificaciones: {} };
      const j = justificarHs4(estadoEfectivo(p, "hs4") as unknown as Hs4Estado, p.edificio, {
        presionAcometida_kPa: p.datosGenerales.presionAcometida_kPa,
      });
      const ev = evaluarExpediente(p).porClave.hs4!;
      expect(ev.veredicto, caso.key).toBe(veredictoConRevision(j.veredicto, j.avisos.length));
    }
  });
});
