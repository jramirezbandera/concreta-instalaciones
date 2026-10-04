// Montar El edificio a partir de las filas del cuadro de superficies (feature-13).
// Las filas son las que devolvería la IA ya leídas; aquí no hay red.

import { describe, expect, it } from "vitest";
import { edificioDeCaso } from "../casos";
import { plantasDe, resumenEdificio, validarEdificio } from "../derivar";
import type { FilaLeida } from "../cuadro/leer";
import {
  corregirFila,
  filasRevisables,
  montarEdificio,
  motivoDescarte,
  type FilaRevisable,
} from "../cuadro/montar";
import type { Edificio, Zona } from "../tipos";

const BASE = edificioDeCaso("plurifamiliar");

function fila(p: Partial<FilaLeida> & Pick<FilaLeida, "texto">): FilaLeida {
  return {
    pagina: 1,
    nivel: 0,
    plantas: 1,
    superficie_m2: 0,
    tipoSuperficie: "util",
    que: "otro",
    estancia: "otra",
    unidad: "",
    tipoVivienda: "",
    dormitorios: 0,
    banos: 0,
    aseos: 0,
    plazas: 0,
    numero: 0,
    confianza: "alta",
    nota: "",
    ...p,
  };
}

const est = (
  texto: string,
  estancia: FilaLeida["estancia"],
  superficie_m2: number,
  unidad: string,
  nivel: number,
  extra: Partial<FilaLeida> = {},
) => fila({ texto, estancia, superficie_m2, unidad, nivel, que: "estancia", ...extra });

const montar = (filas: FilaLeida[], base: Edificio = BASE) =>
  montarEdificio(filasRevisables({ filas, avisos: [] }), base, "cuadro.pdf");

const zonas = (e: Edificio) => e.grupos.flatMap((g) => g.zonas);
const usos = (e: Edificio, grupo: number) => e.grupos[grupo]!.zonas.map((z) => z.uso);

// ── Una plurifamiliar con locales, desglosada por estancias ─────────────────

const PLURI: FilaLeida[] = [
  // P1: dos viviendas desglosadas, con sus totales y la construida.
  est("Salón-comedor", "estar", 25, "1.º A", 1, { tipoVivienda: "A" }),
  est("Cocina", "cocina", 10, "1.º A", 1, { tipoVivienda: "A" }),
  est("Dormitorio 1", "dormitorio", 14, "1.º A", 1, { tipoVivienda: "A" }),
  est("Dormitorio 2", "dormitorio", 11, "1.º A", 1, { tipoVivienda: "A" }),
  est("Dormitorio 3", "dormitorio", 10, "1.º A", 1, { tipoVivienda: "A" }),
  est("Baño 1", "bano", 5, "1.º A", 1, { tipoVivienda: "A" }),
  est("Baño 2", "bano", 4, "1.º A", 1, { tipoVivienda: "A" }),
  est("Pasillo", "otra", 6, "1.º A", 1, { tipoVivienda: "A" }),
  fila({ texto: "Total útil 1.º A", que: "total", superficie_m2: 85, nivel: 1 }),
  fila({ texto: "Total construida 1.º A", que: "total", tipoSuperficie: "construida", superficie_m2: 102, nivel: 1 }),
  est("Salón", "estar", 22, "1.º B", 1, { tipoVivienda: "B" }),
  est("Cocina", "cocina", 8, "1.º B", 1, { tipoVivienda: "B" }),
  est("Dormitorio 1", "dormitorio", 13, "1.º B", 1, { tipoVivienda: "B" }),
  est("Dormitorio 2", "dormitorio", 10, "1.º B", 1, { tipoVivienda: "B" }),
  est("Baño", "bano", 5, "1.º B", 1, { tipoVivienda: "B" }),
  est("Aseo", "aseo", 3, "1.º B", 1, { tipoVivienda: "B" }),
  est("Distribuidor", "otra", 4, "1.º B", 1, { tipoVivienda: "B" }),
  fila({ texto: "Rellano", que: "zona_comun", superficie_m2: 12, nivel: 1 }),
  fila({ texto: "Terraza 1.º A", que: "exterior", superficie_m2: 8, nivel: 1 }),
  // P2 y P3: las repetidas, en una línea cada una (regla 7 del prompt).
  ...[2, 3].flatMap((n) => [
    fila({ texto: `${n}.º A`, que: "vivienda", superficie_m2: 85, unidad: `${n}.º A`, tipoVivienda: "A", nivel: n }),
    fila({ texto: `${n}.º B`, que: "vivienda", superficie_m2: 65, unidad: `${n}.º B`, tipoVivienda: "B", nivel: n }),
    fila({ texto: "Rellano", que: "zona_comun", superficie_m2: 12, nivel: n }),
  ]),
  // PB: dos locales, el portal y los contadores.
  fila({ texto: "Local 1", que: "local_sin_uso", superficie_m2: 120, unidad: "Local 1" }),
  fila({ texto: "Local 2 · zona de venta", que: "local_sin_uso", superficie_m2: 75, unidad: "Local 2" }),
  fila({ texto: "Local 2 · aseo", que: "local_sin_uso", superficie_m2: 5, unidad: "Local 2" }),
  fila({ texto: "Portal y escalera", que: "zona_comun", superficie_m2: 20 }),
  fila({ texto: "Cuarto de contadores", que: "instalaciones", superficie_m2: 6 }),
  // S1: garaje, trasteros e instalaciones.
  fila({ texto: "Garaje", que: "garaje", superficie_m2: 400, plazas: 12, nivel: -1, pagina: 2 }),
  fila({ texto: "Trasteros (8 uds.)", que: "trasteros", superficie_m2: 40, numero: 8, nivel: -1, pagina: 2 }),
  fila({ texto: "Aljibe y grupo de presión", que: "instalaciones", superficie_m2: 15, nivel: -1, pagina: 2 }),
  fila({ texto: "Total construido del edificio", que: "total", tipoSuperficie: "construida", superficie_m2: 1400, nivel: 0 }),
];

describe("plurifamiliar con locales desglosada por estancias", () => {
  const { edificio, avisos, destino } = montar(PLURI);
  const e = edificio!;

  it("saca los dos tipos con su programa contado de las estancias", () => {
    expect(e.unidades).toEqual([
      expect.objectContaining({ id: "A", nombre: "A", dormitorios: 3, banos: 2, aseos: 0, superficieUtil_m2: 85 }),
      expect.objectContaining({ id: "B", nombre: "B", dormitorios: 2, banos: 1, aseos: 1, superficieUtil_m2: 65 }),
    ]);
  });

  it("agrupa P1–P3, que tienen el mismo programa aunque P1 venga desglosada", () => {
    expect(e.grupos.map((g) => [g.nivelInicial, g.repeticiones])).toEqual([
      [1, 3],
      [0, 1],
      [-1, 1],
    ]);
    const [viviendas, rellano] = e.grupos[0]!.zonas;
    expect(viviendas).toMatchObject({
      uso: "viviendas",
      superficieUtil_m2: 150,
      unidades: [
        { tipoId: "A", cantidad: 1 },
        { tipoId: "B", cantidad: 1 },
      ],
    });
    expect(rellano).toMatchObject({ uso: "zona_comun", superficieUtil_m2: 12 });
  });

  it("en PB, un local por unidad y las instalaciones aparte de las zonas comunes", () => {
    expect(usos(e, 1)).toEqual(["local_sin_uso", "local_sin_uso", "zona_comun", "instalaciones"]);
    expect(e.grupos[1]!.zonas.map((z) => z.superficieUtil_m2)).toEqual([120, 80, 20, 6]);
  });

  it("en el sótano suma plazas y trasteros y nombra las instalaciones", () => {
    expect(e.grupos[2]!.zonas).toEqual([
      expect.objectContaining({ uso: "garaje", superficieUtil_m2: 400, plazas: 12 }),
      expect.objectContaining({ uso: "trasteros", superficieUtil_m2: 40, numero: 8 }),
      expect.objectContaining({ uso: "instalaciones", superficieUtil_m2: 15, nota: "Aljibe y grupo de presión" }),
    ]);
  });

  it("descarta totales, construidas y exteriores", () => {
    expect(destino.has(8)).toBe(false); // Total útil 1.º A
    expect(destino.has(9)).toBe(false); // construida
    expect(destino.has(18)).toBe(false); // terraza
    expect(zonas(e).reduce((a, z) => a + z.superficieUtil_m2, 0)).toBe(150 + 12 + 120 + 80 + 20 + 6 + 400 + 40 + 15);
  });

  it("cada zona dice de qué filas sale, y cada fila a qué zona va", () => {
    const local2 = e.grupos[1]!.zonas[1]!;
    expect(local2.origen).toEqual({
      documento: "cuadro.pdf",
      paginas: [1],
      filas: ["Local 2 · zona de venta · 75,00 m²", "Local 2 · aseo · 5,00 m²"],
    });
    expect(e.grupos[2]!.zonas[0]!.origen?.paginas).toEqual([2]);
    const viviendas = e.grupos[0]!.zonas[0]!;
    expect(viviendas.origen?.filas).toContain("1.º A · 85,00 m²");
    expect(viviendas.origen?.filas).toContain("3.º B · 65,00 m²");
    expect(destino.get(0)).toEqual([viviendas.id]); // el salón del 1.º A
    expect(e.unidades[0]!.origen?.filas).toContain("Dormitorio 1 · 14,00 m²");
  });

  it("sin cubierta en el cuadro, la deduce de la planta más alta y lo avisa", () => {
    expect(e.cubierta).toEqual({ tipo: BASE.cubierta.tipo, superficie_m2: 162 });
    expect(avisos.some((a) => a.includes("no da la cubierta"))).toBe(true);
  });

  it("el edificio que sale es válido: 6 viviendas, locales en PB y garaje", () => {
    expect(validarEdificio(e)).toEqual([]);
    const r = resumenEdificio(e);
    expect(r.numViviendas).toBe(6);
    expect(r.tieneLocalPB).toBe(true);
    expect(r.tieneGaraje).toBe(true);
  });

  it("conserva las alturas del edificio que había, planta a planta", () => {
    expect(plantasDe(e).map((p) => p.altura_m)).toEqual(plantasDe(BASE).map((p) => p.altura_m));
    expect(avisos.some((a) => a.includes("no trae alturas"))).toBe(true);
  });
});

// ── Tipos descritos aparte y «plantas 1.ª a 4.ª» ────────────────────────────

describe("tipos descritos aparte y plantas iguales en una línea", () => {
  const tipoA = (texto: string, estancia: FilaLeida["estancia"], m: number) =>
    fila({ texto, estancia, superficie_m2: m, que: "estancia_tipo", tipoVivienda: "Tipo A", nivel: 1 });
  const filas = [
    tipoA("Salón-comedor", "estar", 25),
    tipoA("Cocina", "cocina", 10),
    tipoA("Dormitorio principal", "dormitorio", 14),
    tipoA("Dormitorio 2", "dormitorio", 11),
    tipoA("Baño", "bano", 5),
    fila({ texto: "Plantas 1.ª a 4.ª: 2 viviendas tipo A", que: "vivienda", tipoVivienda: "Tipo A", nivel: 1, plantas: 4, numero: 2 }),
    fila({ texto: "Rellanos", que: "zona_comun", superficie_m2: 10, nivel: 1, plantas: 4 }),
    fila({ texto: "Portal", que: "zona_comun", superficie_m2: 30, nivel: 0 }),
  ];
  const { edificio, destino } = montar(filas);
  const e = edificio!;

  it("el tipo sale de su descripción: programa y superficie", () => {
    expect(e.unidades).toEqual([
      expect.objectContaining({ nombre: "A", dormitorios: 2, banos: 1, aseos: 0, superficieUtil_m2: 65 }),
    ]);
  });

  it("la línea vale para cuatro plantas con dos viviendas cada una", () => {
    expect(e.grupos[0]).toMatchObject({ nivelInicial: 1, repeticiones: 4 });
    expect(e.grupos[0]!.zonas[0]).toMatchObject({
      uso: "viviendas",
      superficieUtil_m2: 130,
      unidades: [{ tipoId: "A", cantidad: 2 }],
    });
    expect(resumenEdificio(e).numViviendas).toBe(8);
  });

  it("las filas de la descripción van al tipo", () => {
    expect(destino.get(0)).toEqual(["tipo:A"]);
  });
});

describe("tipos descritos aparte que ninguna línea coloca", () => {
  const tipo = (texto: string, estancia: FilaLeida["estancia"], m: number, t: string) =>
    fila({ texto, estancia, superficie_m2: m, que: "estancia_tipo", tipoVivienda: t, nivel: 1, plantas: 3 });
  const { edificio, avisos } = montar([
    tipo("Salón", "estar", 25, "A"),
    tipo("Dormitorio 1", "dormitorio", 14, "A"),
    tipo("Baño", "bano", 5, "A"),
    tipo("Salón", "estar", 20, "B"),
    tipo("Dormitorio 1", "dormitorio", 12, "B"),
    tipo("Baño", "bano", 4, "B"),
    fila({ texto: "Portal", que: "zona_comun", superficie_m2: 25 }),
  ]);

  it("pone una vivienda de cada tipo en cada planta que cubren sus filas, y lo dice", () => {
    expect(edificio!.grupos[0]).toMatchObject({ nivelInicial: 1, repeticiones: 3 });
    expect(edificio!.grupos[0]!.zonas[0]).toMatchObject({
      uso: "viviendas",
      superficieUtil_m2: 80,
      unidades: [
        { tipoId: "A", cantidad: 1 },
        { tipoId: "B", cantidad: 1 },
      ],
    });
    expect(avisos.filter((a) => a.startsWith("Ninguna línea dice dónde van"))).toHaveLength(2);
  });
});

// ── Unifamiliar en dos plantas ──────────────────────────────────────────────

describe("vivienda unifamiliar en dos plantas", () => {
  const filas = [
    est("Salón-comedor", "estar", 30, "", 0),
    est("Cocina", "cocina", 12, "", 0),
    est("Aseo", "aseo", 3, "", 0),
    fila({ texto: "Garaje", que: "garaje", superficie_m2: 20, plazas: 1 }),
    est("Dormitorio 1", "dormitorio", 15, "", 1),
    est("Dormitorio 2", "dormitorio", 12, "", 1),
    est("Dormitorio 3", "dormitorio", 10, "", 1),
    est("Baño 1", "bano", 6, "", 1),
    est("Baño 2", "bano", 5, "", 1),
    fila({ texto: "Porche", que: "exterior", superficie_m2: 14 }),
  ];
  const { edificio } = montar(filas, edificioDeCaso("unifamiliar"));
  const e = edificio!;

  it("una sola vivienda: tipo U con todo su programa y una zona por planta", () => {
    expect(e.unidades).toEqual([
      expect.objectContaining({ id: "U", dormitorios: 3, banos: 2, aseos: 1, superficieUtil_m2: 93 }),
    ]);
    expect(e.grupos.map((g) => g.zonas.map((z) => [z.uso, z.superficieUtil_m2]))).toEqual([
      [["vivienda_unifamiliar", 48]],
      [
        ["vivienda_unifamiliar", 45],
        ["garaje_privado", 20],
      ],
    ]);
    expect(resumenEdificio(e).esUnifamiliar).toBe(true);
    expect(validarEdificio(e)).toEqual([]);
  });

  it("toma las alturas de la unifamiliar que había (2,80 m)", () => {
    expect(e.grupos.map((g) => g.altura_m)).toEqual([2.8, 2.8]);
  });
});

// ── Oficinas, tipos sin nombre, huecos ──────────────────────────────────────

describe("oficinas", () => {
  const filas = [
    fila({ texto: "Oficina P1 · zona de trabajo", que: "oficinas", superficie_m2: 300, unidad: "Oficina P1", nivel: 1 }),
    fila({ texto: "Oficina P1 · aseos", que: "oficinas", superficie_m2: 20, unidad: "Oficina P1", nivel: 1 }),
    fila({ texto: "Oficina P2", que: "oficinas", superficie_m2: 320, unidad: "Oficina P2", nivel: 2 }),
    fila({ texto: "Vestíbulo", que: "vestibulo", superficie_m2: 60 }),
    fila({ texto: "Local", que: "local_sin_uso", superficie_m2: 200 }),
  ];
  const { edificio, avisos } = montar(filas, edificioDeCaso("oficinas"));

  it("una zona por oficina, y las dos plantas iguales agrupadas", () => {
    expect(edificio!.grupos[0]).toMatchObject({ nivelInicial: 1, repeticiones: 2 });
    expect(edificio!.grupos[0]!.zonas).toEqual([
      expect.objectContaining({ uso: "oficinas", superficieUtil_m2: 320, unidades: [] }),
    ]);
    expect(edificio!.unidades).toEqual([]);
  });

  it("pide los núcleos de aseos, que el cuadro no da", () => {
    expect(avisos.some((a) => a.includes("núcleos de aseos"))).toBe(true);
  });
});

describe("viviendas sin tipo en el cuadro", () => {
  const viv = (texto: string, m: number, nivel: number, d: number, b: number) =>
    fila({ texto, que: "vivienda", superficie_m2: m, unidad: texto, nivel, dormitorios: d, banos: b });
  const { edificio, avisos } = montar([
    viv("Bajo A", 70, 0, 2, 1),
    viv("1.º A", 70, 1, 2, 1),
    viv("1.º B", 95, 1, 3, 2),
    viv("1.º C", 55, 1, 0, 0),
  ]);

  it("las de mismo programa y superficie forman un tipo; las demás, otros con letra", () => {
    expect(edificio!.unidades.map((u) => [u.nombre, u.superficieUtil_m2])).toEqual([
      ["A", 70],
      ["B", 95],
      ["C", 55],
    ]);
  });

  it("si no consta el programa, supone 2 dormitorios y 1 baño y lo dice", () => {
    expect(edificio!.unidades[2]).toMatchObject({ dormitorios: 2, banos: 1 });
    expect(avisos.some((a) => a.includes("«1.º C»") && a.includes("se suponen"))).toBe(true);
  });
});

describe("plantas que faltan y edificios que no se pueden montar", () => {
  it("avisa de la planta que no está en el cuadro", () => {
    const { avisos } = montar([
      fila({ texto: "Portal", que: "zona_comun", superficie_m2: 20, nivel: 0 }),
      fila({ texto: "Oficina", que: "oficinas", superficie_m2: 200, nivel: 2 }),
    ]);
    expect(avisos.some((a) => a.includes("no trae la planta P1"))).toBe(true);
  });

  it("sin nada sobre rasante no hay edificio", () => {
    const m = montar([fila({ texto: "Garaje", que: "garaje", superficie_m2: 300, plazas: 10, nivel: -1 })]);
    expect(m.edificio).toBeNull();
  });

  it("sin ninguna fila útil, tampoco", () => {
    expect(montar([fila({ texto: "Total", que: "total", superficie_m2: 900 })]).edificio).toBeNull();
  });
});

// ── La tabla de revisión ────────────────────────────────────────────────────

describe("revisión de filas", () => {
  it("cada descarte lleva su motivo", () => {
    expect(motivoDescarte(fila({ texto: "x", que: "total", superficie_m2: 1 }))).toMatch(/Total/);
    expect(motivoDescarte(fila({ texto: "x", que: "zona_comun", superficie_m2: 9, tipoSuperficie: "construida" }))).toMatch(
      /construida/,
    );
    expect(motivoDescarte(fila({ texto: "x", que: "exterior", superficie_m2: 9 }))).toMatch(/Exterior/);
    expect(motivoDescarte(fila({ texto: "x", que: "zona_comun" }))).toBe("Sin superficie");
    expect(motivoDescarte(fila({ texto: "x", que: "garaje", plazas: 10 }))).toBe("");
    // La cubierta cuenta venga en la columna que venga.
    expect(motivoDescarte(fila({ texto: "x", que: "cubierta", superficie_m2: 182, tipoSuperficie: "otra" }))).toBe("");
    expect(motivoDescarte(fila({ texto: "x", que: "zona_comun", superficie_m2: 9 }))).toBe("");
  });

  it("cambiar a qué va una fila decide de nuevo si entra; la casilla manda si se toca", () => {
    let filas: FilaRevisable[] = filasRevisables({
      filas: [fila({ texto: "Total planta", que: "total", superficie_m2: 50 })],
      avisos: [],
    });
    expect(filas[0]!.usar).toBe(false);
    filas = corregirFila(filas, 0, { que: "zona_comun" });
    expect(filas[0]!.usar).toBe(true);
    filas = corregirFila(filas, 0, { usar: false });
    expect(filas[0]!.usar).toBe(false);
  });

  it("una estancia que pasa a zona pierde su clase de estancia", () => {
    const filas = corregirFila(
      filasRevisables({ filas: [est("Pasillo", "otra", 5, "1.º A", 1)], avisos: [] }),
      0,
      { que: "zona_comun" },
    );
    expect(filas[0]).toMatchObject({ que: "zona_comun", estancia: "otra", usar: true });
  });

  it("una construida reclasificada sigue fuera hasta que se marque a mano", () => {
    let filas = filasRevisables({
      filas: [fila({ texto: "Local", que: "local_sin_uso", superficie_m2: 90, tipoSuperficie: "construida" })],
      avisos: [],
    });
    filas = corregirFila(filas, 0, { que: "oficinas" });
    expect(filas[0]!.usar).toBe(false);
    filas = corregirFila(filas, 0, { usar: true });
    const z = montarEdificio(filas, BASE, "c.pdf").edificio!.grupos[0]!.zonas[0] as Zona;
    expect(z).toMatchObject({ uso: "oficinas", superficieUtil_m2: 90 });
  });
});
