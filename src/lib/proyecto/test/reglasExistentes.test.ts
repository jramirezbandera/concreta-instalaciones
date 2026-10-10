import { describe, it, expect } from "vitest";
import { aplicabilidadBase, atributosDe } from "../aplicabilidad";
import { NOTA_MANTENIMIENTO } from "../reglasExistentes";
import { edificioDeCaso, type CasoEdificio } from "../../edificio/casos";
import type { Edificio, ObraZona, UsoZona } from "../../edificio/tipos";
import type { Alcance, DatosGenerales, Intervencion, JustificacionKey } from "../tipos";

// =============================================================================
// Motor de aplicabilidad en edificios existentes (feature-27, paso 2).
// Bloque D de research/verificacion-reformas.md.
// =============================================================================

function datos(intervencion: Intervencion, alcance?: Alcance): DatosGenerales {
  return {
    municipio: "Cáceres",
    provincia: "Cáceres",
    altitud_m: 459,
    intervencion,
    tienePiscina: false,
    zonaRadon: "I",
    alcance,
  };
}

function marcar(e: Edificio, marcas: Record<string, ObraZona | [ObraZona, UsoZona, UsoZona]>): Edificio {
  for (const g of e.grupos) {
    for (const z of g.zonas) {
      const m = marcas[z.id];
      if (m === undefined) continue;
      if (Array.isArray(m)) {
        z.obra = m[0];
        z.usoAnterior = m[1];
        z.uso = m[2];
      } else {
        z.obra = m;
      }
    }
  }
  return e;
}

function propuesta(intervencion: Intervencion, alcance?: Alcance, e: Edificio | CasoEdificio = "plurifamiliar_locales") {
  const edificio = typeof e === "string" ? edificioDeCaso(e) : e;
  return aplicabilidadBase(atributosDe(datos(intervencion, alcance), edificio));
}

/** Reforma de baños: aseos y fontanería sin más aparatos, nada más. */
const BANOS: Alcance = {
  tipos: ["reforma"],
  integral: false,
  envolvente: [],
  envolventeMas25: false,
  pasaAcondicionado: false,
  generacionTermica: "no",
  aparatos: "sin_aumento",
  pluviales: false,
  interior: ["aseos"],
  estructura: false,
  aparcamiento: false,
  electrica50: false,
  electrica: "modifica",
};

const KEYS: JustificacionKey[] = [
  "hs1", "hs2", "hs3", "hs4", "hs5", "hs6",
  "si1", "si2", "si3", "si4", "si5", "si6",
  "sua1", "sua2", "sua3", "sua4", "sua5", "sua6", "sua7", "sua8", "sua9",
  "hr", "he1", "he0he1_global", "he4", "he5", "he6", "rebt", "dbse",
];

describe("sin asistente o en obra nueva, nada cambia", () => {
  it("en obra nueva el alcance no cuenta", () => {
    expect(propuesta("obra_nueva", BANOS)).toEqual(propuesta("obra_nueva"));
  });

  it("una reforma sin asistente se queda con la nota de alcance pendiente", () => {
    const r = propuesta("reforma");
    expect(r.hs4.aplicabilidad).toBe("aplica");
    expect(r.hs4.nota).toContain("pendiente");
    expect(r.hr.aplicabilidad).toBe("no_aplica");
    expect(r.dbse.aplicabilidad).toBe("externo");
  });

  it("con el asistente, ninguna justificación se queda con la nota pendiente", () => {
    for (const alcance of [{}, BANOS]) {
      const r = propuesta("reforma", alcance);
      for (const k of KEYS) expect(r[k].nota ?? "", k).not.toContain("pendiente");
    }
  });
});

describe("solo mantenimiento", () => {
  it("todo no aplica, también las externas", () => {
    const r = propuesta("reforma", { soloMantenimiento: true });
    for (const k of KEYS) {
      expect(r[k].aplicabilidad, k).toBe("no_aplica");
      expect(r[k].nota, k).toBe(NOTA_MANTENIMIENTO);
    }
  });
});

describe("reforma de baños", () => {
  const r = propuesta("reforma", BANOS);

  it("aplica a lo reformado lo que toca: aseos, accesibilidad y la parte eléctrica", () => {
    expect(r.sua3.aplicabilidad).toBe("aplica_reformado");
    expect(r.sua9.aplicabilidad).toBe("aplica_reformado");
    expect(r.rebt.aplicabilidad).toBe("aplica_reformado");
  });

  it("no aplica lo que no toca, con su párrafo", () => {
    for (const k of ["hs1", "hs2", "hs4", "hs5", "hs6", "si1", "si2", "si3", "si4", "si5", "si6", "sua1", "sua2", "sua4", "sua7", "sua8", "hr", "he1", "he4", "he6"] as const) {
      expect(r[k].aplicabilidad, k).toBe("no_aplica");
      expect(r[k].nota, k).toContain("no es de aplicación");
    }
  });

  it("sin estructura, DB-SE no aplica con el literal del art. 2.4; sin el 25 %, tampoco la global", () => {
    expect(r.dbse.aplicabilidad).toBe("no_aplica");
    expect(r.dbse.nota).toContain("17.1.a)");
    expect(r.he0he1_global.aplicabilidad).toBe("no_aplica");
  });

  it("todo lo que aplica a lo reformado cierra con el no empeoramiento", () => {
    expect(r.sua3.nota).toContain("criterio 4");
    expect(r.rebt.nota).not.toContain("art. 2.3");
  });

  it("HS 2 y HE 5 no aplican por su propio ámbito en existentes", () => {
    expect(r.hs2.nota).toContain("nueva construcción");
    expect(r.he5.cita).toContain("pto 1 b y c");
  });
});

describe("lo no respondido se queda en lo prudente", () => {
  const r = propuesta("reforma", { tipos: ["reforma"] });

  it("aplica a lo reformado lo que depende de una respuesta", () => {
    for (const k of ["hs1", "hs3", "hs4", "hs5", "hs6", "si1", "si2", "si3", "si4", "si5", "si6", "sua1", "sua2", "sua3", "sua4", "sua9", "rebt"] as const) {
      expect(r[k].aplicabilidad, k).toBe("aplica_reformado");
    }
  });

  it("HE1: sin saber si se renueva más del 25 % de la envolvente, va a HULC con la global", () => {
    expect(r.he1.aplicabilidad).toBe("externo");
    expect(r.he1.nota).toContain("elementos de la envolvente");
    expect(r.he1.nota).toContain("Se justifica con HULC o CE3X, junto con la verificación energética global.");
  });

  it("HE1: reforma de la envolvente sin superar el 25 %, por elementos en la app", () => {
    const f = propuesta("reforma", { ...BANOS, envolvente: ["huecos"] });
    expect(f.he0he1_global.aplicabilidad).toBe("no_aplica");
    expect(f.he1.aplicabilidad).toBe("aplica_reformado");
  });

  it("HE1: reforma de más del 25 % de la envolvente, a HULC con la global", () => {
    const f = propuesta("reforma", { ...BANOS, envolvente: ["huecos"], envolventeMas25: true });
    expect(f.he0he1_global.aplicabilidad).toBe("externo");
    expect(f.he1.aplicabilidad).toBe("externo");
    expect(f.he1.nota).toContain("25 %");
  });

  it("estructura sin responder: DB-SE externo; HE 4 aplica mientras no se precise", () => {
    expect(r.dbse.aplicabilidad).toBe("externo");
    expect(r.dbse.nota).toContain("Concreta estructura");
    expect(r.he4.aplicabilidad).toBe("aplica");
    expect(r.he0he1_global.aplicabilidad).toBe("externo");
  });

  it("HR no aplica en una reforma que no se dice integral", () => {
    expect(r.hr.aplicabilidad).toBe("no_aplica");
  });
});

describe("rehabilitación integral", () => {
  it("HR, HE 4 y HE 5 (si supera 1.000 m²) aplican", () => {
    const r = propuesta("reforma", { ...BANOS, integral: true });
    expect(r.hr.aplicabilidad).toBe("aplica");
    expect(r.he4.aplicabilidad).toBe("aplica");
    expect(r.he4.nota).toContain("íntegramente el edificio");
  });
});

describe("ampliación", () => {
  const e = (): Edificio => marcar(edificioDeCaso("plurifamiliar_locales"), { z1: "nueva", z2: "existente", z3: "existente", z4: "existente", z5: "existente", z6: "existente" });

  it("la global va siempre: control solar en la parte ampliada", () => {
    const r = propuesta("ampliacion", { ampliacionMas10: false }, e());
    expect(r.he0he1_global.aplicabilidad).toBe("externo");
    expect(r.he0he1_global.nota).toContain("solo el control solar");
    const r2 = propuesta("ampliacion", { ampliacionMas10: true }, e());
    expect(r2.he0he1_global.nota).toContain("coeficiente global K");
    expect(r2.he0he1_global.nota).toContain("HE 0");
  });

  it("HR no aplica, con la recomendación de la Guía", () => {
    const r = propuesta("ampliacion", {}, e());
    expect(r.hr.aplicabilidad).toBe("no_aplica");
    expect(r.hr.nota).toContain("Guía");
  });

  it("SI se aplica a la parte ampliada, con el criterio de los comentarios; SUA 8 al edificio", () => {
    const r = propuesta("ampliacion", {}, e());
    expect(r.si4.aplicabilidad).toBe("aplica_reformado");
    expect(r.si4.nota).toContain("edificio ampliado");
    expect(r.si4.cita).toContain("comentarios");
    expect(r.sua8.aplicabilidad).toBe("aplica");
  });

  it("HE 5 según la superficie construida ampliada", () => {
    const r = propuesta("ampliacion", {}, e());
    expect(r.he5.aplicabilidad).toBe("no_aplica");
    expect(r.he5.nota).toContain("no incrementa la superficie construida en más de 1.000 m²");
  });
});

describe("cambio de uso", () => {
  it("característico: todo aplica, HR y HS 2 por analogía incluidos", () => {
    const e = marcar(edificioDeCaso("oficinas"), { z1: ["cambia_uso", "oficinas", "viviendas"] });
    const r = propuesta("cambio_uso", { cambioUsoCaracteristico: true, estructura: false }, e);
    expect(r.hr.aplicabilidad).toBe("aplica");
    expect(r.hs2.aplicabilidad).toBe("aplica");
    expect(r.hs2.nota).toContain("estudio específico");
    expect(r.he1.aplicabilidad).toBe("externo");
    expect(r.si3.aplicabilidad).toBe("aplica");
    expect(r.dbse.aplicabilidad).toBe("no_aplica");
  });

  it("parcial, local a vivienda en un edificio de viviendas: HR a lo reformado y la excepción del SI", () => {
    const e = marcar(edificioDeCaso("plurifamiliar_locales"), { z2: ["cambia_uso", "local_sin_uso", "viviendas"], z1: "existente" });
    const r = propuesta("cambio_uso", { cambioUsoCaracteristico: false }, e);
    expect(r.hr.aplicabilidad).toBe("aplica_reformado");
    expect(r.hr.nota).toContain("a vivienda");
    expect(r.si3.nota).toContain("elementos comunes de evacuación");
    expect(r.he1.nota).toContain("cambios de uso");
    expect(r.he4.aplicabilidad).toBe("no_aplica");
  });
});

describe("varios tipos a la vez", () => {
  it("gana el más exigente: la reforma no toca la evacuación, la ampliación sí", () => {
    const solo = propuesta("reforma", BANOS);
    const ambas = propuesta("reforma", { ...BANOS, tipos: ["reforma", "ampliacion"] });
    expect(solo.si3.aplicabilidad).toBe("no_aplica");
    expect(ambas.si3.aplicabilidad).toBe("aplica_reformado");
    expect(ambas.sua8.aplicabilidad).toBe("aplica");
  });

  it("dos «a lo reformado» juntan sus notas distintas", () => {
    const r = propuesta("reforma", { tipos: ["reforma", "ampliacion"] });
    expect(r.si1.nota).toContain("parte ampliada");
    expect(r.si1.nota).toContain("modificados por la reforma");
  });
});

describe("edificio protegido", () => {
  it("añade el aviso a HE 1, HR, SI y SUA, no a HS", () => {
    const r = propuesta("reforma", { ...BANOS, protegido: true });
    expect(r.he1.nota).toContain("protegido");
    expect(r.hr.nota).toContain("protegido");
    expect(r.sua3.nota).toContain("protegido");
    expect(r.hs4.nota).not.toContain("protegido");
  });
});
