import Home from '../../components/Home';
import { getRows } from '../rows';
import { meta, Ld } from '../seo';
import { BIZ, ABOUTFAQ } from '../../components/faq';
export const revalidate = 300;
export const metadata = meta('/about', '關於維拓傳媒｜創辦人陳卓恩・新北汐止 AI 動畫與短影音公司', '維拓傳媒是維拓顧問有限公司（統一編號 62180576）的品牌，由陳卓恩（Vic）創辦，公司在新北市汐止區，全台線上合作。自己從 0 經營貓探長、村山爺爺、王拓恩，每一項服務都公開價格。');
const page = {
  '@context': 'https://schema.org', '@type': 'AboutPage', url: BIZ.url + '/about', name: '關於維拓傳媒', dateModified: '2026-10-19',
  about: { '@id': BIZ.url + '/#org' },
  mainEntity: { '@type': 'Person', '@id': BIZ.url + '/#founder', name: '陳卓恩', alternateName: 'Vic', jobTitle: '創辦人', worksFor: { '@id': BIZ.url + '/#org' } }
};
const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', dateModified: '2026-10-19', mainEntity: ABOUTFAQ.map((x) => ({ '@type': 'Question', name: x[0], acceptedAnswer: { '@type': 'Answer', text: x[1] } })) };
export default async function Page() { return <><Ld data={page} /><Ld data={faq} /><Home rows={await getRows()} path="/about" /></>; }
