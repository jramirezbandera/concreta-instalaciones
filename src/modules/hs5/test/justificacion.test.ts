import { describe, expect, it } from "vitest";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { hs5EstadoDefaults, type Hs5Estado } from "../estado";
import { justificarHs5, type ObraHs5 } from "../justificacion";

// =============================================================================
// La justificación de HS5 (feature-14 §E): elementos con su contrato (§3.2 de
// REDISENO-V4) y avisos con id estable. El Demo da las cifras de la maqueta v4.
// =============================================================================

const OBRA_MAQUETA: ObraHs5 = { pluviometria: { zona: "A", isoyeta: 30 }, cotaAlcantarillado_m: -1.2 };

function estado(parcial: Partial<Hs5Estado> = {}): Hs5Estado {
  return { ...hs5EstadoDefaults, ...parcial };
}

function el(j: ReturnType<typeof justificarHs5>, id: string) {
  const e = j.elementos.find((x) => x.id === id);
  if (!e) throw new Error(`no existe ${id}`);
  return e;
}

describe("justificarHs5 · plurifamiliar con locales (la maqueta)", () => {
  const e = edificioDeCaso("plurifamiliar_locales");
  const j = justificarHs5(estado(), e, OBRA_MAQUETA);

  it("cumple, con los elementos de la maqueta en su orden", () => {
    expect(j.veredicto).toBe("ok");
    expect(j.elementos.map((x) => x.id)).toEqual([
      "garaje-s1",
      "colector-general",
      "bajante-a-fecales",
      "bajante-a-cocina",
      "bajante-b-fecales",
      "bajante-b-cocina",
      "ramal-a-fecales-p1",
      "pluviales-bajantes",
      "pluviales-colector",
      "ventilacion",
      "local-pb",
      "conexion",
    ]);
  });

  it("el colector: lo mandan las unidades (Ø90 admite 130 y le llegan 135)", () => {
    const c = el(j, "colector-general");
    expect(c.valor).toEqual({ valor: 110, unidad: "mm" });
    expect(c.manda).toEqual({
      tipo: "capacidad_tabla",
      tabla: "Tabla 4.5",
      recibe: { valor: 135, unidad: "UD" },
      admite: { valor: 321, unidad: "UD" },
    });
    expect(c.alternativa).toEqual({
      valor: { valor: 90, unidad: "mm" },
      capacidad: { valor: 130, unidad: "UD" },
      porQueNo: "capacidad",
    });
    expect(c.uso).toBeCloseTo(135 / 321);
  });

  it("la bajante de baños la manda el inodoro; la de cocina, las unidades, justo", () => {
    expect(el(j, "bajante-a-fecales").manda).toEqual({
      tipo: "minimo_aparato",
      aparato: "cuarto_bano_cisterna",
      diametroMin_mm: 100,
    });
    const cocina = el(j, "bajante-a-cocina");
    expect(cocina.manda).toMatchObject({ tipo: "capacidad_tabla", recibe: { valor: 27 }, admite: { valor: 27 } });
    expect(cocina.uso).toBe(1);
    expect(el(j, "bajante-b-fecales").nombre).toBe("Bajante B · fecales");
  });

  it("pluviales Ø63 × 2 con 90 mm/h; ventilación primaria; local previsto; garaje por bombeo", () => {
    const p = el(j, "pluviales-bajantes");
    expect(p.valor).toEqual({ valor: 63, unidad: "mm" });
    expect(p.uso).toBeCloseTo(94.5 / 113);
    expect(el(j, "pluviales-colector").valor).toEqual({ valor: 110, unidad: "mm" });
    expect(el(j, "ventilacion")).toMatchObject({
      veredicto: "ok",
      valor: { texto: "Primaria" },
      manda: { tipo: "altura_edificio", plantas: 4, limite: 7 },
    });
    expect(el(j, "local-pb")).toMatchObject({ veredicto: "previsto", valor: { valor: 110, unidad: "mm" } });
    expect(el(j, "garaje-s1")).toMatchObject({
      valor: { texto: "Bombeo" },
      manda: { tipo: "cota", cota_m: -3, referencia_m: -1.2 },
    });
  });

  it("un solo aviso: el garaje por debajo del alcantarillado, apuntando a su elemento", () => {
    expect(j.avisos).toEqual([
      {
        id: "garaje-s1-bombeo",
        tipo: "caso_especial",
        elementoId: "garaje-s1",
        datos: { nivel: -1, cota_m: -3, cotaAlcantarillado_m: -1.2 },
      },
    ]);
  });

  it("es determinista", () => {
    expect(justificarHs5(estado(), e, OBRA_MAQUETA)).toEqual(j);
  });
});

describe("justificarHs5 · supuestos y casos especiales", () => {
  const e = edificioDeCaso("plurifamiliar_locales");

  it("sin datos de la obra: lluvia de 100 mm/h supuesta y el sótano se supone bajo la acometida", () => {
    const j = justificarHs5(estado(), e, {});
    expect(j.intensidad).toEqual({ valor_mm_h: 100, zona: null, isoyeta: null, supuesta: true });
    expect(j.avisos.map((a) => a.id)).toEqual(["garaje-s1-bombeo", "pluviometria-supuesta"]);
    expect(j.avisos[0].datos.cotaAlcantarillado_m).toBeNull();
  });

  it("con el alcantarillado por debajo del garaje, el garaje va por gravedad y no hay aviso", () => {
    const j = justificarHs5(estado(), e, { ...OBRA_MAQUETA, cotaAlcantarillado_m: -4 });
    expect(el(j, "garaje-s1").valor).toEqual({ texto: "Por gravedad" });
    expect(j.avisos).toEqual([]);
  });

  it("colectores enterrados al 1 %: no cumplen la pendiente y avisan de que quedan bajo el sótano", () => {
    const j = justificarHs5(estado({ colectores: "enterrado", pendienteColector_pct: 1 }), e, OBRA_MAQUETA);
    expect(el(j, "colector-general").veredicto).toBe("fail");
    expect(j.veredicto).toBe("fail");
    expect(j.avisos.map((a) => a.id)).toContain("colector-bajo-sotano");
  });

  it("ocho plantas: lo habitual es la secundaria; la primaria sola no cumple", () => {
    const alto: Edificio = structuredClone(e);
    alto.grupos[0].repeticiones = 7;
    const habitual = justificarHs5(estado(), alto, OBRA_MAQUETA);
    expect(el(habitual, "ventilacion")).toMatchObject({ veredicto: "ok", valor: { texto: "Secundaria" } });
    expect(habitual.residuales?.ventilacion.secundaria.diametroColumna_mm).not.toBeNull();
    const primaria = justificarHs5(estado({ ventilacion: "primaria" }), alto, OBRA_MAQUETA);
    expect(el(primaria, "ventilacion").veredicto).toBe("fail");
    expect(primaria.veredicto).toBe("fail");
  });

  it("separativo: dos acometidas", () => {
    const j = justificarHs5(estado({ alcantarillado: "separativo" }), e, OBRA_MAQUETA);
    expect(el(j, "conexion")).toMatchObject({ valor: { texto: "Dos acometidas" }, cita: ["HS 5 · ap. 3.2 pto 2", "tabla 4.13"] });
  });

  it("oficinas sin núcleos de aseos: sin red de residuales y con el aviso", () => {
    const o = edificioDeCaso("oficinas");
    o.grupos[0].zonas[0].unidades = [];
    const j = justificarHs5(estado(), o, OBRA_MAQUETA);
    expect(j.residuales).toBeNull();
    expect(j.avisos.map((a) => a.id)).toContain("oficinas-sin-nucleos");
    expect(j.elementos.map((x) => x.id)).not.toContain("colector-general");
    expect(j.elementos.map((x) => x.id)).toContain("pluviales-bajantes");
  });

  it("unifamiliar: avisa del reparto supuesto de cuartos por planta", () => {
    const j = justificarHs5(estado(), edificioDeCaso("unifamiliar"), OBRA_MAQUETA);
    expect(j.avisos.map((a) => a.id)).toEqual(["unifamiliar-reparto"]);
    expect(j.elementos.map((x) => x.id)).toContain("pluviales-canalones");
  });

  it("«Ajustar a mano»: manda la tabla de tramos del estado", () => {
    const j = justificarHs5(estado({ red: "manual" }), e, OBRA_MAQUETA);
    expect(j.modo).toBe("manual");
    expect(j.residualesInputs.tramos.map((t) => t.id)).toEqual(hs5EstadoDefaults.tramos.map((t) => t.id));
    expect(j.elementos.map((x) => x.id)).toEqual(
      expect.arrayContaining(["colector", "bajante", "pluviales-bajantes", "ventilacion", "local-pb"]),
    );
  });
});
