#!/usr/bin/env bash
# 只上字幕：把影片轉成直式 1080x1920，畫上字幕模組，輸出成品（不剪片、不加音效配樂）
# 用法：bash burn.sh 影片 lines.json 模組id 成品.mp4 [重點色]
# lines.json 可以用剪片室引擎 `engine.py analyze` 產生的 draft_plan.json 裡的 lines，或自己寫 [{s,e,t,hl}]
set -euo pipefail
IN="$1"; LINES="$2"; MOD="$3"; OUT="$4"; ACC="${5:-}"
DIR="$(cd "$(dirname "$0")" && pwd)"; WORK="$(mktemp -d)"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
# 直式滿版（橫的影片會模糊背景補滿）
ffmpeg -v error -y -i "$IN" -filter_complex "[0:v]split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=30:2[bg];[b]scale=1080:1920:force_original_aspect_ratio=decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,fps=30,format=yuv420p[v]" \
  -map "[v]" -map 0:a? -c:v libx264 -crf 18 -preset veryfast -c:a aac -b:a 160k "$WORK/base.mp4"
LJ="$LINES"; python3 - "$LINES" "$WORK/lines.json" <<'PY'
import json,sys
d=json.load(open(sys.argv[1])); L=d["lines"] if isinstance(d,dict) else d
json.dump([{"s":x["s"],"e":x["e"],"t":x["t"],"hl":x.get("hl",[])} for x in L],open(sys.argv[2],"w"),ensure_ascii=False)
PY
node "$DIR/subrender.js" frames --module "$MOD" --lines "$WORK/lines.json" --dur "$DUR" --out "$WORK/f" --w 1080 --h 1920 --fps 30 ${ACC:+--accent "$ACC"}
ffmpeg -v error -y -i "$WORK/base.mp4" -framerate 30 -i "$WORK/f/f%05d.png" -filter_complex "[0:v][1:v]overlay=0:0:eof_action=pass,format=yuv420p[v]" \
  -map "[v]" -map 0:a? -c:v libx264 -crf 20 -preset medium -c:a copy -movflags +faststart -shortest "$OUT"
rm -rf "$WORK"; echo "完成：$OUT"
