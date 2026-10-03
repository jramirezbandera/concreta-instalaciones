import type { ComponentType } from "react";
import { Wind, Droplets, Waves, Thermometer, FlaskConical, Radiation } from "lucide-react";
import type { JustificacionKey } from "../lib/proyecto/tipos";

// Registry de justificaciones (feature-6 §C, UX-RECONCEPT §3 y §10). Única fuente
// de verdad del expediente: alimenta la checklist del dashboard, la navegación,
// el router y el pie/cita de la ficha. Sustituye al registry legacy de módulos
// (eliminado en T6.2): la clave es SIEMPRE el literal corto ("hs5"), el mismo
// que usa el estado del módulo — desaparece la dualidad key larga / clave de
// schema del registry anterior.

type IconType = ComponentType<{ size?: number | string; className?: string }>;

export interface JustificacionEntry {
  /** Clave única (union del proyecto) — también clave de estado/schema. */
  key: JustificacionKey | "smoke";
  /** Código normativo corto para chips y cabeceras: "HS5", "SI4", "REBT"… */
  codigo: string;
  /** Nombre de la exigencia: "Evacuación de aguas". */
  label: string;
  /** Grupo de la checklist (por DB), en orden de declaración. */
  grupo: string;
  /** Documento de referencia: "DB-HS5", "REBT ITC-BT-10"… */
  db: string;
  /** Edición vigente del documento — pie de ficha y nota de versión. */
  edicionDB: string;
  /** Naturaleza de la justificación dentro de la app. */
  formato: "calculo" | "checker" | "externo";
  /** false = placeholder "Próximamente" (o justificación externa). */
  shipped: boolean;
  /** true = entrada solo de desarrollo (smoke). */
  dev?: boolean;
  /** Subruta RELATIVA al proyecto, sin barra inicial: "hs/saneamiento". Solo shipped. */
  route?: string;
  /** Icono (lucide-react). */
  icon?: IconType;
  /** Justificación resuelta fuera de la app (HULC, Concreta estructura). */
  externo?: { destino: string };
  /** Versión de esquema de inputs (consolida MODULE_SCHEMA_VERSIONS). */
  schemaVersion?: string;
}

export const justificacionRegistry: JustificacionEntry[] = [
  // ── Salubridad (DB-HS) ─────────────────────────────────────────────────────
  {
    key: "hs1",
    codigo: "HS1",
    label: "Protección frente a la humedad",
    grupo: "Salubridad (DB-HS)",
    db: "DB-HS1",
    edicionDB: "DB-HS (consolidado 2022)",
    formato: "calculo",
    shipped: false,
  },
  {
    key: "hs2",
    codigo: "HS2",
    label: "Recogida de residuos",
    grupo: "Salubridad (DB-HS)",
    db: "DB-HS2",
    edicionDB: "DB-HS (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  {
    key: "hs3",
    codigo: "HS3",
    label: "Calidad del aire interior",
    grupo: "Salubridad (DB-HS)",
    db: "DB-HS3",
    edicionDB: "DB-HS3 (FOM/588/2017)",
    formato: "calculo",
    shipped: true,
    route: "hs/ventilacion",
    icon: Wind,
    schemaVersion: "1",
  },
  {
    key: "hs4",
    codigo: "HS4",
    label: "Suministro de agua",
    grupo: "Salubridad (DB-HS)",
    db: "DB-HS4",
    edicionDB: "DB-HS4 (2009)",
    formato: "calculo",
    shipped: true,
    route: "hs/fontaneria",
    icon: Droplets,
    schemaVersion: "1",
  },
  {
    key: "hs5",
    codigo: "HS5",
    label: "Evacuación de aguas",
    grupo: "Salubridad (DB-HS)",
    db: "DB-HS5",
    edicionDB: "DB-HS5 (2009)",
    formato: "calculo",
    shipped: true,
    route: "hs/saneamiento",
    icon: Waves,
    schemaVersion: "1",
  },
  {
    key: "hs6",
    codigo: "HS6",
    label: "Protección frente al radón",
    grupo: "Salubridad (DB-HS)",
    db: "DB-HS6",
    edicionDB: "DB-HS6 (RD 732/2019)",
    formato: "checker",
    shipped: true,
    route: "hs/radon",
    icon: Radiation,
    schemaVersion: "1",
  },
  // ── Seguridad en caso de incendio (DB-SI) ──────────────────────────────────
  {
    key: "si1",
    codigo: "SI1",
    label: "Propagación interior",
    grupo: "Seguridad en caso de incendio (DB-SI)",
    db: "DB-SI1",
    edicionDB: "DB-SI (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  {
    key: "si2",
    codigo: "SI2",
    label: "Propagación exterior",
    grupo: "Seguridad en caso de incendio (DB-SI)",
    db: "DB-SI2",
    edicionDB: "DB-SI (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  {
    key: "si3",
    codigo: "SI3",
    label: "Evacuación de ocupantes",
    grupo: "Seguridad en caso de incendio (DB-SI)",
    db: "DB-SI3",
    edicionDB: "DB-SI (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  {
    key: "si4",
    codigo: "SI4",
    label: "Instalaciones de protección",
    grupo: "Seguridad en caso de incendio (DB-SI)",
    db: "DB-SI4",
    edicionDB: "DB-SI (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  {
    key: "si5",
    codigo: "SI5",
    label: "Intervención de bomberos",
    grupo: "Seguridad en caso de incendio (DB-SI)",
    db: "DB-SI5",
    edicionDB: "DB-SI (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  {
    key: "si6",
    codigo: "SI6",
    label: "Resistencia al fuego de la estructura",
    grupo: "Seguridad en caso de incendio (DB-SI)",
    db: "DB-SI6",
    edicionDB: "DB-SI (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  // ── Utilización y accesibilidad (DB-SUA) ───────────────────────────────────
  {
    key: "sua1",
    codigo: "SUA1",
    label: "Escaleras y rampas",
    grupo: "Utilización y accesibilidad (DB-SUA)",
    db: "DB-SUA1",
    edicionDB: "DB-SUA (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  {
    key: "sua4",
    codigo: "SUA4",
    label: "Alumbrado",
    grupo: "Utilización y accesibilidad (DB-SUA)",
    db: "DB-SUA4",
    edicionDB: "DB-SUA (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  {
    key: "sua6",
    codigo: "SUA6",
    label: "Piscinas",
    grupo: "Utilización y accesibilidad (DB-SUA)",
    db: "DB-SUA6",
    edicionDB: "DB-SUA (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  {
    key: "sua7",
    codigo: "SUA7",
    label: "Aparcamientos",
    grupo: "Utilización y accesibilidad (DB-SUA)",
    db: "DB-SUA7",
    edicionDB: "DB-SUA (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  {
    key: "sua8",
    codigo: "SUA8",
    label: "Riesgo de rayo",
    grupo: "Utilización y accesibilidad (DB-SUA)",
    db: "DB-SUA8",
    edicionDB: "DB-SUA (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  {
    key: "sua9",
    codigo: "SUA9",
    label: "Accesibilidad",
    grupo: "Utilización y accesibilidad (DB-SUA)",
    db: "DB-SUA9",
    edicionDB: "DB-SUA (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  // ── Ruido (DB-HR) ──────────────────────────────────────────────────────────
  {
    key: "hr",
    codigo: "HR",
    label: "Opción simplificada",
    grupo: "Ruido (DB-HR)",
    db: "DB-HR",
    edicionDB: "DB-HR (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  // ── Ahorro de energía (DB-HE) ──────────────────────────────────────────────
  {
    key: "he1",
    codigo: "HE1",
    label: "Envolvente térmica",
    grupo: "Ahorro de energía (DB-HE)",
    db: "DB-HE1",
    edicionDB: "DB-HE 2019 (consolidado 2022)",
    formato: "calculo",
    shipped: true,
    route: "he/envolvente",
    icon: Thermometer,
    schemaVersion: "1",
  },
  {
    key: "he4",
    codigo: "HE4",
    label: "Demanda de ACS y contribución renovable",
    grupo: "Ahorro de energía (DB-HE)",
    db: "DB-HE4",
    edicionDB: "DB-HE 2019 (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  {
    key: "he5",
    codigo: "HE5",
    label: "Fotovoltaica mínima",
    grupo: "Ahorro de energía (DB-HE)",
    db: "DB-HE5",
    edicionDB: "DB-HE 2019 (consolidado 2022)",
    formato: "checker",
    shipped: false,
  },
  // ── Complementarias ────────────────────────────────────────────────────────
  {
    key: "rebt",
    codigo: "REBT",
    label: "Grado de electrificación y previsión de cargas",
    grupo: "Complementarias",
    db: "REBT ITC-BT-10",
    edicionDB: "REBT (RD 842/2002) ITC-BT-10",
    formato: "checker",
    shipped: false,
  },
  // ── Externas (se resuelven fuera de la app; el dashboard referencia el doc) ─
  {
    key: "he0he1_global",
    codigo: "HE0/HE1",
    label: "Verificación energética global",
    grupo: "Externas",
    db: "DB-HE0 / DB-HE1",
    edicionDB: "DB-HE 2019 (consolidado 2022)",
    formato: "externo",
    shipped: false,
    externo: { destino: "HULC" },
  },
  {
    key: "dbse",
    codigo: "DB-SE",
    label: "Estructura",
    grupo: "Externas",
    db: "DB-SE",
    edicionDB: "DB-SE (consolidado 2022)",
    formato: "externo",
    shipped: false,
    externo: { destino: "Concreta estructura" },
  },
  // ── Desarrollo ─────────────────────────────────────────────────────────────
  {
    key: "smoke",
    codigo: "DEV",
    label: "Demo cimientos",
    grupo: "Desarrollo",
    db: "—",
    edicionDB: "—",
    formato: "calculo",
    shipped: true,
    dev: true,
    route: "_smoke",
    icon: FlaskConical,
    schemaVersion: "1",
  },
];

/** Busca una entrada por su clave corta ("hs5", "smoke"…). */
export function getJustificacion(key: string): JustificacionEntry | undefined {
  return justificacionRegistry.find((j) => j.key === key);
}

/** Busca una entrada por su subruta relativa ("hs/saneamiento", "_smoke"). */
export function getJustificacionBySubruta(subruta: string): JustificacionEntry | undefined {
  return justificacionRegistry.find((j) => j.route === subruta);
}

/**
 * Justificaciones agrupadas por `grupo`, preservando el orden de declaración.
 * Con `soloShipped` se filtra antes de agrupar: los grupos sin entradas
 * shipped no aparecen.
 */
export function justificacionesPorGrupo(opts?: {
  soloShipped?: boolean;
}): { grupo: string; entradas: JustificacionEntry[] }[] {
  const fuente = opts?.soloShipped
    ? justificacionRegistry.filter((j) => j.shipped)
    : justificacionRegistry;
  const grupos: { grupo: string; entradas: JustificacionEntry[] }[] = [];
  for (const j of fuente) {
    let g = grupos.find((x) => x.grupo === j.grupo);
    if (!g) {
      g = { grupo: j.grupo, entradas: [] };
      grupos.push(g);
    }
    g.entradas.push(j);
  }
  return grupos;
}

/**
 * Versión de esquema de inputs por clave corta — misma semántica que el
 * getModuleSchemaVersion histórico: clave desconocida (o sin versión) → "1".
 * Subir la versión de una entrada limpia SOLO el localStorage de esa
 * justificación en la próxima carga.
 */
export function getModuleSchemaVersion(key: string): string {
  return getJustificacion(key)?.schemaVersion ?? "1";
}
