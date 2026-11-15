const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const context=vm.createContext({window:{}});
vm.runInContext(fs.readFileSync(path.join(__dirname,'../world-data.js'),'utf8'),context);
const w=context.window.LWWorldData;

test('compact map retains all five climates and all twelve landmarks',()=>{
 assert(Math.abs(w.N*w.N/(320*320)-.5)<.002);
 assert.equal(w.landmarks.length,12);
 assert(w.seasonCounts.every(n=>n>0));
 assert(w.buildings.length>400);
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
