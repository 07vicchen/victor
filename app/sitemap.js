import { SVC } from '../components/faq';
import { GUIDES } from '../components/guides';
export default function sitemap() {
  const u = 'https://www.victormedia.com.tw', now = new Date();
  return ['', '/works', '/demo', '/quote', '/office', '/ai-kefu', '/seo-geo', '/ai-animation', '/web-design', '/short-video', '/ip-management', '/contact'].concat(SVC.filter((x) => x.slug !== 'seo-geo' && x.slug !== 'ai-animation' && x.slug !== 'brand').map((x) => '/services/' + x.slug)).concat(['/guides']).concat(GUIDES.map((g) => '/guides/' + g.slug))
    .map((p) => ({ url: u + p, lastModified: now, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.8 }));
}
