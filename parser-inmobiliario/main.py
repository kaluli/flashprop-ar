#!/usr/bin/env python3
"""CLI del scraper del Kiosco Clarín (ARQ y otras publicaciones).

Ejemplos
--------
Listar ediciones disponibles::

    python main.py issues

Ver las secciones de la última edición::

    python main.py sections

Bajar toda la sección "INDICES" de la última edición a JSON::

    python main.py scrape --section INDICES --format json --out output/indices.json

Bajar la sección INDICES de todas las ediciones en Markdown::

    python main.py scrape --section INDICES --all --format md --out output/indices.md

Una fecha concreta (formato YYYYMMDD)::

    python main.py scrape --section INDICES --date 20260901 --format json
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
from typing import List

from kiosco.client import DEFAULT_CID, KioscoClient, KioscoError
from kiosco.export import export, normalize
from kiosco.reformas import DEFAULT_APP_DIR, build_reformas_site, collect_reformas, write_app
from kiosco.site import build_site


def cmd_issues(args: argparse.Namespace) -> int:
    client = KioscoClient(cid=args.cid)
    dates = client.available_dates()
    latest = client.last_issue()
    print(f"Publicación: {args.cid}")
    print(f"Ediciones disponibles: {len(dates)}")
    print(f"Última edición: {latest}")
    for date in dates:
        print(f"  {date}")
    return 0


def cmd_sections(args: argparse.Namespace) -> int:
    client = KioscoClient(cid=args.cid)
    issue = args.issue or client.resolve_issue(args.date)
    toc = client.get_toc(issue) or {}
    sections: List[str] = []
    for page in toc.get("Pages") or []:
        name = (page.get("SectionName") or "").strip()
        if name and name not in sections:
            sections.append(name)
    print(f"Edición: {issue}")
    for name in sections:
        print(f"  {name}")
    return 0


def _issues_to_scrape(client: KioscoClient, args: argparse.Namespace) -> List[str]:
    if getattr(args, "issue", None):
        return [args.issue]
    if getattr(args, "date", None):
        return [client.resolve_issue(args.date)]
    if getattr(args, "all", False):
        dates = client.available_dates()
        issues = []
        for date in dates:
            try:
                issues.append(client.resolve_issue(date))
            except KioscoError:
                print(f"[warn] sin edición para {date}", file=sys.stderr)
        return issues
    if getattr(args, "last", None):
        dates = client.available_dates()[-args.last :]
        return [client.resolve_issue(date) for date in dates]
    return [client.last_issue()]


def _issue_date(issue: str) -> str:
    """Extrae YYYY-MM-DD del issue id (e130YYYYMMDD...)."""
    match = re.search(r"(20\d{2})(\d{2})(\d{2})", issue)
    if not match:
        return issue
    return f"{match.group(1)}-{match.group(2)}-{match.group(3)}"


def cmd_scrape(args: argparse.Namespace) -> int:
    client = KioscoClient(cid=args.cid)
    issues = _issues_to_scrape(client, args)
    if not issues:
        print("No hay ediciones para scrapear.", file=sys.stderr)
        return 1

    records = []
    for idx, issue in enumerate(issues, 1):
        try:
            articles = client.section_articles(issue, section=args.section)
        except KioscoError as exc:
            print(f"[{idx}/{len(issues)}] {issue}: omitida ({exc})", file=sys.stderr)
            continue
        for article in articles:
            records.append(normalize(article, issue, args.section))
        print(
            f"[{idx}/{len(issues)}] {issue}: {len(articles)} artículos",
            file=sys.stderr,
        )
        if idx < len(issues):
            time.sleep(args.sleep)

    print(f"Total: {len(records)} artículos", file=sys.stderr)

    if args.out:
        export(records, args.out, fmt=args.format)
        print(f"Guardado en {args.out}", file=sys.stderr)
    else:
        json.dump(records, sys.stdout, ensure_ascii=False, indent=2)
        sys.stdout.write("\n")
    return 0


def cmd_site(args: argparse.Namespace) -> int:
    client = KioscoClient(cid=args.cid)
    issues = _issues_to_scrape(client, args)
    if not issues:
        print("No hay ediciones para generar la página.", file=sys.stderr)
        return 1

    editions = []
    for idx, issue in enumerate(issues, 1):
        try:
            articles = client.section_articles(issue, section=args.section)
        except KioscoError as exc:
            print(f"[{idx}/{len(issues)}] {issue}: omitida ({exc})", file=sys.stderr)
            continue
        records = [normalize(a, issue, args.section) for a in articles]
        date = records[0]["issue_date"] if records else _issue_date(issue)
        editions.append({"issue": issue, "date": date, "articles": records})
        print(f"[{idx}/{len(issues)}] {date}: {len(records)} artículos", file=sys.stderr)
        if idx < len(issues):
            time.sleep(args.sleep)

    editions.sort(key=lambda e: e["date"], reverse=True)
    build_site(editions, args.out, title=args.title)
    print(f"Página generada en {args.out}", file=sys.stderr)
    return 0


def _resolve_app_dir(value: str | None) -> str | None:
    """Resuelve la carpeta de la app Next.js.

    - ``None`` → no se exporta a app.
    - ``"__auto__"`` (flag ``--app`` sin valor) → prueba ``../flashprop-ar`` y, si
      no existe, el directorio padre (cuando el parser vive dentro de la app).
    - cualquier otro valor → se usa tal cual.
    """
    if not value:
        return None
    if value != "__auto__":
        return value
    for candidate in (os.path.join("..", "flashprop-ar"), ".."):
        if os.path.isdir(os.path.join(candidate, "app")) and os.path.isdir(
            os.path.join(candidate, "public")
        ):
            return candidate
    return DEFAULT_APP_DIR


def cmd_reformas(args: argparse.Namespace) -> int:
    client = KioscoClient(cid=args.cid)
    issues = _issues_to_scrape(client, args)
    if not issues:
        print("No hay ediciones para procesar.", file=sys.stderr)
        return 1

    out = args.out
    cache_dir = os.path.dirname(os.path.abspath(out)) or "."
    app_dir = _resolve_app_dir(args.app)

    editions = []
    for idx, issue in enumerate(issues, 1):
        date = _issue_date(issue)
        print(f"[{idx}/{len(issues)}] {date}: OCR y parseo...", file=sys.stderr)
        edition = collect_reformas(client, issue, cache_dir, date=date)
        editions.append(edition)
        print(
            f"[{idx}/{len(issues)}] {date}: {len(edition['models'])} reformas "
            f"(páginas {edition['pages']})",
            file=sys.stderr,
        )
        if idx < len(issues):
            time.sleep(args.sleep)

    editions.sort(key=lambda e: e["date"], reverse=True)

    if app_dir:
        info = write_app(editions, app_dir)
        print(
            f"data.ts -> {info['data']}\n"
            f"imágenes ({info['images']}) -> {info['pages']}",
            file=sys.stderr,
        )
        return 0

    build_reformas_site(editions, out, title=args.title)
    print(f"Página generada en {out}", file=sys.stderr)
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Scraper del Kiosco Clarín (PressReader).",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--cid", default=DEFAULT_CID, help="ID de publicación (ARQ=e130)")
    sub = parser.add_subparsers(dest="command", required=True)

    p_issues = sub.add_parser("issues", help="Listar ediciones disponibles")
    p_issues.set_defaults(func=cmd_issues)

    p_sections = sub.add_parser("sections", help="Listar secciones de una edición")
    p_sections.add_argument("--issue", help="Issue id explícito")
    p_sections.add_argument("--date", help="Fecha YYYYMMDD")
    p_sections.set_defaults(func=cmd_sections)

    p_scrape = sub.add_parser("scrape", help="Descargar una sección")
    p_scrape.add_argument("--section", default="INDICES", help="Nombre de la sección")
    p_scrape.add_argument("--issue", help="Issue id explícito")
    p_scrape.add_argument("--date", help="Fecha YYYYMMDD")
    p_scrape.add_argument("--all", action="store_true", help="Todas las ediciones")
    p_scrape.add_argument("--last", type=int, help="Sólo las últimas N ediciones")
    p_scrape.add_argument(
        "--format", default="json", choices=["json", "md", "markdown", "csv"]
    )
    p_scrape.add_argument("--out", help="Archivo de salida (si se omite, imprime JSON)")
    p_scrape.add_argument("--sleep", type=float, default=1.0, help="Pausa entre ediciones")
    p_scrape.set_defaults(func=cmd_scrape)

    p_site = sub.add_parser("site", help="Generar página HTML con el resumen")
    p_site.add_argument("--section", default="INDICES", help="Nombre de la sección")
    p_site.add_argument("--issue", help="Issue id explícito")
    p_site.add_argument("--date", help="Fecha YYYYMMDD")
    p_site.add_argument("--all", action="store_true", help="Todas las ediciones")
    p_site.add_argument("--last", type=int, default=3, help="Últimas N ediciones (default 3)")
    p_site.add_argument("--title", default="ARQ · Índices", help="Título de la página")
    p_site.add_argument("--out", default="output/index.html", help="Archivo HTML de salida")
    p_site.add_argument("--sleep", type=float, default=1.0, help="Pausa entre ediciones")
    p_site.set_defaults(func=cmd_site)

    p_reformas = sub.add_parser(
        "reformas", help="Generar página con las fichas de reforma (OCR de ÍNDICES)"
    )
    p_reformas.add_argument("--issue", help="Issue id explícito")
    p_reformas.add_argument("--date", help="Fecha YYYYMMDD")
    p_reformas.add_argument("--all", action="store_true", help="Todas las ediciones")
    p_reformas.add_argument("--last", type=int, default=3, help="Últimas N ediciones (default 3)")
    p_reformas.add_argument("--title", default="ARQ · Reformas e Índices", help="Título")
    p_reformas.add_argument("--out", default="output/reformas.html", help="HTML de salida")
    p_reformas.add_argument(
        "--app",
        nargs="?",
        const="__auto__",
        default=None,
        metavar="DIR",
        help=(
            "Exportar a la app Next.js: escribe app/reformas/data.ts y copia las "
            "imágenes a public/reformas-pages. Sin valor autodetecta la app "
            "(../flashprop-ar o el directorio padre)."
        ),
    )
    p_reformas.add_argument("--sleep", type=float, default=1.0, help="Pausa entre ediciones")
    p_reformas.set_defaults(func=cmd_reformas)
    return parser


def main(argv: List[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return args.func(args)
    except KioscoError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        if getattr(exc, "body", None):
            print(exc.body, file=sys.stderr)
        return 1
    except KeyboardInterrupt:
        return 130


if __name__ == "__main__":
    raise SystemExit(main())
