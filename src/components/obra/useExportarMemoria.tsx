import { useEffect, useState, type ReactNode } from "react";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { bloquesMemoria, memoriaCte, nombreArchivoMemoria } from "../../lib/obra/memoria";
import { descargarBlob, descargarUrl } from "../../lib/export/descargar";
import { formatearFecha } from "../../lib/ui/fecha";
import type { PdfResult } from "../../lib/pdf/utils";
import { PdfPreviewModal } from "../ui/PdfPreviewModal";
import { showToast } from "../ui/Toast";

// =============================================================================
// Exportar la memoria CTE (feature-16 §D y §E): Word y PDF, con las librerías
// cargadas bajo demanda (ni `docx` ni jsPDF entran en el bundle de La obra).
// El PDF se abre en la previsualización, como el anejo; el Word se descarga.
// Lo usan la tarjeta de La obra y la página de la memoria.
// =============================================================================

export interface ExportarMemoria {
  word: () => void;
  pdf: () => void;
  ocupado: "word" | "pdf" | null;
  /** La previsualización del PDF, para montarla donde se use el hook. */
  modal: ReactNode;
}

export function useExportarMemoria(): ExportarMemoria {
  const { proyecto } = useProyecto();
  const [ocupado, setOcupado] = useState<"word" | "pdf" | null>(null);
  const [pdf, setPdf] = useState<PdfResult | null>(null);

  // Revoca el blob al desmontar o al sustituirlo.
  useEffect(() => {
    return () => {
      if (pdf) URL.revokeObjectURL(pdf.blobUrl);
    };
  }, [pdf]);

  const bloques = () => bloquesMemoria(memoriaCte(proyecto), formatearFecha(proyecto.modificado));

  const word = async () => {
    setOcupado("word");
    try {
      const { memoriaDocx } = await import("../../lib/docx/render");
      const blob = await memoriaDocx(bloques(), proyecto.nombre);
      descargarBlob(blob, nombreArchivoMemoria(proyecto.nombre, "docx"));
    } catch {
      showToast("No se pudo generar el Word de la memoria", { autoDismiss: 4000 });
    } finally {
      setOcupado(null);
    }
  };

  const abrirPdf = async () => {
    setOcupado("pdf");
    try {
      const { renderMemoriaPdf } = await import("../../lib/pdf/memoria");
      setPdf(renderMemoriaPdf(bloques(), proyecto.nombre));
    } catch {
      showToast("No se pudo generar el PDF de la memoria", { autoDismiss: 4000 });
    } finally {
      setOcupado(null);
    }
  };

  const modal = pdf ? (
    <PdfPreviewModal
      blobUrl={pdf.blobUrl}
      filename={pdf.filename}
      pageCount={pdf.pageCount}
      onDownload={() => descargarUrl(pdf.blobUrl, pdf.filename)}
      onClose={() => setPdf(null)}
    />
  ) : null;

  return { word: () => void word(), pdf: () => void abrirPdf(), ocupado, modal };
}
