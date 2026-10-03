import { Menu, FileDown, Loader2, Share2, RotateCcw } from "lucide-react";
import { ThemeToggle } from "../theme/ThemeToggle";

interface TopbarProps {
  moduleLabel: string;
  moduleGroup: string;
  onExportPdf?: () => void;
  pdfExporting?: boolean;
  onShare?: () => void;
  onReset?: () => void;
  onMenuOpen: () => void;
}

export function Topbar({
  moduleLabel,
  moduleGroup,
  onExportPdf,
  pdfExporting,
  onShare,
  onReset,
  onMenuOpen,
}: TopbarProps) {
  return (
    <header className="border-border-main bg-bg-surface flex h-12 shrink-0 items-center gap-2 border-b px-4 lg:px-6">
      <button
        onClick={onMenuOpen}
        className="text-text-secondary hover:text-text-primary -ml-1 p-1 lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu size={18} />
      </button>
      <div className="flex min-w-0 items-baseline gap-2">
        {moduleGroup && (
          <>
            <span className="text-text-disabled truncate font-mono text-[11px] tracking-[0.06em] uppercase max-sm:hidden">
              {moduleGroup}
            </span>
            <span className="text-text-disabled max-sm:hidden" aria-hidden="true">
              /
            </span>
          </>
        )}
        <span className="text-text-primary truncate text-[13px] font-medium">{moduleLabel}</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-0.5">
        {onReset && (
          <button
            onClick={onReset}
            className="text-text-secondary hover:bg-bg-elevated hover:text-text-primary flex h-8 items-center gap-1.5 rounded px-2.5 py-1.5 text-[13px] transition-colors"
            title="Restablecer valores"
          >
            <RotateCcw size={14} />
            <span className="max-md:hidden">Reset</span>
          </button>
        )}
        {onShare && (
          <button
            onClick={onShare}
            className="text-text-secondary hover:bg-bg-elevated hover:text-text-primary flex h-8 items-center gap-1.5 rounded px-2.5 py-1.5 text-[13px] transition-colors"
            title="Copiar enlace con los datos"
          >
            <Share2 size={14} />
            <span className="max-md:hidden">Compartir</span>
          </button>
        )}
        <ThemeToggle />
        {onExportPdf && (
          <button
            onClick={onExportPdf}
            disabled={pdfExporting}
            aria-label="Ficha PDF"
            className="bg-btn-primary-bg hover:bg-btn-primary-bg-hover text-btn-primary-fg ml-1 flex h-8 items-center gap-1.5 rounded px-3 text-[13px] font-medium whitespace-nowrap transition-colors disabled:opacity-60"
          >
            {pdfExporting ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
            <span className="max-sm:hidden">Ficha PDF</span>
          </button>
        )}
      </div>
    </header>
  );
}
