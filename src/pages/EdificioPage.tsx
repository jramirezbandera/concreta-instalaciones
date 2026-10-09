import { lazy, Suspense, useMemo, useRef, useState, type JSX } from "react";
import { Link } from "react-router";
import { Sparkles } from "lucide-react";
import { Topbar } from "../components/layout/Topbar";
import { useDrawer } from "../components/layout/AppShell";
import { Avisos } from "../components/justificacion/ModuleLayout";
import { CerramientosEdificio } from "../components/edificio/CerramientosEdificio";
import { EditorSeleccion } from "../components/edificio/EditorSeleccion";
import { SeccionEdificio } from "../components/edificio/SeccionEdificio";
import type { Seleccion } from "../components/edificio/presentacion";
import { TiposRepetidos } from "../components/edificio/TiposRepetidos";
import { avisosCerramientos } from "../lib/constructivo/cerramientos";
import { CASOS_EDIFICIO, edificioDeCaso, type CasoEdificio } from "../lib/edificio/casos";
import { fraseEdificio, renumerar, validarEdificio } from "../lib/edificio/derivar";
import { anadirPlantaArriba, anadirSotano, anadirZona, buscarZona } from "../lib/edificio/editar";
import type { Edificio } from "../lib/edificio/tipos";
import { useProyecto } from "../lib/proyecto/ProyectoContext";
import type { Intervencion } from "../lib/proyecto/tipos";

// La ventana de lectura arrastra la capa de IA y pdf.js: se carga al abrirla.
const LeerCuadro = lazy(() => import("../components/edificio/LeerCuadro"));

// =============================================================================
// El edificio (feature-12, REDISENO-V4 §3.1 y maqueta v4). Lo leen todas las
// justificaciones: plantas agrupadas, zonas de uso con su superficie útil y lo
// que se repite. Dos zonas: a la izquierda se edita lo seleccionado; a la
// derecha, la sección (que es el editor) y, debajo, los tipos. Cada cambio se
// guarda al momento por el provider; no hay botón de guardar.
// =============================================================================

const INTERVENCION_LABEL: Record<Intervencion, string> = {
  obra_nueva: "Obra nueva",
  reforma: "Reforma",
  ampliacion: "Ampliación",
  cambio_uso: "Cambio de uso",
};

/** Lo seleccionado al abrir: la primera zona de viviendas u oficinas, o la primera zona. */
function seleccionInicial(e: Edificio): Seleccion {
  const zonas = e.grupos.flatMap((g) => g.zonas);
  const principal =
    zonas.find((z) => z.uso === "viviendas" || z.uso === "vivienda_unifamiliar" || z.uso === "oficinas") ??
    zonas[0];
  return principal ? { tipo: "zona", id: principal.id } : { tipo: "cubierta" };
}

/** ¿Sigue existiendo lo seleccionado? (tras borrar o cambiar de caso, quizá no). */
function existe(e: Edificio, s: Seleccion): boolean {
  switch (s.tipo) {
    case "grupo":
      return e.grupos.some((g) => g.id === s.id);
    case "zona":
      return buscarZona(e, s.id) !== null;
    case "unidad":
      return e.unidades.some((u) => u.id === s.id);
    case "cubierta":
    case "cerramientos":
      return true;
  }
}

/** Caso al que corresponde el edificio tal cual (para marcarlo en el selector). Los cerramientos no cuentan. */
function casoActual(e: Edificio): CasoEdificio | null {
  const { cerramientos: _, ...resto } = renumerar(e);
  const actual = JSON.stringify(resto);
  return CASOS_EDIFICIO.find((c) => JSON.stringify(edificioDeCaso(c.key)) === actual)?.key ?? null;
}

export function EdificioPage(): JSX.Element {
  const { openDrawer } = useDrawer();
  const { proyecto, derivados, actualizarEdificio } = useProyecto();
  const edificio = proyecto.edificio;
  const dg = proyecto.datosGenerales;

  const [seleccion, setSeleccion] = useState<Seleccion | null>(null);
  const [casoPendiente, setCasoPendiente] = useState<CasoEdificio | null>(null);
  const [leyendoCuadro, setLeyendoCuadro] = useState(false);
  /**
   * El último cuadro aplicado, para poder deshacerlo. Se ofrece mientras el
   * edificio siga siendo el que salió del cuadro: cualquier otra edición lo cierra.
   */
  const [deshacer, setDeshacer] = useState<{ anterior: Edificio; aplicado: Edificio; documento: string } | null>(
    null,
  );
  const editorRef = useRef<HTMLElement>(null);

  // En móvil el editor va debajo de la sección: al pulsar algo, se baja hasta él.
  const seleccionar = (s: Seleccion) => {
    setSeleccion(s);
    if (window.matchMedia?.("(max-width: 1023px)").matches) {
      editorRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    }
  };

  const sel = seleccion && existe(edificio, seleccion) ? seleccion : seleccionInicial(edificio);
  const avisos = useMemo(() => [...validarEdificio(edificio), ...avisosCerramientos(edificio)], [edificio]);
  const frase = useMemo(() => fraseEdificio(edificio), [edificio]);
  const caso = useMemo(() => casoActual(edificio), [edificio]);

  const cambiar = (e: Edificio) => actualizarEdificio(e, new Date().toISOString());

  /** Un caso o un cuadro sustituye las plantas y los tipos; los cerramientos elegidos se quedan. */
  const conCerramientos = (nuevo: Edificio): Edificio =>
    edificio.cerramientos ? { ...nuevo, cerramientos: edificio.cerramientos } : nuevo;

  const aplicarCuadro = (leido: Edificio, documento: string) => {
    const nuevo = conCerramientos(leido);
    setDeshacer({ anterior: edificio, aplicado: nuevo, documento });
    cambiar(nuevo);
    setSeleccion(seleccionInicial(nuevo));
    setLeyendoCuadro(false);
  };

  const partirDe = (c: CasoEdificio) => {
    const nuevo = conCerramientos(edificioDeCaso(c));
    cambiar(nuevo);
    setSeleccion(seleccionInicial(nuevo));
    setCasoPendiente(null);
  };

  const obra = [
    INTERVENCION_LABEL[dg.intervencion],
    dg.municipio || null,
    `${dg.altitud_m} m`,
    `zona ${derivados.zonaClimatica.valor}`,
    dg.zonaRadon === "sin_exigencia" ? "radón sin exigencia" : `radón ${dg.zonaRadon}`,
  ]
    .filter((x): x is string => x !== null)
    .join(" · ");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Topbar moduleLabel="El edificio" moduleGroup="Proyecto" onMenuOpen={openDrawer} />

      <div className="scroll-hide flex min-h-0 flex-1 flex-col overflow-y-auto lg:overflow-hidden">
        <header className="border-border-main flex shrink-0 flex-wrap items-end gap-x-6 gap-y-3 border-b px-6 pt-[18px] pb-4">
          <div className="flex min-w-0 flex-[1_1_520px] flex-col gap-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <h1 className="text-text-primary text-[21px] leading-tight font-semibold tracking-[-0.012em]">
                El edificio
              </h1>
              <span className="text-text-disabled text-[12.5px]">lo leen todas las justificaciones</span>
            </div>
            <p className="text-text-secondary max-w-[880px] text-[14px] leading-normal">{frase}</p>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span id="casos-titulo" className="text-text-secondary text-[12.5px]">
                Partir de un caso
              </span>
              {casoPendiente === null ? (
                <div
                  role="group"
                  aria-labelledby="casos-titulo"
                  className="border-border-main bg-bg-surface flex flex-wrap gap-0.5 rounded border p-0.5"
                >
                  {CASOS_EDIFICIO.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      aria-pressed={caso === c.key}
                      onClick={() => {
                        if (caso !== c.key) setCasoPendiente(c.key);
                      }}
                      className={[
                        "h-[30px] rounded-[3px] px-[11px] text-[12.5px] whitespace-nowrap transition-colors",
                        caso === c.key
                          ? "bg-bg-primary text-text-primary ring-border-main font-medium ring-1"
                          : "text-text-secondary hover:text-text-primary",
                      ].join(" ")}
                    >
                      {c.etiqueta}
                    </button>
                  ))}
                </div>
              ) : (
                <div
                  role="alertdialog"
                  aria-label="Confirmar el cambio de caso"
                  className="border-state-warn/40 flex flex-wrap items-center gap-2 rounded border px-2.5 py-1 text-[12.5px]"
                >
                  <span className="text-text-secondary">
                    Se sustituye el edificio entero por «
                    {CASOS_EDIFICIO.find((c) => c.key === casoPendiente)?.etiqueta}».
                  </span>
                  <button
                    type="button"
                    autoFocus
                    onClick={() => partirDe(casoPendiente)}
                    className="bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg h-7 rounded px-2.5 font-medium"
                  >
                    Sustituir
                  </button>
                  <button
                    type="button"
                    onClick={() => setCasoPendiente(null)}
                    className="text-text-secondary hover:text-text-primary h-7 px-1.5"
                  >
                    Cancelar
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setLeyendoCuadro(true)}
                title="Lee un PDF o una captura del cuadro de superficies con IA y propone el edificio para revisarlo"
                className="text-accent hover:bg-tint-accent inline-flex h-8 items-center gap-1.5 rounded border border-dashed border-[color-mix(in_srgb,var(--color-accent)_50%,transparent)] px-[11px] text-[12.5px] transition-colors"
              >
                <Sparkles size={13} aria-hidden="true" />
                Leer el cuadro de superficies
              </button>
            </div>
          </div>
          <p className="text-text-disabled font-mono text-[11px]">
            {obra} ·{" "}
            <Link to={`/p/${proyecto.id}/datos`} className="text-accent hover:text-accent-hover">
              en La obra
            </Link>
          </p>
        </header>

        {deshacer && deshacer.aplicado === edificio && (
          <div
            role="status"
            className="border-border-main bg-tint-accent-soft flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b px-6 py-2 text-[12.5px]"
          >
            <Sparkles size={13} className="text-accent" aria-hidden="true" />
            <span className="text-text-primary">
              Edificio leído de «{deshacer.documento}». Cada zona dice de qué filas sale.
            </span>
            <button
              type="button"
              onClick={() => {
                cambiar(deshacer.anterior);
                setSeleccion(seleccionInicial(deshacer.anterior));
                setDeshacer(null);
              }}
              className="text-accent hover:text-accent-hover font-medium"
            >
              Deshacer
            </button>
            <button
              type="button"
              onClick={() => setDeshacer(null)}
              aria-label="Cerrar el aviso"
              className="text-text-disabled hover:text-text-primary ml-auto"
            >
              ×
            </button>
          </div>
        )}

        <Avisos avisos={avisos} errores={[]} />

        <div className="flex min-h-0 flex-1 flex-col max-lg:flex-none lg:flex-row">
          <aside
            ref={editorRef}
            aria-label="Editar lo seleccionado"
            className="scroll-hide border-border-main bg-bg-surface shrink-0 pb-6 max-lg:order-last max-lg:border-t lg:w-[340px] lg:overflow-y-auto lg:border-r"
          >
            <EditorSeleccion
              edificio={edificio}
              seleccion={sel}
              onCambiar={cambiar}
              onSeleccionar={seleccionar}
              intervencion={dg.intervencion}
            />
          </aside>

          <section
            aria-label="Sección del edificio"
            className="scroll-hide flex min-w-0 flex-1 flex-col lg:overflow-y-auto"
          >
            <div className="border-border-sub flex min-h-[46px] flex-wrap items-center gap-x-4 gap-y-2 border-b px-5 py-2">
              <span className="text-text-disabled font-mono text-[10.5px] tracking-[0.08em] uppercase">
                Sección · de arriba abajo · altura a escala
              </span>
              <span className="text-text-disabled text-[11.5px]">
                Pulsa una planta o una zona: se edita{" "}
                <span className="max-lg:hidden">a la izquierda</span>
                <span className="lg:hidden">debajo</span>. Cada zona lleva su propia superficie útil.
              </span>
            </div>
            <div className="canvas-dot-grid bg-bg-primary flex-[1_0_auto] px-4 pt-[18px] pb-7 sm:px-6">
              <SeccionEdificio
                edificio={edificio}
                intervencion={dg.intervencion}
                seleccion={sel}
                onSeleccionar={seleccionar}
                onAnadirZona={(grupoId) => {
                  const r = anadirZona(edificio, grupoId);
                  cambiar(r.edificio);
                  setSeleccion({ tipo: "zona", id: r.zonaId });
                }}
                onAnadirPlanta={() => {
                  const r = anadirPlantaArriba(edificio);
                  cambiar(r.edificio);
                  setSeleccion({ tipo: "grupo", id: r.grupoId });
                }}
                onAnadirSotano={() => {
                  const r = anadirSotano(edificio);
                  cambiar(r.edificio);
                  setSeleccion({ tipo: "grupo", id: r.grupoId });
                }}
              />
            </div>
            <TiposRepetidos
              edificio={edificio}
              seleccion={sel}
              onCambiar={cambiar}
              onSeleccionar={seleccionar}
            />
            <CerramientosEdificio edificio={edificio} seleccion={sel} onSeleccionar={seleccionar} />
          </section>
        </div>
      </div>

      {leyendoCuadro && (
        <Suspense fallback={null}>
          <LeerCuadro edificio={edificio} onAplicar={aplicarCuadro} onClose={() => setLeyendoCuadro(false)} />
        </Suspense>
      )}
    </div>
  );
}
