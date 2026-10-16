'use client';
import React from 'react';
import qrcode from 'qrcode-generator';
import U from './ui.js';
var R = React, h = R.createElement, F = R.Fragment, useState = R.useState, useEffect = R.useEffect, useMemo = R.useMemo;
var SECTION_TYPES = {
  hero:     { name:'主視覺', variants:{ split:'左文右圖', 'split-left':'左圖右文', stacked:'文上圖下', cover:'滿版大圖', center:'置中', band:'滿版色底', minimal:'純文字', giant:'超大字', diagonal:'斜切色塊', frame:'相框式' },
              fields:[['eyebrow','眉標'],['title','主標'],['desc','說明','area'],['primary','主要按鈕'],['secondary','次要按鈕'],['note','小字']], image:true },
  features: { name:'特色', variants:{ cards:'三張卡片', list:'圖示清單', steps:'步驟' },
              fields:[['title','標題'],['sub','副標']], items:{ label:'特色', fields:[['title','標題'],['desc','說明']] } },
  pricing:  { name:'方案／價格', variants:{ cards:'方案卡片', table:'比較表', list:'簡單清單' },
              fields:[['title','標題'],['sub','副標']], items:{ label:'方案', fields:[['title','名稱'],['price','價格'],['desc','說明']] } },
  gallery:  { name:'作品／項目', variants:{ grid:'格狀', rows:'橫式', wide:'大圖', masonry:'瀑布流', list:'編號清單' },
              fields:[['title','標題'],['sub','副標']], items:{ label:'項目', fields:[['title','標題'],['desc','說明'],['tag','標籤']], image:true } },
  testimonials:{ name:'客戶見證', variants:{ cards:'多則卡片', quote:'單則引言', marquee:'跑馬燈', wall:'留言牆' },
              fields:[['title','標題']], items:{ label:'見證', fields:[['quote','內容','area'],['name','姓名'],['role','身分']] } },
  faq:      { name:'常見問題', variants:{ list:'清單', columns:'兩欄' },
              fields:[['title','標題']], items:{ label:'問題', fields:[['q','問題'],['a','回答','area']] } },
  cta:      { name:'行動呼籲', variants:{ band:'色帶', boxed:'方框' },
              fields:[['title','標題'],['desc','說明'],['primary','按鈕']] },
  text:     { name:'文字／數字', variants:{ prose:'段落', stats:'數字' },
              fields:[['title','標題'],['body','內文','area']], items:{ label:'數字', fields:[['value','數值'],['label','說明']] } },
  team:     { name:'團隊', variants:{ cards:'卡片', list:'清單' },
              fields:[['title','標題']], items:{ label:'成員', fields:[['name','姓名'],['role','職稱']], image:true } },
  news:     { name:'最新消息', variants:{ cards:'卡片', list:'清單' },
              fields:[['title','標題']], items:{ label:'消息', fields:[['title','標題'],['date','日期'],['tag','分類']], image:true } },
  contact:  { name:'聯絡／預約', variants:{ split:'表單 + 資訊', form:'只有表單', info:'只有資訊', channels:'聯絡管道按鈕', line:'LINE 加好友 + QR', map:'地圖 + 資訊' },
              fields:[['title','標題'],['sub','副標'],['addr','地址'],['hours','營業時間'],['line','LINE ID（@開頭）'],['phone','電話'],['email','Email'],['ig','Instagram'],['fb','Facebook']] },
  logos:    { name:'合作夥伴／媒體', variants:{ chips:'標籤牆', row:'一列文字' },
              fields:[['title','標題']], items:{ label:'品牌', fields:[['name','名稱']] } },
  timeline: { name:'流程／歷程', variants:{ vertical:'直式時間軸', horizontal:'橫式步驟' },
              fields:[['title','標題'],['sub','副標']], items:{ label:'節點', fields:[['when','時間／階段'],['title','標題'],['desc','說明']] } },
  video:    { name:'影片', variants:{ full:'滿版影片', side:'影片 + 文字' },
              fields:[['title','標題'],['desc','說明','area'],['caption','影片說明']] },
  products: { name:'商品', variants:{ grid4:'四欄商品', grid2:'兩欄大圖' },
              fields:[['title','標題'],['sub','副標']], items:{ label:'商品', fields:[['title','品名'],['desc','規格'],['price','價格']], image:true } },
  social:   { name:'社群牆', variants:{ grid:'六格', big:'三格大圖' },
              fields:[['title','標題'],['handle','帳號']] },
  download: { name:'App 下載', variants:{ split:'手機 + 文字', center:'置中' },
              fields:[['title','標題'],['desc','說明','area'],['note','小字']] },
  marquee:  { name:'跑馬燈', variants:{ text:'文字跑馬燈', big:'超大字跑馬燈', logos:'Logo 跑馬燈' },
              fields:[], items:{ label:'字句', fields:[['text','文字']] } },
  bento:    { name:'便當格', variants:{ five:'5 格', seven:'7 格' },
              fields:[['title','標題'],['sub','副標']], items:{ label:'格子', fields:[['title','標題'],['desc','說明'],['tag','小標']], image:true } },
  zigzag:   { name:'Z 字圖文', variants:{ left:'圖先左', right:'圖先右' },
              fields:[['title','標題']], items:{ label:'段落', fields:[['tag','小標'],['title','標題'],['desc','說明','area'],['cta','按鈕']], image:true } },
  bignum:   { name:'超大字', variants:{ statement:'一句宣言', counters:'巨型數字', outline:'鏤空字' },
              fields:[['title','大字'],['desc','小字','area']], items:{ label:'數字', fields:[['value','數值'],['label','說明']] } },
  collage:  { name:'拼貼', variants:{ stack:'疊圖', scatter:'散落', polaroid:'拍立得' },
              fields:[['title','標題'],['desc','說明','area']], items:{ label:'照片', fields:[['caption','說明']], image:true } },
  carousel: { name:'橫向滑動', variants:{ cards:'卡片', wide:'大圖', peek:'露一點' },
              fields:[['title','標題'],['sub','副標']], items:{ label:'項目', fields:[['title','標題'],['desc','說明'],['tag','標籤']], image:true } },
  menu:     { name:'菜單清單', variants:{ dots:'點線價格', columns:'兩欄', plain:'極簡' },
              fields:[['title','標題'],['sub','副標']], items:{ label:'品項', fields:[['title','品名'],['desc','說明'],['price','價格']] } },
  story:    { name:'捲動故事', variants:{ left:'文字固定在左', right:'文字固定在右' },
              fields:[['title','標題'],['desc','說明','area']], items:{ label:'段落', fields:[['title','小標'],['desc','說明']], image:true } },
  divider:  { name:'分隔裝飾', variants:{ slant:'斜切', wave:'波浪', word:'一句大字', line:'裝飾線' },
              fields:[['text','文字']] },
  beforeafter:{ name:'前後對比', variants:{ slider:'拉桿', side:'左右並排' },
              fields:[['title','標題'],['sub','副標'],['before','左邊標籤'],['after','右邊標籤']], images:[['imageBefore','左邊圖片'],['imageAfter','右邊圖片']] }
};

function ContactForm(p){
  var st = useState('idle'), status = st[0], setStatus = st[1];
  function submit(e){ e.preventDefault(); var fd = new FormData(e.target); var body = {}; fd.forEach(function(v,k){ body[k] = v; }); body.page = p.page; setStatus('sending');
    fetch('/api/contact', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)}).then(function(r){ return r.ok ? setStatus('ok') : setStatus('err'); }).catch(function(){ setStatus('err'); }); }
  if (status==='ok') return h(U.Alert, {tone:'success', title:'已送出'}, '我們收到了，會盡快與你聯絡。');
  return h('form', {className:'formgrid', onSubmit:submit},
    h(U.Input, {label:'姓名', name:'name', placeholder:'王小明', required:true}), h(U.Input, {label:'手機', name:'phone', placeholder:'0912-345-678', required:true}),
    h(U.Input, {className:'full', label:'Email', name:'email', type:'email', placeholder:'選填'}),
    h(U.Textarea, {className:'full', label:'想說的話', name:'message', placeholder:'選填', rows:3}),
    h('input', {type:'text', name:'website', tabIndex:-1, autoComplete:'off', style:{position:'absolute', left:-9999}, 'aria-hidden':'true'}),
    status==='err' ? h('div', {className:'full'}, h(U.Alert, {tone:'danger'}, '送出失敗，請直接用 LINE 或電話聯絡我們。')) : null,
    h('div', {className:'full'}, h(U.Button, {size:'lg', type:'submit', iconRight:'arrow-right', loading:status==='sending'}, '送出')));
}
/* ---------- 聯絡用圖示與 QR ---------- */
var CPATH = { line:'M12 3C6.5 3 2 6.6 2 11c0 3.9 3.4 7.1 8 7.8V22l3.6-2.4C18.5 19 22 15.4 22 11c0-4.4-4.5-8-10-8z', phone:'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2', mail:'M3 6h18v12H3zM3 7l9 6 9-6', map:'M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', ig:'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17.5 6.5v.5', fb:'M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z', top:'M12 19V5M5 12l7-7 7 7' };
function CIcon(p){ var fill = p.name==='line'; return h('svg', {width:p.size||22, height:p.size||22, viewBox:'0 0 24 24', fill: fill ? 'currentColor' : 'none', stroke:'currentColor', strokeWidth: fill ? 0 : 1.75, strokeLinecap:'round', strokeLinejoin:'round', 'aria-hidden':'true'}, h('path', {d:CPATH[p.name] || CPATH.mail})); }
function QR(p){
  var svg = useMemo(function(){ try { var q = qrcode(0, 'M'); q.addData(p.text); q.make(); return q.createSvgTag({cellSize:4, margin:2, scalable:true}); } catch(e){ return null; } }, [p.text]);
  if (!svg) return h('div', {className:'qrfake', 'aria-label':'QR code'}, h('div'), h('div'), h('div'), h('div'), h('div'), h('div'), h('div'), h('div'), h('div'));
  return h('div', {className:'qrsvg', dangerouslySetInnerHTML:{__html:svg}});
}
/* ---------- 浮動聯絡鈕 ---------- */
function FloatContact(p){
  var c = p.contact || {}, mode = p.mode || 'none'; if (mode==='none') return null;
  var lineUrl = 'https://line.me/R/ti/p/' + encodeURIComponent(c.line || '@line');
  return h('div', {className:'floatc ' + mode},
    mode==='multi' && c.phone ? h('a', {className:'fbtn phone', href:'tel:' + c.phone, 'aria-label':'撥打電話'}, h(CIcon, {name:'phone'})) : null,
    h('a', {className:'fbtn line', href:lineUrl, target:'_blank', rel:'noopener', 'aria-label':'LINE 聯絡'}, h(CIcon, {name:'line', size:26}), mode==='line' ? h('span', null, 'LINE 聯絡') : null),
    mode==='multi' ? h('button', {className:'fbtn top', type:'button', 'aria-label':'回到頂端', onClick:function(){ window.scrollTo({top:0, behavior:'smooth'}); }}, h(CIcon, {name:'top'})) : null);
}

/* ---------- 區塊渲染 ---------- */
function Ph(i, cls, src){ return h('div', {className:'ph ' + (cls||'') + (src ? ' has-img' : ''), 'data-i':(i||0)%3}, src ? h('img', {src:src, alt:''}) : null); }
function Head(d){ if (!d.title && !d.sub) return null; return h('div', {className:'shead'}, d.title ? h('h2', null, d.title) : null, d.sub ? h('p', null, d.sub) : null); }
var RENDER = {
  hero: function(d, v, ctx){
    var btns = h('div', {className:'btns'}, d.primary ? h(U.Button, {size:'lg', iconRight:'arrow-right', onClick:ctx.cta}, d.primary) : null, d.secondary ? h(U.Button, {size:'lg', variant:'secondary'}, d.secondary) : null);
    var copy = function(){ return [d.eyebrow ? h('span', {key:'e', className:'eyebrow'}, d.eyebrow) : null, h('h1', {key:'t'}, d.title), d.desc ? h('p', {key:'d'}, d.desc) : null, btns, d.note ? h('span', {key:'n', className:'note'}, d.note) : null]; };
    if (v==='split' || v==='split-left') return h('section', {className:'hero-split' + (v==='split-left' ? ' left' : '')}, h('div', {className:'inner'}, h('div', {className:'copy'}, copy()), h('div', {className:'media'}, Ph(0, '', d.image))));
    if (v==='stacked') return h('section', {className:'hero-stacked'}, h('div', {className:'inner'}, h('div', {className:'copy'}, copy()), h('div', {className:'media'}, Ph(1, '', d.image))));
    if (v==='cover') return h('section', {className:'hero-cover'}, Ph(2, '', d.image), h('div', {className:'shade'}), h('div', {className:'copy'}, copy()));
    if (v==='center') return h('section', {className:'hero-stacked'}, h('div', {className:'inner'}, h('div', {className:'copy'}, copy())), h('div', {style:{height:24}}));
    if (v==='band') return h('section', {className:'hero-band'}, h('div', {className:'sec-inner'}, d.eyebrow ? h('span', {className:'eyebrow inv'}, d.eyebrow) : null, h('h1', null, d.title), h('p', null, d.desc), h('div', {className:'btns'}, d.primary ? h(U.Button, {size:'lg', variant:'secondary', onClick:ctx.cta}, d.primary) : null, d.secondary ? h('a', {className:'ghostlink', href:'#', onClick:function(e){ e.preventDefault(); }}, d.secondary, ' →') : null), d.note ? h('p', {className:'note'}, d.note) : null));
    if (v==='minimal') return h('section', {className:'hero-min'}, h('div', {className:'sec-inner'}, d.eyebrow ? h('span', {className:'eyebrow'}, d.eyebrow) : null, h('h1', null, d.title), h('p', null, d.desc), h('div', {className:'btns'}, d.primary ? h(U.Button, {size:'lg', iconRight:'arrow-right', onClick:ctx.cta}, d.primary) : null, d.secondary ? h(U.Button, {size:'lg', variant:'ghost'}, d.secondary) : null), d.note ? h('p', {className:'note'}, d.note) : null));
    return h('section', {className:'hero-split'}, h('div', {className:'inner'}, h('div', {className:'copy'}, copy()), h('div', {className:'media'}, Ph(0, '', d.image))));
  },
  features: function(d, v){
    var it = d.items || [];
    if (v==='list') return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'flist'}, it.map(function(f,i){ return h('div', {key:i, className:'fitem'}, h('span', {className:'ic'}, h(U.Icon, {name:['star','check','heart','bell','cart','user'][i%6], size:18})), h('div', null, h('b', null, f.title), h('p', null, f.desc))); }))));
    if (v==='steps') return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('ol', {className:'steps'}, it.map(function(f,i){ return h('li', {key:i}, h('span', {className:'num'}, i+1), h('b', null, f.title), h('p', null, f.desc)); }))));
    return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'feat'}, it.map(function(f,i){ return h('div', {key:i}, h('span', {className:'ic'}, h(U.Icon, {name:['star','check','heart','bell','cart','user'][i%6], size:18})), h('b', null, f.title), h('p', null, f.desc)); }))));
  },
  pricing: function(d, v, ctx){
    var it = d.items || [];
    if (v==='table') return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h(U.Table, {columns:[{key:'title', label:'方案'},{key:'desc', label:'內容'},{key:'price', label:'價格', align:'right', render:function(r){ return h('b', {className:'wt-num'}, r.price); }},{key:'x', label:'', align:'right', render:function(r){ return h(U.Button, {size:'sm', variant:r.featured ? 'primary' : 'secondary', onClick:ctx.cta}, '選擇'); }}], rows:it.map(function(x,i){ return Object.assign({id:i}, x); })})));
    if (v==='list') return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner'}, Head(d), h(U.List, null, it.map(function(x,i){ return h(U.ListItem, {key:i, title:x.title, description:x.desc, meta:h('b', null, x.price), trailing: x.featured ? h(U.Badge, {tone:'brand', size:'sm'}, '推薦') : h('span'), onClick:ctx.cta}); }))));
    return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'grid3'}, it.map(function(x,i){ return h(U.Card, {key:i, eyebrow:x.featured ? '最多人選' : undefined, title:x.title, subtitle:x.desc, footer:h(F, null, h('span', {className:'price'}, x.price), h(U.Button, {size:'sm', variant:x.featured ? 'primary' : 'secondary', onClick:ctx.cta}, '選擇'))}, x.featured ? h(U.Badge, {tone:'brand'}, '推薦') : null); }))));
  },
  gallery: function(d, v, ctx){
    var it = d.items || [];
    if (v==='rows') return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'col-list'}, it.map(function(x,i){ return h(U.Card, {key:i, horizontal:true, image:Ph(i,'tall',x.image), eyebrow:x.tag, title:x.title, subtitle:x.desc, footer:h(F, null, h('span'), h(U.Button, {size:'sm', variant:'ghost', iconRight:'arrow-right'}, '看更多'))}); }))));
    if (v==='wide') return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'wide'}, it.map(function(x,i){ return h('div', {key:i, className:'wcard'}, Ph(i,'big',x.image), h('div', {className:'wcap'}, x.tag ? h('span', {className:'eyebrow'}, x.tag) : null, h('b', null, x.title), h('p', null, x.desc))); }))));
    return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'grid3'}, it.map(function(x,i){ return h(U.Card, {key:i, image:Ph(i,'',x.image), title:x.title, subtitle:x.desc, footer:h(F, null, h('span', {className:'price'}, x.tag), h(U.Button, {size:'sm', variant:'secondary', onClick:ctx.cta}, ctx.ordersLabel))}); }))));
  },
  testimonials: function(d, v){
    var it = d.items || [];
    if (v==='quote' || it.length===1) { var q = it[0] || {}; return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner quote1'}, Head(d), h('blockquote', null, '「' + (q.quote||'') + '」'), h('p', {className:'who'}, h('span', {className:'wt-avatar'}, (q.name||'').slice(0,1)), h('b', null, q.name), h('span', null, q.role)))); }
    return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'grid3'}, it.map(function(q,i){ return h('div', {key:i, className:'tcard'}, h('p', null, '「' + q.quote + '」'), h('div', {className:'who'}, h('span', {className:'wt-avatar'}, (q.name||'').slice(0,1)), h('div', null, h('b', null, q.name), h('span', null, q.role)))); }))));
  },
  faq: function(d, v){
    var it = d.items || [];
    return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'faq ' + (v==='columns' ? 'cols' : '')}, it.map(function(x,i){ return h('details', {key:i, open: v==='columns' || i===0}, h('summary', null, x.q, h(U.Icon, {name:'chevron-down', size:18})), h('p', null, x.a)); }))));
  },
  cta: function(d, v, ctx){
    if (v==='boxed') return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, h('div', {className:'ctabox'}, h('div', null, h('h2', null, d.title), h('p', null, d.desc)), h(U.Button, {size:'lg', iconRight:'arrow-right', onClick:ctx.cta}, d.primary))));
    return h('section', {className:'ctaband'}, h('div', {className:'sec-inner'}, h('h2', null, d.title), h('p', null, d.desc), h(U.Button, {size:'lg', variant:'secondary', onClick:ctx.cta}, d.primary)));
  },
  text: function(d, v){
    var it = d.items || [];
    return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head({title:d.title}), d.body ? h('p', {className:'prose'}, d.body) : null, v==='stats' ? h('div', {className:'stats'}, it.map(function(s,i){ return h('div', {key:i}, h('b', null, s.value), h('span', null, s.label)); })) : null));
  },
  team: function(d, v){
    var it = d.items || [];
    if (v==='list') return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner'}, Head(d), h(U.List, null, it.map(function(t,i){ return h(U.ListItem, {key:i, leading:h('span', {className:'wt-avatar'}, (t.name||'').slice(0,1)), title:t.name, description:t.role}); }))));
    return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'grid3'}, it.map(function(t,i){ return h(U.Card, {key:i, image:Ph(i,'',t.image), title:t.name, subtitle:t.role}); }))));
  },
  news: function(d, v){
    var it = d.items || [];
    if (v==='list') return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h(U.List, null, it.map(function(n,i){ return h(U.ListItem, {key:i, title:n.title, description:n.date, trailing:h(U.Badge, {size:'sm'}, n.tag), onClick:function(){}}); }))));
    return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'grid3'}, it.map(function(n,i){ return h(U.Card, {key:i, image:Ph(i,'',n.image), eyebrow:n.tag, title:n.title, subtitle:n.date}); }))));
  },
  contact: function(d, v){
    var lineUrl = 'https://line.me/R/ti/p/' + encodeURIComponent(d.line || '@line');
    var ch = [d.line ? ['line','LINE 官方帳號', d.line, lineUrl] : null, d.phone ? ['phone','電話', d.phone, 'tel:' + d.phone] : null, d.email ? ['mail','Email', d.email, 'mailto:' + d.email] : null, d.addr ? ['map','地址', d.addr, '#'] : null, d.ig ? ['ig','Instagram', d.ig, '#'] : null, d.fb ? ['fb','Facebook', d.fb, '#'] : null].filter(Boolean);
    if (v==='channels') return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'channels'}, ch.map(function(c){ return h('a', {key:c[0], className:'chan chan-' + c[0], href:c[3], onClick:function(e){ if (c[3]==='#') e.preventDefault(); }}, h('span', {className:'cico'}, h(CIcon, {name:c[0]})), h('span', {className:'ctext'}, h('small', null, c[1]), h('b', null, c[2])), h(U.Icon, {name:'chevron-right', size:18})); }))));
    if (v==='line') return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner linebox'}, h('div', {className:'qr'}, h(QR, {text:lineUrl}), h('small', null, '用手機掃描加入')), h('div', {className:'linecopy'}, h('span', {className:'eyebrow'}, 'LINE 官方帳號'), h('h2', null, d.title || '加 LINE 好友，直接聊'), h('p', null, d.sub || '預約、詢價、售後，LINE 上都能處理。'), h('div', {className:'btns'}, h('a', {className:'wt-btn wt-btn-md linebtn', href:lineUrl, target:'_blank', rel:'noopener'}, h(CIcon, {name:'line'}), '加入好友 ' + (d.line || '')), d.phone ? h(U.Button, {variant:'secondary', href:'tel:' + d.phone}, d.phone) : null), d.hours ? h('p', {className:'note'}, '回覆時間：' + d.hours) : null)));
    if (v==='map') return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'mapwrap'}, h('div', {className:'ph map big'}, h('span', {className:'pin'}, h(CIcon, {name:'map'}), d.addr)), h('div', {className:'mapinfo'}, ch.map(function(c){ return h('div', {key:c[0], className:'mrow'}, h(CIcon, {name:c[0]}), h('div', null, h('small', null, c[1]), h('b', null, c[2]))); }), d.hours ? h('div', {className:'mrow'}, h(U.Icon, {name:'bell', size:20}), h('div', null, h('small', null, '營業時間'), h('b', null, d.hours))) : null))));
    var form = h(ContactForm, {page: typeof document !== 'undefined' ? document.title : ''});
    var info = h('aside', {className:'cinfo'}, Ph(2,'map'), h('dl', null, h('dt', null, '地址'), h('dd', null, d.addr), h('dt', null, '營業時間'), h('dd', null, d.hours), h('dt', null, 'LINE'), h('dd', null, d.line)));
    return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), v==='form' ? form : v==='info' ? h('div', {className:'contact one'}, info) : h('div', {className:'contact'}, form, info)));
  }
};

RENDER.logos = function(d, v){ var it = d.items || []; return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'logos ' + (v==='row' ? 'row' : '')}, it.map(function(x,i){ return h('span', {key:i}, x.name); })))); };
RENDER.timeline = function(d, v){ var it = d.items || []; return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('ol', {className:'tl ' + (v==='horizontal' ? 'h' : '')}, it.map(function(x,i){ return h('li', {key:i}, h('small', null, x.when), h('b', null, x.title), h('p', null, x.desc)); })))); };
RENDER.video = function(d, v){
  var vid = h('div', {className:'video ' + (v==='side' ? 'side' : '')}, h('button', {className:'play', type:'button', 'aria-label':'播放'}, h('svg', {width:28, height:28, viewBox:'0 0 24 24', fill:'currentColor'}, h('path', {d:'M7 4l13 8-13 8z'}))), d.caption ? h('span', {className:'vcap'}, d.caption) : null);
  if (v==='side') return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner vsplit'}, h('div', null, h('div', {className:'shead'}, h('h2', null, d.title), h('p', null, d.desc))), vid));
  return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head({title:d.title, sub:d.desc}), vid));
};
RENDER.products = function(d, v, ctx){ var it = d.items || []; return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'prods ' + (v==='grid2' ? 'two' : '')}, it.map(function(x,i){ return h('div', {key:i, className:'prod'}, Ph(i,'',x.image), h('div', {className:'pbody'}, h('b', null, x.title), h('small', null, x.desc), h('div', {className:'prow2'}, h('b', null, x.price), h(U.Button, {size:'sm', icon:'cart', 'aria-label':'加入購物車', onClick:ctx.cta})))); })))); };
RENDER.social = function(d, v){ var n = v==='big' ? 3 : 6; var cells = []; for (var i = 0; i < n; i++) cells.push(Ph(i, '')); return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner'}, h('div', {className:'sochead'}, h('h2', {style:{margin:0, fontSize:22}}, d.title), h('span', {className:'handle'}, d.handle)), h('div', {className:'social ' + (v==='big' ? 'big' : '')}, cells.map(function(c,i){ return h(F, {key:i}, c); })))); };
RENDER.download = function(d, v){ return h('section', {className:'sec'}, h('div', {className:'sec-inner dl ' + (v==='center' ? 'center' : '')}, h('div', null, h('div', {className:'shead'}, h('h2', null, d.title), h('p', null, d.desc)), h('div', {className:'stores'}, h('a', {className:'store', href:'#', onClick:function(e){ e.preventDefault(); }}, h(U.Icon, {name:'star', size:22}), h('span', null, h('small', null, 'Download on the'), h('b', null, 'App Store'))), h('a', {className:'store', href:'#', onClick:function(e){ e.preventDefault(); }}, h(U.Icon, {name:'arrow-right', size:22}), h('span', null, h('small', null, 'GET IT ON'), h('b', null, 'Google Play')))), d.note ? h('p', {className:'note', style:{marginTop:12, fontSize:13, color:'var(--ink-muted)'}}, d.note) : null), h('div', {className:'phonem'}, Ph(0)))); };


/* ---------- 獨特版型 ---------- */
RENDER.marquee = function(d, v){ var it = d.items || []; var seq = it.concat(it).concat(it); return h('section', {className:'marq ' + v}, h('div', {className:'track'}, seq.map(function(x,i){ return h('span', {key:i}, x.text, h('i', null, '✦')); }))); };
RENDER.bento = function(d, v){ var it = (d.items || []).slice(0, v==='seven' ? 7 : 5); return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'bento ' + v}, it.map(function(x,i){ return h('div', {key:i, className:'bcell c' + i}, Ph(i, '', x.image), h('div', {className:'bcap'}, x.tag ? h('span', {className:'eyebrow'}, x.tag) : null, h('b', null, x.title), x.desc ? h('p', null, x.desc) : null)); })))); };
RENDER.zigzag = function(d, v, ctx){ var it = d.items || []; return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head({title:d.title}), h('div', {className:'zig ' + v}, it.map(function(x,i){ return h('div', {key:i, className:'zrow'}, h('div', {className:'zmedia'}, Ph(i, '', x.image)), h('div', {className:'zcopy'}, x.tag ? h('span', {className:'eyebrow'}, x.tag) : null, h('h3', null, x.title), h('p', null, x.desc), x.cta ? h(U.Button, {variant:'ghost', iconRight:'arrow-right', onClick:ctx.cta}, x.cta) : null)); })))); };
RENDER.bignum = function(d, v){ var it = d.items || []; if (v==='counters') return h('section', {className:'sec bignum'}, h('div', {className:'sec-inner'}, h('div', {className:'counters'}, it.map(function(s,i){ return h('div', {key:i}, h('b', null, s.value), h('span', null, s.label)); })))); return h('section', {className:'sec bignum ' + v}, h('div', {className:'sec-inner'}, h('h2', {className:'giant'}, d.title), d.desc ? h('p', null, d.desc) : null)); };
RENDER.collage = function(d, v){ var it = (d.items || []).slice(0, 5); return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner collage-wrap'}, h('div', {className:'collage ' + v}, it.map(function(x,i){ return h('figure', {key:i, className:'cf c' + i}, Ph(i, '', x.image), x.caption ? h('figcaption', null, x.caption) : null); })), (d.title || d.desc) ? h('div', {className:'ccopy'}, h('h2', null, d.title), h('p', null, d.desc)) : null)); };
RENDER.carousel = function(d, v){ var it = d.items || []; return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d)), h('div', {className:'carousel ' + v}, it.map(function(x,i){ return h('div', {key:i, className:'slide'}, Ph(i, '', x.image), h('div', {className:'scap'}, x.tag ? h('span', {className:'eyebrow'}, x.tag) : null, h('b', null, x.title), h('p', null, x.desc))); }))); };
RENDER.menu = function(d, v){ var it = d.items || []; return h('section', {className:'sec sec-alt'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'menu ' + v}, it.map(function(x,i){ return h('div', {key:i, className:'mi'}, h('div', {className:'mline'}, h('b', null, x.title), h('i'), h('span', {className:'mp'}, x.price)), x.desc ? h('p', null, x.desc) : null); })))); };
RENDER.story = function(d, v){ var it = d.items || []; return h('section', {className:'story ' + v}, h('div', {className:'sec-inner'}, h('div', {className:'sticky'}, h('h2', null, d.title), h('p', null, d.desc)), h('div', {className:'scroll'}, it.map(function(x,i){ return h('div', {key:i, className:'sp'}, Ph(i, '', x.image), h('h3', null, x.title), h('p', null, x.desc)); })))); };
RENDER.divider = function(d, v){ if (v==='word') return h('div', {className:'dvd word'}, h('span', null, d.text)); if (v==='line') return h('div', {className:'dvd line'}, h('i'), d.text ? h('span', null, d.text) : null, h('i')); if (v==='wave') return h('div', {className:'dvd wave'}, h('svg', {viewBox:'0 0 1200 60', preserveAspectRatio:'none'}, h('path', {d:'M0 30 C 200 60 400 0 600 30 S 1000 60 1200 30 L1200 60 L0 60 Z'}))); return h('div', {className:'dvd slant'}); };
RENDER.beforeafter = function(d, v){
  var st = useState(50);
  if (v==='side') return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'ba-side'}, h('div', null, Ph(2, '', d.imageBefore), h('span', {className:'balabel'}, d.before)), h('div', null, Ph(0, '', d.imageAfter), h('span', {className:'balabel'}, d.after)))));
  return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'ba'}, h('div', {className:'ba-after'}, Ph(0, '', d.imageAfter)), h('div', {className:'ba-before', style:{width:st[0] + '%'}}, Ph(2, '', d.imageBefore)), h('div', {className:'ba-handle', style:{left:st[0] + '%'}}), h('span', {className:'balabel l'}, d.before), h('span', {className:'balabel r'}, d.after), h('input', {type:'range', min:0, max:100, value:st[0], 'aria-label':'前後對比', onChange:function(e){ st[1](+e.target.value); }}))));
};
RENDER.testimonials = (function(orig){ return function(d, v){ var it = d.items || []; if (v==='marquee') { var seq = it.concat(it); return h('section', {className:'sec sec-alt tmarq'}, h('div', {className:'sec-inner'}, Head(d)), h('div', {className:'track'}, seq.map(function(q,i){ return h('div', {key:i, className:'tcard'}, h('p', null, '「' + q.quote + '」'), h('div', {className:'who'}, h('span', {className:'wt-avatar'}, (q.name||'').slice(0,1)), h('div', null, h('b', null, q.name), h('span', null, q.role)))); }))); } if (v==='wall') return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'twall'}, it.map(function(q,i){ return h('div', {key:i, className:'tnote r' + (i%3)}, h('p', null, q.quote), h('b', null, '— ' + q.name)); })))); return orig(d, v); }; })(RENDER.testimonials);
RENDER.gallery = (function(orig){ return function(d, v, ctx){ var it = d.items || []; if (v==='masonry') return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('div', {className:'masonry'}, it.map(function(x,i){ return h('figure', {key:i, className:'mcard h' + (i%3)}, Ph(i, '', x.image), h('figcaption', null, h('b', null, x.title), h('span', null, x.desc))); })))); if (v==='list') return h('section', {className:'sec'}, h('div', {className:'sec-inner'}, Head(d), h('ol', {className:'numlist'}, it.map(function(x,i){ return h('li', {key:i}, h('span', {className:'n'}, (i<9?'0':'') + (i+1)), h('div', null, h('b', null, x.title), h('p', null, x.desc)), x.tag ? h('span', {className:'t'}, x.tag) : null, h(U.Icon, {name:'arrow-right', size:20})); })))); return orig(d, v, ctx); }; })(RENDER.gallery);
RENDER.hero = (function(orig){ return function(d, v, ctx){
  var btns = h('div', {className:'btns'}, d.primary ? h(U.Button, {size:'lg', iconRight:'arrow-right', onClick:ctx.cta}, d.primary) : null, d.secondary ? h(U.Button, {size:'lg', variant:'secondary'}, d.secondary) : null);
  if (v==='giant') return h('section', {className:'hero-giant'}, h('div', {className:'sec-inner'}, d.eyebrow ? h('span', {className:'eyebrow'}, d.eyebrow) : null, h('h1', null, d.title), h('div', {className:'row2'}, h('p', null, d.desc), btns), d.note ? h('span', {className:'note'}, d.note) : null));
  if (v==='diagonal') return h('section', {className:'hero-diag'}, h('div', {className:'shape'}), h('div', {className:'sec-inner inner'}, h('div', {className:'copy'}, d.eyebrow ? h('span', {className:'eyebrow inv'}, d.eyebrow) : null, h('h1', null, d.title), h('p', null, d.desc), btns, d.note ? h('span', {className:'note'}, d.note) : null), h('div', {className:'media'}, Ph(1, '', d.image))));
  if (v==='frame') return h('section', {className:'hero-frame'}, h('div', {className:'frame'}, Ph(0, '', d.image), h('div', {className:'copy'}, d.eyebrow ? h('span', {className:'eyebrow'}, d.eyebrow) : null, h('h1', null, d.title), h('p', null, d.desc), btns)));
  return orig(d, v, ctx); }; })(RENDER.hero);


export { RENDER, FloatContact, SECTION_TYPES, CIcon, QR };
