import { describe, it, expect } from "vitest";
import { test, fc } from "@fast-check/vitest";
import { acumularAguasAbajo, peor, validarArbol, type NodoArbol } from "../grafo";
import type { Veredicto } from "../../pdf/renderFicha";

// =============================================================================
// Kernel de grafo/veredicto compartido (HS4/HS5). Validación ENDURECIDA del
// árbol + orden topológico determinista + acumulación aguas abajo + `peor`.
// =============================================================================

describe("peor — orden de severidad de veredictos", () => {
  it("neutral < ok < warn < fail", () => {
    expect(peor("neutral", "ok")).toBe("ok");
    expect(peor("ok", "warn")).toBe("warn");
    expect(peor("warn", "fail")).toBe("fail");
    expect(peor("fail", "ok")).toBe("fail");
    expect(peor("neutral", "neutral")).toBe("neutral");
  });

  test.prop([
    fc.constantFrom<Veredicto>("neutral", "ok", "warn", "fail"),
    fc.constantFrom<Veredicto>("neutral", "ok", "warn", "fail"),
  ])("conmutativo en severidad y devuelve uno de los dos", (a, b) => {
    expect(peor(a, b)).toBe(peor(b, a));
    expect([a, b]).toContain(peor(a, b));
  });
});

describe("validarArbol — endurecido (OV-ARCH)", () => {
  const arbolLineal: NodoArbol[] = [
    { id: "hoja", parentId: "rama" },
    { id: "rama", parentId: "raiz" },
    { id: "raiz", parentId: null },
  ];

  it("árbol lineal válido: arbolValido=true, post-orden hojas→raíz, una raíz", () => {
    const r = validarArbol(arbolLineal);
    expect(r.arbolValido).toBe(true);
    expect(r.warnings).toEqual([]);
    expect(r.raices).toEqual(["raiz"]);
    // Post-orden: cada nodo aparece después de sus hijos.
    expect(r.orden).toEqual(["hoja", "rama", "raiz"]);
    expect(r.childrenIds.get("raiz")).toEqual(["rama"]);
    expect(r.childrenIds.get("rama")).toEqual(["hoja"]);
  });

  it("(a) id DUPLICADO ⇒ arbolValido=false + warning", () => {
    const r = validarArbol([
      { id: "raiz", parentId: null },
      { id: "raiz", parentId: null },
    ]);
    expect(r.arbolValido).toBe(false);
    expect(r.warnings.some((w) => /[Dd]uplicad/.test(w))).toBe(true);
  });

  it("(b) CICLO ⇒ arbolValido=false + warning", () => {
    const r = validarArbol([
      { id: "a", parentId: "b" },
      { id: "b", parentId: "a" },
    ]);
    expect(r.arbolValido).toBe(false);
    expect(r.warnings.some((w) => /[Cc]iclo/.test(w))).toBe(true);
    // Todos los nodos siguen en el orden (no se pierden), aunque no alcanzables.
    expect(r.orden.sort()).toEqual(["a", "b"]);
  });

  it("(c) HUÉRFANO (padre inexistente) ⇒ arbolValido=false + warning", () => {
    const r = validarArbol([{ id: "a", parentId: "fantasma" }]);
    expect(r.arbolValido).toBe(false);
    expect(r.warnings.some((w) => w.includes("fantasma"))).toBe(true);
  });

  it("(d) MÚLTIPLES RAÍCES ⇒ arbolValido=false por defecto (raíz única)", () => {
    const r = validarArbol([
      { id: "r1", parentId: null },
      { id: "r2", parentId: null },
    ]);
    expect(r.arbolValido).toBe(false);
    expect(r.raices).toEqual(["r1", "r2"]);
    expect(r.warnings.some((w) => /raíces/.test(w))).toBe(true);
  });

  it("permitirMultiRaiz=true: un bosque NO invalida (sigue válido)", () => {
    const r = validarArbol(
      [
        { id: "r1", parentId: null },
        { id: "r2", parentId: null },
      ],
      { permitirMultiRaiz: true },
    );
    expect(r.arbolValido).toBe(true);
    expect(r.raices).toEqual(["r1", "r2"]);
  });

  it("orden determinista: dos llamadas con el mismo input dan el mismo orden", () => {
    expect(validarArbol(arbolLineal).orden).toEqual(validarArbol(arbolLineal).orden);
  });
});

describe("acumularAguasAbajo — suma topológica", () => {
  it("suma el valor propio + el de los hijos (hojas → raíz)", () => {
    const { orden, childrenIds } = validarArbol([
      { id: "h1", parentId: "rama" },
      { id: "h2", parentId: "rama" },
      { id: "rama", parentId: "raiz" },
      { id: "raiz", parentId: null },
    ]);
    const propio: Record<string, number> = { h1: 1, h2: 2, rama: 4, raiz: 8 };
    const acum = acumularAguasAbajo(orden, childrenIds, (id) => propio[id] ?? 0);
    expect(acum.get("h1")).toBe(1);
    expect(acum.get("h2")).toBe(2);
    expect(acum.get("rama")).toBe(4 + 1 + 2); // propio + hijos
    expect(acum.get("raiz")).toBe(8 + 7); // propio + rama acumulada
  });

  // Monotonía: añadir aporte en una hoja nunca reduce el acumulado de la raíz.
  test.prop([fc.nat({ max: 100 }), fc.nat({ max: 100 })])(
    "el acumulado de la raíz crece (o iguala) al aumentar el valor de una hoja",
    (base, extra) => {
      const { orden, childrenIds } = validarArbol([
        { id: "hoja", parentId: "raiz" },
        { id: "raiz", parentId: null },
      ]);
      const a = acumularAguasAbajo(orden, childrenIds, (id) => (id === "hoja" ? base : 0));
      const b = acumularAguasAbajo(orden, childrenIds, (id) => (id === "hoja" ? base + extra : 0));
      expect(b.get("raiz")!).toBeGreaterThanOrEqual(a.get("raiz")!);
    },
  );
});
