import { AiError, type ChatEnvelope } from "./types";

/**
 * Normaliza el envelope crudo del LLM a ChatEnvelope.
 * - raw no-objeto → throw AiError('bad-response')
 * - `reply` no-string → throw AiError('bad-response')
 * - `proposal` ausente/undefined → null
 * - `proposal` NO se valida más aquí (lo hace quien lo lee, a la defensiva).
 */
export function parseChatEnvelope(raw: unknown): ChatEnvelope {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new AiError(
      "bad-response",
      "La respuesta del modelo no es un objeto JSON.",
    );
  }
  const r = raw as Record<string, unknown>;
  if (typeof r.reply !== "string") {
    throw new AiError(
      "bad-response",
      'La respuesta del modelo no contiene un campo "reply" de texto.',
    );
  }
  return {
    reply: r.reply,
    proposal: r.proposal === undefined ? null : r.proposal,
  };
}
