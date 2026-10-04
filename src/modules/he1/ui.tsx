// DB-HE1 — Pantalla del módulo de la envolvente térmica (feature-15, al patrón
// de HS5). La envolvente se deduce de El edificio: a la izquierda «Qué entra»
// (la zona, la envolvente y sus cerramientos con su U frente al límite) y las
// decisiones; a la derecha la sección del cerramiento elegido con sus cifras
// pulsables y la franja debajo; Comprobaciones es la lista y Memoria, el texto.
// Lo que no cumple sale arriba con el cambio que lo arregla.
//
// React 19 + React Compiler: componente PURO. El cálculo es síncrono en render
// (useMemo sobre el estado diferido); no hay efectos de cálculo.

import { useDeferredValue, useMemo, useState } from "react";
import { useJustificacionState } from "../../hooks/useJustificacionState";
import { usePdfPreview } from "../../hooks/usePdfPreview";
import {
  ModuleLayout,
  type AvisoModulo,
  type IncumplimientoModulo,
  type ResumenVeredicto,
  type VistaModulo,
} from "../../components/justificacion/ModuleLayout";
import { DibujoConEtiquetas } from "../../components/justificacion/DibujoConEtiquetas";
import { FranjaDetalle } from "../../components/justificacion/FranjaDetalle";
import { LienzoAjustado } from "../../components/justificacion/LienzoAjustado";
import { ListaComprobaciones } from "../../components/justificacion/ListaComprobaciones";
import { QueEntra } from "../../components/justificacion/QueEntra";
import { PdfPreviewModal } from "../../components/ui/PdfPreviewModal";
import { showToast } from "../../components/ui/Toast";
import { zonaClimaticaDe } from "../../data/zonasClimaticasHE";
import { avisosPendientes, estadosElementos, veredictoConRevision } from "../../lib/cte/estados";
import { textoPlanoMemoria } from "../../lib/cte/memoria";
import { renderFicha } from "../../lib/pdf/renderFicha";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { ajustar } from "../../lib/ui/ajustar";
import { DecisionesHe1 } from "./DecisionesHe1";
import { calcularDibujoHe1, tamanoDibujoHe1, vistaDe } from "./dibujo";
import { DibujoHe1, DibujoPdfHe1 } from "./DibujoHe1";
import { filasQueEntraHe1 } from "./entra";
import type { RolCerramiento } from "./envolvente";
import { he1EstadoDefaults, type He1Estado } from "./estado";
import { toFichaData } from "./ficha";
import { justificarHe1, nombreSuelo } from "./justificacion";
import { memoriaHe1 } from "./memoria";
import { HE1_PDF_SVG_ID } from "./svg-meta";
import {
  describirDibujoHe1,
  franjaDe,
  fraseHe1,
  metricasHe1,
  resultadoLista,
  textoAviso,
  textoEtiqueta,
  textoIncumplimiento,
} from "./textos";

type He1State = { [K in keyof He1Estado]: He1Estado[K] };

const PISTA: Record<RolCerramiento, string> = {
  fachada: "Cambia el espesor del aislante en la decisión 1: la U y las temperaturas se recalculan.",
  cubierta: "Pulsa la U para ver de dónde sale.",
  suelo: "El límite depende de lo que haya debajo.",
  ventanas: "El vidrio manda: es el 75 % del hueco.",
};

export function He1Module() {
  const { state, setField, reset, herencia } = useJustificacionState<He1State>("he1", he1EstadoDefaults);
  const { proyecto, marcarRevisado } = useProyecto();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaModulo>("esquema");

  const deferredState = useDeferredValue(state);
  const edificio = proyecto.edificio;
  const dg = proyecto.datosGenerales;
  const obra = useMemo(
    () => ({ provincia: dg.provincia, altitud_m: dg.altitud_m, municipio: dg.municipio }),
    [dg.provincia, dg.altitud_m, dg.municipio],
  );
  const j = useMemo(() => justificarHe1(deferredState, edificio, obra), [deferredState, edificio, obra]);
  const zonaCompleta = zonaClimaticaDe(dg.provincia, dg.altitud_m)?.zona ?? null;

  // ── Avisos y estados ───────────────────────────────────────────────────────
  const revisados = proyecto.justificaciones.he1?.revisados ?? [];
  const pendientes = avisosPendientes(j.avisos, revisados);
  const estados = estadosElementos(j.elementos, j.avisos, revisados);

  const porDefecto = j.elementos.find((e) => e.veredicto === "fail" && e.detalle.clase === "cerramiento")?.id ?? "fachada";
  const selVigente = selectedId !== null && j.elementos.some((e) => e.id === selectedId) ? selectedId : porDefecto;
  const elementoSel = j.elementos.find((e) => e.id === selVigente) ?? null;
  const rol = vistaDe(selVigente);

  const verEnDibujo = (id: string) => {
    setSelectedId(id);
    setVista("esquema");
  };

  const avisos: AvisoModulo[] = j.avisos.map((a) => {
    const t = textoAviso(a, j);
    return {
      id: a.id,
      titulo: t.titulo,
      detalle: t.detalle,
      revisado: revisados.includes(a.id),
      onVer: a.elementoId ? () => verEnDibujo(a.elementoId!) : undefined,
      onRevisar: (b: boolean) => marcarRevisado("he1", a.id, b),
    };
  });

  const incumplimientos: IncumplimientoModulo[] = j.elementos.flatMap((el) => {
    const t = textoIncumplimiento(el, j);
    if (!t) return [];
    const cambio = t.cambio;
    return [
      {
        id: el.id,
        titulo: t.titulo,
        detalle: t.detalle,
        onVer: () => verEnDibujo(el.id),
        accion: cambio
          ? {
              etiqueta: cambio.etiqueta,
              onClick: () => {
                for (const [k, v] of Object.entries(cambio.aplicar) as [keyof He1Estado, He1Estado[keyof He1Estado]][]) {
                  setField(k, v);
                }
                verEnDibujo(el.id);
              },
            }
          : undefined,
      },
    ];
  });

  const nPendientes = pendientes.length;
  const resumen: ResumenVeredicto | null = useMemo(() => {
    if (j.elementos.length === 0) return null;
    return {
      veredicto: veredictoConRevision(j.veredicto, nPendientes),
      sujeto: "Envolvente",
      metricas: metricasHe1(j),
      frase: fraseHe1(j),
    };
  }, [j, nPendientes]);

  // ── Ficha PDF ──────────────────────────────────────────────────────────────
  const tamano = tamanoDibujoHe1();
  const valid = j.elementos.length > 0;
  const generarFicha = () => {
    const base = toFichaData(j, { estado: deferredState, edificio, revisados, svg: tamano });
    return renderFicha({ ...base, proyecto: proyecto.nombre, fechaProyecto: formatearFecha(proyecto.modificado) });
  };
  const { pdfExporting, pdfPreview, handleExportPdf, handleDownloadPdf, closePdfPreview } = usePdfPreview(
    generarFicha,
    valid,
  );

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Enlace copiado al portapapeles", { autoDismiss: 2500 });
    } catch {
      showToast("No se pudo copiar el enlace", { autoDismiss: 3000 });
    }
  };

  // ── Izquierda ──────────────────────────────────────────────────────────────
  const queEntra = (
    <QueEntra
      filas={filasQueEntraHe1(j, zonaCompleta, estados)}
      seleccion={selVigente}
      onSelect={verEnDibujo}
      enlace={{ to: `/p/${proyecto.id}/edificio`, label: "Editar el edificio" }}
    />
  );
  const entradas = <DecisionesHe1 state={state} setField={setField} j={j} />;

  // ── El dibujo ──────────────────────────────────────────────────────────────
  const geo = calcularDibujoHe1(j, rol);
  const etiquetasDibujo = geo.etiquetas.flatMap((e) => {
    const el = j.elementos.find((x) => x.id === e.elementoId);
    if (!el) return [];
    return [
      { key: e.key, elementoId: e.elementoId, x: e.x, y: e.y, texto: textoEtiqueta(el), estado: estados[el.id] ?? "ok", nombre: el.nombre },
    ];
  });
  const tituloDibujo =
    rol === "fachada"
      ? "Sección de la fachada · a escala"
      : rol === "cubierta"
        ? "Sección de la cubierta"
        : rol === "suelo"
          ? `Sección del ${nombreSuelo(j.propuesta.envolvente.suelo.tipo).toLowerCase()}`
          : "Alzado de la ventana tipo";
  const lienzo = (
    <LienzoAjustado anchoMin={560}>
      {(caja) => {
        const { width, height } = ajustar(geo.ancho, geo.alto, caja, { max: 900 });
        return (
          <DibujoConEtiquetas
            ancho={width}
            alto={height}
            viewW={geo.ancho}
            viewH={geo.alto}
            seleccion={selVigente}
            onSelect={setSelectedId}
            etiquetas={etiquetasDibujo}
            svg={
              <DibujoHe1
                geo={geo}
                mode="screen"
                width={width}
                height={height}
                titulo={`Envolvente (DB-HE1): ${tituloDibujo.toLowerCase()}`}
                descripcion={describirDibujoHe1(j, rol)}
                seleccion={selVigente}
                estados={estados}
                onSelect={setSelectedId}
              />
            }
          />
        );
      }}
    </LienzoAjustado>
  );

  const cabeceraDibujo = <span className="text-text-disabled text-[11.5px]">{PISTA[rol]}</span>;

  const franja = elementoSel ? (
    <FranjaDetalle detalle={franjaDe(elementoSel, j, estados[elementoSel.id] ?? "ok")} />
  ) : (
    <FranjaDetalle seleccion={null} pista="Pulsa un elemento del dibujo o de la lista." />
  );

  // ── Comprobaciones ─────────────────────────────────────────────────────────
  const filasLista = j.elementos.map((el) => ({
    id: el.id,
    nombre: el.nombre,
    resultado: resultadoLista(el),
    estado: estados[el.id] ?? "ok",
  }));
  const comprobaciones = <ListaComprobaciones filas={filasLista} seleccion={selVigente} onSelect={setSelectedId} />;

  const memoria = useMemo(() => memoriaHe1(j), [j]);

  return (
    <ModuleLayout
      justificacionKey="he1"
      resultado={resumen}
      herencia={herencia}
      acciones={{ onExportPdf: handleExportPdf, pdfExporting, onShare: handleShare, onReset: reset }}
      avisos={avisos}
      incumplimientos={incumplimientos}
      queEntra={queEntra}
      entradas={entradas}
      comprobacionesConColumna
      totalComprobaciones={j.elementos.length}
      vista={vista}
      onVista={setVista}
      dibujo={{ titulo: tituloDibujo, cabecera: cabeceraDibujo, lienzo, franja }}
      comprobaciones={comprobaciones}
      memoria={{
        texto: memoria,
        textoPlano: textoPlanoMemoria(memoria),
        onFichaPdf: valid ? handleExportPdf : undefined,
      }}
    >
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div id={HE1_PDF_SVG_ID} style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <DibujoPdfHe1 j={j} revisados={revisados} width={560} height={Math.round((560 * tamano.nativeH) / tamano.nativeW)} />
        </div>
      </div>

      {pdfPreview && (
        <PdfPreviewModal
          blobUrl={pdfPreview.blobUrl}
          filename={pdfPreview.filename}
          pageCount={pdfPreview.pageCount}
          onDownload={handleDownloadPdf}
          onClose={closePdfPreview}
        />
      )}
    </ModuleLayout>
  );
}

function formatearFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(d);
}
