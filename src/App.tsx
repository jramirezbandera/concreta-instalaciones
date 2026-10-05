import { createHashRouter, RouterProvider, Navigate, Outlet } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { AppShell } from "./components/layout/AppShell";
import { AvisoActualizacion } from "./components/layout/AvisoActualizacion";
import { RouteFallback } from "./components/layout/RouteFallback";
import { RouteHelmet } from "./components/layout/RouteHelmet";
import { RouteProgressBar } from "./components/layout/RouteProgressBar";
import { ChunkErrorElement } from "./components/layout/ChunkErrorElement";
import { ThemeProvider } from "./lib/theme/ThemeProvider";
import { InicioPage } from "./pages/InicioPage";
import { ObraPage } from "./pages/ObraPage";
import { MemoriaPage } from "./pages/MemoriaPage";
import { FormDatosGeneralesPage } from "./pages/FormDatosGeneralesPage";
import { EdificioPage } from "./pages/EdificioPage";
import { ProyectoLayout } from "./pages/ProyectoLayout";
import { RedirectLegacy } from "./pages/RedirectLegacy";

// react-router v7 `lazy`: chunk loading integrates with the data router's
// pending-state machine. RootLayout renders <RouteHelmet/> above <Outlet/> so
// the document title updates synchronously before the lazy chunk lands.
// errorElement at root catches route.lazy() rejections (stale chunk URLs).

function RootLayout() {
  return (
    <>
      <RouteHelmet />
      <RouteProgressBar />
      <Outlet />
      <AvisoActualizacion />
    </>
  );
}

const lazyComponent =
  <T,>(loader: () => Promise<Record<string, T>>, name: string) =>
  () =>
    loader().then((m) => ({ Component: m[name] as React.ComponentType }));

// HashRouter (no BrowserRouter): GitHub Pages es hosting estático sin fallback
// de servidor; con rutas tras el # toda URL carga index.html (sin 404 al
// recargar /p/<id>/hs/ventilacion). El base de Vite solo afecta a los assets,
// no a estas rutas. El query string (?numDormitorios=…&estancias=…) viaja
// intacto tras el #, sin re-encodear, preservando el "Compartir".
//
// Árbol feature-6 T4.1: "/" = lista de expedientes, "/nuevo" = alta, el
// expediente vive bajo "/p/:id" (ProyectoLayout = Provider + AppShell) y las
// URLs pre-expediente ("/hs/*", "/he/*") redirigen al proyecto activo
// conservando el query string. "/_smoke" queda como sandbox SIN provider
// (el sandbox con proyecto sintético llega en F5).
const router = createHashRouter([
  {
    element: <RootLayout />,
    HydrateFallback: RouteFallback,
    errorElement: <ChunkErrorElement />,
    children: [
      { path: "/", element: <InicioPage /> },
      { path: "nuevo", element: <FormDatosGeneralesPage modo="crear" /> },
      {
        element: <AppShell />,
        children: [
          {
            path: "_smoke",
            lazy: lazyComponent(() => import("./modules/_smoke/ui"), "SmokeModule"),
          },
        ],
      },
      {
        path: "p/:id",
        element: <ProyectoLayout />,
        children: [
          { index: true, element: <ObraPage /> },
          { path: "datos", element: <FormDatosGeneralesPage modo="editar" /> },
          { path: "edificio", element: <EdificioPage /> },
          { path: "memoria", element: <MemoriaPage /> },
          {
            path: "hs/humedad",
            lazy: lazyComponent(() => import("./modules/hs1/ui"), "Hs1Module"),
          },
          {
            path: "hs/residuos",
            lazy: lazyComponent(() => import("./modules/hs2/ui"), "Hs2Module"),
          },
          {
            path: "hs/ventilacion",
            lazy: lazyComponent(() => import("./modules/hs3/ui"), "Hs3Module"),
          },
          {
            path: "hs/saneamiento",
            lazy: lazyComponent(() => import("./modules/hs5/ui"), "Hs5Module"),
          },
          {
            path: "hs/fontaneria",
            lazy: lazyComponent(() => import("./modules/hs4/ui"), "Hs4Module"),
          },
          {
            path: "hs/radon",
            lazy: lazyComponent(() => import("./modules/hs6/ui"), "Hs6Module"),
          },
          {
            path: "he/envolvente",
            lazy: lazyComponent(() => import("./modules/he1/ui"), "He1Module"),
          },
          {
            path: "he/acs",
            lazy: lazyComponent(() => import("./modules/he4/ui"), "He4Module"),
          },
          {
            path: "he/generacion",
            lazy: lazyComponent(() => import("./modules/he5/ui"), "He5Module"),
          },
          {
            path: "he/recarga",
            lazy: lazyComponent(() => import("./modules/he6/ui"), "He6Module"),
          },
          {
            path: "rebt/prevision",
            lazy: lazyComponent(() => import("./modules/rebt/ui"), "RebtModule"),
          },
          {
            path: "si/propagacion-interior",
            lazy: lazyComponent(() => import("./modules/si1/ui"), "Si1Module"),
          },
          {
            path: "si/estructura",
            lazy: lazyComponent(() => import("./modules/si6/ui"), "Si6Module"),
          },
          {
            path: "si/instalaciones",
            lazy: lazyComponent(() => import("./modules/si4/ui"), "Si4Module"),
          },
          {
            path: "si/propagacion-exterior",
            lazy: lazyComponent(() => import("./modules/si2/ui"), "Si2Module"),
          },
          {
            path: "si/evacuacion",
            lazy: lazyComponent(() => import("./modules/si3/ui"), "Si3Module"),
          },
          {
            path: "si/bomberos",
            lazy: lazyComponent(() => import("./modules/si5/ui"), "Si5Module"),
          },
          {
            path: "sua/piscinas",
            lazy: lazyComponent(() => import("./modules/sua6/ui"), "Sua6Module"),
          },
          {
            path: "sua/vehiculos",
            lazy: lazyComponent(() => import("./modules/sua7/ui"), "Sua7Module"),
          },
          {
            path: "sua/accesibilidad",
            lazy: lazyComponent(() => import("./modules/sua9/ui"), "Sua9Module"),
          },
          {
            path: "sua/caidas",
            lazy: lazyComponent(() => import("./modules/sua1/ui"), "Sua1Module"),
          },
          {
            path: "sua/impacto",
            lazy: lazyComponent(() => import("./modules/sua2/ui"), "Sua2Module"),
          },
          {
            path: "sua/aprisionamiento",
            lazy: lazyComponent(() => import("./modules/sua3/ui"), "Sua3Module"),
          },
          {
            path: "sua/iluminacion",
            lazy: lazyComponent(() => import("./modules/sua4/ui"), "Sua4Module"),
          },
          {
            path: "sua/rayo",
            lazy: lazyComponent(() => import("./modules/sua8/ui"), "Sua8Module"),
          },
        ],
      },
      { path: "hs/*", element: <RedirectLegacy /> },
      { path: "he/*", element: <RedirectLegacy /> },
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </HelmetProvider>
  );
}
