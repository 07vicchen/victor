// 維拓 AI 字幕：把字幕模組畫成透明 PNG 一格一格輸出，再用 ffmpeg 疊到影片上。
// 用法：
//   node subrender.js frames  --module flip --lines lines.json --dur 12.3 --out frames/ [--w 1080 --h 1920 --fps 30 --accent "#FF3B30"]
//   node subrender.js preview --out sheet/   （每個模組出 6 張示範圖，檢查用）
// 需要 playwright-core 和 Chromium（環境變數 CHROMIUM 指定路徑，預設 /opt/pw-browsers/chromium）
const fs = require("fs"), path = require("path");
const pw = require(process.env.PW || "playwright-core");
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : d; };
(async () => {
  const mode = process.argv[2], out = arg("out", "out");
  fs.mkdirSync(out, { recursive: true });
  const exe = process.env.CHROMIUM || "/opt/pw-browsers/chromium";
  const b = await pw.chromium.launch({ executablePath: fs.existsSync(exe) ? exe : undefined, args: ["--no-sandbox"] });
  const pg = await b.newPage();
  await pg.setContent("<!doctype html><meta charset=utf-8><body style='margin:0;background:transparent'><canvas id=c></canvas>");
  await pg.addScriptTag({ path: path.join(__dirname, "../../public/ai/subfx.js") });
  await pg.evaluate(() => document.fonts && document.fonts.ready);
  if (mode === "preview") {
    const ids = await pg.evaluate(() => SUBFX.list.map(m => m.id));
    const T = [0.55, 1.6, 2.9, 3.9, 5.1, 7.9];
    for (const id of ids) for (let k = 0; k < T.length; k++) {
      const png = await pg.evaluate(([id, t]) => { const c = document.getElementById("c"); c.width = 360; c.height = 640; const x = c.getContext("2d"); const m = SUBFX.list.find(q => q.id === id);
        x.clearRect(0, 0, 360, 640); m.draw(x, 360, 640, { t, lines: SUBFX.demo, accent: m.accent, bg: true }); return c.toDataURL("image/png"); }, [id, T[k]]);
      fs.writeFileSync(path.join(out, `${id}_${k}.png`), Buffer.from(png.split(",")[1], "base64"));
    }
    console.log("preview", ids.length, "modules");
  } else {
    const W = +arg("w", 1080), H = +arg("h", 1920), fps = +arg("fps", 30), dur = +arg("dur", 10), id = arg("module", "flip");
    const lines = JSON.parse(fs.readFileSync(arg("lines"), "utf8")), accent = arg("accent", "");
    const n = Math.ceil(dur * fps);
    for (let f = 0; f < n; f++) {
      const png = await pg.evaluate(([id, t, W, H, lines, accent]) => { const c = document.getElementById("c"); if (c.width !== W) { c.width = W; c.height = H; } const x = c.getContext("2d"); const m = SUBFX.list.find(q => q.id === id) || SUBFX.list[0];
        x.clearRect(0, 0, W, H); x.save(); m.draw(x, W, H, { t, lines, accent: accent || m.accent, bg: false }); x.restore(); return c.toDataURL("image/png"); }, [id, f / fps, W, H, lines, accent]);
      fs.writeFileSync(path.join(out, `f${String(f).padStart(5, "0")}.png`), Buffer.from(png.split(",")[1], "base64"));
    }
    console.log("frames", n);
  }
  await b.close();
})().catch(e => { console.error(e); process.exit(1); });
