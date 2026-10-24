import * as kit from '../.agents/skills/anatomy/kit/iso-kit.mjs';
import {spec,finishes} from './spec.mjs';
import {evaluate,smooth} from './model.mjs';
import {renderScene,geometryOrder,hull} from './scene.mjs';
import {lessons,studyState,studyParts} from './study-model.mjs';
const detailCache=new Map(),projectionCache=new Map(),locatorCache=new Map();
function detailProjection(index,m){
 if(!projectionCache.has(index)){
  const bounds=[...studyParts(index,0,{...m,extension:0,bedY:2100}),...studyParts(index,1,{...m,extension:450,bedY:2400})].flatMap(p=>kit.boxCorners({x:p.x+p.offset[0],y:p.y+p.offset[1],w:p.w,d:p.d},p.z+p.offset[2],p.z+p.offset[2]+p.h));
  const proj=kit.fitProjection(bounds,720,660,{pad:28,azimuth:index===2?62:42,elevation:index===4?22:30});
  // Reserve label gutters. Projection's origin is offset only in screen space.
  projectionCache.set(index,proj);
 }
 return projectionCache.get(index);
}
const detailEsc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function detailView(index,u,m,finish,selected){
 const f=finishes[finish],colors={wood:f.wood,fabric:f.fabric,accent:f.accent,linen:'#eee6d6',wall:'#bdb5a5',metal:'#a4b5b0',bronze:'#876b43',dark:'#475854',light:'#f4d078'};
 const proj=detailProjection(index,m),parts=studyParts(index,u,m),items=[],inventory=[];
 const point=p=>{const q=kit.iso(p,proj);return[q[0]+140,q[1]+60];};
 for(const p of parts){
  const [dx,dy,dz]=p.offset,x=p.x+dx,y=p.y+dy,z=p.z+dz;
  const k=JSON.stringify([index,p.id,p.x,p.y,p.z,p.w,p.d,p.h,p.r]);let shape=detailCache.get(k);
  if(!shape){shape=kit.solidSvg(kit.slabOf({x:p.x,y:p.y,w:p.w,d:p.d,r:p.r},p.z,p.h,proj,p.r?6:1),{crease:'faint'});detailCache.set(k,shape);}
  const zero=kit.iso([0,0,0],proj),d=kit.iso(p.offset,proj),corners=kit.boxCorners({x,y,w:p.w,d:p.d},z,z+p.h),pts=corners.map(point);
  const faded=selected&&selected!==p.component?.36:1;
  items.push({id:p.id,order:items.length,depth:kit.depthOf([x+p.w/2,y+p.d/2,z+p.h/2],proj),bounds:[x,y,z,x+p.w,y+p.d,z+p.h],hull:hull(pts),svg:`<g data-part="study-${p.id}" data-component="${p.component}" class="study-part ${selected===p.component?'selected':''}" style="--material:${colors[p.material]||p.material}" opacity="${p.opacity*faded}" transform="translate(${140+d[0]-zero[0]} ${60+d[1]-zero[1]})">${shape}</g>`});
  inventory.push({...p,screenBounds:[Math.min(...pts.map(p=>p[0])),Math.min(...pts.map(p=>p[1])),Math.max(...pts.map(p=>p[0])),Math.max(...pts.map(p=>p[1]))]});
 }
 const ordered=geometryOrder(items),nodes=ordered.items.map(p=>({key:`detail-${index}-${p.id}`,svg:p.svg}));
 let effects='';
 const line=(ps,color='#a97a35',width=2,extra='')=>`<path d="${kit.pathOf(ps.map(point))}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" ${extra}/>`;
 if(index===2){
  const a=[1800,600+m.extension,615],b=[1800,m.bedY,615],pa=point(a),pb=point(b);
  effects+=line([a,b],m.collision?'#b44332':'#437767',3)+`<circle cx="${pa[0]}" cy="${pa[1]}" r="4" fill="#437767"/><circle cx="${pb[0]}" cy="${pb[1]}" r="4" fill="#437767"/><text x="${(pa[0]+pb[0])/2+12}" y="${(pa[1]+pb[1])/2}" class="measure-label">${Math.round(m.clearance)} mm</text>`;
 }
 if(index===4){const dz=450*smooth((u-.05)/.85);effects+=line([[1100,500,3060+dz],[2500,500,3060+dz],[3300,500,3060+dz],[3300,4000,3060+dz]],'#ae783c',2.8,'stroke-dasharray="8 4"');}
 if(index===5){
  const reveal=smooth((u-.4)/.4),rot=m.t*2.4;
  const rotorSurfaces=[],rotorPoints=[];
  // Actual blade vertices rotate about x. Sort their planes and cap the drum ends.
  for(let i=0;i<12;i++){
   const a=rot+i*Math.PI/6;
   const ring=[[60,80+45*Math.cos(a),115+45*Math.sin(a)],[335,80+45*Math.cos(a),115+45*Math.sin(a)],[335,80+45*Math.cos(a+.2),115+45*Math.sin(a+.2)],[60,80+45*Math.cos(a+.2),115+45*Math.sin(a+.2)]];
   rotorPoints.push(...ring);rotorSurfaces.push({depth:kit.depthOf([197.5,80+45*Math.cos(a+.1),115+45*Math.sin(a+.1)],proj),svg:`<path d="${kit.pathOf(ring.map(point),true)}" fill="${i%2?'#738f85':'#bed0bf'}" stroke="#3a514b" stroke-width=".6"/>`});
  }
  const cap=x=>{const ring=Array.from({length:33},(_,i)=>[x,80+45*Math.cos(i*Math.PI/16),115+45*Math.sin(i*Math.PI/16)]);rotorPoints.push(...ring);return `<path d="${kit.pathOf(ring.map(point),true)}" fill="#93afa1" stroke="#3a514b" stroke-width="1"/>`;};
  const rotor=cap(60)+rotorSurfaces.sort((a,b)=>a.depth-b.depth).map(s=>s.svg).join('')+cap(335);
  const rotorScreen=rotorPoints.map(point);
  inventory.push({id:'fan-rotor',component:'fan',x:60,y:35,z:70,w:275,d:90,h:90,offset:[0,0,0],screenBounds:[Math.min(...rotorScreen.map(p=>p[0])),Math.min(...rotorScreen.map(p=>p[1])),Math.max(...rotorScreen.map(p=>p[0])),Math.max(...rotorScreen.map(p=>p[1]))]});
  effects+=`<g data-component="fan" data-part="study-rotor" opacity="${selected&&selected!=='fan'?.36:1}">${rotor}</g>`;
  for(let i=0;i<3;i++)effects+=`<g opacity="${reveal}">${line([[100+i*85,430,-65],[100+i*85,330,50],[100+i*85,205,110]],'#447f86',3,`stroke-dasharray="9 7" stroke-dashoffset="${-m.t*20}"`)}${line([[100+i*85,245,460],[100+i*85,180,380],[100+i*85,95,285]],'#b0874d',2,`stroke-dasharray="6 8" stroke-dashoffset="${-m.t*16}"`)}</g>`;
 }
 nodes.push({key:`detail-${index}-effects`,svg:effects});
 // Fit the visible assembly, or the selected component, without changing world dimensions.
 const fitting=inventory.filter(p=>!selected||p.component===selected),bb=fitting.map(p=>p.screenBounds);
 const xmin=Math.min(...bb.map(b=>b[0])),ymin=Math.min(...bb.map(b=>b[1])),xmax=Math.max(...bb.map(b=>b[2])),ymax=Math.max(...bb.map(b=>b[3]));
 const zoom=Math.min(selected?2.4:1.25,690/(xmax-xmin),570/(ymax-ymin));
 const tx=500-(xmin+xmax)/2*zoom,ty=365-(ymin+ymax)/2*zoom;
 for(const node of nodes)node.svg=`<g class="detail-drawing"><g transform="translate(${tx} ${ty}) scale(${zoom})">${node.svg}</g></g>`;
 for(const part of inventory)part.screenBounds=part.screenBounds.map((n,i)=>n*zoom+(i%2?ty:tx));
 const labelOpacity=smooth((u-.64)/.3),labels=lessons[index].parts;
 let labelSvg='';
 labels.forEach(([component,name,,measure],i)=>{
  if(selected&&selected!==component)return;
  const matching=inventory.filter(p=>p.component===component&&!/fixing|mesh|web|fin-/.test(p.id));if(!matching.length)return;
  const p=matching[Math.floor(matching.length/2)],target=point([p.x+p.offset[0]+p.w/2,p.y+p.offset[1]+p.d/2,p.z+p.offset[2]+p.h]);
  target[0]=target[0]*zoom+tx;target[1]=target[1]*zoom+ty;
  const left=i%2===0,lx=left?14:826,ly=110+Math.floor(i/2)*185,w=160,anchor=left?lx+w:lx;
  labelSvg+=`<g class="detail-label" opacity="${labelOpacity}" data-component="${component}"><path d="M${anchor} ${ly+14} L${target[0]} ${target[1]}" fill="none" stroke="#727b6d" stroke-dasharray="3 4"/><circle cx="${target[0]}" cy="${target[1]}" r="3" fill="#344b41"/><rect x="${lx}" y="${ly}" width="${w}" height="45" rx="5" fill="#fcf7ec" stroke="#5b6559"/><text x="${lx+8}" y="${ly+17}" class="part-label">${i+1}. ${detailEsc(name)}</text><text x="${lx+8}" y="${ly+34}" class="part-measure">${detailEsc(measure)}</text></g>`;
 });
 nodes.push({key:`detail-${index}-labels`,svg:labelSvg});
 return {nodes,inventory,depthCycles:ordered.cycles};
}
function lightingView(m,finish,selected){
 const room=renderScene(m,finish);
 // Every lit item remains in its actual room position. The cable trace is illustrative.
 const comp=id=>/downlight/.test(id)?'downlights':/lamp-/.test(id)?'lamps':/wardrobe-light/.test(id)?'strip':/switch|service-cable/.test(id)?'circuit':null;
 room.nodes=room.nodes.map(n=>{const id=n.svg.match(/data-part="([^"]+)"/)?.[1],c=comp(id||'');return {...n,svg:`<g ${c?`data-component="${c}"`:''} opacity="${c?(selected&&selected!==c?.45:1):.4}" class="${c?'lit-part':''}">${n.svg}</g>`};});
 const proj=room.projection,pts=[[3570,1920,1230],[3570,1920,3030],[3570,500,3030],[2500,500,3030],[1100,500,3030]];
 const branchPaths=[[[2500,500,3030],[2980,500,3030],[2980,m.bedY+1900,3030],[2980,m.bedY+1900,970]],[[1100,500,3030],[640,500,3030],[640,m.bedY+1900,3030],[640,m.bedY+1900,970]],[[1100,500,3030],[1100,590,3030],[1100,590,2332],[2850,590,2332]]];
 let beams='';
 for(const x of[1100,2500]){
  const q=kit.iso([x,500,2960],proj),a=kit.iso([x-480,1050,10],proj),b=kit.iso([x+480,1050,10],proj);
  beams+=`<path d="M${q} L${a} L${b} Z" fill="#dfad48" opacity="${m.lights*.12}"/><circle cx="${q[0]}" cy="${q[1]}" r="12" fill="#edc872" opacity="${m.lights*.45}"/>`;
 }
 room.nodes.push({key:'lighting-effects',svg:beams+branchPaths.map(ps=>`<path d="${kit.pathOf(ps.map(p=>kit.iso(p,proj)))}" fill="none" stroke="#b98a46" stroke-width="1.5" stroke-dasharray="4 7" stroke-dashoffset="${-m.t*15}" opacity="${m.lights*.7}"/>`).join('')});
 room.nodes.push({key:'lighting-route',svg:`<path d="${kit.pathOf(pts.map(p=>kit.iso(p,proj)))}" fill="none" stroke="#c0802b" stroke-width="3" stroke-dasharray="9 5" stroke-dashoffset="${-m.t*20}" opacity="${m.lights}"/><text x="45" y="735" class="measure-label">7 + 7 + 4 + 4 + 8 = 30 W · illustrative circuit</text>`});
 return room;
}
export function renderStudy(m,finish='sage',selected=null){
 const state=studyState(m),i=state.index,u=state.u;
 const view=(index,progress,model,selection)=>[1,2,4,5].includes(index)?detailView(index,progress,model,finish,selection):index===3?lightingView(model,finish,selection):renderScene(model,finish);
 const current=view(i,u,m,selected);
 if(i===0||i===6)current.nodes=current.nodes.map(n=>{
  const id=n.svg.match(/data-part="([^"]+)"/)?.[1]||'';
  const c=/ceiling|downlight|service/.test(id)?'ceiling':/wall|shell|cutaway|skirting/.test(id)?'enclosure':'furniture';
  return {...n,svg:`<g data-component="${c}" opacity="${selected&&selected!==c?.3:1}" class="${selected===c?'study-part selected':''}">${n.svg}</g>`};
 });
 let nodes=current.nodes.map(n=>({...n,key:'current-'+n.key,opacity:state.transition}));
 if(state.transition<1&&i>0){
  const previous=view(i-1,1,{...m,explore:false},null);
  nodes=[...previous.nodes.map(n=>({...n,key:'previous-'+n.key,opacity:1-state.transition})),...nodes];
 }else if(i===0)nodes=nodes.map(n=>({...n,opacity:1}));
 const detail=[1,2,4,5].includes(i);
 const previousDetail=[1,2,4,5].includes(i-1);
 const locatorOpacity=detail?(previousDetail?1:state.transition):previousDetail?1-state.transition:0;
 if(locatorOpacity>0){
  if(!locatorCache.has(finish))locatorCache.set(finish,renderScene(evaluate({time:4.5}),finish).nodes.map(n=>n.svg).join(''));
  nodes.push({key:'room-locator',svg:`<g class="room-locator" opacity="${locatorOpacity}"><rect x="815" y="625" width="170" height="158" rx="8" fill="#efe9da" stroke="#c2b8a3"/><g transform="translate(820 625) scale(.16)">${locatorCache.get(finish)}</g><text x="830" y="770" class="part-measure">${detailEsc(lessons[detail?i:i-1].name)}</text></g>`});
 }
 const title=`Room Anatomy: ${lessons[i].name}`;
 const svg=`<svg id="room-svg" viewBox="0 0 1000 800" role="img" aria-labelledby="scene-title scene-desc"><title id="scene-title">${title}</title><desc id="scene-desc">${detail?'Magnified assembly, exploded display offsets. Physical dimensions are demonstration assumptions.':'Furnished demonstration bedroom, architectural cutaway.'} Select a component using the adjacent part buttons.</desc><g id="room-art">${nodes.map(n=>`<g data-render-key="${n.key}" opacity="${n.opacity??1}">${n.svg}</g>`).join('')}</g></svg>`;
 return {svg,nodes,inventory:current.inventory,depthCycles:current.depthCycles,state,detail,title};
}

