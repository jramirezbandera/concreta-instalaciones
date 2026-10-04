import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import { renumerar } from "../../../lib/edificio/derivar";
import type { Edificio } from "../../../lib/edificio/tipos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { DatosGenerales } from "../../../lib/proyecto/tipos";
import { cambiarAscensor } from "../../sua/editar";
import { sua9 } from "../definicion";
import { sua9EstadoDefaults, type Sua9Estado } from "../estado";
import { justificarSua9, type ElementoSua9 } from "../justificacion";
import { aseosAccesiblesExigidos, CABINA_CORREGIDA, CABINA_DB, MECANISMOS_ACCESIBLES, plazasAccesiblesOtrosUsos } from "../tablas";

// =============================================================================
// SUA 9 · Accesibilidad (feature-20). Cifras y criterios:
// research/verificacion-sua9.md, bloques D1 a D8.
// =============================================================================

const dg = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const justificar = (edificio: Edificio, estado: Partial<Sua9Estado> = {}, datos: Partial<DatosGenerales> = {}) =>
  justificarSua9({ ...sua9EstadoDefaults, ...estado }, { edificio, datosGenerales: { ...dg, ...datos } });
const caso = (c: CasoEdificio, estado: Partial<Sua9Estado> = {}, datos: Partial<DatosGenerales> = {}) => justificar(edificioDeCaso(c), estado, datos);
const el = (j: ReturnType<typeof justificarSua9>, id: string): ElementoSua9 => j.elementos.find((e) => e.id === id)!;
const avisos = (j: ReturnType<typeof justificarSua9>) => j.avisos.map((a) => a.id);

/** Plurifamiliar con P1–P{n} de `porPlanta` viviendas A, PB con una A y la zona común, y garaje en S1… S{sotanos}. */
function plurifamiliar(plantas: number, porPlanta: number, sotanos = 1): Edificio {
  const e = edificioDeCaso("plurifamiliar");
  e.grupos[0].repeticiones = plantas;
  e.grupos[0].zonas[0].unidades = [{ tipoId: "A", cantidad: porPlanta }];
  if (sotanos === 0) e.grupos = e.grupos.slice(0, 2);
  else e.grupos[2].repeticiones = sotanos;
  return renumerar(e);
}

/** Oficinas en P1 con `util` m², vestíbulo en PB y, si se dice, garaje en S1. */
function oficinas(util: number, garaje?: { util: number; plazas: number; construida?: number }): Edificio {
  const e = edificioDeCaso("oficinas");
  e.grupos[0].repeticiones = 1;
  e.grupos[0].zonas[0].superficieUtil_m2 = util;
  e.grupos[1].zonas = [e.grupos[1].zonas[0]];
  if (garaje) {
    e.grupos[2].zonas[0].superficieUtil_m2 = garaje.util;
    e.grupos[2].zonas[0].plazas = garaje.plazas;
    if (garaje.construida !== undefined) e.grupos[2].zonas[0].superficieConstruida_m2 = garaje.construida;
  } else {
    e.grupos = e.grupos.slice(0, 2);
  }
  return renumerar(e);
}

describe("SUA9 · tablas", () => {
  it("cabina: tabla del DB y tabla corregida (comentario del Ministerio)", () => {
    expect(CABINA_DB.datos.filas.una_o_enfrentadas.sin_accesibles_o_hasta_1000).toEqual([{ anchura_m: 1, fondo_m: 1.25 }]);
    expect(CABINA_CORREGIDA.datos.filas.una_o_enfrentadas.sin_accesibles_o_hasta_1000).toEqual([{ anchura_m: 1, fondo_m: 1.3 }]);
    expect(CABINA_CORREGIDA.datos.filas.una_o_enfrentadas.con_accesibles_o_mas_1000).toEqual([{ anchura_m: 1.1, fondo_m: 1.4 }]);
    expect(CABINA_DB.datos.filas.en_angulo.con_accesibles_o_mas_1000).toEqual([{ anchura_m: 1.4, fondo_m: 1.4 }]);
    expect(CABINA_CORREGIDA.datos.filas.en_angulo.sin_accesibles_o_hasta_1000).toEqual([
      { anchura_m: 1.4, fondo_m: 1.6 },
      { anchura_m: 1.6, fondo_m: 1.4 },
    ]);
    expect(CABINA_CORREGIDA.procedencia.edicion).toMatch(/no reglamentario/);
  });

  it("mecanismos a 35 cm del rincón, no 40", () => {
    expect(MECANISMOS_ACCESIBLES.datos.aRincon_cm).toBe(35);
  });

  it("plazas en otros usos: una cada 50 o fracción hasta 200, y una más cada 100", () => {
    expect([0, 1, 50, 51, 100, 200, 201, 300, 301].map(plazasAccesiblesOtrosUsos)).toEqual([0, 1, 1, 2, 2, 4, 5, 5, 6]);
  });

  it("aseos: uno cada 10 inodoros o fracción", () => {
    expect([0, 1, 10, 11, 20, 21].map(aseosAccesiblesExigidos)).toEqual([0, 1, 1, 2, 2, 3]);
  });
});

describe("SUA9 · los cuatro casos", () => {
  it("unifamiliar: no le es exigible; un solo elemento", () => {
    const j = caso("unifamiliar");
    expect(j.elementos.map((e) => e.id)).toEqual(["ambito"]);
    expect(j.veredicto).toBe("ok");
    expect(j.avisos).toEqual([]);
  });

  it("plurifamiliar PB+3 con garaje: ascensor por las plantas, cabina 1,00 × 1,30, pasillo 1,10", () => {
    const j = caso("plurifamiliar");
    const a = el(j, "ascensor").detalle;
    expect(a).toMatchObject({ clase: "ascensor", exigido: true, motivos: ["plantas"], plantasASalvar: 3, viviendasSinEntrada: 6, hay: true, supuesto: true });
    expect(el(j, "cabina").detalle).toMatchObject({ ancho_m: 1, fondo_m: 1.3, cumple: true });
    expect(el(j, "plantas").detalle).toMatchObject({ minimo_m: 1.1 });
    expect(el(j, "plazas").detalle).toMatchObject({ exigidas: 0 });
    expect(avisos(j)).toEqual(["viviendas-accesibles"]);
    expect(j.veredicto).toBe("ok");
  });

  it("plurifamiliar con locales: el local queda previsto", () => {
    const j = caso("plurifamiliar_locales");
    expect(el(j, "local").veredicto).toBe("previsto");
    expect(el(j, "ascensor").detalle).toMatchObject({ exigido: true });
  });

  it("oficinas: más de 200 m² sin entrada y plaza accesible en el sótano; 1 de 10 plazas; 1 aseo; pasillo 1,20", () => {
    const j = caso("oficinas");
    expect(el(j, "ascensor").detalle).toMatchObject({ exigido: true, motivos: ["superficie", "elementos"], plantasASalvar: 2, utilSinEntrada_m2: 940 });
    expect(el(j, "plazas").detalle).toMatchObject({ exigidas: 1, plazas: 10 });
    expect(el(j, "aseos").detalle).toMatchObject({ inodoros: 8, exigidos: 1 });
    expect(el(j, "cabina").detalle).toMatchObject({ columna: "sin_accesibles_o_hasta_1000", utilFueraAcceso_m2: 940 });
    expect(el(j, "plantas").detalle).toMatchObject({ minimo_m: 1.2 });
    expect(j.elementos.some((e) => e.id === "viviendas")).toBe(false);
    expect(j.veredicto).toBe("ok");
  });
});

describe("SUA9 · entre plantas (bordes)", () => {
  it("12 viviendas sin entrada no exigen ascensor; 13 o más, sí (estricto)", () => {
    const doce = justificar(plurifamiliar(2, 6, 0));
    expect(el(doce, "ascensor").detalle).toMatchObject({ viviendasSinEntrada: 12, plantasASalvar: 2, exigido: false, hay: false });
    expect(el(doce, "ascensor").veredicto).toBe("ok");
    expect(el(doce, "ascensor").valor).toEqual({ texto: "previsión de ascensor" });
    expect(doce.elementos.some((e) => e.id === "cabina")).toBe(false);
    const catorce = justificar(plurifamiliar(2, 7, 0));
    expect(el(catorce, "ascensor").detalle).toMatchObject({ viviendasSinEntrada: 14, exigido: true, motivos: ["viviendas"] });
  });

  it("las plantas se cuentan en cada sentido: −1 + PB + 2 no exige; un garaje en S3 sí", () => {
    expect(el(justificar(plurifamiliar(2, 2, 1)), "ascensor").detalle).toMatchObject({ plantasASalvar: 2, exigido: false });
    expect(el(justificar(plurifamiliar(2, 2, 3)), "ascensor").detalle).toMatchObject({ plantasASalvar: 3, exigido: true, motivos: ["plantas"] });
  });

  it("la cubierta transitable de uso comunitario cuenta como planta", () => {
    const e = plurifamiliar(2, 2, 0);
    e.cubierta.tipo = "plana_transitable";
    expect(el(justificar(e), "ascensor").detalle).toMatchObject({ exigido: false });
    expect(el(justificar(e, { cubierta: "comunitaria" }), "ascensor").detalle).toMatchObject({ plantasASalvar: 3, exigido: true, motivos: ["cubierta"], cubierta: true });
  });

  it("oficinas: 200 m² útiles sin entrada no lo exigen; 201, sí; sin previsión", () => {
    const j = justificar(oficinas(200));
    expect(el(j, "ascensor").detalle).toMatchObject({ utilSinEntrada_m2: 200, exigido: false, hay: false });
    expect(el(j, "ascensor").valor).toEqual({ texto: "no se exige" });
    expect(el(justificar(oficinas(201)), "ascensor").detalle).toMatchObject({ exigido: true, motivos: ["superficie"] });
  });

  it("exigido y El edificio dice que no hay: no cumple, y el arreglo pone el ascensor en El edificio", () => {
    const j = justificar(cambiarAscensor(edificioDeCaso("plurifamiliar"), false));
    const a = el(j, "ascensor");
    expect(a.veredicto).toBe("fail");
    expect(j.veredicto).toBe("fail");
    const arreglo = sua9.arreglo!(a, j)!;
    expect(arreglo.cambios).toEqual({});
    expect(arreglo.edificio!(edificioDeCaso("plurifamiliar")).ascensor).toBe(true);
    expect(sua9.textoIncumplimiento(a)?.titulo).toMatch(/Falta el ascensor/);
    expect(j.elementos.some((e) => e.id === "cabina")).toBe(false);
  });

  it("viviendas accesibles para silla de ruedas fuera de la PB: ascensor siempre, con aviso si la PB podría alojarlas", () => {
    const una = justificar(plurifamiliar(1, 4, 0), { viviendasSR: 1 });
    expect(el(una, "ascensor").detalle).toMatchObject({ exigido: true, motivos: ["accesibles"] });
    expect(avisos(una)).toContain("accesibles-planta");
    // En la PB solo hay una vivienda: con dos accesibles, alguna está arriba seguro.
    const dos = justificar(plurifamiliar(1, 4, 0), { viviendasSR: 2 });
    expect(avisos(dos)).not.toContain("accesibles-planta");
  });
});

describe("SUA9 · cabina", () => {
  it("1,00 × 1,25 cumple el DB pero no la tabla corregida; el arreglo vuelve a la mínima", () => {
    const j = caso("plurifamiliar", { cabinaAncho_m: 1, cabinaFondo_m: 1.25 });
    const c = el(j, "cabina");
    expect(c.veredicto).toBe("fail");
    expect(c.detalle).toMatchObject({ cumple: false, cumpleDb: true });
    expect(sua9.arreglo!(c, j)).toEqual({ etiqueta: "Cabina mínima de la tabla", cambios: { cabinaAncho_m: null, cabinaFondo_m: null } });
    expect(el(caso("plurifamiliar", { cabinaAncho_m: 1, cabinaFondo_m: 1.3 }), "cabina").veredicto).toBe("ok");
  });

  it("dos puertas en ángulo: 1,60 × 1,40 vale; 1,40 × 1,40 (el DB) no", () => {
    expect(el(caso("plurifamiliar", { puertasCabina: "en_angulo", cabinaAncho_m: 1.6, cabinaFondo_m: 1.4 }), "cabina").veredicto).toBe("ok");
    expect(el(caso("plurifamiliar", { puertasCabina: "en_angulo", cabinaAncho_m: 1.4, cabinaFondo_m: 1.4 }), "cabina").detalle).toMatchObject({ cumple: false, cumpleDb: true });
  });

  it("con viviendas accesibles para silla de ruedas, la columna mayor: 1,10 × 1,40", () => {
    const j = caso("plurifamiliar", { viviendasSR: 1 });
    expect(el(j, "cabina").detalle).toMatchObject({ columna: "con_accesibles_o_mas_1000", ancho_m: 1.1, fondo_m: 1.4 });
  });
});

describe("SUA9 · exterior, plantas y dotación", () => {
  it("entrada con escalones: no cumple y el arreglo es la rampa", () => {
    const j = caso("plurifamiliar", { entrada: "escalones" });
    const e = el(j, "exterior");
    expect(e.veredicto).toBe("fail");
    expect(sua9.arreglo!(e, j)).toEqual({ etiqueta: "Rampa accesible en la parcela", cambios: { entrada: "rampa" } });
  });

  it("pasillos: 1,10 vale en vivienda (borde incluido), no en oficinas", () => {
    expect(el(caso("plurifamiliar", { pasillo_m: 1.1 }), "plantas").veredicto).toBe("ok");
    const estrecho = caso("plurifamiliar", { pasillo_m: 1.05 });
    expect(el(estrecho, "plantas").veredicto).toBe("fail");
    expect(sua9.arreglo!(el(estrecho, "plantas"), estrecho)?.cambios).toEqual({ pasillo_m: 1.1 });
    expect(el(caso("oficinas", { pasillo_m: 1.1 }), "plantas").veredicto).toBe("fail");
    expect(el(caso("oficinas", { pasillo_m: 1.2 }), "plantas").veredicto).toBe("ok");
  });

  it("viviendas accesibles: sin indicar, aviso revisable; indicadas, plazas y vivienda accesible fuera de alcance", () => {
    const j = caso("plurifamiliar", { viviendasSR: 2, viviendasAuditiva: 1 });
    expect(avisos(j)).not.toContain("viviendas-accesibles");
    expect(avisos(j)).toContain("vivienda-accesible");
    expect(el(j, "vivienda-accesible").veredicto).toBe("fuera");
    expect(el(j, "plazas").detalle).toMatchObject({ exigidas: 2 });
    // Solo auditiva: equipamiento, sin aviso.
    const aud = caso("plurifamiliar", { viviendasAuditiva: 1 });
    expect(el(aud, "vivienda-accesible").veredicto).toBe("ok");
    expect(avisos(aud)).toEqual([]);
  });

  it("más plazas accesibles que plazas: no cumple", () => {
    const j = justificar(plurifamiliar(3, 8, 1), { viviendasSR: 20 });
    expect(el(j, "plazas").veredicto).toBe("fail");
  });

  it("piscina comunitaria: grúa solo con viviendas accesibles para silla de ruedas", () => {
    expect(el(caso("plurifamiliar", {}, { tienePiscina: true }), "piscina").detalle).toEqual({ clase: "piscina", exige: false });
    expect(el(caso("plurifamiliar", { viviendasSR: 1 }, { tienePiscina: true }), "piscina").detalle).toEqual({ clase: "piscina", exige: true });
    expect(caso("plurifamiliar").elementos.some((e) => e.id === "piscina")).toBe(false);
  });

  it("garaje de oficinas: la construida decide; se avisa solo si cambia el resultado", () => {
    const supuesta = justificar(oficinas(150, { util: 90, plazas: 4 }));
    expect(el(supuesta, "plazas").detalle).toMatchObject({ exigidas: 1, usoAparcamiento: true, supuesta: true });
    expect(avisos(supuesta)).toContain("construida-garaje");
    const dada = justificar(oficinas(150, { util: 90, plazas: 4, construida: 95 }));
    expect(el(dada, "plazas").detalle).toMatchObject({ exigidas: 0 });
    expect(avisos(dada)).not.toContain("construida-garaje");
    expect(avisos(justificar(oficinas(150, { util: 300, plazas: 10 })))).not.toContain("construida-garaje");
  });

  it("oficinas sin núcleos de aseos: se supone uno y se avisa; la oficina pequeña admite la excepción", () => {
    const e = oficinas(80);
    e.grupos[0].zonas[0].unidades = [];
    const j = justificar(e);
    expect(el(j, "aseos").detalle).toMatchObject({ inodoros: 1, inodorosSupuestos: true, exigidos: 1 });
    expect(avisos(j)).toContain("sin-aseos");
    expect(el(justificar(e, { aseoPequeno: "excepcion" }), "aseos").detalle).toMatchObject({ exigidos: 0, excepcion: true });
    // Con más de 100 m² útiles la excepción no cabe.
    expect(el(justificar(oficinas(320), { aseoPequeno: "excepcion" }), "aseos").detalle).toMatchObject({ excepcion: false });
  });

  it("atención al público: punto de atención accesible", () => {
    expect(caso("oficinas", { atencionPublico: "si" }).elementos.some((e) => e.id === "atencion")).toBe(true);
    expect(caso("oficinas").elementos.some((e) => e.id === "atencion")).toBe(false);
  });

  it("unifamiliar que debe ser accesible: silla de ruedas fuera de alcance con aviso; auditiva, cumple", () => {
    const silla = caso("unifamiliar", { unifamiliar: "silla" });
    expect(silla.elementos.map((e) => e.id)).toEqual(["vivienda-accesible"]);
    expect(el(silla, "vivienda-accesible").veredicto).toBe("fuera");
    expect(avisos(silla)).toEqual(["vivienda-accesible"]);
    const aud = caso("unifamiliar", { unifamiliar: "auditiva" });
    expect(el(aud, "vivienda-accesible").veredicto).toBe("ok");
    expect(aud.avisos).toEqual([]);
  });
});

describe("SUA9 · memoria, ficha y dibujo", () => {
  it("los cuatro casos dan memoria, ficha y dibujo", () => {
    for (const c of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as const) {
      const j = caso(c);
      const texto = textoPlanoMemoria(sua9.memoria(j));
      expect(texto).toMatch(/SUA 9/);
      const dibujo = sua9.dibujo(j, edificioDeCaso(c));
      for (const et of dibujo.etiquetas) expect(j.elementos.some((e) => e.id === et.elementoId)).toBe(true);
      const ficha = sua9.ficha(j, { estado: sua9EstadoDefaults, edificio: edificioDeCaso(c), revisados: [], svg: { nativeW: dibujo.ancho, nativeH: dibujo.alto } });
      expect(ficha.edicionDB).toBe("DB-SUA (consolidado 14-jun-2022)");
      expect(ficha.verificaciones).toHaveLength(j.elementos.length);
      expect(sua9.frase(j).length).toBeGreaterThan(20);
      expect(sua9.queEntra(j, {}).length).toBeGreaterThan(0);
      for (const e of j.elementos) {
        expect(sua9.franja(e, j, "ok").cita).toMatch(/DB-SUA/);
        expect(sua9.etiqueta(e).length).toBeGreaterThan(0);
        expect(sua9.resultadoLista(e).length).toBeGreaterThan(0);
      }
    }
  });

  it("memoria de la unifamiliar: la frase del ámbito", () => {
    expect(textoPlanoMemoria(sua9.memoria(caso("unifamiliar")))).toMatch(/no le son exigibles las condiciones de la Sección SUA 9/);
  });

  it("memoria de la plurifamiliar: ascensor, cabina con las dos tablas, itinerario y señalización", () => {
    const t = textoPlanoMemoria(sua9.memoria(caso("plurifamiliar")));
    expect(t).toMatch(/Al haber que salvar 3 plantas desde la entrada, el edificio dispone de ascensor accesible/);
    expect(t).toMatch(/1,00 × 1,25 m con UNE-EN 81-70:2004/);
    expect(t).toMatch(/1,00 × 1,30 m/);
    expect(t).toMatch(/≥ 1,10 m/);
    expect(t).toMatch(/a 35 cm como mínimo de los encuentros en rincón/);
    expect(t).toMatch(/no dispone de viviendas accesibles/);
    expect(t).toMatch(/Braille y arábigo/);
  });

  it("memoria sin ascensor exigido: la previsión", () => {
    const t = textoPlanoMemoria(sua9.memoria(justificar(plurifamiliar(2, 6, 0))));
    expect(t).toMatch(/no se exige ascensor accesible/);
    expect(t).toMatch(/se prevé dimensional y estructuralmente su instalación/);
  });

  it("dibujo: la previsión va en discontinuo; las plazas accesibles con su símbolo", () => {
    const sin = sua9.dibujo(justificar(plurifamiliar(2, 6, 0)), plurifamiliar(2, 6, 0));
    const hueco = sin.marcas.find((x) => x.key === "hueco-izq");
    expect(hueco && hueco.tipo === "linea" && hueco.dash).toBeTruthy();
    const ofi = sua9.dibujo(caso("oficinas"), edificioDeCaso("oficinas"));
    expect(ofi.marcas.some((x) => x.tipo === "icono" && x.icono === "accesible" && x.elementoId === "plazas")).toBe(true);
    expect(ofi.marcas.some((x) => x.tipo === "icono" && x.icono === "ascensor")).toBe(true);
  });
});
