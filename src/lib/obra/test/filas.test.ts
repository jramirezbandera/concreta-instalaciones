import { describe, expect, it } from "vitest";
import type { FilaQueEntra } from "../../../components/justificacion/QueEntra";
import { crearProyectoDemo } from "../../proyecto/demo";
import { resumenEdificio } from "../../edificio/derivar";
import type { Proyecto } from "../../proyecto/tipos";
import { filasObra, piezasDeQueEntra, recuentoObra, rotuloGrupo, textoRecuento, type FilaObra } from "../filas";
import { verificacionDePrueba } from "../../energia/test/informeSintetico";

// =============================================================================
// «Lo que se justifica» (feature-16 §B).
// =============================================================================

const demo = (): Proyecto => crearProyectoDemo("2026-10-04T10:00:00.000Z");

function fila(p: Proyecto, id: string): FilaObra {
  const f = filasObra(p)
    .flatMap((g) => g.filas)
    .find((x) => x.id === id);
  if (!f) throw new Error(`sin fila ${id}`);
  return f;
}

const textos = (f: FilaObra) => f.piezas.map((x) => x.texto);

describe("filasObra — el Demo", () => {
  it("grupos por DB, con rótulo de la maqueta", () => {
    expect(filasObra(demo()).map((g) => g.rotulo)).toEqual([
      "Salubridad · DB HS",
      "Seguridad en caso de incendio · DB SI",
      "Utilización y accesibilidad · DB SUA",
      "Ruido · DB HR",
      "Ahorro de energía · DB HE",
      "Electricidad · REBT",
      "Externas",
    ]);
  });

  it("las publicadas, con su estado, su ruta y las partes que entran", () => {
    const p = demo();
    expect(fila(p, "hs5")).toMatchObject({ estado: "revisar", codigo: "HS5", ruta: "hs/saneamiento" });
    expect(fila(p, "hs5").piezas).toEqual([
      { texto: "6 viviendas", acento: false },
      { texto: "garaje · bombeo", acento: true },
      { texto: "local · previsión", acento: true },
    ]);
    expect(textos(fila(p, "hs3"))).toEqual(["6 viviendas", "garaje", "trasteros", "local → RITE"]);
    // HE1 va al programa en obra nueva; forzada a «aplica», el módulo con sus partes.
    expect(fila(p, "he1")).toMatchObject({ estado: "externo", destino: "HULC o CE3X" });
    expect(fila(p, "he1").ruta).toBeUndefined();
    const he1 = { ...p.justificaciones.he1!, aplicabilidadForzada: { valor: "aplica" as const } };
    const conHe1: Proyecto = { ...p, justificaciones: { ...p.justificaciones, he1 } };
    expect(fila(conHe1, "he1")).toMatchObject({ estado: "cumple", ruta: "he/envolvente" });
    expect(textos(fila(conHe1, "he1"))).toEqual(["fachada", "cubierta", "forjado sobre el local", "ventanas"]);
    expect(fila(p, "hs5").frase).toMatch(/^Residuales y pluviales/);
  });

  it("ya no queda ninguna familia «pronto»: SUA (feature-20) y HE4·5 (feature-22) van con fila propia", () => {
    const p = demo();
    const ids = filasObra(p).flatMap((g) => g.filas).map((f) => f.id);
    expect(ids).not.toContain("junta-sua");
    expect(ids).not.toContain("junta-he45");
    expect(fila(p, "he4")).toMatchObject({ codigo: "HE4", ruta: "he/acs", estado: "revisar" });
    expect(fila(p, "he5")).toMatchObject({ codigo: "HE5", ruta: "he/generacion", estado: "revisar" });
  });

  it("una forzada a no aplicar deja la otra en su fila", () => {
    const p = demo();
    const q: Proyecto = {
      ...p,
      justificaciones: { ...p.justificaciones, he4: { aplicabilidadForzada: { valor: "no_aplica", nota: "n/a" } } },
    };
    expect(fila(q, "he4")).toMatchObject({ estado: "no_aplica", forzada: true, nota: "n/a" });
    expect(fila(q, "he5")).toMatchObject({ estado: "revisar", codigo: "HE5" });
  });

  it("SUA1 a SUA9 (feature-20): fila y ruta propias; SUA5 y SUA6 no aplican con su párrafo", () => {
    const p = demo();
    expect(fila(p, "sua1")).toMatchObject({ codigo: "SUA1", ruta: "sua/caidas", estado: "cumple" });
    expect(fila(p, "sua8")).toMatchObject({ codigo: "SUA8", ruta: "sua/rayo", estado: "revisar" });
    expect(fila(p, "sua7")).toMatchObject({ ruta: "sua/vehiculos" });
    for (const k of ["sua5", "sua6"]) {
      expect(fila(p, k)).toMatchObject({ estado: "no_aplica", piezas: [{ texto: "párrafo redactado", acento: false }] });
      expect(fila(p, k).ruta).toBeUndefined();
    }
  });

  it("SI1 a SI6 publicadas (feature-19): cada una con su fila, su ruta y sus piezas", () => {
    const p = demo();
    expect(fila(p, "si1")).toMatchObject({ codigo: "SI1", ruta: "si/propagacion-interior", estado: "revisar" });
    expect(textos(fila(p, "si1"))).toEqual(["6 viviendas", "garaje · sector propio", "local · sector propio", "1 local de riesgo"]);
    expect(textos(fila(p, "si5"))).toEqual(["espacio de maniobra", "fachada accesible"]);
    expect(textos(fila(p, "si6"))).toEqual(["R 60", "R 90", "R 120"]);
    expect(filasObra(p).flatMap((g) => g.filas).some((f) => f.id === "junta-si")).toBe(false);
  });

  it("las externas: con qué se justifican y su referencia", () => {
    const p = demo();
    expect(fila(p, "he0he1_global").piezas).toEqual([{ texto: "HULC o CE3X · adjuntar documento", acento: true }]);
    expect(textos(fila(p, "dbse"))).toEqual(["Concreta estructura · adjuntar documento"]);
    const q: Proyecto = { ...p, justificaciones: { ...p.justificaciones, he0he1_global: { refExterna: "EXP-7", programa: "HULC" } } };
    expect(fila(q, "he0he1_global")).toMatchObject({ destino: "HULC", refExterna: "EXP-7" });
    expect(textos(fila(q, "he0he1_global"))).toEqual(["HULC · EXP-7"]);
    // HE1 va con la global: el mismo programa y el mismo documento.
    expect(textos(fila(q, "he1"))).toEqual(["HULC · EXP-7"]);
  });

  it("con el informe leído, el programa y lo que dice", () => {
    const p = demo();
    const conInforme = (v: ReturnType<typeof verificacionDePrueba>): Proyecto => ({
      ...p,
      justificaciones: { ...p.justificaciones, he0he1_global: { verificacion: v } },
    });
    // Portada «CTE 2013» y zona C3 frente a la del Demo: cumple, por revisar.
    expect(textos(fila(conInforme(verificacionDePrueba()), "he0he1_global"))).toEqual(["CE3X v2.3 · cumple, revisar"]);
    // HE1 lleva su veredicto; los avisos van solo en la global.
    const limpio = { ...verificacionDePrueba(), normativa: "CTE 2019" };
    delete limpio.zonaClimatica;
    expect(textos(fila(conInforme(limpio), "he0he1_global"))).toEqual(["CE3X v2.3 · cumple"]);
    expect(textos(fila(conInforme(limpio), "he1"))).toEqual(["CE3X v2.3 · cumple"]);
    const mal = { ...limpio, K: { valor: 0.7, limite: 0.66, cumple: false } };
    expect(textos(fila(conInforme(mal), "he0he1_global"))).toEqual(["CE3X v2.3 · no cumple"]);
    expect(textos(fila(conInforme(mal), "he1"))).toEqual(["CE3X v2.3 · cumple"]);
  });

  it("HS1 publicada: sus partes salen de «Qué entra», sin el terreno", () => {
    expect(textos(fila(demo(), "hs1"))).toEqual(["muros del sótano", "suelo del sótano", "fachadas", "cubierta"]);
  });

  it("HE 6 publicado (feature-24): la conducción de cables, con el aviso del uso característico", () => {
    expect(fila(demo(), "he6")).toMatchObject({ codigo: "HE6", ruta: "he/recarga", estado: "revisar" });
    expect(textos(fila(demo(), "he6"))).toEqual(["conducción 100 %"]);
  });

  it("REBT publicado (feature-23): la carga total, el grado y los contadores", () => {
    expect(fila(demo(), "rebt")).toMatchObject({ codigo: "REBT", ruta: "rebt/prevision", estado: "revisar" });
    expect(textos(fila(demo(), "rebt"))).toEqual(["91 kW", "elevada", "contadores en armario"]);
  });

  it("HR publicado (feature-25): tabiquería, separaciones, forjados y fachadas", () => {
    expect(fila(demo(), "hr")).toMatchObject({ codigo: "HR", ruta: "hr/ruido", estado: "revisar" });
    expect(textos(fila(demo(), "hr"))).toEqual(["tabiquería", "separaciones", "forjados", "fachadas"]);
  });

  it("las «pronto» solo nombran partes del edificio", () => {
    const p = demo();
    for (const g of filasObra(p))
      for (const f of g.filas)
        if (f.estado === "pronto") for (const t of textos(f)) expect(t, f.id).not.toMatch(/W\/m²|kW|l\/s/);
  });
});

describe("piezasDeQueEntra", () => {
  const r = resumenEdificio(demo().edificio);
  const f = (p: Partial<FilaQueEntra>): FilaQueEntra => ({ id: "x", titulo: "X", detalle: "", trato: "se calcula", estado: "normal", ...p });

  it("junta las viviendas en una pieza con su número", () => {
    const piezas = piezasDeQueEntra("hs3", [f({ id: "a", titulo: "Viviendas A" }), f({ id: "b", titulo: "Viviendas B" })], r);
    expect(piezas).toEqual([{ texto: "6 viviendas", acento: false }]);
  });

  it("el trato va si es una palabra, no una cifra", () => {
    expect(piezasDeQueEntra("hs3", [f({ titulo: "Garaje", trato: "1680 l/s" })], r)).toEqual([{ texto: "garaje", acento: false }]);
    expect(piezasDeQueEntra("hs5", [f({ titulo: "Garaje", trato: "bombeo", estado: "rv" })], r)).toEqual([
      { texto: "garaje · bombeo", acento: true },
    ]);
  });

  it("lo que queda fuera solo si va a otra norma; los datos de partida no son partes", () => {
    const filas = [
      f({ id: "garaje", titulo: "Garaje", trato: "no aplica", estado: "out" }),
      f({ id: "local", titulo: "Local", trato: "RITE", estado: "out" }),
      f({ id: "acometida", titulo: "Acometida", trato: "supuesta", estado: "rv" }),
    ];
    expect(piezasDeQueEntra("hs4", filas, r)).toEqual([{ texto: "local → RITE", acento: true }]);
  });
});

describe("recuento", () => {
  it("una a una, no por filas", () => {
    const r = recuentoObra(demo());
    expect(r).toMatchObject({ cumple: 5, revisar: 19, no_cumple: 0, no_aplica: 2, externo: 3, pronto: 0 });
    expect(textoRecuento(r)).toBe("5 cumple · 19 por revisar · 2 no aplica · 3 externo");
  });

  it("rotuloGrupo", () => {
    expect(rotuloGrupo("Salubridad (DB-HS)")).toBe("Salubridad · DB HS");
    expect(rotuloGrupo("Externas")).toBe("Externas");
  });
});
