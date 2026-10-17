export default function robots() {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/ai-kefu-form.html'] }], sitemap: 'https://www.victormedia.com.tw/sitemap.xml', host: 'https://www.victormedia.com.tw' };
}
