import Home from '../../../components/Home';
import { SVC } from '../../../components/faq';
import { getRows } from '../../rows';
import { meta, Ld, faqLd } from '../../seo';
import CAT from '../../../components/cat.json';
export const revalidate = 300;
export function generateStaticParams() { return SVC.map((x) => ({ slug: x.slug })); }
export const dynamicParams = false;
export function generateMetadata({ params }) {
  const i = SVC.findIndex((x) => x.slug === params.slug), x = SVC[i];
  return meta('/services/' + x.slug, x.name + '價格與內容｜維拓傳媒', x.intro);
}
export default async function Page({ params }) {
  const i = SVC.findIndex((x) => x.slug === params.slug), g = CAT[i] || { items: [] };
  const offers = { '@context': 'https://schema.org', '@type': 'OfferCatalog', name: SVC[i].name, itemListElement: g.items.filter((it) => !it.ask).map((it) => ({ '@type': 'Offer', price: it.p, priceCurrency: 'TWD', itemOffered: { '@type': 'Service', name: it.n, description: it.d } })) };
  return <><Ld data={offers} /><Ld data={faqLd()} /><Home rows={await getRows()} path={'/services/' + SVC[i].slug} /></>;
}
