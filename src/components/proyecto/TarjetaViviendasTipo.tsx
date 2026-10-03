import type { JSX } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import type { RepartoPlanta, ViviendaTipo } from "../../lib/proyecto/tipos";

// Tarjeta "Viviendas tipo" del carril derecho del dashboard (feature-8 §C,
// UX-RECONCEPT §6.2): la unidad repetitiva de la colectiva. Se definen tipos
// (T2: dormitorios + baños + aseos; cocina y salón siempre 1) y, en colectiva,
// cuántas viviendas de cada tipo hay por planta. De aquí "generan" HS3/HS4/HS5
// sus redes propuestas (botón en la toolbar del outliner de cada módulo).
// La unifamiliar es el caso degenerado: un tipo, sin reparto.
//
// Persistencia: cada edición escribe vía `actualizarViviendasTipo` (el provider
// debouncea el guardado). El instante `nowIso` se inyecta aquí (la UI SÍ puede
// llamar a Date; el motor/los generadores siguen sin hacerlo).

/** Siguiente id determinista `vt<N>` (mismo patrón nextId de los módulos). */
function nextVtId(items: { id: string }[]): string {
  let max = 0;
  for (const it of items) {
    const m = /^vt(\d+)$/.exec(it.id);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `vt${max + 1}`;
}

const INPUT_NUM =
  "border-border-sub bg-bg-primary text-text-primary w-11 rounded border px-1 py-0.5 " +
  "text-right text-[12px] tabular-nums focus:border-accent focus:outline-none";

export function TarjetaViviendasTipo(): JSX.Element {
  const { proyecto, actualizarViviendasTipo } = useProyecto();
  const vts = proyecto.viviendasTipo ?? [];
  const reparto = proyecto.repartoPlantas ?? [];
  const esColectiva = proyecto.datosGenerales.uso === "vivienda_colectiva";

  const persistir = (nuevosVts: ViviendaTipo[], nuevoReparto: RepartoPlanta[]) => {
    actualizarViviendasTipo(nuevosVts, nuevoReparto, new Date().toISOString());
  };

  const patchVt = (id: string, patch: Partial<ViviendaTipo>) => {
    persistir(
      vts.map((v) => (v.id === id ? { ...v, ...patch } : v)),
      reparto,
    );
  };

  const addVt = () => {
    const id = nextVtId(vts);
    persistir(
      [...vts, { id, nombre: `T${vts.length + 2}`, dormitorios: 2, banos: 1, aseos: 1 }],
      reparto,
    );
  };

  const removeVt = (id: string) => {
    // Al borrar un tipo, sus entradas del reparto desaparecen con él.
    persistir(
      vts.filter((v) => v.id !== id),
      reparto
        .map((p) => ({ ...p, viviendas: p.viviendas.filter((x) => x.tipoId !== id) }))
        .filter((p) => p.viviendas.length > 0),
    );
  };

  /** Cantidad del tipo en la planta (0 = no presente). */
  const cantidadEn = (nivel: number, tipoId: string): number =>
    reparto.find((p) => p.nivel === nivel)?.viviendas.find((x) => x.tipoId === tipoId)
      ?.cantidad ?? 0;

  const setCantidad = (nivel: number, tipoId: string, cantidad: number) => {
    const n = Math.max(0, Math.trunc(cantidad));
    const planta = reparto.find((p) => p.nivel === nivel) ?? { nivel, viviendas: [] };
    const viviendas = [
      ...planta.viviendas.filter((x) => x.tipoId !== tipoId),
      ...(n > 0 ? [{ tipoId, cantidad: n }] : []),
    ];
    const nuevoReparto = [
      ...reparto.filter((p) => p.nivel !== nivel),
      ...(viviendas.length > 0 ? [{ nivel, viviendas }] : []),
    ].sort((a, b) => a.nivel - b.nivel);
    persistir(vts, nuevoReparto);
  };

  const addPlanta = () => {
    const nivel = reparto.length > 0 ? Math.max(...reparto.map((p) => p.nivel)) + 1 : 1;
    // La planta nueva arranca con 1 vivienda del primer tipo (editable).
    if (vts.length === 0) return;
    persistir(vts, [...reparto, { nivel, viviendas: [{ tipoId: vts[0].id, cantidad: 1 }] }]);
  };

  const removePlanta = (nivel: number) => {
    persistir(
      vts,
      reparto.filter((p) => p.nivel !== nivel),
    );
  };

  return (
    <section
      aria-label="Viviendas tipo"
      className="border-border-main bg-bg-surface rounded-md border p-3"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-text-primary text-[13px] font-semibold">Viviendas tipo</h2>
        <button
          type="button"
          onClick={addVt}
          className="text-accent hover:text-accent-hover flex items-center gap-1 text-[12px] transition-colors"
        >
          <Plus size={12} aria-hidden="true" />
          Añadir tipo
        </button>
      </div>

      {vts.length === 0 ? (
        <p className="text-text-disabled mt-2 text-[11px] leading-snug">
          Define la vivienda repetitiva (T2: dormitorios, baños, aseos — cocina y salón
          van siempre) y genera las redes de HS3/HS4/HS5 desde la tabla de cada
          justificación. En unifamiliar basta un tipo.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-1.5">
          {vts.map((v) => (
            <div key={v.id} className="flex items-center gap-1.5">
              <input
                type="text"
                value={v.nombre}
                onChange={(e) => patchVt(v.id, { nombre: e.target.value })}
                aria-label={`Nombre del tipo ${v.id}`}
                className="border-border-sub bg-bg-primary text-text-primary w-12 rounded border px-1.5 py-0.5 text-[12px] font-medium focus:border-accent focus:outline-none"
              />
              {(
                [
                  ["dormitorios", "dorm."],
                  ["banos", "baños"],
                  ["aseos", "aseos"],
                ] as const
              ).map(([campo, etiqueta]) => (
                <label
                  key={campo}
                  className="text-text-disabled flex items-center gap-1 text-[11px]"
                >
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={v[campo]}
                    onChange={(e) =>
                      patchVt(v.id, { [campo]: Math.max(0, Math.trunc(Number(e.target.value))) })
                    }
                    aria-label={`${etiqueta} de ${v.nombre}`}
                    className={INPUT_NUM}
                  />
                  {etiqueta}
                </label>
              ))}
              <button
                type="button"
                onClick={() => removeVt(v.id)}
                aria-label={`Eliminar tipo ${v.nombre}`}
                className="text-text-disabled hover:text-state-fail ml-auto shrink-0 rounded p-0.5 transition-colors"
              >
                <Trash2 size={13} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reparto por planta — solo tiene sentido en colectiva (§6.2). */}
      {esColectiva && vts.length > 0 && (
        <div className="mt-3">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-text-disabled text-[10px] font-semibold tracking-[0.07em] uppercase">
              Viviendas por planta
            </div>
            <button
              type="button"
              onClick={addPlanta}
              className="text-accent hover:text-accent-hover text-[11px] transition-colors"
            >
              + Planta
            </button>
          </div>
          {reparto.length === 0 ? (
            <p className="text-text-disabled mt-1 text-[11px]">
              Sin reparto: los generadores asumen una sola vivienda.
            </p>
          ) : (
            <table className="mt-1 w-full text-[12px]">
              <thead>
                <tr className="text-text-disabled border-border-sub border-b text-[10px] uppercase">
                  <th scope="col" className="py-1 text-left font-medium">
                    Planta
                  </th>
                  {vts.map((v) => (
                    <th key={v.id} scope="col" className="py-1 text-right font-medium">
                      {v.nombre}
                    </th>
                  ))}
                  <th scope="col" className="w-6 py-1">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {reparto.map((p) => (
                  <tr key={p.nivel} className="border-border-sub border-b last:border-b-0">
                    <td className="text-text-secondary py-1 font-mono">P{p.nivel}</td>
                    {vts.map((v) => (
                      <td key={v.id} className="py-1 text-right">
                        <input
                          type="number"
                          min={0}
                          step={1}
                          value={cantidadEn(p.nivel, v.id)}
                          onChange={(e) => setCantidad(p.nivel, v.id, Number(e.target.value))}
                          aria-label={`Viviendas ${v.nombre} en planta ${p.nivel}`}
                          className={INPUT_NUM}
                        />
                      </td>
                    ))}
                    <td className="py-1 text-right">
                      <button
                        type="button"
                        onClick={() => removePlanta(p.nivel)}
                        aria-label={`Eliminar planta ${p.nivel}`}
                        className="text-text-disabled hover:text-state-fail rounded p-0.5 transition-colors"
                      >
                        <Trash2 size={12} aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {vts.length > 0 && (
        <p className="text-text-disabled mt-2 text-[11px] leading-snug">
          Genera la red propuesta desde la tabla de HS3, HS4 o HS5 (la herramienta
          propone; todo es editable después).
        </p>
      )}
    </section>
  );
}
