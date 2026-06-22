import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { calcHS4, hs4Defaults } from "../calc";
import { HS4SVG } from "../svg";
import { HS4_PDF_SVG_ID, hs4NativeSize } from "../svg-meta";

// =============================================================================
// HS4 — render SVG del árbol de red (smoke ACCESIBLE, TEST-1 T5b). Cierra la
// cobertura del eng review: render con @testing-library/react verificando
//   (1) accesibilidad WCAG (role="img" + <title>/<desc> no vacíos),
//   (2) recorrido crítico marcado (texto «crítico», codificación multicanal),
//   (3) render en modo 'pdf' sin lanzar y compatible con HS4_PDF_SVG_ID,
//   (4) tamaño nativo (función pura `hs4NativeSize`) estrictamente positivo.
//
// El componente NO usa getBBox/getBoundingClientRect del DOM (calcula el viewBox
// de los DATOS vía fitViewBox): los tests no necesitan polyfill de jsdom.
// =============================================================================

const result = calcHS4(hs4Defaults);

describe("HS4SVG — smoke accesible (screen)", () => {
  it("el SVG tiene role=img y title/desc no vacíos (WCAG 1.1.1 / 1.4.1)", () => {
    const { container } = render(
      <HS4SVG result={result} mode="screen" width={480} height={300} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("role")).toBe("img");

    // <title> y <desc> presentes, no vacíos, y enlazados por aria-labelledby.
    const title = svg!.querySelector("title");
    const desc = svg!.querySelector("desc");
    expect(title).not.toBeNull();
    expect(desc).not.toBeNull();
    expect((title!.textContent ?? "").trim().length).toBeGreaterThan(0);
    expect((desc!.textContent ?? "").trim().length).toBeGreaterThan(0);

    const labelledby = svg!.getAttribute("aria-labelledby") ?? "";
    expect(labelledby).toContain(title!.getAttribute("id"));
    expect(labelledby).toContain(desc!.getAttribute("id"));
  });

  it("marca el RECORRIDO CRÍTICO con texto «crítico» (multicanal, no solo color)", () => {
    const { container } = render(
      <HS4SVG result={result} mode="screen" width={480} height={300} />,
    );
    const textos = [...container.querySelectorAll("text")].map((t) => t.textContent ?? "");

    // Hay al menos un tramo crítico en los defaults (siempre hay punto crítico).
    expect(result.porTramo.some((t) => t.esCritico)).toBe(true);
    // El recorrido crítico se refuerza con la etiqueta textual «crítico».
    expect(textos.some((t) => t.includes("crítico"))).toBe(true);
    // El punto más desfavorable lleva la marca reforzada «◆ crítico».
    expect(textos.some((t) => t.includes("◆ crítico"))).toBe(true);

    // El nº de etiquetas «crítico» coincide con el nº de tramos críticos del
    // motor (cada tramo del recorrido crítico pinta una etiqueta).
    const nEtiquetasCritico = textos.filter((t) => t.includes("crítico")).length;
    const nTramosCriticos = result.porTramo.filter((t) => t.esCritico).length;
    expect(nEtiquetasCritico).toBe(nTramosCriticos);
  });

  it("la descripción accesible refleja el veredicto y el recorrido crítico", () => {
    const { container } = render(
      <HS4SVG result={result} mode="screen" width={480} height={300} />,
    );
    const desc = container.querySelector("desc")!.textContent ?? "";
    // El veredicto global y la codificación del crítico se enuncian en texto.
    expect(desc).toMatch(/Cumple|No cumple|aviso|Sin veredicto/i);
    expect(desc).toMatch(/cr[íi]tico/i);
  });
});

describe("HS4SVG — modo PDF", () => {
  it("renderiza en mode='pdf' sin lanzar y produce un SVG accesible", () => {
    expect(() =>
      render(<HS4SVG result={result} mode="pdf" width={420} height={315} />),
    ).not.toThrow();

    const { container } = render(
      <HS4SVG result={result} mode="pdf" width={420} height={315} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("role")).toBe("img");
    expect(svg!.getAttribute("data-mode")).toBe("pdf");
  });

  it("es localizable dentro del contenedor del clon PDF (HS4_PDF_SVG_ID)", () => {
    // El componente NO aplica el id por sí mismo: lo monta `ui.tsx` en un
    // contenedor envolvente (clon oculto). Aquí reproducimos ESE montaje y
    // comprobamos que renderFicha podría localizar el SVG por ese id en el DOM.
    expect(HS4_PDF_SVG_ID).toBe("hs4-svg-pdf");
    const { container } = render(
      <div id={HS4_PDF_SVG_ID}>
        <HS4SVG result={result} mode="pdf" width={420} height={315} />
      </div>,
    );
    const host = container.querySelector(`#${HS4_PDF_SVG_ID}`);
    expect(host).not.toBeNull();
    expect(host!.querySelector("svg")).not.toBeNull();
  });
});

describe("hs4NativeSize — función pura", () => {
  it("devuelve nativeW > 0 y nativeH > 0 para los defaults", () => {
    const { nativeW, nativeH } = hs4NativeSize(result);
    expect(nativeW).toBeGreaterThan(0);
    expect(nativeH).toBeGreaterThan(0);
    expect(Number.isFinite(nativeW)).toBe(true);
    expect(Number.isFinite(nativeH)).toBe(true);
  });

  it("es determinista (misma entrada → mismo tamaño)", () => {
    expect(hs4NativeSize(result)).toEqual(hs4NativeSize(result));
    expect(hs4NativeSize(calcHS4(hs4Defaults))).toEqual(hs4NativeSize(calcHS4(hs4Defaults)));
  });

  it("red vacía (sin tramos): tamaño aún positivo (no degenera a 0)", () => {
    const vacio = calcHS4({
      presionAcometida_kPa: 250,
      criterioK: "sin_simultaneidad",
      aparatos: [],
      tramos: [],
    });
    const { nativeW, nativeH } = hs4NativeSize(vacio);
    expect(nativeW).toBeGreaterThan(0);
    expect(nativeH).toBeGreaterThan(0);
  });
});
