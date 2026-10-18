import Home from '../components/Home';
import { getRows } from './rows';
import { meta } from './seo';
export const revalidate = 300;
export const metadata = meta('/', '維拓傳媒｜AI 動畫代言、短影音代操、網頁設計、SEO｜全台線上合作', '維拓傳媒（維拓顧問有限公司）做 AI 動畫代言、短影音代操、自媒體 IP 代操、網頁設計、SEO・AEO・GEO、AI 客服和 AI 辦公室，全台線上合作，公司在新北汐止。老闆不用露臉，每一項都有價錢，線上報價直接傳 LINE。');
export default async function Page() { return <Home rows={await getRows()} path="/" />; }
