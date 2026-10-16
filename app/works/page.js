import Home from '../../components/Home';
import { getRows } from '../rows';
import { meta } from '../seo';
export const revalidate = 300;
export const metadata = meta('/works', "作品案例｜王拓恩、貓探長、村山爺爺｜維拓傳媒", "維拓傳媒做起來的三個 IP：AI 明星王拓恩、動畫 IP 貓探長、真人 IP 村山爺爺，觀看數、增粉數都是帳號後台的真實數據。");
export default async function Page() { return <><Home rows={await getRows()} path="/works" /></>; }
