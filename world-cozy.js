/* Cohesive flowers, warm lighting, fifty distinct designs, and purpose-built social interiors. */
(()=>{
"use strict";
const A=window.LWArt,W=window.LWWorldData,T=W.T,INK="#655640";
const oldObject=A.object,oldMetrics=A.buildingMetrics;
const decorCache=new Map();
const roofSets=[
 ["#b66e55","#d9946d","#774b40","#f0c69b"],
 ["#a75e55","#d78c70","#6d4744","#f3c9a7"],
 ["#8e6654","#bd9475","#59483f","#ead0a8"],
 ["#87999a","#b6c9c7","#526b70","#eef1e4"],
 ["#a66b55","#d69b72","#68483e","#f2d1a4"]
];
function topDownBuilding(c,b){
 const x=b.x*T+5,y=b.y*T+5,w=Math.max(42,b.w*T-10),h=Math.max(42,b.h*T-10);
 const seed=W.hash(b.id,b.x,b.y),kind=b.kind||"house",biome=b.biome||0;
 const palette=roofSets[biome]||roofSets[0],architecture=(b.architecture||"").toLowerCase();
 const base=architecture.includes("limestone")||architecture.includes("stone")?"#b8b3a2":
  architecture.includes("timber")?"#a96e50":architecture.includes("copper")?"#87988b":
  civic?(seed>.5?"#c0b7a4":"#a7a89a"):rural?(seed>.5?"#b58a59":"#a56b4d"):
  commercial?(seed>.5?palette[1]:"#a96d59"):palette[seed>.72?1:0];
 const edge=palette[2],light=palette[3];
 const commercial=["cafe","restaurant","shop","bakery","market","bookshop","cinema","theatre","gelateria","teahouse","florist","recordshop","workshop"].includes(kind);
 const civic=["hospital","clinic","pharmacy","firestation","postoffice","school","university","library","museum","townhall","station","church","chapel"].includes(kind);
 const rural=["farm","barn","greenhouse","watermill","windmill"].includes(kind);
 const flat=civic||["skyscraper","apartment","hotel","office","factory"].includes(kind)||seed>.58;
 c.save();
 // A genuine overhead footprint: ground shadow, perimeter walls and roof plane.
 A.rounded(c,x+5,y+8,w,h,Math.min(12,w*.09), "#34433a35");
 A.rounded(c,x,y,w,h,Math.min(10,w*.08),edge,"#493f36",1.8);
 const inset=4;
 A.rounded(c,x+inset,y+inset,w-inset*2,h-inset*2,Math.min(8,w*.06),base,"#f4d7ad88",1);
 // Signature landmarks have their own unmistakable overhead silhouettes.
 if(kind==="clock"){
  const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)*.37;
  A.ellipse(c,cx+3,cy+5,r+5,r+5,"#3b40343b");
  A.ellipse(c,cx,cy,r+4,r+4,"#c8b38d",edge,3);
  A.ellipse(c,cx,cy,r-5,r-5,"#e2d2ac","#78644d",2);
  A.ellipse(c,cx,cy,r*.72,r*.72,"#a96e55","#765346",2);
  A.ellipse(c,cx,cy,r*.55,r*.55,"#e8d9b5","#765e4a",1.5);
  for(let j=0;j<12;j++){const a=j*Math.PI/6,ix=cx+Math.cos(a)*r*.62,iy=cy+Math.sin(a)*r*.62,ox=cx+Math.cos(a)*r*.76,oy=cy+Math.sin(a)*r*.76;A.line(c,[[ix,iy],[ox,oy]],"#6e5945",2);}
  A.line(c,[[cx,cy],[cx,cy-r*.3]],"#655744",2.5);A.line(c,[[cx,cy],[cx+r*.22,cy+r*.08]],"#655744",2.5);
 }else if(kind==="pisa"){
  const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)*.38;
  A.ellipse(c,cx,cy,r+3,r+3,"#c5a77f",edge,2);
  A.ellipse(c,cx,cy,r-5,r-5,"#d9c49b","#7b624b",2);
  for(let j=0;j<4;j++)A.ellipse(c,cx,cy,r-13-j*8,r-13-j*8,"rgba(0,0,0,0)","#8e7457",2);
  A.ellipse(c,cx,cy,Math.max(8,r*.24),Math.max(8,r*.24),"#9b795a","#6f5944",1.5);
 }else if(kind==="roman"){
  const cx=x+w/2,cy=y+h/2,rx=w*.43,ry=h*.36;
  A.ellipse(c,cx,cy,rx,ry,"#a98564",edge,2.5);
  A.ellipse(c,cx,cy,rx-8,ry-8,"#d5b58a","#80684e",2);
  A.ellipse(c,cx,cy,rx*.72,ry*.68,"#a58a68","#80684e",2);
  A.ellipse(c,cx,cy,rx*.52,ry*.48,"#c7a77e","#80684e",1.5);
  A.ellipse(c,cx,cy,rx*.28,ry*.27,"#8e785c","#6e5b47",1);
  for(let j=0;j<24;j++){const a=j*Math.PI/12,px=cx+Math.cos(a)*rx*.85,py=cy+Math.sin(a)*ry*.85;A.ellipse(c,px,py,3.2,3.2,"#e5d1a9","#846d52",.7);}
 }else if(rural&&kind==="greenhouse"){
  A.rounded(c,x+8,y+8,w-16,h-16,4,"#8db9a4","#526e62",1.4);
  for(let xx=x+15;xx<x+w-8;xx+=Math.max(12,w/7))A.line(c,[[xx,y+9],[xx,y+h-9]],"#e6f1d7c9",2);
  for(let yy=y+17;yy<y+h-8;yy+=Math.max(12,h/6))A.line(c,[[x+9,yy],[x+w-9,yy]],"#e6f1d78c",1.5);
  for(let j=0;j<Math.min(6,Math.floor((w-20)/18));j++){const px=x+15+j*18;A.ellipse(c,px,y+h*.52,4,7,j%2?"#5c956b":"#77a87b");}
 }else if(!flat){
  const vertical=(seed>.5);
  const ridge=vertical?x+w*(.43+seed*.14):y+h*(.43+seed*.14);
  if(vertical){
   A.rounded(c,x+7,y+7,w*.42-5,h-14,3,base,null);
   A.rounded(c,x+w*.5,y+7,w*.42-5,h-14,3,seed>.4?palette[1]:base,null);
   for(let yy=y+12;yy<y+h-8;yy+=11){A.line(c,[[x+7,yy],[x+w-7,yy]],"#f8dcb46b",1.2);A.line(c,[[x+7,yy+2],[x+w-7,yy+2]],"#533d3430",.8);}
   A.line(c,[[ridge,y+7],[ridge,y+h-7]],edge,3);
   A.line(c,[[ridge-2,y+8],[ridge-2,y+h-8]],light,1);
  }else{
   for(let yy=y+7;yy<y+h-7;yy+=11){A.line(c,[[x+8,yy],[x+w-8,yy]],"#f8dcb46b",1.2);A.line(c,[[x+8,yy+2],[x+w-8,yy+2]],"#533d3430",.8);}
   A.line(c,[[x+7,ridge],[x+w-7,ridge]],edge,3);
   A.line(c,[[x+8,ridge-2],[x+w-8,ridge-2]],light,1);
  }
 }else{
  // Flat commercial and civic roofs have parapets, roof machinery and varied surfaces.
  A.rounded(c,x+8,y+8,w-16,h-16,4,civic?"#bcb6a5":commercial?"#ad9277":seed>.48?"#9d9b83":"#b3a58d","#665b4b99",1);
  for(let yy=y+15;yy<y+h-12;yy+=18)A.line(c,[[x+10,yy],[x+w-10,yy]],"#f4e1c54c",1);
  if(w>105&&h>105){
   A.rounded(c,x+w*.31,y+h*.3,w*.38,h*.36,5,civic?"#c8b995":"#8e9a87","#665b4b88",1);
   A.rounded(c,x+w*.35,y+h*.34,w*.3,h*.28,3,civic?"#e6d6b5":"#aab99a",null);
  }
 }
 // Landmark and civic roof plans carry readable silhouettes at normal zoom.
 const cx=x+w/2,cy=y+h/2;
 if(kind==="chapel"){
  const r=Math.min(w,h)*.23;
  A.ellipse(c,cx,cy,r+7,r+7,"#b9a17c",edge,2);
  A.ellipse(c,cx,cy,r,r,"#d9c7a0","#79654d",1.5);
  A.ellipse(c,cx,cy,r*.65,r*.65,"#a67a5d","#715740",1.2);
  A.line(c,[[cx,cy-r*.4],[cx,cy+r*.4]],"#f1e4c8",3);
  A.line(c,[[cx-r*.4,cy],[cx+r*.4,cy]],"#f1e4c8",3);
 }else if(kind==="hospital"||kind==="clinic"){
  const arm=Math.min(15,w*.12,h*.12);
  A.rounded(c,cx-arm/2,cy-arm*1.8,arm,arm*3.6,2,"#e7e2d2","#8b8373",.8);
  A.rounded(c,cx-arm*1.8,cy-arm/2,arm*3.6,arm,2,"#e7e2d2","#8b8373",.8);
  A.rounded(c,cx-arm*.28,cy-arm*.28,arm*.56,arm*.56,1,"#b85f55",null);
 }else if(kind==="station"){
  for(let j=0;j<3;j++){
   const yy=y+h*(.24+j*.25);
   A.rounded(c,x+w*.13,yy,w*.74,h*.13,3,j===1?"#b7c7bd":"#d3c3a2","#746d5b",1);
   A.line(c,[[x+w*.17,yy+h*.065],[x+w*.83,yy+h*.065]],"#6d7770",1.3);
  }
 }else if(kind==="hotel"){
  const pw=Math.min(w*.32,44),ph=Math.min(h*.23,28);
  A.rounded(c,x+w*.12,y+h*.16,pw,ph,5,"#6eaaa7","#e5d7b8",1.2);
  A.line(c,[[x+w*.12+4,y+h*.16+ph*.5],[x+w*.12+pw-4,y+h*.16+ph*.5]],"#d8f1e5",1);
 }else if(kind==="windmill"){
  const blade=Math.min(w,h)*.32;
  A.ellipse(c,cx,cy,Math.max(8,blade*.18),Math.max(8,blade*.18),"#b18b68",edge,1.2);
  for(let j=0;j<4;j++){const a=j*Math.PI/2+.35,ex=cx+Math.cos(a)*blade,ey=cy+Math.sin(a)*blade;A.line(c,[[cx,cy],[ex,ey]],"#e6d5b3",4);A.ellipse(c,ex,ey,3,3,"#8d6d50");}
 }else if(kind==="watermill"){
  const wx=x+w*.8,wy=y+h*.54,r=Math.min(w,h)*.19;
  A.ellipse(c,wx,wy,r+4,r+4,"#7daaa0","#705d49",2);
  A.ellipse(c,wx,wy,r*.55,r*.55,"#c3a078","#705d49",1.2);
  for(let j=0;j<8;j++){const a=j*Math.PI/4;A.line(c,[[wx,wy],[wx+Math.cos(a)*r,wy+Math.sin(a)*r]],"#725c46",2.4);}
 }else if(kind==="farm"||kind==="barn"){
  for(let j=0;j<3;j++){const px=x+w*(.22+j*.25),py=y+h*.72;A.ellipse(c,px,py,Math.min(7,w*.07),Math.min(5,h*.08),j%2?"#c7a45f":"#d7b66d","#92764e",.8);}
 }else if(kind==="skyscraper"){
  const r=Math.min(w,h)*.2;
  A.ellipse(c,cx,cy,r+4,r+4,"#75847e","#4f5c56",1.5);
  A.ellipse(c,cx,cy,r-3,r-3,"#9da99a","#e4e0c9",1);
  A.line(c,[[cx-r*.35,cy],[cx+r*.35,cy]],"#f6f1d9",3);
  A.line(c,[[cx,cy-r*.35],[cx,cy+r*.35]],"#f6f1d9",3);
 }else if(kind==="university"||kind==="school"){
  A.rounded(c,x+w*.23,y+h*.23,w*.54,h*.54,5,"#6f936f","#d6c59f",1.5);
  A.rounded(c,x+w*.3,y+h*.3,w*.4,h*.4,3,"#9db58a","#e8d8b8",1);
  for(let j=0;j<4;j++)A.ellipse(c,x+w*(.34+j*.1),y+h*.5,2.5,3,j%2?"#e7b5a4":"#e9d28c");
 }else if(kind==="firestation"){
  for(let j=0;j<3;j++){
   const yy=y+h*(.26+j*.22);
   A.rounded(c,x+w*.14,yy,w*.72,h*.12,2,j===1?"#bd765f":"#d0b79a","#765a4c",1);
   A.line(c,[[x+w*.2,yy+h*.06],[x+w*.8,yy+h*.06]],"#f0d6b0",1.5);
  }
 }else if(kind==="library"){
  const r=Math.min(w,h)*.2;
  A.ellipse(c,cx,cy,r+5,r+5,"#8a9a8c","#5d6e62",1.5);
  A.ellipse(c,cx,cy,r,r,"#b7d0c1","#e8e1c7",1);
  A.ellipse(c,cx,cy,r*.45,r*.45,"#e7d9b8","#8a7658",1);
 }
 // Individual rooftop equipment, solar panels, skylights and gardens.
 const unitW=Math.max(10,Math.min(21,w*.16)),unitH=Math.max(9,Math.min(17,h*.15));
 const ux=x+w*(.18+W.hash(b.id,4,9)*.42),uy=y+h*(.17+W.hash(b.id,5,8)*.48);
 if(flat){
  A.rounded(c,ux+2,uy+3,unitW,unitH,2,"#4a4b46a8");
  A.rounded(c,ux,uy,unitW,unitH,2,"#b8c8bd","#5f716b",1);
  A.line(c,[[ux+3,uy+3],[ux+unitW-3,uy+3]],"#fff3d6",1);
 }else{
  const cw=Math.max(12,Math.min(24,w*.2)),ch=Math.max(10,Math.min(19,h*.17));
  A.rounded(c,ux,uy,cw,ch,2,"#526b68","#4b4a40",1);
  A.rounded(c,ux+2,uy+2,cw-4,ch-4,1,"#b8d0c4","#f2e7c6",.7);
 }
 if(b.id%4===0&&w>75&&h>70){
  const sx=x+w*.59,sy=y+h*.2,pw=Math.min(w*.27,42),ph=Math.min(h*.28,38);
  A.rounded(c,sx,sy,pw,ph,2,"#385f69","#d2d8c2",1);
  for(let j=1;j<3;j++)A.line(c,[[sx+j*pw/3,sy+2],[sx+j*pw/3,sy+ph-2]],"#b7d6d0a8",.8);
  A.line(c,[[sx+2,sy+ph/2],[sx+pw-2,sy+ph/2]],"#b7d6d0a8",.8);
 }
 if((b.id%5===0||kind==="cafe"||kind==="hotel")&&w>85&&h>75){
  const gx=x+w*.57,gy=y+h*.59,gw=Math.min(w*.34,52),gh=Math.min(h*.25,34);
  A.rounded(c,gx,gy,gw,gh,4,"#557b56","#d4c39b",1);
  for(let j=0;j<5;j++){const px=gx+5+j*(gw-10)/4;A.ellipse(c,px,gy+gh*.48,3.1,3.7,j%2?"#e8b4a4":"#f2d58c");}
  A.ellipse(c,gx+gw*.5,gy+gh*.5,4,4,"#b9c9a1");
 }
 if(commercial&&w>75){
  // Awnings/terrace elements are shown as overhead stripes beside the roof, not as a façade.
  const awnY=y+h-13;
  for(let j=0;j<Math.min(7,Math.floor((w-16)/12));j++){
   const ax=x+9+j*12;
   A.rounded(c,ax,awnY,9,5,1,j%2?"#f0d6b1":"#b76f60",null);
  }
 }
 if(biome===3){A.ellipse(c,x+w*.82,y+h*.17,Math.min(10,w*.1),3,"#f6ffffc9");A.ellipse(c,x+w*.18,y+h*.82,Math.min(8,w*.08),2.5,"#f6ffffa8");}
 // Strong inset roofline and tiny corner highlights separate every footprint at normal zoom.
 A.rounded(c,x+1.5,y+1.5,w-3,h-3,Math.min(8,w*.06), "rgba(0,0,0,0)","#f8e8c5b8",1.2);
 A.ellipse(c,x+8,y+8,2,2,"#fff0d9");A.ellipse(c,x+w-8,y+8,2,2,"#fff0d9");
 c.restore();
}
A.buildingMetrics=b=>({width:b.w*T+24,height:b.h*T+24,base:(b.y+b.h)*T+3});
A.building=function(c,b){topDownBuilding(c,b);};
function topDownScenic(c,l){
 const x=l.x*T,y=l.y*T,w=l.w*T,h=l.h*T,cx=x+w/2,cy=y+h/2;
 A.ellipse(c,cx+5,cy+9,w*.46,h*.42,"#34483a35");
 if(l.kind==="lighthouse"){
  const r=Math.min(w,h)*.36;
  A.ellipse(c,cx,cy,r+12,r+12,"#b7a17c","#74634f",2);
  A.ellipse(c,cx,cy,r+5,r+5,"#f0e4c7","#8a7458",2);
  A.ellipse(c,cx,cy,r*.82,r*.82,"#b96655","#754e43",2);
  A.ellipse(c,cx,cy,r*.62,r*.62,"#f0d7a5","#795d4b",2);
  A.ellipse(c,cx,cy,r*.39,r*.39,"#78a99c","#4d746d",2);
  A.ellipse(c,cx,cy,r*.2,r*.2,"#f5e5b7","#6c5b49",1.4);
  for(let j=0;j<8;j++){const a=j*Math.PI/4,ix=cx+Math.cos(a)*r*.68,iy=cy+Math.sin(a)*r*.68,ox=cx+Math.cos(a)*(r+10),oy=cy+Math.sin(a)*(r+10);A.line(c,[[ix,iy],[ox,oy]],"#fff0b27a",2);}
  for(let j=0;j<4;j++){const a=j*Math.PI/2;A.ellipse(c,cx+Math.cos(a)*r*.9,cy+Math.sin(a)*r*.9,4,4,"#6d8b68","#f1dfbd",1);}
 }else if(l.kind==="harbour"){
  const dockX=x+w*.12,dockY=y+h*.35,dockW=w*.76,dockH=h*.5;
  A.rounded(c,dockX+5,dockY+6,dockW,dockH,7,"#5d4e3d45");
  A.rounded(c,dockX,dockY,dockW,dockH,6,"#a9875e","#735d46",2);
  for(let yy=dockY+8;yy<dockY+dockH-4;yy+=13)A.line(c,[[dockX+5,yy],[dockX+dockW-5,yy]],"#70583e99",1.5);
  for(let xx=dockX+12;xx<dockX+dockW-6;xx+=27)A.line(c,[[xx,dockY+4],[xx,dockY+dockH-4]],"#e3c3976b",1);
  for(let j=0;j<4;j++){
   const px=dockX+15+j*(dockW-30)/3;
   A.rounded(c,px,dockY-8,8,dockH+16,3,"#8e714f","#624e3e",1);
   A.ellipse(c,px+4,dockY-8,5,3,"#d2b78d");
   A.ellipse(c,px+4,dockY+dockH+8,5,3,"#d2b78d");
  }
  for(let j=0;j<3;j++)A.object(c,{x:l.x+1+j*2.4,y:l.y+1,kind:"boat",biome:W.B.COAST,variant:j});
  for(let j=0;j<3;j++)A.object(c,{x:l.x+1+j*2.4,y:l.y+l.h-1,kind:"boat",biome:W.B.COAST,variant:j+1});
  A.object(c,{x:l.x+1,y:l.y+l.h-2,kind:"crate",biome:W.B.COAST});
 }else{
  A.rounded(c,x+5,y+5,w-10,h-10,Math.min(18,w*.12),"#e9cc96","#c2a477",1.5);
  for(let j=0;j<5;j++){
   const px=x+w*(.16+j*.16),py=y+h*(.28+(j%2)*.36);
   A.object(c,{x:px/T-.5,y:py/T-.5,kind:"umbrella",biome:W.B.COAST,variant:j});
   A.object(c,{x:px/T-.1,y:(py+34)/T-.5,kind:"lounger",biome:W.B.COAST,variant:j});
  }
  for(let j=0;j<7;j++)A.object(c,{x:l.x+.6+j*1.1,y:l.y+l.h-.8,kind:"shell",biome:W.B.COAST,variant:j});
 }
}
A.scenic=topDownScenic;
A.object=function(c,o){
 if(!["warmLamp","flowerbed","fairyLights"].includes(o.kind)){oldObject(c,o);return;}
 const key=o.kind+":"+(o.variant%3),x=o.x*T+T/2+(o.ox||0),y=o.y*T+T/2+(o.oy||0);let can=decorCache.get(key);
 if(!can){
  can=document.createElement("canvas");can.width=160;can.height=160;const cc=can.getContext("2d");cc.translate(80,120);
  if(o.kind==="warmLamp"){
   const glow=cc.createRadialGradient(0,-36,1,0,-36,23);glow.addColorStop(0,"#ffd48670");glow.addColorStop(1,"#ffd48600");cc.fillStyle=glow;cc.fillRect(-25,-61,50,50);
   A.rounded(cc,-2,-30,4,39,2,"#6c7559",INK,1);A.rounded(cc,-9,-46,18,20,4,"#7a8463",INK,1);A.rounded(cc,-6,-43,12,13,2,"#ffe0a0",INK,.6);A.line(cc,[[0,-43],[0,-30]],"#fff1c3",2);
   A.path(cc,[[-12,-46],[0,-54],[12,-46]],"#829069",INK,1);A.ellipse(cc,0,8,6,2,"#8f9977");
  }else if(o.kind==="flowerbed"){
   A.ellipse(cc,0,3,25,9,"#7d8b5c44");A.rounded(cc,-24,-4,48,13,5,"#c39c76",INK,1);
   for(let j=0;j<12;j++){
    const px=-21+(j%6)*8,py=-7-Math.floor(j/6)*9;A.line(cc,[[px,py+9],[px,py]],"#66875c",1.3);
    for(let k=0;k<5;k++)A.ellipse(cc,px+Math.cos(k*Math.PI*.4)*3,py+Math.sin(k*Math.PI*.4)*3,2.5,2.4,["#efbdba","#f5dfad","#c8b5d5"][(j+o.variant)%3]);
    A.ellipse(cc,px,py,1.5,1.5,"#ccaa67");
   }
  }else{
   for(const dx of [-60,60]){A.rounded(cc,dx-2,-58,4,68,2,"#a2916a",INK,1);A.sprite(cc,"props",8,dx,12,30,32);}
   cc.beginPath();cc.moveTo(-60,-56);cc.quadraticCurveTo(0,-24,60,-56);cc.strokeStyle="#7e7e5c";cc.lineWidth=1;cc.stroke();
   for(let j=0;j<9;j++){
    const t=(j+.5)/9,px=-60+120*t,py=-56+64*t*(1-t);A.line(cc,[[px,py],[px,py+4]],"#8a8460",.8);A.ellipse(cc,px,py+5,4.5,6,"#ffdc7d22");A.ellipse(cc,px,py+5,2.3,3.3,j%3?"#ffe1a2":"#f7c3a2",null);
   }
  }
  decorCache.set(key,can);
 }
 c.drawImage(can,x-80,y-120);
};
A.cozyRoom=function(canvas,b,playerX,playerY){
 const cinema=b.kind==="cinema"||b.kind==="theatre",medical=b.kind==="hospital"||b.kind==="clinic",library=b.kind==="library"||b.kind==="bookshop";
 if(!cinema&&!medical&&!library)return false;
 const c=canvas.getContext("2d"),ww=canvas.width,hh=canvas.height;if(!c||!ww||!hh)return true;
 const s=Math.min(ww/800,hh/750),ox=(ww-800*s)/2,oy=(hh-750*s)/2;
 c.setTransform(1,0,0,1,0,0);c.fillStyle="#4c594b";c.fillRect(0,0,ww,hh);c.translate(ox,oy);c.scale(s,s);
 A.rounded(c,30,27,740,694,18,cinema?"#765e55":"#d5c7a8",INK,5);A.rounded(c,49,49,702,645,10,cinema?"#ad856d":"#ede0c2",INK,2);
 if(cinema){
  A.rounded(c,142,74,516,143,8,"#554b4b",INK,3);A.rounded(c,173,86,454,112,4,b.kind==="theatre"?"#ad776b":"#e6dfbe",INK,2);
  if(b.kind==="theatre"){A.rounded(c,173,86,100,112,3,"#a45e59");A.rounded(c,527,86,100,112,3,"#a45e59");A.rounded(c,273,100,254,90,5,"#b7946e");}
  else{A.path(c,[[221,177],[313,119],[389,156],[461,117],[580,176]],"#bbc8a6",null);A.ellipse(c,505,113,13,13,"#edca8a");}
  for(let row=0;row<5;row++)for(let col=0;col<7;col++){
   if(col===3)continue;const x=143+col*76,y=283+row*67;A.rounded(c,x-27,y-17,53,44,10,"#805c58",INK,2);A.rounded(c,x-23,y+8,45,20,6,"#be8a78",INK,1.5);A.line(c,[[x-29,y],[x-29,y+26],[x+28,y+26],[x+28,y]],"#cea46f",3);
  }
  for(let j=0;j<6;j++){A.ellipse(c,84,116+j*86,8,11,"#ffdfa3");A.ellipse(c,716,116+j*86,8,11,"#ffdfa3");}
 }else if(medical){
  A.rounded(c,90,80,620,96,10,"#a6b7a2",INK,2);A.rounded(c,114,97,572,55,7,"#eee5cf",INK,1);
  for(const [x,y] of [[191,280],[524,280],[191,472],[524,472]]){
   A.rounded(c,x-45,y-23,112,105,9,"#8ca89a",INK,2);A.rounded(c,x-36,y-18,94,91,8,"#f4edda",INK,1);A.rounded(c,x-28,y-11,78,24,7,"#fff8e9",INK,1);A.rounded(c,x-28,y+22,78,44,5,"#c1d0b6");A.rounded(c,x+80,y-15,36,47,5,"#c5af89",INK,1);
  }
  A.rounded(c,370,93,60,12,2,"#b07869");A.rounded(c,394,70,12,60,2,"#b07869");
 }else{
  for(const x of [87,598])for(let row=0;row<4;row++){
   A.rounded(c,x,94+row*127,115,103,5,"#a48360",INK,2);
   for(let j=0;j<9;j++)A.rounded(c,x+9+j*11,107+row*127,8,72,1,["#b78372","#8a9e7b","#d3b884","#91a7a1"][j%4],INK,.5);
  }
  for(const y of [333,503]){A.rounded(c,290,y-42,235,86,12,"#c5a474",INK,2);A.rounded(c,354,y-20,74,40,4,"#eee1bc",INK,1);A.line(c,[[391,y-18],[391,y+18]],"#c5b48b",1);}
 }
 for(const [x,y] of [[93,653],[704,653]])A.sprite(c,"props",8,x,y,68,78);
 A.actor(c,playerX*800,playerY*750,"#bf8c70","#e6bf98","#5c493b",false,true);
 return true;
};
})();
