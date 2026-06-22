import type { ComponentType } from "react";
import { Wind, Droplets, Waves, Thermometer, FlaskConical } from "lucide-react";

// Manifest central de módulos (SPEC §11). Alimenta a la vez la navegación
// (Sidebar), el router (App.tsx mapea route→import lazy) y el pie/cita de la
// ficha (edicionDB). Patrón adoptado de "Concreta estructura".

type IconType = ComponentType<{ size?: number | string; className?: string }>;

export interface ModuleEntry {
  /** Clave de localStorage / base del versionado de esquema. */
  key: string;
  /** Ruta URL. */
  route: string;
  /** Etiqueta de navegación. */
  label: string;
  /** Grupo de navegación (instalación). */
  group: string;
  /** Icono (lucide-react). */
  icon: IconType;
  /** Edición del DB vigente — para el pie de la ficha y la nota de versión. */
  edicionDB: string;
  /** false = mostrar placeholder "Próximamente". */
  shipped: boolean;
}

export const moduleRegistry: ModuleEntry[] = [
  {
    key: "concreta-inst-smoke",
    route: "/_smoke",
    label: "Demo cimientos",
    group: "Desarrollo",
    icon: FlaskConical,
    edicionDB: "—",
    shipped: true,
  },
  {
    key: "concreta-inst-hs3",
    route: "/hs/ventilacion",
    label: "HS3 Ventilación",
    group: "Salubridad (DB-HS)",
    icon: Wind,
    edicionDB: "DB-HS3 (FOM/588/2017)",
    shipped: true,
  },
  {
    key: "concreta-inst-hs5",
    route: "/hs/saneamiento",
    label: "HS5 Saneamiento",
    group: "Salubridad (DB-HS)",
    icon: Waves,
    edicionDB: "DB-HS5 (2009)",
    shipped: true,
  },
  {
    key: "concreta-inst-hs4",
    route: "/hs/fontaneria",
    label: "HS4 Fontanería",
    group: "Salubridad (DB-HS)",
    icon: Droplets,
    edicionDB: "DB-HS4 (2009)",
    shipped: true,
  },
  {
    key: "concreta-inst-he1",
    route: "/he/envolvente",
    label: "HE1 Envolvente",
    group: "Energía (DB-HE)",
    icon: Thermometer,
    edicionDB: "DB-HE 2019 (consolidado 2022)",
    shipped: true,
  },
];

// Versiones de esquema por módulo. Las claves DEBEN coincidir con el literal
// pasado a useModuleState() en cada módulo (NO con el campo `key` del registro).
// Subir una entrada limpia SOLO el localStorage de ese módulo en la próxima carga.
export const MODULE_SCHEMA_VERSIONS: Record<string, string> = {
  smoke: "1",
  hs3: "1",
  hs5: "1",
  hs4: "1",
  he1: "1",
};

export function getModuleSchemaVersion(moduleKey: string): string {
  return MODULE_SCHEMA_VERSIONS[moduleKey] ?? "1";
}

export function getModuleByRoute(route: string): ModuleEntry | undefined {
  return moduleRegistry.find((m) => m.route === route);
}

/** Módulos agrupados por `group`, preservando el orden de declaración. */
export function modulesByGroup(): { group: string; modules: ModuleEntry[] }[] {
  const groups: { group: string; modules: ModuleEntry[] }[] = [];
  for (const m of moduleRegistry) {
    let g = groups.find((x) => x.group === m.group);
    if (!g) {
      g = { group: m.group, modules: [] };
      groups.push(g);
    }
    g.modules.push(m);
  }
  return groups;
}
