import { useId, useRef, useState, type JSX } from "react";
import { esPdf, leerPdf } from "../../lib/ai/pdfPrep";
import { avisosVerificacion, leerVerificacion, resultadosDe } from "../../lib/energia/verificacion";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";

// =============================================================================
// El documento de la verificación energética (HE0 y, con ella, HE1), bajo su
// fila de La obra: con qué programa se hace, la referencia del documento y, si
// se lee el informe de CE3X, sus resultados. El PDF se lee en el navegador y
// no sale de él; del informe solo se guardan los valores.
// =============================================================================

/** Los programas reconocidos más usados; se puede escribir otro. */
const PROGRAMAS = ["HULC", "CE3X", "CYPETHERM HE Plus"];

const CAMPO =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent focus:ring-accent/30 w-full rounded border px-2 py-1 text-[12.5px] leading-snug transition-colors focus:ring-1 focus:outline-none";
const BOTON =
  "rounded border px-2.5 py-1 text-[12px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

type Lectura = { id: "quieto" } | { id: "leyendo"; nombre: string } | { id: "error"; texto: string };

export function PanelVerificacionEnergetica({ id }: { id: string }): JSX.Element {
  const { proyecto, derivados, setRefExterna, setVerificacionEnergetica, marcarRevisado } = useProyecto();
  const g = proyecto.justificaciones.he0he1_global;
  const v = g?.verificacion;
  const campo = useId();
  const fichero = useRef<HTMLInputElement>(null);
  const [lectura, setLectura] = useState<Lectura>({ id: "quieto" });

  async function leer(file: File | undefined): Promise<void> {
    if (!file) return;
    if (!esPdf(file)) {
      setLectura({ id: "error", texto: "Elige el informe en PDF." });
      return;
    }
    setLectura({ id: "leyendo", nombre: file.name });
    try {
      const pdf = await leerPdf(file, "lineas");
      const r = leerVerificacion(pdf.textos, file.name);
      pdf.cerrar();
      if (!r.ok) {
        setLectura({ id: "error", texto: r.error });
        return;
      }
      setVerificacionEnergetica({ verificacion: r.verificacion, programa: undefined }, new Date().toISOString());
      setLectura({ id: "quieto" });
    } catch (err) {
      setLectura({ id: "error", texto: err instanceof Error ? err.message : "No se ha podido abrir el PDF." });
    } finally {
      if (fichero.current) fichero.current.value = "";
    }
  }

  const resultados = v ? [...resultadosDe(v, "he0he1_global"), ...resultadosDe(v, "he1")] : [];
  const avisos = v ? avisosVerificacion(v, derivados.zonaClimatica.valor) : [];
  const revisados = g?.revisados ?? [];

  return (
    <div id={id} role="group" aria-label="Documento de la verificación energética" className="bg-bg-surface border-border-sub mx-3.5 mb-3 rounded border px-3 py-2.5 md:ml-[166px]">
      <p className="text-text-primary text-[12.5px] font-semibold">Verificación energética: HE0 y HE1</p>
      <p className="text-text-disabled mt-0.5 text-[11px] leading-snug">
        Se hace con un programa reconocido. Su informe justifica también HE1 elemento a elemento y las condensaciones.
      </p>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <label htmlFor={`${campo}-programa`} className="block">
          <span className="text-text-secondary mb-0.5 block text-[11.5px]">Programa</span>
          <input
            id={`${campo}-programa`}
            list={`${campo}-programas`}
            value={v ? v.programa : (g?.programa ?? "")}
            disabled={v !== undefined}
            placeholder="HULC o CE3X"
            onChange={(e) => setVerificacionEnergetica({ programa: e.target.value.trim() !== "" ? e.target.value : undefined }, new Date().toISOString())}
            className={CAMPO}
          />
          <datalist id={`${campo}-programas`}>
            {PROGRAMAS.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </label>
        <label htmlFor={`${campo}-ref`} className="block">
          <span className="text-text-secondary mb-0.5 block text-[11.5px]">Documento de referencia</span>
          <input
            id={`${campo}-ref`}
            value={g?.refExterna ?? ""}
            placeholder="Archivo o expediente"
            onChange={(e) => setRefExterna("he0he1_global", e.target.value)}
            className={CAMPO}
          />
        </label>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <input
          ref={fichero}
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          id={`${campo}-pdf`}
          aria-label="Informe de verificación en PDF"
          onChange={(e) => void leer(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={lectura.id === "leyendo"}
          onClick={() => fichero.current?.click()}
          className={`${BOTON} border-accent text-accent hover:bg-tint-accent`}
        >
          {v ? "Leer otro informe (PDF)" : "Leer el informe (PDF)"}
        </button>
        {v && (
          <button
            type="button"
            onClick={() => setVerificacionEnergetica({ verificacion: undefined, programa: v.programa }, new Date().toISOString())}
            className={`${BOTON} border-border-main text-text-secondary hover:text-text-primary`}
          >
            Quitar el informe
          </button>
        )}
        <span className="text-text-disabled text-[11px]" role="status">
          {lectura.id === "leyendo" ? `Leyendo ${lectura.nombre}…` : v ? "" : "Se leen los informes de verificación de CE3X."}
        </span>
      </div>
      {lectura.id === "error" && (
        <p role="alert" className="text-state-fail mt-1.5 text-[12px]">
          {lectura.texto}
        </p>
      )}

      {v && (
        <div className="mt-2.5">
          <p className="text-text-secondary text-[11.5px]">
            {v.archivo}
            {v.fecha ? ` · ${v.fecha}` : ""}
            {v.zonaClimatica ? ` · zona ${v.zonaClimatica}` : ""}
          </p>
          <div className="mt-1 overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <caption className="sr-only">Resultados del informe</caption>
              <thead className="text-text-disabled text-[10.5px] uppercase">
                <tr>
                  <th scope="col" className="py-1 pr-2 font-semibold">Exigencia</th>
                  <th scope="col" className="py-1 pr-2 font-semibold">Proyecto</th>
                  <th scope="col" className="py-1 pr-2 font-semibold">Límite</th>
                  <th scope="col" className="py-1 font-semibold">Cumple</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r) => (
                  <tr key={r.exigencia} className="border-border-sub border-t">
                    <th scope="row" className="text-text-primary py-1 pr-2 font-normal">{r.exigencia}</th>
                    <td className="text-text-secondary py-1 pr-2 font-mono text-[11.5px]">{r.proyecto}</td>
                    <td className="text-text-secondary py-1 pr-2 font-mono text-[11.5px] whitespace-nowrap">{r.limite}</td>
                    <td className={`py-1 font-mono text-[11.5px] ${r.cumple ? "text-state-ok" : "text-state-fail font-bold"}`}>{r.cumple ? "✓ sí" : "✕ no"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {avisos.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {avisos.map((a) => {
                const hecho = revisados.includes(a.id);
                return (
                  <li key={a.id} className={`text-[12px] leading-snug ${hecho ? "text-text-disabled" : "text-state-warn"}`}>
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={hecho}
                        onChange={(e) => marcarRevisado("he0he1_global", a.id, e.target.checked)}
                        className="mt-0.5"
                      />
                      <span>
                        <span className="font-semibold">{a.titulo}.</span> {a.detalle}
                        <span className="text-text-disabled"> Marcar como revisado.</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
