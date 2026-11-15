/* Illustrated city renderer: cached ground, local atlas artwork, and depth-sorted residents. */
(()=>{
"use strict";
const w=window.LWWorldData,A=window.LWArt,INK="#544339";
if(!w||!A)return;
const css=[
"#map-shell{width:100%;height:min(84vh,920px);min-height:540px;margin:auto;position:relative;touch-action:none;background:#7aada5;overflow:hidden}",
"#city-art{display:none!important}",
".lw-stage{position:absolute;inset:0;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}",
".lw-stage canvas{position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:none}",
".lw-stage canvas.lw-actors{pointer-events:none}",
".lw-regions{position:absolute;top:51px;left:8px;right:8px;display:flex;flex-wrap:wrap;gap:4px;pointer-events:none;z-index:2}",
".lw-regions button{pointer-events:auto;border:1px solid #b5aa88;border-radius:18px;background:#fff7e9f0;color:#425e52;font:600 11px Arial,sans-serif;padding:8px 11px;cursor:pointer}",
".lw-region-label{width:100%;font:600 10px Arial,sans-serif;color:#3d574e;text-shadow:0 1px 3px #fff;background:#fff5dfd9;padding:5px 7px;border-radius:5px;width:max-content}",
".lw-hud{position:absolute;top:8px;left:8px;display:flex;gap:5px;flex-wrap:wrap;pointer-events:none;z-index:1}",
".lw-hud span{font:600 11px/1.35 Arial,sans-serif;border-radius:8px;background:#fff9e9ea;color:#3f5147;padding:7px 9px;border:1px solid #bdad8e}",
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
,".lw-stage{background:#e7c89d}",
".lw-hud span{box-shadow:0 2px 6px #453b3020;border-color:#c6b58f;background:#fff6e5ed}",
".lw-regions button:hover,.lw-regions button[aria-pressed=true]{background:#536f61;color:#fff6e5;border-color:#435f51}",
".lw-region-label{background:#fff6e5e6;padding:7px 10px;border-radius:12px;color:#5d6856;letter-spacing:.02em}",
".lw-hint{border-radius:20px;box-shadow:0 2px 10px #453b3019}",
".lw-zoom{position:absolute;right:12px;bottom:54px;display:flex;flex-direction:column;gap:6px;z-index:3}",
".lw-zoom button{width:37px;height:37px;border:1px solid #b8a583;border-radius:50%;background:#fff7e8ed;color:#526d5c;font:22px Georgia,serif;box-shadow:0 2px 6px #453b3019}",
"@media(max-width:600px){#map-shell{height:76vh;min-height:520px}.lw-regions{top:66px}.lw-regions button{font-size:10px;padding:6px 8px}.lw-region-label{font-size:9px;padding:5px 8px}.lw-hint{font-size:9px;max-width:90%}}"
].join("");
const style=document.createElement("style");style.textContent=css;document.head.append(style);
const shell=document.getElementById("map-shell"),oldSvg=document.getElementById("city-art");oldSvg.style.display="none";
const stage=document.createElement("div");stage.className="lw-stage";stage.setAttribute("aria-label","Illustrated walkable city with sunny and snowy neighbourhoods");
const ground=document.createElement("canvas"),people=document.createElement("canvas");people.className="lw-actors";stage.append(ground,people);shell.append(stage);
const ctx=ground.getContext("2d",{alpha:false}),actx=people.getContext("2d");
if(!ctx||!actx){stage.remove();oldSvg.style.display="";return;}
const T=w.T,S=w.SIZE,TT=w.TERRAIN,B=w.B,CH=12,CP=CH*T,CACHE_LIMIT=32;
const cache=new Map(),buckets=new Map(),nodes=[];
const camera={x:w.initial.x*T+T/2,y:w.initial.y*T+T/2,zoom:window.innerWidth<600?.76:1.08,rotation:0};
const screen={w:0,h:0,dpr:1};
let dirty=true,overview=null,visibleNodes=[],viewBounds=null,assetRevision=0;
function rect(c,x,y,ww,hh,color){c.fillStyle=color;c.fillRect(x,y,ww,hh);}
function actorSprite(c,x,y,color,skin,hair,phase=0,isPlayer=false,flip=1){A.actor(c,x,y,color,skin,hair,phase,isPlayer,flip);}
function addNode(type,item,x0,y0,x1,y1,depth){
 const node={type,item,x0,y0,x1,y1,depth};nodes.push(node);
 for(let cy=Math.floor(y0/CP);cy<=Math.floor(y1/CP);cy++)for(let cx=Math.floor(x0/CP);cx<=Math.floor(x1/CP);cx++){
  const key=cx+","+cy;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(node);
 }
}
w.buildings.forEach(b=>{
 const m=A.buildingMetrics(b);
 addNode("building",b,Math.min(b.x*T-35,b.door.x*T-25),Math.min(b.y*T-100,m.base-m.height-15,b.door.y*T-25),Math.max((b.x+b.w)*T+35,b.door.x*T+60),Math.max((b.y+b.h)*T+20,b.door.y*T+60),(b.y+b.h)*T-8);
});
w.objects.forEach(o=>addNode("object",o,o.x*T-90,o.y*T-150,o.x*T+120,o.y*T+60,o.y*T+T/2));
w.landmarks.filter(l=>l.id<0).forEach(l=>addNode("scenic",l,l.x*T-70,l.y*T-180,(l.x+l.w)*T+50,(l.y+l.h)*T+20,(l.y+l.h)*T));
function resize(){
 const r=stage.getBoundingClientRect();if(r.width<40||r.height<40)return false;
 const dpr=Math.min(2,window.devicePixelRatio||1),pw=Math.round(r.width*dpr),ph=Math.round(r.height*dpr);
 if(ground.width===pw&&ground.height===ph)return false;
 ground.width=people.width=pw;ground.height=people.height=ph;screen.w=r.width;screen.h=r.height;screen.dpr=dpr;dirty=true;return true;
}
function setup(c){c.setTransform(screen.dpr,0,0,screen.dpr,0,0);c.translate(screen.w/2,screen.h/2);c.rotate(camera.rotation);c.scale(camera.zoom,camera.zoom);c.translate(-camera.x,-camera.y);c.imageSmoothingEnabled=true;c.imageSmoothingQuality="high";}
function worldAt(x,y){const dx=(x-screen.w/2)/camera.zoom,dy=(y-screen.h/2)/camera.zoom,c=Math.cos(camera.rotation),s=Math.sin(camera.rotation);return{x:camera.x+dx*c+dy*s,y:camera.y-dx*s+dy*c};}
function keepAt(world,x,y,zoom=camera.zoom,rotation=camera.rotation){
 camera.zoom=Math.max(.045,Math.min(2.4,zoom));camera.rotation=rotation;
 const dx=(x-screen.w/2)/camera.zoom,dy=(y-screen.h/2)/camera.zoom,c=Math.cos(rotation),s=Math.sin(rotation);
 camera.x=Math.max(0,Math.min(S,world.x-dx*c-dy*s));camera.y=Math.max(0,Math.min(S,world.y+dx*s-dy*c));dirty=true;
}
function bounds(){const corners=[[0,0],[screen.w,0],[0,screen.h],[screen.w,screen.h]].map(([x,y])=>worldAt(x,y));return{x0:Math.min(...corners.map(p=>p.x))-160,y0:Math.min(...corners.map(p=>p.y))-180,x1:Math.max(...corners.map(p=>p.x))+160,y1:Math.max(...corners.map(p=>p.y))+180};}
function visibleRadius(){return Math.hypot(screen.w,screen.h)/camera.zoom*.55;}
function chunk(cx,cy){
 const key=cx+","+cy;if(cache.has(key)){const can=cache.get(key);cache.delete(key);cache.set(key,can);return can;}
 const can=document.createElement("canvas");can.width=can.height=CP;
 const c=can.getContext("2d",{alpha:false});c.fillStyle="#64aaa5";c.fillRect(0,0,CP,CP);c.translate(-cx*CP,-cy*CP);
 for(let y=cy*CH;y<Math.min(w.N,(cy+1)*CH);y++)for(let x=cx*CH;x<Math.min(w.N,(cx+1)*CH);x++)A.tile(c,x,y);
 const view={x0:cx*CP,y0:cy*CP,x1:(cx+1)*CP,y1:(cy+1)*CP};
 A.riverSurface(c,view);A.roadSurface(c,view);
 for(let y=cy*CH;y<Math.min(w.N,(cy+1)*CH);y++)for(let x=cx*CH;x<Math.min(w.N,(cx+1)*CH);x++){if(w.terrain[w.coord(x,y)]===TT.BRIDGE)A.bridge(c,x,y);A.streetMarks(c,x,y);}
 // Include approaches in every intersecting chunk to prevent seams across chunk borders.
 const group=buckets.get(key)||[];
 for(const n of group)if(n.type==="building")A.decal(c,n.item);
 cache.set(key,can);if(cache.size>CACHE_LIMIT)cache.delete(cache.keys().next().value);return can;
}
function drawNode(c,n){if(n.type==="building")A.building(c,n.item);else if(n.type==="object")A.object(c,n.item);else A.scenic(c,n.item);}
function overviewArt(){
 if(overview)return overview;
 overview=document.createElement("canvas");overview.width=overview.height=w.N*10;
 const c=overview.getContext("2d",{alpha:false}),scale=overview.width/S;c.scale(scale,scale);c.imageSmoothingEnabled=true;
 for(let y=0;y<w.N;y++)for(let x=0;x<w.N;x++){if(Math.abs(w.shoreDistance[w.coord(x,y)])<1.4)A.tile(c,x,y);else{const t=w.terrain[w.coord(x,y)],under=[TT.ROAD,TT.PATH].includes(t)?w.baseTerrain[w.coord(x,y)]:t;c.fillStyle=A.groundColor(under===TT.RIVER?TT.GRASS:under,w.biomes[w.coord(x,y)]);c.fillRect(x*T,y*T,T+.5,T+.5);}}
 A.riverSurface(c);A.roadSurface(c);
 for(const b of w.buildings)A.decal(c,b);
 // Tiny ground ornaments are below a pixel here; preserve architecture and tree silhouettes.
 const silhouettes=new Set(["tree","pine","palm","bush","citrus","fountain","fruitstall","terrace"]);
 for(const n of [...nodes].sort((a,b)=>a.depth-b.depth))if(n.type!=="object"||silhouettes.has(n.item.kind))drawNode(c,n);
 return overview;
}
function draw(){
 if(!screen.w||!screen.h)return;
 ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle="#64aaa5";ctx.fillRect(0,0,ground.width,ground.height);setup(ctx);
 viewBounds=bounds();const v=viewBounds;
 if(camera.zoom<.23){ctx.drawImage(overviewArt(),0,0,S,S);visibleNodes=[];}
 else{
  const found=new Set();
  for(let cy=Math.max(0,Math.floor(v.y0/CP));cy<=Math.min(Math.ceil(w.N/CH)-1,Math.floor(v.y1/CP));cy++)for(let cx=Math.max(0,Math.floor(v.x0/CP));cx<=Math.min(Math.ceil(w.N/CH)-1,Math.floor(v.x1/CP));cx++){
   ctx.drawImage(chunk(cx,cy),cx*CP,cy*CP);for(const n of buckets.get(cx+","+cy)||[])if(n.x1>=v.x0&&n.x0<=v.x1&&n.y1>=v.y0&&n.y0<=v.y1)found.add(n);
  }
  visibleNodes=[...found].sort((a,b)=>a.depth-b.depth);
 }
 dirty=false;
}
function weather(c,now){
 const bx=Math.max(0,Math.min(w.N-1,Math.floor(camera.x/T))),by=Math.max(0,Math.min(w.N-1,Math.floor(camera.y/T))),biome=w.biomes[w.coord(bx,by)];
 c.setTransform(screen.dpr,0,0,screen.dpr,0,0);
 if(biome===B.WINTER){
  for(let j=0;j<48;j++){const sx=(w.hash(j,3,301)*screen.w+Math.sin(now*.0004+j)*18+screen.w)%screen.w,sy=(w.hash(j,4,302)*screen.h+now*(.013+w.hash(j,5,303)*.023))%screen.h;A.ellipse(c,sx,sy,j%3===0?1.8:1,j%3===0?1.8:1,"#ffffffbd");}
 }else if(biome===B.SPRING){
  for(let j=0;j<14;j++){const sx=(w.hash(j,3,311)*screen.w+now*.009+Math.sin(now*.001+j)*12)%screen.w,sy=(w.hash(j,4,312)*screen.h+now*.013)%screen.h;A.ellipse(c,sx,sy,2,1,"#ffe8e2b0");}
 }
 // Soft amber sunlight in the Mediterranean; cool, pale light in snow country.
 const glow=c.createLinearGradient(0,0,screen.w,screen.h);glow.addColorStop(0,biome===B.WINTER?"#e2effa12":"#ffe4aa12");glow.addColorStop(1,"#51483b0a");c.fillStyle=glow;c.fillRect(0,0,screen.w,screen.h);
}
function actors(player,npcs,now,animals=[]){
 if(!screen.w||!screen.h)return;
 actx.setTransform(1,0,0,1,0,0);actx.clearRect(0,0,people.width,people.height);setup(actx);
 if(camera.zoom<.23){
  for(const l of w.landmarks){const x=(l.x+l.w/2)*T,y=(l.y+l.h)*T;A.ellipse(actx,x,y,12,12,"#fff2c8",INK,3);}
  A.ellipse(actx,player.x,player.y,22,22,"#c5634e","#fff1cb",5);weather(actx,now);return;
 }
 const v=viewBounds||bounds(),moving=[];
 for(const n of npcs)if(n.x>v.x0&&n.x<v.x1&&n.y>v.y0&&n.y<v.y1)moving.push(n);
 for(const a of animals)if(a.x>v.x0&&a.x<v.x1&&a.y>v.y0&&a.y<v.y1)moving.push(a);
 moving.push({...player,isPlayer:true,id:-1,shirt:"#bd7457",skin:"#e5b990",hair:"#594333"});moving.sort((a,b)=>a.y-b.y);
 let ni=0,ai=0;
 while(ni<visibleNodes.length||ai<moving.length){
  if(ni<visibleNodes.length&&(ai>=moving.length||visibleNodes[ni].depth<=moving[ai].y)){drawNode(actx,visibleNodes[ni++]);}
  else{
   const n=moving[ai++],tx=Math.max(0,Math.min(w.N-1,Math.floor(n.x/T))),ty=Math.max(0,Math.min(w.N-1,Math.floor(n.y/T))),cold=w.biomes[w.coord(tx,ty)]===B.WINTER;
   if(n.kind){A.animal(actx,n,now);continue;}
   A.actor(actx,n.x,n.y,n.shirt,n.skin,n.hair,(n.isPlayer?player.path.length:n.dest&&n.pause<=0)&&Math.sin(now*.012+n.id)>0,n.isPlayer,n.direction||1,cold,n.id);
  }
 }
 // Small place names sit below landmarks instead of covering the artwork with pins.
 actx.textAlign="center";
 for(const l of w.landmarks){const x=(l.x+l.w/2)*T,y=(l.y+l.h)*T+19;if(x<v.x0||x>v.x1||y<v.y0||y>v.y1)continue;actx.font="600 11px Georgia,serif";const width=actx.measureText(l.name).width+20;A.rounded(actx,x-width/2,y-11,width,20,8,"#fff0d4e8","#a99268",.8);actx.fillStyle="#615341";actx.fillText(l.name,x,y+3);}
 actx.textAlign="start";
 if(player.path&&player.path.length){const goal=player.path[player.path.length-1];actx.strokeStyle="#fff5d5";actx.lineWidth=2;actx.beginPath();actx.ellipse(goal.x*T+24,goal.y*T+24,12,8,0,0,Math.PI*2);actx.stroke();}
 weather(actx,now);
}
const zoomTools=document.createElement("div");zoomTools.className="lw-zoom";
for(const [label,factor,symbol] of [["Zoom in",1.3,"+"],["Zoom out",1/1.3,"−"]]){const b=document.createElement("button");b.type="button";b.textContent=symbol;b.setAttribute("aria-label",label);b.addEventListener("click",e=>{e.stopPropagation();keepAt({x:camera.x,y:camera.y},screen.w/2,screen.h/2,camera.zoom*factor);});zoomTools.append(b);}stage.append(zoomTools);
window.addEventListener("lw-art-ready",()=>{cache.clear();overview=null;dirty=true;assetRevision++;});
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
window.LWRenderer={w,stage,shell,ground,people,camera,screen,resize,worldAt,keepAt,draw,actors,room,actorSprite,visibleRadius,
 dirty:()=>dirty,markDirty:()=>{dirty=true},getCacheSize:()=>cache.size,initialZoom:camera.zoom,
 sceneNodes:()=>({canvasCount:2,cacheSize:cache.size,buildings:w.buildings.length,artReady:A.state.ready,assetRevision}),
};
})();
