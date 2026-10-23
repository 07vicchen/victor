/* 維拓 AI 剪片：示範影片畫面 */
var VSTY=[
 ["爆點跳字","口播、老闆講話","字一次跳 2～4 個，停頓全剪，重點字換色",{bg:["#3a3a3f","#1d1d22"],sub:"word",tc:"#fff",hl:"#FFE600",bar:null}],
 ["三段式知識框","知識、教學","上面大標題一直在，中間畫面，下面字幕，換重點跳章節卡",{bg:["#2a3550","#10224F"],sub:"frame",tc:"#fff",hl:"#FFD34D",bar:"#10224F"}],
 ["倒敘懸念","故事、短劇","開頭先放最精彩那句再倒回去講，電影黑邊、反轉前定格",{bg:["#2b2622","#0d0d0d"],sub:"cinema",tc:"#F5F1E8",hl:"#FF6B5B",bar:"#000"}],
 ["聊天泡泡","Podcast、多人聊天","誰講話就變誰的泡泡，左右對話往上疊",{bg:["#4a4540","#2a2622"],sub:"bubble",tc:"#1b1b1b",hl:"#FF3B6B",bar:null}],
 ["柔光質感","美業、保養","慢慢推近、柔光、細字拉開字距，看起來貴",{bg:["#e9cfc6","#b88f86"],sub:"glow",tc:"#fff",hl:"#F3C1B5",bar:null}],
 ["命理字卡","命理、星座","字幕浮在深色字卡上，關鍵字金色大字配鐘聲",{bg:["#3b2366","#1A0B2E"],sub:"card",tc:"#F7E7B4",hl:"#F2C94C",bar:null}],
 ["手寫筆記","療癒、心靈","下方筆記卡一字一字寫出來，重點字螢光筆劃過",{bg:["#7a6a58","#4a3e33"],sub:"note",tc:"#3B2A1E",hl:"#FFD66B",bar:null}],
 ["綜藝爆笑","搞笑、日常","1.1 倍速，重點字大字放大，尷尬點打「？？？」",{bg:["#5a2a3a","#2a1220"],sub:"slam",tc:"#fff",hl:"#FF3B6B",bar:null}],
 ["直播帶貨","賣衣服、推產品","卡拉 OK 字幕講到哪亮到哪，價格大字跳出、左上角限時標籤",{bg:["#5a1a1e","#2a0a0d"],sub:"karaoke",tc:"#fff",hl:"#FFE600",bar:null}],
 ["新聞快報","科技、時事","新聞台快報條、左上角 LIVE，下方滾動跑馬燈",{bg:["#1d2a44","#0b1222"],sub:"news",tc:"#fff",hl:"#ff4d4d",bar:"#c8102e"}],
 ["多人對話切鏡","Podcast、訪談、多人聊天","誰講話就切到誰的臉，一來一往時上下分割，字幕上方有名字牌",{bg:["#3a3a44","#15151a"],sub:"split",tc:"#fff",hl:"#FFE14D",bar:null}],
 ["金句電影字卡","心靈成長、個人品牌","畫面像電影橫幅放中間，講到金句切黑底金字卡",{bg:["#2a2722","#0b0b0b"],sub:"goldq",tc:"#EDE6D6",hl:"#D9B870",bar:null}]];
let LOGO=null;
var LINES=["你知道為什麼","你的影片沒人看完嗎","因為前三秒","就讓人滑走了","剪掉停頓","重點放最前面","觀眾就會留下來"];

function person(g,W,H,t,z){g.save();g.translate(W/2,H*.56);g.scale(z,z);g.translate(-W/2,-H*.56);
  var bob=Math.sin(t*3)*4;g.fillStyle="#2c3a5c";g.beginPath();g.ellipse(W/2,H*.98+bob*.3,W*.42,H*.3,0,0,7);g.fill();
  g.fillStyle="#c9a287";g.beginPath();g.ellipse(W/2,H*.5+bob,W*.17,H*.12,0,0,7);g.fill();
  g.fillStyle="#2a211b";g.beginPath();g.ellipse(W/2,H*.43+bob,W*.18,H*.07,0,Math.PI,0);g.fill();
  var m=Math.abs(Math.sin(t*12))*8;g.fillStyle="#7a3a33";g.beginPath();g.ellipse(W/2,H*.56+bob,W*.04,2+m*.6,0,0,7);g.fill();g.restore()}
function bgGrad(g,W,H,c){var gr=g.createLinearGradient(0,0,W,H);gr.addColorStop(0,c[0]);gr.addColorStop(1,c[1]);g.fillStyle=gr;g.fillRect(0,0,W,H)}
function wrapC(g,t,max){var o=[];let l="";for(var ch of t){if(g.measureText(l+ch).width>max&&l){o.push(l);l=ch}else l+=ch}if(l)o.push(l);return o}
function sub(g,W,H,o,txt,k,t){var s=W/540;g.textAlign="center";g.textBaseline="middle";
  if(o.sub==="word"){var n=Math.max(1,Math.ceil(txt.length*Math.min(1,k*1.6))),show=txt.slice(0,n),last=show.slice(-2);g.font=`900 ${50*s}px ${F}`;g.lineWidth=10*s;g.strokeStyle="#000";g.strokeText(show,W/2,H*.72);g.fillStyle=o.tc;g.fillText(show.slice(0,-2),W/2-g.measureText(last).width/2,H*.72);g.fillStyle=o.hl;g.textAlign="left";g.fillText(last,W/2+g.measureText(show).width/2-g.measureText(last).width,H*.72);g.textAlign="center"}
  else if(o.sub==="frame"){g.fillStyle=o.bar;g.fillRect(0,0,W,H*.2);g.fillRect(0,H*.78,W,H*.22);g.font=`900 ${50*s}px ${F}`;g.fillStyle="#fff";g.fillText("剪片三個重點",W/2,H*.1);g.fillStyle=o.hl;g.font=`700 ${40*s}px ${F}`;g.fillText(txt,W/2,H*.86)}
  else if(o.sub==="cinema"){g.fillStyle="#000";g.fillRect(0,0,W,H*.14);g.fillRect(0,H*.86,W,H*.14);g.globalAlpha=Math.min(1,k*3);g.font=`700 ${38*s}px "Noto Serif TC",serif`;g.fillStyle=o.tc;g.fillText(txt,W/2,H*.92);g.globalAlpha=1}
  else if(o.sub==="bubble"){var L=(Math.floor(t*0.8)%2)===0;g.font=`700 ${36*s}px ${F}`;var w=g.measureText(txt).width+50*s;var x=L?40*s:W-40*s-w;g.fillStyle=L?"#fff":"#FFE14D";g.beginPath();g.roundRect(x,H*.66,w,74*s,36*s);g.fill();g.fillStyle=o.tc;g.fillText(txt,x+w/2,H*.66+37*s)}
  else if(o.sub==="glow"){g.fillStyle="#ffffff22";g.fillRect(0,0,W,H);g.font=`500 ${38*s}px ${F}`;g.fillStyle=o.tc;g.shadowColor="#fff";g.shadowBlur=18;g.fillText(txt.split("").join(" "),W/2,H*.78);g.shadowBlur=0}
  else if(o.sub==="card"){g.fillStyle="#1A0B2Ecc";g.beginPath();g.roundRect(40*s,H*.7,W-80*s,110*s,20*s);g.fill();g.strokeStyle="#F2C94C88";g.lineWidth=2;g.stroke();g.font=`700 ${40*s}px "Noto Serif TC",serif`;g.fillStyle=o.tc;g.fillText(txt,W/2,H*.7+55*s)}
  else if(o.sub==="note"){g.fillStyle="#FFF8EC";g.beginPath();g.roundRect(40*s,H*.7,W-80*s,120*s,10*s);g.fill();g.font=`700 ${38*s}px ${F}`;var n=Math.ceil(txt.length*Math.min(1,k*1.5));g.fillStyle="#FFD66B99";g.fillRect(W/2-120*s,H*.7+62*s,240*s*Math.min(1,k*1.5),26*s);g.fillStyle=o.tc;g.fillText(txt.slice(0,n),W/2,H*.7+60*s)}
  else if(o.sub==="slam"){g.save();g.translate(W/2,H*.7);g.font=`900 ${70*s}px ${F}`;g.lineWidth=12*s;g.strokeStyle="#111";g.strokeText(txt,0,0);g.fillStyle=o.hl;g.fillText(txt,0,0);g.restore()}
  else if(o.sub==="karaoke"){g.font=`900 ${52*s}px ${F}`;var w=g.measureText(txt).width;g.lineWidth=10*s;g.strokeStyle="#E0242F";g.strokeText(txt,W/2,H*.74);g.fillStyle=o.tc;g.fillText(txt,W/2,H*.74);g.save();g.beginPath();g.rect(W/2-w/2,H*.68,w*Math.min(1,k*1.4),H*.12);g.clip();g.fillStyle=o.hl;g.fillText(txt,W/2,H*.74);g.restore();
    if(1){g.fillStyle="#E0242F";g.beginPath();g.roundRect(24*s,30*s,120*s,50*s,8*s);g.fill();g.fillStyle="#fff";g.font=`900 ${30*s}px ${F}`;g.fillText("限時",84*s,56*s)}
    g.fillStyle="#FFE600";g.font=`900 ${60*s}px ${N}`;g.fillText("$390",W/2,H*.32)}
  else if(o.sub==="split"){var who=Math.floor(t/1.6)%2,nm=["Vic","希亞"];g.fillStyle="#000";g.fillRect(0,H/2-3*s,W,6*s);
    for(var q=0;q<2;q++){var y0=q*H/2;g.fillStyle=q===who?o.hl:"rgba(255,255,255,.75)";g.beginPath();g.roundRect(20*s,y0+20*s,110*s,40*s,20*s);g.fill();g.fillStyle="#111";g.font=`900 ${24*s}px ${F}`;g.fillText(nm[q],75*s,y0+41*s)}
    g.font=`900 ${40*s}px ${F}`;g.lineWidth=9*s;g.strokeStyle="#000";g.strokeText(txt,W/2,H/2);g.fillStyle=who?"#9EE6FF":o.hl;g.fillText(txt,W/2,H/2)}
  else if(o.sub==="goldq"){var card=Math.floor(t/1.6)%3===2;if(card){g.fillStyle="#000";g.fillRect(0,0,W,H);g.globalAlpha=.12;g.font=`900 ${200*s}px "Noto Serif TC",serif`;g.fillStyle=o.hl;g.fillText(txt.slice(0,2),W/2,H/2);g.globalAlpha=Math.min(1,k*3);g.font=`900 ${52*s}px "Noto Serif TC",serif`;g.fillStyle=o.hl;g.fillText(txt,W/2,H/2);g.globalAlpha=1}
    else{g.fillStyle="#000";g.fillRect(0,0,W,H*.27);g.fillRect(0,H*.73,W,H*.27);g.font=`600 ${30*s}px "Noto Serif TC",serif`;g.fillStyle=o.tc;g.fillText(txt,W/2,H*.77)}}
  else if(o.sub==="news"){g.fillStyle=o.bar;g.fillRect(0,H*.8,W,70*s);g.fillStyle="#fff";g.fillRect(0,H*.8+70*s,W,46*s);g.font=`900 ${34*s}px ${F}`;g.fillStyle="#fff";g.textAlign="left";g.fillText("快報",20*s,H*.8+35*s);g.fillText(txt,120*s,H*.8+35*s);g.fillStyle="#c8102e";g.font=`700 ${26*s}px ${F}`;var off=(t*80*s)%W;g.fillText("AI 剪片・自動上字幕・剪掉停頓",W-off,H*.8+93*s);
    {g.fillStyle="#c8102e";g.beginPath();g.arc(36*s,40*s,10*s,0,7);g.fill()}g.fillStyle="#fff";g.font=`900 ${26*s}px ${N}`;g.fillText("LIVE",54*s,42*s);g.textAlign="center"}
}
function frame(cv,o,t){var g=cv.getContext("2d"),W=cv.width,H=cv.height,per=1.6,i=Math.floor(t/per)%LINES.length,k=(t%per)/per;
  bgGrad(g,W,H,o.bg);var z=1;if(o.sub==="split"){for(var q=0;q<2;q++){g.save();g.beginPath();g.rect(0,q*H/2,W,H/2);g.clip();g.translate(0,q*H/2-H*.2);person(g,W,H,t+q*1.3,.85);g.restore()}}else person(g,W,H,t,z);
    sub(g,W,H,o,LINES[i],k,t);if(LOGO){var m=Math.min(W*.18/LOGO.width,W*.18/LOGO.height),w=LOGO.width*m,h=LOGO.height*m;g.globalAlpha=.85;g.drawImage(LOGO,W-w-W*.05,o.sub==="frame"||o.sub==="news"?H*.22:W*.05,w,h);g.globalAlpha=1}g.fillStyle="#c9a96e";g.fillRect(0,H-6,W*((t%(per*LINES.length))/(per*LINES.length)),6)}

