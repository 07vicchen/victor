'use client';
import React from 'react';
var R = React, h = R.createElement, useState = R.useState;
  function cx() { return Array.prototype.slice.call(arguments).filter(Boolean).join(' '); }
  function omit(o, keys) { var r = {}; for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k]; return r; }

  /* ---------- Icon (24px line icons, currentColor) ---------- */
  var PATHS = {
    home: 'M3 11.5 12 4l9 7.5M5 10v10h5v-6h4v6h5V10',
    search: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0',
    bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 20a2 2 0 0 0 4 0',
    check: 'M5 12.5 10 17.5 19 7',
    close: 'M6 6l12 12M18 6 6 18',
    plus: 'M12 5v14M5 12h14',
    'chevron-right': 'M9 5l7 7-7 7',
    'chevron-down': 'M5 9l7 7 7-7',
    'arrow-right': 'M4 12h16M13 5l7 7-7 7',
    heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
    cart: 'M3 4h2l2.5 11h11L21 7H6.5M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
    info: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 11v6M12 7.5v.5',
    alert: 'M12 3 2.5 20h19L12 3zM12 10v5M12 17.5v.5',
    menu: 'M4 7h16M4 12h16M4 17h16',
    star: 'M12 3.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6L3.3 9.8l6.1-.7L12 3.5z'
  };
  function Icon(p) {
    var size = p.size || 20;
    return h('svg', { className: cx('wt-icon', p.className), width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': p.label ? undefined : 'true', role: p.label ? 'img' : undefined, 'aria-label': p.label },
      h('path', { d: PATHS[p.name] || PATHS.info }));
  }
  function Spinner() { return h('span', { className: 'wt-spinner', 'aria-hidden': 'true' }); }

  /* ---------- 1. Button ---------- */
  function Button(p) {
    var variant = p.variant || 'primary', size = p.size || 'md';
    var rest = omit(p, ['variant', 'size', 'block', 'loading', 'icon', 'iconRight', 'className', 'children', 'disabled', 'href', 'as']);
    var tag = p.href ? 'a' : 'button';
    var props = Object.assign({}, rest, {
      className: cx('wt-btn', 'wt-btn-' + variant, 'wt-btn-' + size, p.block && 'wt-btn-block', p.loading && 'is-loading', !p.children && 'wt-btn-icon-only', p.className),
      'aria-busy': p.loading ? 'true' : undefined
    });
    if (tag === 'a') props.href = p.href; else { props.type = p.type || 'button'; props.disabled = !!(p.disabled || p.loading); }
    return h(tag, props,
      p.loading ? h(Spinner) : null,
      p.icon && !p.loading ? h(Icon, { name: p.icon, size: size === 'sm' ? 16 : 18 }) : null,
      p.children ? h('span', { className: 'wt-btn-label' }, p.children) : null,
      p.iconRight ? h(Icon, { name: p.iconRight, size: size === 'sm' ? 16 : 18 }) : null);
  }

  /* ---------- 2. Input / Select / Textarea / Checkbox / Switch ---------- */
  var uid = 0;
  function Field(p, control) {
    var rid = R.useId ? R.useId() : ('wt-f' + (++uid)); var id = p.id || rid;
    var invalid = !!p.error;
    return h('div', { className: cx('wt-field', invalid && 'is-invalid', p.disabled && 'is-disabled', p.className) },
      p.label ? h('label', { className: 'wt-field-label', htmlFor: id }, p.label, p.required ? h('span', { className: 'wt-field-req', 'aria-hidden': 'true' }, ' *') : null) : null,
      control(id, invalid),
      p.error ? h('p', { className: 'wt-field-msg wt-field-error', id: id + '-msg' }, h(Icon, { name: 'alert', size: 14 }), p.error)
        : p.helper ? h('p', { className: 'wt-field-msg', id: id + '-msg' }, p.helper) : null);
  }
  var FIELD_KEYS = ['label', 'helper', 'error', 'required', 'className', 'leading', 'trailing', 'id', 'options'];
  function Input(p) {
    return Field(p, function (id, invalid) {
      return h('div', { className: 'wt-input-wrap' },
        p.leading ? h('span', { className: 'wt-input-adorn' }, typeof p.leading === 'string' ? h(Icon, { name: p.leading, size: 18 }) : p.leading) : null,
        h('input', Object.assign({}, omit(p, FIELD_KEYS), { id: id, className: 'wt-input', 'aria-invalid': invalid || undefined, 'aria-describedby': (p.error || p.helper) ? id + '-msg' : undefined })),
        p.trailing ? h('span', { className: 'wt-input-adorn' }, typeof p.trailing === 'string' ? h(Icon, { name: p.trailing, size: 18 }) : p.trailing) : null);
    });
  }
  function Select(p) {
    return Field(p, function (id, invalid) {
      return h('div', { className: 'wt-input-wrap' },
        h('select', Object.assign({}, omit(p, FIELD_KEYS), { id: id, className: 'wt-input wt-select', 'aria-invalid': invalid || undefined }),
          (p.options || []).map(function (o) { return h('option', { key: o.value, value: o.value }, o.label); })),
        h('span', { className: 'wt-input-adorn wt-select-caret' }, h(Icon, { name: 'chevron-down', size: 18 })));
    });
  }
  function Textarea(p) {
    return Field(p, function (id, invalid) {
      return h('textarea', Object.assign({ rows: 4 }, omit(p, FIELD_KEYS), { id: id, className: 'wt-input wt-textarea', 'aria-invalid': invalid || undefined }));
    });
  }
  function Checkbox(p) {
    return h('label', { className: cx('wt-check', p.disabled && 'is-disabled', p.className) },
      h('input', Object.assign({}, omit(p, ['label', 'className', 'children']), { type: 'checkbox', className: 'wt-check-input' })),
      h('span', { className: 'wt-check-box', 'aria-hidden': 'true' }, h(Icon, { name: 'check', size: 14 })),
      h('span', { className: 'wt-check-label' }, p.label || p.children));
  }
  function Switch(p) {
    return h('label', { className: cx('wt-switch', p.disabled && 'is-disabled', p.className) },
      h('input', Object.assign({}, omit(p, ['label', 'className']), { type: 'checkbox', role: 'switch', className: 'wt-switch-input' })),
      h('span', { className: 'wt-switch-track', 'aria-hidden': 'true' }, h('span', { className: 'wt-switch-thumb' })),
      p.label ? h('span', { className: 'wt-switch-label' }, p.label) : null);
  }

  /* ---------- 3. Card ---------- */
  function Card(p) {
    return h(p.href ? 'a' : 'div', { className: cx('wt-card', p.href && 'wt-card-link', p.horizontal && 'wt-card-h', p.className), href: p.href },
      p.image ? h('div', { className: 'wt-card-media' }, typeof p.image === 'string' ? h('img', { src: p.image, alt: p.imageAlt || '' }) : p.image) : null,
      h('div', { className: 'wt-card-body' },
        p.eyebrow ? h('div', { className: 'wt-card-eyebrow' }, p.eyebrow) : null,
        p.title ? h('h3', { className: 'wt-card-title' }, p.title) : null,
        p.subtitle ? h('p', { className: 'wt-card-subtitle' }, p.subtitle) : null,
        p.children ? h('div', { className: 'wt-card-content' }, p.children) : null),
      p.footer ? h('div', { className: 'wt-card-footer' }, p.footer) : null);
  }

  /* ---------- 4. Navbar ---------- */
  function Navbar(p) {
    var st = useState(false), open = st[0], setOpen = st[1];
    return h('header', { className: cx('wt-nav', open && 'is-open', p.className) },
      h('div', { className: 'wt-nav-inner' },
        h('a', { className: 'wt-nav-brand', href: p.brandHref || '#' }, p.logo ? p.logo : null, p.brand),
        h('nav', { className: 'wt-nav-links', 'aria-label': '主選單' },
          (p.links || []).map(function (l) { return h('a', { key: l.label, href: l.href || '#', className: cx('wt-nav-link', l.active && 'is-active'), 'aria-current': l.active ? 'page' : undefined }, l.label); })),
        h('div', { className: 'wt-nav-actions' },
          p.secondary ? h(Button, { variant: 'ghost', size: 'sm', href: p.secondary.href }, p.secondary.label) : null,
          p.cta ? h(Button, { size: 'sm', href: p.cta.href }, p.cta.label) : null,
          h('button', { className: 'wt-nav-burger', type: 'button', 'aria-label': open ? '關閉選單' : '開啟選單', 'aria-expanded': open, onClick: function () { setOpen(!open); } }, h(Icon, { name: open ? 'close' : 'menu', size: 22 })))));
  }

  /* ---------- 5. Tabs / BottomNav ---------- */
  function Tabs(p) {
    var st = useState(p.defaultValue || (p.items && p.items[0] && p.items[0].value));
    var value = p.value !== undefined ? p.value : st[0];
    function pick(v) { st[1](v); if (p.onChange) p.onChange(v); }
    return h('div', { className: cx('wt-tabs', 'wt-tabs-' + (p.variant || 'line'), p.fill && 'wt-tabs-fill', p.className), role: 'tablist' },
      (p.items || []).map(function (it) {
        var on = it.value === value;
        return h('button', { key: it.value, type: 'button', role: 'tab', 'aria-selected': on, className: cx('wt-tab', on && 'is-active'), onClick: function () { pick(it.value); } },
          it.icon ? h(Icon, { name: it.icon, size: 18 }) : null, it.label,
          it.count !== undefined ? h('span', { className: 'wt-tab-count' }, it.count) : null);
      }));
  }
  function BottomNav(p) {
    var st = useState(p.defaultValue || (p.items && p.items[0] && p.items[0].value));
    var value = p.value !== undefined ? p.value : st[0];
    return h('nav', { className: cx('wt-bottomnav', p.className), 'aria-label': '主要導覽' },
      (p.items || []).map(function (it) {
        var on = it.value === value;
        return h('button', { key: it.value, type: 'button', className: cx('wt-bottomnav-item', on && 'is-active'), 'aria-current': on ? 'page' : undefined, onClick: function () { st[1](it.value); if (p.onChange) p.onChange(it.value); } },
          h('span', { className: 'wt-bottomnav-icon' }, h(Icon, { name: it.icon || 'home', size: 22 }), it.badge ? h('span', { className: 'wt-bottomnav-badge' }, it.badge) : null),
          h('span', { className: 'wt-bottomnav-label' }, it.label));
      }));
  }

  /* ---------- 6. Modal / Sheet ---------- */
  function Modal(p) {
    if (p.open === false) return null;
    var sheet = p.variant === 'sheet';
    return h('div', { className: cx('wt-modal-root', sheet && 'wt-modal-sheet', p.static && 'is-static', p.className), role: 'presentation' },
      h('div', { className: 'wt-overlay', onClick: p.onClose }),
      h('div', { className: cx('wt-modal', 'wt-modal-' + (p.size || 'md')), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'wt-modal-title' },
        sheet ? h('div', { className: 'wt-sheet-handle', 'aria-hidden': 'true' }) : null,
        h('div', { className: 'wt-modal-head' },
          p.title ? h('h2', { className: 'wt-modal-title', id: 'wt-modal-title' }, p.title) : null,
          p.onClose ? h('button', { type: 'button', className: 'wt-modal-close', 'aria-label': '關閉', onClick: p.onClose }, h(Icon, { name: 'close', size: 20 })) : null),
        p.description ? h('p', { className: 'wt-modal-desc' }, p.description) : null,
        p.children ? h('div', { className: 'wt-modal-body' }, p.children) : null,
        p.actions ? h('div', { className: 'wt-modal-actions' }, p.actions) : null));
  }
  function Sheet(p) { return h(Modal, Object.assign({}, p, { variant: 'sheet' })); }

  /* ---------- 7. Badge ---------- */
  function Badge(p) {
    return h('span', { className: cx('wt-badge', 'wt-badge-' + (p.tone || 'neutral'), p.size === 'sm' && 'wt-badge-sm', p.pill && 'wt-badge-pill', p.className) },
      p.dot ? h('span', { className: 'wt-badge-dot', 'aria-hidden': 'true' }) : null,
      p.icon ? h(Icon, { name: p.icon, size: 14 }) : null,
      p.children);
  }

  /* ---------- 8. List / ListItem / Table ---------- */
  function List(p) { return h('div', { className: cx('wt-list', p.inset && 'wt-list-inset', p.className), role: 'list' }, p.children); }
  function ListItem(p) {
    var tag = p.href ? 'a' : (p.onClick ? 'button' : 'div');
    return h(tag, { className: cx('wt-listitem', (p.href || p.onClick) && 'is-clickable', p.selected && 'is-selected', p.className), href: p.href, onClick: p.onClick, type: tag === 'button' ? 'button' : undefined, role: 'listitem', 'aria-current': p.selected ? 'true' : undefined },
      p.leading ? h('span', { className: 'wt-listitem-lead' }, typeof p.leading === 'string' ? h(Icon, { name: p.leading, size: 20 }) : p.leading) : null,
      h('span', { className: 'wt-listitem-main' },
        h('span', { className: 'wt-listitem-title' }, p.title),
        p.description ? h('span', { className: 'wt-listitem-desc' }, p.description) : null),
      p.meta ? h('span', { className: 'wt-listitem-meta' }, p.meta) : null,
      p.trailing ? h('span', { className: 'wt-listitem-trail' }, typeof p.trailing === 'string' ? h(Icon, { name: p.trailing, size: 18 }) : p.trailing)
        : (p.href || p.onClick) ? h('span', { className: 'wt-listitem-trail' }, h(Icon, { name: 'chevron-right', size: 18 })) : null);
  }
  function Table(p) {
    return h('div', { className: cx('wt-table-wrap', p.className) },
      h('table', { className: cx('wt-table', p.compact && 'wt-table-compact') },
        p.caption ? h('caption', null, p.caption) : null,
        h('thead', null, h('tr', null, (p.columns || []).map(function (c) { return h('th', { key: c.key, scope: 'col', className: c.align ? 'is-' + c.align : undefined, style: c.width ? { width: c.width } : undefined }, c.label); }))),
        h('tbody', null, (p.rows || []).map(function (row, i) {
          return h('tr', { key: row.id !== undefined ? row.id : i }, (p.columns || []).map(function (c) {
            var v = c.render ? c.render(row) : row[c.key];
            return h('td', { key: c.key, className: c.align ? 'is-' + c.align : undefined }, v);
          }));
        }))));
  }

  /* ---------- 9. Alert / Toast ---------- */
  var TONE_ICON = { info: 'info', success: 'check', warning: 'alert', danger: 'alert', neutral: 'info' };
  function Alert(p) {
    var tone = p.tone || 'info';
    return h('div', { className: cx('wt-alert', 'wt-alert-' + tone, p.className), role: tone === 'danger' || tone === 'warning' ? 'alert' : 'status' },
      h('span', { className: 'wt-alert-icon' }, h(Icon, { name: p.icon || TONE_ICON[tone], size: 20 })),
      h('div', { className: 'wt-alert-main' },
        p.title ? h('div', { className: 'wt-alert-title' }, p.title) : null,
        p.children ? h('div', { className: 'wt-alert-desc' }, p.children) : null,
        p.action ? h('div', { className: 'wt-alert-action' }, p.action) : null),
      p.onClose ? h('button', { type: 'button', className: 'wt-alert-close', 'aria-label': '關閉', onClick: p.onClose }, h(Icon, { name: 'close', size: 18 })) : null);
  }
  function Toast(p) {
    var tone = p.tone || 'neutral';
    return h('div', { className: cx('wt-toast', 'wt-toast-' + tone, p.className), role: 'status' },
      h(Icon, { name: p.icon || TONE_ICON[tone], size: 18 }),
      h('span', { className: 'wt-toast-text' }, p.children),
      p.action ? h('button', { type: 'button', className: 'wt-toast-action', onClick: p.onAction }, p.action) : null);
  }

  /* ---------- 10. Hero ---------- */
  function Hero(p) {
    return h('section', { className: cx('wt-hero', 'wt-hero-' + (p.variant || 'split'), p.className) },
      h('div', { className: 'wt-hero-inner' },
        h('div', { className: 'wt-hero-copy' },
          p.eyebrow ? h('span', { className: 'wt-hero-eyebrow' }, p.eyebrow) : null,
          h('h1', { className: 'wt-hero-title' }, p.title),
          p.description ? h('p', { className: 'wt-hero-desc' }, p.description) : null,
          (p.primary || p.secondary) ? h('div', { className: 'wt-hero-actions' },
            p.primary ? h(Button, { size: 'lg', href: p.primary.href, iconRight: 'arrow-right', onClick: p.primary.onClick }, p.primary.label) : null,
            p.secondary ? h(Button, { size: 'lg', variant: 'secondary', href: p.secondary.href, onClick: p.secondary.onClick }, p.secondary.label) : null) : null,
          p.note ? h('p', { className: 'wt-hero-note' }, p.note) : null),
        p.variant !== 'center' ? h('div', { className: 'wt-hero-media' }, p.media || h('div', { className: 'wt-hero-placeholder', 'aria-hidden': 'true' })) : null));
  }

var WeituoUI = {};
  Object.assign(WeituoUI, { Icon: Icon, Button: Button, Input: Input, Select: Select, Textarea: Textarea, Checkbox: Checkbox, Switch: Switch, Card: Card, Navbar: Navbar, Tabs: Tabs, BottomNav: BottomNav, Modal: Modal, Sheet: Sheet, Badge: Badge, List: List, ListItem: ListItem, Table: Table, Alert: Alert, Toast: Toast, Hero: Hero });

export default WeituoUI;
export { Icon, Button, Input, Select, Textarea, Checkbox, Switch, Card, Navbar, Tabs, BottomNav, Modal, Sheet, Badge, List, ListItem, Table, Alert, Toast, Hero };
