/* AI 剪片頁：示範影片、剪法卡、方案、會員上傳素材、我的影片、管理員面板 */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var E = VAI.E, RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DESC = [["口播、老闆講話", "字一次跳 2～4 個，停頓全剪，重點字換色"], ["知識、教學", "上大標題、中畫面、下字幕，換重點跳章節卡"], ["故事、短劇", "先放最精彩那句再倒回去講，電影黑邊"], ["Podcast、多人聊天", "誰講話就變誰的泡泡，左右對話"], ["美業、保養", "柔光、細字，看起來貴"], ["命理、星座", "深色字卡，關鍵字金色大字"], ["療癒、心靈", "筆記卡一字一字寫，重點螢光筆劃過"], ["搞笑、日常", "1.1 倍速，重點大字放大"], ["賣衣服、推產品", "卡拉 OK 字幕，價格大字跳出、限時標籤"], ["科技、時事", "新聞快報條、LIVE、跑馬燈"], ["Podcast、訪談", "誰講話切誰，一來一往上下分割，有名字牌"], ["心靈成長、個人品牌", "電影橫幅畫面，金句切黑底金字卡"], ["顧問、老師、理財", "一句一張卡，黃色大字，左上角編號"]];
  var BASIC = [0, 1, 8];
  var bill = "month", files = [], vlogo = null, pickSt = -1, plan = "basic", mode = "cut", pickMod = "", swWho = "本人", swPhotos = [], swProof = null;
  var savedSticky = null, renderCap = 2, openJob = null, editor = null, busy = {};
  var MODS = window.SUBFX ? SUBFX.list : [], BASIC_MODS = ["pop", "karaoke", "invert", "minimal", "cinema", "marker", "fadeup", "stack"];
  // ===== 質感特效（Vic 10/26）：id 跟剪片引擎 effects.py 的 type 一樣；photo＝可以放客人的照片；basic＝入門方案可用 =====
  var FX = [
    { id: "covers", n: "封面彈出", fit: "新品、作品、系列介紹", d: "一排雜誌封面小卡從上方一張一張浮出來，講者在下面繼續講。放你的照片就變成封面上的圖。", photo: 1, img: "fx_covers_photo", mp4: 1 },
    { id: "pip", n: "畫中畫", fit: "教學示範、前後對比", d: "角落開一個細框小視窗，放截圖或第二段畫面，講者的畫面不動。", photo: 1, img: "fx_pip", mp4: 1 },
    { id: "bigword", n: "深藍大字", fit: "金句、轉折", d: "一兩個字的深藍襯線大字蓋滿畫面，影片從字裡透出來，講到重點時用。", img: "fx_bigword" },
    { id: "material", n: "素材框", fit: "截圖、商品細節", d: "上方滑進一個乾淨的圓角視窗，放你的截圖或商品照；沒放照片就放一句提示。", photo: 1, img: "fx_material_photo" },
    { id: "featcards", n: "功能卡輪播", fit: "服務項目、商品賣點", d: "深藍圓角卡從側邊滑進來，一張換一張，每張卡可以放一張你的照片。", photo: 1, img: "fx_featcards_photo", mp4: 1 },
    { id: "grade", n: "暖色系列", fit: "每一支都適合", d: "整支調成溫暖的底片色，膚色好看、白色不刺眼。", basic: 1, img: "fx_grade" },
    { id: "hang", n: "吊牌字", fit: "重點字、情緒字", d: "一個關鍵字掛在細線上從上面垂下來，輕輕晃一下就停，不會抖。", img: "fx_hang" },
    { id: "chapters", n: "章節目錄", fit: "教學、清單型內容", d: "右側一排小字列出這支片的段落，講到哪一段就亮哪一段，觀眾知道還有什麼沒看。", basic: 1, img: "fx_chapters" },
    { id: "logo", n: "品牌 logo", fit: "有品牌的都建議放", d: "你上傳的 logo 放在角落當浮水印，整支都在。logo 在最下面「特別交代和 logo」上傳，或直接打字。", basic: 1, img: "fx_logo" }];
  var fxOn = [], fxPhotos = [], FXMAX = 12, FXMB = 10;
  function fxName(id) { var f = FX.filter(function (x) { return x.id === id; })[0]; return f ? f.n : "交給我們"; }
  (function fxCards() { var box = $("#fxCards"); if (!box) return;
    box.innerHTML = FX.map(function (f, i) { return '<details class="fxc"><summary><img src="/ai/fx/' + f.img + '.jpg" alt="" width="48" height="85" loading="lazy"><span><em>FX.' + String(i + 1).padStart(2, "0") + (f.basic ? "・入門可用" : "・專業以上") + (f.photo ? "・可放照片" : "") + "</em><b>" + E(f.n) + "</b><small>" + E(f.fit) + '</small></span><i aria-hidden="true">▾</i></summary><div class="fxb" data-fxi="' + i + '"></div></details>'; }).join("");
    var ds = $$("#fxCards details");
    ds.forEach(function (d, i) { d.addEventListener("toggle", function () { var f = FX[i], b = d.querySelector(".fxb");
      if (d.open) { ds.forEach(function (x) { if (x !== d) x.open = false; });
        if (!b.innerHTML) b.innerHTML = (f.mp4 ? '<video src="/ai/fx/' + f.img + '.mp4" poster="/ai/fx/' + f.img + '.jpg" muted loop playsinline preload="none" width="150" height="267" aria-label="' + E(f.n) + ' 示範"></video>' : '<img src="/ai/fx/' + f.img + '.jpg" alt="' + E(f.n) + ' 示範畫面" width="150" height="267" loading="lazy">') + "<div><p>" + E(f.d) + '</p><p class="note">適合：' + E(f.fit) + "。" + (f.basic ? "入門方案以上都能用。" : "專業方案以上可用。") + (f.photo ? "有上傳照片就會用進去。" : "") + "</p><p class=\"note\">示範畫面用的是示範講者。</p></div>";
        var v = b.querySelector("video"); if (v && !RM) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); } }
      else { var vv = b.querySelector("video"); if (vv) vv.pause(); } }); });
  })();
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
    window.__vaiAdmin = !!me.admin; if (me.admin) $("#memSub").textContent = "管理員帳號：全部功能免費使用。"; else if (me.free) $("#memSub").textContent = "免費帳號：全部功能免費使用。";
    TRIAL = d.status === "trial"; TLEFT = d.left || {};
    if (d.status === "active" || TRIAL) { box.innerHTML = TRIAL ? '<div class="state trial"><h3>免費試用中：只上字幕 ' + (TLEFT.subs || 0) + ' 支、完整剪片 ' + (TLEFT.cut || 0) + ' 支</h3><p class="note">試用每次放 1 支影片、60 秒以內，成品角落有「免費試用」浮水印，不含 AI 換人。滿意的話開通方案，浮水印就拿掉。</p><a class="btn sm" href="#plans" onclick="document.documentElement.classList.add(\'vai-all\')">看方案</a></div>' : ""; plan = d.plan; work.hidden = false; usage(d); boot(); jobs(); trialModes(); }
    else { work.hidden = true; var p = d.plan && VAI.PRICE.video.plans.filter(function (x) { return x.id === d.plan; })[0];
      if (d.status === "pending") box.innerHTML = '<div class="state"><h3>已收到你的申請</h3><p>方案：<b>' + E(p ? p.n : d.plan) + "</b>（" + (d.billing === "year" ? "年繳" : "月繳") + '）</p><p class="note">線上刷卡正在串接中。現在請加官方 LINE <b>' + VAI.LINE + '</b>，傳「AI 剪片＋你的信箱」，確認付款後馬上開通，開通後重新整理這頁就能用。</p></div>';
      else if (d.status === "expired") box.innerHTML = '<div class="state"><h3>方案已到期</h3><p class="note">加官方 LINE <b>' + VAI.LINE + "</b> 續約，或到上面「方案」重新選擇。</p></div>";
      else box.innerHTML = '<div class="state"><h3>還沒有開通方案</h3><p class="note">到上面「方案」選一個，送出申請後會告訴你怎麼付款。</p><a class="btn" href="#plans">去選方案</a></div>';
      if (wantPlan && d.status !== "pending" && d.status !== "active") { var w = wantPlan; wantPlan = null; try { localStorage.removeItem("vai-want-video"); } catch (e) {} VAI.request("video", w, bill).catch(function () {}); } }
    if (me.admin) VAI.adminPanel($("#admin"), "video");
  };
  function usage(d) { var lim = d.limit >= 1000000 ? "不限" : d.limit, pct = d.limit >= 1000000 ? 4 : Math.min(100, d.used / d.limit * 100);
    $("#usage").innerHTML = "<span>" + (d.status === "trial" ? "免費試用已交" : "本月已交") + " <b>" + d.used + "</b> 支／" + lim + (d.free ? "（免費帳號）" : "") + '</span><span class="bar2"><i style="width:' + pct + '%"></i></span><span class="note">方案：' + E((VAI.PRICE.video.plans.filter(function (x) { return x.id === d.plan; })[0] || {}).n || "") + (d.period_end ? "，到 " + d.period_end : "") + "</span>"; }
  var booted = false;
  function boot() { var allowAll = plan !== "basic";
    $("#stPick").innerHTML = '<button class="chip" type="button" data-st="-1" aria-pressed="' + (pickSt === -1) + '">交給 AI 挑</button>' + VSTY.map(function (s, i) { var ok = allowAll || BASIC.indexOf(i) >= 0; return '<button class="chip" type="button" data-st="' + i + '" aria-pressed="' + (pickSt === i) + '"' + (ok ? "" : " disabled") + ">" + s[0] + "</button>"; }).join("");
    $("#stNote").textContent = allowAll ? "" : "入門方案可用 3 種剪法，升級專業就能用全部。";
    $$("[data-st]").forEach(function (b) { b.onclick = function () { pickSt = +b.dataset.st; $$("[data-st]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); pvSync(); }; });
    $("#modPick").innerHTML = '<button class="chip" type="button" data-mod="" data-auto="1" aria-pressed="' + (pickMod === "") + '">跟剪法搭配</button>' + MODS.map(function (m) { var ok = allowAll || BASIC_MODS.indexOf(m.id) >= 0; return '<button class="chip" type="button" data-mod="' + m.id + '" aria-pressed="' + (pickMod === m.id) + '"' + (ok ? "" : " disabled") + ">" + E(m.name) + "</button>"; }).join("");
    $$("[data-mod]").forEach(function (b) { b.onclick = function () { pickMod = b.dataset.mod; $$("[data-mod]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); pvSync(); }; });
    $("#acc").oninput = function () { accTouched = true; };
    $$("[data-ratio]").forEach(function (b) { b.onclick = function () { ratio = b.dataset.ratio; $$("[data-ratio]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); }; });
    $$("[data-bty]").forEach(function (b) { b.onclick = function () { bty = b.dataset.bty; $$("[data-bty]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); }; });
    $$("[data-sz]").forEach(function (b) { b.onclick = function () { subSize = b.dataset.sz; $$("[data-sz]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); pvSync(1); }; });
    var swapOk = plan !== "basic" || (window.__vaiAdmin); $("#swapLock").hidden = swapOk; $("#swapBody").hidden = !swapOk;
    fxPick();
    setMode(mode);
    if (booted) return; booted = true;
    $$("[data-mode]").forEach(function (b) { b.onclick = function () { setMode(b.dataset.mode); }; });
    $$("[data-who]").forEach(function (b) { b.onclick = function () { swWho = b.dataset.who; $$("[data-who]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); $("#proofRow").hidden = swWho !== "朋友授權"; }; });
    $("#swPh").onchange = function (e) { swPhotos = [].slice.call(e.target.files, 0, 3); $("#swPhMsg").textContent = swPhotos.length ? "已選 " + swPhotos.length + " 張：" + swPhotos.map(function (f) { return f.name; }).join("、") : "還沒選照片，不換人就不用選"; };
    $("#swProof").onchange = function (e) { swProof = e.target.files[0] || null; $("#swProofMsg").textContent = swProof ? "已選：" + swProof.name : "建議附上，萬一被檢舉才有證據"; };
    $("#vf").onchange = function (e) { var add = [].slice.call(e.target.files); add.forEach(function (f) { if (files.length < 5) files.push(f); }); e.target.value = ""; listFiles(); };
    $("#vLogo").onchange = function (e) { vlogo = e.target.files[0] || null; $("#vLogoMsg").textContent = vlogo ? "已選 logo：" + vlogo.name : "有放的話會放在影片角落"; if (logoImg) URL.revokeObjectURL(logoImg.src); logoImg = null; if (vlogo) { logoImg = new Image(); logoImg.src = URL.createObjectURL(vlogo); } $("#pvm").hidden = !vlogo && !$("#vLogoT").value.trim(); pvSync(1); fxSync(); };
    $$("[data-mus]").forEach(function (b) { b.onclick = function () { $$("[data-mus]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); }; });
    $("#vLogoT").oninput = function () { var t = this.value.trim(); $("#vLogoMsg").textContent = t ? "會把「" + t + "」放在影片右上角，確認字幕時可以改位置" : "有放的話會放在影片角落"; $("#pvm").hidden = !t && !vlogo; pvSync(1); fxSync(); };
    $("#send").onclick = send;
    $("#fxPh").onchange = function (e) { var add = [].slice.call(e.target.files), skip = 0; e.target.value = "";
      add.forEach(function (f) { if (!/^image\//.test(f.type || "image/") || f.size > FXMB * 1048576 || fxPhotos.length >= FXMAX) { skip++; return; } fxPhotos.push({ f: f, use: "auto", url: URL.createObjectURL(f) }); });
      fxList(); if (skip) { $("#fxNote").textContent = "有 " + skip + " 張沒加進來：只收照片、每張 " + FXMB + "MB 以內、最多 " + FXMAX + " 張。"; } };
    VAI.client().from("ai_tool_glossary").select("words,sticky,sticky_pos").maybeSingle().then(function (r) { if (r && r.data) { savedSticky = r.data; if (!$("#vGloss").value) $("#vGloss").value = r.data.words || ""; } }, function () {});
    VAI.client().rpc("ai_render_cap").then(function (r) { if (r && !r.error) renderCap = r.data; }, function () {}); }
  function setMode(m) { mode = m; if (m === "subs" && !pickMod) { var f = $$("[data-mod]").filter(function (x) { return x.dataset.mod && !x.disabled; })[0]; if (f) { pickMod = f.dataset.mod; $$("[data-mod]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === f)); }); } } $$("[data-mode]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.mode === m)); });
    var subs = m === "subs"; $("#cutPanel").hidden = subs; $("#fxPanel").hidden = subs; $("#subNo").textContent = subs ? "2" : "4"; $("#noteNo").textContent = subs ? "3" : "5"; $("#subP").textContent = subs ? "決定字幕長什麼樣子。影片不會被剪，只上字幕。" : "決定字幕長什麼樣子。不選就用剪法配好的那款。"; $("#musRow").hidden = subs; $("#beautyRow").hidden = subs; $("#ratioRow").hidden = subs; $$("[data-auto]").forEach(function (x) { x.hidden = subs; });
    
    $("#stNote").textContent = plan === "basic" ? "入門方案可用 3 種剪法，升級專業就能用全部。" : ""; $("#modNote").textContent = plan === "basic" ? "入門方案可用 8 種字幕樣式，升級專業就能用全部 " + MODS.length + " 種。" : "";
    pvSync(); $("#send").textContent = subs ? "交給 AI 上字幕（用掉 1 支）" : "交給 AI 剪（用掉 1 支）"; }
  // ===== 質感特效挑選＋照片（只有完整剪片用；入門和試用只能用 3 種、不能放照片，伺服器也會再擋一次） =====
  function fxFull() { return plan !== "basic" || !!window.__vaiAdmin; }
  function fxPick() { var full = fxFull();
    fxOn = fxOn.filter(function (id) { return full || FX.filter(function (x) { return x.id === id && x.basic; }).length; });
    $("#fxPick").innerHTML = '<button class="chip" type="button" data-fx="auto" aria-pressed="' + (!fxOn.length) + '">交給我們挑</button>' + FX.map(function (f) { var ok = full || f.basic; return '<button class="chip" type="button" data-fx="' + f.id + '" aria-pressed="' + (fxOn.indexOf(f.id) >= 0) + '"' + (ok ? "" : ' disabled title="專業方案以上可用"') + ">" + E(f.n) + (f.photo && full ? "・可放照片" : "") + "</button>"; }).join("");
    $$("[data-fx]").forEach(function (b) { b.onclick = function () { var id = b.dataset.fx;
      if (id === "auto") fxOn = []; else { var k = fxOn.indexOf(id); if (k >= 0) fxOn.splice(k, 1); else fxOn.push(id); }
      fxSync(); }; });
    $("#fxLock").hidden = full; $("#fxPhBox").hidden = !full; if (!full && fxPhotos.length) { fxPhotos.forEach(function (p) { URL.revokeObjectURL(p.url); }); fxPhotos = []; }
    fxList(); }
  function fxSync() { $$("[data-fx]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.fx === "auto" ? !fxOn.length : fxOn.indexOf(x.dataset.fx) >= 0)); });
    $("#fxSel").innerHTML = fxOn.map(function (id) { var f = FX.filter(function (x) { return x.id === id; })[0]; return '<img src="/ai/fx/' + f.img + '.jpg" alt="' + E(f.n) + '" title="' + E(f.n) + '" width="40" height="71">'; }).join("");
    var used = fxUsed(), extra = used.filter(function (id) { return fxOn.indexOf(id) < 0; });
    $("#fxNote").textContent = (fxOn.length ? "已選 " + fxOn.length + " 種：" + fxOn.map(fxName).join("、") + "。" : "沒指定特效，我們會看內容挑合適的，也可能不加。") + (extra.length ? "照片指定了" + extra.map(fxName).join("、") + "，也會一起用上。" : "") + (fxOn.indexOf("logo") >= 0 && !vlogo && !$("#vLogoT").value.trim() ? "選了品牌 logo，記得在下面上傳 logo 或打字。" : ""); }
  function fxUsed() { var u = []; fxPhotos.forEach(function (p) { if (p.use !== "auto" && u.indexOf(p.use) < 0) u.push(p.use); }); return u; }
  function fxList() { var opts = FX.filter(function (f) { return f.photo; });
    // Vic 10/26：客人看不懂「封面彈出、畫中畫…」是放哪裡，先給一排示意圖，每張照片旁邊也顯示選的位置長怎樣
    var PIMG = {}; FX.forEach(function (f) { if (f.photo) PIMG[f.id] = f.img; });
    var guide = fxPhotos.length ? '<div class="fxguide"><b>照片會放在哪裡？</b><div>' + opts.map(function (f) { return '<figure><img src="/ai/fx/' + PIMG[f.id] + '.jpg" alt="' + E(f.n) + '示意" width="72" height="128" loading="lazy"><figcaption>' + E(f.n) + "</figcaption></figure>"; }).join("") + '</div><p class="note">選「交給我們挑位置」就由我們照內容放，通常放在功能卡輪播。</p></div>' : "";
    $("#fxList").innerHTML = guide + fxPhotos.map(function (p, i) { return '<div class="fxrow"><img src="' + p.url + '" alt="" width="44" height="44"><span title="' + E(p.f.name) + '">' + E(p.f.name) + '</span><img class="fxwhere" data-fxw="' + i + '" alt="" width="36" height="64"' + (PIMG[p.use] ? ' src="/ai/fx/' + PIMG[p.use] + '.jpg"' : " hidden") + '><select data-fxu="' + i + '" aria-label="這張放在哪個特效"><option value="auto"' + (p.use === "auto" ? " selected" : "") + ">交給我們挑位置</option>" + opts.map(function (f) { return '<option value="' + f.id + '"' + (p.use === f.id ? " selected" : "") + ">放在" + E(f.n) + "</option>"; }).join("") + '</select><button class="chip" type="button" data-fxrm="' + i + '">移除</button></div>'; }).join("") + (fxPhotos.length ? '<p class="note">已選 ' + fxPhotos.length + "／" + FXMAX + " 張</p>" : "");
    $$("[data-fxu]").forEach(function (s) { s.onchange = function () { fxPhotos[+s.dataset.fxu].use = s.value; var w = document.querySelector('[data-fxw="' + s.dataset.fxu + '"]'); if (w) { if (PIMG[s.value]) { w.src = "/ai/fx/" + PIMG[s.value] + ".jpg"; w.hidden = false; } else w.hidden = true; } fxSync(); }; });
    $$("[data-fxrm]").forEach(function (b) { b.onclick = function () { var p = fxPhotos.splice(+b.dataset.fxrm, 1)[0]; if (p) URL.revokeObjectURL(p.url); fxList(); }; });
    fxSync(); }
  // ===== 選了馬上預覽（用跟出片一樣的字幕程式畫） =====
  var subSize = "中", bty = "不要", ratio = "9:16", logoImg = null, accTouched = false, pvT0 = performance.now(), pvOn = false;
  function curMod() { var id = pickMod; if (!id && mode !== "subs") id = pickSt >= 0 && window.SUBJOB ? SUBJOB.CUTMAP[VSTY[pickSt][0]] : "pop";
    return MODS.filter(function (q) { return q.id === id; })[0] || MODS[0]; }
  function pvSync(keep) { var c = $("#pv"); if (!c || !MODS.length) return; var m = curMod();
    if (!accTouched && m.accent && m.accent !== "#ffffff") $("#acc").value = m.accent;
    var cut = mode === "subs" ? "不剪，只上字幕" : (pickSt < 0 ? "交給 AI 挑剪法" : "剪法：" + VSTY[pickSt][0]);
    $("#pvCap").innerHTML = "字幕：<b>" + E(m.name) + "</b>" + (!pickMod && mode !== "subs" ? "（剪法配好的）" : "") + "<br>" + E(cut);
    $("#pvCapA").innerHTML = (pickSt < 0 ? "交給 AI 挑：AI 看完影片再決定剪法" : "剪法：<b>" + E(VSTY[pickSt][0]) + "</b>") + "<br>字幕：" + E(m.name);
    if (!keep) pvT0 = performance.now(); if (!pvOn) { pvOn = true; requestAnimationFrame(pvLoop); } }
  function pvLoop(now) { var c = $("#pv"); if (!c || $("#work").hidden) { pvOn = false; return; } var x = c.getContext("2d"), m = curMod(), t = ((now - pvT0) / 1000) % SUBFX.loop;
    var base = mode !== "subs" && pickSt >= 0 ? VSTY[pickSt][3] : { bg: ["#4a4540", "#2a2622"], sub: "word" }; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height);
    var oo = Object.assign({}, base, { __mod: m, __acc: $("#acc").value }), oz = SUBFX.size({ "小": .75, "中": .9, "大": 1.1 }[subSize]); frame(c, oo, RM ? 3 : t); pvLogo(x, c.width, c.height);
    var cA = $("#pvA"); if (cA && !$("#cutPanel").hidden) { frame(cA, oo, RM ? 3 : t); pvLogo(cA.getContext("2d"), cA.width, cA.height); }
    var c2 = $("#pv2"); if (c2 && !$("#pvm").hidden) { frame(c2, oo, RM ? 3 : t); pvLogo(c2.getContext("2d"), c2.width, c2.height); } SUBFX.size(oz);
    if (RM) { pvOn = false; return; } requestAnimationFrame(pvLoop); }
  function pvLogo(x, W, H) { if (logoImg && logoImg.complete && logoImg.naturalWidth) { var k = Math.min(W * .2 / logoImg.naturalWidth, W * .2 / logoImg.naturalHeight); x.save(); x.globalAlpha = .9; x.drawImage(logoImg, W - logoImg.naturalWidth * k - W * .05, H * .04, logoImg.naturalWidth * k, logoImg.naturalHeight * k); x.restore(); return; } var tt = ($("#vLogoT") && $("#vLogoT").value || "").trim(); if (!tt) return; var u = W / 720, px = 28 * u; x.save(); x.font = "800 " + px + "px " + SUBFX.SANS; x.textAlign = "right"; x.textBaseline = "top"; x.lineWidth = 5 * u; x.strokeStyle = "rgba(0,0,0,.55)"; x.strokeText(tt, W - 30 * u, 40 * u); x.fillStyle = "#fff"; x.fillText(tt, W - 30 * u, 40 * u); x.restore(); }
  // Vic 10/24：手機影片常常超過 50MB，改成每支 500MB 內；6MB 以上用續傳（網路斷掉會接著傳，不用重來）
  var MAXMB = 500, TRIAL = false, TLEFT = {};
  function trialModes() { $$("[data-mode]").forEach(function (b) { var k = b.dataset.mode === "subs" ? "subs" : "cut", off = TRIAL && !(TLEFT[k] > 0); b.disabled = off; b.title = off ? "這一種的免費試用用過了" : ""; }); if (TRIAL) { var cur = document.querySelector('[data-mode][aria-pressed="true"]'); if (cur && cur.disabled) { var other = document.querySelector("[data-mode]:not([disabled])"); if (other) other.click(); } } }
  function vidDur(f) { return new Promise(function (ok) { var v = document.createElement("video"); v.preload = "metadata"; v.onloadedmetadata = function () { ok(v.duration || 0); URL.revokeObjectURL(v.src); }; v.onerror = function () { ok(0); }; v.src = URL.createObjectURL(f); }); }
  function loadTus() { return window.tus ? Promise.resolve() : new Promise(function (ok, no) { var s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/tus-js-client@4.1.0/dist/tus.min.js"; s.onload = ok; s.onerror = function () { no(new Error("上傳元件載不進來，重新整理再試一次")); }; document.head.appendChild(s); }); }
  async function bigUpload(c, path, f, prog) {
    if (f.size <= 6 * 1048576) { var r = await c.storage.from("ai-videos").upload(path, f, { contentType: f.type || "video/mp4" }); if (r.error) throw new Error("上傳失敗：" + r.error.message); prog(1); return path; }
    await loadTus(); var tk = await VAI.token();
    var real = path;   // Vic 10/31 #43：接著上次沒傳完的檔案續傳時，檔案存在上次的名字，要記真正的名字
    await new Promise(function (ok, no) {
      var u = new window.tus.Upload(f, { endpoint: "https://cswhroimywfyokxxogis.supabase.co/storage/v1/upload/resumable", retryDelays: [0, 2000, 5000, 10000, 20000],
        headers: { authorization: "Bearer " + tk }, uploadDataDuringCreation: true, removeFingerprintOnSuccess: true, chunkSize: 6 * 1024 * 1024,
        metadata: { bucketName: "ai-videos", objectName: path, contentType: f.type || "video/mp4", cacheControl: "3600" },
        onError: function (e) { var t = String(e && e.message || e); no(new Error(/413|too large|exceeded/i.test(t) ? "影片太大，系統收不下，請剪短一點或用 1080p 重新匯出" : "上傳失敗：" + t.slice(0, 160))); },
        onProgress: function (a, b) { prog(b ? a / b : 0); }, onSuccess: function () { prog(1); ok(); } });
      u.findPreviousUploads().then(function (prev) { var mine = prev.filter(function (x) { return x.metadata && x.metadata.bucketName === "ai-videos" && String(x.metadata.objectName || "").indexOf(path.split("/")[0] + "/") === 0; }); if (mine.length) { u.resumeFromPreviousUpload(mine[0]); real = mine[0].metadata.objectName; } u.start(); });
    });
    return real;
  }
  function listFiles() { $("#flist").innerHTML = files.map(function (f, i) { var big = f.size > MAXMB * 1048576; return "<div><b>" + E(f.name) + "</b><span" + (big ? ' style="color:#b23b2e"' : "") + ">" + (f.size / 1048576).toFixed(1) + " MB" + (big ? "（超過 " + MAXMB + "MB）" : "") + '</span><button class="chip" type="button" data-rm="' + i + '">移除</button></div>' + (/^result_\d+_/i.test(f.name) ? '<p class="msg err" style="margin:2px 0 8px">這支看起來是我們剪好的成品，畫面上已經有字幕了，再剪一次會出現兩層字幕。要重剪請丟原始影片，或在「我的影片」按改字幕重出。</p>' : ""); }).join("");
    $$("[data-rm]").forEach(function (b) { b.onclick = function () { files.splice(+b.dataset.rm, 1); listFiles(); }; }); }
  async function send() { var m = $("#sendMsg"), b = $("#send"), pg = $("#prog");
    if (!files.length) { m.className = "msg err"; m.textContent = "先選至少一支影片"; return; }
    if (files.some(function (f) { return f.size > MAXMB * 1048576; })) { m.className = "msg err"; m.textContent = "有影片超過 " + MAXMB + "MB，請先剪短一點，或用 1080p 重新匯出"; return; }
    if (TRIAL) { if (files.length > 1) { m.className = "msg err"; m.textContent = "免費試用一次放 1 支影片"; return; } var dd = await vidDur(files[0]); if (dd > 61) { m.className = "msg err"; m.textContent = "免費試用的影片要 60 秒以內（這支 " + Math.round(dd) + " 秒），先剪短一點再傳"; return; } }
    if (mode === "subs" && !pickMod) { m.className = "msg err"; m.textContent = "先選一個字幕模組"; return; }
    if (swPhotos.length && !$("#swOk").checked) { m.className = "msg err"; m.textContent = "要換人的話，請先勾選下面的同意聲明"; return; }
    b.disabled = true; pg.hidden = false; m.className = "msg"; var c = VAI.client(), uid = (await c.auth.getUser()).data.user.id, stamp = Date.now(), up = [];
    try {
      for (var i = 0; i < files.length; i++) { m.textContent = "上傳中 " + (i + 1) + "/" + files.length + "…"; pg.firstChild.style.width = (i / files.length * 90) + "%";
        var f = files[i], path = uid + "/" + stamp + "_" + i + "." + ((f.name.split(".").pop() || "mp4").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp4");
        path = await bigUpload(c, path, f, function (q) { pg.firstChild.style.width = ((i + q) / files.length * 90) + "%"; m.textContent = "上傳中 " + (i + 1) + "/" + files.length + "… " + Math.round(q * 100) + "%"; }); up.push({ path: path, name: f.name, size: f.size }); }
      var lp = null; if (vlogo) { lp = uid + "/" + stamp + "_logo." + ((vlogo.name.split(".").pop() || "png").toLowerCase()); var lr = await c.storage.from("ai-videos").upload(lp, vlogo, { contentType: vlogo.type || "image/png" }); if (lr.error) lp = null; }
      var sw = null; if (swPhotos.length) { var ph = []; for (var k = 0; k < swPhotos.length; k++) { m.textContent = "上傳換人照片 " + (k + 1) + "/" + swPhotos.length + "…"; var pp = uid + "/" + stamp + "_face" + k + "." + ((swPhotos[k].name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"); var pr = await c.storage.from("ai-videos").upload(pp, swPhotos[k], { contentType: swPhotos[k].type || "image/jpeg" }); if (pr.error) throw new Error("照片上傳失敗：" + pr.error.message); ph.push(pp); }
        var proof = null; if (swProof && swWho === "朋友授權") { proof = uid + "/" + stamp + "_proof." + ((swProof.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"); var qr = await c.storage.from("ai-videos").upload(proof, swProof, { contentType: swProof.type || "image/jpeg" }); if (qr.error) proof = null; }
        sw = { photos: ph, proof: proof, consent: true, who: swWho }; }
      // 特效照片：跟 logo、換人照片一樣傳到 ai-videos/<自己的 id>/，路徑和指定的特效記在工作的 fx 欄位
      var fx = null; if (mode === "cut") { var fph = [];
        if (fxFull()) for (var q = 0; q < fxPhotos.length; q++) { m.textContent = "上傳特效照片 " + (q + 1) + "/" + fxPhotos.length + "…"; var xf = fxPhotos[q].f, xp = uid + "/" + stamp + "_fx" + q + "." + ((xf.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg"); var xr = await c.storage.from("ai-videos").upload(xp, xf, { contentType: xf.type || "image/jpeg" }); if (xr.error) throw new Error("照片上傳失敗：" + xr.error.message); fph.push({ path: xp, name: xf.name.slice(0, 120), use: fxPhotos[q].use }); }
        var effs = fxOn.slice(); fxUsed().forEach(function (id) { if (effs.indexOf(id) < 0) effs.push(id); });
        fx = { auto: !fxOn.length, effects: effs, photos: fph }; }
      var md = MODS.filter(function (q) { return q.id === pickMod; })[0], st = mode === "subs" ? "只上字幕：" + (md ? md.name : "") : (pickSt < 0 ? "交給 AI 挑" : VSTY[pickSt][0]);
      var mus = ($$("[data-mus]").filter(function (x) { return x.getAttribute("aria-pressed") === "true"; })[0] || {}).dataset; mus = mus ? mus.mus : "原創配樂";
      var note = $("#vNote").value + "（重點字顏色 " + $("#acc").value + "）（字幕大小 " + subSize + "）" + (mode === "subs" ? "" : "（配樂：" + mus + "）" + (bty === "不要" ? "" : "（美顏 " + bty + "）") + (ratio === "16:9" ? "（比例 16:9）" : ""));
      var s = await c.rpc("ai_video_submit3", { p_files: up, p_style: st, p_note: note, p_logo: lp, p_mode: mode, p_module: pickMod || null, p_swap: sw, p_fx: fx }); if (s.error) throw new Error(s.error.message);
      var lt = $("#vLogoT").value.trim(); if (lt) { await c.rpc("ai_job_edit", { p_id: s.data, p_edit: { sticky: lt, stickyPos: "tr" } }); }
      var gl = $("#vGloss").value.trim(); VAI.client().rpc("ai_glossary_set", { p_words: gl }).then(function () {}, function () {});
      var newJob = { id: s.data, files: up, mode: mode, module: mode === "subs" ? pickMod : null, note: note, status: "stt", edit: lt ? { sticky: lt, stickyPos: "tr" } : null };
      openJob = s.data; sttRun(newJob, gl);
      pg.firstChild.style.width = "100%"; m.className = "msg ok"; m.textContent = "送出了！編號 #" + s.data + "，AI 正在打字幕，好了請在下面「我的影片」確認。" + (sw ? "換人的報價會用 LINE 跟你確認。" : ""); files = []; listFiles(); swPhotos = []; swProof = null; $("#swPh").value = ""; $("#swOk").checked = false; $("#swPhMsg").textContent = "還沒選照片，不換人就不用選"; $("#vNote").value = ""; fxPhotos.forEach(function (p) { URL.revokeObjectURL(p.url); }); fxPhotos = []; fxList(); VAI.refresh(); jobs();
    } catch (e) { m.className = "msg err"; m.textContent = e.message; }
    b.disabled = false; setTimeout(function () { pg.hidden = true; pg.firstChild.style.width = "0"; }, 1500); }
  var ST = { stt: "AI 打字幕中", review: "待你確認字幕", rendering: "待出片", queued: "已收到，通常 15 分鐘內交片", working: "剪輯中，快好了", done: "完成", error: "有問題，我們會聯絡你" };
  var JOBS = [];
  async function sttRun(job, gl) { busy[job.id] = "AI 正在聽影片、打字幕…"; jobs(); try { await SUBJOB.startStt(job, gl == null ? $("#vGloss").value.trim() : gl, function (t) { busy[job.id] = t; }); delete busy[job.id]; openJob = job.id; } catch (e) { busy[job.id] = e.message; } jobs(); }
  async function renderRun(job) { busy[job.id] = "出片中 0%…（請不要關掉這頁）"; draw(); try { await SUBJOB.render(job, function (p, t) { busy[job.id] = t || "出片中 " + Math.round(p * 100) + "%…（請不要關掉這頁）"; var el = document.querySelector('[data-busy="' + job.id + '"]'); if (el) el.textContent = busy[job.id]; }); busy[job.id] = "做好了！按「下載成品」存下來。"; } catch (e) { busy[job.id] = "出片失敗：" + e.message; } jobs(); }
  // Vic 10/24：成品和素材保存 3 天
  function keep(j) { if (!j.done_at) return ""; var end = new Date(new Date(j.done_at).getTime() + 3 * 864e5), h = Math.max(0, Math.round((end - Date.now()) / 36e5)); return '<span class="keep' + (h <= 24 ? " soon" : "") + '" style="flex-basis:100%">請在 ' + end.toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) + " 前下載（還有 " + (h >= 24 ? Math.floor(h / 24) + " 天 " + (h % 24) + " 小時" : h + " 小時") + "），過了檔案會自動刪除</span>"; }
  // Vic 10/26：選填的區塊先收起來，按標題才展開；最上面「待你處理」直接列出要確認字幕、可以下載的影片
  $$("[data-fold] .ph").forEach(function (h) { h.onclick = function () { h.parentNode.classList.toggle("fold"); }; });
  function todo() { var t = $("#todo"); if (!t) return; var rows = JOBS.filter(function (j) { return !j.purged_at && (j.status === "review" || j.status === "rendering" || (j.status === "done" && j.result && j.result.path && Date.now() - new Date(j.done_at || 0).getTime() < 864e5)); }).slice(0, 4);
    var wait = JOBS.filter(function (j) { return /^(stt|queued|working)$/.test(j.status); }).length;
    if (!rows.length && !wait) { t.hidden = true; return; } t.hidden = false;
    t.innerHTML = "<b>待你處理</b>" + rows.map(function (j) { var w = j.status === "review" ? "字幕打好了，請確認" : j.status === "rendering" ? "字幕確認好了，按開始出片" : "剪好了，可以下載"; return '<div class="row"><span>#' + j.id + "　" + w + '</span><button class="btn sm" type="button" data-go="' + j.id + '">' + (j.status === "done" ? "去下載" : "去確認") + "</button></div>"; }).join("") + (wait ? '<span class="note">另外有 ' + wait + " 支正在處理中，好了會出現在這裡（不用一直重新整理）。</span>" : "");
    $$("[data-go]").forEach(function (b) { b.onclick = function () { var j = JOBS.filter(function (x) { return x.id === +b.dataset.go; })[0]; if (!j) return; if (j.status === "review" || j.status === "rendering") openEd(j.id); else { var el = document.querySelector('[data-ed="' + j.id + '"]'); if (el) el.parentNode.scrollIntoView({ behavior: "smooth", block: "center" }); } }; }); }
  function draw() { var box = $("#jobs"), c = VAI.client(); todo();
    if (editor) { editor.close(); editor = null; }
    if (!JOBS.length) { box.innerHTML = '<p class="note">還沒有影片。上面選好素材送出就會出現在這裡。</p>'; return; }
    box.innerHTML = JOBS.map(function (j) { var sub = j.mode === "subs", left = Math.max(0, renderCap - (j.renders || 0)), btn = "";
      if (j.status === "stt") btn = '<button class="btn sm gh" type="button" data-stt="' + j.id + '">重新打字幕</button>';
      if (j.status === "review") btn = '<button class="btn sm" type="button" data-edit="' + j.id + '">確認字幕</button>';
      if (j.status === "rendering") btn = '<button class="btn sm gh" type="button" data-edit="' + j.id + '">再看一次字幕</button><button class="btn sm" type="button" data-render="' + j.id + '">開始出片</button>';
      if (j.purged_at || (j.result && j.result.expired)) btn = '<span class="note">已超過 3 天保存期限，檔案已刪除</span>';
      else if (j.status === "done" && j.result && j.result.path) btn = keep(j) + '<button class="btn sm" type="button" data-get="' + E(j.result.path) + '">下載成品</button>' + (sub ? (left > 0 ? '<button class="btn sm gh" type="button" data-edit="' + j.id + '">改字幕再出一次（還可以 ' + (renderCap >= 1000 ? "不限" : left) + " 次）</button>" : '<span class="note">修改次數用完了</span>') : "");
      if (j.lines && j.lines.length) btn += '<button class="btn sm gh" type="button" data-srt="' + j.id + '">下載字幕檔</button>';
      return '<div class="jobw"><div class="job"><span><b>#' + j.id + "</b>　" + E(j.style || "") + "・" + new Date(j.created_at || Date.now()).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) + '</span><span class="s ' + j.status + '">' + (ST[j.status] || j.status) + (j.trial ? "・試用" : "") + "</span>" + btn + (busy[j.id] ? '<span class="note" data-busy="' + j.id + '" style="flex-basis:100%">' + E(busy[j.id]) + "</span>" : "") + '</div><div data-ed="' + j.id + '"></div></div>'; }).join("");
    $$("[data-get]").forEach(function (b) { b.onclick = async function () { var s = await c.storage.from("ai-videos").createSignedUrl(b.dataset.get, 3600, { download: true }); if (!s.error) location.href = s.data.signedUrl; }; });
    $$("[data-stt]").forEach(function (b) { b.onclick = function () { var j = JOBS.filter(function (x) { return x.id === +b.dataset.stt; })[0]; sttRun(j); }; });
    $$("[data-render]").forEach(function (b) { b.onclick = function () { var j = JOBS.filter(function (x) { return x.id === +b.dataset.render; })[0]; renderRun(j); }; });
    $$("[data-srt]").forEach(function (b) { b.onclick = function () { var j = JOBS.filter(function (x) { return x.id === +b.dataset.srt; })[0], a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + SUBJOB.srt(j.lines)], { type: "text/plain" })); a.download = "字幕_" + j.id + ".srt"; a.click(); }; });
    $$("[data-edit]").forEach(function (b) { b.onclick = function () { openEd(+b.dataset.edit); }; });
    if (openJob) { var oj = JOBS.filter(function (x) { return x.id === openJob; })[0]; if (oj && oj.status === "review") openEd(openJob); }
  }
  function openEd(id) { var j = JOBS.filter(function (x) { return x.id === id; })[0]; if (!j) return; if (editor) editor.close(); $$("[data-ed]").forEach(function (d) { d.innerHTML = ""; }); openJob = id;
    var holder = document.querySelector('[data-ed="' + id + '"]'); editor = SUBJOB.openEditor(holder, j, { sticky: savedSticky, onConfirm: function (job) { openJob = null; if (job.mode === "subs") renderRun(job); else { busy[job.id] = "收到！我們開始剪，剪好會顯示「完成」。"; jobs(); } } });
    holder.scrollIntoView({ behavior: "smooth", block: "start" }); }
  async function jobs() { var c = VAI.client(), r = await c.from("ai_video_jobs").select("*").order("id", { ascending: false }).limit(50);
    if (r.error) { $("#jobs").innerHTML = '<p class="msg err">' + E(r.error.message) + "</p>"; return; }
    var editing = editor && openJob && JOBS.some(function (x) { return x.id === openJob && (x.status === "review" || x.status === "rendering" || x.status === "done"); }) && !busy[openJob];
    JOBS = r.data; if (editing && document.querySelector('[data-ed="' + openJob + '"] .sed')) return; draw(); }
  var tick = 0; setInterval(function () { tick++; if ($("#work").hidden || editor) return; var act = JOBS.some(function (j) { return /^(stt|queued|working)$/.test(j.status); }); if (act || tick % 4 === 0) jobs(); }, 15000);   // 有影片在處理就每 15 秒更新一次
  VAI.onMe(onMeFn);
})();
