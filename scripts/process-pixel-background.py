#!/usr/bin/env python3
"""Turn a generated 16:9 scene into a compact, crisp gameplay plate."""
import argparse
from pathlib import Path

from PIL import Image, ImageEnhance, ImageOps


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    image = Image.open(args.source).convert("RGB")
    image = ImageOps.fit(image, (960, 540), method=Image.Resampling.NEAREST)
    image = ImageEnhance.Contrast(image).enhance(1.08)
    image = ImageEnhance.Color(image).enhance(0.92)
    image = image.quantize(colors=128, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    image.save(args.output, optimize=True)


if __name__ == "__main__":
    main()
