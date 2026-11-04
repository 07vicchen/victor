/* 剪輯工作室：特效模擬（Vic 11/5）
   照桌機剪片程式 cutbot.py 的位置和大小畫，客人的照片直接放進去，看到的位置就是成品的位置。
   FXSIM.draw(ctx, W, H, id, t, { photos: [Image], word: "重點字", line: "那句話", lines: [...] }) */
(function () {
  var NAVY = "#14213d", GOLD = "#c9a04a";
  function ease(t) { return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3); }
  // 一輪 4 秒：0～.4 進場、.4～3.4 停著、3.4～3.7 退場、之後空 .3 秒
  function phase(t) { t = t % 4; return { t: t, inn: ease(t / .4), out: t > 3.4 ? ease((t - 3.4) / .3) : 0, on: t < 3.7 }; }
  function rr(x, px, py, w, h, r) { x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); }
  function cover(x, im, px, py, w, h) { if (!im || !im.complete || !im.naturalWidth) { x.fillStyle = "#d9d4c8"; x.fillRect(px, py, w, h); x.fillStyle = "#6b6456"; x.font = "700 " + Math.round(w * .11) + "px sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("你的照片", px + w / 2, py + h / 2); x.textAlign = "left"; return; }
    var s = Math.max(w / im.naturalWidth, h / im.naturalHeight), sw = w / s, sh = h / s; x.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, px, py, w, h); }
  // 圓角照片＋細白框＋陰影（card_photo）
  function photoCard(x, W, im, px, py, w, h) { var r = W * .022, b = Math.max(2, W * .006);
    x.save(); x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = W * .03; x.shadowOffsetY = W * .01; rr(x, px, py, w, h, r); x.fillStyle = "#fff"; x.fill(); x.restore();
    x.save(); rr(x, px + b, py + b, w - b * 2, h - b * 2, Math.max(1, r - b)); x.clip(); cover(x, im, px + b, py + b, w - b * 2, h - b * 2); x.restore(); }
  function serif(px) { return "900 " + Math.round(px) + 'px "Noto Serif TC","Songti TC",serif'; }
  function sans(w, px) { return w + " " + Math.round(px) + 'px "Noto Sans TC","PingFang TC",sans-serif'; }
  function fitText(x, s, maxW, font, size, min) { while (size > min) { x.font = font(size); if (x.measureText(s).width <= maxW) break; size -= 2; } x.font = font(size); return size; }
  function clip(s, n) { s = String(s || "").replace(/\|/g, ""); return s.length > n ? s.slice(0, n) : s; }

  var D = {
    covers: function (x, W, H, f, o) { var ps = o.photos.length ? o.photos : [null, null, null], n = Math.min(3, ps.length), k = Math.floor((f.t0 || 0) / 4) % n;
      // 成品是一張一張出現（每張 2.4 秒），位置照順序往右排；模擬一次秀全部讓你看到排法
      for (var i = 0; i < n; i++) { var a = ease(((f.t) - i * .25) / .4), w = W * .40, h = W * .53, px = W * (.08 + .22 * (i % 3)), py = H * .14 - H * .05 * (1 - a);
        if (a <= 0) continue; x.save(); x.globalAlpha = a * (1 - f.out); photoCard(x, W, ps[i], px, py, w, h); x.restore(); } },
    pip: function (x, W, H, f, o) { var w = W * .36, h = W * .48; x.save(); x.globalAlpha = f.inn * (1 - f.out); photoCard(x, W, o.photos[0], W - w - W * .02, H * .16, w, h); x.restore(); },
    material: function (x, W, H, f, o) { var w = W * .62, h = W * .46, y1 = H * .17, py = y1 - (y1 + h) * ((1 - f.inn) + f.out); photoCard(x, W, o.photos[0], (W - w) / 2, py, w, h); },
    featcards: function (x, W, H, f, o) { var ps = o.photos.length ? o.photos : [null], n = ps.length, k = Math.floor(o.cycle || 0) % n, cw = W * .56, ch = W * .27, r = W * .028, x1 = W - cw - W * .02, px = x1 + (W - x1) * ((1 - f.inn) + f.out), py = H * .50, sz = ch - W * .032;
      x.save(); x.shadowColor = "rgba(0,0,0,.35)"; x.shadowBlur = W * .03; rr(x, px, py, cw, ch, r); x.fillStyle = "rgba(20,33,61,.94)"; x.fill(); x.restore();
      var ix = px + cw - sz - W * .018; x.save(); rr(x, ix, py + (ch - sz) / 2, sz, sz, r * .6); x.clip(); cover(x, ps[k], ix, py + (ch - sz) / 2, sz, sz); x.restore();
      var tx = px + W * .04, tw = ix - tx - W * .02; x.fillStyle = "#bec6d7"; x.font = serif(W * .022); x.textBaseline = "top"; x.fillText("FEATURE " + String(k + 1).padStart(2, "0"), tx, py + ch * .14);
      x.fillStyle = "#fff"; fitText(x, clip(o.word, 6), tw, serif, W * .058, W * .034); x.fillText(clip(o.word, 6), tx, py + ch * .30);
      x.fillStyle = "#cdd4e4"; x.font = sans(500, W * .026); x.fillText(clip(o.line, 9), tx, py + ch * .58);
      var d0 = W * .01; for (var i = 0; i < Math.min(n, 8); i++) { x.fillStyle = i === k ? "#fff" : "#7884a0"; x.beginPath(); x.arc(tx + i * d0 * 2.6 + d0 / 2, py + ch * .82 + d0 / 2, d0 / 2, 0, 7); x.fill(); } },
    bigword: function (x, W, H, f, o) { var w = clip(o.word, 2); x.save(); x.globalAlpha = f.inn * (1 - f.out); x.fillStyle = NAVY; x.textAlign = "center"; x.textBaseline = "middle"; fitText(x, w, W * .9, serif, W * .26, W * .12); x.fillText(w, W / 2, H * .36); x.restore(); },
    hang: function (x, W, H, f, o) { var w = clip(o.word, 2), cw = W * .13 * Math.max(1, w.length * .75), ch = W * .15, px = W * .62, y1 = H * .12, py = y1 - ch * Math.pow(1 - f.inn, 2) - (y1 + ch) * f.out;
      x.save(); x.strokeStyle = "#666"; x.lineWidth = Math.max(1, W * .003); x.beginPath(); x.moveTo(px + cw / 2, 0); x.lineTo(px + cw / 2, py); x.stroke();
      x.shadowColor = "rgba(0,0,0,.25)"; x.shadowBlur = W * .02; x.fillStyle = "#fff"; x.fillRect(px, py, cw, ch); x.shadowBlur = 0; x.fillStyle = NAVY; x.font = serif(W * .08); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(w, px + cw / 2, py + ch * .56); x.restore(); },
    qcard: function (x, W, H, f, o) { var cw = W * .78, ch = W * .30, px = (W - cw) / 2, py = H * .13 - H * .03 * (1 - f.inn); x.save(); x.globalAlpha = f.inn * (1 - f.out);
      x.shadowColor = "rgba(0,0,0,.3)"; x.shadowBlur = W * .03; rr(x, px, py, cw, ch, W * .03); x.fillStyle = "#fff"; x.fill(); x.shadowBlur = 0;
      x.fillStyle = "#e5483b"; x.beginPath(); x.arc(px + W * .09, py + ch / 2, W * .05, 0, 7); x.fill(); x.fillStyle = "#fff"; x.font = serif(W * .06); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("?", px + W * .09, py + ch / 2);
      x.textAlign = "left"; x.textBaseline = "top"; x.fillStyle = "#c0392b"; x.font = sans(700, W * .03); x.fillText("主題", px + W * .17, py + ch * .2);
      x.fillStyle = NAVY; fitText(x, clip(o.line, 12), cw - W * .21, serif, W * .062, W * .036); x.fillText(clip(o.line, 12), px + W * .17, py + ch * .45); x.restore(); },
    versus: function (x, W, H, f, o) { var cw = W * .40, ch = W * .17, py = H * .60, gap = W * .04; x.save(); x.globalAlpha = f.inn * (1 - f.out);
      [["A", (W / 2) - cw - gap / 2], ["B", W / 2 + gap / 2]].forEach(function (s, i) { rr(x, s[1], py, cw, ch, W * .02); x.fillStyle = "rgba(20,24,33,.92)"; x.fill(); x.fillStyle = "#fff"; x.font = sans(700, W * .024); x.textBaseline = "top"; x.fillText(s[0], s[1] + W * .025, py + ch * .14); x.font = serif(W * .045); x.fillText(i ? "選這邊" : "還是這邊", s[1] + W * .025, py + ch * .42); });
      x.fillStyle = "#e0a93b"; x.beginPath(); x.arc(W / 2, py + ch / 2, W * .045, 0, 7); x.fill(); x.fillStyle = "#fff"; x.font = sans(900, W * .035); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("VS", W / 2, py + ch / 2); x.restore(); },
    glass: function (x, W, H, f, o) { var cw = W * .66, ch = W * .2, px = W * .2, py = H * .50; x.save(); x.globalAlpha = f.inn * (1 - f.out);
      rr(x, px, py, cw, ch, W * .02); x.fillStyle = "rgba(255,255,255,.86)"; x.fill(); x.fillStyle = GOLD; x.font = sans(700, W * .024); x.textBaseline = "top"; x.fillText("重點", px + W * .04, py + ch * .16);
      x.fillStyle = NAVY; fitText(x, clip(o.line, 10), cw - W * .08, serif, W * .055, W * .034); x.fillText(clip(o.line, 10), px + W * .04, py + ch * .40); x.fillStyle = GOLD; x.fillRect(px + W * .04, py + ch * .82, W * .06, Math.max(2, W * .005)); x.restore(); },
    chapters: function (x, W, H, f, o) { var L = (o.lines || []).slice(0, 5), lh = W * .045, cw = W * .2, ch = lh * L.length + W * .04, px = W - cw - W * .03, py = H * .40, k = Math.floor(f.t / .8) % Math.max(1, L.length);
      x.save(); x.globalAlpha = f.inn; rr(x, px, py, cw, ch, W * .015); x.fillStyle = "rgba(255,255,255,.75)"; x.fill();
      L.forEach(function (s, i) { var y = py + W * .02 + i * lh; if (i === k) { rr(x, px + W * .01, y - lh * .1, cw - W * .02, lh * .9, lh * .45); x.fillStyle = NAVY; x.fill(); } x.fillStyle = i === k ? "#fff" : "#555"; x.font = sans(700, W * .022); x.textBaseline = "top"; x.fillText("• " + clip(s, 5), px + W * .02, y); }); x.restore(); },
    grade: function (x, W, H, f) { x.save(); x.globalCompositeOperation = "soft-light"; x.fillStyle = "rgba(255,170,90,.55)"; x.fillRect(0, 0, W, H); x.restore(); },
    behind: function (x, W, H, f, o) { var w = clip(o.word, 2); x.save(); x.globalAlpha = .9 * f.inn * (1 - f.out); x.fillStyle = NAVY; x.textAlign = "center"; x.textBaseline = "middle"; fitText(x, w, W * .9, serif, W * .30, W * .14); x.fillText(w, W / 2, H * .25); x.restore(); },
    steps: function (x, W, H, f, o) { var L = (o.lines || []).slice(0, 3), cw = W * .56, ch = W * .30, px = W * .06, py = H * .55; x.save(); x.globalAlpha = f.inn * (1 - f.out);
      rr(x, px, py, cw, ch, W * .02); x.fillStyle = "rgba(20,24,33,.94)"; x.fill(); x.fillStyle = "#e0a93b"; x.font = sans(700, W * .024); x.textBaseline = "top"; x.fillText("三個重點", px + W * .03, py + W * .025);
      L.forEach(function (s, i) { var a = ease((f.t - .4 - i * .6) / .3); if (a <= 0) return; var y = py + W * .08 + i * W * .065; x.globalAlpha = a * (1 - f.out); x.fillStyle = "#e0a93b"; x.beginPath(); x.arc(px + W * .045, y + W * .02, W * .018, 0, 7); x.fill(); x.fillStyle = "#14181f"; x.font = sans(900, W * .024); x.textAlign = "center"; x.fillText(String(i + 1), px + W * .045, y + W * .008); x.textAlign = "left"; x.fillStyle = "#fff"; x.font = sans(700, W * .034); x.fillText(clip(s, 9), px + W * .08, y); }); x.restore(); },
    chart: function (x, W, H, f, o) { var cw = W * .62, ch = W * .26, px = (W - cw) / 2, py = H * .56; x.save(); x.globalAlpha = f.inn * (1 - f.out);
      rr(x, px, py, cw, ch, W * .02); x.fillStyle = "rgba(20,24,33,.94)"; x.fill(); x.fillStyle = "#fff"; x.font = sans(700, W * .026); x.textBaseline = "top"; x.fillText("用你講到的數字畫", px + W * .03, py + W * .025);
      [[.9, "#e0a93b"], [.3, "#8fa3c4"]].forEach(function (b, i) { var g = ease((f.t - .4 - i * .3) / .8), y = py + W * .09 + i * W * .07; x.fillStyle = "#2a3140"; rr(x, px + W * .03, y, cw * .7, W * .035, W * .017); x.fill(); x.fillStyle = b[1]; rr(x, px + W * .03, y, Math.max(W * .035, cw * .7 * b[0] * g), W * .035, W * .017); x.fill(); }); x.restore(); },
    logo: function (x, W, H, f, o) { x.save(); x.globalAlpha = .85; x.fillStyle = "rgba(255,255,255,.85)"; rr(x, W * .76, H * .03, W * .2, W * .08, W * .015); x.fill(); x.fillStyle = NAVY; x.font = sans(900, W * .03); x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("你的 logo", W * .86, H * .03 + W * .04); x.restore(); }
  };
  var NOTE = { covers: "照片依序浮出", pip: "右上小視窗", material: "上方滑進來", featcards: "右邊滑進來", bigword: "講到重點時", hang: "從上面垂下", qcard: "開頭丟問題", versus: "講到二選一", glass: "最重要那句", chapters: "右邊目錄", grade: "整支調暖色", behind: "成品字在人後面", steps: "講到第幾點", chart: "講到數字時", logo: "整支都在" };
  window.FXSIM = { has: function (id) { return !!D[id]; }, note: function (id) { return NOTE[id] || ""; },
    draw: function (x, W, H, id, t, o) { var fn = D[id]; if (!fn) return; var f = phase(t); f.t0 = t; if (!f.on && id !== "grade" && id !== "chapters" && id !== "logo" && id !== "pip") return; o = o || {}; o.photos = o.photos || []; o.cycle = Math.floor(t / 4);
      x.save(); try { fn(x, W, H, f, o); } catch (e) {} x.restore(); } };
})();
