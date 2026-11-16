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
 const palette=roofSets[biome]||roofSets[0],base=palette[seed>.72?1:0],edge=palette[2],light=palette[3];
 const commercial=["cafe","restaurant","shop","bakery","market","bookshop","cinema","theatre"].includes(kind);
 const civic=["hospital","clinic","school","library","museum","townhall","station","church"].includes(kind);
 const rural=["farm","barn","greenhouse"].includes(kind);
 const flat=civic||["skyscraper","apartment","hotel","office","factory"].includes(kind)||seed>.58;
 c.save();
 // A genuine overhead footprint: ground shadow, perimeter walls and roof plane.
 A.rounded(c,x+5,y+8,w,h,Math.min(12,w*.09), "#34433a35");
 A.rounded(c,x,y,w,h,Math.min(10,w*.08),edge,"#493f36",1.8);
 const inset=4;
 A.rounded(c,x+inset,y+inset,w-inset*2,h-inset*2,Math.min(8,w*.06),base,"#f4d7ad88",1);
 // Fine material texture changes with the building type instead of one generic roof overlay.
 if(rural&&kind==="greenhouse"){
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
  A.rounded(c,x+8,y+8,w-16,h-16,4,seed>.48?"#9d9b83":"#b3a58d","#665b4b99",1);
  for(let yy=y+15;yy<y+h-12;yy+=18)A.line(c,[[x+10,yy],[x+w-10,yy]],"#f4e1c54c",1);
  if(w>105&&h>105){
   A.rounded(c,x+w*.31,y+h*.3,w*.38,h*.36,5,civic?"#c8b995":"#8e9a87","#665b4b88",1);
   A.rounded(c,x+w*.35,y+h*.34,w*.3,h*.28,3,civic?"#e6d6b5":"#aab99a",null);
  }
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
