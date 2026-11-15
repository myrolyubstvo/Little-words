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
 {a:"#aec77c",b:"#83a96b",c:"#d4df9a",d:"#598355",roof:["#b36e51","#d18f65","#e8b689"]},
 {a:"#bdd69e",b:"#86ad7b",c:"#d6e5b0",d:"#719a79",roof:["#b47d86","#d5a0a3","#ebc4b7"]},
 {a:"#c9b184",b:"#aa925f",c:"#e6cb91",d:"#8b7248",roof:["#985e45","#c88a55","#e5b16f"]},
 {a:"#d8e6e2",b:"#acbfbb",c:"#f2f8f0",d:"#8ea9a5",roof:["#69858f","#9eb9bc","#d1dfe0"]},
 {a:"#c8c599",b:"#a4b584",c:"#e5dbb2",d:"#7e9870",roof:["#718c94","#bc795d","#dfaa7b"]}
];
const R=(x,y,z=0)=>w.hash(x,y,z);
function rect(c,x,y,ww,hh,fill){c.fillStyle=fill;c.fillRect(Math.round(x),Math.round(y),Math.ceil(ww),Math.ceil(hh))}
function artTile(c,x,y){
 const k=w.coord(x,y),b=w.biomes[k],t=w.terrain[k],p=paints[b],xx=x*T,yy=y*T;
 const h=R(x,y,8);let fill=p.a;
 if(t===TT.WATER)fill="#519cac";
 else if(t===TT.RIVER)fill="#76b2bb";
 else if(t===TT.SAND)fill="#e9d09d";
 else if(t===TT.BRIDGE)fill="#ac8b68";
 else if(t===TT.ROAD||t===TT.PATH)fill=b===B.WINTER?"#d3d7cd":"#decbb0";
 else if(t===TT.PLAZA)fill="#d3b99d";
 else if(t===TT.PARK)fill=p.c;
 rect(c,xx,yy,T,T,fill);
 if(t===TT.WATER||t===TT.RIVER){
  rect(c,xx+8+(h*15|0),yy+12,19,3,"#a9d4d5");rect(c,xx+3,yy+31,13,2,"#8ac3c9");
  if(t===TT.WATER&&x>0&&w.terrain[k-1]!==TT.WATER)rect(c,xx,yy,5,48,"#f0dfb8");
 }else if(t===TT.ROAD||t===TT.PLAZA||t===TT.PATH){
  for(let j=0;j<4;j++)for(let i=0;i<3;i++){
   const ax=xx+((i*16+j%2*8)%T),ay=yy+j*12;
   rect(c,ax,ay+10,13,1,"#ad9b84");rect(c,ax+12,ay,1,10,"#c8b396");
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
}
function artObject(c,o){
 const x=o.x*T+24,y=o.y*T+24,b=o.biome,p=paints[b],h=R(o.x,o.y,7);
 if(o.kind==="tree"){
  const leaves=b===B.WINTER?["#789b98","#a8c1be","#d0e0d9","#f5f7ed"]:
   b===B.SPRING?["#5f8d67","#96b77c","#e9a7b4","#f5d4d0"]:
   b===B.AUTUMN?["#865943","#b66e41","#df9b53","#f1c271"]:
   ["#416d55","#679961","#92b674","#c3d188"];
  rect(c,x-6,y-25,12,35,"#755840");
  for(const [ox,oy,ww,hh,i] of [[-25,-47,27,30,0],[-4,-61,31,31,1],[13,-46,27,31,0],[-22,-29,30,25,2],[0,-37,26,27,1],[-7,-72,20,19,3]])
   rect(c,x+ox,y+oy,ww,hh,leaves[i]);
  for(let j=0;j<10;j++)rect(c,x-25+(R(o.x,o.y,j+21)*55|0),y-65+(R(o.x,o.y,j+44)*43|0),6,5,leaves[(j+o.variant)%4]);
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
  const radius=Math.min(W,H)*.28;
  rect(c,x+22,y+22,W-44,H-44,"#b7916c");
  ellipse(x+W/2,y+H/2,radius,radius,"#f6e7c8");
  c.strokeStyle="#605647";c.lineWidth=6;c.beginPath();c.moveTo(x+W/2,y+H/2);c.lineTo(x+W/2,y+H/2-radius*.65);
  c.moveTo(x+W/2,y+H/2);c.lineTo(x+W/2+radius*.55,y+H/2+radius*.15);c.stroke();c.lineWidth=1;return;
 }
 if(b.kind==="greenhouse"){
  rect(c,x+4,y+4,W-8,H-8,"#83b3b1");for(let xx=9;xx<W;xx+=23)rect(c,x+xx,y+6,4,H-12,"#e2ead7");
  for(let yy=8;yy<H;yy+=23)rect(c,x+6,y+yy,W-12,3,"#edf1de");return;
 }
 rect(c,x+10,y+12,W-7,H,"#586455");rect(c,x,y,W,H-18,"#c5a98c");
 rect(c,x+5,y+4,W-10,H-28,roof[0]);
 rect(c,x+15,y+13,W-30,H-49,roof[1]);
 rect(c,x+W/2-3,y+12,6,H-46,roof[2]);
 for(let yy=y+18;yy<y+H-29;yy+=12)for(let xx=x+9;xx<x+W-10;xx+=18)
  rect(c,xx+((yy/12|0)%2)*5,yy,13,4,((xx/18|0)%2)?roof[0]:roof[2]);
 for(let xx=x+24;xx<x+W-22;xx+=73){rect(c,xx,y+21,24,22,"#e5daca");rect(c,xx+4,y+25,17,14,"#72909e");}
 rect(c,x+W*.22,y+17,16,19,"#8e674e");rect(c,x+W*.22-4,y+12,24,7,"#e6b38a");
 rect(c,x+6,y+H-23,W-12,19,"#e9d9bd");
 for(let xx=x+14;xx<x+W-15;xx+=27)rect(c,xx,y+H-20,14,13,"#769095");
 const d=b.door?Math.max(x+12,Math.min(x+W-30,b.door.x*T+T/2)):x+W/2;
 rect(c,d-9,y+H-23,18,23,"#806048");
 if(["cafe","restaurant","shop","bakery","market"].includes(b.kind)){
  const color=b.kind==="cafe"?"#c67662":b.kind==="bakery"?"#d5a064":b.kind==="restaurant"?"#7e9b83":"#a78192";
  for(let xx=x+7;xx<x+W-9;xx+=22)rect(c,xx,y+H-26,20,15,((xx/22|0)%2)?color:"#fff1d8");
  rect(c,x+16,y+H+5,24,8,"#c79566");rect(c,x+21,y+H+1,15,6,"#eee2be");
 }
 if(b.biome===B.WINTER)rect(c,x+4,y+3,W-8,7,"#f6faf0");
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
const camera={x:w.initial.x*T+24,y:w.initial.y*T+24,zoom:.52,rotation:0},screen={w:0,h:0,dpr:1};
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
  actorSprite(actx,n.x,n.y,n.shirt,n.skin,n.hair,Math.sin(now*.013+n.id)>0,false,n.direction||1);
 }
 actorSprite(actx,player.x,player.y,"#c2775f","#e6b795","#4b3933",Math.sin(now*.012)>0,true,player.direction||1);
 if(player.path&&player.path.length){
  const goal=player.path[player.path.length-1];
  actx.strokeStyle="#fff5d5";actx.lineWidth=6;actx.beginPath();
  actx.arc(goal.x*T+24,goal.y*T+24,20,0,2*Math.PI);actx.stroke();
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
 initialZoom:.52,sceneNodes:()=>({canvasCount:2,cacheSize:cache.size,buildings:w.buildings.length})};
})();