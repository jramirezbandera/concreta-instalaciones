import { useCallback, useEffect, useState, type JSX, type ReactNode } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { estadoDe } from "../../lib/proyecto/progreso";
import { notasExcepcionesLocales } from "../../lib/proyecto/herencia";
import { justificacionRegistry } from "../../data/justificacionRegistry";
import { renderAnejo } from "../../lib/pdf/anejo";
import type { FichaData } from "../../lib/pdf/renderFicha";
import type { PdfResult } from "../../lib/pdf/utils";
import type { JustificacionKey, Proyecto } from "../../lib/proyecto/tipos";
import { PdfPreviewModal } from "../ui/PdfPreviewModal";
import { showToast } from "../ui/Toast";

// =============================================================================
// GeneradorAnejo (feature-8 §D) — el momento del producto: UN PDF con portada,
// índice, las fichas de lo trabajado, los no-aplicables con su párrafo y cita,
// las externas con su referencia y los pendientes listados con honestidad.
//
// CÓMO FUNCIONA (y por qué en dos fases): `renderAnejo` rasteriza cada diagrama
// leyéndolo DEL DOM por su id (`embedSvgAsImage` → canvas), así que los clones
// ocultos de TODOS los módulos tienen que estar montados ANTES de llamarlo.
// Por eso el flujo es: (1) calcular en memoria y montar los clones → (2) un
// efecto espera al pintado (doble rAF) y entonces compone el PDF. Los ids
// `*-svg-pdf` son únicos por módulo, así que conviven sin colisión.
//
// HONESTIDAD: si un módulo falla al calcular (inputs de una versión anterior,
// datos incoherentes) su ficha se omite y queda listada como pendiente en el
// anejo — el documento nunca revienta. Los motores se importan de forma
// DINÁMICA para no engordar el bundle del dashboard.
// =============================================================================

/** Módulo listo para el anejo: su ficha y el clon oculto de su diagrama. */
interface ModuloPreparado {
  key: JustificacionKey;
  data: FichaData;
  /** Clon oculto del SVG en modo `pdf`, con el id que busca `renderFicha`. */
  nodo: ReactNode;
}

/** Identificación del proyecto que se inyecta en cada ficha (patrón de los ui.tsx). */
interface Identificacion {
  proyecto: string;
  fechaProyecto: string;
  observaciones: string[];
}

/**
 * Adaptador por módulo: importa motor + ficha + render bajo demanda, calcula y
 * devuelve la `FichaData` completa (con la identificación del expediente) junto
 * al clon oculto de su diagrama. Los inputs guardados se mezclan sobre los
 * defaults del módulo: un proyecto viejo al que le falte un campo nuevo sigue
 * generando anejo en vez de romperlo.
 */
type Adaptador = (
  inputs: Record<string, unknown>,
  id: Identificacion,
  proyecto: Proyecto,
) => Promise<{ data: FichaData; nodo: ReactNode }>;

/** Ancho CSS del clon oculto: más resolución que la de pantalla para el raster. */
const CLON_W = 560;

/** Envoltorio posicionado fuera de pantalla con el id que rasteriza la ficha. */
function Clon({ id, children }: { id: string; children: ReactNode }): JSX.Element {
  return (
    <div id={id} style={{ position: "absolute", left: "-9999px", top: 0 }}>
      {children}
    </div>
  );
}

/** Alto del clon conservando la proporción del viewBox nativo de la ficha. */
function altoClon(data: FichaData): number {
  const s = data.svg;
  if (!s || s.nativeW <= 0) return Math.round(CLON_W * 0.75);
  return Math.round((CLON_W * s.nativeH) / s.nativeW);
}

const ADAPTADORES: Partial<Record<JustificacionKey, Adaptador>> = {
  hs3: async (inputs, id, proyecto) => {
    // Desde feature-15 HS3 se deduce de El edificio, como HS5.
    const [estadoMod, just, ficha, planta, dibujo] = await Promise.all([
      import("../../modules/hs3/estado"),
      import("../../modules/hs3/justificacion"),
      import("../../modules/hs3/ficha"),
      import("../../modules/hs3/planta"),
      import("../../modules/hs3/PlantaHs3"),
    ]);
    const estado = { ...estadoMod.hs3EstadoDefaults, ...inputs } as typeof estadoMod.hs3EstadoDefaults;
    const revisados = proyecto.justificaciones.hs3?.revisados ?? [];
    const j = just.justificarHs3(estado, proyecto.edificio);
    const svg = planta.tamanoDibujoHs3();
    const base = ficha.toFichaData(j, { estado, edificio: proyecto.edificio, revisados, svg });
    const data = { ...base, ...id, observaciones: [...(base.observaciones ?? [])] };
    return {
      data,
      nodo: (
        <Clon id={data.svg!.elementId}>
          <dibujo.DibujoPdfHs3 j={j} parte={j.partes[0]?.id ?? null} revisados={revisados} width={CLON_W} height={altoClon(data)} />
        </Clon>
      ),
    };
  },
  hs4: async (inputs, id, proyecto) => {
    // Desde feature-15 HS4 se deduce de El edificio, como HS5.
    const [estadoMod, just, ficha, seccion, dibujo] = await Promise.all([
      import("../../modules/hs4/estado"),
      import("../../modules/hs4/justificacion"),
      import("../../modules/hs4/ficha"),
      import("../../modules/hs4/seccion"),
      import("../../modules/hs4/SeccionHs4"),
    ]);
    const estado = { ...estadoMod.hs4EstadoDefaults, ...inputs } as typeof estadoMod.hs4EstadoDefaults;
    const obra = { presionAcometida_kPa: proyecto.datosGenerales.presionAcometida_kPa };
    const revisados = proyecto.justificaciones.hs4?.revisados ?? [];
    const j = just.justificarHs4(estado, proyecto.edificio, obra);
    const svg = seccion.tamanoDibujoHs4(j, proyecto.edificio);
    const base = ficha.toFichaData(j, { estado, edificio: proyecto.edificio, obra, revisados, svg });
    const data = { ...base, ...id, observaciones: [...(base.observaciones ?? [])] };
    return {
      data,
      nodo: (
        <Clon id={data.svg!.elementId}>
          <dibujo.DibujoPdfHs4 j={j} edificio={proyecto.edificio} revisados={revisados} width={CLON_W} height={altoClon(data)} />
        </Clon>
      ),
    };
  },
  hs5: async (inputs, id, proyecto) => {
    // Desde feature-14 HS5 se deduce de El edificio: además de sus entradas
    // necesita el edificio, los datos de la obra y los avisos revisados.
    const [estadoMod, just, ficha, seccion, dibujo] = await Promise.all([
      import("../../modules/hs5/estado"),
      import("../../modules/hs5/justificacion"),
      import("../../modules/hs5/ficha"),
      import("../../modules/hs5/seccion"),
      import("../../modules/hs5/SeccionHs5"),
    ]);
    const estado = { ...estadoMod.hs5EstadoDefaults, ...inputs } as typeof estadoMod.hs5EstadoDefaults;
    const obra = {
      pluviometria: proyecto.datosGenerales.pluviometria,
      cotaAlcantarillado_m: proyecto.datosGenerales.cotaAlcantarillado_m,
    };
    const revisados = proyecto.justificaciones.hs5?.revisados ?? [];
    const j = just.justificarHs5(estado, proyecto.edificio, obra);
    const svg = seccion.tamanoDibujoHs5(j, proyecto.edificio);
    const base = ficha.toFichaData(j, { estado, edificio: proyecto.edificio, obra, revisados, svg });
    // Las excepciones locales solo cuentan con la red ajustada a mano.
    const data = { ...base, ...id, observaciones: [...(base.observaciones ?? []), ...(j.modo === "manual" ? id.observaciones : [])] };
    return {
      data,
      nodo: (
        <Clon id={data.svg!.elementId}>
          <dibujo.DibujoPdfHs5 j={j} edificio={proyecto.edificio} revisados={revisados} width={CLON_W} height={altoClon(data)} />
        </Clon>
      ),
    };
  },
  hs6: async (inputs, id, proyecto) => {
    // Desde feature-15 HS6 se deduce de El edificio, como HS5.
    const [estadoMod, just, ficha, seccion, dibujo] = await Promise.all([
      import("../../modules/hs6/estado"),
      import("../../modules/hs6/justificacion"),
      import("../../modules/hs6/ficha"),
      import("../../modules/hs6/seccion"),
      import("../../modules/hs6/SeccionHs6"),
    ]);
    const estado = { ...estadoMod.hs6EstadoDefaults, ...inputs } as typeof estadoMod.hs6EstadoDefaults;
    const revisados = proyecto.justificaciones.hs6?.revisados ?? [];
    const j = just.justificarHs6(estado, proyecto.edificio);
    const svg = seccion.tamanoDibujoHs6();
    const base = ficha.toFichaData(j, { estado, edificio: proyecto.edificio, revisados, svg });
    const data = { ...base, ...id, observaciones: [...(base.observaciones ?? [])] };
    return {
      data,
      nodo: (
        <Clon id={data.svg!.elementId}>
          <dibujo.DibujoPdfHs6 j={j} edificio={proyecto.edificio} revisados={revisados} width={CLON_W} height={altoClon(data)} />
        </Clon>
      ),
    };
  },
  he1: async (inputs, id, proyecto) => {
    // Desde feature-15 HE1 se deduce de El edificio, como HS5.
    const [estadoMod, just, ficha, dibujoGeo, dibujo] = await Promise.all([
      import("../../modules/he1/estado"),
      import("../../modules/he1/justificacion"),
      import("../../modules/he1/ficha"),
      import("../../modules/he1/dibujo"),
      import("../../modules/he1/DibujoHe1"),
    ]);
    const estado = { ...estadoMod.he1EstadoDefaults, ...inputs } as typeof estadoMod.he1EstadoDefaults;
    const dg = proyecto.datosGenerales;
    const revisados = proyecto.justificaciones.he1?.revisados ?? [];
    const j = just.justificarHe1(estado, proyecto.edificio, { provincia: dg.provincia, altitud_m: dg.altitud_m, municipio: dg.municipio });
    const svg = dibujoGeo.tamanoDibujoHe1();
    const base = ficha.toFichaData(j, { estado, edificio: proyecto.edificio, revisados, svg });
    const data = { ...base, ...id, observaciones: [...(base.observaciones ?? [])] };
    return {
      data,
      nodo: (
        <Clon id={data.svg!.elementId}>
          <dibujo.DibujoPdfHe1 j={j} revisados={revisados} width={CLON_W} height={altoClon(data)} />
        </Clon>
      ),
    };
  },
};

/** "22 ago 2026" — misma fecha corta es-ES que usan las fichas sueltas. */
function formatearFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function GeneradorAnejo(): JSX.Element {
  const { proyecto, derivados } = useProyecto();
  const [fase, setFase] = useState<"idle" | "calculando" | "rasterizando">("idle");
  const [preparados, setPreparados] = useState<ModuloPreparado[]>([]);
  const [pdf, setPdf] = useState<PdfResult | null>(null);

  // Revoca el blob al cerrar/desmontar (mismo criterio que usePdfPreview).
  useEffect(() => {
    return () => {
      if (pdf) URL.revokeObjectURL(pdf.blobUrl);
    };
  }, [pdf]);

  // ── Fase 1: calcular en memoria y montar los clones ────────────────────────
  const handleGenerar = useCallback(async () => {
    setFase("calculando");
    const identificacion = {
      proyecto: proyecto.nombre,
      fechaProyecto: formatearFecha(proyecto.modificado),
    };

    const listos: ModuloPreparado[] = [];
    for (const entry of justificacionRegistry) {
      if (entry.dev) continue;
      const key = entry.key as JustificacionKey;
      const adaptador = ADAPTADORES[key];
      const inputs = proyecto.justificaciones[key]?.inputs;
      // Solo entran las que el usuario ha trabajado (con inputs guardados) y
      // cuya aplicabilidad las hace exigibles; el resto va al anejo como
      // no-aplica / externa / pendiente, sin ficha.
      if (!adaptador || !inputs) continue;
      const estado = estadoDe(proyecto, key);
      if (estado.aplicabilidad === "no_aplica" || estado.aplicabilidad === "externo") continue;
      try {
        const { data, nodo } = await adaptador(
          inputs,
          {
            ...identificacion,
            observaciones: notasExcepcionesLocales({
              key,
              dg: proyecto.datosGenerales,
              d: derivados,
              state: inputs,
              overrides: proyecto.justificaciones[key]?.overridesContexto ?? [],
            }),
          },
          proyecto,
        );
        listos.push({ key, data, nodo });
      } catch {
        // Módulo que no calcula con los inputs guardados: se omite su ficha y
        // queda como pendiente en el anejo (nunca se aborta el documento).
        showToast(`No se pudo calcular ${entry.codigo}: se omite su ficha`, {
          autoDismiss: 4000,
        });
      }
    }

    if (listos.length === 0) {
      setFase("idle");
      showToast("Aún no hay ninguna justificación calculada para el anejo", {
        autoDismiss: 4000,
      });
      return;
    }

    setPreparados(listos);
    setFase("rasterizando");
  }, [proyecto, derivados]);

  // ── Fase 2: con los clones ya en el DOM, componer el PDF ───────────────────
  useEffect(() => {
    if (fase !== "rasterizando" || preparados.length === 0) return;
    let cancelado = false;

    // Doble rAF: garantiza que el navegador ha pintado los clones antes de
    // serializarlos a canvas (el raster lee del DOM).
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        void (async () => {
          try {
            const estados = justificacionRegistry
              .filter((e) => !e.dev)
              .map((e) => ({
                key: e.key as JustificacionKey,
                estado: estadoDe(proyecto, e.key as JustificacionKey),
              }));
            const resultado = await renderAnejo({
              proyecto,
              derivados,
              fecha: formatearFecha(proyecto.modificado),
              estados,
              fichas: preparados.map((p) => ({ key: p.key, data: p.data })),
            });
            if (cancelado) {
              URL.revokeObjectURL(resultado.blobUrl);
              return;
            }
            setPdf(resultado);
          } catch {
            showToast("No se pudo generar el anejo", { autoDismiss: 4000 });
          } finally {
            if (!cancelado) {
              setFase("idle");
              setPreparados([]);
            }
          }
        })();
      });
    });

    return () => {
      cancelado = true;
      cancelAnimationFrame(id);
    };
  }, [fase, preparados, proyecto, derivados]);

  const ocupado = fase !== "idle";

  return (
    <>
      <button
        type="button"
        onClick={() => void handleGenerar()}
        disabled={ocupado}
        className="bg-btn-primary-bg text-btn-primary-fg hover:bg-btn-primary-hover focus-visible:outline-accent mt-3.5 flex w-full items-center justify-center gap-1.5 rounded px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-2 disabled:cursor-wait disabled:opacity-70"
      >
        {ocupado ? (
          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
        ) : (
          <FileDown size={14} aria-hidden="true" />
        )}
        {ocupado ? "Generando anejo…" : "Generar anejo CTE (PDF)"}
      </button>
      <p className="text-text-disabled mt-1.5 text-center text-[11px]">
        Portada, índice, fichas y apartados no aplicables con su párrafo
      </p>

      {/* Clones ocultos de los diagramas: deben estar en el DOM para el raster. */}
      {preparados.length > 0 && (
        <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
          {preparados.map((p) => (
            <div key={p.key}>{p.nodo}</div>
          ))}
        </div>
      )}

      {pdf && (
        <PdfPreviewModal
          blobUrl={pdf.blobUrl}
          filename={pdf.filename}
          pageCount={pdf.pageCount}
          onDownload={() => {
            const a = document.createElement("a");
            a.href = pdf.blobUrl;
            a.download = pdf.filename;
            a.click();
          }}
          onClose={() => {
            URL.revokeObjectURL(pdf.blobUrl);
            setPdf(null);
          }}
        />
      )}
    </>
  );
}
