import { notFound } from 'next/navigation';
import { CARDS, ADDR, MAP } from '../data';

export function generateStaticParams() { return Object.keys(CARDS).map((who) => ({ who })); }

export function generateMetadata({ params }) {
  const c = CARDS[params.who];
  if (!c) return {};
  return {
    title: c.name + '｜' + c.company + ' ' + c.title,
    description: c.company + '　' + c.slogan[0] + '　電話 ' + c.tel,
    robots: { index: false, follow: false },
    openGraph: { title: c.name + '｜' + c.company, description: c.slogan[0], images: ['/m/hero.jpg'] }
  };
}

const CSS = `
.ec{position:fixed;inset:0;overflow-y:auto;background:#0a0908;color:#efe9de;font-family:"Noto Sans TC",system-ui,sans-serif;-webkit-font-smoothing:antialiased;z-index:50}
.ec *{box-sizing:border-box}
.ec-in{max-width:440px;margin:0 auto;padding:0 20px 40px}
.ec-hero{position:relative;height:250px;overflow:hidden;margin:0 -20px}
.ec-big{position:absolute;font-family:"Noto Serif TC",serif;font-weight:700;font-size:290px;line-height:1;background:linear-gradient(160deg,#8a6a2c 0%,#f6e6b4 30%,#c9a24f 52%,#fff1c8 70%,#b38a3e 100%);-webkit-background-clip:text;background-clip:text;color:transparent;pointer-events:none;user-select:none}
.ec-big.right{right:-36px;top:-34px}.ec-big.left{left:-36px;top:-20px}
.ec-co{margin-top:22px;display:flex;flex-direction:column;gap:9px}
.ec-co.left{align-items:flex-end;text-align:right}
.ec-co b{font-family:"Noto Serif TC",serif;font-size:26px;letter-spacing:.3em;color:#f4efe6;font-weight:700}
.ec-co i{font-style:normal;font-size:10px;letter-spacing:.5em;color:#a8946a}
.ec-co hr{width:30px;border:0;border-top:1px solid #d6b46a;margin:0}
.ec-name{margin-top:30px;padding-top:26px;border-top:1px solid rgba(214,180,106,.22);display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.ec-name h1{margin:0;font-family:"Noto Serif TC",serif;font-weight:700;font-size:38px;letter-spacing:.14em;background:linear-gradient(118deg,#8a6a2c 0%,#f6e6b4 30%,#c9a24f 55%,#fff1c8 75%,#b38a3e 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.ec-name span{font-size:12px;letter-spacing:.3em;color:#d6b46a}
.ec-slo{margin:14px 0 0;color:#c9b88f;font-family:"Noto Serif TC",serif;font-size:14px;letter-spacing:.2em;line-height:1.9}
.ec-slo small{display:block;font-family:"Noto Sans TC",sans-serif;font-size:12px;color:#8f8778;letter-spacing:.2em}
.ec-btns{margin-top:28px;display:grid;gap:10px}
.ec-btn{display:flex!important;flex-direction:row!important;align-items:center;justify-content:space-between;gap:12px;min-height:56px;padding:0 18px;border:1px solid rgba(214,180,106,.35);color:#efe9de;text-decoration:none;font-size:15px;background:#12100e}
.ec-btn em{font-style:normal;flex-shrink:0;font-size:11px;letter-spacing:.3em;color:#d6b46a}
.ec-btn.ec-main{background:linear-gradient(118deg,#b38a3e,#ecd498 35%,#c9a24f 60%,#e8cf8c);color:#0a0908;border:0;font-weight:700}
.ec-btn.ec-main em{color:#3a2c12}
.ec-btn:active{opacity:.8}
.ec-foot{margin-top:28px;padding-top:16px;border-top:1px solid rgba(214,180,106,.22);font-size:12px;color:#8f8778;line-height:1.9;letter-spacing:.06em}
`;

export default function Card({ params }) {
  const c = CARDS[params.who];
  if (!c) notFound();
  const vcf = '/card/' + params.who + '/vcf';
  return (
    <div className="ec">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <main className="ec-in">
        <div className="ec-hero"><div className={'ec-big ' + c.pos} aria-hidden="true">{c.big}</div></div>
        <div className={'ec-co ' + c.pos}><b>{c.company}</b><hr /><i>{c.en}</i></div>
        <div className="ec-name"><h1>{c.name}</h1><span>{c.enName}　{c.title}</span></div>
        <p className="ec-slo">{c.slogan[0]}{c.slogan[1] ? <small>{c.slogan[1]}</small> : null}</p>
        <div className="ec-btns">
          <a className="ec-btn ec-main" href={vcf}>存到通訊錄<em>SAVE</em></a>
          <a className="ec-btn" href={'tel:' + c.telRaw}>{c.tel}<em>CALL</em></a>
          {c.line ? <a className="ec-btn" href={'https://line.me/R/ti/p/' + encodeURIComponent(c.line)}>LINE {c.line}<em>LINE</em></a> : null}
          {c.web ? <a className="ec-btn" href={c.web}>{c.webLabel}<em>WEB</em></a> : null}
          <a className="ec-btn" href={MAP}>{ADDR}<em>MAP</em></a>
        </div>
        <div className="ec-foot">{c.legal}　統一編號 {c.taxId}<br />{c.services}</div>
      </main>
    </div>
  );
}
