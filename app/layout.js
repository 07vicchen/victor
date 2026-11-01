import './globals.css';
import { BIZ, SVC } from '../components/faq';
import { Ld } from './seo';
import CAT from '../components/cat.json';

const ORG = {
  '@context': 'https://schema.org', '@type': 'ProfessionalService', '@id': BIZ.url + '/#org',
  name: BIZ.name, legalName: BIZ.legal, alternateName: ['Victor Media', '維拓顧問有限公司', '維拓顧問', '維拓媒體', 'Victor Media Division'],
  description: '全台線上合作的品牌與 AI 內容公司（公司在新北汐止）：AI 動畫角色、短影音代操、自媒體 IP 代操、網頁設計、社群經營、Google 地圖曝光、SEO 與 AI 搜尋優化（GEO）、品牌官網、LINE AI 客服與 AI 辦公室。每一項服務都有公開價格。',
  founder: { '@type': 'Person', name: '陳卓恩', alternateName: 'Vic' },
  knowsAbout: ['AI 動畫', '短影音代營運', '社群經營', 'Google 商家與地圖排名', 'SEO', '生成式引擎優化（GEO）', 'LINE AI 客服', 'AI 辦公室'], taxID: BIZ.taxId, url: BIZ.url, logo: BIZ.url + '/m/logo.png', image: BIZ.url + '/m/hero.jpg',
  telephone: BIZ.tel, priceRange: 'NT$500–NT$150,000',
  address: { '@type': 'PostalAddress', addressLocality: BIZ.locality, addressRegion: BIZ.region, addressCountry: 'TW' },
  areaServed: ['新北市', '台北市', '台灣'],
  openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '21:00' }],
  sameAs: ['https://www.instagram.com/' + BIZ.ig + '/', 'https://line.me/R/ti/p/' + encodeURIComponent(BIZ.line), 'https://share.google/pmbiFNuTPhAbAroQx'], hasMap: 'https://share.google/pmbiFNuTPhAbAroQx',
  hasOfferCatalog: { '@type': 'OfferCatalog', name: '維拓傳媒服務與價格', itemListElement: CAT.map((g, i) => ({ '@type': 'OfferCatalog', name: g.g, url: BIZ.url + '/services/' + (SVC[i] ? SVC[i].slug : ''), itemListElement: g.items.filter((it) => !it.ask).map((it) => ({ '@type': 'Offer', price: it.p, priceCurrency: 'TWD', itemOffered: { '@type': 'Service', name: it.n } })) })) }
};

export const metadata = {
  metadataBase: new URL('https://www.victormedia.com.tw'),
  title: { default: '維拓傳媒｜AI 動畫代言、短影音代操、網頁設計、SEO｜全台線上合作', template: '%s' },
  description: '維拓傳媒專注個人品牌與 IP 孵化：AI 明星、AI 動畫、社群代營運、AI 辦公室。每一項都有價錢，線上報價直接傳 LINE。',
  icons: { icon: '/m/logo.png' },
  openGraph: { title: '維拓傳媒｜為你的品牌，拓出一片天', description: 'AI 明星、AI 動畫、社群代營運、AI 辦公室。', images: ['/m/hero.jpg'], type: 'website' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <script dangerouslySetInnerHTML={{ __html: "(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Noto+Serif+TC:wght@700&display=swap';document.head.appendChild(l)})()" }} />
        <script dangerouslySetInnerHTML={{ __html: "!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(\".\");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement(\"script\")).type=\"text/javascript\",p.crossOrigin=\"anonymous\",p.async=!0,p.src=s.api_host.replace(\".i.posthog.com\",\"-assets.i.posthog.com\")+\"/static/array.js\",(r=t.getElementsByTagName(\"script\")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a=\"posthog\",u.people=u.people||[],u.toString=function(t){var e=\"posthog\";return\"posthog\"!==a&&(e+=\".\"+a),t||(e+=\" (stub)\"),e},u.people.toString=function(){return u.toString(1)+\".people (stub)\"},o=\"init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug\".split(\" \"),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);\nif(!/^\\/(admin|office)/.test(location.pathname)&&!/admin/.test(location.pathname)){posthog.init('phc_vYx5vaQf44FpRtbfbKyytEkvtHaPoHpSunW89Bz2eHao',{api_host:'https://us.i.posthog.com',person_profiles:'identified_only',capture_exceptions:true})}" }} />
      </head>
      <body data-ds="neon" data-shape="sharp"><Ld data={ORG} />{children}</body>
    </html>
  );
}
