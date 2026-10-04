import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { si2 } from "../definicion";
import { si2EstadoDefaults, type Si2Estado } from "../estado";
import { justificarSi2 } from "../justificacion";
import { claseFachada, distanciaAngulo, FACHADAS_SI2 } from "../tablas";

// =============================================================================
// SI 2 · Propagación exterior (feature-19): medianeras, franjas entre sectores,
// reacción al fuego de la fachada y cubierta. Cifras: verificacion-si1-si2.md, A7–A8.
// =============================================================================

const dg = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const caso = (c: CasoEdificio, estado: Partial<Si2Estado> = {}) =>
  justificarSi2({ ...si2EstadoDefaults, ...estado }, { edificio: edificioDeCaso(c), datosGenerales: dg });

describe("SI2 · tablas", () => {
  it("la distancia entre huecos por el ángulo, con interpolación lineal", () => {
    expect([0, 45, 60, 90, 135, 180].map(distanciaAngulo)).toEqual([3, 2.75, 2.5, 2, 1.25, 0.5]);
    expect(distanciaAngulo(120)).toBeCloseTo(1.5);
    // Más ángulo, nunca más distancia.
    for (let a = 0; a < 180; a += 5) expect(distanciaAngulo(a + 5)).toBeLessThanOrEqual(distanciaAngulo(a));
  });

  it("la clase de la fachada por su altura total (10 y 18 m) y la del aislante de cámara (10 y 28 m)", () => {
    const F = FACHADAS_SI2.datos;
    expect([9, 10, 10.01, 18, 18.01].map((h) => claseFachada(F.reaccionSistemas, h))).toEqual(["D-s3,d0", "D-s3,d0", "C-s3,d0", "C-s3,d0", "B-s3,d0"]);
    expect([10, 28, 28.5].map((h) => claseFachada(F.reaccionAislamientoCamara, h))).toEqual(["D-s3,d0", "B-s3,d0", "A2-s3,d0"]);
  });
});

describe("SI2 · justificación", () => {
  it("Demo: franja de 1 m entre el local y las viviendas y huecos a 0,50 m en la planta baja", () => {
    const j = caso("plurifamiliar_locales");
    expect(j.elementos.map((e) => e.id)).toEqual(["medianeras", "vertical", "horizontal", "reaccion", "cubierta"]);
    const v = j.elementos.find((e) => e.id === "vertical")!.detalle;
    expect(v.clase === "vertical" && v.encuentros.map((x) => x.donde)).toEqual(["PB y P1"]);
    expect(si2.frase(j)).toBe("Medianeras EI 120; franja de 1 m EI 60 entre sectores; huecos de sectores distintos a 0,5 m; fachada de 13 m: C-s3,d0.");
  });

  it("en esquina la separación pasa a 2,00 m; la unifamiliar aislada no tiene franjas", () => {
    const h = caso("plurifamiliar_locales", { encuentro: "esquina" }).elementos.find((e) => e.id === "horizontal")!.detalle;
    expect(h.clase === "horizontal" && h.d_m).toBe(2);
    const u = caso("unifamiliar");
    expect(u.elementos.map((e) => e.id)).toEqual(["medianeras", "reaccion", "cubierta"]);
    expect(u.decisiones.medianeras).toBe("no");
  });

  it("la fachada ventilada pide la clase de su aislante; un peto que cruza un umbral se avisa", () => {
    const j = caso("plurifamiliar_locales", { ventilada: "si" });
    const r = j.elementos.find((e) => e.id === "reaccion")!.detalle;
    expect(r.clase === "reaccion" && r.aislante).toBe("B-s3,d0");
    // Oficinas: 10,6 m de fachada; con un peto de 1,10 m no cruza los 18 m. La plurifamiliar, 12 m: tampoco.
    expect(caso("oficinas").avisos).toEqual([]);
  });

  it("la memoria redacta la franja y la cubierta", () => {
    const t = textoPlanoMemoria(si2.memoria(caso("plurifamiliar_locales")));
    expect(t).toMatch(/la fachada es al menos EI 60 en una franja de 1 m de altura/);
    expect(t).toMatch(/REI 60 en una franja de 0,5 m medida desde el edificio colindante/);
  });
});
