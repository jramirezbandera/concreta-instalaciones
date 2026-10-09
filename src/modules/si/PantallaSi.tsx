// DB-SI — La pantalla común de las seis secciones (feature-19, patrón v4). Lo
// que cambia de una sección a otra viene en su `DefinicionSi` (justificar,
// redactar, dibujar) y en su componente de decisiones: a la izquierda «Qué
// entra» y las decisiones; a la derecha la sección del edificio con las cifras
// como etiquetas pulsables y la franja debajo; Comprobaciones es la lista y
// Memoria, el texto.
//
// React 19 + React Compiler: componente PURO. El cálculo es síncrono en render
// (useMemo sobre el estado diferido); no hay efectos de cálculo.

import { useDeferredValue, useMemo, useState, type ComponentType, type JSX } from "react";
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
import type { Edificio } from "../../lib/edificio/tipos";
import { renderFicha } from "../../lib/pdf/renderFicha";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { edificioParaModulo } from "../../lib/proyecto/alcance";
import { formatearFecha } from "../../lib/ui/fecha";
import { ajustar } from "../../lib/ui/ajustar";
import type { DefinicionSi } from "./definicion";
import { DibujoPdfSi } from "./DibujoPdfSi";
import { SeccionSi } from "./SeccionSi";
import type { JustificacionSiBase } from "./tipos";

/** Lo que recibe el componente de decisiones de cada sección. */
export interface PropsDecisionesSi<E, J> {
  state: E;
  setField: <K extends keyof E>(field: K, value: E[K]) => void;
  j: J;
  edificio: Edificio;
  /** Cambia El edificio (los datos del DB-SI que viven en sus zonas). */
  cambiarEdificio: (e: Edificio) => void;
}

const BOTON_ENLACE =
  "border-border-main bg-bg-primary text-accent hover:text-accent-hover inline-flex h-7 items-center rounded border px-2.5 text-[12px]";

export function PantallaSi<E extends Record<string, unknown>, J extends JustificacionSiBase>({
  def,
  Decisiones,
}: {
  def: DefinicionSi<E, J>;
  Decisiones: ComponentType<PropsDecisionesSi<E, J>>;
}): JSX.Element {
  const { state, setField, reset, herencia } = useJustificacionState<E>(def.key, def.defaults);
  const { proyecto, marcarRevisado, actualizarEdificio } = useProyecto();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaModulo>("esquema");

  const deferredState = useDeferredValue(state);
  const dg = proyecto.datosGenerales;
  // En una obra existente, el módulo calcula lo intervenido (feature-27); lo que
  // se edita y se guarda sigue siendo El edificio entero.
  const edificioCompleto = proyecto.edificio;
  const edificio = edificioParaModulo(dg, edificioCompleto, def.key);
  const justificaciones = proyecto.justificaciones;
  const j = useMemo(
    () => def.justificar(deferredState, { edificio, datosGenerales: dg, justificaciones }),
    [def, deferredState, edificio, dg, justificaciones],
  );

  // ── Avisos y estados ───────────────────────────────────────────────────────
  const revisados = proyecto.justificaciones[def.key]?.revisados ?? [];
  const pendientes = avisosPendientes(j.avisos, revisados);
  const estados = estadosElementos(j.elementos, j.avisos, revisados);

  const porDefecto = def.seleccionInicial(j) ?? j.elementos[0]?.id ?? null;
  const selVigente = selectedId !== null && j.elementos.some((e) => e.id === selectedId) ? selectedId : porDefecto;
  const elementoSel = j.elementos.find((e) => e.id === selVigente) ?? null;

  const verEnDibujo = (id: string) => {
    setSelectedId(id);
    setVista("esquema");
  };

  const avisos: AvisoModulo[] = j.avisos.map((a) => {
    const t = def.textoAviso(a);
    const aDatos = def.avisosADatos?.has(a.id) ?? false;
    const aEdificio = def.avisosAEdificio?.has(a.id) ?? false;
    return {
      id: a.id,
      titulo: t.titulo,
      detalle: t.detalle,
      revisado: revisados.includes(a.id),
      onVer: a.elementoId ? () => verEnDibujo(a.elementoId!) : undefined,
      onRevisar: (b: boolean) => marcarRevisado(def.key, a.id, b),
      accion: aDatos ? (
        <Link to={`/p/${proyecto.id}/datos`} className={BOTON_ENLACE}>
          Indicarlo en Datos de la obra
        </Link>
      ) : aEdificio ? (
        <Link to={`/p/${proyecto.id}/edificio`} className={BOTON_ENLACE}>
          Revisarlo en El edificio
        </Link>
      ) : undefined,
    };
  });

  const cambiarEdificio = (e: Edificio) => actualizarEdificio(e, new Date().toISOString());

  // Lo que no cumple, con el cambio que lo arregla.
  const incumplimientos: IncumplimientoModulo[] = j.elementos.flatMap((el) => {
    const t = def.textoIncumplimiento(el);
    if (!t) return [];
    const a = def.arreglo?.(el, j) ?? null;
    return [
      {
        id: el.id,
        titulo: t.titulo,
        detalle: t.detalle,
        onVer: () => verEnDibujo(el.id),
        accion: a
          ? {
              etiqueta: a.etiqueta,
              onClick: () => {
                for (const k of Object.keys(a.cambios) as (keyof E)[]) setField(k, a.cambios[k] as E[keyof E]);
                if (a.edificio) cambiarEdificio(a.edificio(edificioCompleto));
              },
            }
          : undefined,
      },
    ];
  });

  const nPendientes = pendientes.length;
  const resumen: ResumenVeredicto = {
    veredicto: veredictoConRevision(j.veredicto, nPendientes),
    sujeto: def.sujeto,
    metricas: def.metricas(j),
    frase: def.frase(j),
  };

  // ── Ficha PDF ──────────────────────────────────────────────────────────────
  const dibujo = def.dibujo(j, edificio);
  const tamano = { nativeW: dibujo.ancho, nativeH: dibujo.alto };
  const generarFicha = () => {
    const base = def.ficha(j, { estado: deferredState, edificio, revisados, svg: tamano });
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
      filas={def.queEntra(j, estados)}
      seleccion={selVigente}
      onSelect={verEnDibujo}
      enlace={{ to: `/p/${proyecto.id}/edificio`, label: "Editar el edificio" }}
    />
  );
  const entradas = <Decisiones state={state} setField={setField} j={j} edificio={edificioCompleto} cambiarEdificio={cambiarEdificio} />;

  // ── El dibujo ──────────────────────────────────────────────────────────────
  const etiquetasDibujo = dibujo.etiquetas.flatMap((e) => {
    const el = j.elementos.find((x) => x.id === e.elementoId);
    if (!el) return [];
    return [{ key: e.key, elementoId: e.elementoId, x: e.x, y: e.y, texto: def.etiqueta(el), estado: estados[el.id] ?? "ok", nombre: el.nombre }];
  });
  const lienzo = (
    <LienzoAjustado anchoMin={560}>
      {(caja) => {
        const { width, height } = ajustar(dibujo.ancho, dibujo.alto, caja, { max: 900 });
        return (
          <DibujoConEtiquetas
            ancho={width}
            alto={height}
            viewW={dibujo.ancho}
            viewH={dibujo.alto}
            seleccion={selVigente}
            onSelect={setSelectedId}
            etiquetas={etiquetasDibujo}
            svg={
              <SeccionSi
                dibujo={dibujo}
                mode="screen"
                width={width}
                height={height}
                titulo={`${def.sujeto} (${def.db ?? "DB-SI"}): ${def.tituloDibujo.toLowerCase()}`}
                descripcion={def.describirDibujo(j)}
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

  const cabeceraDibujo = <span className="text-text-disabled text-[11.5px]">{def.pistaDibujo}</span>;

  const franja = elementoSel ? (
    <FranjaDetalle detalle={def.franja(elementoSel, j, estados[elementoSel.id] ?? "ok")} />
  ) : (
    <FranjaDetalle seleccion={null} pista="Pulsa un elemento del dibujo o de la lista." />
  );

  // ── Comprobaciones ─────────────────────────────────────────────────────────
  const filasLista = j.elementos.map((el) => ({
    id: el.id,
    nombre: el.nombre,
    resultado: def.resultadoLista(el),
    estado: estados[el.id] ?? "ok",
  }));
  const comprobaciones = <ListaComprobaciones filas={filasLista} seleccion={selVigente} onSelect={setSelectedId} />;

  const memoria = useMemo(() => def.memoria(j), [def, j]);

  return (
    <ModuleLayout
      justificacionKey={def.key}
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
      dibujo={{ titulo: def.tituloDibujo, cabecera: cabeceraDibujo, lienzo, franja }}
      comprobaciones={comprobaciones}
      memoria={{ texto: memoria, textoPlano: textoPlanoMemoria(memoria), onFichaPdf: handleExportPdf }}
    >
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div id={def.pdfSvgId} style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <DibujoPdfSi def={def} j={j} edificio={edificio} revisados={revisados} width={560} height={Math.round((560 * dibujo.alto) / dibujo.ancho)} />
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
