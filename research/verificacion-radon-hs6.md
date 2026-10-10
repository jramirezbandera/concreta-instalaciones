# Verificación — zona de radón por municipio (DB-HS6, Apéndice B)

**Fuente:** `research/pdf/DBHS.pdf`, Documento Básico HS «Salubridad», texto consolidado de **14 junio 2022**
(incluye RD 732/2019, que introdujo HS 6, y RD 450/2022). Apéndice B «Clasificación de municipios en función
del potencial de radón», **págs. 146–179** del PDF. Columnas: Nombre CCAA | Nombre PROVINCIAS | Municipios ZONA 1 | Municipios ZONA 2.

**Resultado:** `src/data/radonHS6.ts` (generado por `scripts/generar-radon-hs6.mjs`), test `src/data/test/radonHS6.test.ts`.

| | Zona I | Zona II | Total |
|---|---:|---:|---:|
| Entradas del PDF | 2403 | 1646 | 4049 |
| Códigos INE en el mapa | 2399 | 1644 | 4043 |
| Diferencia | 4 territorios no municipales | 1 territorio no municipal + 1 fusión | 6 |

Sin casar: **0**. Ambiguas: **0**. Códigos en las dos zonas: **0**.

## Método

1. **Extracción por coordenadas (pdfjs-dist).** `pdftotext -layout` desalinea los rótulos de provincia,
   así que se descartó. Cada fragmento de texto se asigna a su columna por la X (CCAA ≈106,5 pt,
   provincia ≈191,2, zona 1 ≈283,4, zona 2 ≈396,8; no hay ninguna línea de la tabla fuera de esas cuatro X).
2. **Provincia de cada municipio.** La celda combinada de CCAA/provincia repite su rótulo en la **primera y
   la última** línea del bloque de cada provincia (las de una sola línea, una vez). Cada municipio pertenece
   al último rótulo visto en orden de lectura (página ↑, y ↓). Comprobado sobre la pág. 146: Almería 271,1–433,8;
   Córdoba 441,8–597,2; Granada 605,1 → pág. 147, 123,3.
3. **Nombres partidos en dos líneas.** Se reconocen por el interlineado: 6,8 pt dentro de una celda frente a
   7,3–7,5 pt entre municipios (histograma de las ~4.000 separaciones entre líneas consecutivas de una columna: solo dos de 6,8 pt). Son exactamente:
   - Girona, zona 1: «Cruïlles, Monells i Sant Sadurní de» + «l'Heura»
   - Madrid, zona 2: «Gargantilla del Lozoya y Pinilla de» + «Buitrago»

   Ojo: «Cerdedo» y «Cotobade» (Pontevedra) van a 7,4 pt: son **dos entradas**, no un nombre partido.
   Los saltos grandes (>8 pt) son todos cambios de provincia o la otra columna con un nombre partido; no hay filas en blanco escondidas.
4. **Casamiento con el INE** (`src/data/municipios.ts`, relación a 01-01-2026), **dentro de la provincia**
   asignada, en este orden: literal sin tildes ni mayúsculas (guion = espacio) → artículo pospuesto del INE
   antepuesto → cada mitad de un nombre bilingüe → sin artículo inicial → tabla `ALIAS` del script
   (justificada caso a caso). Si queda algo sin resolver, el script falla sin escribir.

## Segunda verificación, independiente

`scripts/verificar-radon-hs6.py` relee la tabla con **PyMuPDF** (otra biblioteca, otra agrupación de líneas) y:

- **Recuento por provincia y zona:** idéntico al del generador en las 49 provincias (tabla de abajo).
  Totales 2403 / 1646.
- **Orden alfabético:** en cada columna, **todo cambio de provincia coincide con un reinicio del orden
  alfabético** (0 avisos); esto confirma las fronteras entre provincias sin depender de los rótulos. Los 12
  reinicios *dentro* de una provincia son de colación (Barcelona, Girona, Lleida, Tarragona):
  «Les Masies de Voltregà → L'Hospitalet de Llobregat», «Bellcaire d'Urgell → Bell-lloc d'Urgell»,
  «Caldes de Montbui → Caldes d'Estrac», etc. El PDF ordena ignorando apóstrofos y guiones; no hay ningún nombre fuera de sitio.
- **Nombre a nombre:** las 4049 entradas (zona y nombre) coinciden con las del generador. Las únicas diferencias son las
  esperadas: las 5 entradas sin código y «Cotobade», que se funde en un código con «Cerdedo».

Una tercera comprobación es implícita: **cada nombre casó con un municipio INE de la provincia a la que se
asignó**. Si una frontera de provincia estuviera mal puesta, los nombres desplazados no casarían.

## Recuento por provincia

«PDF» = entradas del Apéndice B (pdfjs y PyMuPDF dan lo mismo); «INE» = códigos en el mapa.

| CCAA | Provincia (rótulo PDF) | Zona I PDF | Zona I INE | Zona II PDF | Zona II INE |
|---|---|---:|---:|---:|---:|
| Andalucía | Almería | 20 | 20 | 23 | 23 |
| Andalucía | Córdoba | 11 | 11 | 22 | 22 |
| Andalucía | Granada | 30 | 30 | 23 | 23 |
| Andalucía | Huelva | 30 | 30 | 8 | 8 |
| Andalucía | Jaén | 21 | **20** | 4 | 4 |
| Andalucía | Málaga | 21 | 21 | 0 | 0 |
| Andalucía | Sevilla | 14 | 14 | 9 | 9 |
| Aragón | Huesca | 59 | 59 | 13 | 13 |
| Aragón | Teruel | 90 | 90 | 0 | 0 |
| Aragón | Zaragoza | 109 | 109 | 0 | 0 |
| Canarias | Las Palmas | 0 | 0 | 21 | 21 |
| Canarias | Santa Cruz de Tenerife | 0 | 0 | 29 | 29 |
| Cantabria | Cantabria | 50 | 50 | 1 | 1 |
| Castilla y León | Ávila | 91 | 91 | 151 | 151 |
| Castilla y León | Burgos | 101 | **100** | 0 | 0 |
| Castilla y León | León | 93 | 93 | 23 | 23 |
| Castilla y León | Palencia | 57 | 57 | 0 | 0 |
| Castilla y León | Salamanca | 127 | **126** | 233 | 233 |
| Castilla y León | Segovia | 112 | 112 | 51 | 51 |
| Castilla y León | Soria | 72 | 72 | 0 | 0 |
| Castilla y León | Valladolid | 102 | 102 | 0 | 0 |
| Castilla y León | Zamora | 164 | 164 | 63 | 63 |
| Castilla-La Mancha | Albacete | 3 | 3 | 0 | 0 |
| Castilla-La Mancha | Ciudad Real | 40 | 40 | 14 | 14 |
| Castilla-La Mancha | Cuenca | 21 | 21 | 0 | 0 |
| Castilla-La Mancha | Guadalajara | 97 | 97 | 14 | 14 |
| Castilla-La Mancha | Toledo | 53 | 53 | 99 | 99 |
| Cataluña | Barcelona | 106 | 106 | 56 | 56 |
| Cataluña | Gerona / Girona | 116 | 116 | 66 | 66 |
| Cataluña | Lérida / Lleida | 71 | 71 | 42 | 42 |
| Cataluña | Tarragona | 32 | 32 | 11 | 11 |
| Ciudad Autónoma de Ceuta | Ceuta | 0 | 0 | 1 | 1 |
| Comunidad de Madrid | Madrid | 59 | 59 | 86 | **85** |
| Comunidad Foral de Navarra | Navarra | 66 | **65** | 12 | 12 |
| Comunidad Valenciana | Castellón / Castelló | 14 | 14 | 0 | 0 |
| Comunidad Valenciana | Valencia / València | 5 | 5 | 0 | 0 |
| Extremadura | Badajoz | 57 | 57 | 86 | 86 |
| Extremadura | Cáceres | 19 | 19 | 189 | 189 |
| Galicia | La Coruña / A Coruña | 2 | 2 | 88 | 88 |
| Galicia | Lugo | 11 | 11 | 56 | 56 |
| Galicia | Orense / Ourense | 10 | 10 | 82 | 82 |
| Galicia | Pontevedra | 2 | 2 | 59 | **58** |
| Islas Baleares | Islas Baleares / Illes Balears | 25 | 25 | 0 | 0 |
| La Rioja | La Rioja | 70 | 70 | 0 | 0 |
| Murcia | Murcia | 3 | 3 | 0 | 0 |
| País Vasco | Álava / Araba | 7 | 7 | 0 | 0 |
| País Vasco | Guipúzcoa / Gipuzkoa | 70 | 70 | 0 | 0 |
| País Vasco | Vizcaya / Bizkaia | 32 | 32 | 0 | 0 |
| Principado de Asturias | Asturias | 38 | 38 | 11 | 11 |
| **Total** | | **2403** | **2399** | **1646** | **1644** |

Sin ningún municipio en la lista: Alicante, Cádiz y Melilla.

## Entradas sin código INE: 5, no asignadas

No figuran en la relación de municipios del INE. Por su denominación son territorios comunales o mancomunados
(condominios o facerías), que el mapa del CSN delimita como polígonos propios. **No se asignan a ningún municipio** porque habría que inventar la asignación.

| Provincia | Zona | Entrada del PDF |
|---|---|---|
| Jaén | I | Cuarto del Madroño |
| Burgos | I | Cabeza Alta |
| Salamanca | I | Coto Mancomunado |
| Navarra | I | Sierra de Aralar (facería) |
| Madrid | II | Los Baldios (sic, sin tilde) |

**Duda a validar:** el régimen jurídico exacto de cada uno no se ha contrastado con el IGN. Su efecto práctico es
nulo mientras el expediente se localice por municipio INE, porque ningún expediente puede caer en ellos.

## Casamientos no literales: 18

| Provincia | Zona | CTE (PDF) | INE | Denominación INE 2026 | Vía |
|---|---|---|---|---|---|
| Zaragoza | I | Jarque | 50130 | Jarque de Moncayo | cambio de denominación |
| Girona | I | Masarac | 17100 | Masarac i Vilarnadal | cambio de denominación |
| Badajoz | I | Guadiana del Caudillo | 06903 | Guadiana | cambio de denominación |
| León | II | Candín | 24036 | Valle de Ancares | cambio de denominación |
| Toledo | II | La Iglesuela | 45079 | La Iglesuela del Tiétar | cambio de denominación |
| Barcelona | II | Bigues i Riells | 08023 | Bigues i Riells del Fai | cambio de denominación |
| Girona | II | Brunyola | 17028 | Brunyola i Sant Martí Sapresa | cambio de denominación |
| Girona | II | Calonge | 17034 | Calonge i Sant Antoni | cambio de denominación |
| Girona | II | Castell-Platja d'Aro | 17048 | Castell d'Aro, Platja d'Aro i s'Agaró | cambio de denominación |
| Cáceres | II | Higuera | 10097 | Higuera de Albalat | cambio de denominación |
| Pontevedra | II | Cerdedo | 36902 | Cerdedo-Cotobade | fusión 2016 |
| Pontevedra | II | Cotobade | 36902 | Cerdedo-Cotobade | fusión 2016 |
| Baleares | I | Es Migjorn Gran | 07902 | Migjorn Gran, Es | artículo pospuesto (INE) |
| Baleares | I | ses Salines | 07059 | Salines, Ses | artículo pospuesto (INE) |
| Lleida | II | Es Bòrdes | 25057 | Bòrdes, Es | artículo pospuesto (INE) |
| Navarra | I | Atez/Atetz | 31040 | Atetz | mitad bilingüe |
| Navarra | I | Juslapeña | 31136 | Juslapeña/Txulapain | mitad bilingüe |
| Valencia | I | Sagunto/Sagunt | 46220 | Sagunt/Sagunto | mitad bilingüe |

Cada cambio de denominación se comprobó así: el nombre antiguo **no** existe en la provincia en la relación INE 2026, y
el código asignado ocupa la posición alfabética del nombre antiguo dentro de su provincia. Por ejemplo, 24036 queda
entre Camponaraya (24034) y Cármenes (24037), donde iría «Candín»; 06903 es el municipio de la serie 9xx creado al
segregarse Guadiana del Caudillo de Badajoz. En ningún caso había otro candidato en la provincia.
Cerdedo y Cotobade están **las dos en zona II**, así que la fusión no crea conflicto de zona.

Solo difieren en una tilde (casamiento literal, se anotan por transparencia): «Jerez del Marquesado» → INE «Jérez del
Marquesado» (18108), «Mendigorría» → «Mendigorria» (31167) y «Ejeme» → «Éjeme» (37118).

## Otras dudas y observaciones

- **Municipios creados después de la lista.** Hay que vigilar los municipios segregados de uno listado después de
  la lista, porque heredarían territorio con zona pero hoy darían «sin_exigencia». Revisados todos los códigos INE 9xx:
  - El único posterior a 2019 es Usansolo (48916, 2022), segregado de Galdakao, que **no** está en la lista. Sin efecto.
  - La lista ya incluye segregaciones recientes como Villanueva de Ávila (05905), Pueblonuevo de Miramontes (10905),
    Alagón del Río (10903) y Guadiana (06903).
  - **Tiétar** (10904, segregado de Talayuela en 2011; Talayuela es zona I) **no** figura en la lista. Como ya existía en 2019, su
    omisión es la del propio CTE y la lectura literal da «sin_exigencia». Merece una mirada si alguna obra cae allí.
- **Madrid capital (28079) no está en la lista** (sí Alcobendas, zona I, y Collado Villalba, zona II). Tampoco
  Sevilla, València ni Granada capitales. Comprobado a mano en el texto del PDF.
- `municipios.ts` conserva el artículo pospuesto en 6 nombres de Baleares y Lleida («Migjorn Gran, Es», «Salines, Ses»,
  «Bòrdes, Es», «Castell, Es», «Mercadal, Es», «Pobla, Sa»), en contra de lo que dice su cabecera. No afecta a este
  mapa, porque el generador los antepone al casar, pero conviene corregirlo en su generador.
- `zonaRadonDeIne` devuelve `null` solo si no hay código o este no está en la relación INE. Todo municipio INE da
  una zona: «I», «II» o «sin_exigencia».

## Spot-checks leídos a mano en el PDF (en el test)

Córdoba capital II, Níjar I, Gérgal II, Peñarroya-Pueblonuevo I, Las Tres Villas II (pág. 146); Alcobendas I,
Collado Villalba II, Oviedo I, Barcelona I, Málaga I, Ávila II, Salamanca II, Ourense II, Ceuta II; los casos no
literales Cerdedo-Cotobade II, Valle de Ancares (Candín) II, Sagunt I, Es Migjorn Gran I; y los dos nombres partidos.
Sin exigencia: Madrid, Sevilla, València, Granada y Cádiz.
