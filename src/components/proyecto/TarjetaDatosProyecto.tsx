import type { JSX, ReactNode } from "react";
import { Link } from "react-router";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { etiquetaEdificio } from "../../lib/edificio/derivar";
import type { Intervencion, TipoCubierta } from "../../lib/proyecto/tipos";

// Tarjeta "Datos del proyecto" del carril derecho (feature-6 T3.5, UX-RECONCEPT
// §4.2; feature-12): la obra (emplazamiento, intervención, suministro) y un
// resumen de El edificio, cada uno con su enlace para editarlo. El contexto
// derivado va en pequeño, con la procedencia en `title`.

/** Etiquetas legibles (locales al componente, sin export — patrón Sidebar). */
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

function Cabecera({ titulo, to, accion }: { titulo: string; to: string; accion: string }): JSX.Element {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <h2 className="text-text-primary text-[13px] font-semibold">{titulo}</h2>
      <Link
        to={to}
        className="text-accent hover:text-accent-hover focus-visible:outline-accent text-[12px] transition-colors focus-visible:outline-2"
      >
        {accion}
      </Link>
    </div>
  );
}

export function TarjetaDatosProyecto(): JSX.Element {
  const { proyecto, derivados } = useProyecto();
  const dg = proyecto.datosGenerales;
  const ed = derivados.edificio;

  const dotaciones =
    [
      ed.tieneGaraje ? "garaje" : null,
      ed.tieneTrasteros ? "trasteros" : null,
      ed.tieneLocalPB ? "local en PB" : null,
      dg.tienePiscina ? "piscina" : null,
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
      <Cabecera titulo="La obra" to="datos" accion="Editar" />
      <dl className="mt-2">
        <Par clave="Municipio">
          {dg.municipio} ({dg.provincia})
        </Par>
        <Par clave="Altitud">{dg.altitud_m} m</Par>
        <Par clave="Intervención">{INTERVENCION_LABEL[dg.intervencion]}</Par>
        <Par clave="Zona de radón">{dg.zonaRadon}</Par>
        {dg.presionAcometida_kPa !== undefined && (
          <Par clave="Presión acometida">{dg.presionAcometida_kPa} kPa</Par>
        )}
      </dl>

      <div className="mt-4">
        <Cabecera titulo="El edificio" to="edificio" accion="Abrir" />
      </div>
      <dl className="mt-2">
        <Par clave="Tipo">{etiquetaEdificio(ed)}</Par>
        <Par clave="Plantas">
          {ed.plantasSobreRasante} SR + {ed.plantasBajoRasante} BR
        </Par>
        <Par clave="Cubierta">{CUBIERTA_LABEL[ed.tipoCubierta]}</Par>
        <Par clave="Viviendas">{ed.numViviendas}</Par>
        <Par clave="Dotaciones">{dotaciones}</Par>
      </dl>

      <p title={procedencias} className="text-text-disabled mt-2 cursor-help text-[11px]">
        Derivado: zona climática {derivados.zonaClimatica.valor} · zona térmica{" "}
        {derivados.zonaTermicaHS3.valor} · alt. evacuación {derivados.alturaEvacuacion_m.valor} m
      </p>
    </section>
  );
}
