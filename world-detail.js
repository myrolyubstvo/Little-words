/* Lived-in street layers, countryside surfaces, irregular shores and animated wildlife art. */
(()=>{
"use strict";
const A=window.LWArt,W=window.LWWorldData,T=W.T,TT=W.TERRAIN,INK="#555244";
const original={tile:A.tile,object:A.object,building:A.building,groundColor:A.groundColor};
const kinds=new Set(["vending","utility","posterwall","crate","bin","hydrant","stairway","chalkboard","wires","haybale","beehive","well","gate","farmfence","scarecrow","coastRock","drygrass","reeds"]),detailCache=new Map();
A.groundColor=(t,b)=>t===TT.FIELD?"#c5ad76":t===TT.ORCHARD?"#94aa6d":t===TT.MEADOW?"#b2c47f":t===TT.CLIFF?"#aaa990":original.groundColor(t,b);
function shoreline(c,x,y,b){
 const xx=x*T,yy=y*T,sand=b===W.B.WINTER?"#e9eeec":"#edce9a",step=T/4;
 c.fillStyle="#68b7ae";c.fillRect(xx,yy,T+.5,T+.5);
 for(let sy=0;sy<4;sy++)for(let sx=0;sx<4;sx++){
  const points=[[sx,sy],[sx+1,sy],[sx+1,sy+1],[sx,sy+1]].map(([u,v])=>({x:xx+u*step,y:yy+v*step,d:W.shoreAt(x+u/4-.5,y+v/4-.5)}));
  const poly=[],edges=[];
  for(let i=0;i<4;i++){
   const p=points[i],q=points[(i+1)%4];if(p.d<=0)poly.push([p.x,p.y]);
   if((p.d<=0)!==(q.d<=0)){const t=p.d/(p.d-q.d),hit=[p.x+(q.x-p.x)*t,p.y+(q.y-p.y)*t];poly.push(hit);edges.push(hit);}
  }
  if(poly.length>=3)A.path(c,poly,sand,null);
  if(edges.length===2)A.line(c,edges,"#f7efd5",2.5);
 }
}
A.tile=function(c,x,y){
 const k=W.coord(x,y),stored=W.terrain[k],under=[TT.ROAD,TT.PATH].includes(stored)?W.baseTerrain[k]:stored;
 const t=under===TT.RIVER?TT.GRASS:under,b=W.biomes[k],district=W.districts[k],xx=x*T,yy=y*T,h=W.hash(x,y,911);
 original.tile(c,x,y,t);
 if(t===TT.FIELD||t===TT.ORCHARD){
  const f=W.fieldAt(x,y);c.fillStyle=t===TT.ORCHARD?"#9daf76":"#bba16e";c.fillRect(xx,yy,T+.5,T+.5);
  if(f){
   c.save();c.beginPath();c.rect(xx,yy,T+.2,T+.2);c.clip();c.translate(f.x*T,f.y*T);c.rotate(f.angle);
   for(let row=-f.ry*T;row<f.ry*T;row+=15){
    A.line(c,[[-f.rx*T,row],[f.rx*T,row]],"#786e4d80",3);
    for(let col=-f.rx*T;col<f.rx*T;col+=13){
     if(f.crop==="wheat"){A.line(c,[[col,row],[col+1,row-8]],"#d6bd6e",1.5);A.line(c,[[col-2,row-5],[col+1,row-7],[col+4,row-6]],"#f1d98b",1.5);}
     else if(f.crop==="lavender"){A.ellipse(c,col,row-3,3,5,"#8a849c");A.ellipse(c,col-1,row-6,2,3,"#b5a6c9");}
     else if(f.crop==="vegetables"){A.ellipse(c,col,row-3,5,3,"#688354");A.ellipse(c,col-2,row-4,2.5,2,"#9cb36c");}
    }
   }c.restore();
  }
 }else if(t===TT.MEADOW){
  c.fillStyle="#b6c77f";c.fillRect(xx,yy,T+.5,T+.5);
  for(let j=0;j<5;j++){const px=xx+W.hash(x,y,912+j)*47,py=yy+W.hash(x,y,923+j)*47;A.line(c,[[px-2,py+1],[px-3,py-3],[px,py],[px+2,py-4]],"#7e9b5d70",.8);if(j%2)A.ellipse(c,px+5,py,1.4,1.5,"#e9d590");}
 }else if(t===TT.CLIFF){
  c.fillStyle=b===W.B.WINTER?"#bdcdd0":"#b8b29b";c.fillRect(xx,yy,T+.5,T+.5);
  for(let j=0;j<3;j++)A.line(c,[[xx+3,yy+10+j*14],[xx+16,yy+7+j*14],[xx+35,yy+11+j*14],[xx+47,yy+7+j*14]],b===W.B.WINTER?"#93aeb7":"#8d8e7b",1.2);
 }
 if(district===W.D.METRO&&[TT.ROAD,TT.PATH,TT.PLAZA,TT.GRASS].includes(t)){
  c.fillStyle=t===TT.GRASS?"#acb09a":"#c1c0a8";c.fillRect(xx,yy,T+.5,T+.5);
  for(let row=0;row<3;row++)for(let col=0;col<3;col++){
   const color=["#b1baa540","#e2d2a44d","#829f9c40","#a7a29333"][Math.floor(W.hash(x+col,y+row,938)*4)];
   A.rounded(c,xx+col*16+.5,yy+row*16+.5,15,15,1,color,"#7b80642b",.65);
  }
  if(h>.65)A.path(c,[[xx+5,yy+30],[xx+16,yy+22],[xx+28,yy+24],[xx+37,yy+39],[xx+14,yy+43]],"#627c4d23",null);
  if(h>.88)A.line(c,[[xx+4,yy+8],[xx+14,yy+14],[xx+17,yy+25],[xx+31,yy+29]],"#626a5945",.8);
 }
 if([TT.ROAD,TT.PATH,TT.PLAZA].includes(t)&&h>.93){
  A.ellipse(c,xx+25,yy+25,9,6,"#969b85",INK,.8);
  for(let j=0;j<4;j++)A.line(c,[[xx+19,yy+21+j*2],[xx+30,yy+21+j*2]],"#6f7867",.7);
 }
 if(Math.abs(W.shoreDistance[k])<1.35)shoreline(c,x,y,b);
};
function curve(c,p0,p1,p2,p3){
 c.beginPath();c.moveTo(p1[0]*T+T/2,p1[1]*T+T/2);
 c.bezierCurveTo((p1[0]+(p2[0]-p0[0])/6)*T+T/2,(p1[1]+(p2[1]-p0[1])/6)*T+T/2,(p2[0]-(p3[0]-p1[0])/6)*T+T/2,(p2[1]-(p3[1]-p1[1])/6)*T+T/2,p2[0]*T+T/2,p2[1]*T+T/2);
}
function inView(points,width,view){if(!view)return true;return Math.max(...points.map(p=>p[0]*T))+width>=view.x0&&Math.min(...points.map(p=>p[0]*T))-width<=view.x1&&Math.max(...points.map(p=>p[1]*T))+width>=view.y0&&Math.min(...points.map(p=>p[1]*T))-width<=view.y1;}
const roadTextures=new Map();
function roadTexture(c,color,metro){
 const key=color+metro;if(roadTextures.has(key))return roadTextures.get(key);
 const can=document.createElement("canvas");can.width=can.height=96;const cc=can.getContext("2d");cc.fillStyle=color;cc.fillRect(0,0,96,96);
 for(let j=0;j<60;j++){const x=W.hash(j,950,1)*96,y=W.hash(j,950,2)*96;A.ellipse(cc,x,y,j%4===0?1.5:.5,.45,j%3?"#6e6e4d13":"#fff2d52b");}
 if(metro){for(let y=0;y<96;y+=16)for(let x=0;x<96;x+=24)A.rounded(cc,x+.5+(y%32?8:0),y+.5,23,15,1,"#fff0c608","#72816a27",.7);}
 else for(let j=0;j<5;j++){const x=W.hash(j,951,1)*78,y=W.hash(j,951,2)*86;A.path(cc,[[x,y],[x+8,y-1],[x+12,y+3],[x+2,y+5]],"#e8d4ab2b",null);}
 const pattern=c.createPattern(can,"repeat");roadTextures.set(key,pattern);return pattern;
}
A.roadSurface=function(c,view){
 const segments=[];
 for(const [width,points] of W.routes)for(let i=0;i<points.length-1;i++){
  const p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)],radius=width*T+13;
  if(!inView([p0,p1,p2,p3],radius,view))continue;
  const px=Math.max(0,Math.min(W.N-1,Math.round(p1[0]))),py=Math.max(0,Math.min(W.N-1,Math.round(p1[1]))),k=W.coord(px,py);
  segments.push({p0,p1,p2,p3,radius,cold:W.biomes[k]===W.B.WINTER,metro:W.districts[k]===W.D.METRO,trail:width<1.2});
 }
 c.save();c.lineCap="round";c.lineJoin="round";
 // Paint all rims first, then their union, so junctions do not show overlapping end circles.
 for(let pass=0;pass<2;pass++)for(const s of segments){
  curve(c,s.p0,s.p1,s.p2,s.p3);
  c.strokeStyle=pass===0?s.cold?"#b4c8c6":s.metro?"#929d88":"#a9a276":roadTexture(c,s.cold?"#dbe3db":s.metro?"#c4c2a9":s.trail?"#d8c096":"#e2c69f",s.metro);
  c.lineWidth=s.radius*2+(pass===0?3:0);c.stroke();
 }
 c.restore();
};
A.riverSurface=function(c,view){
 const pts=[];let current=[];
 for(let y=0;y<W.N;y+=2){const x=65+5*Math.sin(y*.065)+y*.025;if(W.shoreAt(x,y)<=.5)current.push([x,y]);else if(current.length){pts.push(current);current=[];}}
 if(current.length)pts.push(current);pts.push([[68,105],[57,103],[48,96],[38,99]]);
 c.save();
 for(let pass=0;pass<2;pass++)for(const points of pts){
  if(points.length<2||!inView(points,90,view))continue;
  const width=points.length>4?135:94;
  A.line(c,points.map(([x,y])=>[x*T+T/2,y*T+T/2]),pass?"#6dafa2":"#9caf8c",width+(pass?0:8));
 }
 A.ellipse(c,37*T+T/2,98*T+T/2,4*T,2.7*T,"#75ad9c","#a0b28a",7);c.restore();
};
A.bridge=function(c,x,y){
 const xx=x*T,yy=y*T;c.fillStyle="#bba079";c.fillRect(xx,yy,T,T);
 for(let j=0;j<6;j++)A.line(c,[[xx,yy+j*8],[xx+T,yy+j*8]],"#8f7d5e",1.1);
};
A.streetMarks=function(c,x,y){
 const k=W.coord(x,y),t=W.terrain[k];if(![TT.ROAD,TT.PATH,TT.PLAZA].includes(t))return;
 const xx=x*T,yy=y*T,h=W.hash(x,y,979),metro=W.districts[k]===W.D.METRO;
 if(h>.95){A.ellipse(c,xx+24,yy+24,9,6,"#9d9d82",INK,.8);for(let j=0;j<4;j++)A.line(c,[[xx+18,yy+21+j*2],[xx+30,yy+21+j*2]],"#717b67",.8);}
 else if(h>.78){A.path(c,[[xx+8,yy+24],[xx+13,yy+21],[xx+16,yy+28],[xx+10,yy+30]],"#e4ddbf99","#a7a48866",.5);}
 if(metro&&h>.5)A.line(c,[[xx+8,yy+8],[xx+13,yy+12],[xx+13,yy+21],[xx+21,yy+25]],"#616e512c",.7);
};
function paintDetail(c,o){
 const v=o.variant%4||0,cold=o.biome===W.B.WINTER;
 const box=(x,y,w,h,color,r=1.5)=>A.rounded(c,x,y,w,h,r,color,INK,1);
 A.ellipse(c,3,5,21,6,"#404d3920");
 if(o.kind==="vending"){
  box(-14,-43,28,47,v%2?"#998364":"#6d9490",2);box(-11,-38,21,26,"#667464");
  for(let row=0;row<3;row++)for(let col=0;col<3;col++)box(-8+col*6,-34+row*7,4,5,["#c6b874","#b77962","#a2b29b"][col],.5);
  box(-10,-7,15,6,"#3e574f");box(8,-8,3,3,"#dfd29a");A.line(c,[[-10,-40],[9,-40]],"#e6d4a8",1.2);
 }else if(o.kind==="utility"){
  box(-18,-28,36,31,"#a4aaa0");box(-15,-25,23,23,"#c4c5af");A.ellipse(c,-4,-14,9,9,"#7e8e80",INK,1);
  for(let j=0;j<4;j++){const a=j*Math.PI/2;A.line(c,[[-4,-14],[-4+Math.cos(a)*7,-14+Math.sin(a)*7]],"#485b54",2);}
  A.line(c,[[15,-17],[22,-17],[22,10]],"#707d72",3);for(let j=0;j<3;j++)A.line(c,[[-12,-23+j*7],[5,-23+j*7]],"#d5d6bb80",.7);
 }else if(o.kind==="posterwall"){
  box(-24,-33,48,37,"#afa78c");
  for(let j=0;j<5;j++){const px=-20+(j%3)*14,py=-29+Math.floor(j/3)*17;box(px,py,11,14,["#b3c4a4","#d0b880","#b79583"][j%3],.4);A.line(c,[[px+2,py+4],[px+8,py+4]],"#5b756a",1.2);A.ellipse(c,px+5,py+9,2.6,2.6,"#7b8b73");}
 }else if(o.kind==="crate"){
  box(-19,-19,24,23,"#aa895d");box(3,-11,18,17,"#b4996a");A.line(c,[[-16,-16],[2,1],[-16,1],[2,-16]],"#7a704f",1.2);
  for(let j=0;j<5;j++)A.ellipse(c,7+(j%3)*4,-11-Math.floor(j/3)*4,3,3,v%2?"#cf9c52":"#97a361",INK,.5);
 }else if(o.kind==="bin"){
  box(-10,-23,20,28,"#7a9688");A.ellipse(c,0,-23,12,4,"#aebca4",INK,1);for(let j=0;j<4;j++)A.line(c,[[-7+j*5,-18],[-6+j*5,0]],"#566f62",1);
 }else if(o.kind==="hydrant"){
  box(-5,-21,10,26,"#bb795f");A.ellipse(c,0,-22,6,4,"#ddaa78",INK,.8);box(-10,-13,20,5,"#b58c66");A.ellipse(c,0,-13,3,3,"#d4c08b",INK,.8);
 }else if(o.kind==="stairway"){
  A.path(c,[[-25,10],[-22,-45],[19,-45],[25,10]],"#727b6b",INK,1.2);
  for(let j=0;j<8;j++){box(-22,-43+j*6,44,5,j%2?"#c3c4aa":"#b0b39a",.2);}
  A.line(c,[[-24,10],[-24,-51],[20,-51],[24,10]],"#626d5e",2);
  for(let j=0;j<4;j++){A.line(c,[[-24,-47+j*16],[-24,-39+j*16]],"#d0c59e",1);}
 }else if(o.kind==="chalkboard"){
  A.line(c,[[-12,-30],[-17,8],[14,-30],[20,8]],"#826c4d",3);box(-13,-32,28,30,"#6a7d66",2);
  A.line(c,[[-7,-24],[8,-24]],"#e5ddb3",1.5);for(let j=0;j<3;j++)A.line(c,[[-7,-17+j*5],[5-j,-17+j*5]],"#d1d7b8",1);
 }else if(o.kind==="wires"){
  box(-4,-79,8,89,"#8d8060");A.line(c,[[-18,-67],[19,-67]],"#6d7665",3);
  for(const dx of [-13,0,13]){box(dx-2,-72,4,7,"#b7c5ad");c.beginPath();c.moveTo(dx-66,-91);c.quadraticCurveTo(-30,-48,dx,-69);c.quadraticCurveTo(34,-34,dx+68,-68);c.strokeStyle="#586353";c.lineWidth=.9;c.stroke();}
 }else if(o.kind==="haybale"){
  box(-23,-22,43,27,"#cfba76",4);A.line(c,[[-9,-21],[-8,3],[8,-21],[9,3]],"#938256",2);for(let j=0;j<8;j++)A.line(c,[[-19+j*5,-19],[-16+j*5,0]],"#eed38b",.8);
 }else if(o.kind==="beehive"){
  box(-17,-24,34,29,"#c7b485");for(let j=0;j<4;j++)A.line(c,[[-16,-20+j*7],[16,-20+j*7]],"#96845d",1);box(-19,-30,38,7,"#938c70");box(-6,0,13,3,"#5c6550");
 }else if(o.kind==="well"){
  A.ellipse(c,0,-1,23,13,"#bfb694",INK,1);A.ellipse(c,0,-5,17,8,"#648b81",INK,1);box(-23,-47,5,48,"#a58b65");box(18,-47,5,48,"#a58b65");A.path(c,[[-30,-45],[0,-62],[30,-45]],"#8b9a77",INK,1.4);A.line(c,[[0,-43],[0,-8]],"#a99a74",1);box(-5,-10,10,8,"#a78f63");
 }else if(o.kind==="gate"||o.kind==="farmfence"){
  box(-25,-26,5,34,"#a39771");box(21,-26,5,34,"#a39771");box(-23,-20,47,5,"#c1b187");box(-23,-4,47,5,"#c1b187");if(o.kind==="gate")A.line(c,[[-21,-17],[21,0]],"#a08b61",3);
 }else if(o.kind==="scarecrow"){
  A.line(c,[[0,-44],[0,10]],"#947e56",3);A.line(c,[[-22,-30],[22,-30]],"#947e56",3);A.path(c,[[-13,-34],[13,-34],[19,-10],[-18,-10]],"#9f9673",INK,1);A.ellipse(c,0,-44,9,8,"#d2bd83",INK,1);A.ellipse(c,0,-49,15,4,"#b29b6a",INK,1);box(-8,-57,16,8,"#bca674");A.ellipse(c,3,-43,1,1,INK);
 }else if(o.kind==="coastRock"){
  A.path(c,[[-30,7],[-25,-15],[-11,-32],[15,-29],[30,-12],[26,10]],cold?"#a2b8bd":"#8d9680",INK,1.3);A.path(c,[[-25,-15],[-11,-32],[15,-29],[19,-13],[-4,-9]],cold?"#d6e5e2":"#b9b99b",null);A.line(c,[[-4,-9],[-6,5],[7,3],[12,-9]],"#737f6e",1);if(cold)A.ellipse(c,-4,-27,18,5,"#f6ffff");
 }else if(o.kind==="drygrass"||o.kind==="reeds"){
  for(let j=0;j<9;j++){const dx=-17+j*4,top=-10-W.hash(j,v,941)*22;A.line(c,[[dx,5],[dx-3,top],[dx-7,top-3]],o.kind==="reeds"?"#8a9c6b":"#b3ac6d",1.4);if(j%2)A.ellipse(c,dx-3,top+3,1.8,4,o.kind==="reeds"?"#9a8761":"#d5c780");}
 }
}
A.object=function(c,o){
 if(!kinds.has(o.kind)){original.object(c,o);return;}
 const key=o.kind+":"+(o.variant%4||0)+":"+(o.biome===W.B.WINTER),x=o.x*T+T/2+(o.ox||0),y=o.y*T+T/2+(o.oy||0);
 let canvas=detailCache.get(key);
 if(!canvas){canvas=document.createElement("canvas");canvas.width=160;canvas.height=190;const cc=canvas.getContext("2d");cc.translate(80,140);paintDetail(cc,o);detailCache.set(key,canvas);if(detailCache.size>80)detailCache.delete(detailCache.keys().next().value);}
 c.drawImage(canvas,x-80,y-140);
};
A.buildingMetrics=b=>({width:b.w*T+20,height:b.kind==="skyscraper"?340+(b.floors-8)*24:b.h*T+70,base:(b.y+b.h)*T-3});
A.building=function(c,b){
 if((b.style!=="urban"&&!["farm","barn","skyscraper"].includes(b.kind))||b.landmark){original.building(c,b);return;}
 const m=A.buildingMetrics(b),cx=(b.x+b.w/2)*T;
 const index=b.kind==="skyscraper"?2+(b.id%2):b.kind==="farm"?6:b.kind==="barn"?7:b.kind==="cafe"?b.id%2?5:1:b.kind==="shop"?4:b.kind==="house"?0:5;
 A.shadow(c,cx,m.base,m.width*.85);
 if(!A.sprite(c,"urban",index,cx,m.base,m.width,m.height))original.building(c,b);
};
A.animal=function(c,a,now){
 const walking=a.moving,frame=walking?Math.floor(now*.009+a.id)%4:0;
 const index=a.kind==="dog"?a.variant===3?15:frame:a.kind==="cat"?4+frame:a.kind==="pigeon"?8+frame:a.kind==="chicken"?12:a.kind==="sheep"?13:14;
 const size={dog:39,cat:31,pigeon:20,chicken:26,sheep:41,cow:48}[a.kind],bob=walking?Math.sin(now*.016+a.id)*.65:0;
 A.ellipse(c,a.x+1,a.y+3,size*.34,size*.10,"#384d3830");
 if(!A.sprite(c,"animals",index,a.x,a.y+6+bob,size,size*.85,a.direction<0)){
  A.ellipse(c,a.x,a.y-5,size*.35,size*.2,a.kind==="pigeon"?"#8b9e98":"#bd9b71",INK,1);
  A.ellipse(c,a.x+size*.23*a.direction,a.y-10,size*.17,size*.16,"#b2a17d",INK,1);
 }
};
})();
