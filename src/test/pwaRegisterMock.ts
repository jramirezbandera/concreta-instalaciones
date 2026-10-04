// Sustituto de `virtual:pwa-register/react` en los tests (alias en vite.config):
// el módulo virtual solo existe en el build de vite-plugin-pwa, no en vitest.
// Sin service worker no hay versión nueva que avisar.
import { useState } from "react";

export function useRegisterSW() {
  const needRefresh = useState(false);
  const offlineReady = useState(false);
  return { needRefresh, offlineReady, updateServiceWorker: async () => {} };
}
