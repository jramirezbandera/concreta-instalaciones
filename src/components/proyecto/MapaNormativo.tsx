// =============================================================================
// MapaNormativo — botón ⌖ junto a un campo de Datos de la obra que abre, al
// momento, el mapa del CTE del que se lee esa zona. Varias zonas (pluviometría
// HS1 y HS5, viento, Ng) el DB solo las da en un MAPA, no por municipio: no se
// pueden derivar con rigor del emplazamiento, pero el proyectista no tiene por
// qué ir a buscar el PDF. Las figuras se extraen de los PDF oficiales con
// scripts/extraer-mapas-cte.py y van precacheadas (funcionan sin conexión).
//
// El Ld no tiene mapa en el CTE: se enlaza al visor oficial de los mapas
// estratégicos de ruido (SICA) en una pestaña nueva.
// =============================================================================

import { useEffect, useRef, useState, type JSX } from "react";
import { ExternalLink, Map as MapaIcon, X } from "lucide-react";

export type ClaveMapa = "hs1-fig2-4" | "hs1-fig2-5" | "hs5-figB-1" | "sua8-fig1-1";

interface FichaMapa {
  titulo: string;
  cita: string;
  /** Qué hay que leer en el mapa y qué hacer en los casos dudosos. */
  comoLeer: string;
}

const MAPAS: Record<ClaveMapa, FichaMapa> = {
  "hs1-fig2-4": {
    titulo: "Zonas pluviométricas de promedios",
    cita: "DB-HS1, figura 2.4",
    comoLeer:
      "Localiza el municipio y lee el número romano (I a V) del recinto en que cae. I es la zona más lluviosa.",
  },
  "hs1-fig2-5": {
    titulo: "Zonas eólicas",
    cita: "DB-HS1, figura 2.5",
    comoLeer: "Lee la letra de la zona (A, B o C) en que cae el municipio. Canarias es zona C.",
  },
  "hs5-figB-1": {
    titulo: "Mapa de isoyetas y zonas pluviométricas",
    cita: "DB-HS5, apéndice B, figura B.1",
    comoLeer:
      "La línea gruesa separa la zona A de la B (las letras grandes indican cada lado). Las curvas finas son las isoyetas: toma la que corresponde al municipio; si cae entre dos, la de valor mayor queda del lado de la seguridad.",
  },
  "sua8-fig1-1": {
    titulo: "Densidad de impactos sobre el terreno Ng",
    cita: "DB-SUA 8, figura 1.1",
    comoLeer:
      "Lee el valor del recinto en que cae el municipio, en impactos/año·km². Si cae sobre una línea o entre dos zonas, toma el mayor.",
  },
};

const BTN_CLS =
  "text-text-disabled hover:text-accent focus-visible:ring-accent/40 -m-0.5 inline-flex shrink-0 cursor-pointer " +
  "items-center rounded p-0.5 transition-colors focus-visible:ring-2 focus-visible:outline-none";

/** Botón que abre el mapa normativo de un campo. */
export function BotonMapa({ mapa }: { mapa: ClaveMapa }): JSX.Element {
  const [abierto, setAbierto] = useState(false);
  const ficha = MAPAS[mapa];
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        aria-label={`Ver el mapa: ${ficha.titulo} (${ficha.cita})`}
        title={`Ver el mapa (${ficha.cita})`}
        className={BTN_CLS}
      >
        <MapaIcon size={14} aria-hidden="true" />
      </button>
      {abierto && <VisorMapa mapa={mapa} onClose={() => setAbierto(false)} />}
    </>
  );
}

/** Enlace a un visor externo (p. ej. SICA para el Ld), en pestaña nueva. */
export function EnlaceVisor({ href, etiqueta }: { href: string; etiqueta: string }): JSX.Element {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={etiqueta} title={etiqueta} className={BTN_CLS}>
      <MapaIcon size={14} aria-hidden="true" />
      <ExternalLink size={10} aria-hidden="true" className="ml-px" />
    </a>
  );
}

function VisorMapa({ mapa, onClose }: { mapa: ClaveMapa; onClose: () => void }): JSX.Element {
  const ficha = MAPAS[mapa];
  const dialogRef = useRef<HTMLDivElement>(null);
  // Ajustado a la ventana por defecto; un clic lo pasa a tamaño real (con
  // desplazamiento) para leer las cifras pequeñas, y otro lo devuelve.
  const [ampliado, setAmpliado] = useState(false);

  useEffect(() => {
    dialogRef.current?.focus();
    function alPulsar(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", alPulsar);
    return () => window.removeEventListener("keydown", alPulsar);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 backdrop-blur-[2px] sm:px-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mapa-titulo"
        className="border-border-main bg-bg-surface flex max-h-[94vh] w-[1200px] max-w-full flex-col rounded-md border shadow-2xl focus:outline-none"
      >
        <div className="border-border-main flex shrink-0 items-start gap-3 border-b px-5 py-3">
          <MapaIcon size={16} className="text-accent mt-0.5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <h2 id="mapa-titulo" className="text-text-primary text-sm font-medium">
              {ficha.titulo} <span className="text-text-disabled font-mono text-[12px] font-normal">· {ficha.cita}</span>
            </h2>
            <p className="text-text-secondary mt-0.5 text-[12px] leading-snug">{ficha.comoLeer}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar el mapa"
            className="text-text-secondary hover:bg-bg-elevated hover:text-text-primary shrink-0 rounded p-1.5 transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-white p-2">
          <img
            src={`${import.meta.env.BASE_URL}mapas/${mapa}.webp`}
            alt={`${ficha.titulo} (${ficha.cita})`}
            onClick={() => setAmpliado((a) => !a)}
            className={
              ampliado
                ? "max-w-none cursor-zoom-out"
                : "mx-auto max-h-[calc(94vh-7rem)] w-auto max-w-full cursor-zoom-in object-contain"
            }
          />
        </div>
        <p className="text-text-disabled border-border-main shrink-0 border-t px-5 py-1.5 text-[11px]">
          {ampliado ? "Clic en el mapa para ajustarlo a la ventana." : "Clic en el mapa para verlo a tamaño real."} Reproducido del
          documento básico oficial.
        </p>
      </div>
    </div>
  );
}
