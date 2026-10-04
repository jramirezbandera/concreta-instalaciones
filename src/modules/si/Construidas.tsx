// DB-SI — La decisión «Superficie construida» (feature-19), común a las
// secciones que la necesitan: las zonas cuya superficie construida decide algo
// (o ya indicada), cada una con su campo. Escribe en la zona de El edificio.

import type { JSX } from "react";
import { DecisionValor } from "../../components/justificacion/Decision";
import { CampoNumero } from "../../components/edificio/controles";
import type { Edificio } from "../../lib/edificio/tipos";
import { USOS } from "../../lib/edificio/usos";
import type { ZonaSi } from "./edificio";
import { cambiarZonaSi } from "./editar";
import { m2 } from "./textos";

export function Construidas({
  numero,
  zonas,
  edificio,
  cambiarEdificio,
  texto,
}: {
  numero: number;
  zonas: readonly ZonaSi[];
  edificio: Edificio;
  cambiarEdificio: (e: Edificio) => void;
  texto: string;
}): JSX.Element {
  const supuestas = zonas.filter((z) => z.construida.supuesto).length;
  return (
    <DecisionValor
      numero={numero}
      pregunta="Superficie construida"
      marca={supuestas > 0 ? { texto: supuestas === zonas.length ? "supuesta" : `${supuestas} supuestas`, aviso: true } : { texto: "indicada" }}
      control={
        <div className="flex w-full flex-col gap-1.5">
          {zonas.map((z) => {
            const id = `si-construida-${z.id}`;
            return (
              <div key={z.id} className="flex items-center justify-between gap-2">
                <label htmlFor={id} className="text-text-secondary min-w-0 text-[12px]">
                  {USOS[z.uso].etiqueta} · {z.plantas}
                  <span className="text-text-disabled"> · útil {m2(z.util_m2)}{z.repeticiones > 1 ? " por planta" : ""}</span>
                </label>
                <CampoNumero
                  id={id}
                  value={z.construida.valor}
                  unidad="m²"
                  onChange={(v) => cambiarEdificio(cambiarZonaSi(edificio, z.id, { superficieConstruida_m2: v > 0 ? v : undefined }))}
                />
              </div>
            );
          })}
        </div>
      }
      texto={texto}
    />
  );
}
