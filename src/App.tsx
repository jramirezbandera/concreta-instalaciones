import { createBrowserRouter, RouterProvider, Navigate, Outlet } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { AppShell } from "./components/layout/AppShell";
import { RouteFallback } from "./components/layout/RouteFallback";
import { RouteHelmet } from "./components/layout/RouteHelmet";
import { RouteProgressBar } from "./components/layout/RouteProgressBar";
import { ChunkErrorElement } from "./components/layout/ChunkErrorElement";
import { ThemeProvider } from "./lib/theme/ThemeProvider";

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
    </>
  );
}

const lazyComponent =
  <T,>(loader: () => Promise<Record<string, T>>, name: string) =>
  () =>
    loader().then((m) => ({ Component: m[name] as React.ComponentType }));

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    HydrateFallback: RouteFallback,
    errorElement: <ChunkErrorElement />,
    children: [
      { path: "/", element: <Navigate to="/_smoke" replace /> },
      {
        element: <AppShell />,
        children: [
          {
            path: "_smoke",
            lazy: lazyComponent(() => import("./modules/_smoke/ui"), "SmokeModule"),
          },
          {
            path: "hs/ventilacion",
            lazy: lazyComponent(() => import("./modules/hs3/ui"), "Hs3Module"),
          },
        ],
      },
      { path: "*", element: <Navigate to="/_smoke" replace /> },
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
