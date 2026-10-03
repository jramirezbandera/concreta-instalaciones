import { useContext, useEffect } from "react";
import type { JSX, ReactNode } from "react";
import { Topbar } from "../layout/Topbar";
import { useDrawer } from "../layout/AppShell";
import { getJustificacion } from "../../data/justificacionRegistry";
import { ProyectoContext } from "../../lib/proyecto/ProyectoContext";
import type { JustificacionKey, Veredicto } from "../../lib/proyecto/tipos";
import { BarraContexto } from "./BarraContexto";
import { BandaVeredicto } from "./BandaVeredicto";

// Cáscara común de módulo (feature-6 T3.3): Topbar + barra de contexto heredado +
// banda de veredicto, con la zona de trabajo del módulo como children. Sustituye
// al patrón Topbar+banda inline duplicado en cada `ui.tsx`. Los contratos
// (ResumenVeredicto, HerenciaBinding) se exportan DESDE AQUÍ: el hook de
// herencia de la tarea paralela los importa de este archivo.

/** Resumen del resultado del motor para la banda de veredicto. */
export interface ResumenVeredicto {
  veredicto: Veredicto;
  /** Sujeto de la comprobación: "Red de evacuación", "Instalación de ventilación"… */
  sujeto: string;
  /** Matiz entre paréntesis tras el sujeto: "uso privado", "zona Y"… */
  contexto?: string;
  /** Métricas clave en una línea: "24 UD totales · bajante Ø90 · colector Ø110". */
  metricas?: string;
  /** Cita normativa mostrada a la derecha; si falta se usa la edición del DB. */
  cita?: string;
}

/** Binding del contexto heredado del proyecto (lo produce el hook de herencia). */
export interface HerenciaBinding {
  campos: {
    campo: string;
    etiqueta: string;
    valorProyecto: unknown;
    valorActual: unknown;
    override: boolean;
    editor: {
      tipo: "number" | "select" | "boolean" | "text";
      opciones?: { valor: string; etiqueta: string }[];
      unidad?: string;
    };
  }[];
  toggleOverride(campo: string, activo: boolean): void;
  setCampo(campo: string, valor: unknown): void;
}

export interface ModuleShellProps {
  justificacionKey: JustificacionKey | "smoke";
  /** null → banda neutra "Datos insuficientes para el cálculo". */
  resultado: ResumenVeredicto | null;
  herencia?: HerenciaBinding;
  acciones?: {
    onExportPdf?: () => void;
    pdfExporting?: boolean;
    onShare?: () => void;
    onReset?: () => void;
  };
  /** Zona de trabajo del módulo TAL CUAL (incluye su MobileTabBar y paneles). */
  children: ReactNode;
}

export function ModuleShell({
  justificacionKey,
  resultado,
  herencia,
  acciones,
  children,
}: ModuleShellProps): JSX.Element {
  const { openDrawer } = useDrawer();
  // Tolerante a la ausencia de proyecto (sandbox _smoke): useContext directo,
  // NUNCA useProyecto() (que lanza fuera del provider).
  const ctx = useContext(ProyectoContext);
  const entry = getJustificacion(justificacionKey);

  const moduleLabel = entry ? `${entry.codigo} · ${entry.label}` : justificacionKey;
  const moduleGroup = entry?.grupo ?? "";

  // Persiste el último veredicto en el proyecto (cache del dashboard). Solo con
  // proyecto activo y nunca para la entrada de desarrollo "smoke".
  const actualizarResultado = ctx?.actualizarResultado;
  useEffect(() => {
    if (!resultado || justificacionKey === "smoke" || !actualizarResultado) return;
    actualizarResultado(justificacionKey, {
      veredicto: resultado.veredicto,
      resumen: resultado.metricas
        ? `${resultado.sujeto} — ${resultado.metricas}`
        : resultado.sujeto,
    });
  }, [resultado, justificacionKey, actualizarResultado]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <Topbar
        moduleLabel={moduleLabel}
        moduleGroup={moduleGroup}
        onExportPdf={acciones?.onExportPdf}
        pdfExporting={acciones?.pdfExporting}
        onShare={acciones?.onShare}
        onReset={acciones?.onReset}
        onMenuOpen={openDrawer}
      />

      {ctx?.proyecto && (
        <BarraContexto proyectoId={ctx.proyecto.id} herencia={herencia} />
      )}

      <BandaVeredicto resultado={resultado} edicionDB={entry?.edicionDB ?? "—"} />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}
