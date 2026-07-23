#!/usr/bin/env python3
"""Build deterministic, palette-limited assets for Bagel Quest."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "pixel"
INK = "#251a32"
CREAM = "#fff0c2"
GOLD = "#e8a33c"
GOLD_HI = "#ffd46b"
GOLD_DARK = "#9b552f"
RED = "#c8465c"
RED_DARK = "#792d47"
SILVER = "#9aa0a8"
SILVER_HI = "#e5e0d4"
SILVER_DARK = "#55596b"
PINK = "#dc557f"
PURPLE = "#8d4ca0"
BROWN = "#94512e"
BROWN_HI = "#d18a42"


def story_assets():
    for i in range(1, 6):
        source = ASSETS / f"story-{i}-source.png"
        if not source.exists():
            continue
        image = Image.open(source).convert("RGB")
        fitted = ImageOps.fit(image, (320, 180), method=Image.Resampling.NEAREST)
        pal = fitted.quantize(colors=96, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
        pal.save(ASSETS / f"story-{i}.png", optimize=True)


def px(draw, box, fill, outline=None, width=1):
    draw.rectangle(box, fill=fill, outline=outline, width=width)


def cat_frame(frame, state):
    im = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    bob = (0, 1, 0, -1)[frame % 4] if state == "idle" else 0
    run = (-1, 0, 1, 0, -1, 1)[frame % 6] if state == "run" else 0
    y = 5 + bob
    # cape and legs
    d.polygon([(7, y+11), (2, y+24), (10, y+21), (13, y+10)], fill=RED_DARK)
    px(d, (4, y+17, 7, y+20), RED)
    leg_a = 9 + run
    leg_b = 19 - run
    px(d, (leg_a, y+23, leg_a+4, y+28), GOLD, INK)
    px(d, (leg_b, y+23, leg_b+4, y+28), GOLD, INK)
    # bagel body
    d.ellipse((5, y+5, 27, y+27), fill=GOLD, outline=INK, width=2)
    d.ellipse((12, y+12, 20, y+20), fill=GOLD_DARK, outline=INK, width=1)
    d.arc((7, y+7, 25, y+25), 18, 162, fill=GOLD_HI, width=1)
    px(d, (8, y+8, 11, y+11), GOLD_HI)
    px(d, (22, y+9, 24, y+11), GOLD_HI)
    for sx, sy in ((14, 8), (19, 7), (9, 17), (23, 17)):
        px(d, (sx, y+sy, sx+1, y+sy), CREAM)
    # helmet + plume
    px(d, (6, y+3, 25, y+9), SILVER, INK)
    px(d, (9, y+1, 22, y+4), SILVER_HI, INK)
    px(d, (7, y+8, 10, y+14), SILVER_DARK, INK)
    px(d, (23, y+8, 26, y+14), SILVER_DARK, INK)
    d.polygon([(10, y+1), (12, y-4), (19, y-5), (24, y-1), (22, y+1)], fill=RED, outline=INK)
    # face
    px(d, (10, y+11, 12, y+13), INK)
    px(d, (22, y+11, 24, y+13), INK)
    px(d, (15, y+22, 19, y+23), INK)
    px(d, (14, y+10, 20, y+11), GOLD_DARK)
    # buckler
    d.ellipse((2, y+14, 12, y+24), fill=SILVER, outline=INK, width=1)
    d.ellipse((5, y+17, 9, y+21), fill=GOLD, outline=INK)
    px(d, (3, y+16, 4, y+21), SILVER_HI)
    # sling / shooting arm
    arm_y = y + (12 if state != "shoot" else 10 - (frame % 2))
    px(d, (24, arm_y, 30, arm_y+3), GOLD, INK)
    px(d, (29, arm_y-2, 31, arm_y+5), BROWN, INK)
    px(d, (30, arm_y-1, 31, arm_y+3), CREAM)
    if state == "hurt":
        px(d, (9, y+11, 12, y+12), CREAM)
        px(d, (21, y+11, 24, y+12), CREAM)
    if state == "jump":
        px(d, (8, y+25, 12, y+27), GOLD, INK)
        px(d, (20, y+23, 24, y+25), GOLD, INK)
    return im


def donut_frame(kind, frame):
    size = 48 if kind == "king" else 32
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    boss = kind == "king"
    officer = kind == "sprinkles"
    y = (7 if boss else 6) + (frame % 2)
    r = 17 if boss else 11
    cx = size // 2
    color = PURPLE if boss else (PINK if kind != "archer" else "#e7903b")
    # cape, feet, donut
    if boss or officer:
        d.polygon([(cx-r, y+9), (cx-r-5, y+r+14), (cx+2, y+r+9)], fill=RED_DARK)
    px(d, (cx-r+2, y+r+5, cx-r+7, y+r+10), BROWN_HI, INK)
    px(d, (cx+r-7, y+r+5, cx+r-2, y+r+10), BROWN_HI, INK)
    d.ellipse((cx-r, y, cx+r, y+2*r), fill=color, outline=INK, width=2)
    hole = 6 if boss else 4
    d.ellipse((cx-hole, y+r-hole, cx+hole, y+r+hole), fill=GOLD_DARK, outline=INK)
    # frosting shine, drips, and readable sprinkles
    d.arc((cx-r+2, y+2, cx+r-2, y+2*r-2), 195, 330, fill="#f39abe" if not boss else "#c97bd1", width=2)
    for ox, oy, sprinkle in ((-8, 7, CREAM), (5, 5, GOLD_HI), (8, 13, "#71b7a0"), (-10, 16, "#e9a845")):
        if abs(ox) < r-2:
            px(d, (cx+ox, y+oy, cx+ox+1, y+oy+1), sprinkle)
    px(d, (cx-r+3, y+r+5, cx-r+5, y+r+9), color, INK)
    # helmet
    px(d, (cx-r+2, y-3, cx+r-2, y+4), SILVER, INK)
    px(d, (cx-r+5, y-5, cx+r-6, y-2), SILVER_HI, INK)
    px(d, (cx-r+3, y+3, cx-r+6, y+9), SILVER_DARK, INK)
    px(d, (cx+r-6, y+3, cx+r-3, y+9), SILVER_DARK, INK)
    plume_w = 13 if boss else 9
    d.polygon([(cx-4, y-5), (cx-2, y-10), (cx+plume_w, y-9), (cx+plume_w+3, y-4)], fill=RED, outline=INK)
    # face
    px(d, (cx-r+5, y+r-4, cx-r+7, y+r-2), CREAM)
    px(d, (cx+r-7, y+r-4, cx+r-5, y+r-2), CREAM)
    px(d, (cx-r+6, y+r-3, cx-r+7, y+r-2), INK)
    px(d, (cx+r-7, y+r-3, cx+r-6, y+r-2), INK)
    # equipment
    if kind in ("scout", "archer"):
        px(d, (cx+r-1, y+4, cx+r+1, y+2*r+6), BROWN, INK)
        d.polygon([(cx+r-3, y+4), (cx+r, y-2), (cx+r+3, y+4)], fill=SILVER_HI, outline=INK)
        px(d, (cx+r, y+8, cx+r+1, y+14), SILVER_HI)
    if kind in ("roller", "sprinkles", "king"):
        shield_r = 7 if not boss else 10
        d.ellipse((cx-r-5, y+r-shield_r, cx-r-5+2*shield_r, y+r+shield_r), fill=SILVER, outline=INK, width=1)
        d.ellipse((cx-r-1, y+r-3, cx-r+5, y+r+3), fill=GOLD, outline=INK)
    return im


def pretzel_frame(frame, happy=False):
    im = Image.new("RGBA", (24, 24), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    y = frame % 2
    # chunky pretzel loop
    d.line([(4, 7+y), (2, 11+y), (4, 16+y), (8, 17+y), (12, 12+y), (16, 17+y), (20, 16+y), (22, 11+y), (20, 7+y), (17, 5+y), (12, 10+y), (7, 5+y), (4, 7+y)], fill=INK, width=5, joint="curve")
    d.line([(4, 7+y), (2, 11+y), (4, 16+y), (8, 17+y), (12, 12+y), (16, 17+y), (20, 16+y), (22, 11+y), (20, 7+y), (17, 5+y), (12, 10+y), (7, 5+y), (4, 7+y)], fill=BROWN_HI, width=3, joint="curve")
    px(d, (7, 9+y, 9, 11+y), CREAM)
    px(d, (16, 9+y, 18, 11+y), CREAM)
    px(d, (8, 10+y, 9, 11+y), INK)
    px(d, (16, 10+y, 17, 11+y), INK)
    if happy:
        px(d, (10, 16+y, 14, 17+y), CREAM)
    else:
        px(d, (10, 16+y, 14, 17+y), INK)
    return im


def build_atlas():
    atlas = Image.new("RGBA", (768, 192), (0, 0, 0, 0))
    manifest = {}
    x = 0
    rows = {"cat": 0, "enemy": 48, "boss": 96, "object": 144}

    def add(key, image, row, cell=32):
        nonlocal x
        if x + cell > atlas.width:
            raise RuntimeError("atlas row overflow")
        atlas.alpha_composite(image, (x, row))
        manifest[key] = [x, row, image.width, image.height]
        x += cell

    x = 0
    for state, count in (("idle",4),("run",6),("jump",2),("shoot",4),("hurt",2),("victory",4)):
        for f in range(count):
            add(f"cat.{state}.{f}", cat_frame(f, state), rows["cat"])

    x = 0
    for kind in ("scout","archer","roller","sprinkles"):
        for f in range(4):
            add(f"{kind}.walk.{f}", donut_frame(kind, f), rows["enemy"])

    x = 0
    for f in range(4):
        image = donut_frame("king", f)
        add(f"king.walk.{f}", image, rows["boss"], 48)

    x = 0
    for happy in (False, True):
        for f in range(4):
            add(f"pretzel.{'happy' if happy else 'worried'}.{f}", pretzel_frame(f, happy), rows["object"])

    atlas.save(ASSETS / "sprites.png", optimize=True)
    atlas.crop((0, 0, 32, 32)).save(ASSETS / "favicon.png", optimize=True)
    lines = ["// Generated by scripts/build-pixel-assets.py", "const SPRITE_FRAMES = {"]
    for key, box in manifest.items():
        lines.append(f"  '{key}': [{','.join(map(str, box))}],")
    lines.append("};\n")
    (ASSETS / "sprite-frames.js").write_text("\n".join(lines))


def tile(fill, top, detail):
    im = Image.new("RGBA", (16, 16), fill)
    d = ImageDraw.Draw(im)
    px(d, (0, 0, 15, 3), top)
    px(d, (2, 7, 5, 9), detail)
    px(d, (10, 12, 13, 14), detail)
    return im


def build_tiles():
    out = Image.new("RGBA", (64, 16), (0,0,0,0))
    out.alpha_composite(tile("#54845f", "#c98842", "#406849"), (0,0))
    out.alpha_composite(tile("#7b465e", "#d89b43", "#55354f"), (16,0))
    out.alpha_composite(tile("#4a385b", "#b96c61", "#382b4c"), (32,0))
    spike = Image.new("RGBA", (16,16), (0,0,0,0)); d=ImageDraw.Draw(spike)
    d.polygon([(0,16),(5,2),(10,16)], fill="#cb5169", outline=INK)
    d.polygon([(7,16),(12,4),(16,16)], fill="#e68b7e", outline=INK)
    out.alpha_composite(spike,(48,0))
    out.save(ASSETS / "tiles.png", optimize=True)


if __name__ == "__main__":
    ASSETS.mkdir(parents=True, exist_ok=True)
    story_assets()
    build_atlas()
    build_tiles()
    print("Built story panels, sprite atlas, frame manifest, and tiles.")
