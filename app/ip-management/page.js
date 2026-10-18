import Home from '../../components/Home';
import { getRows } from '../rows';
import { meta, Ld } from '../seo';
import { BIZ, IPFAQ } from '../../components/faq';
import CAT from '../../components/cat.json';
export const revalidate = 300;
export const metadata = meta('/ip-management', '自媒體 IP 代操・個人品牌經營價格｜全台線上合作｜維拓傳媒', '維拓傳媒做自媒體 IP 代操和個人品牌經營：人設定位 15,000 元起、自媒體代營運每月 20,000 元起。村山爺爺 3 週起量、第 2 個月變現，貓探長單支 9.8 萬觀看，都是我們從 0 做起來的。');
const IDS = ['sp','so','sv','cq','twb','pc','dr','vw'];
const items = [].concat(...CAT.map((g) => g.items)).filter((it) => IDS.includes(it.id) && !it.ask);
const service = {
  '@context': 'https://schema.org', '@type': 'Service', name: '自媒體 IP 代操', serviceType: '自媒體代操、IP 代操、個人品牌經營、社群代營運',
  provider: { '@type': 'Organization', name: BIZ.name, '@id': BIZ.url + '/#org' }, areaServed: [{ '@type': 'City', name: '新北市' }, { '@type': 'City', name: '台北市' }, { '@type': 'Country', name: '台灣' }], url: BIZ.url + '/ip-management',
  description: '維拓傳媒做自媒體 IP 代操和個人品牌經營：人設定位 15,000 元起、自媒體代營運每月 20,000 元起。村山爺爺 3 週起量、第 2 個月變現，貓探長單支 9.8 萬觀看，都是我們從 0 做起來的。',
  hasOfferCatalog: { '@type': 'OfferCatalog', name: '自媒體 IP 代操價格', itemListElement: items.map((it) => ({ '@type': 'Offer', price: it.p, priceCurrency: 'TWD', itemOffered: { '@type': 'Service', name: it.n, description: it.d } })) }
};
const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: IPFAQ.map((x) => ({ '@type': 'Question', name: x[0], acceptedAnswer: { '@type': 'Answer', text: x[1] } })) };
export default async function Page() { return <><Ld data={service} /><Ld data={faq} /><Home rows={await getRows()} path="/ip-management" /></>; }
