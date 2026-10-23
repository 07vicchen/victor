/* AI 剪片／字幕專區：聽寫 → 客人確認字幕 → 出片
   - 聽寫：victormoney /api/stt（ElevenLabs 聽寫＋Claude 校對）
   - 確認：每句可以改字、改重點字、刪句、加句，旁邊即時預覽字幕樣子
   - 出片（只上字幕）：在客人的瀏覽器裡把字幕畫到影片上錄成新影片，上傳後就能下載 */
(function () {
  "use strict";
  var E = function (s) { return VAI.E(s); };
  function fmt(t) { t = Math.max(0, t || 0); var m = Math.floor(t / 60), s = t - m * 60; return m + ":" + (s < 10 ? "0" : "") + s.toFixed(1); }
  function accentOf(job) { var m = String(job.note || "").match(/#[0-9a-fA-F]{6}/); return m ? m[0] : ""; }
  function modOf(job) { return (window.SUBFX && SUBFX.list.filter(function (q) { return q.id === job.module; })[0]) || (window.SUBFX && SUBFX.list[1]); }
  async function signed(path, sec) { var r = await VAI.client().storage.from("ai-videos").createSignedUrl(path, sec || 3600); if (r.error) throw new Error(r.error.message); return r.data.signedUrl; }

  // ===== 1. 聽寫 =====
  async function startStt(job, glossary, onMsg) {
    onMsg = onMsg || function () {};
    var f = (job.files || [])[0]; if (!f) throw new Error("找不到影片");
    onMsg("AI 正在聽影片、打字幕，大約 10～60 秒…");
    var url = await signed(f.path, 3600), tok = await VAI.token();
    var r = await fetch(VAI.API + "/api/stt", { method: "POST", headers: { "content-type": "application/json", authorization: "Bearer " + tok }, body: JSON.stringify({ url: url, glossary: glossary || "" }) });
    var j = await r.json().catch(function () { return { ok: false, why: "連線失敗" }; });
    if (!j.ok) { if (j.why === "need_key") throw new Error("聽寫服務設定中，我們會盡快幫你把字幕打好，好了會在這裡顯示「待確認字幕」"); throw new Error(j.why || "聽寫失敗"); }
    var s = await VAI.client().rpc("ai_job_lines", { p_id: job.id, p_lines: j.lines || [], p_action: "stt" }); if (s.error) throw new Error(s.error.message);
    onMsg(j.lines && j.lines.length ? "字幕打好了，請確認一下有沒有錯字。" : "影片裡沒有聽到講話，可以自己加字幕。");
    return j.lines || [];
  }

  // ===== 2. 字幕確認 =====
  function openEditor(box, job, opt) {
    opt = opt || {}; var lines = JSON.parse(JSON.stringify(job.lines || [])), mod = modOf(job), acc = accentOf(job) || (mod && mod.accent) || "#FF3B30", raf = 0, vid, cv;
    box.innerHTML = '<div class="sed"><div class="sed-v"><div class="sed-stage"><video playsinline controls preload="metadata"></video><canvas width="540" height="960" aria-hidden="true"></canvas></div><p class="note">右邊改字，這裡會即時顯示字幕的樣子' + (mod ? "（" + E(mod.name) + "）" : "") + "。</p></div>" +
      '<div class="sed-l"><div class="bar"><b>確認字幕</b><span class="note">改好按最下面的確認。用空格把一句切成幾塊，大字會照這樣分行。</span></div><div class="sed-rows"></div>' +
      '<div class="bar"><button class="btn sm gh" type="button" data-add>＋在目前播放的時間加一句</button></div>' +
      '<div class="bar"><button class="btn sm gh" type="button" data-save>先存起來</button><button class="btn" type="button" data-ok>' + (job.mode === "subs" ? "字幕沒問題，開始出片" : "字幕沒問題，送去剪輯") + '</button></div><p class="msg" data-msg></p></div></div>';
    vid = box.querySelector("video"); cv = box.querySelector("canvas");
    signed(job.files[0].path, 7200).then(function (u) { vid.src = u; }).catch(function (e) { say(e.message); });
    var rowsEl = box.querySelector(".sed-rows"), msg = box.querySelector("[data-msg]");
    function say(t, ok) { msg.textContent = t; msg.className = "msg" + (ok ? " ok" : t ? " err" : ""); }
    function toText(t) { return String(t || "").replace(/\|/g, " "); }
    function fromText(t) { return String(t || "").trim().replace(/\s+/g, "|"); }
    function draw() {
      rowsEl.innerHTML = lines.map(function (L, i) { return '<div class="sed-r" data-i="' + i + '"><button class="chip" type="button" data-play="' + i + '" title="從這句開始播">▶ ' + fmt(L.s) + '</button><input type="text" data-t="' + i + '" value="' + E(toText(L.t)) + '" aria-label="第 ' + (i + 1) + ' 句字幕" maxlength="40"><input type="text" data-h="' + i + '" value="' + E((L.hl || []).join(" ")) + '" placeholder="重點字" aria-label="第 ' + (i + 1) + ' 句重點字" maxlength="20"><button class="chip" type="button" data-del="' + i + '" title="刪掉這句">刪</button></div>'; }).join("") || '<p class="note">還沒有字幕，按下面「加一句」自己加。</p>';
      rowsEl.querySelectorAll("[data-t]").forEach(function (inp) { inp.oninput = function () { lines[+inp.dataset.t].t = fromText(inp.value); }; });
      rowsEl.querySelectorAll("[data-h]").forEach(function (inp) { inp.oninput = function () { lines[+inp.dataset.h].hl = inp.value.trim() ? inp.value.trim().split(/\s+/) : []; }; });
      rowsEl.querySelectorAll("[data-play]").forEach(function (b) { b.onclick = function () { vid.currentTime = lines[+b.dataset.play].s; vid.play(); }; });
      rowsEl.querySelectorAll("[data-del]").forEach(function (b) { b.onclick = function () { lines.splice(+b.dataset.del, 1); draw(); }; }); }
    draw();
    box.querySelector("[data-add]").onclick = function () { var t = vid.currentTime || 0, k = 0; while (k < lines.length && lines[k].s < t) k++; var e = lines[k] ? Math.min(lines[k].s, t + 2) : t + 2; lines.splice(k, 0, { s: Math.round(t * 100) / 100, e: Math.round(Math.max(t + .5, e) * 100) / 100, t: "", hl: [] }); draw(); var inp = rowsEl.querySelector('[data-t="' + k + '"]'); if (inp) inp.focus(); };
    function clean() { return lines.filter(function (L) { return L.t.replace(/\|/g, "").trim(); }).map(function (L) { var p = L.t.replace(/\|/g, ""); return { s: L.s, e: L.e, t: L.t, hl: (L.hl || []).filter(function (h) { return p.indexOf(h) >= 0; }) }; }); }
    box.querySelector("[data-save]").onclick = async function () { var r = await VAI.client().rpc("ai_job_lines", { p_id: job.id, p_lines: clean(), p_action: "save" }); r.error ? say(r.error.message) : say("存好了，之後回來可以繼續改。", true); };
    box.querySelector("[data-ok]").onclick = async function () { var b = this; b.disabled = true; say("");
      var r = await VAI.client().rpc("ai_job_lines", { p_id: job.id, p_lines: clean(), p_action: "confirm" });
      if (r.error) { b.disabled = false; return say(r.error.message); }
      cancelAnimationFrame(raf); vid.pause(); job.lines = clean(); job.status = job.mode === "subs" ? "rendering" : "queued";
      if (opt.onConfirm) opt.onConfirm(job); };
    // 即時預覽
    (function loop() { var x = cv.getContext("2d"); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, cv.width, cv.height); if (mod) { x.save(); mod.draw(x, cv.width, cv.height, { t: vid.currentTime || 0, lines: clean(), accent: acc, bg: false }); x.restore(); } raf = requestAnimationFrame(loop); })();
    return { close: function () { cancelAnimationFrame(raf); try { vid.pause(); } catch (e) {} } };
  }

  // ===== 3. 出片（只上字幕）=====
  function pickMime() { var c = ["video/mp4;codecs=avc1.640028,mp4a.40.2", "video/mp4;codecs=avc1,mp4a", "video/mp4", "video/webm;codecs=vp9,opus", "video/webm"]; for (var i = 0; i < c.length; i++) if (window.MediaRecorder && MediaRecorder.isTypeSupported(c[i])) return c[i]; return ""; }
  async function render(job, onProg) {
    onProg = onProg || function () {};
    var mod = modOf(job), acc = accentOf(job) || mod.accent, lines = job.lines || [], mime = pickMime();
    if (!mime) throw new Error("這個瀏覽器不能出片，請改用電腦或手機的 Chrome、Safari");
    var W = 1080, H = 1920, cv = document.createElement("canvas"); cv.width = W; cv.height = H; var x = cv.getContext("2d");
    var v = document.createElement("video"); v.crossOrigin = "anonymous"; v.playsInline = true; v.preload = "auto"; v.src = await signed(job.files[0].path, 7200);
    await new Promise(function (ok, no) { v.onloadedmetadata = ok; v.onerror = function () { no(new Error("影片讀不到，請重新整理再試一次")); }; });
    var stream = cv.captureStream(30), ac = null;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); var src = ac.createMediaElementSource(v), dst = ac.createMediaStreamDestination(); src.connect(dst); dst.stream.getAudioTracks().forEach(function (t) { stream.addTrack(t); }); } catch (e) { v.muted = true; }
    var rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 10000000, audioBitsPerSecond: 160000 }), chunks = [];
    rec.ondataavailable = function (e) { if (e.data && e.data.size) chunks.push(e.data); };
    var vw = v.videoWidth, vh = v.videoHeight, fit = Math.min(W / vw, H / vh), cover = Math.max(W / vw, H / vh), canBlur = "filter" in x;
    function frame() {
      x.fillStyle = "#000"; x.fillRect(0, 0, W, H);
      if (fit < cover - .001) { x.save(); if (canBlur) x.filter = "blur(40px) brightness(.7)"; x.drawImage(v, (W - vw * cover) / 2, (H - vh * cover) / 2, vw * cover, vh * cover); x.restore(); }
      x.drawImage(v, (W - vw * fit) / 2, (H - vh * fit) / 2, vw * fit, vh * fit);
      x.save(); mod.draw(x, W, H, { t: v.currentTime, lines: lines, accent: acc, bg: false }); x.restore();
      onProg(Math.min(.99, v.currentTime / (v.duration || 1)));
    }
    var done = new Promise(function (ok) { rec.onstop = ok; });
    frame(); rec.start(1000); if (ac && ac.state === "suspended") await ac.resume();
    await v.play();
    await new Promise(function (ok) { var tick = function () { frame(); if (v.ended || v.currentTime >= v.duration - .01) return ok(); if (v.requestVideoFrameCallback) v.requestVideoFrameCallback(tick); else requestAnimationFrame(tick); }; v.onended = function () { frame(); ok(); }; tick(); });
    rec.stop(); await done; try { ac && ac.close(); } catch (e) {}
    var type = mime.split(";")[0], blob = new Blob(chunks, { type: type }), ext = type === "video/mp4" ? "mp4" : "webm";
    onProg(1, "上傳成品中…");
    var c = VAI.client(), uid = (await c.auth.getUser()).data.user.id, path = uid + "/results/sub_" + job.id + "_" + Date.now() + "." + ext;
    var up = await c.storage.from("ai-videos").upload(path, blob, { contentType: type }); if (up.error) throw new Error("上傳失敗：" + up.error.message);
    var r = await c.rpc("ai_job_rendered", { p_id: job.id, p_path: path }); if (r.error) throw new Error(r.error.message);
    return { blob: blob, ext: ext, path: path };
  }
  function srt(lines) { function ts(t) { var h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = Math.floor(t % 60), ms = Math.round((t - Math.floor(t)) * 1000); return [h, m, s].map(function (n) { return String(n).padStart(2, "0"); }).join(":") + "," + String(ms).padStart(3, "0"); }
    return (lines || []).map(function (L, i) { return (i + 1) + "\n" + ts(L.s) + " --> " + ts(L.e) + "\n" + String(L.t).replace(/\|/g, " ") + "\n"; }).join("\n"); }
  window.SUBJOB = { startStt: startStt, openEditor: openEditor, render: render, srt: srt };
})();
