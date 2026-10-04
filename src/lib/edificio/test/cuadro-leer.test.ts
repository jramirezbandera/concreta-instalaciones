// Leer el cuadro de superficies: schema, petición y lectura defensiva (feature-13).

import { describe, expect, it } from "vitest";
import { countAnthropicUnions, exceedsAnthropicUnionLimit, toAnthropicSchema, toOpenAiSchema } from "../../ai/providers/schemaConvert";
import { textoEnLineas } from "../../ai/pdfPrep";
import {
  construirPeticion,
  CUADRO_SCHEMA,
  esEscaneado,
  limpiarTexto,
  MAX_TOKENS_SALIDA,
  paginasEscaneado,
  parseLectura,
  seleccionarTexto,
} from "../cuadro/leer";

describe("schema", () => {
  it("cabe en los tres proveedores: una sola unión (la de proposal)", () => {
    expect(countAnthropicUnions(CUADRO_SCHEMA)).toBe(1);
    expect(exceedsAnthropicUnionLimit(CUADRO_SCHEMA)).toBe(false);
    // Sin `type` array, los conversores no tienen nada que tocar salvo el envelope.
    expect(JSON.stringify(toOpenAiSchema(CUADRO_SCHEMA))).toBe(JSON.stringify(CUADRO_SCHEMA));
    expect(toAnthropicSchema(CUADRO_SCHEMA)).toEqual(CUADRO_SCHEMA);
  });
});

describe("qué se manda", () => {
  const paginas = [
    { n: 1, texto: "Memoria descriptiva. " + "x".repeat(3000) },
    { n: 2, texto: "CUADRO DE SUPERFICIES ÚTILES\nSalón | 25,30" },
    { n: 3, texto: "Planos" },
  ];

  it("si cabe, todo en orden y con su rótulo de página", () => {
    const s = seleccionarTexto(paginas);
    expect(s.paginas).toEqual([1, 2, 3]);
    expect(s.recortado).toBe(false);
    expect(s.texto).toContain("=== Página 2 ===\nCUADRO DE SUPERFICIES");
  });

  it("si no cabe, primero las páginas que hablan de superficies", () => {
    const s = seleccionarTexto(paginas, 200);
    expect(s.paginas).toEqual([2, 3]);
    expect(s.recortado).toBe(true);
  });

  it("un PDF sin texto es escaneado y va como imágenes de sus primeras páginas", () => {
    expect(esEscaneado([{ n: 1, texto: "  " }, { n: 2, texto: "A1" }])).toBe(true);
    expect(esEscaneado(paginas)).toBe(false);
    expect(paginasEscaneado(9)).toEqual([1, 2, 3, 4]);
    expect(paginasEscaneado(2)).toEqual([1, 2]);
  });

  it("la petición: reglas estables, el fichero en el bloque volátil y salida amplia", () => {
    const sel = seleccionarTexto(paginas);
    const req = construirPeticion({ tipo: "pdf", nombre: "cuadro.pdf", paginas: 3, seleccion: sel }, []);
    expect(req.system.stable).toContain("TRANSCRIBE, NO CALCULES");
    expect(req.system.volatile).toBe("FICHERO: «cuadro.pdf» · 3 páginas · texto de 3.");
    expect(req.turns).toEqual([{ role: "user", text: expect.stringContaining("=== Página 2 ===") }]);
    expect(req.maxTokens).toBe(MAX_TOKENS_SALIDA);
    expect(req.cacheKey).toBe("concreta-inst-cuadro");
    expect(req.schema).toBe(CUADRO_SCHEMA);
  });

  it("con imágenes, van en el turno y el texto lo dice", () => {
    const img = { data: "AAAA", mediaType: "image/png" as const };
    const req = construirPeticion({ tipo: "imagenes", nombre: "captura.png" }, [img, img]);
    expect(req.turns[0]!.images).toHaveLength(2);
    expect(req.turns[0]!.text).toMatch(/^Las 2 imágenes adjuntas son el cuadro/);
    expect(req.system.volatile).toBe("FICHERO: «captura.png» · 2 imágenes.");
  });
});

describe("lectura defensiva", () => {
  const buena = {
    texto: "Dormitorio 1",
    pagina: 2,
    nivel: 1,
    plantas: 1,
    superficie_m2: 12.5,
    tipoSuperficie: "util",
    que: "estancia",
    estancia: "dormitorio",
    unidad: "1.º A",
    tipoVivienda: "A",
    dormitorios: 0,
    banos: 0,
    aseos: 0,
    plazas: 0,
    numero: 0,
    confianza: "alta",
    nota: "",
  };

  it("una fila bien formada pasa tal cual", () => {
    expect(parseLectura({ filas: [buena], avisos: ["ok"] })).toEqual({ filas: [buena], avisos: ["ok"] });
  });

  it("nunca lanza: lo que no tiene forma se queda fuera", () => {
    expect(parseLectura(null)).toEqual({ filas: [], avisos: [] });
    expect(parseLectura("texto")).toEqual({ filas: [], avisos: [] });
    expect(parseLectura({ filas: [null, 3, { texto: "" }, { ...buena }], avisos: [1, " ", "dudoso "] })).toEqual({
      filas: [buena],
      avisos: ["dudoso"],
    });
  });

  it("un enumerado inventado llega como «otro» con la duda dicha", () => {
    const [f] = parseLectura({ filas: [{ ...buena, que: "salon", confianza: "alta" }] }).filas;
    expect(f).toMatchObject({ que: "otro", estancia: "otra", confianza: "baja", nota: "clasificación no reconocida" });
  });

  it("números escritos como texto, y valores fuera de rango, se sanean", () => {
    const [f] = parseLectura({
      filas: [{ ...buena, superficie_m2: "1.234,56 m²", nivel: 2.4, plantas: 0, dormitorios: 40, confianza: "segura" }],
    }).filas;
    expect(f).toMatchObject({ superficie_m2: 1234.56, nivel: 2, plantas: 1, dormitorios: 8, confianza: "media" });
    expect(parseLectura({ filas: [{ ...buena, superficie_m2: "85,4" }] }).filas[0]!.superficie_m2).toBe(85.4);
    expect(parseLectura({ filas: [{ ...buena, superficie_m2: -3 }] }).filas[0]!.superficie_m2).toBe(0);
  });

  it("el texto de la fila sale sin las cifras que el modelo copie de la línea", () => {
    expect(limpiarTexto("Garaje (12 plazas) | 386,40 | 412,50")).toBe("Garaje (12 plazas)");
    expect(limpiarTexto("Local 2 | zona de venta | 75,00 m²")).toBe("Local 2 · zona de venta");
    expect(limpiarTexto("Salón-comedor 24,60")).toBe("Salón-comedor");
    expect(limpiarTexto("Dormitorio 2")).toBe("Dormitorio 2");
    expect(limpiarTexto("Plantas 1.ª a 3.ª")).toBe("Plantas 1.ª a 3.ª");
    expect(parseLectura({ filas: [{ ...buena, texto: "| 12,00 |" }] }).filas).toEqual([]);
  });

  it("la clase de estancia solo se guarda en las estancias", () => {
    const [f] = parseLectura({ filas: [{ ...buena, que: "zona_comun" }] }).filas;
    expect(f!.estancia).toBe("otra");
  });
});

describe("texto de un plano: líneas por posición", () => {
  // Una tabla de CAD: cada celda es un texto suelto, dibujadas en desorden.
  const celda = (str: string, x: number, y: number) => ({ str, transform: [1, 0, 0, 1, x, y], width: str.length * 5, height: 10 });

  it("recompone los renglones de arriba abajo y separa las columnas", () => {
    const items = [
      celda("25,30", 200, 700),
      celda("Cocina", 50, 685),
      celda("Salón-comedor", 50, 700),
      celda("9,80", 200, 685.5),
      celda("CUADRO DE SUPERFICIES", 50, 730),
      { str: "+3,00", transform: [0, 1, -1, 0, 10, 10], width: 20, height: 10 },
    ];
    expect(textoEnLineas(items)).toBe("CUADRO DE SUPERFICIES\nSalón-comedor | 25,30\nCocina | 9,80\n+3,00");
  });

  it("los trozos de una misma palabra no se separan", () => {
    expect(textoEnLineas([celda("Dormi", 50, 100), celda("torio 1", 75, 100)])).toBe("Dormitorio 1");
  });
});
