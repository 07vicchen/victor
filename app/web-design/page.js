import Home from '../../components/Home';
import { getRows } from '../rows';
import { meta, Ld } from '../seo';
import { BIZ, WEBFAQ } from '../../components/faq';
import CAT from '../../components/cat.json';
export const revalidate = 300;
export const metadata = meta('/web-design', '網頁設計價格・網站架設｜全台線上合作｜維拓傳媒', '維拓傳媒做網頁設計和網站架設，全台線上合作：一頁式活動頁 15,000 元、線上預約系統 30,000 元、品牌形象官網 50,000 元起。上線當天跟 Google 報到，附後台自己改，全台可線上合作。');
const IDS = ['lp','qp','bk','wb','is','ap','mt'];
const items = [].concat(...CAT.map((g) => g.items)).filter((it) => IDS.includes(it.id) && !it.ask);
const service = {
  '@context': 'https://schema.org', '@type': 'Service', name: '網頁設計', serviceType: '網頁設計、網站架設、形象官網、一頁式網頁、預約系統',
  provider: { '@type': 'Organization', name: BIZ.name, '@id': BIZ.url + '/#org' }, areaServed: [{ '@type': 'City', name: '新北市' }, { '@type': 'City', name: '台北市' }, { '@type': 'Country', name: '台灣' }], url: BIZ.url + '/web-design',
  description: '維拓傳媒做網頁設計和網站架設，全台線上合作：一頁式活動頁 15,000 元、線上預約系統 30,000 元、品牌形象官網 50,000 元起。上線當天跟 Google 報到，附後台自己改，全台可線上合作。',
  hasOfferCatalog: { '@type': 'OfferCatalog', name: '網頁設計價格', itemListElement: items.map((it) => ({ '@type': 'Offer', price: it.p, priceCurrency: 'TWD', itemOffered: { '@type': 'Service', name: it.n, description: it.d } })) }
};
const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', dateModified: '2026-10-18', mainEntity: WEBFAQ.map((x) => ({ '@type': 'Question', name: x[0], acceptedAnswer: { '@type': 'Answer', text: x[1] } })) };
export default async function Page() { return <><Ld data={service} /><Ld data={faq} /><Home rows={await getRows()} path="/web-design" /></>; }
