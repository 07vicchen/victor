import './globals.css';
import { BIZ, SVC } from '../components/faq';
import { Ld } from './seo';
import CAT from '../components/cat.json';

const ORG = {
  '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': BIZ.url + '/#org',
  name: BIZ.name, legalName: BIZ.legal, alternateName: ['Victor Media', '維拓顧問有限公司', '維拓顧問', '維拓媒體', 'Victor Media Division'],
  description: '新北汐止的品牌與 AI 內容公司：AI 動畫角色、短影音代營運、社群經營、Google 地圖曝光、SEO 與 AI 搜尋優化（GEO）、品牌官網、LINE AI 客服與 AI 辦公室。每一項服務都有公開價格。',
  founder: { '@type': 'Person', name: '陳卓恩', alternateName: 'Vic' },
  knowsAbout: ['AI 動畫', '短影音代營運', '社群經營', 'Google 商家與地圖排名', 'SEO', '生成式引擎優化（GEO）', 'LINE AI 客服', 'AI 辦公室'], taxID: BIZ.taxId, url: BIZ.url, logo: BIZ.url + '/m/logo.png', image: BIZ.url + '/m/hero.jpg',
  telephone: BIZ.tel, priceRange: 'NT$500–NT$150,000',
  address: { '@type': 'PostalAddress', streetAddress: BIZ.street, addressLocality: BIZ.locality, addressRegion: BIZ.region, addressCountry: 'TW' },
  areaServed: ['新北市', '台北市', '台灣'],
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '21:00' }],
  sameAs: ['https://www.instagram.com/' + BIZ.ig + '/', 'https://line.me/R/ti/p/' + encodeURIComponent(BIZ.line)],
  hasOfferCatalog: { '@type': 'OfferCatalog', name: '維拓傳媒服務與價格', itemListElement: CAT.map((g, i) => ({ '@type': 'OfferCatalog', name: g.g, url: BIZ.url + '/services/' + (SVC[i] ? SVC[i].slug : ''), itemListElement: g.items.filter((it) => !it.ask).map((it) => ({ '@type': 'Offer', price: it.p, priceCurrency: 'TWD', itemOffered: { '@type': 'Service', name: it.n } })) })) }
};

export const metadata = {
  metadataBase: new URL('https://www.victormedia.com.tw'),
  title: { default: '維拓傳媒｜AI 動畫、短影音代營運、AI 辦公室｜新北汐止', template: '%s' },
  description: '維拓傳媒專注個人品牌與 IP 孵化：AI 明星、AI 動畫、社群代營運、AI 辦公室。每一項都有價錢，線上報價直接傳 LINE。',
  icons: { icon: '/m/logo.png' },
  openGraph: { title: '維拓傳媒｜為你的名字，拓一個時代', description: 'AI 明星、AI 動畫、社群代營運、AI 辦公室。', images: ['/m/hero.jpg'], type: 'website' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <script dangerouslySetInnerHTML={{ __html: "(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Noto+Serif+TC:wght@700&display=swap';document.head.appendChild(l)})()" }} />
      </head>
      <body data-ds="neon" data-shape="sharp"><Ld data={ORG} />{children}</body>
    </html>
  );
}
