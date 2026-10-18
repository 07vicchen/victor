'use client';
import React from 'react';
import Link from 'next/link';
import U from './ui.js';
import { RENDER, FloatContact } from './sections.js';

var h = React.createElement;

/** 網站外殼：導覽列、頁面區塊、頁尾、浮動聯絡鈕 */
function useReveal() {
  React.useEffect(function () {
    if (!window.IntersectionObserver) return;
    var root = document.querySelector('.site'); if (!root) return; root.classList.add('reveal');
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
    root.querySelectorAll('.blk').forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('in'); else io.observe(el); });
    return function () { io.disconnect(); };
  }, []);
}

export default function Site({ site, pageIndex }) {
  useReveal();
  var onepage = !!site.onepage, page = site.pages[pageIndex] || site.pages[0];
  var sections = onepage ? [].concat.apply([], site.pages.map(function (pg, i) { return pg.sections.map(function (s, j) { return Object.assign({}, s, { _anchor: j === 0 ? 'p' + i : null }); }); })) : page.sections;
  var contactIdx = site.pages.findIndex(function (pg) { return pg.sections.some(function (s) { return s.type === 'contact'; }); });
  var contact = null; site.pages.forEach(function (pg) { pg.sections.forEach(function (s) { if (!contact && s.type === 'contact') contact = s.data; }); });
  var hrefOf = function (i) { return onepage ? '#p' + i : site.pages[i].slug; };
  var ctx = { cta: function () { if (contactIdx >= 0 && typeof window !== 'undefined') window.location.href = hrefOf(contactIdx); }, ordersLabel: site.ordersLabel || '預約' };
  var links = site.pages.map(function (pg, i) { return { label: pg.name, href: hrefOf(i), active: !onepage && i === pageIndex, hid: pg.hidden }; }).filter(function (l, i) { return i !== 0 && i !== contactIdx && !l.hid; });
  // AI 客服介紹頁（獨立頁面 /ai-kefu）排在「AI 辦公室」後面
  if (!onepage) { var oi = links.findIndex(function (l) { return l.href === '/office'; }); links.splice(oi < 0 ? links.length : oi + 1, 0, { label: 'AI 客服', href: '/ai-kefu' }); }
  var brand = site.logo ? h('img', { src: site.logo, alt: site.name }) : site.name;
  return h('div', { className: 'site nav-' + (site.nav || 'left') },
    h(U.Navbar, { brand: brand, brandHref: '/', links: links, cta: contactIdx >= 0 ? { label: site.pages[contactIdx].name, href: hrefOf(contactIdx) } : undefined }),
    sections.map(function (s) { var Rn = RENDER[s.type]; return Rn ? h('div', { key: s.id, id: s._anchor ? 'p' + s._anchor.slice(1) : undefined, className: 'blk' }, Rn(s.data, s.variant, ctx)) : null; }),
    h(FloatContact, { mode: site.floatc, contact: contact || {} }),
    h('footer', { className: 'footer' },
      h('div', null, h('b', null, site.name), h('br'), h('span', null, site.slogan)),
      h('nav', { className: 'flinks' }, site.pages.map(function (pg, i) { return pg.hidden ? null : h(onepage ? 'a' : Link, { key: pg.id, href: hrefOf(i) }, pg.name); }).concat(onepage ? [] : [h('a', { key: 'aik', href: '/ai-kefu' }, 'AI 客服'), h('a', { key: 'gd', href: '/guides' }, '指南')])),
      site.biz ? h('address', { className: 'fbiz' }, site.biz.map(function (l, i) { return h('span', { key: i }, l.href ? h('a', { href: l.href }, l.t) : l.t); })) : null,
      h('span', null, '© ' + new Date().getFullYear() + ' ' + site.name + ' · 網站由維拓傳媒製作')));
}
