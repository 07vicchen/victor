import { BIZ, FAQ } from '../components/faq';
export function faqLd(items) {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: (items || FAQ).map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) };
}
export function Ld({ data }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
export function meta(path, title, description) {
  return { title, description, alternates: { canonical: path }, openGraph: { title, description, url: BIZ.url + path, siteName: BIZ.name, locale: 'zh_TW', type: 'website', images: ['/m/hero.jpg'] } };
}
