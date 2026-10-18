import Home from '../../components/Home';
import { getRows } from '../rows';
import { meta, Ld, faqLd } from '../seo';
export const revalidate = 300;
export const metadata = meta('/contact', "聯絡維拓傳媒｜LINE @898biiyu・0903-454-333", "維拓傳媒（維拓顧問有限公司）新北市汐止區新台五路二段238巷112號10樓，電話 0903-454-333，LINE @898biiyu，週一至週五 10:00–21:00，全台可線上合作。");
export default async function Page() { return <><Ld data={faqLd()} /><Home rows={await getRows()} path="/contact" /></>; }
