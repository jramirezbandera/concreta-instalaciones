import { useEffect, useState, type JSX, type ReactNode } from "react";
import { Link } from "react-router";
import { MoreHorizontal, Paperclip } from "lucide-react";
import { useProyecto } from "../../lib/proyecto/ProyectoContext";
import {
  justificacionesPorGrupo,
  type JustificacionEntry,
} from "../../data/justificacionRegistry";
import { estadoDe, resumenProyecto } from "../../lib/proyecto/progreso";
import type { EstadoJustificacion, JustificacionKey } from "../../lib/proyecto/tipos";
import { ChipEstado } from "./ChipEstado";

// Checklist de justificaciones del dashboard (feature-6 T3.5, UX-RECONCEPT §4.2).
// Fuente de verdad: justificacionRegistry agrupado (sin entradas dev) × estadoDe
// (aplicabilidad efectiva × progreso derivado). Las filas cuya aplicabilidad
// efectiva es `no_aplica` o `externo` salen de su grupo normativo y se agrupan
// al final en "No aplicables" y "Externas" (wireframe §4.2). La herramienta
// propone, el proyectista dispone: cada fila lleva un menú ⋯ para forzar la
// aplicabilidad (forzarAplicabilidad del contexto).
//
// TODAS LAS PIEZAS DE FILA VIVEN A NIVEL DE MÓDULO, no anidadas en el
// componente (QA 1.6): un componente definido dentro del cuerpo del padre es un
// TIPO NUEVO en cada render, así que React desmonta y remonta su subárbol en
// cada cambio de estado. Eso tiraba el foco justo al abrir el menú ⋯ y dejaba
// muertos sus tres cierres (blur, Escape, y el toggle del propio botón).
//
// El cierre por clic fuera NO se confía al foco: escucha `pointerdown` en el
// documento y cierra salvo que el clic caiga dentro de `[data-menu-fila]`
// (mismo patrón que SelectorMunicipio). Así funciona aunque el clic vaya a un
// elemento no enfocable, que es el caso normal en esta pantalla.

interface Fila {
  entry: JustificacionEntry;
  key: JustificacionKey;
  estado: EstadoJustificacion;
}

/** Acciones del menú ⋯, inyectadas desde el componente con acceso al contexto. */
interface AccionesMenu {
  forzarNoAplica: (key: JustificacionKey) => void;
  forzarAplica: (key: JustificacionKey) => void;
  quitarForzado: (key: JustificacionKey) => void;
}

/** Cabecera de grupo — mismo lenguaje que los grupos del Sidebar. */
function TituloGrupo({ children }: { children: ReactNode }): JSX.Element {
  return (
    <div className="text-text-disabled mt-3 mb-1 px-2 text-[10px] font-semibold tracking-[0.07em] uppercase first:mt-0">
      {children}
    </div>
  );
}

/** Badge "Próx." de las no shipped (patrón Sidebar). */
function BadgeProx(): JSX.Element {
  return <span className="text-text-disabled shrink-0 text-[10px]">Próx.</span>;
}

/** Badge de aplicabilidad forzada por el proyectista. */
function BadgeForzado({ nota }: { nota?: string }): JSX.Element {
  return (
    <span
      title={nota}
      className="bg-tint-warn text-state-warn shrink-0 rounded-full px-1.5 py-0.5 text-[10px] whitespace-nowrap"
    >
      forzado por el proyectista
    </span>
  );
}

/** Código (mono, ancho fijo) + label — el cuerpo común de toda fila. */
function CuerpoFila({ fila }: { fila: Fila }): JSX.Element {
  return (
    <>
      <span className="text-text-disabled w-14 shrink-0 font-mono text-[11px]">
        {fila.entry.codigo}
      </span>
      <span className="text-text-primary min-w-0 flex-1 truncate text-[13px]">
        {fila.entry.label}
      </span>
    </>
  );
}

const CLASE_ITEM_MENU =
  "text-text-secondary hover:bg-bg-elevated hover:text-text-primary block w-full px-3 py-1.5 text-left text-[12px] transition-colors";

function MenuFila(props: {
  fila: Fila;
  abierto: boolean;
  onToggle: (key: JustificacionKey) => void;
  acciones: AccionesMenu;
}): JSX.Element {
  const { fila, abierto, onToggle, acciones } = props;
  return (
    // `data-menu-fila` es la marca que usa el listener de clic fuera del padre.
    <div className="relative shrink-0" data-menu-fila={fila.key}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Opciones de aplicabilidad de ${fila.entry.codigo}`}
        onClick={() => onToggle(fila.key)}
        className="text-text-disabled hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-accent rounded p-1 transition-colors focus-visible:outline-2"
      >
        <MoreHorizontal size={15} aria-hidden="true" />
      </button>
      {abierto && (
        <div
          role="menu"
          aria-label={`Aplicabilidad de ${fila.entry.codigo}`}
          className="border-border-main bg-bg-primary absolute top-full right-0 z-20 mt-1 w-48 rounded-md border py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => acciones.forzarNoAplica(fila.key)}
            className={CLASE_ITEM_MENU}
          >
            Forzar no aplica…
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => acciones.forzarAplica(fila.key)}
            className={CLASE_ITEM_MENU}
          >
            Forzar aplica
          </button>
          {fila.estado.forzada && (
            <button
              type="button"
              role="menuitem"
              onClick={() => acciones.quitarForzado(fila.key)}
              className={CLASE_ITEM_MENU}
            >
              Quitar forzado
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Fila estándar de grupo normativo: shipped → Link a su ruta; resto inerte. */
function FilaNormal({ fila, menu }: { fila: Fila; menu: ReactNode }): JSX.Element {
  const navegable = fila.entry.shipped && fila.entry.route !== undefined;
  return (
    <li className="border-border-sub flex min-h-9 items-center gap-2 border-b px-2 last:border-b-0">
      {navegable ? (
        <Link
          to={fila.entry.route ?? "."}
          className="hover:bg-bg-elevated focus-visible:outline-accent -mx-1 flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 transition-colors focus-visible:outline-2"
        >
          <CuerpoFila fila={fila} />
        </Link>
      ) : (
        <div
          className="flex min-w-0 flex-1 cursor-not-allowed items-center gap-2 py-1 opacity-70"
          aria-disabled="true"
        >
          <CuerpoFila fila={fila} />
          <BadgeProx />
        </div>
      )}
      {fila.estado.forzada && <BadgeForzado nota={fila.estado.nota} />}
      <ChipEstado estado={fila.estado} />
      {menu}
    </li>
  );
}

/** Fila del bloque "No aplicables": nota redactada en title, párrafo listo. */
function FilaNoAplica({ fila, menu }: { fila: Fila; menu: ReactNode }): JSX.Element {
  return (
    <li
      title={fila.estado.nota}
      className="border-border-sub flex min-h-9 items-center gap-2 border-b px-2 last:border-b-0"
    >
      <CuerpoFila fila={fila} />
      {fila.estado.nota !== undefined && (
        <span className="text-state-ok shrink-0 text-[11px]">Párrafo listo</span>
      )}
      {fila.estado.forzada && <BadgeForzado nota={fila.estado.nota} />}
      <ChipEstado estado={fila.estado} />
      {menu}
    </li>
  );
}

/** Fila del bloque "Externas": destino + referencia de documento adjuntable. */
function FilaExterna(props: {
  fila: Fila;
  menu: ReactNode;
  refExterna: string | undefined;
  onAdjuntarRef: (key: JustificacionKey) => void;
}): JSX.Element {
  const { fila, menu, refExterna, onAdjuntarRef } = props;
  const destino = fila.entry.externo?.destino;
  return (
    <li className="border-border-sub flex min-h-9 items-center gap-2 border-b px-2 last:border-b-0">
      <CuerpoFila fila={fila} />
      {destino !== undefined && (
        <span className="text-text-disabled shrink-0 text-[11px] whitespace-nowrap">
          → {destino}
        </span>
      )}
      {refExterna !== undefined ? (
        <button
          type="button"
          onClick={() => onAdjuntarRef(fila.key)}
          title="Referencia del documento externo — pulsar para editar"
          className="text-text-secondary hover:text-text-primary focus-visible:outline-accent max-w-40 shrink-0 truncate font-mono text-[11px] underline decoration-dotted underline-offset-2 focus-visible:outline-2"
        >
          {refExterna}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => onAdjuntarRef(fila.key)}
          className="border-border-main text-text-secondary hover:bg-bg-elevated hover:text-text-primary focus-visible:outline-accent flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] transition-colors focus-visible:outline-2"
        >
          <Paperclip size={11} aria-hidden="true" />
          Adjuntar ref.
        </button>
      )}
      {fila.estado.forzada && <BadgeForzado nota={fila.estado.nota} />}
      <ChipEstado estado={fila.estado} />
      {menu}
    </li>
  );
}

export function ChecklistJustificaciones(): JSX.Element {
  const { proyecto, forzarAplicabilidad, setRefExterna } = useProyecto();
  const [menuAbierto, setMenuAbierto] = useState<JustificacionKey | null>(null);

  // Cierre del menú ⋯: clic fuera (pointerdown en el documento) y Escape. No se
  // confía en el foco — el clic suele caer en texto no enfocable y entonces no
  // hay blur que escuchar. Los clics DENTRO de un menú (o en su propio botón)
  // los excluye `[data-menu-fila]`, para que el item llegue a ejecutarse y el
  // botón pueda alternar.
  useEffect(() => {
    if (menuAbierto === null) return;
    function alPulsarFuera(e: PointerEvent): void {
      const t = e.target;
      if (t instanceof Element && t.closest("[data-menu-fila]") !== null) return;
      setMenuAbierto(null);
    }
    function alTeclear(e: KeyboardEvent): void {
      if (e.key === "Escape") setMenuAbierto(null);
    }
    document.addEventListener("pointerdown", alPulsarFuera);
    window.addEventListener("keydown", alTeclear);
    return () => {
      document.removeEventListener("pointerdown", alPulsarFuera);
      window.removeEventListener("keydown", alTeclear);
    };
  }, [menuAbierto]);

  // Filas computadas por grupo (sin entradas de desarrollo).
  const porGrupo = justificacionesPorGrupo()
    .map((g) => ({
      grupo: g.grupo,
      filas: g.entradas
        .filter((e) => !e.dev)
        .map((e): Fila => {
          const key = e.key as JustificacionKey; // sin dev, la key es del expediente
          return { entry: e, key, estado: estadoDe(proyecto, key) };
        }),
    }))
    .filter((g) => g.filas.length > 0);

  // Partición: no aplicables y externas salen de su grupo normativo.
  const noAplicables: Fila[] = [];
  const externas: Fila[] = [];
  const grupos = porGrupo
    .map((g) => ({
      grupo: g.grupo,
      filas: g.filas.filter((f) => {
        if (f.estado.aplicabilidad === "no_aplica") {
          noAplicables.push(f);
          return false;
        }
        if (f.estado.aplicabilidad === "externo") {
          externas.push(f);
          return false;
        }
        return true;
      }),
    }))
    .filter((g) => g.filas.length > 0);

  const r = resumenProyecto(proyecto);

  // ── Acciones ───────────────────────────────────────────────────────────────

  const acciones: AccionesMenu = {
    forzarNoAplica(key) {
      const nota = window.prompt(
        "Forzar «no aplica» — nota justificativa para la memoria (opcional):",
      );
      if (nota === null) {
        setMenuAbierto(null); // cancelado: el menú ya cumplió su papel
        return;
      }
      forzarAplicabilidad(key, "no_aplica", nota.trim() !== "" ? nota.trim() : undefined);
      setMenuAbierto(null);
    },
    forzarAplica(key) {
      forzarAplicabilidad(key, "aplica");
      setMenuAbierto(null);
    },
    quitarForzado(key) {
      forzarAplicabilidad(key, null);
      setMenuAbierto(null);
    },
  };

  function onAdjuntarRef(key: JustificacionKey): void {
    const actual = proyecto.justificaciones[key]?.refExterna ?? "";
    const ref = window.prompt(
      "Referencia del documento externo (expediente, archivo, código):",
      actual,
    );
    if (ref === null) return; // cancelado
    setRefExterna(key, ref.trim());
  }

  function onToggle(key: JustificacionKey): void {
    setMenuAbierto((m) => (m === key ? null : key));
  }

  /** Menú de una fila, ya cableado (las filas solo lo colocan). */
  function menuDe(fila: Fila): ReactNode {
    return (
      <MenuFila
        fila={fila}
        abierto={menuAbierto === fila.key}
        onToggle={onToggle}
        acciones={acciones}
      />
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <section
      aria-label="Checklist de justificaciones"
      className="border-border-main bg-bg-surface rounded-md border"
    >
      <div className="border-border-main flex items-baseline justify-between gap-2 border-b px-3 py-2.5">
        <h2 className="text-text-primary text-[13px] font-semibold">Justificaciones</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-text-secondary font-mono text-[12px]">
            {r.cumplen}/{r.aplicables}
          </span>
          {r.noCumplen > 0 && (
            <span className="text-state-fail text-[12px] font-medium">{r.noCumplen} ✗</span>
          )}
        </div>
      </div>

      <div className="px-1.5 py-2">
        {grupos.map((g) => (
          <div key={g.grupo}>
            <TituloGrupo>{g.grupo}</TituloGrupo>
            <ul className="list-none">
              {g.filas.map((f) => (
                <FilaNormal key={f.key} fila={f} menu={menuDe(f)} />
              ))}
            </ul>
          </div>
        ))}

        {noAplicables.length > 0 && (
          <div>
            <TituloGrupo>No aplicables</TituloGrupo>
            <ul className="list-none">
              {noAplicables.map((f) => (
                <FilaNoAplica key={f.key} fila={f} menu={menuDe(f)} />
              ))}
            </ul>
          </div>
        )}

        {externas.length > 0 && (
          <div>
            <TituloGrupo>Externas</TituloGrupo>
            <ul className="list-none">
              {externas.map((f) => (
                <FilaExterna
                  key={f.key}
                  fila={f}
                  menu={menuDe(f)}
                  refExterna={proyecto.justificaciones[f.key]?.refExterna}
                  onAdjuntarRef={onAdjuntarRef}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
