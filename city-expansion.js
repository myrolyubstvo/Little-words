/* Little Worlds: The Living Coast expansion.
   Hand-built SVG pixel-art sprites, seeded scenery, four mixed seasons and coastal exploration.
   Reuses the original world's SVG, NPC animation, places and saved-progress system. */
(()=>{
"use strict";
const W=11200,H=8200;
const layer=el("g",{"class":"pixel-expansion","shape-rendering":"crispEdges"},world);
let seed=0x57a1c;
function random(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296}
function between(a,b){return a+(b-a)*random()}
function pick(a){return a[Math.floor(random()*a.length)]}
const nsx="http://www.w3.org/1999/xlink";
const use=(id,x,y,s=1,p=layer,rotation=0)=>{
 const n=el("use",{href:"#"+id,transform:"translate("+Math.round(x)+" "+Math.round(y)+") rotate("+rotation+") scale("+s+")"},p);
 if(n.setAttributeNS)n.setAttributeNS(nsx,"xlink:href","#"+id);
 return n;
};
function pixel(id){return el("g",{id},defs)}
function rect(p,x,y,w,h,c,more={}){return el("rect",{x,y,width:w,height:h,fill:c,...more},p)}
function path(p,d,c,more={}){return el("path",{d,fill:c,...more},p)}
function line(p,d,color,width=4,more={}){return path(p,d,"none",{stroke:color,"stroke-width":width,...more})}
const grass=["#81a56c","#97b97a","#bed098","#dae2af"];
const bark=["#6a493e","#896143","#a57a4e"];
const treeKinds=[
 ["oak",["#426e54","#648f59","#85af62","#b1c77b"]],
 ["maple",["#6c8351","#90a765","#b4c67e","#d9d890"]],
 ["blossom",["#987b87","#bd8f9a","#e9b1bd","#f8d9d7"]],
 ["autumn",["#8d563f","#b66f3e","#df994a","#f3c66b"]],
 ["winter",["#7899a0","#a7bcb8","#cbdad9","#f4f7ed"]],
 ["pine",["#305b4e","#49785b","#6d9867","#a5bb8d"]],
 ["willow",["#4e7457","#769a61","#a4bb74","#d6d397"]],
 ["palm",["#426c51","#639b5c","#8fba66","#c5ca79"]]
];
function buildTree(id,cols,kind){
 const g=pixel("lw-tree-"+id);
 rect(g,-38,16,78,12,"#5d624d",{opacity:".20"});
 rect(g,-10,-25,20,58,kind==="winter"?"#766c63":"#73503a");
 rect(g,-15,-8,9,17,"#9e7854");
 rect(g,6,-25,6,24,"#a77b53");
 if(kind==="pine"){
  for(let i=0;i<4;i++){
   const y=-82+i*20, half=14+i*12;
   path(g,"M"+(-half)+" "+(y+29)+"v-10h10v-12h11v-12h"+(half*2-42)+"v12h11v12h10v10Z",cols[i%4]);
   rect(g,-half+12,y+12,7,5,cols[3],{opacity:".65"});
  }
 } else if(kind==="palm"){
  rect(g,-3,-73,9,60,"#967049");
  for(let i=0;i<7;i++){
   const a=i*2*Math.PI/7;
   const dx=Math.cos(a)*55,dy=Math.sin(a)*31;
   line(g,"M2 -79q"+Math.round(dx*.6)+" "+Math.round(dy-10)+" "+Math.round(dx)+" "+Math.round(dy+15),cols[1+i%3],13,{"stroke-linecap":"square"});
  }
 } else if(kind==="willow"){
  rect(g,-36,-68,72,47,cols[1]);
  for(let i=0;i<9;i++){
   const x=-38+i*9;
   rect(g,x,-54+(i%3)*4,6,65+(i%3)*9,cols[1+i%3]);
  }
  rect(g,-24,-76,52,14,cols[2]);
 } else {
  const segments=[[-36,-48,27,32],[-15,-69,30,30],[12,-57,27,32],[-43,-29,25,27],[-18,-44,38,33],[12,-32,30,29],[-11,-81,20,19],[-24,-62,34,30]];
  segments.forEach((q,i)=>rect(g,q[0],q[1],q[2],q[3],cols[i%3]));
  for(let i=0;i<27;i++){
   const xx=Math.floor(between(-34,34)/5)*5, yy=Math.floor(between(-68,-17)/5)*5;
   rect(g,xx,yy,5+(i%3)*2,5+(i%2)*2,cols[2+i%2],{opacity:i%4===0?".72":"1"});
  }
  if(kind==="winter"){for(let i=0;i<8;i++)rect(g,-35+i*9,-68+(i%3)*14,12,6,"#f5f7ef");}
  if(kind==="blossom"){for(let i=0;i<11;i++)rect(g,-31+(i*13)%60,-61+(i*17)%37,6,5,"#f7d8d2");}
 }
}
treeKinds.forEach(t=>buildTree(...t));
function buildBush(id,cols){
 const g=pixel("lw-bush-"+id);
 rect(g,-25,-5,54,13,"#5b6b46",{opacity:".16"});
 [[-22,-18,25,25],[-11,-30,27,33],[10,-20,21,24]].forEach((v,i)=>rect(g,...v,cols[i%3]));
 for(let i=0;i<12;i++)rect(g,-19+(i*11)%42,-26+(i*7)%24,5,5,cols[(i+1)%cols.length]);
}
buildBush("green",["#557f4e","#82a967","#aec77e","#d4dc99"]);
buildBush("spring",["#769765","#a8be8b","#f0b7bb","#fff0d9"]);
buildBush("fall",["#82683d","#b98b4d","#daa767","#f2d18f"]);
buildBush("snow",["#769690","#acc3b6","#d9e5d9","#f6f7ec"]);
function buildDetail(){
 let g=pixel("lw-flowers");
 rect(g,-12,-1,23,4,"#6e9854");
 for(let i=0;i<7;i++){const xx=(i*13)%24-12,yy=(i*9)%16-16;rect(g,xx,yy,3,9,"#70935b");rect(g,xx-3,yy-3,8,6,["#eaa7aa","#f4d879","#f7f0e4","#b6b2d5"][i%4])}
 g=pixel("lw-grass");
 for(let i=0;i<6;i++){rect(g,-12+i*4,-(i%3)*5-6,3,11+(i%3)*3,["#709359","#7c9b5e","#a1b976"][i%3]);}
 g=pixel("lw-stone");
 rect(g,-16,-4,35,9,"#74786b",{opacity:".18"});
 rect(g,-12,-15,23,13,"#9e9f8b");rect(g,-8,-19,15,6,"#c1bcaa");rect(g,7,-11,8,8,"#7e8175");
 g=pixel("lw-lamp");
 rect(g,-4,-55,8,55,"#6f5e4b");rect(g,-8,-64,16,13,"#edd79b");rect(g,-11,-67,22,5,"#655b54");rect(g,-7,-8,14,7,"#5a5d54");
 g=pixel("lw-bench");
 rect(g,-32,-17,64,7,"#9c694b");rect(g,-32,-28,64,7,"#bd8b5b");rect(g,-25,-9,6,14,"#5f554b");rect(g,22,-9,6,14,"#5f554b");
 g=pixel("lw-umbrella");
 rect(g,-2,-14,5,42,"#8d6c52");path(g,"M-32 -14v-10h7v-11h14v-9h23v9h13v11h7v10Z","#d47f70");
 for(let i=0;i<4;i++)rect(g,-27+i*14,-24,7,10,i%2?"#f5dfae":"#e9a493");
 g=pixel("lw-boat");
 rect(g,-45,0,90,12,"#665347");path(g,"M-43 8h86l-16 23h-54Z","#f1e3c7");rect(g,-4,-49,7,49,"#7d664b");path(g,"M4 -46V-4H37Z","#fff2d8");rect(g,-24,0,43,5,"#8e7258");
 g=pixel("lw-fountain");
 rect(g,-35,3,70,14,"#b4a48b");rect(g,-26,-8,52,14,"#85b6ba");rect(g,-15,-18,30,15,"#ddd1b9");rect(g,-6,-37,12,20,"#92bfbb");rect(g,-20,-11,40,5,"#b9ded7");
 g=pixel("lw-crate");
 rect(g,-14,-22,28,26,"#aa8058");rect(g,-10,-18,20,18,"#c49c6d");rect(g,-14,-12,28,4,"#826049");
 g=pixel("lw-hedge");
 rect(g,-26,-20,54,24,"#638757");rect(g,-20,-30,41,15,"#8eaf70");rect(g,-22,-16,49,8,"#9bbb78");
}
buildDetail();
const houses=[
 {id:"summer",wall:"#e9c6a4",wall2:"#f8e0be",roof:"#b86f55",roof2:"#e5a06e",trim:"#8d6453"},
 {id:"spring",wall:"#eed7d4",wall2:"#f6e7da",roof:"#a57c82",roof2:"#d9a8aa",trim:"#946f73"},
 {id:"autumn",wall:"#d9b98e",wall2:"#f2d4a4",roof:"#a76048",roof2:"#d89262",trim:"#865d4d"},
 {id:"winter",wall:"#d4dfe1",wall2:"#e7edf0",roof:"#69868b",roof2:"#a0b7b8",trim:"#6c7c82"},
 {id:"historic",wall:"#ebd6b6",wall2:"#fff0d4",roof:"#ae6653",roof2:"#d08f72",trim:"#8e6652"},
 {id:"coast",wall:"#f1d9b4",wall2:"#fff0d7",roof:"#698d91",roof2:"#9bbaba",trim:"#886f55"}
];
function makeHouse(h){
 const g=pixel("lw-house-"+h.id);
 rect(g,-56,-10,122,118,"#716551",{opacity:".18"});
 rect(g,-60,-67,120,115,h.wall,{stroke:h.trim,"stroke-width":5});
 rect(g,-51,-59,102,98,h.wall2);
 // stepped tile roof, chimney and decorative eaves
 rect(g,-68,-87,136,18,h.roof);
 rect(g,-58,-105,117,20,h.roof);
 rect(g,-45,-115,90,12,h.roof);
 rect(g,29,-128,19,22,h.trim);rect(g,33,-137,14,10,"#c9ae96");
 for(let y=-104;y<-67;y+=12)for(let x=-56;x<57;x+=17){
  rect(g,x+(y%2?4:0),y,14,5,h.roof2);
 }
 rect(g,-64,-67,129,7,h.trim);
 for(const wx of [-41,16]){
  for(const wy of [-43,-4]){
   rect(g,wx,wy,26,25,"#f5e2c8");
   rect(g,wx+3,wy+3,20,19,"#6a8b94");
   rect(g,wx+12,wy+3,3,19,"#e6decf");
   rect(g,wx-4,wy+22,34,5,h.trim);
   rect(g,wx-4,wy+26,34,3,"#8eaa6b");
   if(h.id==="spring"||h.id==="summer"){rect(g,wx+3,wy+25,6,5,"#e4a7ab");rect(g,wx+22,wy+25,5,5,"#f0cc79")}
  }
 }
 rect(g,-15,1,30,47,h.trim);
 rect(g,-11,5,23,43,"#826652");
 rect(g,5,27,4,4,"#ead2a3");
 rect(g,-60,48,120,9,"#a98d73");
 if(h.id==="winter"){rect(g,-66,-87,132,7,"#f6f8ed");rect(g,-47,-115,92,7,"#f6f8ed");}
 if(h.id==="coast"){rect(g,-62,-58,125,8,"#f3e2cc");rect(g,-46,55,93,10,"#84afaf");}
}
houses.forEach(makeHouse);
function sceneStamp(type,x,y,scale=1,parent=layer){return use(type,x,y,scale,parent)}
// World geometry continues the existing old city rather than covering it.
const eastLand="M7530 0H10540L10600 260L10470 600L10570 1010L10370 1430L10600 1820L10530 2350L10350 2870L10540 3370L10230 3900L10410 4450L10150 5070L9460 5510L8440 5600L7800 5280L7710 4750L7540 4230L7650 3770L7440 3200L7610 2580L7470 2040L7630 1460L7510 900L7590 400Z";
const southLand="M0 4620H5330Q5510 4850 5840 5020T6900 5380Q7470 5510 8210 5650T9310 6250Q9750 6740 9820 7280L9880 8200H0Z";
const eastClip=el("clipPath",{id:"lw-expansion-land"},defs);path(eastClip,eastLand,"#fff");path(eastClip,southLand,"#fff");
path(layer,"M6600 0H11200V8200H0V4620H6600Z","#80b8bf");
const coastLand=el("g",{},layer);
path(coastLand,southLand,"#c8cba7");
path(coastLand,eastLand,"#d7d6b4");
path(coastLand,eastLand,"none",{stroke:"#e9d5ab","stroke-width":38});
path(coastLand,southLand,"none",{stroke:"#e9d5ab","stroke-width":38});
// Shoreline detail: pale sand, foam and patterned sea.
const shore=el("g",{},layer);
line(shore,"M10600 450Q10430 800 10500 1350T10490 2450Q10410 3000 10490 3530T10310 4600","#f6e9cb",27);
line(shore,"M5830 5030Q7080 5440 8320 5680T9740 6580Q9900 7220 9880 8200","#f9ecd0",26);
for(let i=0;i<220;i++){
 const x=between(5350,11200),y=between(40,8170);
 const inEast=x>7450&&y<5400&&x<10600;
 const inSouth=y>=4620&&x<(5350+(y-4620)*1.2);
 if(inEast||inSouth)continue;
 line(shore,"M"+Math.round(x)+" "+Math.round(y)+"h"+(8+i%4*8),"#c5e1d8",2,{opacity:".65"});
}
// Organic seasonal ground patches, applied only over land. No seasonal stripes or fixed sequence.
const seasons={
 winter:{floor:"#dce7e2",path:"#f3efdf",trees:["winter","pine","pine"],bush:"snow",house:"winter",flower:"#edf3ef"},
 spring:{floor:"#bad8a8",path:"#f3e3d6",trees:["blossom","oak","willow"],bush:"spring",house:"spring",flower:"#e3acb8"},
 summer:{floor:"#bacc91",path:"#ead7b0",trees:["oak","maple","palm"],bush:"green",house:"summer",flower:"#efd287"},
 autumn:{floor:"#d8bd93",path:"#e9d6b8",trees:["autumn","maple","oak"],bush:"fall",house:"autumn",flower:"#d99362"},
 coast:{floor:"#d8ca9e",path:"#f2e5c9",trees:["palm","oak","willow"],bush:"green",house:"coast",flower:"#eacb8c"},
 historic:{floor:"#d7cca9",path:"#efdfc8",trees:["oak","maple","willow"],bush:"green",house:"historic",flower:"#e5b18f"}
};
const districts=[
 {x:7500,y:0,w:1650,h:1540,name:"Frostglass Heights",season:"winter",desc:"Snow-dusted pine gardens, stone cottages and a quiet observatory."},
 {x:9150,y:0,w:1730,h:1540,name:"Sunspell Coast",season:"summer",desc:"Warm terraces, sea air and flowering gardens by the eastern beaches."},
 {x:7500,y:1540,w:1650,h:1540,name:"Lantern Canal",season:"autumn",desc:"Copper leaves, lantern bridges and cobbled alleys by the water."},
 {x:9150,y:1540,w:1730,h:1540,name:"Rosewater Lanes",season:"spring",desc:"Blossom trees, rose-coloured roofs and winding flower-market lanes."},
 {x:7500,y:3080,w:1650,h:1540,name:"Olive Market",season:"summer",desc:"Café terraces, old stone arcades and little squares shaded by trees."},
 {x:9150,y:3080,w:1730,h:1540,name:"Seashell Harbour",season:"coast",desc:"A sunny harbour with fishing boats, beaches and a lighthouse."},
 {x:0,y:4620,w:2200,h:1540,name:"Amber Orchard",season:"autumn",desc:"Golden orchards, fallen leaves and a quiet riverside walk."},
 {x:2200,y:4620,w:2200,h:1540,name:"Willowbank",season:"spring",desc:"Pink blossoms, water gardens and arched footbridges."},
 {x:4400,y:4620,w:2200,h:1540,name:"Silver Lake",season:"winter",desc:"Frosted lakeside cottages and pine-lined paths."},
 {x:6600,y:4620,w:2200,h:1540,name:"Mosaic Promenade",season:"historic",desc:"Historic waterfront houses, little bakeries and mosaic pavements."},
 {x:8800,y:4620,w:2200,h:1540,name:"Dune Gardens",season:"coast",desc:"Warm sea dunes, native flowers, boardwalks and ocean views."},
 {x:0,y:6160,w:2200,h:1540,name:"Buttercup Fields",season:"summer",desc:"Sunlit meadows, wildflowers and winding footpaths."},
 {x:2200,y:6160,w:2200,h:1540,name:"Copperwood",season:"autumn",desc:"A wooded quarter with golden trees, cosy cottages and old trails."},
 {x:4400,y:6160,w:2200,h:1540,name:"Petal Commons",season:"spring",desc:"A springtime park with blossom-lined lanes and a small town square."},
 {x:6600,y:6160,w:2200,h:1540,name:"Wintermere",season:"winter",desc:"A snowy neighbourhood with fir trees and wooden lodges."},
 {x:8800,y:6160,w:2200,h:1540,name:"South Beach",season:"coast",desc:"A long sandy beach, seaside cafés, umbrellas and boats."}
];
const ground=el("g",{"clip-path":"url(#lw-expansion-land)"},layer);
districts.forEach((d,i)=>{
 const s=seasons[d.season];
 const xx=d.x+40,yy=d.y+95,ww=d.w-100,hh=d.h-170;
 path(ground,"M"+xx+" "+(yy+120)+"L"+(xx+120)+" "+yy+"L"+(xx+ww-110)+" "+(yy-25)+"L"+(xx+ww+15)+" "+(yy+140)+"L"+(xx+ww-32)+" "+(yy+hh-125)+"L"+(xx+ww-125)+" "+(yy+hh+9)+"L"+(xx+145)+" "+(yy+hh+13)+"L"+(xx-20)+" "+(yy+hh-110)+"Z",s.floor,{opacity:".86"});
 // A second soft inner pocket keeps adjoining seasons organically mixed.
 path(ground,"M"+(xx+120)+" "+(yy+90)+"l"+(ww*.32)+" -100l"+(ww*.42)+" 90l"+(ww*.08)+" "+(hh*.55)+"l-"+(ww*.4)+" "+(hh*.23)+"l-"+(ww*.42)+" -140Z",s.floor,{opacity:".50"});
});
// Path and water networks cross region boundaries without a square-grid look.
const roads=el("g",{"fill":"none","stroke-linejoin":"round","stroke-linecap":"round"},layer);
const paths=[
 "M5480 760Q6570 690 7740 760T10850 790",
 "M5530 2020Q6570 1950 7700 2100T10830 2020",
 "M5540 3350Q6600 3480 7690 3440T10860 3480",
 "M450 4610Q380 5080 720 5410S900 6290 720 8200",
 "M2190 4490Q2390 4960 2250 5480S2400 6550 2520 8200",
 "M3880 4410Q3700 5150 4010 5630S3860 6970 4200 8200",
 "M0 5340Q1100 5250 2120 5420T4200 5380T6200 5400",
 "M0 6910Q980 6740 2100 6880T4320 6910T6500 6880T9470 7040",
 "M7950 390Q8560 700 8350 1480S8560 3000 8340 4430S9000 5820 8980 7180",
 "M9630 -30Q9360 820 9670 1510T9630 3170Q9450 3880 9860 4650"
];
paths.forEach(d=>{line(roads,d,"#a8957b",67);line(roads,d,"#ece2ca",54);line(roads,d,"#cbbca4",3,{"stroke-dasharray":"7 22"});});
// Smaller wandering park paths soften the neighbourhood road network.
for(const d of districts){
 const x=d.x,y=d.y;line(roads,"M"+(x+140)+" "+(y+280)+"Q"+(x+d.w*.45)+" "+(y+560)+" "+(x+d.w*.76)+" "+(y+360)+"T"+(x+d.w-90)+" "+(y+900),seasons[d.season].path,27);
}
// Detailed coast and beach parks with wood boardwalks.
const beach=el("g",{"clip-path":"url(#lw-expansion-land)"},layer);
for(const b of [
 {x:10230,y:930,w:410,h:570},{x:10050,y:3170,w:580,h:530},
 {x:8700,y:5850,w:790,h:390},{x:9480,y:6800,w:420,h:870}
]){
 path(beach,"M"+b.x+" "+b.y+"q"+(b.w*.55)+" -80 "+b.w+" 35v"+(b.h-100)+"q-"+(b.w*.35)+" 130 -"+b.w+" 20Z","#e9d19c");
 for(let j=0;j<17;j++)use("lw-umbrella",b.x+between(35,b.w-35),b.y+between(65,b.h-90),between(.6,1.2),beach);
 for(let j=0;j<38;j++){rect(beach,b.x+between(0,b.w),b.y+between(0,b.h),3,4,j%2?"#eddcb4":"#c5a873");}
}
// Narrow river coming out of the existing town, stone walls and a bridge.
const stream="M4260 3740Q4680 4080 4880 4460T5320 5190Q5600 5430 6050 5660T6680 5970";
line(layer,stream,"#b9ab91",120);
line(layer,stream,"#81b5b9",103);
line(layer,stream,"#c4dcd7",5,{"stroke-dasharray":"28 35"});
function bridge(x,y,a=0){
 const g=el("g",{transform:"translate("+x+" "+y+") rotate("+a+")"},layer);
 rect(g,-90,-47,180,94,"#8b7157");
 for(let k=0;k<12;k++)rect(g,-84+k*14,-41,11,82,k%2?"#c8ac83":"#dfc19a");
 rect(g,-92,-53,184,9,"#8c6651");rect(g,-92,44,184,9,"#8c6651");
 for(let i=-1;i<=1;i++){rect(g,i*66-4,-58,10,13,"#f0dec1");rect(g,i*66-4,46,10,13,"#f0dec1")}
}
bridge(6660,760,2);bridge(6690,2020,-3);bridge(6700,3380,4);
bridge(5390,5210,35);
// Street-level detail uses sprite <use> instances, keeping the SVG manageable for iPad.
const ornaments=el("g",{"clip-path":"url(#lw-expansion-land)"},layer);
const architecture=el("g",{"clip-path":"url(#lw-expansion-land)"},layer);
const canopy=el("g",{"clip-path":"url(#lw-expansion-land)"},layer);
const residents=el("g",{"clip-path":"url(#lw-expansion-land)"},layer);
let addedNPCs=0,addedTrees=0,addedHouses=0;
for(const d of districts){
 const scene=seasons[d.season];
 const px=d.x,py=d.y;
 // Garden clusters and natural undergrowth. Tree species vary within every season.
 for(let i=0;i<30;i++){
  const x=px+between(110,d.w-100),y=py+between(130,d.h-80);
  const id=pick(scene.trees);
  use("lw-tree-"+id,x,y,between(.72,1.32),canopy);
  addedTrees++;
  if(i%2===0)use("lw-bush-"+scene.bush,x+between(-75,75),y+between(12,48),between(.55,1.1),canopy);
 }
 for(let i=0;i<86;i++){
  const x=px+between(45,d.w-55),y=py+between(55,d.h-40);
  const deco=i%9===0?"lw-stone":i%5===0?"lw-flowers":i%4===0?"lw-bush-"+scene.bush:"lw-grass";
  use(deco,x,y,between(.55,1.3),ornaments);
 }
 // Scattered cafés and houses leave room for paths and public squares.
 for(let i=0;i<13;i++){
  const x=px+150+(i%5)*Math.min(280,(d.w-300)/5)+between(-42,42);
  const y=py+190+Math.floor(i/5)*365+between(-45,45);
  const id=i%5===0?"historic":scene.house;
  use("lw-house-"+id,x,y,between(.82,1.18),architecture,(i%3-1)*2);
  addedHouses++;
  if(i%3===0){use("lw-lamp",x+75,y+43,1.0,ornaments);use("lw-bench",x+125,y+45,.8,ornaments);}
  if(i%4===0)use("lw-crate",x-67,y+46,1.05,ornaments);
 }
 // NPC walkers use the game's existing animation array and save nothing to localStorage.
 for(let i=0;i<5;i++){
  const x=px+180+(i%3)*Math.min(340,(d.w-450)/3);
  const y=py+505+(i%2)*325;
  const route={x,y,dx:i%2?0:1,dy:i%2?1:0,length:Math.min(200,d.w*.16)};
  const g=el("g",{transform:"translate("+x+" "+y+")",role:"button",tabindex:"0","aria-label":"Greet a resident",style:"cursor:pointer"},residents);
  const c=clothes[residentIndex%clothes.length],sk=["#dcaa82","#9a674f","#d8b196","#a77e68"][residentIndex%4],hairColor=hair[residentIndex%hair.length];
  rect(g,-10,11,22,6,"#594e42",{opacity:".22"});
  rect(g,-8,-17,17,21,c);
  rect(g,-7,-31,16,15,sk);
  rect(g,-8,-35,17,8,hairColor);
  rect(g,-13,-15,5,18,c);
  rect(g,-6,4,6,15,"#4a5358");
  rect(g,3,4,6,15,"#47565d");
  rect(g,11,-11,4,12,c);
  rect(g,-2,-26,3,2,"#38383a");
  rect(g,6,-26,3,2,"#38383a");
  const npcName=pick(["Mila","Nico","Amelie","Hugo","Lina","Theo","Freya","Felix","Ada","Sofia","Leo","Iris"]);
  const greet=()=>{
   document.getElementById("place-card").innerHTML="<strong>"+npcName+" · Local resident</strong><p>You meet "+npcName+" wandering through "+d.name+". The neighbourhood is full of little stories waiting to be discovered.</p>";
  };
  g.addEventListener("click",e=>{e.stopPropagation();greet()});
  g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();greet()}});
  sprites.push({g,route,offset:residentIndex*37,speed:.32+(residentIndex%5)*.055});
  residentIndex++;addedNPCs++;
 }
}
// Landmark sprites and scenic set pieces for memorable discoveries.
const points=el("g",{},layer);
const features=[
 {x:8200,y:1050,name:"Frostglass Observatory",desc:"A snowy hill with an old observatory overlooking the city.",season:"winter"},
 {x:9600,y:1210,name:"Sunspell Beach",desc:"A golden beach with colourful parasols and warm sea breezes.",season:"coast"},
 {x:8300,y:2580,name:"Lantern Bridge",desc:"A quiet bridge among copper leaves, lanterns and canals.",season:"autumn"},
 {x:9650,y:2470,name:"Rosewater Garden",desc:"A fragrant flower garden with cherry blossom and a fountain.",season:"spring"},
 {x:8180,y:3910,name:"Olive Market Square",desc:"Market stalls, cafés and the sound of music under sunny trees.",season:"summer"},
 {x:9670,y:4150,name:"Seashell Harbour",desc:"Fishing boats, seaside cafés and a little lighthouse.",season:"coast"},
 {x:860,y:5620,name:"Amber Orchard",desc:"A peaceful autumn orchard with a winding footpath.",season:"autumn"},
 {x:3160,y:5630,name:"Willowbank Gardens",desc:"A spring riverside park filled with blossoms.",season:"spring"},
 {x:5200,y:5750,name:"Silver Lake",desc:"Frosted lake paths and snow-covered pines.",season:"winter"},
 {x:7600,y:5740,name:"Mosaic Promenade",desc:"An old waterfront quarter of arches and tiled plazas.",season:"historic"},
 {x:1100,y:7110,name:"Buttercup Meadow",desc:"Warm summer flowers and a little picnic clearing.",season:"summer"},
 {x:3330,y:7190,name:"Copperwood Trail",desc:"A leaf-strewn forest walk among golden trees.",season:"autumn"},
 {x:5420,y:7100,name:"Petal Commons",desc:"Cherry blossoms around a little springtime fountain.",season:"spring"},
 {x:7630,y:7040,name:"Wintermere Lodge",desc:"A timber lodge with snow-dusted roofs and a warm hearth.",season:"winter"},
 {x:9440,y:7240,name:"South Beach",desc:"A long sandy shore with boardwalks and bright beach umbrellas.",season:"coast"}
];
features.forEach((p,i)=>{
 const g=el("g",{transform:"translate("+p.x+" "+p.y+")",role:"button",tabindex:"0","aria-label":"Explore "+p.name,style:"cursor:pointer"},points);
 rect(g,-16,-23,32,34,"#fff4d7",{stroke:"#84654e","stroke-width":5});
 rect(g,-8,-13,16,14,i%2?"#c7775f":"#82a776");
 path(g,"M-8 11H8L0 23Z","#fff4d7",{stroke:"#84654e","stroke-width":3});
 g.addEventListener("click",e=>{e.stopPropagation();selectPlace(p)});
 g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();selectPlace(p)}});
});
for(const p of features){
 if(p.season==="coast"){for(let i=0;i<4;i++)use("lw-boat",p.x+140+i*85,p.y+110+(i%2)*60,.6,layer);}
 else if(p.season==="winter"){use("lw-tree-pine",p.x+135,p.y+100,1.6,layer);use("lw-tree-winter",p.x-150,p.y+100,1.6,layer);}
 else if(p.season==="spring"){use("lw-tree-blossom",p.x+150,p.y+80,1.5,layer);use("lw-fountain",p.x-130,p.y+65,1.3,layer);}
 else if(p.season==="autumn"){use("lw-tree-autumn",p.x+135,p.y+70,1.4,layer);use("lw-bench",p.x-150,p.y+65,1,layer);}
}
function caption(x,y,a,b){
 const g=el("g",{transform:"translate("+x+" "+y+")","text-anchor":"middle"},layer);
 const t=el("text",{x:0,y:0,fill:"#594b3e","font-size":32,"font-family":"Georgia,serif","letter-spacing":2},g);
 t.textContent=a.toUpperCase();
 const sub=el("text",{x:0,y:31,fill:"#807463","font-size":15,"font-family":"Arial,sans-serif","letter-spacing":1.4},g);
 sub.textContent=b;
}
for(let i=0;i<districts.length;i++){
 const d=districts[i];
 caption(d.x+d.w*.52,d.y+102,d.name,
  d.season==="coast"?"BEACH • HARBOUR":d.season.toUpperCase()+" • EXPLORE");
}
document.getElementById("city-art").setAttribute("aria-label","Explore a large continuous pixel-art city with winter, spring, summer and autumn districts, beaches, walking residents and landmarks.");
window.LittleWorldsExpansion={area:W*H,originalArea:6600*4620,districts:districts.length,trees:addedTrees,houses:addedHouses,npcs:addedNPCs,places:features.length};
})();