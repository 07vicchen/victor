'use client';
import React from 'react';
import Site from './Site.js';
import { RENDER } from './sections.js';
import CAT0 from './cat.json';
import { BIZ, FAQ, SVC, SGFAQ, AIFAQ, WEBFAQ, SVFAQ, IPFAQ, ABOUTFAQ } from './faq.js';

var h = React.createElement, useState = React.useState;
var M = '/m/';
var LINE_ID = '@898biiyu', IG = 'victor_149131';
var CAT = JSON.parse(JSON.stringify(CAT0));
var OFFICE_URL = 'https://claude.ai/artifact/8d7phX4k77PYLBjGvbaPyi';
var PATHMODE = M.charAt(0) === '/';
function go(href) { if (href.charAt(0) === '#') location.hash = href; else location.href = href; }
function money(n) { return 'NT$' + Number(n || 0).toLocaleString('en-US'); }

/* 真的影片 */
RENDER.video = function (d) {
  return h('section', { className: 'sec sec-alt' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, d.title), d.desc ? h('p', null, d.desc) : null),
    h('div', { className: 'vreal' }, h('video', { src: d.src, poster: d.poster, controls: true, playsInline: true, preload: 'none' }), d.caption ? h('span', { className: 'vcap2' }, d.caption) : null)));
};

/* 作品：三個 IP，數字照實際帳號 */
RENDER.ipcases = function (d) {
  return h('section', { className: 'sec', id: 'works' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, d.title), h('p', null, d.sub)),
    h('div', { className: 'ipgrid' }, d.items.map(function (x, i) {
      return h('article', { key: i, className: 'ipc' },
        h('div', { className: 'ipm' + (x.image || x.video ? '' : ' noimg') }, x.video ? h('video', { src: x.video, poster: x.image, autoPlay: true, muted: true, loop: true, playsInline: true, preload: 'metadata', 'aria-label': x.name }) : x.image ? h('img', { src: x.image, alt: x.name, loading: 'lazy' }) : h('span', null, x.name), h('em', null, x.plat)),
        h('div', { className: 'ipb' },
          h('span', { className: 'eyebrow' }, x.tag), h('h3', null, x.name), h('p', null, x.desc),
          h('dl', null, x.stats.map(function (s, j) { return h('div', { key: j }, h('dt', null, s[0]), h('dd', null, s[1])); })),
          x.url ? h('a', { className: 'iplink', href: x.url, target: '_blank', rel: 'noopener' }, '看帳號 ' + x.handle + ' →') : h('span', { className: 'iplink off' }, x.handle)));
    }))));
};

/* AI 辦公室 */
RENDER.office = function (d) {
  return h('section', { className: 'sec sec-alt', id: 'office' }, h('div', { className: 'sec-inner office' },
    h('div', { className: 'ofc' }, h('span', { className: 'eyebrow' }, 'AI OFFICE'), h('h2', null, d.title), h('p', null, d.desc),
      h('ul', null, d.points.map(function (p, i) { return h('li', { key: i }, h('b', null, p[0]), p[1]); })),
      h('div', { className: 'ofbtn' }, h('a', { className: 'gobtn', href: OFFICE_URL, target: '_blank', rel: 'noopener' }, h('span', { className: 'gob' }, h('small', null, 'AI OFFICE BUILDER'), h('b', null, d.btn || '進組裝台，挑你的 AI 員工')), h('i', { className: 'goa' }, '→')), h('span', null, d.price))),
    h('div', { className: 'ofgrid', 'aria-hidden': true }, d.staff.map(function (s, i) { return h('div', { key: i }, h('b', null, s[0]), h('span', null, s[1])); }))));
};

var SGI = SVC.findIndex(function (x) { return x.slug === 'seo-geo'; });


/* 報價單：每一項都有價錢，可以勾選，送到 LINE */
var QIMG0 = [M + 'cat.jpg', M + 'f45.jpg', M + 'edward.jpg', M + 'tuoen.jpg', M + 'f70.jpg'];
var QSUB0 = ['角色、動畫、配音，老闆不用露臉', '代營運、腳本、剪片、脆文', '在地店家曝光、地圖排名', 'Logo、官網、品牌識別', '把 AI 員工裝進你的公司'];
var UNIT = { once: '一次', month: '每月', each: '每支' };
var REQ = { cbm: 'cb', lnm: 'lnb' }, PNOTE = { ma: '或廣告費 15%（取高）' };
var IX = {};
function setCat(c) { CAT = c; IX = {}; CAT.forEach(function (g, gi) { if (g.img == null) g.img = QIMG0[gi % QIMG0.length]; if (g.sub == null) g.sub = QSUB0[gi] || ''; g.items.forEach(function (it) { IX[it.id] = it; }); }); }
setCat(CAT);
function Quote(p) {
  p = p || {};
  var s1 = useState({}), sel = s1[0], setSel = s1[1];
  var s2 = useState(0), open = s2[0], setOpen = s2[1];
  var s3 = useState(3), months = s3[0], setMonths = s3[1];
  var s4 = useState(''), shop = s4[0], setShop = s4[1];
  function toggle(id) {
    var n = Object.assign({}, sel), it = IX[id];
    if (n[id]) { delete n[id]; Object.keys(REQ).forEach(function (k) { if (REQ[k] === id) delete n[k]; }); }
    else { n[id] = 1; if (it.alt && n[it.alt]) delete n[it.alt]; }
    setSel(n);
  }
  function qty(id, dlt) { var n = Object.assign({}, sel); n[id] = Math.max(1, Math.min(20, (n[id] || 1) + dlt)); setSel(n); }
  var rows = Object.keys(sel).map(function (k) { var it = IX[k], q = it.unit === 'each' ? sel[k] : 1; return { it: it, q: q, amt: (it.p || 0) * q }; });
  var once = 0, mon = 0; rows.forEach(function (r) { if (r.it.unit === 'month') mon += r.amt; else once += r.amt; });
  var total = once + mon * months;
  var code = ['VT', 'm' + months].concat(Object.keys(sel).map(function (k) { return k + (sel[k] > 1 ? sel[k] : ''); })).join('.');
  var lines = ['【維拓傳媒・我想問的服務】'];
  if (shop.trim()) lines.push('店名／品牌：' + shop.trim());
  if (rows.length) { rows.forEach(function (r) { lines.push('・' + r.it.n + (r.it.unit === 'each' ? ' × ' + r.q : '') + '：' + (r.it.ask ? '洽詢' : r.it.p === 0 ? '免費' : money(r.amt) + (r.it.unit === 'month' ? '／月' : ''))); }); lines.push('合計約 ' + money(total) + ' 起（月費簽 ' + months + ' 個月，未稅）'); lines.push('報價碼 ' + code); }
  else lines.push('我想了解維拓傳媒的服務');
  var lineHref = 'https://line.me/R/oaMessage/' + encodeURIComponent(LINE_ID) + '/?' + encodeURIComponent(lines.join('\n'));
  return h('section', { className: 'sec', id: 'quote' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, p.title || '服務與報價'), h('p', null, p.desc || '')),
    h('div', { className: 'qwrap' },
      h('div', { className: 'qcats' }, CAT.map(function (g, gi) {
        var on = open === gi, n = g.items.filter(function (x) { return sel[x.id]; }).length;
        return h('div', { key: gi, className: 'qcat' + (on ? ' on' : '') },
          h('button', { type: 'button', className: 'qhead', 'aria-expanded': on, onClick: function () { setOpen(on ? -1 : gi); } }, h('span', { className: 'qno' }, String(gi + 1).padStart(2, '0')), h('span', { className: 'qtt' }, h('b', null, g.g), h('small', null, g.sub || '')), h('span', { className: 'qct' }, n ? '已選 ' + n : g.items.length + ' 項'), h('i', null)),
          on ? h('div', { className: 'qitems' }, SVC[gi] ? h('a', { className: 'qmore', href: SVC[gi].slug === 'seo-geo' ? '/seo-geo' : SVC[gi].slug === 'ai-animation' ? '/ai-animation' : SVC[gi].slug === 'brand' ? '/web-design' : '/services/' + SVC[gi].slug }, '看「' + g.g + '」每一項的完整介紹 →') : null, g.items.map(function (it) {
            var s = !!sel[it.id], r = REQ[it.id], lk = r && !sel[r];
            return h('div', { key: it.id, className: 'qit' + (s ? ' on' : '') },
              h('div', { className: 'qn' }, it.n, it.tag ? h('em', null, it.tag) : null),
              h('div', { className: 'qp' }, it.ask ? '洽詢' : it.p === 0 ? '免費' : money(it.p) + (it.max ? ' 起' : ''), h('small', null, it.ask ? '專人報價' : it.p === 0 ? '' : UNIT[it.unit] + (PNOTE[it.id] ? '・' + PNOTE[it.id] : ''))),
              h('div', { className: 'qd' }, it.d),
              h('div', { className: 'qa' },
                lk ? h('span', { className: 'qlk' }, '要先選「' + IX[r].n + '」') : h('button', { type: 'button', className: 'qbtn' + (s ? ' on' : ''), onClick: function () { toggle(it.id); } }, s ? '✓ 已加入' : '加入'),
                s && it.unit === 'each' ? h('span', { className: 'qq' }, '幾支', h('button', { type: 'button', onClick: function () { qty(it.id, -1); } }, '−'), h('b', null, sel[it.id]), h('button', { type: 'button', onClick: function () { qty(it.id, 1); } }, '＋')) : null));
          })) : null);
      })),
      h('aside', { className: 'qsheet' },
        h('h3', null, '你的報價單'),
        rows.length ? h('table', null, h('tbody', null, rows.map(function (r) { return h('tr', { key: r.it.id }, h('td', null, r.it.n + (r.it.unit === 'each' ? ' × ' + r.q : '')), h('td', { className: 'n' }, r.it.ask ? '洽詢' : r.it.p === 0 ? '免費' : money(r.amt) + (r.it.unit === 'month' ? '／月' : ''))); }))) : h('p', { className: 'qempty' }, '還沒選服務，從左邊點「加入」。'),
        h('div', { className: 'qtot' }, h('span', null, '一次性'), h('span', { className: 'n' }, money(once)), h('span', null, '每月'), h('span', { className: 'n' }, money(mon) + '／月'), h('span', { className: 'big' }, '合計（起）'), h('span', { className: 'n big' }, money(total))),
        h('label', { className: 'ql' }, '月費想簽幾個月', h('span', { className: 'qseg' }, [3, 6, 12].map(function (m) { return h('button', { key: m, type: 'button', className: m === months ? 'on' : '', onClick: function () { setMonths(m); } }, m + ' 個月'); }))),
        h('label', { className: 'ql', htmlFor: 'qshop' }, '店名或品牌（可以不填）', h('input', { id: 'qshop', type: 'text', value: shop, maxLength: 40, placeholder: '例：阿牛牛肉麵', onChange: function (e) { setShop(e.target.value); } })),
        h('a', { className: 'wt-btn wt-btn-primary qsend', href: lineHref, target: '_blank', rel: 'noopener', onClick: function () { if (rows.length) saveLead(shop.trim() || '報價單客人', '（從報價單送出，會在 LINE 聯絡）', lines.join('\n')); } }, '傳到維拓 LINE'),
        h('p', { className: 'qnote' }, p.note || '')))));
}
RENDER.quote = function (d) { return h(Quote, d); };


/* 首頁四個入口（分類點進去看） */
RENDER.doors = function (d) {
  return h('section', { className: 'sec doors-sec' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, d.title), h('p', null, d.sub)),
    h('div', { className: 'doors' }, d.items.map(function (x, i) {
      return h('a', { key: i, className: 'door d' + i, href: x.href },
        h('span', { className: 'dn' }, String(i + 1).padStart(2, '0')),
        h('span', { className: 'dc' }, h('small', null, x.en), h('b', null, x.title), h('span', null, x.desc), h('i', null, '進去看 →')));
    }))));
};
/* 內頁標題 */
RENDER.pagehead = function (d) {
  return h('section', { className: 'phead' }, h('div', { className: 'sec-inner' },
    h('a', { className: 'pback', href: '/' }, '← 回首頁'),
    h('small', null, d.en), h('h1', null, d.title), d.desc ? h('p', null, d.desc) : null));
};
/* 關於我們：創辦人照片＋介紹 */
RENDER.founder = function (d) {
  return h('section', { className: 'sec' }, h('div', { className: 'sec-inner fdr' },
    h('div', { className: 'fdr-img' }, h('img', { src: d.image, alt: d.alt || d.name, loading: 'lazy', width: 900, height: 1350 })),
    h('div', { className: 'fdr-copy' }, h('span', { className: 'eyebrow' }, d.tag), h('h2', null, d.name), (d.paras || []).map(function (p, i) { return h('p', { key: i }, p); }))));
};
/* 內頁底下：去其他分類 */
RENDER.next = function (d) {
  return h('section', { className: 'sec pnext' }, h('div', { className: 'sec-inner' },
    h('span', { className: 'eyebrow' }, '接著看'),
    h('div', { className: 'pnl' }, d.items.map(function (x, i) { return h('a', { key: i, href: x.href }, h('small', null, x.en), h('b', null, x.title), h('i', null, '→')); }))));
};
RENDER.herox = function (d, v, ctx) {
  if (!d.video) return RENDER.hero(d, v, Object.assign({}, ctx, { cta: function () { go('/quote'); } }));
  return h('section', { className: 'hx' },
    h('div', { className: 'hx-bg', style: { backgroundImage: 'url(' + (d.image || '') + ')' }, 'aria-hidden': true }),
    h('div', { className: 'hx-in' },
      h('div', { className: 'hx-copy' },
        d.eyebrow ? h('h1', { className: 'hx-eb' }, d.eyebrow) : null,
        h(d.eyebrow ? 'p' : 'h1', { className: 'hx-t' }, d.title),
        d.desc ? h('p', null, d.desc) : null,
        h('div', { className: 'hx-act' }, h('a', { className: 'gobtn', href: '/quote' }, h('span', { className: 'gob' }, h('small', null, 'PRICE'), h('b', null, d.primary || '看報價')), h('i', { className: 'goa' }, '→'))),
        d.note ? h('small', { className: 'hx-note' }, d.note) : null),
      h('div', { className: 'hx-media' }, h('video', { src: d.video, poster: d.image, autoPlay: true, muted: true, loop: true, playsInline: true, preload: 'metadata', 'aria-label': d.alt || '' }))));
};


/* AI 辦公室：完整功能（只講拿到什麼，不講怎麼做） */
RENDER.ofeat = function (d) {
  return h('section', { className: 'sec ofeat' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, d.title), h('p', null, d.sub)),
    h('div', { className: 'ofg' }, d.items.map(function (x, i) {
      return h('div', { key: i, className: 'ofi' }, h('span', { className: 'ofn' }, (i < 9 ? '0' : '') + (i + 1)), h('b', null, x[0]), h('p', null, x[1]));
    }))));
};
RENDER.ostaff = function (d) {
  return h('section', { className: 'sec sec-alt ostaff' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, d.title), h('p', null, d.sub)),
    h('div', { className: 'odeps' }, d.deps.map(function (g, i) {
      return h('div', { key: i, className: 'odep' }, h('h3', null, g[0], h('small', null, g[1].length + ' 位')),
        h('ul', null, g[1].map(function (p, j) { return h('li', { key: j }, h('b', null, p[0]), h('span', null, p[1])); })));
    }))));
};
RENDER.owhy = function (d) {
  return h('section', { className: 'sec owhy' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, d.title), h('p', null, d.sub)),
    h('div', { className: 'owg' }, d.items.map(function (x, i) { return h('div', { key: i }, h('b', null, x[0]), h('p', null, x[1])); })),
    h('div', { className: 'ofbtn' }, h('a', { className: 'gobtn', href: OFFICE_URL, target: '_blank', rel: 'noopener' }, h('span', { className: 'gob' }, h('small', null, 'AI OFFICE BUILDER'), h('b', null, d.btn || '進組裝台，挑你的 AI 員工')), h('i', { className: 'goa' }, '→')), h('span', null, d.price))));
};

/* ===== SEO 與 GEO 介紹頁 ===== */
RENDER.sgpair = function (d) {
  return h('section', { className: 'sec sgpair' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, d.title), h('p', null, d.sub)),
    h('div', { className: 'sgp' }, d.items.map(function (x, i) {
      return h('article', { key: i }, h('small', null, x.en), h('h3', null, x.t), h('p', null, x.p),
        h('ul', null, x.list.map(function (l, j) { return h('li', { key: j }, l); })));
    }))));
};
RENDER.sgplans = function (d) {
  function pr(id) { var it = IX[id]; if (!it) return ''; if (it.ask) return '洽詢'; if (it.p === 0) return '免費'; return money(it.p) + (it.max ? ' 起' : ''); }
  function un(id, alt) { var it = IX[id]; return alt != null ? alt : it && !it.ask && it.p ? '／' + (UNIT[it.unit] || '') : ''; }
  return h('section', { className: 'sec sgplans', id: 'plans' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, d.title), h('p', null, d.sub)),
    h('div', { className: 'sgpl' }, d.plans.map(function (p, i) {
      return h('article', { key: i, className: p.hot ? 'hot' : '' },
        p.tag ? h('em', null, p.tag) : null,
        h('h3', null, p.n), h('p', { className: 'who' }, p.who),
        h('p', { className: 'amt' }, pr(p.id), h('small', null, un(p.id, p.unit))),
        h('ul', null, d.rows.map(function (r, j) { var v = p.v[j]; return h('li', { key: j, className: v === '—' ? 'no' : '' }, h('span', null, r), h('b', null, v)); })));
    })),
    h('h3', { className: 'sgadd-t' }, d.addTitle),
    h('div', { className: 'sgadd' }, d.adds.map(function (a, i) {
      return h('div', { key: i }, h('b', null, a[0]), h('span', { className: 'amt' }, pr(a[1]), h('small', null, a[2] != null ? a[2] : un(a[1]))), h('p', null, a[3]));
    })),
    h('p', { className: 'sgnote' }, d.note),
    h('div', { className: 'ofbtn' }, h('a', { className: 'gobtn', href: '/quote' }, h('span', { className: 'gob' }, h('small', null, 'PRICE'), h('b', null, '去報價單勾選，馬上算合計')), h('i', { className: 'goa' }, '→')))));
};
RENDER.sgreport = function (d) {
  var W = 320, Hh = 70, vs = d.chart, mx = Math.max.apply(null, vs), pts = vs.map(function (v, i) { return (i * W / (vs.length - 1)).toFixed(1) + ',' + (Hh - 6 - v / mx * (Hh - 14)).toFixed(1); }).join(' ');
  return h('section', { className: 'sec sec-alt sgreport' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, d.title), h('p', null, d.sub)),
    h('div', { className: 'rpt' },
      h('div', { className: 'rpth' }, h('b', null, d.head), h('span', null, d.period)),
      h('div', { className: 'rptk' }, d.kpis.map(function (k, i) { return h('div', { key: i }, h('small', null, k[0]), h('b', null, k[1]), h('em', { className: /^−|^-/.test(k[2]) ? 'dn' : '' }, k[2]), h('p', null, k[3])); })),
      h('div', { className: 'rptc' }, h('small', null, d.chartTitle), h('svg', { viewBox: '0 0 ' + W + ' ' + Hh, preserveAspectRatio: 'none', role: 'img', 'aria-label': d.chartTitle }, h('polyline', { points: pts, fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, vectorEffect: 'non-scaling-stroke' }))),
      h('div', { className: 'rptq' }, h('small', null, d.qTitle), h('table', null,
        h('thead', null, h('tr', null, h('th', null, '客人問 AI 的問題'), d.engines.map(function (e) { return h('th', { key: e }, e); }))),
        h('tbody', null, d.qs.map(function (q, i) { return h('tr', { key: i }, h('td', null, q[0]), q[1].map(function (v, j) { return h('td', { key: j, className: v ? 'y' : 'n' }, v ? '有提到' : '沒提到'); })); })))),
      h('div', { className: 'rptn' }, h('div', null, h('small', null, '這個月做了'), h('ul', null, d.done.map(function (x, i) { return h('li', { key: i }, x); }))), h('div', null, h('small', null, '下個月要做'), h('ul', null, d.next.map(function (x, i) { return h('li', { key: i }, x); })))),
      h('p', { className: 'rptf' }, d.note))));
};
RENDER.sgdemo = function (d) {
  function mark(t) { var i = t.indexOf(d.shop); return i < 0 ? t : [t.slice(0, i), h('mark', { key: 'm' }, d.shop), t.slice(i + d.shop.length)]; }
  return h('section', { className: 'sec sec-alt sgdemo' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, d.title), h('p', null, d.sub)),
    h('div', { className: 'sgd' }, d.items.map(function (x, i) {
      var body = x.kind === 'list' ? h('ol', null, x.rows.map(function (r, j) { return h('li', { key: j, className: j ? '' : 'me' }, mark(r)); }))
        : x.kind === 'answer' ? h('div', { className: 'ans' }, h('small', null, '答案'), h('p', null, mark(x.text)))
        : h('div', { className: 'chat' }, h('p', { className: 'ask' }, x.ask), h('p', { className: 'bot' }, mark(x.text)));
      return h('article', { key: i }, h('header', null, h('small', null, x.en), h('b', null, x.t)),
        h('div', { className: 'sbar' }, x.kind === 'chat' ? '傳訊息給 ChatGPT' : d.q), body);
    })),
    d.note ? h('p', { className: 'sgnote2' }, d.note) : null));
};
RENDER.sgsteps = function (d) {
  return h('section', { className: 'sec sec-alt sgsteps' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, d.title), h('p', null, d.sub)),
    h('ol', { className: 'sgs' }, d.steps.map(function (x, i) { return h('li', { key: i }, h('span', null, String(i + 1).padStart(2, '0')), h('b', null, x[0]), h('p', null, x[1])); })),
    d.note ? h('p', { className: 'sgnote' }, d.note) : null,
    h('div', { className: 'ofbtn' }, h('a', { className: 'gobtn', href: '/quote' }, h('span', { className: 'gob' }, h('small', null, 'PRICE'), h('b', null, d.btn || '去報價單勾選')), h('i', { className: 'goa' }, '→')))));
};

/* ===== 服務示範 ===== */
var PROPOSAL_URL = '';
function LogoAnim() {
  var st = useState(0), k = st[0], setK = st[1];
  return h('div', { className: 'lgwrap' },
    h('div', { key: k, className: 'lga' },
      h('div', { className: 'lgring' }), h('img', { className: 'lgimg', src: M + 'logo.png', alt: '維拓傳媒 logo' }),
      h('div', { className: 'lgtxt' }, h('b', null, 'VICTOR MEDIA'), h('span', null, '維拓傳媒・為你的品牌，拓出一片天'))),
    h('button', { type: 'button', className: 'dbtn', onClick: function () { setK(k + 1); } }, '↻ 再播一次'));
}
var CHAT_Q = [
  ['今天有營業嗎？', '有喔！我們今天 06:00 開到 13:30，週一公休～想先訂餐的話，跟我說要什麼、幾點來拿就好 😊'],
  ['最推薦什麼？', '老闆推「蘿蔔糕蛋餅加起司」跟「鮮奶茶」，常客幾乎每天點。要幫你先記一份嗎？'],
  ['可以外送嗎？', '1.5 公里內滿 150 元可以外送，大概 20 分鐘到。給我地址，我幫你算一下距離。'],
  ['我要訂 10 份', '沒問題！10 份以上可以打 95 折。請給我取餐時間和電話，老闆確認後會用 LINE 回你。'],
  ['想找真人', '好的，我已經通知老闆，他忙完會直接回你訊息，大約 10 分鐘內。']];
function ChatDemo(p) {
  var QA = (p.qa && p.qa.length) ? p.qa : CHAT_Q;
  var st = useState([{ b: 1, t: p.hello || '嗨～我是早安小舖的 AI 小幫手，24 小時都在。想問什麼直接點下面 👇' }]), msgs = st[0], setMsgs = st[1];
  var bz = useState(false), busy = bz[0], setBusy = bz[1];
  var ref = React.useRef(null);
  React.useEffect(function () { var el = ref.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs, busy]);
  function ask(q) { if (busy) return; setMsgs(msgs.concat([{ b: 0, t: q[0] }])); setBusy(true); setTimeout(function () { setMsgs(function (m) { return m.concat([{ b: 1, t: q[1] }]); }); setBusy(false); }, 900); }
  return h('div', { className: 'chat' },
    h('div', { className: 'chd' }, h('i', null), h('b', null, p.shop || '早安小舖'), h('small', null, 'AI 客服・在線')),
    h('div', { className: 'chb', ref: ref }, msgs.map(function (m, i) { return h('div', { key: i, className: 'cm ' + (m.b ? 'bot' : 'me') }, m.t); }), busy ? h('div', { className: 'cm bot typing' }, h('i'), h('i'), h('i')) : null),
    h('div', { className: 'chq' }, QA.map(function (q, i) { return h('button', { key: i, type: 'button', onClick: function () { ask(q); }, disabled: busy }, q[0]); })));
}
var CALL0 = [['ai', '您好，這裡是好好牙醫診所，我是 AI 助理小安，請問需要什麼服務？'], ['c', '我想約洗牙。'], ['ai', '好的。最近可以約的是週四下午兩點、或週六早上十點，請問哪一個比較方便？'], ['c', '週六早上好了。'], ['ai', '幫您約好週六早上十點洗牙，會傳簡訊提醒您。請問還有什麼需要幫忙的嗎？'], ['c', '沒有了，謝謝。'], ['ai', '不客氣，祝您有美好的一天，再見。']];
function CallDemo(p) {
  var CALL = (p.lines && p.lines.length) ? p.lines : CALL0;
  var st = useState(-1), n = st[0], setN = st[1];
  var tm = useState(0), sec = tm[0], setSec = tm[1];
  var timer = React.useRef(null), stop = React.useRef(false);
  function say(t, who, done) {
    try {
      var ss = window.speechSynthesis; if (!ss) throw 0;
      var u = new SpeechSynthesisUtterance(t); u.lang = 'zh-TW'; u.rate = 1.05; u.pitch = who === 'ai' ? 1.1 : 0.85;
      var vs = ss.getVoices().filter(function (v) { return /zh[-_]TW|zh-Hant|Mei-Jia|Taiwan/i.test(v.lang + v.name); });
      if (vs.length) u.voice = vs[who === 'ai' ? 0 : Math.min(1, vs.length - 1)];
      u.onend = done; u.onerror = done; ss.speak(u);
    } catch (e) { setTimeout(done, Math.max(1600, t.length * 180)); }
  }
  function start() {
    stop.current = false; try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {}
    setSec(0); clearInterval(timer.current); timer.current = setInterval(function () { setSec(function (x) { return x + 1; }); }, 1000);
    (function step(i) { if (stop.current || i >= CALL.length) { clearInterval(timer.current); if (!stop.current) setN(CALL.length); return; } setN(i); say(CALL[i][1], CALL[i][0], function () { setTimeout(function () { step(i + 1); }, 350); }); })(0);
  }
  function end() { stop.current = true; try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} clearInterval(timer.current); setN(-1); setSec(0); }
  React.useEffect(function () { return end; }, []);
  var on = n >= 0 && n < CALL.length;
  return h('div', { className: 'call' },
    h('div', { className: 'cltop' }, h('span', { className: 'clav' }, 'AI'), h('b', null, p.shop || '好好牙醫診所'), h('small', null, on ? 'AI 接聽中 ' + Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0') : n === CALL.length ? '通話結束，已自動建好預約' : '按下撥打，聽 AI 怎麼接電話')),
    h('div', { className: 'cllines' }, CALL.slice(0, Math.max(0, Math.min(n + 1, CALL.length))).map(function (l, i) { return h('p', { key: i, className: l[0] + (i === n ? ' now' : '') }, h('em', null, l[0] === 'ai' ? 'AI' : '客人'), l[1]); })),
    on ? h('button', { type: 'button', className: 'clbtn end', onClick: end }, '掛斷') : h('button', { type: 'button', className: 'clbtn', onClick: start }, n === CALL.length ? '再聽一次' : '撥打示範電話'),
    h('small', { className: 'clnote' }, '示範用手機內建語音；正式版用台灣腔真人感 AI 聲音，可以接預約、查訂單、回常見問題。'));
}
var DEMO_W = [null, 'office', 'logo', 'chat', 'call', 'pair', 'pick'];
RENDER.demos = function (d) {
  var cards = d.cards || [];
  return h('section', { className: 'sec demos' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'dgrid' }, cards.map(function (c, i) {
      var w = DEMO_W[i], body = null;
      if (i === 0 || w === 'office') body = h('div', { className: 'vreal sm' }, h('video', { src: c.video, poster: c.poster, controls: true, playsInline: true, preload: 'none' }));
      else if (w === 'logo') body = h(LogoAnim);
      else if (w === 'chat') body = h(ChatDemo, { shop: c.shop, hello: c.hello, qa: c.qa });
      else if (w === 'call') body = h(CallDemo, { shop: c.shop, lines: c.lines });
      else if (w === 'pair') body = h('div', { className: 'dpair' }, (c.images || []).map(function (u, k) { return h('img', { key: k, src: u, alt: '', loading: 'lazy' }); }));
      else if (w === 'pick') body = h('ul', { className: 'dpts' }, (c.points || []).map(function (t, k) { return h('li', { key: k }, t); }));
      var lk = c.link ? h('a', { className: 'dlink', href: w === 'pair' ? '/works' : w === 'office' ? '/office' : '/quote' }, c.link) : null;
      if (w === 'pick') return h('article', { key: i, className: 'dcard wide' }, h('div', { className: 'dwl' }, h('span', { className: 'dtag' }, c.tag), h('h3', null, c.title), h('p', null, c.desc), lk), body);
      return h('article', { key: i, className: 'dcard' + (i === 0 || w === 'office' ? ' tall' : '') }, h('span', { className: 'dtag' }, c.tag), h('h3', null, c.title), h('p', null, c.desc), body, lk);
    }))));
};

var S = function (type, variant, data) { return { id: '', type: type, variant: variant, data: data || {} }; };
var TAGS = { items: [{ text: 'AI 明星' }, { text: 'IP 孵化' }, { text: '老闆不用露臉' }, { text: 'AI 辦公室' }] };
var IPS = { items: [{ text: '王拓恩' }, { text: '貓探長' }, { text: '村山爺爺' }] };
var DOORS = [
  { href: '/works', en: 'WORKS', title: '作品', desc: '我們經營的 IP，和它們的真實數字', image: M + 'tuoen.jpg' },
  { href: '/demo', en: 'DEMO', title: '服務示範', desc: 'AI 辦公室、LOGO 動畫、AI 客服、語音電話、廣告短片，直接玩玩看', image: M + 'edward_p.jpg' },
  { href: '/quote', en: 'PRICE', title: '服務與報價', desc: '每一項都有價錢，勾好直接傳到 LINE', image: M + 'corgi.jpg' },
  { href: '/office', en: 'AI OFFICE', title: 'AI 辦公室', desc: '一組 AI 員工照班表上班，你只要看、按同意', image: M + 'tanlang.jpg' },
  { href: '/ai-kefu', en: 'AI SERVICE', title: 'AI 客服', desc: 'LINE、官網 24 小時自動回客人，還會主動關心和推薦', image: M + 'office_p.jpg' },
  { href: '/ai-tools', en: 'AI TOOLS', title: 'AI 工具', desc: 'AI 美編幫你做整組商品圖，AI 剪片幫你剪片上字幕，月訂閱自己動手做', image: M + 'f70.jpg' },
  { href: '/ai-animation', en: 'AI ANIMATION', title: 'AI 動畫', desc: '老闆不用露臉，AI 角色幫你講；先免費看你的角色', image: M + 'tuoen.jpg' },
  { href: '/web-design', en: 'WEB DESIGN', title: '網頁設計', desc: '形象官網、一頁式、預約和報價頁，上線就跟 Google 報到', image: M + 'f70.jpg' },
  { href: '/short-video', en: 'SHORT VIDEO', title: '短影音代操', desc: '企劃、拍攝、剪輯、發文；不露臉也能用 AI 出片', image: M + 'edward_p.jpg' },
  { href: '/ip-management', en: 'IP', title: '自媒體 IP 代操', desc: '從定位到變現，貓探長、村山爺爺都是這樣做起來的', image: M + 'ip_murayama.jpg' },
  { href: '/seo-geo', en: 'SEO × GEO', title: 'SEO・AEO・GEO', desc: 'Google 搜尋、Google 地圖、ChatGPT 都找得到你，月費 8,800 元起', image: M + 'f70.jpg' },
  { href: '/about', en: 'ABOUT', title: '關於我們', desc: '誰在做、在哪裡、做過什麼，一頁講清楚', image: M + 'logo.png' },
  { href: '/contact', en: 'CONTACT', title: '聯絡我們', desc: 'LINE @898biiyu・IG victor_149131', image: M + 'cat.jpg' }
];
function nextOf(skip, doors) { return { items: (doors || DOORS).filter(function (x) { return x.href !== skip; }) }; }
/* 客人留言 → 官網後台 Supabase（web_contact_messages，只開放新增，讀取要管理員） */
var SB_URL = 'https://cswhroimywfyokxxogis.supabase.co', SB_KEY = 'sb_publishable_vNNC0f5QzxX7uUl2hqvKhA_WSXIhwiY';
function saveLead(name, contact, message) {
  try {
    return fetch(SB_URL + '/rest/v1/web_contact_messages', { method: 'POST', keepalive: true, headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify({ name: String(name || '').slice(0, 80), email: String(contact || '').slice(0, 120), message: String(message || '').slice(0, 4000) }) }).then(function (r) { return r.ok; }).catch(function () { return false; });
  } catch (e) { return Promise.resolve(false); }
}
function MsgForm(p) {
  var a = useState(''), b = useState(''), c = useState(''), st = useState(0);
  function send(e) { e.preventDefault(); if (!a[0].trim() || !b[0].trim()) { st[1](3); return; } st[1](1);
    saveLead(a[0], b[0], '【官網留言】\n' + c[0]).then(function (ok) { st[1](ok ? 2 : 4); if (ok) { c[1](''); } }); }
  return h('section', { className: 'sec mform' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, p.title || '留言給維拓'), h('p', null, p.sub || '留下稱呼和聯絡方式，維拓會在一個工作天內回你。急的話直接加 LINE ' + LINE_ID + '。')),
    h('form', { className: 'mf', onSubmit: send },
      h('label', null, '怎麼稱呼你', h('input', { value: a[0], maxLength: 40, onChange: function (e) { a[1](e.target.value); }, placeholder: '例：王小姐' })),
      h('label', null, '聯絡方式（LINE ID、電話或 Email）', h('input', { value: b[0], maxLength: 100, onChange: function (e) { b[1](e.target.value); }, placeholder: '例：0912-345-678' })),
      h('label', { className: 'full' }, '想做什麼（可以不填）', h('textarea', { value: c[0], rows: 4, maxLength: 2000, onChange: function (e) { c[1](e.target.value); }, placeholder: '例：想幫咖啡店做 AI 角色和每月 4 支短影音' })),
      h('div', { className: 'full mfrow' }, h('button', { type: 'submit', className: 'gobtn', disabled: st[0] === 1 }, h('span', { className: 'gob' }, h('small', null, 'SEND'), h('b', null, st[0] === 1 ? '送出中…' : '送出留言')), h('i', { className: 'goa' }, '→')),
        h('span', { className: 'mfst' + (st[0] === 2 ? ' ok' : '') }, st[0] === 2 ? '收到了！維拓會盡快聯絡你。' : st[0] === 3 ? '稱呼和聯絡方式要填喔。' : st[0] === 4 ? '沒送出去，請直接加 LINE ' + LINE_ID + '。' : '')))));
}
RENDER.msgform = function (d) { return h(MsgForm, d || {}); };

RENDER.reach = function (d) {
  var lineUrl = 'https://line.me/R/ti/p/' + encodeURIComponent(LINE_ID), igUrl = 'https://www.instagram.com/' + IG + '/';
  return h('section', { className: 'sec reach' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'rgrid' },
      h('a', { className: 'rcard line', href: lineUrl, target: '_blank', rel: 'noopener' }, h('small', null, 'LINE 官方帳號'), h('b', null, LINE_ID), h('span', null, '詢價、預約、下單都在這裡，最快回覆'), h('i', null, '加好友 →')),
      h('a', { className: 'rcard ig', href: igUrl, target: '_blank', rel: 'noopener' }, h('small', null, 'Instagram'), h('b', null, '@' + IG), h('span', null, '看我們最新的作品和幕後'), h('i', null, '追蹤 →')),
      h('a', { className: 'rcard phone', href: 'tel:' + BIZ.tel }, h('small', null, '打電話'), h('b', null, BIZ.phone), h('span', null, BIZ.hours), h('i', null, '撥打 →')),
      h('a', { className: 'rcard quote', href: '/quote' }, h('small', null, '線上報價'), h('b', null, '自己挑、自己算'), h('span', null, '每一項都有價錢，勾好直接傳到 LINE'), h('i', null, '去報價 →')))));
};
function Faq(p) {
  var st = useState(0), open = st[0], setOpen = st[1];
  var items = p.items || [];
  return h('section', { className: 'sec faq' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, p.title || '常見問題'), p.sub ? h('p', null, p.sub) : null),
    h('div', { className: 'faql' }, items.map(function (q, i) {
      var on = open === i;
      return h('div', { key: i, className: 'faqi' + (on ? ' on' : '') },
        h('button', { type: 'button', 'aria-expanded': on, onClick: function () { setOpen(on ? -1 : i); } }, h('b', null, q[0]), h('i', null)),
        h('p', { hidden: !on }, q[1]));
    }))));
}
RENDER.faq = function (d) { return h(Faq, d); };
RENDER.svclist = function (d) {
  var g = CAT[d.gi] || { g: '', items: [] };
  return h('section', { className: 'sec svcl' }, h('div', { className: 'sec-inner' },
    h('div', { className: 'sec-head' }, h('h2', null, g.g + '：每一項的內容和價錢'), h('p', null, '新台幣、未稅；寫「起」的依需求評估。想要哪幾項，到報價單勾一勾就會算好合計。')),
    h('div', { className: 'svcg' }, g.items.map(function (it) {
      return h('article', { key: it.id, className: 'svci' },
        h('h3', null, it.n, it.tag ? h('em', null, it.tag) : null),
        h('p', { className: 'svcp' }, it.ask ? '洽詢' : it.p === 0 ? '免費' : money(it.p) + (it.max ? ' 起' : ''), it.ask || it.p === 0 ? null : h('small', null, '／' + UNIT[it.unit])),
        h('p', null, it.d));
    })),
    h('div', { className: 'ofbtn' }, h('a', { className: 'gobtn', href: '/quote' }, h('span', { className: 'gob' }, h('small', null, 'PRICE'), h('b', null, '去報價單勾選')), h('i', { className: 'goa' }, '→')))));
};
var CONTACT = S('contact', 'line', { title: '跟我們聊聊', sub: '加 LINE 直接問，或在報價單選好按「傳到維拓 LINE」。', line: LINE_ID, ig: 'victor_149131' });

var site = {
  biz: [{ t: BIZ.legal + '（' + BIZ.name + '）' }, { t: '統一編號 ' + BIZ.taxId }, { t: BIZ.addr }, { t: '電話 ' + BIZ.phone, href: 'tel:' + BIZ.tel }, { t: '服務時間 ' + BIZ.hours }, { t: 'LINE ' + BIZ.line }],
  name: '維拓傳媒', slogan: '為你的品牌，拓出一片天', logo: M + 'logo.png', nav: 'left', onepage: false, floatc: 'line', ordersLabel: '諮詢',
  pages: [
    { id: 'home', name: '首頁', slug: '/', sections: [
      S('herox', 'cover', { eyebrow: '維拓傳媒｜AI 動畫代言・短影音代操・網頁設計・SEO', title: '為你的品牌，拓出一片天', desc: '老闆不用露臉，讓 AI 角色替你開口。先免費做一個你家的代言角色給你看，喜歡再用 1,990 元做成會動的影片。之後 AI 動畫短影音每支 6,000 元起、短影音代操一天 500 元（每月 15,000 元起）、一頁式網頁 15,000 元起、SEO 和 AI 搜尋優化先做 4,800 元健檢、LINE AI 客服一天不到 70 元（每月 1,980 元起）。每一項都有公開價格，全台線上合作。', primary: '看報價', note: '貓探長單支 9.8 萬觀看・村山爺爺 3 週起量', video: M + 'hero_edward.mp4', image: M + 'hero_edward.jpg', alt: '愛德華在早餐店櫃台用貓掌點手機' }),
      S('marquee', 'big', TAGS),
      S('doors', '', { title: '你想先看哪一個', sub: '點進去看，每一頁上面的選單都能隨時切換。', items: DOORS }),
      S('bignum', 'counters', { title: '做出來的數字', items: [{ value: '9.8 萬', label: '貓探長單支觀看' }, { value: '34.7 萬', label: '貓探長兩個月 Reels 觀看' }, { value: '3 週', label: '村山爺爺從 0 到起量' }, { value: '1,000+', label: '村山爺爺單夜增粉' }] }),
      S('reach', '', {}),
      S('marquee', 'text', IPS)
    ] },
    { id: 'works', name: '作品', slug: '/works', sections: [
      S('pagehead', '', { en: 'WORKS', title: '我們做起來的 IP', desc: '從 0 粉起號到商業變現，數字都是帳號後台的真實數據。' }),
      S('ipcases', '', { title: '經營的 IP', sub: '動畫、真人，每個 IP 都量身做企劃。', items: [
        { name: '貓探長', tag: '動畫 IP・情緒療癒', plat: 'Instagram', handle: '@mtz.1390931', url: 'https://www.instagram.com/mtz.1390931/', video: M + 'ip_cat.mp4', image: M + 'ip_cat.jpg', desc: '插畫動畫結合情緒洞察，拆解職場和感情裡說不出口的事。從 0 粉起號，兩支破 9 萬觀看。', stats: [['單支最高觀看', '9.8 萬'], ['8～10 月 Reels 觀看', '34.7 萬'], ['粉絲', '983']] },
        { name: '村山爺爺', tag: '真人 IP・86 歲日本觀光大使', plat: 'Threads', handle: '@japan.grandpa', url: 'https://www.threads.com/@japan.grandpa', video: M + 'ip_murayama.mp4', image: M + 'ip_murayama.jpg', desc: '村山正弘，86 歲，當過多年五星級飯店總經理，現在還在第一線帶日本高端小團。維拓從企劃、拍法到經營一手做起來：0 粉起號，3 週起量，單夜增粉破千，第 2 個月開始商業變現。', stats: [['Threads 粉絲', '8,225'], ['置頂串文按讚', '2,416'], ['開始變現', '第 2 個月']] },
        { name: '王拓恩', tag: 'AI 明星・寫實短劇', plat: 'Instagram', handle: '@en05_24', url: 'https://www.instagram.com/en05_24/', image: M + 'f45.jpg', desc: '23 歲業餘棒球員，公開是 AI。每週一集寫實短劇，角色、台灣腔配音、對嘴全部 AI 做，拿來接品牌代言。', stats: [['第二季開播', '10 月'], ['〈第五年〉觀看', '2,189'], ['按讚', '101']] }] }),
      S('next', '', nextOf('/works'))
    ] },
    { id: 'demo', name: '服務示範', slug: '/demo', sections: [
      S('pagehead', '', { en: 'DEMO', title: '先玩玩看', desc: '每一項都是真的做得出來的東西。點、按、聽，喜歡哪個再去報價。' }),
      S('demos', '', { cards: [
        { tag: 'AI 廣告短片', title: '愛德華救店・早餐店篇', desc: '寫實真人＋真貓、配音對嘴全部 AI 做，34 秒。', video: M + 'edward.mp4', poster: M + 'edward_p.jpg', link: 'AI 動畫短影音 NT$6,000 起 →' },
        { tag: 'AI 辦公室', title: '一個人，也能有一整間辦公室', desc: '員工全是 AI，照班表天天上班：每天早上一份早報，腳本、校稿、回留言都有人做，誰卡住馬上通知你。你只要看、按同意。我們自己的 IP 就是這樣在跑。', video: M + 'office.mp4', poster: M + 'office_p.jpg', link: '看 AI 辦公室能幫你做什麼 →' },
        { tag: 'LOGO 動畫', title: '片頭、轉場、IG 動態封面', desc: '5～10 秒，放在每支影片開頭，品牌一眼記住。', link: 'NT$3,000 起／支 →' },
        { tag: 'AI 文字客服', title: '半夜也有人回', desc: '點下面的問題試試看。可以接官網、LINE、IG 私訊。', shop: '早安小舖', hello: '嗨～我是早安小舖的 AI 小幫手，24 小時都在。想問什麼直接點下面 👇', qa: CHAT_Q, link: '守夜 建置 NT$12,800・月費 NT$1,980 起 →' },
        { tag: 'AI 語音電話客服', title: '電話響了，AI 先接', desc: '按撥打，聽一通預約電話怎麼接完。', shop: '好好牙醫診所', lines: CALL0, link: '建置 NT$100,000 起 →' },
        { tag: 'AI 角色・老闆分身', title: '老闆不用露臉，也能天天出片', desc: '王拓恩是 AI 演的人，貓探長是 AI 畫的角色。你的品牌也可以有一個。', images: [M + 'tuoen.jpg', M + 'cat.jpg'], link: '看作品 →' },
        { tag: '官網・預約・報價頁', title: '你現在看的這個網站，就是我們做的', desc: '設計、文案、上線到 Google 找得到，一條龍做完。官網、一頁式活動頁、線上報價、預約系統都能做。', points: ['手機打開快，不讓客人等', 'Google 和 AI 搜尋都讀得懂，找得到你', '附後台，價錢、文字、照片自己就能改', '客人留言、報價單直接進後台'], link: '品牌形象官網 NT$50,000 起 →' }] }),
      S('reach', '', {}),
      S('next', '', nextOf('/demo'))
    ] },
    { id: 'quote', name: '服務與報價', slug: '/quote', sections: [
      S('pagehead', '', { en: 'PRICE', title: '服務與報價', desc: '分類點開看，每一項都有價錢。勾你要的，右邊馬上算出合計，按一下就傳到維拓 LINE。' }),
      S('quote', '', { title: '服務與報價', desc: '每一項都標好價錢，勾你要的，下面馬上算出合計。新台幣、未稅，寫「起」的依需求評估。', note: 'LINE 會打開跟維拓的對話，內容已經填好，按傳送就好。簽 6 個月以上，業務會再跟你談加贈。' }),
      S('faq', '', { title: '常見問題', items: FAQ }),
      S('next', '', nextOf('/quote'))
    ] },
    { id: 'aianim', name: 'AI 動畫', slug: '/ai-animation', sections: [
      S('pagehead', '', { en: 'AI ANIMATION', title: 'AI 動畫代言：老闆不用露臉，也能天天出片', desc: '維拓傳媒做 AI 動畫廣告和 AI 代言角色：幫你的店做一個專屬角色，或是用你本人做一個 AI 分身，腳本、台灣腔配音、對嘴、字幕都由我們來。免費角色試看，體驗動畫 1,990 元，AI 動畫短影音每支 6,000 元起，全台線上合作。先看一支我們做的。' }),
      S('video', 'full', { title: '愛德華救店・早餐店篇', desc: '寫實真人加上真貓，配音、對嘴全部 AI 做。', caption: '34 秒・AI 動畫短影音（寫實）', src: M + 'edward.mp4', poster: M + 'edward_p.jpg' }),
      S('sgpair', '', { title: '三種做法，挑適合你的', sub: '不想露臉、不想背稿、沒時間拍，都有對應的做法。', items: [
        { en: 'Q 版', t: 'Q 版角色動畫', p: '幫你的店設計一個可愛的代言角色，像貓探長那樣，每支片都由它出場。', list: ['專屬角色設計和造型', '台灣腔聲音', '角色設定書，之後每支長得都一樣', '適合美業、餐飲、親子、知識分享'] },
        { en: '寫實', t: '寫實 AI 人物', p: '看起來像真人演出的短片，像王拓恩和愛德華那樣，可以演小劇場。', list: ['寫實人物、場景、運鏡', '對嘴配音、字幕、封面', '可以拍連續劇、廣告片', '適合想要質感、說故事的品牌'] },
        { en: '分身', t: '老闆 AI 分身', p: '用你本人的臉和聲音做一個分身，之後給稿就能出口播，不用再拍。', list: ['一次建置，之後每支照稿生成', '你的聲音、你的樣子', '字幕和配樂都上好', '適合專業服務、顧問、講師'] }
      ] }),
      S('ofeat', '', { title: '一支片我們幫你做哪些事', sub: '你只要給想講的事，其他交給我們。', items: [
        ['角色', '設計專屬角色，寫好角色設定，之後每支都長一樣'],
        ['腳本', '照你的服務寫成 30～60 秒的小故事，不是硬推銷'],
        ['聲音', '台灣腔配音，可以做成你家專屬的聲音'],
        ['動畫', '角色動起來、場景、運鏡'],
        ['對嘴', '嘴型跟著台詞動，看起來自然'],
        ['字幕封面', '字幕、標題、IG 封面一起做好'],
        ['發文', '代營運方案幫你排時間、寫文案、發出去'],
        ['成效', '每月看觀看、分享、留言，下個月照數據調整']
      ] }),
      S('ipcases', '', { title: '我們自己做的帳號', sub: '數字都是帳號後台的真實數據。', items: [
        { name: '王拓恩', tag: 'AI 明星・寫實短劇', plat: 'Instagram', handle: '@en05_24', url: 'https://www.instagram.com/en05_24/', image: M + 'f45.jpg', desc: '23 歲業餘棒球員，公開是 AI。每週一集寫實短劇，角色、台灣腔配音、對嘴全部 AI 做。', stats: [['第二季開播', '10 月'], ['〈第五年〉觀看', '2,189'], ['按讚', '101']] },
        { name: '貓探長', tag: '動畫 IP・情緒療癒', plat: 'Instagram', handle: '@mtz.1390931', url: 'https://www.instagram.com/mtz.1390931/', image: M + 'cat.jpg', desc: '插畫動畫結合情緒洞察，拆解職場和感情裡說不出口的事。從 0 粉起號，兩支破 9 萬觀看。', stats: [['單支最高觀看', '9.8 萬'], ['8～10 月 Reels 觀看', '34.7 萬'], ['粉絲', '983']] }] }),
      S('sgsteps', '', { title: '怎麼開始', sub: '先免費看看你的店變成角色長什麼樣子，喜歡再往下走。', steps: [
        ['免費角色試看', 'Q 版角色圖加一句台灣腔配音，3 天內交，每月限 10 位'],
        ['1990 體驗動畫', '用你的角色做一支 15 秒會動、會講話的短片'],
        ['正式打造角色', '定裝造型、專屬聲音、角色設定書，之後每支都一致'],
        ['每月出片', '單支計價，或交給我們代營運，每月 4 支起']
      ], note: '老實說：AI 動畫不是按一個鈕就好，角色要一致、嘴型要對、故事要好看，我們每支都會人工檢查過才交。', btn: '去報價單勾選' }),
      S('sgplans', '', { title: '方案和價錢', sub: '從免費試看開始，不用一次花大錢。', rows: ['角色', '影片長度', '配音和對嘴', '腳本', '每月支數', '發文和成效分析'], plans: [
        { id: 'fr', n: '免費試看', who: '先看看你的店變成角色', unit: '', v: ['Q 版角色圖', '—', '一句台灣腔', '—', '—', '—'] },
        { id: 't1', n: '體驗動畫', who: '先做一支看看效果', v: ['用試看的角色', '15 秒', '有', '我們寫', '1 支', '—'] },
        { id: 'vq', n: '動畫短影音', tag: '最多人選', hot: 1, who: '單支計價，想做幾支做幾支', v: ['要先打造角色', '30～60 秒', '有', '有', '依需求', '—'] },
        { id: 'ao', n: '動畫代營運', tag: '最省心', hot: 1, who: '整個帳號交給我們', v: ['長期經營', '30～60 秒', '有', '每月企劃', '4 支起', '有'] }
      ], addTitle: '其他項目', adds: [
        ['角色打造（Q 版）', 'cq', null, '專屬角色、定裝造型、台灣腔聲音、角色設定書'],
        ['角色打造（寫實）', 'cr', null, '寫實 AI 人物版本'],
        ['老闆 AI 分身（建置）', 'twb', null, '用你的臉和聲音，之後口播不用再拍'],
        ['分身口播影片', 'twv', null, '60 秒內，給稿就生，字幕配樂都上好'],
        ['AI 品牌專屬聲音', 'bv', null, '你家專屬的台灣腔，廣告、客服都用同一個'],
        ['LOGO／片頭動畫', 'lo', null, '5～10 秒，片頭、轉場、IG 動態封面'],
        ['AI 商品情境圖', 'pi', null, '一組 5 張，IG、蝦皮、菜單都能用'],
        ['AI 動畫影集', 'se', null, '品牌專屬連續劇，一季 8～12 集']
      ], note: '新台幣、未稅；代營運最少 3 個月。寫「起」的依長度和內容評估，寫實版的短影音 NT$6,000～88,000。價格最後更新：2026 年 10 月 18 日。' }),
      S('faq', '', { title: 'AI 動畫常見問題', sub: '最後更新：2026 年 10 月 18 日', items: AIFAQ }),
      S('reach', '', {}),
      S('next', '', nextOf('/ai-animation'))
    ] },
    { id: 'web', name: '網頁設計', slug: '/web-design', hidden: true, sections: [
      S('pagehead', '', { en: 'WEB DESIGN', title: '網頁設計價格公開：做一個客人找得到、看了會想聯絡你的網站', desc: '維拓傳媒做網頁設計和網站架設，全台線上合作，台北、新北可以約在你那邊見面。一頁式活動頁 15,000 元、預約系統 30,000 元、品牌形象官網 50,000 元起。每個網站上線當天就幫你跟 Google 報到，不是做完就丟給你。' }),
      S('sgpair', '', { title: '你需要的是哪一種網站？', sub: '不是每家店都要一個大官網。先看你想讓客人做什麼。', items: [
        { en: '一頁式', t: '一頁式活動頁', p: '辦活動、推新品、收報名，一頁講完、一個按鈕收單。', list: ['手機打開就看完重點', '報名或私訊按鈕放最顯眼', '適合廣告導流、短期活動', 'NT$15,000'] },
        { en: '官網', t: '品牌形象官網', p: '讓客人搜你的名字時，看到一個講清楚你是誰、做什麼、多少錢的網站。', list: ['服務、價格、作品、問答一次放好', '附後台，文字照片自己改', 'Google 和 AI 都讀得懂', 'NT$50,000 起'] },
        { en: '系統', t: '預約・報價・管理系統', p: '客人自己選服務、選時段、算價錢，你手機收通知，不用一個一個回。', list: ['線上預約 NT$30,000', '線上方案／報價頁 NT$20,000', '進銷存、訂單、打卡 ERP NT$100,000 起', 'App 開發 NT$200,000 起'] }
      ] }),
      S('ofeat', '', { title: '每個網站都包含', sub: '你現在看的這個網站就是我們做的，下面這些它都有。', items: [
        ['手機優先', '先把手機版做好，打開快、字夠大、按鈕好按'],
        ['跟 Google 報到', '上線當天驗證 Search Console、交網站地圖、要求收錄'],
        ['讓 AI 讀得懂', '結構化資料、開放 AI 爬蟲、給 AI 看的網站說明（llms.txt）'],
        ['標題照關鍵字寫', '每頁標題寫清楚「店名＋服務＋地區」，客人搜得到'],
        ['問答區', '把客人常問的問題寫好，第一句就回答，Google 可以直接拿去當答案'],
        ['後台自己改', '價錢、文字、照片用手機就能改，不用每次找工程師'],
        ['留言進後台', '客人留言、報價單直接進後台，LINE 一鍵聯絡'],
        ['網域和主機', '幫你設定網域、HTTPS，放在 Vercel 這類穩定的主機上']
      ] }),
      S('sgsteps', '', { title: '做一個網站的流程', sub: '大部分時間花在把你的服務講清楚，不是在畫畫面。', steps: [
        ['聊需求', '你想讓客人看完做什麼：私訊、預約、還是買單？LINE 聊 20 分鐘就好'],
        ['報價和時程', '列出頁數、功能、價錢和交件日，你確認再開始'],
        ['文案和設計', '我們先寫文案、做手機版畫面給你看，改到你滿意'],
        ['上線報到', '上線當天跟 Google 報到、交網站地圖，教你用後台']
      ], note: '老實說：網站上線不等於會有客人。要讓「汐止 網頁設計」這種詞也搜得到你，要再加每月的 SEO，或是把網站連到你的社群和 Google 商家。', btn: '去報價單勾選' }),
      S('sgplans', '', { title: '網頁設計價格', sub: '價格公開，寫「起」的依頁數和功能評估。', rows: ['頁數', '手機版', '後台自己改', '跟 Google 報到', '結構化資料', '適合'], plans: [
        { id: 'lp', n: '一頁式活動頁', who: '活動、新品、報名', v: ['1 頁', '有', '—', '有', '有', '廣告導流、短期活動'] },
        { id: 'qp', n: '線上方案／報價頁', who: '讓客人自己算價錢', v: ['1～2 頁', '有', '有', '有', '有', '服務項目多的店'] },
        { id: 'bk', n: '線上預約系統', tag: '店家最常選', hot: 1, who: '美業、餐飲、課程', v: ['依需求', '有', '有', '有', '有', '要約時段的服務'] },
        { id: 'wb', n: '品牌形象官網', tag: '品牌首選', hot: 1, who: '要長期被搜到', v: ['5～10 頁起', '有', '有', '有', '有', '公司、品牌、工作室'] }
      ], addTitle: '也可以一起做', adds: [
        ['品牌 Logo 設計', 'lg', null, 'Logo、標準字、基本配色'],
        ['品牌視覺識別設計', 'vi', null, 'Logo 延伸、品牌色彩、視覺規範'],
        ['ERP 內部管理系統', 'is', null, '進銷存、訂單、報價單、員工打卡'],
        ['App 開發', 'ap', null, 'iOS／Android、會員系統、API 串接'],
        ['網站／App 維護巡查', 'mt', null, '每天看有沒有壞，每月健康報告'],
        ['AI 能見度＋SEO 健檢', 'sg0', null, '網站上線後，看 Google 和 AI 找不找得到你']
      ], note: '新台幣、未稅。網域和主機年費依實際費用另計，我們會先講清楚。價格最後更新：2026 年 10 月 18 日。' }),
      S('faq', '', { title: '網頁設計常見問題', sub: '最後更新：2026 年 10 月 18 日', items: WEBFAQ }),
      S('reach', '', {}),
      S('next', '', nextOf('/web-design'))
    ] },
    { id: 'sv', name: '短影音代操', slug: '/short-video', hidden: true, sections: [
      S('pagehead', '', { en: 'SHORT VIDEO', title: '短影音代操價格：老闆不露臉也能做，企劃到發文一次交給我們', desc: '維拓傳媒做 IG Reels、TikTok、YouTube Shorts、Threads 的短影音代操，全台線上合作，台北、新北可以到場拍攝。真人拍攝每月 45,000 元起（4 支），不想露臉的 AI 動畫代營運每月 15,000 元起。腳本照每週的爆款拆解來寫，不是憑感覺。' }),
      S('sgpair', '', { title: '三種出片方式', sub: '要不要露臉、有沒有時間拍，都有對應的做法。', items: [
        { en: '真人', t: '真人拍攝', p: '我們企劃、到場拍攝、剪輯，你只要照腳本講。', list: ['每月 4 支，含企劃腳本', '拍攝、剪輯、字幕、封面', '最少 3 個月', 'NT$45,000 起／每月'] },
        { en: 'AI', t: 'AI 動畫・AI 分身', p: '不露臉、不用拍，用 AI 角色或老闆分身出片。', list: ['台灣腔配音、對嘴', 'Q 版或寫實都可以', '單支 NT$6,000 起', '代營運 NT$15,000 起／每月'] },
        { en: '剪輯', t: '你拍、我們剪', p: '已經有直播、Podcast 或自己拍的素材，交給我們剪成短影音。', list: ['一場長片剪 5 支 NT$8,000', '只上字幕 NT$500／支', '標題和封面一起做', '適合已經有在拍的人'] }
      ] }),
      S('ofeat', '', { title: '台北、新北可以到場拍攝', sub: '台北短影音代操：真人拍攝方案可以到你的店或公司拍；不想露臉的 AI 動畫代營運，全台都能線上做，不用見面。', items: [
        ['台北市', '到你的店、診所或公司拍，一次拍完當月 4 支'],
        ['新北市', '汐止、南港、板橋、新店都在拍攝範圍，先約時間'],
        ['其他縣市', '真人拍攝先用 LINE 問排程；AI 動畫和剪輯全台線上做'],
        ['不想露臉', '用 AI 角色或老闆 AI 分身出片，人不用到場']
      ] }),
      S('ofeat', '', { title: '代操每個月做的事', sub: '我們自己的帳號就是這樣經營的。', items: [
        ['找爆款', '每週一整理同行和你自己帳號的爆款，拆出哪種開頭、哪種題目有效'],
        ['寫腳本', '照爆款拆解寫腳本給你挑，你點頭才拍'],
        ['拍攝或生成', '真人到場拍，或用 AI 角色、AI 分身生成'],
        ['剪輯字幕', '剪輯、字幕、配樂、封面一次做好'],
        ['發文', '排時間、寫文案和 hashtag，幫你發出去'],
        ['看數據', '每支片看完率、分享、漲粉，下個月照數據調整'],
        ['海巡串文', '加購海巡署，每天到熱門串留言，把人帶回你的帳號'],
        ['月報', '每月一份，哪支有效、為什麼、下個月怎麼做']
      ] }),
      S('ipcases', '', { title: '我們自己做的帳號', sub: '數字都是帳號後台的真實數據。', items: [
        { name: '貓探長', tag: '動畫短影音', plat: 'Instagram', handle: '@mtz.1390931', url: 'https://www.instagram.com/mtz.1390931/', image: M + 'cat.jpg', desc: '插畫動畫結合情緒洞察。從 0 粉起號，兩支破 9 萬觀看。', stats: [['單支最高觀看', '9.8 萬'], ['8～10 月 Reels 觀看', '34.7 萬'], ['粉絲', '983']] },
        { name: '王拓恩', tag: 'AI 寫實短劇', plat: 'Instagram', handle: '@en05_24', url: 'https://www.instagram.com/en05_24/', image: M + 'f45.jpg', desc: '23 歲業餘棒球員，公開是 AI。每週一集寫實短劇，角色、配音、對嘴全部 AI 做。', stats: [['第二季開播', '10 月'], ['〈第五年〉觀看', '2,189'], ['按讚', '101']] }] }),
      S('sgplans', '', { title: '短影音代操價格', sub: '可以單支試，也可以整個帳號交給我們。', rows: ['出片方式', '每月支數', '企劃腳本', '剪輯字幕封面', '幫你發文', '數據分析'], plans: [
        { id: 'clip', n: '直播／Podcast 切片', who: '已經有長片素材', v: ['你的素材', '一場剪 5 支', '—', '有', '—', '—'] },
        { id: 'vq', n: 'AI 動畫短影音', who: '不露臉，單支計價', v: ['AI 角色', '依需求', '有', '有', '—', '—'] },
        { id: 'ao', n: 'AI 動畫代營運', tag: '不露臉首選', hot: 1, who: '整個帳號交給我們', v: ['AI 角色', '4 支起', '每月企劃', '有', '有', '有'] },
        { id: 'sv', n: '短影音內容製作', tag: '真人拍攝', hot: 1, who: '想要真人出鏡', v: ['真人拍攝', '4 支', '每月企劃', '有', '—', '—'] }
      ], addTitle: '可以加購', adds: [
        ['自媒體社群代營運', 'so', null, '發文排程、互動經營、成效分析，每月 8 篇'],
        ['留言與私訊代回覆', 'cm', null, '每天回留言和私訊，用品牌口吻'],
        ['海巡署', 'pt', null, '每天到熱門串用你的帳號留言'],
        ['Meta 廣告代操', 'ma', null, '好的片拿去投廣告，每週回報成效'],
        ['爆款與對手觀察', 'vw', null, '每週拆同業爆款給你看'],
        ['影片上字幕', 'sb', null, '自己拍好的片，只上字幕和標題']
      ], note: '新台幣、未稅；代營運和內容製作最少 3 個月。寫「起」的依長度和內容評估。價格最後更新：2026 年 10 月 18 日。' }),
      S('faq', '', { title: '短影音代操常見問題', sub: '最後更新：2026 年 10 月 18 日', items: SVFAQ }),
      S('reach', '', {}),
      S('next', '', nextOf('/short-video'))
    ] },
    { id: 'ipm', name: '自媒體 IP 代操', slug: '/ip-management', hidden: true, sections: [
      S('pagehead', '', { en: 'IP MANAGEMENT', title: '自媒體 IP 代操・個人品牌經營：把你的專業，經營成別人記得住的名字', desc: '維拓傳媒做個人品牌經營和自媒體 IP 代操，全台線上合作，從人設定位、內容企劃、短影音到變現一起規劃。定位 15,000 元起，代營運每月 20,000 元起。貓探長、村山爺爺、王拓恩都是我們從 0 做起來的。' }),
      S('ipcases', '', { title: '我們從 0 做起來的 IP', sub: '真人、動畫、AI，三種都做過。數字都是帳號後台的真實數據。', items: [
        { name: '村山爺爺', tag: '真人 IP・86 歲日本觀光大使', plat: 'Threads', handle: '@japan.grandpa', url: 'https://www.threads.com/@japan.grandpa', image: M + 'ip_murayama.jpg', desc: '86 歲，當過多年五星級飯店總經理，還在第一線帶日本高端小團。0 粉起號，3 週起量，單夜增粉破千，第 2 個月開始商業變現。', stats: [['Threads 粉絲', '8,225'], ['置頂串文按讚', '2,416'], ['開始變現', '第 2 個月']] },
        { name: '貓探長', tag: '動畫 IP・情緒療癒', plat: 'Instagram', handle: '@mtz.1390931', url: 'https://www.instagram.com/mtz.1390931/', image: M + 'cat.jpg', desc: '插畫動畫結合情緒洞察，拆解職場和感情裡說不出口的事。從 0 粉起號，兩支破 9 萬觀看。', stats: [['單支最高觀看', '9.8 萬'], ['8～10 月 Reels 觀看', '34.7 萬'], ['粉絲', '983']] },
        { name: '王拓恩', tag: 'AI 明星・寫實短劇', plat: 'Instagram', handle: '@en05_24', url: 'https://www.instagram.com/en05_24/', image: M + 'f45.jpg', desc: '23 歲業餘棒球員，公開是 AI。每週一集寫實短劇，拿來接品牌代言。', stats: [['第二季開播', '10 月'], ['〈第五年〉觀看', '2,189'], ['按讚', '101']] }] }),
      S('sgsteps', '', { title: '一個 IP 怎麼做起來', sub: '先想清楚「為什麼值得追」，再開始拍。', steps: [
        ['定位', '你是誰、講給誰聽、跟別人差在哪、之後靠什麼賺錢，一次想清楚'],
        ['起號', '人設、帳號名稱、頭像、簡介、前 9 篇內容一起規劃'],
        ['每週經營', '每週一整理爆款，照著寫腳本、出片、發文、回留言'],
        ['看數據變現', '每月看哪種內容有效，時機到就接業配、導課程或導到店']
      ], note: '老實說：粉絲數沒有人能保證。我們能做的是每週照數據調整，把方向調對。', btn: '去報價單勾選' }),
      S('sgplans', '', { title: '自媒體 IP 代操價格', sub: '先做定位，再決定要我們做到哪裡。', rows: ['人設定位', '內容企劃', '每月內容', '短影音製作', '發文互動', '數據報告'], plans: [
        { id: 'sp', n: '定位起號', who: '先把方向想清楚', v: ['有', '前 9 篇規劃', '—', '—', '—', '—'] },
        { id: 'so', n: '自媒體代營運', tag: '最多人選', hot: 1, who: '個人品牌、講師、顧問', v: ['延續', '每月', '8 篇', '—', '有', '有'] },
        { id: 'sv', n: '短影音內容製作', who: '要短影音衝曝光', v: ['延續', '每月', '4 支', '有', '—', '—'] },
        { id: 'im', n: '整合行銷代營運', who: '品牌想全包', v: ['有', '每月', '依需求', '有', '有', '有'] }
      ], addTitle: '可以加購', adds: [
        ['AI 動畫角色打造（Q 版）', 'cq', null, '不想露臉，做一個角色替你講'],
        ['老闆 AI 分身（建置）', 'twb', null, '用你的臉和聲音，之後口播不用再拍'],
        ['海巡署＋脆文代寫', 'pc', null, 'Threads 每天留言加每週 4 篇貼文'],
        ['社群數據月報', 'dr', null, '每支片看了多少、每千觀看漲幾粉'],
        ['爆款與對手觀察', 'vw', null, '每週拆同類帳號的爆款']
      ], note: '新台幣、未稅；代營運最少 3 個月。寫「起」的依內容量評估。價格最後更新：2026 年 10 月 18 日。' }),
      S('faq', '', { title: 'IP 代操常見問題', sub: '最後更新：2026 年 10 月 18 日', items: IPFAQ }),
      S('reach', '', {}),
      S('next', '', nextOf('/ip-management'))
    ] },
    { id: 'office', name: 'AI 辦公室', slug: '/office', sections: [
      S('pagehead', '', { en: 'AI OFFICE', title: '幫你的公司蓋一間 AI 辦公室', desc: '我們自己就是這樣經營這些 IP。' }),
      S('office', '', { btn: '進組裝台，挑你的 AI 員工', price: '快速代建 NT$48,000 起・維運每月 NT$15,000 起', title: '員工每天照班表上班', desc: '一組 AI 員工找爆款、寫腳本、看數據、回留言，做完把報告交到一個網頁上，你只要看、按同意。', points: [['挑員工', '總管、企劃、剪片、數據、海巡署……照你的行業先幫你挑好'], ['挑辦公室樣子', '員工在畫面上走動、上班，誰在做什麼一眼看到'], ['送出給維拓', '我們幫你在 Claude 裡蓋好，試跑一週調好才交']], staff: [['總管秘書', '每天早上 10:47 早報'], ['企劃編劇', '週一寫這週腳本'], ['數據分析', '每天 07:49 抓數據'], ['海巡署', '每天巡熱門串擬留言'], ['校稿品管', '交件前檢查錯字'], ['留言管家', '每天擬回覆草稿']] }),
      S('ofeat', '', { title: '辦公室裡有什麼', sub: '這些都是我們自己每天在用的，交給你的就是同一套。', items: [
        ['會動的辦公室首頁', '員工在畫面上走動、上班、交件，誰在做什麼、誰卡住了，一眼看到'],
        ['每日早報', '每天早上整理好昨天的數字、今天要注意的事，手機就能看，還能下載 PDF'],
        ['週成績單', '每週一交上週每個帳號的成績、最好最差的片、這週只做哪三件事'],
        ['月報', '每月 1 號自動做好，給老闆、給客戶都可以直接轉'],
        ['爆款包', '每週把同行和自己爆掉的片拆好，寫腳本的人照著寫'],
        ['腳本與分鏡', '每週交腳本讓你挑，挑好的寫成分鏡和拍攝清單'],
        ['自動發文清單', '這週哪天幾點發什麼、發了沒，一張表看完'],
        ['留言待回清單', '哪支片有新留言、回了沒，回完按一下就消失'],
        ['熱門串巡邏', '每天去看最熱的討論串，擬好可以留的話和跟風題目'],
        ['錯字與法務檢查', '交出去之前先抓錯字、字擋臉、有沒有踩到法規'],
        ['要你做的事', '需要你本人點頭或登入的事，收在同一張清單，做完按一下就消失'],
        ['行事曆', '每位員工幾點上班、今天會交什麼，點一格就看報告'],
        ['出錯自動補做', '有人沒交、交壞了，會自己重做一次，真的不行才通知你'],
        ['完成率與犯錯排行', '每天、每週看大家做到幾成、誰最常出錯、浪費多少點數'],
        ['手機推播', '重要的事直接推到手機，不重要的安靜放著'],
        ['帳本與點數', '每週整理收據、看 AI 工具點數還剩多少，快超支先提醒']
      ] }),
      S('ostaff', '', { title: '員工名單', sub: '依你的行業挑，不用全請。下面是我們自己辦公室的編制。', deps: [
        ['內容部', [['企劃編劇', '每週寫腳本讓你挑'], ['分鏡導演', '把腳本變成每一鏡的拍法'], ['美術總監', '封面、輪播、海報、限動圖'], ['影片師', '剪片、上字幕、配樂'], ['配音師', '挑聲音、配口播、挑配樂'], ['校對', '所有字交出去前逐字檢查']]],
        ['數據部', [['數據分析', '每天抓各帳號數字'], ['爆款偵察', '每週拆同行和自己的爆款'], ['競品觀察', '盯同類帳號有沒有片爆了'], ['市場分析', '你的受眾最近在找什麼']]],
        ['社群部', [['脆文小編', '每天寫脆、排好自動發'], ['海巡署', '巡熱門串、擬留言'], ['留言管家', '整理留言、提醒你回'], ['名單小幫手', '做免費小禮物收名單']]],
        ['營運部', [['AI 主管', '每週交成績單'], ['月報秘書', '每月月報、每週行事曆'], ['業務', '追誰在等你回、草稿寫好'], ['法務', '每週看腳本有沒有觸法'], ['技術長', '巡查大家有沒有做完、沒做完叫回來補'], ['會計', '整理收據、算花費']]],
        ['App 部（有 App 才需要）', [['App 工程師', '每天巡 App 有沒有壞、有沒有新評論'], ['驗收員', '修好的版本先挑錯才放行']]]
      ] }),
      S('owhy', '', { btn: '進組裝台，挑你的 AI 員工', price: '快速代建 NT$48,000 起・量身打造另外估價・維運每月 NT$15,000 起', title: '那我自己叫 AI 做就好？', sub: '可以試試看。我們花了好幾個月才讓它每天穩定上班。', items: [
        ['不是一句話的事', '每位員工的工作說明都改過幾十次，哪裡會出錯、出錯怎麼補，都是跑出來的'],
        ['會自己補做', '排程沒跑完、交壞了，系統會自己重做，你不用每天盯'],
        ['點數不亂燒', '先用免費的，要花錢先問你；每一筆都記帳，超過預算就停'],
        ['我們幫你顧', '試跑一週調好才交；之後每月維運，AI 工具一改版我們先處理']
      ] }),
      S('msgform', '', { title: '想要一間 AI 辦公室？先留言' }),
      S('reach', '', {}),
      S('next', '', nextOf('/office'))
    ] },
    { id: 'seogeo', name: 'SEO・AEO・GEO', slug: '/seo-geo', sections: [
      S('pagehead', '', { en: 'SEO × AEO × GEO', title: '客人問 Google、問 AI，都聽得到你的店名', desc: '以前客人在 Google 搜「汐止 做臉」，自己從十個連結裡挑；現在越來越多人直接問 ChatGPT「汐止哪家做臉好」，AI 只會講兩三家。沒被講到，客人根本不知道你。這條路，我們幫你一次顧好。' }),
      S('sgdemo', '', { title: '同一個客人，三種找店的方式', sub: '你的店要在每一種都被看到。', q: '汐止 做臉 推薦', shop: '你的店', items: [
        { en: 'SEO', t: 'Google 搜尋', kind: 'list', rows: ['你的店｜汐止做臉・首次體驗 1,980 元', 'A 美容工作室', 'B 皮膚管理', 'C 美學中心'] },
        { en: 'AEO', t: 'Google 直接給答案', kind: 'answer', text: '汐止做臉首次體驗大約 1,500～2,500 元。像「你的店」首次體驗 1,980 元、約 60 分鐘，含肌膚檢測。' },
        { en: 'GEO', t: '問 ChatGPT', kind: 'chat', ask: '汐止有推薦的做臉嗎？', text: '汐止評價不錯的有幾家：1.「你的店」，Google 評論 4.9 分，客人常提到做完不紅、不推銷…' }
      ], note: '畫面是示意，不是真實搜尋結果。' }),
      S('sgpair', '', { title: 'SEO、AEO、GEO 差在哪？', sub: '一句話：SEO 讓 Google 把你排前面，AEO 讓 Google 直接拿你的話當答案，GEO 讓 AI 說出你的名字。三個是同一條路，功夫大部分重疊，一起做最省。', items: [
        { en: 'SEO', t: 'Google 搜尋・Google 地圖', p: '客人搜「地區＋服務」的時候，你出現在前面、地圖前三家。', list: ['挑出客人真的會搜的關鍵字', '官網標題、內容、速度調好', '每月寫文章回答客人常問的事', 'Google 商家資料和評論顧好', '每週追排名，月報給你看'] },
        { en: 'AEO', t: '精選摘要・Google AI 摘要・語音助理', p: '客人問一個問題，Google 不給連結、直接秀出答案，答案就是你網站上的那一段。', list: ['把客人常問的問題一題一題寫成問答', '每題第一句就回答，再補細節', '價格、時間、步驟寫成清楚的數字和條列', '加上問答結構化資料，讓 Google 認得'] },
        { en: 'GEO', t: 'ChatGPT・Gemini・Perplexity', p: '客人問 AI「哪家好」的時候，AI 會講到你、引用你的網站。', list: ['每月用同一組問題實測 AI 有沒有提到你', '官網改成 AI 好引用的寫法：第一句就給答案、價格寫清楚', '常見問答頁和結構化資料', '開放 AI 爬蟲、放給 AI 看的網站說明', '店名地址電話在各平台一字不差'] }
      ] }),
      S('ofeat', '', { title: '每個月幫你做的事', sub: '我們自己的官網就是這樣做的，交給你的是同一套。', items: [
        ['先健檢', '實測 Google 排名和 AI 回答，跟 3 家同業比，給你一份照順序做的清單'],
        ['填一份問卷', '服務、價格、客人常問的問題、跟別家差在哪，用手機寫一次就好'],
        ['挑關鍵字', '依方案 5～20 組，挑客人真的會搜、你做得到的'],
        ['寫文章', '每月 2～8 篇，回答客人真的會問的問題'],
        ['改官網', '每頁開頭先給答案，數字和價格寫清楚，問答頁每月整理'],
        ['讓 AI 讀得到', '結構化資料、AI 爬蟲設定、給 AI 看的網站說明都建好'],
        ['問 AI 一輪', '每月用同一組 10～20 個問題，看 AI 有沒有提到你、推薦了誰'],
        ['月報', '排名、地圖、AI 提到幾次；這個月做了什麼、下個月做什麼']
      ] }),
      S('sgreport', '', { title: '每個月你會收到這樣一份報告', sub: '不用看懂後台，打開手機就知道：Google 和 AI 這個月有沒有更常推薦你、我們做了什麼、下個月做什麼。', head: '○○美學 10 月 SEO・AEO・GEO 報告', period: '10/1–10/31', kpis: [
        ['AI 提到你', '6／20 題', '+3 題', 'ChatGPT、Gemini、Google AI 摘要實測'],
        ['AI 推薦名次', '第 2 名', '+1', '有提到時，平均排第幾家'],
        ['Google 曝光', '3,840 次', '+42%', '你的網站出現在搜尋結果的次數'],
        ['Google 點擊', '212 次', '+35%', '點進你網站的人'],
        ['地圖前三名', '4／10 組', '+2 組', '「汐止 做臉」這類關鍵字'],
        ['新增評論', '18 則', '+18', '平均 4.9 分']],
      chartTitle: '每天 Google 曝光', chart: [60, 72, 70, 88, 95, 90, 104, 118, 112, 126, 131, 140, 138, 152, 160, 158, 170, 176, 181, 190],
      qTitle: 'AI 實測（每月同一組問題，這裡列 5 題）', engines: ['ChatGPT', 'Gemini', 'AI 摘要'], qs: [
        ['汐止有推薦的做臉嗎？', [1, 1, 1]], ['汐止做臉多少錢？', [1, 0, 1]], ['敏感肌可以去哪裡做保養？', [0, 0, 1]], ['汐止哪家美容院評價好？', [1, 0, 0]], ['做臉會不會一直被推銷？', [0, 0, 0]]],
      done: ['新增 4 篇文章：敏感肌保養、首次體驗流程等', '問答頁補 6 題，每題第一句就給答案', 'Google 商家發 4 則貼文、回覆 18 則評論'],
      next: ['「做臉會不會被推銷」寫一篇真實說明，搶下 AI 還沒提到的題目', '請 5 位老客人寫具體的評論', '服務頁補上價格和時間'],
      note: '畫面是示意，店名和數字都是範例，不是真實客戶資料。' }),
      S('sgsteps', '', { title: '怎麼開始', sub: '不用一開始就簽月約，先看清楚自己現在在哪。', steps: [
        ['先做健檢 NT$4,800', 'Google 排名和 AI 能見度一起看，報告會告訴你最該先做哪幾件事'],
        ['看報告再決定', '想自己做就照清單做；要我們代操，健檢費可以全額抵第一個月'],
        ['填建置問卷', '我們傳一條你專屬的連結，手機就能填，資料不用重講'],
        ['開始代操', '最少 6 個月，通常 3～6 個月看得出變化，每月一份月報']
      ], note: '老實說：AI 要推薦誰，沒有人能保證。我們能做的，是把被推薦的機會拉到最高，每個月用同一組問題實測給你看。', btn: '去報價單勾選方案' }),
      S('sgplans', '', { title: '方案和價錢', sub: 'SEO、AEO、GEO 每個方案都包含；有實體店面、想要 Google 地圖排前面，選在地全包最划算。', rows: ['SEO 關鍵字', '每月文章', 'AEO 問答頁', 'GEO：AI 有沒有提到你', 'Google 地圖排名代操', '外部曝光', '競爭對手監測', '月報'], plans: [
        { id: 'sg2', n: '入門', who: '剛起步、先把基礎打好', v: ['5 組', '2 篇', '建 10 題', '每月追 10 題', '—', '—', '—', '每月'] },
        { id: 'sg3', n: '標準', tag: '最多人選', hot: 1, who: '想穩定被搜到、被 AI 推薦', v: ['10 組', '4 篇', '每月整理', '每月追 20 題', '—', '每月 1 則', '—', '每月'] },
        { id: 'sg5', n: '在地全包', tag: '有店面推薦', hot: 1, who: '美業、餐飲、診所等實體店', v: ['10 組', '4 篇', '每月整理', '每月追 20 題', '每日追排名・貼文・回評論', '每月 1 則', '—', '每月'] },
        { id: 'sg4', n: '進階', who: '競爭激烈、要拚第一', v: ['15～20 組', '6～8 篇', '每月整理', '每週追蹤', '另計', '每月 2～3 則', '有', '每月'] }
      ], addTitle: '也可以單買', adds: [
        ['AI 能見度＋SEO 健檢', 'sg0', '／一次', '先看清楚現在在哪；簽月約可全額抵第一個月'],
        ['Google 商家地圖優化', 'gm', '／一次', '商家檔案建立、資訊補齊、關鍵字設定'],
        ['Google 地圖排名代操', 'gr', '／每月', '每日追排名、商家貼文、評論回覆、九宮格排名月報'],
        ['GEO＋AEO 加購', 'sg1', '／每月', '已經有地圖代操的店家，再加 AI 推薦'],
      ], note: '新台幣、未稅；月費方案最少 6 個月。寫「起」的依店家狀況評估。' }),
      S('faq', '', { title: 'SEO・AEO・GEO 常見問題', items: SGFAQ }),
      S('reach', '', {}),
      S('next', '', nextOf('/seo-geo'))
    ] },
    { id: 'about', name: '關於我們', slug: '/about', sections: [
      S('pagehead', '', { en: 'ABOUT', title: '關於維拓傳媒：我們自己經營 IP，再把同一套做法交給你', desc: '維拓傳媒是維拓顧問有限公司（統一編號 62180576）的品牌，由陳卓恩（Vic）創辦。Vic 在傳播、傳媒這一行做了快 10 年，以前也做過娛樂直播。公司在新北市汐止區，全台線上合作。我們自己從 0 經營貓探長、村山爺爺、王拓恩三個帳號，也幫店家和個人品牌做 AI 動畫代言、短影音代操、自媒體 IP 代操、網頁設計、SEO・AEO・GEO 和 LINE AI 客服，每一項都有公開價格。' }),
      S('founder', '', { tag: '創辦人', name: '陳卓恩 Vic', image: M + 'vic.jpg', alt: '維拓傳媒創辦人陳卓恩（Vic）', paras: ['在傳播、傳媒這一行做了快 10 年，以前也做過娛樂直播，知道一支片、一場直播怎麼讓人停下來看。', '現在帶著一組 AI 員工，自己經營貓探長、村山爺爺、王拓恩三個帳號，做出成績的方法再拿去幫客人做：AI 動畫代言、短影音代操、自媒體 IP、網頁設計和 SEO・AEO・GEO。'] }),
      S('ofeat', '', { title: '我們是誰', sub: '查得到的資料都寫在這裡。', items: [
        ['公司', '維拓顧問有限公司，統一編號 62180576'],
        ['創辦人', '陳卓恩（Vic），在傳播、傳媒這一行做了快 10 年，以前也做過娛樂直播'],
        ['地點', '新北市汐止區；全台線上合作，拍攝和簽約我們到你那邊'],
        ['自己的帳號', '貓探長、村山爺爺、王拓恩，都是我們從 0 開始經營'],
        ['做事的方法', '一組 AI 員工每週找爆款、寫腳本、追數據、檢查網站，人看過才交出去'],
        ['價格', '每一項服務都公開標價，在「服務與報價」勾選就算得出合計'],
        ['聯絡', '電話 0903-454-333、LINE @898biiyu、IG victor_149131'],
        ['服務時間', '週一至週五 10:00–21:00']
      ] }),
      S('bignum', 'counters', { title: '我們自己做出來的數字', items: [{ value: '9.8 萬', label: '貓探長單支觀看' }, { value: '34.7 萬', label: '貓探長兩個月 Reels 觀看' }, { value: '3 週', label: '村山爺爺從 0 到起量' }, { value: '第 2 個月', label: '村山爺爺開始變現' }] }),
      S('sgsteps', '', { title: '跟我們合作的流程', sub: '先看清楚再決定，不用一次花大錢。', steps: [
        ['LINE 聊一下', '說你的店或品牌、想解決什麼，我們先回你適合哪一種做法'],
        ['看報價', '每一項都有公開價格，在報價頁勾好就知道大概多少'],
        ['先試做', 'AI 動畫有免費角色試看和 1,990 元體驗片，網站和搜尋可以先做健檢'],
        ['正式開始', '簽約後照月計畫做，每月給你數據報告']
      ], btn: '去報價單勾選' }),
      S('faq', '', { title: '關於維拓傳媒的常見問題', sub: '最後更新：2026 年 10 月 19 日', items: ABOUTFAQ }),
      S('reach', '', {}),
      S('next', '', nextOf('/about'))
    ] },
    { id: 'contact', name: '聯絡我們', slug: '/contact', sections: [
      S('pagehead', '', { en: 'CONTACT', title: '跟我們聊聊', desc: '想做 IP、想問價錢、想蓋 AI 辦公室，LINE 傳一句就好。' }),
      S('reach', '', {}),
      S('msgform', '', {}),
      S('faq', '', { title: '常見問題', items: FAQ }),
      CONTACT,
      S('next', '', nextOf('/contact'))
    ] }
  ].concat(SVC.map(function (x, gi) {
    return { id: 'svc' + gi, name: x.name, slug: '/services/' + x.slug, hidden: true, sections: [
      S('pagehead', '', { en: 'SERVICE', title: x.name, desc: x.intro }),
      S('svclist', '', { gi: gi }),
      S('reach', '', {}),
      S('faq', '', { title: '常見問題', items: FAQ }),
      S('next', '', nextOf('/services/' + x.slug))
    ] };
  }))
};

site.pages.forEach(function (p) { p.sections.forEach(function (s, i) { s.id = p.id + '_' + i; }); });
var DEF = {}; site.pages.forEach(function (p) { p.sections.forEach(function (s) { DEF[s.id] = JSON.parse(JSON.stringify(s.data)); }); });
var CAT_DEF = JSON.parse(JSON.stringify(CAT));
/* 後台改的內容（Supabase web_settings）：site_pages、site_catalog、line_id、instagram */
function fixM(o) { var t = JSON.stringify(o).replace(/"\/?m\//g, '"' + M); if (PATHMODE) t = t.replace(/"#\//g, '"/'); return JSON.parse(t); }
function applyContent(rows) {
  var kv = {}; (rows || []).forEach(function (r) { kv[r.key] = r.value; });
  if (kv.line_id) LINE_ID = kv.line_id;
  if (kv.instagram) IG = String(kv.instagram).replace(/^@/, '');
  var pg = {}; try { pg = JSON.parse(kv.site_pages || '{}') || {}; } catch (e) {}
  site.pages.forEach(function (p) { p.sections.forEach(function (s) { var o = pg[s.id]; s.hide = !!(o && o._hide); s.data = o && !o._hide ? fixM(o) : JSON.parse(JSON.stringify(DEF[s.id])); }); });
  try { var c = JSON.parse(kv.site_catalog || 'null'); if (Array.isArray(c) && c.length) setCat(fixM(c)); } catch (e) {}
  var dr = site.pages[0].sections.filter(function (s) { return s.type === 'doors'; })[0], doors = dr ? dr.data.items : DOORS;
  site.pages.forEach(function (p) { p.sections.forEach(function (s) { if (s.type === 'next') s.data = nextOf(p.slug, doors); if (s.type === 'contact') { s.data.line = LINE_ID; s.data.ig = IG; } }); });
}
function loadContent() {
  try { return fetch(SB_URL + '/rest/v1/web_settings?select=key,value', { headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY } }).then(function (r) { return r.ok ? r.json() : []; }).catch(function () { return []; }); } catch (e) { return Promise.resolve([]); }
}
export var DEFAULTS = { pages: site.pages, def: DEF, catalog: CAT_DEF, sb: { url: SB_URL, key: SB_KEY }, M: M };

function norm(x) { return String(x || '/').replace(/^#/, '').replace(/\/+$/, '') || '/'; }
function idxByPath(pth) { var i = site.pages.findIndex(function (p) { return norm(p.slug) === norm(pth); }); return i < 0 ? 0 : i; }
function idxOf() { if (typeof location === 'undefined') return 0; if (PATHMODE) { if (/^#\//.test(location.hash)) { location.replace(norm(location.hash)); } return idxByPath(location.pathname); } var hs = location.hash || '/'; var i = site.pages.findIndex(function (p) { return p.slug === hs; }); return i < 0 ? 0 : i; }
function App(props) {
  var pre = props && props.rows;
  var st = useState(function () { return props && props.path ? idxByPath(props.path) : pre ? 0 : idxOf(); }), pi = st[0], setPi = st[1];
  var rd = useState(function () { if (pre) { applyContent(pre); return 1; } return 0; }), ver = rd[0], setVer = rd[1];
  React.useEffect(function () {
    if (pre) { if (/^#\//.test(location.hash)) idxOf(); return; }
    var t = setTimeout(function () { setVer(function (v) { return v || 1; }); }, 2500);
    loadContent().then(function (rows) { applyContent(rows); clearTimeout(t); setVer(function (v) { return v + 1; }); });
  }, []);
  React.useEffect(function () {
    function on() { setPi(idxOf()); window.scrollTo(0, 0); }
    window.addEventListener('hashchange', on);
    function cl(e) { if (PATHMODE) return; var a = e.target.closest && e.target.closest('a[href="/"]'); if (a) { e.preventDefault(); location.hash = '/'; } }
    document.addEventListener('click', cl);
    return function () { window.removeEventListener('hashchange', on); document.removeEventListener('click', cl); };
  }, []);
  React.useEffect(function () { if (!PATHMODE) document.title = (pi ? site.pages[pi].name + '｜' : '') + '維拓傳媒'; }, [pi]);
  if (!ver) return null;
  var view = Object.assign({}, site, { pages: site.pages.map(function (p) { return Object.assign({}, p, { sections: p.sections.filter(function (s) { return !s.hide; }) }); }) });
  return h(Site, { key: pi + '-' + ver, site: view, pageIndex: pi });
}
export default App;
