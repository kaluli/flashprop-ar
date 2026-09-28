"""Genera una página HTML estática con el resumen de varias ediciones."""

from __future__ import annotations

import html
import os
from typing import Any, Dict, List

CSS = """
:root { color-scheme: light; }
* { box-sizing: border-box; }
body {
  margin: 0; padding: 0 0 4rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background: #f4f5f7; color: #1c1e21; line-height: 1.5;
}
header.site {
  background: #111; color: #fff; padding: 2.2rem 1.5rem;
}
header.site h1 { margin: 0; font-size: 1.9rem; letter-spacing: .02em; }
header.site p { margin: .4rem 0 0; color: #bbb; font-size: .95rem; }
main { max-width: 1080px; margin: 0 auto; padding: 0 1.25rem; }
.edition { margin-top: 2.5rem; }
.edition > h2 {
  font-size: 1.25rem; border-bottom: 2px solid #111; padding-bottom: .4rem;
  display: flex; align-items: baseline; gap: .6rem; flex-wrap: wrap;
}
.edition > h2 .count { font-size: .85rem; font-weight: 400; color: #666; }
.grid {
  display: grid; gap: 1.25rem; margin-top: 1.25rem;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}
.card {
  background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.08); display: flex; flex-direction: column;
}
.card img {
  width: 100%; height: 190px; object-fit: cover; background: #e6e6e6; display: block;
}
.card .body { padding: 1rem 1.1rem 1.2rem; display: flex; flex-direction: column; flex: 1; }
.card .page {
  font-size: .72rem; text-transform: uppercase; letter-spacing: .08em;
  color: #b00020; font-weight: 700; margin-bottom: .35rem;
}
.card h3 { margin: 0 0 .4rem; font-size: 1.05rem; line-height: 1.3; }
.card .byline { font-size: .8rem; color: #666; margin-bottom: .5rem; }
.card p.summary { margin: 0 0 1rem; font-size: .92rem; color: #333; flex: 1; }
.card a.more {
  align-self: flex-start; text-decoration: none; color: #fff; background: #111;
  padding: .45rem .9rem; border-radius: 6px; font-size: .82rem; font-weight: 600;
}
.card a.more:hover { background: #b00020; }
footer { text-align: center; margin-top: 3rem; color: #888; font-size: .82rem; }
"""


def _esc(value: Any) -> str:
    return html.escape(str(value if value is not None else ""), quote=True)


def _card(article: Dict[str, Any]) -> str:
    images = article.get("images") or []
    thumb = images[0]["url"] if images and images[0].get("url") else ""
    img_tag = (
        f'<img loading="lazy" src="{_esc(thumb)}" alt="{_esc(article.get("title"))}">'
        if thumb
        else ""
    )
    byline = f'<div class="byline">{_esc(article["byline"])}</div>' if article.get("byline") else ""
    summary = article.get("summary") or ""
    return f"""
    <article class="card">
      {img_tag}
      <div class="body">
        <div class="page">Página {_esc(article.get("page"))}</div>
        <h3>{_esc(article.get("title"))}</h3>
        {byline}
        <p class="summary">{_esc(summary)}</p>
        <a class="more" href="{_esc(article.get("url"))}" target="_blank" rel="noopener">Leer completo</a>
      </div>
    </article>"""


def _edition(edition: Dict[str, Any]) -> str:
    articles = edition.get("articles") or []
    cards = "\n".join(_card(a) for a in articles)
    date = edition.get("date") or edition.get("issue") or ""
    return f"""
    <section class="edition">
      <h2>{_esc(date)}<span class="count">{len(articles)} artículos · sección INDICES</span></h2>
      <div class="grid">
        {cards}
      </div>
    </section>"""


def render(editions: List[Dict[str, Any]], title: str = "ARQ · Índices") -> str:
    sections = "\n".join(_edition(e) for e in editions)
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{_esc(title)}</title>
  <style>{CSS}</style>
</head>
<body>
  <header class="site">
    <h1>{_esc(title)}</h1>
    <p>Resumen de las últimas ediciones — sección INDICES</p>
  </header>
  <main>
    {sections}
    <footer>Generado con parser-inmobiliario</footer>
  </main>
</body>
</html>
"""


def build_site(editions: List[Dict[str, Any]], path: str, title: str = "ARQ · Índices") -> None:
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(render(editions, title=title))
