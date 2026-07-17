#!/usr/bin/env bash
# Regenerate Android launcher icons from assets/icon.png into every mipmap-* density.
# Builds adaptive icon layers:
#   - ic_launcher_background  : solid backgroundColor (#E6F4FE) from app.json
#   - ic_launcher_foreground  : source icon padded so subject fits the 66dp safe zone
#   - ic_launcher_monochrome  : silhouette of source (themed icon, Android 13+)
#   - ic_launcher / _round    : full-bleed source (legacy launcher)
# Removes stale ic_launcher*.webp defaults so the new PNGs win at AAPT time.
#
# Usage:
#   bash scripts/generate_launcher_icons.sh                  # generate from assets/icon.png
#   bash scripts/generate_launcher_icons.sh path/to/icon.png # generate from custom source
#
# Run from the project root.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${1:-$ROOT/assets/icon.png}"
RES="$ROOT/android/app/src/main/res"
BG_COLOR="E6F4FE"   # must match expo.android.adaptiveIcon.backgroundColor in app.json

# Pick a Python interpreter with Pillow installed.
PY=""
for candidate in "$ROOT/.venv/bin/python3" python3; do
  if command -v "$candidate" >/dev/null 2>&1 && "$candidate" -c "import PIL" 2>/dev/null; then
    PY="$candidate"; break
  fi
done
if [ -z "$PY" ]; then
  echo "No Python with Pillow found. Install: pip install Pillow" >&2
  exit 1
fi

declare -a FOLDERS=("mipmap-mdpi" "mipmap-hdpi" "mipmap-xhdpi" "mipmap-xxhdpi" "mipmap-xxxhdpi")
declare -a SIZES=(48 72 96 144 192)

if [ ! -f "$SRC" ]; then
  echo "source not found: $SRC" >&2
  exit 1
fi

if ! command -v sips >/dev/null 2>&1; then
  echo "sips not found (macOS only)." >&2
  exit 1
fi

# Compose layers at 1024px (Expo/Android reference). Subject fits inside 768px
# (~75%) so it stays inside the launcher's 66dp safe zone once masked.
FG_SIZE=1024
FG_INNER=$((FG_SIZE * 75 / 100))   # 768

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "source: $SRC"
echo "python: $PY"

# 1. Solid background canvas at FG_SIZE.
$PY - "$BG_COLOR" "$FG_SIZE" "$TMP/bg.png" <<'PY'
import sys
from PIL import Image
hexc, size, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
r, g, b = int(hexc[0:2],16), int(hexc[2:4],16), int(hexc[4:6],16)
Image.new("RGB", (size, size), (r, g, b)).save(out, "PNG")
PY

# 2. Padded foreground: subject centered with transparent borders.
sips -z "$FG_INNER" "$FG_INNER" "$SRC" --out "$TMP/fg_inner.png" >/dev/null
$PY - "$TMP/fg_inner.png" "$TMP/fg.png" "$FG_SIZE" <<'PY'
import sys
from PIL import Image
src, out, size = sys.argv[1], sys.argv[2], int(sys.argv[3])
inner = Image.open(src).convert("RGBA")
canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
canvas.paste(inner, ((size - inner.width)//2, (size - inner.height)//2), inner)
canvas.save(out, "PNG")
PY

# 3. Monochrome silhouette: hard white-on-transparent mask for themed icon.
sips -s format png -z "$FG_SIZE" "$FG_SIZE" "$SRC" --out "$TMP/mono_src.png" >/dev/null
$PY - "$TMP/mono_src.png" "$TMP/mono.png" "$FG_INNER" "$FG_SIZE" <<'PY'
import sys
from PIL import Image, ImageOps
src, out, inner, size = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
img = Image.open(src).convert("L")
img = ImageOps.autocontrast(img, cutoff=8)
img.thumbnail((inner, inner), Image.LANCZOS)
mask = img.point(lambda v: 255 if v > 128 else 0, "L")
mask = mask.convert("RGBA")
# Tinted white silhouette: RGB=white, A=mask. Android tints it with the system
# accent on themed icon backgrounds.
white = Image.new("RGBA", mask.size, (255, 255, 255, 0))
white.putalpha(mask.split()[2] if mask.mode == "RGBA" else mask)
canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
canvas.paste(white, ((size - mask.width)//2, (size - mask.height)//2), white)
canvas.save(out, "PNG")
PY

# 4. Write every layer to every density bucket.
for i in "${!FOLDERS[@]}"; do
  dir="${FOLDERS[$i]}"
  size="${SIZES[$i]}"
  mkdir -p "$RES/$dir"

  sips -z "$size" "$size" "$SRC"              --out "$RES/$dir/ic_launcher.png"            >/dev/null
  sips -z "$size" "$size" "$SRC"              --out "$RES/$dir/ic_launcher_round.png"       >/dev/null
  sips -z "$size" "$size" "$TMP/fg.png"       --out "$RES/$dir/ic_launcher_foreground.png"  >/dev/null
  sips -z "$size" "$size" "$TMP/bg.png"       --out "$RES/$dir/ic_launcher_background.png"  >/dev/null
  sips -z "$size" "$size" "$TMP/mono.png"     --out "$RES/$dir/ic_launcher_monochrome.png"  >/dev/null

  echo "  wrote $dir/*"
done

removed=$(find "$RES" -name 'ic_launcher*.webp' -print -delete | wc -l | tr -d ' ')
[ "$removed" -gt 0 ] && echo "removed $removed stale ic_launcher*.webp file(s)"

echo "done"
