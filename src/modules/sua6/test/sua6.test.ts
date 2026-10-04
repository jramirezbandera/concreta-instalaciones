import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { sua6 } from "../definicion";
import { sua6EstadoDefaults, type Sua6Estado } from "../estado";
import { justificarSua6, type ElementoSua6 } from "../justificacion";
import { SUA6_ANDEN, SUA6_BARRERA, SUA6_ESCALERAS, SUA6_VASO } from "../tablas";

// =============================================================================
// SUA 6 · Ahogamiento (feature-20). Cifras: research/verificacion-sua6-sua8.md,
// bloques A y C1.
// =============================================================================

const base = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const CASOS: CasoEdificio[] = ["unifamiliar", "plurifamiliar", "plurifamiliar_locales", "oficinas"];
const caso = (c: CasoEdificio, estado: Partial<Sua6Estado> = {}, piscina = true) =>
  justificarSua6({ ...sua6EstadoDefaults, ...estado }, { edificio: edificioDeCaso(c), datosGenerales: { ...base, tienePiscina: piscina } });
const el = (j: { elementos: ElementoSua6[] }, id: string) => j.elementos.find((e) => e.id === id)!;

describe("SUA6 · tablas", () => {
  it("las cifras del DB", () => {
    expect(SUA6_BARRERA.datos).toMatchObject({ alturaMin_m: 1.2, fuerza_kN_m: 0.5 });
    expect(SUA6_VASO.datos).toMatchObject({
      infantilMax_m: 0.5,
      restoMax_m: 3,
      zonaSomeraMenorQue_m: 1.4,
      senalizarSiSupera_m: 1.4,
      pendienteInfantil_pct: 6,
      pendienteHasta140_pct: 10,
      pendienteResto_pct: 35,
      fondoHasta_m: 1.5,
    });
    expect(SUA6_ANDEN.datos.anchuraMin_m).toBe(1.2);
    expect(SUA6_ESCALERAS.datos).toMatchObject({ bajoAguaMin_m: 1, sobreFondo_m: 0.3, separacionMax_m: 15 });
    expect(SUA6_VASO.procedencia).toMatchObject({ db: "DB-SUA", articulo: "SUA 6 ap. 1.2" });
  });
});

describe("SUA6 · ámbito", () => {
  it("sin piscina: solo el ámbito y los pozos, en los cuatro casos", () => {
    for (const c of CASOS) {
      const j = caso(c, {}, false);
      expect(j.aplica).toBe(false);
      expect(j.motivo).toBe("sin_piscina");
      expect(j.elementos.map((e) => e.id)).toEqual(["ambito", "pozos"]);
      expect(j.veredicto).toBe("ok");
    }
  });

  it("piscina de la unifamiliar: excluida, pero los pozos se declaran", () => {
    const j = caso("unifamiliar");
    expect(j.motivo).toBe("unifamiliar");
    expect(j.elementos.map((e) => e.id)).toEqual(["ambito", "pozos"]);
    const conPozos = caso("unifamiliar", { pozos: "si" });
    expect(el(conPozos, "pozos")).toMatchObject({ veredicto: "ok" });
  });

  it("piscina comunitaria: con lo habitual cumple y la memoria sale completa", () => {
    for (const c of ["plurifamiliar", "plurifamiliar_locales", "oficinas"] as const) {
      const j = caso(c);
      expect(j.aplica).toBe(true);
      expect(j.veredicto).toBe("ok");
      expect(j.elementos.map((e) => e.id)).toEqual(["acceso", "profundidad", "senalizacion", "pendientes", "fondo", "anden", "escaleras", "pozos"]);
      expect(j.avisos).toEqual([]);
      expect(j.decisiones).toMatchObject({ barrera_m: 1.2, profMin_m: 1.1, profMax_m: 1.9, anden_m: 1.5, separacion_m: 12 });
    }
  });
});

describe("SUA6 · bordes de los umbrales", () => {
  it("barrera ≥ 1,20 m", () => {
    expect(el(caso("plurifamiliar", { barrera_m: 1.2 }), "acceso").veredicto).toBe("ok");
    expect(el(caso("plurifamiliar", { barrera_m: 1.19 }), "acceso").veredicto).toBe("fail");
  });

  it("profundidad máxima ≤ 3 m y zona de menos de 1,40 m (estricto)", () => {
    expect(el(caso("plurifamiliar", { profMax_m: 3 }), "profundidad").veredicto).toBe("ok");
    expect(el(caso("plurifamiliar", { profMax_m: 3.01 }), "profundidad").veredicto).toBe("fail");
    expect(el(caso("plurifamiliar", { profMin_m: 1.39 }), "profundidad").veredicto).toBe("ok");
    const j = caso("plurifamiliar", { profMin_m: 1.4 });
    expect(el(j, "profundidad")).toMatchObject({ veredicto: "fail", detalle: { someraCumple: false, maxCumple: true } });
    expect(sua6.arreglo!(el(j, "profundidad"), j)).toEqual({ etiqueta: "Profundidades habituales", cambios: { profMin_m: "habitual" } });
  });

  it("la mínima y la máxima se ordenan", () => {
    const j = caso("plurifamiliar", { profMin_m: 2, profMax_m: 1.2 });
    expect(j.decisiones).toMatchObject({ profMin_m: 1.2, profMax_m: 2 });
  });

  it("vaso infantil ≤ 0,50 m, sin escaleras exigidas", () => {
    expect(el(caso("plurifamiliar", { vasos: "infantil", profInfantil_m: 0.5 }), "infantil").veredicto).toBe("ok");
    const j = caso("plurifamiliar", { vasos: "infantil", profInfantil_m: 0.51 });
    expect(el(j, "infantil").veredicto).toBe("fail");
    expect(j.elementos.map((e) => e.id)).not.toContain("escaleras");
    expect(j.elementos.map((e) => e.id)).not.toContain("profundidad");
    expect(caso("plurifamiliar", { vasos: "ambos" }).elementos.map((e) => e.id)).toEqual(expect.arrayContaining(["profundidad", "infantil", "escaleras"]));
  });

  it("señalización de los puntos de más de 1,40 m (estricto) y fondo de clase 3 hasta 1,50 m (incluido)", () => {
    expect(el(caso("plurifamiliar", { profMin_m: 1, profMax_m: 1.4 }), "senalizacion").detalle).toMatchObject({ supera: false });
    expect(el(caso("plurifamiliar", { profMin_m: 1, profMax_m: 1.41 }), "senalizacion").detalle).toMatchObject({ supera: true });
    expect(el(caso("plurifamiliar", { profMin_m: 1, profMax_m: 1.5 }), "fondo").detalle).toMatchObject({ todo: true });
    expect(el(caso("plurifamiliar", { profMin_m: 1, profMax_m: 1.51 }), "fondo").detalle).toMatchObject({ todo: false });
  });

  it("andén ≥ 1,20 m; sin andén, solo un dato", () => {
    expect(el(caso("plurifamiliar", { anden_m: 1.2 }), "anden").veredicto).toBe("ok");
    const j = caso("plurifamiliar", { anden_m: 1.19 });
    expect(el(j, "anden").veredicto).toBe("fail");
    expect(sua6.arreglo!(el(j, "anden"), j)).toEqual({ etiqueta: "Andén de 1,50 m", cambios: { anden_m: "habitual" } });
    expect(el(caso("plurifamiliar", { anden: "no" }), "anden").veredicto).toBe("dato");
  });

  it("escaleras a ≤ 15 m", () => {
    expect(el(caso("plurifamiliar", { separacion_m: 15 }), "escaleras").veredicto).toBe("ok");
    const j = caso("plurifamiliar", { separacion_m: 15.1 });
    expect(j.veredicto).toBe("fail");
    expect(sua6.textoIncumplimiento(el(j, "escaleras"))?.titulo).toMatch(/separadas/);
  });
});

describe("SUA6 · avisos", () => {
  it("el acceso controlado se avisa; la barrera no", () => {
    expect(caso("plurifamiliar").avisos).toEqual([]);
    const j = caso("plurifamiliar", { acceso: "controlado" });
    expect(j.avisos.map((a) => a.id)).toEqual(["acceso-controlado"]);
    expect(el(j, "acceso").veredicto).toBe("ok");
    expect(sua6.textoAviso(j.avisos[0]).titulo).toMatch(/controlado/);
  });
});

describe("SUA6 · memoria, ficha y dibujo", () => {
  it("los cuatro casos, con y sin piscina", () => {
    for (const c of CASOS) {
      for (const piscina of [true, false]) {
        const j = caso(c, {}, piscina);
        const texto = textoPlanoMemoria(sua6.memoria(j));
        expect(texto).toMatch(/pozos, depósitos/);
        if (j.aplica) expect(texto).toMatch(/barrera de protección de 1,20 m/);
        const dibujo = sua6.dibujo(j, edificioDeCaso(c));
        const ids = dibujo.etiquetas.map((e) => e.elementoId);
        for (const e of j.elementos) expect(ids).toContain(e.id);
        expect(dibujo.etiquetas.every((e) => e.y > 0 && e.x > 0 && e.x < dibujo.ancho)).toBe(true);
        const ficha = sua6.ficha(j, { estado: sua6EstadoDefaults, edificio: edificioDeCaso(c), revisados: [], svg: { nativeW: dibujo.ancho, nativeH: dibujo.alto } });
        expect(ficha.edicionDB).toBe("DB-SUA (consolidado 14-jun-2022)");
        expect(ficha.verificaciones.length).toBe(j.elementos.length);
        expect(sua6.frase(j).length).toBeGreaterThan(20);
        expect(sua6.queEntra(j, {}).length).toBeGreaterThan(0);
        for (const e of j.elementos) {
          expect(sua6.franja(e, j, "ok").cita).toMatch(/SUA 6/);
          expect(sua6.resultadoLista(e).length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("el dibujo de la piscina es más ancho y lleva la barrera, el andén y el vaso", () => {
    const j = caso("plurifamiliar", { vasos: "ambos" });
    const dibujo = sua6.dibujo(j, edificioDeCaso("plurifamiliar"));
    expect(dibujo.ancho).toBeGreaterThan(640);
    const keys = dibujo.marcas.map((x) => x.key);
    expect(keys).toEqual(expect.arrayContaining(["barrera", "anden", "vaso-recreo", "vaso-infantil", "linea-140", "escaleras"]));
  });

  it("la ficha rotula lo habitual como criterio y lo cambiado como decisión", () => {
    const j = caso("plurifamiliar", { anden_m: 2 });
    const estado = { ...sua6EstadoDefaults, anden_m: 2 };
    const ficha = sua6.ficha(j, { estado, edificio: edificioDeCaso("plurifamiliar"), revisados: [], svg: { nativeW: 930, nativeH: 400 } });
    expect(ficha.datosPartida.find((f) => f.concepto === "Andén")?.origen).toBe("Decisión del proyectista");
    expect(ficha.datosPartida.find((f) => f.concepto === "Vasos")?.origen).toMatch(/Criterio/);
  });
});
