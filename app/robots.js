export default function robots() {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }], sitemap: 'https://www.victormedia.com.tw/sitemap.xml', host: 'https://www.victormedia.com.tw' };
}
