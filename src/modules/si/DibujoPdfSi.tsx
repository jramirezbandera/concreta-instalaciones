// DB-SI — El dibujo de una sección en papel (feature-19), para el clon oculto
// que rasteriza la ficha. Lo montan la pantalla común y el generador del anejo.

import type { JSX } from "react";
import { estadosElementos } from "../../lib/cte/estados";
import type { Edificio } from "../../lib/edificio/tipos";
import type { DefinicionSi } from "./definicion";
import { SeccionSi } from "./SeccionSi";
import type { JustificacionSiBase } from "./tipos";

export function DibujoPdfSi<E extends Record<string, unknown>, J extends JustificacionSiBase>({
  def,
  j,
  edificio,
  revisados,
  width,
  height,
}: {
  def: DefinicionSi<E, J>;
  j: J;
  edificio: Edificio;
  revisados: readonly string[];
  width: number;
  height: number;
}): JSX.Element {
  const estados = estadosElementos(j.elementos, j.avisos, revisados);
  const textos = Object.fromEntries(j.elementos.map((el) => [el.id, def.etiqueta(el)]));
  return (
    <SeccionSi
      dibujo={def.dibujo(j, edificio)}
      mode="pdf"
      width={width}
      height={height}
      titulo={`${def.sujeto} (DB-SI): ${def.tituloDibujo.toLowerCase()}`}
      descripcion={def.describirDibujo(j)}
      estados={estados}
      textos={textos}
    />
  );
}
