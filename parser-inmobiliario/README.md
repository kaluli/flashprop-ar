# parser-inmobiliario

Extrae las **fichas de reforma** (MODELOs) de la sección **ÍNDICES** del
suplemento **ARQ** del Kiosco Clarín: costo por m², variación mensual,
superficie, descripción, total y detalle de rubros de cada proyecto.

Genera una página HTML con el resumen de cada reforma y, opcionalmente, baja
artículos de la sección como JSON/CSV/Markdown.

## Requisitos

- **macOS** (el OCR usa Apple Vision vía `swiftc` → `xcode-select --install`)
- Python 3.8+
- `requests`

```bash
pip install -r requirements.txt
```

## Uso principal: reformas

```bash
# Página HTML con las reformas de las últimas 3 ediciones (default)
python main.py reformas --last 3 --out output/reformas.html

# Sólo la última edición
python main.py reformas --last 1

# Una fecha (YYYYMMDD) o una edición puntual
python main.py reformas --date 20260901
python main.py reformas --issue e1302026090100000000001001

# Todas las ediciones (¡son ~690!)
python main.py reformas --all --out output/reformas_todas.html
```

Para **exportar a la app Next.js FlashProp en un paso** (escribe
`app/reformas/data.ts` y copia las imágenes a `public/reformas-pages/`):

```bash
# desde el parser dentro de la app
cd flashprop-ar/parser-inmobiliario
python main.py reformas --last 3 --app        # autodetecta la app (directorio padre)

# o indicando la ruta de la app
python main.py reformas --last 3 --app /ruta/a/flashprop-ar
```

`--app` sin valor autodetecta la app: usa `../flashprop-ar` si existe o, si el
parser está dentro de la app (`flashprop-ar/parser-inmobiliario`), el directorio
padre.

La página muestra, por edición, una tarjeta por MODELO con los campos, la
descripción, el/los totales y un detalle desplegable de rubros. Las imágenes de
página se guardan en `output/pages/` y el HTML queda autocontenido (referencias
relativas).

> Nota: como los MODELO se repiten mes a mes con los costos actualizados, la
> página sirve para comparar la evolución de costos entre ediciones.

### Cómo funciona el OCR

El contenido de los MODELOs **no existe como texto en la API**: sólo está en la
imagen escaneada de la página. Por eso se descarga la página y se le hace OCR
con Apple Vision. Vision omite columnas en la pasada completa, así que además se
recorta y amplía cada columna de modelo. Los resultados de OCR se cachean en
`output/pages/*.ocr.tsv` (borralos para forzar un recálculo).

## Otros comandos

```bash
# Listar ediciones disponibles
python main.py issues

# Ver las secciones de una edición
python main.py sections

# Bajar los artículos de una sección como datos
python main.py scrape --section INDICES --format json --out output/indices.json
python main.py scrape --section INDICES --last 3 --format md --out output/ultimas3.md

# Página HTML con artículos (imagen, título, copete y link)
python main.py site --last 3 --out output/index.html
```

Formatos de `scrape`: `json`, `md`/`markdown`, `csv`. Si se omite `--out`, el
JSON se imprime por stdout.

## Estructura

```
parser-inmobiliario/
├── main.py                # CLI
├── requirements.txt
└── kiosco/
    ├── __init__.py
    ├── client.py          # API (auth, toc, artículos, páginas)
    ├── ocr.py             # OCR local (Apple Vision) + recortes
    ├── _ocr.swift         # helper de OCR (se compila a kiosco/_ocr)
    ├── reformas.py        # parser de MODELOs + página HTML de reformas
    ├── export.py          # normalización/export de artículos (json/md/csv)
    └── site.py            # página HTML de artículos
```

## API descubierta (PressReader)

La web es una SPA de PressReader. El sitio es `kiosco.clarin.com` y usa:

- **Token anónimo**: `POST https://www.kiosco.clarin.com/authentication/v1/initialize`
  con `{"tickets":[],"language":"es-ar","urlReferrer":"","url":"..."}`.
  Devuelve `bearerToken`, que debe enviarse como `Authorization: Bearer <token>`
  (el prefijo `Bearer ` es obligatorio).
- **Ediciones**: `GET .../services/calendar/get?cid=e130` (árbol año/mes/día).
- **Resolver edición**: `GET .../services/IssueInfo/GetIssueInfoByCid?cid=e130&issueDate=YYYYMMDD`.
- **Índice de la edición**: `GET https://s.prcdn.co/services/toc/?issue=<id>&version=1&expungeVersion=`.
- **Tickets de página**: `GET .../services/IssueInfo/GetPageKeys?issue=<id>&pageNumber=0&preview=true`.
- **Imagen de página**: `GET https://i.prcdn.co/img?file=<id>&page=<n>&scale=200&ticket=<key>`.
- **Texto de artículos**:
  `GET .../services/articles/GetItems?comment=LatestByAll&viewType=text&articles=<ids>&IsHyphenated=false&options=1`.

`cid` de ARQ es `e130`. Para otras publicaciones se cambia con `--cid`.
