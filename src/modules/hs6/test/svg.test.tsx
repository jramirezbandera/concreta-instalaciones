import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { calcHS6, hs6Defaults, type HS6Inputs } from "../calc";
import { HS6SVG } from "../svg";
import { HS6_PDF_SVG_ID, hs6NativeSize } from "../svg-meta";

// =============================================================================
// HS6 — render SVG de la sección local–terreno (smoke ACCESIBLE). Verifica:
//   (1) accesibilidad WCAG (role="img" + <title>/<desc> no vacíos, enlazados),
//   (2) el ELEMENTO CRÍTICO se marca MULTICANAL (no solo color): trazo crítico
//       (kind="critical" → trazo discontinuo) + etiqueta textual de aviso,
//   (3) render en modo 'pdf' sin lanzar + montaje en el clon con HS6_PDF_SVG_ID,
//   (4) caso "no aplica" → sección simplificada con mensaje,
//   (5) tamaño nativo (función pura `hs6NativeSize`) estrictamente positivo.
//
// El componente NO usa getBBox/getBoundingClientRect del DOM (calcula el viewBox
// de los DATOS vía fitViewBox): los tests no necesitan polyfill de jsdom.
// =============================================================================

const result = calcHS6(hs6Defaults);

// Caso NO CUMPLE: Zona II SIN barrera (obligatoria) → falta la medida exigida.
// El motor marca `elementoCriticoId = HS6_FALTA_MEDIDA` → la sección inserta una
// banda-hueco crítica que el render resalta con trama roja + «⚠ falta medida».
const sinBarreraInputs: HS6Inputs = {
  zona: "II",
  municipio: "Cáceres",
  localHabitableEnContactoConTerreno: true,
  soluciones: [
    {
      tipo: "espacio_contencion",
      id: "camara-ventilada",
      nombre: "Cámara ventilada",
      ventilacion: "natural",
      perimetro_m: 40,
      areaAberturas_cm2: 480,
      alturaCamara_mm: 80,
    },
  ],
};
const sinBarrera = calcHS6(sinBarreraInputs);

// Caso NO APLICA: local no en contacto con el terreno → HS6 no exige medidas.
const noAplica = calcHS6({
  zona: "sin_exigencia",
  localHabitableEnContactoConTerreno: false,
  soluciones: [],
});

describe("HS6SVG — smoke accesible (screen)", () => {
  it("el SVG tiene role=img y title/desc no vacíos y enlazados (WCAG 1.1.1 / 1.4.1)", () => {
    const { container } = render(
      <HS6SVG result={result} mode="screen" width={480} height={420} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("role")).toBe("img");

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

  it("la descripción accesible enuncia zona, exigencia y veredicto", () => {
    const { container } = render(
      <HS6SVG result={result} mode="screen" width={480} height={420} />,
    );
    const desc = container.querySelector("desc")!.textContent ?? "";
    expect(desc).toMatch(/radón/i);
    expect(desc).toMatch(/Cumple|No cumple|aviso|Sin veredicto/i);
    expect(desc).toContain(`Zona ${result.zona}`);
  });

  it("pinta la etiqueta del nivel de referencia del recinto protegido", () => {
    const { container } = render(
      <HS6SVG result={result} mode="screen" width={480} height={420} />,
    );
    const textos = [...container.querySelectorAll("text")].map((t) => t.textContent ?? "");
    // El dato clave (≤ 300 Bq/m³) está en el SVG Y, redundante, en la tabla UI.
    expect(textos.some((t) => t.includes("300 Bq/m³"))).toBe(true);
  });
});

describe("HS6SVG — elemento crítico MULTICANAL (Zona II sin barrera)", () => {
  it("el motor marca el caso como NO CUMPLE con elemento crítico", () => {
    expect(sinBarrera.aplica).toBe(true);
    expect(sinBarrera.veredictoGlobal).toBe("fail");
    expect(sinBarrera.elementoCriticoId).not.toBeNull();
  });

  it("resalta el crítico con TRAZO discontinuo (no solo color) + etiqueta de aviso", () => {
    const { container } = render(
      <HS6SVG result={sinBarrera} mode="screen" width={480} height={420} />,
    );

    // (a) Codificación NO-color: al menos un trazo crítico discontinuo
    // (criticalStroke → strokeDasharray="4 2"), independiente del color rojo.
    const conDash = [...container.querySelectorAll("[stroke-dasharray]")].filter(
      (el) => (el.getAttribute("stroke-dasharray") ?? "").trim() === "4 2",
    );
    expect(conDash.length).toBeGreaterThan(0);

    // (b) Refuerzo textual directo: la banda-hueco lleva «falta medida».
    const textos = [...container.querySelectorAll("text")].map((t) => t.textContent ?? "");
    expect(textos.some((t) => t.includes("falta medida"))).toBe(true);

    // (c) El veredicto del crítico se enuncia en texto (multicanal redundante).
    expect(textos.some((t) => t.includes("incumple"))).toBe(true);
  });

  it("la descripción accesible refleja el incumplimiento", () => {
    const { container } = render(
      <HS6SVG result={sinBarrera} mode="screen" width={480} height={420} />,
    );
    const desc = container.querySelector("desc")!.textContent ?? "";
    expect(desc).toMatch(/No cumple/i);
  });
});

describe("HS6SVG — sección simplificada (no aplica)", () => {
  it("renderiza el mensaje «Sin exigencia HS6» sin lanzar", () => {
    const { container } = render(
      <HS6SVG result={noAplica} mode="screen" width={480} height={300} />,
    );
    const textos = [...container.querySelectorAll("text")].map((t) => t.textContent ?? "");
    expect(textos.some((t) => t.includes("Sin exigencia HS6"))).toBe(true);
    // Sin banda-hueco crítica en este caso.
    expect(textos.some((t) => t.includes("falta medida"))).toBe(false);
  });
});

describe("HS6SVG — modo PDF", () => {
  it("renderiza en mode='pdf' sin lanzar y produce un SVG accesible", () => {
    expect(() =>
      render(<HS6SVG result={result} mode="pdf" width={420} height={368} />),
    ).not.toThrow();

    const { container } = render(
      <HS6SVG result={result} mode="pdf" width={420} height={368} />,
    );
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute("role")).toBe("img");
    expect(svg!.getAttribute("data-mode")).toBe("pdf");
  });

  it("es localizable dentro del contenedor del clon PDF (HS6_PDF_SVG_ID)", () => {
    // El componente NO aplica el id por sí mismo: lo monta `ui.tsx` en un
    // contenedor envolvente (clon oculto). Aquí reproducimos ESE montaje y
    // comprobamos que renderFicha podría localizar el SVG por ese id en el DOM.
    expect(HS6_PDF_SVG_ID).toBe("hs6-svg-pdf");
    const { container } = render(
      <div id={HS6_PDF_SVG_ID}>
        <HS6SVG result={result} mode="pdf" width={420} height={368} />
      </div>,
    );
    const host = container.querySelector(`#${HS6_PDF_SVG_ID}`);
    expect(host).not.toBeNull();
    expect(host!.querySelector("svg")).not.toBeNull();
  });
});

describe("hs6NativeSize — función pura", () => {
  it("devuelve nativeW > 0 y nativeH > 0 para los defaults", () => {
    const { nativeW, nativeH } = hs6NativeSize(result);
    expect(nativeW).toBeGreaterThan(0);
    expect(nativeH).toBeGreaterThan(0);
    expect(Number.isFinite(nativeW)).toBe(true);
    expect(Number.isFinite(nativeH)).toBe(true);
  });

  it("es determinista (misma entrada → mismo tamaño)", () => {
    expect(hs6NativeSize(result)).toEqual(hs6NativeSize(result));
    expect(hs6NativeSize(calcHS6(hs6Defaults))).toEqual(hs6NativeSize(calcHS6(hs6Defaults)));
  });

  it("caso simplificado (no aplica): tamaño aún positivo (no degenera a 0)", () => {
    const { nativeW, nativeH } = hs6NativeSize(noAplica);
    expect(nativeW).toBeGreaterThan(0);
    expect(nativeH).toBeGreaterThan(0);
  });
});
