import { GUIDES } from '../../components/guides';
import { meta } from '../seo';
import { GuideShell } from './shell';

export const metadata = meta('/guides', '指南：AI 客服、GEO、SEO 白話說清楚｜維拓傳媒', '維拓傳媒寫給小店家的白話指南：LINE AI 客服怎麼選、GEO 是什麼、怎麼讓 ChatGPT 和 Google AI 摘要推薦你的店。');

export default function Page() {
  return (
    <GuideShell>
      <div className="gl">
        <p className="gtag">GUIDES</p>
        <h1>寫給小店家的白話指南</h1>
        <p style={{ color: '#a6a6a6', marginBottom: 28 }}>不講術語，只講你做得到的事。</p>
        {GUIDES.map((g) => (
          <a key={g.slug} className="gitem" href={'/guides/' + g.slug}><b>{g.title}</b><span>{g.desc}</span></a>
        ))}
      </div>
    </GuideShell>
  );
}
