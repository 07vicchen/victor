import Home from '../components/Home';
import { getRows } from './rows';
import { meta } from './seo';
export const revalidate = 300;
export const metadata = meta('/', '維拓傳媒｜AI 動畫、短影音代操、網頁設計、SEO・GEO 優化｜全台線上合作', '不想露臉也能天天出片，客人問 ChatGPT「哪家好」也找得到你。維拓傳媒做 AI 動畫代言、短影音代操、網頁設計、SEO・GEO 和 LINE AI 客服，每一項都標好價錢，全台線上合作，報價直接傳 LINE。');
export default async function Page() { return <Home rows={await getRows()} path="/" />; }
