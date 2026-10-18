/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // AI 客服介紹頁是一個獨立的 HTML（public/ai-kefu.html），網址用 /ai-kefu
  async redirects() { return [{ source: '/services/seo-geo', destination: '/seo-geo', permanent: true }]; },
  async rewrites() { return [{ source: '/ai-kefu', destination: '/ai-kefu.html' }]; }
};
