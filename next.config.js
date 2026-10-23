/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  images: { unoptimized: true },
  // AI 客服介紹頁是一個獨立的 HTML（public/ai-kefu.html），網址用 /ai-kefu
  // AI 工具區：/ai-tools（介紹）、/ai-design（AI 美編）、/ai-video（AI 剪片），都是 public/ 裡的獨立 HTML
  async redirects() { return [{ source: '/services/seo-geo', destination: '/seo-geo', permanent: true }, { source: '/services/ai-animation', destination: '/ai-animation', permanent: true }, { source: '/services/brand', destination: '/web-design', permanent: true }]; },
  async rewrites() { return [{ source: '/ai-kefu', destination: '/ai-kefu.html' }, { source: '/ai-tools', destination: '/ai-tools.html' }, { source: '/ai-design', destination: '/ai-design.html' }, { source: '/ai-video', destination: '/ai-video.html' }, { source: '/ai-admin', destination: '/ai-admin.html' }, { source: '/privacy', destination: '/privacy.html' }, { source: '/terms', destination: '/terms.html' }]; }
};
