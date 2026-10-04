import { useState, type JSX } from "react";
import { Check, Copy, FileDown } from "lucide-react";
import type { MemoriaDoc } from "../../lib/cte/presentacion";

// =============================================================================
// La pestaña Memoria en texto (REDISENO-V4 §3.3, feature-14 §H): el texto que
// el proyectista lleva a su memoria justificativa, redactado a partir del
// cálculo. Se revisa, no se edita. «Copiar texto» lo deja en el portapapeles en
// texto plano; la ficha PDF sigue a un clic.
// =============================================================================

interface MemoriaTextoProps {
  doc: MemoriaDoc;
  /** El mismo texto en plano, para copiar. */
  textoPlano: string;
  /** Abre la ficha PDF (la del botón «Ficha PDF» de arriba). */
  onFichaPdf?: () => void;
}

export function MemoriaTexto({ doc, textoPlano, onFichaPdf }: MemoriaTextoProps): JSX.Element {
  const [copiado, setCopiado] = useState<"no" | "si" | "error">("no");

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoPlano);
      setCopiado("si");
    } catch {
      setCopiado("error");
    }
  };

  return (
    <section aria-label="Memoria" className="bg-bg-surface min-h-0 flex-1 overflow-y-auto px-6 pt-6 pb-16">
      <div className="text-text-disabled mx-auto mb-3 flex max-w-[720px] flex-wrap items-center gap-x-3 gap-y-2 text-[12px]">
        <span>Se redacta sola a partir del cálculo: se revisa, no se edita.</span>
        <span className="ml-auto font-mono">en el anejo ✓</span>
        {onFichaPdf && (
          <button
            type="button"
            onClick={onFichaPdf}
            className="border-border-main text-text-secondary hover:text-text-primary inline-flex h-7 items-center gap-1.5 rounded border px-2.5 text-[12px]"
          >
            <FileDown size={13} aria-hidden="true" />
            Ficha PDF
          </button>
        )}
        <button
          type="button"
          onClick={() => void copiar()}
          className="bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg inline-flex h-7 items-center gap-1.5 rounded px-2.5 text-[12px] font-medium"
        >
          {copiado === "si" ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
          {copiado === "si" ? "Copiado" : "Copiar texto"}
        </button>
        <span role="status" className="sr-only">
          {copiado === "si" ? "Texto copiado" : copiado === "error" ? "No se pudo copiar el texto" : ""}
        </span>
      </div>
      <article className="border-border-main bg-bg-primary text-text-primary mx-auto max-w-[720px] rounded-md border px-8 pt-7 pb-5 text-[13.5px] leading-[1.65]">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-semibold">{doc.titulo}</h2>
          <span className="text-text-disabled font-mono text-[11px]">{doc.norma}</span>
        </div>
        {doc.parrafos.map((p, i) => (
          <p key={i} className="mb-3">
            {p.map((t, j) =>
              typeof t === "string" ? (
                <span key={j}>{t}</span>
              ) : (
                <span key={j} className="text-accent font-mono text-[12.5px]">
                  {t.v}
                </span>
              ),
            )}
          </p>
        ))}
        {doc.tabla && (
          <table className="mt-1.5 mb-1 w-full border-collapse">
            <thead>
              <tr>
                {doc.tabla.cabecera.map((c, i) => (
                  <th
                    key={c}
                    scope="col"
                    className={`border-border-main text-text-secondary border-b p-1.5 text-[10px] font-semibold tracking-[0.05em] uppercase ${i === 0 ? "text-left" : "text-right"}`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {doc.tabla.filas.map((f) => (
                <tr key={f[0]}>
                  {f.map((c, i) => (
                    <td
                      key={i}
                      className={`border-border-sub border-b p-1.5 ${i === 0 ? "text-left text-[12.5px]" : "text-right font-mono text-[11.5px]"}`}
                    >
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="border-border-sub text-text-disabled mt-2.5 border-t pt-2.5 font-mono text-[10.5px] leading-relaxed">
          {doc.fuente}
        </div>
      </article>
    </section>
  );
}
