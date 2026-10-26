/* 維拓 AI 工具共用：會員登入、方案與價格、開通狀態、管理員面板。三個頁面（/ai-tools、/ai-design、/ai-video）共用 */
(function () {
  "use strict";
  var SB_URL = "https://cswhroimywfyokxxogis.supabase.co", SB_KEY = "sb_publishable_vNNC0f5QzxX7uUl2hqvKhA_WSXIhwiY";
  var API = "https://victormoney.vercel.app";
  // ===== 價格與方案（之後改價錢只改這裡）=====
  var PRICE = {
    design: { name: "AI 美編", unit: "件商品", plans: [
      { id: "basic", n: "入門", p: 999, q: "每月 <b>30</b> 件商品", f: ["服飾 10 個基本模組；一般商品、美妝、3C、食品各 12～13 個（白底封面、賣點大標、使用步驟、包裝內容物、常見問題…）", "簡約風格", "一鍵去背（素色背景的照片效果最好）", "AI 寫商品名稱、描述、Hashtag", "16 種品牌色＋自訂，logo 可上傳圖片或直接打字", "一鍵存整組圖＋文案"] },
      { id: "pro", n: "專業", p: 2499, hot: 1, q: "每月 <b>150</b> 件商品", f: ["服飾 30 個模組，含試穿身高體重、布料指標、三種穿搭、尺碼推薦、洗滌方式…", "一般商品、美妝、3C、食品各 15～16 個，含比較表、好評框、檢驗認證、使用前後對比", "促銷模組：第二件折扣、多件組合價、新品上市、現貨 24H 出貨", "雜誌風封面", "入門方案的功能全部都有", "每月 1 號新增 1～5 款新模組"] },
      { id: "max", n: "旗艦", p: 4999, q: "商品數 <b>不限</b>", f: ["全部模組都能用：服飾 30 款，一般商品、美妝、3C、食品各 17～18 款", "每個行業都能換簡約、韓系、街頭三種風格", "質感黑金封面、倒數限時搶購", "每月 20 張 AI 模特兒／情境圖（由維拓團隊製作，3 個工作天交圖）", "專業方案的功能全部都有", "新模組搶先一個月用"] },
      { id: "ent", n: "企業組", p: 0, q: "模組 <b>不限</b>", f: ["旗艦全部", "多品牌、多帳號一起用", "量身做專屬模組", "專人對接"] }] },
    video: { name: "AI 剪片", unit: "支影片", plans: [
      { id: "basic", n: "入門", p: 999, q: "每月 <b>15</b> 支", f: ["每支成品 60 秒內", "3 種剪法：爆點跳字、三段式知識框、直播帶貨", "AI 先打字幕給你確認：改錯字、✂ 剪掉句子、⭐ 重點放開頭、自動剪停頓", "每句話都有字幕：剪好再聽一遍，漏掉的自動補上", "3 種質感特效：暖色系列、章節目錄、品牌 logo", "標題（可設顯示幾秒）、常駐文字、logo", "字幕專區 8 種字幕模組，網頁直接出 1080p 成品", "原創配樂，不用擔心版權", "出片後可再改 1 次"] },
      { id: "pro", n: "專業", p: 2999, hot: 1, q: "每月 <b>80</b> 支", f: ["每支成品 90 秒內", "全部 12 種剪法，含多人對話切鏡、倒敘懸念、金句電影字卡", "全部 9 種質感特效：封面彈出、畫中畫、深藍大字、素材框、功能卡輪播、吊牌字、暖色系列、章節目錄、品牌 logo", "上傳自己的照片放進特效（封面彈出、畫中畫、素材框、功能卡輪播），一次最多 12 張", "橫拍轉直式、多人對話上下分割", "字幕專區全部 23 種字幕模組", "出片後可再改 3 次", "可加購 AI 換人（自己或朋友授權的照片）", "入門方案的功能全部都有", "每月 1 號新增 1～5 種新剪法"] },
      { id: "max", n: "旗艦", p: 4999, q: "每月 <b>150</b> 支", f: ["每支成品 3 分鐘內", "每月 30 支 AI 配音（給文字稿，幫你配好聲音）", "優先處理：排隊時先剪你的", "修改次數不限", "專業方案的功能全部都有", "新剪法搶先一個月用"] },
      { id: "ent", n: "企業組", p: 0, q: "支數 <b>不限</b>", f: ["旗艦全部", "多品牌、多帳號一起用", "專屬剪法、片頭片尾", "專人對接"] }] },
    bundle: [{ n: "入門組", p: 1699, was: 1998, d: "AI 美編入門＋AI 剪片入門" }, { n: "專業組", p: 3999, was: 5498, d: "AI 美編專業＋AI 剪片專業", hot: 1 }, { n: "旗艦組", p: 7999, was: 9998, d: "AI 美編旗艦＋AI 剪片旗艦" }],
    year: "年繳：付 10 個月，用 12 個月",
    addons: [["AI 美編加 50 件商品", "399 元"], ["AI 模特兒／情境圖", "每張 29 元"], ["AI 剪片加 10 支", "499 元"], ["AI 配音", "每支 39 元"], ["AI 換人 15 秒內（專業方案以上）", "每支 499 元"], ["AI 換人 30 秒內", "每支 899 元"], ["AI 換人 60 秒內", "每支 1,599 元"], ["AI 換人 3 支包（每支 15 秒內）", "1,299 元"], ["急件優先處理", "每支 49 元"], ["多國語字幕", "每支 29 元"]],
    setup: [["品牌風格包代設定（logo、品牌色、常用模組）", "一次 1,990 元"], ["品牌片頭片尾設定", "一次 1,990 元"]],
    service: ["交給維拓做（員工用同一套工具幫你做圖、剪片）", "每月 9,800 元起"]
  };
  var LINE_ID = "@898biiyu";
  var GOOGLE_ON = true;
  var sb = null, me = null, listeners = [];
  // Vic 10/24：Google 登入回來網址變成「#member#access_token=…」讀不到，先修成「#access_token=…」
  try { var hh = location.hash; if (/#[^#]*#.*access_token=/.test(hh)) history.replaceState(null, "", location.pathname + location.search + "#" + hh.split("#").pop()); } catch (e) {}
  function backUrl(back) { var i = back.indexOf("#"); if (i >= 0) { try { sessionStorage.setItem("vai-jump", back.slice(i + 1)); } catch (e) {} back = back.slice(0, i); } return location.origin + back; }
  // Vic 10/25：AI 工具、剪片單、AI 客服都嵌進官網 /admin 後台，嵌入時不顯示自己的選單和頁尾
  var EMBED = /[?&]embed=1/.test(location.search) && window.parent !== window;
  if (EMBED) { document.documentElement.classList.add("vai-embed");
    var lastH = 0, post = function () { var hh = document.documentElement.scrollHeight; if (Math.abs(hh - lastH) > 4) { lastH = hh; try { window.parent.postMessage({ vaiH: hh, path: location.pathname }, location.origin); } catch (e) {} } };
    setInterval(post, 700); window.addEventListener("load", post); }
  var TOOL = /ai-video/.test(location.pathname) ? "video" : /ai-design/.test(location.pathname) ? "design" : null;
  function memberMode(m) {
    var root = document.documentElement, on = !!(m && m.login && (m.admin || (TOOL ? /^(active|trial)$/.test((m[TOOL] || {}).status) : (/^(active|trial)$/.test((m.video || {}).status) || /^(active|trial)$/.test((m.design || {}).status)))));
    root.classList.toggle("vai-login", !!(m && m.login)); root.classList.toggle("vai-in", on); root.classList.toggle("vai-tool", !!TOOL);
    if (TOOL) { var mem = document.getElementById("member");
      if (mem && on && !document.getElementById("vaiAll")) { var b = document.createElement("div"); b.className = "vai-bar"; b.innerHTML = '<span>會員工作區</span><button type="button" id="vaiAll">看方案、加購和功能介紹</button>'; mem.insertBefore(b, mem.firstChild);
        b.querySelector("button").onclick = function () { var all = root.classList.toggle("vai-all"); this.textContent = all ? "收起介紹，只看工作區" : "看方案、加購和功能介紹"; }; }
      if (on && !root.classList.contains("vai-all") && !location.hash) window.scrollTo(0, 0); }
    var nm = document.getElementById("navMem"); if (nm) nm.textContent = m && m.login ? "會員區" : "會員登入";
    var bar = document.getElementById("vaiTop");
    if (bar) { bar.hidden = !(m && m.login); if (m && m.login) bar.querySelector("[data-email]").textContent = m.email || ""; }
    var j = null; try { j = sessionStorage.getItem("vai-jump"); } catch (e) {}
    if (j && m && m.login) { try { sessionStorage.removeItem("vai-jump"); } catch (e) {} if (!on) { var t = document.getElementById(j); if (t) setTimeout(function () { t.scrollIntoView(); }, 300); } }
  }
  function E(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function client() { if (!sb && window.supabase) sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, detectSessionInUrl: true } }); return sb; }
  async function refresh() {
    var c = client(); if (!c) return null;
    var s = (await c.auth.getSession()).data.session;
    if (!s) { me = { login: false }; } else { c.rpc("ai_tool_touch").then(function () {}, function () {}); var r = await c.rpc("ai_tool_me"); me = r.error ? { login: true, err: r.error.message } : r.data; }
    try { memberMode(me); } catch (e) {}
    listeners.forEach(function (f) { try { f(me); } catch (e) {} });
    return me;
  }
  function onMe(f) { listeners.push(f); if (me) f(me); }
  async function token() { var s = (await client().auth.getSession()).data.session; return s ? s.access_token : ""; }
  function planCards(tool, opt) {
    opt = opt || {};
    return PRICE[tool].plans.map(function (p) {
      return '<div class="plan' + (p.hot ? " hot" : "") + '">' + (p.hot ? '<span class="bd">最多人選</span>' : "") + "<h3>" + p.n + '</h3><div class="p">' + (p.p ? p.p.toLocaleString() + "<small> 元／月</small>" : '<span class="pq">專案報價</span>') + '</div><div class="q">' + p.q + "</div><ul>" + p.f.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>" +
        (opt.buy ? '<button class="btn' + (p.hot ? "" : " gh") + '" type="button" data-buy="' + tool + ":" + p.id + '">' + (p.p ? "選" + p.n : "聯絡我們") + "</button>" : '<a class="btn' + (p.hot ? "" : " gh") + '" href="' + (opt.href || "#") + '">' + (p.p ? "選" + p.n : "聯絡我們") + "</a>") + "</div>";
    }).join("");
  }
  function extras() {
    return '<div class="extras"><div class="ex"><h4>美編＋剪片 組合包</h4>' + PRICE.bundle.map(function (b) { return '<div class="row' + (b.hot ? " hot" : "") + '"><span><b>' + b.n + "</b>" + b.d + '</span><em><s>' + b.was.toLocaleString() + "</s> " + b.p.toLocaleString() + " 元／月</em></div>"; }).join("") + '</div>' +
      '<div class="ex"><h4>年繳更划算</h4><p>' + PRICE.year + '，所有方案、組合包都適用。</p><h4 style="margin-top:14px">加購（用超過再買）</h4>' + PRICE.addons.map(function (a) { return '<div class="row"><span>' + a[0] + "</span><em>" + a[1] + "</em></div>"; }).join("") + "</div>" +
      '<div class="ex"><h4>選購設定</h4>' + PRICE.setup.map(function (a) { return '<div class="row"><span>' + a[0] + "</span><em>" + a[1] + "</em></div>"; }).join("") + '<h4 style="margin-top:14px">懶得自己做？</h4><div class="row"><span>' + PRICE.service[0] + "</span><em>" + PRICE.service[1] + "</em></div></div></div>";
  }
  // 剪片工作的質感特效和照片（ai_video_jobs.fx，格式見 supabase/migrations/20261026_ai_video_fx.sql）
  var FXN = { covers: "封面彈出", pip: "畫中畫", bigword: "深藍大字", material: "素材框", featcards: "功能卡輪播", grade: "暖色系列", hang: "吊牌字", chapters: "章節目錄", logo: "品牌 logo", auto: "交給啾咪" };
  function fxInfo(x) { var f = x.fx; if (!f || x.mode !== "cut") return "";
    var ef = (f.effects || []).map(function (k) { return FXN[k] || k; }).join("、");
    return '<div class="note">質感特效：' + E(ef || "沒指定") + (f.auto ? "（其餘交給啾咪挑）" : "") + "</div>" + ((f.photos || []).length ? '<div class="bar">' + f.photos.map(function (p, i) { return '<button class="btn gh" data-dl="' + E(p.path) + '">特效照片 ' + (i + 1) + "（" + E(FXN[p.use] || "交給啾咪") + "）</button>"; }).join("") + "</div>" : ""); }
  // ===== 登入框 =====
  function authBox(el, back) {
    el.innerHTML = '<div class="auth"><h3>登入會員</h3><p class="note">第一次用？' + (GOOGLE_ON ? "用 Google 登入" : "輸入信箱") + '就會自動建立帳號。</p>' +
      (GOOGLE_ON ? '<button class="btn gbtn" type="button" id="auG"><svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>用 Google 帳號登入</button><p class="note" style="margin-top:4px">或用信箱：</p>' : "") +
      '<label class="f"><span>電子信箱</span><input type="email" id="auEmail" autocomplete="email" placeholder="you@example.com"></label>' +
      '<div class="bar"><button class="btn" type="button" id="auOtp">寄登入連結到信箱</button><button class="btn gh" type="button" id="auPwT">用密碼登入</button></div>' +
      '<div id="auPw" hidden><label class="f"><span>密碼</span><input type="password" id="auPass" autocomplete="current-password"></label><div class="bar"><button class="btn" type="button" id="auIn">登入</button><button class="btn gh" type="button" id="auUp">用這組信箱密碼註冊</button></div></div>' +
      '<p class="msg" id="auMsg" role="status"></p></div>';
    var m = el.querySelector("#auMsg"), em = function () { return el.querySelector("#auEmail").value.trim(); };
    var say = function (t, ok) { m.textContent = t; m.className = "msg" + (ok ? " ok" : " err"); };
    el.querySelector("#auPwT").onclick = function () { el.querySelector("#auPw").hidden = false; };
    if (GOOGLE_ON) el.querySelector("#auG").onclick = async function () { this.disabled = true; var r = await client().auth.signInWithOAuth({ provider: "google", options: { redirectTo: backUrl(back), queryParams: { prompt: "select_account" } } }); if (r.error) { this.disabled = false; say("Google 登入失敗：" + r.error.message); } };
    el.querySelector("#auOtp").onclick = async function () {
      if (!/.+@.+\..+/.test(em())) return say("請先輸入正確的信箱");
      this.disabled = true; var r = await client().auth.signInWithOtp({ email: em(), options: { emailRedirectTo: location.origin + back } }); this.disabled = false;
      r.error ? say("寄送失敗：" + r.error.message) : say("登入連結寄出了，請到信箱點連結，會自動回到這一頁。", true);
    };
    el.querySelector("#auIn").onclick = async function () {
      var r = await client().auth.signInWithPassword({ email: em(), password: el.querySelector("#auPass").value });
      r.error ? say(r.error.message === "Invalid login credentials" ? "信箱或密碼不對" : r.error.message) : (say("登入成功", true), refresh());
    };
    el.querySelector("#auUp").onclick = async function () {
      var pw = el.querySelector("#auPass").value; if (pw.length < 8) return say("密碼至少 8 個字");
      var r = await client().auth.signUp({ email: em(), password: pw, options: { emailRedirectTo: backUrl(back) } });
      r.error ? say(r.error.message) : r.data.session ? (say("註冊成功", true), refresh()) : say("註冊成功，請到信箱點確認連結。", true);
    };
  }
  // ===== 開通（綠界串好之前，先送出申請、管理員手動開通）=====
  async function request(tool, plan, billing) {
    var r = await client().rpc("ai_tool_request", { p_tool: tool, p_plan: plan, p_billing: billing || "month" });
    if (r.error) throw new Error(r.error.message);
    await refresh(); return r.data;
  }
  // ===== 管理員面板 =====
  async function adminPanel(el, tool) {
    var c = client();
    async function draw() {
      var r = await c.rpc("ai_tool_admin_list"); if (r.error) { el.innerHTML = '<p class="msg err">' + E(r.error.message) + "</p>"; return; }
      var rows = (r.data || []).filter(function (x) { return x.tool === tool; });
      var jobs = [];
      if (tool === "video") { var j = await c.rpc("ai_video_admin_list"); jobs = j.data || []; }
      el.innerHTML = '<div class="adm"><h3>管理員：' + PRICE[tool].name + ' 會員開通</h3><p class="note"><a href="/ai-admin">打開完整後台（全部會員、訂閱、用量）→</a></p>' + (rows.length ? rows.map(function (x) {
        var plan = PRICE[tool].plans.filter(function (p) { return p.id === x.plan; })[0];
        return '<details class="acc"><summary><b>' + E(x.email) + "</b><span>" + (plan ? plan.n : x.plan) + "・" + (x.billing === "year" ? "年繳" : "月繳") + "・" + { pending: "待開通", active: "使用中", cancelled: "已停用" }[x.status] + (x.period_end ? "・到 " + x.period_end : "") + '</span></summary><div class="bar"><button class="btn" data-a="' + E(x.email) + '" data-m="' + (x.billing === "year" ? 12 : 1) + '">收到款，開通' + (x.billing === "year" ? " 12 個月" : " 1 個月") + '</button><button class="btn gh" data-c="' + E(x.email) + '">停用</button></div></details>';
      }).join("") : '<p class="note">還沒有人申請。</p>') +
        (tool === "video" ? "<h3 style=\"margin-top:18px\">剪片工作</h3><p class=\"note\">出片規則：不加畫面晃動、閃白、故障這類特效（剪片室把「特效」勾掉），只做剪接、字幕、配樂；不加音效、不震動、不推近放大（Vic 10/25 定）。客人勾的「質感特效」（effects.py）和照片照工作上的 fx 做，沒勾就交給啾咪挑；剪完一定跑 subcheck 確認每句話都有字幕。</p>" + (jobs.length ? jobs.map(function (x) {
          return '<details class="acc"><summary><b>#' + x.id + " " + E(x.email) + "</b><span>" + (x.plan === "max" || x.plan === "ent" ? "⚡旗艦優先・" : "") + (x.mode === "subs" ? "只上字幕・" + E(((window.SUBFX && SUBFX.list.filter(function (q) { return q.id === x.module; })[0]) || { name: x.module || "" }).name) : E(x.style || "")) + (x.swap && x.swap.photos ? "・AI 換人" : "") + (x.trial ? "・🎁免費試用（60 秒內、片尾加試用浮水印）" : "") + (x.done_at ? "・" + (x.purged_at ? "檔案已刪" : "保存到 " + new Date(new Date(x.done_at).getTime() + 3 * 864e5).toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })) : "") + "・" + ({ stt: "等 AI 聽寫", review: "客人確認字幕中", rendering: "客人出片中", queued: "排隊中", working: "剪輯中", done: "完成", error: "有問題" }[x.status] || x.status) + '</span></summary><div class="note">' + E(x.note || "沒有備註") + '</div>' + (x.swap ? '<div class="note">AI 換人：' + E(x.swap.who || "") + "，同意聲明 " + E(String(x.swap.consent_at || "").slice(0, 16).replace("T", " ")) + '</div><div class="bar">' + (x.swap.photos || []).map(function (p, i) { return '<button class="btn gh" data-dl="' + E(p) + '">換人照片 ' + (i + 1) + "</button>"; }).join("") + (x.swap.proof ? '<button class="btn gh" data-dl="' + E(x.swap.proof) + '">授權截圖</button>' : "") + "</div>" : "") + fxInfo(x) + '<div class="bar" data-files="' + E(JSON.stringify(x.files)) + '">' + (x.files || []).map(function (f, i) { return '<button class="btn gh" data-dl="' + E(f.path) + '">下載素材 ' + (i + 1) + "</button>"; }).join("") + (x.logo ? '<button class="btn gh" data-dl="' + E(x.logo) + '">下載 logo</button>' : "") + (x.lines && x.lines.length ? '<button class="btn gh" data-srtid="' + x.id + '">下載客人確認的字幕</button><button class="btn gh" data-planid="' + x.id + '">下載剪輯指示</button>' : "") + '</div>' + (x.status === "stt" ? '<p class="note">客人的字幕還在等 AI 聽寫。</p>' : "") + '<div class="bar"><button class="btn gh" data-w="' + x.id + '">標記剪輯中</button><label class="btn">上傳成品並完成<input type="file" accept="video/*" data-done="' + x.id + '" hidden></label></div></details>';
        }).join("") : '<p class="note">還沒有剪片工作。</p>') : "") + '<p class="msg" id="admMsg"></p></div>';
      var say = function (t, ok) { var m = el.querySelector("#admMsg"); m.textContent = t; m.className = "msg" + (ok ? " ok" : " err"); };
      el.querySelectorAll(".acc").forEach(function (d) { d.addEventListener("toggle", function () { if (d.open) el.querySelectorAll(".acc").forEach(function (x) { if (x !== d) x.open = false; }); }); });
      el.querySelectorAll("[data-a]").forEach(function (b) { b.onclick = async function () { var r = await c.rpc("ai_tool_admin_set", { p_email: b.dataset.a, p_tool: tool, p_status: "active", p_months: +b.dataset.m }); r.error ? say(r.error.message) : (say("已開通", true), draw()); }; });
      el.querySelectorAll("[data-c]").forEach(function (b) { b.onclick = async function () { var r = await c.rpc("ai_tool_admin_set", { p_email: b.dataset.c, p_tool: tool, p_status: "cancelled", p_months: 1 }); r.error ? say(r.error.message) : (say("已停用", true), draw()); }; });
      el.querySelectorAll("[data-dl]").forEach(function (b) { b.onclick = async function () { var r = await c.storage.from("ai-videos").createSignedUrl(b.dataset.dl, 3600, { download: true }); r.error ? say(r.error.message) : (location.href = r.data.signedUrl); }; });
      el.querySelectorAll("[data-planid]").forEach(function (b) { b.onclick = function () { var x = jobs.filter(function (q) { return q.id === +b.dataset.planid; })[0]; if (!x || !window.SUBJOB) return; var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + SUBJOB.plan(x)], { type: "text/plain" })); a.download = "剪輯指示_" + x.id + ".txt"; a.click(); }; });
      el.querySelectorAll("[data-srtid]").forEach(function (b) { b.onclick = function () { var x = jobs.filter(function (q) { return q.id === +b.dataset.srtid; })[0]; if (!x || !window.SUBJOB) return; var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["\ufeff" + SUBJOB.srt(x.lines)], { type: "text/plain" })); a.download = "字幕_" + x.id + ".srt"; a.click(); }; });
      el.querySelectorAll("[data-w]").forEach(function (b) { b.onclick = async function () { await c.rpc("ai_video_admin_set", { p_id: +b.dataset.w, p_status: "working" }); draw(); }; });
      el.querySelectorAll("[data-done]").forEach(function (inp) { inp.onchange = async function () { var f = inp.files[0]; if (!f) return; say("上傳成品中…", true);
        var uid = (await c.auth.getUser()).data.user.id, path = uid + "/results/" + inp.dataset.done + "_" + Date.now() + "." + (f.name.split(".").pop() || "mp4");
        var u = await c.storage.from("ai-videos").upload(path, f, { contentType: f.type || "video/mp4" }); if (u.error) return say("上傳失敗：" + u.error.message);
        var r = await c.rpc("ai_video_admin_set", { p_id: +inp.dataset.done, p_status: "done", p_result: { path: path, name: f.name } }); r.error ? say(r.error.message) : (say("已完成，客人可以下載了", true), draw()); }; });
    }
    draw();
  }
  window.VAI = { PRICE: PRICE, E: E, client: client, refresh: refresh, onMe: onMe, token: token, planCards: planCards, extras: extras, authBox: authBox, request: request, adminPanel: adminPanel, API: API, LINE: LINE_ID };
  function boot(n) { if (!window.supabase) return n < 25 ? setTimeout(function () { boot(n + 1); }, 200) : null; client().auth.onAuthStateChange(function () { refresh(); }); refresh(); }
  boot(0);
})();
