import Home from '../../components/Home';
import { getRows } from '../rows';
import { meta } from '../seo';
export const revalidate = 300;
export const metadata = meta('/demo', "服務示範｜AI 客服、AI 語音電話、LOGO 動畫｜維拓傳媒", "直接玩玩看：AI 文字客服、AI 語音電話客服、LOGO 片頭動畫、AI 廣告短片和網站製作，喜歡哪個再去報價。");
export default async function Page() { return <><Home rows={await getRows()} path="/demo" /></>; }
