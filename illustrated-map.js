/* Little Worlds: illustrated world map
   The generated painting is the visible world. Existing tasks, saved progress,
   navigation, touch controls and map-place discovery remain in index.html.
   This script adds visible interactive landmarks and independent walking NPCs.
*/
(()=>{
"use strict";
const NS="http://www.w3.org/2000/svg";
const WIDTH=11200,HEIGHT=8200,IMAGE_WIDTH=1448,IMAGE_HEIGHT=1086;
const layer=document.createElementNS(NS,"g");
layer.setAttribute("id","illustrated-city");
layer.setAttribute("aria-label","Interactive illustrated city map");
world.appendChild(layer);
function node(tag,attrs={},parent=layer){
 const el=document.createElementNS(NS,tag);
 for(const [key,val] of Object.entries(attrs))el.setAttribute(key,String(val));
 parent.appendChild(el);
 return el;
}
const picture=node("image",{
 x:0,y:0,width:WIDTH,height:HEIGHT,
 href:"./assets/wish-wander-map.png",
 preserveAspectRatio:"none",
 "aria-label":"Detailed pixel-art European coastal city with four seasons and landmarks",
 "image-rendering":"auto"
});
picture.style.pointerEvents="none";
function where(px,py){return{x:px*WIDTH/IMAGE_WIDTH,y:py*HEIGHT/IMAGE_HEIGHT}}
const locations=[
 {px:525,py:303,name:"Clocktower Square",desc:"The grand civic heart of Wish & Wander. Visit the square beneath the clock tower and its fountain."},
 {px:900,py:257,name:"The Leaning Tower",desc:"A sunlit Italian-style piazza around a curious leaning bell tower."},
 {px:1090,py:398,name:"The Old Amphitheatre",desc:"Ancient Roman stone arches and a leafy performance square."},
 {px:529,py:155,name:"Glass Conservatory",desc:"A grand greenhouse nestled amongst pink blossom and formal gardens."},
 {px:1154,py:87,name:"Snowfall Lodge",desc:"A cosy alpine settlement with frosted pines, quiet paths and a warm chalet."},
 {px:1285,py:219,name:"Copperleaf Gardens",desc:"The autumn quarter, full of amber trees, stone terraces and little villas."},
 {px:248,py:122,name:"Windmill Woods",desc:"A winding woodland route past a rustic windmill, fields and waterfalls."},
 {px:455,py:226,name:"Blossom Riverside",desc:"Spring flowers, canal bridges and romantic garden walks."},
 {px:390,py:456,name:"Old Stone Bridge",desc:"An arched crossing between cafés, flower markets and the old town."},
 {px:633,py:505,name:"Market Streets",desc:"Cosy townhouses, tiny bakeries and striped market awnings."},
 {px:792,py:732,name:"Harbour Quay",desc:"A busy waterside promenade with little sailing boats and fishing stalls."},
 {px:253,py:786,name:"Sunny Beach",desc:"A palm-lined sandy beach where people picnic by the turquoise sea."},
 {px:118,py:650,name:"Little Lighthouse",desc:"A lighthouse perched on the cliffs above the southern cove."},
 {px:1114,py:842,name:"Seaglass Lookout",desc:"A cliffside pavilion and garden overlooking the harbour."},
 {px:1053,py:601,name:"Seaside Terraces",desc:"Stone steps, waterfront cafés and panoramic views over the bright sea."},
 {px:972,py:465,name:"Roman Gardens",desc:"Hidden colonnades, fountains and quiet courtyards beside the amphitheatre."}
];
const placeLayer=node("g",{id:"illustrated-places"});
for(const [i,p] of locations.entries()){
 const {x,y}=where(p.px,p.py);
 const g=node("g",{
  transform:"translate("+x+" "+y+")",
  role:"button",tabindex:"0",
  "aria-label":"Explore "+p.name,
  style:"cursor:pointer"
 },placeLayer);
 node("circle",{r:96,fill:"transparent","pointer-events":"all"},g);
 node("circle",{r:38,fill:"#fff4d5","fill-opacity":".88",stroke:"#765c4a","stroke-width":8},g);
 node("circle",{r:14,fill:i%3===0?"#bc7560":"#759c7a"},g);
 const action=e=>{e.stopPropagation();selectPlace({name:p.name,desc:p.desc})};
 g.addEventListener("click",action);
 g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();action(e)}});
 g.addEventListener("pointerenter",()=>g.querySelectorAll("circle")[1].setAttribute("stroke","#f6efd1"));
 g.addEventListener("pointerleave",()=>g.querySelectorAll("circle")[1].setAttribute("stroke","#765c4a"));
}
// Pixel characters move along short routes placed over the painted streets.
// Animation is lightweight and pauses when the city section is hidden.
const pedestrians=node("g",{id:"illustrated-pedestrians","pointer-events":"none"});
const colors=["#bb765b","#5e7f92","#af9a5e","#778f68","#b687a7","#d0a26b","#546b83","#c77363"];
const hairColors=["#483932","#745141","#c1986a","#302e34","#a66e42"];
const skinColors=["#dcaa89","#a67a60","#f0c79e","#be9172"];
const walkingZones=[
 {x:530,y:335,dx:210,dy:-25,n:10},
 {x:705,y:480,dx:185,dy:30,n:9},
 {x:830,y:680,dx:180,dy:65,n:8},
 {x:396,y:410,dx:190,dy:-20,n:7},
 {x:460,y:245,dx:110,dy:-20,n:6},
 {x:1090,y:390,dx:150,dy:15,n:6},
 {x:1200,y:198,dx:85,dy:65,n:5},
 {x:1100,y:99,dx:115,dy:4,n:5},
 {x:295,y:789,dx:112,dy:4,n:5}
];
let seed=2525;
function rnd(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}
const actors=[];
for(const [zi,z] of walkingZones.entries()){
 for(let j=0;j<z.n;j++){
  const x=z.x+(rnd()-.5)*z.dx,y=z.y+(rnd()-.5)*z.dy+((rnd()-.5)*45);
  const worldPoint=where(x,y);
  const actor=node("g",{"shape-rendering":"crispEdges"},pedestrians);
  const body=colors[(j+zi*3)%colors.length];
  const hair=hairColors[(j+zi)%hairColors.length];
  const skin=skinColors[(j*2+zi)%skinColors.length];
  // Sprite units are enlarged to remain visible above the illustration at iPad scale.
  const sprite=node("g",{transform:"scale(3.3)"},actor);
  node("ellipse",{cx:0,cy:9,rx:8,ry:2,fill:"#453a37",opacity:".25"},sprite);
  node("rect",{x:-5,y:-8,width:11,height:14,fill:body},sprite);
  node("rect",{x:-4,y:-17,width:9,height:10,fill:skin},sprite);
  node("rect",{x:-5,y:-20,width:11,height:5,fill:hair},sprite);
  node("rect",{x:-7,y:-5,width:3,height:9,fill:body},sprite);
  const left=node("rect",{x:-4,y:6,width:4,height:7,fill:"#45515d"},sprite);
  const right=node("rect",{x:2,y:6,width:4,height:7,fill:"#45515d"},sprite);
  node("rect",{x:7,y:-5,width:3,height:8,fill:body},sprite);
  node("rect",{x:-2,y:-14,width:2,height:2,fill:"#383c40"},sprite);
  node("rect",{x:3,y:-14,width:2,height:2,fill:"#383c40"},sprite);
  actors.push({actor,left,right,worldPoint,dx:z.dx*WIDTH/IMAGE_WIDTH*.34,dy:z.dy*HEIGHT/IMAGE_HEIGHT*.34,
   speed:.19+rnd()*.32,phase:rnd()*Math.PI*2,index:actors.length});
 }
}
let frame=0,lastTime=0;
function animate(t){
 requestAnimationFrame(animate);
 if(document.getElementById("city").classList.contains("hidden"))return;
 if(t-lastTime<32)return; // 30 fps is ample for tiny walkers and saves battery
 lastTime=t;
 frame++;
 for(const p of actors){
  const u=t*.0012*p.speed+p.phase;
  const v=Math.sin(u);
  const xx=p.worldPoint.x+p.dx*v;
  const yy=p.worldPoint.y+p.dy*v;
  const flip=Math.cos(u)<0?" scale(-1 1)":"";
  p.actor.setAttribute("transform","translate("+xx.toFixed(1)+" "+yy.toFixed(1)+")"+flip);
  const stride=frame%10<5?2:-2;
  p.left.setAttribute("x",-4+stride);
  p.right.setAttribute("x",2-stride);
 }
}
picture.addEventListener("load",()=>{
 // Hide, rather than delete, the prototype drawings. Source artwork, map systems,
 // original landmarks, quests and progress remain available in the repository.
 for(const child of Array.from(world.children)){
  if(child!==layer)child.setAttribute("display","none");
 }
 // Old invisible NPCs no longer need per-frame movement.
 sprites.length=0;
 layer.setAttribute("data-art-loaded","true");
});
picture.addEventListener("error",()=>{
 // Preserve the previous vector world as fallback in case the PNG cannot load.
 layer.setAttribute("display","none");
 console.error("The illustrated city map asset failed to load.");
});
window.LittleWorldsIllustrated={
 image:"assets/wish-wander-map.png",
 width:WIDTH,height:HEIGHT,
 locations:locations.length,npcs:actors.length,
 ready:()=>layer.getAttribute("data-art-loaded")==="true"
};
requestAnimationFrame(animate);
})();