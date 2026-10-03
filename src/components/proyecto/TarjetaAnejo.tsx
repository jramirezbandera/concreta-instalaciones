import type { JSX } from "react";
import { Link } from "react-router";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import { GeneradorAnejo } from "./GeneradorAnejo";
import { estadoDe, resumenProyecto } from "../../lib/proyecto/progreso";
import { justificacionRegistry } from "../../data/justificacionRegistry";
import type { JustificacionKey, Progreso } from "../../lib/proyecto/tipos";
import { ChipEstado } from "./ChipEstado";

// Tarjeta "Anejo CTE" del carril derecho del dashboard (feature-6 §D,
// UX-RECONCEPT §4.2): recuento del expediente + barra apilada de progreso +
// pendientes con acceso directo. El botón "Generar anejo" —el momento del
// producto— ya es real: lo aporta <GeneradorAnejo /> (feature-8 §D).

/** Orden de las pendientes: lo roto primero, luego lo empezado, luego lo virgen. */
const ORDEN_PENDIENTE: Record<Progreso, number> = {
  no_cumple: 0,
  en_curso: 1,
  sin_iniciar: 2,
  cumple: 3, // no entra en la lista; el orden lo deja al final por si acaso
};

export function TarjetaAnejo(): JSX.Element {
  const { proyecto } = useProyecto();
  const r = resumenProyecto(proyecto);

  // Pendientes: aplicables cuyo progreso no es `cumple`, no_cumple primero.
  const pendientes = justificacionRegistry
    .filter((e) => !e.dev)
    .map((e) => {
      const key = e.key as JustificacionKey;
      return { entry: e, key, estado: estadoDe(proyecto, key) };
    })
    .filter(
      (f) =>
        f.estado.aplicabilidad !== "no_aplica" &&
        f.estado.aplicabilidad !== "externo" &&
        f.estado.progreso !== "cumple",
    )
    .sort((a, b) => ORDEN_PENDIENTE[a.estado.progreso] - ORDEN_PENDIENTE[b.estado.progreso]);

  // Segmentos de la barra apilada (solo los que tienen recuento > 0).
  const segmentos: { n: number; clase: string; etiqueta: string }[] = [
    { n: r.cumplen, clase: "bg-state-ok", etiqueta: "cumplen" },
    { n: r.enCurso, clase: "bg-state-warn", etiqueta: "en curso" },
    { n: r.noCumplen, clase: "bg-state-fail", etiqueta: "no cumplen" },
    { n: r.sinIniciar, clase: "bg-state-neutral/30", etiqueta: "sin iniciar" },
  ].filter((s) => s.n > 0);

  const resumenTexto = segmentos.map((s) => `${s.n} ${s.etiqueta}`).join(", ");

  return (
    <section
      aria-label="Anejo CTE"
      className="border-border-main bg-bg-surface rounded-md border p-3"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-text-primary text-[13px] font-semibold">Anejo CTE</h2>
        <span className="text-text-secondary text-[12px]">
          <span className="text-text-primary font-mono font-medium">
            {r.cumplen}/{r.aplicables}
          </span>{" "}
          justificadas
        </span>
      </div>

      {/* Barra apilada de progreso (el desglose textual va en aria-label). */}
      <div
        role="img"
        aria-label={`Progreso del expediente: ${resumenTexto || "sin justificaciones aplicables"}`}
        className="bg-bg-elevated mt-2.5 flex h-2 overflow-hidden rounded-full"
      >
        {segmentos.map((s) => (
          <div
            key={s.etiqueta}
            className={s.clase}
            style={{ flexGrow: s.n }}
            title={`${s.n} ${s.etiqueta}`}
          />
        ))}
      </div>

      {/* Pendientes: no_cumple primero, con acceso directo a la justificación. */}
      {pendientes.length > 0 && (
        <div className="mt-3">
          <div className="text-text-disabled mb-1 text-[10px] font-semibold tracking-[0.07em] uppercase">
            Pendientes
          </div>
          <ul className="list-none">
            {pendientes.map((f) => {
              const navegable = f.entry.shipped && f.entry.route !== undefined;
              const cuerpo = (
                <>
                  <span className="text-text-disabled w-14 shrink-0 font-mono text-[11px]">
                    {f.entry.codigo}
                  </span>
                  <span className="text-text-primary min-w-0 flex-1 truncate text-[12px]">
                    {f.entry.label}
                  </span>
                </>
              );
              return (
                <li
                  key={f.key}
                  className="border-border-sub flex min-h-8 items-center gap-2 border-b last:border-b-0"
                >
                  {navegable ? (
                    <Link
                      to={f.entry.route ?? "."}
                      className="hover:bg-bg-elevated focus-visible:outline-accent -mx-1 flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-0.5 transition-colors focus-visible:outline-2"
                    >
                      {cuerpo}
                    </Link>
                  ) : (
                    <div
                      className="flex min-w-0 flex-1 cursor-not-allowed items-center gap-2 py-0.5 opacity-70"
                      aria-disabled="true"
                    >
                      {cuerpo}
                      <span className="text-text-disabled shrink-0 text-[10px]">Próx.</span>
                    </div>
                  )}
                  <ChipEstado estado={f.estado} />
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Momento del producto (feature-8 §D): el anejo completo del expediente. */}
      <GeneradorAnejo />
    </section>
  );
}
