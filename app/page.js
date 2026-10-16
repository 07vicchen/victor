import Home from '../components/Home';
import { getRows } from './rows';
import { meta } from './seo';
export const revalidate = 300;
export const metadata = meta('/', '維拓傳媒｜AI 動畫、短影音代營運、AI 辦公室｜新北汐止', '維拓傳媒在新北汐止，做 AI 動畫角色、短影音代營運、社群經營、Google 地圖曝光、官網與 AI 客服、AI 辦公室。老闆不用露臉，每一項都有價錢，線上報價直接傳 LINE。');
export default async function Page() { return <Home rows={await getRows()} path="/" />; }
