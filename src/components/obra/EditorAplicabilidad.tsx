import { useId, useState, type JSX } from "react";
import { flexibilidadCompleta, motivosDe, notaFlexibilidad } from "../../lib/proyecto/flexibilidad";
import type { Flexibilidad, JustificacionKey, MotivoFlexibilidad } from "../../lib/proyecto/tipos";
import type { AplicabilidadConParrafo } from "./MenuAplicabilidad";

// =============================================================================
// Editor del párrafo de una aplicabilidad forzada, bajo la fila de La obra
// (feature-27, paso 4). «No aplica» y «a lo intervenido»: el párrafo, que parte
// del que propone la herramienta si es el mismo caso. «Con flexibilidad»: motivo,
// por qué, soluciones, nivel y condicionantes, y el párrafo se redacta solo
// (CTE Parte I art. 2.3; research/verificacion-reformas.md, D.0.3).
// =============================================================================

const TITULO: Record<AplicabilidadConParrafo, string> = {
  no_aplica: "No aplica",
  aplica_reformado: "Aplica a lo intervenido",
  aplica_flexibilidad: "Aplica con flexibilidad",
};

const AYUDA: Record<AplicabilidadConParrafo, string> = {
  no_aplica: "El párrafo que irá a la memoria: por qué no es de aplicación, con su cita.",
  aplica_reformado: "A qué partes o elementos se aplica. La justificación se hace sobre ellos.",
  aplica_flexibilidad: "",
};

const CAMPO =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent focus:ring-accent/30 w-full rounded border px-2 py-1 text-[12.5px] leading-snug transition-colors focus:ring-1 focus:outline-none";
const BOTON =
  "rounded border px-2.5 py-1 text-[12px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50";

function Area(props: { id: string; label: string; value: string; onChange: (v: string) => void; filas?: number; placeholder?: string }): JSX.Element {
  return (
    <label htmlFor={props.id} className="mt-2 block">
      <span className="text-text-secondary mb-0.5 block text-[11.5px]">{props.label}</span>
      <textarea
        id={props.id}
        rows={props.filas ?? 2}
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e) => props.onChange(e.target.value)}
        className={CAMPO}
      />
    </label>
  );
}

export function EditorAplicabilidad(props: {
  clave: JustificacionKey;
  /** «HS4 Suministro de agua»: encabeza el párrafo de flexibilidad. */
  nombre: string;
  valor: AplicabilidadConParrafo;
  /** El párrafo de partida (lo forzado, o lo que propone la herramienta). */
  nota?: string;
  flexibilidad?: Flexibilidad;
  onGuardar: (nota: string | undefined, flexibilidad?: Flexibilidad) => void;
  onCancelar: () => void;
}): JSX.Element {
  const { clave, nombre, valor, onGuardar, onCancelar } = props;
  const id = useId();
  const [nota, setNota] = useState(props.nota ?? "");
  const [f, setF] = useState<Partial<Flexibilidad>>(props.flexibilidad ?? {});
  const motivos = motivosDe(clave);
  const set = <K extends keyof Flexibilidad>(k: K, v: Flexibilidad[K]): void => setF((p) => ({ ...p, [k]: v }));

  const flex = valor === "aplica_flexibilidad";
  const completa = flexibilidadCompleta(f);
  const vista = flex && completa ? notaFlexibilidad(clave, nombre, { ...f, condicionantes: f.condicionantes?.trim() || undefined }) : null;

  function guardar(): void {
    if (flex) {
      if (!flexibilidadCompleta(f)) return;
      const limpia: Flexibilidad = { ...f, condicionantes: f.condicionantes?.trim() || undefined };
      onGuardar(notaFlexibilidad(clave, nombre, limpia), limpia);
    } else {
      onGuardar(nota.trim() !== "" ? nota.trim() : undefined);
    }
  }

  return (
    <div role="group" aria-label={`${TITULO[valor]}: ${nombre}`} className="bg-bg-surface border-border-sub mx-3.5 mb-3 rounded border px-3 py-2.5 md:ml-[166px]">
      <p className="text-text-primary text-[12.5px] font-semibold">{TITULO[valor]}</p>
      {flex ? (
        <>
          <p className="text-text-disabled mt-0.5 text-[11px] leading-snug">
            Cuando el cumplimiento pleno no es viable o es incompatible con la intervención o con la protección del edificio, se
            justifican las soluciones que permiten la mayor adecuación posible, bajo el criterio del proyectista.
          </p>
          <label htmlFor={`${id}-motivo`} className="mt-2 block">
            <span className="text-text-secondary mb-0.5 block text-[11.5px]">Motivo</span>
            <select
              id={`${id}-motivo`}
              value={f.motivo ?? ""}
              onChange={(e) => set("motivo", e.target.value as MotivoFlexibilidad)}
              className={CAMPO}
            >
              <option value="" disabled>
                Elige el motivo
              </option>
              {motivos.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <Area id={`${id}-porque`} label="Por qué" value={f.porque ?? ""} onChange={(v) => set("porque", v)} placeholder="Qué lo impide en este edificio" />
          <Area id={`${id}-soluciones`} label="Soluciones que se adoptan" value={f.soluciones ?? ""} onChange={(v) => set("soluciones", v)} />
          <Area id={`${id}-nivel`} label="Nivel de prestación que se alcanza" value={f.nivel ?? ""} onChange={(v) => set("nivel", v)} filas={1} />
          <Area
            id={`${id}-cond`}
            label="Condicionantes de uso y mantenimiento (si los hay)"
            value={f.condicionantes ?? ""}
            onChange={(v) => set("condicionantes", v)}
            filas={1}
          />
          {vista && <p className="text-text-secondary border-border-sub mt-2 border-t pt-2 text-[12px] leading-relaxed">{vista}</p>}
        </>
      ) : (
        <Area id={`${id}-nota`} label={AYUDA[valor]} value={nota} onChange={setNota} filas={4} />
      )}
      <div className="mt-2.5 flex justify-end gap-2">
        <button type="button" onClick={onCancelar} className={`${BOTON} border-border-main text-text-secondary hover:text-text-primary`}>
          Cancelar
        </button>
        <button
          type="button"
          onClick={guardar}
          disabled={flex && !completa}
          className={`${BOTON} border-accent bg-accent hover:bg-accent-hover text-bg-primary`}
        >
          Guardar
        </button>
      </div>
    </div>
  );
}
