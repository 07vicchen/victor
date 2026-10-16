import './globals.css';

export const metadata = {
  metadataBase: new URL('https://www.victormedia.com.tw'),
  title: '維拓傳媒｜為你的名字，鑄一個時代',
  description: '維拓傳媒專注個人品牌與 IP 孵化：AI 明星、AI 動畫、社群代營運、AI 辦公室。每一項都有價錢，線上報價直接傳 LINE。',
  icons: { icon: '/m/logo.png' },
  openGraph: { title: '維拓傳媒｜為你的名字，鑄一個時代', description: 'AI 明星、AI 動畫、社群代營運、AI 辦公室。', images: ['/m/hero.jpg'], type: 'website' }
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <script dangerouslySetInnerHTML={{ __html: "(function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Noto+Serif+TC:wght@700&display=swap';document.head.appendChild(l)})()" }} />
      </head>
      <body data-ds="neon" data-shape="sharp">{children}</body>
    </html>
  );
}
