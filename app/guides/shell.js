/* 指南頁共用外框：跟官網同一套黑底螢光綠 */
const CSS = `
.gwrap{min-height:100vh;background:#0a0a0a;color:#f4f4f4;font-family:"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;font-size:17px;line-height:1.85}
.gtop{border-bottom:1px solid #2a2a2a}
.gtop div{max-width:820px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.gtop a{color:#f4f4f4;text-decoration:none;display:flex;align-items:center;gap:10px;font-weight:900}
.gtop img{width:36px;height:36px}
.gtop nav{display:flex;gap:16px;font-size:14px}
.gtop nav a{color:#a6a6a6;font-weight:400}
.ga,.gl{max-width:820px;margin:0 auto;padding:40px 20px 72px}
.ga h1,.gl h1{font-size:clamp(28px,5vw,40px);line-height:1.3;font-weight:900;letter-spacing:-.02em;margin:8px 0 12px}
.ga h2{font-size:22px;font-weight:900;margin:36px 0 8px;padding-top:16px;border-top:1px solid #2a2a2a}
.ga p{margin:0 0 14px;color:#dcdcdc}
.gtag{color:#d3ff66;font-size:13px;letter-spacing:.12em;margin:18px 0 0}
.gmeta{color:#a6a6a6;font-size:14px}
.glead{font-size:19px;color:#f4f4f4!important;border-left:3px solid #c8ff3d;padding-left:14px}
.gback{color:#a6a6a6;font-size:14px;text-decoration:none}
.gsrc{margin-top:32px;font-size:14px;display:flex;flex-direction:column;gap:4px}
.gsrc a,.ga a{color:#d3ff66}
.gcta{display:inline-block;margin-top:28px;background:#c8ff3d;color:#0a0a0a!important;padding:14px 22px;font-weight:900;text-decoration:none}
.gitem{display:block;border:1px solid #2a2a2a;padding:18px 20px;margin-bottom:10px;text-decoration:none;color:#f4f4f4}
.gitem:hover{border-color:#c8ff3d}
.gitem b{display:block;font-size:19px;line-height:1.4}
.gitem span{display:block;color:#a6a6a6;font-size:15px;margin-top:6px}
.gfoot{border-top:1px solid #2a2a2a;color:#a6a6a6;font-size:13px;text-align:center;padding:24px 20px}
`;
export function GuideShell({ children }) {
  return (
    <div className="gwrap">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="gtop"><div>
        <a href="/"><img src="/m/logo.png" alt="" />維拓傳媒</a>
        <nav><a href="/guides">指南</a><a href="/quote">服務與報價</a><a href="/contact">聯絡我們</a></nav>
      </div></header>
      {children}
      <footer className="gfoot">維拓傳媒｜維拓顧問有限公司（統編 62180576）・新北市汐止區・LINE @898biiyu</footer>
    </div>
  );
}
