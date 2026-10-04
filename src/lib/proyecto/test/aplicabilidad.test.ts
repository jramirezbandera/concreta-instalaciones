import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import {
  aplicabilidadBase,
  aplicabilidadEfectiva,
  atributosDe,
  REGLAS_ATRIBUTOS,
  type AtributosProyecto,
} from "../aplicabilidad";
import { edificioDeCaso } from "../../edificio/casos";
import type { DatosGenerales, Intervencion, JustificacionKey, Proyecto } from "../tipos";

type Uso = "vivienda_unifamiliar" | "vivienda_colectiva";

// =============================================================================
// Motor de aplicabilidad Fase A (obra nueva + reglas de atributos + externas).
// La herramienta propone con cita; el proyectista dispone (forzado).
// =============================================================================

/** Las 27 claves del union JustificacionKey — el Record debe cubrirlas TODAS. */
const TODAS_LAS_KEYS: JustificacionKey[] = [
  "hs3", "hs4", "hs5", "hs6", "he1",
  "hs1", "hs2",
  "si1", "si2", "si3", "si4", "si5", "si6",
  "sua1", "sua2", "sua3", "sua4", "sua5", "sua6", "sua7", "sua8", "sua9",
  "hr", "he4", "he5", "rebt", "he0he1_global", "dbse",
];

const KEYS_EXTERNAS: JustificacionKey[] = ["he0he1_global", "dbse"];

/**
 * Atributos de una colectiva de obra nueva "completa" (garaje, trasteros, piscina).
 * `uso` es un atajo de los tests: «vivienda_unifamiliar» ⇒ `esUnifamiliar`.
 */
function dg(
  o: Partial<Omit<AtributosProyecto, "esUnifamiliar">> & { uso?: Uso } = {},
): AtributosProyecto {
  const { uso = "vivienda_colectiva", ...resto } = o;
  return {
    intervencion: "obra_nueva",
    tienePiscina: true,
    tieneViviendas: true,
    tieneGaraje: true,
    tieneTrasteros: true,
    ...resto,
    esUnifamiliar: uso === "vivienda_unifamiliar",
  };
}

/** Proyecto real: plurifamiliar con garaje y trasteros (caso de partida). */
function proyecto(
  obra: Partial<DatosGenerales> = {},
  justificaciones: Proyecto["justificaciones"] = {},
): Proyecto {
  return {
    id: "p-test",
    nombre: "Proyecto de prueba",
    creado: "2026-01-01T00:00:00.000Z",
    modificado: "2026-01-01T00:00:00.000Z",
    datosGenerales: {
      municipio: "Cáceres",
      provincia: "Cáceres",
      altitud_m: 459,
      intervencion: "obra_nueva",
      tienePiscina: true,
      zonaRadon: "I",
      ...obra,
    },
    edificio: edificioDeCaso("plurifamiliar"),
    justificaciones,
  };
}

describe("aplicabilidadBase — cobertura del expediente", () => {
  it("devuelve las 24 claves del union, todas con aplicabilidad definida", () => {
    const base = aplicabilidadBase(dg());
    for (const key of TODAS_LAS_KEYS) {
      expect(base[key], `falta la clave ${key}`).toBeDefined();
      expect(base[key].aplicabilidad).toBeTruthy();
    }
    expect(Object.keys(base).sort()).toEqual([...TODAS_LAS_KEYS].sort());
  });

  it("es determinista: mismos atributos ⇒ mismo resultado", () => {
    const datos = dg({ tienePiscina: false, intervencion: "reforma" });
    expect(aplicabilidadBase(datos)).toEqual(aplicabilidadBase(datos));
  });
});

describe("aplicabilidadBase — reglas de atributos (obra nueva)", () => {
  it("sin piscina ⇒ SUA6 no_aplica con párrafo redactado y cita de ámbito", () => {
    const r = aplicabilidadBase(dg({ tienePiscina: false })).sua6;
    expect(r.aplicabilidad).toBe("no_aplica");
    expect(r.nota).toBeTruthy();
    expect(r.nota).toContain("piscina");
    expect(r.cita).toBe("DB-SUA 6, ámbito de aplicación");
  });

  it("con piscina (colectiva) ⇒ SUA6 aplica, sin nota", () => {
    const r = aplicabilidadBase(dg({ tienePiscina: true })).sua6;
    expect(r.aplicabilidad).toBe("aplica");
    expect(r.nota).toBeUndefined();
  });

  it("unifamiliar CON piscina ⇒ SUA6 no_aplica (el ámbito excluye unifamiliares)", () => {
    const r = aplicabilidadBase(
      dg({ uso: "vivienda_unifamiliar", tienePiscina: true }),
    ).sua6;
    expect(r.aplicabilidad).toBe("no_aplica");
    expect(r.nota).toContain("unifamiliar");
    expect(r.cita).toBe("DB-SUA 6, ámbito de aplicación");
  });

  it("el «no aplica» de SUA6 distingue el motivo: sin piscina vs. unifamiliar", () => {
    // Los dos acaban en no_aplica, pero el párrafo va LITERAL al anejo: decir
    // "no dispone de piscina" en un chalet que sí la tiene sería falso.
    const sinPiscina = aplicabilidadBase(dg({ tienePiscina: false })).sua6.nota ?? "";
    const unifamiliar =
      aplicabilidadBase(dg({ uso: "vivienda_unifamiliar", tienePiscina: true })).sua6.nota ?? "";
    expect(sinPiscina).toContain("no dispone de piscina");
    expect(unifamiliar).not.toContain("no dispone de piscina");
  });

  it("sin garaje ⇒ SUA7 no_aplica con párrafo y cita de ámbito", () => {
    const r = aplicabilidadBase(dg({ tieneGaraje: false })).sua7;
    expect(r.aplicabilidad).toBe("no_aplica");
    expect(r.nota).toBeTruthy();
    expect(r.cita).toBe("DB-SUA 7, ámbito de aplicación");
  });

  it("colectiva con garaje ⇒ SUA7 aplica", () => {
    const r = aplicabilidadBase(dg({ uso: "vivienda_colectiva", tieneGaraje: true })).sua7;
    expect(r.aplicabilidad).toBe("aplica");
  });

  it("unifamiliar CON garaje ⇒ SUA7 no_aplica (el ámbito excluye unifamiliares)", () => {
    const r = aplicabilidadBase(
      dg({ uso: "vivienda_unifamiliar", tieneGaraje: true }),
    ).sua7;
    expect(r.aplicabilidad).toBe("no_aplica");
    expect(r.nota).toContain("unifamiliar");
    expect(r.cita).toBe("DB-SUA 7, ámbito de aplicación");
  });

  it("unifamiliar ⇒ HR no_aplica con matización de adosadas y criterio revisable", () => {
    const r = aplicabilidadBase(dg({ uso: "vivienda_unifamiliar" })).hr;
    expect(r.aplicabilidad).toBe("no_aplica");
    expect(r.nota).toContain("adosadas");
    expect(r.nota).toContain("revisable");
    expect(r.cita).toBe("DB-HR, ámbito de aplicación");
  });

  it("colectiva ⇒ HR aplica", () => {
    expect(aplicabilidadBase(dg()).hr.aplicabilidad).toBe("aplica");
  });

  it("obra nueva colectiva completa: el resto queda aplica sin nota (hs4, si3, he1…)", () => {
    const base = aplicabilidadBase(dg());
    for (const key of ["hs3", "hs4", "hs5", "hs6", "he1", "si3", "sua1", "rebt"] as const) {
      expect(base[key]).toEqual({ aplicabilidad: "aplica" });
    }
  });
});

describe("aplicabilidadBase — justificaciones externas", () => {
  test.prop([
    fc.constantFrom<Uso>("vivienda_unifamiliar", "vivienda_colectiva"),
    fc.constantFrom<Intervencion>("obra_nueva", "reforma", "ampliacion", "cambio_uso"),
    fc.boolean(),
    fc.boolean(),
  ])(
    "he0he1_global y dbse son SIEMPRE externo, con destino en la nota",
    (uso, intervencion, tieneGaraje, tienePiscina) => {
      const base = aplicabilidadBase(dg({ uso, intervencion, tieneGaraje, tienePiscina }));
      for (const key of KEYS_EXTERNAS) {
        expect(base[key].aplicabilidad).toBe("externo");
        expect(base[key].nota).toMatch(/^Se justifica con /);
        expect(base[key].cita).toBeTruthy();
      }
      expect(base.he0he1_global.nota).toContain("HULC");
      expect(base.dbse.nota).toContain("Concreta estructura");
    },
  );
});

describe("aplicabilidadBase — intervención ≠ obra nueva (aviso Fase E)", () => {
  it("reforma ⇒ HS4 aplica con nota de alcance pendiente y cita Parte I art. 2", () => {
    const r = aplicabilidadBase(dg({ intervencion: "reforma" })).hs4;
    expect(r.aplicabilidad).toBe("aplica");
    expect(r.nota).toContain("asistente de alcance");
    expect(r.cita).toBe("CTE Parte I, art. 2");
  });

  it("reforma NO pisa los no_aplica de atributos: sin piscina ⇒ SUA6 sigue no_aplica", () => {
    const r = aplicabilidadBase(dg({ intervencion: "reforma", tienePiscina: false })).sua6;
    expect(r.aplicabilidad).toBe("no_aplica");
    expect(r.cita).toBe("DB-SUA 6, ámbito de aplicación");
  });

  test.prop([
    fc.constantFrom<Intervencion>("reforma", "ampliacion", "cambio_uso"),
  ])("toda intervención existente añade la nota de alcance a las que aplican", (intervencion) => {
    const base = aplicabilidadBase(dg({ intervencion }));
    for (const key of TODAS_LAS_KEYS) {
      if (base[key].aplicabilidad === "aplica") {
        expect(base[key].nota).toContain("asistente de alcance");
        expect(base[key].cita).toBe("CTE Parte I, art. 2");
      }
    }
  });
});

describe("aplicabilidadEfectiva — el proyectista dispone", () => {
  it("sin forzado ⇒ devuelve la base con forzada:false", () => {
    const p = proyecto({ tienePiscina: false });
    const r = aplicabilidadEfectiva(p, "sua6");
    expect(r.aplicabilidad).toBe("no_aplica");
    expect(r.forzada).toBe(false);
    expect(r.cita).toBe("DB-SUA 6, ámbito de aplicación");
  });

  it("forzado gana: no_aplica forzado sobre un aplica de la base, con forzada:true", () => {
    const p = proyecto({}, {
      hs4: {
        aplicabilidadForzada: {
          valor: "no_aplica",
          nota: "La instalación de fontanería no se modifica.",
        },
      },
    });
    expect(aplicabilidadBase(atributosDe(p.datosGenerales, p.edificio)).hs4.aplicabilidad).toBe("aplica");
    const r = aplicabilidadEfectiva(p, "hs4");
    expect(r.aplicabilidad).toBe("no_aplica");
    expect(r.forzada).toBe(true);
    expect(r.nota).toBe("La instalación de fontanería no se modifica.");
  });

  it("forzado sin nota ⇒ valor forzado con nota undefined", () => {
    const p = proyecto({}, {
      sua6: { aplicabilidadForzada: { valor: "aplica" } },
    });
    const r = aplicabilidadEfectiva(p, "sua6");
    expect(r.aplicabilidad).toBe("aplica");
    expect(r.forzada).toBe(true);
    expect(r.nota).toBeUndefined();
  });

  it("otros campos de la justificación (inputs, cache) NO fuerzan nada", () => {
    const p = proyecto({}, { hs5: { inputs: { x: 1 }, schemaVersion: "1" } });
    const r = aplicabilidadEfectiva(p, "hs5");
    expect(r.aplicabilidad).toBe("aplica");
    expect(r.forzada).toBe(false);
  });
});

describe("propiedades generales del motor", () => {
  const arbDg = fc.record({
    uso: fc.constantFrom<Uso>("vivienda_unifamiliar", "vivienda_colectiva"),
    intervencion: fc.constantFrom<Intervencion>(
      "obra_nueva", "reforma", "ampliacion", "cambio_uso",
    ),
    tieneGaraje: fc.boolean(),
    tieneTrasteros: fc.boolean(),
    tienePiscina: fc.boolean(),
    tieneViviendas: fc.boolean(),
  });

  test.prop([arbDg])(
    "todas las claves presentes, no_aplica siempre con nota y cita, y determinismo",
    (parcial) => {
      const datos = dg(parcial);
      const base = aplicabilidadBase(datos);
      for (const key of TODAS_LAS_KEYS) {
        expect(base[key]).toBeDefined();
        if (base[key].aplicabilidad === "no_aplica") {
          expect(base[key].nota).toBeTruthy();
          expect(base[key].cita).toBeTruthy();
        }
      }
      expect(aplicabilidadBase(datos)).toEqual(base);
    },
  );

  it("todas las reglas de atributos declaran nota y cita no vacías", () => {
    for (const regla of REGLAS_ATRIBUTOS) {
      expect(regla.nota.length).toBeGreaterThan(20);
      expect(regla.cita).toMatch(/ámbito de aplicación/);
    }
  });
});

describe("atributos derivados de El edificio (feature-12)", () => {
  const obra: DatosGenerales = {
    municipio: "Madrid",
    provincia: "Madrid",
    altitud_m: 657,
    intervencion: "obra_nueva",
    tienePiscina: false,
    zonaRadon: "I",
  };

  it("unifamiliar: el garaje privado cuenta como garaje y SUA7 no aplica por el ámbito", () => {
    const a = atributosDe(obra, edificioDeCaso("unifamiliar"));
    expect(a).toMatchObject({ esUnifamiliar: true, tieneGaraje: true, tieneViviendas: true });
    const r = aplicabilidadBase(a);
    expect(r.sua7.aplicabilidad).toBe("no_aplica");
    expect(r.sua7.nota).toContain("vivienda unifamiliar");
    expect(r.hr.aplicabilidad).toBe("no_aplica");
  });

  it("oficinas con garaje: HS3 aplica (los garajes entran en cualquier uso)", () => {
    const a = atributosDe(obra, edificioDeCaso("oficinas"));
    expect(a.tieneViviendas).toBe(false);
    expect(aplicabilidadBase(a).hs3.aplicabilidad).toBe("aplica");
  });

  it("sin viviendas ni garaje: HS3 no aplica, con párrafo que remite al RITE", () => {
    const r = aplicabilidadBase(dg({ tieneViviendas: false, tieneGaraje: false }));
    expect(r.hs3.aplicabilidad).toBe("no_aplica");
    expect(r.hs3.nota).toContain("RITE");
    expect(r.hs3.cita).toBe("DB-HS 3, ámbito de aplicación");
  });

  it("los trasteros solos no hacen aplicable el HS3 fuera de un edificio de viviendas", () => {
    const r = aplicabilidadBase(dg({ tieneViviendas: false, tieneGaraje: false, tieneTrasteros: true }));
    expect(r.hs3.aplicabilidad).toBe("no_aplica");
  });
});
