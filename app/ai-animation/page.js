import Home from '../../components/Home';
import { getRows } from '../rows';
import { meta, Ld } from '../seo';
import { BIZ, AIFAQ } from '../../components/faq';
import CAT from '../../components/cat.json';
export const revalidate = 300;
export const metadata = meta('/ai-animation', 'AI 動畫代言價格・AI 動畫廣告・老闆 AI 分身｜維拓傳媒', '老闆不用露臉也能天天出片：幫你的店做專屬 AI 角色或老闆 AI 分身，台灣腔配音、對嘴、字幕全包。免費角色試看，體驗動畫 1,990 元，短影音 6,000 元起。');
const g = CAT.find((x) => /動畫/.test(x.g)) || { items: [] };
const service = {
  '@context': 'https://schema.org', '@type': 'Service', name: 'AI 動畫服務', serviceType: 'AI 動畫短影音、AI 角色代言、老闆 AI 分身',
  provider: { '@type': 'Organization', name: BIZ.name, '@id': BIZ.url + '/#org' }, areaServed: { '@type': 'Country', name: '台灣' }, url: BIZ.url + '/ai-animation',
  description: '幫店家做專屬 AI 角色或老闆 AI 分身，腳本、台灣腔配音、對嘴、字幕全包，老闆不用露臉也能天天出片。',
  hasOfferCatalog: { '@type': 'OfferCatalog', name: 'AI 動畫方案', itemListElement: g.items.filter((it) => !it.ask).map((it) => ({ '@type': 'Offer', price: it.p, priceCurrency: 'TWD', itemOffered: { '@type': 'Service', name: it.n, description: it.d } })) }
};
const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', dateModified: '2026-10-18', mainEntity: AIFAQ.map((x) => ({ '@type': 'Question', name: x[0], acceptedAnswer: { '@type': 'Answer', text: x[1] } })) };
const video = { '@context': 'https://schema.org', '@type': 'VideoObject', name: '愛德華救店・早餐店篇', description: '寫實真人加真貓，配音、對嘴全部 AI 做的 34 秒短片。', thumbnailUrl: BIZ.url + '/m/edward_p.jpg', contentUrl: BIZ.url + '/m/edward.mp4', uploadDate: '2026-10-01T12:00:00+08:00', duration: 'PT34S' };
export default async function Page() { return <><Ld data={service} /><Ld data={faq} /><Ld data={video} /><Home rows={await getRows()} path="/ai-animation" /></>; }
