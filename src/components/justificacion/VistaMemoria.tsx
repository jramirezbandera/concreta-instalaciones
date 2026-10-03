import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Download, Loader2 } from "lucide-react";
import type { PdfResult } from "../../lib/pdf/utils";

// =============================================================================
// Vista «Memoria» (REDISENO-V4 §3.3): lo que esta justificación aporta al anejo,
// sin edición. Hoy es la ficha justificativa en PDF, generada al abrir la
// pestaña con los datos del momento; el texto redactado de la memoria llegará
// cuando los motores devuelvan su explicación estructurada (§3.2).
// =============================================================================

interface VistaMemoriaProps {
  /** Genera la ficha con los datos actuales. Se llama una vez al abrir la vista. */
  generar: () => Promise<PdfResult>;
  /** false → los datos no permiten calcular: no hay ficha que enseñar. */
  valid: boolean;
}

type Estado =
  | { fase: "generando" }
  | { fase: "lista"; pdf: PdfResult }
  | { fase: "error" };

export function VistaMemoria({
  generar,
  valid,
}: VistaMemoriaProps): JSX.Element {
  const [estado, setEstado] = useState<Estado>({ fase: "generando" });

  // Una generación por apertura de la pestaña: `generar` cambia en cada render
  // del módulo y no debe relanzarla. La URL del blob se libera al salir.
  useEffect(() => {
    if (!valid) return;
    let vivo = true;
    let url: string | null = null;
    generar().then(
      (pdf) => {
        url = pdf.blobUrl;
        if (vivo) setEstado({ fase: "lista", pdf });
        else URL.revokeObjectURL(pdf.blobUrl);
      },
      () => {
        if (vivo) setEstado({ fase: "error" });
      },
    );
    return () => {
      vivo = false;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- una vez por apertura (ver arriba)
  }, [valid]);

  return (
    <div className="bg-bg-surface flex min-h-0 flex-1 flex-col px-6 pt-5 pb-6">
      <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-text-secondary min-w-0 flex-1 text-[13px] leading-snug">
            Es la ficha que va al anejo. No se edita: si cambias los datos, se
            rehace.
          </p>
          {estado.fase === "lista" && (
            <a
              href={estado.pdf.blobUrl}
              download={estado.pdf.filename}
              className="bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg flex items-center gap-1.5 rounded px-3 py-1.5 text-[13px] font-medium transition-colors"
            >
              <Download size={14} aria-hidden="true" />
              Descargar PDF
            </a>
          )}
        </div>

        <div className="border-border-main bg-bg-primary flex min-h-[480px] flex-1 items-center justify-center rounded-md border">
          {!valid ? (
            <p className="text-text-disabled px-6 text-center text-[13px]">
              Con los datos actuales no se puede calcular, así que todavía no
              hay ficha.
            </p>
          ) : estado.fase === "generando" ? (
            <p className="text-text-disabled flex items-center gap-2 text-[13px]">
              <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              Preparando la ficha…
            </p>
          ) : estado.fase === "error" ? (
            <p className="text-state-fail px-6 text-center text-[13px]">
              No se pudo generar la ficha. Prueba con «Ficha PDF» arriba.
            </p>
          ) : (
            <iframe
              title="Ficha justificativa"
              src={estado.pdf.blobUrl}
              className="h-full min-h-[480px] w-full rounded-md"
            />
          )}
        </div>
      </div>
    </div>
  );
}
