/* 維拓 AI 字幕模組庫：網頁預覽跟成品輸出用同一份程式，畫出來的樣子一模一樣。
   SUBFX.list[i].draw(ctx, W, H, st)
   st = { t: 秒, lines: [{s, e, t: "用|切塊的字", hl: ["重點詞"]}], accent: "#FF3B30", bg: false(透明) }
*/
(function (root) {
  "use strict";
  var SANS = '"Noto Sans TC","Noto Sans CJK TC","PingFang TC","Microsoft JhengHei",sans-serif';
  var SERIF = '"Noto Serif TC","Noto Serif CJK TC","PMingLiU",serif';
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function eo(x) { x = clamp(x, 0, 1); return 1 - Math.pow(1 - x, 3); }
  function eb(x) { x = clamp(x, 0, 1); var c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  function bounce(x) { x = clamp(x, 0, 1); var n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + .75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + .9375; return n * (x -= 2.625 / d) * x + .984375; }
  function plain(L) { return L.t.replace(/\|/g, ""); }
  function parts(L) { var p = L.t.split("|").filter(Boolean); return p.length > 1 ? p : chunk(L); }
  function chunk(L) { var t = plain(L), out = [], hl = (L.hl || []).filter(function (h) { return h && t.indexOf(h) >= 0; }), i = 0;
    while (i < t.length) { var h = hl.filter(function (x) { return t.indexOf(x, i) === i; })[0]; if (h) { out.push(h); i += h.length; continue; }
      var j = i; while (j < t.length && j - i < 3 && !hl.some(function (x) { return t.indexOf(x, j) === j; })) j++; out.push(t.slice(i, j)); i = j; }
    // 標點黏在前一塊，不要自己一塊
    var o2 = []; out.forEach(function (p) { if (o2.length && /^[，。！？、；：,.!?;:…～~]+$/.test(p)) o2[o2.length - 1] += p; else if (o2.length && /^[，。！？、；：,.!?;:…～~]/.test(p)) { var m = p.match(/^[，。！？、；：,.!?;:…～~]+/)[0]; o2[o2.length - 1] += m; if (p.slice(m.length)) o2.push(p.slice(m.length)); } else o2.push(p); });
    return o2; }
  function marks(L) { var t = plain(L), m = []; for (var i = 0; i < t.length; i++) m.push(0);
    (L.hl || []).forEach(function (h) { var p = h ? t.indexOf(h) : -1; while (p >= 0) { for (var k = p; k < p + h.length; k++) m[k] = 1; p = t.indexOf(h, p + h.length); } }); return m; }
  function isHL(L, s) { return (L.hl || []).some(function (h) { return h && s.indexOf(h) >= 0; }); }
  function cur(st) { var L = st.lines, t = st.t; for (var i = 0; i < L.length; i++) if (t >= L[i].s && t < L[i].e) return i;
    for (var k = L.length - 1; k >= 0; k--) if (t >= L[k].e && t - L[k].e < .35) return k; return -1; }
  function prog(L, t) { return clamp((t - L.s) / Math.max(.2, L.e - L.s), 0, 1); }
  var SIZE = 0.9; // 字幕大小：小 0.75／中 0.9／大 1.1
  function font(ctx, w, px, fam, txt, frac) { px = px * SIZE; ctx.font = w + " " + Math.round(px) + "px " + (fam || SANS); if (txt) { var mw = ctx.canvas.width * (frac || .88); while (ctx.measureText(txt).width > mw && px > 10) { px *= .93; ctx.font = w + " " + Math.round(px) + "px " + (fam || SANS); } } return px; }
  function wrap(ctx, text, maxW) { var out = [], line = ""; for (var i = 0; i < text.length; i++) { var c = text[i]; if (ctx.measureText(line + c).width > maxW && line) { out.push(line); line = c; } else line += c; } if (line) out.push(line); return out; }
  // 一行字逐字上色（重點字用 accent）
  function colorRun(ctx, L, x, y, base, acc, opt) { opt = opt || {}; var t = plain(L), m = marks(L), w = ctx.measureText(t).width, cx = opt.align === "left" ? x : x - w / 2, upto = opt.upto == null ? t.length : opt.upto;
    for (var i = 0; i < t.length; i++) { var c = t[i], cw = ctx.measureText(c).width; if (i < upto) {
        if (opt.stroke) { ctx.lineWidth = opt.stroke; ctx.strokeStyle = opt.strokeColor || "#000"; ctx.lineJoin = "round"; ctx.strokeText(c, cx, y); }
        ctx.fillStyle = m[i] ? acc : base; ctx.fillText(c, cx, y); } cx += cw; } return w; }
  function rrect(ctx, x, y, w, h, r) { r = Math.min(r, h / 2, w / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function bgFill(ctx, W, H, st, col) { if (st.bg) { ctx.fillStyle = col || "#0c0c0c"; ctx.fillRect(0, 0, W, H); } }
  function dark(st) { return st.bg ? "#ffffff" : "#ffffff"; }

  var M = [];
  function add(id, name, fit, desc, draw, opt) { M.push(Object.assign({ id: id, name: name, fit: fit, desc: desc, draw: draw, accent: "#FF3B30" }, opt || {})); }

  // 01 翻轉大字（剪映翻轉大字那種：一塊一塊大字疊上來、撐滿寬度，重點字換色，疊滿整組轉 90 度翻走）
  add("flip", "翻轉大字", "口播、教學、觀點", "大字一塊一塊疊上來、撐滿畫面寬度，重點字換色，疊滿整組翻轉帶走，節奏感很強。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return;
    var first = i - (i % 2), x0 = 48 * u, maxW = W - x0 * 2, acc = st.accent, rows = [];
    for (var k = first; k <= i; k++) { var L = st.lines[k], ps = parts(L), d = (L.e - L.s) / ps.length;
      ps.forEach(function (p, j) { var at = L.s + j * d; if (st.t >= at) rows.push({ t: p, at: at, hl: isHL(L, p), alt: j % 2 === 1 }); }); }
    var nx = st.lines[first + 2], out = nx ? clamp((st.t - (nx.s - .28)) / .28, 0, 1) : 0, tot = 0;
    rows.forEach(function (r) { var px = Math.min(170 * u, 400 * u); ctx.font = "900 " + px + "px " + SANS; px = Math.min(170 * u, px * maxW / Math.max(1, ctx.measureText(r.t).width)); r.px = px * SIZE; tot += px * 1.04; });
    var sc = tot > H * .62 ? H * .62 / tot : 1, y = H * .46 - tot * sc / 2;
    ctx.save(); if (out > 0) { ctx.translate(x0, H * .5); ctx.rotate(-Math.PI / 2 * eo(out)); ctx.globalAlpha = 1 - out * .9; ctx.translate(-x0, -H * .5); }
    ctx.textBaseline = "top";
    rows.forEach(function (r, n) { var p = eo((st.t - r.at) / .2), px = r.px * sc, last = n === rows.length - 1; ctx.save(); ctx.globalAlpha *= p;
      ctx.translate(x0, y + px / 2); var z = last ? 1.25 - .25 * p : 1; ctx.scale(z, z); ctx.translate(-x0, -(y + px / 2));
      ctx.font = "900 " + Math.round(px) + "px " + SANS; if (!st.bg) { ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 18 * u; ctx.shadowOffsetY = 4 * u; ctx.lineJoin = "round"; ctx.lineWidth = 8 * u; ctx.strokeStyle = "rgba(0,0,0,.6)"; ctx.strokeText(r.t, x0 + (1 - p) * 30 * u, y); ctx.shadowColor = "transparent"; }
      ctx.fillStyle = r.hl ? acc : (r.alt ? (st.bg ? "#b9b9b9" : "#E8E8E8") : "#fff"); ctx.fillText(r.t, x0 + (1 - p) * 30 * u, y); ctx.restore(); y += px * 1.04; });
    ctx.restore(); });

  // 02 逐字跳字
  add("pop", "逐字跳字", "口播、老闆講話", "一次跳 2～4 個字，重點字變黃放大，最常見也最好看懂。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], ps = parts(L), p = prog(L, st.t), k = Math.min(ps.length - 1, Math.floor(p * ps.length)), s = ps[k], lt = (p * ps.length - k) / ps.length * (L.e - L.s);
    var hl = isHL(L, s), sz = (hl ? 104 : 88) * u * (1 + .25 * (1 - eb(lt / .16))); font(ctx, 900, sz, null, s); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.lineJoin = "round"; ctx.lineWidth = 14 * u; ctx.strokeStyle = "#000"; ctx.strokeText(s, W / 2, H * .66); ctx.fillStyle = hl ? "#FFE600" : "#fff"; ctx.fillText(s, W / 2, H * .66); }, { accent: "#FFE600" });

  // 03 卡拉OK亮字
  add("karaoke", "卡拉OK亮字", "賣東西、直播帶貨", "整句先出來，講到哪個字就亮到哪，眼睛會一直跟著跑。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], t = plain(L), p = prog(L, st.t); font(ctx, 900, 64 * u, null, plain(st.lines[i])); ctx.textBaseline = "middle";
    var w = ctx.measureText(t).width, x = (W - w) / 2, y = H * .72; ctx.lineJoin = "round"; ctx.lineWidth = 12 * u; ctx.strokeStyle = "#111"; ctx.strokeText(t, x, y); ctx.fillStyle = "#fff"; ctx.fillText(t, x, y);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y - 60 * u, w * p, 120 * u); ctx.clip(); ctx.fillStyle = st.accent; ctx.fillText(t, x, y); ctx.restore(); }, { accent: "#FFD400" });

  // 04 打字機
  add("type", "打字機", "說故事、心情、懸疑", "一個字一個字打出來，後面跟著閃爍的游標，適合慢慢講的內容。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], t = plain(L), n = Math.ceil(clamp((st.t - L.s) / Math.min(L.e - L.s, t.length * .09 + .1), 0, 1) * t.length);
    font(ctx, 700, 50 * u, null, plain(st.lines[i])); ctx.textBaseline = "middle"; var w = ctx.measureText(t).width, x = (W - w) / 2, y = H * .76;
    ctx.fillStyle = "rgba(0,0,0,.55)"; rrect(ctx, x - 26 * u, y - 46 * u, w + 52 * u, 92 * u, 10 * u); ctx.fill();
    colorRun(ctx, L, x, y, "#F4F1E8", st.accent, { align: "left", upto: n }); var cx = x + ctx.measureText(t.slice(0, n)).width + 4 * u;
    if (Math.floor(st.t * 2.4) % 2 === 0) { ctx.fillStyle = "#F4F1E8"; ctx.fillRect(cx, y - 28 * u, 5 * u, 56 * u); } }, { accent: "#7FE0C4" });

  // 05 霓虹燈
  add("neon", "霓虹燈", "夜景、餐廳、潮流", "字像霓虹燈管一樣發光，晚上拍的影片最搭。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st, "#07060d"); if (i < 0) return; var L = st.lines[i]; font(ctx, 900, 78 * u); ctx.textAlign = "center"; ctx.textBaseline = "middle"; var lines = wrap(ctx, plain(L), W - 100 * u), y = H * .68 - (lines.length - 1) * 45 * u;
    lines.forEach(function (ln) { ctx.save(); ctx.shadowColor = st.accent; ctx.shadowBlur = 34 * u; ctx.lineWidth = 6 * u; ctx.strokeStyle = st.accent; ctx.strokeText(ln, W / 2, y); ctx.shadowBlur = 12 * u; ctx.fillStyle = "#fff"; ctx.fillText(ln, W / 2, y); ctx.restore(); y += 90 * u; }); }, { accent: "#FF2E88" });

  // 06 螢光筆
  add("marker", "螢光筆畫重點", "知識、筆記、讀書", "白字乾淨，講到重點時螢光筆從左到右劃過那幾個字。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], t = plain(L), m = marks(L), p = prog(L, st.t); font(ctx, 800, 60 * u, null, plain(st.lines[i])); ctx.textBaseline = "middle";
    var w = ctx.measureText(t).width, x = (W - w) / 2, y = H * .74, cx = x, a = -1, b = -1; for (var k = 0; k < t.length; k++) if (m[k]) { if (a < 0) a = k; b = k; }
    if (a >= 0) { var x1 = x + ctx.measureText(t.slice(0, a)).width, x2 = x + ctx.measureText(t.slice(0, b + 1)).width, q = eo((p - .15) / .35); ctx.fillStyle = st.accent; ctx.globalAlpha = .85; ctx.fillRect(x1 - 6 * u, y - 4 * u, (x2 - x1 + 12 * u) * q, 34 * u); ctx.globalAlpha = 1; }
    ctx.lineJoin = "round"; ctx.lineWidth = 9 * u; ctx.strokeStyle = "rgba(0,0,0,.75)"; ctx.strokeText(t, x, y); ctx.fillStyle = "#fff"; ctx.fillText(t, x, y); }, { accent: "#FFE14D" });

  // 07 聊天泡泡
  add("bubble", "聊天泡泡", "Podcast、兩人聊天", "每句話變成聊天泡泡，左右輪流往上疊，像在看聊天室。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var y = H * .84;
    for (var k = i; k >= Math.max(0, i - 3); k--) { var L = st.lines[k], p = k === i ? eb((st.t - L.s) / .25) : 1; font(ctx, 700, 44 * u); var t = plain(L), w = Math.min(W * .7, ctx.measureText(t).width), right = k % 2 === 1, bw = w + 48 * u, bh = 80 * u, x = right ? W - 40 * u - bw : 40 * u;
      ctx.save(); ctx.globalAlpha = k === i ? 1 : .9 - (i - k) * .15; ctx.translate(x + (right ? bw : 0), y); ctx.scale(p, p); ctx.translate(-(x + (right ? bw : 0)), -y);
      ctx.fillStyle = right ? st.accent : "#fff"; rrect(ctx, x, y - bh, bw, bh, 30 * u); ctx.fill(); ctx.textBaseline = "middle"; ctx.fillStyle = "#1b1b1b"; ctx.fillText(t, x + 24 * u, y - bh / 2, W * .7); ctx.restore(); y -= bh + 18 * u; } }, { accent: "#9EE6FF" });

  // 08 新聞快報
  add("ticker", "新聞快報條", "時事、科技、AI 新聞", "下面一條新聞台快報，左邊紅色標籤，字從右邊滑進來。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], p = eo((st.t - L.s) / .3), y = H * .82, h = 92 * u;
    ctx.fillStyle = "#0B0F2A"; ctx.fillRect(0, y, W, h); ctx.fillStyle = st.accent; ctx.fillRect(0, y, 150 * u, h); ctx.fillStyle = "#FFE600"; ctx.fillRect(0, y - 6 * u, W, 6 * u);
    font(ctx, 900, 38 * u); ctx.fillStyle = "#fff"; ctx.textBaseline = "middle"; ctx.textAlign = "center"; ctx.fillText("快報", 75 * u, y + h / 2); ctx.textAlign = "left";
    ctx.save(); ctx.beginPath(); ctx.rect(160 * u, y, W, h); ctx.clip(); font(ctx, 700, 44 * u, null, plain(st.lines[i]), .7); colorRun(ctx, L, 180 * u + (1 - p) * W * .6, y + h / 2, "#fff", "#FFE600", { align: "left" }); ctx.restore(); }, { accent: "#C8102E" });

  // 09 電影字幕
  add("cinema", "電影字幕", "短劇、故事、質感 vlog", "上下黑邊、底部細字慢慢淡入，像在看電影。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); var bar = H * .11; ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar); if (i < 0) return;
    var L = st.lines[i], a = clamp((st.t - L.s) / .3, 0, 1) * clamp((L.e - st.t) / .25 + .2, 0, 1); font(ctx, 600, 38 * u, SERIF); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.globalAlpha = a;
    ctx.fillStyle = "#F5F1E8"; ctx.fillText(plain(L), W / 2, H - bar / 2); ctx.globalAlpha = 1; }, { accent: "#F5F1E8" });

  // 10 金句字卡
  add("quote", "金句字卡", "心靈成長、個人品牌、語錄", "黑底金字大字放中間，字距慢慢收攏，背後一個超大淡字。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st, "#050505"); if (i < 0) return; var L = st.lines[i], p = eo((st.t - L.s) / .9), t = plain(L), big = (L.hl && L.hl[0]) || t.slice(0, 2);
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; font(ctx, 900, 300 * u, SERIF); ctx.fillStyle = st.accent; ctx.globalAlpha = .1 * p; ctx.fillText(big, W / 2, H * .5); ctx.globalAlpha = p;
    font(ctx, 900, 64 * u, SERIF, plain(L), .78); var sp = (1 - p) * 18 * u, w = 0, k; for (k = 0; k < t.length; k++) w += ctx.measureText(t[k]).width + sp; var x = W / 2 - w / 2, m = marks(L);
    for (k = 0; k < t.length; k++) { var cw = ctx.measureText(t[k]).width; ctx.fillStyle = m[k] ? st.accent : "#EDE6D6"; ctx.fillText(t[k], x + cw / 2, H * .5); x += cw + sp; } ctx.globalAlpha = 1; }, { accent: "#D9B870" });

  // 11 彈跳大字
  add("drop", "彈跳掉落", "開箱、驚喜、童趣", "每個字從上面掉下來彈兩下，一個接一個，很活潑。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], t = plain(L), m = marks(L); font(ctx, 900, 76 * u, null, plain(st.lines[i])); ctx.textBaseline = "middle";
    var w = ctx.measureText(t).width, x = (W - w) / 2, y = H * .7; ctx.lineJoin = "round";
    for (var k = 0; k < t.length; k++) { var cw = ctx.measureText(t[k]).width, q = bounce((st.t - L.s - k * .05) / .5); if (q <= 0) { x += cw; continue; } var yy = y - (1 - q) * 260 * u;
      ctx.lineWidth = 12 * u; ctx.strokeStyle = "#1b1b1b"; ctx.strokeText(t[k], x, yy); ctx.fillStyle = m[k] ? st.accent : "#fff"; ctx.fillText(t[k], x, yy); x += cw; } }, { accent: "#FF9F1C" });

  // 12 滑入色塊
  add("block", "滑入色塊", "品牌、促銷、重點宣告", "色塊從左邊刷進來，黑字壓在色塊上，看起來很有設計感。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], p = eo((st.t - L.s) / .28), q = eo((st.t - L.s - .12) / .28); font(ctx, 900, 58 * u, null, plain(st.lines[i])); ctx.textBaseline = "middle";
    var t = plain(L), w = ctx.measureText(t).width + 50 * u, x = (W - w) / 2, y = H * .72, h = 92 * u; ctx.fillStyle = st.accent; ctx.fillRect(x, y - h / 2, w * p, h);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y - h / 2, w * q, h); ctx.clip(); ctx.fillStyle = "#111"; ctx.fillText(t, x + 25 * u, y); ctx.restore(); }, { accent: "#FFE600" });

  // 13 綜藝花字
  add("variety", "綜藝花字", "搞笑、日常、綜藝感", "雙層彩色描邊、字稍微歪一點，像綜藝節目的花字。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], p = eb((st.t - L.s) / .3), t = plain(L); font(ctx, 900, 80 * u, null, plain(st.lines[i]), .8); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.save(); ctx.translate(W / 2, H * .7); ctx.rotate(-3 * Math.PI / 180); ctx.scale(p, p); ctx.lineJoin = "round";
    ctx.lineWidth = 26 * u; ctx.strokeStyle = st.accent; ctx.strokeText(t, 0, 0); ctx.lineWidth = 12 * u; ctx.strokeStyle = "#fff"; ctx.strokeText(t, 0, 0); ctx.fillStyle = "#222"; ctx.fillText(t, 0, 0); ctx.restore(); }, { accent: "#FF4FA3" });

  // 14 極簡白字
  add("minimal", "極簡白字", "質感 vlog、穿搭、生活", "小小的白字加一點陰影，不搶畫面，看起來乾淨高級。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], a = clamp((st.t - L.s) / .25, 0, 1) * clamp((L.e - st.t) / .2 + .3, 0, 1); font(ctx, 500, 36 * u, null, plain(st.lines[i])); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.globalAlpha = a; ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 10 * u; ctx.fillStyle = "#fff"; ctx.fillText(plain(L), W / 2, H * .8); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }, { accent: "#ffffff" });

  // 15 重點框線
  add("frame", "重點框線", "教學、比較、懶人包", "重點字被一個框框畫起來，框線像手畫的一樣繞一圈。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], t = plain(L), m = marks(L), p = prog(L, st.t); font(ctx, 900, 62 * u, null, plain(st.lines[i])); ctx.textBaseline = "middle";
    var w = ctx.measureText(t).width, x = (W - w) / 2, y = H * .72; ctx.lineJoin = "round"; ctx.lineWidth = 10 * u; ctx.strokeStyle = "#000"; ctx.strokeText(t, x, y); ctx.fillStyle = "#fff"; ctx.fillText(t, x, y);
    var a = m.indexOf(1), b = m.lastIndexOf(1); if (a < 0) return; var x1 = x + ctx.measureText(t.slice(0, a)).width - 10 * u, x2 = x + ctx.measureText(t.slice(0, b + 1)).width + 10 * u, q = eo((p - .2) / .4), per = 2 * (x2 - x1) + 2 * 84 * u;
    ctx.strokeStyle = st.accent; ctx.lineWidth = 6 * u; ctx.setLineDash([per * q, per]); ctx.strokeRect(x1, y - 42 * u, x2 - x1, 84 * u); ctx.setLineDash([]); }, { accent: "#FF3B30" });

  // 16 流光漸層
  add("shine", "流光漸層", "美妝、珠寶、精品", "字是漸層色，一道光從左到右掃過去，看起來很亮很貴。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], t = plain(L); font(ctx, 900, 66 * u, null, plain(st.lines[i])); ctx.textAlign = "center"; ctx.textBaseline = "middle"; var w = ctx.measureText(t).width, y = H * .72;
    var g = ctx.createLinearGradient(W / 2 - w / 2, 0, W / 2 + w / 2, 0); g.addColorStop(0, "#F6D365"); g.addColorStop(1, st.accent); ctx.globalAlpha = clamp((st.t - L.s) / .25, 0, 1);
    ctx.shadowColor = "rgba(0,0,0,.5)"; ctx.shadowBlur = 12 * u; ctx.fillStyle = g; ctx.fillText(t, W / 2, y); ctx.shadowBlur = 0;
    var sx = W / 2 - w / 2 + (((st.t - L.s) * .9) % 1.4) * w, sg = ctx.createLinearGradient(sx - 60 * u, 0, sx + 60 * u, 0); sg.addColorStop(0, "rgba(255,255,255,0)"); sg.addColorStop(.5, "rgba(255,255,255,.9)"); sg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.save(); ctx.globalCompositeOperation = "source-atop"; ctx.fillStyle = sg; ctx.fillText(t, W / 2, y); ctx.restore(); ctx.globalAlpha = 1; }, { accent: "#F78CA0" });

  // 17 堆疊大字
  add("stack", "堆疊大字", "觀點、清單、重點整理", "每句話放在畫面中間，新的一句把舊的往上推、變淡，最新的最大。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (var k = i; k >= Math.max(0, i - 3); k--) { var L = st.lines[k], d = i - k, p = eo((st.t - st.lines[i].s) / .3), off = d - 1 + p; if (k === i) off = 0; var sz = (d === 0 ? 74 : 48) * u, y = H * .62 - (d === 0 ? (1 - p) * -40 * u : (d - 1 + p) * 70 * u + 90 * u);
      font(ctx, 900, sz, null, plain(L)); ctx.globalAlpha = d === 0 ? p : Math.max(0, .7 - d * .2); colorRun(ctx, L, W / 2, y, "#fff", st.accent, { stroke: 10 * u }); ctx.textAlign = "center"; } ctx.globalAlpha = 1; }, { accent: "#2EE6A8" });

  // 18 波浪字
  add("wave", "波浪字", "音樂、舞蹈、放鬆", "每個字像波浪一樣上下輕輕起伏，配音樂的影片很合。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], t = plain(L), m = marks(L); font(ctx, 900, 64 * u, null, plain(st.lines[i])); ctx.textBaseline = "middle"; var w = ctx.measureText(t).width, x = (W - w) / 2, a = clamp((st.t - L.s) / .25, 0, 1);
    ctx.globalAlpha = a; ctx.lineJoin = "round"; for (var k = 0; k < t.length; k++) { var cw = ctx.measureText(t[k]).width, y = H * .72 + Math.sin(st.t * 5 + k * .7) * 12 * u; ctx.lineWidth = 10 * u; ctx.strokeStyle = "#20124d"; ctx.strokeText(t[k], x, y); ctx.fillStyle = m[k] ? st.accent : "#fff"; ctx.fillText(t[k], x, y); x += cw; } ctx.globalAlpha = 1; }, { accent: "#A78BFA" });

  // 20 手機簡訊
  add("sms", "手機訊息", "情境劇、對話、感情", "先出現「正在輸入…」，再跳出藍色訊息，像在看人傳訊息。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var y = H * .86;
    for (var k = i; k >= Math.max(0, i - 2); k--) { var L = st.lines[k], lt = st.t - L.s, me = k % 2 === 0; font(ctx, 500, 40 * u); var t = plain(L), w = Math.min(W * .66, ctx.measureText(t).width), bw = w + 44 * u, bh = 72 * u, x = me ? W - 36 * u - bw : 36 * u;
      if (k === i && lt < .35) { var dw = 110 * u; ctx.fillStyle = "#E9E9EB"; rrect(ctx, me ? W - 36 * u - dw : 36 * u, y - bh, dw, bh, 36 * u); ctx.fill(); for (var d = 0; d < 3; d++) { ctx.fillStyle = "rgba(0,0,0," + (.25 + .4 * (Math.floor(st.t * 6) % 3 === d)) + ")"; ctx.beginPath(); ctx.arc((me ? W - 36 * u - dw : 36 * u) + 30 * u + d * 25 * u, y - bh / 2, 7 * u, 0, 7); ctx.fill(); } y -= bh + 14 * u; continue; }
      ctx.fillStyle = me ? st.accent : "#E9E9EB"; rrect(ctx, x, y - bh, bw, bh, 34 * u); ctx.fill(); ctx.fillStyle = me ? "#fff" : "#111"; ctx.textBaseline = "middle"; ctx.fillText(t, x + 22 * u, y - bh / 2, W * .66); y -= bh + 14 * u; } }, { accent: "#0A84FF" });

  // 21 便利貼
  add("sticky", "便利貼", "待辦、提醒、小知識", "黃色便利貼歪歪地貼上來，字寫在便利貼上，很生活感。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], p = eb((st.t - L.s) / .3); font(ctx, 700, 46 * u, SERIF); var lines = wrap(ctx, plain(L), W * .62), bw = W * .72, bh = (lines.length * 62 + 70) * u;
    ctx.save(); ctx.translate(W / 2, H * .72); ctx.rotate((i % 2 ? 3 : -3) * Math.PI / 180); ctx.scale(p, p); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 18 * u; ctx.shadowOffsetY = 8 * u; ctx.fillStyle = st.accent; ctx.fillRect(-bw / 2, -bh / 2, bw, bh); ctx.shadowColor = "transparent";
    ctx.fillStyle = "rgba(255,255,255,.55)"; ctx.fillRect(-60 * u, -bh / 2 - 14 * u, 120 * u, 30 * u); ctx.fillStyle = "#3B2A1E"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; lines.forEach(function (ln, q) { ctx.fillText(ln, 0, -bh / 2 + 66 * u + q * 62 * u); }); ctx.restore(); }, { accent: "#FFE873" });

  // 22 彈幕
  add("danmaku", "直播彈幕", "直播、遊戲、熱鬧感", "主字幕在下面，上面一直有彈幕飛過，很熱鬧。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); font(ctx, 700, 34 * u); ctx.textBaseline = "middle"; var all = st.lines;
    for (var k = 0; k < all.length; k++) { var lt = st.t - all[k].s + .5; if (lt < 0 || lt > 4) continue; var t = plain(all[k]), x = W - lt * (W + ctx.measureText(t).width) / 3.5, y = H * (.14 + (k % 5) * .07);
      ctx.lineWidth = 6 * u; ctx.strokeStyle = "rgba(0,0,0,.6)"; ctx.strokeText(t, x, y); ctx.fillStyle = ["#fff", "#FFE14D", "#9EE6FF", "#FF9BD0"][k % 4]; ctx.fillText(t, x, y); }
    if (i < 0) return; var L = all[i]; font(ctx, 900, 58 * u, null, plain(L)); ctx.textAlign = "center"; colorRun(ctx, L, W / 2, H * .78, "#fff", st.accent, { stroke: 10 * u }); ctx.textAlign = "left"; }, { accent: "#FFE14D" });

  // 23 逐行淡入
  add("fadeup", "逐行淡入", "溫柔、療癒、感性", "每一句從下面輕輕浮上來、慢慢變清楚，節奏很溫柔。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], p = eo((st.t - L.s) / .6); font(ctx, 600, 48 * u, SERIF, plain(st.lines[i])); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.globalAlpha = p * clamp((L.e - st.t) / .3 + .2, 0, 1); ctx.shadowColor = "rgba(0,0,0,.55)"; ctx.shadowBlur = 14 * u; colorRun(ctx, L, W / 2, H * .74 + (1 - p) * 40 * u, "#fff", st.accent); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }, { accent: "#FFD9A8" });

  // 24 黑框反白
  add("invert", "黑框反白", "抖音口播、資訊型", "每句話放在黑色圓角框裡，白字配重點色，抖音最常見的樣子。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) return; var L = st.lines[i], p = eb((st.t - L.s) / .2); font(ctx, 900, 54 * u, null, plain(st.lines[i])); ctx.textBaseline = "middle"; var t = plain(L), w = ctx.measureText(t).width, x = (W - w) / 2, y = H * .72;
    ctx.save(); ctx.translate(W / 2, y); ctx.scale(p, p); ctx.translate(-W / 2, -y); ctx.fillStyle = "rgba(0,0,0,.85)"; rrect(ctx, x - 24 * u, y - 44 * u, w + 48 * u, 88 * u, 16 * u); ctx.fill(); colorRun(ctx, L, x, y, "#fff", st.accent, { align: "left" }); ctx.restore(); }, { accent: "#FFD400" });

  // 24 清單劃掉（Vic 10/26）：一次列 4 句，講完一句就打勾、劃一條線，接著亮下一句
  add("checklist", "清單劃掉", "教學、步驟、懶人包", "畫面列出接下來要講的幾點，講完一點就打勾劃掉，觀眾會想看到全部劃完。", function (ctx, W, H, st) {
    var u = W / 720, i = cur(st); bgFill(ctx, W, H, st); if (i < 0) { var all = st.lines; for (var q = all.length - 1; q >= 0; q--) if (st.t >= all[q].e) { i = q; break; } if (i < 0) return; }
    var N = 4, pg = Math.floor(i / N), rows = st.lines.slice(pg * N, pg * N + N), rh = 74 * u, pw = W * .86, ph = rows.length * rh + 34 * u, px = (W - pw) / 2, py = H * .80 - ph;
    var a0 = eo((st.t - st.lines[pg * N].s) / .35); ctx.save(); ctx.globalAlpha = a0;
    ctx.fillStyle = "rgba(10,14,28,.78)"; rrect(ctx, px, py, pw, ph, 20 * u); ctx.fill(); ctx.textBaseline = "middle";
    rows.forEach(function (L, k) { var idx = pg * N + k, y = py + 17 * u + rh * k + rh / 2, done = st.t >= L.e, now = idx === i && !done, cx = px + 44 * u, r = 19 * u;
      var t = plain(L); font(ctx, now ? 900 : 700, 40 * u, null, t, .66); var tw = ctx.measureText(t).width, tx = px + 84 * u;
      ctx.globalAlpha = a0 * (done ? .55 : now ? 1 : .42);
      ctx.beginPath(); ctx.arc(cx, y, r, 0, 7); ctx.fillStyle = done ? st.accent : now ? "#fff" : "rgba(255,255,255,.18)"; ctx.fill();
      if (done) { ctx.strokeStyle = "#111"; ctx.lineWidth = 5 * u; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(cx - 9 * u, y); ctx.lineTo(cx - 2 * u, y + 7 * u); ctx.lineTo(cx + 10 * u, y - 8 * u); ctx.stroke(); }
      else { ctx.fillStyle = now ? "#111" : "#fff"; ctx.textAlign = "center"; font(ctx, 900, 22 * u); ctx.fillText(String(idx + 1), cx, y + 1 * u); font(ctx, now ? 900 : 700, 40 * u, null, t, .66); }
      ctx.textAlign = "left"; if (now) colorRun(ctx, L, tx, y, "#fff", st.accent, { align: "left" }); else { ctx.fillStyle = "#fff"; ctx.fillText(t, tx, y); }
      if (done) { var sp = eo((st.t - L.e) / .3); ctx.strokeStyle = st.accent; ctx.lineWidth = 5 * u; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(tx - 4 * u, y); ctx.lineTo(tx - 4 * u + (tw + 8 * u) * sp, y); ctx.stroke(); } });
    ctx.restore(); }, { accent: "#FFE14D" });

  root.SUBFX = { size: function (k) { var o = SIZE; SIZE = +k > 0 ? +k : 0.9; return o; }, list: M, SANS: SANS, SERIF: SERIF,
    demo: [{ s: 0, e: 1.2, t: "這種字幕|怎麼做？", hl: ["字幕"] }, { s: 1.2, e: 2.2, t: "很多人問我", hl: [] }, { s: 2.2, e: 3.6, t: "是不是要|一格一格調", hl: ["一格一格"] }, { s: 3.6, e: 4.4, t: "不用！", hl: ["不用"] },
      { s: 4.4, e: 5.8, t: "上傳影片|選個模組", hl: ["模組"] }, { s: 5.8, e: 7.2, t: "剩下的|交給 AI", hl: ["AI"] }, { s: 7.2, e: 8.7, t: "三分鐘|字幕全上好", hl: ["三分鐘"] }],
    loop: 9.2 };
})(typeof window !== "undefined" ? window : globalThis);
