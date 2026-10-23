/* AI 美編頁：首屏作品、方案、會員狀態、做圖工作區、管理員面板 */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); }, $$ = function (s) { return [].slice.call(document.querySelectorAll(s)); };
  var E = VAI.E, RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var BIG = document.createElement("canvas"); BIG.width = BIG.height = S;
  var GEN = [["白底封面", 1, cover1], ["賣點大標", 1, cover2], ["細節放大", 1, detail], ["尺寸規格表", 1, sizes], ["顏色一覽", 1, colors], ["情境圖（付費生圖）", 3, scene], ["模特兒手拿（付費生圖）", 3, model], ["使用前後對比", 2, beforeAfter], ["檔期活動圖", 1, event]];
  var TIER = { basic: 1, pro: 2, max: 3, ent: 3 }, TIERN = { 1: "入門", 2: "專業", 3: "旗艦" };
  var logo = null, lpos = "br", ind = "cloth", plan = 3, bill = "month", ai = null, cutImg = null, origImg = null, photos = [];
  var sel = { cloth: [0, 1, 2, 4, 5, 9, 12], gen: [0, 1, 2, 3, 4, 8] };
  function stampLogo(g) { if (!logo) return; var m = Math.min(170 / iw(logo), 110 / ih(logo)), w = iw(logo) * m, h = ih(logo) * m, pad = 18, bw = w + pad * 2, bh = h + pad * 2, x = lpos === "bl" ? 36 : S - 36 - bw, y = lpos === "tr" ? 36 : S - 36 - bh;
    g.save(); g.globalAlpha = .92; g.fillStyle = "#fff"; rr(g, x, y, bw, bh, 18); g.fill(); g.globalAlpha = 1; g.drawImage(logo, x + pad, y + pad, w, h); g.restore(); }
  function render(t, img) { var g = BIG.getContext("2d"); g.save(); g.clearRect(0, 0, S, S); t[2](g, img); g.restore(); stampLogo(g); return BIG; }
  function paint(cv, t, img) { var g = cv.getContext("2d"); g.clearRect(0, 0, cv.width, cv.height); g.drawImage(render(t, img), 0, 0, cv.width, cv.height); }
  var list = function () { return ind === "cloth" ? CLOTH : GEN; };
  var imgFor = function () { return ind === "cloth" ? shirtImg() : prod; };
  // 用到的文字資料：AI 寫好就用 AI 的
  function syncData() { var n = $("#pName") ? $("#pName").value.trim() : ""; var pr = $("#pPrice") ? $("#pPrice").value : "";
    if (pr) { CP.price = +pr; P.price = +pr; }
    var head = ai && ai.cover && ai.cover.headline, badges = ai && ai.cover && ai.cover.badges;
    if (head) { CP.head = head; P.head = head; } if (badges && badges.length) { CP.badges = badges; P.badges = badges; }
    if (n) P.name = n; }

  // ===== 首屏拼貼 =====
  var HERO = [[14, "#9a7a3a", "s"], [0, "#9a7a3a", "s"], [23, "#9a7a3a", "k"], [2, "#7d93ab", "s"], [25, "#9a7a3a", "s"], [9, "#8a9a7b", "s"], [5, "#c49a9a", "s"], [12, "#1b1b1b", "s"]], hi = 0;
  function heroPaint(slot, k) { var h = HERO[k % HERO.length], oc = col, os = sty, ol = logo; col = h[1]; sty = h[2]; logo = null;
    paint($$("#vis .pr canvas")[slot], CLOTH[h[0]], shirt("#e9e7e1")); $$("#vis .pr i")[slot].textContent = "No." + String(h[0] + 1).padStart(2, "0") + " " + CLOTH[h[0]][0]; col = oc; sty = os; logo = ol; }
  function heroAll() { [0, 1, 2].forEach(function (i) { heroPaint(i, i); }); }
  function heroSwap() { var slot = hi % 3, el = $$("#vis .pr")[slot]; el.classList.add("fade"); setTimeout(function () { heroPaint(slot, hi + 3); el.classList.remove("fade"); hi++; }, 600); }

  // ===== 方案 =====
  function plans() { $("#planCards").innerHTML = VAI.planCards("design", { buy: 1 }).replace(/元／月/g, bill === "year" ? "元／月（年繳付 10 個月）" : "元／月"); $("#extras").innerHTML = VAI.extras();
    $$("[data-buy]").forEach(function (b) { b.onclick = function () { var id = b.dataset.buy.split(":")[1]; buy(id); }; }); }
  $$("[data-bill]").forEach(function (b) { b.onclick = function () { bill = b.dataset.bill; $$("[data-bill]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); plans(); }; });
  var wantPlan = null; try { wantPlan = JSON.parse(localStorage.getItem("vai-want-design") || "null"); } catch (e) {}
  async function buy(id) { wantPlan = id; try { localStorage.setItem("vai-want-design", JSON.stringify(id)); } catch (e) {} var m = await VAI.refresh(); location.hash = "member"; $("#member").scrollIntoView({ behavior: "smooth" });
    if (m && m.login) { try { localStorage.removeItem("vai-want-design"); } catch (e) {} wantPlan = null; try { await VAI.request("design", id, bill); } catch (e) { alertBox(e.message); } } }
  function alertBox(t) { var b = $("#memBox"); b.insertAdjacentHTML("afterbegin", '<p class="msg err">' + E(t) + "</p>"); }

  // ===== 會員狀態 =====
  var onMeFn = function (me) {
    var who = $("#who"), box = $("#memBox"), work = $("#work");
    if (!me || !me.login) { who.innerHTML = '<a class="btn sm" href="#member">登入會員</a>'; work.hidden = true; $("#admin").innerHTML = ""; VAI.authBox(box, "/ai-design#member"); $("#memSub").textContent = "登入後就能直接在這裡做圖。"; return; }
    who.innerHTML = '<span>' + E(me.email) + '</span><button class="btn sm gh" type="button" id="out">登出</button>';
    $("#out").onclick = async function () { await VAI.client().auth.signOut(); VAI.refresh(); };
    var d = me.design || {};
    if (me.admin) $("#memSub").textContent = "管理員帳號：全部功能免費使用。";
    if (d.status === "active") { box.innerHTML = ""; plan = TIER[d.plan] || 1; work.hidden = false; usage(d); boot(); }
    else {
      work.hidden = true;
      var p = d.plan && VAI.PRICE.design.plans.filter(function (x) { return x.id === d.plan; })[0];
      if (d.status === "pending") box.innerHTML = '<div class="state"><h3>已收到你的申請</h3><p>方案：<b>' + E(p ? p.n : d.plan) + "</b>（" + (d.billing === "year" ? "年繳" : "月繳") + '）</p><p class="note">線上刷卡正在串接中。現在請加官方 LINE <b>' + VAI.LINE + '</b>，傳「AI 美編＋你的信箱」，我們確認付款後馬上幫你開通，開通後重新整理這頁就能用。</p><p class="note">想換方案？到上面「方案」重新選一次就好。</p></div>';
      else if (d.status === "expired") box.innerHTML = '<div class="state"><h3>方案已到期</h3><p class="note">加官方 LINE <b>' + VAI.LINE + '</b> 續約，或到上面「方案」重新選擇。</p></div>';
      else box.innerHTML = '<div class="state"><h3>還沒有開通方案</h3><p class="note">到上面「方案」選一個，送出申請後會告訴你怎麼付款。</p><a class="btn" href="#plans">去選方案</a></div>';
      if (wantPlan && d.status !== "pending" && d.status !== "active") { var w = wantPlan; wantPlan = null; try { localStorage.removeItem("vai-want-design"); } catch (e) {} VAI.request("design", w, bill).catch(function (e) { alertBox(e.message); }); }
    }
    if (me.admin) VAI.adminPanel($("#admin"), "design");
  };
  function usage(d) { var lim = d.limit >= 1000000 ? "不限" : d.limit, pct = d.limit >= 1000000 ? 4 : Math.min(100, d.used / d.limit * 100);
    $("#usage").innerHTML = '<span>本月已做 <b>' + d.used + "</b> 件／" + lim + (d.free ? "（管理員免費）" : "") + '</span><span class="bar2"><i style="width:' + pct + '%"></i></span><span class="note">方案：' + E((VAI.PRICE.design.plans.filter(function (x) { return x.id === d.plan; })[0] || {}).n || "") + (d.period_end ? "，到 " + d.period_end : "") + "</span>"; }

  // ===== 工作區 =====
  var booted = false;
  function boot() { if (booted) { lib(); return; } booted = true; colorsUI(); lib(); bind(); }
  var PAL = [["經典", [["香檳金", "#c8963e"], ["墨黑", "#1b1b1b"], ["海軍藍", "#1f3a5f"], ["酒紅", "#7a1f2b"]]], ["莫蘭迪", [["霧藍", "#7d93ab"], ["灰粉", "#c49a9a"], ["鼠尾草", "#8a9a7b"], ["奶茶", "#a8896c"]]], ["鮮明", [["莓果紅", "#c2185b"], ["珊瑚橘", "#e8664a"], ["寶藍", "#2457d6"], ["薄荷綠", "#1fa38a"]]], ["柔和", [["蜜桃粉", "#e79a8e"], ["薰衣草", "#9b87c5"], ["芥末黃", "#c9a227"], ["森林綠", "#3f5a4a"]]]];
  function colorsUI() { $("#colors").innerHTML = PAL.map(function (g) { return '<div class="cg"><span>' + g[0] + '</span><div class="sws">' + g[1].map(function (c) { return '<button class="sw" type="button" data-c="' + c[1] + '" aria-label="' + c[0] + '" title="' + c[0] + '" aria-pressed="' + (c[1] === col) + '" style="background:' + c[1] + '"></button>'; }).join("") + "</div></div>"; }).join("");
    $("#colors").style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px"; $$("[data-c]").forEach(function (b) { b.onclick = function () { setCol(b.dataset.c); }; }); }
  function setCol(c) { col = c; $("#pick").value = c; $$("[data-c]").forEach(function (x) { x.setAttribute("aria-pressed", String(x.dataset.c === c)); }); lib(); }
  function lib() { syncData(); var L = list(), s = sel[ind], ok = function (i) { return L[i][1] <= plan; };
    $("#sum").innerHTML = "你的方案可用到「" + TIERN[plan] + "」模組・已選 <b>" + s.filter(ok).length + "</b> 張";
    $("#lib").innerHTML = L.map(function (t, i) { var lk = t[1] > plan, on = s.indexOf(i) >= 0 && !lk; return '<div class="tile' + (on ? " sel" : "") + '"><span class="tier">' + TIERN[t[1]] + '</span><canvas width="300" height="300" aria-label="' + t[0] + '"></canvas>' + (lk ? '<div class="lock"><div><b>' + TIERN[t[1]] + "</b>升級方案才能用</div></div>" : "") + '<div class="cap"><b>' + String(i + 1).padStart(2, "0") + " " + t[0] + '</b></div><label class="pick"><input type="checkbox" data-i="' + i + '"' + (on ? " checked" : "") + (lk ? " disabled" : "") + "> 放進這組</label></div>"; }).join("");
    var img = imgFor(); $$("#lib canvas").forEach(function (c, i) { paint(c, L[i], img); });
    $$("#lib [data-i]").forEach(function (c) { c.onchange = function () { var i = +c.dataset.i, a = sel[ind], k = a.indexOf(i); if (c.checked && k < 0) a.push(i); if (!c.checked && k >= 0) a.splice(k, 1); lib(); }; });
    $("#styRow").hidden = ind !== "cloth"; var sl = plan < 3; $$("[data-sty]").forEach(function (b) { b.disabled = sl && b.dataset.sty !== "s"; }); $("#styNote").textContent = sl ? "韓系、街頭是旗艦方案的風格" : "";
    phone(); }
  var slide = 0;
  function chosen() { var L = list(); return sel[ind].slice().sort(function (a, b) { return a - b; }).filter(function (i) { return L[i][1] <= plan; }); }
  function phone() { var L = list(), ids = chosen(), img = imgFor(); $("#track").innerHTML = ids.map(function () { return '<canvas width="540" height="540"></canvas>'; }).join("");
    $$("#track canvas").forEach(function (c, k) { paint(c, L[ids[k]], img); }); slide = Math.min(slide, Math.max(0, ids.length - 1)); move();
    var d = ind === "cloth" ? CP : P; $("#pvPr").innerHTML = "<small>$</small>" + d.price; $("#pvT").textContent = (ai && ai.title) || ($("#pName").value.trim()) || (ind === "cloth" ? "涼感棉寬版短T 男女可穿 不透膚 S～XL" : "不鏽鋼真空保溫瓶 500ml 24H 保冰"); }
  function move() { var n = $$("#track canvas").length; $("#track").style.transform = "translateX(" + (-slide * 100) + "%)"; $("#cnt").textContent = n ? (slide + 1) + "/" + n : "0"; }

  // 去背：從四邊往內找跟背景顏色接近的區域，適合單色背景
  function cutout(img) { var w = iw(img), h = ih(img), k = Math.min(1, 640 / Math.max(w, h)), sw = Math.round(w * k), sh = Math.round(h * k);
    var c = document.createElement("canvas"); c.width = sw; c.height = sh; var g = c.getContext("2d"); g.drawImage(img, 0, 0, sw, sh); var d = g.getImageData(0, 0, sw, sh), px = d.data;
    var bg = [0, 0, 0], n = 0; for (var x = 0; x < sw; x++) [0, sh - 1].forEach(function (y) { var i = (y * sw + x) * 4; bg[0] += px[i]; bg[1] += px[i + 1]; bg[2] += px[i + 2]; n++; });
    for (var y = 0; y < sh; y++) [0, sw - 1].forEach(function (x) { var i = (y * sw + x) * 4; bg[0] += px[i]; bg[1] += px[i + 1]; bg[2] += px[i + 2]; n++; }); bg = bg.map(function (v) { return v / n; });
    var tol = 46, seen = new Uint8Array(sw * sh), q = [];
    function near(i) { var p = i * 4; return Math.abs(px[p] - bg[0]) + Math.abs(px[p + 1] - bg[1]) + Math.abs(px[p + 2] - bg[2]) < tol * 2.2; }
    for (x = 0; x < sw; x++) { q.push(x, (sh - 1) * sw + x); } for (y = 0; y < sh; y++) { q.push(y * sw, y * sw + sw - 1); }
    while (q.length) { var i = q.pop(); if (seen[i] || !near(i)) continue; seen[i] = 1; var xx = i % sw, yy = (i / sw) | 0; if (xx > 0) q.push(i - 1); if (xx < sw - 1) q.push(i + 1); if (yy > 0) q.push(i - sw); if (yy < sh - 1) q.push(i + sw); }
    var bgCount = 0; for (i = 0; i < seen.length; i++) bgCount += seen[i]; if (bgCount < sw * sh * .05 || bgCount > sw * sh * .97) return null;
    var m = document.createElement("canvas"); m.width = sw; m.height = sh; var mg = m.getContext("2d"), md = mg.createImageData(sw, sh);
    for (i = 0; i < seen.length; i++) { md.data[i * 4 + 3] = seen[i] ? 0 : 255; } mg.putImageData(md, 0, 0);
    var out = document.createElement("canvas"); out.width = w; out.height = h; var og = out.getContext("2d"); og.drawImage(img, 0, 0); og.globalCompositeOperation = "destination-in"; og.filter = "blur(" + Math.max(1, 1.2 / k) + "px)"; og.drawImage(m, 0, 0, w, h);
    return out; }

  function bind() {
    $("#pick").oninput = function (e) { col = e.target.value; $$("[data-c]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); lib(); };
    $("#auto").onclick = function () { var im = prodUp || imgFor(), c = document.createElement("canvas"); c.width = c.height = 64; var g = c.getContext("2d"); g.drawImage(im, 0, 0, 64, 64); var d = g.getImageData(0, 0, 64, 64).data, bins = {}, best = null, bs = -1;
      for (var i = 0; i < d.length; i += 4) { if (d[i + 3] < 200) continue; var r = d[i], gg = d[i + 1], b = d[i + 2], mx = Math.max(r, gg, b), mn = Math.min(r, gg, b); if ((mx > 235 && mn > 225) || mx < 30) continue; var k = (r >> 5) + "," + (gg >> 5) + "," + (b >> 5); bins[k] = bins[k] || [0, 0, 0, 0]; bins[k][0] += r; bins[k][1] += gg; bins[k][2] += b; bins[k][3]++; }
      Object.keys(bins).forEach(function (k) { var v = bins[k], r = v[0] / v[3], gg = v[1] / v[3], b = v[2] / v[3], sat = Math.max(r, gg, b) - Math.min(r, gg, b), sc = v[3] * (.4 + sat / 255); if (sc > bs) { bs = sc; best = [r, gg, b]; } });
      if (!best) { $("#msg").textContent = "這張照片抓不到明顯的顏色，請直接選一個"; return; } setCol("#" + best.map(function (v) { return Math.round(v * .82).toString(16).padStart(2, "0"); }).join("")); };
    $("#file").onchange = function (e) { var fs = [].slice.call(e.target.files, 0, 2); if (!fs.length) return; photos = fs; var i = new Image(); i.onload = function () { origImg = i; prodUp = i; prod = i; cutImg = null; $("#cut").disabled = false; $("#uncut").hidden = true; $("#msg").textContent = "目前：你的商品照（可以按一鍵去背）"; lib(); }; i.src = URL.createObjectURL(fs[0]); };
    $("#cut").onclick = function () { if (!origImg) return; $("#msg").textContent = "去背中…"; setTimeout(function () { var o = cutout(origImg); if (!o) { $("#msg").textContent = "這張背景太複雜，抓不出商品。換一張背景單純的照片效果最好。"; return; } cutImg = o; prodUp = o; prod = o; $("#uncut").hidden = false; $("#msg").textContent = "已去背"; lib(); }, 30); };
    $("#uncut").onclick = function () { prodUp = origImg; prod = origImg; cutImg = null; $("#uncut").hidden = true; $("#msg").textContent = "已還原背景"; lib(); };
    $("#logoF").onchange = function (e) { var f = e.target.files[0]; if (!f) return; var i = new Image(); i.onload = function () { logo = i; $("#logoPos").hidden = false; $("#logoMsg").textContent = "每張圖都會自動放上 logo"; lib(); }; i.src = URL.createObjectURL(f); };
    $$("[data-lp]").forEach(function (b) { b.onclick = function () { lpos = b.dataset.lp; $$("[data-lp]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); lib(); }; });
    $("#logoX").onclick = function () { logo = null; $("#logoPos").hidden = true; $("#logoF").value = ""; $("#logoMsg").textContent = "沒有也可以"; lib(); };
    $$("[data-ind]").forEach(function (b) { b.onclick = function () { ind = b.dataset.ind; $$("[data-ind]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); lib(); }; });
    $$("[data-sty]").forEach(function (b) { b.onclick = function () { if (b.disabled) return; sty = b.dataset.sty; $$("[data-sty]").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); lib(); }; });
    ["#pName", "#pPrice"].forEach(function (s) { $(s).addEventListener("change", lib); });
    $("#genAI").onclick = genAI;
    $("#dlAll").onclick = dlAll;
    if (!RM) setInterval(function () { var n = $$("#track canvas").length; if (n) { slide = (slide + 1) % n; move(); } }, 2400);
  }
  function small(file) { return new Promise(function (res) { var i = new Image(); i.onload = function () { var k = Math.min(1, 900 / Math.max(i.naturalWidth, i.naturalHeight)), c = document.createElement("canvas"); c.width = Math.round(i.naturalWidth * k); c.height = Math.round(i.naturalHeight * k); var g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(i, 0, 0, c.width, c.height); res(c.toDataURL("image/jpeg", .85)); }; i.onerror = function () { res(null); }; i.src = URL.createObjectURL(file); }); }
  async function genAI() { var m = $("#aiMsg"), b = $("#genAI"); m.className = "msg"; m.textContent = "AI 正在看照片、寫文案，大約 15～40 秒…"; b.disabled = true;
    try { var imgs = (await Promise.all(photos.map(small))).filter(Boolean);
      var r = await fetch(VAI.API + "/api/aicopy", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + (await VAI.token()) }, body: JSON.stringify({ name: $("#pName").value, price: $("#pPrice").value, specs: $("#pSpec").value, notes: $("#pNote").value, tone: $("#pTone").value, images: imgs }) }).then(function (x) { return x.json(); });
      if (!r.ok) throw new Error(r.why || "產生失敗"); ai = r.ai; m.className = "msg ok"; m.textContent = "寫好了，可以直接改"; showAI(); VAI.refresh(); lib();
    } catch (e) { m.className = "msg err"; m.textContent = e.message; } b.disabled = false; }
  function showAI() { var t = (ai.tags || []).join(" ");
    $("#aiOut").innerHTML = '<div class="aiout"><div class="aiblk"><h5>商品名稱<button class="btn sm gh" type="button" data-cp="t">複製</button></h5><input type="text" id="aT" value="' + E(ai.title) + '">' + ((ai.titleAlt || []).length ? '<div class="bar" style="margin-top:6px">' + ai.titleAlt.map(function (x, i) { return '<button class="chip" type="button" data-alt="' + i + '">' + E(x) + "</button>"; }).join("") + "</div>" : "") + '</div><div class="aiblk"><h5>商品描述（含 Hashtag）<button class="btn sm gh" type="button" data-cp="d">複製</button></h5><textarea id="aD">' + E(ai.desc + (t ? "\n\n" + t : "")) + "</textarea></div></div>";
    $$("[data-alt]").forEach(function (b) { b.onclick = function () { var i = +b.dataset.alt, x = ai.titleAlt[i]; ai.titleAlt[i] = $("#aT").value; ai.title = x; showAI(); phone(); }; });
    $("#aT").oninput = function (e) { ai.title = e.target.value; phone(); };
    $$("[data-cp]").forEach(function (b) { b.onclick = function () { var v = b.dataset.cp === "t" ? $("#aT").value : $("#aD").value; (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(function () { b.textContent = "已複製"; setTimeout(function () { b.textContent = "複製"; }, 1400); }, function () { var el = b.dataset.cp === "t" ? $("#aT") : $("#aD"); el.select(); }); }; }); }
  async function dlAll() { var m = $("#dlMsg"), ids = chosen(), L = list(), img = imgFor(); if (!ids.length) { m.textContent = "先勾選至少一張"; return; } if (!window.JSZip) { m.textContent = "打包工具沒載入，重新整理再試"; return; }
    m.textContent = "打包中…"; var z = new JSZip();
    for (var k = 0; k < ids.length; k++) { var cv = render(L[ids[k]], img); var b = await new Promise(function (r) { cv.toBlob(r, "image/jpeg", .92); }); z.file(String(k + 1).padStart(2, "0") + "_" + L[ids[k]][0].replace(/[（）\s／]/g, "") + ".jpg", b); }
    if (ai) z.file("商品文案.txt", "商品名稱：\n" + ($("#aT") ? $("#aT").value : ai.title) + "\n\n商品描述：\n" + ($("#aD") ? $("#aD").value : ai.desc));
    var blob = await z.generateAsync({ type: "blob" }), a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "AI美編_" + (($("#pName").value || "商品").replace(/[\\/:*?"<>|\s]+/g, "_").slice(0, 20)) + ".zip"; document.body.appendChild(a); a.click(); a.remove(); m.textContent = "已存 " + ids.length + " 張" + (ai ? "＋文案" : ""); }

  prod = sampleProduct(); heroAll(); plans();
  if (!RM) setInterval(heroSwap, 3200);
  (document.fonts && document.fonts.load ? document.fonts.load('900 60px "Noto Sans TC"', "商品圖版型尺寸顏色涼感棉寬版短T") : Promise.resolve()).then(function () { setTimeout(function () { heroAll(); if (booted) lib(); }, 60); });
  VAI.onMe(onMeFn);
})();
