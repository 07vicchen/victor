import Home from '../../components/Home';
import { getRows } from '../rows';
import { meta, Ld } from '../seo';
import { BIZ, SGFAQ } from '../../components/faq';
import CAT from '../../components/cat.json';
export const revalidate = 300;
export const metadata = meta('/seo-geo', 'SEO、AEO、GEO 是什麼？讓 Google 和 ChatGPT 都推薦你的店｜維拓傳媒', 'SEO 讓 Google 把你排前面，AEO 讓 Google 直接拿你的話當答案，GEO 讓 ChatGPT、Gemini、Google AI 摘要說出你的店名。先做 4,800 元健檢，月費 8,800 元起，SEO 和 GEO 一起顧。');
const g = CAT.find((x) => /GEO/.test(x.g)) || { items: [] };
const service = {
  '@context': 'https://schema.org', '@type': 'Service', name: 'SEO 與 AI 搜尋優化（GEO）', serviceType: 'SEO 搜尋引擎優化、AEO 答案引擎優化、GEO 生成式引擎優化',
  provider: { '@type': 'Organization', name: BIZ.name, '@id': BIZ.url + '/#org' }, areaServed: { '@type': 'Country', name: '台灣' }, url: BIZ.url + '/seo-geo',
  description: '讓客人在 Google 搜尋、Google 地圖，以及問 ChatGPT、Gemini、Google AI 摘要「哪家好」的時候找到你。',
  hasOfferCatalog: { '@type': 'OfferCatalog', name: 'SEO 與 GEO 方案', itemListElement: g.items.map((it) => ({ '@type': 'Offer', price: it.p, priceCurrency: 'TWD', itemOffered: { '@type': 'Service', name: it.n, description: it.d } })) }
};
const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: SGFAQ.map((x) => ({ '@type': 'Question', name: x[0], acceptedAnswer: { '@type': 'Answer', text: x[1] } })) };
export default async function Page() { return <><Ld data={service} /><Ld data={faq} /><Home rows={await getRows()} path="/seo-geo" /></>; }
