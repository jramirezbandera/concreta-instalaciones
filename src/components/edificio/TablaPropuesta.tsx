import type { JSX } from "react";
import { etiquetaNivel } from "../../lib/edificio/derivar";
import type { Estancia, FilaLeida, Que } from "../../lib/edificio/cuadro/leer";
import {
  esDudosa,
  motivoDescarte,
  type CorreccionFila,
  type FilaRevisable,
} from "../../lib/edificio/cuadro/montar";
import { USOS } from "../../lib/edificio/usos";

// =============================================================================
// La tabla de propuesta de «Leer el cuadro de superficies» (feature-13): cada
// fila del cuadro, como la leyó la IA, con lo que el proyectista puede corregir
// (si entra, a qué va, sus m², su planta y su unidad). Las filas van agrupadas
// por planta, de arriba abajo como la sección. Es una tabla de verdad (con sus
// cabeceras), y cada fila tiene un botón para verla en el edificio.
// =============================================================================

const ESTANCIA_LABEL: Record<Estancia, string> = {
  dormitorio: "Dormitorio",
  bano: "Baño",
  aseo: "Aseo",
  cocina: "Cocina",
  estar: "Salón o comedor",
  otra: "Otra estancia",
};

const ZONAS: readonly Que[] = [
  "local_sin_uso",
  "oficinas",
  "zona_comun",
  "vestibulo",
  "garaje",
  "garaje_privado",
  "trasteros",
  "instalaciones",
];

const OTROS: readonly [Que, string][] = [
  ["cubierta", "Cubierta"],
  ["exterior", "Exterior · no se usa"],
  ["total", "Total · no se usa"],
  ["otro", "Otro · no se usa"],
];

/** Valor del desplegable «Va a»: el destino y, en las estancias, cuál. */
function valorVaA(f: FilaLeida): string {
  return f.que === "estancia" || f.que === "estancia_tipo" ? `e:${f.estancia}` : f.que;
}

function correccionVaA(f: FilaLeida, valor: string): CorreccionFila {
  if (valor.startsWith("e:")) {
    const estancia = valor.slice(2) as Estancia;
    // Una estancia de la descripción de un tipo sigue siéndolo.
    return { que: f.que === "estancia_tipo" ? "estancia_tipo" : "estancia", estancia };
  }
  return { que: valor as Que };
}

/** «12,5» o «12.5» → 12.5; lo que no es un número → null. */
function leerM2(txt: string): number | null {
  const n = Number(txt.trim().replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

const fmtM2 = (v: number) => v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CONTROL =
  "border-border-main bg-bg-primary text-text-primary focus:border-accent h-[30px] rounded border px-1.5 text-[12.5px] focus:outline-none disabled:opacity-60";

const CONFIANZA_CLASE: Record<FilaLeida["confianza"], string> = {
  alta: "text-text-disabled",
  media: "text-text-secondary",
  baja: "text-state-warn font-medium",
};

const TIENE_UNIDAD: ReadonlySet<Que> = new Set(["estancia", "vivienda", "local_sin_uso", "oficinas"]);

/** La línea pequeña bajo el texto de la fila: página, motivo y nota, separados por «·». */
function Detalle({ partes }: { partes: ({ texto: string; clase?: string } | null)[] }): JSX.Element | null {
  const hay = partes.filter((p): p is { texto: string; clase?: string } => p !== null);
  if (hay.length === 0) return null;
  return (
    <div className="text-text-disabled mt-0.5 text-[11px] leading-snug">
      {hay.map((p, k) => (
        <span key={p.texto} className={p.clase}>
          {k > 0 && " · "}
          {p.texto}
        </span>
      ))}
    </div>
  );
}

export function TablaPropuesta(props: {
  filas: FilaRevisable[];
  destino: Map<number, string[]>;
  zonaSel: string | null;
  soloDudosas: boolean;
  onCorregir: (i: number, c: CorreccionFila) => void;
  onVer: (zonaId: string) => void;
}): JSX.Element {
  const { filas, destino, zonaSel, soloDudosas, onCorregir, onVer } = props;
  const visibles = soloDudosas ? filas.filter(esDudosa) : filas;
  const niveles = [...new Set(visibles.map((f) => f.nivel))].sort((a, b) => b - a);
  const todosNiveles = [...new Set(filas.map((f) => f.nivel))];
  const maxNivel = Math.max(3, ...todosNiveles) + 1;
  const minNivel = Math.min(-1, ...todosNiveles) - 1;
  const opcionesNivel = Array.from({ length: maxNivel - minNivel + 1 }, (_, k) => maxNivel - k);

  return (
    <table className="w-full min-w-[780px] border-collapse text-left text-[12.5px]">
      <caption className="sr-only">
        Filas del cuadro de superficies leídas con IA, agrupadas por planta. Corrige lo que haga falta antes de
        sustituir el edificio.
      </caption>
      <thead className="bg-bg-surface text-text-disabled sticky top-0 z-[1] text-[10.5px] tracking-[0.06em] uppercase">
        <tr className="border-border-main border-b">
          <th scope="col" className="w-9 px-2 py-2 font-semibold">
            <span className="sr-only">Usar</span>
          </th>
          <th scope="col" className="px-2 py-2 font-semibold">
            Fila del cuadro
          </th>
          <th scope="col" className="w-[92px] px-2 py-2 text-right font-semibold">
            m² útiles
          </th>
          <th scope="col" className="w-[178px] px-2 py-2 font-semibold">
            Va a
          </th>
          <th scope="col" className="w-[84px] px-2 py-2 font-semibold">
            Planta
          </th>
          <th scope="col" className="w-[118px] px-2 py-2 font-semibold">
            Unidad
          </th>
          <th scope="col" className="w-[70px] px-2 py-2 font-semibold">
            Confianza
          </th>
        </tr>
      </thead>
      {niveles.map((nivel) => (
        <tbody key={nivel}>
          <tr>
            <th
              scope="rowgroup"
              colSpan={7}
              className="bg-bg-elevated text-text-secondary border-border-sub border-b px-2 py-1 font-mono text-[11px] font-semibold"
            >
              {etiquetaNivel(nivel)}
            </th>
          </tr>
          {visibles
            .filter((f) => f.nivel === nivel)
            .map((f) => {
              const ids = destino.get(f.i) ?? [];
              const zona = ids.find((id) => !id.startsWith("tipo:") && id !== "cubierta");
              const marcada = zonaSel !== null && ids.includes(zonaSel);
              const motivo = f.usar ? "" : motivoDescarte(f) || "Fuera por decisión tuya";
              return (
                <tr
                  key={f.i}
                  className={[
                    "border-border-sub border-b align-top",
                    marcada ? "bg-tint-accent" : "",
                    f.usar ? "" : "text-text-disabled",
                  ].join(" ")}
                >
                  <td className="px-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={f.usar}
                      onChange={(ev) => onCorregir(f.i, { usar: ev.target.checked })}
                      aria-label={`Usar «${f.texto}»`}
                      className="accent-accent mt-1.5 h-3.5 w-3.5"
                    />
                  </td>
                  <td className="min-w-[180px] px-2 py-1.5">
                    {zona ? (
                      <button
                        type="button"
                        onClick={() => onVer(zona)}
                        aria-label={`«${f.texto}»: verla en el edificio`}
                        className={[
                          "text-left leading-snug hover:underline",
                          f.usar ? "text-text-primary" : "",
                        ].join(" ")}
                      >
                        {f.texto}
                      </button>
                    ) : (
                      <span className={["leading-snug", f.usar ? "text-text-primary" : ""].join(" ")}>
                        {f.texto}
                      </span>
                    )}
                    <Detalle
                      partes={[
                        f.pagina > 0 ? { texto: `pág. ${f.pagina}` } : null,
                        f.tipoSuperficie === "construida" ? { texto: "construida" } : null,
                        motivo ? { texto: motivo, clase: "text-text-secondary" } : null,
                        f.nota ? { texto: f.nota, clase: "text-state-warn" } : null,
                      ]}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <input
                      key={f.superficie_m2}
                      type="text"
                      inputMode="decimal"
                      defaultValue={fmtM2(f.superficie_m2)}
                      aria-label={`Superficie de «${f.texto}», m²`}
                      onBlur={(ev) => {
                        const v = leerM2(ev.currentTarget.value);
                        if (v === null) ev.currentTarget.value = fmtM2(f.superficie_m2);
                        else if (v !== f.superficie_m2) onCorregir(f.i, { superficie_m2: v });
                      }}
                      onKeyDown={(ev) => {
                        if (ev.key === "Enter") ev.currentTarget.blur();
                      }}
                      className={`${CONTROL} w-[78px] text-right font-mono tabular-nums`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={valorVaA(f)}
                      onChange={(ev) => onCorregir(f.i, correccionVaA(f, ev.target.value))}
                      aria-label={`A qué va «${f.texto}»`}
                      className={`${CONTROL} w-full`}
                    >
                      <optgroup label={f.que === "estancia_tipo" ? "Estancia de un tipo de vivienda" : "Vivienda"}>
                        {(Object.keys(ESTANCIA_LABEL) as Estancia[]).map((e) => (
                          <option key={e} value={`e:${e}`}>
                            {ESTANCIA_LABEL[e]}
                          </option>
                        ))}
                        <option value="vivienda">Vivienda entera</option>
                      </optgroup>
                      <optgroup label="Zona">
                        {ZONAS.map((q) => (
                          <option key={q} value={q}>
                            {USOS[q as keyof typeof USOS].etiqueta}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Otros">
                        {OTROS.map(([q, etiqueta]) => (
                          <option key={q} value={q}>
                            {etiqueta}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1">
                      <select
                        value={f.nivel}
                        onChange={(ev) => onCorregir(f.i, { nivel: Number(ev.target.value) })}
                        aria-label={`Planta de «${f.texto}»`}
                        className={`${CONTROL} w-[58px] font-mono`}
                      >
                        {opcionesNivel.map((n) => (
                          <option key={n} value={n}>
                            {etiquetaNivel(n)}
                          </option>
                        ))}
                      </select>
                      {f.plantas > 1 && (
                        <span
                          className="text-accent font-mono text-[11px]"
                          title={`Vale para ${f.plantas} plantas iguales: ${etiquetaNivel(f.nivel)} a ${etiquetaNivel(f.nivel + f.plantas - 1)}`}
                        >
                          ×{f.plantas}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    {TIENE_UNIDAD.has(f.que) ? (
                      <input
                        key={f.unidad}
                        type="text"
                        defaultValue={f.unidad}
                        placeholder={f.que === "estancia" ? "la vivienda" : "—"}
                        aria-label={`Unidad de «${f.texto}»`}
                        onBlur={(ev) => {
                          const v = ev.currentTarget.value.trim();
                          if (v !== f.unidad) onCorregir(f.i, { unidad: v });
                        }}
                        onKeyDown={(ev) => {
                          if (ev.key === "Enter") ev.currentTarget.blur();
                        }}
                        className={`${CONTROL} w-full`}
                      />
                    ) : (
                      <span className="text-text-disabled block pt-1.5">
                        {f.que === "estancia_tipo" ? `tipo ${f.tipoVivienda || "—"}` : "—"}
                      </span>
                    )}
                  </td>
                  <td className={`px-2 py-1.5 pt-[11px] text-[11.5px] ${CONFIANZA_CLASE[f.confianza]}`}>
                    {f.confianza}
                  </td>
                </tr>
              );
            })}
        </tbody>
      ))}
    </table>
  );
}
