// Sección de ajustes BYOK compartida del asistente IA (T2.5 — UI compartida).
// Extraída por COPIA de src/features/steel-beams/AiFillModal.tsx (que conserva
// su copia privada hasta la Fase 4 — duplicación temporal deliberada).
//
// SEGURIDAD: la API key nunca se loguea ni se interpola en textos/errores.
import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import type { AiProviderId } from "../../lib/ai/types";
import { AI_PROVIDER_KEY_URLS, AI_PROVIDER_LABELS } from "../../lib/ai/models";
import { useAiSettings } from "../../lib/ai/useAiSettings";

const PROVIDERS: readonly AiProviderId[] = ["anthropic", "openai", "gemini"];

/** Chevron de sección colapsable (mismo dibujo que CollapsibleSection). */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      aria-hidden="true"
      className={`shrink-0 transition-transform duration-150 ${open ? "" : "-rotate-90"}`}
    >
      <path
        d="M2 3.5 L5 6.5 L8 3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ByokSettingsProps {
  /**
   * Estado inicial del colapsable. Si se omite, arranca abierta cuando el
   * proveedor activo no tiene key (el usuario no puede enviar sin ella).
   */
  defaultOpen?: boolean;
}

/**
 * Sección de ajustes BYOK: proveedor + API key. Colapsable y autónoma
 * (lee/escribe vía useAiSettings — requiere <AiSettingsProvider>).
 */
export function ByokSettings({ defaultOpen }: ByokSettingsProps = {}) {
  const { settings, activeKey, usingSharedKey, setProvider, setKey, clearKey } =
    useAiSettings();
  const [open, setOpen] = useState(() => defaultOpen ?? activeKey === null);
  const provider = settings.provider;
  const keyValue = settings.keys[provider] ?? "";

  return (
    <div className="border-border-main rounded border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-text-disabled hover:text-text-secondary flex w-full items-center gap-2 px-3 py-2 text-[10px] font-semibold tracking-[0.07em] uppercase transition-colors"
      >
        <Chevron open={open} />
        Proveedor y API key
        {activeKey === null && (
          <span className="text-state-warn ml-auto inline-flex items-center gap-1 text-[11px] font-normal tracking-normal normal-case">
            <TriangleAlert size={11} aria-hidden="true" />
            Falta la API key
          </span>
        )}
      </button>
      {open && (
        <div className="border-border-sub space-y-2.5 border-t px-3 pt-2.5 pb-3">
          <div
            className="flex flex-wrap gap-x-4 gap-y-1.5"
            role="radiogroup"
            aria-label="Proveedor de IA"
          >
            {PROVIDERS.map((p) => (
              <label
                key={p}
                className="text-text-secondary inline-flex cursor-pointer items-center gap-1.5 text-[12px]"
              >
                <input
                  type="radio"
                  name="ai-provider"
                  checked={provider === p}
                  onChange={() => setProvider(p)}
                  className="accent-accent"
                />
                {AI_PROVIDER_LABELS[p]}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={keyValue}
              onChange={(e) => setKey(provider, e.target.value)}
              placeholder={`API key de ${AI_PROVIDER_LABELS[provider]}`}
              autoComplete="new-password"
              spellCheck={false}
              aria-label={`API key de ${AI_PROVIDER_LABELS[provider]}`}
              className="bg-bg-primary border-border-main text-text-primary placeholder:text-text-disabled focus:border-accent min-w-0 flex-1 rounded border px-3 py-1.5 font-mono text-[12px] transition-colors outline-none"
            />
            <button
              type="button"
              onClick={() => clearKey(provider)}
              disabled={keyValue === ""}
              className="text-text-secondary hover:text-text-primary hover:bg-bg-elevated rounded px-3 py-1.5 text-[12px] transition-colors disabled:opacity-40"
            >
              Borrar
            </button>
          </div>
          <a
            href={AI_PROVIDER_KEY_URLS[provider]}
            target="_blank"
            rel="noreferrer"
            className="text-accent hover:text-accent-hover inline-block text-[11px] transition-colors"
          >
            Obtener API key
          </a>
          {usingSharedKey && keyValue === "" && (
            <p className="text-text-secondary text-[11px] leading-snug">
              <span className="text-text-primary">
                Usando la clave compartida de Concreta
              </span>{" "}
              (gratis, con límite de uso). Añade la tuya para peticiones sin
              límite.
            </p>
          )}
          <p className="text-text-secondary text-[11px] leading-snug">
            La key se guarda solo en este navegador (localStorage), sin cifrar.
            Úsala solo en equipos de confianza.
          </p>
        </div>
      )}
    </div>
  );
}
