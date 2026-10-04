import type { CSSProperties, JSX } from "react";
import { cotasGrupo, esBajoRasante, formatoCota, nombreGrupo, plantasDe } from "../../lib/edificio/derivar";
import type { Edificio, GrupoPlantas, TipoCubierta } from "../../lib/edificio/tipos";
import { detalleZona, ETIQUETA_CUBIERTA, type Seleccion } from "./presentacion";
import { USOS, type FamiliaUso } from "../../lib/edificio/usos";

// =============================================================================
// La sección de El edificio (feature-12, maqueta v4): de arriba abajo, con la
// altura a escala. Cada grupo de plantas es una banda: a la izquierda su canalón
// («P1–P3 × 3», altura, cota) y a la derecha sus zonas, con el ancho
// proporcional a la superficie útil. Es el editor: todo es un botón y lo pulsado
// se edita en la columna de la izquierda. HTML puro, accesible por teclado; la
// selección va en `aria-pressed`.
// =============================================================================

/** Píxeles por metro de altura de planta. */
const PX_POR_M = 18;
/** A partir de aquí, las plantas iguales no hacen la banda más alta. */
const MAX_PLANTAS_DIBUJADAS = 6;
/** Alto mínimo de una banda [px]: caben las tres líneas de la zona. */
const ALTO_MIN_BANDA = 58;

const FONDO: Record<FamiliaUso, string> = {
  vivienda: "bg-bg-primary",
  local: "bg-bg-primary",
  oficinas: "bg-[color-mix(in_srgb,var(--color-accent)_7%,var(--color-bg-primary))]",
  comun: "bg-bg-surface",
  garaje: "bg-bg-elevated",
};

const RAYADO = "repeating-linear-gradient(135deg, transparent 0 6px, var(--color-border-sub) 6px 8px)";

function detalleCubierta(tipo: TipoCubierta): string {
  return tipo === "plana_transitable"
    ? "transitable"
    : tipo === "plana_no_transitable"
      ? "no transitable"
      : "con canalones";
}

function supTexto(m2: number): string {
  return `${Math.round(m2).toLocaleString("es-ES")} m²`;
}

const CANALON =
  "flex shrink-0 basis-[76px] flex-col items-start justify-center gap-[3px] rounded border bg-bg-primary px-2.5 py-1.5 text-left transition-colors sm:basis-[116px]";

/**
 * Sin los `onAnadir*`, la sección es de solo lectura: no ofrece añadir plantas ni
 * zonas. Así la usa la vista previa de «Leer el cuadro de superficies».
 */
export function SeccionEdificio(props: {
  edificio: Edificio;
  seleccion: Seleccion | null;
  onSeleccionar: (s: Seleccion) => void;
  onAnadirZona?: (grupoId: string) => void;
  onAnadirPlanta?: () => void;
  onAnadirSotano?: () => void;
}): JSX.Element {
  const { edificio: e, seleccion, onSeleccionar, onAnadirZona, onAnadirPlanta, onAnadirSotano } =
    props;
  const plantas = plantasDe(e);
  const masAlta = plantas[0];
  const cotaCubierta = masAlta ? masAlta.cota_m + masAlta.altura_m : 0;
  const cubiertaSel = seleccion?.tipo === "cubierta";

  return (
    <div>
      <div role="list" aria-label="Plantas del edificio, de arriba abajo" className="mx-auto flex max-w-[900px] flex-col gap-1.5">
        {/* Cubierta */}
        <div role="listitem" className="flex items-stretch gap-2">
          <button
            type="button"
            aria-pressed={cubiertaSel}
            aria-label={`Cubierta, cota ${formatoCota(cotaCubierta)}`}
            onClick={() => onSeleccionar({ tipo: "cubierta" })}
            className={[
              CANALON,
              cubiertaSel
                ? "border-accent shadow-[inset_3px_0_0_var(--color-accent)]"
                : "border-border-main hover:border-text-disabled",
            ].join(" ")}
          >
            <span className="text-text-primary text-[13.5px] font-semibold">Cubierta</span>
            <span className="text-text-disabled font-mono text-[10.5px]">{formatoCota(cotaCubierta)}</span>
          </button>
          <button
            type="button"
            aria-pressed={cubiertaSel}
            aria-label={`${ETIQUETA_CUBIERTA[e.cubierta.tipo]}, ${detalleCubierta(e.cubierta.tipo)}, ${supTexto(e.cubierta.superficie_m2)}`}
            onClick={() => onSeleccionar({ tipo: "cubierta" })}
            className={[
              "bg-bg-elevated flex h-[34px] min-w-0 flex-1 items-center gap-2 overflow-hidden rounded border px-2.5 text-left",
              cubiertaSel
                ? "border-accent shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-accent)_35%,transparent)]"
                : "border-border-main hover:border-text-disabled",
            ].join(" ")}
          >
            <b className="text-text-primary truncate text-[12.5px] font-semibold">
              {ETIQUETA_CUBIERTA[e.cubierta.tipo]}
            </b>
            <span className="text-text-secondary truncate text-[11.5px]">
              {detalleCubierta(e.cubierta.tipo)} · {supTexto(e.cubierta.superficie_m2)}
            </span>
          </button>
        </div>

        {e.grupos.map((g) => (
          <Banda
            key={g.id}
            e={e}
            g={g}
            seleccion={seleccion}
            onSeleccionar={onSeleccionar}
            onAnadirZona={onAnadirZona}
          />
        ))}
      </div>

      {(onAnadirPlanta || onAnadirSotano) && (
        <div className="mx-auto mt-2.5 flex max-w-[900px] flex-wrap gap-1.5 sm:pl-[124px]">
          {onAnadirPlanta && (
            <button type="button" onClick={onAnadirPlanta} className={BOTON_ANADIR}>
              + Planta sobre rasante
            </button>
          )}
          {onAnadirSotano && (
            <button type="button" onClick={onAnadirSotano} className={BOTON_ANADIR}>
              + Sótano
            </button>
          )}
        </div>
      )}

      <ul
        aria-label="Leyenda"
        className="text-text-secondary mx-auto mt-3.5 flex max-w-[900px] flex-wrap gap-x-3.5 gap-y-1.5 text-[11.5px] sm:pl-[124px]"
      >
        <Muestra clase={FONDO.vivienda}>Vivienda</Muestra>
        <Muestra clase={FONDO.local} estilo={{ backgroundImage: RAYADO }}>
          Local sin uso
        </Muestra>
        <Muestra clase={FONDO.oficinas}>Oficinas</Muestra>
        <Muestra clase={FONDO.comun}>Zonas comunes e instalaciones</Muestra>
        <Muestra clase={FONDO.garaje}>Garaje y trasteros</Muestra>
        <Muestra clase="bg-bg-primary border-dashed">Bajo rasante</Muestra>
      </ul>
    </div>
  );
}

const BOTON_ANADIR =
  "border-border-main bg-bg-primary text-text-secondary hover:text-text-primary hover:border-text-disabled inline-flex h-7 items-center rounded border px-2.5 text-[12px] transition-colors";

function Muestra(props: { clase: string; estilo?: CSSProperties; children: string }): JSX.Element {
  return (
    <li className="inline-flex items-center gap-1.5">
      <i
        aria-hidden="true"
        className={`border-border-main inline-block h-3 w-3.5 rounded-[2px] border ${props.clase}`}
        style={props.estilo}
      />
      {props.children}
    </li>
  );
}

function Banda(props: {
  e: Edificio;
  g: GrupoPlantas;
  seleccion: Seleccion | null;
  onSeleccionar: (s: Seleccion) => void;
  onAnadirZona?: (grupoId: string) => void;
}): JSX.Element {
  const { e, g, seleccion, onSeleccionar, onAnadirZona } = props;
  const n = Math.max(1, g.repeticiones);
  const bajo = esBajoRasante(g);
  const nombre = nombreGrupo(g);
  const cotas = cotasGrupo(e, g.id);
  const cotaTxt = cotas
    ? n > 1
      ? `${formatoCota(cotas.baja)} a ${formatoCota(cotas.alta)}`
      : formatoCota(cotas.baja)
    : "";
  const alturaPlanta = Math.max(1, Math.round(g.altura_m * PX_POR_M));
  const alto = Math.max(ALTO_MIN_BANDA, alturaPlanta * Math.min(n, MAX_PLANTAS_DIBUJADAS));
  const grupoSel = seleccion?.tipo === "grupo" && seleccion.id === g.id;
  const esPB = g.nivelInicial === 0;

  return (
    <div role="listitem" className="flex flex-col gap-1.5">
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          aria-pressed={grupoSel}
          aria-label={`${nombre.largo}${n > 1 ? `, ${n} plantas iguales` : ""}, ${g.altura_m.toFixed(2).replace(".", ",")} m de altura, cota ${cotaTxt}`}
          onClick={() => onSeleccionar({ tipo: "grupo", id: g.id })}
          className={[
            CANALON,
            grupoSel
              ? "border-accent shadow-[inset_3px_0_0_var(--color-accent)]"
              : "border-border-main hover:border-text-disabled",
          ].join(" ")}
        >
          <span className="text-text-primary flex flex-wrap items-center gap-1.5 text-[13.5px] font-semibold">
            {nombre.corto}
            {n > 1 && (
              <span className="text-accent bg-tint-accent rounded-[3px] px-[5px] py-px font-mono text-[11px] font-semibold">
                × {n}
              </span>
            )}
          </span>
          <span className="text-text-disabled font-mono text-[10.5px]">
            {g.altura_m.toFixed(2).replace(".", ",")} m
          </span>
          <span className="text-text-disabled font-mono text-[10.5px] max-sm:hidden">{cotaTxt}</span>
        </button>

        <div className="flex min-w-0 flex-1 gap-1" style={{ height: alto }}>
          {g.zonas.map((z) => {
            const def = USOS[z.uso];
            const sel = seleccion?.tipo === "zona" && seleccion.id === z.id;
            const fondos: string[] = [];
            if (n > 1) {
              fondos.push(
                `repeating-linear-gradient(to bottom, transparent 0 ${alturaPlanta - 2}px, var(--color-border-main) ${alturaPlanta - 2}px ${alturaPlanta - 1}px)`,
              );
            }
            if (def.familia === "local") fondos.push(RAYADO);
            const detalle = detalleZona(e, z);
            const sup = supTexto(z.superficieUtil_m2) + (n > 1 ? " por planta" : "");
            return (
              <button
                key={z.id}
                type="button"
                aria-pressed={sel}
                aria-label={`${nombre.corto}: ${def.etiqueta}, ${detalle}, ${sup}`}
                onClick={() => onSeleccionar({ tipo: "zona", id: z.id })}
                style={{
                  flex: `${Math.max(20, z.superficieUtil_m2)} 1 0`,
                  backgroundImage: fondos.length > 0 ? fondos.join(", ") : undefined,
                }}
                className={[
                  "flex min-w-[56px] flex-col justify-center gap-px overflow-hidden rounded border px-2.5 py-1 text-left transition-colors max-sm:px-1.5 sm:min-w-[96px]",
                  FONDO[def.familia],
                  bajo ? "border-dashed" : "",
                  sel
                    ? "border-accent shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-accent)_35%,transparent)]"
                    : "border-border-main hover:border-text-disabled",
                ].join(" ")}
              >
                <b className="text-text-primary truncate text-[12.5px] font-semibold">{def.etiqueta}</b>
                <span className="text-text-secondary truncate text-[11.5px]">{detalle}</span>
                <em className="text-text-disabled truncate font-mono text-[11px] not-italic">{sup}</em>
              </button>
            );
          })}
          {onAnadirZona && (
            <button
              type="button"
              aria-label={`Añadir zona en ${nombre.largo.toLowerCase()}`}
              onClick={() => onAnadirZona(g.id)}
              className="border-border-main text-text-disabled hover:text-text-primary hover:border-text-disabled w-[34px] shrink-0 rounded border border-dashed text-[16px] transition-colors max-sm:w-6"
            >
              +
            </button>
          )}
        </div>
      </div>
      {esPB && (
        <div
          role="separator"
          aria-label="Rasante, cota ±0,00"
          className="text-text-secondary my-0.5 flex items-center gap-2.5 font-mono text-[10.5px] tracking-[0.06em] sm:ml-[124px]"
        >
          <span>RASANTE ±0,00</span>
          <i aria-hidden="true" className="bg-text-secondary h-0.5 flex-1" />
        </div>
      )}
    </div>
  );
}
