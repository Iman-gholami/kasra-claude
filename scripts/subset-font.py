#!/usr/bin/env python3
"""
Builds the single self-hosted web font used by the storefront.

Input:  the official Vazirmatn variable font (SIL OFL 1.1), e.g. from
        `npm pack vazirmatn` → package/fonts/variable/Vazirmatn[wght].ttf
Output: src/app/fonts/vazirmatn-kasra.woff2

The subset keeps Persian/Arabic letters and digits, Basic Latin, the
punctuation used in Persian typography and the OpenType features needed for
Arabic-script shaping and tabular numbers. The weight axis is limited to the
range the design uses (300–800). One preloaded file replaces the two
unicode-range subsets (~79 KB) previously required for mixed Persian text.

Usage:  pip install fonttools brotli
        python3 scripts/subset-font.py path/to/Vazirmatn[wght].ttf
"""
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

UNICODES = (
    list(range(0x0020, 0x007F))      # Basic Latin
    + [0x00A0, 0x00AB, 0x00BB, 0x00D7, 0x00F7]
    + list(range(0x060C, 0x0670))    # Arabic letters, punctuation, Arabic-Indic digits
    + list(range(0x0670, 0x06D6))    # Persian/extended letters (پ چ ژ گ ک ی …)
    + list(range(0x06F0, 0x06FA))    # Extended Arabic-Indic (Persian) digits
    + list(range(0x200C, 0x2010))    # ZWNJ, ZWJ, LRM, RLM
    + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x2066, 0x2067, 0x2068, 0x2069, 0x2212]
)
FEATURES = ["ccmp", "locl", "init", "medi", "fina", "isol", "rlig", "liga", "calt", "kern", "mark", "mkmk", "tnum", "lnum"]


def main(source: str) -> None:
    out = Path(__file__).resolve().parent.parent / "src" / "app" / "fonts" / "vazirmatn-kasra.woff2"
    font = TTFont(source)
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = FEATURES
    options.name_IDs = ["*"]
    options.name_languages = ["*"]
    options.notdef_outline = True
    options.hinting = False
    options.desubroutinize = True
    subsetter = subset.Subsetter(options)
    subsetter.populate(unicodes=UNICODES)
    subsetter.subset(font)
    # Limit the weight axis after subsetting (fewer glyph variations to keep).
    font = instancer.instantiateVariableFont(font, {"wght": (300, 800)})
    font.flavor = "woff2"
    font.save(out)
    print(f"wrote {out} ({out.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
