const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const context=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../world-buildings.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../world-data.js'),'utf8'),context);
const w=context.window.LWWorldData;

test('pocket map halves both dimensions and retains all climates and landmarks',()=>{
 assert.equal(w.N,160/2);
 assert.equal(w.SIZE,160*w.T/2);
 assert.equal(w.info.worldArea/((160*w.T)**2),.25);
 assert.equal(w.landmarks.length,12);
 assert(w.seasonCounts.every(n=>n>0));
 assert(w.buildings.length>=60&&w.buildings.length<110);
 for(const l of w.landmarks)assert(w.inBounds(l.x+l.w-1,l.y+l.h-1),l.name+' must fit within the smaller world');
 for(const name of ['Frostglass Lodge','Snowbell Square'])assert.equal(w.landmarks.find(l=>l.name===name).biome,w.B.WINTER,name+' must stay in snow country');
 for(const name of ['Blossom Conservatory','Petal Gardens'])assert.equal(w.landmarks.find(l=>l.name===name).biome,w.B.SPRING,name+' must stay in the spring region');
});

test('every landmark remains reachable from the arrival street',()=>{
 for(const l of w.landmarks){
  const route=w.findPath(w.initial.x,w.initial.y,l.door.x,l.door.y);
  assert(route.length>0,l.name+' must remain reachable');
  for(const p of route)assert(w.isWalkable(p.x,p.y),l.name+' route crosses a blocked tile');
 }
});

test('buildings and decoration stay inside the world and preserve streets',()=>{
 for(const b of w.buildings){
  assert(w.inBounds(b.x,b.y)&&w.inBounds(b.x+b.w-1,b.y+b.h-1));
  for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)assert.equal(w.occupied[w.coord(x,y)],b.id,'Building footprints must not overlap');
 }
 for(const k of w.streetCells)assert(w.isStreet(k%w.N,Math.floor(k/w.N)));
 for(const o of w.objects){assert(w.inBounds(o.x,o.y));assert.equal(w.occupied[w.coord(o.x,o.y)],-1,'Decoration must not spawn inside buildings');}
});

// The bounding grid stays compact, but the playable land and road network are irregular.
test('island coastline has bays, countryside and a limited skyline',()=>{
 assert.equal(w.info.square,false);
 for(const [x,y] of [[0,0],[0,w.N-1],[w.N-1,0],[w.N-1,w.N-1]])assert.equal(w.terrain[w.coord(x,y)],w.TERRAIN.WATER);
 const edges=new Set();
 for(let y=5;y<w.N-5;y++){let first=-1;for(let x=0;x<w.N;x++)if(w.isLand(x,y)){first=x;break;}if(first>=0)edges.add(first);}
 assert(edges.size>12,'The coastline must not be a rectangle');
 assert.equal(w.buildings.filter(b=>b.kind==='skyscraper').length,4);
 for(const kind of ['farm','barn','watermill','windmill'])assert(w.buildings.some(b=>b.kind===kind));
 assert(w.buildings.filter(b=>b.kind==='cafe').length>=6);
 assert(w.fields.length>=6);
});

vm.runInContext(fs.readFileSync(path.join(__dirname,'../world-wildlife.js'),'utf8'),context);
const wildlife=context.window.LWWildlife;
test('all wildlife moves while respecting buildings, water and farm habitats',()=>{
 assert.equal(wildlife.animals.length,70);
 const before=wildlife.animals.map(a=>({x:a.x,y:a.y}));
 for(let step=0;step<1200;step++){
  wildlife.update(1/60);
  if(step%30===0)for(const a of wildlife.animals)assert(wildlife.canWalk(a.kind,Math.floor(a.x/w.T),Math.floor(a.y/w.T)),a.kind+' crossed a habitat or collision boundary');
 }
 assert(wildlife.animals.filter((a,i)=>Math.hypot(a.x-before[i].x,a.y-before[i].y)>10).length>60);
 for(const kind of ['dog','cat','pigeon','chicken','sheep','cow'])assert(wildlife.animals.some(a=>a.kind===kind&&a.step>0),kind+' must walk');
});


test('all fifty new designs are distinct, placed once and reachable',()=>{
 const atlas=JSON.parse(fs.readFileSync(path.join(__dirname,'../assets/atlas.json'),'utf8'));
 assert.equal(w.newDesigns.length,50);
 assert.equal(w.designPlacements.length,50);
 assert.equal(new Set(w.newDesigns.map(d=>d.id)).size,50);
 assert.equal(new Set(w.newDesigns.map(d=>d.group+':'+d.frame)).size,50);
 for(const d of w.newDesigns){
  const buildings=w.buildings.filter(b=>b.designId===d.id);assert.equal(buildings.length,1,d.name+' needs its own plot');
  const b=buildings[0],frame=atlas[d.group].frames[d.frame];assert(frame&&frame.w>0&&frame.h>0,d.name+' needs distinct artwork');
  assert(fs.existsSync(path.join(__dirname,'..',atlas[d.group].url)));
  assert(w.isWalkable(b.door.x,b.door.y),d.name+' needs a clear entrance');
  assert(w.findPath(w.initial.x,w.initial.y,b.door.x,b.door.y).length>0,d.name+' must be reachable');
 }
 for(const kind of ['hospital','clinic','cinema','theatre','library','pharmacy','skyscraper','house'])assert(w.buildings.some(b=>b.designId&&b.kind===kind));
});
