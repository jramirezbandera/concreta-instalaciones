import { describe, expect, it } from "vitest";
import { edificioDeCaso } from "../../edificio/casos";
import { setCubierta } from "../../edificio/editar";
import { hrEstadoDefaults } from "../../../modules/hr/estado";
import { PSI_HUECO_TABLA_10, UF_REFERENCIA_CEC } from "../../../modules/he1/tablas";
import { FACHADA_HABITUAL, solucionDe } from "../catalogo";
import {
  avisosCerramientos,
  CERRAMIENTOS_HABITUALES,
  cerramientosDe,
  elegir,
  elegirVentana,
  eleccionesDe,
  plantaBajaEnHe1,
  setCerramientos,
  setPlantaBajaDistinta,
} from "../cerramientos";
import { MARCOS } from "../tipos";

// =============================================================================
// Los cerramientos de El edificio (feature-26, paso 2): sin indicarlos valen los
// habituales de hoy, y las operaciones de edición son puras.
// =============================================================================

describe("cerramientos de El edificio (feature-26)", () => {
  it("sin indicarlos, los habituales: F 3.2, batiente de PVC, la cubierta del tipo y el forjado de 30 cm", () => {
    const e = edificioDeCaso("plurifamiliar");
    expect(e.cerramientos).toBeUndefined();
    const r = cerramientosDe(e);
    expect(r.supuestos).toBe(true);
    expect(r.fachada.sol.id).toBe(FACHADA_HABITUAL);
    expect(r.fachada.sol.codigo).toBe("F 3.2");
    expect(r.fachadaPB).toBeNull();
    expect(r.ventana.sol.id).toBe("ve-4-c-6-batiente");
    expect(r.ventana.marco).toBe("pvc_tres_camaras");
    expect(r.ventanaPB).toBeNull();
    expect(r.cubierta.sol.codigo).toBe(e.cubierta.tipo === "inclinada" ? "C 9.3" : "C 1.3");
    expect(r.cubierta.habitual).toBe(true);
    expect(r.forjado.sol.id).toBe("fu-bovhorm-300");
    expect(avisosCerramientos(e)).toEqual([]);
  });

  it("los habituales son los de HR: los mismos valores acústicos (K-CER.15), así no cambia ningún veredicto", () => {
    const f = solucionDe("fachada", CERRAMIENTOS_HABITUALES.fachada.id);
    const hr = solucionDe("fachada", hrEstadoDefaults.fachada.id);
    expect(f.RAtr).toEqual(hr.RAtr);
    expect(f.principal).toEqual(hr.principal);
    expect(f.clase).toBe(hr.clase);
    expect(CERRAMIENTOS_HABITUALES.ventana.id).toBe(hrEstadoDefaults.ventana.id);
    expect(CERRAMIENTOS_HABITUALES.forjado.id).toBe(hrEstadoDefaults.forjado.id);
  });

  it("los siete marcos son los del 3.16 (Uf de HE1) y su familia está en la Tabla 10 del DA/1", () => {
    expect(Object.keys(MARCOS).sort()).toEqual(Object.keys(UF_REFERENCIA_CEC.datos.uf_W_m2K).sort());
    for (const m of Object.values(MARCOS)) expect(PSI_HUECO_TABLA_10.datos.psi_W_mK[m.familiaPsi]).toBeDefined();
  });

  it("la cubierta habitual se guarda como «la habitual» y sigue al tipo de cubierta", () => {
    let e = setCerramientos(edificioDeCaso("plurifamiliar"), { cubierta: { id: "cu-plana-fu-bovhorm-300" } });
    expect(e.cerramientos?.cubierta).toBeNull();
    e = setCubierta(e, { tipo: "inclinada" });
    const r = cerramientosDe(e);
    expect(r.cubierta.sol.codigo).toBe("C 9.3");
    expect(r.cubierta.descartada).toBe(false);
  });

  it("una cubierta que no casa con el tipo se descarta, con aviso", () => {
    const e = setCerramientos(setCubierta(edificioDeCaso("plurifamiliar"), { tipo: "plana_no_transitable" }), {
      cubierta: { id: "cu-incl-fu-bovhorm-250" },
    });
    const r = cerramientosDe(e);
    expect(r.cubierta.sol.codigo).toBe("C 1.3");
    expect(r.cubierta.descartada).toBe(true);
    expect(avisosCerramientos(e).some((a) => a.includes("no es plana"))).toBe(true);
  });

  it("elegir otra solución quita los valores propios; cambiar la ventana conserva el marco", () => {
    expect(elegir({ id: "a", valores: { RAtr: 50 } }, "a")).toEqual({ id: "a", valores: { RAtr: 50 } });
    expect(elegir({ id: "a", valores: { RAtr: 50 } }, "b")).toEqual({ id: "b" });
    const v = { id: "ve-4-c-6-batiente", marco: "metalico_sin_rpt" as const, valores: { RAtr: 33 } };
    expect(elegirVentana(v, { id: "ve-doble-oscilo" })).toEqual({ id: "ve-doble-oscilo", marco: "metalico_sin_rpt" });
    expect(elegirVentana(v, { marco: "madera_700kg_m3" })).toEqual({ ...v, marco: "madera_700kg_m3" });
  });

  it("guardar un cambio escribe todos los cerramientos, con los habituales en el resto", () => {
    const e = setCerramientos(edificioDeCaso("unifamiliar"), { fachada: { id: "fa-sate-lp115" } });
    expect(e.cerramientos).toEqual({ ...CERRAMIENTOS_HABITUALES, fachada: { id: "fa-sate-lp115" } });
    expect(cerramientosDe(e).supuestos).toBe(false);
  });

  it("la planta baja distinta empieza igual que la general, y al quitarla vuelve a ser la misma", () => {
    const base = setCerramientos(edificioDeCaso("plurifamiliar"), {
      fachada: { id: "fa-sate-lp115" },
      ventana: { id: "ve-4-c-4-batiente", marco: "madera_500kg_m3" },
    });
    const con = setPlantaBajaDistinta(base, true);
    expect(eleccionesDe(con).fachadaPB).toEqual({ id: "fa-sate-lp115" });
    expect(eleccionesDe(con).ventanaPB).toEqual({ id: "ve-4-c-4-batiente", marco: "madera_500kg_m3" });
    expect(setPlantaBajaDistinta(con, true)).toBe(con);

    const otra = setCerramientos(con, { fachadaPB: { id: "fa-ventilada-bh140" } });
    expect(cerramientosDe(otra).fachadaPB?.sol.codigo).toBe("F 8.2");
    expect(cerramientosDe(otra).fachada.sol.codigo).toBe("F 4.1");

    const sin = setPlantaBajaDistinta(otra, false);
    expect(eleccionesDe(sin).fachadaPB).toBeNull();
    expect(eleccionesDe(sin).ventanaPB).toBeNull();
  });

  it("la fachada de una planta baja sin viviendas ni oficinas no entra en HE1 (K-CER.1: la planta 0)", () => {
    expect(plantaBajaEnHe1(edificioDeCaso("plurifamiliar"))).toBe(true);
    expect(plantaBajaEnHe1(edificioDeCaso("unifamiliar"))).toBe(true);
    expect(plantaBajaEnHe1(edificioDeCaso("oficinas"))).toBe(false); // vestíbulo y local: HE1 no los protege
    const locales = edificioDeCaso("plurifamiliar_locales");
    expect(plantaBajaEnHe1(locales)).toBe(false);
    expect(avisosCerramientos(locales)).toEqual([]);
    expect(avisosCerramientos(setPlantaBajaDistinta(locales, true)).some((a) => a.includes("no entran en HE1"))).toBe(true);
  });
});
