/* Little Worlds — tile renderer. Real square overhead terrain, streets and buildings.
   Deterministic chunk cache, no external art dependency, designed for iPad Safari. */
(()=>{
"use strict";
const w=window.LWWorldData;
if(!w)return;
const css=[
"#map-shell{width:min(100%,84vh,920px);aspect-ratio:1/1;height:auto;min-height:0;margin:auto;position:relative;touch-action:none;background:#77a9a8;overflow:hidden}",
"#city-art{display:none!important}",
".lw-stage{position:absolute;inset:0;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}",
".lw-stage canvas{position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:none}",
".lw-stage canvas.lw-actors{pointer-events:none}",
".lw-regions{position:absolute;top:49px;left:8px;right:8px;display:flex;flex-wrap:wrap;gap:4px;pointer-events:none;z-index:2}",
".lw-regions button{pointer-events:auto;border:1px solid #b5aa88;border-radius:7px;background:#fff5dfed;color:#425e52;font:600 10px Arial,sans-serif;padding:7px;cursor:pointer}",
".lw-region-label{width:100%;font:600 10px Arial,sans-serif;color:#3d574e;text-shadow:0 1px 3px #fff;background:#fff5dfd9;padding:5px 7px;border-radius:5px;width:max-content}",
".lw-hud{position:absolute;top:8px;left:8px;display:flex;gap:5px;flex-wrap:wrap;pointer-events:none;z-index:1}",
".lw-hud span{font:700 11px/1.35 Arial,sans-serif;border-radius:8px;background:#fff9e9ea;color:#3f5147;padding:7px 9px;border:1px solid #bdad8e}",
".lw-hint{position:absolute;bottom:8px;left:8px;right:8px;margin:auto;width:max-content;max-width:95%;text-align:center;background:#fff9e9ea;color:#536155;font:11px/1.4 Arial,sans-serif;padding:8px;border:1px solid #b6a381;border-radius:10px;pointer-events:none}",
".lw-pop{position:absolute;bottom:46px;right:10px;width:min(330px,calc(100% - 20px));background:#fff9eefa;box-shadow:0 4px 24px #172c293e;border:2px solid #b6a487;border-radius:12px;padding:12px;z-index:4;font:13px/1.5 Arial,sans-serif;color:#405046;touch-action:manipulation}",
".lw-pop[hidden],.lw-room[hidden]{display:none}",
".lw-pop h3{font:24px Georgia,serif;color:#33493d;margin:0 28px 7px 0}",
".lw-pop p{font:13px/1.5 Arial,sans-serif;color:#536457;margin:0 0 8px}",
".lw-actions{display:flex;gap:7px;flex-wrap:wrap}",
".lw-actions button,.lw-close,.lw-room-exit{border:1px solid #9ba188;border-radius:7px;min-height:35px;background:#517465;color:#fff8e9;padding:8px 11px;font:700 12px Arial,sans-serif;cursor:pointer}",
".lw-actions button.lw-secondary,.lw-close{background:#efe1c5;color:#45564d}",
".lw-close{position:absolute;top:6px;right:7px;min-height:28px;padding:3px 9px}",
".lw-quest{font:11px/1.4 Arial,sans-serif;color:#657263;margin-top:7px}",
".lw-room{position:absolute;inset:0;background:#f0e3c8;z-index:5;display:flex;flex-direction:column;touch-action:none}",
".lw-room-head{display:flex;justify-content:space-between;align-items:center;background:#fff8e7;padding:10px;font:700 14px Arial,sans-serif;color:#46584b}",
".lw-room canvas{position:relative;flex:1;width:100%;height:100%;min-height:0}",
"@media(max-width:700px){.lw-hud span{font-size:10px;padding:5px}.lw-hint{font-size:10px}.lw-pop h3{font-size:20px}}"
].join("");
const style=document.createElement("style");style.textContent=css;document.head.appendChild(style);
const shell=document.getElementById("map-shell");
const oldSvg=document.getElementById("city-art");oldSvg.style.display="none";
const stage=document.createElement("div");stage.className="lw-stage";stage.setAttribute("aria-label","A real playable overhead pixel-art city");
const ground=document.createElement("canvas"),people=document.createElement("canvas");
people.className="lw-actors";stage.append(ground,people);shell.appendChild(stage);
const ctx=ground.getContext("2d",{alpha:false}),actx=people.getContext("2d");
if(!ctx||!actx){stage.remove();oldSvg.style.display="";return;}
const T=w.T,S=w.SIZE,TT=w.TERRAIN,B=w.B,CH=12,CP=CH*T;
const paints=[
 {a:"#8fcf65",b:"#64ad53",c:"#b6e67c",d:"#397955",roof:["#a64743","#d56f56","#f4a577"]},
 {a:"#9edb75",b:"#6cb65e",c:"#c0eb8c",d:"#719a79",roof:["#286c68","#438f83","#88b8a0"]},
 {a:"#c9b184",b:"#aa925f",c:"#e6cb91",d:"#8b7248",roof:["#985e45","#c88a55","#e5b16f"]},
 {a:"#e5eff0",b:"#b9d3dc",c:"#fafff7",d:"#71959b",roof:["#69858f","#9eb9bc","#d1dfe0"]},
 {a:"#c3d879",b:"#91b961",c:"#f2e5a5",d:"#57875b",roof:["#718c94","#bc795d","#dfaa7b"]}
];
const R=(x,y,z=0)=>w.hash(x,y,z);
function rect(c,x,y,ww,hh,fill){c.fillStyle=fill;c.fillRect(Math.round(x),Math.round(y),Math.ceil(ww),Math.ceil(hh))}
function artTile(c,x,y){
 const k=w.coord(x,y),b=w.biomes[k],t=w.terrain[k],p=paints[b],xx=x*T,yy=y*T;
 const h=R(x,y,8);let fill=p.a;
 if(t===TT.WATER)fill="#28acb0";
 else if(t===TT.RIVER)fill="#59c7bc";
 else if(t===TT.SAND)fill="#f4d58a";
 else if(t===TT.BRIDGE)fill="#ac8b68";
 else if(t===TT.ROAD||t===TT.PATH)fill=b===B.WINTER?"#deddd0":"#edc392";
 else if(t===TT.PLAZA)fill="#e5a37c";
 else if(t===TT.PARK)fill=p.c;
 rect(c,xx,yy,T,T,fill);
 if(t===TT.WATER||t===TT.RIVER){
  rect(c,xx+8+(h*15|0),yy+12,19,3,"#a9d4d5");rect(c,xx+3,yy+31,13,2,"#8ac3c9");
  if(t===TT.WATER&&x>0&&w.terrain[k-1]!==TT.WATER)rect(c,xx,yy,5,48,"#f0dfb8");
 }else if(t===TT.ROAD||t===TT.PLAZA||t===TT.PATH){
  // Sparse worn pavers leave room for the warm sand-coloured paths.
  for(let j=0;j<3;j++){
   const ax=xx+Math.floor(R(x,y,j+71)*32),ay=yy+j*16;
   rect(c,ax,ay,12,6,j%2?"#f6d5a6":"#dbb089");
  }
  for(const [dx,dy,ox,oy,ww,hh] of [[-1,0,0,0,3,48],[1,0,45,0,3,48],[0,-1,0,0,48,3],[0,1,0,45,48,3]]){
   if(w.inBounds(x+dx,y+dy)&&[TT.GRASS,TT.PARK].includes(w.terrain[w.coord(x+dx,y+dy)])){
    rect(c,xx+ox,yy+oy,ww,hh,"#639d50");
    for(let j=0;j<4;j++)rect(c,xx+ox+(ww>3?j*12:0),yy+oy+(hh>3?j*12:0),5,5,"#a6d66f");
   }
  }
 }else if(t===TT.BRIDGE){
  for(let j=0;j<6;j++)rect(c,xx,yy+j*8,48,2,j%2?"#82634b":"#e3bf8e");
 }else if(t===TT.SAND){
  for(let j=0;j<7;j++)rect(c,xx+(R(x,y,j+1)*44|0),yy+(R(x,y,j+19)*43|0),3,2,j%2?"#f7e7bc":"#c7ac79");
 }else{
  for(let j=0;j<7;j++)rect(c,xx+(R(x,y,j+2)*45|0),yy+(R(x,y,j+31)*45|0),4,3,j%2?p.b:p.c);
  if(b===B.WINTER&&h>.3){rect(c,xx+4,yy+7,18,4,"#f7f9f2");rect(c,xx+23,yy+32,14,4,"#f3f7f1");}
  if(b===B.SPRING&&h>.6)rect(c,xx+12,yy+23,6,5,"#e4a9b7");
  if(b===B.AUTUMN&&h>.5)rect(c,xx+27,yy+16,6,4,"#d38c4b");
 }
 if(b===B.WINTER&&t!==TT.WATER&&t!==TT.RIVER&&t!==TT.BRIDGE){
  if(t===TT.GRASS||t===TT.PARK){
   rect(c,xx+3,yy+5,29,5,"#f7ffff");rect(c,xx+19,yy+28,24,7,"#f7ffff");
   rect(c,xx+9,yy+34,15,2,"#bfd8df");
  }else if(h>.45){
   rect(c,xx+4,yy+4,17,5,"#f4ffff");rect(c,xx+27,yy+34,17,7,"#e9fafc");
   for(let j=0;j<3;j++){rect(c,xx+17+j*5,yy+11+j*7,3,4,"#9bb6c0");rect(c,xx+23+j*5,yy+13+j*7,3,4,"#9bb6c0");}
  }
 }else if((b===B.SUMMER||b===B.COAST)&&t===TT.PLAZA){
  // Ceramic mosaic rosettes inspired by Barcelona's patterned paving.
  if((x+y)%3===0){
   const cx=xx+24,cy=yy+24;
   for(let j=0;j<4;j++)oval(c,cx+Math.cos(j*Math.PI/2)*7,cy+Math.sin(j*Math.PI/2)*7,5,5,"#ca8d6b");
   oval(c,cx,cy,3,3,"#f8e1ab");
  }
 }else if(t===TT.GRASS||t===TT.PARK){
  for(let j=0;j<3;j++){
   const fx=xx+R(x,y,j+211)*43,fy=yy+R(x,y,j+222)*43;
   rect(c,fx,fy,2,5,p.b);rect(c,fx-1,fy-2,4,3,j%2?"#fff0ac":"#fff5d9");
  }
 }

}
function oval(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function regionalProp(c,o){
 const x=o.x*T+24,y=o.y*T+24,winter=o.biome===B.WINTER,ink="#51473e";
 const box=(dx,dy,ww,hh,color)=>rect(c,x+dx,y+dy,ww,hh,color);
 const ball=(dx,dy,rx,ry,color)=>oval(c,x+dx,y+dy,rx,ry,color);
 const kinds=["pine","citrus","planter","snowman","logpile","terrace","bicycle","signpost","lantern","fruitstall","fountain","lounger","boat","fence","garden"];
 if(!kinds.includes(o.kind))return false;
 ball(5,8,23,8,"#304d4230");
 if(o.kind==="pine"){
  box(-4,-23,8,34,"#86664d");
  for(let j=0;j<3;j++){
   const top=-70+j*19,half=18+j*7;
   c.beginPath();c.moveTo(x,y+top);c.lineTo(x+half,y+top+35);c.lineTo(x-half,y+top+35);c.closePath();c.fillStyle="#386c66";c.fill();
   c.beginPath();c.moveTo(x,y+top);c.lineTo(x+half*.72,y+top+25);c.lineTo(x+5,y+top+21);c.lineTo(x-7,y+top+26);c.lineTo(x-half*.72,y+top+25);c.closePath();c.fillStyle="#f3ffff";c.fill();
  }
 }else if(o.kind==="citrus"||o.kind==="planter"){
  box(-13,-5,26,20,"#a75740");box(-16,-8,32,6,"#e18f62");
  box(-3,-34,6,30,"#7c6243");ball(0,-29,22,20,"#3c8853");ball(-7,-36,15,12,"#77b853");
  for(let j=0;j<5;j++)ball(-13+j*6,-29+(j%2)*9,3,3,o.kind==="citrus"?"#ffad38":"#f4a8b5");
 }else if(o.kind==="snowman"){
  ball(0,-3,17,15,"#a8cbd4");ball(-2,-7,15,14,"#f5ffff");ball(-2,-26,11,11,"#f5ffff");
  box(-15,-37,26,4,ink);box(-10,-48,16,12,ink);box(-14,-18,25,5,"#c65d5c");box(7,-16,5,17,"#c65d5c");
  box(-7,-29,3,3,ink);box(1,-29,3,3,ink);box(0,-24,10,3,"#efa04f");box(-3,-9,3,3,ink);box(-3,-1,3,3,ink);
 }else if(o.kind==="logpile"){
  for(let j=0;j<5;j++){const dx=-16+(j%3)*12,dy=3-Math.floor(j/3)*11;box(dx,dy-7,21,12,"#76543e");ball(dx,dy,6,6,"#d1ae79");ball(dx,dy,2,2,"#9d774e");}
  if(winter)box(-20,-17,43,5,"#f6ffff");
 }else if(o.kind==="terrace"){
  for(const dx of [-24,19]){box(dx,-2,9,12,"#426f6a");box(dx,-8,9,6,"#76a995");}
  box(-2,-9,4,22,ink);ball(0,-10,18,11,"#c07d51");ball(0,-12,16,9,"#f4d397");
  ball(-5,-13,4,3,"#fff8db");box(5,-17,4,6,"#af6b4d");
  if(o.variant%2){box(-2,-49,3,37,ink);c.beginPath();c.moveTo(x-30,y-42);c.quadraticCurveTo(x,y-74,x+30,y-42);c.closePath();c.fillStyle="#ec9a56";c.fill();box(-5,-58,10,16,"#ffefb7");}
 }else if(o.kind==="bicycle"){
  for(const dx of [-15,16]){ball(dx,2,10,10,ink);ball(dx,2,7,7,"#d8d7b5");}
  c.strokeStyle="#b65a50";c.lineWidth=3;c.beginPath();c.moveTo(x-15,y+2);c.lineTo(x-5,y-13);c.lineTo(x+6,y+2);c.closePath();c.moveTo(x-5,y-13);c.lineTo(x+12,y-13);c.lineTo(x+16,y+2);c.stroke();box(-10,-17,11,3,ink);box(9,-23,3,12,ink);box(9,-25,9,3,ink);
 }else if(o.kind==="signpost"){
  box(-3,-36,6,47,"#896344");box(-23,-39,45,15,"#694c3a");box(-20,-37,39,10,"#f3ce8c");box(-14,-32,23,2,"#90684c");box(4,-34,3,6,"#90684c");
 }else if(o.kind==="lantern"){
  ball(0,4,17,9,"#ffc87525");box(-3,-39,6,49,ink);box(-12,-50,24,19,ink);box(-8,-47,16,12,"#ffe09b");box(-1,-47,3,12,"#fff7da");box(-15,-54,30,5,ink);
  if(winter)box(-13,-57,26,4,"#f5ffff");
 }else if(o.kind==="fruitstall"){
  box(-25,-9,50,21,"#986642");box(-22,-6,44,13,"#d4a569");
  for(let j=0;j<12;j++)ball(-18+(j%6)*7,-10-Math.floor(j/6)*6,4,4,j%3?"#f7b441":"#d8694f");
  box(-25,-44,4,37,ink);box(21,-44,4,37,ink);
  for(let j=0;j<6;j++)box(-29+j*10,-45,10,13,j%2?"#fff0bd":"#c96055");
 }else if(o.kind==="fountain"){
  ball(0,4,28,17,"#8c8976");ball(0,0,27,16,"#f2d8a8");ball(0,-1,22,12,winter?"#a7d8e5":"#4db9ac");box(-4,-29,8,28,"#d6ba8b");ball(0,-24,13,6,"#f6dfb3");box(-2,-37,4,12,"#a2e9df");
 }else if(o.kind==="lounger"){
  box(-12,-22,24,35,"#956c4b");for(let j=0;j<4;j++)box(-9+j*5,-20,5,30,j%2?"#fff4c9":"#e28768");box(-14,8,4,10,ink);box(10,8,4,10,ink);
 }else if(o.kind==="boat"){
  ball(0,-4,15,31,"#8b674d");ball(0,-6,11,26,"#e5c082");box(-9,-12,18,6,"#776351");box(-2,-33,3,45,"#c47c58");
 }else if(o.kind==="fence"){
  for(let j=-23;j<25;j+=15)box(j,-23,5,32,"#7e6349");box(-24,-19,50,5,"#ba9661");box(-24,-5,50,5,"#ba9661");
 }else if(o.kind==="garden"){
  box(-22,-15,44,30,"#967453");for(let j=0;j<4;j++){box(-18,-12+j*7,36,3,"#6f583e");for(let i=0;i<5;i++)ball(-15+i*7,-12+j*7,3,3,j%2?"#80b957":"#dc8465");}
 }
 return true;
}
function artObject(c,o){
 if(regionalProp(c,o))return;
 const x=o.x*T+24,y=o.y*T+24,b=o.biome,p=paints[b],h=R(o.x,o.y,7);
 if(o.kind==="tree"){
  const leaves=b===B.WINTER?["#789b98","#a8c1be","#d0e0d9","#f5f7ed"]:
   b===B.SPRING?["#5f8d67","#96b77c","#e9a7b4","#f5d4d0"]:
   b===B.AUTUMN?["#865943","#b66e41","#df9b53","#f1c271"]:
   ["#416d55","#679961","#92b674","#c3d188"];
  c.fillStyle="#345b4330";c.beginPath();c.ellipse(x+10,y+8,35,13,0,0,Math.PI*2);c.fill();
  rect(c,x-7,y-30,14,42,"#574734");rect(c,x-3,y-27,6,34,"#a67a4a");
  const lush=b===B.SUMMER||b===B.COAST;
  const tones=lush?["#285e47","#328051","#4aab54","#79c75d"]:leaves;
  for(const [ox,oy,rx,ry,i] of [[0,-33,34,28,0],[-17,-46,25,27,1],[15,-49,26,28,1],[0,-67,28,29,2],[-9,-77,18,18,3]]){
   c.fillStyle=tones[i];c.beginPath();
   for(let j=0;j<16;j++){
    const angle=j*Math.PI/8,r=j%2?.91:1;
    const px=x+ox+Math.cos(angle)*rx*r,py=y+oy+Math.sin(angle)*ry*r;
    if(!j)c.moveTo(px,py);else c.lineTo(px,py);
   }c.closePath();c.fill();
  }
  for(let j=0;j<8;j++)rect(c,x-22+R(o.x,o.y,j+21)*43,y-70+R(o.x,o.y,j+44)*34,5,4,tones[2+j%2]);
 }else if(o.kind==="palm"){
  rect(c,x-3,y-15,7,34,"#947148");
  for(let j=0;j<7;j++){
   const a=j*Math.PI*2/7;c.strokeStyle=j%2?"#78b76f":"#508d5b";c.lineWidth=10;c.beginPath();
   c.moveTo(x,y-18);c.lineTo(x+Math.cos(a)*32,y-18+Math.sin(a)*25);c.stroke();
  }c.lineWidth=1;
 }else if(o.kind==="bush"){
  rect(c,x-20,y-8,32,18,p.d);rect(c,x-13,y-22,29,25,p.b);rect(c,x-6,y-16,20,12,p.c);
 }else if(o.kind==="flowers"){
  for(let j=0;j<7;j++){
   const xx=x-18+(R(o.x,o.y,j+20)*36|0),yy=y-13+(R(o.x,o.y,j+34)*28|0);
   rect(c,xx,yy,4,8,"#6b9c62");rect(c,xx-2,yy-4,8,5,b===B.SPRING?"#eeb4bd":b===B.WINTER?"#f8f9f2":j%2?"#edcc77":"#e7a8a1");
  }
 }else if(o.kind==="stone"){rect(c,x-12,y-7,29,14,"#868e83");rect(c,x-7,y-14,21,9,"#c0c1ad");}
 else if(o.kind==="lamp"){rect(c,x-3,y-31,6,40,"#665b4a");rect(c,x-9,y-40,18,14,"#f0d69f");rect(c,x-11,y-42,22,4,"#655344");}
 else if(o.kind==="bench"){rect(c,x-19,y-16,38,6,"#a57353");rect(c,x-19,y-7,38,6,"#b68a60");rect(c,x-14,y,5,9,"#756250");}
 else if(o.kind==="umbrella"){rect(c,x-2,y-8,5,23,"#86694d");rect(c,x-20,y-18,40,15,h>.5?"#db816c":"#d0bd75");rect(c,x-9,y-18,17,15,"#f8ebd6");}
 else if(o.kind==="shell"){rect(c,x-7,y-4,16,8,"#f6e7c8");}
 else if(o.kind==="ripple"){rect(c,x-15,y-4,30,3,"#b4e3db");}
}
function artBuilding(c,b){
 const x=b.x*T,y=b.y*T,W=b.w*T,H=b.h*T,p=paints[b.biome],roof=p.roof;
 function ellipse(cx,cy,rx,ry,fill){
  c.beginPath();c.ellipse(cx,cy,rx,ry,0,0,2*Math.PI);c.fillStyle=fill;c.fill();
 }
 if(b.kind==="roman"){
  ellipse(x+W/2,y+H/2,W*.48,H*.46,"#a68262");ellipse(x+W/2,y+H/2,W*.40,H*.37,"#e6caa4");
  ellipse(x+W/2,y+H/2,W*.29,H*.25,"#957659");ellipse(x+W/2,y+H/2,W*.18,H*.15,"#ccb18a");
  for(let j=0;j<20;j++){const a=j*Math.PI/10;rect(c,x+W/2+Math.cos(a)*W*.42-7,y+H/2+Math.sin(a)*H*.38-5,15,10,"#f2ddbd");}return;
 }
 if(b.kind==="pisa"){
  for(let r=Math.min(W,H)*.43;r>16;r-=17)ellipse(x+W/2,y+H/2,r,r*.87,r%2?"#d8c09f":"#a68d70");
  rect(c,x+W/2-10,y+H/2-10,20,20,"#6a8a8c");return;
 }
 if(b.kind==="clock"){
  const cx=x+W/2,cy=y+H/2;
  // A garden square with a compact clock tower rather than an oversized dial.
  ellipse(cx,cy,W*.42,H*.40,"#bd8969");ellipse(cx,cy,W*.39,H*.37,"#f3d5a2");
  for(let j=0;j<12;j++){
   const a=j*Math.PI/6,px=cx+Math.cos(a)*W*.32,py=cy+Math.sin(a)*H*.3;
   ellipse(px,py,18,13,"#4e915e");ellipse(px-3,py-4,12,9,"#8bc86b");
  }
  rect(c,cx-38,cy-52,76,116,"#493b38");rect(c,cx-32,cy-48,64,105,"#dea578");
  rect(c,cx-24,cy+20,48,37,"#9d7356");rect(c,cx-42,cy+55,84,10,"#f3cf96");
  c.beginPath();c.moveTo(cx-48,cy-48);c.lineTo(cx,cy-91);c.lineTo(cx+48,cy-48);c.closePath();c.fillStyle="#326d67";c.fill();
  ellipse(cx,cy-14,25,25,"#574637");ellipse(cx,cy-14,21,21,"#fff0c8");
  c.strokeStyle="#605647";c.lineWidth=3;c.beginPath();c.moveTo(cx,cy-29);c.lineTo(cx,cy-14);c.lineTo(cx+12,cy-8);c.stroke();c.lineWidth=1;return;
 }
 if(b.kind==="greenhouse"){
  rect(c,x+4,y+4,W-8,H-8,"#83b3b1");for(let xx=9;xx<W;xx+=23)rect(c,x+xx,y+6,4,H-12,"#e2ead7");
  for(let yy=8;yy<H;yy+=23)rect(c,x+6,y+yy,W-12,3,"#edf1de");return;
 }
 // A readable three-quarter facade, with hand-drawn outlines and tiled roofs.
 const ink="#493b38",commercial=["cafe","restaurant","shop","bakery","market"].includes(b.kind);
 const variant=Math.floor(R(b.x,b.y,112)*3);
 const roofs=[roof,["#27645f","#37877c","#70b4a1"],["#9b4549","#c36262","#ea9c85"]][variant];
 const wall=["#f4c786","#edac7d","#dfb8a0"][Math.floor(R(b.x,b.y,113)*3)];
 const roofH=Math.floor(H*.59),front=y+roofH;
 rect(c,x+13,y+14,W,H-9,"#35483b40");
 rect(c,x,y,W,H,ink);rect(c,x+5,front,W-10,H-roofH-5,wall);
 rect(c,x+8,front+5,W-16,9,"#bd7f60");
 for(let xx=x+13;xx<x+W-14;xx+=W/3){
  rect(c,xx,front+15,6,H-roofH-20,"#785640");
 }
 // Deep window frames, glass reflections and wooden shutters.
 for(let xx=x+18;xx<x+W-30;xx+=52){
  rect(c,xx,front+21,32,29,ink);rect(c,xx+4,front+25,24,21,"#6eb5aa");
  rect(c,xx+6,front+26,4,18,"#d4f0d4");rect(c,xx+16,front+25,3,21,"#fff0c2");
  rect(c,xx-5,front+23,5,25,"#53745e");rect(c,xx+32,front+23,5,25,"#53745e");
  rect(c,xx-2,front+49,36,4,"#825e45");
 }
 const d=b.door?Math.max(x+24,Math.min(x+W-26,b.door.x*T+T/2)):x+W/2;
 rect(c,d-17,y+H-48,34,48,ink);rect(c,d-12,y+H-43,24,40,"#426d60");
 rect(c,d-8,y+H-38,16,17,"#95cfb8");rect(c,d+6,y+H-18,4,4,"#ffd980");
 // Steps stay within the building footprint, so paths remain visually clear.
 rect(c,d-23,y+H-7,46,5,"#e5cf9b");
 rect(c,x-4,y-3,W+8,roofH+6,ink);rect(c,x,y,W,roofH,roofs[0]);
 rect(c,x+5,y+5,W-10,roofH*.45,roofs[1]);
 for(let row=0;row<roofH-6;row+=11){
  rect(c,x+3,y+row+7,W-6,2,roofs[0]);
  for(let col=0;col<W-8;col+=17){
   const px=x+5+col+(Math.floor(row/11)%2)*8;
   if(px<x+W-6){rect(c,px,y+row+1,2,8,roofs[2]);rect(c,px+3,y+row+2,9,2,roofs[1]);}
  }
 }
 rect(c,x-5,y+roofH-5,W+10,8,ink);rect(c,x-3,y+roofH-5,W+6,3,roofs[2]);
 rect(c,x-3,y-3,W+6,7,roofs[2]);
 // Roof chimney and little dormer.
 rect(c,x+W*.73,y+9,18,28,ink);rect(c,x+W*.73+3,y+11,12,24,"#bd8667");
 rect(c,x+W*.73-3,y+7,24,6,"#f1c197");
 if(W>150){
  const dx=x+W*.4,dy=y+roofH*.35;
  c.beginPath();c.moveTo(dx-19,dy+23);c.lineTo(dx,dy-9);c.lineTo(dx+19,dy+23);c.closePath();c.fillStyle=ink;c.fill();
  rect(c,dx-12,dy+11,24,19,"#f4d39d");rect(c,dx-7,dy+13,14,15,"#73a7a2");
 }
 if(commercial){
  const awning=b.kind==="bakery"?"#e69c48":b.kind==="cafe"?"#d45e57":"#529787";
  const ay=front+14;
  rect(c,x+8,ay-2,W-16,18,ink);
  for(let j=0;j<W-21;j+=13)rect(c,x+11+j,ay,Math.min(13,W-21-j),15,Math.floor(j/13)%2?"#fff0c4":awning);
  const labels={cafe:"CAFÉ",bakery:"BAKERY",shop:"SHOP",market:"MARKET",restaurant:"BISTRO"};
  rect(c,x+W/2-33,front-17,66,20,ink);rect(c,x+W/2-30,front-15,60,16,"#ffe1a0");
  c.fillStyle=ink;c.font="bold 10px monospace";c.textAlign="center";c.fillText(labels[b.kind],x+W/2,front-3);c.textAlign="start";
 }
 // Terracotta planters and flowers at the entrance.
 for(const px of [x+12,x+W-23]){
  rect(c,px,y+H-20,13,16,"#a65e44");rect(c,px-2,y+H-23,17,5,"#e69a6b");
  rect(c,px-2,y+H-32,17,11,"#438754");rect(c,px+3,y+H-37,8,9,"#81ba58");
  rect(c,px+1,y+H-30,4,4,"#ffd679");
 }
 // Regional architecture and small roof/facade details.
 for(let j=0;j<8;j++){
  const bx=x+10+R(b.x,b.y,j+240)*(W-25),by=front+25+R(b.x,b.y,j+250)*Math.max(1,H-roofH-32);
  rect(c,bx,by,9,2,"#c58c6c");rect(c,bx+6,by+3,4,2,"#f8d8a4");
 }
 if(b.biome===B.WINTER){
  for(let j=0;j<W-8;j+=23){
   rect(c,x+3+j,y+3,Math.min(25,W-6-j),7+j%5,"#f7ffff");
   rect(c,x+j,y+roofH-7,Math.min(26,W-j),7,"#f7ffff");
   rect(c,x+6+j,y+roofH,3,8+j%11,"#c7e9ef");
  }
  for(let j=0;j<3;j++)oval(c,x+W*.73+12+j*5,y-4-j*12,7+j*3,6+j*2,"#e7eff077");
  rect(c,x+7,front+18,7,22,"#a96358");rect(c,x+W-14,front+18,7,22,"#a96358");
 }else if(b.biome===B.SUMMER||b.biome===B.COAST){
  // Iron balconies, ceramic borders, rooftop laundry and sun-warmed plaster.
  for(let xx=x+20;xx<x+W-28;xx+=52){
   rect(c,xx-4,front+47,40,3,"#524c43");rect(c,xx-4,front+38,40,2,"#524c43");
   for(let j=0;j<5;j++)rect(c,xx-3+j*9,front+39,2,8,"#524c43");
  }
  for(let j=0;j<W-16;j+=10)rect(c,x+8+j,y+H-11,7,5,j%20?"#368c99":"#f4d16f");
  rect(c,x+14,y+roofH*.26,Math.min(W-28,80),2,"#634e48");
  for(let j=0;j<4;j++)rect(c,x+20+j*17,y+roofH*.26+2,11,13+j%2*5,["#ffe8aa","#c86e68","#93c8b1","#faf1db"][j]);
 }

}
const maxCh=Math.ceil(w.N/CH),CACHE_LIMIT=24,cache=new Map(),byChunk=new Map();
function index(type,id,x0,y0,x1,y1){
 const loX=Math.max(0,Math.floor(x0/CP)),loY=Math.max(0,Math.floor(y0/CP));
 const hiX=Math.min(maxCh-1,Math.floor(x1/CP)),hiY=Math.min(maxCh-1,Math.floor(y1/CP));
 for(let cy=loY;cy<=hiY;cy++)for(let cx=loX;cx<=hiX;cx++){
  const key=cx+"-"+cy;
  let group=byChunk.get(key);if(!group){group={objects:[],buildings:[]};byChunk.set(key,group);}
  group[type].push(id);
 }
}
w.objects.forEach((o,i)=>index("objects",i,o.x*T-75,o.y*T-90,o.x*T+110,o.y*T+90));
w.buildings.forEach((b,i)=>index("buildings",i,b.x*T-30,b.y*T-35,(b.x+b.w)*T+40,(b.y+b.h)*T+45));
function chunk(cx,cy){
 const key=cx+"-"+cy;if(cache.has(key)){const c=cache.get(key);cache.delete(key);cache.set(key,c);return c;}
 const can=document.createElement("canvas");can.width=CP;can.height=CP;
 const c=can.getContext("2d",{alpha:false});c.imageSmoothingEnabled=false;c.translate(-cx*CP,-cy*CP);
 for(let y=cy*CH;y<Math.min(w.N,(cy+1)*CH);y++)for(let x=cx*CH;x<Math.min(w.N,(cx+1)*CH);x++)artTile(c,x,y);
 const g=byChunk.get(key);
 if(g){for(const i of g.objects)artObject(c,w.objects[i]);for(const i of g.buildings)artBuilding(c,w.buildings[i]);}
 cache.set(key,can);if(cache.size>CACHE_LIMIT)cache.delete(cache.keys().next().value);
 return can;
}
const camera={x:w.initial.x*T+24,y:w.initial.y*T+24,zoom:.85,rotation:0},screen={w:0,h:0,dpr:1};
let dirty=true,paused=false;
function resize(){
 const r=stage.getBoundingClientRect();if(r.width<40||r.height<40)return false;
 const dpr=Math.min(2,window.devicePixelRatio||1),pw=Math.round(r.width*dpr),ph=Math.round(r.height*dpr);
 if(ground.width===pw&&ground.height===ph)return false;
 ground.width=people.width=pw;ground.height=people.height=ph;
 screen.w=r.width;screen.h=r.height;screen.dpr=dpr;dirty=true;return true;
}
function setup(c){
 c.setTransform(screen.dpr,0,0,screen.dpr,0,0);
 c.translate(screen.w/2,screen.h/2);c.rotate(camera.rotation);c.scale(camera.zoom,camera.zoom);
 c.translate(-camera.x,-camera.y);c.imageSmoothingEnabled=false;
}
function worldAt(x,y){
 const dx=(x-screen.w/2)/camera.zoom,dy=(y-screen.h/2)/camera.zoom;
 const c=Math.cos(camera.rotation),s=Math.sin(camera.rotation);
 return{x:camera.x+dx*c+dy*s,y:camera.y-dx*s+dy*c};
}
function keepAt(world,x,y,zoom=camera.zoom,rotation=camera.rotation){
 camera.zoom=Math.max(.045,Math.min(2.4,zoom));camera.rotation=rotation;
 const dx=(x-screen.w/2)/camera.zoom,dy=(y-screen.h/2)/camera.zoom;
 const c=Math.cos(rotation),s=Math.sin(rotation);
 camera.x=Math.max(0,Math.min(S,world.x-dx*c-dy*s));
 camera.y=Math.max(0,Math.min(S,world.y+dx*s-dy*c));dirty=true;
}
function visibleRadius(){return Math.hypot(screen.w,screen.h)/camera.zoom*.55;}
let overview=null;
function overviewArt(){
 if(overview)return overview;
 overview=document.createElement("canvas");overview.width=1280;overview.height=1280;
 const c=overview.getContext("2d",{alpha:false}),unit=4;
 for(let y=0;y<w.N;y++)for(let x=0;x<w.N;x++){
  const k=w.coord(x,y),b=w.biomes[k],t=w.terrain[k],p=paints[b];
  const col=t===TT.WATER?"#519cac":t===TT.RIVER?"#76b2bb":
   t===TT.SAND?"#e9d09d":t===TT.PLAZA?"#d3b99d":
   t===TT.ROAD||t===TT.PATH?"#ddc9a8":
   t===TT.PARK?p.c:t===TT.BRIDGE?"#ac8b68":p.a;
  rect(c,x*unit,y*unit,unit,unit,col);
 }
 for(const b of w.buildings){
  const roof=paints[b.biome].roof[0];
  rect(c,b.x*unit,b.y*unit,b.w*unit,b.h*unit,roof);
  rect(c,b.x*unit+2,b.y*unit+2,Math.max(1,b.w*unit-4),Math.max(1,b.h*unit-4),paints[b.biome].roof[1]);
 }
 for(const o of w.objects){
  if(o.kind!=="tree"&&o.kind!=="palm")continue;
  rect(c,o.x*unit,o.y*unit,4,4,paints[o.biome].d);
 }
 return overview;
}
function draw(){
 if(!screen.w||!screen.h)return;
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#569cac";ctx.fillRect(0,0,ground.width,ground.height);setup(ctx);
 const radius=visibleRadius();
 if(camera.zoom<.2){
  ctx.drawImage(overviewArt(),0,0,S,S);
 }else{
  const minX=Math.max(0,Math.floor((camera.x-radius)/CP)),maxX=Math.min(maxCh-1,Math.floor((camera.x+radius)/CP));
  const minY=Math.max(0,Math.floor((camera.y-radius)/CP)),maxY=Math.min(maxCh-1,Math.floor((camera.y+radius)/CP));
  for(let cy=minY;cy<=maxY;cy++)for(let cx=minX;cx<=maxX;cx++)ctx.drawImage(chunk(cx,cy),cx*CP,cy*CP);
 }
 for(const l of w.landmarks){
  const x=(l.x+l.w/2)*T,y=(l.y+l.h/2)*T;if(Math.hypot(x-camera.x,y-camera.y)>radius+140)continue;
  ctx.fillStyle="#fff2d8";ctx.strokeStyle="#725d49";ctx.lineWidth=7;
  ctx.beginPath();ctx.arc(x,y,25,0,2*Math.PI);ctx.fill();ctx.stroke();ctx.lineWidth=1;
  rect(ctx,x-8,y-8,16,16,"#bb7865");
 }
 dirty=false;
}
function actorSprite(c,x,y,color="#be765c",skin="#e2b48a",hair="#5a4439",phase=0,isPlayer=false,flip=1){
 c.save();c.translate(x,y);c.scale(flip,1);
 rect(c,-11,15,23,6,"#59675c");rect(c,-9,-6,18,19,color);
 rect(c,-8,-21,16,16,skin);rect(c,-9,-26,18,8,hair);
 rect(c,-12,-1,4,13,color);rect(c,8,-1,4,13,color);
 rect(c,-7+(phase?3:-2),12,6,12,"#495962");rect(c,2-(phase?3:-2),12,6,12,"#3f545c");
 rect(c,-4,-16,2,3,"#423d3c");rect(c,4,-16,2,3,"#423d3c");
 if(isPlayer){rect(c,-10,-31,20,6,"#efd596");rect(c,-6,-35,13,5,"#a76b55");}
 c.restore();
}
function actors(player,npcs,now){
 if(!screen.w||!screen.h)return;
 actx.setTransform(1,0,0,1,0,0);actx.clearRect(0,0,people.width,people.height);setup(actx);
 const radius=visibleRadius()+60;
 for(const n of npcs){
  if(Math.abs(n.x-camera.x)>radius||Math.abs(n.y-camera.y)>radius)continue;
  actorSprite(actx,n.x,n.y,n.shirt,n.skin,n.hair,n.dest&&n.pause<=0&&Math.sin(now*.013+n.id)>0,false,n.direction||1);
 }
 actorSprite(actx,player.x,player.y,"#c2775f","#e6b795","#4b3933",Math.sin(now*.012)>0,true,player.direction||1);
 if(player.path&&player.path.length){
  const goal=player.path[player.path.length-1];
  actx.strokeStyle="#fff5d5";actx.lineWidth=6;actx.beginPath();
  actx.arc(goal.x*T+24,goal.y*T+24,20,0,2*Math.PI);actx.stroke();
 }
 const bx=Math.max(0,Math.min(w.N-1,Math.floor(camera.x/T))),by=Math.max(0,Math.min(w.N-1,Math.floor(camera.y/T)));
 if(w.biomes[w.coord(bx,by)]===B.WINTER){
  actx.setTransform(screen.dpr,0,0,screen.dpr,0,0);
  for(let j=0;j<55;j++){
   const sx=(R(j,3,301)*screen.w+Math.sin(now*.0004+j)*18+screen.w)%screen.w;
   const sy=(R(j,4,302)*screen.h+now*(.015+R(j,5,303)*.02))%screen.h;
   rect(actx,sx,sy,j%3===0?3:2,j%3===0?3:2,"#ffffffc9");
  }
 }

}
function room(canvas,b,playerX,playerY){
 const c=canvas.getContext("2d");if(!c||!canvas.width)return;
 const W=canvas.width,H=canvas.height,scale=Math.min(W/800,H/750),ox=(W-800*scale)/2,oy=(H-750*scale)/2;
 c.setTransform(1,0,0,1,0,0);c.fillStyle="#3b514a";c.fillRect(0,0,W,H);
 c.translate(ox,oy);c.scale(scale,scale);c.imageSmoothingEnabled=false;
 rect(c,32,28,736,690,"#9c7759");rect(c,51,47,698,650,"#e4c9a1");
 for(let y=55;y<695;y+=28){rect(c,52,y,695,3,"#c99e73");for(let x=62+((y/28|0)%2)*25;x<740;x+=70)rect(c,x,y,3,26,"#be926c")}
 rect(c,144,152,510,410,"#e9debb");rect(c,163,169,472,378,"#ccba95");
 for(let x=176;x<630;x+=48)rect(c,x,170,4,372,"#e6d3a2");
 const commercial=["cafe","restaurant","shop","bakery","market"].includes(b.kind);
 if(commercial){
  rect(c,98,94,610,128,"#8d6e55");rect(c,112,109,579,94,"#be9568");
  for(let j=0;j<7;j++){rect(c,130+j*78,133,55,35,j%2?"#acc0a3":"#e1c093");rect(c,142+j*78,140,23,16,"#ebdfbc")}
  for(const [x,y] of [[224,359],[510,340],[373,472]]){
   rect(c,x-56,y-39,112,78,"#896d56");rect(c,x-45,y-30,90,60,"#ddbb8d");
   rect(c,x-76,y-19,18,43,"#678d7e");rect(c,x+58,y-19,18,43,"#678d7e");
  }
 }else{
  rect(c,120,106,230,131,"#6d8a82");rect(c,139,123,191,110,"#e2e4d3");rect(c,149,129,80,42,"#faf0d9");
  rect(c,430,120,204,121,"#926f55");rect(c,444,134,175,96,"#b9966d");
  for(const [x,y] of [[265,402],[499,440]]){rect(c,x-58,y-38,118,72,"#886c55");rect(c,x-47,y-27,94,51,"#e2c196")}
  rect(c,91,482,117,158,"#8fae8a");
 }
 for(const [x,y] of [[90,96],[683,98],[680,614]]){
  rect(c,x-20,y+9,43,28,"#b47d51");rect(c,x-29,y-18,60,34,"#5f8a5f");rect(c,x-14,y-39,31,27,"#a0c08d");
 }
 rect(c,382,684,90,20,"#745c49");
 actorSprite(c,playerX*800,playerY*750,"#bc765d","#e6b795","#493730",1,true);
}
window.LWRenderer={w,stage,shell,ground,people,camera,screen,resize,worldAt,keepAt,
 draw,actors,room,actorSprite,visibleRadius,dirty:()=>dirty,markDirty:()=>{dirty=true},getCacheSize:()=>cache.size,
 initialZoom:.85,sceneNodes:()=>({canvasCount:2,cacheSize:cache.size,buildings:w.buildings.length})};
})();