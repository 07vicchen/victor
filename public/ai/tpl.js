/* 維拓 AI 美編：商品圖版型（畫在 canvas 上）。需要的全域變數在這裡先宣告 */
var F='"Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif',N='"Roboto","Noto Sans TC",sans-serif';
var S=1080;var col="#c8963e",prod=null,prodUp=null;
var P={name:"不鏽鋼真空保溫瓶 500ml",head:"冰塊放一天都還在",badges:["24H 保冰","316 不鏽鋼","單手開蓋"],price:590,orig:890,
  sizes:[["容量","350ml","500ml","750ml"],["高度","19cm","23cm","27cm"],["口徑","6.5cm","6.5cm","7cm"],["重量","280g","330g","410g"]],
  colors:[["霧黑",0],["奶白",1],["湖水綠",160],["蜜桃粉",330],["海軍藍",210]]};
// ---------- 示範商品：畫一個保溫瓶（透明背景） ----------
function sampleProduct(){const c=document.createElement("canvas");c.width=600;c.height=1000;const g=c.getContext("2d");
  const body=g.createLinearGradient(150,0,450,0);body.addColorStop(0,"#3a3d44");body.addColorStop(.35,"#6b707b");body.addColorStop(.5,"#8b909b");body.addColorStop(1,"#2a2d33");
  rr(g,150,250,300,700,60);g.fillStyle=body;g.fill();
  g.fillStyle="#ffffff22";rr(g,190,300,26,600,13);g.fill();
  const lid=g.createLinearGradient(170,0,430,0);lid.addColorStop(0,"#1c1d21");lid.addColorStop(.5,"#45474e");lid.addColorStop(1,"#141518");
  rr(g,175,110,250,150,30);g.fillStyle=lid;g.fill();rr(g,210,60,180,70,22);g.fill();
  g.strokeStyle="#2a2b30";g.lineWidth=26;g.beginPath();g.arc(300,70,70,Math.PI*1.1,Math.PI*1.9);g.stroke();
  g.fillStyle="#c8963e";g.fillRect(150,262,300,10);
  g.fillStyle="#ffffffcc";g.font=`700 34px ${N}`;g.textAlign="center";g.fillText("VICTOR",300,640);g.font=`500 18px ${N}`;g.fillText("THERMO 500",300,672);
  return c}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
const iw=i=>i.naturalWidth||i.width,ih=i=>i.naturalHeight||i.height;
function fit(g,img,x,y,w,h,mode){const r=mode==="cover"?Math.max(w/iw(img),h/ih(img)):Math.min(w/iw(img),h/ih(img)),W=iw(img)*r,H=ih(img)*r;g.drawImage(img,x+(w-W)/2,y+(h-H)/2,W,H);return [x+(w-W)/2,y+(h-H)/2,W,H]}
function shadow(g,cx,y,w){const gr=g.createRadialGradient(cx,y,0,cx,y,w/2);gr.addColorStop(0,"#00000033");gr.addColorStop(1,"#00000000");g.save();g.scale(1,.18);g.fillStyle=gr;g.beginPath();g.arc(cx,y/.18,w/2,0,7);g.fill();g.restore()}
function txt(g,t,x,y,font,color,align){g.font=font;g.fillStyle=color;g.textAlign=align||"left";g.textBaseline="middle";g.fillText(t,x,y);g.textAlign="left"}
function pill(g,t,x,y,bg,fg,size){g.font=`700 ${size}px ${F}`;const w=g.measureText(t).width+size*1.3;rr(g,x,y,w,size*1.8,size*.9);g.fillStyle=bg;g.fill();txt(g,t,x+size*.65,y+size*.92,`700 ${size}px ${F}`,fg);return w}
const light=(hex,a)=>{const n=parseInt(hex.slice(1),16),r=n>>16,g2=n>>8&255,b=n&255,m=v=>Math.round(v+(255-v)*a);return `rgb(${m(r)},${m(g2)},${m(b)})`};

// ---------- 九種版型 ----------
function cover1(g,img){g.fillStyle="#fff";g.fillRect(0,0,S,S);shadow(g,540,960,560);fit(g,img,140,90,800,880,"contain");
  pill(g,"台灣現貨",40,40,col,"#fff",34);
  g.fillStyle=col;g.beginPath();g.moveTo(S-260,0);g.lineTo(S,0);g.lineTo(S,260);g.closePath();g.fill();
  g.save();g.translate(S-95,95);g.rotate(Math.PI/4);txt(g,"免運",0,0,`900 46px ${F}`,"#fff","center");g.restore()}
function cover2(g,img){g.fillStyle=light(col,.88);g.fillRect(0,0,S,S);g.fillStyle=light(col,.75);g.beginPath();g.arc(760,560,380,0,7);g.fill();
  shadow(g,760,990,460);fit(g,img,480,120,560,880,"contain");
  txt(g,"NEW",70,130,`900 40px ${N}`,col);
  g.font=`900 92px ${F}`;g.fillStyle="#1b1b1b";g.textBaseline="top";const lines=wrap(g,P.head,430);lines.slice(0,3).forEach((l,i)=>g.fillText(l,70,180+i*110));
  let y=200+Math.min(3,lines.length)*110+20;P.badges.forEach(b=>{pill(g,"✓ "+b,70,y,col,"#fff",36);y+=88})}
function detail(g,img){g.fillStyle="#f4f4f2";g.fillRect(0,0,S,S);const [x,y,w,h]=fit(g,img,60,80,520,920,"contain");
  const sp=P.spots||["單手按壓開蓋","霧面防滑塗層","加厚防摔底座"],spots=[[.5,.12,sp[0]],[.5,.55,sp[1]],[.5,.88,sp[2]]];
  spots.forEach(([fx,fy,label],i)=>{const sx=x+w*fx,sy=y+h*fy,cx=800,cy=200+i*330,R=130;
    g.strokeStyle=col;g.lineWidth=4;g.setLineDash([10,8]);g.beginPath();g.moveTo(sx,sy);g.lineTo(cx-R,cy);g.stroke();g.setLineDash([]);
    g.fillStyle=col;g.beginPath();g.arc(sx,sy,10,0,7);g.fill();
    g.save();g.beginPath();g.arc(cx,cy,R,0,7);g.clip();g.fillStyle="#fff";g.fillRect(cx-R,cy-R,2*R,2*R);
    const z=2.4,sw=iw(img)/w,sh=ih(img)/h,srcW=2*R/z*sw,srcH=2*R/z*sh,srcX=(sx-x)*sw-srcW/2,srcY=(sy-y)*sh-srcH/2;
    g.drawImage(img,srcX,srcY,srcW,srcH,cx-R,cy-R,2*R,2*R);g.restore();
    g.strokeStyle=col;g.lineWidth=8;g.beginPath();g.arc(cx,cy,R,0,7);g.stroke();
    pill(g,label,cx-R-20,cy+R-20,"#1b1b1b","#fff",28)})}
function sizes(g,img){g.fillStyle="#fff";g.fillRect(0,0,S,S);g.fillStyle=col;g.fillRect(0,0,S,150);
  txt(g,P.sizeTitle||"尺寸規格表",60,78,`900 60px ${F}`,"#fff");txt(g,P.sizeEn||"SIZE GUIDE",S-60,82,`700 30px ${N}`,"#ffffffaa","right");
  fit(g,img,60,200,280,560,"contain");
  const x0=380,y0=210,cw=[160,160,160,160],rh=112;
  P.sizes.forEach((row,r)=>{row.forEach((cell,c)=>{const x=x0+cw.slice(0,c).reduce((a,b)=>a+b,0),y=y0+r*rh;
    g.fillStyle=r===0?light(col,.85):(r%2?"#fafafa":"#fff");g.fillRect(x,y,cw[c],rh);g.strokeStyle="#e4e4e4";g.lineWidth=2;g.strokeRect(x,y,cw[c],rh);
    txt(g,cell,x+cw[c]/2,y+rh/2,`${r===0||c===0?900:500} ${c===0?32:36}px ${F}`,r===0?col:"#222","center")})});
  g.fillStyle="#f6f6f4";rr(g,60,830,S-120,180,16);g.fill();
  const sn=P.sizeNotes||["手工測量，誤差 ±1cm","不同螢幕顯示顏色可能略有差異"];txt(g,"・"+sn[0],100,885,`500 32px ${F}`,"#444");txt(g,"・"+sn[1],100,950,`500 32px ${F}`,"#444")}
function ucNote(g){txt(g,"顏色示意，實際以商品為準",S-60,S-40,`500 26px ${F}`,"#8a8a8a","right")}
function ucOn(){return !!(window.USERCOLORS&&USERCOLORS.length)}
function ucName(u){return u.n||(window.UCNAME?UCNAME(u.hex):"")}
function ucDraw(g,title){const L=USERCOLORS,n=L.length,w=(S-120)/n;txt(g,`共 ${n} 色`,S-60,95,`700 34px ${F}`,col,"right");
  L.forEach((u,i)=>{const x=60+i*w;g.fillStyle=i%2?"#f1f1ef":"#ececea";rr(g,x+8,230,w-16,640,18);g.fill();const im=window.RECOLOR&&RECOLOR(u.hex,u.tone||0);if(im)fit(g,im,x+20,250,w-40,600,"contain");else{g.fillStyle=u.hex;rr(g,x+28,260,w-56,580,14);g.fill();g.strokeStyle="#00000018";g.lineWidth=2;g.stroke()}
    g.fillStyle=u.hex;g.beginPath();g.arc(x+w/2,920,24,0,7);g.fill();g.strokeStyle="#00000030";g.lineWidth=2;g.stroke();txt(g,ucName(u),x+w/2,990,`700 ${n>4?28:34}px ${F}`,"#1b1b1b","center")});ucNote(g)}
function colors(g,img){g.fillStyle="#fafafa";g.fillRect(0,0,S,S);txt(g,P.colorTitle||"顏色一覽",60,90,`900 60px ${F}`,"#1b1b1b");if(ucOn()){ucDraw(g);return}txt(g,`共 ${P.colors.length} ${P.colorUnit||"色"}`,S-60,95,`700 34px ${F}`,col,"right");
  const n=P.colors.length,w=(S-120)/n;
  P.colors.forEach(([name,hue],i)=>{const x=60+i*w;g.fillStyle=i%2?"#f1f1ef":"#ececea";rr(g,x+8,170,w-16,760,18);g.fill();
    g.save();g.filter=hue===1?"brightness(1.9) saturate(0.2)":hue?`sepia(1) saturate(4) hue-rotate(${hue-40}deg) brightness(1.15)`:"none";fit(g,img,x+20,210,w-40,620,"contain");g.restore();
    txt(g,name,x+w/2,880,`700 32px ${F}`,"#222","center")});
  g.fillStyle=col;g.fillRect(60,970,S-120,8)}
function scene(g,img){const wall=g.createLinearGradient(0,0,0,700);wall.addColorStop(0,"#e9e2d6");wall.addColorStop(1,"#d9cfbf");g.fillStyle=wall;g.fillRect(0,0,S,700);
  g.fillStyle="#fff8";g.fillRect(620,80,340,420);g.strokeStyle="#c9bda8";g.lineWidth=10;g.strokeRect(620,80,340,420);g.beginPath();g.moveTo(790,80);g.lineTo(790,500);g.moveTo(620,290);g.lineTo(960,290);g.stroke();
  const desk=g.createLinearGradient(0,700,0,S);desk.addColorStop(0,"#9a7652");desk.addColorStop(1,"#6e5238");g.fillStyle=desk;g.fillRect(0,700,S,380);
  g.fillStyle="#2f5d3a";g.beginPath();g.ellipse(170,560,80,150,-.3,0,7);g.fill();g.fillStyle="#b9b2a6";rr(g,110,640,130,110,16);g.fill();
  g.fillStyle="#f3efe8";rr(g,720,690,260,60,10);g.fill();
  shadow(g,470,840,420);fit(g,img,280,250,380,600,"contain");
  pill(g,"AI 情境圖・示意",40,40,"#1b1b1bcc","#fff",30)}
function model(g,img){const bg=g.createLinearGradient(0,0,S,S);bg.addColorStop(0,light(col,.8));bg.addColorStop(1,light(col,.55));g.fillStyle=bg;g.fillRect(0,0,S,S);
  g.fillStyle="#00000018";g.beginPath();g.arc(430,300,120,0,7);g.fill();rr(g,270,430,320,650,140);g.fill();
  g.save();g.translate(640,560);g.rotate(-.12);fit(g,img,-120,-260,240,520,"contain");g.restore();
  g.fillStyle="#00000018";rr(g,560,600,130,70,35);g.fill();
  g.fillStyle="#fff";rr(g,60,S-210,S-120,150,18);g.fill();
  txt(g,"AI 模特兒試穿／手拿",100,S-160,`900 44px ${F}`,"#1b1b1b");txt(g,"正式版用付費生圖產生真人感模特兒，這裡是示意",100,S-100,`500 28px ${F}`,"#666");
  pill(g,"付費功能",40,40,"#1b1b1bcc","#fff",30)}
function beforeAfter(g,img){g.fillStyle="#fff";g.fillRect(0,0,S,S);
  g.save();g.beginPath();g.rect(0,0,S/2,S);g.clip();g.fillStyle="#d8d6d2";g.fillRect(0,0,S/2,S);g.filter="grayscale(1) brightness(.75) contrast(.8)";fit(g,img,40,150,S/2-80,760,"contain");g.restore();
  g.save();g.beginPath();g.rect(S/2,0,S/2,S);g.clip();g.fillStyle=light(col,.85);g.fillRect(S/2,0,S/2,S);fit(g,img,S/2+40,150,S/2-80,760,"contain");g.restore();
  g.fillStyle="#fff";g.fillRect(S/2-4,0,8,S);g.beginPath();g.arc(S/2,S/2,46,0,7);g.fill();txt(g,"VS",S/2,S/2+2,`900 34px ${N}`,col,"center");
  pill(g,(P.ba||[])[0]||"使用前",40,40,"#1b1b1b","#fff",34);pill(g,(P.ba||[])[1]||"使用後",S/2+40,40,col,"#fff",34);
  txt(g,(P.ba||[])[2]||"一般杯 3 小時就退冰",S/4,S-80,`700 36px ${F}`,"#333","center");txt(g,(P.ba||[])[3]||"保冰一整天",S*3/4,S-80,`900 40px ${F}`,col,"center")}
function event(g,img){const bg=g.createLinearGradient(0,0,0,S);bg.addColorStop(0,"#1b1b1b");bg.addColorStop(1,col);g.fillStyle=bg;g.fillRect(0,0,S,S);
  for(let i=0;i<14;i++){g.fillStyle=i%2?"#ffffff14":"#ffffff08";g.beginPath();g.moveTo(540,540);g.arc(540,540,900,i*Math.PI/7,(i+.5)*Math.PI/7);g.fill()}
  txt(g,"11.11",540,170,`900 190px ${N}`,"#fff","center");txt(g,"年度最狂  限時 3 天",540,300,`900 56px ${F}`,"#ffe6a8","center");
  g.fillStyle="#ffffff";g.beginPath();g.arc(540,640,250,0,7);g.fill();fit(g,img,390,420,300,440,"contain");
  g.fillStyle="#fff";rr(g,150,920,780,130,65);g.fill();
  txt(g,`$${P.orig}`,330,985,`700 44px ${N}`,"#999","center");g.strokeStyle="#999";g.lineWidth=4;g.beginPath();g.moveTo(250,988);g.lineTo(410,982);g.stroke();
  txt(g,`$${P.price}`,640,985,`900 84px ${N}`,col,"center");pill(g,"免運",790,950,col,"#fff",30)}
function wrap(g,t,max){const out=[];let line="";for(const ch of t){if(g.measureText(line+ch).width>max&&line){out.push(line);line=ch}else line+=ch}if(line)out.push(line);return out}


// ====== 服飾模組庫 ======
var CP={name:"涼感棉寬版短T",head:"一穿就不想脫的寬版T",badges:["涼感棉","不透膚","男女可穿"],price:390,orig:590,
  sizes:[["尺寸","S","M","L","XL"],["衣長","66","69","72","75"],["胸寬","54","57","60","63"],["肩寬","50","53","56","59"],["袖長","20","21","22","23"]],
  colors:[["白","#f2f1ed"],["黑","#26272b"],["燕麥","#d6c6ab"],["霧藍","#8ea5bf"],["橄欖","#7b8054"]],
  fit:[["小A","160cm / 48kg","M","寬鬆好看"],["小B","168cm / 55kg","L","剛好不貼身"],["阿傑","178cm / 70kg","XL","微寬落肩"]],
  fabric:[["彈性",3],["厚度",3],["透膚",1],["版型寬鬆",4]]};
var STY={s:{name:"簡約",bg:"#ffffff",panel:"#f3f3f1",ink:"#1b1b1b",mute:"#777",w:900},
  k:{name:"韓系",bg:"#f5eee8",panel:"#ebe1d7",ink:"#4d3a2c",mute:"#9a8573",w:700},
  st:{name:"街頭",bg:"#121212",panel:"#1f1f1f",ink:"#f5f5f5",mute:"#9a9a9a",w:900}};
var sty="s",shirtCache={};
function shirt(color){if(shirtCache[color])return shirtCache[color];var c=document.createElement("canvas");c.width=700;c.height=760;var g=c.getContext("2d");
  var path=()=>{g.beginPath();g.moveTo(250,60);g.quadraticCurveTo(350,130,450,60);g.lineTo(600,120);g.lineTo(690,300);g.lineTo(580,350);g.lineTo(540,280);g.lineTo(545,730);g.quadraticCurveTo(350,750,155,730);g.lineTo(160,280);g.lineTo(120,350);g.lineTo(10,300);g.lineTo(100,120);g.closePath()};
  path();g.fillStyle=color;g.fill();
  g.save();path();g.clip();var sh=g.createLinearGradient(0,0,700,0);sh.addColorStop(0,"#0000002a");sh.addColorStop(.3,"#00000000");sh.addColorStop(.7,"#00000000");sh.addColorStop(1,"#00000033");g.fillStyle=sh;g.fillRect(0,0,700,760);
  g.strokeStyle="#00000022";g.lineWidth=3;[[160,280,545,280]].forEach(()=>{});g.beginPath();g.moveTo(170,700);g.lineTo(530,700);g.moveTo(560,335);g.lineTo(670,290);g.moveTo(140,335);g.lineTo(30,290);g.stroke();
  g.strokeStyle="#ffffff30";g.lineWidth=6;g.beginPath();g.moveTo(260,200);g.quadraticCurveTo(300,450,250,700);g.stroke();g.restore();
  g.strokeStyle="#00000030";g.lineWidth=10;g.beginPath();g.moveTo(255,64);g.quadraticCurveTo(350,140,445,64);g.stroke();
  shirtCache[color]=c;return c}
var shirtImg=()=>prodUp||shirt(CP.colors[0][1]==="#f2f1ed"?"#e9e7e1":CP.colors[0][1]);
function Z(){return STY[sty]}
function bgFill(g){var z=Z();g.fillStyle=z.bg;g.fillRect(0,0,S,S)}
function hdA(g,t,x,y,size,color,align){var z=Z();txt(g,t,x,y,`${z.w} ${size}px ${F}`,color||z.ink,align)}
function bars(g,label,v,x,y,w){var z=Z();txt(g,label,x,y,`700 34px ${F}`,z.ink);for(let i=0;i<5;i++){rr(g,x+210+i*(w-210)/5,y-16,(w-210)/5-10,32,8);g.fillStyle=i<v?col:z.panel;g.fill()}}
function tableAt(g,rows,x,y,w,rh){var z=Z(),cw=w/rows[0].length;rows.forEach((r,ri)=>r.forEach((c,ci)=>{g.fillStyle=ri===0?col:(ri%2?z.panel:z.bg);g.fillRect(x+ci*cw,y+ri*rh,cw,rh);g.strokeStyle=z.mute+"55";g.lineWidth=2;g.strokeRect(x+ci*cw,y+ri*rh,cw,rh);
  txt(g,c,x+ci*cw+cw/2,y+ri*rh+rh/2,`${ri===0||ci===0?800:500} ${ri===0?34:32}px ${F}`,ri===0?"#fff":z.ink,"center")}))}
function stamp(g,t,x,y,size,rot){g.save();g.translate(x,y);g.rotate(rot||-.12);g.strokeStyle=col;g.lineWidth=6;g.font=`900 ${size}px ${F}`;var w=g.measureText(t).width+40;rr(g,-w/2,-size*.8,w,size*1.6,10);g.stroke();txt(g,t,0,0,`900 ${size}px ${F}`,col,"center");g.restore()}
// 30 個服飾版型
function c_white(g,i){g.fillStyle="#fff";g.fillRect(0,0,S,S);shadow(g,540,990,620);fit(g,i,110,100,860,860,"contain");pill(g,"台灣現貨",40,40,col,"#fff",34);pill(g,"S～XL",40,116,"#1b1b1b","#fff",30)}
function c_size(g,i){bgFill(g);hd(g,"尺寸表",60,90,64);txt(g,"單位 cm・平量",S-60,95,`500 28px ${F}`,Z().mute,"right");tableAt(g,CP.sizes,60,170,S-120,120);txt(g,"手工測量誤差 ±2cm，建議對照自己常穿的衣服",60,S-60,`500 30px ${F}`,Z().mute)}
function c_colors(g){bgFill(g);hd(g,"顏色一覽",60,90,64);if(ucOn()){ucDraw(g);return}txt(g,`共 ${CP.colors.length} 色`,S-60,95,`700 32px ${F}`,col,"right");var n=CP.colors.length,w=(S-120)/n;
  CP.colors.forEach(([nm,c],k)=>{fit(g,shirt(c),60+k*w+10,220,w-20,560,"contain");g.fillStyle=c;g.beginPath();g.arc(60+k*w+w/2,850,26,0,7);g.fill();g.strokeStyle=Z().mute;g.lineWidth=2;g.stroke();txt(g,nm,60+k*w+w/2,920,`700 34px ${F}`,Z().ink,"center")})}
function c_promo(g,i){bgFill(g);fit(g,i,240,180,600,680,"contain");g.fillStyle=col;g.fillRect(0,0,S,150);hd(g,"第二件 5 折",S/2,78,80,"#fff","center");
  g.fillStyle=col;rr(g,S/2-260,S-170,520,120,60);g.fill();txt(g,`單件 $${CP.price}`,S/2,S-110,`900 56px ${N}`,"#fff","center")}
function c_measure(g,i){bgFill(g);hd(g,"怎麼量",60,90,64);var [x,y,w,h]=fit(g,shirt("#d9d9d6"),190,170,700,740,"contain");g.strokeStyle=col;g.lineWidth=6;g.setLineDash([16,10]);
  var L=(a,b,c,d,t,tx,ty)=>{g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();pill(g,t,tx,ty,col,"#fff",30)};
  L(x+w*.24,y+h*.3,x+w*.76,y+h*.3,"A 胸寬",x+w*.38,y+h*.33);L(x+w*.5,y+h*.06,x+w*.5,y+h*.96,"B 衣長",x+w*.53,y+h*.6);L(x+w*.33,y+h*.1,x+w*.67,y+h*.1,"C 肩寬",x+w*.4,y+h*.13);g.setLineDash([])}
function c_fit(g,i){bgFill(g);hd(g,"試穿參考",60,90,64);txt(g,"身材相近可以參考",S-60,95,`500 28px ${F}`,Z().mute,"right");
  CP.fit.forEach(([n,hw,sz,fb],k)=>{var y=180+k*270,z=Z();g.fillStyle=z.panel;rr(g,60,y,S-120,240,20);g.fill();fit(g,i,80,y+20,200,200,"contain");
    txt(g,n,320,y+70,`900 44px ${F}`,z.ink);txt(g,hw,320,y+130,`500 34px ${N}`,z.mute);txt(g,fb,320,y+185,`500 32px ${F}`,z.ink);
    g.fillStyle=col;g.beginPath();g.arc(S-170,y+120,80,0,7);g.fill();txt(g,sz,S-170,y+122,`900 70px ${N}`,"#fff","center")});txt(g,"示意資料，正式版填你的真實試穿紀錄",60,S-40,`500 24px ${F}`,Z().mute)}
function c_fabric(g,i){bgFill(g);hd(g,"布料感受",60,90,64);fit(g,i,60,180,380,420,"contain");CP.fabric.forEach(([l,v],k)=>bars(g,l,v,480,250+k*95,S-540));
  g.fillStyle=Z().panel;rr(g,60,660,S-120,320,20);g.fill();hd(g,"材質",100,720,40);txt(g,"棉 95%・彈性纖維 5%",100,790,`500 36px ${F}`,Z().ink);txt(g,"親膚、不悶熱，洗後不易變形",100,850,`500 34px ${F}`,Z().mute)}
function c_detail(g,i){bgFill(g);hd(g,"細節",60,90,64);var spots=[[.5,.1,"領口雙針車"],[.08,.4,"袖口反摺"],[.5,.95,"下擺側開衩"]];
  spots.forEach(([fx,fy,l],k)=>{var x=60+k*330,y=200,w=300;g.save();rr(g,x,y,w,520,18);g.clip();g.fillStyle=Z().panel;g.fillRect(x,y,w,520);var im=i,sx=iw(im)*fx,sy=ih(im)*fy,sw=iw(im)*.35;
    g.drawImage(im,Math.max(0,sx-sw/2),Math.max(0,sy-sw*.85),sw,sw*1.7,x,y,w,520);g.restore();txt(g,l,x+w/2,780,`700 34px ${F}`,Z().ink,"center")});
  g.fillStyle=col;g.fillRect(60,860,S-120,6);txt(g,"做工看得到，穿久不走樣",S/2,930,`${Z().w} 44px ${F}`,Z().ink,"center")}
function c_frontback(g,i){bgFill(g);fit(g,i,40,160,480,700,"contain");g.save();g.translate(S,0);g.scale(-1,1);fit(g,i,40,160,480,700,"contain");g.restore();
  hd(g,"正面",280,110,46,null,"center");hd(g,"背面",S-280,110,46,null,"center");g.fillStyle=Z().mute+"55";g.fillRect(S/2-1,160,2,700);txt(g,"背面無印花・前短後長",S/2,960,`500 34px ${F}`,Z().mute,"center")}
function c_outfit(g,i){bgFill(g);hd(g,"三種穿法",60,90,64);var looks=[["配寬褲","#3d4a5c","pants"],["配長裙","#b59c7a","skirt"],["配外套","#5a5f45","coat"]];
  looks.forEach(([t,c,k],n)=>{var x=60+n*330,z=Z();g.fillStyle=z.panel;rr(g,x,170,300,720,20);g.fill();fit(g,i,x+40,200,220,240,"contain");g.fillStyle=c;
    if(k==="pants"){rr(g,x+85,450,60,360,12);g.fill();rr(g,x+155,450,60,360,12);g.fill()}else if(k==="skirt"){g.beginPath();g.moveTo(x+100,450);g.lineTo(x+200,450);g.lineTo(x+250,820);g.lineTo(x+50,820);g.closePath();g.fill()}else{rr(g,x+30,190,240,420,30);g.globalAlpha=.85;g.fill();g.globalAlpha=1;fit(g,i,x+90,230,120,140,"contain");rr(g,x+95,620,110,230,10);g.fillStyle="#2b2b2b";g.fill()}
    txt(g,t,x+150,940,`700 38px ${F}`,z.ink,"center")})}
function c_wash(g){bgFill(g);hd(g,"洗滌方式",60,90,64);var it=[["30°","冷水手洗或洗衣袋"],["✕","不可漂白"],["〰","低溫熨燙"],["☁","平放陰乾"]];
  it.forEach(([ic,t],k)=>{var y=190+k*190,z=Z();g.strokeStyle=col;g.lineWidth=6;rr(g,60,y,140,140,20);g.stroke();txt(g,ic,130,y+72,`900 56px ${N}`,col,"center");txt(g,t,240,y+72,`700 44px ${F}`,z.ink)});
  txt(g,"深淺色分開洗，第一次可能輕微退色",60,S-60,`500 30px ${F}`,Z().mute)}
function c_new(g,i){bgFill(g);txt(g,"NEW",60,150,`900 200px ${N}`,col);txt(g,"ARRIVAL",70,270,`700 70px ${N}`,Z().ink);fit(g,i,420,260,620,700,"contain");hd(g,"秋冬新品上市",60,S-90,56)}
function c_stock(g,i){g.fillStyle="#fff";g.fillRect(0,0,S,S);fit(g,i,140,140,800,800,"contain");stamp(g,"24H 出貨",S-230,190,64,.15);pill(g,"台灣現貨",40,40,"#1b1b1b","#fff",36)}
function c_grid(g,i){bgFill(g);var pts=["涼感棉","不透膚","寬版落肩","男女可穿","5 色","S～XL","可機洗","不起毛球"];let k=0;
  for(let r=0;r<3;r++)for(let c=0;c<3;c++){var x=30+c*345,y=30+r*345,z=Z();rr(g,x,y,330,330,18);if(r===1&&c===1){g.fillStyle="#fff";g.fill();fit(g,i,x+20,y+20,290,290,"contain")}else{g.fillStyle=(r+c)%2?col:z.panel;g.fill();txt(g,pts[k++],x+165,y+165,`${z.w} 46px ${F}`,(r+c)%2?"#fff":z.ink,"center")}}}
function c_mag(g,i){bgFill(g);fit(g,i,200,160,840,880,"contain");txt(g,"VICTOR",60,130,`900 150px ${N}`,col);g.save();g.translate(80,900);g.rotate(-Math.PI/2);txt(g,"2026 AUTUMN COLLECTION",0,0,`700 36px ${N}`,Z().ink);g.restore();hd(g,CP.head,S-60,S-70,48,null,"right")}
function c_sizeguide(g){bgFill(g);hd(g,"尺碼推薦",60,90,64);var hs=["150","155","160","165","170","175","180"],ws=["45","50","55","60","65","70"],rec=(h,w)=>["S","S","M","M","L","L","XL"][Math.min(6,Math.floor((h+w)/2))];
  var x0=220,y0=200,cw=(S-x0-60)/ws.length,rh=100;txt(g,"身高\\體重",x0-20,y0-40,`500 26px ${F}`,Z().mute,"right");
  ws.forEach((w,c)=>txt(g,w+"kg",x0+c*cw+cw/2,y0-30,`700 28px ${N}`,Z().ink,"center"));
  hs.forEach((h,r)=>{txt(g,h,x0-20,y0+r*rh+rh/2,`700 30px ${N}`,Z().ink,"right");ws.forEach((w,c)=>{var v=rec(r,c),idx="SMLX".indexOf(v[0]);g.fillStyle=light(col,.85-idx*.18);g.fillRect(x0+c*cw+3,y0+r*rh+3,cw-6,rh-6);txt(g,v,x0+c*cw+cw/2,y0+r*rh+rh/2,`900 34px ${N}`,idx>2?"#fff":"#1b1b1b","center")})});
  txt(g,"示意，正式版依你的版型調整",60,S-40,`500 24px ${F}`,Z().mute)}
function c_compare(g,i){bgFill(g);hd(g,"新版 vs 舊版",60,90,60);var z=Z();g.fillStyle=z.panel;rr(g,60,170,460,800,20);g.fill();g.fillStyle=light(col,.85);rr(g,560,170,460,800,20);g.fill();
  fit(g,shirt("#9a9a9a"),110,210,360,380,"contain");fit(g,i,610,210,360,380,"contain");
  [["布料","一般棉","涼感棉"],["領口","容易鬆","雙針車"],["長度","偏短","加長 3cm"]].forEach(([a,b,c],k)=>{var y=670+k*95;txt(g,a+"："+b,290,y,`500 34px ${F}`,z.mute,"center");txt(g,a+"："+c,790,y,`800 36px ${F}`,col,"center")})}
function c_return(g){bgFill(g);hd(g,"退換貨說明",60,90,64);[["7 天鑑賞期","收到後 7 天內可申請"],["尺寸不合可換","來回運費一人一趟"],["保持吊牌完整","未下水、未穿著"]].forEach(([a,b],k)=>{var y=200+k*250,z=Z();g.fillStyle=z.panel;rr(g,60,y,S-120,210,20);g.fill();
  g.fillStyle=col;g.beginPath();g.arc(160,y+105,55,0,7);g.fill();txt(g,String(k+1),160,y+107,`900 54px ${N}`,"#fff","center");txt(g,a,260,y+80,`${z.w} 46px ${F}`,z.ink);txt(g,b,260,y+145,`500 32px ${F}`,z.mute)})}
// 10/25 Vic：多件組合價用客人的商品和客人選的顏色，不用示範 T 恤
function bundleImg(j){if(ucOn()){const u=USERCOLORS[j%USERCOLORS.length],im=window.RECOLOR&&RECOLOR(u.hex,u.tone||0);return im||(typeof prodUp!=="undefined"&&prodUp)||shirt(u.hex)}return (typeof prodUp!=="undefined"&&prodUp)||shirt(CP.colors[(j+1)%CP.colors.length][1])}
function c_bundle(g){bgFill(g);hd(g,"多件更划算",60,90,64);[[1,CP.price],[2,690],[3,990]].forEach(([n,p],k)=>{var x=60+k*330,z=Z(),best=k===2;g.fillStyle=best?col:z.panel;rr(g,x,190,300,720,22);g.fill();
  for(let j=0;j<n;j++)fit(g,bundleImg(j),x+30+j*30,240+j*40,220,260,"contain");
  txt(g,`${n} 件`,x+150,640,`900 56px ${F}`,best?"#fff":z.ink,"center");txt(g,`$${p}`,x+150,740,`900 70px ${N}`,best?"#fff":col,"center");if(best)txt(g,"最划算",x+150,840,`700 36px ${F}`,"#fff","center")})}
function c_season(g,i){var gr=g.createLinearGradient(0,0,S,S);gr.addColorStop(0,light(col,.75));gr.addColorStop(1,col);g.fillStyle=gr;g.fillRect(0,0,S,S);
  for(let k=0;k<26;k++){g.fillStyle="#ffffff40";g.beginPath();g.ellipse((k*397)%S,(k*263)%S,14,24,k,0,7);g.fill()}fit(g,i,330,250,420,520,"contain");hd(g,"秋冬上新",S/2,140,96,"#fff","center");txt(g,"早鳥 9 折",S/2,880,`900 64px ${F}`,"#fff","center")}
function c_label(g){bgFill(g);hd(g,"成分與產地",60,90,64);var z=Z();g.fillStyle="#fbfaf6";rr(g,280,170,520,800,16);g.fill();g.strokeStyle=z.mute;g.lineWidth=2;g.stroke();g.fillStyle=z.bg;g.beginPath();g.arc(540,220,22,0,7);g.fill();
  [["品名",CP.name],["成分","棉 95%"," 彈性纖維 5%"],["尺寸","M"],["產地","台灣"]].forEach((r,k)=>{txt(g,r[0],330,330+k*150,`500 30px ${F}`,"#888");txt(g,r.slice(1).join("、"),330,380+k*150,`700 34px ${F}`,"#222")})}
function c_story(g,i){bgFill(g);fit(g,i,60,120,440,520,"contain");hd(g,"為什麼做這件T",560,170,50);var z=Z();g.font=`500 34px ${F}`;g.fillStyle=z.ink;g.textBaseline="top";
  wrap(g,"夏天穿T恤最怕悶、怕透、洗幾次就變形。我們試了 12 種布，最後選這款涼感棉，自己先穿了一整個夏天才敢賣。",420).forEach((l,k)=>g.fillText(l,560,240+k*54));
  g.fillStyle=col;g.fillRect(60,720,S-120,4);txt(g,"— 店主 Vicky（示意）",S-60,790,`500 32px ${F}`,z.mute,"right")}
function c_kor(g,i){g.fillStyle="#f6efe9";g.fillRect(0,0,S,S);g.fillStyle="#e9ddd0";rr(g,560,80,440,600,220);g.fill();fit(g,i,500,120,560,600,"contain");
  txt(g,"daily",80,200,`500 120px Georgia,serif`,"#7a6250");txt(g,"basic tee",90,320,`italic 500 70px Georgia,serif`,"#7a6250");txt(g,"每天都想穿的那件",80,820,`700 56px ${F}`,"#4d3a2c");pill(g,"韓系寬版",80,880,col,"#fff",32)}
function c_street(g,i){g.fillStyle="#111";g.fillRect(0,0,S,S);g.save();g.rotate(-.08);g.fillStyle=col;g.fillRect(-50,640,S+100,180);g.restore();
  txt(g,"NO RULES",S/2,140,`900 150px ${N}`,"#fff","center");fit(g,i,250,200,580,620,"contain");txt(g,"OVERSIZE TEE",S/2,750,`900 80px ${N}`,"#111","center");txt(g,"街頭寬版 ・ 男女都能穿",S/2,960,`700 40px ${F}`,"#fff","center")}
function c_lux(g,i){g.fillStyle="#0e0d0b";g.fillRect(0,0,S,S);g.strokeStyle="#c8a35a";g.lineWidth=3;g.strokeRect(40,40,S-80,S-80);g.strokeRect(56,56,S-112,S-112);
  fit(g,i,240,190,600,620,"contain");txt(g,"PREMIUM COTTON",S/2,140,`500 44px Georgia,serif`,"#c8a35a","center");txt(g,"質感涼感棉",S/2,900,`700 56px ${F}`,"#efe6d2","center")}
function c_flatlay(g,i){g.fillStyle="#e8e2d8";g.fillRect(0,0,S,S);g.save();g.translate(330,330);g.rotate(-.1);fit(g,i,-280,-280,560,560,"contain");g.restore();
  g.fillStyle="#3d4a5c";rr(g,560,420,170,480,20);g.fill();rr(g,750,420,170,480,20);g.fill();g.fillStyle="#f5f5f5";rr(g,180,760,150,90,40);g.fill();rr(g,350,780,150,90,40);g.fill();
  g.fillStyle="#2b2b2b";g.beginPath();g.arc(870,190,90,0,7);g.fill();pill(g,"一件 T 搭出整套",60,60,col,"#fff",34)}
function c_closeup(g,i){g.save();g.beginPath();g.rect(0,0,S,S);g.clip();g.drawImage(i,iw(i)*.3,ih(i)*.35,iw(i)*.3,ih(i)*.3,0,0,S,S);g.restore();
  g.fillStyle="#0007";g.fillRect(0,S-220,S,220);txt(g,"摸得到的細緻布紋",60,S-140,`900 60px ${F}`,"#fff");txt(g,"涼感棉・320 針密織",60,S-70,`500 36px ${F}`,"#ddd")}
function c_count(g,i){g.fillStyle="#141414";g.fillRect(0,0,S,S);txt(g,"限時搶購",S/2,120,`900 90px ${F}`,"#fff","center");
  ["02","14","36"].forEach((n,k)=>{g.fillStyle=col;rr(g,190+k*250,200,200,200,20);g.fill();txt(g,n,290+k*250,302,`900 110px ${N}`,"#fff","center");txt(g,["天","時","分"][k],290+k*250,440,`500 34px ${F}`,"#aaa","center")});
  fit(g,i,330,480,420,420,"contain");txt(g,`$${CP.price}`,S/2,980,`900 80px ${N}`,col,"center")}
function c_ai_model(g,i){model(g,i)}
function c_ai_scene(g,i){scene(g,i)}
var CLOTH=[
 ["服飾白底主圖",1,c_white],["服飾尺寸表",1,c_size],["顏色一覽（自動換色）",1,c_colors],["第二件折扣封面",1,c_promo],
 ["尺寸量法圖",2,c_measure],["試穿身高體重",2,c_fit],["布料感受指標",2,c_fabric],["細節三格",2,c_detail],["正反面對照",2,c_frontback],["三種穿搭建議",2,c_outfit],
 ["洗滌方式",2,c_wash],["新品上市",2,c_new],["現貨 24H 出貨",2,c_stock],["九宮格賣點",2,c_grid],["雜誌風封面",2,c_mag],["尺碼推薦表",2,c_sizeguide],
 ["新舊款對比",2,c_compare],["退換貨說明",2,c_return],["多件組合價",2,c_bundle],["換季上新",2,c_season],["成分吊牌",2,c_label],["品牌故事",2,c_story],["平拍穿搭",2,c_flatlay],
 ["韓系封面",3,c_kor],["街頭風封面",3,c_street],["質感黑金封面",3,c_lux],["布紋大特寫",3,c_closeup],["倒數限時搶購",3,c_count],["AI 模特兒穿搭（付費生圖）",3,c_ai_model],["AI 街拍情境（付費生圖）",3,c_ai_scene]];
var GEN_TIER=[1,1,1,1,1,3,3,2,1];

// ---------- 各行業示範資料（沒上傳商品照時用） ----------
var IND={
 gen:{n:"一般商品",name:"不鏽鋼真空保溫瓶 500ml",title:"不鏽鋼真空保溫瓶 500ml 24H保冰 316不鏽鋼 單手開蓋",head:"冰塊放一天都還在",badges:["24H 保冰","316 不鏽鋼","單手開蓋"],price:590,orig:890,
  sizes:[["容量","350ml","500ml","750ml"],["高度","19cm","23cm","27cm"],["口徑","6.5cm","6.5cm","7cm"],["重量","280g","330g","410g"]],colors:[["霧黑",0],["奶白",1],["湖水綠",160],["蜜桃粉",330],["海軍藍",210]],
  spots:["單手按壓開蓋","霧面防滑塗層","加厚防摔底座"],sizeTitle:"尺寸規格表",sizeEn:"SIZE GUIDE",sizeNotes:["手工測量，誤差 ±1cm","不同螢幕顯示顏色可能略有差異"],colorTitle:"顏色一覽",colorUnit:"色",ba:["使用前","使用後","一般杯 3 小時就退冰","保冰一整天"],
  lab:{sizes:"尺寸規格表",colors:"顏色一覽",ba:"使用前後對比"}},
 beauty:{n:"美妝",name:"玻尿酸保濕精華 30ml",title:"玻尿酸保濕精華液 30ml 三重玻尿酸 敏感肌可用 台灣製",head:"乾到脫皮的臉，一晚喝飽水",badges:["三重玻尿酸","無香精酒精","敏感肌可用"],price:680,orig:980,
  sizes:[["項目","30ml","50ml","補充瓶"],["用量","約1個月","約2個月","約4個月"],["膚質","全膚質","全膚質","全膚質"],["保存","開封12個月","開封12個月","開封12個月"]],colors:[["清爽型",0],["滋潤型",30],["夜間修護",280],["舒緩型",150]],
  spots:["精準滴管好控量","深色遮光瓶身","按壓密封瓶口"],sizeTitle:"容量與使用",sizeEn:"DETAILS",sizeNotes:["使用前請先在耳後小範圍測試","避免陽光直射，置於陰涼處"],colorTitle:"系列一覽",colorUnit:"款",ba:["使用前","使用 7 天","上妝卡粉、脫皮","水潤透亮"],
  lab:{sizes:"容量使用表",colors:"系列一覽",ba:"使用前後對比"}},
 tech:{n:"3C",name:"降噪藍牙耳機 Pro",title:"降噪藍牙耳機 Pro 主動降噪 續航30小時 IPX5防水 Type-C快充",head:"捷運上也只聽得到音樂",badges:["主動降噪","續航 30 小時","IPX5 防水"],price:1290,orig:1990,
  sizes:[["規格","單耳","充電盒","總計"],["續航","8 小時","22 小時","30 小時"],["充電","Type-C","10 分鐘","聽 2 小時"],["重量","4.8g","42g","51.6g"]],colors:[["石墨黑",0],["珍珠白",1],["薄荷綠",160],["夜空藍",210]],
  spots:["觸控切歌接聽","主動降噪麥克風","Type-C 快充孔"],sizeTitle:"規格一覽",sizeEn:"SPECS",sizeNotes:["保固 1 年，台灣在地維修","續航依音量與使用情境略有不同"],colorTitle:"顏色一覽",colorUnit:"色",ba:["舊款","新款","吵雜聽不清楚","降噪後只剩音樂"],
  lab:{sizes:"規格表",colors:"顏色一覽",ba:"新舊款對比"}},
 food:{n:"食品",name:"手工堅果燕麥脆片 300g",title:"手工堅果燕麥脆片 300g 無添加精緻糖 高纖 早餐 下午茶",head:"早餐沒時間，也能吃得好",badges:["無添加精緻糖","高纖好飽足","台灣手工烘焙"],price:320,orig:420,
  sizes:[["營養標示","每份40g","每100g","—"],["熱量","182 大卡","455 大卡","—"],["蛋白質","5.2g","13g","—"],["膳食纖維","3.6g","9g","—"]],colors:[["原味",0],["可可",20],["抹茶",90],["莓果",330]],
  spots:["整顆堅果看得到","低溫慢烤酥脆","夾鏈袋好保存"],sizeTitle:"營養標示",sizeEn:"NUTRITION",sizeNotes:["開封後請夾緊，建議 2 週內吃完","本產品含堅果，過敏者請留意"],colorTitle:"口味一覽",colorUnit:"種口味",ba:["一般穀片","我們的","甜膩、吃完很快餓","不甜、飽到中午"],
  lab:{sizes:"營養標示表",colors:"口味一覽",ba:"跟一般的比"}}
};
function useInd(k){const d=IND[k]||IND.gen;["name","head","badges","price","orig","sizes","colors","spots","sizeTitle","sizeEn","sizeNotes","colorTitle","colorUnit","ba"].forEach(f=>{P[f]=JSON.parse(JSON.stringify(d[f]))})}
function sampleFor(k){if(k==="gen"||!IND[k])return sampleProduct();const c=document.createElement("canvas");c.width=600;c.height=1000;const g=c.getContext("2d");
 if(k==="beauty"){const gl=g.createLinearGradient(170,0,430,0);gl.addColorStop(0,"#6b3f2a");gl.addColorStop(.4,"#b07a55");gl.addColorStop(.55,"#c99a74");gl.addColorStop(1,"#5a3322");rr(g,170,420,260,520,50);g.fillStyle=gl;g.fill();
  g.fillStyle="#ffffff2a";rr(g,200,460,22,440,11);g.fill();g.fillStyle="#f5efe6";rr(g,210,580,180,220,10);g.fill();g.fillStyle="#6b3f2a";g.font="700 30px sans-serif";g.textAlign="center";g.fillText("HYALURONIC",300,650);g.font="500 22px sans-serif";g.fillText("SERUM 30ml",300,700);
  const cap=g.createLinearGradient(220,0,380,0);cap.addColorStop(0,"#c9a36a");cap.addColorStop(.5,"#f1dcae");cap.addColorStop(1,"#a8834c");rr(g,220,330,160,100,14);g.fillStyle=cap;g.fill();
  g.fillStyle="#1f1f1f";rr(g,245,120,110,220,55);g.fill();g.fillStyle="#3a3a3a";rr(g,262,140,24,170,12);g.fill()}
 else if(k==="tech"){const cs=g.createLinearGradient(100,0,500,0);cs.addColorStop(0,"#1a1b1f");cs.addColorStop(.5,"#3b3e46");cs.addColorStop(1,"#121316");rr(g,100,520,400,300,120);g.fillStyle=cs;g.fill();
  g.strokeStyle="#55585f";g.lineWidth=4;g.beginPath();g.moveTo(110,640);g.lineTo(490,640);g.stroke();g.fillStyle="#7CF29C";g.beginPath();g.arc(300,720,9,0,7);g.fill();
  [[200,300,-.25],[400,300,.25]].forEach(([x,y,r])=>{g.save();g.translate(x,y);g.rotate(r);const b=g.createLinearGradient(-60,0,60,0);b.addColorStop(0,"#202227");b.addColorStop(.5,"#4a4d55");b.addColorStop(1,"#17181b");g.fillStyle=b;g.beginPath();g.ellipse(0,0,70,85,0,0,7);g.fill();rr(g,-22,40,44,170,22);g.fill();g.fillStyle="#ffffff22";g.beginPath();g.ellipse(-20,-25,18,26,0,0,7);g.fill();g.restore()})}
 else {const jar=g.createLinearGradient(130,0,470,0);jar.addColorStop(0,"#d9c9a8");jar.addColorStop(.5,"#f4ead6");jar.addColorStop(1,"#c9b691");rr(g,130,300,340,640,40);g.fillStyle=jar;g.fill();
  for(let i=0;i<70;i++){const x=160+((i*73)%280),y=360+((i*131)%540);g.fillStyle=["#b9853f","#8a5a2b","#d9a85b","#6e4423"][i%4];g.beginPath();g.ellipse(x,y,14,9,i,0,7);g.fill()}
  g.fillStyle="#fffaf0";rr(g,170,520,260,220,16);g.fill();g.fillStyle="#7a4a20";g.font="800 34px sans-serif";g.textAlign="center";g.fillText("GRANOLA",300,600);g.font="500 24px sans-serif";g.fillText("堅果燕麥脆片",300,650);g.fillText("300g",300,695);
  const lid=g.createLinearGradient(140,0,460,0);lid.addColorStop(0,"#5a3a1c");lid.addColorStop(.5,"#8a5e33");lid.addColorStop(1,"#4a2f16");rr(g,140,230,320,90,18);g.fillStyle=lid;g.fill()}
 return c}

// ---------- 各行業專屬版型（資料驅動，用客人上傳的商品照，不用付費生圖） ----------
function hd(g,t,en,bg){if(typeof en==="number")return hdA(g,t,en,bg,arguments[4],arguments[5],arguments[6]);g.fillStyle=bg||"#fff";g.fillRect(0,0,S,S);txt(g,t,60,96,`900 64px ${F}`,"#1b1b1b");if(en)txt(g,en,62,158,`700 26px ${N}`,col);g.fillStyle=col;g.fillRect(60,190,90,8)}
function para(g,t,x,y,max,font,color,lh){g.font=font;const ls=wrap(g,t,max);ls.forEach((l,i)=>txt(g,l,x,y+i*lh,font,color));return ls.length}
function chk(g,x,y,r,ok){g.fillStyle=ok?col:"#c9c9c9";g.beginPath();g.arc(x,y,r,0,7);g.fill();g.strokeStyle="#fff";g.lineWidth=r*.22;g.lineCap="round";g.beginPath();if(ok){g.moveTo(x-r*.42,y);g.lineTo(x-r*.1,y+r*.32);g.lineTo(x+r*.45,y-r*.32)}else{g.moveTo(x-r*.35,y-r*.35);g.lineTo(x+r*.35,y+r*.35);g.moveTo(x+r*.35,y-r*.35);g.lineTo(x-r*.35,y+r*.35)}g.stroke();g.lineCap="butt"}
// 1 功能／成分格子
function tGrid(g,img,d){hd(g,d.t,d.en,"#fbfaf7");fit(g,img,S-300,40,240,300,"contain");
  const it=d.items,cols=2,cw=(S-150)/cols,rows=Math.ceil(Math.min(6,it.length)/cols),ch=Math.min(300,(S-400-(rows-1)*24)/rows);it.slice(0,6).forEach(([ic,lab,ds],i)=>{const x=60+(i%cols)*(cw+30),y=360+Math.floor(i/cols)*(ch+24);
    g.fillStyle="#fff";rr(g,x,y,cw,ch,18);g.fill();g.strokeStyle="#ece7dd";g.lineWidth=2;g.stroke();
    g.fillStyle=light(col,.82);g.beginPath();g.arc(x+70,y+ch/2,46,0,7);g.fill();txt(g,ic,x+70,y+ch/2+2,`900 40px ${F}`,col,"center");
    txt(g,lab,x+140,y+ch/2-28,`900 38px ${F}`,"#1b1b1b");para(g,ds,x+140,y+ch/2+28,cw-170,`500 26px ${F}`,"#666",36)})}
// 2 步驟
function tSteps(g,img,d){hd(g,d.t,d.en);g.fillStyle=light(col,.9);g.fillRect(0,230,400,S-230);fit(g,img,40,280,320,700,"contain");
  const st=d.steps,gap=(S-300)/st.length;g.strokeStyle=light(col,.6);g.lineWidth=4;g.beginPath();g.moveTo(490,300);g.lineTo(490,300+gap*(st.length-1));g.stroke();
  st.forEach(([lab,ds],i)=>{const y=300+i*gap;g.fillStyle=col;g.beginPath();g.arc(490,y,40,0,7);g.fill();txt(g,String(i+1),490,y+2,`900 40px ${N}`,"#fff","center");
    txt(g,lab,560,y-14,`900 40px ${F}`,"#1b1b1b");para(g,ds,560,y+36,S-620,`500 27px ${F}`,"#666",36)})}
// 3 包裝內容物
function tBox(g,img,d){hd(g,d.t,d.en,"#f7f6f3");g.fillStyle="#fff";rr(g,60,240,S-120,500,24);g.fill();shadow(g,S/2,700,420);fit(g,img,S/2-210,270,420,440,"contain");
  const it=d.items,w=(S-120-(it.length-1)*16)/it.length;it.forEach((t,i)=>{const x=60+i*(w+16);g.fillStyle="#fff";rr(g,x,780,w,220,18);g.fill();chk(g,x+w/2,840,30,true);para(g,t,x+20,910,w-40,`700 28px ${F}`,"#333",36)})}
// 4 尺寸對照（跟信用卡比）
function tScale(g,img,d){hd(g,d.t,d.en);const [x,y,w,h]=fit(g,img,140,260,420,700,"contain");
  g.strokeStyle="#1b1b1b";g.lineWidth=3;g.beginPath();g.moveTo(x-40,y);g.lineTo(x-40,y+h);g.moveTo(x-55,y);g.lineTo(x-25,y);g.moveTo(x-55,y+h);g.lineTo(x-25,y+h);g.stroke();
  g.save();g.translate(x-75,y+h/2);g.rotate(-Math.PI/2);txt(g,d.h,0,0,`900 34px ${N}`,"#1b1b1b","center");g.restore();
  g.beginPath();g.moveTo(x,y+h+40);g.lineTo(x+w,y+h+40);g.stroke();txt(g,d.w,x+w/2,y+h+80,`900 34px ${N}`,"#1b1b1b","center");
  const cx=640,cy=640,cw=300,chh=190;g.fillStyle=light(col,.8);rr(g,cx,cy,cw,chh,16);g.fill();g.fillStyle=light(col,.6);rr(g,cx+30,cy+50,60,44,8);g.fill();txt(g,"8.5 × 5.4 cm",cx+cw/2,cy+chh+44,`700 28px ${N}`,"#666","center");txt(g,"一張信用卡",cx+cw/2,cy-36,`700 30px ${F}`,"#666","center");
  g.fillStyle="#f6f4ef";rr(g,620,300,400,240,18);g.fill();para(g,d.note,650,350,340,`700 32px ${F}`,"#1b1b1b",46)}
// 5 比較表
function tCompare(g,img,d){hd(g,d.t,d.en);fit(g,img,S-260,30,200,260,"contain");
  const x0=60,y0=260,cw=[380,280,280],rh=(S-320)/(d.rows.length+1);
  [["",d.cols[0],d.cols[1]]].concat(d.rows).forEach((r,i)=>{let x=x0;r.forEach((c,j)=>{const y=y0+i*rh;g.fillStyle=j===1?(i?light(col,.9):col):(i%2?"#fafafa":"#fff");g.fillRect(x,y,cw[j],rh);g.strokeStyle="#ececec";g.lineWidth=2;g.strokeRect(x,y,cw[j],rh);
    if(i===0)txt(g,c,x+cw[j]/2,y+rh/2,`900 34px ${F}`,j===1?"#fff":"#888","center");else if(j===0)txt(g,c,x+30,y+rh/2,`700 32px ${F}`,"#333");
    else if(c==="✓"||c==="✕")chk(g,x+cw[j]/2,y+rh/2,26,c==="✓");else txt(g,c,x+cw[j]/2,y+rh/2,`${j===1?900:500} 30px ${F}`,j===1?col:"#888","center");x+=cw[j]})})}
// 6 常見問題
function tFaq(g,img,d){hd(g,d.t,d.en,"#fbfaf7");fit(g,img,S-250,30,190,250,"contain");let y=260;
  d.qa.slice(0,4).forEach(([q,a])=>{g.fillStyle="#fff";rr(g,60,y,S-120,170,18);g.fill();g.fillStyle=col;g.beginPath();g.arc(115,y+52,30,0,7);g.fill();txt(g,"Q",115,y+54,`900 32px ${N}`,"#fff","center");
    txt(g,q,165,y+52,`900 32px ${F}`,"#1b1b1b");para(g,a,165,y+108,S-260,`500 27px ${F}`,"#666",36);y+=190})}
// 7 好評框（示意，客人換成自己的真實評價）
function tReview(g,img,d){hd(g,d.t,d.en,light(col,.9));fit(g,img,S-260,30,200,260,"contain");
  d.rv.slice(0,3).forEach(([n,t],i)=>{const y=280+i*240;g.fillStyle="#fff";rr(g,60,y,S-120,210,20);g.fill();g.fillStyle=light(col,.75);g.beginPath();g.arc(130,y+70,40,0,7);g.fill();txt(g,n.slice(0,1),130,y+72,`900 34px ${F}`,col,"center");
    txt(g,n,190,y+52,`700 30px ${F}`,"#333");txt(g,"★★★★★",190,y+94,`900 28px ${F}`,"#f2b01e");para(g,t,100,y+150,S-220,`500 29px ${F}`,"#444",38)});
  pill(g,"示意：換成你的真實評價截圖",60,S-62,"#1b1b1bcc","#fff",24)}
// 8 組合價
function tBundle(g,img,d){hd(g,d.t,d.en,"#f7f6f3");const tiers=[["1 件",P.price,""],["2 件",Math.round(P.price*1.8),"最多人選"],["3 件",Math.round(P.price*2.5),"最划算"]];
  tiers.forEach(([lab,pr,tag],i)=>{const w=300,x=60+i*(w+30),y=280,hi=i===1;g.fillStyle=hi?col:"#fff";rr(g,x,y,w,700,22);g.fill();
    if(tag)pill(g,tag,x+20,y+20,hi?"#1b1b1b":col,"#fff",26);for(let k=0;k<=i;k++)fit(g,img,x+40+k*30,y+90+k*10,w-80-i*30,330,"contain");
    txt(g,lab,x+w/2,y+480,`900 48px ${F}`,hi?"#fff":"#1b1b1b","center");txt(g,`$${pr}`,x+w/2,y+570,`900 66px ${N}`,hi?"#fff":col,"center");
    txt(g,i?`平均一件 $${Math.round(pr/(i+1))}`:"原價",x+w/2,y+640,`500 28px ${F}`,hi?"#ffffffcc":"#888","center")})}
// 9 清單（保存、保固、到貨、膚質）
function tNotice(g,img,d){hd(g,d.t,d.en);fit(g,img,S-300,240,240,520,"contain");
  const nr=Math.min(5,d.rows.length),gp=Math.min(190,(S-330)/nr);d.rows.slice(0,5).forEach(([ic,lab,ds],i)=>{const y=270+i*gp;g.fillStyle=light(col,.85);rr(g,60,y,100,100,20);g.fill();txt(g,ic,110,y+52,`900 44px ${F}`,col,"center");
    txt(g,lab,190,y+30,`900 36px ${F}`,"#1b1b1b");para(g,ds,190,y+80,S-560,`500 27px ${F}`,"#666",34)})}
// 10 故事
function tStory(g,img,d){g.fillStyle=light(col,.88);g.fillRect(0,0,S,S);g.fillStyle=light(col,.78);g.beginPath();g.arc(S-160,S-200,380,0,7);g.fill();fit(g,img,S-480,S-760,400,700,"contain");
  txt(g,d.en,60,110,`700 28px ${N}`,col);txt(g,"“",50,230,`900 160px Georgia,serif`,col);const tl=para(g,d.t,60,300,560,`900 56px ${F}`,"#1b1b1b",72);
  para(g,d.para,60,300+tl*72+60,520,`500 30px ${F}`,"#444",46);txt(g,d.sign,60,S-80,`700 30px ${F}`,"#666")}
// 11 質地特寫（美妝）
function tTexture(g,img,d){hd(g,d.t,d.en,"#fbf8f4");fit(g,img,60,260,360,680,"contain");
  const cx=720,cy=560;g.fillStyle="#fff";g.beginPath();g.arc(cx,cy,280,0,7);g.fill();
  const sw=g.createLinearGradient(cx-200,0,cx+200,0);sw.addColorStop(0,light(col,.75));sw.addColorStop(.5,light(col,.92));sw.addColorStop(1,light(col,.7));g.fillStyle=sw;g.beginPath();g.moveTo(cx-210,cy+30);g.bezierCurveTo(cx-120,cy-150,cx+60,cy-40,cx+210,cy-90);g.bezierCurveTo(cx+160,cy+60,cx-40,cy+40,cx-210,cy+30);g.fill();
  g.fillStyle="#ffffffaa";g.beginPath();g.ellipse(cx-40,cy-40,60,14,-.3,0,7);g.fill();
  d.tags.forEach((t,i)=>pill(g,t,520+(i%2)*230,880+Math.floor(i/2)*80,i%2?"#1b1b1b":col,"#fff",30))}
// 12 檢驗／認證（示意）
function tCert(g,img,d){hd(g,d.t,d.en);fit(g,img,S/2-160,230,320,420,"contain");const n=d.badges.length,w=(S-120)/n;
  d.badges.forEach(([big,sm],i)=>{const cx=60+w*i+w/2,cy=800;g.strokeStyle=col;g.lineWidth=6;g.beginPath();g.arc(cx,cy,110,0,7);g.stroke();g.lineWidth=2;g.beginPath();g.arc(cx,cy,94,0,7);g.stroke();
    txt(g,big,cx,cy-12,`900 40px ${F}`,col,"center");txt(g,sm,cx,cy+36,`700 24px ${F}`,"#666","center")});
  pill(g,"示意：請換成你實際有的檢驗或認證",60,S-62,"#1b1b1bcc","#fff",24)}
// 13 送禮包裝
function tGift(g,img,d){g.fillStyle="#1b1b1b";g.fillRect(0,0,S,S);txt(g,d.t,60,110,`900 64px ${F}`,"#fff");txt(g,d.en,62,172,`700 26px ${N}`,col);
  const bx=330,by=420,bw=520,bh=480;g.fillStyle=col;g.fillRect(bx,by,bw,bh);g.fillStyle=light(col,.35);g.fillRect(bx-20,by-90,bw+40,110);g.fillStyle="#fff";g.fillRect(bx+bw/2-22,by-90,44,bh+90);
  g.fillStyle="#fff";g.beginPath();g.ellipse(bx+bw/2-70,by-110,80,40,-.5,0,7);g.ellipse(bx+bw/2+70,by-110,80,40,.5,0,7);g.fill();
  shadow(g,230,960,260);fit(g,img,90,520,280,440,"contain");d.tags.forEach((t,i)=>pill(g,t,60,240+i*80,"#ffffff1f","#fff",30))}

// 各行業加的版型：[名稱, 等級(1入門 2專業), 畫法]
(function(){const X={
 gen:[["功能九宮格",1,(g,img)=>tGrid(g,img,{t:"六大設計重點",en:"FEATURES",items:[["冰","24H 保冰","冰塊放一天還在"],["熱","12H 保溫","早上泡的茶下午還燙"],["輕","輕量 330g","放包包不重"],["鋼","316 不鏽鋼","不怕咖啡和果汁"],["扣","單手開蓋","騎車停紅燈也能喝"],["洗","可拆洗杯蓋","零件全部拆開洗"]]})],
  ["使用步驟",1,(g,img)=>tSteps(g,img,{t:"第一次使用",en:"HOW TO USE",steps:[["先用熱水沖一遍","去除新品氣味"],["裝到瓶口下 1cm","太滿蓋子會壓到"],["轉緊再按壓開蓋","聽到喀一聲就鎖好了"],["每天用完拆洗","杯蓋零件都能拆"]]})],
  ["包裝內容物",1,(g,img)=>tBox(g,img,{t:"收到會有這些",en:"IN THE BOX",items:["保溫瓶 ×1","替換杯蓋 ×1","清潔刷 ×1","保固卡 ×1"]})],
  ["手拿尺寸對照",1,(g,img)=>tScale(g,img,{t:"實際大小",en:"ACTUAL SIZE",h:"23 cm",w:"7 cm",note:"比一般手搖杯細，車上杯架、包包側袋都放得下"})],
  ["跟一般的比",2,(g,img)=>tCompare(g,img,{t:"為什麼選這支",en:"COMPARE",cols:["我們","一般保溫瓶"],rows:[["保冰時間","24 小時","6 小時"],["內膽材質","316","304"],["單手開蓋","✓","✕"],["杯蓋可拆洗","✓","✕"],["保固","1 年","無"]]})],
  ["常見問題",1,(g,img)=>tFaq(g,img,{t:"常見問題",en:"Q & A",qa:[["可以裝熱湯嗎？","可以，但請不要裝牛奶放隔夜。"],["可以進洗碗機嗎？","杯身建議手洗，杯蓋可以。"],["多久會到？","現貨 24 小時內出貨，2～3 天到。"],["壞了怎麼辦？","一年內非人為損壞免費換新。"]]})],
  ["好評框",2,(g,img)=>tReview(g,img,{t:"買過的人說",en:"REVIEWS",rv:[["王小姐","放車上一整天，下班冰塊還在，很驚喜。"],["陳先生","單手就能開，騎車等紅燈超方便。"],["林小姐","杯蓋全部拆得開，洗起來很安心。"]]})],
  ["組合價",1,(g,img)=>tBundle(g,img,{t:"多買更划算",en:"BUNDLE"})]],
 beauty:[["成分功效",1,(g,img)=>tGrid(g,img,{t:"每一滴都有用",en:"KEY INGREDIENTS",items:[["水","三重玻尿酸","大中小分子層層補水"],["B5","維他命 B5","安撫乾燥泛紅"],["神","神經醯胺","修護保水屏障"],["茶","綠茶萃取","調理油水平衡"]]})],
  ["質地特寫",1,(g,img)=>tTexture(g,img,{t:"清爽不黏",en:"TEXTURE",tags:["水感精華","一抹就吸收","不黏膩","上妝不搓泥"]})],
  ["使用步驟",1,(g,img)=>tSteps(g,img,{t:"這樣擦最有感",en:"HOW TO USE",steps:[["洗完臉先上化妝水","讓肌膚先打底"],["滴 2～3 滴在手心","搓開溫熱一下"],["由內往外輕壓","不要用力推"],["再擦乳液鎖水","早晚都可以用"]]})],
  ["適合膚質",1,(g,img)=>tNotice(g,img,{t:"適合誰用",en:"SKIN TYPE",rows:[["乾","乾肌","洗完臉就緊繃、會脫皮"],["混","混合肌","T 字出油、兩頰乾"],["敏","敏感肌","無香精、無酒精配方"],["妝","常上妝","上妝前擦，比較服貼"]]})],
  ["檢驗認證",2,(g,img)=>tCert(g,img,{t:"安心有保障",en:"CERTIFIED",badges:[["檢驗","重金屬"],["檢驗","微生物"],["登錄","化粧品"]]})],
  ["好評框",2,(g,img)=>tReview(g,img,{t:"擦過的人說",en:"REVIEWS",rv:[["Amy","冷氣房一整天臉都不緊繃了。"],["小雯","敏感肌擦了沒有刺刺的感覺。"],["Joyce","上妝前擦，粉底變得很服貼。"]]})],
  ["容量對照",1,(g,img)=>tScale(g,img,{t:"實際大小",en:"ACTUAL SIZE",h:"12 cm",w:"4 cm",note:"30ml 約可以用一個月，出國放隨身包剛好"})],
  ["組合價",1,(g,img)=>tBundle(g,img,{t:"囤貨更划算",en:"BUNDLE"})],
  ["常見問題",1,(g,img)=>tFaq(g,img,{t:"常見問題",en:"Q & A",qa:[["孕婦可以用嗎？","配方溫和，但建議先問過醫師。"],["可以跟 A 醇一起用嗎？","可以，先擦精華再擦 A 醇。"],["開封後可以放多久？","開封後 12 個月內用完。"],["擦了會過敏怎麼辦？","先停用，7 天內可退換。"]]})]],
 tech:[["功能九宮格",1,(g,img)=>tGrid(g,img,{t:"六大功能",en:"FEATURES",items:[["靜","主動降噪","捷運、飛機都安靜"],["電","30 小時續航","一週充一次就好"],["水","IPX5 防水","運動流汗不怕"],["連","藍牙 5.3","連線穩、不延遲"],["觸","觸控操作","點兩下切歌"],["充","快充 10 分鐘","聽 2 小時"]]})],
  ["規格比較",2,(g,img)=>tCompare(g,img,{t:"跟別款比一比",en:"COMPARE",cols:["Pro","一般款"],rows:[["主動降噪","✓","✕"],["總續航","30 小時","18 小時"],["防水","IPX5","無"],["快充","✓","✕"],["保固","1 年","3 個月"]]})],
  ["包裝內容物",1,(g,img)=>tBox(g,img,{t:"盒子裡有",en:"IN THE BOX",items:["耳機 ×2","充電盒 ×1","Type-C 線 ×1","耳塞 S/M/L"]})],
  ["連接步驟",1,(g,img)=>tSteps(g,img,{t:"三步驟就連上",en:"SETUP",steps:[["打開充電盒","燈號閃白光"],["手機打開藍牙","選「降噪藍牙耳機 Pro」"],["聽到提示音","之後打開盒子就自動連"]]})],
  ["手拿尺寸",1,(g,img)=>tScale(g,img,{t:"實際大小",en:"ACTUAL SIZE",h:"5 cm",w:"6 cm",note:"充電盒比雞蛋還小，口袋放得下"})],
  ["保固說明",1,(g,img)=>tNotice(g,img,{t:"買得安心",en:"WARRANTY",rows:[["保","一年保固","非人為損壞免費換新"],["修","台灣在地維修","不用寄回原廠"],["換","7 天鑑賞期","不滿意可以退"],["客","LINE 客服","有問題直接傳訊息"]]})],
  ["常見問題",1,(g,img)=>tFaq(g,img,{t:"常見問題",en:"Q & A",qa:[["iPhone、安卓都能用嗎？","都可以，有藍牙就能連。"],["可以只戴一耳嗎？","可以，左右耳都能單獨用。"],["講電話對方聽得清楚嗎？","有降噪麥克風，路邊也清楚。"],["電池會壞嗎？","一年內電池問題免費換新。"]]})],
  ["好評框",2,(g,img)=>tReview(g,img,{t:"用過的人說",en:"REVIEWS",rv:[["阿傑","捷運上開降噪，終於聽得清楚 podcast。"],["Kevin","跑步一小時沒掉過，很穩。"],["小雨","一週才充一次電，很省事。"]]})],
  ["組合價",1,(g,img)=>tBundle(g,img,{t:"跟朋友一起買",en:"BUNDLE"})]],
 food:[["吃法建議",1,(g,img)=>tSteps(g,img,{t:"這樣吃最好吃",en:"HOW TO EAT",steps:[["配優格","早餐 3 分鐘搞定"],["加鮮奶","泡 1 分鐘口感剛好"],["直接吃","下午嘴饞的小點心"],["撒在冰淇淋上","多一層酥脆"]]})],
  ["無添加標示",1,(g,img)=>tGrid(g,img,{t:"吃得安心",en:"CLEAN LABEL",items:[["糖","無精緻糖","用蜂蜜帶出甜味"],["防","無防腐劑","手工小批烘焙"],["香","無人工香料","香味來自堅果本身"],["纖","高纖","一份 3.6g 膳食纖維"]]})],
  ["保存方式",1,(g,img)=>tNotice(g,img,{t:"怎麼保存",en:"STORAGE",rows:[["夾","開封夾緊","夾鏈袋擠出空氣再封"],["涼","放陰涼處","避免陽光直射"],["冰","夏天可冷藏","口感會更脆"],["期","2 週內吃完","開封後風味最好"]]})],
  ["產地故事",1,(g,img)=>tStory(g,img,{t:"一鍋一鍋慢慢烤",en:"OUR STORY",para:"每天早上烤一小批，堅果整顆放、不磨碎，烤到金黃就出爐。我們只做自己每天會吃的東西。",sign:"— 店主（示意，換成你的故事）"})],
  ["份量對照",1,(g,img)=>tScale(g,img,{t:"一罐有多少",en:"PORTION",h:"15 cm",w:"9 cm",note:"300g 約 7～8 份早餐，一個人吃一週半"})],
  ["跟一般的比",2,(g,img)=>tCompare(g,img,{t:"跟市售穀片比",en:"COMPARE",cols:["我們","市售穀片"],rows:[["精緻糖","不添加","每份 8g"],["堅果","整顆","碎粒"],["防腐劑","✕","✓"],["烘焙","手工小批","工廠量產"]]})],
  ["送禮包裝",1,(g,img)=>tGift(g,img,{t:"送禮也體面",en:"GIFT BOX",tags:["質感禮盒","附手寫卡片","可代寄"]})],
  ["組合價",1,(g,img)=>tBundle(g,img,{t:"多買更划算",en:"BUNDLE"})],
  ["好評框",2,(g,img)=>tReview(g,img,{t:"吃過的人說",en:"REVIEWS",rv:[["Mia","不會太甜，小孩也很愛。"],["阿明","配優格當早餐，飽到中午。"],["小芳","堅果真的很多，一直回購。"]]})]]};
 window.XTPL=function(k){return X[k]||[]}})();
