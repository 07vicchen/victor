/* AI 剪片／字幕專區：聽寫 → 客人確認字幕、刪句、標重點、寫方向 → 預覽剪完的樣子 → 出片
   - 聽寫：victormoney /api/stt（ElevenLabs 聽寫＋Claude 校對），每支素材都打字幕
   - 剪法：刪掉的句子剪掉；可自動剪掉句子間的停頓；標 ⭐ 的句子複製一份放開頭當鉤子
   - 出片（只上字幕）：在客人的瀏覽器照剪法播一次、錄一次，字幕畫上去，上傳後就能下載 */
(function () {
  "use strict";
  var E = function (s) { return VAI.E(s); }, PAD = 0.12;
  function fmt(t) { t = Math.max(0, t || 0); var m = Math.floor(t / 60), s = t - m * 60; return m + ":" + (s < 10 ? "0" : "") + s.toFixed(1); }
  function accentOf(job) { var m = String(job.note || "").match(/#[0-9a-fA-F]{6}/); return m ? m[0] : ""; }
  // 完整剪片選的「剪法」對應到最接近的字幕樣子，讓預覽跟選的一樣
  var CUTMAP = { "爆點跳字": "pop", "三段式知識框": "invert", "倒敘懸念": "cinema", "聊天泡泡": "bubble", "柔光質感": "fadeup", "命理字卡": "quote", "手寫筆記": "marker", "綜藝爆笑": "variety", "直播帶貨": "karaoke", "新聞快報": "ticker", "多人對話切鏡": "bubble", "金句電影字卡": "quote" };
  function modOf(job) { var id = job.module || (job.mode !== "subs" ? CUTMAP[String(job.style || "").trim()] : "") || "pop";
    return (window.SUBFX && SUBFX.list.filter(function (q) { return q.id === id; })[0]) || (window.SUBFX && SUBFX.list[1]); }
  async function signed(path, sec) { var r = await VAI.client().storage.from("ai-videos").createSignedUrl(path, sec || 3600); if (r.error) throw new Error(r.error.message); return r.data.signedUrl; }
  function defEdit(job) { var e = job.edit || {}; return { direction: e.direction || "", trimGaps: e.trimGaps !== false, hook: e.hook !== false, title: e.title || "", titleSec: e.titleSec == null ? 0 : +e.titleSec, sticky: e.sticky || "", stickyPos: e.stickyPos || "tl", subSize: e.subSize ? +e.subSize : sizeOf(job), titleStyle: e.titleStyle || "auto", tag: e.tag || "", tagSize: e.tagSize ? +e.tagSize : 0.75 }; }
  var SIZES = { "小": 0.75, "中": 0.9, "大": 1.1 };
  function sizeOf(job) { var m = String(job.note || "").match(/字幕大小 ([小中大])/); return m ? SIZES[m[1]] : 0.9; }
  var TSTY = [["auto", "自動配合字幕"], ["dark", "黑底白字"], ["white", "白底黑字"], ["yellow", "黃色大字"], ["color", "重點色底"], ["serif", "質感細字"]];
  function tStyle(ed, mod) { var s = ed.titleStyle || "auto"; if (s !== "auto") return s; var id = mod && mod.id; return /fadeup|cinema|quote|minimal|serif|elegant/.test(id || "") ? "serif" : /pop|variety|karaoke|flip|stack/.test(id || "") ? "yellow" : "dark"; }
  // 常駐文字：整支影片一直在（店名、IG 帳號、優惠…）
  function drawSticky(x, W, H, ed) { var tt = String(ed.sticky || "").trim(); if (!tt) return; var u = W / 720, px = 28 * u, F = window.SUBFX ? SUBFX.SANS : "sans-serif";
    x.save(); x.font = "800 " + px + "px " + F; while (x.measureText(tt).width > W * .8 && px > 12) { px *= .93; x.font = "800 " + px + "px " + F; }
    var w = x.measureText(tt).width + 28 * u, h = px * 1.55, pos = ed.stickyPos || "tl", bx = pos === "tr" ? W - w - 28 * u : pos === "tl" ? 28 * u : (W - w) / 2, by = pos === "bottom" ? H - h - 60 * u : pos === "top" ? 24 * u : (ed.title ? 24 * u : 40 * u);
    if ((pos === "tl" || pos === "tr" || pos === "top") && ed.title) by = 24 * u;
    x.fillStyle = "rgba(0,0,0,.55)"; x.beginPath(); if (x.roundRect) x.roundRect(bx, by, w, h, h / 2); else x.rect(bx, by, w, h); x.fill();
    x.fillStyle = "#fff"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(tt, bx + w / 2, by + h / 2 + u); x.restore(); }
  // 上方標題：titleSec＝顯示幾秒（0＝整支都在）
  function drawTitle(x, W, H, t, ed, mod, acc) { var tt = String(ed.title || "").trim(); if (!tt || (ed.titleSec > 0 && t > ed.titleSec + .3)) return;
    var u = W / 720, a = Math.min(1, t / .2) * (ed.titleSec > 0 ? Math.min(1, (ed.titleSec + .3 - t) / .3) : 1), sty = tStyle(ed, mod), S = window.SUBFX ? SUBFX.SANS : "sans-serif", SF = window.SUBFX ? SUBFX.SERIF : "serif";
    x.save(); x.globalAlpha = Math.max(0, a); x.textAlign = "center"; x.textBaseline = "middle";
    var fam = sty === "serif" ? SF : S, wt = sty === "serif" ? "700" : "900", px = (sty === "yellow" ? 58 : sty === "serif" ? 44 : 44) * u;
    x.font = wt + " " + px + "px " + fam; while (x.measureText(tt).width > W * .86 && px > 16) { px *= .93; x.font = wt + " " + px + "px " + fam; }
    var w = x.measureText(tt).width + 44 * u, h = px * 1.6, y = (ed.sticky && (ed.stickyPos === "tl" || ed.stickyPos === "tr" || ed.stickyPos === "top") ? 92 : 70) * u, cy = y + h / 2 + 2 * u;
    function box(c, r) { x.fillStyle = c; x.beginPath(); if (x.roundRect) x.roundRect((W - w) / 2, y, w, h, r); else x.rect((W - w) / 2, y, w, h); x.fill(); }
    if (sty === "white") { box("rgba(255,255,255,.95)", 10 * u); x.fillStyle = "#111"; x.fillText(tt, W / 2, cy); }
    else if (sty === "color") { box(acc || "#FF3B30", 10 * u); x.fillStyle = "#fff"; x.fillText(tt, W / 2, cy); }
    else if (sty === "yellow") { x.lineJoin = "round"; x.lineWidth = 10 * u; x.strokeStyle = "#111"; x.strokeText(tt, W / 2, cy); x.fillStyle = "#FFE14D"; x.fillText(tt, W / 2, cy); }
    else if (sty === "serif") { x.shadowColor = "rgba(0,0,0,.6)"; x.shadowBlur = 14 * u; x.fillStyle = "#fff"; x.fillText(tt, W / 2, cy); x.shadowBlur = 0; x.fillStyle = "rgba(255,255,255,.8)"; var lw = Math.min(w * .5, 160 * u); x.fillRect(W / 2 - lw / 2, y + h + 4 * u, lw, 2 * u); }
    else { box("rgba(17,17,17,.88)", 12 * u); x.fillStyle = "#fff"; x.fillText(tt, W / 2, cy); }
    var tg = String(ed.tag || "").trim(); if (tg) { var tp = px * (ed.tagSize || .75) * .9; x.shadowBlur = 0; x.font = "900 " + tp + "px " + S; x.lineJoin = "round"; x.lineWidth = 6 * u; x.strokeStyle = "rgba(0,0,0,.85)"; x.strokeText(tg, W / 2, y - tp * .7); x.fillStyle = acc || "#FFE600"; x.fillText(tg, W / 2, y - tp * .7); }
    x.restore(); }

  // ===== 剪法：句子 → 片段和新的字幕時間 =====
  function timeline(lines, edit, durs) {
    var by = {}; lines.forEach(function (L) { var k = L.src || 0; (by[k] = by[k] || []).push(L); });
    var segs = [];
    Object.keys(by).map(Number).sort(function (a, b) { return a - b; }).forEach(function (src) {
      var arr = by[src].slice().sort(function (a, b) { return a.s - b.s; }), D = durs[src] || (arr.length ? arr[arr.length - 1].e + 1 : 0), part = [];
      if (edit.trimGaps) arr.forEach(function (L) { if (!L.cut) part.push([Math.max(0, L.s - PAD), Math.min(D, L.e + PAD)]); });
      else { var cur = 0; arr.forEach(function (L) { if (L.cut) { if (L.s > cur) part.push([cur, L.s]); cur = Math.max(cur, L.e); } }); if (D > cur) part.push([cur, D]); }
      part.sort(function (a, b) { return a[0] - b[0]; });
      var m = []; part.forEach(function (p) { if (m.length && p[0] - m[m.length - 1][1] < 0.25) m[m.length - 1][1] = Math.max(m[m.length - 1][1], p[1]); else m.push(p.slice()); });
      m.forEach(function (p) { if (p[1] - p[0] > 0.05) segs.push({ src: src, s: p[0], e: p[1] }); });
    });
    if (edit.hook) { var hk = lines.filter(function (L) { return L.star && !L.cut; }).slice(0, 2).map(function (L) { return { src: L.src || 0, s: Math.max(0, L.s - PAD), e: L.e + PAD, hook: true }; }); segs = hk.concat(segs); }
    var out = 0, outLines = [];
    segs.forEach(function (g) { g.out = out;
      lines.forEach(function (L) { if (L.cut || (L.src || 0) !== g.src || L.e <= g.s || L.s >= g.e) return; outLines.push({ s: out + Math.max(L.s, g.s) - g.s, e: out + Math.min(L.e, g.e) - g.s, t: L.t, hl: L.hl || [] }); });
      out += g.e - g.s; });
    return { segs: segs, lines: oneLine(outLines), dur: out };
  }
  function durations(job) { return Promise.all((job.files || []).map(function (f) { return signed(f.path, 3600).then(function (u) { return new Promise(function (ok) { var v = document.createElement("video"); v.preload = "metadata"; v.onloadedmetadata = function () { ok(v.duration || 0); }; v.onerror = function () { ok(0); }; v.src = u; }); }, function () { return 0; }); })); }

  // ===== 1. 聽寫（每支素材都打） =====
  async function startStt(job, glossary, onMsg) {
    onMsg = onMsg || function () {}; var files = job.files || []; if (!files.length) throw new Error("找不到影片");
    var st0 = await VAI.client().rpc("ai_job_stt_start", { p_id: job.id }); if (st0.error) throw new Error(st0.error.message);
    var tok = await VAI.token(), all = [], needKey = false;
    for (var k = 0; k < files.length; k++) {
      onMsg("AI 正在聽第 " + (k + 1) + "／" + files.length + " 支、打字幕，大約 10～60 秒…");
      var url = await signed(files[k].path, 3600);
      var r = await fetch(VAI.API + "/api/stt", { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + tok }, body: JSON.stringify({ url: url, glossary: glossary || "" }) });
      var j = await r.json().catch(function () { return { ok: false, why: "連線失敗" }; });
      if (!j.ok) { if (j.why === "need_key") { needKey = true; break; } throw new Error(/[A-Za-z]{12,}/.test(j.why || "") ? "聽寫服務暫時有問題，我們已經收到通知，修好會請你再按一次「重新打字幕」" : (j.why || "聽寫失敗")); }
      (j.lines || []).forEach(function (L) { L.src = k; all.push(L); });
    }
    if (needKey) throw new Error("聽寫服務設定中，我們會盡快幫你把字幕打好，好了會在這裡顯示「待確認字幕」");
    all = oneLine(await toTW(all));
    var s = await VAI.client().rpc("ai_job_lines", { p_id: job.id, p_lines: all, p_action: "stt" }); if (s.error) throw new Error(s.error.message);
    onMsg(all.length ? "字幕打好了，請確認一下，順便決定要剪掉哪些句子。" : "影片裡沒有聽到講話，可以自己加字幕。");
    return all;
  }

  // ===== 2. 確認字幕＋剪法 =====
  // Vic 10/26：預覽只畫字幕，客人選的質感特效和照片要講清楚「出片時會加上」，不然以為沒放進去
  var FXN = { covers: "封面彈出", pip: "畫中畫", bigword: "深藍大字", material: "素材框", featcards: "功能卡輪播", grade: "暖色系列", hang: "吊牌字", chapters: "章節目錄", logo: "品牌 logo" };
  function fxNote(job) { var f = job.fx; if (!f || job.mode !== "cut") return ""; var ef = (f.effects || []).map(function (x) { return FXN[x] || x; }), np = (f.photos || []).length;
    if (!ef.length && !np) return f.auto ? '<p class="note">質感特效：交給我們挑，出片時加上。</p>' : "";
    return '<p class="note" style="border-left:3px solid var(--gold);padding-left:8px">質感特效：' + E(ef.join("、") || "交給我們挑") + (np ? "，你的照片 " + np + " 張會放進" + (ef.length ? "特效" : "功能卡") + "裡" : "") + "。這裡的預覽只看字幕，特效和照片在出片時一起加上。</p>"; }
  // Vic 10/26：聽寫偶爾回簡體字，一律轉成台灣繁體再存（看到簡體字才載入轉換表，平常不多花流量）
  var SIMP = /[们这个说时来会对没为过还后发现开关门问间国东车见长马语学习经书买卖张电话钱样头脑网页选择录丢乐动让应该从现实点热爱觉听写边进认识难验视频软亲]/;
  function loadCC() { return new Promise(function (ok, no) { if (window.OpenCC) return ok(); var sc = document.createElement("script"); sc.src = "/ai/opencc-cn2t.js"; sc.onload = function () { ok(); }; sc.onerror = no; document.head.appendChild(sc); }); }
  async function toTW(lines) { if (!lines.some(function (L) { return SIMP.test(L.t || ""); })) return lines;
    try { await loadCC(); var cv = window.OpenCC.Converter({ from: "cn", to: "tw" }); lines.forEach(function (L) { L.t = cv(L.t || ""); L.hl = (L.hl || []).map(function (h) { return cv(h); }); }); } catch (e) {} return lines; }
  // Vic 10/26：字幕只能一行，放不下就換下一個字幕（照詞切，時間照字數分；跟桌機一樣）
  var WSEG = null; try { WSEG = new Intl.Segmenter("zh-Hant", { granularity: "word" }); } catch (e) {}
  function oneLine(lines, maxc) { maxc = maxc || 12; var out = [];
    lines.forEach(function (L) { var t = String(L.t || "").replace(/\|/g, ""); if (t.length <= maxc) { out.push(Object.assign({}, L, { t: t })); return; }
      var ws = WSEG ? Array.from(WSEG.segment(t)).map(function (x) { return x.segment; }) : t.split(""), n = Math.ceil(t.length / maxc), tg = Math.ceil(t.length / n), ps = [], c = "";
      ws.forEach(function (w) { while (w.length > maxc) { if (c) { ps.push(c); c = ""; } ps.push(w.slice(0, maxc)); w = w.slice(maxc); } if (c && c.length + w.length > Math.min(maxc, tg + 2)) { ps.push(c); c = w; } else c += w; }); if (c) ps.push(c);
      var at = L.s, tot = t.length; ps.forEach(function (pc, i) { var e = i === ps.length - 1 ? L.e : Math.round((at + (L.e - L.s) * pc.length / tot) * 100) / 100; var q = Object.assign({}, L, { t: pc, s: at, e: e, hl: (L.hl || []).filter(function (h) { return h && (pc.indexOf(h) >= 0 || (i === 0 && t.indexOf(h) < 0)); }) }); if (i) delete q.star; out.push(q); at = e; }); });
    return out; }
  function openEditor(box, job, opt) {
    opt = opt || {}; var lines = JSON.parse(JSON.stringify(job.lines || [])), edit = defEdit(job); if (!job.edit && opt.sticky) { edit.sticky = opt.sticky.sticky || ""; edit.stickyPos = opt.sticky.sticky_pos || "tl"; }
    var mod = modOf(job), acc = accentOf(job) || (mod && mod.accent) || "#FF3B30";
    var raf = 0, urls = {}, durs = [], curSrc = -1, pv = null, multi = (job.files || []).length > 1;
    box.innerHTML = '<div class="sed"><div class="sed-v"><div class="sed-stage"><video playsinline controls preload="metadata"></video><canvas width="540" height="960" aria-hidden="true"></canvas></div>' +
      '<div class="bar"><button class="btn sm" type="button" data-pv>▶ 預覽剪完的樣子</button><span class="note" data-len></span></div><p class="note">' + (job.mode !== "subs" ? "你選的剪法：" + E(job.style || "交給 AI 挑") + "。預覽是字幕的大概樣子，成品照這個剪法剪。" : (mod ? "字幕樣子：" + E(mod.name) + "。" : "")) + "按「預覽」會照你的剪法從頭播一次。</p>" + fxNote(job) + "</div>" +
      '<div class="sed-l"><div class="bar"><label class="f" style="flex:1;min-width:180px"><span>上方標題（選填）</span><input type="text" data-title maxlength="40" placeholder="例如：釣蝦兩小時 一隻都沒有" value="' + E(edit.title) + '"></label><label class="f"><span>標題顯示</span><select data-tsec><option value="0"' + (edit.titleSec ? "" : " selected") + '>一直都在</option><option value="3"' + (edit.titleSec == 3 ? " selected" : "") + '>前 3 秒</option><option value="5"' + (edit.titleSec == 5 ? " selected" : "") + '>前 5 秒</option><option value="8"' + (edit.titleSec == 8 ? " selected" : "") + '>前 8 秒</option></select></label><label class="f"><span>標題樣式</span><select data-tsty>' + TSTY.map(function (o) { return '<option value="' + o[0] + '"' + (edit.titleStyle === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select></label><label class="f"><span>字幕大小</span><select data-size>' + [["0.75", "小"], ["0.9", "中"], ["1.1", "大"]].map(function (o) { return '<option value="' + o[0] + '"' + (Math.abs(edit.subSize - +o[0]) < .01 ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select></label></div>' +
      '<div class="bar"><label class="f" style="flex:1;min-width:180px"><span>標題上的小字（選填，要先有上方標題）</span><input type="text" data-tag maxlength="12" placeholder="例如：房間開箱" value="' + E(edit.tag) + '"></label><label class="f"><span>小字大小</span><select data-tagsz>' + [["0.6", "小"], ["0.75", "中"], ["0.9", "大"]].map(function (o) { return '<option value="' + o[0] + '"' + (Math.abs(edit.tagSize - +o[0]) < .01 ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + '</select></label></div>' +
      '<div class="bar"><label class="f" style="flex:1;min-width:180px"><span>常駐文字（整支一直在，選填，會記住下次自動帶入）</span><input type="text" data-sticky maxlength="40" placeholder="例如：IG @niangniang・全館 8 折" value="' + E(edit.sticky) + '"></label><label class="f"><span>位置</span><select data-spos><option value="tl"' + (edit.stickyPos === "tl" ? " selected" : "") + '>左上</option><option value="tr"' + (edit.stickyPos === "tr" ? " selected" : "") + '>右上</option><option value="top"' + (edit.stickyPos === "top" ? " selected" : "") + '>上方中間</option><option value="bottom"' + (edit.stickyPos === "bottom" ? " selected" : "") + '>下方</option></select></label></div>' +
      '<label class="f"><span>這支想剪成怎樣（選填）</span><input type="text" data-dir maxlength="200" placeholder="例如：30 秒內、輕鬆搞笑、最後叫大家留言" value="' + E(edit.direction) + '"></label>' +
      '<div class="bar"><button class="btn sm gh" type="button" data-ai>AI 照這個方向幫我挑</button><label class="note" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-gap' + (edit.trimGaps ? " checked" : "") + '>自動剪掉句子中間的停頓</label><label class="note" style="display:flex;gap:6px;align-items:center"><input type="checkbox" data-hook' + (edit.hook ? " checked" : "") + '>⭐ 重點句放開頭當鉤子</label></div>' +
      '<p class="note">每句可以改字、填重點字（句子裡有的字會上重點色；也可以打一個關鍵詞，有選功能卡、章節目錄就會用它當大字）。按 ✂ 剪掉這句，按 ⭐ 標成重點' + (job.mode !== "subs" ? "，那句畫面歪了、橫倒了就按 ↻ 轉正（每按一次轉 90 度，播放時看得到轉完的樣子）" : "") + '。用空格把一句切成幾塊，大字會照這樣分行。</p><div class="sed-rows"></div>' +
      '<div class="bar"><button class="btn sm gh" type="button" data-add>＋在目前播放的時間加一句</button></div>' +
      '<div class="bar sed-act"><button class="btn sm gh" type="button" data-save>先存起來</button><button class="btn" type="button" data-ok>' + (job.mode === "subs" ? "沒問題，開始出片" : "沒問題，送去剪輯") + '</button></div><p class="msg" data-msg></p></div></div>';
    var vid = box.querySelector("video"), cv = box.querySelector("canvas"), rowsEl = box.querySelector(".sed-rows"), msg = box.querySelector("[data-msg]");
    function turn() { var t = vid.currentTime || 0, r = 0; lines.forEach(function (L) { if ((L.src || 0) === Math.max(0, curSrc) && L.rot && t >= L.s && t < L.e) r = L.rot; }); var tf = r ? "rotate(" + r + "deg)" + (r % 180 ? " scale(" + (vid.videoWidth && vid.videoHeight ? Math.min(vid.videoWidth, vid.videoHeight) / Math.max(vid.videoWidth, vid.videoHeight) : .5625).toFixed(3) + ")" : "") : ""; if (vid.style.transform !== tf) vid.style.transform = tf; }
    vid.addEventListener("timeupdate", turn); vid.addEventListener("seeked", turn);
    function say(t, ok) { msg.textContent = t; msg.className = "msg" + (ok ? " ok" : t ? " err" : ""); }
    async function useSrc(k) { if (curSrc === k) return; curSrc = k; if (!urls[k]) urls[k] = await signed(job.files[k].path, 7200); vid.src = urls[k]; await new Promise(function (ok) { if (vid.readyState >= 1) ok(); else vid.onloadedmetadata = function () { ok(); }; }); }
    useSrc(0).catch(function (e) { say(e.message); });
    durations(job).then(function (d) { durs = d; len(); });
    function toText(t) { return String(t || "").replace(/\|/g, " "); }
    function fromText(t) { return String(t || "").trim().replace(/\s+/g, "|"); }
    function len() { var tl = timeline(clean(true), readEdit(), durs), orig = durs.reduce(function (a, b) { return a + b; }, 0); box.querySelector("[data-len]").textContent = "剪完約 " + tl.dur.toFixed(1) + " 秒" + (orig ? "（原本 " + orig.toFixed(1) + " 秒）" : ""); }
    function readEdit() { return { direction: box.querySelector("[data-dir]").value.trim(), trimGaps: box.querySelector("[data-gap]").checked, hook: box.querySelector("[data-hook]").checked, title: box.querySelector("[data-title]").value.trim(), titleSec: +box.querySelector("[data-tsec]").value, sticky: box.querySelector("[data-sticky]").value.trim(), stickyPos: box.querySelector("[data-spos]").value, titleStyle: box.querySelector("[data-tsty]").value, subSize: +box.querySelector("[data-size]").value, tag: box.querySelector("[data-tag]").value.trim(), tagSize: +box.querySelector("[data-tagsz]").value }; }
    function draw() {
      var lastSrc = -1;
      rowsEl.innerHTML = lines.map(function (L, i) { var hd = ""; if (multi && (L.src || 0) !== lastSrc) { lastSrc = L.src || 0; hd = '<p class="note" style="margin:6px 0 0"><b>第 ' + (lastSrc + 1) + " 支素材</b></p>"; }
        return hd + '<div class="sed-r' + (L.cut ? " cut" : "") + (L.star ? " star" : "") + '"><button class="chip" type="button" data-play="' + i + '" title="從這句開始播">▶ ' + fmt(L.s) + '</button><input type="text" data-t="' + i + '" value="' + E(toText(L.t)) + '" aria-label="第 ' + (i + 1) + ' 句字幕" maxlength="40"><input type="text" data-h="' + i + '" value="' + E((L.hl || []).join(" ")) + '" placeholder="重點字（選填）" aria-label="第 ' + (i + 1) + ' 句重點字" maxlength="20"><span class="sed-b"><button class="chip" type="button" data-star="' + i + '" aria-pressed="' + !!L.star + '" title="標成重點">⭐</button><button class="chip" type="button" data-cut="' + i + '" aria-pressed="' + !!L.cut + '" title="剪掉這句">✂</button>' + (job.mode !== "subs" ? '<button class="chip" type="button" data-rot="' + i + '" aria-pressed="' + !!L.rot + '" title="這句畫面轉正（每按一次轉 90 度）" aria-label="第 ' + (i + 1) + ' 句畫面轉正，目前' + (L.rot ? "轉 " + L.rot + " 度" : "沒轉") + '">↻' + (L.rot ? L.rot + "°" : "") + '</button>' : "") + '</span></div>'; }).join("") || '<p class="note">還沒有字幕，按下面「加一句」自己加。</p>';
      rowsEl.querySelectorAll("[data-t]").forEach(function (inp) { inp.oninput = function () { lines[+inp.dataset.t].t = fromText(inp.value); }; });
      rowsEl.querySelectorAll("[data-h]").forEach(function (inp) { inp.oninput = function () { lines[+inp.dataset.h].hl = inp.value.trim() ? inp.value.trim().split(/\s+/) : []; }; });
      rowsEl.querySelectorAll("[data-play]").forEach(function (b) { b.onclick = async function () { stopPv(); var L = lines[+b.dataset.play]; await useSrc(L.src || 0); vid.currentTime = L.s; vid.play(); }; });
      rowsEl.querySelectorAll("[data-cut]").forEach(function (b) { b.onclick = function () { var L = lines[+b.dataset.cut]; L.cut = !L.cut; if (L.cut) L.star = false; draw(); len(); }; });
      rowsEl.querySelectorAll("[data-rot]").forEach(function (b) { b.onclick = function () { var L = lines[+b.dataset.rot]; L.rot = ((L.rot || 0) + 90) % 360; if (!L.rot) delete L.rot; draw(); turn(); }; });
      rowsEl.querySelectorAll("[data-star]").forEach(function (b) { b.onclick = function () { var L = lines[+b.dataset.star]; L.star = !L.star; if (L.star) L.cut = false; draw(); len(); }; });
      len(); }
    draw();
    box.querySelector("[data-gap]").onchange = len; box.querySelector("[data-hook]").onchange = len;
    box.querySelector("[data-add]").onclick = function () { var t = vid.currentTime || 0, src = Math.max(0, curSrc), k = 0; while (k < lines.length && ((lines[k].src || 0) < src || ((lines[k].src || 0) === src && lines[k].s < t))) k++; var nx = lines[k] && (lines[k].src || 0) === src ? lines[k].s : t + 2; lines.splice(k, 0, { s: Math.round(t * 100) / 100, e: Math.round(Math.max(t + .5, Math.min(nx, t + 2)) * 100) / 100, t: "", hl: [], src: src }); draw(); var inp = rowsEl.querySelector('[data-t="' + k + '"]'); if (inp) inp.focus(); };
    box.querySelector("[data-ai]").onclick = async function () { var b = this; b.disabled = true; say("AI 正在照你的方向挑句子…", true);
      try { var tok = await VAI.token(), r = await fetch(VAI.API + "/api/plan", { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + tok }, body: JSON.stringify({ direction: readEdit().direction, lines: lines.map(function (L) { return { s: L.s, e: L.e, t: L.t }; }) }) }), j = await r.json();
        if (!j.ok) throw new Error(j.why || "AI 忙線中");
        lines.forEach(function (L, i) { L.cut = j.cut.indexOf(i) >= 0; L.star = j.star.indexOf(i) >= 0; }); draw(); say("AI 挑好了" + (j.why ? "：" + j.why : "") + "。不滿意可以自己再按 ✂ ⭐ 調整。", true);
      } catch (e) { say(e.message); } b.disabled = false; };
    function clean(keepCut) { return lines.filter(function (L) { return L.t.replace(/\|/g, "").trim() && (keepCut || true); }).map(function (L) { var p = L.t.replace(/\|/g, ""), o = { s: L.s, e: L.e, t: L.t, hl: (L.hl || []).filter(function (h) { return h && String(h).trim(); }), src: L.src || 0 }; if (L.cut) o.cut = true; if (L.star) o.star = true; if (L.rot) o.rot = L.rot; return o; }); }
    // 預覽剪完的樣子
    function stopPv() { if (pv) { pv.stop = true; pv = null; vid.pause(); box.querySelector("[data-pv]").textContent = "▶ 預覽剪完的樣子"; } }
    box.querySelector("[data-pv]").onclick = async function () { if (pv) return stopPv(); var tl = timeline(clean(true), readEdit(), durs); if (!tl.segs.length) return say("全部剪光了，至少留一句");
      pv = { tl: tl, stop: false }; var me = pv; this.textContent = "■ 停止預覽";
      for (var i = 0; i < tl.segs.length && !me.stop; i++) { var g = tl.segs[i]; me.g = g; await useSrc(g.src); vid.currentTime = g.s; await new Promise(function (ok) { vid.onseeked = function () { vid.onseeked = null; ok(); }; }); if (me.stop) break; await vid.play();
        await new Promise(function (ok) { (function chk() { if (me.stop || vid.currentTime >= g.e || vid.ended) return ok(); requestAnimationFrame(chk); })(); }); }
      if (!me.stop) stopPv(); };
    box.querySelector("[data-save]").onclick = async function () { var c = VAI.client(), r = await c.rpc("ai_job_lines", { p_id: job.id, p_lines: clean(true), p_action: "save" }); if (!r.error) r = await c.rpc("ai_job_edit", { p_id: job.id, p_edit: readEdit() }); r.error ? say(r.error.message) : say("存好了，之後回來可以繼續改。", true); };
    box.querySelector("[data-ok]").onclick = async function () { var b = this, c = VAI.client(); b.disabled = true; say(""); stopPv();
      var L2 = clean(true), ed = readEdit(); if (!L2.some(function (L) { return !L.cut; }) && L2.length) { b.disabled = false; return say("全部剪光了，至少留一句"); }
      var r = await c.rpc("ai_job_edit", { p_id: job.id, p_edit: ed }); if (!r.error) r = await c.rpc("ai_job_lines", { p_id: job.id, p_lines: L2, p_action: "confirm" });
      if (r.error) { b.disabled = false; return say(r.error.message); }
      cancelAnimationFrame(raf); vid.pause(); job.lines = L2; job.edit = ed; job.status = job.mode === "subs" ? "rendering" : "queued";
      if (opt.onConfirm) opt.onConfirm(job); };
    // 即時字幕預覽：預覽中照剪完的時間軸，平常照原影片
    (function loop() { var x = cv.getContext("2d"); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height);
      if (mod) { var t, ls; if (pv && pv.g) { t = pv.g.out + (vid.currentTime - pv.g.s); ls = pv.tl.lines; } else { t = vid.currentTime || 0; ls = clean(true).filter(function (L) { return !L.cut && L.src === Math.max(0, curSrc); }); }
        var ed0 = readEdit(), o0 = SUBFX.size(ed0.subSize); x.save(); mod.draw(x, cv.width, cv.height, { t: t, lines: ls, accent: acc, bg: false }); x.restore(); SUBFX.size(o0); drawTitle(x, cv.width, cv.height, pv && pv.g ? t : (vid.currentTime || 0), ed0, mod, acc); drawSticky(x, cv.width, cv.height, ed0); }
      raf = requestAnimationFrame(loop); })();
    return { close: function () { stopPv(); cancelAnimationFrame(raf); try { vid.pause(); } catch (e) {} } };
  }

  // ===== 3. 出片（只上字幕）：照剪法播一次、錄一次 =====
  function pickMime() { var c = ["video/mp4;codecs=avc1.640028,mp4a.40.2", "video/mp4;codecs=avc1,mp4a", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"]; for (var i = 0; i < c.length; i++) if (window.MediaRecorder && MediaRecorder.isTypeSupported(c[i])) return c[i]; return ""; }
  function trialMark(x, W, H) { x.save(); var h = 56; x.fillStyle = "rgba(0,0,0,.55)"; x.fillRect(0, H - h - 150, W, h); x.fillStyle = "#fff"; x.font = "700 28px \"Noto Sans TC\",sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("維拓 AI 剪片・免費試用版", W / 2, H - 150 - h / 2); x.restore(); }
async function render(job, onProg) {
    onProg = onProg || function () {};
    var mod = modOf(job), acc = accentOf(job) || mod.accent, mime = pickMime();
    if (!mime) throw new Error("這個瀏覽器不能出片，請改用電腦或手機的 Chrome、Safari");
    var W = 1080, H = 1920, cv = document.createElement("canvas"); cv.width = W; cv.height = H; var x = cv.getContext("2d");
    var vids = [], durs = [], ac = null, dst = null;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); dst = ac.createMediaStreamDestination(); } catch (e) {}
    for (var k = 0; k < (job.files || []).length; k++) {
      var v = document.createElement("video"); v.crossOrigin = "anonymous"; v.playsInline = true; v.preload = "auto"; v.src = await signed(job.files[k].path, 7200);
      await new Promise(function (ok, no) { v.onloadedmetadata = ok; v.onerror = function () { no(new Error("影片讀不到，請重新整理再試一次")); }; });
      if (ac) { try { ac.createMediaElementSource(v).connect(dst); } catch (e) { v.muted = true; } } else v.muted = true;
      vids.push(v); durs.push(v.duration || 0);
    }
    var ED = defEdit(job), tl = (job.lines && job.lines.length) ? timeline(job.lines, ED, durs) : { segs: vids.map(function (v, i) { return { src: i, s: 0, e: durs[i] }; }), lines: [], dur: 0 };
    if (!job.lines || !job.lines.length) { var o = 0; tl.segs.forEach(function (g) { g.out = o; o += g.e - g.s; }); tl.dur = o; }
    var stream = cv.captureStream(30); if (dst) dst.stream.getAudioTracks().forEach(function (t) { stream.addTrack(t); });
    var rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 10000000, audioBitsPerSecond: 160000 }), chunks = [], started = false;
    rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    var canBlur = "filter" in x;
    function frame(v, g) { var vw = v.videoWidth, vh = v.videoHeight, fit = Math.min(W / vw, H / vh), cover = Math.max(W / vw, H / vh);
      x.fillStyle = "#000"; x.fillRect(0, 0, W, H);
      if (fit < cover - .001) { x.save(); if (canBlur) x.filter = "blur(40px) brightness(.7)"; x.drawImage(v, (W - vw * cover) / 2, (H - vh * cover) / 2, vw * cover, vh * cover); x.restore(); }
      x.drawImage(v, (W - vw * fit) / 2, (H - vh * fit) / 2, vw * fit, vh * fit);
      var t = g.out + Math.max(0, v.currentTime - g.s); var o1 = SUBFX.size(ED.subSize); x.save(); mod.draw(x, W, H, { t: t, lines: tl.lines, accent: acc, bg: false }); x.restore(); SUBFX.size(o1); drawTitle(x, W, H, t, ED, mod, acc); drawSticky(x, W, H, ED); if (job.trial) trialMark(x, W, H);
      onProg(Math.min(.99, t / (tl.dur || 1))); }
    var done = new Promise(function (ok) { rec.onstop = ok; });
    if (ac && ac.state === "suspended") await ac.resume();
    for (var i = 0; i < tl.segs.length; i++) { var g = tl.segs[i], vv = vids[g.src];
      vv.currentTime = g.s; await new Promise(function (ok) { vv.onseeked = function () { vv.onseeked = null; ok(); }; });
      frame(vv, g); if (!started) { rec.start(1000); started = true; } else rec.resume();
      await vv.play();
      await new Promise(function (ok) { var tick = function () { frame(vv, g); if (vv.ended || vv.currentTime >= g.e) return ok(); if (vv.requestVideoFrameCallback) vv.requestVideoFrameCallback(tick); else requestAnimationFrame(tick); }; tick(); });
      vv.pause(); rec.pause(); }
    rec.resume(); rec.stop(); await done; try { ac && ac.close(); } catch (e) {}
    var type = mime.split(";")[0], blob = new Blob(chunks, { type: type }), ext = type === "video/mp4" ? "mp4" : "webm";
    onProg(1, "上傳成品中…");
    var c = VAI.client(), uid = (await c.auth.getUser()).data.user.id, path = uid + "/results/sub_" + job.id + "_" + Date.now() + "." + ext;
    var up = await c.storage.from("ai-videos").upload(path, blob, { contentType: type }); if (up.error) throw new Error("上傳失敗：" + up.error.message);
    var r = await c.rpc("ai_job_rendered", { p_id: job.id, p_path: path }); if (r.error) throw new Error(r.error.message);
    return { blob: blob, ext: ext, path: path };
  }
  function srt(lines) { function ts(t) { var h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = Math.floor(t % 60), ms = Math.round((t - Math.floor(t)) * 1000); return [h, m, s].map(function (n) { return String(n).padStart(2, "0"); }).join(":") + "," + String(ms).padStart(3, "0"); }
    return (lines || []).filter(function (L) { return !L.cut; }).map(function (L, i) { return (i + 1) + "\n" + ts(L.s) + " --> " + ts(L.e) + "\n" + String(L.t).replace(/\|/g, " ") + "\n"; }).join("\n"); }
  // 給剪輯團隊看的剪輯指示
  function plan(job) { var ed = defEdit(job), out = ["#" + job.id + " 剪輯指示", "方向：" + (ed.direction || "（沒寫）"), "字幕大小：" + ({ 0.75: "小", 0.9: "中", 1.1: "大" }[ed.subSize] || ed.subSize) + "，標題樣式：" + (TSTY.filter(function (o) { return o[0] === ed.titleStyle; })[0] || ["", "自動"])[1], "標題：" + (ed.title || "（沒有）") + "（" + (ed.title ? (ed.titleSec ? "前 " + ed.titleSec + " 秒" : "一直都在") : "") + "）", "常駐文字：" + (ed.sticky ? ed.sticky + "（" + { tl: "左上", tr: "右上", top: "上方中間", bottom: "下方" }[ed.stickyPos] + "，整支都在）" : "（沒有）"), "自動剪停頓：" + (ed.trimGaps ? "要" : "不要") + "　重點句放開頭：" + (ed.hook ? "要" : "不要"), "", "⭐＝重點　✂＝剪掉", ""];
    (job.lines || []).forEach(function (L) { out.push((L.star ? "⭐ " : L.cut ? "✂ " : "   ") + "素材" + ((L.src || 0) + 1) + " " + fmt(L.s) + "-" + fmt(L.e) + "　" + String(L.t).replace(/\|/g, " ")); });
    return out.join("\n"); }
  window.SUBJOB = { CUTMAP: CUTMAP, startStt: startStt, openEditor: openEditor, render: render, srt: srt, plan: plan, timeline: timeline };
})();
