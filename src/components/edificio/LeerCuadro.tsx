import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { FileText, Sparkles, X } from "lucide-react";
import { ByokSettings } from "../ai/ByokSettings";
import { ProviderStrip } from "../ai/ProviderStrip";
import { AiSettingsProvider } from "../../lib/ai/AiSettingsProvider";
import { ACCEPTED_MEDIA_TYPES, MAX_IMAGES, prepareImage } from "../../lib/ai/imagePrep";
import { AI_PROVIDER_LABELS } from "../../lib/ai/models";
import { esPdf, leerPdf, type PdfAbierto } from "../../lib/ai/pdfPrep";
import { runChatTurn } from "../../lib/ai/providers";
import { AI_ERROR_MESSAGES, AiError, type AiImageAttachment } from "../../lib/ai/types";
import { useAiSettings } from "../../lib/ai/useAiSettings";
import {
  construirPeticion,
  esEscaneado,
  paginasEscaneado,
  parseLectura,
  seleccionarTexto,
  type Documento,
  type Seleccion,
} from "../../lib/edificio/cuadro/leer";
import {
  corregirFila,
  esDudosa,
  filasRevisables,
  montarEdificio,
  type CorreccionFila,
  type FilaRevisable,
} from "../../lib/edificio/cuadro/montar";
import { fraseEdificio, validarEdificio } from "../../lib/edificio/derivar";
import { dondeEstaTipo } from "../../lib/edificio/deducciones";
import type { Edificio } from "../../lib/edificio/tipos";
import { SeccionEdificio } from "./SeccionEdificio";
import { TablaPropuesta } from "./TablaPropuesta";

// =============================================================================
// «Leer el cuadro de superficies» (feature-13, REDISENO-V4 §3.5): la ventana que
// encadena las piezas de `lib/edificio/cuadro`. Mismo esquema que «Leer el PDF
// del geotécnico» de Concreta, con un paso más:
//   1. elegir un PDF o capturas (arrastrando, eligiendo o pegando);
//   2. ver qué se va a mandar, con qué proveedor y con qué clave;
//   3. leer (cancelable);
//   4. revisar: la tabla de filas a la izquierda y, a la derecha, el edificio que
//      saldría, que se vuelve a montar con cada corrección.
// Nada sale del navegador hasta pulsar «Leer», y nada cambia en el proyecto hasta
// pulsar «Sustituir el edificio». Las refs se tocan solo en handlers y efectos.
// =============================================================================

interface Props {
  /** El edificio actual: de él se conservan las alturas y el tipo de cubierta. */
  edificio: Edificio;
  onAplicar: (nuevo: Edificio, documento: string) => void;
  onClose: () => void;
}

type Fuente =
  | { tipo: "pdf"; pdf: PdfAbierto; seleccion: Seleccion | null }
  | { tipo: "imagenes"; nombre: string; bytes: number; imagenes: AiImageAttachment[]; vistas: string[] };

type Fase =
  | { id: "elegir"; error?: string }
  | { id: "abriendo"; nombre: string }
  | { id: "listo"; fuente: Fuente; error?: string }
  | { id: "leyendo"; fuente: Fuente }
  | { id: "revisar"; fuente: Fuente; reply: string; avisos: string[]; filas: FilaRevisable[] };

const ACEPTA = ["application/pdf", ".pdf", ...ACCEPTED_MEDIA_TYPES].join(",");

const BOTON_ACENTO =
  "bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg inline-flex h-8 items-center gap-1.5 rounded px-3.5 text-[13px] font-medium transition-colors disabled:cursor-default disabled:opacity-50";
const BOTON_MENOR =
  "text-text-secondary hover:text-text-primary hover:bg-bg-elevated inline-flex h-8 items-center rounded px-3 text-[13px] transition-colors";

const MB = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toLocaleString("es-ES", { maximumFractionDigits: 1 })} MB`;

function nombreDe(f: Fuente): string {
  return f.tipo === "pdf" ? f.pdf.nombre : f.nombre;
}

function liberar(f: Fuente | null): void {
  if (!f) return;
  if (f.tipo === "pdf") f.pdf.cerrar();
  else for (const u of f.vistas) URL.revokeObjectURL(u);
}

function Lista({ titulo, items, tono }: { titulo: string; items: string[]; tono: string }): JSX.Element | null {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <h3 className={`text-[11px] font-semibold tracking-[0.06em] uppercase ${tono}`}>{titulo}</h3>
      <ul className="text-text-secondary list-disc pl-4 text-[12px] leading-snug">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </div>
  );
}

export default function LeerCuadro(props: Props): JSX.Element {
  return (
    <AiSettingsProvider>
      <Ventana {...props} />
    </AiSettingsProvider>
  );
}

function Ventana({ edificio, onAplicar, onClose }: Props): JSX.Element {
  const { settings, activeKey, usingSharedKey } = useAiSettings();
  const [fase, setFase] = useState<Fase>({ id: "elegir" });
  const [ajustes, setAjustes] = useState(() => activeKey === null);
  const [zonaSel, setZonaSel] = useState<string | null>(null);
  const [soloDudosas, setSoloDudosas] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const fuenteRef = useRef<Fuente | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Scroll del body bloqueado; al cerrar se aborta lo que esté en vuelo y se
  // libera el PDF (o las vistas de las imágenes).
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      abortRef.current?.abort();
      liberar(fuenteRef.current);
    };
  }, []);

  // Escape cierra mientras no haya trabajo que perder (una lectura en curso o
  // una revisión a medias se cancelan con sus botones).
  const cerrable = fase.id === "elegir" || fase.id === "abriendo" || fase.id === "listo";
  useEffect(() => {
    if (!cerrable) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cerrable, onClose]);

  const fijarFuente = (f: Fuente | null) => {
    if (fuenteRef.current !== f) liberar(fuenteRef.current);
    fuenteRef.current = f;
  };

  const elegir = async (files: File[], pegadas = false) => {
    const pdf = files.find(esPdf);
    const imagenes = files.filter((f) => ACCEPTED_MEDIA_TYPES.includes(f.type)).slice(0, MAX_IMAGES);
    if (!pdf && imagenes.length === 0) {
      setFase({ id: "elegir", error: "Solo se leen PDF e imágenes PNG, JPEG o WebP." });
      return;
    }
    const nombre = pdf
      ? pdf.name
      : pegadas
        ? "Captura pegada"
        : `${imagenes[0]!.name}${imagenes.length > 1 ? ` y ${imagenes.length - 1} más` : ""}`;
    setFase({ id: "abriendo", nombre });
    try {
      let fuente: Fuente;
      if (pdf) {
        const abierto = await leerPdf(pdf, "lineas");
        fuente = {
          tipo: "pdf",
          pdf: abierto,
          seleccion: esEscaneado(abierto.textos) ? null : seleccionarTexto(abierto.textos),
        };
      } else {
        const preparadas = await Promise.all(imagenes.map(prepareImage));
        fuente = {
          tipo: "imagenes",
          nombre,
          bytes: imagenes.reduce((a, f) => a + f.size, 0),
          imagenes: preparadas,
          vistas: imagenes.map((f) => URL.createObjectURL(f)),
        };
      }
      fijarFuente(fuente);
      setFase({ id: "listo", fuente });
    } catch (err) {
      setFase({ id: "elegir", error: err instanceof Error ? err.message : "No se ha podido abrir el documento." });
    }
  };

  // Pegar una captura (Ctrl+V) mientras se elige.
  useEffect(() => {
    if (fase.id !== "elegir") return;
    const onPaste = (e: ClipboardEvent) => {
      const files = [...(e.clipboardData?.files ?? [])];
      if (files.length > 0) {
        e.preventDefault();
        void elegir(files, true);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  const otroDocumento = () => {
    fijarFuente(null);
    setZonaSel(null);
    setFase({ id: "elegir" });
  };

  const leer = async () => {
    if (fase.id !== "listo" || activeKey === null) return;
    const { fuente } = fase;
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setFase({ id: "leyendo", fuente });
    try {
      let doc: Documento;
      let imagenes: AiImageAttachment[];
      if (fuente.tipo === "pdf") {
        const { pdf, seleccion } = fuente;
        doc = { tipo: "pdf", nombre: pdf.nombre, paginas: pdf.paginas, seleccion };
        imagenes = seleccion ? [] : await pdf.imagenes(paginasEscaneado(pdf.paginas));
      } else {
        doc = { tipo: "imagenes", nombre: fuente.nombre };
        imagenes = fuente.imagenes;
      }
      const envelope = await runChatTurn(settings.provider, activeKey, construirPeticion(doc, imagenes, ctrl.signal));
      if (ctrl.signal.aborted) return;
      const lectura = parseLectura(envelope.proposal);
      if (lectura.filas.length === 0) {
        setFase({
          id: "listo",
          fuente,
          error: `No se ha encontrado ninguna línea con superficie. ${envelope.reply}`.trim(),
        });
        return;
      }
      setSoloDudosas(false);
      setZonaSel(null);
      setFase({ id: "revisar", fuente, reply: envelope.reply, avisos: lectura.avisos, filas: filasRevisables(lectura) });
    } catch (err) {
      if (ctrl.signal.aborted || (err instanceof AiError && err.kind === "aborted")) {
        setFase({ id: "listo", fuente });
        return;
      }
      const error =
        err instanceof AiError
          ? `${AI_ERROR_MESSAGES[err.kind]} ${err.kind === "unknown" || err.kind === "bad-response" ? err.message : ""}`.trim()
          : "No se ha podido leer el cuadro.";
      setFase({ id: "listo", fuente, error });
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null;
    }
  };

  const corregir = (i: number, c: CorreccionFila) =>
    setFase((f) => (f.id === "revisar" ? { ...f, filas: corregirFila(f.filas, i, c) } : f));

  const montaje = useMemo(
    () => (fase.id === "revisar" ? montarEdificio(fase.filas, edificio, nombreDe(fase.fuente)) : null),
    [fase, edificio],
  );
  const porRevisar = useMemo(() => {
    if (!montaje?.edificio) return montaje?.avisos ?? [];
    return [...new Set([...montaje.avisos, ...validarEdificio(montaje.edificio)])];
  }, [montaje]);

  const proveedor = AI_PROVIDER_LABELS[settings.provider];
  const privacidad = usingSharedKey
    ? "El cuadro se envía a Google con la clave compartida de Concreta, que es gratuita: Google puede usar lo que recibe para mejorar sus modelos. Para un proyecto confidencial, usa tu propia clave."
    : `El cuadro se envía a ${proveedor} con tu clave. Con una clave de pago, el proveedor no usa lo que recibe para entrenar.`;

  const ancha = fase.id === "revisar";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 backdrop-blur-[2px] sm:px-4"
      role="presentation"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cuadro-titulo"
        className={[
          "border-border-main bg-bg-surface flex max-w-full flex-col rounded-md border shadow-2xl focus:outline-none",
          ancha ? "h-[94vh] w-[1320px]" : "max-h-[90vh] w-[580px]",
        ].join(" ")}
      >
        <div className="border-border-main flex shrink-0 items-center gap-3 border-b px-5 py-3">
          <Sparkles size={16} className="text-accent" aria-hidden="true" />
          <h2 id="cuadro-titulo" className="text-text-primary text-sm font-medium">
            Leer el cuadro de superficies
          </h2>
          {ancha && (
            <span className="text-text-disabled min-w-0 truncate text-[12px]">· {nombreDe(fase.fuente)}</span>
          )}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar la ventana"
            className="text-text-secondary hover:bg-bg-elevated hover:text-text-primary rounded p-1.5 transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {!ancha && (
          <div className="flex min-h-0 flex-col gap-3 overflow-y-auto px-5 py-4">
            {fase.id === "elegir" && (
              <>
                <label
                  className="border-border-main hover:border-accent focus-within:border-accent flex cursor-pointer flex-col items-center gap-1.5 rounded border border-dashed px-4 py-7 text-center transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    void elegir([...e.dataTransfer.files]);
                  }}
                >
                  <FileText size={22} className="text-text-disabled" aria-hidden="true" />
                  <span className="text-text-primary text-[13px]">Elige el PDF del cuadro o una captura</span>
                  <span className="text-text-secondary max-w-[420px] text-[12px] leading-snug">
                    O arrástralo aquí, o pega una captura con Ctrl+V. Se abre en tu navegador y no sale de él hasta
                    que pulses «Leer».
                  </span>
                  <input
                    type="file"
                    accept={ACEPTA}
                    multiple
                    className="sr-only"
                    aria-label="PDF o imágenes del cuadro de superficies"
                    onChange={(e) => {
                      const files = [...(e.target.files ?? [])];
                      e.target.value = "";
                      if (files.length > 0) void elegir(files);
                    }}
                  />
                </label>
                <p className="text-text-disabled text-[11.5px] leading-snug">
                  ¿Está en un plano? Recorta solo la tabla con una captura (Windows + Mayús + S) y pégala aquí: se
                  lee mejor que la lámina entera. Hasta {MAX_IMAGES} capturas a la vez.
                </p>
                {fase.error && (
                  <p role="alert" className="text-state-fail text-[12px]">
                    {fase.error}
                  </p>
                )}
              </>
            )}

            {fase.id === "abriendo" && (
              <p role="status" className="text-text-secondary text-[12.5px]">
                Abriendo «{fase.nombre}»…
              </p>
            )}

            {(fase.id === "listo" || fase.id === "leyendo") && (
              <>
                <div className="border-border-sub bg-bg-primary rounded border px-3 py-2 text-[12px]">
                  <div className="text-text-primary truncate font-medium">{nombreDe(fase.fuente)}</div>
                  <div className="text-text-secondary leading-snug">
                    {fase.fuente.tipo === "pdf"
                      ? `${fase.fuente.pdf.paginas} ${fase.fuente.pdf.paginas === 1 ? "página" : "páginas"} · ${MB(fase.fuente.pdf.bytes)} · ${
                          fase.fuente.seleccion
                            ? `se manda el texto de ${fase.fuente.seleccion.paginas.length === 1 ? "su página" : `${fase.fuente.seleccion.paginas.length} páginas`}${fase.fuente.seleccion.recortado ? ", recortado a las que hablan de superficies" : ""}`
                            : `sin texto (escaneado): se leen sus ${paginasEscaneado(fase.fuente.pdf.paginas).length} primeras páginas como imágenes`
                        }`
                      : `${fase.fuente.imagenes.length === 1 ? "1 imagen" : `${fase.fuente.imagenes.length} imágenes`} · ${MB(fase.fuente.bytes)}`}
                  </div>
                  {fase.fuente.tipo === "imagenes" && (
                    <div className="mt-2 flex gap-2">
                      {fase.fuente.vistas.map((u, k) => (
                        <img
                          key={u}
                          src={u}
                          alt={`Captura ${k + 1}`}
                          className="border-border-sub h-16 max-w-[140px] rounded border object-contain"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <ProviderStrip open={ajustes} onToggle={() => setAjustes((o) => !o)} />
                {ajustes && <ByokSettings defaultOpen />}
                <p className="text-text-secondary text-[11.5px] leading-snug">{privacidad}</p>
                {fase.id === "listo" && fase.error && (
                  <p role="alert" className="text-state-fail text-[12px] leading-snug">
                    {fase.error}
                  </p>
                )}
                {fase.id === "leyendo" && (
                  <p role="status" className="text-accent text-[12.5px]">
                    Leyendo el cuadro con {proveedor}… suele tardar entre diez segundos y un minuto.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {fase.id === "revisar" && montaje && (
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
            <section aria-label="Filas del cuadro" className="flex min-w-0 flex-col xl:flex-1 xl:overflow-hidden">
              <div className="border-border-sub flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1.5 border-b px-5 py-2.5 text-[12px]">
                <span className="text-text-secondary">
                  {fase.filas.length} filas leídas · {fase.filas.filter((f) => f.usar).length} entran ·{" "}
                  {fase.filas.filter((f) => !f.usar).length} fuera
                </span>
                <label className="text-text-secondary inline-flex cursor-pointer items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={soloDudosas}
                    onChange={(e) => setSoloDudosas(e.target.checked)}
                    className="accent-accent"
                  />
                  Solo las dudosas ({fase.filas.filter(esDudosa).length})
                </label>
                <span className="text-text-disabled max-xl:hidden">
                  Lo que corrijas aquí se ve al momento en el edificio de la derecha.
                </span>
              </div>
              <div className="scroll-hide min-h-0 flex-1 overflow-auto">
                <TablaPropuesta
                  filas={fase.filas}
                  destino={montaje.destino}
                  zonaSel={zonaSel}
                  soloDudosas={soloDudosas}
                  onCorregir={corregir}
                  onVer={setZonaSel}
                />
              </div>
            </section>

            <aside
              aria-label="Así queda el edificio"
              className="border-border-main bg-bg-primary flex shrink-0 flex-col gap-4 border-t px-5 py-4 xl:w-[520px] xl:overflow-y-auto xl:border-t-0 xl:border-l"
            >
              <div className="flex flex-col gap-1">
                <h3 className="text-text-disabled text-[10.5px] font-semibold tracking-[0.08em] uppercase">
                  Lo que dice el lector
                </h3>
                <p className="text-text-primary text-[12.5px] leading-snug">{fase.reply}</p>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-text-disabled text-[10.5px] font-semibold tracking-[0.08em] uppercase">
                  Así queda el edificio
                </h3>
                {montaje.edificio ? (
                  <>
                    <p className="text-text-secondary text-[12.5px] leading-snug">{fraseEdificio(montaje.edificio)}</p>
                    <div className="canvas-dot-grid border-border-sub overflow-x-auto rounded border px-2 py-3">
                      <div className="min-w-[440px]">
                        <SeccionEdificio
                          edificio={montaje.edificio}
                          seleccion={zonaSel ? { tipo: "zona", id: zonaSel } : null}
                          onSeleccionar={(s) => setZonaSel(s.tipo === "zona" && s.id !== zonaSel ? s.id : null)}
                        />
                      </div>
                    </div>
                    {montaje.edificio.unidades.length > 0 && (
                      <ul className="flex flex-col gap-1 text-[12px]">
                        {montaje.edificio.unidades.map((u) => (
                          <li key={u.id} className="text-text-secondary">
                            <b className="text-text-primary font-semibold">
                              {u.clase === "vivienda" ? `Tipo ${u.nombre}` : `Núcleo ${u.nombre}`}
                            </b>{" "}
                            ·{" "}
                            {u.clase === "vivienda"
                              ? `${u.dormitorios} dorm. · ${u.banos} ${u.banos === 1 ? "baño" : "baños"}${u.aseos > 0 ? ` · ${u.aseos} ${u.aseos === 1 ? "aseo" : "aseos"}` : ""}`
                              : `${u.inodoros} inodoros`}{" "}
                            · {u.superficieUtil_m2.toLocaleString("es-ES", { maximumFractionDigits: 2 })} m² ·{" "}
                            {dondeEstaTipo(montaje.edificio!, u).cuantas}
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="text-state-fail text-[12.5px]">
                    Con estas filas no sale un edificio: hace falta al menos una planta sobre rasante.
                  </p>
                )}
              </div>

              <Lista titulo="Por revisar" items={porRevisar} tono="text-state-warn" />
              <Lista titulo="Avisos del lector" items={fase.avisos} tono="text-text-secondary" />
            </aside>
          </div>
        )}

        <div className="border-border-main flex shrink-0 flex-wrap items-center justify-end gap-2 border-t px-5 py-3">
          {fase.id === "listo" && (
            <>
              <button type="button" onClick={otroDocumento} className={BOTON_MENOR}>
                Otro documento
              </button>
              <div className="flex-1" />
              <button type="button" onClick={onClose} className={BOTON_MENOR}>
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void leer()}
                disabled={activeKey === null}
                title={activeKey === null ? "Falta la clave del proveedor" : undefined}
                className={BOTON_ACENTO}
              >
                <Sparkles size={13} aria-hidden="true" />
                Leer con IA
              </button>
            </>
          )}
          {fase.id === "leyendo" && (
            <button type="button" onClick={() => abortRef.current?.abort()} className={BOTON_MENOR}>
              Cancelar lectura
            </button>
          )}
          {(fase.id === "elegir" || fase.id === "abriendo") && (
            <button type="button" onClick={onClose} className={BOTON_MENOR}>
              Cancelar
            </button>
          )}
          {fase.id === "revisar" && (
            <>
              <button type="button" onClick={otroDocumento} className={BOTON_MENOR}>
                Otro documento
              </button>
              <div className="flex-1" />
              <span className="text-text-disabled text-[12px] max-sm:hidden">
                Sustituye el edificio entero; podrás deshacerlo.
              </span>
              <button type="button" onClick={onClose} className={BOTON_MENOR}>
                Cancelar
              </button>
              <button
                type="button"
                disabled={!montaje?.edificio}
                onClick={() => {
                  if (montaje?.edificio) onAplicar(montaje.edificio, nombreDe(fase.fuente));
                }}
                className={BOTON_ACENTO}
              >
                Sustituir el edificio
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
