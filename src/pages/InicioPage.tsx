import { useRef, useState, type JSX } from "react";
import { Link } from "react-router";
import { Copy, FileDown, FolderOpen, Plus, Trash2, Upload } from "lucide-react";
import { ThemeToggle } from "../components/theme/ThemeToggle";
import { ToastContainer, showToast } from "../components/ui/Toast";
import {
  cargarProyecto,
  duplicarProyecto,
  eliminarProyecto,
  exportarProyecto,
  guardarProyecto,
  importarProyecto,
  inicializarStorage,
  listarProyectos,
  setProyectoActivo,
} from "../lib/proyecto/storage";
import { resumenProyecto } from "../lib/proyecto/progreso";
import type { Intervencion, Proyecto, Uso } from "../lib/proyecto/tipos";

// =============================================================================
// Página de inicio (feature-6 T3.4): lista de expedientes. Standalone — sin
// sidebar ni ProyectoProvider; monta su propio ToastContainer porque no cuelga
// del AppShell. Toda fecha se inyecta como ISO desde aquí (la lib no llama a
// Date.now).
// =============================================================================

const USO_LABEL: Record<Uso, string> = {
  vivienda_unifamiliar: "Vivienda unifamiliar",
  vivienda_colectiva: "Vivienda colectiva",
};

const INTERVENCION_LABEL: Record<Intervencion, string> = {
  obra_nueva: "Obra nueva",
  reforma: "Reforma",
  ampliacion: "Ampliación",
  cambio_uso: "Cambio de uso",
};

/** "22 ago 2026" — fecha corta es-ES a partir del ISO `modificado`. */
function formatearFecha(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/** Slug para el nombre de archivo de export: sin diacríticos, kebab-case. */
function slug(nombre: string): string {
  const s = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s === "" ? "proyecto" : s;
}

/** Descarga un string como archivo .json vía Blob + <a download>. */
function descargarJson(nombreArchivo: string, contenido: string): void {
  const blob = new Blob([contenido], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const BTN_FILA =
  "text-text-secondary hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-accent flex items-center gap-1 rounded-md px-2 py-1 text-[12px] transition-colors focus-visible:outline-2";

export function InicioPage(): JSX.Element {
  // Initializer (no efecto): inicializarStorage es idempotente, así que el doble
  // render de StrictMode es inocuo — mismo patrón que RedirectLegacy.
  const [proyectos, setProyectos] = useState<Proyecto[]>(() => {
    inicializarStorage(new Date().toISOString());
    return listarProyectos();
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refrescar = () => setProyectos(listarProyectos());

  const onDuplicar = (p: Proyecto) => {
    const copia = duplicarProyecto(p.id, new Date().toISOString());
    if (copia === null) {
      showToast(`No se pudo duplicar «${p.nombre}».`, { autoDismiss: 5000 });
      return;
    }
    refrescar();
    showToast(`Proyecto duplicado como «${copia.nombre}».`, { autoDismiss: 4000 });
  };

  const onExportar = (p: Proyecto) => {
    descargarJson(`concreta-proyecto-${slug(p.nombre)}.json`, exportarProyecto(p));
    showToast(`Proyecto «${p.nombre}» exportado.`, { autoDismiss: 4000 });
  };

  const onEliminar = (p: Proyecto) => {
    if (!window.confirm(`¿Eliminar el proyecto «${p.nombre}»? Esta acción no se puede deshacer.`)) {
      return;
    }
    eliminarProyecto(p.id);
    refrescar();
    showToast(`Proyecto «${p.nombre}» eliminado.`, { autoDismiss: 4000 });
  };

  const onArchivoImportado = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = importarProyecto(typeof reader.result === "string" ? reader.result : "");
      if (!res.ok) {
        showToast(res.error, { autoDismiss: 7000 });
        return;
      }
      const existente = cargarProyecto(res.proyecto.id);
      if (
        existente !== null &&
        !window.confirm(
          `Ya existe un proyecto con el mismo identificador («${existente.nombre}»). ¿Sobrescribirlo con el archivo importado?`,
        )
      ) {
        return;
      }
      guardarProyecto(res.proyecto);
      refrescar();
      showToast(`Proyecto «${res.proyecto.nombre}» importado.`, { autoDismiss: 4000 });
    };
    reader.onerror = () => showToast("No se pudo leer el archivo seleccionado.", { autoDismiss: 5000 });
    reader.readAsText(file);
  };

  return (
    <div className="bg-bg-primary text-text-primary min-h-dvh">
      <header className="border-border-main bg-bg-surface border-b">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span className="text-text-primary text-[15px] leading-tight font-semibold">
                Concreta
              </span>
              <span className="text-text-disabled text-[12px] leading-tight">
                Instalaciones · CTE
              </span>
            </div>
            <p className="text-text-secondary text-[12px] leading-tight">
              Expedientes de justificación
            </p>
          </div>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-accent flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[13px] transition-colors focus-visible:outline-2"
          >
            <Upload size={14} aria-hidden="true" />
            Importar
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            aria-label="Importar proyecto desde archivo JSON"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onArchivoImportado(file);
              e.target.value = ""; // permite re-seleccionar el mismo archivo
            }}
          />
          <Link
            to="/nuevo"
            className="bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg focus-visible:outline-accent flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Plus size={14} aria-hidden="true" />
            Nuevo proyecto
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <h1 className="text-text-primary mb-3 text-[13px] font-semibold tracking-wide uppercase">
          Proyectos
        </h1>

        {proyectos.length === 0 ? (
          <div className="border-border-sub bg-bg-surface flex flex-col items-center gap-3 rounded-md border px-6 py-12 text-center">
            <FolderOpen size={28} className="text-text-disabled" aria-hidden="true" />
            <p className="text-text-secondary text-sm">
              No hay ningún proyecto todavía. Crea un expediente nuevo o importa uno exportado como
              archivo JSON.
            </p>
            <Link
              to="/nuevo"
              className="bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg focus-visible:outline-accent flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Plus size={14} aria-hidden="true" />
              Nuevo proyecto
            </Link>
          </div>
        ) : (
          <div className="border-border-sub overflow-x-auto rounded-md border">
            <table className="w-full min-w-[640px] border-collapse text-left text-[13px]">
              <caption className="sr-only">Lista de proyectos guardados</caption>
              <thead>
                <tr className="border-border-sub bg-bg-surface text-text-disabled border-b text-[11px] font-medium tracking-wide uppercase">
                  <th scope="col" className="px-3 py-2 font-medium">
                    Proyecto
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Municipio
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Tipo
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Progreso
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Última edición
                  </th>
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {proyectos.map((p) => {
                  const r = resumenProyecto(p);
                  const pct = r.aplicables === 0 ? 0 : Math.round((r.cumplen / r.aplicables) * 100);
                  return (
                    <tr
                      key={p.id}
                      className="border-border-sub hover:bg-bg-surface border-b transition-colors last:border-b-0"
                    >
                      <td className="px-3 py-2">
                        <Link
                          to={`/p/${p.id}`}
                          onClick={() => setProyectoActivo(p.id)}
                          className="text-accent hover:text-accent-hover focus-visible:outline-accent font-medium focus-visible:outline-2"
                        >
                          {p.nombre}
                        </Link>
                      </td>
                      <td className="text-text-secondary px-3 py-2">
                        {p.datosGenerales.municipio || "—"}
                      </td>
                      <td className="text-text-secondary px-3 py-2 whitespace-nowrap">
                        {USO_LABEL[p.datosGenerales.uso]} ·{" "}
                        {INTERVENCION_LABEL[p.datosGenerales.intervencion]}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="bg-bg-elevated h-1.5 w-20 shrink-0 overflow-hidden rounded-full"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={r.aplicables}
                            aria-valuenow={r.cumplen}
                            aria-label={`${r.cumplen} de ${r.aplicables} justificaciones cumplen`}
                          >
                            <div
                              className="bg-state-ok h-full rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-text-secondary text-[12px] whitespace-nowrap">
                            {r.cumplen}/{r.aplicables} justificadas
                          </span>
                        </div>
                      </td>
                      <td className="text-text-secondary px-3 py-2 whitespace-nowrap">
                        {formatearFecha(p.modificado)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            onClick={() => onDuplicar(p)}
                            className={BTN_FILA}
                            aria-label={`Duplicar el proyecto ${p.nombre}`}
                          >
                            <Copy size={13} aria-hidden="true" />
                            <span className="max-lg:hidden">Duplicar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onExportar(p)}
                            className={BTN_FILA}
                            aria-label={`Exportar el proyecto ${p.nombre} como archivo JSON`}
                          >
                            <FileDown size={13} aria-hidden="true" />
                            <span className="max-lg:hidden">Exportar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onEliminar(p)}
                            className="text-text-secondary hover:bg-tint-fail hover:text-state-fail focus-visible:outline-accent flex items-center gap-1 rounded-md px-2 py-1 text-[12px] transition-colors focus-visible:outline-2"
                            aria-label={`Eliminar el proyecto ${p.nombre}`}
                          >
                            <Trash2 size={13} aria-hidden="true" />
                            <span className="max-lg:hidden">Eliminar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <ToastContainer />
    </div>
  );
}
