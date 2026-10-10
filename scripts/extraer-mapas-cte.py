# =============================================================================
# Extrae los MAPAS normativos del CTE a public/mapas/ (WebP) para el visor de
# Datos de la obra. Son las figuras de las que el proyectista lee una zona que
# el DB solo da en mapa (no por municipio):
#
#   hs1-fig2-4   DB-HS1 figura 2.4  zonas pluviométricas de promedios (I-V)
#   hs1-fig2-5   DB-HS1 figura 2.5  zonas eólicas (A, B, C)
#   hs5-figB-1   DB-HS5 figura B.1  isoyetas y zonas pluviométricas (A, B)
#   sua8-fig1-1  DB-SUA figura 1.1  densidad de impactos sobre el terreno Ng
#
# Fuente: los PDF oficiales de research/pdf/. Las figuras 2.4, B.1 y 1.1 son
# vectoriales: se rasterizan a alta resolución recortando el marco del mapa.
# Uso (desde la raíz del repo; requiere PyMuPDF y Pillow con WebP):
#
#   python -I scripts/extraer-mapas-cte.py
# =============================================================================

import io
import pathlib

import pymupdf
from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parent.parent
SALIDA = RAIZ / "public" / "mapas"

# (pdf, página 1-based, nombre, recorte en puntos PDF (x0, y0, x1, y1), dpi, calidad WebP)
TRABAJOS = [
    ("DBHS.pdf", 19, "hs1-fig2-4", (95, 131, 500, 405), 220, 90),
    ("DBHS.pdf", 20, "hs1-fig2-5", (85, 68, 556, 382), 220, 80),
    # En el PDF la figura B.1 mide ~10 cm: hace falta mucha resolución.
    ("DBHS.pdf", 136, "hs5-figB-1", (30, 459, 138, 532), 1100, 90),
    ("DBSUA.pdf", 28, "sua8-fig1-1", (84, 395, 568, 687), 220, 90),
]


def main() -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    for pdf, pagina, nombre, recorte, dpi, calidad in TRABAJOS:
        pg = pymupdf.open(RAIZ / "research" / "pdf" / pdf)[pagina - 1]
        pix = pg.get_pixmap(dpi=dpi, clip=pymupdf.Rect(*recorte))
        img = Image.open(io.BytesIO(pix.tobytes("png")))
        destino = SALIDA / f"{nombre}.webp"
        img.save(destino, "WEBP", quality=calidad)
        print(f"{nombre}: {img.width}x{img.height}, {destino.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
