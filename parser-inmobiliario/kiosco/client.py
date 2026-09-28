"""Cliente para la API de Kiosco Clarín / PressReader.

Descubre y consume los endpoints públicos que usa la web
https://www.kiosco.clarin.com/<seccion> (por ejemplo /arq).
"""

from __future__ import annotations

import json
import os
import time
import urllib.parse
from typing import Any, Dict, Iterable, List, Optional

import requests

SITE = "https://www.kiosco.clarin.com"
SERVICES = "https://ingress.pressreader.com/services"
CDN_SERVICES = "https://s.prcdn.co/services"

DEFAULT_CID = "e130"  # ARQ (suplemento de arquitectura de Clarín)
USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)


class KioscoError(Exception):
    """Error genérico del cliente."""

    def __init__(self, message: str, status: Optional[int] = None, body: Any = None):
        super().__init__(message)
        self.status = status
        self.body = body


class KioscoClient:
    """Cliente de bajo nivel para el kiosco.

    Parameters
    ----------
    cid:
        Identificador de la publicación (ARQ = ``e130``).
    timeout:
        Timeout en segundos para cada request.
    """

    def __init__(self, cid: str = DEFAULT_CID, timeout: int = 30) -> None:
        self.cid = cid
        self.timeout = timeout
        self.session = requests.Session()
        self.session.headers.update(
            {
                "User-Agent": USER_AGENT,
                "Accept": "application/json, text/plain, */*",
                "Origin": SITE,
                "Referer": f"{SITE}/",
            }
        )
        self._token: Optional[str] = None

    # ------------------------------------------------------------------ auth
    def _new_token(self) -> str:
        """Pide un token anónimo a la web del kiosco."""
        resp = self.session.post(
            f"{SITE}/authentication/v1/initialize",
            json={
                "tickets": [],
                "language": "es-ar",
                "urlReferrer": "",
                "url": f"{SITE}/",
            },
            timeout=self.timeout,
        )
        resp.raise_for_status()
        token = resp.json().get("bearerToken")
        if not token:
            raise KioscoError("La respuesta de authentication no trajo bearerToken")
        self._token = token
        return token

    def _auth_header(self) -> Dict[str, str]:
        if not self._token:
            self._new_token()
        return {"Authorization": f"Bearer {self._token}"}

    # --------------------------------------------------------------- request
    def _request(
        self,
        url: str,
        params: Optional[Dict[str, Any]] = None,
        *,
        with_auth: bool = True,
        retries: int = 2,
    ) -> Any:
        """GET con reintento y refresco automático de token."""
        last_error: Optional[Exception] = None
        for attempt in range(retries + 1):
            headers = self._auth_header() if with_auth else {}
            try:
                resp = self.session.get(
                    url, params=params, headers=headers, timeout=self.timeout
                )
            except requests.RequestException as exc:  # pragma: no cover - red
                last_error = exc
                time.sleep(1 + attempt)
                continue

            if resp.status_code in (400, 401, 403) and with_auth and attempt < retries:
                # El token puede haber expirado: se regenera y se reintenta.
                self._token = None
                continue

            if not resp.ok:
                raise KioscoError(
                    f"HTTP {resp.status_code} en {resp.url}",
                    status=resp.status_code,
                    body=resp.text[:500],
                )

            if not resp.content:
                return None

            try:
                return resp.json()
            except ValueError as exc:
                raise KioscoError(f"Respuesta no-JSON en {resp.url}", body=resp.text[:500]) from exc

        raise KioscoError(f"No se pudo completar el request: {last_error}")

    # ------------------------------------------------------------- ediciones
    def get_calendar(self) -> Dict[str, Any]:
        """Árbol año/mes/día con las ediciones disponibles."""
        return self._request(f"{SERVICES}/calendar/get", params={"cid": self.cid})

    def available_dates(self) -> List[str]:
        """Lista de fechas ``yyyyMMdd`` con edición disponible (ascendente)."""
        data = self.get_calendar() or {}
        dates: List[str] = []
        for year, months in (data.get("Years") or {}).items():
            for month, days in months.items():
                for day in days:
                    dates.append(f"{year}{int(month):02d}{int(day):02d}")
        return sorted(dates)

    def resolve_issue(self, date: Optional[str] = None) -> str:
        """Devuelve el ``issue id`` de una fecha ``yyyyMMdd``.

        Si ``date`` es ``None`` devuelve la última edición disponible.
        """
        params: Dict[str, Any] = {"cid": self.cid}
        if date:
            params["issueDate"] = date
        data = self._request(
            f"{SERVICES}/IssueInfo/GetIssueInfoByCid", params=params
        )
        issue = (data or {}).get("Issue") or {}
        issue_id = issue.get("Issue")
        if not issue_id:
            raise KioscoError(f"No hay edición para la fecha {date!r}")
        return issue_id

    def get_issue_info(self, date: Optional[str] = None) -> Dict[str, Any]:
        params: Dict[str, Any] = {"cid": self.cid}
        if date:
            params["issueDate"] = date
        return self._request(f"{SERVICES}/IssueInfo/GetIssueInfoByCid", params=params)

    def last_issue(self) -> str:
        return self.resolve_issue(None)

    # ------------------------------------------------------------------- toc
    def get_toc(self, issue: str) -> Dict[str, Any]:
        """Índice/estructura de páginas y artículos de una edición."""
        return self._request(
            f"{CDN_SERVICES}/toc/",
            params={"issue": issue, "version": 1, "expungeVersion": ""},
            with_auth=False,
        )

    def get_layout(self, issue: str) -> Dict[str, Any]:
        return self._request(
            f"{CDN_SERVICES}/layout/",
            params={"issue": issue, "version": 1, "expungeVersion": ""},
            with_auth=False,
        )

    # -------------------------------------------------------------- articulos
    def get_articles(self, article_ids: Iterable[str]) -> List[Dict[str, Any]]:
        """Devuelve el texto completo de una lista de artículos (sin duplicados)."""
        ids = [str(i) for i in article_ids]
        if not ids:
            return []
        data = self._request(
            f"{SERVICES}/articles/GetItems",
            params={
                "comment": "LatestByAll",
                "viewType": "text",
                "articles": ",".join(ids),
                "IsHyphenated": "false",
                "options": 1,
            },
        )
        articles = (data or {}).get("Articles") or []

        # GetItems repite el mismo artículo una vez por página; se deduplica.
        unique: Dict[str, Dict[str, Any]] = {}
        for art in articles:
            aid = str(art.get("ArticleId") or art.get("Id"))
            if aid not in unique:
                unique[aid] = art
        return list(unique.values())

    # --------------------------------------------------------------- seccion
    def section_articles(
        self, issue: str, section: str = "INDICES", case_sensitive: bool = False
    ) -> List[Dict[str, Any]]:
        """Todos los artículos de una sección (por nombre) de una edición.

        El orden respeta la aparición de las páginas y se eliminan duplicados.
        """
        toc = self.get_toc(issue) or {}
        pages = toc.get("Pages") or []

        target = section if case_sensitive else section.lower()
        ordered_ids: List[str] = []
        seen: set = set()
        for page in pages:
            name = page.get("SectionName") or ""
            if not case_sensitive:
                name = name.lower()
            if name != target:
                continue
            for art in page.get("Articles") or []:
                aid = str(art["Id"])
                if aid not in seen:
                    seen.add(aid)
                    ordered_ids.append(aid)

        if not ordered_ids:
            available = sorted(
                {(p.get("SectionName") or "").strip() for p in pages if p.get("SectionName")}
            )
            raise KioscoError(
                f"La sección {section!r} no existe en {issue}. "
                f"Secciones disponibles: {', '.join(available)}"
            )

        by_id = {str(a.get("ArticleId") or a.get("Id")): a for a in self.get_articles(ordered_ids)}
        return [by_id[i] for i in ordered_ids if i in by_id]

    # --------------------------------------------------------------- paginas
    def get_sections(self, issue: str) -> List[Dict[str, Any]]:
        """Lista de secciones con su rango de páginas, en orden."""
        toc = self.get_toc(issue) or {}
        sections: List[Dict[str, Any]] = []
        for page in toc.get("Pages") or []:
            name = (page.get("SectionName") or "").strip()
            number = page.get("PageNumber")
            if not name:
                continue
            if sections and sections[-1]["name"] == name:
                sections[-1]["end"] = number
            else:
                sections.append({"name": name, "start": number, "end": number})
        return sections

    def get_page_keys(self, issue: str) -> Dict[int, str]:
        """Ticket de cada página (necesario para descargar la imagen)."""
        data = self._request(
            f"{SERVICES}/IssueInfo/GetPageKeys",
            params={"issue": issue, "pageNumber": 0, "preview": "true"},
        )
        keys = (data or {}).get("PageKeys") or []
        return {k["PageNumber"]: k["Key"] for k in keys}

    def page_image_url(self, issue: str, page: int, ticket: str, scale: int = 200) -> str:
        token = urllib.parse.quote(ticket, safe="")
        return (
            f"https://i.prcdn.co/img?file={issue}&page={page}"
            f"&scale={scale}&ticket={token}"
        )

    def download_page(
        self, issue: str, page: int, path: str, scale: int = 200, ticket: Optional[str] = None
    ) -> str:
        """Descarga la imagen de una página y devuelve el path."""
        if ticket is None:
            ticket = self.get_page_keys(issue)[page]
        url = self.page_image_url(issue, page, ticket, scale=scale)
        resp = self.session.get(
            url,
            headers={"Referer": f"{SITE}/", "User-Agent": USER_AGENT},
            timeout=self.timeout,
        )
        if not resp.ok or not resp.content:
            raise KioscoError(
                f"No se pudo descargar la página {page} ({resp.status_code})",
                status=resp.status_code,
            )
        parent = os.path.dirname(path)
        if parent:
            os.makedirs(parent, exist_ok=True)
        with open(path, "wb") as fh:
            fh.write(resp.content)
        return path

    # ----------------------------------------------------------------- utils
    @staticmethod
    def article_text(article: Dict[str, Any]) -> str:
        """Concatena los bloques de texto de un artículo."""
        parts = [
            (block.get("Text") or "").strip()
            for block in (article.get("Blocks") or [])
            if (block.get("Text") or "").strip()
        ]
        return "\n\n".join(parts)

    @staticmethod
    def article_images(article: Dict[str, Any]) -> List[Dict[str, Any]]:
        return article.get("Images") or []

    def dump_json(self, data: Any, path: str) -> None:
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False, indent=2)
