"""Generate splash assets for Cikaret Setra Pay.

Produces:
  assets/splash-logo.png            1080x1080, transparent bg, water-drop logo
  assets/splash-fullscreen.png      1080x1920, native splash (matches expo plugin)
"""
import math
import os
from PIL import Image, ImageDraw, ImageFont

ASSETS = os.path.join(os.path.dirname(__file__), "..", "assets")

PRIMARY = (31, 158, 199)        # #1f9ec7
PRIMARY_LIGHT = (77, 192, 219)  # #4dc0db
PRIMARY_DARK = (15, 107, 133)   # #0f6b85
TEXT_DARK = (22, 59, 74)        # #163b4a


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def vertical_gradient(size, top, bottom):
    w, h = size
    img = Image.new("RGB", (w, h), top)
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(h - 1, 1)
        col = lerp(top, bottom, t)
        draw.line([(0, y), (w, y)], fill=col)
    return img


def draw_water_drop(size, out_path):
    scale = 4
    s = size * scale
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    cx = s / 2
    cy = s / 2
    drop_w = s * 0.55
    drop_h = s * 0.78
    rx = drop_w / 2
    bulb_cy = cy + s * 0.16
    top_y = cy - drop_h / 2

    pts = []
    for i in range(0, 81):
        t = i / 80.0
        ctrl_x = cx + rx * 1.05
        ctrl_y = (top_y + bulb_cy) / 2 + s * 0.04
        x = (1 - t) ** 2 * cx + 2 * (1 - t) * t * ctrl_x + t * t * (cx + rx)
        y = (1 - t) ** 2 * top_y + 2 * (1 - t) * t * ctrl_y + t * t * bulb_cy
        pts.append((x, y))
    for i in range(1, 181):
        a = math.radians(i)
        x = cx + rx * math.cos(a)
        y = bulb_cy + rx * math.sin(a) * 0.95
        pts.append((x, y))
    for i in range(0, 81):
        t = i / 80.0
        ctrl_x = cx - rx * 1.05
        ctrl_y = (top_y + bulb_cy) / 2 + s * 0.04
        x = (1 - t) ** 2 * (cx - rx) + 2 * (1 - t) * t * ctrl_x + t * t * cx
        y = (1 - t) ** 2 * bulb_cy + 2 * (1 - t) * t * ctrl_y + t * t * top_y
        pts.append((x, y))

    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    min_x, max_x = int(min(xs)), int(max(xs))
    min_y, max_y = int(min(ys)), int(max(ys))

    band_h = 2
    for y in range(min_y, max_y + 1, band_h):
        t = (y - min_y) / max(max_y - min_y, 1)
        if t < 0.55:
            col = lerp(PRIMARY_LIGHT, PRIMARY_DARK, t / 0.55)
        else:
            col = lerp(PRIMARY_DARK, (12, 90, 115), (t - 0.55) / 0.45)
        rgba = (col[0], col[1], col[2], 255)
        row_xs = []
        n = len(pts)
        for i in range(n):
            x1, y1 = pts[i]
            x2, y2 = pts[(i + 1) % n]
            if (y1 <= y < y2) or (y2 <= y < y1):
                if y2 != y1:
                    xi = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
                    row_xs.append(xi)
        if not row_xs:
            continue
        row_xs.sort()
        for i in range(0, len(row_xs) - 1, 2):
            x_start = max(int(row_xs[i]), min_x)
            x_end = min(int(row_xs[i + 1]) + 1, max_x)
            if x_end > x_start:
                draw.line([(x_start, y), (x_end, y)], fill=rgba)
                if y + 1 <= max_y:
                    draw.line([(x_start, y + 1), (x_end, y + 1)], fill=rgba)

    draw.polygon(pts, outline=(PRIMARY_DARK[0], PRIMARY_DARK[1], PRIMARY_DARK[2], 230))

    hl_w = rx * 0.55
    hl_h = rx * 0.85
    hl_cx = cx - rx * 0.32
    hl_cy = bulb_cy - rx * 0.25
    highlight = Image.new("RGBA", (int(hl_w * 2.2), int(hl_h * 2.2)), (0, 0, 0, 0))
    hdraw = ImageDraw.Draw(highlight)
    hdraw.ellipse(
        [hl_w * 0.2, hl_h * 0.2, hl_w * 1.6, hl_h * 1.6],
        fill=(255, 255, 255, 180),
    )
    highlight = highlight.rotate(-22, resample=Image.BICUBIC)
    img.alpha_composite(
        highlight,
        (int(hl_cx - highlight.width / 2), int(hl_cy - highlight.height / 2)),
    )

    sparkle_r = max(2, int(s * 0.012))
    draw.ellipse(
        [cx + rx * 0.05 - sparkle_r, top_y + s * 0.18 - sparkle_r,
         cx + rx * 0.05 + sparkle_r, top_y + s * 0.18 + sparkle_r],
        fill=(255, 255, 255, 235),
    )

    img = img.resize((size, size), Image.LANCZOS)
    img.save(out_path, "PNG", optimize=True)
    print(f"wrote {out_path}")


def find_font(size_px):
    candidates = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]
    for p in candidates:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size_px)
            except Exception:
                continue
    return ImageFont.load_default()


def draw_splash_fullscreen(out_path):
    W, H = 1080, 1920
    bg_top = (217, 240, 250)
    bg_bottom = (169, 220, 240)
    img = vertical_gradient((W, H), bg_top, bg_bottom).convert("RGBA")

    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for y in range(H // 3):
        t = y / (H / 3)
        alpha = int(70 * (1 - t))
        od.line([(0, y), (W, y)], fill=(255, 255, 255, alpha))
    img.alpha_composite(overlay)

    bg_decor = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(bg_decor)
    decor = [
        (130, 260, 90, (255, 255, 255, 38)),
        (940, 180, 60, (255, 255, 255, 32)),
        (980, 980, 120, (255, 255, 255, 30)),
        (90, 1500, 80, (255, 255, 255, 28)),
        (980, 1700, 50, (255, 255, 255, 32)),
    ]
    for (x, y, r, c) in decor:
        bd.ellipse([x - r, y - r, x + r, y + r], fill=c)
    img.alpha_composite(bg_decor)

    logo_size = 620
    logo = Image.open(os.path.join(ASSETS, "splash-logo.png")).convert("RGBA")
    logo = logo.resize((logo_size, logo_size), Image.LANCZOS)
    logo_x = (W - logo_size) // 2
    logo_y = int(H * 0.30) - logo_size // 2
    img.alpha_composite(logo, (logo_x, logo_y))

    title_size = 92
    title_font = find_font(title_size)
    title = "Cikaret Setra"
    td = ImageDraw.Draw(img)
    bbox = td.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (W - tw) // 2
    ty = logo_y + logo_size + 70
    td.text((tx + 2, ty + 4), title, fill=(15, 107, 133, 90), font=title_font)
    td.text((tx, ty), title, fill=TEXT_DARK + (255,), font=title_font)

    sub_font = find_font(40)
    sub = "Pembayaran Air Bersih"
    sb = td.textbbox((0, 0), sub, font=sub_font)
    sw = sb[2] - sb[0]
    sx = (W - sw) // 2
    sy = ty + th + 36
    td.text((sx, sy), sub, fill=(95, 125, 138, 255), font=sub_font)

    img.convert("RGB").save(out_path, "PNG", optimize=True)
    print(f"wrote {out_path}")


def main():
    os.makedirs(ASSETS, exist_ok=True)
    logo_path = os.path.join(ASSETS, "splash-logo.png")
    splash_path = os.path.join(ASSETS, "splash-fullscreen.png")
    draw_water_drop(1080, logo_path)
    draw_splash_fullscreen(splash_path)


if __name__ == "__main__":
    main()
