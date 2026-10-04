export type AiProviderId = "anthropic" | "openai" | "gemini";
export type AiImageMediaType = "image/jpeg" | "image/png" | "image/webp";

export interface AiImageAttachment {
  /** Base64 puro, SIN prefijo "data:...;base64," */
  data: string;
  mediaType: AiImageMediaType;
}

export type AiErrorKind =
  | "invalid-key"
  | "rate-limit"
  | "network"
  | "bad-response"
  | "aborted"
  | "schema-too-large"
  | "unknown";

export class AiError extends Error {
  readonly kind: AiErrorKind;
  constructor(kind: AiErrorKind, message: string) {
    super(message);
    this.name = "AiError";
    this.kind = kind;
  }
}

export function aiErrorKindFromStatus(status: number | undefined): AiErrorKind {
  if (status === 401 || status === 403) return "invalid-key";
  if (status === 429) return "rate-limit";
  if (status !== undefined && status >= 500) return "network";
  return "unknown";
}

// ---------------------------------------------------------------------------
// Petición al proveedor (portada de Concreta, feature-13). Concreta la usa
// para su chat; aquí, para lecturas de documento de UNA pasada: un turno de
// usuario con el texto o las imágenes y la respuesta en el envelope
// {reply, proposal}.
// ---------------------------------------------------------------------------

export interface ChatTurn {
  role: "user" | "assistant";
  /** user: texto del usuario · assistant: JSON crudo del envelope (reenviado verbatim). */
  text: string;
  images?: AiImageAttachment[]; // solo turnos user
}

/**
 * System prompt partido en dos bloques — el corte existe para la CACHÉ DE PROMPT.
 *
 * La caché de los tres proveedores es un PREFIJO: solo se reutiliza el tramo
 * inicial que llega byte a byte idéntico. Por eso todo lo que cambia de una
 * petición a otra tiene que ir DESPUÉS de lo que no cambia; si se colara antes,
 * invalidaría la caché entera y el ahorro sería cero.
 *
 * - `stable`: las reglas de la lectura, IDÉNTICAS en todas las peticiones. Es
 *   el punto de corte de la caché (Anthropic lo marca con `cache_control`;
 *   OpenAI y Gemini lo detectan solos).
 * - `volatile`: lo que cambia (qué fichero se lee); nunca se cachea.
 */
export interface ChatSystem {
  stable: string;
  volatile: string;
}

/** Los dos bloques como un solo string (proveedores sin caché explícita). */
export function chatSystemText(system: ChatSystem): string {
  return `${system.stable}\n\n${system.volatile}`;
}

export interface ChatRequest {
  system: ChatSystem; // bloque estable (cacheable) + bloque volátil, POR TURNO
  schema: Record<string, unknown>; // envelope canónico = buildChatSchema(adapter.payloadSchema)
  turns: ChatTurn[]; // antiguo → nuevo; el último SIEMPRE 'user'; roles estrictamente alternos
  /**
   * Clave del prefijo cacheado, estable por módulo (`concreta-<idModulo>`).
   * Solo la usa OpenAI (`prompt_cache_key`): a partir de GPT-5.6 es lo que
   * enruta la petición a la máquina que tiene el prefijo caliente, así que sin
   * ella los aciertos de caché son erráticos. Anthropic y Gemini la ignoran.
   */
  cacheKey: string;
  /**
   * Tope de tokens de SALIDA (ausente ⇒ el de cada proveedor: 3 000 en
   * Anthropic). Una lectura de documento lo sube: el cuadro de superficies de
   * una plurifamiliar desglosada por estancias son 100 filas, unos 8 000
   * tokens de JSON.
   */
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface ChatEnvelope {
  reply: string;
  proposal: unknown;
} // proposal: null | payload crudo

export type ProviderChatFn = (
  req: ChatRequest,
  apiKey: string,
  model: string,
) => Promise<unknown>;

export const AI_ERROR_MESSAGES: Record<AiErrorKind, string> = {
  "invalid-key": "La API key no es válida o no tiene permisos.",
  "rate-limit":
    "Límite de peticiones alcanzado. Espera unos segundos y reintenta.",
  network: "Error de red o del servicio. Comprueba tu conexión.",
  "bad-response": "El modelo devolvió una respuesta no interpretable.",
  aborted: "Petición cancelada.",
  "schema-too-large":
    "Anthropic (Claude) no admite este módulo porque tiene demasiados campos. Cambia a OpenAI o Google (Gemini) para usar el asistente aquí.",
  unknown: "Error inesperado.",
};
