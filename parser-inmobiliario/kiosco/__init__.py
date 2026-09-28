"""Scraper del Kiosco Clarín (PressReader)."""

import warnings

# El urllib3 del sistema avisa por LibreSSL al importarse; se silencia antes
# de importar requests para que el aviso no ensucie la salida del CLI.
warnings.filterwarnings("ignore", message=".*OpenSSL.*")

from .client import DEFAULT_CID, KioscoClient, KioscoError

__all__ = ["KioscoClient", "KioscoError", "DEFAULT_CID"]
