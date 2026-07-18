#!/usr/bin/env python3
"""Regenerate the raster assets for the Filey ERP website.

Outputs (into public/):
  - mascot.png   800x800 transparent — flat ink-blue ledger/folder character
  - og-cover.png 1200x630 — social share card (ink bg, ledger grid, headline)

Requires: pip install pillow
Fonts: falls back to PIL's default bitmap font if DejaVu is unavailable.
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
import random

INK_950 = (7, 11, 17, 255)
INK_800 = (20, 32, 47, 255)
INK_700 = (30, 44, 64, 255)
MINT = (52, 211, 153, 255)
MINT_DARK = (16, 185, 129, 255)
AMBER = (251, 191, 36, 255)
FG = (232, 238, 244, 255)
FAINT = (90, 107, 128, 255)

OUT = os.path.join(os.path.dirname(__file__), "..", "public")


def font(size, bold=True):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def ledger_grid(draw, w, h, minor=64, major=320):
    for x in range(0, w, minor):
        draw.line([(x, 0), (x, h)], fill=(148, 163, 184, 12))
    for y in range(0, h, minor):
        draw.line([(0, y), (w, y)], fill=(148, 163, 184, 12))
    for x in range(0, w, major):
        draw.line([(x, 0), (x, h)], fill=(148, 163, 184, 18))
    for y in range(0, h, major):
        draw.line([(0, y), (w, y)], fill=(148, 163, 184, 18))


def mascot(path):
    """Flat ledger-book character: ink body, mint ledger lines, amber pencil, waving arm."""
    S = 800
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # body — rounded book
    d.rounded_rectangle([230, 200, 570, 640], radius=48, fill=INK_800, outline=MINT, width=10)
    # spine
    d.rounded_rectangle([230, 200, 290, 640], radius=48, fill=INK_700)
    d.rectangle([270, 200, 290, 640], fill=INK_700)
    # mint ledger lines
    for y in (300, 370, 440):
        d.rounded_rectangle([330, y, 520, y + 18], radius=9, fill=MINT)
    d.rounded_rectangle([330, 510, 460, 528], radius=9, fill=MINT_DARK)
    # face
    d.ellipse([370, 555, 395, 580], fill=FG)      # left eye
    d.ellipse([455, 555, 480, 580], fill=FG)      # right eye
    d.ellipse([377, 562, 388, 573], fill=INK_950)
    d.ellipse([462, 562, 473, 573], fill=INK_950)
    d.arc([400, 575, 450, 610], start=20, end=160, fill=FG, width=6)  # smile
    # legs + shoes
    d.rectangle([320, 640, 350, 690], fill=INK_800)
    d.rectangle([450, 640, 480, 690], fill=INK_800)
    d.rounded_rectangle([300, 685, 360, 715], radius=14, fill=MINT_DARK)
    d.rounded_rectangle([440, 685, 500, 715], radius=14, fill=MINT_DARK)
    # waving arm (right side)
    d.line([(570, 380), (650, 300)], fill=INK_800, width=34)
    d.ellipse([630, 260, 690, 320], fill=INK_800)  # hand
    for (x1, y1, x2, y2) in [(660, 255, 660, 210), (685, 265, 710, 225), (640, 255, 620, 215)]:
        d.line([(x1, y1), (x2, y2)], fill=INK_800, width=14)
    # left arm down
    d.line([(230, 400), (170, 470)], fill=INK_800, width=34)
    d.ellipse([145, 450, 200, 505], fill=INK_800)
    # amber pencil tucked behind top
    d.polygon([(520, 195), (600, 115), (620, 135), (540, 215)], fill=AMBER)
    d.polygon([(600, 115), (628, 95), (620, 135)], fill=FG)
    d.polygon([(618, 105), (628, 95), (624, 118)], fill=INK_950)
    # subtle grain
    rnd = random.Random(7)
    for _ in range(2600):
        x, y = rnd.randrange(S), rnd.randrange(S)
        r, g, b, a = img.getpixel((x, y))
        if a > 0:
            d.point((x, y), fill=(r, g, b, max(0, a - 18)))
    img.save(path)


def og_cover(path):
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), INK_950)
    d = ImageDraw.Draw(img)
    ledger_grid(d, W, H)

    # mint glow behind window
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([700, 80, 1180, 560], fill=(52, 211, 153, 34))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img)

    # logo mark (rounded square + ledger lines)
    d.rounded_rectangle([64, 56, 112, 104], radius=10, outline=MINT, width=4)
    for y in (70, 80, 90):
        d.line([(74, y), (102, y)], fill=MINT, width=3)
    d.text((128, 66), "Filey ERP", font=font(30), fill=FG)

    # headline
    d.text((64, 190), "Your business.", font=font(72), fill=FG)
    d.text((64, 280), "Your data.", font=font(72), fill=MINT)
    d.text((64, 370), "Your rules.", font=font(72), fill=FG)

    # caption
    d.text((64, 500), "Free & open-source ERP + CRM — v2.2.1", font=font(26, bold=False), fill=FAINT)
    d.text((64, 545), "Offline-first · AGPL-3.0 · Tauri + React", font=font(22, bold=False), fill=FAINT)

    # small app-window mock
    d.rounded_rectangle([800, 170, 1120, 470], radius=18, fill=INK_800, outline=INK_700, width=2)
    d.rounded_rectangle([800, 170, 1120, 205], radius=18, fill=INK_700)
    d.rectangle([800, 190, 1120, 205], fill=INK_700)
    for i, c in enumerate(((251, 113, 133, 255), AMBER, MINT)):
        d.ellipse([816 + i * 20, 182, 828 + i * 20, 194], fill=c)
    # KPI cards
    for i in range(3):
        x0 = 816 + i * 100
        d.rounded_rectangle([x0, 220, x0 + 88, 275], radius=8, fill=INK_950)
        d.rectangle([x0 + 10, 232, x0 + 50, 240], fill=MINT)
        d.rectangle([x0 + 10, 248, x0 + 70, 258], fill=INK_700)
    # chart
    pts = [(816, 420), (856, 400), (896, 410), (936, 380), (976, 390), (1016, 360), (1056, 370), (1096, 340)]
    d.line(pts, fill=MINT, width=4, joint="curve")
    d.line([(816, 440), (1096, 440)], fill=INK_700, width=1)
    img.convert("RGB").save(path)


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    mascot(os.path.join(OUT, "mascot.png"))
    og_cover(os.path.join(OUT, "og-cover.png"))
    print("wrote", os.path.join(OUT, "mascot.png"), "and", os.path.join(OUT, "og-cover.png"))
