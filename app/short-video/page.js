import Home from '../../components/Home';
import { getRows } from '../rows';
import { meta, Ld } from '../seo';
import { BIZ, SVFAQ } from '../../components/faq';
import CAT from '../../components/cat.json';
export const revalidate = 300;
export const metadata = meta('/short-video', '短影音代操價格・老闆不露臉短影音｜全台線上合作｜維拓傳媒', '維拓傳媒短影音代操：真人拍攝每月 45,000 元起（企劃、拍攝、剪輯、字幕、封面，4 支），不露臉的 AI 動畫代營運每月 15,000 元起，直播切片一場 8,000 元。全台線上合作，台北、新北可到場拍攝。');
const IDS = ['clip','vq','ao','sv','so','cm','pt','ma','vw','sb'];
const items = [].concat(...CAT.map((g) => g.items)).filter((it) => IDS.includes(it.id) && !it.ask);
const service = {
  '@context': 'https://schema.org', '@type': 'Service', name: '短影音代操', serviceType: '短影音代操、短影音拍攝、短影音製作、Reels 代操',
  provider: { '@type': 'Organization', name: BIZ.name, '@id': BIZ.url + '/#org' }, areaServed: [{ '@type': 'City', name: '新北市' }, { '@type': 'City', name: '台北市' }, { '@type': 'Country', name: '台灣' }], url: BIZ.url + '/short-video',
  description: '維拓傳媒短影音代操：真人拍攝每月 45,000 元起（企劃、拍攝、剪輯、字幕、封面，4 支），不露臉的 AI 動畫代營運每月 15,000 元起，直播切片一場 8,000 元。全台線上合作，台北、新北可到場拍攝。',
  hasOfferCatalog: { '@type': 'OfferCatalog', name: '短影音代操價格', itemListElement: items.map((it) => ({ '@type': 'Offer', price: it.p, priceCurrency: 'TWD', itemOffered: { '@type': 'Service', name: it.n, description: it.d } })) }
};
const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', dateModified: '2026-10-18', mainEntity: SVFAQ.map((x) => ({ '@type': 'Question', name: x[0], acceptedAnswer: { '@type': 'Answer', text: x[1] } })) };
export default async function Page() { return <><Ld data={service} /><Ld data={faq} /><Home rows={await getRows()} path="/short-video" /></>; }
