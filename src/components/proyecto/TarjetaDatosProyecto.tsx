import type { JSX, ReactNode } from "react";
import { Link } from "react-router";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import type { Intervencion, TipoCubierta, Uso } from "../../lib/proyecto/tipos";

// Tarjeta "Datos del proyecto" del carril derecho (feature-6 T3.5, UX-RECONCEPT
// §4.2): los atributos discriminantes en pares clave/valor + el contexto
// derivado del municipio en pequeño (con procedencia en title) + enlace a la
// subruta relativa `datos` para editarlos.

/** Etiquetas legibles (locales al componente, sin export — patrón Sidebar). */
const USO_LABEL: Record<Uso, string> = {
  vivienda_unifamiliar: "Vivienda unifamiliar",
  vivienda_colectiva: "Vivienda colectiva",
};

const INTERVENCION_LABEL: Record<Intervencion, string> = {
  obra_nueva: "Obra nueva",
  reforma: "Reforma",
  ampliacion: "Ampliación",
  cambio_uso: "Cambio de uso",
};

const CUBIERTA_LABEL: Record<TipoCubierta, string> = {
  plana_transitable: "Plana transitable",
  plana_no_transitable: "Plana no transitable",
  inclinada: "Inclinada",
};

/** Fila clave/valor densa (patrón de las tablas de resultados de módulo). */
function Par({ clave, children }: { clave: string; children: ReactNode }): JSX.Element {
  return (
    <div className="border-border-sub flex items-baseline justify-between gap-3 border-b py-1 last:border-b-0">
      <dt className="text-text-secondary text-[12px]">{clave}</dt>
      <dd className="text-text-primary text-right text-[12px] tabular-nums">{children}</dd>
    </div>
  );
}

export function TarjetaDatosProyecto(): JSX.Element {
  const { proyecto, derivados } = useProyecto();
  const dg = proyecto.datosGenerales;

  const dotaciones =
    [
      dg.tieneGaraje ? "garaje" : null,
      dg.tieneTrasteros ? "trasteros" : null,
      dg.tienePiscina ? "piscina" : null,
      dg.tieneLocalPB ? "local en PB" : null,
    ]
      .filter((d): d is string => d !== null)
      .join(" · ") || "—";

  const procedencias = [
    `Zona climática: ${derivados.zonaClimatica.procedencia}`,
    `Zona térmica HS3: ${derivados.zonaTermicaHS3.procedencia}`,
    `Altura de evacuación: ${derivados.alturaEvacuacion_m.procedencia}`,
  ].join("\n");

  return (
    <section
      aria-label="Datos del proyecto"
      className="border-border-main bg-bg-surface rounded border p-3"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-text-primary text-[13px] font-semibold">Datos del proyecto</h2>
        <Link
          to="datos"
          className="text-accent hover:text-accent-hover focus-visible:outline-accent text-[12px] transition-colors focus-visible:outline-2"
        >
          Editar
        </Link>
      </div>

      <dl className="mt-2">
        <Par clave="Municipio">
          {dg.municipio} ({dg.provincia})
        </Par>
        <Par clave="Altitud">{dg.altitud_m} m</Par>
        <Par clave="Uso">{USO_LABEL[dg.uso]}</Par>
        <Par clave="Intervención">{INTERVENCION_LABEL[dg.intervencion]}</Par>
        <Par clave="Plantas">
          {dg.plantasSobreRasante} SR + {dg.plantasBajoRasante} BR
        </Par>
        <Par clave="Cubierta">{CUBIERTA_LABEL[dg.tipoCubierta]}</Par>
        <Par clave="Viviendas">{dg.numViviendas}</Par>
        <Par clave="Dotaciones">{dotaciones}</Par>
        <Par clave="Zona de radón">{dg.zonaRadon}</Par>
        {dg.presionAcometida_kPa !== undefined && (
          <Par clave="Presión acometida">{dg.presionAcometida_kPa} kPa</Par>
        )}
      </dl>

      <p title={procedencias} className="text-text-disabled mt-2 cursor-help text-[11px]">
        Derivado del municipio: zona climática {derivados.zonaClimatica.valor} · zona térmica{" "}
        {derivados.zonaTermicaHS3.valor} · alt. evacuación {derivados.alturaEvacuacion_m.valor} m
      </p>
    </section>
  );
}
