/* Deterministic, collision-aware wildlife. Independent from friendship progress and camera state. */
(()=>{
"use strict";
const W=window.LWWorldData,T=W.T,animals=[];
const farmKinds=new Set(["chicken","sheep","cow"]);
const species={
 dog:{count:48,speed:66,label:"Street dog",description:"A friendly stray dog noses around the neighbourhood, following the smells from the cafés."},
 cat:{count:64,speed:49,label:"Street cat",description:"An independent little cat explores the alleys and sunny doorsteps."},
 pigeon:{count:112,speed:37,label:"Pigeon",description:"A city pigeon pecks at the paving, then hurries back to its flock."},
 chicken:{count:32,speed:33,label:"Hen",description:"A free-roaming hen scratches around the farm paths and vegetable beds."},
 sheep:{count:16,speed:28,label:"Sheep",description:"A woolly sheep grazes in the meadows beside the country lane."},
 cow:{count:8,speed:25,label:"Cow",description:"A dairy cow wanders slowly between the meadow and the farmhouse."}
};
function canWalk(kind,x,y){
 if(!W.isWalkable(x,y)||W.terrain[W.coord(x,y)]===W.TERRAIN.CLIFF)return false;
 return !farmKinds.has(kind)||W.districts[W.coord(x,y)]===W.D.COUNTRY;
}
const cityCells=[],farmCells=[],nearCells=[];
for(let y=1;y<W.N-1;y++)for(let x=1;x<W.N-1;x++){
 if(!canWalk("dog",x,y))continue;
 if(W.districts[W.coord(x,y)]===W.D.COUNTRY)farmCells.push({x,y});
 else if(W.isStreet(x,y)){
  cityCells.push({x,y});if(Math.hypot(x-W.initial.x,y-W.initial.y)<13)nearCells.push({x,y});
 }
}
let id=0;
for(const [kind,info] of Object.entries(species))for(let i=0;i<info.count;i++){
 const cells=farmKinds.has(kind)?farmCells:i<20&&nearCells.length?nearCells:cityCells;
 if(!cells.length)continue;
 const p=cells[Math.floor(W.hash(i,kind.length,811)*cells.length)];
 animals.push({id:id++,kind,x:p.x*T+T/2,y:p.y*T+T/2,home:{...p},radius:farmKinds.has(kind)?8:kind==="pigeon"?6:12,
  speed:info.speed*(.85+W.hash(i,kind.length,812)*.3),direction:W.hash(i,kind.length,813)>.5?1:-1,
  dest:null,previous:null,pause:0,step:0,moving:false,variant:Math.floor(W.hash(i,kind.length,814)*4)});
}
function chooseTarget(a){
 const x=Math.floor(a.x/T),y=Math.floor(a.y/T),choices=[];
 for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const xx=x+dx,yy=y+dy;
  if(canWalk(a.kind,xx,yy)&&Math.hypot(xx-a.home.x,yy-a.home.y)<=a.radius)choices.push({x:xx,y:yy});
 }
 if(!choices.length){a.pause=.7;return;}
 const onward=choices.filter(p=>!a.previous||p.x!==a.previous.x||p.y!==a.previous.y),list=onward.length?onward:choices;
 a.dest=list[Math.floor(W.hash(x+a.id*3,y+a.id*7,a.step+815)*list.length)];a.previous={x,y};
}
function update(dt){
 for(const a of animals){
  a.moving=false;
  if(a.pause>0){a.pause=Math.max(0,a.pause-dt);continue;}
  if(!a.dest)chooseTarget(a);
  if(!a.dest)continue;
  const dx=a.dest.x*T+T/2-a.x,dy=a.dest.y*T+T/2-a.y,d=Math.hypot(dx,dy),distance=dt*a.speed;
  a.moving=true;if(Math.abs(dx)>.1)a.direction=dx<0?-1:1;
  if(d<=distance+.01){
   a.x=a.dest.x*T+T/2;a.y=a.dest.y*T+T/2;a.dest=null;a.step++;
   if(a.step%(a.kind==="pigeon"?3:5)===0)a.pause=.4+W.hash(a.id,a.step,816)*(a.kind==="cat"?2.4:1.6);
  }else{a.x+=dx/d*distance;a.y+=dy/d*distance;}
 }
}
function at(x,y){let best=null,closest=27;for(const a of animals){const d=Math.hypot(a.x-x,a.y-y);if(d<closest&&(a.kind!=="pigeon"||d<18)){closest=d;best=a;}}return best;}
window.LWWildlife={animals,species,canWalk,update,at};
})();
