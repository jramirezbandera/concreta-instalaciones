import { useEffect } from "react";
import { FileText, X, Download } from "lucide-react";

interface PdfPreviewModalProps {
  blobUrl: string;
  filename: string;
  pageCount: number;
  onDownload: () => void;
  onClose: () => void;
}

export function PdfPreviewModal({ blobUrl, pageCount, onClose, onDownload }: PdfPreviewModalProps) {
  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="bg-bg-surface flex h-[90vh] w-[95vw] max-w-6xl flex-col rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-border-main flex shrink-0 items-center gap-3 border-b px-5 py-3">
          <FileText size={16} className="text-text-secondary" />
          <span className="text-text-primary text-sm font-medium">Previsualización PDF</span>
          <span className="text-text-secondary text-xs">
            A4 · {pageCount} página{pageCount !== 1 ? "s" : ""}
          </span>
          <div className="flex-1" />
          <button
            onClick={onDownload}
            className="bg-bg-elevated hover:bg-bg-primary border-border-main text-text-primary flex items-center gap-1.5 rounded border px-4 py-1.5 text-sm transition-colors"
          >
            <Download size={14} />
            Descargar
          </button>
          <button
            onClick={onClose}
            className="hover:bg-bg-elevated text-text-secondary hover:text-text-primary rounded p-1.5 transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        </div>

        {/* PDF iframe */}
        <iframe
          src={blobUrl}
          className="min-h-0 w-full flex-1 rounded-b-lg bg-white"
          title="PDF preview"
        />
      </div>
    </div>
  );
}
