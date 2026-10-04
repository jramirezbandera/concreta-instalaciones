// @vitest-environment node
/**
 * Lectura REAL de cuadros de superficies con el proveedor de IA (feature-13).
 * No corre en la suite: hay que pedirla con CUADRO_LIVE=1, y gasta cupo de la
 * clave. Comprueba, con documentos de formato real, que el texto que saca pdf.js
 * (o la captura) y el prompt dan filas con las que `montar.ts` arma el edificio
 * que un técnico firmaría. El veredicto lo da quien lee el volcado; el test solo
 * exige lo que el cuadro dice sin ambigüedad.
 *
 *   CUADRO_LIVE=1 CUADRO_KEY=… bunx vitest run src/test/live/cuadro.live.test.ts
 *
 * Variables: CUADRO_PROVIDER (anthropic | openai | gemini; por defecto gemini),
 * CUADRO_KEY (si no, la compartida de .env.local con `--mode development`),
 * CUADRO_OUT (fichero JSON donde volcar lecturas y edificios), CUADRO_SOLO
 * (parte del nombre de un fichero, para leer solo ese).
 *
 * Los cuadros de `cuadros/` son sintéticos (ningún proyecto real sale de aquí):
 * un PDF de memoria con capa de texto, un plano A1 con la tabla dibujada en
 * desorden (como la exporta un CAD) y una captura de una unifamiliar.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { extraerTextos } from "../../lib/ai/pdfPrep";
import { runChatTurn } from "../../lib/ai/providers";
import { sharedKeyFor } from "../../lib/ai/sharedKey";
import type { AiProviderId } from "../../lib/ai/types";
import { edificioDeCaso } from "../../lib/edificio/casos";
import { construirPeticion, esEscaneado, parseLectura, seleccionarTexto } from "../../lib/edificio/cuadro/leer";
import { filasRevisables, montarEdificio } from "../../lib/edificio/cuadro/montar";
import { fraseEdificio, nombreGrupo, resumenEdificio, validarEdificio } from "../../lib/edificio/derivar";
import type { Edificio, ViviendaTipo } from "../../lib/edificio/tipos";

const vivo = process.env.CUADRO_LIVE === "1";
const carpeta = resolve("src/test/live/cuadros");
const proveedor = (process.env.CUADRO_PROVIDER ?? "gemini") as AiProviderId;
const solo = process.env.CUADRO_SOLO ?? "";
const ficheros = vivo
  ? readdirSync(carpeta).filter((f) => /\.(pdf|png|jpe?g)$/i.test(f) && f.includes(solo))
  : [];
const salida: Record<string, unknown> = {};

async function textoDePdf(ruta: string) {
  const raiz = resolve("node_modules/pdfjs-dist/legacy/build");
  const pdfjs = (await import(/* @vite-ignore */ pathToFileURL(join(raiz, "pdf.mjs")).href)) as typeof import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = pathToFileURL(join(raiz, "pdf.worker.mjs")).href;
  const standardFontDataUrl = `${pathToFileURL(resolve("node_modules/pdfjs-dist/standard_fonts")).href}/`;
  const doc = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(ruta)), standardFontDataUrl }).promise;
  return { paginas: doc.numPages, textos: await extraerTextos(doc, "lineas") };
}

const tipos = (e: Edificio) =>
  e.unidades.filter((u): u is ViviendaTipo => u.clase === "vivienda").sort((a, b) => b.superficieUtil_m2 - a.superficieUtil_m2);

describe.skipIf(!vivo)("lectura real de cuadros de superficies", () => {
  it.each(ficheros)("%s", async (nombre) => {
    const clave = process.env.CUADRO_KEY ?? sharedKeyFor(proveedor);
    expect(clave, `sin clave para ${proveedor}`).toBeTruthy();
    const ruta = join(carpeta, nombre);

    const t0 = Date.now();
    let req;
    let seleccion = null;
    if (nombre.endsWith(".pdf")) {
      const { paginas, textos } = await textoDePdf(ruta);
      expect(esEscaneado(textos), "el test en vivo cubre PDF con texto").toBe(false);
      seleccion = seleccionarTexto(textos);
      req = construirPeticion({ tipo: "pdf", nombre, paginas, seleccion }, []);
    } else {
      const data = readFileSync(ruta).toString("base64");
      req = construirPeticion({ tipo: "imagenes", nombre }, [{ data, mediaType: "image/png" }]);
    }
    const envelope = await runChatTurn(proveedor, clave!, req);
    const lectura = parseLectura(envelope.proposal);
    const t1 = Date.now();
    const filas = filasRevisables(lectura);
    const { edificio, avisos } = montarEdificio(filas, edificioDeCaso("plurifamiliar"), nombre);

    salida[nombre] = { ms: t1 - t0, chars: seleccion?.chars, reply: envelope.reply, lectura, avisos, edificio };
    if (process.env.CUADRO_OUT) writeFileSync(process.env.CUADRO_OUT, JSON.stringify(salida, null, 2), "utf-8");

    console.log(`\n■ ${nombre} · ${lectura.filas.length} filas · ia ${t1 - t0} ms\n  ${envelope.reply}`);
    for (const f of filas) {
      console.log(
        `  ${f.usar ? "✓" : "·"} ${String(f.nivel).padStart(2)}${f.plantas > 1 ? `×${f.plantas}` : "  "} ${f.que.padEnd(14)} ${f.estancia.padEnd(10)} ${String(f.superficie_m2).padStart(8)} ${f.tipoSuperficie.padEnd(10)} ${f.unidad.padEnd(14)} ${f.tipoVivienda.padEnd(4)} ${f.confianza.padEnd(5)} ${f.texto}${f.nota ? `  — ${f.nota}` : ""}`,
      );
    }
    for (const a of lectura.avisos) console.log(`  ! ${a}`);
    if (edificio) {
      console.log(`  → ${fraseEdificio(edificio)}`);
      for (const g of edificio.grupos) {
        console.log(
          `    ${nombreGrupo(g).corto.padEnd(7)} ${g.zonas.map((z) => `${z.uso} ${z.superficieUtil_m2}${z.plazas ? ` (${z.plazas} pl.)` : ""}${z.numero ? ` (${z.numero} tr.)` : ""}${z.unidades?.length ? ` [${z.unidades.map((u) => `${u.tipoId}×${u.cantidad}`).join(" ")}]` : ""}`).join(" · ")}`,
        );
      }
      for (const t of tipos(edificio)) {
        console.log(`    tipo ${t.nombre}: ${t.dormitorios}D ${t.banos}B ${t.aseos}A ${t.superficieUtil_m2} m²`);
      }
      for (const a of [...avisos, ...validarEdificio(edificio)]) console.log(`    ? ${a}`);
    }

    // Lo que el cuadro dice sin ambigüedad.
    expect(edificio).not.toBeNull();
    const e = edificio!;
    const r = resumenEdificio(e);
    if (nombre.includes("unifamiliar")) {
      expect(r.esUnifamiliar).toBe(true);
      expect(tipos(e)[0]).toMatchObject({ dormitorios: 3, banos: 2, aseos: 1 });
      expect(r.superficiePorUso.garaje_privado).toBeCloseTo(22.6, 2);
      expect(r.superficiePorUso.vivienda_unifamiliar).toBeCloseTo(119.3, 1);
    } else {
      expect(r.numViviendas).toBe(6);
      const [a, b] = tipos(e);
      expect(a).toMatchObject({ dormitorios: 3, banos: 2, aseos: 0, superficieUtil_m2: 84.1 });
      expect(b).toMatchObject({ dormitorios: 2, banos: 1, aseos: 1, superficieUtil_m2: 61.5 });
      expect(r.superficiePorUso.garaje).toBeCloseTo(386.4, 2);
      expect(r.superficiePorUso.local_sin_uso).toBeCloseTo(128.35, 2);
      expect(r.superficiePorUso.trasteros).toBeCloseTo(31.2, 2);
      // Contadores y aljibe, aparte de las zonas comunes.
      expect(r.superficiePorUso.instalaciones).toBeCloseTo(18.3, 2);
      const garaje = e.grupos.flatMap((g) => g.zonas).find((z) => z.uso === "garaje");
      expect(garaje?.plazas).toBe(12);
    }
  }, 240_000);
});
