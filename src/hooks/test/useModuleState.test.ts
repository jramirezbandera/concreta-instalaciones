import { describe, it, expect } from "vitest";
import { parseUrlParams, toUrlParams } from "../useModuleState";

// =============================================================================
// (De)serialización de estado ↔ URL del hook compartido useModuleState.
// Lógica pura: primitivos como texto, no-primitivos (arrays/objetos) como JSON.
// Endurecida contra URLs malformadas/hostiles (forma raíz + nº finitos).
// =============================================================================

interface Demo {
  num: number;
  flag: boolean;
  text: string;
  items: { id: string; n: number }[];
  obj: { k: number };
}

const defaults: Demo = {
  num: 2,
  flag: true,
  text: "x",
  items: [{ id: "a", n: 1 }],
  obj: { k: 1 },
};

const parse = (qs: string) => parseUrlParams(new URLSearchParams(qs), defaults);

describe("toUrlParams", () => {
  it("primitivos como texto plano; no-primitivos como JSON", () => {
    const out = toUrlParams<Demo>({
      num: 7,
      flag: false,
      text: "hi",
      items: [{ id: "z", n: 9 }],
      obj: { k: 3 },
    });
    expect(out.num).toBe("7");
    expect(out.flag).toBe("false");
    expect(out.text).toBe("hi");
    expect(out.items).toBe('[{"id":"z","n":9}]');
    expect(out.obj).toBe('{"k":3}');
  });
});

describe("parseUrlParams — primitivos", () => {
  it("number válido", () => {
    expect(parse("num=5")).toEqual({ num: 5 });
  });
  it("rechaza Infinity (Number('Infinity') es válido pero no finito)", () => {
    expect(parse("num=Infinity")).toEqual({});
  });
  it("rechaza NaN / no numérico", () => {
    expect(parse("num=abc")).toEqual({});
  });
  it("boolean", () => {
    expect(parse("flag=false")).toEqual({ flag: false });
    expect(parse("flag=true")).toEqual({ flag: true });
  });
  it("string", () => {
    expect(parse("text=hola")).toEqual({ text: "hola" });
  });
  it("ignora claves que no están en defaults", () => {
    expect(parse("desconocida=1")).toEqual({});
  });
});

describe("parseUrlParams — no primitivos (JSON)", () => {
  it("round-trip de array", () => {
    const v = [{ id: "b", n: 2 }];
    expect(parse("items=" + encodeURIComponent(JSON.stringify(v)))).toEqual({ items: v });
  });
  it("round-trip de objeto", () => {
    expect(parse("obj=" + encodeURIComponent(JSON.stringify({ k: 9 })))).toEqual({ obj: { k: 9 } });
  });
  it("JSON malformado → se ignora (cae al default/localStorage)", () => {
    expect(parse("items=NOJSON")).toEqual({});
  });
  it("forma incorrecta: objeto donde se espera array → se ignora", () => {
    expect(parse("items=" + encodeURIComponent(JSON.stringify({ k: 1 })))).toEqual({});
  });
  it("forma incorrecta: array donde se espera objeto → se ignora", () => {
    expect(parse("obj=" + encodeURIComponent(JSON.stringify([1, 2])))).toEqual({});
  });
  it("null no se acepta como objeto", () => {
    expect(parse("obj=null")).toEqual({});
  });
});

describe("round-trip completo", () => {
  it("toUrlParams → parseUrlParams reconstruye el estado", () => {
    const s: Demo = {
      num: 7,
      flag: false,
      text: "hi",
      items: [
        { id: "z", n: 9 },
        { id: "y", n: 4 },
      ],
      obj: { k: 3 },
    };
    const params = new URLSearchParams(toUrlParams(s));
    expect(parseUrlParams(params, defaults)).toEqual(s);
  });
});
