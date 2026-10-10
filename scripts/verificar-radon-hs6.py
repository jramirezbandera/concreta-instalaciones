# Verificación INDEPENDIENTE de scripts/generar-radon-hs6.mjs (DB-HS6, Apéndice B).
# Relee la tabla con otra biblioteca (PyMuPDF, no pdfjs) y comprueba:
#   · recuento por provincia y zona;
#   · que cada cambio de provincia coincide con un reinicio del orden alfabético
#     de la columna (y lista los reinicios DENTRO de una provincia, que deben ser
#     solo de colación: apóstrofos y guiones catalanes);
#   · nombre a nombre, que las entradas coinciden con las del generador.
# Uso (requiere `pip install pymupdf`):
#   node scripts/generar-radon-hs6.mjs --informe | sed -n '/^## Por código/,$p' | tail -n +3 > radon.tsv
#   python -I scripts/verificar-radon-hs6.py research/pdf/DBHS.pdf radon.tsv salida.txt
# Las diferencias esperadas en la comparación nombre a nombre son los territorios
# no municipales y «Cotobade» (fusión): el TSV del generador va por código INE.
# Verificación independiente: PyMuPDF (otra biblioteca) + orden alfabético.
import pymupdf, sys, unicodedata, collections, csv
pdf, tsv, out = sys.argv[1], sys.argv[2], sys.argv[3]
doc = pymupdf.open(pdf)
def nrm(s):
    s = unicodedata.normalize('NFD', s)
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return s.lower()
rows = []  # (page, y, col, text)
start = None
for pi, p in enumerate(doc):
    t = p.get_text()
    if start is None and 'Nombre CCAA' in t and 'potencial' in t: start = pi
    if start is None: continue
    if 'Apéndice C' in t: break
    lines = {}
    for x0, y0, x1, y1, w, bn, ln, wn in p.get_text('words'):
        lines.setdefault((bn, ln), []).append((x0, y0, w))
    for ws in lines.values():
        x0 = min(w[0] for w in ws); y0 = ws[0][1]
        txt = ' '.join(w[2] for w in sorted(ws))
        col = 'ccaa' if 100 <= x0 < 185 else 'prov' if 185 <= x0 < 280 else 'z1' if 280 <= x0 < 390 else 'z2' if x0 >= 390 else None
        if col is None or y0 < 60 or y0 > 790: continue
        rows.append((pi + 1, y0, col, txt))
rows.sort(key=lambda r: (r[0], r[1], r[2]))
# quitar cabecera de la tabla y el texto previo
i0 = next(i for i, r in enumerate(rows) if r[3] == 'Nombre CCAA')
rows = [r for r in rows[i0:] if not r[3].startswith('Nombre ') and not r[3].startswith('Municipios ZONA')]
prov = None
seq = {'z1': [], 'z2': []}
for pg, y, col, txt in rows:
    if col == 'prov': prov = txt; continue
    if col == 'ccaa': continue
    s = seq[col]
    if s and s[-1][1] == pg and y - s[-1][2] < 7.1:
        s[-1] = (s[-1][0], pg, y, s[-1][3] + ' ' + txt); continue
    s.append((prov, pg, y, txt))
cnt = collections.OrderedDict()
o = open(out, 'w', encoding='utf-8')
for z, zn in (('z1', 'I'), ('z2', 'II')):
    s = seq[z]
    for pv, *_ in s:
        cnt.setdefault(pv, {'I': 0, 'II': 0})[zn] += 1
    # orden alfabético: cada "reinicio" debe coincidir con cambio de provincia
    for a, b in zip(s, s[1:]):
        reset = nrm(b[3]) < nrm(a[3])
        cambio = a[0] != b[0]
        if reset and not cambio:
            o.write(f'ORDEN zona {zn}: reinicio dentro de {a[0]}: «{a[3]}» → «{b[3]}» (p.{b[1]})\n')
        if cambio and not reset:
            o.write(f'AVISO zona {zn}: cambio {a[0]} → {b[0]} sin reinicio alfabético: «{a[3]}» → «{b[3]}»\n')
o.write('\nPROVINCIA\tI\tII\n')
for pv, c in cnt.items(): o.write(f'{pv}\t{c["I"]}\t{c["II"]}\n')
o.write(f'TOTAL\t{sum(c["I"] for c in cnt.values())}\t{sum(c["II"] for c in cnt.values())}\n')
# comparación nombre a nombre con la salida del generador (pdfjs)
gen = collections.Counter()
for line in open(tsv, encoding='utf-8'):
    f = line.rstrip('\n').split('\t')
    if len(f) == 5: gen[(f[1], nrm(f[3]))] += 1
mine = collections.Counter()
for z, zn in (('z1', 'I'), ('z2', 'II')):
    for pv, pg, y, txt in seq[z]: mine[(zn, nrm(txt))] += 1
o.write('\nEN PyMuPDF Y NO EN EL GENERADOR:\n')
for k in sorted(mine - gen): o.write(f'  {k}\n')
o.write('EN EL GENERADOR Y NO EN PyMuPDF:\n')
for k in sorted(gen - mine): o.write(f'  {k}\n')
