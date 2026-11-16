/* Little Worlds: Wish & Wander — expanded, editable 140x140 top-down island.
   Terrain, streets, buildings, landmarks, collision and paths are independent
   of any concept illustration. Deterministically generated for reproducibility. */
(() => {
"use strict";
const N=140, T=48, LENGTH=N*N, designScale=N/320,layoutScale=N/160;
const TERRAIN={GRASS:0,ROAD:1,SAND:2,WATER:3,PARK:4,RIVER:5,BRIDGE:6,PLAZA:7,PATH:8,FIELD:9,ORCHARD:10,CLIFF:11,MEADOW:12};
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
// An irregular island: headlands, a sheltered eastern harbour and three cut-in bays.
function deltaSea(x,y){
 x/=layoutScale;y/=layoutScale;
 const dx=x-78,dy=y-78,a=Math.atan2(dy/67,dx/64);
 let d=(Math.hypot(dx/64,dy/67)-1)*64-2.7*Math.sin(a*5+.5)-1.4*Math.cos(a*9);
 for(const [cx,cy,r] of [[31,31,27],[120,32,26],[39,112,24],[122,120,25]])d=Math.min(d,Math.hypot(x-cx,y-cy)-r-1.3*Math.sin(a*7));
 for(const [cx,cy,r] of [[5,77,19],[154,78,20],[86,158,21],[74,1,15]])d=Math.max(d,r-Math.hypot(x-cx,y-cy));
 return d*layoutScale;
}
function nearestBiome(x,y){
 let best=Infinity,chosen=B.SUMMER;
 const wiggleX=Math.sin(y*.045)*4+Math.cos(x*.071)*3,wiggleY=Math.cos(x*.053)*4;
 for(const [sx,sy,b] of sources){const d=(x-sx+wiggleX)**2+(y-sy+wiggleY)**2;if(d<best){best=d;chosen=b;}}
 return chosen;
}
const D={TOWN:0,COUNTRY:1,METRO:2,FOREST:3,HARBOUR:4};
const districts=new Uint8Array(LENGTH),shoreDistance=new Float32Array(LENGTH);
const districtAnchors={town:{x:79*layoutScale,y:85*layoutScale},country:{x:43*layoutScale,y:106*layoutScale},metro:{x:99*layoutScale,y:56*layoutScale},harbour:{x:131*layoutScale,y:95*layoutScale}};
function distanceToSegment(x,y,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,t=Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-ax-dx*t,y-ay-dy*t);}
function polyDistance(x,y,points){let d=Infinity;for(let i=1;i<points.length;i++)d=Math.min(d,distanceToSegment(x,y,...points[i-1],...points[i]));return d;}
const fields=[
 {x:35,y:101,rx:6,ry:4,angle:-.22,crop:"wheat"},{x:48,y:111,rx:7,ry:4,angle:.28,crop:"vegetables"},
 {x:48,y:94,rx:5,ry:4,angle:.12,crop:"lavender"},{x:31,y:114,rx:5,ry:4,angle:-.4,crop:"wheat"},
 {x:56,y:103,rx:5,ry:6,angle:.35,crop:"orchard"},{x:41,y:122,rx:5,ry:3,angle:-.22,crop:"vegetables"}
];
for(const f of fields){for(const key of ["x","y","rx","ry"])f[key]*=layoutScale;}
const riverX=y=>(65+5*Math.sin(y/layoutScale*.065)+y/layoutScale*.025)*layoutScale;
const riverBranch=[[68,105],[57,103],[48,96],[38,99]].map(p=>p.map(v=>v*layoutScale));
const pond={x:37*layoutScale,y:98*layoutScale,rx:4*layoutScale,ry:2.7*layoutScale};
function fieldAt(x,y){for(const f of fields){const dx=x-f.x,dy=y-f.y,c=Math.cos(f.angle),s=Math.sin(f.angle);if(((dx*c+dy*s)/f.rx)**2+((-dx*s+dy*c)/f.ry)**2<1)return f;}return null;}
for(let y=0;y<N;y++)for(let x=0;x<N;x++){
 const k=coord(x,y),d=deltaSea(x,y),ox=x/layoutScale,oy=y/layoutScale;shoreDistance[k]=d;
 let biome=nearestBiome(x/designScale,y/designScale);
 if(d>3*layoutScale||d>-5*layoutScale&&biome!==B.WINTER)biome=B.COAST;biomes[k]=biome;
 const country=((ox-44)/25)**2+((oy-105)/29)**2<1;
 const metro=((ox-107)/21)**2+((oy-65)/22)**2<1;
 districts[k]=country?D.COUNTRY:metro?D.METRO:d>-9*layoutScale&&ox>115?D.HARBOUR:biome===B.WINTER||biome===B.SPRING?D.FOREST:D.TOWN;
 let t=d>0?TERRAIN.WATER:d>-2.6*layoutScale?TERRAIN.SAND:TERRAIN.GRASS;
 if(d<=-2.6*layoutScale){
  const f=country&&fieldAt(x,y);
  if(f)t=f.crop==="orchard"?TERRAIN.ORCHARD:TERRAIN.FIELD;
  else if(country)t=TERRAIN.MEADOW;
  else if((biome===B.WINTER&&d>-5*layoutScale)||((ox-19)/8)**2+((oy-58)/18)**2<1)t=TERRAIN.CLIFF;
  else if(biome===B.SPRING&&hash(Math.floor(x/8),Math.floor(y/8),24)>.3)t=TERRAIN.PARK;
  for(const [cx,cy,rx,ry] of [[77,75,10,8],[105,66,8,7],[129,94,7,6],[58,83,6,5]])if(((ox-cx)/rx)**2+((oy-cy)/ry)**2<1)t=TERRAIN.PLAZA;
  if(Math.abs(x-riverX(y))<Math.max(.7,1.2*layoutScale)||polyDistance(x,y,riverBranch)<Math.max(.6,.8*layoutScale)||((x-pond.x)/pond.rx)**2+((y-pond.y)/pond.ry)**2<1)t=TERRAIN.RIVER;
 }
 terrain[k]=t;
}
// Distinct green rooms are sculpted into the island before the street network is laid.
const parkPatches=[
 [77,74,11,8,-.25],[101,45,8,7,.42],[119,91,7,5,-.35],
 [53,33,7,8,.2],[30,75,7,10,-.18],[88,119,9,5,.3],[145,118,5,7,.4]
];
for(const [cx,cy,rx,ry,angle] of parkPatches){
 const c=Math.cos(angle),sn=Math.sin(angle);
 for(let y=Math.max(0,Math.floor((cy-ry-2)*layoutScale));y<Math.min(N,Math.ceil((cy+ry+2)*layoutScale));y++)
 for(let x=Math.max(0,Math.floor((cx-rx-2)*layoutScale));x<Math.min(N,Math.ceil((cx+rx+2)*layoutScale));x++){
  const k=coord(x,y),t=terrain[k],ox=x/layoutScale-cx,oy=y/layoutScale-cy;
  const u=ox*c+oy*sn,v=-ox*sn+oy*c,edge=(u/rx)**2+(v/ry)**2;
  if(edge<.82&&[TERRAIN.GRASS,TERRAIN.PARK,TERRAIN.MEADOW].includes(t))terrain[k]=TERRAIN.PARK;
  else if(edge<1.08&&t===TERRAIN.GRASS&&hash(x,y,126)>.48)terrain[k]=TERRAIN.MEADOW;
 }
}
const lakes=[[91,34,3.6,2.5],[25,79,3.1,2.4],[119,112,2.8,2.2]];
for(const [cx,cy,rx,ry] of lakes){
 for(let y=Math.max(0,Math.floor((cy-ry-1.5)*layoutScale));y<Math.min(N,Math.ceil((cy+ry+1.5)*layoutScale));y++)
 for(let x=Math.max(0,Math.floor((cx-rx-1.5)*layoutScale));x<Math.min(N,Math.ceil((cx+rx+1.5)*layoutScale));x++){
  const k=coord(x,y),ox=x/layoutScale-cx,oy=y/layoutScale-cy,q=(ox/rx)**2+(oy/ry)**2;
  if(q<1&&terrain[k]!==TERRAIN.WATER&&terrain[k]!==TERRAIN.RIVER)terrain[k]=TERRAIN.WATER;
  else if(q<1.45&&terrain[k]===TERRAIN.GRASS)terrain[k]=TERRAIN.SAND;
 }
}
const baseTerrain=terrain.slice();
// Catmull-Rom roads form an uneven connected network instead of a repeating grid.
const routes=[
 [2.0,[[69,65],[84,62],[96,68],[98,80],[88,91],[74,94],[63,84],[64,73],[69,65]]],
 [1.25,[[69,65],[73,75],[70,86],[74,94]]],[1.15,[[82,63],[81,73],[88,78],[88,91]]],
 [1.25,[[64,73],[73,76],[88,78],[98,80]]],
 [1.8,[[64,73],[59,60],[51,48],[53,33],[43,21],[30,24],[22,30]]],
 [1.8,[[96,68],[108,59],[114,45],[124,35],[124,23]]],
 [1.4,[[53,33],[71,26],[91,32],[114,45]]],
 [1.8,[[74,94],[79,108],[84,123],[96,132],[114,128],[129,119],[137,128]]],
 [1.15,[[63,84],[56,90],[47,103],[41,114],[28,120],[22,110]]],
 [1.05,[[47,103],[39,90],[26,85],[25,70],[30,54],[42,48],[51,48]]],
 [.95,[[47,103],[51,115],[63,121],[76,115],[79,108]]],
 [1.9,[[98,80],[112,83],[125,92],[133,100],[131,112],[129,119]]],
 [1.4,[[108,59],[126,63],[133,61],[134,51]]],
 [1.2,[[96,68],[104,74],[115,72],[126,63]]],
 [1.3,[[103,53],[106,63],[105,74],[112,83]]],
 [1.2,[[115,53],[117,62],[115,72],[122,80],[125,92]]],
 [1.1,[[98,58],[106,63],[117,62],[128,69]]],
 [1.0,[[103,89],[99,102],[109,114],[114,128]]],
 [1.0,[[30,24],[26,37],[39,43],[51,48]]],
 [.95,[[84,123],[74,130],[63,121]]]
];
function stampRoad(x,y,r,kind){
 for(let yy=Math.floor(y-r-1);yy<=Math.ceil(y+r+1);yy++)for(let xx=Math.floor(x-r-1);xx<=Math.ceil(x+r+1);xx++){
  if(!inBounds(xx,yy)||Math.hypot(xx-x,yy-y)>r+.2)continue;
  const k=coord(xx,yy);if(shoreDistance[k]>0||terrain[k]===TERRAIN.WATER)continue;
  const old=terrain[k];terrain[k]=old===TERRAIN.RIVER?TERRAIN.BRIDGE:old===TERRAIN.PLAZA?old:kind;
 }
}
for(const route of routes){route[0]=Math.max(.58,route[0]*.72*layoutScale);route[1]=route[1].map(p=>p.map(v=>v*layoutScale));}
for(const [width,points] of routes)for(let i=0;i<points.length-1;i++){
 const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
 for(let j=0;j<=30;j++){
  const t=j/30,t2=t*t,t3=t2*t;
  const value=a=>.5*(2*p1[a]+(-p0[a]+p2[a])*t+(2*p0[a]-5*p1[a]+4*p2[a]-p3[a])*t2+(-p0[a]+3*p1[a]-3*p2[a]+p3[a])*t3);
  stampRoad(value(0),value(1),width,width<1.2?TERRAIN.PATH:TERRAIN.ROAD);
 }
}
// Secondary lanes make every district feel like a connected neighbourhood.
routes.push(
 [1.05,[[22,30],[35,27],[48,31],[53,33],[59,43],[51,48]]],
 [.9,[[30,54],[42,58],[51,48],[63,51],[69,65]]],
 [1.0,[[53,33],[63,39],[72,42],[83,39],[91,32]]],
 [1.15,[[71,26],[77,35],[88,40],[101,45],[108,59]]],
 [.9,[[84,62],[92,55],[101,52],[108,59]]],
 [1.0,[[96,80],[91,91],[96,103],[109,114]]],
 [.9,[[74,94],[68,101],[63,111],[63,121]]],
 [1.0,[[47,103],[57,96],[63,84],[69,65]]],
 [1.1,[[112,83],[116,96],[129,104],[139,103],[145,111]]],
 [.9,[[125,92],[137,88],[146,92],[151,103]]],
 [1.0,[[129,119],[140,125],[151,122],[155,112]]],
 [.85,[[22,110],[34,118],[41,129],[54,132]]],
 [.9,[[39,90],[31,83],[22,83],[17,91]]],
 [.85,[[114,45],[128,42],[140,48],[145,58]]],
 [.9,[[128,69],[139,73],[148,81],[151,92]]],
 [1.0,[[84,123],[91,137],[103,143],[117,145],[129,139]]]
);
// Short farm approaches and an orchard lane connect to the country road.
for(const f of fields){const road=routes[8][1].reduce((best,p)=>Math.hypot(p[0]-f.x,p[1]-f.y)<Math.hypot(best[0]-f.x,best[1]-f.y)?p:best,routes[8][1][0]);for(let j=0;j<=30;j++)stampRoad(f.x+(road[0]-f.x)*j/30,f.y+(road[1]-f.y)*j/30,.65,TERRAIN.PATH);routes.push([.65,[[f.x,f.y],road]]);}
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const k=coord(x,y);if([TERRAIN.ROAD,TERRAIN.PLAZA,TERRAIN.PATH,TERRAIN.BRIDGE].includes(terrain[k]))roadCells.push(k);}
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
 ["Sunset Lighthouse","lighthouse",277,112,6,7,"A lighthouse overlooking the warm eastern shore."],
 ["Willowmere Gardens","greenhouse",177,132,11,9,"A botanical garden of winding paths, glasshouses, rose beds and quiet fountains."],
 ["The Old Watermill","watermill",83,220,9,8,"A restored riverside mill beside a little stone bridge and flower meadow."],
 ["Grand Central Station","station",205,116,12,9,"A grand railway station with a broad forecourt, clock and busy platforms."],
 ["Sunflower Farm","farm",54,252,10,8,"A family farm surrounded by golden fields, orchards and country lanes."],
 ["Seaglass Pier","harbour",294,188,10,8,"A wooden pier with fishing boats, seaside cafés and views across the bay."],
 ["Rosewater Baths","greenhouse",254,224,9,8,"A warm glass-roofed bathhouse set among Mediterranean gardens."]
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
for(const [name,kind,seedX,seedY,seedW,seedH,description] of landmarkSeeds){
 // Compact landmark courtyards along with the map so they still fit between streets.
 const landmarkScale=Math.min(1,N/226),w=Math.max(2,Math.round(seedW*landmarkScale)),h=Math.max(2,Math.round(seedH*landmarkScale));
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
// Frontages follow the winding streets; neither lots nor building sizes repeat on a grid.
function addNeighbourhoodBuilding(x,y,w,h,kind,name,style){
 const b=occupy({x,y,w,h,kind,name,style,biome:biomes[coord(x,y)],district:districts[coord(x,y)],description:
  kind==="skyscraper"?"A slender city tower with rooftop machinery, fire escapes and independent businesses at street level.":
  kind==="barn"?"A working farm barn with hay, tools and animals wandering nearby.":
  kind==="farm"?"A countryside farmhouse beside winding lanes, orchards and vegetable fields.":
  kind==="cafe"?"A neighbourhood café with outdoor tables, tiny signs, warm windows and freshly brewed coffee.":
  kind==="bakery"?"An independent bakery with pastries, bread crates and a welcoming shopfront.":
  kind==="house"?"A lived-in home with an uneven roofline, balconies and a little garden.":
  "An independent local business with a weathered shopfront and a street full of little details.",enterable:true,landmark:false});
 b.door=doorFor(b);return b;
}
// Reserve one clean, reachable plot for every new design before placing filler houses.
const newDesigns=window.LWBuildingDesigns||[];
const designAnchors={town:[79,85],metro:[105,60],country:[43,106],forest:[53,36],winter:[31,27],harbour:[128,96]};
function zonePenalty(d,x,y){
 const k=coord(x,y),district=districts[k],biome=biomes[k];
 if(d.zone==="winter")return biome===B.WINTER?0:80;
 if(d.zone==="country")return district===D.COUNTRY?0:35;
 if(d.zone==="metro")return district===D.METRO?0:25;
 if(d.zone==="harbour")return district===D.HARBOUR||biome===B.COAST?0:20;
 if(d.zone==="forest")return district===D.FOREST&&biome!==B.WINTER?0:15;
 return district===D.TOWN?0:12;
}
const designPlacements=[];
for(const d of [...newDesigns].sort((a,b)=>b.w*b.h-a.w*a.h)){
 const anchor=designAnchors[d.zone],ax=anchor[0]*layoutScale,ay=anchor[1]*layoutScale;
 let best=null,bestScore=Infinity;
 for(let y=2;y<N-d.h-2;y++)for(let x=2;x<N-d.w-2;x++){
  const distance=Math.hypot(x+d.w/2-ax,y+d.h/2-ay),penalty=zonePenalty(d,x,y);
  if(distance+penalty>=bestScore||!clearFootprint(x,y,d.w,d.h))continue;
  let cultivated=false;for(let yy=y;yy<y+d.h;yy++)for(let xx=x;xx<x+d.w;xx++)if([TERRAIN.FIELD,TERRAIN.ORCHARD,TERRAIN.CLIFF].includes(terrain[coord(xx,yy)]))cultivated=true;
  if(cultivated)continue;
  const door=doorFor({x,y,w:d.w,h:d.h}),approach=Math.abs(door.x-x-d.w/2)+Math.abs(door.y-y-d.h);
  if(approach>6)continue;
  const score=distance+penalty+approach*.8+hash(x,y,d.frame+841)*.8;
  if(score<bestScore){best={x,y};bestScore=score;}
 }
 if(!best)throw new Error("No clean plot for "+d.name);
 const b=addNeighbourhoodBuilding(best.x,best.y,d.w,d.h,d.kind,d.name,"cozy");
 b.designId=d.id;b.artGroup=d.group;b.artFrame=d.frame;b.architecture=d.architecture;b.zone=d.zone;
 b.description=d.architecture+". A welcoming neighbourhood place with flowering planters, warm windows and thoughtful little details.";
 if(d.kind==="skyscraper")b.floors=8+d.frame;
 designPlacements.push({id:d.id,buildingId:b.id});
}
let countryBuildings=0,fillerCount=0;
for(let i=0;i<15000&&fillerCount<95;i++){
 const x=5+Math.floor(hash(i,620,1)*(N-13)),y=5+Math.floor(hash(i,620,2)*(N-13));
 const district=districts[coord(x,y)],w=3+(hash(i,620,3)>.75?1:0),h=3+(hash(i,620,4)>.65?1:0);
 if(!clearFootprint(x,y,w,h))continue;
 if(district===D.FOREST&&hash(i,620,5)>.5)continue;
 let cultivated=false;for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)if([TERRAIN.FIELD,TERRAIN.ORCHARD,TERRAIN.CLIFF].includes(terrain[coord(xx,yy)]))cultivated=true;
 if(cultivated||district===D.COUNTRY&&countryBuildings>=4)continue;
 const d=doorFor({x,y,w,h});if(Math.abs(d.x-x-w/2)+Math.abs(d.y-y-h)>5)continue;
 const r=hash(i,620,6);let kind=r<.31?"house":r<.55?"cafe":r<.76?"shop":r<.89?"bakery":"restaurant";
 if(district===D.COUNTRY){kind=countryBuildings%3===0?"barn":"farm";countryBuildings++;}
 const choices=labels[kind]||[kind==="barn"?"Meadow Barn":"Willow Farmhouse"],name=choices[Math.floor(hash(i,620,7)*choices.length)];
 addNeighbourhoodBuilding(x,y,w,h,kind,name,district===D.COUNTRY?"country":"village");fillerCount++;
}
// Small, uneven storefronts fill gaps along the old town lanes and station quarter.
for(let i=0;i<11000&&fillerCount<160;i++){
 const x=8+Math.floor(hash(i,634,1)*(N-18)),y=8+Math.floor(hash(i,634,2)*(N-18)),district=districts[coord(x,y)];
 if(![D.TOWN,D.METRO,D.HARBOUR].includes(district)||!clearFootprint(x,y,2,2))continue;
 const d=doorFor({x,y,w:2,h:2});if(Math.abs(d.x-x-1)+Math.abs(d.y-y-2)>3)continue;
 const r=hash(i,634,3),kind=r<.45?"shop":r<.8?"cafe":"bakery",choices=labels[kind];
 addNeighbourhoodBuilding(x,y,2,2,kind,choices[Math.floor(hash(i,634,4)*choices.length)],"village");fillerCount++;
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
// Hand-placed focal details give the parks and squares recognisable centres.
const focalDecor=[
 [77,74,"fountain"],[101,45,"fountain"],[119,91,"fruitstall"],
 [53,33,"bench"],[30,75,"lantern"],[88,119,"bench"],
 [145,118,"planter"],[77,78,"bench"],[104,48,"flowers"],
 [120,94,"boat"],[90,34,"flowers"],[25,79,"bench"]
];
for(const [ox,oy,kind] of focalDecor){
 const x=Math.round(ox*layoutScale),y=Math.round(oy*layoutScale);
 if(!inBounds(x,y)||occupied[coord(x,y)]>=0)continue;
 const k=coord(x,y),t=terrain[k];
 if(t===TERRAIN.WATER||t===TERRAIN.RIVER)continue;
 for(let i=objects.length-1;i>=0;i--)if(Math.hypot(objects[i].x-x,objects[i].y-y)<1.35)objects.splice(i,1);
 objects.push({x,y,kind,biome:biomes[k],variant:hash(x,y,887)*4|0});
}
// Regional street dressing stays outside building footprints and leaves routes open.
// Decorative objects never alter collision or pathfinding.
for(let y=4;y<N-4;y+=2)for(let x=4;x<N-4;x+=2){
 const k=coord(x,y),t=terrain[k],biome=biomes[k],r=hash(x,y,181);
 if(occupied[k]>=0||t===TERRAIN.WATER||t===TERRAIN.RIVER||t===TERRAIN.BRIDGE)continue;
 const winter=biome===B.WINTER,warm=biome===B.SUMMER||biome===B.COAST;
 if(t===TERRAIN.ROAD||t===TERRAIN.PATH){
  const edge=[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>inBounds(x+dx,y+dy)&&!isStreet(x+dx,y+dy));
  if(!edge||r>.09)continue;
  objects.push({x,y,kind:r<.035?"lantern":r<.065?"planter":"bench",biome,variant:Math.floor(hash(x,y,182)*4)});continue;
 }
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
// Layered frontages: shop signs, service equipment, bins, steps and small utilities.
function dress(x,y,kind,variant=0,ox=0,oy=0){
 if(!inBounds(x,y))return;
 const k=coord(x,y);if(occupied[k]>=0||[TERRAIN.WATER,TERRAIN.RIVER].includes(terrain[k]))return;
 objects.push({x,y,kind,variant,ox,oy,biome:biomes[k]});
}
for(const b of buildings){
 const urban=b.style==="urban"||b.district===D.METRO,business=["shop","cafe","bakery","restaurant","market"].includes(b.kind);
 if(b.kind==="farm"||b.kind==="barn"){
  for(const [dx,dy,kind] of [[-1,0,"haybale"],[b.w,1,"beehive"],[0,b.h,"well"],[b.w-1,b.h,"crate"],[-1,b.h-1,"gate"]])dress(b.x+dx,b.y+dy,kind,b.id);
 }else if(b.designId||urban||business){
  for(const [dx,dy,kind,ox,oy] of [[-1,0,"warmLamp",15,0],[b.w,0,"planter",-13,0],[-1,b.h-1,"flowerbed",15,0],[b.w,b.h-1,"warmLamp",-13,0],[0,b.h,"planter",0,-15],[b.w-1,b.h,"flowerbed",0,-15],[Math.floor(b.w/2),-1,"fairyLights",0,8]])dress(b.x+dx,b.y+dy,kind,b.id,ox,oy);

 }
}
for(const f of fields){
 for(let j=0;j<10;j++){
  const a=j*Math.PI/5,c=Math.cos(f.angle),s=Math.sin(f.angle),dx=Math.cos(a)*(f.rx+.7),dy=Math.sin(a)*(f.ry+.7);
  const x=Math.round(f.x+dx*c-dy*s),y=Math.round(f.y+dx*s+dy*c);
  if(![TERRAIN.PATH,TERRAIN.ROAD,TERRAIN.BRIDGE].includes(terrain[coord(x,y)]))dress(x,y,j===0?"gate":"farmfence",j);
 }
 dress(Math.round(f.x-f.rx-1),Math.round(f.y),"scarecrow",1);
}
for(let y=2;y<N-2;y++)for(let x=2;x<N-2;x++){
 const k=coord(x,y),t=terrain[k],r=hash(x,y,720);
 if(occupied[k]>=0||t===TERRAIN.WATER||t===TERRAIN.RIVER)continue;
 if(t===TERRAIN.CLIFF&&r<.55)dress(x,y,"coastRock",Math.floor(r*16));
 else if(shoreDistance[k]>-3&&r<.15)dress(x,y,"coastRock",Math.floor(r*16));
 else if(districts[k]===D.COUNTRY&&[TERRAIN.MEADOW,TERRAIN.GRASS].includes(t)&&r<.1)dress(x,y,"drygrass",Math.floor(r*20));
 else if([TERRAIN.GRASS,TERRAIN.MEADOW,TERRAIN.PARK].includes(t)&&r<.12&&[[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>terrain[coord(x+dx,y+dy)]===TERRAIN.RIVER))dress(x,y,"reeds",0);
 else if(t===TERRAIN.PLAZA&&r<.035)dress(x,y,"bicycle",0);
}
// Keep the new facades and their approaches readable; tall canopies belong behind homes or beside lanes.
let sceneryWrite=0;
for(const o of objects){
 const tall=["tree","pine","palm"].includes(o.kind);
 if(tall&&buildings.some(b=>o.x>=b.x-1&&o.x<=b.x+b.w&&o.y>=b.y+b.h&&o.y<=b.y+b.h+3))continue;
 objects[sceneryWrite++]=o;
}
objects.length=sceneryWrite;
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
const initial=closestWalkable(79*layoutScale,85*layoutScale,true)||closestWalkable(79*layoutScale,85*layoutScale);
const seasonCounts=[0,0,0,0,0];
for(let i=0;i<LENGTH;i++)if(terrain[i]!==TERRAIN.WATER)seasonCounts[biomes[i]]++;
window.LWWorldData={
 N,T,newDesigns,designPlacements,designAnchors,designScale,layoutScale,riverX,riverBranch,pond,D,districts,districtAnchors,baseTerrain,shoreAt:deltaSea,shoreDistance,fields,fieldAt,routes,SIZE:N*T,TERRAIN,B,terrain,biomes,occupied,buildings,landmarks,objects,streetCells,
 initial,seasonCounts,hash,coord,inBounds,isLand,isWalkable,isStreet,closestWalkable,findPath,
 info:{square:false,regionCount:5,buildings:buildings.length,landmarks:landmarks.length,
 tileCount:LENGTH,worldArea:N*T*N*T,previousArtArea:11200*8200}
};
})();