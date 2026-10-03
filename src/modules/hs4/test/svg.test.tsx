import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { calcHS4, hs4Defaults } from "../calc";
import { HS4SVG } from "../svg";
import { HS4_PDF_SVG_ID, hs4NativeSize } from "../svg-meta";

// =============================================================================
// HS4 — render SVG del ESQUEMA DE COLUMNA (feature-7; sustituye al árbol
// jerárquico). Verifica:
//   (1) accesibilidad WCAG (role="img" + <title>/<desc> no vacíos),
//   (2) recorrido crítico marcado (texto «crítico» + «◆», codificación
//       multicanal — nunca solo color),
//   (3) render en modo 'pdf' sin lanzar y compatible con HS4_PDF_SVG_ID,
//   (4) tamaño nativo (función pura `hs4NativeSize`) estrictamente positivo,
//   (5) sincronización con la tabla: clic → onSelect(id); `etiquetas` renombra.
//
// El componente NO usa getBBox/getBoundingClientRect del DOM (la geometría se
// deriva de los DATOS en svg-meta): los tests no necesitan polyfill de jsdom.
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
    // El recorrido crítico se refuerza con la etiqueta textual «crítico» en los
    // elementos con etiqueta (base, montante, niveles, derivaciones); los
    // descendientes colapsados van en rojo + marca «◆» en el punto crítico.
    expect(textos.some((t) => t.includes("crítico"))).toBe(true);
    // El punto de consumo más desfavorable lleva la marca reforzada «◆».
    expect(textos.some((t) => t.includes("◆"))).toBe(true);
  });

  it("dibuja el esquema de columna: base (acometida), montante y forjados", () => {
    const { container } = render(
      <HS4SVG result={result} mode="screen" width={480} height={300} />,
    );
    const textos = [...container.querySelectorAll("text")].map((t) => t.textContent ?? "");
    // Base con recuadro de la red general y etiquetas de acometida/montante.
    expect(textos.some((t) => t.includes("red general"))).toBe(true);
    expect(textos.some((t) => t.includes("acometida"))).toBe(true);
    expect(textos.some((t) => t.includes("montante"))).toBe(true);
    expect(container.querySelector("rect")).not.toBeNull();
    // Forjados discontinuos (dash "5 4") entre niveles.
    const dashes = [...container.querySelectorAll("line")].map((l) =>
      l.getAttribute("stroke-dasharray"),
    );
    expect(dashes.some((d) => d === "5 4")).toBe(true);
    // Caption con los totales (Q total · P crítica · X/N cumplen).
    expect(textos.some((t) => t.includes("Q total") && t.includes("tramos cumplen"))).toBe(true);
  });

  it("clic en un elemento → onSelect(id); `etiquetas` renombra sin cambiar ids", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <HS4SVG
        result={result}
        mode="screen"
        width={480}
        height={300}
        onSelect={onSelect}
        etiquetas={{ "deriv-particular": "Vivienda tipo" }}
      />,
    );
    // El nombre legible sustituye al id en la etiqueta del nivel.
    const textos = [...container.querySelectorAll("text")].map((t) => t.textContent ?? "");
    expect(textos.some((t) => t.includes("Vivienda tipo"))).toBe(true);

    // Clic sobre el montante → selecciona su fila en la tabla.
    const montante = container.querySelector('[data-el="montante"]');
    expect(montante).not.toBeNull();
    fireEvent.click(montante!);
    expect(onSelect).toHaveBeenCalledWith("montante");
  });

  it("selección: acento + anillo (círculo sin relleno) sobre el seleccionado", () => {
    const { container } = render(
      <HS4SVG
        result={result}
        mode="screen"
        width={480}
        height={300}
        selectedId="deriv-particular"
        onSelect={() => {}}
      />,
    );
    // El anillo de selección es un círculo fill="none" (primitiva Ring).
    const anillos = [...container.querySelectorAll("circle")].filter(
      (c) => c.getAttribute("fill") === "none",
    );
    expect(anillos.length).toBeGreaterThan(0);
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
