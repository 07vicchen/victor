'use client';
/* 維拓傳媒官網後台 /admin：登入 → 客人留言、價錢與服務、每頁文字與圖片、聯絡資訊
   資料存在 Supabase web_settings（site_pages、site_catalog、line_id、instagram），圖片傳到 web-media。 */
import React from 'react';
import { createClient } from '@supabase/supabase-js';
import { DEFAULTS } from './Home';

var h = React.createElement, useState = React.useState, useEffect = React.useEffect;
var sb = createClient(DEFAULTS.sb.url, DEFAULTS.sb.key);
var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

var PAGE_NAME = { home: '首頁', works: '作品', demo: '服務示範', quote: '服務與報價', office: 'AI 辦公室', contact: '聯絡我們' };
var SEC_NAME = { herox: '最上面大圖', marquee: '跑馬燈', doors: '入口卡片', bignum: '大數字', reach: '聯絡卡片（LINE、IG）', pagehead: '頁面標題', video: '影片', ipcases: 'IP 作品卡', office: 'AI 辦公室介紹', ofeat: '辦公室功能', ostaff: '員工名單', owhy: '為什麼找我們', msgform: '留言表單', demos: '示範卡片', quote: '報價單文字', contact: '聯絡區', next: '接著看' };
var LABEL = { title: '標題', sub: '副標', desc: '說明', eyebrow: '最上面小字', primary: '按鈕字', note: '小註記', image: '圖片', images: '圖片', en: '英文小字', value: '數字', label: '數字說明', caption: '影片下面小字', src: '影片檔', video: '影片檔', poster: '影片封面圖', name: '名稱', tag: '標籤', plat: '平台', handle: '帳號', url: '連結', stats: '數字', items: '項目', points: '重點', staff: '員工', deps: '部門', text: '文字', btn: '按鈕字', btnSub: '按鈕小字', price: '價錢那行字', link: '最下面連結字', shop: '店名', hello: '第一句招呼', qa: '問答（問／答）', lines: '對話（ai 或 c／內容）', cards: '卡片', line: 'LINE', ig: 'IG' };
var HIDE_KEY = { href: 1, id: 1, alt: 1, list: 1, plus: 1, floor: 1 };
var IMG_KEY = { image: 1, poster: 1, img: 1, images: 1 };
var VID_KEY = { src: 1, video: 1 };
var UNIT = { once: '一次', month: '每月', each: '每支' };

function toUrl(u) { return /^(https?:)?\/\//.test(u) || !u ? u : (u.charAt(0) === '/' ? u : '/' + u); }

function upload(file) {
  var ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
  var path = 'site/' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6) + '.' + ext;
  return sb.storage.from('web-media').upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type || undefined }).then(function (r) {
    if (r.error) throw r.error;
    return sb.storage.from('web-media').getPublicUrl(path).data.publicUrl;
  });
}

/* ---------- 通用欄位編輯 ---------- */
function Media(p) {
  var st = useState(''), msg = st[0], setMsg = st[1];
  var vid = p.video;
  function pick(e) {
    var f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
    if (f.size > 45 * 1024 * 1024) { setMsg('檔案太大（超過 45MB），請先壓小一點'); return; }
    setMsg('上傳中…');
    upload(f).then(function (u) { setMsg('換好了，記得按「存檔」'); p.onChange(u); }, function (er) { setMsg('上傳失敗：' + (er && er.message || er)); });
  }
  return h('div', { className: 'ad-media' },
    p.value ? (vid ? h('video', { src: toUrl(p.value), muted: true, playsInline: true, preload: 'metadata' }) : h('img', { src: toUrl(p.value), alt: '' })) : h('div', { className: 'ad-noimg' }, '沒有' + (vid ? '影片' : '圖片')),
    h('div', { className: 'ad-mbtns' },
      h('label', { className: 'ad-btn' }, vid ? '換影片' : '換圖片', h('input', { type: 'file', accept: vid ? 'video/mp4,video/*' : 'image/*', onChange: pick, hidden: true })),
      p.value ? h('button', { type: 'button', className: 'ad-btn ghost', onClick: function () { p.onChange(''); } }, '拿掉') : null),
    msg ? h('small', { className: 'ad-msg' }, msg) : null);
}

function Field(p) {
  var k = p.k, v = p.value, set = p.onChange, lab = p.label || LABEL[k] || '';
  if (HIDE_KEY[k]) return null;
  if (typeof v === 'string' && (IMG_KEY[k] || VID_KEY[k] || p.img)) return h('div', { className: 'ad-f' }, lab ? h('span', { className: 'ad-l' }, lab) : null, h(Media, { value: v, video: !!VID_KEY[k], onChange: set }));
  if (typeof v === 'string') {
    var long = v.length > 34 || /desc|sub|hello|note/.test(k);
    return h('label', { className: 'ad-f' }, lab ? h('span', { className: 'ad-l' }, lab) : null,
      long ? h('textarea', { value: v, rows: Math.min(6, Math.max(2, Math.ceil(v.length / 28))), onChange: function (e) { set(e.target.value); } }) : h('input', { type: 'text', value: v, onChange: function (e) { set(e.target.value); } }));
  }
  if (typeof v === 'number') return h('label', { className: 'ad-f' }, h('span', { className: 'ad-l' }, lab), h('input', { type: 'number', inputMode: 'numeric', value: v, onChange: function (e) { set(e.target.value === '' ? 0 : Number(e.target.value)); } }));
  if (typeof v === 'boolean') return h('label', { className: 'ad-f ad-chk' }, h('input', { type: 'checkbox', checked: v, onChange: function (e) { set(e.target.checked); } }), h('span', null, lab));
  if (Array.isArray(v)) return h(ArrField, { k: k, value: v, onChange: set, label: lab });
  if (v && typeof v === 'object') return h('div', { className: 'ad-obj' }, lab ? h('span', { className: 'ad-l' }, lab) : null, h(ObjFields, { value: v, onChange: set }));
  return null;
}
function ObjFields(p) {
  var v = p.value;
  return h('div', { className: 'ad-fields' }, Object.keys(v).map(function (k) {
    return h(Field, { key: k, k: k, value: v[k], onChange: function (nv) { var o = Object.assign({}, v); o[k] = nv; p.onChange(o); } });
  }));
}
function blankLike(x) {
  if (typeof x === 'string') return '';
  if (typeof x === 'number') return 0;
  if (Array.isArray(x)) return x.map(blankLike);
  if (x && typeof x === 'object') { var o = {}; Object.keys(x).forEach(function (k) { o[k] = HIDE_KEY[k] ? x[k] : blankLike(x[k]); }); return o; }
  return x;
}
function ArrField(p) {
  var v = p.value, k = p.k, set = p.onChange;
  var simple = v.every(function (x) { return typeof x === 'string'; });
  function put(i, nv) { var a = v.slice(); a[i] = nv; set(a); }
  function del(i) { var a = v.slice(); a.splice(i, 1); set(a); }
  function mv(i, d) { var j = i + d; if (j < 0 || j >= v.length) return; var a = v.slice(); var t = a[i]; a[i] = a[j]; a[j] = t; set(a); }
  function add() { set(v.concat([v.length ? blankLike(v[v.length - 1]) : ''])); }
  var tuple = function (x) { return Array.isArray(x) && x.every(function (y) { return typeof y === 'string'; }); };
  return h('div', { className: 'ad-arr' }, h('span', { className: 'ad-l' }, p.label || LABEL[k] || ''),
    v.map(function (x, i) {
      var body;
      if (typeof x === 'string') body = IMG_KEY[k] ? h(Media, { value: x, onChange: function (nv) { put(i, nv); } }) : h('input', { type: 'text', value: x, onChange: function (e) { put(i, e.target.value); } });
      else if (tuple(x)) body = h('div', { className: 'ad-tup' }, x.map(function (y, j) {
        var lg = y.length > 18;
        var on = function (e) { var t = x.slice(); t[j] = e.target.value; put(i, t); };
        return lg ? h('textarea', { key: j, value: y, rows: 2, onChange: on }) : h('input', { key: j, type: 'text', value: y, onChange: on });
      }));
      else if (Array.isArray(x)) body = h('div', { className: 'ad-tup' }, x.map(function (y, j) { return h(Field, { key: j, k: j === 0 ? 'name' : 'items', value: y, label: j === 0 ? '名稱' : '內容', onChange: function (nv) { var t = x.slice(); t[j] = nv; put(i, t); } }); }));
      else body = h(ObjFields, { value: x, onChange: function (nv) { put(i, nv); } });
      return h('div', { key: i, className: 'ad-row' + (simple ? ' s' : '') },
        h('div', { className: 'ad-rh' }, h('b', null, '第 ' + (i + 1) + ' 個'),
          h('span', null, h('button', { type: 'button', onClick: function () { mv(i, -1); }, 'aria-label': '往上' }, '↑'), h('button', { type: 'button', onClick: function () { mv(i, 1); }, 'aria-label': '往下' }, '↓'), h('button', { type: 'button', className: 'del', onClick: function () { if (confirm('確定刪掉第 ' + (i + 1) + ' 個？')) del(i); } }, '刪掉'))),
        body);
    }),
    h('button', { type: 'button', className: 'ad-btn ghost ad-add', onClick: add }, '＋ 加一個'));
}

/* ---------- 每頁文字與圖片 ---------- */
function PagesTab(p) {
  var pages = DEFAULTS.pages;
  var s1 = useState(pages[0].id), pid = s1[0], setPid = s1[1];
  var s2 = useState(''), open = s2[0], setOpen = s2[1];
  var ov = p.ov, setOv = p.setOv;
  var page = pages.filter(function (x) { return x.id === pid; })[0];
  return h('div', null,
    h('div', { className: 'ad-ptabs' }, pages.map(function (pg) { return h('button', { key: pg.id, type: 'button', className: pg.id === pid ? 'on' : '', onClick: function () { setPid(pg.id); setOpen(''); } }, PAGE_NAME[pg.id] || pg.name); })),
    h('div', { className: 'ad-list' }, page.sections.map(function (sec) {
      if (sec.type === 'next') return null;
      var id = sec.id, cur = ov[id] && !ov[id]._hide ? ov[id] : DEFAULTS.def[id], hid = !!(ov[id] && ov[id]._hide), changed = !!ov[id], on = open === id;
      var keys = Object.keys(cur || {}).filter(function (k) { return !HIDE_KEY[k] && !(sec.type === 'contact' && (k === 'line' || k === 'ig')); });
      if (!keys.length && sec.type !== 'msgform') keys = null;
      var first = cur && (cur.title || cur.en || (cur.items && cur.items[0] && cur.items[0].text)) || '';
      return h('div', { key: id, className: 'ad-card' + (on ? ' on' : '') },
        h('button', { type: 'button', className: 'ad-ch', 'aria-expanded': on, onClick: function () { setOpen(on ? '' : id); } },
          h('b', null, SEC_NAME[sec.type] || sec.type), h('span', null, hid ? '已隱藏' : first), changed ? h('em', null, hid ? '隱藏' : '改過') : null, h('i', null)),
        on ? h('div', { className: 'ad-cb' },
          h('label', { className: 'ad-f ad-chk' }, h('input', { type: 'checkbox', checked: hid, onChange: function (e) { var o = Object.assign({}, ov); if (e.target.checked) o[id] = { _hide: true }; else delete o[id]; setOv(o); } }), h('span', null, '這一區先不要顯示')),
          hid ? null : keys ? h(ObjFields, { value: cur, onChange: function (nv) { var o = Object.assign({}, ov); o[id] = nv; setOv(o); } }) : h('p', { className: 'ad-hint' }, sec.type === 'reach' ? 'LINE 和 IG 帳號在「聯絡資訊」改。' : '這一區沒有文字可以改。'),
          changed ? h('button', { type: 'button', className: 'ad-btn ghost', onClick: function () { if (!confirm('這一區要還原成原本的樣子？')) return; var o = Object.assign({}, ov); delete o[id]; setOv(o); } }, '還原成原本的') : null) : null);
    })));
}

/* ---------- 價錢與服務 ---------- */
function CatTab(p) {
  var cat = p.cat, setCat = p.setCat;
  var s1 = useState(-1), open = s1[0], setOpen = s1[1];
  function putG(gi, g) { var c = cat.slice(); c[gi] = g; setCat(c); }
  function putI(gi, ii, it) { var g = Object.assign({}, cat[gi]); g.items = g.items.slice(); g.items[ii] = it; putG(gi, g); }
  return h('div', null,
    h('p', { className: 'ad-hint' }, '點分類打開，改完按最下面「存檔」，官網馬上變。價錢填數字就好（不用打逗號）。'),
    h('div', { className: 'ad-list' }, cat.map(function (g, gi) {
      var on = open === gi;
      return h('div', { key: gi, className: 'ad-card' + (on ? ' on' : '') },
        h('button', { type: 'button', className: 'ad-ch', onClick: function () { setOpen(on ? -1 : gi); } }, h('b', null, g.g), h('span', null, g.items.length + ' 項'), h('i', null)),
        on ? h('div', { className: 'ad-cb' },
          h('label', { className: 'ad-f' }, h('span', { className: 'ad-l' }, '分類名稱'), h('input', { type: 'text', value: g.g, onChange: function (e) { putG(gi, Object.assign({}, g, { g: e.target.value })); } })),
          h('label', { className: 'ad-f' }, h('span', { className: 'ad-l' }, '分類小字'), h('input', { type: 'text', value: g.sub || '', onChange: function (e) { putG(gi, Object.assign({}, g, { sub: e.target.value })); } })),
          h('div', { className: 'ad-f' }, h('span', { className: 'ad-l' }, '分類橫幅圖'), h(Media, { value: g.img || '', onChange: function (u) { putG(gi, Object.assign({}, g, { img: u })); } })),
          g.items.map(function (it, ii) {
            var set = function (k, val) { var n = Object.assign({}, it); n[k] = val; putI(gi, ii, n); };
            return h('div', { key: it.id, className: 'ad-row ad-svc' },
              h('div', { className: 'ad-rh' }, h('b', null, it.n || '（新服務）'), h('span', null,
                h('button', { type: 'button', onClick: function () { if (ii === 0) return; var gg = Object.assign({}, g); gg.items = g.items.slice(); gg.items.splice(ii - 1, 0, gg.items.splice(ii, 1)[0]); putG(gi, gg); } }, '↑'),
                h('button', { type: 'button', className: 'del', onClick: function () { if (!confirm('確定刪掉「' + it.n + '」？')) return; var gg = Object.assign({}, g); gg.items = g.items.filter(function (_, j) { return j !== ii; }); putG(gi, gg); } }, '刪掉'))),
              h('label', { className: 'ad-f' }, h('span', { className: 'ad-l' }, '服務名稱'), h('input', { type: 'text', value: it.n, onChange: function (e) { set('n', e.target.value); } })),
              h('div', { className: 'ad-3' },
                h('label', { className: 'ad-f' }, h('span', { className: 'ad-l' }, '價錢（起）'), h('input', { type: 'number', inputMode: 'numeric', value: it.p, onChange: function (e) { set('p', Number(e.target.value || 0)); } })),
                h('label', { className: 'ad-f' }, h('span', { className: 'ad-l' }, '最高（可空白）'), h('input', { type: 'number', inputMode: 'numeric', value: it.max || '', onChange: function (e) { var n = Object.assign({}, it); if (e.target.value) n.max = Number(e.target.value); else delete n.max; putI(gi, ii, n); } })),
                h('label', { className: 'ad-f' }, h('span', { className: 'ad-l' }, '怎麼算'), h('select', { value: it.unit, onChange: function (e) { set('unit', e.target.value); } }, Object.keys(UNIT).map(function (u) { return h('option', { key: u, value: u }, UNIT[u]); })))),
              h('label', { className: 'ad-f' }, h('span', { className: 'ad-l' }, '說明'), h('textarea', { rows: 2, value: it.d || '', onChange: function (e) { set('d', e.target.value); } })),
              h('div', { className: 'ad-3' },
                h('label', { className: 'ad-f' }, h('span', { className: 'ad-l' }, '標籤（可空白）'), h('input', { type: 'text', value: it.tag || '', onChange: function (e) { var n = Object.assign({}, it); if (e.target.value) n.tag = e.target.value; else delete n.tag; putI(gi, ii, n); } })),
                h('label', { className: 'ad-f ad-chk' }, h('input', { type: 'checkbox', checked: !!it.ask, onChange: function (e) { set('ask', e.target.checked); } }), h('span', null, '顯示「洽詢」不寫價錢'))));
          }),
          h('button', { type: 'button', className: 'ad-btn ghost ad-add', onClick: function () { var gg = Object.assign({}, g); gg.items = g.items.concat([{ id: 'x' + Date.now().toString(36), n: '', p: 0, unit: 'once', d: '' }]); putG(gi, gg); } }, '＋ 在這個分類加一項服務')) : null);
    })));
}

/* ---------- 客人留言 ---------- */
function MsgTab() {
  var s = useState(null), rows = s[0], setRows = s[1];
  var e = useState(''), err = e[0], setErr = e[1];
  function load() {
    setErr('');
    sb.from('web_contact_messages').select('id,name,email,message,created_at').order('created_at', { ascending: false }).limit(300).then(function (r) { if (r.error) setErr(r.error.message); else setRows(r.data || []); });
  }
  useEffect(load, []);
  function fmt(t) { var d = new Date(t); return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  return h('div', null,
    h('div', { className: 'ad-bar' }, h('span', null, rows ? '共 ' + rows.length + ' 則，最新的在上面' : '讀取中…'), h('button', { type: 'button', className: 'ad-btn ghost', onClick: load }, '重新整理')),
    err ? h('p', { className: 'ad-err' }, '讀不到：' + err) : null,
    rows && !rows.length ? h('p', { className: 'ad-hint' }, '還沒有人留言。') : null,
    h('div', { className: 'ad-list' }, (rows || []).map(function (x) {
      var q = String(x.message || '').indexOf('【官網留言】') !== 0, m = String(x.message || '').replace(/^【官網留言】\n?/, '');
      return h('div', { key: x.id, className: 'ad-msgc' },
        h('div', { className: 'ad-rh' }, h('b', null, x.name || '（沒留稱呼）'), h('small', null, (q ? '報價單・' : '留言・') + fmt(x.created_at))),
        h('div', { className: 'ad-ct' }, x.email || ''),
        h('p', null, m || '（沒寫內容）'));
    })));
}

/* ---------- 聯絡資訊 ---------- */
function InfoTab(p) {
  return h('div', { className: 'ad-fields' },
    h('label', { className: 'ad-f' }, h('span', { className: 'ad-l' }, 'LINE 官方帳號 ID（含 @）'), h('input', { type: 'text', value: p.info.line_id, onChange: function (e) { p.setInfo(Object.assign({}, p.info, { line_id: e.target.value.trim() })); } })),
    h('label', { className: 'ad-f' }, h('span', { className: 'ad-l' }, 'Instagram 帳號（不用 @）'), h('input', { type: 'text', value: p.info.instagram, onChange: function (e) { p.setInfo(Object.assign({}, p.info, { instagram: e.target.value.trim().replace(/^@/, '') })); } })),
    h('p', { className: 'ad-hint' }, '整個網站的 LINE 按鈕、IG 卡片、報價單「傳到維拓 LINE」都會跟著換。'));
}

/* ---------- 登入 ---------- */
function Login(p) {
  var a = useState(''), b = useState(''), m = useState(''), busy = useState(false);
  function go(e) {
    e.preventDefault(); busy[1](true); m[1]('');
    sb.auth.signInWithPassword({ email: a[0].trim(), password: b[0] }).then(function (r) { busy[1](false); if (r.error) m[1]('登不進去：Email 或密碼不對'); else p.onIn(r.data.session); });
  }
  function link() {
    if (!a[0].trim()) { m[1]('先填 Email'); return; }
    busy[1](true);
    sb.auth.signInWithOtp({ email: a[0].trim(), options: { shouldCreateUser: false, emailRedirectTo: location.origin + '/admin' } }).then(function (r) { busy[1](false); m[1](r.error ? '寄不出去：' + r.error.message : '登入連結寄到你的信箱了，打開信按連結就會回到這裡。'); });
  }
  return h('form', { className: 'ad-login', onSubmit: go },
    h('img', { src: DEFAULTS.M + 'logo.png', alt: '' }),
    h('h1', null, '維拓傳媒・官網後台'),
    h('label', { className: 'ad-f' }, h('span', { className: 'ad-l' }, 'Email'), h('input', { type: 'email', autoComplete: 'username', value: a[0], onChange: function (e) { a[1](e.target.value); } })),
    h('label', { className: 'ad-f' }, h('span', { className: 'ad-l' }, '密碼'), h('input', { type: 'password', autoComplete: 'current-password', value: b[0], onChange: function (e) { b[1](e.target.value); } })),
    h('button', { type: 'submit', className: 'ad-btn big', disabled: busy[0] }, busy[0] ? '登入中…' : '登入'),
    h('button', { type: 'button', className: 'ad-btn ghost', onClick: link, disabled: busy[0] }, '忘記密碼？寄登入連結到信箱'),
    m[0] ? h('p', { className: 'ad-msg' }, m[0]) : null);
}

/* ---------- 主畫面 ---------- */
var TABS = [['msg', '客人留言'], ['cat', '價錢與服務'], ['pages', '每頁文字與圖片'], ['info', '聯絡資訊']];
export default function Admin() {
  var s0 = useState(undefined), session = s0[0], setSession = s0[1];
  var s1 = useState(null), isAdmin = s1[0], setIsAdmin = s1[1];
  var s2 = useState('msg'), tab = s2[0], setTab = s2[1];
  var s3 = useState(null), data = s3[0], setData = s3[1];
  var s4 = useState(null), base = s4[0], setBase = s4[1];
  var s5 = useState(''), msg = s5[0], setMsg = s5[1];
  var s6 = useState(false), saving = s6[0], setSaving = s6[1];

  useEffect(function () {
    sb.auth.getSession().then(function (r) { setSession(r.data.session || null); });
    var sub = sb.auth.onAuthStateChange(function (_e, s) { setSession(s || null); });
    return function () { sub.data.subscription.unsubscribe(); };
  }, []);
  useEffect(function () {
    if (!session) { setIsAdmin(null); return; }
    sb.from('web_admins').select('id').eq('id', session.user.id).then(function (r) { setIsAdmin(!!(r.data && r.data.length)); });
    sb.from('web_settings').select('key,value').then(function (r) {
      var kv = {}; (r.data || []).forEach(function (x) { kv[x.key] = x.value; });
      var ov = {}; try { ov = JSON.parse(kv.site_pages || '{}') || {}; } catch (e) {}
      var cat = null; try { cat = JSON.parse(kv.site_catalog || 'null'); } catch (e) {}
      if (!Array.isArray(cat) || !cat.length) cat = clone(DEFAULTS.catalog);
      var d = { ov: ov, cat: cat, info: { line_id: kv.line_id || '@898biiyu', instagram: kv.instagram || 'victor_149131' } };
      setData(d); setBase(JSON.stringify(d));
    });
  }, [session]);
  useEffect(function () {
    function warn(e) { if (data && base && JSON.stringify(data) !== base) { e.preventDefault(); e.returnValue = ''; } }
    window.addEventListener('beforeunload', warn); return function () { window.removeEventListener('beforeunload', warn); };
  }, [data, base]);

  if (session === undefined) return h('div', { className: 'ad-wrap' }, h('p', { className: 'ad-hint' }, '讀取中…'));
  if (!session) return h('div', { className: 'ad-wrap' }, h(Login, { onIn: setSession }));
  if (isAdmin === false) return h('div', { className: 'ad-wrap' }, h('div', { className: 'ad-login' }, h('h1', null, '這個帳號沒有後台權限'), h('button', { type: 'button', className: 'ad-btn', onClick: function () { sb.auth.signOut(); } }, '換帳號')));
  if (!data) return h('div', { className: 'ad-wrap' }, h('p', { className: 'ad-hint' }, '讀取中…'));

  var dirty = JSON.stringify(data) !== base;
  function save() {
    setSaving(true); setMsg('');
    var now = new Date().toISOString();
    var ov = {}; Object.keys(data.ov).forEach(function (k) { if (JSON.stringify(data.ov[k]) !== JSON.stringify(DEFAULTS.def[k])) ov[k] = data.ov[k]; });
    var rows = [
      { key: 'site_pages', value: JSON.stringify(ov), updated_at: now },
      { key: 'site_catalog', value: JSON.stringify(data.cat), updated_at: now },
      { key: 'line_id', value: data.info.line_id, updated_at: now },
      { key: 'instagram', value: data.info.instagram, updated_at: now }];
    sb.from('web_settings').upsert(rows, { onConflict: 'key' }).then(function (r) {
      setSaving(false);
      if (r.error) { setMsg('沒存到：' + r.error.message); return; }
      var d = Object.assign({}, data, { ov: ov }); setData(d); setBase(JSON.stringify(d)); setMsg('存好了！官網重新整理就看得到。');
      try { fetch('/api/revalidate', { method: 'POST' }); } catch (e) {}
    });
  }
  return h('div', { className: 'ad-wrap' },
    h('header', { className: 'ad-top' },
      h('b', null, '維拓官網後台'),
      h('a', { href: '/', target: '_blank', rel: 'noopener' }, '看官網 ↗'),
      h('button', { type: 'button', className: 'ad-out', onClick: function () { if (!dirty || confirm('還有沒存的修改，確定登出？')) sb.auth.signOut(); } }, '登出')),
    h('nav', { className: 'ad-tabs' }, TABS.map(function (t) { return h('button', { key: t[0], type: 'button', className: tab === t[0] ? 'on' : '', onClick: function () { setTab(t[0]); window.scrollTo(0, 0); } }, t[1]); })),
    h('main', { className: 'ad-main' },
      tab === 'msg' ? h(MsgTab) :
      tab === 'cat' ? h(CatTab, { cat: data.cat, setCat: function (c) { setData(Object.assign({}, data, { cat: c })); } }) :
      tab === 'pages' ? h(PagesTab, { ov: data.ov, setOv: function (o) { setData(Object.assign({}, data, { ov: o })); } }) :
      h(InfoTab, { info: data.info, setInfo: function (i) { setData(Object.assign({}, data, { info: i })); } })),
    tab !== 'msg' ? h('div', { className: 'ad-save' + (dirty ? ' dirty' : '') },
      h('span', null, msg || (dirty ? '有修改還沒存' : '都存好了')),
      dirty ? h('button', { type: 'button', className: 'ad-btn ghost', onClick: function () { if (confirm('放棄還沒存的修改？')) { setData(JSON.parse(base)); setMsg(''); } } }, '放棄') : null,
      h('button', { type: 'button', className: 'ad-btn big', disabled: !dirty || saving, onClick: save }, saving ? '存檔中…' : '存檔')) : null);
}
