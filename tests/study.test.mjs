import test from 'node:test';
import assert from 'node:assert/strict';
import {spec,stages} from '../src/spec.mjs';
import {evaluate} from '../src/model.mjs';
import {lessons,studyParts,studyState} from '../src/study-model.mjs';
import {renderStudy} from '../src/study-scene.mjs';
test('full ceiling coverage uses approved room footprint and separate display offsets',()=>{
 const parts=studyParts(4,1,evaluate({time:25.3})),panels=parts.filter(p=>p.id.startsWith('panel-'));
 assert.equal(panels.length,6);assert.equal(panels.reduce((n,p)=>n+p.w*p.d,0),spec.width*spec.length);
 for(const p of panels){assert.equal(p.z,3000);assert.equal(p.h,12.5);assert.ok(p.offset[2]<0);assert.ok(p.x+p.w<=spec.width&&p.y+p.d<=spec.length);}
 const slab=parts.find(p=>p.id==='structure');assert.equal(slab.z-3000,spec.ceilingVoid);
});
test('magnified drawer and telescopic rails agree with original numerical model',()=>{
 for(const gap of[200,1500,1800])for(const e of[0,225,450]){
  const m=evaluate({explore:true,extension:e,bedGap:gap}),parts=studyParts(2,1,m);
  const front=parts.find(p=>p.id==='drawer-front'),bed=parts.find(p=>p.id==='bed-clearance-edge');
  assert.equal(bed.y-(front.y+front.d),m.clearance);
  assert.equal(parts.find(p=>p.id==='runner-middle-1395').y,45+e/2);
  assert.equal(parts.find(p=>p.id==='runner-inner-1395').y,45+e);
 }
});
test('every detailed part has an educational component and finite physical/display geometry',()=>{
 for(const index of[1,2,4,5])for(const u of[0,.25,.5,.75,1]){
  const parts=studyParts(index,u,evaluate({time:stages[index].start+u*(stages[index].end-stages[index].start)}));
  for(const p of parts){assert.ok(lessons[index].parts.some(l=>l[0]===p.component),p.id);assert.ok([p.x,p.y,p.z,p.w,p.d,p.h,...p.offset].every(Number.isFinite));assert.ok(p.w>0&&p.d>0&&p.h>0);}
 }
});
test('study contract keeps seven synchronized chapters and finite boundary transitions',()=>{
 for(let i=0;i<7;i++){assert.equal(studyState(evaluate({time:stages[i].end})).index,i);assert.equal(studyState(evaluate({time:stages[i].end})).u,1);}
 for(const s of stages.slice(1)){assert.equal(studyState(evaluate({time:s.start})).transition,0);assert.equal(studyState(evaluate({time:s.start+.65})).transition,1);}
});
test('study geometry has deterministic ordering and fully visible active assembly',()=>{
 for(let i=0;i<7;i++)for(const u of[0,.25,.5,.75,1]){
  const t=stages[i].start+u*(stages[i].end-stages[i].start),m=evaluate({time:t}),r=renderStudy(m);
  assert.equal(r.depthCycles,0,`${i}/${u}`);assert.ok(!/NaN|Infinity/.test(r.svg));
  renderStudy(evaluate({time:12}));assert.equal(renderStudy(m).svg,r.svg);
  if(r.detail){for(const p of r.inventory){const [x,y,x2,y2]=p.screenBounds;assert.ok(x>=0&&y>=0&&x2<=1000&&y2<=800,`${i}/${p.id}`);}}
 }
});
test('exploded assemblies move significantly in screen space without changing their extents',()=>{
 for(const i of[1,2,4,5]){
  const a=studyParts(i,0,evaluate({time:stages[i].start})),b=studyParts(i,1,evaluate({time:stages[i].end}));
  assert.ok(b.some((p,j)=>Math.hypot(...p.offset.map((n,k)=>n-a[j].offset[k]))>100));
  for(let j=0;j<a.length;j++)assert.deepEqual([a[j].w,a[j].d,a[j].h],[b[j].w,b[j].d,b[j].h]);
 }
});
test('separating floor layers never cross; shelf contents follow their support',()=>{
 for(let u=0;u<=1;u+=.005){
  const layers=studyParts(1,u,evaluate()).filter(p=>p.id.startsWith('layer-'));
  layers.sort((a,b)=>a.z-b.z);
  for(let j=1;j<layers.length;j++)assert.ok(layers[j-1].z+layers[j-1].offset[2]+layers[j-1].h<=layers[j].z+layers[j].offset[2]+1e-8);
  const cabinet=studyParts(2,u,evaluate()),shelf=cabinet.find(p=>p.id==='wardrobe-shelf-1690');
  assert.deepEqual(cabinet.find(p=>p.id==='wardrobe-folded-linen-1').offset,shelf.offset);
 }
});
