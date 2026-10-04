import type { JSX } from "react";
import { anadirTipo } from "../../lib/edificio/editar";
import { resumenCifrasTipo } from "../../lib/edificio/deducciones";
import type { Edificio, UnidadTipo } from "../../lib/edificio/tipos";
import type { Seleccion } from "./presentacion";

// =============================================================================
// «Lo que se repite» (feature-12, bajo la sección en la maqueta v4): una tarjeta
// por vivienda tipo o núcleo de aseos, con su programa y las cifras que se
// deducen. Pulsar una tarjeta la edita a la izquierda.
// =============================================================================

function programa(t: UnidadTipo): string {
  if (t.clase === "nucleo_aseos") return `${t.inodoros} inodoros · ${t.lavabos} lavabos`;
  return [
    `${t.dormitorios} dorm.`,
    `${t.banos} ${t.banos === 1 ? "baño" : "baños"}`,
    ...(t.aseos > 0 ? [`${t.aseos} ${t.aseos === 1 ? "aseo" : "aseos"}`] : []),
    "cocina",
  ].join(" · ");
}

function titulo(t: UnidadTipo): string {
  const sup = `${Math.round(t.superficieUtil_m2)} m²`;
  return t.clase === "vivienda" ? `T${t.dormitorios} · ${sup}` : `Aseos de planta · ${sup}`;
}

export function TiposRepetidos(props: {
  edificio: Edificio;
  seleccion: Seleccion | null;
  onCambiar: (e: Edificio) => void;
  onSeleccionar: (s: Seleccion) => void;
}): JSX.Element {
  const { edificio: e, seleccion, onCambiar, onSeleccionar } = props;
  const soloNucleos = e.unidades.length > 0 && e.unidades.every((u) => u.clase === "nucleo_aseos");
  const hayOficinas = e.grupos.some((g) => g.zonas.some((z) => z.uso === "oficinas"));
  const hayViviendas = e.grupos.some((g) =>
    g.zonas.some((z) => z.uso === "viviendas" || z.uso === "vivienda_unifamiliar"),
  );

  const anadir = (clase: UnidadTipo["clase"]) => {
    const r = anadirTipo(e, clase);
    onCambiar(r.edificio);
    onSeleccionar({ tipo: "unidad", id: r.tipoId });
  };

  return (
    <section aria-labelledby="tipos-titulo" className="border-border-main border-t px-6 pt-1 pb-6">
      <div className="text-text-disabled flex items-baseline justify-between gap-2 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.09em] uppercase">
        <h2 id="tipos-titulo">
          {soloNucleos ? "Núcleos de aseos · lo que se repite" : "Viviendas tipo · lo que se repite"}
        </h2>
        <span className="text-[11.5px] font-medium tracking-normal normal-case">
          {soloNucleos
            ? "cada planta de oficinas dice cuántos lleva"
            : "cada zona de viviendas dice qué tipos lleva"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {e.unidades.map((t) => {
          const sel = seleccion?.tipo === "unidad" && seleccion.id === t.id;
          return (
            <button
              key={t.id}
              type="button"
              aria-pressed={sel}
              aria-label={`${t.clase === "vivienda" ? "Tipo" : "Núcleo"} ${t.nombre}: ${titulo(t)}, ${programa(t)}, ${resumenCifrasTipo(t)}`}
              onClick={() => onSeleccionar({ tipo: "unidad", id: t.id })}
              className={[
                "bg-bg-primary grid max-w-[340px] flex-[1_1_230px] grid-cols-[30px_minmax(0,1fr)] gap-x-2.5 gap-y-[3px] rounded border px-3.5 py-3 text-left transition-colors",
                sel
                  ? "border-accent shadow-[inset_3px_0_0_var(--color-accent)]"
                  : "border-border-main hover:border-text-disabled",
              ].join(" ")}
            >
              <span
                aria-hidden="true"
                className="bg-bg-elevated text-text-primary row-span-3 flex h-[30px] w-[30px] items-center justify-center rounded font-mono text-[13px] font-semibold"
              >
                {t.nombre.slice(0, 3)}
              </span>
              <b className="text-text-primary text-[13px] font-semibold">{titulo(t)}</b>
              <span className="text-text-secondary text-[12px]">{programa(t)}</span>
              <em className="text-accent font-mono text-[11px] not-italic">{resumenCifrasTipo(t)}</em>
            </button>
          );
        })}
        {(hayViviendas || !hayOficinas) && (
          <button
            type="button"
            onClick={() => anadir("vivienda")}
            className="border-border-main text-text-secondary hover:text-text-primary min-h-[76px] flex-[0_1_160px] rounded border border-dashed text-[12.5px] transition-colors"
          >
            + Añadir tipo de vivienda
          </button>
        )}
        {hayOficinas && (
          <button
            type="button"
            onClick={() => anadir("nucleo_aseos")}
            className="border-border-main text-text-secondary hover:text-text-primary min-h-[76px] flex-[0_1_160px] rounded border border-dashed text-[12.5px] transition-colors"
          >
            + Añadir núcleo de aseos
          </button>
        )}
      </div>
    </section>
  );
}
