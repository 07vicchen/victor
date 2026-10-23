/* AI 剪片頁：示範影片、剪法卡、方案、會員上傳素材、我的影片、管理員面板 */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var E = VAI.E, RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DESC = [["口播、老闆講話", "字一次跳 2～4 個，停頓全剪，重點推近"], ["知識、教學", "上大標題、中畫面、下字幕，換重點跳章節卡"], ["故事、短劇", "先放最精彩那句再倒回去講，電影黑邊"], ["Podcast、多人聊天", "誰講話就變誰的泡泡，左右對話"], ["美業、保養", "慢慢推近、柔光、細字，看起來貴"], ["命理、星座", "深色字卡，關鍵字金色大字配鐘聲"], ["療癒、心靈", "筆記卡一字一字寫，重點螢光筆劃過"], ["搞笑、日常", "1.1 倍速，大字彈出畫面震"], ["賣衣服、推產品", "卡拉 OK 字幕，價格大字跳出、限時閃"], ["科技、時事", "新聞快報條、LIVE、故障轉場"]];
  var BASIC = [0, 1, 8];
  var bill = "month", files = [], vlogo = null, pickSt = -1, plan = "basic", mode = "cut", pickMod = "", swWho = "本人", swPhotos = [], swProof = null;
  var renderCap = 2, openJob = null, editor = null, busy = {};
  var MODS = window.SUBFX ? SUBFX.list : [], BASIC_MODS = ["pop", "karaoke", "invert", "minimal", "cinema", "marker", "fadeup", "stack"];
  // ===== 字幕模組示範 =====
  if (MODS.length) {
    $("#mods").innerHTML = MODS.map(function (m, i) { return '<div class="st"><canvas width="270" height="480" aria-label="' + E(m.name) + '"></canvas><div class="cap"><em>SUB.' + String(i + 1).padStart(2, "0") + (BASIC_MODS.indexOf(m.id) >= 0 ? "・入門可用" : "・專業以上") + "</em><b>" + E(m.name) + "</b><span>" + E(m.fit) + "：" + E(m.desc) + "</span></div></div>"; }).join("");
    var mc = $$("#mods canvas"), mvis = new Set(), mio = new IntersectionObserver(function (es) { es.forEach(function (e) { var i = mc.indexOf(e.target); e.isIntersecting ? mvis.add(i) : mvis.delete(i); }); });
    function mdraw(i, t) { var c = mc[i], x = c.getContext("2d"); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height); x.save(); MODS[i].draw(x, c.width, c.height, { t: t % SUBFX.loop, lines: SUBFX.demo, accent: MODS[i].accent, bg: true }); x.restore(); }
    mc.forEach(function (c, i) { mio.observe(c); mdraw(i, 3 + i * .37); });
    var m0 = performance.now(); (function mloop(now) { var t = Math.max(0, (now - m0) / 1000); mvis.forEach(function (i) { mdraw(i, t + i * .37); }); if (!RM) requestAnimationFrame(mloop); })(m0);
  }
  // ===== 示範 =====
  var demos = [[$("#h1v"), VSTY[0][3]], [$("#h2v"), VSTY[4][3]]];
  $("#styles").innerHTML = VSTY.map(function (s, i) { return '<div class="st"><canvas width="270" height="480" aria-label="' + s[0] + '"></canvas><div class="cap"><em>NO.' + String(i + 1).padStart(2, "0") + (BASIC.indexOf(i) >= 0 ? "・入門可用" : "・專業以上") + "</em><b>" + s[0] + "</b><span>" + DESC[i][0] + "：" + DESC[i][1] + "</span></div></div>"; }).join("");
  $$("#styles canvas").forEach(function (c, i) { demos.push([c, VSTY[i][3]]); });
  var vis = new Set(), io = new IntersectionObserver(function (es) { es.forEach(function (e) { var i = demos.findIndex(function (d) { return d[0] === e.target; }); e.isIntersecting ? vis.add(i) : vis.delete(i); }); });
  demos.forEach(function (d, i) { io.observe(d[0]); frame(d[0], d[1], i * .7 + .6); });
  var t0 = performance.now(); function loop(now) { var t = Math.max(0, (now - t0) / 1000); vis.forEach(function (i) { frame(demos[i][0], demos[i][1], t + i * .7); }); if (!RM) requestAnimationFrame(loop); } requestAnimationFrame(loop);
  // ===== 方案 =====
  function plans() { $("#planCards").innerHTML = VAI.planCards("video", { buy: 1 }).replace(/元／月/g, bill === "year" ? "元／月（年繳付 10 個月）" : "元／月"); $("#extras").innerHTML = VAI.extras(); $$("[data-buy]").forEach(function (b) { b.onclick = function () { buy(b.dataset.buy.split(":")[1]); }; }); }
  $$("[data-bill]").forEach(function (b) { b.onclick = function () { bill = b.dataset.bill; $$("[data-bill]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); plans(); }; });
  var wantPlan = null; try { wantPlan = JSON.parse(localStorage.getItem("vai-want-video") || "null"); } catch (e) {}
  async function buy(id) { wantPlan = id; try { localStorage.setItem("vai-want-video", JSON.stringify(id)); } catch (e) {} var m = await VAI.refresh(); $("#member").scrollIntoView({ behavior: "smooth" });
    if (m && m.login) { wantPlan = null; try { localStorage.removeItem("vai-want-video"); } catch (e) {} try { await VAI.request("video", id, bill); } catch (e) { $("#memBox").insertAdjacentHTML("afterbegin", '<p class="msg err">' + E(e.message) + "</p>"); } } }
  plans();
  // ===== 會員 =====
  var onMeFn = function (me) {
    var who = $("#who"), box = $("#memBox"), work = $("#work");
    if (!me || !me.login) { who.innerHTML = '<a class="btn sm" href="#member">登入會員</a>'; work.hidden = true; $("#admin").innerHTML = ""; VAI.authBox(box, "/ai-video#member"); return; }
    who.innerHTML = "<span>" + E(me.email) + '</span><button class="btn sm gh" type="button" id="out">登出</button>'; $("#out").onclick = async function () { await VAI.client().auth.signOut(); VAI.refresh(); };
    var d = me.video || {};
    window.__vaiAdmin = !!me.admin; if (me.admin) $("#memSub").textContent = "管理員帳號：全部功能免費使用。";
    if (d.status === "active") { box.innerHTML = ""; plan = d.plan; work.hidden = false; usage(d); boot(); jobs(); }
    else { work.hidden = true; var p = d.plan && VAI.PRICE.video.plans.filter(function (x) { return x.id === d.plan; })[0];
      if (d.status === "pending") box.innerHTML = '<div class="state"><h3>已收到你的申請</h3><p>方案：<b>' + E(p ? p.n : d.plan) + "</b>（" + (d.billing === "year" ? "年繳" : "月繳") + '）</p><p class="note">線上刷卡正在串接中。現在請加官方 LINE <b>' + VAI.LINE + '</b>，傳「AI 剪片＋你的信箱」，確認付款後馬上開通，開通後重新整理這頁就能用。</p></div>';
      else if (d.status === "expired") box.innerHTML = '<div class="state"><h3>方案已到期</h3><p class="note">加官方 LINE <b>' + VAI.LINE + "</b> 續約，或到上面「方案」重新選擇。</p></div>";
      else box.innerHTML = '<div class="state"><h3>還沒有開通方案</h3><p class="note">到上面「方案」選一個，送出申請後會告訴你怎麼付款。</p><a class="btn" href="#plans">去選方案</a></div>';
      if (wantPlan && d.status !== "pending" && d.status !== "active") { var w = wantPlan; wantPlan = null; try { localStorage.removeItem("vai-want-video"); } catch (e) {} VAI.request("video", w, bill).catch(function () {}); } }
    if (me.admin) VAI.adminPanel($("#admin"), "video");
  };
  function usage(d) { var lim = d.limit >= 1000000 ? "不限" : d.limit, pct = d.limit >= 1000000 ? 4 : Math.min(100, d.used / d.limit * 100);
    $("#usage").innerHTML = "<span>本月已交 <b>" + d.used + "</b> 支／" + lim + (d.free ? "（管理員免費）" : "") + '</span><span class="bar2"><i style="width:' + pct + '%"></i></span><span class="note">方案：' + E((VAI.PRICE.video.plans.filter(function (x) { return x.id === d.plan; })[0] || {}).n || "") + (d.period_end ? "，到 " + d.period_end : "") + "</span>"; }
  var booted = false;
  function boot() { var allowAll = plan !== "basic";
    $("#stPick").innerHTML = '<button class="chip" type="button" data-st="-1" aria-pressed="' + (pickSt === -1) + '">交給 AI 挑</button>' + VSTY.map(function (s, i) { var ok = allowAll || BASIC.indexOf(i) >= 0; return '<button class="chip" type="button" data-st="' + i + '" aria-pressed="' + (pickSt === i) + '"' + (ok ? "" : " disabled") + ">" + s[0] + "</button>"; }).join("");
    $("#stNote").textContent = allowAll ? "" : "入門方案可用 3 種剪法，升級專業就能用全部。";
    $$("[data-st]").forEach(function (b) { b.onclick = function () { pickSt = +b.dataset.st; $$("[data-st]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); }; });
    $("#modPick").innerHTML = MODS.map(function (m) { var ok = allowAll || BASIC_MODS.indexOf(m.id) >= 0; return '<button class="chip" type="button" data-mod="' + m.id + '" aria-pressed="' + (pickMod === m.id) + '"' + (ok ? "" : " disabled") + ">" + E(m.name) + "</button>"; }).join("");
    $$("[data-mod]").forEach(function (b) { b.onclick = function () { pickMod = b.dataset.mod; $$("[data-mod]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); var m = MODS.filter(function (q) { return q.id === pickMod; })[0]; if (m && m.accent && m.accent !== "#ffffff") $("#acc").value = m.accent; }; });
    var swapOk = plan !== "basic" || (window.__vaiAdmin); $("#swapLock").hidden = swapOk; $("#swapBody").hidden = !swapOk;
    setMode(mode);
    if (booted) return; booted = true;
    $$("[data-mode]").forEach(function (b) { b.onclick = function () { setMode(b.dataset.mode); }; });
    $$("[data-who]").forEach(function (b) { b.onclick = function () { swWho = b.dataset.who; $$("[data-who]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); $("#proofRow").hidden = swWho !== "朋友授權"; }; });
    $("#swPh").onchange = function (e) { swPhotos = [].slice.call(e.target.files, 0, 3); $("#swPhMsg").textContent = swPhotos.length ? "已選 " + swPhotos.length + " 張：" + swPhotos.map(function (f) { return f.name; }).join("、") : "還沒選照片，不換人就不用選"; };
    $("#swProof").onchange = function (e) { swProof = e.target.files[0] || null; $("#swProofMsg").textContent = swProof ? "已選：" + swProof.name : "建議附上，萬一被檢舉才有證據"; };
    $("#vf").onchange = function (e) { var add = [].slice.call(e.target.files); add.forEach(function (f) { if (files.length < 5) files.push(f); }); e.target.value = ""; listFiles(); };
    $("#vLogo").onchange = function (e) { vlogo = e.target.files[0] || null; $("#vLogoMsg").textContent = vlogo ? "已選 logo：" + vlogo.name : "有放的話會放在影片角落"; };
    $("#send").onclick = send;
    VAI.client().from("ai_tool_glossary").select("words").maybeSingle().then(function (r) { if (r && r.data && !$("#vGloss").value) $("#vGloss").value = r.data.words || ""; }, function () {});
    VAI.client().rpc("ai_render_cap").then(function (r) { if (r && !r.error) renderCap = r.data; }, function () {}); }
  function setMode(m) { mode = m; $$("[data-mode]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.mode === m)); });
    var subs = m === "subs"; $("#stPick").hidden = subs; $("#modPick").hidden = !subs; $("#accRow").hidden = !subs;
    $("#pickH").textContent = subs ? "選字幕模組" : "選剪法"; $("#pickP").textContent = subs ? "影片不會被剪，只上字幕。上面「字幕專區」可以看每種的樣子。" : "不知道選哪個，就選「交給 AI 挑」。";
    $("#stNote").textContent = plan === "basic" ? (subs ? "入門方案可用 8 種字幕模組，升級專業就能用全部 24 種。" : "入門方案可用 3 種剪法，升級專業就能用全部。") : "";
    $("#send").textContent = subs ? "交給 AI 上字幕（用掉 1 支）" : "交給 AI 剪（用掉 1 支）"; }
  function listFiles() { $("#flist").innerHTML = files.map(function (f, i) { var big = f.size > 500 * 1048576; return "<div><b>" + E(f.name) + "</b><span" + (big ? ' style="color:#b23b2e"' : "") + ">" + (f.size / 1048576).toFixed(1) + " MB" + (big ? "（超過 500MB）" : "") + '</span><button class="chip" type="button" data-rm="' + i + '">移除</button></div>'; }).join("");
    $$("[data-rm]").forEach(function (b) { b.onclick = function () { files.splice(+b.dataset.rm, 1); listFiles(); }; }); }
  async function send() { var m = $("#sendMsg"), b = $("#send"), pg = $("#prog");
    if (!files.length) { m.className = "msg err"; m.textContent = "先選至少一支影片"; return; }
    if (files.some(function (f) { return f.size > 500 * 1048576; })) { m.className = "msg err"; m.textContent = "有影片超過 500MB，請先移除或剪短一點"; return; }
    if (mode === "subs" && files.length > 1) { m.className = "msg err"; m.textContent = "只上字幕一次放 1 支影片就好"; return; }
    if (mode === "subs" && !pickMod) { m.className = "msg err"; m.textContent = "先選一個字幕模組"; return; }
    if (swPhotos.length && !$("#swOk").checked) { m.className = "msg err"; m.textContent = "要換人的話，請先勾選下面的同意聲明"; return; }
    b.disabled = true; pg.hidden = false; m.className = "msg"; var c = VAI.client(), uid = (await c.auth.getUser()).data.user.id, stamp = Date.now(), up = [];
    try {
      for (var i = 0; i < files.length; i++) { m.textContent = "上傳中 " + (i + 1) + "/" + files.length + "…"; pg.firstChild.style.width = (i / files.length * 90) + "%";
        var f = files[i], path = uid + "/" + stamp + "_" + i + "." + ((f.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4");
        var r = await c.storage.from("ai-videos").upload(path, f, { contentType: f.type || "video/mp4" }); if (r.error) throw new Error("上傳失敗：" + r.error.message); up.push({ path: path, name: f.name, size: f.size }); }
      var lp = null; if (vlogo) { lp = uid + "/" + stamp + "_logo." + ((vlogo.name.split(".").pop() || "png").toLowerCase()); var lr = await c.storage.from("ai-videos").upload(lp, vlogo, { contentType: vlogo.type || "image/png" }); if (lr.error) lp = null; }
      var sw = null; if (swPhotos.length) { var ph = []; for (var k = 0; k < swPhotos.length; k++) { m.textContent = "上傳換人照片 " + (k + 1) + "/" + swPhotos.length + "…"; var pp = uid + "/" + stamp + "_face" + k + "." + ((swPhotos[k].name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"); var pr = await c.storage.from("ai-videos").upload(pp, swPhotos[k], { contentType: swPhotos[k].type || "image/jpeg" }); if (pr.error) throw new Error("照片上傳失敗：" + pr.error.message); ph.push(pp); }
        var proof = null; if (swProof && swWho === "朋友授權") { proof = uid + "/" + stamp + "_proof." + ((swProof.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"); var qr = await c.storage.from("ai-videos").upload(proof, swProof, { contentType: swProof.type || "image/jpeg" }); if (qr.error) proof = null; }
        sw = { photos: ph, proof: proof, consent: true, who: swWho }; }
      var md = MODS.filter(function (q) { return q.id === pickMod; })[0], st = mode === "subs" ? "只上字幕：" + (md ? md.name : "") : (pickSt < 0 ? "交給 AI 挑" : VSTY[pickSt][0]);
      var note = $("#vNote").value + (mode === "subs" ? "（重點字顏色 " + $("#acc").value + "）" : "");
      var s = await c.rpc("ai_video_submit2", { p_files: up, p_style: st, p_note: note, p_logo: lp, p_mode: mode, p_module: mode === "subs" ? pickMod : null, p_swap: sw }); if (s.error) throw new Error(s.error.message);
      var gl = $("#vGloss").value.trim(); VAI.client().rpc("ai_glossary_set", { p_words: gl }).then(function () {}, function () {});
      var newJob = { id: s.data, files: up, mode: mode, module: mode === "subs" ? pickMod : null, note: note, status: "stt" };
      openJob = s.data; sttRun(newJob, gl);
      pg.firstChild.style.width = "100%"; m.className = "msg ok"; m.textContent = "送出了！編號 #" + s.data + "，AI 正在打字幕，好了請在下面「我的影片」確認。" + (sw ? "換人的報價會用 LINE 跟你確認。" : ""); files = []; listFiles(); swPhotos = []; swProof = null; $("#swPh").value = ""; $("#swOk").checked = false; $("#swPhMsg").textContent = "還沒選照片，不換人就不用選"; $("#vNote").value = ""; VAI.refresh(); jobs();
    } catch (e) { m.className = "msg err"; m.textContent = e.message; }
    b.disabled = false; setTimeout(function () { pg.hidden = true; pg.firstChild.style.width = "0"; }, 1500); }
  var ST = { stt: "AI 打字幕中", review: "待你確認字幕", rendering: "待出片", queued: "排隊剪輯中", working: "剪輯中", done: "完成", error: "有問題，我們會聯絡你" };
  var JOBS = [];
  async function sttRun(job, gl) { busy[job.id] = "AI 正在聽影片、打字幕…"; jobs(); try { await SUBJOB.startStt(job, gl == null ? $("#vGloss").value.trim() : gl, function (t) { busy[job.id] = t; }); delete busy[job.id]; openJob = job.id; } catch (e) { busy[job.id] = e.message; } jobs(); }
  async function renderRun(job) { busy[job.id] = "出片中 0%…（請不要關掉這頁）"; draw(); try { await SUBJOB.render(job, function (p, t) { busy[job.id] = t || "出片中 " + Math.round(p * 100) + "%…（請不要關掉這頁）"; var el = document.querySelector('[data-busy="' + job.id + '"]'); if (el) el.textContent = busy[job.id]; }); busy[job.id] = "做好了！按「下載成品」存下來。"; } catch (e) { busy[job.id] = "出片失敗：" + e.message; } jobs(); }
  function draw() { var box = $("#jobs"), c = VAI.client();
    if (editor) { editor.close(); editor = null; }
    if (!JOBS.length) { box.innerHTML = '<p class="note">還沒有影片。上面選好素材送出就會出現在這裡。</p>'; return; }
    box.innerHTML = JOBS.map(function (j) { var sub = j.mode === "subs", left = Math.max(0, renderCap - (j.renders || 0)), btn = "";
      if (j.status === "stt") btn = '<button class="btn sm gh" type="button" data-stt="' + j.id + '">重新打字幕</button>';
      if (j.status === "review") btn = '<button class="btn sm" type="button" data-edit="' + j.id + '">確認字幕</button>';
      if (j.status === "rendering") btn = '<button class="btn sm gh" type="button" data-edit="' + j.id + '">再看一次字幕</button><button class="btn sm" type="button" data-render="' + j.id + '">開始出片</button>';
      if (j.status === "done" && j.result && j.result.path) btn = '<button class="btn sm" type="button" data-get="' + E(j.result.path) + '">下載成品</button>' + (sub ? (left > 0 ? '<button class="btn sm gh" type="button" data-edit="' + j.id + '">改字幕再出一次（還可以 ' + (renderCap >= 1000 ? "不限" : left) + " 次）</button>" : '<span class="note">修改次數用完了</span>') : "");
      if (j.lines && j.lines.length) btn += '<button class="btn sm gh" type="button" data-srt="' + j.id + '">下載字幕檔</button>';
      return '<div class="jobw"><div class="job"><span><b>#' + j.id + "</b>　" + E(j.style || "") + "・" + new Date(j.created_at || Date.now()).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) + '</span><span class="s ' + j.status + '">' + (ST[j.status] || j.status) + "</span>" + btn + (busy[j.id] ? '<span class="note" data-busy="' + j.id + '" style="flex-basis:100%">' + E(busy[j.id]) + "</span>" : "") + '</div><div data-ed="' + j.id + '"></div></div>'; }).join("");
    $$("[data-get]").forEach(function (b) { b.onclick = async function () { var s = await c.storage.from("ai-videos").createSignedUrl(b.dataset.get, 3600, { download: true }); if (!s.error) location.href = s.data.signedUrl; }; });
    $$("[data-stt]").forEach(function (b) { b.onclick = function () { var j = JOBS.filter(function (x) { return x.id === +b.dataset.stt; })[0]; sttRun(j); }; });
    $$("[data-render]").forEach(function (b) { b.onclick = function () { var j = JOBS.filter(function (x) { return x.id === +b.dataset.render; })[0]; renderRun(j); }; });
    $$("[data-srt]").forEach(function (b) { b.onclick = function () { var j = JOBS.filter(function (x) { return x.id === +b.dataset.srt; })[0], a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + SUBJOB.srt(j.lines)], { type: "text/plain" })); a.download = "字幕_" + j.id + ".srt"; a.click(); }; });
    $$("[data-edit]").forEach(function (b) { b.onclick = function () { openEd(+b.dataset.edit); }; });
    if (openJob) { var oj = JOBS.filter(function (x) { return x.id === openJob; })[0]; if (oj && oj.status === "review") openEd(openJob); }
  }
  function openEd(id) { var j = JOBS.filter(function (x) { return x.id === id; })[0]; if (!j) return; if (editor) editor.close(); $$("[data-ed]").forEach(function (d) { d.innerHTML = ""; }); openJob = id;
    var holder = document.querySelector('[data-ed="' + id + '"]'); editor = SUBJOB.openEditor(holder, j, { onConfirm: function (job) { openJob = null; if (job.mode === "subs") renderRun(job); else { busy[job.id] = "收到！我們開始剪，剪好會顯示「完成」。"; jobs(); } } });
    holder.scrollIntoView({ behavior: "smooth", block: "start" }); }
  async function jobs() { var c = VAI.client(), r = await c.from("ai_video_jobs").select("id,style,status,result,created_at,files,mode,module,note,lines,renders").order("id", { ascending: false }).limit(50);
    if (r.error) { $("#jobs").innerHTML = '<p class="msg err">' + E(r.error.message) + "</p>"; return; }
    var editing = editor && openJob && JOBS.some(function (x) { return x.id === openJob && (x.status === "review" || x.status === "rendering" || x.status === "done"); }) && !busy[openJob];
    JOBS = r.data; if (editing && document.querySelector('[data-ed="' + openJob + '"] .sed')) return; draw(); }
  setInterval(function () { if (!$("#work").hidden && !editor) jobs(); }, 60000);
  VAI.onMe(onMeFn);
})();
