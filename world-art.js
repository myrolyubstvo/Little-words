/* Original illustrated game art. Atlases are local, with procedural terrain and fallback art. */
(()=>{
"use strict";
const W=window.LWWorldData,T=W.T,TT=W.TERRAIN,B=W.B,hash=W.hash;
const INK="#544339";
const palette=[
 {grass:"#b2ce7c",light:"#d0e296",dark:"#73954e",path:"#e5be91",stone:"#e8c8a0",water:"#3caaa2"},
 {grass:"#a9cd7c",light:"#d0e19b",dark:"#729866",path:"#e3c7a5",stone:"#e5cbb3",water:"#6cb6af"},
 {grass:"#c8aa6e",light:"#e1c28a",dark:"#9e8753",path:"#dcba92",stone:"#d4b29c",water:"#6ca8a6"},
 {grass:"#dfedf0",light:"#fcf9ef",dark:"#afc9ce",path:"#d4d9d3",stone:"#c8d6d8",water:"#84b5c9"},
 {grass:"#b4be7d",light:"#d3d693",dark:"#7e9d5e",path:"#edcd9b",stone:"#e9bf98",water:"#36aaa4"}
];
const manifest={
  "buildings": {
    "url": "./assets/buildings.webp",
    "frames": [
      {
        "x": 11,
        "y": 7,
        "w": 416,
        "h": 418
      },
      {
        "x": 458,
        "y": 5,
        "w": 398,
        "h": 420
      },
      {
        "x": 887,
        "y": 6,
        "w": 436,
        "h": 422
      },
      {
        "x": 1343,
        "y": 9,
        "w": 420,
        "h": 435
      },
      {
        "x": 11,
        "y": 446,
        "w": 424,
        "h": 432
      },
      {
        "x": 444,
        "y": 445,
        "w": 425,
        "h": 429
      },
      {
        "x": 890,
        "y": 447,
        "w": 433,
        "h": 424
      },
      {
        "x": 1347,
        "y": 444,
        "w": 410,
        "h": 435
      }
    ]
  },
  "props": {
    "url": "./assets/props.webp",
    "frames": [
      {
        "x": 12,
        "y": 7,
        "w": 338,
        "h": 343
      },
      {
        "x": 387,
        "y": 8,
        "w": 311,
        "h": 341
      },
      {
        "x": 739,
        "y": 7,
        "w": 323,
        "h": 341
      },
      {
        "x": 1099,
        "y": 5,
        "w": 339,
        "h": 344
      },
      {
        "x": 17,
        "y": 378,
        "w": 321,
        "h": 319
      },
      {
        "x": 371,
        "y": 377,
        "w": 343,
        "h": 334
      },
      {
        "x": 735,
        "y": 366,
        "w": 333,
        "h": 347
      },
      {
        "x": 1100,
        "y": 408,
        "w": 332,
        "h": 275
      },
      {
        "x": 11,
        "y": 730,
        "w": 340,
        "h": 349
      },
      {
        "x": 393,
        "y": 727,
        "w": 298,
        "h": 350
      },
      {
        "x": 755,
        "y": 735,
        "w": 275,
        "h": 338
      },
      {
        "x": 1200,
        "y": 724,
        "w": 132,
        "h": 357
      }
    ]
  },
  "districts": {
    "url": "./assets/districts.webp",
    "frames": [
      {
        "x": 10,
        "y": 12,
        "w": 427,
        "h": 413
      },
      {
        "x": 462,
        "y": 12,
        "w": 373,
        "h": 410
      },
      {
        "x": 893,
        "y": 14,
        "w": 420,
        "h": 430
      },
      {
        "x": 1355,
        "y": 15,
        "w": 399,
        "h": 429
      },
      {
        "x": 9,
        "y": 467,
        "w": 418,
        "h": 399
      },
      {
        "x": 454,
        "y": 454,
        "w": 406,
        "h": 407
      },
      {
        "x": 892,
        "y": 444,
        "w": 415,
        "h": 421
      },
      {
        "x": 1344,
        "y": 444,
        "w": 422,
        "h": 421
      }
    ]
  },
  "urban": {
    "url": "./assets/urban.webp",
    "frames": [
      {
        "x": 67,
        "y": 8,
        "w": 304,
        "h": 431
      },
      {
        "x": 455,
        "y": 12,
        "w": 425,
        "h": 423
      },
      {
        "x": 988,
        "y": 9,
        "w": 243,
        "h": 425
      },
      {
        "x": 1445,
        "y": 6,
        "w": 215,
        "h": 430
      },
      {
        "x": 15,
        "y": 501,
        "w": 408,
        "h": 356
      },
      {
        "x": 458,
        "y": 453,
        "w": 413,
        "h": 419
      },
      {
        "x": 896,
        "y": 486,
        "w": 418,
        "h": 373
      },
      {
        "x": 1338,
        "y": 471,
        "w": 428,
        "h": 387
      }
    ]
  },
  "animals": {
    "url": "./assets/animals.webp",
    "frames": [
      {
        "x": 21,
        "y": 41,
        "w": 276,
        "h": 233
      },
      {
        "x": 351,
        "y": 48,
        "w": 261,
        "h": 222
      },
      {
        "x": 652,
        "y": 59,
        "w": 275,
        "h": 213
      },
      {
        "x": 981,
        "y": 56,
        "w": 261,
        "h": 218
      },
      {
        "x": 15,
        "y": 339,
        "w": 283,
        "h": 248
      },
      {
        "x": 341,
        "y": 343,
        "w": 273,
        "h": 242
      },
      {
        "x": 656,
        "y": 345,
        "w": 272,
        "h": 240
      },
      {
        "x": 973,
        "y": 343,
        "w": 271,
        "h": 242
      },
      {
        "x": 22,
        "y": 679,
        "w": 258,
        "h": 206
      },
      {
        "x": 345,
        "y": 679,
        "w": 251,
        "h": 205
      },
      {
        "x": 657,
        "y": 679,
        "w": 254,
        "h": 208
      },
      {
        "x": 976,
        "y": 679,
        "w": 250,
        "h": 203
      },
      {
        "x": 29,
        "y": 975,
        "w": 246,
        "h": 235
      },
      {
        "x": 326,
        "y": 974,
        "w": 281,
        "h": 235
      },
      {
        "x": 634,
        "y": 977,
        "w": 300,
        "h": 232
      },
      {
        "x": 954,
        "y": 983,
        "w": 287,
        "h": 226
      }
    ]
  }
};
const images={},spriteCache=new Map(),state={ready:false,failed:false};
const ready=Promise.all(Object.entries(manifest).map(([key,meta])=>new Promise((resolve,reject)=>{
 const image=new Image();image.onload=()=>{images[key]=image;resolve()};image.onerror=()=>reject(new Error("Could not load "+meta.url));image.src=meta.url;
}))).then(()=>{
 // Bake the autumn foliage tint once instead of running a filter for every tree, every frame.
 const f=manifest.props.frames[0],autumn=document.createElement("canvas");autumn.width=f.w;autumn.height=f.h;
 const c=autumn.getContext("2d");c.filter="sepia(.35) saturate(1.15) hue-rotate(338deg)";c.drawImage(images.props,f.x,f.y,f.w,f.h,0,0,f.w,f.h);
 images.autumn=autumn;manifest.autumn={frames:[{x:0,y:0,w:f.w,h:f.h}]};
 state.ready=true;window.dispatchEvent(new Event("lw-art-ready"));return true;
}).catch(()=>{state.failed=true;window.dispatchEvent(new Event("lw-art-ready"));return false;});
function path(c,points,fill,stroke=INK,width=1.4){
 c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.lineJoin="round";c.stroke();}
}
function line(c,points,color=INK,width=1){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.strokeStyle=color;c.lineWidth=width;c.lineCap="round";c.lineJoin="round";c.stroke();}
function ellipse(c,x,y,rx,ry,color,stroke=null,width=1){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function rounded(c,x,y,w,h,r,fill,stroke=null,width=1){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function sprite(c,group,index,x,base,width,height,flip=false){
 const img=images[group],f=manifest[group].frames[index];if(!img||!f)return false;
 const scale=Math.min(width/f.w,height/f.h),dw=f.w*scale,dh=f.h*scale;
 // Reuse downsampled cutouts: the whole-world view must not resample full atlases thousands of times.
 const transform=c.getTransform(),density=Math.hypot(transform.a,transform.b);
 const bucket=Math.min(512,Math.max(32,2**Math.ceil(Math.log2(Math.max(dw,dh)*density))));
 const key=group+":"+index+":"+bucket;let cutout=spriteCache.get(key);
 if(!cutout){
  cutout=document.createElement("canvas");const ratio=Math.min(bucket/f.w,bucket/f.h);
  cutout.width=Math.ceil(f.w*ratio);cutout.height=Math.ceil(f.h*ratio);
  const cc=cutout.getContext("2d");cc.imageSmoothingQuality="high";cc.drawImage(img,f.x,f.y,f.w,f.h,0,0,cutout.width,cutout.height);
  spriteCache.set(key,cutout);if(spriteCache.size>72)spriteCache.delete(spriteCache.keys().next().value);
 }
 c.save();c.translate(x,base);if(flip)c.scale(-1,1);c.imageSmoothingEnabled=true;c.drawImage(cutout,-dw/2,-dh,dw,dh);c.restore();return true;
}
function groundColor(t,b){const p=palette[b];return t===TT.WATER||t===TT.RIVER?p.water:t===TT.SAND?"#f1d395":t===TT.BRIDGE?"#b99a72":t===TT.PLAZA?p.stone:t===TT.ROAD||t===TT.PATH?p.path:p.grass;}
function tile(c,x,y,terrainOverride=null){
 const k=W.coord(x,y),b=W.biomes[k],t=terrainOverride===null?W.terrain[k]:terrainOverride,p=palette[b],xx=x*T,yy=y*T,seed=hash(x,y,8);
 c.fillStyle=groundColor(t,b);c.fillRect(xx,yy,T+.5,T+.5);
 const water=t===TT.WATER||t===TT.RIVER,paved=t===TT.ROAD||t===TT.PLAZA||t===TT.PATH;
 if(water){
  for(let j=0;j<2;j++){
   const px=xx+4+hash(x,y,j+6)*23,py=yy+8+j*23;
   c.beginPath();c.moveTo(px,py);c.bezierCurveTo(px+5,py-3,px+10,py+3,px+18,py);c.strokeStyle="#d1eee077";c.lineWidth=1.2;c.stroke();
  }
 }else if(paved){
  if(t===TT.PLAZA){
   // Loosely laid, irregular limestone pavers, with ceramic accents in warm regions.
   for(let row=0;row<3;row++)for(let col=0;col<2;col++){
    const px=xx+col*24+(row%2?5:0),py=yy+row*16;
    rounded(c,px+1,py+1,21,13,2,hash(x+col,y+row,15)>.5?"#fff0cd32":"#916b5020","#8b6e4c20",.7);
   }
   if((b===B.SUMMER||b===B.COAST)&&(x+y)%4===0){
    for(let j=0;j<4;j++)ellipse(c,xx+24+Math.cos(j*Math.PI/2)*5,yy+24+Math.sin(j*Math.PI/2)*5,3,3,"#4a8f8b80");
    ellipse(c,xx+24,yy+24,2,2,"#f8df9e");
   }
  }else{
   for(let j=0;j<2;j++){
    const px=xx+hash(x,y,30+j)*30,py=yy+5+j*23;
    path(c,[[px,py],[px+13,py-1],[px+16,py+5],[px+2,py+7]],"#f9dfb52e",null);
   }
  }
 }else if(t===TT.BRIDGE){
  for(let j=0;j<6;j++){line(c,[[xx,yy+j*8],[xx+48,yy+j*8]],"#735c48",1.4);line(c,[[xx+3,yy+j*8+2],[xx+44,yy+j*8+2]],"#e7c797",.8);}
 }else{
  // Broad soft clumps and fine blades; never a repeated pixel checkerboard.
  for(let j=0;j<3;j++){
   const px=xx+hash(x,y,j+51)*47,py=yy+hash(x,y,j+61)*47;
   ellipse(c,px,py,4+hash(x,y,j+71)*9,2+hash(x,y,j+81)*4,b===B.WINTER?"#ffffff25":j%2?"#f2ecc817":"#506e3c0c");
   if(t!==TT.SAND&&b!==B.WINTER)line(c,[[px-2,py+2],[px-3,py-2],[px,py+1],[px+2,py-3]],p.dark+"80",.8);
  }
  if(seed>.65&&t!==TT.SAND&&b!==B.WINTER){
   const fx=xx+14,fy=yy+28;
   for(let j=0;j<4;j++)ellipse(c,fx+Math.cos(j*Math.PI/2)*2,fy+Math.sin(j*Math.PI/2)*2,1.8,1.8,b===B.SPRING?"#f5bfd0":"#fff1ba");
   ellipse(c,fx,fy,1,1,"#d9a457");
  }
 }
 for(const [dx,dy,edge] of [[-1,0,0],[0,-1,1],[1,0,2],[0,1,3]]){
  if(!W.inBounds(x+dx,y+dy))continue;
  const nt=W.terrain[W.coord(x+dx,y+dy)],landEdge=water&&nt!==TT.WATER&&nt!==TT.RIVER;
  const curb=paved&&(nt===TT.GRASS||nt===TT.PARK);
  if(!landEdge&&!curb)continue;
  const ax=edge===2?xx+T:xx,ay=edge===3?yy+T:yy;
  const pts=edge%2?[[xx,ay],[xx+14,ay+1.5],[xx+32,ay-1],[xx+T,ay]]:[[ax,yy],[ax+1.5,yy+15],[ax-1,yy+33],[ax,yy+T]];
  line(c,pts,landEdge?"#f8e6bd":b===B.WINTER?"#b0c6cb":"#7d8c5b",landEdge?4:2.5);
  if(curb){for(let j=0;j<3;j++){const px=edge%2?xx+8+j*17:ax,py=edge%2?ay:yy+8+j*17;line(c,[[px-2,py+2],[px,py-3],[px+3,py]],b===B.WINTER?"#f8ffff":p.dark,.8);}}
 }
 if(b===B.WINTER&&!water){
  if(seed>.8){
   ellipse(c,xx+13+seed*10,yy+12,17,3,"#f9ffff45");
   line(c,[[xx+27,yy+39],[xx+37,yy+40],[xx+44,yy+38]],"#9fbac440",.8);
  }
  if(paved&&seed>.7)for(let j=0;j<3;j++){ellipse(c,xx+17+j*4,yy+12+j*7,1.4,2.2,"#9baeb66b");ellipse(c,xx+22+j*4,yy+15+j*7,1.4,2.2,"#9baeb66b");}
 }
 // Paper-like pigment speckles are baked into terrain, not animated every frame.
 for(let j=0;j<6;j++){
  ellipse(c,xx+hash(x,y,j+111)*48,yy+hash(x,y,j+121)*48,.45,.35,water?"#ffffff25":"#76552c16");
 }
}
function shadow(c,x,y,width){ellipse(c,x+5,y,width*.47,width*.16,"#3e514d24");}
function treeFallback(c,x,y,b,size){shadow(c,x,y,size);rounded(c,x-5,y-size*.38,10,size*.4,3,"#866147");for(let j=0;j<5;j++)ellipse(c,x+Math.sin(j*2)*size*.2,y-size*.4-j*size*.08,size*.26,size*.23,b===B.WINTER?"#d6e6e4":j%2?"#769f56":"#466f4d",INK,.8);}
function object(c,o){
 let x=o.x*T+T/2,y=o.y*T+T/2,b=o.biome,v=o.variant||0;const cold=b===B.WINTER;
 const sizes={tree:116,pine:121,palm:128,flowers:30,bush:43,planter:49,citrus:65,fountain:87,fruitstall:83,terrace:91,bench:73,snowman:55,lantern:77,lamp:77};
 const index={tree:cold?1:b===B.SPRING?3:0,pine:1,palm:2,planter:8,citrus:9,fountain:4,fruitstall:5,terrace:6,bench:7,snowman:10,lantern:11,lamp:11,bush:8};
 if(index[o.kind]!==undefined){
  const size=sizes[o.kind]*(o.kind==="tree"?.85+hash(o.x,o.y,98)*.3:1);
  shadow(c,x,y,size*.65);
  const group=b===B.AUTUMN&&o.kind==="tree"&&images.autumn?"autumn":"props";
  const drawn=sprite(c,group,index[o.kind],x,y+8,size,size*1.22,v%3===1&&o.kind==="tree");
  if(!drawn)treeFallback(c,x,y,b,size*.7);
  if(cold&&["planter","citrus","bench","bush"].includes(o.kind))ellipse(c,x-2,y-size*.65,size*.25,3,"#f3faffd0");
  return;
 }
 c.save();c.translate(x,y);
 const box=(x,y,w,h,color,r=2)=>rounded(c,x,y,w,h,r,color,INK,1);
 if(o.kind==="flowers"){
  for(let j=0;j<7;j++){
   const fx=-19+hash(o.x,o.y,j+20)*37,fy=-12+hash(o.x,o.y,j+34)*20;
   line(c,[[fx,fy+5],[fx,fy-2]],"#658459",1);
   for(let k=0;k<4;k++)ellipse(c,fx+Math.cos(k*Math.PI/2)*2.2,fy+Math.sin(k*Math.PI/2)*2.2,2.2,2,b===B.SPRING?"#e4a3b9":cold?"#f9ffff":j%2?"#f3cd73":"#f0e3b6");
   ellipse(c,fx,fy,1.3,1.3,"#c19c57");
  }
 }else if(o.kind==="stone"){
  shadow(c,0,2,31);path(c,[[-15,3],[-12,-8],[-4,-14],[10,-12],[17,-3],[12,6]],cold?"#b9cdd1":"#a6a28a","#777d6b",1.2);path(c,[[-12,-8],[-4,-14],[10,-12],[6,-5],[-4,-3]],cold?"#edf3ea":"#c5bd9e",null);
 }else if(o.kind==="fence"){
  for(let j=-22;j<=23;j+=15){box(j,-25,5,33,"#a18b61");ellipse(c,j+2.5,-25,3,2,"#d1bc8c",INK,.7);}
  box(-24,-20,52,5,"#b8a177",1);box(-24,-6,52,5,"#b8a177",1);
 }else if(o.kind==="garden"){
  box(-24,-18,48,34,cold?"#c2d4d5":"#b3a07c",3);
  for(let j=0;j<3;j++){rounded(c,-20,-14+j*10,40,5,2,"#786848");for(let k=0;k<5;k++){ellipse(c,-15+k*8,-13+j*10,4,3,"#6f9354");ellipse(c,-16+k*8,-14+j*10,2,2,"#a6bb65");}}
 }else if(o.kind==="logpile"){
  for(let j=0;j<6;j++){let px=-16+(j%3)*12,py=2-Math.floor(j/3)*10;box(px,py-6,20,11,"#74543b");ellipse(c,px,py,6,6,"#c3a274",INK,1);ellipse(c,px,py,3,3,"#d8b88c","#9a774e",.6);}
  if(cold){ellipse(c,0,-15,25,5,"#f8ffff");}
 }else if(o.kind==="signpost"){
  box(-3,-34,6,44,"#917750");box(-24,-40,48,17,"#cba675");line(c,[[-15,-31],[12,-31],[7,-35]],"#6f5843",1.6);
 }else if(o.kind==="bicycle"){
  for(const dx of [-16,16]){ellipse(c,dx,0,11,11,"#8c968000",INK,2);ellipse(c,dx,0,8.5,8.5,"#faf5da33","#c4c5a5",1);}
  line(c,[[-16,0],[-5,-17],[6,0],[-16,0]],"#ad6957",2.4);line(c,[[-5,-17],[11,-17],[16,0],[6,0],[11,-17],[9,-25],[17,-25]],"#ad6957",2.4);line(c,[[-11,-20],[-1,-20]],INK,3);
 }else if(o.kind==="umbrella"||o.kind==="lounger"){
  if(o.kind==="lounger"){box(-11,-24,22,41,"#ad8e68");for(let j=0;j<4;j++)rounded(c,-8+j*4,-21,4,34,1,j%2?"#efaa83":"#faf0cd");}
  else{line(c,[[0,-35],[0,11]],"#9b7d59",3);c.beginPath();c.moveTo(-28,-30);c.quadraticCurveTo(0,-63,28,-30);c.quadraticCurveTo(14,-22,0,-30);c.quadraticCurveTo(-15,-22,-28,-30);c.fillStyle=v%2?"#db946d":"#83a18b";c.fill();c.strokeStyle=INK;c.lineWidth=1.3;c.stroke();line(c,[[0,-53],[0,-30]],"#fff0c4",6);}
 }else if(o.kind==="boat"){
  path(c,[[-2,-32],[13,-17],[12,14],[1,27],[-11,14],[-13,-17]],"#b67e59",INK,1.4);path(c,[[0,-26],[8,-15],[8,10],[0,19],[-7,10],[-8,-15]],"#dabb80",INK,.8);box(-9,-7,18,6,"#96714c");line(c,[[-3,-31],[2,19]],"#74624a",2);
 }else if(o.kind==="shell"){
  path(c,[[-6,2],[-7,-3],[-3,-7],[2,-8],[7,-4],[6,2]],"#f9e8c1","#c7aa7b",.8);
 }else if(o.kind==="ripple"){
  c.beginPath();c.ellipse(0,0,17,5,0,0,Math.PI);c.strokeStyle="#c5eee4";c.lineWidth=1.2;c.stroke();
 }
 c.restore();
}
function buildingAsset(b){
 const v=((b.id||0)%4+4)%4;
 if(b.kind==="clock"||b.kind==="pisa")return ["buildings",7];
 if(b.biome===B.WINTER){
  if(b.kind==="bakery"||b.kind==="shop")return ["buildings",5];
  return v%2?["districts",v===1?6:7]:["buildings",4];
 }
 if(b.biome===B.SPRING)return ["districts",b.kind==="house"?4:5];
 if(b.kind==="bakery")return v%2?["districts",2]:["buildings",0];
 if(b.kind==="cafe")return v%2?["districts",0]:["buildings",0];
 if(b.kind==="market")return ["buildings",2];
 if(b.kind==="shop")return v%2?["districts",3]:["buildings",2];
 if(b.kind==="restaurant"||b.kind==="harbour")return ["buildings",6];
 if(b.biome===B.AUTUMN||b.kind==="lodge")return v%2?["districts",5]:["buildings",3];
 return v%2?["districts",1]:v===0?["districts",3]:["buildings",1];
}
function forecourt(c,b){
 const x=b.x*T,y=b.y*T,ww=b.w*T,hh=b.h*T,cold=b.biome===B.WINTER;
 rounded(c,x-5,y+hh-36,ww+10,42,5,cold?"#d1dee0":"#d8c09b","#9d916b80",1);
 for(let j=0;j<ww;j+=24)line(c,[[x+j,y+hh-35],[x+j+4,y+hh+5]],"#a08c6c40",.8);
}
function building(c,b){
 const x=b.x*T,y=b.y*T,ww=b.w*T,hh=b.h*T,cx=x+ww/2;
 const special=b.landmark,base=y+hh-3,width=special?Math.min(ww*.8,330):ww+12,height=special?Math.min(hh+35,350):hh+48;
 shadow(c,cx,base,width*.9);
 if(b.kind==="greenhouse"){
  // A jewel-box botanical conservatory with a glass roof and planted borders.
  const bw=Math.min(ww-25,340),bh=Math.min(hh-30,220),by=base-bh;
  rounded(c,cx-bw/2,by,bw,bh,8,"#6eaa9c",INK,2);
  path(c,[[cx-bw/2-9,by+40],[cx,by-27],[cx+bw/2+9,by+40]],"#b0d6b6",INK,2);
  for(let xx=cx-bw/2+10;xx<cx+bw/2;xx+=25){line(c,[[xx,by+42],[xx,base-7]],"#e8e7bf",4);line(c,[[xx+4,by+45],[xx+13,base-30]],"#e5f1d340",3);}
  for(let j=0;j<3;j++)line(c,[[cx-bw/2+3,by+60+j*45],[cx+bw/2-3,by+60+j*45]],"#e5d6a8",4);
  sprite(c,"props",8,cx-bw/2,base+7,65,68);sprite(c,"props",8,cx+bw/2,base+7,65,68);
  rounded(c,cx-17,base-48,34,48,5,"#497c6e",INK,1.5);ellipse(c,cx+9,base-21,2,2,"#efcd7d");return;
 }
 if(b.kind==="roman"){
  const rw=ww*.44,rh=hh*.35;
  ellipse(c,cx,base-rh,rw,rh,"#ad8768",INK,2);ellipse(c,cx,base-rh-10,rw-12,rh-12,"#d6b58a",INK,1.3);ellipse(c,cx,base-rh-10,rw*.6,rh*.56,"#b1976a",INK,1.3);
  for(let j=0;j<14;j++){const a=j*Math.PI/7,px=cx+Math.cos(a)*(rw-9),py=base-rh+Math.sin(a)*(rh-7);rounded(c,px-7,py-15,14,22,[7,7,1,1],"#685f4b","#e4c49a",4);}
  for(let j=0;j<4;j++)sprite(c,"props",8,x+40+j*(ww-80)/3,base+8,43,45);return;
 }
 if(special){
  rounded(c,x+8,y+12,ww-16,hh-10,14,b.biome===B.WINTER?"#e3eded":"#dec5a0","#a18c6e",1.3);
  for(let row=0;row<hh;row+=26)line(c,[[x+14,y+row+22],[x+ww-14,y+row+22]],"#ac977440",.8);
  sprite(c,"props",8,x+35,base+2,66,65);sprite(c,"props",8,x+ww-35,base+2,66,65);
 }
 const [group,index]=buildingAsset(b);
 if(!sprite(c,group,index,cx,base,width,height)){
  rounded(c,cx-width/2,base-height*.7,width,height*.7,4,b.biome===B.WINTER?"#bba795":"#efc38e",INK,2);
  path(c,[[cx-width/2-5,base-height*.65],[cx,base-height],[cx+width/2+5,base-height*.65]],"#ae6853",INK,2);
  rounded(c,cx-13,base-40,26,40,8,"#558479",INK,1.3);
 }
}
function decal(c,b){
 // Tie every building into its neighbourhood with an actual path to its street door.
 const x=(b.x+b.w/2)*T,y=(b.y+b.h)*T,dx=b.door.x*T+T/2,dy=b.door.y*T+T/2;
 c.save();c.lineCap="round";
 line(c,[[x,y-7],[x,dy],[dx,dy]],b.biome===B.WINTER?"#d0dbd9":"#d6bb91",23);
 line(c,[[x,y-7],[x,dy],[dx,dy]],b.biome===B.WINTER?"#eef3e8":"#efdab2",18);
 c.restore();forecourt(c,b);
}
function scenic(c,l){
 const x=l.x*T,y=l.y*T,ww=l.w*T,hh=l.h*T,cx=x+ww/2,base=y+hh-10;
 if(l.kind==="lighthouse"){
  shadow(c,cx,base,110);
  path(c,[[cx-32,base],[cx-22,base-140],[cx+22,base-140],[cx+32,base]],"#f5e2b3",INK,2);
  path(c,[[cx-26,base-80],[cx-25,base-101],[cx+25,base-101],[cx+27,base-80]],"#bd7865",INK,1);
  rounded(c,cx-27,base-167,54,30,4,"#73a99e",INK,2);
  for(let j=-16;j<20;j+=16)line(c,[[cx+j,base-165],[cx+j,base-138]],"#e8d5ab",3);
  path(c,[[cx-37,base-167],[cx,base-195],[cx+37,base-167]],"#b66b58",INK,2);
  rounded(c,cx-10,base-32,20,32,[9,9,0,0],"#5a7a70",INK,1.5);
  sprite(c,"props",2,cx+70,base+5,100,140);sprite(c,"props",8,cx-62,base+4,49,55);
 }else if(l.kind==="harbour"){
  rounded(c,x+8,y+hh*.55,ww-16,hh*.4,5,"#ac8a63",INK,2);
  for(let j=0;j<ww-20;j+=17)line(c,[[x+14+j,y+hh*.55+4],[x+14+j,base]],"#715c47",1.2);
  for(let j=0;j<5;j++){rounded(c,x+15+j*(ww-30)/4,y+hh*.52,9,26,3,"#9e7c58",INK,1);ellipse(c,x+19+j*(ww-30)/4,y+hh*.52,6,3,"#d8ba88",INK,1);}
  sprite(c,"buildings",6,cx,y+hh*.62,Math.min(ww*.65,250),240);
  sprite(c,"props",6,x+40,base,77,92);sprite(c,"props",2,x+ww-28,base,110,140);
 }else{
  sprite(c,"props",2,x+50,base,125,160);sprite(c,"props",2,x+ww-40,base,110,150);
  for(let j=0;j<3;j++)object(c,{x:l.x+2+j*2,y:l.y+l.h-2,kind:"umbrella",biome:B.COAST,variant:j});
 }
}
function actor(c,x,y,color,skin,hair,phase,isPlayer,flip=1,cold=false,style=0){
 c.save();c.translate(x,y);c.scale(flip,1);
 const step=phase?2:-2;
 ellipse(c,2,9,11,4,"#3a514a32");
 rounded(c,-8+step*.5,2,6,9,2,"#5f6255",INK,.9);rounded(c,2-step*.5,2,6,9,2,"#5f6255",INK,.9);
 rounded(c,-10+step*.5,8,8,4,2,"#5c493e");rounded(c,1-step*.5,8,8,4,2,"#5c493e");
 // Rounded arms and torso, with coat seams and a little satchel.
 rounded(c,-12,-11,6,13,3,color,INK,1);rounded(c,7,-12,6,13,3,color,INK,1);
 rounded(c,-9,-14,19,20,[6,6,4,4],color,INK,1.2);
 line(c,[[2,-9],[2,4]],"#fff0d44a",1);ellipse(c,6,-2,1,1,"#e6c28c");
 rounded(c,6,-9,7,10,2,"#a17b4f",INK,.9);
 ellipse(c,0,-21,11,10,skin,INK,1.1);
 c.beginPath();c.moveTo(-11,-21);c.quadraticCurveTo(-13,-35,0,-33);c.quadraticCurveTo(13,-34,11,-23);c.lineTo(7,-26);c.quadraticCurveTo(2,-23,-2,-29);c.lineTo(-7,-25);c.closePath();c.fillStyle=hair;c.fill();c.strokeStyle=INK;c.lineWidth=1;c.stroke();
 ellipse(c,-3,-21,1.1,1.6,"#4b3b33");ellipse(c,5,-21,1.1,1.6,"#4b3b33");ellipse(c,-6,-18,2,1,"#d17d6860");ellipse(c,8,-18,2,1,"#d17d6860");line(c,[[0,-16],[2,-15],[4,-16]],"#91604a",.7);
 if(cold){rounded(c,-11,-33,22,8,4,color,INK,1);ellipse(c,0,-37,4,4,"#f6e7ce",INK,.7);rounded(c,-10,-13,20,4,2,"#e4c68e");rounded(c,5,-11,4,10,1,"#e4c68e");}
 else if(isPlayer||style%4===0){ellipse(c,0,-29,16,4,"#e3be7d",INK,1);rounded(c,-9,-38,18,10,[5,5,1,1],"#e3be7d",INK,1);rounded(c,-9,-31,18,3,1,isPlayer?"#b86c53":"#647d65");}
 else if(style%4===1){rounded(c,-11,-32,23,5,3,color,INK,1);}
 if(isPlayer){c.beginPath();c.moveTo(-4,-47);c.lineTo(0,-42);c.lineTo(4,-47);c.strokeStyle="#fff6d7";c.lineWidth=2;c.stroke();}
 c.restore();
}
window.LWArt={state,ready,palette,tile,object,building,decal,actor,sprite,shadow,line,path,ellipse,rounded,groundColor,scenic};
})();
