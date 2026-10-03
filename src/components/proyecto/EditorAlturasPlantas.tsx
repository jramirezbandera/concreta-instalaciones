import { useId, type JSX } from "react";
import { InputLabel, NumberInput } from "../ui/InputLabel";
import { reconciliarAlturas } from "../../lib/proyecto/derivar";
import type { AlturasPlantas } from "../../lib/proyecto/tipos";

// =============================================================================
// EditorAlturasPlantas (feature-10) — alturas reales por planta en Datos
// generales, en vez de la estimación ciega de 3 m/planta.
//
// DOS ESTADOS: sin definir (una fila discreta con botón; se mantiene la
// estimación y su procedencia lo declara) y definido (tabla de plantas en orden
// de sección —cubierta arriba, sótanos abajo— con altura editable y cota de
// suelo calculada, más una sección esquemática SVG con la rasante y la altura
// de evacuación acotada en acento).
//
// LA ALTURA DE EVACUACIÓN NO SE EDITA AQUÍ: se declaran los HECHOS (alturas
// físicas) y la cota la deriva `derivarContexto`, con procedencia. La altura de
// la última planta no interviene en la evacuación (se evacúa desde su suelo)
// pero sí fija la cota de cubierta — dato futuro de HS4/HS5.
//
// SIN EFECTOS DE SINCRONIZACIÓN: la vista se deriva en render con
// `reconciliarAlturas` (los contadores de plantas mandan sobre las longitudes)
// y cada edición escribe las listas ya reconciliadas. Cambiar el nº de plantas
// no borra alturas: se recortan en vista y reaparecen si el contador vuelve.
// =============================================================================

interface EditorAlturasPlantasProps {
  plantasSobre: number;
  plantasBajo: number;
  /** `undefined` = sin definir (se estima 3 m/planta). */
  alturas: AlturasPlantas | undefined;
  onChange: (v: AlturasPlantas | undefined) => void;
  /** Aviso de validación del formulario (alturas fuera de rango). */
  warning?: string;
}

const HELP_SIN_DEFINIR =
  "Altura suelo-a-suelo de cada planta. Sin definir, la altura de evacuación se " +
  "estima a 3 m por planta; con las alturas reales se calcula exacta (cota del " +
  "suelo de la última planta). Las cotas alimentarán además las presiones de HS4 " +
  "y las bajantes de HS5.";

const HELP_DEFINIDO =
  "Altura suelo-a-suelo (de cara superior de forjado a cara superior de forjado). " +
  "La altura de evacuación es la cota del suelo de la última planta: su propia " +
  "altura no interviene en ella, pero fija la cota de cubierta.";

/** Altura utilizable para SUMAR cotas (una entrada a medio teclear cuenta 0). */
function hSegura(h: number): number {
  return Number.isFinite(h) && h > 0 ? h : 0;
}

/** Cota con signo y coma decimal: 4.2 → "+4,20" · −3.3 → "-3,30" · 0 → "0,00". */
function fmtCota(x: number): string {
  const t = Math.abs(x).toFixed(2).replace(".", ",");
  return x > 0 ? `+${t}` : x < 0 ? `-${t}` : t;
}

// -----------------------------------------------------------------------------
// Fila de la tabla: etiqueta · altura editable · cota de suelo
// -----------------------------------------------------------------------------

function FilaPlanta(props: {
  id: string;
  label: string;
  altura: number;
  cota: number;
  onChange: (v: number) => void;
}): JSX.Element {
  const { id, label, altura, cota, onChange } = props;
  return (
    <div className="flex items-center justify-between gap-2 py-0.5">
      <label htmlFor={id} className="text-text-secondary min-w-0 truncate text-[12px]">
        {label}
      </label>
      <div className="flex shrink-0 items-center gap-2">
        <div className="w-16">
          {/* permitirVacio: borrar el campo lo deja EN BLANCO (NaN), no en "0".
              Con 0 el campo parecía no borrarse nunca. La validación del
              formulario caza el hueco y el submit queda bloqueado. */}
          <NumberInput
            id={id}
            value={altura}
            min={2}
            max={10}
            step={0.05}
            permitirVacio
            onChange={onChange}
          />
        </div>
        <span className="text-text-disabled w-14 text-right text-[11px] tabular-nums">
          {fmtCota(cota)}
        </span>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sección esquemática: rasante, plantas apiladas, sótanos enterrados y la
// altura de evacuación acotada en acento. Sin texto (las cifras van en la
// tabla); proporciones reales con escala acotada.
// -----------------------------------------------------------------------------

function SeccionEsquematica(props: {
  sobre: number[];
  bajo: number[];
  alturaEvac_m: number;
}): JSX.Element {
  const { sobre, bajo, alturaEvac_m } = props;
  const sumS = sobre.reduce((a, h) => a + hSegura(h), 0);
  const sumB = bajo.reduce((a, h) => a + hSegura(h), 0);
  const total = Math.max(sumS + sumB, 1);
  const escala = Math.min(12, 170 / total);

  const W = 78;
  const PAD = 5;
  const X0 = 8;
  const ANCHO = 48;
  const yRasante = PAD + sumS * escala;
  const H = PAD * 2 + total * escala;

  // Líneas de forjado intermedias (cara superior), de abajo arriba.
  const forjadosSobre: number[] = [];
  let acc = 0;
  for (let i = 0; i < sobre.length - 1; i++) {
    acc += hSegura(sobre[i]);
    forjadosSobre.push(yRasante - acc * escala);
  }
  const forjadosBajo: number[] = [];
  acc = 0;
  for (let j = 0; j < bajo.length - 1; j++) {
    acc += hSegura(bajo[j]);
    forjadosBajo.push(yRasante + acc * escala);
  }

  const yEvac = yRasante - alturaEvac_m * escala;
  const XCOTA = X0 + ANCHO + 10;

  const etiqueta =
    `Sección esquemática: ${sobre.length} plantas sobre rasante` +
    (bajo.length > 0 ? ` y ${bajo.length} bajo rasante` : "") +
    `; altura de evacuación ${String(alturaEvac_m).replace(".", ",")} m`;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={etiqueta}
      className="hidden shrink-0 sm:block"
    >
      {/* Volumen sobre rasante */}
      {sumS > 0 && (
        <rect
          x={X0}
          y={PAD}
          width={ANCHO}
          height={sumS * escala}
          fill="none"
          stroke="currentColor"
          className="text-border-main"
        />
      )}
      {forjadosSobre.map((y) => (
        <line
          key={`fs-${y}`}
          x1={X0}
          y1={y}
          x2={X0 + ANCHO}
          y2={y}
          stroke="currentColor"
          className="text-border-sub"
        />
      ))}
      {/* Sótanos: mismo volumen, relleno tenue = enterrado */}
      {sumB > 0 && (
        <rect
          x={X0}
          y={yRasante}
          width={ANCHO}
          height={sumB * escala}
          fill="currentColor"
          fillOpacity={0.1}
          stroke="currentColor"
          className="text-border-main"
        />
      )}
      {forjadosBajo.map((y) => (
        <line
          key={`fb-${y}`}
          x1={X0}
          y1={y}
          x2={X0 + ANCHO}
          y2={y}
          stroke="currentColor"
          className="text-border-sub"
        />
      ))}
      {/* Rasante ±0,00 con marcas de terreno a ambos lados */}
      <line
        x1={0}
        y1={yRasante}
        x2={W}
        y2={yRasante}
        stroke="currentColor"
        strokeWidth={1.3}
        className="text-text-secondary"
      />
      {[2, 6, W - 7, W - 3].map((x) => (
        <line
          key={`t-${x}`}
          x1={x + 3}
          y1={yRasante}
          x2={x}
          y2={yRasante + 4}
          stroke="currentColor"
          className="text-text-disabled"
        />
      ))}
      {/* Altura de evacuación: cota en acento del suelo de la última planta a la rasante */}
      {alturaEvac_m > 0 && (
        <g stroke="currentColor" className="text-accent">
          <line x1={XCOTA} y1={yEvac} x2={XCOTA} y2={yRasante} />
          <line x1={XCOTA - 3} y1={yEvac} x2={XCOTA + 3} y2={yEvac} />
          <line x1={XCOTA - 3} y1={yRasante} x2={XCOTA + 3} y2={yRasante} />
          <line x1={X0 + ANCHO} y1={yEvac} x2={XCOTA} y2={yEvac} strokeDasharray="2 2" />
        </g>
      )}
    </svg>
  );
}

// -----------------------------------------------------------------------------
// Editor
// -----------------------------------------------------------------------------

export function EditorAlturasPlantas({
  plantasSobre,
  plantasBajo,
  alturas,
  onChange,
  warning,
}: EditorAlturasPlantasProps): JSX.Element {
  const idBase = useId();

  if (alturas === undefined) {
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between gap-3">
          <InputLabel label="Alturas por planta" help={HELP_SIN_DEFINIR} />
          <button
            type="button"
            onClick={() => onChange(reconciliarAlturas(undefined, plantasSobre, plantasBajo))}
            className="text-accent shrink-0 cursor-pointer text-[12px] hover:underline"
          >
            Definir alturas reales
          </button>
        </div>
        <p className="text-text-disabled mt-0.5 text-[11px] leading-snug">
          Sin definir, se estima 3 m por planta.
        </p>
      </div>
    );
  }

  // Vista reconciliada con los contadores (los valores existentes se conservan
  // tal cual — la validación del formulario es quien juzga los fuera de rango).
  const vista = reconciliarAlturas(alturas, plantasSobre, plantasBajo);

  // Cotas de suelo [m]: sobre rasante acumulando hacia arriba; sótanos en negativo.
  const cotasSobre: number[] = [];
  let acumulada = 0;
  for (const h of vista.sobre) {
    cotasSobre.push(acumulada);
    acumulada += hSegura(h);
  }
  const cotaCubierta = acumulada;
  const cotasBajo: number[] = [];
  acumulada = 0;
  for (const h of vista.bajo) {
    acumulada -= hSegura(h);
    cotasBajo.push(acumulada);
  }

  const alturaEvac_m =
    Math.round((cotasSobre[vista.sobre.length - 1] ?? 0) * 100) / 100;

  const setSobre = (i: number, v: number): void =>
    onChange({ sobre: vista.sobre.map((h, k) => (k === i ? v : h)), bajo: vista.bajo });
  const setBajo = (j: number, v: number): void =>
    onChange({ sobre: vista.sobre, bajo: vista.bajo.map((h, k) => (k === j ? v : h)) });

  return (
    <div className="border-border-sub mt-2 rounded border p-2">
      <div className="flex items-center justify-between gap-3 pb-1">
        <InputLabel label="Alturas por planta" help={HELP_DEFINIDO} />
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-text-secondary hover:text-accent shrink-0 cursor-pointer text-[11px] transition-colors"
        >
          Volver a la estimación
        </button>
      </div>
      {warning !== undefined && (
        <p className="text-state-warn pb-1 text-[11px] leading-snug">{warning}</p>
      )}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2 pb-0.5">
            <span className="text-text-disabled text-[10px] tracking-wide uppercase">Planta</span>
            <div className="flex shrink-0 gap-2">
              <span className="text-text-disabled w-16 text-right text-[10px]">Altura m</span>
              <span className="text-text-disabled w-14 text-right text-[10px]">Cota suelo</span>
            </div>
          </div>
          {/* Cubierta: solo cota (la fija la altura de la última planta) */}
          <div className="flex items-center justify-between gap-2 py-0.5">
            <span className="text-text-secondary min-w-0 truncate text-[12px]">Cubierta</span>
            <span className="text-text-disabled w-14 shrink-0 text-right text-[11px] tabular-nums">
              {fmtCota(cotaCubierta)}
            </span>
          </div>
          {vista.sobre
            .map((h, i) => ({ h, i }))
            .reverse()
            .map(({ h, i }) => (
              <FilaPlanta
                key={`s-${i}`}
                id={`${idBase}-s-${i}`}
                label={i === 0 ? "Planta baja" : `Planta ${i}`}
                altura={h}
                cota={cotasSobre[i]}
                onChange={(v) => setSobre(i, v)}
              />
            ))}
          {vista.bajo.length > 0 && (
            <div className="flex items-center gap-2 py-1" aria-hidden="true">
              <div className="border-border-main flex-1 border-t" />
              <span className="text-text-disabled text-[9px] tracking-wide uppercase">
                rasante 0,00
              </span>
              <div className="border-border-main flex-1 border-t" />
            </div>
          )}
          {vista.bajo.map((h, j) => (
            <FilaPlanta
              key={`b-${j}`}
              id={`${idBase}-b-${j}`}
              label={`Sótano ${j + 1}`}
              altura={h}
              cota={cotasBajo[j]}
              onChange={(v) => setBajo(j, v)}
            />
          ))}
          <p className="text-text-disabled pt-1 text-[10px] leading-snug">
            Altura suelo a suelo · cota de la cara superior del forjado.
          </p>
        </div>
        <SeccionEsquematica sobre={vista.sobre} bajo={vista.bajo} alturaEvac_m={alturaEvac_m} />
      </div>
    </div>
  );
}
