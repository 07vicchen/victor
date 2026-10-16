import Home from '../../components/Home';
import { getRows } from '../rows';
import { meta } from '../seo';
export const revalidate = 300;
export const metadata = meta('/office', "AI 辦公室代建｜AI 員工每天照班表上班｜維拓傳媒", "幫你的公司蓋一間 AI 辦公室：AI 員工每天找爆款、寫腳本、看數據、回留言，報告集中在一個網頁，你只要看、按同意。快速代建 NT$48,000 起。");
export default async function Page() { return <><Home rows={await getRows()} path="/office" /></>; }
