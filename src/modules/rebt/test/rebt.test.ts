import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { aplicabilidadBase, atributosDe } from "../../../lib/proyecto/aplicabilidad";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import type { Proyecto } from "../../../lib/proyecto/tipos";
import { rebt } from "../definicion";
import { dibujoRebt } from "../dibujo";
import { rebtEstadoDefaults, type RebtEstado } from "../estado";
import { justificarRebt, type DetalleRebt, type JustificacionRebt } from "../justificacion";
import { coeficienteSimultaneidad, igaDe } from "../tablas";

// =============================================================================
// REBT · Grado de electrificación y previsión de cargas (feature-23). Cifras y
// criterios: research/verificacion-rebt.md.
// =============================================================================

const demo = crearProyectoDemo("2026-10-05T10:00:00.000Z");
const dg = demo.datosGenerales;
const con = (edificio: Edificio, estado: Partial<RebtEstado> = {}, justificaciones: Proyecto["justificaciones"] = {}) =>
  justificarRebt({ ...rebtEstadoDefaults, ...estado }, { edificio, datosGenerales: dg, justificaciones });
const caso = (c: CasoEdificio, estado: Partial<RebtEstado> = {}) => con(edificioDeCaso(c), estado);
const detalle = <C extends DetalleRebt["clase"]>(j: JustificacionRebt, clase: C) =>
  j.elementos.find((e) => e.detalle.clase === clase)?.detalle as Extract<DetalleRebt, { clase: C }> | undefined;
const avisos = (j: JustificacionRebt) => j.avisos.map((a) => a.id);

/** El plurifamiliar con `n` plantas de viviendas iguales (A + B por planta) y una A en la PB. */
function plurifamiliar(n: number): Edificio {
  const e = edificioDeCaso("plurifamiliar");
  e.grupos[0].repeticiones = n;
  return e;
}

describe("REBT · las tablas", () => {
  it("tabla 1 de la ITC-BT-10: el coeficiente es un número equivalente de viviendas", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21].map(coeficienteSimultaneidad)).toEqual([
      1, 2, 3, 3.8, 4.6, 5.4, 6.2, 7, 7.8, 8.5, 9.2, 9.9, 10.6, 11.3, 11.9, 12.5, 13.1, 13.7, 14.3, 14.8, 15.3,
    ]);
    expect(coeficienteSimultaneidad(22)).toBe(15.8);
    expect(coeficienteSimultaneidad(40)).toBe(24.8); // 15,3 + 19 × 0,5
    expect(coeficienteSimultaneidad(0)).toBe(0);
  });

  it("el ejemplo de la Guía BT-10: 12 de 5750 W y 2 de 9200 W → 70,544 kW", () => {
    expect(((12 * 5750 + 2 * 9200) / 14) * coeficienteSimultaneidad(14)).toBeCloseTo(70544, 0);
  });

  it("tabla C de la Guía BT-10: el IGA de cada escalón", () => {
    expect([5750, 7360, 9200, 11500, 14490].map(igaDe)).toEqual([25, 32, 40, 50, 63]);
  });
});

describe("REBT · con El edificio", () => {
  it("la unifamiliar con garaje es elevada por la recarga, aunque se elija por superficie", () => {
    const j = caso("unifamiliar", { electrificacion: "superficie" });
    expect(j.viviendas[0]).toMatchObject({ grado: "elevada", motivos: ["recarga"], potencia_W: 9200, iga_A: 40 });
    expect(detalle(j, "total")).toMatchObject({ clasificacion: "unifamiliar", p_W: 9200, i_A: 40, trifasica: false });
    expect(detalle(j, "contadores")).toMatchObject({ n: 1, ubicacion: "cpm" });
    expect(detalle(j, "documentacion")).toMatchObject({ proyecto: false });
    expect(detalle(j, "servicios")).toBeUndefined();
    expect(j.veredicto).toBe("ok");
  });

  it("una unifamiliar sin garaje y por superficie es básica (145 m²)", () => {
    const e = edificioDeCaso("unifamiliar");
    e.grupos[1].zonas = e.grupos[1].zonas.filter((z) => z.uso !== "garaje_privado");
    expect(con(e, { electrificacion: "superficie" }).viviendas[0]).toMatchObject({ grado: "basica", potencia_W: 5750, iga_A: 25 });
    e.unidades[0] = { ...e.unidades[0], superficieUtil_m2: 161 } as typeof e.unidades[0];
    expect(con(e, { electrificacion: "superficie" }).viviendas[0]).toMatchObject({ grado: "elevada", motivos: ["superficie"] });
  });

  it("el plurifamiliar: 7 viviendas elevadas, servicios, garaje forzado y recarga", () => {
    const j = caso("plurifamiliar");
    expect(detalle(j, "viviendas")).toMatchObject({ n: 7, media_W: 9200, coeficiente: 6.2, p_W: 57040 });
    const s = detalle(j, "servicios")!;
    expect(s.ascensor).toMatchObject({ supuesto: true, kW: 11.5, kWSupuesta: true });
    expect(s.alumbrado).toEqual([{ zonaId: "z3", que: "Portal (PB)", m2: 35, W_m2: 8, W: 280 }]);
    expect(s.p_W).toBe(11780);
    expect(detalle(j, "garaje")).toMatchObject({ m2: 460, plazas: 16, ventilacion: "forzada", W_m2: 20, p_W: 9200, humo: true });
    expect(detalle(j, "recarga")).toMatchObject({ ambito: "viviendas", plazas: 16, plazasPrevision: 1.6, p5_W: 5888, factor: 1, p_W: 5888, anexo2_W: 16 * 3680 });
    const t = detalle(j, "total")!;
    expect(t.p_W).toBe(57040 + 11780 + 9200 + 5888);
    expect(t.i_A).toBeCloseTo(83908 / (Math.sqrt(3) * 400 * 0.9), 1);
    // 7 viviendas + servicios generales + ⌈0,2 × (16 − 7)⌉ = 2 módulos de reserva (ITC-BT-52 ap. 3.2 b).
    expect(detalle(j, "contadores")).toMatchObject({ n: 10, ubicacion: "armario", exigeLocal: false });
    expect(detalle(j, "contadores")!.desglose.at(-1)).toEqual({ que: "reserva para la recarga", n: 2 });
    expect(detalle(j, "documentacion")).toMatchObject({ proyecto: true, soloAparcamiento: true, grupos: [{ grupo: "g", motivo: "aparcamiento con ventilación forzada" }] });
    expect(avisos(j)).toEqual(expect.arrayContaining(["ascensor-supuesto", "servicios", "humo"]));
  });

  it("por superficie, las viviendas de 90 y 68 m² son básicas", () => {
    const j = caso("plurifamiliar", { electrificacion: "superficie" });
    expect(j.viviendas.map((v) => v.grado)).toEqual(["basica", "basica"]);
    expect(detalle(j, "viviendas")!.p_W).toBe(5750 * 6.2);
  });

  it("el Demo (plurifamiliar con locales): el local a 100 W/m² y su contador", () => {
    const j = caso("plurifamiliar_locales");
    expect(detalle(j, "viviendas")).toMatchObject({ n: 6, coeficiente: 5.4, p_W: 49680 });
    expect(j.elementos.find((e) => e.id === "local-z2")).toMatchObject({ veredicto: "previsto" });
    expect(detalle(j, "local")).toMatchObject({ m2: 160, porLocal_W: 16000, minimo: false, p_W: 16000, locales: 1 });
    expect(detalle(j, "recarga")).toMatchObject({ plazas: 14, p5_W: 5152 });
    expect(detalle(j, "total")!.p_W).toBe(49680 + 11780 + 16000 + 8400 + 5152);
    expect(detalle(j, "contadores")).toMatchObject({
      n: 10,
      desglose: [
        { que: "viviendas", n: 6 },
        { que: "local", n: 1 },
        { que: "servicios generales", n: 1 },
        { que: "reserva para la recarga", n: 2 },
      ],
    });
  });

  it("las oficinas: ap. 4.1, cada planta un local, el garaje por analogía y sin recarga de viviendas", () => {
    const j = caso("oficinas");
    expect(j.clasificacion).toBe("oficinas");
    const locales = j.elementos.filter((e) => e.detalle.clase === "local").map((e) => e.detalle);
    expect(locales).toEqual([
      expect.objectContaining({ uso: "oficinas", locales: 2, m2: 320, porLocal_W: 32000, p_W: 64000 }),
      expect.objectContaining({ uso: "local_sin_uso", locales: 1, m2: 200, p_W: 20000 }),
    ]);
    expect(detalle(j, "recarga")).toBeUndefined();
    expect(detalle(j, "servicios")!.alumbrado).toEqual([{ zonaId: "z2", que: "Vestíbulo (PB)", m2: 60, W_m2: 8, W: 480 }]);
    expect(avisos(j)).toContain("garaje-oficinas");
    expect(detalle(j, "contadores")).toMatchObject({ n: 6 }); // 2 oficinas + local + servicios + ⌈0,2 × 10⌉
    expect(detalle(j, "documentacion")).toMatchObject({ proyecto: true, soloAparcamiento: false });
    expect(detalle(j, "documentacion")!.grupos.map((g) => g.grupo)).toEqual(["e", "g"]);
    expect(avisos(j)).toContain("centro-transformacion"); // 102 kW
  });

  it("un local pequeño se queda en el mínimo de 3450 W", () => {
    const e = edificioDeCaso("plurifamiliar_locales");
    e.grupos[1].zonas[0].superficieUtil_m2 = 25;
    expect(detalle(con(e), "local")).toMatchObject({ porLocal_W: 3450, minimo: true });
  });

  it("con SPL, la recarga va × 0,3; las plazas indicadas no bajan del 10 %", () => {
    expect(detalle(caso("plurifamiliar", { spl: "con_spl" }), "recarga")).toMatchObject({ factor: 0.3, p_W: Math.round(5888 * 0.3) });
    expect(detalle(caso("plurifamiliar", { plazasRecarga: 16 }), "recarga")).toMatchObject({ plazasPrevision: 16, p5_W: 58880, indicadas: true });
    expect(detalle(caso("plurifamiliar", { plazasRecarga: 1 }), "recarga")).toMatchObject({ plazasPrevision: 1.6 });
  });

  it("la ventilación del garaje es la de HS 3", () => {
    const j = con(edificioDeCaso("plurifamiliar"), {}, { hs3: { inputs: { garaje: "natural" } } } as unknown as Proyecto["justificaciones"]);
    expect(detalle(j, "garaje")).toMatchObject({ ventilacion: "natural", deHs3: true, W_m2: 10, p_W: 4600, humo: false });
    expect(detalle(j, "documentacion")!.grupos.map((g) => g.grupo)).toEqual(["h"]);
  });

  it("las potencias indicadas del ascensor y de los demás servicios quitan el aviso", () => {
    const j = caso("plurifamiliar", { ascensor_kW: 7.5, otrosServicios_kW: 4 });
    expect(detalle(j, "servicios")!.p_W).toBe(7500 + 280 + 4000);
    expect(avisos(j)).not.toContain("servicios");
  });

  it("la producción centralizada de ACS de HE 4 pide sumar su central", () => {
    const j = con(edificioDeCaso("plurifamiliar"), {}, { he4: { inputs: { produccion: "centralizada" } } } as unknown as Proyecto["justificaciones"]);
    expect(avisos(j)).toContain("acs-central");
  });

  it("más de 16 contadores sin local: no cumple; con el cuarto de la PB como de contadores, cumple", () => {
    const e = plurifamiliar(8); // 8 × 2 + 1 = 17 viviendas + servicios generales = 18
    e.grupos[1].zonas.push({ id: "zc", uso: "instalaciones", superficieUtil_m2: 8 });
    const j = con(e);
    const c = detalle(j, "contadores")!;
    expect(c).toMatchObject({ n: 19, exigeLocal: true, cuarto: null, candidato: { zonaId: "zc", plantas: "PB" } }); // + 1 módulo de reserva
    expect(j.veredicto).toBe("fail");
    const el = j.elementos.find((x) => x.id === "contadores")!;
    const a = rebt.arreglo!(el, j)!;
    expect(a.etiqueta).toBe("Contadores en el cuarto de PB");
    const j2 = con(a.edificio!(e));
    expect(detalle(j2, "contadores")).toMatchObject({ ubicacion: "local", cuarto: { zonaId: "zc" } });
    expect(j2.veredicto).toBe("ok");
  });

  it("el local de contadores en una planta alta no cumple", () => {
    const e = edificioDeCaso("plurifamiliar");
    e.grupos[0].zonas.push({ id: "zc", uso: "instalaciones", superficieUtil_m2: 6, cuarto: "contadores_electricidad" });
    const c = detalle(con(e), "contadores")!;
    expect(c).toMatchObject({ ubicacion: "local", plantaOk: false });
    expect(rebt.textoIncumplimiento(con(e).elementos.find((x) => x.id === "contadores")!)?.titulo).toBe("El local de contadores no está en su planta.");
  });

  it("la unifamiliar sin garaje con plaza en la parcela lleva el C13 y es elevada (ITC-BT-52 ap. 3.1)", () => {
    const e = edificioDeCaso("unifamiliar");
    e.grupos[1].zonas = e.grupos[1].zonas.filter((z) => z.uso !== "garaje_privado");
    expect(con(e, { electrificacion: "superficie", plazaParcela: true }).viviendas[0]).toMatchObject({ grado: "elevada", motivos: ["recarga"] });
  });

  it("la unifamiliar es monofásica hasta 14 490 W (ap. 7)", () => {
    expect(detalle(caso("unifamiliar"), "total")).toMatchObject({ trifasica: false, i_A: 40 });
  });

  it("el control de humo solo en el garaje de uso Aparcamiento (más de 100 m² construidos)", () => {
    const e = edificioDeCaso("plurifamiliar");
    e.grupos[2].zonas[0] = { ...e.grupos[2].zonas[0], superficieUtil_m2: 80, plazas: 3, superficieConstruida_m2: 95 };
    const j = con(e, {}, { hs3: { inputs: { garaje: "mecanica" } } } as unknown as Proyecto["justificaciones"]);
    expect(detalle(j, "garaje")).toMatchObject({ ventilacion: "forzada", humo: false });
    expect(avisos(j)).not.toContain("humo");
  });

  it("la potencia estudiada del garaje con control de humo manda si es mayor, y quita el aviso", () => {
    const j = caso("plurifamiliar", { garaje_kW: 15 });
    expect(detalle(j, "garaje")).toMatchObject({ humo: true, estudiada_kW: 15, p_W: 15000 });
    expect(avisos(j)).not.toContain("humo");
    expect(detalle(caso("plurifamiliar", { garaje_kW: 2 }), "garaje")!.p_W).toBe(9200); // no baja de 20 W/m²
  });

  it("el garaje de oficinas de más de 10 plazas: una estación por cada 40 o fracción (HE 6)", () => {
    const e = edificioDeCaso("oficinas");
    e.grupos[2].zonas[0].plazas = 50;
    expect(detalle(con(e), "recarga")).toMatchObject({ ambito: "otros", estaciones: 2, p5_W: 7360, factor: 1, p_W: 7360 });
    expect(detalle(caso("oficinas"), "recarga")).toBeUndefined(); // 10 plazas: excluido
  });

  it("el esquema colectivo con SPL suma el contador principal de la recarga", () => {
    const c = detalle(caso("plurifamiliar", { spl: "con_spl" }), "contadores")!;
    expect(c.n).toBe(11);
    expect(c.desglose.at(-1)).toEqual({ que: "recarga colectiva", n: 1 });
  });

  it("aplica siempre, en los cuatro casos", () => {
    for (const c of ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"] as CasoEdificio[]) {
      expect(aplicabilidadBase(atributosDe(dg, edificioDeCaso(c))).rebt.aplicabilidad, c).toBe("aplica");
    }
  });
});

describe("REBT · textos, memoria, ficha y dibujo", () => {
  it("la frase y las métricas", () => {
    expect(rebt.frase(caso("unifamiliar"))).toBe(
      "Vivienda de electrificación elevada por climatización eléctrica u otros equipos y recarga del vehículo eléctrico: 9200 W, IGA de 40 A. Memoria técnica de diseño.",
    );
    expect(rebt.frase(caso("plurifamiliar_locales"))).toBe("6 viviendas de electrificación elevada: 91 kW de carga total, 10 contadores en un armario y proyecto del aparcamiento.");
    expect(rebt.metricas(caso("plurifamiliar_locales"))).toBe("P = 91 kW · 6 viv. × coef. 5,4 · 10 contadores · proyecto");
  });

  it("la memoria cita la ITC-BT-10 y la tabla resume la previsión", () => {
    const m = rebt.memoria(caso("plurifamiliar_locales"));
    expect(m.norma).toBe("REBT ITC-BT-10");
    const texto = textoPlanoMemoria(m);
    expect(texto).toMatch(/coeficiente de simultaneidad de la tabla 1 para 6 viviendas, 5,4: 49,7 kW/);
    expect(texto).toMatch(/se concentran en un armario/);
    expect(texto).toMatch(/La instalación del aparcamiento precisa proyecto/);
    expect(texto).toMatch(/de uso Aparcamiento no abierto y controla el humo/);
    expect(m.tabla?.filas.at(-1)).toEqual(["Carga total", "", "", "91.012 W"]);
  });

  it("la ficha lleva los datos de partida y la verificación", () => {
    const j = caso("plurifamiliar_locales");
    const f = rebt.ficha(j, { estado: rebtEstadoDefaults, edificio: edificioDeCaso("plurifamiliar_locales"), revisados: [], svg: { nativeW: 800, nativeH: 600 } });
    expect(f.titulo).toBe("REBT — Previsión de cargas");
    expect(f.verificaciones.map((v) => v.concepto)).toContain("Contadores");
    expect(f.datosPartida.map((d) => d.concepto)).toEqual(expect.arrayContaining(["Vivienda tipo A (3)", "Ascensor", "Ventilación del garaje", "Recarga del vehículo eléctrico"]));
  });

  it("el dibujo pone una etiqueta a cada elemento que se ve y los iconos", () => {
    const e = edificioDeCaso("plurifamiliar_locales");
    const d = dibujoRebt(caso("plurifamiliar_locales"), e);
    const ids = new Set(d.etiquetas.map((x) => x.elementoId));
    for (const id of ["vivienda-A", "vivienda-B", "local-z2", "garaje", "recarga", "servicios", "total", "contadores", "viviendas"]) expect(ids.has(id), id).toBe(true);
    const iconos = d.marcas.flatMap((m) => (m.tipo === "icono" ? [m.icono] : []));
    expect(iconos).toEqual(expect.arrayContaining(["ascensor", "contador", "recarga"]));
  });
});
