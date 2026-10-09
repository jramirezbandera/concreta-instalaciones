// DB-HS6 — Pantalla del módulo de protección frente al radón (feature-15, al
// patrón de HS5). La protección se deduce de El edificio: a la izquierda «Qué
// entra» y las decisiones; a la derecha la sección por lo que toca el terreno,
// con las medidas como etiquetas pulsables y la franja debajo; Comprobaciones es
// la lista y Memoria, el texto.
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
import { fichaConAlcance } from "../../lib/obra/alcanceTexto";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { edificioParaModulo } from "../../lib/proyecto/alcance";
import { ajustar } from "../../lib/ui/ajustar";
import { DecisionesHs6 } from "./DecisionesHs6";
import { filasQueEntraHs6 } from "./entra";
import { hs6EstadoDefaults, type Hs6Estado } from "./estado";
import { toFichaData } from "./ficha";
import { justificarHs6 } from "./justificacion";
import { memoriaHs6 } from "./memoria";
import { calcularSeccionHs6, tamanoDibujoHs6, zonasPbDe } from "./seccion";
import { DibujoPdfHs6, SeccionHs6 } from "./SeccionHs6";
import { HS6_PDF_SVG_ID } from "./svg-meta";
import {
  describirSeccionHs6,
  franjaDe,
  fraseHs6,
  metricasHs6,
  resultadoLista,
  textoAviso,
  textoEtiqueta,
} from "./textos";

type Hs6State = { [K in keyof Hs6Estado]: Hs6Estado[K] };

export function Hs6Module() {
  const { state, setField, reset, herencia } = useJustificacionState<Hs6State>("hs6", hs6EstadoDefaults);
  const { proyecto, marcarRevisado } = useProyecto();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaModulo>("esquema");

  const deferredState = useDeferredValue(state);
  // En una obra existente, lo intervenido (feature-27).
  const edificio = edificioParaModulo(proyecto.datosGenerales, proyecto.edificio, "hs6");
  const j = useMemo(() => justificarHs6(deferredState, edificio), [deferredState, edificio]);

  // ── Avisos y estados ───────────────────────────────────────────────────────
  const revisados = proyecto.justificaciones.hs6?.revisados ?? [];
  const pendientes = avisosPendientes(j.avisos, revisados);
  const estados = estadosElementos(j.elementos, j.avisos, revisados);

  const porDefecto = j.elementos.find((e) => e.id === "barrera")?.id ?? j.elementos[0]?.id ?? null;
  const selVigente = selectedId !== null && j.elementos.some((e) => e.id === selectedId) ? selectedId : porDefecto;
  const elementoSel = j.elementos.find((e) => e.id === selVigente) ?? null;

  const verEnDibujo = (id: string) => {
    setSelectedId(id);
    setVista("esquema");
  };

  const avisos: AvisoModulo[] = j.avisos.map((a) => {
    const t = textoAviso(a);
    return {
      id: a.id,
      titulo: t.titulo,
      detalle: t.detalle,
      revisado: revisados.includes(a.id),
      onVer: a.elementoId ? () => verEnDibujo(a.elementoId!) : undefined,
      onRevisar: (b: boolean) => marcarRevisado("hs6", a.id, b),
    };
  });

  const nPendientes = pendientes.length;
  const resumen: ResumenVeredicto | null = useMemo(() => {
    if (j.elementos.length === 0) return null;
    return {
      veredicto: veredictoConRevision(j.veredicto, nPendientes),
      sujeto: "Protección frente al radón",
      metricas: metricasHs6(j),
      frase: fraseHs6(j),
    };
  }, [j, nPendientes]);

  // ── Ficha PDF ──────────────────────────────────────────────────────────────
  const tamano = tamanoDibujoHs6();
  const valid = j.elementos.length > 0;
  const generarFicha = () => {
    const base = toFichaData(j, { estado: deferredState, edificio, revisados, svg: tamano });
    return renderFicha({ ...fichaConAlcance(base, proyecto, "hs6"), proyecto: proyecto.nombre, fechaProyecto: formatearFecha(proyecto.modificado) });
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
      filas={filasQueEntraHs6(j, estados)}
      seleccion={selVigente}
      onSelect={verEnDibujo}
      enlace={{ to: `/p/${proyecto.id}/edificio`, label: "Editar el edificio" }}
    />
  );
  const entradas = <DecisionesHs6 state={state} setField={setField} j={j} />;

  // ── El dibujo ──────────────────────────────────────────────────────────────
  const seccion = calcularSeccionHs6(j, zonasPbDe(edificio));
  const etiquetasDibujo = seccion.etiquetas.flatMap((e) => {
    const el = j.elementos.find((x) => x.id === e.elementoId);
    if (!el) return [];
    return [
      { key: e.key, elementoId: e.elementoId, x: e.x, y: e.y, texto: textoEtiqueta(el), estado: estados[el.id] ?? "ok", nombre: el.nombre },
    ];
  });
  const lienzo = (
    <LienzoAjustado anchoMin={560}>
      {(caja) => {
        const { width, height } = ajustar(seccion.ancho, seccion.alto, caja, { max: 900 });
        return (
          <DibujoConEtiquetas
            ancho={width}
            alto={height}
            viewW={seccion.ancho}
            viewH={seccion.alto}
            seleccion={selVigente}
            onSelect={setSelectedId}
            etiquetas={etiquetasDibujo}
            svg={
              <SeccionHs6
                seccion={seccion}
                mode="screen"
                width={width}
                height={height}
                titulo="Protección frente al radón (DB-HS6): sección por lo que toca el terreno"
                descripcion={describirSeccionHs6(j)}
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

  const cabeceraDibujo = (
    <span className="text-text-disabled text-[11.5px]">
      Pulsa una medida para ver qué pide el DB. Las flechas son el radón que sube del terreno.
    </span>
  );

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

  const memoria = useMemo(() => memoriaHs6(j), [j]);

  return (
    <ModuleLayout
      justificacionKey="hs6"
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
      dibujo={{ titulo: "Lo que toca el terreno", cabecera: cabeceraDibujo, lienzo, franja }}
      comprobaciones={comprobaciones}
      memoria={{ texto: memoria, textoPlano: textoPlanoMemoria(memoria), onFichaPdf: valid ? handleExportPdf : undefined }}
    >
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div id={HS6_PDF_SVG_ID} style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <DibujoPdfHs6
            j={j}
            edificio={edificio}
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
