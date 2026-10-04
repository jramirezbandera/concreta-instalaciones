// DB-HS5 — Pantalla del módulo de evacuación de aguas (feature-14 §J, módulo
// patrón de la v4). La red se deduce de El edificio: a la izquierda «Qué entra»
// y las cuatro decisiones; a la derecha la sección del edificio, grande, con
// las cifras como etiquetas pulsables y la franja de lo seleccionado debajo;
// los avisos a lo ancho, con «Ver en el dibujo» y «Marcar como revisado»;
// Comprobaciones es la lista de elementos y Memoria, el texto redactado.
//
// «Ajustar a mano» (decisión 1 de REDISENO-V4 §7) copia la red generada a la
// tabla de tramos (`RedManual`); desde ahí manda la tabla, el dibujo pasa al
// esquema de columna y la izquierda ofrece volver a generarla.
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
  type ResumenVeredicto,
  type VistaModulo,
} from "../../components/justificacion/ModuleLayout";
import { DelProyecto } from "../../components/justificacion/DelProyecto";
import { DibujoConEtiquetas } from "../../components/justificacion/DibujoConEtiquetas";
import { FranjaDetalle } from "../../components/justificacion/FranjaDetalle";
import { LienzoAjustado } from "../../components/justificacion/LienzoAjustado";
import { ListaComprobaciones } from "../../components/justificacion/ListaComprobaciones";
import { QueEntra } from "../../components/justificacion/QueEntra";
import { PdfPreviewModal } from "../../components/ui/PdfPreviewModal";
import { showToast } from "../../components/ui/Toast";
import type { EstadoPresentacion } from "../../lib/cte/presentacion";
import { renderFicha } from "../../lib/pdf/renderFicha";
import { notasExcepcionesLocales } from "../../lib/proyecto/herencia";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { ajustar } from "../../lib/ui/ajustar";
import { fmt } from "../../lib/units/format";
import { DecisionesHs5 } from "./DecisionesHs5";
import { filasQueEntra } from "./entra";
import { hs5EstadoDefaults, type Hs5Estado } from "./estado";
import { toFichaData } from "./ficha";
import { justificarHs5, type ObraHs5 } from "./justificacion";
import { memoriaHs5, textoPlano } from "./memoria";
import { RedManual } from "./RedManual";
import { calcularSeccion, tamanoDibujoHs5 } from "./seccion";
import { DibujoPdfHs5, SeccionHs5 } from "./SeccionHs5";
import { HS5SVG } from "./svg";
import { HS5_PDF_SVG_ID } from "./svg-meta";
import {
  describirSeccion,
  estadoDe,
  franjaDe,
  fraseHs5,
  metricasHs5,
  resultadoLista,
  textoAviso,
  textoEtiqueta,
} from "./textos";

/**
 * Alias mapeado de Hs5Estado para el generic de useJustificacionState: los
 * `interface` no llevan index signature implícita y no satisfacen
 * `Record<string, unknown>`; el alias mapeado (idéntico) sí.
 */
type Hs5State = { [K in keyof Hs5Estado]: Hs5Estado[K] };

const ESTADO_TEXTO: Record<string, string> = {
  ok: "Cumple",
  warn: "Aviso",
  fail: "No cumple",
  neutral: "Informativo",
};

export function Hs5Module() {
  const { state, setField, reset, herencia } = useJustificacionState<Hs5State>("hs5", hs5EstadoDefaults);
  const { proyecto, derivados, marcarRevisado } = useProyecto();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [vista, setVista] = useState<VistaModulo>("esquema");
  const [confirmarManual, setConfirmarManual] = useState(false);
  const [confirmarEdificio, setConfirmarEdificio] = useState(false);

  const deferredState = useDeferredValue(state);
  const edificio = proyecto.edificio;
  const pluviometria = proyecto.datosGenerales.pluviometria;
  const cotaAlcantarillado_m = proyecto.datosGenerales.cotaAlcantarillado_m;
  const obra: ObraHs5 = useMemo(() => ({ pluviometria, cotaAlcantarillado_m }), [pluviometria, cotaAlcantarillado_m]);
  const j = useMemo(() => justificarHs5(deferredState, edificio, obra), [deferredState, edificio, obra]);
  const manual = j.modo === "manual";

  // ── Avisos y estados ───────────────────────────────────────────────────────
  const revisados = proyecto.justificaciones.hs5?.revisados ?? [];
  const pendientes = j.avisos.filter((a) => !revisados.includes(a.id));
  const conAvisoPendiente = new Set(pendientes.flatMap((a) => (a.elementoId ? [a.elementoId] : [])));
  const estados: Record<string, EstadoPresentacion> = Object.fromEntries(
    j.elementos.map((el) => [el.id, estadoDe(el, conAvisoPendiente)]),
  );

  // La selección vale si el elemento (o el tramo/aparato, a mano) existe; si
  // no, se enseña el colector, como en la maqueta.
  const existe = (id: string) =>
    j.elementos.some((e) => e.id === id) ||
    (manual && (state.tramos.some((t) => t.id === id) || state.aparatos.some((a) => a.id === id)));
  const selVigente =
    selectedId !== null && existe(selectedId)
      ? selectedId
      : (j.elementos.find((e) => e.detalle.clase === "colector")?.id ?? j.elementos[0]?.id ?? null);
  const elementoSel = j.elementos.find((e) => e.id === selVigente) ?? null;

  const seleccionar = (id: string | null) => setSelectedId(id);
  const verEnDibujo = (id: string) => {
    setSelectedId(id);
    setVista("esquema");
  };

  const avisos: AvisoModulo[] = j.avisos.map((a) => {
    const t = textoAviso(a);
    const accion =
      a.id === "pluviometria-supuesta" ||
      (a.id.endsWith("-bombeo") && a.datos.cotaAlcantarillado_m === null) ? (
        <Link
          to={`/p/${proyecto.id}/datos`}
          className="border-border-main bg-bg-primary text-accent hover:text-accent-hover inline-flex h-7 items-center rounded border px-2.5 text-[12px]"
        >
          {a.id === "pluviometria-supuesta" ? "Indicarla en Datos de la obra" : "Indicar la cota"}
        </Link>
      ) : undefined;
    return {
      id: a.id,
      titulo: t.titulo,
      detalle: t.detalle,
      revisado: revisados.includes(a.id),
      onVer: a.elementoId ? () => verEnDibujo(a.elementoId!) : undefined,
      onRevisar: (b: boolean) => marcarRevisado("hs5", a.id, b),
      accion,
    };
  });

  const nPendientes = pendientes.length;
  const resumen: ResumenVeredicto | null = useMemo(() => {
    if (j.elementos.length === 0) return null;
    return {
      veredicto: j.veredicto === "fail" ? "fail" : nPendientes > 0 ? "warn" : j.veredicto,
      sujeto: "Red de evacuación",
      metricas: metricasHs5(j),
      frase: fraseHs5(j),
    };
  }, [j, nPendientes]);

  // ── Ficha PDF (la misma para el botón y el anejo) ──────────────────────────
  const tamano = tamanoDibujoHs5(j, edificio);
  const valid = j.elementos.length > 0 && (j.residuales?.arbolValido ?? true);
  const generarFicha = () => {
    const base = toFichaData(j, { estado: deferredState, edificio, obra, revisados, svg: tamano });
    return renderFicha({
      ...base,
      proyecto: proyecto.nombre,
      fechaProyecto: formatearFecha(proyecto.modificado),
      observaciones: [
        ...(base.observaciones ?? []),
        ...(manual
          ? notasExcepcionesLocales({
              key: "hs5",
              dg: proyecto.datosGenerales,
              d: derivados,
              state: deferredState,
              overrides: herencia.campos.filter((c) => c.override).map((c) => c.campo),
            })
          : []),
      ],
    });
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

  // ── Ajustar a mano / volver a El edificio (dos pulsaciones) ────────────────
  const ajustarAMano = () => {
    if (!confirmarManual) {
      setConfirmarManual(true);
      return;
    }
    setField("tramos", j.red.residuales.tramos);
    setField("aparatos", j.red.residuales.aparatos);
    setField("uso", j.red.residuales.uso);
    setField("numPlantas", j.red.residuales.numPlantas);
    setField("red", "manual");
    setConfirmarManual(false);
    setVista("comprobaciones");
    showToast("La red de residuales se edita a mano en Comprobaciones", { autoDismiss: 3000 });
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
  const { filas: filasEntra, sinAparatos } = filasQueEntra(j, edificio, estados);
  const queEntra = (
    <QueEntra
      filas={filasEntra}
      seleccion={selVigente}
      onSelect={verEnDibujo}
      enlace={{ to: `/p/${proyecto.id}/edificio`, label: "Editar el edificio" }}
      pie={
        <>
          {sinAparatos && <p className="text-text-disabled pt-1.5 text-[11.5px] leading-snug">{sinAparatos}</p>}
          {manual && (
            <div className="border-border-sub mt-3 rounded border px-3 py-2.5 text-[12px] leading-snug">
              <p className="text-text-secondary">
                <b className="text-text-primary font-medium">Red de residuales ajustada a mano.</b> Los cambios de El
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
          )}
        </>
      }
    />
  );
  const hayCocinas = j.red.verticales.some((v) => v.clase === "vivienda");
  const entradas = (
    <>
      {manual && <DelProyecto proyectoId={proyecto.id} herencia={herencia} />}
      <DecisionesHs5
        state={state}
        setField={setField}
        edificio={edificio}
        efectivas={j.red.decisiones}
        hayCocinas={hayCocinas}
        colgadoDe={j.red.colgadoDe}
      />
    </>
  );

  // ── El dibujo ──────────────────────────────────────────────────────────────
  const seccion = manual ? null : calcularSeccion(j, edificio);
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
  const nombresVerticales = [...new Set(j.red.verticales.map((v) => v.nombre))];
  const tituloDibujo = manual ? "Esquema de columna" : "Esquema de columnas";
  const lienzo = (
    <LienzoAjustado anchoMin={manual ? undefined : 560}>
      {(caja) => {
        if (manual || !seccion) {
          if (!j.residuales) return null;
          const { width, height } = ajustar(tamano.nativeW, tamano.nativeH, caja, { max: 900 });
          return (
            <HS5SVG
              result={j.residuales}
              mode="screen"
              width={width}
              height={height}
              selectedId={selVigente}
              hoverId={hoverId}
              onSelect={seleccionar}
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
            onSelect={seleccionar}
            etiquetas={etiquetasDibujo}
            svg={
              <SeccionHs5
                seccion={seccion}
                mode="screen"
                width={width}
                height={height}
                titulo="Sección del edificio con la red de evacuación (DB-HS5)"
                descripcion={describirSeccion(j)}
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
      {!manual && !j.red.unifamiliar && nombresVerticales.length > 0 && (
        <span className="text-text-disabled font-mono text-[10.5px] tracking-[0.08em] uppercase">
          · {nombresVerticales.length === 1 ? "vertical" : "verticales"} {nombresVerticales.join(" y ")}
        </span>
      )}
      <span className="text-text-disabled text-[11.5px]">
        {manual ? "Pulsa un tramo o un aparato del esquema." : "Pulsa cualquier cifra del dibujo para ver de dónde sale."}
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
          <i className="border-text-disabled h-[7px] w-[7px] rounded-full border-[1.5px]" />
          previsto
        </span>
      </span>
    </>
  );

  // ── La franja ──────────────────────────────────────────────────────────────
  let franja;
  if (elementoSel) {
    franja = <FranjaDetalle detalle={franjaDe(elementoSel, j, estados[elementoSel.id] ?? "ok")} />;
  } else {
    // A mano, un tramo o aparato que no es un elemento de la lista.
    const rt = j.residuales?.porTramo.find((t) => t.id === selVigente);
    const ra = j.residuales?.porAparato.find((a) => a.id === selVigente);
    const nombre =
      [...state.tramos, ...state.aparatos].find((x) => x.id === selVigente)?.nombre ?? selVigente ?? "";
    const texto = rt
      ? `${nombre} — ${rt.diametro_mm != null ? `Ø${fmt(rt.diametro_mm, undefined, 0)}` : "Ø —"} · ${fmt(rt.udAcumuladas, "UD")} · ${ESTADO_TEXTO[rt.estado]}`
      : ra
        ? `${nombre} — ${fmt(ra.ud, "UD")} · Ø mín ${ra.diametroMin_mm != null ? fmt(ra.diametroMin_mm, "mm", 0) : "—"} · ${ESTADO_TEXTO[ra.estado]}`
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
        <b className="text-text-primary font-medium">¿La red real es distinta?</b> Ajústala tramo a tramo. La tabla
        parte de la red que sale de El edificio y, desde ese momento, manda ella.
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
      <RedManual
        state={state}
        setField={setField}
        result={j.residuales}
        selectedId={selVigente}
        onSelect={seleccionar}
        onHover={setHoverId}
      />
      <ListaComprobaciones filas={filasLista} seleccion={selVigente} onSelect={seleccionar} />
    </div>
  ) : (
    <ListaComprobaciones
      filas={filasLista}
      seleccion={selVigente}
      onSelect={seleccionar}
      pie={j.residuales ? pieManual : undefined}
    />
  );

  const memoria = useMemo(() => memoriaHs5(j), [j]);
  const errores =
    j.residuales && !j.residuales.arbolValido
      ? [
          "La red de tramos no es un árbol válido (hay un ciclo, un huérfano o varias raíces): revisa la jerarquía en Comprobaciones con Tab/Shift-Tab.",
        ]
      : [];

  return (
    <ModuleLayout
      justificacionKey="hs5"
      resultado={resumen}
      herencia={herencia}
      acciones={{ onExportPdf: handleExportPdf, pdfExporting, onShare: handleShare, onReset: reset }}
      avisos={avisos}
      errores={errores}
      queEntra={queEntra}
      entradas={entradas}
      comprobacionesConColumna={!manual}
      totalComprobaciones={j.elementos.length}
      vista={vista}
      onVista={setVista}
      dibujo={{ titulo: tituloDibujo, cabecera: cabeceraDibujo, lienzo, franja }}
      comprobaciones={comprobaciones}
      memoria={{ texto: memoria, textoPlano: textoPlano(memoria), onFichaPdf: valid ? handleExportPdf : undefined }}
    >
      {/* Clon oculto del dibujo para el raster del PDF (mismo id que busca renderFicha). */}
      <div className="h-0 w-0 overflow-hidden" aria-hidden="true">
        <div id={HS5_PDF_SVG_ID} style={{ position: "absolute", left: "-9999px", top: 0 }}>
          <DibujoPdfHs5
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

/**
 * "22 ago 2026" — fecha corta es-ES a partir de un ISO (mismo formato que el
 * listado de expedientes de InicioPage). Solo para la cabecera de la ficha.
 */
function formatearFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric" }).format(d);
}
