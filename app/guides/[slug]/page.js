import { GUIDES } from '../../../components/guides';
import { BIZ } from '../../../components/faq';
import { meta, Ld } from '../../seo';
import { GuideShell } from '../shell';

export function generateStaticParams() { return GUIDES.map((g) => ({ slug: g.slug })); }
export const dynamicParams = false;
export function generateMetadata({ params }) {
  const g = GUIDES.find((x) => x.slug === params.slug);
  return meta('/guides/' + g.slug, g.title + '｜維拓傳媒', g.desc);
}

export default function Page({ params }) {
  const g = GUIDES.find((x) => x.slug === params.slug);
  const article = {
    '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.desc,
    datePublished: g.date, dateModified: g.date, inLanguage: 'zh-TW',
    author: { '@type': 'Person', name: '陳卓恩', alternateName: 'Vic' },
    publisher: { '@type': 'Organization', name: BIZ.name, '@id': BIZ.url + '/#org' },
    mainEntityOfPage: BIZ.url + '/guides/' + g.slug
  };
  return (
    <GuideShell>
      <Ld data={article} />
      <article className="ga">
        <a className="gback" href="/guides">← 所有指南</a>
        <p className="gtag">{g.tags.join('・')}</p>
        <h1>{g.title}</h1>
        <p className="gmeta">維拓傳媒・陳卓恩（Vic）・{g.date.replace(/-/g, '/')}</p>
        <p className="glead">{g.desc}</p>
        {g.body.map((s, i) => (
          <section key={i}><h2>{s.h}</h2>{s.p.map((t, j) => <p key={j}>{t}</p>)}</section>
        ))}
        {g.sources.length ? <div className="gsrc"><b>資料來源</b>{g.sources.map((s, i) => <a key={i} href={s.u} target="_blank" rel="noopener">{s.t}</a>)}</div> : null}
        <a className="gcta" href={g.cta.u}>{g.cta.t} →</a>
      </article>
    </GuideShell>
  );
}
