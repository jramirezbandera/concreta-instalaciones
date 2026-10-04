// DB-HS1 — Pantalla del módulo de protección frente a la humedad (feature-17,
// patrón v4). La envolvente sale de El edificio y el clima y el terreno, de los
// datos de la obra: a la izquierda «Qué entra» y las decisiones (muro, suelo,
// fachada, cubierta); a la derecha la sección con el grado y las condiciones
// como etiquetas pulsables y la franja debajo; Comprobaciones es la lista y
// Memoria, el texto.
//
// React 19 + React Compiler: componente PURO. El cálculo es síncrono en render
// (useMemo sobre el estado diferido); no hay efectos de cálculo.

import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router";
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
import { avisosPendientes, estadosElementos, veredictoConRevision } from "../../lib/cte/estados";
import { textoPlanoMemoria } from "../../lib/cte/memoria";
import { renderFicha } from "../../lib/pdf/renderFicha";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { ajustar } from "../../lib/ui/ajustar";
import { DecisionesHs1 } from "./DecisionesHs1";
import { filasQueEntraHs1 } from "./entra";
import { hs1EstadoDefaults, type Hs1Estado } from "./estado";
import { toFichaData } from "./ficha";
import { justificarHs1, obraHs1De } from "./justificacion";
import { memoriaHs1 } from "./memoria";
import { calcularSeccionHs1, tamanoDibujoHs1 } from "./seccion";
import { DibujoPdfHs1, SeccionHs1 } from "./SeccionHs1";
import { HS1_PDF_SVG_ID } from "./svg-meta";
import {
  AVISOS_A_DATOS_OBRA,
  describirSeccionHs1,
  franjaDe,
  fraseHs1,
  metricasHs1,
  resultadoLista,
  textoAviso,
  textoEtiqueta,
  textoIncumplimiento,
} from "./textos";

type Hs1State = { [K in keyof Hs1Estado]: Hs1Estado[K] };

export function Hs1Module() {
  const { state, setField, reset, herencia } = useJustificacionState<Hs1State>("hs1", hs1EstadoDefaults);
  const { proyecto, marcarRevisado } = useProyecto();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaModulo>("esquema");

  const deferredState = useDeferredValue(state);
  const edificio = proyecto.edificio;
  const dg = proyecto.datosGenerales;
  const obra = useMemo(() => obraHs1De(dg), [dg]);
  const j = useMemo(() => justificarHs1(deferredState, edificio, obra), [deferredState, edificio, obra]);

  // ── Avisos y estados ───────────────────────────────────────────────────────
  const revisados = proyecto.justificaciones.hs1?.revisados ?? [];
  const pendientes = avisosPendientes(j.avisos, revisados);
  const estados = estadosElementos(j.elementos, j.avisos, revisados);

  const porDefecto = j.elementos.find((e) => e.veredicto === "fail")?.id ?? "fachada";
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
      onRevisar: (b: boolean) => marcarRevisado("hs1", a.id, b),
      accion: AVISOS_A_DATOS_OBRA.has(a.id) ? (
        <Link
          to={`/p/${proyecto.id}/datos`}
          className="border-border-main bg-bg-primary text-accent hover:text-accent-hover inline-flex h-7 items-center rounded border px-2.5 text-[12px]"
        >
          Indicarlo en Datos de la obra
        </Link>
      ) : undefined,
    };
  });

  // Lo que no cumple, con el cambio que lo arregla.
  const incumplimientos: IncumplimientoModulo[] = j.elementos.flatMap((el) => {
    const t = textoIncumplimiento(el);
    if (!t) return [];
    const det = el.detalle;
    let accion: IncumplimientoModulo["accion"];
    if (det.clase === "muro" && det.arreglo) {
      const a = det.arreglo;
      accion = {
        etiqueta: "Aplicar el cambio",
        onClick: () => {
          setField("muroTipo", a.tipo === j.habituales.muroTipo ? "habitual" : a.tipo);
          setField("muroImper", a.imper === j.habituales.muroImper ? "habitual" : a.imper);
        },
      };
    } else if (det.clase === "suelo" && det.arreglo) {
      const a = det.arreglo;
      accion = {
        etiqueta: "Aplicar el cambio",
        onClick: () => {
          setField("sueloTipo", a.tipo === j.habituales.sueloTipo ? "habitual" : a.tipo);
          setField("sueloIntervencion", a.intervencion === j.habituales.sueloIntervencion ? "habitual" : a.intervencion);
        },
      };
    }
    return [{ id: el.id, titulo: t.titulo, detalle: t.detalle, onVer: () => verEnDibujo(el.id), accion }];
  });

  const nPendientes = pendientes.length;
  const resumen: ResumenVeredicto | null = useMemo(
    () => ({
      veredicto: veredictoConRevision(j.veredicto, nPendientes),
      sujeto: "Protección frente a la humedad",
      metricas: metricasHs1(j),
      frase: fraseHs1(j),
    }),
    [j, nPendientes],
  );

  // ── Ficha PDF ──────────────────────────────────────────────────────────────
  const tamano = tamanoDibujoHs1(j, edificio);
  const generarFicha = () => {
    const base = toFichaData(j, { estado: deferredState, edificio, revisados, svg: tamano });
    return renderFicha({ ...base, proyecto: proyecto.nombre, fechaProyecto: formatearFecha(proyecto.modificado) });
  };
  const { pdfExporting, pdfPreview, handleExportPdf, handleDownloadPdf, closePdfPreview } = usePdfPreview(generarFicha, true);

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
      filas={filasQueEntraHs1(j, estados)}
      seleccion={selVigente}
      onSelect={verEnDibujo}
      enlace={{ to: `/p/${proyecto.id}/edificio`, label: "Editar el edificio" }}
    />
  );
  const entradas = <DecisionesHs1 state={state} setField={setField} j={j} />;

  // ── El dibujo ──────────────────────────────────────────────────────────────
  const seccion = calcularSeccionHs1(j, edificio);
  const etiquetasDibujo = seccion.etiquetas.flatMap((e) => {
    const el = j.elementos.find((x) => x.id === e.elementoId);
    if (!el) return [];
    return [{ key: e.key, elementoId: e.elementoId, x: e.x, y: e.y, texto: textoEtiqueta(el), estado: estados[el.id] ?? "ok", nombre: el.nombre }];
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
              <SeccionHs1
                seccion={seccion}
                mode="screen"
                width={width}
                height={height}
                titulo="Protección frente a la humedad (DB-HS1): sección del edificio con su envolvente"
                descripcion={describirSeccionHs1(j)}
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
      Pulsa un elemento para ver su grado y las condiciones que pide el DB. La línea discontinua es el nivel freático.
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

  const memoria = useMemo(() => memoriaHs1(j), [j]);

  return (
    <ModuleLayout
      justificacionKey="hs1"
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
      dibujo={{ titulo: "La envolvente", cabecera: cabeceraDibujo, lienzo, franja }}
      comprobaciones={comprobaciones}
      memoria={{ texto: memoria, textoPlano: textoPlanoMemoria(memoria), onFichaPdf: handleExportPdf }}
    >
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div id={HS1_PDF_SVG_ID} style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <DibujoPdfHs1
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
