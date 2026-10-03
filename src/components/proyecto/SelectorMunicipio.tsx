import { useEffect, useId, useRef, useState, type JSX, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";
import type { MunicipioINE } from "../../data/municipios";

// =============================================================================
// SelectorMunicipio (feature-9) — el municipio deja de ser texto libre.
//
// POR QUÉ: el municipio es una CLAVE de cruce con las tablas normativas que
// clasifican por municipio (zona de radón del DB-HS6 Apéndice B, aceleración
// sísmica NCSE-02, pluviometría…), no una etiqueta. Escrito a mano, "Vitoria",
// "Vitoria-Gasteiz" y "Gasteiz" son tres municipios distintos; con el código
// INE son uno. Aquí se elige de la lista OFICIAL filtrada por provincia y se
// devuelve el código INE junto al nombre.
//
// COMBOBOX PROPIO, NO <datalist>: el desplegable nativo ignora los tokens del
// tema, se despliega con la altura que quiere (tapaba el panel de derivados) y
// no se puede acotar ni estilar. Aquí la lista es nuestra: colores de la app,
// alto máximo con scroll, resultados acotados y teclado completo.
//
// LA ALTITUD NO VIENE DE AQUÍ: se evaluó traerla por municipio y se descartó
// porque la única fuente masiva disponible mezcla criterios (ver la nota de
// alcance en `data/municipios.ts`). El formulario sugiere la altitud SOLO
// cuando el municipio elegido es la capital de su provincia, usando el valor
// verificado de `zonasClimaticasHE`.
//
// CARGA: el listado (~8.100 municipios) se importa de forma DINÁMICA y solo
// cuando hay provincia elegida, para no engordar el arranque de la app.
//
// ENTRADA LIBRE TOLERADA: si el texto no casa con ningún municipio de la
// provincia se guarda igual (municipios fusionados, altas recientes), pero sin
// código INE y avisando de lo que se pierde. Bloquearlo sería mentir sobre la
// completitud del listado.
//
// ACCESIBILIDAD: patrón combobox de WAI-ARIA — `role="combobox"` con
// `aria-expanded`/`aria-activedescendant` sobre un `role="listbox"`. Teclado:
// ↑↓ recorre, Enter elige, Esc cierra, Tab sale. El foco NUNCA salta a la
// lista: se queda en el input y la opción activa se anuncia por descripción.
// =============================================================================

export interface CambioMunicipio {
  municipio: string;
  /** `undefined` si el texto no casa con ningún municipio de la provincia. */
  municipioIne?: string;
}

interface SelectorMunicipioProps {
  /** Provincia ya elegida (clave de `MUNICIPIOS_POR_PROVINCIA`). "" = sin elegir. */
  provincia: string;
  /** Nombre actual del municipio (lo que se muestra). */
  municipio: string;
  onChange: (cambio: CambioMunicipio) => void;
  className?: string;
}

/** Cuántas opciones se pintan a la vez (de 8.132 no se renderizan miles de nodos). */
const MAX_VISIBLES = 40;

/** Normaliza para comparar: sin acentos, sin mayúsculas, sin espacios sobrantes. */
function clave(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Filtra por coincidencia normalizada, con los que EMPIEZAN por el texto
 * primero (buscar "cor" en A Coruña debe ofrecer "Corcubión" antes que
 * "Mazaricos"). Devuelve también cuántos quedaron fuera del recorte.
 */
function filtrar(
  lista: readonly MunicipioINE[],
  texto: string,
): { visibles: readonly MunicipioINE[]; ocultos: number } {
  const q = clave(texto);
  const casan =
    q === "" ? lista : lista.filter((m) => clave(m.nombre).includes(q));
  const ordenados =
    q === ""
      ? casan
      : [...casan].sort((a, b) => {
          const pa = clave(a.nombre).startsWith(q) ? 0 : 1;
          const pb = clave(b.nombre).startsWith(q) ? 0 : 1;
          return pa !== pb ? pa - pb : a.nombre.localeCompare(b.nombre, "es");
        });
  return {
    visibles: ordenados.slice(0, MAX_VISIBLES),
    ocultos: Math.max(0, ordenados.length - MAX_VISIBLES),
  };
}

export function SelectorMunicipio({
  provincia,
  municipio,
  onChange,
  className,
}: SelectorMunicipioProps): JSX.Element {
  const idBase = useId();
  const listboxId = `${idBase}-lista`;
  const avisoId = `${idBase}-aviso`;

  // El cache guarda a QUÉ provincia pertenece la lista, para DERIVAR si sirve
  // para la provincia actual en vez de resetearla desde el efecto.
  const [cache, setCache] = useState<{
    provincia: string;
    lista: readonly MunicipioINE[];
  } | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  // `false` mientras la lista solo se ha ABIERTO (foco, flecha): entonces se
  // ofrece el listado completo. Pasa a `true` al TECLEAR, que es cuando el
  // texto debe filtrar. Sin esta distinción, volver a un municipio ya elegido
  // mostraría una lista de un solo elemento: el que ya está puesto.
  const [filtrando, setFiltrando] = useState(false);

  const contenedorRef = useRef<HTMLDivElement>(null);
  const listaRef = useRef<HTMLUListElement>(null);

  const lista = cache !== null && cache.provincia === provincia ? cache.lista : null;
  const cargando = provincia !== "" && lista === null;
  const sinProvincia = provincia === "";

  useEffect(() => {
    if (provincia === "") return;
    let cancelado = false;
    void import("../../data/municipios")
      .then((mod) => {
        if (cancelado) return;
        setCache({ provincia, lista: mod.MUNICIPIOS_POR_PROVINCIA[provincia] ?? [] });
      })
      .catch(() => {
        // Sin listado, el campo sigue siendo un input de texto utilizable.
      });
    return () => {
      cancelado = true;
    };
  }, [provincia]);

  // Cierre al hacer clic fuera (el clic EN una opción se resuelve antes, en
  // onMouseDown, para que no lo cancele el blur del input).
  useEffect(() => {
    if (!abierto) return;
    function alPulsarFuera(e: MouseEvent): void {
      if (!contenedorRef.current?.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", alPulsarFuera);
    return () => document.removeEventListener("mousedown", alPulsarFuera);
  }, [abierto]);

  const { visibles, ocultos } =
    lista === null ? { visibles: [], ocultos: 0 } : filtrar(lista, filtrando ? municipio : "");

  const elegido =
    lista?.find((m) => clave(m.nombre) === clave(municipio)) ?? undefined;
  // El aviso juzga el NOMBRE contra el listado, no si hay código INE: un
  // expediente anterior a feature-9 tiene municipio válido y aún sin código.
  const noReconocido =
    !sinProvincia && lista !== null && municipio.trim() !== "" && elegido === undefined;

  /** Mantiene la opción activa a la vista al recorrer con el teclado. */
  function asegurarVisible(indice: number): void {
    const nodo = listaRef.current?.children[indice] as HTMLElement | undefined;
    nodo?.scrollIntoView({ block: "nearest" });
  }

  function elegir(m: MunicipioINE): void {
    onChange({ municipio: m.nombre, municipioIne: m.ine });
    setAbierto(false);
    setFiltrando(false);
  }

  function alEscribir(texto: string): void {
    const encontrado = lista?.find((m) => clave(m.nombre) === clave(texto));
    onChange({ municipio: texto, municipioIne: encontrado?.ine });
    setAbierto(true);
    setFiltrando(true);
    setActivo(0);
  }

  function alTeclear(e: KeyboardEvent<HTMLInputElement>): void {
    if (sinProvincia) return;
    switch (e.key) {
      case "ArrowDown": {
        e.preventDefault();
        if (!abierto) {
          setAbierto(true);
          setActivo(0);
          return;
        }
        const siguiente = Math.min(activo + 1, visibles.length - 1);
        setActivo(siguiente);
        asegurarVisible(siguiente);
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        const anterior = Math.max(activo - 1, 0);
        setActivo(anterior);
        asegurarVisible(anterior);
        break;
      }
      case "Enter": {
        if (abierto && visibles[activo] !== undefined) {
          e.preventDefault();
          elegir(visibles[activo]);
        }
        break;
      }
      case "Escape":
        setAbierto(false);
        break;
      case "Tab":
        setAbierto(false);
        break;
    }
  }

  return (
    <div ref={contenedorRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <input
          id="dg-municipio"
          type="text"
          role="combobox"
          aria-expanded={abierto}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            abierto && visibles[activo] !== undefined ? `${idBase}-op-${activo}` : undefined
          }
          aria-label="Municipio"
          aria-describedby={noReconocido ? avisoId : undefined}
          autoComplete="off"
          value={municipio}
          disabled={sinProvincia}
          onChange={(e) => alEscribir(e.target.value)}
          onFocus={() => {
            setAbierto(true);
            setFiltrando(false); // al volver al campo se ofrece todo el listado
            setActivo(0);
          }}
          onKeyDown={alTeclear}
          placeholder={
            sinProvincia
              ? "Elige antes la provincia"
              : cargando
                ? "Cargando municipios…"
                : "Escribe para buscar"
          }
          className="border-border-main bg-bg-primary text-text-primary focus:border-accent w-full rounded border py-1 pr-7 pl-2 text-[13px] transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        />
        {/* Marca de municipio reconocido: el dato ya tiene clave INE. */}
        {elegido !== undefined ? (
          <Check
            size={14}
            aria-hidden="true"
            className="text-state-ok pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
          />
        ) : (
          <ChevronDown
            size={14}
            aria-hidden="true"
            className="text-text-disabled pointer-events-none absolute top-1/2 right-2 -translate-y-1/2"
          />
        )}
      </div>

      {abierto && !sinProvincia && lista !== null && (
        <ul
          ref={listaRef}
          id={listboxId}
          role="listbox"
          aria-label={`Municipios de ${provincia}`}
          className="border-border-main bg-bg-surface absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded border py-1"
        >
          {visibles.length === 0 && (
            <li className="text-text-disabled px-2 py-1.5 text-[12px]">
              Ningún municipio de {provincia} coincide.
            </li>
          )}
          {visibles.map((m, i) => (
            <li
              key={m.ine}
              id={`${idBase}-op-${i}`}
              role="option"
              aria-selected={i === activo}
              // onMouseDown (no onClick): se adelanta al blur del input, que
              // si no cerraría la lista antes de registrar la elección.
              onMouseDown={(e) => {
                e.preventDefault();
                elegir(m);
              }}
              onMouseEnter={() => setActivo(i)}
              className={`flex cursor-pointer items-baseline justify-between gap-2 px-2 py-1 text-[13px] ${
                i === activo ? "bg-tint-accent text-text-primary" : "text-text-secondary"
              }`}
            >
              <span className="truncate">{m.nombre}</span>
              <span className="text-text-disabled shrink-0 font-mono text-[10px]">{m.ine}</span>
            </li>
          ))}
          {ocultos > 0 && (
            <li className="text-text-disabled border-border-sub mt-1 border-t px-2 pt-1.5 text-[11px]">
              y {ocultos} más — sigue escribiendo para acotar
            </li>
          )}
        </ul>
      )}

      {noReconocido && (
        <p id={avisoId} className="text-state-warn mt-0.5 text-[11px] leading-snug">
          No está en el listado oficial de {provincia}. Puedes guardarlo, pero sin código
          INE no podrá cruzarse con las tablas que clasifican por municipio.
        </p>
      )}
    </div>
  );
}
