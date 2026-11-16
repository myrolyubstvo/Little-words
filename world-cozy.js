/* Cohesive flowers, warm lighting, fifty distinct designs, and purpose-built social interiors. */
(()=>{
"use strict";
const A=window.LWArt,W=window.LWWorldData,T=W.T,INK="#655640";
const oldBuilding=A.building,oldObject=A.object,oldMetrics=A.buildingMetrics;
const decorCache=new Map();
A.buildingMetrics=b=>b.designId?{width:b.w*T+14,height:b.kind==="skyscraper"?270+b.artFrame*14:b.h*T+70,base:(b.y+b.h)*T-3}:oldMetrics(b);
function roofFinish(c,b,m,x){
 // Distinct, clearly readable overhead roof treatments; all details stay in the roof plane.
 const left=x-m.width*.43,top=m.base-m.height*.91,width=m.width*.86,height=m.height*.79;
 const seed=W.hash(b.id,Math.floor(b.x),Math.floor(b.y));
 const radius=Math.min(15,width*.075);
 c.save();
 c.beginPath();c.roundRect(left,top,width,height,radius);c.clip();
 // Base roof wash and a clear perimeter make the roof silhouette legible at normal zoom.
 c.fillStyle=b.biome===3?"#657a7c":b.biome===2?"#8b594b":b.biome===1?"#9a6655":b.biome===4?"#8c7770":"#925c4c";
 c.globalAlpha=.16;c.fillRect(left,top,width,height);c.globalAlpha=1;
 c.strokeStyle="#f7e4c27a";c.lineWidth=2.2;c.strokeRect(left+2,top+2,width-4,height-4);
 // Roof courses are now deliberately visible rather than nearly transparent.
 const gap=Math.max(13,Math.min(21,width/9));
 for(let row=gap;row<height-gap/2;row+=gap){
  const yy=top+row;
  c.strokeStyle=row%2?"#f8dfb16b":"#493a315c";c.lineWidth=1.7;
  c.beginPath();c.moveTo(left+5,yy);c.lineTo(left+width-5,yy);c.stroke();
  const shift=row%2?gap*.48:0;
  for(let xx=left+shift+8;xx<left+width-7;xx+=gap*1.45){
   c.strokeStyle="#f4d9ad66";c.lineWidth=1.2;
   c.beginPath();c.moveTo(xx,yy+2);c.lineTo(xx+gap*.62,yy+2);c.stroke();
  }
 }
 // Each property gets a small, deterministic rooftop feature: skylight, vent or planted roof patch.
 const fx=left+width*(.2+seed*.45),fy=top+height*(.27+W.hash(b.id,8,5)*.36);
 const fw=Math.max(13,Math.min(26,width*.17)),fh=Math.max(10,Math.min(19,height*.13));
 c.fillStyle="#514b43b8";c.beginPath();c.roundRect(fx,fy,fw,fh,3);c.fill();
 c.fillStyle="#b9d2c5";c.beginPath();c.roundRect(fx+2,fy+2,fw-4,fh-4,2);c.fill();
 c.strokeStyle="#fff4d6";c.lineWidth=1.3;c.strokeRect(fx+2,fy+2,fw-4,fh-4);
 if(b.id%3===0){
  const gx=left+width*.62,gy=top+height*.64,gw=Math.max(17,width*.2),gh=Math.max(12,height*.12);
  c.fillStyle="#547653";c.beginPath();c.roundRect(gx,gy,gw,gh,4);c.fill();
  for(let j=0;j<5;j++){c.fillStyle=j%2?"#e9b7a0":"#f3d78d";c.beginPath();c.arc(gx+4+j*(gw-8)/4,gy+gh*.5,2.2,0,Math.PI*2);c.fill();}
 }
 c.restore();
 c.save();c.strokeStyle="#fff0d08c";c.lineWidth=1.6;c.beginPath();c.roundRect(left+1,top+1,width-2,height-2,radius);c.stroke();c.restore();
}
A.building=function(c,b){
 if(!b.designId){oldBuilding(c,b);return;}
 const m=A.buildingMetrics(b),x=(b.x+b.w/2)*T;
 A.shadow(c,x,m.base,m.width*.84);
 if(!A.sprite(c,b.artGroup,b.artFrame,x,m.base,m.width,m.height)){oldBuilding(c,b);return;}
 roofFinish(c,b,m,x);
};
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
