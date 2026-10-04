// =============================================================================
// DB-HS6 — «Qué entra» (feature-15, HS6): lo que toca el terreno según El
// edificio y cómo lo trata la protección, en filas listas para `QueEntra`. PURA.
// =============================================================================

import type { FilaQueEntra } from "../../components/justificacion/QueEntra";
import type { EstadoPresentacion } from "../../lib/cte/presentacion";
import { etiquetaNivel } from "../../lib/edificio/derivar";
import { fmt } from "../../lib/units/format";
import type { JustificacionHs6 } from "./justificacion";
import { nombresUsos, rangoNiveles } from "./proteccion";

export function filasQueEntraHs6(j: JustificacionHs6, estados: Record<string, EstadoPresentacion>): FilaQueEntra[] {
  const pr = j.proteccion;
  const filas: FilaQueEntra[] = [];
  filas.push({
    id: "zona",
    titulo: "Municipio",
    detalle: `${j.municipio || "—"} · apéndice B`,
    trato: pr.zona === "sin_exigencia" ? "sin exigencia" : `zona ${pr.zona}`,
    estado: "normal",
    elementoId: "zona",
  });
  if (pr.sobreNoHabitable) {
    const g = pr.sobreNoHabitable;
    const hay = j.elementos.some((e) => e.id === "contencion-garaje");
    filas.push({
      id: "garaje",
      titulo: g.conGaraje ? "Garaje" : "Sótano",
      detalle: `${etiquetaNivel(g.nivel)} · no habitable${hay ? " · ventilado" : ""}`,
      trato: hay ? "contención" : "bajo la barrera",
      estado: estados["contencion-garaje"] === "rv" ? "rv" : "normal",
      elementoId: hay ? "contencion-garaje" : "barrera",
    });
    filas.push({
      id: "sobre-garaje",
      titulo: nombresUsos(g.usosProtegidos).replace(/^./, (c) => c.toUpperCase()),
      detalle: `PB sobre el ${g.conGaraje ? "garaje" : "sótano"} · ${fmt(g.superficie_m2, "m²", 0)}`,
      trato: "se protege",
      estado: "normal",
      elementoId: "barrera",
    });
  }
  for (const t of pr.sobreTerreno) {
    filas.push({
      id: `terreno-${t.nivel}`,
      titulo: t.parcial ? "PB sin sótano" : nombresUsos(t.usos).replace(/^./, (c) => c.toUpperCase()),
      detalle: `${etiquetaNivel(t.nivel)} sobre el terreno · ${fmt(t.superficie_m2, "m²", 0)}`,
      trato: "se protege",
      estado: "normal",
      elementoId: j.elementos.some((e) => e.id === "camara") ? "camara" : j.elementos.some((e) => e.id === "despresurizacion") ? "despresurizacion" : "barrera",
    });
  }
  if (pr.noTocan.niveles.length > 0) {
    filas.push({
      id: "no-tocan",
      titulo: nombresUsos(pr.noTocan.usos).replace(/^./, (c) => c.toUpperCase()),
      detalle: rangoNiveles(pr.noTocan.niveles),
      trato: "sin contacto",
      estado: "out",
      elementoId: j.elementos.some((e) => e.id === "no-tocan") ? "no-tocan" : undefined,
    });
  }
  return filas;
}
