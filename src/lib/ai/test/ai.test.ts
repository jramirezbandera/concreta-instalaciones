// Conversores de schema por proveedor, tope de uniones de Anthropic y envelope
// (feature-13). Concreta los prueba contra sus adaptadores de módulo; aquí, con
// un schema propio que tiene lo que importa: campos anulables con enum, objetos
// dentro de arrays y el envelope {reply, proposal} por encima.

import { describe, expect, it } from "vitest";
import { buildChatSchema } from "../chatSchema";
import {
  ANTHROPIC_UNION_LIMIT,
  countAnthropicUnions,
  exceedsAnthropicUnionLimit,
  toAnthropicSchema,
  toOpenAiSchema,
} from "../providers/schemaConvert";
import { AiError } from "../types";
import { parseChatEnvelope } from "../validate";

const PAYLOAD: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["uso", "superficie", "filas"],
  properties: {
    uso: {
      type: ["string", "null"],
      enum: ["viviendas", "garaje", null],
      description: "Uso.",
    },
    superficie: { type: ["number", "null"] },
    filas: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["texto", "planta"],
        properties: {
          texto: { type: "string" },
          planta: { type: ["string", "null"], enum: ["PB", "P1", null] },
        },
      },
    },
  },
};

/** Todos los nodos-objeto del árbol (properties, items y ramas anyOf). */
function nodos(
  n: unknown,
  acc: Record<string, unknown>[] = [],
): Record<string, unknown>[] {
  if (Array.isArray(n)) {
    for (const x of n) nodos(x, acc);
    return acc;
  }
  if (typeof n !== "object" || n === null) return acc;
  const r = n as Record<string, unknown>;
  acc.push(r);
  if (typeof r.properties === "object" && r.properties !== null) {
    for (const v of Object.values(r.properties)) nodos(v, acc);
  }
  nodos(r.items, acc);
  nodos(r.anyOf, acc);
  return acc;
}

describe("toAnthropicSchema", () => {
  const convertido = toAnthropicSchema(buildChatSchema(PAYLOAD));

  it("ningún nodo conserva `type` como array, a ninguna profundidad", () => {
    expect(nodos(convertido).every((n) => !Array.isArray(n.type))).toBe(true);
  });

  it("un enum anulable pasa a anyOf con el enum sin null y una rama null, con la descripción fuera", () => {
    const payload = (
      (convertido.properties as Record<string, Record<string, unknown>>)
        .proposal.anyOf as Record<string, unknown>[]
    )[0]!;
    const uso = (payload.properties as Record<string, unknown>).uso;
    expect(uso).toEqual({
      anyOf: [
        { type: "string", enum: ["viviendas", "garaje"] },
        { type: "null" },
      ],
      description: "Uso.",
    });
  });

  it("llega a los campos de los objetos dentro de un array", () => {
    const enums = nodos(convertido).filter((n) => Array.isArray(n.enum));
    expect(enums.map((n) => n.enum)).toContainEqual(["PB", "P1"]);
  });

  it("no muta el schema de entrada", () => {
    const antes = JSON.stringify(PAYLOAD);
    toAnthropicSchema(PAYLOAD);
    toOpenAiSchema(PAYLOAD);
    expect(JSON.stringify(PAYLOAD)).toBe(antes);
  });
});

describe("toOpenAiSchema", () => {
  it("conserva el `type` array y quita null de los enums, también dentro de los items", () => {
    const convertido = toOpenAiSchema(PAYLOAD);
    const props = convertido.properties as Record<
      string,
      Record<string, unknown>
    >;
    expect(props.uso).toEqual({
      type: ["string", "null"],
      enum: ["viviendas", "garaje"],
      description: "Uso.",
    });
    const items = props.filas.items as Record<string, unknown>;
    expect((items.properties as Record<string, unknown>).planta).toEqual({
      type: ["string", "null"],
      enum: ["PB", "P1"],
    });
  });
});

describe("tope de uniones de Anthropic", () => {
  const conAnulables = (n: number) => {
    const properties: Record<string, unknown> = {};
    for (let i = 0; i < n; i++)
      properties[`f${i}`] = { type: ["number", "null"] };
    return buildChatSchema({
      type: "object",
      required: Object.keys(properties),
      properties,
    });
  };

  it("es 16, y cuenta cada campo anulable más la unión de proposal", () => {
    expect(ANTHROPIC_UNION_LIMIT).toBe(16);
    expect(countAnthropicUnions(conAnulables(3))).toBe(4);
    expect(exceedsAnthropicUnionLimit(conAnulables(15))).toBe(false);
    expect(exceedsAnthropicUnionLimit(conAnulables(16))).toBe(true);
  });
});

describe("parseChatEnvelope", () => {
  it("devuelve reply y proposal; proposal ausente es null", () => {
    expect(
      parseChatEnvelope({ reply: "Hecho.", proposal: { filas: [] } }),
    ).toEqual({
      reply: "Hecho.",
      proposal: { filas: [] },
    });
    expect(parseChatEnvelope({ reply: "Nada." })).toEqual({
      reply: "Nada.",
      proposal: null,
    });
  });

  it.each([null, "texto", [1, 2], { proposal: {} }, { reply: 3 }])(
    "lanza AiError bad-response con %j",
    (raw) => {
      expect(() => parseChatEnvelope(raw)).toThrow(AiError);
      try {
        parseChatEnvelope(raw);
      } catch (e) {
        expect((e as AiError).kind).toBe("bad-response");
      }
    },
  );
});
