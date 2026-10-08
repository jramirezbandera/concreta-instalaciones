import { describe, expect, it } from "vitest";
import { CATALOGO, deCategoria, indiceFuera, RAtrCubierta, solucionDe } from "../catalogo";
import { MATERIALES_CEC } from "../materiales";

describe("catálogo común (feature-26)", () => {
  it("los ids no se repiten", () => {
    const ids = CATALOGO.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("catorce fachadas, cada una con un aislante y capas de material conocido", () => {
    const fs = deCategoria("fachada");
    expect(fs.map((f) => f.codigo).sort()).toEqual(
      ["F 1.1", "F 1.2", "F 2.1", "F 3.1", "F 3.2", "F 3.4", "F 3.5", "F 3.9", "F 4.1", "F 4.2", "F 4.3", "F 7.3", "F 8.1", "F 8.2"],
    );
    for (const f of fs) {
      expect(f.capas.filter((c) => c.rol === "AT"), f.codigo).toHaveLength(1);
      for (const c of f.capas) if (c.rol !== "AT") expect(MATERIALES_CEC[c.material], `${f.codigo} ${c.clave}`).toBeDefined();
      // Las claves no se repiten: son los ids de las capas en HE1.
      expect(new Set(f.capas.map((c) => c.clave)).size, f.codigo).toBe(f.capas.length);
    }
  });

  it("lo que no cuenta empieza en la cámara ventilada (K-CER.9)", () => {
    for (const f of deCategoria("fachada")) {
      const fuera = f.capas.map((c) => c.rol !== "AT" && MATERIALES_CEC[c.material].termico.tipo === "fuera");
      const i = fuera.indexOf(true);
      expect(i, f.codigo).toBe(indiceFuera(f));
      if (i >= 0) expect(f.capas[i].rol !== "AT" && f.capas[i].material, f.codigo).toBe("camara_ventilada");
    }
    // F 2.1: la hoja de ½ pie cara vista queda fuera, aunque su material tenga R.
    const f21 = deCategoria("fachada").find((f) => f.codigo === "F 2.1")!;
    expect(f21.capas.slice(indiceFuera(f21)).map((c) => c.clave)).toEqual(["camara-ventilada", "ladrillo"]);
  });

  it("la cámara ventilada lleva B3 con aislante no hidrófilo; la lana mineral, hidrófila", () => {
    for (const f of deCategoria("fachada")) {
      const ventilada = f.capas.some((c) => c.rol !== "AT" && c.material === "camara_ventilada");
      if (ventilada) expect(f.hs1.B.noHidrofilo, f.codigo).toBe(3);
    }
    expect(MATERIALES_CEC.lana_mineral.hidrofilo).toBe(true);
  });

  it("forjados con R y µ del 3.18; cubiertas con su paquete", () => {
    expect(deCategoria("forjado").map((f) => [f.id, f.R, f.mu])).toEqual([
      ["fu-bovhorm-250", 0.19, 80],
      ["fu-bovhorm-300", 0.21, 80],
      ["fu-bovcer-300", 0.32, 10],
      ["fu-boveps-300", 1.17, 60],
      ["fr-casetonhorm-300", 0.15, 10],
      ["alv-capa-250", 0.16, 80],
      ["losa-ha-200", 0.08, 80],
      ["losa-ha-250", 0.1, 80],
    ]);
    expect(deCategoria("cubierta").map((c) => [c.codigo, c.tipo, c.proteccion, c.R0_paquete, c.pendientesLigero])).toEqual([
      ["C 1.3", "plana_transitable", "solado_fijo", 0.27, true],
      ["C 2.3", "plana_transitable", "solado_flotante", 0.25, true],
      ["C 5.3", "plana_no_transitable", "grava", 0.25, true],
      ["C 9.3", "inclinada", null, 0.19, false],
    ]);
    // C 2.3 solo la da el CEC invertida (verificacion-cerramientos-cec.md, C.2.3).
    expect(deCategoria("cubierta").filter((c) => c.soloInvertida).map((c) => c.codigo)).toEqual(["C 2.3"]);
  });

  it("el RA,tr de una cubierta sale de su forjado y reproduce el del CEC con el de referencia (K-CER.10)", () => {
    const plana = solucionDe("cubierta", "cu-plana-fu-bovhorm-300");
    const incl = solucionDe("cubierta", "cu-incl-fu-bovhorm-250");
    expect(RAtrCubierta(plana, solucionDe("forjado", "fu-bovhorm-300"))).toBe(plana.RAtr);
    for (const id of ["cu-plana-solado-flotante", "cu-plana-grava"]) {
      const c = solucionDe("cubierta", id);
      expect(RAtrCubierta(c, solucionDe("forjado", "fu-bovhorm-300"))).toBe(c.RAtr);
    }
    expect(RAtrCubierta(incl, solucionDe("forjado", "fu-bovhorm-250"))).toBe(incl.RAtr);
    expect(RAtrCubierta(incl, solucionDe("forjado", "losa-ha-250"))).toBe(59);
  });
});
