import Home from '../../components/Home';
import { getRows } from '../rows';
import { meta, Ld, faqLd } from '../seo';
export const revalidate = 300;
export const metadata = meta('/quote', "服務與報價｜每一項都有價錢｜維拓傳媒", "AI 動畫、社群代營運、Google 地圖曝光、品牌官網、企業 AI 導入，五大類每一項都標好價錢，勾選就算出合計，按一下傳到維拓 LINE。");
export default async function Page() { return <><Ld data={faqLd()} /><Home rows={await getRows()} path="/quote" /></>; }
