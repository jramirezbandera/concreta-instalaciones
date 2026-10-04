// =============================================================================
// Descargar un fichero generado en el cliente (feature-16). Port de
// `src/lib/export/descargar.ts` de Concreta, con sus dos bugs ya pagados: el
// ancla tiene que estar en el documento antes del `click()` (Firefox y Safari
// ignoran `download` en anclas sueltas) y la URL se revoca DESPUÉS, por
// temporizador, o la descarga se aborta en el mismo tick.
// =============================================================================

/** Margen para que el navegador lea el blob antes de revocarlo. */
export const REVOKE_DELAY_MS = 1000;

export function descargarUrl(url: string, filename: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function descargarBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  descargarUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS);
}
