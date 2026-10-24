import * as kit from '../.agents/skills/anatomy/kit/iso-kit.mjs';
import {spec,finishes} from './spec.mjs';
import {transform} from './model.mjs';
const P=kit.fitProjection(kit.boxCorners({x:-450,y:-250,w:4450,d:5550},-250,3650),1000,800,{pad:32,azimuth:48,elevation:37});
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pt=p=>kit.iso(p,P);
const path=(ps,closed=false)=>kit.pathOf(ps.map(pt),closed);
// Sort overlapping convex silhouettes using separating world planes. A top surface stays
// above its supporting mattress/rug regardless of the objects' different centre positions.
function hull(points){
 const p=points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]), cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 const lo=[],hi=[];for(const x of p){while(lo.length>1&&cross(lo.at(-2),lo.at(-1),x)<=0)lo.pop();lo.push(x);}
 for(const x of [...p].reverse()){while(hi.length>1&&cross(hi.at(-2),hi.at(-1),x)<=0)hi.pop();hi.push(x);}return [...lo.slice(0,-1),...hi.slice(0,-1)];
}
function overlap(a,b){
 for(const shape of[a,b])for(let i=0;i<shape.length;i++){
  const p=shape[i],q=shape[(i+1)%shape.length],n=[p[1]-q[1],q[0]-p[0]];
  const aa=a.map(v=>v[0]*n[0]+v[1]*n[1]),bb=b.map(v=>v[0]*n[0]+v[1]*n[1]);
  if(Math.max(...aa)<=Math.min(...bb)+.001||Math.max(...bb)<=Math.min(...aa)+.001)return false;
 }return true;
}
const overlapCache=new WeakMap();
function geometryOrder(items){
 const sorted=[...items].sort((a,b)=>a.depth-b.depth||a.order-b.order);
 const edges=sorted.map(()=>[]),degree=sorted.map(()=>0);
 for(let i=0;i<sorted.length;i++)for(let j=i+1;j<sorted.length;j++){
  const a=sorted[i],b=sorted[j];if(!a.bounds||!b.bounds)continue;
  let cache=overlapCache.get(a.hull);if(!cache){cache=new WeakMap();overlapCache.set(a.hull,cache);}
  let relation=cache.get(b.hull);
  if(relation===undefined){
   const forward=[0,1,2].some(k=>a.bounds[k+3]<=b.bounds[k]+.001);
   const backward=[0,1,2].some(k=>b.bounds[k+3]<=a.bounds[k]+.001);
   relation=forward===backward||!overlap(a.hull,b.hull)?0:forward?1:-1;cache.set(b.hull,relation);
  }
  const ab=relation===1,ba=relation===-1;
  if(ab===ba)continue;
  const [from,to]=ab?[i,j]:[j,i];edges[from].push(to);degree[to]++;
 }
 const result=[],used=new Set();let cycles=0;
 while(result.length<sorted.length){let i=degree.findIndex((d,i)=>!d&&!used.has(i));if(i<0){i=degree.findIndex((d,i)=>!used.has(i));cycles++;}
 used.add(i);result.push(sorted[i]);for(const j of edges[i])degree[j]--;}
 return {items:result,cycles};
}
const shapeCache=new Map();
export function renderScene(m,finish='sage'){
 const f=finishes[finish]||finishes.sage;
 const colors={plaster:'#e8dfcd',floor:'#d3bc96',wood:f.wood,fabric:f.fabric,accent:f.accent,linen:'#f1e8d7',bronze:'#655846',metal:'#a5aba5',dark:'#46504c',glass:'#b3c9c7',soil:'#655444',leaf:'#7d9275',wall:'#c4baa6',white:'#faf5e9',light:`rgb(${Math.round(241+14*m.lights)},${Math.round(232+16*m.lights)},${Math.round(215-13*m.lights)})`};
 const layers={base:[],rear:[],objects:[],front:[],overlay:[]};let serial=0, inventory=[];
 const group=(id,body,opacity=1)=>`<g data-assembly="${id}" opacity="${opacity.toFixed(4)}">${body}</g>`;
 function box(id,x,y,z,w,d,h,material='wood',layer='objects',opts={}){
  const color=colors[material]||material;
  const key=JSON.stringify([x,y,z,w,d,h,opts.r,opts.bevel]);
  let cached=shapeCache.get(id);if(!cached||cached.key!==key){cached={key,shape:kit.slabOf({x,y,w,d,r:opts.r||0},z,h,P,opts.r?4:1,opts.bevel||0),hull:hull(kit.boxCorners({x,y,w,d},z,z+h).map(pt))};shapeCache.set(id,cached);}
  const shape=cached.shape;
  const svg=`<g data-part="${id}" style="--material:${color}" opacity="${opts.opacity??1}">${kit.solidSvg(shape,{crease:'faint'})}</g>`;
  const depth=kit.depthOf([x+w/2,y+d/2,z+h/2],P);
  layers[layer].push({svg,depth,id,order:serial++,bounds:[x,y,z,x+w,y+d,z+h],hull:cached.hull});inventory.push({id,assembly:opts.assembly||id.split('-')[0],x,y,z,w,d,h,material});return svg;
 }
 const line=(points,color='#655846',width=1,extra='')=>`<path d="${path(points)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
 function topLine(points,color,width,layer='objects',depth=99999){layers[layer].push({svg:line(points,color,width),depth,order:serial++});}
 function cylinder(id,x,y,z,r,h,material,layer='objects'){
  const key=JSON.stringify([x,y,z,r,h]);let cached=shapeCache.get(id);
  if(!cached||cached.key!==key){cached={key,shape:kit.cylinder(x,y,r,z,h,P,20,3),hull:hull(kit.boxCorners({x:x-r,y:y-r,w:r*2,d:r*2},z,z+h).map(pt))};shapeCache.set(id,cached);}
  const svg=`<g data-part="${id}" style="--material:${colors[material]}">${kit.solidSvg(cached.shape)}</g>`;
  layers[layer].push({svg,depth:kit.depthOf([x,y,z+h/2],P),order:serial++,bounds:[x-r,y-r,z,x+r,y+r,z+h],hull:cached.hull});inventory.push({id,assembly:id.split('-')[0],x:x-r,y:y-r,z,w:r*2,d:r*2,h,material});
 }
 // Finished floor is z=0. Physical layers remain fixed; only the local section explodes.
 box('shell-foundation',-160,-160,-220,3920,5120,150,'wall','base');
 box('shell-screed',0,0,-70,3600,4800,50,'wall','base');
 box('shell-underlay',0,0,-20,3600,4800,5,'dark','base');
 box('shell-finish',0,0,-15,3600,4800,15,'floor','base');
 for(let x=0;x<3600;x+=240)for(let y=0;y<4800;y+=1200){
  // Closed plank outlines terminate at physical plank edges.
  const y0=y+(x%480?600:0);if(y0>=4800)continue;
  topLine([[x,y0,1],[x+240,y0,1],[x+240,Math.min(y0+1200,4800),1],[x,Math.min(y0+1200,4800),1],[x,y0,1]],'#ac9577',.45,'base');
 }
 box('wall-west',-160,-160,0,160,5120,3000,'plaster','rear');
 box('wall-south',0,-160,0,3760,160,3000,'plaster','rear');
 box('skirting-west',0,0,0,22,4800,100,'linen','rear');
 box('skirting-south',0,0,0,3600,22,100,'linen','rear');
 // West-wall framed artwork, built in its actual vertical plane.
 box('art-frame',0,2850,1550,35,820,820,'wood','rear');
 box('art-paper',35,2880,1580,5,760,760,'linen','rear');
 box('art-colour-1',41,2940,1660,3,285,570,'accent','rear');
 box('art-colour-2',41,3250,1660,3,330,300,'fabric','rear');
 // Wardrobe carcass: open centre bay makes the functional drawer readable.
 box('wardrobe-plinth',600,20,0,2400,560,90,'dark');
 box('wardrobe-base',600,0,90,2400,600,30);
 box('wardrobe-back',600,0,120,2400,22,2250);
 for(const x of[600,1380,2190,2970])box(`wardrobe-upright-${x}`,x,22,120,30,578,2250);
 box('wardrobe-crown',600,0,2370,2400,600,30);
 for(const x of[630,2220]){
  box(`wardrobe-door-${x}`,x,575,120,750,25,2240,'wood');
  box(`wardrobe-door-inset-${x}`,x+38,601,170,674,3,2140,'wood');
  box(`wardrobe-handle-${x}`,x+640,608,1040,12,30,260,'bronze');
 }
 for(const z of[580,1060,1690])box(`wardrobe-shelf-${z}`,1410,25,z,780,550,25);
 box('wardrobe-rail',1435,300,2180,730,18,18,'bronze');
 for(let i=0;i<4;i++)box(`hanging-shirt-${i}`,1475+i*155,265,1750,95,80,380,i%2?'linen':'fabric','objects');
 box('wardrobe-folded-linen-1',1480,140,1715,310,300,60,'linen');
 box('wardrobe-folded-linen-2',1820,160,1715,285,280,90,'accent');
 box('wardrobe-storage-box',1500,80,1090,510,370,240,'linen', 'objects',{r:18});
 box('wardrobe-box-pull',1710,452,1195,80,8,30,'bronze');
 const e=m.extension,dy=35+e;
 box('drawer-base',1410,dy,620,780,540,18,'wood','objects',{assembly:'drawer'});
 for(const x of[1410,2172])box(`drawer-side-${x}`,x,dy,638,18,540,160,'wood','objects',{assembly:'drawer'});
 box('drawer-back',1428,dy,638,744,18,160,'wood','objects',{assembly:'drawer'});
 box('drawer-front',1410,575+e,620,780,25,190,'wood','objects',{assembly:'drawer'});
 box('drawer-handle',1710,607+e,705,180,25,18,'bronze','objects',{assembly:'drawer'});
 box('drawer-linen',1490,dy+80,638,280,280,95,'linen','objects',{r:24,assembly:'drawer'});
 for(const x of[1395,2192]){
  box(`runner-fixed-${x}`,x,45,690,12,500,32,'metal');
  box(`runner-middle-${x}`,x+3,45+e/2,722,9,500,22,'bronze');
  box(`runner-inner-${x}`,x+5,45+e,744,7,500,18,'metal');
 }
 // Bed, rug and side tables move together in the deliberate clearance experiment.
 const by=m.bedY;
 box('rug',650,by-220,2,2300,2500,8,'linen','objects',{r:65});
 for(let i=0;i<6;i++)box(`rug-fringe-${i}`,700+i*420,by-235,2,260,18,5,'linen');
 for(const x of[1060,2470])for(const y of[by+100,by+1800])box(`bed-leg-${x}-${y}`,x,y,10,70,70,180,'bronze');
 box('bed-frame',1000,by,190,1600,2000,150,'wood','objects',{r:30});
 box('bed-mattress',1025,by+25,340,1550,1950,200,'linen','objects',{r:70,bevel:8});
 box('bed-duvet',1010,by+40,540,1580,1360,110,'fabric','objects',{r:75,bevel:10});
 box('bed-throw',1005,by+90,650,1590,440,35,'accent','objects',{r:25});
 for(let i=0;i<5;i++)box(`bed-throw-weave-${i}`,1020,by+120+i*75,685,1555,8,2,'linen');
 box('bed-headboard',960,by+1990,0,1680,85,1120,'fabric','objects',{r:38});
 for(const x of[1080,1840])box(`bed-pillow-${x}`,x,by+1500,540,650,400,140,'linen','objects',{r:95,bevel:10});
 for(const x of[420,2760]){
  for(const xx of[x+25,x+345])box(`table-leg-${xx}`,xx,by+1750,10,30,320,370,'bronze');
  box(`table-case-${x}`,x,by+1710,380,420,420,170,'wood','objects',{r:10});
  box(`table-top-${x}`,x-15,by+1695,550,450,450,22,'wood','objects',{r:15});
  box(`table-handle-${x}`,x+150,by+2132,445,120,15,12,'bronze');
  cylinder(`lamp-base-${x}`,x+220,by+1900,572,95,15,'bronze');
  cylinder(`lamp-stem-${x}`,x+220,by+1900,587,12,230,'bronze');
  cylinder(`lamp-shade-${x}`,x+220,by+1900,817,125,150,'light');
 }
 box('books-1',430,by+1720,572,160,220,25,'accent');
 box('books-2',440,by+1725,597,145,200,20,'fabric');
 // Plant by the west wall, clear of the drawer section and door sweep.
 cylinder('plant-pot',320,1250,0,140,240,'accent');
 cylinder('plant-soil',320,1250,240,125,5,'soil');
 cylinder('plant-stem',320,1250,245,14,590,'bronze');
 for(let i=0;i<7;i++){
  const angle=i*2.4;const x=320+Math.cos(angle)*100,y=1250+Math.sin(angle)*110,z=380+i*65;
  box(`plant-leaf-${i}`,x-60,y-35,z,170,90,18,'leaf','objects',{r:42});
 }
 // Indoor recirculating unit on south wall; visible fan and outlet slot.
 box('air-housing',3150,5,2450,420,180,370,'linen','rear',{r:25});
 box('air-intake',3180,190,2680,360,6,85,'dark','rear');
 for(let i=0;i<6;i++)box(`air-louvre-${i}`,3185,198,2690+i*11,350,8,4,'metal','rear');
 box('air-outlet',3180,188,2480,360,8,65,'dark','rear');
 // The fan lives in the front x/z plane, with a real hub pivot and continuous blade rotation.
 if(m.air>0){
  const cx=3355,cy=207,cz=2590,rot=m.t*2.4;
  const ring=Array.from({length:33},(_,i)=>[cx+70*Math.cos(i*Math.PI/16),cy,cz+70*Math.sin(i*Math.PI/16)]);
  let blades=`<path d="${path(ring,true)}" fill="#d6d9cc" stroke="#58645b" stroke-width="1"/>`;
  for(let i=0;i<5;i++){
   const a=rot+i*Math.PI*2/5;
   const ps=[[0,0],[62,-14],[54,26],[15,17]].map(([x,z])=>[cx+x*Math.cos(a)-z*Math.sin(a),cy+1,cz+x*Math.sin(a)+z*Math.cos(a)]);
   blades+=`<path d="${path(ps,true)}" fill="#7a9186" stroke="#35473e" stroke-width=".7"/>`;
  }
  const hub=pt([cx,cy+2,cz]);blades+=`<circle cx="${hub[0]}" cy="${hub[1]}" r="3" fill="#415247"/>`;
  layers.overlay.push({svg:group('air-fan-cutaway',blades,m.air)});
 }
 // East door jambs and a rotated leaf; its real hinge remains fixed.
 const angle=Math.PI/2*.75;
 const leaf=[[3600,950,0],[3600,1800,0],[3565,1800,0],[3565,950,0]].map(p=>transform(p,{pivot:[3600,950,0],angle}));
 const ring=leaf.map(p=>p.slice(0,2));
 layers.objects.push({svg:`<g data-part="door-leaf" style="--material:${colors.wood}" opacity=".72">${kit.solidSvg(kit.extrude(ring,0,2100,P))}</g>`,depth:kit.depthOf([3680,1200,1000],P),order:serial++});
 const doorPoint=p=>transform(p,{pivot:[3600,950,0],angle});
 layers.front.push({svg:line([doorPoint([3558,1680,1050]),doorPoint([3530,1680,1050]),doorPoint([3530,1570,1050])],'#655846',2)});
 for(const z of[250,1750])box(`door-hinge-${z}`,3576,950,z,20,25,90,'bronze','front');
 // Door swing is available as a floor overlay in stage one.
 const swing=Array.from({length:25},(_,i)=>transform([3600,1800,4],{pivot:[3600,950,0],angle:i*Math.PI/48}));
 layers.overlay.push({svg:group('door-swing',line(swing,'#927f61',1.2,'stroke-dasharray="3 5"'),m.open*.5)});
 for(const y of[915,1800])box(`door-jamb-${y}`,3580,y,0,55,35,2140,'linen','front',{opacity:.65});
 box('door-header',3580,915,2100,55,920,40,'linen','front',{opacity:.65});
 box('switch-plate',3570,1870,1100,15,95,130,'linen','front');
 box('switch-rocker',3565,1890,1120,6,55,85,'light','front');
 const wallHeight=560-420*m.open;
 box('cutaway-east-south',3600,0,0,150,915,wallHeight,'plaster','front');
 box('cutaway-east-north',3600,1835,0,150,2965,wallHeight,'plaster','front');
 box('cutaway-north',0,4800,0,3600,150,wallHeight,'plaster','front',{opacity:.45});
 // North window shown as a lightweight section above the cutaway wall.
 for(const x of[1050,2515])box(`window-jamb-${x}`,x,4790,1200,35,75,1200,'linen','front',{opacity:.75});
 for(const z of[1200,2370])box(`window-rail-${z}`,1050,4790,z,1500,75,30,'linen','front',{opacity:.75});
 box('window-mullion',1782,4790,1230,35,75,1140,'linen','front',{opacity:.65});
 box('window-glass',1085,4820,1230,1430,4,1140,'glass','front',{opacity:.09});
 box('curtain-track',900,4750,2540,1800,30,25,'bronze','front',{opacity:.55});
 for(const x of[920,2460])for(let i=0;i<4;i++)box(`curtain-${x}-${i}`,x+i*45,4770,900,42,42,1620,'linen','front',{r:20,opacity:.42});
 // Lifted ceiling: local panel, three framing battens and a fixed cable route.
 const cz=3000+m.ceiling*520;
 box('ceiling-panel',500,100,cz,2500,640,15,'linen','rear',{opacity:.28+.5*m.ceiling});
 for(const x of[650,1720,2820])box(`ceiling-batten-${x}`,x,100,3015,35,640,75,'metal','rear',{opacity:.18+.72*m.ceiling});
 for(const x of[650,2820])box(`ceiling-hanger-${x}`,x,380,3090,12,12,60,'bronze','rear',{opacity:m.ceiling});
 for(const x of[1100,2500])cylinder(`downlight-${x}`,x,500,2960,75,40,'light','rear');
 box('wardrobe-light-strip',650,592,2320,2300,10,12,'light');
 const cable=[[3570,1920,1230],[3570,1920,3070],[3570,500,3070],[2500,500,3070],[1100,500,3070]];
 layers.overlay.push({svg:group('service-cable',line(cable,'#b08245',2.2)+line([[1100,500,3070],[1100,500,3000]],'#b08245',2.2)+line([[2500,500,3070],[2500,500,3000]],'#b08245',2.2),m.ceiling)});
 // Separate small sample at the west-front floor edge; physical thicknesses are preserved.
 let physical=-70;
 for(let i=2;i>=0;i--){const l=spec.layers[i];const z=physical+(3-i)*190*m.layers;
  box(`floor-section-${i}`,-440,-40,z,420,700,l.mm,['wood','dark','wall'][i],'front',{opacity:m.layers});physical+=l.mm;
 }
 box('wall-section-substrate',-310,700,700,150,400,650,'wall','front',{opacity:m.layers});
 box('wall-section-plaster',-160-180*m.layers,700,700,12,400,650,'linen','front',{opacity:m.layers});
 // Illustrative light pools, kept within floor/bed surfaces rather than suggesting measured lux.
 if(m.lights>0){for(const x of[640,2980]){const q=pt([x,by+1850,575]);layers.overlay.push({svg:`<ellipse cx="${q[0]}" cy="${q[1]}" rx="37" ry="18" fill="#f5cf7b" opacity="${m.lights*.18}"/>`});}}
 if(m.air>0){
  const traces=[];for(let i=0;i<3;i++){
   const pts=[[3290+i*70,205,2520],[3300+i*70,1000,2200],[3300+i*45,2200,1500],[3200+i*35,2900,900]];
   traces.push(line(pts,'#668e8c',1.8,`stroke-dasharray="7 10" stroke-dashoffset="${(-m.t*18).toFixed(3)}"`));
   const ret=[[3100-i*65,2700,1200],[3050-i*65,1800,1900],[3100-i*50,500,2750],[3200+i*30,205,2750]];
   traces.push(line(ret,'#a88865',1.5,`stroke-dasharray="3 8" stroke-dashoffset="${(-m.t*13).toFixed(3)}"`));
  }layers.overlay.push({svg:group('recirculation',traces.join(''),m.air)});
 }
 // Dimension anchors share the drawer front and opposing bed face exactly.
 if(m.drawer>0||m.explore){
  const x=2240,z=380,a=[x,600+m.extension,z],b=[x,m.bedY,z];
  const q=pt([x,(a[1]+b[1])/2,z]);
  const color=m.collision?'#ad4f3b':'#3b7065';
  layers.overlay.push({svg:group('clearance',line([a,b],color,2)+line([[x-70,a[1],z],[x+70,a[1],z]],color,2)+line([[x-70,b[1],z],[x+70,b[1],z]],color,2)+`<g transform="translate(${q[0]+8} ${q[1]-9})"><rect x="-5" y="-16" width="116" height="26" rx="6" fill="#f5f0e5" stroke="${color}"/><text class="scene-label" fill="${color}">${Math.round(m.clearance).toLocaleString('en')} mm</text></g>`,m.explore?1:m.drawer*(1-m.progress[3]))});
 }
 const label=(id,world,text,opacity)=>{const [x,y]=pt(world);return group(id,`<g transform="translate(${x} ${y})"><rect x="-8" y="-20" width="${text.length*7.3+18}" height="29" rx="6" fill="#f5f0e5" stroke="#c9beaa"/><text class="scene-label">${escape(text)}</text></g>`,opacity);};
 const dimensions=m.open*(1-m.progress[1]);
 layers.overlay.push({svg:group('room-dimensions',line([[0,5030,-20],[3600,5030,-20]],'#8c947f',1)+line([[3830,0,-20],[3830,4800,-20]],'#8c947f',1),dimensions)});
 layers.overlay.push({svg:label('width-label',[1500,5030,-30],'3,600 mm',dimensions)});
 layers.overlay.push({svg:label('length-label',[3880,2200,-30],'4,800 mm',dimensions)});
 layers.overlay.push({svg:label('layer-label',[-400,900,1400],'15 + 5 + 50 = 70 mm',m.layers)});
 layers.overlay.push({svg:label('ceiling-label',[500,0,3700],'150 mm service void',m.ceiling*(1-m.progress[5]))});
 layers.overlay.push({svg:label('air-label',[2300,1600,2200],'Room air · schematic',m.air)});
 const ordered=geometryOrder(layers.objects);
 const order=(arr,sort=true)=> (sort?ordered.items:arr).map(o=>o.svg).join('');
 // Stable semantic strata prevent complete rear walls from sorting across the room contents.
 const nodes=[{key:'shadow',svg:'<ellipse cx="500" cy="677" rx="330" ry="66" fill="#ddd4c3" opacity=".45"/>'}];
 for(const name of['base','rear','objects','front','overlay']){
  const list=name==='objects'?ordered.items:layers[name];
  list.forEach((item,i)=>{const identity=item.svg.match(/data-(?:part|assembly)="([^"]+)"/);nodes.push({key:identity?identity[1]:`${name}-${i}`,svg:item.svg});});
 }
 const result=`<svg id="room-svg" viewBox="0 0 1000 800" role="img" aria-labelledby="scene-title scene-desc"><title id="scene-title">Room Anatomy: furnished demonstration bedroom</title><desc id="scene-desc">Isometric architectural cutaway with a bed, wardrobe, opening drawer, window, door, lamps, ceiling and indoor air unit. The adjacent text explains the active stage.</desc><g id="room-art">${nodes.map(n=>`<g data-render-key="${n.key}">${n.svg}</g>`).join('')}</g></svg>`;
 return {svg:result,nodes,inventory,projection:P,depthCycles:ordered.cycles};
}
export function clearanceDetail(m,finish='sage'){
 const f=finishes[finish];const scale=.18,gap=m.bedGap*scale,travel=m.extension*scale;
 return `<svg viewBox="0 0 520 200" role="img" aria-label="Plan view: drawer extension ${Math.round(m.extension)} millimetres; remaining clearance ${Math.round(m.clearance)} millimetres"><text x="20" y="22" class="detail-kicker">PLAN VIEW · SAME MODEL</text><rect x="20" y="50" width="105" height="92" rx="5" fill="${f.wood}" stroke="#514f44"/><rect x="${40+travel}" y="72" width="85" height="48" fill="#eadac0" stroke="#514f44"/><line x1="40" y1="67" x2="${125+travel}" y2="67" stroke="#767d79" stroke-width="5"/><line x1="40" y1="127" x2="${125+travel}" y2="127" stroke="#767d79" stroke-width="5"/><rect x="${125+gap}" y="40" width="65" height="115" rx="8" fill="${f.fabric}" stroke="#514f44"/>${m.collision?`<rect x="${125+gap}" y="72" width="${-m.clearance*scale}" height="48" fill="#b54f3c" opacity=".65"/>`:''}<line x1="${125+travel}" y1="166" x2="${125+gap}" y2="166" stroke="${m.collision?'#ad4f3b':'#3b7065'}" stroke-width="2"/><text x="20" y="190">Wardrobe</text><text x="${125+gap}" y="190">Bed</text><text x="${Math.min(130+travel,370)}" y="157" fill="${m.collision?'#ad4f3b':'#3b7065'}">${Math.round(m.clearance).toLocaleString('en')} mm</text></svg>`;
}

// Retain static SVG nodes. Only moving/material-changing parts are reparsed, then
// keyed nodes are reordered to the exact same geometry-derived painter order.
const domCaches=new WeakMap();
export function updateRoomDOM(container,room){
 let cache=domCaches.get(container);
 if(!cache){container.innerHTML=room.svg;cache=new Map();for(const n of room.nodes)cache.set(n.key,{markup:n.svg,el:[...container.querySelector('#room-art').children].find(el=>el.dataset.renderKey===n.key)});domCaches.set(container,cache);return;}
 const art=container.querySelector('#room-art');let cursor=art.firstElementChild;const used=new Set();
 for(const node of room.nodes){
  used.add(node.key);let entry=cache.get(node.key);
  if(!entry){const el=document.createElementNS('http://www.w3.org/2000/svg','g');el.dataset.renderKey=node.key;entry={el,markup:null};cache.set(node.key,entry);}
  if(entry.markup!==node.svg){entry.el.innerHTML=node.svg;entry.markup=node.svg;}
  if(entry.el!==cursor)art.insertBefore(entry.el,cursor);
  cursor=entry.el.nextElementSibling;
 }
 for(const [key,entry]of cache)if(!used.has(key)){entry.el.remove();cache.delete(key);}
}
