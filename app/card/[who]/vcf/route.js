import { CARDS, ADDR } from '../../data';

export function generateStaticParams() { return Object.keys(CARDS).map((who) => ({ who })); }

export function GET(req, { params }) {
  const c = CARDS[params.who];
  if (!c) return new Response('not found', { status: 404 });
  const lines = [
    'BEGIN:VCARD', 'VERSION:3.0',
    'N:' + (c.family || '陳') + ';' + (c.given || '卓恩') + ';;;', 'FN:' + c.name + ' ' + c.enName,
    'ORG:' + c.company + ';' + c.legal, 'TITLE:' + c.title + (c.enTitle ? ' ' + c.enTitle : ''),
    c.email ? 'EMAIL;TYPE=WORK:' + c.email : '',
    'TEL;TYPE=WORK,VOICE:' + c.telRaw,
    c.web ? 'URL:' + c.web : '',
    'ADR;TYPE=WORK:;;新台五路二段238巷112號10樓;汐止區;新北市;221;台灣',
    'NOTE:' + [c.line ? 'LINE ' + c.line : '', '統編 ' + c.taxId, c.services].filter(Boolean).join('｜'),
    'END:VCARD'
  ].filter(Boolean);
  return new Response(lines.join('\r\n') + '\r\n', {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': 'inline; filename="' + ({ vic: 'victor-media', consulting: 'victor-consulting' }[params.who] || params.who) + '.vcf"'
    }
  });
}
