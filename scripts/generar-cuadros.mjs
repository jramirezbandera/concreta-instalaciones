// Genera los cuadros de superficies SINTÉTICOS de la prueba en vivo de
// «Leer el cuadro de superficies» (feature-13, src/test/live/cuadro.live.test.ts).
// Ningún proyecto real: un PDF de memoria con capa de texto, un plano A1 con la
// tabla dibujada en desorden (como la exporta un CAD) y el HTML de una
// unifamiliar, del que sale la captura PNG:
//
//   node scripts/generar-cuadros.mjs
//   msedge --headless=new --screenshot=src/test/live/cuadros/cuadro-unifamiliar.png
//     --window-size=604,760 file:///<ruta>/src/test/live/cuadros/unifamiliar.html
//
// El plano baraja sus celdas con una semilla fija, pero la línea base de cada
// fila lleva un temblor aleatorio: dos ejecuciones no dan el mismo PDF.
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { jsPDF } = require("jspdf");
const out = process.argv[2] ?? "src/test/live/cuadros";

// [texto, útil, construida] · null = sin valor · "H" = cabecera de bloque
const PLURI = [
  ["H", "PLANTA SÓTANO"],
  ["Garaje (12 plazas)", "386,40", "412,50"],
  ["Trasteros (6 uds.)", "31,20", "36,00"],
  ["Cuarto de instalaciones (aljibe y grupo de presión)", "14,10", "16,20"],
  ["Total planta sótano", "431,70", "464,70"],
  ["H", "PLANTA BAJA"],
  ["Local comercial 1", "128,35", "140,10"],
  ["Portal y escalera", "31,80", "38,40"],
  ["Cuarto de contadores", "4,20", "5,10"],
  ["Cuarto de basuras", "3,90", "4,60"],
  ["Total planta baja", "168,25", "188,20"],
  ["H", "PLANTAS 1.ª, 2.ª Y 3.ª (superficies por planta)"],
  ["H", "Vivienda tipo A (1.º A, 2.º A, 3.º A)"],
  ["Vestíbulo", "4,10", null],
  ["Salón-comedor", "24,60", null],
  ["Cocina", "9,80", null],
  ["Dormitorio principal", "13,90", null],
  ["Dormitorio 2", "10,40", null],
  ["Dormitorio 3", "8,90", null],
  ["Baño 1", "4,80", null],
  ["Baño 2 (en suite)", "3,90", null],
  ["Distribuidor", "3,70", null],
  ["Total vivienda A", "84,10", "98,30"],
  ["Terraza (computa al 50 %)", null, "3,10"],
  ["H", "Vivienda tipo B (1.º B, 2.º B, 3.º B)"],
  ["Vestíbulo", "3,20", null],
  ["Salón-comedor-cocina", "26,30", null],
  ["Dormitorio principal", "12,60", null],
  ["Dormitorio 2", "9,70", null],
  ["Baño", "4,50", null],
  ["Aseo", "2,30", null],
  ["Pasillo", "2,90", null],
  ["Total vivienda B", "61,50", "73,80"],
  ["Rellano y escalera", "14,60", "17,90"],
  ["Total por planta", "160,20", "193,10"],
  ["H", "CUBIERTA"],
  ["Castillete de escalera", "12,40", "15,20"],
  ["Cubierta plana no transitable", null, "182,00"],
  ["H", "RESUMEN"],
  ["Superficie útil total", "1093,10", null],
  ["Superficie construida sobre rasante", null, "782,60"],
  ["Superficie construida bajo rasante", null, "464,70"],
];

// ── 1. PDF de memoria: la tabla escrita fila a fila ────────────────────────
{
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("4. CUADRO DE SUPERFICIES", 20, 22);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Edificio de 6 viviendas, local comercial y garaje · C/ Ejemplo 12, Cáceres", 20, 29);
  let y = 40;
  doc.setFont("helvetica", "bold");
  doc.text("Dependencia", 20, y);
  doc.text("Sup. útil (m²)", 135, y, { align: "right" });
  doc.text("Sup. construida (m²)", 185, y, { align: "right" });
  doc.line(20, y + 1.5, 190, y + 1.5);
  y += 7;
  let pagina = 1;
  for (const [t, u, c] of PLURI) {
    if (y > 280) {
      doc.addPage();
      pagina++;
      y = 22;
    }
    if (t === "H") {
      y += 2;
      doc.setFont("helvetica", "bold");
      doc.text(u, 20, y);
      doc.setFont("helvetica", "normal");
      y += 6;
      continue;
    }
    const total = /^Total|^Superficie/.test(t);
    doc.setFont("helvetica", total ? "bold" : "normal");
    doc.text(t, total ? 20 : 24, y);
    if (u) doc.text(u, 135, y, { align: "right" });
    if (c) doc.text(c, 185, y, { align: "right" });
    y += 5.2;
  }
  writeFileSync(join(out, "cuadro-plurifamiliar.pdf"), Buffer.from(doc.output("arraybuffer")));
  console.log("cuadro-plurifamiliar.pdf", pagina, "páginas");
}

// ── 2. Plano A1: la misma tabla en una esquina, celdas en desorden, con cotas ──
{
  const doc = new jsPDF({ unit: "mm", format: "a1", orientation: "landscape" });
  // Ruido de plano: un rectángulo de planta con cotas y rótulos.
  doc.setLineWidth(0.5);
  doc.rect(40, 60, 420, 300);
  doc.setFontSize(10);
  const ruido = [
    ["SALÓN", 120, 150], ["COCINA", 260, 140], ["DORM. 1", 360, 120], ["BAÑO", 330, 240],
    ["3,05", 30, 210], ["12,40", 250, 55], ["2,70", 470, 200], ["PLANTA TIPO · E 1:50", 60, 420],
    ["Ø110", 300, 300], ["+3,00", 40, 380], ["+6,00", 40, 390],
  ];
  for (const [t, x, y] of ruido) doc.text(t, x, y);
  doc.text("COTA +9,00", 500, 300, { angle: 90 });
  // La tabla: celdas como textos sueltos, dibujadas en orden aleatorio.
  const X0 = 560;
  let y = 80;
  const celdas = [];
  celdas.push(["CUADRO DE SUPERFICIES", X0, 70, true]);
  celdas.push(["DEPENDENCIA", X0, y, true], ["ÚTIL m²", X0 + 150, y, true], ["CONSTR. m²", X0 + 200, y, true]);
  y += 9;
  for (const [t, u, c] of PLURI) {
    const dy = (Math.random() - 0.5) * 0.6; // el CAD no deja la línea base exacta
    if (t === "H") {
      celdas.push([u, X0, y + dy, true]);
    } else {
      celdas.push([t, X0 + 4, y + dy, /^Total|^Superficie/.test(t)]);
      if (u) celdas.push([u, X0 + 150, y + dy, false]);
      if (c) celdas.push([c, X0 + 200, y + dy, false]);
    }
    y += 8;
  }
  let s = 7;
  for (let i = celdas.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [celdas[i], celdas[j]] = [celdas[j], celdas[i]];
  }
  doc.setFontSize(12);
  for (const [t, x, yy, b] of celdas) {
    doc.setFont("helvetica", b ? "bold" : "normal");
    doc.text(t, x, yy);
  }
  writeFileSync(join(out, "cuadro-plano-a1.pdf"), Buffer.from(doc.output("arraybuffer")));
  console.log("cuadro-plano-a1.pdf");
}

// ── 3. HTML de una unifamiliar, para la captura ─────────────────────────────
const UNI = [
  ["H", "PLANTA BAJA"],
  ["Porche de entrada", "8,40", "exterior"],
  ["Vestíbulo", "6,20"],
  ["Salón-comedor", "32,50"],
  ["Cocina", "14,30"],
  ["Aseo", "2,90"],
  ["Lavadero", "4,10"],
  ["Garaje", "22,60"],
  ["Total útil planta baja", "82,60", "t"],
  ["H", "PLANTA PRIMERA"],
  ["Distribuidor", "5,40"],
  ["Dormitorio principal", "16,20"],
  ["Vestidor", "4,30"],
  ["Baño principal", "6,10"],
  ["Dormitorio 2", "11,80"],
  ["Dormitorio 3", "10,90"],
  ["Baño 2", "4,60"],
  ["Terraza", "9,50", "exterior"],
  ["Total útil planta primera", "59,30", "t"],
  ["H", "TOTALES"],
  ["Superficie útil total", "141,90", "t"],
  ["Superficie construida total", "172,40", "t"],
  ["Superficie de parcela", "520,00", "t"],
];
const filas = UNI.map(([t, v, k]) =>
  t === "H"
    ? `<tr class="h"><td colspan="2">${v}</td></tr>`
    : `<tr class="${k === "t" ? "t" : ""}"><td>${t}${k === "exterior" ? " <i>(exterior)</i>" : ""}</td><td>${v}</td></tr>`,
).join("");
writeFileSync(
  join(out, "unifamiliar.html"),
  `<!doctype html><meta charset="utf-8"><style>
  body{margin:0;padding:22px;font:14px Arial,sans-serif;color:#111;background:#fff;width:560px}
  h1{font-size:15px;margin:0 0 4px} p{margin:0 0 12px;color:#444;font-size:12px}
  table{border-collapse:collapse;width:100%} td{border:1px solid #999;padding:3px 8px}
  td+td{text-align:right;width:110px;font-family:Consolas,monospace}
  tr.h td{background:#e8e8e8;font-weight:bold} tr.t td{font-weight:bold}
  </style><h1>CUADRO DE SUPERFICIES ÚTILES</h1><p>Vivienda unifamiliar aislada · superficies en m²</p>
  <table>${filas}</table>`,
);
console.log("unifamiliar.html");
