import { describe, expect, it } from "vitest";
import { textoPlanoMemoria } from "../../../lib/cte/memoria";
import { edificioDeCaso, type CasoEdificio } from "../../../lib/edificio/casos";
import type { Edificio } from "../../../lib/edificio/tipos";
import { crearProyectoDemo } from "../../../lib/proyecto/demo";
import { si3 } from "../definicion";
import { si3EstadoDefaults, type Si3Estado } from "../estado";
import { justificarSi3, proteccionExigida } from "../justificacion";
import { CAPACIDAD_TABLA_4_2, capacidadProtegida } from "../tablas";

// =============================================================================
// SI 3 · Evacuación de ocupantes (feature-19): ocupación, salidas y recorridos,
// escaleras, puertas, humo y discapacidad. Cifras: research/verificacion-si3.md.
// =============================================================================

const dg = crearProyectoDemo("2026-10-04T10:00:00.000Z").datosGenerales;
const con = (e: Edificio, estado: Partial<Si3Estado> = {}) => justificarSi3({ ...si3EstadoDefaults, ...estado }, { edificio: e, datosGenerales: dg });
const caso = (c: CasoEdificio, estado: Partial<Si3Estado> = {}) => con(edificioDeCaso(c), estado);

describe("SI3 · tablas", () => {
  it("tabla 4.2: la protegida es 160·A + n·k en las filas transcritas (2 a 10 plantas, 1,00 m)", () => {
    // Fila 1,00 m de la tabla: 224, 288, 352, 416, 480.
    expect([2, 4, 6, 8, 10].map((n) => capacidadProtegida(1.0, n))).toEqual([224, 288, 352, 416, 480]);
    // Fila 1,50 m: 356 · 472 · 588 · 704 · 820.
    expect([2, 4, 6, 8, 10].map((n) => capacidadProtegida(1.5, n))).toEqual([356, 472, 588, 704, 820]);
    // Con anchuras intermedias, la fila inferior (del lado de la seguridad).
    expect(capacidadProtegida(1.05, 2)).toBe(224);
    expect(CAPACIDAD_TABLA_4_2.datos.anchuras_m).toHaveLength(15);
  });

  it("tabla 5.1 en vivienda: no protegida hasta 14 m, protegida hasta 28 m", () => {
    expect([14, 14.01, 28, 28.01].map(proteccionExigida)).toEqual(["no_protegida", "protegida", "protegida", "especialmente_protegida"]);
  });
});

describe("SI3 · justificación", () => {
  it("Demo: 35 personas, una salida por planta con el recorrido pendiente de medir", () => {
    const j = caso("plurifamiliar_locales");
    expect(j.avisos.map((a) => a.id)).toEqual(["recorrido", "recorrido-garaje"]);
    expect(si3.frase(j)).toBe(
      "35 personas; escalera no protegida de 1 m; una salida por planta con recorridos de hasta 25 m; el garaje, por escalera especialmente protegida.",
    );
    const s = j.elementos.find((e) => e.id === "salidas")!.detalle;
    // Con escalera no protegida, el recorrido llega a la salida del edificio.
    expect(s.clase === "salidas" && s.hastaEdificio).toBe(true);
  });

  it("medido: 22 m cumple y quita el aviso; 28 m no cumple y lo explica", () => {
    expect(caso("plurifamiliar_locales", { recorrido_m: 22 }).avisos.map((a) => a.id)).toEqual(["recorrido-garaje"]);
    const j = caso("plurifamiliar_locales", { recorrido_m: 28 });
    const el = j.elementos.find((e) => e.id === "salidas")!;
    expect(el.veredicto).toBe("fail");
    expect(si3.textoIncumplimiento(el)?.detalle).toMatch(/28 m.*Con la escalera compartimentada o protegida, el recorrido acaba en ella/);
    // Con la escalera compartimentada, el recorrido se mide hasta ella.
    const k = caso("plurifamiliar_locales", { escalera: "compartimentada" });
    const s = k.elementos.find((e) => e.id === "salidas")!.detalle;
    expect(s.clase === "salidas" && s.hastaEdificio).toBe(false);
  });

  it("una escalera no protegida con más de 14 m no vale; lo arregla volver a lo habitual", () => {
    const e = edificioDeCaso("plurifamiliar");
    const alto: Edificio = { ...e, grupos: e.grupos.map((g) => (g.id === "g1" ? { ...g, repeticiones: 5 } : g)) };
    const j = con(alto, { escalera: "no_protegida" });
    const el = j.elementos.find((x) => x.id === "escalera")!;
    expect(el.veredicto).toBe("fail");
    expect(si3.arreglo?.(el, j)).toEqual({ etiqueta: "Volver a lo habitual", cambios: { escalera: "habitual" } });
    expect(con(alto).elementos.find((x) => x.id === "escalera")!.veredicto).toBe("ok");
  });

  it("el garaje bajo rasante: control de humo con 150 l/s por plaza", () => {
    const h = caso("plurifamiliar_locales").elementos.find((e) => e.id === "humo")!.detalle;
    expect(h.clase === "humo" && [h.plazas, h.extraccion_l_s, h.aportacion_l_s]).toEqual([14, 2100, 1680]);
  });

  it("unifamiliar: sin recorridos ni escaleras", () => {
    const j = caso("unifamiliar");
    expect(j.elementos.map((e) => e.id)).toEqual(["ocupacion", "unifamiliar"]);
    expect(j.avisos).toEqual([]);
  });

  it("la memoria dice desde dónde y hasta dónde se mide el recorrido", () => {
    const t = textoPlanoMemoria(si3.memoria(caso("plurifamiliar_locales", { recorrido_m: 21.5 })));
    expect(t).toMatch(/medido desde la puerta de la vivienda más alejada hasta la salida del edificio, bajando por la escalera, es de 21,5 m/);
    expect(t).toMatch(/especialmente protegida, con vestíbulo de independencia/);
  });
});
