const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const context=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../world-data.js'),'utf8'),context);
const w=context.window.LWWorldData;

test('half-size map retains all five climates and all twelve landmarks',()=>{
 assert(Math.abs(w.N*w.N/(226*226)-.5)<.002);
 assert.equal(w.landmarks.length,12);
 assert(w.seasonCounts.every(n=>n>0));
 assert(w.buildings.length>150);
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
 assert(edges.size>20,'The coastline must not be a rectangle');
 assert.equal(w.buildings.filter(b=>b.kind==='skyscraper').length,5);
 assert(w.buildings.filter(b=>b.kind==='farm'||b.kind==='barn').length>=10);
 assert(w.buildings.filter(b=>b.kind==='cafe').length>=40);
 assert(w.fields.length>=6);
});

vm.runInContext(fs.readFileSync(path.join(__dirname,'../world-wildlife.js'),'utf8'),context);
const wildlife=context.window.LWWildlife;
test('all wildlife moves while respecting buildings, water and farm habitats',()=>{
 assert.equal(wildlife.animals.length,280);
 const before=wildlife.animals.map(a=>({x:a.x,y:a.y}));
 for(let step=0;step<1200;step++){
  wildlife.update(1/60);
  if(step%30===0)for(const a of wildlife.animals)assert(wildlife.canWalk(a.kind,Math.floor(a.x/w.T),Math.floor(a.y/w.T)),a.kind+' crossed a habitat or collision boundary');
 }
 assert(wildlife.animals.filter((a,i)=>Math.hypot(a.x-before[i].x,a.y-before[i].y)>10).length>250);
 for(const kind of ['dog','cat','pigeon','chicken','sheep','cow'])assert(wildlife.animals.some(a=>a.kind===kind&&a.step>0),kind+' must walk');
});
