import { SVC } from '../components/faq';
import { GUIDES } from '../components/guides';
export default function sitemap() {
  const u = 'https://www.victormedia.com.tw', now = new Date();
  return ['', '/works', '/demo', '/quote', '/office', '/ai-kefu', '/contact'].concat(SVC.map((x) => '/services/' + x.slug)).concat(['/guides']).concat(GUIDES.map((g) => '/guides/' + g.slug))
    .map((p) => ({ url: u + p, lastModified: now, changeFrequency: 'weekly', priority: p === '' ? 1 : 0.8 }));
}
