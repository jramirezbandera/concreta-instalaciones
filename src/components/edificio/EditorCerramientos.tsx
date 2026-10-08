import type { JSX } from "react";
import {
  cerramientosDe,
  elegir,
  elegirVentana,
  eleccionesDe,
  plantaBajaDistinta,
  plantaBajaEnHe1,
  setCerramientos,
  setPlantaBajaDistinta,
} from "../../lib/constructivo/cerramientos";
import { deCategoria, type ClaseFachada } from "../../lib/constructivo/catalogo";
import { MARCOS, type EleccionVentana, type Marco } from "../../lib/constructivo/tipos";
import type { Edificio } from "../../lib/edificio/tipos";
import { Fila, LoUsan, Sub, Tarjeta } from "./controles";
import { lineaFachada, lineaForjado, lineaVentana } from "./presentacion";

// =============================================================================
// Los cerramientos del edificio (feature-26): la fachada, la ventana, la
// cubierta y el forjado, del Catálogo de Elementos Constructivos, y la fachada
// y la ventana de la planta baja si son distintas. Se eligen aquí una vez; el
// espesor del aislante y el vidrio siguen siendo decisiones de HE1, y los
// valores propios (de ensayo o de fabricante), de HR.
// =============================================================================

const SELECT =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent h-[34px] w-full rounded border px-2 text-[13px] focus:outline-none";

const GRUPOS_FACHADA: { clase: ClaseFachada; etiqueta: string }[] = [
  { clase: "dos_hojas", etiqueta: "Dos hojas" },
  { clase: "una_hoja", etiqueta: "Una hoja con SATE" },
  { clase: "ventilada", etiqueta: "Ventilada sobre una hoja" },
];

function Linea({ children }: { children: string }): JSX.Element {
  return <span className="text-text-secondary font-mono text-[11px] leading-snug tabular-nums">{children}</span>;
}

function SelectFachada(props: { id: string; valor: string; onChange: (id: string) => void }): JSX.Element {
  const fachadas = deCategoria("fachada");
  return (
    <select id={props.id} value={props.valor} onChange={(ev) => props.onChange(ev.target.value)} className={SELECT}>
      {GRUPOS_FACHADA.map((g) => (
        <optgroup key={g.clase} label={g.etiqueta}>
          {fachadas
            .filter((f) => f.clase === g.clase)
            .map((f) => (
              <option key={f.id} value={f.id}>
                {f.codigo} · {f.nombre}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}

/** La ventana y su marco. */
function Ventana(props: {
  id: string;
  etiqueta: string;
  etiquetaMarco: string;
  eleccion: EleccionVentana;
  onChange: (v: EleccionVentana) => void;
}): JSX.Element {
  const { id, etiqueta, etiquetaMarco, eleccion, onChange } = props;
  const sol = deCategoria("ventana").find((v) => v.id === eleccion.id) ?? deCategoria("ventana")[0];
  return (
    <>
      <Fila etiqueta={etiqueta} htmlFor={id} columna>
        <select
          id={id}
          value={sol.id}
          onChange={(ev) => onChange(elegirVentana(eleccion, { id: ev.target.value }))}
          className={SELECT}
        >
          {deCategoria("ventana").map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre}
            </option>
          ))}
        </select>
        <Linea>{lineaVentana(sol)}</Linea>
      </Fila>
      <Fila etiqueta={etiquetaMarco} htmlFor={`${id}-marco`} columna>
        <select
          id={`${id}-marco`}
          value={eleccion.marco}
          onChange={(ev) => onChange(elegirVentana(eleccion, { marco: ev.target.value as Marco }))}
          className={SELECT}
        >
          {(Object.keys(MARCOS) as Marco[]).map((m) => (
            <option key={m} value={m}>
              {MARCOS[m].nombre}
            </option>
          ))}
        </select>
      </Fila>
    </>
  );
}

const OPCIONES_PB: { valor: boolean; label: string }[] = [
  { valor: false, label: "La misma" },
  { valor: true, label: "Distinta" },
];

export function EditorCerramientos(props: { edificio: Edificio; onCambiar: (e: Edificio) => void }): JSX.Element {
  const { edificio: e, onCambiar } = props;
  const c = eleccionesDe(e);
  const r = cerramientosDe(e);
  const pb = plantaBajaDistinta(c);
  const cubiertas = deCategoria("cubierta").filter((s) => s.tipo === e.cubierta.tipo);

  return (
    <Tarjeta k="Cerramientos" titulo="Fachada, ventana, cubierta y forjado">
      <p className="text-text-secondary px-3.5 pb-3 text-[12px] leading-snug">
        {r.supuestos
          ? "Son los habituales. Cámbialos si el proyecto lleva otros: se eligen aquí una vez, del Catálogo de Elementos Constructivos."
          : "Del Catálogo de Elementos Constructivos. Se eligen aquí una vez para todo el edificio."}
      </p>

      <Fila etiqueta="Fachada" htmlFor="ed-cer-fachada" columna>
        <SelectFachada
          id="ed-cer-fachada"
          valor={r.fachada.sol.id}
          onChange={(id) => onCambiar(setCerramientos(e, { fachada: elegir(c.fachada, id) }))}
        />
        <Linea>{lineaFachada(r.fachada.sol)}</Linea>
      </Fila>

      <Ventana
        id="ed-cer-ventana"
        etiqueta="Ventana"
        etiquetaMarco="Marco"
        eleccion={c.ventana}
        onChange={(v) => onCambiar(setCerramientos(e, { ventana: v }))}
      />

      <Fila etiqueta="Cubierta" htmlFor={cubiertas.length > 1 ? "ed-cer-cubierta" : undefined} columna>
        {cubiertas.length > 1 ? (
          <select
            id="ed-cer-cubierta"
            value={r.cubierta.sol.id}
            onChange={(ev) => onCambiar(setCerramientos(e, { cubierta: elegir(r.cubierta.eleccion, ev.target.value) }))}
            className={SELECT}
          >
            {cubiertas.map((s) => (
              <option key={s.id} value={s.id}>
                {s.codigo} · {s.nombre}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-text-primary text-[13px]">{r.cubierta.sol.nombre}</span>
        )}
        <Linea>{`sobre el forjado de abajo · CEC ${r.cubierta.sol.codigo}, p. ${r.cubierta.sol.pagina}`}</Linea>
      </Fila>

      <Fila etiqueta="Forjado" htmlFor="ed-cer-forjado" columna>
        <select
          id="ed-cer-forjado"
          value={r.forjado.sol.id}
          onChange={(ev) => onCambiar(setCerramientos(e, { forjado: elegir(c.forjado, ev.target.value) }))}
          className={SELECT}
        >
          {deCategoria("forjado").map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
        <Linea>{lineaForjado(r.forjado.sol)}</Linea>
      </Fila>

      <Sub>Planta baja</Sub>
      <Fila etiqueta="Fachada y ventana">
        <div
          role="group"
          aria-label="Planta baja"
          className="border-border-main bg-bg-surface flex gap-0.5 rounded border p-0.5"
        >
          {OPCIONES_PB.map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={pb === o.valor}
              onClick={() => onCambiar(setPlantaBajaDistinta(e, o.valor))}
              className={[
                "h-[26px] rounded-[3px] px-2 text-[12px] whitespace-nowrap transition-colors",
                pb === o.valor
                  ? "bg-bg-primary text-text-primary ring-border-main font-medium ring-1"
                  : "text-text-secondary hover:text-text-primary",
              ].join(" ")}
            >
              {o.label}
            </button>
          ))}
        </div>
      </Fila>
      {pb && (
        <>
          <Fila etiqueta="Fachada de la planta baja" htmlFor="ed-cer-fachada-pb" columna>
            <SelectFachada
              id="ed-cer-fachada-pb"
              valor={(r.fachadaPB ?? r.fachada).sol.id}
              onChange={(id) => onCambiar(setCerramientos(e, { fachadaPB: elegir(c.fachadaPB ?? c.fachada, id) }))}
            />
            <Linea>{lineaFachada((r.fachadaPB ?? r.fachada).sol)}</Linea>
          </Fila>
          <Ventana
            id="ed-cer-ventana-pb"
            etiqueta="Ventana de la planta baja"
            etiquetaMarco="Marco de la planta baja"
            eleccion={c.ventanaPB ?? c.ventana}
            onChange={(v) => onCambiar(setCerramientos(e, { ventanaPB: v }))}
          />
        </>
      )}
      <p className="text-text-disabled px-3.5 pt-1 pb-1 text-[11px] leading-snug">
        {pb
          ? plantaBajaEnHe1(e)
            ? "La planta baja es la planta 0. Las demás plantas llevan la general, y cada tipo se comprueba entero."
            : "La planta baja no tiene viviendas ni oficinas: su fachada y su ventana no entran en HE1. Sí en HS1."
          : "Lo normal es un tipo para todo el edificio. Si la planta baja lleva otra fachada u otra ventana, márcala distinta."}
      </p>

      {r.cubierta.descartada && (
        <p role="note" className="text-state-warn px-3.5 pt-1 pb-1 text-[11.5px] leading-snug">
          La cubierta elegida no casa con el tipo de cubierta: se usa la habitual.
        </p>
      )}

      <Sub>Lo usan</Sub>
      <LoUsan
        filas={[
          { codigo: "HE1", texto: "U de cada fachada, de la cubierta, del suelo y de las ventanas; el aislante y el vidrio se deciden allí", trato: "si" },
          { codigo: "HR", texto: "parte ciega y huecos frente al ruido exterior, flancos y forjados; los valores propios se dan allí", trato: "si" },
          { codigo: "HS1", texto: "grado de impermeabilidad de cada fachada por sus rasgos (tabla 2.7) y la protección de la cubierta (tabla 2.9); el revestimiento y el aislante de la cubierta se declaran allí", trato: "si" },
        ]}
      />
    </Tarjeta>
  );
}
