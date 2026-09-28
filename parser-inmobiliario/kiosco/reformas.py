"""Extrae las fichas de reforma (sección ÍNDICES) desde las imágenes de página.

El contenido de los MODELOs (costos de reforma) no está en la API como texto:
solo existe en la imagen de las páginas, por lo que se hace OCR con Apple Vision
y se reconstruyen las fichas a partir de las coordenadas de cada línea.
"""

from __future__ import annotations

import html
import json
import os
import re
import shutil
from typing import Any, Dict, List, Optional

from .client import KioscoClient
from .ocr import Line, crop_and_ocr, ocr_image

NUM_RE = re.compile(r"^\d[\d.,]*[|]?$")
MODELO_RE = re.compile(r"\s*MODELO\s+(\d+)\s*(.*)", re.I)
KNOWN_LABELS = {
    "costo por m2": "costo_m2",
    "variación mensual": "variacion_mensual",
    "superficie cubierta": "superficie_cubierta",
}


def _is_currency(text: str) -> bool:
    text = text.strip()
    return text.startswith("$") and any(ch.isdigit() for ch in text)


def _is_number(text: str) -> bool:
    return bool(NUM_RE.match(text.strip()))


def _money(text: str) -> str:
    return text.strip().rstrip("|").replace("$", "").strip()


def _join_description(parts: List[str]) -> str:
    out = ""
    for part in parts:
        part = part.strip()
        if not part:
            continue
        if out.endswith("-"):
            out = out[:-1] + part
        elif out:
            out = out + " " + part
        else:
            out = part
    out = re.sub(r"\s+", " ", out).strip()
    # El encabezado de la tabla suele colarse al final de la descripción.
    out = re.sub(r"(?:\s+(?:PRECIO|DESCRIPCI[OÓ]N))+\s*$", "", out, flags=re.I)
    return out.strip()


def extract_models(lines: List[Line]) -> List[Dict[str, Any]]:
    """Reconstruye las fichas MODELO de una página a partir de las líneas OCR."""
    headers = []
    for line in lines:
        match = MODELO_RE.match(line.text)
        if match and line.y < 0.20:
            headers.append(
                {"num": int(match.group(1)), "nombre": match.group(2).strip(), "x": line.x, "y": line.y}
            )

    # El OCR por mosaicos puede repetir el mismo encabezado: nos quedamos con el
    # nombre más completo por cada número de modelo.
    best: Dict[int, Dict[str, Any]] = {}
    for header in headers:
        current = best.get(header["num"])
        if current is None or len(header["nombre"]) > len(current["nombre"]):
            best[header["num"]] = header
    headers = [best[num] for num in sorted(best)]

    for i, model in enumerate(headers):
        model["x0"] = model["x"] - 0.03
        if i + 1 < len(headers):
            model["x1"] = headers[i + 1]["x"] - 0.006
        else:
            model["x1"] = min(1.0, model["x0"] + 0.31)

    models: List[Dict[str, Any]] = []
    for model in headers:
        col = [
            ln
            for ln in lines
            if model["x0"] <= ln.xc < model["x1"] and ln.y > model["y"]
        ]
        col.sort(key=lambda ln: (round(ln.y, 3), ln.x))

        table_y = min(
            [ln.y for ln in col if ln.text.strip().upper().startswith("DESCRIPCION")] or [1.0]
        )
        header = [ln for ln in col if ln.y < table_y]
        table = [ln for ln in col if ln.y >= table_y - 0.002]

        consumed = set()
        fields: List[Dict[str, str]] = []

        def value_below(line: Line, max_dy: float = 0.025, dx: float = 0.05) -> Optional[Line]:
            cands = [
                q
                for q in header
                if q.y > line.y and q.y - line.y < max_dy and abs(q.x - line.x) < dx
            ]
            cands.sort(key=lambda q: q.y)
            return cands[0] if cands else None

        def add_field(label: Line, value: Line) -> None:
            entry = {"label": label.text.strip(), "value": value.text.strip()}
            if entry not in fields:
                fields.append(entry)
            consumed.add(id(label))
            consumed.add(id(value))

        for line in header:
            if line.text.strip().lower() in KNOWN_LABELS:
                val = value_below(line)
                if val:
                    add_field(line, val)
        for line in header:
            if id(line) in consumed or _is_currency(line.text):
                continue
            val = value_below(line, max_dy=0.02, dx=0.03)
            if val and _is_currency(val.text) and id(val) not in consumed:
                add_field(line, val)

        description_parts = [
            ln.text.strip()
            for ln in header
            if id(ln) not in consumed and not _is_currency(ln.text)
        ]

        totals = [_money(ln.text) for ln in table if _is_currency(ln.text)]

        nums = [ln for ln in table if _is_number(ln.text)]
        items: List[Dict[str, str]] = []
        for line in table:
            text = line.text.strip()
            upper = text.upper()
            if _is_number(text) or upper in {"TOTAL", "PRECIO"} or _is_currency(text):
                continue
            if upper.startswith("DESCRIPCION") or upper.startswith("DESCRIPCIÓN"):
                continue
            cands = [
                n
                for n in nums
                if abs(n.y - line.y) < 0.007 and n.x > line.x and n.x < line.x + 0.13
            ]
            if cands:
                price = sorted(cands, key=lambda n: n.x)[0]
                item = {"rubro": text, "precio": _money(price.text)}
                if item not in items:
                    items.append(item)

        models.append(
            {
                "num": model["num"],
                "nombre": model["nombre"],
                "fields": fields,
                "descripcion": _join_description(description_parts),
                "totales": totals,
                "items": items,
            }
        )
    return models


def extract_models_from_toc(toc: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Fallback: los MODELOs suelen figurar como artículos sin metadata; no aplica."""
    return []


def _ocr_cached(img_path: str) -> List[Line]:
    """OCR de página completa con caché en un .tsv junto a la imagen."""
    cache = img_path + ".ocr.tsv"
    if os.path.exists(cache):
        return _load_tsv(cache)
    lines = ocr_image(img_path)
    _save_tsv(cache, lines)
    return lines


def _crop_ocr_cached(
    img_path: str, dst: str, x0: float, y0: float, x1: float, y1: float
) -> List[Line]:
    """OCR de una región (columna de un modelo) con caché."""
    cache = dst + ".ocr.tsv"
    if os.path.exists(cache):
        return _load_tsv(cache)
    lines = crop_and_ocr(img_path, dst, x0, y0, x1, y1)
    _save_tsv(cache, lines)
    return lines


def _load_tsv(path: str) -> List[Line]:
    lines: List[Line] = []
    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            parts = raw.rstrip("\n").split("\t")
            if len(parts) < 5:
                continue
            try:
                x, y, w, h = (float(v) for v in parts[:4])
            except ValueError:
                continue
            lines.append(Line(x, y, w, h, parts[4]))
    lines.sort(key=lambda ln: (round(ln.y, 3), ln.x))
    return lines


def _save_tsv(path: str, lines: List[Line]) -> None:
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        for ln in lines:
            fh.write(f"{ln.x:.4f}\t{ln.y:.4f}\t{ln.w:.4f}\t{ln.h:.4f}\t{ln.text}\n")


def _model_headers(lines: List[Line]) -> List[Dict[str, Any]]:
    """Encabezados MODELO n de una página, sin duplicados y ordenados por x."""
    found: Dict[int, Dict[str, Any]] = {}
    for line in lines:
        match = MODELO_RE.match(line.text)
        if not match or line.y >= 0.20:
            continue
        num = int(match.group(1))
        name = match.group(2).strip()
        current = found.get(num)
        if current is None or len(name) > len(current["nombre"]):
            found[num] = {"num": num, "nombre": name, "x": line.x, "y": line.y}
    return sorted(found.values(), key=lambda h: h["x"])


def find_indices_start(client: KioscoClient, issue: str) -> Optional[int]:
    for section in client.get_sections(issue):
        if section["name"].strip().upper() == "INDICES":
            return section["start"]
    return None


def collect_reformas(
    client: KioscoClient,
    issue: str,
    cache_dir: str,
    date: str = "",
    scales: int = 200,
) -> Dict[str, Any]:
    """Descarga, hace OCR y parsea las fichas MODELO de una edición."""
    start = find_indices_start(client, issue)
    if start is None:
        return {"issue": issue, "date": date, "models": [], "pages": []}

    candidate_pages = [start - 1, start]
    keys = client.get_page_keys(issue)
    models: List[Dict[str, Any]] = []
    used_pages: List[int] = []

    for page in candidate_pages:
        if page not in keys:
            continue
        img_path = os.path.join(cache_dir, "pages", f"{issue}_p{page}.jpg")
        if not os.path.exists(img_path):
            client.download_page(issue, page, img_path, scale=scales, ticket=keys[page])

        page_lines = _ocr_cached(img_path)
        headers = _model_headers(page_lines)
        if not headers:
            continue
        used_pages.append(page)

        for i, header in enumerate(headers):
            x0 = max(0.0, header["x"] - 0.04)
            x1 = headers[i + 1]["x"] - 0.005 if i + 1 < len(headers) else min(1.0, header["x"] + 0.30)
            y0 = max(0.0, header["y"] - 0.012)
            y1 = min(1.0, header["y"] + 0.355)

            crop_path = os.path.join(
                cache_dir, "pages", f"{issue}_p{page}_m{header['num']}.png"
            )
            crop_lines = _crop_ocr_cached(img_path, crop_path, x0, y0, x1, y1)
            # Las coordenadas del recorte son relativas: se llevan a coordenadas
            # de página para que los umbrales del parser sigan siendo válidos.
            dx, dy = x1 - x0, y1 - y0
            mapped = [
                Line(x0 + ln.x * dx, y0 + ln.y * dy, ln.w * dx, ln.h * dy, ln.text)
                for ln in crop_lines
            ]
            parsed = extract_models(mapped)
            model = next((m for m in parsed if m["num"] == header["num"]), None)
            if model is None and parsed:
                model = parsed[0]
            if model is None:
                continue
            model["page"] = page
            model["imagen"] = img_path
            models.append(model)

    models.sort(key=lambda m: m["num"])
    return {"issue": issue, "date": date, "models": models, "pages": used_pages}


# --------------------------------------------------------------------- HTML
_CSS = """
:root { color-scheme: light; }
* { box-sizing: border-box; }
body { margin:0; padding:0 0 4rem; background:#f4f5f7; color:#1c1e21;
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif; line-height:1.5; }
header.site { background:#111; color:#fff; padding:2.2rem 1.5rem; }
header.site h1 { margin:0; font-size:1.9rem; }
header.site p { margin:.4rem 0 0; color:#bbb; }
main { max-width:1180px; margin:0 auto; padding:0 1.25rem; }
.edition { margin-top:2.5rem; }
.edition > h2 { font-size:1.25rem; border-bottom:2px solid #111; padding-bottom:.4rem;
  display:flex; align-items:baseline; gap:.6rem; flex-wrap:wrap; }
.edition > h2 .count { font-size:.85rem; font-weight:400; color:#666; }
.grid { display:grid; gap:1.25rem; margin-top:1.25rem; grid-template-columns:repeat(auto-fill,minmax(330px,1fr)); }
.card { background:#fff; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.08);
  padding:1.2rem 1.25rem; display:flex; flex-direction:column; }
.card .modelo { font-size:.72rem; text-transform:uppercase; letter-spacing:.08em; color:#b00020; font-weight:700; }
.card h3 { margin:.2rem 0 .6rem; font-size:1.15rem; }
.fields { display:grid; grid-template-columns:auto 1fr; gap:.15rem .6rem; font-size:.9rem; margin-bottom:.7rem; }
.fields dt { color:#666; }
.fields dd { margin:0; font-weight:600; }
.desc { font-size:.92rem; color:#333; margin:0 0 .8rem; }
.total { font-size:1rem; margin:.2rem 0 .6rem; }
.total strong { font-size:1.15rem; }
details { margin-top:auto; }
details summary { cursor:pointer; font-size:.85rem; font-weight:600; color:#b00020; }
table.items { width:100%; border-collapse:collapse; margin-top:.5rem; font-size:.82rem; }
table.items td { padding:.15rem .3rem; border-bottom:1px solid #eee; }
table.items td:last-child { text-align:right; font-variant-numeric:tabular-nums; }
.page-link { display:inline-block; margin-top:.6rem; font-size:.78rem; color:#555; }
footer { text-align:center; margin-top:3rem; color:#888; font-size:.82rem; }
"""


def _esc(value: Any) -> str:
    return html.escape(str(value if value is not None else ""), quote=True)


def _model_card(model: Dict[str, Any], rel_image: str = "") -> str:
    fields = "".join(
        f"<dt>{_esc(f['label'])}</dt><dd>{_esc(f['value'])}</dd>" for f in model.get("fields", [])
    )
    totals = model.get("totales") or []
    total_html = ""
    if totals:
        total_html = "<p class='total'>Total: " + " · ".join(f"<strong>$ {_esc(t)}</strong>" for t in totals) + "</p>"
    items = model.get("items") or []
    detail = ""
    if items:
        rows = "".join(
            f"<tr><td>{_esc(i['rubro'])}</td><td>{_esc(i['precio'])}</td></tr>" for i in items
        )
        detail = (
            f"<details><summary>Detalle de rubros ({len(items)})</summary>"
            f"<table class='items'>{rows}</table></details>"
        )
    page_link = (
        f"<a class='page-link' href='{_esc(rel_image)}' target='_blank'>Ver página {_esc(model.get('page'))}</a>"
        if rel_image
        else ""
    )
    return f"""
    <article class="card">
      <div class="modelo">MODELO {_esc(model['num'])}</div>
      <h3>{_esc(model['nombre'])}</h3>
      <dl class="fields">{fields}</dl>
      <p class="desc">{_esc(model.get('descripcion'))}</p>
      {total_html}
      {detail}
      {page_link}
    </article>"""


def _edition_section(edition: Dict[str, Any], rel_dir: str) -> str:
    models = edition.get("models") or []
    cards = []
    for model in models:
        rel_image = ""
        img = model.get("imagen")
        if img:
            rel_image = f"{rel_dir}/{os.path.basename(img)}"
        cards.append(_model_card(model, rel_image))
    date = edition.get("date") or edition.get("issue") or ""
    return f"""
    <section class="edition">
      <h2>{_esc(date)}<span class="count">{len(models)} reformas · MODELOs</span></h2>
      <div class="grid">{''.join(cards)}</div>
    </section>"""


def render_reformas(editions: List[Dict[str, Any]], title: str = "ARQ · Reformas e Índices") -> str:
    sections = "".join(_edition_section(e, "pages") for e in editions)
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{_esc(title)}</title>
  <style>{_CSS}</style>
</head>
<body>
  <header class="site">
    <h1>{_esc(title)}</h1>
    <p>Fichas de reforma de la sección ÍNDICES (costos, superficies y detalle de rubros)</p>
  </header>
  <main>{sections}
    <footer>Generado con parser-inmobiliario · datos extraídos por OCR de las páginas escaneadas</footer>
  </main>
</body>
</html>
"""


def build_reformas_site(editions: List[Dict[str, Any]], path: str, title: str = "ARQ · Reformas e Índices") -> None:
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(render_reformas(editions, title=title))


# --------------------------------------------------------------- Next.js app
DEFAULT_APP_DIR = os.path.join("..", "flashprop-ar")

_DATA_TS_HEADER = """// Generado automáticamente por parser-inmobiliario (reformas).
// No editar a mano: volver a exportar con el comando `reformas --app`.

export type ReformaField = { label: string; value: string }
export type ReformaItem = { rubro: string; precio: string }

export type Reforma = {
  num: number
  nombre: string
  fields: ReformaField[]
  descripcion: string
  totales: string[]
  items: ReformaItem[]
  page: number
}

export type ReformaEdition = {
  date: string
  issue: string
  models: Reforma[]
}

export const reformasData: ReformaEdition[] = """


def render_data_ts(editions: List[Dict[str, Any]]) -> str:
    """Serializa las ediciones como módulo TypeScript para la app Next.js."""
    data = []
    for edition in editions:
        models = [
            {
                "num": model["num"],
                "nombre": model["nombre"],
                "fields": model.get("fields", []),
                "descripcion": model.get("descripcion", ""),
                "totales": model.get("totales", []),
                "items": model.get("items", []),
                "page": model.get("page"),
            }
            for model in edition.get("models", [])
        ]
        data.append({"date": edition.get("date", ""), "issue": edition.get("issue", ""), "models": models})
    return _DATA_TS_HEADER + json.dumps(data, ensure_ascii=False, indent=2) + "\n"


def write_app(
    editions: List[Dict[str, Any]],
    app_dir: str,
    pages_subdir: str = "reformas-pages",
) -> Dict[str, Any]:
    """Escribe ``app/reformas/data.ts`` y copia las imágenes a ``public/<pages_subdir>``.

    Devuelve un resumen con las rutas usadas y cuántas imágenes se copiaron.
    """
    app_dir = os.path.abspath(app_dir)
    data_path = os.path.join(app_dir, "app", "reformas", "data.ts")
    pages_dir = os.path.join(app_dir, "public", pages_subdir)
    os.makedirs(os.path.dirname(data_path), exist_ok=True)
    os.makedirs(pages_dir, exist_ok=True)

    copied = 0
    seen = set()
    for edition in editions:
        for model in edition.get("models", []):
            image = model.get("imagen")
            if not image or not os.path.exists(image):
                continue
            dest = os.path.join(pages_dir, os.path.basename(image))
            if dest in seen:
                continue
            seen.add(dest)
            if not os.path.exists(dest) or os.path.getmtime(image) > os.path.getmtime(dest):
                shutil.copy2(image, dest)
            copied += 1

    with open(data_path, "w", encoding="utf-8") as fh:
        fh.write(render_data_ts(editions))

    return {"data": data_path, "pages": pages_dir, "images": copied}

