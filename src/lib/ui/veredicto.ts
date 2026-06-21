// Mapas compartidos veredicto → clases Tailwind (UI de pantalla). Únicos y
// reutilizados por todos los módulos (HS3/HS4/HS5/HE1…); antes estaban
// duplicados verbatim en cada `ui.tsx`. La etiqueta textual del veredicto vive
// aparte en `lib/pdf/utils.ts` (STATUS_LABEL, mayúsculas para el banner/PDF).

import type { Veredicto } from "../pdf/renderFicha";

/** Color de texto por veredicto (token de tema). */
export const STATE_TEXT: Record<Veredicto, string> = {
  ok: "text-state-ok",
  warn: "text-state-warn",
  fail: "text-state-fail",
  neutral: "text-state-neutral",
};

/** Fondo + borde (tinte de banner) por veredicto. */
export const STATE_TINT: Record<Veredicto, string> = {
  ok: "bg-tint-ok border-state-ok/30",
  warn: "bg-tint-warn border-state-warn/30",
  fail: "bg-tint-fail border-state-fail/30",
  neutral: "bg-tint-neutral border-border-main",
};
