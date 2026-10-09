// DB-HS4 — Pantalla del módulo de suministro de agua (feature-15, al patrón de
// HS5). La red se deduce de El edificio: a la izquierda «Qué entra» y las
// decisiones (la presión de la red es un dato de la obra que se edita aquí); a
// la derecha la sección con la batería y los montantes y la presión que llega a
// cada planta, con las cifras como etiquetas pulsables y la franja debajo; lo
// que no cumple y los avisos, a lo ancho; Comprobaciones es la lista de
// elementos y Memoria, el texto redactado.
//
// «Ajustar a mano» (decisión 1 de REDISENO-V4 §7) copia la red generada a la
// tabla de tramos (`RedManualHs4`); desde ahí manda la tabla, el dibujo pasa al
// esquema de columna y la izquierda ofrece volver a generarla.
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
import { avisosPendientes, estadosElementos, veredictoConRevision } from "../../lib/cte/estados";
import { textoPlanoMemoria } from "../../lib/cte/memoria";
import { renderFicha } from "../../lib/pdf/renderFicha";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { edificioParaModulo } from "../../lib/proyecto/alcance";
import { ajustar } from "../../lib/ui/ajustar";
import { fmt } from "../../lib/units/format";
import { DecisionesHs4 } from "./DecisionesHs4";
import { filasQueEntraHs4 } from "./entra";
import { hs4EstadoDefaults, type Hs4Estado } from "./estado";
import { toFichaData } from "./ficha";
import { justificarHs4, type ObraHs4 } from "./justificacion";
import { memoriaHs4 } from "./memoria";
import { RedManualHs4 } from "./RedManual";
import { calcularSeccionHs4, tamanoDibujoHs4 } from "./seccion";
import { DibujoPdfHs4, SeccionHs4 } from "./SeccionHs4";
import { HS4SVG } from "./svg";
import { HS4_PDF_SVG_ID } from "./svg-meta";
import {
  describirSeccionHs4,
  franjaDe,
  fraseHs4,
  metricasHs4,
  resultadoLista,
  textoAviso,
  textoEtiqueta,
  textoIncumplimiento,
} from "./textos";

/** Alias mapeado de Hs4Estado (interface → Record) para useJustificacionState. */
type Hs4State = { [K in keyof Hs4Estado]: Hs4Estado[K] };

const ESTADO_TEXTO: Record<string, string> = {
  ok: "Cumple",
  warn: "Aviso",
  fail: "No cumple",
  neutral: "Informativo",
};

export function Hs4Module() {
  const { state, setField, reset, herencia } = useJustificacionState<Hs4State>("hs4", hs4EstadoDefaults);
  const { proyecto, marcarRevisado, actualizarDatosGenerales } = useProyecto();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaModulo>("esquema");
  const [confirmarManual, setConfirmarManual] = useState(false);
  const [confirmarEdificio, setConfirmarEdificio] = useState(false);

  const deferredState = useDeferredValue(state);
  // En una obra existente, lo intervenido (feature-27).
  const edificio = edificioParaModulo(proyecto.datosGenerales, proyecto.edificio, "hs4");
  const presionAcometida_kPa = proyecto.datosGenerales.presionAcometida_kPa;
  const obra: ObraHs4 = useMemo(() => ({ presionAcometida_kPa }), [presionAcometida_kPa]);
  const j = useMemo(() => justificarHs4(deferredState, edificio, obra), [deferredState, edificio, obra]);
  const manual = j.modo === "manual";

  // ── Avisos y estados ───────────────────────────────────────────────────────
  const revisados = proyecto.justificaciones.hs4?.revisados ?? [];
  const pendientes = avisosPendientes(j.avisos, revisados);
  const estados = estadosElementos(j.elementos, j.avisos, revisados);

  const existe = (id: string) =>
    j.elementos.some((e) => e.id === id) ||
    (manual && (state.tramos.some((t) => t.id === id) || state.aparatos.some((a) => a.id === id)));
  const porDefecto =
    j.elementos.find((e) => e.detalle.clase === "planta" && e.detalle.critico)?.id ??
    j.elementos.find((e) => e.id === "punto-critico")?.id ??
    j.elementos[0]?.id ??
    null;
  const selVigente = selectedId !== null && existe(selectedId) ? selectedId : porDefecto;
  const elementoSel = j.elementos.find((e) => e.id === selVigente) ?? null;

  const verEnDibujo = (id: string) => {
    setSelectedId(id);
    setVista("esquema");
  };

  const avisos: AvisoModulo[] = j.avisos.map((a) => {
    const t = textoAviso(a, j);
    const confirma = a.id === "presion-red-supuesta";
    return {
      id: a.id,
      titulo: t.titulo,
      detalle: t.detalle,
      revisado: revisados.includes(a.id),
      onVer: a.elementoId ? () => verEnDibujo(a.elementoId!) : undefined,
      // Sin dato no hay nada que confirmar: se arregla poniendo la presión.
      onRevisar: a.id === "presion-red-sin-dato" ? undefined : (b: boolean) => marcarRevisado("hs4", a.id, b),
      etiquetaRevisar: confirma ? "Ya está confirmada" : undefined,
      textoRevisado: confirma ? "Presión de la red confirmada por la compañía." : undefined,
    };
  });

  const incumplimientos: IncumplimientoModulo[] = j.elementos.flatMap((el) => {
    if (el.veredicto !== "fail") return [];
    const t = textoIncumplimiento(el, j);
    if (!t) return [];
    return [
      {
        id: el.id,
        titulo: t.titulo,
        detalle: t.detalle,
        onVer: () => verEnDibujo(el.id),
        accion: t.accion
          ? {
              etiqueta: t.accion.etiqueta,
              onClick: () => {
                const cambio = t.accion!.cambio;
                if (cambio.grupoPresion !== undefined) setField("grupoPresion", cambio.grupoPresion);
                if (cambio.presionGrupo_kPa !== undefined) setField("presionGrupo_kPa", cambio.presionGrupo_kPa);
                setSelectedId("grupo-presion");
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
      sujeto: "Suministro de agua",
      metricas: metricasHs4(j),
      frase: fraseHs4(j),
    };
  }, [j, nPendientes]);

  // ── Ficha PDF (la misma para el botón y el anejo) ──────────────────────────
  const tamano = tamanoDibujoHs4(j, edificio);
  const valid = j.elementos.length > 0 && (j.resultado?.arbolValido ?? true);
  const generarFicha = () => {
    const base = toFichaData(j, { estado: deferredState, edificio, obra, revisados, svg: tamano });
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

  // ── La presión de la red es un dato de la obra ─────────────────────────────
  const cambiarPresion = (kPa: number) => {
    actualizarDatosGenerales({ ...proyecto.datosGenerales, presionAcometida_kPa: kPa }, new Date().toISOString());
    setSelectedId(porDefecto);
  };

  // ── Ajustar a mano / volver a El edificio (dos pulsaciones) ────────────────
  const ajustarAMano = () => {
    if (!confirmarManual) {
      setConfirmarManual(true);
      return;
    }
    setField("tramos", j.red.tramos);
    setField("aparatos", j.red.aparatos);
    setField("red", "manual");
    setConfirmarManual(false);
    setVista("comprobaciones");
    showToast("La red de agua fría se edita a mano en Comprobaciones", { autoDismiss: 3000 });
  };
  const volverAlEdificio = () => {
    if (!confirmarEdificio) {
      setConfirmarEdificio(true);
      return;
    }
    setField("red", "edificio");
    setConfirmarEdificio(false);
    setSelectedId(null);
    showToast("La red vuelve a salir de El edificio", { autoDismiss: 3000 });
  };

  // ── Izquierda: Qué entra + decisiones ──────────────────────────────────────
  const queEntra = (
    <QueEntra
      filas={filasQueEntraHs4(j, estados)}
      seleccion={selVigente}
      onSelect={verEnDibujo}
      enlace={{ to: `/p/${proyecto.id}/edificio`, label: "Editar el edificio" }}
      pie={
        manual ? (
          <div className="border-border-sub mt-3 rounded border px-3 py-2.5 text-[12px] leading-snug">
            <p className="text-text-secondary">
              <b className="text-text-primary font-medium">Red de agua fría ajustada a mano.</b> Los cambios de El
              edificio ya no le llegan.
            </p>
            <button
              type="button"
              onClick={volverAlEdificio}
              onBlur={() => setConfirmarEdificio(false)}
              className={`mt-1.5 text-[12px] ${confirmarEdificio ? "text-state-warn font-medium" : "text-accent hover:text-accent-hover"}`}
            >
              {confirmarEdificio ? "¿Descartar la tabla y volver a generarla?" : "Volver a generar desde El edificio"}
            </button>
          </div>
        ) : undefined
      }
    />
  );
  const entradas = (
    <DecisionesHs4
      state={state}
      setField={setField}
      j={j}
      onPresion={cambiarPresion}
      presionConfirmada={revisados.includes("presion-red-supuesta")}
    />
  );

  // ── El dibujo ──────────────────────────────────────────────────────────────
  const seccion = manual ? null : calcularSeccionHs4(j, edificio);
  const etiquetasDibujo = (seccion?.etiquetas ?? []).flatMap((e) => {
    const el = j.elementos.find((x) => x.id === e.elementoId);
    if (!el) return [];
    return [
      {
        key: e.key,
        elementoId: e.elementoId,
        x: e.x,
        y: e.y,
        texto: textoEtiqueta(el),
        estado: estados[el.id] ?? "ok",
        nombre: el.nombre,
      },
    ];
  });
  const lienzo = (
    <LienzoAjustado anchoMin={manual ? undefined : 560}>
      {(caja) => {
        if (manual || !seccion) {
          if (!j.resultado) return null;
          const { width, height } = ajustar(tamano.nativeW, tamano.nativeH, caja, { max: 900 });
          return (
            <HS4SVG
              result={j.resultado}
              mode="screen"
              width={width}
              height={height}
              selectedId={selVigente}
              hoverId={hoverId}
              onSelect={setSelectedId}
              etiquetas={Object.fromEntries(
                [...state.tramos, ...state.aparatos].flatMap((x) => (x.nombre ? [[x.id, x.nombre]] : [])),
              )}
            />
          );
        }
        const { width, height } = ajustar(seccion.ancho, seccion.alto, caja, { max: 920 });
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
              <SeccionHs4
                seccion={seccion}
                mode="screen"
                width={width}
                height={height}
                titulo="Sección con la batería de contadores, los montantes y la presión que llega a cada planta (DB-HS4)"
                descripcion={describirSeccionHs4(j)}
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
    <>
      <span className="text-text-disabled text-[11.5px]">
        {manual ? "Pulsa un tramo o un aparato del esquema." : "Pulsa una cifra para ver de dónde sale. Prueba a bajar la presión de la red."}
      </span>
      <span className="text-text-disabled ml-auto flex flex-wrap gap-x-3 gap-y-1 text-[11.5px]" aria-hidden="true">
        <span className="inline-flex items-center gap-1.5">
          <i className="bg-state-ok h-[7px] w-[7px] rounded-full" />
          cumple
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="bg-state-warn h-[7px] w-[7px] rounded-full" />
          por revisar
        </span>
        <span className="inline-flex items-center gap-1.5">
          <i className="bg-state-fail h-[7px] w-[7px] rounded-full" />
          no cumple
        </span>
      </span>
    </>
  );

  // ── La franja ──────────────────────────────────────────────────────────────
  let franja;
  if (elementoSel) {
    const det = franjaDe(elementoSel, j, estados[elementoSel.id] ?? "ok");
    const accion =
      elementoSel.detalle.clase === "grupo" && elementoSel.detalle.puesto ? (
        <button
          type="button"
          onClick={() => setField("grupoPresion", false)}
          className="border-border-main bg-bg-primary text-text-secondary hover:text-text-primary mt-2 h-7 rounded border px-2.5 text-[12px]"
        >
          Quitar el grupo de presión
        </button>
      ) : undefined;
    franja = <FranjaDetalle detalle={det} accion={accion} />;
  } else {
    // A mano, un tramo o aparato que no es un elemento de la lista.
    const rt = j.resultado?.porTramo.find((t) => t.id === selVigente);
    const ra = j.resultado?.porAparato.find((a) => a.id === selVigente);
    const nombre = [...state.tramos, ...state.aparatos].find((x) => x.id === selVigente)?.nombre ?? selVigente ?? "";
    const texto = rt
      ? `${nombre} — ${rt.diametro_mm != null ? `Ø${fmt(rt.diametro_mm, undefined, 0)}` : "Ø —"} · ${fmt(rt.caudalCalculo_dm3_s, "dm³/s", 2)} · ${fmt(rt.presionResidual_kPa, "kPa", 0)} · ${ESTADO_TEXTO[rt.estado]}`
      : ra
        ? `${nombre} — ${fmt(ra.caudalInstantaneo_dm3_s, "dm³/s", 2)} · llega ${fmt(ra.presionResidual_kPa, "kPa", 0)} · mín. ${fmt(ra.presionMinExigida_kPa, "kPa", 0)} · ${ESTADO_TEXTO[ra.estado]}`
        : null;
    franja = <FranjaDetalle seleccion={texto} pista="Pulsa un elemento del dibujo o de la lista." />;
  }

  // ── Comprobaciones ─────────────────────────────────────────────────────────
  const filasLista = j.elementos.map((el) => ({
    id: el.id,
    nombre: el.nombre,
    resultado: resultadoLista(el),
    estado: estados[el.id] ?? "ok",
  }));
  const pieManual = (
    <div className="border-border-sub mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded border px-3.5 py-3 text-[12.5px]">
      <p className="text-text-secondary min-w-0 flex-[1_1_320px] leading-snug">
        <b className="text-text-primary font-medium">¿La red real es distinta?</b> Ajústala tramo a tramo: longitudes,
        alturas, materiales y aparatos. La tabla parte de la red que sale de El edificio y, desde ese momento, manda ella.
      </p>
      <button
        type="button"
        onClick={ajustarAMano}
        onBlur={() => setConfirmarManual(false)}
        className={[
          "h-8 shrink-0 rounded border px-3 text-[12.5px]",
          confirmarManual
            ? "border-state-warn text-state-warn font-medium"
            : "border-border-main text-text-secondary hover:text-text-primary",
        ].join(" ")}
      >
        {confirmarManual ? "¿Pasar la red a la tabla?" : "Ajustar a mano"}
      </button>
    </div>
  );
  const comprobaciones = manual ? (
    <div className="flex flex-col gap-6">
      <RedManualHs4
        state={state}
        setField={setField}
        result={j.resultado}
        selectedId={selVigente}
        onSelect={setSelectedId}
        onHover={setHoverId}
      />
      <ListaComprobaciones filas={filasLista} seleccion={selVigente} onSelect={setSelectedId} />
    </div>
  ) : (
    <ListaComprobaciones
      filas={filasLista}
      seleccion={selVigente}
      onSelect={setSelectedId}
      pie={j.resultado ? pieManual : undefined}
    />
  );

  const memoria = useMemo(() => memoriaHs4(j), [j]);
  const errores =
    j.resultado && !j.resultado.arbolValido
      ? [
          "La red de tramos no es un árbol válido (hay un ciclo, un huérfano o varias raíces): revisa la jerarquía en Comprobaciones con Tab/Shift-Tab.",
        ]
      : [];

  return (
    <ModuleLayout
      justificacionKey="hs4"
      resultado={resumen}
      herencia={herencia}
      acciones={{ onExportPdf: handleExportPdf, pdfExporting, onShare: handleShare, onReset: reset }}
      avisos={avisos}
      errores={errores}
      incumplimientos={incumplimientos}
      queEntra={queEntra}
      entradas={entradas}
      comprobacionesConColumna={!manual}
      totalComprobaciones={j.elementos.length}
      vista={vista}
      onVista={setVista}
      dibujo={{ titulo: manual ? "Esquema de columna" : "Montantes y presión por planta", cabecera: cabeceraDibujo, lienzo, franja }}
      comprobaciones={comprobaciones}
      memoria={{ texto: memoria, textoPlano: textoPlanoMemoria(memoria), onFichaPdf: valid ? handleExportPdf : undefined }}
    >
      {/* Clon oculto del dibujo para el raster del PDF (mismo id que busca renderFicha). */}
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div id={HS4_PDF_SVG_ID} style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <DibujoPdfHs4
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

/** "22 ago 2026" — fecha corta es-ES para la cabecera de la ficha. */
function formatearFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(d);
}
