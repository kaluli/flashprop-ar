"""Normalización y exportación de los artículos scrapeados."""

from __future__ import annotations

import csv
import json
import os
from typing import Any, Dict, List

from .client import SITE, KioscoClient


def _format_date(raw: Any) -> str:
    """Convierte 20260901 o 2026-09-01T00:00:00 a 2026-09-01."""
    if not raw:
        return ""
    text = str(raw)
    if "T" in text:
        return text.split("T", 1)[0]
    digits = "".join(ch for ch in text if ch.isdigit())
    if len(digits) >= 8:
        return f"{digits[0:4]}-{digits[4:6]}-{digits[6:8]}"
    return text


def summarize(text: str, max_chars: int = 320) -> str:
    """Devuelve un resumen: el primer párrafo, recortado a ``max_chars``."""
    if not text:
        return ""
    paragraph = text.strip().split("\n", 1)[0].strip()
    if len(paragraph) <= max_chars:
        return paragraph
    cut = paragraph[:max_chars].rsplit(" ", 1)[0]
    return cut.rstrip(",;:") + "…"


def normalize(article: Dict[str, Any], issue: str, section: str) -> Dict[str, Any]:
    """Convierte la respuesta cruda de la API en un registro plano."""
    issue_info = article.get("Issue") or {}
    text = KioscoClient.article_text(article)
    images = [
        {"title": img.get("Title") or "", "url": img.get("Url") or ""}
        for img in (article.get("Images") or [])
    ]
    return {
        "issue": issue,
        "issue_date": _format_date(issue_info.get("Date")),
        "publication": issue_info.get("Title") or "",
        "cid": issue_info.get("CID") or "",
        "section": article.get("Section") or section,
        "page": article.get("Page"),
        "article_id": str(article.get("ArticleId") or article.get("Id") or ""),
        "title": article.get("Title") or article.get("HyphenatedTitle") or "",
        "subtitle": article.get("Subtitle") or "",
        "byline": article.get("Byline") or "",
        "summary": article.get("Subtitle") or summarize(text),
        "text": text,
        "images": images,
        "url": (
            f"{SITE}/{issue}/{article.get('ArticleId') or article.get('Id')}/textview"
        ),
    }


def to_json(records: List[Dict[str, Any]], path: str) -> None:
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(records, fh, ensure_ascii=False, indent=2)


def to_csv(records: List[Dict[str, Any]], path: str) -> None:
    fields = [
        "issue_date",
        "issue",
        "section",
        "page",
        "title",
        "subtitle",
        "byline",
        "article_id",
        "text",
        "url",
    ]
    with open(path, "w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=fields, extrasaction="ignore")
        writer.writeheader()
        for record in records:
            writer.writerow(record)


def to_markdown(records: List[Dict[str, Any]], path: str) -> None:
    lines: List[str] = []
    for record in records:
        lines.append(f"## {record['title']}")
        meta = []
        if record["subtitle"]:
            meta.append(f"*{record['subtitle']}*")
        if record["byline"]:
            meta.append(record["byline"])
        meta.append(f"Página {record['page']} · {record['section']}")
        if record["issue_date"]:
            meta.append(record["issue_date"])
        lines.append("  \n".join(meta))
        lines.append("")
        lines.append(record["text"])
        for img in record["images"]:
            if img["url"]:
                caption = f" — {img['title']}" if img["title"] else ""
                lines.append(f"\n![{img['title']}]({img['url']}){caption}")
        lines.append("\n---\n")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write("\n".join(lines))


EXPORTERS = {"json": to_json, "csv": to_csv, "md": to_markdown, "markdown": to_markdown}


def export(records: List[Dict[str, Any]], path: str, fmt: str = "json") -> None:
    if fmt not in EXPORTERS:
        raise ValueError(f"Formato no soportado: {fmt}. Usar: {', '.join(EXPORTERS)}")
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    EXPORTERS[fmt](records, path)
