import { defineConfig } from "vitest/config";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "node:url";

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
    build: {
      rolldownOptions: {
        output: {
          // La capa de IA (feature-13, portada de Concreta) solo se alcanza por
          // `import()`: los SDK desde src/lib/ai/providers/* y pdf.js desde
          // src/lib/ai/pdfPrep.ts, dentro de la ventana «Leer el cuadro de
          // superficies», que también va por `lazy`. Cada uno en su chunk con
          // nombre estable para poder sacarlos del precache (globIgnores).
          codeSplitting: {
            groups: [
              // El helper de `import()` de Vite DEBE ir aparte. Si no, rolldown
              // lo mete en `ai-vendor`, el entry lo importa estáticamente y el
              // arranque arrastra los SDK (o se queda en blanco tras un deploy,
              // al pedir un `ai-vendor` viejo que ya no está). Mismo arreglo que
              // en Concreta.
              { name: "vite-preload-helper", test: /preload-helper/ },
              {
                name: "ai-vendor",
                test: /node_modules[\\/](@anthropic-ai[\\/]sdk|openai|@google[\\/]genai)[\\/]/,
              },
              { name: "pdfjs-vendor", test: /node_modules[\\/]pdfjs-dist[\\/]/ },
            ],
          },
        },
      },
    },
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
          // Los SDK de IA y pdf.js no se precachean: sin red no hay lectura con
          // IA, así que tenerlos en caché no sirve de nada y engordaría el SW.
          // Seguro solo porque el helper de `import()` va en su propio chunk
          // (arriba); sin ese grupo, excluirlos dejaría la app en blanco.
          globIgnores: ["**/ai-vendor-*.js", "**/pdfjs-vendor-*.js"],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        },
        manifest: {
          name: "Concreta Memorias",
          short_name: "Memorias",
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
      // El módulo virtual del aviso de versión nueva solo existe en el build.
      alias: { "virtual:pwa-register/react": fileURLToPath(new URL("./src/test/pwaRegisterMock.ts", import.meta.url)) },
      globals: true,
      // 15 s (vitest trae 5 s). Los tests de integración de módulo montan el
      // router real y sus pantallas van por `lazy()`: la primera aserción de
      // cada archivo espera a que el chunk se importe y compile en jsdom, lo
      // que con la suite entera en paralelo supera de largo los 5 s. Con el
      // valor por defecto el propio test moría ANTES que su `waitFor` (8 s),
      // así que el fallo se veía como "timed out", no como un error real.
      // 30 s desde feature-20: con las nueve secciones del DB-SUA, La obra
      // importa veinte definiciones y cada test de interfaz transforma el doble
      // de ficheros; solos tardan ~12 s, con la suite en paralelo pasaban de 15.
      testTimeout: 30000,
    },
  };
});
