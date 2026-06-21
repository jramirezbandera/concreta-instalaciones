import { defineConfig } from "vitest/config";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
//
// `base` para GitHub Pages: el sitio se sirve en
// https://<usuario>.github.io/concreta-instalaciones/, así que en BUILD los
// assets cuelgan de ese subpath. En DEV se mantiene "/" para no estorbar el
// servidor local. El routing usa HashRouter, así que el base solo afecta a la
// carga de assets (no a las rutas, que viven tras el #).
export default defineConfig(({ mode }) => {
  // mode === "production" en `vite build` Y en `vite preview` (preview sirve el
  // build de producción); "development" en `vite dev`. Así el preview local
  // coincide con Pages y el dev se queda en "/".
  const base = mode === "production" ? "/concreta-instalaciones/" : "/";
  return {
    base,
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      VitePWA({
        registerType: "prompt", // prompt user before SW update (show toast + "Actualizar")
        devOptions: { enabled: false }, // preserve Vite HMR in dev
        workbox: {
          globPatterns: ["**/*.{js,css,html,woff2,png,svg,ico}"],
          runtimeCaching: [], // offline-first: the whole app-shell is precached
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        },
        manifest: {
          name: "Concreta Instalaciones",
          short_name: "Instalaciones",
          description:
            "Predimensionado de instalaciones + ficha justificativa CTE para arquitectos.",
          lang: "es",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          // start_url/scope/icons cuelgan del base (subpath de Pages en build).
          start_url: base,
          scope: base,
          icons: [
            { src: `${base}favicon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" },
            { src: `${base}icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
            { src: `${base}icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
            { src: `${base}icons/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
          ],
        },
      }),
    ],
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      globals: true,
    },
  };
});
