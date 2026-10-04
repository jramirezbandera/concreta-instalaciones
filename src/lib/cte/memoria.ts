// =============================================================================
// La memoria redactada como texto plano (feature-15 §A): lo que copia «Copiar
// texto». Común a todos los módulos. PURA.
// =============================================================================

import type { MemoriaDoc, Trozo } from "./presentacion";

/** El párrafo como texto plano. */
export function textoParrafo(p: Trozo[]): string {
  return p
    .map((t) => (typeof t === "string" ? t : t.v))
    .join("")
    .trim();
}

/** La memoria entera como texto plano, lista para pegar. */
export function textoPlanoMemoria(m: MemoriaDoc): string {
  const partes = [m.titulo, ...m.parrafos.map(textoParrafo)];
  if (m.tabla) partes.push([m.tabla.cabecera, ...m.tabla.filas].map((f) => f.join("\t")).join("\n"));
  partes.push(m.fuente);
  return partes.join("\n\n");
}
