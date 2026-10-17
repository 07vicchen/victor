// AI 爬蟲明確開放（GEO：讓 ChatGPT、Gemini、Perplexity、Claude 讀得到官網）
const AI_BOTS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'Google-Extended', 'PerplexityBot', 'Perplexity-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'Applebot-Extended', 'Bingbot'];
export default function robots() {
  const block = ['/admin', '/api/', '/ai-kefu-form.html'];
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: block }].concat(AI_BOTS.map((b) => ({ userAgent: b, allow: '/', disallow: block }))),
    sitemap: 'https://www.victormedia.com.tw/sitemap.xml',
    host: 'https://www.victormedia.com.tw'
  };
}
