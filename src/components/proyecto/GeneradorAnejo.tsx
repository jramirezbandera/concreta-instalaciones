import { useCallback, useEffect, useState, type JSX, type ReactNode } from "react";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { estadoDe } from "../../lib/proyecto/progreso";
import { estadoEfectivo, evaluarExpediente } from "../../lib/obra/evaluar";
import { notasExcepcionesLocales } from "../../lib/proyecto/herencia";
import { justificacionRegistry } from "../../data/justificacionRegistry";
import type { FichaData } from "../../lib/pdf/renderFicha";
import type { PdfResult } from "../../lib/pdf/utils";
import type { JustificacionKey, Proyecto } from "../../lib/proyecto/tipos";
import { PdfPreviewModal } from "../ui/PdfPreviewModal";
import { showToast } from "../ui/Toast";
import { formatearFecha } from "../../lib/ui/fecha";
import type { DefinicionSi } from "../../modules/si/definicion";
import type { JustificacionSiBase } from "../../modules/si/tipos";

// =============================================================================
// GeneradorAnejo (feature-8 §D) — el momento del producto: UN PDF con portada,
// índice, las fichas de lo que se calcula (aunque no se haya abierto el módulo,
// feature-16), los no-aplicables con su párrafo y cita, las externas con su
// referencia y los pendientes listados con honestidad. Lo dispara quien lo
// monta (en La obra, el «PDF» de las fichas): este componente pone los clones
// ocultos y la previsualización.
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
// anejo — el documento nunca revienta. Las fichas, los dibujos y jsPDF se
// importan de forma DINÁMICA para no engordar el bundle de La obra.
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

/**
 * Las secciones del DB-SI (feature-19) comparten definición, ficha y dibujo: un
 * adaptador común que carga la definición de cada una.
 */
function adaptadorSi(cargar: () => Promise<DefinicionSi<Record<string, unknown>, JustificacionSiBase>>): Adaptador {
  return async (inputs, id, proyecto) => {
    const [def, pdf] = await Promise.all([cargar(), import("../../modules/si/DibujoPdfSi")]);
    const estado = { ...def.defaults, ...inputs };
    const revisados = proyecto.justificaciones[def.key]?.revisados ?? [];
    const j = def.justificar(estado, proyecto);
    const dibujo = def.dibujo(j, proyecto.edificio);
    const base = def.ficha(j, { estado, edificio: proyecto.edificio, revisados, svg: { nativeW: dibujo.ancho, nativeH: dibujo.alto } });
    const data = { ...base, ...id, observaciones: [...(base.observaciones ?? [])] };
    return {
      data,
      nodo: (
        <Clon id={data.svg!.elementId}>
          <pdf.DibujoPdfSi def={def} j={j} edificio={proyecto.edificio} revisados={revisados} width={CLON_W} height={altoClon(data)} />
        </Clon>
      ),
    };
  };
}

const ADAPTADORES: Partial<Record<JustificacionKey, Adaptador>> = {
  si1: adaptadorSi(async () => (await import("../../modules/si1/definicion")).si1),
  si4: adaptadorSi(async () => (await import("../../modules/si4/definicion")).si4),
  si2: adaptadorSi(async () => (await import("../../modules/si2/definicion")).si2),
  si3: adaptadorSi(async () => (await import("../../modules/si3/definicion")).si3),
  si5: adaptadorSi(async () => (await import("../../modules/si5/definicion")).si5),
  si6: adaptadorSi(async () => (await import("../../modules/si6/definicion")).si6),
  sua6: adaptadorSi(async () => (await import("../../modules/sua6/definicion")).sua6),
  sua7: adaptadorSi(async () => (await import("../../modules/sua7/definicion")).sua7),
  sua9: adaptadorSi(async () => (await import("../../modules/sua9/definicion")).sua9),
  sua1: adaptadorSi(async () => (await import("../../modules/sua1/definicion")).sua1),
  sua2: adaptadorSi(async () => (await import("../../modules/sua2/definicion")).sua2),
  sua3: adaptadorSi(async () => (await import("../../modules/sua3/definicion")).sua3),
  sua4: adaptadorSi(async () => (await import("../../modules/sua4/definicion")).sua4),
  sua8: adaptadorSi(async () => (await import("../../modules/sua8/definicion")).sua8),
  hs2: adaptadorSi(async () => (await import("../../modules/hs2/definicion")).hs2),
  he4: adaptadorSi(async () => (await import("../../modules/he4/definicion")).he4),
  he5: adaptadorSi(async () => (await import("../../modules/he5/definicion")).he5),
  hs1: async (inputs, id, proyecto) => {
    // HS1 (feature-17) sale de El edificio y de los datos de la obra.
    const [estadoMod, just, ficha, seccion, dibujo] = await Promise.all([
      import("../../modules/hs1/estado"),
      import("../../modules/hs1/justificacion"),
      import("../../modules/hs1/ficha"),
      import("../../modules/hs1/seccion"),
      import("../../modules/hs1/SeccionHs1"),
    ]);
    const estado = { ...estadoMod.hs1EstadoDefaults, ...inputs } as typeof estadoMod.hs1EstadoDefaults;
    const revisados = proyecto.justificaciones.hs1?.revisados ?? [];
    const j = just.justificarHs1(estado, proyecto.edificio, just.obraHs1De(proyecto.datosGenerales));
    const svg = seccion.tamanoDibujoHs1(j, proyecto.edificio);
    const base = ficha.toFichaData(j, { estado, edificio: proyecto.edificio, revisados, svg });
    const data = { ...base, ...id, observaciones: [...(base.observaciones ?? [])] };
    return {
      data,
      nodo: (
        <Clon id={data.svg!.elementId}>
          <dibujo.DibujoPdfHs1 j={j} edificio={proyecto.edificio} revisados={revisados} width={CLON_W} height={altoClon(data)} />
        </Clon>
      ),
    };
  },
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

interface GeneradorAnejoProps {
  /** El control que lo dispara (un botón o un enlace), con su estado. */
  children: (p: { generar: () => void; ocupado: boolean }) => ReactNode;
}

export function GeneradorAnejo({ children }: GeneradorAnejoProps): JSX.Element {
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
    const evaluacion = evaluarExpediente(proyecto);
    for (const entry of justificacionRegistry) {
      if (entry.dev) continue;
      const key = entry.key as JustificacionKey;
      const adaptador = ADAPTADORES[key];
      // Entran todas las que se calculan (feature-16), aunque no se hayan
      // abierto: con las entradas que el módulo compondría al abrirse. Las no
      // aplicables, las externas y las que no tienen nada que justificar van al
      // anejo sin ficha.
      const ev = evaluacion.porClave[key];
      if (!adaptador || !ev || !["cumple", "revisar", "no_cumple"].includes(ev.estado)) continue;
      const inputs = estadoEfectivo(proyecto, key);
      if (!inputs) continue;
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
            // jsPDF se carga aquí, bajo demanda: no entra en el bundle de La obra.
            const { renderAnejo } = await import("../../lib/pdf/anejo");
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
      {children({ generar: () => void handleGenerar(), ocupado })}

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
