// Genera src/data/radonHS6.ts — zona de radón (DB-HS6, Apéndice B) por código INE.
//
//   node scripts/generar-radon-hs6.mjs            → escribe src/data/radonHS6.ts
//   node scripts/generar-radon-hs6.mjs --informe  → además vuelca el informe
//                                                   (recuentos y casamientos) por stdout
//
// FUENTE: research/pdf/DBHS.pdf (DB-HS consolidado, «14 junio 2022»), Apéndice B
// «Clasificación de municipios en función del potencial de radón». La tabla tiene
// cuatro columnas: Nombre CCAA | Nombre PROVINCIAS | Municipios ZONA 1 | Municipios ZONA 2.
//
// CÓMO SE LEE: con pdfjs-dist (dependencia del proyecto) se toman los fragmentos de
// texto con sus coordenadas y se reparten en columnas POR POSICIÓN X (el orden de
// lectura de `pdftotext -layout` desalinea los rótulos). La celda combinada de
// CCAA/provincia repite su rótulo en la PRIMERA y en la ÚLTIMA línea del bloque de
// la provincia, así que cada municipio pertenece al último rótulo de provincia visto
// en orden de lectura (página ↑, y ↓). Un nombre largo partido en dos líneas se
// reconoce por el INTERLINEADO: dentro de una celda es ~6,8 pt; entre municipios,
// ≥ 7,3 pt. Cada nombre se casa después contra la relación oficial del INE de
// src/data/municipios.ts DENTRO de su provincia. Lo que no case por las vías
// automáticas ha de estar en ALIAS o en NO_MUNICIPALES, con su justificación; si
// queda algo sin resolver, el script FALLA y no escribe nada.
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { readFileSync, writeFileSync } from "node:fs";

const PDF = "research/pdf/DBHS.pdf";
const MUNICIPIOS_TS = "src/data/municipios.ts";
const SALIDA = "src/data/radonHS6.ts";
const INFORME = process.argv.includes("--informe");

// --- Columnas de la tabla por X (pt, origen PDF) ---------------------------------
// Medido sobre el PDF: CCAA x≈106.5, provincia x≈191.2, zona 1 x≈283.4, zona 2 x≈396.8.
function columna(x) {
  if (x < 100) return null;
  if (x < 185) return "ccaa";
  if (x < 280) return "prov";
  if (x < 390) return "z1";
  return "z2";
}
/** Interlineado máximo [pt] de dos líneas de UNA misma celda (nombre partido). */
const INTERLINEA_CELDA = 7.1;

// Rótulo de provincia del PDF → clave de PROVINCIAS del proyecto. Los bilingües del
// PDF («Gerona / Girona») se resuelven probando cada mitad; aquí solo lo que no sale así.
const PROVINCIA_ALIAS = { "Islas Baleares / Illes Balears": "Baleares" };

// Casamientos que la normalización automática NO resuelve: cambios de denominación y
// fusiones posteriores a la lista del CTE. Clave "Provincia|Nombre en el CTE".
// Verificado en cada caso que el código INE ocupa la posición alfabética del nombre
// antiguo dentro de su provincia (los códigos INE de 3 cifras se asignaron por orden
// alfabético) o, si es de la serie 9xx, que es el municipio creado por la fusión.
const ALIAS = {
  "Zaragoza|Jarque": {
    ine: "50130",
    porque: "hoy «Jarque de Moncayo» (cambio de denominación)",
  },
  "León|Candín": {
    ine: "24036",
    porque: "hoy «Valle de Ancares» (cambio de denominación)",
  },
  "Toledo|La Iglesuela": {
    ine: "45079",
    porque: "hoy «La Iglesuela del Tiétar» (cambio de denominación)",
  },
  "Barcelona|Bigues i Riells": {
    ine: "08023",
    porque: "hoy «Bigues i Riells del Fai» (cambio de denominación)",
  },
  "Girona|Masarac": {
    ine: "17100",
    porque: "hoy «Masarac i Vilarnadal» (cambio de denominación)",
  },
  "Girona|Brunyola": {
    ine: "17028",
    porque: "hoy «Brunyola i Sant Martí Sapresa» (cambio de denominación)",
  },
  "Girona|Calonge": {
    ine: "17034",
    porque: "hoy «Calonge i Sant Antoni» (cambio de denominación)",
  },
  "Girona|Castell-Platja d'Aro": {
    ine: "17048",
    porque:
      "hoy «Castell d'Aro, Platja d'Aro i s'Agaró» (cambio de denominación)",
  },
  "Badajoz|Guadiana del Caudillo": {
    ine: "06903",
    porque: "hoy «Guadiana» (cambio de denominación)",
  },
  "Cáceres|Higuera": {
    ine: "10097",
    porque: "hoy «Higuera de Albalat» (cambio de denominación)",
  },
  "Pontevedra|Cerdedo": {
    ine: "36902",
    porque: "fusionado con Cotobade en «Cerdedo-Cotobade» (2016)",
  },
  "Pontevedra|Cotobade": {
    ine: "36902",
    porque: "fusionado con Cerdedo en «Cerdedo-Cotobade» (2016)",
  },
};

// Entradas del Apéndice B que NO son municipios: territorios comunales o mancomunados
// (condominios, facerías…) que el mapa del CSN delimita como polígono propio pero que
// no tienen código en la relación de municipios del INE. No se pueden asignar a un
// municipio sin inventar; se cuentan como entradas del PDF y se listan aparte.
const NO_MUNICIPALES = {
  "Jaén|Cuarto del Madroño":
    "territorio no municipal (sin código INE de municipio)",
  "Burgos|Cabeza Alta": "territorio no municipal (sin código INE de municipio)",
  "Salamanca|Coto Mancomunado":
    "territorio no municipal (sin código INE de municipio)",
  "Navarra|Sierra de Aralar":
    "territorio no municipal: facería (sin código INE de municipio)",
  "Madrid|Los Baldios": "territorio no municipal (sin código INE de municipio)",
};

// --- Relación INE de municipios.ts (lectura textual; el archivo es generado) -----
function leerMunicipios() {
  const src = readFileSync(MUNICIPIOS_TS, "utf8");
  const porProv = new Map();
  const re = /^ {2}"([^"]+)": desempaquetar\(\[(.*)\]\),?$/gm;
  let m;
  while ((m = re.exec(src))) {
    const lista = [
      ...m[2].matchAll(/\{i:"(\d{5})",n:"((?:[^"\\]|\\.)*)"\}/g),
    ].map((x) => ({
      ine: x[1],
      nombre: JSON.parse(`"${x[2]}"`),
    }));
    porProv.set(m[1], lista);
  }
  return porProv;
}

// --- Normalización para casar nombres ---------------------------------------------
const quitarTildes = (s) => s.normalize("NFD").replace(/\p{M}/gu, "");
function norm(s) {
  return quitarTildes(s)
    .toLowerCase()
    .replace(/[‘’´`]/g, "'")
    .replace(/[-–.,()]/g, " ")
    .replace(/'\s*/g, "' ")
    .replace(/\s+/g, " ")
    .trim();
}
const ARTICULOS = /^(el|la|los|las|l'|lo|o|a|os|as|es|ses|sa|s'|els|en|na)\s+/;
const sinArticulo = (s) => s.replace(ARTICULOS, "");
const mitades = (s) =>
  s
    .split(/\s*\/\s*/)
    .map((x) => x.trim())
    .filter(Boolean);
/** «Migjorn Gran, Es» → «Es Migjorn Gran» (artículo pospuesto que el INE conserva en algunos). */
const antepuesto = (s) =>
  s.replace(/^(.+), (es|sa|ses|els|el|la|les|los|las|l'|s')$/i, "$2 $1");

/** Candidatos INE que casan con `nombre` en la provincia, por la primera vía que dé fruto. */
function casar(nombre, lista) {
  const vias = [
    ["literal", (n, m) => norm(n) === norm(m)],
    ["artículo pospuesto en el INE", (n, m) => norm(n) === norm(antepuesto(m))],
    [
      "mitad de nombre bilingüe",
      (n, m) =>
        mitades(n).some((a) => mitades(m).some((b) => norm(a) === norm(b))),
    ],
    [
      "sin artículo inicial",
      (n, m) =>
        mitades(n).some((a) =>
          mitades(antepuesto(m)).some(
            (b) => sinArticulo(norm(a)) === sinArticulo(norm(b)),
          ),
        ),
    ],
  ];
  for (const [via, f] of vias) {
    const c = lista.filter((m) => f(nombre, m.nombre));
    if (c.length > 0) return { via, candidatos: c };
  }
  return { via: null, candidatos: [] };
}

// --- Extracción del PDF -------------------------------------------------------------
async function extraerFilas() {
  const data = new Uint8Array(readFileSync(PDF));
  const doc = await getDocument({ data, verbosity: 0 }).promise;
  const filas = [];
  let dentro = false;
  let primeraPagina = null;
  let ultimaPagina = null;
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const texto = tc.items.map((i) => i.str).join("");
    if (
      !dentro &&
      texto.includes("Clasificación de municipios en función del potencial") &&
      texto.includes("Nombre CCAA")
    ) {
      dentro = true;
      primeraPagina = p;
    }
    if (!dentro) continue;
    if (texto.includes("Apéndice C")) break;
    // Agrupa por línea (y, con tolerancia de 1 pt) y columna (x).
    const lineas = []; // {y, celdas: {col: [{x, s}]}}
    for (const it of tc.items) {
      if (it.str === "") continue;
      const x = it.transform[4];
      const y = it.transform[5];
      const col = columna(x);
      if (col === null) continue;
      let l = lineas.find((q) => Math.abs(q.y - y) < 1);
      if (!l) lineas.push((l = { y, celdas: {} }));
      (l.celdas[col] ??= []).push({ x, s: it.str });
    }
    lineas.sort((a, b) => b.y - a.y);
    let hayTabla = p !== primeraPagina;
    let hayFilas = false;
    for (const { y, celdas: trozosPorCol } of lineas) {
      const celdas = {};
      for (const [col, trozos] of Object.entries(trozosPorCol)) {
        const t = trozos
          .sort((a, b) => a.x - b.x)
          .map((q) => q.s)
          .join("")
          .replace(/\s+/g, " ")
          .trim();
        if (t) celdas[col] = t;
      }
      if (celdas.ccaa === "Nombre CCAA") {
        hayTabla = true; // cabecera de la tabla: lo de antes es texto introductorio
        continue;
      }
      if (!hayTabla || y > 780 || y < 60) continue; // cabecera y número de página
      if (Object.keys(celdas).length === 0) continue;
      filas.push({ pagina: p, y, ...celdas });
      hayFilas = true;
    }
    if (hayFilas) ultimaPagina = p;
  }
  return { filas, primeraPagina, ultimaPagina };
}

// --- Programa -----------------------------------------------------------------------
const MUNICIPIOS = leerMunicipios();
if (MUNICIPIOS.size !== 52)
  throw new Error(`municipios.ts: ${MUNICIPIOS.size} provincias`);

function claveProvincia(rotulo) {
  if (PROVINCIA_ALIAS[rotulo]) return PROVINCIA_ALIAS[rotulo];
  const c = mitades(rotulo).find((h) => MUNICIPIOS.has(h));
  if (!c) throw new Error(`Rótulo de provincia sin clave: «${rotulo}»`);
  return c;
}

const { filas, primeraPagina, ultimaPagina } = await extraerFilas();
if (filas.length < 100)
  throw new Error(`Tabla no encontrada en ${PDF} (${filas.length} líneas)`);

// 1) Reparte cada línea de las columnas de zona a su provincia (último rótulo visto) y
//    une los nombres partidos (interlineado de celda).
const entradas = { z1: [], z2: [] }; // {prov, nombre, pagina, y}
const ordenProvincias = []; // {prov, rotulo, ccaa}
const unidas = [];
let prov = null;
for (const f of filas) {
  if (f.prov) {
    prov = claveProvincia(f.prov);
    if (ordenProvincias.at(-1)?.prov !== prov)
      ordenProvincias.push({
        prov,
        rotulo: f.prov,
        ccaa: f.ccaa ?? ordenProvincias.at(-1)?.ccaa,
      });
  } else if (f.ccaa) {
    throw new Error(`CCAA sin provincia en p.${f.pagina} y=${f.y}: ${f.ccaa}`);
  }
  for (const z of ["z1", "z2"]) {
    if (!f[z]) continue;
    if (prov === null)
      throw new Error(`Municipio antes del primer rótulo: ${f[z]}`);
    const ant = entradas[z].at(-1);
    if (ant && ant.pagina === f.pagina && ant.y - f.y < INTERLINEA_CELDA) {
      if (ant.prov !== prov)
        throw new Error(
          `Nombre partido entre provincias: ${ant.nombre} / ${f[z]}`,
        );
      unidas.push(`${prov}: «${ant.nombre}» + «${f[z]}»`);
      ant.nombre = `${ant.nombre} ${f[z]}`;
      ant.y = f.y;
      continue;
    }
    entradas[z].push({ prov, nombre: f[z], pagina: f.pagina, y: f.y });
  }
}

// 2) Casa cada nombre con el INE de su provincia.
const ZONA = { z1: "I", z2: "II" };
const resultado = new Map(); // ine → {zona, prov, cte, nombreIne}
const noLiterales = []; // casamientos por vía distinta de la literal
const noMunicipales = [];
const fusiones = []; // dos entradas del PDF → un mismo municipio INE (misma zona)
const sinCasar = []; // no resueltos (hacen fallar el script)
const ambiguos = [];
const conflictos = []; // un mismo INE en zonas distintas
const recuento = new Map(); // prov → {I, II} entradas del PDF

for (const z of ["z1", "z2"]) {
  for (const e of entradas[z]) {
    const zona = ZONA[z];
    const rc = recuento.get(e.prov) ?? { I: 0, II: 0 };
    rc[zona]++;
    recuento.set(e.prov, rc);
    const clave = `${e.prov}|${e.nombre}`;
    if (NO_MUNICIPALES[clave]) {
      noMunicipales.push({
        prov: e.prov,
        zona,
        cte: e.nombre,
        porque: NO_MUNICIPALES[clave],
      });
      continue;
    }
    const municipios = MUNICIPIOS.get(e.prov);
    let r;
    if (ALIAS[clave]) {
      const m = municipios.find((x) => x.ine === ALIAS[clave].ine);
      if (!m)
        throw new Error(
          `ALIAS ${clave} → ${ALIAS[clave].ine} no está en la provincia`,
        );
      r = { via: ALIAS[clave].porque, candidatos: [m] };
    } else {
      r = casar(e.nombre, municipios);
    }
    if (r.candidatos.length === 0) {
      sinCasar.push(`${e.prov} (zona ${zona}): «${e.nombre}» [p.${e.pagina}]`);
      continue;
    }
    if (r.candidatos.length > 1) {
      ambiguos.push(
        `${e.prov} (zona ${zona}): «${e.nombre}» → ${r.candidatos.map((c) => `${c.ine} ${c.nombre}`).join(" | ")}`,
      );
      continue;
    }
    const m = r.candidatos[0];
    if (r.via !== "literal") {
      noLiterales.push({
        prov: e.prov,
        zona,
        cte: e.nombre,
        ine: m.ine,
        nombreIne: m.nombre,
        via: r.via,
      });
    }
    const previo = resultado.get(m.ine);
    if (previo) {
      const txt = `${m.ine} «${m.nombre}»: «${previo.cte}» (zona ${previo.zona}) y «${e.nombre}» (zona ${zona})`;
      (previo.zona === zona ? fusiones : conflictos).push(txt);
      continue;
    }
    resultado.set(m.ine, {
      zona,
      prov: e.prov,
      cte: e.nombre,
      nombreIne: m.nombre,
    });
  }
}

const totalPdf = { I: 0, II: 0 };
for (const rc of recuento.values()) {
  totalPdf.I += rc.I;
  totalPdf.II += rc.II;
}
const totalMap = { I: 0, II: 0 };
for (const v of resultado.values()) totalMap[v.zona]++;
const fallo = sinCasar.length + ambiguos.length + conflictos.length > 0;

if (INFORME || fallo) {
  console.log(`Páginas de la tabla: ${primeraPagina}–${ultimaPagina}`);
  console.log(`Entradas del PDF: zona I ${totalPdf.I}, zona II ${totalPdf.II}`);
  console.log(`Códigos INE: zona I ${totalMap.I}, zona II ${totalMap.II}`);
  console.log(`\n## Recuento por provincia (orden del PDF)\n`);
  console.log(
    "| CCAA | Provincia (rótulo PDF) | Zona I PDF | Zona I INE | Zona II PDF | Zona II INE |",
  );
  console.log("|---|---|---:|---:|---:|---:|");
  for (const { prov: p, rotulo: r, ccaa: c } of ordenProvincias) {
    const rc = recuento.get(p) ?? { I: 0, II: 0 };
    const cas = { I: 0, II: 0 };
    for (const v of resultado.values()) if (v.prov === p) cas[v.zona]++;
    console.log(`| ${c} | ${r} | ${rc.I} | ${cas.I} | ${rc.II} | ${cas.II} |`);
  }
  const seccion = (titulo, xs) => {
    console.log(`\n## ${titulo} (${xs.length})\n`);
    for (const x of xs) console.log(`- ${x}`);
  };
  seccion("Nombres partidos en dos líneas", unidas);
  seccion(
    "Casamientos no literales",
    noLiterales.map(
      (n) =>
        `${n.prov} (zona ${n.zona}): «${n.cte}» → ${n.ine} «${n.nombreIne}» [${n.via}]`,
    ),
  );
  seccion("Fusiones (varias entradas → un código)", fusiones);
  seccion(
    "Territorios no municipales (sin código)",
    noMunicipales.map(
      (n) => `${n.prov} (zona ${n.zona}): «${n.cte}» — ${n.porque}`,
    ),
  );
  seccion("Sin casar", sinCasar);
  seccion("Ambiguos", ambiguos);
  seccion("Conflictos de zona", conflictos);
  console.log("\n## Por código (TSV)\n");
  if (INFORME)
    for (const [ine, v] of [...resultado.entries()].sort())
      console.log(`${ine}\t${v.zona}\t${v.prov}\t${v.cte}\t${v.nombreIne}`);
}
if (fallo) {
  console.error("\nHay entradas sin resolver: no se escribe el archivo.");
  process.exit(1);
}

// 3) Escribe el módulo.
const ordenados = [...resultado.entries()].sort((a, b) =>
  a[0].localeCompare(b[0]),
);
const porZona = (z) =>
  ordenados.filter(([, v]) => v.zona === z).map(([ine]) => ine);
const literal = (xs) => {
  const out = [];
  for (let i = 0; i < xs.length; i += 12)
    out.push(
      "  " +
        xs
          .slice(i, i + 12)
          .map((x) => `"${x}"`)
          .join(", ") +
        ",",
    );
  return out.join("\n");
};
const lista = (xs) =>
  xs.length ? xs.map((x) => `//   · ${x}`).join("\n") : "//   (ninguno)";

const ts = `// =============================================================================
// ZONA DE RADÓN POR MUNICIPIO — DB-HS6, Apéndice B, por código INE.
// Generado por script (scripts/generar-radon-hs6.mjs); NO editar a mano.
//
// POR QUÉ EXISTE: la protección frente al radón exigida (DB-HS6 ap. 2 y 3)
// depende de la ZONA del término municipal, y el Apéndice B la fija nominalmente
// en una lista. Con el municipio del expediente elegido por su código INE
// (./municipios.ts) la zona se DERIVA, en lugar de pedirla a mano.
//
// PROCEDENCIA (fuente OFICIAL):
//   Documento Básico HS «Salubridad», texto consolidado de 14 junio 2022
//   (la sección HS 6 la introdujo el RD 732/2019), Apéndice B «Clasificación de
//   municipios en función del potencial de radón», págs. ${primeraPagina}–${ultimaPagina} del PDF
//   research/pdf/DBHS.pdf. Columnas: CCAA | provincia | zona 1 | zona 2.
//   Un municipio que NO figura en la lista no tiene exigencia por zona
//   ("sin_exigencia").
//
// CÓMO SE TRANSCRIBIÓ: lectura automática del PDF con pdfjs-dist, repartiendo el
// texto en columnas por su coordenada X y asignando cada municipio al rótulo de
// provincia de su bloque (la celda combinada repite el rótulo en la primera y la
// última línea del bloque). Los nombres partidos en dos líneas se unen por el
// interlineado. Cada nombre se casó con el código INE de ./municipios.ts (INE,
// relación a 01-01-2026) DENTRO de su provincia, sin tildes ni mayúsculas; si no
// casaba, con el artículo pospuesto del INE antepuesto, por cada mitad de un
// nombre bilingüe o sin el artículo inicial; el resto, por la tabla ALIAS del
// script (cambios de denominación y fusiones), justificada caso a caso. Recuentos
// por provincia contrastados con una segunda extracción independiente (PyMuPDF)
// y con el orden alfabético de cada lista: research/verificacion-radon-hs6.md.
//
// TOTALES: entradas del PDF: zona I ${totalPdf.I}, zona II ${totalPdf.II}.
//          códigos INE:      zona I ${totalMap.I}, zona II ${totalMap.II}.
// (diferencia = territorios no municipales + fusiones, abajo). Sin casar: 0.
// Ambiguos: 0. Ningún código en las dos zonas.
//
// NOMBRES PARTIDOS EN DOS LÍNEAS EN EL PDF (${unidas.length}):
${lista(unidas)}
//
// CASAMIENTOS NO LITERALES (${noLiterales.length}): el nombre del CTE y el del INE no
// coinciden letra a letra (tildes y mayúsculas aparte):
${lista(noLiterales.map((n) => `${n.prov}, zona ${n.zona}: «${n.cte}» → ${n.ine} «${n.nombreIne}» — ${n.via}`))}
//
// FUSIONES (${fusiones.length}): varias entradas del PDF, un solo municipio INE hoy:
${lista(fusiones)}
//
// ENTRADAS SIN CÓDIGO INE (${noMunicipales.length}): territorios no municipales del Apéndice B;
// no se asignan a ningún municipio (quedan fuera de este mapa):
${lista(noMunicipales.map((n) => `${n.prov}, zona ${n.zona}: «${n.cte}» — ${n.porque}`))}
// =============================================================================

import { MUNICIPIOS_POR_PROVINCIA } from "./municipios";

/** Códigos INE de los municipios de ZONA I del Apéndice B (orden de código). */
export const RADON_ZONA_I: readonly string[] = [
${literal(porZona("I"))}
];

/** Códigos INE de los municipios de ZONA II del Apéndice B (orden de código). */
export const RADON_ZONA_II: readonly string[] = [
${literal(porZona("II"))}
];

/** Zona de radón del Apéndice B del DB-HS6 por código INE (solo los municipios listados). */
export const RADON_ZONA_POR_INE: Readonly<Record<string, "I" | "II">> = Object.freeze({
  ...Object.fromEntries(RADON_ZONA_I.map((ine) => [ine, "I" as const])),
  ...Object.fromEntries(RADON_ZONA_II.map((ine) => [ine, "II" as const])),
});

/** Cita de la fuente, para la ficha justificativa. */
export const CITA_RADON_HS6 =
  "CTE DB-HS 6, Apéndice B «Clasificación de municipios en función del potencial de radón»";

const INE_VALIDOS: ReadonlySet<string> = new Set(
  Object.values(MUNICIPIOS_POR_PROVINCIA).flatMap((l) => l.map((m) => m.ine)),
);

/**
 * Zona de radón (DB-HS6 Apéndice B) del municipio con código INE \`ine\`.
 * Municipio de la relación INE que no figura en el Apéndice B → "sin_exigencia".
 * \`null\` si no hay código o no es un municipio de la relación INE: entonces la
 * zona NO se puede derivar y hay que pedirla.
 */
export function zonaRadonDeIne(ine: string | undefined): "I" | "II" | "sin_exigencia" | null {
  if (ine === undefined || !INE_VALIDOS.has(ine)) return null;
  return RADON_ZONA_POR_INE[ine] ?? "sin_exigencia";
}
`;
writeFileSync(SALIDA, ts);
console.log(`Escrito ${SALIDA}: zona I ${totalMap.I}, zona II ${totalMap.II}.`);
