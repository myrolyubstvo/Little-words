/* Little Worlds: Wish & Wander — real, editable top-down game-world data.
   Compact 226x226 walkable tile grid, 48px tiles: half the original area.
   Terrain, streets, buildings, landmarks, collision and paths are independent
   of any concept illustration. Deterministically generated for reproducibility. */
(() => {
"use strict";
const N=226, T=48, LENGTH=N*N, designScale=N/320;
const TERRAIN={GRASS:0,ROAD:1,SAND:2,WATER:3,PARK:4,RIVER:5,BRIDGE:6,PLAZA:7,PATH:8};
const B={SUMMER:0,SPRING:1,AUTUMN:2,WINTER:3,COAST:4};
const terrain=new Uint8Array(LENGTH), biomes=new Uint8Array(LENGTH);
const occupied=new Int32Array(LENGTH); occupied.fill(-1);
const buildings=[], landmarks=[], roadCells=[], objects=[];
const sources=[
 [45,48,B.WINTER],[250,53,B.WINTER],[165,248,B.WINTER],
 [105,58,B.SPRING],[58,188,B.SPRING],[246,233,B.SPRING],
 [209,137,B.AUTUMN],[65,262,B.AUTUMN],[150,36,B.AUTUMN],
 [155,150,B.SUMMER],[100,135,B.SUMMER],[240,268,B.SUMMER],
 [282,174,B.COAST],[274,265,B.COAST],[252,90,B.COAST]
];
function hash(x,y,offset=0){let h=Math.imul(x+offset*37,374761393)+Math.imul(y+offset*17,668265263);h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296}
function between(a,b,r){return a+(b-a)*r}
function coord(x,y){return y*N+x}
function inBounds(x,y){return x>=0&&y>=0&&x<N&&y<N}
function coastX(y){return 283+Math.sin(y*.046)*10+Math.sin(y*.112)*5-19*Math.exp(-Math.pow((y-177)/35,2))}
function coastY(x){return 289+Math.cos(x*.047)*9+Math.sin(x*.123)*5-6*Math.exp(-Math.pow((x-240)/50,2))}
function deltaSea(x,y){return Math.max(x-coastX(y),y-coastY(x))}
function nearestBiome(x,y){
 let best=Infinity,chosen=B.SUMMER;
 const wiggleX=(hash(Math.floor(x/7),Math.floor(y/7),7)-.5)*20;
 const wiggleY=(hash(Math.floor(x/7),Math.floor(y/7),13)-.5)*20;
 for(const s of sources){
  const dx=x-s[0]+wiggleX,dy=y-s[1]+wiggleY;
  const d=dx*dx+dy*dy;
  if(d<best){best=d;chosen=s[2];}
 }
 return chosen;
}
function streetDistance(v,step){const m=((v%step)+step)%step;return Math.min(m,step-m)}
const parks=[[46,49,13],[104,59,16],[62,193,15],[245,233,15],[208,136,12],[165,249,13],[235,75,13],[83,258,12],[120,115,11]];
const plazas=[[156,151,13],[209,112,8],[226,176,9],[115,163,8],[259,194,7]];
function circleIn(x,y,centers){
 for(const [cx,cy,r] of centers)if((x-cx)**2+(y-cy)**2 < r*r)return true;
 return false;
}
function street(x,y){
 const vertical=streetDistance(x+Math.sin(y*.067)*2.0+Math.sin(y*.017)*2.7-11,22)<1.65;
 const horizontal=streetDistance(y+Math.sin(x*.056)*2.4-10,22)<1.65;
 const diagonal=Math.abs(y-(.58*x+22))<1.25||Math.abs(y-(-.38*x+259))<1.3;
 return vertical||horizontal||diagonal;
}
function rivX(y){return 111+16*Math.sin(y*.055)+8*Math.cos(y*.025)+y*.075}
for(let y=0;y<N;y++)for(let x=0;x<N;x++){
 const k=coord(x,y),d=deltaSea(x/designScale,y/designScale)*designScale;
 let biome=nearestBiome(x/designScale,y/designScale);
 if(d>-13)biome=B.COAST;
 biomes[k]=biome;
 let t=TERRAIN.GRASS;
 const isStreet=street(x/designScale,y/designScale);
 if(d>0)t=TERRAIN.WATER;
 else if(d>-7)t=TERRAIN.SAND;
 else if(circleIn(x/designScale,y/designScale,plazas))t=TERRAIN.PLAZA;
 else if(circleIn(x/designScale,y/designScale,parks))t=TERRAIN.PARK;
 else if(isStreet)t=TERRAIN.ROAD;
 // A long river threads the old quarter, with functional crossing bridges.
 if(y<225*designScale&&d<=-7&&Math.abs(x-rivX(y/designScale)*designScale)<1.65){
  t=(t===TERRAIN.ROAD||t===TERRAIN.PLAZA)?TERRAIN.BRIDGE:TERRAIN.RIVER;
 }
 // Walkable promenades follow the curved coastline.
 if(d<=-7&&d>=-11)t=TERRAIN.PATH;
 if(t===TERRAIN.PARK&&Math.abs((x-y)*.7%13)<1.4)t=TERRAIN.PATH;
 terrain[k]=t;
 if(t===TERRAIN.ROAD||t===TERRAIN.PLAZA||t===TERRAIN.PATH||t===TERRAIN.BRIDGE)roadCells.push(k);
}
function isLand(x,y){
 if(!inBounds(x,y))return false;
 const t=terrain[coord(x,y)];
 return t!==TERRAIN.WATER&&t!==TERRAIN.RIVER;
}
function isWalkable(x,y){return isLand(x,y)&&occupied[coord(x,y)]<0}
function isStreet(x,y){
 if(!isWalkable(x,y))return false;
 const t=terrain[coord(x,y)];
 return t===TERRAIN.ROAD||t===TERRAIN.PATH||t===TERRAIN.PLAZA||t===TERRAIN.BRIDGE||t===TERRAIN.SAND;
}
function clearFootprint(x,y,w,h,allowPlaza=false){
 if(!inBounds(x-1,y-1)||!inBounds(x+w,y+h))return false;
 for(let j=y-1;j<=y+h;j++)for(let i=x-1;i<=x+w;i++){
  const k=coord(i,j),t=terrain[k];
  if(t===TERRAIN.WATER||t===TERRAIN.RIVER||occupied[k]>=0)return false;
  if(i>=x&&i<x+w&&j>=y&&j<y+h){
   if(t===TERRAIN.ROAD||t===TERRAIN.BRIDGE||t===TERRAIN.PATH||(!allowPlaza&&t===TERRAIN.PLAZA))return false;
  }
 }
 return true;
}
function occupy(b){
 b.id=buildings.length;
 buildings.push(b);
 for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++)occupied[coord(i,j)]=b.id;
 return b;
}
function doorFor(b){
 let best=null,bestD=Infinity;
 const candidates=[
  [b.x+Math.floor(b.w/2),b.y+b.h],[b.x+Math.floor(b.w/2),b.y-1],
  [b.x-1,b.y+Math.floor(b.h/2)],[b.x+b.w,b.y+Math.floor(b.h/2)]
 ];
 for(const [cx,cy] of candidates){
  for(let oy=-7;oy<=7;oy++)for(let ox=-7;ox<=7;ox++){
   const x=cx+ox,y=cy+oy;
   if(!isStreet(x,y))continue;
   const dist=Math.abs(ox)+Math.abs(oy);
   if(dist<bestD){bestD=dist;best={x,y};}
  }
 }
 return best||{x:b.x+Math.floor(b.w/2),y:b.y+b.h};
}
const landmarkSeeds=[
 ["Clocktower Square","clock",151,150,11,10,"A civic square with a famous clock tower and fountain."],
 ["Leaning Tower","pisa",207,109,8,9,"A beautiful leaning bell tower with stone arches and cafes."],
 ["Roman Amphitheatre","roman",227,174,11,9,"Ancient Roman galleries, ruined columns and a garden."],
 ["Blossom Conservatory","greenhouse",102,55,10,8,"A glasshouse surrounded by blossom and botanical gardens."],
 ["Frostglass Lodge","lodge",44,46,9,7,"A warm timber lodge in the snow."],
 ["Autumn Book Market","market",206,137,9,7,"Copper-coloured trees surround little book stalls."],
 ["Harbour Lights","harbour",261,185,10,8,"Fishing boats, cafes and wooden piers."],
 ["Miramar Beach","beach",276,252,8,7,"Golden sand, parasols and gentle Mediterranean waves."],
 ["La Rambla Market","market",115,161,10,7,"Lively pedestrian arcades, produce markets and little bakeries."],
 ["Snowbell Square","lodge",162,244,8,7,"Pines, white paths and a cosy mountain inn."],
 ["Petal Gardens","greenhouse",244,230,9,8,"Spring flowers, fountains and soft pink blossom."],
 ["Sunset Lighthouse","lighthouse",277,112,6,7,"A lighthouse overlooking the warm eastern shore."]
];
function findBuildingPlot(x,y,w,h,allowPlaza=false){
 for(let radius=0;radius<=35;radius++){
  for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
   if(Math.max(Math.abs(dx),Math.abs(dy))!==radius)continue;
   if(clearFootprint(x+dx,y+dy,w,h,allowPlaza))return {x:x+dx,y:y+dy};
  }
 }
 return null;
}
for(const [name,kind,seedX,seedY,w,h,description] of landmarkSeeds){
 const x=Math.round(seedX*designScale),y=Math.round(seedY*designScale);
 const scenic=["beach","lighthouse","harbour"].includes(kind);
 const plot=scenic?(closestWalkable(x,y)||{x,y}):findBuildingPlot(x,y,w,h,true);
 if(!plot)continue;
 const px=plot.x,py=plot.y;
 const b=scenic?{id:-1,x:px,y:py,w,h,name,kind,description,biome:biomes[coord(px,py)],landmark:true,enterable:false}:
  occupy({x:px,y:py,w,h,name,kind,description,biome:biomes[coord(px,py)],landmark:true,enterable:true});
 b.door=scenic?{x:px,y:py}:doorFor(b);
 landmarks.push(b);
 // Squares and paths around landmark buildings.
 for(let j=py-3;j<py+h+4;j++)for(let i=px-3;i<px+w+4;i++){
  if(!inBounds(i,j)||occupied[coord(i,j)]>=0)continue;
  if(isLand(i,j)&&hash(i,j,9)>.32&&terrain[coord(i,j)]===TERRAIN.GRASS)terrain[coord(i,j)]=TERRAIN.PLAZA;
 }
}
const labels={
 house:["Casa del Sol","Casa de la Flor","Casa Mar","Casa del Olivo","Casa Luna","Casa de Pedra","Casa Bonita","Casa Azul"],
 cafe:["Café de la Plaça","Café Azahar","Café Marisol","Café Lavanda","Café del Pont","Café Primavera"],
 restaurant:["La Terraza","El Peix Dorat","La Cuchara","Casa Tapas","La Brisa","El Jardí"],
 shop:["Botiga de Somnis","La Llibreria","Mercat Petit","Casa Ceràmica","Atelier Azul","Botiga del Mar"],
 bakery:["Forn de la Rosa","Panadería Sol","Forn del Raval","La Crosta Daurada"]
};
let created=0;
for(let by=8;by<N-8;by+=10){
 for(let bx=8;bx<N-8;bx+=10){
  for(let q=0;q<4;q++){
   const r=hash(bx,by,q+17);
   if(r<.15)continue;
   const w=3+Math.floor(hash(bx,by,q+31)*2),h=3+Math.floor(hash(bx,by,q+37)*2);
   const x=bx+(q%2?6:0)+Math.floor(hash(bx,by,q+42)*2),
    y=by+(q>=2?6:1)+Math.floor(hash(bx,by,q+43)*2);
   if(!clearFootprint(x,y,w,h))continue;
   const nearby=doorFor({x,y,w,h});
   if(Math.abs(nearby.x-(x+w/2))+Math.abs(nearby.y-(y+h))>14)continue;
   const t=hash(bx,by,q+47);
   const kind=t<.57?"house":t<.73?"cafe":t<.84?"shop":t<.93?"restaurant":"bakery";
   const options=labels[kind],name=options[Math.floor(hash(bx,by,q+50)*options.length)];
   const b=occupy({x,y,w,h,kind,name,biome:biomes[coord(x,y)],description:
    kind==="house"?"A welcoming home with tiled roofs and flower boxes.":
    kind==="cafe"?"A cosy café with pastries, coffee and little terrace tables.":
    kind==="restaurant"?"A neighbourhood restaurant with Mediterranean dishes.":
    kind==="bakery"?"Fresh bread and pastries from a traditional bakery.":
    "A colourful independent local shop.",enterable:true,landmark:false});
   b.door=doorFor(b);created++;
  }
 }
}
// Deterministic independent ground objects: rocks, flowers, trees, palms, benches and lamps.
for(let y=3;y<N-3;y+=2){
 for(let x=3;x<N-3;x+=2){
  const k=coord(x,y),t=terrain[k];
  if(occupied[k]>=0)continue;
  const r=hash(x,y,83);
  if(t===TERRAIN.ROAD||t===TERRAIN.PLAZA||t===TERRAIN.PATH){
   if(r<.013)objects.push({x,y,kind:"lamp",biome:biomes[k]});
   else if(r<.022)objects.push({x,y,kind:"bench",biome:biomes[k]});
   continue;
  }
  if(t===TERRAIN.WATER){
   if(r<.018)objects.push({x,y,kind:"ripple",biome:B.COAST});
   continue;
  }
  if(t===TERRAIN.RIVER)continue;
  if(t===TERRAIN.SAND){
   if(r<.10)objects.push({x,y,kind:"palm",biome:B.COAST});
   else if(r<.16)objects.push({x,y,kind:"umbrella",biome:B.COAST});
   else if(r<.28)objects.push({x,y,kind:"shell",biome:B.COAST});
   continue;
  }
  const nearCity=Math.hypot(x-155*designScale,y-150*designScale)<105*designScale;
  const dense=t===TERRAIN.PARK?.34:nearCity?.13:.30;
  if(r<dense)objects.push({x,y,kind:"tree",biome:biomes[k],variant:Math.floor(hash(x,y,97)*4)});
  else if(r<dense+.11)objects.push({x,y,kind:"bush",biome:biomes[k]});
  else if(r<dense+.23)objects.push({x,y,kind:"flowers",biome:biomes[k]});
  else if(r<dense+.27)objects.push({x,y,kind:"stone",biome:biomes[k]});
 }
}
// Regional street dressing stays outside building footprints and leaves routes open.
// Decorative objects never alter collision or pathfinding.
for(let y=4;y<N-4;y+=2)for(let x=4;x<N-4;x+=2){
 const k=coord(x,y),t=terrain[k],biome=biomes[k],r=hash(x,y,181);
 if(occupied[k]>=0||t===TERRAIN.WATER||t===TERRAIN.RIVER||t===TERRAIN.BRIDGE)continue;
 const winter=biome===B.WINTER,warm=biome===B.SUMMER||biome===B.COAST;
 const paved=t===TERRAIN.ROAD||t===TERRAIN.PATH||t===TERRAIN.PLAZA;
 let kind;
 if(paved){
  if(r<.04)kind=winter?"snowman":"planter";
  else if(r<.075)kind=winter?"logpile":"terrace";
  else if(r<.10)kind="bicycle";
  else if(r<.125)kind="signpost";
  else if(r<.15)kind=winter?"lantern":"fruitstall";
  else if(r<.17)kind="fountain";
 }else if(t===TERRAIN.SAND){
  if(r<.08)kind="lounger";else if(r<.13)kind="boat";
 }else{
  if(r<.09)kind=winter?"pine":warm?"citrus":"planter";
  else if(r<.14)kind=winter?"snowman":"fence";
  else if(r<.19)kind=winter?"logpile":"garden";
  else if(r<.23)kind="lantern";
 }
 if(kind)objects.push({x,y,kind,biome,variant:Math.floor(hash(x,y,182)*4)});
}
for(const b of buildings){
 for(const [dx,dy,kind] of [[-1,1,"planter"],[b.w,1,"garden"],[1,b.h,"signpost"],[b.w-1,-1,"fence"]]){
  const x=b.x+dx,y=b.y+dy;
  if(!inBounds(x,y))continue;
  const k=coord(x,y);
  if(occupied[k]>=0||![TERRAIN.GRASS,TERRAIN.PARK].includes(terrain[k]))continue;
  objects.push({x,y,kind:b.biome===B.WINTER&&kind==="garden"?"logpile":kind,biome:b.biome,variant:b.id%4});
 }
}
const streetCells=roadCells.filter(k=>{
 const x=k%N,y=(k/N)|0;return isStreet(x,y);
});
function closestWalkable(x,y,roadOnly=false){
 x=Math.max(0,Math.min(N-1,Math.round(x)));
 y=Math.max(0,Math.min(N-1,Math.round(y)));
 for(let radius=0;radius<=28;radius++){
  for(let dy=-radius;dy<=radius;dy++){
   for(let dx=-radius;dx<=radius;dx++){
    if(Math.max(Math.abs(dx),Math.abs(dy))!==radius)continue;
    const xx=x+dx,yy=y+dy;
    if(roadOnly?isStreet(xx,yy):isWalkable(xx,yy))return {x:xx,y:yy};
   }
  }
 }
 return null;
}
// Breadth-first pathfinding on real collision tiles. Small 4-neighbour routes
// allow players to walk streets, sand and parks, but never cross sea or buildings.
const seen=new Uint32Array(LENGTH),prev=new Int32Array(LENGTH),queue=new Int32Array(LENGTH);
let generation=0;
function findPath(ax,ay,bx,by){
 const start=closestWalkable(ax,ay),goal=closestWalkable(bx,by);
 if(!start||!goal)return [];
 const s=coord(start.x,start.y),g=coord(goal.x,goal.y);
 if(s===g)return [start];
 generation++;
 let head=0,tail=0;
 queue[tail++]=s;seen[s]=generation;prev[s]=-1;
 const dirs=[1,-1,N,-N];
 while(head<tail){
  const v=queue[head++];
  if(v===g)break;
  const vx=v%N,vy=(v/N)|0;
  for(const dir of dirs){
   if((dir===1&&vx===N-1)||(dir===-1&&vx===0)||(dir===N&&vy===N-1)||(dir===-N&&vy===0))continue;
   const nb=v+dir;
   if(seen[nb]===generation||occupied[nb]>=0)continue;
   const t=terrain[nb];
   if(t===TERRAIN.WATER||t===TERRAIN.RIVER)continue;
   seen[nb]=generation;prev[nb]=v;queue[tail++]=nb;
  }
 }
 if(seen[g]!==generation)return [];
 const route=[];
 for(let p=g;p>=0;p=prev[p]){route.push({x:p%N,y:(p/N)|0});if(p===s)break}
 route.reverse();return route;
}
const initial=closestWalkable(156*designScale,164*designScale,true)||closestWalkable(156*designScale,164*designScale);
const seasonCounts=[0,0,0,0,0];
for(let i=0;i<LENGTH;i++)if(terrain[i]!==TERRAIN.WATER)seasonCounts[biomes[i]]++;
window.LWWorldData={
 N,T,designScale,SIZE:N*T,TERRAIN,B,terrain,biomes,occupied,buildings,landmarks,objects,streetCells,
 initial,seasonCounts,hash,coord,inBounds,isWalkable,isStreet,closestWalkable,findPath,
 info:{square:true,regionCount:5,buildings:buildings.length,landmarks:landmarks.length,
 tileCount:LENGTH,worldArea:N*T*N*T,previousArtArea:11200*8200}
};
})();