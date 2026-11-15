/* Little Worlds: walkable city gameplay, iPad gestures, NPC friendships,
   interiors, location discoveries, levels, XP and starter quests. */
(()=>{
"use strict";
const R=window.LWRenderer,W=window.LWWorldData;
if(!R||!W)return;
const T=W.T,stage=R.stage,cam=R.camera,screen=R.screen;
const hud=document.createElement("div"),levelBadge=document.createElement("span"),questBadge=document.createElement("span");
hud.className="lw-hud";hud.append(levelBadge,questBadge);stage.append(hud);
const hint=document.createElement("div");hint.className="lw-hint";
hint.textContent="Drag to explore · Pinch to zoom · Twist two fingers to rotate · Tap streets to walk";
stage.append(hint);
const pop=document.createElement("aside");pop.className="lw-pop";pop.hidden=true;
const close=document.createElement("button");close.className="lw-close";close.type="button";
close.textContent="×";close.setAttribute("aria-label","Close details");
const heading=document.createElement("h3"),desc=document.createElement("p"),buttons=document.createElement("div"),small=document.createElement("div");
buttons.className="lw-actions";small.className="lw-quest";
pop.append(close,heading,desc,buttons,small);stage.append(pop);
close.addEventListener("click",e=>{e.stopPropagation();pop.hidden=true});
const room=document.createElement("div");room.className="lw-room";room.hidden=true;
const roomHead=document.createElement("div");roomHead.className="lw-room-head";
const roomName=document.createElement("span"),exit=document.createElement("button");
exit.className="lw-room-exit";exit.type="button";exit.textContent="Return to city";
roomHead.append(roomName,exit);
const roomCanvas=document.createElement("canvas");room.append(roomHead,roomCanvas);stage.append(room);
const storageKey="lw-real-world-progress";
let progress;
try{progress=JSON.parse(localStorage.getItem(storageKey)||"null")}catch(e){}
if(!progress||typeof progress!=="object")progress={};
progress.xp=Number(progress.xp||0);progress.met=Array.isArray(progress.met)?progress.met:[];
progress.visited=Array.isArray(progress.visited)?progress.visited:[];
progress.quests=Array.isArray(progress.quests)?progress.quests:[];
function playerLevel(){return 1+Math.floor(progress.xp/100)}
const quests=[
 ["clocktower","Visit Clocktower Square"],
 ["friend","Meet a resident"],
 ["cafe","Visit a neighbourhood café"]
];
function updateHUD(){
 levelBadge.textContent="Lv "+playerLevel()+" · "+progress.xp+" XP · "+progress.met.length+" friends";
 const unfinished=quests.find(q=>!progress.quests.includes(q[0]));
 questBadge.textContent=unfinished?"Quest: "+unfinished[1]:"All starter quests complete";
}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(progress))}catch(e){}updateHUD()}
function questComplete(id){
 if(progress.quests.includes(id))return;
 progress.quests.push(id);progress.xp+=35;
 try{if(typeof state!=="undefined"&&typeof save!=="undefined"){state.points+=5;window.localStorage.setItem("lw-points",state.points);
  const points=document.getElementById("points");if(points)points.textContent=state.points;
 }}catch(e){}
 save();
}
function visit(b){
 if(!progress.visited.includes(b.name)){progress.visited.push(b.name);progress.xp+=12;}
 if(b.name==="Clocktower Square")questComplete("clocktower");
 if(b.kind==="cafe")questComplete("cafe");
 save();
}
function action(label,func,secondary=false){
 const button=document.createElement("button");button.type="button";
 if(secondary)button.className="lw-secondary";
 button.textContent=label;button.addEventListener("click",e=>{e.stopPropagation();func()});
 buttons.appendChild(button);
}
function showCard(name,description,actions=[],footer=""){
 pop.hidden=false;heading.textContent=name;desc.textContent=description;
 buttons.replaceChildren();small.textContent=footer;
 for(const a of actions)action(a[0],a[1],a[2]);
}
const player={x:W.initial.x*T+T/2,y:W.initial.y*T+T/2,path:[],speed:120,direction:1};
const npcs=[],names=["Mila","Nico","Amélie","Hugo","Lina","Theo","Freya","Felix","Ada","Sofia","Leo","Iris","Marco","Inès","Noah","Elena","Olivia","Pau"];
const clothes=["#be765d","#68939a","#d2a365","#7d9173","#a57f9b","#d8bfa6","#4e6675","#c48170"];
const hairs=["#473832","#805946","#c19a68","#302e35","#a16b44"];
const skins=["#e4b28e","#9a7155","#efc9a5","#bd9071"];
for(let i=0;i<112;i++){
 const k=W.streetCells[Math.floor(W.hash(i,21,14)*W.streetCells.length)];
 if(k==null)continue;
 const x=k%W.N,y=(k/W.N)|0;
 if(!W.isStreet(x,y))continue;
 npcs.push({id:i,name:names[i%names.length],x:x*T+T/2,y:y*T+T/2,
  step:0,dest:null,pause:0,speed:49+(i*17)%29,direction:1,
  shirt:clothes[i%clothes.length],hair:hairs[i%hairs.length],skin:skins[i%skins.length]});
}
function neighbours(x,y){
 const list=[];
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  if(W.isStreet(x+dx,y+dy))list.push({x:x+dx,y:y+dy});
 }
 return list;
}
function npcTarget(n){
 const x=Math.floor(n.x/T),y=Math.floor(n.y/T),steps=neighbours(x,y);
 if(!steps.length){n.pause=1;return;}
 n.dest=steps[Math.floor(W.hash(x+n.id*3,y+n.id*7,n.step+4)*steps.length)];
}
function moveTowards(entity,target,dt,speed){
 if(!target)return true;
 const x=target.x*T+T/2,y=target.y*T+T/2,dx=x-entity.x,dy=y-entity.y,d=Math.hypot(dx,dy);
 if(d<=dt*speed+.01){entity.x=x;entity.y=y;return true;}
 entity.x+=dx/d*dt*speed;entity.y+=dy/d*dt*speed;
 if(Math.abs(dx)>1)entity.direction=dx<0?-1:1;
 return false;
}
function walk(x,y){
 const route=W.findPath(Math.floor(player.x/T),Math.floor(player.y/T),Math.floor(x/T),Math.floor(y/T));
 if(!route.length)return false;
 player.path=route.slice(1);return true;
}
function npcAt(x,y){
 let found=null,closest=52;
 for(const n of npcs){
  const d=Math.hypot(x-n.x,y-n.y);if(d<closest){closest=d;found=n;}
 }return found;
}
function buildingAt(x,y){
 const tx=Math.floor(x/T),ty=Math.floor(y/T);
 if(!W.inBounds(tx,ty))return null;
 const ix=W.occupied[W.coord(tx,ty)];
 if(ix>=0)return W.buildings[ix];
 for(const l of W.landmarks)if(l.id<0&&tx>=l.x-2&&tx<l.x+l.w+2&&ty>=l.y-2&&ty<l.y+l.h+2)return l;
 return null;
}
let currentRoom=null,indoorPlayer={x:.5,y:.81},indoorGoal=null;
function resizeRoom(){
 if(room.hidden)return;
 const r=roomCanvas.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1);
 if(r.width>30&&r.height>30){
  const width=Math.round(r.width*d),height=Math.round(r.height*d);
  if(width!==roomCanvas.width||height!==roomCanvas.height){roomCanvas.width=width;roomCanvas.height=height;}
 }
}
function enter(b){
 if(!b.enterable)return;
 currentRoom=b;room.hidden=false;pop.hidden=true;player.path=[];
 roomName.textContent=b.name+" · "+b.kind;
 indoorPlayer={x:.5,y:.81};indoorGoal=null;
 resizeRoom();R.room(roomCanvas,b,indoorPlayer.x,indoorPlayer.y);visit(b);
}
function leave(){
 room.hidden=true;currentRoom=null;indoorGoal=null;R.markDirty();
}
exit.addEventListener("click",e=>{e.stopPropagation();leave()});
roomCanvas.addEventListener("pointerdown",e=>{
 e.stopPropagation();const r=roomCanvas.getBoundingClientRect();
 indoorGoal={x:Math.max(.08,Math.min(.92,(e.clientX-r.left)/r.width)),
  y:Math.max(.14,Math.min(.91,(e.clientY-r.top)/r.height))};
});
function openPlace(b){
 if(!b)return;visit(b);
 const options=[];
 if(b.enterable)options.push(["Enter "+(b.kind==="house"?"home":b.kind==="cafe"?"café":"building"),()=>enter(b)]);
 options.push(["Walk here",()=>{walk(b.door.x*T+T/2,b.door.y*T+T/2);pop.hidden=true},true]);
 showCard(b.name,b.description,options,b.landmark?"Landmark · +12 XP on discovery":"Neighbourhood "+b.kind+" · "+(b.enterable?"Enterable interior":"Scenic location"));
}
function greet(n){
 const newFriend=!progress.met.includes(n.name);
 if(newFriend){progress.met.push(n.name);progress.xp+=18;questComplete("friend");}
 save();
 showCard(n.name+" · Resident",newFriend?"Hello! I'm "+n.name+". Welcome to Wish & Wander. It's lovely to meet you!":
  "Hello again! It's always nice to see a familiar face in the neighbourhood.",
  [["Chat",()=>{desc.textContent="You share a little story about your favourite corners of the city."}]],newFriend?"New friend · +18 XP":"Friendship growing");
}
const pointers=new Map();let gesture=null,gestureMoved=false;
function relative(e){
 const r=stage.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};
}
function startGesture(){
 const arr=Array.from(pointers.values());
 if(arr.length===1){
  const p=arr[0];gesture={mode:1,x:p.x,y:p.y,anchor:R.worldAt(p.x,p.y),zoom:cam.zoom,rotation:cam.rotation};
 }else if(arr.length>=2){
  const a=arr[0],b=arr[1],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  gesture={mode:2,midX:mx,midY:my,anchor:R.worldAt(mx,my),zoom:cam.zoom,rotation:cam.rotation,
   angle:Math.atan2(b.y-a.y,b.x-a.x),distance:Math.max(1,Math.hypot(b.x-a.x,b.y-a.y))};
 }else gesture=null;
}
function pointerDown(e){
 if(!room.hidden||e.target.closest("button")||e.target.closest(".lw-pop"))return;
 if(e.pointerType==="mouse"&&e.button!==0)return;
 e.preventDefault();pointers.set(e.pointerId,relative(e));gestureMoved=false;startGesture();
 try{stage.setPointerCapture(e.pointerId)}catch(_){}
}
function pointerMove(e){
 if(!pointers.has(e.pointerId)||!gesture)return;
 e.preventDefault();const p=relative(e);pointers.set(e.pointerId,p);
 const arr=Array.from(pointers.values()),g=gesture;
 if(g.mode===1&&arr.length===1){
  if(Math.hypot(p.x-g.x,p.y-g.y)>6)gestureMoved=true;
  if(gestureMoved)R.keepAt(g.anchor,p.x,p.y,g.zoom,g.rotation);
 }else if(g.mode===2&&arr.length>=2){
  const a=arr[0],b=arr[1],mx=(a.x+b.x)/2,my=(a.y+b.y)/2,
   d=Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),angle=Math.atan2(b.y-a.y,b.x-a.x);
  let rot=angle-g.angle;while(rot>Math.PI)rot-=2*Math.PI;while(rot< -Math.PI)rot+=2*Math.PI;
  if(Math.abs(d-g.distance)>3||Math.abs(rot)>.013||Math.hypot(mx-g.midX,my-g.midY)>3)gestureMoved=true;
  if(gestureMoved)R.keepAt(g.anchor,mx,my,g.zoom*d/g.distance,g.rotation+rot);
 }
}
function pointerUp(e){
 if(!pointers.has(e.pointerId))return;
 const pt=relative(e),tap=!gestureMoved&&pointers.size===1;
 pointers.delete(e.pointerId);
 if(tap&&room.hidden){
  const p=R.worldAt(pt.x,pt.y),n=npcAt(p.x,p.y),b=buildingAt(p.x,p.y);
  if(n)greet(n);
  else if(b)openPlace(b);
  else if(walk(p.x,p.y)){pop.hidden=true;hint.textContent="Walking · Tap a café, shop, home, landmark or resident to interact";}
 }
 startGesture();
}
stage.addEventListener("pointerdown",pointerDown);stage.addEventListener("pointermove",pointerMove);
stage.addEventListener("pointerup",pointerUp);
stage.addEventListener("pointercancel",e=>{pointers.delete(e.pointerId);startGesture()});
stage.addEventListener("wheel",e=>{
 if(!room.hidden)return;e.preventDefault();
 const p=relative(e),anchor=R.worldAt(p.x,p.y);
 R.keepAt(anchor,p.x,p.y,cam.zoom*(e.deltaY<0?1.12:.88),cam.rotation);
},{passive:false});
for(const type of ["gesturestart","gesturechange","gestureend"])stage.addEventListener(type,e=>e.preventDefault(),{passive:false});
stage.addEventListener("dblclick",e=>e.preventDefault());
document.addEventListener("keydown",e=>{
 if(document.getElementById("city").classList.contains("hidden"))return;
 if(e.key==="Escape"){if(!room.hidden)leave();else pop.hidden=true;return;}
 const dir={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
 if(!dir)return;e.preventDefault();
 if(!room.hidden){indoorGoal={x:Math.max(.08,Math.min(.92,indoorPlayer.x+dir[0]*.05)),
  y:Math.max(.14,Math.min(.91,indoorPlayer.y+dir[1]*.05))};return;}
 const x=Math.floor(player.x/T)+dir[0],y=Math.floor(player.y/T)+dir[1];
 if(W.isWalkable(x,y))walk(x*T+24,y*T+24);
});
if(typeof ResizeObserver!=="undefined")new ResizeObserver(()=>{R.resize();resizeRoom()}).observe(stage);
window.addEventListener("resize",()=>{R.resize();resizeRoom();R.markDirty()});
for(const b of document.querySelectorAll('[data-page="city"],[data-go="city"]'))
 b.addEventListener("click",()=>requestAnimationFrame(()=>{R.resize();R.markDirty()}));
let last=0,drawCalls=0;
function tick(time){
 requestAnimationFrame(tick);
 if(document.getElementById("city").classList.contains("hidden"))return;
 R.resize();const dt=Math.min(.06,(time-(last||time))/1000);last=time;
 if(!room.hidden){
  if(indoorGoal){
   const dx=indoorGoal.x-indoorPlayer.x,dy=indoorGoal.y-indoorPlayer.y,d=Math.hypot(dx,dy);
   if(d<dt*.36){indoorPlayer={...indoorGoal};indoorGoal=null;}
   else{indoorPlayer.x+=dx/d*dt*.36;indoorPlayer.y+=dy/d*dt*.36;}
  }
  R.room(roomCanvas,currentRoom,indoorPlayer.x,indoorPlayer.y);
  return;
 }
 if(player.path.length){
  if(moveTowards(player,player.path[0],dt,player.speed))player.path.shift();
  const dx=player.x-cam.x,dy=player.y-cam.y;
  if(Math.hypot(dx,dy)>Math.min(screen.w,screen.h)*.28/cam.zoom){
   cam.x=Math.max(0,Math.min(W.SIZE,cam.x+dx*Math.min(1,dt*2)));
   cam.y=Math.max(0,Math.min(W.SIZE,cam.y+dy*Math.min(1,dt*2)));
   R.markDirty();
  }
 }
 for(const n of npcs){
  if(n.pause>0){n.pause-=dt;continue;}
  if(!n.dest)npcTarget(n);
  else if(moveTowards(n,n.dest,dt,n.speed)){n.dest=null;n.step++;if(n.step%8===0)n.pause=.4+W.hash(n.id,n.step,3)*.9;}
 }
 if(R.dirty()){R.draw();drawCalls++;}
 R.actors(player,npcs,time);
}
updateHUD();R.resize();
window.LWGame={world:W,renderer:R,player,npcs,progress,
 walk,enter,leave,openPlace,greet,
 getState:()=>({ready:screen.w>0,worldTiles:W.N,area:W.SIZE*W.SIZE,npcCount:npcs.length,
  buildingCount:W.buildings.length,landmarks:W.landmarks.length,interior:!room.hidden,drawCalls}),
 setCamera:(x,y,zoom)=>{cam.x=x;cam.y=y;if(zoom)cam.zoom=zoom;R.markDirty()},
};
requestAnimationFrame(tick);
})();