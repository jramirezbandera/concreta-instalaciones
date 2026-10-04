// DB-HS3 — Pantalla del módulo de calidad del aire interior (feature-15, al
// patrón de HS5). La ventilación se deduce de El edificio: a la izquierda «Qué
// entra» y las decisiones; a la derecha el dibujo de una PARTE —cada vivienda
// tipo o el garaje con los trasteros— con las cifras como etiquetas pulsables y
// la franja debajo; Comprobaciones es la lista de la parte y Memoria, el texto.
//
// React 19 + React Compiler: componente PURO. El cálculo es síncrono en render
// (useMemo sobre el estado diferido); no hay efectos de cálculo.

import { useDeferredValue, useMemo, useState } from "react";
import { useJustificacionState } from "../../hooks/useJustificacionState";
import { usePdfPreview } from "../../hooks/usePdfPreview";
import {
  ModuleLayout,
  type AvisoModulo,
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
import { avisosPendientes, estadosElementos, veredictoConRevision } from "../../lib/cte/estados";
import { textoPlanoMemoria } from "../../lib/cte/memoria";
import { renderFicha } from "../../lib/pdf/renderFicha";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { ajustar } from "../../lib/ui/ajustar";
import { DecisionesHs3 } from "./DecisionesHs3";
import { filasQueEntraHs3 } from "./entra";
import { hs3EstadoDefaults, type Hs3Estado } from "./estado";
import { toFichaData } from "./ficha";
import { justificarHs3 } from "./justificacion";
import { memoriaHs3 } from "./memoria";
import { calcularDibujoHs3, parteDe, tamanoDibujoHs3 } from "./planta";
import { DibujoPdfHs3, PlantaHs3 } from "./PlantaHs3";
import { HS3_PDF_SVG_ID } from "./svg-meta";
import {
  describirDibujoHs3,
  franjaDe,
  fraseHs3,
  metricasHs3,
  resultadoLista,
  textoAviso,
  textoEtiqueta,
} from "./textos";

type Hs3State = { [K in keyof Hs3Estado]: Hs3Estado[K] };

export function Hs3Module() {
  const { state, setField, reset, herencia } = useJustificacionState<Hs3State>("hs3", hs3EstadoDefaults);
  const { proyecto, marcarRevisado } = useProyecto();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [parteElegida, setParteElegida] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaModulo>("esquema");

  const deferredState = useDeferredValue(state);
  const edificio = proyecto.edificio;
  const j = useMemo(() => justificarHs3(deferredState, edificio), [deferredState, edificio]);

  // ── Avisos y estados ───────────────────────────────────────────────────────
  const revisados = proyecto.justificaciones.hs3?.revisados ?? [];
  const pendientes = avisosPendientes(j.avisos, revisados);
  const estados = estadosElementos(j.elementos, j.avisos, revisados);

  // La parte vigente: la elegida si existe; si no, la primera.
  const parte =
    parteElegida !== null && j.partes.some((p) => p.id === parteElegida) ? parteElegida : (j.partes[0]?.id ?? null);
  const elementosParte = j.elementos.filter((e) => e.parte === parte);
  const porDefecto =
    elementosParte.find((e) => e.detalle.clase === "local" && e.detalle.local.id === "salon")?.id ??
    elementosParte[0]?.id ??
    null;
  const selVigente =
    selectedId !== null && elementosParte.some((e) => e.id === selectedId) ? selectedId : porDefecto;
  const elementoSel = j.elementos.find((e) => e.id === selVigente) ?? null;

  const seleccionar = (id: string) => {
    const p = parteDe(j, id);
    if (p) setParteElegida(p);
    setSelectedId(id);
  };
  const verEnDibujo = (id: string) => {
    seleccionar(id);
    setVista("esquema");
  };
  const verParte = (p: string) => {
    setParteElegida(p);
    setSelectedId(null);
  };

  const avisos: AvisoModulo[] = j.avisos.map((a) => {
    const t = textoAviso(a);
    return {
      id: a.id,
      titulo: t.titulo,
      detalle: t.detalle,
      revisado: revisados.includes(a.id),
      onVer: a.elementoId ? () => verEnDibujo(a.elementoId!) : undefined,
      onRevisar: (b: boolean) => marcarRevisado("hs3", a.id, b),
    };
  });

  const nPendientes = pendientes.length;
  const resumen: ResumenVeredicto | null = useMemo(() => {
    if (j.elementos.length === 0) return null;
    return {
      veredicto: veredictoConRevision(j.veredicto, nPendientes),
      sujeto: "Ventilación",
      metricas: metricasHs3(j),
      frase: fraseHs3(j),
    };
  }, [j, nPendientes]);

  // ── Ficha PDF ──────────────────────────────────────────────────────────────
  const tamano = tamanoDibujoHs3();
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
  const filas = filasQueEntraHs3(j, edificio, estados);
  const queEntra = (
    <QueEntra
      filas={filas}
      seleccion={selVigente}
      onSelect={verEnDibujo}
      enlace={{ to: `/p/${proyecto.id}/edificio`, label: "Editar el edificio" }}
    />
  );
  const entradas = <DecisionesHs3 state={state} setField={setField} j={j} edificio={edificio} />;

  // ── El dibujo ──────────────────────────────────────────────────────────────
  const dibujo = parte ? calcularDibujoHs3(j, parte) : null;
  const etiquetasDibujo = (dibujo?.etiquetas ?? []).flatMap((e) => {
    const el = j.elementos.find((x) => x.id === e.elementoId);
    if (!el) return [];
    return [
      { key: e.key, elementoId: e.elementoId, x: e.x, y: e.y, texto: textoEtiqueta(el), estado: estados[el.id] ?? "ok", nombre: el.nombre },
    ];
  });
  const nombreParte = j.partes.find((p) => p.id === parte)?.nombre ?? "";
  const lienzo = (
    <LienzoAjustado anchoMin={560}>
      {(caja) => {
        if (!dibujo) return null;
        const { width, height } = ajustar(dibujo.ancho, dibujo.alto, caja, { max: 900 });
        return (
          <DibujoConEtiquetas
            ancho={width}
            alto={height}
            viewW={dibujo.ancho}
            viewH={dibujo.alto}
            seleccion={selVigente}
            onSelect={seleccionar}
            etiquetas={etiquetasDibujo}
            svg={
              <PlantaHs3
                dibujo={dibujo}
                mode="screen"
                width={width}
                height={height}
                titulo={`Ventilación (DB-HS3): ${nombreParte}`}
                descripcion={describirDibujoHs3(j, parte ?? "")}
                seleccion={selVigente}
                estados={estados}
                onSelect={seleccionar}
              />
            }
          />
        );
      }}
    </LienzoAjustado>
  );

  const cabeceraDibujo = (
    <>
      {j.partes.length > 1 && (
        <div role="group" aria-label="Parte del edificio" className="border-border-main bg-bg-surface flex gap-0.5 rounded border p-0.5">
          {j.partes.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p.id === parte}
              onClick={() => verParte(p.id)}
              className={[
                "h-7 rounded-[3px] px-2.5 text-[12.5px] whitespace-nowrap",
                p.id === parte
                  ? "bg-bg-primary text-text-primary ring-border-main font-medium ring-1"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {p.nombre}
            </button>
          ))}
        </div>
      )}
      <span className="text-text-disabled text-[11.5px]">
        Pulsa un caudal para ver de dónde sale. Las flechas siguen el camino del aire.
      </span>
    </>
  );

  const franja = elementoSel ? (
    <FranjaDetalle detalle={franjaDe(elementoSel, j, estados[elementoSel.id] ?? "ok")} />
  ) : (
    <FranjaDetalle seleccion={null} pista="Pulsa un elemento del dibujo o de la lista." />
  );

  // ── Comprobaciones: la lista de la parte ───────────────────────────────────
  const filasLista = elementosParte.map((el) => ({
    id: el.id,
    nombre: el.nombre,
    resultado: resultadoLista(el),
    estado: estados[el.id] ?? "ok",
  }));
  const comprobaciones = (
    <div className="flex flex-col gap-3">
      {j.partes.length > 1 && (
        <div role="group" aria-label="Parte de la lista" className="flex flex-wrap gap-1.5">
          {j.partes.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p.id === parte}
              onClick={() => verParte(p.id)}
              className={[
                "h-7 rounded border px-2.5 text-[12px]",
                p.id === parte ? "border-accent/50 bg-tint-accent text-accent font-medium" : "border-border-main text-text-secondary",
              ].join(" ")}
            >
              {p.nombre}
            </button>
          ))}
        </div>
      )}
      <ListaComprobaciones filas={filasLista} seleccion={selVigente} onSelect={seleccionar} />
    </div>
  );

  const memoria = useMemo(() => memoriaHs3(j), [j]);

  return (
    <ModuleLayout
      justificacionKey="hs3"
      resultado={resumen}
      herencia={herencia}
      acciones={{ onExportPdf: handleExportPdf, pdfExporting, onShare: handleShare, onReset: reset }}
      avisos={avisos}
      queEntra={queEntra}
      entradas={entradas}
      comprobacionesConColumna
      totalComprobaciones={j.elementos.length}
      vista={vista}
      onVista={setVista}
      dibujo={{ titulo: "Camino del aire", cabecera: cabeceraDibujo, lienzo, franja }}
      comprobaciones={comprobaciones}
      memoria={{ texto: memoria, textoPlano: textoPlanoMemoria(memoria), onFichaPdf: valid ? handleExportPdf : undefined }}
    >
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div id={HS3_PDF_SVG_ID} style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <DibujoPdfHs3
            j={j}
            parte={j.partes[0]?.id ?? null}
            revisados={revisados}
            width={560}
            height={Math.round((560 * tamano.nativeH) / tamano.nativeW)}
          />
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
