/**
 * Envelope de respuesta del proveedor (portado de Concreta, feature-13).
 * `buildChatSchema` envuelve el payload de una lectura en el envelope canónico
 * {reply, proposal}: `reply` es el resumen para el técnico y `proposal` lo
 * leído. De Concreta solo se porta esto: su prompt de chat y el bloque «sobre
 * la aplicación» son de su asistente conversacional, que aquí no existe.
 */

export const CHAT_FORMAT_NAME = "asistente_concreta"; // name del json_schema de OpenAI

export function buildChatSchema(
  payloadSchema: Record<string, unknown>,
): Record<string, unknown> {
  return {
    type: "object",
    additionalProperties: false,
    required: ["reply", "proposal"],
    properties: {
      reply: {
        type: "string",
        description:
          "Respuesta breve en español (máx ~120 palabras). Sin JSON ni markdown.",
      },
      proposal: {
        anyOf: [payloadSchema, { type: "null" }],
        description:
          "Lo leído del documento; null si el documento no tiene nada que leer.",
      },
    },
  };
}
