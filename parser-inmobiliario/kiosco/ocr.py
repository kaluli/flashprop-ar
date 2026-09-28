"""OCR local de imágenes usando Apple Vision (macOS).

Compila un pequeño helper en Swift la primera vez y lo cachea.
"""

from __future__ import annotations

import os
import shutil
import subprocess
from dataclasses import dataclass
from typing import List

HERE = os.path.dirname(os.path.abspath(__file__))
SWIFT_SRC = os.path.join(HERE, "_ocr.swift")
BIN = os.path.join(HERE, "_ocr")


class OCRError(Exception):
    pass


@dataclass
class Line:
    x: float
    y: float
    w: float
    h: float
    text: str

    @property
    def xc(self) -> float:
        return self.x + self.w / 2


def _ensure_binary() -> str:
    if os.path.exists(BIN) and os.path.getmtime(BIN) >= os.path.getmtime(SWIFT_SRC):
        return BIN
    if not shutil.which("swiftc"):
        raise OCRError(
            "Se necesita swiftc (Xcode Command Line Tools) para el OCR. "
            "Instalalo con: xcode-select --install"
        )
    result = subprocess.run(
        ["swiftc", "-O", SWIFT_SRC, "-o", BIN],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise OCRError(f"No se pudo compilar el OCR:\n{result.stderr}")
    return BIN


def ocr_image(path: str) -> List[Line]:
    """Devuelve las líneas detectadas en la imagen, ordenadas por (y, x)."""
    binary = _ensure_binary()
    result = subprocess.run([binary, path], capture_output=True, text=True)
    if result.returncode != 0:
        raise OCRError(f"OCR falló: {result.stderr.strip()}")

    lines: List[Line] = []
    for raw in result.stdout.splitlines():
        parts = raw.split("\t")
        if len(parts) < 5:
            continue
        try:
            x, y, w, h = (float(v) for v in parts[:4])
        except ValueError:
            continue
        lines.append(Line(x, y, w, h, parts[4]))
    return lines


def image_size(path: str):
    out = subprocess.run(
        ["sips", "-g", "pixelWidth", "-g", "pixelHeight", path],
        capture_output=True,
        text=True,
    ).stdout
    width = height = 0
    for line in out.splitlines():
        if "pixelWidth" in line:
            width = int(line.split(":")[1])
        elif "pixelHeight" in line:
            height = int(line.split(":")[1])
    return width, height


def crop_region(
    src: str, dst: str, left: int, top: int, width: int, height: int, scale: int = 2
) -> None:
    """Recorta una región y la amplía ``scale`` veces como PNG."""
    tmp = dst + ".crop.png"
    subprocess.run(
        ["sips", "-s", "format", "png", "-c", str(height), str(width),
         "--cropOffset", str(top), str(left), src, "--out", tmp],
        capture_output=True,
    )
    subprocess.run(
        ["sips", "-z", str(height * scale), str(width * scale), tmp, "--out", dst],
        capture_output=True,
    )
    if os.path.exists(tmp):
        os.remove(tmp)


def crop_and_ocr(
    src: str,
    dst: str,
    x0f: float,
    y0f: float,
    x1f: float,
    y1f: float,
    scale: int = 3,
) -> List[Line]:
    """Recorta una región (coords. normalizadas), la amplía y le hace OCR.

    Útil para recuperar columnas que Vision omite en la pasada completa.
    """
    width, height = image_size(src)
    left = int(max(0.0, x0f) * width)
    top = int(max(0.0, y0f) * height)
    cw = int((min(1.0, x1f) - max(0.0, x0f)) * width)
    ch = int((min(1.0, y1f) - max(0.0, y0f)) * height)
    crop_region(src, dst, left, top, cw, ch, scale=scale)
    return ocr_image(dst)

