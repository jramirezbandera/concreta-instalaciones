// Encaje de un dibujo en su lienzo (REDISENO-V4 §3.3): el SVG cabe ENTERO, con
// la proporción de su tamaño nativo, sin pasar de un ancho máximo. Lo usan los
// módulos dentro de <LienzoAjustado>, que mide la caja disponible.

export interface Caja {
  ancho: number;
  alto: number;
}

/**
 * Tamaño que encaja un dibujo de proporción `nativeW × nativeH` dentro de `caja`,
 * sin pasar de `max` px de ancho (los dibujos pequeños no se inflan sin fin).
 */
export function ajustar(
  nativeW: number,
  nativeH: number,
  caja: Caja,
  opciones: { max?: number; min?: number } = {},
): { width: number; height: number } {
  const { max = 960, min = 240 } = opciones;
  if (!(nativeW > 0) || !(nativeH > 0)) return { width: min, height: min };
  const escala = Math.min(
    caja.ancho / nativeW,
    caja.alto / nativeH,
    max / nativeW,
  );
  const width = Math.max(min, Math.round(nativeW * escala));
  return { width, height: Math.round((width * nativeH) / nativeW) };
}
