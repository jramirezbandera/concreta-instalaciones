import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { DatosGenerales, Proyecto } from "../../../lib/proyecto/tipos";
import { dRASuelo, dRATecho, dRATrasdosado, solucionDe } from "../catalogo";
import { comprobarFachada, comprobarHorizontal, comprobarVertical, type EntradaVertical, type FachadaFlanco } from "../comprobar";
import { hr } from "../definicion";
import { hrEstadoDefaults, type HrEstado } from "../estado";
import { justificarHr, type DetalleHr, type JustificacionHr } from "../justificacion";
import { exigenciaExterior, mixto, tramoHuecos } from "../tablas";

// =============================================================================
// DB-HR · Protección frente al ruido, opción simplificada (feature-25). Cifras y
// criterios: research/verificacion-hr.md (DB y Guía) y verificacion-hr-cec.md
// (Catálogo). Los ejemplos son los de esos documentos.
// =============================================================================

const demo = crearProyectoDemo("2026-10-05T10:00:00.000Z");
type Justs = Proyecto["justificaciones"];
const con = (edificio: Edificio, estado: Partial<HrEstado> = {}, dg: Partial<DatosGenerales> = {}, justificaciones: Justs = {}): JustificacionHr =>
  justificarHr({ ...hrEstadoDefaults, ...estado }, { edificio, datosGenerales: { ...demo.datosGenerales, ...dg }, justificaciones });
const detalle = <C extends DetalleHr["clase"]>(j: JustificacionHr, id: string) => j.elementos.find((e) => e.id === id)?.detalle as Extract<DetalleHr, { clase: C }> | undefined;
const veredicto = (j: JustificacionHr, id: string) => j.elementos.find((e) => e.id === id)?.veredicto;
const ids = (j: JustificacionHr) => j.elementos.map((e) => e.id);
const avisos = (j: JustificacionHr) => j.avisos.map((a) => a.id);
const medianeras = (v: "si" | "no"): Justs => ({ si2: { inputs: { medianeras: v } } }) as unknown as Justs;

/** Fachada de dos hojas de ½ pie y LHD (F 3.1), la de por defecto. */
const F31: FachadaFlanco = { clase: "dos_hojas", interior: "fabrica", aislExterior: false, principal: { m: 135, RA: 41 }, hojaInterior: null };
const SATE: FachadaFlanco = { clase: "una_hoja", interior: "fabrica", aislExterior: true, principal: { m: 161, RA: 42 }, hojaInterior: null };

const vertical = (e: Partial<EntradaVertical>) =>
  comprobarVertical({
    tipo: 1, m: 150, RA: 42, dRA: null, unaCara: false, columna: "fabrica", tabiqueria: "bandas", paren: false, instalaciones: false,
    forjadoM: 372, sueloDRA: 4, techoDRA: 0, fachada: F31, ...e,
  });

describe("HR · las tablas", () => {
  it("tabla 2.1: dormitorios y estancias por Ld; aeronaves + 4; fachada no expuesta, Ld − 10 (no con aeronaves)", () => {
    expect([60, 63, 70, 72, 76].map((ld) => exigenciaExterior(ld, "dormitorios", false, false).D)).toEqual([30, 32, 37, 42, 47]);
    expect([60, 63, 70, 72, 76].map((ld) => exigenciaExterior(ld, "estancias", false, false).D)).toEqual([30, 30, 32, 37, 42]);
    expect(exigenciaExterior(70, "dormitorios", true, false).D).toBe(41);
    expect(exigenciaExterior(70, "dormitorios", false, true)).toEqual({ ld: 60, D: 30 });
    expect(exigenciaExterior(70, "dormitorios", true, true)).toEqual({ ld: 70, D: 41 });
  });

  it("tabla 3.4: la fila de mayor parte ciega que no supera la del proyecto; tramos inclusivos", () => {
    expect([0, 15, 15.4, 30, 60, 80, 81].map(tramoHuecos)).toEqual([0, 0, 1, 1, 2, 3, 4]);
    expect(comprobarFachada(30, 45, 28.9, 20)).toEqual({ cumple: true, nivel: 30, ciegaExigida: 45, huecoExigido: 28 });
    expect(comprobarFachada(30, 38, 29, 20)).toMatchObject({ cumple: true, ciegaExigida: 35, huecoExigido: 29 });
    expect(comprobarFachada(30, 34, 40, 20)).toMatchObject({ cumple: false, ciegaExigida: 35 });
    expect(comprobarFachada(37, 50, null, 0)).toMatchObject({ cumple: true, ciegaExigida: 39, huecoExigido: null });
    expect(comprobarFachada(42, 60, 44, 90)).toMatchObject({ cumple: true, huecoExigido: 44 });
    // Un nivel que no está (una ordenanza): el superior más próximo (K-HR.8).
    expect(comprobarFachada(31, 45, 30, 20)).toMatchObject({ nivel: 32, huecoExigido: 29 });
  });

  it("ventana y caja de persiana con la G.1 (criterio K-CEC.8): 30 + CP1 = 28,9", () => {
    expect(mixto([{ fraccion: 1 - 0.2 / 1.5, R: 30 }, { fraccion: 0.2 / 1.5, R: 25 }])).toBe(28.9);
  });

  it("el Catálogo: masa intermedia del trasdosado por arriba; suelo y techo por la masa del forjado", () => {
    expect(dRATrasdosado(solucionDe("trasdosado", "tr-autoportante-pyl-lm"), 150)).toBe(14);
    expect(dRATrasdosado(solucionDe("trasdosado", "tr-autoportante-pyl-lm"), 500)).toBe(7);
    expect(dRATrasdosado(solucionDe("trasdosado", "tr-ceramico-lh50-lm"), 284)).toBe(0);
    expect(dRASuelo(solucionDe("suelo", "sf-mortero-lm20"), 372)).toBe(6);
    expect(dRASuelo(solucionDe("suelo", "sf-mortero-lm20"), 625)).toBe(0);
    expect(dRATecho(solucionDe("techo", "ts-pyl15-lm50-c100"), 372)).toBe(7);
    expect(dRATecho(solucionDe("techo", "ts-pyl15-lm50-c100"), 333)).toBe(13);
  });
});

describe("HR · tabla 3.2", () => {
  it("LP ½ pie con trasdosado autoportante y tabiquería de fábrica: pide 16 y da 14 (verificacion-hr-cec B)", () => {
    const r = vertical({ m: 150, RA: 42, dRA: 14 });
    expect(r.cumple).toBe(false);
    expect(r.fila).toMatchObject({ m: 150, RA: 41 });
    expect(r.dRAExigido).toBe(16);
  });

  it("tipo 2 de doble LHD con bandas (P3.1): no cumple con el mínimo (53 < 54), sí con el medio", () => {
    const bandas = { en: "dos" as const, hojaM: 89 };
    expect(vertical({ tipo: 2, m: 148, RA: 53, bandas }).cumple).toBe(false);
    expect(vertical({ tipo: 2, m: 170, RA: 55, bandas }).cumple).toBe(true);
  });

  it("tipo 2 contra una fachada de una hoja: menos de 170 kg/m² no se permite", () => {
    const r = vertical({ tipo: 2, m: 148, RA: 55, bandas: { en: "dos", hojaM: 89 }, fachada: SATE });
    expect(r.cumple).toBe(false);
    expect(r.flancos[0].texto).toMatch(/no permitido/);
  });

  it("sin nota 11, 12 o 13, el forjado de 300 kg/m² (pto 5)", () => {
    expect(vertical({ tipo: 2, m: 184, RA: 58, bandas: { en: "una", hojaM: 89, apoyadaRA: 42 }, forjadoM: 290 }).cumple).toBe(false);
    expect(vertical({ tipo: 2, m: 184, RA: 58, bandas: { en: "una", hojaM: 89, apoyadaRA: 42 }, forjadoM: 300 }).cumple).toBe(true);
  });

  it("entre paréntesis: hormigón de 16 cm con trasdosado autoportante, fila 400/57 (6)⁽¹³⁾", () => {
    const r = vertical({ m: 400, RA: 57, dRA: 7, paren: true });
    expect(r.cumple).toBe(true);
    expect(r.alt).toMatchObject({ dRA: 6, paren: true, notas: [13] });
    // Trasdosado por una cara: + 4 dBA.
    expect(vertical({ m: 400, RA: 57, dRA: 7, paren: true, unaCara: true }).cumple).toBe(false);
  });

  it("tipo 1 contra una fachada de una hoja no vale junto a un recinto de instalaciones", () => {
    const r = vertical({ m: 400, RA: 57, dRA: 7, paren: true, instalaciones: true, fachada: SATE });
    expect(r.cumple).toBe(false);
    expect(r.flancos.some((c) => c.cumple === false && /instalaciones/.test(c.texto))).toBe(true);
  });
});

describe("HR · tabla 3.3", () => {
  const H = { columna: "BE" as const, caso: "normal" as const, dLw: "normal" as const, garaje: false, sueloDLw: 19, sueloDRA: 4, techoDRA: 0 };

  it("forjado de 372 kg/m² con bandas: fila 350/54, ΔLw ≥ 15 y (0 ; 0)", () => {
    const r = comprobarHorizontal({ ...H, forjado: { m: 372, RA: 55, eps: false } });
    expect(r).toMatchObject({ cumple: true, dLwExigido: 15, comb: { sf: 0, ts: 0 } });
    expect(r.fila).toMatchObject({ m: 350 });
  });

  it("EPS: el ΔLw de las filas con nota (4) sube 4 dB", () => {
    const r = comprobarHorizontal({ ...H, forjado: { m: 300, RA: 52, eps: true } });
    expect(r).toMatchObject({ cumple: false, dLwExigido: 20 });
    expect(comprobarHorizontal({ ...H, forjado: { m: 300, RA: 52, eps: true }, sueloDLw: 20 }).cumple).toBe(true);
  });

  it("garaje bajo viviendas (Guía, figura 2.1.4.11): forjado 400, bandas, (6) ; (0) sin techo y el ΔLw sin paréntesis", () => {
    const r = comprobarHorizontal({ ...H, forjado: { m: 400, RA: 57, eps: false }, caso: "paren", garaje: true, sueloDLw: 12, sueloDRA: 6 });
    expect(r).toMatchObject({ cumple: true, dLwExigido: 12, comb: { sf: 6, ts: 0 } });
    expect(comprobarHorizontal({ ...H, forjado: { m: 400, RA: 57, eps: false }, caso: "paren", garaje: true, sueloDLw: 12, sueloDRA: 5 }).cumple).toBe(false);
  });

  it("instalaciones encima de viviendas (Guía p. 85): ΔLw ≥ 21, suelo ΔRA ≥ 3 y techo ≥ 15", () => {
    const e = { ...H, forjado: { m: 300, RA: 52, eps: false }, caso: "paren" as const, dLw: "paren" as const, sueloDLw: 21, sueloDRA: 3, techoDRA: 15 };
    expect(comprobarHorizontal(e)).toMatchObject({ cumple: true, dLwExigido: 21, comb: { sf: 3, ts: 15 } });
    expect(comprobarHorizontal({ ...e, techoDRA: 14 }).cumple).toBe(false);
  });

  it("tabiquería con apoyo directo: con forjados de menos de 300 kg/m² no hay solución", () => {
    const r = comprobarHorizontal({ ...H, columna: "AD", forjado: { m: 250, RA: 49, eps: false } });
    expect(r.cumple).toBe(false);
    expect(r.fila).toBeNull();
  });
});

describe("HR · el Demo (plurifamiliar con local)", () => {
  const j = con(demo.edificio, {}, {}, demo.justificaciones);

  it("los elementos, todos cumplen, y los avisos del Ld, los huecos y el local", () => {
    expect(ids(j)).toEqual([
      "tabiqueria", "separacion", "puerta", "ascensor", "forjado-viviendas", "forjado-comun", "forjado-actividad",
      "medianeria", "fachada-dormitorios", "fachada-estancias", "cubierta", "instalaciones",
    ]);
    expect(j.veredicto).toBe("ok");
    expect(avisos(j)).toEqual(["huecos", "ld", "local"]);
    expect(hr.frase(j)).toBe("6 viviendas con Ld 60 dBA: tabiquería, separaciones, forjados y fachadas cumplen la opción simplificada.");
  });

  it("entre viviendas, el tipo 2 de ½ pie y LH con bandas, fila 170/54 sin trasdosado", () => {
    expect(detalle<"vertical">(j, "separacion")?.r).toMatchObject({ cumple: true, fila: { tipo: 2, m: 170, RA: 54 }, dRAExigido: null });
  });

  it("sobre el local, la combinación entre paréntesis con el techo del local", () => {
    const d = detalle<"horizontal">(j, "forjado-actividad");
    expect(d).toMatchObject({ techo: { dRA: 7 }, suelo: { dRA: 4 }, r: { cumple: true, comb: { sf: 4, ts: 5 } } });
    // Sin techo en el local, no llega.
    expect(veredicto(con(demo.edificio, { techoBajo: null }, {}, demo.justificaciones), "forjado-actividad")).toBe("fail");
  });

  it("con el Ld de una calle ruidosa, la parte ciega de la fachada ya no llega", () => {
    const k = con(demo.edificio, {}, { ldZona: 75 }, demo.justificaciones);
    expect(detalle<"exterior">(k, "fachada-dormitorios")).toMatchObject({ D: 42, r: { cumple: false, ciegaExigida: 50 } });
    expect(hr.textoIncumplimiento(k.elementos.find((e) => e.id === "fachada-dormitorios")!)?.titulo).toBe("La parte ciega no llega a ninguna fila de la tabla 3.4.");
    expect(avisos(k)).not.toContain("ld");
  });

  it("la memoria: ámbito, Ld, cada elemento con su tabla y la reverberación que no se aplica", () => {
    const t = textoPlanoMemoria(hr.memoria(j));
    expect(t).toContain("le es de aplicación el DB-HR (Introducción II)");
    expect(t).toContain("Ld = 60 dBA");
    expect(t).toContain("Fila de la tabla 3.2: m ≥ 170 kg/m², RA ≥ 54 dBA, sin trasdosado");
    expect(t).toContain("no le son de aplicación los valores límite de tiempo de reverberación");
    expect(hr.memoria(j).tabla?.filas.length).toBe(11);
  });

  it("en un edificio existente, no se aplica", () => {
    const k = con(demo.edificio, {}, { intervencion: "reforma" }, demo.justificaciones);
    expect(k.aplica).toBe(false);
    expect(hr.frase(k)).toMatch(/solo se aplica a la rehabilitación integral/);
  });
});

describe("HR · los valores medios del Catálogo", () => {
  it("con P3.1 no cumple con el mínimo: avisa y el arreglo pasa a los medios", () => {
    const j = con(demo.edificio, { separacion: { id: "sv2-lhd-lhd-bandas" } }, {}, demo.justificaciones);
    expect(veredicto(j, "separacion")).toBe("fail");
    expect(avisos(j)).toContain("medios");
    const el = j.elementos.find((e) => e.id === "separacion")!;
    expect(hr.arreglo!(el, j)).toEqual({ etiqueta: "Usar los valores medios del Catálogo", cambios: { medios: true } });
    expect(veredicto(con(demo.edificio, { separacion: { id: "sv2-lhd-lhd-bandas" }, medios: true }, {}, demo.justificaciones), "separacion")).toBe("ok");
  });

  it("los valores propios sustituyen a los del Catálogo", () => {
    const j = con(demo.edificio, { separacion: { id: "sv2-lhd-lhd-bandas", valores: { RA: 55 } } }, {}, demo.justificaciones);
    expect(detalle<"vertical">(j, "separacion")).toMatchObject({ RA: 55, sol: { propios: true } });
    expect(veredicto(j, "separacion")).toBe("ok");
  });
});

describe("HR · la unifamiliar", () => {
  it("aislada: tabiquería de 33 dBA, fachada, cubierta e instalaciones; sin separaciones", () => {
    const j = con(edificioDeCaso("unifamiliar"));
    expect(j.tipologia).toBe("aislada");
    expect(ids(j)).toEqual(["tabiqueria", "fachada-dormitorios", "fachada-estancias", "cubierta", "instalaciones"]);
    // Gran formato con apoyo directo (33 dBA): vale en la aislada, no en un edificio de viviendas (35).
    const gf = { tabiqueria: { id: "tab-lhgf70-yeso" }, apoyo: "directo" as const };
    expect(veredicto(con(edificioDeCaso("unifamiliar"), gf), "tabiqueria")).toBe("ok");
    expect(veredicto(con(demo.edificio, gf, {}, demo.justificaciones), "tabiqueria")).toBe("fail");
  });

  it("adosada (medianeras de SI 2) con estructura independiente: dos hojas de 45 dBA; el ½ pie no llega", () => {
    const j = con(edificioDeCaso("unifamiliar"), { estructura: "independiente" }, {}, medianeras("si"));
    expect(j.tipologia).toBe("adosada");
    expect(ids(j)).toContain("adosada");
    expect(veredicto(j, "adosada")).toBe("ok");
    expect(veredicto(con(edificioDeCaso("unifamiliar"), { estructura: "independiente", hojaAdosada: { id: "sv-lp115-yeso" } }, {}, medianeras("si")), "adosada")).toBe("fail");
  });

  it("adosada con estructura compartida: tabla 3.2 y el suelo flotante de la tabla I.1", () => {
    const j = con(edificioDeCaso("unifamiliar"), {}, {}, medianeras("si"));
    expect(ids(j)).toEqual(["tabiqueria", "separacion", "forjado-adosada", "fachada-dormitorios", "fachada-estancias", "cubierta", "instalaciones"]);
    // Forjado 372 (fila 300) y separación de tipo 2: ΔLw ≥ 11 y ΔRA ≥ 0.
    expect(detalle<"forjado-adosada">(j, "forjado-adosada")?.r).toMatchObject({ cumple: true, dLwExigido: 11, dRAExigido: 0 });
  });
});

describe("HR · los otros edificios de ejemplo", () => {
  it("plurifamiliar con garaje bajo las viviendas: el forjado sobre el garaje entre paréntesis", () => {
    const j = con(edificioDeCaso("plurifamiliar"));
    expect(detalle<"horizontal">(j, "forjado-actividad")).toMatchObject({ garaje: true, separa: ["Garaje (S1)"] });
    expect(j.elementos.find((e) => e.id === "instalaciones")?.detalle).toMatchObject({ condiciones: expect.arrayContaining([expect.stringMatching(/humos del garaje/)]) });
  });

  it("oficinas sin viviendas: solo el ruido exterior, con su aviso", () => {
    const j = con(edificioDeCaso("oficinas"));
    expect(j.tipologia).toBe("otros");
    expect(ids(j)).not.toContain("tabiqueria");
    expect(ids(j)).toContain("fachada-estancias");
    expect(avisos(j)).toContain("otros");
  });

  it("el ascensor con la maquinaria en un cuarto: RA del cerramiento mayor que 50", () => {
    const j = con(demo.edificio, { ascensor: "cuarto" }, {}, demo.justificaciones);
    expect(detalle<"ascensor">(j, "ascensor")).toMatchObject({ modo: "cuarto", RA: 58, r: null });
    expect(veredicto(j, "ascensor")).toBe("ok");
  });
});
