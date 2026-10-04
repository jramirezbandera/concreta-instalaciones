// =============================================================================
// Lo que un DXF R12 sabe escribir (feature-16 §F). Port de
// `src/lib/dxf/texto.ts` de Concreta.
//
// R12 va en cp1252: los acentos, «Ø», «²», «·» y «°» viajan intactos, pero las
// griegas y los símbolos matemáticos no existen en esa tabla. `dxfStr` mapea
// las griegas a la letra latina que la fuente Symbol dibuja como esa griega y
// los símbolos a su forma corta («≤» → «<=»). NO es `pdfStr`: en un plano manda
// la brevedad.
// =============================================================================

export function dxfStr(s: string): string {
  return (
    s
      // Griegas: la letra latina que Symbol dibuja como esa griega.
      .replace(/[γϒ]/g, "g")
      .replace(/Δ/g, "D")
      .replace(/α/g, "a")
      .replace(/σ/g, "s")
      .replace(/β/g, "b")
      .replace(/ρ/g, "r")
      .replace(/λ/g, "l")
      .replace(/φ/g, "f")
      .replace(/ψ/g, "y")
      .replace(/Ψ/g, "Y")
      .replace(/θ/g, "q")
      .replace(/ε/g, "e")
      .replace(/τ/g, "t")
      .replace(/η/g, "h")
      .replace(/ω/g, "w")
      .replace(/Ω/g, "W")
      .replace(/Σ/g, "S")
      .replace(/Φ/g, "F")
      .replace(/π/g, "p")
      .replace(/χ/g, "c")
      .replace(/δ/g, "d")
      .replace(/ν/g, "n")
      .replace(/κ/g, "k")
      .replace(/ζ/g, "z")
      .replace(/μ/g, "\xB5") // mu → signo micro, que sí está en cp1252
      // Matemáticos
      .replace(/≤/g, "<=")
      .replace(/≥/g, ">=")
      .replace(/≠/g, "!=")
      .replace(/≈/g, "~")
      .replace(/√/g, "raiz")
      .replace(/∞/g, "inf")
      .replace(/[→⇒]/g, "->")
      .replace(/[↑]/g, "")
      .replace(/⋮/g, ":")
      .replace(/−/g, "-") // signo menos (cotas «−3,00»)
      // Tipografía que cp1252 escribe distinto
      .replace(/[—–]/g, "-")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/…/g, "...")
      .replace(/[⁰¹⁴-⁹]/g, "") // ² y ³ SÍ están en cp1252 y se conservan
      .replace(/[₀-₉]/g, (d) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(d)))
      // Red de seguridad: lo que siga fuera de cp1252 se cae.
      .replace(/[Ā-￿]/g, "")
  );
}

/** cp1252 en el rango que usamos coincide con Latin-1: un carácter, un byte. */
export function aLatin1(s: string): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(new ArrayBuffer(s.length));
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i) & 0xff;
  return bytes;
}
